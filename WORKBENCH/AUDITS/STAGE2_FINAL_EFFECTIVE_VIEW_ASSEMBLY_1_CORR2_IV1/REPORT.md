# FEVA CORR2 independent verification

ACT=STAGE2_FINAL_EFFECTIVE_VIEW_ASSEMBLY_1.CORR2.IV1
ROLE=INDEPENDENT AUDITOR — Codex
VERDICT=PASS
BLOCKING=0
MAJOR=0
MINOR=0
ADVISORY=2
M01=CLOSED
M02=CLOSED
TERMINAL_STATE=READY_FOR_OWNER_DECISION

The exact candidate closes both preceding MAJOR findings. Independent source derivation, the full 116-record census, two separate executions, and 47 independent negative controls establish the bounded correction. The two advisories concern package evidence/reproduction bookkeeping, not incorrect analytical output. No unresolved finding prevents use of these exact records within the authorized assembly scope.

## 1. Role, independence and authority

Current explicit Owner instruction appoints this chat as an independent auditor and authorizes isolated reproduction plus three new audit files. No CORR2 implementation or load-bearing judgment was authored by this auditor. CORR2 is attributed to Z.ai; upstream Codex-authored artifacts and prior Codex audit reports belong to other chats and are fixed inputs, not this auditor's work. Recovering the original IV1 report does not create a new verification layer or authorize a correction.

Read AGENTS.md and AGENTS_A.md in full; read MergeVue Causality Proof and Agent Control, Git Worktree Closure Governance, and the relevant independent-verification portions of `skills/mergevue-agent-quality-gate/SKILL.md`. The skill's hard-fail scan and independent oracle were applied; no acceptance authority comes from it.

Checked 22 governance sidecars against physical bytes and HEAD blobs, with last binding commits recorded. All pass. Checked the nine CORR4 reconstruction bound artifacts against the closure inventory and commit `9b57f0cb567d5a36e4ebcf3292cdbd18439f4faa`; all pass. No later controlling Control Tree version was located. The original Control Tree v2.1 remains the governance layer; bound CORR4 reconstruction is a current-state reference, not new methodology. Its B17.4 wider acceptance-attestation limitation is preserved. The current Owner task explicitly designates the precise contracts and corrective decisions as accepted inputs for this bounded verification; no wider acceptance is inferred from filenames, workbench placement, Git binding or agent claims.

Method/control inputs inspected: Stage-2 semantic successor CORR4 `2de49862…`; PD3-CLAR-1.CORR1 registry `cb08b51e…`; frozen coder schema `0cb5a6b5…`; PI-7 `3eee72d0…`; separation CORR1 `02505e92…` and accepted successor `2f595ab5…`; CORR10 builder/model `4fabec82…` / `433a8bf3…`; F0024 patch, source map, PI-3 and current physical factual file; A-E001 scope/bearing decisions; prior continuation REPORT, IDENTITY_CHECKS and REPRODUCTION_RESULTS. Complete paths, byte counts, hashes and comparisons are in IDENTITY_CHECKS.json. All five CORR2 pins, 17 file inputs of CORR1, and 11 sourceClass-closure pins pass current independent hashing.

Evidence classes: current task = Owner authorization; bound governance = governance fact; designated frozen rules = methodology fact; hashes/diff/execution = source/runtime fact; author reports/tests = agent claims; advisory consequences = bounded inference. PASS is independent verification, not Owner acceptance or Git authorization.

## 2. Repository and physical candidate identity

Physical root: `/Users/entp_psyche/Desktop/InvestProjects2026/MergeVue PayProduct (june 2026)/MergeVue-M&A (August 2026)`. Branch `main`; HEAD and cached origin/main are `9b57f0cb567d5a36e4ebcf3292cdbd18439f4faa`. No tracked or staged changes before/after. Live `git ls-remote origin refs/heads/main` failed with DNS resolution error for github.com; cached origin/main is not live remote evidence. No fetch, checkout, reset, commit, push, rebase, index write or ref-modification command was issued.

