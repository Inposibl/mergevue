# 33. Контракт платного объёма, цены и коммерческого перехода MergeVue

**Файл:** `33_MERGEVUE_PAID_SCOPE_PRICING_AND_COMMERCIAL_TRANSITION_CONTRACT.md`  
**Версия:** 1.1 — adjudication 18 commercial decisions  
**Дата:** 2026-09-16  
**Язык документа:** русский  
**Язык клиентского интерфейса:** только American English  
**Рынок первой версии:** США  
**Статус:** **OWNER-ACCEPTED / CONTROLLING COMMERCIAL DESIGN CONTRACT; НЕ ЯВЛЯЕТСЯ ЮРИДИЧЕСКИМ ИЛИ НАЛОГОВЫМ ЗАКЛЮЧЕНИЕМ**  
**Owner acceptance:** **2026-09-16**  
**Аудитная база `main`:** `92c2e0df199d017082b653e72b5a6bfbf5bf6a31`  
**Superseded commercial baseline:** legacy `$90K–$200K` / `213%` offer remains implementation history only and is not target commercial authority  
**Связанные документы:** `07`, `19`, `20`, `21`–`25`, `31`, `32`  
**Главный принцип:** клиент выбирает не «тариф с большим числом функций», а достаточный объём доказательной проверки конкретного нерешённого вопроса сделки. Цена появляется только после объяснения Decision Gap, необходимой глубины доказательств и результата, который этот объём способен поддержать.  
**Ключевые инварианты:** `DECISION GAP BEFORE PRICE`, `SCOPE BEFORE PAYMENT`, `PRICE ≠ CERTAINTY`, `PAID ≠ GUARANTEED ANSWER`, `CHEAPEST SUFFICIENT SCOPE MUST REMAIN VISIBLE`, `NO FEATURE-TIER THEATER`, `NO LEGACY $90K–$200K PROPAGATION`, `NO 213% COST ANCHOR`, `NO CHECKOUT WITHOUT REAL PAYMENT AUTHORITY`, `PAYMENT ≠ DATA ACCESS`, `COMMERCIAL STATE ≠ ANALYTICAL STATE`

---

## 0. Назначение

Этот документ определяет коммерческий переход:

```text
Public / saved Deal result
→ Decision Gap
→ Evidence need
→ Scope qualification
→ Recommended sufficient depth
→ Price
→ Commercial action
→ Engagement activation
→ Evidence collection
```

Он отвечает на вопросы:

- когда платный анализ действительно нужен;
- какой объём достаточен;
- почему один объём дороже другого;
- где и когда показывать цену;
- когда консультация нужна, а когда нет;
- что делать при отсутствии self-serve payment;
- как разделить commercial approval, payment, analytical access и evidence rights;
- как не превратить MergeVue в обычную SaaS pricing grid.

---

## 1. Чего этот документ не делает

Он не устанавливает:

- юридические условия договора;
- refund policy;
- налоговую политику;
- payment processor;
- invoice workflow;
- SLA;
- срок выполнения;
- скидки;
- объём документов в штуках;
- количество респондентов в пакетах;
- количество 42Q;
- автоматическую цену как процент от exposure;
- маршрут checkout;
- entitlement schema.

Эти параметры требуют отдельной authority.

---

## 2. Current implementation reality

### 2.1. Реальные существующие commercial routes

В current `main` существуют:

```text
/screen-11-paid-offer
/screen-11b-homogeneous-offer
/screen-12-consultation-request
/screen-12-email-capture
```

`screen-11` и `screen-11b` — текущие offer surfaces.

### 2.2. Legacy paid offer

Current validation ожидает:

```text
$90K–$200K
```

и legacy cost anchor:

```text
213%
```

а primary CTA ведёт на:

`Book a 30-minute scoping call`.

Это implementation truth старой коммерческой архитектуры.

### 2.3. Current consultation

Current consultation flow содержит:

- Name;
- Role;
- Deal context;
- Scheduling.

После валидации создаётся consultation request и email record.

### 2.4. Current monetization gap

В проверенном current commercial surface нет:

- Stripe;
- card checkout;
- self-serve payment;
- invoice generation flow;
- commercial proposal generation;
- procurement workflow.

Следовательно:

> **никакой новый design не имеет права изображать существующий checkout, если backend/payment authority не появилось.**

---

## 3. Existing-product-first disposition

| Текущий элемент | Решение | Основание |
|---|---|---|
| `/screen-11-paid-offer` | **KEEP / ADAPT** | Existing commercial route; не создавать replacement route без решения |
| `/screen-11b-homogeneous-offer` | **KEEP / ADAPT** | Existing variant; не ломать routing |
| `/screen-12-consultation-request` | **KEEP / ADAPT** | Реальный human-commercial path |
| `/screen-12-email-capture` | **KEEP FOR REPORT DELIVERY / SAVE PURPOSES** | Не превращать в обязательный sales gate |
| Free vs Paid comparison concept | **ADAPT** | Полезен, если показывает evidence depth, а не feature count |
| `$90K–$200K` | **REMOVE FROM TARGET COMMERCIAL COPY** | Legacy implementation price, не target pricing authority |
| `213%` cost anchor | **REMOVE** | Не поддерживать fear/ROI anchoring |
| Forced consultation after every paid click | **REMOVE AS UNIVERSAL RULE** | Не каждый paid scope требует call |
| Existing consultation fields | **KEEP MINIMAL** | Не превращать в CRM intake без причины |
| New Stripe/checkout route | **DO NOT ADD** | Нет implementation/payment authority |
| Public report baseline | **KEEP** | Не исчезает после commercial transition |
| Decision Gap | **KEEP AS PRIMARY DRIVER** | Коммерческий переход начинается с аналитической неопределённости |

---

## 4. Целевая рабочая лестница

По коммерческой архитектуре корпуса:

| Объём | Цена |
|---|---:|
| Публичный анализ | **$0** |
| Проверка закрытыми доказательствами | **$5,000** |
| Экономическая привязка | **$10,000** |
| Многоконтурная проверка | **$15,000** |
| Решение уровня инвестиционного комитета | **$30,000** |

Это **рабочая target architecture**, а не договорная квота.

### 4.1. Единица коммерческого объёма

Стандартный scope определяется **решением и доказательной задачей**, а не штуками input/output:

- **$5,000:** один bounded material `Decision Gap`, который можно проверить закрытыми доказательствами без построения отдельной экономической цепочки;
- **$10,000:** один material `Decision Gap` + одна связанная `Deal Thesis → Value Dependency → Organizational Assumption → Risk Mechanism → Economic Exposure` chain;
- **$15,000:** один Deal-level decision question, требующий нескольких взаимосвязанных dependencies/evidence paths;
- **$30,000:** один investment-committee-level Deal decision с тем количеством material dependencies, которое необходимо для профессионально достаточного вывода в пределах принятого engagement scope.

Документы, organizational respondents, страницы и analyst-hours **не являются commercial quantity units**.

Если новый evidence открывает **новый decision question или новую независимую Deal dependency**, это является основанием для re-scope, а не для искусственного «лимита файлов».

### 4.2. Respondents и documents

Стандартные уровни не продаются как:

`up to N respondents`

или:

`up to N documents`.

Нормативно:

- запрашивается минимальный evidence set, необходимый для included Decision Gap;
- число респондентов определяется canonical routing / evidence need;
- document-processing safety limits являются внутренними engineering constraints;
- технический hard cap может блокировать oversized upload или требовать staged ingestion, но сам по себе не создаёт коммерческий upgrade;
- customer-facing operational limits могут появиться только когда engineering capacity измерена и принята отдельным implementation act.

### 4.3. Named leaders не входят в базовые уровни автоматически

Во всех стандартных scope:

> **included named-leader modules = 0.**

Named-leader analysis является отдельным gated module по `31`.

Target commercial price после закрытия всех release gates `31`:

> **$5,000 за одного named-leader module.**

До закрытия gates `31` этот module:

- может отображаться как unavailable / not yet eligible;
- не может быть куплен;
- не может быть обещан как включённый deliverable;
- не может использовать цену как обход methodology/privacy/calibration gate.

---

## 5. Почему это не тарифы SaaS

Неправильно:

```text
Free
Basic
Pro
Enterprise
```

и список галочек.

Правильно:

```text
What decision remains unsupported?
→ What evidence is needed?
→ What depth is sufficient?
→ What result can that depth support?
→ What does that scope cost?
```

Цена объясняется задачей.

---

## 6. Основная коммерческая формула

```text
DECISION GAP
→ MATERIALITY
→ EVIDENCE GAP
→ ECONOMIC / DEAL DEPENDENCY
→ ANALYTICAL COMPLEXITY
→ REQUIRED ASSURANCE
→ SUFFICIENT SCOPE
→ PRICE
```

Не:

```text
DEAL SIZE
→ PRICE
```

Не:

```text
NUMBER OF FEATURES
→ PRICE
```

Не:

```text
NUMBER OF FILES
→ PRICE
```

---

## 7. Scope qualification

Перед рекомендацией объёма система должна определить пять факторов.

### 7.1. Материальность

Может ли нерешённый вопрос изменить:

- deal thesis;
- integration design;
- governance;
- retention strategy;
- diligence conclusion;
- investment-committee discussion.

### 7.2. Экономическая зависимость

Есть ли value dependency из `32`.

### 7.3. Сложность механизма

Один bounded mechanism или несколько связанных dependencies.

### 7.4. Доказательная глубина

Нужны ли:

- internal observations;
- private documents;
- multiple respondents;
- individual data;
- contradiction adjudication;
- analyst review;
- economic basis.

### 7.5. Уровень решения

Какой decision пользователь собирается принимать.

---

## 8. Scope recommendation

Результат квалификации может быть:

```text
STAY_FREE
PRIVATE_EVIDENCE_CHECK
ECONOMIC_LINKAGE
MULTI_DEPENDENCY_REVIEW
INVESTMENT_COMMITTEE_SCOPE
INDIVIDUAL_MODULE_REQUIRED
MORE_INFORMATION_REQUIRED
PAID_ANALYSIS_NOT_JUSTIFIED
```

Это target semantics, не утверждение о существующем enum.

---

## 9. Scope recommendation ≠ sales recommendation

`Recommended scope` означает:

> минимальный объём анализа, который способен поддержать requested decision.

Не:

> самый выгодный для MergeVue пакет.

---

## 10. Самый дешёвый достаточный объём

Если $5,000 достаточно:

не рекомендовать $10,000 ради upsell.

Если $10,000 достаточно:

не продавать $30,000 как «более уверенный».

Это trust invariant.

---

## 11. Платный анализ пока не нужен

Система обязана уметь показать:

`Paid analysis is not justified yet.`

Причины могут включать:

- gap не материален;
- вопрос разрешим public/internal evidence;
- decision уже необратим;
- нужные evidence недоступны;
- request выходит за methodology;
- пользователь просит certainty, которую продукт не способен дать.

---

## 12. Цена не покупает certainty

Абсолютный инвариант:

```text
higher price
≠
higher certainty by entitlement
```

Более дорогой scope может:

- собирать более сильные evidence;
- проверять больше зависимостей;
- применять более строгий review;
- поддерживать более ответственное решение.

Но результат всё равно может быть:

`Cannot determine`.

---

## 13. Цена не меняет evidence truth

Нельзя:

```text
$5k → low confidence
$30k → high confidence
```

по коммерческому уровню.

Confidence формируется evidence/methodology.

---

## 14. Цена не отменяет fail-closed

Если paid evidence недостаточно:

output остаётся withheld / cannot determine.

---

## 15. Уровень $0

### 15.1. Главный вопрос

`What can public evidence already tell us?`

### 15.2. Цель

Дать реальную полезность до payment/trust escalation.

### 15.3. Не урезать искусственно

Нельзя скрывать существующий public conclusion, чтобы создать paywall.

---

## 16. Registered FREE workspace

Сохранение Deal, организационные observations и допустимый бесплатный workflow не образуют новый paid tier сами по себе.

Account = persistence/access.

Price = analytical scope.

---

## 17. Уровень $5,000

### 17.1. Главный вопрос

`Does private evidence support or challenge the public hypothesis?`

### 17.2. Основная ценность

Проверить один bounded material question закрытыми evidence.

### 17.3. Может включать

- private evidence;
- evidence qualification;
- contradiction surfacing;
- update to existing hypothesis;
- bounded paid report.

### 17.4. Не обещает

- широкую экономическую модель;
- несколько зависимостей;
- IC-ready material;
- named-leader forecast автоматически.

---

## 18. Уровень $10,000

### 18.1. Главный вопрос

`What part of the deal's value logic depends on this organizational assumption?`

### 18.2. Основная ценность

Связать organizational finding с value dependency и economic exposure logic из `32`.

### 18.3. Не означает

автоматический hard-dollar loss estimate.

---

## 19. Уровень $15,000

### 19.1. Главный вопрос

`Which connected organizational dependencies could affect the deal thesis?`

### 19.2. Основная ценность

Несколько materially connected dependencies, evidence sources и forecast lines.

### 19.3. Не означает

«больше страниц».

---

## 20. Уровень $30,000

### 20.1. Главный вопрос

`What material organizational risk should be considered at investment-committee level, and how can it be tested or protected?`

### 20.2. Основная ценность

Decision-ready organizational risk material.

### 20.3. Требования качества

Может потребовать:

- multiple evidence channels;
- conflict resolution;
- economic linkage;
- controlled forecasts;
- independent machine verification;
- human exception handling;
- IC-facing projection.

### 20.4. Не является

- гарантией инвестиционного результата;
- recommendation to buy/sell;
- valuation opinion.

---

## 21. 42Q и named-leader module

`31` контролирует methodology/product boundary.

Коммерчески:

- 42Q не является «feature of Premium»;
- named-leader analysis появляется только при specific person-level decision need;
- цена базового scope не отменяет individual-data gate;
- exact inclusion/extra price для leader module остаётся отдельным commercial decision.

---

## 22. Нельзя писать `42Q included`

Пока exact commercial packaging не принято.

---

## 23. Economic Exposure и price qualification

`32` может влиять на scope recommendation.

Но price не рассчитывается:

```text
price = exposure × 1%
```

или другой формулой.

---

## 24. Exposure threshold is qualification aid, not price engine

Рабочие ориентиры из `07`:

```text
$5k  → exposure around $500k+
$10k → exposure around $1M+
$15k → exposure around $1.5M+
$30k → exposure around $3M+
```

не являются hard automatic gates.

Они помогают проверить commercial reasonableness.

---

## 25. Large Deal ≠ high tier

$5B Deal может иметь один узкий evidence question.

Тогда достаточным может быть $5k.

---

## 26. Small Deal ≠ low tier

$30M Deal может иметь критическую dependency, требующую multi-dependency or IC-level analysis.

---

## 27. Страница scope selection

Основная структура:

```text
Deal context

Decision gap
What remains unresolved

Why it matters
Connection to deal thesis / value dependency

Evidence needed
What would resolve it

Recommended scope
Why this depth is sufficient

What we will do
...

What you will receive
...

What is not included
...

Price
...

Sufficient lower-cost alternative
[when applicable]

Commercial next step
...
```

---

## 28. Не показывать весь каталог сразу

После public result не нужно автоматически показывать все:

```text
$5k / $10k / $15k / $30k
```

Сначала gap.

---

## 29. Когда показывать полную лестницу

Допустимо на отдельной public product/pricing explanation page, если такая page позже будет авторизована.

Но текущий `screen-11` не обязан превращаться в catalogue.

---

## 30. Current `screen-11` target adaptation

`screen-11` должен постепенно стать:

> scope qualification / deeper diligence detail

а не legacy sales page.

---

## 31. Route preservation

До отдельного route act:

```text
/screen-11-paid-offer
/screen-11b-homogeneous-offer
```

сохраняются.

Этот документ **не создаёт**:

```text
/pricing
/checkout
/buy
/enterprise
```

---

## 32. Homogeneous offer

Отдельная route может сохранить contextual copy.

Но commercial qualification logic должна быть той же:

```text
gap → evidence → scope → price
```

Не отдельная коммерческая модель.

---

## 33. Comparison block

Legacy `Free output` / `Paid adds` можно адаптировать.

Предпочтительно:

```text
What public evidence established

What remains unresolved

What deeper evidence can test

Recommended scope
```

---

## 34. Не feature comparison grid

Не:

| Feature | Free | 5k | 10k | 15k | 30k |

как primary interaction.

---

## 35. Если нужна comparison table

Только по purpose:

| Объём | Какой вопрос решает |
|---|---|
| $5k | один bounded private-evidence question |
| $10k | economic linkage |
| $15k | multiple dependencies |
| $30k | IC-level decision support |

---

## 36. Scope explanation before price

Цена появляется ниже:

- unresolved decision;
- materiality;
- evidence need;
- result.

---

## 37. Коммерческая рекомендация

Potential client copy:

`Recommended analysis scope`

`This scope is sufficient because the current decision gap requires private evidence from one bounded area, not a multi-dependency review.`

---

## 38. Lower-cost alternative

Если существует:

`A smaller scope may be sufficient if you only need to resolve the document-based authority question.`

---

## 39. No fake decoy

Нельзя создавать специально слабый $5k или бессмысленный $30k для anchoring.

---

## 40. No `Most popular`

Запрещено.

---

## 41. No crossed-out prices

Запрещено без реальной promotion authority.

---

## 42. No countdown

Запрещено.

---

## 43. No false scarcity

Не:

`Only 2 diligence slots left`

без реальной capacity authority.

---

