# 15. Контракт поверхности девяти сред взаимодействия MergeVue

**Статус документа:** управляющий постраничный контракт / контракт индексной и детальной поверхности  
**Файл:** `15_MERGEVUE_INTERACTION_ENVIRONMENTS_INDEX_CONTRACT.md`  
**Версия:** 1.0  
**Дата:** 16 сентября 2026 года  
**Язык документации:** русский  
**Язык коммерческого интерфейса:** только American English  
**Рынок первой версии:** США  
**Область действия:** `/environments` и `/environments/:environmentId`  
**Главный принцип:** сохранить существующий механизм выбора и чтения сред, исправить только смысловые, языковые и маршрутизационные дефекты  
**Ключевые инварианты:** `KEEP BY DEFAULT`, `PUBLIC NAMES ARE FIXED`, `ENVIRONMENT ≠ PERSONALITY`, `NO RANKING`, `DEFINITIONAL AUTHORITY BEFORE PRESENTATION COPY`, `OMIT BEFORE INVENTING`

---

# 0. Почему один контракт покрывает индекс и detail routes

В текущем `main` маршруты:

`/environments`

и:

`/environments/:environmentId`

обслуживаются одной и той же поверхностью.

Текущая логика:

```text
hero
→ selector of 9 environments
→ selected environment detail panel
→ CTA
```

Следовательно, искусственно разрывать существующий компонент на десять независимых дизайн-систем без продуктовой причины не требуется.

Этот документ одновременно определяет:

- обзор девяти сред;
- выбор конкретной среды;
- детальное представление одной среды;
- переход к анализу сделки.

---

# 1. Обязательное исследование до дизайна

До любого изменения агент обязан:

1. открыть live `/environments`;
2. открыть несколько live `/environments/:environmentId`;
3. проверить актуальный `src/App.jsx`;
4. проверить `src/data/environments.js`;
5. проверить `src/constants/envAliases.ts`;
6. проверить `src/screenRegistry.js`;
7. проверить `src/styles.css`;
8. проверить текущий controlling definitional authority;
9. проверить `08_MERGEVUE_CONTENT_AND_CLAIMS_GOVERNANCE.md`;
10. проверить `09_MERGEVUE_DESIGN_DIRECTION.md`;
11. проверить `14_MERGEVUE_METHODOLOGY_PAGE_CONTRACT.md`;
12. заполнить block-preservation matrix.

Если live surface недоступна конкретному агенту:

> это фиксируется как limitation; live behavior не угадывается.

---

# 2. Текущее состояние, подтверждённое в `main`

Current route registry поддерживает:

`/environments`

и:

`/environments/:id`

под общей product surface:

`The 9 Interaction Environments`.

Текущий компонент:

`EnvironmentsScreen`.

Текущий data source:

`src/data/environments.js`.

Текущий публичный alias source:

`src/constants/envAliases.ts`.

---

# 3. Фактическая текущая структура

Current surface:

## Hero

H1:

`The 9 Interaction Environments`

Supporting copy:

`Descriptions of the nine interaction environments`

## Selector

Девять ссылок на:

`/environments/:environmentId`

Current selector использует публичные названия сред.

## Detail panel

H2:

публичное название выбранной среды.

Далее текущие семь строк:

1. `One-line definition`;
2. `Authority structure`;
3. `Decision mechanism`;
4. `Innovation stance`;
5. `Economic function`;
6. `Resource target`;
7. `Systemic role`.

## CTA

Current:

`Start a Diagnostic`

→ старый diagnostic flow.

---

# 4. Общий verdict

## Route architecture

**KEEP.**

## Shared index/detail component model

**KEEP.**

## Public selector

**KEEP.**

## Seven-row detail structure

**KEEP AS PRESENTATION STRUCTURE, REVIEW CONTENT AGAINST DEFINitional AUTHORITY.**

## Existing descriptions in `src/data/environments.js`

**DO NOT TREAT AS CONTROLLING DEFINITIONAL AUTHORITY.**

## CTA

**REPLACE → `Analyze a deal`.**