Candidate package: `/Users/entp_psyche/Desktop/InvestProjects2026/MergeVue PayProduct (june 2026)/MergeVue-M&A (August 2026)/WORKBENCH/DOWNLOADS/STAGE2_FINAL_EFFECTIVE_VIEW_ASSEMBLY_1_CORR2_2026-10-08`.

RECORDS SHA-256: **`5b37071a5fa5374c77b149bfde5c230c228cdf73d9785e5ea55346f9fab28daa`** — **116 records, 104,722 bytes**, ASCII JSONL, LF terminated. Matches manifest and supplied prefix/suffix. The missing digest characters were computed from physical bytes, not reconstructed from an abbreviation.

Predecessor: `/Users/entp_psyche/Desktop/InvestProjects2026/MergeVue PayProduct (june 2026)/MergeVue-M&A (August 2026)/WORKBENCH/DOWNLOADS/STAGE2_FINAL_EFFECTIVE_VIEW_ASSEMBLY_1_CORR1_2026-10-07/STAGE2_FINAL_EFFECTIVE_VIEW_ASSEMBLY_1_CORR1_RECORDS.jsonl` — **116 records, 104,704 bytes**, SHA-256 **`3603c3169d7bdd67763ac0d2468d08cbb508d23dfeece4f7b396900b11dc68ec`**. Expected full predecessor pin matches.

Seven actual package members inventoried, including the two auxiliary author-side artifacts:

| Member (exact basename under package path above) | Bytes | Physical SHA-256 | Binding |
|---|---:|---|---|
| STAGE2_FINAL_EFFECTIVE_VIEW_ASSEMBLY_1_CORR2_BUILD.py | 47542 | `a34aaddbc4d4f66b970c6c9bc9e1d4668889e17d92b0566060d5576dc4e34a8d` | MATCH |
| STAGE2_FINAL_EFFECTIVE_VIEW_ASSEMBLY_1_CORR2_DELTA_PROVENANCE.json | 7840 | `e8c4e6274fc624908718724f30324ae3187d88f1bf5038b711d9a5c3febf5b9e` | MATCH |
| STAGE2_FINAL_EFFECTIVE_VIEW_ASSEMBLY_1_CORR2_MANIFEST.json | 6048 | `e8b0e1c024e9da8a446950e20eebcb9dddc2402273c1da9817b995973b51a20e` | current external hash; no manifest pin |
| STAGE2_FINAL_EFFECTIVE_VIEW_ASSEMBLY_1_CORR2_RECORDS.jsonl | 104722 | `5b37071a5fa5374c77b149bfde5c230c228cdf73d9785e5ea55346f9fab28daa` | MATCH |
| STAGE2_FINAL_EFFECTIVE_VIEW_ASSEMBLY_1_CORR2_REPORT.md | 7914 | `00fac47a73bf16c823d925d0adfdc2ddbb2233035cffe505865df43a0dc22859` | MATCH |
| STAGE2_FINAL_EFFECTIVE_VIEW_ASSEMBLY_1_CORR2_TESTS.py | 14940 | `d105868a1754ab3d3e535531d465dabc67d795cc42f90ff617341e7a852928b4` | TEST_RESULTS observation; current external hash |
| STAGE2_FINAL_EFFECTIVE_VIEW_ASSEMBLY_1_CORR2_TEST_RESULTS.json | 22630 | `0f11109cec813b689e4ee5e9fc453fe95f7a4441a6829983659f6e813daccfb8` | current external hash; no manifest pin |

The manifest's four core output pins match. Its self-hash is externally anchored by this audit; no circular self-hash is expected. TESTS.py matches TEST_RESULTS' recorded test-source digest, but that observation is author evidence. TEST_RESULTS itself had no supplied terminal pin and is not accepted as independent proof. A01 records the overbroad blanket pinning statement.

No authenticated author terminal timestamp or complete terminal inventory is available; change-after-terminal cannot be proven or disproven for every member. This is explicitly recorded per member. Physical mtimes put MANIFEST and TEST_RESULTS shortly after REPORT's file mtime, consistent with publication order, but file mtime is not a terminal-report timestamp. All core advertised identities match and every original package member remains unchanged during this audit.

