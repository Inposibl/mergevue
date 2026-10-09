# STAGE2_FINAL_MEASUREMENT_REGRESSION_HARNESS_COMPATIBILITY_ADAPTATION_1 — GIT CLOSURE 1 (LOCAL BINDING RECORD)

**ACT:** STAGE2_FINAL_MEASUREMENT_REGRESSION_HARNESS_COMPATIBILITY_ADAPTATION_1.GIT-CLOSURE-1
**ROLE:** Git Agent — Antigravity, under current explicit Owner instruction (`AGENTS.md` §2/§3 authority order; `AGENTS_G.md` Git Agent mandate; `ANTIGRAVITY_CONTROLLER_PROMPT.md`; `Antigravity_Antigallucination.md`)
**DATE:** 2026-10-09
**REPOSITORY:** `Inposibl/mergevue` (origin), branch `main`
**BASE HEAD:** `2f7bcc5d33cf8009145aa85cbb39d2ae9084ec26`
**CONTROLLING CLOSURE GOVERNANCE:** `docs/governance/MERGEVUE_GIT_WORKTREE_CLOSURE_GOVERNANCE_2026-09-05.md` (SHA-256 `27aa43abd0d8ce93b500231ded6b47d98949ba2a475f991098081c320b270a85`, verified this act)

This document is a provenance-preserving local Git binding record. It changes no
analytical content, no methodology, no runtime consumer, and no production
configuration. It binds only the exact Owner-accepted implementation candidate and
independent verification evidence identified below.

---

## 1. Owner acceptance (controlling decision)

The Owner explicitly **ACCEPTS** the exact Codex-authored candidate:
`STAGE-2 FINAL MEASUREMENT REGRESSION — HARNESS COMPATIBILITY ADAPTATION`.

Accepted candidate source file:
`ADAPTED_REGRESSION_HARNESS.py`
SHA-256: `82f78f8c6db43473fb0c79676374227384354fee8e46537427584cd2a39fd560`
Bytes: `28712`

Independent auditor: **Grok 4.7**
IV1 verdict: **PASS** (0 BLOCKING / 0 MAJOR / 1 MINOR / 4 ADVISORY).
`CONTRACT_AUTHORITY_GAP`: False.

The Owner explicitly accepts this exact candidate with the audit findings
(IV1-F01 MINOR, IV1-F02 through IV1-F05 ADVISORY) retained as documented
residual limitations. Their acceptance does not mean that the code defects were
repaired.

### Owner sequencing decision
THE FULL STAGE-2 MEASUREMENT REGRESSION IS DEFERRED UNTIL THE OWNER HAS REVIEWED
THE RECOVERED STATUS OF BLOCKS ALREADY EXECUTED IN PRIOR SESSIONS AND HAS ISSUED
A NEW EXPLICIT AUTHORIZATION.

This is a sequencing hold, not a newly discovered methodological defect and not a
reversal of FEVA CORR2 or the adapter IV1 PASS.

### Disposition of entrypoints and outcomes
- Accepted compatible public entrypoint for a future measurement is `regress(path)`
  with exact FEVA identity.
- Do not represent the composition-only CLI invocation as a completed measurement
  run (`measurementExecuted: false`).
- The historical original measurement-regression verdict remains **FAIL**.
- The historical correction IV1 remains **HOLD**.
- The later whole Stage-2 regression remains **NOT_RUN / DEFERRED / REQUIRES_SEPARATE_OWNER_AUTHORIZATION**.

---

## 2. Independent verification (IV1) summary

- **Auditor:** Grok 4.7
- **Act:** `STAGE-2 FINAL MEASUREMENT REGRESSION — HARNESS COMPATIBILITY ADAPTATION.IV1`
- **Verdict:** **PASS** (0 BLOCKING, 0 MAJOR, 1 MINOR, 4 ADVISORY)
- **Primary report:** `IV1_REPORT.md` (SHA-256 `ee95ed9efd1022f6c3b382b09739fe3574e44a142822d966669b0ab692223b7f`, 17640 bytes)
- **Findings:** `IV1_FINDINGS.json` (SHA-256 `061c835f5b09ca09cbfa213d87d5627a7c32539539d37236dfc16d315122935f`, 4445 bytes)
- **Key verifications:**
  - Independent identity re-verification of candidate `ADAPTED_REGRESSION_HARNESS.py` (`82f78f8c...`, 28712 bytes) unmutated before and after audit.
  - All 132 files in candidate `MANIFEST_SHA256.json` match byte-for-byte.
  - Candidate composition gate matches accepted FEVA CORR2 records on all 116 lines (110 legacy rows + 6 SECTION_I rows).
  - 26 predeclared negative controls verified early rejection and fail-closed diagnostics.
  - Historical original reproduction confirmed frozen historical FAIL (37 defects; cells 107 PASS, 3 FAIL).

