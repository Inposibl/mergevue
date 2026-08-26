import assert from "node:assert/strict";
import { existsSync, mkdtempSync, readdirSync, readFileSync, rmSync, statSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

import { build } from "esbuild";

import { ACQUIRER_TRACK_DATA } from "../src/data/acquirerTrackData.js";
import { TARGET_DIAGNOSTIC_DATA } from "../src/data/targetDiagnosticData.js";
import { TARGET_OBSERVATION_DIAGNOSTIC } from "../src/data/targetObservedEnvironmentDiagnostic.js";
import { TARGET_SELF_ASSESSMENT_DATA } from "../src/data/targetSelfAssessmentData.js";
import {
  DOCUMENT_CAPABILITY_NOT_ADMISSIBLE_IN_FREE,
  EVIDENCE_TYPE_OPTIONS,
  KNOWLEDGE_LEVEL_OPTIONS,
  RELIABILITY_FLAG_OPTIONS,
  evidenceClassifiedAnswer,
  updateEvidenceAnswer,
  validateEvidenceClassifiedAnswer,
} from "../src/flow/evidenceClassification.js";

const ROOT = fileURLToPath(new URL("..", import.meta.url));
const appSource = readFileSync(new URL("../src/App.jsx", import.meta.url), "utf8");
const classificationSource = readFileSync(new URL("../src/flow/evidenceClassification.js", import.meta.url), "utf8");
const scoringSource = readFileSync(new URL("../src/flow/layeredEvidenceScoring.js", import.meta.url), "utf8");
const questionnaires = JSON.parse(
  readFileSync(new URL("../src/generated/newlogic/questionnaires.json", import.meta.url), "utf8"),
);
const modelsSource = readFileSync(new URL("../src/models/canonicalDataModel.ts", import.meta.url), "utf8");
const modelsIndexSource = readFileSync(new URL("../src/models/index.ts", import.meta.url), "utf8");

const SUBSTANTIVE_MODULE_IDS = Object.freeze([
  "acquirerEnvironment",
  "targetSelfAssessment",
  "environmentLevel1",
  "environmentLevel2",
  "targetObservedEnvironment",
]);

const FORBIDDEN_CLIENT_COPY = Object.freeze([
  "Document-Supported",
  "Document Supported",
  "Document-Based",
  "Document Based",
  "document-backed",
  "document-supported",
  "document-based",
]);

const FORBIDDEN_BUNDLE_UX = Object.freeze([
  "Add evidence item",
  "Document metadata",
  "Upload document",
  "Optional file selector",
  "Verified document",
  "Disputed document",
]);

const results = [];

function check(id, label, fn) {
  fn();
  results.push({ id, label, status: "PASS" });
}

function optionValues(options) {
  return (options ?? []).map((option) => option.value);
}

function optionTitles(options) {
  return (options ?? []).map((option) => option.title);
}

function childNodes(node) {
  if (Array.isArray(node)) return node;
  if (!node || typeof node !== "object") return [];
  return Array.isArray(node.children) ? node.children : [];
}

function descendantNodes(node, descendants = []) {
  if (Array.isArray(node)) {
    for (const child of node) descendantNodes(child, descendants);
    return descendants;
  }
  if (!node || typeof node !== "object") return descendants;
  descendants.push(node);
  for (const child of childNodes(node)) descendantNodes(child, descendants);
  return descendants;
}

function renderedText(node) {
  if (Array.isArray(node)) return node.map(renderedText).join(" ");
  if (typeof node === "string" || typeof node === "number") return String(node);
  if (!node || typeof node !== "object") return "";
  return childNodes(node).map(renderedText).join(" ");
}

function compactText(node) {
  return renderedText(node).replace(/\s+/g, " ").trim();
}

function evidenceAnswerForGate(gate) {
  if (gate === "yes") {
    return {
      selectedOption: "A",
      directObservationGate: gate,
      evidenceType: "direct_observation",
      knowledgeLevel: "first_hand",
      confidence: "high",
      reliabilityFlags: [],
      reliabilityFlagsAcknowledged: true,
    };
  }
  if (gate === "no") {
    return {
      selectedOption: "A",
      directObservationGate: gate,
      evidenceType: "reported_by_others",
      knowledgeLevel: "second_hand",
      confidence: "medium",
      reliabilityFlags: [],
      reliabilityFlagsAcknowledged: true,
    };
  }
  return {
    selectedOption: "A",
    directObservationGate: "",
    evidenceType: "",
    knowledgeLevel: "",
    confidence: "",
    reliabilityFlags: [],
    reliabilityFlagsAcknowledged: true,
  };
}

function renderedSegmentOptions(tree, fieldId, emittedAnswers) {
  const group = descendantNodes(tree).find(
    (node) => node.type === "div"
      && node.props?.role === "group"
      && node.props?.["aria-labelledby"] === `${fieldId}-label`,
  );
  assert.ok(group, `${fieldId} rendered option group must exist`);

  const buttons = descendantNodes(group).filter((node) => node.type === "button");
  return buttons.map((button) => {
    emittedAnswers.length = 0;
    assert.equal(typeof button.props?.onClick, "function", `${fieldId} rendered option must be selectable`);
    button.props.onClick({ target: { value: button.props?.value } });
    assert.equal(emittedAnswers.length, 1, `${fieldId} selection must emit exactly one answer`);
    const field = fieldId === "evidence-type" ? "evidenceType" : "knowledgeLevel";
    const value = emittedAnswers[0]?.[field];
    assert.equal(typeof value, "string", `${fieldId} rendered option must emit a string value`);
    assert.ok(value, `${fieldId} rendered option must emit a non-empty value`);
    return Object.freeze({ value, title: compactText(button) });
  });
}

function renderedReliabilityOptions(tree, baseAnswer, emittedAnswers) {
  const fieldset = descendantNodes(tree).find(
    (node) => node.type === "fieldset"
      && descendantNodes(node).some((child) => child.type === "legend" && compactText(child) === "Reliability flags"),
  );
  if (!fieldset) return Object.freeze([]);

  const baseFlags = new Set(baseAnswer.reliabilityFlags ?? []);
  const renderedOptions = [];
  for (const label of descendantNodes(fieldset).filter((node) => node.type === "label")) {
    const input = descendantNodes(label).find((node) => node.type === "input");
    if (!input || typeof input.props?.onChange !== "function") continue;
    emittedAnswers.length = 0;
    input.props.onChange({ target: { checked: true, value: input.props?.value } });
    assert.equal(emittedAnswers.length, 1, "reliability selection must emit exactly one answer");
    const addedFlags = (emittedAnswers[0]?.reliabilityFlags ?? []).filter((flag) => !baseFlags.has(flag));
    if (addedFlags.length === 0) continue;
    assert.equal(addedFlags.length, 1, "each rendered reliability choice must emit exactly one flag");
    renderedOptions.push(Object.freeze({ value: addedFlags[0], title: compactText(label) }));
  }
  return Object.freeze(renderedOptions);
}

async function captureRenderedFreeOptionSets() {
  const temporaryDirectory = mkdtempSync(join(tmpdir(), "mergevue-free-document-ui-"));
  const outputFile = join(temporaryDirectory, "evidence-classification-panel-probe.mjs");
  const captureRuntime = `
function __freeBoundaryFlatten(children, flattened = []) {
  for (const child of children) {
    if (Array.isArray(child)) __freeBoundaryFlatten(child, flattened);
    else if (child !== null && child !== undefined && child !== false && child !== true) flattened.push(child);
  }
  return flattened;
}
function __freeBoundaryElement(type, props, ...children) {
  const flattened = __freeBoundaryFlatten(children);
  const completeProps = {
    ...(props ?? {}),
    children: flattened.length <= 1 ? flattened[0] : flattened,
  };
  if (typeof type === "function") return type(completeProps);
  return { type, props: completeProps, children: flattened };
}
const __freeBoundaryFragment = Symbol.for("mergevue.validator.fragment");
`;
  const instrumentedAppSource = `${captureRuntime}\n${appSource}\nexport { EvidenceClassificationPanel as __validatorEvidenceClassificationPanel };\n`;

  try {
    await build({
      bundle: true,
      format: "esm",
      jsx: "transform",
      jsxFactory: "__freeBoundaryElement",
      jsxFragment: "__freeBoundaryFragment",
      loader: { ".css": "empty" },
      logLevel: "silent",
      outfile: outputFile,
      platform: "node",
      stdin: {
        contents: instrumentedAppSource,
        loader: "jsx",
        resolveDir: join(ROOT, "src"),
        sourcefile: "App.jsx",
      },
    });

    const probeModule = await import(`${pathToFileURL(outputFile).href}?validator=${Date.now()}`);
    const Panel = probeModule.__validatorEvidenceClassificationPanel;
    assert.equal(typeof Panel, "function", "EvidenceClassificationPanel runtime probe export must exist");

    const questionConfigurations = Object.freeze([
      Object.freeze({ id: "default-question", question: null }),
      Object.freeze({ id: "allows-unknown", question: Object.freeze({ allowsUnknown: true }) }),
      Object.freeze({ id: "disallows-unknown", question: Object.freeze({ allowsUnknown: false }) }),
    ]);
    const snapshots = [];
    for (const gate of ["", "yes", "no"]) {
      for (const configuration of questionConfigurations) {
        const answer = evidenceAnswerForGate(gate);
        const emittedAnswers = [];
        const tree = Panel({
          answer,
          onChange: (nextAnswer) => emittedAnswers.push(nextAnswer),
          question: configuration.question,
          showDirectObservation: true,
        });
        snapshots.push(Object.freeze({
          id: `${gate || "unset"}/${configuration.id}`,
          gate,
          evidenceTypes: Object.freeze(renderedSegmentOptions(tree, "evidence-type", emittedAnswers)),
          knowledgeLevels: Object.freeze(renderedSegmentOptions(tree, "knowledge-level", emittedAnswers)),
          reliabilityFlags: renderedReliabilityOptions(tree, answer, emittedAnswers),
          renderedText: compactText(tree),
        }));
      }
    }

    const unknownAnswer = updateEvidenceAnswer(evidenceAnswerForGate("no"), { evidenceType: "unknown" });
    const unknownTree = Panel({
      answer: unknownAnswer,
      onChange: () => {},
      question: Object.freeze({ allowsUnknown: true }),
      showDirectObservation: true,
    });
    const unknownNodes = descendantNodes(unknownTree);
    const unknownRenderedText = compactText(unknownTree);
    const unknownAnswerBranch = Object.freeze({
      id: "no/unknown-answer",
      gate: unknownAnswer.directObservationGate,
      answer: unknownAnswer,
      evidenceTypes: Object.freeze([]),
      knowledgeLevels: Object.freeze([]),
      reliabilityFlags: Object.freeze([]),
      renderedText: unknownRenderedText,
      hasClassificationPanel: unknownNodes.some(
        (node) => node.type === "section" && node.props?.className === "evidence-classification-panel",
      ),
      hasEarlyReturnMessage: unknownRenderedText.includes(
        "This answer is recorded as no direct knowledge. It is excluded from primary environment scoring and preserved as coverage evidence.",
      ),
      interactiveControlCount: unknownNodes.filter(
        (node) => ["button", "input", "select", "textarea"].includes(node.type)
          || typeof node.props?.onClick === "function"
          || typeof node.props?.onChange === "function",
      ).length,
    });

    return Object.freeze({
      optionSets: Object.freeze(snapshots),
      unknownAnswerBranch,
    });
  } finally {
    rmSync(temporaryDirectory, { force: true, recursive: true });
  }
}

function matchingClose(source, openIndex, openChar, closeChar) {
  let depth = 0;
  let quote = null;
  for (let index = openIndex; index < source.length; index += 1) {
    const character = source[index];
    if (quote) {
      if (character === "\\" && quote !== "`") {
        index += 1;
        continue;
      }
      if (character === quote) quote = null;
      continue;
    }
    if (character === "'" || character === "\"" || character === "`") {
      quote = character;
      continue;
    }
    if (character === openChar) depth += 1;
    else if (character === closeChar) {
      depth -= 1;
      if (depth === 0) return index;
    }
  }
  return -1;
}

function extractFunctionSource(source, name) {
  const match = source.match(new RegExp(`function\\s+${name}\\s*\\(`));
  if (!match || match.index == null) return "";
  const start = match.index;
  const paramsOpen = source.indexOf("(", start);
  const paramsClose = matchingClose(source, paramsOpen, "(", ")");
  if (paramsClose < 0) return "";
  const brace = source.indexOf("{", paramsClose);
  if (brace < 0) return "";
  const braceClose = matchingClose(source, brace, "{", "}");
  if (braceClose < 0) return source.slice(start);
  return source.slice(start, braceClose + 1);
}

function stripComments(source) {
  return source
    .replace(/\/\*[\s\S]*?\*\//g, "")
    .replace(/(^|[^:])\/\/.*$/gm, "$1");
}

function pushedConsistencyIssues(source) {
  return [...source.matchAll(/consistencyIssues\.push\((["'`])([\s\S]*?)\1\)/g)].map((match) => match[2]);
}

function containsForbiddenClientCopy(text) {
  return FORBIDDEN_CLIENT_COPY.some((phrase) => text.toLowerCase().includes(phrase.toLowerCase()));
}

function walkFiles(directory, files = []) {
  if (!existsSync(directory)) return files;
  for (const entry of readdirSync(directory)) {
    const fullPath = join(directory, entry);
    const stat = statSync(fullPath);
    if (stat.isDirectory()) walkFiles(fullPath, files);
    else files.push(fullPath);
  }
  return files;
}

function documentSupportedAnswer() {
  return updateEvidenceAnswer(evidenceClassifiedAnswer("A"), {
    evidenceType: "document_supported",
    knowledgeLevel: "first_hand",
    confidence: "high",
    directObservationGate: "yes",
  });
}

const classificationPanelSource = extractFunctionSource(appSource, "EvidenceClassificationPanel");
const renderedFreeCapture = await captureRenderedFreeOptionSets();
const renderedFreeOptionSets = renderedFreeCapture.optionSets;
const unknownAnswerBranch = renderedFreeCapture.unknownAnswerBranch;
const allRenderedFreeStates = Object.freeze([...renderedFreeOptionSets, unknownAnswerBranch]);

check("FDB-01", "actual EvidenceClassificationPanel renders are captured for every FREE gate/question configuration", () => {
  assert.equal(renderedFreeOptionSets.length, 9);
  for (const snapshot of renderedFreeOptionSets) {
    assert.ok(snapshot.evidenceTypes.length > 0, `${snapshot.id} must render evidence-type choices`);
    assert.ok(snapshot.knowledgeLevels.length > 0, `${snapshot.id} must render knowledge-level choices`);
    if (snapshot.gate === "yes") {
      assert.equal(snapshot.reliabilityFlags.length, 0, `${snapshot.id} must hide reliability choices`);
    } else {
      assert.ok(snapshot.reliabilityFlags.length > 0, `${snapshot.id} must render reliability choices`);
    }
  }
});

check("FDB-01U", "genuine normalized Unknown answer executes the production early-return branch", () => {
  assert.deepEqual(
    {
      directObservationGate: unknownAnswerBranch.answer.directObservationGate,
      evidenceType: unknownAnswerBranch.answer.evidenceType,
      knowledgeLevel: unknownAnswerBranch.answer.knowledgeLevel,
      confidence: unknownAnswerBranch.answer.confidence,
    },
    {
      directObservationGate: "no",
      evidenceType: "unknown",
      knowledgeLevel: "not_known",
      confidence: "cannot_determine",
    },
  );
  assert.deepEqual(unknownAnswerBranch.answer.reliabilityFlags, ["no_direct_knowledge"]);
  assert.equal(unknownAnswerBranch.answer.reliabilityFlagsAcknowledged, true);
  assert.equal(unknownAnswerBranch.hasClassificationPanel, true);
  assert.equal(unknownAnswerBranch.hasEarlyReturnMessage, true);
  assert.equal(unknownAnswerBranch.interactiveControlCount, 0);
});

check("FDB-02", "actual rendered FREE reliability choices exclude contradicted_by_document", () => {
  for (const snapshot of allRenderedFreeStates) {
    assert.equal(
      optionValues(snapshot.reliabilityFlags).includes("contradicted_by_document"),
      false,
      `${snapshot.id} must not render contradicted_by_document`,
    );
    assert.equal(
      /Contradicted by document|contradicted_by_document/i.test(snapshot.renderedText),
      false,
      `${snapshot.id} must not render the Contradicted by document title`,
    );
  }
});

check("FDB-03", "actual rendered FREE evidence-type values and text exclude Document-Supported", () => {
  for (const snapshot of allRenderedFreeStates) {
    assert.equal(
      optionValues(snapshot.evidenceTypes).includes("document_supported"),
      false,
      `${snapshot.id} must not render document_supported`,
    );
    assert.equal(
      /Document[- ]Supported|document_supported/i.test(snapshot.renderedText),
      false,
      `${snapshot.id} must not render Document-Supported title/description text`,
    );
  }
});

check("FDB-04", "actual rendered FREE knowledge-level values and text exclude Document-Based", () => {
  for (const snapshot of allRenderedFreeStates) {
    assert.equal(
      optionValues(snapshot.knowledgeLevels).includes("document_based"),
      false,
      `${snapshot.id} must not render document_based`,
    );
    assert.equal(
      /Document[- ]Based|document_based/i.test(snapshot.renderedText),
      false,
      `${snapshot.id} must not render Document-Based title text`,
    );
  }
});

check("FDB-05", "App.jsx does not contain reachable EvidenceCapturePanel", () => {
  assert.equal(/function\s+EvidenceCapturePanel\s*\(/.test(appSource), false);
  assert.equal(/<\s*EvidenceCapturePanel[\s/>]/.test(appSource), false);
  assert.equal(appSource.includes("EvidenceCapturePanel"), false);
});

check("FDB-06", "FREE App does not contain a file-upload control for evidence/document workflow", () => {
  assert.equal(/type\s*=\s*["']file["']/.test(appSource), false);
  assert.equal(/type\s*=\s*\{\s*["']file["']\s*\}/.test(appSource), false);
  assert.equal(appSource.includes("updateDocumentMetadata"), false);
  assert.equal(appSource.includes("input type=\"file\""), false);
});

check("FDB-07", "FREE App does not contain document review status selector/badge UI", () => {
  assert.equal(appSource.includes("EVIDENCE_REVIEW_STATUS_OPTIONS.map"), false);
  assert.equal(appSource.includes("evidence-item-card"), false);
  assert.equal(appSource.includes("status-${item.reviewStatus}"), false);
  assert.equal(appSource.includes("updateEvidenceStatus"), false);
  assert.equal(/Attach the item to a contradiction/.test(appSource), false);
});

check("FDB-08", "FREE client-facing validation/error copy does not propose document-backed evidence", () => {
  const issues = pushedConsistencyIssues(classificationSource);
  assert.ok(issues.length > 0, "expected consistency issue copy to exist");
  for (const issue of issues) {
    assert.equal(containsForbiddenClientCopy(issue), false, `forbidden client copy in consistency issue: ${issue}`);
  }
  const appWithoutComments = stripComments(appSource);
  for (const phrase of FORBIDDEN_CLIENT_COPY) {
    assert.equal(
      appWithoutComments.toLowerCase().includes(phrase.toLowerCase()),
      false,
      `App.jsx client copy must not contain ${phrase}`,
    );
  }
  const classificationIssuesText = issues.join(" ");
  assert.match(classificationIssuesText, /Reclassify this answer using the available FREE evidence basis/);
  assert.equal(/document_capability_not_admissible_in_free/.test(classificationIssuesText), false);
});

check("FDB-09", "Internal document_capability_not_admissible_in_free remains in scoring/audit", () => {
  assert.equal(DOCUMENT_CAPABILITY_NOT_ADMISSIBLE_IN_FREE, "document_capability_not_admissible_in_free");
  assert.match(classificationSource, /export const DOCUMENT_CAPABILITY_NOT_ADMISSIBLE_IN_FREE/);
  assert.match(scoringSource, /document_capability_not_admissible_in_free|DOCUMENT_CAPABILITY_NOT_ADMISSIBLE_IN_FREE/);
  assert.match(scoringSource, /hasFreeInadmissibleDocumentCapability/);
  const validation = validateEvidenceClassifiedAnswer(documentSupportedAnswer());
  assert.equal(validation.valid, false);
  assert.equal(validation.normalized.evidenceType, "document_supported");
  assert.ok(validation.consistencyIssues.some((issue) => /not admissible in FREE/i.test(issue)));
});

check("FDB-10", "PAID/domain document capability remains physically present", () => {
  assert.equal(existsSync(join(ROOT, "src/flow/evidenceCapture.js")), true, "src/flow/evidenceCapture.js must exist");
  assert.match(modelsSource, /export interface EvidenceItem/);
  assert.match(modelsIndexSource, /EvidenceItem/);
  assert.equal(optionValues(EVIDENCE_TYPE_OPTIONS).includes("document_supported"), true);
  assert.equal(optionTitles(EVIDENCE_TYPE_OPTIONS).includes("Document-Supported"), true);
  assert.equal(optionValues(KNOWLEDGE_LEVEL_OPTIONS).includes("document_based"), true);
  assert.equal(optionTitles(KNOWLEDGE_LEVEL_OPTIONS).includes("Document-Based"), true);
  assert.equal(optionValues(RELIABILITY_FLAG_OPTIONS).includes("contradicted_by_document"), true);
  assert.match(classificationSource, /value:\s*"document_supported"/);
  assert.match(classificationSource, /value:\s*"document_based"/);
  assert.match(classificationSource, /value:\s*"contradicted_by_document"/);
});

check("FDB-11", "C3-B.1 scoring weights and FREE exclusion accounting are unchanged", () => {
  assert.match(scoringSource, /document_supported:\s*1/);
  assert.match(scoringSource, /document_based:\s*0\.85/);
  assert.match(scoringSource, /contradicted_by_document:\s*0\.2/);
  assert.match(scoringSource, /hasFreeInadmissibleDocumentCapability/);
  const exclusionStart = scoringSource.indexOf("const documentCapabilityExcluded");
  assert.ok(exclusionStart >= 0, "FREE document exclusion block must exist");
  const exclusionBlock = scoringSource.slice(
    exclusionStart,
    scoringSource.indexOf("const weight = answerWeight", exclusionStart),
  );
  assert.ok(exclusionBlock.includes("hasFreeInadmissibleDocumentCapability"));
  assert.equal(exclusionBlock.includes("treatAsUnknown"), false);
  assert.equal(exclusionBlock.includes("cappedEvidenceType"), false);
});

check("FDB-12", "67 substantive questionnaire questions are unchanged", () => {
  const generatedCount = SUBSTANTIVE_MODULE_IDS
    .map((moduleId) => questionnaires.modules.find((module) => module.id === moduleId))
    .reduce((sum, module) => sum + (module?.questions?.length ?? 0), 0);
  const runtimeCount = [
    ACQUIRER_TRACK_DATA.acquirerModule.questions,
    TARGET_SELF_ASSESSMENT_DATA.targetSelfAssessment.questions,
    TARGET_DIAGNOSTIC_DATA.level1.questions,
    TARGET_DIAGNOSTIC_DATA.level2.questions,
    TARGET_OBSERVATION_DIAGNOSTIC.questions,
  ].reduce((sum, questions) => sum + questions.length, 0);
  assert.equal(generatedCount, 67);
  assert.equal(runtimeCount, 67);
});

check("FDB-13", "No Agent wiring was introduced by the FREE document UI lock", () => {
  assert.equal(/from\s+["']\.\/agent\//.test(appSource), false);
  assert.equal(/from\s+["'][^"']*src\/agent/.test(classificationSource), false);
  assert.equal(/src\/agent/.test(appSource), false);
});

check("FDB-14", "No new human/analyst fallback was introduced in FREE classification copy", () => {
  const issues = pushedConsistencyIssues(classificationSource).join(" ");
  assert.equal(/human review|analyst review/i.test(issues), false);
  assert.equal(/human review|analyst review/i.test(classificationPanelSource), false);
});

check("FDB-15", "Built FREE bundle does not contain document upload/verification/review CTA copy", () => {
  for (const phrase of FORBIDDEN_BUNDLE_UX) {
    assert.equal(appSource.includes(phrase), false, `App.jsx must not contain ${phrase}`);
  }

  const distDirectory = join(ROOT, "dist");
  if (!existsSync(distDirectory)) return;

  const distFiles = walkFiles(distDirectory).filter((filePath) => /\.(js|css|html|map)$/.test(filePath));
  assert.ok(distFiles.length > 0, "dist exists but contains no scannable assets");
  for (const filePath of distFiles) {
    const content = readFileSync(filePath, "utf8");
    for (const phrase of FORBIDDEN_BUNDLE_UX) {
      assert.equal(content.includes(phrase), false, `${filePath} must not contain ${phrase}`);
    }
  }
});

console.log("FREE document UI boundary cases passed:");
for (const row of results) {
  console.log(`  ${row.id}. ${row.label}: ${row.status}`);
}
console.log(`PASS ${results.length}/${results.length}`);
