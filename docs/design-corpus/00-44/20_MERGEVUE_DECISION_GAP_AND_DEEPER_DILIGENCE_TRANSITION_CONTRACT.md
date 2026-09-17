# 20. Контракт перехода от публичного результата к углублённой проверке MergeVue

**Статус документа:** управляющий flow-контракт / progressive-trust and deeper-diligence gate  
**Файл:** `20_MERGEVUE_DECISION_GAP_AND_DEEPER_DILIGENCE_TRANSITION_CONTRACT.md`  
**Версия:** 1.0  
**Дата:** 16 сентября 2026 года  
**Язык документации:** русский  
**Язык коммерческого интерфейса:** только American English  
**Рынок первой версии:** США  
**Входная surface:** публичный результат из `19_MERGEVUE_PUBLIC_ANALYSIS_RESULT_CONTRACT.md`  
**Существующие связанные routes:** `/screen-11-paid-offer`, `/screen-11b-homogeneous-offer`, `/screen-12-consultation-request`, `/screen-12-email-capture`  
**Главный принцип:** переход к более глубокому уровню анализа должен объясняться конкретным decision gap и необходимым evidence layer, а не общим paywall или generic upgrade  
**Ключевые инварианты:** `VALUE FIRST`, `DECISION GAP BEFORE COMMERCIAL ASK`, `EVIDENCE NEED BEFORE TIER`, `NO AUTOMATIC PRICE WALL`, `NO FAKE PREMIUM ANSWER`, `KEEP EXISTING ROUTES UNTIL REPLACEMENT IS AUTHORIZED`

---

# 0. Назначение

Этот документ определяет, что происходит **после того, как пользователь уже получил первый публичный результат**.

Цель следующего шага:

1. сохранить уже полученную публичную ценность;
2. ясно показать, что известно;
3. ясно показать, что не определено;
4. объяснить, почему оставшийся gap важен;
5. назвать минимальный следующий evidence layer;
6. позволить пользователю выбрать углубление;
7. только после этого запрашивать account, internal observations, private documents, paid engagement или individual data.

Это не:

- generic pricing page;
- forced signup;
- upsell popup;
- «unlock the real answer»;
- consultation lead form без аналитической причины.

---

# 1. Базовая последовательность

Правильный flow:

```text
Public result
→ Decision gap
→ Why it matters
→ Evidence needed
→ Choose next depth
→ Trust escalation
→ Deeper analysis
```

Неправильный flow:

```text
Public result
→ blurred sections
→ Upgrade now
→ enter email
→ price
→ maybe learn why
```

---

# 2. Decision Gap — центральный переход

`Decision Gap` уже существует в canonical public report grammar.

Это значит:

> отдельная новая sales-механика не должна дублировать его смысл.

Переход в deeper diligence начинается из этого блока.

---

# 3. Что такое Decision Gap

Decision Gap отвечает:

> `What material decision cannot yet be supported by the evidence currently available?`

Примеры категорий:

- unresolved authority structure;
- unclear integration dependency;
- incomplete environment reading;
- contradictory public evidence;
- missing deal economics;
- uncertainty around critical capability retention;
- need for individual-data channel for a specific leader.

Это не «premium feature list».

---

# 4. Decision Gap должен быть evidence-specific

Не писать generic:

`Get deeper insights.`

Нужно:

`Public evidence does not establish who will retain final decision authority in the target's product organization.`

Далее:

`This matters because the deal thesis depends on preserving target product velocity during integration.`

---

# 5. Следующий шаг определяется gap, а не ценой

Концептуальная логика:

```text
Gap
→ evidence needed
→ evidence channel
→ workflow
→ commercial treatment if applicable
```

Не:

```text
Price tier
→ features
→ hope one feature solves gap
```

---

# 6. Existing `screen-11-paid-offer` — фактическое состояние

Current route:

`/screen-11-paid-offer`

имеет:

- header;
- pair context;
- price;
- comparison grid;
- `Free output`;
- `Paid adds`;
- engagement panel;
- CTA to consultation request.

Есть отдельная:

`/screen-11b-homogeneous-offer`.

