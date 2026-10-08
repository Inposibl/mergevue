# MERGEVUE M&A — CURRENT-STATE CONTROL TREE OVERLAY (2026-10-07)

> **STATUS: DIAGNOSTIC CANDIDATE / NOT CONTROLLING GOVERNANCE**
> **LEGALITY / GOVERNANCE NOTICE:** This document is an empirical diagnostic candidate produced by the repository reality audit (`MERGEVUE_FULL_REPOSITORY_AND_NINE_CASE_REALITY_AUDIT_1`), refined under `MERGEVUE_CURRENT_STATE_TREE_OVERLAY_CORR1`, and corrected by `MERGEVUE_CURRENT_STATE_TREE_OVERLAY_CORR2` (2026-10-07) after the independent audit `MERGEVUE_CURRENT_STATE_TREE_OVERLAY_CORR1.IV1` (auditor: Codex) returned **FAIL (0 BLOCKING / 4 MAJOR / 2 MINOR)** against the CORR1 candidate. It does **NOT** supersede controlling governance authority (`docs/governance/MERGEVUE_CONTROL_TREE_v2.1_2026-09-04.md`) or any accepted governance addendum.
>
> **KNOWN RECONCILIATION ISSUES RECORDED:**
> 1. **Corpus-Freeze Status vs Method Freeze:** Active 9-case corpus membership and geometry was accepted and bound via `docs/governance/MERGEVUE_CALIBRATION_9_CASE_CORPUS_ADDENDUM_2026-09-25.md` (SHA-256 `fb602181...`, commit `d177386`) and durable outcome-IV authority was bound via `docs/governance/historical-corpus/outcome-iv/MERGEVUE_OUTCOME_IV_DURABLE_AUTHORITY_BINDING_2026-09-25.md` (SHA-256 `568b5164...`, commit `6ad8933`). The nine-case input corpus freeze candidate `docs/governance/historical-corpus/MERGEVUE_POST_10_CALIBRATION_9_CASE_CORPUS_FREEZE_2026-09-25.md` (SHA-256 `da9b9de2...`, commit `d52e7f4`) declares itself `READY_FOR_INDEPENDENT_VERIFICATION` / `OWNER_ACCEPTED: NO` / `CORPUS_FREEZE_FINAL: NO`; no later candidate-specific lifecycle record (IV verdict or Owner decision) was located in repository or Workbench evidence as of 2026-10-07, so its current external acceptance status is **NOT ESTABLISHED FROM AVAILABLE EVIDENCE** — the frozen candidate wording alone does not prove its current status either way. This calibration input freeze is distinct from the downstream post-calibration Method Freeze (Branch 7), which is a separate future gate that remains unreached.
> 2. **SHA Identity Discrepancies:** Multiple historical audit reports and candidate packages in the workbench contain SHA-256 reference mismatches or cite non-canonical intermediate manifests. Specifically, the SHA-256 hash previously cited for Stage-1 (`da9b9de2...`) was identified as the hash of the nine-case corpus freeze candidate (`MERGEVUE_POST_10_CALIBRATION_9_CASE_CORPUS_FREEZE_2026-09-25.md`), whereas the true authoritative Stage-1 SHA-256 is `be9593a767edfa1d61787458db3de1c7034d49ac60b65fe0ce8e11402fe70237`, as verified against physical bytes and sidecar.
> 3. **Overbroad Implementation Status Claims:** Prior historical handoff notes claiming "operational" or "implemented" status for downstream analytical blocks reflect only surface-level metadata or test mocks; in runtime reality the Mode-D public projection exposes only bounded evidence-gap states (Blocks 2–8 `INSUFFICIENT_PUBLIC_EVIDENCE`; Block 9 `NOT_APPLICABLE`; Block 10 `LIMITED` — see Branch 10), the Stage-2 CORR1 candidate outputs are physically materialized but remain independently unverified and Owner-unaccepted (see Analytical Lineage section), and the automated HEDC classifier is unwritten.

**Act:** `MERGEVUE_FULL_REPOSITORY_AND_NINE_CASE_REALITY_AUDIT_1` (Updated: `MERGEVUE_CURRENT_STATE_TREE_OVERLAY_CORR1`; corrected: `MERGEVUE_CURRENT_STATE_TREE_OVERLAY_CORR2`)
**Date:** 2026-10-07
**Parent Governance Baseline:** `docs/governance/MERGEVUE_CONTROL_TREE_v2.1_2026-09-04.md` (SHA-256 `360bafa29bad5ea93752323d4a217bf59aaec628e0e2b236350a2edd9c1f7128`)
**Accepted Governance Addenda:**
- `docs/governance/MERGEVUE_CONTROL_TREE_REPORT_PRODUCT_ADDENDUM_2026-09-21.md` (SHA-256 `83cdd1ec02f11579167ef24737fd8f2c24e8f6bd7993909054649dcc3e776815`)
- `docs/governance/MERGEVUE_REPORT_PRODUCT_AUTHORITY_v1.0_2026-09-21.md` (SHA-256 `e52029d9187b2dae708a3796603a5cc94e367734068e32f37b861b1124526f33`)
- `docs/governance/MERGEVUE_CALIBRATION_9_CASE_CORPUS_ADDENDUM_2026-09-25.md` (SHA-256 `fb602181de969bcc91d5ff76f01afefcc2bc1705870e51a677eb2135877b8229`, bound `d177386`)
- `docs/governance/historical-corpus/outcome-iv/MERGEVUE_OUTCOME_IV_DURABLE_AUTHORITY_BINDING_2026-09-25.md` (SHA-256 `568b51643d4103d0777bd35acf37d514ad9166516aec7748a0addc6b98bb8f94`, bound `6ad8933`)
- `docs/governance/historical-corpus/MERGEVUE_STAGE1_FACTUAL_AUTHORITY_SUCCESSOR_BINDING_AND_CLOSURE_2026-09-25.md` (SHA-256 `be9593a767edfa1d61787458db3de1c7034d49ac60b65fe0ce8e11402fe70237`, bound `92236dc`)

