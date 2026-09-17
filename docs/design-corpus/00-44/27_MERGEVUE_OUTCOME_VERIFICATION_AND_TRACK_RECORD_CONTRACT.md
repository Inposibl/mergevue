# 27. Контракт outcome verification и track record MergeVue

**Статус документа:** управляющий target-contract / prospective verification, anti-hindsight and track-record governance  
**Файл:** `27_MERGEVUE_OUTCOME_VERIFICATION_AND_TRACK_RECORD_CONTRACT.md`  
**Версия:** 1.0  
**Дата:** 16 сентября 2026 года  
**Язык документации:** русский  
**Язык клиентского интерфейса:** только American English  
**Рынок первой версии:** США  
**Входной контракт:** `26_MERGEVUE_PAID_REPORT_RELEASE_AND_FORECAST_LOCK_CONTRACT.md`  
**Главный принцип:** outcome verification сравнивает фактический outcome с точным ранее зафиксированным forecast; verification не имеет права переписывать forecast, observation window, falsification condition или evidence cutoff после появления outcome  
**Фиксированный outcome vocabulary:** `Confirmed / Partially confirmed / Not determinable / Missed / Falsified`  
**Ключевые инварианты:** `VERIFY THE LOCKED CLAIM`, `NO HINDSIGHT REWRITE`, `OUTCOME EVIDENCE ≠ FORECAST BASIS`, `NOT DETERMINABLE IS VALID`, `MISS ≠ FALSIFICATION`, `VERIFICATION ≠ CALIBRATION`, `CALIBRATION ≠ PUBLIC ACCURACY CLAIM`, `NO HARDCODED TRACK RECORD`

---

# 0. Назначение

Этот документ определяет product/governance flow:

```text
Locked / sealed forecast
→ observation window
→ outcome evidence collection
→ outcome adjudication
→ verification record
→ forecast status
→ eligible verification corpus
→ aggregate track-record calculation
→ public/client track-record disclosure only if statistically and methodologically lawful
```

Он не определяет:

- новый forecast;
- изменение старого forecast;
- методологическое retuning;
- публичный accuracy claim;
- исторический case-study replay;
- investor marketing copy;
- автоматическую calibration update.

---

# 1. Главный вопрос verification

Verification отвечает:

> `What actually happened during the observation window, and how does that outcome compare with the exact forecast that was fixed beforehand?`

Не:

> `Can we reinterpret the forecast so it looks right?`

Не:

> `Did the deal succeed overall?`

Не:

> `Was MergeVue generally useful?`

---

# 2. Current implementation reality

В текущем `main` присутствуют:

- sealed prediction schema;
- verification-log schema;
- calibration-log schema;
- accuracy-dashboard schema/rows;
- prediction ledger infrastructure;
- report/audit references to verification.

Но текущие generated verification/calibration rows являются **example/schema material**, а не доказанной production calibration dataset.

Следовательно:

> **verification framework exists; production verified track record must not be inferred from placeholder/example rows.**

---

# 3. Current methodology principle — preserve

Current report-source material states in substance:

- sealed prediction is verified by observing actual Deal outcome over the prediction window;
- each verification point is recorded;
- correct prediction can strengthen methodological credibility;
- incorrect prediction requires methodological review;
- sealed predictions cannot be quietly retracted.

Это правильная governance direction.

---

# 4. Verification is not optional reputation management

Every forecast eligible for verification should eventually receive one of the governing statuses when the protocol permits.

Нельзя:

- verify only successes;
- omit misses;
- hide falsifications;
- leave difficult forecasts permanently `Pending` after sufficient outcome evidence exists.

---

# 5. Verification unit

Primary unit:

> **one specific locked forecast claim/version**

Not automatically:

- one Deal;
- one report;
- one company pair.

A Deal can contain multiple independently verifiable forecast claims.

---

# 6. Forecast identity prerequisite

Verification requires stable:

- forecast ID;
- forecast version;
- Deal ID;
- report/version linkage;
- lock/seal record where applicable.

No verification against reconstructed prose.

---

# 7. Exact locked claim is authority

Reviewer must retrieve:

- exact claim;
- exact observation window;
- exact observable signal;
- exact falsification condition;
- exact scope;
- exact evidence cutoff;
- exact forecast version.

Never rely on memory or latest report wording.

---

# 8. No hindsight rewrite

After outcome becomes observable, prohibited:

- edit claim wording;
- widen observation window;
- narrow subject;
- change threshold;
- replace falsification condition;
- add qualifying caveat that was not present;
- reinterpret forecast type to avoid a miss.

---

# 9. Clarification vs rewrite

If forecast wording was ambiguous before outcome:

that ambiguity itself matters.

Do not resolve ambiguity in whichever direction favors result.

Possible verification outcome:

`Not determinable`

if exact meaning cannot be established lawfully.

---

# 10. Outcome evidence is a separate lane

Forecast-basis evidence:

> evidence admissible before the lock/evidence cutoff.

Outcome evidence:

> evidence used later to determine what actually happened.

They must remain structurally separate.

---

# 11. No backflow from outcome to forecast basis

Outcome sources cannot be inserted retroactively into:

- original evidence set;
- original analyst rationale;
- original forecast confidence;
- original pre-outcome report.

They can only support verification/post-outcome analysis.

---

# 12. Outcome evidence provenance

Every material outcome claim should retain:

- source;
- date;
- publication/production date;
- event date where different;
- source party;
- locator;
- access class;
- review state.

---

# 13. Public vs private outcome evidence

Outcome evidence may be:

- public filing;
- press release;
- credible reporting;
- internal client data;
- governance record;
- respondent follow-up;
- operational metric;
- private document.

Source class must remain visible internally.

---

# 14. Outcome evidence ≠ truth automatically

A later press release may be:

- incomplete;
- promotional;
- delayed;
- legally constrained.

A private update may be:

- partial;
- self-serving;
- unverified.

Outcome adjudication still requires evidence quality review.

---

# 15. Observation window

Verification cannot freely choose when to inspect.

Use the locked forecast's governing window.

---

# 16. Window not yet open

Status:

`Verification not yet due`

or equivalent.

Do not mark forecast:

- Confirmed;
- Missed;
- Falsified

before protocol allows.

---