Это реальный existing product asset.

---

# 7. Existing screen verdict

## Route

**KEEP UNTIL A REPLACEMENT ROUTE IS EXPLICITLY AUTHORIZED.**

## Comparison concept

**KEEP / ADAPT.**

## `Free output` vs `Paid adds`

**ADAPT TO EVIDENCE-DEPTH LANGUAGE.**

## Fixed legacy price

**DO NOT TREAT AS CURRENT COMMERCIAL AUTHORITY.**

## Cost anchor

**REMOVE / REVIEW.**

## Consultation CTA

**KEEP AS ONE POSSIBLE PATH, NOT UNIVERSAL REQUIRED NEXT STEP.**

---

# 8. Current legacy commercial state

Existing validation expects a paid offer around:

`$90K–$200K`

and existing offer can contain a cost anchor.

Это текущая implementation truth старого commercial flow.

Но новый UX/UI corpus имеет отдельную working commercial architecture, которая не является автоматически final pricing authority.

Следовательно:

> **этот документ не устанавливает новые точные цены.**

---

# 9. Price is not allowed to resolve uncertainty

Запрещено:

`Upgrade to get a definitive answer.`

Paid depth может:

- получить больше evidence;
- повысить coverage;
- снять некоторые unknowns;
- позволить private evidence;
- добавить controlled review.

Но:

> paid analysis также может законно закончиться `Cannot determine`.

---

# 10. Public result remains visible

При переходе к deeper diligence пользователь не теряет public report.

Нельзя:

- скрыть его после клика;
- заменить sales page;
- сделать public result доступным только после account.

Public report remains a persistent baseline.

---

# 11. Three evidence-depth paths

После public result допускаются три основные следующие ветви.

## Path A — Save / continue later

Нужен account.

Цель:

- сохранить deal;
- вернуться;
- track updates;
- collaborate later.

## Path B — Add internal organizational evidence

Нужны:

- structured observations;
- canonical organizational questionnaires;
- invited respondents where applicable.

## Path C — Go deeper with private evidence

Paid / controlled workflow:

- private documents;
- deeper reconciliation;
- economic exposure;
- controlled forecasting;
- additional review gates.

Отдельно позже:

## Path D — Specific-leader forecast

Требует:

- individual data;
- 42Q;
- only when a named-leader forecast is explicitly requested.

---

# 12. Account is not evidence

Создание account само по себе не улучшает confidence.

UI не должен путать:

`Create account`

с:

`Improve analysis`.

Account = persistence/access layer.

Evidence = analytical layer.

---

# 13. Save Deal

После public report допустим CTA:

`Save this deal`

Benefit copy:

`Create an account to save this analysis and continue adding evidence later.`

Не:

`Sign up to unlock your results.`

---

# 14. Account request timing

Account появляется **после public value**.

Исключение:

если техническая архитектура объективно требует authentication для действия, которое пользователь сам запросил:

- save;
- invite;
- upload private docs;
- collaboration.

---

# 15. Internal observations path

CTA candidate:

`Add internal evidence`

Supporting:

`Use structured organizational observations to test the questions public sources cannot resolve.`

Это ведёт в существующую diagnostic / respondent architecture.

---

# 16. Canonical questionnaires remain exact

Переход к internal evidence не даёт дизайнеру право создать «короткий questionnaire».

Все canonical questions:

- exact;
- fixed;
- ordered;
- option order fixed;
- mappings fixed.

---

# 17. Questionnaire starts only with explicit user choice

Не автоматически после public result.

User chooses:

`Add internal evidence`

Then product explains:

- who should respond;
- why;
- approximate effort if reliably known;
- what result may improve.

---

# 18. Do not ask every respondent everything

Use existing role / track routing.

Questionnaire burden should derive from canonical routing.

Не менять questionnaire to reduce burden.

---

# 19. Respondent context enters here, not at public entry

Fields such as:

- side;
- role;
- seniority;
- function;
- access level;
- tenure;
- responsibility

can become relevant now.

They support evidence authority / routing.

---

# 20. Invite flow

Existing invitation infrastructure should be reused where applicable.

