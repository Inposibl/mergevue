# 32. Контракт экономической экспозиции и зависимости ценности MergeVue

**Файл:** `32_MERGEVUE_ECONOMIC_EXPOSURE_AND_VALUE_DEPENDENCY_CONTRACT.md`  
**Версия:** 1.0  
**Дата:** 2026-09-16  
**Язык документа:** русский  
**Язык клиентского UI:** American English  
**Статус:** **OWNER-DIRECTED TARGET DESIGN CONTRACT CANDIDATE; НЕ ЯВЛЯЕТСЯ ПРИНЯТОЙ ЭКОНОМИЧЕСКОЙ МЕТОДОЛОГИЕЙ**  
**Аудитная база `main`:** `92c2e0df199d017082b653e72b5a6bfbf5bf6a31`  
**Связанные контракты:** `19`, `20`, `22`, `25`–`31`  
**Главный принцип:** MergeVue не переводит организационный риск напрямую в долларовый убыток. Сначала должна быть доказана экономическая зависимость конкретной части deal value от конкретного организационного предположения и механизма риска.  
**Ключевая цепочка:** `DEAL THESIS → VALUE DEPENDENCY → ORGANIZATIONAL ASSUMPTION → RISK MECHANISM → ECONOMIC CHANNEL → EXPOSURE BASIS → QUANTIFICATION GATE → CONSERVATIVE ATTRIBUTABLE EXPOSURE`

---

## 0. Решение в одном абзаце

Экономический слой MergeVue должен отвечать не на вопрос:

> «Сколько денег потеряет сделка из-за культуры?»

а на вопрос:

> «Какая часть ценностной логики сделки зависит от организационного предположения, каким наблюдаемым механизмом это предположение может нарушиться, какой экономический канал затронут и какую часть стоимости можно обоснованно считать экспонированной — без превращения экспозиции в прогноз убытка?»

Следовательно, target architecture не продолжает legacy-модель:

`ECS → valuation band → EV discount → risk envelope`.

Она заменяет её управляемой evidence chain:

```text
Deal thesis
→ Value dependency
→ Organizational assumption
→ Risk mechanism
→ Economic channel
→ Exposure basis
→ Conservative attributable exposure
```

где каждый переход требует отдельного evidence/provenance и может завершиться `Cannot determine`.

---

## 1. Граница authority

### 1.1. Порядок источников

При конфликте применяется следующий порядок:

1. текущая явная Owner-инструкция;
2. `AGENTS.md` и controlling project policies текущего `main`;
3. Owner-accepted Commercial North Star;
4. текущие принятые design contracts `19`–`31`;
5. current mechanical truth в `main`;
6. legacy economic source lineage;
7. настоящий файл как target design contract.

Этот документ не получает methodology authority только потому, что описывает target architecture.

### 1.2. Что уже зафиксировано upstream

Из действующего корпуса уже следует:

- FREE/public может объяснять, какая value-creation dependency подвергается риску;
- FREE/public не должен автоматически считать expected loss, total risk envelope, ROI или savings;
- quantified economic exposure требует paid methodology и proper deal economics;
- paid copy должна говорить: **value depends on an assumption**, а не **MergeVue predicts this amount will be lost**;
- Commercial North Star запрещает превращать directional economic exposure в unsupported valuation precision.

Эти границы сохраняются.

---

## 2. Что реально существует сейчас в `main`

Текущий код содержит два разных слоя, которые нельзя смешивать.

### 2.1. Legacy / compatibility economic engine

Есть:

- `src/data/dealEconomicsFormulaSpec.js`;
- `src/flow/dealEconomicsRiskEnvelope.js`;
- `buildDealEconomicsReport()` в `src/flow/finalReportEngine.js`.

Формула использует:

- enterprise value;
- ECS score;
- key personnel at risk;
- average annual compensation per key person.

Она производит:

- EV discount;
- earn-out exposure;
- talent cost;
- total risk envelope.

### 2.2. Прямое ECS-to-value связывание

Текущая source formula привязывает ECS band непосредственно к:

- EV discount rates;
- synergy capture ranges;
- expected key departures;
- earn-out exposure;
- protocol recommendation.

Это **не принимается настоящим контрактом как production economic methodology**.

### 2.3. Источник сам помечен как не готовый к runtime

Current metadata говорит:

```text
sourceWorkbookStatus = canonical_untracked_source
runtimeEnabled = false
publicReportCalculationAllowed = false
formulaStatus = canonical_spec_not_runtime_enabled
```

Это означает:

> физическое наличие формулы ≠ право использовать её как клиентскую экономическую истину.

### 2.4. Public layer уже подавляет hard-dollar output

Current public-report adapter:

- не должен показывать raw hard ranges;
- использует qualitative economic triage;
- маркирует вывод как directional;
- указывает, что quantified modelling требует engagement-tier economic model.

Это направление сохраняется.

---

## 3. Главный архитектурный вывод аудита

Legacy economic formula имеет слишком короткую причинную цепочку:

```text
ECS
→ EV discount / earn-out / talent loss
```

Для target MergeVue нужна более длинная цепочка:

```text
Deal thesis
→ Value dependency
→ Organizational assumption
→ Risk mechanism
→ Economic channel
→ Exposure basis
→ Attributable exposure
```

Любой missing link блокирует quantified output.

---

## 4. Existing-product-first disposition

| Текущий asset | Решение | Причина |
|---|---|---|
| `Economic Risk Translation` как report block | **KEEP** | Каноническое место экономической интерпретации уже существует |
| Public qualitative economic triage | **KEEP / ADAPT** | Совместимо с безопасной directional логикой |
| Deal-context EV input | **KEEP AS OPTIONAL ECONOMIC CONTEXT** | Может быть полезен, но не является exposure basis сам по себе |
| EV `confirmed / estimated / not_available` status | **KEEP PATTERN** | Полезная provenance/state модель |
| Compensation input | **KEEP ONLY WHEN DIRECTLY RELEVANT** | Не должен автоматически становиться loss proxy |
| Key personnel at risk input | **ADAPT / DEPRECATE AS UNIVERSAL ECONOMIC INPUT** | Headcount не доказывает exposed value |
| ECS-to-Valuation bands | **QUARANTINE / DO NOT PROMOTE** | Нет принятого causal/economic bridge |
| EV discount calculation from ECS | **DO NOT USE AS TARGET PRODUCTION METHOD** | Unsupported valuation precision |
| Earn-out exposure from ECS band | **DO NOT USE AS TARGET PRODUCTION METHOD** | Не привязан к actual earn-out thesis |
| Talent cost = headcount × compensation × 2–4 | **DO NOT USE AS UNIVERSAL LOSS MODEL** | Replacement cost ≠ deal-value exposure |
| `ABORT` / renegotiate recommendation from ECS band | **DO NOT USE** | Экономический verdict не может выводиться из ECS alone |
| Public fixed EV band `$50M-$500M` | **KEEP ONLY AS CURRENT MVP COMPATIBILITY IF STILL AUTHORIZED** | Не использовать как real deal exposure |
| Existing report/PDF renderer | **REUSE** | Новый economic model должен входить в тот же report grammar |
| New standalone economics route | **DO NOT ADD** | Нет route authority; economics belongs to Deal/report flow |