# 17. Window open

Status:

`Observation window open`

if useful.

May collect evidence without premature final adjudication.

---

# 18. Window closed

Verification becomes due if sufficient evidence can be collected.

---

# 19. Deadline ambiguity

If exact window in locked forecast is ambiguous:

do not repair after fact.

Potentially `Not determinable`.

---

# 20. Fixed outcome vocabulary

Client/internal verification result must use exactly:

- `Confirmed`
- `Partially confirmed`
- `Not determinable`
- `Missed`
- `Falsified`

No substitute vocabulary such as:

- Correct;
- Mostly right;
- Wrong;
- Inconclusive;
- Failure;
- Hit.

---

# 21. Confirmed

Use only when the locked claim's required observable condition is satisfied within its governing window according to pre-defined verification rule.

`Confirmed` does not mean:

- entire Deal thesis correct;
- all report claims correct;
- MergeVue validated globally.

---

# 22. Partially confirmed

Use only when governing verification protocol defines a legitimate partial condition.

It must not become:

> convenient bucket for forecasts that were almost right.

Need explicit pre-defined criteria.

---

# 23. Not determinable

First-class result.

Use when:

- outcome evidence insufficient;
- source conflict unresolved;
- observation cannot be made reliably;
- transaction changed such that claim cannot be judged under protocol;
- forecast wording/window lacks enough determinacy;
- required event data unavailable.

It is not a miss.

It is not a success.

---

# 24. Missed

`Missed` and `Falsified` must remain distinct.

A miss may mean:

> forecasted event did not occur as specified within its window, without satisfying the stronger falsification condition.

Exact definition must be protocol-bound.

---

# 25. Falsified

Use when locked falsification condition is satisfied or the governing verification rule positively establishes contradiction of the forecast.

This is stronger than:

`Missed`.

---

# 26. No post-hoc outcome definitions

Definitions of:

- Confirmed;
- Partially confirmed;
- Missed;
- Falsified

must exist before aggregate performance is calculated.

Do not tune categories after seeing results.

---

# 27. Verification rule object

Conceptual target:

```text
verificationRuleId
forecastId
forecastVersion

claimType
observationWindow
confirmationCriterion
partialConfirmationCriterion?
missCriterion
falsificationCriterion
requiredEvidenceClass
minimumEvidenceStandard
adjudicationPolicy
ruleVersion
```

Not final database schema.

---

# 28. Criteria should be machine-readable where practical

Example:

- date boundary;
- event presence;
- count threshold;
- direction;
- role departure;
- governance change.

But human evidence judgment may still be required.

---

# 29. No verification by sentiment

Not:

`This feels broadly consistent.`

Need claim-specific comparison.

---

# 30. Claim decomposition

If one forecast sentence contains multiple independently material predictions:

verification must know whether claim is:

- atomic;
- conjunctive;
- multi-part.

Do not improvise scoring after outcome.

---

# 31. Forecast atomicity

Preferred:

one verification unit = one evaluable claim.

If multi-part forecast is already sealed:

verification protocol must respect original logic.

---

# 32. No splitting after outcome to rescue score

Cannot take one failed compound forecast and split out one successful phrase post hoc unless original schema pre-defined subclaims.

---

# 33. No merging after outcome

Same.

---

# 34. Outcome verification record

Target record should include:

```text
verificationId
forecastId
forecastVersion
sealId?
dealId

verificationRuleId
verificationRuleVersion

windowStart
windowEnd

outcomeStatus

outcomeSummary
supportingOutcomeEvidenceIds[]
contradictingOutcomeEvidenceIds[]

adjudicatorId
verifiedAt

limitations
followUp?
```

---

# 35. Forecast record is immutable input

Verification record references it.

Does not modify it.

---

# 36. Verification record versioning

If new outcome evidence appears after first verification:

do not silently rewrite old verification.

Use:

- amended verification;
- superseding verification;
- review state,

according to governance.

Preserve history.

---

# 37. Preliminary vs final verification

Potential states:

- evidence collection;
- under review;
- verification complete.

Do not expose outcome status as final while adjudication pending.

---

# 38. Client-facing verification surface

Within Deal Workspace:

```text
Forecast
[exact locked claim]

Verification
Status: Confirmed

Observation window
...

What happened
...

Evidence
...

Verified on
...
```

Only after authoritative verification.

---

# 39. Before verification complete

Client sees:

`Verification pending`

not provisional `Confirmed`.

---

# 40. Verification is tied to forecast, not report hero

Do not replace current report status with verification result.

Report remains historical artifact.

---

# 41. Multiple forecasts

Deal Workspace can show:

```text
Forecast 1 — Confirmed
Forecast 2 — Not determinable
Forecast 3 — Falsified
```

No forced single Deal accuracy status.

---

# 42. No overall Deal “score”

Do not calculate:

`Deal forecast accuracy: 67%`

without accepted aggregation method.

---

# 43. Verification and intervention

If client followed recommended action, observed outcome may be affected by intervention.

This is important.

A forecast about untreated trajectory and an outcome after intervention are not automatically directly comparable.

---

# 44. Intervention must be recorded

Where materially relevant:

- what control/action was applied;
- when;
- intended mechanism.

Do not retroactively call altered outcome a forecast failure without protocol.

---

# 45. Prediction vs control-system distinction

Future longitudinal product may ask:

> did intervention reduce predicted risk?

That is different from:

> was original forecast confirmed?

Keep separate.

---

# 46. Avoid self-invalidating success confusion

Example:

MergeVue forecasts governance conflict.

Client changes governance preemptively.

Conflict does not appear.

This may be:

- successful intervention;
- forecast not directly observable under original untreated condition;
- protocol-specific outcome.

Do not automatically label `Missed`.

---

# 47. Intervention-aware verification protocol required

Before longitudinal commercial use, define how intervention affects verification eligibility.

Potential classifications are separate from fixed outcome result.

---

# 48. Do not change five result labels

Intervention metadata may affect:

- eligibility;
- interpretation;
- track-record inclusion.

Not add a sixth result like:

`Prevented`.

Unless Owner explicitly changes vocabulary.

---

# 49. Transaction cancellation

If Deal terminates before relevant window:

verification may become `Not determinable` or ineligible depending protocol.

