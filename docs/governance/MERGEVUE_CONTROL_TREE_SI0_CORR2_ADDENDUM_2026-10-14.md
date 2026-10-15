# MERGEVUE M&A — CONTROL TREE SI-0 COMPACT CORR2 ACCEPTANCE ADDENDUM

**Document:** `docs/governance/MERGEVUE_CONTROL_TREE_SI0_CORR2_ADDENDUM_2026-10-14.md`
**Date:** 2026-10-14
**Character:** dated status overlay to the Control Tree. It does not modify the base tree, prior overlays or the node-status matrix.
**Authority recorded:** Human Project Owner
**Recording act:** `SI0-CORR2-GOVERNANCE-BINDING-1`
**Author:** Claude (ANALYST — Governance Artifact Author)
**Status of this addendum:** AUTHOR CANDIDATE. Not independently verified. Not Git-bound.
**Repository baseline:** branch `main`, HEAD `7af4d9a422f20e7cca739ac67456fa59eba947e5`

**Parent Control Tree:** `docs/governance/MERGEVUE_CONTROL_TREE_v2.1_2026-09-04.md` (SHA-256 `360bafa29bad5ea93752323d4a217bf59aaec628e0e2b236350a2edd9c1f7128`)

**Prior controlling overlays (unchanged):**

- `docs/governance/MERGEVUE_CONTROL_TREE_CURRENT_STATUS_INTEGRATION_ADDENDUM_2026-10-10.md` (SHA-256 `6ad007cc3a7bace275de46264f4e035988267ad31f8f3402885fec9f2129eb61`)
- `docs/governance/MERGEVUE_CONTROL_TREE_AGENT_CONTROL_ADDENDUM_2026-10-12.md` (SHA-256 `299cb6156da8e851675aa5b332899adf9fb3738c4893228eab0454ffa7ad083e`)
- `docs/governance/MERGEVUE_CONTROL_TREE_STAGE2_CORR1_STATUS_ADDENDUM_2026-10-12.md` (SHA-256 `6dade32c173e80ab3aa4a98c5204c8c67e2e09ce978c06561228dc43bd0ab833`)

**Artifacts of this binding set:**

| Role | Path | Bytes | SHA-256 |
|---|---|---:|---|
| Accepted protocol (byte-identical copy) | `docs/governance/MERGEVUE_SI0_COMPACT_PROTOCOL_v1.0_CORR2_ACCEPTED.md` | 338,049 | `719826ab98ea25220781b062c69b243718b7ad764429a6602e1c44946745e847` |
| Owner decisions, disposition and acceptance record | `docs/governance/MERGEVUE_SI0_CORR2_OWNER_DECISIONS_AND_DISPOSITION_2026-10-14.md` | 21,258 | `2379b320c2b4a78d37825c2704c8ae40c304a685a97b71c3d44c3f3f1fc7f41a` |

Each file has a `.sha256` sidecar in the same directory.

---

## 0. PURPOSE AND NON-DESTRUCTIVE BOUNDARY

### 0.1 Purpose

This addendum places the Owner's acceptance of the SI-0 protocol

`STAGE2-PS-SCIENTIFIC-INTEGRITY-SI0-COMPACT-PROTOCOL-1.CORR2`

into the existing Control Tree status structure. It also records the boundaries of that acceptance.

### 0.2 Non-destructive invariants

1. `MERGEVUE_CONTROL_TREE_v2.1_2026-09-04.md` is not changed.
2. The three prior overlays listed above are not changed and remain effective.
3. The frozen node-status matrix `WORKBENCH/AUDITS/MERGEVUE_VERIFIED_CURRENT_CONTROL_TREE_RECONSTRUCTION_1_CORR4/MERGEVUE_NODE_STATUS_MATRIX.json` (SHA-256 `621eca0afeadca4b40450a41d3277fb69df9843b73c9663e93042e7d76b98a97`) is not changed. In line with §3.3 of the 2026-10-10 overlay, this addendum contains no handwritten node-status table. It promotes no node.
4. The source candidate `WORKBENCH/DOWNLOADS/STAGE2_PS_SCIENTIFIC_INTEGRITY_SI0_COMPACT_PROTOCOL_v1.0_CORR2_CANDIDATE.md` is not changed.
5. No accepted scientific definition, Owner decision or contract is changed.

