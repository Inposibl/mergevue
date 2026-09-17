# 25. Контракт analyst review, contradiction adjudication и release gate MergeVue

**Статус документа:** управляющий internal-product contract / analyst authority and paid-output release gate  
**Файл:** `25_MERGEVUE_ANALYST_REVIEW_CONTRADICTION_AND_RELEASE_GATE_CONTRACT.md`  
**Версия:** 1.0  
**Дата:** 16 сентября 2026 года  
**Язык документации:** русский  
**Язык клиентского интерфейса:** только American English  
**Язык внутреннего analyst UI:** American English  
**Рынок первой версии:** США  
**Входные слои:** `23_MERGEVUE_INTERNAL_EVIDENCE_AND_RESPONDENT_SETUP_CONTRACT.md`, `24_MERGEVUE_PRIVATE_EVIDENCE_AND_DOCUMENT_INGESTION_CONTRACT.md`  
**Выходной слой:** углублённый клиентский report / release authority  
**Главный принцип:** analyst review не создаёт параллельную истину; он разрешает, отклоняет, ограничивает или эскалирует claims внутри той же canonical evidence → report architecture  
**Ключевые инварианты:** `SAME REPORT BLOCKS`, `CONTRADICTION IS FIRST-CLASS`, `PENDING ≠ APPROVED`, `REVIEW ≠ INVENTION`, `BLOCKED MEANS BLOCKED`, `OVERRIDE REQUIRES RATIONALE`, `CLIENT VIEW ≠ ANALYST CONTROLS`, `FAIL CLOSED`

---

# 0. Назначение

Этот документ определяет внутреннюю рабочую поверхность, через которую MergeVue:

1. выявляет существенные contradictions и reliability problems;
2. собирает их в analyst findings;
3. связывает finding с respondent evidence и documentary evidence;
4. требует явный review decision;
5. сохраняет rationale;
6. применяет confidence/severity boundaries;
7. направляет unresolved cases в follow-up / senior review / practitioner escalation;
8. блокирует платный output, когда release authority отсутствует;
9. после lawful resolution разрешает генерацию следующей report version;
10. сохраняет клиентский и expert report block-congruent.

Это не:

- generic analyst dashboard;
- свободная консультационная заметка;
- ручной редактор report narrative;
- механизм «починить» неудобный алгоритмический результат;
- разрешение переписывать questionnaire answers;
- инструмент для создания claims без evidence.

---

# 1. Текущая controlling implementation foundation

В `main` уже существуют:

- `contradictionEngine.js`;
- `analystWorkflow.js`;
- `triageEngine.js`;
- `riskOutputEngine.js`;
- `finalReportEngine.js`;
- canonical `AnalystAssessment`;
- canonical `Contradiction`;
- canonical `RiskOutput`;
- evidence-review states;
- report gates;
- analyst worksheet UI lineage/styles.

Следовательно:

> **REUSE THIS AUTHORITY CHAIN. DO NOT INVENT A SECOND REVIEW SYSTEM.**

---

# 2. Current analyst review statuses

Current `analystWorkflow.js` defines:

- `pending_review`;
- `confirmed`;
- `overridden`;
- `follow_up_required`;
- `not_material`.

Эти states отражают реальную review semantics.

Они не являются декоративными labels.

---

# 3. Current analyst confidence

Current analyst confidence:

- `high`;
- `medium`;
- `low`;
- `cannot_determine`.

Не заменять на arbitrary numeric percentage.

---

# 4. Current analyst severity

Current analyst severity:

- `high`;
- `medium`;
- `low`.

Canonical data model отдельно поддерживает более широкий Severity vocabulary.

Это означает:

> production UI должен использовать ровно тот scope severity, который законно поддерживает конкретный review object.

Не смешивать enums без schema decision.

---

# 5. Current contradiction model

Canonical contradiction supports:

- contradiction type;
- related answer IDs;
- evidence item IDs;
- detection source;
- severity;
- review status;
- explanation;
- analyst resolution;
- escalation to assessment;
- created/resolved timestamps.

Current contradiction review states:

- `open`;
- `under_review`;
- `resolved`;
- `escalated_to_finding`.

Это фундамент для UI.

---

# 6. Contradiction is not an error state

Contradiction означает:

> relevant evidence sources do not currently support one clean interpretation.

Это допустимое analytical state.

Не нужно визуально подавать contradiction как:

- software failure;
- respondent failure;
- bad data.

---

# 7. Current contradiction detection scope

Current engine compares, among other things:

- Acquirer self-observation;
- Target observed by acquirer;
- Target current diagnostic;
- formal Target self-description.

It also detects:

- low-confidence primary signals;
- indirect evidence driving score;
- reliability-flag concentration;
- no-direct-knowledge concentration;
- evidence-basis mismatch.

Это больше, чем simple respondent disagreement.

---

# 8. Analyst review begins from a finding, not from a blank page

Analyst should not receive:

`Write your assessment`.

They receive:

- finding;
- affected sources;
- evidence basis;
- source signals;
- evidence-quality metrics;
- linked evidence;
- current triage context.

Then they adjudicate.

---

# 9. No blank-sheet analyst truth

Forbidden workflow:

```text
Deal
→ analyst intuition
→ report
```

Required:

```text
Evidence
→ contradiction/finding
→ analyst review
→ structured decision
→ report authority
```

---

# 10. Existing finding object

Current analyst item includes:

- finding ID;
- type;
- status;
- title;
- source finding severity;
- analyst severity;
- analyst confidence;
- risk categories;
- evidence basis;
- linked evidence item IDs;
- linked verified/disputed counts;
- analyst rationale;
- recommendation;
- review timestamp.

This is strong existing structure.

---

# 11. Analyst UI should expose source finding and analyst decision separately

Do not overwrite:

`finding severity`

with:

`analyst severity`

without trace.

Recommended:

```text
Engine finding
Current severity: High

Analyst review
Severity: Medium
Status: Overridden
Rationale: ...
```

This preserves auditability.

---

# 12. Override is not deletion

When analyst selects:

`Overridden`

the original finding remains.

Need:

- original finding;
- new analyst decision;
- rationale;
- timestamp.

No silent mutation.

---

# 13. Override must require rationale

An override without explanation is not acceptable.

Minimum:

`Analyst rationale`

required when status is `overridden`.

Potentially also when:

- confirmed with material reinterpretation;
- not material;
- follow-up required.

Exact validation can be stricter.

---

# 14. Confirmed

`Confirmed` should mean:

> analyst accepts the finding as an active finding within the governed evidence scope.

It does not mean:

- whole report proven;
- predictive validity established;
- outcome certain.

---

# 15. Not material

`Not material` should mean:

> finding does not remain material for current Deal decision/report under reviewer authority.

It does not erase evidence.

Evidence and original finding remain traceable.

---

# 16. Follow-up required

This is an important first-class state.

It means:

> current evidence is insufficient or contradictory enough that additional evidence/action is required before final interpretation.

This naturally creates:

- evidence request;
- respondent follow-up;
- private evidence request;
- practitioner escalation.

---

# 17. Pending review

Pending finding must not leak into client report as final claim.

It can influence:

- internal queue;
- release gate;
- review-needed status.

---

# 18. Current worksheet completion rule

Current analyst worksheet becomes completed only when:

- there is at least one item;
- every item has a non-pending review status.

Do not call worksheet complete while pending findings remain.

---

# 19. Zero-finding state

