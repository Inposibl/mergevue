# 18. Контракт входа в сделку и запуска публичного анализа MergeVue

**Статус документа:** управляющий постраничный и flow-контракт / public deal-entry authority  
**Файл:** `18_MERGEVUE_DEAL_ENTRY_AND_PUBLIC_ANALYSIS_START_CONTRACT.md`  
**Версия:** 1.0  
**Дата:** 16 сентября 2026 года  
**Язык документации:** русский  
**Язык коммерческого интерфейса:** только American English  
**Рынок первой версии:** США  
**Основной route:** `/start-diagnostic/deal-context`  
**Существующий pre-flight route:** `/start-diagnostic/before-you-begin`  
**Главный принцип:** пользователь начинает с двух компаний; MergeVue должен создать первую публичную ценность до account, payment, private documents и canonical questionnaires  
**Ключевые инварианты:** `DEAL FIRST`, `VALUE BEFORE TRUST ESCALATION`, `REUSE ROUTE ≠ DESTROY DOWNSTREAM LOGIC`, `CANONICAL QUESTIONS UNTOUCHABLE`, `NO FAKE ANALYSIS`, `FAIL CLOSED`

---

# 0. Назначение

Этот документ определяет поверхность, на которую должны вести публичные CTA:

`Analyze a deal`

из:

- Home;
- Interaction Environments;
- Historical Case Studies;
- Historical Case Detail;
- Methodology;
- других публичных informational surfaces.

Эта поверхность является **началом реального пользовательского продукта**, а не маркетинговой формой.

Её задача:

1. принять минимальную идентичность сделки;
2. разрешить неоднозначность компаний;
3. запустить публичный analysis pipeline;
4. показать пользователю реальный публичный результат;
5. только затем предложить более глубокие данные, account или paid analysis.

---

# 1. Главная продуктовая последовательность

Target journey:

```text
Analyze a deal
→ Acquirer + Target
→ entity resolution
→ minimal disambiguation only if required
→ public-source research
→ public analysis
→ public result
→ optional account / deeper observations / paid evidence
```

Запрещённый journey:

```text
Analyze a deal
→ signup
→ role questionnaire
→ 67 questions
→ private documents
→ payment
→ value
```

---

# 2. Existing-product-first

Новый route не создаётся автоматически.

Current `main` уже содержит:

`/start-diagnostic/deal-context`

и существующую deal-context / acquirer-track architecture.

Следовательно:

> **ADAPT EXISTING ROUTE BEFORE ADDING A NEW ROUTE.**

Отдельный `/analyze`, `/deal-analysis` или аналогичный route требует отдельного route decision.

---

# 3. Фактическая current routing architecture

Current `screenRegistry.js` содержит:

- `/start-diagnostic/before-you-begin`;
- `/start-diagnostic/deal-context`;
- `/start-diagnostic/deal-context/refine-evidence-quality`;
- `/start-diagnostic/deal-context/details`;
- затем downstream diagnostic / questionnaire routes.

Также:

`/start-diagnostic`

и legacy `/screen-2-role`

направляются к:

`/start-diagnostic/before-you-begin`.

Эту совместимость нельзя ломать без migration plan.

---

# 4. Current `/start-diagnostic/deal-context` is not yet the target public entry

Существующий deal-context flow ожидает больше информации, чем требуется для первого публичного value event.

В текущей flow architecture существуют:

- `acquirerName`;
- `targetName`;
- `dealType`;
- `respondentSide`;
- respondent role;
- seniority;
- function;
- access level;
- acquisition motive;
- competitor-preservation state;
- transaction responsibility;
- firm tenure;
- planned integration pace;
- enterprise value;
- currency;
- economics status;
- key personnel at risk;
- compensation assumptions;
- дополнительные context fields.

Эта архитектура полезна downstream.

Но:

> она не должна вся становиться обязательным входным барьером перед public analysis.

---

# 5. Минимальная public-entry identity

Первый обязательный input:

1. `Acquirer`
2. `Target`

И всё.

Рабочие labels:

`Acquirer`

`Target`

Placeholders:

`Company name`

не должны использовать fake example companies как будто они обязательны.

---

# 6. Почему именно два company names

Публичный пользователь должен сначала проверить продукт на реальной сделке.

Два названия:

- легко понять;
- легко предоставить;
- не являются чувствительным внутренним материалом;
- позволяют начать public-source research;
- создают natural bridge к value.

Все дополнительные данные должны иметь отдельную причину.

---

# 7. Acquirer / Target semantics

Поля не равнозначны.

Нужно сохранять role:

- Acquirer;
- Target.

Нельзя визуально превратить их в:

`Company 1`

`Company 2`

если analysis зависит от transaction side.

---

# 8. Swap control

Допустим compact action:

`Swap`

если пользователь перепутал стороны.

Но:

- swap must actually exchange values;
- analytics / state must update consistently;
- downstream role semantics must follow.

Не использовать только decorative icon без accessible label.

---

# 9. Entity resolution is mandatory before analysis

Строка компании — не достаточно надежная identity.

Перед public analysis система должна определить:

- конкретную legal / public entity;
- возможную transaction context;
- ambiguity;
- duplicate names.

UI должен отражать resolution state.

---

# 10. Entity-resolution states

Target UI states:

## Empty

ничего не введено.

## Editing

пользователь вводит company name.

## Resolving

`Finding the company...`

## Resolved

показывается canonical company identity.

## Ambiguous

несколько правдоподобных entities.

## Not found

company не удалось идентифицировать.

## Unsupported / insufficient public identity

система нашла entity, но не может безопасно начать analysis.

## Service unavailable

resolution temporarily unavailable.

Эти состояния не должны смешиваться.

---

# 11. Resolved-company presentation

После resolution можно показать:

- canonical company name;
- country / exchange / identifier, если это реально помогает disambiguation;
- concise identity cue.

Не добавлять:

- logo automatically;
- employee count;
- market cap;
- industry;
- headquarters;

если это не нужно для identity confirmation.

---

# 12. Ambiguity must not be guessed

Если введено:

`Apple`

система не должна молча выбирать entity.

Она показывает bounded choices.

Working copy:

`Which company do you mean?`

Пользователь подтверждает.

---

# 13. No silent company substitution

Если user typed one entity and resolver selected another:

- selected identity must be visible;
- user can correct it before analysis.

No hidden normalization that changes case geometry.

---

# 14. Acquirer ≠ Target invariant

Нельзя продолжать, если resolved parties одинаковы, кроме специально авторизованного edge case.

Error:

`Acquirer and target must be different companies.`

---

# 15. Deal-context enrichment is progressive

После resolution system may request **only the smallest additional context actually required**.

Examples:

- transaction announcement date if several transactions exist between same parties;
- which transaction if multiple historic deals;
- whether proposed / announced / completed if this changes source cutoff;
- minimal context to disambiguate a deal.

Не спрашивать заранее всё, что когда-либо понадобится paid workflow.

---

# 16. `dealType` is no longer first-value prerequisite by default

Current flow requires `dealType` as part of deal identity.

Target product should first test whether public analysis can begin from resolved Acquirer + Target.

Therefore:

> `dealType` moves from unconditional first-screen requirement to **conditional enrichment**, unless runtime proves it is technically indispensable before any public-source analysis.

This is a product-flow change, not a methodology mutation.

---

# 17. `respondentSide` is not a public-analysis prerequisite

Current canonical deal-context validation includes:

`respondentSide`.

But public-source deal analysis does not need to know the user's side before it can provide initial value.

Therefore:

> do not ask `Who are you in this deal?` before public result unless a specific function requires it.

Respondent context belongs to later structured-observation workflows.

---

# 18. Respondent role / seniority / function / access

Current architecture preserves these fields.

They remain useful for:

- evidence authority;
- respondent context;
- paid / structured observations.

They should **not** be deleted.

But:

> they move later in trust progression.

---

# 19. Acquisition motive

Current flow derives / asks acquisition motive.

This can materially affect analysis.

However:

- it may be publicly inferable;
- it may be unknown;
- it may not be needed to start collection.

Target:

> public analysis starts first; acquisition motive is requested later if it materially changes interpretation and cannot be responsibly inferred from public sources.

---

# 20. Do not invent motive from weak evidence

If motive uncertain:

show:

`Acquisition motive not yet determined`

or ask user later.

Do not force one of legacy four motives merely to satisfy old route validation.

---

# 21. Competitor-preservation branch

