# AOL_F0024_RECONCILIATION_1.IV1 — Independent Read-Only Audit

```text
ACT:                                   AOL_F0024_RECONCILIATION_1.IV1
ACTOR:                                 CLAUDE 4.6 (Owner designation; runtime model claude-opus-5-5)
ROLE:                                  AUDITOR
VERDICT:                               PASS
INDEPENDENCE:                          PASS
BLOCKING:                              0
CRITICAL:                              0
MAJOR:                                 0
MINOR:                                 0
ADVISORY:                              3
CANDIDATE_IDENTITY:                    PASS
IDENTITY_ONLY_SCOPE:                   PASS
POSITIVE_SEMANTIC_EQUIVALENCE:         PASS
FOUR_FIELD_PATCH_SURFACE:              PASS
PI3_F0024:                             PASS
FALSE_CERTIFICATION:                   NO
STALE_IDENTITY_ACCEPTED:               NO
CURRENT_AUTHORITY_RESOLVED:            YES
STAGE2_SEMANTIC_PROJECTION_UNCHANGED:  YES
A_E001_CHANGED:                        NO
CORR10_CHANGED:                        NO
ENVIRONMENT_CHANGED:                   NO
CURRENT_EXACT_CANDIDATE_DEFECT:        NO
CRITICAL_CURRENT_DEFECT:               NO
PREPRODUCTION_RELEASE_BLOCKING:        NO
AOL_F0024_RECONCILIATION_INDEPENDENTLY_VERIFIED: YES
OWNER_ACCEPTED:                        NO
GIT_CLOSED:                            NO
FINAL_EFFECTIVE_VIEW_ASSEMBLED:        NO
FINAL_REGRESSION_EXECUTED:             NO
GIT_MUTATION:                          NO
COMMIT:                                NONE
PUSH:                                  NONE
```

## 1. Role, mode, independence

- **Role:** Owner-assigned AUDITOR under `AGENTS.md` and `AGENTS_A.md`.
- **Mode:** independent read-only audit. The fail threshold is the Owner pre-production rule.

**Authorship.** None of the audited material is Claude-authored.
- The candidate was authored by CODEX (CODEX SOL).
- The predecessor view `a1fcae68…` (Effective View Assembly CORR1) and the prior F0024 identity correction `0711b742…` were authored by Z-Ai.
- CORR10 was authored by CODEX.

**Disclosed adjacency.**
- Claude authored the SupportClass/Evaluability SEPARATION_1 methodology candidates. Those define the SEP-MIG / B-1a rules that CORR10 implements.
- Claude performed CORR6.IV1, which first recorded the stale line-112 carrier, and CORR10.IV1.
- None of these is the audited act. The audit-critical dimensions are identity-only scope, F0024 equivalence, the four-field surface and PI-3 fail-closed behaviour, and none of them depends on those rules being correct. The Stage-2 check is a before/after invariance test through unchanged functions.
- Independence is therefore PASS.

## 2. Candidate identity and baseline (verified first)

**Candidate files.** All four candidate SHA-256 values equal the Owner-pinned values:

| File | SHA-256 |
| --- | --- |
| REPORT | `189edc9c…2019` |
| MANIFEST | `4ae6d08a…91ec` |
| COMPARISON | `3b6cbd10…c4e4` |
| PATCH | `bf5d832f…b828` |

**Repository baseline.**
- Root is the expected path; branch is `main`.
- HEAD and `origin/main` are both `9b1545e1fd85bd6cbbd6c76728e871d68ac33cbf`.
- Tracked diff is empty; staged diff is empty.
- The candidate directory is untracked.

## 3. Method

The auditor wrote a fresh harness at `/private/tmp/aolf0024iv1/h/audit.py` (SHA `61f96f13…`). It ran under an audit-hook write, network and exec guard (`guard.py`, SHA `f6640107…`) scoped to `/private/tmp/aolf0024iv1/run`.
- The guard blocked 0 attempts.
- The unchanged CORR10 builder was imported read-only.
- An **auditor-written consumer** of the persisted patch contract applied the exact saved PATCH bytes to the pinned predecessor in memory.
- The author's comparison values were used only as a check target, never as an oracle.
- Result: 57/57 independent checks pass. Evidence is in `run/audit.json` (SHA `0afc0b55…`).