A case with zero generated contradiction/findings should not be forced into fake analyst findings just to satisfy UI.

Possible state:

`No analyst findings currently require review.`

Release still depends on all other required gates.

---

# 20. Analyst review ≠ mandatory FREE runtime human dependency

Important product boundary:

- FREE/public path does not acquire a hidden human-review dependency;
- paid/private deeper analysis may route to analyst review according to current architecture.

Do not show analyst-review language in FREE agent output where current runtime contract forbids it.

---

# 21. Client view of analyst state

Ordinary client may see bounded states:

- `Review required`;
- `Under review`;
- `Additional evidence required`;
- `Review complete`;
- `Report blocked pending review`.

They should not see every internal analyst control.

---

# 22. Analyst view and client view are different levels, not different truths

Client report block:

`Decision authority remains unresolved.`

Analyst expanded block may additionally show:

- contradictory respondents;
- source question IDs;
- evidence classification;
- private evidence item;
- alternative hypothesis;
- override control;
- rationale.

Same claim domain.

---

# 23. Congruence rule

Expert/analyst view preserves:

- same report blocks;
- same block order;
- same core claims.

Adds:

- provenance;
- alternatives;
- evidence conflicts;
- adjudication controls;
- release state.

No unrelated analyst report.

---

# 24. Canonical report remains client truth

Analyst worksheet is a governance/control layer.

It does not become client-facing report structure.

---

# 25. Current triage routes

Current triage can route to:

- standard analyst review;
- priority analyst review;
- senior analyst review;
- practitioner escalation.

These are real implementation concepts.

Do not invent:

- junior analyst;
- committee;
- chief risk officer;
- legal approval;
- investment committee review

unless separate authority exists.

---

# 26. Current report gates

Current triage gates include:

- `analyst_review_required`;
- `paid_output_conditional`;
- `paid_output_blocked`.

These are core release semantics.

---

# 27. `paid_output_blocked` is absolute

If gate is:

`paid_output_blocked`

then:

> no paid final output may be issued until blocking issue is lawfully resolved.

UI must not offer:

`Publish anyway`.

---

# 28. No client-side bypass

Frontend cannot change gate.

No hidden query param.

No admin checkbox in ordinary analyst UI.

Release authority server-side.

---

# 29. `paid_output_conditional`

Means:

> paid output requires specified higher review/resolution before release.

It is not equivalent to released.

---

# 30. `analyst_review_required`

Means analyst worksheet/review is required before output authority.

Do not allow generation button to bypass pending findings.

---

# 31. Confidence caps

Triage can impose confidence cap.

Current examples include:

- high;
- medium;
- low;
- cannot determine.

Analyst cannot simply select higher client confidence than active cap unless governing resolution changes the cap.

---

# 32. Confidence cap must be visible internally

Recommended:

`Release confidence cap: Low`

with reason:

`Reliability saturation`

or relevant trigger.

---

# 33. Client does not need raw triage tier

Client may see:

`Evidence limitations cap the current conclusion.`

Do not expose internal `MANY`, `BLOCKING`, etc. unless public vocabulary is separately defined.

---

# 34. Triage trigger visibility

Analyst should see active triggers such as:

- weak signal;
- co-presence;
- partial signal;
- negative-only;
- reliability saturation;
- contradiction blocking.

These help explain why gate exists.

---

# 35. Triage trigger ≠ analyst conclusion

Trigger is routing/control evidence.

Analyst review can resolve underlying issue through lawful evidence/adjudication.

Do not copy trigger label as client risk headline.

---

# 36. Reliability flags

Internal flags may include:

- contradicted by respondent;
- contradicted by document;
- socially desirable;
- evasive;
- overgeneralized;
- speaks for group without access;
- hypothetical;
- structurally unlikely;
- no direct knowledge;
- acquisition framing contamination.

These are sensitive internal evidence-quality signals.

---

# 37. Reliability flags are not person labels

Do not show:

`Respondent is evasive`.

Better analyst framing:

`This response carries an evasiveness reliability flag.`

Object of judgment = response/evidence, not person.

---

# 38. Client-safe reliability language

Possible:

`Evidence reliability is limited for this conclusion.`

Not:

`The Target respondent was dishonest.`

---

# 39. Unresolved source-derived reliability codes

Current triage code explicitly distinguishes unresolved source-derived codes from authorized AnswerReliabilityFlags.

Do not promote unresolved codes to active UI controls.

---

# 40. Method debt must not become UI canon

Commented / implementation-invented tier mappings are not automatically public methodology.

Internal analyst UI may need them operationally because runtime uses them.

But they must be labeled/treated as current implementation control, not research truth.

---

# 41. Analyst surface information hierarchy

Recommended:

```text
Deal / report context
Release gate
Blocking findings

Contradictions
Evidence reliability
Analyst worksheet items

Current report preview
Release checklist
```

Not:

- giant risk score;
- dashboard KPIs;
- revenue/commercial card.

---

# 42. Release gate must be top-visible

Analyst should immediately know:

- releasable;
- conditional;
- blocked;
- why.

Avoid discovering blocker only after writing rationale.

---

# 43. Deal identity

Show:

- Acquirer × Target;
- Deal ID internally;
- report version;
- evidence scope;
- generated/review timestamps.

No need for commercial pricing.

---

# 44. Report version under review

Analyst must know which report/evidence snapshot they are adjudicating.

Do not let evidence mutate invisibly beneath open worksheet.

---

# 45. Snapshot/version integrity

Review should bind to:

- evidence set/version;
- questionnaire/engine version;
- contradiction report version;
- worksheet version;
- report candidate version.

---

# 46. Stale review detection

If evidence changes after analyst review:

relevant finding may need review again.

Do not silently carry old approval to materially changed evidence.

---

# 47. Current worksheet preservation

Existing review by finding ID is reused when worksheet rebuilds.

This is useful.

But production must detect semantic changes to a finding, not only stable ID, before assuming review remains valid.

---

# 48. Finding identity stability

Do not change finding IDs casually.

They anchor review/audit history.

---

# 49. Contradiction type identity

Canonical contradiction types include:

- cross-respondent same-side;
- cross-side;
- answer vs document;
- answer vs pattern;
- self-contradiction.

These provide future structured grouping.

---

# 50. Current contradiction engine is more specific than canonical type enum

Implementation engine currently emits specific finding types such as:

- acquirer/target disagreement;
- target observed/self divergence;
- target diagnostic/self divergence;
- evidence-basis mismatch;
- reliability concentration.

UI should preserve detailed finding type while mapping to broader contradiction class if needed.

---

# 51. No taxonomy rewrite in UI

Designer cannot rename findings into new methodology categories without authority.

Navigation labels may be simplified, semantic categories may not.

---

# 52. Contradiction list card

Recommended:

```text
Acquirer and target operating assumptions disagree
High

Sources:
Acquirer self-observation
Target current diagnostic

Status:
Under review

Evidence:
3 linked items
```

Then open detail.

---

# 53. Contradiction detail

Show:

1. finding;
2. why it was generated;
3. affected sources;
4. source signals;
5. linked answers/evidence;
6. reliability context;
7. analyst decision;
8. rationale;
9. recommendation/follow-up;
10. history.

---

# 54. Signal codes are internal

Current contradiction engine stores internal environment signal codes.

Analyst technical view may use them if necessary.

Client never sees internal codes.

Analyst view should still prefer public aliases alongside technical code where possible.