Existing special logic for competitor absorption / neutralization should remain downstream if still controlling.

But it must not clutter universal first entry.

Only show when deal context makes it relevant.

---

# 22. Transaction responsibility / tenure

Fields such as:

- transaction responsibility;
- firm tenure;

are respondent-evidence metadata.

They must not appear before public analysis.

They belong to later structured input where they affect evidence weighting.

---

# 23. Integration timeline

Planned integration pace may materially affect risk interpretation.

But at first entry:

> not required.

It may be requested:

- when moving from public evidence to internal scenario;
- if user asks for timing-specific forecast;
- within paid workflow.

---

# 24. Deal economics

Current architecture supports:

- enterprise value;
- currency;
- status;
- compensation assumptions.

These are not first-step requirements.

Public deal analysis must not be gated by economics.

Economic exposure is deeper analysis.

---

# 25. Currency behavior

When economics are later requested:

- existing single-currency validation must remain;
- no hidden FX conversion;
- clear status: confirmed / estimated / not available.

This document does not authorize changing economics calculation.

---

# 26. `Before You Begin` — current asset

Current route:

`/start-diagnostic/before-you-begin`

already performs a useful trust function:

- sets expectations;
- distinguishes preview from valuation;
- distinguishes preview from final deal verdict;
- explains limitations;
- explains workforce / employment boundary.

This function should be preserved.

---

# 27. `Before You Begin` should no longer block first value

Target:

Primary CTA:

`Analyze a deal`

→ direct to minimal deal entry.

`Before You Begin` may survive as:

- optional `What to expect`;
- contextual disclosure before analysis starts;
- compact information panel;
- backward-compatible legacy route.

It should not require a confirmation click before two company names unless legal / safety reason requires it.

---

# 28. No account before public analysis

Public entry must not require:

- account;
- email;
- phone;
- firm;
- title;
- payment.

Account may be offered when user wants to:

- save the deal;
- return later;
- invite respondents;
- add internal observations;
- unlock paid/private analysis.

---

# 29. No private documents before public analysis

Do not request:

- CIM;
- data room;
- board deck;
- employee files;
- integration plan;
- compensation data.

FREE/public layer operates without private documents.

---

# 30. No canonical questionnaire before first public result

This is critical.

`Analyze a deal` must not silently mean:

> start the 67-question diagnostic.

The public journey first produces a deal analysis from public evidence.

Canonical instruments are a later evidence channel.

---

# 31. Canonical questionnaire invariant

When later questionnaires are reached:

- no question text change;
- no order change;
- no option change;
- no option reorder;
- no merge / split;
- no “simplified public version” made from canonical questions.

This entry redesign does not touch them.

---

# 32. Public research start

Once both companies are resolved and minimal deal ambiguity is closed:

primary action:

`Analyze this deal`

or simply:

`Analyze deal`

Preferred consistency with site:

`Analyze a deal`

for entry CTA;

after companies selected:

`Analyze this deal`

is acceptable.

---

# 33. Do not promise impossible speed

No:

`Instant analysis`

unless measured and reliably true.

No:

`Results in 30 seconds`

without performance authority.

Safe:

`Researching public evidence...`

---

# 34. Real analysis state

After submit, product must enter a real analysis state.

Not acceptable production behavior:

`Companies resolved. Public-source research would begin here.`

That is prototype text, not product.

---

# 35. Public-analysis state machine

Minimum:

## Ready

companies resolved.

## Starting

request accepted.

## Researching

public evidence collection / analysis underway.

## Partial evidence

some sources available, coverage incomplete.

## Result ready

public result may be rendered.

## Cannot determine

insufficient evidence for material determination.

## Temporarily unavailable

service failure.

These are conceptual UI states; exact backend state names may differ.

---

# 36. `Cannot determine` is a valid result

If public evidence is insufficient:

> do not force a score or environment.

Public value may be:

- what is known;
- what is unknown;
- why determination is blocked;
- what evidence would resolve it.

---

# 37. No spinner-only long wait

If analysis takes material time:

show meaningful progress categories, only if they correspond to real backend stages.

Examples:

`Resolving the transaction`

`Reviewing public evidence`

`Checking contradictions`

Do not fake:

`87% complete`

if no real progress metric exists.

---

