# MERGEVUE - SOURCECLASS ASSIGNMENT CONTRACT v1.0 - SOURCECLASS SENTENCE BOUNDARY EVIDENCE INTEGRITY CLOSURE 1 CORR1

## THE SENTENCE-EVIDENCE CANDIDATE + IV1-M1 (A DECLARED SENTENCE IS VERIFIED ON THE DOCUMENTARY INTERVAL) + IV1-M2 CASE A (A FULL STOP INSIDE A PROVEN ENTITY-NAME SPAN PROVES NO SENTENCE); CASE B IS THE OWNER-ACCEPTED RESIDUAL R-M2-CASE-B

**ACT:** `SOURCECLASS-SENTENCE-BOUNDARY-EVIDENCE-INTEGRITY-CLOSURE-1.CORR1` - Owner-authorized Codex-driven correction only of `SOURCECLASS-SENTENCE-BOUNDARY-EVIDENCE-INTEGRITY-CLOSURE-1` (IV1 FAIL, MAJOR 2: IV1-F1 and IV1-F2, the only authorized items). IV1-F1 and IV1-F2 CORRECTED, NOT VERIFIED; author validation, regression, forced failures, pilot replay and generated surfaces NOT RUN; recorded results carried from the corrected candidate.

**CORRECTED ACT:** `SOURCECLASS-SENTENCE-BOUNDARY-EVIDENCE-INTEGRITY-CLOSURE-1` (Owner-authorized; scope exclusively IV1-M1 and IV1-M2 of the parent's IV1; final package after the Owner's Option-A decision).

**ROLE:** CORRECTION / IMPLEMENTATION AUTHOR (Owner-assigned). **EXECUTOR:** Claude Opus 5.5.

**PARENT:** `SOURCECLASS-SEGMENTATION-SENTENCE-ABBREVIATION-EVIDENCE-CLOSURE-1` (its 14 files, boundaryModelSha256, normative pre-registration and manifest are pinned in section 2 and verified by checks A-1 and BI-1); its IV1 report and the SEC-HISTORICAL-ENTITY-NAME-AUTHORITY-1.IMPLEMENTATION-1.CORR1 candidate are bound read-only. The touching-atom closure stays pinned as the sentence-evidence layer's parent (SE-*), the R7-B2 closure as the touching layer's (TA-*), the Option A+ candidate as the B-2 layer's (B2-*), the CORR4.CORR1.CORR1.CORR1 package as the frozen base.

**OWNER DECISION:** OPTION_A - IV1-M2-CASE-B (uppercase continuation inside a compound entity name when authoritative entity-name coverage is absent, not determinable, or has no proven occurrence span) is accepted as a bounded, disclosed residual (R-M2-CASE-B). Rule G, rule K and a pilot rebaseline are not authorized.

**STATUS:** CORRECTION / IMPLEMENTATION CANDIDATE - NOT INDEPENDENTLY VERIFIED - NOT OWNER-ACCEPTED - NOT CONTROLLING. IV1-M1 CLOSED IN CANDIDATE; IV1-M2 CASE A CLOSED IN CANDIDATE; IV1-M2 CASE B OWNER-ACCEPTED BOUNDED RESIDUAL; GENERAL SENTENCE-BOUNDARY SOUNDNESS NOT CLAIMED.

> This contract is RENDERED from `MERGEVUE_SOURCECLASS_ASSIGNMENT_RULES_v1.0_SOURCECLASS_SENTENCE_BOUNDARY_EVIDENCE_INTEGRITY_CLOSURE_1_CORR1_CANDIDATE.json` by `MERGEVUE_SOURCECLASS_ASSIGNMENT_VALIDATE_v1.0_SOURCECLASS_SENTENCE_BOUNDARY_EVIDENCE_INTEGRITY_CLOSURE_1_CORR1.py` (render_contract). Every table below is generated from the normative model, from the fixture evaluations, or from the semantic delta ledger. Validator check T-1 requires byte equality; a hand edit fails.

---

## 1. HUMAN CLAIM

IV1-M1. A record could make SENTENCE evidence disappear by leaving the full stop out of its first unit: the units became 'not adjacent', and the frozen rule accepted any lawful separator between non-adjacent units. separatorBefore = SENTENCE is now a claim verified on the actual documentary interval between the units - the previous unit's ending, the omitted gap (punctuation, closers, spacing, line wraps, words) and the next unit. It is proven only if some terminal there, followed by closers and spacing, survives the lowercase continuation guard and the entity-name veto; otherwise the record is rejected. Adjacent units and every other separator are unchanged.

IV1-M2 case A. A full stop that lies inside a PROVEN occurrence span of the frozen SEC entity-name authority candidate (for the same artifact, digest and decoded coordinate view) cannot prove SENTENCE: occurrenceStart <= offset < occurrenceEnd for ANY span of the complete set. The veto is negative evidence only; it never creates a boundary, and a refused or absent authority grants nothing.

IV1-M2 case B. Where no usable authority proves such a span, a full stop before an uppercase continuation keeps the parent's evidence. This is the Owner-accepted bounded residual R-M2-CASE-B: an uppercase continuation inside an unproven compound entity name may still be treated as a sentence boundary. General sentence-boundary soundness is not claimed. Everything else - labels, predicates, features, exclusions, states, Option A+, CSI-v6, R-DUP, OA-1 .. OA-14, B-2, the touching relation, R-BASIS, R-COUNT, the atom - is byte-identical to the parent, and the pilot does not change.

CORR1 (IV1-F1). A full stop followed - past the same closers and spacing - by an ASCII decimal digit 0-9 no longer proves SENTENCE, exactly as a lowercase continuation does not (asciiDigitContinuation). No other character class; '?', '!' and the uppercase continuation of R-M2-CASE-B are unchanged.

CORR1 (IV1-F2). U+201D RIGHT DOUBLE QUOTATION MARK is admitted as one permitted closer of the continuation scan (betweenPattern), so a full stop, U+201D, spacing and a lowercase continuation reach the existing guard. No other quotation character is added.

CORR1 changes the continuation guard's leaves named above and nothing else; its recorded results are carried, not re-run, and are for the independent verifier to recompute.

## 2. IDENTITIES

| Item | Path | SHA-256 | State |
|---|---|---|---|
| Stage-2 CORR4 | WORKBENCH/DOWNLOADS/STAGE2_SEMANTIC_SUCCESSOR_CANDIDATE_CORR4.md | `2de49862fb0d63c5f1cd1745531199137e73b7b37abceecef6e735d497d38bb0` | OWNER-ACCEPTED; INDEPENDENTLY VERIFIED; CONTROLLING; EXACT PILOT VERSION |
| sourceClass parent candidate | WORKBENCH/DOWNLOADS/ (14 files, below) | `5faded489f246fb2540314e0d2563d42574d293a62704066359e45c250ae8958` | SOURCECLASS-ASSIGNMENT-CONTRACT-1.CORR4.CORR1.CORR1.CORR1: the frozen sourceClass BASE the Option A+ layer was implemented on (every inherited A+ check compares with it); candidate, not controlling |
| architecture CORR1 | WORKBENCH/DOWNLOADS/ (5 files) | `fc395b42ef4cab3cb78b9826d8387a1911d6db19319024ff3004ea973348f2b9` | OWNER-ACCEPTED as Option A+ (controlling); R-11 / R-12 accepted; R-7 open, separate, out of scope |
| architecture CORR1.CORR1 | WORKBENCH/DOWNLOADS/ (5 files) | `8d0dd978fcf2d97587b8e8c4a89f7fbef3a824acfe2a828a2de2917022735a2a` | OWNER-ACCEPTED (OA-7(b) decided per occurrence) |
| architecture CORR1.CORR1.CORR1 | WORKBENCH/DOWNLOADS/ (5 files) | `1472bcf74fe3c090a1cbc6b97e00b6c7536a9c6ea87f35bef88e7f331402fbd1` | OWNER-ACCEPTED (OA-14 unplaced conflict witness, class-conditional quarantine) |
| sourceClass implementation parent (Option A+) | WORKBENCH/DOWNLOADS/ (14 files, below) | `f65ca73b83f120b050b9fed14161aec1c709671fd0e04f25ecf7eadf744cd3c9` | SOURCECLASS-OCCURRENCE-ANCHORING-ARCHITECTURE-1.CORR1.IMPLEMENTATION-1: the complete Option A+ candidate, parent of the B-2 layer (checks B2-*); candidate, not independently verified, not controlling |
| sourceClass implementation parent (R7-B2 overlap closure) | WORKBENCH/DOWNLOADS/ (14 files, below) | `e155d5fbc0ba1b6fbd76f269b707f405e36919ea587752f67293e055f889c736` | SOURCECLASS-ASSIGNMENT-CONTRACT-1.R7-B2-OVERLAP-CLOSURE-1: parent of the touching layer (checks TA-*); candidate, not independently verified, not controlling |
| sourceClass implementation parent (touching-atom closure) | WORKBENCH/DOWNLOADS/ (14 files, below) | `ad6145fa1b08deea49d50e1be80e6a9bec34476a523f78a7ddcce6ec32ea66eb` | SOURCECLASS-ASSIGNMENT-CONTRACT-1.R7-B2-TOUCHING-ATOM-CLOSURE-1: parent of the sentence-evidence layer (checks SE-*); candidate, not independently verified, not controlling |
| sourceClass implementation parent (sentence-evidence closure) | WORKBENCH/DOWNLOADS/ (14 files, below) | `5c49e3ab6940a5a0764dba1f4da7bde36f0832c977be621f92f28673e6d87fd3` | SOURCECLASS-SEGMENTATION-SENTENCE-ABBREVIATION-EVIDENCE-CLOSURE-1: this act's exact parent (boundaryModelSha256); candidate, IV1 FAIL (MAJOR 2: IV1-M1, IV1-M2; MINOR 1), not controlling |
| independent audit (IV1) of the parent | WORKBENCH/DOWNLOADS/SOURCECLASS-SEGMENTATION-SENTENCE-ABBREVIATION-EVIDENCE-CLOSURE-1.IV1_REPORT.md | `9d8fc708a23d3d827096424c0c791c5bb8ac83fe9a5638b5e73dbd36fc998a2f` | Codex independent audit of the parent: FAIL, BLOCKING 0, MAJOR 2 (IV1-M1 non-adjacent SENTENCE declaration bypass; IV1-M2 uppercase continuation inside a compound company name), MINOR 1 (IV1-m1 OA-14 diagnostic non-idempotence); bound read-only, not rewritten |
| entity-name authority candidate dependency (SEC-HISTORICAL-ENTITY-NAME-AUTHORITY-1.CORR1) | WORKBENCH/DOWNLOADS/ (8 files + manifest, below) | `6b0d3622f2ecf506caf969fd18f23275f606dc809cf72dface4d33ce17b62e8e` | SEC-HISTORICAL-ENTITY-NAME-AUTHORITY-1.IMPLEMENTATION-1.CORR1: a bound candidate dependency consumed read-only - NOT_INDEPENDENTLY_VERIFIED, NOT_OWNER_ACCEPTED, NOT_CONTROLLING |
| sentence-boundary integrity closure (the candidate CORR1 corrects) | WORKBENCH/DOWNLOADS/ (14 files, below) | `ee3c7b631bc48862294ba3de8c5b49e9468f5b686dc4601fd77f68d13433e5ae` | SOURCECLASS-SENTENCE-BOUNDARY-EVIDENCE-INTEGRITY-CLOSURE-1: the candidate this correction corrects; Codex IV1 FAIL (BLOCKING 0, MAJOR 2: IV1-F1, IV1-F2; MINOR 0) as relayed by the Owner (no IV1 report file bound); candidate, not controlling |

## 3. IMPLEMENTATION SCOPE - THE CONTROLLING A+ ARCHITECTURE, BLOCK BY BLOCK

| Block | Architecture | Implemented as | Verified by |
|---|---|---|---|
| OA-1 members | members of U = the resolved R-DUP group; unresolved group, unavailable bytes and decoder mismatch fail closed | occurrenceAnchoring.members; anchor_all pass (i) | O-10; F-1; R-3 |
| OA-2 origin-tracked replay | every declared op sequence replayed with per-character decoded origin and emitting op; text byte-identical | Tracked, apply_ops_tracked, tracked_extract (MODEL_ERROR on any drift) | O-2; R-3 |
| OA-3 anchor source and skeleton | sigma from the coder's letters (markup-removing) or the canonical content (markup-preserving); empty sigma = EMPTY_CANONICAL_SEGMENT | anchor_facts in the recipe decoder's text | F-1; P-3; R-8 |
| OA-4 complete view | comment bodies, attribute values, non-standard names, malformed interiors kept; standard names dropped; entities decoded; casefold; letters and digits | complete_view (origin-tracked), model occurrenceAnchoring.completeView | O-3; F-7 |
| OA-5 removal views and op roles | every op declares CONTENT_BLOCK_REMOVAL / MARKUP_REMOVAL / NORMALIZATION; recipe views from op provenance; TAG view | op roles in evidenceBinding; removal_views; cv_classes | O-1; O-4; F-7 (PRB-TAGVIEW, PRB-REPARSE) |
| R-3 text-bearing removal seam | a removed letter/digit strictly between two surviving ones in any removal view; BLOCK and MARKUP; no whitelist; digits count | seam() | O-5; F-7 (34 R-3 cases); G-1 |
| OA-6 frame selection | FRAME-C iff every member's complete view is equal, else FRAME-U; per document | anchor_all pass (i) | O-6 |
| OA-7 FRAME-C | (a) omega non-empty; (b) FRAME_C_OCCURRENCE_REPRESENTABLE(U, omega) over every record carrying it (CORR1.CORR1); (c) no seam in any member; conjunction; reason = first failing in declared order | anchor_all passes (i) and (ii) | O-7; F-7 (10 OA-7(b) fixtures); G-2 |
| OA-8 FRAME-U | U1 exactly once in every complete view (the count view), U2, U3, U4; key-level | _frame_u_guard | O-8; U-2; F-7 |
| OA-9 own seam | diagnostic; acts only through C-b, C-c and U4 | anchor block ownSeam / ownImageRepresentable | O-9 |
| OA-10 fail closed | no identity, UNESTABLISHED, DUPLICATE_IDENTITY_UNRESOLVED, no R-COUNT contribution; existing states only | unestablished_state; recorded reasons | O-10; S-7; S-9 |
| OA-11 CSI-v6 | CSI-v6 key = version, U, frame tag, anchor; identity = CSI: + sha256(key) | identity_string | C-1; C-6; C-7 |
| OA-12 / OA-13 diagnostics and forbidden | rank, counts, content hash, context, locators, headings diagnostic; CSI-v5 proofs have no executable authority | canonicalSegmentIdentity.diagnosticOnly / removedProofs; dormant paths counted | C-5; S-10; C-7 |
| OA-14 unplaced conflict witness | after OA-7 / OA-8, before R-COUNT: witness, C(r) = all established occurrences of U, class-conditional quarantine, simultaneous | unplaced_witness_stage | Q-1; Q-2; Q-3; F-7 (22 R-14 fixtures); G-3 |
| B2 footprint | act sections 7-8: FRAME-C omega; FRAME-U the U1 interval w_m(k) in every member; overlap = a shared complete-view letter/digit; touching is not overlap; FRAME-U overlap in any member | basis_overlap_facts, _b2_footprint, _b2_relation | B2-3; B2-6; B2-7 |
| B2 predicate support core | act section 10: units carrying witnessed assertions of features the satisfied frozen predicate reads; uncertainty expands; sufficiency by the frozen predicates | _b2_class_features, _b2_unit_positions, basis_overlap_facts | B2-4; B2-7 |
| B2 lawful separation | act sections 9 and 11: LS-1 .. LS-5; only a lawful separator recorded (and evidence-checked) by one of the two records, lying between the cores | _b2_separation, _b2_between | B2-4; B2-5; B2-7 |
| B2 components and count | act sections 12-15: overlap graph, connected components, one class once / several classes nothing; R-COUNT step 5b | basis_overlap, count(seg_records, b2) | B2-1b; B2-3; B2-7; B2-8; B2-9 |
| TA atom evidence | act sections 6-8: the frozen R-SEG-B atom (segmentation.atom, unchanged); the material between the two class-bearing cores in the complete view before its letters-and-digits filter; boundaries only from the frozen whenAdjacent evidence of SENTENCE / NUMBERED_CLAUSE / NUMBERED_SUBCLAUSE, or a separator a's or b's own record records | _ta_view, _ta_rules, _ta_scan, basis_atom_facts, _ta_relation | TA-3; TA-7; TA-8; TA-11; TA-12 |
| TA edge | act sections 4, 7, 10 and 13: B2_EDGE += SAME_INDIVISIBLE_ATOM_TOUCHING (TA-1 .. TA-5), LAWFULLY_SEPARATE_SUPPORT authoritative, the existing union-find | basis_overlap (the non-overlapping pairs of one U) | TA-5; TA-6; TA-9; TA-11 |
| TA members | act section 23: FRAME-C read in every rendition member, FRAME-U per member; any member finding no boundary fails closed for diversity | _ta_relation (members.rule) | TA-10; TA-11 |
| SE continuation guard | act sections 3-6: a bounded UAX #29 SB8 analogue for the ambiguous full stop only - past permitted closers (quote, parenthesis, bracket) and spacing, a first cased letter that is lowercase leaves the SENTENCE boundary NOT PROVEN; read on views that keep the full stop, the closers, the spacing and the letter case; no abbreviation list | continuation_withheld, _cg_declared, _cg_case_view | SE-3; SE-5; SE-6; SE-7; SE-8; SE-9 |
| SE shared decision | act section 7 (SE-D2): one decision on both paths - a SENTENCE a record declares (form_segments; rejected as SEPARATOR_EVIDENCE_FAILED, the frozen violation semantics) and the touching-atom junction evidence (_ta_scan TAIL matches; no boundary, so the unchanged touching relation joins) | form_segments, _ta_scan (both call continuation_withheld) | SE-5; SE-9; SE-13 |
| BI documentary interval | IV1-M1: a SENTENCE declared between non-adjacent units is a claim verified on the actual documentary interval (previous unit end, omitted gap, next unit), in extracted-text coordinates; the guard and the veto read every candidate terminal | _interval_evidence, form_segments | BI-3; BI-5; BI-9; BI-10 |
| BI entity-name veto | IV1-M2 case A: a full stop whose decoded-artifact offset lies inside ANY proven occurrence span of a usable authority record bound to the same artifact cannot prove SENTENCE; declared path (extraction origin map) and touching path (complete-view origin map); negative evidence only | _veto_doc, _veto, _ta_scan, _ta_origin | BI-3; BI-6; BI-9; BI-10 |
| BI authority binding | the frozen CORR1 candidate read-only: records digest, constants, artifact id, artifact digest, coordinate view, proven states, entity id, span set, span text; nothing inferred | bind_entity_name_authority, replay_corpus | BI-7; BI-13 |

### 3.1 Implementation discipline

- *declaration:* The implementation was authored WITH knowledge of the pilot surface and of the architecture prototypes' recorded results. No claim is made that the rules were frozen before any contact with them. The R-7 closure was likewise authored WITH knowledge of the pilot surface and of the A+ parent's results. The touching-atom closure was likewise authored WITH knowledge of the pilot surface and of the R7 parent's results. The sentence-evidence correction was likewise authored WITH knowledge of the pilot surface and of the touching-atom parent's results. The sentence-boundary evidence integrity correction was likewise authored WITH knowledge of the pilot surface, of the parent's results and of the IV1 report.
- *parity:* every inherited surface is re-evaluated under the parent's evidence and under this act's: on the pilot (with the authority bound), the CORR1, OA-7(b), R-14, R-7, touching-atom and sentence-evidence generated surfaces nothing changes, and on the 293 carried fixtures exactly SE-EVID-NA (BI-4)
- *frozenSurfaces:* every model leaf outside segmentation.separatorEvidence.whenAdjacent.SENTENCE.documentaryInterval / entityNameVeto, the whenNotAdjacent wording, the model id and the validator file name is byte-identical to the parent (BI-2); CORR1 adds only the continuation-guard leaves asciiDigitContinuation, rule, unchanged (IV1-F1) and betweenPattern (IV1-F2)
- *noRecoding:* the documentary interval only rejects a declared SENTENCE it cannot verify (the frozen violation semantics) and the veto only makes a full stop ineligible as SENTENCE evidence; neither writes an identity, state or class (BI-2, SE-13)
- *corr1:* Codex-driven correction only: the two corrections were implemented and NOT run by their author; Codex is the sole verifier

## 4. THE SINGLE NORMATIVE SOURCE

THE single machine-readable normative source for class definitions, predicate structure, documentary definitions, class-boundary rules, segmentation rules, fail-closed states, duplicate/rendition identity rules, canonical segment identity, evidence binding and srcDiv counting semantics. The readable contract is RENDERED from this object; the fixtures, the pilot replay, the validator's interpreter and the author-report examples are evaluated against it.

| Computed | Value |
|---|---|
| boundaryModelSha256 | `9c8011f743a76ca8b1bf94b699b54567d7f510bfb0e678a35f8f690f82a0c501` |
| serialization | json.dumps(boundaryModel, sort_keys=True, separators=(',', ':'), ensure_ascii=False) encoded UTF-8 |

One machine-readable normative model is the single source: the contract is rendered from it, and the validator's interpreter reads every rule, reason, frame, guard, op role and OA-14 rule from it. Paths the delivered model does not select (the retired CSI-v5 proofs and the weakened rules the forced failures restore) are dormant, counted and required to be unused (check C-5).

The count layer is part of the same model (boundaryModel.basisOverlap) and is read by the interpreter like every other rule; its weakened variants (the act's forced failures) are dormant, counted and required to be unused.

The touching relation is part of the same model (boundaryModel.basisOverlap.touchingAtom) and reads the frozen segmentation evidence by reference; its weakened variants (the act's forced failures) are dormant, counted and required to be unused.

The continuation guard is part of the same model (boundaryModel.segmentation.separatorEvidence.whenAdjacent.SENTENCE.continuationGuard); its weakened variants (the act's forced failures SE-FF01 .. SE-FF14) are dormant, counted and required to be unused.

The documentary interval and the entity-name veto are part of the same model (boundaryModel.segmentation.separatorEvidence.whenAdjacent.SENTENCE); their weakened variants (the act's forced failures BI-FF01 .. BI-FF16) are dormant, counted and required to be unused.

## 5. FROZEN VOCABULARY - THE NINE QUALIFYING CLASSES

| # | Class label (exact CORR4 string) | Class id |
|---|---|---|
| 1 | `marketing/engagement materials` | SC-1 |
| 2 | `contracts/participation terms` | SC-2 |
| 3 | `compensation plans` | SC-3 |
| 4 | `referral/recruitment system records` | SC-4 |
| 5 | `platform/product rules` | SC-5 |
| 6 | `retention metrics` | SC-6 |
| 7 | `access-rights/role matrices` | SC-7 |
| 8 | `internal manuals/scripts` | SC-8 |
| 9 | `operative/financial records of the participation system` | SC-9 |

## 6. ASSIGNMENT STATES (not classes)

| State | Meaning | Counts toward srcDiv |
|---|---|---|
| `ASSIGNED` | exactly one class predicate is satisfied by the supplying basis; sourceClass carries that class label | YES_IF_DOCUMENT_IDENTITY_RESOLVED |
| `NOT_DETERMINABLE` | the supplying segment could not be fully inspected, or its locator could not be resolved to a bounded segment | NO |
| `OUTSIDE_FROZEN_VOCABULARY` | all nine predicates were evaluated against a fully inspected segment and none is satisfied | NO |
| `MULTIPLE_CLASS_PREDICATES_SATISFIED` | the multi-function state: two or more class predicates are satisfied and the record supplies no lawful segmentation boundary to isolate them. Retained name, fully enumerated; not renamed | NO |
| `DUPLICATE_IDENTITY_UNRESOLVED` | the underlying-document identity could not be resolved under the R-DUP consistency model, or no frame that every rendition of the resolved document is proven to share establishes the identity of the segment's documentary occurrence (canonicalSegmentIdentity, occurrenceAnchoring) | NO |

Precedence: `DUPLICATE_IDENTITY_UNRESOLVED` > `NOT_DETERMINABLE` > `MULTIPLE_CLASS_PREDICATES_SATISFIED` > `OUTSIDE_FROZEN_VOCABULARY` > `ASSIGNED`. Counting-eligible: `ASSIGNED`. Counting disposition (not a state, not a class): `SEGMENT_CLASS_CONFLICT`.

## 7. DOCUMENTARY TERMS

| Term | Definition | Test |
|---|---|---|
| supplyingBasis | The complete set of documentary segments materially necessary to support the exact proposition carried by one source-specific analytical support record. A segment is materially necessary iff removing it leaves at least one element of that proposition unsupported by the remaining segments. | Apply the removal test to the proposition's stated elements. The basis is a set of segments, never a single preferred quotation. |
| boundedSegment | The documentary unit supplied by the nearest enclosing explicit structural boundary, or, where the supplying text lies outside any such boundary, the record's own sentence. | Structural boundaries are the closed R-SEG-B list. Where none applies, the sentence is the unit. A comma, a conjunction, a line wrap or a column break is NOT a boundary. |
| addressee | The actor a segment's own speech act is directed to, determined by the segment's mode and deictic frame. Material quoted inside a segment remains part of the host segment's speech act and does not create a second addressee. | Identify the actor the segment itself charges, invites or informs. A participant-facing sentence quoted inside an instruction to a performer keeps the performer as addressee. |
| participant | A person or entity whose relationship to the issuer or operator is established by the record itself as one of joining, being admitted or enrolled in, subscribing to, being licensed or franchised by, selling or distributing for, or being served by the arrangement the record concerns. | The record itself must attach the person to the arrangement by such a relationship term or an equivalent. Investors, employees, readers and the general public are not participants unless the record establishes the participant relationship. No Environment label and no mechanism conclusion is consulted. |
| participation | The state, established by the record, of being a participant in the arrangement. | Read from the record's own participant relationship. It is a documentary relation, not an Environment determination. |
| participationSystem | The bounded documentary object consisting of the participant-facing arrangement the record names or describes, together with the operations through which that arrangement's participants are acquired, admitted, served, operated for, or rewarded. | A fact is OF the participation system only when at least one documentary attachment test P-1..P-5 holds for it. The test asks only whether the record itself attaches the stated fact to such an arrangement, using the record's own terms. It never requires deciding whether the arrangement is a participation system in the analytical sense, whether TT-SFPSFJ-DOC is true, or which Environment applies. |
| performer | The actor a segment instructs to carry out an interaction or operation: an employee, agent, representative, distributor, licensee, franchisee, scripted caller, or an equivalent operational actor. | The segment's operative mode is imperative or instructive and its addressee is charged with performing the operation. |
| engagement | The interest, attraction, desire or willingness of a participant or prospective participant toward participation, as the segment itself frames it. | Read from the segment's own evaluative, invitational or benefit-framing language about participation. It is not inferred from the issuer's commercial interest. |
| role | A named position, office, rank, tier, class, committee seat, or status that the record distinguishes among actors. | The record itself must name the position/office/tier/class, not merely name a person. |
| tier | A named level within an ordered set of levels that the record distinguishes. | The record must present the levels as an ordered set (gold/silver, level 1/2/3, grade/band). A single role without a level ordering is a role, not a tier. |
| operative | A state of affairs the record presents as in force or applied, as distinct from proposed, aspirational, or merely permitted. | Read the record's own modality for the arrangement. This is a documentary modality test and does not decide CORR4 formalOperativeState, planCurrentState, or any M value. |
| financialFlow | A movement of money or value that the segment states as realized: an amount incurred, settled, paid, received, charged, distributed, or reported for a stated period. | The segment must state the amount together with its realized status. An entitlement, a rate, a ceiling or a forecast is not a financial flow. |
| retention | The continuation, renewal, repetition, return or churn of participation over time. | The segment must concern the participant base's continuation, not merely a headcount and not merely a financial amount. |
| system | A documentary object with more than one component or a recurring operation, evidenced by the record through programme terms, enrolment, tracking, a ledger, a relationship set, or procedural steps. | The record must exhibit at least one such system property. A single invitation or a single reward statement exhibits no system property. |
| actualOrRealized | The segment presents an event or flow as having occurred or as occurring, in a stated period or with a realized verb. | The coder reads the segment's own tense/modality. The coder does NOT independently prove that the event occurred. |
| rule | A provision the record states as governing or binding conduct. | The record must state the provision as governing, not report that some rule exists. |
| terms | Provisions the record states as the enforceable or formal conditions of a relationship. | The record must be, or reproduce, the conditions text. A description that terms exist is not the terms text. |
| manualOrScript | A document or section whose documentary function is to instruct a performer how to perform an interaction or operation. | The section must instruct conduct, not describe a practice to a third party. |
| rewardObject | A named consideration the segment states as accruing to a role, class, tier, office or participation action: an amount, rate, formula, benefit, equity award, fee, credit, commission, bonus, retainer, salary, incentive, or entitlement to value. | The consideration must be named. The noun being present is necessary but not sufficient: the reward-provision test T3-PROVISION must also hold. |
| membershipOrAdmission | The record's own term for becoming a participant: joining, admission, enrolment, registration, subscription, licensing or franchising. | Read the record's own term. A generic description of customers is not admission. |
| referencePeriod | The period the segment itself states for the amount or measure, or the period implied by the segment's realized tense. | The segment must supply the period or realized tense. Absent both, the amount is not presented as realized. |

## 8. FEATURE VOCABULARY, CONSTRAINTS AND MERGE

| Feature | Kind | Values / default |
|---|---|---|
| addressee | scalar enum | PARTICIPANT, PERFORMER, INVESTOR_PUBLIC, OTHER; default `OTHER` |
| rewardModality | scalar enum | STRUCTURE, REALIZED, BOTH, NONE; default `NONE` |
| frameMarkers | list enum | M1, M2, M3, M4 |
| termsConditions | list enum | ENTRY, EXCHANGE, CONTINUATION, RENEWAL, EXIT, OBLIGATION, RESTRICTION, TERMINATION |
| rewardProvisions | list enum | B1, B2, B3 |
| systemProperties | list enum | S1, S2, S3, S4, S5 |
| attachmentTests | list enum | P-1, P-2, P-3, P-4, P-5 |
| operativeContent | list enum | ENGAGEMENT_FRAME, PARTICIPATION_TERMS, REWARD_STRUCTURE, ACQUISITION_MECHANISM, USE_RULE, CONTINUATION_MEASURE, ROLE_ALLOCATION, INSTRUCTION, REALIZED_FLOW |
| determinant | list enum | ACTOR_INVARIANT, ROLE_OR_TIER, OTHER |
| fixesParticipationTerms | boolean | default `false` |
| concernsParticipantRelationship | boolean | default `false` |
| bindingForm | boolean | default `false` |
| rewardObject | boolean | default `false` |
| structureStated | boolean | default `false` |
| oversightObjectMentionOnly | boolean | default `false` |
| competitivePayNarrative | boolean | default `false` |
| acquisitionConcern | boolean | default `false` |
| referralMechanism | boolean | default `false` |
| ordinaryEmploymentHiring | boolean | default `false` |
| investorNomineeAgreement | boolean | default `false` |
| platformObject | boolean | default `false` |
| useRule | boolean | default `false` |
| relationshipOnlyConditions | boolean | default `false` |
| metadataOnlyBasis | boolean | default `false` |
| measurePresent | boolean | default `false` |
| participantPopulation | boolean | default `false` |
| continuationDimension | boolean | default `false` |
| oneOffCount | boolean | default `false` |
| retentionMechanismDescription | boolean | default `false` |
| nonParticipantPopulation | boolean | default `false` |
| roleDimension | boolean | default `false` |
| entitlementDimension | boolean | default `false` |
| allocationStatement | boolean | default `false` |
| rosterWithoutEntitlement | boolean | default `false` |
| rightsChangeEventReport | boolean | default `false` |
| imperativeMode | boolean | default `false` |
| instructionContent | boolean | default `false` |
| describesPracticeNotInstruction | boolean | default `false` |
| flowPresent | boolean | default `false` |
| realized | boolean | default `false` |
| budgetOrForecast | boolean | default `false` |
| contractDescriptionOnly | boolean | default `false` |
| generalPublicAddressee | boolean | default `false` |
| fullyInspected | derived | true iff the record's supplying content is physically bound (artifact digest verified, every unit span re-extracted and equal to the recorded text); never asserted by a coder |

A feature that is not asserted with a valid in-unit witness takes its default (false, empty, or the scalar default). The evaluator reads ONLY witnessed assertions.

| Constraint | When | Requires | Meaning |
|---|---|---|---|
| FC-1 | `{"feature": "rewardModality", "eq": "REALIZED"}` | `{"not": {"feature": "structureStated", "eq": true}}` | rewardModality=REALIZED contradicts structureStated=true |
| FC-2 | `{"feature": "rewardModality", "in": ["STRUCTURE", "BOTH"]}` | `{"feature": "structureStated", "eq": true}` | rewardModality STRUCTURE or BOTH requires structureStated=true |
| FC-3 | `{"feature": "structureStated", "eq": true}` | `{"feature": "rewardObject", "eq": true}` | structureStated=true requires rewardObject=true |
| FC-4 | `{"feature": "realized", "eq": true}` | `{"feature": "flowPresent", "eq": true}` | realized=true requires flowPresent=true |
| FC-5 | `{"feature": "determinant", "contains": "ACTOR_INVARIANT"}` | `{"feature": "useRule", "eq": true}` | a witnessed determinant ACTOR_INVARIANT is only meaningful with useRule=true |

| Merge target | Rule |
|---|---|
| lists | UNION_OF_WITNESSED_VALUES |
| booleans | OR_OF_WITNESSED_VALUES |
| addressee | `[{"ifSingleDistinct": true, "then": "<VALUE>"}, {"else": "OTHER"}]` |
| rewardModality | `[{"ifAny": ["BOTH"], "then": "BOTH"}, {"ifAll": ["STRUCTURE", "REALIZED"], "then": "BOTH"}, {"ifSingleDistinct": true, "then": "<VALUE>"}, {"else": "NONE"}]` |
| scope | applies to the witnessed assertions of the units that form ONE indivisible segment; unasserted features never enter a merge (their default is applied after the merge) |

## 9. THE NINE CLASS PREDICATES (unchanged from the parent)

`P_i(S) = combinator( components ) AND NONE_OF( exclusions )`, evaluated over the witnessed feature record of one indivisible segment.

### SC-1 - `marketing/engagement materials`

*Function.* The segment's documentary function is to produce, frame, solicit or sustain desire, attraction or engagement toward participation, or to present participation as desirable, voluntary or rewarding.

*Combinator.* `ALL_OF` over components, `NONE_OF` over exclusions.

| Component | Test | Machine expression |
|---|---|---|
| C1-ADDRESSEE | The segment's addressee is a participant or prospective participant in the arrangement the record concerns. | `{"feature": "addressee", "eq": "PARTICIPANT"}` |
| C1-FRAME | The segment's function is to elicit, shape, sustain or frame desire, attraction, interest or willingness toward participation. | `{"feature": "frameMarkers", "nonEmpty": true}` |

| Exclusion | Test | Redirect | Form | Form basis | Machine expression |
|---|---|---|---|---|---|
| X1-a | it fixes enforceable or formal participation terms | SC-2 | PRESENCE | CORR1_TEXT_PRESENCE | `{"feature": "operativeContent", "contains": "PARTICIPATION_TERMS"}` |
| X1-b | it instructs a performer what to say or do | SC-8 | PRESENCE | CORR1_TEXT_PRESENCE | `{"feature": "operativeContent", "contains": "INSTRUCTION"}` |
| X1-c | it states a determinate reward value, rate, form or eligibility for a role, class or participation action | SC-3 | PRESENCE | CORR1_TEXT_PRESENCE | `{"feature": "operativeContent", "contains": "REWARD_STRUCTURE"}` |
| X1-d | it records realized operative or financial amounts | SC-9 | PRESENCE | CORR1_TEXT_PRESENCE | `{"feature": "operativeContent", "contains": "REALIZED_FLOW"}` |
| X1-e | it states or defines a continuation measure | SC-6 | PRESENCE | CORR1_TEXT_PRESENCE | `{"feature": "operativeContent", "contains": "CONTINUATION_MEASURE"}` |
| X1-f | it maps roles or tiers to entitlements or authority | SC-7 | PRESENCE | CORR1_TEXT_PRESENCE | `{"feature": "operativeContent", "contains": "ROLE_ALLOCATION"}` |
| X1-g | it states rules governing permitted use of the product or platform | SC-5 | PRESENCE | CORR1_TEXT_PRESENCE | `{"feature": "operativeContent", "contains": "USE_RULE"}` |
| X1-h | the addressee is an investor, employee or the general public as such, with no participant relationship established by the record | OUTSIDE_FROZEN_VOCABULARY | FEATURE_TEST | NOT_A_REDIRECT_EXPRESSION | `{"feature": "generalPublicAddressee", "eq": true}` |

*Counter-inflation.* A segment whose only participant-facing content is an invitation with no determinate terms satisfies C1 only; it must not be widened to SC-2, SC-4 or SC-5 by implication.

### SC-2 - `contracts/participation terms`

*Function.* The segment fixes the enforceable or formal terms on which a participant may participate or continue to participate.

*Combinator.* `ALL_OF` over components, `NONE_OF` over exclusions.

| Component | Test | Machine expression |
|---|---|---|
| C2-OBJECT | The segment concerns the participant relationship in the arrangement. | `{"feature": "concernsParticipantRelationship", "eq": true}` |
| C2-TERMS | The segment specifies conditions of entry, exchange, continuation, renewal or exit, or the rights and obligations of participants as participants (fees, dues, obligations, restrictions on the relationship, termination). | `{"feature": "termsConditions", "nonEmpty": true}` |
| C2-BINDING | The segment is the terms instrument or a reproduction of its terms text, stated in binding or operative form; it is not a description that such terms exist. | `{"feature": "bindingForm", "eq": true}` |

| Exclusion | Test | Redirect | Form | Form basis | Machine expression |
|---|---|---|---|---|---|
| X2-a | its operative content is a reward amount, rate, form or eligibility for a role or class | SC-3 | PRESENCE | CORR1_TEXT_PRESENCE | `{"feature": "operativeContent", "contains": "REWARD_STRUCTURE"}` |
| X2-b | its operative content is permitted use of, access to, or behaviour within the product or platform, stated actor-invariantly | SC-5 | EXCLUSIVITY | CORR1_CONCRETE_MATRIX_ROW | `{"allOf": [{"feature": "operativeContent", "contains": "USE_RULE"}, {"not": {"feature": "operativeContent", "contains": "PARTICIPATION_TERMS"}}]}` |
| X2-c | it instructs a performer | SC-8 | PRESENCE | CORR1_TEXT_PRESENCE | `{"feature": "operativeContent", "contains": "INSTRUCTION"}` |
| X2-d | it is a description of or report about a contract, not the terms text | OUTSIDE_FROZEN_VOCABULARY | FEATURE_TEST | NOT_A_REDIRECT_EXPRESSION | `{"feature": "contractDescriptionOnly", "eq": true}` |
| X2-e | it maps roles or tiers to entitlements | SC-7 | PRESENCE | CORR1_TEXT_PRESENCE | `{"feature": "operativeContent", "contains": "ROLE_ALLOCATION"}` |

*Counter-inflation.* A report that terms exist satisfies none of the components; it must not be counted as SC-2.

### SC-3 - `compensation plans`

*Function.* The segment defines or reports the compensation, reward or remuneration structure applicable to a role or participant class: amounts, eligibility, form or timing.

*Combinator.* `ALL_OF` over components, `NONE_OF` over exclusions.

| Component | Test | Machine expression |
|---|---|---|
| C3-OBJECT | a named reward object is present | `{"feature": "rewardObject", "eq": true}` |
| C3-PROVISION | the segment states, as its operative content, at least one reward provision for a role, class, office or participation action | `{"feature": "rewardProvisions", "nonEmpty": true}` |

| Exclusion | Test | Redirect | Form | Form basis | Machine expression |
|---|---|---|---|---|---|
| X3-a | the reward noun appears only as the grammatical object of an authority, oversight, review, approval, recommendation or determination verb, and no B1/B2/B3 provision appears in the same segment -> SUBJECT-MATTER MENTION; C3-PROVISION fails and the segment is not SC-3 | SC-7 | FEATURE_TEST | NOT_A_REDIRECT_EXPRESSION | `{"feature": "oversightObjectMentionOnly", "eq": true}` |
| X3-b | its operative content is a realized amount settled, paid or received | SC-9 | FEATURE_TEST | NOT_A_REDIRECT_EXPRESSION | `{"feature": "rewardModality", "eq": "REALIZED"}` |
| X3-c | it states a continuation measure | SC-6 | PRESENCE | CORR1_TEXT_PRESENCE | `{"feature": "operativeContent", "contains": "CONTINUATION_MEASURE"}` |
| X3-d | it maps roles or tiers to entitlements or authority without stating reward terms | SC-7 | EXCLUSIVITY | CORR1_TEXT_MARKER | `{"allOf": [{"feature": "operativeContent", "contains": "ROLE_ALLOCATION"}, {"not": {"feature": "operativeContent", "contains": "REWARD_STRUCTURE"}}]}` |
| X3-e | it is a narrative claim about pay with no reward object and no provision | OUTSIDE_FROZEN_VOCABULARY | FEATURE_TEST | NOT_A_REDIRECT_EXPRESSION | `{"feature": "competitivePayNarrative", "eq": true}` |

*Counter-inflation.* A bare mention of reward categories inside another actor's oversight authority is not a compensation plan and must not be counted as SC-3.

### SC-4 - `referral/recruitment system records`

*Function.* The segment establishes, operates, records or measures the acquisition of new participants through referral or recruitment.

*Combinator.* `ALL_OF` over components, `NONE_OF` over exclusions.

| Component | Test | Machine expression |
|---|---|---|
| C4-ACQUISITION | the segment concerns the acquisition of new participants, or its recorded operation | `{"feature": "acquisitionConcern", "eq": true}` |
| C4-REFERRAL | the acquisition mechanism is referral or recruitment by existing participants, sponsors, agents, or a recruitment function | `{"feature": "referralMechanism", "eq": true}` |
| C4-SYSTEM | the segment evidences at least one system property of the acquisition mechanism | `{"feature": "systemProperties", "nonEmpty": true}` |

| Exclusion | Test | Redirect | Form | Form basis | Machine expression |
|---|---|---|---|---|---|
| X4-a | it merely invites or encourages inviting others, with no S1-S5 property | SC-1 | FEATURE_TEST | NOT_A_REDIRECT_EXPRESSION | `{"allOf": [{"feature": "systemProperties", "empty": true}, {"feature": "frameMarkers", "nonEmpty": true}]}` |
| X4-b | it states a referral reward value or eligibility as its operative content, with no S1-S5 property | SC-3 | FEATURE_TEST | NOT_A_REDIRECT_EXPRESSION | `{"allOf": [{"feature": "systemProperties", "empty": true}, {"allOf": [{"feature": "rewardObject", "eq": true}, {"feature": "structureStated", "eq": true}]}]}` |
| X4-c | it concerns ordinary employment hiring, which is labour not participant acquisition | OUTSIDE_FROZEN_VOCABULARY | FEATURE_TEST | NOT_A_REDIRECT_EXPRESSION | `{"feature": "ordinaryEmploymentHiring", "eq": true}` |
| X4-d | it concerns an investor's board-nominee or shareholder agreement | OUTSIDE_FROZEN_VOCABULARY | FEATURE_TEST | NOT_A_REDIRECT_EXPRESSION | `{"feature": "investorNomineeAgreement", "eq": true}` |

*Counter-inflation.* An invitation plus a reward is not a recruitment system; the system property must be exhibited by the segment.

### SC-5 - `platform/product rules`

*Function.* The segment defines rules governing permitted use of, access to, or behaviour within the platform or product through which participation occurs.

*Combinator.* `ALL_OF` over components, `NONE_OF` over exclusions.

| Component | Test | Machine expression |
|---|---|---|
| C5-OBJECT | a platform, product, service, system or operational surface of the arrangement is the governed object | `{"feature": "platformObject", "eq": true}` |
| C5-RULE | the segment states a rule governing permitted use of, access to, or behaviour within that object | `{"feature": "useRule", "eq": true}` |
| C5-INVARIANT | the operative determinant of the provision is actor-invariant, or the provision restricts the object or content of use | `{"feature": "determinant", "contains": "ACTOR_INVARIANT"}` |

| Exclusion | Test | Redirect | Form | Form basis | Machine expression |
|---|---|---|---|---|---|
| X5-a | the operative determinant of the provision is the actor's role, tier or office identity | SC-7 | FEATURE_TEST | NOT_A_REDIRECT_EXPRESSION; CORR1 concrete SC-5/SC-7 matrix row: 'Where one sentence couples a general use rule to a tier allocation, both predicates fire and the record takes MULTIPLE_CLASS_PREDICATES_SATISFIED unless an R-SEG-B boundary isolates them'. That state is reachable only if X5-a does not exclude SC-5 when an actor-invariant determinant is ALSO witnessed. On any single witnessed value this expression equals CORR3's. | `{"allOf": [{"feature": "determinant", "contains": "ROLE_OR_TIER"}, {"not": {"feature": "determinant", "contains": "ACTOR_INVARIANT"}}]}` |
| X5-b | its operative content is conditions of the participant relationship (fees, obligations, entry or exit) | SC-2 | EXCLUSIVITY | CORR1_CONCRETE_MATRIX_ROW | `{"allOf": [{"feature": "operativeContent", "contains": "PARTICIPATION_TERMS"}, {"not": {"feature": "operativeContent", "contains": "USE_RULE"}}]}` |
| X5-c | it instructs a performer | SC-8 | PRESENCE | CORR1_TEXT_PRESENCE | `{"feature": "operativeContent", "contains": "INSTRUCTION"}` |
| X5-d | a filename, URL host, form label or registry document_type value never establishes C5 | R-FORM | FEATURE_TEST | NOT_A_REDIRECT_EXPRESSION | `{"feature": "metadataOnlyBasis", "eq": true}` |

*Counter-inflation.* A tier-conditional access statement is not actor-invariant and must not be counted as SC-5.

### SC-6 - `retention metrics`

*Function.* The segment measures or reports the repetition, continuation or renewal of participation over time.

*Combinator.* `ALL_OF` over components, `NONE_OF` over exclusions.

| Component | Test | Machine expression |
|---|---|---|
| C6-MEASURE | a quantified or defined measure is present | `{"feature": "measurePresent", "eq": true}` |
| C6-PARTICIPATION | the measured population is the participant base (participants, members, subscribers, users, distributors, agents or an equivalent participant term) | `{"feature": "participantPopulation", "eq": true}` |
| C6-CHRONO | the measure is of continuation, renewal, repetition, return, retention or churn over time and is presented as a measurement or target of that measure | `{"feature": "continuationDimension", "eq": true}` |

| Exclusion | Test | Redirect | Form | Form basis | Machine expression |
|---|---|---|---|---|---|
| X6-a | it is a one-off participant count with no continuation dimension | OUTSIDE_FROZEN_VOCABULARY | FEATURE_TEST | NOT_A_REDIRECT_EXPRESSION | `{"feature": "oneOffCount", "eq": true}` |
| X6-b | the measured quantity is revenue, cost or another financial flow | SC-9 | EXCLUSIVITY | CORR1_CONCRETE_MATRIX_ROW | `{"allOf": [{"feature": "operativeContent", "contains": "REALIZED_FLOW"}, {"not": {"feature": "operativeContent", "contains": "CONTINUATION_MEASURE"}}]}` |
| X6-c | it describes a retention mechanism rather than measuring continuation | SC-2 | EXCLUSIVITY | CORR1_TEXT_MARKER | `{"allOf": [{"feature": "operativeContent", "contains": "PARTICIPATION_TERMS"}, {"not": {"feature": "operativeContent", "contains": "CONTINUATION_MEASURE"}}]}` |
| X6-d | the figures are embedded in an appeal to participants with no measure definition | SC-1 | FEATURE_TEST | NOT_A_REDIRECT_EXPRESSION | `{"allOf": [{"feature": "frameMarkers", "nonEmpty": true}, {"feature": "measurePresent", "eq": false}]}` |
| X6-e | the measured population is not the participation base | OUTSIDE_FROZEN_VOCABULARY | FEATURE_TEST | NOT_A_REDIRECT_EXPRESSION | `{"feature": "nonParticipantPopulation", "eq": true}` |

*Counter-inflation.* A count of meetings, of employees or of sites is not a continuation measure of the participant base.

### SC-7 - `access-rights/role matrices`

*Function.* The segment maps roles, ranks, tiers, positions or offices to entitlements, permissions, access rights or allocations of authority.

*Combinator.* `ALL_OF` over components, `NONE_OF` over exclusions.

| Component | Test | Machine expression |
|---|---|---|
| C7-ROLE | a role, office, position, rank, tier, class or membership level dimension is present | `{"feature": "roleDimension", "eq": true}` |
| C7-ENTITLEMENT | an entitlement, permission, access right, authority, responsibility allocation, seat or office holding, or entitlement-to-value dimension is present | `{"feature": "entitlementDimension", "eq": true}` |
| C7-ALLOCATION | the segment establishes WHICH actor holds WHICH of them, through a mapping, assignment, delegation, composition list or allocation statement | `{"feature": "allocationStatement", "eq": true}` |

| Exclusion | Test | Redirect | Form | Form basis | Machine expression |
|---|---|---|---|---|---|
| X7-a | its operative content is reward amounts, rates or reward eligibility, without an authority or entitlement mapping | SC-3 | EXCLUSIVITY | CORR1_TEXT_MARKER | `{"allOf": [{"feature": "operativeContent", "contains": "REWARD_STRUCTURE"}, {"not": {"feature": "operativeContent", "contains": "ROLE_ALLOCATION"}}]}` |
| X7-b | it governs permitted use of the product or platform actor-invariantly | SC-5 | EXCLUSIVITY | CORR1_CONCRETE_MATRIX_ROW | `{"allOf": [{"feature": "operativeContent", "contains": "USE_RULE"}, {"not": {"feature": "operativeContent", "contains": "ROLE_ALLOCATION"}}]}` |
| X7-c | it instructs a performer how to carry out the role | SC-8 | EXCLUSIVITY | CORR1_CONCRETE_MATRIX_ROW | `{"allOf": [{"feature": "operativeContent", "contains": "INSTRUCTION"}, {"not": {"feature": "operativeContent", "contains": "ROLE_ALLOCATION"}}]}` |
| X7-d | it names persons or offices with no entitlement or authority dimension | OUTSIDE_FROZEN_VOCABULARY | FEATURE_TEST | NOT_A_REDIRECT_EXPRESSION | `{"feature": "rosterWithoutEntitlement", "eq": true}` |
| X7-e | it reports an event that changed rights, with no mapping established by the segment | OUTSIDE_FROZEN_VOCABULARY | FEATURE_TEST | NOT_A_REDIRECT_EXPRESSION | `{"feature": "rightsChangeEventReport", "eq": true}` |

*Counter-inflation.* A committee's naming of the subject matter it oversees does not state reward terms and must not be counted as SC-3.

### SC-8 - `internal manuals/scripts`

*Function.* The segment instructs a performer how to carry out the interaction or operation the system requires.

*Combinator.* `ALL_OF` over components, `NONE_OF` over exclusions.

| Component | Test | Machine expression |
|---|---|---|
| C8-MODE | the segment's operative mode is imperative or instructive and its addressee is a performer | `{"allOf": [{"feature": "imperativeMode", "eq": true}, {"feature": "addressee", "eq": "PERFORMER"}]}` |
| C8-INSTRUCTION | the segment specifies what the performer must say or do in carrying out the interaction or operation | `{"feature": "instructionContent", "eq": true}` |

| Exclusion | Test | Redirect | Form | Form basis | Machine expression |
|---|---|---|---|---|---|
| X8-a | its addressee is a participant rather than a performer | SC-1 | EXCLUSIVITY | CORR1_TEXT_MARKER | `{"allOf": [{"feature": "operativeContent", "contains": "ENGAGEMENT_FRAME"}, {"not": {"feature": "operativeContent", "contains": "INSTRUCTION"}}]}` |
| X8-b | it states terms binding participants rather than instructing the performer | SC-2 | EXCLUSIVITY | CORR1_TEXT_MARKER | `{"allOf": [{"feature": "operativeContent", "contains": "PARTICIPATION_TERMS"}, {"not": {"feature": "operativeContent", "contains": "INSTRUCTION"}}]}` |
| X8-c | it maps roles to entitlements rather than instructing performance | SC-7 | EXCLUSIVITY | CORR1_TEXT_MARKER | `{"allOf": [{"feature": "operativeContent", "contains": "ROLE_ALLOCATION"}, {"not": {"feature": "operativeContent", "contains": "INSTRUCTION"}}]}` |
| X8-d | it describes a practice rather than instructing it (a report about a manual or script) | OUTSIDE_FROZEN_VOCABULARY | FEATURE_TEST | NOT_A_REDIRECT_EXPRESSION | `{"feature": "describesPracticeNotInstruction", "eq": true}` |

*Counter-inflation.* Participant-facing words quoted inside an instruction remain part of the instruction and must not be counted as SC-1.

### SC-9 - `operative/financial records of the participation system`

*Function.* The segment records what actually occurred inside the participation system in operative or financial terms.

*Combinator.* `ALL_OF` over components, `NONE_OF` over exclusions.

| Component | Test | Machine expression |
|---|---|---|
| C9-FLOW | the segment states an operative fact (an event, count, quantity or state of operation) or a financial fact (an amount, receipt, payment, distribution, charge, cost, revenue, asset or liability) of the participation system | `{"feature": "flowPresent", "eq": true}` |
| C9-REALIZED | the segment presents it as having occurred or as occurring, in a stated period or with a realized verb; not as a plan, budget, forecast, target, authorization, entitlement formula or offer | `{"feature": "realized", "eq": true}` |
| C9-ATTACHMENT | at least one documentary attachment test attaches the stated fact to the participation system | `{"feature": "attachmentTests", "nonEmpty": true}` |

| Exclusion | Test | Redirect | Form | Form basis | Machine expression |
|---|---|---|---|---|---|
| X9-a | it is a plan, budget, forecast, target or authorization | SC-3 | FEATURE_TEST | NOT_A_REDIRECT_EXPRESSION | `{"feature": "budgetOrForecast", "eq": true}` |
| X9-b | it states a compensation or reward schedule rather than a realized amount | SC-3 | EXCLUSIVITY | CORR1_TEXT_MARKER | `{"allOf": [{"feature": "operativeContent", "contains": "REWARD_STRUCTURE"}, {"not": {"feature": "operativeContent", "contains": "REALIZED_FLOW"}}]}` |
| X9-c | it states a continuation measure rather than an operative or financial flow | SC-6 | EXCLUSIVITY | CORR1_TEXT_MARKER | `{"allOf": [{"feature": "operativeContent", "contains": "CONTINUATION_MEASURE"}, {"not": {"feature": "operativeContent", "contains": "REALIZED_FLOW"}}]}` |
| X9-d | no P-1..P-5 attachment holds, so the fact is not a fact OF the participation system | OUTSIDE_FROZEN_VOCABULARY | FEATURE_TEST | NOT_A_REDIRECT_EXPRESSION | `{"feature": "attachmentTests", "empty": true}` |

*Counter-inflation.* An issuer-level balance-sheet or capital-market amount that the record does not attach to the arrangement is not a fact of the participation system and must not be counted as SC-9.

### 9.10 Exclusion semantics - the CORR1 reference derivation (MV-SCOPE-1)

Fixes, for every REDIRECT exclusion (an exclusion that sends other-class operative content to another class), the reference Boolean form that the frozen CORR1 candidate itself declares. CORR3 executes exactly that form. Any deviation is a semantic change that must appear in the semantic delta allowlist.

1. EXCLUSIVITY if the frozen CORR1 exclusion text itself contains an explicit exclusivity marker (see literalExclusivityMarkers).
2. EXCLUSIVITY if the frozen CORR1 pairwise matrix row for {this class, redirect class} is a concrete (non mechanism-level) row whose mixed or segmentation text declares that one indivisible segment carrying both functions takes MULTIPLE_CLASS_PREDICATES_SATISFIED; that declaration is reachable only if neither exclusion fires on a segment carrying both tags.
3. PRESENCE otherwise.

| Template | Machine form |
|---|---|
| PRESENCE | `{"feature": "operativeContent", "contains": "<REDIRECT_TAG>"}` |
| EXCLUSIVITY | `{"allOf": [{"feature": "operativeContent", "contains": "<REDIRECT_TAG>"}, {"not": {"feature": "operativeContent", "contains": "<OWN_TAG>"}}]}` |

| Exclusion | CORR1 reference form | Basis | CORR3 form | Implementation form | Parent -> implementation |
|---|---|---|---|---|---|
| X1-a | PRESENCE | CORR1_TEXT_PRESENCE | PRESENCE | PRESENCE | UNCHANGED |
| X1-b | PRESENCE | CORR1_TEXT_PRESENCE | PRESENCE | PRESENCE | UNCHANGED |
| X1-c | PRESENCE | CORR1_TEXT_PRESENCE | PRESENCE | PRESENCE | UNCHANGED |
| X1-d | PRESENCE | CORR1_TEXT_PRESENCE | PRESENCE | PRESENCE | UNCHANGED |
| X1-e | PRESENCE | CORR1_TEXT_PRESENCE | PRESENCE | PRESENCE | UNCHANGED |
| X1-f | PRESENCE | CORR1_TEXT_PRESENCE | PRESENCE | PRESENCE | UNCHANGED |
| X1-g | PRESENCE | CORR1_TEXT_PRESENCE | PRESENCE | PRESENCE | UNCHANGED |
| X2-a | PRESENCE | CORR1_TEXT_PRESENCE | PRESENCE | PRESENCE | UNCHANGED |
| X2-b | EXCLUSIVITY | CORR1_CONCRETE_MATRIX_ROW | EXCLUSIVITY | EXCLUSIVITY | UNCHANGED |
| X2-c | PRESENCE | CORR1_TEXT_PRESENCE | PRESENCE | PRESENCE | UNCHANGED |
| X2-e | PRESENCE | CORR1_TEXT_PRESENCE | PRESENCE | PRESENCE | UNCHANGED |
| X3-c | PRESENCE | CORR1_TEXT_PRESENCE | PRESENCE | PRESENCE | UNCHANGED |
| X3-d | EXCLUSIVITY | CORR1_TEXT_MARKER | EXCLUSIVITY | EXCLUSIVITY | UNCHANGED |
| X5-b | EXCLUSIVITY | CORR1_CONCRETE_MATRIX_ROW | EXCLUSIVITY | EXCLUSIVITY | UNCHANGED |
| X5-c | PRESENCE | CORR1_TEXT_PRESENCE | PRESENCE | PRESENCE | UNCHANGED |
| X6-b | EXCLUSIVITY | CORR1_CONCRETE_MATRIX_ROW | EXCLUSIVITY | EXCLUSIVITY | UNCHANGED |
| X6-c | EXCLUSIVITY | CORR1_TEXT_MARKER | EXCLUSIVITY | EXCLUSIVITY | UNCHANGED |
| X7-a | EXCLUSIVITY | CORR1_TEXT_MARKER | EXCLUSIVITY | EXCLUSIVITY | UNCHANGED |
| X7-b | EXCLUSIVITY | CORR1_CONCRETE_MATRIX_ROW | EXCLUSIVITY | EXCLUSIVITY | UNCHANGED |
| X7-c | EXCLUSIVITY | CORR1_CONCRETE_MATRIX_ROW | EXCLUSIVITY | EXCLUSIVITY | UNCHANGED |
| X8-a | EXCLUSIVITY | CORR1_TEXT_MARKER | EXCLUSIVITY | EXCLUSIVITY | UNCHANGED |
| X8-b | EXCLUSIVITY | CORR1_TEXT_MARKER | EXCLUSIVITY | EXCLUSIVITY | UNCHANGED |
| X8-c | EXCLUSIVITY | CORR1_TEXT_MARKER | EXCLUSIVITY | EXCLUSIVITY | UNCHANGED |
| X9-b | EXCLUSIVITY | CORR1_TEXT_MARKER | EXCLUSIVITY | EXCLUSIVITY | UNCHANGED |
| X9-c | EXCLUSIVITY | CORR1_TEXT_MARKER | EXCLUSIVITY | EXCLUSIVITY | UNCHANGED |

### 9.11 Multi-valued determinant (IV1-SC5-MIXED, preserved)

multi-valued (IV1-SC5-MIXED): every independently witnessed value is preserved through predicate evaluation. An indivisible segment that witnesses both an actor-invariant rule and a role or tier allocation carries both values; neither is collapsed. A single witnessed value behaves exactly as under CORR3.

| Fixture | Case | Computed | Declared expectation |
|---|---|---|---|
| DET-1 | ROLE_OR_TIER only: tier allocation is SC-7 (single value behaves as CORR3) | s1 = ASSIGNED (access-rights/role matrices) \| distinctClassSet = ['access-rights/role matrices'] | reproduced |
| DET-2 | ACTOR_INVARIANT only: actor-invariant use rule is SC-5 (single value behaves as CORR3) | s1 = ASSIGNED (platform/product rules) \| distinctClassSet = ['platform/product rules'] | reproduced |
| DET-3 | CORR3.IV1 counterexample: tier allocation and actor-invariant ban in ONE indivisible sentence | s1 = MULTIPLE_CLASS_PREDICATES_SATISFIED \| distinctClassSet = [] | reproduced |
| DET-3r | The same sentence with the two determinant assertions in REVERSED order | s1 = MULTIPLE_CLASS_PREDICATES_SATISFIED \| distinctClassSet = [] | reproduced |
| DET-4 | The same two functions in lawfully separate segments | s1 = ASSIGNED (access-rights/role matrices); s2 = ASSIGNED (platform/product rules) \| distinctClassSet = ['access-rights/role matrices', 'platform/product rules'] | reproduced |

## 10. `MODULE-R-CMP` - THE SINGLE SC-3 / SC-9 RULE (MV-F02, preserved)

Exactly one rule governs this boundary. (1) A realized payment satisfies SC-9 ONLY when a P-1..P-5 documentary attachment to the participation system is stated by the record. (2) Director, officer or employee remuneration paid through a governance or employment compensation channel is NOT attached to a participation system unless the record itself states a P-1..P-5 attachment. (3) SC-3 requires a stated compensation STRUCTURE (an applicable value, rate, formula or band; an eligibility rule attaching a stated reward; or a reward-form, timing or condition-of-payment provision) - a merely realized amount is not a structure. (4) Consequences: a compensation schedule is SC-3; a schedule together with a realized payment through a non-participation channel is SC-3; a bare realized compensation payment with no stated structure and no attachment is OUTSIDE_FROZEN_VOCABULARY; a stated participation-system structure together with a realized attached amount in one indivisible segment is the genuine mixed case and fails closed.

| Mapping | Components / exclusions |
|---|---|
| sc3Components | C3-OBJECT: rewardObject; C3-PROVISION: rewardProvisions non-empty (B1/B2/B3 are the structure markers) |
| sc3Exclusions | X3-a oversightObjectMentionOnly; X3-b rewardModality == REALIZED; X3-c continuationDimension; X3-d role/entitlement map without reward; X3-e competitivePayNarrative |
| sc9Components | C9-FLOW: flowPresent; C9-REALIZED: realized; C9-ATTACHMENT: attachmentTests non-empty (P-1..P-5) |
| sc9Exclusions | X9-a budgetOrForecast; X9-b reward structure stated with no realized amount; X9-c continuation measure without a flow; X9-d attachmentTests empty |
| structureRequirementExecutedBy | C3-PROVISION (a B1/B2/B3 structure marker must be witnessed); X3-b (a realized-only reward modality excludes SC-3); FC-2 (a STRUCTURE or BOTH modality requires structureStated) |
| phantomComponentRemoved | CORR2 cited a component 'C3-STRUCTURE' that the executable SC-3 predicate never contained; CORR3 cites the components that actually execute the clause-(3) structure requirement. Behaviour is unchanged. |

Prohibited bases: any M, D or TT conclusion; any Environment determination; filing form; case-specific exception.

| Fixture | Case | Computed | Declared expectation |
|---|---|---|---|
| MVF02-1 | SC-3 schedule only | s1 = ASSIGNED (compensation plans) \| distinctClassSet = ['compensation plans'] | reproduced |
| MVF02-2 | SC-9 explicit participant-system realized flow | s1 = ASSIGNED (operative/financial records of the participation system) \| distinctClassSet = ['operative/financial records of the participation system'] | reproduced |
| MVF02-3 | CANONICAL MV-F02 witness - director fees, schedule plus realized payment | s1 = ASSIGNED (compensation plans) \| distinctClassSet = ['compensation plans'] | reproduced |
| MVF02-4 | Bare realized director payment - no stated structure, no attachment | s1 = OUTSIDE_FROZEN_VOCABULARY \| distinctClassSet = [] | reproduced |
| MVF02-5 | Participation-system structure plus realized attached amount in ONE indivisible sentence | s1 = MULTIPLE_CLASS_PREDICATES_SATISFIED \| distinctClassSet = [] | reproduced |
| MVF02-6 | Same material under separate headings | s1 = ASSIGNED (compensation plans); s2 = ASSIGNED (operative/financial records of the participation system) \| distinctClassSet = ['compensation plans', 'operative/financial records of the participation system'] | reproduced |
| MVF02-7 | Company-wide financial statement, no participation-system attachment | s1 = OUTSIDE_FROZEN_VOCABULARY \| distinctClassSet = [] | reproduced |

## 11. `MODULE-R-SEG` - ONE SEGMENTATION RULE (MV-F03, preserved)

Exactly one segmentation rule applies to every boundary, including SC-2 vs SC-5. Atoms are sentences and numbered elements. A new segment starts only at a lawful separator: sentence, heading, numbered clause, numbered sub-clause, table row, exhibit boundary, page or section label. A comma, a conjunction, a line wrap or a column break does NOT start a segment: the units it joins are one indivisible segment. Classification evaluates the FULL supplying basis and segmentation is attempted at most once.

| Item | Value |
|---|---|
| atom | the smallest documentary unit: a numbered sub-clause where the text is sub-clause structured, otherwise the record's own sentence |
| lawful separators | SENTENCE, HEADING, NUMBERED_CLAUSE, NUMBERED_SUBCLAUSE, TABLE_ROW, EXHIBIT, PAGE_OR_SECTION_LABEL |
| not separators | COMMA, CONJUNCTION, LINE_WRAP, COLUMN_BREAK, SENTENCE_INTERNAL_CLAUSE |
| start marker | START |
| conjoined marker | NONE |
| on indivisible multi-function | MULTIPLE_CLASS_PREDICATES_SATISFIED |
| grouping key | underlyingDocumentIdentity, canonicalSegmentIdentity |

**Separator evidence (a declared boundary must be physically evidenced).** A declared separator must be physically evidenced by the bound spans; a coder cannot invent a boundary. units of one supplying basis are in ascending document order and do not overlap two consecutive units are ADJACENT iff the extracted text between them matches gapWhitespacePattern separatorBefore = NONE requires ADJACENT units

| Separator (when units are adjacent) | Evidence rule |
|---|---|
| SENTENCE | `{"previousUnitCanonicalEndsWith": "[.!?][\"')\\]]*$"}` + continuation guard `LOWERCASE_CONTINUATION_AFTER_ATERM` (section 11a) + documentary interval and entity-name veto (section 11b) |
| NUMBERED_CLAUSE | `{"unitCanonicalStartsWith": "^(\\(?[0-9]{1,3}[.)]\|\\(?[a-z][.)]\|\\(?[ivxlc]{1,6}[.)])\\s"}` |
| NUMBERED_SUBCLAUSE | `{"unitCanonicalStartsWith": "^(\\(?[0-9]{1,3}[.)]\|\\(?[a-z][.)]\|\\(?[ivxlc]{1,6}[.)])\\s"}` |
| TABLE_ROW | `{"gapContains": "\\n"}` |
| HEADING | `{"forbiddenWhenAdjacent": true}` |
| EXHIBIT | `{"forbiddenWhenAdjacent": true}` |
| PAGE_OR_SECTION_LABEL | `{"forbiddenWhenAdjacent": true}` |

When units are not adjacent: any lawful separator is accepted: physical intervening text exists between the units - except SENTENCE, which is a claim verified on the documentary interval (whenAdjacent.SENTENCE.documentaryInterval). a separator that is not in lawfulSeparators, or a lawful separator whose evidence rule fails, is a coder-invented boundary and the record is rejected

### 11a. `LOWERCASE_CONTINUATION_AFTER_ATERM` - the continuation guard of the SENTENCE evidence

*Basis.* a bounded analogue of the Unicode UAX #29 sentence-boundary rule SB8 (ATerm Close* Sp* x ... Lower): an ambiguous full stop does not establish a sentence break when, after permitted closing punctuation and spacing, the first following cased letter is lowercase. It is not the UAX #29 algorithm, it is not an abbreviation resolver, and it holds no list of abbreviations.

*Rule.* A SENTENCE separator is NOT PROVEN by its frozen evidence when the terminal that ends the previous unit (or the junction material) is an ambiguous terminal (a full stop) and the text after it, past permitted closing punctuation (a closing quote, parenthesis or bracket) and spacing (spaces, line wraps), begins with a lowercase letter (Unicode lowercase) or with an ASCII decimal digit 0-9 (asciiDigitContinuation, IV1-F1 of the CORR1 correction). The guard is part of the SENTENCE evidence itself: it applies wherever that evidence is read - to a SENTENCE a record declares between adjacent units (the record is then rejected as a coder-invented boundary, segmentation.separatorEvidence.violation) and to the frozen evidence the touching-atom relation reads between two cores.

| Item | Value |
|---|---|
| decision | `FIRST_CASED_LETTER_AFTER_CLOSERS_AND_SPACING` |
| ambiguous terminals | `.` |
| terminal at the end of the previous unit | `([.!?])(?:["')\]]\|\s)*$` |
| permitted between the terminal and the next letter | `(?:["')\]”]\|\s)*` |
| case test | `UNICODE_LOWERCASE` |
| ASCII digit continuation (SOURCECLASS-SENTENCE-BOUNDARY-EVIDENCE-INTEGRITY-CLOSURE-1.CORR1; closes IV1-F1 (a full stop before a numeric continuation remained usable as SENTENCE evidence)) | `0123456789` - after the same terminal / closer / spacing scan (betweenPattern), an ASCII decimal digit 0-9 is treated as a lowercase continuation is: an ambiguous full stop followed by it does not prove SENTENCE. No other character class; '?' and '!' and an uppercase continuation (R-M2-CASE-B) unchanged |
| effect | `SEPARATOR_NOT_PROVEN` |
| applies to | `DECLARED_SEPARATOR`, `COMPLETE_VIEW_JUNCTION` |
| declared-separator view | the previous unit, the gap and the next unit, each under the R-EQV canonicalization ops of the unit's recipe except the ops named here: markup and entities become spaces and whitespace runs one space, while the full stop, the closing punctuation, the spacing and the letter case stay (omitted ops: casefold, strip) |
| complete-view junction view | the complete view of each rendition member before its casefold and its letters-and-digits filter: the letter that follows a junction keeps its case; the junction material itself is read as before (omitted ops: `{"op": "casefold"}`, `{"op": "regex", "pattern": "[\\W_]+", "flags": [], "repl": ""}`) |

*Unchanged:* a question mark or an exclamation mark (not ambiguous terminals): their evidence is the parent's; a full stop followed by an uppercase letter, an uncased letter or any other material except an ASCII decimal digit 0-9 (withheld by asciiDigitContinuation, IV1-F1 of the CORR1 correction): the parent's evidence (this act does not decide whether such a full stop ends a sentence); segmentation.atom, lawfulSeparators, notSeparators, adjacency, whenNotAdjacent and every other separator's evidence. *Never authority:* an abbreviation list; the whole UAX #29 algorithm; locator prose; R-EQV text whose casefold has erased the case the guard reads.

| Fixture | Case | Computed (state; relation; count disposition) | Declared expectation |
|---|---|---|---|
| SE-D1 | DECISIVE: '... at Acme Inc. under which the annual retainer ...' - two records split the sentence at the abbreviation's full stop (SC-7 / SC-3); the lowercase 'under' continues the sentence -> no SENTENCE boundary, same atom, one conflicting component | N0#s1 = ASSIGNED (access-rights/role matrices) [WITHHELD_CONFLICTING_OVERLAP]; N1#s1 = ASSIGNED (compensation plans) [WITHHELD_CONFLICTING_OVERLAP] \| N0#s1\|N1#s1 TOUCHING_SAME_ATOM \| distinctClassSet = [] | reproduced |
| SE-D2 | DECISIVE: the same physical construction through ONE record that declares SENTENCE after 'Inc.' - the corrected shared evidence does not prove it: the declaration is a coder-invented boundary and the record is rejected (SEPARATOR_EVIDENCE_FAILED) | rejected: SEPARATOR_EVIDENCE_FAILED | reproduced |
| SE-D3 | DECISIVE: '... Acme Inc.) under which ...' - a closing parenthesis between the full stop and the lowercase continuation -> no sentence break | N0#s1 = ASSIGNED (access-rights/role matrices) [WITHHELD_CONFLICTING_OVERLAP]; N1#s1 = ASSIGNED (compensation plans) [WITHHELD_CONFLICTING_OVERLAP] \| N0#s1\|N1#s1 TOUCHING_SAME_ATOM \| distinctClassSet = [] | reproduced |
| SE-D3-Q | a closing quotation mark between the full stop and the lowercase continuation ('Inc." under') -> no sentence break | N0#s1 = ASSIGNED (access-rights/role matrices) [WITHHELD_CONFLICTING_OVERLAP]; N1#s1 = ASSIGNED (compensation plans) [WITHHELD_CONFLICTING_OVERLAP] \| N0#s1\|N1#s1 TOUCHING_SAME_ATOM \| distinctClassSet = [] | reproduced |
| SE-D3-B | a closing bracket between the full stop and the lowercase continuation ('Inc.] under') -> no sentence break | N0#s1 = ASSIGNED (access-rights/role matrices) [WITHHELD_CONFLICTING_OVERLAP]; N1#s1 = ASSIGNED (compensation plans) [WITHHELD_CONFLICTING_OVERLAP] \| N0#s1\|N1#s1 TOUCHING_SAME_ATOM \| distinctClassSet = [] | reproduced |
| SE-D3-S | a SENTENCE declared by one record after 'Inc.)' before a lowercase continuation -> rejected (SEPARATOR_EVIDENCE_FAILED) | rejected: SEPARATOR_EVIDENCE_FAILED | reproduced |
| SE-D4 | another abbreviation ('... at Acme Co. whereby the access matrix ...', SC-3 / SC-7): the decision follows the continuation, not a list of tokens -> no sentence break | N0#s1 = ASSIGNED (compensation plans) [WITHHELD_CONFLICTING_OVERLAP]; N1#s1 = ASSIGNED (access-rights/role matrices) [WITHHELD_CONFLICTING_OVERLAP] \| N0#s1\|N1#s1 TOUCHING_SAME_ATOM \| distinctClassSet = [] | reproduced |
| SE-D5 | a non-ASCII lowercase continuation ('... Acme Inc. über which ...'): Unicode lowercase -> no sentence break | N0#s1 = ASSIGNED (access-rights/role matrices) [WITHHELD_CONFLICTING_OVERLAP]; N1#s1 = ASSIGNED (compensation plans) [WITHHELD_CONFLICTING_OVERLAP] \| N0#s1\|N1#s1 TOUCHING_SAME_ATOM \| distinctClassSet = [] | reproduced |
| SE-D6 | the abbreviation's full stop followed by a line wrap and a lowercase continuation -> no sentence break | N0#s1 = ASSIGNED (access-rights/role matrices) [WITHHELD_CONFLICTING_OVERLAP]; N1#s1 = ASSIGNED (compensation plans) [WITHHELD_CONFLICTING_OVERLAP] \| N0#s1\|N1#s1 TOUCHING_SAME_ATOM \| distinctClassSet = [] | reproduced |
| SE-D7 | an ellipsis followed by a lowercase continuation ('... Acme Inc... under which ...') -> no sentence break | N0#s1 = ASSIGNED (access-rights/role matrices) [WITHHELD_CONFLICTING_OVERLAP]; N1#s1 = ASSIGNED (compensation plans) [WITHHELD_CONFLICTING_OVERLAP] \| N0#s1\|N1#s1 TOUCHING_SAME_ATOM \| distinctClassSet = [] | reproduced |
| SE-D1-X | SE-D1 across two HTML renditions of one document (FRAME-C) | N0#s1 = ASSIGNED (access-rights/role matrices) [WITHHELD_CONFLICTING_OVERLAP]; N1#s1 = ASSIGNED (compensation plans) [WITHHELD_CONFLICTING_OVERLAP] \| N0#s1\|N1#s1 TOUCHING_SAME_ATOM \| distinctClassSet = [] | reproduced |
| SE-D1-U | SE-D1 in FRAME-U (two renditions whose complete views differ): the lowercase continuation read in every member | N0#s1 = ASSIGNED (access-rights/role matrices) [WITHHELD_CONFLICTING_OVERLAP]; N1#s1 = ASSIGNED (compensation plans) [WITHHELD_CONFLICTING_OVERLAP] \| N0#s1\|N1#s1 TOUCHING_SAME_ATOM \| distinctClassSet = [] | reproduced |
| SE-C1 | same class across the abbreviation's full stop (SC-7 / SC-7): one component, one contribution | N0#s1 = ASSIGNED (access-rights/role matrices) [COLLAPSED_SAME_CLASS_OVERLAP]; N1#s1 = ASSIGNED (access-rights/role matrices) [COLLAPSED_SAME_CLASS_OVERLAP] \| N0#s1\|N1#s1 TOUCHING_SAME_ATOM \| distinctClassSet = ['access-rights/role matrices'] | reproduced |
| SE-P1 | CONTROL: '... Acme Inc. Under which ...' - a full stop before an UPPERCASE letter keeps the parent's evidence -> DIFFERENT_ATOMS, both classes count | N0#s1 = ASSIGNED (access-rights/role matrices) [CLEAR_SINGLETON]; N1#s1 = ASSIGNED (compensation plans) [CLEAR_SINGLETON] \| N0#s1\|N1#s1 DIFFERENT_ATOMS \| distinctClassSet = ['access-rights/role matrices', 'compensation plans'] | reproduced |
| SE-P1-S | CONTROL: one record declares SENTENCE after 'Inc.' before an uppercase letter -> accepted, two count units | N0#s1 = ASSIGNED (access-rights/role matrices) [CLEAR_SINGLETON]; N0#s2 = ASSIGNED (compensation plans) [CLEAR_SINGLETON] \| N0#s1\|N0#s2 DIFFERENT_ATOMS \| distinctClassSet = ['access-rights/role matrices', 'compensation plans'] | reproduced |
| SE-P2 | CONTROL: two complete sentences ('... in cash. The access matrix ...') -> DIFFERENT_ATOMS | N0#s1 = ASSIGNED (compensation plans) [CLEAR_SINGLETON]; N1#s1 = ASSIGNED (access-rights/role matrices) [CLEAR_SINGLETON] \| N0#s1\|N1#s1 DIFFERENT_ATOMS \| distinctClassSet = ['access-rights/role matrices', 'compensation plans'] | reproduced |
| SE-P2-S | CONTROL: two complete sentences as two segments of one record (SENTENCE declared) -> accepted | N0#s1 = ASSIGNED (compensation plans) [CLEAR_SINGLETON]; N0#s2 = ASSIGNED (access-rights/role matrices) [CLEAR_SINGLETON] \| N0#s1\|N0#s2 DIFFERENT_ATOMS \| distinctClassSet = ['access-rights/role matrices', 'compensation plans'] | reproduced |
| SE-P3 | CONTROL: a question mark before an uppercase letter ('... Acme Inc? Under which ...') -> DIFFERENT_ATOMS | N0#s1 = ASSIGNED (access-rights/role matrices) [CLEAR_SINGLETON]; N1#s1 = ASSIGNED (compensation plans) [CLEAR_SINGLETON] \| N0#s1\|N1#s1 DIFFERENT_ATOMS \| distinctClassSet = ['access-rights/role matrices', 'compensation plans'] | reproduced |
| SE-P3-L | CONTROL: a question mark before a LOWERCASE letter ('... Acme Inc? under which ...') - not an ambiguous terminal: the parent's evidence -> DIFFERENT_ATOMS | N0#s1 = ASSIGNED (access-rights/role matrices) [CLEAR_SINGLETON]; N1#s1 = ASSIGNED (compensation plans) [CLEAR_SINGLETON] \| N0#s1\|N1#s1 DIFFERENT_ATOMS \| distinctClassSet = ['access-rights/role matrices', 'compensation plans'] | reproduced |
| SE-P3-S | CONTROL: SENTENCE declared after a question mark before a lowercase letter -> accepted | N0#s1 = ASSIGNED (access-rights/role matrices) [CLEAR_SINGLETON]; N0#s2 = ASSIGNED (compensation plans) [CLEAR_SINGLETON] \| N0#s1\|N0#s2 DIFFERENT_ATOMS \| distinctClassSet = ['access-rights/role matrices', 'compensation plans'] | reproduced |
| SE-P4 | CONTROL: an exclamation mark before an uppercase letter -> DIFFERENT_ATOMS | N0#s1 = ASSIGNED (access-rights/role matrices) [CLEAR_SINGLETON]; N1#s1 = ASSIGNED (compensation plans) [CLEAR_SINGLETON] \| N0#s1\|N1#s1 DIFFERENT_ATOMS \| distinctClassSet = ['access-rights/role matrices', 'compensation plans'] | reproduced |
| SE-P4-L | CONTROL: an exclamation mark before a LOWERCASE letter - not an ambiguous terminal -> DIFFERENT_ATOMS | N0#s1 = ASSIGNED (access-rights/role matrices) [CLEAR_SINGLETON]; N1#s1 = ASSIGNED (compensation plans) [CLEAR_SINGLETON] \| N0#s1\|N1#s1 DIFFERENT_ATOMS \| distinctClassSet = ['access-rights/role matrices', 'compensation plans'] | reproduced |
| SE-P4-S | CONTROL: SENTENCE declared after an exclamation mark before a lowercase letter -> accepted | N0#s1 = ASSIGNED (access-rights/role matrices) [CLEAR_SINGLETON]; N0#s2 = ASSIGNED (compensation plans) [CLEAR_SINGLETON] \| N0#s1\|N0#s2 DIFFERENT_ATOMS \| distinctClassSet = ['access-rights/role matrices', 'compensation plans'] | reproduced |
| SE-EVID-NA | CLOSED (was a disclosure, carried R7-EVIDENCE): ONE record declares SENTENCE between units that EXCLUDE the full stop ('... at Acme Inc' \| '. ' \| 'under which ...'); the documentary interval holds only a full stop before a lowercase continuation -> rejected | rejected: SEPARATOR_EVIDENCE_FAILED | reproduced |

### 11b. `SENTENCE_EVIDENCE_ON_DOCUMENTARY_INTERVAL` and `ENTITY_INTERNAL_PERIOD_NOT_SENTENCE_EVIDENCE` - the SENTENCE evidence integrity of this act

**Closes IV1-M1 (non-adjacent SENTENCE declaration bypass).** *Applies to:* a SENTENCE declared between NON-adjacent units (adjacent units keep the parent's evidence rule). *Rule.* separatorBefore = SENTENCE between non-adjacent units is a CLAIM, verified on the actual documentary interval: the previous unit's ending, the gap the coder left out (punctuation, closers, spacing, line wraps, words) and the next unit, in extracted-text coordinates. It is proven iff some terminal at the end of the previous unit or inside the gap, followed by permitted closers and spacing (or by the end of the gap), is neither withheld by the continuation guard nor vetoed by the entity-name veto. Otherwise the record is rejected (segmentation.separatorEvidence.violation). Trimming punctuation out of a unit never makes SENTENCE evidence disappear or appear.

| Item | Value |
|---|---|
| candidates | `PREVIOUS_UNIT_END_AND_GAP` |
| terminal inside the omitted gap | `([.!?])(?:["')\]])*(?=\s\|$)` |
| closers in the gap | `READ` |

*Unchanged:* adjacent units: the parent's previousUnitCanonicalEndsWith and continuation guard; every other separator (NUMBERED_CLAUSE, NUMBERED_SUBCLAUSE, TABLE_ROW, HEADING, EXHIBIT, PAGE_OR_SECTION_LABEL) and its evidence; segmentation.atom, lawfulSeparators, notSeparators, adjacency, violation. *Never authority:* fuzzy reconstruction; the coder's unit boundaries; an abbreviation list.

**Closes IV1-M2 case A (a full stop inside a PROVEN authoritative entity-name occurrence span).** *Predicate.* occurrenceStart <= candidatePeriodOffset < occurrenceEnd for ANY member of the complete set of proven occurrence spans of every usable authority record bound to the same artifact; candidatePeriodOffset is the code-point offset of the full stop in the artifact decoded as the authority decodes it (declared path: the extraction's origin map; touching path: the complete view's origin map). *Effect.* ENTITY_INTERNAL_PERIOD: the full stop is INELIGIBLE to prove SENTENCE. Negative evidence only: the veto never creates a boundary, and the absence of a usable authority record proves nothing (the parent's evidence stands - see residual R-M2-CASE-B).

| Item | Value |
|---|---|
| terminals | `.` |
| applies to | `DECLARED_SEPARATOR`, `COMPLETE_VIEW_JUNCTION` |
| span selection | `ANY_SPAN` (the complete set; never a first, nearest or best span) |
| offset view | `DECODED_ARTIFACT` |
| authority | `SEC-HISTORICAL-ENTITY-NAME-AUTHORITY-1.IMPLEMENTATION-1.CORR1` - CANDIDATE_DEPENDENCY_NOT_CONTROLLING (NOT_INDEPENDENTLY_VERIFIED, NOT_OWNER_ACCEPTED, NOT_CONTROLLING) |
| authority manifest / RECORDS | `6b0d3622f2ecf506caf969fd18f23275f606dc809cf72dface4d33ce17b62e8e` / `82259f132f3389a5fa26394481bdc42773db71a8c61bd12fd240576f14f23e46` |
| input | corpus.entityNameAuthority = {recordsSha256, records}: the authority's records, read-only; recordsSha256 is SHA-256 of their canonical JSON (the model's serialization rule) |
| required constants | `{"authorityVersion": "SEC-HISTORICAL-ENTITY-NAME-AUTHORITY-1.CORR1", "equivalenceRule": "ENTITY_NAME_EQUIVALENCE_v1", "entityInternalPeriodRule": "CANDIDATE_OFFSET_STRICTLY_INSIDE_ANY_SPAN", "entityIdType": "SEC_CIK"}` |
| proven states | `{"temporalState": "PROVEN", "occurrenceState": "PROVEN"}` |
| entity id | `^[0-9]{10}$` |
| coordinate view (decoder) | `UTF8_REPLACE` |
| binding checks | `RECORDS_DIGEST`, `AUTHORITY_CONSTANTS`, `ARTIFACT_ID`, `ARTIFACT_DIGEST`, `COORDINATE_VIEW`, `PROVEN_STATES`, `ENTITY_ID`, `SPAN_SET`, `SPAN_TEXT` |
| records digest failure | `ENTITY_NAME_AUTHORITY_MISMATCH` (the corpus is rejected) |
| refusal reasons | AUTHORITY_CONSTANTS -> `AUTHORITY_CONSTANTS_MISMATCH`; ARTIFACT_ID -> `AUTHORITY_ARTIFACT_NOT_IN_CORPUS`; ARTIFACT_DIGEST -> `AUTHORITY_ARTIFACT_DIGEST_MISMATCH`; COORDINATE_VIEW -> `AUTHORITY_COORDINATE_VIEW_MISMATCH`; PROVEN_STATES -> `AUTHORITY_NOT_PROVEN`; ENTITY_ID -> `AUTHORITY_ENTITY_ID_INVALID`; SPAN_SET -> `AUTHORITY_SPAN_SET_INVALID`; SPAN_TEXT -> `AUTHORITY_SPAN_TEXT_MISMATCH` |
| usable | `AUTHORITY_RECORD_USABLE` |
| never inferred inside sourceClass | a CIK; an entity name; a current or historical name; an occurrence span; ENTITY_NAME_EQUIVALENCE_v1 itself |

**Residual.** R-M2-CASE-B (OWNER-ACCEPTED BOUNDED RESIDUAL): where no usable authority record proves an occurrence span over the full stop (authority absent, AUTHORITY_NOT_DETERMINABLE, ENTITY_NAME_SPANS_NOT_PROVEN, or refused), a full stop followed by an uppercase continuation keeps the parent's SENTENCE evidence; an uppercase continuation inside an unproven compound entity name may still be treated as a sentence boundary.

*Never authority:* an abbreviation list; capitalization; NER; fuzzy or normalized name matching inside sourceClass; a ticker; a URL path or accession prefix; string equality of names across artifacts.

| Fixture | Case | Computed (state; relation; count disposition) | Declared expectation |
|---|---|---|---|
| BI-M1-IV1 | IV1-M1 EXACT (Codex): one record, unit 1 ends at 'Acme Inc' EXCLUDING its full stop, the omitted gap is '. ', unit 2 starts 'under which' and declares SENTENCE -> the documentary interval proves no boundary: rejected | rejected: SEPARATOR_EVIDENCE_FAILED | reproduced |
| BI-M1-IV1-P | IV1-M1 EXACT with a closing parenthesis in the omitted gap ('.) ') -> rejected | rejected: SEPARATOR_EVIDENCE_FAILED | reproduced |
| BI-M1-IV1-QB | IV1-M1 EXACT with closers '")]' in the omitted gap ('.")] ') -> rejected | rejected: SEPARATOR_EVIDENCE_FAILED | reproduced |
| BI-M1-D1N | omitted gap '.\n' before a lowercase continuation, declared -> rejected | rejected: SEPARATOR_EVIDENCE_FAILED | reproduced |
| BI-M1-D1U | omitted gap '. ' before a Unicode lowercase continuation ('über'), declared -> rejected | rejected: SEPARATOR_EVIDENCE_FAILED | reproduced |
| BI-M1-D1W | the omitted gap holds words and the period (' Inc. '), declared -> rejected | rejected: SEPARATOR_EVIDENCE_FAILED | reproduced |
| BI-M1-D1C | the omitted gap holds no terminal at all (', '), declared -> no SENTENCE evidence: rejected | rejected: SEPARATOR_EVIDENCE_FAILED | reproduced |
| BI-M1-D4 | M1-D4: the same bytes split across two records -> one atom, conflicting classes withheld, srcDiv false | L#s1 = ASSIGNED (access-rights/role matrices) [WITHHELD_CONFLICTING_OVERLAP]; R#s1 = ASSIGNED (compensation plans) [WITHHELD_CONFLICTING_OVERLAP] \| L#s1\|R#s1 TOUCHING_SAME_ATOM \| distinctClassSet = [] | reproduced |
| BI-M1-D4C | M1-D4 with '.) ' -> one atom, srcDiv false | L#s1 = ASSIGNED (access-rights/role matrices) [WITHHELD_CONFLICTING_OVERLAP]; R#s1 = ASSIGNED (compensation plans) [WITHHELD_CONFLICTING_OVERLAP] \| L#s1\|R#s1 TOUCHING_SAME_ATOM \| distinctClassSet = [] | reproduced |
| BI-M1-D5 | M1-D5: whole-sentence mixed control -> MULTIPLE_CLASS_PREDICATES_SATISFIED, srcDiv false | W#s1 = MULTIPLE_CLASS_PREDICATES_SATISFIED \| no pair \| distinctClassSet = [] | reproduced |
| BI-M1-P1 | CONTROL: omitted '. ' before an UPPERCASE continuation, declared -> genuine sentence evidence: accepted, two classes | D#s1 = ASSIGNED (access-rights/role matrices) [CLEAR_SINGLETON]; D#s2 = ASSIGNED (compensation plans) [CLEAR_SINGLETON] \| D#s1\|D#s2 DIFFERENT_ATOMS \| distinctClassSet = ['access-rights/role matrices', 'compensation plans'] | reproduced |
| BI-M1-P2 | CONTROL: the omitted gap holds a whole skipped sentence, declared -> accepted | D#s1 = ASSIGNED (access-rights/role matrices) [CLEAR_SINGLETON]; D#s2 = ASSIGNED (compensation plans) [CLEAR_SINGLETON] \| D#s1\|D#s2 DIFFERENT_ATOMS \| distinctClassSet = ['access-rights/role matrices', 'compensation plans'] | reproduced |
| BI-M1-P3 | CONTROL: a skipped sentence in the gap, the next unit starts lowercase -> the boundary after 'Inc.' is genuine: accepted | D#s1 = ASSIGNED (access-rights/role matrices) [CLEAR_SINGLETON]; D#s2 = ASSIGNED (compensation plans) [CLEAR_SINGLETON] \| D#s1\|D#s2 DIFFERENT_ATOMS \| distinctClassSet = ['access-rights/role matrices', 'compensation plans'] | reproduced |
| BI-M1-P4 | CONTROL: omitted '? ' before a lowercase letter ('?' is not ambiguous) -> accepted | D#s1 = ASSIGNED (access-rights/role matrices) [CLEAR_SINGLETON]; D#s2 = ASSIGNED (compensation plans) [CLEAR_SINGLETON] \| D#s1\|D#s2 DIFFERENT_ATOMS \| distinctClassSet = ['access-rights/role matrices', 'compensation plans'] | reproduced |
| BI-M1-P5 | CONTROL: omitted '! ' before a lowercase letter -> accepted | D#s1 = ASSIGNED (access-rights/role matrices) [CLEAR_SINGLETON]; D#s2 = ASSIGNED (compensation plans) [CLEAR_SINGLETON] \| D#s1\|D#s2 DIFFERENT_ATOMS \| distinctClassSet = ['access-rights/role matrices', 'compensation plans'] | reproduced |
| BI-M1-P6 | CONTROL: adjacent units, unit 1 includes 'Inc.' and unit 2 starts uppercase (the parent's adjacent path) -> accepted | D#s1 = ASSIGNED (access-rights/role matrices) [CLEAR_SINGLETON]; D#s2 = ASSIGNED (compensation plans) [CLEAR_SINGLETON] \| D#s1\|D#s2 DIFFERENT_ATOMS \| distinctClassSet = ['access-rights/role matrices', 'compensation plans'] | reproduced |
| BI-M2-D1 | M2-D1: stipulated complete name 'Acme Inc. International', two records split after 'Inc.'; a PROVEN authority span covers the full stop -> the full stop cannot prove SENTENCE: one atom, srcDiv false | L#s1 = ASSIGNED (access-rights/role matrices) [WITHHELD_CONFLICTING_OVERLAP]; R#s1 = ASSIGNED (compensation plans) [WITHHELD_CONFLICTING_OVERLAP] \| L#s1\|R#s1 TOUCHING_SAME_ATOM \| distinctClassSet = [] | reproduced |
| BI-M2-D1S | M2-D1 through ONE record declaring SENTENCE after 'Inc.' -> rejected | rejected: SEPARATOR_EVIDENCE_FAILED | reproduced |
| BI-M2-D2 | M2-D2: two occurrences; the target full stop is in occurrence #2 (two records) -> set membership catches it | L#s1 = ASSIGNED (access-rights/role matrices) [WITHHELD_CONFLICTING_OVERLAP]; R#s1 = ASSIGNED (compensation plans) [WITHHELD_CONFLICTING_OVERLAP] \| L#s1\|R#s1 TOUCHING_SAME_ATOM \| distinctClassSet = [] | reproduced |
| BI-M2-D2S | M2-D2, declared | rejected: SEPARATOR_EVIDENCE_FAILED | reproduced |
| BI-M2-D3 | M2-D3: fifteen occurrences; the target is #15 (two records) -> caught | L#s1 = ASSIGNED (access-rights/role matrices) [WITHHELD_CONFLICTING_OVERLAP]; R#s1 = ASSIGNED (compensation plans) [WITHHELD_CONFLICTING_OVERLAP] \| L#s1\|R#s1 TOUCHING_SAME_ATOM \| distinctClassSet = [] | reproduced |
| BI-M2-D3S | M2-D3, declared | rejected: SEPARATOR_EVIDENCE_FAILED | reproduced |
| BI-M2-NEAR | nearest-span trap: occurrence #1 opens unit 1, the target full stop is in occurrence #2 across the junction (two records) -> the complete set catches it | L#s1 = ASSIGNED (access-rights/role matrices) [WITHHELD_CONFLICTING_OVERLAP]; R#s1 = ASSIGNED (compensation plans) [WITHHELD_CONFLICTING_OVERLAP] \| L#s1\|R#s1 TOUCHING_SAME_ATOM \| distinctClassSet = [] | reproduced |
| BI-M2-NEARS | nearest-span trap, declared | rejected: SEPARATOR_EVIDENCE_FAILED | reproduced |
| BI-M2-HTML | coordinate view: an HTML rendition with a long tag prefix; the authority spans are in decoded-artifact coordinates (two records) -> caught through the complete view's origin map | L#s1 = ASSIGNED (access-rights/role matrices) [WITHHELD_CONFLICTING_OVERLAP]; R#s1 = ASSIGNED (compensation plans) [WITHHELD_CONFLICTING_OVERLAP] \| L#s1\|R#s1 TOUCHING_SAME_ATOM \| distinctClassSet = [] | reproduced |
| BI-M2-HTMLS | coordinate view, declared -> caught through the extraction's origin map | rejected: SEPARATOR_EVIDENCE_FAILED | reproduced |
| BI-M2-C1 | M2-C1: authoritative name 'Acme Inc' whose span ends before the sentence full stop ('Acme Inc. The company ...') -> the authority does not absorb the sentence period: two classes | L#s1 = ASSIGNED (access-rights/role matrices) [CLEAR_SINGLETON]; R#s1 = ASSIGNED (compensation plans) [CLEAR_SINGLETON] \| L#s1\|R#s1 DIFFERENT_ATOMS \| distinctClassSet = ['access-rights/role matrices', 'compensation plans'] | reproduced |
| BI-M2-C2-DIGEST | M2-C2: an authority record naming a wrong artifact digest, whose span covers a GENUINE sentence period -> refused: the boundary stands | L#s1 = ASSIGNED (access-rights/role matrices) [CLEAR_SINGLETON]; R#s1 = ASSIGNED (compensation plans) [CLEAR_SINGLETON] \| L#s1\|R#s1 DIFFERENT_ATOMS \| distinctClassSet = ['access-rights/role matrices', 'compensation plans'] | reproduced |
| BI-M2-C2-ARTIFACT | M2-C2: a record for another artifact (cross-artifact transfer) -> refused | L#s1 = ASSIGNED (access-rights/role matrices) [CLEAR_SINGLETON]; R#s1 = ASSIGNED (compensation plans) [CLEAR_SINGLETON] \| L#s1\|R#s1 DIFFERENT_ATOMS \| distinctClassSet = ['access-rights/role matrices', 'compensation plans'] | reproduced |
| BI-M2-C2-SHIFT | M2-C2: coordinates shifted by one (span text differs from the artifact slice) -> refused | L#s1 = ASSIGNED (access-rights/role matrices) [CLEAR_SINGLETON]; R#s1 = ASSIGNED (compensation plans) [CLEAR_SINGLETON] \| L#s1\|R#s1 DIFFERENT_ATOMS \| distinctClassSet = ['access-rights/role matrices', 'compensation plans'] | reproduced |
| BI-M2-C2-ENTITY | M2-C2: an invalid entity id -> refused | L#s1 = ASSIGNED (access-rights/role matrices) [CLEAR_SINGLETON]; R#s1 = ASSIGNED (compensation plans) [CLEAR_SINGLETON] \| L#s1\|R#s1 DIFFERENT_ATOMS \| distinctClassSet = ['access-rights/role matrices', 'compensation plans'] | reproduced |
| BI-M2-C2-CONST | M2-C2: a record with a different equivalence rule constant -> refused | L#s1 = ASSIGNED (access-rights/role matrices) [CLEAR_SINGLETON]; R#s1 = ASSIGNED (compensation plans) [CLEAR_SINGLETON] \| L#s1\|R#s1 DIFFERENT_ATOMS \| distinctClassSet = ['access-rights/role matrices', 'compensation plans'] | reproduced |
| BI-M2-C2-TEMPORAL | M2-C2: a record without temporal authority (AUTHORITY_NOT_DETERMINABLE) -> refused | L#s1 = ASSIGNED (access-rights/role matrices) [CLEAR_SINGLETON]; R#s1 = ASSIGNED (compensation plans) [CLEAR_SINGLETON] \| L#s1\|R#s1 DIFFERENT_ATOMS \| distinctClassSet = ['access-rights/role matrices', 'compensation plans'] | reproduced |
| BI-M2-C2-EDITED | M2-C2: the records edited after sealing (the CIK changed) -> the corpus is rejected (ENTITY_NAME_AUTHORITY_MISMATCH) | rejected: ENTITY_NAME_AUTHORITY_MISMATCH | reproduced |
| BI-M2-C3Q | M2-C3: '?' inside a span-like region -> the veto reads '.' only: unchanged, two classes | L#s1 = ASSIGNED (access-rights/role matrices) [CLEAR_SINGLETON]; R#s1 = ASSIGNED (compensation plans) [CLEAR_SINGLETON] \| L#s1\|R#s1 DIFFERENT_ATOMS \| distinctClassSet = ['access-rights/role matrices', 'compensation plans'] | reproduced |
| BI-M2-C3E | M2-C3: '!' inside a span-like region -> unchanged | L#s1 = ASSIGNED (access-rights/role matrices) [CLEAR_SINGLETON]; R#s1 = ASSIGNED (compensation plans) [CLEAR_SINGLETON] \| L#s1\|R#s1 DIFFERENT_ATOMS \| distinctClassSet = ['access-rights/role matrices', 'compensation plans'] | reproduced |
| BI-M2-WHOLE | whole-sentence mixed control with a proven authority -> MULTIPLE_CLASS_PREDICATES_SATISFIED, srcDiv false | W#s1 = MULTIPLE_CLASS_PREDICATES_SATISFIED \| no pair \| distinctClassSet = [] | reproduced |
| BI-M2-B-IV1 | R-M2-CASE-B (OWNER-ACCEPTED BOUNDED RESIDUAL): the exact Codex IV1-UPPER-PROPER-NAME bytes WITHOUT authority (two records) -> the parent's evidence stands: two classes, srcDiv true - reproduced, not closed | L#s1 = ASSIGNED (access-rights/role matrices) [CLEAR_SINGLETON]; R#s1 = ASSIGNED (compensation plans) [CLEAR_SINGLETON] \| L#s1\|R#s1 DIFFERENT_ATOMS \| distinctClassSet = ['access-rights/role matrices', 'compensation plans'] | reproduced |
| BI-M2-B-IV1S | R-M2-CASE-B: the same bytes, one record declaring SENTENCE, no authority -> accepted, two classes (residual) | D#s1 = ASSIGNED (access-rights/role matrices) [CLEAR_SINGLETON]; D#s2 = ASSIGNED (compensation plans) [CLEAR_SINGLETON] \| D#s1\|D#s2 DIFFERENT_ATOMS \| distinctClassSet = ['access-rights/role matrices', 'compensation plans'] | reproduced |
| BI-M2-B-ND | R-M2-CASE-B: AUTHORITY_NOT_DETERMINABLE for the artifact -> residual | L#s1 = ASSIGNED (access-rights/role matrices) [CLEAR_SINGLETON]; R#s1 = ASSIGNED (compensation plans) [CLEAR_SINGLETON] \| L#s1\|R#s1 DIFFERENT_ATOMS \| distinctClassSet = ['access-rights/role matrices', 'compensation plans'] | reproduced |
| BI-M2-B-SNP | R-M2-CASE-B: temporal PROVEN, ENTITY_NAME_SPANS_NOT_PROVEN (zero spans) -> absence of a span is not positive evidence, and it is not closed: residual | L#s1 = ASSIGNED (access-rights/role matrices) [CLEAR_SINGLETON]; R#s1 = ASSIGNED (compensation plans) [CLEAR_SINGLETON] \| L#s1\|R#s1 DIFFERENT_ATOMS \| distinctClassSet = ['access-rights/role matrices', 'compensation plans'] | reproduced |

| Fixture | Case | Computed | Declared expectation |
|---|---|---|---|
| MVF03-1 | CANONICAL MV-F03 witness - fee plus content ban, then an exit condition | s1 = MULTIPLE_CLASS_PREDICATES_SATISFIED; s2 = ASSIGNED (contracts/participation terms) \| distinctClassSet = ['contracts/participation terms'] | reproduced |
| MVF03-2 | Two separately headed clauses: fee/exit terms and a use rule | s1 = ASSIGNED (contracts/participation terms); s2 = ASSIGNED (contracts/participation terms); s3 = ASSIGNED (platform/product rules) \| distinctClassSet = ['contracts/participation terms', 'platform/product rules'] | reproduced |
| MVF03-3 | One paragraph, two separately numbered sub-clauses | s1 = ASSIGNED (contracts/participation terms); s2 = ASSIGNED (platform/product rules) \| distinctClassSet = ['contracts/participation terms', 'platform/product rules'] | reproduced |
| MVF03-4 | One indivisible sentence carrying both functions | s1 = MULTIPLE_CLASS_PREDICATES_SATISFIED \| distinctClassSet = [] | reproduced |
| MVF03-5 | Pure participation agreement | s1 = ASSIGNED (contracts/participation terms) \| distinctClassSet = ['contracts/participation terms'] | reproduced |
| MVF03-6 | Pure platform acceptable-use rule | s1 = ASSIGNED (platform/product rules) \| distinctClassSet = ['platform/product rules'] | reproduced |
| MVF03-7 | A coder attempts to split the conjoined sentence at the conjunction | rejected: SEPARATOR_NOT_LAWFUL | reproduced |
| MVF03-7b | The same two units declared conjoined rejoin into one indivisible segment | s1 = MULTIPLE_CLASS_PREDICATES_SATISFIED \| distinctClassSet = [] | reproduced |

## 12. CROSS-CLASS DETERMINISM MATRIX (all 36 pairs, from the model)

### SC-1 vs SC-2

*Witness.* mechanism-level resolution (not a materially confusable pair on this surface)

- **SC-1 only:** SC-1 holds and SC-2 does not: C1-FRAME holds for a benefit-framing or invitational segment; C2-BINDING fails because the segment does not state the terms themselves
- **SC-2 only:** SC-2 holds and SC-1 does not: the complementary test of SC-2 is satisfied while SC-1's object test fails
- **Genuinely mixed / multi-function:** a record carrying a bounded SC-1 unit and a bounded SC-2 unit yields both classifications, preserved separately
- **Neither:** neither SC-1 nor SC-2 predicate is satisfied; the record is OUTSIDE_FROZEN_VOCABULARY
- **Required structural segmentation behaviour:** segment at the R-SEG-B boundary; where no boundary exists and both predicates fire, the record fails closed to MULTIPLE_CLASS_PREDICATES_SATISFIED

### SC-1 vs SC-3

*Witness.* mechanism-level resolution (not a materially confusable pair on this surface)

- **SC-1 only:** SC-1 holds and SC-3 does not: C1-FRAME holds with no determinate reward value, rate, form or eligibility; C3-PROVISION fails
- **SC-3 only:** SC-3 holds and SC-1 does not: the complementary test of SC-3 is satisfied while SC-1's object test fails
- **Genuinely mixed / multi-function:** a record carrying a bounded SC-1 unit and a bounded SC-3 unit yields both classifications, preserved separately
- **Neither:** neither SC-1 nor SC-3 predicate is satisfied; the record is OUTSIDE_FROZEN_VOCABULARY
- **Required structural segmentation behaviour:** segment at the R-SEG-B boundary; where no boundary exists and both predicates fire, the record fails closed to MULTIPLE_CLASS_PREDICATES_SATISFIED

### SC-1 vs SC-4

*Witness.* 'Refer a friend and you will both earn $50.'

- **SC-1 only:** an invitation or benefit frame addressed to a participant with no S1-S5 system property and no determinate reward statement
- **SC-4 only:** a referral or recruitment mechanism exhibiting at least one S1-S5 system property
- **Genuinely mixed / multi-function:** a recruitment programme's terms section (SC-4) beside its promotional section (SC-1)
- **Neither:** a bare mention of referring that states no reward, no terms and no system property
- **Required structural segmentation behaviour:** segment at the programme-terms boundary. A single invitation sentence is one segment; it is never split into an invitation half and a mechanism half

### SC-1 vs SC-5

*Witness.* mechanism-level resolution (not a materially confusable pair on this surface)

- **SC-1 only:** SC-1 holds and SC-5 does not: C1-ADDRESSEE holds for an invitation; C5-RULE fails because no rule is stated
- **SC-5 only:** SC-5 holds and SC-1 does not: the complementary test of SC-5 is satisfied while SC-1's object test fails
- **Genuinely mixed / multi-function:** a record carrying a bounded SC-1 unit and a bounded SC-5 unit yields both classifications, preserved separately
- **Neither:** neither SC-1 nor SC-5 predicate is satisfied; the record is OUTSIDE_FROZEN_VOCABULARY
- **Required structural segmentation behaviour:** segment at the R-SEG-B boundary; where no boundary exists and both predicates fire, the record fails closed to MULTIPLE_CLASS_PREDICATES_SATISFIED

### SC-1 vs SC-6

*Witness.* mechanism-level resolution (not a materially confusable pair on this surface)

- **SC-1 only:** SC-1 holds and SC-6 does not: C1-FRAME holds; C6-CHRONO fails because no continuation measure is defined
- **SC-6 only:** SC-6 holds and SC-1 does not: the complementary test of SC-6 is satisfied while SC-1's object test fails
- **Genuinely mixed / multi-function:** a record carrying a bounded SC-1 unit and a bounded SC-6 unit yields both classifications, preserved separately
- **Neither:** neither SC-1 nor SC-6 predicate is satisfied; the record is OUTSIDE_FROZEN_VOCABULARY
- **Required structural segmentation behaviour:** segment at the R-SEG-B boundary; where no boundary exists and both predicates fire, the record fails closed to MULTIPLE_CLASS_PREDICATES_SATISFIED

### SC-1 vs SC-7

*Witness.* mechanism-level resolution (not a materially confusable pair on this surface)

- **SC-1 only:** SC-1 holds and SC-7 does not: C1-ADDRESSEE holds; C7-ALLOCATION fails because no actor is mapped to an entitlement
- **SC-7 only:** SC-7 holds and SC-1 does not: the complementary test of SC-7 is satisfied while SC-1's object test fails
- **Genuinely mixed / multi-function:** a record carrying a bounded SC-1 unit and a bounded SC-7 unit yields both classifications, preserved separately
- **Neither:** neither SC-1 nor SC-7 predicate is satisfied; the record is OUTSIDE_FROZEN_VOCABULARY
- **Required structural segmentation behaviour:** segment at the R-SEG-B boundary; where no boundary exists and both predicates fire, the record fails closed to MULTIPLE_CLASS_PREDICATES_SATISFIED

### SC-1 vs SC-8

*Witness.* 'Tell them: You will love the freedom and the income. Ask them to picture their best life.'

- **SC-1 only:** the addressee is a participant or prospective participant and the segment carries an invitational or benefit-framing marker (M1-M4), with no imperative directed at a performer
- **SC-8 only:** the segment's mode is imperative and its addressee is a performer charged with what to say or do; quoted participant-facing words remain part of the instruction (C8-MODE holds, C1-ADDRESSEE fails)
- **Genuinely mixed / multi-function:** a document contains a bounded script section (SC-8) and a separately bounded advertisement section (SC-1); both classifications are preserved
- **Neither:** neither an invitational frame nor an instruction to a performer is present
- **Required structural segmentation behaviour:** segment at the R-SEG-B boundary between the script section and the advertisement; do not split inside the quoted participant-facing sentence

### SC-1 vs SC-9

*Witness.* mechanism-level resolution (not a materially confusable pair on this surface)

- **SC-1 only:** SC-1 holds and SC-9 does not: C1-FRAME holds; C9-REALIZED fails because nothing is presented as realized
- **SC-9 only:** SC-9 holds and SC-1 does not: the complementary test of SC-9 is satisfied while SC-1's object test fails
- **Genuinely mixed / multi-function:** a record carrying a bounded SC-1 unit and a bounded SC-9 unit yields both classifications, preserved separately
- **Neither:** neither SC-1 nor SC-9 predicate is satisfied; the record is OUTSIDE_FROZEN_VOCABULARY
- **Required structural segmentation behaviour:** segment at the R-SEG-B boundary; where no boundary exists and both predicates fire, the record fails closed to MULTIPLE_CLASS_PREDICATES_SATISFIED

### SC-2 vs SC-3

*Witness.* mechanism-level resolution (not a materially confusable pair on this surface)

- **SC-2 only:** SC-2 holds and SC-3 does not: C2-BINDING holds for the conditions text; C3-PROVISION fails because no reward provision is stated
- **SC-3 only:** SC-3 holds and SC-2 does not: the complementary test of SC-3 is satisfied while SC-2's object test fails
- **Genuinely mixed / multi-function:** a record carrying a bounded SC-2 unit and a bounded SC-3 unit yields both classifications, preserved separately
- **Neither:** neither SC-2 nor SC-3 predicate is satisfied; the record is OUTSIDE_FROZEN_VOCABULARY
- **Required structural segmentation behaviour:** segment at the R-SEG-B boundary; where no boundary exists and both predicates fire, the record fails closed to MULTIPLE_CLASS_PREDICATES_SATISFIED

### SC-2 vs SC-4

*Witness.* mechanism-level resolution (not a materially confusable pair on this surface)

- **SC-2 only:** SC-2 holds and SC-4 does not: C2-TERMS holds for conditions of participation; C4-SYSTEM fails because no acquisition mechanism is evidenced
- **SC-4 only:** SC-4 holds and SC-2 does not: the complementary test of SC-4 is satisfied while SC-2's object test fails
- **Genuinely mixed / multi-function:** a record carrying a bounded SC-2 unit and a bounded SC-4 unit yields both classifications, preserved separately
- **Neither:** neither SC-2 nor SC-4 predicate is satisfied; the record is OUTSIDE_FROZEN_VOCABULARY
- **Required structural segmentation behaviour:** segment at the R-SEG-B boundary; where no boundary exists and both predicates fire, the record fails closed to MULTIPLE_CLASS_PREDICATES_SATISFIED

### SC-2 vs SC-5

*Witness.* 'Members may use the workspace only if they pay $10 per month and do not post prohibited content. Membership ends on nonpayment.' (CORR1.IV1 MV-F03 canonical witness)

**Single normative rule.** MODULE-R-SEG. Segmentation uses the same R-BASIS / R-SEG-B semantics everywhere: a sentence or a numbered element separates; a conjunction or comma inside one sentence does not.

**Canonical result.** sentence 1 = MULTIPLE_CLASS_PREDICATES_SATISFIED (fee condition AND actor-invariant content ban conjoined, no lawful separator); sentence 2 = SC-2 (exit/continuation condition); distinctClassSet = {contracts/participation terms}, size 1

- **SC-2 only:** The segment states conditions of the participant relationship (fee, obligation, entry, continuation, renewal or exit) and states no actor-invariant use rule, or states no use content at all.
- **SC-5 only:** The segment states an actor-invariant rule governing permitted use of or behaviour within the product - restricting the object or content of use - and states no condition of the participant relationship.
- **Genuinely mixed / multi-function:** One indivisible segment states BOTH a participation condition AND an actor-invariant use rule, with no lawful separator between them: C2 and C5 both hold and the record takes MULTIPLE_CLASS_PREDICATES_SATISFIED. This is the canonical witness sentence 1.
- **Neither:** Neither a condition of participation nor a use rule is stated.
- **Required structural segmentation behaviour:** Sentence, heading, numbered clause or numbered sub-clause, table row, exhibit, page/section label. A comma or conjunction inside one sentence is NOT a boundary, so a coder cannot split a conjoined sentence into two classes. Two separately headed clauses or two numbered sub-clauses DO separate, and both classes are then preserved as separate records.

### SC-2 vs SC-6

*Witness.* mechanism-level resolution (not a materially confusable pair on this surface)

- **SC-2 only:** SC-2 holds and SC-6 does not: C2-BINDING holds; C6-MEASURE fails because no measure is present
- **SC-6 only:** SC-6 holds and SC-2 does not: the complementary test of SC-6 is satisfied while SC-2's object test fails
- **Genuinely mixed / multi-function:** a record carrying a bounded SC-2 unit and a bounded SC-6 unit yields both classifications, preserved separately
- **Neither:** neither SC-2 nor SC-6 predicate is satisfied; the record is OUTSIDE_FROZEN_VOCABULARY
- **Required structural segmentation behaviour:** segment at the R-SEG-B boundary; where no boundary exists and both predicates fire, the record fails closed to MULTIPLE_CLASS_PREDICATES_SATISFIED

### SC-2 vs SC-7

*Witness.* mechanism-level resolution (not a materially confusable pair on this surface)

- **SC-2 only:** SC-2 holds and SC-7 does not: C2-TERMS holds for the participant relationship; C7-ROLE fails because no role dimension is stated
- **SC-7 only:** SC-7 holds and SC-2 does not: the complementary test of SC-7 is satisfied while SC-2's object test fails
- **Genuinely mixed / multi-function:** a record carrying a bounded SC-2 unit and a bounded SC-7 unit yields both classifications, preserved separately
- **Neither:** neither SC-2 nor SC-7 predicate is satisfied; the record is OUTSIDE_FROZEN_VOCABULARY
- **Required structural segmentation behaviour:** segment at the R-SEG-B boundary; where no boundary exists and both predicates fire, the record fails closed to MULTIPLE_CLASS_PREDICATES_SATISFIED

### SC-2 vs SC-8

*Witness.* mechanism-level resolution (not a materially confusable pair on this surface)

- **SC-2 only:** SC-2 holds and SC-8 does not: C2-BINDING holds for the terms text; C8-MODE fails because the addressee is not a performer
- **SC-8 only:** SC-8 holds and SC-2 does not: the complementary test of SC-8 is satisfied while SC-2's object test fails
- **Genuinely mixed / multi-function:** a record carrying a bounded SC-2 unit and a bounded SC-8 unit yields both classifications, preserved separately
- **Neither:** neither SC-2 nor SC-8 predicate is satisfied; the record is OUTSIDE_FROZEN_VOCABULARY
- **Required structural segmentation behaviour:** segment at the R-SEG-B boundary; where no boundary exists and both predicates fire, the record fails closed to MULTIPLE_CLASS_PREDICATES_SATISFIED

### SC-2 vs SC-9

*Witness.* mechanism-level resolution (not a materially confusable pair on this surface)

- **SC-2 only:** SC-2 holds and SC-9 does not: C2-BINDING holds; C9-REALIZED fails because the segment states conditions rather than a realized amount
- **SC-9 only:** SC-9 holds and SC-2 does not: the complementary test of SC-9 is satisfied while SC-2's object test fails
- **Genuinely mixed / multi-function:** a record carrying a bounded SC-2 unit and a bounded SC-9 unit yields both classifications, preserved separately
- **Neither:** neither SC-2 nor SC-9 predicate is satisfied; the record is OUTSIDE_FROZEN_VOCABULARY
- **Required structural segmentation behaviour:** segment at the R-SEG-B boundary; where no boundary exists and both predicates fire, the record fails closed to MULTIPLE_CLASS_PREDICATES_SATISFIED

### SC-3 vs SC-4

*Witness.* 'Refer a friend and you will both earn $50.'

- **SC-3 only:** a reward value or eligibility stated as the operative content with no S1-S5 system property (X4-b)
- **SC-4 only:** a referral or recruitment mechanism exhibiting an S1-S5 system property with no reward value, rate, eligibility or form stated
- **Genuinely mixed / multi-function:** a referral programme stating both tracked credits (SC-4) and the credit's value (SC-3)
- **Neither:** neither a reward provision nor a recruitment system property
- **Required structural segmentation behaviour:** segment at the R-SEG-B boundary between the programme-mechanism text and the reward schedule. One sentence cannot be split between them

### SC-3 vs SC-5

*Witness.* mechanism-level resolution (not a materially confusable pair on this surface)

- **SC-3 only:** SC-3 holds and SC-5 does not: C3-PROVISION holds for a reward provision; C5-RULE fails because no use rule is stated
- **SC-5 only:** SC-5 holds and SC-3 does not: the complementary test of SC-5 is satisfied while SC-3's object test fails
- **Genuinely mixed / multi-function:** a record carrying a bounded SC-3 unit and a bounded SC-5 unit yields both classifications, preserved separately
- **Neither:** neither SC-3 nor SC-5 predicate is satisfied; the record is OUTSIDE_FROZEN_VOCABULARY
- **Required structural segmentation behaviour:** segment at the R-SEG-B boundary; where no boundary exists and both predicates fire, the record fails closed to MULTIPLE_CLASS_PREDICATES_SATISFIED

### SC-3 vs SC-6

*Witness.* mechanism-level resolution (not a materially confusable pair on this surface)

- **SC-3 only:** SC-3 holds and SC-6 does not: C3-PROVISION holds; C6-CHRONO fails because no continuation measure of the participant base is present
- **SC-6 only:** SC-6 holds and SC-3 does not: the complementary test of SC-6 is satisfied while SC-3's object test fails
- **Genuinely mixed / multi-function:** a record carrying a bounded SC-3 unit and a bounded SC-6 unit yields both classifications, preserved separately
- **Neither:** neither SC-3 nor SC-6 predicate is satisfied; the record is OUTSIDE_FROZEN_VOCABULARY
- **Required structural segmentation behaviour:** segment at the R-SEG-B boundary; where no boundary exists and both predicates fire, the record fails closed to MULTIPLE_CLASS_PREDICATES_SATISFIED

### SC-3 vs SC-7

*Witness.* 'The Board Compensation Committee or BCC oversees compensation for Exxon's senior executives, including salary, bonus, and incentive awards.' (IV1 F-02 counterexample)

- **SC-3 only:** a named reward object with at least one of B1 a numeric or formulaic value or rate, B2 an eligibility rule attaching a stated reward to a named role/class/tier/office/participation action, or B3 a reward-form, timing or condition-of-payment provision
- **SC-7 only:** a role/office/tier dimension and an entitlement/authority/responsibility or seat-holding dimension, with the segment establishing who holds which, and no B1/B2/B3 provision
- **Genuinely mixed / multi-function:** a committee's authority allocation in one bounded section and a retainer schedule in another
- **Neither:** a reward noun that is only the grammatical object of an oversight, review, approval, recommendation or determination verb with no B1/B2/B3 provision (X3-a), and no role/entitlement mapping
- **Required structural segmentation behaviour:** the reward noun's grammatical governor decides whether C3-PROVISION can hold. If a role/authority sentence and a reward-provision sentence are separated by an R-SEG-B boundary, they are two records: SC-7 and SC-3 respectively

### SC-3 vs SC-8

*Witness.* mechanism-level resolution (not a materially confusable pair on this surface)

- **SC-3 only:** SC-3 holds and SC-8 does not: C3-PROVISION holds in declarative mode; C8-MODE fails because the segment does not instruct a performer
- **SC-8 only:** SC-8 holds and SC-3 does not: the complementary test of SC-8 is satisfied while SC-3's object test fails
- **Genuinely mixed / multi-function:** a record carrying a bounded SC-3 unit and a bounded SC-8 unit yields both classifications, preserved separately
- **Neither:** neither SC-3 nor SC-8 predicate is satisfied; the record is OUTSIDE_FROZEN_VOCABULARY
- **Required structural segmentation behaviour:** segment at the R-SEG-B boundary; where no boundary exists and both predicates fire, the record fails closed to MULTIPLE_CLASS_PREDICATES_SATISFIED

### SC-3 vs SC-9

*Witness.* 'Directors were paid $250,000 in fees during 2004, under the schedule of a $200,000 retainer plus $50,000 in committee fees.' (CORR1.IV1 MV-F02 canonical witness)

**Single normative rule.** MODULE-R-CMP. A realized payment is SC-9 ONLY when a P-1..P-5 documentary attachment to the participation system is stated. A director/officer/employee compensation statement is SC-3 when it states a compensation structure and is otherwise OUTSIDE_FROZEN_VOCABULARY; it is never SC-9 without a stated attachment.

**Canonical result.** SC-3 ONLY (ASSIGNED compensation plans)

- **SC-3 only:** SC-3 holds (C3-OBJECT and C3-PROVISION; a STRUCTURE or BOTH modality, tied to structureStated by FC-2) while C9-ATTACHMENT fails because no P-1..P-5 attachment is stated - the reward channel is a governance or employment compensation channel, not the participation system. The canonical witness is this case.
- **SC-9 only:** SC-9 holds (flowPresent AND realized AND a stated P-1..P-5 attachment) while SC-3 fails because no applicable value, rate, formula, eligibility rule or reward-form/timing provision is stated (C3-PROVISION fails, or X3-b fires on a realized-only modality) - only an amount that was realized.
- **Genuinely mixed / multi-function:** Genuinely mixed ONLY when a stated compensation structure AND a realized amount AND a stated P-1..P-5 attachment are all present in one indivisible segment: then C3 and C9 both hold and, with no lawful separator, the record takes MULTIPLE_CLASS_PREDICATES_SATISFIED.
- **Neither:** Neither holds. Includes a bare realized compensation payment with no stated structure and no attachment: C3-PROVISION fails (or X3-b fires) and C9-ATTACHMENT fails, so the record is OUTSIDE_FROZEN_VOCABULARY - not a plan and not a participation-system record.
- **Required structural segmentation behaviour:** A sentence, heading, numbered clause, numbered sub-clause, table row, exhibit or page/section label separates. A comma or a conjunction inside one sentence does NOT. If an indivisible segment carries both, the record fails closed to MULTIPLE_CLASS_PREDICATES_SATISFIED and the coder cannot choose by shrinking the quotation.

### SC-4 vs SC-5

*Witness.* mechanism-level resolution (not a materially confusable pair on this surface)

- **SC-4 only:** SC-4 holds and SC-5 does not: C4-SYSTEM holds for a tracked recruitment mechanism; C5-RULE fails because no use rule is stated
- **SC-5 only:** SC-5 holds and SC-4 does not: the complementary test of SC-5 is satisfied while SC-4's object test fails
- **Genuinely mixed / multi-function:** a record carrying a bounded SC-4 unit and a bounded SC-5 unit yields both classifications, preserved separately
- **Neither:** neither SC-4 nor SC-5 predicate is satisfied; the record is OUTSIDE_FROZEN_VOCABULARY
- **Required structural segmentation behaviour:** segment at the R-SEG-B boundary; where no boundary exists and both predicates fire, the record fails closed to MULTIPLE_CLASS_PREDICATES_SATISFIED

### SC-4 vs SC-6

*Witness.* mechanism-level resolution (not a materially confusable pair on this surface)

- **SC-4 only:** SC-4 holds and SC-6 does not: C4-SYSTEM holds; C6-CHRONO fails because the acquisition count is not a continuation measure
- **SC-6 only:** SC-6 holds and SC-4 does not: the complementary test of SC-6 is satisfied while SC-4's object test fails
- **Genuinely mixed / multi-function:** a record carrying a bounded SC-4 unit and a bounded SC-6 unit yields both classifications, preserved separately
- **Neither:** neither SC-4 nor SC-6 predicate is satisfied; the record is OUTSIDE_FROZEN_VOCABULARY
- **Required structural segmentation behaviour:** segment at the R-SEG-B boundary; where no boundary exists and both predicates fire, the record fails closed to MULTIPLE_CLASS_PREDICATES_SATISFIED

### SC-4 vs SC-7

*Witness.* mechanism-level resolution (not a materially confusable pair on this surface)

- **SC-4 only:** SC-4 holds and SC-7 does not: C4-SYSTEM holds; C7-ALLOCATION fails because no entitlement or authority is allocated
- **SC-7 only:** SC-7 holds and SC-4 does not: the complementary test of SC-7 is satisfied while SC-4's object test fails
- **Genuinely mixed / multi-function:** a record carrying a bounded SC-4 unit and a bounded SC-7 unit yields both classifications, preserved separately
- **Neither:** neither SC-4 nor SC-7 predicate is satisfied; the record is OUTSIDE_FROZEN_VOCABULARY
- **Required structural segmentation behaviour:** segment at the R-SEG-B boundary; where no boundary exists and both predicates fire, the record fails closed to MULTIPLE_CLASS_PREDICATES_SATISFIED

### SC-4 vs SC-8

*Witness.* mechanism-level resolution (not a materially confusable pair on this surface)

- **SC-4 only:** SC-4 holds and SC-8 does not: C4-SYSTEM holds; C8-MODE fails because the segment does not instruct a performer
- **SC-8 only:** SC-8 holds and SC-4 does not: the complementary test of SC-8 is satisfied while SC-4's object test fails
- **Genuinely mixed / multi-function:** a record carrying a bounded SC-4 unit and a bounded SC-8 unit yields both classifications, preserved separately
- **Neither:** neither SC-4 nor SC-8 predicate is satisfied; the record is OUTSIDE_FROZEN_VOCABULARY
- **Required structural segmentation behaviour:** segment at the R-SEG-B boundary; where no boundary exists and both predicates fire, the record fails closed to MULTIPLE_CLASS_PREDICATES_SATISFIED

### SC-4 vs SC-9

*Witness.* mechanism-level resolution (not a materially confusable pair on this surface)

- **SC-4 only:** SC-4 holds and SC-9 does not: C4-SYSTEM holds; C9-ATTACHMENT alone is insufficient because C9-REALIZED fails, or C4's mechanism test fails where only an amount is stated
- **SC-9 only:** SC-9 holds and SC-4 does not: the complementary test of SC-9 is satisfied while SC-4's object test fails
- **Genuinely mixed / multi-function:** a record carrying a bounded SC-4 unit and a bounded SC-9 unit yields both classifications, preserved separately
- **Neither:** neither SC-4 nor SC-9 predicate is satisfied; the record is OUTSIDE_FROZEN_VOCABULARY
- **Required structural segmentation behaviour:** segment at the R-SEG-B boundary; where no boundary exists and both predicates fire, the record fails closed to MULTIPLE_CLASS_PREDICATES_SATISFIED

### SC-5 vs SC-6

*Witness.* mechanism-level resolution (not a materially confusable pair on this surface)

- **SC-5 only:** SC-5 holds and SC-6 does not: C5-RULE holds for a use rule; C6-MEASURE fails because no continuation measure is present
- **SC-6 only:** SC-6 holds and SC-5 does not: the complementary test of SC-6 is satisfied while SC-5's object test fails
- **Genuinely mixed / multi-function:** a record carrying a bounded SC-5 unit and a bounded SC-6 unit yields both classifications, preserved separately
- **Neither:** neither SC-5 nor SC-6 predicate is satisfied; the record is OUTSIDE_FROZEN_VOCABULARY
- **Required structural segmentation behaviour:** segment at the R-SEG-B boundary; where no boundary exists and both predicates fire, the record fails closed to MULTIPLE_CLASS_PREDICATES_SATISFIED

### SC-5 vs SC-7

*Witness.* 'Gold members may access the premium API. Silver members may not.' (IV1 F-02 counterexample)

- **SC-5 only:** the rule's operative determinant is actor-invariant, or it restricts the object or content of use, so no role or tier differentiates the actors (C5-INVARIANT holds)
- **SC-7 only:** the operative determinant of the provision is the actor's tier, role or office identity, so the segment allocates an entitlement by actor (X5-a fires; C5-INVARIANT fails)
- **Genuinely mixed / multi-function:** a tier-entitlement table plus a separately bounded general use policy
- **Neither:** a description that rules or tiers exist, with no rule stated and no entitlement allocated
- **Required structural segmentation behaviour:** segment at the section or table boundary. Where one sentence couples a general use rule to a tier allocation, both predicates fire and the record takes MULTIPLE_CLASS_PREDICATES_SATISFIED unless an R-SEG-B boundary isolates them

### SC-5 vs SC-8

*Witness.* mechanism-level resolution (not a materially confusable pair on this surface)

- **SC-5 only:** SC-5 holds and SC-8 does not: C5-RULE holds in declarative mode as a published rule; C8-MODE fails because the addressee is not a performer
- **SC-8 only:** SC-8 holds and SC-5 does not: the complementary test of SC-8 is satisfied while SC-5's object test fails
- **Genuinely mixed / multi-function:** a record carrying a bounded SC-5 unit and a bounded SC-8 unit yields both classifications, preserved separately
- **Neither:** neither SC-5 nor SC-8 predicate is satisfied; the record is OUTSIDE_FROZEN_VOCABULARY
- **Required structural segmentation behaviour:** segment at the R-SEG-B boundary; where no boundary exists and both predicates fire, the record fails closed to MULTIPLE_CLASS_PREDICATES_SATISFIED

### SC-5 vs SC-9

*Witness.* mechanism-level resolution (not a materially confusable pair on this surface)

- **SC-5 only:** SC-5 holds and SC-9 does not: C5-RULE holds; C9-REALIZED fails because no realized amount is stated
- **SC-9 only:** SC-9 holds and SC-5 does not: the complementary test of SC-9 is satisfied while SC-5's object test fails
- **Genuinely mixed / multi-function:** a record carrying a bounded SC-5 unit and a bounded SC-9 unit yields both classifications, preserved separately
- **Neither:** neither SC-5 nor SC-9 predicate is satisfied; the record is OUTSIDE_FROZEN_VOCABULARY
- **Required structural segmentation behaviour:** segment at the R-SEG-B boundary; where no boundary exists and both predicates fire, the record fails closed to MULTIPLE_CLASS_PREDICATES_SATISFIED

### SC-6 vs SC-7

*Witness.* mechanism-level resolution (not a materially confusable pair on this surface)

- **SC-6 only:** SC-6 holds and SC-7 does not: C6-CHRONO holds for a renewal rate; C7-ALLOCATION fails because no actor is mapped to an entitlement
- **SC-7 only:** SC-7 holds and SC-6 does not: the complementary test of SC-7 is satisfied while SC-6's object test fails
- **Genuinely mixed / multi-function:** a record carrying a bounded SC-6 unit and a bounded SC-7 unit yields both classifications, preserved separately
- **Neither:** neither SC-6 nor SC-7 predicate is satisfied; the record is OUTSIDE_FROZEN_VOCABULARY
- **Required structural segmentation behaviour:** segment at the R-SEG-B boundary; where no boundary exists and both predicates fire, the record fails closed to MULTIPLE_CLASS_PREDICATES_SATISFIED

### SC-6 vs SC-8

*Witness.* mechanism-level resolution (not a materially confusable pair on this surface)

- **SC-6 only:** SC-6 holds and SC-8 does not: C6-MEASURE holds; C8-MODE fails because the segment is not an instruction
- **SC-8 only:** SC-8 holds and SC-6 does not: the complementary test of SC-8 is satisfied while SC-6's object test fails
- **Genuinely mixed / multi-function:** a record carrying a bounded SC-6 unit and a bounded SC-8 unit yields both classifications, preserved separately
- **Neither:** neither SC-6 nor SC-8 predicate is satisfied; the record is OUTSIDE_FROZEN_VOCABULARY
- **Required structural segmentation behaviour:** segment at the R-SEG-B boundary; where no boundary exists and both predicates fire, the record fails closed to MULTIPLE_CLASS_PREDICATES_SATISFIED

### SC-6 vs SC-9

*Witness.* 'Net revenue retention was 120% and revenue was $4.2 billion.' (IV1 F-02 counterexample)

- **SC-6 only:** a quantified continuation, renewal, repetition, return or churn measure of the participant base presented as a measurement or target
- **SC-9 only:** a realized operative or financial amount of the participation system with no continuation measure
- **Genuinely mixed / multi-function:** one segment stating both a continuation measure and a financial amount
- **Neither:** a one-off headcount, or a financial amount with no P-1..P-5 attachment
- **Required structural segmentation behaviour:** segment at a table, note or section boundary. A comma or a conjunction inside one sentence is NOT an R-SEG-B boundary, so the mixed single sentence fails closed to MULTIPLE_CLASS_PREDICATES_SATISFIED

### SC-7 vs SC-8

*Witness.* 'Store managers must greet every customer by name and may approve refunds up to $50.' (IV1 F-02 counterexample)

- **SC-7 only:** the segment establishes which actor holds which entitlement, authority, responsibility or seat, in declarative mode
- **SC-8 only:** the segment's mode is imperative or instructive and its addressee is a performer, specifying what the performer must say or do (C8-MODE holds)
- **Genuinely mixed / multi-function:** an operations manual section (SC-8) followed by an authority-allocation appendix (SC-7)
- **Neither:** neither a role/entitlement map nor an instruction to a performer
- **Required structural segmentation behaviour:** segment at the manual-heading or list-item boundary. Where one sentence both instructs and allocates, both predicates fire and the record takes MULTIPLE_CLASS_PREDICATES_SATISFIED unless an R-SEG-B boundary isolates them

### SC-7 vs SC-9

*Witness.* mechanism-level resolution (not a materially confusable pair on this surface)

- **SC-7 only:** SC-7 holds and SC-9 does not: C7-ALLOCATION holds; C9-REALIZED fails because no realized amount is stated, or the reverse where only a realized amount without a role map is present
- **SC-9 only:** SC-9 holds and SC-7 does not: the complementary test of SC-9 is satisfied while SC-7's object test fails
- **Genuinely mixed / multi-function:** a record carrying a bounded SC-7 unit and a bounded SC-9 unit yields both classifications, preserved separately
- **Neither:** neither SC-7 nor SC-9 predicate is satisfied; the record is OUTSIDE_FROZEN_VOCABULARY
- **Required structural segmentation behaviour:** segment at the R-SEG-B boundary; where no boundary exists and both predicates fire, the record fails closed to MULTIPLE_CLASS_PREDICATES_SATISFIED

### SC-8 vs SC-9

*Witness.* mechanism-level resolution (not a materially confusable pair on this surface)

- **SC-8 only:** SC-8 holds and SC-9 does not: C8-MODE holds; C9-REALIZED fails because an instruction is not a realized amount
- **SC-9 only:** SC-9 holds and SC-8 does not: the complementary test of SC-9 is satisfied while SC-8's object test fails
- **Genuinely mixed / multi-function:** a record carrying a bounded SC-8 unit and a bounded SC-9 unit yields both classifications, preserved separately
- **Neither:** neither SC-8 nor SC-9 predicate is satisfied; the record is OUTSIDE_FROZEN_VOCABULARY
- **Required structural segmentation behaviour:** segment at the R-SEG-B boundary; where no boundary exists and both predicates fire, the record fails closed to MULTIPLE_CLASS_PREDICATES_SATISFIED

## 13. EVIDENCE BINDING vs RULE EVALUATION (MV-VAL, MV-REPLAY-1)

| Layer | What it is |
|---|---|
| EVIDENCE_BINDING | exact source artifact (path + SHA-256 verified against the sealed Stage-1 registry digest) + exact bounded units (extraction recipe + character span + recorded text + text SHA-256) + exact evidence witnesses (every asserted feature carries a quotation that must occur inside the unit that carries it) |
| RULE_EVALUATION | deterministic evaluation of the boundaryModel over the feature record DERIVED from the valid witnessed assertions only |

**What the validator proves, and what it does not.** The validator proves (a) the physical binding of every unit to the preserved artifact bytes, (b) that every witness occurs inside its unit's canonical text, (c) that the feature record is derived from witnessed assertions only, and (d) that the recorded results equal the deterministic evaluation of the model. It does NOT prove that a coder's semantic reading of a witnessed passage is correct beyond the recorded witness; that remains a coder act, visible and auditable through the witness.

| Extraction recipe | Decoder | Operations (each with its declared role) | Preserved artifact classes |
|---|---|---|---|
| PLAIN_TEXT_V1 | UTF8_REPLACE | `[{"op": "regex", "pattern": "\\r\\n?", "flags": [], "repl": "\n", "role": "NORMALIZATION"}]` | - |
| HTML_TEXT_V1 | UTF8_REPLACE | `[{"op": "regex", "pattern": "\\r\\n?", "flags": [], "repl": "\n", "role": "NORMALIZATION"}, {"op": "regex", "pattern": "<script.*?</script>", "flags": ["I", "S"], "repl": " ", "role": "CONTENT_BLOCK_REMOVAL"}, {"op": "regex", "pattern": "<style.*?</style>", "flags": ["I", "S"], "repl": " ", "role": "CONTENT_BLOCK_REMOVAL"}, {"op": "regex", "pattern": "<!--.*?-->", "flags": ["S"], "repl": " ", "role": "CONTENT_BLOCK_REMOVAL"}, {"op": "regex", "pattern": "</?(?:br\|p\|div\|tr\|li\|h[1-6]\|table\|title\|center\|dt\|dd\|blockquote\|pre)\\b[^>]*>", "flags": ["I"], "repl": "\n", "role": "MARKUP_REMOVAL"}, {"op": "regex", "pattern": "<[^>]+>", "flags": [], "repl": " ", "role": "MARKUP_REMOVAL"}, {"op": "html_unescape", "role": "NORMALIZATION"}, {"op": "regex", "pattern": " ", "flags": [], "repl": " ", "role": "NORMALIZATION"}]` | - |
| HTML_RAW_V1 | UTF8_REPLACE | `[{"op": "regex", "pattern": "\\r\\n?", "flags": [], "repl": "\n", "role": "NORMALIZATION"}]` | markup_tags, html_entities |
| PDF_LZW_TEXT_V1 | PDF_LZW_STREAM_STRINGS | `[]` | - |

Rendition text for R-DUP: For R-DUP equivalence, an artifact's rendition text is its UTF8_REPLACE-decoded bytes (markup retained) or, for a PDF, its PDF_LZW_STREAM_STRINGS text; the full canonicalization is then applied with no skips.

Unit binding: artifactId resolves to an artifact whose file SHA-256 equals the recorded and the sealed registry digest; text == extract(artifact, recipe)[start:end]; textSha256 == SHA-256(text); canonical(text) is non-empty and occurs in canonical(extracted document).

| Witness rule | Value |
|---|---|
| minCanonicalChars | `4` |
| requireAlphanumeric | `true` |
| match | canonical(witness) must be a substring of canonical(unit text), both under the unit's recipe |
| assertionTypes | `["QUOTED_WITNESS"]` |
| requiredAssertionFields | `["featureId", "value", "witness", "assertionType", "coderIdentity", "sourceRef", "segmentLocator"]` |
| segmentLocatorFields | `["artifactId", "unitId", "start", "end"]` |
| listValues | each value of a list feature is a separate assertion with its own witness |
| invalidAssertion | an assertion whose witness is absent from its unit, whose locator does not equal its unit's binding, or whose sourceRef does not equal the record's sourceId makes the record INVALID; it is never silently dropped |

Free-form fields `humanReadableLocator`, `physicalHeading`, `paragraphAnchor`, `sourceLocators`: free-form fields are audit metadata only; none may appear in canonicalSegmentIdentity, in the R-COUNT grouping key or in the SEGMENT_CLASS_CONFLICT key

Physical heading: if physicalHeading is non-null it must occur, whitespace-normalized and case-sensitive, as a complete line of the extracted document before the record's first unit. Unresolved binding: a supplying basis whose segment cannot be physically resolved is recorded with bindingStatus = UNRESOLVED and takes NOT_DETERMINABLE; a locator is never invented.

| Fixture | Case | Computed | Declared expectation |
|---|---|---|---|
| WIT-1 | A witness that does not occur inside its unit invalidates the record | rejected: WITNESS_NOT_IN_UNIT | reproduced |
| WIT-2 | A declared sentence separator with no physical sentence boundary is rejected | rejected: SEPARATOR_EVIDENCE_FAILED | reproduced |
| WIT-3 | Self-contradictory evidence is rejected (feature constraint FC-1) | rejected: FEATURE_CONSTRAINT_VIOLATION | reproduced |

## 14. CANONICAL SEGMENT IDENTITY - CSI-v6 (MV-AND-1)

CSI-v6 names a documentary occurrence in a frame that every rendition of the document is proven to share. It is not a content hash plus a rank among equal extracted texts, and no text property measured after extraction is identity-bearing.

| Item | Definition |
|---|---|
| id | CSI-A-PLUS-IMPLEMENTATION-1 |
| form | CSI:<sha256 hex of the key> |
| versionTag | CSI-v6 |
| prefix | CSI: |
| keySeparator |  |
| keyLayout | `["versionTag", "underlyingDocumentIdentity", "frameTag", "anchor"]` |
| keyJoin | the version tag, the underlying document identity, the frame tag and the frame's anchor components, in this order, joined by U+001F; the identity is the prefix followed by the SHA-256 hex of the UTF-8 key |
| anchorPrimitives | `{"completeViewStart": "COMPLETE_VIEW_INTERVAL_START", "completeViewEnd": "COMPLETE_VIEW_INTERVAL_END", "contentSkeletonSha256": "CONTENT_SKELETON_SHA256"}` |
| identityBearing | `["underlyingDocumentIdentity", "frameTag", "completeViewStart", "completeViewEnd", "contentSkeletonSha256"]` |
| diagnosticOnly | `["canonicalSegmentContentHash", "occurrenceRank", "occurrenceCounts", "contextBundle", "physicalHeading", "humanReadableLocator", "lineNumber", "byteOffset"]` |
| identityFunction | COMPLETE_VIEW_FRAMES |
| anchoring | boundaryModel.occurrenceAnchoring |
| recordField | canonicalSegmentIdentity |
| componentsField | csiComponents |
| correspondenceField | occurrenceCorrespondence |
| anchorField | occurrenceAnchor |
| diagnosticsField | occurrenceDiagnostics |
| underlyingDocumentIdentity | the resolved R-DUP identity string of the artifact's duplicate group |
| recomputedByValidator | `true` |
| suppliedValueNeverTrusted | `true` |
| convergence | Two records on one documentary occurrence of one resolved underlying document receive one identity: in FRAME-C the occurrence has one interval in the shared complete view whatever the rendition, the recipe, the markup, the entities or the hidden copies around it; in FRAME-U its content skeleton is one key that the guard accepts or withholds for every record at once. They form ONE (underlyingDocumentIdentity, canonicalSegmentIdentity) count/conflict group, so conflicting classes on it conflict. |
| collision | Two different occurrences of one document never share an established identity: in FRAME-C distinct occurrences occupy distinct complete-view intervals; in FRAME-U a key is established only where its content occurs exactly once in every member's complete view. Overlapping but unequal segments are different segments (residual R-7, open and out of scope). |
| removedComponents | `{"canonicalSegmentContentHash": "DIAGNOSTIC_ONLY (recipe- and rendition-dependent: architecture ADV-10, ADV-36)", "occurrenceIndex": "DIAGNOSTIC_ONLY as occurrenceRank (no stability condition across renditions: architecture ADV-11, ADV-17, ADV-18, ADV-22)"}` |

| Frame | Tag | Anchor components (in key order) | Meaning |
|---|---|---|---|
| FRAME-C | C | completeViewStart, completeViewEnd | the segment's interval in the complete view that every member of its underlying document is proven to share |
| FRAME-U | K | contentSkeletonSha256 | the SHA-256 of the segment's content skeleton k, under the key-level uniqueness guard |

When no frame establishes the occurrence (action `FAIL_CLOSED_NO_IDENTITY`, state role `duplicateUnresolved`, marker `UNESTABLISHED`): no shared frame establishes the documentary occurrence, or the occurrence is a text-bearing removal seam. The segment carries NO canonicalSegmentIdentity and NO components, records the unresolved reason, and takes the existing non-counting state DUPLICATE_IDENTITY_UNRESOLVED (rule R-DUP). It is dropped at R-COUNT step 2 and contributes nothing to distinctClassSet. No tie-breaker, nearest occurrence, first occurrence, count, rank, context or wildcard value replaces the missing identity.

| Removed CSI-v5 proof | Test | Status | Why (historical counterexample retained) |
|---|---|---|---|
| OC-1 | GROUP_CANONICAL_DOCUMENTS_EQUAL | REMOVED_NO_EXECUTABLE_AUTHORITY | equal canonical extraction documents do not make rank n the same occurrence everywhere: two renditions can hide complementary adjacent occurrences (extraction removes script text, R-EQV keeps it) and still extract to equal documents, so one occurrence gets two ranks (architecture ADV-11, ADV-22, ADV-23: split, conflict bypass, false srcDiv) |
| OC-2 | CONTENT_CARRIED_BY_ONE_MEMBER | REMOVED_NO_EXECUTABLE_AUTHORITY | a single carrier of a canonical content text is not a single occurrence: entity divergence (&rsquo; / &#39;) gives one sentence two extracted contents, each 'carried by one member' (architecture ADV-10: split, false srcDiv) |
| OC-3 | CARRIER_OCCURRENCES_EQUAL_RENDITION_TEXT | REMOVED_UNSOUND (CORR4.CORR1.CORR1.CORR1); REMOVED_NO_EXECUTABLE_AUTHORITY | equal occurrence counts are not correspondence (IV1 blocking finding of CORR4.CORR1.CORR1; architecture ADV-05) |
| OC-4 | CONTENT_SINGLE_OCCURRENCE_IN_EVERY_CARRIER_AND_AT_MOST_ONCE_IN_RENDITION_TEXT | REMOVED_NO_EXECUTABLE_AUTHORITY | a single occurrence per carrier is a count: an extraction-created occurrence in one rendition against the genuine one in another receives the shared rank 0 (architecture ADV-25, fixture OC3-KL1: merge) |

*Forbidden.* a rank, a count, or equality of documents taken as occurrence identity; a position in any space not proven shared by every member (extraction space, canonical extraction space, R-EQV rendition-text space across non-identical members); a content hash or text alone as identity without the FRAME-U guard; a context bundle, locator, heading or record order as identity; a tie-breaker (nearest, first, lowest); a reserved or wildcard occurrence value; a per-record seam decision in FRAME-C or FRAME-U, including a record-local own-seam gate; a seam test restricted to content-block removal, or any exemption of removed text-bearing markup from it; a whitelist of attribute names, kinds or metadata values exempted from the seam rule; removing text-bearing material from the complete view or from the FRAME-U count view to avoid a seam; a FRAME-U count view that removes tags in place; removal classes computed by a re-parse instead of the replay's op provenance; an extraction op without a declared role, or a role inferred at runtime; any occurrence-correspondence proof of CSI-v5 (OC-1, OC-2, OC-3, OC-4) given executable authority; a per-record representability decision in FRAME-C (OA-7(b) is decided per occurrence); any of the OA-14 prohibitions (occurrenceAnchoring.unplacedWitness.forbidden)

| Fixture | Case | Computed | Declared expectation |
|---|---|---|---|
| CSI-1 | Two distinct segments with identical heading and identical opening words: SC-3 and SC-7 | CSI-1-A#s1 = ASSIGNED (compensation plans); CSI-1-B#s1 = ASSIGNED (access-rights/role matrices) \| distinctClassSet = ['access-rights/role matrices', 'compensation plans'] | reproduced |
| CSI-2 | Repeated identical bounded segments at two physical positions | CSI-2-A#s1 = ASSIGNED (platform/product rules); CSI-2-B#s1 = ASSIGNED (platform/product rules) \| distinctClassSet = ['platform/product rules'] | reproduced |
| CSI-3 | One segment, two different free-form locators | CSI-3-A#s1 = ASSIGNED (access-rights/role matrices); CSI-3-B#s1 = ASSIGNED (access-rights/role matrices) \| distinctClassSet = ['access-rights/role matrices'] | reproduced |

### 14.1 Convergence of equivalent renditions (IV1-RR4-CSI-CONVERGENCE, carried)

| Fixture | Case | Computed | Declared expectation |
|---|---|---|---|
| RR4-A | RR-4 counterexample: an equivalence-removed artifact BEFORE the segment | RR4-A-1#s1 = ASSIGNED (compensation plans); RR4-A-2#s1 = ASSIGNED (compensation plans); RR4-A-X~RR4-A-Y = SAME_UNDERLYING_DOCUMENT \| distinctClassSet = ['compensation plans'] | reproduced |
| RR4-B | An equivalence-removed artifact AFTER the segment does not affect convergence | RR4-B-1#s1 = ASSIGNED (compensation plans); RR4-B-2#s1 = ASSIGNED (compensation plans); RR4-B-X~RR4-B-Y = SAME_UNDERLYING_DOCUMENT \| distinctClassSet = ['compensation plans'] | reproduced |
| RR4-C | Markup normalization: markup differences vanish under R-EQV but move recipe-relative offsets (markup-preserving recipe) | RR4-C-1#s1 = OUTSIDE_FROZEN_VOCABULARY; RR4-C-2#s1 = OUTSIDE_FROZEN_VOCABULARY; RR4-C-X~RR4-C-Y = SAME_UNDERLYING_DOCUMENT \| distinctClassSet = [] | reproduced |
| RR4-D | Repeated identical segment at two genuine positions stays separable across equivalent renditions | RR4-D-A0#s1 = ASSIGNED (compensation plans); RR4-D-A1#s1 = ASSIGNED (access-rights/role matrices); RR4-D-B0#s1 = ASSIGNED (compensation plans); RR4-D-B1#s1 = ASSIGNED (access-rights/role matrices); RR4-D-X~RR4-D-Y = SAME_UNDERLYING_DOCUMENT \| distinctClassSet = ['access-rights/role matrices', 'compensation plans'] | reproduced |
| RR4-E | Same opening words, different full content: distinct identities | RR4-E-1#s1 = ASSIGNED (compensation plans); RR4-E-2#s1 = ASSIGNED (access-rights/role matrices) \| distinctClassSet = ['access-rights/role matrices', 'compensation plans'] | reproduced |
| RR4-F | Equivalent documents, different supplying segments: the document converges, the segments do not | RR4-F-1#s1 = ASSIGNED (access-rights/role matrices); RR4-F-2#s1 = ASSIGNED (access-rights/role matrices); RR4-F-X~RR4-F-Y = SAME_UNDERLYING_DOCUMENT \| distinctClassSet = ['access-rights/role matrices'] | reproduced |
| RR4-G | LOAD-BEARING: conflicting class assignments on one converged segment must conflict, not inflate srcDiv | RR4-G-1#s1 = ASSIGNED (compensation plans); RR4-G-2#s1 = ASSIGNED (access-rights/role matrices); RR4-G-X~RR4-G-Y = SAME_UNDERLYING_DOCUMENT \| distinctClassSet = [] | reproduced |
| RR4-H | Occurrence spaces not comparable and the content repeats (script text vs plain text): the correspondence is not established, so no false split and no false merge | RR4-H-1#s1 = ASSIGNED (compensation plans); RR4-H-2#s1 = ASSIGNED (access-rights/role matrices); RR4-H-X~RR4-H-Y = SAME_UNDERLYING_DOCUMENT \| distinctClassSet = [] | reproduced |
| RR4-I | Non-comparable occurrence space, repeated text, ONE class: the occurrences are neither collapsed into one identity nor counted | RR4-I-1#s1 = ASSIGNED (compensation plans); RR4-I-2#s1 = ASSIGNED (compensation plans); RR4-I-3#s1 = ASSIGNED (compensation plans) \| distinctClassSet = ['compensation plans'] | reproduced |

### 14.2 The CSI-v5 occurrence-correspondence regressions (RR-17, OC-3), carried with byte-equal evidence

| Fixture | Case | Computed | Declared expectation |
|---|---|---|---|
| R17-A | R17-A: one occurrence in two equivalent renditions (canonical documents equal): one identity, one count group | R17-A-1#s1 = ASSIGNED (compensation plans); R17-A-2#s1 = ASSIGNED (compensation plans); R17-A-X~R17-A-Y = SAME_UNDERLYING_DOCUMENT \| distinctClassSet = ['compensation plans'] | reproduced |
| R17-A2 | R17-A2: one occurrence in two equivalent renditions whose canonical documents differ (entity kept by extraction): still one identity | R17-A2-1#s1 = ASSIGNED (compensation plans); R17-A2-2#s1 = ASSIGNED (compensation plans); R17-A2-X~R17-A2-Y = SAME_UNDERLYING_DOCUMENT \| distinctClassSet = ['compensation plans'] | reproduced |
| R17-B | R17-B: two genuine occurrences of identical bounded text in one rendition: two identities | R17-B-1#s1 = ASSIGNED (compensation plans); R17-B-2#s1 = ASSIGNED (compensation plans) \| distinctClassSet = ['compensation plans'] | reproduced |
| R17-C | R17-C: two genuine occurrences in each of two equivalent renditions, positions shifted by representation: A1=B1, A2=B2, A1!=A2 | R17-C-A1#s1 = ASSIGNED (compensation plans); R17-C-A2#s1 = ASSIGNED (access-rights/role matrices); R17-C-B1#s1 = ASSIGNED (compensation plans); R17-C-B2#s1 = ASSIGNED (access-rights/role matrices); R17-C-X~R17-C-Y = SAME_UNDERLYING_DOCUMENT \| distinctClassSet = ['access-rights/role matrices', 'compensation plans'] | reproduced |
| R17-C2 | R17-C2: two genuine occurrences in each of two equivalent renditions whose canonical documents DIFFER (entity kept by extraction): the correspondence is physically valid but no surviving proof establishes it, so fail closed | R17-C2-A1#s1 = ASSIGNED (compensation plans); R17-C2-A2#s1 = ASSIGNED (access-rights/role matrices); R17-C2-B1#s1 = ASSIGNED (compensation plans); R17-C2-B2#s1 = ASSIGNED (access-rights/role matrices); R17-C2-X~R17-C2-Y = SAME_UNDERLYING_DOCUMENT \| distinctClassSet = ['access-rights/role matrices', 'compensation plans'] | reproduced |
| R17-D | R17-D: repeated text, occurrence counts differ between equivalent renditions: correspondence cannot be established, so fail closed and count nothing | R17-D-1#s1 = ASSIGNED (compensation plans); R17-D-2#s1 = ASSIGNED (access-rights/role matrices); R17-D-X~R17-D-Y = SAME_UNDERLYING_DOCUMENT \| distinctClassSet = [] | reproduced |
| R17-D2 | R17-D2: each rendition hides a DIFFERENT one of two genuine occurrences: equal visible ranks are NOT the same occurrence, so fail closed and never merge | R17-D2-1#s1 = ASSIGNED (compensation plans); R17-D2-2#s1 = ASSIGNED (access-rights/role matrices); R17-D2-X~R17-D2-Y = SAME_UNDERLYING_DOCUMENT \| distinctClassSet = ['access-rights/role matrices', 'compensation plans'] | reproduced |
| R17-D3 | R17-D3: the correspondence is a function of the renditions' documents, not of which renditions carry a record: an unread rendition that hides an occurrence blocks the coded ones | R17-D3-1#s1 = ASSIGNED (compensation plans); R17-D3-2#s1 = ASSIGNED (access-rights/role matrices) \| distinctClassSet = ['access-rights/role matrices', 'compensation plans'] | reproduced |
| R17-E | R17-E: incompatible classes on the same corresponding occurrence conflict and contribute nothing; the other occurrence is unaffected | R17-E-X1#s1 = ASSIGNED (compensation plans); R17-E-X2#s1 = ASSIGNED (compensation plans); R17-E-Y1#s1 = ASSIGNED (access-rights/role matrices); R17-E-Y2#s1 = ASSIGNED (compensation plans) \| distinctClassSet = ['compensation plans'] | reproduced |
| R17-F | R17-F: two real occurrences of the same text carry different classes and stay distinct groups, even beside a rendition that cannot carry them | R17-F-1#s1 = ASSIGNED (compensation plans); R17-F-2#s1 = ASSIGNED (access-rights/role matrices); R17-F-3#s1 = OUTSIDE_FROZEN_VOCABULARY; R17-F-X~R17-F-Y = SAME_UNDERLYING_DOCUMENT \| distinctClassSet = ['access-rights/role matrices', 'compensation plans'] | reproduced |
| R17-G | R17-G: the original RR4-G attack (conflicting classes through equivalent renditions) still fails: conflict, empty distinctClassSet | RR4-G-1#s1 = ASSIGNED (compensation plans); RR4-G-2#s1 = ASSIGNED (access-rights/role matrices); RR4-G-X~RR4-G-Y = SAME_UNDERLYING_DOCUMENT \| distinctClassSet = [] | reproduced |
| R17-H | R17-H: the parent counterexample of the wildcard (RR4-I): no genuine occurrence is collapsed and no unresolved one is counted | RR4-I-1#s1 = ASSIGNED (compensation plans); RR4-I-2#s1 = ASSIGNED (compensation plans); RR4-I-3#s1 = ASSIGNED (compensation plans) \| distinctClassSet = ['compensation plans'] | reproduced |
| R17-I | R17-I: a byte-identical duplicate whose bytes are unavailable is an UNKNOWN carrier: correspondence is not proven, fail closed | s1 = DUPLICATE_IDENTITY_UNRESOLVED [MEMBER_BYTES_UNAVAILABLE]; R17-I-X~R17-I-U = SAME_UNDERLYING_DOCUMENT \| distinctClassSet = [] | reproduced |
| R17-J | R17-J: three equivalent renditions, two share a canonical document and one does not: the unique sentence converges in all three | R17-J-1#s1 = ASSIGNED (compensation plans); R17-J-2#s1 = ASSIGNED (compensation plans); R17-J-3#s1 = ASSIGNED (compensation plans) \| distinctClassSet = ['compensation plans'] | reproduced |

| Fixture | Case | Computed | Declared expectation |
|---|---|---|---|
| OC3-CODEX | OC3-CODEX: the exact shape of the IV1 counterexample: a created occurrence before the genuine occurrence, another genuine occurrence hidden later, EQUAL extracted totals: equal counts are not a correspondence | OC3-CODEX-A1#s1 = ASSIGNED (compensation plans); OC3-CODEX-B0#s1 = ASSIGNED (access-rights/role matrices); OC3-CODEX-A~OC3-CODEX-B = SAME_UNDERLYING_DOCUMENT \| distinctClassSet = [] | reproduced |
| OC3-R1 | OC3-R1: equal counts and a physically VALID correspondence: removing the count-equality proof must not assert it, so fail closed | OC3-R1-A0#s1 = ASSIGNED (compensation plans); OC3-R1-A1#s1 = ASSIGNED (access-rights/role matrices); OC3-R1-B0#s1 = ASSIGNED (compensation plans); OC3-R1-B1#s1 = ASSIGNED (access-rights/role matrices); OC3-R1-A~OC3-R1-B = SAME_UNDERLYING_DOCUMENT \| distinctClassSet = ['access-rights/role matrices', 'compensation plans'] | reproduced |
| OC3-R2 | OC3-R2: equal counts, SHIFTED correspondence (a created occurrence before, the MIDDLE genuine occurrence hidden): rank n is not the same occurrence, and every occurrence is coded | OC3-R2-A0#s1 = DUPLICATE_IDENTITY_UNRESOLVED [TEXT_BEARING_REMOVAL_SEAM_TAINTED_POSITION]; OC3-R2-A1#s1 = ASSIGNED (access-rights/role matrices); OC3-R2-A2#s1 = ASSIGNED (access-rights/role matrices); OC3-R2-B0#s1 = ASSIGNED (compensation plans); OC3-R2-B1#s1 = ASSIGNED (access-rights/role matrices); OC3-R2-B2#s1 = ASSIGNED (compensation plans); OC3-R2-A~OC3-R2-B = SAME_UNDERLYING_DOCUMENT \| distinctClassSet = ['access-rights/role matrices'] | reproduced |
| OC3-R2b | OC3-R2b: equal counts, shifted correspondence WITHOUT any created occurrence (one rendition hides the first genuine occurrence, the other the last): already rejected by the parent, pinned as a control | OC3-R2b-A0#s1 = ASSIGNED (compensation plans); OC3-R2b-B1#s1 = ASSIGNED (access-rights/role matrices); OC3-R2b-A~OC3-R2b-B = SAME_UNDERLYING_DOCUMENT \| distinctClassSet = [] | reproduced |
| OC3-R3 | OC3-R3: created-before, hidden-after with three genuine occurrences and ONE class: equal counts must not split the supplying occurrence into two counting identities | OC3-R3-A1#s1 = ASSIGNED (compensation plans); OC3-R3-B0#s1 = ASSIGNED (compensation plans); OC3-R3-A~OC3-R3-B = SAME_UNDERLYING_DOCUMENT \| distinctClassSet = ['compensation plans'] | reproduced |
| OC3-R4 | OC3-R4: hidden-before, created-after (the mirror of the IV1 shape): equal counts, shifted correspondence | OC3-R4-A0#s1 = ASSIGNED (compensation plans); OC3-R4-B1#s1 = ASSIGNED (access-rights/role matrices); OC3-R4-A~OC3-R4-B = SAME_UNDERLYING_DOCUMENT \| distinctClassSet = [] | reproduced |
| OC3-R5 | OC3-R5: equal counts and three repeated identical genuine occurrences in both renditions: no correspondence proof beyond count equality, so nothing counts | OC3-R5-A0#s1 = ASSIGNED (compensation plans); OC3-R5-A1#s1 = ASSIGNED (access-rights/role matrices); OC3-R5-A2#s1 = ASSIGNED (compensation plans); OC3-R5-B0#s1 = ASSIGNED (compensation plans); OC3-R5-B1#s1 = ASSIGNED (access-rights/role matrices); OC3-R5-B2#s1 = ASSIGNED (compensation plans); OC3-R5-A~OC3-R5-B = SAME_UNDERLYING_DOCUMENT \| distinctClassSet = ['access-rights/role matrices', 'compensation plans'] | reproduced |
| OC3-R6 | OC3-R6: conflicting classes on one physically ambiguous occurrence across three renditions must never become SC-3 + SC-7 independent diversity | OC3-R6-A1#s1 = ASSIGNED (compensation plans); OC3-R6-B0#s1 = ASSIGNED (access-rights/role matrices); OC3-R6-C1#s1 = ASSIGNED (compensation plans); OC3-R6-A~OC3-R6-B = SAME_UNDERLYING_DOCUMENT; OC3-R6-A~OC3-R6-C = SAME_UNDERLYING_DOCUMENT; OC3-R6-B~OC3-R6-C = SAME_UNDERLYING_DOCUMENT \| distinctClassSet = [] | reproduced |
| OC3-R7 | OC3-R7: a deterministic proof exists (OC-1: the extracted documents are equal, the same created and hidden occurrences): the supplying occurrence still converges to ONE identity | OC3-R7-A1#s1 = ASSIGNED (compensation plans); OC3-R7-B1#s1 = ASSIGNED (compensation plans); OC3-R7-A~OC3-R7-B = SAME_UNDERLYING_DOCUMENT \| distinctClassSet = ['compensation plans'] | reproduced |
| OC3-R7b | OC3-R7b: the same equal documents with conflicting classes: ONE group, SEGMENT_CLASS_CONFLICT, distinctClassSet empty (never two independent groups) | OC3-R7b-A1#s1 = ASSIGNED (compensation plans); OC3-R7b-B1#s1 = ASSIGNED (access-rights/role matrices); OC3-R7b-A~OC3-R7b-B = SAME_UNDERLYING_DOCUMENT \| distinctClassSet = [] | reproduced |
| OC3-R8 | OC3-R8: a deterministic proof exists (OC-4: one occurrence in each rendition and at most one in the canonical rendition text): the sentence still converges | OC3-R8-A0#s1 = ASSIGNED (compensation plans); OC3-R8-B0#s1 = ASSIGNED (compensation plans); OC3-R8-A~OC3-R8-B = SAME_UNDERLYING_DOCUMENT \| distinctClassSet = ['compensation plans'] | reproduced |

| Fixture | Case | Computed | Declared expectation |
|---|---|---|---|
| OC3-KL1 | OC3-KL1: KNOWN LIMIT of the surviving uniqueness proof (pinned, not repaired): a created occurrence in one rendition and the genuine occurrence in the other share rank 0 | OC3-KL1-A0#s1 = DUPLICATE_IDENTITY_UNRESOLVED [TEXT_BEARING_REMOVAL_SEAM_TAINTED_POSITION]; OC3-KL1-B0#s1 = ASSIGNED (access-rights/role matrices); OC3-KL1-A~OC3-KL1-B = SAME_UNDERLYING_DOCUMENT \| distinctClassSet = ['access-rights/role matrices'] | reproduced |

## 15. OCCURRENCE ANCHORING - OPTION A+ (OA-1 .. OA-14)

Architecture: SOURCECLASS-OCCURRENCE-ANCHORING-ARCHITECTURE-1.CORR1 + .CORR1.CORR1 + .CORR1.CORR1.CORR1, Option A+ (all three Owner-accepted; controlling); OA-1 .. OA-14 as stated in the CORR1.CORR1.CORR1 normative bundle.

- P1 Identity lives in a proven-shared frame: a position or a content key is identity-bearing only in a frame every rendition of the document is proven to share; post-extraction text is never such a frame.
- P2 The shared frame sees everything text-bearing, so a hidden copy can neither move a position nor escape a count.
- P3 Decisions are functions of the occurrence, never of the record: FRAME-C decides per (document, interval) over every member and every record carrying it (representability and seam), FRAME-U per (document, key); a record that never reaches an occurrence is a conflict witness against the occurrences of its document (OA-14), never a counting record.
- P4 Ambiguity is non-counting: the existing state and path, no tie-breaker.
- P5 Measured text properties (rank, counts, content hash, context, locators, headings) are diagnostics.

### 15.1 Members (OA-1)

| Item | Rule |
|---|---|
| rule | the members of an underlying document are the artifacts of its RESOLVED R-DUP group, or the artifact alone when it has no group |
| unresolvedGroup | an unresolved R-DUP group keeps the existing behaviour: each member is separate and every segment is non-counting (reason DUPLICATE_GROUP_UNRESOLVED) |
| unavailableMember | a member whose bytes are unavailable makes every segment of the document unresolved (reason MEMBER_BYTES_UNAVAILABLE) |
| decoderMismatch | a record whose recipe decoder differs from its artifact's renditionDecoder is unresolved (reason DECODER_FRAME_MISMATCH) |

### 15.2 Origin-tracked replay (OA-2)

| Item | Rule |
|---|---|
| rule | the interpreter replays every declared op sequence (decoder output -> recipe ops; canonicalization ops; coder-text ops; complete-view ops) and returns the same text plus, for every output character, the half-open decoded-text interval that produced it and the index of the op that emitted it (-1 when copied unchanged). Replacement characters carry the origin interval of the entire matched source range. |
| invariant | the tracked text equals the untracked text byte-for-byte for every artifact and every recipe |
| onMismatch | HARD_VALIDATION_FAILURE: evaluation stops with a model error; the tracked text is never used in place of the untracked text |

### 15.3 Extraction op roles (OA-5)

| Role | Removal class |
|---|---|
| CONTENT_BLOCK_REMOVAL | BLOCK |
| MARKUP_REMOVAL | MARKUP |
| NORMALIZATION | SURVIVES |

Declared on: the field role of every op of every evidenceBinding.extractionRecipes entry. Missing role: MODEL_ERROR: an op without a declared role, or with a role outside the vocabulary, stops evaluation; a role is never inferred from the op's pattern at runtime

| Recipe | Op # | Op | Declared role |
|---|---|---|---|
| PLAIN_TEXT_V1 | 1 | regex \r\n? | NORMALIZATION |
| HTML_TEXT_V1 | 1 | regex \r\n? | NORMALIZATION |
| HTML_TEXT_V1 | 2 | regex <script.*?</script> | CONTENT_BLOCK_REMOVAL |
| HTML_TEXT_V1 | 3 | regex <style.*?</style> | CONTENT_BLOCK_REMOVAL |
| HTML_TEXT_V1 | 4 | regex <!--.*?--> | CONTENT_BLOCK_REMOVAL |
| HTML_TEXT_V1 | 5 | regex </?(?:br\|p\|div\|tr\|li\|h[1-6]\|table\|title\|center\|dt\|dd\|blockquote\|pre)\b[^>]*> | MARKUP_REMOVAL |
| HTML_TEXT_V1 | 6 | regex <[^>]+> | MARKUP_REMOVAL |
| HTML_TEXT_V1 | 7 | html_unescape | NORMALIZATION |
| HTML_TEXT_V1 | 8 | regex   | NORMALIZATION |
| HTML_RAW_V1 | 1 | regex \r\n? | NORMALIZATION |

### 15.4 Anchor source sigma and skeleton k (OA-3)

| Recipes | Basis | Rule |
|---|---|---|
| markup-removing | LETTERS_AND_DIGITS_OF_CODER_TEXT | a recipe without preservedArtifactClasses: sigma spans the decoded-text origin of the first to the last letter/digit of the coder text (the skeleton k); the edges are recipe-independent; an empty k gives no identity (reason EMPTY_SKELETON) |
| markup-preserving | CANONICAL_CONTENT_MARKUP_PRESERVED | a recipe with preservedArtifactClasses: the markup is the evidence; sigma spans the decoded-text origin of the first to the last character of the recipe-canonical content (an empty canonical content gives no identity: reason EMPTY_CANONICAL_SEGMENT) |

Coder text: `[{"op": "regex", "pattern": "<[^>]+>", "flags": [], "repl": " "}, {"op": "html_unescape"}, {"op": "casefold"}, {"op": "regex", "pattern": "[\\W_]+", "flags": [], "repl": ""}]` (the skeleton k of a segment: its extraction span with tags stripped, entities decoded, casefolded and projected on Unicode letters and digits). no DOM path, no byte offset across renditions and no PDF coordinate is an anchor.

### 15.5 Complete view (OA-4)

per member, from the decoded rendition text: (1) every comment emits its body between spaces; (2) every tag: a well-formed tag (strict grammar) emits its attribute values and every element or attribute name that is not a declared standard name; anything else emits its whole interior; (3) html_unescape; (4) casefold; (5) keep Unicode letters and digits only. Origin-tracked.

| Item | Value |
|---|---|
| comment pattern | `<!--(.*?)-->` |
| tag pattern | `<[^>]+>` |
| strict tag grammar | `<\s*/?\s*([A-Za-z][A-Za-z0-9]*)((?:\s+[A-Za-z_:][-A-Za-z0-9_:.]*(?:\s*=\s*(?:"[^"]*"\|'[^']*'\|[^\s"'=<>`]+))?)*)\s*/?\s*>$` |
| attribute pattern | `([A-Za-z_:][-A-Za-z0-9_:.]*)(?:\s*=\s*(?:"([^"]*)"\|'([^']*)'\|([^\s"'=<>`]+)))?` |
| standard element names | 143 declared |
| standard attribute names | 177 declared, plus prefixes data-, aria- |
| then | `[{"op": "html_unescape"}, {"op": "casefold"}, {"op": "regex", "pattern": "[\\W_]+", "flags": [], "repl": ""}]` |
| source kinds | `{"text": "TEXT", "commentBody": "COMMENT_BODY", "attributeValue": "ATTRIBUTE_VALUE", "nonStandardName": "NON_STANDARD_NAME", "malformedInterior": "MALFORMED_INTERIOR"}` |
| fail closed | anything the view cannot classify is kept as text-bearing; extra text can only make complete views differ (FRAME-U) or raise counts (unresolved), never create a correspondence |
| standard names | standard element and attribute names are the only characters of a tag that never enter the view; they are declared model data (an omitted standard name makes views stricter, never looser) |

### 15.6 Removal views (OA-5)

| View | Rule |
|---|---|
| recipe views (OP_PROVENANCE) | one view for every declared recipe whose decoder is the member's renditionDecoder and one of whose ops is declared CONTENT_BLOCK_REMOVAL or MARKUP_REMOVAL: in the origin-tracked replay of that recipe on the member's decoded text, the decoded origin of every match of a removal op takes that op's removal class; every other position SURVIVES |
| TAG view (markup_tags) | every member: every decoded position inside a match of the canonicalization op of that artifact class (the tag-stripping reading of the coder-text skeleton and of canonicalization) is MARKUP; every other position SURVIVES |
| class of a complete-view character | the class, in the view, of the decoded position at the START of the character's origin |

### 15.7 TEXT_BEARING_REMOVAL_SEAM (R-3)

TEXT_BEARING_REMOVAL_SEAM(m, w) holds for member m and complete-view interval w iff, for SOME removal view of m, w holds complete-view positions i < j < l with class(i) = SURVIVES, class(l) = SURVIVES and class(j) a removed class: a text-bearing letter or digit that the reading removes lies strictly between two letters or digits that survive it, so the reading joins them across removed text-bearing material

- *a seam:* any text-bearing attribute value whatever the attribute name (alt, title, href, data-*, aria-*, style, class, width, unknown); a numeric-only value (digits are text-bearing); a non-standard element or attribute name, a malformed tag interior; script, style and comment content with a letter or digit
- *not a seam:* a formatting-only tag (standard names never enter the complete view); an empty or punctuation-only removed value or block (no letter or digit); text-bearing markup outside the occurrence or at its edge (not strictly between)

### 15.8 Frame selection (OA-6)

FRAME-C iff every member's complete view is the same string (always true for a singleton and for byte-identical members); FRAME-U otherwise. The frame is chosen once per underlying document, never per record.

### 15.9 FRAME-C (OA-7; OA-7(b) per occurrence, CORR1.CORR1)

identity (U, C, omega) iff omega is non-empty, FRAME_C_OCCURRENCE_REPRESENTABLE(U, omega), and for NO member m and NO removal view of m is omega a text-bearing removal seam. Both occurrence gates are functions of (U, omega) and of every representation carrying it: if any record on (U, omega) fails the representability test, or any member is seam-tainted there, EVERY record carrying (U, omega) receives no identity, the marker UNESTABLISHED, the state DUPLICATE_IDENTITY_UNRESOLVED and no R-COUNT contribution; no record on the occurrence survives independently.

| Condition | Level | Test | Recorded reason |
|---|---|---|---|
| C-a | RECORD (the provisional occurrence exists) | OMEGA_NON_EMPTY | EMPTY_COMPLETE_VIEW_IMAGE |
| C-b | OCCURRENCE | FRAME_C_OCCURRENCE_REPRESENTABLE | COMPLETE_VIEW_BOUNDARY_NOT_REPRESENTABLE |
| C-c | OCCURRENCE | NO_TEXT_BEARING_REMOVAL_SEAM | TEXT_BEARING_REMOVAL_SEAM_TAINTED_POSITION |

omega: the interval of complete-view positions whose origin intersects sigma, in the record's own member (the complete views of all members are the same string). Provisional occurrence: the pair (U, omega) of a record whose omega is non-empty (condition C-a holds); records are grouped by the exact key (U, omega.start, omega.end). Representability: FRAME_C_OCCURRENCE_REPRESENTABLE(U, omega) holds iff EVERY record whose provisional occurrence is (U, omega) passes the representability test (every complete-view character in omega has its origin inside that record's sigma). Decision: C-b and C-c are both evaluated; the decision is their conjunction and does not depend on the order in which they are tested; the recorded reason is the first failing condition in the declared order C-a, C-b, C-c, and failedConditions records every failing one. Taint scope: `EVERY_MEMBER`.

### 15.10 FRAME-U (OA-8)

identity (U, K, sha256(k)) iff k is non-empty and every guard condition holds; the guard is a function of (U, k) and of the records carrying it, so every record with the key receives the same decision

| Guard | Test | Recorded reason | Rule |
|---|---|---|---|
| U1 | SKELETON_EXACTLY_ONCE_IN_EVERY_COMPLETE_VIEW | U1_CONTENT_NOT_UNIQUE_IN_EVERY_COMPLETE_VIEW | k occurs exactly once (overlapping occurrences counted) in the complete view of every member; call that interval w_m |
| U2 | CANDIDATE_NOT_A_SEAM_IN_ANY_MEMBER | U2_CANDIDATE_OCCURRENCE_IS_A_TEXT_BEARING_REMOVAL_SEAM | w_m is not a text-bearing removal seam in any member |
| U3 | NO_APPARENT_OCCURRENCE_CREATED_BY_REMOVAL | U3_APPARENT_OCCURRENCE_CREATED_BY_TEXT_BEARING_REMOVAL | for every member and every removal view, every occurrence of k in the view's surviving projection of the complete view occupies consecutive complete-view positions (an occurrence that the reading manufactures by removing text-bearing material between its halves withholds the key even if no record codes it) |
| U4 | NO_SEAM_RECORD_CARRIES_THE_KEY | U4_A_RECORD_CARRYING_THE_KEY_IS_A_TEXT_BEARING_REMOVAL_SEAM | no record carrying (U, k) is an own seam |

Count view: `COMPLETE_VIEW`. Scope: `KEY_LEVEL`. Empty skeleton: `EMPTY_SKELETON`.

### 15.11 Own seam (OA-9)

a record is an own seam iff the image of its sigma in its own member's complete view is not representable (its own sigma fails the representability test of condition C-b) or is a text-bearing removal seam in that member. Used only through: FRAME-C conditions C-b and C-c, both evaluated per occurrence: a record whose own image is not representable makes its provisional occurrence (U, omega) unrepresentable for every record carrying it, and for C-c the own member is one of the members; FRAME-U guard condition U4. own seam is recorded as a diagnostic and never decides one record alone.

### 15.12 Fail closed (OA-10)

anything not deterministically established yields no identity, the marker UNESTABLISHED, the state DUPLICATE_IDENTITY_UNRESOLVED and no R-COUNT contribution; only existing states are used

Recorded reasons: `DUPLICATE_GROUP_UNRESOLVED`, `MEMBER_BYTES_UNAVAILABLE`, `EMPTY_CANONICAL_SEGMENT`, `DECODER_FRAME_MISMATCH`, `EMPTY_COMPLETE_VIEW_IMAGE`, `COMPLETE_VIEW_BOUNDARY_NOT_REPRESENTABLE`, `TEXT_BEARING_REMOVAL_SEAM_TAINTED_POSITION`, `EMPTY_SKELETON`, `U1_CONTENT_NOT_UNIQUE_IN_EVERY_COMPLETE_VIEW`, `U2_CANDIDATE_OCCURRENCE_IS_A_TEXT_BEARING_REMOVAL_SEAM`, `U3_APPARENT_OCCURRENCE_CREATED_BY_TEXT_BEARING_REMOVAL`, `U4_A_RECORD_CARRYING_THE_KEY_IS_A_TEXT_BEARING_REMOVAL_SEAM`, `POSSIBLE_CLASS_CONFLICT_FROM_UNPLACED_WITNESS`. Order: DUPLICATE_GROUP_UNRESOLVED; MEMBER_BYTES_UNAVAILABLE; EMPTY_CANONICAL_SEGMENT (sigma empty, in the recipe decoder's text); DECODER_FRAME_MISMATCH; then the frame: FRAME-C C-a / C-b / C-c, FRAME-U EMPTY_SKELETON / U1..U4; then OA-14.

### 15.13 Unplaced conflict witness and class-conditional quarantine (OA-14, CORR1.CORR1.CORR1)

runs once, after every FRAME-C and FRAME-U decision (OA-7, OA-8) and before R-COUNT; an identity OA-7 or OA-8 gives a record is ESTABLISHED and OA-14 may withhold it; OA-14 adds no state, class, disposition, identity key or R-COUNT step

| Item | Declared |
|---|---|
| unplaced exits | EMPTY_CANONICAL_SEGMENT, DECODER_FRAME_MISMATCH, EMPTY_COMPLETE_VIEW_IMAGE, EMPTY_SKELETON |
| unplaced | a record r is unplaced iff it is bound, its underlying document U is resolved (no unresolved R-DUP group), and anchoring fails BEFORE r has a provisional occurrence, through exactly one of the unplacedExits. A record that has a provisional occurrence (U, omega) or key (U, k) is never unplaced, whatever OA-7 or OA-8 later decides for it; such records stay governed by the occurrence-level gates C-b, C-c and U1-U4. |
| witness role / source | UNPLACED_CONFLICT_WITNESS / PRE_OCCURRENCE_EXIT |
| witness rule | an unplaced record is an UNPLACED_CONFLICT_WITNESS iff the frozen class predicates it satisfies are exactly one class c, the class it would carry as ASSIGNED had its identity been established; class(r) = c. The record itself is unchanged: no identity (UNESTABLISHED), DUPLICATE_IDENTITY_UNRESOLVED, its own reason, no R-COUNT contribution. The witness role is a recorded diagnostic, not a state. |
| not a witness | `{"noClass": "NO_POSITIVE_FROZEN_CLASS", "multiple": "MULTIPLE_CLASS_PREDICATES_SATISFIED_PRESERVED"}` |
| why not | under the frozen R-COUNT only ASSIGNED records enter a count group: a record with no positive class or with several could never fire SEGMENT_CLASS_CONFLICT wherever it were placed, so its absence removes no conflict; the MULTIPLE result is preserved as it is and no class is chosen for it |
| candidate set basis | ALL_ESTABLISHED_OCCURRENCES_OF_U (exclusion proofs: `[]`; SAFE_NARROWING_NOT_AVAILABLE) |
| candidate set rule | C(r) is every identity established by OA-7 or OA-8 for a record of U, taken before any OA-14 withholding. An occurrence may leave C(r) only through a deterministic proof, declared in exclusionProofs, that r cannot physically be that occurrence; none is declared. C(r) is never an identity and never an assignment, even when it has one member, and it never leaves U. |
| quarantine rule | SINGLE_COUNTED_CLASS_DIFFERS: classes(o) = the classes of the ASSIGNED records carrying the established occurrence o before OA-14. QUARANTINE(o) iff some witness r has o in C(r), classes(o) = {c'} and c' != class(r). classes(o) = {class(r)}: o is unaffected. Two or more classes: o already receives SEGMENT_CLASS_CONFLICT at R-COUNT and OA-14 leaves it to that path. No class: nothing is withheld. |
| withholding | every record carrying a quarantined occurrence receives no identity (UNESTABLISHED), the state DUPLICATE_IDENTITY_UNRESOLVED, no class and the reason POSSIBLE_CLASS_CONFLICT_FROM_UNPLACED_WITNESS; it is dropped at R-COUNT step 2 like every other fail-closed record. The withheld identity and the witnesses that withheld it are recorded as diagnostics. |
| application | SIMULTANEOUS: every witness and every C(r) is computed from the state before OA-14 and every quarantine is applied at once: the result does not depend on record or witness order; a withheld occurrence never changes any C(r); the records of a withheld occurrence never become witnesses (they had a provisional occurrence); OA-14 applied to its own output changes nothing |
| equivalently | o is withheld iff some witness of U, placed on o, would make R-COUNT fire SEGMENT_CLASS_CONFLICT on o; with no exclusion proof this is the least withholding that is sound for every placement of every witness |

*Recorded.* the unplaced record: UNPLACED_CONFLICT_WITNESS or why it is not one, its frozen class, its candidate set C(r), the basis; the withheld occurrence: the identity OA-14 withheld and the witnesses that withheld it

*Forbidden.* an identity, count group, occurrence or class given to an unplaced record, including when C(r) has one member; placing an unplaced record on the nearest, first, same-text or same-class occurrence; using rank, occurrence count, context, locator, heading, canonical or text equality, or a similarity score, to include an occurrence in C(r) or to exclude one from it; narrowing C(r) by anything other than a deterministic impossibility proof declared in the model (none is declared); a quarantine that depends on record or witness order, or that is applied witness by witness to a state an earlier witness changed; a cascade: a record withheld by OA-14 acting as a witness; a class-unconditional (document-wide) quarantine; a witness taken from a record with no positive frozen class, from a MULTIPLE_CLASS_PREDICATES_SATISFIED result by choosing one of its classes, or from an unresolved R-DUP group; a new state, class, disposition, key or R-COUNT step for the witness or the quarantine

### 15.14 Residual register

| Residual | Status |
|---|---|
| R-7 | OPEN / SEPARATE / OUT_OF_SCOPE: overlapping but unequal segments (different coder boundaries, or a markup-preserving and a text record on one place) are different segments and can count separately; B-2 is not mechanically enforced and this model neither closes nor enlarges it |
| R-11 | BOUNDED / ACCEPTED (Owner): presentational attribute values and inline links inside a coded span are text-bearing, so the segment is non-counting |
| R-12 | BOUNDED / ACCEPTED (Owner): U2 and U3 withhold a key even where a genuine occurrence exists elsewhere |
| R-13 | CLOSED IN TEST COVERAGE: a U4-only construction (U1, U2 and U3 pass, U4 alone fails) is a first-class fixture; U4 is unchanged |
| R-14 | CLOSED (conflict-bypass direction) by OA-14 |
| R-15 | BOUNDED / ACCEPTED: one non-representable record withholds every record on its occurrence (conservative) |
| R-16 | BOUNDED / ACCEPTED (Owner): C(r) = every established occurrence of U withholds physically unrelated conflicting occurrences (conservative undercount) |
| R-17 | RECORDED: no-class and MULTIPLE unplaced records withhold nothing (parity with the frozen R-COUNT) |
| R-18 | RECORDED: the OA-14 argument is bounded by one resolved R-DUP group; unresolved groups are non-counting |

### 15.15 Architecture fixtures: the 38 parent-architecture cases (slot constructions; physical oracle)

| Fixture | Case | Computed | Declared expectation |
|---|---|---|---|
| ADV-01 | created occurrence before genuine: rendition A: seam before G0 CREATES an apparent occurrence (script between the halves); rendition B: seam plain. G0 coded in both with different classes; the created occurrence coded too | ADV-01-N0#s1 = ASSIGNED (compensation plans); ADV-01-N1#s1 = ASSIGNED (access-rights/role matrices); ADV-01-N2#s1 = DUPLICATE_IDENTITY_UNRESOLVED [TEXT_BEARING_REMOVAL_SEAM_TAINTED_POSITION] \| distinctClassSet = [] | reproduced |
| ADV-02 | created occurrence after genuine: A: G0 then a seam that creates an occurrence; B: seam plain. G0 coded in both (different classes), created occurrence coded | ADV-02-N0#s1 = ASSIGNED (compensation plans); ADV-02-N1#s1 = ASSIGNED (access-rights/role matrices); ADV-02-N2#s1 = DUPLICATE_IDENTITY_UNRESOLVED [TEXT_BEARING_REMOVAL_SEAM_TAINTED_POSITION] \| distinctClassSet = [] | reproduced |
| ADV-03 | hidden genuine before: A: G0 hidden in a script, G1 visible; B: G0 G1 visible. G1 coded in A (occ 0) and B (occ 1) with different classes | ADV-03-N0#s1 = ASSIGNED (compensation plans); ADV-03-N1#s1 = ASSIGNED (access-rights/role matrices) \| distinctClassSet = [] | reproduced |
| ADV-04 | hidden genuine after: A: G0 visible, G1 hidden in a style block; B: G0 G1 visible. G0 coded in A and B with different classes, G1 coded in B | ADV-04-N0#s1 = ASSIGNED (compensation plans); ADV-04-N1#s1 = ASSIGNED (access-rights/role matrices); ADV-04-N2#s1 = ASSIGNED (compensation plans) \| distinctClassSet = ['compensation plans'] | reproduced |
| ADV-05 | created-before + hidden-after (the OC-3 counterexample shape): A: seam creates an occurrence before G0, G1 hidden; B: G0 G1 visible, seam plain. Equal totals; G0 is rank 1 in A and rank 0 in B | ADV-05-N0#s1 = ASSIGNED (compensation plans); ADV-05-N1#s1 = ASSIGNED (access-rights/role matrices) \| distinctClassSet = [] | reproduced |
| ADV-06 | hidden-before + created-after: A: G0 hidden, G1 visible, seam after creates an occurrence; B: G0 G1 visible, seam plain. G1 coded in both | ADV-06-N0#s1 = ASSIGNED (compensation plans); ADV-06-N1#s1 = ASSIGNED (access-rights/role matrices) \| distinctClassSet = [] | reproduced |
| ADV-07 | script removal (single rendition seam): ONE rendition: a script block between the halves of a seam creates an apparent occurrence; genuine G0 also present. Created occurrence coded class A, genuine coded class B | ADV-07-N0#s1 = DUPLICATE_IDENTITY_UNRESOLVED [TEXT_BEARING_REMOVAL_SEAM_TAINTED_POSITION]; ADV-07-N1#s1 = ASSIGNED (access-rights/role matrices) \| distinctClassSet = ['access-rights/role matrices'] | reproduced |
| ADV-08 | style removal (single rendition seam): ONE rendition: a style block creates the apparent occurrence; genuine G0 also present; codings as ADV-07 | ADV-08-N0#s1 = DUPLICATE_IDENTITY_UNRESOLVED [TEXT_BEARING_REMOVAL_SEAM_TAINTED_POSITION]; ADV-08-N1#s1 = ASSIGNED (access-rights/role matrices) \| distinctClassSet = ['access-rights/role matrices'] | reproduced |
| ADV-09 | HTML entity normalization (benign): A: G0 plain; B: G0 with &nbsp; and &amp; entities (extraction equal after decoding). G0 coded in both with different classes | ADV-09-N0#s1 = ASSIGNED (compensation plans); ADV-09-N1#s1 = ASSIGNED (access-rights/role matrices) \| distinctClassSet = [] | reproduced |
| ADV-10 | HTML entity divergence (NEW: OC-2 split): A: apostrophe as &rsquo; ; B: apostrophe as &#39; . R-EQV maps both to a space (one document); extraction decodes them to different characters. The ONE sentence coded in A and B with different classes | ADV-10-N0#s1 = ASSIGNED (compensation plans); ADV-10-N1#s1 = ASSIGNED (access-rights/role matrices) \| distinctClassSet = [] | reproduced |
| ADV-11 | extraction-created adjacency (OC-1 counterexample): NO filler between slots. A: G0 hidden, G1 G2 visible; B: G0 G1 visible, G2 hidden. Canonical extraction documents are EQUAL; G1 is rank 0 in A and rank 1 in B | ADV-11-N0#s1 = ASSIGNED (compensation plans); ADV-11-N1#s1 = ASSIGNED (access-rights/role matrices) \| distinctClassSet = [] | reproduced |
| ADV-12 | two identical genuine occurrences (byte-identical renditions): A and B byte-identical, G0 G1 visible. G0 coded in A, G0 in B, G1 in B | ADV-12-N0#s1 = ASSIGNED (compensation plans); ADV-12-N1#s1 = ASSIGNED (compensation plans); ADV-12-N2#s1 = ASSIGNED (access-rights/role matrices) \| distinctClassSet = ['access-rights/role matrices', 'compensation plans'] | reproduced |
| ADV-13 | three identical genuine occurrences (byte-identical): A and B byte-identical, G0 G1 G2 visible. G1 coded in A and B with different classes (must converge -> conflict), G2 coded in B | ADV-13-N0#s1 = ASSIGNED (compensation plans); ADV-13-N1#s1 = ASSIGNED (access-rights/role matrices); ADV-13-N2#s1 = ASSIGNED (compensation plans) \| distinctClassSet = ['compensation plans'] | reproduced |
| ADV-14 | same canonical extracted document, different bytes: A: G0 plain; B: G0 bold (markup only). Canonical extraction documents equal. G0 coded in both (different classes) | ADV-14-N0#s1 = ASSIGNED (compensation plans); ADV-14-N1#s1 = ASSIGNED (access-rights/role matrices) \| distinctClassSet = [] | reproduced |
| ADV-15 | same occurrence count, misaligned: A: G0 hidden, G1 G2 visible; B: G0 G1 visible, G2 hidden; fillers present (documents differ); equal totals. G1 coded in both | ADV-15-N0#s1 = ASSIGNED (compensation plans); ADV-15-N1#s1 = ASSIGNED (access-rights/role matrices) \| distinctClassSet = [] | reproduced |
| ADV-16 | different occurrence count: A: G0 G1 visible; B: G0 hidden, G1 visible. G1 coded in both with different classes | ADV-16-N0#s1 = ASSIGNED (compensation plans); ADV-16-N1#s1 = ASSIGNED (access-rights/role matrices) \| distinctClassSet = [] | reproduced |
| ADV-17 | same rank, different occurrences: A: G0 visible, G1 hidden; B: G0 hidden, G1 visible (complementary). Each rendition shows one occurrence at rank 0; they are DIFFERENT slots. Coded with different classes | ADV-17-N0#s1 = ASSIGNED (compensation plans); ADV-17-N1#s1 = ASSIGNED (access-rights/role matrices) \| distinctClassSet = ['access-rights/role matrices', 'compensation plans'] | reproduced |
| ADV-18 | shifted rank, same occurrence: A: G0 hidden (style), G1 visible; B: G0 G1 visible. G1 is rank 0 in A and rank 1 in B. Coded with different classes | ADV-18-N0#s1 = ASSIGNED (compensation plans); ADV-18-N1#s1 = ASSIGNED (access-rights/role matrices) \| distinctClassSet = [] | reproduced |
| ADV-19 | two renditions, single genuine occurrence: A and B differ only by markup; one genuine sentence coded in both with different classes (must converge -> conflict) | ADV-19-N0#s1 = ASSIGNED (compensation plans); ADV-19-N1#s1 = ASSIGNED (access-rights/role matrices) \| distinctClassSet = [] | reproduced |
| ADV-20 | three renditions: A: G0 G1 visible; B: G0 hidden; C: G1 hidden (style). G1 coded in A and B, G0 coded in C | ADV-20-N0#s1 = ASSIGNED (compensation plans); ADV-20-N1#s1 = ASSIGNED (access-rights/role matrices); ADV-20-N2#s1 = ASSIGNED (compensation plans) \| distinctClassSet = ['compensation plans'] | reproduced |
| ADV-21 | identical prefix: NO fillers: G0 G1 adjacent so both occurrences share the preceding context 'Preface.' only for the first; both renditions byte-identical except one bold; G1 coded in both | ADV-21-N0#s1 = ASSIGNED (compensation plans); ADV-21-N1#s1 = ASSIGNED (access-rights/role matrices) \| distinctClassSet = [] | reproduced |
| ADV-22 | identical suffix / repeated prefix-exact-suffix bundle: NO fillers, four adjacent genuine occurrences: G1 and G2 have IDENTICAL prefix+text+suffix bundles; A hides G0, B hides G3 (equal extraction documents) | ADV-22-N0#s1 = ASSIGNED (compensation plans); ADV-22-N1#s1 = ASSIGNED (access-rights/role matrices) \| distinctClassSet = [] | reproduced |
| ADV-23 | T-invisible hiding (attribute), repeated content: A: G0 G1 visible, G2 hidden in an ATTRIBUTE; B: G0 in an attribute, G1 G2 visible, NO fillers. Rendition texts EQUAL (attributes are removed with the tag); G1 is at a different T position in A and B | ADV-23-N0#s1 = ASSIGNED (compensation plans); ADV-23-N1#s1 = ASSIGNED (access-rights/role matrices) \| distinctClassSet = [] | reproduced |
| ADV-24 | T-invisible encoding (every character a decimal reference): A: G0 as decimal references (extraction shows it, rendition text maps it to spaces), G1 plain; B: G0 plain, G1 as decimal references. Rendition texts equal | ADV-24-N0#s1 = ASSIGNED (compensation plans); ADV-24-N1#s1 = ASSIGNED (access-rights/role matrices); ADV-24-N2#s1 = ASSIGNED (access-rights/role matrices); ADV-24-N3#s1 = ASSIGNED (compensation plans) \| distinctClassSet = [] | reproduced |
| ADV-25 | single-rank created vs genuine (OC-4 limit, KL1 shape): A: seam creates the occurrence, G0 hidden; B: G0 visible, seam plain. Each shows exactly one occurrence; they are DIFFERENT (created vs genuine) | ADV-25-N0#s1 = DUPLICATE_IDENTITY_UNRESOLVED [TEXT_BEARING_REMOVAL_SEAM_TAINTED_POSITION]; ADV-25-N1#s1 = ASSIGNED (compensation plans) \| distinctClassSet = ['compensation plans'] | reproduced |
| ADV-26 | comment seam (markup in both views): ONE rendition: an HTML comment between the halves of the seam; extraction AND the canonical rendition text both drop it, so by R-EQV's own document-text definition the sentence is document text there. Created occurrence coded class A, genuine coded class B | ADV-26-N0#s1 = DUPLICATE_IDENTITY_UNRESOLVED [TEXT_BEARING_REMOVAL_SEAM_TAINTED_POSITION]; ADV-26-N1#s1 = ASSIGNED (access-rights/role matrices) \| distinctClassSet = ['access-rights/role matrices'] | reproduced |
| ADV-27 | hex reference (rendition text keeps it literally): A: apostrophe as &#x27; ; B: plain apostrophe. Rendition texts differ (hex kept literally) -> not one document | ADV-27-N0#s1 = DUPLICATE_IDENTITY_UNRESOLVED [DUPLICATE_GROUP_UNRESOLVED]; ADV-27-N1#s1 = DUPLICATE_IDENTITY_UNRESOLVED [DUPLICATE_GROUP_UNRESOLVED] \| distinctClassSet = [] | reproduced |
| ADV-28 | T-position attack: character variant + attribute shift: NO fillers. A: Q (ASCII apostrophe), P (U+2019 apostrophe), R hidden in an attribute; B: Q hidden in an attribute, P (ASCII), R (U+2019). Rendition texts EQUAL; P's T-image differs between A and B and each is unique in T. P coded in A and B with different classes | ADV-28-N0#s1 = ASSIGNED (compensation plans); ADV-28-N1#s1 = ASSIGNED (access-rights/role matrices) \| distinctClassSet = [] | reproduced |
| ADV-29 | unique sentence, renditions differ only by formatting: A: G0 plain; B: G0 bold with &nbsp;. One genuine occurrence, renditions not byte-identical. Coded in both with the SAME class (must converge and count once) | ADV-29-N0#s1 = ASSIGNED (access-rights/role matrices); ADV-29-N1#s1 = ASSIGNED (access-rights/role matrices) \| distinctClassSet = ['access-rights/role matrices'] | reproduced |
| ADV-30 | byte-identical renditions, repeated content, cross-rendition split probe: A and B byte-identical, NO fillers, G0 G1 G2 adjacent. G1 coded in A and in B with different classes; G0 coded in A | ADV-30-N0#s1 = ASSIGNED (compensation plans); ADV-30-N1#s1 = ASSIGNED (access-rights/role matrices); ADV-30-N2#s1 = ASSIGNED (access-rights/role matrices) \| distinctClassSet = ['access-rights/role matrices'] | reproduced |
| ADV-31 | complete views differ (URL rewriting), unique sentence: A and B differ only in an href value elsewhere on the page (as archive captures do); one genuine sentence coded in both with different classes (must converge -> conflict) | ADV-31-N0#s1 = ASSIGNED (compensation plans); ADV-31-N1#s1 = ASSIGNED (access-rights/role matrices) \| distinctClassSet = [] | reproduced |
| ADV-32 | complete views differ, repeated sentence: as ADV-31 with the sentence twice; the second occurrence coded in both | ADV-32-N0#s1 = DUPLICATE_IDENTITY_UNRESOLVED [U1_CONTENT_NOT_UNIQUE_IN_EVERY_COMPLETE_VIEW]; ADV-32-N1#s1 = DUPLICATE_IDENTITY_UNRESOLVED [U1_CONTENT_NOT_UNIQUE_IN_EVERY_COMPLETE_VIEW] \| distinctClassSet = [] | reproduced |
| ADV-33 | asymmetric hiding container: script in A, attribute in B, inside the coded sentence: the word 'amended' sits between the halves: in a script block in A, in an image alt attribute in B. Both extractions read the sentence; complete views are equal. Coded in both with different classes | ADV-33-N0#s1 = DUPLICATE_IDENTITY_UNRESOLVED [DUPLICATE_GROUP_UNRESOLVED]; ADV-33-N1#s1 = DUPLICATE_IDENTITY_UNRESOLVED [DUPLICATE_GROUP_UNRESOLVED] \| distinctClassSet = [] | reproduced |
| ADV-34 | empty script inside the sentence in one rendition: A: plain sentence; B: the same sentence with an EMPTY script element between the halves. Coded in both with different classes (must converge -> conflict) | ADV-34-N0#s1 = ASSIGNED (compensation plans); ADV-34-N1#s1 = ASSIGNED (access-rights/role matrices) \| distinctClassSet = [] | reproduced |
| ADV-35 | asymmetric hiding container: comment in A, attribute in B: as ADV-33 with an HTML comment in A | ADV-35-N0#s1 = DUPLICATE_IDENTITY_UNRESOLVED [TEXT_BEARING_REMOVAL_SEAM_TAINTED_POSITION]; ADV-35-N1#s1 = DUPLICATE_IDENTITY_UNRESOLVED [TEXT_BEARING_REMOVAL_SEAM_TAINTED_POSITION] \| distinctClassSet = [] | reproduced |
| ADV-36 | same bytes, two extraction recipes, letter entity at the segment edge: ONE rendition; the sentence ENDS with an entity-encoded letter (caf&eacute;). Coded once under HTML_TEXT_V1 (reads the decoded letter) and once under PLAIN_TEXT_V1 (reads the raw entity) with different classes (must converge -> conflict) | ADV-36-N0#s1 = ASSIGNED (compensation plans); ADV-36-N1#s1 = ASSIGNED (access-rights/role matrices) \| distinctClassSet = [] | reproduced |
| ADV-37 | complete views differ + asymmetric hiding container: comment in A, attribute in B: as ADV-35 but each rendition also carries a rendition-specific href (complete views differ, so the content-unique frame decides). Coded in both with different classes | ADV-37-N0#s1 = DUPLICATE_IDENTITY_UNRESOLVED [U1_CONTENT_NOT_UNIQUE_IN_EVERY_COMPLETE_VIEW]; ADV-37-N1#s1 = DUPLICATE_IDENTITY_UNRESOLVED [U1_CONTENT_NOT_UNIQUE_IN_EVERY_COMPLETE_VIEW] \| distinctClassSet = [] | reproduced |
| ADV-38 | complete views differ + asymmetric hiding container: script in A, attribute in B: as ADV-33 with rendition-specific hrefs (content-unique frame decides) | ADV-38-N0#s1 = DUPLICATE_IDENTITY_UNRESOLVED [DUPLICATE_GROUP_UNRESOLVED]; ADV-38-N1#s1 = DUPLICATE_IDENTITY_UNRESOLVED [DUPLICATE_GROUP_UNRESOLVED] \| distinctClassSet = [] | reproduced |

### 15.16 Architecture fixtures: the 34 R-3 cases (CORR1)

| Fixture | Case | Computed | Declared expectation |
|---|---|---|---|
| R3-A | alt attribute between the halves, one rendition: ONE rendition: PRE<img alt="amended">SUF (extraction reads PRE SUF) and a genuine G1. Created occurrence coded class A, genuine class B | R3-A-N0#s1 = DUPLICATE_IDENTITY_UNRESOLVED [TEXT_BEARING_REMOVAL_SEAM_TAINTED_POSITION]; R3-A-N1#s1 = ASSIGNED (access-rights/role matrices) \| distinctClassSet = ['access-rights/role matrices'] | reproduced |
| R3-B | title attribute between the halves, one rendition: as R3-A with PRE<span title="amended">SUF</span> | R3-B-N0#s1 = DUPLICATE_IDENTITY_UNRESOLVED [TEXT_BEARING_REMOVAL_SEAM_TAINTED_POSITION]; R3-B-N1#s1 = ASSIGNED (access-rights/role matrices) \| distinctClassSet = ['access-rights/role matrices'] | reproduced |
| R3-C1 | href value between the halves: as R3-A with PRE<a href="amended.htm">SUF</a> | R3-C1-N0#s1 = DUPLICATE_IDENTITY_UNRESOLVED [TEXT_BEARING_REMOVAL_SEAM_TAINTED_POSITION]; R3-C1-N1#s1 = ASSIGNED (access-rights/role matrices) \| distinctClassSet = ['access-rights/role matrices'] | reproduced |
| R3-C2 | data-* value between the halves: as R3-A with PRE<span data-note="amended">SUF</span> | R3-C2-N0#s1 = DUPLICATE_IDENTITY_UNRESOLVED [TEXT_BEARING_REMOVAL_SEAM_TAINTED_POSITION]; R3-C2-N1#s1 = ASSIGNED (access-rights/role matrices) \| distinctClassSet = ['access-rights/role matrices'] | reproduced |
| R3-C3 | archive-style URL in an inline link inside the sentence: as R3-A with PRE<a href="/web/2005/http://www.sec.gov/x.htm">SUF</a> (not whitelisted as metadata) | R3-C3-N0#s1 = DUPLICATE_IDENTITY_UNRESOLVED [TEXT_BEARING_REMOVAL_SEAM_TAINTED_POSITION]; R3-C3-N1#s1 = ASSIGNED (access-rights/role matrices) \| distinctClassSet = ['access-rights/role matrices'] | reproduced |
| R3-C4 | aria-label value: as R3-A with PRE<span aria-label="amended">SUF</span> | R3-C4-N0#s1 = DUPLICATE_IDENTITY_UNRESOLVED [TEXT_BEARING_REMOVAL_SEAM_TAINTED_POSITION]; R3-C4-N1#s1 = ASSIGNED (access-rights/role matrices) \| distinctClassSet = ['access-rights/role matrices'] | reproduced |
| R3-C5 | unknown attribute: as R3-A with PRE<span foo="amended">SUF</span> | R3-C5-N0#s1 = DUPLICATE_IDENTITY_UNRESOLVED [TEXT_BEARING_REMOVAL_SEAM_TAINTED_POSITION]; R3-C5-N1#s1 = ASSIGNED (access-rights/role matrices) \| distinctClassSet = ['access-rights/role matrices'] | reproduced |
| R3-D1 | malformed tag interior: as R3-A with PRE<amended!>SUF (fails the strict tag grammar; interior kept as text) | R3-D1-N0#s1 = DUPLICATE_IDENTITY_UNRESOLVED [TEXT_BEARING_REMOVAL_SEAM_TAINTED_POSITION]; R3-D1-N1#s1 = ASSIGNED (access-rights/role matrices) \| distinctClassSet = ['access-rights/role matrices'] | reproduced |
| R3-D2 | non-standard element name: as R3-A with PRE<amended>SUF</amended> | R3-D2-N0#s1 = DUPLICATE_IDENTITY_UNRESOLVED [TEXT_BEARING_REMOVAL_SEAM_TAINTED_POSITION]; R3-D2-N1#s1 = ASSIGNED (access-rights/role matrices) \| distinctClassSet = ['access-rights/role matrices'] | reproduced |
| R3-D3 | non-standard boolean attribute name: as R3-A with PRE<span amended>SUF</span> | R3-D3-N0#s1 = DUPLICATE_IDENTITY_UNRESOLVED [TEXT_BEARING_REMOVAL_SEAM_TAINTED_POSITION]; R3-D3-N1#s1 = ASSIGNED (access-rights/role matrices) \| distinctClassSet = ['access-rights/role matrices'] | reproduced |
| R3-E1 | formatting-only tag inside the sentence, one rendition: ONE rendition: PRE<b>SUF</b> (no text-bearing value) and G1 plain. Coded with different classes: both are genuine and must count | R3-E1-N0#s1 = ASSIGNED (compensation plans); R3-E1-N1#s1 = ASSIGNED (access-rights/role matrices) \| distinctClassSet = ['access-rights/role matrices', 'compensation plans'] | reproduced |
| R3-E2 | formatting-only tag in one rendition, plain in the other: A: PRE<b>SUF</b>; B: PRE SUF plain (complete views equal). The one sentence coded in A and B with different classes (must converge -> conflict) | R3-E2-N0#s1 = ASSIGNED (compensation plans); R3-E2-N1#s1 = ASSIGNED (access-rights/role matrices) \| distinctClassSet = [] | reproduced |
| R3-E3 | attribute-free span inside, two renditions, same class: A: PRE<span>SUF</span>; B: PRE SUF. Same class in both (must converge and count once) | R3-E3-N0#s1 = ASSIGNED (access-rights/role matrices); R3-E3-N1#s1 = ASSIGNED (access-rights/role matrices) \| distinctClassSet = ['access-rights/role matrices'] | reproduced |
| R3-F1 | empty alt inside the sentence: ONE rendition: PRE<img alt="">SUF and G1 plain; different classes; both genuine | R3-F1-N0#s1 = ASSIGNED (compensation plans); R3-F1-N1#s1 = ASSIGNED (access-rights/role matrices) \| distinctClassSet = ['access-rights/role matrices', 'compensation plans'] | reproduced |
| R3-F2 | punctuation-only values: A: PRE<img alt="--">SUF; B: PRE<span title="&amp; ... !">SUF</span> (complete views equal). One sentence coded in both, different classes | R3-F2-N0#s1 = ASSIGNED (compensation plans); R3-F2-N1#s1 = ASSIGNED (access-rights/role matrices) \| distinctClassSet = [] | reproduced |
| R3-F3 | digit-only attribute value IS text-bearing (Owner rule: letter OR digit): ONE rendition: PRE<img alt="2005">SUF and G1 plain; different classes | R3-F3-N0#s1 = DUPLICATE_IDENTITY_UNRESOLVED [TEXT_BEARING_REMOVAL_SEAM_TAINTED_POSITION]; R3-F3-N1#s1 = ASSIGNED (access-rights/role matrices) \| distinctClassSet = ['access-rights/role matrices'] | reproduced |
| R3-G1 | text-bearing attribute before and after the bounded occurrence: ONE rendition: <img alt="amended"> immediately before G0 and immediately after G1; G0 and G1 coded with different classes | R3-G1-N0#s1 = ASSIGNED (compensation plans); R3-G1-N1#s1 = ASSIGNED (access-rights/role matrices) \| distinctClassSet = ['access-rights/role matrices', 'compensation plans'] | reproduced |
| R3-G2 | text-bearing link wrapping the sentence (href at the edge) and an attribute after the last letter: A: <a href="/web/2005/...">GS</a> and GS<img alt="amended"> ; B byte-identical; each sentence coded in A and B with different classes | R3-G2-N0#s1 = ASSIGNED (compensation plans); R3-G2-N1#s1 = ASSIGNED (access-rights/role matrices); R3-G2-N2#s1 = ASSIGNED (access-rights/role matrices); R3-G2-N3#s1 = ASSIGNED (compensation plans) \| distinctClassSet = [] | reproduced |
| R3-H2 | attribute seam in both renditions (alt in A, title in B), plus a genuine sentence: A: X = alt seam, G1 plain; B: X = title seam, G1 plain. Complete views equal (FRAME-C). Codings: X in A (class A), X in B (class A), G1 in A and B (class B) | R3-H2-N0#s1 = DUPLICATE_IDENTITY_UNRESOLVED [TEXT_BEARING_REMOVAL_SEAM_TAINTED_POSITION]; R3-H2-N1#s1 = DUPLICATE_IDENTITY_UNRESOLVED [TEXT_BEARING_REMOVAL_SEAM_TAINTED_POSITION]; R3-H2-N2#s1 = ASSIGNED (access-rights/role matrices); R3-H2-N3#s1 = ASSIGNED (access-rights/role matrices) \| distinctClassSet = ['access-rights/role matrices'] | reproduced |
| R3-H3 | comment seam in A, attribute seam in B (the parent's ADV-35 with the roles of the containers swapped per record): A: X = comment seam, G1; B: X = data-* seam, G1. Codings: X in A class A, X in B class B, G1 in A class B | R3-H3-N0#s1 = DUPLICATE_IDENTITY_UNRESOLVED [TEXT_BEARING_REMOVAL_SEAM_TAINTED_POSITION]; R3-H3-N1#s1 = DUPLICATE_IDENTITY_UNRESOLVED [TEXT_BEARING_REMOVAL_SEAM_TAINTED_POSITION]; R3-H3-N2#s1 = ASSIGNED (access-rights/role matrices) \| distinctClassSet = ['access-rights/role matrices'] | reproduced |
| R3-J1 | SC-3 / SC-7 on one fabricated correspondence, two renditions, FRAME-C: A: X = alt seam; B: X = title seam (complete views equal); G1 genuine in both. X coded SC-3 in A and SC-7 in B; G1 coded SC-7 in A | R3-J1-N0#s1 = DUPLICATE_IDENTITY_UNRESOLVED [TEXT_BEARING_REMOVAL_SEAM_TAINTED_POSITION]; R3-J1-N1#s1 = DUPLICATE_IDENTITY_UNRESOLVED [TEXT_BEARING_REMOVAL_SEAM_TAINTED_POSITION]; R3-J1-N2#s1 = ASSIGNED (access-rights/role matrices) \| distinctClassSet = ['access-rights/role matrices'] | reproduced |
| R3-J1b | SC-3 / SC-7 on one fabricated correspondence, two renditions, FRAME-U (the href value makes the complete views differ): A: X = alt seam; B: X = href seam (amended.htm); G1 genuine in both. X coded SC-3 in A and SC-7 in B; G1 coded SC-7 in A | R3-J1b-N0#s1 = DUPLICATE_IDENTITY_UNRESOLVED [U3_APPARENT_OCCURRENCE_CREATED_BY_TEXT_BEARING_REMOVAL]; R3-J1b-N1#s1 = DUPLICATE_IDENTITY_UNRESOLVED [U3_APPARENT_OCCURRENCE_CREATED_BY_TEXT_BEARING_REMOVAL]; R3-J1b-N2#s1 = DUPLICATE_IDENTITY_UNRESOLVED [U3_APPARENT_OCCURRENCE_CREATED_BY_TEXT_BEARING_REMOVAL] \| distinctClassSet = [] | reproduced |
| R3-H1 | one rendition creates the occurrence through an alt seam, the other carries it genuinely (complete views differ -> FRAME-U): A: PRE<img alt="amended">SUF; B: PRE SUF. Both coded, different classes | R3-H1-N0#s1 = DUPLICATE_IDENTITY_UNRESOLVED [U1_CONTENT_NOT_UNIQUE_IN_EVERY_COMPLETE_VIEW]; R3-H1-N1#s1 = DUPLICATE_IDENTITY_UNRESOLVED [U1_CONTENT_NOT_UNIQUE_IN_EVERY_COMPLETE_VIEW] \| distinctClassSet = [] | reproduced |
| R3-H4 | three renditions: title seam in A, genuine in B and C (FRAME-U): A: PRE<span title="amended">SUF</span>; B, C: PRE SUF with different bold markup. Coded in all three: A class A, B class B, C class A | R3-H4-N0#s1 = DUPLICATE_IDENTITY_UNRESOLVED [U1_CONTENT_NOT_UNIQUE_IN_EVERY_COMPLETE_VIEW]; R3-H4-N1#s1 = DUPLICATE_IDENTITY_UNRESOLVED [U1_CONTENT_NOT_UNIQUE_IN_EVERY_COMPLETE_VIEW]; R3-H4-N2#s1 = DUPLICATE_IDENTITY_UNRESOLVED [U1_CONTENT_NOT_UNIQUE_IN_EVERY_COMPLETE_VIEW] \| distinctClassSet = [] | reproduced |
| R3-I1 | complete views differ (href); A creates the occurrence across an alt seam, B carries it genuinely: A: href 2005, PRE<img alt=amended>SUF; B: href 2006, PRE SUF. Both coded, different classes | R3-I1-N0#s1 = DUPLICATE_IDENTITY_UNRESOLVED [U1_CONTENT_NOT_UNIQUE_IN_EVERY_COMPLETE_VIEW]; R3-I1-N1#s1 = DUPLICATE_IDENTITY_UNRESOLVED [U1_CONTENT_NOT_UNIQUE_IN_EVERY_COMPLETE_VIEW] \| distinctClassSet = [] | reproduced |
| R3-I2 | exactly-one guard passes via a hidden genuine copy (alt attribute, invisible to R-EQV so the group still resolves); A's only extracted occurrence is created across a title seam; ONLY B is coded: A: href 2005, PRE<span title=amended>SUF</span>, and the sentence hidden in an alt attribute; B: href 2006, PRE SUF. Only B's occurrence is coded | s1 = DUPLICATE_IDENTITY_UNRESOLVED [U3_APPARENT_OCCURRENCE_CREATED_BY_TEXT_BEARING_REMOVAL] \| distinctClassSet = [] | reproduced |
| R3-I3 | attribute seam at the same place in both renditions (alt / href), plus a second genuine sentence: A: href 2005, PRE<img alt=amended>SUF, S2; B: href 2006, PRE<a href=amended.htm>SUF</a>, S2. Seam coded class A in A only; S2 coded class B in A and B | R3-I3-N0#s1 = DUPLICATE_IDENTITY_UNRESOLVED [U1_CONTENT_NOT_UNIQUE_IN_EVERY_COMPLETE_VIEW]; R3-I3-N1#s1 = ASSIGNED (access-rights/role matrices); R3-I3-N2#s1 = ASSIGNED (access-rights/role matrices) \| distinctClassSet = ['access-rights/role matrices'] | reproduced |
| R3-I4 | three members: data-* seam in A, genuine in B and C; plus S2: A: href 2005, PRE<span data-note=amended>SUF</span>, S2; B: href 2006, PRE SUF, S2; C: href 2007, PRE SUF, S2. Seam coded class A in A; genuine coded class A in B and class B in C; S2 class B in C | R3-I4-N0#s1 = DUPLICATE_IDENTITY_UNRESOLVED [U1_CONTENT_NOT_UNIQUE_IN_EVERY_COMPLETE_VIEW]; R3-I4-N1#s1 = DUPLICATE_IDENTITY_UNRESOLVED [U1_CONTENT_NOT_UNIQUE_IN_EVERY_COMPLETE_VIEW]; R3-I4-N2#s1 = DUPLICATE_IDENTITY_UNRESOLVED [U1_CONTENT_NOT_UNIQUE_IN_EVERY_COMPLETE_VIEW]; R3-I4-N3#s1 = ASSIGNED (access-rights/role matrices) \| distinctClassSet = ['access-rights/role matrices'] | reproduced |
| R3-J2 | SC-3 / SC-7 across a fabricated (A, alt) and a genuine (B) occurrence at the same place, FRAME-U, plus S2: A: href 2005, alt seam, S2; B: href 2006, PRE SUF, S2. Seam coded SC-3 in A, genuine coded SC-7 in B, S2 coded SC-7 in both | R3-J2-N0#s1 = DUPLICATE_IDENTITY_UNRESOLVED [U1_CONTENT_NOT_UNIQUE_IN_EVERY_COMPLETE_VIEW]; R3-J2-N1#s1 = DUPLICATE_IDENTITY_UNRESOLVED [U1_CONTENT_NOT_UNIQUE_IN_EVERY_COMPLETE_VIEW]; R3-J2-N2#s1 = ASSIGNED (access-rights/role matrices); R3-J2-N3#s1 = ASSIGNED (access-rights/role matrices) \| distinctClassSet = ['access-rights/role matrices'] | reproduced |
| R3-J3 | single rendition: SC-3 on the created occurrence, SC-7 on a genuine second sentence (the pure false-srcDiv shape): ONE rendition: PRE<a href=amended.htm>SUF</a> and S2. Seam coded SC-3, S2 coded SC-7 | R3-J3-N0#s1 = DUPLICATE_IDENTITY_UNRESOLVED [TEXT_BEARING_REMOVAL_SEAM_TAINTED_POSITION]; R3-J3-N1#s1 = ASSIGNED (access-rights/role matrices) \| distinctClassSet = ['access-rights/role matrices'] | reproduced |
| R3-K1 | one attribute seam coded under all three HTML recipes (text, plain, markup-preserving), plus S2: ONE rendition: PRE<img alt=amended>SUF and S2. The seam place coded under HTML_TEXT_V1 (SC-3), PLAIN_TEXT_V1 (SC-7) and HTML_RAW_V1 (SC-3); S2 coded SC-7 | R3-K1-N0#s1 = DUPLICATE_IDENTITY_UNRESOLVED [TEXT_BEARING_REMOVAL_SEAM_TAINTED_POSITION]; R3-K1-N1#s1 = DUPLICATE_IDENTITY_UNRESOLVED [TEXT_BEARING_REMOVAL_SEAM_TAINTED_POSITION]; R3-K1-N2#s1 = DUPLICATE_IDENTITY_UNRESOLVED [TEXT_BEARING_REMOVAL_SEAM_TAINTED_POSITION]; R3-K1-N3#s1 = ASSIGNED (access-rights/role matrices) \| distinctClassSet = ['access-rights/role matrices'] | reproduced |
| R3-K2 | formatting-only tag inside one genuine sentence coded under all three HTML recipes: ONE rendition: PRE<b>SUF</b>. Coded under HTML_TEXT_V1 (SC-3), PLAIN_TEXT_V1 (SC-7), HTML_RAW_V1 (SC-3) | R3-K2-N0#s1 = ASSIGNED (compensation plans); R3-K2-N1#s1 = ASSIGNED (access-rights/role matrices); R3-K2-N2#s1 = ASSIGNED (compensation plans) \| distinctClassSet = [] | reproduced |
| R3-L1 | FRAME-U: A's unique complete-view occurrence carries its middle word in a script (a seam in A); B shows the sentence plainly; ONLY B is coded: A: href 2005, PRE <script>amended</script> SUF; B: href 2006, PRE amended SUF (rendition texts equal, so the group resolves). Only B coded | s1 = DUPLICATE_IDENTITY_UNRESOLVED [U2_CANDIDATE_OCCURRENCE_IS_A_TEXT_BEARING_REMOVAL_SEAM] \| distinctClassSet = [] | reproduced |
| R3-L2 | as R3-L1, and A's place is ALSO coded under PLAIN_TEXT_V1 (which reads the script word) with a conflicting class: A: PLAIN_TEXT_V1 record over 'PRE <script>amended</script> SUF' (SC-3); B: HTML_TEXT_V1 record over 'PRE amended SUF' (SC-7); the same documentary place | R3-L2-N0#s1 = DUPLICATE_IDENTITY_UNRESOLVED [U2_CANDIDATE_OCCURRENCE_IS_A_TEXT_BEARING_REMOVAL_SEAM]; R3-L2-N1#s1 = DUPLICATE_IDENTITY_UNRESOLVED [U2_CANDIDATE_OCCURRENCE_IS_A_TEXT_BEARING_REMOVAL_SEAM] \| distinctClassSet = [] | reproduced |

### 15.17 OA-7(b) representability symmetry (CORR1.CORR1)

| Fixture | Case | Computed | Declared expectation |
|---|---|---|---|
| OA7B-D1 | one member: two markup-preserving records on ONE occurrence ('x' in a title attribute + the sentence); record A starts INSIDE the tag (OA-7(b) fails), record B starts at the tag (passes); A = SC-3, B = SC-7; a second genuine sentence (slot 1) = SC-3 | OA7B-D1-R0#s1 = DUPLICATE_IDENTITY_UNRESOLVED [COMPLETE_VIEW_BOUNDARY_NOT_REPRESENTABLE]; OA7B-D1-R1#s1 = DUPLICATE_IDENTITY_UNRESOLVED [COMPLETE_VIEW_BOUNDARY_NOT_REPRESENTABLE]; OA7B-D1-R2#s1 = ASSIGNED (compensation plans) \| distinctClassSet = ['compensation plans'] | reproduced |
| OA7B-D2 | two members of one document: member 0 writes 'x' in a title attribute, member 1 as &#120;; record A (member 0) starts inside the tag (fails), record B (member 1, text extraction 'x'+sentence) passes; A = SC-3, B = SC-7; slot 1 genuine SC-3 | OA7B-D2-R0#s1 = DUPLICATE_IDENTITY_UNRESOLVED [COMPLETE_VIEW_BOUNDARY_NOT_REPRESENTABLE]; OA7B-D2-R1#s1 = DUPLICATE_IDENTITY_UNRESOLVED [COMPLETE_VIEW_BOUNDARY_NOT_REPRESENTABLE]; OA7B-D2-R2#s1 = ASSIGNED (compensation plans) \| distinctClassSet = ['compensation plans'] | reproduced |
| OA7B-D3 | three records on one occurrence across two members: two fail (inside the tag; inside the character reference), one passes; classes SC-3, SC-3, SC-7 | OA7B-D3-R0#s1 = DUPLICATE_IDENTITY_UNRESOLVED [COMPLETE_VIEW_BOUNDARY_NOT_REPRESENTABLE]; OA7B-D3-R1#s1 = DUPLICATE_IDENTITY_UNRESOLVED [COMPLETE_VIEW_BOUNDARY_NOT_REPRESENTABLE]; OA7B-D3-R2#s1 = DUPLICATE_IDENTITY_UNRESOLVED [COMPLETE_VIEW_BOUNDARY_NOT_REPRESENTABLE]; OA7B-D3-R3#s1 = ASSIGNED (compensation plans) \| distinctClassSet = ['compensation plans'] | reproduced |
| OA7B-A1 | both representable, one member: text record and markup-preserving record on one plain sentence, same class | OA7B-A1-R0#s1 = ASSIGNED (access-rights/role matrices); OA7B-A1-R1#s1 = ASSIGNED (access-rights/role matrices) \| distinctClassSet = ['access-rights/role matrices'] | reproduced |
| OA7B-A2 | both representable, two members: markup-preserving record from the tag start (member 0) and text record 'x'+sentence (member 1), same class | OA7B-A2-R0#s1 = ASSIGNED (access-rights/role matrices); OA7B-A2-R1#s1 = ASSIGNED (access-rights/role matrices) \| distinctClassSet = ['access-rights/role matrices'] | reproduced |
| OA7B-A3 | both representable, conflicting classes: the normal SEGMENT_CLASS_CONFLICT path is preserved | OA7B-A3-R0#s1 = ASSIGNED (compensation plans); OA7B-A3-R1#s1 = ASSIGNED (access-rights/role matrices) \| distinctClassSet = [] | reproduced |
| OA7B-B1 | different occurrences, SAME text: slot 0 ('x' + sentence) carries only a failing record (SC-3); slot 1 (the same sentence, plain) carries a passing record (SC-7) | OA7B-B1-R0#s1 = DUPLICATE_IDENTITY_UNRESOLVED [COMPLETE_VIEW_BOUNDARY_NOT_REPRESENTABLE]; OA7B-B1-R1#s1 = ASSIGNED (access-rights/role matrices) \| distinctClassSet = ['access-rights/role matrices'] | reproduced |
| OA7B-B2 | different occurrences, different texts, two members: slot 0 has a failing and a passing record; slot 1 a passing record | OA7B-B2-R0#s1 = DUPLICATE_IDENTITY_UNRESOLVED [COMPLETE_VIEW_BOUNDARY_NOT_REPRESENTABLE]; OA7B-B2-R1#s1 = DUPLICATE_IDENTITY_UNRESOLVED [COMPLETE_VIEW_BOUNDARY_NOT_REPRESENTABLE]; OA7B-B2-R2#s1 = ASSIGNED (access-rights/role matrices) \| distinctClassSet = ['access-rights/role matrices'] | reproduced |
| OA7B-C1 | representability + seam, one member: slot 0 has an alt seam between the halves; record A starts inside the tag (fails (b)), record B starts at the tag (passes (b)); both occurrence gates fail | OA7B-C1-R0#s1 = DUPLICATE_IDENTITY_UNRESOLVED [COMPLETE_VIEW_BOUNDARY_NOT_REPRESENTABLE]; OA7B-C1-R1#s1 = DUPLICATE_IDENTITY_UNRESOLVED [COMPLETE_VIEW_BOUNDARY_NOT_REPRESENTABLE]; OA7B-C1-R2#s1 = ASSIGNED (compensation plans) \| distinctClassSet = ['compensation plans'] | reproduced |
| OA7B-C2 | representability + seam, two members: the seam is in member 0 (alt), member 1 shows the word as character references (no seam in member 1); record A (member 0) fails (b); record B (member 1, text) passes (b) and has no seam in its own member | OA7B-C2-R0#s1 = DUPLICATE_IDENTITY_UNRESOLVED [COMPLETE_VIEW_BOUNDARY_NOT_REPRESENTABLE]; OA7B-C2-R1#s1 = DUPLICATE_IDENTITY_UNRESOLVED [COMPLETE_VIEW_BOUNDARY_NOT_REPRESENTABLE]; OA7B-C2-R2#s1 = ASSIGNED (compensation plans) \| distinctClassSet = ['compensation plans'] | reproduced |

### 15.18 OA-14 unplaced conflict witness (CORR1.CORR1.CORR1)

| Fixture | Case | Computed | Declared expectation |
|---|---|---|---|
| R14-D1 | one PDF member: slot 0 is P. A = the text-layer reading of P (PLAIN_TEXT_V1, decoder != rendition decoder -> DECODER_FRAME_MISMATCH), SC-3; B = the content-stream reading of P (PDF_LZW_TEXT_V1, normal A+ anchor), SC-7; slot 1 = a second genuine sentence, SC-3 | R14-D1-R0#s1 = DUPLICATE_IDENTITY_UNRESOLVED [DECODER_FRAME_MISMATCH]; R14-D1-R1#s1 = DUPLICATE_IDENTITY_UNRESOLVED [POSSIBLE_CLASS_CONFLICT_FROM_UNPLACED_WITNESS]; R14-D1-R2#s1 = ASSIGNED (compensation plans) \| distinctClassSet = ['compensation plans'] | reproduced |
| R14-D1-X | two members (HTML + PDF) of one filing, FRAME-C: A = text-layer reading of P in the PDF member (DECODER_FRAME_MISMATCH), SC-3; B = HTML_TEXT_V1 reading of P in the HTML member, SC-7; slot 1 genuine SC-3 | R14-D1-X-R0#s1 = DUPLICATE_IDENTITY_UNRESOLVED [DECODER_FRAME_MISMATCH]; R14-D1-X-R1#s1 = DUPLICATE_IDENTITY_UNRESOLVED [POSSIBLE_CLASS_CONFLICT_FROM_UNPLACED_WITNESS]; R14-D1-X-R2#s1 = ASSIGNED (compensation plans) \| distinctClassSet = ['compensation plans'] | reproduced |
| R14-D1-CVI | one HTML member, FRAME-C: A = HTML_RAW_V1 reading of P's own table markup (standard names only -> EMPTY_COMPLETE_VIEW_IMAGE), SC-3; B = HTML_TEXT_V1 reading of P's sentence, SC-7; slot 1 genuine SC-3 | R14-D1-CVI-R0#s1 = DUPLICATE_IDENTITY_UNRESOLVED [EMPTY_COMPLETE_VIEW_IMAGE]; R14-D1-CVI-R1#s1 = DUPLICATE_IDENTITY_UNRESOLVED [POSSIBLE_CLASS_CONFLICT_FROM_UNPLACED_WITNESS]; R14-D1-CVI-R2#s1 = ASSIGNED (compensation plans) \| distinctClassSet = ['compensation plans'] | reproduced |
| R14-D1-SKEL | two HTML members, FRAME-U (title attributes differ): A = P's table markup in member 0 (no skeleton -> EMPTY_SKELETON), SC-3; B = HTML_TEXT_V1 reading of P's sentence in member 1 (FRAME-U key, guard holds), SC-7; slot 1 genuine SC-3 (RAW, member 0) | R14-D1-SKEL-R0#s1 = DUPLICATE_IDENTITY_UNRESOLVED [EMPTY_SKELETON]; R14-D1-SKEL-R1#s1 = DUPLICATE_IDENTITY_UNRESOLVED [POSSIBLE_CLASS_CONFLICT_FROM_UNPLACED_WITNESS]; R14-D1-SKEL-R2#s1 = ASSIGNED (compensation plans) \| distinctClassSet = ['compensation plans'] | reproduced |
| R14-D1-DECU | HTML + PDF members, FRAME-U: A = text-layer reading of P (DECODER_FRAME_MISMATCH; its skeleton EQUALS B's key), SC-3; B = HTML_TEXT_V1 reading of P, SC-7; slot 1 genuine SC-3 | R14-D1-DECU-R0#s1 = DUPLICATE_IDENTITY_UNRESOLVED [DECODER_FRAME_MISMATCH]; R14-D1-DECU-R1#s1 = DUPLICATE_IDENTITY_UNRESOLVED [POSSIBLE_CLASS_CONFLICT_FROM_UNPLACED_WITNESS]; R14-D1-DECU-R2#s1 = ASSIGNED (compensation plans) \| distinctClassSet = ['compensation plans'] | reproduced |
| R14-D1-2REC | two PDF members: A = text-layer reading of P in member 1, SC-3; P also carries two normal SC-7 records (content stream of member 0 and of member 1); slot 1 genuine SC-3 | R14-D1-2REC-R0#s1 = DUPLICATE_IDENTITY_UNRESOLVED [DECODER_FRAME_MISMATCH]; R14-D1-2REC-R1#s1 = DUPLICATE_IDENTITY_UNRESOLVED [POSSIBLE_CLASS_CONFLICT_FROM_UNPLACED_WITNESS]; R14-D1-2REC-R2#s1 = DUPLICATE_IDENTITY_UNRESOLVED [POSSIBLE_CLASS_CONFLICT_FROM_UNPLACED_WITNESS]; R14-D1-2REC-R3#s1 = ASSIGNED (compensation plans) \| distinctClassSet = ['compensation plans'] | reproduced |
| R14-C1 | same class: unplaced SC-3 on P, placed SC-3 on P | R14-C1-R0#s1 = DUPLICATE_IDENTITY_UNRESOLVED [DECODER_FRAME_MISMATCH]; R14-C1-R1#s1 = ASSIGNED (compensation plans) \| distinctClassSet = ['compensation plans'] | reproduced |
| R14-C1-U | same class in FRAME-U: unplaced SC-3 (EMPTY_SKELETON, member 0), placed SC-3 on P (member 1) | R14-C1-U-R0#s1 = DUPLICATE_IDENTITY_UNRESOLVED [EMPTY_SKELETON]; R14-C1-U-R1#s1 = ASSIGNED (compensation plans) \| distinctClassSet = ['compensation plans'] | reproduced |
| R14-C2 | unrelated different occurrence, no narrowing evidence: unplaced SC-3 physically on O1 (placed SC-3); placed SC-7 is O2 | R14-C2-R0#s1 = DUPLICATE_IDENTITY_UNRESOLVED [DECODER_FRAME_MISMATCH]; R14-C2-R1#s1 = ASSIGNED (compensation plans); R14-C2-R2#s1 = DUPLICATE_IDENTITY_UNRESOLVED [POSSIBLE_CLASS_CONFLICT_FROM_UNPLACED_WITNESS] \| distinctClassSet = ['compensation plans'] | reproduced |
| R14-C2-V | as C2 but the witness's own occurrence carries no placed record (physical occurrence not established): O2 SC-7 still withheld | R14-C2-V-R0#s1 = DUPLICATE_IDENTITY_UNRESOLVED [DECODER_FRAME_MISMATCH]; R14-C2-V-R1#s1 = DUPLICATE_IDENTITY_UNRESOLVED [POSSIBLE_CLASS_CONFLICT_FROM_UNPLACED_WITNESS] \| distinctClassSet = [] | reproduced |
| R14-C4 | two witnesses, opposite classes: r1 SC-3 on O1, r2 SC-7 on O2; O1 placed SC-3, O2 placed SC-7; every one of the 24 record orders | R14-C4-R0#s1 = DUPLICATE_IDENTITY_UNRESOLVED [DECODER_FRAME_MISMATCH]; R14-C4-R1#s1 = DUPLICATE_IDENTITY_UNRESOLVED [DECODER_FRAME_MISMATCH]; R14-C4-R2#s1 = DUPLICATE_IDENTITY_UNRESOLVED [POSSIBLE_CLASS_CONFLICT_FROM_UNPLACED_WITNESS]; R14-C4-R3#s1 = DUPLICATE_IDENTITY_UNRESOLVED [POSSIBLE_CLASS_CONFLICT_FROM_UNPLACED_WITNESS] \| distinctClassSet = [] | reproduced |
| R14-C4-MIX | two witnesses of opposite classes through DIFFERENT exits in one document (SC-3 DECODER_FRAME_MISMATCH in the PDF member, SC-7 EMPTY_COMPLETE_VIEW_IMAGE in the HTML member); three occurrences SC-3 / SC-7 / SC-3; every one of the 120 record orders | R14-C4-MIX-R0#s1 = DUPLICATE_IDENTITY_UNRESOLVED [DECODER_FRAME_MISMATCH]; R14-C4-MIX-R1#s1 = DUPLICATE_IDENTITY_UNRESOLVED [EMPTY_COMPLETE_VIEW_IMAGE]; R14-C4-MIX-R2#s1 = DUPLICATE_IDENTITY_UNRESOLVED [POSSIBLE_CLASS_CONFLICT_FROM_UNPLACED_WITNESS]; R14-C4-MIX-R3#s1 = DUPLICATE_IDENTITY_UNRESOLVED [POSSIBLE_CLASS_CONFLICT_FROM_UNPLACED_WITNESS]; R14-C4-MIX-R4#s1 = DUPLICATE_IDENTITY_UNRESOLVED [POSSIBLE_CLASS_CONFLICT_FROM_UNPLACED_WITNESS] \| distinctClassSet = [] | reproduced |
| R14-C5 | OUTSIDE witness: the unplaced record satisfies no class predicate; placed SC-7 on P | R14-C5-R0#s1 = DUPLICATE_IDENTITY_UNRESOLVED [DECODER_FRAME_MISMATCH]; R14-C5-R1#s1 = ASSIGNED (access-rights/role matrices) \| distinctClassSet = ['access-rights/role matrices'] | reproduced |
| R14-C5-M | MULTIPLE witness (report only): the unplaced record satisfies SC-3 AND SC-7 (MULTIPLE_CLASS_PREDICATES_SATISFIED); placed SC-7 on P | R14-C5-M-R0#s1 = DUPLICATE_IDENTITY_UNRESOLVED [DECODER_FRAME_MISMATCH]; R14-C5-M-R1#s1 = ASSIGNED (access-rights/role matrices) \| distinctClassSet = ['access-rights/role matrices'] | reproduced |
| R14-C6 | no established occurrence: U holds only the witness | s1 = DUPLICATE_IDENTITY_UNRESOLVED [DECODER_FRAME_MISMATCH] \| distinctClassSet = [] | reproduced |
| R14-C6-U1 | no established occurrence in FRAME-U: the only placed record is on a repeated sentence (U1 withholds the key) | R14-C6-U1-R0#s1 = DUPLICATE_IDENTITY_UNRESOLVED [EMPTY_SKELETON]; R14-C6-U1-R1#s1 = DUPLICATE_IDENTITY_UNRESOLVED [U1_CONTENT_NOT_UNIQUE_IN_EVERY_COMPLETE_VIEW] \| distinctClassSet = [] | reproduced |
| R14-S12 | act section 12: r = SC-3 (physically on O1); O1 SC-3, O2 SC-7, O3 SC-7 | R14-S12-R0#s1 = DUPLICATE_IDENTITY_UNRESOLVED [DECODER_FRAME_MISMATCH]; R14-S12-R1#s1 = ASSIGNED (compensation plans); R14-S12-R2#s1 = DUPLICATE_IDENTITY_UNRESOLVED [POSSIBLE_CLASS_CONFLICT_FROM_UNPLACED_WITNESS]; R14-S12-R3#s1 = DUPLICATE_IDENTITY_UNRESOLVED [POSSIBLE_CLASS_CONFLICT_FROM_UNPLACED_WITNESS] \| distinctClassSet = ['compensation plans'] | reproduced |
| R14-S13 | act section 13: r = SC-3 (physically on O2); O1 SC-3, O2 SC-7; no exclusion evidence | R14-S13-R0#s1 = DUPLICATE_IDENTITY_UNRESOLVED [DECODER_FRAME_MISMATCH]; R14-S13-R1#s1 = ASSIGNED (compensation plans); R14-S13-R2#s1 = DUPLICATE_IDENTITY_UNRESOLVED [POSSIBLE_CLASS_CONFLICT_FROM_UNPLACED_WITNESS] \| distinctClassSet = ['compensation plans'] | reproduced |
| R14-X1 | C(r) never leaves U: witness SC-3 in document 0 (with O1 SC-3); document 1 holds a conflicting SC-7 occurrence and no witness | R14-X1-R0#s1 = DUPLICATE_IDENTITY_UNRESOLVED [DECODER_FRAME_MISMATCH]; R14-X1-R1#s1 = ASSIGNED (compensation plans); R14-X1-R2#s1 = ASSIGNED (access-rights/role matrices) \| distinctClassSet = ['access-rights/role matrices', 'compensation plans'] | reproduced |
| R14-X2 | an occurrence that already conflicts (placed SC-3 + placed SC-7 on P) keeps its SEGMENT_CLASS_CONFLICT disposition; the witness adds no quarantine | R14-X2-R0#s1 = DUPLICATE_IDENTITY_UNRESOLVED [DECODER_FRAME_MISMATCH]; R14-X2-R1#s1 = ASSIGNED (compensation plans); R14-X2-R2#s1 = ASSIGNED (access-rights/role matrices) \| distinctClassSet = [] | reproduced |
| R14-X3 | FRAME-U, three occurrences: witness SC-7 physically on O2 (SC-3); O1 and O3 SC-7 are preserved | R14-X3-R0#s1 = DUPLICATE_IDENTITY_UNRESOLVED [EMPTY_SKELETON]; R14-X3-R1#s1 = ASSIGNED (access-rights/role matrices); R14-X3-R2#s1 = DUPLICATE_IDENTITY_UNRESOLVED [POSSIBLE_CLASS_CONFLICT_FROM_UNPLACED_WITNESS]; R14-X3-R3#s1 = ASSIGNED (access-rights/role matrices) \| distinctClassSet = ['access-rights/role matrices'] | reproduced |
| R14-E1 | the fourth pre-occurrence exit: a class-bearing HTML_TEXT_V1 record whose coder skeleton is empty ('&amp;copy' -> '&copy') -> EMPTY_CANONICAL_SEGMENT, SC-3; another occurrence SC-7 | R14-E1-R0#s1 = DUPLICATE_IDENTITY_UNRESOLVED [EMPTY_CANONICAL_SEGMENT]; R14-E1-R1#s1 = DUPLICATE_IDENTITY_UNRESOLVED [POSSIBLE_CLASS_CONFLICT_FROM_UNPLACED_WITNESS] \| distinctClassSet = [] | reproduced |

### 15.19 U4 alone decisive (U1, U2, U3 pass; U4 fails)

| Fixture | Case | Computed | Declared expectation |
|---|---|---|---|
| U4-A | U4 alone decisive: the PLAIN reading of a slot whose comment body contains '>' (the coder's tag regex eats '<!-- a >', so its skeleton is 'PRE b SUF', a CREATED occurrence of sentence B); B occurs genuinely once elsewhere in both members; the complete views differ (href): FRAME-U | U4-A-N0#s1 = DUPLICATE_IDENTITY_UNRESOLVED [U4_A_RECORD_CARRYING_THE_KEY_IS_A_TEXT_BEARING_REMOVAL_SEAM]; U4-A-N1#s1 = ASSIGNED (access-rights/role matrices) \| distinctClassSet = ['access-rights/role matrices'] | reproduced |
| U4-A2 | U4 alone decisive, symmetric: as U4-A, and the genuine B (slot 1) is ALSO coded, SC-3, in the other member | U4-A2-N0#s1 = DUPLICATE_IDENTITY_UNRESOLVED [U4_A_RECORD_CARRYING_THE_KEY_IS_A_TEXT_BEARING_REMOVAL_SEAM]; U4-A2-N1#s1 = DUPLICATE_IDENTITY_UNRESOLVED [U4_A_RECORD_CARRYING_THE_KEY_IS_A_TEXT_BEARING_REMOVAL_SEAM]; U4-A2-N2#s1 = ASSIGNED (access-rights/role matrices) \| distinctClassSet = ['access-rights/role matrices'] | reproduced |
| U4-B | U4 alone decisive through non-representability: a markup-preserving unit starting INSIDE <span title="x"> (member 0) against the text reading of '&#120;' + sentence (member 1); the complete views differ (href): FRAME-U | U4-B-N0#s1 = DUPLICATE_IDENTITY_UNRESOLVED [U4_A_RECORD_CARRYING_THE_KEY_IS_A_TEXT_BEARING_REMOVAL_SEAM]; U4-B-N1#s1 = DUPLICATE_IDENTITY_UNRESOLVED [U4_A_RECORD_CARRYING_THE_KEY_IS_A_TEXT_BEARING_REMOVAL_SEAM]; U4-B-N2#s1 = ASSIGNED (access-rights/role matrices) \| distinctClassSet = ['access-rights/role matrices'] | reproduced |

### 15.20 A+ mechanism probes (the TAG view on a PDF member, op provenance at a script boundary, every-member taint)

| Fixture | Case | Computed | Declared expectation |
|---|---|---|---|
| PRB-TAGVIEW | TAG view on a PDF member: the content stream's string holds PRE<img alt="amended">SUF (a created occurrence of the sentence: the coder's skeleton strips the tag, the complete view keeps 'amended') and a second genuine sentence; one member, FRAME-C | PRB-TAGVIEW-N0#s1 = DUPLICATE_IDENTITY_UNRESOLVED [TEXT_BEARING_REMOVAL_SEAM_TAINTED_POSITION]; PRB-TAGVIEW-N1#s1 = ASSIGNED (access-rights/role matrices) \| distinctClassSet = ['access-rights/role matrices'] | reproduced |
| PRB-REPARSE | op provenance at a script boundary: PRE <script>amended</script > SUF - the recipe's script op does not match the spaced end tag, so the extraction reads PRE amended SUF and the word is not removed by any op; a second genuine sentence | PRB-REPARSE-N0#s1 = ASSIGNED (compensation plans); PRB-REPARSE-N1#s1 = ASSIGNED (access-rights/role matrices) \| distinctClassSet = ['access-rights/role matrices', 'compensation plans'] | reproduced |
| PRB-OWNMEMBER | every-member taint: slot 0 carries an alt seam in member 0 (markup-preserving reading from the tag start, representable) and the same letters as character references in member 1 (text reading, no seam in member 1); slot 1 a plain sentence | PRB-OWNMEMBER-R0#s1 = DUPLICATE_IDENTITY_UNRESOLVED [TEXT_BEARING_REMOVAL_SEAM_TAINTED_POSITION]; PRB-OWNMEMBER-R1#s1 = DUPLICATE_IDENTITY_UNRESOLVED [TEXT_BEARING_REMOVAL_SEAM_TAINTED_POSITION]; PRB-OWNMEMBER-R2#s1 = ASSIGNED (compensation plans) \| distinctClassSet = ['compensation plans'] | reproduced |

## 16. SUPPLYING BASIS, SEGMENTATION BOUNDARY, MULTI-CLASS, EDGE, FORM AND EVIDENCE RULES (unchanged)

### `R-BASIS` - SUPPLYING BASIS AND ANTI-QUOTE-SHOPPING (CORR1; replaces the parent 'narrowest locator wins' rule)

supplyingBasis = ALL documentary segments materially necessary to support the exact proposition carried by that source-specific analytical support record. The classification procedure inspects the FULL supplyingBasis.

- *clauses:* B-1 BASIS COMPLETENESS. Classification evaluates the whole supplyingBasis, not a selected subset of it.; B-2 NO QUOTE-SHOPPING. A narrower segment may stand as the basis only if it is by itself independently sufficient for the proposition AND no other basis segment is materially necessary to it. A coder may not obtain a desired class by shrinking the quoted span. There is no 'narrowest locator wins' rule and no preference among overlapping locators; overlapping locators create neither a new document nor a new class.; B-3 LAWFUL SEPARATION PRESERVES BOTH CLASSES. Where the supplyingBasis resolves into two or more segments separated by an explicit documentary boundary, each segment is classified independently and BOTH classifications are preserved as separate source-specific classification records. Collapsing them into one record is forbidden.; B-4 INDIVISIBLE MULTI-FUNCTION FAILS CLOSED. Where one indivisible segment satisfies two or more class predicates and no explicit documentary boundary separates the functions, the record takes MULTIPLE_CLASS_PREDICATES_SATISFIED. The coder does not choose.; B-5 FINITE PROCEDURE AND TERMINATION. Segmentation is attempted at most ONCE per classification record. Sub-segments produced by a lawful segmentation are classified once and are NOT re-submitted to segmentation. A sub-segment that is still multi-function yields MULTIPLE_CLASS_PREDICATES_SATISFIED. There is no recursion and no coder repetition of the procedure.; B-6 ONE sourceRef carrying two separately bounded propositions generates two sourceClass assignment records. They MUST NOT be collapsed merely because the underlying document identity is the same.; B-7 ONE SEGMENTATION RULE FOR EVERY BOUNDARY. The same lawful-separator list governs every class pair. There is no boundary-specific punctuation rule and no boundary-specific exception.
- *segmentUnit:* An ATOM is the smallest documentary unit: a numbered sub-clause where the text is sub-clause structured, otherwise the record's own sentence. A SEGMENT is one or more consecutive atoms that no lawful separator divides. A comma, a conjunction, a line wrap or a column break is NOT a separator, so the atoms it joins are ONE indivisible segment.
- *segmentUnitAuthority:* boundaryModel.segmentation

### `R-SEG-B` - LAWFUL SEGMENTATION BOUNDARY

Segmentation is lawful ONLY when the record itself supplies an explicit structural boundary that isolates each satisfied predicate into a distinct bounded segment. The boundary type and its locator must be recorded. Coder-invented boundaries are forbidden.

- *boundaryTypes:* separately headed section; numbered clause or sub-clause; discrete table or table row where semantically complete; exhibit boundary; page or section label; equivalent explicit documentary boundary
- *notBoundaries:* a comma; a conjunction; a line wrap; a column break; a sentence boundary that separates no distinct proposition

### `R-MULTI` - MULTIPLE CLASS PREDICATES

All nine predicates are evaluated on every bounded segment. There is no ordering, no short-circuit and no preference. Exactly one satisfied => ASSIGNED. Zero satisfied on a fully inspected segment => OUTSIDE_FROZEN_VOCABULARY. Two or more satisfied => R-BASIS B-3/B-4 applies; segmentation is attempted ONCE and is never recursed.

- *noDiscretion:* 'choose the most appropriate class' is forbidden; 'closest fit' is forbidden; 'primary meaning' is forbidden; 'dominant function' is forbidden; majority vote between agents is forbidden; form-based fallback is forbidden; preferring a narrower quotation is forbidden

### `R-EDGE` - EDGE-LEVEL ASSIGNMENT AND SOURCE-SPECIFIC RECORDING (CORR4 §7 check)

CORR4 §I records ONE sourceClass per edge. Where the supplying basis resolves into two or more lawfully separable source-specific support records carrying different classes, the record MUST be represented as SEPARATE §I edges, one per support record, each carrying its own singular sourceClass. This is the already-authorized representation: §I is an edge-level record, and CORR4 §F.5 MULTI-EDGE RESOLUTION explicitly combines 'all edges' for the same exact M / organizational object / scope / time. No CORR4 schema change is required.

- *corr4RecordingCheck:* `{"result": "NO_SCHEMA_CHANGE_REQUIRED", "authority": ["CORR4 §I: edge-level record carrying singular sourceClass plus plural factIds[] and sourceRefs[]", "CORR4 §F.3: srcDiv counts over the supporting EDGES of the pattern leaves", "CORR4 §F.5 MULTI-EDGE RESOLUTION: 'for the same exact M / organizational object / scope / time, combine all edges deterministically'"], "representation": "one §I edge per source-class-bearing support record, sharing the same relationInstanceId and M binding", "forbiddenCollapse": "Collapsing two lawfully separable support records of different classes into one edge would suppress lawfully established class diversity and is forbidden.", "residualCase": "If ONE edge's sourceRefs span two classes and the supports are not separable into distinct propositions or bounded segments, the edge cannot carry both; it takes the highest-precedence non-ASSIGNED state and contributes nothing. This is fail-closed and can never inflate srcDiv."}`

### `R-FORM` - FORM DOES NOT DETERMINE SOURCECLASS

An instrument's form, filing type, SEC form number, filename, URL host, archive wrapper, publisher name, registry document_type value, or the provenance sidecar's documentaryIdentity values NEVER determine sourceClass and NEVER select a class. Classification is by the documentary FUNCTION of the supplying segment under SC-1..SC-9. No form-to-class table exists in this contract and none may be added by a coder.

- *forbiddenShortcuts:* FORM_10K => any class; DEF_14A => compensation plans; FORM_8K => contracts/participation terms; ARCHIVED_WEBSITE => marketing/engagement materials; ISSUER_ANNUAL_REPORT => any class; documentaryIdentity.documentaryType => any class
- *metadataUse:* Metadata may locate and identify a record. It may never classify it (R-EVID).

### `R-EVID` - EVIDENCE MODE REQUIRED FOR ASSIGNMENT

Every class requires segment CONTENT. ASSIGNED is reachable only when the supplying segment's content was inspected. classificationEvidenceMode = METADATA_ONLY can never yield ASSIGNED. The Stage-1 provenance sidecar supplies documentary identity, not a sourceClass value (sourceClassResolution = NOT_MECHANICALLY_BOUND_BY_STAGE_1), so no predicate may read a class from sidecar metadata.


## 17. `R-COUNT` - srcDiv DISTINCT-CLASS COUNTING (B-2 bound at step 5b; F-01 preserved; MV-LOC-1)

Counting is a SET operation over the distinct qualifying source classes carried by the supporting edges, after duplicate/repackaging anti-inflation. It is NOT a document-count requirement and there is no document-count threshold. The grouping key is the pair (underlyingDocumentIdentity, canonicalSegmentIdentity).

```text
1. Take the supporting edges of the pattern leaves of TT-SFPSFJ-DOC.
2. Drop every edge whose sourceClassAssignmentState is not ASSIGNED.
3. Drop every edge whose duplicateIdentityState is UNRESOLVED.
4. Resolve every surviving edge to its underlyingDocumentIdentity (R-DUP) and to the canonicalSegmentIdentity of its supplying segment.
5. REPACKAGING ANTI-INFLATION. Group the surviving edges by (underlyingDocumentIdentity, canonicalSegmentIdentity). Within a group the class occurrences collapse to ONE classification act. A duplicate, mirrored or repackaged copy of the same underlying supplying material therefore contributes no additional class occurrence. Free-form locator wording is NEVER a grouping key.
5b. BASIS-OVERLAP ANTI-INFLATION (R-BASIS B-2; boundaryModel.basisOverlap). Over the groups of step 5 of ONE underlying document, join two groups whose supplying segments share a complete-view letter or digit position (FRAME-C: the established interval; FRAME-U: the U1 interval in any member), or whose footprints do not overlap but whose class-bearing support cores lie in ONE indivisible R-SEG-B atom (SAME_INDIVISIBLE_ATOM_TOUCHING: no lawful separator either record records and no frozen separator evidence between them; basisOverlap.touchingAtom), unless the two support records are LAWFULLY SEPARATE (disjoint, independently sufficient class-bearing support cores divided by a lawful separator that one of the two records records). The connected components are the basis count components. A component whose ASSIGNED records carry one class contributes that class ONCE; a component whose records carry two or more classes contributes NOTHING (B2_OVERLAP_CLASS_CONFLICT) and no class wins. No record's identity, state or class changes.
6. distinctClassSet = the set of distinct classes contributed by the basis count components of step 5b. A single underlying document MAY contribute two or more distinct classes when separate bounded supplying segments of that document lawfully satisfy different class predicates.
7. srcDiv HOLDS iff |distinctClassSet| >= 2.
```

*consequences.*

- Two documents in the same class contribute ONE distinct class, so srcDiv does not hold.
- Repackaged duplicates of one underlying document count once: a wrapper, mirror or rendition adds no class occurrence and subtracts none.
- A genuine mixed document MAY contribute two or more distinct classes; it is never erased from the count.
- A duplicate copy does not erase a different genuine class found elsewhere in the same underlying document.
- NOT_DETERMINABLE and every other non-ASSIGNED state never count and never become another class by fallback.
- Absence of a class assignment is not counterevidence and does not erase the underlying Stage-1 fact.
- Overlapping unequal supplying segments of one document that are not lawfully separate count as ONE basis: together they contribute one class once, or nothing when their classes differ; a narrower quotation never adds a class (B-2).
- Touching or gapped fragments of ONE indivisible R-SEG-B atom that no lawful separator divides count as ONE basis in the same way: they contribute one class once, or nothing when their classes differ; a coder's choice of where one quotation ends and the next begins inside a sentence never adds a class.

*removedRules.*

- 'one underlying document contributes at most one class' — REMOVED (F-01)
- 'if one document contains edges in multiple classes, it contributes nothing' — REMOVED (F-01)
- 'two source classes require two underlying documents' — REMOVED (F-01)
- MULTI_CLASS_UNDERLYING_DOCUMENT as a counting outcome — REMOVED; it dropped lawfully assigned edges (F-01)

| Disposition | Fires iff | Cannot fire because | Key | Effect |
|---|---|---|---|---|
| SEGMENT_CLASS_CONFLICT | iff two ASSIGNED records share the same (underlyingDocumentIdentity, canonicalSegmentIdentity) with DIFFERENT classes - a contradiction between two ASSIGNED acts | never fires because a document contains more than one class across DIFFERENT segments; such a document contributes the UNION of its classes | underlyingDocumentIdentity, canonicalSegmentIdentity | that group contributes nothing (fail closed; cannot inflate srcDiv) |
| B2_OVERLAP_CLASS_CONFLICT | iff one basis count component (step 5b) joins two or more exact-CSI groups of one underlying document whose ASSIGNED records carry two or more distinct classes (the component's edges may be overlap edges or touching-atom edges) | between lawfully separate support records, between non-overlapping occurrences in different atoms, across underlying documents, or inside one exact-CSI group (SEGMENT_CLASS_CONFLICT stays authoritative there) | underlyingDocumentIdentity, basisCountComponent | the component contributes nothing (fail closed; cannot inflate srcDiv); no narrower, broader, first, last, majority or preferred class wins |

Grouping key: underlyingDocumentIdentity, canonicalSegmentIdentity. Counting unit: one ASSIGNED segment record (one indivisible bounded segment of one supplying basis). Holds when distinct classes >= 2. Downstream: srcDiv failure yields TARGET_NOT_ESTABLISHED_WITHIN_BOUND for TT-SFPSFJ-DOC, never FALSE (CORR4 §F.3). This contract does not change CORR4 target-state semantics.

| Fixture | Case | Computed | Declared expectation |
|---|---|---|---|
| PRE-1 | One mixed document, two bounded segments, SC-3 and SC-7 | s1 = ASSIGNED (compensation plans); s2 = ASSIGNED (access-rights/role matrices) \| distinctClassSet = ['access-rights/role matrices', 'compensation plans'] | reproduced |
| PRE-2 | Same class on two different documents | PRE-2-A#s1 = ASSIGNED (access-rights/role matrices); PRE-2-B#s1 = ASSIGNED (access-rights/role matrices) \| distinctClassSet = ['access-rights/role matrices'] | reproduced |
| PRE-3 | A duplicate copy does not erase a different genuine class | P3a#s1 = ASSIGNED (compensation plans); P3b#s1 = ASSIGNED (access-rights/role matrices); P3c#s1 = ASSIGNED (compensation plans) \| distinctClassSet = ['access-rights/role matrices', 'compensation plans'] | reproduced |
| PRE-4 | Unresolved duplicate identity cannot inflate the class set | P4a#s1 = ASSIGNED (marketing/engagement materials); P4b#s1 = DUPLICATE_IDENTITY_UNRESOLVED [DUPLICATE_GROUP_UNRESOLVED]; AMB-HTML~AMB-PDF = DUPLICATE_IDENTITY_UNRESOLVED \| distinctClassSet = ['marketing/engagement materials'] | reproduced |
| PRE-5 | Non-ASSIGNED states never count toward srcDiv | P5a#s1 = ASSIGNED (platform/product rules); P5b#s1 = OUTSIDE_FROZEN_VOCABULARY; P5c#s1 = MULTIPLE_CLASS_PREDICATES_SATISFIED \| distinctClassSet = ['platform/product rules'] | reproduced |
| PRE-6 | Two coders, one segment, different classes: segment-class conflict fails closed | P6a#s1 = ASSIGNED (compensation plans); P6b#s1 = ASSIGNED (access-rights/role matrices) \| distinctClassSet = [] | reproduced |
| PRE-7 | SC-1 vs SC-8 - participant-facing words inside an instruction | s1 = ASSIGNED (internal manuals/scripts); s2 = ASSIGNED (internal manuals/scripts) \| distinctClassSet = ['internal manuals/scripts'] | reproduced |
| PRE-8 | SC-3 vs SC-7 - reward noun as the object of an oversight verb | s1 = ASSIGNED (access-rights/role matrices) \| distinctClassSet = ['access-rights/role matrices'] | reproduced |
| PRE-9 | SC-5 vs SC-7 - tier-conditional access | s1 = ASSIGNED (access-rights/role matrices); s2 = ASSIGNED (access-rights/role matrices) \| distinctClassSet = ['access-rights/role matrices'] | reproduced |
| PRE-10 | SC-4 vs SC-1/SC-3 - referral invitation with a reward | s1 = ASSIGNED (compensation plans) \| distinctClassSet = ['compensation plans'] | reproduced |
| PRE-11 | SC-6 vs SC-9 - retention metric and unattached revenue in one sentence | s1 = ASSIGNED (retention metrics) \| distinctClassSet = ['retention metrics'] | reproduced |
| PRE-11b | SC-6 vs SC-9 - retention measure and an attached participation-system flow in one sentence | s1 = MULTIPLE_CLASS_PREDICATES_SATISFIED \| distinctClassSet = [] | reproduced |
| PRE-12 | SC-7 vs SC-8 - instruction and refund authority in one sentence | s1 = MULTIPLE_CLASS_PREDICATES_SATISFIED \| distinctClassSet = [] | reproduced |
| PRE-13 | SC-1 engagement frame addressed to a prospective participant | s1 = ASSIGNED (marketing/engagement materials) \| distinctClassSet = ['marketing/engagement materials'] | reproduced |
| PRE-14 | Generic record whose function fits none of the nine | s1 = OUTSIDE_FROZEN_VOCABULARY \| distinctClassSet = [] | reproduced |
| PRE-15 | Metadata present, content unavailable | s1 = NOT_DETERMINABLE \| distinctClassSet = [] | reproduced |
| PRE-16 | A DEF 14A container whose bound segment is not compensation | s1 = OUTSIDE_FROZEN_VOCABULARY \| distinctClassSet = [] | reproduced |

## 17b. `B2_OVERLAP_ANTI_INFLATION` - BASIS-OVERLAP ANTI-INFLATION (R-BASIS B-2 AT COUNT TIME; R-COUNT STEP 5b)

- *binds:* R-BASIS B-2 (no quote-shopping: overlapping locators create neither a new document nor a new class) at count time, preserving R-BASIS B-3 / B-6 through R-SEG-B lawful separation
- *position:* R-COUNT step 5b: after occurrence anchoring (OA-1 .. OA-14), after sourceClass assignment and after the exact-CSI repackaging collapse of step 5; before the distinct-class set of step 6
- *kind:* COUNT-STAGE ANTI-INFLATION: decides only whether and how an ASSIGNED support record contributes to the distinct-class set
- *application:* `CONNECTED_COMPONENTS` (connected components of the overlap graph; never pairwise, never in record order)

*Nodes.* every segment record R-COUNT steps 1-4 keep (counting-eligible state, resolved underlying document) that Option A+ placed at an established occurrence (a FRAME-C complete-view interval, or a FRAME-U key found exactly once in every member); records with the same (underlyingDocumentIdentity, canonicalSegmentIdentity) are one group first (step 5). a group the layer cannot place keeps its step-5 contribution unchanged.

*Footprint (FRAME-C `COMPLETE_VIEW_INTERVAL`, FRAME-U `U1_MEMBER_INTERVALS`).* FRAME-C: the established omega = [completeViewStart, completeViewEnd) in the shared complete view of U. FRAME-U: for every member m, the unique complete-view interval w_m(k) at which U1 found the key k; the CSI-v6 FRAME-U identity (sha256(k)) is unchanged and the intervals are count-stage diagnostics only. Never taken from: human locator wording; raw occurrence rank; nearest span; first span; content hash alone; text equality alone; fuzzy similarity; artifact-local offsets compared across different renditions.

*Overlap (`SHARED_COMPLETE_VIEW_POSITION`, touching = `NON_OVERLAPPING`, FRAME-U = `ANY_RESOLVED_MEMBER`).* two footprints of one U overlap iff their intersection contains at least one complete-view position (every complete-view position is a letter or a digit); [a,b) and [b,c) touch and do NOT overlap. FRAME-U: overlapping in ANY member makes the pair PROVEN_OR_POSSIBLE_OVERLAP; where the relation differs across members no member is chosen (this may undercount; it never creates diversity). Relations recorded: `OVERLAPPING`, `OVERLAPPING_IN_EVERY_MEMBER`, `OVERLAPPING_IN_SOME_MEMBERS`, `NON_OVERLAPPING`.

*predicateSupportCore (`UNITS_CARRYING_PARTICIPATING_WITNESSED_ASSERTIONS`, participation `FEATURES_READ_BY_THE_SATISFIED_CLASS`, empty or unlocated -> `WHOLE_SEGMENT`, sufficiency `CORE_ASSERTIONS_ALONE_YIELD_THE_SAME_ASSIGNED_CLASS`).* predicateSupportCore(record) = the bound units (atoms) of the record's segment that carry at least one witnessed assertion of a feature the frozen predicate of the record's ASSIGNED class reads (any component or exclusion, every ANY_OF branch included), located by their complete-view positions in the frame of U. A core that is empty or has a unit without a complete-view position expands to the whole segment. Sufficiency: the frozen feature merge and the nine frozen predicates, evaluated over the core's assertions alone, yield ASSIGNED with the same class. Never alters: the class predicate; the witnessed assertions; the record's feature record.

*LAWFULLY_SEPARATE_SUPPORT(a, b).* LAWFULLY_SEPARATE_SUPPORT(a,b) iff LS-1 .. LS-5 all hold; any condition that cannot be established mechanically is false (conservative undercount is allowed; false class diversity is not). No human inference during counting.

| Condition | Test | Must establish |
|---|---|---|
| LS-1 | DISTINCT_SUPPORT_RECORDS | a and b are different assignment records (different support records or different lawfully separated segments) |
| LS-2 | CORE_SUFFICIENT_FOR_FIRST | the class-bearing support core of a is independently sufficient for a's class |
| LS-3 | CORE_SUFFICIENT_FOR_SECOND | the class-bearing support core of b is independently sufficient for b's class |
| LS-4 | CORES_DISJOINT | the two cores share no complete-view position (in every member) |
| LS-5 | RECORDED_LAWFUL_BOUNDARY_BETWEEN_CORES | a lawful separator that a's or b's own support record records (segmentation.lawfulSeparators, verified by segmentation.separatorEvidence, both adjacent segments at established occurrences) lies after every position of one core and before every position of the other, in every member |

Boundary source `RECORDED_SEPARATOR_OF_EITHER_RECORD`; boundary locus: the complete-view positions between the last letter of the unit before the separator and the first letter of the unit after it. Not a boundary: a comma; a conjunction; a line wrap; a column break; a coder-selected offset; a text-similarity transition; the start or end of a coder's span; a separator recorded only by a third record; a physically present boundary no record records.

*Component rule.* One class -> `CONTRIBUTE_ONCE`; two or more classes -> `CONTRIBUTE_NOTHING` (reason `B2_OVERLAP_CLASS_CONFLICT`). No class wins: narrower, broader, first, last, majority, higher-confidence, preferred class.

| Count disposition | When |
|---|---|
| `CLEAR_SINGLETON` | one exact-CSI group whose footprint overlaps no other group of U and shares no indivisible atom with one (touchingAtom); step-5 counting applies unchanged |
| `LAWFULLY_SEPARATE` | one exact-CSI group whose footprint overlaps other groups of U, every such pair LAWFULLY_SEPARATE_SUPPORT; step-5 counting applies unchanged |
| `COLLAPSED_SAME_CLASS_OVERLAP` | a component of two or more exact-CSI groups carrying one class: contributes that class once |
| `WITHHELD_CONFLICTING_OVERLAP` | a component of two or more exact-CSI groups carrying two or more classes: contributes nothing (B2_OVERLAP_CLASS_CONFLICT) |

Count dispositions are COUNTING_DISPOSITION — NOT a state, NOT a class, NOT a public sourceClass disposition; never stored in sourceClassAssignmentState. Exact-occurrence conflicts: `SEGMENT_CLASS_CONFLICT_AUTHORITATIVE`. Record effect: `NO_RECORD_EFFECT`.

*Recording.* `count.basisOverlap`, per record: `basisOverlapComponentId`, `basisOverlapMembers`, `basisOverlapRelation`, `predicateSupportCore`, `lawfulSeparationProof`, `b2CountDisposition`, `b2CountReason` (the count block of the evaluation (count.basisOverlap); segment records are never written).

*Never changes:* canonicalSegmentIdentity (CSI-v6); underlyingDocumentIdentity; sourceClassAssignmentState; sourceClass; satisfiedClassIds; the class predicates; R-DUP; occurrenceAnchoring (OA-1 .. OA-14); segmentation.

*Identity statements stand.* canonicalSegmentIdentity.collision and occurrenceAnchoring.residualsCarried.R-7 stay byte-identical: at the IDENTITY level overlapping unequal segments remain different CSI-v6 occurrences by design. Their COUNTING consequence ('can count separately'; 'B-2 is not mechanically enforced') is superseded by R-COUNT step 5b.

*Forbidden:* changing a CSI-v6 identity, a frame, a key or an occurrence to make counting work; recoding a record or re-running a class predicate to count it; using DUPLICATE_IDENTITY_UNRESOLVED or MULTIPLE_CLASS_PREDICATES_SATISFIED for an established identity or a separately assigned record; a narrowest-, broadest-, first- or majority-wins rule; pairwise destructive processing instead of connected components; a record-order-dependent component; joining records merely because they belong to the same document; text equality or similarity as overlap; artifact-local offsets compared across renditions; ignoring FRAME-U overlap or choosing one member; a comma, conjunction, line wrap or column break as a lawful boundary; a new state, class or public sourceClass disposition; bypassing SEGMENT_CLASS_CONFLICT.

*Closes:* A+-R-7 (overlapping unequal segments counting separately). *Accepted undercount:* accepted and reported apart from the hard counters: a conflicting component withholds every class it carries, including a class another record of the component would lawfully support; a physically present boundary that no record records does not separate; a FRAME-U relation that differs across members is treated as overlap.

| Fixture | Case | Computed (state; count disposition) | Declared expectation |
|---|---|---|---|
| R7-D1 | nested quote-shopping: broad SC-3 record on the whole sentence, narrow SC-7 record strictly inside it, no lawful separation | N0#s1 = ASSIGNED (compensation plans) [WITHHELD_CONFLICTING_OVERLAP]; N1#s1 = ASSIGNED (access-rights/role matrices) [WITHHELD_CONFLICTING_OVERLAP] \| distinctClassSet = [] | reproduced |
| R7-D1-X | nested quote-shopping across two renditions (FRAME-C): broad record on one HTML rendition, narrow on another whose extraction offsets are shifted | N0#s1 = ASSIGNED (compensation plans) [WITHHELD_CONFLICTING_OVERLAP]; N1#s1 = ASSIGNED (access-rights/role matrices) [WITHHELD_CONFLICTING_OVERLAP] \| distinctClassSet = [] | reproduced |
| R7-D1-U | nested quote-shopping in FRAME-U (two renditions whose complete views differ), overlap in every member | N0#s1 = ASSIGNED (compensation plans) [WITHHELD_CONFLICTING_OVERLAP]; N1#s1 = ASSIGNED (access-rights/role matrices) [WITHHELD_CONFLICTING_OVERLAP] \| distinctClassSet = [] | reproduced |
| R7-D2 | partial overlap: SC-7 on 'The Committee ... $36,000', SC-3 on 'annual retainer ... fees.'; neither contains the other | N0#s1 = ASSIGNED (access-rights/role matrices) [WITHHELD_CONFLICTING_OVERLAP]; N1#s1 = ASSIGNED (compensation plans) [WITHHELD_CONFLICTING_OVERLAP] \| distinctClassSet = [] | reproduced |
| R7-D3 | transitive bridge: A (SC-7) overlaps B (SC-3), B overlaps C (SC-3), A does not overlap C | N0#s1 = ASSIGNED (access-rights/role matrices) [WITHHELD_CONFLICTING_OVERLAP]; N1#s1 = ASSIGNED (compensation plans) [WITHHELD_CONFLICTING_OVERLAP]; N2#s1 = ASSIGNED (compensation plans) [WITHHELD_CONFLICTING_OVERLAP] \| distinctClassSet = [] | reproduced |
| R7-C1 | same class: two unequal overlapping SC-3 records -> one component, one contribution | N0#s1 = ASSIGNED (compensation plans) [COLLAPSED_SAME_CLASS_OVERLAP]; N1#s1 = ASSIGNED (compensation plans) [COLLAPSED_SAME_CLASS_OVERLAP] \| distinctClassSet = ['compensation plans'] | reproduced |
| R7-C2 | one sourceRef, numbered clauses 1 (SC-3) and 2 (SC-7) separated by a recorded NUMBERED_CLAUSE boundary | N0#s1 = ASSIGNED (compensation plans) [CLEAR_SINGLETON]; N0#s2 = ASSIGNED (access-rights/role matrices) [CLEAR_SINGLETON] \| distinctClassSet = ['access-rights/role matrices', 'compensation plans'] | reproduced |
| R7-C3 | two semantically complete table rows, separated by a recorded TABLE_ROW boundary, SC-3 and SC-7 | N0#s1 = ASSIGNED (compensation plans) [CLEAR_SINGLETON]; N0#s2 = ASSIGNED (access-rights/role matrices) [CLEAR_SINGLETON] \| distinctClassSet = ['access-rights/role matrices', 'compensation plans'] | reproduced |
| R7-C4 | shared heading: both records quote the heading; A = heading + clause 1 (SC-3), B = heading, then clause 2 (SC-7) behind a recorded NUMBERED_CLAUSE | N0#s1 = ASSIGNED (compensation plans) [CLEAR_SINGLETON]; N1#s1 = OUTSIDE_FROZEN_VOCABULARY; N1#s2 = ASSIGNED (access-rights/role matrices) [CLEAR_SINGLETON] \| distinctClassSet = ['access-rights/role matrices', 'compensation plans'] | reproduced |
| R7-C4-SEG | shared heading and clause inside overlapping segments: A = heading + clause 1 (SC-3) with clause 2 behind a recorded NUMBERED_CLAUSE; B = heading + clause 1 + clause 2 conjoined, SC-7 witnessed only in clause 2 | N0#s1 = ASSIGNED (compensation plans) [LAWFULLY_SEPARATE]; N0#s2 = OUTSIDE_FROZEN_VOCABULARY; N1#s1 = ASSIGNED (access-rights/role matrices) [LAWFULLY_SEPARATE] \| distinctClassSet = ['access-rights/role matrices', 'compensation plans'] | reproduced |
| R7-C4-MID | shared heading between the propositions: A = heading 1 + sentence 1 (SC-3) + heading 2; B records SENTENCE after sentence 1, then heading 2 + sentence 2 (SC-7) | N0#s1 = ASSIGNED (compensation plans) [LAWFULLY_SEPARATE]; N1#s1 = OUTSIDE_FROZEN_VOCABULARY; N1#s2 = ASSIGNED (access-rights/role matrices) [LAWFULLY_SEPARATE] \| distinctClassSet = ['access-rights/role matrices', 'compensation plans'] | reproduced |
| R7-C4-U | R7-C4-SEG in FRAME-U: the separation is proven in every member | N0#s1 = ASSIGNED (compensation plans) [LAWFULLY_SEPARATE]; N0#s2 = OUTSIDE_FROZEN_VOCABULARY; N1#s1 = ASSIGNED (access-rights/role matrices) [LAWFULLY_SEPARATE] \| distinctClassSet = ['access-rights/role matrices', 'compensation plans'] | reproduced |
| R7-C4-UNREC | control: the numbered clause is physically present but NO record records it (both conjoin): not a lawful R-SEG-B separation -> withheld (conservative undercount) | N0#s1 = ASSIGNED (compensation plans) [WITHHELD_CONFLICTING_OVERLAP]; N1#s1 = ASSIGNED (access-rights/role matrices) [WITHHELD_CONFLICTING_OVERLAP] \| distinctClassSet = [] | reproduced |
| R7-C5 | different classes divided only by a comma: A = both clauses conjoined (SC-3 in clause 1), B = clause 2 (SC-7) | N0#s1 = ASSIGNED (compensation plans) [WITHHELD_CONFLICTING_OVERLAP]; N1#s1 = ASSIGNED (access-rights/role matrices) [WITHHELD_CONFLICTING_OVERLAP] \| distinctClassSet = [] | reproduced |
| R7-C6 | different classes divided only by a conjunction | N0#s1 = ASSIGNED (compensation plans) [WITHHELD_CONFLICTING_OVERLAP]; N1#s1 = ASSIGNED (access-rights/role matrices) [WITHHELD_CONFLICTING_OVERLAP] \| distinctClassSet = [] | reproduced |
| R7-C7 | different classes divided only by a line wrap | N0#s1 = ASSIGNED (compensation plans) [WITHHELD_CONFLICTING_OVERLAP]; N1#s1 = ASSIGNED (access-rights/role matrices) [WITHHELD_CONFLICTING_OVERLAP] \| distinctClassSet = [] | reproduced |
| R7-C8 | identical text at two non-overlapping occurrences, coded SC-3 and SC-7: two occurrences, no merge by text | N0#s1 = ASSIGNED (compensation plans) [CLEAR_SINGLETON]; N1#s1 = ASSIGNED (access-rights/role matrices) [CLEAR_SINGLETON] \| distinctClassSet = ['access-rights/role matrices', 'compensation plans'] | reproduced |
| R7-C9 | records of two different underlying documents at the same complete-view positions: no cross-document component | N0#s1 = ASSIGNED (compensation plans) [CLEAR_SINGLETON]; N1#s1 = ASSIGNED (access-rights/role matrices) [CLEAR_SINGLETON] \| distinctClassSet = ['access-rights/role matrices', 'compensation plans'] | reproduced |
| R7-C10 | the exact same occurrence carries SC-3 and SC-7: SEGMENT_CLASS_CONFLICT stays authoritative | N0#s1 = ASSIGNED (compensation plans) [CLEAR_SINGLETON]; N1#s1 = ASSIGNED (access-rights/role matrices) [CLEAR_SINGLETON] \| distinctClassSet = [] | reproduced |
| R7-C10-X | the conflicting exact occurrence also overlaps a third SC-3 record: the component is withheld and SEGMENT_CLASS_CONFLICT is still recorded | N0#s1 = ASSIGNED (compensation plans) [WITHHELD_CONFLICTING_OVERLAP]; N1#s1 = ASSIGNED (access-rights/role matrices) [WITHHELD_CONFLICTING_OVERLAP]; N2#s1 = ASSIGNED (compensation plans) [WITHHELD_CONFLICTING_OVERLAP] \| distinctClassSet = [] | reproduced |
| R7-FU-1 | FRAME-U partial overlap present in every member | N0#s1 = ASSIGNED (access-rights/role matrices) [WITHHELD_CONFLICTING_OVERLAP]; N1#s1 = ASSIGNED (compensation plans) [WITHHELD_CONFLICTING_OVERLAP] \| distinctClassSet = [] | reproduced |
| R7-FU-2a | FRAME-U relation differs across members: in the first member the SC-3 key is broken in the body and found only in a relocated copy (no overlap), in the second the keys overlap; fail closed | N0#s1 = ASSIGNED (access-rights/role matrices) [WITHHELD_CONFLICTING_OVERLAP]; N1#s1 = ASSIGNED (compensation plans) [WITHHELD_CONFLICTING_OVERLAP] \| distinctClassSet = [] | reproduced |
| R7-FU-2b | R7-FU-2a with the member order reversed (the overlapping member first) | N0#s1 = ASSIGNED (access-rights/role matrices) [WITHHELD_CONFLICTING_OVERLAP]; N1#s1 = ASSIGNED (compensation plans) [WITHHELD_CONFLICTING_OVERLAP] \| distinctClassSet = [] | reproduced |
| R7-FU-C1 | FRAME-U same-class overlap: one component, one contribution | N0#s1 = ASSIGNED (compensation plans) [COLLAPSED_SAME_CLASS_OVERLAP]; N1#s1 = ASSIGNED (compensation plans) [COLLAPSED_SAME_CLASS_OVERLAP] \| distinctClassSet = ['compensation plans'] | reproduced |
| R7-RES-1 | RESIDUAL DISCLOSURE (not an overlap): two records quote touching halves of ONE indivisible sentence (SC-7 on the first half, SC-3 on the rest); the footprints touch without sharing a letter, so B-2 does not join them and both classes count | N0#s1 = ASSIGNED (access-rights/role matrices) [WITHHELD_CONFLICTING_OVERLAP]; N1#s1 = ASSIGNED (compensation plans) [WITHHELD_CONFLICTING_OVERLAP] \| distinctClassSet = [] | reproduced |
| R7-RES-1M | RESIDUAL DISCLOSURE: R7-RES-1 plus a third record coding the whole sentence with both classes (MULTIPLE_CLASS_PREDICATES_SATISFIED); a non-counting record is not a node, so the touching halves still both count | N0#s1 = ASSIGNED (access-rights/role matrices) [WITHHELD_CONFLICTING_OVERLAP]; N1#s1 = ASSIGNED (compensation plans) [WITHHELD_CONFLICTING_OVERLAP]; N2#s1 = MULTIPLE_CLASS_PREDICATES_SATISFIED \| distinctClassSet = [] | reproduced |

## 17c. `SAME_INDIVISIBLE_ATOM_TOUCHING` - TOUCHING FRAGMENTS OF ONE INDIVISIBLE ATOM (R7-RES-1; R-COUNT STEP 5b)

- *closes:* R7-RES-1: two count candidates quoting touching (or gapped) fragments of ONE indivisible sentence or numbered sub-clause, no lawful separator between them, both counted because their footprints touch rather than overlap
- *binds:* R-BASIS B-2 at count time for count candidates whose footprints do not overlap but whose class-bearing support cores lie in one indivisible R-SEG-B atom; R-BASIS B-3 / B-6 and R-SEG-B stay authoritative through the recorded boundaries and the frozen junction evidence
- *edge:* B2_EDGE(a, b) iff a and b are count candidates (nodes.rule) of the same underlying document U in different exact R-COUNT groups AND (PROVEN_OR_POSSIBLE_OVERLAP(a, b) OR SAME_INDIVISIBLE_ATOM_TOUCHING(a, b)) AND NOT LAWFULLY_SEPARATE_SUPPORT(a, b)
- *pairs:* every pair of count candidates of one U in different exact groups whose footprints overlap in no member (overlap.test); a pair that overlaps keeps the overlap relation, unchanged
- *application:* `EDGE_ELIGIBILITY` (one more edge kind in the basis-overlap graph; never a second component algorithm)

| Condition | Must be established mechanically |
|---|---|
| TA-1 | a and b belong to the same resolved underlying document U (nodes.sameUnderlyingDocumentOnly) |
| TA-2 | no atom boundary lies between the class-bearing support cores of a and b (supportCore): no lawful separator that a's or b's own support record records lies between them (recordedBoundaries) and the material between the cores holds no junction evidence (junctionEvidence) |
| TA-3 | their footprints overlap in no member (overlap.rule; touching is not overlap) |
| TA-4 | the footprints touch (no letter or digit between them) or are separated only by documentary material of that same atom: spaces, punctuation, a comma, a conjunction, a line wrap, ordinary uncoded words, none of it junction evidence of a lawful separator (junctionEvidence) |
| TA-5 | LAWFULLY_SEPARATE_SUPPORT(a, b) (lawfulSeparation LS-1 .. LS-5) does not hold; it is evaluated and recorded for every touching-atom pair |

*Atom (`FROZEN_SEGMENTATION_ATOM`).* segmentation.atom, unchanged: the smallest documentary unit, a numbered sub-clause where the text is sub-clause structured, otherwise the record's own sentence; 'record' is the documentary record (documentaryTerms.boundedSegment), never a coder's support record or unit.

*Junction (`BETWEEN_CORES`).* in the frame of U, complete-view gap i lies between positions i-1 and i. For an earlier footprint [e0, e1) and a later footprint [l0, l1) (they touch when e1 = l0), the junction read for the atom test is the gaps c1 .. c2, from the end c1 of the earlier record's last class-bearing core position to the start c2 of the later record's first core position: the material between the two class-bearing cores, whether it lies between the footprints or inside one of them. Material a record merely conjoins (NONE) is not a boundary by itself; its frozen evidence is. *Material:* per rendition member m, the text of m's complete view BEFORE its letters-and-digits filter (the completeView ops named in omitCompleteViewOps are not applied: comments and tags already emitted as spaces and their emitted values, character references decoded, letters casefolded); the material of gap i is that text strictly between complete-view positions i-1 and i. It is the view the footprints live in, read with its punctuation and whitespace still present (omitted complete-view ops: ``{"op": "regex", "pattern": "[\\W_]+", "flags": [], "repl": ""}``). Rendition members: FRAME-C `EVERY_MEMBER_OF_U`, FRAME-U `THE_FRAME_MEMBER`.

*Junction evidence.* an atom boundary is evidenced at a junction gap of a frame key iff, in EVERY rendition member of that key, the gap's normalized material satisfies the reading of a listed lawful separator. A lawful separator whose frozen evidence a notSeparator or ordinary inline material also produces never evidences a boundary between two footprints, where no record declares it.

| Lawful separator | Reading | Frozen evidence it reads | Frozen pattern | How it is read between two footprints |
|---|---|---|---|---|
| SENTENCE | PREVIOUS_UNIT_ENDING | `segmentation.separatorEvidence.whenAdjacent.SENTENCE.previousUnitCanonicalEndsWith` | `[.!?]["')\]]*$` | the normalized material contains the frozen previous-unit ending (a terminal . ! or ? with its closing quotes or brackets) followed by documentary whitespace (a space, a line feed, or markup the normalization turns into a space) |
| NUMBERED_CLAUSE | UNIT_START | `segmentation.separatorEvidence.whenAdjacent.NUMBERED_CLAUSE.unitCanonicalStartsWith` | `^(\(?[0-9]{1,3}[.)]\|\(?[a-z][.)]\|\(?[ivxlc]{1,6}[.)])\s` | at a point of the normalized material that documentary whitespace precedes, the frozen unit-start pattern (a clause or sub-clause number) matches the normalized text from that point on, read at most headLookaheadCharacters of the rendition into the later text |
| NUMBERED_SUBCLAUSE | UNIT_START | `segmentation.separatorEvidence.whenAdjacent.NUMBERED_SUBCLAUSE.unitCanonicalStartsWith` | `^(\(?[0-9]{1,3}[.)]\|\(?[a-z][.)]\|\(?[ivxlc]{1,6}[.)])\s` | at a point of the normalized material that documentary whitespace precedes, the frozen unit-start pattern (a clause or sub-clause number) matches the normalized text from that point on, read at most headLookaheadCharacters of the rendition into the later text |

| Lawful separator never evidenced from bytes alone | Why |
|---|---|
| TABLE_ROW | its frozen evidence (a line feed in the gap) is produced as well by LINE_WRAP and COLUMN_BREAK, which segmentation.notSeparators names: a line feed between two footprints does not prove a row. A row boundary separates only where one of the two records records it |
| HEADING | forbidden when adjacent; when not adjacent its frozen evidence is only that intervening text exists, which ordinary inline material produces as well |
| EXHIBIT | as HEADING |
| PAGE_OR_SECTION_LABEL | as HEADING |

Head look-ahead: 32 characters. Not a boundary: a comma; a semicolon or a colon; a conjunction; a space; a line wrap; a column break; a paragraph break without a terminal; ordinary uncoded words; the start or end of a coder's span; a coder-selected offset; a text-similarity transition; a separator recorded only by a third record.

*Recorded boundaries.* a lawful separator that a's or b's own support record records (the basisOverlap facts: both adjacent segments at established occurrences, the separator verified by segmentation.separatorEvidence) lying after every core position of the earlier record and before every core position of the later one, in that frame key. It separates whether or not the bytes alone would evidence it (a recorded TABLE_ROW or HEADING).

*Members (`SAME_ATOM_IN_ANY_MEMBER`).* the pair is SAME_INDIVISIBLE_ATOM_TOUCHING iff in at least one frame key no boundary lies between the cores (FRAME-C: the shared frame, where a junction boundary counts only if evidenced in every rendition member of U; FRAME-U: each member separately). Member evidence that disagrees fails closed for diversity; no member is chosen. Relations recorded: `TOUCHING_SAME_ATOM`, `TOUCHING_SAME_ATOM_IN_SOME_MEMBERS`, `DIFFERENT_ATOMS`.

*Component binding (`SHARED_B2_COMPONENTS`).* a touching-atom edge enters the same union-find as an overlap edge. The basis count components, componentRule, dispositions, componentIdPrefix, exactGroupConflict and recordStateEffect are basisOverlap's, unchanged: one class contributes once, two or more contribute nothing (B2_OVERLAP_CLASS_CONFLICT) and no class wins. There is no second component algorithm.

*Recording.* `count.basisOverlap.touchingAtomPairs` and `count.basisOverlap.touchingAtomRelations`: touchingAtomRelations: every non-overlapping pair of one U in different exact groups with its relation and atom proof (per frame key: the earlier record, the junction gaps, the junction evidence per rendition member, the recorded boundary). touchingAtomPairs: the SAME_INDIVISIBLE_ATOM_TOUCHING pairs with their LAWFULLY_SEPARATE_SUPPORT proof; they are partners in the per-record basisOverlapRelation. Nothing is written into a segment record.

*Never changes:* canonicalSegmentIdentity (CSI-v6); underlyingDocumentIdentity; sourceClassAssignmentState; sourceClass; satisfiedClassIds; the class predicates; the witnessed assertions; R-DUP; occurrenceAnchoring (OA-1 .. OA-14); segmentation (segments, separators, separatorEvidence, atom); the overlap test (touching stays NON_OVERLAPPING).

*Forbidden:* turning touching into occurrence identity (a CSI-v6 identity, frame, key or occurrence changed to count); a comma, semicolon, colon, conjunction, space, line wrap or column break read as an atom boundary; a line feed read as a table row, or intervening text read as a heading, between two footprints; exact boundary equality required (the internal gap ignored); joining records merely because they are near, text-similar, of the same class, of the same sourceRef, under the same heading or in the same document; text equality as atom proof; a nearest-, first-, narrower-, broader- or majority-wins rule; pairwise destructive processing or a record-order-dependent component; choosing one FRAME-U member; a separator recorded only by a third record, or a third record's conjoining, deciding the pair; recoding a record, a new state, class or public disposition, or a second component algorithm.

*Closes:* R7-RES-1 (touching fragments of one indivisible atom counted separately). *Accepted undercount:* accepted and reported apart from the hard counters: a physically present row, heading, exhibit or label boundary between two footprints that neither record records and that no terminal or clause number evidences (its line feed is a line wrap's line feed); a boundary inside a record's own conjoined material; FRAME-U or rendition member evidence that disagrees.

| Fixture | Case | Computed (state; relation; count disposition) | Declared expectation |
|---|---|---|---|
| TA-D1 | DECISIVE: the exact residual - one indivisible sentence, record A quotes the first fragment (SC-7), record B the rest (SC-3), no lawful separator; the footprints touch | N0#s1 = ASSIGNED (access-rights/role matrices) [WITHHELD_CONFLICTING_OVERLAP]; N1#s1 = ASSIGNED (compensation plans) [WITHHELD_CONFLICTING_OVERLAP] \| N0#s1\|N1#s1 TOUCHING_SAME_ATOM \| distinctClassSet = [] | reproduced |
| TA-D1-W | the exact residual with WIDE footprints (each record's span takes the neighbouring punctuation): the footprints still touch in the complete view | N0#s1 = ASSIGNED (access-rights/role matrices) [WITHHELD_CONFLICTING_OVERLAP]; N1#s1 = ASSIGNED (compensation plans) [WITHHELD_CONFLICTING_OVERLAP] \| N0#s1\|N1#s1 TOUCHING_SAME_ATOM \| distinctClassSet = [] | reproduced |
| TA-D1-X | the exact residual across two renditions (FRAME-C): the fragments are bound in two different HTML renditions whose extraction offsets differ | N0#s1 = ASSIGNED (access-rights/role matrices) [WITHHELD_CONFLICTING_OVERLAP]; N1#s1 = ASSIGNED (compensation plans) [WITHHELD_CONFLICTING_OVERLAP] \| N0#s1\|N1#s1 TOUCHING_SAME_ATOM \| distinctClassSet = [] | reproduced |
| TA-D1-TH | the exact residual across a plain-text and an HTML rendition of one document (FRAME-C: equal complete views) | N0#s1 = ASSIGNED (access-rights/role matrices) [WITHHELD_CONFLICTING_OVERLAP]; N1#s1 = ASSIGNED (compensation plans) [WITHHELD_CONFLICTING_OVERLAP] \| N0#s1\|N1#s1 TOUCHING_SAME_ATOM \| distinctClassSet = [] | reproduced |
| TA-D1-U | the exact residual in FRAME-U (two renditions whose complete views differ): same atom in every member | N0#s1 = ASSIGNED (access-rights/role matrices) [WITHHELD_CONFLICTING_OVERLAP]; N1#s1 = ASSIGNED (compensation plans) [WITHHELD_CONFLICTING_OVERLAP] \| N0#s1\|N1#s1 TOUCHING_SAME_ATOM \| distinctClassSet = [] | reproduced |
| TA-D2 | DECISIVE: R7-RES-1M - the exact residual plus a third record coding the whole sentence with both classes (MULTIPLE_CLASS_PREDICATES_SATISFIED, non-counting); the closure does not rely on it | N0#s1 = ASSIGNED (access-rights/role matrices) [WITHHELD_CONFLICTING_OVERLAP]; N1#s1 = ASSIGNED (compensation plans) [WITHHELD_CONFLICTING_OVERLAP]; N2#s1 = MULTIPLE_CLASS_PREDICATES_SATISFIED \| N0#s1\|N1#s1 TOUCHING_SAME_ATOM \| distinctClassSet = [] | reproduced |
| TA-C1 | same class: two touching fragments of one atom, SC-3 and SC-3 -> one component, one contribution | N0#s1 = ASSIGNED (compensation plans) [COLLAPSED_SAME_CLASS_OVERLAP]; N1#s1 = ASSIGNED (compensation plans) [COLLAPSED_SAME_CLASS_OVERLAP] \| N0#s1\|N1#s1 TOUCHING_SAME_ATOM \| distinctClassSet = ['compensation plans'] | reproduced |
| TA-C1-7 | same class: two touching fragments of one atom, SC-7 and SC-7, divided by a comma -> one component, one contribution | N0#s1 = ASSIGNED (access-rights/role matrices) [COLLAPSED_SAME_CLASS_OVERLAP]; N1#s1 = ASSIGNED (access-rights/role matrices) [COLLAPSED_SAME_CLASS_OVERLAP] \| N0#s1\|N1#s1 TOUCHING_SAME_ATOM \| distinctClassSet = ['access-rights/role matrices'] | reproduced |
| TA-C2 | numbered clauses (1) and (2) of one sourceRef, the NUMBERED_CLAUSE recorded between two segments of one record; the segments touch -> two count units | N0#s1 = ASSIGNED (compensation plans) [CLEAR_SINGLETON]; N0#s2 = ASSIGNED (access-rights/role matrices) [CLEAR_SINGLETON] \| N0#s1\|N0#s2 DIFFERENT_ATOMS \| distinctClassSet = ['access-rights/role matrices', 'compensation plans'] | reproduced |
| TA-C2-B | numbered clauses without terminal punctuation quoted by two records whose footprints touch; no record records the boundary: the frozen clause-number evidence proves it -> two count units | N0#s1 = ASSIGNED (compensation plans) [CLEAR_SINGLETON]; N1#s1 = ASSIGNED (access-rights/role matrices) [CLEAR_SINGLETON] \| N0#s1\|N1#s1 DIFFERENT_ATOMS \| distinctClassSet = ['access-rights/role matrices', 'compensation plans'] | reproduced |
| TA-C2-SUB | numbered sub-clauses (a) and (b) inside one sentence, two records whose footprints touch: the frozen sub-clause number evidence proves the atom boundary -> two count units | N0#s1 = ASSIGNED (compensation plans) [CLEAR_SINGLETON]; N1#s1 = ASSIGNED (access-rights/role matrices) [CLEAR_SINGLETON] \| N0#s1\|N1#s1 DIFFERENT_ATOMS \| distinctClassSet = ['access-rights/role matrices', 'compensation plans'] | reproduced |
| TA-C3 | two table rows, the TABLE_ROW recorded between two segments of one record; the segments touch -> two count units | N0#s1 = ASSIGNED (compensation plans) [CLEAR_SINGLETON]; N0#s2 = ASSIGNED (access-rights/role matrices) [CLEAR_SINGLETON] \| N0#s1\|N0#s2 DIFFERENT_ATOMS \| distinctClassSet = ['access-rights/role matrices', 'compensation plans'] | reproduced |
| TA-C3-B | two table rows quoted by two records; the row boundary is recorded by one of them (its first segment carries SC-3, its second is uncoded) -> two count units | N0#s1 = ASSIGNED (compensation plans) [CLEAR_SINGLETON]; N0#s2 = OUTSIDE_FROZEN_VOCABULARY; N1#s1 = ASSIGNED (access-rights/role matrices) [CLEAR_SINGLETON] \| N0#s1\|N1#s1 DIFFERENT_ATOMS \| distinctClassSet = ['access-rights/role matrices', 'compensation plans'] | reproduced |
| TA-C3-UNREC | control (conservative undercount): two table rows quoted by two touching records, no terminal, no record records the row: the line feed between them is byte-identical to TA-N-WRAP's line wrap -> joined, withheld | N0#s1 = ASSIGNED (compensation plans) [WITHHELD_CONFLICTING_OVERLAP]; N1#s1 = ASSIGNED (access-rights/role matrices) [WITHHELD_CONFLICTING_OVERLAP] \| N0#s1\|N1#s1 TOUCHING_SAME_ATOM \| distinctClassSet = [] | reproduced |
| TA-C4 | two adjacent complete sentences quoted by two records; end(sentence 1) == start(sentence 2) in the complete view: the frozen sentence evidence proves the boundary -> two count units | N0#s1 = ASSIGNED (compensation plans) [CLEAR_SINGLETON]; N1#s1 = ASSIGNED (access-rights/role matrices) [CLEAR_SINGLETON] \| N0#s1\|N1#s1 DIFFERENT_ATOMS \| distinctClassSet = ['access-rights/role matrices', 'compensation plans'] | reproduced |
| TA-C4-NL | two complete sentences divided by a terminal and a line feed, two touching records -> two count units | N0#s1 = ASSIGNED (access-rights/role matrices) [CLEAR_SINGLETON]; N1#s1 = ASSIGNED (compensation plans) [CLEAR_SINGLETON] \| N0#s1\|N1#s1 DIFFERENT_ATOMS \| distinctClassSet = ['access-rights/role matrices', 'compensation plans'] | reproduced |
| TA-C4-Q | two complete sentences, the first closed by a quotation mark after its terminal, two touching records -> two count units | N0#s1 = ASSIGNED (compensation plans) [CLEAR_SINGLETON]; N1#s1 = ASSIGNED (access-rights/role matrices) [CLEAR_SINGLETON] \| N0#s1\|N1#s1 DIFFERENT_ATOMS \| distinctClassSet = ['access-rights/role matrices', 'compensation plans'] | reproduced |
| TA-C4-REC | two complete sentences as two segments of one record (SENTENCE recorded); the segments touch -> two count units | N0#s1 = ASSIGNED (compensation plans) [CLEAR_SINGLETON]; N0#s2 = ASSIGNED (access-rights/role matrices) [CLEAR_SINGLETON] \| N0#s1\|N0#s2 DIFFERENT_ATOMS \| distinctClassSet = ['access-rights/role matrices', 'compensation plans'] | reproduced |
| TA-N-COMMA | non-lawful delimiter: the two fragments of one sentence are divided only by a comma -> one conflicting component | N0#s1 = ASSIGNED (access-rights/role matrices) [WITHHELD_CONFLICTING_OVERLAP]; N1#s1 = ASSIGNED (compensation plans) [WITHHELD_CONFLICTING_OVERLAP] \| N0#s1\|N1#s1 TOUCHING_SAME_ATOM \| distinctClassSet = [] | reproduced |
| TA-N-CONJ | non-lawful delimiter: divided only by a conjunction ('and', uncoded, between the footprints) -> one conflicting component | N0#s1 = ASSIGNED (access-rights/role matrices) [WITHHELD_CONFLICTING_OVERLAP]; N1#s1 = ASSIGNED (compensation plans) [WITHHELD_CONFLICTING_OVERLAP] \| N0#s1\|N1#s1 TOUCHING_SAME_ATOM \| distinctClassSet = [] | reproduced |
| TA-N-SPACE | non-lawful delimiter: divided only by a plain space (SC-3 first, SC-7 second) -> one conflicting component | N0#s1 = ASSIGNED (compensation plans) [WITHHELD_CONFLICTING_OVERLAP]; N1#s1 = ASSIGNED (access-rights/role matrices) [WITHHELD_CONFLICTING_OVERLAP] \| N0#s1\|N1#s1 TOUCHING_SAME_ATOM \| distinctClassSet = [] | reproduced |
| TA-N-SEMI | non-lawful delimiter: divided only by a semicolon (not a frozen lawful boundary) -> one conflicting component | N0#s1 = ASSIGNED (access-rights/role matrices) [WITHHELD_CONFLICTING_OVERLAP]; N1#s1 = ASSIGNED (compensation plans) [WITHHELD_CONFLICTING_OVERLAP] \| N0#s1\|N1#s1 TOUCHING_SAME_ATOM \| distinctClassSet = [] | reproduced |
| TA-N-COLON | non-lawful delimiter: divided only by a colon -> one conflicting component | N0#s1 = ASSIGNED (access-rights/role matrices) [WITHHELD_CONFLICTING_OVERLAP]; N1#s1 = ASSIGNED (compensation plans) [WITHHELD_CONFLICTING_OVERLAP] \| N0#s1\|N1#s1 TOUCHING_SAME_ATOM \| distinctClassSet = [] | reproduced |
| TA-N-WRAP | non-lawful delimiter: divided only by a line wrap -> one conflicting component | N0#s1 = ASSIGNED (compensation plans) [WITHHELD_CONFLICTING_OVERLAP]; N1#s1 = ASSIGNED (access-rights/role matrices) [WITHHELD_CONFLICTING_OVERLAP] \| N0#s1\|N1#s1 TOUCHING_SAME_ATOM \| distinctClassSet = [] | reproduced |
| TA-N-COLUMN | non-lawful delimiter: divided only by a column break (a blank line inside the sentence) -> one conflicting component | N0#s1 = ASSIGNED (access-rights/role matrices) [WITHHELD_CONFLICTING_OVERLAP]; N1#s1 = ASSIGNED (compensation plans) [WITHHELD_CONFLICTING_OVERLAP] \| N0#s1\|N1#s1 TOUCHING_SAME_ATOM \| distinctClassSet = [] | reproduced |
| TA-C5 | gap control: [A SC-7] ordinary uncoded words [B SC-3] inside one sentence, no lawful separator -> one conflicting component (no exact-boundary bypass) | N0#s1 = ASSIGNED (access-rights/role matrices) [WITHHELD_CONFLICTING_OVERLAP]; N1#s1 = ASSIGNED (compensation plans) [WITHHELD_CONFLICTING_OVERLAP] \| N0#s1\|N1#s1 TOUCHING_SAME_ATOM \| distinctClassSet = [] | reproduced |
| TA-C6 | distinct atoms: SC-3 in sentence 1, SC-7 in sentence 3 of one document, an uncoded sentence between them; not touching, not near -> no touching-atom edge, two count units | N0#s1 = ASSIGNED (compensation plans) [CLEAR_SINGLETON]; N1#s1 = ASSIGNED (access-rights/role matrices) [CLEAR_SINGLETON] \| N0#s1\|N1#s1 DIFFERENT_ATOMS \| distinctClassSet = ['access-rights/role matrices', 'compensation plans'] | reproduced |
| TA-C6-NEAR | distinct atoms that nearly touch: SC-7 ends sentence 1, SC-3 starts sentence 2, one terminal and a space between -> two count units | N0#s1 = ASSIGNED (access-rights/role matrices) [CLEAR_SINGLETON]; N1#s1 = ASSIGNED (compensation plans) [CLEAR_SINGLETON] \| N0#s1\|N1#s1 DIFFERENT_ATOMS \| distinctClassSet = ['access-rights/role matrices', 'compensation plans'] | reproduced |
| TA-T1 | transitive inside one atom: A (SC-7) touches B (SC-3), B touches C (SC-7), A and C are gapped by B -> one component, nothing contributed, in every record order | N0#s1 = ASSIGNED (access-rights/role matrices) [WITHHELD_CONFLICTING_OVERLAP]; N1#s1 = ASSIGNED (compensation plans) [WITHHELD_CONFLICTING_OVERLAP]; N2#s1 = ASSIGNED (access-rights/role matrices) [WITHHELD_CONFLICTING_OVERLAP] \| N0#s1\|N1#s1 TOUCHING_SAME_ATOM; N0#s1\|N2#s1 TOUCHING_SAME_ATOM; N1#s1\|N2#s1 TOUCHING_SAME_ATOM \| distinctClassSet = [] | reproduced |
| TA-T2 | transitive bridge: A (SC-7, sentence 1) touches B, B conjoins the rest of sentence 1 and the start of sentence 2 and carries SC-3 in both, C (SC-7, sentence 2) touches B; A and C lie in different atoms (no direct edge) -> one component through B, in every record order | N0#s1 = ASSIGNED (access-rights/role matrices) [WITHHELD_CONFLICTING_OVERLAP]; N1#s1 = ASSIGNED (compensation plans) [WITHHELD_CONFLICTING_OVERLAP]; N2#s1 = ASSIGNED (access-rights/role matrices) [WITHHELD_CONFLICTING_OVERLAP] \| N0#s1\|N1#s1 TOUCHING_SAME_ATOM; N0#s1\|N2#s1 DIFFERENT_ATOMS; N1#s1\|N2#s1 TOUCHING_SAME_ATOM \| distinctClassSet = [] | reproduced |
| TA-FU-C1 | FRAME-U same class: two touching SC-3 fragments of one atom -> one component, one contribution | N0#s1 = ASSIGNED (compensation plans) [COLLAPSED_SAME_CLASS_OVERLAP]; N1#s1 = ASSIGNED (compensation plans) [COLLAPSED_SAME_CLASS_OVERLAP] \| N0#s1\|N1#s1 TOUCHING_SAME_ATOM \| distinctClassSet = ['compensation plans'] | reproduced |
| TA-FU-DIS | FRAME-U member evidence disagrees: in one member the two cores are divided by a sentence end, in the other (where the earlier record's occurrence is a relocated copy after the body) no boundary lies between them -> fail closed for diversity (joined; conservative undercount) | N0#s1 = ASSIGNED (access-rights/role matrices) [WITHHELD_CONFLICTING_OVERLAP]; N1#s1 = ASSIGNED (compensation plans) [WITHHELD_CONFLICTING_OVERLAP] \| N0#s1\|N1#s1 TOUCHING_SAME_ATOM_IN_SOME_MEMBERS \| distinctClassSet = [] | reproduced |
| TA-FU-DIS-R | TA-FU-DIS with the member order reversed (the member that finds the sentence end first): still fail closed - the relation never takes the first member's answer | N0#s1 = ASSIGNED (access-rights/role matrices) [WITHHELD_CONFLICTING_OVERLAP]; N1#s1 = ASSIGNED (compensation plans) [WITHHELD_CONFLICTING_OVERLAP] \| N0#s1\|N1#s1 TOUCHING_SAME_ATOM_IN_SOME_MEMBERS \| distinctClassSet = [] | reproduced |
| TA-X2 | two underlying documents: fragments at the same positions of two different documents -> no touching-atom edge across documents | N0#s1 = ASSIGNED (access-rights/role matrices) [CLEAR_SINGLETON]; N1#s1 = ASSIGNED (compensation plans) [CLEAR_SINGLETON] \| no pair \| distinctClassSet = ['access-rights/role matrices', 'compensation plans'] | reproduced |
| TA-TWICE | identical text in two different sentences of one document, coded SC-3 and SC-7: text equality is not atom proof -> two count units | N0#s1 = ASSIGNED (compensation plans) [CLEAR_SINGLETON]; N1#s1 = ASSIGNED (access-rights/role matrices) [CLEAR_SINGLETON] \| N0#s1\|N1#s1 DIFFERENT_ATOMS \| distinctClassSet = ['access-rights/role matrices', 'compensation plans'] | reproduced |
| TA-EVID-1 | CLOSED PARITY (was a disclosure): two records split one sentence right after an abbreviation's period ('... Acme Inc. under which ...'); the lowercase continuation proves no sentence boundary (LOWERCASE_CONTINUATION_AFTER_ATERM) -> TOUCHING_SAME_ATOM, one conflicting component, nothing contributed | N0#s1 = ASSIGNED (access-rights/role matrices) [WITHHELD_CONFLICTING_OVERLAP]; N1#s1 = ASSIGNED (compensation plans) [WITHHELD_CONFLICTING_OVERLAP] \| N0#s1\|N1#s1 TOUCHING_SAME_ATOM \| distinctClassSet = [] | reproduced |
| TA-EVID-1S | CLOSED PARITY (was a disclosure): ONE record declares SENTENCE at the same abbreviation; the corrected SENTENCE evidence does not prove it (a lowercase continuation) -> the record is rejected (SEPARATOR_EVIDENCE_FAILED), the same decision as TA-EVID-1's junction | rejected: SEPARATOR_EVIDENCE_FAILED | reproduced |

## 18. `R-DUP` AND `R-EQV` (unchanged; F-04 preserved; MV-DUP-1; MV-VAL)

underlyingDocumentIdentity is resolved by collecting ALL available identity evidence for each artifact pair and testing it for CONSISTENCY. A first-fully-determined-axis precedence that lets a weak key suppress contradictory evidence is removed. The rendition equivalence test is EXECUTABLE and its parameters are declared in boundaryModel.duplicateIdentity.renditionEquivalenceTest.parameters.

| Link class | Members |
|---|---|
| authoritative | exact byte-digest equality of the preserved artifact bytes; shared filing accession number together with the same primary-document or exhibit identifier; identical archive capture identity (host + capture timestamp + URL path) |
| corroborative | same issuer-native document identifier (named report + period + part), admitted only where the rendition-equivalence test passes or where the part identifier is decisive; package-scoped registry equivalence, admitted only when registry-file digest, sourceId, title, publication date and artifact digest or byte size all agree |
| neverSufficient | same title and period alone; same publisher alone; same URL path alone without a capture identity; a sourceId string across packages |

*Split evidence.* an amendment, revision, correction, restatement or superseding-filing marker; a distinct version or edition identifier; a materially different content that the rendition-equivalence test cannot explain and that no version marker explains

1. Exact byte-digest equality is strong evidence of identical artifact bytes and establishes one underlying document.
2. Shared filing accession plus exact primary-document or exhibit identity establishes one underlying document across different byte renditions, provided no amendment or version conflict is present.
3. Same title and period is NEVER sufficient to merge.
4. An amendment, revision, correction, superseding filing or materially different version identity prevents automatic merge.
5. Different bytes do NOT automatically mean different underlying documents; HTML/PDF/text renditions may be equivalent.
6. Identical bytes across different hosts MAY establish the same underlying documentary content, and do so.
7. Different capture timestamps of one webpage: identical bytes or a verified content-equivalent snapshot are the same underlying documentary content; materially different content is a different document; unresolved equivalence fails closed.
8. sourceId is package-scoped and establishes no cross-package identity.
9. If identity evidence conflicts, a higher-ranked weak key may NOT suppress the contradictory evidence: the state is DUPLICATE_IDENTITY_UNRESOLVED.
10. Duplicate grouping affects anti-inflation ONLY. It never erases lawfully distinct source classes carried by separate bounded supplying segments.

| Link rule | Class | Fields equal and non-null | Gate |
|---|---|---|---|
| ARTIFACT_DIGEST_EQUALITY | authoritative | sha256 | - |
| SHARED_FILING_ACCESSION_AND_EXHIBIT_IDENTITY | authoritative | accession, exhibitId | - |
| SAME_CAPTURE_IDENTITY | authoritative | captureIdentity | - |
| ISSUER_NATIVE_DOCUMENT_IDENTIFIER | corroborative | issuerNativeId | - |
| REGISTRY_EQUIVALENCE_IDENTITY | corroborative | registryIdentity | PACKAGE_SCOPED |

| Never sufficient | Fields |
|---|---|
| TITLE_AND_PERIOD_ONLY | title, period |

| Candidate rule (not a link) | Derived key | Meaning |
|---|---|---|
| SAME_WEBPAGE_CANDIDATE | `{"from": "captureIdentity", "pattern": "^[^\|]+\\\|[0-9]+\\\|(.+)$", "group": 1}` | two archive captures whose capture identities (host\|timestamp\|URL) carry the same captured URL are CANDIDATES for same-page content-equivalence evaluation (principle 7). A candidate is not a positive identity link: a shared URL never merges by itself (CORR1 neverSufficient: same URL path alone without a capture identity). The captured URL is read from the capture identity; no identity field is added. |

A candidate admits a pair with no positive link to rendition-equivalence evaluation; only verified content equivalence merges it. Candidate + EQUIVALENT -> the same underlying documentary content; candidate + DIVERGENT -> different documents (materially different content is a different document); candidate + UNRESOLVED -> fails closed. Split evidence and conflict detection keep their precedence over every candidate step.

| Split rule | Test |
|---|---|
| AMENDMENT_OR_VERSION_MARKER | `{"truthinessDiffers": "amendmentMarker"}` |
| DISTINCT_VERSION_IDENTIFIER | `{"bothNonNullAndDiffer": "versionId"}` |

**Ordered decision procedure - conflict detection first.**

| Step | Condition | Machine condition | Result | State | Basis |
|---|---|---|---|---|---|
| 1 | POSITIVE_LINK_AND_SPLIT | `{"allOf": [{"hasPositiveLink": true}, {"hasSplit": true}]}` | UNRESOLVED | DUPLICATE_IDENTITY_UNRESOLVED | positive identity evidence conflicts with amendment/revision/version evidence; conflict detection precedes every merge or split branch (principle 9) |
| 2 | DIGEST_EQUALITY | `{"linkPresent": "ARTIFACT_DIGEST_EQUALITY"}` | RESOLVED | SAME_UNDERLYING_DOCUMENT | exact byte-digest equality with no split evidence (principle 1) |
| 3 | SPLIT_ONLY | `{"allOf": [{"hasSplit": true}, {"hasPositiveLink": false}]}` | RESOLVED | DIFFERENT_DOCUMENTS | split evidence with no positive identity link (principle 4) |
| 4 | NO_POSITIVE_LINK_NO_CANDIDATE | `{"allOf": [{"hasPositiveLink": false}, {"hasCandidate": false}]}` | RESOLVED | DIFFERENT_DOCUMENTS | no positive identity link and no same-webpage candidate; title and period are never sufficient (principle 3) |
| 5 | CANDIDATE_REQV_EQUIVALENT | `{"allOf": [{"hasPositiveLink": false}, {"hasCandidate": true}, {"equivalence": "equivalent"}]}` | RESOLVED | SAME_UNDERLYING_DOCUMENT | captures of one webpage with verified content-equivalent canonical renditions (principle 7) |
| 6 | CANDIDATE_REQV_DIVERGENT | `{"allOf": [{"hasPositiveLink": false}, {"hasCandidate": true}, {"equivalence": "divergent"}]}` | RESOLVED | DIFFERENT_DOCUMENTS | captures of one webpage with materially different content are different documents (principle 7) |
| 7 | CANDIDATE_REQV_UNRESOLVED | `{"allOf": [{"hasPositiveLink": false}, {"hasCandidate": true}, {"equivalence": "unresolved"}]}` | UNRESOLVED | DUPLICATE_IDENTITY_UNRESOLVED | captures of one webpage whose equivalence cannot be evaluated fail closed (principle 7) |
| 8 | REQV_EQUIVALENT | `{"equivalence": "equivalent"}` | RESOLVED | SAME_UNDERLYING_DOCUMENT | positive link and equal canonical rendition texts (principles 2 and 5) |
| 9 | REQV_DIVERGENT | `{"equivalence": "divergent"}` | UNRESOLVED | DUPLICATE_IDENTITY_UNRESOLVED | positive link contradicted by substantive divergence (R-EQV E-4) |
| 10 | REQV_UNRESOLVED | `{"equivalence": "unresolved"}` | UNRESOLVED | DUPLICATE_IDENTITY_UNRESOLVED | a rendition text is unavailable (R-EQV E-5) |

Group identity: a resolved duplicate group's underlyingDocumentIdentity is the lexicographically smallest 'SHA256:<digest>' of its member artifacts. an artifact whose duplicate group is unresolved receives the identity 'UNRESOLVED:<artifactId>', so no identity string is ever shared across an unresolved boundary; such an artifact contributes nothing to srcDiv

| R-EQV parameter | Value |
|---|---|
| serializationDifferencePermitted | `true` |
| substantiveDivergenceBlocks | `true` |
| renditionOnlyArtifactsRemoved | `["markup_tags", "html_entities", "page_number_lines", "running_header_footer", "line_break_hyphenation", "whitespace_runs", "letter_case"]` |
| amendmentOverridesRenditionEquivalence | `true` |
| indistinguishableReturns | `"DUPLICATE_IDENTITY_UNRESOLVED"` |
| similarityThreshold | `null` |

The canonical form of a text is the result of applying ops in order. renditionOnlyArtifactsRemoved MUST equal the set of artifactClass values present in ops; the interpreter applies ops and nothing else. An extraction recipe may declare preservedArtifactClasses (markup that IS the documentary content); those ops are skipped for text bound under that recipe and for no other purpose.

| # | Artifact class | Operation |
|---|---|---|
| 1 | markup_tags | `{"op": "regex", "pattern": "<[^>]+>", "flags": [], "repl": " "}` |
| 2 | html_entities | `{"op": "regex", "pattern": "&nbsp;\|&#160;\|&#xa0;", "flags": ["I"], "repl": " "}` |
| 3 | html_entities | `{"op": "regex", "pattern": "&amp;", "flags": ["I"], "repl": "&"}` |
| 4 | html_entities | `{"op": "regex", "pattern": "&[a-z]+;\|&#\\d+;", "flags": ["I"], "repl": " "}` |
| 5 | page_number_lines | `{"op": "regex", "pattern": "^\\s*\\d+\\s*$", "flags": ["M"], "repl": " "}` |
| 6 | running_header_footer | `{"op": "regex", "pattern": "^\\s*page\\s+\\d+(\\s+of\\s+\\d+)?\\s*$", "flags": ["I", "M"], "repl": " "}` |
| 7 | line_break_hyphenation | `{"op": "regex", "pattern": "-\\s*\\n\\s*", "flags": [], "repl": ""}` |
| 8 | whitespace_runs | `{"op": "regex", "pattern": "\\s+", "flags": [], "repl": " "}` |
| 9 | whitespace_runs | `{"op": "strip"}` |
| 10 | letter_case | `{"op": "casefold"}` |

*R-EQV steps.* E-1 Canonicalize each artifact to a text token stream: strip markup, decode entities, normalize whitespace and case. E-2 The renditions are content-equivalent iff the canonical token streams are identical after removing rendition-only artifacts (page furniture, page numbers, running headers and footers, navigation chrome, formatting marks, hyphenation at line breaks, footnote markers). E-3 If E-2 holds, the renditions are ONE underlying document. E-4 If the difference includes substantive content, the renditions are DIFFERENT documents where a version marker explains the difference, and CONFLICTED (DUPLICATE_IDENTITY_UNRESOLVED) where none does. E-5 If either artifact cannot be canonicalized, the equivalence is UNRESOLVED and the state fails closed.

*Forbidden assertions.* HTML and PDF are always different documents; HTML and PDF are always the same document; any byte difference is a different document; any byte difference is the same document

| Fixture | Case | Computed | Declared expectation |
|---|---|---|---|
| DUP-1 | Exact mirrored bytes across two hosts | M-A~M-B = SAME_UNDERLYING_DOCUMENT | reproduced |
| DUP-2 | Same accession and exhibit, HTML and PDF renditions, equivalent content, no conflict | X-HTML~X-PDF = SAME_UNDERLYING_DOCUMENT | reproduced |
| DUP-3 | Same accession and exhibit, substantive content divergence | Y-HTML~Y-PDF = DUPLICATE_IDENTITY_UNRESOLVED | reproduced |
| DUP-4 | Original versus amendment with the same title and period, different bytes | AR-O~AR-A = DIFFERENT_DOCUMENTS | reproduced |
| DUP-5 | Same title and period, identical bytes | S-A~S-B = SAME_UNDERLYING_DOCUMENT | reproduced |
| DUP-6 | Byte-identical captures bind the same bounded segment; canonical segment identity converges | DUP-6-A#s1 = OUTSIDE_FROZEN_VOCABULARY; DUP-6-B#s1 = OUTSIDE_FROZEN_VOCABULARY; W-1~W-2 = SAME_UNDERLYING_DOCUMENT \| distinctClassSet = [] | reproduced |
| DUP-7 | The same package-local sourceId string in two different packages | PKG-A~PKG-B = DIFFERENT_DOCUMENTS | reproduced |
| DUP-8 | Identical digest plus an amendment marker | D-1~D-2 = DUPLICATE_IDENTITY_UNRESOLVED | reproduced |
| DUP-9 | Same accession and exhibit, different bytes, amendment marker | E-1~E-2 = DUPLICATE_IDENTITY_UNRESOLVED | reproduced |
| DUP-10 | Title and period only, even with canonically equal content | T-1~T-2 = DIFFERENT_DOCUMENTS | reproduced |

### 18.1 Equivalent captures of one webpage (IV1-F04-EQUIVALENT-CAPTURES, preserved)

| Fixture | Case | Computed | Declared expectation |
|---|---|---|---|
| WEB-1 | Two captures of one webpage, different bytes and timestamps, content-equivalent | WEB-1-A#s1 = OUTSIDE_FROZEN_VOCABULARY; WEB-1-B#s1 = OUTSIDE_FROZEN_VOCABULARY; WEB-A~WEB-B = SAME_UNDERLYING_DOCUMENT \| distinctClassSet = [] | reproduced |
| WEB-2 | Same URL, materially divergent content: a shared URL never merges | WEB-A~WEB-C = DIFFERENT_DOCUMENTS | reproduced |
| WEB-3 | Same webpage, one capture's content unavailable: fails closed | WEB-A~WEB-U = DUPLICATE_IDENTITY_UNRESOLVED | reproduced |
| WEB-4 | Content-equivalent captures of DIFFERENT captured URLs: no candidate, no merge | WEB-A~WEB-D = DIFFERENT_DOCUMENTS | reproduced |
| WEB-5 | Same webpage, equivalent content, conflicting version identifiers: split evidence keeps precedence | WEB-V1~WEB-V2 = DIFFERENT_DOCUMENTS | reproduced |
| WEB-6 | Same title and period, different pages: title and period never merge | WEB-X1~WEB-X2 = DIFFERENT_DOCUMENTS | reproduced |

## 19. `R-FAIL` - FAIL-CLOSED BEHAVIOUR

sourceClassAssignmentState is NOT a tenth class. It lives outside the nine-label vocabulary, is machine-checkable, and only ASSIGNED on a resolved document can ever enter the distinct-class set. No non-ASSIGNED state is counterevidence, becomes a fallback class, or erases the Stage-1 fact.

- NOT_DETERMINABLE -> ASSIGNED requires: a resolvable bounded segment locator AND the segment's content inspected AND exactly one predicate satisfied
- OUTSIDE_FROZEN_VOCABULARY -> ASSIGNED requires new evidence showing the segment's function is within one of the nine; re-reading the same segment is not new evidence
- MULTIPLE_CLASS_PREDICATES_SATISFIED -> ASSIGNED requires an explicit R-SEG-B boundary in the record isolating one predicate
- DUPLICATE_IDENTITY_UNRESOLVED -> ASSIGNED requires resolving identity under the R-DUP consistency model

## 20. DETERMINISTIC DECISION PROCEDURE

```text
STEP 1  Resolve the physical source artifact from the sealed Stage-1 registry record (digest verified) and bind every unit of the supplying basis (R-BASIS) to an exact span of the recipe-extracted text. A basis that cannot be bound -> NOT_DETERMINABLE, stop. No locator is invented.
STEP 2  Resolve underlyingDocumentIdentity under R-DUP: conflict detection first, then the ordered decision procedure. Unresolved or conflicted -> DUPLICATE_IDENTITY_UNRESOLVED, stop.
STEP 3  Verify every declared separator against its physical evidence rule; a coder-invented boundary rejects the record.
STEP 4  Form indivisible segments: a new segment starts only at a lawful separator; a unit marked NONE joins the previous unit. Segmentation is attempted ONCE.
STEP 5  Derive each segment's feature record from the witnessed assertions of its units only; merge under featureMerge; apply feature defaults; reject evidence that violates a feature constraint.
STEP 6  Evaluate ALL NINE predicates over the segment's feature record, strictly against components and exclusions. No ordering, no short-circuit, no preference, no narrower-quotation tie-break.
STEP 7  Per segment: 1 satisfied -> ASSIGNED; 0 satisfied -> OUTSIDE_FROZEN_VOCABULARY (bound content) or NOT_DETERMINABLE (unbound content); >=2 satisfied -> MULTIPLE_CLASS_PREDICATES_SATISFIED.
STEP 8  Compute canonicalSegmentIdentity (CSI-v6) from the document identity and the segment's documentary occurrence in a frame every rendition is proven to share: its interval in the equal complete views (FRAME-C), or its content skeleton under the key-level uniqueness guard (FRAME-U). Where neither establishes it, or the occurrence is a text-bearing removal seam, the segment takes DUPLICATE_IDENTITY_UNRESOLVED and carries no identity. Rank, counts, content hash, context, locators and headings are diagnostics only. A supplied CSI is never trusted.
STEP 9  Edge-level assignment (R-EDGE): separable support records of different classes are SEPARATE CORR4 section I edges, each with its own singular sourceClass.
STEP 10 Compute the srcDiv distinct-class set by R-COUNT over (underlyingDocumentIdentity, canonicalSegmentIdentity), with the B-2 basis-overlap anti-inflation of R-COUNT step 5b: overlapping unequal supplying segments, and touching or gapped fragments of one indivisible atom, that are not lawfully separate form one basis count component, which contributes its single class once or nothing.
```

## 21. AUTHORITATIVE CONSUMER / CAUSAL EFFECT

```text
source record / supplying segment
  -> sourceClass assignment (this contract, computed by the interpreter)
  -> CORR4 section I edge.sourceClass
  -> CORR4 section F.3 srcDiv
  -> TT-SFPSFJ-DOC target-state completion
```

Success: lawfully ASSIGNED supporting edges enter the distinct-class set; srcDiv holds iff at least two distinct classes remain after anti-inflation grouping. Failure: every non-ASSIGNED state and every unresolved identity contributes nothing; srcDiv failure keeps TT-SFPSFJ-DOC at TARGET_NOT_ESTABLISHED_WITHIN_BOUND, never FALSE. No Environment determination is executed by this contract. Environment determination remains HEDC's downstream act.

## 22. SEMANTIC DELTA (CORR4 base -> A+ parent and A+ parent -> R7 parent, carried; R7 parent -> this closure)

The parent -> implementation delta is confined to the occurrence-anchoring surface: canonicalSegmentIdentity (CSI-v6), the new occurrenceAnchoring section (OA-1 .. OA-14), decision step 8, the meaning of the non-counting state, one declared role on every extraction op, and the validator file name referenced by R-DUP / R-EQV. Every changed leaf carries one of the nine classes the implementation act permits; anything else would be a SCOPE_VIOLATION (check X-10). The two architecture corrections that followed the pause (OA-7(b) per occurrence, OA-14) are classified A_PLUS_FRAME_C_IDENTITY and A_PLUS_FAIL_CLOSED respectively.

This closure's delta (A+ parent -> child) is confined to the R-7 count surface: the new basisOverlap section, the R-COUNT binding (step 5b, the step-6 pointer, one counting disposition, one layer pointer, one consequence), decision step 10, the model id and the validator file name. Every changed leaf carries one of the six classes the act permits (check B2-2); the Option A+ delta is carried unchanged (check X-10).

This closure's delta (R7 parent -> child) is confined to the touching-atom surface: basisOverlap.touchingAtom, the clear-singleton wording, R-COUNT step 5b, the B-2 disposition's fires / cannotFire, one consequence, decision step 10, the model id and the validator file name. Every changed leaf carries one of the four classes the act permits (check TA-2).

This correction's delta (touching-atom parent -> child) is confined to the SENTENCE evidence's continuation guard, the model id and the validator file name; every changed leaf carries SE_SENTENCE_ATERM_CONTINUATION_GUARD or MECHANICAL_REQUIRED (check SE-2).

This correction's delta (sentence-evidence parent -> child) is confined to the SENTENCE evidence's documentaryInterval and entityNameVeto, the whenNotAdjacent wording, the model id and the validator file name; every changed leaf carries BI_M1_DOCUMENTARY_INTERVAL, BI_M2_ENTITY_NAME_VETO or MECHANICAL_REQUIRED (check BI-2).

CORR1 adds the continuation-guard leaves asciiDigitContinuation, rule and unchanged (CORR1_IV1_F1_ASCII_DIGIT_CONTINUATION) and betweenPattern (CORR1_IV1_F2_RIGHT_DOUBLE_QUOTATION_MARK_CLOSER) to the sentence-evidence parent -> child delta (check BI-2).

**CORR4 base -> A+ parent leaf delta, carried unchanged** (recomputed by check X-10 from the two frozen models; the child equals the A+ parent on every one of these leaves except the model id and the validator file name). The only classes permitted are `A_PLUS_ORIGIN_TRACKED_REPLAY`, `A_PLUS_OP_ROLE_DECLARATION`, `A_PLUS_COMPLETE_VIEW`, `A_PLUS_FRAME_C_IDENTITY`, `A_PLUS_FRAME_U_GUARD`, `A_PLUS_TEXT_BEARING_SEAM`, `A_PLUS_CSI_V6`, `A_PLUS_FAIL_CLOSED`, `MECHANICAL_REQUIRED`.

| Class | Leaves |
|---|---|
| A_PLUS_ORIGIN_TRACKED_REPLAY | 3 |
| A_PLUS_OP_ROLE_DECLARATION | 18 |
| A_PLUS_COMPLETE_VIEW | 346 |
| A_PLUS_FRAME_C_IDENTITY | 43 |
| A_PLUS_FRAME_U_GUARD | 22 |
| A_PLUS_TEXT_BEARING_SEAM | 24 |
| A_PLUS_CSI_V6 | 125 |
| A_PLUS_FAIL_CLOSED | 68 |
| MECHANICAL_REQUIRED | 14 |

| Classification rule (model path prefix) | Class | Reason |
|---|---|---|
| $.id | MECHANICAL_REQUIRED | model id rename |
| $.rules.R-DUP.implementedIn | MECHANICAL_REQUIRED | validator file name |
| $.rules.R-DUP.renditionEquivalenceTest.implementedIn | MECHANICAL_REQUIRED | validator file name |
| $.evidenceBinding.extractionRecipes.*.ops[*].role | A_PLUS_OP_ROLE_DECLARATION | one declared role on every extraction op (OA-5) |
| $.states.definitions[4].meaning | A_PLUS_FAIL_CLOSED | the non-counting state names the new identity surface (OA-10) |
| $.decisionProcedure[7] | A_PLUS_CSI_V6 | decision step 8 computes CSI-v6 |
| $.canonicalSegmentIdentity | A_PLUS_CSI_V6 | CSI-v5 key and proofs replaced by the CSI-v6 key (OA-11, OA-12, OA-13); the CSI-v5 proofs retained as removed history |
| $.canonicalSegmentIdentity.whenNotEstablished | A_PLUS_FAIL_CLOSED | fail closed with no identity (OA-10) |
| $.occurrenceAnchoring.id | MECHANICAL_REQUIRED | section id |
| $.occurrenceAnchoring.architecture | MECHANICAL_REQUIRED | architecture reference |
| $.occurrenceAnchoring.principles | A_PLUS_FRAME_C_IDENTITY | principles of the shared frames (P1-P5) |
| $.occurrenceAnchoring.members | A_PLUS_FAIL_CLOSED | OA-1 |
| $.occurrenceAnchoring.originTrackedReplay | A_PLUS_ORIGIN_TRACKED_REPLAY | OA-2 |
| $.occurrenceAnchoring.opRoles | A_PLUS_OP_ROLE_DECLARATION | OA-5 role vocabulary |
| $.occurrenceAnchoring.anchorSource | A_PLUS_FRAME_C_IDENTITY | OA-3 anchor source and skeleton |
| $.occurrenceAnchoring.completeView | A_PLUS_COMPLETE_VIEW | OA-4 |
| $.occurrenceAnchoring.removalViews | A_PLUS_TEXT_BEARING_SEAM | OA-5 removal views |
| $.occurrenceAnchoring.seam | A_PLUS_TEXT_BEARING_SEAM | R-3 text-bearing removal seam |
| $.occurrenceAnchoring.frameSelection | A_PLUS_FRAME_C_IDENTITY | OA-6 |
| $.occurrenceAnchoring.frameC | A_PLUS_FRAME_C_IDENTITY | OA-7 incl. OA-7(b) per occurrence (CORR1.CORR1) |
| $.occurrenceAnchoring.frameU | A_PLUS_FRAME_U_GUARD | OA-8 U1-U4 |
| $.occurrenceAnchoring.ownSeam | A_PLUS_TEXT_BEARING_SEAM | OA-9 |
| $.occurrenceAnchoring.failClosed | A_PLUS_FAIL_CLOSED | OA-10 reasons |
| $.occurrenceAnchoring.unplacedWitness | A_PLUS_FAIL_CLOSED | OA-14 (CORR1.CORR1.CORR1): withholds established identities through the existing unestablished path |
| $.occurrenceAnchoring.residualsCarried | MECHANICAL_REQUIRED | residual register text |

**Carried parent fixtures whose declared expectation changes** (evidence byte-equal; recomputed by check F-2; judged by the physical oracle where a physical label exists, check F-8):

| Fixture | Kind | Class | Why |
|---|---|---|---|
| CSI-2 | REPRESENTATION_ONLY | A_PLUS_CSI_V6 | the CSI-v5 representation named in the expectation no longer exists: the proof name (OC-1, OC-2, OC-4) becomes the frame that establishes the identity, and the occurrence rank is a diagnostic, not a key component; every state, class, count and identity relation is unchanged |
| RR4-C | REPRESENTATION_ONLY | A_PLUS_CSI_V6 | the CSI-v5 representation named in the expectation no longer exists: the proof name (OC-1, OC-2, OC-4) becomes the frame that establishes the identity, and the occurrence rank is a diagnostic, not a key component; every state, class, count and identity relation is unchanged |
| RR4-D | REPRESENTATION_ONLY | A_PLUS_CSI_V6 | the CSI-v5 representation named in the expectation no longer exists: the proof name (OC-1, OC-2, OC-4) becomes the frame that establishes the identity, and the occurrence rank is a diagnostic, not a key component; every state, class, count and identity relation is unchanged |
| RR4-H | CORRESPONDENCE_NOW_PROVEN | A_PLUS_FRAME_C_IDENTITY | CSI-v5 could not relate the renditions' occurrences and failed closed; CSI-v6 establishes each occurrence in the complete view that every member shares (FRAME-C): records on one physical occurrence converge (a class conflict fires where the classes differ) and records on different physical occurrences stay distinct; judged by the physical oracle (check F-8) |
| RR4-I | CORRESPONDENCE_NOW_PROVEN | A_PLUS_FRAME_C_IDENTITY | CSI-v5 could not relate the renditions' occurrences and failed closed; CSI-v6 establishes each occurrence in the complete view that every member shares (FRAME-C): records on one physical occurrence converge (a class conflict fires where the classes differ) and records on different physical occurrences stay distinct; judged by the physical oracle (check F-8) |
| R17-A | REPRESENTATION_ONLY | A_PLUS_CSI_V6 | the CSI-v5 representation named in the expectation no longer exists: the proof name (OC-1, OC-2, OC-4) becomes the frame that establishes the identity, and the occurrence rank is a diagnostic, not a key component; every state, class, count and identity relation is unchanged |
| R17-A2 | REPRESENTATION_ONLY | A_PLUS_CSI_V6 | the CSI-v5 representation named in the expectation no longer exists: the proof name (OC-1, OC-2, OC-4) becomes the frame that establishes the identity, and the occurrence rank is a diagnostic, not a key component; every state, class, count and identity relation is unchanged |
| R17-B | REPRESENTATION_ONLY | A_PLUS_CSI_V6 | the CSI-v5 representation named in the expectation no longer exists: the proof name (OC-1, OC-2, OC-4) becomes the frame that establishes the identity, and the occurrence rank is a diagnostic, not a key component; every state, class, count and identity relation is unchanged |
| R17-C | REPRESENTATION_ONLY | A_PLUS_CSI_V6 | the CSI-v5 representation named in the expectation no longer exists: the proof name (OC-1, OC-2, OC-4) becomes the frame that establishes the identity, and the occurrence rank is a diagnostic, not a key component; every state, class, count and identity relation is unchanged |
| R17-C2 | CORRESPONDENCE_NOW_PROVEN | A_PLUS_FRAME_C_IDENTITY | CSI-v5 could not relate the renditions' occurrences and failed closed; CSI-v6 establishes each occurrence in the complete view that every member shares (FRAME-C): records on one physical occurrence converge (a class conflict fires where the classes differ) and records on different physical occurrences stay distinct; judged by the physical oracle (check F-8) |
| R17-D | CORRESPONDENCE_NOW_PROVEN | A_PLUS_FRAME_C_IDENTITY | CSI-v5 could not relate the renditions' occurrences and failed closed; CSI-v6 establishes each occurrence in the complete view that every member shares (FRAME-C): records on one physical occurrence converge (a class conflict fires where the classes differ) and records on different physical occurrences stay distinct; judged by the physical oracle (check F-8) |
| R17-D2 | CORRESPONDENCE_NOW_PROVEN | A_PLUS_FRAME_C_IDENTITY | CSI-v5 could not relate the renditions' occurrences and failed closed; CSI-v6 establishes each occurrence in the complete view that every member shares (FRAME-C): records on one physical occurrence converge (a class conflict fires where the classes differ) and records on different physical occurrences stay distinct; judged by the physical oracle (check F-8) |
| R17-D3 | CORRESPONDENCE_NOW_PROVEN | A_PLUS_FRAME_C_IDENTITY | CSI-v5 could not relate the renditions' occurrences and failed closed; CSI-v6 establishes each occurrence in the complete view that every member shares (FRAME-C): records on one physical occurrence converge (a class conflict fires where the classes differ) and records on different physical occurrences stay distinct; judged by the physical oracle (check F-8) |
| R17-E | REPRESENTATION_ONLY | A_PLUS_CSI_V6 | the CSI-v5 representation named in the expectation no longer exists: the proof name (OC-1, OC-2, OC-4) becomes the frame that establishes the identity, and the occurrence rank is a diagnostic, not a key component; every state, class, count and identity relation is unchanged |
| R17-F | REPRESENTATION_ONLY | A_PLUS_CSI_V6 | the CSI-v5 representation named in the expectation no longer exists: the proof name (OC-1, OC-2, OC-4) becomes the frame that establishes the identity, and the occurrence rank is a diagnostic, not a key component; every state, class, count and identity relation is unchanged |
| R17-G | REPRESENTATION_ONLY | A_PLUS_CSI_V6 | the CSI-v5 representation named in the expectation no longer exists: the proof name (OC-1, OC-2, OC-4) becomes the frame that establishes the identity, and the occurrence rank is a diagnostic, not a key component; every state, class, count and identity relation is unchanged |
| R17-H | CORRESPONDENCE_NOW_PROVEN | A_PLUS_FRAME_C_IDENTITY | CSI-v5 could not relate the renditions' occurrences and failed closed; CSI-v6 establishes each occurrence in the complete view that every member shares (FRAME-C): records on one physical occurrence converge (a class conflict fires where the classes differ) and records on different physical occurrences stay distinct; judged by the physical oracle (check F-8) |
| R17-J | REPRESENTATION_ONLY | A_PLUS_CSI_V6 | the CSI-v5 representation named in the expectation no longer exists: the proof name (OC-1, OC-2, OC-4) becomes the frame that establishes the identity, and the occurrence rank is a diagnostic, not a key component; every state, class, count and identity relation is unchanged |
| OC3-CODEX | CORRESPONDENCE_NOW_PROVEN | A_PLUS_FRAME_C_IDENTITY | CSI-v5 could not relate the renditions' occurrences and failed closed; CSI-v6 establishes each occurrence in the complete view that every member shares (FRAME-C): records on one physical occurrence converge (a class conflict fires where the classes differ) and records on different physical occurrences stay distinct; judged by the physical oracle (check F-8) |
| OC3-R1 | CORRESPONDENCE_NOW_PROVEN | A_PLUS_FRAME_C_IDENTITY | CSI-v5 could not relate the renditions' occurrences and failed closed; CSI-v6 establishes each occurrence in the complete view that every member shares (FRAME-C): records on one physical occurrence converge (a class conflict fires where the classes differ) and records on different physical occurrences stay distinct; judged by the physical oracle (check F-8) |
| OC3-R2 | CREATED_OCCURRENCE_NOW_SEAM_TAINTED | A_PLUS_TEXT_BEARING_SEAM | the created apparent occurrence is a text-bearing removal seam (R-3): it no longer converges with the genuine occurrence; the genuine occurrence counts on its own; judged by the physical oracle (check F-8) |
| OC3-R2b | CORRESPONDENCE_NOW_PROVEN | A_PLUS_FRAME_C_IDENTITY | CSI-v5 could not relate the renditions' occurrences and failed closed; CSI-v6 establishes each occurrence in the complete view that every member shares (FRAME-C): records on one physical occurrence converge (a class conflict fires where the classes differ) and records on different physical occurrences stay distinct; judged by the physical oracle (check F-8) |
| OC3-R3 | CORRESPONDENCE_NOW_PROVEN | A_PLUS_FRAME_C_IDENTITY | CSI-v5 could not relate the renditions' occurrences and failed closed; CSI-v6 establishes each occurrence in the complete view that every member shares (FRAME-C): records on one physical occurrence converge (a class conflict fires where the classes differ) and records on different physical occurrences stay distinct; judged by the physical oracle (check F-8) |
| OC3-R4 | CORRESPONDENCE_NOW_PROVEN | A_PLUS_FRAME_C_IDENTITY | CSI-v5 could not relate the renditions' occurrences and failed closed; CSI-v6 establishes each occurrence in the complete view that every member shares (FRAME-C): records on one physical occurrence converge (a class conflict fires where the classes differ) and records on different physical occurrences stay distinct; judged by the physical oracle (check F-8) |
| OC3-R5 | CORRESPONDENCE_NOW_PROVEN | A_PLUS_FRAME_C_IDENTITY | CSI-v5 could not relate the renditions' occurrences and failed closed; CSI-v6 establishes each occurrence in the complete view that every member shares (FRAME-C): records on one physical occurrence converge (a class conflict fires where the classes differ) and records on different physical occurrences stay distinct; judged by the physical oracle (check F-8) |
| OC3-R6 | CORRESPONDENCE_NOW_PROVEN | A_PLUS_FRAME_C_IDENTITY | CSI-v5 could not relate the renditions' occurrences and failed closed; CSI-v6 establishes each occurrence in the complete view that every member shares (FRAME-C): records on one physical occurrence converge (a class conflict fires where the classes differ) and records on different physical occurrences stay distinct; judged by the physical oracle (check F-8) |
| OC3-R7 | REPRESENTATION_ONLY | A_PLUS_CSI_V6 | the CSI-v5 representation named in the expectation no longer exists: the proof name (OC-1, OC-2, OC-4) becomes the frame that establishes the identity, and the occurrence rank is a diagnostic, not a key component; every state, class, count and identity relation is unchanged |
| OC3-R7b | REPRESENTATION_ONLY | A_PLUS_CSI_V6 | the CSI-v5 representation named in the expectation no longer exists: the proof name (OC-1, OC-2, OC-4) becomes the frame that establishes the identity, and the occurrence rank is a diagnostic, not a key component; every state, class, count and identity relation is unchanged |
| OC3-R8 | REPRESENTATION_ONLY | A_PLUS_CSI_V6 | the CSI-v5 representation named in the expectation no longer exists: the proof name (OC-1, OC-2, OC-4) becomes the frame that establishes the identity, and the occurrence rank is a diagnostic, not a key component; every state, class, count and identity relation is unchanged |
| OC3-KL1 | CREATED_OCCURRENCE_NOW_SEAM_TAINTED | A_PLUS_TEXT_BEARING_SEAM | the created apparent occurrence is a text-bearing removal seam (R-3): it no longer converges with the genuine occurrence; the genuine occurrence counts on its own; judged by the physical oracle (check F-8) |

| Fixture | Case | Computed | Declared expectation |
|---|---|---|---|
| SCOPE-1 | Invitation that also fixes binding membership terms, one sentence (X1-a presence, as CORR1) | s1 = ASSIGNED (contracts/participation terms) \| distinctClassSet = ['contracts/participation terms'] | reproduced |
| SCOPE-2 | Participation fee plus referral credit, one sentence (X2-a presence, as CORR1) | s1 = ASSIGNED (compensation plans) \| distinctClassSet = ['compensation plans'] | reproduced |

**A+ parent -> R7 parent leaf delta, carried unchanged** (recomputed by check B2-2 from the two frozen models and equal to the R7 parent's own ledger). Every changed leaf lies on the R-7 count surface; the only classes permitted are `R7_B2_OVERLAP_FOOTPRINT`, `R7_B2_SUPPORT_CORE`, `R7_B2_LAWFUL_SEPARATION`, `R7_B2_COMPONENT_ANTI_INFLATION`, `R7_B2_COUNT_FAIL_CLOSED`, `MECHANICAL_REQUIRED`.

| Class | Leaves |
|---|---|
| R7_B2_OVERLAP_FOOTPRINT | 20 |
| R7_B2_SUPPORT_CORE | 9 |
| R7_B2_LAWFUL_SEPARATION | 27 |
| R7_B2_COMPONENT_ANTI_INFLATION | 62 |
| R7_B2_COUNT_FAIL_CLOSED | 18 |
| MECHANICAL_REQUIRED | 5 |

**Sentence-evidence parent -> this closure leaf delta** (recomputed by check BI-2). Every changed leaf is the SENTENCE evidence's documentary interval or entity-name veto, the whenNotAdjacent wording, the model id or the validator file name; the only classes permitted are `BI_M1_DOCUMENTARY_INTERVAL`, `BI_M2_ENTITY_NAME_VETO`, `CORR1_IV1_F1_ASCII_DIGIT_CONTINUATION`, `CORR1_IV1_F2_RIGHT_DOUBLE_QUOTATION_MARK_CLOSER`, `MECHANICAL_REQUIRED` (anything else is SCOPE_VIOLATION).

| Class | Leaves |
|---|---|
| BI_M1_DOCUMENTARY_INTERVAL | 16 |
| BI_M2_ENTITY_NAME_VETO | 55 |
| CORR1_IV1_F1_ASCII_DIGIT_CONTINUATION | 6 |
| CORR1_IV1_F2_RIGHT_DOUBLE_QUOTATION_MARK_CLOSER | 1 |
| MECHANICAL_REQUIRED | 5 |

| Classification rule (model path prefix) | Class | Reason |
|---|---|---|
| $.id | MECHANICAL_REQUIRED | model id rename |
| $.rules.R-DUP.implementedIn | MECHANICAL_REQUIRED | validator file name |
| $.rules.R-DUP.renditionEquivalenceTest.implementedIn | MECHANICAL_REQUIRED | validator file name |
| $.segmentation.separatorEvidence.whenNotAdjacent | BI_M1_DOCUMENTARY_INTERVAL | SENTENCE is excepted: it is verified on the documentary interval |
| $.segmentation.separatorEvidence.whenAdjacent.SENTENCE.documentaryInterval | BI_M1_DOCUMENTARY_INTERVAL | IV1-M1: the declaration verified on the actual interval |
| $.segmentation.separatorEvidence.whenAdjacent.SENTENCE.documentaryInterval.act | MECHANICAL_REQUIRED | act reference |
| $.segmentation.separatorEvidence.whenAdjacent.SENTENCE.entityNameVeto | BI_M2_ENTITY_NAME_VETO | IV1-M2 case A: the proven-span veto and its read-only authority binding |
| $.segmentation.separatorEvidence.whenAdjacent.SENTENCE.entityNameVeto.act | MECHANICAL_REQUIRED | act reference |
| $.segmentation.separatorEvidence.whenAdjacent.SENTENCE.continuationGuard.asciiDigitContinuation | CORR1_IV1_F1_ASCII_DIGIT_CONTINUATION | IV1-F1: an ASCII digit continuation is withheld as a lowercase one |
| $.segmentation.separatorEvidence.whenAdjacent.SENTENCE.continuationGuard.rule | CORR1_IV1_F1_ASCII_DIGIT_CONTINUATION | IV1-F1: the guard's rule wording names the digit continuation |
| $.segmentation.separatorEvidence.whenAdjacent.SENTENCE.continuationGuard.unchanged | CORR1_IV1_F1_ASCII_DIGIT_CONTINUATION | IV1-F1: a digit is no longer among the parent-evidence continuations |
| $.segmentation.separatorEvidence.whenAdjacent.SENTENCE.continuationGuard.betweenPattern | CORR1_IV1_F2_RIGHT_DOUBLE_QUOTATION_MARK_CLOSER | IV1-F2: U+201D a permitted closer of the continuation scan |

**Impact preflight of this closure** (recomputed by check BI-4): Every inherited surface evaluated under the parent's SENTENCE evidence (documentary interval and veto absent) and under this act's. The pilot, evaluated with the SEC entity-name authority candidate bound, is byte-identical to the parent's evaluation (records, segment records, assignment, state, CSI-v6, relations and proofs, components, distinctClassSet, srcDiv): pilot delta 0. On the 293 carried fixtures exactly SE-EVID-NA changes (the IV1-M1 construction itself, now rejected). On the CORR1 (8214), OA-7(b) (360), R-14, R-7, touching-atom and sentence-evidence generated surfaces no outcome changes; the veto fires nowhere outside the boundary-integrity constructions. M2 case B needs no change under the Owner decision.

| Surface | Evaluated | Outcome changed | Cases |
|---|---|---|---|
| pilot (61 segments; authority bound: 4 usable records, 288 spans) | 1 | 0 | veto fired 0; every non-adjacent declared SENTENCE proven on its interval |
| carried fixtures (293) | 293 | 1 | SE-EVID-NA (two classes, srcDiv true -> SEPARATOR_EVIDENCE_FAILED: the IV1-M1 construction) |
| CORR1 generated | 8214 | 0 | - |
| OA-7(b) generated | 360 | 0 | - |
| R-14 generated (record orders) | 1680 | 0 | - |
| R-7 generated (record orders) | 2335 | 0 | - |
| touching-atom generated (record orders) | 1482 | 0 | - |
| sentence-evidence generated (record orders) | 1172 | 0 | - |

| Pilot authority record | Binding |
|---|---|
| ART-01 | AUTHORITY_NOT_PROVEN |
| ART-02 | AUTHORITY_NOT_PROVEN |
| ART-03 | AUTHORITY_NOT_PROVEN |
| ART-04 | AUTHORITY_NOT_PROVEN |
| ART-05 | AUTHORITY_NOT_PROVEN |
| ART-06 | AUTHORITY_NOT_PROVEN |
| ART-07 | AUTHORITY_RECORD_USABLE |
| ART-08 | AUTHORITY_RECORD_USABLE |
| ART-09 | AUTHORITY_NOT_PROVEN |
| ART-10 | AUTHORITY_NOT_PROVEN |
| ART-11 | AUTHORITY_NOT_PROVEN |
| ART-12 | AUTHORITY_COORDINATE_VIEW_MISMATCH |
| ART-13 | AUTHORITY_RECORD_USABLE |
| ART-14 | AUTHORITY_NOT_PROVEN |
| ART-15 | AUTHORITY_NOT_PROVEN |
| ART-16 | AUTHORITY_NOT_PROVEN |
| ART-17 | AUTHORITY_NOT_PROVEN |
| ART-18 | AUTHORITY_NOT_PROVEN |
| ART-19 | AUTHORITY_NOT_PROVEN |
| ART-20 | AUTHORITY_NOT_PROVEN |
| ART-21 | AUTHORITY_NOT_PROVEN |
| ART-22 | AUTHORITY_NOT_PROVEN |
| ART-23 | AUTHORITY_RECORD_USABLE |

| Carried fixture | Class | Why its declared expectation changes |
|---|---|---|
| SE-EVID-NA | BI_M1_DOCUMENTARY_INTERVAL | IV1-M1 this act closes: the parent accepted the non-adjacent SENTENCE on 'intervening text exists' and counted both classes (['access-rights/role matrices', 'compensation plans']); the documentary interval proves no boundary, so the record is rejected (SEPARATOR_EVIDENCE_FAILED) |

**Touching-atom parent -> sentence-evidence parent leaf delta, carried** (recomputed by check SE-2). Every changed leaf is the SENTENCE evidence's continuation guard, the model id or the validator file name; the only classes permitted are `SE_SENTENCE_ATERM_CONTINUATION_GUARD`, `MECHANICAL_REQUIRED` (anything else is SCOPE_VIOLATION).

| Class | Leaves |
|---|---|
| SE_SENTENCE_ATERM_CONTINUATION_GUARD | 29 |
| MECHANICAL_REQUIRED | 4 |

| Classification rule (model path prefix) | Class | Reason |
|---|---|---|
| $.id | MECHANICAL_REQUIRED | model id rename |
| $.rules.R-DUP.implementedIn | MECHANICAL_REQUIRED | validator file name |
| $.rules.R-DUP.renditionEquivalenceTest.implementedIn | MECHANICAL_REQUIRED | validator file name |
| $.segmentation.separatorEvidence.whenAdjacent.SENTENCE.continuationGuard | SE_SENTENCE_ATERM_CONTINUATION_GUARD | the one decision: ambiguous terminal, closers and spacing, first cased letter, lowercase -> SENTENCE not proven, on both paths |
| $.segmentation.separatorEvidence.whenAdjacent.SENTENCE.continuationGuard.act | MECHANICAL_REQUIRED | act reference |

**Impact preflight of this closure** (act section 11; recomputed by check SE-4): The guard is consulted only where the parent's SENTENCE evidence has matched. On the pilot it withholds 4 SENTENCE matches inside the touching relation's evidence scan (abbreviations' full stops before a lowercase continuation: 'Inc.' x1, 'Ph.D.' x3), none of which decides a pair: the whole pilot evaluation equals the parent's (pilot delta 0: records, assignment, state, CSI-v6, segmentation, relations and their proofs, components, distinctClassSet, srcDiv). On the CORR1 (8214), OA-7(b) (360) and R-14 (560 x 3) generated surfaces it withholds a match in 32, 24 and 0 cases and changes no outcome (each evaluated again under the parent's evidence: the pair is still separated by other frozen evidence between the cores, or decided by the overlap test). On the 269 carried fixtures it withholds a SENTENCE match in 5 (R7-FU-2a, R7-FU-2b, TA-C2-B, TA-EVID-1, TA-EVID-1S) and changes the outcome of exactly TA-EVID-1 and TA-EVID-1S (the residual this act closes); in the other 3 the outcome is the parent's (other evidence decides, or there is no touching pair). On the R-7 and touching-atom generated surfaces it withholds a match in 12 and 68 record orders and changes the outcome of exactly the listed ones, each a relation label only (TOUCHING_SAME_ATOM_IN_SOME_MEMBERS -> TOUCHING_SAME_ATOM: in a FRAME-U arrangement one member places a relocated fragment after a final full stop and a paragraph break before a lowercase letter, which no longer proves a boundary): no count, component, disposition, state, identity or segmentation changes.

| Surface | Evaluated | Guard fired (SENTENCE match withheld) | Outcome changed | Cases (what changed) |
|---|---|---|---|---|
| pilot (61 segments) | 1 | 1 | 0 | 4 SENTENCE matches withheld inside the evidence scan ('Inc.' x1, 'Ph.D.' x3); none decides a pair: pilot delta 0 |
| A+ / R-7 / touching-atom fixtures (269) | 269 | 5 | 2 | TA-EVID-1 (DIFFERENT_ATOMS -> TOUCHING_SAME_ATOM; 2 classes -> 0; srcDiv true -> false), TA-EVID-1S (two count units -> SEPARATOR_EVIDENCE_FAILED); fired without an outcome change: R7-FU-2a, R7-FU-2b, TA-C2-B |
| CORR1 generated | 8214 | 32 | 0 | fired without an outcome change: attributeMarkupSeam (32 cases) |
| OA-7(b) generated | 360 | 24 | 0 | fired without an outcome change: G0010, G0017, G0041, G0049, G0074, G0077, G0080, G0104, G0116, G0122, G0190, G0200, G0215, G0239, G0251, G0254, G0263, G0268, G0298, G0308, G0310, G0329, G0355, G0358 |
| R-14 generated (560 cases x 3 orders) | 560 | 0 | 0 | - |
| R-7 generated (888 cases x 3 orders) | 888 | 12 | 4 | R7G-0882@01 (FRAME_U_DIFFERING; relation label), R7G-0882@10 (FRAME_U_DIFFERING; relation label), R7G-0883@01 (FRAME_U_DIFFERING; relation label), R7G-0883@10 (FRAME_U_DIFFERING; relation label) |
| touching-atom generated (727 cases x 3 orders) | 727 | 68 | 8 | TAG-0707@01 (FRAME_U_DIFFERING; relation label), TAG-0707@10 (FRAME_U_DIFFERING; relation label), TAG-0708@01 (FRAME_U_DIFFERING; relation label), TAG-0708@10 (FRAME_U_DIFFERING; relation label), TAG-0709@01 (FRAME_U_DIFFERING; relation label), TAG-0709@10 (FRAME_U_DIFFERING; relation label), TAG-0710@01 (FRAME_U_DIFFERING; relation label), TAG-0710@10 (FRAME_U_DIFFERING; relation label) |

| Carried fixture on which the guard fired | Why the outcome equals the parent's |
|---|---|
| R7-FU-2a | FRAME-U: the guard withholds the SENTENCE match at 'fees.' before a lowercase continuation in the member that holds the relocated copy; the keys overlap in the other member, and a FRAME-U relation that differs across members is treated as overlap (the R-7 rule), so there is no touching pair and the count is the parent's |
| R7-FU-2b | R7-FU-2a with the member order reversed: the same withheld match, the same overlap decision, the parent's count |
| TA-C2-B | the '.' after the clause number '2' before 'the' is no longer SENTENCE evidence, but the frozen NUMBERED_CLAUSE evidence (a clause number after whitespace) still proves the boundary: DIFFERENT_ATOMS, two count units, as under the parent |

| Carried touching-atom fixture | Class | Why its truth and declared expectation change |
|---|---|---|
| TA-EVID-1 | SE_SENTENCE_ATERM_CONTINUATION_GUARD | the residual TA-EVIDENCE-PARITY this act closes: the ABBR junction's full stop is followed by a lowercase letter, so the corrected SENTENCE evidence proves no boundary there; the two touching fragments are one atom (TOUCHING_SAME_ATOM): ['access-rights/role matrices', 'compensation plans'] -> [], srcDiv True -> False |
| TA-EVID-1S | SE_SENTENCE_ATERM_CONTINUATION_GUARD | the residual TA-EVIDENCE-PARITY this act closes: the ABBR junction's full stop is followed by a lowercase letter, so the corrected SENTENCE evidence proves no boundary there; the record's declared SENTENCE is rejected (SEPARATOR_EVIDENCE_FAILED) where the parent formed two count units (['access-rights/role matrices', 'compensation plans']) |

**R7 parent -> touching-atom parent leaf delta, carried** (recomputed by check TA-2). Every changed leaf lies on the touching-atom surface; the only classes permitted are `R7_TOUCHING_ATOM_RELATION`, `R7_TOUCHING_ATOM_COMPONENT_BINDING`, `R7_TOUCHING_ATOM_FAIL_CLOSED`, `MECHANICAL_REQUIRED` (anything else is SCOPE_VIOLATION). No Option A+, CSI-v6, OA, segmentation, R-DUP or sourceClass predicate leaf changes.

| Class | Leaves |
|---|---|
| R7_TOUCHING_ATOM_RELATION | 59 |
| R7_TOUCHING_ATOM_COMPONENT_BINDING | 11 |
| R7_TOUCHING_ATOM_FAIL_CLOSED | 34 |
| MECHANICAL_REQUIRED | 6 |

| Classification rule (model path prefix) | Class | Reason |
|---|---|---|
| $.id | MECHANICAL_REQUIRED | model id rename |
| $.rules.R-DUP.implementedIn | MECHANICAL_REQUIRED | validator file name |
| $.rules.R-DUP.renditionEquivalenceTest.implementedIn | MECHANICAL_REQUIRED | validator file name |
| $.basisOverlap.touchingAtom | R7_TOUCHING_ATOM_RELATION | the relation: edge, conditions, atom, junction, evidence, recorded boundaries, relations |
| $.basisOverlap.touchingAtom.act | MECHANICAL_REQUIRED | act reference |
| $.basisOverlap.touchingAtom.closes | MECHANICAL_REQUIRED | residual register reference |
| $.basisOverlap.touchingAtom.residualClosed | MECHANICAL_REQUIRED | residual register reference |
| $.basisOverlap.touchingAtom.application | R7_TOUCHING_ATOM_COMPONENT_BINDING | edge eligibility in the existing graph |
| $.basisOverlap.touchingAtom.componentBinding | R7_TOUCHING_ATOM_COMPONENT_BINDING | the shared B-2 components |
| $.basisOverlap.touchingAtom.componentBindingRule | R7_TOUCHING_ATOM_COMPONENT_BINDING | no second component algorithm |
| $.basisOverlap.touchingAtom.recording | R7_TOUCHING_ATOM_COMPONENT_BINDING | count-block recording of the relation |
| $.basisOverlap.touchingAtom.members | R7_TOUCHING_ATOM_FAIL_CLOSED | any member finding no boundary fails closed for diversity |
| $.basisOverlap.touchingAtom.junctionEvidence.notEvidenced | R7_TOUCHING_ATOM_FAIL_CLOSED | a line feed or intervening text never proves a boundary |
| $.basisOverlap.touchingAtom.junctionEvidence.notABoundary | R7_TOUCHING_ATOM_FAIL_CLOSED | non-lawful delimiters |
| $.basisOverlap.touchingAtom.undercount | R7_TOUCHING_ATOM_FAIL_CLOSED | accepted conservative undercount |
| $.basisOverlap.touchingAtom.forbidden | R7_TOUCHING_ATOM_FAIL_CLOSED | forbidden broadenings |
| $.basisOverlap.dispositions["CLEAR_SINGLETON"].when | R7_TOUCHING_ATOM_COMPONENT_BINDING | a clear singleton also shares no atom with another group |
| $.rules.R-COUNT.steps[5] | R7_TOUCHING_ATOM_RELATION | step 5b names the one additional edge |
| $.rules.R-COUNT.countingDispositions["B2_OVERLAP_CLASS_CONFLICT"] | R7_TOUCHING_ATOM_COMPONENT_BINDING | B2_OVERLAP_CLASS_CONFLICT can fire through a touching-atom edge |
| $.rules.R-COUNT.consequences | R7_TOUCHING_ATOM_COMPONENT_BINDING | one consequence: fragments of one atom are one basis |
| $.decisionProcedure[9] | R7_TOUCHING_ATOM_RELATION | decision step 10 names the touching fragments |

**Impact preflight** (act section 14; recomputed by check TA-4): the count with the touching relation against the count without it (the R7 parent's), surface by surface.

| Surface | Evaluated | Count deltas | Cases |
|---|---|---|---|
| pilot (61 segments) | 1 | 0 | - |
| A+ fixtures (206; 4 error fixtures reject identically) | 202 | 0 | - |
| R-7 fixtures (26) | 26 | 2 | R7-RES-1, R7-RES-1M |
| CORR1 generated | 8214 | 0 | - |
| OA-7(b) generated | 360 | 0 | - |
| R-14 generated (560 cases) | 560 | 0 | - |
| R-7 generated (888 cases x 3 orders) | 888 | 21 | R7G-0004 (MIXED_C1), R7G-0005 (MIXED_C1), R7G-0035 (MIXED_C1), R7G-0067 (MIXED_C2), R7G-0068 (MIXED_C2), R7G-0098 (MIXED_C2), R7G-0130 (MIXED_U), R7G-0131 (MIXED_U), R7G-0161 (MIXED_U), R7G-0228 (STACKED_C2), R7G-0229 (STACKED_C2), R7G-0254 (STACKED_C2), R7G-0260 (STACKED_C2), R7G-0603 (DIVIDED_COMMA), R7G-0638 (DIVIDED_CONJ), R7G-0673 (DIVIDED_WRAP), R7G-0743 (LAWFUL_ROWS), R7G-0760 (LAWFUL_ROWS), R7G-0761 (LAWFUL_ROWS), R7G-0882 (FRAME_U_DIFFERING), R7G-0883 (FRAME_U_DIFFERING) |

The touching relation changes no count on the pilot, the 206 A+ fixtures and the CORR1 (8214), OA-7(b) (360) and R-14 (560 x 3) generated surfaces; on the carried R-7 fixtures it changes exactly R7-RES-1 and R7-RES-1M, and on the R-7 generated surface exactly the listed touching cases: 18 of them are touching fragments of one sentence (the R7-RES-1 surface: MIXED, STACKED, comma / conjunction / line-wrap divisions, FRAME-U), 3 are touching table rows with no terminal and no recorded row boundary (R7G-0743 / 0760 / 0761: joined and withheld - the accepted undercount TA-UNDERCOUNT, their line feed being a line wrap's line feed too). Every delta withholds or collapses; none adds a class. Assignment, state, identity and segmentation deltas: 0 on every surface.

| Carried R7 fixture | Class | Why the declared expectation changes |
|---|---|---|
| R7-RES-1 | R7_TOUCHING_ATOM_COMPONENT_BINDING | the residual R7-RES-1 this act closes: the two touching fragments of one indivisible sentence are one component (TOUCHING_SAME_ATOM) that contributes nothing; the parent expected both classes counted (['access-rights/role matrices', 'compensation plans'] -> []) |
| R7-RES-1M | R7_TOUCHING_ATOM_COMPONENT_BINDING | the residual R7-RES-1 this act closes: the two touching fragments of one indivisible sentence are one component (TOUCHING_SAME_ATOM) that contributes nothing; the parent expected both classes counted (['access-rights/role matrices', 'compensation plans'] -> []) |

## 23. FREEZE EVIDENCE

| Claim | Status |
|---|---|
| HASH_BINDING | PROVEN - the replay records SHA-256 of the contract, rules and schema and the validator recomputes them (R-10) |
| TEMPORAL_HISTORY | AUTHOR-REPORTED - no independent immutable event log exists; filesystem mtimes are not evidence and no PASS depends on them |

## 24. SCOPE BOUNDARY, PRIOR CLOSURES AND RESIDUAL RISKS

Not done by this act: no Git add, commit or push; no production wiring; no live SEC retrieval; no company resolver change; no modification of the authority candidate; no new authority acquisition; no abbreviation dictionary; no NLP, NER or fuzzy inference; no rule G, no rule K, no pilot rebaseline; no Option A+, CSI-v6, OA, R-DUP, predicate, vocabulary, state, B-2, touching-atom, R-BASIS, R-COUNT or atom change; no Stage-2 or sample change; no analytical coding; no Environment; no Pair/ECS/friction; no outcome use; no independent audit launched.

The correction was authored WITH knowledge of the pilot surface, of the parent's results and of the IV1 report; no claim is made that it was frozen before any contact with them (F-05 honesty).

CORR1 (Codex-driven correction only): no author validation, regression, forced-failure, mutation, adversarial search, preflight, pilot replay, inherited-fixture or generated-surface run; no new fixture or test case; no Git; no production; no SEC retrieval; no resolver change; no Environment, Pair, ECS, friction, outcome use or analytical coding.

| Prior closure | How this implementation preserves it |
|---|---|
| F-01 | R-COUNT is CORR3-identical except the bounded step-5b binding (C-2, B2-1b); separate segments still contribute separately (C2, C3, C4, C8); a genuine mixed document contributes its union of classes (PRE-1, CSI-1, DET-4, R17-C, R17-F, Mobil in the replay) |
| F-04 | R-DUP principles, link classes, split evidence, link rules, split rules and never-sufficient rules are CORR1/CORR3-identical; title+period never merges; conflict fails closed first; a captured URL is a candidate, never a link; the F-04 finding IV1-F04-EQUIVALENT-CAPTURES is closed by steps 4-7 |
| F-05 | the CORR1 honesty declaration is preserved verbatim |
| F-06 | every replay row carries sourceRefIds and sourceLocators re-derived from the sealed sidecar; empty locators carry an absence reason |
| MV-F02 | the canonical director-fee witness is SC-3 only under MODULE-R-CMP (MVF02-3); A1..A5 cases reproduced |
| MV-F03 | the canonical fee + content-ban sentence stays one indivisible non-counting mixed segment (MVF03-1, MVF03-4, MVF03-7b); segmentation is exactly CORR3's (X-9) |
| MV-TIME | HASH_BINDING = PROVEN; TEMPORAL_HISTORY = AUTHOR-REPORTED; no PASS depends on mtime |
| MV-SCOPE-1 | the 25 redirect exclusions are CORR3-identical and equal their CORR1 reference forms (8 + 5 + 12; X-2, X-5); X7-e is CORR3-identical (X-9) |
| MV-AND-1 | an occurrence is identified in a proven-shared frame (CSI-v6); repeated identical text keeps distinct identities (distinct complete-view intervals, or FRAME-U withholding); convergence across equivalent renditions (C-4) and the physical oracle (F-7, G-1) confirm no split and no merge |
| MV-REPLAY-1 | all 32 rows are re-bound; units, witnessed assertions and artifact blocks byte-equal to the parent; exactly four segments change, each to the non-counting state (R-6) |
| MV-HASH-1 | every semantic artifact and replay record carries this model's identity; the parents' identities appear only as quoted parent identities (S-2, S-2b) |
| MV-VAL | one normative model; the contract is rendered from it (T-1); the interpreter holds no normative literal (S-6); dormant paths unused (C-5) |
| MV-DUP-1 | conflict-first procedure preserved (D-1); the candidate steps sit after the split and no-evidence steps (D-5, W-1); duplicate grouping on the pilot is unchanged (R-2, R-6) |
| MV-LOC-1 | the SEGMENT_CLASS_CONFLICT key is (underlyingDocumentIdentity, canonicalSegmentIdentity) (C-2, T-3); every unit is an exact physical span and every physical heading is verified (R-3) |
| IV1-SC5-MIXED | the determinant is a list feature; a tier allocation and an actor-invariant ban in one indivisible sentence fail closed as a mixed segment (DET-1..DET-4, DET-3r); the determinant leaves are parent-identical (X-3, X-4) |
| IV1-F04-EQUIVALENT-CAPTURES | a captured URL is a candidate, never a link; equivalence is evaluated before any split; R-DUP is parent-identical (D-4, D-5, W-1, W-2) |
| IV1-RR4-CSI-CONVERGENCE | the CSI key is (document, canonical content hash, occurrence rank), versioned v5, without the CORR3 position; the same bounded segment in equivalent renditions converges wherever OC-1, OC-2 or OC-4 establishes the correspondence and never splits into two count groups (C-1, C-6, U-1..U-3, U-6, R17-A, R17-C, R17-G, R17-J, OC3-R7, OC3-R8) |
| IV1-OC3-COUNT-EQUALITY | equal occurrence counts are not identity: CSI-v6 has no rank and no count in its key; the OC-3 regressions are carried and judged by the physical oracle (F-8) |
| RR-17-WILDCARD | no wildcard or reserved occurrence value exists (S-10); an unestablished occurrence carries no identity (C-6) |
| R-3 | text-bearing removal seam implemented (BLOCK and MARKUP, no whitelist, digits count); the 34 R-3 cases reproduce the accepted CORR1 architecture (P-3) |
| OA-7(b) | representability decided per occurrence; the 10 OA-7(b) fixtures and the 360-case generator reproduce the accepted CORR1.CORR1 architecture (P-4, G-2) |
| R-14 | OA-14 implemented; the 22 R-14 constructions and the 560-case generator reproduce the accepted CORR1.CORR1.CORR1 architecture (P-4, G-3) |
| R7-RES-1 | the touching-atom closure (SAME_INDIVISIBLE_ATOM_TOUCHING, R-COUNT step 5b) is byte-identical; it reads the corrected SENTENCE evidence by reference (TA-*, SE-2) |
| TA-EVIDENCE-PARITY | the lowercase continuation guard is the parent's except the CORR1 leaves (IV1-F1: an ASCII digit continuation is withheld as a lowercase one; IV1-F2: U+201D is a permitted closer); it also reads every terminal of a non-adjacent declaration's documentary interval (SE-*, BI-5) |

| Residual risk | Where | Statement | Suggested verifier action |
|---|---|---|---|
| RR-1 | SC-9 C9-ATTACHMENT | Carried unchanged from CORR3. | Test both readings against Stage-2 CORR4. |
| RR-2 | SC-3 X3-a | Carried unchanged from CORR3. | Construct a drive-by reward mention. |
| RR-3 | SC-5 C5-INVARIANT | Sharpened by IV1-SC5-MIXED: a tier-gated rule that also states an actor-invariant ban now fails closed (DET-3). A segment whose actor-invariant value is witnessed only by implication is still not asserted. | Test an implied actor-invariant value. |
| RR-5 | pilot replay coder judgment | Carried unchanged from CORR3 (rosters, the Mobil B2 judgment, MediaOne without an in-segment role, the Wyeth table unit). The frozen replay coding is byte-identical to CORR3's. | Re-read the witnessed passages. |
| RR-6 | exclusionSemantics | Carried unchanged: the CORR1 reference derivation is the author's mechanical reading of CORR1, independently reproduced by CORR3.IV1. | None. |
| RR-7 | MODULE-R-CMP case (4) | Carried unchanged from CORR3. | State which reading the labels support. |
| RR-8 | freeze chronology | Carried unchanged: no immutable event log exists; the temporal claim is author-reported. | Confirm no PASS depends on mtime. |
| RR-9 | R-SEG-B vs MODULE-R-SEG | Carried unchanged, outside the correction set: CORR1 R-SEG-B lists 'a sentence boundary that separates no distinct proposition' as not a boundary, while MODULE-R-SEG treats a sentence as a lawful separator. | Decide whether this needs a separate act. |
| RR-10 | PDF extraction | Carried unchanged from CORR3. | Compare the bound footnote with the rendered page. |
| RR-11 | omitted assertions | Carried unchanged from CORR3: the validator cannot detect a feature a coder failed to assert. CORR3.IV1 re-read the non-ASSIGNED rows and did not establish an omission that changes the class set; this act does not revisit that judgment. | Spot-check OUTSIDE rows. |
| RR-12 | featureMerge | Carried from CORR3: the merge is order-independent over witnessed values; determinant is now a list, so the scalar merge applies only to addressee and rewardModality (DET-3r checks order independence). | None. |
| RR-13 | OBSERVED UNDER THE ERRONEOUS BRIEF, NOT AN IV1 FINDING - segmentation gap (CORR3 behaviour restored) | Reverting erroneous B-1 restores CORR3's separator rule: with NON-ADJACENT units any lawful separator name is accepted once non-whitespace text lies between them. The existing CORR4 fixtures B1-1..B1-9 showed, on the frozen CORR3 interpreter, that a coder can hide a conjunction in the gap and declare the following unit SENTENCE, HEADING or NUMBERED_CLAUSE. CORR3.IV1 did not raise this and it is NOT fixed here. | Owner/Orchestrator to decide whether a separate act is warranted. |
| RR-14 | OBSERVED UNDER THE ERRONEOUS BRIEF, NOT AN IV1 FINDING - numeric page-number stripping | CORR3 canonicalization removes every bare-integer line as a page number (^\s*\d+\s*$) at every scope. The existing CORR4 fixture EQV-1 showed, on the frozen CORR3 interpreter, that 'Revenue 50' and 'Revenue 60' then canonicalize equal and R-DUP returns SAME_UNDERLYING_DOCUMENT when a positive link exists. CORR3.IV1 did not raise this and it is NOT fixed here; note it also means numeric lines are absent from CORR3/CORR4.CORR1 content hashes. | Owner/Orchestrator to decide whether a separate act is warranted. |
| RR-15 | OBSERVED UNDER THE ERRONEOUS BRIEF, NOT AN IV1 FINDING - X7-e | CORR3 executes X7-e as rightsChangeEventReport == true, which is broader than its CORR1 text ('with no mapping established by the segment'). CORR3.IV1 re-read the non-ASSIGNED pilot rows and did not establish a change to the frozen class set, so SCA-011#s3 stays OUTSIDE_FROZEN_VOCABULARY. This act does not reconsider the auditor's semantic judgment. | Owner/Orchestrator to decide whether a separate act is warranted. |
| RR-16 | addressee (scalar enum) - IV1-SC5-MIXED analogue, not fixed | addressee still merges two witnessed values to OTHER. A segment witnessing both a PERFORMER instruction and a PARTICIPANT-facing frame loses C8-MODE; because X1-b is a CORR1 presence exclusion the observable loss is an SC-8 assignment becoming OUTSIDE (fail-closed direction, no false class). No fixture or pilot row has two addressee values. | Owner/Orchestrator to decide whether a separate act is warranted. |
| RR-18 | same-webpage candidate key (IV1-F04) | The candidate key is the URL component of the capture identity (host\|timestamp\|URL), read by a model-declared pattern, matched as an exact string. Captures whose URL strings differ ('http://www.x/' vs 'http://x/') are not candidates, and equivalent content at different URL strings stays separate (false non-merge preferred). A capture identity that does not follow the pattern is never a candidate. | Confirm exact-string identity is the intended conservative reading. |
| RR-4 | canonicalSegmentIdentity | Closed where a declared proof establishes the correspondence: equivalent renditions converge (RR4-A..C, G; R17-A, A2, C, G, J; OC3-R7, OC3-R8; probe: every case whose extracted documents are equal and whose occurrences correspond converges). Where no proof holds the segment is unresolved and non-counting, so it can neither split nor merge; the RR-4 false srcDiv cannot arise. Not proven over arbitrary documents. | Attack the three surviving proofs with a document pair whose extraction hides or creates an occurrence in a way the canonical rendition text does not reveal. |
| RR-17 | occurrence correspondence (the defect of the parent act) | REPAIRED by the parent and preserved: no wildcard; repeated occurrences stay distinct wherever OC-1 or OC-2 establishes the correspondence (R17-B, R17-C, R17-F). RESIDUAL, a conservative loss: where no surviving proof holds, segments count toward nothing, including genuinely distinct repeated occurrences inside one rendition when a sibling rendition differs (R17-C2, R17-D, R17-D3, RR4-H, RR4-I, OC3-R1, OC3-R5). The removal of OC-3 enlarges that loss: the parent converged R17-C2, OC3-R1 and OC3-R5 on equal counts alone. | Decide whether the conservative loss is acceptable; a character-level provenance map from extraction text to rendition text could recover it and was deliberately not built (a new mechanism). |
| RR-19 | R-EQV text vs extraction text | R-EQV compares canonicalized rendition text; the CSI is computed over canonicalized extraction text. They differ (entities, script and style text, and text created by joining across a removed block). OC-4 uses the canonical rendition text as evidence about hidden occurrences; R-EQV itself is unchanged. | None. |
| RR-20 | CSI values | No pilot CSI string changes in this act: the version tag CSI-v5 and the identity of every established segment are unchanged, and the 61 pilot segments are byte-identical to the parent's. The set of segments that receive an identity shrinks (OC-3-established groups become unresolved); the identity function does not change. | Recompute two CSIs by hand. |
| RR-21 | outcome is a function of documents, not of records | The correspondence of a segment depends on every rendition's document in the corpus and not on which renditions carry a record: an unread rendition that hides an occurrence of the same content makes the coded segments of that content unresolved (R17-D3). Adding a record can never change an identity. | Decide whether documents-only is the intended reading. |
| RR-22 | OC-4 assumptions and the created-occurrence limit | The surviving proofs assume that extraction and R-EQV canonicalization are order-preserving views of one decoded text and that a canonical segment text occurring inside a rendition occurs in the rendition text as the same string. Two constructions are NOT excluded: (i) OC-4 cannot see a hidden duplicate of content that the canonical rendition text does not contain (a repeated entity-bearing sentence hidden in complementary script blocks); (ii) OC-4's uniqueness is itself a count: where one rendition creates an apparent occurrence by joining text across a removed block and hides the genuine one, and another rendition shows the genuine one, each holds the content once and OC-4 gives both the rank 0 although they differ (fixture OC3-KL1; 8 of the 416 generated cases). Construction (ii) can only MERGE: one rank per content means no split into two groups, no class counted that no occurrence supports and no conflict bypass; with conflicting classes the class conflict fires and nothing counts. It is a property of a surviving proof that this act was not authorized to change. | Decide whether the surviving uniqueness proof should be narrowed (for example to renditions whose canonical documents equal the canonical rendition text) or backed by a position-level provenance map; either is a change to a surviving proof and a new act. |
| RR-23 | state meaning extended by one sentence (parent act) | The existing unresolved-identity state also covers a segment whose occurrence correspondence is not established (one sentence of the states table, added by the parent and unchanged here). No state and no class was added. | Confirm reusing the existing state is acceptable. |
| RR-24 | counterexamples and oracles | The auditor's counterexample is known from the Owner act prompt, not from a report file, and is reproduced by fixture OC3-CODEX. The parent's 140-case probe and second implementation missed it because the probe had no created-occurrence topology and the second implementation re-implemented the count-equality premise. The replacement generator (416 cases) builds each document from tracked slots, derives the oracle from the construction alone and shares no predicate with the interpreter; the frozen parent is caught by it (30 false independent count groups, 10 evidence-inflation cases). The generator and its oracle are still the author's construction. | Bring the auditor's own counterexample generator. |
| RR-25 | generator world model | Occurrences are created and hidden in the generator only by script and style blocks (and made visible in four markup and entity forms: plain, wrapped, no-break space, ampersand entity). Other mechanisms that create or hide an occurrence (comments, other removed elements, entity forms that R-EQV strips but extraction keeps, PDF text) are not generated. The markup-preserving (raw comment) family of the parent's 140-case probe is not carried by the fresh generator either; fixture RR4-C and check C-4 remain the coverage of that branch of the uniqueness proof. | Extend the generator with the auditor's mechanisms. |
| RR-26 | U-1 second implementation | Check U-1 recomputes the correspondence with a second implementation of the declared tests. It re-implements the tests it checks, so it can find an implementation defect but not an unsound premise; this is exactly how the removed proof passed the parent's U-1. It is kept as an implementation check and labelled as one; the soundness evidence is U-2, U-6 and U-7. | None; do not rely on U-1 for soundness. |
| RR-27 | conservative loss in the probe | Of the 416 generated cases, 237 contain at least one unresolved (non-counting) segment and 174 lose class evidence that the physical truth supports; these are the accepted conservative undercount and are reported apart from the hard counters. | None unless the Owner reconsiders the loss. |
| A+-R-7 | overlapping unequal segments | CLOSED_IN_CANDIDATE by R-COUNT step 5b (B2_OVERLAP_ANTI_INFLATION): overlapping unequal segments of one document that are not lawfully separate form one basis count component (one class once, or nothing); identities are unchanged by design. | Verify the closure independently (IV1): D1-D3, C1-C10, FU-1/FU-2, the generated surface. |
| A+-R-11/R-12 | FRAME-C seam taint, FRAME-U U2/U3 | Owner-accepted conservative undercount: presentational values and inline links inside a coded span make the segment non-counting; U2/U3 withhold keys with a genuine occurrence elsewhere. Pilot cost: SCA-002/029/031/032. | None (accepted). |
| A+-R-15 | OA-7(b) per occurrence | one non-representable record withholds every record on its occurrence (conservative). | None (accepted). |
| A+-R-16 | OA-14 C(r) = every established occurrence of U | physically unrelated conflicting occurrences of a witnessed document are withheld (conservative undercount; generator: 197 of 560 cases). | None (accepted); narrowing requires a declared exclusion proof. |
| A+-R-17 | OA-14 no-class / MULTIPLE unplaced records | withhold nothing (parity with the frozen R-COUNT). | None. |
| A+-R-18 | OA-14 scope | the argument is bounded by one resolved R-DUP group; unresolved groups are non-counting; unavailable-member bytes are not constructed (MEMBER_BYTES_UNAVAILABLE is a mechanical OA-1 reason). | Construct an unavailable-member case if needed. |
| A+-R-9 | authorship | one author wrote the architecture corrections, the construction oracles, the prototypes, the A+ implementation, the R7, touching-atom and sentence-evidence closures and this correction; parity with the parents is not independence. The SEC entity-name authority candidate is a separate, unverified dependency. | IV1 must build its own oracle. |
| A+-R-FAST | forced-failure mode | the forced-failure harness evaluates the generated surfaces by a declared stride (MV_FAST); every fixture, the pilot and every recorded table are checked in full; the full surfaces are evaluated for the validation report. | Run the harness with MV_FAST unset if desired (slow). |
| R7-RES-1 | touching (non-overlapping) sub-sentence quotations | CLOSED_IN_CANDIDATE by SAME_INDIVISIBLE_ATOM_TOUCHING (basisOverlap.touchingAtom, R-COUNT step 5b): two count candidates whose footprints touch or are separated only by material of the same indivisible R-SEG-B atom, with no lawful separator between their class-bearing cores, are one basis count component (one class once, or nothing); identities, states and segmentation are unchanged. | Verify the closure independently (IV1): TA-D1 / TA-D2, the lawful and non-lawful controls, the generated surface. |
| R7-UNDERCOUNT | B-2 conservative undercount | accepted by the act and reported apart from the hard counters: a conflicting component withholds every class it carries; a physically present boundary that no record records does not separate (R7-C4-UNREC); a FRAME-U relation that differs across members is treated as overlap. | None (permitted). |
| R7-EVIDENCE | separator evidence (frozen) | CLOSED_IN_CANDIDATE by SENTENCE_EVIDENCE_ON_DOCUMENTARY_INTERVAL (IV1-M1): a SENTENCE declared between NON-adjacent units is no longer accepted on 'intervening text exists' - it is verified on the actual documentary interval; SE-EVID-NA and the exact IV1-M1 constructions ('. ', '.) ', '.")] ' omitted before a lowercase continuation) are rejected. Other separators keep the whenNotAdjacent rule. | Verify the closure independently (IV1): the exact Codex constructions, the controls, the generated surface. |
| TA-UNDERCOUNT | touching relation (accepted conservative undercount) | OPEN_ACCEPTED_UNDERCOUNT, reported apart from the hard counters: a physically present table-row, heading, exhibit or label boundary between two cores that neither record records and that no terminal or clause number evidences is not proven, so the fragments are joined (TA-C3-UNREC: its line feed is byte-identical to TA-N-WRAP's line wrap in the complete view - no junction rule can separate one and join the other; three inherited R-7 cases, R7G-0743 / 0760 / 0761); FRAME-U or rendition members that disagree join (TA-FU-DIS). Nothing is ever added: every such case withholds or collapses. | None (permitted by the act: fail closed for diversity). A future act could admit a recorded or markup-proven row boundary. |
| TA-EVIDENCE-PARITY | SENTENCE separator evidence (segmentation.separatorEvidence.whenAdjacent.SENTENCE.continuationGuard) | CLOSED_IN_CANDIDATE by LOWERCASE_CONTINUATION_AFTER_ATERM: an ambiguous full stop ('.' only) whose first cased letter after permitted closers and spacing is lowercase does not prove a SENTENCE boundary, on both paths - two records split there are one atom (TA-EVID-1: TOUCHING_SAME_ATOM, withheld, srcDiv false) and one record declaring SENTENCE there is rejected (TA-EVID-1S: SEPARATOR_EVIDENCE_FAILED). '?', '!' and a full stop before an uppercase letter keep the parent's evidence. | Verify the closure independently (IV1): SE-D1 / SE-D2 / SE-D3, the uppercase, '?' and '!' controls, the >= 500-case generated surface and the UAX #29 SB8-style reference. |
| SE-UPPERCASE-AFTER-ABBREVIATION | SENTENCE separator evidence (act sections 4 and 8) | PARTLY_CLOSED: case A (IV1-M2 case A) is closed - a full stop inside a PROVEN occurrence span of the bound SEC entity-name authority candidate cannot prove SENTENCE; case B is the Owner-accepted bounded residual R-M2-CASE-B (no usable authority: the parent's evidence stands). | See R-M2-CASE-B. |
| SE-LOWERCASE-SENTENCE-START | SENTENCE separator evidence (accepted conservative undercount) | OPEN_ACCEPTED_UNDERCOUNT: a genuine sentence end followed by a sentence that starts with a lowercase letter (a lowercase brand name, careless text) is no longer proven by the full stop - two touching fragments there are joined (withheld or collapsed, never added) and a record declaring SENTENCE there is rejected. This is the UAX #29 SB8 decision the act mandates; '?' and '!' are unaffected. On the pilot the guard withholds only abbreviations' full stops ('Inc.' x1, 'Ph.D.' x3) and changes nothing. | None (permitted: fail closed for diversity). |
| R-M2-CASE-B | SENTENCE separator evidence where no usable authoritative entity-name occurrence coverage exists | OWNER-ACCEPTED BOUNDED RESIDUAL (Owner decision OPTION_A): Uppercase continuation inside a compound entity name may still be treated as a sentence boundary when the bound artifact lacks usable authoritative entity-name occurrence coverage. Not closed and not claimed closed; rule G, rule K and a pilot rebaseline were not authorized and not applied. | None in this act. Any false-positive path outside this definition remains blocking. |
| IV1-m1 | OA-14 diagnostic candidate-set snapshot | IV1-m1 (OA-14 diagnostic non-byte-idempotence of the witness candidate set): OWNER-ACCEPTED NON-BLOCKING / OUT OF SCOPE; unchanged by this act. | None in this act. |
| BI-AUTHORITY-DEPENDENCY | SEC entity-name authority candidate | the veto's case-A closure is only as sound as the SEC-HISTORICAL-ENTITY-NAME-AUTHORITY-1.CORR1 candidate's records (NOT_INDEPENDENTLY_VERIFIED, NOT_OWNER_ACCEPTED, NOT_CONTROLLING); this act verifies the binding (digests, coordinates, span text), not the authority's own derivation of CIK, name or spans. | The final independent audit verifies the dependency and this integration. |
| CORR1-NOT-RUN | the whole CORR1 candidate | IV1-F1 and IV1-F2 are CORRECTED_NOT_VERIFIED. The author ran no validation, regression, forced failure, pilot replay, fixture or generated surface; the recorded results (pilot replay, fixture expectations, impact preflight, generated-surface summaries, CSI and preservation proofs) are CARRIED from SOURCECLASS-SENTENCE-BOUNDARY-EVIDENCE-INTEGRITY-CLOSURE-1 (recorded under boundaryModelSha256 8f66179681a0f1e8d582e9f7a25b4f538fc0c5b69bcc553ea178afeb0a5329e5) and re-bound to the CORR1 identity only; NOT recomputed under CORR1 - the Owner's Codex-driven correction rule forbids author validation, regression, pilot replay, fixture, generated-surface and forced-failure runs. Any recorded result the corrections change is for the verifier to find. | Fresh independent Codex verification of CORR1. |

CORRECTION / IMPLEMENTATION CANDIDATE - NOT INDEPENDENTLY VERIFIED - NOT OWNER-ACCEPTED - NOT CONTROLLING. Self-validation is not independent verification.