Invitation UI must explain:

- who is being invited;
- what they will provide;
- what they will not see;
- how responses affect the deal analysis.

---

# 21. Respondent independence

Do not expose one respondent's raw answers to another respondent unless governance permits.

Do not prefill one side from the other.

---

# 22. Private evidence path

CTA candidate:

`Go deeper with private evidence`

This begins paid qualification / controlled engagement.

It does not immediately mean:

> upload everything.

---

# 23. Private evidence progressive collection

First identify:

- decision gap;
- evidence category needed;
- minimum documents likely to resolve it.

Then request upload.

Not:

`Upload your data room`.

---

# 24. FREE documents remain outside free scoring

Private documents stay behind paid boundary.

Public report cannot silently ingest closed documents and remain called public/free.

---

# 25. Paid depth is not “more features”

Explain paid value through evidence depth:

- private sources;
- structured respondent evidence;
- contradiction reconciliation;
- economic exposure;
- controlled forecast;
- review gates;
- report depth.

Not through:

- more dashboards;
- more charts;
- more AI.

---

# 26. Economic Exposure path

If Decision Gap is economic:

example:

`The public evidence identifies an organizational assumption under pressure, but the value dependent on that assumption has not been quantified.`

Next evidence:

- deal thesis;
- value-creation dependency;
- relevant economics.

This can justify paid economic modeling.

---

# 27. Economic exposure is not loss prediction

Paid copy must say:

> value depends on an assumption.

Not:

> MergeVue predicts this amount will be lost.

---

# 28. Specific-leader branch

This branch is conditional.

Trigger:

> user requests a forecast for a specific named leader.

Then:

`Specific-leader forecasting requires individual data.`

42Q becomes relevant here.

---

# 29. 42Q is never a generic upgrade feature

Do not show:

`Includes 42Q`

inside every paid plan.

Do not show:

`Take the personality test`.

42Q is an evidence channel for a specific analytical request.

---

# 30. No type label to client

Even after 42Q:

- internal type may exist;
- client-facing output is behavioral forecast;
- no personality type publication.

---

# 31. Consultation path

Existing route:

`/screen-12-consultation-request`

is a useful human-commercial path.

It should remain available where a human conversation is appropriate.

But consultation is **not mandatory for every user**.

---

# 32. When consultation is appropriate

Examples:

- complex paid scope;
- unclear evidence need;
- procurement;
- security / NDA;
- large multi-entity deal;
- custom engagement;
- user explicitly asks to speak with someone.

---

# 33. When consultation is unnecessary

Do not force consultation merely to:

- save a deal;
- add a questionnaire;
- understand an evidence gap;
- see public result;
- request standard self-serve next step where supported.

---

# 34. Existing consultation fields

Current consultation flow includes structured fields such as:

- name;
- role;
- deal context;
- scheduling.

This is an existing asset.

Keep / adapt after separate page contract.

Do not expand into full CRM lead form without reason.

---

# 35. Email capture

Existing `/screen-12-email-capture` should not become a mandatory gate between public result and user value.

Email can support:

- send analysis;
- receive saved-link;
- account creation;
- consultation follow-up.

Not:

`Enter email to see result`.

---

# 36. Commercial architecture status

The new corpus may contain a working price ladder.

Until exact pricing is explicitly accepted as commercial authority:

- do not hard-code it into this transition contract;
- do not replace legacy price with speculative new price;
- use pricing-neutral flow design.

---

# 37. Pricing display gate

Exact price may appear only when:

1. commercial authority exists;
2. scope is sufficiently defined;
3. currency / geography assumptions known;
4. product actually supports that offer.

Otherwise:

`Scope and pricing depend on the evidence depth required.`

Only if that statement is commercially approved.

---

# 38. Avoid feature-grid pricing

Do not immediately show:

```text
Basic
Pro
Enterprise
```

unless actual product commercial model adopts it.

MergeVue depth is not ordinary feature gating.

---

# 39. Materiality-driven depth

The deeper the requested decision:

- the stronger evidence required;
- the greater provenance burden;
- the greater release control;
- potentially greater price.