---

# 55. Internal technical fields can be visible to analyst

Unlike client UI, analyst may need:

- question IDs;
- signal codes;
- evidence item IDs;
- response classifications;
- engine metrics.

But they must be visually secondary to human-readable meaning.

---

# 56. Raw answers

Analyst may access raw canonical answers when permissions allow.

Preserve:

- exact wording;
- selected option;
- evidence type;
- knowledge level;
- confidence;
- reliability flags;
- respondent context.

Do not normalize text.

---

# 57. Cross-party access for analyst

Internal analyst may need cross-party evidence to adjudicate.

This is a controlled privileged role.

Do not transfer that access model to ordinary client collaborators.

---

# 58. Evidence side-by-side comparison

Useful for contradiction:

```text
Source A
claim / response / evidence basis

Source B
claim / response / evidence basis

Linked documents
```

This is more useful than arbitrary score cards.

---

# 59. No respondent popularity voting

Multiple responses are not adjudicated by majority automatically.

Analyst must consider:

- access;
- evidence basis;
- temporal relevance;
- contradictions;
- documentary support.

---

# 60. Documentary evidence does not automatically override respondent evidence

See `24`.

Analyst adjudicates relationship.

---

# 61. Direct observation does not automatically override documents

Same.

---

# 62. Temporal context

Analyst must see material dates:

- answer/submission;
- produced date;
- evidence upload/review date;
- T0/forecast baseline where relevant.

A later document cannot silently contaminate earlier baseline.

---

# 63. Sealed/locked forecast boundary

If reviewing a locked forecast after new evidence:

analyst cannot edit historical forecast.

They create:

- later version;
- delta;
- verification interpretation.

---

# 64. Analyst rationale

Required characteristics:

- bounded;
- evidence-linked;
- decision-relevant;
- no unsupported speculation.

It should answer:

> why this review status/severity/confidence was selected.

---

# 65. Analyst rationale is not report narrative

It may contain technical detail unsuitable for client.

Client narrative is separately generated from structured authorized model.

---

# 66. Recommendation

Current analyst item includes recommendation.

Recommendation should remain bounded to:

- evidence follow-up;
- diligence/control action;
- governance action.

No transaction verdict.

---

# 67. Default recommendations

Current code can generate default recommendations for finding types.

These are implementation defaults.

Analyst must not treat them as automatically client-ready.

Review for:

- relevance;
- evidence support;
- scope;
- current methodology.

---

# 68. No generic recommendation carry-through

Default recommendation can seed analyst review.

Client report uses it only after report-authority pipeline validates it.

---

# 69. Severity

Severity should describe finding materiality within current model.

No color-only semantics.

Analyst can override only with rationale.

---

# 70. Analyst confidence

Confidence applies to reviewed finding/assessment.

Do not confuse with:

- respondent confidence;
- evidence-item confidence;
- report confidence;
- triage confidence cap.

These are separate axes.

---

# 71. Confidence hierarchy

Analyst UI should visibly separate:

```text
Respondent confidence
Evidence confidence
Analyst confidence
Release confidence cap
Client-facing conclusion confidence
```

No one generic `Confidence`.

---

# 72. Cannot determine

First-class lawful outcome.

Analyst should be able to preserve:

`Cannot determine`

instead of forcing low-confidence conclusion.

---

# 73. Canonical AnalystAssessment model

Canonical analyst assessment includes:

- Deal;
- analyst ID;
- risk category;
- finding title;
- finding narrative;
- supporting answer IDs;
- supporting evidence IDs;
- contradiction IDs;
- evidence label;
- severity;
- confidence;
- pre-close action;
- post-close action;
- approval status;
- timestamps.

This is stronger than a free-text note.

---

# 74. Approval status ≠ worksheet review status

Canonical `ApprovalStatus`:

- draft;
- under review;
- approved;
- rejected.

Analyst worksheet item statuses are different:

- pending;
- confirmed;
- overridden;
- follow-up;
- not material.

Do not merge these enums.

---

# 75. Two-stage governance possibility

Conceptually:

```text
Finding review
→ Analyst assessment
→ Approval/release
```

Exact production mapping needs engineering/governance decision.

UI must not assume `confirmed = approved`.

---

# 76. Separation of duties

Where high-stakes release requires independent approval, system should support it.

But this document does not invent a second reviewer role if current operational policy does not require one.

---

# 77. No analyst self-approval assumption

Do not encode that same person always:

- reviews finding;
- approves final report;
- publishes output.

Authority policy may differ.

---

# 78. Practitioner escalation

Current triage has explicit practitioner escalation.

When active:

analyst UI should show:

`Practitioner escalation required`

and explain blocking reason.

No release override.

---

# 79. Practitioner is not generic support agent

This is high-authority review path.

Do not route to customer success.

---

# 80. Client-facing escalation state

Client can see:

`Additional review is required before this conclusion can be released.`

No need to expose internal role title unless useful.

---

# 81. Escalation brief

Internal practitioner brief should include:

- Deal identity;
- blocker;
- contradiction findings;
- evidence summary;
- prior analyst decisions;
- unresolved question;
- possible options;
- prohibited assumptions.

Not full unstructured dump.

---

# 82. No chain-of-thought requirement

Analyst/practitioner rationale is structured justification, not hidden model chain-of-thought.

Store decision rationale and evidence basis.

---

# 83. Alternative hypotheses

Analyst view should support:

- primary interpretation;
- strongest alternative;
- evidence for each;
- falsifier / follow-up.

Especially for ambiguous cases.

---

# 84. Alternative hypothesis does not require new report block

It can live as technical expansion of same canonical client block.

---

# 85. Evidence gaps

Analyst can mark:

`Follow-up required`

and generate bounded evidence request.

This should connect to `23`/`24`, not a generic note.

---

# 86. Follow-up routing

Possible next action:

- another respondent;
- targeted question route if canonical flow permits;
- private document;
- evidence clarification;
- practitioner review.

Do not invent custom survey question.

---

# 87. No analyst-authored canonical question

Absolutely forbidden.

If follow-up requires human clarification not part of canonical instrument, it must be a separately governed evidence request/interview, not inserted into questionnaire.

---

# 88. Questionnaire immutability applies to analyst too

Analyst cannot:

- edit question;
- recode answer manually;
- change option;
- reorder instrument.

Corrections follow governed evidence/versioning path.

---

# 89. Analyst cannot rewrite respondent answer

If respondent clarifies later:

new evidence/amendment record.

Original remains.

---

# 90. Analyst cannot rewrite document

Same.

They can add:

- extract;
- interpretation;
- review state.

---

# 91. Evidence labels

Canonical model includes evidence labels like:

- directly observed;
- document supported;
- inferred;
- unknown;
- contradicted;
- follow-up required.

Analyst UI may use them internally.

Do not expose all as client badges by default.

---

# 92. Risk categories

Current internal implementation includes legacy/current risk categories.

Some vocabulary may require claims review before client publication.

Analyst UI may retain current runtime categories necessary for operation.

Do not automatically promote them to client navigation.

---

# 93. Risk scores

Current analyst/risk engines compute numeric internal scores.

These are **not automatically client-facing validated risk probabilities**.

Analyst UI may use them as internal prioritization support if current implementation requires.

Client report must not expose them unless separately authorized.

---

# 94. Internal score disclaimer

Analyst UI should not label internal score:

`Probability`.

Use:

`Internal risk score`