---

## 3. Accepted candidate and FEVA input identity

| Property | Value |
|---|---|
| Candidate source file | `ADAPTED_REGRESSION_HARNESS.py` |
| Candidate SHA-256 | `82f78f8c6db43473fb0c79676374227384354fee8e46537427584cd2a39fd560` |
| Candidate bytes | 28,712 |
| Accepted FEVA CORR2 records SHA-256 | `5b37071a5fa5374c77b149bfde5c230c228cdf73d9785e5ea55346f9fab28daa` |
| Accepted FEVA CORR2 records bytes | 104,722 |
| Accepted FEVA CORR2 record count | 116 (110 legacy + 6 SECTION_I) |
| Git object identity of FEVA CORR2 | blob `43335eed6a9bdec0a9685565975b36b7e7f16ef3` at HEAD `2f7bcc5d33cf8009145aa85cbb39d2ae9084ec26` |

---

## 4. Residual audit findings disposition

All five audit findings from `IV1_FINDINGS.json` remain active documented limitations:

1. **IV1-F01 (MINOR): Private measurement seam can describe mutated rows under accepted file identity.**
   `_measure_subset` calls `load_exact_input` then applies optional in-memory mutation while returning the unmutated file identity.
   *Disposition:* Retained as documented MINOR. The private `_measure_subset` method must NOT be used for any future controlling full regression. Future measurement must invoke public `regress(path)` or CLI.

2. **IV1-F02 (ADVISORY): Nested factIds inside shape-valid componentSupply item are not referentially checked.**
   *Disposition:* Retained as ADVISORY. Unreachable through `regress` or CLI because of the exact-input gate on the accepted FEVA bytes.

3. **IV1-F03 (ADVISORY): Duplicate edge identity is counted inside measurement and rejected earlier by composition.**
   *Disposition:* Retained as ADVISORY. Composition rejects reordering/substitutions prior to measurement; exact-input gate rejects byte changes prior to composition.

4. **IV1-F04 (ADVISORY): Fifty-seven pinned dependencies are untracked worktree files.**
   *Disposition:* Retained as ADVISORY. 50 matched Git blobs at HEAD `2f7bcc5...`, 57 matched untracked worktree bytes at audit time. Disk drift fails closed via `verify_dependency_bundle`.

5. **IV1-F05 (ADVISORY): FORBIDDEN_OUTPUT is not reached when extra key is rejected as SECTION_SCHEMA.**
   *Disposition:* Retained as ADVISORY. Early schema rejection is stricter than downstream forbidden check; fail-closed behavior is preserved.

---

## 5. Bound path set and archive inventory

The closure binds 39 physical archive files under `WORKBENCH/AUDITS/STAGE2_FINAL_MEASUREMENT_REGRESSION_HARNESS_COMPATIBILITY_ADAPTATION_1/` plus this closure record and its sidecar (total 41 staged tracked files).

Per project volume and path hygiene rules, the 107 frozen dependency inputs (which mirror parts of the repository tree including `AGENTS.md`) are losslessly preserved inside `STAGE2_FINAL_MEASUREMENT_REGRESSION_HARNESS_COMPATIBILITY_ADAPTATION_1_ARCHIVE.zip`, accompanied by `ARCHIVE_MEMBER_MANIFEST.json` and `ARCHIVE_MEMBER_MANIFEST.sha256`. All 26 candidate root files and all 10 IV1 evidence artifacts are tracked directly as uncompressed, byte-exact files.

### 5.1 Candidate root artifacts (26 files)
Location: `WORKBENCH/AUDITS/STAGE2_FINAL_MEASUREMENT_REGRESSION_HARNESS_COMPATIBILITY_ADAPTATION_1/STAGE2_FINAL_MEASUREMENT_REGRESSION_HARNESS_COMPATIBILITY_ADAPTATION_FEVA_CORR2/`

