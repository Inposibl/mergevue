#!/usr/bin/env python3
"""Builds MERGEVUE_NODE_STATUS_MATRIX.json for act
MERGEVUE_VERIFIED_CURRENT_CONTROL_TREE_RECONSTRUCTION_1.CORR4 (author: Z.ai, 2026-10-08).
CORR4 of the Reconstruction-1 candidate chain — direct parent CORR3; full lineage
Reconstruction-1 -> CORR1 -> CORR2 -> CORR3 -> CORR4: corrects the CORR3 candidate that
FAILED Codex IV4 (0 BLOCKING / 1 MAJOR / 2 MINOR): IV4-M01 hidden ASCII dependency
B7.1 -> B5.19 (diagram replaced by a full-view Mermaid rendering of all 52 direct
dependencies), IV4-N02 B5.8 governance overclaim (current governance UNKNOWN; the
authoring-time STAGE_2_STARTED = NO record preserved as historical only), IV4-N03
generator/matrix provenance staleness (this header, ACT, exec fallback, input
description, matrix act/status/correctionOf/findingsCorrected, four-transition P01
accounting).
Dimensions are independent by construction; no single symbol collapses them.
The status census is COMPUTED from the node table (IV1-N02) — never hand-written.
The node-ID accounting vs Reconstruction-1, CORR1, CORR2 and CORR3 is COMPUTED from the
physical predecessor matrices (P01) — never hand-written.
File inputs (all read-only): the four predecessor matrices at their fixed act
directories, the tree candidate's s21 diagram (mermaid block + edge-manifest + declared
adjacency), and the independent human-readable edge transcription in the reconstruction
report. No network access."""
import json, os
from collections import Counter

ACT = "MERGEVUE_VERIFIED_CURRENT_CONTROL_TREE_RECONSTRUCTION_1.CORR4"
DATE = "2026-10-08"
HEAD = "ee55034f5b40dadffc59aa3b842eb9b69157df68"
# __file__ is unavailable under exec()-based in-memory reproduction (the IV2 audit
# pattern); the fallback assumes the documented execution root = repository root and
# resolves THIS act's package (CORR4) — IV4-N03.
try:
    HERE = os.path.dirname(os.path.abspath(__file__))
except NameError:
    HERE = os.path.join(os.getcwd(), "WORKBENCH", "AUDITS",
                        "MERGEVUE_VERIFIED_CURRENT_CONTROL_TREE_RECONSTRUCTION_1_CORR4")
PARENT_DIR = os.path.join(HERE, "..", "MERGEVUE_VERIFIED_CURRENT_CONTROL_TREE_RECONSTRUCTION_1")
CORR1_DIR = os.path.join(HERE, "..", "MERGEVUE_VERIFIED_CURRENT_CONTROL_TREE_RECONSTRUCTION_1_CORR1")
CORR2_DIR = os.path.join(HERE, "..", "MERGEVUE_VERIFIED_CURRENT_CONTROL_TREE_RECONSTRUCTION_1_CORR2")
CORR3_DIR = os.path.join(HERE, "..", "MERGEVUE_VERIFIED_CURRENT_CONTROL_TREE_RECONSTRUCTION_1_CORR3")

def node(nid, title, branch, g, iv, b, c, r, dep, ev, notes="", extra=None):
    n = {"id": nid, "title": title, "branch": branch,
         "governance": g, "independentVerification": iv, "gitBinding": b,
         "implementation": c, "runtime": r, "dependencies": dep,
         "evidence": ev, "notes": notes}
    if extra:
        n.update(extra)
    return n

N = []
A = N.append

# ---------------------------------------------------------------- Branch 0
A(node("B0.1", "Repository baseline & governance containers", "B0", "OWNER_ACCEPTED", "NOT_ESTABLISHED", "BOUND@"+HEAD, "N/A", "N/A", [],
       "git rev-parse HEAD == ee55034 (re-checked unchanged at CORR4 authoring time; origin/main equality carried from Reconstruction-1); governance .md sidecars recomputed OK (incl. RP Addendum 83cdd1ec..., RP Authority e52029d9... re-verified again this act); binding commits 7792c5e,cb8f890,d177386,6ad8933,d52e7f4,f9fa210,92236dc,31fd56e,d14f197,2567223,9b1545e,fcbcf86,3d7b777 verified ancestors of HEAD",
       "Tracked worktree clean; untracked paths are Workbench/candidate material"))
A(node("B0.2", "Rejected current-state tree overlay (defect record) — narrative Branch 18 maps HERE", "B0", "REJECTED_BY_OWNER", "FAIL", "REVERTED@ee55034", "N/A", "N/A", [],
       "Commits c7a83a3/21ce98f/4f75669 rejected; single revert ee55034; archive ref refs/archive/MERGEVUE_REJECTED_TREE_COMMITS_ROLLBACK_1 -> 21ce98f; HEAD tree ed3b9b6d == 3d7b777 tree",
       "Consulted only for F01-F06 regression traps; narrative Branch 18 == this node (IV1-N01)"))

# ---------------------------------------------------------------- Branch 1
A(node("B1.1", "Root Definitional Authority v1.7", "B1", "OWNER_ACCEPTED", "PASS", "BOUND@7792c5e", "COMPLETE", "NOT_ESTABLISHED", [],
       "Archive ZIP external WB 05_ARCHIVED_CANDIDATES/SUPERSEDED_DEFINITIONS/MERGEVUE_ROOT_DEFINITIONAL_CANDIDATE_v1.7.zip SHA 8decabd692e1c401a381e7484961758325b27aee89a455b8d586a98a85c4ccdf RECOMPUTED (Reconstruction-1, carried) == v2.1 pin",
       "v1.7 re-verification report file SHA debt open (v2.1 s1)"))
A(node("B1.2", "Exact nine Environment state space (R1 26/R2 14/R3 10/R4 9)", "B1", "OWNER_ACCEPTED", "PASS", "BOUND@7792c5e", "COMPLETE", "INTEGRATED_CODE_PATH", ["B1.1"],
       "src/data/environments.js; src/models/canonicalEnums.ts; src/constants/envAliases.ts", ""))
A(node("B1.3", "E9 semantic authority CORR3", "B1", "OWNER_ACCEPTED", "PASS", "BOUND@cb8f890", "N/A", "N/A", ["B1.1"],
       "docs/reference/root-definitional-e9-corr3/ 18 files incl 16_OWNER_DECISION_INTEGRATION_RECORD.md; commit subject 'bind accepted E9 semantic authority CORR3'", ""))
A(node("B1.4", "CASE-3.4 documentary contract v1.3", "B1", "ACCEPTED_BY_OWNER_DESIGNATED_USE", "PASS", "BOUND@7792c5e", "N/A", "N/A", [],
       "docs/reference/root-definitional-v1.7/contract/CASE-3.4_CONTRACT_v1.3.md SHA dae8143899cd4fb7e406b4b410e9730a6f8bf7853989f3ef9757edeec293ae39 RECOMPUTED (Reconstruction-1, carried) == v2.1 pin",
       "Separate Owner-acceptance record = documentation debt (v2.1 s4)"))
A(node("B1.5", "Root source-fidelity delta (13-edge topology, tier labels)", "B1", "CANDIDATE", "NOT_RUN", "N/A", "ABSENT", "ABSENT", [],
       "Control Tree v2.1 s1 ROOT SOURCE-FIDELITY DELTA", "Unchanged from v2.1"))

# ---------------------------------------------------------------- Branch 2
A(node("B2.1", "Epistemic / safety governance enforcement", "B2", "OWNER_ACCEPTED", "PASS", "BOUND@7792c5e", "PARTIAL", "OFFLINE_VALIDATED_ONLY", [],
       "MERGEVUE_CAUSALITY_PROOF_AND_AGENT_CONTROL.md; src/agent/semanticValidator.js; src/historical/errors.js failClosed; scripts/validate-md2-offline.mjs asserts environmentBinding NONE at :196/:346/:1229",
       "Production-scope runtime enforcement not independently proven"))

# ---------------------------------------------------------------- Branch 3
A(node("B3.1", "Questionnaire baseline & generated NewLogic artifacts", "B3", "OWNER_ACCEPTED", "PASS", "BOUND", "COMPLETE", "INTEGRATED_CODE_PATH", [],
       "src/generated/newlogic/*.json regenerated by scripts/export_newlogic_json.py from 'NewLogic 03.05.2026/*.xlsx'; src/data/* thin adapters", ""))
A(node("B3.2", "Evidence scoring / contradiction / dual-respondent logic", "B3", "OWNER_ACCEPTED", "PASS", "BOUND", "COMPLETE", "INTEGRATED_CODE_PATH", ["B3.1"],
       "src/flow/layeredEvidenceScoring.js:657; src/agent/productionInterpretationComposition.js:153-185; api/score-2a.ts; api/score-2b.ts; api/production-interpretation.ts:209-236", ""))
A(node("B3.3", "Candidate-pair determination (Acquirer-respondent hypothesis candidates)", "B3", "OWNER_ACCEPTED", "PASS", "BOUND", "PARTIAL", "INTEGRATED_CODE_PATH", ["B3.2"],
       "src/flow/candidatePairSelector.js:36-41 REACHABLE_CANDIDATE_PAIRS = 4; :45-51 VALID_PAIR_WHITELIST = 5; :29-30 SOURCE_MODULE='acquirerEnvironment'/RESPONDENT_SLOT='R1' (citation corrected per IV2-N01; CORR1 wrongly cited :13-14); :662 NO_LAWFUL_PAIR, :673 PAIR_SELECTION_AMBIGUOUS, :685 SELECTED (fail-closed match over Acquirer positive codes) — line refs re-verified against baseline (CORR3)",
       "IV1-M04: the 4 reachable pairs are environment-pair HYPOTHESIS CANDIDATES reachable from one Acquirer-side respondent's R1 answers — NOT a model of the universe of M&A transaction pairs; the deliverable layer renders any normalized pair. Dynamic pair determination not operational"))

# ---------------------------------------------------------------- Branch 4
A(node("B4.1", "Documentary authority chain CASE-1/CASE-2/CASE-3.4.CORR3", "B4", "OWNER_ACCEPTED", "PASS", "BOUND@7792c5e", "N/A", "N/A", [],
       "Control Tree v2.1 s4", ""))
A(node("B4.2", "Level-1 Mode-D Slice-1 (recent SEC filing metadata)", "B4", "OWNER_ACCEPTED", "PASS", "BOUND", "COMPLETE", "INTEGRATED_CODE_PATH", ["B1.4"],
       "src/server/_level1ModeDSlice1.ts (1004 ln; SHA-bound reference data :31; RC1-RC5 :264; gap states :38-48; forbidden-output guard :993); src/server/_secResearch.ts live data.sec.gov retrieval :208-294, UA-gated 503 :624-630",
       "Live-SEC runtime from deployment environment NOT_ESTABLISHED"))
