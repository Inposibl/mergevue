import assert from "node:assert/strict";
import resolvePairHandler from "../api/resolve-pair.ts";
import { FINAL_DELIVERABLE_DATA } from "../src/data/finalDeliverableData.js";
import {
  FINAL_ENVIRONMENT_CODES,
  buildPairDeliverable,
  buildPaidOffer,
  canonicalRiskBand,
  canonicalStructuralEcs,
  compatibilityRange,
  findFinalNarrative,
  findFrictionPoint,
  isFinalDeliverableSourceLoaded,
  publicText,
} from "../src/flow/finalDeliverableFlow.js";
import { SCREEN_REGISTRY } from "../src/screenRegistry.js";

const ENV_CODE_PATTERN = /NF\/NT|NT\/STJ|NT\/STP|NF\/SFJ|NF\/SFP|SFJ\/SFP|SFP\/SFJ|STJ\/STP|STP\/STJ|SP\/SJ/;
const EXPECTED_HETEROGENEOUS_PAIR_COUNT = FINAL_ENVIRONMENT_CODES.length * (FINAL_ENVIRONMENT_CODES.length - 1);

function pairKey(left, right) {
  return `${left}::${right}`;
}

function assertPublicText(value) {
  assert.equal(ENV_CODE_PATTERN.test(String(value ?? "")), false, value);
}

assert.equal(isFinalDeliverableSourceLoaded(), true);
assert.equal(FINAL_DELIVERABLE_DATA.narratives.length, 72);
assert.equal(EXPECTED_HETEROGENEOUS_PAIR_COUNT, 72, "9x9 environment grid must contain exactly 72 ordered heterogeneous pairs.");
assert.equal(FINAL_DELIVERABLE_DATA.frictionPoints.length, EXPECTED_HETEROGENEOUS_PAIR_COUNT);

const routeIds = new Set(SCREEN_REGISTRY.map((screen) => screen.id));
assert.equal(routeIds.has("screen-10-reveal"), true);
assert.equal(routeIds.has("screen-10b-homogeneous"), true);
assert.equal(routeIds.has("screen-11-paid-offer"), true);
assert.equal(routeIds.has("screen-11b-homogeneous-offer"), true);

const narrativePairs = new Set(
  FINAL_DELIVERABLE_DATA.narratives.map((record) => pairKey(record.acquirerEnvironmentCode, record.targetEnvironmentCode)),
);
assert.equal(narrativePairs.size, 72);

const frictionPairs = FINAL_DELIVERABLE_DATA.frictionPoints.map((record) => {
  assert.notEqual(
    record.acquirerEnvironmentCode,
    record.targetEnvironmentCode,
    "Friction universe must not contain homogeneous self-pairs.",
  );
  return pairKey(record.acquirerEnvironmentCode, record.targetEnvironmentCode);
});
assert.equal(new Set(frictionPairs).size, EXPECTED_HETEROGENEOUS_PAIR_COUNT);

const expectedHeterogeneousPairs = FINAL_ENVIRONMENT_CODES.flatMap((acquirerEnvironmentCode) => (
  FINAL_ENVIRONMENT_CODES
    .filter((targetEnvironmentCode) => targetEnvironmentCode !== acquirerEnvironmentCode)
    .map((targetEnvironmentCode) => pairKey(acquirerEnvironmentCode, targetEnvironmentCode))
));
assert.deepEqual([...new Set(frictionPairs)].sort(), [...expectedHeterogeneousPairs].sort());
assert.deepEqual([...narrativePairs].sort(), [...expectedHeterogeneousPairs].sort());