# 38. No fake source counters

Do not animate:

`Scanning 12,483 sources`

unless actual and useful.

Do not show meaningless source velocity.

---

# 39. Analysis may outlive request

If public research takes longer:

allow user to remain on page.

Do not require email just to receive result unless async architecture genuinely requires delivery.

If async save is necessary:

the trust escalation must be explained.

---

# 40. Public result is a separate surface

This contract controls **entry and analysis start**, not the full public result design.

However transition must land on a real public-result surface.

No dead-end prototype panel.

---

# 41. Result route decision

Do not invent a new result route in this contract.

Use:

- existing public report / reveal route if semantically suitable;
- or create new route only under a separate report contract / route decision.

The entry contract defines required handoff data, not final route name.

---

# 42. Minimum handoff from entry to analysis

Conceptually:

```text
acquirerEntityId
acquirerDisplayName
targetEntityId
targetDisplayName
transactionIdentity?    // if needed
userProvidedContext?    // only minimal
analysisRequestId
```

Do not include fake fields just because old form has them.

---

# 43. Preserve downstream legacy fields

Old fields may remain in session schema.

They can be:

- null;
- unknown;
- not requested yet.

Do not delete schema fields solely because first screen no longer asks them.

---

# 44. Missing ≠ false

For deferred fields:

- missing;
- unknown;
- not yet requested

must not become:

- zero;
- no;
- false;
- negative evidence.

This is especially important for evidence and scoring.

---

# 45. Public-source analysis must not consume private-document fields

The FREE/public path must remain cleanly separable from paid private evidence.

No hidden dependency on:

- uploaded documents;
- closed data room;
- analyst manual input.

If public analysis requires those:

> fail closed / show limitation rather than silently route to paid data.

---

# 46. Human analyst boundary

FREE/public analysis should not promise:

`Reviewed by an expert`

unless actual current architecture includes one.

Human review belongs to later paid / exception paths.

---

# 47. AI positioning

Do not place:

`AI-powered deal analysis`

in hero as primary value proposition.

The entry surface is about:

- the deal;
- evidence;
- result.

Technology is secondary.

---

# 48. Recommended screen composition

Preserve current compact flow language.

Target:

```text
Eyebrow
H1
Short explanation

Acquirer field
Target field
[Swap]

Resolution confirmations / ambiguity controls

Primary CTA

Trust note:
No account required.
Uses public sources to begin.
Private documents are not required.
```

No extra marketing blocks.

---

# 49. Hero target

Eyebrow candidate:

`Public deal analysis`

H1:

`Which deal do you want to analyze?`

Supporting copy:

`Start with the acquirer and target. MergeVue will use public evidence to identify which organizational assumptions deserve further diligence.`

---

# 50. Field labels

Preferred:

`Acquirer`

`Target`

Helper text should be minimal.

Do not write:

`Buyer / Company A`

unless disambiguation requires.

---

# 51. Primary CTA state

Before both resolved:

disabled.

After both resolved:

enabled.

CTA copy:

`Analyze this deal`

During request:

`Starting analysis...`

Do not use:

`Submit`.

---

# 52. Back / cancel

Since this is first public step:

Back can safely return to Home.

Do not show:

`Progress will be lost`

before any meaningful work exists.

Existing global warning should not be applied mechanically to empty entry.

---

# 53. Preserve entered values

If user opens ambiguity and returns:

do not erase names.

If service error:

keep inputs.

If navigates back from first result within same session:

preserve deal identity where appropriate.

---

# 54. Browser refresh

Target product should preserve enough non-sensitive state to avoid needless retyping where technically appropriate.

But:

- do not leak private data;
- do not persist sensitive future questionnaire answers in unsafe client storage.

This contract covers company identity only.

---

# 55. Duplicate analysis

If same public deal is re-entered:

system may use cached/public-safe research if architecture authorizes.

Do not tell user:

`Already analyzed`

unless actual result exists and is current.

---

# 56. Historical vs current deal

If companies correspond to an old completed transaction:

public analysis may still be possible.

But product must distinguish:

- historical replay;
- current / prospective analysis.

Do not route a current-user query silently into historical case-study content.

---

# 57. Existing published case shortcut

If entered pair matches a published historical case:

optional secondary notice:

`A published historical case study is available.`

