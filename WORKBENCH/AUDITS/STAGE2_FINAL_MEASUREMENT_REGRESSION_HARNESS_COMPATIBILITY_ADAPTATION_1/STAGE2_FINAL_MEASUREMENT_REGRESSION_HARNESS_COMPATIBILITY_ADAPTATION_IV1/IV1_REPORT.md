# STAGE-2 FINAL MEASUREMENT REGRESSION — HARNESS COMPATIBILITY ADAPTATION.IV1

**VERDICT: PASS**

This PASS covers one candidate only: the Codex compatibility adapter at SHA-256 `82f78f8c6db43473fb0c79676374227384354fee8e46537427584cd2a39fd560`. It is independently verified as a bounded exact-input adapter for the accepted FEVA CORR2 records. It is not Owner acceptance, not Git closure, and not a Stage-2 measurement result.

Counts: 0 BLOCKING, 0 MAJOR, 1 MINOR, 4 ADVISORY. `CONTRACT_AUTHORITY_GAP` is not raised for this exact frozen input.

## 1. Role and independence

Actor: Grok 4.7. Mode: AUDITOR.

The standing router lists Claude, Codex, and Z-Ai as auditor actors. Routing policy §2 permits an ineligible model only after an explicit Owner routing change. This act is that change: the Owner appointed Grok 4.7 as independent auditor of this candidate. The appointment does not change the standing router for any later act.

Independence: Codex authored the historical harness and this adaptation. This session did not author either file, the oracle, the author tests, or the FEVA records. Workspace memory of earlier Grok work is the public UI frog stream, a different workstream, and it does not touch this harness. `INDEPENDENCE_FAILURE` is not present.

Author `AUTHOR_COMPATIBILITY_RESULTS.json` was not used as an oracle. The author test file was read and was not executed, because executing it rewrites files inside the candidate package.

## 2. Authorization and baseline

Repository root: `/Users/entp_psyche/Desktop/InvestProjects2026/MergeVue PayProduct (june 2026)/MergeVue-M&A (August 2026)`. Branch `main`. HEAD `2f7bcc5d33cf8009145aa85cbb39d2ae9084ec26`, the FEVA CORR2 Git-closure commit. Tracked dirty paths before and after this audit: 0. Untracked paths before and after: 431. No Git mutation, no product write, no candidate-package write.

Governance sidecars match:

- Control Tree v2.1 `360bafa29bad5ea93752323d4a217bf59aaec628e0e2b236350a2edd9c1f7128`
- Git worktree closure `27aa43abd0d8ce93b500231ded6b47d98949ba2a475f991098081c320b270a85`
- Model routing policy `07fdf43043c3a2245c7cb0eae2e89ff42f88d66100736751227f2ddfb7d34a23`

Control Tree v2.1 does not name this FEVA. The accepted CORR4 reconstruction still labels node B17.5 as FEVA CORR1 (`3603c316…`). The later tracked closure `STAGE2_FINAL_EFFECTIVE_VIEW_ASSEMBLY_1_CORR2_GIT_CLOSURE_1.md` (SHA-256 `c5226bc80fb48c604c4171f3518bd1afb5abfda6aa04590609e489c6f823ed51`, sidecar match) leaves that reconstruction text untouched and sets the FEVA lane terminal identity to CORR2. This audit follows that closure. B5.8 remains uncleared for forward measurement progression. Nothing in this PASS clears it.

Accepted FEVA bytes were read with `git cat-file -p`, not from an author report. Blob `43335eed6a9bdec0a9685565975b36b7e7f16ef3`, 104722 bytes, SHA-256 `5b37071a5fa5374c77b149bfde5c230c228cdf73d9785e5ea55346f9fab28daa`. The package copy matches. CORR4 Git bytes are 250512 and SHA-256 `2de49862fb0d63c5f1cd1745531199137e73b7b37abceecef6e735d497d38bb0`.

## 3. Candidate and manifest

`ADAPTED_REGRESSION_HARNESS.py`: 28712 bytes, SHA-256 `82f78f8c6db43473fb0c79676374227384354fee8e46537427584cd2a39fd560`. Unchanged at the end of the audit. No `__pycache__` was created in the candidate package.

`MANIFEST_SHA256.json` lists 132 files besides itself. Disk has those 132 files. No missing path, extra path, duplicate path, or hash mismatch.

`INPUT_IDENTITIES.json` pins 107 frozen inputs. All 107 match the frozen bytes. Fifty are Git blobs at this HEAD and match. Fifty-seven are untracked worktree files and match the worktree. None are symlinks and none escape `FROZEN_INPUTS`. See IV1-F04.

## 4. What was reproduced

Full adapted `regress()` was not run. That omission is the act boundary, not a missing check.

