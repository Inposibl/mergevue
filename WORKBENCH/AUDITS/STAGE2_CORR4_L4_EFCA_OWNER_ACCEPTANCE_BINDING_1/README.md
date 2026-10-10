# MERGEVUE — Stage-2 CORR4 §L-4 EFCA Owner-Accepted Candidate Evidence Package

**Directory:** `WORKBENCH/AUDITS/STAGE2_CORR4_L4_EFCA_OWNER_ACCEPTANCE_BINDING_1/`  
**Date:** 2026-10-10  
**Associated Decision Record:** `docs/decisions/MERGEVUE_STAGE2_CORR4_L4_EFCA_OWNER_DECISION_2026-10-10.md`  
**Act Reference:** `MERGEVUE_STAGE2_CORR4_L4_EFCA_OWNER_ACCEPTANCE_BINDING_PREP_1`  
**Accepted Act:** `STAGE2_CORR4_L4_CAUSAL_TAXONOMY_OPERATIONALIZATION_1.CORR2.CORR2.CORR1.CORR1.CORR1.CORR1`  
**Status Target:** `READY_FOR_INDEPENDENT_IV`  

---

## 1. Package Purpose and Identity

This directory forms the archival evidence package for the Human Project Owner's explicit acceptance of the Evidence-First Causal Adjudication (EFCA) §L-4 operationalization specification candidate.

### Accepted Candidate:
- **Filename:** `EFCA_CORR2_CORR2_CORR1_CORR1_CORR1_CORR1_GPT6_AUTHOR_CANDIDATE.md`
- **Byte Size:** 97,712 bytes
- **SHA-256 Digest:** `5bb887d269e9079754e5a4f7417cd08f58d4ad5d5ff14503ca1dd98646176eba`
- **Primary Source Archive:** `MERGEVUE_EFCA_GPT6_CORR_V2_CODEX_IV_PACKAGE_2026-10-10.zip` (SHA-256: `cc7de8e268013332286befbd25fd235729fd1a0e5f38e0c70412190e67975f6e`)

---

## 2. Independent Audit History and Final Reconciled Verdict

### Record Sequence:
1. **Historical Predecessor Audit Attachment (`HISTORICAL_PREDECESSOR_CODEX_IV1_REPORT.txt`):**
   - Independent Codex IV1 audit evaluating the predecessor candidate (`CORR2.CORR2.CORR1.CORR1.CORR1`).
   - Verdict: `FAIL — 0 BLOCKING / 1 MAJOR / 2 MINOR / 2 ADVISORY`.
   - Preserved with original identity (`CODEX_G_IV1_FAIL_OWNER_PROVIDED.txt`, SHA-256: `bd01c12bae75eef570336dce2e65a7202f0916a00f1e398c1169e3ae29609a1b`).
2. **Current Candidate IV1 Original Report (`STAGE2_CORR4_L4_EFCA_CODEX_IV1_ORIGINAL_REPORT.md`):**
   - Independent Codex IV1 audit evaluating the exact candidate (`5bb887d269e9079754e5a4f7417cd08f58d4ad5d5ff14503ca1dd98646176eba`).
   - Auditor Session: `01a127a6-bb41-7251-8f35-32d2d1dcf30e`, rollout ordinal 176.
   - Initial Verdict: `FAIL — 0 BLOCKING / 0 MAJOR / 2 MINOR / 1 ADVISORY`.
   - Identified specification inconsistencies: `V-IV1-MIN-01` and `V-IV1-MIN-02`.
3. **Current Candidate IV1 Verdict Reconciliation (`STAGE2_CORR4_L4_EFCA_CODEX_IV1_VERDICT_RECONCILIATION.md`):**
   - Codex clarified the application of the Owner's PASS criterion (rollout ordinals 185 and 195).
   - Reconciled Verdict: `PASS — 0 BLOCKING / 0 MAJOR / 2 MINOR / 1 ADVISORY`.
   - Verified that both MINOR findings (`V-IV1-MIN-01`, `V-IV1-MIN-02`) and the ADVISORY (`V-IV1-ADV-01`) represent local specification defects rather than failures of core normative conditions; no BLOCKING or MAJOR exists.
   - Candidate identity remained completely unchanged.