---

## 1. WHERE THIS FITS

The 2026-10-12 Stage-2 CORR1 overlay (§2.4 and §3.2 item 1) records that the accepted P-S/P-A framework CORR1 requires a separate SI-0 protocol, which must be:

1. authored;
2. independently verified;
3. Owner-accepted.

It records the SI-0 protocol item as `OPEN / NOT ESTABLISHED`.

This addendum records the state of that item on 2026-10-14. Items 2–10 of that overlay's §3.2 are not affected and remain as recorded there.

---

## 2. SIX SEPARATE STATES

These states are separate. None implies another (`AGENTS.md` §5.4 status rule, §14B.3, §14B.7).

### 2.1 Independently verified scientific content

Codex `STAGE2-PS-SCIENTIFIC-INTEGRITY-SI0-COMPACT-PROTOCOL-1.CORR2.IV1` independently established:

- `C1-F01` — CLOSED;
- `C1-F02` — CLOSED;
- no scientific or mathematical regressions detected;
- CONTENT INTEGRITY — PASS for the exact CORR2 bytes.

Scope: the protocol text and its Annex G code, on synthetic and frozen inputs. This verifies no empirical SI-1…SI-6 result.

### 2.2 Historical audit verdict

The final verdict of Codex `CORR2.IV1` is and remains:

`FAIL — 0 BLOCKING / 1 MAJOR / 0 MINOR`

The sole MAJOR is `C2-EXEC-F01`, an execution-procedure defect of the CORR2 author act. It is not a scientific or mathematical regression. EXECUTION COMPLIANCE of the author act is FAIL.

No PASS report for CORR2 exists. None is implied here.

### 2.3 Owner-specific procedural disposition

The Owner granted a one-time procedural exception. It permits use of the results of two disclosed unauthorized development-test reruns, `V-COV` and `V-SRC`.

- The original failed tests remain recorded as exit 1.
- The historical Codex FAIL remains FAIL.
- The exception does not establish that the reruns complied with the original mandate.
- It is not a general exemption from gate-failure rules.
- Under `AGENTS.md` §14B.5 (R-06), it does not extend to any other act, artifact or gate.

Full record: decision record §5.

### 2.4 Owner-accepted scientific protocol

The Owner accepted the exact CORR2 protocol (338,049 bytes, SHA-256 `719826ab…e847`) with the eight decisions and the separate procedural disposition:

| Decision | Recorded choice |
|---|---|
| OD-A | Retrospective independent procedural reference design accepted; blindness, QUAL, CHAL, provenance and scientific claim-boundary restrictions preserved |
| OD-B | `DECISION` — `X_DEC = Δ ∪ K1 ∪ DIS = 3,536`; the remaining 8,229 agreement tuples are not examined; no claims about them are authorized |
| OD-C | `EXTERNAL` — no pre-freeze H-2.1 execution within SI-0 |
| AI-1 | Collective materiality `ESTABLISHED / CONDITIONAL / NONE` (protocol §8.3–§8.4) |
| AI-2 | Three bounded dispositions (protocol §8.8) |
| AI-3 | Operational constants and disclosed verdict effects (protocol §11.9) |
| AI-4 | Scientific claim ceiling (protocol §10.4) |
| AI-5 | Positive Reference Criterion (protocol §6.9) |

The controlling wording, its source of record and the missing primary statements are in the decision record (§1 and §3). This table summarizes it and does not replace it.

The governance copy keeps the protocol's own bytes, including its `(КАНДИДАТ)` title marker and its §14 decision frames. Accepted status comes from the decision record, not from the protocol text.

### 2.5 Pending physical Git closure

