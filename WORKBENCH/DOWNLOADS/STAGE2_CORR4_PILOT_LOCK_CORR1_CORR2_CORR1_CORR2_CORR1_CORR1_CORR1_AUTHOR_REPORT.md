# STAGE2_CORR4_PILOT_LOCK_CORR1_CORR2_CORR1_CORR2_CORR1_CORR1_CORR1_AUTHOR_REPORT

**Act:** POST-10-CALIBRATION-STAGE2-TREE-BOUND-DISCRIMINATOR-AND-MECHANISM-MEASUREMENT-CONTRACT-1.
PILOT-VERSION-LOCK-1.CORR1.CORR2.CORR1.CORR2.CORR1.CORR1.CORR1 — PHYSICAL CODER-VIEW CENSUS
CORRECTION

**Role:** ANALYST (Z-Ai), bounded validator-only correction AUTHOR. Codex remains the independent
auditor and did not author this correction. Not ANALYTICAL_CODER_A/B, not the Git agent.

**Date:** 2026-10-01

---

## 1. Baseline

- Physical root: `/Users/entp_psyche/Desktop/InvestProjects2026/MergeVue PayProduct (june 2026)/MergeVue-M&A (August 2026)`; branch `main`; HEAD `31fd56e7e8df29ab5f7ff854be75453686f37758`; staged area empty before and after. No Git mutation.

## 2. Parent IV1 FAIL identity and unchanged surfaces

- `STAGE2_CORR4_PILOT_LOCK_CORR1_CORR2_CORR1_CORR2_CORR1_CORR1_IV1_REPORT.md`
  (SHA `f2f56b5364b5c64a66f7dbc95e9c4b3db8d93dd8bce1a7036e4dbefdb7ac4270`):
  **PILOT_LOCK_CORR1_CORR2_CORR1_CORR2_CORR1_CORR1_IV1_FAIL — BLOCKING = 0, MAJOR = 3, MINOR = 0**
  (IV1-F1 physical path identity; IV1-F2 embedded arbitrary-name references; IV1-F3 superseded
  delivery census). The controlling view itself was found clean and coherent; the exact clean
  validator run was 56/56 PASS, 23/23 forced failures, exit 0. This act closes ONLY F1/F2/F3.
- **Frozen controlling view (no successor view JSON, no PI change, no executionViewControl
  change):** `STAGE2_CORR4_PILOT_ANALYTICAL_CODER_VIEW_SCHEMA_CORR2_CORR1_CORR2_CORR1.json`
  SHA `0cb5a6b5d2239855eeabe0bfd0e9ceb6c545dc2a86b4b34a90b65187592721b5`; canonical permittedInput
  SHA `b9f4d6a91d73f240403fa978a3da7706fbf4f1877224c256bb71030905355f27` — both re-verified in the
  final run. Parent chain byte-identical: parent validator `893cbe26…`, report `fbe5419e…`,
  author `093da451…`, manifest `2473a417…` (4/4), CORR4/matrix/binding, all 9 frozen pilot SHAs,
  13/13 Git-tracked closure package.

## 3. F1 — physical path identity: reproduction and fix

- **Reproduction (F1-PROBE):** an exact byte copy of the controlling view at a second physical
  path, made structurally deliverable, previously collapsed to one identity because uniqueness
  was derived from SHA-256 alone. With the fix the probe yields **DELIVERABLE_CODER_VIEW_COUNT =
  2, DISTINCT_DELIVERABLE_VIEW_SHA_COUNT = 1 (same bytes), COMPETING_DELIVERABLE_CODER_VIEW_
  IDENTITY_COUNT = 1, COMPETING_REQUIRED_CODING_INVENTORY_COUNT = 0, FULL VERDICT FAIL**
  (gates E3/X5/X6 fired) — DETECTED.
- **Fix:** `PHYSICAL_VIEW_IDENTITY = (canonical_physical_path, sha256)`. Identity uniqueness now
  guarantees different physical paths ⇒ different deliverable identities even when the bytes are
  identical. SHA alone is never used for physical identity uniqueness. The clean result is
  unchanged: DELIVERABLE = 1, identity competitors = 0.

## 4. Canonical path representation (F1/F3 foundation)