## 3. Full presence-aware and type-strict delta

Exactly **4 modified records / 6 field-value changes / 112 unchanged records**. Record identities are unique 116/116 before and after: recordType + cellIndex for 110 cell records; recordType + edgeId for six SECTION_I records. The entire ordered identity list is identical. Every unchanged record, including its LF, is byte-identical. No added/removed keys, null substitutions, type changes or unauthorized analytical differences occur in CORR2.

| Line | Field | CORR1 | CORR2 |
|---:|---|---|---|
| 113 | discriminatorIds | [D-01] | [D-04] |
| 114 | discriminatorIds | [D-01] | [D-04] |
| 115 | discriminatorIds | [D-02] | [D-06] |
| 116 | discriminatorIds | [D-06] | [D-07] |
| 115 | sourceClass | PERIODICAL_PRINT_ARCHIVE | OUTSIDE_FROZEN_VOCABULARY |
| 116 | sourceClass | FORM_10K | OUTSIDE_FROZEN_VOCABULARY |

An independent oracle parsed the bounded §D registry table and PI-7 supplying identities without any author diff/derive/assembly function, then serialized only differing records. Its complete bytes equal the physical candidate, digest `5b37071a5fa5374c77b149bfde5c230c228cdf73d9785e5ea55346f9fab28daa`. The task's replacement table was a later cross-check, not the source of the six values. All six CORR2 provenance changes also match independently presence/type-derived old/new values.

## 4. CONT1-M01 — CLOSED

Registry §C.0 C-1 makes each M's §D D-field authoritative; C-2 requires exactly the union of selected M-row D-sets; §C navigation, sample strata and TT display fields cannot override it. C-4 expressly fixes M-ENFORCE-SANCTION to D-06. One authoritative §D row was found for every involved mechanism; CORR4's corresponding rows agree. The independent bounded table parser extracted 66 mechanism rows; presentation rows are outside the applicable six-record surface and no global registry completeness claim is made from that count.

| Line | Selected mechanism | Independently required D | PI-7 state | Exact required sourceClass |
|---:|---|---|---|---|
| 111 | M-RES-ROLE-CONTROLLED-ACCESS | D-07 | OUTSIDE_FROZEN_VOCABULARY | OUTSIDE_FROZEN_VOCABULARY |
| 112 | M-RES-ROLE-CONTROLLED-ACCESS | D-07 | ASSIGNED | compensation plans |
| 113 | M-RECOGNISED-COMMAND-ORDER | D-04 | ASSIGNED | access-rights/role matrices |
| 114 | M-RECOGNISED-COMMAND-ORDER | D-04 | ASSIGNED | access-rights/role matrices |
| 115 | M-ENFORCE-SANCTION | D-06 | OUTSIDE_FROZEN_VOCABULARY | OUTSIDE_FROZEN_VOCABULARY |
| 116 | M-RES-CAPABILITY-ADVANTAGE | D-07 | OUTSIDE_FROZEN_VOCABULARY | OUTSIDE_FROZEN_VOCABULARY |

The builder derives every applicable §I record from mechanismPropositionIds and checks persisted values after serialization. It does not read a sample-label input. A synthetic helper check of a repeated multi-mechanism list yields deduplicated [D-04,D-06,D-07], independently expected from the frozen rows; no historical record was recoded. Missing, identical duplicate and conflicting M rows are independently rejected. An injected wrong serialized D value reaches `POST_CONFORMANCE_D` and blocks publication: this is semantic checking, not only a generic out-of-scope gate.

## 5. CONT1-M02 — CLOSED

Frozen schema `sourceClassBindingRule` requires copying exact PI-7 sectionIFill: ASSIGNED sourceClass, otherwise the fail-closed state verbatim. Its R-FORM/R-EVID and R-COUNT PRE-5 prohibit genre substitution, promotion to ASSIGNED and source-diversity contribution by non-ASSIGNED records.