But primary requested action remains user analysis.

Do not substitute case study automatically.

---

# 58. Multiple deals between same parties

If pair has multiple transactions:

ask:

`Which transaction do you want to analyze?`

Options must be based on real transaction records.

Do not guess by latest date unless explicitly safe.

---

# 59. No transaction found

Company pair can still be interesting if deal is proposed / confidential / user-specified.

Do not require public announcement in all cases.

If public deal identity unavailable:

ask minimum context.

If evidence cannot support analysis:

say so.

---

# 60. Confidential / unannounced deal

Public layer must be careful.

If user enters two public company names but transaction is confidential:

public-source system should not publish or infer that a transaction exists to other users.

No public indexing of user-entered deal pair.

The input is session context, not a public disclosure.

---

# 61. Privacy statement

Near entry:

`Company names are used to start this analysis. No private documents are required.`

Do not make broad privacy promises beyond actual product policy.

---

# 62. No company endorsement implication

Resolver suggestions must not imply company participation in MergeVue.

No logos by default.

---

# 63. Validation errors

Examples:

`Enter the acquirer.`

`Enter the target.`

`Acquirer and target must be different companies.`

`We found more than one company with that name.`

`We could not identify that company.`

Use plain language.

---

# 64. Service errors

Resolution unavailable:

`Company lookup is temporarily unavailable. Try again.`

Analysis unavailable:

`Deal analysis is temporarily unavailable.`

Do not erase fields.

---

# 65. Fail-closed principle

If entity identity cannot be safely resolved:

> no analysis.

If analysis backend returns incomplete authoritative state:

> no invented report.

If source evidence is insufficient:

> `Cannot determine` / limitations.

---

# 66. Current route compatibility

Keep:

`/start-diagnostic/deal-context`

for first deal-entry surface.

Legacy links to:

`/start-diagnostic`

can continue to route through current compatibility layer.

But new `Analyze a deal` CTAs should target the actual minimal deal-entry experience.

---

# 67. `Before You Begin` compatibility

Existing route should remain functional.

Possible target role:

`What to expect`

It may link:

`Start with a deal`

→ `/start-diagnostic/deal-context`.

Do not delete until all inbound links are audited.

---

# 68. Old acquisition-motive screen

Current component name:

`AcquisitionMotiveScreen`

may no longer match first-screen function.

Refactor component naming is allowed if useful.

But:

- preserve underlying downstream motive logic;
- no semantic changes to canonical data merely for naming cleanup.

---

# 69. Existing validation refactor

Current `validateDealStartContext` combines:

- identity;
- motive.

Target architecture likely needs separation:

```text
validatePublicDealEntry
validateDealContextEnrichment
validateFullDealContext
```

Exact implementation is engineering work.

UX invariant:

> minimal public entry validation must not require all downstream context.

---

# 70. Existing full validation remains useful

`validateDealContext` currently combines:

- start context;
- transaction details;
- economics.

Do not weaken full paid/downstream validation just because public entry is smaller.

Instead:

> add a smaller earlier validation layer.

---

# 71. Route progression must be explicit

Do not let `nextRouteForDealStart` mechanically route public user into old respondent/questionnaire flow after names.

New target transition:

```text
minimal deal entry
→ public research
→ public result
```

Then optional deeper journey.

---

# 72. Public result first, questionnaires later

After public result, possible CTA:

`Add internal evidence`

Then system can start structured observation / canonical instruments.

This is the correct trust progression.

---

# 73. Account escalation

After result:

`Save this deal`

may require account.

Copy should explain benefit.

Not:

`Create an account to see your results.`

---

# 74. Paid escalation

After public result, if relevant:

`Go deeper with private evidence`

This can lead to paid qualification.

Not before public value.

---

# 75. 42Q is not part of deal entry

Do not mention 42Q on first screen.

It becomes relevant only if later user requests:

> a specific-leader forecast.

---

# 76. No Economic Exposure before context exists

Do not ask:

`How much value is at risk?`

at entry.

Economic exposure is computed / structured later after deal thesis assumptions.

---

# 77. Visual canon

Reuse current flow visual language where it remains coherent:

- light background;
- navy;
- white form surfaces;
- thin borders;
- 8px radius;
- clear labels;
- compact step density;
- Inter / system sans.

