# MERGEVUE M&A — CURRENT-STATE CONTROL TREE OVERLAY (2026-10-07)

> **STATUS: DIAGNOSTIC CANDIDATE / NOT CONTROLLING GOVERNANCE**
> **LEGALITY / GOVERNANCE NOTICE:** This document is an empirical diagnostic candidate produced by the repository reality audit (`MERGEVUE_FULL_REPOSITORY_AND_NINE_CASE_REALITY_AUDIT_1`) and refined under `MERGEVUE_CURRENT_STATE_TREE_OVERLAY_CORR1`. It does **NOT** supersede controlling governance authority (`docs/governance/MERGEVUE_CONTROL_TREE_v2.1_2026-09-04.md`) or any accepted governance addendum.
>
> **KNOWN RECONCILIATION ISSUES RECORDED:**
> 1. **Corpus-Freeze Status vs Method Freeze:** Active 9-case corpus membership and geometry was accepted and bound via `docs/governance/MERGEVUE_CALIBRATION_9_CASE_CORPUS_ADDENDUM_2026-09-25.md` (SHA-256 `fb602181...`, commit `d177386`) and durable outcome-IV authority was bound via `docs/governance/historical-corpus/outcome-iv/MERGEVUE_OUTCOME_IV_DURABLE_AUTHORITY_BINDING_2026-09-25.md` (SHA-256 `568b5164...`, commit `6ad8933`). However, the nine-case input corpus freeze candidate `docs/governance/historical-corpus/MERGEVUE_POST_10_CALIBRATION_9_CASE_CORPUS_FREEZE_2026-09-25.md` (SHA-256 `da9b9de2...`, commit `d52e7f4`) remains an authored candidate awaiting IV and Owner acceptance (`CORPUS_FREEZE_FINAL: NO`). This calibration input freeze is distinct from the downstream post-calibration Method Freeze (Branch 7), which is a separate future gate that remains unreached.
> 2. **SHA Identity Discrepancies:** Multiple historical audit reports and candidate packages in the workbench contain SHA-256 reference mismatches or cite non-canonical intermediate manifests. Specifically, the SHA-256 hash previously cited for Stage-1 (`da9b9de2...`) was identified as the hash of the nine-case corpus freeze candidate (`MERGEVUE_POST_10_CALIBRATION_9_CASE_CORPUS_FREEZE_2026-09-25.md`), whereas the true authoritative Stage-1 SHA-256 is `be9593a767edfa1d61787458db3de1c7034d49ac60b65fe0ce8e11402fe70237`, as verified against physical bytes and sidecar.
> 3. **Overbroad Implementation Status Claims:** Prior historical handoff notes claiming "operational" or "implemented" status for downstream analytical blocks reflect only surface-level metadata or test mocks; in runtime reality, analytical blocks in Mode-D Slice-1 default to `INSUFFICIENT_PUBLIC_EVIDENCE`, the Stage-2 CORR1 build script remains unexecuted, and the automated HEDC classifier is unwritten.