One helper, `canonical_physical_path()`, produces the single internal representation for ALL
resolver set operations — controlling path, PI-6 resolved path, deliverable paths, historical /
superseded paths, manifest-resolved paths and shadow/temp paths: the **normalized absolute
filesystem path** (`ROOT / ref` for relative references, then `resolve()`). Repo-relative
rendering (`render_path()`) is used ONLY for human-readable report output. No comparison mixes
relative with absolute, and no basename-vs-full-path comparison exists for identity or historical
intersection. Documented extraction limitation: the reference tokenizer terminates on whitespace
and JSON/punctuation delimiters, so repository-absolute references containing spaces or
parentheses cannot be extracted from an embedded string; relative and whitespace-free absolute
references (all fixtures, and `/private/tmp`-style scratch paths) are fully covered.

## 5. F2 — embedded arbitrary-name references: reproduction and fix

- **Reproduction:** the prior discovery depended partly on known coder-view basenames and could
  return at most one discovered path per supplied string, so an arbitrary-name `.json` coder view
  embedded in a delivery-surface string escaped the census.
- **Fix:** for EVERY string under the two declared delivery surfaces (permittedInput,
  executionViewControl — no other fields, no repository prose), the extractor enumerates ALL
  candidate JSON path references with one regex (`…\.json(?![a-zA-Z0-9_])`, so `.jsonl` is not
  mis-tokenized), stopping nowhere: multiple references inside one string are all extracted.
  Each candidate is (1) resolved physically, (2) required to exist, (3) parsed, (4) classified as
  a coder view BY CONTENT (parsed `permittedInput` + `requiredCodingFields`), independent of
  filename. Only then does it enter the census.
- **Proofs:** F2-A (arbitrary name `auxiliary_instruction.json` embedded inside ONE
  executionViewControl string) → DELIVERABLE = 2, identity competitors ≥ 1, FAIL — DETECTED;
  F2-B (same path embedded inside an existing permittedInput string field) → same detection —
  DETECTED; F2-C (TWO distinct `.json` coder-view references inside ONE string) → **both
  enumerated**, DELIVERABLE = 3 — DETECTED.

## 6. F3 — superseded delivery census: reproduction and fix

- **Fix:** `historical_physical_paths` is built by resolving every superseded-chain artifact to
  the same canonical physical representation; `deliverable_physical_paths` likewise;
  `SUPERSEDED_VIEW_DELIVERABLE_PATHS = intersection(historical, deliverable)` in that one
  representation; count = len. A delivered historical view can no longer be reported as zero
  because one surface is repo-relative and the other absolute.
- **Proofs:** F3-A (superseded parent view made structurally deliverable) →
  SUPERSEDED_VIEW_DELIVERABLE_COUNT = 1 with the correct delivered path — DETECTED; F3-B
  (grandparent/history view under a non-path supplied key) → count = 1 — DETECTED. Clean census:
  SUPERSEDED_VIEW_DELIVERABLE_COUNT = 0, paths [].

## 7. Clean resolver metrics (§9/§10 — all separately disclosed in the report)

```
CONTROLLING_EXECUTION_VIEW_COUNT = 1
PI6_RESOLVES_TO_CONTROLLING_VIEW = YES
CURRENT_MANIFEST_AUTHENTICATES_CONTROLLING_VIEW = YES
DELIVERABLE_CODER_VIEW_COUNT = 1
DELIVERABLE_CODER_VIEW_PATHS = [WORKBENCH/DOWNLOADS/STAGE2_CORR4_..._CORR2_CORR1_CORR2_CORR1.json]
DELIVERABLE_CODER_VIEW_IDENTITIES = [(same path, 0cb5a6b5...)]
DISTINCT_DELIVERABLE_VIEW_SHA_COUNT = 1
COMPETING_DELIVERABLE_CODER_VIEW_IDENTITY_COUNT = 0
COMPETING_REQUIRED_CODING_INVENTORY_COUNT = 0
SUPERSEDED_VIEW_DELIVERABLE_COUNT = 0
SUPERSEDED_VIEW_DELIVERABLE_PATHS = []
SINGLE_CONTROLLING_EXECUTION_VIEW = PASS
```

The four identities are now separately measurable and cannot be conflated: physical path
identity, byte identity (DISTINCT_DELIVERABLE_VIEW_SHA_COUNT), inventory identity, and
historical status.