**Candidate Lineage Artifacts (Not Owner-Accepted Authority):**
- `docs/governance/historical-corpus/MERGEVUE_POST_10_CALIBRATION_9_CASE_CORPUS_FREEZE_2026-09-25.md` (SHA-256 `da9b9de2ab9c49cf98100c008eb980225cf8595b2873cc4eb6eb6d8e9733cbd6`, bound `d52e7f4`) — `OWNER-AUTHORIZED CORPUS-FREEZE CANDIDATE`; current external IV/acceptance status NOT ESTABLISHED FROM AVAILABLE EVIDENCE (see Known Issue 1).

**Status Legend (CORR2 dimension-scoped notation):**
A single symbol must never collapse distinct evidence dimensions (Control Tree v2.1 §0 Evidence-status rule; Git Worktree Closure Governance §21). This overlay therefore uses dimension tags instead of a bare ✅:

- ✅**G** — GOVERNANCE ACCEPTED (an Owner-accepted decision/artifact exists for this item)
- ✅**IV** — INDEPENDENTLY VERIFIED (a non-author verifier verified the exact candidate identity)
- ✅**B** — GIT-BOUND (physically bound in a commit; hash/sidecar checked)
- ✅**C** — CODE IMPLEMENTED (module exists in tracked source at the stated scope; existence is not runtime or production proof)
- ✅**E** — EXECUTED/OPERATIONAL IN APP RUNTIME (observed executing in the running application)
- ✅**I** — INTEGRATED into the canonical product path
- ✅**P** — PRODUCTION OPERATIONAL (deployed and causality-proven per `MERGEVUE_CAUSALITY_PROOF_AND_AGENT_CONTROL.md`)
- ◩ **PARTIAL / FOUNDATION EXISTS** (foundational modules or partial candidate exists; incomplete integration)
- ⚠️ **ACTIVE / PENDING** (active candidate, under review, or unmaterialized repair)
- ❌ **NOT IMPLEMENTED / NOT CLOSED** (required by roadmap/spec, but absent from code/runtime)
- ⛔ **BLOCKED BY DEPENDENCY** (cannot proceed until predecessor stage closes)
- ? **NOT ESTABLISHED / INSUFFICIENT EVIDENCE** (evidence missing or inconclusive)

Validator PASS, code existence, and artifact presence each carry only their own dimension. No tag above implies any other.

---

## MULTI-DIMENSIONAL STATUS OVERVIEW TABLE

