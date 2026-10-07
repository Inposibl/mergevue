# A_E001_SCOPE_DISPOSITION_READJUDICATION_1 — REPORT

- **Act:** A_E001_SCOPE_DISPOSITION_READJUDICATION_1
- **Actor / role:** Claude (Opus 5.5) · ANALYST (Owner-assigned; `AGENTS_A.md`, ANALYST mode, read-only except the three outputs below)
- **Date:** 2026-10-07
- **Repository root:** `MergeVue-M&A (August 2026)` · branch `main` · HEAD = origin/main = `fcbcf86fbaafe7711caf4ab76d0c8d852f243d5a`
- **Tracked diff:** EMPTY · **Staged diff:** EMPTY (checked at start and before writing)
- **Write set:** this directory only. No Git mutation.

```text
OUTCOME                                   = A  (existing terminal state applies — on the SCOPE axis)
ANALYSIS_TERMINAL_STATE                   = PASS (controlling question answered from accepted authority)
OWNER_DECISION_REQUIRED                   = NO
DECISION_GAP (Outcome B)                  = DOES NOT EXIST
```

---

## 1. ROLE AND MODE

ANALYST mode. This act re-adjudicates A-E001 only, and only its organizational scope disposition under the current accepted Stage-2 methodology. It is not an independent verification of anything (`INDEPENDENTLY_VERIFIED = NO`).

**Authorship disclosure (AGENTS_A §3).**

- Claude authored the SupportClass/Evaluability Semantic Separation methodology candidate chain.
- Claude authored STAGE2_FINAL_MEASUREMENT_REGRESSION_1_CORRECTION_1, whose REG-004/REG-005 values are the "already established current facts" of this act.
- This act **applies** those authorities; it does not verify them.
- The load-bearing scope value (REG-005) was independently verified **PASS by Codex** (IV1 report `7fa1a133…`, line 124). That package's overall IV1 HOLD rests only on REG-007, which is unrelated to scope.
- The Owner accepted the four separation methodology choices. The implementation (CORR10, Codex-authored) is bound at `9b1545e`.

## 2. TASK / QUESTION

Can A-E001 receive a FINAL current-Stage-2 disposition when C-B04 is kept at its lawfully established scope rather than promoted to enterprise?

The act answers Q1–Q4 only. It assigns no Environment, activates no multiscale model, and performs no OD-MS-9.

## 3. EVIDENCE INSPECTED (by path; hashes in the manifest)

| Authority | Path | Resolved |
|---|---|---|
| Router / mandate | `AGENTS.md`, `AGENTS_A.md` | role, §5.4 locator, §14A frame |
| Status map | `docs/governance/MERGEVUE_CONTROL_TREE_v2.1_2026-09-04.md` (sha `360bafa2…` = `.sha256`) | CASE-3.4 v1.3: ✅ independently verified; ☑️ Owner adoption in practice |
| C34 | `docs/reference/root-definitional-v1.7/contract/CASE-3.4_CONTRACT_v1.3.md` (`dae81438…`) | §6 DE-1, §7.6, **§10 scope bridge**, §14, §17 |
| Stage-2 contract (Owner-accepted controlling) | `WORKBENCH/DOWNLOADS/STAGE2_SEMANTIC_SUCCESSOR_CANDIDATE_CORR3.md` (`04cbe47f…`) | identity pinned by the bound CORR4 header |
| Stage-2 contract (bound pilot dependency) | `WORKBENCH/DOWNLOADS/STAGE2_SEMANTIC_SUCCESSOR_CANDIDATE_CORR4.md` (`2de49862…`, commit `2567223`) | A.8 SC-CLAIM, §D M-ENFORCE-SANCTION, TT-STJSTP-PW, §E, §F.3, §F.5, G-9, H-3/H-7, S-2/S-R6 |
| Separation methodology (Owner-accepted choices) | `…SEPARATION_1_CORR2_CORR1_CORR1_CORR1_CORR1_CANDIDATE.md` (`2f595ab5…`) | l.511, §11, §14, §15 |
| Separation implementation methodology | `…IMPLEMENTATION_1_METHODOLOGY_SUCCESSOR.md` (`c5b2bdf0…`) | SEP-I-3/9/10/11, EV_INPUT_SIGNATURE, AV-4, B-3, S0–S8, MIG-6c, §8 |
| Migration contract | `…IMPLEMENTATION_1_MIGRATION_CONTRACT.json` (`8efcda94…`) | `hardStopCase` reasons |
| Bound CORR10 real-path ledger | `…CORR10_VALIDATION_REPORT.json` (`35ffcf54…`) | `A_E001_BOUNDARY.successorOutcome` |
| Controlling predecessor view | `STAGE2_EFFECTIVE_VIEW_ASSEMBLY_1_CORR1_RECORDS.jsonl` (`a1fcae68…`) | legacy A-E001 record |
| Measurement successor (candidate) | `STAGE2_EFFECTIVE_VIEW_MEASUREMENT_CORR1_RECORDS.jsonl` (`3737bd5d…`) + report + Codex IV1 | current PARTIAL / [c2] / UNRESOLVED_FAIL_CLOSED |
| Stage-1 sealed package | `Downloads/CASE-3.5_DAIMLER_CHRYSLER_BASELINE_v1.0.7_CANDIDATE/CERTIFIED_FACT_REGISTER.json` (`268ee581…`, the identity the view record pins) | C-B04 certified proposition, **scope**, contradictionState; C-B01, C-N09 |