only if existing terminology and governance permit.

Better: show severity + evidence basis.

---

# 95. Ranking risk findings

Current risk output may rank categories by score.

This is internal workflow ordering.

It must not become client “top 10 risks” without claims review.

---

# 96. Algorithmic ranking cannot hide blocked finding

A low-score finding that triggers blocking contradiction must stay visible.

Release gating overrides display ranking.

---

# 97. Blocking findings first

Analyst UI should prioritize:

1. blockers;
2. conditional-release findings;
3. pending review;
4. resolved/non-material.

This is workflow priority, not client risk ranking.

---

# 98. Review queue

If multiple Deals exist, analyst may need queue.

Not required in first per-Deal surface.

Do not build global analyst operations platform in this contract.

---

# 99. Per-Deal analyst surface first

Recommended:

`Deal → Review`

rather than global dashboard.

This preserves Deal context.

---

# 100. Internal route

Exact route not authorized.

Potential:

`/internal/deals/:dealId/review`

but requires auth/role/route decision.

Do not implement from this document alone.

---

# 101. Internal access boundary

Analyst/reviewer route must be role-protected server-side.

Not hidden nav only.

---

# 102. Client cannot guess internal URL to gain access

Authorization before rendering any evidence.

---

# 103. Internal analyst identity

Server should record reviewer identity.

Client does not need it.

---

# 104. Reviewer timestamps

Store:

- reviewedAt;
- updatedAt;
- approval/release timestamps where relevant.

---

# 105. Review history

Material status changes should be auditable.

Do not overwrite rationale/history silently.

---

# 106. Current `applyAnalystReview` mutation model

Current implementation updates review item by finding ID and rebuilds risk outputs.

Target persistent architecture should preserve history/versioning when moved beyond session state.

---

# 107. Session-state limitation

Current analyst worksheet can live in session.

Production paid review needs persistent Deal-level storage.

Do not mistake in-memory/session object for durable governance store.

---

# 108. Persistent review object

Target should preserve:

- finding snapshot;
- reviewer;
- decision;
- rationale;
- linked evidence;
- version;
- timestamp.

---

# 109. Idempotent review submit

Repeated request must not create duplicate decisions unexpectedly.

---

# 110. Concurrent edits

Future analyst collaboration concern.

First version can use one active reviewer / optimistic conflict check.

Do not overbuild real-time collaboration.

---

# 111. Stale form protection

If finding/evidence changed while analyst page open:

warn before applying old decision.

---

# 112. Evidence links

Analyst should open linked EvidenceItem with full authorized metadata.

No raw storage path.

---

# 113. Respondent links

Analyst can open source answer/context under permissions.

Preserve cross-party evidence semantics.

---

# 114. Source matrix

Useful:

| Source | Primary signal | Confidence | Evidence support | Reliability flags |
|---|---|---|---|---|

Internal only.

Do not show raw code without label.

---

# 115. Metrics are supporting evidence, not verdict

Rates like:

- indirect-driving rate;
- reliability-flag rate;
- no-direct-knowledge rate

explain trigger.

Analyst still reviews evidence context.

---

# 116. No metric cherry-picking

UI should not selectively show only metrics supporting current engine finding.

Show relevant counterevidence.

---

# 117. Counterevidence panel

For finding:

- supporting evidence;
- contradicting evidence;
- unresolved evidence;
- missing evidence.

This is preferable to one-sided “Evidence”.

---

# 118. Evidence-review states in analyst UI

Show documentary evidence states:

- unreviewed;
- under review;
- verified;
- disputed.

Pending document should not count as verified support.

---

# 119. Evidence item relation

Show:

- supports;
- contradicts;
- context;
- requires follow-up.

A verified document may contradict finding.

---

# 120. Decision rationale template

Potential internal fields:

`Why this finding is confirmed/overridden`

`Evidence that matters most`

`Remaining uncertainty`

`Required follow-up`

This encourages bounded reasoning.

---

# 121. Rationale quality validation

At minimum reject empty rationale for override/follow-up.

Potentially require evidence link for confirmed high-severity finding.

Exact gate engineering decision.

---

# 122. Recommendation editing

Analyst may edit recommendation within bounded scope.

Do not allow recommendation that:

- exceeds evidence;
- becomes transaction verdict;
- becomes employment action;
- violates report claims policy.

Validators remain after review.

---

# 123. Pre-close / post-close actions

Canonical AnalystAssessment supports both.

This is useful.

Keep temporal distinction.

Do not merge into one generic `Action`.

---

# 124. Action timing

If timing unsupported:

do not invent Day 30 / Month 6.

Use condition-based action.

---

# 125. Current default risk recommendations are legacy/current implementation

Some current strings contain strong M&A prescriptions.

They need report-claims validation before client release.

Analyst surface can show them as draft recommendations, not final truth.

---

# 126. Client narrative generation happens after structured review

Analyst should not manually edit prose everywhere.

Preferred:

```text
Structured reviewed findings
→ authoritative Fact Pack / report projection
→ narrative rewrite
→ validators
→ release
```

---

# 127. No manual client-report patch as primary workflow

If analyst sees bad client narrative:

fix underlying structured claim or regenerate.

Avoid one-off text override that breaks PDF/email parity.

---

# 128. Narrative override exception

If manual narrative override is ever needed:

must be versioned, evidence-bound and pass validators.

Not part of first contract.

---

# 129. Report block preview

Analyst should preview how reviewed finding affects canonical report block.

This supports congruence.

Example:

`Decision Gap`

`Resource Conflict Map`

`Recommended Actions`.

---

# 130. Preview is not release

Preview watermarked/internal state:

`Draft — not released`

if necessary.

Do not create shareable public link before authority.

---

# 131. Screen/PDF/email parity

Release preview should verify same structured projection powers:

- screen;
- PDF;
- email.

Analyst should not approve one representation only.

---

# 132. Release checklist

Recommended internal checklist:

- all required findings reviewed;
- blockers resolved or explicitly remain blocking;
- evidence review requirements met;
- contradiction states current;
- confidence caps respected;
- report validators pass;
- no prohibited claims;
- no private provenance leakage;
- client narrative matches structured data;
- report version identified.

Machine-enforce where possible.

---

# 133. Checklist is not checkbox theater

If system can determine condition:

show automatically.

Do not make analyst manually tick:

`All pending findings reviewed`

when machine knows.

---

# 134. Human acknowledgments only for irreducible judgment

Use human control for:

- interpretation;
- rationale;
- approval where policy requires.

Not for machine-checkable invariants.

---

# 135. Release states

Conceptual target:

- `Draft`;
- `Review required`;
- `Conditional`;
- `Blocked`;
- `Ready for release`;
- `Released`;
- `Superseded`.

Exact enum needs release-authority design.

Do not overload triage gate enum.

---

# 136. Released report immutability

Released report version should not mutate silently.

New evidence → new version.

---

# 137. Superseded report

Old report remains traceable.

Client may see current version; historical versions according to product policy.

---

# 138. Blocked report

Client should not receive final report.

They may receive bounded status/Decision Gap.

---

# 139. Partial release

Not assumed.

If future block-level release is allowed, requires explicit policy.

Do not mix final and blocked paid output arbitrarily.

---

# 140. Public report vs paid final report

Public result may remain accessible while paid final report is blocked.

Do not hide public baseline.

---

# 141. Release authority source

Release should be server-authoritative.

No browser-only `approved=true`.