Not automatically Falsified.

---

# 50. Major scope change

If transaction structure changes materially:

record.

Do not silently judge original claim against a different Deal.

---

# 51. Named-leader departure forecast

Outcome verification needs:

- exact leader identity;
- exact departure/change definition;
- exact window;
- reliable source.

No rumor-based verification.

---

# 52. Organization-level forecast

Outcome evidence must match organization-level scope.

Do not use one person's anecdote as sole verification unless forecast criterion permits.

---

# 53. Resource/mechanism forecast

Need observable tied to specified mechanism.

Do not verify from general bad performance.

---

# 54. Timing verification

Event occurring outside locked window cannot be simply counted as Confirmed.

Protocol may classify Missed or other lawful status.

Do not move window.

---

# 55. Direction verification

If prediction specifies direction:

opposite direction may support Falsified depending criterion.

---

# 56. Magnitude verification

If prediction includes magnitude/range:

must judge against locked range.

Do not ignore range after outcome.

---

# 57. Confidence is not verification outcome

High-confidence forecast can be Falsified.

Low-confidence forecast can be Confirmed.

Do not weight the label itself emotionally.

---

# 58. Seal status is not verification status

`SEALED` means fixed record.

Does not mean confirmed.

---

# 59. Released report is not verified report

Same.

---

# 60. Verification evidence review

Outcome evidence should support states like:

- unreviewed;
- under review;
- verified for purpose;
- disputed,

or equivalent.

Do not produce final status from unreviewed evidence.

---

# 61. Contradictory outcome evidence

If sources disagree materially:

`Not determinable` may be appropriate until resolved.

Do not cherry-pick favorable source.

---

# 62. Outcome adjudicator

Could be:

- governed internal analyst;
- practitioner;
- future independent verifier.

Exact role policy separate.

Do not let ordinary client user self-select final verification result.

---

# 63. Client-provided outcome evidence

Client may provide evidence.

They cannot directly set:

`Confirmed`.

System/reviewer adjudicates.

---

# 64. Independent verification

For public track-record claims, independent verification may be required by governance.

This is distinct from normal client-facing verification.

---

# 65. Internal verification ≠ external validation

A MergeVue analyst confirming a forecast under protocol is not the same as external scientific validation of methodology.

---

# 66. Historical replay ≠ prospective verification

Critical boundary.

Historical case replay can be:

- hindsight-resistant;
- PRE-T0;
- independently verified.

But it is still not the same population/event class as genuinely prospective sealed client forecasts.

---

# 67. Track record should distinguish evidence classes

Potential internal categories:

- retrospective historical replay;
- blind held-out historical;
- prospective sealed Deal forecast;
- post-close monitored forecast.

Do not mix into one headline percentage.

---

# 68. Public track record hierarchy

If published, separate:

```text
Historical retrospective evaluation
Prospective sealed forecasts
Verified prospective outcomes
```

Do not call all:

`Prediction accuracy`.

---

# 69. Current calibration framework is not current calibration evidence

Current repository material includes:

- verification log schema;
- calibration log schema;
- accuracy dashboard rows.

But accepted contract explicitly notes example rows only and no actual calibration data.

Therefore:

> **NO CURRENT NUMERIC ACCURACY CLAIM MAY BE DERIVED FROM THOSE EXAMPLE ROWS.**

---

# 70. Accuracy dashboard must derive, never hardcode

Existing source itself states accuracy/dashboard figures derive from `VERIFICATION_LOG` and should never be hardcoded.

Preserve this rule.

---

# 71. No decorative 77.77%

Do not display a project threshold or historical mapping statistic as production forecast accuracy.

Different denominators/questions.

---

# 72. No 70% legacy claim

Any legacy public claim such as:

`70%`

must remain removed unless supported by current eligible verification corpus and approved claim methodology.

---

# 73. Numeric claim requires eligibility rules

Before aggregate metric:

define which verification records count.

---

# 74. Track-record eligibility object

Conceptual:

```text
eligibilityRuleVersion

requiresProspectiveLock
requiresProductionGradeSeal?
requiresCompleteVerification
allowedOutcomeStatuses[]
interventionPolicy
scopeChangePolicy
cancellationPolicy
duplicateForecastPolicy
supersessionPolicy
independencePolicy
minimumEvidenceStandard
```

---

# 75. Eligible denominator must be fixed before counting

No removing difficult cases after outcome.

---

# 76. Ineligible records remain visible internally

Do not delete.

Need reason:

- no production-grade seal;
- observation not possible;
- test/non-production Deal;
- duplicated forecast;
- protocol violation;
- intervention contamination;
- missing outcome evidence;
- canceled Deal.

---

# 77. Not determinable denominator policy

Must be explicitly defined.

Options are methodological decisions.

Do not silently:

- exclude to inflate accuracy;
- count as miss;
- count as half-hit.

---

# 78. Partially confirmed scoring policy

Also must be defined before numeric aggregation.

Do not improvise:

`0.5`.

---

# 79. Missed vs Falsified scoring policy

Distinct labels may or may not map to same aggregate metric.

Needs methodology authority.

---

# 80. Confirmed is not necessarily binary “correct”

For complex claim, protocol semantics govern.

Do not assume 1.0 in a metric before approved mapping.

---

# 81. Corpus sufficiency before numeric claim

Before any accuracy percentage is published, establish:

- outcome variable;
- observation rule;
- observation window;
- estimand;
- unit of observation;
- dependence structure;
- uncertainty method;
- chance/baseline comparator.

---

# 82. Small corpus warning

A perfectly sealed, independently verified, hindsight-resistant corpus may still be:

- too small;
- too clustered;
- too curated

to support a conventional accuracy claim.

No marketing exception.

---

# 83. Dependence structure

Multiple forecasts within one Deal may not be statistically independent.

Do not count them as independent N automatically.

---

# 84. Same company repeated

Also potentially dependent.

---

# 85. Same environment pair repeated

Potential dependence/cluster.

Need statistical treatment.

---

# 86. Curated client population

Prospective paid clients may not represent all M&A.

Public generalization must match population.

---

# 87. Outcome availability bias

Deals with easy public outcomes may differ from those without observable outcomes.

Track-record methodology must address.

---

# 88. Publication bias

