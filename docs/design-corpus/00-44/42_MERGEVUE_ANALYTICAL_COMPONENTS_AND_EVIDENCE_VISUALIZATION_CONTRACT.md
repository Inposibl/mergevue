# 42. Контракт аналитических компонентов и визуализации доказательств MergeVue

**Файл:** `42_MERGEVUE_ANALYTICAL_COMPONENTS_AND_EVIDENCE_VISUALIZATION_CONTRACT.md`  
**Версия:** 1.0  
**Дата:** 2026-09-16  
**Язык документации:** русский  
**Язык клиентского интерфейса:** только American English  
**Рынок первой версии:** США  
**Статус:** **OWNER-ACCEPTED / CONTROLLING ANALYTICAL COMPONENTS AND EVIDENCE VISUALIZATION CONTRACT / C-04–C-07 CLOSED / НЕ СОЗДАЁТ НОВУЮ АНАЛИТИЧЕСКУЮ, МЕТОДОЛОГИЧЕСКУЮ ИЛИ MATHEMATICAL AUTHORITY**  
**Тип документа:** reusable analytical component contract / evidence-visualization presentation authority  
**Закрывает planned objects:** преимущественно `C-04 Таблицы`, `C-05 Карточки доказательств`, `C-06 Временные шкалы`, `C-07 Прогнозные блоки`; также закрывает reusable presentation obligations для provenance, contradictions, uncertainty и verification в пределах существующих semantic authorities  
**Upstream authority:** `09`, `10`, `11`, `19`, `22`, `24`, `25`, `26`, `27`, `28`, `29`, `31`, `32`, `41`  
**Owner acceptance:** 2026-09-16  
**Следующий authorized numbered design act:** `43_MERGEVUE_INTERACTION_FORMS_AND_SYSTEM_FEEDBACK_COMPONENT_CONTRACT.md`  
**Главный принцип:** компонент визуализирует уже авторизованный analytical/evidence object; компонент не создаёт analytical truth, не меняет confidence, не объединяет независимые state axes, не превращает отсутствие данных в отрицательный сигнал и не вводит новую методологию ради удобства интерфейса.  
**Ключевые инварианты:** `COMPONENT ≠ ANALYTICAL AUTHORITY`, `PROJECTION ≠ SOURCE OF TRUTH`, `SAME OBJECT → SAME SEMANTICS`, `EVIDENCE ≠ FILE`, `UPLOAD ≠ VERIFIED`, `REVIEW STATE ≠ CONCLUSION`, `CONTRADICTION ≠ LOW CONFIDENCE`, `UNKNOWN ≠ ZERO`, `MISSING ≠ NEGATIVE`, `FORECAST ≠ VERIFICATION`, `REPORT RELEASE ≠ FORECAST LOCK ≠ SEAL ≠ VERIFICATION`, `EXPOSURE ≠ LOSS`, `WORKFLOW ≠ CONFIDENCE`, `NO UNIVERSAL DEAL SCORE`, `NO COLOR-ONLY MEANING`, `NO DASHBOARD REPLACEMENT OF CANONICAL REPORT`, `FAIL CLOSED`

---

# 0. Назначение

Этот документ определяет reusable visual/component layer для аналитической системы MergeVue.

Он отвечает на вопрос:

> **Как одна и та же авторизованная аналитическая сущность должна отображаться последовательно, доказуемо и доступно в public result, Deal Workspace, paid report, expert/analyst projection, print/PDF и future monitoring surfaces — не создавая новую истину на уровне UI?**

`42` определяет presentation contract для:

1. аналитических таблиц;
2. evidence cards;
3. evidence rows;
4. provenance blocks;
5. evidence-channel summaries;
6. contradiction blocks;
7. uncertainty / cannot-determine presentation;
8. Decision Gap presentation;
9. analytical timelines;
10. forecast blocks;
11. verification blocks;
12. release/lock/seal metadata;
13. economic exposure/value-dependency presentation;
14. report-version/delta presentation;
15. claim/source traceability;
16. analytical empty/loading/blocked/error states;
17. screen → mobile → print/PDF semantic congruence.

`42` **не является** methodology act.

---

# 1. Что `42` НЕ имеет права создавать

Этот файл не создаёт и не изменяет:

- новые evidence classes;
- новые evidence item types;
- новые review states;
- новые confidence levels;
- numeric confidence percentages;
- новые contradiction states;
- новые report blocks;
- новый report order;
- новый risk taxonomy;
- новый Environment taxonomy;
- ECS formulas;
- новые ECS labels;
- predictive probability;
- Deal success probability;
- total Deal risk score;
- overall Deal accuracy score;
- economic attribution formula;
- dollar exposure formula;
- benchmark formula;
- verification outcome vocabulary;
- forecast lock/seal semantics;
- data-rights permissions;
- legal/privacy semantics;
- access-control semantics;
- questionnaire questions;
- 42Q type/personality display;
- new routes;
- backend schemas;
- release authority.

Если visual component требует новой semantic сущности, которой нет upstream:

> **component design stops; semantic authority must be created elsewhere first.**

---

# 2. Authority hierarchy

При конфликте:

1. controlling methodology / mathematical authority;
2. accepted report semantics;
3. evidence model / provenance / contradiction / release authorities;
4. forecast / verification authorities;
5. economic exposure authority;
6. global state model;
7. accessibility/content rules;
8. visual canon;
9. настоящий component contract.

`42` всегда subordinate.

---

# 3. Основная формула

```text
AUTHORITATIVE OBJECT
→ AUTHORIZED CLIENT PROJECTION
→ COMPONENT
→ SCREEN / MOBILE / PRINT
```

Не:

```text
COMPONENT
→ INTERPRETATION
→ NEW SCORE
→ CLIENT TRUTH
```

Компонент может:

- раскрывать;
- группировать;
- сортировать по разрешённому полю;
- адаптировать density;
- показывать provenance;
- показывать relationship;
- показывать limitation;
- показывать state.

Компонент не может:

- вычислять новый analytical meaning;
- повышать/понижать confidence;
- объединять разные axes;
- выбирать «главный риск» без authority;
- давать verdict;
- скрывать contradiction;
- заполнять отсутствующий block.

---

# 4. Same object, same semantics

Один semantic object может иметь несколько visual densities:

```text
compact
standard
expanded
print
expert-expanded
```

Но meaning остаётся идентичным.

Например:

```text
Evidence item: Disputed
```

может быть:

- маленьким row в Workspace;
- expanded evidence card;
- reference row в report;
- экспертным block с rationale/provenance;

но не может стать:

```text
Low confidence
```

только потому, что visual surface другая.

---

# 5. Surface congruence

Обязательные поверхности:

## 5.1. Public result

Показывает только client-safe public projection.

## 5.2. Deal Workspace

Показывает current object state и доступные lawful next actions.

## 5.3. Paid report

Показывает released canonical analytical projection.

## 5.4. Expert/analyst view

Сохраняет те же report blocks / core claims, добавляя:

- provenance;
- alternatives;
- conflicts;
- adjudication context;
- controls;
- release state.

## 5.5. Print/PDF

Сохраняет смысл без интерактивности.

Ни одна surface не получает отдельную «версию истины».

---

# 6. Canonical report remains primary interpretation

Reusable analytical components не заменяют canonical report из `19`.

Запрещено строить:

```text
generic risk dashboard
```

и считать его новой главной client truth.

Правило:

> **REPORT FIRST, COMPONENT DETAIL SECOND.**

Компоненты поддерживают report blocks.

Они не переопределяют их.

---

# 7. Component families

`42` устанавливает следующие families:

```text
A. Analytical Table
B. Evidence Card
C. Evidence List / Evidence Row
D. Provenance Block
E. Evidence Channel Summary
F. Contradiction Block
G. Uncertainty / Cannot Determine Block
H. Decision Gap Block
I. Analytical Timeline
J. Forecast Block
K. Forecast Lock / Seal Metadata Block
L. Verification Block
M. Economic Exposure / Value Dependency Block
N. Report Version / Change Block
O. Claim Traceability Block
P. Analytical Availability / Blocked State
```

Не все нужны на каждой surface.