---

# 142. Who can release

Role/permission model not fully defined here.

Do not invent `Senior Analyst`, `Publisher`, `Admin` RBAC beyond current triage role labels.

Separate authorization contract required.

---

# 143. Senior analyst review label

Current triage can require `senior_analyst_review`.

This is routing state.

Whether it maps to a specific RBAC role requires implementation decision.

---

# 144. Practitioner escalation label

Same.

Do not hard-code organization hierarchy from labels alone.

---

# 145. Separation between routing and permissions

Routing says:

> what level of review is required.

Permissions say:

> which authenticated person may perform it.

Different systems.

---

# 146. Analyst self-role cannot be user-editable

Reviewer cannot select:

`I am senior analyst`

to bypass.

Server permissions.

---

# 147. Client release notification

After release:

client Deal Workspace can show:

`New report available`.

Do not expose internal triage/reviewer detail unnecessarily.

---

# 148. Client state while under review

Possible:

`Analysis update under review`

or:

`Additional review required`.

No fake ETA.

---

# 149. Review duration

Do not promise SLA absent commercial authority.

---

# 150. Reason for delay

Client may benefit from bounded reason:

`Conflicting evidence requires review before the report can be updated.`

Not internal technical codes.

---

# 151. Follow-up evidence request backflow

Analyst action can create evidence need routed to `23` or `24`.

This closes loop:

```text
Review
→ Follow-up required
→ New evidence
→ Recompute contradictions
→ Re-review
```

---

# 152. No recursive form proliferation

Use same evidence/respondent surfaces.

Do not build analyst-specific custom respondent forms.

---

# 153. Recompute after evidence

New evidence should trigger deterministic recomputation of relevant:

- contradiction report;
- analyst worksheet;
- triage;
- risk outputs;
- report candidate.

Preserve prior history.

---

# 154. Existing reviewed item after recompute

If source finding unchanged:

may reuse review.

If material evidence/meaning changed:

review should reopen.

Need explicit non-regression logic.

---

# 155. Finding fingerprint

Future useful implementation concept:

hash semantic inputs to detect changed finding.

Not required in UI.

---

# 156. Contradiction resolution

Resolution can be:

- evidence confirms one interpretation;
- evidence shows both contexts valid;
- issue no longer material;
- cannot determine;
- escalated.

Do not force binary winner.

---

# 157. Analyst resolution field

Canonical contradiction supports free-text resolution.

Should remain evidence-linked and bounded.

---

# 158. Resolved contradiction is retained

Do not remove from record.

Status:

`Resolved`.

History matters.

---

# 159. Escalated-to-finding

Contradiction may become formal analyst assessment.

Preserve linkage.

---

# 160. Finding vs contradiction

Contradiction = evidence conflict/state.

Finding = analyst/report-relevant interpretation.

They are not the same object.

---

# 161. One contradiction can support multiple findings

Potentially.

Do not hard-code 1:1 unless current model does.

---

# 162. One finding can reference multiple contradictions

Canonical AnalystAssessment supports contradiction IDs.

Preserve.

---

# 163. Evidence item can link multiple findings

Current evidence architecture supports related finding arrays.

Preserve.

---

# 164. Analyst controls should be precise

Recommended fields per finding:

- Status;
- Analyst severity;
- Analyst confidence;
- Rationale;
- Recommendation.

This matches current workflow.

---

# 165. No arbitrary “Approve” button on each finding

Use current status vocabulary.

Approval belongs separate release layer.

---

# 166. Status control labels in analyst UI

American English.

Human-readable:

- Pending review
- Confirmed
- Overridden
- Follow-up required
- Not material

No raw snake_case.

---

# 167. Analyst severity control

High / Medium / Low.

No Critical unless current analyst item schema is explicitly expanded.

---

# 168. Analyst confidence control

High / Medium / Low / Cannot determine.

Respect triage cap.

---

# 169. Rationale field

Multiline.

No rich text needed first version.

No hidden prompt-style input.

---

# 170. Recommendation field

Multiline.

Should be optional/required depending on status.

---

# 171. Evidence links

List current verified/disputed count and open details.

Do not use only counts.

---

# 172. Original finding explanation

Read-only.

Analyst cannot edit engine finding text.

---

# 173. Original metrics

Read-only.

No manual metric input.

---

# 174. Source evidence basis

Read-only canonical inputs.

---

# 175. Re-run/recompute action

Should be system-driven after evidence changes.

Do not offer analyst arbitrary `Recalculate until desired`.

---

# 176. Model/provider opacity

Analyst may need technical provenance internally, but ordinary review UI should focus on evidence/method.

Provider identity is not decision authority.

---

# 177. Independent verification of code/methodology is separate

Project development audits are not Deal-level analyst review.

Do not display project auditor badges in client Deal.

---

# 178. Analyst review is transaction-specific

It adjudicates current Deal evidence.

It does not validate MergeVue methodology globally.

---

# 179. Review ≠ legal opinion

Client report remains bounded.

Analyst cannot turn MergeVue into legal counsel.

---

# 180. Review ≠ valuation opinion

Same.

---

# 181. Review ≠ investment recommendation

No BUY / DON'T BUY.

---

# 182. Review ≠ HR decision

No automated firing/retention judgment on person.

---

# 183. Named leader boundary

Analyst cannot infer specific leader behavior from organizational/documentary evidence alone.

Specific-leader forecast requires individual data/42Q.

---

# 184. Person facts vs behavioral forecast

Analyst can use documented role/departure facts.

Cannot produce personal behavioral prediction without required channel.

---

# 185. Evidence access minimization

Analyst sees evidence necessary to review Deal.

Internal access still follows security principle.

No universal analyst access assumed.

---

# 186. Sensitive private evidence

Compensation/board/personnel evidence may need restricted reviewer subset.

Future permissions contract.

---

# 187. PII minimization in analyst UI

Show only necessary identity.

Do not turn review into HR dossier.

---

# 188. Review analytics

Allowed operational metrics:

- finding opened;
- review submitted;
- follow-up requested;
- blocker resolved;
- report released.

Do not send sensitive evidence/rationale to marketing analytics.

---

# 189. Reviewer performance analytics

Not in scope.

Do not score analysts in this UI.

---

# 190. No gamification

No queue streaks, speed leaderboard, “reviews completed today”.

---

# 191. Accessibility

Target WCAG 2.2 AA even for internal tool.

Need:

- keyboard controls;
- labels;
- table headers;
- error association;
- non-color status;
- accessible side-by-side evidence;
- focus after save;
- no hover-only source detail.

---

# 192. Desktop density

Internal review can be denser than client UI.

Still preserve:

- readable hierarchy;
- evidence/review separation;
- no 12-column data wall.

---

# 193. Mobile

Critical review may be desktop-first operationally, but responsive read access should not break.

Do not claim mobile full-review support if not tested.

If review action restricted on small screens, state operationally, not through broken UI.

---

# 194. Side-by-side responsive fallback

On narrow screens:

Source A then Source B.

Maintain labels.

---

# 195. Color

Suggested semantics:

- neutral = pending;
- blue/info = review;
- amber = conditional/follow-up;
- red = blocked/disputed;
- green = resolved/released.

Always text.

No red = bad Deal.

---

# 196. Release banner

Top banner:

`Paid output blocked`

or:

`Review required`

when true.

Must not be dismissible as cosmetic notification.

---

# 197. Block reason