Commands and results are in `IV1_REPRODUCTION_RESULTS.json`. The public CLI, started with working directory `/tmp`, accepted the exact file and printed `measurementExecuted: false`, 116 records, 110 legacy, 6 SECTION_I. The same-length altered file exited 2 with `EXACT_INPUT_IDENTITY`.

Two `load_exact_input` calls were equal. Two single-edge measurements of the same legacy edge were equal.

Bounded A-E001 measurement, one edge only, matched the independently recomputed bearing triple, `prOnlyBasis`, source class, discriminator `D-06`, `edgeState` PARTIAL, `missingComponents` `["c2"]`, `scopeBridgeState` UNRESOLVED_FAIL_CLOSED, and expression result OPEN. It also retained three diagnostics: `COMPONENT_SCHEMA`, `ORPHAN_EXPRESSION_MECHANISM` for `M-FORMAL-RULES`, and `SECTION_I_sufficiencyExpression`. `M-FORMAL-RULES` does not occur in the PD3-CLAR-1.CORR1 registry. The stored expression is `ALL_OF(M-ENFORCE-SANCTION, M-FORMAL-RULES)`. The registry expression for the target is the four-mechanism `ALL_OF` listed in the reproduction file. The adapter reports that disagreement. It does not rewrite the record.

Bounded F0024 measurement matched `factualPackageIdentity` to the frozen provenance sidecar. The seven correction flags were true.

Independent PI-7 derivation used the accepted FEVA CORR2 builder on the raw binding JSONL. All six edges matched, including fail-closed `OUTSIDE_FROZEN_VOCABULARY` and the assigned labels `compensation plans` and `access-rights/role matrices`.

Independent CORR10 `evaluate`, with the empty witness context from FEVA CORR1 builder lines 312–313, returned ADMITTED, EVALUABLE, null indeterminacy reasons, NON_DISCRIMINATING, cap B-1b. The adapter's successor comparison returned the same triple. `prOnlyBasis` equals `recordedPrOnlyBasisForMaterialization` in the A-E001 directionality decision.

Historical original reproduction used only `ORIGINAL_FROZEN_HARNESS.py` on the historical input. Result-structure SHA-256 `58c2080b9d038ce91330fa8af7cf30ebb9d6b1920b9dc238a62e2904ec6b8e37` matches the frozen historical artifact. Defect count 37. Execution cells 107 PASS and 3 FAIL. All four original negative controls detected their original codes, including `ORPHAN_factIds`. This is a reproduction of the frozen historical FAIL. It is not a new measurement result.

The frozen correction IV1 report still says `VERDICT = HOLD`, with 1 BLOCKING and 1 MAJOR. This audit does not reopen it.

## 5. Behavioral delta

Every executable change from `ORIGINAL_FROZEN_HARNESS.py` was classified.

| Change | Why it is authorized |
| --- | --- |
| Root moves from the process working directory to `FROZEN_INPUTS` beside the adapter | Hermetic read of the pinned package. CLI from `/tmp` succeeded. |
| Public input is an explicit path with length and SHA-256 gates | Closure §3 identity. Any other bytes raise `EXACT_INPUT_IDENTITY`. |
| View schema path moves to `…CODER_VIEW_SCHEMA_CORR2_CORR1_CORR2_CORR1.json` | The same schema is a declared FEVA CORR2 builder pin in closure §8. |
| Composition gate compares ordered identities, each raw line, and the first 110 lines | Independent Git parse matches the oracle on every line. Null versus absent is distinguished. |
| `section_fields` keeps the legacy field list for five edges and, for edge id A-E001 only, drops `supportClass` and adds the three SEP fields plus `prOnlyBasis` | Matches the six physical records and SEP-I-4 / SEP-BC-1 / the accepted `prOnlyBasis` decision. |
| `supportClass` enum skip is limited to A-E001 | That record has no `supportClass` key. Writing one back is `SECTION_SCHEMA`. |
| Schema, counterfactual, and non-OPEN expression failures raise `InputRejected` instead of `assert` or a continuable issue | Fail-closed. They are not labeled PASS. |
| Edge `sourceClass` is derived by the accepted PI-7 functions | Raw-byte derivation matched all six stored values. |
| A-E001 bearing fields are compared to CORR10 `evaluate` under the CORR1 empty context | Independent evaluate matched the record and the CORR1 expected outcome. |
| `unexpected=[]` replaces the old live allowlist | The 19 oracle difference paths equal an independent presence-aware diff against predecessor `a1fcae68…`. There is no extra suppression path. Exact composition already rejects any other record. |
| Superseded non-recomputed fields are `NOT_DETERMINABLE` rather than copied from the stale cell | The cell is not promoted into a new analytical assignment. Recomputed fields are still compared. |
| `mutation` is removed from public `regress` and remains on `_measure_subset` | Public entry is tighter. The private seam is IV1-F01. |
| CLI performs the identity and composition gate only | Observed `measurementExecuted: false`. |