| Major Tree Branch | Historical Tree (v2.1, translated) | Governance Authority | Independent Verification | Implemented Code | Operational Runtime | Current Reality Status |
|---|---|---|---|---|---|---|
| **1. Root Theory & Definitions** | ✅G+✅IV per v2.1 (CLOSED as written) | ✅G v1.7 Accepted | ✅IV (v1.7 archive digest `8decabd6...`) | ✅C `src/data/environments.js` | ✅C in-memory data modules (no runtime math claimed) | ✅C IMPLEMENTED (code dimension) |
| **2. Epistemic & Safety Governance** | ✅G+✅IV per v2.1 (CLOSED as written) | ✅G Accepted | ✅IV | ✅C Multiple Validators | ✅C validator enforcement in code (runtime integration not independently proven) | ✅C IMPLEMENTED (code dimension) |
| **3. Live Respondent / Questionnaire** | ✅G+✅IV per v2.1 (CLOSED as written) | ✅G Accepted | ✅IV | ✅C `src/flow/` modules | ◩ Partial (Mock Pairs) | ◩ FOUNDATION EXISTS |
| **4. Documentary Evidence System** | ✅G+✅IV per v2.1 (CLOSED as written) | ✅G CASE-3.4 v1.3 | ✅IV (contract digest `dae81438...`) | ✅C Ingress Validators | ◩ Mode-D Only | ◩ FOUNDATION EXISTS |
| **5. Historical Calibration (9 Cases)** | ⚠️ per v2.1 (ACTIVE/DISC-2 as written) | ✅G+✅B 9-Case Addendum (`d177386`) | ✅IV per-case outcome IVs per accepted durable authority (binding `6ad8933`) | ❌ No Engine Code | ❌ Research Only | ⛔ RESEARCH SEALED / ENGINE BLOCKED |
| **6. Historical Environment Route (HEDC)**| ⚠️ per v2.1 (ACTIVE/OD-MS-9 as written) | ◩ Draft Contract (local evidence only; not Git-bound) | ❌ Not Verified | ✅C `src/historical/md2.js` (validator) | ❌ Struct Only | ⛔ BLOCKED (No Classifier) |
| **7. Method Freeze Post-Calibration** | ❌ per v2.1 (FUTURE as written) | ❌ Not Reached | ❌ Not Reached | ❌ None | ❌ None | ⛔ BLOCKED BY HEDC |
| **8. Existing Hard-Core Foundations** | ✅G+✅IV per v2.1 (CLOSED as written) | ✅G Accepted | ✅IV | ◩ Legacy Modules | ◩ Static Matrices | ◩ FOUNDATION EXISTS |
| **9. Target Hard-Coded Analytical Core**| ❌ per v2.1 (FUTURE as written) | ❌ Spec Only | ❌ None | ❌ None | ❌ None | ❌ NOT IMPLEMENTED |
| **10. FREE Market Launch (12 Blocks)** | ⚠️ per v2.1 (ACTIVE as written) | ✅G RP Authority v1.0 | ◩ Bounded Slice-1 IV PASS reported 2026-09-19 (agent-reported; slice Owner acceptance not separately recorded) | ◩ Mode-D Slice-1 | ◩ Report Shell Only (Bounded Evidence-Gap States) | ◩ PARTIAL (Shell / Metadata Only) |
| **11. Paid Deal Diagnostic (19 Blocks)** | ❌ per v2.1 (FUTURE as written) | ✅G RP Authority v1.0 | ❌ None | ❌ 0% in `src/` | ❌ None | ❌ NOT IMPLEMENTED |
| **12. Temporarily FREE Version** | ❌ per v2.1 (FUTURE as written) | ✅G RP Authority (Anonymous FREE semantics) | ❌ None | ◩ Routed Deliverable Flow | ◩ Static Deliverables | ◩ FOUNDATION EXISTS |
| **13. Paid vs FREE Epistemic Boundary** | ❌ per v2.1 (FUTURE as written) | ✅G RP Authority §10 | ❌ None | ◩ LIMITED Display-Ceiling States | ◩ Partial | ◩ FOUNDATION EXISTS |
| **14. Integration Monitor** | ❌ per v2.1 (FUTURE as written) | ❌ Spec Only | ❌ None | ❌ None | ❌ None | ❌ NOT IMPLEMENTED |
| **15. Public Layer (Web / UI)** | ⚠️ per v2.1 (ACTIVE as written) | ✅G RP Authority | ❌ Not independently established for current UI | ✅C React Screens + Routes | ✅C UI Layer Present (runtime interactivity not re-established by this act) | ◩ PARTIAL (Filing Metadata Only) |
| **16. Commercial Stack (4-Tier Ladder)**| ❌ per v2.1 (FUTURE as written) | ✅G RP Authority §5 | ❌ None | ❌ None | ❌ None | ❌ NOT IMPLEMENTED |

---

## DETAILED TREE BRANCH RECONCILIATION

### 1. ROOT THEORY / DEFINITIONAL AUTHORITY
- **Historical status (v2.1 as written):** ✅G+✅IV — v2.1 records this branch CLOSED (independently verified + Owner-accepted).
- **Current status:** ✅G (governance) + ✅IV (archive verification) + ✅C (code implementation). Production-operation status is not claimed.
- **Governance authority:** `MERGEVUE ROOT DEFINITIONAL AUTHORITY v1.7`, archive SHA-256 `8decabd692e1c401a381e7484961758325b27aee89a455b8d586a98a85c4ccdf` (verified against the physical v1.7 archive ZIP in the external Workbench).
- **Implementation path:** `src/data/environments.js`, `src/models/canonicalEnums.ts`, `src/constants/envAliases.ts`.
- **Notes:** Exact 9 Environment state space (R1: 26, R2: 14, R3: 10, R4: 9) is structurally respected in code and schemas.

### 2. EPISTEMIC / SAFETY GOVERNANCE
- **Historical status (v2.1 as written):** ✅G+✅IV — CLOSED per v2.1.
- **Current status:** ✅G + ✅IV + ✅C (validators and fail-closed error paths exist in tracked source). Runtime enforcement at production scope is not separately proven.
- **Governance authority:** `MERGEVUE_CAUSALITY_PROOF_AND_AGENT_CONTROL.md`, `Antigravity_Antigallucination.md`.
- **Implementation path:** `src/agent/semanticValidator.js`, `src/historical/errors.js` (`failClosed`), `scripts/validate-nse-forced-failure.mjs`.
- **Enforcement:** No synthetic respondents; no hindsight; no outcome->environment shortcut; no raw LLM to core.

### 3. LIVE RESPONDENT / QUESTIONNAIRE SYSTEM
- **Historical status (v2.1 as written):** ✅G+✅IV — CLOSED per v2.1.
- **Current status:** ◩ PARTIAL / FOUNDATION EXISTS
- **Governance authority:** NewLogic questionnaires corpus (`src/generated/newlogic/questionnaires.json`, `src/generated/newlogic/scoringAndTriage.json`).
- **Implementation path:** `src/flow/acquirerTrackFlow.js`, `src/flow/targetDiagnosticFlow.js`, `src/flow/targetSelfAssessmentFlow.js`, `src/flow/dualQuestionSemanticResolver.js`, `src/flow/candidatePairSelector.js`.
- **Divergence:** While questionnaire ingestion, scoring, and contradiction processing are implemented, they resolve to only 4 hardcoded candidate pairs in `src/flow/candidatePairSelector.js`. Full dynamic 81-pair determination is not operational.