A(node("B4.3", "Historical documentary ingress — offline semantic-control foundation implemented; automated archive collector + production ingress ABSENT", "B4", "NOT_REACHED", "PASS", "BOUND", "PARTIAL", "OFFLINE_VALIDATED_ONLY", [],
       "src/historical/ tracked module set: index.js exports 19+ submodules; retrieval.js 546 ln (authorized-retrieval lifecycle: authorizeRetrieval/executeRetrieval/retrievalCompleted/rejectLateAuthorization :540/rejectFreeFormExecution :544); hmir.js 1810 ln (compileDemandBlueprint :425, freezeManifest :513, assembleFactualBaseline :656, independentPreSealVerification :1563, acceptOwnerFactualSeal :1675, compileSemanticBindings :1744, rejectEnvironmentInstantiation :1800); errors.js fail-closed; canonical.js/identity.js. Importers = ONLY scripts/validate-md2-offline.mjs + scripts/validate-historical-ingress-offline.mjs (grep); 0 network calls in src/historical/ (grep). Validator 215/215 PASS (re-run CORR2; src/historical/ unchanged since — baseline tree identical)",
       "IV1-M08: implemented offline retrieval-governance, manifest-freeze, factual-baseline and semantic-control foundations are represented as implemented; what is ABSENT is an automated external-archive collector and production (served-path) ingress wiring — neither claimed"))

# ---------------------------------------------------------------- Branch 5
A(node("B5.1", "Nine-case corpus membership & geometry (9 cases / 18 sides)", "B5", "OWNER_ACCEPTED", "NOT_ESTABLISHED", "BOUND@d177386", "N/A", "N/A", [],
       "docs/governance/MERGEVUE_CALIBRATION_9_CASE_CORPUS_ADDENDUM_2026-09-25.md SHA fb602181... sidecar OK; Owner acceptance verbatim in outcome-IV binding 6ad8933 sAmazon; disney-pixar PRESERVED+EXCLUDED",
       "IV of addendum bytes themselves NOT_ESTABLISHED"))
A(node("B5.2", "Case-level blind-cycle completion (all 9 active cases)", "B5", "OWNER_ACCEPTED", "PASS", "BOUND@6ad8933", "N/A", "N/A", ["B5.1"],
       "Outcome-IV Durable Authority Binding 568b5164 (commit 6ad8933): Cases 2/3/4 IV1 Grok PASS (Owner-accepted, identities acc282d1/91da4fc8/4f6a4c00); Amazon IV1 Grok PASS 0/0/0 (f7c446d4); ALL_9_ACTIVE_CASES...=YES",
       "Per-case identities not re-hashed this act (carried authority, HOLD-4)"))
A(node("B5.3", "Prediction seals (nine packages, sealed pre-outcome)", "B5", "OWNER_ACCEPTED", "PASS", "N/A", "N/A", "N/A", ["B5.2"],
       "Physical per-case dirs e.g. WB 02_CASE_RESEARCH/daimler-chrysler/PRE_OUTCOME_ANALYSIS/; POST-10 PAEC authority chain",
       "Case-seal package identities not re-verified this act (carried authority, HOLD-4). Product-side seal preimage semantics = B8.3"))
A(node("B5.4", "Disney-Pixar preserved historical case", "B5", "OWNER_ACCEPTED", "PASS", "BOUND@f9fa210", "N/A", "N/A", [],
       "docs/governance/historical-corpus/factual-seals/09_DISNEY_PIXAR_FACTUAL_SEAL.md + sidecar OK (recomputed Reconstruction-1, carried); factual package 6fa95c27...; EXCLUDED_FROM_METHODOLOGY_CALIBRATION_CORPUS", ""))
A(node("B5.5", "Nine-case input-freeze candidate", "B5", "CANDIDATE", "NOT_ESTABLISHED", "BOUND@d52e7f4", "N/A", "N/A", ["B5.2"],
       "docs/governance/historical-corpus/MERGEVUE_POST_10_CALIBRATION_9_CASE_CORPUS_FREEZE_2026-09-25.md SHA da9b9de2ab9c49cf98100c008eb980225cf8595b2873cc4eb6eb6d8e9733cbd6 (re-verified this act == sidecar); own bytes READY_FOR_INDEPENDENT_VERIFICATION / OWNER_ACCEPTED: NO / CORPUS_FREEZE_FINAL: NO",
       "IV1-M07: IV dimension = NOT_ESTABLISHED, not NOT_RUN — a candidate-specific IV report and any Owner acceptance were SEARCHED for (repo, Workbench, Git history; by name, SHA, status tokens; re-searched CORR2/CORR3, negative) and NOT FOUND; absence-of-record is a missing-evidence marker, never converted into NOT_RUN, rejection, or closure. Binding d52e7f4 precedes the candidate's declared IV->acceptance lifecycle (anomaly recorded, unresolved). INPUT freeze — distinct from the B5.10 candidate determination-RULE freeze"))
A(node("B5.6", "Stage-1 transfer-integrity correction campaign (DC-001..019)", "B5", "OWNER_ACCEPTED", "PASS", "N/A", "N/A", "N/A", ["B5.1"],
       "905/905 facts; 19/19 corrected; IV1 Codex PASS per Owner pins; campaign SHA c5a8e7ef... and consolidation b99d7f17... recomputed by the Stage-1 successor act. Owner acceptance exact locus: successor-binding doc s2.2 'the Owner ACCEPTED POST-10-CALIBRATION-STAGE1-TRANSFER-INTEGRITY-CORRECTION-CAMPAIGN-1 as independently verified under ...IV1 = PASS' (bound bytes)",
       "HOLD-2 stands: the IV1 report's own physical bytes were not located; pinned SHA 8eb434e4... is lineage-only. Distinct instrument from the B5.7 successor-binding candidate (kept separate per IV2-P03)"))
# IV2-P03: the B5.7 lifecycle is stated four ways — authoring-time candidate wording (bound
# bytes), physical Git binding, later AGENT-REPORTED closure assertions, and the currently
# verified lifecycle (NOT_ESTABLISHED). No current-closure claim is made; the campaign/
# candidate conflation explanation is labeled an INFERENCE.
A(node("B5.7", "Stage-1 factual-authority successor binding (candidate instrument)", "B5", "CANDIDATE", "NOT_ESTABLISHED", "BOUND@92236dc", "N/A", "N/A", ["B5.6"],
       "docs/governance/historical-corpus/MERGEVUE_STAGE1_FACTUAL_AUTHORITY_SUCCESSOR_BINDING_AND_CLOSURE_2026-09-25.md SHA be9593a767edfa1d61787458db3de1c7034d49ac60b65fe0ce8e11402fe70237 (re-verified this act == sidecar); terminal block :404-413 STAGE1_FACTUAL_AUTHORITY_SUCCESSOR_BINDING_CANDIDATE_COMPLETE / STAGE1_CLOSURE_READY=YES / STAGE1_CLOSED=NO / 'Independent IV of this candidate is the next act'; nine successor identities s10 (4 corrected generations)",
       "IV2-P03 lifecycle, four distinct layers: (1) AUTHORING-TIME CANDIDATE WORDING: the bound bytes declare STAGE1_CLOSED=NO — a candidate statement as of 2026-09-25, immutable; (2) PHYSICAL GIT BINDING: bound at 92236dc (sidecar-verified); (3) LATER AGENT-REPORTED CLOSURE ASSERTIONS (preserved, never authority): WORKBENCH/AUDITS/2026-10-07_REALITY_AUDIT/MERGEVUE_REALITY_AUDIT_2026-10-07.md :28-30 (SHA 085bbbd1aca7...552cf, re-verified CORR3) asserts 'Stage-1 Factual Authority Successor Binding is Fully Accepted and Git-Closed' incl. 'independently verified all 19 corrections (IV1 = PASS by Codex), and received Owner acceptance'; ALSO external WB DOWNLOADS/MERGEVUE_STAGE2_GROK_4.7_ALL_RESULTS_2026-09-26.md :59 asserts 'Current Owner instruction controls: Stage 1 is closed; successor factual authority is Owner-accepted, independently verified, and Git-bound local and remote' — the referenced Owner instruction itself was NOT located as a physical artifact (searched); (4) CURRENTLY VERIFIED LIFECYCLE: NOT_ESTABLISHED — no candidate-specific IV report and no exact Owner-acceptance record was located (structured searches CORR2/CORR3: repo, external WB incl. 01_AGENT_REPORTS/06_GOVERNANCE_INPUTS/04_PENDING_GIT_REVIEW, git log 92236dc..HEAD; STAGE1_CLOSED=YES occurs in NO artifact; the Owner-accepted PILOT-VERSION-LOCK (B17.1) treats the binding as 'substrate authority' without any candidate IV/acceptance record). CURRENT STAGE-1 CLOSURE: NOT_ESTABLISHED. EXACT-BYTE OWNER ACCEPTANCE OF THE CANDIDATE: NOT_ESTABLISHED. The claim that the Reality Audit 'conflates' the accepted correction campaign (B5.6) with this candidate instrument is an INFERENCE (plausible, not independently established) — the two instruments are factually distinct, but the assertion's internal reasoning is not evidence. Binding 92236dc precedes the declared lifecycle (anomaly, same class as B5.5)"))
# IV4-N02: B5.8's current governance is UNKNOWN. The CORR3 basis for current NOT_REACHED
# (authoring-time STAGE_2_STARTED = NO + negative searches + unresolved predecessors) is
# WITHDRAWN as a current-governance derivation: an authoring-time statement fixes the
# record as of its authoring date only and never establishes current authorization,
# execution, or governance status on a later date. The historical statement is preserved
# with date and source; IV stays NOT_ESTABLISHED; implementation/runtime ABSENT stay
# scoped to tracked-code inspection; a structured five-layer lifecycleDisambiguation
# distinguishes (i) authoring-time state, (ii) current authorization/governance,
# (iii) current execution evidence, (iv) current IV evidence, (v) eligibility to proceed.
# A stage blocked from authorized forward progression is not thereby proven never executed.
# No OWNER_AUTHORIZED / OWNER_ACCEPTED / completed-execution inference is made.
A(node("B5.8", "Mechanism normalization (18 sides, outcome-hidden)", "B5", "UNKNOWN", "NOT_ESTABLISHED", "N/A", "ABSENT", "ABSENT", ["B5.7", "B5.5", "B17.5"],
       "Recalibration Track s28 'outcome-hidden mechanism normalization'. IV4-N02 CORRECTED REPRESENTATION — five distinct layers, no layer implies another: (i) HISTORICAL STAGE STATE AT DOCUMENT AUTHORING: bound successor-doc bytes record STAGE_2_STARTED = NO (:399; SHA be9593a7...0237, bound 92236dc, dated 2026-09-25) — a line in that act's own authoring-time terminal checklist; fixes the record as of 2026-09-25 ONLY, does not establish current status on 2026-10-08. (ii) CURRENT AUTHORIZATION / GOVERNANCE: UNKNOWN — no independently sufficient current Owner/governance evidence demonstrating a more specific state was located; the former current NOT_REACHED claim is WITHDRAWN (derived from the authoring-time record, negative file searches, and unresolved predecessors — none establishes current governance). (iii) CURRENT EXECUTION EVIDENCE: NOT_ESTABLISHED (IV3-N02 basis carried) — act-specific execution record searched (act-name filenames; content tokens; the scoped *MECHANISM* census: 22 uppercase / 26 case-insensitive matches, ALL Stage-1 per-case research products, re-census re-run CORR4 with identical counts) and NOT FOUND; absence of record is a missing-evidence marker, never proof the act never ran. (iv) CURRENT INDEPENDENT-VERIFICATION EVIDENCE: NOT_ESTABLISHED. (v) ELIGIBILITY TO PROCEED: not cleared for authorized forward progression under the accepted controlling sequence while the blocking predecessors B5.5/B5.7/B17.5 remain lifecycle-unresolved/unbound — a forward-progression statement only; a stage blocked from authorized future progression is not thereby proven never to have executed. C:ABSENT basis (tracked-code scope): grep normalizeMechanism|mechanismNormal|normalizationStage|outcomeHidden = 0 hits in src/ api/ scripts/ (re-run CORR4); R:ABSENT on the same code-level scope",
       "First Stage-2 analytical stage under the controlling track order. No OWNER_AUTHORIZED, OWNER_ACCEPTED, or completed-execution inference is made",
       extra={"lifecycleDisambiguation": {
           "mandatedBy": "IV4-N02",
           "historicalStageStateAtAuthoring": {
               "statement": "STAGE_2_STARTED = NO",
               "source": "docs/governance/historical-corpus/MERGEVUE_STAGE1_FACTUAL_AUTHORITY_SUCCESSOR_BINDING_AND_CLOSURE_2026-09-25.md :399",
               "sourceSha256": "be9593a767edfa1d61787458db3de1c7034d49ac60b65fe0ce8e11402fe70237",
               "boundAt": "92236dc",
               "authoringDate": "2026-09-25",
               "meaning": "authoring-time record of the successor-binding act's own terminal checklist; establishes that date's recorded state only"},
           "currentAuthorizationGovernance": "UNKNOWN",
           "currentExecutionEvidence": "NOT_ESTABLISHED",
           "currentIndependentVerificationEvidence": "NOT_ESTABLISHED",
           "eligibilityToProceed": "NOT_CLEARED_FOR_AUTHORIZED_FORWARD_PROGRESSION (blocking predecessors B5.5/B5.7/B17.5 lifecycle-unresolved/unbound) — forward-progression statement, not a non-execution claim",
           "formerClaimWithdrawn": "current governance NOT_REACHED (CORR3) — derived from the authoring-time record, negative file searches, and unresolved predecessors"}}))
