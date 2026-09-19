# LEVEL1 MODE D — PROSPECTIVE_PUBLIC_FREE METHODOLOGY DELTA v0.2 CORR1

## 0. Status and authority boundary

```text
STATUS:
v0.2 CORR1 CANDIDATE

OWNER C/HYBRID COMPLETENESS ARCHITECTURE DECISION INCORPORATED
OWNER D1 FACTUAL-CEILING DECISION INCORPORATED

IV1:
PASS
BLOCKING 0
MAJOR 0
MINOR 4
ADVISORY 1

F-1 THROUGH F-4 CORRECTED

NOT INDEPENDENTLY VERIFIED AFTER CORR1
NOT OWNER-ACCEPTED AS COMPLETE METHODOLOGY ARTIFACT
NOT IMPLEMENTED
NOT PRODUCTION AUTHORITY

LINEAGE:
v0.1 / CORR1 / CORR2 / CORR3 are historical candidate lineage.
v0.2 is the independently verified architecture input to this correction.
C/HYBRID supersedes the prior global absence/completeness architecture.
```

This artifact is **not controlling**. It is an author candidate awaiting targeted independent verification and explicit Owner acceptance.

**Scope of CORR1.** This correction is bounded to the four MINOR documentation/precision findings raised by the independent IV1 of v0.2 (`F-1` … `F-4`, ledger at §0.4). The architecture is **not reopened**. The Owner C/HYBRID decision is **not changed**. No proposition semantics change except where a finding requires clarifying text. No SEC enumeration is performed, no reference-data instance is adopted, and nothing is implemented.

| Field | Value |
|---|---|
| Artifact | `LEVEL1_MODE_D_METHODOLOGY_DELTA_v0.2_CORR1_CANDIDATE` |
| Path | `docs/LEVEL1_MODE_D_METHODOLOGY_DELTA_v0.2_CORR1_CANDIDATE.md` |
| Version | `v0.2 CORR1` |
| Date | 2026-09-19 |
| Act | `LEVEL1-MODE-D-COMPLETENESS-SEMANTICS-DELTA-1.CORR1` |
| Mode | DOCUMENTATION-ONLY METHODOLOGY CORRECTION |
| Author role | Owner-appointed ANALYST (`AGENTS.md` §2; `AGENTS_A.md` §1). Not independent auditor, not implementer, not Git agent, not Owner |
| Repository baseline | `main` @ `26e2905b607db49246504950378b8e48cc3e96fe` |
| Corrected input | `docs/LEVEL1_MODE_D_METHODOLOGY_DELTA_v0.2_CANDIDATE.md`, SHA-256 `119a168fde75938d6be58961b2ab1f047ecf5fbaaebbbcc3ab33ed9cfcb9c8d4` — verified at authoring time. IV1 `PASS` (BLOCKING 0 / MAJOR 0 / MINOR 4 / ADVISORY 1). **Unmodified by this act** |
| Historical input | `docs/LEVEL1_MODE_D_METHODOLOGY_DELTA_v0.1_CORR3_CANDIDATE.md`, SHA-256 `c1904987907eabc1e04b3f7d4d60d8c32e004ed09d36139cbebbb8af3ad5f872` — verified at authoring time. **Historical input, not an accepted methodology artifact** |
| Upstream modified | **None.** v0.1, CORR1, CORR2, CORR3 and v0.2 are unmodified. No change to CASE-3.4, the Control Tree, the design corpus, Environment definitions, questionnaire semantics, ECS, resource mapping, friction logic, narrative authority, the public/private report boundary, product source, validators, tests, or Git |

**Standalone.** The active methodology is directly present in this document. A reader does not need to reconstruct active semantics from v0.1, CORR1, CORR2, CORR3 or v0.2. Historical lineage is summarised in §0.1 and §0.2 for provenance only; the CORR1 correction ledger is at §0.4.

### 0.1 Lineage — why the prior path was abandoned

| Version | Independent verification | Outcome |
|---|---|---|
| v0.1 | IV1 | **FAIL** — findings F-1 … F-6 |
| CORR1 | IV2 | **FAIL** — findings G-1 / G-2 / G-3 |
| CORR2 | IV3 | **FAIL** — findings V-1 … V-5 |
| CORR3 | IV4 | **FAIL** — 8 of 9 sampled issuers `PARTIAL`; a further false `OUT_OF_BOUND` (`ARS`) confirmed |

The failures were not independent defects. They were one structural defect appearing four times:

- **A.** Aggressive classification of unknown SEC form values as `OUT_OF_BOUND` produced false `OUT_OF_BOUND` findings and therefore risked **false absence**.
- **B.** Fail-closed treatment of unknown SEC form values as `UNMAPPED` made a global `COMPLETE_WITHIN_BOUND` practically unreachable.

Each correction traded one failure mode for the other. Neither could be eliminated while a **global closed-world completeness gate** was the authority for record-class absence.

An architecture preflight classified the root problem as: closed-enum modelling of an open external vocabulary; open-world / closed-world reasoning mismatch; non-monotonic propagation of unknown values; and reference-data / methodology boundary entanglement. That preflight is **not persisted in this repository**; its conclusion is recorded here as agent-reported analysis, and the controlling authority for this act is the Owner decision in §0.2, not the preflight.

### 0.2 Controlling Owner decision — C/HYBRID

```text
OWNER DECISION — C/HYBRID
SEPARATE POSITIVE EVIDENCE FROM ABSENCE AUTHORITY

"MODE D SHALL NOT EMIT AUTHORITATIVE RECORD-CLASS ABSENCE WITHOUT A PROVEN
 CLOSURE DOMAIN.

 P4 SHALL BECOME A NON-NEGATIVE NOT-ESTABLISHED STATE.

 COMPLETE_WITHIN_BOUND SHALL BE COVERAGE/PROVENANCE METADATA,
 NOT ABSENCE AUTHORITY."

STATUS: OWNER-ACCEPTED / CONTROLLING / CLOSED / NOT REOPENED
```

This decision is closed. This artifact implements it. It does not re-compare architecture options A / B / C, does not recommend reverting to global closed-world completeness, and proposes no further exhaustive SEC mapping campaign.

### 0.3 Root architectural change, in one statement

```text
BEFORE (v0.1 … CORR3)
  One axis carried both truths.
  Collection completeness was the gate that authorized record-class absence,
  so any coverage deficiency anywhere could contaminate every claim.

AFTER (v0.2, C/HYBRID)
  Two independent axes.
  PROPOSITION TRUTH is established positively, from competent evidence, and is
  monotonic against unrelated unknowns.
  COLLECTION COVERAGE is provenance metadata that describes how the collection
  executed and authorizes nothing about the world.
```

Mode D under v0.2 emits **zero authoritative record-class absence claims**. CORR1 does not change this.

### 0.4 CORR1 correction ledger

The independent IV1 of v0.2 returned `PASS` with `BLOCKING 0 / MAJOR 0 / MINOR 4 / ADVISORY 1`. IV1 independently found the architecture sound: Owner-decision fidelity `FAITHFUL`; P4, Case C, monotonicity and its limit, the bound suffix, axis separation, the `OOB` role, the negation firewall and `NOT_PUBLICLY_OBSERVABLE` all `SOUND`; the enum rename `NECESSARY`; coverage computation `SOUND_AS_METADATA`; reference-data authority `CLEAR`; the reference-data instance a `VALID_SEPARATE_DEPENDENCY`; the report contract `COMPATIBLE`; D1 `INTACT`; D2 `SAFELY_DEFERRED`; closure authority `ZERO_ACTIVE`; the validator specification `CAUSALLY_SUFFICIENT`; and the forced-failure set `COHERENT`.

**None of those verdicts is a correction target.** CORR1 corrects only the four MINOR documentation/precision defects below.