---

# 8. Common anatomy contract

Каждый reusable analytical component должен иметь:

1. **purpose**;
2. **authoritative semantic object**;
3. **required fields**;
4. **optional fields**;
5. **client-safe projection rules**;
6. **states**;
7. **provenance behavior**;
8. **permission behavior**;
9. **unknown / missing behavior**;
10. **contradiction behavior**;
11. **loading behavior**;
12. **error behavior**;
13. **mobile behavior**;
14. **keyboard behavior**;
15. **screen-reader behavior**;
16. **print/PDF behavior**;
17. **prohibited interpretations**.

---

# 9. Common state axes

Не существует одного универсального `status`.

Компоненты могут одновременно зависеть от разных axes:

```text
DATA AVAILABILITY
REVIEW STATE
ANALYTICAL STATE
QUALITY GATE
WORKFLOW STATE
PERMISSION
RELEASE STATE
FORECAST STATE
VERIFICATION STATE
```

UI не должен схлопывать их.

Пример:

```text
Private evidence
Review state: Verified
Analytical relationship: Contradicts current finding
Report release: Under review
```

Это законно.

Нельзя заменить на:

```text
Status: Good
```

---

# 10. Unknown / missing / blocked distinctions

Обязательное различие:

```text
UNKNOWN
≠
MISSING
≠
NOT APPLICABLE
≠
BLOCKED
≠
NOT YET REVIEWED
≠
CANNOT DETERMINE
```

Никогда:

```text
missing evidence → 0
unknown confidence → Low
blocked output → unavailable data
```

---

# 11. Visual status doctrine

Status должен иметь:

- текст;
- при необходимости icon;
- optional color;
- accessible name.

Color никогда не единственный носитель meaning.

Запрещено:

```text
red = bad deal
green = good deal
```

без explicit semantic label.

---

# 12. Density doctrine

## Compact

Для overview.

Показывает:

- object identity;
- primary state;
- one key limitation/relationship;
- optional disclosure affordance.

## Standard

Основной working presentation.

## Expanded

Показывает provenance, evidence relationships, limitations, source metadata.

## Expert-expanded

Дополнительно может показывать authorized internal review fields.

## Print

Удаляет controls, сохраняет semantics.

---

# 13. Component A — Analytical Table

## Purpose

Структурированно сравнивать authoritative rows/objects.

Не использовать table только потому, что данных много.

## Required anatomy

- caption/title;
- column headers;
- row identity;
- semantic values;
- state/limitation where material.

## Optional

- sortable columns;
- disclosure;
- source/reference;
- timestamp;
- comparison marker.

## Prohibited

- hidden semantic ranking;
- arbitrary score column;
- color-only heatmap;
- inferred totals;
- totals across incompatible units;
- automatic prioritization without authority.

---

# 14. Table semantics before layout

До выбора columns implementer отвечает:

```text
What semantic object is one row?
What authority owns each column?
Can rows be compared?
Can values be aggregated?
Can users sort without changing meaning?
```

Если ответы не ясны:

> table not ready.

---

# 15. Analytical table — empty state

Не:

```text
No data
```

если meaning конкретнее.

Варианты:

```text
No evidence has been added.
No released forecasts are available.
No contradiction is currently recorded.
This value has not been quantified.
```

Только если factual.

---

# 16. Analytical table — mobile

Wide table не должна превращаться в horizontal-scroll-only wall.

Приоритет:

1. preserve row identity;
2. preserve semantic field labels;
3. stack secondary fields;
4. preserve source/limitation;
5. allow details disclosure.

Не скрывать material limitation ради ширины.

---

# 17. Analytical table — print

Print:

- повторяет header на новой странице where feasible;
- сохраняет row association;
- не обрезает material rows;
- не зависит от hover;
- не печатает sort/filter controls;
- не меняет order без explanation.

---

# 18. Component B — Evidence Card

## Purpose

Показать один governed evidence item в контексте analytical chain.

Evidence Card **не равна file card**.

---

# 19. Evidence Card — authoritative source

Card рендерится из authoritative evidence object / authorized projection.

Не из:

- filename alone;
- upload event alone;
- raw extracted LLM summary alone;
- browser local object;
- decorative metadata.

---

# 20. Evidence Card — minimum data

Minimum semantic fields when available/authorized:

```text
title / bounded label
evidence type
source/provenance
produced date or temporal context
review state
relationship to relevant finding/question
```

Deal binding implicit/explicit according to surface.

---

# 21. Evidence Card — optional data

May include:

- source party;
- evidence channel;
- related question/finding;
- relevant excerpt;
- document type;
- received date;
- reviewer-safe explanation;
- contradiction relation;
- follow-up need;
- confidence state, only if source object actually carries it.

---

# 22. Evidence Card — review state

Existing review semantics include:

```text
Unreviewed
Under review
Verified
Disputed
```

`42` does not rename internal enums globally.

Client-facing label can be bounded if `Verified` could overclaim.

Required principle:

> **review state ≠ analytical conclusion.**

---

# 23. “Verified” scope

If shown client-side:

UI must communicate what was verified.

Possible helper copy:

```text
Reviewed as an evidence item
```

not:

```text
This claim is true.
```

Do not imply:

- legal audit;
- predictive validation;
- full Deal validation.

---

# 24. Evidence confidence

Where authoritative evidence object carries:

```text
High
Medium
Low
Cannot determine
```

UI may display exact authorized semantic.

Do not convert to:

```text
87%
64%
31%
```

No invented numeric precision.

---

# 25. Evidence relationship

Existing relationship semantics may include:

```text
Supports respondent evidence
Contradicts respondent evidence
Context only
Requires follow-up
```

Card can surface relationship.

Do not replace with one generic:

```text
Impact: Positive / Negative
```

---

# 26. Evidence Card — public/private distinction

Same PDF format does not imply same evidence class.

Card must preserve lane:

```text
Public evidence
Internal observation
Private evidence
Individual-data-derived output
```

subject to client-safe wording.

---

# 27. Evidence Card — permission

If user lacks access:

Do not show metadata that itself leaks sensitive content.

Possible result:

```text
Restricted evidence
You do not have access to this item.
```

only if existence disclosure itself is allowed.

Permission filtering server-side.

---

# 28. Evidence Card — raw quote handling

Raw private quote not automatically client-safe.

Public/client surface must follow source/data-rights/report authority.

No raw respondent answers by default.

No 42Q raw answer display in ordinary report/evidence card.

---

# 29. Evidence Card — loading

Loading state must not imply:

```text
verified
scanned
analyzed
safe
```

Use neutral:

```text
Loading evidence…
```

or exact processing state if authoritative.

---

# 30. Evidence Card — processing state

Do not invent:

```text
AI verified
Security checked
Fully processed
```

unless specific backend authority exists.

---

# 31. Evidence Card — error

Error must distinguish:

- failed retrieval;
- failed processing;
- access denied;
- unsupported state;

if backend knows distinction.

Do not convert error to evidence absence.

---

# 32. Evidence Card — print

Print card preserves:

- evidence label;
- source/provenance;
- relevant state;
- relationship;
- limitation.

Interactive controls omitted.

Sensitive raw content still permission-filtered.

---

# 33. Component C — Evidence Row

Compact form of Evidence Card.

Required:

- identity;
- type/channel;
- review/relationship state as needed;
- provenance cue;
- disclosure affordance.

Row click must not silently trigger download.

---

# 34. Evidence list grouping

Permitted grouping only by authoritative attributes:

- evidence channel;
- source party;
- review state;
- relevant finding/question;
- temporal period.

Do not group by invented:

```text
strong evidence
weak evidence
important evidence
```

unless governing semantics defines it.

---

# 35. No source-count theater

Do not display:

```text
124 sources scanned
98% coverage
```

unless exact counting semantics exist and are decision-relevant.

Quantity is not credibility.

---

# 36. Component D — Provenance Block

## Purpose

Answer:

```text
Where did this come from?
When?
From which lane?
Under which evidence scope?
```

without exposing internal/security-sensitive details.

---

# 37. Provenance Block — minimum

Depending object:

- source type;
- source party/source label;
- source date / produced date;
- evidence lane;
- report/evidence version relation.

Material client claim should remain traceable.

---

# 38. Provenance ≠ citation decoration

A source icon or hyperlink alone is insufficient if analytical claim depends on:

- temporal relation;
- public/private distinction;
- respondent side;
- version;
- observation window.

Provenance is semantic.

---

# 39. Temporal provenance

Where time affects interpretation, show sufficient temporal context.

Examples:

```text
Published before announcement
Produced during diligence
Observed post-close
```

only when governing temporal classification exists.

Do not infer temporality from upload date.

---

# 40. Provenance disclosure levels

## Public

Client-safe source/reference.

## Paid

May include deeper source metadata.

## Expert

May include internal IDs, exact question/source relationships, review lineage if authorized.

No internal storage reference in client view.

---

# 41. Provenance missing

If material provenance missing:

- do not present evidence as fully authoritative;
- surface limitation or block use according to governing gate.

UI cannot manufacture provenance.

---

# 42. Component E — Evidence Channel Summary

Channels may include:

```text
Public evidence
Internal organizational observations
Private documents / deal context
Individual data — only if authorized/requested
```

These are evidence channels, not product tiers.

---

# 43. Evidence Channel Summary — purpose

Show:

- whether channel is relevant;
- current workflow/availability;
- what evidence exists/is missing;
- lawful next action.

It does **not** show analytical confidence automatically.

---

# 44. Channel status ≠ report confidence

Examples:

```text
Internal observations: Completed
```

does not mean:

```text
Conclusion: High confidence
```

and:

```text
Private evidence: Not started
```

does not mean:

```text
Conclusion: Low confidence
```

---

# 45. No universal progress percentage

Do not create:

```text
Evidence 72% complete
Deal 84% analyzed
```

without real denominator.

Prefer state-specific labels.

---

# 46. Component F — Contradiction Block

## Purpose

Make material evidence conflict visible and actionable.

Contradiction is not a visual warning decoration.

---

# 47. Contradiction is first-class state

Never hide contradiction behind:

```text
Low confidence
```

or average conflicting evidence into neutral output unless methodology explicitly authorizes.

---

# 48. Contradiction Block — required anatomy

Where client-visible and authorized:

```text
What conflicts
Which evidence channels disagree
Why it matters
Current review state
What evidence could resolve it
Current effect on conclusion/release
```

Do not reveal respondent identity without authority.

---

# 49. Contradiction states

Use only upstream-authorized states.

Existing concepts may include:

```text
open
under review
resolved
escalated to finding
```

`42` does not freeze a new client enum.

---

# 50. Resolved contradiction

Resolved does not mean one original source disappears.

Where useful:

- preserve historical conflict;
- show resolution outcome;
- show version/update.

Do not rewrite provenance history.

---

# 51. Unresolved contradiction

Can legitimately result in:

- bounded conclusion;
- confidence cap;
- Decision Gap;
- report block unavailable;
- release blocked.

Exact consequence comes from authority, not component.

---

# 52. No “AI resolved contradiction”

If governed human/analyst process resolved it:

show outcome.

Do not overclaim automation.

---

# 53. Component G — Uncertainty / Cannot Determine Block

## Purpose

Make lawful uncertainty usable.

`Cannot determine` is not an error.

---

# 54. Cannot determine semantics

Must preserve distinction from:

- negative finding;
- no risk;
- low risk;
- missing UI;
- system failure.

---

# 55. Recommended anatomy

```text
Current conclusion
Why it cannot be determined
What evidence is missing/conflicting
What would change the state
Relevant limitation
```

if upstream supports.

---

# 56. Unknown must remain useful

A component can still provide:

- known facts;
- unresolved question;
- missing evidence;
- next diligence step.

No pressure to fabricate full card.

---

# 57. Component H — Decision Gap Block

## Purpose

Render analytical gap, not task list.

Required conceptual fields:

```text
unresolved question
why it matters
evidence needed
current next step / available next steps
```

---

# 58. Decision Gap ≠ generic backlog

Do not translate to:

```text
Task #12
```

or checkbox completion.

Decision Gap remains analytical.

---

# 59. Evidence request link

If a Decision Gap identifies specific evidence need, component may connect to lawful evidence request.

Do not create generic upload CTA.

---

# 60. Ranked next step

Use:

```text
Next best evidence step
```

only if governing rules actually determine one.

Otherwise:

```text
Available next steps
```

without fabricated ranking.

---

# 61. Component I — Analytical Timeline

## Purpose

Show evidence chronology / forecast chronology / monitoring chronology.

Not project Gantt.

---

# 62. Timeline event ontology

Timeline event must have authoritative event identity.

Examples depending context:

```text
source produced
public announcement
analysis baseline
forecast locked
forecast sealed
close
observation checkpoint
intervention
re-measurement
verification
```

Only if applicable.

---

# 63. No decorative milestones

Never create:

```text
Day 30
Day 60
Day 90
```

as factual events unless schedule/authority exists.

---

# 64. Planned vs observed

Must be visually and textually distinct.

```text
Scheduled
Observed
Expected
Occurred
```

not interchangeable.

---

# 65. Forecast timeline

If forecast includes observation window:

timeline must preserve:

- start;
- end;
- relevant checkpoint;
- current time if useful on screen;
- no movement of locked window after outcome.

---

# 66. Timeline current marker

May appear in interactive screen.

Not required in static PDF.

Must not change historical event semantics.

---

# 67. Timeline provenance

Each material event can disclose source/detail.

Do not imply causality from sequence alone.

---

# 68. Intervention on timeline

If intervention materially affects verification:

show:

- intervention;
- timing;
- intended mechanism;

without automatically classifying forecast result.

---

# 69. Timeline mobile

Use vertical or stacked chronology.

Preserve:

- order;
- status;
- planned/observed distinction;
- source/limitation.

No compressed unreadable horizontal chart.

---

# 70. Timeline print

Static chronological order.

No hover-dependent event detail.

---

# 71. Component J — Forecast Block

## Purpose

Render one authorized forecast claim.

Forecast block is not generic prediction card.

---

# 72. Forecast authoritative source

Canonical structured forecast payload.

Not:

- rendered paragraph alone;
- analyst free text;
- browser state;
- email copy.

---

# 73. Forecast Block — minimum anatomy

Where applicable and authorized:

```text
Forecast claim
Scope/object
Observation window
Observable
Falsification / verification condition
Current forecast state
Version / ID
Evidence-scope summary
Limitations
```

Exact fields follow forecast authority.

---

# 74. Forecast claim wording

Must preserve exact locked claim where lock applies.

No paraphrase that changes:

- subject;
- direction;
- magnitude;
- timing;
- condition;
- observable.

---

# 75. Forecast confidence

Only render confidence semantics authorized by upstream.

No probability unless calibrated authority exists.

Never convert:

```text
High
```

to:

```text
82% likely
```

---

# 76. Forecast ≠ watchpoint

Watchpoint can be something to monitor.

Forecast is falsifiable claim with defined semantics.

Do not style both as interchangeable alert cards.

---

# 77. Forecast ≠ recommended action

Keep action separate.

Otherwise user may infer:

```text
we recommend this because outcome is certain.
```

---

# 78. Forecast ≠ Deal verdict

No:

```text
Deal will fail
Deal will succeed
Good deal / bad deal
```

unless a separate authority someday explicitly supports such product, which current corpus does not.

---

# 79. Multiple forecasts

Show independently.

Do not average into:

```text
Deal prediction score
```

---

# 80. Person forecast boundary

Named-leader forecast client-safe block can include only authorized behavioral claim and limitations.

Must not expose:

- raw 42Q;
- item text;
- axis scores;
- type;
- function stack;
- practitioner rationale;
- consent records.

---

# 81. Component K — Forecast Lock / Seal Metadata

## Purpose

Communicate integrity state accurately.

Critical distinctions:

```text
Report released
Forecast locked
Forecast sealed
Forecast verified
```

not one `Final`.

---

# 82. Lock state

`Locked` means exact claim frozen according to upstream authority.

It does not mean:

- sealed;
- correct;
- verified;
- public.