| Path | Bytes | SHA-256 |
|---|---:|---|
| `ACCEPTED_FEVA_COMPOSITION_ORACLE.json` | 162739 | `e837bb529e46a78248bfeb3eec683b544b62db5ef6530669e469e061e892d24a` |
| `ADAPTATION_SPECIFICATION.md` | 12316 | `72fa9989a19c5c2d3cf83693e54b613e51d9571f5ee74a8a5b8bb38fc898bf0d` |
| `ADAPTED_REGRESSION_HARNESS.py` | 28712 | `82f78f8c6db43473fb0c79676374227384354fee8e46537427584cd2a39fd560` |
| `AUTHOR_COMPATIBILITY_RESULTS.json` | 50312 | `cff98c1c5a93aa4e67272714249a5b306fc6e23659f81666ff7e8a9390234b6e` |
| `AUTHOR_COMPATIBILITY_TESTS.py` | 15189 | `ae90b5df625e14cb70613a078e4d3db26dc4ddcf1dc7c5691ef024564c7e63b6` |
| `BUILD_CANDIDATE.py` | 13803 | `5cfb8412674e2d354b3f888cc8ebc6046e7f225d2ea67098e9bfa640f06536aa` |
| `FEVA_CORR2_EXACT_INPUT.jsonl` | 104722 | `5b37071a5fa5374c77b149bfde5c230c228cdf73d9785e5ea55346f9fab28daa` |
| `FINALIZE_PACKAGE.py` | 27429 | `fd72104d271feb4590f9d07fc60a3892190d586a16f14d90c0a42802fb17aaf2` |
| `HISTORICAL_AUTHOR_REPRODUCTION.json` | 233601 | `abaf81717fb1ecb79a62e55507b293fce58eb9b38b0a32d112817ad108046161` |
| `IMPLEMENTATION_REPORT.md` | 6399 | `cfc4330c6001e66fb042adbc29de12a0e980dc8b433d784803f446ba75618f6a` |
| `INDEPENDENT_AUDIT_HANDOFF.md` | 2865 | `3d7cfac6bef8259854d90b4a85e4b077ecafc45d2fac717bbd74cc2b25597c6e` |
| `INPUT_IDENTITIES.json` | 35037 | `72826e68146b443eda9d5f0f26d5decc4265a9736a1dfafec78b6f76e2b626fc` |
| `MANIFEST_SHA256.json` | 60566 | `013dd9765d842a7f91fe820641ec73d0bf69334b9dc920611765e2c84caa25da` |
| `OLD_TO_NEW_APPLICABILITY_MATRIX.json` | 53568 | `de1c03b8590f0e3d579f0814ee0998650dd5b1a65b61e0444287c32d56108644` |
| `ORIGINAL_FROZEN_HARNESS.py` | 26040 | `c99b8dc60dfd8d8594d903896c333bec673fa712150778f53bfd6f07243bb1dc` |
| `ORIGINAL_TO_CANDIDATE.diff` | 23453 | `226cfc73e8b229feab3737edfb20d00defb59af0e3e54bb036786e383c7596e1` |
| `POSTFLIGHT_STATE.json` | 79419 | `4dcd8a5a61ab73ae5311f232e0655ae2c4b34b43f5dd7d52eac3c37d324caf78` |
| `PREFLIGHT_STATE.json` | 133580 | `d7f7bdc662d63c861d7e89c152e0387c46437d2a078a1438cfd05e072364c8f6` |
| `PREPARE_PACKAGE.py` | 9332 | `02901015eb97c7bb5146e952ef9606d6aadc6b5ba2e7008f9fb26d65c48bea46` |
| `PRESERVATION_AND_NEGATIVE_CONTROLS.json` | 115216 | `59e1fe185f59f395a5d6d76f8678a780b83548a97b57de2ed6846c1dcb66061c` |
| `PRIOR_HOLD_REGRESSION_REPORT.md` | 46271 | `03a6a2f0b446d868adcd71fa02760069a6411b9470de70e95f3c55bbfbf9d8f9` |
| `PRIOR_HOLD_REGRESSION_RESULTS.json` | 752354 | `1b0858b53777d8f63519efd4b200f6c705ef1b572306c6c7bba0b762c018d39f` |
| `REPRODUCTION.md` | 2451 | `2c87acd6b123295fb3b93ba52ba126e6b15ad0c126e74aa42096ebda4cf46847` |
| `SINGLE_EDGE_AUTHOR_FIXTURE_EVIDENCE.json` | 37418 | `d0b1be6c9df9f7be4012fddd9767896bf7ae57ff26fbc4ac707ee7eeca483b41` |
| `SOURCE_AUTHORITY_CHECKS.json` | 7773 | `d5848607e74168c24ae337adb99e8480e73ca2eba0948284c329dfde07afb5be` |
| `SOURCE_TRANSFORMATIONS.json` | 6974 | `cde521ed8b712ba39e61541307370621a8cfeb33bd04d16638037cfe5c0a6183` |