Several inputs are untracked but identity-pinned by hashes inside bound artifacts: CORR3, the predecessor view, the accepted separation candidate and the fact register. Every hash was recomputed this session and matched.

## 4. SOURCE-OF-TRUTH CLASSIFICATION

- **OWNER-ACCEPTED FACT:**
  - this act's authorization and narrowing;
  - the four separation choices;
  - the frozen A-E001 facts in §4 of the brief.
- **METHOD FACT:**
  - C34 §10;
  - CORR3/CORR4 A.8, §E, §F.3, §F.5, G-9, S-2;
  - separation l.511, SEP-I-3/9/10/11, AV-4, MIG-6c.
- **SOURCE/RUNTIME FACT:**
  - the A-E001 record bytes;
  - the CORR10 ledger;
  - the C-B04 certified fields.
- **AGENT-REPORTED FACT:** Codex IV1 REG-004/REG-005 PASS.
- **INFERENCE:** the axis analysis in §5.4, which is derived from the method facts above and shown below.

## 5. FINDINGS

### 5.1 Q1 — What scope does C-B04 positively establish?

**LAWFULLY_ESTABLISHED_SCOPE = the LH program team only** (C34 §10 descriptive level: a single team/program; sub-unit, sub-enterprise).

The Stage-1 certified fact carries its own scope field, verbatim: `"scope": "LH program team ONLY"`. Its certified proposition is: "LH program management established a rule that anyone pointing a finger of blame at a fellow team member would be called in front of the entire team and publicly embarrassed, and members who did not conform were asked to leave." Source: LA Times, 26 Apr 1992, ¶18.

Stage-1 certification establishes the fact's truth (G-6). It is the narrowest authority on what the fact covers.

- **Recorded `observedScope = unit`.** This is frozen and is not modified. It is no broader than the evidence in the direction that matters here, because both unit and LH-program-team are below enterprise. The disposition is invariant to that difference.
- **The frozen paraphrase is broader than the certified fact.** The quoted evidence ("*Chrysler platform team members* … were asked to leave") is the coder's `linkageEvidence` paraphrase in `a1fcae68`. It generalizes "the LH crew" to platform-team members at large, and the certified text does not support that. Likewise `organizationalObjectRef = CHRYSLER:PLATFORM_TEAM_PROGRAM_MANAGEMENT` names a broader object than the certified one. Both are recorded as OOS-3 and not acted on.

### 5.2 Q2 — Which parts of M-ENFORCE-SANCTION are positively established at that scope?

Registry row (CORR4 §D l.841): *c1 declared sanction rule/regime for defection · c2 operative enforcement capacity evidenced by an applied instance or a competent record of operative enforcement demonstration.*

| Component | Recorded status | Positively established at LH-program-team scope for this act | Basis |
|---|---|---|---|
| c1 | SUPPLIED | **YES** | The certified proposition records a rule established by LH program management attaching a sanction (public embarrassment, then removal) to non-conformity. This is consistent with the recorded supply. |
| c2 | MISSING (REG-004) | **NO — not established for this act** | REG-004 is the complement of the *recorded* supply only. Codex IV1: "it does not judge actual fact entailment." The Owner's instruction "do not infer c2" holds. |