# IV2-M01: the calibration chain below restores the controlling sequence of the
# accepted Recalibration Track s12/s21/s22/s23/s24/s28 + Control Tree v2.1 s5.8/s5.9/s7:
# dual coding -> candidate contract construction -> candidate rule freeze -> frozen blind
# replay -> independent reproduction -> outcome-based falsification -> LOCO -> realized
# coverage + T10/MD verdicts -> OWNER ACCEPTS -> final calibrated replay -> full-corpus
# independent verification. LOCO follows falsification (not part of B5.9); frozen blind
# replay and independent reproduction are explicit stages; v2.1 s5.8 'YES -> freeze
# supported methodology' is the OUTCOME branch of the falsification gate, not the basis
# of the candidate freeze.
A(node("B5.9", "Independent dual coding -> candidate Historical Environment Determination Contract construction", "B5", "NOT_REACHED", "NOT_RUN", "N/A", "ABSENT", "ABSENT", ["B5.8"],
       "Recalibration Track s28 ('independent dual coding' -> 'candidate Historical Environment Determination Contract'); 9-case addendum s4 steps 4-6. CANDIDATE HEDC derivation happens HERE as a methodology act feeding falsifiable tests — distinct from the post-acceptance deterministic classifier implementation (B6.4, IV2-M01)",
       "Produces the candidate determination contract; no LOCO at this stage (LOCO = B5.17, after falsification per the controlling track). G value = lifecycle position under the accepted controlling sequence (IV4-N02 reading rule), not an execution-history claim"))
A(node("B5.10", "Candidate determination-rule (HEDC contract) freeze — physical freeze before replay", "B5", "NOT_REACHED", "NOT_RUN", "N/A", "ABSENT", "ABSENT", ["B5.9"],
       "Recalibration Track s12 (:377-401): 'The candidate determination contract must be physically frozen before corpus replay'; per-case adjust-look-adjust workflow forbidden; same rule version applied to all sides in that replay",
       "IV2-M01 correction: this candidate freeze is grounded in track s12, NOT in v2.1 s5.8's 'YES -> freeze supported methodology' — that YES branch is the OUTCOME of the falsification gate (B5.11), feeding the Owner decision (B7.1); CORR1's citation reversed the passage"))
A(node("B5.11", "Outcome-based behavioral & program falsification gate (v2.1 s5.8; track s28)", "B5", "NOT_REACHED", "NOT_RUN", "N/A", "ABSENT", "ABSENT", ["B5.16"],
       "Control Tree v2.1 s5.8 criteria (inference improvement, pair discrimination, prediction usefulness, reproducibility, baselines, complexity cost — YES / PARTIAL / NO); Recalibration Track s28 orders it AFTER frozen blind replay + independent reproduction; s25 Layer 3 behavioral validity",
       "Runs on the FROZEN candidate rules (post B5.10->B5.15->B5.16). v2.1 s5.8 outcome branches: YES -> freeze supported methodology; PARTIAL -> freeze supported portions + explicit limitations; NO -> reject/narrow/redesign — outcomes feed B7.1, not a pre-testing freeze"))
A(node("B5.12", "Final calibrated replay (v2.1 s5.9; track s22, after Owner acceptance)", "B5", "NOT_REACHED", "NOT_RUN", "N/A", "ABSENT", "ABSENT", ["B7.1"],
       "Control Tree v2.1 s5.9 ('10-case' wording qualified by the 9-case addendum): final accepted methodology generation frozen, all materially affected earlier cases replayed, same rules across the published set, historical deltas documented; Recalibration Track s22 (:662-687): run ONLY after Owner acceptance of the final determination contract; same rule for all sides; no per-case manual adjustment",
       "Ordered AFTER Owner methodology acceptance (B7.1) per v2.1 s5.9 and track s21->s22"))
A(node("B5.13", "Nine internal historical reports (method-generated, software-produced)", "B5", "NOT_REACHED", "NOT_RUN", "N/A", "ABSENT", "ABSENT", ["B5.19", "B6.4", "B9.1"],
       "IV2-P02 prerequisites: software-generated reports require (a) the verified replay under the accepted contract (B5.19; track s23-24 gate downstream use of the replay), (b) accepted HEDC derivation + verified deterministic classifier implementation (B6.4), and (c) verified analytical-core implementation with causal-integration proof (B9.1) — v2.1 s7 conversion chain (:464-483: schemas/deterministic functions -> deterministic implementation -> independent implementation verification -> causal integration proof). Completed replay alone does NOT enable software-generated reports (MD-2 still returns environmentBinding='NONE', md2.js:963, re-read CORR4)",
       "Distinct from Owner-accepted case-level research completion (B5.2)"))
A(node("B5.14", "Public case studies publication-ready + disclosure-contract compliance", "B5", "NOT_REACHED", "NOT_RUN", "N/A", "ABSENT", "ABSENT", ["B5.19"],
       "Disclosure contract authority 6bb36762... OWNER-ACCEPTED/FROZEN (sidecar OK; ten-case wording qualified by the 9-case addendum); v2.1 s10.3 item 'case studies publication-ready'; Recalibration Track s23/s24/s27: public case-study authority flows only from the Final Calibrated Replay AFTER its independent full-corpus verification",
       "Legacy 10-fixture case-study SCREENS exist in code (B15.2) — that is not this node's publication-ready accepted proof content"))
# IV2-M01: three new pre-acceptance stages (frozen blind replay, independent reproduction,
# LOCO) + coverage/verdict stage, per the controlling Recalibration Track sequence.
A(node("B5.15", "Frozen blind replay of all organizational sides (candidate contract, outcome-hidden)", "B5", "NOT_REACHED", "NOT_RUN", "N/A", "ABSENT", "ABSENT", ["B5.10"],
       "Recalibration Track s13 (:405-427): after rule freeze, the SAME determination rule runs over all sealed pre-T0 organizational sides; inputs = sealed facts, normalized mechanisms, fixed scope, frozen determination contract; excluded = outcome knowledge, prior final Environment labels, prior pair result, ECS, friction, public narrative, later reputation; full determination record per side; track s28",
       "'20 organizational sides' wording qualified by the 9-case addendum (18 sides, Disney excluded). Track s12 forbids adjusting the rule between cases"))
A(node("B5.16", "Independent reproduction of the frozen blind replay", "B5", "NOT_REACHED", "NOT_RUN", "N/A", "ABSENT", "ABSENT", ["B5.15"],
       "Recalibration Track s28 ('blind replay of all 20 organizational sides' -> 'independent reproduction'); s25 Layer 2 classification reproducibility (same sealed facts + same frozen rule => same determination, strongest alternative, falsifier, confidence, NOT DETERMINABLE); s30 step 7",
       "Distinct verifier stage between frozen replay and falsification — absent as an explicit node in CORR1 (IV2-M01)"))
A(node("B5.17", "Leave-one-case-out (LOCO) stability testing", "B5", "NOT_REACHED", "NOT_RUN", "N/A", "ABSENT", "ABSENT", ["B5.11"],
       "Recalibration Track s28 ('outcome-based falsification' -> 'leave-one-case-out stability testing'); s30 step 9 'test empirical tuning for leave-one-case-out stability'",
       "IV2-M01: LOCO is a DISTINCT post-falsification stage — CORR1 embedded it inside B5.9 before the candidate freeze, reversing the accepted order"))
A(node("B5.18", "Realized-coverage analysis vs frozen predeclared map + separate T10 / MD-1…MD-6 verdicts", "B5", "NOT_REACHED", "NOT_RUN", "N/A", "ABSENT", "ABSENT", ["B5.17"],
       "Recalibration Track s28 ('realized coverage vs frozen predeclared coverage' -> 'separate T10 / MD-1…MD-6 verdicts'); s29: closing T10 or MD-1…MD-6 automatically is forbidden; s30 steps 10-11; s21 lists T10/MD verdict preparation among the preconditions of Owner acceptance",
       "Immediately precedes the Owner methodology-acceptance gate (B7.1)"))
A(node("B5.19", "Full-corpus independent verification of the final calibrated replay", "B5", "NOT_REACHED", "NOT_RUN", "N/A", "ABSENT", "ABSENT", ["B5.12"],
       "Recalibration Track s23 (:690-710): the Final Calibrated Replay must undergo independent full-corpus verification (exact input identities, exact contract version, exact side-output set, same rule everywhere, no outcome leakage, correct strongest alternatives/falsifiers/confidence/NOT-DETERMINABLE handling, correct pair construction, no hidden case-specific override, reproducibility); 'Only after this gate may the project treat the replay as the final calibrated historical authority'; s24: downstream calculation only after contract + replay accepted AND independently verified",
       "IV2-M01: explicit post-replay verification gate — absent as a node in CORR1; downstream nodes (B5.13/B5.14/B16.3) hang off this gate, not off raw B5.12. IV4-M01: this gate's ONLY incoming edge in the s21 diagram is B5.12 -> B5.19 (no B7.1 -> B5.19 shortcut)"))