---

## 5. Что мы сознательно НЕ меняем

1. `Economic Risk Translation` остаётся частью канонического report.
2. FREE/public остаётся qualitative/directional.
3. Paid economic modelling остаётся отдельной глубиной evidence, а не автоматическим unlock всех долларов.
4. ECS остаётся organizational construct и не становится valuation variable сам по себе.
5. Economic output не даёт BUY / DON'T BUY.
6. Economic output не становится legal, accounting или valuation advice.
7. Report block congruence сохраняется между user и expert view.
8. `Decision Gap` остаётся естественным входом в deeper economics.
9. 42Q/person forecast не превращается в «стоимость человека».
10. Monitoring/re-measurement не переписывает исходную economic baseline.
11. Verification не становится calculation of saved value.
12. Никакой новый route не создаётся этим документом.

---

## 6. Основная формула продукта

Нормативная target chain:

```text
DEAL THESIS
→ VALUE DEPENDENCY
→ ORGANIZATIONAL ASSUMPTION
→ RISK MECHANISM
→ ECONOMIC CHANNEL
→ EXPOSURE BASIS
→ QUANTIFICATION STATUS
→ CONSERVATIVE ATTRIBUTABLE EXPOSURE
```

Нельзя перескакивать:

```text
ENVIRONMENT PAIR
→ DOLLAR LOSS
```

или:

```text
ECS
→ DOLLAR LOSS
```

или:

```text
LEADER RISK
→ PERSON VALUE
```

---

## 7. Deal Thesis

### 7.1. Определение

Deal Thesis — конкретная экономическая логика, ради которой сделка создаёт ценность.

Примеры классов, если подтверждены Deal evidence:

- удержание команды/capability;
- выход на новый рынок;
- customer continuity;
- product/technology continuity;
- revenue growth;
- margin improvement;
- cost synergy;
- cross-sell;
- operational consolidation;
- knowledge/IP retention;
- governance transformation.

Это примеры, не закрытый production enum.

### 7.2. Не путать с generic acquisition motive

Current `dealType` / `acquisitionMotive` может дать контекст.

Но:

`Acquire a Team`

не является достаточной economic thesis.

Нужно знать:

> что именно должно продолжать создавать value после close.

---

## 8. Value Dependency

### 8.1. Определение

Value Dependency — конкретная часть deal value, которая зависит от определённого capability, relationship, routine, role, governance structure или execution mechanism.

Пример:

```text
Deal thesis:
Preserve $40M annual enterprise-customer revenue.

Value dependency:
Retention of the target's enterprise account relationships during the first 12 months.
```

Это ещё не organizational risk.

### 8.2. Value dependency должна быть измеримой или хотя бы идентифицируемой

Допустимые состояния:

```text
IDENTIFIED_UNQUANTIFIED
QUANTIFIED_ESTIMATED
QUANTIFIED_CONFIRMED
NOT_DETERMINABLE
```

Это target semantics, не утверждение о текущем enum.

### 8.3. Enterprise Value ≠ Value Dependency

EV всей сделки не является автоматически exposed amount.

Нельзя:

```text
Deal EV = $500M
→ organizational exposure = $500M
```

без доказанной зависимости.

---

## 9. Organizational Assumption

### 9.1. Определение

Organizational Assumption — условие в организации/интеграции, которое должно оставаться истинным, чтобы Value Dependency реализовалась.

Пример:

```text
Value dependency:
Customer continuity.

Organizational assumption:
Relationship authority remains with target account leaders during the transition.
```

### 9.2. Assumption должна быть проверяемой

Не:

`Culture must stay healthy.`

Лучше:

`Target account leaders retain sufficient decision authority to resolve customer escalations during the first integration phase.`

---

## 10. Risk Mechanism

### 10.1. Определение

Risk Mechanism — доказанный или bounded mechanism, через который organizational assumption может быть нарушено.

Пример:

```text
Authority centralization
→ slower customer escalation resolution
→ key account frustration
→ renewal / retention pressure
```

### 10.2. Mechanism ≠ outcome

`Authority conflict` не означает автоматически `customer churn`.

Между ними должен быть evidence bridge.

### 10.3. Mechanism source

Механизм может происходить из:

- organizational evidence;
- resource conflict;
- structural watchpoint;
- sealed forecast;
- named-leader forecast;
- contradiction review;
- private evidence.

Но каждый source должен иметь собственную authority.

---

## 11. Economic Channel

### 11.1. Определение

Economic Channel — экономический путь, по которому нарушение assumption способно повлиять на deal value.

Возможные классы:

- revenue retention;
- revenue growth;
- customer continuity;
- cost synergy;
- operating margin;
- integration cost;
- delay / time-to-value;
- talent replacement;
- knowledge/IP continuity;
- earn-out / milestone credibility;
- governance / execution cost.

Это target taxonomy candidate; окончательный closed enum требует отдельного implementation/method act.

### 11.2. Channel нельзя выводить из Environment автоматически

Environment pair может поддерживать risk mechanism.

Но economic channel определяется Deal thesis/value dependency.

---

## 12. Exposure Basis

### 12.1. Определение

Exposure Basis — конкретная денежная или экономическая величина, с которой допустимо связать Value Dependency.

Примеры:

- revenue base;
- gross margin contribution;
- signed synergy target;
- earn-out amount;
- integration budget;
- cost base targeted for consolidation;
- confirmed replacement/recruitment cost;
- contract/customer concentration amount;
- forecasted contribution from a specific capability.

### 12.2. Required provenance

Каждый basis должен иметь:

```text
source
asOfDate
currency
amount or range
status
scope
owner / authority
method
```

### 12.3. Status

Минимальная target distinction:

```text
CONFIRMED
MANAGEMENT_ESTIMATE
MODEL_DERIVED
NOT_AVAILABLE
DISPUTED
```

Не смешивать эти states.

---

## 13. Gross Exposure

### 13.1. Определение

Gross Exposure — размер Value Dependency до attribution к конкретному organizational mechanism.

Пример:

```text
$40M annual revenue depends on enterprise-account continuity.
```

Это не значит:

```text
$40M will be lost.
```

### 13.2. Gross Exposure может быть полезна без loss estimate

Это часто уже достаточно для decision support:

> «Организационное предположение, которое мы проверяем, связано с $40M revenue base.»

---

## 14. Attributable Exposure

### 14.1. Определение