---

# 83. Seal state

`Sealed` only when actual accepted sealing requirements satisfied.

No decorative padlock badge if technical seal absent.

---

# 84. Seal metadata — client-safe

Possible fields where authoritative:

- Forecast ID;
- Forecast version;
- Locked date;
- Sealed date;
- status;
- bounded integrity reference.

Avoid internal implementation clutter.

---

# 85. Seal hash

If displayed:

- keyboard accessible;
- copyable if useful;
- not treated as proof of prediction correctness;
- exact payload scope must remain truthful.

Hash ≠ truth.

Hash ≠ publication authority.

---

# 86. Legacy seal

Do not relabel historical partial seal as full modern forecast seal.

Version semantics preserved.

---

# 87. Component L — Verification Block

## Purpose

Compare exact locked forecast to authoritative observed outcome under governing protocol.

---

# 88. Verification states

Use fixed upstream vocabulary where applicable:

```text
Confirmed
Partially confirmed
Not determinable
Missed
Falsified
```

Do not add visual sixth state like:

```text
Prevented
```

without Owner/method authority.

---

# 89. Verification pending

Before completion:

```text
Verification pending
```

not provisional `Confirmed`.

---

# 90. Verification Block — anatomy

After authoritative verification:

```text
Forecast
Exact locked claim

Verification
Result

Observation window

What happened

Evidence

Verified on

Relevant intervention/context
```

as applicable.

---

# 91. Verification ≠ report hero status

Report remains historical artifact/version.

Verification attaches to forecast.

Do not replace report header with:

```text
Confirmed
```

as if entire report were confirmed.

---

# 92. Multiple verification outcomes

Can show:

```text
Forecast 1 — Confirmed
Forecast 2 — Not determinable
Forecast 3 — Falsified
```

No forced aggregate.

---

# 93. No accuracy percentage

Do not compute:

```text
Deal forecast accuracy: 67%
```

without accepted aggregation method.

---

# 94. Intervention-aware display

If intervention materially affects comparability:

display context.

Do not automatically label original forecast Missed/Falsified from post-intervention outcome.

---

# 95. Verification evidence

Verification source/evidence must be traceable.

Do not verify from:

- rumor;
- wrong scope;
- wrong time window;
- generic poor performance;
- anecdote outside criterion.

Component cannot loosen protocol.

---

# 96. Component M — Economic Exposure / Value Dependency Block

## Purpose

Explain economic dependency without false precision.

---

# 97. Economic core distinction

```text
Economic exposure
≠
predicted loss
≠
valuation adjustment
≠
savings
≠
ROI
```

---

# 98. Permitted pre-quantification content

May safely show:

- Deal thesis;
- Value Dependency;
- Organizational Assumption;
- Risk Mechanism;
- Economic Channel;
- Economic Basis provenance;
- qualitative Economic Risk Translation;
- `Not quantified`;
- Economic Decision Gap;
- evidence needed.

---

# 99. Quantified output gate

Dollar figure only if upstream methodology makes it release-eligible.

Component never computes it.

---

# 100. Economic anatomy

Where qualitative:

```text
Deal thesis dependency
Organizational assumption
Risk mechanism
Economic channel
Economic basis/source
Current interpretation
Quantification state
Decision Gap
```

Where quantified and authorized additionally:

```text
amount/range
currency
time basis
attribution method
uncertainty
provenance
```

---

# 101. No hero “$ at risk”

Do not create giant KPI:

```text
$247M AT RISK
```

without governing methodology and correct semantics.

Even with quantified exposure, visual hierarchy must not imply expected loss if object is exposure.

---

# 102. No red/green financial verdict

No:

```text
green = value safe
red = value destroyed
```

---

# 103. Economic unknown state

`Not quantified` / `Cannot determine` can be primary lawful state.

Still show known dependency chain.

---

# 104. Currency and time basis

Never aggregate incompatible:

- currencies;
- time bases;
- revenue/EBITDA concepts;

unless methodology authorizes.

UI cannot fix methodological incompatibility by formatting.

---

# 105. Economic source provenance

Every amount must retain source provenance.

Every attribution requires methodology provenance.

Every probability requires calibration provenance.

---

# 106. Component N — Report Version / Change Block

## Purpose

Show evolution without rewriting history.

---

# 107. Baseline immutability

Adding internal/private evidence should create new version/delta where required.

Do not silently mutate initial public baseline.

---

# 108. Version card

Possible fields:

```text
Report label
Version
Generated
Evidence scope
Release status
Open report
```

Optional:

```text
What changed
```

if structured diff exists.

---

# 109. Structured diff

Allowed change categories can include authorized semantic deltas such as:

- Environment reading changed;
- Decision Gap resolved;
- contradiction introduced/resolved;
- recommended action changed;
- economic interpretation changed;
- forecast state changed where lawful.

Do not use freeform LLM diff as sole authority.

---

# 110. Version provenance

User should know which evidence scope produced which report version.

No post-hoc rewrite.

---

# 111. Component O — Claim Traceability Block

## Purpose

Allow user/expert to move:

```text
claim
→ evidence
→ provenance
→ limitation
```

at appropriate disclosure depth.

---

# 112. Public claim traceability

Client-safe level may show:

- sources;
- evidence class;
- date;
- supporting/contradicting summary.

No internal IDs unless useful and safe.

---

# 113. Expert traceability

May add:

- question refs;
- evidence IDs;
- alternative hypotheses;
- contradiction details;
- review rationale;
- control state;

only if authorized.

---

# 114. No raw internal code leakage

Do not expose:

- internal trigger enums;
- provider names where irrelevant;
- CORR IDs;
- Git hashes;
- methodology development artifacts;
- hidden type codes;
- raw storage refs.

---

# 115. Component P — Analytical Availability / Blocked State

## Purpose

Represent lawful inability to render analytical content.

---

# 116. Availability states

Possible conceptual meanings:

```text
Available
Unavailable due to evidence
Under review
Blocked by release gate
Not applicable
Not yet requested
```

Exact labels must come from upstream.

---

# 117. No fabricated block completion

Canonical report block can remain unsupported.

Do not fill with generic prose to preserve page symmetry.

---

# 118. Blocked ≠ error

Release gate can block output while system works normally.

Use meaningful copy:

```text
Report blocked pending review
```

if authorized.

---

# 119. Error ≠ analytical uncertainty

Technical failure:

```text
Unable to load this section.
```

does not mean:

```text
Cannot determine.
```

Keep separate.

---

# 120. Loading ≠ analysis in progress

Skeleton/loading only reflects UI/data retrieval.

Do not label:

```text
Analyzing…
```

unless backend analytical process actually runs.

---

# 121. Common empty-state rules

Each component should answer:

1. Does object not exist?
2. Is object hidden by permission?
3. Is object not applicable?
4. Is object unresolved?
5. Is object blocked?
6. Did retrieval fail?

No universal empty placeholder.

---

# 122. Common provenance cue

A compact provenance cue can use:

```text
Source
Evidence scope
Updated
```

but must open into exact client-safe detail if material.

No meaningless “verified source” badge.

---

# 123. Icons

Icons support meaning.

They do not create meaning.

A check icon cannot replace:

```text
Verified evidence item
```

A lock cannot replace:

```text
Forecast sealed
```

---

# 124. Badges

Use sparingly.

Allowed for bounded states.

Avoid badge soup.

One component should not expose five colored pills when readable prose is clearer.

---

# 125. Tooltips

Tooltip cannot contain sole material limitation.

If limitation affects interpretation, it must be visible/accessible in normal reading flow.

---

# 126. Disclosure controls

Useful for:

- provenance detail;
- evidence excerpts;
- methodology reference;
- version history;
- contradiction detail.

Collapsed state must still show material conclusion and limitation.

---

# 127. Tables vs cards

Use table when:

- repeated comparable schema;
- scan/comparison task.

Use cards when:

- one object carries narrative/provenance/state;
- row comparison secondary.

Do not turn every report block into card grid.

---

# 128. Visual hierarchy

Preferred order:

```text
claim / object meaning
→ state
→ key supporting evidence
→ limitation
→ provenance/detail
→ action
```