## Invalid environment fallback

**REPLACE WITH EXPLICIT NOT-FOUND BEHAVIOR.**

---

# 5. Публичные имена девяти сред — фиксированы

Текущий canonical public alias dictionary:

1. `The Idea Lab`
2. `The Performance Arena`
3. `The Disruption Lab`
4. `The Mission Field`
5. `The Creative Commons`
6. `The Hometown Network`
7. `The Franchise Machine`
8. `The Power Racket`
9. `The Enforcer Network`

Эти названия являются публичными brand labels.

Дизайнер / редактор не имеет права:

- переименовывать их;
- сокращать;
- «смягчать»;
- переводить для первой американской версии;
- заменять на более «корпоративные» названия;
- добавлять новые публичные aliases.

---

# 6. Внутренние коды не публикуются

Внутренние коды:

- `NF/NT`;
- `NT/STJ`;
- `NT/STP`;
- `NF/SFJ`;
- `NF/SFP`;
- `SFJ/SFP`;
- `SFP/SFJ`;
- `STJ/STP`;
- `STP/STJ`

не являются клиентскими названиями.

Current code уже содержит механизм замены внутренних кодов публичными aliases.

Публичная поверхность должна продолжать использовать только public names.

---

# 7. Legacy code не должен становиться UI

В `envAliases.ts` существует compatibility treatment для legacy-кода Franchise Machine.

Это техническая совместимость.

Она не должна отображаться пользователю:

- как второй код;
- как previous name;
- как historical taxonomy.

---

# 8. Запрещённые внутренние термины

Во внешнем UI не публиковать внутренние дефиниционные термины:

- `Phenomenon`;
- `Essence`;

и их внутренние русские эквиваленты как технические классы модели.

Если такие поля существуют в research / authority material:

> они остаются внутренними.

---

# 9. Главный смысловой boundary

Пользователь должен понять:

> **Interaction Environment describes an organizational logic of interaction — not a personality type.**

Это должно быть видно без чтения глубокого methodology paper.

Рабочий public copy:

`Interaction Environments describe recurring organizational patterns of coordination, authority, decision-making, and resource use. They are not personality types or rankings of organizational quality.`

---

# 10. Среда не является характеристикой человека

Запрещённые конструкции:

- `This person is The Performance Arena`;
- `The CEO is a Power Racket`;
- `Your team personality is...`;
- `This is the company's personality type`.

Допустимо:

`The available evidence supports an organizational environment reading consistent with...`

если конкретный analytical context это позволяет.

---

# 11. Среда не является моральной оценкой

Среды не ранжируются как:

- good / bad;
- healthy / unhealthy;
- mature / immature;
- modern / outdated;
- safe / dangerous;
- strong / weak.

Каждая среда описывается через:

- operating logic;
- authority;
- decisions;
- resource effects;
- function;
- context-dependent risk.

---

# 12. Все девять имеют равный визуальный статус

Запрещено:

- разные размеры карточек по «важности»;
- gold / premium environment;
- red environment;
- green environment;
- ranking 1–9;
- star rating;
- risk badge на самой taxonomy card;
- «best for M&A».

---

# 13. Порядок отображения

Current presentation order в `main` должен быть сохранён, пока отдельный authority не определит другое.

Нельзя автоматически:

- сортировать alphabetically;
- сортировать по risk;
- сортировать по frequency;
- сортировать по «силе»;
- группировать good vs bad.

Порядок не должен создавать implied ranking.

---

# 14. Current selector — сохранить

Текущий selector:

- использует links;
- показывает public name;
- использует active state;
- использует `aria-current="page"`;
- ведёт на реальные routes.

Это хороший existing pattern.

Verdict:

**KEEP.**

---

# 15. Не превращать selector в quiz

Selector не является:

- выбором «какой вы тип»;
- выбором «какая у вас культура»;
- self-assessment;
- onboarding step.

Heading и surrounding copy должны сохранять reference/browse semantics.

---

# 16. Selector vs card grid

На `/about-methodology` уже существует grid девяти environment cards.

