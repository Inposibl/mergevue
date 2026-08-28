import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { readdirSync, readFileSync } from "node:fs";
import { register } from "node:module";
import { join, relative } from "node:path";
import { fileURLToPath } from "node:url";
import ts from "typescript";

import { TARGET_OBSERVATION_DIAGNOSTIC } from "../src/data/targetObservedEnvironmentDiagnostic.js";
import { evidenceClassifiedAnswer } from "../src/flow/evidenceClassification.js";
import {
  RESPONDENT_CONTEXT_SECTIONS,
  TARGET_OBSERVATION_SETUP_FIELDS,
  buildTargetObservationSetupRecord,
  canStartTargetObservation,
  createTargetObservationOutputContext,
  hashObservationSetupCode,
  scoreTargetObservation,
  validateTargetObservationSetup,
} from "../src/flow/targetObservationFlow.js";
import {
  TARGET_OBSERVATION_SETUP_METADATA_DESCRIPTORS,
  TARGET_OBSERVATION_SETUP_RAW_VALUE_MAX_LENGTH,
  hasOversizedTargetObservationSetupRawValue,
} from "../src/flow/targetObservationSetupProvenance.js";
import {
  getSession,
  mergeTargetObservationSetupRecords,
  persistRejectedTargetObservationSetup,
  saveTargetObservationSetup,
  targetObservationState,
} from "../src/server/_sessionLedger.ts";

register(`data:text/javascript,${encodeURIComponent(`
export async function resolve(specifier, context, nextResolve) {
  if (typeof specifier === "string" && specifier.includes("/src/server/") && specifier.endsWith(".js")) {
    return nextResolve(specifier.replace(/\\.js$/, ".ts"), context);
  }
  return nextResolve(specifier, context);
}
`)}`);

const [saveSetupHandler, targetStateHandler, submitObservationHandler] = await Promise.all([
  import("../api/save-target-observation-setup.ts").then((module) => module.default),
  import("../api/target-observation-state.ts").then((module) => module.default),
  import("../api/submit-target-observation.ts").then((module) => module.default),
]);

const ROOT = fileURLToPath(new URL("..", import.meta.url));
const CONTRACT_KEYS = Object.freeze([
  "canonicalValue",
  "canonicalVocabulary",
  "fieldId",
  "mappingProvenance",
  "rawValue",
  "resolutionStatus",
]);
const FIELD_IDS = Object.freeze([
  "observationPosition",
  "targetExposureDuration",
  "targetAccessLevel",
  "observedActorLevel",
  "observationEvidenceBasis",
  "integrationTimeline",
]);
const CANONICAL_VOCABULARIES = Object.freeze([
  "target_observation_setup.observationPosition@v1",
  "target_observation_setup.targetExposureDuration@v1",
  "target_observation_setup.targetAccessLevel@v1",
  "target_observation_setup.observedActorLevel@v1",
  "target_observation_setup.observationEvidenceBasis@v1",
  "target_observation_setup.integrationTimeline@v1",
]);
const MAPPING_PROVENANCE = Object.freeze([
  "runtime_whitelist:targetObservationSetup/TARGET_OBSERVATION_SETUP_FIELDS/observationPosition@v1",
  "runtime_whitelist:targetObservationSetup/RESPONDENT_CONTEXT_SECTIONS/targetExposureDuration@v1",
  "runtime_whitelist:targetObservationSetup/RESPONDENT_CONTEXT_SECTIONS/targetAccessLevel@v1",
  "runtime_whitelist:targetObservationSetup/RESPONDENT_CONTEXT_SECTIONS/observedActorLevel@v1",
  "runtime_whitelist:targetObservationSetup/RESPONDENT_CONTEXT_SECTIONS/observationEvidenceBasis@v1",
  "runtime_whitelist:targetObservationSetup/TARGET_OBSERVATION_SETUP_FIELDS/integrationTimeline@v1",
]);
const C3C_SETUP_PROVENANCE_KEYS = Object.freeze(new Set([
  "setupMetadataProvenance",
  "rejectedSetupMetadataProvenance",
]));
const C3C_SCORING_METADATA_KEYS = Object.freeze(new Set([
  ...C3C_SETUP_PROVENANCE_KEYS,
  "canonicalVocabulary",
  "mappingProvenance",
  "resolutionStatus",
]));
const C3C_PROVENANCE_MODULE_FRAGMENT = "targetObservationSetupProvenance";
const APP_PUBLIC_CONSUMER_NAME = /score|questionnaire|report|forecast|deliverable|output.?context|agent|interpretation|render|public/i;
const RESOLVED_SETUP = Object.freeze({
  observationPosition: "Acquirer diligence lead",
  targetExposureDuration: "2_to_6_months",
  targetAccessLevel: "site_or_team_sessions",
  observedActorLevel: "senior_leadership",
  observationEvidenceBasis: "repeated_workshops",
  integrationTimeline: "Pre-signing diligence",
});
const EXPECTED_NORMALIZED = Object.freeze({
  observationPosition: "Acquirer diligence lead",
  respondentContextProfile: Object.freeze({
    targetExposureDuration: "2_to_6_months",
    targetAccessLevel: "site_or_team_sessions",
    observedActorLevel: "senior_leadership",
    observationEvidenceBasis: "repeated_workshops",
  }),
  respondentContext: "2 to 6 months | Site visits or team sessions | Senior leadership team | Repeated workshops",
  integrationTimeline: "Pre-signing diligence",
});
const UNRESOLVED_SETUP = Object.freeze({
  ...RESOLVED_SETUP,
  observationPosition: "Regional Operations Director",
});
const BASELINE_SCORE_VIEW = Object.freeze({
  valid: true,
  missingQuestionIds: Object.freeze([]),
  answeredQuestionCount: 23,
  diagnosticAnswerCount: 19,
  evidenceConfidence: 12,
  questionCount: 23,
  effectiveAnswerCount: 19,
  excludedAnswerCount: 4,
  totalEvidenceWeight: 19,
  environmentScores: Object.freeze({
    "NT/STJ": 7,
    "NT/STP": 4,
    "NF/NT": 5,
    "NF/SFJ": 1,
    "NF/SFP": 0,
    "SFJ/SFP": 1,
    "STJ/STP": 1,
    "STP/STJ": 0,
    "SFP/SFJ": 0,
  }),
  weightedEnvironmentScores: Object.freeze({
    "NT/STJ": 7,
    "NT/STP": 4,
    "NF/NT": 5,
    "NF/SFJ": 1,
    "NF/SFP": 0,
    "SFJ/SFP": 1,
    "STJ/STP": 1,
    "STP/STJ": 0,
    "SFP/SFJ": 0,
  }),
  rankedEnvironments: Object.freeze([
    Object.freeze({ code: "NT/STJ", score: 7 }),
    Object.freeze({ code: "NF/NT", score: 5 }),
    Object.freeze({ code: "NT/STP", score: 4 }),
    Object.freeze({ code: "NF/SFJ", score: 1 }),
    Object.freeze({ code: "SFJ/SFP", score: 1 }),
    Object.freeze({ code: "STJ/STP", score: 1 }),
    Object.freeze({ code: "NF/SFP", score: 0 }),
    Object.freeze({ code: "SFP/SFJ", score: 0 }),
    Object.freeze({ code: "STP/STJ", score: 0 }),
  ]),
  primaryEnvironmentCode: "NT/STJ",
  primarySignalScore: 7,
  secondaryEnvironmentCode: "NF/NT",
  secondarySignalScore: 5,
  coPresence: true,
  signalStrength: "weak",
  confidence: "high",
  evidenceQuality: Object.freeze({
    confidence: "high",
    directObservationCount: 23,
    documentSupportedCount: 0,
    reliabilityFlagCount: 0,
    legacyOptionOnlyCount: 0,
  }),
  topEnvironmentCode: "NT/STJ",
});

