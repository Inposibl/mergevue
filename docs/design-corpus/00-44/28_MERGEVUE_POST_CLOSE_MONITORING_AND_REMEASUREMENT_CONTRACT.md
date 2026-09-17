# 28. Контракт post-close monitoring и re-measurement MergeVue

**Статус документа:** управляющий target-contract / post-close control, longitudinal observation and re-measurement  
**Файл:** `28_MERGEVUE_POST_CLOSE_MONITORING_AND_REMEASUREMENT_CONTRACT.md`  
**Версия:** 1.0  
**Дата:** 16 сентября 2026 года  
**Язык документации:** русский  
**Язык клиентского интерфейса:** только American English  
**Рынок первой версии:** США  
**Входные контракты:** `26_MERGEVUE_PAID_REPORT_RELEASE_AND_FORECAST_LOCK_CONTRACT.md`, `27_MERGEVUE_OUTCOME_VERIFICATION_AND_TRACK_RECORD_CONTRACT.md`  
**Связанные evidence-контракты:** `23_MERGEVUE_INTERNAL_EVIDENCE_AND_RESPONDENT_SETUP_CONTRACT.md`, `24_MERGEVUE_PRIVATE_EVIDENCE_AND_DOCUMENT_INGESTION_CONTRACT.md`  
**Главный принцип:** monitoring не переписывает исходный forecast и не повторяет весь diagnostic по расписанию; он наблюдает заранее определённые watchpoints, фиксирует intervention, повторно измеряет только релевантные evidence channels и создаёт новую current-state assessment поверх immutable baseline  
**Ключевые инварианты:** `BASELINE STAYS IMMUTABLE`, `MONITOR ≠ RE-RUN EVERYTHING`, `WATCHPOINT ≠ FORECAST`, `OBSERVATION ≠ VERIFICATION`, `RE-MEASUREMENT ≠ RETROACTIVE CORRECTION`, `INTERVENTION MUST BE RECORDED`, `UPDATED RISK REQUIRES NEW EVIDENCE`, `NO FAKE LIVE MONITORING`

---

# 0. Назначение

Этот документ определяет целевой post-close product loop:

```text
Prediction
→ Watchpoint
→ Observation
→ Intervention
→ Re-measurement
→ Effect
→ Updated Risk
→ Next Control
```

Цель — превратить разовый отчёт MergeVue в управляемый evidence loop, не разрушая:

- исходный baseline;
- provenance;
- forecast lock;
- outcome-verification integrity;
- distinction between evidence and interpretation.

---

# 1. Это не новый диагностический продукт

Post-close monitor не должен становиться:

- generic PMO dashboard;
- HR pulse survey;
- culture tracker;
- weekly employee sentiment tool;
- arbitrary KPI dashboard;
- AI monitoring copilot;
- continuous surveillance system.

Он продолжает тот же Deal-level evidence → risk → control chain.

---

# 2. Current implementation status

В текущем `main` есть реальные foundations:

- semantic `WATCHPOINT`;
- Watch & Control Timeline;
- review windows;
- recommended control actions;
- structural watchpoints;
- timing windows;
- affected resources;
- report-level watchpoint/action linkage.

Но отдельный production:

- longitudinal monitor service;
- recurring checkpoint scheduler;
- re-measurement state machine;
- intervention ledger;
- post-close monitoring route

не установлен как готовая capability.

Следовательно:

> **этот документ — target contract, не описание существующей production page.**

---

# 3. Commercial authority boundary

Owner-accepted Commercial North Star определяет target evolution:

```text
Public Signal
→ Pre-Deal Intelligence
→ Paid Diagnostic
→ Deal Decision Support
→ Formation-Window Observation
→ Post-Close Control
→ Re-Measurement
→ Longitudinal Monitoring
→ Execution Evidence / Future Due Diligence
```

Это prioritization architecture.

Не implementation authorization.

---

# 4. Governing loop

Target loop:

```text
Prediction
→ Watchpoint
→ Observation
→ Intervention
→ Re-measurement
→ Effect
→ Updated Risk
→ Next Control
```

Каждый переход должен иметь отдельный data object / state, а не один mutable text box.

---

# 5. Главный вопрос пользователя

Post-close monitor должен отвечать:

> `What did MergeVue say to watch, what has actually changed, what action was taken, and what does the new evidence support now?`

Не:

> `How is integration going overall?`

---

# 6. Verification vs monitoring

Critical distinction.

## Verification

Спрашивает:

> fulfilled ли exact locked forecast?

## Monitoring

Спрашивает:

> что наблюдается сейчас по specified watchpoints?

Они могут использовать некоторые одинаковые evidence sources.

Но их decision logic разная.

---

# 7. Monitoring vs re-measurement

## Monitoring

Непрерывно / периодически собирает relevant observations.

## Re-measurement

Запускает governed reassessment конкретного state/risk после нового evidence или intervention.

Monitoring может не изменить risk.

Re-measurement может.

---

# 8. Re-measurement vs correction

Re-measurement не означает:

> старый report был ошибочным.

Это новый time-indexed assessment.

Например:

```text
Baseline risk: High
Intervention applied
Day 60 evidence
Updated risk: Medium
```

Old baseline remains.

---

# 9. Baseline immutability

Post-close layer всегда сохраняет:

- original public baseline;
- paid diagnostic baseline;
- locked/sealed forecast;
- initial Decision Gap;
- original controls;
- original evidence cutoff.

Не overwrite.

---

# 10. Time-indexed state

Каждый re-measurement — новый state at time T.

Conceptually:

```text
T0 baseline
T1 observation
T2 intervention
T3 re-measurement
T4 updated risk
```

---

# 11. No single mutable “current risk”

UI может показывать `Current risk`.

Но underlying model должен сохранять history.

---

# 12. Current risk ≠ original forecast

Forecast predicts.

Risk state describes current assessed condition.

Do not merge.

---

# 13. Watchpoint definition