На `/environments` текущая surface использует selector + detail.

Не дублировать grid только ради единообразия.

Разные surfaces решают разные задачи:

- methodology → обзор;
- environments → чтение конкретного environment.

---

# 17. Current detail structure — сохранить

Семь текущих semantic rows являются полезным reusable template:

1. definition;
2. authority;
3. decisions;
4. innovation;
5. economic function;
6. resources;
7. systemic role.

Это создаёт сопоставимость всех девяти сред.

Не нужно превращать каждую среду в уникальный editorial layout.

---

# 18. Структура строк ≠ authority содержания

Важно:

> существование поля в `src/data/environments.js` не делает его текущий текст controlling definition.

UI structure может быть сохранена.

Text value должен быть сверён с текущим definitional authority.

---

# 19. `src/data/environments.js` — presentation data, не дефиниционная конституция

Current file содержит:

- aliases;
- short descriptions;
- one-line definitions;
- authority structures;
- decision mechanisms;
- innovation stances;
- economic functions;
- resource targets;
- systemic roles.

Но этот файл:

- является implementation data;
- может содержать устаревшую presentation wording;
- не должен использоваться для отмены более новой controlling definitional authority.

---

# 20. Authority-resolution rule

Перед редактированием содержимого среды агент должен определить:

1. current controlling definitional package;
2. current governance status;
3. exact supported statement;
4. current public-safe terminology.

Нельзя:

- смешивать версии;
- брать понравившиеся предложения из разных revisions;
- достраивать unresolved positions;
- использовать старый implementation copy как более высокий authority.

---

# 21. Stale status banners внутри reference package

Reference package может содержать исторический status text, соответствующий моменту создания файла.

Будущий агент не должен автоматически:

- повышать;
- понижать;
- переопределять

current authority только по старому status banner внутри пакета.

Current authority определяется управляющей иерархией проекта.

При конфликте:

> STOP → resolve authority pointer → then edit.

---

# 22. Текущие short descriptions требуют отдельного review

В `src/data/environments.js` присутствуют яркие slogans, например конструкции уровня:

- `Deliver results or exit.`;
- `The strong take what they can.`;
- `The offer creates the trap.`;
- `Believe in the cause.`

Они могут быть полезны как mnemonic copy, но не являются автоматически definitional authority.

Каждая такая строка должна пройти:

- semantic comparison;
- claims review;
- tone review;
- American-English review.

---

# 23. Neutral professional tone

Если rhetorical opener:

- moralizes;
- sensationalizes;
- implies criminality where model definition does not;
- implies personality diagnosis;
- overwhelms the formal meaning;

он должен быть:

**ADAPT / REMOVE**

с сохранением underlying definition.

Нельзя смягчать публичное название среды.

Можно корректировать explanatory copy.

---

# 24. American English normalization

Current presentation data содержит British spellings, включая формы типа:

- `organisation`;
- `centred`;
- `standardised`;
- `recognisable`;
- `prioritisation`.

Первая коммерческая версия требует American English.

Разрешено editorial normalization:

- `organization`;
- `centered`;
- `standardized`;
- `recognizable`;
- `prioritization`.

Но:

> spelling normalization не даёт право менять смысл.

---

# 25. One-line definition

Current label:

`One-line definition`

Verdict:

**KEEP OR EDITORIALLY ADAPT.**

Potential user-facing label:

`Definition`

может быть проще.

Но изменение label не должно менять field meaning.

---

# 26. Authority structure

Current label:

`Authority structure`

Verdict:

**KEEP.**

Это одна из центральных operational differences между средами.

---

# 27. Decision mechanism

Current label:

`Decision mechanism`

Verdict:

**KEEP.**

Не заменять на:

`Decision quality`

или:

`Decision score`.

---

# 28. Innovation stance

Current label:

`Innovation stance`

Verdict:

**KEEP / TERMINOLOGY REVIEW.**

Если definitional authority использует другой точный concept:

- изменить label только после semantic review.

Не делать:

`Innovation score`.

---

# 29. Economic function

Current label:

`Economic function`

Verdict:

**KEEP WITH CLAIMS REVIEW.**

Текст должен объяснять:

> каким образом такая organizational logic может создавать или поддерживать value.

Не превращать поле в:

- revenue prediction;
- margin forecast;
- performance rating.

---

# 30. Resource target

Current label:

`Resource target`

Verdict:

**REVIEW TERMINOLOGY, KEEP CONCEPT ONLY IF CURRENT AUTHORITY SUPPORTS IT.**

Проблема:

> слово `target` может звучать как намеренное «изъятие» ресурса и не всегда точно передавать resource relationship.

Возможное направление:

`Resource pattern`

или:

`Resource focus`

только после methodology authority review.

Дизайнер не выбирает новое название самостоятельно.

---

# 31. Systemic role

Current label:

`Systemic role`

Verdict:

**KEEP.**

Это помогает показать:

- функция среды;
- место в organizational system;
- отсутствие good/bad ranking.

---

# 32. Не добавлять новые semantic rows без основания

Без controlling source запрещено добавлять:

- `Risk level`;
- `Leadership type`;
- `Best use case`;
- `Worst use case`;
- `M&A score`;
- `Success probability`;
- `Culture fit`;
- `Employee profile`;
- `Ideal CEO`.

---

# 33. Можно ли добавить limitations / under pressure

Только если:

- current definitional authority явно поддерживает соответствующие statements;
- формулировки public-safe;
- это не создаёт несуществующую deterministic transition model.

Без такого authority:

> не добавлять новый row.

---

# 34. Transition theory не должна утечь в упрощённую UI-схему

Внутренняя theory может содержать conditional transition rules.

Публичная environment reference surface не должна автоматически показывать:

- deterministic arrows;
- `this environment becomes X under stress`;
- universal transition map;
- exact trigger claims,

если current authority не разрешает их публикацию.

---

# 35. Environment detail ≠ transition prediction

Описание среды:

> что это за organizational logic.

Прогноз:

> что может произойти в конкретной сделке при конкретных evidence and conditions.

Эти вещи нельзя смешивать.

---

# 36. Current route defect — silent fallback

Текущий `environmentById(environmentId)` возвращает первую среду, если id не найден.

Это означает:

`/environments/not-a-real-environment`

может визуально показать первую среду вместо ошибки.

Это недопустимо для production route integrity.

---

# 37. Correct route behavior

## `/environments`

Разрешено:

- открыть selector;
- по существующей логике выбрать default environment;
- либо показать neutral overview, если отдельный audit докажет необходимость.

Первый вариант предпочтителен, потому что уже существует.

## `/environments/:validId`

Показывает exact requested environment.

## `/environments/:invalidId`

Должен показывать:

- `Environment not found`;
- путь обратно к `The 9 Interaction Environments`;

или безопасный redirect на `/environments`.

Он не должен молча выдавать другую среду.

---

# 38. Не менять `/environments` default behavior без причины

Current base route effectively opens environment browser with a selected environment.

Это нормально.

Не создавать отдельный index page + отдельный detail page только потому, что такой pattern привычнее.

Если selector + detail работает:

> KEEP.

---

# 39. Hero copy

Current:

`The 9 Interaction Environments`

Verdict:

**KEEP EXACT PUBLIC CONCEPT.**

Current subtitle:

`Descriptions of the nine interaction environments`

можно улучшить, потому что он почти ничего не объясняет.

---

# 40. Target hero supporting copy

Working candidate:

`The nine Interaction Environments describe recurring organizational patterns of coordination, authority, decision-making, and resource use. They are not personality types or rankings of organizational quality.`

Это объясняет boundary без превращения hero в methodology paper.

---

# 41. Theory provenance

Допустима спокойная ссылка:

`Learn about the methodology`

или короткий provenance statement:

`The framework originates in MergeVue's proprietary organizational theory.`

Не требуется делать founder story частью environment browser.

---

# 42. Scientific claims

Запрещено:

- `scientifically proven nine types`;
- `empirically discovered nine cultures`;
- `mathematically proven taxonomy`;
- `universal laws of organizations`.