const checks = [];

function check(label, fn) {
  checks.push({ label, fn });
}

function read(path) {
  return readFileSync(join(ROOT, path), "utf8");
}

function sha256(value) {
  return createHash("sha256").update(value).digest("hex");
}

function filesUnder(root) {
  const files = [];
  const visit = (directory) => {
    for (const entry of readdirSync(directory, { withFileTypes: true })) {
      const path = join(directory, entry.name);
      if (entry.isDirectory()) visit(path);
      else if (entry.isFile()) files.push(path);
    }
  };
  visit(join(ROOT, root));
  return files.sort();
}

function treeDigest(root) {
  const hash = createHash("sha256");
  for (const file of filesUnder(root)) {
    hash.update(relative(join(ROOT, root), file));
    hash.update("\0");
    hash.update(readFileSync(file));
    hash.update("\0");
  }
  return hash.digest("hex");
}

function parseSource(path, source, scriptKind) {
  const sourceFile = ts.createSourceFile(path, source, ts.ScriptTarget.Latest, true, scriptKind);
  assert.deepEqual(
    sourceFile.parseDiagnostics,
    [],
    `${path} must remain parseable for C3-C structural isolation checks`,
  );
  return sourceFile;
}

function sourceTokenText(node) {
  if (ts.isIdentifier(node) || ts.isStringLiteralLike(node)) return node.text;
  return null;
}

function sourceLocation(sourceFile, node) {
  const { line, character } = sourceFile.getLineAndCharacterOfPosition(node.getStart(sourceFile));
  return `${sourceFile.fileName}:${line + 1}:${character + 1}`;
}

function collectBindingIdentifiers(name, identifiers) {
  if (ts.isIdentifier(name)) {
    identifiers.add(name.text);
    return;
  }
  for (const element of name.elements) {
    if (ts.isBindingElement(element)) collectBindingIdentifiers(element.name, identifiers);
  }
}

function nodeContainsReference(node, keys, taintedIdentifiers = new Set()) {
  let found = false;
  const visit = (current) => {
    if (found) return;
    const token = sourceTokenText(current);
    if ((token && keys.has(token)) || (ts.isIdentifier(current) && taintedIdentifiers.has(current.text))) {
      found = true;
      return;
    }
    ts.forEachChild(current, visit);
  };
  visit(node);
  return found;
}

function importConsumesC3CProvenance(node) {
  return ts.isImportDeclaration(node)
    && ts.isStringLiteral(node.moduleSpecifier)
    && node.moduleSpecifier.text.includes(C3C_PROVENANCE_MODULE_FRAGMENT);
}

function layeredScoringIsolationViolations(source) {
  const sourceFile = parseSource("src/flow/layeredEvidenceScoring.js", source, ts.ScriptKind.JS);
  const violations = [];
  const visit = (node) => {
    if (importConsumesC3CProvenance(node)) {
      violations.push(`${sourceLocation(sourceFile, node)} imports Target Observation setup provenance`);
      return;
    }
    const token = sourceTokenText(node);
    if (token && C3C_SCORING_METADATA_KEYS.has(token)) {
      violations.push(`${sourceLocation(sourceFile, node)} references ${token}`);
    }
    ts.forEachChild(node, visit);
  };
  visit(sourceFile);
  return [...new Set(violations)];
}