## 44. No fear anchor

Убрать:

`213% of annual salary`

как commercial pressure anchor.

---

## 45. No `cost of doing nothing`

Без Deal-specific economic authority.

---

## 46. No ROI claim

Не:

`10x ROI`

`Pay $10k to protect $1M`

если causal/economic basis отсутствует.

---

## 47. No guaranteed savings

Абсолютно.

---

## 48. Public value persists

После открытия paid scope:

- public report остаётся доступным;
- user может вернуться;
- paid screen не заменяет report.

---

## 49. Back action

Client UI:

`Back to analysis`

или equivalent.

Не прятать.

---

## 50. Save action

Saving a Deal не должен зависеть от purchase, если `21` позволяет account persistence.

---

## 51. Commercial next-step classes

Target:

```text
CONTINUE_FREE
REQUEST_SCOPE
REQUEST_PROPOSAL
REQUEST_CONSULTATION
PAYMENT_PENDING
PAYMENT_NOT_IMPLEMENTED
ENGAGEMENT_CONFIRMED
```

Exact enums later.

---

## 52. Current real next step

В current implementation реальный monetization handoff:

```text
Paid offer
→ consultation request
→ email
```

Поэтому до появления другой capability безопасный CTA:

`Request scope`

или существующий consultation path.

---

## 53. Consultation is not always required

Consultation оправдана, если:

- custom/complex scope;
- multi-entity case;
- procurement;
- security/NDA;
- unclear evidence need;
- user asks for human discussion.

---

## 54. Consultation is unnecessary when

- scope deterministic;
- user только сохраняет Deal;
- user добавляет internal evidence;
- user понимает Decision Gap;
- standard commercial process может быть self-serve.

Но self-serve action показывается только после реальной реализации.

---

## 55. Current consultation form

Current fields:

```text
Name
Role
Deal context
Scheduling
```

Сохраняются как минимальный existing asset.

---

## 56. Не превращать consultation form в CRM form

Не добавлять автоматически:

- company size;
- budget;
- headcount;
- annual revenue;
- phone;
- procurement stage;
- sales qualification score.

Только если реально требуется commercial process.

---

## 57. Carry-forward context

Если consultation открыта из Deal:

система должна переносить:

- Deal identity;
- selected Decision Gap;
- recommended scope;
- relevant evidence need.

Не заставлять пользователя переписывать всё.

---

## 58. Current technical gap

Current consultation object имеет free-text `dealContext`, а не canonical Deal reference.

Target implementation should eventually bind consultation to stable `dealId` / scope request identity.

Это **target recommendation**, не current state.

---

## 59. Consultation request ≠ accepted engagement

После отправки:

`Request received`

не:

`Engagement confirmed`.

---

## 60. Consultation request ≠ scheduled meeting

Current field `Scheduling` — text.

Не показывать confirmed calendar slot без scheduling integration.

---

## 61. No response-time promise

Не:

`We'll contact you within 2 hours`

если SLA нет.

---

## 62. Commercial proposal

`07` требует будущую способность предоставить:

- proposal;
- scope;
- result description;
- terms;
- security/vendor information;
- invoice where applicable.

Это target procurement support.

---

## 63. Proposal object

Conceptual:

```text
CommercialScopeProposal
  proposalId
  dealId
  decisionGapIds[]
  recommendedScope
  scopePrice
  currency
  scopeSummary
  includedAnalyticalWork[]
  excludedWork[]
  assumptions[]
  dependencies[]
  commercialStatus
  version
  createdAt
```

Не final schema.

---

## 64. Proposal should be versioned

Изменение scope → новая proposal version.

Не silently edit accepted terms.

---

## 65. Proposal ≠ report

Коммерческий документ отделён от analytical report.

---

## 66. Price belongs to proposal/purchase flow

Не печатать price в final IC report.

---

## 67. Procurement artifact

Future buyer may need:

- vendor details;
- security docs;
- scope;
- price;
- tax information;
- invoice.

Не смешивать с evidence report.

---

## 68. Payment state is separate

Conceptual:

```text
NOT_REQUIRED
NOT_STARTED
PENDING
PAID
FAILED
REFUNDED
```

Exact production enum requires payment architecture.

---

## 69. Payment ≠ analytical status

Нельзя:

```text
payment failed
→ delete report
```

или:

```text
paid
→ mark evidence confirmed
```

---

## 70. Payment ≠ workspace permission

Плательщик не получает автоматически:

- private docs;
- respondent answers;
- 42Q;
- named-leader forecast.

---

## 71. Commercial roles

Potential conceptual separation:

- Buyer/requester;
- Billing contact;
- Deal collaborator;
- Evidence contributor;
- Analyst;
- Participant.

Не все равны по data access.

---

## 72. Purchase initiator

Тот, кто нажал commercial CTA, не обязательно:

- payer;
- contract signer;
- workspace owner.

---

## 73. Billing contact

Не аналитическая роль.

---

## 74. Procurement contact

Не получает Deal evidence автоматически.

---

## 75. Engagement activation

Paid analysis begins only when required commercial prerequisites are satisfied.

Current implementation does not define them fully.

Не invent:

- payment alone;
- signed MSA alone;
- consultation alone.

---

## 76. Target activation gate

Conceptual:

```text
scopeAccepted
AND
commercialAuthoritySatisfied
AND
requiredAccessConfigured
AND
evidenceRightsSatisfied
→ PAID_SCOPE_ACTIVE
```

Exact legal/commercial gate later.

---

## 77. No evidence collection before authority when prohibited

Private documents / individual data require their own rights gates.

Payment does not bypass.

---

## 78. Scope can change

Evidence may reveal that:

- smaller scope is enough;
- larger scope is needed;
- requested outcome impossible.

Commercial state must allow requalification.

---

## 79. Upgrade after new evidence

Natural:

```text
$5k
→ private evidence reveals economic dependency
→ $10k scope becomes justified
```

Reason must be visible.

---

## 80. No artificial upgrade trigger

Не:

`You reached document limit — upgrade`.

unless operational quota is genuinely commercial authority.

---

## 81. Downgrade before work

`07` требует возможность change scope according to policy.

Exact refund/contract rules remain separate.

---

## 82. Mid-engagement scope change

Needs new:

- scope proposal;
- price;
- approval.

Do not silently bill.

### 82.1. Upward scope change

Для перехода между standard scopes применяется **delta pricing**:

```text
new standard scope price
− already-paid standard scope price
= additional commercial amount
```

только если:

- предыдущая работа остаётся usable inside broader scope;
- новый scope действительно supersedes предыдущий;
- пользователь явно принимает re-scope.

Named-leader modules считаются отдельно и не уменьшаются delta formula.

### 82.2. Downward scope change

До `PAID_SCOPE_ACTIVE`:

- proposal может быть заменён более дешёвым sufficient scope;
- к оплате применяется новый scope price.

После `PAID_SCOPE_ACTIVE`:

- analytical scope может быть уменьшен, если это методологически правильно;
- refund/credit не рассчитывается автоматически;
- применяется §82.3 / governing contract.

### 82.3. Cancellation / refund target rule

Design-system default:

- **до `PAID_SCOPE_ACTIVE`:** paid amount должен быть полностью refundable, если funds уже collected, за исключением только тех non-refundable external fees/taxes, которые законно и явно раскрыты;
- **после `PAID_SCOPE_ACTIVE`, но до release:** автоматический refund отсутствует; settlement определяется governing proposal/contract с учётом фактически начатой обработки;
- **после release:** обычный cancellation не отменяет completed analytical work; defect correction остаётся обязанностью исправления, а не новым платным scope.

Точный юридический текст и jurisdiction-specific refund rights требуют counsel review до production. UI не должен обещать больше, чем approved contract.

---

## 83. Scope completion

Completion determined by analytical contract, not page count.

---

## 84. Unused scope

If analysis resolves quickly:

не добавлять filler work.

---

## 85. Higher tier is not more consulting hours

Important scalability rule.

Product should remain systemized analytical product.

---

## 86. Manual work visibility

Не продавать:

`20 hours of senior analyst`.

---

## 87. Human review

Human review may exist because:

- contradiction;
- high stakes;
- methodology gate;
- exception.

Не как price justification by labor hours.

---

## 88. Independent verification

Can justify greater assurance in high scope.

Но exact verification act must exist.

---

## 89. $30k cannot promise independent verification if unavailable

Capability truth controls copy.

---

## 90. Scope eligibility matrix

Target conceptual:

| Scope | Typical need |
|---|---|
| $0 | public evidence sufficient for current question |
| $5k | bounded private-evidence verification |
| $10k | economic linkage |
| $15k | several connected dependencies |
| $30k | IC-level multi-evidence decision support |

Not an automatic classifier.

---

## 91. Multi-factor recommendation

Algorithm, if later implemented, must be explainable.

No black-box:

`AI recommends $30k`.

---