**Act:** `MERGEVUE_FULL_REPOSITORY_AND_NINE_CASE_REALITY_AUDIT_1` (Updated: `MERGEVUE_CURRENT_STATE_TREE_OVERLAY_CORR1`)
**Date:** 2026-10-07
**Parent Governance Baseline:** `docs/governance/MERGEVUE_CONTROL_TREE_v2.1_2026-09-04.md` (SHA-256 `360bafa29bad5ea93752323d4a217bf59aaec628e0e2b236350a2edd9c1f7128`)
**Accepted Governance Addenda:**
- `docs/governance/MERGEVUE_CONTROL_TREE_REPORT_PRODUCT_ADDENDUM_2026-09-21.md` (SHA-256 `83cdd1ec02f11579167ef24737fd8f2c24e8f6bd7993909054649dcc3e776815`)
- `docs/governance/MERGEVUE_REPORT_PRODUCT_AUTHORITY_v1.0_2026-09-21.md` (SHA-256 `e52029d9187b2dae708a3796603a5cc94e367734068e32f37b861b1124526f33`)
- `docs/governance/MERGEVUE_CALIBRATION_9_CASE_CORPUS_ADDENDUM_2026-09-25.md` (SHA-256 `fb602181de969bcc91d5ff76f01afefcc2bc1705870e51a677eb2135877b8229`, bound `d177386`)
- `docs/governance/historical-corpus/outcome-iv/MERGEVUE_OUTCOME_IV_DURABLE_AUTHORITY_BINDING_2026-09-25.md` (SHA-256 `568b51643d4103d0777bd35acf37d514ad9166516aec7748a0addc6b98bb8f94`, bound `6ad8933`)
- `docs/governance/historical-corpus/MERGEVUE_STAGE1_FACTUAL_AUTHORITY_SUCCESSOR_BINDING_AND_CLOSURE_2026-09-25.md` (SHA-256 `be9593a767edfa1d61787458db3de1c7034d49ac60b65fe0ce8e11402fe70237`, bound `92236dc`)

**Candidate Lineage Artifacts (Not Owner-Accepted Authority):**
- `docs/governance/historical-corpus/MERGEVUE_POST_10_CALIBRATION_9_CASE_CORPUS_FREEZE_2026-09-25.md` (SHA-256 `da9b9de2ab9c49cf98100c008eb980225cf8595b2873cc4eb6eb6d8e9733cbd6`, bound `d52e7f4`) — `OWNER-AUTHORIZED CORPUS-FREEZE CANDIDATE` awaiting independent verification and Owner acceptance.

**Status Legend:**
- ✅ **ACCEPTED + VERIFIED + APPLICABLY IMPLEMENTED** (Governance accepted, independently verified, and implemented in running code)
- ◩ **PARTIAL / FOUNDATION EXISTS** (Foundational modules or partial candidate exists; incomplete integration)
- ⚠️ **ACTIVE / PENDING** (Active candidate, under review, or unmaterialized repair)
- ❌ **NOT IMPLEMENTED / NOT CLOSED** (Required by roadmap/spec, but absent from code/runtime)
- ⛔ **BLOCKED BY DEPENDENCY** (Cannot proceed until predecessor stage closes)
- ? **NOT ESTABLISHED / INSUFFICIENT EVIDENCE** (Evidence missing or inconclusive)

---

## MULTI-DIMENSIONAL STATUS OVERVIEW TABLE