Attributable Exposure — часть Gross Exposure, для которой evidence/methodology позволяет связать exposure с конкретным organizational risk mechanism.

### 14.2. Нет attribution rule → нет attributable dollars

Если известно:

- $40M customer revenue;
- authority conflict risk;

но неизвестно, какая часть revenue действительно зависит от этого mechanism:

```text
Gross exposure: $40M
Attributable exposure: Cannot determine
```

Это правильный output.

---

## 15. Conservative Attributable Exposure

### 15.1. Target concept

`Conservative attributable exposure` — не максимальный imaginable loss.

Это наиболее ограниченная сумма/range, которую можно защищённо связать с конкретной dependency + mechanism при текущем evidence.

### 15.2. Не задавать формулу заранее

Настоящий design contract **не определяет**:

```text
attributable exposure = gross exposure × risk %
```

пока нет принятой methodology.

### 15.3. Возможные будущие подходы

Отдельный economic-method act может позже определить:

- direct bounded dependency;
- scenario-based attribution;
- contract-specific exposure;
- evidence-weighted range;
- another validated method.

До acceptance:

> quantified attributable exposure не вычисляется.

---

## 16. Exposure ≠ Expected Loss

Абсолютный инвариант:

```text
ECONOMIC EXPOSURE
≠
EXPECTED LOSS
```

Expected loss требует дополнительно как минимум:

- probability / frequency model;
- impact conditional on event;
- time horizon;
- dependency structure;
- calibration;
- uncertainty.

Если этого нет:

не вычислять.

---

## 17. Exposure ≠ Realized Loss

После close фактический loss может быть:

- меньше exposure;
- больше первоначальной bounded exposure из-за других механизмов;
- ноль;
- not determinable.

Нельзя retroactively объявлять exposure «прогнозом loss».

---

## 18. Exposure ≠ Savings

Если control был применён и outcome оказался лучше:

не говорить:

`MergeVue saved $12M.`

Без counterfactual/causal authority это недоказуемо.

---

## 19. Exposure ≠ Valuation

Экономическая экспозиция не является:

- enterprise valuation;
- purchase-price recommendation;
- DCF;
- fairness opinion;
- QofE;
- impairment estimate.

Client-safe copy:

`Economic exposure identifies value that depends on an organizational assumption. It is not a valuation or expected-loss estimate.`

---

## 20. Legacy ECS-to-Valuation Bridge

### 20.1. Статус

Current source:

`ST_ECS_to_Valuation_Bridge_v1_1.xlsx`

остаётся source lineage / compatibility artifact.

### 20.2. Не принимается этим документом

Не принимаются как production authority:

- ECS bands → EV discount;
- ECS bands → synergy capture;
- ECS bands → expected departures;
- ECS bands → earn-out exposure;
- ECS bands → `ABORT`.

### 20.3. Почему

Не установлена accepted chain:

```text
ECS
→ specific organizational assumption
→ specific economic dependency
→ empirically calibrated financial effect
```

---

## 21. Legacy talent multiplier

Current formula:

```text
keyPersonnelAtRisk
× averageAnnualCompensation
× 2–4
```

может использоваться только как legacy/source lineage до отдельного acceptance.

Нельзя называть universal replacement cost.

---

## 22. Key-person economics

### 22.1. Человек не получает dollar value

Не:

`This executive is worth $25M.`

### 22.2. Экономика привязывается к dependency

Правильно:

```text
Value dependency:
$25M of customer revenue depends on continuity of relationships concentrated in this role/team.
```

Если role/person dependency доказана.

### 22.3. Compensation ≠ Value

Salary/compensation может быть cost input.

Она не доказывает contribution/value exposure.

---

## 23. Named-leader forecast and economics

`31` может дать bounded person-level behavior forecast.

Это может поддержать Risk Mechanism.

Но оно не создаёт автоматически:

- departure probability;
- dollar loss;
- person valuation.

Chain:

```text
named-leader forecast
→ organizational mechanism
→ value dependency
→ economic exposure
```

Каждый link отдельный.

---

## 24. Deal Thesis intake

Target paid economics должен запрашивать не generic numbers first.

Правильная sequence:

```text
What value is the deal expected to create or preserve?
→ What operating dependency carries that value?
→ What organizational assumption must remain true?
→ Which part can be quantified?
```

Не:

```text
Enter EV
→ get risk dollars
```

---

## 25. Minimum economic evidence request

После economic Decision Gap продукт должен запросить **минимальный** evidence, необходимый для конкретной dependency.

Potential categories:

- deal thesis / IC memo;
- synergy model;
- revenue concentration;
- retention assumptions;
- earn-out structure;
- integration plan;
- operating model;
- critical-role dependency;
- budget/cost basis.

Не:

`Upload your entire financial model.`

---

## 26. Public / FREE boundary

Public result может показывать:

```text
Value dependency
Organizational assumption
Risk mechanism
Economic channel
What remains unquantified
What evidence would be needed
```

Не должен автоматически показывать:

- actual expected loss;
- total risk envelope;
- EV discount;
- ROI;
- savings;
- investment recommendation.

---

## 27. Public EV display

Current public MVP uses a bounded/static EV band rather than actual EV.

Этот contract не меняет current public behavior.

Но target economic methodology не должна использовать этот public display band как actual input.

---

## 28. Paid boundary

Paid economics может получить actual deal-room inputs.

Но paid status сам по себе не разрешает quantified exposure.

Нужны:

- source;
- amount;
- status;
- dependency;
- mechanism;
- attribution gate.

---

## 29. Quantification states

Target states:

```text
QUALITATIVE_ONLY
GROSS_EXPOSURE_AVAILABLE
ATTRIBUTION_NOT_ESTABLISHED
ATTRIBUTABLE_RANGE_AVAILABLE
EXPECTED_LOSS_NOT_AUTHORIZED
CANNOT_DETERMINE
```

Exact production enum requires implementation act.

---

## 30. Strong fail-closed rule

Если evidence подтверждает risk mechanism, но economics отсутствуют:

```text
Economic exposure cannot be quantified from the available evidence.
```

Не invent range.

---

## 31. Unknown is valid

Можно иметь:

```text
Mechanism: supported
Economic channel: identified
Exposure: not quantified
```

Это полезный результат.

---

## 32. Disputed economics

Если Finance и Deal Team дают разные synergy/value assumptions:

не усреднять.

State:

```text
DISPUTED_ECONOMIC_BASIS
```

и route to review.

---

## 33. Estimated vs confirmed

Estimated amount не запрещён.

Но label должен сохраняться до самого client output.

Не превращать:

`Management estimate`

в:

`Confirmed exposure`.

---

## 34. Model-derived amount

Если amount получен моделью/формулой:

показывать как model-derived.

Не смешивать с audited/confirmed figure.

---

## 35. Currency

