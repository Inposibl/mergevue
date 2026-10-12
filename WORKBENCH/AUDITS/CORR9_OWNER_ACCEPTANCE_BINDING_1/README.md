# CORR9 OWNER ACCEPTANCE BINDING — DOCUMENTARY PACKAGE

**Act:** `CORR9-OWNER-ACCEPTANCE-BINDING-1`
**Function:** documentary author (Owner-appointed ANALYST, `AGENTS_A.md`)
**Author:** Claude (Opus 5.5)
**Date:** 2026-10-12
**Correction:** `CORR9-OWNER-ACCEPTANCE-BINDING-1.CORR1` (2026-10-12) — Owner-decision provenance (literal quotations kept separate from normalized text) and the mandatory Git closure workflow
**Package status:** `DOCUMENTARY_CANDIDATE (CORR1) — READY_FOR_INDEPENDENT_DOCUMENTARY_IV`
**Location:** `WORKBENCH/AUDITS/CORR9_OWNER_ACCEPTANCE_BINDING_1/` (untracked workbench; not Git-bound)

---

## 1. What this package is

A documentary record of a state the Owner has **already** decided:

> The exact, unchanged six-file CORR9 offline EFCA enforcement implementation, as independently verified by CORR9.IV2 under the Owner-accepted Option B contract, is Owner-accepted — controlling strictly for **OFFLINE, SYNTHETIC-ONLY, TRUSTED-HOST** use.

This package collects and pins that state's evidence in one place. Before this act, the evidence lived only in volatile `/private/tmp` audit sandboxes and in a Codex attachment folder. No physical Owner-acceptance record for CORR9 or for the Option B contract existed on disk.

## 2. What this package is not

- It does **not** re-accept, re-implement or re-verify the engine.
- It is **not** an independent audit. The author did not audit CORR9, the contract, or IV1/IV2. Nothing here substitutes for CORR9.IV2.
- It is **not** controlling governance. It does not edit the Control Tree, the 2026-10-10 current-status addendum, the CORR4 node matrix, any `docs/governance/` or `docs/decisions/` file, or any accepted package.
- It is **not** independently verified. That is the next gate (see `CONTROL_TREE_STATUS_PROPOSAL.md` §5).
- It is **not** Git-closed. A local commit is **mandatory for eventual completion** but is **not authorized** in this act or in CORR1. Push is the Owner's manual action, only after Orchestrator `PUSH ALLOWED`. The full sequence is in `OWNER_ACCEPTANCE_RECORD.md` §6.
- It does **not** authorize production integration, historical tuple execution, the 1,094 disagreements, J-1/J-4, J-2/J-3, B5.8, or any scientific freeze.

## 3. Controlling scope of the accepted implementation

| Dimension | Accepted scope |
|---|---|
| Data | Synthetic only. No real historical tuples. |
| Execution | Offline. No network, no production wiring. |
| Trust model | `TRUSTED ENGINE HOST` is a necessary operational prerequisite (Option B, TB-01–TB-04). |
| Known limitation | NG-01 / `CORR9-IV1-MAJ-01`: privileged whole-history mode laundering remains reproducible. Owner-risk-accepted within this scope only. |
| Scientific ceiling | `categoryAssignment = UNASSIGNED`, `tupleLevelName = UNASSIGNED`, `causeLink = UNASSIGNED_PENDING_J1`. |

## 4. Trust-boundary statement (carried unchanged, must not be dropped)

1. `TRUSTED ENGINE HOST` is a necessary operational prerequisite.
2. The offline engine does **not** authenticate human callers. It has no authenticated principal and does not compare the caller with `requester_id`.
3. Unrestricted Python object or process access permits direct calls to host methods (`__init__`, `register_actor`, `persist_global_history`, `verify_global_history`, `restore_global_history`, `replay_legacy_history`).
4. SHA-256 event-chain validation alone does **not** authenticate historical origin.
5. Privileged whole-history mode laundering (SIMULATION ↔ OWNER_PINNED) remains reproducible in both directions, with state adoption and lawful continuation (CORR9.IV1 §9; CORR9.IV2 §7).
6. The original finding `CORR9-IV1-MAJ-01` remains visible as MAJOR / original IV1 FAIL. It was risk-accepted, **not repaired**.
7. Requester interfaces must not be given arbitrary authoritative-history restoration capabilities.
8. Any production or externally reachable integration requires **new** independent security-boundary evidence (Option B TB-04; IV2 §12).