## 8. Validator successor and retained protections

`STAGE2_CORR4_PILOT_LOCK_CORR1_CORR2_CORR1_CORR2_CORR1_CORR1_CORR1_VALIDATE.py` (SHA
`d4dcb9df2a5edc7cbc5f99267c955c360869b432b4e4a9396b20ab3000558381`). Clean run: **TOTAL 56 /
PASS 56 / FAIL 0; VERDICT PASS; CLI exit 0. FORCED FAILURES 29/29 DETECTED** (23 retained —
A–G reference-integrity, N1–N4 leakage, P1–P4 presentation-lane incl. fixtures A–D, X1–X6
single-view, E1–E3 closed-EVC/physical-identity, sourceClass non-regression — plus the 6 new
census probes). No previous gate was weakened: every retained fixture still fires its original
gates (several now additionally fire E3 through the stricter census). Authoring defects caught by
my own runs and fixed before finalization: a heredoc-mangled regex (fixed to the equivalent
escaped form), a parent-chain constant pointing at this act's own report, two resolver keys
dropped in the rewrite, and the fixture-insertion script's silent no-op (the fixtures were built
but not inserted — caught because the run reported 23/29). All disclosed.

## 9. Deliverables and manifest

| Deliverable | SHA-256 |
| --- | --- |
| STAGE2_CORR4_PILOT_LOCK_CORR1_CORR2_CORR1_CORR2_CORR1_CORR1_CORR1_VALIDATE.py | `d4dcb9df2a5edc7cbc5f99267c955c360869b432b4e4a9396b20ab3000558381` |
| STAGE2_CORR4_PILOT_LOCK_CORR1_CORR2_CORR1_CORR2_CORR1_CORR1_CORR1_VALIDATION_REPORT.txt | `70abc9054501a832898c51d0e859c8403f48133e251b5cf2fa7da41d19cfffce` |
| STAGE2_CORR4_PILOT_LOCK_CORR1_CORR2_CORR1_CORR2_CORR1_CORR1_CORR1_AUTHOR_REPORT.md | this document |
| STAGE2_CORR4_PILOT_LOCK_CORR1_CORR2_CORR1_CORR2_CORR1_CORR1_CORR1_MANIFEST.sha256 | binds the three deliverables + the UNCHANGED controlling view as an explicitly-marked unchanged dependency; does not hash itself |

Assembly note (disclosed): provisional view-dependency + validator manifest first so inherited
check C could execute; report and author report finalized; manifest completed; final validator
re-run — the report is byte-deterministic and the re-run output diffed byte-identical, proving
the pinned report SHA and check C/X2 against the final manifest. No other repository artifact was
created; NO new coder-view JSON exists.

## 10. Git status

Before: untracked workbench content only; staged empty; HEAD `31fd56e7…`. After: unchanged HEAD,
no tracked modification, no staged content; the only delta is the four new untracked files under
`WORKBENCH/DOWNLOADS/` (§9). No `git add/commit/push/pull/restore/checkout/reset/clean/stash`.

## 11. Explicit statements

- **NO ANALYTICAL CODING** (synthetic structural fixtures only; no fact coded; no Environment
  assigned; no outcome accessed beyond the synthetic strings `POST_T0_SUCCESS` / `NF/NT`).
- **CLAUDE OPUS 5.5 NOT LAUNCHED.**
- **DEEPSEEK NOT LAUNCHED.**
- **CODEX NOT USED AS AUTHOR** (its published IV1 report was read as evidence only; the auditor
  was not launched).
- **NOT INDEPENDENTLY VERIFIED** — author-side mechanical gate only; not an IV verdict, not Owner
  acceptance.

## 12. Terminal state

**PILOT_LOCK_CORR1_CORR2_CORR1_CORR2_CORR1_CORR1_CORR1_PHYSICAL_CENSUS_READY_FOR_IV1**

All three IV1 findings are reproduced and closed: physical path identity is part of every
deliverable identity; every .json reference inside the two declared delivery surfaces is
enumerated and content-classified; delivered historical views are counted through one canonical
representation. The controlling view and its canonical permittedInput SHA are byte-unchanged and
every prior protection remains green. Next step under Owner control: fresh independent IV by the
auditor (Codex), not launched by this act.