This is more accurate than feature counts.

---

# 40. Decision Gap component

Recommended structure:

```text
Decision gap
What remains unresolved

Why it matters
Connection to deal thesis / operating assumption

Evidence needed
What could resolve it

Next step
Choose evidence channel
```

---

# 41. One gap, multiple possible channels

A gap may be resolved through:

- public evidence refresh;
- respondent observation;
- private document;
- deal-context field;
- 42Q;
- not resolvable.

UI should not assume one universal paid path.

---

# 42. Gap prioritization

If multiple gaps:

rank by materiality only if current model authorizes such ordering.

Otherwise:

group:

- material;
- secondary;
- unresolved.

No arbitrary AI ranking.

---

# 43. No urgency theater

Do not use:

- `Critical — upgrade now`;
- countdown;
- flashing danger;
- loss aversion based on invented money.

Serious M&A buyer should see evidence logic, not SaaS pressure tactics.

---

# 44. Evidence-needed language

Examples:

`Requires internal decision-rights evidence.`

`Requires private integration-plan evidence.`

`Requires individual data for the named leader.`

`May be resolved through additional public evidence.`

---

# 45. Evidence availability status

Potential machine-readable states:

- `PUBLIC_REFRESH`;
- `INTERNAL_OBSERVATION`;
- `PRIVATE_DOCUMENT`;
- `DEAL_ECONOMICS`;
- `INDIVIDUAL_DATA`;
- `HUMAN_REVIEW`;
- `NOT_CURRENTLY_RESOLVABLE`.

Exact enum is engineering decision.

---

# 46. Evidence path must preserve provenance

When new evidence enters:

report blocks deepen with provenance.

Do not overwrite public evidence silently.

---

# 47. Public baseline remains distinguishable

Later paid report should allow user/expert to know:

- what was known from public sources;
- what was added internally;
- what private evidence changed.

This supports trust.

---

# 48. No paid answer overwrite

Do not make public report disappear and replace it with a paid report whose differences are impossible to trace.

Canonical-block congruence from `19` must remain.

---

# 49. Block-level deepening

Example:

```text
Public:
Environment Reading — Limited

After internal evidence:
Environment Reading — Supported

After private evidence:
Environment Reading — Supported + conflict explanation
```

Same block.

Not three different report systems.

---

# 50. Upgrade is evidence escalation

Avoid UI word:

`Upgrade`

as primary conceptual label where possible.

Prefer action language:

- `Add internal evidence`;
- `Use private evidence`;
- `Quantify economic exposure`;
- `Request a specific-leader forecast`.

Commercial treatment follows action.

---

# 51. Existing `Free output / Paid adds` comparison

This is useful as a pattern but too product-feature oriented.

Target comparison:

`What the public analysis establishes`

vs

`What additional evidence can resolve`

This makes comparison epistemic.

---

# 52. Target comparison example

| Public result | Deeper evidence can add |
|---|---|
| Publicly supported organizational watchpoints | Internal operating evidence |
| Public-source environment reading where supported | Stronger coverage / contradiction resolution |
| Qualitative economic relevance | Quantified economic exposure where inputs permit |
| Organizational forecast/watchpoints | Controlled deeper forecast |
| No named-leader forecast | Specific-leader forecast only with individual data |

This is conceptual, not a guaranteed feature table.

---

# 53. Do not promise all paid columns

Even paid engagement depends on:

- data availability;
- contradictions;
- quality;
- authorization.

Therefore language:

`can add`

not:

`guarantees`.

---

# 54. Homogeneous / heterogeneous paid routes

Current product has:

- `/screen-11-paid-offer`;
- `/screen-11b-homogeneous-offer`.

Do not remove until audit proves separate routes unnecessary.

But new evidence-driven transition may reduce need for two different commercial pages.

This requires separate route decision.

---

# 55. Homogeneous pair does not imply easier paid scope

Do not infer price / depth purely from same-environment result.

Same-environment can still contain:

- concealed conflict;
- aligned suppression;
- evidence gaps.

---

# 56. New paid route is not authorized here

Do not create:

- `/pricing`;
- `/upgrade`;
- `/plans`;
- `/checkout`

from this document.

Use existing routes until commercial architecture gets its own explicit contract.

---

# 57. Payment is later than qualification

Before payment, system must know enough to define:

- scope;
- evidence needs;
- product depth.

This contract stops before payment mechanics.

---

# 58. No card capture on transition screen

Do not ask credit-card details while user is still choosing evidence depth.

Payment requires separate commercial/payment contract.

---

# 59. Account and paid are separate gates

Possible:

```text
public result
→ account to save
```

without payment.

Possible:

```text
public result
→ paid engagement
→ account / identity as operational requirement
```

Do not conflate.

---

# 60. Organization identity

When user moves to paid/private evidence, system may need:

- user identity;
- organization;
- authority to upload/use materials.

This belongs to secure onboarding, not public result.

---

# 61. Private-document authorization

Before upload, user should understand:

- who can access;
- purpose;
- retention / security rules;
- allowed document types.

Detailed legal/security text belongs to separate contract.

---

# 62. Deal workspace creation

The new deal workspace should be created when persistence / collaboration becomes necessary.

Do not create a workspace merely because anonymous user viewed a public result.

---

# 63. Workspace relation

Conceptually:

```text
Anonymous public analysis
→ Save / deepen
→ authenticated Deal
→ workspace
```

Existing public analysis becomes baseline.

---

# 64. No data loss at escalation

Account creation or paid transition must preserve:

- company identities;
- public report version;
- evidence cutoff;
- current gaps;
- user-entered context.

No restart.

---

# 65. Existing questionnaire architecture enters after escalation

This is where current diagnostic architecture should become visible.

Use:

- acquirer track;
- target observation;
- target self-assessment;
- respondent routing;

only according to current canonical logic.

---

# 66. No questionnaire reframing as “premium quiz”

Canonical instruments remain analytical evidence channels.

Do not market:

`Unlock premium questionnaire`.

---

# 67. Progress language

After user chooses deeper evidence:

show phase-based progress:

- Public analysis complete;
- Internal evidence;
- Private evidence;
- Review;
- Report.

Only if actual workflow supports.

Do not show generic 0–100%.

---

# 68. Trust progression

Conceptual levels:

## Trust 0
Public company names, public evidence.

## Trust 1
Account / saved deal.

## Trust 2
Internal structured observations / invitations.

## Trust 3
Private documents / economics / paid engagement.

## Trust 4
Individual data for named-leader forecast.

These levels describe UX progression, not security classification.

---

# 69. Do not request Trust 3 for a Trust 1 action

Example:

Saving report should not require uploading documents.

---

# 70. Do not request Trust 4 for organization-level report

42Q should not appear unless specific-leader question exists.

---

# 71. Decision Gap can be resolved without payment

Some gaps may be resolved by:

- additional public source;
- user clarifying transaction;
- non-sensitive context.

Do not turn every gap into commercial trigger.

---

# 72. Public evidence refresh

If system supports it:

CTA:

`Refresh public evidence`

for stale result.

This is distinct from paid depth.

---

# 73. Private evidence cannot retroactively rewrite public source history

Paid report may change conclusion because evidence changes.

But system should preserve:

- prior public report;
- version;
- reason for change.

---

# 74. Confidence transition

If confidence improves:

show why.

Example:

`Environment reading changed from Limited to Supported after structured internal observations.`

Not:

`AI became more confident.`

---

# 75. Contradiction transition

If private evidence contradicts public evidence:

report should surface conflict.

Do not simply replace old claim.

---

# 76. Evidence sufficiency remains fail-closed

Paid data does not force a conclusion.

More data can reveal more contradiction.

That is legitimate.

---

# 77. Human review trigger

Human review may become relevant for:

- paid high-stakes output;
- contradiction;
- cannot-determine;
- authority-specific escalation.

Do not promise universal analyst review.

---

# 78. Expert view congruence

Human expert sees expanded same report blocks.

Transition screen does not promise an unrelated consulting deliverable.

---

# 79. Consultation request purpose

If user chooses consultation:

page should carry forward:

- deal pair;
- current decision gaps;
- selected desired depth.

User should not retype the whole deal.

---

# 80. Consultation fields should be minimized

Existing fields include:

- name;
- role;
- deal context;
- scheduling.

Keep unless actual sales process requires more.

Do not add:

- company size;
- budget;
- timeline;
- phone;
- procurement stage

without specific need.

---

# 81. Consultation success state

After submission:

- confirm request;
- preserve public report access;
- explain expected next step if operationally known.

Do not promise response time unless actual SLA exists.

---

# 82. No fake calendar booking

If scheduling integration does not exist:

do not render time slots.

Use the existing scheduling field / request flow.

---

# 83. Email capture purpose

If email is asked:

state purpose:

`Email me this analysis`

or:

`Create an account to save this deal`.

No ambiguous lead harvesting.

---

# 84. Consent separation

Marketing opt-in should not be automatically bundled with:

- report delivery;
- consultation request;
- account.

Separate if needed.

---

# 85. Pricing language

Until final commercial authority:

safe design placeholders can be structural:

`Paid analysis`

`Custom scope`

but not invented price.

Even `Custom scope` should match actual intended sales motion.

---

# 86. Legacy `$90K–$200K` treatment

The legacy price is real current implementation state.

But because new product/commercial architecture is under redesign:

> **do not propagate this value into new design corpus as controlling target pricing.**

When implementing this contract, exact pricing must resolve against the then-current commercial authority.

---

# 87. Legacy cost anchor

Existing offer can include a `213%` cost anchor.

This is highly sensitive marketing/economic copy.

Verdict:

**REMOVE FROM TARGET UNTIL SEPARATELY RE-AUTHORIZED.**

No ROI / cost anchor should be invented.

---

# 88. No “what you lose by not buying”

Avoid:

- delay cost;
- expected value destroyed;
- risk of doing nothing;

unless explicitly supported for that deal.

---

# 89. Visual direction

Transition screen should feel like continuation of report.

Reuse:

- report shell / public shell;
- white analytical panels;
- navy/blue hierarchy;
- thin borders;
- 8px radius;
- restrained density.

Do not switch suddenly to aggressive sales landing design.

---

# 90. Decision Gap visual prominence

Decision gap is primary.

Price or consultation card is secondary.

This preserves analytical credibility.

---

# 91. Recommended screen composition

```text
Deal identity
Current public result status

Decision gap
Why it matters
Evidence needed

Choose next step
[Save this deal]
[Add internal evidence]
[Go deeper with private evidence]
[Request a specific-leader forecast] // only when relevant

Optional consultation
```

Not every option must appear every time.

---

# 92. Dynamic options

Only show next actions that are actually applicable.

Example:

if no specific-leader request:

> do not show 42Q path.

If no economics gap:

> no economic-exposure CTA.

---

# 93. No overwhelming option wall

Prefer:

1–3 contextually relevant next actions.

Not 8 cards of everything MergeVue can do.

---

# 94. Primary action selection

Primary CTA should correspond to the highest-value unresolved decision gap, if current rules can determine this lawfully.

Otherwise:

present options neutrally.

---

# 95. No dark pattern hierarchy

Do not make:

- paid CTA giant and blue;
- save action invisible;
- back to report tiny.

Visual priority follows user need, not revenue pressure.

---

# 96. Back to report

Always available:

`Back to public analysis`

unless transition is embedded inside report.

---

# 97. Embedded vs standalone transition

Preferred:

Decision Gap and next actions are already inside canonical report per `19`.

Standalone `screen-11-paid-offer` may still serve deeper scope detail.

Do not duplicate the entire report.

---

# 98. Route evolution

Potential target:

```text
Public report
→ embedded Decision Gap
→ screen-11 paid/deeper-diligence detail only if user selects deeper path
```

This preserves existing route while reducing sales interruption.

---

# 99. Route decision needed before rename

Do not rename `/screen-11-paid-offer` to prettier route here.

Later route migration can create:

`/deals/:id/deeper-analysis`

only after account/workspace architecture exists.

---

# 100. Anonymous user and screen 11