## 92. Recommendation rationale

Client-safe:

`This question requires multiple private evidence sources and affects more than one value dependency, so a multi-dependency review is the smallest scope that fits the decision.`

---

## 93. Do not recommend by willingness to pay

No behavioral price discrimination.

---

## 94. Do not recommend by user title alone

Partner ≠ $30k.

Analyst ≠ $5k.

---

## 95. Do not recommend by geography alone

Except tax/currency/commercial availability.

---

## 96. Do not recommend by company brand

No enterprise surcharge by prestige.

---

## 97. Do not recommend by deal size alone

Already fixed.

---

## 98. Do not recommend by document count alone

Already fixed.

---

## 99. Do not recommend by respondent count alone

Respondent count can influence execution cost but not define analytical value.

---

## 100. Pricing transparency

If price shown:

display exact target amount for the recommended base scope.

Do not hide base price behind `Contact sales` if standard scope is authorized.

---

## 101. But do not fake standard price

If exact commercial authority for a scope is not active in implementation:

show scope without invented checkout.

---

## 102. Currency

Стандартная commercial currency первой версии:

> **USD only.**

Все base prices и proposal amounts v1 фиксируются в USD.

Другие currencies не предлагаются как standard pricing и не пересчитываются автоматически.

---

## 103. Taxes

Показанная цена является **base commercial price**.

Target client wording:

`Taxes, if applicable, are determined separately based on the transaction and billing context.`

Нельзя утверждать:

- `tax included`;
- `tax free`;
- конкретную tax rate

без принятой jurisdiction-specific tax authority.

Tax calculation / collection остаётся legal-finance implementation gate, но отсутствие tax engine не меняет base price.

---

## 104. Discounts

Стандартная политика v1:

> **публичных автоматических скидок нет.**

Запрещены:

- promo codes;
- volume discount по умолчанию;
- countdown discount;
- «founder discount» без authority;
- скрытая индивидуальная скидка по willingness-to-pay.

Допустима только явно утверждённая commercial exception:

- Owner / delegated commercial authority;
- exact amount/percentage;
- reason;
- proposal version;
- actor/date.

---

## 105. Promo codes

**Не поддерживаются в v1.**

---

## 106. Subscription

Standard paid product остаётся Deal/engagement-based.

Не subscription.

---

## 107. Recurring monitoring

Monitoring / re-measurement **не входит автоматически** в $5k / $10k / $15k / $30k.

До отдельной recurring-product authority действует правило:

- каждый materially new re-measurement после released baseline рассматривается как новый scope qualification;
- он может использовать ту же price ladder по фактической глубине;
- никакой monthly/annual recurring fee не заявляется;
- scheduled monitoring service не продаётся как существующая capability без implementation act.

---

## 108. Additional leader modules

После production eligibility по `31`:

> **$5,000 за одного named-leader module.**

В базовые scope включено **0** named-leader modules.

Каждый дополнительный человек:

- отдельный person-level rights/method gate;
- отдельный module;
- отдельная цена $5,000;
- не объединяется в quantity discount автоматически.

До закрытия gates `31` module коммерчески недоступен.

---

## 109. Additional Deal dependencies

Новая независимая material Deal dependency после начала анализа требует re-scope только если она не покрывается принятым decision question.

Не использовать per-dependency micro-fee.

Применяется ближайший sufficient standard scope.

---

## 110. Repeat analysis

Стандартное правило v1:

- original paid scope включает **один released analytical baseline** на одном frozen evidence cutoff;
- исправление ошибки MergeVue / defect correction не считается новым платным анализом;
- новые evidence, добавленные **до release** и находящиеся внутри accepted scope, обрабатываются в исходном scope;
- materially new evidence **после release**, которое требует нового analytical conclusion, считается re-measurement / new analysis и проходит новую scope qualification;
- повторный запуск без нового decision need не продаётся как отдельная ценность.

---

## 111. Proposal expiry

Стандартная target policy:

> **commercial proposal valid for 30 calendar days from issuance.**

После expiry:

- scope recommendation может быть reused;
- price/terms должны быть reconfirmed;
- old proposal нельзя принять silently;
- новая proposal version получает новый validity period.

Proposal может явно установить иной срок только через authorized commercial exception.

---

## 112. Payment terms

Стандартное правило v1:

> **100% accepted scope price due before `PAID_SCOPE_ACTIVE`.**

Исключение возможно только в signed/accepted proposal с явными payment terms.

Нельзя автоматически обещать:

- Net 30;
- 50/50;
- post-delivery payment

без proposal-specific authority.

---

## 113. Card payment

Current audited `main` card payment не реализует.

Target policy v1 не требует card checkout для запуска commercial architecture.

Не показывать card form до отдельного payment implementation act.

---

## 114. ACH / wire

Payment method не кодируется в design как текущая capability.

Phase-1 commercial fulfillment может использовать **manual invoice / externally administered B2B payment process**, если operationally authorized.

UI не должен показывать конкретный bank/wire method, пока real payment instructions не существуют.

---

## 115. Payment processor

**Initial target decision: никакой embedded payment processor не является обязательной частью v1.**

Phase 1:

```text
scope accepted
→ manual commercial confirmation / invoice process
→ payment confirmation
→ activation
```

Stripe или другой processor может быть добавлен только отдельным payment/security act.

Следовательно:

> `paymentProvider = NONE_EMBEDDED_IN_INITIAL_V1`

— target architecture semantic, не current code enum.

---

## 116. Invoice

Initial target commercial path допускает **manual B2B invoice**, но не заявляет invoice-generation backend.

Нормативно invoice/proposal должен содержать или ссылаться на:

- exact scope;
- price;
- USD currency;
- proposal/version identity;
- payer/billing identity;
- applicable tax treatment once legally determined;
- payment instruction issued by authorized commercial operations.

Automation может появиться позже без изменения analytical pricing logic.

---

## 117. Commercial state machine

Conceptual:

```text
NOT_QUALIFIED
QUALIFICATION_READY
SCOPE_RECOMMENDED
SCOPE_REQUESTED
PROPOSAL_PENDING
PROPOSAL_AVAILABLE
SCOPE_ACCEPTED
COMMERCIAL_PREREQUISITES_PENDING
PAID_SCOPE_ACTIVE
DECLINED
CANCELLED
```

Not final enum.

---

## 118. Analytical state machine remains separate

Examples:

```text
EVIDENCE_INCOMPLETE
UNDER_REVIEW
REPORT_READY
CANNOT_DETERMINE
SEALED
VERIFIED
```

Never merge with commercial status.

---

## 119. Example of prohibited merge

Не:

`PAID_AND_VERIFIED`.

Payment and verification are orthogonal.

---

## 120. Deal Workspace commercial card

Future minimal summary may show:

```text
Analysis scope
$10,000 · Economic linkage

Commercial status
Scope requested
```

Separate from:

```text
Analysis status
Private evidence pending
```

---

## 121. Commercial state should not dominate workspace

Primary work object remains Deal/evidence/decision.

---

## 122. Public report CTA

Preferred:

`Review what remains unresolved`

not immediate:

`Buy $30,000 package`.

---

## 123. Decision Gap CTA

Potential:

`See the analysis needed to resolve this`

---

## 124. Scope recommendation CTA

Potential:

`Request this analysis`

If current manual flow.

---

## 125. Consultation CTA

Potential:

`Discuss scope`

Не universal primary CTA.

---

## 126. Proposal CTA

Future:

`Request proposal`

only when proposal workflow exists.

---

## 127. Checkout CTA

Future:

`Proceed to payment`

only when actual payment exists.

---

## 128. No dead CTA

Every button must correspond to actual route/action.

---

## 129. Existing route fallback

Until future commercial backend:

`Request scope` may continue to `/screen-12-consultation-request`.

But UI should not falsely call it purchase.

---

## 130. No fake confirmation

After consultation email dispatch:

`Request sent`

not:

`Your engagement is booked`.

---

## 131. Email capture remains separate

`Email me this analysis`

is report delivery.

Not purchase.

---

## 132. Marketing consent remains separate

Do not bundle with:

- report email;
- consultation;
- proposal;
- account;
- payment.

---

## 133. Account creation remains separate

Purchase may eventually require account.

Но:

account creation ≠ payment.

---

## 134. Guest buyer

A buyer may request scope before workspace account if current flow allows.

Do not invent auth barrier unnecessarily.

---

## 135. Commercial analytics

Target events:

```text
paid_scope_qualification_viewed
paid_scope_recommended
paid_scope_lower_alternative_viewed
paid_scope_request_started
paid_scope_request_submitted
consultation_requested
proposal_requested
scope_accepted
payment_started
payment_completed
paid_scope_activated
paid_scope_not_justified
```

Only implement events for real capabilities.

---

## 136. Do not log sensitive Deal context into generic analytics

Use IDs/categories where lawful.

---

## 137. Funnel metrics