function callTargetName(expression) {
  if (ts.isIdentifier(expression)) return expression.text;
  if (ts.isPropertyAccessExpression(expression)) return expression.name.text;
  return "";
}

function appPublicConsumerViolations(source) {
  const sourceFile = parseSource("src/App.jsx", source, ts.ScriptKind.JSX);
  const taintedIdentifiers = new Set();

  let changed = true;
  while (changed) {
    changed = false;
    const visitTaint = (node) => {
      if (ts.isVariableDeclaration(node) && node.initializer) {
        const bindingReferencesProvenance = nodeContainsReference(node.name, C3C_SETUP_PROVENANCE_KEYS);
        const initializerReferencesProvenance = nodeContainsReference(
          node.initializer,
          C3C_SETUP_PROVENANCE_KEYS,
          taintedIdentifiers,
        );
        if (bindingReferencesProvenance || initializerReferencesProvenance) {
          const names = new Set();
          collectBindingIdentifiers(node.name, names);
          for (const name of names) {
            if (!taintedIdentifiers.has(name)) {
              taintedIdentifiers.add(name);
              changed = true;
            }
          }
        }
      }
      if (
        ts.isBinaryExpression(node)
        && node.operatorToken.kind === ts.SyntaxKind.EqualsToken
        && ts.isIdentifier(node.left)
        && nodeContainsReference(node.right, C3C_SETUP_PROVENANCE_KEYS, taintedIdentifiers)
        && !taintedIdentifiers.has(node.left.text)
      ) {
        taintedIdentifiers.add(node.left.text);
        changed = true;
      }
      ts.forEachChild(node, visitTaint);
    };
    visitTaint(sourceFile);
  }

  const violations = [];
  const recordViolation = (node, message) => {
    violations.push(`${sourceLocation(sourceFile, node)} ${message}`);
  };
  const referencesProvenance = (node) => nodeContainsReference(
    node,
    C3C_SETUP_PROVENANCE_KEYS,
    taintedIdentifiers,
  );
  const visitConsumers = (node) => {
    if (importConsumesC3CProvenance(node)) {
      recordViolation(node, "imports Target Observation setup provenance");
      return;
    }
    if (ts.isJsxExpression(node) && node.expression && referencesProvenance(node.expression)) {
      recordViolation(node, "renders or passes C3-C setup provenance through JSX");
    } else if (ts.isJsxAttribute(node)) {
      const attributeName = node.name.getText(sourceFile);
      if (C3C_SETUP_PROVENANCE_KEYS.has(attributeName) || (node.initializer && referencesProvenance(node.initializer))) {
        recordViolation(node, "passes C3-C setup provenance to a rendered component");
      }
    } else if (ts.isJsxSpreadAttribute(node) && referencesProvenance(node.expression)) {
      recordViolation(node, "spreads C3-C setup provenance into rendered content");
    } else if (ts.isJsxText(node)) {
      for (const key of C3C_SETUP_PROVENANCE_KEYS) {
        if (node.text.includes(key)) recordViolation(node, `renders the C3-C key ${key}`);
      }
    } else if (ts.isCallExpression(node) && APP_PUBLIC_CONSUMER_NAME.test(callTargetName(node.expression))) {
      if (node.arguments.some(referencesProvenance)) {
        recordViolation(node, `passes C3-C setup provenance to ${callTargetName(node.expression)}`);
      }
    }
    ts.forEachChild(node, visitConsumers);
  };
  visitConsumers(sourceFile);
  return [...new Set(violations)];
}

function provenanceByField(provenance, fieldId) {
  return provenance.find((record) => record.fieldId === fieldId);
}

async function invoke(handler, request) {
  let status;
  let body;
  await handler(request, {
    status(statusCode) {
      status = statusCode;
      return {
        json(responseBody) {
          body = responseBody;
          return responseBody;
        },
      };
    },
  });
  return { status, body };
}

function scoreView(score) {
  return {
    valid: score.valid,
    missingQuestionIds: [...score.missingQuestionIds],
    answeredQuestionCount: score.answeredQuestionCount,
    diagnosticAnswerCount: score.diagnosticAnswerCount,
    evidenceConfidence: score.evidenceConfidence,
    questionCount: score.questionCount,
    effectiveAnswerCount: score.effectiveAnswerCount,
    excludedAnswerCount: score.excludedAnswerCount,
    totalEvidenceWeight: score.totalEvidenceWeight,
    environmentScores: { ...score.environmentScores },
    weightedEnvironmentScores: { ...score.weightedEnvironmentScores },
    rankedEnvironments: score.rankedEnvironments.map(({ code, score: value }) => ({ code, score: value })),
    primaryEnvironmentCode: score.primaryEnvironmentCode,
    primarySignalScore: score.primarySignalScore,
    secondaryEnvironmentCode: score.secondaryEnvironmentCode,
    secondarySignalScore: score.secondarySignalScore,
    coPresence: score.coPresence,
    signalStrength: score.signalStrength,
    confidence: score.confidence,
    evidenceQuality: {
      confidence: score.evidenceQuality.confidence,
      directObservationCount: score.evidenceQuality.directObservationCount,
      documentSupportedCount: score.evidenceQuality.documentSupportedCount,
      reliabilityFlagCount: score.evidenceQuality.reliabilityFlagCount,
      legacyOptionOnlyCount: score.evidenceQuality.legacyOptionOnlyCount,
    },
    topEnvironmentCode: score.topEnvironmentCode,
  };
}