Safe:

`MergeVue uses nine Interaction Environments as a formal taxonomy within its organizational framework.`

---

# 43. Public alias source

Публичные aliases должны браться из canonical alias source.

Не дублировать вручную девять names в нескольких UI files, если можно использовать shared constant.

Цель:

> исключить расхождение имен между methodology, environment browser и report.

---

# 44. Detail copy source discipline

Каждое public field должно быть traceable:

```text
public field
→ definitional statement
→ public-safe transformation
→ UI string
```

Нельзя:

```text
designer paraphrase
→ sounds good
→ publish
```

---

# 45. No hidden personality inference

Environment detail page не должна показывать:

- representative face;
- personality archetype;
- MBTI-like letters;
- psychological profile;
- employee portrait;
- leader stereotype.

---

# 46. No stock photography

Не добавлять:

- boardroom;
- team;
- founder portrait;
- factory;
- office;
- handshake

к каждой среде только для визуального различения.

Среда является analytical concept.

---

# 47. No per-environment decorative colors

Не присваивать каждой среде свой яркий brand color без отдельного visual-system decision.

Причины:

- создаёт ложную typology language;
- усиливает сходство с personality test;
- усложняет report consistency;
- может создавать good/bad associations.

---

# 48. Current visual grammar

Current surface уже использует:

- light page background;
- public sidebar;
- compact hero;
- white selector surfaces;
- thin gray borders;
- 8px radius;
- navy active state;
- white detail panel;
- structured two-column rows.

Verdict:

**KEEP.**

---

# 49. Environment selector geometry

Current tabs:

- links;
- white background;
- 8px radius;
- active light-blue state;
- wrap across available width.

Verdict:

**KEEP.**

Не превращать автоматически в:

- carousel;
- dropdown;
- wheel;
- matrix;
- colorful taxonomy map.

---

# 50. Mobile selector

Current flex-wrap pattern является приемлемой starting point.

На mobile необходимо проверить:

- touch size;
- читаемость all 9 names;
- scroll burden;
- active-state visibility.

Изменение на alternative selector допускается только после mobile usability evidence.

---

# 51. Detail table

Current two-column structure:

```text
label | value
```

Verdict:

**KEEP DESKTOP.**

Преимущества:

- comparability;
- scanability;
- no card proliferation.

---

# 52. Mobile detail table

На narrow screen:

```text
label
value
```

stack vertically.

Не использовать horizontal scrolling для обычного environment description.

---

# 53. CTA defect

Current CTA:

`Start a Diagnostic`

ведёт в старый flow.

Target:

`Analyze a deal`

→ real deal-first public analysis.

Verdict:

**REPLACE.**

---

# 54. CTA integrity

CTA не должен:

- запускать questionnaire first;
- раскрывать fake local demo;
- вести в signup;
- вести в pricing.

Он должен использовать реальный target deal-entry route.

---

# 55. Secondary CTA

Допустимо:

`Read the methodology`

→ real methodology route.

Но не требуется дублировать много действий на каждой environment page.

---

# 56. No compatibility implication

Environment browser не должен говорить:

- какая среда лучше совместима;
- какая среда опаснее;
- какая среда «лучше для acquisition».

Compatibility возникает только в relation between environments and case context.

---

# 57. No score on taxonomy surface

Не показывать рядом со средой:

- ECS;
- risk score;
- popularity;
- confidence;
- likelihood.

Это reference surface, не deal analysis.

---

# 58. Environment ≠ company final classification

Даже если concrete analysis later identifies an environment reading, public taxonomy page не должна создавать впечатление:

> every company has one permanent immutable type.

Safe conceptual boundary:

> environment is an interaction logic inferred from evidence in a defined organizational context.

---

# 59. Unknown / mixed evidence

Если future deal-linked navigation приводит пользователя от analysis к environment reference:

- taxonomy page не должна pretend that classification is certain;
- deal-specific confidence remains on deal surface;
- reference page remains definitional.

---

# 60. Interaction with methodology

Methodology page:

> explains framework and evidence logic.