Current runtime поддерживает USD/EUR для legacy calculation.

Target economic architecture должна хранить currency per basis.

Не добавлять FX conversion без отдельного source/method.

Если разные currencies:

- preserve source currency;
- либо use accepted FX source/date;
- иначе block aggregation.

---

## 36. Time basis

Экспозиция должна иметь time scope.

Примеры:

- annual recurring revenue;
- one-time synergy target;
- 24-month earn-out;
- first-year integration cost;
- lifetime contract value.

Нельзя складывать их без normalization authority.

---

## 37. No apples-to-oranges aggregation

Не складывать:

```text
annual revenue + 3-year synergy + one-time replacement cost
```

как один `Total Risk Envelope`.

Без time/measure normalization это недопустимо.

---

## 38. Overlap / double counting

Одна и та же value dependency может проявляться через несколько channels.

Например:

customer churn → revenue loss + margin loss.

Нельзя считать оба независимо и складывать без overlap rule.

---

## 39. Multiple mechanisms

Если два organizational mechanisms угрожают одной dependency:

не суммировать exposure дважды.

Gross value остаётся ceiling для этой dependency, если methodology не доказывает иное.

---

## 40. Portfolio of dependencies

Deal может иметь несколько independent value dependencies.

Например:

- customer continuity;
- cost synergy;
- technology roadmap;
- key-team retention.

Можно показывать их отдельно.

Total aggregation требует dependency overlap model.

---

## 41. Dependency graph

Target expert model может хранить:

```text
DealThesis
├── ValueDependency A
│   ├── OrganizationalAssumption A1
│   │   └── RiskMechanism M1
│   └── EconomicBasis E1
└── ValueDependency B
    └── ...
```

Client не обязан видеть граф.

---

## 42. Economic object model

Conceptual:

```text
EconomicExposureCase
  dealId
  reportVersion
  asOfDate

  dealThesis[]
  valueDependencies[]
  organizationalAssumptions[]
  riskMechanisms[]
  economicChannels[]
  exposureBases[]
  attributionAssessments[]
  quantificationStatus
  limitations[]
```

Не final database schema.

---

## 43. ValueDependency object

Conceptual:

```text
valueDependencyId
dealThesisId
statement
economicChannel
scope
timeHorizon
supportingEvidenceIds[]
amountBasisIds[]
status
```

---

## 44. OrganizationalAssumption object

Conceptual:

```text
assumptionId
valueDependencyId
statement
observableCondition
supportingEvidenceIds[]
contradictionIds[]
status
```

---

## 45. RiskMechanism object

Conceptual:

```text
riskMechanismId
assumptionId
statement
sourceFindingIds[]
watchpointIds[]
forecastIds[]
mechanismStatus
confidence
```

---

## 46. ExposureBasis object

Conceptual:

```text
exposureBasisId
valueDependencyId
amount
rangeLow?
rangeHigh?
currency
unit
timeBasis
status
sourceEvidenceIds[]
asOfDate
```

---

## 47. AttributionAssessment object

Conceptual:

```text
attributionId
riskMechanismId
exposureBasisId
methodVersion
status
attributableLow?
attributableHigh?
limitations[]
reviewState
```

Until accepted methodology:

```text
status = NOT_AUTHORIZED
```

---

## 48. No probability field by default

Не добавлять:

```text
riskProbability = 0.7
```

просто потому, что economics formulas часто используют probability × impact.

Только accepted calibrated probability model.

---

## 49. Scenario analysis

Future accepted method может использовать scenarios:

```text
Base
Downside
Severe
```

Но scenario assumptions должны быть explicit.

Не masquerade as probability.

---

## 50. Sensitivity analysis

Potential future tool.

Но:

- assumptions visible;
- no hidden default;
- user can see what changes amount;
- does not become prediction unless calibrated.

---

## 51. Economic evidence quality

Economic amount confidence должна зависеть от economic source quality.

Не от ECS confidence напрямую.

Separate axes:

```text
organizational mechanism confidence
economic basis quality
attribution confidence
```

---

## 52. Three-axis confidence

Не использовать один `Economic Confidence 82%`.

Показывать раздельно:

- mechanism support;
- economic basis status;
- attribution status.

---

## 53. Public language

Good:

`The deal thesis depends on preserving customer relationships held by the target team.`

Good:

`The value linked to this dependency has not been quantified from public evidence.`

Bad:

`The culture mismatch puts 20% of deal value at risk.`

---

## 54. Paid client language

Good:

`$40M of annual revenue is linked to the customer-continuity dependency. The current evidence supports an authority-friction mechanism, but it does not yet support a quantified loss estimate.`

Good:

`The economic exposure is the revenue base dependent on this assumption, not a forecast that the full amount will be lost.`

---

## 55. If attributable range is authorized later

Client-safe:

`Conservative attributable exposure: $8M–$12M`

must be accompanied by:

- basis;
- method;
- time horizon;
- limitations;
- not-expected-loss notice.

---

## 56. No fake precision

Prefer range over point when uncertainty material.

Avoid:

`$8,437,219 at risk`.

Unless source itself exact and claim genuinely exact.

---

## 57. No percentage of EV by default

Legacy band logic used percentages of EV.

Target contract forbids automatic EV-percentage exposure.

---

## 58. Earn-out

Earn-out exposure may be valid only when:

- actual earn-out exists;
- its amount/conditions known;
- organizational assumption is causally relevant to milestone achievement;
- double counting controlled.

---

## 59. Synergy

Synergy exposure requires:

- actual synergy thesis;
- amount/time basis;
- operational dependency;
- organizational assumption;
- mechanism.

Do not use ECS → generic synergy capture percentage.

---

## 60. Revenue retention

Revenue exposure requires:

- identifiable revenue base;
- customer/relationship dependency;
- scope/time;
- evidence linking organizational mechanism to continuity risk.

---

## 61. Cost synergy

Cost synergy exposure requires:

- identified cost action;
- dependency on operating routine/governance;
- risk mechanism capable of delaying/preventing capture.

Not every cultural friction affects cost synergy.

---

## 62. Integration cost

May include:

- duplicated operations;
- delayed integration;
- remediation;
- rework.

But actual cost requires evidence/model.

No arbitrary “integration drag multiplier”.

---

## 63. Talent replacement cost

Can be a cost channel.

But must use:

- actual role;
- actual compensation/source;
- accepted replacement-cost method.

No universal 2×–4× multiplier until separately accepted.

---

## 64. Knowledge/IP continuity

Value may be real but hard to quantify.

Allowed result:

`Identified, not reliably quantified.`

Do not force dollars.

---

## 65. Customer relationship concentration

May support bounded exposure where actual customer revenue is known.

But still exposure, not loss.

---

## 66. Founder dependency

Founder role may carry:

- customer trust;
- product direction;
- technical knowledge;
- key employee retention.