const resolvedValidation = validateTargetObservationSetup(RESOLVED_SETUP);
const resolvedRecord = buildTargetObservationSetupRecord(RESOLVED_SETUP, "2026-08-25T00:00:00.000Z");
const unresolvedRecord = buildTargetObservationSetupRecord(UNRESOLVED_SETUP, "2026-08-25T00:00:00.000Z");

check("descriptor table is frozen, exact, product-local, and deterministic", () => {
  assert.equal(Object.isFrozen(TARGET_OBSERVATION_SETUP_METADATA_DESCRIPTORS), true);
  assert.equal(TARGET_OBSERVATION_SETUP_METADATA_DESCRIPTORS.length, 6);
  assert.deepEqual(TARGET_OBSERVATION_SETUP_METADATA_DESCRIPTORS.map(({ fieldId }) => fieldId), FIELD_IDS);
  assert.deepEqual(
    TARGET_OBSERVATION_SETUP_METADATA_DESCRIPTORS.map(({ canonicalVocabulary }) => canonicalVocabulary),
    CANONICAL_VOCABULARIES,
  );
  assert.deepEqual(
    TARGET_OBSERVATION_SETUP_METADATA_DESCRIPTORS.map(({ mappingProvenance }) => mappingProvenance),
    MAPPING_PROVENANCE,
  );
  assert.equal(TARGET_OBSERVATION_SETUP_METADATA_DESCRIPTORS.every(Object.isFrozen), true);
});

check("resolved provenance preserves all raw values and exact six-key records", () => {
  const provenance = resolvedValidation.setupMetadataProvenance;
  assert.equal(provenance.length, 6);
  assert.deepEqual(provenance.map(({ fieldId }) => fieldId), FIELD_IDS);
  assert.deepEqual(provenance.map(({ rawValue }) => rawValue), FIELD_IDS.map((fieldId) => RESOLVED_SETUP[fieldId]));
  assert.deepEqual(provenance.map(({ canonicalValue }) => canonicalValue), FIELD_IDS.map((fieldId) => RESOLVED_SETUP[fieldId]));
  assert.deepEqual(provenance.map(({ canonicalVocabulary }) => canonicalVocabulary), CANONICAL_VOCABULARIES);
  assert.deepEqual(provenance.map(({ mappingProvenance }) => mappingProvenance), MAPPING_PROVENANCE);
  assert.equal(provenance.every(({ resolutionStatus }) => resolutionStatus === "RESOLVED"), true);
  assert.equal(provenance.every((record) => Object.isFrozen(record)), true);
  for (const record of provenance) assert.deepEqual(Object.keys(record).sort(), CONTRACT_KEYS);
});

check("leading and trailing spaces survive only in rawValue", () => {
  const spaced = Object.fromEntries(Object.entries(RESOLVED_SETUP).map(([fieldId, value]) => [fieldId, ` ${value} `]));
  const validation = validateTargetObservationSetup(spaced);
  assert.equal(validation.valid, true);
  assert.deepEqual(validation.normalized, EXPECTED_NORMALIZED);
  for (const fieldId of FIELD_IDS) {
    const record = provenanceByField(validation.setupMetadataProvenance, fieldId);
    assert.equal(record.rawValue, ` ${RESOLVED_SETUP[fieldId]} `);
    assert.equal(record.canonicalValue, RESOLVED_SETUP[fieldId]);
    assert.equal(record.resolutionStatus, "RESOLVED");
  }
});

check("pre-C3-C normalization and completed record data are unchanged", () => {
  assert.equal(resolvedValidation.valid, true);
  assert.deepEqual(resolvedValidation.missing, []);
  assert.deepEqual(resolvedValidation.normalized, EXPECTED_NORMALIZED);
  assert.equal(resolvedRecord.completed, true);
  assert.deepEqual(resolvedRecord.data, EXPECTED_NORMALIZED);
  assert.equal(resolvedRecord.storedAt, "2026-08-25T00:00:00.000Z");
  assert.equal(Object.hasOwn(resolvedRecord.data, "setupMetadataProvenance"), false);
});

check("structured respondentContextProfile fallback remains valid", () => {
  const nested = {
    observationPosition: RESOLVED_SETUP.observationPosition,
    respondentContextProfile: {
      targetExposureDuration: RESOLVED_SETUP.targetExposureDuration,
      targetAccessLevel: RESOLVED_SETUP.targetAccessLevel,
      observedActorLevel: RESOLVED_SETUP.observedActorLevel,
      observationEvidenceBasis: RESOLVED_SETUP.observationEvidenceBasis,
    },
    integrationTimeline: RESOLVED_SETUP.integrationTimeline,
  };
  const validation = validateTargetObservationSetup(nested);
  assert.equal(validation.valid, true);
  assert.deepEqual(validation.normalized, EXPECTED_NORMALIZED);
  assert.deepEqual(validation.setupMetadataProvenance.map(({ rawValue }) => rawValue), FIELD_IDS.map((fieldId) => RESOLVED_SETUP[fieldId]));
});