### 4. DOCUMENTARY EVIDENCE SYSTEM
- **Historical status (v2.1 as written):** ✅G+✅IV — CLOSED per v2.1.
- **Current status:** ◩ PARTIAL / FOUNDATION EXISTS
- **Governance authority:** `docs/reference/root-definitional-v1.7/contract/CASE-3.4_CONTRACT_v1.3.md` (contract v1.3, SHA-256 `dae8143899cd4fb7e406b4b410e9730a6f8bf7853989f3ef9757edeec293ae39`), Level-1 Mode-D Delta v0.2.
- **Implementation path:** `src/server/_secResearch.ts`, `src/server/_level1ModeDSlice1.ts`, `src/historical/retrieval.js`.
- **Divergence:** Automated documentary ingress is implemented only for recent SEC filing metadata (Level-1 Mode-D Slice-1). Ingress of deep documentary artifacts (historical 10-K, proxy statements, news archives) is performed manually/agent-assisted in research workbenches, not via automated software.

### 5. HISTORICAL CALIBRATION PROGRAM (9 CASES)
- **Historical status (v2.1 as written):** ⚠️ ACTIVE (DISC-2) / cases 4–10 not then closed.
- **Current status:** ⛔ RESEARCH SEALED / ENGINE BLOCKED
- **Governance authority:**
  - Active 9-case membership and geometry: `docs/governance/MERGEVUE_CALIBRATION_9_CASE_CORPUS_ADDENDUM_2026-09-25.md` (SHA-256 `fb602181de969bcc91d5ff76f01afefcc2bc1705870e51a677eb2135877b8229`, bound `d177386`). ✅G+✅B
  - Durable outcome-IV authority: `docs/governance/historical-corpus/outcome-iv/MERGEVUE_OUTCOME_IV_DURABLE_AUTHORITY_BINDING_2026-09-25.md` (SHA-256 `568b51643d4103d0777bd35acf37d514ad9166516aec7748a0addc6b98bb8f94`, bound `6ad8933`). ✅G+✅B
  - Input corpus freeze candidate: `docs/governance/historical-corpus/MERGEVUE_POST_10_CALIBRATION_9_CASE_CORPUS_FREEZE_2026-09-25.md` (SHA-256 `da9b9de2ab9c49cf98100c008eb980225cf8595b2873cc4eb6eb6d8e9733cbd6`, bound `d52e7f4`). ✅B as to physical binding; current external IV/acceptance status ? NOT ESTABLISHED FROM AVAILABLE EVIDENCE (frozen candidate wording is not proof of current lifecycle status).
- **Evidence path:** `MergeVue-M&A WORKBENCH/02_CASE_RESEARCH/` (all 9 active case folders present with complete sealed chains).
- **Active 9 Cases:** (1) `daimler-chrysler`, (2) `deutsche-bankers-trust`, (3) `pfizer-megamergers`, (4) `aol-time-warner`, (5) `aecom-urs`, (6) `exxon-mobil`, (7) `jpmorgan-bank-one`, (8) `google-android`, (9) `amazon-whole-foods`. Disney–Pixar preserved outside active calibration corpus.
- **Reality:**
  - Case count is 9 (Disney excluded due to material factual delta).
  - All 9 active cases completed blind research cycles, Prediction Seals, outcome reveals, and independent outcome audits per the accepted durable outcome-IV authority record.
  - However, **no case has run through an automated software pipeline**. Full-engine historical reports are blocked by the absence of an automated HEDC classifier and pair/friction engine.

### 6. HISTORICAL ENVIRONMENT ROUTE (OD-MS-9 / MD-2 / HEDC)
- **Historical status (v2.1 as written):** ⚠️ ACTIVE
- **Current status:** ⛔ BLOCKED BY DEPENDENCY
- **Governance authority:** `docs/MD-2_HISTORICAL_ENVIRONMENT_INFERENCE_OPERATOR_v0.1_CORR6.md` (SHA-256 `02b769126c3b6477fb93b29652d2866da8e86473a08f3d871dc052d00b50f5ba`) — **local candidate-methodology evidence only**: the digest matches the physical local file, but the document is **not bound in the audited commit** and has no adjacent checksum sidecar; its Git-bound authority status is therefore not established.
- **Implementation path:** `src/historical/md2.js`, `scripts/validate-md2-offline.mjs`.
- **Reality:** MD-2 operator v0.1.CORR6 is implemented and its offline validator reports 195 conformance assertions (`scripts/validate-md2-offline.mjs`; not re-executed by this correction act), but it is an *inference validator*, not an *environment classifier*. It yields `NOT_DETERMINABLE_STRUCTURAL_SUPPORT_ONLY` and `environmentBinding: "NONE"` (source: `src/historical/md2.js`; the validator also asserts `"NONE"`). Structural validation ≠ substantive Environment determination. HEDC has not been derived or frozen.

### 7. METHOD FREEZE POST-CALIBRATION
- **Historical status (v2.1 as written):** ❌ FUTURE
- **Current status:** ❌ NOT REACHED / ⛔ BLOCKED BY HEDC AND 9-CASE CALIBRATION RUNS
- **Reality:** Control Tree Branch 7 defines the post-calibration methodology freeze of scoring rules — an explicit Owner METHOD FREEZE DECISION (full / partial-tiered / reject-redesign) taken only after the program falsification gate, the 9-case calibration runs, and HEDC classifier derivation are complete. It is separate and downstream from the nine-case input corpus freeze candidate (`POST-10-CALIBRATION-9-CASE-CORPUS-FREEZE-1`).