not:

```text
score
→ color
→ giant number
→ small caveat
```

---

# 129. Visual canon

Components inherit existing visual direction:

> professional investment-operational analytical system in which every material conclusion can be opened to its basis.

Closer to:

- investment memorandum;
- diligence report;
- evidence-backed decision system;

than consumer dashboard/game.

---

# 130. No parallel visual canon

`42` may standardize component anatomy.

It may not redefine:

- palette;
- typography system;
- overall page grammar;
- visual brand.

Those remain under `09`.

---

# 131. Information density

Analytical surfaces may be dense, but density must be structured.

Use:

- clear hierarchy;
- labels;
- whitespace;
- disclosure;
- compact metadata.

Avoid:

- tiny type;
- compressed badges;
- all-details-always-open;
- excessive borders.

---

# 132. Accessibility target

Target:

> **WCAG 2.2 AA**

Every analytical component must work with:

- keyboard;
- screen reader;
- zoom;
- narrow viewport;
- no color perception.

---

# 133. Keyboard

Interactive disclosure:

- reachable;
- focus visible;
- correct button semantics;
- state announced.

Rows must not require mouse-only hover.

---

# 134. Screen readers

Semantic labels must read meaningfully.

Example:

```text
Contradiction status: Under review
```

not:

```text
Red badge
```

---

# 135. Tables accessibility

Use real table semantics when truly tabular.

Do not build div-grid fake table without need.

Headers associated with cells.

---

# 136. Charts

`42` does not require charts.

If chart used:

- has textual equivalent;
- axes/units explicit;
- no deceptive scaling;
- color not sole encoding;
- source/uncertainty accessible.

No chart should introduce aggregation semantics absent upstream.

---

# 137. Timeline accessibility

Timeline visual order must match DOM/reading order.

Icons not sole event type cue.

---

# 138. Forecast accessibility

Exact claim, window, state and falsifier available as text.

No meaning hidden only in graphic.

---

# 139. Mobile global rule

Mobile preserves claim hierarchy and semantic completeness.

May reduce:

- columns;
- simultaneous metadata;
- decoration.

May not remove:

- limitation;
- provenance cue;
- contradiction;
- forecast window;
- verification status;
- critical unit.

---

# 140. Print/PDF global rule

Print must preserve:

- semantic sequence;
- limitations;
- states;
- provenance references;
- forecast exact claim;
- verification;
- report/version metadata.

No interactive-only dependency.

---

# 141. Screen/PDF congruence

Same released projection powers:

- screen;
- PDF;
- email-related report artifact where applicable.

Component presentation may adapt.

Semantics may not.

---

# 142. PDF source of truth

PDF is distribution artifact.

Not source of truth.

Structured projection remains authority.

---

# 143. Print split rules

Avoid splitting one analytical object across pages where it destroys meaning.

If split unavoidable:

- repeat object header;
- preserve state/association.

---

# 144. American English

Client-facing labels only American English.

Sentence case.

---

# 145. Component naming

Implementation component names are not product ontology.

React component:

```text
EvidenceCard
```

does not create evidence class.

UI architecture must not leak framework naming into product semantics.

---

# 146. Component API doctrine

A component API may accept:

```text
state
source
label
details
```

but should not accept generic freeform fields that let frontend invent semantic overrides.

Prefer typed authoritative projection.

---

# 147. No boolean semantic collapse

Avoid APIs like:

```text
isGood
isRisky
isVerified
isComplete
```

when underlying object has richer state.

---

# 148. No local score computation

Component must never compute:

- confidence;
- risk;
- ECS;
- probability;
- exposure;
- verification;
- completeness;

from child props.

Render only supplied authorized semantics.

---

# 149. Sorting

Sorting can affect perception.

Default sort must be neutral or authority-derived.

Do not default to:

```text
highest risk first
```

without authorized risk ordering.

---

# 150. Filtering

Filter hides objects, not truth.

If filter active:

- visible indicator;
- count if accurate;
- reset action.

Print/export should indicate applied filter if filtered output is allowed.

---

# 151. Search within evidence

Search may match authorized client-visible metadata/content.

No leaking hidden evidence through search suggestions/counts.

---

# 152. Export from components

`42` does not create export rights.

Export controls governed elsewhere.

Component can render export-safe projection only after authorization.

---

# 153. Rights metadata

Data-rights state should not clutter ordinary analytical view.

Show rights limitation when action depends on it.

Example:

```text
Restricted to this deal
```

not internal policy code.

---

# 154. Public evidence rights/provenance

Public availability does not remove:

- source rights;
- terms;
- citation;
- temporal provenance.

Evidence component should preserve citations where required.

---

# 155. Private evidence reuse

No component can imply private evidence becomes cross-Deal reference.

No:

```text
Used across our benchmark
```

unless separate rights/method authority exists.

---

# 156. 42Q separation

42Q raw data never becomes generic Evidence Card in ordinary client product.

Authorized client-safe behavioral forecast is separate semantic object.

---

# 157. Monitoring data

Monitoring evidence can appear only in its governed longitudinal context.

No always-on employee surveillance visualization.

---

# 158. Telemetry separation

Technical telemetry is not analytical evidence.

Do not put:

```text
upload failed 3 times
```

into Deal risk interpretation.

---

# 159. Workflow status separation

Examples:

```text
Evidence collection in progress
Review complete
```

are workflow.

Do not map to:

```text
Low / High confidence
```

---

# 160. Release state separation

Report can be analytically computed yet not releasable.

Component must respect release gate.

No frontend bypass.

---

# 161. Analyst/client congruence

Analyst view can be deeper.

It cannot state opposite core claim merely because controls are visible.

Same claim domain.

---

# 162. Analyst rationale

Internal rationale does not automatically become client narrative.

Client component consumes released projection.

---

# 163. Alternative hypotheses

Expert-expanded component may show alternatives.

Ordinary client view shows them only if authorized/relevant.

No hallucinated alternative list.

---

# 164. Confidence cap

If release authority imposes confidence cap:

expert view may show exact cap/reason.

Client view may show bounded limitation.

Component cannot raise cap.

---

# 165. Reliability trigger

Internal reliability triggers are control evidence.

Do not copy as client headline.

---

# 166. Claim class visual distinction

Where report authority distinguishes claim classes, presentation should preserve distinction.

Do not make:

- observation;
- inference;
- forecast;
- recommendation;

look semantically identical if their evidentiary status differs.

---

# 167. Recommendation block relation

Recommended action remains action/control.

Do not visually merge with forecast outcome.

---

# 168. Watchpoint component relation

Watchpoint list can show:

- statement;
- review window;
- linked mechanism/resource;
- latest observation;
- status.

Only real fields.

---

# 169. Watchpoint state ≠ forecast verification

Keep separate.

---

# 170. Intervention status ≠ effect status

Keep separate.

```text
Action completed
```

does not mean:

```text
Risk reduced
```

---

# 171. Monitoring status ≠ Deal health

Do not use one `Integration health` gauge.

---

# 172. Evidence chronology ≠ causal proof

Timeline order can support sequence understanding.

It does not establish causality.

---

# 173. Source party

Where source party is material:

preserve existing authoritative vocabulary.

Do not simplify away side/source just to make card prettier.

---

# 174. Document type

Use current authoritative vocabulary.

Do not proliferate generic M&A categories.

---

# 175. Relevance dispute

If upstream lacks explicit `irrelevant` state:

component cannot invent it.

Use authorized follow-up/review semantics.

---

# 176. Supersession

If upstream lacks evidence supersession state:

do not invent `Superseded` badge.

Version/history can show factual replacement only after authority exists.

---

# 177. Claim-level diff

Useful future component.

But only after structured semantic diff exists.

No freeform “AI says these are changes” as authority.

---

# 178. Stable identity

Where user needs cross-version understanding, analytical objects should have stable identity/version from backend.

Component does not generate identity locally.

---

# 179. Date semantics

Distinguish:

- source produced;
- uploaded;
- reviewed;
- report generated;
- released;
- locked;
- sealed;
- verified.

Do not use generic `Date`.

---

# 180. Relative dates