All six §I records independently matched exactly one authoritative PI-7 record on the full **caseId + sideId + factId + sourceRefIndex + sourceId** identity. All matches are BOUND/RESOLVED. PI-7 contains 32 supplying bindings; the complete applicable §I surface is six records. Records 113/114 lawfully share the same supplying record while retaining different edge/TT identities.

Line115 uses CASE-3.5/CHRYSLER/C-B04/0/C33-S01, SCA-001. Line116 uses exxon-mobil/MOBIL/F-M-0205/0/S-M1, SCA-021. Both require OUTSIDE_FROZEN_VOCABULARY, not documentary genre. Four other §I values match their frozen bindings. SourceRefs/documentary identity and negative-evidence fields are preserved; sourceClass corrections neither fabricate evidence nor supply srcDiv. No source-diversity aggregate was executed. Wrong case, side, fact, reference index, source ID, duplicate/missing binding, unbound and unresolved identity are independently rejected. Injected serialized sourceClass promotion reaches `POST_CONFORMANCE_SC` before publication.

## 6. Reproduction and actual causal boundary

Two separate fresh Python subprocesses loaded a byte-identical copy of BUILD.py. Only input-root and output-directory locations were configured: the actual repository remains the read-only input root and each scratch directory is the publisher. Original main, derivation, full census, regression, postconditions, author controls, fsync/replace publisher and output reread verification execute. Passive observers count calls; an audit hook denies execution-time writes outside the scratch run and denies spawned commands. No canonical BUILD bytes or input file was modified.

Both runs return 0. **All five core members, including the copied BUILD and the generated RECORDS/DELTA/REPORT/MANIFEST, match the physical candidate byte-for-byte**. All generated outputs also match between runs. RECORDS identity is 116 / 104,722 / `5b37071a5fa5374c77b149bfde5c230c228cdf73d9785e5ea55346f9fab28daa` in both. CORR2 has no historical Git HEAD gate and performs no Git read; no historical envelope or HEAD replay was used.

Observed analytical/control reads are the five declared pins. One additional runtime read is the historical failed-v1 RECORDS fixture used by NC-J: **104,937 bytes / `ea0de2f072f0b13f15d36ff053ef047128de15b529d31cefeb1a3337462f6f0a`**. Its exact physical identity is independently reconciled with the original report/task and predecessor binding and rechecked unchanged. A02 records that it is omitted from CORR2's input inventory and not pinned in BUILD.PINS. The build therefore is not hermetic over only the declared five inputs. Differential probes establish that the fixture affects test diagnostics/manifest metadata, not analytical values; its absence or replacement by the valid baseline blocks publication. No unexplained analytical or Git-state dependency was observed.

Component success chain: main → exact pinned authorities → derived D/sourceClass → closed authorized delta → regressions → persisted-value postconditions → publisher → complete reread-verified outputs. Component failure chain: required input or semantic gate failure → exception → publisher not called → zero new output files. No product consumer, production wiring, deployment, HEDC or Environment determination is claimed.

## 7. Preservation and legacy findings

F01 remains CLOSED: no record carries both supportClass and supportBearing. F02 remains CLOSED: no top-level ledger-only keys occur in any of 116 records and no embedded forbidden ledger keys occur in any of the six successor §I records. Direct original regression gates independently reject reintroduced dual support and ledger keys.

F0024 line112 is byte-identical including LF: `8362573a67c08ab44c41f60b9a1cef40289dfd5e200744186fcef4d953db441d`. Full factualPackageIdentity equals the accepted patch correctedValue; physical fact file retains 61,728 bytes / `88b20920149b3fcde03e4e060cf4361e9494fe0137540bbc654c526337fd5f10` / 50 facts and the record-level case_id locator. Source-map and PI-3 identities remain frozen. This is correction preservation, not fresh acceptance of the prior certification act.