for (const acquirerEnvironmentCode of FINAL_ENVIRONMENT_CODES) {
  for (const targetEnvironmentCode of FINAL_ENVIRONMENT_CODES) {
    const deliverable = buildPairDeliverable({ acquirerEnvironmentCode, targetEnvironmentCode });
    assert.equal(deliverable.ready, true);
    if (acquirerEnvironmentCode === targetEnvironmentCode) {
      const derived = canonicalStructuralEcs(acquirerEnvironmentCode, targetEnvironmentCode);
      const expectedRange = compatibilityRange(derived.ecs);
      const expectedBand = canonicalRiskBand(derived.ecs);
      assert.equal(deliverable.screen, "screen-10b");
      assert.equal(deliverable.route, "/screen-10b-homogeneous");
      assert.equal(deliverable.pairMode, "homogeneous");
      assert.equal(deliverable.outcomeKey, "homogeneous");
      assert.equal(derived.conflictPoints, 0);
      assert.equal(derived.ecs, 100);
      assert.equal(deliverable.compatibilityScore, derived.ecs);
      assert.equal(deliverable.structuralCompatibility?.canonicalScore, derived.ecs);
      assert.equal(deliverable.structuralCompatibility?.derivation?.conflictPoints, 0);
      assert.equal(deliverable.compatibilityRange, expectedRange);
      assert.equal(deliverable.structuralCompatibility?.canonicalRange, expectedRange);
      assert.equal(expectedRange, "95\u2013100");
      assert.equal(String(deliverable.compatibilityRange).includes("80\u201395"), false);
      assert.equal(String(deliverable.body).includes("80\u201395"), false);
      assert.equal(deliverable.riskBand, expectedBand);
      assert.equal(deliverable.structuralCompatibility?.canonicalBand, expectedBand);
      assert.notEqual(deliverable.protocol?.name, "RHQA");
      assert.equal(deliverable.anchors.length, 3);
      assert.ok(deliverable.anchors.every((anchor) => anchor.text !== "PENDING"));
      assertPublicText(deliverable.body);
    } else {
      assert.equal(deliverable.screen, "screen-10");
      assert.equal(deliverable.route, "/screen-10-reveal");
      assert.ok(findFinalNarrative(acquirerEnvironmentCode, targetEnvironmentCode));
      assert.ok(findFrictionPoint(acquirerEnvironmentCode, targetEnvironmentCode));
      assert.equal(narrativePairs.has(pairKey(acquirerEnvironmentCode, targetEnvironmentCode)), true);
    }
  }
}

const outcomeA = buildPairDeliverable({
  acquirerEnvironmentCode: "NF/NT",
  targetEnvironmentCode: "NT/STJ",
});
assert.equal(outcomeA.outcomeLetter, "A");
assert.equal(outcomeA.isEcsIssued, true);
assert.notEqual(outcomeA.compatibilityRange, "PENDING");
assert.ok(outcomeA.anchors.every((anchor) => anchor.text !== "PENDING"));
assertPublicText(publicText(outcomeA.narrative.headline));
assertPublicText(publicText(outcomeA.narrative.situation));
assertPublicText(publicText(outcomeA.narrative.implication));

const outcomeB = buildPairDeliverable({
  acquirerEnvironmentCode: "NF/NT",
  acquirerSecondaryEnvironmentCode: "NT/STP",
  acquirerSignalStrength: "weak",
  targetEnvironmentCode: "NT/STJ",
});
assert.equal(outcomeB.outcomeLetter, "B");
assert.equal(outcomeB.outcomeKey, "acquirer-partial");
assert.equal(outcomeB.candidateRanges.length, 2);

const outcomeC = buildPairDeliverable({
  acquirerEnvironmentCode: "NF/NT",
  targetEnvironmentCode: "NT/STJ",
  targetSecondaryEnvironmentCode: "NT/STP",
  targetSignalStrength: "weak",
  targetCoPresence: true,
});
assert.equal(outcomeC.outcomeLetter, "C");
assert.equal(outcomeC.outcomeKey, "target-partial");
assert.equal(outcomeC.candidateRanges.length, 2);

const outcomeD = buildPairDeliverable({
  acquirerEnvironmentCode: "NF/NT",
  targetEnvironmentCode: "NT/STJ",
  mixedSignal: true,
});
assert.equal(outcomeD.outcomeLetter, "D");
assert.equal(outcomeD.outcomeKey, "mixed");
assert.equal(outcomeD.isEcsIssued, false);