If anonymous user opens deeper-analysis explanation:

they can read scope without account.

Account required only when they choose an action needing persistence/private evidence.

---

# 101. No authentication dead end

If user is asked to sign in:

after authentication return them to:

- same deal;
- same report;
- same selected next step.

---

# 102. Workspace state handoff

On account creation:

conceptual handoff:

```text
publicAnalysisId
reportVersion
dealIdentity
selectedDecisionGap
selectedDepthPath
```

Do not depend on UI text parsing.

---

# 103. Payment not in this contract

This document stops before:

- checkout;
- invoice;
- subscription;
- payment confirmation.

Those need separate commercial/payment contract.

---

# 104. Security / NDA not in this contract

Private-evidence onboarding will require its own security / access contract.

Do not bury legal terms in decision-gap card.

---

# 105. Account UI not fully defined here

This contract specifies **when** account is requested and **why**.

Separate document should define:

- sign up;
- sign in;
- organization;
- persistence;
- recovery.

---

# 106. Evidence upload UI not fully defined here

This contract specifies the path.

Separate evidence/document contract defines:

- uploader;
- files;
- statuses;
- provenance;
- review.

---

# 107. Questionnaire UI not fully defined here

This contract protects routing and timing.

Separate questionnaire contracts define actual screens.

---

# 108. Analytics

Useful events:

```text
decision_gap_viewed
save_deal_selected
internal_evidence_selected
private_evidence_selected
specific_leader_forecast_selected
consultation_selected
consultation_submitted
```

No sensitive raw evidence in generic analytics.

---

# 109. Commercial funnel metric

Measure:

- which gap causes deeper engagement;
- which evidence path is selected;
- whether deeper path successfully starts.

Do not optimize only purchase conversion.

---

# 110. User abandonment

If user leaves after public report:

that is not product failure.

They already received value.

This is important for avoiding forced conversion patterns.

---

# 111. Accessibility

Target WCAG 2.2 AA.

Need:

- headings;
- button labels;
- decision-gap reading order;
- no color-only tier differences;
- keyboard actions;
- visible focus;
- clear error state;
- mobile reflow.

---

# 112. Mobile

Recommended order:

1. deal identity;
2. decision gap;
3. evidence need;
4. primary relevant action;
5. other paths;
6. consultation;
7. back to report.

No horizontal pricing comparison table.

---

# 113. Comparison grid mobile

Existing `Free output / Paid adds` table should become stacked comparison if retained.

Avoid side-scroll.

---

# 114. American English

All UI copy American English.

Avoid:

- British spellings;
- internal technical terms;
- `diagnostic` where new product language calls for `analysis`, unless it names a specific canonical diagnostic instrument.

---

# 115. “Diagnostic” usage

`Diagnostic` may remain:

- internal route;
- canonical instrument;
- technical context.

It should not be the generic customer-facing name for entire MergeVue product journey.

---

# 116. Existing asset decision matrix

| Existing asset | Decision |
|---|---|
| `/screen-11-paid-offer` | **KEEP / ADAPT** |
| `/screen-11b-homogeneous-offer` | **KEEP pending route review** |
| Free/Paid comparison layout | **ADAPT TO PUBLIC EVIDENCE / DEEPER EVIDENCE** |
| Pair context strip | **KEEP** |
| Legacy `$90K–$200K` | **DO NOT CARRY AS TARGET AUTHORITY** |
| Legacy cost anchor | **REMOVE / RE-AUTHORIZE** |
| Engagement action panel | **KEEP STRUCTURE / ADAPT** |
| CTA to consultation | **KEEP AS OPTIONAL PATH** |
| `/screen-12-consultation-request` | **KEEP** |
| `/screen-12-email-capture` | **KEEP / PURPOSE-SPECIFIC ONLY** |
| Public report | **KEEP VISIBLE** |
| Forced signup | **DO NOT ADD** |

---

# 117. Target action matrix