## 4. Target and stale identity

**Predecessor `a1fcae68…`.**
- 104310 bytes; 116 records.
- It has a single trailing newline and no interior blank lines, so the JSONL line number equals the record ordinal.
- The selector (SECTION_I_RECORD, edgeId `A-EXEC1:F0024:M-RES-ROLE-CONTROLLED-ACCESS:TT-STPSTJ-RS`, aol-time-warner, AOL, F0024, M-RES-ROLE-CONTROLLED-ACCESS, TT-STPSTJ-RS) matches exactly one record, at **line 112**.
- The view contains exactly two F0024 identity carriers:
  - line 51 (execution cell): already `88b20920…`;
  - line 112 (SECTION_I): stale.
- The stale SHA occurs only on line 112.

**Stale values present on line 112:**
- `recordFileBytes` 139589;
- `recordFileSha256` `4b686b24…`;
- `packageFactCount` 105;
- `caseIdLocator` "package-level key 'case_id'".

**Rejection by the unchanged CORR10.** `ProductionPackageAuthority.resolve()` and `.certify()` both return None for the stale identity, so `STALE_IDENTITY_ACCEPTED = NO`. The file at the asserted path is 61728 bytes / `88b20920…`, so the stale values are not physically realised there.

## 5. Current authority (independently reconstructed)

**Source map.** `STAGE2_CORR4_PILOT_STAGE1_SOURCE_MAP.json` (`665aac81…`) has exactly one aol-time-warner entry (ordinal 4). It gives:
- 61728 bytes;
- SHA `88b20920…`;
- factCount 50, sides AOL 25 / TIME_WARNER 25;
- caseIdLocator "record-level key 'case_id'".

**Physical bytes.**
- The physical 06_FACTS.json matches the map on bytes, SHA, fact count and side split.
- Every record-level case_id is "aol-time-warner".
- F0024 is unique at `facts[23]`, side AOL, source_ids [S0009].
- A top-level case_id is also present; the map selects the record-level locator.

**Derived 17-member identity.** Built from the map entry, it equals:
- the sidecar line 9 identity (`84ab83d2…`);
- the line-51 cell value;
- the prior correction `0711b742…` correctedValue;
- the PATCH correctedValue.

The prior correction's oldValue also equals the line-112 stale identity exactly. Therefore `CURRENT_AUTHORITY_RESOLVED = YES`.

## 6. Positive semantic equivalence (A–J)

| # | Check | Evidence | Result |
| --- | --- | --- | --- |
| A | PI-2 text = certified Stage-1 text | PI-2 `a87409c3…` is pinned inside coder view schema `0cb5a6b5…`. Its F0024 factText equals `facts[23].atomic_proposition` byte for byte (303 chars). | YES |
| B | linkageEvidence | The line-112 `componentSupply[0].linkageEvidence` (183 chars) is an exact prefix of that text and is unchanged after application. | YES |
| C | sourceRefs | Line-112 sourceRefs deep-equal sidecar F0024 sourceRefs and are unchanged after application. | YES |
| D | Registry → S0009 | Registry `bcc4576b…` matches. `records[8]` is S0009 (AOL DEF 14A, accession 0000950109-99-003477). Its record hash `df0f7caf…` reproduces under sorted-key compact JSON. | YES |
| E | Documentary bytes | The document is 123631 bytes / `1aee005d…`. That equals the registry sha256/byte_size and the PI-7 `underlyingDocumentIdentity` (`3eee72d0…`, single F0024 binding). | YES |
| F | Passage | Bytes [54871, 55863) hash to `59b174ec…`. They contain every proposition element (1992 Plan; unvested options fully vested; normal vesting date; one year after change in control; involuntary employment action). They sit after the Employment Contracts heading. The fact-level locator is unchanged. | YES |
| G | Identity | edgeId, caseId, side, factIds, M, TT, relation instance, organizational object and resource flow are unchanged. | YES |
| H | Temporal | temporalState PRE_T0_CONTINUITY_UNRESOLVED, continuityBridgeFactIds [], FORMAL_ONLY and ELIGIBILITY_ONLY are all unchanged. The source is dated 1999-09-24, before T0. | YES |
| I | Admissibility | 14 admissibility/evidence fields are unchanged. S0009 is ADMITTED_PRE_T0. Admission is ADMITTED before and after. | YES |
| J | Source class | "compensation plans" is unchanged and equals the PI-7 sectionIFill (ASSIGNED). | YES |