CORR9.IV2 PASS is **not** proof of operating-system isolation, process isolation, filesystem permission policy, caller authentication or public-web deployment safety. IV2 states this itself (§§1, 9.B, 11, 12).

## 5. Package contents

| Path | Kind |
|---|---|
| `README.md` | Authored — this file |
| `OWNER_ACCEPTANCE_RECORD.md` | Authored — Owner decisions and lifecycle, each status separate |
| `AUDIT_LINEAGE.md` | Authored — IV1 FAIL → contract IV1 PASS → IV2 PASS, with identities |
| `CONTROL_TREE_STATUS_PROPOSAL.md` | Authored — proposed future overlay entry; **not** an edit to governance |
| `OPTION_B_ACCEPTED_CONTRACT.txt` | Byte-identical copy of the accepted contract (13,499 bytes) |
| `ARCHIVED_EVIDENCE/CORR9_IV1/` | Byte-identical copies of original CORR9.IV1 audit output (12 files) |
| `ARCHIVED_EVIDENCE/OPTIONB_CONTRACT_IV1/` | Byte-identical copies of original contract IV1 audit output (3 files) |
| `ARCHIVED_EVIDENCE/CORR9_IV2/` | Byte-identical copies of original CORR9.IV2 audit output (22 files) |
| `EVIDENCE_INDEX.json` | Generated — every source, copy, hash, class and availability |
| `ACT_MANIFEST.json` | Generated — package inventory, authority references, preservation |
| `SHA256SUMS.txt` | Generated — identities of all package files except itself |

Everything under `ARCHIVED_EVIDENCE/` is **copied material**. The originals stay where the auditors wrote them; each copy is pinned to its origin path and SHA-256 in `EVIDENCE_INDEX.json`. The copies are evidence, not authority. The copied contract still carries its historical header `CONTRACT CANDIDATE — PENDING OWNER ACCEPTANCE`; that text was deliberately left unedited (see `OWNER_ACCEPTANCE_RECORD.md` §2).

## 6. Limitations

- The Owner's acceptance of the Option B contract (OF-2) and of CORR9 (OF-3) is recorded as the Owner's **literal statements**, quoted exactly in `OWNER_ACCEPTANCE_RECORD.md` §1. These are the primary Owner facts. They reached this package as transcriptions inside the Owner-authorized CORR1 execution brief; the original message bytes and timestamps are not archived here. No separately timestamped physical Owner decision file for either existed before this package. The contract IV1 report and CORR9.IV2 report (§2) are corroborating independent evidence, not substitutes for the Owner decisions.
- OD-37/38/39 have no standalone bound decision transcripts. Both IV1 (§1) and IV2 (§3) disclosed this. This package does not resolve it.
- `/private/tmp` originals are volatile. If they are purged, the copies here become the only surviving bytes; their identities stay checkable against the hashes the auditors recorded (IV2 `evidence_index.json`, IV2 `preservation_before.json`).
- **Git-ignore exposure.** Eight archived `.log` files match the repository rule `.gitignore:9 *.log`: IV1 `full_suite.log`, `independent_probes.log`, `mode_origin_contract.log`; IV2 `full_suite.log`, `independent_probes.log`, `supplemental_probes.log`, `probe_setup_category_return_shape.log`, `probe_setup_dictionary_order.log`. A plain `git add` of this directory would silently leave them out. The future Git Agent must explicitly verify that all eight are included (`OWNER_ACCEPTANCE_RECORD.md` §6). This act did not change `.gitignore` or rename any file. The list is in `ACT_MANIFEST.json` → `gitIgnoredMembers`.
- Several original sandbox files were not copied because they are not essential. They are listed as `AVAILABLE_NOT_ARCHIVED` in `EVIDENCE_INDEX.json`, and their identities are still pinned by archived records.