Show exact human-readable blocker.

Example:

`Cross-source contradictions remain unresolved.`

---

# 198. Confidence cap banner

If cap active:

`Current release confidence cannot exceed Low until reliability issue is resolved.`

Internal only.

---

# 199. Current report preview

Analyst can see affected report blocks.

Highlight:

- changed;
- blocked;
- provisional.

No manual WYSIWYG editing first version.

---

# 200. Provenance jump

From report claim analyst can jump to:

- finding;
- evidence;
- respondent answer;
- contradiction.

This is high-value future interaction.

---

# 201. Claim-to-source graph

Can exist as technical detail.

Do not require graph visualization; link list often clearer.

---

# 202. No decorative network graph

Only if materially useful.

---

# 203. Report validators

Must run after analyst review.

Analyst approval cannot bypass:

- forbidden claims;
- internal notation leakage;
- named-person overreach;
- placeholder leakage;
- report structure invariants.

---

# 204. Validation failure

Internal UI shows:

`Report validation failed`

with actionable bounded errors.

Report not releasable.

---

# 205. Validator message security

Do not expose secrets/storage paths in generic error.

Internal developer detail can be separate.

---

# 206. Narrative verification

If LLM rewrite used:

anti-hallucination verification remains mandatory after analyst-structured approval.

Analyst review does not pre-authorize LLM additions.

---

# 207. LLM cannot invent analyst rationale

Rationale is human/governed decision.

AI may assist drafting if future policy allows, but final rationale must be explicitly accepted.

Not in first target.

---

# 208. AI-assisted evidence summary

Potential internal aid.

Must link sources and remain non-authoritative until reviewed.

Do not use to hide raw evidence.

---

# 209. “Suggested decision” caution

Avoid default status auto-selection by AI that induces automation bias.

Engine finding may suggest route, but analyst consciously selects review status.

---

# 210. Default form values

Current workflow normalizes missing analyst severity/confidence to defaults.

Production UI should not present defaults as analyst choice before analyst interacts.

Prefer explicit unset/needs-review state if schema allows.

Do not silently claim analyst selected Medium.

---

# 211. Legacy default debt

Current code defaults confidence to medium.

This is implementation behavior.

Before production analyst UI, audit whether default should be nullable in persistence.

Do not fake historical analyst judgment.

---

# 212. Severity default

Same.

Source finding severity can prepopulate context, but analyst severity should clearly be unreviewed until decision.

---

# 213. Review form save

`Save review`

or `Submit review`.

If status remains pending, draft persistence may be allowed if backend supports.

Do not call completed.

---

# 214. Draft review

Current worksheet statuses do not have explicit analyst-review draft separate from pending.

Target persistence may need draft notes.

Not authorized automatically.

Could save rationale with pending if current model supports.

---

# 215. Required fields by status

Recommended target rule:

## Confirmed
- status;
- confidence;
- severity;
- rationale if high materiality;
- recommendation if actionable.

## Overridden
- rationale required.

## Follow-up required
- rationale + evidence request/action required.

## Not material
- rationale required for high/medium source finding.

Exact validation should be codified.

---

# 216. No empty override

Absolute.

---

# 217. No silent not-material dismissal

Especially high-severity finding.

---

# 218. Bulk review

Not recommended first version.

Each material finding deserves explicit decision.

Do not `Confirm all`.

---

# 219. Bulk status changes

Forbidden for blockers.

---

# 220. Filter controls

Useful when many findings:

- Pending;
- Blocking;
- Follow-up;
- Resolved.

Do not filter by client risk score as primary.

---

# 221. Sort order

Default:

- blocking;
- high source severity;
- pending;
- follow-up;
- resolved.

Preserve deterministic ordering.

---

# 222. Search

Not necessary initially.

---

# 223. Analyst notes

Avoid separate unstructured notes area unless operationally needed.

Structured rationale preferred.

---

# 224. Attach evidence from review

Analyst may trigger `Request evidence`, not directly fabricate evidence item.

If analyst uploads internal/public source, use same evidence system.

---

# 225. Internal analyst evidence

If analyst independently collects a public record/document:

source must be captured with provenance.

Same rules.

---

# 226. Analyst cannot change source party silently

Evidence metadata amendments versioned/governed.

---

# 227. Contradiction dismissal

If analyst resolves contradiction as non-material:

resolution explanation required.

Original contradiction retained.

---

# 228. Contradiction resolved with new evidence

Link resolving evidence.

---

# 229. Contradiction unresolved but report releasable?

Only if triage/release policy allows and confidence/limitation reflect it.

Analyst cannot decide ad hoc against gate.

---

# 230. Blocking contradiction

No release until gate resolution.

---

# 231. Partial contradiction

May cap confidence.

Preserve in report limitations.

---

# 232. Client limitation propagation

Unresolved material contradiction should produce client-facing limitation.

Do not disappear after analyst review.

---

# 233. Decision Gap propagation

If unresolved:

Decision Gap remains/updates.

---

# 234. Review outcome can create new Decision Gap

Valid.

---

# 235. Review outcome can close Decision Gap

Only when evidence supports.

Report version update should record.

---

# 236. Triage route can change after review/evidence

Recompute route.

Do not manually edit gate string.

---

# 237. Gate history

Preserve transition:

`blocked → conditional → ready`

internally.

Useful audit.

---

# 238. Client does not need gate history

Unless high-value transparency surface later.

---

# 239. Release decision and report version

On release:

- version frozen;
- generated timestamp;
- authority state;
- evidence scope;
- validator result.

---

# 240. Reopening released report

New evidence does not edit it.

Creates next candidate version.

---

# 241. Analyst Workspace vs Deal Workspace

Internal analyst review can live as privileged expansion of same Deal Workspace.

Preferred conceptual model:

`Deal → Review`

not separate analyst product universe.

---

# 242. Client shell separation

Privileged controls are not rendered for client.

Same Deal object, different authorized view.

---

# 243. No “Analyst mode” toggle for clients

Access server-role controlled.

---

# 244. No UI masquerading

Internal analyst does not need client upsell/commercial banners.

Focus on evidence/control.

---

# 245. Visual lineage

Reuse MergeVue work surface:

- light background;
- white panels;
- thin borders;
- 8px radius;
- navy;
- restrained semantic statuses;
- dense but readable data.

No dark SOC dashboard unless separate visual decision.

---

# 246. Existing `.analyst-worksheet` lineage

Current styles already contain analyst worksheet/card/control primitives.

Inspect and reuse where appropriate.

Do not discard existing internal UI components without defect proof.

---

# 247. Existing internal UI block-preservation audit

Before redesign, inspect actual `AnalystWorksheetPanel` in live/main and record:

| Block | Current function | Keep/adapt/replace | Reason |
|---|---|---|---|
| Worksheet summary | | | |
| Risk cards | | | |
| Finding list | | | |
| Status controls | | | |
| Severity control | | | |
| Confidence control | | | |
| Rationale | | | |
| Recommendation | | | |
| Evidence links | | | |
| Gate state | | | |

No wholesale redesign without this matrix.

---

# 248. Internal route may not be public-nav reachable

Do not add `Analyst` to public sidebar.

---

# 249. Analyst login/access

Requires authenticated internal permissions.

Not defined here.

---

# 250. Practitioner access

Same.

No public route.

---

# 251. Security logging

Material review/release actions should be logged server-side.

Detailed security/audit implementation separate.

---