### 8. EXISTING HARD-CORE FOUNDATIONS
- **Historical status (v2.1 as written):** ✅G+✅IV — CLOSED per v2.1.
- **Current status:** ◩ PARTIAL / FOUNDATION EXISTS
- **Governance authority:** Accepted historical core formulas and static matrix models.
- **Implementation path:** `src/flow/` and legacy `src/data/` modules.
- **Reality:** Foundation exists as in-memory modules and static matrices, but dynamic runtime coupling to the canonical 81-pair engine is not implemented.

### 9. TARGET HARD-CODED ANALYTICAL CORE
- **Historical status (v2.1 as written):** ❌ FUTURE
- **Current status:** ❌ NOT IMPLEMENTED
- **Reality:** The automated pipeline described in Control Tree §9 (canonical evidence ingestion, direct Environment determination, documentary hypothesis, competing hypotheses, scenario branching, prediction engine) does not exist in code.

### 10. FREE MARKET LAUNCH (12 CANONICAL BLOCKS)
- **Historical status (v2.1 as written):** ⚠️ ACTIVE
- **Current status:** ◩ PARTIAL (Shell / Metadata Only)
- **Governance authority:** `MERGEVUE_REPORT_PRODUCT_AUTHORITY_v1.0_2026-09-21.md` (Blocks 1–12, SHA-256 `e52029d9187b2dae708a3796603a5cc94e367734068e32f37b861b1124526f33`). ✅G
- **Implementation path:** `src/server/_level1ModeDPublicReportProjection.ts`, `src/reporting/mergevueCanonicalPublicReportRegistry.js`, `src/screens/public/PublicResearchResultScreen.jsx`.
- **Reality:** The web UI renders the canonical 12-block report shell for Level-1 Mode-D queries. The physical block states in `src/server/_level1ModeDPublicReportProjection.ts` (block assembly) are:
  - Block 1: `LIMITED` (ordered-pair identity, collection state, positively established public filing-index facts only);
  - Blocks 2–8: `INSUFFICIENT_PUBLIC_EVIDENCE`;
  - Block 9: `NOT_APPLICABLE` (no authorized acquisition step);
  - Block 10: `LIMITED` (bounded evidence-gap surface);
  - Blocks 11–12: `AVAILABLE` (static product-contract copy and public audit identifiers only).
  No analytical capability is inferred from the existence of the canonical report shell.

### 11. PAID DEAL DIAGNOSTIC (19 CANONICAL BLOCKS)
- **Historical status (v2.1 as written):** ❌ FUTURE
- **Current status:** ❌ NOT IMPLEMENTED
- **Governance authority:** `MERGEVUE_CONTROL_TREE_REPORT_PRODUCT_ADDENDUM_2026-09-21.md` (§1.1, Blocks 13–19, SHA-256 `83cdd1ec02f11579167ef24737fd8f2c24e8f6bd7993909054649dcc3e776815`). ✅G (contract acceptance only — the addendum itself separates acceptance from implementation).
- **Implementation path:** 0% implemented in `src/` or `api/`.
- **Reality:** Governance contract accepted; zero software implementation.

### 12. TEMPORARILY FREE VERSION
- **Historical status (v2.1 as written):** ❌ FUTURE (final market assembly absent by design)
- **Current status:** ◩ FOUNDATION EXISTS
- **Governance authority:** Report Product Authority v1.0 + Control-Tree Report-Product Addendum §2.1 (Anonymous FREE = Blocks 1–12; Blocks 7–10 LIMITED display ceiling). ✅G
- **Implementation path:** routed deliverable flow — `src/routes/routeModel.js` (`screen-12-email-capture`, `screen-12-consultation-request` routes), `src/flow/emailCaptureFlow.js`, `src/flow/finalDeliverableFlow.js`, `src/data/finalDeliverableData.js` (screen-12 copy). ✅C
- **Reality:** The legacy routed screen flow exists in code. The temporary-free market assembly (final release packaging of this version) is not assembled. ❌ release.

### 13. PAID vs FREE EPISTEMIC BOUNDARY
- **Historical status (v2.1 as written):** ❌ FUTURE (definitions exist; enforcement not built)
- **Current status:** ◩ FOUNDATION EXISTS
- **Governance authority:** Report Product Authority §10 + Addendum §2.3 (public/client black-box boundary; projection may not create analytical truth). ✅G
- **Implementation path:** LIMITED display-ceiling states in the FREE projection (`src/server/_level1ModeDPublicReportProjection.ts`, `src/reporting/mergevueCanonicalPublicReportRegistry.js`). ✅C partial
- **Reality:** Display-ceiling semantics exist in projection code; the full FREE/PAID epistemic-boundary validation family (entitlement checks, boundary validators) is not implemented. ❌ validation.

### 14. INTEGRATION MONITOR
- **Historical status (v2.1 as written):** ❌ FUTURE
- **Current status:** ❌ NOT IMPLEMENTED
- **Reality:** No integration-monitor code was found in `src/` or `api/` (inspection of this correction act). Control Tree §14's mandatory seal-binding edge (loading the exact sealed prediction package by digest) has no software implementation; research prediction-seal packages exist only as research artifacts in the Workbench, outside engine code. ⛔ blocked by the analytical core.