Client UI may show relative date for convenience.

Exact date must remain accessible where analytical/audit meaning depends on it.

---

# 181. Units

Always display unit.

No naked numbers.

Examples:

```text
USD
months
percentage points
respondents
```

only where authoritative.

---

# 182. Percentages

Percentages need denominator/semantic definition.

Do not show percent because visual component supports progress ring.

---

# 183. Confidence visualization

Prefer textual bounded labels over gauges.

No speedometer.

No “confidence meter” without defined semantics.

---

# 184. Risk visualization

No generic risk meter from internal risk objects.

Canonical report remains interpretation.

---

# 185. Environment visualization

`42` does not redefine Environment visual semantics.

No personality-style type badges.

---

# 186. ECS visualization

ECS only where valid and authorized.

Do not present as success probability.

No giant score hero.

---

# 187. Economic visualization

No waterfall/stacked total that implies additive exposure before overlap methodology exists.

---

# 188. Contradiction visualization

Do not use red exclamation alone.

Text:

```text
Conflicting evidence
```

plus explanation.

---

# 189. Verification visualization

Outcome labels can use icon/color secondarily.

Text remains primary.

`Falsified` is forecast verification result, not overall Deal failure.

---

# 190. Empty forecast

If no forecast authorized:

do not show disabled empty forecast card implying product failure.

Show forecast component only where context warrants.

---

# 191. Hidden 42Q lane

Individual-data component hidden by default unless named-leader context authorized.

No global person-analysis dashboard.

---

# 192. Security/privacy display

Analytical components should not become security/privacy claim surfaces beyond necessary source/access labels.

`41` owns public trust explanation.

---

# 193. Loading skeleton privacy

Skeleton should not reveal hidden row count or restricted object presence where that itself could leak.

---

# 194. Error logging privacy

Client error should not expose private data/storage reference/internal IDs.

---

# 195. Performance

Large evidence sets may virtualize/paginate.

Performance optimization cannot:

- change sort semantics;
- omit material states;
- lose keyboard access;
- expose hidden content.

---

# 196. Pagination

If pagination used:

- total only if accurate;
- state retained;
- print/export semantics explicit.

---

# 197. Truncation

Text truncation must preserve access to full authorized content.

Never truncate material limitation with no disclosure.

---

# 198. Source excerpts

Excerpt must be source-faithful.

No generated quote.

Clearly distinguish:

- direct excerpt;
- MergeVue summary;
- analytical interpretation.

---

# 199. LLM narrative

Narrative may be generated only after structured authority.

Component must bind narrative to released/authorized object.

No raw LLM-to-screen analytical truth.

---

# 200. Hallucination firewall

Component cannot synthesize missing:

- source;
- date;
- forecast window;
- confidence;
- amount;
- status;
- explanation.

Missing stays missing/unknown.

---

# 201. Client-safe language

Prefer:

```text
Conflicting evidence
Additional evidence required
Cannot determine
Not quantified
Verification pending
Report blocked pending review
```

over internal control codes.

---

# 202. Internal identifiers

Expert view may expose IDs where useful.

Client view should avoid clutter.

Never expose secret tokens.

---

# 203. Interaction affordance boundary

`42` can require:

- expand;
- inspect source;
- open report;
- view change;
- view evidence.

Detailed button/form/system-feedback anatomy is finalized in `43`.

---

# 204. No new route

A component can appear in existing/new authorized surface.

`42` does not create:

```text
/evidence
/forecast
/verification
```

routes.

---

# 205. Implementation traceability table

Before code, team must build:

| Component | Authoritative object | Source contract | Client projection | States | Permission gate | Print behavior |
|---|---|---|---|---|---|---|
| Analytical Table | | | | | | |
| Evidence Card | | | | | | |
| Provenance Block | | | | | | |
| Contradiction Block | | | | | | |
| Decision Gap | | | | | | |
| Timeline | | | | | | |
| Forecast Block | | | | | | |
| Verification Block | | | | | | |
| Economic Exposure | | | | | | |
| Report Version | | | | | | |

No row can be filled from designer invention.

---

# 206. Mandatory object contract per component

Implementation spec for each component must state:

```text
authoritativeObject
authorityContract
allowedSurfaces
requiredFields
optionalFields
clientSafeProjection
permissionRule
emptyState
unknownState
blockedState
loadingState
errorState
mobileRule
printRule
accessibilityRule
prohibitedInference
```

Exact code schema may differ.

---

# 207. Visual regression baseline

Implementation should compare against accepted MergeVue visual lineage.

Do not redesign into generic SaaS dashboard.

---

# 208. Semantic regression tests

Tests must prove:

1. missing evidence does not render zero;
2. contradiction does not become low confidence;
3. review state does not become analytical conclusion;
4. workflow complete does not become high confidence;
5. blocked release cannot render released report;
6. locked does not render sealed;
7. sealed does not render verified;
8. pending verification cannot render Confirmed;
9. exposure does not render expected loss;
10. Not quantified remains valid;
11. multiple forecasts do not create overall score;
12. person data does not leak;
13. private evidence remains permission-filtered;
14. report order not altered by components.

---

# 209. Accessibility regression tests

Must prove:

- keyboard navigation;
- focus visible;
- table headers correct;
- disclosure state announced;
- no color-only states;
- mobile reflow;
- zoom/readability;
- print semantics;
- meaningful accessible labels.

---

# 210. Print regression tests

Must compare:

- screen claim;
- PDF claim;
- status;
- source/provenance;
- limitation;
- version;
- forecast exact wording;
- verification result.

No semantic drift.

---

# 211. Permission regression tests

Must prove:

- hidden private item not leaked by count/search;
- restricted 42Q not exposed;
- external recipient projection limited;
- export respects rights;
- client cannot reveal internal analyst fields;
- public view cannot query private evidence.

---

# 212. Version regression tests

Must prove:

- old report version preserved;
- new evidence creates new version where required;
- locked forecast immutable;
- later verification links exact forecast ID/version;
- no hindsight mutation.

---

# 213. Economic regression tests

Must prove:

- no amount invented;
- no unit missing;
- no incompatible aggregation;
- no total exposure before method;
- no exposure→loss relabel;
- `Cannot determine` survives;
- source provenance survives.

---

# 214. Contradiction regression tests

Must prove:

- conflict visible where material;
- no averaging away;
- resolution history retained where applicable;
- client identity/privacy respected;
- analyst resolution does not rewrite raw evidence.

---

# 215. Loading/error regression tests

Must prove:

- loading does not show analytical state;
- network error does not become Cannot determine;
- access denied does not become no evidence;
- stale data clearly handled;
- retry does not mutate analytical state.

---

# 216. What designer MAY decide

- card geometry;
- spacing;
- row density;
- disclosure layout;
- icon family;
- responsive stacking;
- table/card breakpoints;
- timeline visual line;
- metadata placement;
- typography within canon.

---

# 217. What designer MAY NOT decide

- new score;
- new confidence;
- new state;
- new evidence relationship;
- new forecast label;
- new verification outcome;
- new economics formula;
- new risk ranking;
- new report block;
- new data right;
- new permission;
- new evidence type.

---

# 218. What frontend MAY decide

- component composition;
- responsive behavior;
- client-side disclosure state;
- local sorting/filtering over already authorized set;
- presentational formatting.

---

# 219. What frontend MAY NOT decide

- report authority;
- permission;
- evidence truth;
- confidence;
- contradiction resolution;
- forecast lock/seal;
- verification;
- economics;
- methodological eligibility.

---

# 220. What backend projection must supply

Where applicable:

- authorized object;
- authoritative state;
- client-safe fields;
- permission-safe links;
- version;
- limitation;
- provenance;
- next allowed action.

Frontend should not reconstruct these from unrelated fields.

---

# 221. What analyst MAY influence

Only through accepted review workflow.

Not via visual control that changes method.

---

# 222. What LLM MAY do

Within authority:

- explain structured object;
- summarize evidence;
- draft client-safe narrative;
- surface already-authorized relationship.

May not:

- create state;
- invent score;
- infer release;
- change forecast;
- generate amount;
- override contradiction.

---

