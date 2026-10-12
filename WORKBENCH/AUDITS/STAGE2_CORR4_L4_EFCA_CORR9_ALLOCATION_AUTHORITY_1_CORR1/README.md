# STAGE2_CORR4_L4_EFCA_CORR9_ALLOCATION_AUTHORITY_BINDING_1.CORR1 — README (Corrected Authority Statement)

**Act:** `STAGE2_CORR4_L4_EFCA_CORR9_ALLOCATION_AUTHORITY_BINDING_1.CORR1` (documentary correction of the G3 binding act)
**Actor:** DeepSeek — CODER
**Date:** 2026-10-11
**Mode:** OFFLINE / SYNTHETIC-ONLY / ISOLATED FOUR-FILE CORRECTION

## Verification-status vocabulary (authoritative for this package)

| Status | Value |
| --- | --- |
| `AUTHOR_SELF_VALIDATED` | DeepSeek checked its own G3 output (and checks its own CORR1 output) |
| `ORCHESTRATOR_BYTE_REINSPECTION` | the Orchestrator separately checked the uploaded G3 manifest, sidecar and file identities |
| `G3_OVERALL_PREFLIGHT` | **FAIL / DOCUMENTARY CORRECTION REQUIRED** (this CORR1 exists to correct it) |
| `FORMAL_INDEPENDENT_IV` | **NOT PERFORMED** |
| `G3.CORR1_OWNER_ACCEPTANCE` | **NOT GRANTED** |
| `GIT_CLOSURE` | **NOT PERFORMED** |

These states are never conflated. An author check is not Orchestrator re-inspection; neither is independent IV; neither is Owner acceptance. The unqualified phrase "independently verified" is **not used** to describe DeepSeek's own work anywhere in this package.

## G3-F01 / G3-F02 / G3-F03 correction ledger

| Finding | Original G3 defect | Correction in this CORR1 |
| --- | --- | --- |
| **G3-F01** | The G3 external closing message reported the sidecar as **103 bytes**. The actual sidecar is **97 bytes** (and always was: 64-hex digest + two spaces + filename + one newline). | Reconciled here: the sidecar's actual and recorded size is **97 bytes**; its SHA-256 `8209554567f29c1dd0c10a9b50a4ff7f7c6ceef99012387d2a87db58b975a59d` never changed. This was an **original external-return reporting error**, not corruption of the sidecar or of the G2 allocation manifest — both physical identities match their accepted values exactly. |
| **G3-F02** | The G3 external closing message reported the README as **5,847 bytes**. The actual original README is **4,190 bytes**. | Reconciled here: the original README's actual size was **4,190 bytes** (SHA `1b99a0fc…396da`); the original G3 `ACT_MANIFEST.json` had already recorded the correct sizes for all three files. This was an **original external-return reporting error**, not source corruption. This corrected README has a **new** byte length; its actual final length is recorded in the CORR1 `ACT_MANIFEST.json` rather than reusing any prior figure. |
| **G3-F03** | The original G3 README stated that the bound bytes had been "independently verified" by the act. That conflated the author's own check with independent verification. | Removed and replaced by the explicit status vocabulary above: the G3 act performed `AUTHOR_SELF_VALIDATED` checks only; the byte-level confirmation of the uploaded G3 package was `ORCHESTRATOR_BYTE_REINSPECTION`; `FORMAL_INDEPENDENT_IV` was NOT PERFORMED; `G3_OVERALL_PREFLIGHT` = FAIL / DOCUMENTARY CORRECTION REQUIRED; `G3.CORR1_OWNER_ACCEPTANCE` NOT GRANTED; `GIT_CLOSURE` NOT PERFORMED. |

**No corruption claim:** in all three cases the physical SHA-256 of the affected artifacts matched their accepted identities before, during and after G3; nothing was corrupted. The defects were errors in the author's external return message (F01, F02) and in the README's verification-status language (F03).

## Authority chain recorded by this corrected package