| Major Tree Branch | Historical Tree (v2.1) | Governance Authority | Independent Verification | Implemented Code | Operational Runtime | Current Reality Status |
|---|---|---|---|---|---|---|
| **1. Root Theory & Definitions** | ✅ CLOSED | ✅ v1.7 Accepted | ✅ Verified (v1.7 archive `8decabd6...`) | ✅ `src/data/environments.js` | ✅ In-memory | ✅ IMPLEMENTED |
| **2. Epistemic & Safety Governance** | ✅ CLOSED | ✅ Accepted | ✅ Verified | ✅ Multiple Validators | ✅ Active Enforcement | ✅ IMPLEMENTED |
| **3. Live Respondent / Questionnaire** | ✅ CLOSED | ✅ Accepted | ✅ Verified | ✅ `src/flow/` modules | ◩ Partial (Mock Pairs) | ◩ FOUNDATION EXISTS |
| **4. Documentary Evidence System** | ✅ CLOSED | ✅ CASE-3.4 v1.3 | ✅ Verified | ✅ Ingress Validators | ◩ Mode-D Only | ◩ FOUNDATION EXISTS |
| **5. Historical Calibration (9 Cases)** | ⚠️ ACTIVE (DISC-2) | ✅ 9-Case Addendum | ✅ IV1 Passed (All 9) | ❌ No Engine Code | ❌ Research Only | ⛔ RESEARCH SEALED / ENGINE BLOCKED |
| **6. Historical Environment Route (HEDC)**| ⚠️ ACTIVE (OD-MS-9)| ◩ Draft Contracts | ❌ Not Verified | ◩ `src/historical/md2.js` | ❌ Struct Only | ⛔ BLOCKED (No Classifier) |
| **7. Method Freeze Post-Calibration** | ❌ FUTURE | ❌ Not Reached | ❌ Not Reached | ❌ None | ❌ None | ⛔ BLOCKED BY HEDC |
| **8. Existing Hard-Core Foundations** | ✅ CLOSED | ✅ Accepted | ✅ Verified | ◩ Legacy Modules | ◩ Static Matrices | ◩ FOUNDATION EXISTS |
| **9. Target Hard-Coded Analytical Core**| ❌ FUTURE | ❌ Spec Only | ❌ None | ❌ None | ❌ None | ❌ NOT IMPLEMENTED |
| **10. FREE Market Launch (12 Blocks)** | ⚠️ ACTIVE | ✅ RP Authority v1.0 | ◩ Slice-1 Verified | ◩ Mode-D Slice-1 | ◩ Shell Only (No Math) | ◩ PARTIAL (Shell / Metadata Only) |
| **11. Paid Deal Diagnostic (19 Blocks)** | ❌ FUTURE | ✅ RP Authority v1.0 | ❌ None | ❌ 0% in `src/` | ❌ None | ❌ NOT IMPLEMENTED |
| **12. Temporarily FREE Version** | ⚠️ ACTIVE | ◩ Draft Spec | ❌ None | ◩ Legacy Screen12 | ◩ Static Deliverables | ◩ FOUNDATION EXISTS |
| **13. Paid vs FREE Epistemic Boundary** | ❌ FUTURE | ✅ RP Authority §10 | ❌ None | ◩ Display Ceilings | ◩ Partial | ◩ FOUNDATION EXISTS |
| **14. Integration Monitor** | ❌ FUTURE | ❌ Spec Only | ❌ None | ❌ None | ❌ None | ❌ NOT IMPLEMENTED |
| **15. Public Layer (Web / UI)** | ⚠️ ACTIVE | ✅ RP Authority | ✅ UI Validators Pass| ✅ React Screens | ✅ Interactive | ◩ PARTIAL (Filing Metadata Only) |
| **16. Commercial Stack (4-Tier Ladder)**| ❌ FUTURE | ✅ RP Authority §5 | ❌ None | ❌ None | ❌ None | ❌ NOT IMPLEMENTED |

---

## DETAILED TREE BRANCH RECONCILIATION

### 1. ROOT THEORY / DEFINITIONAL AUTHORITY
- **Historical status:** ✅ CLOSED
- **Current status:** ✅ ACCEPTED + VERIFIED + APPLICABLY IMPLEMENTED
- **Governance authority:** `MERGEVUE ROOT DEFINITIONAL AUTHORITY v1.7`, archive SHA-256 `8decabd692e1c401a381e7484961758325b27aee89a455b8d586a98a85c4ccdf`.
- **Implementation path:** `src/data/environments.js`, `src/models/canonicalEnums.ts`, `src/constants/envAliases.ts`.
- **Notes:** Exact 9 Environment state space (R1: 26, R2: 14, R3: 10, R4: 9) is structurally respected in code and schemas.

### 2. EPISTEMIC / SAFETY GOVERNANCE
- **Historical status:** ✅ CLOSED
- **Current status:** ✅ ACCEPTED + VERIFIED + APPLICABLY IMPLEMENTED
- **Governance authority:** `MERGEVUE_CAUSALITY_PROOF_AND_AGENT_CONTROL.md`, `Antigravity_Antigallucination.md`.
- **Implementation path:** `src/agent/semanticValidator.js`, `src/historical/errors.js` (`failClosed`), `scripts/validate-nse-forced-failure.mjs`.
- **Enforcement:** No synthetic respondents; no hindsight; no outcome->environment shortcut; no raw LLM to core.

