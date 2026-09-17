# 13. Контракт функции «How MergeVue works»

**Статус документа:** управляющий функциональный контракт / отдельный route запрещён без explicit decision  
**Файл:** `13_MERGEVUE_HOW_IT_WORKS_PAGE_CONTRACT.md`  
**Версия:** 2.0  
**Дата:** 16 сентября 2026 года  
**Язык документации:** русский  
**Язык коммерческого интерфейса:** только American English  
**Рынок первой версии:** США  
**Главный принцип:** функция объяснения процесса обязательна; новая страница не обязательна  
**Ключевой инвариант:** `REUSE ROUTE ≠ REPLACE PAGE CONTENT`

---

# 0. Главный результат

В текущем `main` нет отдельного route:

`/how-it-works`

Но существуют:

- `/about-methodology`;
- `/about-methodology/overview`;
- `/start-diagnostic/before-you-begin`;
- `/environments`;
- `/case-studies`.

Следовательно:

> **NO ROUTE CREATION WITHOUT AN EXPLICIT ROUTE DECISION.**

И дополнительно:

> **REUSE ROUTE ≠ REPLACE PAGE CONTENT.**

Использовать существующий route не означает разрешение удалить его существующую функцию и содержание.

---

# 1. Почему этот документ называется `PAGE_CONTRACT`, хотя page может не существовать

Имя файла — организационное.

Оно обозначает product function:

`How MergeVue works`

но не создаёт физический route.

Допустимые реализации:

1. section внутри existing methodology surface;
2. section внутри methodology overview;
3. compact explanation на homepage;
4. updated `Before You Begin`;
5. отдельная page — только после route decision.

---

# 2. Обязательный audit до дизайна

Агент обязан изучить:

## LIVE

- current public navigation;
- current methodology page;
- current pre-flight;
- current diagnostic entry;
- user journey.

## MAIN

Минимально:

- `src/App.jsx`;
- `src/screenRegistry.js`;
- `src/styles.css`;
- methodology routes;
- `Before You Begin`;
- existing process components;
- current sidebar.

## CANON

- public shell grammar;
- report/process grammar;
- typography;
- surfaces;
- step/timeline patterns.

---

# 3. Обязательная route-decision запись

До отдельного route должен существовать artifact:

`HOW-IT-WORKS ROUTE DECISION`

с полями:

- live surfaces reviewed;
- main surfaces reviewed;
- existing content preserved;
- unmet user need;
- why existing surfaces cannot satisfy it;
- navigation impact;
- duplication risk;
- maintenance impact;
- final decision.

Без этого:

> `/how-it-works` запрещён.

---

# 4. Текущий `screenRegistry.js`

Текущий `main` определяет:

`/about-methodology`

title:

`The ST Framework`

`/about-methodology/overview`

title:

`Post-Deal Behavior Forecast Methodology Overview`

`/start-diagnostic/before-you-begin`

title:

`Before You Begin`

Отдельного `How It Works` route нет.

---

# 5. Текущая `About Methodology` — фактическое содержание

Существующая страница уже является полноценной surface.

Она содержит:

## Hero

H1:

`The Post-Deal Behavior Forecast Methodology`

Три объясняющих абзаца:

- interaction environment как diagnostic unit;
- девять operating environments;
- time-bound forecast;
- falsifiability / sealed before close / verified afterwards.

Ссылка:

`Read the methodology paper`

→ `/about-methodology/overview`

## ECS section

Heading:

`The Environment Compatibility Score (ECS)`

Содержит:

- 17 resources;
- pairwise comparison explanation;
- ECS;
- score-band visualization;
- methodology note.

## Nine Environments section

Heading:

`The 9 Interaction Environments`

Содержит:

- environment cards;
- links to environment detail pages.

Следовательно:

> `/about-methodology` уже имеет самостоятельную функцию и не является пустым контейнером.

---

# 6. Текущий `Methodology Overview` — фактическое содержание