# ---------------------------------------------------------------- Branch 6
A(node("B6.1", "OD-MS-9 historical Environment route design", "B6", "CANDIDATE", "NOT_RUN", "N/A", "N/A", "N/A", [],
       "Control Tree v2.1 s6: owner-authorized direction, candidate design complete; full methodology audit NOT_RUN", ""))
A(node("B6.2", "MD-2 structural-inference kernel (offline validator)", "B6", "OWNER_ACCEPTED", "PASS", "BOUND", "COMPLETE", "OFFLINE_VALIDATED_ONLY", ["B6.1"],
       "src/historical/md2.js:963 environmentBinding='NONE' DIRECTLY VERIFIED (re-read this act, CORR4); c1-c7 NOT_ESTABLISHABLE :969-977; imported only by validators; pipeline.js:196-198 rejects environment instantiation", ""))
A(node("B6.3", "MD-2 Operator v0.1 CORR6 (candidate methodology doc)", "B6", "CANDIDATE", "NOT_ESTABLISHED", "UNTRACKED", "N/A", "N/A", [],
       "docs/MD-2_HISTORICAL_ENVIRONMENT_INFERENCE_OPERATOR_v0.1_CORR6.md SHA 02b769126c3b6477fb93b29652d2866da8e86473a08f3d871dc052d00b50f5ba (re-verified this act, CORR4); git ls-files fails; NO sidecar",
       "Local candidate evidence only — not bound governance authority"))
# IV2-M01: B6.4 split — candidate HEDC derivation (methodology act) lives in the calibration
# chain (B5.9); THIS node is the post-acceptance deterministic implementation chain.
A(node("B6.4", "HEDC deterministic classifier implementation + independent implementation verification + causal-integration proof (post-acceptance; v2.1 s7)", "B6", "NOT_REACHED", "NOT_RUN", "N/A", "ABSENT", "ABSENT", ["B7.1", "B6.1"],
       "v2.1 s7/:464 conversion chain: after METHOD FREEZE DECISION, accepted methodology is converted into schemas/deterministic functions/relation tables/rules/validators, then deterministic implementation -> independent implementation verification -> causal integration proof. CORR1's combined 'derivation + classifier implementation' wording corrected (IV2-M01): candidate HEDC derivation for falsifiable tests = B5.9 (pre-acceptance); this node = post-acceptance production implementation only. 0 code hits for HEDC in src/ api/ scripts/ (re-grepped CORR3; src/ api/ scripts/ unchanged since — baseline tree identical)",
       "Ordered after Owner methodology acceptance; blocked until then"))

# ---------------------------------------------------------------- Branch 7
A(node("B7.1", "Owner methodology acceptance — post-calibration METHOD FREEZE DECISION (v2.1 s7; track s21)", "B7", "NOT_REACHED", "NOT_RUN", "N/A", "ABSENT", "ABSENT", ["B5.18"],
       "Control Tree v2.1 s7: FULL FREEZE / PARTIAL-TIERED FREEZE / REJECT-REDESIGN; governing rule: the multi-agent research process must not become the production engine; Recalibration Track s21 (:639-658) 'OWNER ACCEPTS FINAL DETERMINATION CONTRACT' — only Owner may accept; no analyst/auditor/coder/verifier/Orchestrator may self-promote the candidate into methodological authority; v2.1 s5.8 gate outcomes map onto the s7 branches (YES->FULL, PARTIAL->PARTIAL/TIERED, NO->REJECT/REDESIGN)",
       "IV1-M01/IV2-M01: distinct Owner gate after falsification (B5.11) + LOCO (B5.17) + coverage/verdicts (B5.18); B6.4 and B9.1 hang off it; final replay (B5.12) follows it. IV4-M01: B5.19 is NOT a direct child of this gate in the s21 diagram — the path is B7.1 -> B5.12 -> B5.19"))

# ---------------------------------------------------------------- Branch 8
A(node("B8.1", "ECS semantics — computed on the homogeneous branch; stored lookup on the heterogeneous branch", "B8", "OWNER_ACCEPTED", "PASS", "BOUND", "COMPLETE", "INTEGRATED_CODE_PATH", ["B3.3"],
       "HOMOGENEOUS (acquirerCode == targetCode): canonicalStructuralEcs COMPUTES ECS = 100 x (1 - C/34) over the static 17x9 RESOURCE_PRIORITY_MATRIX (finalDeliverableFlow.js:378-404; homogeneous branch condition :886 (IV3-N01; CORR2 wrongly cited :879); ECS computed at :893; same-environment C=0 -> ECS=100 mechanical, governed-parameter comment 'no transaction literal' :344-352, OD-RMP3 chain). HETEROGENEOUS: ECS is a STORED lookup score = friction?.ecs ?? narrative?.ecs at :955 (citation corrected per IV2-N01; CORR1 cited :933-935) from NARRATIVE_BY_PAIR/FRICTION_BY_PAIR (:309-310; finders :330/:334) — :886/:893/:955 re-read against baseline this act (CORR4)",
       "IV1-M04: computed vs stored ECS distinguished; RESOURCE_PRIORITY_MATRIX static 17x9 (:84) and static friction facts preserved (B8.2)"))
A(node("B8.2", "Friction static lookup (72 generated pair narratives)", "B8", "OWNER_ACCEPTED", "PASS", "BOUND", "COMPLETE", "INTEGRATED_CODE_PATH", ["B8.1"],
       "finalDeliverableFlow.js:313,334-336 FRICTION_BY_PAIR; src/data/finalDeliverableData.js generated (do-not-edit)", "Not computed; static table — preserved unchanged per IV1-M04"))
A(node("B8.3", "Prediction sealing (in-memory, no generation)", "B8", "OWNER_ACCEPTED", "PASS", "BOUND", "PARTIAL", "INTEGRATED_CODE_PATH", [],
       "src/server/_predictionLedger.ts: seal hash = sha256 of canonical JSON of EXACTLY {acquirerEnvironmentCode, targetEnvironmentCode, anchors[3], sealedAt} (canonicalSealString :123-130, buildPredictionSealHash :132-134, sealVersion 'sha256-v1' :209); prediction1/2/3 and falsificationCondition are REQUIRED-PRESENCE-validated (:89-106) and stored in the ledger entry + audit rows (:140-158) but are NOT part of the seal preimage; in-memory globalThis ledger (:67-78); api/seal-prediction.ts POST -> 201/400/500",
       "IV1-M05: seal coverage stated exactly — prediction texts and the falsification condition are OUTSIDE the hashed preimage. No code modification made or authorized"))

# ---------------------------------------------------------------- Branch 9
A(node("B9.1", "Target hard-coded analytical core (evidence-side)", "B9", "NOT_REACHED", "NOT_RUN", "N/A", "ABSENT", "ABSENT", ["B7.1"],
       "Control Tree v2.1 s9 checklist remains accurate; no evidence-ingestion/env-determination/scenario/prediction-generation code; s7 requires independent implementation verification + causal-integration proof for the converted core (P02 ancestry for B5.13)",
       "Parallel child of the Owner methodology-acceptance gate alongside B6.4 (no B6.4->B9.1 edge; graph reconciliation per IV2-P02)"))

# ---------------------------------------------------------------- Branch 10
A(node("B10.1", "FREE 12-block canonical report registry + Mode-D projection", "B10", "OWNER_ACCEPTED", "PASS", "BOUND", "COMPLETE", "INTEGRATED_CODE_PATH", ["B4.2"],
       "src/reporting/mergevueCanonicalPublicReportRegistry.js:12-25; _level1ModeDPublicReportProjection.ts Block1 LIMITED :447-450, Blocks2-8 INSUFFICIENT_PUBLIC_EVIDENCE :461-467 (literal :258), Block9 NOT_APPLICABLE :470, Block10 LIMITED :480, Blocks11-12 AVAILABLE :503/:514, 12-block assert :385 — DIRECTLY VERIFIED (Reconstruction-1; carried)",
       "Bounded evidence-gap states, not populated analytics; P04: these are EVIDENCE-AVAILABILITY states produced without any tier/entitlement input — NOT demonstrated commercial entitlement-ceiling mechanics (see B13.1); availability statuses vs entitlement ceilings distinguished in B13.1/tree s20"))
A(node("B10.2", "Public flow screens & API wiring", "B10", "OWNER_ACCEPTED", "NOT_ESTABLISHED", "BOUND", "COMPLETE", "INTEGRATED_CODE_PATH", ["B10.1"],
       "src/routes/routeModel.js:53-78; src/screens/public/*; api/resolve-company.ts; api/start-public-research.ts; vercel.json + netlify fallbacks", "Deployed runtime NOT_ESTABLISHED"))
A(node("B10.3", "FREE Product-Ready residual items (release alignment, leak removal, e2e validation, UX, deploy package, publication-ready case-study proof content)", "B10", "NOT_REACHED", "NOT_RUN", "N/A", "ABSENT", "ABSENT", ["B10.2"],
       "Control Tree v2.1 s10.2 unchecked items remain; item 'public case-study route / template' is satisfied AS CODE by the existing /case-studies routes+renderers (B15.2) — the residual is the publication-ready nine-case, disclosure-aligned proof CONTENT, not the bare route (IV1-M02). P04: alignment of the implemented Mode-D emission pattern to the canonical Anonymous-FREE Blocks 7-10 LIMITED ceiling (RP Authority :213/:696) is part of FREE release alignment if the Owner directs it — not adjudicated in this act",
       "Reaching this node completes PRODUCT READY gate B16.2"))
A(node("B10.4", "Report delivery & persistence mechanisms", "B10", "CANDIDATE", "NOT_ESTABLISHED", "BOUND", "PARTIAL", "INTEGRATED_CODE_PATH", ["B10.2"],
       "REAL delivery chain wired: src/App.jsx EmailCaptureScreen submitEmailCapture (:7791-7842) POSTs /api/final-report?action=send-final-report {sessionId, authorityId, recipientEmail, firstName}, success gated on payload.status==='sent', errors surfaced; api/final-report.ts :565-666: resolveCurrentReportAuthority -> renderAuthorizedPdf (puppeteer, key-gated fail-closed) -> Resend HTTPS API POST with base64 PDF attachment + optional hidden-copy BCC -> 200 {status:'sent', provider:'resend', messageId}. Rejection paths implemented: 400 invalid-report-recipient; authorization failure; 503 email-service-not-configured; 503 report-render-unavailable; 502 email-provider-error. Companion actions: download-final-report (client :7617, server :549-560), send-final-report-hidden-copy (client :7685, server :673+). src/flow/emailCaptureFlow.js:68-116 createReportDeliveryRecord is a CLIENT-SIDE session annotation written optimistically at submit and re-attached post-confirmation with provider/messageId — it is not the delivery mechanism. Persistence: _sessionLedger.ts:170-190 Upstash KV or throw; prediction ledger in-memory; ReportDocument.tsx (1205 ln) orphaned (no importer)",
       "IV1-M03: delivery is NOT 'all simulated' — the full authorized-PDF->Resend chain with rejection paths is implemented and wired into the served path; DEPLOYED delivery success remains NOT_ESTABLISHED (HOLD-5). Recorded observations are not adjudicated defects"))