Cannot publish only favorable verification examples and call it track record.

---

# 89. Verification lag

Some forecasts need long windows.

Dashboard must distinguish:

- eligible and verified;
- not yet due;
- outcome unavailable.

---

# 90. Pending cases not failures

Not yet due should not enter denominator as miss.

---

# 91. Track-record cohort freeze

For a formal published statistic:

freeze:

- cohort;
- cutoff date;
- eligibility rule version;
- metric definition.

Then calculate.

---

# 92. No rolling cherry-pick

A live dashboard can update only by deterministic inclusion rules.

Not manually selecting latest successes.

---

# 93. Metric versioning

If calculation method changes:

new metric version.

Do not silently recalculate historical marketing claim under new rules.

---

# 94. Confidence intervals / uncertainty

Any numeric aggregate should show uncertainty appropriate to sample/dependence.

Do not publish bare percentage if method requires interval.

---

# 95. Base-rate comparison

If claiming predictive value:

compare to appropriate baseline.

Not always coin flip.

---

# 96. No “better than chance” without defined chance baseline

M&A forecast event rates may be highly imbalanced.

---

# 97. Track record vs calibration

Track record summarizes observed verification outcomes.

Calibration asks whether probability/confidence statements correspond to frequencies.

Different.

---

# 98. Calibration requires probabilistic output

If forecast is categorical/non-probabilistic:

cannot claim probability calibration just from confirmed count.

---

# 99. Categorical confidence calibration

Could be studied later.

Requires sufficient records per confidence class and pre-defined method.

---

# 100. No calibration dashboard from one example row

Absolute.

---

# 101. Calibration log purpose

May record:

- predicted probability/confidence;
- observed outcome;
- calibration update.

But current example schema does not itself establish usable calibration.

---

# 102. Production calibration updates

Must not automatically retune live production model after every outcome.

---

# 103. Production freeze principle

Outcome verification feeds offline R&D/calibration pipeline.

Production changes require:

- offline analysis;
- blind evaluation;
- non-regression;
- independent verification where required;
- governed release.

---

# 104. No online self-learning

Do not tell clients:

`The model learns from every Deal in real time`

unless actual controlled system supports that — and such direct retuning would conflict with production freeze principles.

---

# 105. Failed forecast as R&D evidence

A miss/falsification is valuable.

It may indicate:

- evidence gap;
- rule weakness;
- forecast overreach;
- timing error;
- hidden condition.

It does not automatically authorize production fix.

---

# 106. Root-cause analysis of miss

Internal R&D may classify later.

Keep separate from verification status.

---

# 107. Verification status remains historical fact

Even if method improves later:

old `Falsified` does not become `Confirmed`.

---

# 108. Re-evaluation under new method

Could be a separate retrospective analysis.

Never overwrite original prospective verification.

---

# 109. Public track record transparency

If MergeVue later publishes performance:

state:

- cohort period;
- number eligible;
- number verified;
- number not determinable;
- metric definition;
- uncertainty;
- prospective vs retrospective composition;
- cutoff date.

No single unexplained percentage.

---

# 110. Client-specific track record

A client may see their own Deal verification history.

That is different from global product track record.

---

# 111. Confidentiality

A verified client forecast does not automatically become public case study.

Need explicit publication authority/permission.

---

# 112. Public anonymization

If future track record aggregates confidential Deals:

data-rights/privacy contract required.

Do not assume permission.

---

# 113. Case-study publication is separate

A Deal may be:

- verified;
- eligible for aggregate anonymous metrics;
- not publishable as named case study.

Separate gates.

---

# 114. Outcome Verification page — target status

No dedicated production customer-facing outcome-verification surface has been established by the audited `main` search.

Therefore:

> this document defines target functionality, not a currently existing route.

---

# 115. No route creation yet

Potential future:

- within `/deals/:dealId`;
- forecast detail sub-surface;
- verification panel.

Exact route requires explicit route decision.

---

# 116. Verification belongs inside Deal

Primary home:

`Deal → Forecast → Verification`

Not global disconnected verification tool.

---

# 117. Global track-record surface is separate

If later public:

could be methodology/track-record page.

Requires separate contract and numeric claim gate.

---

# 118. Deal Workspace integration

Workspace can show:

```text
Forecast
Sealed · Forecast v1

Verification
Due Oct 15, 2026
```

only if exact window supports due date.

---

# 119. Current time awareness

Due state must derive from server/current date relative to locked observation window.

No static labels.

---

# 120. Verification due reminder

Future notification.

Separate communication contract.

---

# 121. Outcome collection request

If client must provide private outcome evidence:

explain:

- what event/data is needed;
- why;
- period;
- source quality.

Not:

`Tell us whether we were right.`

---

# 122. Neutral evidence request

Example:

`Provide the final decision-rights record in effect during the observation window.`

Not:

`Provide proof that the forecast came true.`

---

# 123. Avoid confirmation bias

Outcome evidence request should seek both:

- confirming;
- disconfirming evidence.

---

# 124. Reviewer blind framing

Where practical, verifier should evaluate outcome criteria against fixed claim, not marketing desire.

Possible independent verifier for public track-record cohort.

---

# 125. Automated outcome detection

May assist:

- event dates;
- public filing occurrence;
- executive departures;
- governance announcements.

But final status only automatically assigned when rule is truly deterministic and source authority sufficient.

---

# 126. LLM verification boundary

LLM can:

- find sources;
- summarize outcome evidence;
- map candidate evidence.

LLM cannot freely decide status without governing rule/review where ambiguity exists.

---

# 127. Source-backed verification

Every status except perhaps pure deterministic system event should have evidence IDs.

---

# 128. No “AI says confirmed”

Client sees evidence-based status.

---

# 129. Verification narrative

Optional client paragraph:

`What happened`

must be derived from verification record/evidence.

Not a fresh LLM interpretation beyond source.

---

# 130. Verification limitations

Always available.

Example:

`Public evidence does not establish whether the internal approval process changed during the observation window.`

Then `Not determinable`.

---

# 131. Partial confirmation explanation

Must state:

- which part satisfied;
- which part did not;
- why protocol maps to Partially confirmed.

---

# 132. Missed explanation

State:

- forecast;
- expected window;
- actual observed outcome;
- why miss criterion applies.