Отдельная surface содержит шесть разделов:

1. `Purpose`;
2. `Evidence base`;
3. `The analyst gate`;
4. `Environment Compatibility Score, conceptually`;
5. `Calibration`;
6. `Access`.

Эта surface также не является свободным контейнером.

---

# 7. Текущий `Before You Begin` — фактическая функция

Существующий pre-flight уже объясняет:

- что FREE preview выдаёт;
- что не выдаёт;
- ограничения;
- valuation boundary;
- final-deal-verdict boundary;
- workforce/employment boundary;
- зачем нужен paid workflow;
- confirmation before continuation.

Это важный reusable process/trust pattern.

Но он относится к старому diagnostic-first flow.

---

# 8. Новый инвариант — REUSE ROUTE ≠ REPLACE PAGE CONTENT

Если агент решает использовать `/about-methodology` для функции `How MergeVue works`, он обязан:

1. сначала зафиксировать все существующие blocks;
2. классифицировать каждый `KEEP / ADAPT / MOVE / REPLACE / REMOVE`;
3. доказать необходимость любого удаления;
4. не заменять всю страницу новым process stepper;
5. не превращать methodology route в другую product function молча.

Просто сохранить URL недостаточно.

---

# 9. Обязательный block-preservation audit

Перед изменением `/about-methodology` заполнить:

| Existing block | Current purpose | Current defects | Decision | Authority |
|---|---|---|---|---|
| Methodology hero | | | | |
| Interaction-environment explanation | | | | |
| Falsifiability explanation | | | | |
| Methodology paper link | | | | |
| ECS section | | | | |
| 17-resource explanation | | | | |
| ECS bands | | | | |
| ECS caveat | | | | |
| 9 environments section | | | | |
| Environment links | | | | |

Нельзя удалить весь набор одной строкой `REPLACE PAGE`.

---

# 10. Важное уточнение: existing content ≠ automatically correct

Block-preservation audit не означает, что весь current methodology copy остаётся навсегда.

Некоторые current claims требуют отдельной проверки по `08`, например:

- `per-leader forecast` без явной 42Q boundary;
- сильные ECS score-band economic mappings;
- calibration claims;
- causal language.

Но:

> эти изменения должны быть сделаны в dedicated methodology contract, а не скрыто внутри `How MergeVue works`.

Следующий methodology contract имеет право исправить конкретные defects.

`13` не имеет права использовать process-function как предлог удалить methodology.

---

# 11. Главный пользовательский вопрос

Функция отвечает:

> `What actually happens when I use MergeVue?`

Вторично:

> `What do I provide, what does MergeVue do, what do I receive, and when does the product ask for more sensitive data?`

---

# 12. Разница между surfaces

## Home

`Why should I care?`

## How MergeVue works

`What happens next?`

## Methodology

`Why does the system reason this way?`

## Methodology Overview

`What is the deeper epistemic / methodological structure?`

## Before You Begin

`What do I need to know before this specific flow?`

## Historical cases

`What did the method produce in historical cases?`

Эти функции связаны, но не взаимозаменяемы.

---

# 13. Trust level

Функция `How MergeVue works` — trust level 0.

Она не требует:

- account;
- email;
- private docs;
- 42Q;
- payment.

Она объясняет, когда такие escalations появляются позже.

---

# 14. Conceptual process — порядок является фиксированным

Если процесс показывается целиком:

1. `Start with a real deal`
2. `See what the public evidence supports`
3. `Add internal observations only where they matter`
4. `Use private evidence for deeper analysis`
5. `Add individual data only when needed`
6. `Lock the forecast`
7. `Verify what happened`

Это semantic sequence.

Дизайнер не имеет права менять его.

---

# 15. Process steps are ordered and complete

Запрещено:

- пропустить step;
- изменить numbering;
- поменять 5 и 6;
- убрать 4;
- объединить 3 и 4;
- показать 42Q раньше private evidence;
- выдать verification до locked forecast.