# 223. Reuse rule

Prefer one semantic component family reused across:

- public result;
- workspace;
- paid report;
- expert view;

with projection/density variants.

Do not fork four unrelated components with drifting meanings.

---

# 224. Variant rule

Variant changes presentation.

Example:

```text
EvidenceCard variant="compact"
EvidenceCard variant="expanded"
```

Variant must not switch semantic ontology.

---

# 225. Public vs expert variant

Expert variant can reveal more fields.

It cannot show a different core client claim without indicating adjudication/draft/release distinction.

---

# 226. Component maturity labels

Internal implementation may distinguish:

```text
prototype
target
production
```

Do not expose as analytical status.

---

# 227. No fake component completeness

A beautifully designed Forecast Block does not mean forecast backend exists.

Target-only component must not be promoted as production capability.

---

# 228. Backend readiness gates

Before component production use:

- authoritative object exists;
- permission enforced;
- states persisted;
- source/provenance available where required;
- report integration governed;
- error/retry behavior real.

---

# 229. No local-only promotion

React demo with mock JSON does not establish production analytical capability.

---

# 230. Canonical examples — Evidence Card

```text
Private evidence

Governance model
Source: Target
Produced: May 2026
Review: Under review
Relationship: Contradicts respondent evidence

This item has not yet been integrated into a released report.
```

Only if exact states/fields authoritative.

---

# 231. Canonical examples — Contradiction

```text
Conflicting evidence

Internal observations and private documentary evidence disagree on decision authority.

Why it matters
The current governance conclusion remains unresolved.

What could resolve it
Additional evidence about formal decision rights.

Status
Under review
```

No invented respondent identity.

---

# 232. Canonical examples — Cannot Determine

```text
Cannot determine

The available evidence does not support a reliable conclusion about post-close decision authority.

Missing evidence
Formal governance and escalation rights.

Why it matters
This assumption affects the current integration mechanism assessment.
```

---

# 233. Canonical examples — Forecast

```text
Forecast

[Exact authorized claim]

Observation window
[Exact locked window]

Observable
[Authorized observable]

Status
Locked

Verification
Pending
```

No probability unless authorized.

---

# 234. Canonical examples — Verification

```text
Verification

Result
Confirmed

Forecast
[Exact locked claim]

Observation window
[...]

What happened
[...]

Evidence
[...]

Verified on
[date]
```

Only after authoritative completion.

---

# 235. Canonical examples — Economic Exposure

```text
Economic exposure

Value dependency
[Authorized dependency]

Organizational assumption
[...]

Risk mechanism
[...]

Economic basis
[Source / period]

Quantification
Not quantified

Decision gap
Additional economic basis is required before attributable exposure can be quantified.
```

---

# 236. Canonical examples — Report Version

```text
Current report

Version 3
Private evidence added
Generated Sep 16, 2026
Evidence scope Public + internal + private
Status Released

Open report
What changed
```

Exact labels depend on authoritative architecture.

---

# 237. Anti-pattern — score-first dashboard

Forbidden direction:

```text
Overall risk 73
Culture match 61%
Evidence complete 84%
Deal health RED
```

unless every metric has separate accepted authority; current corpus does not authorize such generic dashboard.

---

# 238. Anti-pattern — evidence theater

Forbidden:

```text
47 files analyzed
132 AI signals
92% evidence confidence
```

without rigorous semantics.

---

# 239. Anti-pattern — card proliferation

Not every internal object gets card.

Only decision-relevant reusable objects.

---

# 240. Anti-pattern — all states as badges

Use prose/layout where clearer.

---

# 241. Anti-pattern — hidden limitation

Do not put:

```text
Not quantified
```

in tiny tooltip under giant dollar headline.

---

# 242. Anti-pattern — contradiction smoothing

No:

```text
Evidence mixed → Medium confidence
```

if contradiction is material and first-class.

---

# 243. Anti-pattern — forecast success color

No green celebration for Confirmed.

Verification is empirical result, not gamification.

---

# 244. Anti-pattern — analyst gamification

No:

- analyst accuracy leaderboard;
- contradiction closure streak;
- review speed score.

---

# 245. Anti-pattern — person scoring

No person scorecard from 42Q.

---

# 246. Anti-pattern — economic fear display

No giant red loss number designed to sell paid service.

---

# 247. Anti-pattern — provenance buried

Material claim without accessible source/provenance path fails.

---

# 248. Anti-pattern — generic “AI insight”

Every insight needs claim class/authority.

Do not use:

```text
AI Insight
```

as evidence class.

---

# 249. Anti-pattern — “system says”

Client copy should explain evidence basis, not invoke opaque machine authority.

---

# 250. Audit footer relation

Component system must preserve client-safe audit footer fields from report authority.

Do not overload every component with report audit metadata.

---

# 251. Limitation locality

Material limitation should appear near affected claim.

Not only global footer.

---

# 252. Cross-component consistency

Same state wording means same thing everywhere.

Do not use:

```text
Verified
```

for evidence review and forecast outcome unless context makes distinction unmistakable.

Prefer more explicit labels where collision risk exists.

---

# 253. Vocabulary registry

Implementation should maintain central semantic label registry mapped to upstream state.

Do not hard-code different synonyms per page.

---

# 254. Internationalization

v1 client UI American English only.

Architecture should avoid images containing essential English text when normal DOM text can be used.

---

# 255. Auditability

For material component, developer should be able to answer:

```text
Which upstream object produced this?
Which authority allowed it?
Which version?
Which fields were hidden?
Which limitation applies?
```

---

# 256. Component telemetry

Allowed generic UI telemetry should not include:

- raw evidence text;
- raw respondent answer;
- private filename unnecessarily;
- 42Q values;
- hidden analytical codes.

Telemetry ≠ evidence.

---

# 257. Analytics on component interaction

May measure generic usability:

- expanded;
- opened source;
- copied reference;

subject to privacy policy.

Do not feed interaction into Deal inference automatically.

---

# 258. Performance vs truth

Never drop contradiction/provenance/limitation from initial render solely to improve perceived speed if user could misread conclusion.

Can lazy-load deep detail after key state visible.

---

# 259. Stale data

If client view is stale relative to server:

do not keep presenting old release state as current without version context.

Use safe refresh/reload behavior.

---

# 260. Concurrent update

If report/evidence version changes during session:

preserve object/version identity.

Do not merge old/new fields visually into hybrid object.

---

# 261. Permission change

If permission revoked:

component must stop exposing restricted data under current server state.

No cached client-side continuation as authority.

---

# 262. Report release change

Draft/under-review object does not silently replace released client artifact.

---

# 263. Verification update

When verification completes:

forecast block may gain linked Verification Block.

Locked claim remains unchanged.

---

# 264. Outcome evidence rights

Verification outcome can still be Deal-confidential.

`Confirmed` does not mean publishable.

---

# 265. Benchmark display

`42` does not authorize benchmark components.

Any future benchmark needs population/provenance/privacy/method authority.

---

# 266. Historical cases

Historical-case components may reuse families if semantic object matches.

Do not mix live private Deal evidence into historical public case projection.

---

# 267. FREE vs PAID

Component appearance may be reused.

Data depth differs.

Do not style paid evidence as inherently more truthful merely because paid.

---

# 268. Evidence depth progression

Progression:

```text
public
→ internal
→ private
→ person-level where eligible
```

is trust/data-depth progression, not automatic confidence ladder.

---

# 269. Expert progression

Expert view is expanded projection, not separate report.

---

# 270. Report block integration

Components may live inside canonical blocks.

They must not reorder canonical 12 public report blocks.

---

# 271. Decision Gap persistence

Decision Gap remains visible across save/workspace/deeper evidence until lawfully resolved/versioned.

---

# 272. What changed

Where evidence resolves/changes a claim:

show structured delta.

Do not erase previous version.

---

# 273. Forecast freeze

Once locked:

component cannot provide edit action in released client context.

Any correction/version requires governed new version.

---

# 274. Seal display timing

Do not show `Sealed` until seal authoritative.

If PDF generated before seal and seal intended to appear, distribution behavior follows `26`.

---

# 275. Print forecast