Do not make entry look like a different product.

---

# 78. Public shell choice

Because this is product interaction rather than marketing reading:

it may use the current flow shell rather than full public marketing shell.

But user must still understand:

- MergeVue;
- where they are;
- how to return.

Do not introduce a third unrelated shell.

---

# 79. Progress indicator

At first public entry:

do not show:

`Step 1 of 12`

if user has not consented to a 12-step diagnostic.

This creates excessive perceived commitment.

Prefer no progress or:

`Public analysis`

as current phase.

---

# 80. Questionnaire progress later

When user explicitly enters canonical questionnaire:

progress may reflect actual fixed questionnaire sequence.

But this contract does not modify it.

---

# 81. Accessibility

Target:

WCAG 2.2 AA.

Requirements:

- labels bound to fields;
- errors programmatically associated;
- autocomplete only where appropriate;
- keyboard-operable suggestions;
- focus moved responsibly after ambiguous resolution;
- loading state announced;
- no color-only resolved/error state;
- touch targets;
- 320px reflow.

---

# 82. Autocomplete / combobox behavior

If entity suggestions exist:

implement as accessible combobox pattern.

Must support:

- keyboard arrows;
- Enter selection;
- Escape;
- screen-reader announcement;
- visible selected state.

Do not create inaccessible custom dropdown.

---

# 83. Mobile layout

One column:

1. hero;
2. Acquirer;
3. Target;
4. resolution;
5. CTA;
6. trust note.

Swap action positioned accessibly.

No side-by-side text inputs on narrow width.

---

# 84. Desktop layout

Two fields may be side-by-side if:

- labels remain clear;
- ambiguity dropdowns fit;
- keyboard order remains Acquirer → Target → CTA.

Do not sacrifice error readability for compactness.

---

# 85. Analytics

Useful funnel:

```text
deal_entry_viewed
acquirer_entered
acquirer_resolved
target_entered
target_resolved
deal_analysis_started
public_result_ready
public_result_viewed
```

Do not log raw private future questionnaire answers into generic marketing analytics.

---

# 86. Resolution analytics privacy

Prefer:

- resolution success/failure event;
- entity identifiers only under approved analytics policy.

Do not expose confidential deal pair to third-party advertising analytics.

---

# 87. Success metric

The surface succeeds when:

```text
user enters a real deal
→ companies are resolved
→ public analysis starts
→ useful public result is delivered
```

Not merely:

> form submitted.

---

# 88. Performance metric

Track:

- entity resolution latency;
- analysis start failures;
- result completion;
- abandonment before CTA.

Use data to improve entry.

Do not optimize by adding more persuasive claims.

---

# 89. Existing fields decision matrix

| Existing field / block | First public entry | Later |
|---|---|---|
| Acquirer name | **REQUIRED** | preserved |
| Target name | **REQUIRED** | preserved |
| Deal type | **DEFER / conditional** | yes |
| Respondent side | **DEFER** | yes |
| Respondent role | **DEFER** | yes |
| Seniority | **DEFER** | yes |
| Function | **DEFER** | yes |
| Access level | **DEFER** | yes |
| Acquisition motive | **DEFER / infer or ask if needed** | yes |
| Competitor preservation | **CONDITIONAL** | yes |
| Transaction responsibility | **DEFER** | yes |
| Firm tenure | **DEFER** | yes |
| Integration pace | **DEFER** | yes |
| Enterprise value | **DEFER** | yes |
| Compensation assumptions | **DEFER** | yes |
| Private documents | **NOT IN PUBLIC ENTRY** | paid |
| Canonical questionnaires | **NOT BEFORE PUBLIC RESULT** | later evidence |
| 42Q | **NOT HERE** | specific-leader forecast only |

---

# 90. Existing route decision matrix

| Route | Decision |
|---|---|
| `/start-diagnostic/deal-context` | **KEEP + ADAPT TO MINIMAL DEAL ENTRY** |
| `/start-diagnostic/before-you-begin` | **KEEP / REPOSITION AS OPTIONAL PREFLIGHT** |
| `/start-diagnostic` | **KEEP COMPATIBILITY / REVIEW REDIRECT** |
| `/screen-2-role` | **LEGACY COMPATIBILITY; DO NOT USE AS NEW ENTRY** |
| `/start-diagnostic/deal-context/details` | **KEEP DOWNSTREAM** |
| `refine-evidence-quality` | **KEEP DOWNSTREAM IF STILL CURRENT** |
| new `/analyze` route | **DO NOT ADD WITHOUT ROUTE DECISION** |