### 3. LIVE RESPONDENT / QUESTIONNAIRE SYSTEM
- **Historical status:** ✅ CLOSED
- **Current status:** ◩ PARTIAL / FOUNDATION EXISTS
- **Governance authority:** NewLogic questionnaires corpus (`src/generated/newlogic/questionnaires.json`, `src/generated/newlogic/scoringAndTriage.json`).
- **Implementation path:** `src/flow/acquirerTrackFlow.js`, `src/flow/targetDiagnosticFlow.js`, `src/flow/targetSelfAssessmentFlow.js`, `src/flow/dualQuestionSemanticResolver.js`, `src/flow/candidatePairSelector.js`.
- **Divergence:** While questionnaire ingestion, scoring, and contradiction processing are implemented, they resolve to only 4 hardcoded candidate pairs in `src/flow/candidatePairSelector.js`. Full dynamic 81-pair determination is not operational.

### 4. DOCUMENTARY EVIDENCE SYSTEM
- **Historical status:** ✅ CLOSED
- **Current status:** ◩ PARTIAL / FOUNDATION EXISTS
- **Governance authority:** `docs/reference/root-definitional-v1.7/contract/CASE-3.4_CONTRACT_v1.3.md` (contract v1.3, SHA-256 `dae8143899cd4fb7e406b4b410e9730a6f8bf7853989f3ef9757edeec293ae39`), Level-1 Mode-D Delta v0.2.
- **Implementation path:** `src/server/_secResearch.ts`, `src/server/_level1ModeDSlice1.ts`, `src/historical/retrieval.js`.
- **Divergence:** Automated documentary ingress is implemented only for recent SEC filing metadata (Level-1 Mode-D Slice-1). Ingress of deep documentary artifacts (historical 10-K, proxy statements, news archives) is performed manually/agent-assisted in research workbenches, not via automated software.

### 5. HISTORICAL CALIBRATION PROGRAM (9 CASES)
- **Historical status:** ⚠️ ACTIVE (DISC-2) / ❌ CASES 4–10
- **Current status:** ⛔ RESEARCH SEALED / ENGINE BLOCKED
- **Governance authority:**
  - Active 9-case membership and geometry: `docs/governance/MERGEVUE_CALIBRATION_9_CASE_CORPUS_ADDENDUM_2026-09-25.md` (SHA-256 `fb602181de969bcc91d5ff76f01afefcc2bc1705870e51a677eb2135877b8229`, bound `d177386`).
  - Durable outcome-IV authority: `docs/governance/historical-corpus/outcome-iv/MERGEVUE_OUTCOME_IV_DURABLE_AUTHORITY_BINDING_2026-09-25.md` (SHA-256 `568b51643d4103d0777bd35acf37d514ad9166516aec7748a0addc6b98bb8f94`, bound `6ad8933`).
  - Input corpus freeze candidate: `docs/governance/historical-corpus/MERGEVUE_POST_10_CALIBRATION_9_CASE_CORPUS_FREEZE_2026-09-25.md` (SHA-256 `da9b9de2ab9c49cf98100c008eb980225cf8595b2873cc4eb6eb6d8e9733cbd6`, bound `d52e7f4`, candidate awaiting IV/acceptance).
- **Evidence path:** `MergeVue-M&A WORKBENCH/02_CASE_RESEARCH/` (all 9 active case folders present with complete sealed chains).
- **Active 9 Cases:** (1) `daimler-chrysler`, (2) `deutsche-bankers-trust`, (3) `pfizer-megamergers`, (4) `aol-time-warner`, (5) `aecom-urs`, (6) `exxon-mobil`, (7) `jpmorgan-bank-one`, (8) `google-android`, (9) `amazon-whole-foods`. Disney–Pixar preserved outside active calibration corpus.
- **Reality:**
  - Case count is 9 (Disney excluded due to material factual delta).
  - All 9 active cases completed blind research cycles, Prediction Seals, outcome reveals, and independent outcome audits (`ALL_9_ACTIVE_CASES_HAVE_COMPLETED_REQUIRED_CASE_LEVEL_BLIND_CYCLE_LAYERS = YES`).
  - However, **no case has run through an automated software pipeline**. Full-engine historical reports are blocked by the absence of an automated HEDC classifier and pair/friction engine.