Preserve:

- exact claim;
- version;
- window;
- falsifier/verification condition;
- lock/seal state/timestamp where applicable;
- report version.

---

# 276. Mobile forecast

Stack:

- claim;
- window;
- observable;
- falsifier;
- status.

No horizontal dense ledger.

---

# 277. Mobile evidence

Primary content first.

Provenance/detail collapsible only if meaning preserved.

---

# 278. Mobile contradiction

Conflict statement + state + why it matters remain visible without expansion.

---

# 279. Mobile economic

Do not reduce to number.

Keep unit + meaning + quantification state.

---

# 280. Print evidence

No hidden source behind icon-only link.

Source/reference rendered textually.

---

# 281. Print contradiction

Conflict/limitation must remain.

No “clean” print that removes warning state.

---

# 282. Print Decision Gap

Decision Gap remains analytical report content.

---

# 283. Print verification

Result remains tied visually/textually to exact forecast.

---

# 284. Design QA — semantic questions

Reviewer asks for every component:

1. What object is this?
2. Where is its authority?
3. What does state mean?
4. What does state not mean?
5. What is source?
6. What is missing?
7. What can user lawfully infer?
8. What might user incorrectly infer?
9. What changes on mobile?
10. What changes on print?

---

# 285. Design QA — visual questions

1. Is claim more prominent than decorative score?
2. Is limitation near claim?
3. Is provenance reachable?
4. Is contradiction visible?
5. Is color secondary?
6. Is density professional?
7. Is layout congruent with MergeVue canon?
8. Does object still read correctly without icon/color?

---

# 286. Design QA — accessibility questions

1. Keyboard?
2. Focus?
3. Screen reader?
4. Heading/list/table semantics?
5. Zoom?
6. Mobile?
7. Print?
8. Color-independent?

---

# 287. Design QA — fail-closed questions

1. What if field absent?
2. What if permission unknown?
3. What if status unknown?
4. What if projection stale?
5. What if contradiction unresolved?
6. What if forecast unsealed?
7. What if verification pending?
8. What if economics unquantified?

Correct answer must never be invented certainty.

---

# 288. Implementation acceptance criteria

`42` passes only if:

1. reusable component families defined;
2. canonical report remains primary client truth;
3. report order unaffected;
4. Evidence Card not equal File Card;
5. review state separated from conclusion;
6. confidence not converted to percentage;
7. contradiction first-class;
8. unknown/missing/blocked distinct;
9. Decision Gap remains analytical;
10. timeline uses real events;
11. planned/observed distinct;
12. forecast renders exact authorized claim;
13. forecast ≠ watchpoint/action;
14. released/locked/sealed/verified distinct;
15. verification vocabulary unchanged;
16. no aggregate Deal accuracy invented;
17. interventions do not auto-rewrite result;
18. economic exposure ≠ loss;
19. Not quantified supported;
20. no incompatible economic aggregation;
21. report versions preserve history;
22. claim traceability defined;
23. public/private/person lane preserved;
24. rights/permissions respected;
25. client/expert congruence preserved;
26. no raw 42Q leakage;
27. accessibility defined;
28. mobile defined;
29. print/PDF defined;
30. component API cannot create analytical truth;
31. no local score computation;
32. no new route;
33. no parallel visual canon;
34. no generic dashboard replaces report;
35. no color-only state;
36. no source-count theater;
37. no fake certainty;
38. regression tests defined;
39. `C-04`–`C-07` materially closed;
40. downstream `43` can define interaction controls without reopening analytical semantics.

---

# 289. Planned-object closure map

## C-04 — Tables

Closed by:

- Sections 13–17;
- table semantics;
- accessibility;
- mobile;
- print;
- non-aggregation rules.

## C-05 — Evidence Cards

Closed by:

- Sections 18–41;
- evidence rows;
- provenance;
- permission;
- client-safe projection.

## C-06 — Timelines

Closed by:

- Sections 61–70;
- forecast/monitoring chronology;
- planned vs observed;
- mobile/print.

## C-07 — Forecast Blocks

Closed by:

- Sections 71–95;
- lock/seal metadata;
- verification;
- exact claim preservation.

Supporting component obligations for contradictions/provenance/economics are also closed as reusable presentation rules without creating new substantive semantics.

---

# 290. Explicit non-closure

`42` does **not** close:

- generic form/input library;
- buttons/action hierarchy;
- validation presentation as a universal component system;
- dialogs;
- toast/banner system;
- notifications UI;
- error component system globally;
- paid restriction component system;
- auth UI.

Those belong to `43`.

---

# 291. Anti-proliferation effect

После Owner acceptance `42` не создавать отдельные numbered design files для:

- Tables;
- Evidence Cards;
- Provenance;
- Contradiction UI;
- Timeline;
- Forecast Card;
- Verification Card;
- Economic Exposure Card;

если новый requirement является только variant/subcomponent этого contract.

Separate numbered file требует Owner Change Act и genuinely distinct durable responsibility.

---

# 292. Relationship to `43`

`43` будет определять interaction grammar:

- actions;
- forms;
- validation;
- disclosure controls;
- blocking feedback;
- notifications representation;
- dialogs;
- destructive actions;
- loading/submission/error behavior system-wide.

`42` уже определяет semantic obligations аналитических компонентов.

`43` не должен переопределять их.

---

# 293. Relationship to `44`

`44` должен проверить:

- все C-04–C-07 obligations traceable to implementation;
- component → authority mapping;
- screen/mobile/PDF congruence;
- accessibility;
- regression tests;
- no invented analytics;
- no component semantic drift;
- no missing planned object.

---

# 294. Owner acceptance and controlling status

Owner explicitly ACCEPTED this contract on:

```text
2026-09-16
```

From that point:

```text
42_MERGEVUE_ANALYTICAL_COMPONENTS_AND_EVIDENCE_VISUALIZATION_CONTRACT.md
=
OWNER-ACCEPTED
CONTROLLING ANALYTICAL COMPONENTS AND EVIDENCE VISUALIZATION CONTRACT

C-04 = CLOSED
C-05 = CLOSED
C-06 = CLOSED
C-07 = CLOSED
```

This acceptance establishes the reusable analytical presentation authority for:

- tables;
- evidence cards and rows;
- provenance presentation;
- contradiction presentation;
- analytical timelines;
- forecast blocks;
- lock/seal metadata presentation;
- verification blocks;
- economic exposure/value-dependency presentation;
- report-version and claim-traceability presentation.

This acceptance does **not** create or modify:

- methodology;
- mathematical authority;
- evidence classes;
- evidence review semantics;
- confidence semantics;
- contradiction semantics;
- report block order;
- Environment taxonomy;
- ECS semantics;
- forecast meaning;
- verification vocabulary;
- economic attribution formula;
- probability;
- data rights;
- permission rules;
- release authority.

All such semantics remain governed by their respective upstream authorities.

Under:

`MERGEVUE_REMAINING_CORPUS_MANIFEST_v1.0`

the next and only authorized numbered design act is:

```text
43_MERGEVUE_INTERACTION_FORMS_AND_SYSTEM_FEEDBACK_COMPONENT_CONTRACT.md
```

No numbered design artifact may be inserted between `42` and `43` without a separate Owner Change Act.

Final state:

```text
STATUS = OWNER-ACCEPTED / CONTROLLING
C-04 = CLOSED
C-05 = CLOSED
C-06 = CLOSED
C-07 = CLOSED
AMBIGUITY = 0
NEXT NUMBERED ACT = 43
```

---

# 295. Финальная формула

> **A MergeVue analytical component is a lens over governed analytical truth, not a place where new truth is created.**

> **Evidence remains evidence; review remains review; contradiction remains contradiction; uncertainty remains uncertainty; a forecast remains a falsifiable locked claim; verification remains a later comparison against that exact claim; and economic exposure remains a dependency, not a predicted loss.**

> **The same semantic object may become denser or simpler across public, workspace, paid, expert, mobile and print views, but it must never change meaning merely because the component changed shape.**

> **When data, provenance, authority, permission or methodology is insufficient, the correct component state is bounded uncertainty, omission or block — never invented certainty.**