Useful:

```text
Public result
→ Decision Gap opened
→ Scope recommendation
→ Scope request
→ Proposal
→ Acceptance
→ Payment
→ Activation
```

---

## 138. Do not optimize conversion alone

Need also:

- scope appropriateness;
- usage;
- analytical quality;
- unknown rate;
- verification;
- repeat value;
- client trust.

---

## 139. No revenue-maximizing recommender

Commercial recommender objective is:

> sufficient scope for user's decision.

Not highest expected revenue.

---

## 140. Recommendation auditability

Store:

- gap(s);
- materiality basis;
- evidence requirements;
- dependency complexity;
- recommendation;
- alternative;
- reason.

---

## 141. Commercial recommendation can be overridden

User can choose smaller/larger scope subject to product rules.

But product must explain limitations.

---

## 142. User choosing smaller scope

Example:

`This smaller scope can test the private-document question, but it will not establish the economic linkage.`

---

## 143. User choosing larger scope

Do not imply extra benefit if unnecessary.

Potential warning:

`The current decision gap does not require this broader scope.`

---

## 144. Product may refuse unnecessary scope

High-trust target behavior.

---

## 145. Product may refuse unsupported request

Example:

`This scope cannot provide the certainty requested from the available evidence.`

---

## 146. Proposal contents

Minimum target:

```text
Deal
Decision question
Recommended scope
Price
Why this scope
Evidence required
Deliverable
Limitations
Commercial next step
```

---

## 147. Proposal must not include methodology secrets

Enough to understand service.

Not core model disclosure.

---

## 148. Proposal must not include raw private evidence

---

## 149. Procurement copy

Professional, neutral.

No hype:

- `revolutionary`;
- `guaranteed`;
- `game-changing`;
- `AI-powered certainty`.

---

## 150. Security documents

Can be supplied if real.

Do not invent certifications.

---

## 151. Vendor information

Must be factually current.

---

## 152. Contracting

Outside this design contract.

---

## 153. Refunds

Outside this design contract.

---

## 154. Cancellation

Policy outside; UI must not invent.

---

## 155. Scope downgrade

Allowed conceptually subject to policy.

---

## 156. Price change

If target ladder changes later:

version commercial authority.

Do not silently update in active accepted proposal.

---

## 157. Quote version

Each proposal binds exact price/scope version.

---

## 158. Product tier version

Conceptual:

```text
commercialModelVersion
```

Useful to distinguish legacy $90K–$200K from target ladder.

---

## 159. Legacy commercial model

Must be namespaced/historical.

Do not let old validation accidentally control target UI.

---

## 160. Migration requirement

Before target release:

- isolate legacy offer copy;
- update validators;
- preserve route compatibility;
- remove 213% anchor;
- replace feature-grid semantics;
- bind scope recommendation to Decision Gap.

---

## 161. No destructive route migration

Existing deep links should not break without redirect/route plan.

---

## 162. Homogeneous route migration

Same requirement.

---

## 163. Consultation email destination

Current `info@structural-typology.academy` is existing implementation detail.

It should be audited during brand/product migration.

This contract does not assume it is future MergeVue commercial address.

---

## 164. Brand consistency

Client-facing proposal/consultation must use MergeVue product identity.

Legacy Structural Typology leakage should be removed when implementation act authorizes.

---

## 165. Current consultation subject

Current backend uses `Mergevue consultation request`.

Can remain until redesign.

---

## 166. Error states

Commercial surface must handle:

```text
scope unavailable
qualification incomplete
request failed
proposal unavailable
payment unavailable
```

without losing public report.

---

## 167. Offline/manual commercial fallback

If payment automation absent:

state honestly:

`We'll confirm scope and commercial terms before the engagement begins.`

Only if operationally true.

---

## 168. No fake automation

Do not say:

`Your analysis starts immediately after payment`

unless actual workflow supports.

---

## 169. No fake delivery timing

No:

`Delivered in 48 hours`

without accepted SLA.

---

## 170. No fake analyst assignment

No:

`A senior analyst has been assigned`

until backend/event exists.

---

## 171. Scope request receipt

Could show:

```text
Request received
Recommended scope: $10,000 economic linkage
Next step: commercial confirmation
```

if system truly records recommendation.

---

## 172. No PII overcollection

Commercial request collects minimum information necessary.

---

## 173. Deal context reuse

Prefer Deal reference over repeated free text.

---

## 174. Accessibility

Target WCAG 2.2 AA.

Price/scope UI:

- no color-only recommendation;
- readable price;
- clear included/excluded content;
- accessible comparison;
- keyboard focus;
- clear form errors.

---

## 175. Mobile

Order:

1. Decision Gap
2. Why it matters
3. Recommended scope
4. What it does
5. What it does not do
6. Price
7. Alternative
8. CTA

Не таблица из пяти колонок.

---

## 176. Desktop

May show:

- recommended scope primary;
- one sufficient lower alternative;
- optional broader scope link.

Do not create four equally loud pricing cards after every report.

---

## 177. Visual tone

Продолжение аналитического report.

Не смена на SaaS marketing landing.

---

## 178. Price typography

Price visible but not dominant over decision question.

---

## 179. No gold badge

---

## 180. No `Best value`

---

## 181. No `Save 20%`

---

## 182. No `Enterprise — Contact us` as vague catch-all

Use concrete scope.

---

## 183. Scope name

Preferred client labels:

`Private Evidence Review`

`Economic Linkage Analysis`

`Multi-Dependency Review`

`Investment Committee Analysis`

These are candidate UI strings and require content review before shipping.

---

## 184. Avoid tier labels

Не:

`Basic`

`Pro`

`Premium`

`Elite`

---

## 185. Commercial language

Preferred:

- `Analysis scope`
- `Recommended scope`
- `Evidence required`
- `What this analysis can resolve`
- `What remains outside scope`
- `Request this analysis`
- `Discuss scope`

---

## 186. Trust language

Paid scope should say what it **cannot** guarantee.

---

## 187. Lower alternative is trust feature

Always show if genuinely sufficient.

---

## 188. `Stay free` is trust feature

Same.

---

## 189. No forced purchase after economic exposure

Economic materiality can justify scope but does not force it.

---

## 190. Integration with `32`

Economic Linkage scope ($10k) must use `32` boundaries:

- exposure ≠ loss;
- no automatic ECS-dollar formula;
- no guaranteed savings.

---

## 191. Integration with `31`

Individual module must use:

- legal/privacy gate;
- canonical 42Q;
- no type label;
- no named-leader forecast without individual evidence.

---

## 192. Integration with `25`

Paid high-stakes output may require analyst/review gate.

Commercial payment does not bypass.

---

## 193. Integration with `26`

Paid forecast release/lock remains separate.

---

## 194. Integration with `27`

Verification not included merely because package paid.

---

## 195. Integration with `28`

Monitoring/re-measurement commercial terms separate unless explicitly packaged.

---

## 196. Integration with `29`

Data rights apply regardless of price.

---

## 197. Integration with `30`

Execution Evidence Pack not automatically part of paid scope unless authorized.

---

## 198. No bundle inflation

Do not add every future capability to $30k merely to make it look valuable.

---

## 199. Scope contract principle

Each paid scope should have:

```text
Question
Evidence
Method
Output
Limitations
Price
```

---

## 200. No quantity theater

Avoid selling:

- 20 reports;
- 100 pages;
- 50 documents;
- 10 dashboards.

---

## 201. No model-brand sales claim

Do not sell:

`GPT-6 reviewed`

or model count.

Client buys analytical assurance.

---

## 202. Independent verification copy

If true:

`Independent model verification applied`

not named model unless needed.

---

## 203. Human review copy

If conditional:

`Human review is applied when the analytical gate requires it.`

Not:

`Every report reviewed by senior partner`

unless true.

---

## 204. Commercial deliverable must match analytical deliverable

Do not promise artifact that pipeline cannot create.

---

## 205. `Professional report`

Only if actual report exists.

---

## 206. `Investment Committee Analysis`

Must have appropriate output quality before ship.

---

## 207. Deal phase

Scope can be recommended at:

- diligence;
- pre-close;
- post-close monitor

only when product supports that phase.

---

## 208. Do not reuse pre-close price automatically post-close

Monitoring may be separate commercial model.

---

## 209. Commercial availability

If a scope is not operationally available:

show unavailable / request discussion rather than fake purchase.

---

## 210. Current target release strategy

Phase 1 can retain manual commercial handoff:

```text
Scope recommendation
→ Request scope
→ Consultation/commercial confirmation
```

without payment automation.

---

## 211. Self-serve payment is not prerequisite for useful target UX

Correct scope qualification can precede billing automation.

---

## 212. But manual handoff must be explicit

No fake checkout language.

---

## 213. Self-serve vs manual eligibility

### 213.1. Current implementation

Current audited flow remains manual:

```text
scope / paid offer
→ consultation request
→ commercial follow-up
```

No scope is presently self-serve purchasable.

### 213.2. Target eligibility after payment infrastructure exists

- **$5,000** — self-serve eligible when scope qualification is deterministic and no security/legal/custom blocker exists;
- **$10,000** — self-serve eligible only when economic-basis inputs and scope are structurally complete; otherwise manual review;
- **$15,000** — manual scope confirmation required before activation;
- **$30,000** — manual proposal/procurement confirmation required before activation;
- **named-leader $5,000 module** — manual eligibility review required until a later Owner act explicitly permits self-serve, even after `31` becomes release-ready.

Self-serve eligibility does not eliminate evidence/privacy gates.

### 213.3. Before enabling embedded payment

Required:

- legal entity/vendor details;
- taxes;
- refund/cancellation implementation;
- payment processor if embedded checkout is used;
- invoice/receipt;
- entitlement activation;
- failure/retry handling;
- security;
- audit;
- access separation.

---

## 214. Payment provider neutrality

This contract does not select Stripe or another provider.

---

## 215. Purchase success

Future success state must distinguish:

```text
Payment successful
```

from:

```text
Analysis active
```

---

## 216. Payment failure

Does not erase:

- public result;
- saved Deal;
- already lawful evidence.

---

## 217. Chargeback/refund

Commercial policy, not analytical deletion.

---

## 218. Invoice payer mismatch

Possible.

Do not bind payer identity to evidence access.

---

## 219. Enterprise procurement

May require manual process even if lower scopes become self-serve.

---

## 220. Scope availability by market

Standard commercial launch market:

> **United States.**

Base ladder v1 предлагается как U.S.-market USD pricing architecture.

Работа с buyer/entity outside the standard market требует commercial/legal eligibility review и не считается automatically available.

---

## 221. Taxes by market

Tax treatment определяется billing jurisdiction/entity и не изменяет base analytical scope.

До validated tax workflow:

- показывается base USD price;
- tax status может быть `To be determined`;
- engagement не активируется, если required billing/tax treatment нельзя законно оформить.

---

## 222. Currency other than USD

**Не поддерживается как standard commercial pricing в v1.**

Если enterprise buyer требует non-USD invoice:

- это manual commercial exception;
- FX rate/source/date должны быть явными;
- base USD scope price сохраняется как commercial reference;
- дизайнер/agent не придумывает conversion rate.

---

## 223. Contract language

Not defined.

---

## 224. Commercial terms acceptance

Needs explicit mechanism when implemented.

---

## 225. Terms version

Must be stored if digital acceptance.

---

## 226. No pre-checked terms

---

## 227. No bundled marketing consent

---

## 228. Data-processing terms

Separate from marketing consent.

---

## 229. NDA

Can be part of enterprise process.

Not assumed for every user.

---

## 230. Security review

May justify consultation/procurement path.

### 230.1. Procurement / security package process

Target v1:

```text
buyer requests procurement/security review
→ Deal/commercial request identity verified
→ only current factual vendor/security/legal artifacts assembled
→ authorized commercial/security owner reviews package
→ controlled delivery to named procurement/security recipient
→ questions / exceptions handled manually
→ commercial status updated
```

Rules:

- package предоставляется **on request**, не публикуется как unrestricted public download;
- никакие SOC 2 / ISO / pen-test / DPA / insurance / certification claims не добавляются, если соответствующий действующий artifact реально отсутствует;
- $15k и $30k scopes по умолчанию допускают manual procurement path;
- $5k и $10k используют его только если buyer требует;
- procurement recipient не получает Deal evidence автоматически;
- security review не меняет analytical scope;
- procurement completion ≠ payment ≠ `PAID_SCOPE_ACTIVE`.

---

## 231. Corporate purchase path

Target conceptual:

```text
Request proposal
→ Review scope
→ Security / procurement if needed
→ Commercial acceptance
→ Payment / invoice
→ Engagement activation
```

---

## 232. Individual buyer path

Could later be:

```text
Scope accepted
→ Payment
→ Engagement activation
```

only if legally/operationally supported.

---

## 233. No distinction by logo size

Commercial path depends on procurement need, not prestige.

---

## 234. Analytics privacy

Do not send:

- Deal names;
- proposed acquisition;
- exact price negotiation;
- private evidence descriptions

to generic marketing analytics without policy.

---

## 235. Sales CRM integration

Not assumed.

---

## 236. Commercial email

Current implementation sends consultation email.

Future replacement must preserve auditability.

---

## 237. Request identity

Need stable request ID before robust commercial automation.

---

## 238. Idempotency

Repeated click should not create multiple charges/proposals unknowingly.

Future implementation requirement.

---

## 239. Proposal acceptance audit

Store actor/time/version.

---

## 240. Payment audit

Store provider-safe transaction reference, not card data.

---

## 241. Sensitive payment data

Never store raw card data in MergeVue application code.

---

## 242. Receipt

Future payment flow should provide receipt/invoice as required.

Not implemented now.

---

## 243. Commercial support

Support contact not invented here.

---

## 244. Scope dispute

Human path.

---

## 245. Scope mismatch after evidence intake

System should detect and recommend requalification.

---

## 246. Scope escalation rationale

Must say what new evidence changed.

---

## 247. Scope reduction rationale

Same.

---

## 248. No sunk-cost manipulation

Не:

`You've already paid $5k, upgrade now to avoid wasting it.`

---

## 249. No irreversible tier lock

Unless contract terms explicitly require.

---

## 250. Commercial recommendation quality metric

Measure:

> was recommended scope sufficient for the decision?

Not only conversion.

---

## 251. False-positive paid recommendation

Important failure class:

paid scope recommended though FREE was sufficient.

---

## 252. False-negative paid recommendation

Material decision remains unresolved because insufficient scope recommended.

---

## 253. Commercial calibration

Future research can evaluate recommendation appropriateness.

Do not online self-optimize price to willingness-to-pay.

---

## 254. No personalized price discrimination

Same analytical scope should not secretly change price based on inferred willingness to pay unless explicit commercial policy.

---

## 255. Scope transparency

If price differs due to custom scope:

explain scope difference.

---

## 256. Custom scope

Allowed only when actual work falls outside standard scopes.

Not generic excuse to hide price.

---

## 257. Custom scope should remain bounded

Need:

- specific decision;
- evidence;
- deliverable;
- exclusions.

---

## 258. No blank `Contact sales`

If standard scope exists.

---

## 259. Price ladder publicness

`07` permits public display.

But contextual flow should prioritize recommended scope over full catalogue.

---

## 260. Existing paid offer copy migration

Legacy heading:

`What the structural-level forecast cannot tell you`

is useful conceptually.

Can adapt to:

`What this analysis cannot resolve yet`

where evidence supports.

---

## 261. Homogeneous variant

Likewise:

`What this analysis cannot resolve yet`

rather than a separate package philosophy.

---

## 262. Report-to-offer transition

Target:

```text
Report
→ Decision Gap
→ [Review analysis needed]
→ scope detail
```

not:

```text
Report
→ price wall
```

---

## 263. Embedded vs standalone

Preferred architecture:

- Decision Gap embedded in report;
- `screen-11` as detailed scope explanation.

---

## 264. No duplicate report

`screen-11` should not re-render whole report.

---

## 265. Current public report CTA migration

Existing `Continue to paid offer` may eventually adapt to evidence-specific wording.

Do not change route/string without implementation content act.

---

## 266. Suggested future CTA

`Review next-step analysis`

only after copy authority.

---

## 267. Scope qualification completeness

Before recommendation, system must know enough to explain why.

If not:

`More information is needed before a scope can be recommended.`

---

## 268. No inferred budget

Do not ask or infer budget merely to select tier.

---

## 269. Budget may matter in sales

But not analytical scope recommendation.

---

## 270. Buyer can decline

Decline should leave:

- public report;
- saved Deal;
- existing lawful evidence.

---

## 271. No repeated nagging

Do not show aggressive paid modal every visit.

---

## 272. Returning user

Show commercial status only where relevant.

---

## 273. Commercial expiration

Not defined.

---

## 274. Proposal supersession

New accepted proposal supersedes old commercial terms, not analytical history.

---

## 275. Cancellation does not rewrite evidence history

---

## 276. Deletion rights remain separate

---

## 277. Report sharing after non-purchase

Public report remains under its sharing policy.

---

## 278. Private evidence after cancelled engagement

Retention/data-rights policy controls.

---

## 279. Commercial copy must be testable

Every claim:

`includes X`

must map to actual capability.

---

## 280. No aspirational capability in active offer

Future feature can be labeled:

`Not currently included`

or omitted.

---

## 281. Scope snapshot

At acceptance, freeze:

- decision question;
- scope;
- price;
- included outputs;
- exclusions;
- assumptions.

---

## 282. Evidence changes after scope acceptance

May trigger change request.