Если layout не помещает 7 steps:

> меняется layout.

---

# 16. Step 1 — semantic authority

## `Start with a real deal`

**You provide**

`The acquirer and target.`

**MergeVue does**

`Resolves the companies and begins public-source research.`

**You receive**

`A public analysis of material organizational questions.`

**Trust**

`No account required to begin.`

Нельзя добавлять:

- `instant`;
- `risk profile`;
- `score`;
- количество public data points.

---

# 17. Step 2 — semantic authority

## `See what the public evidence supports`

**You provide**

`Only minimal deal context if it is needed to disambiguate the transaction.`

**MergeVue does**

`Separates public facts, evidence, contradictions, and unresolved questions.`

**You receive**

`A structured view of what deserves further diligence.`

Не обещать paid-level forecast.

---

# 18. Step 3 — semantic authority

## `Add internal observations only where they matter`

**You provide**

`Structured observations or respondent input tied to unresolved questions.`

**MergeVue does**

`Uses the canonical organizational instruments without rewriting or reordering them.`

**You receive**

`A better-supported organizational reading.`

Не обещать:

`precise detailed forecasts`

на этой стадии.

---

# 19. Step 4 — semantic authority

## `Use private evidence for deeper analysis`

**You provide**

`Relevant private documents and deal context within the paid engagement.`

**MergeVue does**

`Reconciles public and private evidence and preserves contradictions.`

**You receive**

`A deeper analysis of the material deal assumptions.`

Этот step обязателен.

Он фиксирует:

> FREE observations → PAID private evidence.

---

# 20. Step 5 — semantic authority

## `Add individual data only when needed`

**Condition**

`A specific-leader forecast is requested.`

**You provide**

`42Q data for that specific leader.`

**MergeVue does**

`Uses the individual channel as an internal input to the behavioral forecast.`

**You receive**

`A role- and deal-specific behavioral forecast — not a personality label.`

---

# 21. 42Q trigger — абсолютное правило

Правильный trigger:

> **specific-leader forecast requested → 42Q required**

Неправильно:

- `critical risk detected → 42Q`;
- `deep analysis → 42Q`;
- `leader looks risky → 42Q`;
- `42Q optional enrichment`.

---

# 22. Step 6 — semantic authority

## `Lock the forecast`

**MergeVue does**

`Issues a time-bound forecast after the required quality gates.`

**You receive**

`A forecast with observable signs, timing, evidence basis, limitations, and conditions that would weaken or falsify it.`

---

# 23. Step 7 — semantic authority

## `Verify what happened`

**You provide**

`Outcome evidence when the forecast window is due.`

**MergeVue does**

`Compares the locked forecast with observed outcomes.`

**You receive**

`A recorded verification result.`

Verification states:

- `Confirmed`;
- `Partially confirmed`;
- `Not determinable`;
- `Missed`;
- `Falsified`.

---

# 24. Verification vocabulary нельзя заменять

Нельзя:

- сворачивать всё в `Accuracy`;
- использовать `accuracy report`;
- переименовывать `Missed`;
- переименовывать `Falsified`;
- считать `Not determinable` ошибкой.

---

# 25. Canonical-question invariant

Если surface упоминает questionnaires:

- вопросы не показываются в переработанном виде;
- порядок не меняется;
- options не меняются;
- gates не меняются.

Если нужен mockup:

- реальный canonical question без изменений;
- либо нейтральный декоративный placeholder, который не выглядит как настоящий question.

---

# 26. WHEN IN DOUBT, OMIT

Если агент не знает:

- capability;
- number of sources;
- processing time;
- precision;
- automation;
- data requirement;
- trigger;
- output;

он не заполняет пробел.

Он:

- использует semantic authority из этого файла;
- или опускает detail;
- или поднимает product question.

---

# 27. Запрещённые invented claims

Без direct authority запрещены:

- `thousands of public data points`;
- `instant risk profile`;
- `precise forecasts`;
- `motivational data`;
- `accuracy report`;
- `automated real-world comparison`;
- `critical risk triggers 42Q`;
- `specific teams or individuals critical to success` как универсальный output;
- новые timing promises.

---

# 28. Запрет старого brand drift

Не использовать самостоятельно:

`M&A Behavior Diagnostic`

как brand descriptor.

Technical legacy copy не становится новым positioning.

---

# 29. Route creation gate

Отдельный `/how-it-works` создаётся только если доказано хотя бы одно:

- users не понимают journey;
- methodology слишком техническая для process explanation;
- process insertion разрушает methodology;
- sales/procurement нужен standalone URL;
- users abandon entry из-за непонимания flow.

---

# 30. Предпочтительный порядок реализации

До нового route:

1. сохранить existing methodology content;
2. определить подходящее место для compact process section;
3. при необходимости добавить section в methodology overview;
4. обновить `Before You Begin` отдельно под deal-first flow;
5. проверить usability;
6. только затем решать вопрос нового route.

---

# 31. Возможный вариант внедрения в `/about-methodology`

Если audit подтверждает:

```text
Existing methodology hero
KEEP / ADAPT under methodology contract

Compact “How MergeVue works” process section
ADD

Existing ECS section
KEEP / ADAPT under methodology contract

Existing 9 environments section
KEEP

Existing methodology-paper link
KEEP
```

Главное:

> новый process block добавляется, а не уничтожает всю страницу.

---

# 32. Возможный вариант внедрения в `/about-methodology/overview`

Если process block лучше вписывается в deeper editorial structure:

```text
Overview hero
KEEP

New compact process overview
ADD

Existing 6 methodology sections
KEEP / ADAPT separately

Back link
KEEP
```

Route остаётся тем же.

---

# 33. Возможный вариант без methodology insertion

Если methodology должна остаться чисто теоретической:

- homepage secondary explanation;
- updated `Before You Begin`;
- methodology link;
- no standalone `How It Works`.

Функция всё равно может быть покрыта.

---

# 34. Grok test — фактическая реализация

В тестовом workspace агент:

- создал `/about-methodology` route;
- сделал его заголовком `How MergeVue works`;
- полностью отрисовал 7-step process;
- сохранил current public shell;
- использовал корректный порядок 1→7;
- добавил правильный step 4;
- использовал correct 42Q trigger.

Визуально это было близко к MergeVue.

---

# 35. Что Grok test сделал правильно

- не создал `/how-it-works`;
- не добавил `How It Works` в sidebar;
- сохранил left shell;
- сохранил visual grammar;
- process steps 1–7 полные;
- step 4 присутствует;
- 42Q specific-leader condition;
- verification states корректны;
- нет fake score;
- нет fake pricing.

---

# 36. Что Grok test сделал неправильно

Главный дефект:

> **он заменил существующее содержимое `/about-methodology` process-страницей.**

То есть:

- route reuse был соблюдён;
- content preservation — нет.

Были потеряны существующие:

- methodology hero;
- interaction-environment explanation;
- falsifiability explanation;
- methodology paper link;
- ECS section;
- 17 resources explanation;
- ECS block;
- 9 environments section;
- environment links.

Это является failure.

---

# 37. Вторичный defect Grok test

В конце process screen:

`Read the methodology`

был создан как неактивный `<span>`.

Это нарушает:

> existing destination integrity.

Если deeper methodology существует:

- link должен вести туда.

---

# 38. Урок из Grok test

Правило:

> **«Не создавай новый route» недостаточно.**

Агент может выполнить его формально, но уничтожить existing surface.

Поэтому новый обязательный инвариант:

> **ROUTE PRESERVATION + BLOCK PRESERVATION.**

---

# 39. Visual process layout

Допустимы:

- vertical numbered list;
- restrained stepper;
- sequential cards.