check("unmapped setup metadata remains unresolved and inadmissible", () => {
  const record = provenanceByField(unresolvedRecord.setupMetadataProvenance, "observationPosition");
  assert.equal(record.rawValue, "Regional Operations Director");
  assert.equal(record.canonicalValue, null);
  assert.equal(record.resolutionStatus, "UNRESOLVED");
  assert.equal(unresolvedRecord.setupMetadataProvenance.filter(({ resolutionStatus }) => resolutionStatus === "RESOLVED").length, 5);
  assert.equal(unresolvedRecord.completed, false);
  assert.equal(unresolvedRecord.data, null);
  assert.deepEqual(unresolvedRecord.missing, ["observationPosition"]);
  assert.equal(canStartTargetObservation({ targetObservationSetup: unresolvedRecord }), false);
});

check("missing, null, undefined, and non-string inputs produce null unresolved raw values", () => {
  const validation = validateTargetObservationSetup({
    ...RESOLVED_SETUP,
    observationPosition: null,
    targetExposureDuration: undefined,
    targetAccessLevel: 42,
    observedActorLevel: null,
  });
  for (const fieldId of ["observationPosition", "targetExposureDuration", "targetAccessLevel", "observedActorLevel"]) {
    const record = provenanceByField(validation.setupMetadataProvenance, fieldId);
    assert.equal(record.rawValue, null);
    assert.equal(record.canonicalValue, null);
    assert.equal(record.resolutionStatus, "UNRESOLVED");
  }
});

check("setup provenance does not create a canonical Respondent crosswalk", () => {
  for (const record of unresolvedRecord.setupMetadataProvenance) {
    assert.equal(Object.hasOwn(record, "roleCode"), false);
    assert.equal(Object.hasOwn(record, "seniorityLevel"), false);
    assert.equal(Object.hasOwn(record, "accessLevel"), false);
    assert.equal(Object.hasOwn(record, "UseClass"), false);
  }
  assert.equal(provenanceByField(unresolvedRecord.setupMetadataProvenance, "observationPosition").canonicalValue, null);
});

let invalidSaveResponse;
let invalidSaveState;
const invalidSaveSessionId = `c3c-invalid-save-${Date.now()}`;

check("invalid save endpoint returns the unchanged 400 response without provenance", async () => {
  invalidSaveResponse = await invoke(saveSetupHandler, {
    method: "POST",
    url: "/api/save-target-observation-setup",
    body: { sessionId: invalidSaveSessionId, setup: UNRESOLVED_SETUP },
  });
  assert.equal(invalidSaveResponse.status, 400);
  assert.deepEqual(invalidSaveResponse.body, {
    status: "setup-incomplete",
    missing: ["observationPosition"],
  });
  assert.equal(JSON.stringify(invalidSaveResponse.body).includes("Provenance"), false);
});

check("invalid save persists incomplete provenance in the real ledger", async () => {
  invalidSaveState = await targetObservationState(invalidSaveSessionId);
  const setup = invalidSaveState.targetObservationSetup;
  const record = provenanceByField(setup.setupMetadataProvenance, "observationPosition");
  assert.equal(setup.completed, false);
  assert.deepEqual(setup.missing, ["observationPosition"]);
  assert.equal(record.rawValue, "Regional Operations Director");
  assert.equal(record.canonicalValue, null);
  assert.equal(record.resolutionStatus, "UNRESOLVED");
  assert.equal(invalidSaveState.canStartTargetObservation, false);
  assert.equal(invalidSaveState.targetObservation, null);
  assert.equal(invalidSaveState.target2B, null);
});

check("targetObservationState API readback retains unresolved raw provenance", async () => {
  const response = await invoke(targetStateHandler, {
    method: "GET",
    url: `/api/target-observation-state?sessionId=${encodeURIComponent(invalidSaveSessionId)}`,
  });
  const record = provenanceByField(response.body.targetObservationSetup.setupMetadataProvenance, "observationPosition");
  assert.equal(response.status, 200);
  assert.equal(response.body.status, "target-observation-state");
  assert.equal(response.body.targetObservationSetup.completed, false);
  assert.equal(record.rawValue, "Regional Operations Director");
  assert.equal(response.body.canStartTargetObservation, false);
});

check("ledger and JSON serialization round-trips preserve nested provenance", () => {
  assert.deepEqual(getSession(invalidSaveSessionId).targetObservationSetup, invalidSaveState.targetObservationSetup);
  assert.deepEqual(
    JSON.parse(JSON.stringify(invalidSaveState.targetObservationSetup)),
    invalidSaveState.targetObservationSetup,
  );
  const ledgerSource = read("src/server/_sessionLedger.ts");
  assert.match(ledgerSource, /targetObservationSetup: record\.targetObservationSetup \?\? null/);
  assert.equal(ledgerSource.includes("targetObservationSetup: {\n"), false);
});

let wrongCodeResponse;

check("wrong-code final submit persists no rejected setup", async () => {
  const assessmentSessionId = `c3c-wrong-code-${Date.now()}`;
  wrongCodeResponse = await invoke(submitObservationHandler, {
    method: "POST",
    url: "/api/submit-target-observation",
    body: {
      assessmentSessionId,
      observationSessionId: "c3c-observer-wrong-code",
      codeHash: "not-the-expected-hash",
      digitalCode: "123456",
      setup: UNRESOLVED_SETUP,
      answers: {},
    },
  });
  const state = await targetObservationState(assessmentSessionId);
  assert.equal(wrongCodeResponse.status, 400);
  assert.deepEqual(wrongCodeResponse.body, {
    endpoint: "/api/submit-target-observation",
    ok: false,
    status: "wrong-code",
  });
  assert.equal(JSON.stringify(wrongCodeResponse.body).includes("Provenance"), false);
  assert.equal(state.targetObservationSetup, null);
  assert.equal(state.targetObservation, null);
  assert.equal(state.target2B, null);
});