This gives EVIDENCE_CONTENT_EQUIVALENT = YES, FACT_ID_UNCHANGED = YES, TEMPORAL_MEANING_UNCHANGED = YES and ADMISSIBILITY_MEANING_UNCHANGED = YES. No 105-vs-50 whole-package equivalence is claimed or needed.

## 7. Four-field surface and patch contract

**Persisted contract.** The PATCH `applicationContract` carries every required field with the required value:
- requireInputViewSha256;
- requireExactlyOneSelectorMatch;
- requireExactOldValue;
- replaceOnly = factualPackageIdentity;
- noOtherFieldOrRecordChange;
- failureDisposition = HOLD;
- historicalArtifactsImmutable;
- requireCurrentAuthorityCertification = {F0024, aol-time-warner, AOL};
- requireAllOtherIdentityMembersUnchanged;
- requireUnchangedStage2SemanticProjection.

The PATCH also has:
- an inputViewIdentity that pins the predecessor (path, 104310 bytes, `a1fcae68…`);
- one correction record;
- authorityBinding = map `665aac81…` ordinal 4, sidecar `84ab83d2…` line 9.

**Independent application result.**
- 116 records.
- The only changed record is line 112.
- The only leaf diffs are `/factualPackageIdentity/{caseIdLocator, packageFactCount, recordFileBytes, recordFileSha256}`.
- The other 13 identity members are unchanged.

This gives **ALLOWED_IDENTITY_DIFF_COUNT = 4**, **SEMANTIC_FIELD_CHANGE_COUNT = 0** and **UNRELATED_RECORD_CHANGE_COUNT = 0**.

**Contract enforcement by the auditor consumer.** It held (HOLD) on all 16 controls:
- old-value mismatch;
- wrong-fact, wrong-edge, wrong-recordType and incomplete selectors;
- extra identity delta;
- changed predecessor bytes;
- duplicate correction;
- non-identity field target;
- current-authority failure;
- wrong case or side certification subject;
- each of the four single-field omissions.

## 8. PI-3 (unchanged CORR10 ProductionPackageAuthority)

**Stale vs corrected.**
- The stale identity is rejected.
- The corrected identity is certified as F0024 / aol-time-warner / AOL, digest `88b20920…`, authority `FROZEN_STAGE1_SOURCE_MAP:665aac81…`. The certified proposition equals PI-2.

**Rejected variants.** Each of these returns None:
- wrong case;
- wrong side;
- non-existent fact;
- wrong authority SHA;
- wrong authority name;
- extra delta on packageSideCount;
- extra delta on recordFile;
- unknown member;
- factTextKey locator override;
- type coercion (61728.0, "50");
- **all 14 old/new mixtures of the four fields.**

**Other-fact query.** A query for another lawful fact (F0023) under the same package identity returns F0023's own text, never F0024's. Fact binding in the patch is enforced by the selector and the certification subject.

**Result:** PI3_F0024 = PASS; FALSE_CERTIFICATION = NO.

## 9. Stage-2 projection (bounded, F0024 only)

Unchanged `evaluate` and `migration_classify` were run before and after the patch, with no `build_successor_view` and no broad replay. Both give:
- EVALUABLE / null / NON_DISCRIMINATING;
- cap B-1a (SEP-DE4);
- SEP-MIG-6a, MECHANICAL_VALUE_CHANGE;
- successorTriple [EVALUABLE, null, NON_DISCRIMINATING].