1. **OD-45-A — Independent Custody Entitlement: OWNER ACCEPTED** (`OWNER ACCEPTS OD-45-A`). For offline synthetic EFCA, the right to register a specific tuple must be established by an independent, explicit, Owner-approved mapping `tuple identity → custodian identity`, existing before actor-facing registration; a registered CUSTODIAN role and knowledge of a tuple key are insufficient; exactly one effective custodian per tuple.
2. **G2 — CORR9 allocation authority identity: OWNER ACCEPTED** (`OWNER ACCEPTS CORR9 ALLOCATION AUTHORITY G2`).
3. **G3 — physical binding: OWNER AUTHORIZED** (`OWNER AUTHORIZES CORR9 ALLOCATION AUTHORITY G3`), binding only; no CORR9 implementation authorized.
4. **G3.CORR1 — this documentary correction: OWNER AUTHORIZED** (`OWNER AUTHORIZES G3.CORR1 DOCUMENTARY CORRECTION`), covering exactly G3-F01, G3-F02 and G3-F03.

## Bound artifact identity (unchanged from G2/G3 — byte-for-byte copies)

- **Authority identifier:** `STAGE2_CORR4_L4_EFCA_CORR9_ALLOCATIONS_v1`
- **File:** `EFCA_CORR9_ALLOCATIONS_v1.json` — **SHA-256 `53eb3ec43feb4de926e057e0dc17a857473872e4bbc9ff571e5937576c38ecb1`, 716 bytes**
- **Sidecar:** `EFCA_CORR9_ALLOCATIONS_v1.json.sha256` — **SHA-256 `8209554567f29c1dd0c10a9b50a4ff7f7c6ceef99012387d2a87db58b975a59d`, 97 bytes**
- **Canonical encoding:** JSON, UTF-8, no BOM, keys sorted recursively, compact separators, exactly one trailing newline
- **Contents:** exactly eight allocations, every designated custodian `SYN_CUST_001`, tuple keys unique, no additional keys or attributes, no real historical data (synthetic `SYN_*` identifiers only)
- Both files were copied **byte-for-byte** from the original G3 directory into this CORR1 directory (verified by `cmp` byte-identity and by independent `shasum -a 256 -c` validation from this directory). Nothing was regenerated, reordered, appended or altered.

## Purpose and restrictions of the custody entitlement (unchanged)

- **Purpose:** tuple-specific initial custody-registration entitlement under OD-45-A for the future CORR9 native engine.
- **Single-effective-custodian restriction:** exactly one entry per tuple key.
- **No first-writer capture:** registration without a matching entry in this authority is not permitted by OD-45-A.
- **No custody transfer or replacement:** the artifact is immutable; no API, event or later act may reallocate, transfer or replace an entry; a modified artifact fails its digest.
- **No scientific authority:** allocation confers no category assignment, tuple level, or causal/scientific status; `categoryAssignment = UNASSIGNED`, `tupleLevelName = UNASSIGNED`, `causeLink = UNASSIGNED_PENDING_J1` remain controlling.
- **OD-37, OD-38, OD-39 preserved.**
- **CORR6 compatibility guardrail preserved** (native durability, frozen CORR5 read-only legacy admission, projection firewall, version-selection replay firewall).
- **Test-only simulation allocations are not Owner-approved:** any test-harness/simulation authority is a declared simulation, never Owner-approved authority, and remains permanently distinguishable in chain identity.
- **No CORR9 runtime integration:** no engine reads this artifact yet; connection happens only under a separately authorized CORR9 implementation act that names the accepted digest `53eb3ec4…ecb1`.
- **No Git closure was performed** in G3 or in this CORR1.
- **No formal Independent IV was performed** in G3 or in this CORR1.

## Approval vs binding vs correction — explicit distinctions

Owner acceptance of the bytes (G2), the physical binding of exactly those bytes (G3), and this documentary correction (G3.CORR1) are separate states with separate authority. This CORR1 does not modify the Owner-approved allocation bytes in any way; it corrects the documentary record only. This package is **not** independently verified and **not** Owner-accepted; Orchestrator re-inspection is required, and a separate G4 authorization is required before any CORR9 implementation may rely on this authority.