No check found in the original was deleted. The old difference allowlist was replaced by a stricter exact-file gate plus an equal, not larger, difference set. `presentationLaneOnly` is already in the successor view-schema groups, so the adapter does not invent that field.

## 6. Contract applicability

Five legacy SECTION_I records, lines 111–114 and 116, require `supportClass` and reject successor keys. A-E023 stays on that legacy schema. Its CORR2 changes are `discriminatorIds` `D-07` and `sourceClass` `OUTSIDE_FROZEN_VOCABULARY`, which the PI-7 derivation reproduces. The methodology successor's DE-4 projection for A-E023 is not a materialized successor row, and the adapter does not migrate it.

A-E001, line 115, is the only successor row. It has no `supportClass`. It has `bearingEvaluability`, `bearingIndeterminacyReasons`, `supportBearing`, and `prOnlyBasis`. The bearing triple is the accepted CORR1 machinery outcome. `prOnlyBasis` is the recorded decision object, and CORR2 refuses to alter it. Arbitrary truthy `prOnlyBasis` is rejected before `evaluate`, which matters because `b1b_cap_fires` would otherwise treat any truthy object as sufficient.

No new field on this file required an invented mapping.

## 7. The 110 and the 6

From the Git object:

- Lines 1–110: 110 `POST_RECONCILIATION_EXECUTION_CELL_RECORD` rows. Raw SHA-256 `b382ffc52a626cc8eb796f01d1456d531cdea959bc6c23f7d31b0d392031ceca`, 78644 bytes. The composition gate rejects a trailing-space change of line 1 as `LEGACY_RAW_PRESERVATION` when composition is called directly. The public loader rejects it earlier as `EXACT_INPUT_IDENTITY`.
- Lines 111–116: the six SECTION_I rows named in `IV1_IDENTITY_CHECKS.json`.
- No duplicate JSON keys and no duplicate record identities in the accepted file.

The author oracle's 116 line records equal this parse. That shows the oracle is a freeze of the accepted file. It is not a measurement result compared with itself. Source class and the bearing triple were recomputed from the accepted builders.

## 8. Negative controls

Twenty-six predeclared controls produced the predeclared new diagnostic or early rejection. The list is in `IV1_NEGATIVE_CONTROLS.json`. They cover old-view impersonation, same-length digest change, reorder, drop, duplication, duplicate JSON keys, null versus absent, successor-field smuggling, missing successor fields, invented PR basis, upward scope, post-T0 support, changed source, changed side, corrupted provenance, missing components marked supported, held successor admission, the four original negative-control behaviors, DE-4 support, a prohibited outcome field, a counterfactual relation, and a duplicate PI-7 key.

The original missing-fact control now stops at `ACTUAL_SOURCE_BINDING` / `MULTI_FACT_EDGE` and names the perturbed fact list. The unmodified original harness still detects `ORPHAN_factIds`. The new code is an earlier rejection of the same perturbation, not a disappeared check. `scopeBridgeFactIds` still produces `ORPHAN_scopeBridgeFactIds` through the preserved orphan scan; the inconsistent-aggregate control produced `SECTION_I_missingComponents`.

One predeclared probe, string `linkageEvidence` on F-B-0025, did not create a new `COMPONENT_SCHEMA`. The accepted item is already a string, with extra keys `status` and `entailmentBasis`. Baseline already emits that schema diagnostic. The probe did create a new `SECTION_I_componentSupply`. A follow-up isolation, using an exact six-key item, produced `COMPONENT_SCHEMA` for a string and did not produce it for a dict. That is a test-design correction, not a harness defect.

## 9. Safety and scientific boundary

Fresh calls do not share measurement rows. Dependency bytes are re-hashed on each call. The CLI does not depend on the repository working directory. `InputRejected` exits 2 from the CLI and propagates from `regress`; it is not turned into PASS. The census key `environmentAssignmentFields` is an empty list. No Environment code, HEDC class, or ECS value was emitted. Missing components marked SUPPORTED produced `SECTION_I_edgeState` and `SECTION_I_missingComponents`. Bearing did not upgrade the A-E001 expression result away from OPEN. The retained expression mismatch was not repaired.

## 10. Author claims