**Explicit preservation.**

- **c2 "missing" is not negative evidence.** It is a recorded-supply gap: GAP ≠ COUNTEREVIDENCE (§E); missing content is not negative (SEP-FW-3). No NEG(M) exists (absenceEvidenceState NONE).
- **The certified text contains applied-instance wording** ("A few red-faced examples later … the handful that didn't were asked to leave"). So the H-3 entailment of c2 is **UNADJUDICATED**, not negative.
- **Materiality gate.** Even with c2 supplied, the leaf stays OPEN on the scope conjunct and the temporal conjunct (§F.3). Bearing does not read `edgeState` (SEP-I-10). So the c2 question cannot change this act's disposition and is not put to the Owner (§14A GATE 4). It is recorded as OOS-1.

### 5.3 Q3 — Does any current accepted Stage-2 rule provide a lawful bridge to enterprise?

**No. `ENTERPRISE_SCOPE_ESTABLISHED = NO`, `LAWFUL_SCOPE_BRIDGE_FOUND = NO`.**

**C34 §10 bridge classes.** None is present:

- an enterprise rule shown to operate across the portfolio;
- documented adoption across units/programs;
- an enterprise standard plus implementation;
- repeated multi-unit evidence with an explicit common mechanism;
- another inspectable institutional mechanism governing the claimed level.

`scopeBridgeFactIds = []`.

**The only enterprise-level structural fact is the named unlawful bridge.** C-N09 ("design and development … organized into cross-functional product-development groups called platform teams") is exactly C34 §10's second named unlawful bridge: *"platform-team structure became standard → every behavioral mechanism observed in the original pilot became enterprise practice."* The first named unlawful bridge, *"one successful team → whole company"*, also matches.

**Adverse scope evidence must be retained (C34 §10).**

- C-B04 carries `contradictionState = SOURCE_EXPLICITLY_NOTES_EXCEPTIONAL_PILOT_TACTIC`.
- Its sibling C-B01 carries `PILOT_EXCEPTION_TO_CORPORATE_NORM_RECORDED`.

**No Stage-2 rule supplies a default bridge.**

- SC-CLAIM requires a lawful bridge.
- G-9 does not apply, because the statement is scoped, not generic.
- The separation successor contains no scope rule. Candidate l.511: "Join satisfaction, competence, scope and time are establishment matters that §F.3 owns."

**Prior multiscale diagnosis.** It was read as diagnostic history only and was not used as authority.

### 5.4 Q4 — Does the accepted methodology define a terminal state for this exact condition?

**YES — on the scope/establishment axis, with exact existing vocabulary.**

| Element | Exact accepted text | Authority |
|---|---|---|
| Field value | `scopeBridgeState = UNRESOLVED_FAIL_CLOSED`. Non-meaning: "UNRESOLVED ≠ counterevidence; the observation stays valid at observedScope." | CORR3/CORR4 §E (Class A; C34 §10) |
| Disposition | "No bridge → **FAIL CLOSED AT CLAIMED SCOPE**; the observation is kept at observedScope." | CORR3/CORR4 A.8 SC-CLAIM |
| Disposition (C34) | "If scope bridge remains unresolved: `FAIL CLOSED AT CLAIMED SCOPE`." | C34 §10 |
| Research label | `SCOPE_BRIDGE_UNRESOLVED` | C34 §17 |
| Leaf consequence | `leafTrue(M)` requires `scopeBridgeState∈{NOT_REQUIRED,BRIDGED}`. PARTIAL → E-R4 → leaf **OPEN** with missingComponents. Never FALSE. | §F.3, §F.5 E-R4 |
| Target consequence | eval OPEN, no notDeterminable leaf → `TARGET_NOT_ESTABLISHED_WITHIN_BOUND`. FW-4: "epistemic, never ontological". | §F.3, §E FW-4 |
| Worked analogue | "observedScope=team; enterprise claim UNRESOLVED_FAIL_CLOSED; team edge kept as adverse scope evidence" | CORR4 §S S-2 (also S-R6) |

This state is **terminal within the current evidence bound**:

- it is a closed-enum field value, not a hold;
- no rule routes it to re-adjudication;
- only a new, separately acquired bridge record could change it.