Economic exposure must attach to those dependencies, not founder's “personal value”.

---

## 67. Decision rights

Authority conflict can affect:

- speed;
- customer response;
- product decisions;
- synergy execution.

Economic channel depends on Deal thesis.

---

## 68. Time-to-value

Delay can have economic meaning.

Need:

- milestone value;
- delay cost or timing economics;
- accepted basis.

No generic `$ per month` without source.

---

## 69. Control economics

Control recommendation may change exposure.

But cannot claim:

`This control reduces exposure by 60%`

without accepted effect model.

---

## 70. Re-measurement economics

After intervention:

- new organizational evidence;
- updated economic basis;
- new attribution assessment.

Do not overwrite baseline.

---

## 71. Economic baseline

At release:

```text
Economic exposure assessment v1
as of T0
```

later:

```text
Economic exposure assessment v2
as of T1
```

Both retained.

---

## 72. Verification

Forecast verification and economic outcome verification are separate.

Example:

- organizational forecast confirmed;
- financial impact not determinable.

This is valid.

---

## 73. Realized financial outcome

May be recorded if authoritative:

- actual churn;
- realized synergy;
- actual replacement cost;
- actual delay cost.

Do not infer causality automatically.

---

## 74. Intervention effect

Even if realized loss is lower than exposure:

do not say control caused the difference without causal evidence.

---

## 75. Execution Evidence Pack

Per `30`, Pack may include:

- original value dependency;
- original exposure assessment;
- subsequent re-measurements;
- realized factual metric.

It must retain:

`exposure ≠ realized loss/saving`.

---

## 76. Track record

Economic track record is separate from forecast track record.

Do not compute:

`MergeVue predicted $X and saved Y%`

without accepted economic verification protocol.

---

## 77. Historical corpus

Historical deals can be used to research economic bridge offline.

But retrospective outcomes cannot silently calibrate a production model after observing outcomes.

Use predeclared research acts.

---

## 78. External empirical research

External literature can inform:

- plausible economic channels;
- methods;
- validation design.

It does not become controlling MergeVue coefficient automatically.

---

## 79. Paid methodology readiness gate

Before quantified attributable exposure is released, require:

1. accepted economic object model;
2. accepted exposure-basis taxonomy;
3. accepted attribution method;
4. overlap/double-counting rules;
5. time-basis rules;
6. currency rules;
7. evidence/provenance rules;
8. uncertainty representation;
9. report projection;
10. independent verification.

---

## 80. Calibration readiness

If method outputs probability/expected loss:

additional empirical calibration gate required.

No probability without calibration.

---

## 81. Economic source acceptance

Legacy workbook can be retained for R&D comparison.

If any coefficient is later proposed:

- exact source;
- derivation;
- empirical basis;
- population;
- time period;
- uncertainty;
- validation;
- independent audit

must be documented.

---

## 82. No coefficient laundering

Нельзя:

```text
legacy workbook percentage
→ renamed "conservative assumption"
→ production
```

without acceptance.

---

## 83. No benchmark laundering

Не брать generic consulting benchmark:

`culture destroys 30% of deal value`

и не использовать как coefficient.

---

## 84. No market-average default

If actual Deal data missing:

do not substitute generic industry average unless explicit accepted benchmark methodology.

---

## 85. User-entered assumptions

Client can provide:

- estimated synergy;
- revenue at risk;
- milestone value.

But system must label source:

`Client estimate`.

Not MergeVue fact.

---

## 86. Analyst-entered assumptions

Same.

Need rationale/source.

---

## 87. Economic contradiction

Examples:

- IC memo says $30M synergy;
- management says $50M;
- latest model says $42M.

Do not choose silently.

---

## 88. Economic review

Material contradiction routes to analyst review.

Finance evidence may need specialized reviewer in future.

No new role invented here.

---

## 89. Client cannot manually set attributable exposure as authoritative

Client may provide estimate.

Authoritative MergeVue field requires methodology/review.

---

## 90. Economic Decision Gap

If quantitative bridge missing:

```text
Decision gap:
The organizational mechanism is supported, but the monetary value dependent on the affected operating capability is not established.
```

Next evidence:

- Deal thesis;
- dependency economics;
- source documents.

---

## 91. Economic Decision Gap may remain open

Paid engagement does not guarantee closing it.

---

## 92. Report block structure

Target `Economic Risk Translation` should contain:

```text
Value dependency
Organizational assumption
Risk mechanism
Economic channel
Exposure basis
Quantification status
Current exposure statement
What this does not mean
Missing evidence / Decision Gap
```

---

## 93. Report congruence

Expert view uses same block/order but adds:

- source IDs;
- evidence status;
- contradiction;
- mapping;
- method version;
- attribution rationale;
- review controls.

No separate unrelated economist report.

---

## 94. Public view

Public can omit amount and show:

`Not quantified from public evidence.`

---

## 95. Paid view

Paid can show actual basis and status.

Still no expected loss unless separate authorization.

---

## 96. Client-facing target strings

Possible exact strings:

`Value dependency`

`Economic exposure`

`Exposure basis`

`Not quantified`

`Client estimate`

`Confirmed input`

`Attribution not established`

`Cannot determine`

`This is not an expected-loss estimate.`

`What would be needed to quantify this exposure`

Only use once backend semantics exist.

---

## 97. No `Total Risk Envelope` in target UX

Этот label должен быть removed from target paid economic design unless future accepted methodology explicitly reintroduces it.

Reason:

- encourages aggregation;
- implies completeness;
- masks overlap;
- sounds like expected loss.

---

## 98. Better target label

Preferred:

`Economic exposure`

or:

`Value at stake under this assumption`

depending on exact context.

---

## 99. No `EV Discount` output by default

Valuation discount is not organizational exposure.

Requires valuation methodology.

---

## 100. No `Synergy Capture %` output by default

Requires accepted model and empirical calibration.

---

## 101. No `Expected Key Departures` from ECS band

Requires person/retention model.

---

## 102. No `ABORT`

Economic block supports decision.

It does not make investment decision.

---

## 103. No `Renegotiate price` automatic recommendation

May surface:

`This dependency should be reflected in deal structuring discussions.`

But exact price/legal structuring advice requires separate boundary.

---

## 104. Deal structuring relevance

Economic exposure can inform questions about:

- earn-out;
- retention;
- governance;
- integration sequencing;
- conditions/controls.

But product must distinguish:

decision support ≠ legal advice.

---

## 105. Deal economics input redesign

Current inputs:

- EV;
- key personnel count;
- average compensation.

Target paid input should be dependency-led.

Potential sequence:

```text
Value-creation objective
→ dependency
→ amount / basis
→ organizational assumption
→ relevant source
```

---

## 106. Do not require EV if irrelevant

A Deal may have a specific $10M synergy dependency even if EV is unavailable.