### 6. HISTORICAL ENVIRONMENT ROUTE (OD-MS-9 / MD-2 / HEDC)
- **Historical status:** ⚠️ ACTIVE
- **Current status:** ⛔ BLOCKED BY DEPENDENCY
- **Governance authority:** `docs/MD-2_HISTORICAL_ENVIRONMENT_INFERENCE_OPERATOR_v0.1_CORR6.md` (SHA-256 `02b769126c3b6477fb93b29652d2866da8e86473a08f3d871dc052d00b50f5ba`).
- **Implementation path:** `src/historical/md2.js`, `scripts/validate-md2-offline.mjs`.
- **Reality:** MD-2 operator v0.1.CORR6 is implemented and passes all 195 conformance tests (`scripts/validate-md2-offline.mjs`), but it is an *inference validator*, not an *environment classifier*. It yields `NOT_DETERMINABLE_STRUCTURAL_SUPPORT_ONLY` and `environmentBinding: null`. HEDC has not been derived or frozen.

### 7. METHOD FREEZE POST-CALIBRATION
- **Historical status:** ❌ FUTURE
- **Current status:** ❌ NOT REACHED / ⛔ BLOCKED BY HEDC AND 9-CASE CALIBRATION RUNS
- **Reality:** Control Tree Branch 7 defines the post-calibration methodology freeze of scoring rules, which occurs only after the 9-case calibration runs and HEDC classifier derivation are complete. It is separate and downstream from the nine-case input corpus freeze candidate (`POST-10-CALIBRATION-9-CASE-CORPUS-FREEZE-1`).

### 8. EXISTING HARD-CORE FOUNDATIONS
- **Historical status:** ✅ CLOSED
- **Current status:** ◩ PARTIAL / FOUNDATION EXISTS
- **Governance authority:** Accepted historical core formulas and static matrix models.
- **Implementation path:** `src/flow/` and legacy `src/data/` modules.
- **Reality:** Foundation exists as in-memory modules and static matrices, but dynamic runtime coupling to the canonical 81-pair engine is not implemented.

### 9. TARGET HARD-CODED ANALYTICAL CORE
- **Historical status:** ❌ FUTURE
- **Current status:** ❌ NOT IMPLEMENTED
- **Reality:** The automated pipeline described in Control Tree §9 (canonical evidence ingestion, direct Environment determination, documentary hypothesis, competing hypotheses, scenario branching, prediction engine) does not exist in code.

### 10. FREE MARKET LAUNCH (12 CANONICAL BLOCKS)
- **Historical status:** ⚠️ ACTIVE
- **Current status:** ◩ PARTIAL (Shell / Metadata Only)
- **Governance authority:** `MERGEVUE_REPORT_PRODUCT_AUTHORITY_v1.0_2026-09-21.md` (Blocks 1–12, SHA-256 `e52029d9187b2dae708a3796603a5cc94e367734068e32f37b861b1124526f33`).
- **Implementation path:** `src/server/_level1ModeDPublicReportProjection.ts`, `src/reporting/mergevueCanonicalPublicReportRegistry.js`, `src/screens/public/PublicResearchResultScreen.jsx`.
- **Reality:** Web UI displays the 12 blocks, but all analytical blocks (Blocks 2–10) are populated with `INSUFFICIENT_PUBLIC_EVIDENCE` when real public companies are queried.