---

# 91. Existing visual blocks

Current deal-context styles already provide:

- `deal-context-screen`;
- compact flow shell;
- intro;
- form patterns;
- buttons;
- validation language.

Reuse before creating new component family.

---

# 92. Prototype lesson from previous agent work

A previous prototype correctly showed:

- two company fields.

But after submit it displayed:

`Companies resolved. Public-source research would begin here.`

This is explicitly classified:

> **PROTOTYPE ONLY — PRODUCTION FAIL.**

The next implementation must call the real analysis path.

---

# 93. No fake success state

Do not show:

`Companies resolved`

unless both actually resolved.

Do not show:

`Analysis ready`

before report authority exists.

UI state must be grounded in backend state.

---

# 94. Public research limitations

If only one company has adequate public evidence:

result can explain asymmetry.

Do not invent symmetry.

If target is private / small:

public evidence may be limited.

This is not an error; it is a limitation.

---

# 95. Company-name entry is not evidence classification

The names are identity context.

Do not treat user-provided company names as evidence about organizational environment.

---

# 96. User-supplied transaction context must be labeled

If user later supplies:

- deal motive;
- integration plan;
- private assumption;

system should distinguish user-provided context from public evidence.

This prevents provenance blur.

---

# 97. Public data source boundary

Entry page may say:

`MergeVue starts with publicly available evidence.`

Do not list provider names or scraping architecture.

---

# 98. Security / abuse boundary

The entry surface should reject malformed / excessive input.

Do not allow company fields to become arbitrary prompt boxes.

They are entity names, not freeform research instructions.

---

# 99. No prompt injection surface

Company-name fields should not accept long instructions as meaningful analysis prompt.

Backend should treat them as structured identity input.

UI may limit length reasonably.

---

# 100. International companies

Entity resolution should support U.S. product users analyzing non-U.S. companies where public evidence is available.

Do not infer first-version market = U.S. companies only.

Interface language is American English.

---

# 101. Private company handling

If company is private but identifiable:

allow resolution.

If public evidence insufficient:

show limitation.

Do not force public ticker.

---

# 102. Subsidiary handling

If user enters subsidiary:

resolver should preserve correct entity level.

Do not silently replace with parent if transaction side is subsidiary.

Offer clarification if necessary.

---

# 103. Name changes / historical entities

Historical company names may differ.

Resolver should be time-aware where feasible.

Do not rewrite historical party name into current brand if that changes transaction identity.

---

# 104. M&A status

First entry should not require:

- proposed;
- signed;
- closed;

unless needed.

If current analysis depends on whether outcome is already known:

ask at the point of ambiguity.

---

# 105. Current / historical separation

If system knows transaction is old and outcome public:

public live analysis and historical case study must remain distinct products.

A historical analysis request should not silently use post-outcome evidence for a purported pre-event view.

---

# 106. Trust note target copy

Working:

`Start with public information. No account, payment, or private documents are required to begin.`

This is concise and aligned with trust progression.

---

# 107. What not to say

Avoid:

- `100% confidential` unless policy authority;
- `We never store data` unless true;
- `Instant`;
- `AI research`;
- `No risk`;
- `Guaranteed`;
- `Free forever`.

---

# 108. Empty state

H1 and two fields.

No tutorial carousel.

No sample dashboard.

No pre-filled fake deal unless explicit demo mode exists.

---

# 109. Demo deal mode

If future product offers demo:

must be explicit:

`Try a historical example`

and use a real public case.

Do not prepopulate fields in normal entry.

---

# 110. Error recovery

Entity error:

edit field.

Analysis error:

retry.

No need to restart entire session.

---

# 111. Session boundary

Before account:

anonymous session may hold public analysis state.

Do not require user identity.

When account created later:

deal may be attached to authenticated workspace through a governed migration.

---

# 112. Workspace handoff

After save/account:

public analysis can become a deal workspace.

This document does not define workspace layout.

It requires preserving:

- resolved party identity;
- public analysis provenance;
- user-provided minimal context.