### 5.2 Independent verification (IV1) evidence (10 files)
Location: `WORKBENCH/AUDITS/STAGE2_FINAL_MEASUREMENT_REGRESSION_HARNESS_COMPATIBILITY_ADAPTATION_1/STAGE2_FINAL_MEASUREMENT_REGRESSION_HARNESS_COMPATIBILITY_ADAPTATION_IV1/`

| Path | Bytes | SHA-256 |
|---|---:|---|
| `IV1_AUTHORITY_TRACEABILITY.json` | 7126 | `e1c069f7573b453e11f1545e9ff622dade190fe222046fc1fe77fc833c883aa8` |
| `IV1_FINDINGS.json` | 4445 | `061c835f5b09ca09cbfa213d87d5627a7c32539539d37236dfc16d315122935f` |
| `IV1_IDENTITY_CHECKS.json` | 4889 | `9f20d467774c978e1b8cc7d5cc3c8d0f1e39581ecc54251b792b106f6a2512e6` |
| `IV1_MANIFEST_SHA256.json` | 2955 | `6d7cd20a7e169f8d8cb21df261da194e894fc42d99c268dae41b52d9bd62b372` |
| `IV1_NEGATIVE_CONTROLS.json` | 5659 | `76533faa27b9f219e33a914235d87535f817deaa668fd0c2ba255d4b88a8263c` |
| `IV1_REPORT.md` | 17640 | `ee95ed9efd1022f6c3b382b09739fe3574e44a142822d966669b0ab692223b7f` |
| `IV1_REPRODUCTION_RESULTS.json` | 4855 | `99c2c56029eadba3a83d9bc332237133e30465801bf16c49365cf4f18b37a504` |
| `_evidence_bundle.json` | 114667 | `999b4a7cef25d41853bbe7dbfb88d0b29112f00331b3a721478741feb5a80c39` |
| `historical_original_summary.json` | 1159 | `ed525552e0296a7b02bbf9d60a399e086761ed503184559b792881a458376d64` |
| `neg_same_len.jsonl` | 104722 | `ee07ea1df0478d28ee3fdd228aeff9fef64bf85d42cc1f0bea950f432d5b04ec` |

### 5.3 Complete lossless archival ZIP and manifests (3 files)
Location: `WORKBENCH/AUDITS/STAGE2_FINAL_MEASUREMENT_REGRESSION_HARNESS_COMPATIBILITY_ADAPTATION_1/`

| Path | Bytes | SHA-256 |
|---|---:|---|
| `STAGE2_FINAL_MEASUREMENT_REGRESSION_HARNESS_COMPATIBILITY_ADAPTATION_1_ARCHIVE.zip` | 2297667 | `5741423ff019be78232144446fd50a7f715aa72b00cc9be7df169bae4a9056a5` |
| `ARCHIVE_MEMBER_MANIFEST.json` | 33816 | `1f38e07eeff69094776e01a0be5ecb26d8ee1c37cff0f55cf55ecbca69352e82` |
| `ARCHIVE_MEMBER_MANIFEST.sha256` | 19746 | `868aa3ef1803ea4d5e23cc348080f339cf337996c56ec230c1be17452d3f6d54` |

### 5.4 Closure record and sidecar (2 files)
Location: `WORKBENCH/AUDITS/`

| Path | Bytes | SHA-256 |
|---|---:|---|
| `STAGE2_FINAL_MEASUREMENT_REGRESSION_HARNESS_COMPATIBILITY_ADAPTATION_1_GIT_CLOSURE_1.md` | *(recorded below)* | *(recorded below)* |
| `STAGE2_FINAL_MEASUREMENT_REGRESSION_HARNESS_COMPATIBILITY_ADAPTATION_1_GIT_CLOSURE_1.md.sha256` | *(sidecar)* | *(sidecar)* |

---

## 6. Archive extraction and verification instructions

The package archive is completely self-contained and does not require `/private/tmp`.

