# A_E001_BEARING_DIRECTIONALITY_READJUDICATION_1 — REPORT

- **Act:** A_E001_BEARING_DIRECTIONALITY_READJUDICATION_1
- **Actor / role:** Claude (Opus 5.5) · ANALYST (Owner-assigned; `AGENTS_A.md`)
- **Date:** 2026-10-07
- **Repository:** `MergeVue-M&A (August 2026)` · `main` · HEAD = origin/main = `fcbcf86fbaafe7711caf4ab76d0c8d852f243d5a`
- **Diffs:** tracked diff EMPTY · staged diff EMPTY · no Git mutation
- **Write set:** this directory only
- **Scope:** the BEARING axis of A-E001. Scope and establishment are frozen and were not reopened.

```text
STATUS            = READJUDICATED_SELF_VALIDATED
SUCCESSOR_TRIPLE  = [EVALUABLE, null, NON_DISCRIMINATING]
DECIDING RULE     = SEP-B-1b (prohibited-criterion cap; Class A; §F.3 PR rule) — PR-STJSTP "one hard rule"
T(r) / W(f)       = NOT_REQUIRED (B-1b decides at S6 before B-3; first rule that fires decides)
HOLD_CODE         = null
```

---

## 1. Role, independence, authorship

ANALYST mode. This is author self-validation only, not an independent verification.

Claude authored:

- the SupportClass/Evaluability Separation methodology candidates whose rules are applied here;
- FINAL_MEASUREMENT_REGRESSION_1_CORRECTION_1 (the source of the frozen PARTIAL/[c2]/UNRESOLVED_FAIL_CLOSED values);
- A_E001_SCOPE_DISPOSITION_READJUDICATION_1;
- this act.

The combined A-E001 disposition must therefore be verified by a non-Claude AUDITOR before Owner acceptance or materialization. The Owner has already stated this.

## 2. Prior-work check (brief §9)

| Searched | Result |
|---|---|
| Every JSON/JSONL/MD under `WORKBENCH/DOWNLOADS` naming `directionalityTrace` or `selectionCensusWitness` together with `A-E001` or `C-B04` | Routing statements only. Each says HOLD-T or "no trace / no witness exists": CORR1 §17, the CORR1 census, the migration contract `hardStopCase`, CORR10 `A_E001_BOUNDARY`. None is a trace or a witness. |
| Files named `*TRACE*` / `*WITNESS*` (non-fixture) | None |
| SYN-PC2 positive control (accepted candidate §8) | Synthetic brake-design text, not A-E001; it is a format template only |
| Historical rerun records `A-RERUN1-CORR1:C-B04:*` (CORR1 census) | A different coder output from the controlling view. They carry no T(r) and no W(f), and are not used. |

```text
PREEXISTING_A_E001_DIRECTIONALITY_TRACE = NONE
PREEXISTING_A_E001_WITNESS              = NONE
```

## 3. Controlling inputs (hashes in the manifest)

| Input | Identity | Used for |
|---|---|---|
| Accepted separation candidate (Owner-accepted choices) | `2f595ab5…` | §7.1 SEP-U, §10 state machine, l.511 |
| Separation CORR1 (incorporated by reference) | `02505e92…` | §6.5 W(f), §6.6 T(r), §6.7 AV, §9.1–§9.4 (B-1a, **B-1b**, B-2, B-3), §9.6 |
| Implementation methodology successor | `c5b2bdf0…` | S0–S8, EV_INPUT_SIGNATURE, SEP-MIG |
| Bound CORR10 builder (production machinery; `9b1545e`) | `4fabec82…` | in-memory replay (§8) |
| Controlling Stage-2 methodology / registry | `cb08b51e…` (PD3-CLAR-1.CORR1 text; SEP-NACR-V bound) | TT-STJSTP-PW row, TT-STJSTP-PR, §C.0, D-06 dispatch, §D M rows, §F.3 l.1157 |
| E9 card 07 STJ/STP (Owner-accepted) | `8d246f0a…` (= `14_SHA256SUMS.txt`) | §4, **§12** |
| Frozen A-E001 record, measurement successor | `3737bd5d…` line 115 | inputs as frozen by the Owner |
| Predecessor controlling view | `a1fcae68…` | legacy record and recorded entailmentBasis |
| Stage-1 certified fact register | `268ee581…` | C-B04 certified proposition |

## 4. Step A — admission and evaluability (confirmed, not altered)

The frozen record (`3737bd5d…` l.115) has the following EV inputs:

- sourceQualityState COMPETENT; ambiguity null; abstention null;
- relevanceState ANALYTICAL_MAPPED; treeTargetIds [TT-STJSTP-PW]; M = M-ENFORCE-SANCTION;
- componentSupply [c1]; relation SUPPORTS_LEAF; evidenceForm DE-1.