Do not retroactively rewrite proposal.

---

## 283. Analytical expansion

New evidence may reveal a second material dependency.

System should ask:

- continue within existing authorized scope if covered;
- otherwise re-scope.

---

## 284. Commercial anti-proliferation

Do not create one add-on per evidence type.

---

## 285. Specialized modules

Limit to genuine special cases such as named-leader individual analysis.

---

## 286. No module before capability

---

## 287. Sales copy and methodology claims

Marketing language cannot exceed methodology authority.

---

## 288. Price and economic exposure

Higher exposure can make deeper scope economically reasonable.

But not prove methodological need by itself.

---

## 289. Price and assurance

Higher assurance may require independent verification/review.

Need actual workflow.

---

## 290. Price and liability

Not addressed.

No legal risk pricing in UI.

---

## 291. Price and geography

Not addressed except USD target display.

---

## 292. Price and taxes

Separate.

---

## 293. Price and discount policy

Separate.

---

## 294. Price and payment terms

Separate.

---

## 295. Price and recurring monitor

Separate.

---

## 296. Price and historical case studies

Historical cases remain public/credibility layer, not paid add-on.

---

## 297. Price and methodology pages

Methodology transparency is not paywalled to create artificial value.

---

## 298. Price and report PDF

Public PDF delivery is not justification for paid tier.

---

## 299. Price and account

Account is not paid tier.

---

## 300. Price and collaboration

Future collaboration may require product/commercial decision but should not distort analytical tiers by default.

---

## 301. Уровень доверия

### 301.1. Current implementation truth

**Высокое доверие**:

- existing paid offer routes exist;
- current legacy validation expects `$90K–$200K`;
- current cost anchor includes `213%`;
- CTA leads to consultation;
- consultation fields are Name / Role / Deal context / Scheduling;
- current flow does not establish self-serve checkout.

### 301.2. Target price ladder

**Высокое внутри текущего design corpus**, поскольку `07` explicitly defines:

```text
0 / 5,000 / 10,000 / 15,000 / 30,000 USD
```

as target working commercial architecture.

Это всё ещё не означает:

- signed contractual terms;
- payment implementation;
- tax policy;
- fulfillment quota.

### 301.3. Exact package quotas

**Не определены.**

Do not invent.

### 301.4. Payment architecture

**Не определена / не реализована в audited current flow.**

### 301.5. Commercial proposal/invoice automation

**Target need, current capability not established.**

### 301.6. What is permitted now

Design can safely specify:

- scope qualification;
- recommended depth;
- target ladder;
- lower sufficient alternative;
- `stay free`;
- manual request/consultation handoff.

### 301.7. What is not permitted yet

Do not claim:

- checkout;
- card payment;
- invoice auto-generation;
- immediate activation;
- SLA;
- refund policy;
- discounts;
- exact included quantities.

---

## 302. Что мы сознательно НЕ меняем

1. Public value remains available before payment.
2. Decision Gap remains the trigger for deeper analysis.
3. Existing `screen-11` routes remain until explicit replacement.
4. Existing consultation route remains a valid manual handoff.
5. Email capture remains separate from purchase.
6. Account remains separate from payment.
7. Commercial state remains separate from analytical state.
8. Price does not buy certainty.
9. Paid analysis may end `Cannot determine`.
10. Closed documents remain paid evidence.
11. 42Q is special individual channel, not generic tier feature.
12. Named-leader forecast requires `31`.
13. Economic exposure uses `32`.
14. $30k is not visually or semantically “best”.
15. `Stay free` remains a legitimate recommendation.
16. Lower sufficient paid scope remains visible.
17. No new routes are authorized here.
18. No payment provider is selected here.
19. No feature-count pricing is introduced.
20. Legacy `$90K–$200K` is not propagated into target design.

---

## 303. Основные изменения относительно current `screen-11`

### Сохраняется

- route;
- Deal context;
- concept of what current analysis cannot resolve;
- commercial continuation;
- consultation fallback.

### Адаптируется

- feature comparison → evidence-depth explanation;
- generic `Paid adds` → specific scope;
- forced call → contextual commercial action;
- price-first → Decision Gap-first.

### Удаляется из target

- `$90K–$200K`;
- `213%` anchor;
- urgency/fear economics;
- generic higher-price = more-value implication.

### Добавляется

- recommended sufficient scope;
- reason;
- lower sufficient alternative;
- `paid analysis not justified`;
- included/excluded analytical boundary;
- commercial status separation.

---

## 304. Минимальная target surface

```text
What remains unresolved
[Decision Gap]

Why it matters
[Deal / value dependency]

What evidence would resolve it
[...]

Recommended analysis scope
Economic Linkage Analysis

Why this scope
[...]

What we will test
[...]

What you will receive
[...]

What is not included
[...]

Price
$10,000

A smaller scope may be sufficient
[when true]

[Request this analysis]
[Discuss scope]
[Back to analysis]
```

---

## 305. Acceptance criteria

Контракт проходит только если:

1. Existing `screen-11` routes preserved until route act.
2. Legacy `$90K–$200K` not used as target price.
3. `213%` anchor removed from target.
4. Target ladder is 0 / 5k / 10k / 15k / 30k.
5. Price shown after Decision Gap and scope rationale.
6. No generic SaaS feature grid as primary pricing UX.
7. $5k maps to bounded private-evidence check.
8. $10k maps to economic linkage.
9. $15k maps to multi-dependency review.
10. $30k maps to IC-level decision support.
11. Scope is not defined by page count.
12. Scope is not defined by file count.
13. Scope is not defined by respondent count alone.
14. Scope is not defined by consultant hours.
15. Scope is not defined by Deal EV alone.
16. Scope recommendation uses materiality.
17. Scope recommendation uses evidence need.
18. Scope recommendation uses dependency complexity.
19. Scope recommendation uses decision level.
20. Economic exposure is qualification context, not automatic price formula.
21. No `exposure × percentage` price engine.
22. Higher price does not imply higher certainty by entitlement.
23. Paid output may remain `Cannot determine`.
24. `Stay free` is valid.
25. Lower sufficient scope is visible.
26. No decoy tier.
27. No `Most popular`.
28. No crossed-out fake price.
29. No fake discount.
30. No countdown.
31. No fake scarcity.
32. No fear/loss anchor.
33. No ROI guarantee.
34. No savings guarantee.
35. Public result remains accessible.
36. Account not required to see already-earned public value.
37. Email capture not purchase gate.
38. Consultation not universal.
39. Existing consultation fields remain minimal unless process requires more.
40. Deal context is carried forward where possible.
41. Consultation request is not engagement confirmation.
42. Scheduling free text is not calendar confirmation.
43. No SLA invented.
44. No checkout route invented.
45. No Stripe assumption.
46. No card form invented.
47. No ACH/wire assumption.
48. No invoice automation claim without backend.
49. Payment separated from analytical state.
50. Payment separated from data access.
51. Payer does not automatically receive private evidence.
52. Commercial role separated from workspace role.
53. Engagement activation requires explicit commercial/evidence gates.
54. Payment cannot bypass data-rights gates.
55. Scope changes are versioned.
56. Scope escalation requires new information/rationale.
57. Scope reduction remains possible subject to policy.
58. No artificial quota-driven upgrade.
59. No sunk-cost manipulation.
60. No personalized price discrimination by inferred willingness to pay.
61. User title does not determine price.
62. Company size does not determine price.
63. Geography does not secretly determine base scope.
64. Brand/prestige does not determine price.
65. Deal value does not determine price alone.
66. No vague `Contact sales` when standard scope is actually authorized.
67. Custom scope remains bounded.
68. Proposal is separate from report.
69. Price is not shown in IC analytical report.
70. Proposal version is retained.
71. Accepted proposal scope is frozen.
72. Analytical evidence changes do not silently rewrite commercial terms.
73. Marketing consent remains separate.
74. Terms consent not pre-checked.
75. Tax claims withheld until policy.
76. Refund/cancellation claims withheld until policy.
77. Delivery times withheld until SLA.
78. Exact document/respondent/leader quotas withheld until commercial decision.
79. 42Q not listed as generic package feature.
80. Named-leader forecast unavailable without `31` gates.
81. Economic linkage respects `32`.
82. Analyst/review gates respect `25`.
83. Forecast lock respects `26`.
84. Verification respects `27`.
85. Monitoring pricing is not invented.
86. Execution Evidence Pack not automatically bundled.
87. Legacy offer code isolated during migration.
88. Existing public-report flow not broken.
89. Current manual consultation can remain phase-1 commercial fallback.
90. Manual fallback is described honestly as request, not purchase.
91. No fake immediate-start claim.
92. Commercial events only emitted for real capabilities.
93. Sensitive Deal data not sent to generic analytics.
94. Recommendation rationale is auditable.
95. Revenue optimization does not override sufficient-scope principle.
96. Design remains visually congruent with analytical report.
97. WCAG 2.2 AA target maintained.
98. Client UI is American English.
99. LIVE audit occurs before implementation because this document audits `main`, not deployed production.
100. Any contractual/payment/tax detail not explicitly authorized remains fail-closed.
101. Standard scopes are defined by decision/evidence complexity, not fixed document counts.
102. Standard scopes do not include named-leader modules.
103. Named-leader module target price is $5,000 per person only after `31` release gates.
104. Respondent count is method-driven, not a pricing unit.
105. Engineering document caps cannot trigger commercial upgrade by themselves.
106. Initial v1 has no public standard SLA.
107. One paid scope yields one released baseline at one frozen evidence cutoff.
108. MergeVue defect correction is not charged as repeat analysis.
109. Materially new post-release evidence triggers new scope qualification.
110. Monitoring is not bundled into the base ladder.
111. Upward standard re-scope uses approved delta pricing.
112. No automatic/public discounts exist.
113. Standard pricing currency is USD only.
114. Default proposal validity is 30 calendar days.
115. Standard payment term is 100% before `PAID_SCOPE_ACTIVE`, absent explicit proposal exception.
116. Initial v1 does not require an embedded payment processor.
117. Future self-serve eligibility is $5k standard, $10k conditional, $15k/$30k manual.
118. Procurement/security packages contain only current factual artifacts and never grant Deal-data access.