Watchpoint — заранее определённое observable condition / signal worth monitoring because it is linked to:

- a structural mechanism;
- a resource;
- a forecast;
- a control;
- a Decision Gap.

Он не обязательно является forecast.

---

# 14. Existing semantic watchpoint

Current code treats `WATCHPOINT` as a distinct semantic output class.

This distinction must remain.

Do not convert every watchpoint into prediction.

---

# 15. Watchpoint fields

Target structured watchpoint should contain at least:

```text
watchpointId
dealId
sourceReportId
sourceReportVersion

statement
scope
relatedResourceIds[]
relatedFindingIds[]
relatedForecastIds[]
reviewWindow
evidenceNeeded[]
controlActionId?

status
```

Conceptual only.

---

# 16. Watchpoint statement must be observable

Bad:

`Culture deteriorates.`

Better:

`Escalations that previously reached joint leadership are increasingly resolved unilaterally by one side.`

Only if source authority supports.

---

# 17. Review window

Existing report model already uses review windows.

Preserve.

A watchpoint should say:

> when to review.

Not necessarily exact clock date if underlying model uses relative window.

---

# 18. Review window ≠ outcome window automatically

Forecast verification window and watchpoint review window may differ.

Do not reuse one field blindly.

---

# 19. Review windows are not generic schedule defaults

Do not hard-code:

- Day 30;
- Day 60;
- Day 100;
- Month 6;
- Month 12;
- Month 18

for every Deal.

Commercial North Star says such checkpoints are appropriate **when supported by product contract**.

---

# 20. Existing Day 0–30 / Days 30–60 / Months 6–18 language

Current report assets contain these windows.

They are existing design/method primitives.

But they must remain tied to governed watchpoint/control logic.

Do not promote every legacy timing phrase to universal monitor cadence.

---

# 21. Monitoring cadence derives from watchpoints

Correct:

```text
watchpoint window
→ checkpoint date/window
```

Wrong:

```text
monthly subscription
→ invent something to monitor every month
```

---

# 22. No “always-on” claim unless real

Do not market:

`MergeVue monitors your integration continuously.`

unless:

- data source connection exists;
- monitoring process actually runs;
- cadence defined;
- alerts generated reliably.

---

# 23. Manual monitoring is valid first version

First longitudinal product can be checkpoint-based:

- user opens checkpoint;
- reviews specified watchpoints;
- adds new evidence;
- records intervention;
- requests re-measurement.

No need to fake streaming data.

---

# 24. Checkpoint object

Conceptual:

```text
checkpointId
dealId
checkpointType
windowStart
windowEnd
dueAt?
status

watchpointIds[]
evidenceRequestIds[]

openedAt?
completedAt?
```

---

# 25. Checkpoint is Deal-specific

No global generic monitor first.

Monitor is attached to one Deal.

---

# 26. Formation-window relationship

Pre-close formation-window observation is related but distinct.

Required separation:

```text
SEALED PRE-T0 BASELINE
```

vs:

```text
POST-T0 / PRE-CLOSE FORMATION-WINDOW DELTA
```

Post-close monitoring begins after close or another approved lifecycle boundary.

Do not merge pre-close delta with post-close state.

---

# 27. Formation-window delta does not contaminate baseline

Any post-T0 evidence is stored as later evidence.

Never inserted into pre-T0 baseline.

---

# 28. Post-close observation source

Potential:

- structured internal observation;
- private document;
- operational record;
- public event;
- governance change;
- respondent follow-up.

Same evidence discipline as earlier layers.

---

# 29. Observation ≠ free-form status update

A monitoring observation should bind to:

- watchpoint;
- timestamp;
- evidence source;
- observer/source;
- statement;
- confidence/quality where applicable.

---

# 30. Observation object

Conceptual:

```text
observationId
dealId
watchpointId
observedAt
sourceType
sourceId
statement
evidenceIds[]
status
```

---

# 31. Observation status

Potential:

- Observed
- Not observed
- Cannot determine
- Conflicting evidence
- Not yet reviewable

Exact enum requires methodology contract.

Do not invent final machine enum here.

---

# 32. “Not observed” ≠ resolved risk

Absence of signal at one checkpoint does not automatically mean:

- risk gone;
- forecast falsified;
- control effective.

Need governing rule.

---

# 33. “Observed” ≠ causal proof

Seeing watchpoint after intervention does not prove intervention caused it.

---

# 34. Observation provenance

Use same standard:

- source;
- date;
- party;
- context;
- review state.

---

# 35. No anonymous “status = green”

User must understand why state changed.

---

# 36. Control action definition

A control is action intended to affect a specified risk mechanism or evidence condition.

It is not generic recommendation.

---

# 37. Existing recommended control action linkage

Current report architecture links watchpoints to suggested control actions by governed timing.

Preserve referential integrity.

---

# 38. Control action object

Conceptually:

```text
controlId
dealId
sourceReportVersion
relatedWatchpointIds[]
relatedFindingIds[]

statement
ownerRole?
plannedAt?
startedAt?
completedAt?

status
```

---

# 39. Control owner

Could be:

- Integration lead;
- Deal lead;
- functional lead;
- governance group.

Do not invent exact responsible role if report authority does not define one.

---

# 40. Action owner ≠ workspace permission

Distinct.

---

# 41. Recommendation ≠ applied intervention

A report recommendation becomes intervention only when client records it was actually applied.

---

# 42. Intervention record

Conceptually:

```text
interventionId
controlId
dealId

actualAction
startedAt
completedAt?
scope
evidenceIds[]
clientRecordedBy
status
```

---

# 43. Planned vs actual

Keep separate.

`Recommended action` ≠ `Action taken`.

---

# 44. No fake control completion

A checkbox alone should not imply operational change if evidence is required.

---

# 45. Client can record intervention

But product may need:

- date;
- scope;
- evidence;
- responsible role.

Do not simply let user set `Effective`.

---

# 46. Effect is measured, not self-declared

