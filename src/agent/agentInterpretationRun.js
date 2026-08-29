import { assembleEngineSnapshot } from "./engineSnapshot.js";
import { assemblePreCoreSelectorSnapshot } from "./preCoreSelectorSnapshot.js";
import { assembleSingleR1Snapshot } from "./singleR1Snapshot.js";
import { buildStructuredUncertainty } from "./structuredUncertainty.js";
import { buildInterpretationContextPack } from "./interpretationContextPack.js";
import { buildAgentInterpretationRequest } from "./agentInterpretationRequest.js";
import { projectProviderProjection } from "./providerProjection.js";
import { buildProviderPrompt } from "./providerPrompt.js";
import { executeGeminiProvider } from "./providerExecution.js";
import { ProviderExecutionError } from "./providerExecutionError.js";
import {
  assembleAgentInterpretationResult,
  mapProviderExecutionErrorToSystemFailure,
  mapResultAssemblyErrorToSystemFailure,
  ResultAssemblyError,
} from "./agentInterpretationResult.js";
import { validateAgentInterpretationSemantics } from "./semanticValidator.js";
import { SemanticValidationError } from "./semanticValidationError.js";
import { SemanticJudgeTransportError } from "./semanticJudgeTransportError.js";
import {
  mapSemanticJudgeTransportErrorToSystemFailure,
  mapSemanticValidationErrorToSystemFailure,
} from "./semanticSystemFailure.js";
import { XAI_SEMANTIC_JUDGE_MAX_CHECKS_PER_BATCH } from "./semanticJudgeTransportConstants.js";
import { createXaiSemanticJudge } from "./semanticJudgeAdapter.js";

function mapKnownFailure(error, agentInterpretationRequest) {
  if (error instanceof ProviderExecutionError) {
    return mapProviderExecutionErrorToSystemFailure({
      agentInterpretationRequest,
      providerExecutionError: error,
    });
  }
  if (error instanceof ResultAssemblyError) {
    return mapResultAssemblyErrorToSystemFailure({
      agentInterpretationRequest,
      resultAssemblyError: error,
    });
  }
  if (error instanceof SemanticJudgeTransportError) {
    return mapSemanticJudgeTransportErrorToSystemFailure({
      agentInterpretationRequest,
      semanticJudgeTransportError: error,
    });
  }
  if (error instanceof SemanticValidationError) {
    return mapSemanticValidationErrorToSystemFailure({
      agentInterpretationRequest,
      semanticValidationError: error,
    });
  }
  return null;
}

export async function runAgentInterpretation({
  outcomeSource,
  selectorProvenance,
  coreOutput,
  identityContext,
  coreInput,
  singleR1Session,
  establishedEnvironmentCodes,
  crossSideEnvironmentPair,
} = {}) {
  let agentInterpretationRequest = null;
  try {
    let engineSnapshot;
    if (outcomeSource === "DUAL_CORE") {
      engineSnapshot = assembleEngineSnapshot({
        coreOutput,
        identityContext,
        coreInput,
        selectorProvenance,
      });
    } else if (outcomeSource === "PRE_CORE_SELECTOR") {
      if (coreInput !== undefined || coreOutput !== undefined) {
        throw new TypeError("PRE_CORE_SELECTOR requires coreInput and coreOutput to be absent");
      }
      engineSnapshot = assemblePreCoreSelectorSnapshot({ identityContext, selectorProvenance });
    } else if (outcomeSource === "SINGLE_R1_ONLY") {
      if (coreInput !== undefined || coreOutput !== undefined) {
        throw new TypeError("SINGLE_R1_ONLY requires coreInput and coreOutput to be absent");
      }
      engineSnapshot = assembleSingleR1Snapshot({
        session: singleR1Session,
        identityContext,
        selectorProvenance,
      });
    } else {
      throw new TypeError(`Unsupported outcomeSource: ${String(outcomeSource)}`);
    }
    const structuredUncertainty = buildStructuredUncertainty(engineSnapshot);
    const interpretationContextPack = buildInterpretationContextPack({
      engineSnapshot,
      structuredUncertainty,
      establishedEnvironmentCodes,
      crossSideEnvironmentPair,
    });
    agentInterpretationRequest = buildAgentInterpretationRequest({
      engineSnapshot,
      structuredUncertainty,
      interpretationContextPack,
    });
    const providerProjection = projectProviderProjection(agentInterpretationRequest);
    const prompt = buildProviderPrompt(providerProjection);
    const providerExecutionOutput = await executeGeminiProvider(
      { providerProjection, prompt },
    );
    const assembledResult = assembleAgentInterpretationResult({
      agentInterpretationRequest,
      providerExecutionOutput,
    });
    const validatedResult = await validateAgentInterpretationSemantics({
      agentInterpretationRequest,
      agentInterpretationResult: assembledResult,
      semanticJudge: createXaiSemanticJudge(),
      maxChecksPerBatch: XAI_SEMANTIC_JUDGE_MAX_CHECKS_PER_BATCH,
    });
    if (validatedResult !== assembledResult) {
      throw new TypeError(
        "Semantic validation violated AgentInterpretationResult identity",
      );
    }
    return assembledResult;
  } catch (error) {
    const mapped = agentInterpretationRequest !== null
      ? mapKnownFailure(error, agentInterpretationRequest)
      : null;
    if (mapped !== null) return mapped;
    throw error;
  }
}