| Check | Result | Basis |
|---|---|---|
| EV-0 applicability | applicable | ANALYTICAL_MAPPED; TT in treeTargetIds |
| AV-1 / AV-2 | pass | edgeState PARTIAL (not ND, not AMBIGUOUS); ambiguity null |
| AV-3 | pass | abstention null; M-ENFORCE-SANCTION carries no NACR clause (NACR-1 is only on M-RES-ASYMMETRIC-RETENTION c3); registry `cb08b51e…` is covered by SEP-NACR-V |
| AV-6 | pass | no NACR declaration |
| PART | c1 SUPPLIED · c2 ORDINARY_MISSING_ASSESSABLE | componentSupply vs §D l.966 |
| EV-1 | pass | COMPETENT |
| EV-2 | pass | no competing M-ids |
| EV-3 | pass | no NON_ASSESSABLE component |
| EV-4 | pass | TT-STJSTP-PW: verdict EXACT, docStatus DOCUMENTARY_COMPLETE_CANDIDATE, mechExpr consumes M-ENFORCE-SANCTION. The D-06 route has no open C-3 condition: C-4 already executed the CI-1 repair, removing the stray M-ENFORCE-SANCTION line from the D-04 dispatch block. |

**`bearingEvaluability = EVALUABLE`, `bearingIndeterminacyReasons = null`.** This is identical to the CORR10 ledger and to the replay in §8. It is unaffected by edgeState (SEP-I-10).

## 5. B-1a — DE-4 cap

`evidenceForm = DE-1`, so **NOT_FIRED**.

## 6. B-1b — prohibited-criterion cap: **FIRED**

### 6.1 Rule

- **SEP-B-1b** (Class A; CORR1 §9.2): "If the edge's only basis is a criterion listed in the TT row's `prohib` → `NON_DISCRIMINATING`."
- **Source rule** (`cb08b51e…` §F.3 l.1157): "an edge whose only basis is a listed prohibited criterion is NON_DISCRIMINATING and cannot be SUPPORTED; the block is per-proposition."
- CORR1 §12 classes B-1b as an "existing PR-basis judgment (A)". It is applied here as a recorded, contestable judgment.

### 6.2 The TT row's prohibited criteria

- TT-STJSTP-PW row (`cb08b51e…` l.531ff): `prohib: PR-STJSTP`.
- PR-STJSTP is the TT-STJSTP-PR row (`cb08b51e…` l.572–575), anchored to E9/07 §12, §14. The Owner-accepted card's §12 text ("What must NOT be used as a criterion") reads: do not classify from **one competitive act, one hard rule**, a criminal example, the words "weak"/"unfair", or an asserted fairness violation. Actor type, physical force and a specific institution are not necessary.

### 6.3 Basis inventory of A-E001 (exhaustive)

| Basis element | Content | Counts toward bearing? |
|---|---|---|
| Facts | exactly one: C-B04 | — |
| Supplied components | exactly one: c1 "declared sanction rule/regime for defection" | YES (E(r), CORR1 §9.1) |
| c2 | MISSING (frozen) | NO. "Missing and non-assessable components contribute nothing." c2 is not adjudicated or inferred. |
| Other facts, counter or conflict facts, bridge facts | none (`counterevidenceFactIds = []`, `conflictFactIds = []`, `scopeBridgeFactIds = []`) | — |

The content of b(c1) is drawn from the certified proposition: "LH program management established a rule that anyone pointing a finger of blame at a fellow team member would be called in front of the entire team and publicly embarrassed, and members who did not conform were asked to leave." The coder's legacy entailmentBasis for c1 (in `a1fcae68`; it sits in the REG-007 ledger in `3737bd5d`) is "Removal of non-conforming team members satisfies sanction enforcement definition."

### 6.4 Match

1. **It is a rule.** The basis is a single rule with an attached sanction: blame-pointing is met with public embarrassment, and non-conformance with being asked to leave.
2. **It is hard.** E9/07 §5 places strict rules and punishment for defection at the core of the STJ/STP outward form. A rule enforced by public humiliation and exclusion is a hard (strict, punitive) rule in exactly that sense. The prohibition exists to stop such a rule from classifying the Environment on its own.
3. **It is one.** The edge carries one fact, and that fact states one rule. No second rule, no regime-level record, no demonstrated-strength or resource-control content, and no other supplying fact exists. This count is taken from the evidentiary basis, not from organizational scope. Scope is not used (brief §7).
4. **It is the only basis.** Per §6.3, nothing else bears.

**Reading invariance.** The cap fires under both available readings of b(c1):