const stpToNfNtFriction = findFrictionPoint("STP/STJ", "NF/NT");
const stpToNfNtNarrative = findFinalNarrative("STP/STJ", "NF/NT");
const stpToNfNt = buildPairDeliverable({
  acquirerEnvironmentCode: "STP/STJ",
  targetEnvironmentCode: "NF/NT",
});
assert.equal(stpToNfNt.ready, true);
assert.equal(Boolean(stpToNfNtNarrative), true);
assert.equal(Boolean(stpToNfNtFriction), true);
assert.equal(Boolean(stpToNfNt.narrative), true);
assert.equal(Boolean(stpToNfNt.friction), true);
assert.equal(stpToNfNt.screen, "screen-10");
assert.equal(stpToNfNt.compatibilityScore, stpToNfNtFriction.ecs);
assert.equal(stpToNfNt.compatibilityRange, compatibilityRange(stpToNfNtFriction.ecs));
assert.ok(stpToNfNt.anchors.every((anchor) => Boolean(anchor.text) && anchor.text !== "PENDING"));

const resolveResponse = await resolvePairHandler(new Request("http://127.0.0.1/api/resolve-pair", {
  method: "POST",
  headers: { "content-type": "application/json" },
  body: JSON.stringify({
    acquirerEnvironmentCode: "NF/NT",
    targetEnvironmentCode: "NF/NT",
  }),
}));
const resolveBody = await resolveResponse.json();
assert.equal(resolveResponse.status, 200);
assert.equal(resolveBody.route, "/screen-10b-homogeneous");
assert.equal(resolveBody.screen, "screen-10b");
assertPublicText(`${resolveBody.acquirerAlias} ${resolveBody.targetAlias}`);

const heterogeneousOffer = buildPaidOffer("heterogeneous");
assert.equal(heterogeneousOffer.screen, "screen-11");
assert.equal(heterogeneousOffer.route, "/screen-11-paid-offer");
assert.equal(heterogeneousOffer.header, "What the structural-level forecast cannot tell you");
assert.equal(heterogeneousOffer.comparisonRows.length, 5);
assert.equal(heterogeneousOffer.price, "$90K\u2013$200K");
assert.ok(heterogeneousOffer.pricingBand.includes("$90K\u2013$200K"));
assert.ok(heterogeneousOffer.costAnchor.includes("213%"));
assert.ok(heterogeneousOffer.costAnchor.includes("8\u201314 months"));
assert.ok(heterogeneousOffer.ctas.primary.includes("Book a 30-minute scoping call"));
assert.ok(heterogeneousOffer.ctas.secondary.includes("Download full Final Deliverables report PDF"));

const homogeneousOffer = buildPaidOffer("homogeneous", { alias: "The Research Commons" });
assert.equal(homogeneousOffer.screen, "screen-11b");
assert.equal(homogeneousOffer.route, "/screen-11b-homogeneous-offer");
assert.equal(homogeneousOffer.header, "What the homogeneous-pair forecast cannot tell you");
assert.equal(homogeneousOffer.comparisonRows.length, 5);
assert.equal(homogeneousOffer.price, "$90K\u2013$200K");
assert.equal(homogeneousOffer.costAnchor, "");
assert.equal(homogeneousOffer.comparisonRows[0].free.includes("The Research Commons"), true);
assert.equal(homogeneousOffer.comparisonRows.some((row) => row.free.includes("{alias}") || row.paidAdds.includes("{alias}")), false);
assert.ok(homogeneousOffer.ctas.primary.includes("Book a 30-minute scoping call"));
assert.ok(homogeneousOffer.ctas.secondary.includes("Download full Final Deliverables report PDF"));

console.log("G-3 Screen 10/10b final deliverable and Screen 11/11b paid-offer smoke test passed");