It is already materialized in the measurement successor `3737bd5d…` (REG-005), and Codex IV1 verified it PASS. It preserves:

```text
LOCAL_EVIDENCE_VALID          = YES   (C-B04 valid at LH-program-team scope; c1 supplied)
ENTERPRISE_SCOPE_ESTABLISHED  = NO
SCOPE_BRIDGE                  = NO
NO_UPWARD_PROMOTION           = YES   (§F.3 scope conjunct; O-1(b) bridged-scope coupling)
```

**The scope terminal state does not and cannot close the bearing hold.** This is the material narrowing of the brief's premise.

1. **Bearing does not read scope.**
   - Scope is absent from `EV_INPUT_SIGNATURE` (successor §4).
   - SEP-B-1a/1b/B-3/SEP-U read no scope field. B-2 reads matched scope only for *counter* records, and A-E001 is SUPPORTS_LEAF.
   - SEP-I-9 keeps §F.3 free of successor fields. Candidate l.511 assigns scope to §F.3 alone.
   - So a "scope-limited supportBearing" or an "enterprise supportBearing" does not exist in accepted methodology. Bearing is target-relative and scope-agnostic.
   - Upward promotion is blocked elsewhere: at establishment (§F.3) and at consumption (§2.3 / O-1(b): DIRECT/SHARED contribute to separation only when coupled to a witness at **bridged** claimed scope and T0 time).
2. **Null bearing has no scope meaning.**
   - SEP-I-3: for an EVALUABLE record, `supportBearing = null ⟺ UNIQUENESS_UNRESOLVED`.
   - SEP-FW-27: null on EVALUABLE does not imply NON_DISCRIMINATING.
   - The only other null meanings are INDETERMINATE and EV-0 inapplicability.
   - "Null because scope is unbridged" is not a lawful meaning, so it is not assigned (brief §7: "Do not invent a new meaning for null").
3. **HOLD-T is not caused by scope.**
   - CORR10's real-path ledger gives `admission HELD`, `bearingEvaluability EVALUABLE`, `failingGates []`, `capFired null`, `partition {c1: SUPPLIED, c2: ORDINARY_MISSING_ASSESSABLE}`, `holdCode HOLD-T`.
   - The migration contract's `hardStopCase` gives exactly three reasons, none of them scope: (i) the componentSupply/missingComponents inconsistency, (ii) no directionalityTrace T(r), (iii) no selectionCensusWitness W(f).
   - Reason (i) is resolved at the establishment layer by REG-004 (PARTIAL, [c2]; Codex PASS at recorded-supply scope).
   - Reasons (ii) and (iii) are untouched by any scope finding.
   - SEP-AV-4: needs B-3 and T(r) is absent → HOLD-T. SEP-I-11: a held record is not materializable. §4.5: holds are "correctable defect states, not field values".

### 5.5 Final current-Stage-2 disposition of A-E001

| Axis | Disposition | Terminal? |
|---|---|---|
| Scope | **FAIL CLOSED AT CLAIMED SCOPE**. `scopeBridgeState = UNRESOLVED_FAIL_CLOSED`; observation kept at observedScope (certified: LH program team only). | **YES — FINAL** |
| Establishment | edgeState PARTIAL (supplied [c1], missing [c2]); leaf M-ENFORCE-SANCTION OPEN (E-R4; scope and temporal conjuncts also fail); sufficiencyExpressionResult OPEN; no TARGET_SUPPORTED path for TT-STJSTP-PW (Chrysler, claimed enterprise) from this edge | YES for the current bound |
| Bearing | SEP-MIG-6c · RE_ADJUDICATION · HOLD-T · successorTriple `[null, null, null]` · supportBearing null (pre-hold EV: EVALUABLE, no failing gate). **Unchanged.** | **NO** — awaits T(r) (and W(f) iff DIRECTIONAL) |

```text
A_E001_SCOPE_DISPOSITION_ADJUDICATED = YES
A_E001_ADJUDICATED (whole edge)      = NO
REQUIRES_READJUDICATION              = YES — BEARING AXIS ONLY (T(r)/W(f)); NOT scope
```