### 15. PUBLIC LAYER (WEB / UI)
- **Historical status (v2.1 as written):** ⚠️ ACTIVE (Public Preview, partial)
- **Current status:** ◩ PARTIAL (Filing Metadata Only)
- **Governance authority:** Report Product Authority + Addendum §2.3. ✅G
- **Implementation path:** `src/screens/public/` (`HomeScreen.jsx`, `DealEntryScreen.jsx`, `PublicResearchResultScreen.jsx`, `HowItWorksProcess.jsx`), `src/routes/routeModel.js`, `src/App.jsx`. ✅C
- **Reality:** The React public UI layer exists in tracked source and is routed. Independent verification of the current UI state is ❌ not established by this act; prior "UI validators pass" claims are not re-asserted here as verification. Public surfaces carry filing-metadata content only (see Branch 10 block states).

### 16. COMMERCIAL STACK (4-TIER LADDER)
- **Historical status (v2.1 as written):** ❌ FUTURE (monolithic)
- **Current status:** ❌ NOT IMPLEMENTED
- **Governance authority:** Report Product Authority §5 ($5k Private Evidence Review, $10k Economic Linkage Analysis, $15k Multi-Dependency Review, $30k Investment Committee Analysis) + Addendum §2.4 cumulative ladder. ✅G (commercial contracts/names accepted; implementation status separate)
- **Implementation path:** Zero billing, checkout, or tier entitlement enforcement code exists in `src/` or `api/`.
- **Reality:** No commercial implementation.

---

## REPORT-PRODUCT CONTROL RECONCILIATION (RP-1–RP-13)

The Report-Product Addendum §3 binds thirteen report-product invariants (RP-1 report-is-projection; RP-2 no report-driven methodology entities; RP-3 uncertainty survives projection; RP-4 no synthetic precision; RP-5 commercial boundary creates no analytical truth; RP-6 purchase remains client-controlled; RP-7 paid means work performed; RP-8 report temporal identity; RP-9 method changes apply only where materially dependent; RP-10 user historical cutoff is not canonical T0; RP-11 historical replay is not validation by default; RP-12 real/private companies use the same analytical universe; RP-13 domain-bounded decision support).

- **Governance disposition:** ✅G Owner-accepted as controlling invariants (Addendum is bound and sidecar-verified; they must be carried into the next consolidated Control Tree per Addendum §7).
- **Implementation disposition:** ❌ The addendum's own §1 terminal nodes keep `REPORT-PRODUCT IMPLEMENTATION ALIGNMENT`, `REPORT-PRODUCT VALIDATION / NON-REGRESSION`, and `REPORT-PRODUCT RELEASE CLOSURE` open. Individual RP invariants are enforced in code only where the corresponding projection/validator logic has been implemented and separately verified — **not established as a set** by this correction act.
- **No silent promotion:** RP governance acceptance is not implementation, verification, or release closure.

---

## ANALYTICAL LINEAGE RECONCILIATION: STAGE 1 & STAGE 2

### Stage 1 Factual Successor
- **Physical binding:** ✅B — commit `92236dc` binds the candidate document and its `.sha256` sidecar; the sidecar was re-verified against physical bytes (SHA-256 `be9593a767edfa1d61787458db3de1c7034d49ac60b65fe0ce8e11402fe70237`) in this correction act.
- **Independent verification of the successor-binding candidate:** ? **NOT ESTABLISHED FROM AVAILABLE EVIDENCE** — no candidate-specific IV report for `POST-10-CALIBRATION-STAGE1-FACTUAL-AUTHORITY-SUCCESSOR-BINDING-AND-CLOSURE-1` was located in the repository, the repo-local workbench, or the external Workbench as of 2026-10-07.
- **Owner acceptance of the successor-binding candidate bytes:** ? **NOT ESTABLISHED FROM AVAILABLE EVIDENCE** — the bound document's own authority chain records Owner acceptance of the predecessor `POST-10-CALIBRATION-STAGE1-TRANSFER-INTEGRITY-CORRECTION-CAMPAIGN-1` and of the four corrected package identities, which is a distinct act from acceptance of the successor-binding candidate bytes; no later Owner decision record for the successor-binding candidate was located. Immutable candidate wording (e.g., embedded status fields) does not prove current external status in either direction.
- **Bound Authority:** `docs/governance/historical-corpus/MERGEVUE_STAGE1_FACTUAL_AUTHORITY_SUCCESSOR_BINDING_AND_CLOSURE_2026-09-25.md` (SHA-256 `be9593a767edfa1d61787458db3de1c7034d49ac60b65fe0ce8e11402fe70237`, verified against authoritative `.sha256` sidecar).

### Stage 2 Effective-View Assembly
- **Status:** ☑ ACTIVE — CORR1 candidate materialized; independent verification and Owner acceptance pending.
- **Predecessor Bindings:**
  - CORR10 semantic separation implementation bound at `9b1545e`. ✅B
  - F0024 provenance reconciliation bound at `fcbcf86`. ✅B
  - A-E001 readjudication bound at `3d7b777`. ✅B
- **Failed predecessor:** Assembly candidate 1 (records SHA-256 `ea0de2f0...`) failed independent verification IV1 by Codex (4 findings).
- **Assembly CORR1 (current candidate):** a six-member package is physically materialized at `WORKBENCH/DOWNLOADS/STAGE2_FINAL_EFFECTIVE_VIEW_ASSEMBLY_1_CORR1_2026-10-07/` (repository-local, untracked): `STAGE2_FINAL_EFFECTIVE_VIEW_ASSEMBLY_1_CORR1_BUILD.py`, `..._CORR1_DELTA_PROVENANCE.json`, `..._CORR1_MANIFEST.json`, `..._CORR1_MIGRATION_LEDGER.json`, `..._CORR1_RECORDS.jsonl`, `..._CORR1_REPORT.md`. All five non-manifest members hash-match the manifest `/outputs` identities. `..._CORR1_RECORDS.jsonl` contains **116 records** (2 changed + 114 unchanged) and hashes to SHA-256 `3603c3169d7bdd67763ac0d2468d08cbb508d23dfeece4f7b396900b11dc68ec` (successor view; predecessor effective view `a1fcae68...`).
- **Lifecycle status:** the manifest declares `READY_FOR_INDEPENDENT_VERIFICATION`, `independentlyVerified: false`, `ownerAccepted: false`. Physical materialization is established; **candidate correctness, independent verification, and Owner acceptance are not established**. The candidate is not promoted to authority.

