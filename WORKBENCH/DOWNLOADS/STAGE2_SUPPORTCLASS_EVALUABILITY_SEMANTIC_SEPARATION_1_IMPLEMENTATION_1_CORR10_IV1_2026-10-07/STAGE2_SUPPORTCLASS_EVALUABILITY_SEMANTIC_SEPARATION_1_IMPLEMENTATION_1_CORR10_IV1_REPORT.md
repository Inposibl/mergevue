# CORR10 independent IV — final pre-production audit

## 1. Act, actor, role, date

- **Act:** STAGE2_SUPPORTCLASS_EVALUABILITY_SEMANTIC_SEPARATION_1.IMPLEMENTATION-1.CORR10.IV1
- **Actor:** CLAUDE (Claude Opus 5.5)
- **Role:** AUDITOR (`AGENTS_A.md` AUDITOR mode), Owner-assigned. Owner authorization: GRANTED.
- **Mode:** final independent pre-production audit; read-only; non-author; terminal act of the CORR1..CORR10 correction stage.
- **Date:** 2026-10-07. Audit executions ran 19:12–19:23 UTC.
- **Governance read in full:**
  - `AGENTS.md` (`f1f34b93…`);
  - `AGENTS_A.md` (`3c73d681…`);
  - `MERGEVUE_CAUSALITY_PROOF_AND_AGENT_CONTROL.md` (`06770667…`);
  - `skills/mergevue-agent-quality-gate/SKILL.md` (`c80d3aa9…`).
- **Scope of claim:** component level only. The successor-view builder is scratch-only machinery. This audit claims no production wiring, runtime integration or deployed behaviour (causality policy §26–§27). "Pre-production" refers to the Owner's release threshold for this component.

## 2. Independence disclosure

**INDEPENDENCE = PASS (with disclosure).**

- **Authorship.** CODEX authored CORR10. I authored no CORR10 artifact.
- **Methodology lineage.** I authored the accepted methodology chain (`2f595ab5…`, incorporating CORR1 `02505e92…`) as the Owner-assigned methodology author. It is the basis of this audit, not its object. The Owner-decided surfaces (Architecture C, direction-only bearing, DE-4 ceiling, U-3 proven-sharing-only) were not reopened.
- **Audit lineage.** I audited this implementation line through CORR8.IV1 and CORR9.IV1. CORR9.IV1 finding CORR9-IV1-01 is CORR10's defect specification. The six CORR10 mutants are the author's own re-implementations of the six survivor shapes I published there.
- **No reuse.**
  - `/private/tmp/corr9iv1` and `/private/tmp/corr8iv1` were not opened.
  - No prior harness, mutant, witness or expectation table was reused.
  - Every harness file under `/private/tmp/corr10iv1/h/` was written for this act (identities in the MANIFEST).
  - The author's PROPERTY_SUITE, MUTATION_SUITE, CVK and builder were run **unchanged**, as the evidence under audit.
- **Expectations first.** The 40 CORR10 world expectations were derived by hand from frozen text (§15) before comparison with the author's or production's values. The author's own expectations were never used as authority.

## 3. Controlling Owner pre-production FAIL rule

Applied as controlling, and as later authority than earlier open-ended mutation-survival criteria.

- **What can FAIL.** A FAIL requires a demonstrated CRITICAL defect in the exact current candidate. It must rest on a complete causal chain: exact CORR10 code → authoritative or currently reachable input → materially wrong behaviour → release-blocking consequence.
- **What cannot FAIL.** Hypothetical mutants, future regressions, untested shapes and Git metadata noise are classified only as ADVISORY / QA_BACKLOG / POST_RELEASE_WATCH / RESIDUAL_NON_BLOCKING.
- **What this audit did not do.** It created no new mutation family and searched for no new survivor.
- **Prior reports.** Historical reports are not rewritten. CORR9.IV1 remains a FAIL under the rule then in force.

## 4. Terminal correction-stage rule

```text
CORRECTION_STAGE_TERMINATED = YES
CORR11_AUTHORIZED = NO
```

This audit recommends no CORR11 and no further correction cycle.

## 5. Verdict

```text
VERDICT = PASS
```

The exact CORR10 candidate is physically established, and its builder and CVK are byte-identical to CORR9. The contract has no semantic delta. Every author claim reproduces exactly:

- 973/973 worlds;
- 73/73 mutants killed;
- 178 permutations, 0 failures;
- identical regression replay and PI-3 probe.

No current critical defect exists in the exact candidate:

- **40 CORR10 worlds.** The builder agrees with my frozen-text derivation on all 40, and on 56/56 detailed TT cells (reasons, uniqueness basis, component verdicts, hold codes).
- **Real/frozen path.** It agrees on all 6 SECTION_I records of the frozen view, including the A-E023 and A-E001 boundaries.
- **PI-3.** It agrees on all 36 PI-3 identities. There is no false certification and no lawful rejection.