let invalidFinalResponse;
let invalidFinalState;

check("valid code plus invalid setup persists audit only and produces no score", async () => {
  const assessmentSessionId = `c3c-invalid-final-${Date.now()}`;
  const observationSessionId = "c3c-observer-invalid-final";
  const digitalCode = "123456";
  invalidFinalResponse = await invoke(submitObservationHandler, {
    method: "POST",
    url: "/api/submit-target-observation",
    body: {
      assessmentSessionId,
      observationSessionId,
      digitalCode,
      codeHash: hashObservationSetupCode(digitalCode, observationSessionId, assessmentSessionId),
      setup: UNRESOLVED_SETUP,
      answers: {},
    },
  });
  invalidFinalState = await targetObservationState(assessmentSessionId);
  assert.equal(invalidFinalResponse.status, 400);
  assert.deepEqual(invalidFinalResponse.body, {
    endpoint: "/api/submit-target-observation",
    ok: false,
    status: "setup-incomplete",
    missing: ["observationPosition"],
  });
  assert.equal(JSON.stringify(invalidFinalResponse.body).includes("Provenance"), false);
  assert.equal(invalidFinalState.targetObservationSetup.completed, false);
  assert.equal(invalidFinalState.targetObservation, null);
  assert.equal(invalidFinalState.target2B, null);
  assert.equal(Object.hasOwn(invalidFinalState, "score"), false);
});

check("merge helper implements all three deterministic cases", () => {
  const incomingCompleted = buildTargetObservationSetupRecord(RESOLVED_SETUP, "2026-08-25T01:00:00.000Z");
  const incomingIncomplete = buildTargetObservationSetupRecord(UNRESOLVED_SETUP);
  assert.equal(mergeTargetObservationSetupRecords(unresolvedRecord, incomingCompleted), incomingCompleted);
  assert.equal(mergeTargetObservationSetupRecords(null, incomingIncomplete), incomingIncomplete);
  assert.equal(mergeTargetObservationSetupRecords(unresolvedRecord, incomingIncomplete), incomingIncomplete);
  const merged = mergeTargetObservationSetupRecords(incomingCompleted, incomingIncomplete);
  assert.equal(merged.completed, true);
  assert.deepEqual(merged.data, incomingCompleted.data);
  assert.deepEqual(merged.setupMetadataProvenance, incomingCompleted.setupMetadataProvenance);
  assert.deepEqual(merged.rejectedSetupMetadataProvenance, incomingIncomplete.setupMetadataProvenance);
});

let completedAfterRejectedAttempt;

check("completed ledger record cannot be downgraded and rejected provenance is replaced", async () => {
  const sessionId = `c3c-merge-${Date.now()}`;
  const completedSession = await saveTargetObservationSetup(sessionId, RESOLVED_SETUP);
  const completed = completedSession.targetObservationSetup;
  await persistRejectedTargetObservationSetup(sessionId, {
    ...RESOLVED_SETUP,
    observationPosition: "First unmapped value",
  });
  await persistRejectedTargetObservationSetup(sessionId, {
    ...RESOLVED_SETUP,
    observationPosition: "Latest unmapped value",
  });
  completedAfterRejectedAttempt = (await targetObservationState(sessionId)).targetObservationSetup;
  assert.equal(completedAfterRejectedAttempt.completed, true);
  assert.equal(completedAfterRejectedAttempt.storedAt, completed.storedAt);
  assert.deepEqual(completedAfterRejectedAttempt.data, completed.data);
  assert.deepEqual(completedAfterRejectedAttempt.setupMetadataProvenance, completed.setupMetadataProvenance);
  assert.equal(
    provenanceByField(completedAfterRejectedAttempt.rejectedSetupMetadataProvenance, "observationPosition").rawValue,
    "Latest unmapped value",
  );
  assert.equal(completedAfterRejectedAttempt.rejectedSetupMetadataProvenance.length, 6);
  assert.equal(JSON.stringify(completedAfterRejectedAttempt).includes("First unmapped value"), false);
  assert.equal(Array.isArray(completedAfterRejectedAttempt.rejectedSetupMetadataProvenance[0]), false);
});

check("513-character raw input is rejected but never persisted or truncated", async () => {
  assert.equal(TARGET_OBSERVATION_SETUP_RAW_VALUE_MAX_LENGTH, 512);
  assert.equal(hasOversizedTargetObservationSetupRawValue({ ...RESOLVED_SETUP, observationPosition: "x".repeat(512) }), false);
  assert.equal(hasOversizedTargetObservationSetupRawValue({ ...RESOLVED_SETUP, observationPosition: "x".repeat(513) }), true);
  const sessionId = `c3c-oversized-${Date.now()}`;
  const response = await invoke(saveSetupHandler, {
    method: "POST",
    url: "/api/save-target-observation-setup",
    body: {
      sessionId,
      setup: { ...RESOLVED_SETUP, observationPosition: "x".repeat(513) },
    },
  });
  const state = await targetObservationState(sessionId);
  assert.equal(response.status, 400);
  assert.deepEqual(response.body, { status: "setup-incomplete", missing: ["observationPosition"] });
  assert.equal(state.targetObservationSetup, null);
  assert.equal(JSON.stringify(state).includes("x".repeat(512)), false);
});