Environment browser:

> explains each of the nine public concepts in a comparable structure.

Не дублировать entire methodology paper inside every environment.

---

# 61. Interaction with reports

Report environment block должен использовать:

- same public name;
- compatible short definition;
- same semantic meaning.

Report не должен иметь отдельный alias dictionary.

---

# 62. Interaction with 42Q

42Q personal type is separate from organizational environment.

Environment browser не должен:

- объяснять personal type system;
- показывать Persona/Shadow;
- предлагать `Take 42Q to find your environment`.

Это разные channels.

---

# 63. Interaction with questionnaires

Environment browser может объяснить:

> structured evidence contributes to environment inference.

Но не показывает:

- question mappings;
- question weights;
- hidden signals;
- canonical item IDs;
- scoring keys.

---

# 64. Канонические вопросы остаются неприкосновенными

Даже если design agent хочет показать «пример»:

запрещено сочинять демонстрационный question.

Default:

> никакого questionnaire preview на environment browser.

---

# 65. Current copy audit — American English

Перед production release необходимо выполнить editorial pass всех девяти environment records.

Разрешённые исправления без semantic change:

- British → American spelling;
- punctuation;
- obvious grammar;
- typography.

Любая conceptual rewrite требует authority trace.

---

# 66. Current copy audit — loaded language

Для каждого record отдельно проверить:

- rhetorical opener;
- authority language;
- economic claim;
- social/moral language;
- resource wording.

Если strong language supported by authority:

> сохранить.

Если это old marketing shorthand:

> заменить public-safe definitional wording.

---

# 67. Не делать массовую автоматическую перефразировку

Запрещено:

- дать LLM девять descriptions и попросить «make them more professional»;
- автоматически унифицировать tone без source comparison;
- сокращать все rows до одной длины ценой смысла.

Каждая environment definition проходит source-preserving edit.

---

# 68. Public descriptions may vary in length

Не требуется насильно:

- одинаковое число слов;
- одинаковое число предложений;
- одинаковая высота смыслового content.

Визуальный layout должен выдерживать semantic length.

---

# 69. Card / selector names remain short

Публичное name должно оставаться primary visual identifier.

Не добавлять tagline непосредственно в selector, если это перегружает navigation.

---

# 70. Current `Full description →`

На methodology card grid существует:

`Full description →`

Это нормальный link pattern.

На environment selector дополнительный `Full description` не нужен, потому что выбранный detail уже открыт.

Не дублировать.

---

# 71. Not-found state

Client copy candidate:

`Environment not found`

Supporting:

`The requested Interaction Environment does not exist or the link is no longer valid.`

Action:

`View all Interaction Environments`

Не показывать first environment silently.

---

# 72. Loading state

Поскольку definitions local/static, отдельный loading state обычно не нужен.

Если data later becomes server-provided:

- preserve layout;
- do not show wrong fallback environment;
- show neutral loading state.

---

# 73. Accessibility

Target:

WCAG 2.2 AA.

Requirements:

- one H1;
- selector wrapped in semantic navigation;
- `aria-current` on selected environment;
- visible focus;
- exact link names;
- sufficient touch targets;
- detail rows readable in source order;
- no color-only differentiation;
- mobile reflow.

---

# 74. Anchor navigation vs ARIA tabs

Current selector uses real links and route navigation.

Это правильно.

Не менять на `role="tab"` автоматически.

ARIA tabs уместны только если implementation действительно управляет tabpanel semantics внутри одного document state.

Здесь route links должны оставаться links.

---

# 75. Keyboard order

Порядок:

1. public shell;
2. hero;
3. environment selector;
4. selected detail;
5. CTA.

Selector keyboard order совпадает с visual/presentation order.

---

# 76. Browser title

Для detail route:

`The Idea Lab — Interaction Environments — MergeVue`

аналогично для других.

Не использовать internal code в title.

---

# 77. URL integrity

Route IDs могут оставаться существующими slugs:

- `idea-lab`;
- `performance-arena`;
- и т.д.

Не переименовывать slugs без migration need.

Если rename всё же необходим:

- redirects;
- existing links preserved;
- report links checked.

---

# 78. Analytics

Минимально:

- environments surface viewed;
- environment selected;
- methodology opened;
- Analyze a deal selected.

Не нужно отслеживать:

- «favorite environment»;
- personality-like behavior;
- arbitrary engagement score.

---

# 79. Privacy

Environment browser public.

Не передавать в analytics:

- questionnaire answers;
- deal classification;
- leader identity

только потому, что пользователь открыл reference page.

---

# 80. Existing block decision matrix

| Current element | Decision |
|---|---|
| `/environments` route | **KEEP** |
| `/environments/:environmentId` | **KEEP** |
| Shared `EnvironmentsScreen` pattern | **KEEP** |
| Hero H1 | **KEEP** |
| Generic hero subtitle | **ADAPT** |
| 9-link selector | **KEEP** |
| Public aliases | **KEEP EXACTLY** |
| Internal codes hidden | **KEEP** |
| Selector active state | **KEEP** |
| Seven-row detail structure | **KEEP** |
| Existing row values | **REVIEW AGAINST CONTROLLING DEFINITIONS** |
| British spelling | **NORMALIZE TO AMERICAN ENGLISH** |
| Loaded rhetorical slogans | **REVIEW / ADAPT WHERE NOT AUTHORITY-SUPPORTED** |
| Current `Start a Diagnostic` CTA | **REPLACE → `Analyze a deal`** |
| Silent invalid-id fallback | **REPLACE WITH NOT-FOUND / SAFE REDIRECT** |
| Per-environment colors | **DO NOT ADD** |
| Ranking / scores | **DO NOT ADD** |
| Personality framing | **DO NOT ADD** |

---

# 81. WHAT WAS INTENTIONALLY PRESERVED

Перед merge агент обязан перечислить:

- existing routes;
- public aliases;
- existing order;
- selector;
- active state;
- detail panel;
- row structure;
- current visual tokens;
- responsive patterns;
- environment links.

---

# 82. WHAT CHANGED AND WHY

Формат:

```text
OLD
→ NEW
→ DEFECT
→ AUTHORITY
```

Пример:

```text
Start a Diagnostic
→ Analyze a deal
→ old questionnaire-first entry conflicts with current deal-first public-analysis journey
→ product journey contract
```

---

# 83. Content trace requirement

Для каждого изменённого environment description необходимо сохранить внутреннюю запись:

```text
ENVIRONMENT
FIELD
OLD UI COPY
NEW UI COPY
DEFINITIONAL SOURCE
CHANGE TYPE
SEMANTIC DELTA: NONE / AUTHORIZED
```

Mass rewrite без такой trace запрещён.

---

# 84. Acceptance criteria

Surface проходит gate только если:

1. LIVE / MAIN / CANON audit выполнен;
2. routes сохранены;
3. public aliases точны;
4. internal codes не опубликованы;
5. environment ≠ personality;
6. no environment ranking;
7. no good/bad classification;
8. selector preserved unless usability defect documented;
9. detail structure preserved;
10. all changed descriptions traced to definitional authority;
11. old implementation copy не используется как authority против newer governance;
12. unresolved theory positions не додуманы;
13. British spelling normalized without semantic drift;
14. loaded slogans reviewed individually;
15. no fake transition diagrams;
16. no per-environment risk score;
17. no per-environment decorative color taxonomy;
18. CTA = `Analyze a deal`;
19. CTA ведёт в real deal-first flow;
20. invalid id не подменяется первой средой;
21. environment links remain functional;
22. methodology link remains functional if shown;
23. canonical questionnaires untouched;
24. American English only;
25. WCAG target maintained;
26. every semantic rewrite has authority trace.

---

# 85. Финальный принцип

> **The nine public names are stable; the explanatory copy must stay subordinate to the current definitional authority.**

> **The environment browser is a reference system, not a personality quiz, a ranking, or a deal score.**

> **Preserve the existing selector-and-detail product pattern. Repair the language and route integrity; do not redesign the taxonomy from scratch.**