---

# 113. No re-analysis on account creation

Creating account should not discard already generated public result or force user to repeat entry.

Trust escalation should preserve value.

---

# 114. Data ownership wording

Do not make legal claims in entry UI.

Privacy / terms surfaces handle legal language.

Entry copy stays operational.

---

# 115. `Before You Begin` target adaptation

Retain useful concepts:

- public preview limits;
- not valuation;
- not final deal recommendation;
- workforce boundary.

Potential presentation:

collapsible:

`What this analysis can and cannot tell you`

available from entry.

Not mandatory modal by default.

---

# 116. Workforce / employment boundary

Public analysis must not position outputs as automated employment decisions.

If later person-level layer exists:

separate governed flow.

No leader risk scoring on entry.

---

# 117. Commercial escalation must not contaminate result

Do not insert:

`Upgrade now`

while public research is still running.

First finish available public value.

Then offer deeper path.

---

# 118. Accessibility acceptance

Entry fails if:

- placeholder is used instead of label;
- suggestion dropdown cannot use keyboard;
- ambiguity cannot be resolved with screen reader;
- disabled CTA has no explanation;
- errors disappear on reflow;
- mobile keyboard obscures action permanently.

---

# 119. Block-preservation matrix — mandatory

| Current block | LIVE | MAIN | Current purpose | Defect | Decision |
|---|---|---|---|---|---|
| Before You Begin | | | | | |
| Deal Context intro | | | | | |
| Acquirer input | | | | | |
| Target input | | | | | |
| Deal type | | | | | |
| Respondent side | | | | | |
| Acquisition motive | | | | | |
| Transaction details | | | | | |
| Economics | | | | | |
| Primary action | | | | | |

---

# 120. WHAT WAS INTENTIONALLY PRESERVED

Before merge list:

- existing `/start-diagnostic/deal-context` route;
- existing session model;
- downstream deal-context fields;
- acquisition-motive logic;
- respondent metadata logic;
- economics validation;
- existing style lineage;
- `Before You Begin` information asset;
- canonical questionnaire flows.

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
Deal start requires Acquirer + Target + Deal Type + Respondent Side
→ first public entry requires Acquirer + Target only; other fields deferred
→ current flow requests trust and context before delivering public value
→ progressive-disclosure contract + deal-first product journey
```

---

# 122. Acceptance criteria

Entry flow passes only if:

1. all `Analyze a deal` public CTAs land on real entry;
2. existing route reused unless new route separately authorized;
3. first required inputs are Acquirer + Target;
4. parties are entity-resolved;
5. ambiguity never guessed silently;
6. same-party invalid state blocked;
7. extra context requested only when needed;
8. `dealType` not an unconditional public-entry blocker unless technically proven necessary;
9. respondent side deferred;
10. role / seniority / function / access deferred;
11. acquisition motive deferred/inferred/asked conditionally;
12. transaction details preserved downstream;
13. economics preserved downstream;
14. no account required;
15. no payment required;
16. no private docs required;
17. no canonical questionnaire before public result;
18. 42Q absent;
19. Before You Begin preserved but not mandatory friction by default;
20. primary CTA starts real analysis;
21. no prototype-only success panel;
22. real analysis states represented honestly;
23. no fake percentages or source counts;
24. cannot-determine supported;
25. service errors preserve input;
26. anonymous result can be delivered;
27. account escalation occurs after value;
28. paid escalation occurs after value;
29. missing deferred fields do not become negative evidence;
30. public/private data boundary preserved;
31. human review not falsely promised;
32. company names are not treated as environment evidence;
33. user-provided context retains provenance;
34. confidential pair is not publicly indexed;
35. real links / redirects preserved;
36. American English only;
37. accessible combobox behavior if suggestions exist;
38. WCAG 2.2 AA target maintained;
39. mobile is one-column and usable;
40. public result handoff is real and not a dead end.

---

# 123. Финальный принцип

> **The first question MergeVue asks a new user is not “Who are you?” or “Which questionnaire will you complete?” It is “Which deal do you want to analyze?”**

> **Start with the deal. Deliver public value. Ask for trust only when the next layer of value requires it.**

> **Do not delete the existing diagnostic architecture. Move it behind the public value event where it belongs.**