- (a) the rule-declaration reading, from the certified proposition;
- (b) the coder's recorded removal reading.

In both, the content is one hard rule (its declaration, or its enforcement against non-conformers). Nothing outside that single rule is supplied. No c2 judgment is needed to reach this, and none is made.

### 6.5 Why this is not a shortcut or an over-reach

- **The cap does not empty the mechanism.** M-ENFORCE-SANCTION's registry row requires "a declared sanction regime with operative enforcement capacity". Its own explicitNonMeaning excludes "a written code only (FORMAL_ONLY fails)". A record whose basis is a sanction regime, or a rule plus an independent operative-capacity record, is not "only one hard rule", and B-1b would not fire there. The cap removes only a single-rule basis, which is exactly what the Owner-accepted card forbids as a classifier.
- **It is not a counter.** B-1b yields NON_DISCRIMINATING, never DIRECT_CONTRADICTION. It does not negate the STJ/STP leaf, does not make the leaf FALSE, and creates no NEG(M).
- **It is per-proposition** (l.1157):
  - the factual observation stays valid and ANALYTICAL_MAPPED (`LOCAL_EVIDENCE_VALID = YES`);
  - edgeState, components, leaf value, sufficiencyExpressionResult and targetState are untouched (SEP-I-9);
  - characteristicity, temporal, plan and formal-operative states are not read.
- **It is not target-seeking.** The first lawful rule decides (CORR1 §9.2/§9.3). B-1b precedes B-3, so where it fires, B-3, T(r), W(f) and SEP-U are not reached. If B-1b had not fired, the record would have gone to B-3 and needed a full T(r), plus W(f) if DIRECTIONAL. This act does not adjudicate that counterfactual route.

### 6.6 Recorded B-1b input

The bound builder implements B-1b as `b1b_cap_fires(record) = bool(record.get("prOnlyBasis"))` (l.1319). The decision JSON records the exact `prOnlyBasis` value a later, separately authorized materialization must carry:

```json
{"ttId":"TT-STJSTP-PW","prohibId":"PR-STJSTP","criterion":"one hard rule",
 "authority":"E9/07 §12 (OWNER-CORR2-STJSTP); cb08b51e §F.3 l.1157; SEP-B-1b",
 "basisFactIds":["C-B04"],"basisComponents":["c1"],
 "adjudicatedBy":"A_E001_BEARING_DIRECTIONALITY_READJUDICATION_1"}
```

## 7. B-2, B-3, W(f), SEP-U

| Step | Status | Why |
|---|---|---|
| B-2 | not reached | relation SUPPORTS_LEAF; first rule fired at B-1b |
| B-3 / T(r) | **NOT_REQUIRED** | capped records do not reach B-3. AV-4 holds only when "the record needs SEP-B-3" (CORR1 §6.7), so HOLD-T is lifted. |
| W(f) | **NOT_REQUIRED** | S7 applies to DIRECTIONAL SUPPORTS_LEAF records only |
| SEP-U | not reached | `uniquenessBasis = null` |

The comparator universe was recomputed independently from `cb08b51e…`: 74 Ms, each with a single Environment, and Cmp(M-ENFORCE-SANCTION) = {M-RULE-EXEMPT-UPPER, M-INSIDER-OUTSIDER-RULE-ASYMMETRY}. This equals the census table. It is recorded for the auditor only; no trace was built on it.

## 8. Machinery replay (self-validation; in memory, no repository write)

The bound CORR10 builder was copied byte-identically (`4fabec82…`) to an external scratch directory and imported with bytecode writing disabled. The workbench digest was identical before and after (`a8c68dee…`). The harness source and output are embedded in the decision JSON.

| View record | As frozen | With recorded `prOnlyBasis` |
|---|---|---|
| `a1fcae68` predecessor | HELD · HOLD-T ("T(r) absent for (A-E001, TT-STJSTP-PW)") · EVALUABLE · bearing null | ADMITTED · EVALUABLE · **NON_DISCRIMINATING** · capFired B-1b · no hold |
| `3737bd5d` measurement successor | identical HOLD-T | identical NON_DISCRIMINATING |
| migration_classify | SEP-MIG-6c RE_ADJUDICATION | **SEP-MIG-6a**, successorTriple `[EVALUABLE, null, NON_DISCRIMINATING]`, holdCode null |

**Disclosure on the migration label.** The machinery labels the result `MECHANICAL_VALUE_CHANGE` under SEP-MIG-6a. Mechanical here means *given the recorded PR-basis input*. That input is this act's B-1b judgment. Any ledger therefore has to cite this act as the source of `prOnlyBasis`.

## 9. Scope and establishment firewall