# 252. No raw secret exposure

Analyst may have privileged evidence, but tokens/storage secrets remain hidden.

---

# 253. Client data isolation

Analyst access must remain Deal/authorization-bound.

No accidental cross-client search.

---

# 254. Global analyst queue future

If built, it must not leak Deal names to unauthorized analyst roles.

Out of current first-version scope.

---

# 255. Evidence provenance in review export

If analyst exports review artifact internally, provenance retained.

No external client artifact unless governed.

---

# 256. Report audit footer

Released report records enough metadata for version identity.

Internal review history remains deeper layer.

---

# 257. No public “independently reviewed” badge by default

Analyst review is product process, not external validation.

If marketed, exact scope/authority required.

---

# 258. No “human verified” overclaim

Human review can still be wrong/limited.

Describe process narrowly.

---

# 259. Analyst name in report

Not required.

Could create authority/personality dependence.

---

# 260. Analyst rationale privacy

Client does not automatically get internal rationale.

They get resulting bounded claim/limitation.

---

# 261. Customer challenge/feedback

Not in this contract.

Future client dispute flow may create new evidence/review request.

---

# 262. Client correction

If client says factual issue wrong:

should become structured correction/evidence path, not edit released report directly.

---

# 263. Outcome verification later

Separate from analyst pre-release review.

Do not use post-outcome evidence to justify pre-event forecast.

---

# 264. Historical case analyst review

Historical replay publication uses separate `17`/case authority.

This contract can provide internal review primitives but cannot weaken anti-hindsight firewall.

---

# 265. Prospective Deal analyst review

May release locked forecast if all applicable gates pass.

Locking contract separate later.

---

# 266. Report release ≠ forecast locking automatically

A report can contain non-forecast analysis.

Forecast lock has additional requirements.

---

# 267. No accidental seal semantics

Do not call report `sealed` unless formal lock/seal authority exists.

---

# 268. Current Deal status `sealed`

Canonical data model includes `sealed`.

Client meaning must be separately defined.

Do not use as generic “done”.

---

# 269. Review completion ≠ Deal completion

Deal continues.

---

# 270. Review completion ≠ evidence completion

New evidence can emerge.

---

# 271. Review completion ≠ truth finalized forever

It is version-bound decision.

---

# 272. Analyst queue state in client Workspace

Client only sees appropriate status, e.g.:

`Under review`.

No queue position.

---

# 273. Notifications

When review complete, client may be notified if notification system exists.

Separate contract.

---

# 274. Report release CTA internal

Potential:

`Release report`

only when server says ready.

Disabled button alone insufficient; server enforces.

---

# 275. Ready-for-release state

Must be computed from gates, not manually selected.

---

# 276. Release confirmation

Given high stakes, final confirmation reasonable:

`Release report version X to client?`

with evidence scope/Deal identity.

---

# 277. Confirmation cannot bypass validator errors

---

# 278. Release target

Confirm correct Deal/client access.

Avoid wrong-deal release.

---

# 279. Release audit

Store actor/timestamp/version.

---

# 280. Client publication

Released report becomes available through existing Deal/report surface.

No separate analyst-generated file upload as client report.

---

# 281. PDF generation after authority

PDF from same canonical projection.

---

# 282. Email after authority

Same.

---

# 283. Report withdrawal

If critical error discovered after release, needs separate correction/withdrawal governance.

Do not silently delete.

---

# 284. Correction notice

Future contract.

---

# 285. Analyst review success metric

Not speed.

Quality measures may include:

- blockers lawfully resolved;
- provenance preserved;
- report releases without validator failures;
- contradiction handling reproducible;
- no unsupported claim escalation.

Not in UI gamification.

---

# 286. Analyst workload minimization

Automate:

- source aggregation;
- machine-checkable gates;
- linked evidence counts;
- contradiction extraction.

Human focuses on irreducible judgment.

---

# 287. Owner irreducible judgment principle

Project Owner should not be pulled into routine Deal review.

Operational analyst/practitioner authority should handle governed cases according to production policy.

Owner remains product/method governance, not default transaction adjudicator.

---

# 288. No Owner button

Never expose internal project Owner as client escalation.

---

# 289. Methodology escalation vs Deal escalation

If analyst discovers method defect:

that belongs offline methodology governance.

Do not patch current Deal method ad hoc.

---

# 290. Production freeze principle

Analyst cannot retune thresholds/weights to solve Deal.

They operate current frozen production method.

---

# 291. Post-hoc retuning forbidden

Especially if outcome later known.

---

# 292. Thresholds not editable

No analyst settings panel for:

- θ_gap;
- θ_support;
- θ_coverage;
- weights;
- ECS formula.

---

# 293. Analyst may not select LLM provider

Provider routing is operational infrastructure.

Not Deal adjudication control.

---

# 294. AI output may be evidence-supporting draft, not authority

Any machine-generated interpretation remains subordinate to evidence + governance.

---

# 295. Alternative perspective

Internal tool can show model-generated strongest alternative if governed.

Analyst explicitly accepts/rejects structured assessment.

---

# 296. No auto-confirm

Engine-generated finding starts pending review.

Do not default confirmed.

---

# 297. No auto-not-material

Same.

---

# 298. Release gate hard tests

Production tests must prove:

- pending finding blocks where required;
- `paid_output_blocked` cannot release;
- conditional gate requires proper review;
- confidence cap enforced;
- disputed evidence remains visible;
- follow-up remains unresolved;
- validator failure blocks;
- client cannot invoke release endpoint;
- stale worksheet cannot release newer evidence snapshot.

---

# 299. Contradiction non-regression tests

Test:

- cross-side disagreement;
- target observed/self divergence;
- document contradiction;
- low confidence;
- indirect score-driving evidence;
- reliability saturation;
- no-direct-knowledge concentration;
- no contradiction.

---

# 300. Review status tests

Each status:

- pending;
- confirmed;
- overridden;
- follow-up;
- not material

must produce correct downstream state.

---

# 301. Rationale tests

Override without rationale must fail target validation.

High-material not-material dismissal should require rationale.

---

# 302. Evidence update tests

New evidence reopens/updates appropriate finding when material.

---

# 303. Report version tests

No released version mutation.

---

# 304. Congruence tests

Same structured client claims across:

- screen;
- PDF;
- email.

Analyst technical fields excluded.

---

# 305. Client privacy tests

No:

- analyst rationale;
- raw respondent IDs;
- private storage refs;
- internal signal codes;
- triage flags;
- engine thresholds

in client output unless explicitly permitted.

---

# 306. Internal access tests

Client user cannot reach review APIs.

---

# 307. Accessibility acceptance

Analyst control labels, errors, status, evidence comparisons accessible.

---

# 308. American English

All analyst UI labels American English.

Documentation remains Russian.

---

# 309. Current asset decision matrix

| Existing asset | Decision |
|---|---|
| `contradictionEngine.js` | **KEEP + EVOLVE** |
| `analystWorkflow.js` | **KEEP + EVOLVE** |
| `triageEngine.js` | **KEEP** |
| `riskOutputEngine.js` | **KEEP INTERNAL / PUBLIC CLAIMS REVIEW** |
| `finalReportEngine.js` | **KEEP AS RELEASE PIPELINE INPUT** |
| Analyst review statuses | **KEEP** |
| Analyst confidence | **KEEP** |
| Analyst severity | **KEEP** |
| Contradiction states | **KEEP** |
| Triage gates | **KEEP ABSOLUTELY** |
| Confidence caps | **KEEP** |
| `paid_output_blocked` | **HARD BLOCK** |
| Existing analyst worksheet UI | **AUDIT BLOCK-BY-BLOCK BEFORE REDESIGN** |
| Generic analyst dashboard | **DO NOT ADD** |
| Client-visible raw analyst controls | **FORBIDDEN** |
| Manual threshold tuning | **FORBIDDEN** |