No euphemism.

---

# 133. Falsified explanation

Same, with explicit falsifying evidence.

---

# 134. Confirmed explanation

Same standard rigor.

Do not celebratorily overstate.

---

# 135. Visual parity across statuses

Confirmed should not get a trophy.

Falsified should not get catastrophic red theater.

These are scientific/operational states.

---

# 136. Color

Could use semantic color, but text is primary.

Avoid:

- green = success;
- red = shame.

Focus on verification state.

---

# 137. Track-record page visual design

If future:

- cohort summary;
- status distribution;
- sample/coverage;
- methodology;
- uncertainty;
- date.

No oversized “92% accurate” hero unless scientifically lawful.

---

# 138. Distribution before percentage

Safer first display:

```text
Eligible forecasts: N
Verified: N
Confirmed: N
Partially confirmed: N
Not determinable: N
Missed: N
Falsified: N
```

Even this requires actual data and inclusion rules.

---

# 139. No denominator hiding

If percentage displayed:

show numerator/denominator.

---

# 140. Not-yet-due separately

Do not mix into verified outcomes.

---

# 141. Withdrawn/superseded separately

Track-record rules determine eligibility.

Do not silently remove.

---

# 142. Verification eligibility reason

Internal each record:

- eligible;
- ineligible;
- pending eligibility.

Reason stored.

---

# 143. No manual marketing eligibility switch

Eligibility should derive from rules.

Exceptional override requires governance/audit.

---

# 144. Test/demo forecasts

Never enter official track record.

Need environment flag.

---

# 145. Historical replay forecasts

Separate cohort.

---

# 146. Production prospective forecasts

Separate cohort.

---

# 147. Internal R&D forecasts

Separate cohort.

---

# 148. Versioned eligibility policy

A record evaluated under policy v1 remains traceable.

If v2 changes:

recalculate transparently or freeze published cohort.

---

# 149. Verification protocol version

Must be bound to record.

---

# 150. Outcome evidence cutoff

Verification may have its own evidence cutoff:

`Outcome evidence reviewed through [date]`.

Useful for Not determinable.

---

# 151. Late-arriving outcome evidence

May trigger amended verification.

History preserved.

---

# 152. Public correction

If published verification changes due to new evidence:

show correction/version.

No silent dashboard mutation.

---

# 153. Track-record snapshot

Published public metric should have:

- snapshot date;
- methodology version;
- eligibility version.

---

# 154. Live rolling metric

Possible later.

Must be deterministic and reproducible.

---

# 155. Audit reproducibility

Given same:

- sealed forecasts;
- verification records;
- eligibility rules;
- metric version,

system should reproduce track-record calculation.

---

# 156. No manual spreadsheet-only official metric

Spreadsheet export can support audit.

Production public metric should derive from governed records.

---

# 157. Accuracy dashboard source-of-truth

Future dashboard:

```text
Verified forecast records
→ eligibility filter
→ metric calculator
→ display
```

Not hand-entered values.

---

# 158. Current example rows firewall

Generated example rows:

- never count;
- never display as live performance;
- never seed denominator.

---

# 159. Placeholder detection

Production validator should fail if track-record records contain:

- `EXAMPLE`;
- fixture IDs;
- impossible placeholder dates;
- mock flag.

---

# 160. Minimum corpus gate

Before public numeric performance claim:

statistical/methodological authority must explicitly say corpus sufficient for that claim.

No automatic N threshold invented here.

---

# 161. “Promising early results”

Still a performance claim.

Needs evidence.

Do not evade numeric gate with vague promotional language.

---

# 162. “Validated”

Also requires scope.

Could mean:

- code validation;
- historical replay verification;
- prospective performance validation.

Specify.

---

# 163. “Proven”

Avoid absent very strong evidence.

---

# 164. “Accuracy”

Only if metric definition valid.

Otherwise use:

`verification outcomes`.

---

# 165. “Track record”

Can mean factual ledger of outcomes without claiming predictive percentage.

Safer early form:

> verification record/history.

---

# 166. Client-specific verification history

Useful before global accuracy metric exists.

This creates product value without overclaim.

---

# 167. Method credibility

Correct forecast may strengthen evidence base.

Incorrect forecast also informs methodology.

But one forecast never validates/invalidates entire system alone.

---

# 168. Failure review pipeline

When Missed/Falsified:

```text
Verification record
→ offline failure analysis
→ root-cause classification
→ R&D candidate
→ blind/non-regression evaluation
→ method change only if authorized
```

---

# 169. Audit-Fail Research Rule relationship

A material methodology defect found through verification may trigger separate public-practice research under project governance.

Not part of client verification UI.

---

# 170. No immediate threshold tweak

Absolute.

---

# 171. No client-specific retuning

Do not change model to fit one client's outcome then retroactively score better.

---

# 172. Forecast portfolio analysis

Later R&D can analyze errors by:

- environment pair;
- forecast type;
- evidence quality;
- confidence;
- timing;
- Deal type.

But statistical sufficiency required.

---

# 173. No subgroup cherry-picking

Do not advertise strongest subgroup alone without pre-defined rationale.

---

# 174. Confidence calibration analysis

Later:

compare high/medium/low confidence classes to outcomes.

Do not assume ordinal calibration from small N.

---

# 175. Falsification rate

Could be informative but needs definition and corpus.

No standalone alarming metric.

---

# 176. Not-determinable rate

Important quality metric.

Do not hide.

High rate can reveal observability problems.

---

# 177. Coverage vs accuracy

Separate axes:

- how many eligible forecasts can be verified;
- how those verified forecasts resolve.

A system can appear accurate only because hard cases are Not determinable/excluded.

Show coverage.

---

# 178. Verification coverage

Potential:

```text
Eligible forecasts N
Outcome-verifiable N
Not determinable N
Pending N
```

Needs exact rules.

---

# 179. Reproducibility

Track record must be independently reproducible from governed records.

---

# 180. Public methodology link

Track-record surface should link to plain-language methodology.

No need to expose proprietary internals.

---

# 181. Disclosure of retrospective vs prospective

Mandatory if both shown.

Never combine silently.

---

# 182. Dates

Use unambiguous American English dates.

---

# 183. Time windows

Show exact locked window.