# ---------------------------------------------------------------- Branch 11
A(node("B11.1", "Paid 19-block report & paid diagnostic surface", "B11", "OWNER_ACCEPTED_ARCHITECTURE_ONLY", "NOT_RUN", "N/A", "ABSENT", "ABSENT", ["B9.1"],
       "RP Authority v1.0 e52029d9...; grep-verified: no 19-block builder/paid report code; marketing copy only (finalDeliverableData.js:1752-1760, PaidOfferScreen)", ""))

# ---------------------------------------------------------------- Branch 12
A(node("B12.1", "Anonymous/Temporarily FREE version semantics", "B12", "OWNER_ACCEPTED", "NOT_RUN", "BOUND", "PARTIAL", "INTEGRATED_CODE_PATH", ["B10.1"],
       "RP Authority s7/s12; anonymous FREE surface = Mode-D public report; registered-Expanded-FREE deepening and market assembly NOT_DONE",
       "P04: RP Authority s7.1 requires Anonymous FREE to display Blocks 7-10 as LIMITED (:213) and s15.7 (:696) keeps those LIMITED mechanics 'exactly as accepted' — the implemented Mode-D emission pattern (B10.1) is an evidence-availability projection; its alignment to the canonical ceiling is NOT_ESTABLISHED (not adjudicated here)"))

# ---------------------------------------------------------------- Branch 13
# IV2-P04: withdrawal of the entitlement-enforcement overstatement. The Mode-D projection
# consumes NO tier/entitlement input and its output is invariant to hypothesized tier fields
# (Codex IV2 independent in-memory test, R-class). What is implemented and retained: block
# registry, bounded availability states, 12-block assert, leak guards. What is NOT
# established: tier-sensitive RP-5 display-ceiling enforcement.
A(node("B13.1", "Paid vs FREE epistemic boundary (report-product controls; RP-5 ceiling enforcement NOT ESTABLISHED)", "B13", "OWNER_ACCEPTED", "NOT_RUN", "BOUND", "PARTIAL", "INTEGRATED_CODE_PATH", ["B10.1"],
       "RP Authority s10/s15 (:213-215 'LIMITED is a product display / claim ceiling, not a false statement that evidence is absent'; :661 ceiling never creates a Decision Gap; :696 Anonymous FREE LIMITED mechanics for Blocks 7-10 'remain exactly as accepted'). IMPLEMENTED + RETAINED on the Mode-D surface: block registry (:12-25), bounded availability states (B10.1), 12-block assert (:385), absence-claim/ECS leak guards (:380-386), safe-assert. IV2-P04 CORRECTION: the projection (entry projectLevel1ToPublicReport(level1Input) :402) consumes NO tier/entitlement input — only static Block-11/12 copy mentions paid — and Codex IV2's independent in-memory test reproduced identical output when anonymous/expanded-free/paid tier fields were added; the emitted values are therefore evidence-availability states, NOT demonstrated commercial entitlement-ceiling mechanics. RP-5 tier-sensitive display-ceiling enforcement: NOT_ESTABLISHED. Canonical requirement (verified from authority text): Anonymous FREE displays Blocks 7-10 as LIMITED even when internal results are stronger (:213; :696) — the current Mode-D emission (LIMITED on 1/10; INSUFFICIENT_PUBLIC_EVIDENCE on 7-8; NOT_APPLICABLE on 9) is not shown to implement that ceiling pattern; alignment is unadjudicated. ABSENT as implementation: full entitlement matrix; report lifecycle binding (RP-8); cutoff-vs-T0 routing (RP-10); replay-vs-validation protocol (RP-11); private-company ingress (RP-12); expert/assurance boundary; secondary-use governance; forecast-accountability mechanics. Full per-control mapping = tree s20 (RP-1..RP-13, Addendum 83cdd1ec... s3)",
       "IV1-M06 + IV2-P04: evidence-availability statuses (INSUFFICIENT_PUBLIC_EVIDENCE / NOT_APPLICABLE / AVAILABLE — epistemic, from the Mode-D evidence slice) are DISTINCT from entitlement/display-ceiling states (LIMITED — RP-5 semantics); availability evidence does NOT demonstrate commercial entitlement enforcement"))

# ---------------------------------------------------------------- Branch 14
A(node("B14.1", "Integration monitor", "B14", "NOT_REACHED", "NOT_RUN", "N/A", "ABSENT", "ABSENT", ["B11.1"],
       "0 hits in src/ api/ netlify/ scripts/", ""))

# ---------------------------------------------------------------- Branch 15
A(node("B15.1", "Public web layer (React 19 + Vite 6 SPA)", "B15", "OWNER_ACCEPTED", "NOT_ESTABLISHED", "BOUND", "PARTIAL", "NOT_ESTABLISHED", [],
       "src/App.jsx; src/routes/routeModel.js; public aliases respected in implemented surfaces", ""))
A(node("B15.2", "Existing public case-study surface (routes + renderers + 10 legacy fixtures) — EXISTS in code; distinct from accepted nine-case public proof", "B15", "CANDIDATE", "NOT_ESTABLISHED", "BOUND", "PARTIAL", "INTEGRATED_CODE_PATH", [],
       "Routes: /case-studies and /case-studies/:caseId registered (src/routes/routeModel.js:83-84; matchers :114-121; navigationSection case-studies; future targetPath /historical-replays[/:caseId] :165). Renderers: CaseStudiesScreen (src/App.jsx:980-995, renders the 10-fixture index '10 Retroactive Analyses') and CaseStudyDetailScreen (:1031-1103, caseStudyById with not-found path :1034-1043); both exported into APP_SCREEN_COMPONENTS (:8035-8036). Fixtures: src/data/caseStudies.js — 10 frozen static fixtures (9 active corpus cases + disney-pixar) with STATIC legacy ECS scores (e.g. daimler-chrysler ecs 91 / exactEcs '91.2')",
       "IV1-M02: the surface's EXISTENCE is now represented (v1 wrongly said ABSENT). The fixtures are legacy marketing renderings — historical numbers, not canonical values — and are NOT the accepted nine-case public proof; proof readiness stays NOT_REACHED (B5.14, B16.3). No instrument dispositioning this surface as canonical was found; not adjudicated in this act. Deployed exposure NOT_ESTABLISHED"))

# ---------------------------------------------------------------- Branch 16
A(node("B16.1", "Commercial stack (4-tier ladder)", "B16", "OWNER_ACCEPTED_SEMANTICS_ONLY", "NOT_RUN", "BOUND", "ABSENT", "ABSENT", ["B11.1", "B16.4"],
       "RP Authority ladder 12->13->15->17->19 blocks; FREE rung activation gated by B16.4 (v2.1 s10.4)", ""))
# IV1-M01: explicit launch-gate nodes (previously prose-only in the dependency graph).
A(node("B16.2", "GATE — PRODUCT READY (v2.1 s10.2 FREE Product-Ready Track)", "B16", "NOT_REACHED", "NOT_RUN", "N/A", "N/A", "N/A", ["B10.3"],
       "Control Tree v2.1 s10.2", "Explicit node per IV1-M01"))
A(node("B16.3", "GATE — PUBLIC PROOF READY (v2.1 s10.3 mandatory launch gate)", "B16", "NOT_REACHED", "NOT_RUN", "N/A", "N/A", "N/A", ["B5.14", "B5.19"],
       "Control Tree v2.1 s10.3: cases completed under accepted launch methodology, seals pre-outcome, outcomes compared after seal, failures/limitations preserved, consistency replay completed, case studies publication-ready, disclosure contract respected. IV2-M01 graph reconciliation: proof flows from the VERIFIED replay (B5.19; track s23 'only after this gate may the project treat the replay as the final calibrated historical authority'; s27 'public authority only from Final Calibrated Replay') — CORR1 pointed this gate at unverified B5.12",
       "Explicit node per IV1-M01"))
A(node("B16.4", "GATE — OWNER PUBLIC-RELEASE AUTHORIZATION (v2.1 s10.4 FREE LAUNCH GATE)", "B16", "NOT_REACHED", "NOT_RUN", "N/A", "N/A", "N/A", ["B16.2", "B16.3"],
       "Control Tree v2.1 s10.4: PRODUCT READY AND PUBLIC PROOF READY -> Owner-authorized FREE MARKET RELEASE", "Exclusive Owner gate; explicit node per IV1-M01"))

# ---------------------------------------------------------------- Branch 17
A(node("B17.1", "Stage-2 semantic successor contract CORR4 (controlling)", "B17", "OWNER_ACCEPTED", "PASS", "BOUND@2567223", "N/A", "N/A", [],
       "WORKBENCH/DOWNLOADS/STAGE2_CORR4_PILOT_VERSION_LOCK.md s4: Owner explicitly accepted exact contract identity + IV5 PASS 0/0/1; header CANDIDATE_READY_FOR_IV5 = preserved artifact text", ""))
A(node("B17.2", "Pilot version lock lineage (execution dependencies + result schema)", "B17", "OWNER_AUTHORIZED", "PASS", "BOUND@d14f197", "N/A", "N/A", ["B17.1"],
       "Terminal lineage ...CORR1_CORR2_CORR1_CORR2_CORR1_CORR1_CORR1.IV1 = PASS (prior lineage FAIL 0/3/0 corrected); RESULT_SCHEMA FROZEN_BY_THIS_LOCK (2567223)", ""))
A(node("B17.3", "Bounded pilot stratification EXECUTED (A/B, 11,765 marks each)", "B17", "OWNER_AUTHORIZED", "NOT_ESTABLISHED", "UNTRACKED", "N/A", "N/A", ["B17.2"],
       "STAGE2_CORR4_PILOT_STRATIFIER_A_* (GPT-6 Astra 2026-09-26) / _B_* (Claude/Cline — provenance deviation recorded, carried); agreement 10,671/11,765 = 0.9070123 frozen in WB 03_SOURCE_ARTIFACTS/STAGE2_CORR4_AB_COMPARISON_2026-10-02/ (read-only)",
       "HOLD-6: provenance deviation carried, not adjudicated"))
# IV2-M02: IV PASS x3 and Git binding preserved; Owner acceptance downgraded from
# OWNER_ACCEPTED to OWNER_ACCEPTANCE_NOT_ESTABLISHED (commit-subject attestation is not
# exact acceptance evidence; no stronger record located despite structured search).
A(node("B17.4", "Post-pilot corrections: CORR10 + A-E001 + F0024 (each: IV PASS with exact report bytes; Owner acceptance ATTESTED by binding-commit subject — exact acceptance NOT ESTABLISHED)", "B17", "OWNER_ACCEPTANCE_NOT_ESTABLISHED", "PASS", "BOUND@9b1545e/3d7b777/fcbcf86", "N/A", "N/A", ["B17.3"],
       "EXACT IV EVIDENCE (IV1-M07, SHAs recomputed this act, CORR4): CORR10.IV1 REPORT ..._CORR10_IV1_REPORT.md SHA 716b5035d0eb1980f3f4aaa4ceba32c3bfda8518d5338384171921bcf85f3c3d (VERDICT = PASS :52; OWNER_ACCEPTED = NO :74); A-E001.IV1 ..._IV1_REPORT.md SHA 633afd19601a2ab3a583cc6f5ea957b1241b41f205668ebec0d1f3ff21b6acbd (VERDICT PASS :7; OWNER_ACCEPTED NO :223/:230); F0024.IV1 = AOL_F0024_RECONCILIATION_1_IV1_REPORT.md SHA e25306bc4930ce1e432aa784110d3adfaec4004dc67a2ab75c097c2e7ef70a50 (VERDICT PASS :7; OWNER_ACCEPTED NO :30). BINDING (preserved): 9b1545e / 3d7b777 / fcbcf86, commit subjects 'stage2: bind accepted CORR10 semantic-separation implementation' / '...A-E001 semantic readjudication' / '...F0024 provenance reconciliation', bodies EMPTY (read CORR2). IV2-M02: a commit subject stating 'bind accepted' is an ATTESTATION, not exact Owner-acceptance evidence. Stronger acceptance record SEARCHED and NOT FOUND (CORR2 searches): docs/governance (no CORR10/A-E001/F0024 acceptance instrument), external WB 01_AGENT_REPORTS + 06_GOVERNANCE_INPUTS + 04_PENDING_GIT_REVIEW, git log bodies. Additional located ATTESTATION-CLASS item (preserved, not authority): WORKBENCH/DOWNLOADS/A_E001_SCOPE_DISPOSITION_READJUDICATION_1_2026-10-07/A_E001_SCOPE_DISPOSITION_READJUDICATION_1_REPORT.md :29 asserts 'The Owner accepted the four separation methodology choices' — an agent-reported claim in untracked material",
       "Scratch analytical machinery — no production wiring claimed. Verified IV result (PASS x3) kept DISTINCT from the unresolved Owner-acceptance decision"))