- No Git stage, commit or push was performed for this binding set.
- Local Git binding: NOT ESTABLISHED.
- Remote Git binding: NOT ESTABLISHED.
- Independent verification of this binding set: NOT PERFORMED.
- Under the `AGENTS.md` §5.4 staleness rule, the binding-set files become physically bound governance artifacts only after a binding commit exists and their sidecars match. Until then the Owner's acceptance stands as an Owner decision. These files are candidates for its physical record.
- Codex independent verification and Antigravity Git closure are separate acts. Each needs its own Owner authorization.

### 2.6 Scientific execution — not authorized

The acceptance does not establish any SI-6 outcome. It does not authorize SI-1…SI-6.

Scientific sufficiency of eligibility remains `NOT_ESTABLISHED`.

---

## 3. UPDATED READING OF THE SI-0 PROTOCOL ITEM

| Requirement (framework CORR1 §5, SI-0) | State on 2026-10-14 |
|---|---|
| Authored | Yes — CORR2, author Claude |
| Independently verified | Codex `CORR2.IV1` performed. Scientific content verified (§2.1). Verdict FAIL 0/1/0 on procedure only (§2.2), subject to the Owner's one-time disposition (§2.3). Whether this satisfies the framework's "independently verified" wording is an Owner determination; this addendum does not make it. |
| Owner-accepted | Yes (§2.4) |
| Physically bound in Git | No (§2.5) |
| Executed | No; not authorized (§2.6) |

---

## 4. UNCHANGED BOUNDARIES

Still in force:

1. Stage-2 CORR4 §L-2 and §M (frozen `STAGE2_SEMANTIC_SUCCESSOR_CANDIDATE_CORR4.md`, SHA-256 `2de49862fb0d63c5f1cd1745531199137e73b7b37abceecef6e735d497d38bb0`), including the prohibition of 905-fact semantic binding before FINAL CONTRACT FREEZE.
2. The accepted EFCA (`docs/decisions/MERGEVUE_STAGE2_CORR4_L4_EFCA_OWNER_DECISION_2026-10-10.md`).
3. The accepted P-S/P-A framework CORR1 (`docs/decisions/MERGEVUE_STAGE2_CORR4_M_PS_PA_SEPARATION_AMENDMENT_1_CORR1_OWNER_DECISION_2026-10-12.md`).
4. OD-09 (`docs/decisions/MERGEVUE_STAGE2_CORR4_L2_HISTORICAL_PROOF_OWNER_DECISION_2026-10-09.md`).

CORR2 acceptance supersedes none of them. No recorded Owner decision expressly supersedes any of them.

Still open or not authorized, as recorded in the 2026-10-12 Stage-2 CORR1 overlay §3.2 items 2–10:

- SI-1…SI-6 empirical satisfaction;
- absence of eligibility bias;
- P-A disagreements;
- EFCA J-gates;
- post-pilot contract;
- FINAL CONTRACT FREEZE;
- B5.8 execution;
- production integration;
- Stage-2 completion.

Added by the recorded decisions:

- no pre-freeze H-2.1 execution within SI-0 (OD-C);
- no examination of, or claims about, the 8,229 unexamined agreement tuples (OD-B).

---

## 5. RESIDUALS CARRIED

Recorded in the decision record §8 and not resolved here:

- RES-01 — OD-A option letter not cited in the available record;
- RES-02 — original Owner statements not physically retrieved;
- RES-03 — the "independently verified" wording versus the FAIL 0/1/0 verdict;
- RES-04 — the CORR2 author mandate and the `CORR2.IV1` report exist only in agent session logs.

---

## 6. STATUS OF THIS ACT

- Act `SI0-CORR2-GOVERNANCE-BINDING-1` wrote six files under `docs/governance/` (three documents, three sidecars). It made no other repository change.
- No Git mutation.
- Author: Claude. Claude also authored the CORR2 protocol and cannot independently verify this addendum or the protocol (`AGENTS.md` §10; `AGENTS_A.md` §3).
- Next steps, each needing separate Owner authorization: Codex independent verification of this binding set; then Antigravity Git closure.