```text
CURRENT_EXACT_CANDIDATE_DEFECT = NO
CRITICAL_CURRENT_DEFECT = NO
PREPRODUCTION_RELEASE_BLOCKING = NO
REAL_OR_AUTHORITATIVE_CURRENT_PATH_EVIDENCE = YES   (exercised; no defect found on it)
INDEPENDENTLY_VERIFIED = YES   (under the Owner pre-production critical-fail threshold; component scope)
OWNER_ACCEPTED = NO
GIT_CLOSED = NO
```

**What INDEPENDENTLY_VERIFIED = YES means.** It means independently verified under the Owner's controlling pre-production critical-fail threshold. It does **not** mean that:

- every hypothetical regression is impossible;
- every future user input has been observed;
- production telemetry is complete;
- post-release QA is unnecessary;
- production wiring or runtime integration exists.

## 6. Severity counts

```text
BLOCKING = 0   CRITICAL = 0   MAJOR = 0   MINOR = 0   ADVISORY = 4
```

## 7. Exact CORR10 candidate identity

The directory `WORKBENCH/DOWNLOADS/STAGE2_SUPPORTCLASS_EVALUABILITY_SEMANTIC_SEPARATION_1_IMPLEMENTATION_1_CORR10_2026-10-07/` contains exactly 8 files. All 8 match the Owner's bytes and SHA-256 before the audit and after it (MANIFEST).

| Member | Bytes | SHA-256 |
|---|---:|---|
| AUTHOR_REPORT.md | 18238 | 80413a9b010560d73a0fe57e096bb136104879f8c5d3d2f830cd16ab59be6981 |
| CONTRACT_MODEL.json | 107403 | 433a8bf310d255860f04ad5147908a6003aaacf74d61f7dde892d481373de85d |
| CONTRACT_VERIFICATION_KERNEL.py | 37366 | 7d80a64041b2fcba97abd49f1ca28ead9c1765b8de0c1c4d2863762c4164544c |
| MANIFEST.json (physical) | 617556 | 34b78865d296e952f6a87f36733da482d130104858224f8ed62df36b524c5782 |
| MUTATION_SUITE.py | 42205 | e0264f4e7c670d6cef7fb9b3eae2c68d0651b132716f02bf2ae685633eececae |
| PROPERTY_SUITE.py | 137584 | c31fed59e8b47e496d78a12816eebc35a1ca69f1038f036416a3d05d0a3cdb70 |
| SUCCESSOR_VIEW_BUILDER.py | 89501 | 4fabec820660e9399ece1314142e5bdc99a3196c9794fa71a3dc5ddb80551cc9 |
| VALIDATION_REPORT.json | 8359171 | 35ffcf542750905189f22b10c23c0e6793cbd924fb73908878ca8758a6b2792c |

`CANDIDATE_IDENTITY = ESTABLISHED`.

## 8. Repository baseline

Every Git command was read-only, run with `GIT_OPTIONAL_LOCKS=0`. Each exited 0. No `fetch`, `pull` or `remote set-head` was run.

| Item | Value |
|---|---|
| Root | `/Users/entp_psyche/Desktop/InvestProjects2026/MergeVue PayProduct (june 2026)/MergeVue-M&A (August 2026)` |
| Branch | `main` |
| HEAD | `2567223087d99b40bdfd174eed32566be7080e44` |
| Tracked diff / staged diff | empty / empty |
| Porcelain `-uall` before the audit | 837 entries, all untracked. That is 826 at CORR9.IV1, plus the 3 CORR9.IV1 outputs and the 8 CORR10 files. Listing SHA-256 `2e28fc2d…`. |

## 9. Frozen methodology identity

All identities were recomputed this act.

| Authority | SHA-256 | Bytes |
|---|---|---:|
| accepted candidate CORR2.CORR1.CORR1.CORR1.CORR1 | 2f595ab5ddecc7e8149f751c661470bbae1fa3abfb1fb207b2b65c4c4565d6c8 | 111635 |
| accepted impact census | 3133b758b77da2fa3f0270f4a3818b6d91f1ed6d0b38f6d89500d40bf10fc721 | 187602 |
| accepted manifest | f068e31c6b609a3f0e01b0975eb5b0986e9bd1140438513ef18c7ce0a8b276dc | 9131 |
| incorporated CORR1 candidate | 02505e92fd018439f9aba7d4b551fe5542c1be92c7bbb7d4f63994dc1dfa51e9 | 102697 |
| CORR1 census (Cmp(M) table) | d36e386d3b90032eca02ee28a32f14ea50b5acbc049bd26cea614f0efaf67b9a | 142192 |
| registry (PD3 CORR1 candidate) | cb08b51e1c2fbaec7765989a7a4e15db1788c53eb5fec43f2628ecb88c1d6c73 | 344754 |
| Stage-1 source map / predecessor effective view | 665aac81… / a1fcae68… | 17490 / 104310 |
| migration contract | 8efcda9455e1e0bc9358bf527494301057638621986311c5520523b2dd528d46 | 17705 |