User may say:

`We implemented the new governance process.`

Effect requires later observation/re-measurement.

---

# 47. Intervention timing matters

Need know:

- before observation;
- during observation window;
- after outcome.

This affects verification interpretation.

---

# 48. Intervention and forecast verification

As `27` established, intervention may alter forecast observability.

Monitoring records intervention so verification can interpret correctly.

Do not rewrite locked forecast.

---

# 49. Intervention and re-measurement

Re-measurement specifically asks:

> after this intervention, what does current evidence support?

---

# 50. Re-measurement trigger

Valid triggers:

- scheduled checkpoint;
- watchpoint observed;
- intervention completed;
- material new evidence;
- contradiction;
- client request;
- governance change.

Not every page visit.

---

# 51. No automatic remeasurement from one event

A single event may be insufficient.

Need evidence sufficiency.

---

# 52. Re-measurement scope

Should be as narrow as possible.

If control concerns decision authority:

remeasure decision-authority/risk mechanism.

Do not rerun whole 67Q by default.

---

# 53. Commercial North Star explicit rule

Monitor should **not blindly rerun entire diagnostic**.

It should know:

- what was predicted;
- falsifiers;
- critical roles/resources;
- controls chosen;
- expected changes;
- evidence to re-observe.

This is controlling target direction.

---

# 54. Selective re-observation

A checkpoint may invoke:

- subset of structured observation;
- new documentary request;
- same canonical instrument only if methodology requires full re-run;
- new public evidence review.

Do not invent ad-hoc questions.

---

# 55. Canonical questionnaire invariant remains

Monitoring does not authorize:

- shortening;
- changing;
- reordering;
- creating custom question.

If repeat measurement requires canonical questionnaire:

same exact instrument semantics.

---

# 56. Follow-up questions

If monitoring needs clarification outside canonical questionnaire:

use governed evidence request/interview.

Not injected into questionnaire.

---

# 57. Re-measurement object

Conceptually:

```text
remeasurementId
dealId
trigger
baselineVersion

evidenceSnapshotId
measurementScope
methodVersion

result
confidence
contradictions[]
updatedRiskIds[]

createdAt
authorizedAt?
```

---

# 58. Baseline reference mandatory

Re-measurement without explicit comparison baseline is ambiguous.

Need know:

- compared to T0?
- compared to prior checkpoint?
- compared to post-intervention state?

---

# 59. Comparison basis

Client copy should say:

`Compared with the released baseline from Sep 16, 2026`

or:

`Compared with the Day 30 checkpoint`.

Only if exact.

---

# 60. No percentage delta unless valid

Do not show:

`Risk improved 27%`

unless risk metric supports interval arithmetic.

Prefer:

`High → Medium`

or structured change only if governed.

---

# 61. Updated risk is a new assessment

It does not retroactively alter prior risk.

---

# 62. Updated risk requires evidence

No update solely because time passed.

---

# 63. Updated risk may increase

Paid monitor must allow worsening state.

---

# 64. Updated risk may remain same

Valid.

---

# 65. Updated risk may become cannot determine

Also valid.

New evidence can introduce contradictions.

---

# 66. Updated environment reading

If methodology permits re-resolution over time, treat as new current-state observation.

Do not rewrite historical environment determination.

---

# 67. Environment drift vs measurement error

Do not claim organizational environment changed merely because new data differs.

Need governing method.

---

# 68. Current-state vs baseline state

Display separately.

---

# 69. Effect of intervention

Potential internal conclusion classes:

- Evidence supports improvement
- No material change observed
- Evidence supports deterioration
- Cannot determine
- Conflicting evidence

These are conceptual; exact enum needs methodology authority.

---

# 70. No causal claim by default

`Risk decreased after action`

is temporal association.

`Action caused risk decrease`

requires stronger causal evidence.

---

# 71. Client-safe effect copy

Good:

`The re-measurement shows fewer authority conflicts after the control was introduced.`

Only if evidence.

Safer than:

`The control worked`.

---

# 72. Control effectiveness is separate claim type

Needs evidence and potentially repeated measures.

---

# 73. Control effectiveness must preserve counterevidence

If some signals improve and others worsen:

show mixed state.

---

# 74. Next Control

Updated risk may produce:

- maintain current control;
- modify control;
- escalate;
- collect more evidence;
- stop intervention;
- no action.

Only if governing logic supports.

---

# 75. Next Control is new recommendation

Not retroactive correction of old recommendation.

---

# 76. Control history

Preserve sequence:

```text
Control v1
→ intervention
→ observation
→ re-measurement
→ Control v2
```

---

# 77. No task management sprawl

Do not turn controls into Jira.

Need only:

- action;
- owner if required;
- timing;
- status;
- evidence/effect linkage.

---

# 78. No generic action checklist

Only Deal-specific governed controls.

---

# 79. Monitoring overview

Deal Workspace target:

```text
Post-close monitor

Current checkpoint
Current watchpoints
Controls in effect
New observations
Re-measurement status
Updated risk
Next review
```

---

# 80. No global KPI hero

Do not show:

- Integration Health 82%;
- Cultural Alignment 71%;
- Team Sentiment 64%.

Unless canonical method defines them.

---

# 81. Current checkpoint

Should state:

- lifecycle window;
- due/current state;
- source report version;
- watchpoints.

---

# 82. Checkpoint labels

Possible:

`Day 30 review`

only when derived from current contract.

Not universal.

---

# 83. Relative vs calendar dates

If close date known:

show actual calendar date plus relative window.

Example:

`Day 60 review · Nov 15, 2026`

Only exact.

---

# 84. Unknown close date

Do not invent checkpoint dates.

Show relative window until date known.

---

# 85. Close date provenance

Must be authoritative enough.

---

# 86. Rescheduled close

Update future checkpoints.

Do not alter pre-close evidence timestamps.

---

# 87. Transaction delayed/terminated

Monitor state changes appropriately.

No post-close monitor if close never occurred.