No relative wording that changes over time after verification.

---

# 184. Screens/PDF/email parity

Verification status and exact forecast text must match across surfaces.

---

# 185. Verification PDF

Not required first version.

Could be included in updated Deal report/history.

---

# 186. Email notification

If report verification completed:

`Forecast verification is available.`

Do not put result in subject if confidentiality concerns.

Separate notification contract.

---

# 187. Sharing

Verification inherits Deal/report access controls.

No automatic public link.

---

# 188. Public case-study conversion

A verified prospective Deal could later become public case study only through:

- publication rights;
- factual source package;
- public provenance;
- separate case-study authority.

No automatic conversion.

---

# 189. Outcome evidence privacy

Private outcome evidence remains private.

Aggregate metric may use governed anonymous result if data-rights permit.

---

# 190. Individual/42Q outcome privacy

Person-level verification may reveal sensitive individual behavior/outcome.

Needs stricter access.

Do not publish named individual track record.

---

# 191. Named executive public facts

Public departure may be factual.

Still do not expose private 42Q/type data.

---

# 192. Verification status and employment action

A falsified/confirmed leader forecast is not an employment recommendation.

---

# 193. Deal decision hindsight

Do not rewrite prior recommended action based on outcome.

Can evaluate recommendation separately later.

---

# 194. Recommendation effectiveness is separate study

Prediction accuracy ≠ intervention effectiveness.

---

# 195. Post-close monitor relationship

Future monitor uses:

- forecast;
- watchpoint;
- outcome;
- intervention;
- remeasurement.

Verification remains one stage.

---

# 196. Remeasurement ≠ verification

Remeasurement measures current state.

Verification judges prior forecast.

---

# 197. Updated risk ≠ verification status

Keep axes separate.

---

# 198. Deal Workspace target layout

```text
Forecast
Exact locked claim
Status: Sealed
Version / sealed date

Verification
Status: Verification due / Confirmed / ...
Observation window

Outcome
What happened

Evidence
Source references

Verification basis
Why this status applies

Limitations
```

---

# 199. If Not determinable

Do not collapse panel.

Explain:

- what evidence is missing;
- whether later evidence could resolve;
- next review date if genuinely scheduled.

---

# 200. If Missed/Falsified

Do not upsell or defensively rationalize.

Neutral factual presentation.

---

# 201. If Confirmed

Do not convert to testimonial automatically.

---

# 202. Analyst/internal verification view

Adds:

- raw verification rule;
- source evidence;
- alternative interpretations;
- adjudication controls;
- eligibility decision;
- track-record inclusion.

Client view remains bounded.

---

# 203. Verification adjudication controls

Target internal fields:

- result;
- outcome summary;
- evidence links;
- limitations;
- adjudication rationale;
- eligibility status;
- eligibility reason.

---

# 204. Result cannot be selected without evidence

Except deterministic system event where protocol itself supplies authoritative evidence.

---

# 205. Result override

If algorithm suggests result:

human override requires rationale where human adjudication permitted.

Preserve suggested/original result.

---

# 206. No default Confirmed

Form starts unset.

Avoid confirmation bias.

---

# 207. No default Missed

Same.

---

# 208. Independent reviewer option

Future public track-record cohort may require second reviewer.

Not automatic first-version feature.

---

# 209. Disagreement between verifiers

Requires adjudication state.

Do not average statuses.

---

# 210. Verification record lock

Once final verification published/accepted:

record version locked.

Later amendment separate.

---

# 211. Eligibility can be calculated after verification

But eligibility criteria must pre-exist.

---

# 212. Verification can exist without track-record eligibility

Example:

client-specific forecast validly verified but not eligible for public corpus due confidentiality/protocol.

---

# 213. Track record can exist without public release

Internal evidence base first.

---

# 214. Public track record is later release surface

Requires separate claims/design contract before launch.

---

# 215. Current “accuracy dashboard” treatment

Existing schema may guide fields.

It is not current production evidence.

Verdict:

**KEEP AS HISTORICAL/SCHEMA REFERENCE; DO NOT RENDER LIVE VALUES UNTIL BACKED BY REAL VERIFICATION RECORDS.**

---

# 216. Current verification-log treatment

Schema is useful.

Example rows are not evidence.

Target production log should evolve to durable versioned verification records.

---

# 217. Current calibration-log treatment

Same.

No calibration update from placeholder.

---

# 218. Source workbook instructions are not runtime authority by themselves

Generated workbook rows may include human SOP/instructions.

Current accepted agent contract already marks some prediction-ledger schema/instruction material non-admissible for agent grounding.

Therefore:

> use controlling product/governance contract, not copied workbook imperative text, to define production behavior.

---

# 219. Production verifier must use authorized protocol

Not workbook free-text alone.

---

# 220. Track-record calculation service

Future target:

```text
verification store
→ eligibility policy
→ aggregation
→ uncertainty/statistics
→ approved disclosure model
```

Separate from UI.

---

# 221. No frontend calculation of official accuracy

Server/governed calculator.

---

# 222. Metric audit record

Store:

- metric ID;
- cohort cutoff;
- rule versions;
- record IDs;
- numerator/denominator;
- uncertainty;
- generatedAt.

---

# 223. Public metric reproducibility

Internal audit should regenerate.

---

# 224. Metric correction

If eligibility bug found:

new metric version / correction note.

No silent rewrite.

---

# 225. Marketing usage

Any marketing/investor claim must quote approved metric snapshot.

No manual rounding that changes meaning.

---

# 226. Rounding

Define beforehand.

Show numerator/denominator.

---

# 227. Percentage precision

Do not show 77.7777% precision when sample size cannot justify.

---

# 228. Small N display

Counts may be more honest than percentage.

---

# 229. Zero denominator

No accuracy metric.

Display:

`No eligible verified forecasts yet.`

Not `0%`.

---

# 230. No eligible cohort

Valid startup state.

---

# 231. First verified forecast

Do not advertise `100% accurate`.

Show one verification record.

---

# 232. Early cohort wording

If approved:

`1 of 1 eligible forecasts confirmed`

is factual but can still mislead without context.

Prefer full cohort disclosure.

---

# 233. Statistical gate

Public percentage only after explicit corpus-sufficiency approval.