`OPEN_OWNER_METHODOLOGY_SURFACES = 0`. No methodology change was made or needed.

## 10. CORR9.IV1 lineage

| Item | Value |
|---|---|
| REPORT | 41430 B, `a55bf12439469ae1c322a9e26b917283b407f6720c6c56e2533b7f4458c63aeb` |
| FINDINGS | 219492 B, `a7a94b33ae65e0c01f8727d0820399d33a66f0eae5b072b2dd04ba4744638a82` |
| MANIFEST | 39274 B, `03587f82b2422f2d278a7e6d55891be2d49e65475a13526e3dc581bc751ee4c3` |
| Prior verdict | FAIL, 0 BLOCKING / 1 MAJOR / 0 MINOR / 3 ADVISORY |
| Controlling finding | CORR9-IV1-01: five cells (B1, B4, C5, D4, G1/FX6) not generalized-closed; 6/16 fresh mutants survived; **exact production candidate correct (189/189)** |

All three identities bind exactly. The CORR9 package (8 files) also binds to the identities recorded in CORR9.IV1.

## 11. CORR10 author-state reproduction

| Author claim | Independently reproduced |
|---|---|
| STATUS = BLOCKED, solely because of strict Git metadata preservation | Confirmed as the only blocker. The reflog change is append-only, same-OID and environmental (§21). |
| IMPLEMENTED = YES, SELF_VALIDATED = YES | YES (§13–§15) |
| PRODUCTION_BUILDER_CHANGED = NO / CVK_CHANGED = NO / CONTRACT_SEMANTIC_DELTA = NONE | YES (§12) |
| 973 worlds = 933 retained + 40 new; 0 failures | YES (§13) |
| 73 mutants = 67 retained + 6 new; 73 killed; 0 survived; 0 exception kills; 0 execution exceptions | YES (§14) |
| 178 permutations (6 new), 0 failures; CWD_RESULT_EFFECT = NONE | YES (§13) |
| FALSE_CERTIFICATION = NONE; LAWFUL_PHYSICAL_PI3_REJECTION = NONE | YES (§17) |
| A-E001 / AOL / three-loci / Environment / final-view / Final Regression boundaries | YES (§18–§20) |
| AGENT_GIT_MUTATION = NO; GIT_SEMANTIC_STATE_CHANGED = NO | Consistent with all evidence (§21) |

## 12. Builder / CVK / contract preservation

```text
BUILDER_BYTE_EQUAL = YES   (cmp CORR9 vs CORR10; both 4fabec82…, 89501 B)
CVK_BYTE_EQUAL = YES       (cmp CORR9 vs CORR10; both 7d80a640…, 37366 B)
CONTRACT_SEMANTIC_DELTA = NONE
```

**Contract model.** CORR9 and CORR10 have the same 23 top-level keys. They differ only in `act` and `artifact`; `date` is 2026-10-07 in both. After excluding `act`, `artifact` and `date`, a type-exact recursive comparison finds 0 differences.

- My canonical projection hashes to `3aeafd27…` for both. This equals the CORR8 → CORR9 projection recorded in CORR9.IV1.
- The author's `570de091…` uses a different canonicalization; that does not matter here.

**Suites.**

- **Retained code.** A textual diff shows that the CORR10 PROPERTY_SUITE and MUTATION_SUITE retain every CORR9 line. Only the docstring and the `PREFIX` constant changed, and the CORR10 extension is appended after the CORR9 code.
- **Unchanged layers.** The CORR9 `check_case` route, Layer B (`K.Kernel`) and Layer D (`K.HoldOrderOracle`) are reused unchanged.

## 13. 973-world reproduction

Every run was unchanged and under my fresh audit-hook guard. The guard blocks writes outside the run scope, process spawn and network.

| Run | CWD | PYTHONHASHSEED | LANG | TZ | Result |
|---|---|---|---|---|---|
| prop-root | repository root | 5 | C | UTC | 973/973, exit 0 |
| prop-pkg | CORR10 directory | 4242 | en_US.UTF-8 | Pacific/Auckland | 973/973, exit 0 |
| prop-tmp | fresh `/private/tmp` directory | 0 | fr_FR.UTF-8 | America/Denver | 973/973, exit 0 |

**Byte-identity.**

- All three result files are byte-identical (`789bae8c…`), and byte-identical to the author's root output `outputSha256`.
- Their normalized digest `90836c48…` equals the author's in all three of the author's environments.
- The full PROPERTY_EVIDENCE object equals the author's VALIDATION_REPORT copy.

**Counts.**