### 6.1 Verify archive integrity in-place
Run from repository root:
```bash
cd WORKBENCH/AUDITS/STAGE2_FINAL_MEASUREMENT_REGRESSION_HARNESS_COMPATIBILITY_ADAPTATION_1
shasum -a 256 -c ARCHIVE_MEMBER_MANIFEST.sha256
```
Expected output: All 143 files report `OK`.

### 6.2 Extract archive to external destination (e.g. `/tmp`)
```bash
unzip -q WORKBENCH/AUDITS/STAGE2_FINAL_MEASUREMENT_REGRESSION_HARNESS_COMPATIBILITY_ADAPTATION_1/STAGE2_FINAL_MEASUREMENT_REGRESSION_HARNESS_COMPATIBILITY_ADAPTATION_1_ARCHIVE.zip -d /tmp
```
This extracts the exact source package and independent IV directories:
- `/tmp/STAGE2_FINAL_MEASUREMENT_REGRESSION_HARNESS_COMPATIBILITY_ADAPTATION_FEVA_CORR2/` (133 files including `FROZEN_INPUTS/`)
- `/tmp/STAGE2_FINAL_MEASUREMENT_REGRESSION_HARNESS_COMPATIBILITY_ADAPTATION_IV1/` (10 files)

### 6.3 Self-contained verification of extracted packages
```bash
cd /tmp/STAGE2_FINAL_MEASUREMENT_REGRESSION_HARNESS_COMPATIBILITY_ADAPTATION_FEVA_CORR2
python3 -c "import json, hashlib, os; m=json.load(open('MANIFEST_SHA256.json'))['files']; assert all(hashlib.sha256(open(p,'rb').read()).hexdigest()==m[p]['sha256'] for p in m); print('ALL 132 CANDIDATE FILES VERIFIED OK')"

cd /tmp/STAGE2_FINAL_MEASUREMENT_REGRESSION_HARNESS_COMPATIBILITY_ADAPTATION_IV1
python3 -c "import json, hashlib, os; m=json.load(open('IV1_MANIFEST_SHA256.json')); arts=m['requiredArtifacts']+m['supportingEvidence']; assert all(hashlib.sha256(open(a['path'],'rb').read()).hexdigest()==a['sha256'] for a in arts); print('ALL 9 IV1 ARTIFACTS VERIFIED OK')"
```

---

## 7. Boundaries — what this closure does NOT establish

- **No full adapted `regress()` execution:** Full adapted measurement regression over all 116 records was NOT run.
- **No Stage-2 measurement regression PASS:** This closure binds adapter compatibility only; no measurement result is claimed or inferred.
- **No calibration rerun:** Historical calibration campaigns were not rerun.
- **No mechanism normalization:** Mechanism names, expressions, or definitions were not altered.
- **No HEDC or Environment classification:** No HEDC class, Environment code, or ECS score was computed or emitted.
- **No Stage-1 recoding:** Stage-1 classifications and representations are untouched.
- **No product modifications:** Application code (`src/`), API code (`api/`), deployment configs, or contracts are untouched.
- **No Control Tree modification:** The canonical 63-node Control Tree reconstruction (bound at `9b57f0c`) and `docs/governance/MERGEVUE_CONTROL_TREE_v2.1_2026-09-04.md` are untouched. Node B17.5 is the existing target node; this closure documents the adapter binding without altering the tree.
- **No automatic Git push:** Remote push remains exclusively an Owner manual action.

---

## 8. Git facts of this closure

- **Pre-act worktree state:** 0 tracked dirty paths, 0 staged paths (Governance State A). 431 untracked entries left unmutated.
- **Staged scope:** Exactly the 41 paths under `WORKBENCH/AUDITS/STAGE2_FINAL_MEASUREMENT_REGRESSION_HARNESS_COMPATIBILITY_ADAPTATION_1/` and `WORKBENCH/AUDITS/STAGE2_FINAL_MEASUREMENT_REGRESSION_HARNESS_COMPATIBILITY_ADAPTATION_1_GIT_CLOSURE_1.md*` — no broad `git add .`, no unrelated staging.
- **Commit:** Single local child commit of BASE HEAD `2f7bcc5d33cf8009145aa85cbb39d2ae9084ec26` on branch `main`.
- **Remote status:** Commit created locally. No push was performed. Remote push remains exclusively the Owner's manual action per project policy (`AGENTS_G.md` §2/§8).