| Claim | Independent result |
| --- | --- |
| Candidate ready for IV | The adapter meets the bounded compatibility criteria. Readiness for a later full regression is stated below. |
| 40/40 author tests, 27 negative | Not re-executed and not treated as proof. The test source contains 40 `test(` registrations, zero `c.regress(` calls, and one `_measure_subset` helper that refuses more than one derived edge. |
| Exact SHA and composition gates | Verified. |
| 110 legacy lines preserved | Verified from Git bytes. |
| Five legacy SECTION_I plus one A-E001 successor | Verified from keys and from `section_fields`. |
| Legacy `supportClass` preserved; successor bearing and `prOnlyBasis` under accepted authority | Verified. |
| Historical FAIL reproduced | Verified by a fresh original run whose structure hash matches the historical artifact. |
| Author did not run full current `regress()` | Source fact of the author test file. This audit also did not run it. |
| No contract-authority gap for this input | No gap found. |
| No repository mutation | Verified before and after. |

## 11. Findings

- IV1-F01 MINOR. `_measure_subset` can measure mutated rows while reporting the accepted file SHA. `regress` and the CLI cannot.
- IV1-F02 ADVISORY. A shape-valid nested `factIds` value is not referentially checked. The exact-input gate makes that unreachable for `regress`.
- IV1-F03 ADVISORY. Duplicate edge identity is counted in the census. Composition rejects identity changes first.
- IV1-F04 ADVISORY. Fifty-seven pinned inputs are untracked worktree files. They matched at audit time, and drift fails closed.
- IV1-F05 ADVISORY. An extra prohibited key is rejected as `SECTION_SCHEMA` before `FORBIDDEN_OUTPUT`. The field is still rejected.

## 12. Readiness

The adapter is technically ready for a separately Owner-authorized complete regression, with these conditions:

- Call `regress(path)` or the CLI. Do not call `_measure_subset` with a mutation.
- Keep the exact FEVA identity `5b37071a…`.
- Treat retained A-E001 diagnostics as open measurement evidence, not as adapter defects and not as a measurement PASS.
- Do not describe the result as HEDC, Environment determination, Owner acceptance, or Git closure.

This audit does not authorize that regression.

## 13. Limitations

- Adapted `regress()` over all 116 records was not executed.
- Author tests were inspected and not run.
- Expression evaluation inside the adapter was executed for bounded edges, not as a six-edge campaign. The A-E001 expression disagreement was observed directly.
- Historical FAIL preservation depends on the worktree copies of the original inputs, which the pins matched.
- The closure's statement of Owner acceptance is the controlling written record used here. This audit did not re-derive the Owner's earlier spoken acceptance from outside that record.

## 14. Next action

Stop. Return this package to the Owner and Orchestrator. Do not start the full Stage-2 measurement regression, HEDC, Environment determination, product wiring, commit, push, or deployment.

## 15. Emitted files

Directory: `/private/tmp/STAGE2_FINAL_MEASUREMENT_REGRESSION_HARNESS_COMPATIBILITY_ADAPTATION_IV1/`.

| File | Bytes | SHA-256 |
| --- | ---: | --- |
| IV1_FINDINGS.json | 4445 | `061c835f5b09ca09cbfa213d87d5627a7c32539539d37236dfc16d315122935f` |
| IV1_IDENTITY_CHECKS.json | 4889 | `9f20d467774c978e1b8cc7d5cc3c8d0f1e39581ecc54251b792b106f6a2512e6` |
| IV1_REPRODUCTION_RESULTS.json | 4855 | `99c2c56029eadba3a83d9bc332237133e30465801bf16c49365cf4f18b37a504` |
| IV1_NEGATIVE_CONTROLS.json | 5659 | `76533faa27b9f219e33a914235d87535f817deaa668fd0c2ba255d4b88a8263c` |
| IV1_AUTHORITY_TRACEABILITY.json | 7126 | `e1c069f7573b453e11f1545e9ff622dade190fe222046fc1fe77fc833c883aa8` |
| _evidence_bundle.json | 114667 | `999b4a7cef25d41853bbe7dbfb88d0b29112f00331b3a721478741feb5a80c39` |
| historical_original_summary.json | 1159 | `ed525552e0296a7b02bbf9d60a399e086761ed503184559b792881a458376d64` |
| neg_same_len.jsonl | 104722 | `ee07ea1df0478d28ee3fdd228aeff9fef64bf85d42cc1f0bea950f432d5b04ec` |

This report's own bytes and SHA-256, and the hashes above, are recorded in `IV1_MANIFEST_SHA256.json`. That manifest excludes its own hash. The three files whose names start with `_evidence`, `historical_`, and `neg_` are supporting evidence. They are not additional verdicts.

Post-state recount, same method as §2: `git status --porcelain` tracked-dirty entries 0, untracked status entries 431. `git ls-files --others --exclude-standard` lists 760 files because it expands untracked directories. No path was added inside the repository.

Candidate after this write: `ADAPTED_REGRESSION_HARNESS.py`, 28712 bytes, SHA-256 `82f78f8c6db43473fb0c79676374227384354fee8e46537427584cd2a39fd560`.

**VERDICT: PASS**