| Item | Result |
|---|---|
| Worlds | 973 (933 retained + 40 new) |
| Failures; actual ≠ expected; any mismatch axis | 0; 0; 0 |
| Retained 933 | Their ledger is **byte-equal** to the CORR9 author ledger (SHA-256 `6384553213af27e4…` = CORR9 `expectationDigest`). |
| Permutation partners | 178, of which 6 are new: C10-B1-W1-FULL-ORDER, C10-B4-3-FACT-FULL-ORDER, C10-B4-3-FACT-LOST-ORDER, C10-C5-SUPPORT-N-COUNTER-D-ORDER, C10-C5-SUPPORT-I-COUNTER-D-ORDER and C10-G1-MULTI-COMPONENT-1U-4N-ORDER. Failures: 0. Unequal to base: 0. |
| Metamorphic / parser / model | 14/14, 7/7, PASS (74 Ms, 62 TTs, registry `cb08b51e…`) |
| Layer D overall | 1421 TT assertions over 938 cases |
| Physical PI-3 in suite | view 5/5 of 6, sidecar 30/30, failures 0 |

```text
CWD_RESULT_EFFECT = NONE   PERMUTATION_FAILURES = 0
```

## 14. 73-mutant reproduction

Run: unchanged MUTATION_SUITE under the guard, repository root, seed 31, exit 0, 110 s.

| Item | Result |
|---|---|
| Mutants | 73 (59 CORR8-retained + 8 CORR9 + 6 CORR10) |
| KILLED / SURVIVED | **73 / 0** |
| Exception kills / execution exceptions / unstable references | 0 / 0 / 0 |
| Retained 67 | IDs, results and source SHAs equal the CORR9 author ledger. |
| Equality with the author | After removing only the run-scratch prefix, the whole MUTATION_EVIDENCE equals the author's. The normalized digest `8426b162…` equals the author's in all three of the author's environments. |

**Kill rule.** The suite counts a mutant as KILLED only if it compiled, ran without exception, its direct witness FAILED and its references were stable. An exception therefore yields SURVIVED, never a kill. The six CORR10 mutants:

| Mutant | Fault shape (author's own implementation) | Direct witness | Frozen | Mutant | Worlds detected | Controls | Result |
|---|---|---|---|---|---:|---|---|
| C10-B1b | COUNTER_M declarations dropped for a fact whose W(f) fails W-1 | C10-B1-W1-FULL | DIRECT_CONTRADICTION | HELD | 4 | PASS | KILLED |
| C10-B4b | counter declaration traversal truncated after two facts | C10-B4-3-FACT-FULL | DIRECT_CONTRADICTION | HELD | 4 | PASS | KILLED |
| C10-C5b | directional COUNTER_M rescues a N/I SUPPORTS_LEAF alternative | C10-C5-SUPPORT-N-COUNTER-D | DIRECT_SUPPORT ×2 | SHARED_NON_UNIQUE ×2 | 4 | PASS | KILLED |
| C10-D4a | EV-2 reason suppressed on DE-4 (cap reached first) | C10-D4-EV2-AMBIGUOUS | INDETERMINATE | NON_DISCRIMINATING | 1 | PASS | KILLED |
| C10-D4b | EV-4 reason suppressed on DE-4 | C10-D4-EV4-REGISTRY-UNRESOLVED | INDETERMINATE | NON_DISCRIMINATING | 2 (incl. COUNTER-UNBOUND) | PASS | KILLED |
| C10-G1b | N-majority mixed MD3 collapsed to all NO_CO | C10-G1-1U-2N-CMP | NON_DISCRIMINATING ×2 | DIRECT_SUPPORT ×2 | 9 (incl. FROZEN-1U-4N, FROZEN-2U-3N) | PASS | KILLED |

**Shape match with the CORR9.IV1 survivors.** Each mutant implements the CORR9.IV1 survivor shape named for its family:

- B1b: W-1-filtered declarations;
- B4b: first two facts;
- C5b: counter rescues N/I support;
- D4a/D4b: cap effectively before EV-2/EV-4;
- G1b: majority collapse.

No new mutation was created in this audit. My CORR9.IV1 mutant modules were not re-executed, because prior scratch harnesses are not used as fresh authority and the Owner bars new hypothetical campaigns.

## 15. Five final validation cells

**Physical presence.** `PROPERTY_SUITE.corr10_cases` exists and is executed by `cases()` / `run()`. All 40 worlds pass through the unchanged CORR9 `check_case` route. That route compares raw boundary parsing, Layer B, builder output, applicable Layer D, local alternative statuses and component verdicts.

| Cell | Worlds (Owner expected) | Layer B TT assertions | Layer D worlds / TT | Production = IV = author | Result |
|---|---:|---:|---|---|---|
| B1 | 9 (9) | 9 | 9 / 9 | 9/9 | **PASS** |
| B4 | 7 (7) | 7 | 7 / 7 | 7/7 | **PASS** |
| C5 | 6 (6) | 12 | 6 / 12 | 6/6 | **PASS** |
| D4 | 7 (7) | 9 | 0 / 0 (bearing/evaluability; outside Layer D contract) | 7/7 | **PASS** |
| G1 / FX6 | 11 (11) | 19 | 0 / 0 (bearing; outside Layer D contract) | 11/11 | **PASS** |
| **Total** | **40** | **56** | **22 / 28** | **40/40** | |

**Independent derivation of all 40 expectations, from frozen text only.**

**B1** (CORR1 §12 S6, §9.4 B3-1, §6.6 T-1; accepted §10). A COUNTER_M of M0 targets T1_0, with Cmp(M0) = {M1}. M2 is declared SELECTED on F2 only. S6 reads W(f) for Sel_other only, so Cmp⁺ = {M1, M2}. W closure gates DIRECTIONAL SUPPORTS_LEAF at S7 only. Outcomes:

- W-1, W-3 or W-4 broken with a complete trace → **DIRECT_CONTRADICTION**;
- the trace omits M2 (T-1 fails) → **HOLD-T**;
- MD3 UNRESOLVED → NON_DIRECTIONAL counter → **NON_DISCRIMINATING**;
- closed control → CONTRA.

**B4** (T-1 union over every record fact). A declaration on F3 or F4 with a complete trace gives **CONTRA**; a lost trace gives **HOLD-T**. Both hold under reversed fact order. The first-fact control gives CONTRA.

**C5** (CORR1 §9.5: counter records are not alternatives; accepted §7.1 U-3). Alternative M1 has a distinct SUPPORTS_LEAF record and a directional COUNTER_M record. The outcome depends on M1's support status:

| M1 support | Rule | Result |
|---|---|---|
| ND | U-1 | **DIRECT_SUPPORT** |
| INDETERMINATE | U-3 | **UNIQUENESS_UNRESOLVED** (EVALUABLE, null bearing; never SHARED) |
| HELD | U-X | **HOLD-U** |
| DIRECTIONAL | U-2 | **SHARED_NON_UNIQUE** |

The counter itself stays locally DIRECTIONAL.

**D4** (CORR1 §13.2 (1)–(2), accepted §10 S3/S4 before S6).

| Case | Failing gate | Result |
|---|---|---|
| DE-4 with an unresolved ambiguity record | EV-2 | **INDETERMINATE** |
| frozen ASYMMETRIC-RETENTION with NACR-1 on unsupplied c3 | EV-3 | **INDETERMINATE** on both TTs |
| non-EXACT TT | EV-4 | **INDETERMINATE** |
| counter on an unbound TT | EV-4 | **INDETERMINATE** |

The controls (CONDITION_NOT_MET, bound counter, fully satisfied EV) are EVALUABLE, and the cap then gives **NON_DISCRIMINATING**.

**G1** (CORR1 §6.6 T-3, §9.4 B3-6). Any UNRESOLVED disposition makes the component NON_DISTINGUISHING, whatever the NO_CO count. This gives:

- **ND** for 1U+2N, 1U+3N, 1U+4N, 2U+3N and the Sel_other vector;
- **DIRECT_SUPPORT** for multi-component (c1 NON_DIST, c2 DIST, U-0);
- **DIRECT_SUPPORT** for all-NO_CO (U-0).

On the frozen registry, TEST-RESULT c2 on TT-NTSTP-ES has |Cmp| = 5. 1U+4N and 2U+3N give **ND**; 0U+5N gives **DIRECT_SUPPORT**.

**Exact-candidate detail check** (`h/detail.py`, under the guard). I built the 40 worlds with the unchanged suite constructions and ran the exact builder. Of 56 TT cells, **56/56** match frozen detail:

- D4 reasons `MECHANISM_READING_AMBIGUOUS` / `COMPONENT_NOT_ASSESSABLE` / `TARGET_BINDING_UNRESOLVED` with a null bearing and no cap fired; the controls fire the cap and give ND;
- C5 uniqueness bases U-1 / U-3 pipeline state / HOLD-U / U-2;
- G1 component verdicts with no majority rule;
- B1/B4 HOLD-T or CONTRA without a hold.

**Coverage required by the Owner, met.**

- **B1.** Sel_other is declared with W-1, W-3 and W-4 broken, and complete/incomplete twins are distinguished.
- **B4.** The decisive declaration is on fact 3 or fact 4, with ordering.
- **C5.** SUPPORTS_LEAF and a directional COUNTER_M cover the same alternative, and the counter never redefines alternative status.
- **D4.** EV-2, EV-3 and EV-4 (registry-side and counter) failures are tested before the cap.
- **G1.** Mixed vectors include NO_CO-majority shapes, with frozen-registry witnesses.

```text
B1 = PASS   B4 = PASS   C5 = PASS   D4 = PASS   G1 = PASS   FX6_GENERALIZED = PASS
```

## 16. Real/frozen production preservation

The builder is byte-identical to the CORR9 builder that CORR9.IV1 independently found correct on all 189 fresh cells. CORR8.IV1 found the same production logic correct on 631/631. This act adds the following.

**Fresh real-path check** (`h/real.py`, in memory, under the guard). The exact CORR10 `build_successor_view` ran over view `a1fcae68…` with registry `cb08b51e…` and migration contract `8efcda94…`.

| Item | Result |
|---|---|
| Counts | sectionIRecords 6 / executionCells 110 / mechanical 5 / re-adjudication 1 / value changes 3 / SEP-MIG-8 splits 0 |
| Value changes | exactly A-E023, F-B-0025 and F0024 → NON_DISCRIMINATING (B-1a cap). This is the accepted Decision 3 statement (accepted §14). |
| F-E-0182 (ESS, PW) | SEP-MIG-5A MECHANICAL_PRESERVATION, ND |
| Environment safety scan | 0 forbidden keys |
| Inputs | byte-unchanged before and after; nothing persisted |

**Reproduced author surfaces.** All of these PASS and are byte-equal to the author's evidence:

- the regression replay: SYN-PC2, F03, F04, F05, F06, A-E023 general DE-4, frozen-registry adapter agreement and identical-input determinism;
- projection digest `0d48fb34…`, equal to CORR9.

**Surface map.** Each surface is exercised by reproduced worlds, all PASS and with a ledger byte-equal to the CORR9 ledger I audited in CORR9.IV1.

| Surface | Reproduced evidence |
|---|---|
| W-4 all supply records | 98 `W4*` worlds; P10 on 732 worlds |
| PI-3 physical binding | 55 `PI3*` worlds plus the physical sweep (§17) |
| COUNTER_M target binding | P15 on 419 worlds; C10-D4-EV4-COUNTER-UNBOUND / COUNTER-BOUND-CAP |
| DE-4 cap/order | P12 on 420 worlds; C9-C3, C9-D4, C10-D4 |
| AV-1 | 29 HOLD-ND TT assertions |
| U-3 | 80 UNIQUENESS_UNRESOLVED cells |
| exact enums | 36 `ENUM*` worlds plus 40 `M-ENUM` metamorphic witnesses |
| non-mapped containment | P06 on 388 worlds; C9-F2; NON_ANALYTICAL/UNMAPPED worlds |
| S7 applicability / exact hold routing | 1421 Layer D assertions (HOLD-U 402, HOLD-T 232, HOLD-ND 29, HOLD-NA 29, HOLD-AMB 13), 0 hold mismatches |
| per-TT / per-edge isolation | P01 on 643 worlds; companion-isolation checks |
| SYN-PC2, F03–F06, A-E023 | regression replay, all PASS |

```text
PRODUCTION_PRESERVATION = PASS   (no regression; no current-path defect)
```

## 17. PI-3

**Fresh independent physical sweep** (`h/real.py`). For each identity I derived the expectation myself, without builder code:

- the PI-3 member match must be unique in source map `665aac81…`;
- locator and assertion members must equal the map;
- no locator override and no extra member may be present;
- on-disk record-file bytes and SHA must equal the map;
- the fact must be unique with matching case, side and non-empty text.

Each expectation was then compared with `ProductionPackageAuthority.certify`.

| Identity set | Lawful by derivation | Production certifies | Disagreements |
|---|---:|---:|---:|
| View SECTION_I | 5 of 6 | 5 of 6 | 0 |
| Provenance sidecar | 30 of 30 | 30 of 30 | 0 |

The 6th view identity, AOL F0024, is stale: it has no unique source-map match on the PI-3 members (139589 B / `4b686b24…` versus the map's 61728 B / `88b20920…`). Production rejects it.

```text
FALSE_CERTIFICATION = NONE
LAWFUL_PHYSICAL_PI3_REJECTION = NONE
existing otherwise-lawful controlling-view identities = 5/5 certify
existing lawful sidecar identities = 30/30 certify
stale AOL F0024 = rejected
```

The author's `--probe-pi3` reproduces: DIRECT_SUPPORT on TT-STPSTJ-ESS and TT-STPSTJ-ORD; physical C-B01 certified; failures 0.

## 18. A-E001

The fresh in-memory build and the author regression replay agree.

| Item | Value |
|---|---|
| migrationRuleId | SEP-MIG-6c |
| projectionClass | RE_ADJUDICATION |
| holdCode | HOLD-T |
| successorTriple | [null, null, null] |
| c1 / c2 | SUPPLIED / ORDINARY_MISSING_ASSESSABLE |
| supportBearing | null |

```text
A_E001_REMAINS_READJUDICATION = YES   A_E001_ADJUDICATED = NO
```

It was not adjudicated.

## 19. AOL F0024

```text
AOL_F0024_CLASS = PRE_EXISTING_STALE_INPUT_DEBT
AOL_F0024_RECONCILED = NO
AOL_F0024_SEPARATE_ACT_REQUIRED = YES
AOL_F0024_BLOCKS_FINAL_EFFECTIVE_VIEW = YES
```

**Observation (no finding).** The in-memory projection still lists F0024 as a DE-4 value change to ND, even though PI-3 rejects its identity. This is lawful under SEP-DE4 (6): a capped DE-4 record needs no T(r) and no W(f), so certification is not consulted on that path. Accepted Decision 3 names F0024 among the three candidate value changes.

The stale identity is fenced by the separate AOL act, which blocks final effective-view assembly. Nothing was repaired or reconciled.

## 20. Environment and final-stage containment

The builder and CVK are byte-identical, the environment-safety scan of the fresh projection is clean, and `build_successor_view` ran in memory only. This act performed none of: Environment assignment or ranking, HEDC, Rule Freeze, 905/18 replay, Pair, ECS, friction, or scenario/integration-risk scoring.

```text
POST_CORR5_THREE_LOCI_RULE_USED = NO   ENVIRONMENT_MATH_CHANGED = NO
FINAL_EFFECTIVE_VIEW_ASSEMBLED = NO    FINAL_REGRESSION_EXECUTED = NO
```

## 21. Git metadata anomaly

**Independent inspection (read-only).**

**The file now.** `.git/logs/refs/remotes/origin/HEAD` is 313178 B, SHA-256 `99ad0254…`, equal to the author's "after". Its first 312840 bytes hash to `b39bf409…`, which is exactly the author's "before". **The change is therefore strictly append-only.** The 338 appended bytes are two entries, `2567223… 2567223… remote set-head`, timestamped 18:29:30 and 19:00:00 UTC.

**The cause.** The reflog holds 1852 `remote set-head` entries plus the clone entry. All set-head entries have oldOID = newOID. They recur at a ~30.5-minute cadence from 2026-08-19 (the clone) to now: 38 entries on 2026-10-07 alone, at 00:11, 00:41, … 18:29 and 19:00. `FETCH_HEAD` was rewritten at 18:59:59.

- The two CORR10-window entries are instances of a **recurring background fetch / `remote set-head` process**. That process predates and is independent of CORR10. Its actor is not determinable from the record.
- The author's AGENT_GIT_MUTATION = NO is consistent with this evidence.

**Semantic Git state.**

| Item | Result |
|---|---|
| HEAD_CHANGED | NO (`2567223…`) |
| REF_TARGET_CHANGED | NO. `refs/heads/main` and `refs/remotes/origin/main` → `2567223…`; `origin/HEAD` is still the symref `refs/remotes/origin/main`. `refs/heads/main` and `packed-refs` were last modified 2026-10-02. |
| INDEX_CHANGED | NO (last modified 2026-10-02 09:44 UTC) |
| TRACKED_CONTENT_CHANGED | NO (empty diff) |
| STAGED_CONTENT_CHANGED | NO (empty cached diff) |
| SEMANTIC_GIT_STATE_CHANGED | **NO** |
| Auditor Git mutation | NO. All 164 `.git` metadata files were byte-identical between my pre-audit and mid-audit snapshots. The final check is in the MANIFEST. |

```text
GIT_METADATA_ANOMALY = NON_BLOCKING_GIT_METADATA
classification = NON_BLOCKING_GIT_METADATA_ADVISORY (CORR10-IV1-A01)
```

The reflog was not restored or rewritten.

## 22. Current-candidate criticality assessment

Each link of the four-link FAIL chain was tested on existing authoritative or frozen evidence.

| Link | Evidence | Established? |
|---|---|---|
| Exact CORR10 code | builder `4fabec82…`, CVK `7d80a640…` (byte-identical to CORR9) | yes, bound |
| Authoritative / currently reachable input | frozen view `a1fcae68…`, registry `cb08b51e…`, source map `665aac81…`, sidecar `84ab83d2…`, physical Stage-1 packages | exercised |
| Materially wrong output or critical runtime/provenance failure | none. 6/6 SECTION_I outcomes equal accepted text; 36/36 PI-3 decisions equal independent derivation; 973/973 and 56/56 synthetic cells equal frozen derivation; environment scan clean; inputs unmutated | **NOT established** |
| Release-blocking consequence | none, because no wrong output exists | **NOT established** |

```text
CURRENT_EXACT_CANDIDATE_DEFECT = NO
CRITICAL_CURRENT_DEFECT = NO
PREPRODUCTION_RELEASE_BLOCKING = NO
```

**Quality-gate hard-fail scan** (skill §8).

- **CORR10 (author):** no HF-01..HF-12.
  - Scope was 8 files.
  - It made no methodology choice.
  - The BLOCKED status was reported honestly.
  - The "FINAL_AUTHOR_CLOSED" claims are labelled author-state, and independent closure is disclaimed.
  - The new expectations agree with my independent derivation.
- **This audit:** no HF.
  - It is non-author.
  - It used an independent oracle (frozen-text derivation plus a fresh physical sweep) rather than validator-as-authority.
  - It made no source writes and no Git mutation.
  - Its claim is limited to component scope.

## 23. Residual hypothetical / advisory ledger

| ID | Severity | Item | Disposition |
|---|---|---|---|
| CORR10-IV1-A01 | ADVISORY | origin/HEAD reflog same-OID appends from a recurring background `remote set-head` process (§21). No semantic Git change. Any act longer than ~30 min under a strict "Git metadata unchanged" criterion will observe it. | NON_BLOCKING_GIT_METADATA_ADVISORY |
| CORR10-IV1-A02 | ADVISORY (carried CORR9-IV1-02) | Builder W-3 versus `classify_row`: relation metadata on a NON_ANALYTICAL row. Fail-closed (HOLD-U where Layer B gives DIRECT); reading-dependent; pre-existing. | POST_RELEASE_WATCH |
| CORR10-IV1-A03 | ADVISORY (carried CORR9-IV1-04) | K-level hold code not frozen; stale CORR6/CORR7 module labels (cosmetic); reading-dependent shapes; synthetic-authority seam (synthetic registries carry the accepted registry identity label; the CORR10 4-fact world adds `CORR10-FOUR-FACT-AUTHOR-ONLY`, scratch-only); two PI-3 omission readings. | POST_RELEASE_WATCH |
| CORR10-IV1-A04 | ADVISORY | Mutation adequacy beyond the six author equivalents is not claimed. No new mutation search was run (Owner rule). The exact production candidate is correct on every exercised shape. | POST_RELEASE_WATCH |

Each carries:

```text
REAL_PRODUCTION_EVIDENCE = NO   PREPRODUCTION_BLOCKING = NO
```

**Closure ledger under the Owner's controlling threshold** (historical verdicts unchanged):

| Finding | Status | Basis |
|---|---|---|
| CORR9-IV1-01 (MAJOR) | **CLOSED** (Owner pre-production threshold) | 5 cells added and executing (40/40); the 6 known survivor shapes are killed by author equivalents; production correct |
| CORR8-IV1-01, CORR7-IV1-02, CORR6-IV1-01, CORR5-IV1-04 (validation-adequacy class) | **CLOSED** (Owner pre-production threshold) | 73/73 killed; residual hypothetical breadth is POST_RELEASE_WATCH (A04) |
| FX6 generalized | **CLOSED** | C10-G1b killed, including frozen-registry witnesses |
| CORR9-IV1-03 (closure overstatement) | **RESOLVED** | CORR10 labels its closure author-state only and disclaims independent closure |
| CORR9-IV1-02, CORR9-IV1-04 | carried as A02, A03 | ADVISORY / POST_RELEASE_WATCH |

## 24. Post-release watchlist

Each item becomes actionable only on real live-production evidence from real requests or executions.

1. **Non-mapped rows** (A02). Real coder output where a NON_ANALYTICAL or UNMAPPED row carries `relation` metadata on a subject's fact. Watch for over-holding (HOLD-U).
2. **Malformed coder output** (A03). Real coder output that is malformed at the K level, which holds every subject HOLD-U before S2. Watch for the hold code reported.
3. **The five cells, live** (A04). On real executions, compare production with Layer B for:
   - COUNTER_M records with declarations on fact ≥ 3, or with W(f) broken by W-1/W-3/W-4;
   - DE-4 records with EV-2/EV-3/EV-4 failures;
   - SELECTED alternatives that carry both SUPPORTS_LEAF and COUNTER_M records;
   - mixed UNRESOLVED / NO_CO vectors on large Cmp sets.
4. **PI-3 omission shapes** (A03). Real identity objects that omit optional locator or assertion members.
5. **Synthetic-authority seam** (A03). Confirm the production path never receives a `SyntheticTestAuthority`. `_package_certified_text` accepts only the two authority classes; the production default is `ProductionPackageAuthority`.
6. **Background Git process** (A01). Identify the periodic `remote set-head` process before any act that applies a strict Git-metadata-unchanged criterion.

## 25. Correction-stage terminal disposition

```text
CORRECTION_STAGE_TERMINATED = YES
CORR11_AUTHORIZED = NO
```

The CORR1..CORR10 implementation-correction chain ends here. CORR10 is independently verified under the Owner's pre-production threshold. No correction remains open in this chain.

## 26. Exact next-state recommendation

**State.**

- STAGE2_SUPPORTCLASS_EVALUABILITY_SEMANTIC_SEPARATION_1.IMPLEMENTATION-1, as CORR10, is an **independently verified component candidate** (INDEPENDENTLY_VERIFIED = YES, component scope, Owner pre-production threshold).
- `OWNER_ACCEPTED = NO` and `GIT_CLOSED = NO`, until separately decided.

**What remains the Owner's to control.** These are separate decisions or separate later workstreams. None is authorized by this PASS, and none is a correction act.

1. Owner acceptance or rejection of the CORR10 candidate.
2. Any Git closure, separately authorized.
3. The AOL F0024 provenance act, required before final effective-view assembly.
4. A-E001 adjudication, as a separately authorized act.
5. Final effective-view assembly and the Final Stage-2 Measurement Regression, as later workstreams.

**Not done in this act:**

- no repair, CORR11 or acceptance;
- no AOL reconciliation;
- no A-E001 adjudication;
- no final view or Final Regression;
- no HEDC or Environment work;
- no new mutation family;
- no Git mutation, commit, push or deploy.

STOP.