The before and after outputs are canonically identical and equal the candidate COMPARISON values. STAGE2_SEMANTIC_PROJECTION_UNCHANGED = YES. See Advisory A2 on what this equality does not prove.

## 10. A-E001, CORR10, Environment

**A-E001.**
- The A-E001 record (line 115) is canonically deep-equal after application.
- Its unchanged projection is SEP-MIG-6c, RE_ADJUDICATION, HOLD-T, [null, null, null], supportBearing null.
- REQUIRES_READJUDICATION = YES; A_E001_ADJUDICATED = NO; A_E001_CHANGED = NO.

**CORR10.**
- The builder is `4fabec82…` and the CVK `7d80a640…`. Both are pinned in the CORR10 manifest and their bytes are unchanged.
- CORR10 file mtimes are 15:39/16:01 and ctimes 16:03, all before the candidate (17:37–17:44).
- All 40 inputs declared in the candidate manifest still match bytes and hashes.
- CORR10_CHANGED = NO.

**Environment.**
- The PATCH contains no Environment, HEDC, Rule Freeze, Pair, ECS, friction or three-loci content; `assert_environment_safe(PATCH)` returns [].
- No Environment code path was executed.
- ENVIRONMENT_CHANGED = NO. See A3 for a benign key-name hit in COMPARISON.

**Write surface.**
- Since 17:30, the only new or changed files in the repository (excluding .git) and in the sibling WORKBENCH are the four candidate files plus a Finder `.DS_Store`.
- `git status -uall` shows 695 entries, which is the 691 pre-existing entries plus 4.

## 11. Findings

All three are ADVISORY. No current-candidate defect was found.

- **A1 — POST_RELEASE_WATCH.** Fail-closed application is a declarative contract; the author's consumer was inline and not persisted.
  - With certify instrumented, CORR10 Stage-2 evaluation made **0** PI-3 calls for this edge, because the B-1a cap fires first.
  - A future final-assembly consumer must therefore execute `requireCurrentAuthorityCertification` explicitly. Stage-2 will not catch a malformed identity on this edge implicitly.
  - Verify this when final assembly is authorized.
- **A2 — QA_BACKLOG.** For the same reason, before/after projection equality cannot discriminate identity correctness on this edge.
  - Identity correctness rests on the direct PI-3 certification, reproduced in §8.
  - Projection equality is a non-regression condition only.
- **A3 — QA_BACKLOG.** `assert_environment_safe(COMPARISON)` flags `.checksRun.environmentAssignment`.
  - Its value is `false`, a negative declaration.
  - No Environment content exists.

## 12. Limitations

- **Scope.** This is component scope only. No production or final-assembly entrypoint exists, and none was exercised.
- **Predecessor.** The predecessor remains stale at line 112 by design, and CORR10 rejects that stale value.
- **Preservation evidence.** The author's 952-file pre/post snapshot cannot be replayed retrospectively. Preservation was instead established by current hashes and pins, the timestamp sweep and the untracked count.

## 13. Interpretation and next step

PASS establishes only that AOL_F0024_RECONCILIATION_1 is independently verified. It does not establish:
- Owner acceptance;
- Git closure;
- final effective-view assembly;
- A-E001 closure;
- Final Stage-2 Measurement Regression;
- HEDC readiness.

The next governance step is the Owner acceptance decision. No Owner decision is required to complete this audit.

## 14. Write surface

- **Created (only):** the three files in `WORKBENCH/DOWNLOADS/AOL_F0024_RECONCILIATION_1_IV1_2026-10-07/`. The MANIFEST pins REPORT and FINDINGS; its own hash is given in the terminal response.
- **Scratch:** `/private/tmp/aolf0024iv1/` (outside the repository).
- **Not modified:** no candidate, predecessor, source, CORR10, methodology or Git state.
- **Not performed:** no stage, commit or push.