---

# 88. Close confirmation

Post-close monitor activation should require actual close confirmation.

Not expected-close date alone.

---

# 89. Deal lifecycle gate

Potential states:

- Pre-close
- Closed
- Monitoring active
- Monitoring paused
- Monitoring complete

Exact labels separate.

---

# 90. Monitoring activation

Do not auto-start paid monitoring unless engagement includes it.

Commercial entitlement separate.

---

# 91. Monitoring entitlement ≠ evidence authority

Even paid monitor cannot generate unsupported claims.

---

# 92. Recurring revenue architecture

Commercial North Star identifies Monitor as recurring-product target.

But this contract does not set:

- subscription price;
- monthly billing;
- contract term.

---

# 93. No subscription UI yet

Do not create Plans / Billing just because monitor may be recurring.

---

# 94. Monitoring period

May be bounded:

- 30 days;
- 100 days;
- 6 months;
- 18 months.

But exact product package requires commercial authority.

---

# 95. Monitor does not require all possible checkpoints

Use only Deal-relevant windows.

---

# 96. Watchpoint prioritization

Could rank by materiality if current report/method supports.

Do not invent priority score.

---

# 97. Blocking watchpoint

If observed signal triggers hard escalation rule:

show clearly.

Need actual governing rule.

---

# 98. Day 60 escalation logic

Existing project foundations mention Day 60 escalation logic.

Before UI uses it:

inspect exact source and ensure current authority.

Do not infer generic escalation trigger from phrase alone.

---

# 99. Alert vs checkpoint

Alert = condition-triggered.

Checkpoint = time-triggered.

Different.

---

# 100. No alert service until implemented

Do not show:

`We'll alert you automatically`

unless scheduler/data ingestion supports.

---

# 101. Manual alert state

A system can flag observation during active user session.

This is not continuous alerting.

---

# 102. Notifications

Future:

- checkpoint due;
- watchpoint observed;
- intervention review due;
- re-measurement available.

Separate notifications contract.

---

# 103. Email/SMS not assumed

No channel promises.

---

# 104. Public-source monitoring

Potential future:

watch public evidence for relevant events.

But current continuous web monitoring capability not established in product runtime.

Do not claim.

---

# 105. Private-source monitoring

Requires integration/connectors/security.

Not assumed.

---

# 106. User-entered observations

Valid first version.

Need provenance.

---

# 107. Respondent re-observation

May use invite flows.

Need clear scope.

---

# 108. Re-observation respondent ≠ original respondent necessarily

New observer can participate.

Need preserve identity/context.

---

# 109. Comparing different respondents

Caution.

Change may reflect respondent mix.

Re-measurement method must account.

---

# 110. Same respondent repeated

Potentially useful.

But no coercion.

---

# 111. Questionnaire repeat effects

Repeated measurement may induce learning/response effects.

Methodology should consider.

UI cannot solve.

---

# 112. Measurement equivalence

To compare over time:

same construct and rules.

Do not change wording/instrument.

---

# 113. Evidence type consistency

If baseline used documentary evidence and later uses only self-report:

comparison limitations must be visible.

---

# 114. Evidence coverage shift

Re-measurement should show if evidence coverage increased/decreased.

No false trend certainty.

---

# 115. Contradictions over time

Contradiction may:

- resolve;
- persist;
- emerge.

Keep history.

---

# 116. Contradiction resolution at T2 does not delete T1 contradiction

---

# 117. Longitudinal evidence model

Need time-indexed records.

No mutable final state only.

---

# 118. Observation provenance graph

Not necessarily visual graph.

Need traceability.

---

# 119. Re-measurement report

Could be compact delta report rather than full report.

But must remain congruent with canonical blocks.

---

# 120. Delta report principle

Show:

- what changed;
- what did not;
- new evidence;
- updated risk;
- next control.

Do not reprint every unchanged block by default.

---

# 121. Canonical block congruence

Delta references same blocks:

- Structural Watchpoints
- Resource Conflict
- Timeline
- Economic Risk Translation
- Recommended Actions
- Decision Gap

No new unrelated taxonomy.

---

# 122. Current report vs checkpoint report

Current Deal Workspace can show latest re-measurement as current state.

Original released report remains accessible.

---

# 123. Version identity

Each re-measurement has:

- version;
- date;
- baseline link;
- evidence scope;
- method version.

---

# 124. Re-measurement version ≠ report version necessarily

Could be linked.

Exact architecture decision.

---

# 125. No silent risk update

Any changed client risk state requires:

- new evidence;
- authorized recomputation;
- new version/date.

---

# 126. Analyst review in monitor

Material contradiction or paid high-stakes updated risk may route to analyst review.

Reuse `25`.

No new post-close analyst workflow.

---

# 127. Practitioner escalation

Reuse governed route.

---

# 128. Verification after intervention

Reuse `27`.

Monitoring data can feed outcome evidence where allowed.

---

# 129. No outcome leakage backward

Even if monitor observes event:

locked forecast remains unchanged.

---

# 130. Monitoring can begin before verification window closes

Yes, but verification status remains separate.

---

# 131. Observation can serve two purposes

Same evidence item may be relevant to:

- current risk re-measurement;
- future forecast verification.

Need separate relation metadata.

---

# 132. Do not duplicate source unnecessarily

One evidence item can have multiple lawful links.

---

# 133. Intervention contamination metadata

If intervention occurred:

verification record must know.

---

# 134. Re-measurement and economic exposure

Updated organizational risk may change economic exposure estimate.

But economic model must be recomputed under its own governed logic.

No automatic dollar update from categorical risk change.

---

# 135. No “value saved” claim

Even if risk falls after control.

Cannot infer causal savings without counterfactual method.

---

# 136. Economic effect claim

Need separate evidence:

- realized cost;
- avoided cost;
- timing;
- baseline.

Future research/product.

---

# 137. Longitudinal monitor value

Client value comes from:

- knowing what to watch;
- observing change;
- connecting interventions to evidence;
- detecting unresolved risk;
- preserving decision history.

Not generic dashboard activity.

---

# 138. Monitoring data minimization

Collect only what is relevant to:

- watchpoint;
- control;
- verification;
- re-measurement.

Not broad employee surveillance.

---

# 139. No always-on employee monitoring

Forbidden product drift.

---

# 140. No sentiment scraping

Unless separate lawful evidence source/method exists.

---

# 141. No Slack/email surveillance by default

Not product scope.

---

# 142. Connected apps future

Could connect systems later.

Needs privacy/security/methodology contract.

---

# 143. Person-level monitoring

Specific-leader channel remains separate.

Do not infer person state from generic post-close observations.

---

# 144. 42Q remeasurement

If repeated individual assessment ever allowed:

requires separate validated longitudinal 42Q contract.

Not implied here.

---

# 145. No public type changes

Same person-type publication prohibition.

---

# 146. Critical-role monitoring

Can track:

- role vacancy;
- departure;
- authority shift;
- capability continuity.

This is organizational/Deal evidence.

---

# 147. Role change vs behavior prediction

Keep separate.

---

# 148. Timeline display

Target monitor can show:

```text
Baseline
Close
Checkpoint 1
Intervention
Checkpoint 2
Re-measurement
Verification
```

Useful because time is central.

---

# 149. Timeline is evidence chronology

Not decorative project Gantt.

---

# 150. Timeline events

Only real events.

No expected events presented as occurred.

---

# 151. Planned vs observed styling

Clearly distinct.

---

# 152. Current time marker

Could be useful.

No need in exported static PDF.

---

# 153. Future planned checkpoint

Show as scheduled only if actual schedule exists.

---

# 154. Monitoring status

Potential:

- Not active
- Active
- Checkpoint due
- Evidence collection
- Re-measurement in review
- Updated assessment available
- Completed

Exact enum later.

---

# 155. No health color shorthand

`Active` not green risk.

---

# 156. Re-measurement status vs risk status

Separate.

---

# 157. Watchpoint state vs forecast verification status

Separate.

---

# 158. Intervention status vs effect status

Separate.

---

# 159. Four independent axes

At least:

1. monitoring workflow;
2. watchpoint observation;
3. intervention execution;
4. risk/effect assessment.

Avoid one `Integration health` metric.

---

# 160. Current Deal Workspace integration

Potential cards:

```text
Post-close monitor
Active · Day 60 checkpoint

Watchpoints
2 require review

Controls
1 in effect

Re-measurement
Evidence collection in progress

Current risk
Latest authorized assessment
```

Only actual capabilities.

---

# 161. No dashboard card proliferation

Show actionable info.

---

# 162. Watchpoint list

Each row:

- statement;
- review window;
- linked resource/mechanism;
- latest observation;
- status.

---

# 163. Suggested control action

Show if current report authorized.

---

# 164. Action taken

Separate field.

---

# 165. Latest observation

Summarized from evidence.

---

# 166. Evidence links

Accessible to authorized user.

---

# 167. Review checkpoint CTA

`Review watchpoints`

or specific:

`Review decision-authority watchpoint`.

---

# 168. Add observation CTA

Only if user has authority.

---

# 169. Record intervention CTA

Only when recommendation/control exists or user chooses authorized custom action.

---

# 170. Custom intervention

May be allowed as client record.

It should not automatically become MergeVue-recommended.

Label:

`Client-recorded action`.

---

# 171. Recommendation provenance

If control came from MergeVue:

link report version.

---

# 172. Client action provenance

If custom:

link user/time.

---

# 173. Intervention evidence

Can include:

- governance memo;
- meeting decision;
- policy;
- org chart;
- operating change.

Use private evidence contract.

---

# 174. Re-measure CTA

Only when enough new evidence / checkpoint rule.

---

# 175. “Re-run analysis” wording

Avoid.

Use:

`Re-measure current risk`

or specific accepted wording.

---

# 176. No re-run of locked forecast

Critical.

---

# 177. Re-measurement output

Target:

```text
Since baseline

Changed:
...
Unchanged:
...

New evidence:
...

Current assessment:
...

Remaining uncertainty:
...

Next control:
...
```

---

# 178. No score delta without valid scale

---

# 179. Trend indicator

Possible:

- Increased
- Decreased
- Unchanged
- Cannot determine

only if underlying risk state supports ordinal comparison.

---

# 180. Trend does not mean causal effect

Need separate label.

---

# 181. Control-effect section

Potential:

`Observed after intervention`

not:

`Impact caused by intervention`.

---

# 182. Baseline snapshot display

Always accessible.

---

# 183. Measurement history

List checkpoint versions.

---

# 184. No editing historical snapshots

---

# 185. Correction

Use new corrected record with audit, not overwrite.

---

# 186. Data retention

Longitudinal product creates more sensitive history.

Needs separate data-governance contract.

---

# 187. Client deletion rights

Not defined here.

---

# 188. Monitor archival

At Deal end:

monitor can be completed/archived.

History remains according to policy.

---

# 189. Exit / future diligence

Commercial North Star later contemplates execution evidence pack for future due diligence/exit.

Monitor data may support it.

But no automatic export/publication now.

---

# 190. Execution evidence pack is separate contract

Do not build inside Monitor first version.

---

# 191. Cross-Deal benchmarking

Future.

Requires:

- anonymization;
- data rights;
- sufficient corpus;
- comparability.

No benchmark cards now.

---

# 192. “Typical Day 60 risk” prohibited

Without actual validated corpus.

---

# 193. No industry benchmark invented

---

# 194. Internal R&D use

Longitudinal data can feed offline calibration/research if lawful.

Production model does not self-learn live.

---

# 195. Consent/data-rights boundary

Need explicit policy before reusing client monitoring data for global model improvement.

---

# 196. Evidence reuse firewall

One Deal's monitoring evidence does not silently enter another Deal.