---

## 3. Preserved Open Findings

The reconciled PASS does not delete, resolve, or downgrade the recorded findings:

- **`V-IV1-MIN-01` (MINOR — OPEN):** B.1 missing-world summary conflicts with the authoritative Q10 conjunct-falsifier rule (V:L127 vs V:L246).
- **`V-IV1-MIN-02` (MINOR — OPEN):** S21 contains an unjustified `after Copy2` temporal restriction (V:L719 vs general rules V:L196–203, L296).
- **`V-IV1-ADV-01` (ADVISORY — OPEN):** Inconsistent previous auditor-session UUID locator (V:L10 vs IV:L13).

---

## 4. Strict Scientific and Operational Boundaries

Owner acceptance applies strictly and exclusively to the **operationalization specification itself**. It does NOT authorize or imply completion of the scientific program.

The following remain strictly **OPEN** or **NOT AUTHORIZED**:
1. Classification of 1,094 frozen A/B disagreements in `STAGE2_CORR4_PILOT_STRATIFICATION_DISAGREEMENTS.jsonl`.
2. Final category assignment to any historical tuple.
3. J-1 and J-4 policy decisions.
4. J-2 and J-3 execution.
5. Conditional affected-cell repairs.
6. Final semantic contract freeze under CORR4 §M.
7. Stage-2 Analytical Coding execution (Node B5.8) — strictly NOT AUTHORIZED.
8. Production integration or runtime code modifications.

### Category Invariants:
The four existing causal categories remain preserved without meaning drift:
- `CODER_ERROR`
- `DEFINITION_AMBIGUITY`
- `MISSING_M`
- `GRAMMAR_GAP`

`UNRESOLVED` remains a process/disposition state, not a fifth causal category.

### Governance Overlay Preservation:
- `HOLD-6 = CLOSED_BY_EXPLICIT_OWNER_ADJUDICATION` (OD-09, 2026-10-09)
- `G-L2-ELIG = OWNER_ADJUDICATED_SATISFIED` (OD-09, 2026-10-09)

---

## 5. Directory Member Inventory

| File | Role | Size (bytes) | SHA-256 Digest |
|---|---|---|---|
| `EFCA_CORR2_CORR2_CORR1_CORR1_CORR1_CORR1_GPT6_AUTHOR_CANDIDATE.md` | Accepted EFCA candidate specification | 97,712 | `5bb887d269e9079754e5a4f7417cd08f58d4ad5d5ff14503ca1dd98646176eba` |
| `STAGE2_CORR4_L4_EFCA_CODEX_IV1_ORIGINAL_REPORT.md` | Original Codex IV1 audit report (FAIL) | 26,959 | `65b38dd91d777eb310e11aa579095bd87fb343366892fadc4cc9199d8a0bc17b` |
| `STAGE2_CORR4_L4_EFCA_CODEX_IV1_VERDICT_RECONCILIATION.md` | Reconciled Codex IV1 verdict report (PASS) | 3,365 | *(computed at seal)* |
| `HISTORICAL_PREDECESSOR_CODEX_IV1_REPORT.txt` | Predecessor candidate Codex IV1 audit attachment | 23,718 | `bd01c12bae75eef570336dce2e65a7202f0916a00f1e398c1169e3ae29609a1b` |
| `CODEX_IV1_AUDIT_TASK.md` | Independent audit task directive for Codex IV1 | 6,471 | `f4c4a8fb24156d0509cdf5bbad21b881c8aeb839a50d4af9d5a7daefbdc84a2e` |
| `README.md` | This package description and governance overview | — | *(self-referenced)* |
| `MANIFEST.json` | Complete machine-readable manifest and metadata | — | *(package manifest)* |
| `SHA256SUMS.txt` | Standard SHA-256 digest sidecar for all package files | — | *(checksum manifest)* |