check("known storage failure cannot promote or replace an invalid 400", async () => {
  const environmentKeys = [
    "NODE_ENV",
    "VERCEL",
    "KV_REST_API_URL",
    "KV_REST_API_TOKEN",
    "UPSTASH_REDIS_REST_URL",
    "UPSTASH_REDIS_REST_TOKEN",
  ];
  const saved = Object.fromEntries(environmentKeys.map((key) => [key, process.env[key]]));
  try {
    process.env.NODE_ENV = "production";
    process.env.VERCEL = "1";
    delete process.env.KV_REST_API_URL;
    delete process.env.KV_REST_API_TOKEN;
    delete process.env.UPSTASH_REDIS_REST_URL;
    delete process.env.UPSTASH_REDIS_REST_TOKEN;
    const response = await invoke(saveSetupHandler, {
      method: "POST",
      url: "/api/save-target-observation-setup",
      body: { sessionId: `c3c-storage-failure-${Date.now()}`, setup: UNRESOLVED_SETUP },
    });
    assert.equal(response.status, 400);
    assert.deepEqual(response.body, { status: "setup-incomplete", missing: ["observationPosition"] });
  } finally {
    for (const key of environmentKeys) {
      if (saved[key] === undefined) delete process.env[key];
      else process.env[key] = saved[key];
    }
  }
});

check("programming errors on rejected persistence remain visible", async () => {
  const programmingError = new Error("c3c-programming-error-sentinel");
  const malformed = new Proxy({}, {
    get() {
      throw programmingError;
    },
  });
  await assert.rejects(
    persistRejectedTargetObservationSetup(`c3c-programming-error-${Date.now()}`, malformed),
    programmingError,
  );
});

let scoringEvidence;

check("Target Observation scoring semantic output is deep-equal to the pre-C3-C baseline", () => {
  const answers = Object.fromEntries(
    TARGET_OBSERVATION_DIAGNOSTIC.questions.map((question) => [question.id, evidenceClassifiedAnswer("A")]),
  );
  scoringEvidence = scoreView(scoreTargetObservation(answers));
  assert.deepEqual(scoringEvidence, BASELINE_SCORE_VIEW);
});

check("provenance is not projected to outputContext or public reports", () => {
  const outputContext = createTargetObservationOutputContext(
    { targetObservationSetup: resolvedRecord },
    { topEnvironmentCode: "NT/STJ", evidenceConfidence: 12 },
  );
  assert.deepEqual(Object.keys(outputContext).sort(), [
    "evidenceConfidence",
    "integrationTimeline",
    "observationPosition",
    "observedTargetEnvironment",
    "respondentContext",
    "respondentContextProfile",
  ]);
  assert.equal(JSON.stringify(outputContext).includes("Provenance"), false);
  assert.equal(read("src/reporting/mergevuePublicReportModel.js").includes("setupMetadataProvenance"), false);
  assert.equal(read("src/reporting/mergevueForecastBriefDesignRenderer.js").includes("setupMetadataProvenance"), false);
});

check("C3-C provenance stays isolated from scoring and App public consumers while remaining protected sources retain their baselines", () => {
  assert.deepEqual(layeredScoringIsolationViolations(read("src/flow/layeredEvidenceScoring.js")), []);
  assert.deepEqual(appPublicConsumerViolations(read("src/App.jsx")), []);
  assert.equal(sha256(read("api/submit-target-observation.ts")), "1c989b6b1314b80856efc77fb29f0d5d738978044c679d3e940dfff5f27b80d0");
  assert.equal(sha256(read("src/flow/observationScopeResolver.js")), "e922aafb514bd6ed7b6ab7d574283605bb8b93b425448257ab8846044ce6f061");
  // C5-B.2B CORR3 re-freeze: authorized C5-B.2B + CORR1 + CORR2 Dual PRE_DUAL gate.
  // Superseded: d8e5f2651021580f3943b0d18f86de855a7bc941ffe19dfb052cdb405b1be35e
  assert.equal(sha256(read("src/flow/dualRespondentComparison.js")), "5b730d53df647ddf12f58a0f4e8bf1bcb294e852b4f080ed5a038103b79ba2e3");
  assert.equal(sha256(read("src/flow/questionnaireAnswerSemanticState.js")), "ce68af824d85ec02fac6738f5a58b9f9ca5548eb0e92fbd1e3e641a434496935");
  // C5-C.1 CORR2 re-freeze: authorized C5-C.1.IMPL + CORR1 agent-tree changes superseding the stale C5-B.2B CORR3 baseline.
  // Superseded: d09069b81e86b4819050f0f1815634d15bae6af6c222d9de271e3d502406139e
  assert.equal(treeDigest("src/agent"), "7fa97e0c326a0dd78794e3a8ce52ba3c96518da544444212ff19c9eb12e82cdd");
  // C5-B.2B CORR3 re-freeze: authorized Dual generated binding/provenance materialization.
  // Superseded: 7854b64baa829a0a323cd96ea1c2067dc0b42ea2713452b86cacbe625c78eafd
  assert.equal(treeDigest("src/generated/newlogic"), "9414412e4473f87d607ca2d1a8462d6079fe0e68f51ef9310e6192d359d2a3e7");
  assert.equal(treeDigest("src/reporting"), "0dfc94669be6feb52b54a5144c651aa7043e4682e4544571ee64bd74b8ed33b9");
  assert.equal(treeDigest("src/data"), "da03c4ba3cbf911a561cb1d4e35fa8b02bd365cbc903234151fd58a9093734ef");
  assert.match(read("src/flow/observationScopeResolver.js"), /const AUTHORIZED_DUAL_MODULES = Object\.freeze\(\["acquirerEnvironment", "targetSelfAssessment"\]\);/);
});