---

# 197. Public case-study firewall

No automatic publication.

---

# 198. Analytics

Allowed operational product events:

```text
monitor_opened
checkpoint_opened
watchpoint_reviewed
observation_added
intervention_recorded
remeasurement_started
remeasurement_completed
updated_report_opened
```

No raw evidence/PII in generic analytics.

---

# 199. Reminder analytics

Separate from evidence.

---

# 200. No user-surveillance analytics

Do not infer integration health from product usage frequency.

---

# 201. Accessibility

Target WCAG 2.2 AA.

Need:

- timeline readable without color;
- status text;
- keyboard actions;
- accessible checkpoint tables;
- evidence source links;
- mobile reflow;
- no drag-only timeline;
- focus after observation/intervention save.

---

# 202. Mobile monitor

One-column priority:

1. Current checkpoint
2. Watchpoints requiring review
3. Controls in effect
4. Re-measurement
5. Updated risk
6. History

---

# 203. Desktop monitor

Can use two columns:

Main:

- watchpoints;
- observations;
- re-measurement.

Secondary:

- checkpoint;
- controls;
- baseline/current comparison.

Designer freedom.

---

# 204. No wall of charts

Time series only if actual repeated metric supports.

---

# 205. Categorical timeline

Often more honest than line chart.

---

# 206. Trend chart

Only if measurements are comparable and metric numeric.

---

# 207. No interpolation between checkpoints

Do not draw continuous line implying data where none exists.

---

# 208. Missing checkpoint

Show gap.

Do not smooth.

---

# 209. Delayed measurement

Record actual measurement date.

---

# 210. Checkpoint missed

Workflow state, not risk finding.

---

# 211. Monitoring pause

If client pauses:

do not infer stable state.

---

# 212. Resume

New observation resumes history.

---

# 213. Data staleness

Current risk should show measurement date.

Avoid stale state presented as current truth.

---

# 214. “Current” threshold

Product should define how long a re-measurement remains current.

No universal value invented here.

---

# 215. Stale assessment label

Potential:

`Last measured Sep 16, 2026`.

No fake live badge.

---

# 216. No “Live” unless actual continuous input

Absolute.

---

# 217. Real-time vs periodic

First product can be periodic.

Do not copy trading-dashboard language.

---

# 218. Monitoring evidence quality

Each observation can have evidence-quality state.

Do not count number of observations as certainty.

---

# 219. Conflicting monitoring evidence

Routes to contradiction/analyst review.

Reuse `25`.

---

# 220. Client may disagree

Client feedback can become new evidence/context.

Does not edit authoritative result directly.

---

# 221. Re-measurement authority

Server/governed pipeline computes result.

Client cannot manually set current risk.

---

# 222. Intervention success cannot be manually selected

Client can record implementation.

Effect is assessed.

---

# 223. Human analyst boundary

Some paid re-measurements may require analyst review.

No universal promise.

---

# 224. Automated re-measurement

Could be allowed if same production method supports evidence state deterministically.

Do not imply human review if none.

---

# 225. Provider/system failure

Remain distinct from diagnostic uncertainty.

A monitoring service outage is not:

`Cannot determine risk`.

---

# 226. Failure state

Example:

`Monitoring data could not be processed.`

Separate from:

`Current risk cannot be determined from available evidence.`

---

# 227. Retry

System failure can retry without changing assessment.

---

# 228. Observation upload failure

Preserve prior current state.

---

# 229. Partial checkpoint

If some watchpoints reviewed and others not:

workflow incomplete.

Do not update whole risk unless method allows partial re-measurement.

---

# 230. Scope-specific re-measurement

Could update one risk block while others remain prior version.

If product supports block-level versioning.

Otherwise issue full updated report after all required checks.

Needs architecture decision.

---

# 231. Report congruence recommendation

Prefer new overall current report version with block-level `unchanged/updated` metadata.

This preserves single canonical report truth.

---

# 232. Block-level delta

Useful fields:

```text
blockId
priorClaimIds[]
newClaimIds[]
changeType
evidenceRefs[]
```

Conceptual.

---

# 233. Unchanged block

Explicitly can say:

`No material change from baseline.`

Only after sufficient remeasurement scope.

---

# 234. Not remeasured block

Must say:

`Not reassessed at this checkpoint.`

Do not imply unchanged.

---

# 235. This distinction is critical

`Unchanged` = measured, no material delta.

`Not reassessed` = no new conclusion.

---

# 236. Current report composition

A current report may include:

- updated blocks;
- carried-forward unchanged blocks;
- explicitly not reassessed blocks.

Need provenance.

---

# 237. Carried-forward claim

Should retain original evidence/version reference.

---

# 238. No silent carry-forward

User should know when claim is old.

---

# 239. Evidence freshness

Display last measured date per key block if useful.

---

# 240. Monitor and Decision Gap

Re-measurement may:

- close old Decision Gap;
- preserve it;
- create new one.

---

# 241. New Decision Gap

Becomes next evidence/control question.

---

# 242. Monitoring is not infinite

Each checkpoint should have decision relevance.

If no useful watchpoint remains:

monitor can complete.

---

# 243. No recurring revenue for its own sake

Commercial North Star recurring revenue must come from ongoing decision value, not unnecessary rechecks.

---

# 244. Monitor stop criteria

Potential:

- observation horizon ended;
- risk stabilized;
- Deal integration phase complete;
- engagement ended;
- client stops.

Exact rules separate.

---

# 245. Verification still occurs even if monitor stops

If eligible forecast window later closes and outcome evidence exists.

Separate obligation.

---

# 246. Monitoring can continue after verification

Because updated risk/control loop is different.

---

# 247. Outcome verification can be one checkpoint inside history

But not the same object.

---

# 248. Client workflow example