A-E001 retains all fields other than the two authorized metadata values. Exact accepted prOnlyBasis matches the bearing decision; scope decision preserves observedScope=unit, claimedScope=enterprise, UNRESOLVED_FAIL_CLOSED, no bridge, c1 SUPPLIED / c2 ORDINARY_MISSING_ASSESSABLE, PARTIAL and OPEN. Independent read-only CORR10 replay of CORR1 and CORR2 gives identical ADMITTED / EVALUABLE / null indeterminacy reasons / NON_DISCRIMINATING / B-1b / null hold and SEP-MIG-6a. B-1a does not fire; B-3 is not needed. The original record without accepted prOnlyBasis reproduces HOLD-T. No c2 adjudication, scope promotion or new negative evidence was made. CORR10's already disclosed truthiness advisory is carried, not re-adjudicated.

The original final IV1 report was not found as a standalone file in the repository, accessible external Workbench, Downloads or attachments. However, its exact final response was recovered through Codex `read_thread` from **“Audit Stage-2 view assembly”**, thread `01a118b1-b5b6-7142-a93c-e0c690cdccdb`, turn `01a118b1-caa3-7f23-9c0b-e9a78494a7ca`. Recovered report text SHA-256: `ca9782c0b97d503c1b8ccc0ab82301f7097d690d25523a75a9453ecdc80d39fa`. The recovered UTF-8 text and provenance are preserved inline in REPRODUCTION_RESULTS.json; this is source report recovery, not a secondary summary.

The prior continuation's F03/F04 dispositions remain historically EVIDENCE_INSUFFICIENT and its artifacts are unchanged. With the newly recovered original wording, the current audit independently establishes:

- **F03 CLOSED:** the original defect was absence encoded as unqualified null. All 13 CORR1 changed-field declarations and six CORR2 declarations match physical old/new presence and values. Added bearingIndeterminacyReasons is ABSENT → PRESENT-null; removed supportClass is PRESENT → ABSENT. No holdCode is embedded in the successor record. The original requirement is now known and tested.
- **F04 CLOSED for its original core-output identity requirement:** CORR1 pins all five other core members and its external manifest digest matches the previously explicit full pin. CORR2 pins all four other mandatory core members; independent hashing anchors its manifest. The separately exempt auxiliary author files are covered by new advisory A01, not silently promoted to verified test evidence.

The 110 legacy cell records remain byte-identical and are not wholesale converted to successor records under BC-1/BC-2. Ordinary missingness remains distinct from inability to assess and negative evidence. Existing uncertainty/non-determinability and abstention fields remain unchanged. No historical measurement-regression verdict is inferred from this audit.

## 8. Independent adversarial results

**47 independent controls** executed fresh main paths, with original publishers available and write guards active. All failed before publication; publisher calls and new output files both equal zero. These are observed execution consequences, not harness assertion success alone.

Physical fixture mutations exercise untouched pin guards. Semantic authority injections occur only after trusted source reads to exercise missing/ambiguous registry and PI-7 guards; they are not substituted for physical pin testing. Serializer injections exercise the original full census and persisted-value postconditions. Regression-boundary injections execute the original F01/F02/A-E001 preservation checks. Full inputs, layers, actual exception details, tracebacks, call counts, read/write traces and harness sources are retained.

| Observed failure code | Controls | Published outputs |
|---|---:|---:|
| `AE001_BEARING_ALTERED` | 1 | 0 |
| `AE001_EVALUABILITY_ALTERED` | 1 | 0 |
| `AE001_PRONLY_ALTERED` | 1 | 0 |
| `AE001_SCOPE_ALTERED` | 1 | 0 |
| `CHANGE_CENSUS_MISMATCH` | 4 | 0 |
| `F01_DUAL_SUPPORT` | 1 | 0 |
| `F02_LEDGER_KEY_ON_RECORD` | 1 | 0 |
| `MECHANISM_NOT_IN_REGISTRY` | 1 | 0 |
| `PI7_DUPLICATE_IDENTITY` | 1 | 0 |
| `PI7_IDENTITY_UNRESOLVED` | 1 | 0 |
| `PI7_NOT_BOUND` | 1 | 0 |
| `PI7_NO_MATCH` | 6 | 0 |
| `PIN_BYTES_MISMATCH` | 11 | 0 |
| `PIN_MISSING` | 5 | 0 |
| `PIN_SHA_MISMATCH` | 6 | 0 |
| `POST_CONFORMANCE_D` | 1 | 0 |
| `POST_CONFORMANCE_SC` | 1 | 0 |
| `RECORD_COUNT` | 1 | 0 |
| `REGISTRY_ROW_CONFLICT` | 1 | 0 |
| `REGISTRY_ROW_DUPLICATE` | 1 | 0 |