A(node("B17.5", "Final Effective View Assembly CORR1 (current terminal candidate)", "B17", "CANDIDATE", "NOT_RUN", "UNTRACKED", "N/A", "N/A", ["B17.4"],
       "WORKBENCH/DOWNLOADS/STAGE2_FINAL_EFFECTIVE_VIEW_ASSEMBLY_1_CORR1_2026-10-07/ 6 members; RECORDS.jsonl SHA 3603c3169d7bdd67763ac0d2468d08cbb508d23dfeece4f7b396900b11dc68ec RECOMPUTED (Reconstruction-1, re-verified this act, CORR4), 116 records (2 changed/114 identical); manifest READY_FOR_INDEPENDENT_VERIFICATION / independentlyVerified:false / ownerAccepted:false; v1 FAILED IV1 (Codex); CORR1.IV1 not started",
       "F01 trap facts verified from primary bytes"))
A(node("B17.6", "sourceClass assignment chain (terminal SENTENCE-BOUNDARY CLOSURE-1.CORR1) — narrative Branch 17.7 maps HERE", "B17", "OWNER_ACCEPTED_RESIDUALS", "PASS", "BOUND@31fd56e", "N/A", "N/A", [],
       "13 files; ...CLOSURE-1.CORR1.IV1 = PASS 'independently verified subject to the Owner-accepted residuals' (Owner residual decision recorded in IV report)",
       "IV1-N01: matrix node id for the sourceClass chain is B17.6; the v1 narrative called it '17.7' — narrative renumbered to match"))
A(node("B17.7", "Other untracked Stage-2 candidate material — narrative Branch 17.8 maps HERE", "B17", "CANDIDATE", "NOT_ESTABLISHED", "UNTRACKED", "N/A", "N/A", [],
       "WORKBENCH/DOWNLOADS/MERGEVUE_SEC_HISTORICAL_ENTITY_NAME_AUTHORITY_v1_CORR1_*; sourceclass fixture variants; F-M-0205 / co-physical-drift overlay lineage artifacts",
       "IV1-N01: matrix node id is B17.7; the v1 narrative called it '17.8' — narrative renumbered to match. Not adjudicated in this act"))

# ---------------------------------------------------------------- assemble
VOCAB = {
    "governance": ["OWNER_ACCEPTED", "OWNER_ACCEPTANCE_NOT_ESTABLISHED", "OWNER_ACCEPTED_ARCHITECTURE_ONLY",
                   "OWNER_ACCEPTED_SEMANTICS_ONLY", "OWNER_ACCEPTED_RESIDUALS", "ACCEPTED_BY_OWNER_DESIGNATED_USE",
                   "OWNER_AUTHORIZED", "CANDIDATE", "NOT_REACHED", "REJECTED_BY_OWNER", "UNKNOWN"],
    "independentVerification": ["PASS", "FAIL", "NOT_RUN", "NOT_ESTABLISHED"],
    "gitBinding": ["BOUND", "BOUND@<commit>", "REVERTED@<commit>", "LOCAL_ONLY", "UNTRACKED", "N/A"],
    "implementation": ["COMPLETE", "PARTIAL", "ABSENT", "N/A"],
    "runtime": ["INTEGRATED_CODE_PATH", "OFFLINE_VALIDATED_ONLY", "NOT_ESTABLISHED", "ABSENT", "N/A"],
}

def classify_binding(v):
    if v.startswith("REVERTED@"):
        return "REVERTED@<commit>"
    if v.startswith("BOUND@"):
        return "BOUND@<commit>"
    if v == "BOUND":
        return "BOUND"
    return v

# validation: vocabulary, dependency integrity (no dangling refs, no cycles, no self-deps)
ids = {n["id"] for n in N}
assert len(ids) == len(N), "duplicate node ids"
for n in N:
    for dim, key in [("governance", "governance"), ("independentVerification", "independentVerification"),
                     ("implementation", "implementation"), ("runtime", "runtime")]:
        assert n[key] in VOCAB[dim], f"{n['id']}: {key}={n[key]} not in vocabulary"
    assert classify_binding(n["gitBinding"]) in VOCAB["gitBinding"] or n["gitBinding"] in VOCAB["gitBinding"], n["id"]
    for d in n["dependencies"]:
        assert d in ids, f"{n['id']}: dangling dependency {d}"
        assert d != n["id"], f"{n['id']}: self-dependency"

# cycle check (DFS)
WHITE, GRAY, BLACK = 0, 1, 2
color = {i: WHITE for i in ids}
def visit(nid):
    color[nid] = GRAY
    for d in next(n for n in N if n["id"] == nid)["dependencies"]:
        if color[d] == GRAY:
            raise AssertionError(f"dependency cycle at {nid} -> {d}")
        if color[d] == WHITE:
            visit(d)
    color[nid] = BLACK
for i in ids:
    if color[i] == WHITE:
        visit(i)

BY_ID = {n["id"]: n for n in N}

def ancestry(nid):
    seen, stack = set(), [nid]
    while stack:
        cur = stack.pop()
        for d in BY_ID[cur]["dependencies"]:
            if d not in seen:
                seen.add(d)
                stack.append(d)
    return seen

# semantic ordering sanity for the restored IV2-M01 calibration sequence
order = ["B5.8", "B5.9", "B5.10", "B5.15", "B5.16", "B5.11", "B5.17", "B5.18", "B7.1", "B5.12", "B5.19", "B5.13"]
depth = {}
def dep_depth(nid):
    if nid in depth:
        return depth[nid]
    n = BY_ID[nid]
    depth[nid] = 0 if not n["dependencies"] else 1 + max(dep_depth(d) for d in n["dependencies"])
    return depth[nid]
chain_depths = [dep_depth(x) for x in order]
assert chain_depths == sorted(chain_depths), f"IV2-M01 chain mis-ordered: {list(zip(order, chain_depths))}"
# IV2-M01 explicit-stage assertions: each controlling stage exists with exactly the
# accepted predecessor relation (falsification after reproduction; LOCO after falsification).
assert BY_ID["B5.11"]["dependencies"] == ["B5.16"], "falsification gate must depend on independent reproduction"
assert BY_ID["B5.17"]["dependencies"] == ["B5.11"], "LOCO must depend on the falsification gate"
assert BY_ID["B7.1"]["dependencies"] == ["B5.18"], "Owner acceptance must depend on coverage/verdict stage"
assert BY_ID["B5.12"]["dependencies"] == ["B7.1"], "final replay must follow Owner acceptance"
assert BY_ID["B5.19"]["dependencies"] == ["B5.12"], "full-corpus verification must follow final replay"

# IV2-P02 prerequisite ancestry: the nine internal reports must require the verified
# replay, the accepted-HEDC verified classifier implementation, and the verified core.
need = {"B5.19", "B6.4", "B9.1", "B5.12", "B7.1"}
missing = need - ancestry("B5.13")
assert not missing, f"IV2-P02: B5.13 ancestry missing {sorted(missing)}"
assert "B5.19" in ancestry("B5.14"), "IV2-M01: B5.14 must hang off the verified replay"
assert "B5.19" in ancestry("B16.3"), "IV2-M01: PUBLIC PROOF READY must hang off the verified replay"
# IV4-N02 invariant: B5.8 current governance UNKNOWN; historical authoring-time record
# preserved with date + source; execution/IV evidence NOT_ESTABLISHED; implementation and
# runtime ABSENT scoped to tracked-code inspection; dependencies unchanged; the five-layer
# disambiguation present; no OWNER_AUTHORIZED/OWNER_ACCEPTED/completed-execution inference.
b58 = BY_ID["B5.8"]
assert b58["governance"] == "UNKNOWN", "IV4-N02 invariant violated: B5.8 governance must be UNKNOWN"
assert b58["independentVerification"] == "NOT_ESTABLISHED", "IV4-N02 invariant violated: B5.8 IV must stay NOT_ESTABLISHED"
assert b58["implementation"] == "ABSENT" and b58["runtime"] == "ABSENT", "IV4-N02 invariant violated: B5.8 C/R must stay ABSENT (scoped)"
assert b58["dependencies"] == ["B5.7", "B5.5", "B17.5"], "IV4-N02 invariant violated: B5.8 dependencies must be unchanged"
_ld = b58.get("lifecycleDisambiguation", {})
assert _ld.get("mandatedBy") == "IV4-N02", "IV4-N02: lifecycleDisambiguation missing"
assert _ld["historicalStageStateAtAuthoring"]["statement"] == "STAGE_2_STARTED = NO", "IV4-N02: historical statement not preserved"
assert _ld["historicalStageStateAtAuthoring"]["authoringDate"] == "2026-09-25", "IV4-N02: authoring date not preserved"
assert _ld["currentAuthorizationGovernance"] == "UNKNOWN", "IV4-N02: current governance must be UNKNOWN"
assert _ld["currentExecutionEvidence"] == "NOT_ESTABLISHED" and _ld["currentIndependentVerificationEvidence"] == "NOT_ESTABLISHED", \
    "IV4-N02: execution/IV evidence layers must be NOT_ESTABLISHED"
assert "not a non-execution claim" in _ld["eligibilityToProceed"], "IV4-N02: forward-progression vs execution distinction missing"
assert "STAGE_2_STARTED = NO" in b58["evidence"] and "2026-09-25" in b58["evidence"], "IV4-N02: evidence text must carry the historical record with date"

# IV2-M02 invariant: verified IV + binding preserved while acceptance stays unresolved.
b174 = BY_ID["B17.4"]
assert b174["governance"] == "OWNER_ACCEPTANCE_NOT_ESTABLISHED" and b174["independentVerification"] == "PASS" \
    and b174["gitBinding"].startswith("BOUND@"), "IV2-M02 invariant violated on B17.4"