```text
Baseline report released
Forecast locked

Day 30 checkpoint
Watchpoint observed: decision delays
Control introduced: joint approval rule

Day 60 checkpoint
New observations collected
Re-measurement: conflict remains but escalation frequency decreased

Updated risk
High → Medium

Next control
Maintain joint approval rule and test authority handoff at Day 100

Forecast verification
Still pending until observation window closes
```

Illustrative structure only; not default content.

---

# 249. No generic Day 100 control

Example above not product rule.

---

# 250. Trust level

## Current trust stage

Authenticated paid Deal with released analysis and explicit post-close monitoring engagement.

## Data already permissible

- prior Deal evidence;
- released report;
- watchpoints;
- controls;
- new Deal-specific observations;
- post-close documentary evidence relevant to monitored risks.

## Data not automatically permissible

- broad employee communications;
- unrelated HR records;
- continuous messaging/email surveillance;
- person-level psychometric data;
- cross-Deal evidence;
- public case-study publication rights.

## Next trust escalation

Only if monitoring needs:

- a new respondent;
- sensitive private evidence;
- person-level forecast;
- external system connector;
- cross-organization collaboration.

## Value that must precede escalation

The user must already understand:

- what specific watchpoint is being measured;
- why additional evidence is needed;
- what decision it can change.

---

# 251. Privacy principle

Monitoring creates risk of product creep into surveillance.

Therefore:

> collect only Deal-relevant evidence required by explicit watchpoints and controls.

---

# 252. No passive employee profiling

Absolute.

---

# 253. No individual ranking

---

# 254. No automated HR action

---

# 255. No hidden employee monitoring

---

# 256. Respondent notification/consent

Use appropriate respondent flow where human input collected.

Do not bypass invite/privacy because Deal is post-close.

---

# 257. Existing invite infrastructure

Reuse `23`.

---

# 258. Private document infrastructure

Reuse `24`.

---

# 259. Analyst adjudication

Reuse `25`.

---

# 260. Forecast lock

Reuse `26`.

---

# 261. Outcome verification

Reuse `27`.

---

# 262. Monitor is orchestration layer

It composes existing evidence/governance layers.

It should not fork them.

---

# 263. Route architecture

No current production Monitor route established.

Potential:

- Deal Workspace tab/sub-surface;
- `/deals/:dealId/monitor`.

Not authorized here.

---

# 264. Prefer Deal-local surface

Monitor belongs within Deal, not global top-level app in first version.

---

# 265. Global “Monitor” nav

Do not add unless users actively manage multiple monitored Deals.

---

# 266. Deals index future state

Could show:

`Checkpoint due`

for monitored Deal.

Only once monitor real.

---

# 267. No fake dashboard status in Deals list

---

# 268. Entitlement gate

Monitoring may be paid/recurring.

Exact commercial package separate.

---

# 269. Entitlement expiry

Need policy for read-only historical access vs new monitoring actions.

Not defined here.

---

# 270. Historical monitoring data should not vanish solely due subscription end

Policy/security/commercial decision.

Do not assume deletion.

---

# 271. Notifications contract needed later

Potential separate file.

---

# 272. External integration contract needed later

For connected data sources.

---

# 273. Longitudinal evidence governance contract needed later

For retention, anonymization, cross-Deal research use.

---

# 274. Execution Evidence Pack contract later

Stage J.

---

# 275. Current asset decision matrix

| Existing asset | Decision |
|---|---|
| Semantic `WATCHPOINT` | **KEEP** |
| Watch & Control Timeline | **KEEP / DEEPEN** |
| Review windows | **KEEP** |
| Suggested control action linkage | **KEEP** |
| Structural watchpoints | **KEEP** |
| Day 0–30 / 30–60 / 6–18 timing primitives | **KEEP ONLY WHEN GOVERNED FOR THAT WATCHPOINT** |
| Prediction / sealed forecast | **KEEP AS IMMUTABLE BASELINE** |
| Evidence flows | **REUSE** |
| Contradiction/analyst review | **REUSE** |
| Outcome verification | **REUSE, DO NOT MERGE** |
| Re-measurement loop | **TARGET, NOT CURRENT PRODUCTION** |
| Recurring Monitor | **TARGET, NOT CURRENT PRODUCTION** |
| Generic live dashboard | **DO NOT ADD** |
| Continuous employee surveillance | **FORBIDDEN PRODUCT DRIFT** |
| Whole-diagnostic automatic rerun | **DO NOT DO BY DEFAULT** |

---

# 276. Target first-version Monitor surface

Minimum viable:

```text
Deal identity

Monitoring status
Current checkpoint

Watchpoints
  statement
  review window
  latest observation
  evidence

Controls
  recommended
  action taken
  status

Re-measurement
  scope
  evidence status
  current authorized result

Baseline vs current
  changed
  unchanged
  not reassessed

Next control / next review
```

---

# 277. First-version implementation can be manual/checkpoint-based

No requirement for:

- continuous connectors;
- streaming events;
- automatic alerts;
- mobile push;
- Slack;
- email ingestion.

---

# 278. Target data relationships

Conceptual:

```text
Deal
├── Baseline report
├── Forecasts
├── Watchpoints
├── Checkpoints
│   ├── Observations
│   ├── Evidence
│   └── Interventions
├── Re-measurements
└── Updated report versions
```

---

# 279. No parallel monitor truth

Latest re-measurement should feed same Deal/report architecture.

Not a separate dashboard with independent risk labels.

---

# 280. Current source audit requirement

Before implementation, inspect exact current source for:

- watchpoint construction;
- action linkage;
- review-window semantics;
- timeline generation;
- affected resources;
- confidence/disclosure behavior.

No static reuse of fixture copy.

---

# 281. Fixture text warning

Current validation fixtures include concrete watchpoint/timeline examples.

These validate rendering.

They are not default customer content.

---

# 282. No fixture leakage

Absolute.

---

# 283. Legacy timeline text review

Any existing static Day 30/60/6–18 strings must be checked against current source authority before production monitor reuse.

---

# 284. Monitoring method version

Each checkpoint/remeasurement records method version.

