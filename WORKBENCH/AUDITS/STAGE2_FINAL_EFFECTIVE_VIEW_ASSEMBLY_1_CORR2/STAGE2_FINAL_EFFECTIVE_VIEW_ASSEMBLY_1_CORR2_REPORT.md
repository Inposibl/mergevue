
# STAGE2_FINAL_EFFECTIVE_VIEW_ASSEMBLY_1.CORR2 — Implementation Report

**ACT:** STAGE2_FINAL_EFFECTIVE_VIEW_ASSEMBLY_1.CORR2  
**ROLE:** IMPLEMENTATION AUTHOR — Z.ai (Owner-authorized bounded correction)  
**MODE:** fail-closed deterministic correction; safe publication  
**REPOSITORY:** Inposibl/mergevue work tree at `main` @ `9b57f0cb567d5a36e4ebcf3292cdbd18439f4faa` (unchanged; zero Git operations)

## 1. Status

**CANDIDATE_COMPLETE — READY_FOR_INDEPENDENT_VERIFICATION.**

Author-side self-validation only. Nothing in this package is independently
verified or Owner-accepted.

## 2. What this act closes

Exactly the two open MAJOR findings of
`STAGE2_FINAL_EFFECTIVE_VIEW_ASSEMBLY_1.CORR1.IV1.CONTINUATION_1` (Codex,
VERDICT FAIL — 0 BLOCKING / 2 MAJOR / 0 MINOR / 2 ADVISORY):

- **CONT1-M01** — four persisted `discriminatorIds[]` values conflicted with
  the frozen M-row registry. Reproduced mechanically from the pinned registry
  (sha256 `cb08b51e…`): §C.0 C-1 makes each M's §D-row D field the authoritative
  binding; C-2 emits the union of the §D-row D-sets of the edge's mechanisms;
  C-4 fixes M-ENFORCE-SANCTION to D-06. The CORR4 contract's §D rows
  (sha256 `2de49862…`) were cross-checked equal for every involved mechanism.
- **CONT1-M02** — two persisted `sourceClass` values were documentary genre
  instead of the exact PI-7 `sectionIFill` binding. Reproduced mechanically
  from the pinned PI-7 binding (sha256 `3eee72d0…`) under the frozen schema's
  (sha256 `0cb5a6b5…`) `sourceClassBindingRule`: copy the ASSIGNED sourceClass,
  otherwise the fail-closed state verbatim. Full supplying-record identity
  `(caseId, sideId, factId, sourceRefIndex, sourceId)` matched exactly one
  BOUND/RESOLVED entry per record.

No methodology was reinterpreted; no fact was recoded; no new analytical
judgment was introduced.

## 3. Exact change set (full census)

Deep-diffed all 116 records (presence-aware, type-strict). Exactly 4 records
changed, exactly 6 fields, exactly the authorized cells:

| Line | edgeId | Changed fields |
|---:|---|---|
| 113 | A-RERUN1-CORR1:F-E-0182:M-RECOGNISED-COMMAND-ORDER:TT-STPSTJ-ESS | `discriminatorIds[0]` "D-01" → "D-04" |
| 114 | A-RERUN1-CORR1:F-E-0182:M-RECOGNISED-COMMAND-ORDER:TT-STPSTJ-PW | `discriminatorIds[0]` "D-01" → "D-04" |
| 115 | A-E001 | `discriminatorIds[0]` "D-02" → "D-06"; `sourceClass` "PERIODICAL_PRINT_ARCHIVE" → "OUTSIDE_FROZEN_VOCABULARY" |
| 116 | A-E023 | `discriminatorIds[0]` "D-06" → "D-07"; `sourceClass` "FORM_10K" → "OUTSIDE_FROZEN_VOCABULARY" |

Everything else is byte-for-byte identical to the CORR1 baseline
(`3603c3169d7bdd67763ac0d2468d08cbb508d23dfeece4f7b396900b11dc68ec`), including
the accepted F0024 provenance correction (line 112), the migrated A-E001
successor-bearing semantics (line 115), and all abstention /
missing-evidence semantics. No `NOT_DETERMINABLE` state was converted into a
determinate Environment conclusion.

## 4. Derivation provenance

