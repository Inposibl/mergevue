# STAGE2_FINAL_MEASUREMENT_REGRESSION_HARNESS_COMPATIBILITY_ADAPTATION_1 — GIT CLOSURE 1 CORR1 (DOCUMENTARY CORRECTION RECORD)

**ACT:** STAGE2_FINAL_MEASUREMENT_REGRESSION_HARNESS_COMPATIBILITY_ADAPTATION_1.GIT-CLOSURE-1.CORR1
**ROLE:** Git Agent — Antigravity, under current explicit Owner instruction (`AGENTS.md` §2/§3; `AGENTS_G.md`; `ANTIGRAVITY_CONTROLLER_PROMPT.md`; `Antigravity_Antigallucination.md`)
**DATE:** 2026-10-09
**REPOSITORY:** `Inposibl/mergevue` (origin), branch `main`
**BASE HEAD:** `7f544afa071658bdd9d0d243c8e172e1061a5944` (commit 1)
**COMMIT 1 PARENT:** `2f7bcc5d33cf8009145aa85cbb39d2ae9084ec26`
**CONTROLLING CLOSURE GOVERNANCE:** `docs/governance/MERGEVUE_GIT_WORKTREE_CLOSURE_GOVERNANCE_2026-09-05.md`

This document records the Owner-authorized documentary and archival-reproducibility
corrections to the local Git closure of the Stage-2 measurement regression harness
compatibility adaptation. No analytical artifacts, candidate source code, test files,
Grok IV1 evidence, or archive ZIP contents are modified.

---

## 1. Authorized Correction F-GIT-01 — Durable ACT_MANIFEST

In the original Git closure act (`STAGE2_FINAL_MEASUREMENT_REGRESSION_HARNESS_COMPATIBILITY_ADAPTATION_1.GIT-CLOSURE-1`),
commit `7f544af` committed 41 paths but left the machine-readable act manifest
`ACT_MANIFEST_STAGE2_FINAL_MEASUREMENT_REGRESSION_HARNESS_COMPATIBILITY_ADAPTATION_1_GIT-CLOSURE-1.json`
untracked in `WORKBENCH/AUDITS/`.

Under this correction act (`CORR1`):
1. The historical provenance is reconciled: commit `7f544af` contained exactly 41 paths.
2. The exact `ACT_MANIFEST_STAGE2_FINAL_MEASUREMENT_REGRESSION_HARNESS_COMPATIBILITY_ADAPTATION_1_GIT-CLOSURE-1.json`
   file is updated with accurate provenance and committed as a tracked artifact.
3. The manifest clearly distinguishes:
   - Original closure commit: `7f544afa071658bdd9d0d243c8e172e1061a5944` (`7f544af`).
   - Documentary correction act: `CORR1` (this commit).
   - Remote push status: unpushed until separately observed by the Owner (`origin/main` at `2f7bcc5...`).
4. In accordance with governance principles, no self-referential hash of the `CORR1` commit is embedded within files belonging to `CORR1`.

---

## 2. Authorized Correction F-GIT-02 — Archive Verification Instructions

The original closure record (`STAGE2_FINAL_MEASUREMENT_REGRESSION_HARNESS_COMPATIBILITY_ADAPTATION_1_GIT_CLOSURE_1.md`)
contained an in-place verification command (`shasum -a 256 -c ARCHIVE_MEMBER_MANIFEST.sha256`)
that assumed internal archive files were already unpacked in the current directory.

Under this correction act (`CORR1`):
1. Section 6 of `STAGE2_FINAL_MEASUREMENT_REGRESSION_HARNESS_COMPATIBILITY_ADAPTATION_1_GIT_CLOSURE_1.md`
   is updated to provide the complete 8-step verification sequence starting from a fresh Git checkout.
2. The verification sequence strictly distinguishes verification of the ZIP archive blob itself
   from verification of its extracted member contents in a clean temporary directory outside the repository:
   - **Step 1:** Verify archive ZIP against frozen SHA-256 `5741423ff019be78232144446fd50a7f715aa72b00cc9be7df169bae4a9056a5`.
   - **Step 2:** Extract archive into temporary directory outside the repository (`mktemp -d /tmp/mergevue_archive_verify_XXXXXX`).
   - **Step 3:** Verify all 143 expected archive members are present.
   - **Step 4:** Verify each member's byte count and SHA-256 against `ARCHIVE_MEMBER_MANIFEST.json` / `ARCHIVE_MEMBER_MANIFEST.sha256`.
   - **Step 5:** Verify candidate `MANIFEST_SHA256.json` against all 132 declared candidate files.
   - **Step 6:** Verify IV1 manifest against its nine declared primary/supporting evidence members.
   - **Step 7:** Verify candidate principal source `ADAPTED_REGRESSION_HARNESS.py` is byte-identical.
   - **Step 8:** Report results and cleanly remove temporary verification directory.
3. The sidecar `STAGE2_FINAL_MEASUREMENT_REGRESSION_HARNESS_COMPATIBILITY_ADAPTATION_1_GIT_CLOSURE_1.md.sha256`
   is updated to match the revised Markdown record.
4. The archival ZIP, its member manifest, candidate source, and Grok IV1 evidence are completely unmutated.

---

## 3. Strict Preservation of Analytical Artifacts

The following identities were re-verified from physical bytes and remain untouched:

| Artifact | Bytes | SHA-256 | Status |
|---|---:|---|---|
| `ADAPTED_REGRESSION_HARNESS.py` | 28,712 | `82f78f8c6db43473fb0c79676374227384354fee8e46537427584cd2a39fd560` | **PRESERVED** |
| `STAGE2_FINAL_MEASUREMENT_REGRESSION_HARNESS_COMPATIBILITY_ADAPTATION_1_ARCHIVE.zip` | 2,297,667 | `5741423ff019be78232144446fd50a7f715aa72b00cc9be7df169bae4a9056a5` | **PRESERVED** |
| `ARCHIVE_MEMBER_MANIFEST.json` | 33,816 | `1f38e07eeff69094776e01a0be5ecb26d8ee1c37cff0f55cf55ecbca69352e82` | **PRESERVED** |
| `ARCHIVE_MEMBER_MANIFEST.sha256` | 19,746 | `868aa3ef1803ea4d5e23cc348080f339cf337996c56ec230c1be17452d3f6d54` | **PRESERVED** |
| `FEVA_CORR2_EXACT_INPUT.jsonl` | 104,722 | `5b37071a5fa5374c77b149bfde5c230c228cdf73d9785e5ea55346f9fab28daa` | **PRESERVED** |
| Grok IV1 Report (`IV1_REPORT.md`) | 17,640 | `ee95ed9efd1022f6c3b382b09739fe3574e44a142822d966669b0ab692223b7f` | **PRESERVED** |
| All 9 IV1 evidence members | - | *(All match IV1_MANIFEST_SHA256.json)* | **PRESERVED** |
| All 132 candidate package members | - | *(All match MANIFEST_SHA256.json)* | **PRESERVED** |

---

## 4. Boundaries and Operational Guarantees

- **No full `regress()` execution:** Full adapted regression over all 116 records was NOT run.
- **No methodology or model change:** No HEDC, outcome falsification, LOCO, historical calibration replay, or Environment assignment was performed.
- **No rewriting history:** Commit `7f544af` was NOT amended, rebased, or overwritten. This CORR1 commit is a clean direct child commit.
- **Remote Push:** NOT performed. Remote push remains exclusively the Owner's manual action.