# ------------------------------------------------------------- P01: node-ID accounting
# Computed mechanically from the physical predecessor matrices (P01) — never hand-written.
# Four transitions now: parent->CORR1, CORR1->CORR2, CORR2->CORR3, CORR3->CORR4 (IV4-N03).
def load_nodes(d):
    with open(os.path.join(d, "MERGEVUE_NODE_STATUS_MATRIX.json")) as f:
        return {n["id"]: n for n in json.load(f)["nodes"]}

STATUS_DIMS = ["title", "governance", "independentVerification", "gitBinding", "implementation", "runtime", "dependencies"]

def diff_nodes(old, new):
    o_ids, n_ids = set(old), set(new)
    common = o_ids & n_ids
    modified, identical, ann_only, status_changed = [], [], [], []
    for i in sorted(common):
        if old[i] == new[i]:
            identical.append(i)
        else:
            modified.append(i)
            if any(old[i].get(d) != new[i].get(d) for d in STATUS_DIMS):
                status_changed.append(i)
            else:
                ann_only.append(i)
    return {
        "newIds": sorted(n_ids - o_ids),
        "removedIds": sorted(o_ids - n_ids),
        "modifiedCount": len(modified),
        "modifiedStatusBearing": sorted(status_changed),
        "modifiedAnnotationOnly": sorted(ann_only),
        "identicalCount": len(identical),
        "identicalIds": sorted(identical),
    }

# ---- IV3-M01 + IV4-M01: diagram/matrix agreement (the matrix is the authoritative graph).
# The tree candidate s21 section carries FOUR representations that must all equal the
# matrix's direct-dependency edge set exactly (full view; IV4-M01 — no partial views):
#   (1) the mermaid block: 63 node declarations + one explicit single-edge `A --> B`
#       declaration per matrix dependency (no ASCII trunk art, no shared vertical
#       branches, no implied arrows — the IV4 hidden B7.1 -> B5.19 shortcut is
#       structurally impossible);
#   (2) the machine-readable (edge-manifest: ...) line;
#   (3) the declared per-node adjacency list ([deps: ...] / [deps: none], 63 lines);
#   (4) the independent human-readable edge transcription in the reconstruction report
#       (separate artifact, separate reading pass).
import re as _re
TREE_MD = os.path.join(HERE, "MERGEVUE_CURRENT_CONTROL_TREE_CANDIDATE.md")
_tree = open(TREE_MD, encoding="utf-8").read()
_sec = _re.search(r"## 21\. DEPENDENCY GRAPH.*?(?=\n---\n\n## 22\.)", _tree, _re.S)
assert _sec, "tree candidate: s21 section not found"
_sec21 = _sec.group(0)
# no ASCII trunk/branch art anywhere in s21 (the IV4 ambiguity class): no line shaped as
# trunk art (leading pipe / pure glyph lines); the mermaid block itself must contain no
# trunk-arrow tokens. Prose that QUOTES the historical CORR3 defect token is documentation,
# not drawing, and is not flagged.
assert not _re.search(r"^[ \t]*\|", _sec21, _re.M), "IV4-M01: ASCII trunk line present in s21"
assert not _re.search(r"^[ \t|v+^-]+$", _sec21, _re.M), "IV4-M01: pure glyph/branch line present in s21"
assert "-.->" not in _sec21 and "==>" not in _sec21, "IV4-M01: alternative arrow form present in s21"
# (1) mermaid block
_mm = _re.search(r"```mermaid\n(.*?)```", _sec21, _re.S)
assert _mm, "tree candidate: s21 mermaid block not found"
_mblk = _mm.group(1)
assert "|-->" not in _mblk and "|->" not in _mblk, "IV4-M01: ASCII trunk art in mermaid block"
_decl = _re.findall(r"^[ \t]*(B\d+_\d+)\[", _mblk, _re.M)
assert len(_decl) == len(set(_decl)), "IV4-M01: duplicate mermaid node declaration"
assert {d.replace("_", ".") for d in _decl} == ids, "IV4-M01: mermaid declared node set != matrix node set"
_mermaid_edges = []
for _ln in _mblk.splitlines():
    _s = _ln.strip()
    if not _s or _s == "flowchart TD" or _re.match(r"^B\d+_\d+\[", _s):
        continue
    _e = _re.fullmatch(r"(B\d+_\d+)\s*-->\s*(B\d+_\d+)", _s)
    assert _e, f"IV4-M01: mermaid line that is neither declaration nor single exact edge: {_s[:70]}"
    _mermaid_edges.append((_e.group(1).replace("_", "."), _e.group(2).replace("_", ".")))
# (2) machine-readable edge manifest — the full-line fence entry, not the prose mention
_em = _re.search(r"^\(edge-manifest: (.*)\)[ \t]*$", _sec21, _re.M)
assert _em, "tree candidate: s21 edge-manifest line missing"
_manifest_edges = [tuple(e.split("->")) for e in _em.group(1).replace(" ", "").split(";") if e]
# (3) declared per-node adjacency (63 lines; same-line rule: id before the annotation)
_anns = []
for _line in _sec21.splitlines():
    _all = _re.findall(r"\[deps: ([^\]]+)\]", _line)
    if not _all:
        continue
    assert len(_all) == 1, f"IV4-M01: multiple deps annotations on one line: {_line[:70]}"
    _pre = _line[:_line.index("[deps:")]
    _ids = _re.findall(r"(B\d+\.\d+)", _pre)
    assert _ids, f"IV4-M01: deps annotation without a preceding node id on its line: {_line[:70]}"
    _anns.append((_ids[-1], _all[0]))
assert len(_anns) == len(N), f"IV4-M01: adjacency must cover all 63 nodes, found {len(_anns)}"
# (4) independent human-readable transcription in the reconstruction report
REPORT_MD = os.path.join(HERE, "MERGEVUE_RECONSTRUCTION_REPORT.md")
_rept = open(REPORT_MD, encoding="utf-8").read()
_tm = _re.search(r"<!-- EDGE-TRANSCRIPTION-BEGIN -->(.*?)<!-- EDGE-TRANSCRIPTION-END -->", _rept, _re.S)
assert _tm, "reconstruction report: edge transcription block not found"
_transcription_edges = _re.findall(r"(B\d+\.\d+)\s*->\s*(B\d+\.\d+)", _tm.group(1))
# authoritative edge set + full-equality validation (IV4-M01: equality, not subset)
_matrix_edges = {(d, n["id"]) for n in N for d in n["dependencies"]}
_mermaid_set, _manifest_set = set(_mermaid_edges), {_e for _e in _manifest_edges}
_transcription_set = {_e for _e in _transcription_edges}
assert len(_mermaid_edges) == len(_mermaid_set) == len(_manifest_edges) == len(_manifest_set) \
       == len(_transcription_edges) == len(_transcription_set) == len(_matrix_edges) == 52, \
    f"IV4-M01: representation cardinalities differ (mermaid {len(_mermaid_edges)}, manifest {len(_manifest_edges)}, transcription {len(_transcription_edges)}, matrix {len(_matrix_edges)})"
assert _mermaid_set == _matrix_edges, f"IV4-M01: mermaid edges != matrix edges: {(_mermaid_set ^ _matrix_edges)}"
assert _manifest_set == _matrix_edges, f"IV4-M01: manifest edges != matrix edges: {(_manifest_set ^ _matrix_edges)}"
assert _transcription_set == _matrix_edges, f"IV4-M01: transcription edges != matrix edges: {(_transcription_set ^ _matrix_edges)}"
# adjacency equals matrix deps for every node (none = empty)
for _nid, _dep_str in _anns:
    _listed = set() if _dep_str.strip() == "none" else {d for d in _dep_str.replace(" ", "").split(",") if d}
    _actual = set(next(n for n in N if n["id"] == _nid)["dependencies"])
    assert _listed == _actual, f"IV4-M01: deps annotation mismatch for {_nid}: diagram {sorted(_listed)} vs matrix {sorted(_actual)}"
# the three named false relationships must appear neither as drawn edges (validated above)
# nor as literal dep claims in the s21 section or the transcription
for _bad in ["B7.1 -> B5.19", "B6.4 -> B9.1", "B5.13 -> B16.3"]:
    assert _bad not in _sec21, f"IV4-M01: named false edge literal present in s21: {_bad}"
    assert _bad not in _tm.group(1), f"IV4-M01: named false edge literal present in transcription: {_bad}"
assert "B7_1 --> B5_19" not in _mblk, "IV4-M01: hidden B7.1 -> B5.19 shortcut drawn"
assert "B6_4 --> B9_1" not in _mblk and "B5_13 --> B16_3" not in _mblk, "IV3-M01: named false edge drawn"
# B5.19 has exactly one incoming drawn edge and it is from B5.12 (IV4-M01 core)
_in_b519 = [e for e in _mermaid_edges if e[1] == "B5.19"]
assert _in_b519 == [("B5.12", "B5.19")], f"IV4-M01: B5.19 incoming edges must be exactly [B5.12], got {_in_b519}"

PARENT_NODES = load_nodes(PARENT_DIR)
CORR1_NODES = load_nodes(CORR1_DIR)
CORR2_NODES = load_nodes(CORR2_DIR)
CORR3_NODES = load_nodes(CORR3_DIR)
CORR4_NODES = {n["id"]: n for n in N}
d_parent_corr1 = diff_nodes(PARENT_NODES, CORR1_NODES)
d_corr1_corr2 = diff_nodes(CORR1_NODES, CORR2_NODES)
d_corr2_corr3 = diff_nodes(CORR2_NODES, CORR3_NODES)
d_corr3_corr4 = diff_nodes(CORR3_NODES, CORR4_NODES)
changed_accounting = {
    "method": "Computed mechanically by build_matrix.py from the physical predecessor matrices (P01; four transitions per IV4-N03); never hand-written. 'identical' = exact node-object byte equality after JSON parse; 'modified' = any field differs; status-bearing = title/dimension/dependency change; annotation-only = evidence/notes prose change with all status fields equal. Semantic continuity is a reported judgment and is kept DISTINCT from object equality.",
    "parent_to_CORR1": {
        "parentNodeCount": len(PARENT_NODES), "corr1NodeCount": len(CORR1_NODES),
        **d_parent_corr1,
        "note": "Corrects the CORR1 manifest/report (IV2-P01): SIX new ids incl. B5.14 (parent never contained B5.14 — moving the former B5.11 subject into B5.14 does not preserve its id); retasked existing ids = 3 (B5.9/B5.10/B5.11 — B5.14's subject is semantically carried from parent B5.11 but the id is new); 32 modified existing objects (19 status-bearing + 13 annotation-only); 20 byte-identical existing objects.",
    },
    "CORR1_to_CORR2": {
        "corr1NodeCount": len(CORR1_NODES), "corr2NodeCount": len(CORR2_NODES),
        **d_corr1_corr2,
    },
    "CORR2_to_CORR3": {
        "corr2NodeCount": len(CORR2_NODES), "corr3NodeCount": len(CORR3_NODES),
        **d_corr2_corr3,
        "note": "IV3-N02 status adjustment recorded here mechanically: B5.8 IV NOT_RUN -> NOT_ESTABLISHED (status-bearing). B8.1 :879->:886 is an evidence-prose correction (annotation-only).",
    },
    "CORR3_to_CORR4": {
        "corr3NodeCount": len(CORR3_NODES), "corr4NodeCount": len(CORR4_NODES),
        **d_corr3_corr4,
        "note": "IV4-N02 status adjustment recorded here mechanically: B5.8 governance NOT_REACHED -> UNKNOWN (status-bearing; five-layer lifecycleDisambiguation added; the 52-edge dependency set is UNCHANGED vs CORR3 — asserted this act). B0.1 act-date re-pin is an evidence-prose correction (annotation-only).",
    },
}
# IV4-M01 no-regression: the dependency graph is byte-equal to CORR3's (no dependency
# was altered to match the drawing).
_c3_edges = {(d, nid) for nid, n in CORR3_NODES.items() for d in n["dependencies"]}
_c4_edges = {(d, nid) for nid, n in CORR4_NODES.items() for d in n["dependencies"]}
assert _c3_edges == _c4_edges, "IV4-M01 regression: dependency graph must be identical to CORR3's"
assert {nid: n["dependencies"] for nid, n in CORR3_NODES.items()} == {nid: n["dependencies"] for nid, n in CORR4_NODES.items()}, \
    "IV4-M01 regression: per-node dependency lists must be identical to CORR3's"