check("questionnaire and setup whitelist contracts remain frozen", () => {
  const questionnaires = JSON.parse(read("src/generated/newlogic/questionnaires.json"));
  const substantiveModuleIds = new Set([
    "acquirerEnvironment",
    "targetSelfAssessment",
    "environmentLevel1",
    "environmentLevel2",
    "targetObservedEnvironment",
  ]);
  const substantiveCount = questionnaires.modules
    .filter(({ id }) => substantiveModuleIds.has(id))
    .reduce((count, module) => count + module.questions.length, 0);
  assert.equal(TARGET_OBSERVATION_DIAGNOSTIC.questions.length, 23);
  assert.equal(TARGET_OBSERVATION_DIAGNOSTIC.questionCount, 23);
  assert.equal(substantiveCount, 67);
  assert.equal(sha256(JSON.stringify(TARGET_OBSERVATION_DIAGNOSTIC.questions)), "c572b702ab58a957be3df5faa8e4defe79020ed60594ba4896a0b3a5645a8008");
  assert.equal(sha256(JSON.stringify(TARGET_OBSERVATION_SETUP_FIELDS)), "e2c1a73137da69bc384fcc9a89604d826660908e1bf3a42041f78701ebb8f239");
  assert.equal(sha256(JSON.stringify(RESPONDENT_CONTEXT_SECTIONS)), "fc6cb787d39ef47e032f5b13c9747ade49338805afb998dc81ae32a160d44416");
});

check("HTTP method and request validation contracts remain unchanged", async () => {
  assert.deepEqual(await invoke(saveSetupHandler, { method: "GET", url: "/api/save-target-observation-setup" }), {
    status: 405,
    body: { status: "method-not-allowed", method: "GET", allowed: ["POST"] },
  });
  assert.deepEqual(await invoke(saveSetupHandler, {
    method: "POST",
    url: "/api/save-target-observation-setup",
    body: { setup: RESOLVED_SETUP },
  }), {
    status: 400,
    body: { status: "invalid-request", error: "sessionId is required" },
  });
  assert.deepEqual(await invoke(submitObservationHandler, {
    method: "POST",
    url: "/api/submit-target-observation",
    body: {},
  }), {
    status: 400,
    body: {
      endpoint: "/api/submit-target-observation",
      status: "invalid-request",
      error: "assessmentSessionId, observationSessionId, codeHash, and digitalCode are required",
    },
  });
});

check("dependency direction is one-way and the runtime guard repair is exact", () => {
  const provenanceSource = read("src/flow/targetObservationSetupProvenance.js");
  const flowSource = read("src/flow/targetObservationFlow.js");
  const runtimeGuardSource = read("scripts/validate-target-observation-runtime-guards.mjs");
  assert.equal(provenanceSource.includes("targetObservationFlow"), false);
  assert.equal(provenanceSource.includes("import "), false);
  assert.match(flowSource, /from "\.\/targetObservationSetupProvenance\.js"/);
  assert.equal(flowSource.includes("canonicalRespondent"), false);
  assert.match(runtimeGuardSource, /const ledger = read\("src\/server\/_sessionLedger\.ts"\);/);
  assert.equal(runtimeGuardSource.includes('read("api/_sessionLedger.ts")'), false);
  assert.equal(
    JSON.parse(read("package.json")).scripts["validate:c3c-metadata-provenance"],
    "node scripts/validate-c3c-metadata-provenance.mjs",
  );
});

const failures = [];
for (const { label, fn } of checks) {
  try {
    await fn();
    console.log(`PASS ${label}`);
  } catch (error) {
    failures.push({ label, error });
    console.error(`FAIL ${label}`);
    console.error(`  ${error instanceof Error ? error.stack ?? error.message : String(error)}`);
  }
}

if (failures.length) {
  console.error(`C3-C metadata provenance validation failed: ${failures.length}/${checks.length} check(s) failed.`);
  process.exit(1);
}

console.log(`C3-C metadata provenance validation passed: ${checks.length}/${checks.length}`);
console.log(`EVIDENCE invalid-save ${JSON.stringify(invalidSaveResponse)}`);
console.log(`EVIDENCE invalid-final-submit ${JSON.stringify(invalidFinalResponse)}`);
console.log(`EVIDENCE wrong-code-final-submit ${JSON.stringify(wrongCodeResponse)}`);
console.log(`EVIDENCE invalid-readback ${JSON.stringify({
  completed: invalidSaveState.targetObservationSetup.completed,
  missing: invalidSaveState.targetObservationSetup.missing,
  ...provenanceByField(invalidSaveState.targetObservationSetup.setupMetadataProvenance, "observationPosition"),
  canStartTargetObservation: invalidSaveState.canStartTargetObservation,
})}`);
console.log(`EVIDENCE scoring-deep-equal ${JSON.stringify(scoringEvidence)}`);
console.log(`EVIDENCE completed-after-rejected ${JSON.stringify(completedAfterRejectedAttempt)}`);
