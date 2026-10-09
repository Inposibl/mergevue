# Deterministic reproduction

Use the bundled Python stdlib runtime recorded in PREFLIGHT_STATE.json.
Do not install packages or write inside the repository. Run with bytecode
disabled. Commands below write only existing author test evidence inside this
temporary package; historical input reads use the recorded repository root.

```bash
PYTHONDONTWRITEBYTECODE=1 GIT_OPTIONAL_LOCKS=0 python3 /private/tmp/STAGE2_FINAL_MEASUREMENT_REGRESSION_HARNESS_COMPATIBILITY_ADAPTATION_FEVA_CORR2/BUILD_CANDIDATE.py
PYTHONDONTWRITEBYTECODE=1 GIT_OPTIONAL_LOCKS=0 python3 /private/tmp/STAGE2_FINAL_MEASUREMENT_REGRESSION_HARNESS_COMPATIBILITY_ADAPTATION_FEVA_CORR2/ADAPTED_REGRESSION_HARNESS.py --exact-input /private/tmp/STAGE2_FINAL_MEASUREMENT_REGRESSION_HARNESS_COMPATIBILITY_ADAPTATION_FEVA_CORR2/FEVA_CORR2_EXACT_INPUT.jsonl
PYTHONDONTWRITEBYTECODE=1 GIT_OPTIONAL_LOCKS=0 python3 /private/tmp/STAGE2_FINAL_MEASUREMENT_REGRESSION_HARNESS_COMPATIBILITY_ADAPTATION_FEVA_CORR2/AUTHOR_COMPATIBILITY_TESTS.py
```

BUILD_CANDIDATE.py transforms only its frozen original copy, counts exactly
20 replacements, appends separately specified guards, and writes the candidate,
transformation ledger and unified diff. Existing oracle/pinbook must first
match MANIFEST_SHA256.json; regeneration is not authority to change them.

The second command performs zero measurement comparisons. The third performs
40 bounded author tests, 27 negative controls. It does not invoke adapted
regress(). It also runs one historical original reproduction in a fresh child
process using the unchanged source and original inputs; that child replays
original scenarios and all four original controls. Its result structure hash
is 58c2080b9d038ce91330fa8af7cf30ebb9d6b1920b9dc238a62e2904ec6b8e37.

Copied FROZEN_INPUTS includes all 107 inspected dependencies at their observed
identities. Clean-checkout availability of the original untracked dependencies
is not claimed. Historical child uses the original repository cwd so physical
input identities in its JSON exactly reproduce the original report. A moved
package must record changed physical paths rather than impersonating that cwd.

FINALIZE_PACKAGE.py rechecks Git status and all 107 original source hashes,
then writes report/handoff/manifest. The manifest excludes itself to avoid a
circular hash; record its external SHA-256 after writing. No current full
regression command is provided as part of this authorized reproduction.