Economic analysis can still be meaningful.

---

## 107. EV can be context

EV may help user contextualize scale.

But it is not default denominator for exposure.

---

## 108. Multiple value dependencies

UI should allow multiple economic cases within one Deal.

Do not collapse into one risk number.

---

## 109. Priority

Dependencies may be ordered by materiality if materiality basis is real.

No invented rank.

---

## 110. Materiality

Potential basis:

- amount;
- strategic importance;
- irreversibility;
- timing.

Exact method requires acceptance.

---

## 111. Missing amount

A strategically critical dependency can be high-priority even if unquantified.

---

## 112. Evidence source display

Client should see bounded provenance:

`Source: Management synergy plan · estimated`

not raw internal storage path.

---

## 113. Confidentiality

Economic evidence can be highly sensitive.

Use `24` private evidence controls and `29` data rights.

---

## 114. Respondent economics

Respondent statement:

`We expect $50M synergies`

is structured evidence, not confirmed financial fact.

---

## 115. Finance source

Prefer documentary/authorized economic source where material.

---

## 116. Public-source economics

Can use public filings for:

- transaction value;
- stated synergies;
- public earn-out terms;
- segment revenue.

Preserve source/time.

---

## 117. Post-T0 contamination

For historical/predictive assessment, later financial outcome cannot enter pre-T0 exposure basis.

---

## 118. Forecast lock

If economic exposure is part of a locked forecast:

lock exact basis/version.

No later value backfill.

---

## 119. Outcome observation

Later financial result can verify an economic hypothesis only under separate protocol.

---

## 120. No backward recalc

Do not take actual post-close loss and say:

`This is what exposure always was.`

---

## 121. Currency conversion

Future FX support requires:

- source;
- date;
- rate;
- conversion basis.

No hidden conversion.

---

## 122. Inflation / time value

Not modeled unless methodology defines.

Do not compare nominal amounts across long periods casually.

---

## 123. Tax

Out of scope unless separately modeled.

---

## 124. Accounting treatment

Out of scope.

---

## 125. Purchase accounting

Out of scope.

---

## 126. Financing structure

Out of scope unless directly part of accepted Deal economics method.

---

## 127. Legal damages

Out of scope.

---

## 128. Regulatory fines

Out of scope unless evidence/method specifically supports.

---

## 129. Economic channels are not exhaustive legal categories

Do not turn this into broad financial-risk platform.

---

## 130. UX entry point

Best entry is existing:

`Decision Gap`

or paid report/workspace economics block.

No standalone calculator landing page.

---

## 131. Deal Workspace

Potential card:

```text
Economic exposure
2 value dependencies identified
1 quantified basis
1 attribution unresolved
```

Only if machine states real.

---

## 132. No hero dollar number

Do not make:

`$125M at risk`

the main Deal Workspace KPI.

---

## 133. No red dollar badge

Risk framing should remain analytical.

---

## 134. No monetary gamification

No animated counter/savings meter.

---

## 135. Analyst surface

Analyst sees:

- Deal thesis;
- value dependency;
- source;
- assumption;
- mechanism;
- economic basis;
- contradiction;
- attribution status.

---

## 136. Practitioner / expert surface

Expert may adjudicate semantic bridge.

But cannot invent missing economic facts.

---

## 137. Economics specialist future

Could exist later.

Not required by this contract.

---

## 138. Release gate

Quantified economic output requires:

```text
DEPENDENCY_SUPPORTED
AND
ECONOMIC_BASIS_VALID
AND
MECHANISM_SUPPORTED
AND
ATTRIBUTION_METHOD_ACCEPTED
AND
OVERLAP_CHECK_PASS
AND
REVIEW_PASS
→ RELEASE_ELIGIBLE
```

---

## 139. Qualitative release gate

Qualitative exposure can release with:

```text
VALUE_DEPENDENCY_IDENTIFIED
AND
ORGANIZATIONAL_ASSUMPTION_SUPPORTED
AND
RISK_MECHANISM_SUPPORTED
```

even if dollars unavailable.

---

## 140. Block-level fail closed

One unquantified dependency does not block entire report.

Its economic block says `Not quantified`.

---

## 141. Report versioning

Economic assessment belongs to report version.

No mutable detached spreadsheet truth.

---

## 142. Method versioning

Every quantified attribution requires methodVersion.

---

## 143. Economic source versioning

Synergy plan / IC memo can change.

Store source version/as-of.

---

## 144. Reproducibility

Given same:

- Deal evidence;
- economics sources;
- method version;
- review decisions;

system should reproduce same economic assessment.

---

## 145. LLM role

LLM may:

- summarize economic dependency;
- rewrite client-safe narrative.

LLM may not:

- invent amount;
- choose coefficient;
- create attribution percentage;
- calculate unapproved expected loss;
- decide financial materiality from prose alone.

---

## 146. Deterministic calculations

Accepted arithmetic should be deterministic outside LLM.

---

## 147. Narrative validator

Must catch:

- `$X will be lost`;
- `MergeVue will save`;
- unsupported valuation;
- unsupported probability;
- causal certainty;
- raw internal formulas;
- source-status loss.

---

## 148. Economic range validator

Any range requires:

- low basis;
- high basis;
- reason;
- source/method.

No arbitrary ±20%.

---

## 149. Unit validator

Prevent:

- thousands vs millions;
- annual vs total;
- USD vs EUR;
- revenue vs EBITDA.

---

## 150. Double-count validator

Required before any aggregate total.

---

## 151. Aggregate total default

**OFF.**

Do not compute portfolio `Total Exposure` until overlap methodology accepted.

---

## 152. If future total becomes allowed

Must document:

- independent components;
- overlap;
- time normalization;
- currency;
- aggregation method.

---

## 153. Legacy compatibility

Legacy engine may remain in repository for:

- regression;
- historical source comparison;
- old fixture parity.

But target client path must not accidentally call it.

---

## 154. Feature flag / isolation

Implementation should isolate legacy hard-dollar engine from new target economic projection.

Exact technical mechanism decided later.

---

## 155. Public adapter protection

Existing public hard-range suppression stays until replaced by equal/stronger validation.

---

## 156. No direct `buildDealEconomicsReport()` → paid report promotion

That function reflects legacy formula assumptions.

Do not reuse simply because it is already coded.

---

## 157. Possible reuse from legacy code

Safe reusable parts may include:

- currency validation;
- numeric normalization;
- confirmed/estimated status pattern;
- formatting helpers.

Not:

- ECS bands;
- rates;
- total envelope logic.

---

## 158. Current input-state reuse

`confirmed / estimated / not_available` is a useful provenance pattern.

Target may extend with:

`disputed / model_derived`

after schema authority.

---

## 159. Public current compatibility

Do not break current public Forecast Brief while target economics is not implemented.