---

## DEPENDENCY BLOCKER GRAPH

```text
ANALYTICAL LINEAGE
[Stage 1 Factual Successor] ✅B physically bound (commit 92236dc, SHA-256 be9593a7...)
      │ successor-specific IV / Owner acceptance: ? NOT ESTABLISHED FROM AVAILABLE EVIDENCE
      ▼
[Stage 2 Assembly CORR1] ☑ CANDIDATE MATERIALIZED / READY_FOR_IV
      │ (116-record output; successor SHA-256 3603c316...; manifest-declared
      │  independentlyVerified=false, ownerAccepted=false)
      ▼
[Stage 2 ACCEPTED ANALYTICAL SUCCESSOR] ❌
      │ (requires: independent IV of CORR1 → Owner acceptance → Git binding)
      │
GOVERNANCE GATES (controlling, distinct)
[Nine-case corpus readiness]
      ├─ ✅G+✅B accepted membership/geometry (d177386, fb602181...)
      ├─ ✅G+✅B durable outcome-IV authority (6ad8933, 568b5164...)
      └─ ☑ input-freeze candidate (d52e7f4, da9b9de2...) — external lifecycle status
         ? NOT ESTABLISHED FROM AVAILABLE EVIDENCE
      ▼
[Program falsification gate + independent multi-case consistency replay] ❌ NOT REACHED
      │ (Control Tree §§5.8–5.9, 10.3)
      ▼
[HEDC derivation] ❌ NOT DERIVED (MD-2 CORR6 = structural inference validator only,
      │             environmentBinding "NONE")
      ▼
[Post-calibration METHOD FREEZE DECISION] ❌ NOT REACHED
      │ (Owner decision: FULL FREEZE / PARTIAL-TIERED / REJECT-REDESIGN — Control Tree §7)
      ▼
[Automated Environment Classifier → Pair / ECS / Friction Core] ❌ NOT IMPLEMENTED
      ▼
[9-Case Full-Engine Software Execution] ⛔ BLOCKED

PRODUCT TRACKS (Control Tree §10 — two parallel tracks, never collapsed)
[Track A: FREE PRODUCT READY] ◩ PARTIAL
      │ (Mode-D Slice-1 report shell; Blocks 2–8 INSUFFICIENT_PUBLIC_EVIDENCE,
      │  Block 9 NOT_APPLICABLE, Block 10 LIMITED)
[Track B: PUBLIC PROOF READY] ⛔ BLOCKED
      │ (requires program falsification, consistency replay, publication-ready
      │  public case studies, disclosure contract)
      ▼
[FREE LAUNCH GATE] ❌ = PRODUCT READY AND PUBLIC PROOF READY (Control Tree §10.4)
      ▼
[Public-release Owner authorization] ❌ NOT AUTHORIZED (Owner-only)
```

**Note:** Internal report generation (the projection shell above) is not empirical public proof. The two tracks are separate gates and neither substitutes for the other (Control Tree §§10.2–10.4).

---

## CORRECTION LEDGER (CORR1 — 2026-10-07, historical record)

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

---

## CORRECTION LEDGER (CORR2 — 2026-10-07)

Independent audit inputs: `MERGEVUE_CURRENT_STATE_TREE_OVERLAY_CORR1.IV1` (auditor: Codex; VERDICT FAIL — 0 BLOCKING / 4 MAJOR / 2 MINOR). Every SHA-256, commit, path, and status below was re-verified physically by the CORR2 author before writing.