**Infinite-loop check.** No re-adjudication loop exists. The scope axis is closed. The bearing axis has one finite, rule-defined exit through S6 → S7, in this order: B-1b prohibited-criterion cap; then B-3 T(r); then, only if DIRECTIONAL, W(f) and SEP-U. Every reachable output is materializable and terminal: NON_DISCRIMINATING, DIRECT_SUPPORT, SHARED_NON_UNIQUE, or UNIQUENESS_UNRESOLVED. None of them can promote scope (O-1(a),(b)).

## 6. METHODOLOGY ↔ RUNTIME DIVERGENCES

- **Canonical rule:** C34 §10 / SC-CLAIM fail closed at claimed scope.
- **Predecessor runtime record (`a1fcae68`):** `scopeBridgeState = NOT_REQUIRED` for unit → enterprise. This is invalid, as already established by the brief and REG-005.
- **Current successor candidate (`3737bd5d`):** `UNRESOLVED_FAIL_CLOSED`, which agrees with the canonical rule.
- **Bound CORR10 migration:** read the predecessor `a1fcae68`, but its A-E001 outcome (HOLD-T) does not depend on any scope field, so the divergence has no effect on the bearing projection.
- **Owner decision required:** NO.

## 7. VALIDATION PERFORMED

Read-only:

- hash recomputation of every input (manifest);
- JSON extraction of the A-E001 records, the C-B04/C-B01/C-N09 certified facts and the CORR10 `A_E001_BOUNDARY`;
- textual identity of the CORR3 and CORR4 scope rules (SC-CLAIM, §E scopeBridgeState row, S-2, the §F.3 scope conjunct, FW-4: identical, diff-checked);
- Git read-only: rev-parse, diff, diff --cached, log, show --stat.

Not performed: no validators, builders, assembly or regression were executed, and no external research was done.

## 8. LIMITATIONS / NOT DETERMINABLE

- The bearing value of A-E001 is **NOT DETERMINABLE FROM CURRENT EVIDENCE** without T(r) (and W(f)). This act does not produce them; the brief forbids inventing them.
- The measurement successor `3737bd5d` is a candidate. Its IV1 result is HOLD (REG-007, not scope) and it is not Owner-accepted. This act relies on its scope and supply values only because the Owner froze them as current, and Codex IV1 passed REG-004/REG-005.
- The CASE-3.4 v1.3 Owner acceptance is ☑️ "in practice" per the Control Tree; a separate physical acceptance record is not yet bound.

### Out-of-scope observations (recorded, not acted on — AGENTS.md §12)

| ID | Observation | Effect on this act |
|---|---|---|
| OOS-1 | The H-3 entailment of M-ENFORCE-SANCTION c2 by C-B04 has never been adjudicated. The certified text contains applied-instance wording. | None (scope and temporal gates block the leaf either way; EV/bearing ignore edgeState) |
| OOS-2 | `characteristicityState = CHARACTERISTIC` sits beside the Stage-1 annotation `SOURCE_EXPLICITLY_NOTES_EXCEPTIONAL_PILOT_TACTIC`. K-3 makes EXCEPTIONAL/EXPERIMENTAL blocking "when the source itself says so". This is establishment-side only (SEP-FW-5/6/20). | None (leaf already OPEN) |
| OOS-3 | `observedScope = unit`, the paraphrase "Chrysler platform team members" and `organizationalObjectRef = CHRYSLER:PLATFORM_TEAM_PROGRAM_MANAGEMENT` are each broader than the certified scope "LH program team ONLY". | None now. **Material for any future scoped-domain work:** the lawful domain is the LH program team, not platform teams at large. |
| OOS-4 | `temporalState = PRE_T0_CONTINUITY_UNRESOLVED` is an independent leaf blocker. | None |

## 9. RECOMMENDED NEXT ACTION (proposal only; §14A.5)

**Option: A_E001_BEARING_DIRECTIONALITY_READJUDICATION_1** — the smallest bounded act that can clear HOLD-T.

- **Inputs:** the frozen A-E001 record and the certified C-B04.
- **Procedure:** S6 in order. B-1b against TT-STJSTP-PW `prohib` PR-STJSTP; then the B-3 T(r) over Cmp⁺(r) (T-1..T-5); then, only if the record verdict is DIRECTIONAL, W(f) for C-B04 (74 Ms, W-1..W-4) and SEP-U.
- **Bounds:** no scope, establishment, c2, characteristicity or temporal change; no Environment.
- **Verification:** it requires a non-Claude IV if Claude authors it.
- **Why it matters:** SEP-I-11 bars materializing any successor view that contains A-E001 while HOLD-T stands. Final effective-view assembly therefore remains blocked by this hold regardless of the scope finding.
- **What it cannot change:** whatever bearing results, A-E001 contributes nothing to enterprise-level separation in the current bound (O-1(b): bridged scope and T0 time required).