Coverage includes every declared source missing/stale byte/stale digest, baseline record loss/duplication/reordering, unauthorized edits, incorrect D, registry row absence/ambiguity, all five PI-7 identity dimensions, duplicate/missing match, incorrect sourceClass promotion, dual support, ledger keys, fabricated affirmative absence and bearing/scope/basis alteration. The three additional historical-fixture differential probes are separately recorded as runtime-limit evidence; one lawfully publishes unchanged analytical records with changed test diagnostics and is not counted as a rejected negative control.

## 9. Findings and limits

**A01 — ADVISORY:** auxiliary TESTS/TEST_RESULTS are explicitly unpinned; blanket “every other member” statements are overbroad. Consequence: author test evidence lacks the core binding, but independently captured exact identities and independent tests protect this audit. Recommendation: future bounded packaging should identify all auxiliary evidence by external digest and make the blanket statement precise. No correction was made or authorized.

**A02 — ADVISORY:** required historical NC-J fixture is omitted from declared input pins. Consequence: full package reproduction requires that separately identified fixture; diagnostics can change without changes to analytical output. Recommendation: a future authorized packaging act should declare/pin the fixture or create a controlled in-memory stale input. The current audit explicitly pins and preserves the actual sixth fixture for its reproduction. No analytical-value substitution or invalid candidate output was observed.

Neither advisory prevents use of this exact corrected candidate in its bounded scope. No BLOCKING, MAJOR or MINOR substantive finding remains.

Limits: live remote unavailable; exact author terminal-time file history not independently provable; Python 3.9/stdlib and local filesystem behavior are execution context; per-file atomic publication is not a proven all-member transaction; no OS-write-failure or concurrent-input TOCTOU claim; no final Stage-2 Measurement Regression, HEDC, Environment determination, production wiring, release or deployment. Broader documentary/acceptance residuals in the reconstruction are preserved.

## 10. Repository mutation safety and deliverables

All **1037 pre-captured tracked/source/workbench evidence files** rehash unchanged, including all CORR1/CORR2 members and previous audits. HEAD, branch, cached remote and index bytes are unchanged; tracked and staged diffs remain empty. No non-Codex-managed ref changes occurred. Raw reference delta is in IDENTITY_CHECKS.json; desktop-managed refs/codex checkpoint changes, if any, are not auditor Git operations and are not restored or claimed globally immutable.

Only `/Users/entp_psyche/Desktop/InvestProjects2026/MergeVue PayProduct (june 2026)/MergeVue-M&A (August 2026)/WORKBENCH/AUDITS/STAGE2_FINAL_EFFECTIVE_VIEW_ASSEMBLY_1_CORR2_IV1/REPORT.md`, `IDENTITY_CHECKS.json` and `REPRODUCTION_RESULTS.json` are written in the repository. Isolated copies, fixtures and harnesses are outside it in `/private/tmp/mergevue_corr2_iv1_eyucm3ro`; complete necessary harness sources and recovered report are retained inline in the requested JSON so no additional project deliverable is needed. One supplemental harness naming error shadowed Python's inspect module; it was corrected in scratch and rerun successfully, with the diagnostic disclosed separately from candidate results.

External output SHA-256 values are issued after writing; no circular self-hash is embedded. Audit ends here.

**PASS — READY_FOR_OWNER_DECISION.** No Owner acceptance, correction authorization, Git closure or next act is declared.