---

# 234. Client trust level

## Current trust level

Client has already provided/authorized sufficient evidence for a locked/sealed forecast and later outcome verification.

## Additional data allowed

Only outcome evidence necessary to judge the forecast.

## Data not automatically allowed

- unrelated new private documents;
- individual data unrelated to forecast;
- broad post-close monitoring;
- public case-study publication rights.

## Next trust escalation

Optional:

- recurring monitor;
- remeasurement;
- publication/case-study permission.

## Value before escalation

Client receives factual verification of the exact prior forecast.

---

# 235. Verification does not require new sales motion

A promised verification should be completed according to engagement terms.

Do not hold result behind another upsell.

---

# 236. Monitor upsell after verification

May be offered later, subordinate to completed verification value.

---

# 237. Visual direction

Use same Deal/report canon.

Verification should feel like audit/measurement, not marketing celebration.

---

# 238. Status cards

Restrained.

Exact forecast displayed prominently enough to prevent hindsight ambiguity.

---

# 239. Outcome evidence disclosure

Progressive disclosure:

- summary;
- sources;
- detailed evidence for authorized viewer.

---

# 240. No hidden original claim

Never show only result without original forecast.

---

# 241. Side-by-side comparison

Useful:

| Locked forecast | Observed outcome |
|---|---|

Then status.

On mobile stack vertically.

---

# 242. Status should follow comparison

Do not prime reader with giant green/red result before seeing what was predicted.

---

# 243. Accessibility

WCAG 2.2 AA.

Need:

- original forecast readable;
- outcome readable;
- status text;
- source links;
- no color-only result;
- accessible tables;
- mobile reflow.

---

# 244. Print

Verification record should print with:

- forecast ID/version;
- exact claim;
- window;
- outcome;
- status;
- verified date;
- evidence references;
- limitations.

---

# 245. Audit details

Internal:

- seal hash;
- verification-rule version;
- adjudicator;
- eligibility policy.

Client audit detail only as needed.

---

# 246. No seal hash as outcome evidence

Hash only shows fixation/integrity.

---

# 247. No outcome evidence as seal proof

Separate concepts.

---

# 248. Verification status state machine

Conceptual:

```text
NOT_DUE
→ WINDOW_OPEN
→ EVIDENCE_COLLECTION
→ UNDER_REVIEW
→ VERIFIED
```

Final `VERIFIED` contains one outcome:

- Confirmed
- Partially confirmed
- Not determinable
- Missed
- Falsified

Branches:

- INELIGIBLE_FOR_VERIFICATION
- AMENDMENT_PENDING

Exact enums separate.

---

# 249. Track-record eligibility state machine

Conceptual:

```text
NOT_ASSESSED
→ ELIGIBLE / INELIGIBLE
→ INCLUDED_IN_SNAPSHOT
```

Separate from verification result.

---

# 250. No outcome status as eligibility status

A Falsified forecast can and usually should remain eligible.

Removing it is publication bias.

---

# 251. No confirmation status as inclusion guarantee

Could be ineligible due protocol violation.

---

# 252. Verification completeness

A forecast may be verified but outcome record lack public publication rights.

Still internal valid.

---

# 253. Audit of withdrawn/superseded forecasts

Need explicit eligibility treatment.

Do not remove by default.

---

# 254. Forecast issued after event started

May be ineligible if prospective criterion violated.

Need timestamp rule.

---

# 255. Evidence leakage before lock

If analyst already knew outcome:

forecast not prospective.

Track-record ineligible.

---

# 256. Historical cases

Outcome known externally during later replay.

They cannot be counted as prospective client forecasts even with PRE-T0 evidence discipline.

Separate cohort.

---

# 257. Blind held-out historical

Stronger than ordinary retrospective replay.

Still separate from prospective population.

---

# 258. Cohort labels must be plain

Avoid confusing:

`Validated`

without qualifier.

Use:

`Prospective sealed forecasts`

`Blind historical evaluations`

etc.

---

# 259. Outcome variable consistency

Track record cannot mix unrelated claims unless aggregation is defined.

E.g.:

- executive departure;
- authority change;
- time-to-friction

may have different verification semantics.

---

# 260. Forecast families

Potentially report performance separately by forecast family.

Requires sufficient N.

---

# 261. Unit of observation

Could be:

- forecast;
- Deal;
- event.

Must be pre-defined.

---

# 262. Deal-level aggregation

If needed:

define how multiple forecast statuses combine.

Do not use `any confirmed = deal correct`.

---

# 263. Weighted metrics

No weighting after outcome.

Weights pre-defined.

---

# 264. Confidence-weighted metric

Future research only unless approved.

---

# 265. Economic weighting

Do not weight forecast success by Deal value without explicit methodology.

---

# 266. Verification economics

A confirmed forecast does not prove financial loss prevented.

No causal savings claim.

---

# 267. Intervention outcome study

Separate future product/research.

---

# 268. R&D feedback loop

Verification data can inform:

- forecast design;
- evidence requirements;
- timing rules;
- falsifier quality.

But only offline.

---

# 269. Version-specific performance

Track record should know forecast-method version.

Do not mix versions blindly.

---

# 270. Model migration

When new method released:

old records remain under old method.

Could present:

- all-time;
- current-version

only if statistically valid.

---

# 271. No deletion of poor old version

Historical transparency matters.

---

# 272. Production-readiness gate

Outcome-verification production UI requires:

- durable full forecast record;
- production-grade lock/seal or equivalent immutable version;
- observation window data;
- outcome evidence store;
- verification-rule store;
- adjudication permissions;
- versioned verification record;
- access control;
- audit history.

---

# 273. Track-record readiness gate

Additionally requires:

- eligibility policy;
- cohort classification;
- metric calculator;
- corpus sufficiency review;
- uncertainty/statistical method;
- disclosure policy;
- privacy/publication policy.

---

# 274. No shortcut from ledger to accuracy dashboard

Ledger count alone insufficient.

---

# 275. No shortcut from verification status count to scientific claim

Need denominator/population/dependence/statistics.

---

# 276. Existing asset decision matrix