---

## 160. Migration strategy

Recommended:

```text
Phase 0 — freeze legacy behavior
Phase 1 — add dependency/economic object model
Phase 2 — qualitative paid projection
Phase 3 — source/provenance intake
Phase 4 — attribution methodology
Phase 5 — quantified release
Phase 6 — re-measurement
Phase 7 — outcome research/calibration
```

---

## 161. Phase 0 — audit freeze

Before code change:

- hash current economic files;
- enumerate callers;
- enumerate report outputs;
- identify public suppression validators;
- preserve legacy tests.

---

## 162. Phase 1 — economic evidence model

Add structured objects for:

- thesis;
- dependency;
- assumption;
- mechanism;
- basis.

No quantified attribution yet.

---

## 163. Phase 2 — qualitative paid projection

Release value-dependency chain without dollars where unsupported.

---

## 164. Phase 3 — evidence intake

Collect actual economic evidence per Decision Gap.

No broad data-room requirement.

---

## 165. Phase 4 — attribution methodology

Separate methodology act.

Must include:

- permitted channels;
- attribution rule;
- uncertainty;
- overlap;
- time;
- currency;
- edge cases.

---

## 166. Phase 5 — quantified release

Only after IV + Owner acceptance.

---

## 167. Phase 6 — longitudinal economics

Integrate with `28`.

No baseline overwrite.

---

## 168. Phase 7 — empirical validation

Compare pre-outcome economic hypotheses with later observed outcomes.

Do not retro-tune production live.

---

## 169. Уровень доверия

### 169.1. Current economic source inventory

**Высокое доверие** к факту, что current `main` physically contains:

- legacy ECS-to-valuation formula;
- deal economics input fields;
- final report economic block;
- public suppression/qualitative adapter logic.

### 169.2. Current legacy formula as financial methodology

**Низкое / не принято для target production.**

Причины:

- source marked untracked/non-runtime;
- direct ECS-to-financial mapping;
- no accepted dependency chain;
- no accepted calibration;
- no accepted overlap/time normalization.

### 169.3. Qualitative value-dependency model

**Высокая продуктовая пригодность как target design**, потому что она сохраняет доказательную цепочку и не требует unsupported dollar precision.

### 169.4. Quantified attributable exposure

**Не авторизовано до отдельной methodology acceptance.**

### 169.5. Expected loss / probability

**Не авторизовано.**

### 169.6. Current user trust requirement

Пользователь должен видеть:

- что именно считается exposed;
- почему;
- от какого assumption;
- какой source поддерживает amount;
- что output не означает.

---

## 170. Минимальная first-version paid economic surface

```text
Economic exposure

Value dependency
[statement]

Organizational assumption
[statement]

Risk mechanism
[statement]

Economic channel
[channel]

Exposure basis
[amount/range/status or Not quantified]

Attribution
[Not established / Cannot determine / authorized range]

What this means
...

What this does not mean
This is not an expected-loss estimate.

Evidence needed next
...
```

---

## 171. Mobile

Order:

1. Value dependency
2. Assumption
3. Mechanism
4. Exposure basis
5. Quantification status
6. Limitation
7. Next evidence

No dense finance table first.

---

## 172. Desktop

Can use:

- main chain left;
- evidence/status right;
- optional scenario details below.

No dashboard sprawl.

---

## 173. Accessibility

Target WCAG 2.2 AA.

Need:

- amounts with currency/unit in text;
- status not color-only;
- tables with headers;
- chain readable linearly;
- no tooltip-only assumptions;
- clear distinction estimated/confirmed.

---

## 174. Analytics

Allowed workflow events:

```text
economic_dependency_identified
economic_basis_added
economic_basis_confirmed
economic_attribution_blocked
economic_assessment_released
economic_assessment_updated
```

Do not send:

- confidential dollar amounts;
- raw financial documents;
- client identity

to generic marketing analytics.

---

## 175. Security / privacy

Economic evidence often belongs to sensitive deal-room data.

Reuse:

- private evidence controls;
- Deal access;
- data-rights restrictions;
- audit trails.

No public leakage.

---

## 176. Sharing

Economic exposure follows report/share permissions.

No standalone public share link.

---

## 177. Execution Evidence Pack disclosure

Only client-authorized economic history.

No raw underlying model unless disclosure permits.

---

## 178. No benchmark before rights/method

Do not show:

`Deals like yours lose 18%`.

Until real cohort/method/data rights.

---

## 179. External benchmark future

If accepted:

clearly separate:

`Your Deal evidence`

from:

`External benchmark`.

---

## 180. Economic calibration

Potential future calibration should evaluate:

- attribution quality;
- forecasted exposure vs realized outcome;
- interval coverage;
- bias;
- calibration by channel.

But no metric is accepted here.

---

## 181. Claim classes

Target internal claim classes:

```text
DEPENDENCY_FACT
ASSUMPTION_CLAIM
MECHANISM_CLAIM
ECONOMIC_BASIS_FACT
ATTRIBUTION_CLAIM
OUTCOME_FACT
```

Exact enum later.

---

## 182. Each claim needs provenance

No mixed paragraph where source status disappears.

---

## 183. Economic narrative

Client prose must preserve claim class distinctions even if not showing internal enum.

---

## 184. Source-of-number rule

Every displayed client dollar must answer:

> Where did this number come from?

Possible answer:

- public filing;
- client document;
- confirmed client input;
- accepted calculation.

If not:

do not show.

---

## 185. Source-of-attribution rule

Every attributable dollar must answer:

> Why is this portion linked to this organizational mechanism?

If not:

do not show attributable range.

---

## 186. Source-of-probability rule

Every probability must answer:

> Which calibrated model and population support this probability?

If not:

do not show.

---

## 187. Source-of-savings rule

Every savings claim must answer:

> Which counterfactual supports avoided loss?

If not:

do not show.

---

## 188. Strong claim hierarchy

From weakest to strongest:

```text
Economic channel identified
→ Gross exposure basis known
→ Attribution supported
→ Expected loss model calibrated
→ Realized loss observed
→ Causal intervention effect established
```

Never jump levels.

---

## 189. Current target ceiling

Until future methodology:

target product ceiling is:

```text
Economic channel identified
+ Gross exposure basis known where available
+ Attribution state explicit
```

not expected loss.

---

## 190. Decision support value before quantification

MergeVue can already improve decision quality by showing:

- which value assumption is exposed;
- what evidence would invalidate it;
- what control protects it;
- where dollars should be investigated.

This is valuable even without a hard number.

---

## 191. No pressure to monetize uncertainty

Do not invent dollar figures merely because paid clients expect numbers.

---

## 192. If client insists on a number

System can state:

`The available evidence does not support a defensible quantified exposure.`

Then identify missing evidence.

---

## 193. Economic expert adjudication