---

# 310. Target first-version analyst surface

Minimum:

```text
Deal identity
Release gate

Blocking/pending findings

Finding detail
  Original finding
  Source evidence
  Contradictions
  Analyst status
  Severity
  Confidence
  Rationale
  Recommendation

Report impact preview

Release checklist
```

No need initially for:

- global queue;
- team chat;
- comments;
- performance dashboard;
- SLA analytics;
- full admin panel.

---

# 311. Target data separation

Conceptual:

```text
ENGINE FINDING
immutable source object

ANALYST REVIEW
versioned decision object

RELEASE AUTHORITY
computed / permissioned state

CLIENT REPORT
governed projection
```

Do not merge into one mutable record.

---

# 312. Mandatory implementation mapping

Before implementation:

| Control | Current source | Client-visible? | Analyst-editable? | Release impact |
|---|---|---:|---:|---:|
| Finding title | contradiction engine | bounded | no | yes |
| Source severity | engine | usually no | no | yes |
| Analyst status | analyst workflow | bounded state only | yes | yes |
| Analyst severity | analyst workflow | no/directly not necessarily | yes | yes |
| Analyst confidence | analyst workflow | maybe projected | yes | yes |
| Rationale | analyst workflow | no by default | yes | yes |
| Recommendation | analyst workflow | projected after validation | yes | yes |
| Evidence items | evidence model | permissioned | no except review process | yes |
| Contradiction status | contradiction model | bounded | authorized review | yes |
| Triage gate | triage engine | bounded summary | no | yes |
| Confidence cap | triage engine | bounded implication | no | yes |
| Release authority | server governance | availability state | no direct | yes |

---

# 313. Route/security decision artifact required

Before creating internal analyst route:

document:

- authenticated role source;
- permission checks;
- Deal scoping;
- evidence permission;
- release permission;
- practitioner permission;
- route/deep-link behavior;
- audit logging.

---

# 314. Persistence readiness gate

Do not ship production analyst surface if reviews live only in ephemeral browser/session memory.

Need durable server-side review state.

---

# 315. Release readiness gate

Do not expose `Release report` until:

- report version storage;
- server authority;
- validator pipeline;
- client delivery path

are production-real.

---

# 316. WHAT WAS INTENTIONALLY PRESERVED

Before merge list:

- contradiction engine;
- source evidence summaries;
- current finding types;
- review statuses;
- analyst severity/confidence;
- evidence linking;
- triage triggers;
- triage routes;
- report gates;
- confidence caps;
- canonical report structure;
- fail-closed release behavior.

---

# 317. WHAT IS NEW

Explicitly target-only until implemented/persisted:

- durable analyst review history;
- privileged per-Deal review surface if current UI is insufficient;
- structured release checklist;
- report-impact preview;
- stale-review protection;
- semantic finding fingerprint/versioning;
- server release endpoint/permission where not already productionized.

---

# 318. WHAT CHANGED AND WHY

Format:

```text
CURRENT PRIMITIVE
→ TARGET CONTROL
→ DEFECT / NEED
→ SEMANTIC DELTA
→ AUTHORITY
```

Example:

```text
pending_review / confirmed / overridden / follow_up_required / not_material
→ explicit analyst decision control with rationale and immutable source finding
→ current status semantics are strong but need durable review/audit UI
→ semantic delta: NONE
→ analystWorkflow.js
```

---

# 319. Acceptance criteria

Analyst review/release surface passes only if:

1. current contradiction engine remains source of generated contradiction findings;
2. analyst review starts from structured finding, not blank sheet;
3. original finding immutable;
4. original evidence immutable;
5. pending remains distinct;
6. confirmed remains distinct;
7. overridden remains distinct;
8. follow-up required remains distinct;
9. not material remains distinct;
10. override requires rationale;
11. material dismissal requires rationale;
12. analyst severity separate from source severity;
13. analyst confidence separate from respondent/evidence confidence;
14. triage confidence cap visible/enforced;
15. cannot-determine remains legal;
16. linked evidence preserved;
17. verified/disputed evidence states preserved;
18. contradiction retained after resolution;
19. document never auto-wins;
20. respondent evidence never auto-wins;
21. multiple respondents not majority-voted automatically;
22. temporal provenance visible;
23. sealed forecast cannot be rewritten;
24. new evidence creates new version/delta where required;
25. follow-up routes to governed evidence/respondent flow;
26. analyst cannot edit canonical questions;
27. analyst cannot rewrite respondent answers;
28. analyst cannot edit thresholds/weights;
29. analyst cannot select provider to change outcome;
30. no post-hoc retuning;
31. triage route server-derived;
32. `paid_output_blocked` cannot be bypassed;
33. conditional output cannot release before required review;
34. analyst-review-required gate cannot release with pending required findings;
35. confidence cap cannot be exceeded;
36. practitioner escalation cannot be dismissed by ordinary analyst;
37. client sees bounded review state, not internal controls;
38. analyst/client report remain block-congruent;
39. analyst rationale does not become client narrative automatically;
40. narrative generation occurs after structured authority;
41. report validators remain mandatory;
42. validation failure blocks release;
43. screen/PDF/email use same projection;
44. released report version immutable;
45. new evidence produces new candidate version;
46. review bound to evidence/report snapshot;
47. stale review detected;
48. review history durable;
49. reviewer identity recorded internally;
50. unauthorized client cannot access analyst route/API;
51. analyst access server-authorized;
52. evidence access Deal-scoped;
53. sensitive evidence permissions respected;
54. no internal storage refs leak to client;
55. no raw internal signal codes leak to client;
56. no project-development audit artifacts leak to Deal report;
57. client report retains limitations/contradictions where material;
58. Decision Gap updates lawfully;
59. no client transaction verdict introduced;
60. no valuation opinion introduced;
61. no automated employment decision introduced;
62. named-leader forecast boundary preserved;
63. no generic risk-score dashboard replaces canonical report;
64. existing AnalystWorksheetPanel audited before visual replacement;
65. visual lineage remains MergeVue;
66. status meaning not color-only;
67. WCAG 2.2 AA target maintained;
68. American English internal UI;
69. no analyst performance gamification;
70. no global operations platform required for first version;
71. machine-checkable gates automated;
72. human review reserved for irreducible judgment;
73. report release requires explicit server authority;
74. target-only controls stay labeled target until built;
75. every release decision remains evidence-traceable.

---

# 320. Финальный принцип

> **Analyst review is not a license to replace the model with expert intuition. It is the governed layer that resolves or preserves uncertainty when evidence sources disagree, quality is limited, or the release gate requires human judgment.**

> **A contradiction is not something to hide. It is a state to explain, investigate, resolve when evidence allows, or preserve as a limitation when it does not.**

> **The analyst may change the decision about a finding. The analyst may not rewrite the evidence, rewrite the questionnaire, retune the method, or bypass a blocked release.**

> **Paid output is released only when the evidence chain, review state, confidence limits, validators, and release authority all agree that it may be released.**