The Owner controls whether, and when, that act is authorized.

## 10. OWNER DECISION REQUIRED

**NO.** The candidate Outcome-B gap is killed by GATE 1 (SOURCE): C34 §10, A.8 SC-CLAIM, the §E `UNRESOLVED_FAIL_CLOSED` row, §F.3 and S-2 already define the terminal disposition. The remaining HOLD-T is epistemic: it has a rule-defined exit (B-3/W/U), so it is not a normative choice. Authorizing the next act is ordinary Owner control of the next act, not a decision frame.

```text
OWNER DECISION FRAME — EVIDENCE LEDGER
ACT: establish the final current-Stage-2 scope disposition of A-E001 without promotion.
ROLE: ANALYST (Owner-assigned).
READ: see §3 (each path → what it resolved).
DERIVED: FAIL CLOSED AT CLAIMED SCOPE ← C34 §10 + A.8 SC-CLAIM + §E + scopeBridgeFactIds=[];
         leaf OPEN ← §F.3 scope/temporal conjuncts + E-R4; bearing unaffected ← l.511 + EV_INPUT_SIGNATURE + SEP-I-9/10.
INSPECTED: root / main / fcbcf86 = origin/main / tracked+staged diff empty / A-E001 records / C-B04 certified fields / CORR10 ledger.
ELIMINATED:
- "Does Stage-2 lack a terminal scope-limited state?" — killed by GATE 1 (SOURCE).
- "Should c2 be treated as supplied?" — killed by GATE 4 (MATERIALITY) and by the Owner's explicit instruction.
- "Is observedScope unit or team?" — killed by GATE 4 (both are below enterprise; disposition invariant).
- "Can null bearing mean scope-limited?" — killed by GATE 1 (SEP-I-3 / FW-27 forbid it).
- "Should HOLD-T be resolved now?" — killed by GATE 6 (NOW) and the act's narrowing; rule-defined exit exists.
UNRESOLVED AFTER SEARCH: none requiring the Owner.
```

## 11. STATUS FIELDS

```text
LOCAL_EVIDENCE_VALID                          = YES
LAWFULLY_ESTABLISHED_SCOPE                    = LH program team only (certified C-B04 scope; recorded observedScope = unit, unchanged)
REQUIRED_COMPONENTS                           = [c1, c2]
SUPPLIED_COMPONENTS                           = [c1]
MISSING_COMPONENTS                            = [c2]   (recorded-supply gap; entailment unadjudicated; not negative evidence)
CLAIMED_SCOPE                                 = enterprise
ENTERPRISE_SCOPE_ESTABLISHED                  = NO
LAWFUL_SCOPE_BRIDGE_FOUND                     = NO
CURRENT_METHODOLOGY_HAS_TERMINAL_SCOPE_LIMITED_STATE = YES (scope/establishment axis)
FINAL_CURRENT_STAGE2_DISPOSITION              = FAIL CLOSED AT CLAIMED SCOPE (scopeBridgeState = UNRESOLVED_FAIL_CLOSED; observation kept at observedScope; leaf OPEN)
BEARING_EVALUABILITY                          = EVALUABLE (pre-hold EV result) — materialized triple null under HOLD-T
SUPPORT_BEARING                               = null (HOLD-T; NOT a terminal null; NOT UNIQUENESS_UNRESOLVED)
A_E001_ADJUDICATED                            = NO (scope disposition: YES; bearing: NO)
REQUIRES_READJUDICATION                       = YES — bearing axis only (T(r); W(f) iff DIRECTIONAL)
OWNER_DECISION_REQUIRED                       = NO
FUTURE_MULTISCALE_RELEVANCE                   = PRESERVED_NOT_EXECUTED
METHODOLOGY_CHANGED                           = NO
ENVIRONMENT_CHANGED                           = NO
F0024_CHANGED                                 = NO
INDEPENDENTLY_VERIFIED                        = NO
GIT_MUTATION                                  = NO
```

STOP.