---

## 306. Implementation sequence

### Фаза 0 — заморозить legacy commercial behavior

- inventory current routes;
- hash/capture current offer copy;
- capture validators;
- preserve navigation;
- mark `$90K–$200K` + `213%` as legacy target-deprecation items.

### Фаза 1 — scope qualification model

Implement:

- Decision Gap reference;
- materiality;
- evidence need;
- dependency complexity;
- recommended scope;
- lower sufficient alternative;
- `stay free`.

No payment.

### Фаза 2 — `screen-11` adaptation

Replace legacy sales semantics with:

- unresolved question;
- evidence depth;
- recommended scope;
- target price;
- limitations;
- request action.

### Фаза 3 — commercial request identity

Bind:

- Deal;
- scope;
- proposal/request;
- requester;
- version.

Keep consultation fallback.

### Фаза 4 — proposal/procurement support

Implement accepted v1.1 rules:

- versioned proposal;
- 30-day default validity;
- USD price;
- manual procurement/security request;
- factual artifact pack only;
- manual invoice path;
- proposal-specific delivery date;
- no standard public SLA.

### Фаза 5 — payment operations

Initial target:

- manual B2B invoice/payment confirmation;
- 100% due before activation unless proposal-specific exception;
- tax/legal gate;
- idempotent commercial confirmation;
- payment and access separation;
- audit.

Embedded provider/checkout remains optional later and requires separate act.

### Фаза 6 — self-serve activation

Only after payment + entitlement + rights boundaries pass IV.

---

## 307. Adjudication 18 commercial decisions

Этот раздел заменяет прежний open list. Owner **явно принял v1.1 2026-09-16**. Все 18 dispositions ниже являются controlling commercial target policy этого контракта, если более высокий authority source позднее явно не supersede их.

| # | Вопрос | Disposition v1.1 | Статус |
|---:|---|---|---|
| 1 | Exact included quantities per scope | **Не использовать штуки как unit of sale.** Scope определяется Decision Gap / value-dependency complexity по §4.1 | **РЕШЕНО** |
| 2 | Named-leader module price | **$5,000 per named leader**, только после production eligibility `31` | **РЕШЕНО; METHOD/LEGAL GATED** |
| 3 | Included number of leaders | **0 во всех standard scopes**; каждый leader — отдельный module | **РЕШЕНО** |
| 4 | Included respondent count | **Не коммерциализируется как fixed count**; minimum method-required respondents inside accepted Decision Gap | **РЕШЕНО** |
| 5 | Document-processing operational limits | Internal engineering safety limits; **не pricing metric**; exact caps принимаются implementation act | **РЕШЕНО КАК ENGINEERING GATE** |
| 6 | Turnaround / SLA | **Нет public standard SLA в initial v1**; delivery date фиксируется proposal-specific после operational confirmation | **РЕШЕНО** |
| 7 | Repeat analysis | One released baseline per scope; defects corrected without new fee; materially new post-release evidence → new scope qualification | **РЕШЕНО** |
| 8 | Monitoring / re-measurement pricing | **Не bundled и не recurring subscription в v1**; каждый material re-measurement проходит новую standard scope qualification | **РЕШЕНО** |
| 9 | Scope-change billing | Upward standard-scope change = **delta pricing** after approval; downward before activation uses lower price; later refund/credit follows contract | **РЕШЕНО** |
| 10 | Refund / cancellation | Pre-activation full refund target, subject only to lawfully disclosed non-refundable external fees/taxes; post-activation manual contractual settlement | **РЕШЕНО КАК PRODUCT RULE; LEGAL TEXT GATED** |
| 11 | Discounts | **No automatic/public discounts**; only recorded Owner/delegated commercial exception | **РЕШЕНО** |
| 12 | Taxes | Base prices shown in USD; tax if applicable determined separately by billing context; no invented rate | **РЕШЕНО КАК DISPLAY RULE; TAX ENGINE GATED** |
| 13 | Payment processor | **No embedded processor required in initial v1**; manual B2B payment/invoice first; Stripe/other provider requires separate act | **РЕШЕНО** |
| 14 | Invoice / payment terms | Manual invoice permitted; standard **100% due before `PAID_SCOPE_ACTIVE`**; other terms only proposal-specific exception | **РЕШЕНО** |
| 15 | Self-serve vs manual | Current all-manual; future $5k self-serve eligible, $10k conditional self-serve, $15k/$30k manual; leader module manual | **РЕШЕНО** |
| 16 | Proposal expiry | **30 calendar days** by default; explicit authorized exception may differ | **РЕШЕНО** |
| 17 | Currencies beyond USD | **USD only standard v1**; non-USD only manual enterprise exception with explicit FX source/date | **РЕШЕНО** |
| 18 | Procurement / security package | Controlled on-request factual package; manual owner review; no invented certifications; recipient gets no Deal evidence by default | **РЕШЕНО** |

### 307.1. Что остаётся внешними gate после adjudication

После v1.1 у дизайнера/разработчика не остаётся 18 свободных commercial defaults. Остаются только operational/legal implementation gates:

1. **Legal / tax gate:** jurisdiction-specific tax, refund/cancellation and contract language.
2. **Payment operations gate:** real invoice/payment-confirmation process; embedded processor optional later.
3. **Engineering capacity gate:** upload/document safety caps and measured delivery capacity.
4. **Individual-module gate:** `31` source/legal/calibration readiness before $5k named-leader module can be offered.
5. **Procurement artifact gate:** only real current security/vendor documents may enter buyer package.

### 307.2. Owner acceptance boundary

**Owner acceptance состоялся 2026-09-16.**

С этого момента `33 v1.1` является **controlling commercial design contract** для платного объёма, цены и коммерческого перехода MergeVue.

Все 18 dispositions §307 приняты как controlling commercial target policy. Это **не** означает автоматически:

- legal sign-off;
- tax registration/computation readiness;
- payment integration completion;
- named-leader methodology release eligibility;
- standard SLA;
- availability outside the U.S.;
- existence of security certifications not actually held.

После Owner acceptance остаются только внешние implementation/release gates, уже перечисленные в §307.1:

1. **Legal / tax gate** — jurisdiction-specific tax, refund/cancellation и contract language.
2. **Payment operations gate** — реальный invoice/payment-confirmation process; embedded processor остаётся optional later.
3. **Engineering capacity gate** — upload/document safety caps и измеренная delivery capacity.
4. **Individual-module gate** — readiness по `31` до предложения named-leader module.
5. **Procurement artifact gate** — только реально существующие current security/vendor documents.

До закрытия применимого gate продукт использует указанное в этом контракте fail-closed поведение и не заполняет пробел sales/design defaults.

Принятие `33 v1.1` также **не является implementation authorization само по себе**: изменение `main`, payment operations, legal/tax deployment и запуск конкретных commercial surfaces требуют своих downstream acts.

---

## 308. Финальная формула

> **MergeVue не продаёт тариф. MergeVue определяет, какой минимальный объём доказательной проверки нужен для конкретного решения по сделке.**

> **Цена появляется после того, как пользователь понимает нерешённый вопрос, его материальность, необходимые доказательства, достаточную глубину анализа и ограничения результата.**

> **Более высокая цена не покупает более уверенный ответ. Она может купить более глубокий и более строго проверенный процесс — но evidence по-прежнему имеет право закончиться `Cannot determine`.**

> **Если меньший объём достаточен, MergeVue должен показать меньший объём. Если платный анализ не нужен, MergeVue должен сказать об этом.**

> **Коммерческая честность — часть доверия к аналитической системе.**