### 11. PAID DEAL DIAGNOSTIC (19 CANONICAL BLOCKS)
- **Historical status:** ❌ FUTURE
- **Current status:** ❌ NOT IMPLEMENTED
- **Governance authority:** `MERGEVUE_CONTROL_TREE_REPORT_PRODUCT_ADDENDUM_2026-09-21.md` (§1.1, Blocks 13–19, SHA-256 `83cdd1ec02f11579167ef24737fd8f2c24e8f6bd7993909054649dcc3e776815`).
- **Implementation path:** 0% implemented in `src/` or `api/`.
- **Reality:** Governance contract accepted; zero software implementation.

### 16. COMMERCIAL STACK (4-TIER LADDER)
- **Historical status:** ❌ FUTURE (Monolithic)
- **Current status:** ❌ NOT IMPLEMENTED
- **Governance authority:** Report Product Authority §5 ($5k Private Evidence Review, $10k Economic Linkage Analysis, $15k Multi-Dependency Review, $30k Investment Committee Analysis).
- **Implementation path:** Zero billing, checkout, or tier entitlement enforcement code exists in `src/` or `api/`.

---

## ANALYTICAL LINEAGE RECONCILIATION: STAGE 1 & STAGE 2

### Stage 1 Factual Successor
- **Status:** ✅ CLOSED & BOUND (Commit `92236dc`, 19/19 defects corrected, IV1 PASS, Owner accepted).
- **Bound Authority:** `docs/governance/historical-corpus/MERGEVUE_STAGE1_FACTUAL_AUTHORITY_SUCCESSOR_BINDING_AND_CLOSURE_2026-09-25.md` (SHA-256 `be9593a767edfa1d61787458db3de1c7034d49ac60b65fe0ce8e11402fe70237`, verified against authoritative `.sha256` sidecar).

### Stage 2 Effective-View Assembly
- **Status:** ⚠️ ACTIVE / PENDING REPAIR
- **Predecessor Bindings:**
  - CORR10 semantic separation implementation bound at `9b1545e`.
  - F0024 provenance reconciliation bound at `fcbcf86`.
  - A-E001 readjudication bound at `3d7b777`.
- **Assembly State:**
  - Assembly candidate 1 failed independent verification IV1 by Codex (4 findings).
  - Assembly CORR1 build script authored by Z-Ai at `WORKBENCH/DOWNLOADS/STAGE2_FINAL_EFFECTIVE_VIEW_ASSEMBLY_1_CORR1_2026-10-07/STAGE2_FINAL_EFFECTIVE_VIEW_ASSEMBLY_1_CORR1_BUILD.py`, but **unexecuted**. Output artifacts remain unmaterialized.

---

## DEPENDENCY BLOCKER GRAPH

```text
[Stage 1 Factual Successor] ✅ CLOSED (commit 92236dc, SHA-256 be9593a7...)
             │
             ▼
[Stage 2 Assembly CORR1] ⚠️ SCRIPT AUTHORED / UNMATERIALIZED
             │
             ▼
[HEDC Derivation & Freeze] ❌ NOT DERIVED (MD-2 structural only)
             │
             ▼
[Automated Environment Classifier] ❌ NOT IMPLEMENTED
             │
             ▼
[Automated Pair / ECS / Friction Core] ❌ NOT IMPLEMENTED
             │
             ▼
[9-Case Full-Engine Software Execution] ⛔ BLOCKED
             │
             ▼
[9-Case Final Replay & Public Case Studies] ⛔ BLOCKED
             │
             ▼
[FREE Market Launch Public Proof Gate] ⛔ BLOCKED
```

---

## CORRECTION LEDGER (CORR1 — 2026-10-07)