---

# 285. Instrument version

If respondent instrument repeated:

record canonical version.

---

# 286. Evidence schema version

As needed.

---

# 287. Control version

If recommendation changes:

new control version or history record.

---

# 288. Reproducibility

Given same:

- baseline;
- observations;
- evidence;
- intervention state;
- method version;

system should reproduce re-measurement result.

---

# 289. No hidden manual adjustment

If analyst changes finding:

record via governed analyst workflow.

---

# 290. Current state freshness

Every current-state claim should be date-bound.

---

# 291. “As of” label

Useful:

`Current assessment as of Sep 16, 2026`

if exact.

---

# 292. No timeless current risk

---

# 293. Print/export

A monitoring snapshot should preserve:

- baseline reference;
- checkpoint date;
- observations;
- interventions;
- re-measurement;
- updated risk;
- next control;
- limitations.

---

# 294. Export is snapshot

Not live link.

---

# 295. Monitor PDF

Separate artifact generation can reuse report canon later.

Not required first version.

---

# 296. Audit footer

Potential:

- Deal ID;
- baseline report version;
- checkpoint ID;
- re-measurement version;
- evidence scope;
- current as-of date.

No internal provider.

---

# 297. Client communication tone

Professional, operational, non-alarmist.

Avoid:

- “integration health is collapsing”;
- “red alert”;
- “culture crisis”.

Use evidence-grounded wording.

---

# 298. American English

All product copy.

---

# 299. No moral labels

Environment/risk remains structural.

---

# 300. Acceptance criteria

Post-close Monitor / Re-measurement passes only if:

1. current product truth labels it target until implemented;
2. Monitor belongs to Deal;
3. baseline report preserved;
4. locked forecast preserved;
5. no forecast text rewritten;
6. verification remains separate;
7. monitoring remains separate;
8. re-measurement remains separate;
9. watchpoint remains distinct from forecast;
10. watchpoint has observable statement;
11. watchpoint has governed review window;
12. watchpoint links to source report/finding;
13. control action linkage preserved;
14. recommended action distinct from action taken;
15. intervention explicitly recorded;
16. intervention timing preserved;
17. intervention effect not self-declared as fact;
18. observations have provenance;
19. observations have timestamps;
20. source type retained;
21. no observation from unsupported source treated as authoritative;
22. `Not observed` does not automatically resolve risk;
23. `Observed` does not prove cause;
24. re-measurement has explicit trigger;
25. re-measurement has explicit baseline;
26. re-measurement has scoped evidence;
27. no whole diagnostic rerun by default;
28. canonical questionnaire unchanged if repeated;
29. no ad-hoc questionnaire questions inserted;
30. updated risk requires new evidence;
31. prior risk not overwritten;
32. risk can improve;
33. risk can worsen;
34. risk can remain unchanged;
35. risk can become indeterminate;
36. current-state claims are date-bound;
37. `Unchanged` distinct from `Not reassessed`;
38. carried-forward claims retain prior provenance;
39. no silent carry-forward;
40. new contradictions retained;
41. analyst review reused where required;
42. private evidence flow reused;
43. respondent flow reused;
44. verification flow reused;
45. post-T0 evidence does not contaminate pre-T0 baseline;
46. formation-window delta remains separate from post-close state;
47. close must be confirmed before post-close monitor;
48. expected close date alone insufficient;
49. monitoring cadence derives from governed watchpoints;
50. no universal Day 30/60/100/6/12/18 schedule;
51. no `Live` label without continuous real input;
52. no continuous-monitoring marketing claim without real service;
53. no fake alerts;
54. no fake email/SMS notifications;
55. no generic PMO task system;
56. no generic employee pulse survey;
57. no hidden employee surveillance;
58. no Slack/email surveillance by default;
59. no person-level inference from organization observations;
60. 42Q remains separate;
61. no individual ranking;
62. no automated employment decisions;
63. no causal claim from simple before/after association;
64. no “value saved” claim from risk reduction;
65. economic update uses governed economics path;
66. monitor does not self-tune production model;
67. longitudinal data reuse requires rights/governance;
68. no cross-Deal silent evidence reuse;
69. no public case publication without authority;
70. no benchmark claim without corpus;
71. no generic health score;
72. no arbitrary numeric risk delta;
73. timeline events distinguish planned vs occurred;
74. missed checkpoint not interpreted as risk event;
75. paused monitor does not imply stability;
76. stale assessment clearly dated;
77. client cannot manually set authoritative risk state;
78. client cannot manually set intervention effectiveness;
79. system failure distinct from analytical uncertainty;
80. partial checkpoint does not silently update full risk;
81. report congruence maintained;
82. new current report version has provenance;
83. monitoring history is immutable/versioned;
84. route not invented without route decision;
85. backend persistence required;
86. server authority required for updated risk;
87. exact watchpoint/control semantics sourced from current authority;
88. fixture copy never used as default content;
89. visual system remains MergeVue;
90. no dashboard chart invented without data;
91. missing data shown as gap, not interpolated;
92. WCAG 2.2 AA target maintained;
93. mobile monitoring hierarchy remains usable;
94. no sensitive content in marketing analytics;
95. every added evidence request explains why;
96. trust escalation is minimal;
97. monitoring may legitimately end;
98. recurring revenue does not justify unnecessary checkpoints;
99. updated assessment can say `Cannot determine`;
100. every change from baseline is evidence-traceable.

---

# 301. Финальный принцип

> **Monitoring does not mean repeatedly asking the whole organization the same questions. It means knowing which previously identified signals matter, when they should be observed, what intervention occurred, and what evidence would justify changing the current assessment.**

> **Verification asks whether a prior forecast was right. Re-measurement asks what the evidence supports now. Those are different questions and must never overwrite one another.**

> **The longitudinal value of MergeVue comes from preserving the full chain — baseline, prediction, watchpoint, observation, intervention, re-measurement, effect and next control — without rewriting history at any step.**