census = {
    "nodeCount": len(N),
    "governance": dict(sorted(Counter(n["governance"] for n in N).items())),
    "independentVerification": dict(sorted(Counter(n["independentVerification"] for n in N).items())),
    "gitBinding": dict(sorted(Counter(classify_binding(n["gitBinding"]) for n in N).items())),
    "implementation": dict(sorted(Counter(n["implementation"] for n in N).items())),
    "runtime": dict(sorted(Counter(n["runtime"] for n in N).items())),
    "note": "Computed mechanically from the node table by build_matrix.py (IV1-N02). gitBinding classifies multi-commit BOUND nodes once (e.g. B17.4 counts as one BOUND node). CORR4 (IV4-N02): governance NOT_REACHED 21->20, UNKNOWN 0->1 (B5.8).",
}

doc = {
    "act": ACT, "date": DATE, "author": "Z.ai (GLM-5.3 Flash via ZCode)",
    "baselineHead": HEAD,
    "status": "CORR4_CANDIDATE_READY_FOR_CODEX_IV5",
    "correctionOf": {
        "parent": "MERGEVUE_VERIFIED_CURRENT_CONTROL_TREE_RECONSTRUCTION_1.CORR3 (63 nodes, FAILED Codex IV4: 0 BLOCKING / 1 MAJOR / 2 MINOR — IV4-M01 hidden ASCII dependency B7.1 -> B5.19; IV4-N02 B5.8 governance overclaim; IV4-N03 generator/matrix provenance staleness)",
        "lineage": [
            "MERGEVUE_VERIFIED_CURRENT_CONTROL_TREE_RECONSTRUCTION_1 (52 nodes, FAILED Codex IV1: 0 BLOCKING / 8 MAJOR / 2 MINOR — IV1-M01..M08, IV1-N01..N02)",
            "MERGEVUE_VERIFIED_CURRENT_CONTROL_TREE_RECONSTRUCTION_1.CORR1 (58 nodes, FAILED Codex IV2: 0 BLOCKING / 5 MAJOR / 2 MINOR — IV2-P01..P04, IV2-M01, IV2-M02, IV2-N01)",
            "MERGEVUE_VERIFIED_CURRENT_CONTROL_TREE_RECONSTRUCTION_1.CORR2 (63 nodes, FAILED Codex IV3: 0 BLOCKING / 1 MAJOR / 2 MINOR — CORR2-IV3-M01, CORR2-IV3-N01, CORR2-IV3-N02)",
            "MERGEVUE_VERIFIED_CURRENT_CONTROL_TREE_RECONSTRUCTION_1.CORR3 (63 nodes, FAILED Codex IV4: 0 BLOCKING / 1 MAJOR / 2 MINOR — IV4-M01, IV4-N02, IV4-N03) — DIRECT PARENT of this candidate",
            "MERGEVUE_VERIFIED_CURRENT_CONTROL_TREE_RECONSTRUCTION_1.CORR4 (this candidate, 63 nodes)",
        ],
        "findingsCorrected": [
            "IV4-M01 hidden ASCII dependency: the CORR3 s21 diagram drew B5.19 on a B7.1 trunk branch, visually implying a direct B7.1 -> B5.19 dependency the matrix does not contain (matrix: B5.12.dependencies=[B7.1], B5.19.dependencies=[B5.12]); corrected by replacing the ASCII art with a full-view Mermaid diagram whose 52 declared edges EQUAL the matrix edge set; matrix dependencies unchanged (regression-asserted identical to CORR3); validated four ways (mermaid / edge-manifest / declared adjacency / independent report transcription)",
            "IV4-N02 B5.8 governance overclaim: current governance NOT_REACHED -> UNKNOWN; the authoring-time STAGE_2_STARTED = NO record (successor doc :399, dated 2026-09-25, bound 92236dc) preserved as historical with date and source; IV NOT_ESTABLISHED preserved; implementation/runtime ABSENT preserved scoped to tracked-code inspection; five-layer lifecycleDisambiguation distinguishes authoring-time state / current authorization / current execution evidence / current IV evidence / eligibility to proceed; blocked forward progression never read as never-executed; governance census recomputed mechanically (NOT_REACHED 21->20, UNKNOWN 0->1)",
            "IV4-N03 generator and matrix provenance: this generator's header/docstring, runtime ACT, in-memory exec fallback (CORR4 directory), input description (four predecessor matrices + tree s21 diagram + report transcription), and the generated matrix act/status (CORR4_CANDIDATE_READY_FOR_CODEX_IV5)/correctionOf (direct parent CORR3; full lineage preserved)/findingsCorrected (IV4-M01, IV4-N02, IV4-N03) describe the exact CORR3 -> CORR4 correction chain; a fourth P01 accounting transition (CORR3_to_CORR4) is computed from the physical CORR3 matrix; prior audit history preserved unchanged",
        ],
        "correctionLedger": "MERGEVUE_CORRECTION_LEDGER.md (same directory)",
    },
    "dimensionVocabulary": VOCAB,
    "dimensionRule": "No dimension implies any other. NOT_ESTABLISHED = searched, not found — a missing-evidence marker, never a negative finding, and never converted into NOT_RUN, rejection, or closure (IV1-M07). OWNER_ACCEPTANCE_NOT_ESTABLISHED (IV2-M02) = an acceptance attestation exists in the record but the exact Owner-acceptance evidence was searched for and not located; it preserves — never erases — a verified IV result or binding carried by the other dimensions. Authoring-time vs current (IV4-N02): a statement inside a bound document (e.g. STAGE_2_STARTED = NO, successor doc :399, 2026-09-25) fixes what its authoring act recorded on its authoring date and never establishes current authorization, execution, or governance status on a later date; where independently sufficient current Owner/governance evidence is not located, current governance is UNKNOWN; a negative file search or an unresolved predecessor blocks authorized forward progression — neither proves that a stage was never executed.",
    "regressionTraps": {
        "F01": "17.5 states CANDIDATE MATERIALIZED / READY_FOR_IV with recomputed RECORDS SHA 3603c316..., 116 records — neither 'unmaterialized' nor verified/accepted",
        "F02": "All six dimensions carried per node; no single completion symbol anywhere",
        "F03": "10.1 records Block1 LIMITED, Blocks2-8 INSUFFICIENT_PUBLIC_EVIDENCE, Block9 NOT_APPLICABLE, Block10 LIMITED, Blocks11-12 AVAILABLE, 12-block assert — verified in code; P04: these are evidence-availability states without tier inputs, not ceiling mechanics",
        "F04": "5.6 correction-campaign acceptance kept distinct from 5.7 successor-candidate IV/acceptance; 5.5 freeze candidate NOT_ESTABLISHED either way; P03: 5.7 current closure + exact acceptance NOT_ESTABLISHED (authoring-time NO preserved verbatim as historical)",
        "F05": "6.2 environmentBinding=NONE (md2.js:963, re-read CORR4); 6.3 CORR6 local candidate evidence only (untracked, no sidecar; SHA re-verified CORR4)",
        "F06": "RP control reconciliation in tree s20 (RP-1..RP-13 individually; RP-5 enforcement NOT_ESTABLISHED per IV2-P04); dependency graph preserves all distinct gates incl. candidate rule freeze (B5.10), frozen blind replay (B5.15), independent reproduction (B5.16), falsification (B5.11), LOCO (B5.17), coverage/verdicts (B5.18), Owner methodology acceptance (B7.1), final calibrated replay (B5.12), full-corpus verification (B5.19), Product Ready (B16.2), Public Proof Ready (B16.3), Owner public-release authorization (B16.4); IV4-M01: B5.19's only diagram parent is B5.12",
    },
    "holds": ["HOLD-1 freeze-candidate lifecycle NOT ESTABLISHED (IV dimension NOT_ESTABLISHED per IV1-M07; re-searched CORR2/CORR3)",
              "HOLD-2 correction-IV1 bytes not physically located",
              "HOLD-3 successor-binding current closure + exact-byte Owner acceptance NOT ESTABLISHED (IV2-P03); authoring-time STAGE1_CLOSED=NO preserved as historical candidate wording; two later agent-reported closure assertions preserved with locations (Reality Audit :28-30; Grok 2026-09-26 :59); campaign/candidate conflation explanation = INFERENCE",
              "HOLD-4 per-case outcome/seal identities not re-hashed (carried authority)",
              "HOLD-5 no deployed-runtime evidence; recorded code observations not adjudicated",
              "HOLD-6 stratifier provenance deviation carried",
              "HOLD-7 v1.7 report-SHA debt",
              "HOLD-8 (CORR3 provenance, carried) Codex IV3 report bytes not located; CORR3 executed from the Owner task transcription",
              "HOLD-9 (new, IV4 provenance) Codex IV4 report bytes not located; this act executed from the Owner task's complete transcription with per-finding source re-verification (E55)"],
    "changedNodeAccounting": changed_accounting,
    "census": census,
    "nodes": N,
}

out = os.path.join(HERE, "MERGEVUE_NODE_STATUS_MATRIX.json")
with open(out, "w") as f:
    json.dump(doc, f, indent=2, ensure_ascii=False)
    f.write("\n")

print("nodes:", len(N))
print("P01 parent->CORR1:", {k: (len(v) if isinstance(v, list) else v) for k, v in d_parent_corr1.items()})
print("P01 CORR1->CORR2:", {k: (len(v) if isinstance(v, list) else v) for k, v in d_corr1_corr2.items()})
print("P01 CORR2->CORR3:", {k: (len(v) if isinstance(v, list) else v) for k, v in d_corr2_corr3.items()})
print("P01 CORR3->CORR4:", {k: (len(v) if isinstance(v, list) else v) for k, v in d_corr3_corr4.items()})
print("P01 CORR3->CORR4 statusBearing:", d_corr3_corr4["modifiedStatusBearing"], "annotationOnly:", d_corr3_corr4["modifiedAnnotationOnly"])
print("diagram validated (IV4-M01): 52 mermaid edges == 52 manifest edges == 52 adjacency declarations == 52 transcription entries == matrix edges; B5.19 incoming:", _in_b519)
for k, v in census.items():
    if k != "note":
        print(k, v)
print("written:", out)