| Item | Reference / Location | Old Value | New Value | Source Authority | Reason for Correction |
|---|---|---|---|---|---|
| 1 | Header: Accepted Governance Addenda | `MERGEVUE_STAGE1_FACTUAL_AUTHORITY_SUCCESSOR_BINDING_AND_CLOSURE_2026-09-25.md (SHA-256 da9b9de2...)` | `docs/governance/historical-corpus/MERGEVUE_STAGE1_FACTUAL_AUTHORITY_SUCCESSOR_BINDING_AND_CLOSURE_2026-09-25.md (SHA-256 be9593a767edfa1d61787458db3de1c7034d49ac60b65fe0ce8e11402fe70237, bound 92236dc)` | `MERGEVUE_STAGE1_FACTUAL_AUTHORITY_SUCCESSOR_BINDING_AND_CLOSURE_2026-09-25.sha256` | Fixed erroneous SHA-256 reference. `da9b9de2...` was the hash of the corpus freeze candidate; `be9593a7...` is the verified hash of the Stage-1 document. |
| 2 | Header: Known Reconciliation Issues | Conflated corpus freeze candidate with "post-calibration method freeze". | Disambiguated 9-case corpus membership (`d177386`), outcome-IV binding (`6ad8933`), corpus freeze candidate (`d52e7f4`), and post-calibration Method Freeze (Branch 7). | `docs/governance/MERGEVUE_CALIBRATION_9_CASE_CORPUS_ADDENDUM_2026-09-25.md`, `docs/governance/MERGEVUE_CONTROL_TREE_v2.1_2026-09-04.md` §7 | Eliminated conceptual conflation between input population corpus freeze candidate and analytical scoring method freeze. |
| 3 | Section 2: Table Row 1 (Root Theory) | `Verified (8decabd6)` | `Verified (v1.7 archive 8decabd6...)` | `MERGEVUE ROOT DEFINITIONAL AUTHORITY v1.7` archive digest | Clarified that `8decabd6...` is the archive digest, not a git commit hash. |
| 4 | Section 3: Branch 3 (Questionnaire System) | `candidatePairSelector.js`, `questionnaires.json`, `scoringAndTriage.json` | `src/flow/candidatePairSelector.js`, `src/generated/newlogic/questionnaires.json`, `src/generated/newlogic/scoringAndTriage.json` | Repository file tree | Added explicit physical paths to tracked and generated files. |
| 5 | Section 3: Branch 4 (Documentary Ingress) | `docs/CASE-3.4_RETROSPECTIVE_DOCUMENTARY_INGRESS_CONTRACT.md` | `docs/reference/root-definitional-v1.7/contract/CASE-3.4_CONTRACT_v1.3.md` (contract v1.3, SHA-256 `dae8143899cd4fb7e406b4b410e9730a6f8bf7853989f3ef9757edeec293ae39`) | Physical repository file tree | Corrected non-existent path to actual physical file location. |
| 6 | Section 3: Branch 5 (Historical Calibration) | Partial case notes without full active list | Enumerated all 9 active cases (1–9) and cited durable outcome-IV binding (`6ad8933`) and input freeze candidate (`d52e7f4`). | `MERGEVUE_CALIBRATION_9_CASE_CORPUS_ADDENDUM_2026-09-25.md`, `MERGEVUE_OUTCOME_IV_DURABLE_AUTHORITY_BINDING_2026-09-25.md` | Provided full referential and case identity completeness. |
| 7 | Section 3: Numbering & Branch Hierarchy | "7. STAGE 1 & STAGE 2 ANALYTICAL PROCESSING" displaced Branch 7 and collapsed Branch 8 | Restored Branch 7 (Method Freeze Post-Calibration) and Branch 8 (Existing Hard-Core Foundations); moved Stage 1 & 2 into dedicated analytical lineage section. | `docs/governance/MERGEVUE_CONTROL_TREE_v2.1_2026-09-04.md` §§7–8 | Aligned overlay structure with canonical Control Tree branch numbers. |
| 8 | Section 3: Stage 2 Assembly Build Script | `STAGE2_FINAL_EFFECTIVE_VIEW_ASSEMBLY_1_CORR1_BUILD.py` | `WORKBENCH/DOWNLOADS/STAGE2_FINAL_EFFECTIVE_VIEW_ASSEMBLY_1_CORR1_2026-10-07/STAGE2_FINAL_EFFECTIVE_VIEW_ASSEMBLY_1_CORR1_BUILD.py` | Physical filesystem | Fixed bare filename to full relative path. |