```text
ENTERPRISE_SCOPE_ESTABLISHED = NO
SCOPE_BRIDGE_STATE           = UNRESOLVED_FAIL_CLOSED
NO_UPWARD_PROMOTION          = YES
```

NON_DISCRIMINATING is the bearing state of this one record under the successor calculus. Specifically:

- It is not a statement about the Chrysler enterprise.
- It is not evidence against STJ/STP.
- It is not a judgment that the LH evidence is false or irrelevant.

The scope disposition (FAIL CLOSED AT CLAIMED SCOPE), edgeState PARTIAL and leaf OPEN are unchanged. The local LH-program-team observation remains available to any future, separately authorized scoped-domain work (`FUTURE_MULTISCALE_RELEVANCE = PRESERVED_NOT_EXECUTED`).

## 10. Limitations, dependencies, observations

- **D-1 (conditional input).** The B-1b basis inventory rests on the frozen partition supplied [c1] / missing [c2]. If a later, separately authorized act adjudicates c2 as SUPPLIED, the bearing inputs change and the bearing must be recomputed. Whether B-1b would still fire then is **not adjudicated here** (see scope act OOS-1).
- **D-2 (judgment).** The B-1b match is a recorded semantic judgment (CORR1 §12: "existing PR-basis judgment (A)"), open to dual coding and IV. It is the load-bearing point for the auditor.
- **ADV-1 (machinery observation; not this act's defect).** `b1b_cap_fires` tests only the truthiness of `prOnlyBasis`. It does not check that the named PR belongs to the TT row's `prohib`. Any truthy value caps. This is a post-release watch item for the materializer or validator, not acted on.
- **No `TRACE.json`.** No T(r) was constructed, so none is written. No W(f) was required.

## 11. Required final fields

```text
ACT                         = A_E001_BEARING_DIRECTIONALITY_READJUDICATION_1
ROLE                        = ANALYST
STATUS                      = READJUDICATED_SELF_VALIDATED
EDGE                        = A-E001
BEARING_EVALUABILITY        = EVALUABLE
B1B_CAP                     = FIRED
T_R_STATUS                  = NOT_REQUIRED
T_R_IDENTITY                = null
W_F_REQUIRED                = NO
W_F_STATUS                  = NOT_REQUIRED
W_F_IDENTITY                = null
SUPPORT_BEARING             = NON_DISCRIMINATING
UNIQUENESS_BASIS            = null
HOLD_CODE                   = null
SUCCESSOR_TRIPLE            = [EVALUABLE, null, NON_DISCRIMINATING]
A_E001_BEARING_ADJUDICATED  = YES
A_E001_SCOPE_ADJUDICATED    = YES
A_E001_ADJUDICATED          = YES (author-level; not independently verified; not Owner-accepted)
REQUIRES_READJUDICATION     = NO (conditional on D-1: recompute only if the c2 partition is later changed by an authorized act)
ENTERPRISE_SCOPE_ESTABLISHED = NO
SCOPE_BRIDGE_STATE          = UNRESOLVED_FAIL_CLOSED
NO_UPWARD_PROMOTION         = YES
METHODOLOGY_CHANGED         = NO
ENVIRONMENT_CHANGED         = NO
F0024_CHANGED               = NO
FINAL_EFFECTIVE_VIEW_ASSEMBLED = NO
FINAL_REGRESSION_EXECUTED   = NO
INDEPENDENTLY_VERIFIED      = NO
OWNER_ACCEPTED              = NO
GIT_MUTATION                = NO
COMMIT                      = NONE
PUSH                        = NONE
```

## 12. Author self-check (self-validation only)

| Check | Result |
|---|---|
| No scope reopening | PASS: scope fields read only to restate the firewall; "one" counted from the evidentiary basis, not from scope |
| No c2 inference | PASS: c2 contributes nothing; the cap holds under both b(c1) readings without any c2 judgment |
| No temporal / characteristicity / plan / formal-operative repair | PASS: none read or changed |
| No prohibited-criterion shortcut unless proven | PASS: exhaustive basis inventory (§6.3) and element-by-element match (§6.4) against the verbatim E9/07 §12 criterion; adversarial non-over-reach analysis (§6.5) |
| T(r) complete if required | N/A: not required (capped before B-3) |
| W(f) complete if required | N/A: not required (no DIRECTIONAL record) |
| No unresolved alternative promoted to SHARED | PASS: SEP-U not reached |
| No incomplete W promoted to DIRECT | PASS: no DIRECT emitted |
| No Environment inference | PASS |
| No enterprise promotion | PASS |
| Machinery agrees | PASS: replay through the bound builder gives the identical triple for both views |
| Repository untouched outside this directory | PASS: tracked and staged diffs empty; workbench digest unchanged across the replay |

STOP.
