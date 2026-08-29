import {
  CandidatePairSelectorError,
  selectCandidatePair,
} from "../flow/candidatePairSelector.js";
import { compareDualRespondents } from "../flow/dualRespondentComparison.js";
import { assembleProductionDualAdjudicationInput } from "../flow/productionAdjudicationInputAssembler.js";
import { AgentInterpretationRequestAssemblyError } from "./agentInterpretationRequest.js";
import { runAgentInterpretation } from "./agentInterpretationRun.js";
import { FAILURE_CLASS_INPUT_ASSEMBLY_FAILURE } from "./agentContractConstants.js";

const ACCEPTED_SCOPE_MODULE = "acquirerEnvironment";
const ASSEMBLER_SCORING_MODULE = "acquirer_environment";
const PHYSICAL_IDENTITY_EXCLUSIONS = new Set(["primary", "verification", "R1", "R2"]);
const PRE_CORE_SELECTOR_STATUSES = new Set([
  "ADMISSIBILITY_UNRESOLVED",
  "NO_LAWFUL_PAIR",
  "PAIR_SELECTION_AMBIGUOUS",
]);
const NON_AGENT_SELECTOR_STATUSES = new Set(["INPUT_INVALID", "CONFIG_INVALID"]);

function isPlainObject(value) {
  if (value == null || typeof value !== "object" || Array.isArray(value)) return false;
  const prototype = Object.getPrototypeOf(value);
  return prototype === Object.prototype || prototype === null;
}

function physicalSessionIdentity(value) {
  const identity = typeof value === "string" ? value.trim() : "";
  if (!identity || PHYSICAL_IDENTITY_EXCLUSIONS.has(identity)) return null;
  return identity;
}

function validatePublicArguments({
  session,
  moduleId,
  projectId,
  establishedEnvironmentCodes,
  crossSideEnvironmentPair,
}) {
  if (!isPlainObject(session)) throw new TypeError("session must be a plain object");
  const diagnosticId = physicalSessionIdentity(session.sessionId);
  if (!diagnosticId) throw new TypeError("session.sessionId must be a physical session identity");
  if (moduleId !== ACCEPTED_SCOPE_MODULE) {
    throw new TypeError(`moduleId must be ${ACCEPTED_SCOPE_MODULE}`);
  }
  if (projectId !== null && typeof projectId !== "string") {
    throw new TypeError("projectId must be a string or null");
  }
  if (!Array.isArray(establishedEnvironmentCodes)) {
    throw new TypeError("establishedEnvironmentCodes must be an array");
  }
  if (crossSideEnvironmentPair !== null && !isPlainObject(crossSideEnvironmentPair)) {
    throw new TypeError("crossSideEnvironmentPair must be a plain object or null");
  }
  return diagnosticId;
}

function nonAgentSelectorResult(selectorStatus, decisionCode) {
  return Object.freeze({
    ok: false,
    selectorStatus,
    decisionCode,
  });
}

function nonAgentAssemblerResult(assembled) {
  const result = {
    ok: false,
    selectorStatus: "SELECTED",
    reason: assembled.reason,
  };
  const stage = assembled.audit?.stage;
  if (typeof stage === "string" && stage) result.stage = stage;
  return Object.freeze(result);
}

// Early composition containment (OD-PC-2 CORR1): once the selector outcome is
// physically PRE_CORE_SELECTOR, cross-side inputs are forbidden and fail
// closed before runAgentInterpretation — never silently normalized away.
function assertPreCoreInvocationContainment(establishedEnvironmentCodes, crossSideEnvironmentPair) {
  const lawfulPair = crossSideEnvironmentPair === null;
  const lawfulCodes = Array.isArray(establishedEnvironmentCodes) && establishedEnvironmentCodes.length === 0;
  if (lawfulPair && lawfulCodes) return;
  throw new AgentInterpretationRequestAssemblyError({
    failureClass: FAILURE_CLASS_INPUT_ASSEMBLY_FAILURE,
    detail: "PRE_CORE_SELECTOR invocation carries forbidden cross-side context inputs",
  });
}