| Finding | Severity | Location (CORR2 structure) | Old state (CORR1) | Corrected state (CORR2) | Primary evidence (independently re-verified) |
|---|---|---|---|---|---|
| **F01** | MAJOR | Known Issue 3; Analytical Lineage → Stage 2; Dependency graph | Stage-2 CORR1 build script "unexecuted"; "Output artifacts remain unmaterialized"; graph node "SCRIPT AUTHORED / UNMATERIALIZED" | Six-member package physically materialized (repo-local, untracked `WORKBENCH/DOWNLOADS/STAGE2_FINAL_EFFECTIVE_VIEW_ASSEMBLY_1_CORR1_2026-10-07/`); all five non-manifest members hash-match the manifest; 116-record output (SHA-256 `3603c316...`); manifest-declared `READY_FOR_INDEPENDENT_VERIFICATION` / `independentlyVerified: false` / `ownerAccepted: false`; graph node "CANDIDATE MATERIALIZED / READY_FOR_IV" | Directory listing + `shasum -a 256` of all members vs manifest `/outputs`; `wc -l` RECORDS = 116; manifest fields read directly |
| **F02** | MAJOR | Status Legend; overview table (all 16 rows); Branches 1, 2, 3, 4, 8 historical/current status lines; Stage-1 lineage; dependency graph | 43 occurrences of bare ✅ collapsing governance acceptance, independent verification, Git binding, code implementation, execution, integration, and production operation into one symbol (legend defined ✅ as a conjunction) | Dimension-scoped notation (✅G/✅IV/✅B/✅C/✅E/✅I/✅P); every former ✅ occurrence re-tagged to its actual evidence dimension; historical v2.1 statuses marked "as written" and translated, not re-asserted | Control Tree v2.1 §0 legend + Evidence-status rule; Git Worktree Closure Governance §21; per-occurrence audit of all 43 (21 lines) in the CORR1 candidate |
| **F03** | MAJOR | Branch 10 Reality; Known Issue 3; overview row 10; Track A node | "all analytical blocks (Blocks 2–10) are populated with `INSUFFICIENT_PUBLIC_EVIDENCE`" | Blocks 2–8 `INSUFFICIENT_PUBLIC_EVIDENCE`; Block 9 `NOT_APPLICABLE`; Block 10 `LIMITED` (bounded evidence-gap surface); Blocks 11–12 `AVAILABLE` static copy/audit identifiers | `src/server/_level1ModeDPublicReportProjection.ts` block assembly read directly (insufficientBlock at `:254`; Blocks 2–8 calls; Block 9 `NOT_APPLICABLE`; Block 10 `LIMITED`) |
| **F04** | MAJOR | Known Issue 1; Candidate Lineage; Branch 5 governance bullet; Stage 1 lineage; dependency graph Stage-1 node | "✅ CLOSED & BOUND (Commit `92236dc`, 19/19 defects corrected, IV1 PASS, Owner accepted)" — correction-campaign acceptance conflated with successor-candidate acceptance; freeze candidate "awaiting IV and Owner acceptance" asserted from frozen wording | Physical binding ✅B (commit `92236dc`, sidecar-checked `be9593a7...`); successor-specific IV ? NOT ESTABLISHED FROM AVAILABLE EVIDENCE; Owner acceptance of successor-binding candidate bytes ? NOT ESTABLISHED FROM AVAILABLE EVIDENCE (correction-campaign + four corrected-package-identity acceptance is distinct); same discipline applied to the input-freeze candidate (frozen wording not treated as proof of current status either way) | Stage-1 bound doc §§1–2, 18–20 read (candidate's own lifecycle requirements and distinct authority chain); Git history of the file (bound only at `92236dc`); repo + external Workbench searches found no successor-specific IV report or later Owner decision; later corroboration `STAGE2_CORR3_PILOT_LOCK_CONFLICT_REPORT.md` (`STAGE1_CLOSED = NO` as of 2026-09-26); sidecar re-hash |
| **F05** | MINOR | Branch 6 (governance authority + Reality) | `environmentBinding: null`; MD-2 CORR6 cited without physical-binding qualification | `environmentBinding: "NONE"` (validator-asserted); CORR6 marked **local candidate-methodology evidence only** — local digest matches (`02b76912...`) but the document is not bound in the audited commit and has no adjacent sidecar; structural validation kept distinct from substantive Environment determination | `src/historical/md2.js` (`environmentBinding = "NONE"`); `scripts/validate-md2-offline.mjs` assertions; `git ls-files --error-unmatch` (not tracked); local file hash recomputed |
| **F06** | MINOR | New detailed Branches 12–15; new RP-1–RP-13 reconciliation section; rebuilt dependency graph | Detailed sections covered Branches 1–11 and 16 only; dependency graph omitted program falsification/replay, the distinct Product Ready and Public Proof Ready tracks, public-release Owner authorization, and the method-freeze decision boundary; RP-1–RP-13 controls had no explicit disposition | Concise evidence-anchored dispositions added for Branches 12–15; RP-1–RP-13 given an explicit governance-accepted / not-implemented-as-a-set disposition; dependency graph now preserves distinct gates: nine-case corpus readiness, Stage-2 accepted analytical successor, HEDC derivation, post-calibration METHOD FREEZE DECISION, program falsification + independent replay, Product Ready, Public Proof Ready, and public-release Owner authorization; report generation kept separate from empirical public proof | Control Tree v2.1 §§7, 10.1–10.4, 12–16, 19; Report-Product Addendum §§1–3, 7; physical checks: screen-12 routes (`src/routes/routeModel.js`, `src/flow/emailCaptureFlow.js`, `src/data/finalDeliverableData.js`), LIMITED ceiling code, absence of integration-monitor code in `src/`/`api/`, public screens inventory |

**Integrity statement (CORR2):** all ten distinct SHA-256 identities cited in this overlay were recomputed from physical bytes by the CORR2 author (Control Tree v2.1 `360bafa2...`; RP addendum `83cdd1ec...`; RP Authority `e52029d9...`; 9-case addendum `fb602181...`; outcome-IV binding `568b5164...`; Stage-1 binding `be9593a7...`; corpus-freeze candidate `da9b9de2...`; v1.7 archive `8decabd6...`; CASE-3.4 v1.3 `dae81438...`; MD-2 CORR6 `02b76912...`), plus the Stage-2 CORR1 RECORDS identity `3603c316...` against its manifest. All seven binding commits (`d177386`, `6ad8933`, `d52e7f4`, `92236dc`, `9b1545e`, `fcbcf86`, `3d7b777`) resolve and precede the audited HEAD. Nine-case membership and the Disney–Pixar exclusion are preserved unchanged. No accepted contract, core math, runtime code, source code, or historical case evidence was modified by this act.