| User need | Evidence / capability | Next action |
|---|---|---|
| Save result | persistence | `Save this deal` |
| Resolve organizational unknown | structured observations | `Add internal evidence` |
| Resolve private factual unknown | private documents | `Go deeper with private evidence` |
| Quantify dependency | economics + private context | economic depth path |
| Forecast named leader | individual data | specific-leader path / 42Q |
| Complex scope | human scoping | `Request a consultation` |
| No deeper need | none | leave / return later |

---

# 118. Trust-level matrix

| Action | Trust escalation |
|---|---|
| Read public report | none |
| Read deeper-analysis options | none |
| Save deal | account |
| Add internal observations | account + respondent context |
| Invite respondents | contact/invite data |
| Upload private documents | secure paid/private workflow |
| Quantified economics | deal economics |
| Named-leader forecast | individual data / 42Q |
| Consultation | contact details |

---

# 119. Mandatory pre-implementation audit

| Element | LIVE | MAIN | Current defect | Target decision |
|---|---|---|---|---|
| Decision Gap | | | | |
| Paid offer route | | | | |
| Free/Paid comparison | | | | |
| Price | | | | |
| Cost anchor | | | | |
| Consultation CTA | | | | |
| Email capture | | | | |
| Save/account path | | | | |
| Internal evidence path | | | | |
| Private evidence path | | | | |
| 42Q path | | | | |

---

# 120. WHAT WAS INTENTIONALLY PRESERVED

Before merge list:

- existing screen-11 routes;
- consultation route;
- comparison component lineage;
- pair context;
- current public report;
- downstream questionnaire architecture;
- evidence architecture;
- paid/private boundary.

---

# 121. WHAT CHANGED AND WHY

Format:

```text
OLD
→ NEW
→ DEFECT
→ AUTHORITY
```

Example:

```text
Free output / Paid adds feature comparison
→ Public evidence establishes / Additional evidence can resolve
→ legacy comparison frames payment as feature unlock rather than evidence-depth escalation
→ progressive trust + canonical report congruence
```

---

# 122. Acceptance criteria

Transition passes only if:

1. user has already received public result;
2. public report remains visible;
3. Decision Gap precedes commercial ask;
4. gap is evidence-specific;
5. why-it-matters is shown;
6. evidence needed is explicit;
7. account is not described as evidence;
8. saving can require account;
9. no account required to read deeper options;
10. internal observations path is explicit;
11. canonical questionnaire begins only after user chooses it;
12. questionnaire content untouched;
13. respondent context enters only when needed;
14. private documents remain paid/private;
15. private upload not requested before scope need;
16. paid depth described through evidence, not feature count;
17. economic exposure not framed as predicted loss;
18. 42Q only appears for named-leader forecast;
19. no personality-type promise;
20. consultation optional;
21. consultation preserves deal/gap context;
22. email capture purpose explicit;
23. email not required to retain already shown public result;
24. exact new pricing not invented;
25. legacy `$90K–$200K` not treated as new authority;
26. legacy cost anchor not carried forward without re-authorization;
27. no forced generic pricing page;
28. no checkout route invented;
29. payment occurs later;
30. no dark-pattern urgency;
31. no fake ROI;
32. some gaps may be resolved without payment;
33. public and paid reports remain block-congruent;
34. deeper evidence does not erase public baseline;
35. confidence changes are explained by evidence;
36. contradictions remain visible;
37. paid analysis may still end cannot-determine;
38. human review not falsely promised;
39. existing routes preserved until deliberate migration;
40. return-to-report available;
41. authentication returns user to same deal/step;
42. no data loss during escalation;
43. action options are contextually filtered;
44. mobile order is coherent;
45. no horizontal pricing table required;
46. American English only;
47. WCAG 2.2 AA target maintained;
48. analytics avoid sensitive evidence;
49. user may leave after public result without coercion;
50. every deeper path states the actual evidence reason for asking for more trust.

---

# 123. Финальный принцип

> **MergeVue does not sell access to a hidden “real answer.” It shows the strongest answer supported by current evidence, identifies the decision gap, and asks for more trust only when a specific additional evidence layer can materially improve that decision.**

> **The commercial transition begins with epistemic honesty: what we know, what we do not know, what evidence could change that, and what it takes to obtain it.**