function assertSelectorBinding(selectorResult, diagnosticId) {
  if (!isPlainObject(selectorResult)) throw new TypeError("selector result must be a plain object");
  const provenance = selectorResult.provenance;
  if (!isPlainObject(provenance)) throw new TypeError("selector provenance must be a plain object");
  if (provenance.sourceModule !== ACCEPTED_SCOPE_MODULE) {
    throw new TypeError("selector source module does not match the accepted scope module");
  }
  if (provenance.sessionId !== diagnosticId) {
    throw new TypeError("selector session identity does not match session.sessionId");
  }
}

function projectSelectorProvenance(selectorResult) {
  const provenance = selectorResult.provenance;
  const projected = {
    selectorId: provenance.selectorId,
    selectorVersion: provenance.selectorVersion,
    observationScopePolicy: provenance.observationScopePolicy,
    sourceModule: provenance.sourceModule,
    sourceInstrument: provenance.sourceInstrument,
    sessionId: provenance.sessionId,
    respondentSlot: provenance.respondentSlot,
    respondentVantage: provenance.respondentVantage,
    semanticBindings: provenance.semanticBindings,
    status: selectorResult.status,
    decisionCode: selectorResult.decisionCode,
    candidatePair: selectorResult.candidatePair,
    candidatePairNormalized: selectorResult.candidatePairNormalized,
  };
  if (selectorResult.status === "ADMISSIBILITY_UNRESOLVED") {
    projected.routing = selectorResult.routing;
    projected.unresolvedReason = selectorResult.unresolvedReason ?? null;
  }
  return Object.freeze(projected);
}

export async function runProductionInterpretation({
  session,
  moduleId,
  projectId = null,
  establishedEnvironmentCodes = [],
  crossSideEnvironmentPair = null,
} = {}) {
  const diagnosticId = validatePublicArguments({
    session,
    moduleId,
    projectId,
    establishedEnvironmentCodes,
    crossSideEnvironmentPair,
  });

  let selectorResult;
  try {
    selectorResult = selectCandidatePair({ session });
  } catch (error) {
    if (error instanceof CandidatePairSelectorError) {
      return nonAgentSelectorResult(error.status, error.decisionCode);
    }
    throw error;
  }

  assertSelectorBinding(selectorResult, diagnosticId);
  if (NON_AGENT_SELECTOR_STATUSES.has(selectorResult.status)) {
    return nonAgentSelectorResult(selectorResult.status, selectorResult.decisionCode);
  }

  const selectorProvenance = projectSelectorProvenance(selectorResult);
  let agentInvocation;

  if (selectorResult.status === "SELECTED") {
    const assembled = assembleProductionDualAdjudicationInput({
      session,
      moduleId: ASSEMBLER_SCORING_MODULE,
      candidatePair: selectorResult.candidatePair,
    });
    if (assembled.ok !== true) return nonAgentAssemblerResult(assembled);

    const coreInput = Object.freeze({
      ...assembled.coreInput,
      outOfPairEvidence: false,
      coherenceAmbiguous: false,
    });
    const coreOutput = compareDualRespondents(coreInput);
    agentInvocation = {
      outcomeSource: "DUAL_CORE",
      selectorProvenance,
      coreInput,
      coreOutput,
      identityContext: {
        diagnosticId,
        projectId,
        moduleId: ACCEPTED_SCOPE_MODULE,
        candidatePair: selectorResult.candidatePair,
        candidatePairNormalized: selectorResult.candidatePairNormalized,
      },
      establishedEnvironmentCodes,
      crossSideEnvironmentPair,
    };
  } else if (PRE_CORE_SELECTOR_STATUSES.has(selectorResult.status)) {
    assertPreCoreInvocationContainment(establishedEnvironmentCodes, crossSideEnvironmentPair);
    agentInvocation = {
      outcomeSource: "PRE_CORE_SELECTOR",
      selectorProvenance,
      identityContext: {
        diagnosticId,
        projectId,
        moduleId: ACCEPTED_SCOPE_MODULE,
      },
      establishedEnvironmentCodes,
      crossSideEnvironmentPair,
    };
  } else {
    throw new TypeError(`unsupported selector status: ${String(selectorResult.status)}`);
  }

  return runAgentInterpretation(agentInvocation);
}