- line 111 (`A-EXEC1:F-B-0025:M-RES-ROLE-CONTROLLED-ACCESS:TT-STPSTJ-RS`): mechanism(s) ['M-RES-ROLE-CONTROLLED-ACCESS'] → registry §D set ['D-07']; PI-7 identity ['amazon-whole-foods', 'WHOLE_FOODS', 'F-B-0025', 0, 'S-B1'] → state OUTSIDE_FROZEN_VOCABULARY
- line 112 (`A-EXEC1:F0024:M-RES-ROLE-CONTROLLED-ACCESS:TT-STPSTJ-RS`): mechanism(s) ['M-RES-ROLE-CONTROLLED-ACCESS'] → registry §D set ['D-07']; PI-7 identity ['aol-time-warner', 'AOL', 'F0024', 0, 'S0009'] → state ASSIGNED
- line 113 (`A-RERUN1-CORR1:F-E-0182:M-RECOGNISED-COMMAND-ORDER:TT-STPSTJ-ESS`): mechanism(s) ['M-RECOGNISED-COMMAND-ORDER'] → registry §D set ['D-04']; PI-7 identity ['exxon-mobil', 'EXXON', 'F-E-0182', 0, 'S-E2'] → state ASSIGNED
- line 114 (`A-RERUN1-CORR1:F-E-0182:M-RECOGNISED-COMMAND-ORDER:TT-STPSTJ-PW`): mechanism(s) ['M-RECOGNISED-COMMAND-ORDER'] → registry §D set ['D-04']; PI-7 identity ['exxon-mobil', 'EXXON', 'F-E-0182', 0, 'S-E2'] → state ASSIGNED
- line 115 (`A-E001`): mechanism(s) ['M-ENFORCE-SANCTION'] → registry §D set ['D-06']; PI-7 identity ['CASE-3.5', 'CHRYSLER', 'C-B04', 0, 'C33-S01'] → state OUTSIDE_FROZEN_VOCABULARY
- line 116 (`A-E023`): mechanism(s) ['M-RES-CAPABILITY-ADVANTAGE'] → registry §D set ['D-07']; PI-7 identity ['exxon-mobil', 'MOBIL', 'F-M-0205', 0, 'S-M1'] → state OUTSIDE_FROZEN_VOCABULARY

Derivation is executed at build time from the pinned controlling bytes; the
auditor's replacement table was not an input. Any derived change outside the
Owner-authorized cell set aborts the build (HOLD), so pre-existing defects
outside this act's scope can never be silently repaired.

## 5. Author-side verification executed

- Pinned-input SHA-256/byte verification for all five authorities (fail-closed).
- §I surface census: exactly 6 SECTION_I_RECORD records (lines 111–116); no
  other record carries `discriminatorIds` or `sourceClass`, so the applicable
  conformance census is complete at 6/6. The remaining 110 records are
  legacy `POST_RECONCILIATION_EXECUTION_CELL_RECORD`s outside the §I
  emission rule (BC-1/BC-2 boundaries untouched).
- Round-trip guard: canonical re-serialization of every modified line equals
  its baseline bytes, so applied diffs are confined to the six values.
- Full 116-record delta census: 4 records / 6 fields / authorized cells only.
- F01 regression: no record carries both `supportClass` and `supportBearing`.
- F02 regression: migrated A-E001 carries none of the five ledger-only keys;
  `prOnlyBasis`, `bearingEvaluability`, `supportBearing`, `scopeBridgeState`
  unchanged.
- F0024 regression: line 112 byte-verbatim; corrected identity values intact.
- Post-condition: every §I record's derived discriminator set and sourceClass
  equal the persisted values (full conformance achieved).
- Deterministic repeat build (in-process twice + subprocess re-run) — identical.
- Twelve negative controls executed; every one rejected with zero publication
  (see `TEST_RESULTS.json` / manifest `negativeControls`).

## 6. Coverage and limitations

- The §I conformance census is complete for the §I surface (6/6). No claim is
  made about semantic conformance of the 110 legacy records beyond byte
  preservation; they are outside this act's scope and outside the §I rules.
- F03/F04 of the original v1 IV1 remain EVIDENCE_INSUFFICIENT (Codex
  continuation §4); this act does not adjudicate them.
- No final Stage-2 Measurement Regression was executed (prohibited by brief).
- No downstream Environment classification was executed or inferred from the
  corrected discriminator routing or fail-closed sourceClass states.
- Python stdlib only; deterministic; no network, no persistence outside the
  package directory, no Git operations.

## 7. Package identity

| Member | Bytes | SHA-256 |
|---|---:|---|
| STAGE2_FINAL_EFFECTIVE_VIEW_ASSEMBLY_1_CORR2_BUILD.py | 47542 | `a34aaddbc4d4f66b970c6c9bc9e1d4668889e17d92b0566060d5576dc4e34a8d` |
| STAGE2_FINAL_EFFECTIVE_VIEW_ASSEMBLY_1_CORR2_RECORDS.jsonl | 104722 | `5b37071a5fa5374c77b149bfde5c230c228cdf73d9785e5ea55346f9fab28daa` |
| STAGE2_FINAL_EFFECTIVE_VIEW_ASSEMBLY_1_CORR2_DELTA_PROVENANCE.json | see manifest | see manifest |
| STAGE2_FINAL_EFFECTIVE_VIEW_ASSEMBLY_1_CORR2_MANIFEST.json | — | external anchor (see manifest self-hash policy) |
| STAGE2_FINAL_EFFECTIVE_VIEW_ASSEMBLY_1_CORR2_TEST_RESULTS.json | — | external anchor (author-side test evidence) |

The manifest pins every other member by SHA-256 and byte count and does not
embed its own digest (circular self-hash forbidden). The manifest's and this
report's own identities are established post-write by external hashing.

## 8. Stopping point

CORR2 candidate assembled and self-validated. Next act: fresh independent
verification by a non-author verifier (per §10 role separation). No Git stage,
commit, push, or any other Git mutation was performed or is authorized by this
report.