| ID | Old defect in v0.2 | Correction in CORR1 | Sections changed | Semantic change? |
|---|---|---|---|---|
| **F-1** | **P3 change disclosure incomplete.** §23.2 asserted that monotonicity was *"the only change to P3"*, §29 recorded P3 as `UNCHANGED` except that clarification, and §29.1 declared *"exactly three"* mechanical propagations while omitting P3 entirely. In fact P3 changed in three bounded ways (§15.4 itself records that the retired state was carried for P2, **P3** and P4), so the non-regression ledger was factually inaccurate | The three bounded P3 changes are now stated explicitly and attributed to the Owner C/HYBRID decision; the class-level not-established state is stated to be carried by P4; §29 and §29.1 are made factually accurate and the propagation count corrected from three to four | §23.2 · §29 (P3 row) · §29.1 | **NO — disclosure only.** P3's active meaning, states and monotonicity are byte-identical in effect to v0.2 |
| **F-2** | **Block 9 diligence-action boundary not carried / stale citation.** §22 Block 9 (`Recommended Actions` → `DILIGENCE ACTIONS ONLY`) cited *"§21 of this artifact"*, but §21 in v0.2 is *"No authoritative absence without a proven closure domain"*. The citation was stale, and the explicit diligence-action containment rule carried by CORR3 §21 was not fully carried into v0.2 | A narrowly scoped containment rule is restored as **§20.5**, sited with the Decision Gap derivation it governs; no section is renumbered. Block 9's authority citation now reads §20.5; `19` §48–§49 | §20.5 (new) · §22 (Block 9 row) · §27 (one fail-closed row) | **NO — restores containment and a correct citation.** No product semantics, report block, availability enum or recommendation scope changes |
| **F-3** | **Appendix E R10 overbroad.** R10 read *"its incompleteness affects coverage metadata only, never proposition truth"*. IV1 proved this too broad: where a real record satisfying RC3 is not recognized by the reference-data instance, the raw value becomes `UNMAPPED` and, absent any other RC3 record, RC3 is `NOT_ESTABLISHED` with `PARTIAL` coverage. Reference-data incompleteness therefore did affect what could be **established** | R10 now states the precise safe rule and distinguishes **world fact** from **methodology-established epistemic state**: incompleteness **MAY** reduce positive recall, leave a real fact `NOT_ESTABLISHED`, and produce `PARTIAL`; it **MUST NOT** retract an established positive proposition, create absence, create `OOB` or an RC by default, or silently change methodology authority or proposition semantics. A worked note (E.1) carries the scenario | Appendix E R10 · Appendix E.1 (new) · §24.3 (one consistency sentence) · §34 (one precision line) | **NO — precision only.** No execution semantics change; C11 and §24.3 already carried the correct `MUST NOT` list |
| **F-4** | **`SOURCE_UNAVAILABLE` rendering / P2–P3 behavior underspecified.** The architecture was safe (§16.4, §11A.2, FF-H) but the report-copy and per-proposition behavior under total source unavailability was not explicit. One lawful rendering — *"Not established from the public evidence this analysis examined"* — is false when no source was retrieved | The distinction between **source retrieved, no qualifying record established** and **source not retrieved** is made explicit (§16.4.1); P1–P4 behavior under total source unavailability is stated (§23.4.1); a lawful `SOURCE_UNAVAILABLE` report stanza is added and the retrieved-source copy is expressly conditioned (§22.2, §35); one validator is added (§31.1 #35) | §16.4.1 (new) · §22.2 · §23.4.1 (new) · §27 · §31.1 (#35 new) · §35 | **NO — source-unavailable behavior was already implied by §16.4, §11A.2 and FF-H; it is now explicit.** No new proposition state, no new coverage enum, no change to P1/P2/P3/P4 definitions |

**Advisory A-1 — not closed.** IV1 noted that P2 specific-query copy is the closest-to-negative rendering in the artifact. A-1 is **advisory, not a correction target**. CORR1 does not expand to close it. The only contact with it is the source-unavailable P2 copy example added at §22.2 while repairing F-4, which introduces no new semantics. **A-1 remains open for a future act.**

**What CORR1 did not touch.** The Owner C/HYBRID decision (§0.2); RC1–RC5 (§24.4); P1, P2, P4 and P5 definitions; P3 active semantics; P6 deferral; `supportClass` absence; D1 (§4.1); D2 (§4.3, §26); Block 10 `LIMITED` (§22.1); `MATERIALITY_NOT_AUTHORIZED` for P1–P5 (§19, App. B); report block order and availability enums (§22); the source universe (§24.1); `temporalAxis` (§25.2); commercial sequencing; the registered-FREE, questionnaire, Final-Report-Free-PDF, private-evidence and paid-scope boundaries (§2, §33); and the absence of Environment, ECS, friction, forecast, economic prediction, transaction verdict and named-person prediction authority (§7.2, §28).

---

## 1. Purpose

To define the smallest complete methodology artifact that makes a first Level-1 PUBLIC/FREE documentary evidence implementation lawfully bounded, under the Owner's C/HYBRID completeness architecture.

`CASE-3.4` §18 states: *"Therefore CASE-3.4 is a research/method contract. No production implementation is authorized."* Accepted design authority (`18`, `19`, `20`) authorizes the Level-1 product *shape*, but under `AGENTS.md` §5.4 the design corpus "governs design and product behavior only. It does not establish implementation, verification, deployment, security certification, or production readiness." This delta closes that gap and nothing more.

---

## 2. Scope

**In scope.** Documentary ingress, certification, proposition-state production, and collection-coverage metadata for **anonymous**, unauthenticated, no-cost Level-1 public analysis of a current or prospective transaction between a resolved Acquirer and a resolved Target.

**Out of scope entirely.** Account; registration; registered-FREE behavior; deal persistence; workspace; canonical questionnaires; respondents; invitations; final-report PDF semantics; private or client documents; dataroom; payment; pricing; commercial tier logic; analyst review; paid report; 42Q; participant flow; Integration Monitor; historical case-study replay; model/provider routing; storage architecture; retention.

**Also out of scope for this act specifically.** Exhaustive SEC form enumeration; expansion of the record-class mapping table; expansion of the raw-form-value registry; repair of individual form adjudications (`ARS`, `SD`, `F-6`, `F-3ASR`, `424B7`, `D`, `S-1/A`, `POS AM`); proof of any record-class closure domain. Under C/HYBRID none of these is a prerequisite for correctness (§13, §21).

**Scope of authority granted.** Production execution of an enumerated subset of mode-general documentary primitives (§3.2) within an enumerated claim ceiling (§7). `CASE-3.4` §18 remains in force for every primitive not enumerated.

---

## 3. Relationship to existing authority

### 3.1 Mode-general primitives — reused unchanged

source identity · artifact / content identity · exact excerpt · exact locator · atomic proposition · observed scope · source competence · semantic non-expansion · contradiction preservation · provenance · public availability · interested-self-description restriction · DE-4 structure / aspiration / policy-existence **firewall**.

The DE-4 item is the **firewall only**. `CASE-3.4` §6's default labels for DE-4 (`NON-DISCRIMINATING`, `NOT DETERMINABLE`) are **discriminator-relative** and are **not instantiated in Mode D** (§7.3).

### 3.2 Production primitives authorized

| Primitive | Authorized extent |
|---|---|
| §5.1 source certification | **NARROWED.** Only mechanical identity components: source identity; artifact / content identity; provenance; exact locator. **Governed reviewer-status semantics excluded** |
| §5.3 | atomicity |
| §5.4 | observed scope explicit |
| §5.5 | source competence |
| §5.7 | contradiction status |
| §5.8 | semantic non-expansion |
| §6 | DE-4 **firewall only** |
| §10 | scope recording and fail-closed-at-claimed-scope |
| §12 | interested self-description |
| §13.2 | edge-record field discipline as reduced in §8.3 |
| §14 | **NARROWED.** Only: (a) no numeric edge weights; (b) documentary ingress establishes admissibility, not a scoring layer. The five CASE-1 support classes are discriminator-relative and **not** reused |

**And no others.**

### 3.3 Retrospective-specific machinery — NOT imported

historical T0 · CASE-2 Gate A / Gate B · PRE-T0 classification · hindsight firewall · baseline evidence seal · baseline result seal · post-T0 reveal ordering · historical continuity bridge · case-level seal mechanics · sealed-fact membership invariant.

Control Tree §11.0 confirms the parallel: `PROJECT_START_EVIDENCE_SNAPSHOT_0` is *"NOT an anti-hindsight cutoff."*

### 3.4 Not authorized — above the ceiling

Mechanism evidence (`CASE-3.4` §5.6) · governed human certification (§5.10) · DE-1/2/3 (§6) · constitutive-rule exception (§6, `NOT AVAILABLE`, version-bound to `questionnaires.json` SHA-256 `b8b36cc2a9b552830882538b144be0f795f703ad0d82157f585d7c83524d4713`) · discriminator instantiation (§7) · CASE-1 support classes (§14) · operative-rule test (§8) · repeated-practice test (§9) · CASE-1 determination A–H (§15).

---

## 4. Product-level boundary

### 4.1 Controlling Owner decision D1

```text
LEVEL-1 PUBLIC/FREE CLAIM CEILING = FACTUAL
STATUS: OWNER-ACCEPTED / CONTROLLING / CLOSED / NOT REOPENED
```

D1 Option A is unchanged by this artifact. The Mode D claim ceiling remains **LEVEL B / FACTUAL**.

### 4.2 Product levels preserved

```text
LEVEL 1 — PUBLIC / FREE (anonymous)
LEVEL 2 — REGISTERED / SAVED DEAL
LEVEL 3 — INTERNAL EVIDENCE
LEVEL 4 — PAID / CONTROLLED
```

**This artifact governs anonymous LEVEL 1 ONLY.** Levels 2–4 are named only to fix the boundary.

### 4.3 D2 — artifact retention

```text
ARTIFACT RETENTION POLICY:
DEFERRED / OUTSIDE THIS METHODOLOGY ACT
```

Unchanged and not decided here (§26).

---

## 5. Mode D definition

```text
MODE D — PROSPECTIVE_PUBLIC_FREE

A production-authorized documentary INGRESS and FACTUAL PUBLIC-ANALYSIS mode
for anonymous, unauthenticated, no-cost Level-1 analysis of a current or
prospective transaction between a resolved Acquirer and a resolved Target.

Mode D is SUB-INTERPRETIVE.

NOT an Environment determination mode.  NOT a semantic-edge mode.
NOT a forecast mode.  NOT Mode A / Mode B / Mode C.

Mode D asserts POSITIVE FACTS and EPISTEMIC RESULT STATES.
Mode D asserts NO AUTHORITATIVE ABSENCE.
```

**Inputs.** Exactly one ordered resolved (Acquirer, Target) entity pair per contract `18`. No respondent, questionnaire record, account, private document, user-supplied evidence, or analyst input. Company names are identity context, never evidence about organizational environment (`18` §95).

---

## 6. Claim ladder

| Level | Claim | Required inputs |
|---|---|---|
| **A** | Source / artifact metadata | source family, source identity, artifact identity, exact locator, filed date, retrieval date |
| **B** | Atomic factual proposition | A + exact excerpt or deterministic structured field + one atomic proposition |
| **C** | Behavioral / mechanism evidence class (DE-1/2/3) | B + mechanism evidence |
| **D** | Mechanism / structural watchpoint | C + mechanism decomposition + scope bridge + temporal qualification |
| **E** | Environment support | D + exact current anchor + `CASE-3.4` §7 instantiation |
| **F** | Environment determination | E + CASE-1 A–H |
| **G** | Pair / ECS / resource / friction | F on **both** sides + resource model + ECS release authority |
| **H** | Forecast | G + forecast authority + timing logic + observable sign + verification condition |

**No level skipping.** No level may be emitted unless every level beneath it is satisfied **for that same proposition**.

---

## 7. Mode D public claim ceiling

```text
MODE D PUBLIC CLAIM CEILING = LEVEL B
LEVELS C–H FAIL CLOSED
```

### 7.1 May be emitted

source metadata · artifact identity metadata · certified atomic public facts · exact provenance · **collection coverage states** · **non-negative proposition result states** · conflict candidates · diligence actions derived only from those states · a bounded evidence-gap surface (§20, §22) · canonical report block availability states.

### 7.2 May NOT be emitted

mechanism-level structural watchpoints · organizational-behavior conclusions · Environment support or determination · pair inference · ECS · resource-conflict inference · friction inference · timing forecast · economic prediction · deal verdict · named-person forecast · **any assertion that an unresolved factual gap is materially important to the deal** absent authorized materiality (§19) · **any authoritative claim that a record class is absent, was not filed, or does not exist** (§15, §21).

**Record-class presence is not transaction characterization.** Presence of a record of any RC class establishes only that a record of that class was established within the lawfully recognized evidence. It does **not** establish that a transaction occurred, its nature, its parties, or its status. Phrasings such as *"M&A activity established"* are above Level B and fail closed.

**Record-class non-establishment is not record-class absence.** See §15.4 and §21.

### 7.3 DE-4 boundary

DE-4 is retained **internally** as the conservative marker that a record concerns structure, aspiration, or policy-existence and is **not behavioral evidence**. It carries **no support semantics** in Mode D: `CASE-3.4` §6's `NON-DISCRIMINATING` / `NOT DETERMINABLE` labels are discriminator-relative and are **not instantiated**.

### 7.4 Watchpoint containment

A watchpoint may not assert, imply, or presuppose any proposition that would fail the Documentary Evidence Gate if asserted directly. Operational test: strike every sentence that is not a certified positive fact or a declared non-negative result state; if the headline collapses, it was a mechanism claim and fails closed.

---

## 8. Atomic factual proposition

### 8.1 Definition

A lawful Level-B atomic factual proposition: is **one inspectable proposition**; is **exactly attributable** to an identified public artifact; **binds to an exact locator**; **binds to exact source content or a deterministic structured source field**; **preserves scope**; **preserves date**; **preserves source competence**; contains **no added motive**, **no added causality**, **no inferred recurrence**, **no inferred authority beyond what the source states**, **no inferred organizational behavior**, **no Environment implication**.

A proposition failing any condition is **NOT EMITTED** — never in weakened, hedged, or qualified form.

### 8.2 Semantic non-expansion

Per `CASE-3.4` §5.8, a proposition may not add motive, recurrence, scope, causality, symmetry, authority, or decision rule absent from the source. The test is entailment, not resemblance.

### 8.3 Required proposition record

```text
propositionId
side                             acquirer | target
sourceFamily
sourceIdentity
rawFormValue                     Layer 1 - exact string as emitted (§24.2)
canonicalFormIdentity            Layer 2 - resolved identity (§24.3)
formDisposition                  RC1..RC5 | MULTI(...) | OUT_OF_BOUND | UNMAPPED
recordClass
recordClassMappingVersion        reference-data identity in force (§24.3, C1)
rawFormValueResolutionVersion    reference-data identity in force (§24.3, C1)
semanticTaxonomySnapshotId       reference-data identity in force (§24.3, C1)
artifactIdentity                 §26 - identity obligation only; retention DEFERRED
exactLocator
excerptOrFieldReference          named structured field (B′) or verbatim span (future B)
propositionText                  atomic
filedOrPublishedDate
retrievedAt
evidenceCutoff
collectionBoundId
observedScope
claimedScope                     equals observedScope; no upward generalization
evidenceLane                     PUBLIC (fixed)
deClass                          DE-4 | UNASSIGNED   (firewall marker only)
interestedSelfDescription        true | false
gapState                         §15 active vocabulary
claimLevel                       A | B′ | B
```

**`supportClass` is absent and is not replaced.** A Mode-D factual proposition has no discriminator target, so it has no support relation to record. `CONFLICT_CANDIDATE` is carried **solely** through `gapState`.

> **Field-name note.** The field name `gapState` is retained unchanged from the historical record schema for compatibility with the evidence-gap vocabulary that contracts `19` §84 and `20` §40 already authorize. The field name carries **no absence semantics**. Absence authority is governed exclusively by §15 and §21, never by a field name.

---

## 9. B′ structured-field facts vs B free-text facts

| | **B′ — DETERMINISTIC STRUCTURED-FIELD FACT** | **B — FREE-TEXT EXCERPT-DERIVED FACT** |
|---|---|---|
| Content | A proposition whose entire content is a field the source publishes **as structured data** | A proposition entailed by an exact excerpt of document prose |
| Interpretation step | **None** | **Present** |
| Verification | Deterministic only | Deterministic binding **plus** independent semantic re-derivation (§13) |
| Model required | **None** | Two independent actors |
| Slice-1 status | **ACTIVE** | **NOT ACTIVE — future capability** |

**A free-text descriptive field is not a structured semantic field.** A field whose value is unconstrained human-authored prose (for example a primary-document description string) carries no structured semantics and **must not** be a B′ basis for any proposition about entities, relationships, or transaction participants.

**A populated structured field is not automatically the field it appears to be.** A field's *name* never substitutes for its *semantics* (§24.7.2).

---

## 10. Source competence

### 10.1 Governing rule

```text
COMPETENT_FOR_EXISTENCE
  ≠ COMPETENT_FOR_BEHAVIOR
  ≠ COMPETENT_FOR_CAUSAL_MECHANISM

Competence is SOURCE × PROPOSITION. Never source-family-global.
Never conferred by a source's official status.
```

### 10.2 Binding rules

1. A source competent for *existence* may ground a Level-B positive fact and a bounded non-negative result state — never a mechanism claim, a DE-1/2/3 assignment, a discriminator, or an absence claim.
2. Competence is evaluated per proposition, never inherited from the source family.
3. A source family not marked ACTIVE in Appendix A may not be collected from in Slice 1.
4. **Schema competence is part of competence.** A source is competent for a B′ proposition only if it actually publishes the required field as structured data with the required semantics.
5. **Competence for existence is not competence for non-existence.** A source that competently establishes that a record exists does **not**, by that fact, become competent to establish that a record does not exist. Non-existence requires a proven closure domain (§21), which no active authority supplies.

### 10.3 Slice-1 activation

**Third-party press, news, and general web content are `REQUIRES_FUTURE_COMPETENCE_RULE` and are NOT collected in Slice 1.** No web or news crawling is authorized.

---

## 11. Interested self-description

An issuer statement may establish `THE ISSUER STATED X`. It does **not** automatically establish `X IS HOW THE ORGANIZATION ACTUALLY BEHAVES`. **No "official source = behavioral truth" shortcut exists in Mode D.** `interestedSelfDescription` is marked at **ingestion**.

---

## 12. Verification ladder

| Claim level | Verification requirement | Model | Second actor |
|---|---|---|---|
| **A** | **DETERMINISTIC.** Source-family identity; artifact identity; schema/enum/date validation; locator round-trip; bound membership | **None** | `NOT_REQUIRED` |
| **B′** | **DETERMINISTIC.** Field derives mechanically from the canonical structured field | **None** | `NOT_REQUIRED` |
| **B** *(future)* | Deterministic artifact/excerpt binding **plus** independent semantic re-derivation (§13) | Two independent actors | **`REQUIRED`** |
| **C** | Gate cond. 1–9 **plus** `CASE-3.4` §5.10 governed human certification | — | `NOT_SUFFICIENT` |
| **D** | `CASE-3.4` §7.1–§7.7 plus §5.10 | — | `NOT_SUFFICIENT` |
| **E–H** | CASE-1 A–H plus each downstream gate's own input authority | — | `NOT_SUFFICIENT` |

**Slice 1 requires no model at all.** A self-authored validator is evidence, not independent proof.

---

## 13. Independence rule for future B extraction

**Future semantics, not Slice-1 scope.** The independent second actor must: receive the canonical artifact **plus the locator**; **not** receive the first actor's summary as its only evidence; derive **its own narrowest proposition**; derive **its own excerpt span**; be a **different eligible actor**; **fail closed on disagreement**.

Prohibited: majority vote; third-model truth vote; preference for the "more confident" model; preference by recency, officiality, or source rank. **No provider binding** — `ACTOR 1` and `INDEPENDENT ACTOR 2` only.

---

## 14. Contradiction preservation

### 14.1 When `CONFLICT_CANDIDATE` is emitted

All four required: both propositions otherwise admissible; scope matches materially; time matches materially; propositions genuinely incompatible, inspectably, without inference.

`CONFLICT_CANDIDATE` is a **proposition result state**, not a support class, and must not use `CASE-3.4` §14's `DIRECT CONTRADICTION`.

### 14.2 Not contradictions

| Situation | Handling |
|---|---|
| Temporal evolution — same issuer, different dates | Record both with filed dates |
| Different observed scope | Record both scopes |
| Self-description vs later event, without additional authority | Mark `SELF_DESCRIPTION_UNCORROBORATED` |
| Different organizational level | Record both levels |

### 14.3 Contradiction is not coverage degradation — C/HYBRID boundary

```text
UNKNOWN COVERAGE        ≠  CONTRADICTORY EVIDENCE
COVERAGE DEGRADATION    ≠  CONTRADICTION
```

The monotonicity invariant of §11A protects an established positive proposition **only** against unrelated unknown or coverage-deficient records. It does **not** make positive claims immune to real contradiction. Where an established positive proposition later encounters actual contradictory competent evidence at matched scope and time, the existing contradiction machinery of this section applies in full and is unaffected by C/HYBRID.

### 14.4 Absolute prohibitions

Mode D **never** automatically resolves a contradiction. No majority voting, source-ranking truth selection, suppression, or conversion into a confidence score. A conflict is a **result**, not an error.

---

## 11A. POSITIVE MONOTONICITY INVARIANT — load-bearing

> Numbered `11A` to sit adjacent to source competence while preserving the established section numbering of §§11–15. It is load-bearing and is referenced throughout.

```text
MONOTONICITY INVARIANT

Once a positive factual proposition is lawfully ESTABLISHED from competent
evidence actually obtained, the later addition of unrelated UNKNOWN,
UNMAPPED, or coverage-deficient records MUST NOT retract, weaken, downgrade,
qualify, or hedge that proposition.
```

### 11A.1 What may change an established positive proposition

A positive proposition may change **only** because of:

- direct contradiction by competent evidence at matched scope and time (§14);
- source invalidation;
- evidence invalidation, including retraction or correction by the source;
- authority invalidation;
- identity error — the proposition was bound to the wrong entity, artifact, or locator;
- another already-lawful mechanism that explicitly governs proposition truth.

**Coverage degradation alone is insufficient.** It is not on this list and may not be added to it by implementation.

### 11A.2 What monotonicity does NOT mean

Monotonicity is **not evidence immortality**.

- A proposition that was **never established** is not protected; there is nothing to protect.
- A proposition whose **sole supporting evidence was not retrieved** was never established. If the source is unavailable, the proposition does not exist and must not be preserved, cached forward, or inferred from a prior run (§23.4, FF-H).
- A proposition established under an **identity that later proves wrong** is withdrawn under §11A.1.

### 11A.3 Worked statement

```text
10-K established  →  RC3 ESTABLISHED

later: FUTURE-UNKNOWN-XYZ encountered

required:  RC3 ESTABLISHED remains established
permitted: collection coverage degrades to PARTIAL
permitted: FUTURE-UNKNOWN-XYZ disclosed as an unresolved raw value
prohibited: RC3 becomes uncertain, hedged, downgraded, or withdrawn
```

---

## 15. Proposition result states

### 15.1 Active vocabulary

```text
ESTABLISHED_WITHIN_BOUND
NOT_ESTABLISHED_WITHIN_BOUND
CONFLICT_CANDIDATE
NOT_PUBLICLY_OBSERVABLE
OUT_OF_BOUND
```

```text
RETIRED FROM THE ACTIVE VOCABULARY:
MISSING_WITHIN_BOUND   — superseded lineage only (§15.4)
```

### 15.2 Definitions

| State | Means | Does **not** mean |
|---|---|---|
| `ESTABLISHED_WITHIN_BOUND` | A certified positive proposition exists, grounded in competent evidence actually obtained | True in every sense; complete; current; that no contrary evidence exists elsewhere |
| `NOT_ESTABLISHED_WITHIN_BOUND` | No qualifying record for this proposition has been established from the evidence the methodology has lawfully recognized | **≠ absent · ≠ false · ≠ no · ≠ zero · ≠ negative evidence · ≠ adverse · ≠ suppressed · ≠ concealed · ≠ "no such record exists" · ≠ "no such record was filed" · ≠ complete proof of non-occurrence · ≠ material · ≠ important · ≠ priority** |
| `CONFLICT_CANDIDATE` | Two certified propositions incompatible at matched scope and time | That either is false |
| `NOT_PUBLICLY_OBSERVABLE` | This class of proposition is not of a kind public sources disclose | That a search was run and failed |
| `OUT_OF_BOUND` | The proposition class lay outside the declared bound | Missing; searched-for; absent |

**`NOT_PUBLICLY_OBSERVABLE` is a METHOD CLAIM**, emitted only from a predeclared classification. **A failed search may not generate it.**

> **Terminology note.** `OUT_OF_BOUND` appears in two distinct vocabularies: here as a **proposition result state**, and in §24 as a **form disposition**. Implementations must keep them in separate fields (`gapState` vs `formDisposition`, §8.3).

### 15.3 `NOT_ESTABLISHED_WITHIN_BOUND` is epistemic, not ontological

```text
NOT_ESTABLISHED_WITHIN_BOUND describes THE STATE OF THE SEARCH.
It does not describe THE STATE OF THE WORLD.
```

It is a statement about what the methodology has lawfully recognized. It is **not** a statement about what exists, what was filed, or what an issuer did or did not do. It carries **no absence authority**, **no negative valence**, and **no materiality**.

Every rendering of this state — internal, API, screen, PDF, email — must be phrased so that the epistemic reading is the only available reading.

### 15.4 Why `MISSING_WITHIN_BOUND` was retired

Historical `MISSING_WITHIN_BOUND` was defined as *"The bound was executed, the source publishes the required field, and no certified proposition was found"* and was carried as the gap state for P2, P3 and P4 on non-establishment. Its guard rails were strong — *"≠ false · ≠ no · ≠ absent in reality · ≠ adverse · ≠ concealed · ≠ zero · ≠ negative evidence · ≠ material"* — but two defects were structural and could not be fixed by guard rails:

1. **The stem is negative-valent.** "Missing" names a deficiency in the world, not a limit of the search. Guard rails that must repeatedly deny what the word itself asserts are load-bearing in the wrong direction, and every downstream rendering pulled toward absence.
2. **Its precondition was closed-world.** "The bound was executed" was supplied by global `COMPLETE_WITHIN_BOUND`, which the Owner has now stripped of absence authority. The precondition no longer exists, so the state it gated cannot be emitted.

The rename is therefore **required**, not elective, and the Owner's §7 preference for vocabulary reuse over enum creation is satisfied as far as it can be: the `_WITHIN_BOUND` suffix convention, the field, the record schema, and every other member of the vocabulary are preserved unchanged. Only the negative-valent stem is replaced.

`MISSING_WITHIN_BOUND` may appear in this and future artifacts **only** as superseded lineage. It may not appear in any active emission path, active definition, active report copy, or active validator expectation.

### 15.5 Schema-absence is not a result state

If the source **does not publish a field** required by a proposition, that proposition is **not mechanically searchable** and is **not in the active subset**. It **MUST NOT** be emitted as `NOT_ESTABLISHED_WITHIN_BOUND`, **MUST NOT** be emitted as `NOT_PUBLICLY_OBSERVABLE`, and **MUST NOT** appear as a result state of any kind.

### 15.6 Empty published value is an established state

Where the source **publishes** a structured field whose value is legitimately empty, the system records **exactly that published value**. An empty published value is an **`ESTABLISHED_WITHIN_BOUND`** structured-field state — a positive, certified reading, not a failed search.

It **MUST NOT** become `NOT_ESTABLISHED_WITHIN_BOUND` · false · negative evidence · absence in reality · adverse · materiality.

**Derived query rule.** Asking whether a *particular* code appears in a published set is a **derived query over an already-established value**. Its negative answer is *"the published set does not contain that code"* — never a non-establishment state.

**Consequence: P5 never yields `NOT_ESTABLISHED_WITHIN_BOUND`** (§23.1, App. C.1, validator §31.1 #19). P5 semantics are unchanged from the historical artifact in every respect.

**Block-level availability remains governed by contract `19` §87.**

---

## 16. Collection coverage — metadata, not authority

### 16.1 Two independent axes

```text
AXIS 1 — PROPOSITION TRUTH   (§15, §11A)
  ESTABLISHED_WITHIN_BOUND · NOT_ESTABLISHED_WITHIN_BOUND
  CONFLICT_CANDIDATE · NOT_PUBLICLY_OBSERVABLE · OUT_OF_BOUND

AXIS 2 — COLLECTION COVERAGE  (this section)
  COMPLETE_WITHIN_BOUND · PARTIAL · SOURCE_UNAVAILABLE

AXIS 3 — REPORT SUFFICIENCY  (contract 19 §87, reused unchanged)
  AVAILABLE | LIMITED | INSUFFICIENT_PUBLIC_EVIDENCE
  | REQUIRES_PRIVATE_EVIDENCE | NOT_APPLICABLE | BLOCKED_BY_CONTRADICTION
```

**Axis 1 and Axis 2 are independent.** Axis 2 describes how the collection executed. Axis 1 describes what was established. Neither derives from the other, except through the narrow and explicit dependency in §16.4.

### 16.2 `COMPLETE_WITHIN_BOUND` — new role

```text
COMPLETE_WITHIN_BOUND is COVERAGE / PROVENANCE METADATA.

It means ONLY:
  the declared collection procedure completed according to its coverage
  contract.

It is NOT:
  absence authority · negative-claim authority · P4 authority
  · proof that no RC record exists
  · a prerequisite for an already-established positive RC fact
  · an upgrade path for any proposition state
```

`COMPLETE_WITHIN_BOUND` **does not mean complete public evidence**, and it **does not mean the collection saw everything that exists**. It means the declared procedure ran to its declared coverage contract.

### 16.3 Coverage computation

```text
COMPLETE_WITHIN_BOUND  requires ALL of:
  1. source retrieved for the side;
  2. every exposed index page consulted;
  3. enumeration count reconciliation passed;
  4. all reference-data identities in force recorded exactly (C1);
  5. no engineering-guard truncation;
  6. symmetric execution across both sides;
  7. every encountered raw form value resolved to a disposition in the
     closed disposition set, with zero UNMAPPED / UNRESOLVED values.

PARTIAL  if ANY of:
  - one or more encountered raw values resolved to UNMAPPED / UNRESOLVED;
  - any exposed page not consulted;
  - reconciliation failed;
  - an engineering guard truncated the enumeration;
  - execution was asymmetric across the two sides.

SOURCE_UNAVAILABLE  if the source could not be retrieved for the side.
```

- **`OUT_OF_BOUND` never, by itself, forces `PARTIAL`.** A form positively adjudicated as incapable of satisfying any RC definition is fully resolved; the bound never claimed it.
- **`UNMAPPED / UNRESOLVED` always forces `PARTIAL`.** No relevance test, no severity grading.
- **`PARTIAL` is a disclosure, not a verdict.** It degrades nothing on Axis 1.

### 16.4 The only lawful dependency between the axes

```text
SOURCE_UNAVAILABLE for a side
  → every proposition whose SOLE supporting evidence was that unretrieved
    source is NOT ESTABLISHED, because nothing was obtained to establish it.
```

This is not coverage retracting a fact. It is the absence of any fact to retract (§11A.2). No other coverage state has any effect on Axis 1.

```text
PARTIAL                 → NO effect on any established positive proposition
COMPLETE_WITHIN_BOUND   → NO absence authority, for any proposition
UNKNOWN raw value       → NO effect on any established positive proposition
```

#### 16.4.1 Source retrieved vs source not retrieved — two different epistemic situations

*Clarification of the existing architecture (§16.4, §11A.2, FF-H). No new normative decision, no new proposition state, no new coverage enum.*

Two situations produce a non-establishment result and must never be conflated, because only one of them involved any examination of public evidence at all.

```text
SITUATION 1 — SOURCE RETRIEVED, NO QUALIFYING RECORD ESTABLISHED
  The declared collection ran against the source.
  Records were enumerated and dispositions resolved.
  No record satisfying the class was established.

  coverage      = COMPLETE_WITHIN_BOUND or PARTIAL
  P4            = NOT_ESTABLISHED_WITHIN_BOUND
  examination   = OCCURRED

SITUATION 2 — SOURCE NOT RETRIEVED
  The source could not be retrieved for the side.
  Nothing was enumerated. No disposition was resolved.
  No examination of public evidence occurred for that source/side.

  coverage      = SOURCE_UNAVAILABLE
  P4            = NOT_ESTABLISHED_WITHIN_BOUND, epistemically qualified
  examination   = DID NOT OCCUR
```

**Both are non-negative. Neither is absence.** The difference is not in the proposition state — it is in what the state is entitled to imply, and therefore in how it may lawfully be rendered.

```text
SOURCE_UNAVAILABLE ≠ absent
SOURCE_UNAVAILABLE ≠ not filed
SOURCE_UNAVAILABLE ≠ none · zero · does not exist
SOURCE_UNAVAILABLE ≠ a completed search that returned nothing
SOURCE_UNAVAILABLE ≠ adverse · material · urgent
```

**Under total `SOURCE_UNAVAILABLE` for a source/side:**

1. **No positive proposition** of any class may be established from that source — there is nothing from which to establish one (§16.4).
2. **P3 remains positive-only** and therefore emits no negative and no non-establishment proposition of its own. P3's positive-only character is unchanged by source unavailability (§23.2).
3. **Coverage state is `SOURCE_UNAVAILABLE`**, not `PARTIAL` and not `COMPLETE_WITHIN_BOUND`.
4. **P4 may carry `NOT_ESTABLISHED_WITHIN_BOUND`** — it is the epistemic not-established state and it remains accurate — **only where the accompanying text makes explicit that no public-source examination occurred for that source/side.** The state value is unchanged; the qualification is a rendering obligation, not a new state.
5. **Report rendering must foreground the source-unavailable condition** and **must not imply a completed search** (§22.2).
6. **No proposition from a prior run may be preserved, cached forward, or inferred as current-run truth** (§11A.2, FF-H).

**The prohibited rendering.** Copy of the form *"Not established from the public evidence this analysis examined"* asserts that an examination occurred. Where the source was never retrieved, that assertion is **false** and the copy is **prohibited** (§22.2, validator §31.1 #35). It remains lawful in Situation 1, where an examination did occur.

### 16.5 What coverage metadata remains useful for

auditability · source and retrieval disclosure · declared limitations · reproducibility context · diagnostics · reference-data staleness visibility · comparability of two executions under identical identities.

### 16.6 What coverage metadata is no longer useful for

proving absence · negating a record class · authorizing P4 · invalidating an unrelated established positive fact · gating a positive claim.

### 16.7 Coverage state guards

```text
PARTIAL ≠ false
PARTIAL ≠ absent
PARTIAL ≠ zero
PARTIAL ≠ adverse
PARTIAL ≠ material
PARTIAL ≠ "ignore all established facts"

COMPLETE_WITHIN_BOUND ≠ "therefore nothing else exists"
COMPLETE_WITHIN_BOUND ≠ closure domain
```

---

## 17. Collection-bound semantics

### 17.1 "Latest N filings" is REJECTED as methodology

A numeric item count may exist **only** as an `ENGINEERING GUARD`; truncation ⇒ `PARTIAL` with the truncation recorded. Rejected because it is a display bound not an evidence bound; it is not symmetric in time; it can silently exclude material records precisely when the filer is active; and it ignores known additional coverage.

### 17.2 Lawful method bound

```text
METHOD BOUND =
    PROPOSITION NEED × SOURCE FAMILY × DOCUMENT / RECORD CLASS
  × TEMPORAL WINDOW (where required at all)
applied SYMMETRICALLY across Acquirer and Target.
```

**A method bound is a scope of collection. It is not, and never becomes, a closure domain** (§21).

### 17.3 Method-fixed vs engineering-configurable

**METHOD-FIXED:** that a bound exists; declared **before** collection and recorded with the result; **symmetric**; derived from proposition need; bound ≠ sufficiency; **bound ≠ closure**; non-establishment within the bound is `NOT_ESTABLISHED_WITHIN_BOUND` and never a negative value; bound and any unconsulted remainder disclosed; any displayed count exact and meaningful; the identity obligations of §24 and the coverage computation of §16.3.

**ENGINEERING-CONFIGURABLE:** page size, pagination strategy, concurrency, retry and backoff, timeout, cache TTL, transport headers, serialization format.

### 17.4 No invented universals

**No universal number. No universal date window.** Concrete bound parameters belong to §25.

---

## 18. Temporal semantics

### 18.1 Required

| Field | Source |
|---|---|
| `filedOrPublishedDate` | As published by the source. Never inferred |
| `retrievedAt` | Server-side, per retrieval |
| `evidenceCutoff` | Declared instant beyond which no evidence was collected. Displayed only because it is real; never bypassed |
| declared collection window | Where the bound uses a temporal axis (§25) |

**Temporality is never inferred from retrieval, upload, or processing time.**

### 18.2 Not imported

`PRE-T0` · historical anti-hindsight cutoff · historical seals · Gate A / Gate B.

### 18.3 Not authorized

pre-announcement / post-announcement classification · deal-generated-contamination flags · forecast admissibility · timing prediction · any friction timeline including Day 30 / 60 / 100 framing.

### 18.4 Historical record, current relevance

A record filed long before the analysis remains a lawful Level-B fact, but its **filed date must travel with it in every rendering**, and it may not be phrased so as to imply current organizational relevance without authority Mode D does not have.

---

## 19. Materiality Register

```text
missing data  ≠  material Decision Gap
not established  ≠  material Decision Gap
```

**Role:** `PROPOSITION CLASS → whether non-establishment may be called material → bounded rationale → lawful next evidence channel`.

**Absolute prohibitions.** Materiality may **never** be inferred from non-establishment alone, from coverage state, from gap count, from confidence, from company size, from source count, or from model judgment. **No model may rank gaps dynamically.**

**Insufficient authority** ⇒ `MATERIALITY_NOT_AUTHORIZED`, and **no material Decision Gap is created for that class.** The item remains visible as an **evidence gap**.

### 19.5 Slice-1 result

```text
SLICE-1 MATERIALITY RESULT:
NO MATERIALITY-AUTHORIZED DECISION GAP CLAIMS.
```

All active classes P1–P5 are `MATERIALITY_NOT_AUTHORIZED` (Appendix B). This is unchanged by C/HYBRID. The Owner's completeness decision creates no materiality, no priority, no importance, and no urgency.

**This does NOT mean:** no evidence gaps · no factual limitations · no useful diligence actions · no report value. **It means only:** Slice 1 has no authority to say an unresolved factual question is materially important to the deal.

---

## 20. Decision Gap derivation

### 20.1 Evidence gap vs material Decision Gap

```text
EVIDENCE GAP          a bounded factual statement that something was not
                      established from the evidence lawfully recognized, plus
                      what evidence would answer it. AUTHORIZED.

MATERIAL DECISION GAP an assertion that an unresolved matter is materially
                      important to the deal. Requires authorized materiality.
                      NOT available in Slice 1.
```

An evidence gap is a statement about **what the analysis has established**. It is never a statement that something is absent from the world.

### 20.2 Lawful chain

```text
validated A/B fact state
→ ESTABLISHED / NOT_ESTABLISHED / CONFLICT / OUT_OF_BOUND state   DETERMINISTIC
→ method-fixed materiality status (Appendix B)                    METHOD-FIXED
→ lawful evidence need                                            METHOD-FIXED
→ lawful next evidence channel (contract 20 §45)                  METHOD-FIXED
→ server-authoritative projection                                 PROJECTION
```

Where materiality is `MATERIALITY_NOT_AUTHORIZED`, the chain terminates at **evidence gap**.

Collection coverage does **not** appear in this chain. It is reported alongside the result as provenance, never as an input to it.

### 20.3 What Slice 1 may and may not say

**May:** what was established · what was **not established** from the evidence lawfully recognized · source limitations · collection coverage limitations · what evidence would answer a bounded factual question · the lawful next evidence channel.

**May not:** *"this unresolved issue is material to the deal"* · *why it matters* · priority · urgency · predictive consequence · *"no such record exists"* · *"the company did not file X"* · *"X is absent"*.

### 20.4 Component withholding

`19` §52 and `20` §40 make **"why it matters"** a component of the Decision Gap. When materiality is unauthorized, that component is **omitted and fails closed** — not replaced by a hedge or narrative phrasing. **Narrative may not create materiality.**

**Ordering.** With zero material and zero secondary classes, all Slice-1 evidence gaps sit in the **unresolved** group, unranked.

**Evidence channels** reuse the existing `20` §45 set — `PUBLIC_REFRESH`, `INTERNAL_OBSERVATION`, `PRIVATE_DOCUMENT`, `DEAL_ECONOMICS`, `INDIVIDUAL_DATA`, `HUMAN_REVIEW`, `NOT_CURRENTLY_RESOLVABLE`.

### 20.5 Diligence-action containment

*Restored from the historical `CORR3` §21 diligence-action boundary and re-anchored to C/HYBRID vocabulary. Sited here, with the Decision Gap derivation it governs, so that no section is renumbered. This is the authority for report Block 9 (§22).*

**Only DILIGENCE ACTIONS are allowed.** A Slice-1 action may do exactly one thing: **request or propose the lawful collection of evidence needed to answer a bounded factual question.**

```text
LAWFUL ACTION SHAPE

"Public evidence the analysis lawfully recognized does not establish X.
 Verify X through [lawful evidence channel, contract 20 §45]."
```

```text
CONTAINMENT RULE

A recommended action may not assert, imply, or presuppose anything that its
supporting factual or result state does not already authorize.
```

An action is bounded by the state that generated it. Because every Slice-1 class is `MATERIALITY_NOT_AUTHORIZED` (§19.5, App. B) and no closure domain is active (§21.2), no Slice-1 action may carry importance, consequence, or absence.

**An action MUST NOT become any of the following:**

organizational-design recommendation · personnel recommendation, including retaining, removing, or reassigning any person · integration sequencing advice · transaction pacing advice, including accelerating or decelerating integration · behavioral intervention · deal recommendation or transaction verdict · materiality claim · urgency claim · risk-ranking or prioritization · mechanism claim · Environment, ECS, friction or forecast output · financial recommendation, valuation opinion or loss estimate · predicted failure · commercial-pressure or upsell copy.

**Additionally prohibited:** describing a `NOT_ESTABLISHED_WITHIN_BOUND` result as adverse, cautionary, or risk-coloured; any action about a named person; any action that asserts, implies, or presupposes record-class **absence** (§21); any action that treats coverage `PARTIAL` or `SOURCE_UNAVAILABLE` as a finding about the world rather than a disclosure about the collection (§16.7, §16.4.1).

**Actions remain evidence-acquisition actions only.** Ordering is unchanged: with zero material and zero secondary classes, actions sit unranked alongside the unresolved evidence gaps (§20.4).

**Contract `19` §48–§49 behavior is preserved.** §20.5 restates the containment boundary that already governs Block 9; it creates no new report block, no new availability enum, no *why it matters* component, and no materiality.

---

## 21. No authoritative absence without a proven closure domain

### 21.1 The rule

```text
Mode D may assert authoritative record-class absence ONLY IF a future
Owner-accepted methodology version establishes a MECHANICALLY PROVEN CLOSURE
DOMAIN for that specific claim.
```

A **closure domain** for a claim is a mechanically provable statement that the evidence the methodology recognized is exhaustive for that claim — that is, that no record capable of satisfying the claim could exist outside what was examined. It is a property that must be *proven*, not a coverage state that may be *reached*.

### 21.2 Current closure status — none active

```text
RC1 closure = NOT AUTHORIZED
RC2 closure = NOT AUTHORIZED
RC3 closure = NOT AUTHORIZED
RC4 closure = NOT AUTHORIZED
RC5 closure = NOT AUTHORIZED
```

At the time of this act **no RC-specific closure domain is controlling**. Therefore:

```text
CURRENT MODE D EMITS ZERO AUTHORITATIVE RECORD-CLASS ABSENCE CLAIMS.
```

This artifact does **not** attempt to prove RC1–RC5 closure, does **not** enumerate SEC forms in order to manufacture closure, and does **not** define speculative closure rules.

### 21.3 Prohibited inference chains

Every chain below is prohibited on every path — internal, API, projection, report copy, PDF, email:

```text
UNKNOWN                    → NOT FOUND → ABSENT
NOT IN CURRENT TABLE       → OOB       → ABSENT
NO KNOWN MATCH             → ABSENT
NOT ADJUDICATED            → ABSENT
COMPLETE_WITHIN_BOUND      → ABSENT
ALL NON-RC RECORDS EXHAUSTED → THEREFORE AN RC IS ABSENT
NOT_ESTABLISHED_WITHIN_BOUND → ABSENT
```

```text
Unknown means unknown.
Not established means not established.
Neither means absent.
```

### 21.4 Future extension point — defined, not activated

A future Owner-accepted methodology version **may** authorize bounded absence for a specific record class if, and only if, it supplies:

1. a mechanically proven closure domain for that specific claim;
2. an explicit statement of what the closure domain covers and excludes;
3. the evidence and derivation establishing the proof;
4. explicit Owner acceptance of the resulting absence authority.

Until all four exist for a given record class, that class's closure remains `NOT AUTHORIZED`, and any implementation marking it active is a defect (validator §31.1 #12).

**This artifact creates no such closure domain and authorizes no work toward one.**

---

## 22. Canonical public-report claim envelope

| # | Block | Slice-1 state | Authority |
|---|---|---|---|
| 1 | Executive Decision Summary | **FACTUAL / COLLECTION SUMMARY ONLY** | `19` §19, §23 |
| 2 | Structural Watchpoints | **NOT AVAILABLE FOR MECHANISM CLAIMS** | §7.4 |
| 3 | Compatibility Score & Deal Scenario | **NOT AVAILABLE** | `19` §26 |
| 4 | Identified Environment Types | **NOT AVAILABLE** | `19` §31 |
| 5 | Collision Thesis | **NOT AVAILABLE** | `19` §34 |
| 6 | Resource Conflict Map | **NOT AVAILABLE** | Requires pair + resource model |
| 7 | Timeline of Expected Friction | **NOT AVAILABLE** | `19` §41, §42 |
| 8 | Economic Risk Translation | **NOT AVAILABLE** | `19` §45–§47 |
| 9 | Recommended Actions | **DILIGENCE ACTIONS ONLY** | **§20.5** of this artifact (diligence-action containment); `19` §48–§49 |
| 10 | Decision Gap | **`LIMITED`** — §22.1 | `19` §87; `19` §51–§52; `20` §40–§42 |
| 11 | What the Full Engagement Adds | **STATIC / CONTRACT-GOVERNED ONLY** | `19` §54, §55 |
| 12 | Audit Footer | **AVAILABLE** | `19` §57, subject to §59 |

Canonical 12-block order preserved exactly as `MERGEVUE_PUBLIC_REPORT_BLOCKS`. **No new block is created. No new availability enum is created.** Every unavailable block shows an honest fail-closed state with an accurate reason — never disguised as a premium feature (`19` §89).

Report principles preserved without change: **EVIDENCE BEFORE CONCLUSION** · **BLOCK-LEVEL FAIL CLOSED** (`19` §9) · **NO FAKE COMPLETENESS** (`19` §10) · **NO FAKE CERTAINTY**.

### 22.1 Block 10 treatment — unchanged

**State: `LIMITED`** — an existing `19` §87 enum member. No new block, no new availability enum.

`19` §51 frames the block's question as *"What **important** decision cannot yet be supported…"* and §52 lists *why it matters* among its components. With zero materiality-authorized classes, the importance component cannot be produced, so the block is not `AVAILABLE`. It is equally not `INSUFFICIENT_PUBLIC_EVIDENCE`: the blocker is absent **materiality authority**, not scarce evidence, and `19` §89 requires an accurate reason. `LIMITED` is the only true state.

**May appear:** a bounded, **non-material** evidence-gap list — what was established, what was not established from the evidence lawfully recognized, source and collection-coverage limitations, and the lawful next channel. `19` §84 places the limitations surface inside the canonically-labelled `Decision Gap` block.

**Must not appear:** any *why it matters* statement; any materiality, priority, or urgency claim; any ranking; any "material Decision Gap" phrasing; any upsell framing; **any absence claim**.

**No change to the Decision Gap commercial architecture.** The Owner's C/HYBRID decision creates no materiality, priority, importance, urgency, recommendation, or commercial pressure.

### 22.2 Report-copy mapping for the new semantics

```text
ESTABLISHED_WITHIN_BOUND
  lawful copy:   "Established from public filing index evidence as of
                  [evidenceCutoff]: [fact], filed [date], at [locator]."

NOT_ESTABLISHED_WITHIN_BOUND — RETRIEVED-SOURCE CASES ONLY
  (the source WAS retrieved and an examination DID occur; §16.4.1 Situation 1)

  lawful copy:   "Not established from the public evidence this analysis
                  examined as of [evidenceCutoff]."
  lawful copy:   "This analysis did not establish a record of this class.
                  It does not establish that no such record exists."
  PROHIBITED:    "No [record] found."            (reads as absence)
  PROHIBITED:    "Missing."                       (reads as absence)
  PROHIBITED:    "The company has not filed X."   (absence claim)
  PROHIBITED:    "None."  "Zero."  "0 records."   (negative value)
  PROHIBITED:    any adverse, cautionary, or risk-coloured framing

  PROHIBITED:    BOTH lawful copy lines above, and any equivalent asserting
                 that evidence was examined, WHENEVER coverage is
                 SOURCE_UNAVAILABLE for that source/side. No examination
                 occurred, so the assertion is false (§16.4.1, validator #35).

COVERAGE SOURCE_UNAVAILABLE — NO EXAMINATION OCCURRED
  (§16.4.1 Situation 2. The source-unavailable condition is FOREGROUNDED,
   ahead of any result state it qualifies.)

  lawful copy:   "The public filing source could not be retrieved for this
                  analysis. This analysis therefore did not establish a
                  record of this class, and did not examine public filings
                  for this [side / source]."
  lawful copy:   "No public filing evidence was obtained for [side]. Nothing
                  below is established for that side, and nothing below
                  establishes what does or does not exist."
  lawful copy (P2, specific-query form):
                 "The record this question concerns could not be looked for:
                  the public filing source was not retrieved. This is a
                  limitation of the retrieval, not a finding about the
                  record."
  PROHIBITED:    "Not established from the public evidence this analysis
                  examined."                      (no examination occurred)
  PROHIBITED:    "No [record] found."             (implies a completed search)
  PROHIBITED:    "Searched and not found."        (false)
  PROHIBITED:    "Absent."  "Not filed."  "None."  "Zero."  "Does not exist."
  PROHIBITED:    any adverse, cautionary, risk-coloured, material or urgent
                 framing of the unavailability
  PROHIBITED:    presenting a cached or prior-run proposition as current-run
                 truth (§11A.2, FF-H)
  PROHIBITED:    rendering the result state without the source-unavailable
                 qualification, or placing that qualification where a reader
                 would encounter the result state first

COVERAGE PARTIAL
  lawful copy:   "This collection has a known coverage limitation:
                  [specific limitation]. Established facts above are
                  unaffected."
  PROHIBITED:    presenting PARTIAL as a reason to distrust, hedge, remove, or
                 re-qualify any established fact

COVERAGE COMPLETE_WITHIN_BOUND
  lawful copy:   "The declared collection procedure completed."
  PROHIBITED:    "All filings reviewed — nothing else exists."
  PROHIBITED:    any phrasing in which completeness implies absence
```

A zero count for a record class is a **count of what was established**, and must be labelled as such or not displayed at all. A bare `0` next to a record class is an absence claim in numeric clothing and fails closed.

---

## 23. Slice-1 active proposition subset

```text
SLICE-1 ACTIVE CLAIM LEVELS = A + B′ ONLY
```

### 23.1 Active proposition classes

| ID | Proposition class | Claim level | Non-establishment state |
|---|---|---|---|
| P1 | Filer canonical public identity as published by the source | B′ | `SOURCE_UNAVAILABLE` (coverage) — see §23.4 |
| P2 | That a record of declared class C was filed on date D under identifier I, addressable at locator L | B′ | `NOT_ESTABLISHED_WITHIN_BOUND` |
| P3 | Presence, from the evidence lawfully recognized, of each declared record class | B′ | — P3 is positive-only; see §23.2 |
| P4 | **Whether a qualifying record of each declared record class has been established** | B′ | `NOT_ESTABLISHED_WITHIN_BOUND` |
| P5 | The structured event-item code value the source publishes for a record of class RC2 — populated or legitimately empty, recorded exactly as published | B′ | **never** — always `ESTABLISHED_WITHIN_BOUND` (§15.6) |

**P1, P2 and P5 are unchanged in definition.** P5 is unchanged in every respect. P2's definition is unchanged; only the *name and semantics of the state emitted on non-establishment* change, as a mechanical consequence of §15 (§29).

### 23.2 P3 / P4 separation — asymmetric by design

```text
P3   qualifying record established   →  RC ESTABLISHED
P4   no qualifying record established →  RC NOT_ESTABLISHED
```

**These are not symmetric opposites.**

| | P3 | P4 |
|---|---|---|
| Kind | **Positive assertion** supported by qualifying evidence | **Epistemic search-result state** |
| Asserts something about the world | **Yes** — a record of this class was established | **No** |
| Absence authority | n/a | **None** |
| Monotonic | **Yes** (§11A) | n/a — it is not a fact to protect |
| May be negated into the other | — | **No** |

```text
P4 IS NOT A NEGATIVE P3.
```

P4 `NOT_ESTABLISHED` must never be implemented as, stored as, rendered as, or reasoned about as `P3 = false`. A boolean field whose `false` value carries P4 is a defect: booleans invite negation, and the negation of "established" is not "absent".

#### 23.2.1 P3 — full disclosure of what changed

*Disclosure correction (CORR1 / F-1). **P3's active meaning is unchanged from v0.2.** What follows adds no state, restores no retired state, and alters neither P4 nor the RC definitions. It corrects an inaccurate account of what already changed.*

v0.2 stated that monotonicity was *"the only change to P3"*. That was **not accurate**. Measured against the historical `CORR3` P3 — *"Presence, within the declared bound, of each declared record class"*, which carried the retired `MISSING_WITHIN_BOUND` as its non-establishment state (§15.4 records that the retired state was carried for P2, **P3** and P4) — P3 changed in **three bounded ways**:

```text
P3 CHANGE 1 — ANCHORING
  Historical "within the declared bound" wording is RE-ANCHORED to
  "from the evidence lawfully recognized".

  A bound is a scope of collection, never a closure domain (§17.2, §21).
  The re-anchored wording says what P3 actually rests on: the evidence the
  methodology lawfully recognized and actually obtained.

P3 CHANGE 2 — NON-ESTABLISHMENT STATE REMOVED FROM P3
  P3 NO LONGER EMITS A NON-ESTABLISHMENT STATE OF ITS OWN.

  Historically P3 emitted MISSING_WITHIN_BOUND on non-establishment.
  P3 is now POSITIVE-ONLY: it either establishes RCx ESTABLISHED, or it
  emits nothing at all.

P3 CHANGE 3 — POSITIVE ESTABLISHMENT IS EXPLICITLY MONOTONIC
  Once P3 establishes RCx ESTABLISHED from a qualifying record, that
  establishment is monotonic under §11A. Later encounter of an unknown,
  unmapped, or unadjudicated raw form value, or degradation of collection
  coverage to PARTIAL, does not retract, weaken, or re-qualify it.
```

**Where the class-level not-established state went.** It is carried by **P4**, and by P4 alone.

```text
P3 establishes          →  RCx ESTABLISHED          (positive, monotonic)
P3 does not establish   →  P3 emits NOTHING
P4 carries              →  NOT_ESTABLISHED_WITHIN_BOUND   (epistemic, non-negative)
```

**P4 is the sole carrier of class-level `NOT_ESTABLISHED`.** P2's `NOT_ESTABLISHED_WITHIN_BOUND` operates at the level of an individual record instance, not a record class, and is a different question. P3 carries no such state on any path.

**These three changes are consequences of the Owner C/HYBRID decision, not independent new semantics.** Change 2 follows directly from *"P4 SHALL BECOME A NON-NEGATIVE NOT-ESTABLISHED STATE"*: once P4 is the non-negative class-level state, a second class-level non-establishment emission from P3 would be redundant and would reintroduce the negation P4 was separated out to prevent. Change 1 follows from *"COMPLETE_WITHIN_BOUND SHALL BE COVERAGE/PROVENANCE METADATA, NOT ABSENCE AUTHORITY"*, which withdrew the closed-world reading that made "within the bound" load-bearing. Change 3 is the §11A invariant the decision requires, applied to P3.

**P3's definition is otherwise unchanged**, and nothing in this disclosure changes P3's behavior as independently verified in v0.2.

> **Scope note on Change 1.** The re-anchoring from *"within the declared bound"* to *"from the evidence lawfully recognized"* is **document-wide**, not P3-specific — it appears identically in §15.2, §20.1, §20.3, §22.1, §23.3 and §34. It is listed here because IV1 raised it against P3's disclosure; it is not a change unique to P3.

### 23.3 P4 active semantics

```text
P4 — RECORD-CLASS ESTABLISHMENT STATE

ACTIVE MEANING:
  "No qualifying record for this record class has been established from the
   evidence that the methodology has lawfully recognized."

P4 ≠ ABSENT                      P4 ≠ SUPPRESSED
P4 ≠ FALSE                       P4 ≠ CONCEALED
P4 ≠ ZERO                        P4 ≠ "NO SUCH RECORD EXISTS"
P4 ≠ NEGATIVE EVIDENCE           P4 ≠ MATERIAL
P4 ≠ ADVERSE                     P4 ≠ IMPORTANT
P4 ≠ COMPLETE PROOF OF NON-OCCURRENCE   P4 ≠ PRIORITY

P4 means ONLY:
  NOT ESTABLISHED from the evidence lawfully recognized.
```

P4's historical description — *"Declared absence, within the declared bound, of each declared record class"* → `MISSING_WITHIN_BOUND` — is **superseded lineage**. It appears in this artifact only at §15.1, §15.4, **§23.2.1**, §29.1, §31.1 #32 and §35 — in each case as retirement notice, provenance, or validator specification, never as an active state. *(CORR1 added the §23.2.1 reference, where the retired state is named solely to disclose what P3 historically emitted; validator #32 is satisfied.)* No active text in Mode D calls P4 "declared absence".

### 23.4 P1 and source unavailability

P1 is unchanged. Where the source cannot be retrieved for a side, no P1 proposition is established, because nothing was obtained from which to establish it. That is the §16.4 dependency and the §11A.2 limit on monotonicity, not a coverage state retracting a fact. `18` §65 governs the product consequence of an unresolvable filer identity.

#### 23.4.1 P1–P5 under total source unavailability

*Clarification of existing architecture (CORR1 / F-4). No proposition definition changes. No new state. No new coverage enum.*

Where the sole active source is not retrieved for a side, coverage is `SOURCE_UNAVAILABLE` (§16.3) and the per-class behavior is:

| Class | Behavior under total `SOURCE_UNAVAILABLE` | Why |
|---|---|---|
| **P1** | **No positive proposition established.** Filer canonical identity is not established | Nothing was obtained from which to establish it (§23.4, §16.4) |
| **P2** | **No positive proposition established.** No record-filed-on-date proposition exists for any class | Same. P2 is established only from enumerated index records; none were enumerated |
| **P3** | **No positive proposition established**, and **P3 emits nothing at all**. P3 remains **positive-only** and produces no negative and no non-establishment proposition of its own | §23.2.1 Change 2. Source unavailability does not give P3 a state it does not have |
| **P4** | **May carry `NOT_ESTABLISHED_WITHIN_BOUND`** — it is accurate, and it remains non-negative — **but only with an explicit source-unavailable epistemic qualification in every rendering**, and never in a form implying a completed search | §16.4.1 item 4; §22.2; validator §31.1 #35 |
| **P5** | **Not reached.** P5 reads a published structured field on an established RC2 record; with no record established there is no published value to record. This is **not** a non-establishment state for P5, and §15.6 is unaffected | §15.6, App. C.1 |

```text
TOTAL SOURCE_UNAVAILABLE — THE INVARIANTS

coverage                 = SOURCE_UNAVAILABLE
positive propositions    = NONE ESTABLISHED (P1, P2, P3, P5)
P3                       = POSITIVE-ONLY, EMITS NOTHING
P4                       = NOT_ESTABLISHED_WITHIN_BOUND, EXPLICITLY QUALIFIED
absence claims           = ZERO
prior-run propositions   = NOT PRESERVED, NOT CACHED FORWARD (FF-H)
report                   = FOREGROUNDS SOURCE UNAVAILABILITY (§22.2)
```

**`SOURCE_UNAVAILABLE` is not absence, and is not a finding.** It is a disclosure that the retrieval did not happen. It carries no negative valence, no materiality, no urgency, and no adverse reading (§16.4.1, §16.7, §20.5).

### 23.5 P6 — deferred, not active

The source index publishes **no structured counterparty field**; counterparty identity is available only through document prose. P6 is therefore **not B′**, and the source is not schema-competent for it.

```text
P6  COUNTERPARTY IDENTITY IN A TRANSACTION-CLASS RECORD
    STATUS: DEFERRED / FUTURE CLASS-B CAPABILITY
    NOT ACTIVE IN SLICE 1 · NO SLICE-1 RESULT AUTHORITY
```

P6 does not participate in the Collection Bound, proposition evaluation, result states, the Materiality Register, the Decision Gap, report projection, or the implementation contract. It is **not** reported as `NOT_ESTABLISHED_WITHIN_BOUND`, is **not** reported as absent, is **not** replaced, and document prose is **not** promoted into Slice 1 to recover it.

**P6 is not reactivated by this artifact.**

---

## 24. Source subset, form identity, and the reference-data boundary

### 24.1 Source universe vs active subset

```text
MODE-D AUTHORIZED PUBLIC SOURCE UNIVERSE
  publicly retrievable sources, without authentication, credential, payment,
  or user-supplied access, for which an accepted competence rule exists

SLICE-1 ACTIVE SOURCE SUBSET
  the issuer-filed structured public filing index
```

The A+B′ ceiling selects the **index**, not the documents: the index publishes filer identity, form value, filed date, record identifier, structured event-item codes and document locators as structured data. A filing *body* is prose. **Slice 1 reads the index and records locators; it does not retrieve or parse document bodies.**

**NOT ACTIVE:** filing document bodies; proxy, periodic-report and exhibit prose; third-party press, news and general web content; any authenticated, paid or user-supplied source. **No web or news crawling is authorized.**

**Runtime convenience is not authority.** The runtime's existing 10-record display bound is rejected as methodology (§17.1).

**The source universe is unchanged by this artifact.**

### 24.2 Two-layer form identity model — preserved

```text
LAYER 1 — RAW SOURCE FORM VALUE
  The exact string emitted by the submissions/index source.

LAYER 2 — METHODOLOGY FORM IDENTITY
  The deterministic methodology-controlled identity used for RC mapping.
```

The external filer-manual submission-type vocabulary is **not** identical to the set of raw strings the submissions index emits. Both spellings of a given schedule can coexist in live data. This two-layer separation is preserved from prior mapping work as a compatible general principle.

### 24.3 REFERENCE-DATA LAYER vs METHODOLOGY LAYER — the C/HYBRID separation

The architecture preflight established that these two had been incorrectly entangled. Under C/HYBRID they are separate, and the separation is load-bearing.

| | **REFERENCE / PROVENANCE LAYER** | **METHODOLOGY LAYER** |
|---|---|---|
| Contents | raw source form values · aliases · historical spellings · semantic taxonomy snapshot · snapshot date · source registry version · raw-value registry version | RC1–RC5 definitions · positive RC mapping authority · proposition semantics · closure rules if ever accepted · claim ceiling |
| Nature | An observation of an **open, externally controlled, evolving vocabulary** | A **closed, Owner-governed** semantic contract |
| Completeness | **Never provably complete.** Upstream may add a value at any time | Complete by construction within its own terms |
| Versioned by | registry / snapshot identity | methodology version |
| Changes when | upstream emits something new | the Owner accepts a methodology change |

```text
REFERENCE-DATA INCOMPLETENESS MUST NOT AUTOMATICALLY BECOME METHODOLOGY
FAILURE.

A new source form value is an EXPECTED UPSTREAM EVOLUTION EVENT.
It is NOT automatically a product defect.
It is NOT automatically a methodology defect.
```

Unknown values remain **observable and disclosed**. They degrade coverage metadata. They do not degrade methodology correctness and they do not degrade any established positive fact.

**Consequence — the central one.** Because current Mode D emits no authoritative absence claim (§21.2), **the correctness of Mode D output does not depend on exhaustive reference-data coverage.** An incomplete registry produces a disclosed `PARTIAL` coverage state and nothing worse. This is what ends the four-round correction spiral described in §0.1.

**Recall is a different property from correctness.** An incomplete reference-data instance **may** reduce positive recall: a record that exists in source reality and satisfies an RC definition may resolve to `UNMAPPED`, and the class may consequently remain `NOT_ESTABLISHED` with `PARTIAL` coverage. That is a **recall** cost taken deliberately, disclosed exactly, and bounded by two limits — it never retracts an already-established positive fact, and it never produces an absence claim. Reference-data incompleteness therefore operates on **what the methodology can establish**, never on the world fact and never on methodology authority. Worked scenario and the precise rule: Appendix E, R10 and E.1.

### 24.4 Record classes RC1–RC5 — definitions unchanged

| ID | Functional record class | Rationale |
|---|---|---|
| RC1 | Business-combination registration / solicitation records | Public existence of transaction-class filing activity (P2, P3) |
| RC2 | Current event-disclosure records carrying structured item codes | Dated disclosed events without prose interpretation (P2, P5) |
| RC3 | Annual periodic records | Filing continuity and governance-record availability (P2, P3) |
| RC4 | Quarterly periodic records | Same |
| RC5 | Proxy / solicitation records | Availability of §14 solicitation records (P3) — existence only |

**RC1–RC5 definitions are unchanged by this artifact.** Where a form satisfies a definition as written, it is mapped; a definition is never narrowed to avoid an inclusion.

### 24.5 Mapping contract — C1 … C11

Preserved from prior mapping work as compatible general principles, with C11 added by C/HYBRID.

**C1 — bound identities.** Every execution binds and records the reference-data identities in force: the record-class mapping version, the raw-form-value resolution version, and the semantic taxonomy snapshot identity. All are recorded on every proposition (§8.3), in the Collection Bound (§25), and in the result (§30). Absent or unrecognised identity ⇒ **execution fails closed**.

**C2 — total disposition.** Every encountered raw value receives exactly one disposition from a closed set:

```text
MAP_TO_RC1 | MAP_TO_RC2 | MAP_TO_RC3 | MAP_TO_RC4 | MAP_TO_RC5
MAP_TO_MULTIPLE( RCn, ... )
OUT_OF_BOUND
UNMAPPED / UNRESOLVED
```

**No encountered value may disappear silently, and none requires a judgment call.**

**C3 — amendment rule.** An amendment variant does not inherit its base form's class by suffix syntax. Each is adjudicated in its own right. No semantic equivalence between an amendment and the record it amends is asserted.

**C4 — overlap rule.** A form may map to multiple classes where definitions genuinely overlap, expressed via `MAP_TO_MULTIPLE(...)`, counted once per class, never double-counted as evidence.

**C5 — unknown / future value rule.** A raw value absent from the registry and absent from the taxonomy snapshot resolves to `UNMAPPED / UNRESOLVED`, is disclosed, and forces `PARTIAL` coverage. It produces **no RC assignment**, **no `OUT_OF_BOUND`**, and **no absence claim**, and it retracts **no established positive fact**.

**C6 — bound identity.** The reference-data identities are part of the bound's identity. Executions differing in any of them have different bounds; results are not comparable as identically bounded.

**C7 — validation obligation.** The implementation must prove, without hidden branching:

```text
raw form value → registry lookup → canonical identity or direct disposition
               → adjudicated disposition → record class(es)
               → proposition evaluation → coverage contribution
```

Note the final term. Disposition resolution feeds **coverage**, not absence.

**C8 — exact string equality.** Matching is exact, case-sensitive string equality including internal spaces. Fuzzy matching, normalization, prefix matching, suffix stripping, case folding, whitespace normalization, and pattern or family inference are prohibited absolutely. An alias is accepted only if explicitly listed in the registry.

**C9 — no execution-time relevance judgment.** Prohibited: *if a form seems relevant → PARTIAL* · *if a form looks unrelated → OOB* · *if an engineer recognizes a form → classify it* · *if a model thinks it resembles a proxy → RC5* · *if the code contains "14" → RC5* · *if an unknown form is probably irrelevant → ignore it*. Every disposition is decided **before execution**. At execution time there are only exact-equality lookups.

**C10 — no disposition from absence in a table.** The rule `F ∈ snapshot ∧ F ∉ allowlist → OUT_OF_BOUND` is **abolished and must not reappear in any form**. `OUT_OF_BOUND` requires positive adjudication (§24.6). The default for anything not positively adjudicated is `UNMAPPED / UNRESOLVED`, never `OUT_OF_BOUND`. **Preserved from prior work, and load-bearing under C/HYBRID.**

**C11 — reference-data evolution is not methodology failure.** *(New under C/HYBRID.)* The appearance of a raw form value not present in the reference-data layer is an expected upstream event. It:

- **MAY** degrade collection coverage to `PARTIAL`;
- **MAY** be disclosed as an unresolved raw value;
- **MUST NOT** become `OUT_OF_BOUND` by default;
- **MUST NOT** become an RC assignment by default;
- **MUST NOT** create, imply, or support any absence claim;
- **MUST NOT** retract, weaken, or re-qualify any established positive proposition;
- **MUST NOT** require a new methodology release merely to preserve existing positive facts (FF-G).

A reference-data version mismatch is disclosed as a coverage and comparability fact. It **never silently changes proposition truth** (validator §31.1 #10).

### 24.6 `OUT_OF_BOUND` after C/HYBRID

```text
A form may be OUT_OF_BOUND ONLY IF the methodology positively establishes
that it CANNOT satisfy ANY of RC1, RC2, RC3, RC4, RC5.
```

**Insufficient grounds, each explicitly rejected:** *"not obviously relevant"* · *"not in the table"* · *"different source template or category"* · *"filed by a different issuer class"* · *"unfamiliar"* · *"probably irrelevant"* · *"future form"* · *"not understood"*. The burden is positive adjudication of incapability against all five definitions. Where that burden is not met, the disposition is `UNMAPPED / UNRESOLVED` — never `OUT_OF_BOUND`.

A family-level rule may adjudicate all its members **only** where the family is genuinely homogeneous relative to all five RC definitions. Mixed families are adjudicated per value.

**`OUT_OF_BOUND` has lost its old logical role.** The chain

```text
all non-RC records exhausted → therefore an RC is absent
```

is **prohibited** (§21.3). `OUT_OF_BOUND` may still assist provenance, filtering, positive-recall engineering, and audit explanation. It may **not** generate authoritative absence, and no quantity of `OUT_OF_BOUND` adjudications, however complete, ever amounts to a closure domain.

### 24.7 `UNMAPPED / UNRESOLVED` standard

```text
UNMAPPED / UNRESOLVED means:
  the methodology has NOT positively adjudicated this value against RC1–RC5.

Encounter ⇒ coverage PARTIAL. No exception.
Encounter ⇒ NO RC assignment.
Encounter ⇒ NO OUT_OF_BOUND.
Encounter ⇒ NO absence claim.
Encounter ⇒ NO retraction of any established positive fact.
```

Fail-closed uncertainty is **permitted and preferred**. False `OUT_OF_BOUND` is **prohibited**. Forcing a resolution merely to eliminate `PARTIAL` is **prohibited** — under C/HYBRID, `PARTIAL` costs nothing but disclosure, so the incentive to force a resolution is removed by construction.

#### 24.7.2 Structured-field trap — a field's name is not its semantics

A structured field bearing an expected name may be populated by records other than the record type it appears to describe, carrying entirely different payload semantics. **RC2 membership and P5 extraction may never be inferred from a structured item-code field being non-empty.** Both are driven exclusively by the adjudicated form disposition. A field's *name* never substitutes for its *semantics* (§9, validator §31.1 #26).

This is preserved from prior mapping work as a compatible general principle and is independent of which reference-data instance is in force.

### 24.8 Status of the reference-data instance — NOT ADOPTED by v0.2

```text
v0.2 ADOPTS NO REFERENCE-DATA INSTANCE.
```

v0.2 defines the **contract** that any reference-data instance must satisfy (§24.3, §24.5, §24.6, §24.7). It does **not** accept, ratify, inherit, or re-adjudicate any particular mapping table, raw-value registry, or taxonomy snapshot.

The candidate instance carried by the historical lineage — the record-class adjudication table, the raw-form-value registry and the December-2020 taxonomy snapshot recorded in CORR3 Appendices E and F — is **historical input only**. It is not reproduced here and its adjudications are **not inherited**. IV4 independently established that it contains at least one false `OUT_OF_BOUND` (`ARS`), and further candidates for false or missing adjudication are recorded in the lineage. Those are **reference-data recall defects**, not methodology defects, and under §24.3 they do not compromise methodology correctness.

**No form adjudication is repaired by this act.** `ARS`, `SD`, `F-6`, `F-3ASR`, `424B7`, `D`, `S-1/A` and `POS AM` are explicitly **not** repaired here, by Owner instruction. Reference-data maintenance is a separate, separately versioned activity (§32 items 10, 13, 21).

Adoption of a specific reference-data instance requires its own act and its own Owner acceptance. Until then, an implementation must still satisfy C1 — it records whatever identities were in force — but no identity value is blessed by this methodology artifact.

### 24.9 Declared limitations

1. **The reference-data layer is not exhaustive and cannot be made exhaustive.** It observes an open, externally controlled vocabulary. Unregistered values fail closed to `UNMAPPED` → `PARTIAL`.
2. **The candidate reference-data instance carries known recall defects** (§24.8), not repaired here.
3. **Any bound taxonomy snapshot is dated** and will not contain forms introduced after its edition. Staleness is visible through `UNMAPPED` → `PARTIAL`, never silent.
4. **Beneficial-ownership and insider-transaction records remain outside RC1–RC5 by design.** No semantic proposition is created from them.
5. **No closure domain exists for any record class** (§21.2). This is a permanent limitation of v0.2, not a defect to be closed within it.

---

## 25. Slice-1 Collection Bound Declaration

### 25.1 Register template

```text
COLLECTION BOUND DECLARATION
  boundId · declaredAt · sourceFamily · recordClasses[]
  referenceDataIdentities{ mapping · rawform · snapshot }
  temporalAxis (+ justification) · temporalWindow
  enumerationRule · enumerationCompletenessCheck
  paginationPosture · symmetryRule · engineeringGuard
  coverageRule · propositionClasses[]
  closureDomains[]                  (v0.2: EMPTY — none authorized)
```

### 25.2 Slice-1 declaration

```text
boundId                        SLICE1-BOUND-v0.4
sourceFamily                   issuer-filed structured public filing index
recordClasses                  RC1, RC2, RC3, RC4, RC5
referenceDataIdentities        RECORDED AS IN FORCE AT EXECUTION (C1, C6)
                               No instance adopted by v0.2 (§24.8)
propositionClasses             P1, P2, P3, P4, P5     (P6 excluded — §23.5)
closureDomains                 NONE  — RC1..RC5 closure NOT AUTHORIZED (§21.2)

temporalAxis                   NOT_REQUIRED
  Justification: the bound is defined by record class over the complete index
  the source exposes for the entity at retrieval time. No accepted authority
  supplies a window (CASE-3.4 §11 declines a recency threshold), so declaring
  one would be an invented universal. The evidenceCutoff already bounds the
  result in time. A bound is not a closure domain (§17.2, §21).

enumerationRule                complete enumeration of index records across all
                               index pages the source exposes, with every
                               encountered raw value resolved to exactly one
                               disposition (C2)

enumerationCompletenessCheck   where the source publishes a per-page record
                               count, verified by exact count reconciliation.
                               Mismatch ⇒ coverage PARTIAL.

paginationPosture              ALL_PAGES_CONSULTED
                               Any unconsulted exposed page ⇒ PARTIAL.

symmetryRule                   identical recordClasses and identical reference-
                               data identities executed for Acquirer and Target.
                               Asymmetric execution ⇒ PARTIAL or fail closed.

engineeringGuard               permitted for pathological responses. Any
                               truncation ⇒ PARTIAL, truncation recorded.
                               A guard never redefines the bound.

coverageRule                   §16.3. Any UNMAPPED/UNRESOLVED ⇒ PARTIAL.
                               OUT_OF_BOUND never by itself forces PARTIAL.
                               NO coverage state authorizes absence (§16.2).
```

**Bound identity derivation.** The bound identity advances from the historical `SLICE1-BOUND-v0.3` because C6 makes proposition semantics and the coverage rule part of the bound's identity, and both changed under C/HYBRID. This is a mechanical consequence of an existing accepted rule, not a new normative decision.

---

## 26. Artifact identity vs retention boundary — D2

```text
ARTIFACT RETENTION POLICY:
DEFERRED / OUTSIDE THIS METHODOLOGY ACT
```

**What Mode D requires:** canonical source identity; artifact / content identity; exact locator; digest where content identity uses a digest; retrieval provenance; exact evidence cutoff.

**Execution fact vs retention policy.** Where execution requires temporary bytes to compute content identity or read a structured field, **that is an execution fact, not a retention policy.**

**Not decided here:** body preservation · retention period · deletion policy · permanent artifact storage · locator-only versus stored-body policy · storage vendor, provider or location · persistence duration · any customer-facing retention or reproducibility guarantee.

Constraints the future retention authority must honour, none resolved here: `29` §65; `44`; `29` §9; `18` §60 and `19` §154–§155.

> Reference-data identities (§24.3) are **methodology-artifact identities** bound at authoring time. They are not evidence, not retrieved analysis artifacts, and carry no retention implication.

---

## 27. Fail-closed states

| Condition | State |
|---|---|
| Source cannot be retrieved | `SOURCE_UNAVAILABLE`; propositions depending solely on it are **not established** (§16.4). P3 emits nothing; P4 may carry `NOT_ESTABLISHED_WITHIN_BOUND` **only with an explicit source-unavailable qualification**; rendering must foreground unavailability and **must not imply a completed search** (§16.4.1, §23.4.1, §22.2) |
| Any encountered raw value resolves to `UNMAPPED / UNRESOLVED` | coverage `PARTIAL` — **no** RC, **no** OOB, **no** absence, **no** retraction |
| Encountered value resolves to `OUT_OF_BOUND` | **no coverage effect · no absence effect** |
| Any exposed page not consulted | coverage `PARTIAL` |
| Enumeration reconciliation fails | coverage `PARTIAL` |
| Engineering guard truncates enumeration | coverage `PARTIAL`, truncation recorded |
| Asymmetric execution across sides | coverage `PARTIAL` or fail closed |
| Any reference-data identity absent / unrecognised / mismatched | execution **fails closed** (C1) |
| Qualifying record established | `ESTABLISHED_WITHIN_BOUND` — **monotonic** (§11A) |
| No qualifying record established | `NOT_ESTABLISHED_WITHIN_BOUND` — **no absence authority** |
| Coverage reaches `COMPLETE_WITHIN_BOUND` with no qualifying record | still `NOT_ESTABLISHED_WITHIN_BOUND` — **never absence** (§21, Case C) |
| Proposition class outside the declared bound | `OUT_OF_BOUND` (result state) |
| Required structured field absent from source schema | proposition **not in scope** — no result state |
| Field published with a legitimately empty value | `ESTABLISHED_WITHIN_BOUND` — never a non-establishment state |
| Predeclared methodology classification | `NOT_PUBLICLY_OBSERVABLE` |
| Incompatible admissible propositions at matched scope and time | `CONFLICT_CANDIDATE` |
| Required provenance field absent | proposition **not emitted** |
| Structured-field binding fails | proposition **not emitted** |
| Source not competent for the proposition | proposition **not emitted** |
| Absence claim attempted without an authorized closure domain | **fails closed** (§21) |
| Mechanism or Environment claim attempted | block fails closed |
| Materiality not authorized | evidence gap shown; **materiality and "why it matters" withheld** |
| Recommended action exceeds evidence-acquisition scope | **fails closed** — action not emitted (§20.5) |

**Every unmet condition produces a declared state.** None produces a weakened, hedged, or partial claim, and none produces an absence claim.

---

## 28. Prohibited inference

No synthetic respondent · no questionnaire fabrication · no fact → Environment shortcut · no structure → behavior shortcut · no resource → Environment shortcut · no closest-fit classification · no forced winner · no numeric edge weight, confidence percentage, or invented score · no discriminator-relative support class · no aggregate-facts → mechanism promotion · **no non-establishment → absence inference** · **no `COMPLETE_WITHIN_BOUND` → absence inference** · **no `OUT_OF_BOUND` exhaustion → absence inference** · **no unknown → `OUT_OF_BOUND` inference** · **no unknown → RC inference** · **no unknown → absence inference** · **no "no known match" → "none exists" inference** · **no coverage degradation → retraction of an established positive fact** · **no reference-data version mismatch → silent change of proposition truth** · no absence → adverse inference · no missingness → materiality inference · no record-class presence → transaction characterization · no structured-field population → RC2 or P5 inference · no "not in table" → `OUT_OF_BOUND` inference (C10) · no prose field → structured semantic authority · no execution-time form-relevance judgment (C9) · no self-description → behavioral truth shortcut · no raw model prose as report authority · no client-side analytical truth · no private, questionnaire, or user-supplied evidence · no human-analyst dependency · no deal verdict, valuation opinion, deterministic loss estimate, employment recommendation, or named-person behavioral forecast · no internal Environment code in public output · no model-provider binding in methodology.

---

## 29. Non-regression

| Invariant | Status | Held by |
|---|---|---|
| RC1–RC5 definitions | **UNCHANGED** | §24.4, §24.6 |
| P1 | **UNCHANGED** | §23.1, §23.4 |
| P2 | **UNCHANGED in definition**; non-establishment state renamed as a mechanical consequence of §15 | §23.1 |
| P3 | **ACTIVE MEANING UNCHANGED from v0.2.** Measured against the historical CORR3 P3, three bounded changes, all consequences of the Owner C/HYBRID decision: (1) within-bound wording **re-anchored** to evidence lawfully recognized; (2) **non-establishment state no longer emitted by P3** — P3 is positive-only, and the class-level not-established state is carried by P4 alone; (3) positive establishment **explicitly monotonic** under §11A. Fully disclosed at §23.2.1 | §23.2, §23.2.1 |
| P4 | **CHANGED BY OWNER DECISION** — now a non-negative `NOT_ESTABLISHED` state | §23.3, §35 |
| P5 | **UNCHANGED in every respect**; still never yields a non-establishment state | §15.6, §23.1 |
| P6 | **REMAINS INACTIVE / DEFERRED**; not reactivated | §23.5 |
| `supportClass` | **REMAINS ABSENT**, not replaced | §8.3 |
| D1 factual ceiling | **UNCHANGED / CLOSED** | §4.1 |
| D2 artifact retention | **REMAINS DEFERRED** | §4.3, §26 |
| Block 10 | **REMAINS `LIMITED`** under zero-materiality logic | §22.1 |
| P1–P5 materiality | **ALL REMAIN `MATERIALITY_NOT_AUTHORIZED`** | §19, App. B |
| Report block order | **UNCHANGED** — canonical 12, same order | §22 |
| Report availability enums | **UNCHANGED** — no new enum created | §22, `19` §87 |
| Source universe | **UNCHANGED** | §24.1 |
| `temporalAxis` | **UNCHANGED** — `NOT_REQUIRED`, same justification | §25.2 |
| Evidence provenance requirements | **UNCHANGED** | §8.3, §18 |
| Contradiction firewall | **UNCHANGED**; explicitly not weakened by C/HYBRID | §14, §14.3 |
| Commercial sequencing | **UNCHANGED** | §22.1, §33 |
| Registered-FREE boundary | **UNCHANGED / out of scope** | §2, §4.2 |
| Questionnaires boundary | **UNCHANGED / out of scope** | §2, §33 |
| Final Report Free PDF boundary | **UNCHANGED / out of scope** | §2 |
| Private evidence boundary | **UNCHANGED / out of scope** | §2, §33 |
| Paid-scope logic | **UNCHANGED / out of scope** | §2, §33 |
| No Environment authority · no ECS · no friction · no forecast · no economic prediction | **PRESERVED** | §7.2, §22 |
| No synthetic respondents · no questionnaire fabrication | **PRESERVED** | §5, §28 |
| Exact provenance / locator / excerpt · atomicity · scope preservation | **PRESERVED** | §8.1, §8.3 |
| Source competence, including schema competence | **PRESERVED**, extended by §10.2 rule 5 | §10, App. A |
| Temporal honesty | **PRESERVED** | §18 |
| Uncertainty preservation | **PRESERVED and strengthened** | §15, §16, §21 |
| Empty published value never becomes absence | **PRESERVED** | §15.6 |
| Fail closed | **PRESERVED** | §27 |
| Internal codes never public | **PRESERVED** | §28 |
| No new evidence taxonomy, classifier, Core object, confidence score, report block, or availability enum | **PRESERVED** | §22, §28 |
| `OOB` requires positive adjudication | **PRESERVED** | §24.6, C10 |
| Coverage not redefinable by engineering | **PRESERVED** | §16.3 |
| **Positive facts monotonic against unrelated unknowns** | **NEW — C/HYBRID** | §11A |
| **No absence authority without a proven closure domain** | **NEW — C/HYBRID** | §21 |
| **Reference-data incompleteness is not methodology failure** | **NEW — C/HYBRID** | §24.3, C11 |

### 29.1 Mechanical reference changes, disclosed

*Corrected in CORR1 (F-1). v0.2 declared "exactly three" propagations and omitted P3's; the true count is four.*

Exactly **four** mechanical changes propagate from the Owner decision. Each is listed so that independent verification can confirm nothing else moved:

1. `MISSING_WITHIN_BOUND` → `NOT_ESTABLISHED_WITHIN_BOUND` in the active result-state vocabulary, and correspondingly in **P2's and P4's** non-establishment state. Derivation: §15.4.
2. The collection axis is re-roled from completeness-as-authority to coverage-as-metadata; member names `COMPLETE_WITHIN_BOUND` / `PARTIAL` / `SOURCE_UNAVAILABLE` are **unchanged**. Derivation: §16.
3. `SLICE1-BOUND-v0.3` → `SLICE1-BOUND-v0.4`, because C6 makes the changed semantics part of the bound identity. Derivation: §25.2.
4. **P3 propagation — three parts.** Derivation: §23.2.1.
   - **4a.** P3's historical *"within the declared bound"* wording is re-anchored to *"from the evidence lawfully recognized"*. This re-anchoring is **document-wide**, not P3-specific (§15.2, §20.1, §20.3, §22.1, §23.3, §34); it is itemized here because it is part of what changed for P3.
   - **4b.** P3 **no longer emits a non-establishment state of its own.** Historically it emitted `MISSING_WITHIN_BOUND` on non-establishment (§15.4); it is now positive-only. The class-level not-established state is carried by **P4 alone**. P2's `NOT_ESTABLISHED_WITHIN_BOUND` is record-instance-level and is a different question.
   - **4c.** P3's positive establishment is **explicitly monotonic** under §11A.

None of the four is an independent new semantic. Each derives from the Owner C/HYBRID decision at §0.2. In particular, 4b follows from *"P4 SHALL BECOME A NON-NEGATIVE NOT-ESTABLISHED STATE"*: with P4 carrying that state, a parallel class-level emission from P3 would be redundant and would reintroduce the negation the separation exists to prevent.

The field name `gapState` is **not** changed (§8.3 note). No other field, enum member, block, contract reference, or proposition definition is altered.

### 29.2 CORR1 non-regression

CORR1 is a **documentation-only** correction. The following independently verified v0.2 verdicts are unaffected by it, and every one was re-checked against the corrected text:

| IV1 verdict | Status after CORR1 | Basis |
|---|---|---|
| Owner-decision fidelity `FAITHFUL` | **UNCHANGED** | §0.2 not reopened; no option re-comparison; no weakening or strengthening |
| `P4_VERDICT` `SOUND` | **UNCHANGED** | §23.3 and §35 untouched in substance; P4 remains `NOT_ESTABLISHED` only, non-negative, sole class-level carrier (§23.2.1) |
| `CASE_C_VERDICT` `SOUND` | **UNCHANGED** | App. C.5 untouched; `COMPLETE_WITHIN_BOUND` still never upgrades to absence |
| `MONOTONICITY_VERDICT` `SOUND` | **UNCHANGED** | §11A untouched |
| `MONOTONICITY_LIMIT_VERDICT` `SOUND` | **UNCHANGED** | §11A.2 untouched; FF-H preserved and reinforced at §16.4.1 and §23.4.1 |
| `P2_CHANGE_VERDICT` `OPTIONAL_BUT_COMPATIBLE` | **UNCHANGED** | P2 definition untouched |
| `ENUM_RENAME_VERDICT` `NECESSARY` | **UNCHANGED** | §15.4 untouched |
| `REFERENCE_DATA_AUTHORITY_VERDICT` `CLEAR` | **UNCHANGED** | §24.3 separation untouched; one consistency sentence added, authority unaltered |
| `REFERENCE_DATA_EFFECT_VERDICT` `OVERSTATED_BUT_SAFE` | **CORRECTED — no longer overstated** | R10 and E.1 (F-3). The safety property was already present in C11; only the summary wording was broad |
| `BOUND_SUFFIX_VERDICT` `SOUND` | **UNCHANGED** | `_WITHIN_BOUND` convention preserved throughout |
| `AXIS_SEPARATION_VERDICT` `SOUND` | **UNCHANGED** | §16.1 untouched; §16.4.1 clarifies the single §16.4 dependency without widening it |
| `COVERAGE_COMPUTATION_VERDICT` `SOUND_AS_METADATA` | **UNCHANGED** | §16.3 untouched; no new coverage enum |
| `OOB_ROLE_VERDICT` `SOUND` | **UNCHANGED** | §24.6 untouched |
| `REFERENCE_INSTANCE_VERDICT` `VALID_SEPARATE_DEPENDENCY` | **UNCHANGED** | §24.8 untouched; no instance adopted |
| `REPORT_CONTRACT_VERDICT` `COMPATIBLE` | **UNCHANGED** | Block order, availability enums and `19` §87 untouched; §20.5 restates an existing boundary |
| `D1_VERDICT` `INTACT` | **UNCHANGED** | §4.1 untouched |
| `D2_VERDICT` `SAFELY_DEFERRED` | **UNCHANGED** | §4.3, §26 untouched |
| `CLOSURE_AUTHORITY_VERDICT` `ZERO_ACTIVE` | **UNCHANGED** | §21.2 untouched; RC1–RC5 closure remains `NOT AUTHORIZED` |
| `NEGATION_FIREWALL_VERDICT` `SOUND` | **UNCHANGED** | §21.3, §23.2, validators #1/#34 untouched |
| `NOT_PUBLICLY_OBSERVABLE_VERDICT` `SOUND` | **UNCHANGED** | §15.2 untouched |
| `VALIDATOR_SPEC_VERDICT` `CAUSALLY_SUFFICIENT` | **UNCHANGED** | All 34 validators preserved verbatim in force; one added (#35) |
| `FORCED_FAILURE_VERDICT` `COHERENT` | **UNCHANGED** | FF-A … FF-H preserved verbatim; none added, none removed |

**Zero architecture drift.** CORR1 adds no proposition state, no coverage enum, no report block, no availability enum, no closure domain, no reference-data instance, and no materiality. It removes and weakens nothing.

---

## 30. Engineering implementation contract

**Definition only. This artifact authorizes no implementation.**

```text
INPUT
  ordered resolved Acquirer + Target public identities (contract 18)
  accepted Source Competence Register (App. A)
  accepted Mapping Contract (§24.5 C1–C11)
  a reference-data instance, separately versioned and separately accepted
    (§24.8 — none adopted by v0.2)
  accepted Slice-1 Collection Bound Declaration (§25)
  accepted Materiality Register (App. B)

OUTPUT
  server-authoritative bounded factual public-evidence projection

ACTIVE CLAIM LEVELS   A + B′
ACTIVE PROPOSITIONS   P1, P2, P3, P4, P5   (P6 NOT INCLUDED)
AUTHORIZED ABSENCE    NONE

MUST INCLUDE
  exact pair identity · source family
  per-record rawFormValue, canonicalFormIdentity, formDisposition, record class(es)
  all reference-data identities in force
  canonical locator · artifact identity as applicable
  filed date · retrievedAt · evidenceCutoff
  collection bound identity · coverage state per §16.3
  explicit list of any UNMAPPED/UNRESOLVED raw values encountered
  proposition result state · provenance
  report block availability (all twelve blocks)

MUST NOT INCLUDE
  any authoritative record-class absence claim
  any statement that a record does not exist or was not filed
  any numeric zero presented as a record-class count without an explicit
    "established" qualifier
  mechanism inference · Environment / ECS / friction / forecast
  transaction characterization from record-class presence
  materiality assertion for any MATERIALITY_NOT_AUTHORIZED class
  counterparty identity from the structured index or a prose field
  supportClass or any discriminator-relative support value
  RC2 or P5 inference from structured-field population
  execution-time form-relevance judgment
  private evidence · questionnaire data · human analyst dependency
```

**Allowed automation:** retrieval within the declared bound; content-identity computation; structured-field reading; exact registry and adjudication-table lookups; deterministic disposition resolution; schema/enum/date validation; enumeration reconciliation; coverage computation under §16.3; proposition result-state computation; conflict-candidate detection at matched scope and time; channel mapping; projection assembly.

**Prohibited automation:** DE-1/2/3 assignment; mechanism inference; Environment/ECS/friction/forecast production; materiality computation outside App. B; contradiction resolution; confidence scoring; count-based bound substitution; any relevance, similarity, pattern, prefix-family or heuristic classification of a form value; any derivation of a disposition from a form's absence from a table; **any derivation of an absence claim from any source whatsoever**; **any retraction of an established positive proposition on coverage grounds**; reference-data changes outside a declared version; client-side analytical truth; any raw-model-prose-to-screen path.

**Required structural separation.** Proposition truth and collection coverage must be computed and stored as **independent** values. An implementation in which a coverage state is an input to a proposition-truth computation — other than the single §16.4 dependency — violates this contract regardless of its observable output.

**Stopping point:** authoritative projection plus renderer.

---

## 31. Required validators and forced-failure tests

**Methodology-only specification. Nothing in this section is implemented by this act.**

### 31.1 Required validators

A future validator suite must **FAIL** if any of the following holds.

| # | Validator | Must fail when |
|---|---|---|
| **1** | **P4 non-negativity** | P4 active text, enum member, schema description, API field, or report copy says "absence", "missing", "not filed", "does not exist", or any equivalent |
| **2** | **Completeness ≠ absence authority** | `COMPLETE_WITHIN_BOUND` directly or transitively authorizes an absence claim |
| **3** | **PARTIAL non-retraction** | `PARTIAL` coverage retracts, weakens, hedges, or removes an already-established positive RC proposition |
| **4** | **Unknown ≠ OOB** | An unknown raw form value automatically becomes `OUT_OF_BOUND` |
| **5** | **Unknown ≠ RC** | An unknown raw form value automatically becomes an RC assignment |
| **6** | **Unknown ≠ absence** | An unknown raw form value automatically creates or supports an absence claim |
| **7** | **No-known-match firewall** | "No known match" is rendered, stored, or reasoned about as "none exists" |
| **8** | **OOB-exhaustion firewall** | `OUT_OF_BOUND` exhaustion is used to infer absence without an accepted closure domain |
| **9** | **New-code monotonicity** | A new source form code causes previously established unrelated positive facts to be removed, downgraded, or re-qualified |
| **10** | **Reference-data version firewall** | A reference-data version mismatch silently changes proposition truth |
| **11** | **P4 non-materiality** | P4 becomes material, adverse, ranked, prioritized, or urgency-framed |
| **12** | **Closure-authority firewall** | Any RC closure is marked active without explicit future Owner-accepted methodology authority |
| 13 | Claim ceiling | Any Level C–H claim reaches output |
| 14 | Provenance completeness | Any proposition lacks a required provenance field |
| 15 | Identity binding | Any proposition or result omits a reference-data identity in force |
| 16 | Exhaustive disposition | Any encountered raw value fails to resolve to exactly one disposition, or disappears |
| 17 | Disposition determinism | The same raw value under the same identities yields different dispositions |
| 18 | Materiality firewall | A `MATERIALITY_NOT_AUTHORIZED` class produces a materiality or "why it matters" claim |
| 19 | Empty-value firewall | An empty published value becomes a non-establishment state; or P5 emits a non-establishment state on any path |
| 20 | Exact-match firewall | Any prefix, substring, normalized, whitespace-stripped, case-folded or pattern matching exists in the resolution path |
| 21 | Coverage determinism | Coverage is computed from anything other than §16.3 — relevance, severity, or judgment input |
| 22 | Bound comparability | Results under differing identities are presented as identically bounded |
| 23 | No-heuristic firewall | Any similarity, pattern, keyword or model-judgment classification of form values exists |
| 24 | Explicit-adjudication firewall (C10) | Any code path derives `OUT_OF_BOUND` from absence in a table |
| 25 | Unadjudicated-to-UNMAPPED | Any unadjudicated value resolves to anything other than `UNMAPPED` |
| 26 | Field-semantics firewall | RC2 membership or a P5 value is inferred from a structured field being non-empty |
| 27 | Alias-registry firewall | A raw alias resolves through anything but an exact authorized registry entry |
| 28 | Support-class firewall | Any discriminator-relative support value enters a Mode-D record |
| 29 | Prose-field firewall | A free-text descriptive field grounds a structured semantic proposition |
| 30 | Axis-independence | A coverage state is an input to a proposition-truth computation, other than the single §16.4 dependency |
| 31 | Zero-count firewall | A bare numeric zero is rendered as a record-class count without an explicit "established" qualifier |
| 32 | Retired-vocabulary firewall | `MISSING_WITHIN_BOUND` appears anywhere other than as documented superseded lineage |
| 33 | Report-copy firewall | Any rendering of `NOT_ESTABLISHED_WITHIN_BOUND` admits an absence reading (§22.2) |
| 34 | Legacy-negation firewall | P4 is implemented, stored, or serialized as the boolean negation of P3 (§23.2) |
| **35** | **Source-unavailable rendering firewall** *(added by CORR1 / F-4)* | Coverage is `SOURCE_UNAVAILABLE` for a source/side **and** any of: copy asserts that evidence was examined, searched, reviewed, or found — including *"not established from the public evidence this analysis examined"*; the result state is rendered without an explicit source-unavailable qualification; the unavailability is not foregrounded ahead of the state it qualifies; the rendering implies a completed search; P3 emits any non-establishment proposition; or a cached or prior-run proposition is presented as current-run truth (§16.4.1, §22.2, §23.4.1, FF-H) |

**Validators 1–34 are preserved verbatim and unweakened.** #35 is additive and specifies documentation-level behavior only. **Nothing in this section is implemented by this act.**

### 31.2 Required forced-failure tests

Each case must be **rejected or fail closed**. None is implemented by this act.

| ID | Case | Required outcome |
|---|---|---|
| **FF-A** | `10-K` established, then `UNKNOWN-X` encountered; implementation downgrades, hedges, or withdraws RC3 `ESTABLISHED` | **FAIL** |
| **FF-B** | No RC3 established, coverage `COMPLETE_WITHIN_BOUND`; implementation emits RC3 `ABSENT` | **FAIL** |
| **FF-C** | Unknown code not in the registry; implementation marks it `OUT_OF_BOUND` by default | **FAIL** |
| **FF-D** | No matching RC1 form; implementation renders *"No transaction-class filing exists"* | **FAIL** |
| **FF-E** | P4 `NOT_ESTABLISHED`; report copy interprets it as a negative, adverse, cautionary, or risk-coloured signal | **FAIL** |
| **FF-F** | Coverage `PARTIAL`; implementation removes an already-established RC5 from the report | **FAIL** |
| **FF-G** | A future source code appears; methodology requires a new release merely to preserve existing positive facts | **FAIL** |
| **FF-H** | Actual source retrieval failure; implementation nonetheless preserves a proposition that depended solely on the unavailable source | **FAIL** |

**FF-H is load-bearing in the opposite direction from FF-A.** It exists so that monotonicity is not misread as evidence immortality (§11A.2). FF-A protects a fact that *was* established; FF-H forbids preserving a fact that *never was*.

Retained base set, each rejected or fail-closed: inject a Level-C mechanism claim · inject an Environment claim · inject an ECS value · inject a forecast · corrupt artifact identity · remove a provenance field · asymmetric collection · client-side block upgrade · conflict auto-resolution · private-evidence ingestion · questionnaire-evidence ingestion · classify a free-text-derived proposition as B′ · produce counterparty identity from the index or a prose field · engineering-guard truncation without `PARTIAL` · present a legitimately empty published value as non-established · resolve a raw value by prefix, substring, case-folded or whitespace-stripped matching · assign an unenumerated amendment variant its base class by suffix stripping · force `PARTIAL` solely because an `OUT_OF_BOUND` form was encountered · suppress `PARTIAL` for an `UNMAPPED` form because it "looks irrelevant" · reclassify `UNMAPPED` → `OUT_OF_BOUND` at runtime · execute with an absent or mismatched identity · compare results across differing identities as identically bounded · force a resolution for an unresolved form merely to avoid `PARTIAL`.

**No test is implemented in this act.**

---

## 32. Deferred methodology questions

| # | Deferred item | Becomes live when |
|---|---|---|
| 1 | Artifact retention policy, duration, deletion, storage, reproducibility (D2) | Retention authority acts (§26) |
| 2 | P6 — counterparty identity | A separate act activates free-text class-B extraction |
| 3 | Predictive temporal admissibility | First act proposing a forecast or timing claim |
| 4 | Environment support from public documentary evidence | Calibration supplies validated discriminators |
| 5 | DE-1/2/3 production automation | A governed substitute for `CASE-3.4` §5.10 exists |
| 6 | Mechanism watchpoints | Same |
| 7 | Free-text class-B extraction | A separate act activates it |
| 8 | Public press / news competence | A competence rule is authored |
| 9 | Materiality authority for any Slice-1 class | Methodology authority establishes it |
| 10 | Adoption of a specific reference-data instance | A separate reference-data act, with its own Owner acceptance (§24.8) |
| 11 | Repair of individual form adjudications (`ARS`, `SD`, `F-6`, `F-3ASR`, `424B7`, `D`, `S-1/A`, `POS AM`, near-miss and boundary families) | The same reference-data act. **Not a methodology blocker** (§24.3) |
| 12 | Semantic taxonomy snapshot refresh | Same |
| 13 | Raw-value registry expansion | Same |
| 14 | **RC1 closure domain** | Future Owner-accepted methodology supplying a mechanical proof (§21.4) |
| 15 | **RC2 closure domain** | Same |
| 16 | **RC3 closure domain** | Same |
| 17 | **RC4 closure domain** | Same |
| 18 | **RC5 closure domain** | Same |
| 19 | Private evidence | Level 4 |
| 20 | Questionnaire evidence | Level 3 |
| 21 | Account / workspace persistence, registered-FREE behavior | Level 2 |
| 22 | Paid workflow, pricing, commercial tiering | Level 4 |
| 23 | Analyst release | Level 4 |
| 24 | 42Q | Named-leader forecast request only |
| 25 | Forecast lock / seal | Forecast authority exists |

---

## 33. Relationship to future internal / paid evidence

**Mode D produces the anonymous public baseline.** Private evidence never enters Mode D. Questionnaire evidence never enters Mode D. Mode A is unchanged and Mode D may not read from, write into, or simulate the respondent evidence model. When internal or private evidence later arrives, the Mode D baseline remains **separately identifiable and is not overwritten**. Blocks deepen in place; no second report universe is created. **Mode D grants no authority to Mode B.** Commercial sequencing of later levels is outside this artifact and is unchanged by it.

---

## 34. Active semantic reference table

The single table an implementer or auditor should be able to read in isolation.

| STATE | MEANS | EFFECT OF AN UNKNOWN / UNMAPPED VALUE | MAY AUTHORIZE ABSENCE |
|---|---|---|---|
| **RC PRESENT / `ESTABLISHED_WITHIN_BOUND`** | Qualifying competent evidence exists for this record class | **Does not retract it.** The positive fact stands (§11A) | n/a — it is a positive claim |
| **RC `NOT_ESTABLISHED_WITHIN_BOUND`** | No qualifying evidence has been established from lawfully recognized evidence | State remains **non-negative**; **no absence inference** of any kind | **NO** |
| **`CONFLICT_CANDIDATE`** | Two certified propositions incompatible at matched scope and time | No effect | **NO** |
| **`NOT_PUBLICLY_OBSERVABLE`** | Predeclared method classification: this proposition class is not of a kind public sources disclose | No effect | **NO** |
| **`OUT_OF_BOUND`** (result state) | The proposition class lay outside the declared bound | No effect | **NO** |
| **COVERAGE `COMPLETE_WITHIN_BOUND`** | The declared collection procedure completed according to its coverage contract | An unknown value prevents this state and yields `PARTIAL` | **NO** — coverage/provenance only |
| **COVERAGE `PARTIAL`** | A known collection limitation exists | This is the normal cause of `PARTIAL` | **NO** |
| **COVERAGE `SOURCE_UNAVAILABLE`** | The source could not be retrieved for the side | n/a | **NO** — but propositions depending solely on it are not established (§16.4) |
| **`UNKNOWN` / `UNMAPPED` RAW VALUE** | The source value has not been semantically adjudicated | Coverage / provenance only; **no OOB, no RC, no absence inference by default** | **NO** |
| **`OUT_OF_BOUND`** (form disposition) | Positively adjudicated as incapable of satisfying any RC definition | n/a | **NO** — and no quantity of these amounts to closure (§24.6) |

**Effect of `PARTIAL` on an established positive fact: NONE**, unless that fact depended on evidence that was invalid or never retrieved (§16.4, §11A.2).

> **Precision note (CORR1 / F-3).** The `UNKNOWN / UNMAPPED` row's *"coverage / provenance only"* describes its effect on **already-established** propositions and on absence authority, where the effect is nil. It does **not** mean an unadjudicated value is without consequence for **recall**: a real record whose raw value is unrecognized resolves to `UNMAPPED`, is not counted toward its class, and — absent another qualifying record — leaves that class `NOT_ESTABLISHED` with `PARTIAL` coverage. That is a bounded, disclosed recall cost, never a claim about the world and never a retraction. See Appendix E, R10 and E.1.

> **Source-unavailable note (CORR1 / F-4).** The `COVERAGE SOURCE_UNAVAILABLE` row's *"propositions depending solely on it are not established"* carries a rendering obligation as well as a state: no examination occurred, so no copy may imply one. See §16.4.1, §23.4.1, §22.2 and validator #35.

---

## 35. P4 migration table

| | |
|---|---|
| **OLD P4** | *"Declared absence, within the declared bound, of each declared record class"* → `MISSING_WITHIN_BOUND` |
| **WHY UNSAFE** | It asserted absence. Its precondition was a **global closed-world completeness gate** over an **open, externally controlled** form vocabulary. That gate was unreachable in practice (IV4: 8 of 9 issuers `PARTIAL`), and every attempt to make it reachable produced false `OUT_OF_BOUND` adjudications — which is to say, **false absence**. Guard rails denying "≠ absent · ≠ false · ≠ zero" could not overcome a stem that asserts deficiency in the world |
| **OWNER DECISION** | *"P4 SHALL BECOME A NON-NEGATIVE NOT-ESTABLISHED STATE."* The semantic change is from an **ontological** claim about the world to an **epistemic** claim about the search |
| **NEW P4** | **Whether a qualifying record of each declared record class has been established.** Active meaning: *"No qualifying record for this record class has been established from the evidence that the methodology has lawfully recognized."* Active state: `NOT_ESTABLISHED_WITHIN_BOUND` |
| **PRESERVED GUARDS** | not established ≠ false · ≠ zero · ≠ no · ≠ negative evidence · ≠ adverse · ≠ suppressed · ≠ concealed · ≠ material · ≠ important · ≠ priority. All retained verbatim in force, and joined by the primary one: **≠ absent** |
| **NEW GUARDS** | P4 is not a negated P3 (§23.2) · P4 may not be a boolean `false` (§23.2, validator #34) · P4 may not be rendered as a bare zero count (§22.2, validator #31) · `COMPLETE_WITHIN_BOUND` does not upgrade P4 into absence (§21, Case C) |
| **DOWNSTREAM CONSEQUENCE** | Where the source **was retrieved**, the report **may** say *not established from the evidence this analysis examined*. Where coverage is `SOURCE_UNAVAILABLE` that wording is **prohibited** — no examination occurred — and the report must instead disclose the unavailability (§16.4.1, §22.2, §23.4.1, validator #35). In neither case may the report say *absent*, *not filed*, *none*, *zero*, or *no such record exists*. Materiality status is unchanged: `MATERIALITY_NOT_AUTHORIZED`. Block 10 remains `LIMITED` |
| **LINEAGE DISPOSITION** | `MISSING_WITHIN_BOUND` is retired from the active vocabulary and retained as superseded lineage only (§15.4, validator #32) |

---

## 36. Completeness migration table

| | |
|---|---|
| **OLD ROLE** | **Global gate for bounded absence authority.** `COMPLETE_WITHIN_BOUND` was the precondition that licensed P4 to declare absence within the bound. Coverage state and proposition truth were entangled on one axis, so any coverage deficiency anywhere could contaminate every claim |
| **WHY UNSAFE** | It applied closed-world reasoning to an open, externally controlled vocabulary. Reaching it required adjudicating every emitted value — which produced false `OUT_OF_BOUND`. Not reaching it made the system emit `PARTIAL` almost always. Both branches were defective, and the defect was in the role, not the computation |
| **OWNER DECISION** | *"COMPLETE_WITHIN_BOUND SHALL BE COVERAGE/PROVENANCE METADATA, NOT ABSENCE AUTHORITY."* |
| **NEW ROLE** | **Coverage / provenance metadata.** It records that the declared collection procedure completed according to its coverage contract. It authorizes nothing about the world |
| **STILL USEFUL FOR** | auditability · source and retrieval disclosure · declared limitations · reproducibility context · diagnostics · reference-data staleness visibility · comparability of two executions under identical identities |
| **NO LONGER USEFUL FOR** | proving absence · negating a record class · authorizing P4 · invalidating an unrelated established positive fact · gating a positive claim |
| **MEMBER NAMES** | **Unchanged** — `COMPLETE_WITHIN_BOUND` · `PARTIAL` · `SOURCE_UNAVAILABLE`. Only the role changed |
| **COMPUTATION** | Unchanged in substance (§16.3), with the identity clause generalized to whatever reference-data identities are in force (C1) |
| **CRITICAL CONSEQUENCE** | `COMPLETE_WITHIN_BOUND` **alone must not resurrect absence semantics.** A collection may complete perfectly and still establish nothing about what exists (§21, Case C) |

---

## 37. Terminal candidate status

```text
LEVEL1-MODE-D-COMPLETENESS-SEMANTICS-DELTA-1.CORR1
  = v0.2 CORR1 AUTHOR CANDIDATE READY FOR TARGETED INDEPENDENT VERIFICATION

MODE D                        CANDIDATE / NOT OWNER-ACCEPTED
                              NOT INDEPENDENTLY VERIFIED AFTER CORR1
C/HYBRID ARCHITECTURE         OWNER-DECIDED / INCORPORATED / IV1-VERIFIED AT v0.2
                              NOT REOPENED BY CORR1
IV1 ON v0.2                   PASS — BLOCKING 0 / MAJOR 0 / MINOR 4 / ADVISORY 1
CORR1 SCOPE                   F-1 … F-4 CORRECTED (§0.4). DOCUMENTATION ONLY
CORR1 ADVISORY A-1            NOT CLOSED / REMAINS OPEN (§0.4)
D1 FACTUAL CEILING            OWNER-ACCEPTED / CLOSED / NOT REOPENED
D2 ARTIFACT RETENTION         DEFERRED / OUTSIDE THIS METHODOLOGY ACT
SOURCE COMPETENCE REGISTER    CANDIDATE (App. A)
MATERIALITY REGISTER          CANDIDATE (App. B)
                              SLICE-1 RESULT: NO MATERIALITY-AUTHORIZED DECISION GAP CLAIMS
MAPPING CONTRACT              CANDIDATE — §24.5 C1–C11
REFERENCE-DATA INSTANCE       NONE ADOPTED (§24.8)
SLICE-1 COLLECTION BOUND      CANDIDATE — SLICE1-BOUND-v0.4 (§25)
RC1..RC5 CLOSURE DOMAINS      NOT AUTHORIZED (§21.2)
AUTHORITATIVE ABSENCE CLAIMS  ZERO

IV1 F-1 … F-6                 CLOSED (historical lineage)
IV2 G-1 / G-2 / G-3           SUPERSEDED / CLOSED / CONTAINED (historical lineage)
IV3 V-1 … V-5                 SUPERSEDED BY ARCHITECTURE CHANGE (historical lineage)
IV4 findings                   RECLASSIFIED AS REFERENCE-DATA RECALL, NOT METHODOLOGY
                              DEFECTS (§24.8) — not repaired in this act
IV1 ON v0.2 / F-1 … F-4       CORRECTED IN THIS ARTIFACT (§0.4)

NOT IMPLEMENTED. NOT PRODUCTION AUTHORITY. NO GIT ACT.
NO SEC ENUMERATION. NO REFERENCE-DATA ADOPTION. NO ARCHITECTURE CHANGE.
```

STOP.

---

## Appendix A. Source Competence Register

`COMPETENT_FOR_EXISTENCE ≠ COMPETENT_FOR_BEHAVIOR ≠ COMPETENT_FOR_CAUSAL_MECHANISM`. Competence is `SOURCE × PROPOSITION`, never source-family-global, never conferred by official status, and **includes schema competence**. Competence for existence is **never** competence for non-existence (§10.2 rule 5).

| Source / record type | Existence | Non-existence | Behavior | Causal mechanism | Slice-1 status |
|---|---|---|---|---|---|
| **Issuer-filed structured filing index** | **Yes** — filer identity; that a record of class C was filed on date D under identifier I at locator L; structured event-item codes where published **with item-code semantics** | **No** — requires a proven closure domain (§21) | **No** | **No** | **ACTIVE** |
| — *counterparty identity* | **No — field not published** | **No** | — | — | **NOT COMPETENT** (§23.5) |
| — *free-text descriptive fields* | **No structured semantics** | **No** | **No** | **No** | **PROHIBITED as a B′ basis** |
| — *structured item-code field on non-RC2 records* | **No item-code semantics** (§24.7.2) | **No** | **No** | **No** | **PROHIBITED as an RC2/P5 basis** |
| — *record authorship* | **No** — RC5 membership does not establish issuer authorship | **No** | **No** | **No** | Not a Slice-1 proposition |
| Filing document bodies (any form) | Yes — that the filing exists and what it states | **No** | **No, not automatically** | **No** | `NOT_ACTIVE_SLICE1` — class B |
| Issuer press release filed as exhibit | Yes, **only** "the company publicly stated X" | **No** | **No** — interested self-description | **No** | `NOT_ACTIVE_SLICE1` — class B |
| Third-party credible press | Requires its own competence rules | **No** | — | **No** | `REQUIRES_FUTURE_COMPETENCE_RULE` — **not collected** |
| General web / news content | Requires its own competence rules | **No** | — | **No** | `REQUIRES_FUTURE_COMPETENCE_RULE` — **not collected** |

**The non-existence column is uniformly `No`.** That is the C/HYBRID architecture expressed at the competence layer: no source in the active subset is competent for non-existence, and none becomes so through completeness of collection.

---

## Appendix B. Materiality Register

```text
SLICE-1 MATERIALITY RESULT:
NO MATERIALITY-AUTHORIZED DECISION GAP CLAIMS.
```

Unchanged by C/HYBRID.

| Class | Material? | Bounded rationale | Next channel |
|---|---|---|---|
| **P1** filer canonical identity | `MATERIALITY_NOT_AUTHORIZED` | Non-establishment blocks analysis start rather than creating a gap; `18` §65 governs | — |
| **P2** record filed on date D | `MATERIALITY_NOT_AUTHORIZED` | No accepted authority establishes that non-establishment of an individual filing record is material to post-deal integration behavior | — |
| **P3** presence of record class | `MATERIALITY_NOT_AUTHORIZED` | Same | — |
| **P4** record-class establishment state | `MATERIALITY_NOT_AUTHORIZED` | Same. `18` §44 and `19` §63 forbid non-establishment becoming a negative signal. Under C/HYBRID P4 additionally carries **no absence authority at all**, so there is nothing whose materiality could even be asserted | — |
| **P5** published item-code value | `MATERIALITY_NOT_AUTHORIZED` | A published item-code value — populated or empty — carries no authorized organizational meaning. An empty published set is an established reading, not a non-establishment | — |

All five may be shown as **evidence gaps** with **no materiality assertion**. No dynamic ranking, no model judgment, no inference from gap count, **no inference from coverage state**.

---

## Appendix C. Required semantic cases

These cases are normative. An implementation that produces a different outcome for any of them does not implement this methodology.

### C.1 Active propositions

| Proposition | Level | Record classes | Structured basis | State on non-establishment | Materiality |
|---|---|---|---|---|---|
| P1 filer canonical identity | B′ | — | entity identity fields | coverage `SOURCE_UNAVAILABLE`; no proposition established | `MATERIALITY_NOT_AUTHORIZED` |
| P2 record filed on date D under identifier I | B′ | RC1–RC5 | form value, filed date, identifier, locator | `NOT_ESTABLISHED_WITHIN_BOUND` | `MATERIALITY_NOT_AUTHORIZED` |
| P3 presence of declared record class | B′ | RC1–RC5 | form value + adjudicated disposition | — positive-only (§23.2) | `MATERIALITY_NOT_AUTHORIZED` |
| P4 record-class establishment state | B′ | RC1–RC5 | form value + disposition resolution | `NOT_ESTABLISHED_WITHIN_BOUND` | `MATERIALITY_NOT_AUTHORIZED` |
| P5 published item-code value | B′ | RC2 | item-code field **with item-code semantics** | **`ESTABLISHED_WITHIN_BOUND`** whenever published, including empty. **Never a non-establishment state** | `MATERIALITY_NOT_AUTHORIZED` |

### C.2 Deferred

| Proposition | Reason | Status |
|---|---|---|
| **P6** counterparty identity | No structured counterparty field; prose only, which is class B | `DEFERRED / FUTURE CLASS-B CAPABILITY`. **Not** `NOT_ESTABLISHED_WITHIN_BOUND`; **not** `NOT_PUBLICLY_OBSERVABLE`; **not** absent |

### C.3 CASE A — positive fact plus unknown value

```text
GIVEN
  A 10-K is established for the side.
  An unknown raw form value XYZ is also encountered.

REQUIRED
  RC3                    = ESTABLISHED / PRESENT
  coverage               = PARTIAL (permitted; caused by XYZ)
  XYZ                    = recorded and disclosed as UNMAPPED / UNRESOLVED
  RC3 positive fact      = remains valid, unhedged, unqualified

PROHIBITED
  RC3 becomes uncertain, hedged, downgraded, or withdrawn solely due to XYZ.
```

**Why.** Positive evidence is monotonic (§11A). XYZ is unrelated to the evidence that established RC3. It degrades coverage metadata and nothing else.

### C.4 CASE B — no qualifying record plus unknown value

```text
GIVEN
  No RC3 qualifying record is established.
  An unknown raw form value XYZ is encountered.

REQUIRED
  RC3                    = NOT_ESTABLISHED
  coverage               = PARTIAL
  XYZ                    = recorded and disclosed

PROHIBITED
  RC3 ABSENT.
  "No annual record exists."
  "No annual filing occurred."
  "The company did not file an annual report."
  A bare zero count for RC3.
```

**Why.** Unknown means unknown; not established means not established; neither means absent (§21.3).

### C.5 CASE C — no qualifying record with complete coverage — CRITICAL

```text
GIVEN
  No RC3 qualifying record is established.
  Coverage is COMPLETE_WITHIN_BOUND under the declared collection metadata.
  No RC3 closure domain is independently proven.

REQUIRED
  RC3                    = NOT_ESTABLISHED
  coverage               = COMPLETE_WITHIN_BOUND (reported as provenance)

PROHIBITED
  RC3 ABSENT.
  Any upgrade of NOT_ESTABLISHED to absence on the strength of coverage.
```

**This case is critical and is the whole point of the Owner decision.** `COMPLETE_WITHIN_BOUND` alone **must not** resurrect absence semantics. The collection completing according to its own coverage contract says nothing about what exists outside that contract. Absence requires a proven closure domain (§21), and RC3 closure is `NOT AUTHORIZED`.

An implementation that passes Case B but fails Case C has not implemented C/HYBRID — it has merely renamed the old architecture.

### C.6 CASE D — positive fact in one class, unknown in another

```text
GIVEN
  A DEF 14A is established.
  An unknown offering-related raw form value is encountered.

REQUIRED
  RC5                    = ESTABLISHED
  coverage metadata      = separately records the unknown value
  RC5 positive fact      = unaffected

PROHIBITED
  RC5 weakened, hedged, or re-qualified because an unrelated unknown exists.
  The unknown assigned to RC1 "because it looks offering-related" (C9).
  The unknown assigned OUT_OF_BOUND "because it is not a proxy" (C10).
```

### C.7 CASE E — a future unknown form value

```text
GIVEN
  FUTURE-UNKNOWN-XYZ appears in the source.

REQUIRED
  raw value              = preserved exactly as emitted
  disposition            = UNMAPPED / UNRESOLVED
  coverage               = may degrade to PARTIAL
  disclosure             = the value is listed in the result

PROHIBITED
  automatic OUT_OF_BOUND
  automatic RC assignment
  retraction of any established positive fact
  creation of any absence claim
  a new methodology release being required merely to preserve existing
    positive facts (FF-G)
```

**Why.** A new source form value is an expected upstream evolution event, not a product or methodology defect (§24.3, C11).

### C.8 Class truth vs coverage truth — the separation restated

| Scenario | Proposition truth (Axis 1) | Collection coverage (Axis 2) |
|---|---|---|
| `10-K` established | RC3 `ESTABLISHED` | unaffected |
| `10-K` established, `UNKNOWN-X` also encountered | RC3 `ESTABLISHED` — **unchanged** | `PARTIAL` |
| No RC3 record, all values adjudicated | RC3 `NOT_ESTABLISHED` | `COMPLETE_WITHIN_BOUND` |
| No RC3 record, one value unadjudicated | RC3 `NOT_ESTABLISHED` — **same as above** | `PARTIAL` |
| Source not retrieved | **no propositions established** | `SOURCE_UNAVAILABLE` |

Rows 3 and 4 differ **only** on Axis 2. That the proposition state is identical in both is the architecture working correctly: coverage changed, the epistemic result did not, and in neither row is absence claimed.

---

## Appendix D. Authority crosswalk

| Authority | Path | Status |
|---|---|---|
| Current explicit Owner instruction — C/HYBRID (§0.2), D1 (§4.1), D2 (§4.3) | this act | **CONTROLLING** |
| Router / global rules | `AGENTS.md` | CONTROLLING |
| Analyst mandate | `AGENTS_A.md` — §14 anti-hallucination governs §24.8 and Appendix basis statements | CONTROLLING |
| Causal-claim control | `MERGEVUE_CAUSALITY_PROOF_AND_AGENT_CONTROL.md` | CONTROLLING |
| Quality gate | `skills/mergevue-agent-quality-gate/SKILL.md` | SUBORDINATE CONTROL |
| Model routing | `docs/governance/MERGEVUE_MODEL_ROUTING_AND_VERIFICATION_POLICY_2026-09-08.md` | CONTROLLING |
| Control Tree | `docs/governance/MERGEVUE_CONTROL_TREE_v2.1_2026-09-04.md` | CONTROLLING except §12/§13 (note below) |
| — FREE architecture provisions | Control Tree §12, §13 | `STALE / SUPERSEDED ON LEVEL-1 PRODUCT SEQUENCING` |
| Documentary contract | `docs/reference/root-definitional-v1.7/contract/CASE-3.4_CONTRACT_v1.3.md`, SHA-256 `dae8143899cd4fb7e406b4b410e9730a6f8bf7853989f3ef9757edeec293ae39` — verified at authoring time | CONTROLLING |
| Design corpus boundary | `docs/design-corpus/MERGEVUE_REMAINING_CORPUS_MANIFEST_v1.0.md` | OWNER-ACCEPTED / CONTROLLING |
| Deal entry / public result / decision gap / private evidence / data rights / components / handoff | design corpus `18`, `19`, `20`, `24`, `29`, `42`, `44` | OWNER-ACCEPTED |
| Historical candidate lineage | `docs/LEVEL1_MODE_D_METHODOLOGY_DELTA_v0.1_CANDIDATE.md`, `…_CORR1_…`, `…_CORR2_…`, `…_CORR3_CANDIDATE.md` (SHA-256 `c1904987907eabc1e04b3f7d4d60d8c32e004ed09d36139cbebbb8af3ad5f872`) | **HISTORICAL INPUT — not accepted methodology artifacts, not authority** |
| Independent audits IV1–IV4 | agent reports | **AGENT-REPORTED FINDINGS** — used as independently verified defect statements, not methodology authority |
| Architecture preflight | **NOT PERSISTED IN THIS REPOSITORY** | Agent-reported analysis. Its conclusion is recorded at §0.1; the controlling authority for this act is the Owner decision at §0.2 |
| Runtime | `src/server/_secResearch.ts`, `api/start-public-research.ts`, `src/reporting/mergevuePublicReportModel.js`, `src/flow/evidenceClassification.js` | SOURCE/RUNTIME FACT — not authority, not modified by this act |

### D.1 Professional-practice support — not MergeVue authority

The C/HYBRID architecture is consistent with established practice for evolving vocabularies and monotonic reasoning. The following are cited as **professional-practice support only**. They are **not** MergeVue methodology authority, they create **no** product requirement beyond the Owner decision, and nothing in this artifact derives from them.

| Reference | Relevant practice |
|---|---|
| Protocol Buffers open vs closed enums — `https://protobuf.dev/programming-guides/enum/` | An open enum tolerates unknown members without corrupting known ones |
| Microsoft evolvable enums — `https://github.com/microsoft/api-guidelines/blob/vNext/graph/patterns/evolvable-enums.md` | Clients must not break when a producer adds a member |
| W3C RDF 1.1 semantics — `https://www.w3.org/TR/rdf11-mt/` | Monotonicity: adding assertions never retracts prior entailments |
| IETF RFC 9413 | Maintaining robust protocols against extension and evolution |
| Confluent schema evolution — `https://docs.confluent.io/platform/current/schema-registry/fundamentals/schema-evolution.html` | Versioned compatibility between producers and consumers of an evolving schema |

Owner decision and accepted project authority control. Where an outside standard would imply more than the Owner decided, the Owner decision governs.

### D.2 Note — `CONTROL_TREE_FREE_ARCHITECTURE_STATUS`

Bounded to Control Tree v2.1 §12 (*"ABSENT BY DESIGN: … NO bespoke external documentary investigation"*) and §13 (FREE defined as *"What follows from the structured information supplied through the product?"*). Authority basis: `AGENTS.md` §3 — a current explicit Owner instruction supersedes an older project decision; contracts `18`/`19`/`20` (2026-09-16, Owner-accepted) postdate Control Tree v2.1 (2026-09-04). This does **not** imply the Control Tree as a whole is superseded. **No corrective act is started by this artifact.**

---

## Appendix E. Reference-data contract — no enumeration

This appendix deliberately contains **no form table and no registry**. Under §24.8 v0.2 adopts no reference-data instance, and under §33 of the authorizing act no SEC form enumeration is performed.

A reference-data instance, whenever one is proposed for adoption, must satisfy the following and nothing less.

| # | Requirement | Source |
|---|---|---|
| R1 | Carries an explicit version identity, recorded on every proposition and every result | C1 |
| R2 | Resolves raw values by exact, case-sensitive string equality only | C8 |
| R3 | Every disposition is explicit; none is derived from absence in a table | C10 |
| R4 | `OUT_OF_BOUND` appears only where positive incapability against all five RC definitions is established and stated | §24.6 |
| R5 | Anything not positively adjudicated resolves to `UNMAPPED / UNRESOLVED` | §24.7 |
| R6 | States the basis of each entry — located in the bound taxonomy, empirically observed, or asserted — and never presents one as another | `AGENTS_A.md` §14 |
| R7 | Declares its own non-exhaustiveness explicitly | §24.9 |
| R8 | Changes only through a new version identity, never by editing in place | C6 |
| R9 | Claims **no** closure property, for any record class, under any circumstances | §21 |
| R10 | Its incompleteness **MAY** reduce positive recall — leaving a fact that exists in source reality `NOT_ESTABLISHED`, and producing `PARTIAL` coverage. It **MUST NOT** retract or weaken an already-established positive proposition, create absence, create `OUT_OF_BOUND` by default, create an RC assignment by default, silently change methodology authority, or silently redefine proposition semantics. See E.1 | C11, §24.3, §11A |

**R9 and R10 are the C/HYBRID requirements.** They are what make reference-data maintenance an ordinary, low-risk, separately-paced activity rather than a blocker on methodology correctness — and they are why this artifact does not need, and does not perform, another enumeration campaign.

### E.1 What R10 does and does not say — world fact vs established epistemic state

*Precision correction (CORR1 / F-3). **No execution semantics change.** C11, §24.3 and §24.7 already carried the correct `MUST NOT` list; R10's earlier one-line summary — "affects coverage metadata only, never proposition truth" — was broader than that list and was not true of recall.*

R10 turns on a distinction this methodology must never blur:

```text
WORLD FACT
  what is actually the case in source reality, independent of any collection.
  The methodology does not change it, cannot change it, and never asserts it.

METHODOLOGY-ESTABLISHED EPISTEMIC STATE
  what this methodology has lawfully established from evidence it recognized
  and actually obtained. This is the ONLY thing Mode D reports.
```

Reference-data incompleteness operates entirely on the second. It changes what the methodology can **establish**; it never changes, and never claims anything about, the first.

**The scenario that proves the earlier wording overbroad:**

```text
GIVEN
  A real source record exists that satisfies the RC3 definition.
  The reference-data instance in force does not recognize its raw form value.
  No other RC3 record exists for the side.

EXECUTION
  raw value       = UNMAPPED / UNRESOLVED        (C5, C10, §24.7)
  RC3             = no qualifying record established

REQUIRED RESULT
  P4              = NOT_ESTABLISHED_WITHIN_BOUND
  coverage        = PARTIAL
  raw value       = disclosed exactly as emitted

REQUIRED INTERPRETATION
  Reference-data incompleteness REDUCED POSITIVE RECALL.
  A fact that exists in source reality remained NOT_ESTABLISHED.

PROHIBITED INTERPRETATION
  that reference-data incompleteness changed the world fact
  that the record is ABSENT, was not filed, or does not exist
  that anything already established positively was retracted or weakened
  that UNMAPPED became OUT_OF_BOUND or an RC assignment
  that methodology authority or proposition semantics changed
```

The `UNMAPPED` → `PARTIAL` path worked exactly as designed here. The system fails **closed on recall**, disclosing precisely what it could not resolve — and it emits no absence claim of any kind. That is the intended trade: a recall cost, taken deliberately, in exchange for never asserting a false absence (§24.7).

**The two limits that keep this safe, restated:**

1. **Recall loss is bounded and disclosed.** It always surfaces as `PARTIAL` plus the exact unresolved raw value. It is never silent (§24.9 items 1 and 3).
2. **Recall loss is not retroactive.** It can prevent an establishment; it can never undo one. §11A and validators #3 and #9 hold regardless of the reference-data instance in force.

**Why this does not reopen §24.3's central consequence.** §24.3 concludes that *the correctness of Mode D output does not depend on exhaustive reference-data coverage*. That conclusion stands unchanged: correctness here means **no false claim is emitted**, and a `NOT_ESTABLISHED` result accompanied by disclosed `PARTIAL` coverage is a true statement about the search in every case above. **Completeness of recall and correctness of output are different properties**, and only the second is a methodology obligation.