| Existing asset | Decision |
|---|---|
| Prediction ledger concept | **KEEP / HARDEN PER 26** |
| Verification log schema | **KEEP AS SCHEMA REFERENCE / REBUILD AS DURABLE PRODUCTION RECORD** |
| Calibration log schema | **KEEP AS FUTURE FRAMEWORK** |
| Accuracy dashboard schema | **DO NOT RENDER LIVE UNTIL REAL DATA + METRIC AUTHORITY** |
| Example verification rows | **NEVER COUNT AS DATA** |
| Example calibration rows | **NEVER COUNT AS DATA** |
| “derive from VERIFICATION_LOG — never hardcode” principle | **KEEP ABSOLUTELY** |
| Actual-outcome-over-window verification principle | **KEEP** |
| Failed forecast must not be quietly retracted | **KEEP ABSOLUTELY** |
| Public historical cases | **SEPARATE FROM PROSPECTIVE TRACK RECORD** |

---

# 277. Target first-version verification surface

Minimum:

```text
Deal identity

Locked forecast
Exact claim
Version
Lock/seal date
Observation window

Verification status

Observed outcome
Evidence

Why this status applies

Limitations
Verified date
```

No global accuracy number required.

---

# 278. Target first-version internal verification controls

Minimum:

```text
Forecast identity
Verification rule

Outcome evidence
Supporting evidence
Contradicting evidence

Outcome status
Rationale
Limitations

Eligibility status
Eligibility reason

Submit verification
```

---

# 279. Track record can wait

The product can launch verified Deal outcomes before public aggregate track-record statistics.

This is preferable to premature accuracy marketing.

---

# 280. WHAT WAS INTENTIONALLY PRESERVED

Before implementation list:

- exact locked forecast;
- prediction window;
- falsification logic;
- prediction ledger linkage;
- verification-log concept;
- calibration separation;
- actual-outcome verification;
- failure retention;
- anti-hindsight;
- public/private provenance;
- five fixed outcome labels.

---

# 281. WHAT IS NEW / TARGET

- durable verification records;
- explicit verification-rule objects;
- outcome evidence lane;
- intervention metadata;
- eligibility policy;
- prospective/retrospective cohort separation;
- aggregate metric versioning;
- corpus-sufficiency gate;
- client Deal verification surface.

---

# 282. WHAT CHANGED AND WHY

Format:

```text
CURRENT
→ TARGET
→ DEFECT / NEED
→ AUTHORITY
```

Example:

```text
Example VERIFICATION_LOG rows + schematic accuracy dashboard
→ durable forecast-linked verification records + eligibility-filtered metric calculator
→ example rows are not empirical calibration data and cannot support an accuracy claim
→ evidence discipline / accepted probability-interpretation contract
```

---

# 283. Acceptance criteria

Outcome verification passes only if:

1. exact forecast ID/version retrieved;
2. exact locked claim shown;
3. exact observation window used;
4. exact falsification condition used;
5. forecast text not edited;
6. window not moved;
7. threshold not moved;
8. subject/scope not narrowed post-outcome;
9. forecast-basis evidence unchanged;
10. outcome evidence stored separately;
11. outcome evidence provenance retained;
12. outcome evidence reviewed;
13. contradictory outcome evidence preserved;
14. result unset until authority exists;
15. only fixed five outcome labels used;
16. Confirmed follows pre-defined criterion;
17. Partially confirmed follows pre-defined criterion;
18. Not determinable remains valid;
19. Missed distinct from Falsified;
20. Falsified tied to falsification rule/evidence;
21. no post-hoc category tuning;
22. multi-part claim semantics pre-defined;
23. no post-outcome splitting/merging;
24. verification record versioned;
25. amendments preserve history;
26. client cannot self-set final result;
27. result linked to evidence;
28. intervention recorded when material;
29. intervention does not automatically become miss;
30. transaction cancellation handled by protocol;
31. major Deal scope changes recorded;
32. verification not performed before due window;
33. late evidence does not silently rewrite record;
34. seal/release states remain distinct;
35. one Deal may have multiple verification outcomes;
36. no forced Deal-level accuracy score;
37. historical replay separated from prospective forecasts;
38. blind historical separated from prospective;
39. public/client confidentiality respected;
40. verified Deal does not auto-become public case study;
41. example verification rows never count;
42. example calibration rows never count;
43. dashboard values never hardcoded;
44. aggregate values derive from real verification records;
45. eligibility rules fixed before counting;
46. ineligible records retained with reason;
47. Not determinable denominator treatment explicit before metric;
48. partial-confirmation scoring explicit before metric;
49. duplicate/superseded forecasts handled deterministically;
50. test/demo forecasts excluded;
51. no selective success publication;
52. pending/not-yet-due cases separate;
53. outcome availability bias considered;
54. dependence structure considered;
55. unit of observation defined;
56. estimand defined;
57. uncertainty method defined;
58. baseline/chance comparator defined where relevant;
59. corpus sufficiency reviewed before numeric claim;
60. no legacy 70%/77.77% presented as live forecast accuracy;
61. no bare public percentage with hidden denominator;
62. zero eligible denominator produces no percentage;
63. early N does not create `100% accurate` claim;
64. track record and calibration distinguished;
65. calibration not claimed from categorical hit rate alone;
66. production model not auto-retuned after outcome;
67. misses/falsifications feed offline R&D only;
68. old outcomes not rewritten after methodology update;
69. method/version stored;
70. eligibility policy version stored;
71. metric snapshot version stored;
72. public metric reproducible;
73. correction creates new metric version/snapshot;
74. report/PDF/email verification status congruent;
75. client sees original forecast alongside outcome;
76. verification status not color-only;
77. WCAG 2.2 AA target maintained;
78. American English client UI;
79. no accuracy celebration/shame UI;
80. target-only verification route not represented as current production until built.

---

# 284. Финальный принцип

> **Verification judges the forecast that actually existed before the outcome — not the forecast we wish we had written after seeing the outcome.**

> **A miss or falsification is not an embarrassment to hide. It is part of the evidence required to know whether MergeVue deserves predictive trust.**

> **A track record becomes credible only when every eligible forecast can enter the denominator under rules fixed before the results are known.**

> **Until the verification corpus, eligibility rules, dependence structure, uncertainty method and corpus sufficiency support a numeric claim, MergeVue should publish verification records and counts — not a marketing accuracy percentage.**