Но reading order должен быть:

1→2→3→4→5→6→7.

Grid разрешён только если эта последовательность очевидна.

---

# 40. DOM order

DOM и keyboard order:

1→2→3→4→5→6→7.

Visual CSS не имеет права изменить смысловой порядок.

---

# 41. No generic marketing process

Не использовать:

- colorful funnel;
- flywheel;
- 3D arrows;
- animated pipeline;
- AI network;
- feature grid вместо процесса.

---

# 42. CTA

Primary:

`Analyze a deal`

Secondary:

`Read the methodology`

Optional:

`Historical cases`

Все должны быть real links / actions.

---

# 43. Public / paid boundary

Step 4 должен ясно показывать paid boundary.

Не нужно показывать prices.

Но нельзя создавать впечатление, что private documents входят в FREE.

---

# 44. Human involvement

Не придумывать:

`expert review on every step`.

Отдельные review gates описываются только там, где governing state это поддерживает.

---

# 45. AI language

AI не является process step.

Не писать:

`AI analyzes your deal`

как объяснение product journey.

Пользовательский process описывается через:

- evidence;
- analysis;
- quality gates;
- forecast;
- verification.

---

# 46. Accessibility

Если process визуализирован:

- semantic headings;
- logical DOM;
- no color-only order;
- connector line decorative;
- keyboard sequence correct;
- mobile one-column;
- no missing steps.

---

# 47. Responsive behavior

Desktop:

- process компактный;
- не превращается в гигантский landing.

Tablet:

- sequence remains obvious.

Mobile:

- одна колонка;
- step number;
- title;
- `You provide / MergeVue does / You receive`;
- badges stack safely.

---

# 48. Content states

Эта public informational function должна оставаться доступной даже если analysis backend temporarily unavailable.

Backend outage:

- process explanation остаётся;
- CTA сообщает недоступность.

---

# 49. Mandatory pre-design matrix

| Existing object | LIVE | MAIN | CANON | Preserve? | Defect? | Decision |
|---|---|---|---|---|---|---|
| About Methodology hero | | | | | | |
| Existing methodology copy | | | | | | |
| Methodology paper link | | | | | | |
| ECS section | | | | | | |
| 9 environments section | | | | | | |
| Methodology Overview | | | | | | |
| Before You Begin | | | | | | |
| Existing process components | | | | | | |
| Need for new process section | | | | | | |
| Need for new route | | | | | | |

---

# 50. Mandatory change report

Перед merge:

## `WHAT WAS INTENTIONALLY PRESERVED`

Перечислить existing blocks.

## `WHAT WAS ADDED`

Только process blocks.

## `WHAT WAS CHANGED`

С defect + authority.

## `WHAT WAS NOT TOUCHED`

Особенно:

- questionnaires;
- scoring;
- environment routes;
- case routes;
- report logic.

---

# 51. Acceptance criteria

Функция проходит gate только если:

1. LIVE / MAIN / CANON audit выполнен;
2. route не создан без route decision;
3. existing route content не заменён wholesale;
4. existing methodology blocks имеют individual decisions;
5. process полный 1–7;
6. step order правильный;
7. step 4 есть;
8. 42Q trigger = specific-leader forecast;
9. no invented quantities;
10. no invented capabilities;
11. no invented precision;
12. no `accuracy report`;
13. verification vocabulary canonical;
14. questionnaires untouched;
15. deeper methodology links remain functional;
16. environment links remain functional;
17. visual grammar canonical;
18. American English;
19. public/private boundary ясна;
20. accessibility соблюдена;
21. every removed block has separate authority;
22. every added process block has explicit purpose.

---

# 52. Финальный принцип

> **The function must exist. The page may not need to.**

> **Reusing a route does not authorize replacing its content.**

> **Process semantics are not a design variable.**

> **If information is missing, omit it — never complete MergeVue from generic SaaS assumptions.**