Owner/expert can decide semantic bridge during bootstrap.

But cannot supply missing finance data from intuition.

---

## 194. Expert exit

Long-term target is reproducible evidence-to-economic mapping where expert only handles irreducible judgment.

No permanent opaque analyst formula.

---

## 195. Acceptance criteria

Economic Exposure contract passes only if:

1. Economic layer begins with Deal thesis.
2. Value Dependency is explicit.
3. Organizational Assumption is explicit.
4. Risk Mechanism is explicit.
5. Economic Channel is explicit.
6. Exposure Basis is explicit before dollars.
7. Enterprise Value is not automatically exposure.
8. ECS is not automatically valuation input.
9. ECS-to-EV discount legacy bands are not production authority.
10. Legacy synergy-capture percentages are not production authority.
11. Legacy key-departure estimates are not production authority.
12. Legacy talent 2×–4× multiplier is not universal production authority.
13. Legacy `ABORT` recommendation is not used.
14. `Total Risk Envelope` is not target output by default.
15. Gross Exposure is distinct from Attributable Exposure.
16. Attributable Exposure is distinct from Expected Loss.
17. Expected Loss is distinct from Realized Loss.
18. Exposure is distinct from Savings.
19. Exposure is distinct from Valuation.
20. Person compensation is not person value.
21. Named-leader forecast does not create dollar exposure automatically.
22. FREE/public remains qualitative.
23. FREE does not calculate loss/ROI/savings.
24. Paid status does not itself authorize quantified output.
25. Actual economic source status remains visible.
26. Estimated is not presented as confirmed.
27. Disputed sources are not averaged silently.
28. Model-derived amounts are labeled.
29. Currency is explicit.
30. Time basis is explicit.
31. Different time bases are not summed without method.
32. Different currencies are not silently summed.
33. Revenue and EBITDA are not mixed.
34. Overlap/double counting is controlled.
35. Multiple mechanisms do not duplicate one value dependency.
36. Aggregate total is disabled until overlap rules exist.
37. Scenario is not mislabeled probability.
38. No probability without calibration.
39. No arbitrary ± range.
40. No market-average default without accepted benchmark.
41. User/client estimate is preserved as such.
42. Analyst estimate is preserved as such.
43. Every dollar has source provenance.
44. Every attribution has methodology provenance.
45. Every probability has calibration provenance.
46. Every savings claim requires counterfactual authority.
47. Economic Decision Gap is allowed to remain open.
48. `Cannot determine` is allowed.
49. Block-level fail closed is preserved.
50. Report congruence is preserved.
51. Expert view adds detail without parallel truth.
52. Economic baseline is versioned.
53. Re-measurement creates a new version.
54. Baseline is never overwritten.
55. Post-T0 outcomes do not contaminate pre-T0 basis.
56. Forecast lock binds exact economics if included.
57. Outcome verification remains separate.
58. Causal intervention effect is not inferred from before/after.
59. Execution Evidence Pack preserves exposure ≠ loss.
60. No public benchmark without Stage I/data-rights readiness.
61. No new economics route is created.
62. Existing report/PDF renderer is reused where appropriate.
63. Legacy engine can remain for lineage/regression but is isolated from target production output.
64. Current public hard-range suppression remains until equal/stronger guard exists.
65. LLM cannot invent amounts.
66. LLM cannot choose coefficients.
67. LLM cannot create probability.
68. Arithmetic is deterministic.
69. Range/unit/double-count validators exist before quantified release.
70. Quantified attribution requires accepted methodology.
71. Methodology requires independent verification.
72. Owner acceptance is separate from implementation.
73. Economic source versions are retained.
74. Deal thesis source is retained.
75. Public-source economics preserve date/source.
76. Private economics use Deal/data-rights controls.
77. Generic analytics do not receive sensitive amounts.
78. WCAG 2.2 AA target is maintained.
79. Mobile preserves claim hierarchy.
80. No hero `$ at risk` KPI.
81. No red/green financial verdict.
82. No BUY/DON'T BUY.
83. No legal advice.
84. No valuation advice.
85. No accounting assurance.
86. No guaranteed savings.
87. No exact causal dollar claim without causal authority.
88. No person dollar valuation.
89. No generic culture-loss percentage.
90. No coefficient laundering from legacy workbook.
91. No benchmark laundering.
92. No silent current-main formula promotion.
93. Current mechanical truth is documented accurately.
94. `runtimeEnabled: false` / non-public legacy status is respected until superseded.
95. Target input becomes dependency-led rather than EV-led.
96. Minimal evidence collection follows Decision Gap.
97. Unknown/unquantified output remains useful.
98. Every released economic claim can be traced back through the full chain.
99. LIVE audit occurs before implementation because this act audits `main`, not deployed UI.
100. Any stronger economic claim requires a separate accepted methodology act.

---

## 196. Что должен сделать следующий methodology act

Этот design contract intentionally не принимает формулу.

Следующий economic-method act должен решить минимум:

```text
1. Closed economic channel taxonomy
2. Economic basis admissibility
3. Attribution method
4. Range construction
5. Overlap / double-count rules
6. Time normalization
7. Currency / FX policy
8. Treatment of management estimates
9. Treatment of model-derived inputs
10. Confidence / uncertainty representation
11. Economic outcome verification
12. Calibration / empirical validation plan
```

Только после этого quantified attributable exposure может стать release-eligible.

---

## 197. Что может быть реализовано до формулы

До acceptance quantified methodology можно безопасно реализовать:

- Deal thesis capture;
- Value Dependency capture;
- Organizational Assumption linkage;
- Risk Mechanism linkage;
- Economic Channel identification;
- Economic Basis provenance;
- qualitative Economic Risk Translation;
- `Not quantified`;
- Economic Decision Gap;
- evidence requests.

Это уже улучшает продукт без ложной точности.

---

## 198. Что нельзя реализовывать до формулы

Нельзя ship:

- ECS-based dollar risk;
- automatic EV discount;
- automatic synergy loss;
- automatic earn-out exposure;
- expected-loss probability;
- total exposure aggregation;
- savings;
- ROI of MergeVue;
- leader dollar value.

---

## 199. Финальная формула

> **MergeVue does not monetize organizational risk by multiplying a score by enterprise value. It identifies the part of the deal thesis that depends on an organizational assumption, tests the mechanism that could break that assumption, and only then asks what economic value is actually exposed.**

> **Economic exposure is the value dependent on an assumption. It is not a prediction that this value will be lost.**

> **A dollar figure is release-eligible only when its source, time basis, dependency, mechanism, attribution method and uncertainty are all explicit. Otherwise the correct result is qualitative exposure or `Cannot determine`.**

> **The strongest economic product is not the one that produces the largest number. It is the one that can explain, audit and defend every step from deal thesis to exposed value without pretending that exposure is loss, valuation or savings.**
