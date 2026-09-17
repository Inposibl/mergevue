# 12. Контракт главной страницы MergeVue

**Статус документа:** управляющий постраничный контракт / обязательный design gate  
**Файл:** `12_MERGEVUE_HOME_PAGE_CONTRACT.md`  
**Версия:** 3.0  
**Дата:** 16 сентября 2026 года  
**Язык документации:** русский  
**Язык коммерческого интерфейса:** только American English  
**Рынок первой версии:** США  
**Цель:** улучшить существующую главную MergeVue без перепроектирования продукта с нуля  
**Главный принцип:** `STUDY FIRST → PRESERVE FIRST → CHANGE ONLY WITH EVIDENCE → REUSE BEFORE INVENTING → OMIT BEFORE GUESSING`

---

# 0. Назначение этого документа

Этот файл не является заданием придумать новую главную страницу.

Он является обязательным управляющим контрактом, который должен не позволить будущему дизайнеру, разработчику или автономному агенту:

- заменить MergeVue типовым SaaS;
- выдумать новые маршруты;
- придумать новые функции;
- придумать количественные обещания;
- заменить существующую навигационную оболочку без причины;
- показать прототип как будто это уже рабочий production flow;
- убрать работающие элементы только ради визуальной новизны;
- изменить канонические опросники через UX/UI.

Задача:

> **получить лучшую следующую версию реально существующей главной MergeVue, используя live-продукт, актуальный `main`, accepted visual canon и новый UX/UI-корпус.**

---

# 1. Источники, которые агент обязан изучить до дизайна

До создания любого:

- макета;
- Figma;
- HTML;
- React;
- изображения;
- прототипа;
- pull request;
- новой copy;

агент обязан изучить следующие источники.

## 1.1. LIVE

`mergevue.vercel.app`

Проверяется:

- что реально видит пользователь;
- фактическая композиция;
- текущая навигация;
- текущие тексты;
- реальное адаптивное поведение;
- фактические переходы;
- отличия от `main`.

## 1.2. MAIN

Актуальная ветка `main`.

Минимально проверить:

- `src/App.jsx`;
- `src/styles.css`;
- `src/screenRegistry.js`;
- текущие public routes;
- текущий public shell;
- текущий `HomeScreen`;
- текущий diagnostic entry;
- существующие методологические и case-study routes.

## 1.3. CANON

Принятый visual canon и его фактически доступные реализации.

Проверяется:

- palette;
- typography;
- surfaces;
- borders;
- radii;
- density;
- section grammar;
- print/report lineage;
- existing responsive patterns.

## 1.4. GOVERNANCE / METHODOLOGY

Используются для:

- product meaning;
- claims;
- questionnaire invariants;
- data boundaries;
- 42Q trigger;
- report semantics;
- FREE / PAID boundaries.

---

# 2. Иерархия полномочий

При конфликте источников используется следующая иерархия по назначению.

## Методологический смысл

1. controlling methodology / governance;
2. accepted product decisions;
3. актуальная production logic.

## Канонические опросники

Абсолютный источник истины — канонический question corpus и его алгоритмические bindings.

## Реальная техническая реализация

Актуальный `main`.

## Реально воспринимаемый UX

Live deployment.

## Визуальный язык

Accepted visual canon и существующие канонические компоненты.

## Новый UX/UI corpus

Определяет, что необходимо исправить и какие новые границы соблюдать.

## Внешняя практика

Используется только если существующие MergeVue patterns не закрывают задачу.

---

# 3. Обязательная триангуляция LIVE → MAIN → CANON

Для каждого существенного элемента главной агент обязан заполнить:

| Элемент | LIVE | MAIN | CANON | Дефект | Решение |
|---|---|---|---|---|---|
| Global shell | | | | | |
| Brand block | | | | | |
| Sidebar | | | | | |
| Hero | | | | | |
| Eyebrow | | | | | |
| H1 | | | | | |
| Lead | | | | | |
| Supporting copy | | | | | |
| Action card | | | | | |
| Primary CTA | | | | | |
| Secondary links | | | | | |
| Mobile behavior | | | | | |

Без этой таблицы дизайн не начинается.

---

# 4. Базовый принцип — KEEP BY DEFAULT

Существующее решение сохраняется, пока не доказано, что оно:

- противоречит текущему продукту;
- нарушает методологию;
- вводит в заблуждение;
- препятствует deal-first journey;
- создаёт лишний trust burden;
- нарушает claims governance;
- нарушает accessibility;
- технически блокирует развитие продукта.

Бремя доказательства лежит **на изменении**, а не на сохранении.

---

# 5. Допустимые решения

Для каждого элемента используется только один статус:

- `KEEP`;
- `ADAPT`;
- `MOVE`;
- `ADD`;
- `REPLACE`;
- `REMOVE`.

`ADD`, `REPLACE`, `REMOVE` требуют явного письменного основания.

---

# 6. Что НЕ является достаточным основанием для изменения

Не являются достаточными:

- «так современнее»;
- «так выглядит премиальнее»;
- «так делают SaaS»;
- «top navigation привычнее»;
- «feature cards лучше продают»;
- «dashboard выглядит профессиональнее»;
- «добавим social proof»;
- «больше воздуха лучше»;
- «так удобнее рисовать».

---

# 7. Fail-closed правило — DO NOT INVENT

Если ни один controlling source не подтверждает:

- функцию;
- route;
- capability;
- quantitative claim;
- trigger;
- output;
- score;
- pricing element;
- timing;
- automation;
- customer proof;

агент обязан:

> **OMIT — DO NOT INVENT.**

Не разрешается «логично достроить» продукт.

---

# 8. Запрет invented product claims

Без отдельного основания нельзя писать:

- `thousands of public data points`;
- `instant risk profile`;
- `precise forecast`;
- `automated accuracy report`;
- `AI predicts executive departures`;
- `critical risk automatically triggers 42Q`;
- `real-time deal score`;
- `proven accuracy`;
- любые новые проценты;
- любые новые сроки;
- любые новые обещания автоматизации.

---

# 9. Запрет invented routes

Название UX/UI-документа, макета или концепта не является route authority.

Главная не имеет права сама создать:

- `/how-it-works`;
- `/pricing`;
- `/customers`;
- `/resources`;
- `/dashboard`;
- любой новый destination.

Новый route требует отдельного route decision.

---

# 10. Запрет invented navigation

Нельзя без отдельного решения:

- заменить sidebar top navigation;
- добавить новый sidebar item;
- удалить existing navigation item;
- превратить реальный link в декоративный `<span>`;
- добавить неработающий пункт «на будущее».

Если destination существует в `main`, ссылка должна оставаться настоящей ссылкой.

Если destination не существует, нельзя изображать его активным.

---

# 11. Новый обязательный принцип — PROTOTYPE ≠ PRODUCTION FLOW

Визуальный прототип может временно имитировать действие.

Но production design contract не имеет права считать имитацию выполненной функцией.

Пример выявленной ошибки:

`Analyze a deal`
→ локально раскрывает два поля
→ показывает текст `Public-source research would begin here`

Это допустимо как демонстрация макета, но **не является реализацией deal-first public analysis**.

Production target:

```text
Analyze a deal
→ real route / real flow
→ company resolution
→ public-source analysis
→ real public result
```

---

# 12. Новый обязательный принцип — LINK INTEGRITY

Если существующая surface существует в `main`, она не должна превращаться в неактивный текст.

Пример:

`Historical cases`

Если `/case-studies` существует, production implementation должна использовать реальный link.

Не разрешается:

> сохранить label, но удалить переход.

---

# 13. Новый обязательный принцип — BRAND DESCRIPTOR IS NOT DESIGN FILLER

Текст под логотипом не является декоративным placeholder.

В текущем `main` sidebar содержит:

`MergeVue`

и descriptor:

`Diagnostic`

Агент не имеет права самостоятельно:

- менять descriptor;
- расширять его;
- возвращать `M&A Behavior Diagnostic`;
- придумывать новый tagline.

Brand descriptor требует отдельного content / brand decision.

До такого решения:

> сохранить фактический current descriptor или использовать существующую accepted brand treatment.

---

# 14. Абсолютный инвариант канонических вопросов

Ни один канонический вопрос ни в одном опроснике нельзя:

- перефразировать;
- сокращать;
- редактировать;
- менять местами;
- переносить так, чтобы менялась последовательность;
- делить;
- объединять;
- удалять;
- добавлять;
- менять варианты ответа;
- менять порядок вариантов ответа;
- менять gates;
- менять hidden mappings.

Если вопрос не помещается:

> меняется layout, а не вопрос.

---

# 15. Фактическая текущая главная в `main`

На момент подготовки документа текущий `HomeScreen` имеет структуру:

```text
main.landing-screen.home-screen
└── section.landing-inner.home-inner
    ├── header.home-brand-hero
    │   ├── eyebrow
    │   ├── H1
    │   ├── lead
    │   └── supporting copy
    └── section.home-start-section
        ├── eyebrow
        ├── H2
        ├── explanatory copy
        └── CTA
```

Это компактная двухблочная страница.

---

# 16. Фактический current public shell

Текущий sidebar содержит:

- `Home`;
- `About Methodology`;
- `The 9 Interaction Environments`;
- `Case Studies`;
- `Start Diagnostic`.

Brand block:

`MergeVue`

descriptor:

`Diagnostic`

Это фактическое состояние `main`.

Оно не становится автоматически финальным target, но является исходной базой.

---

# 17. Фактический current hero

Текущий eyebrow:

`M&A Integration Risk Due Diligence`

Текущий H1:

`Post-Deal Behavior Forecast`

Текущий lead:

`70% of M&A integrations that destroy value fail for the same reason.`

Текущий supporting copy содержит, среди прочего:

- невозможность двух организаций реально работать вместе;
- конфликты вокруг решений, ресурсов, скорости, ответственности, власти и конфликта;
- утверждение `we show where the integration will fracture`;
- временной narrative `months 6 to 18`;
- утверждение о management team performance.

Текущий closing:

`Run the diagnostic in less than one hour. No account. No card.`

---

# 18. Фактическая current action-card

Eyebrow:

`Start Diagnostic`

Heading:

`Begin the integration-risk diagnostic`

Body:

`Answer the deal-context questions first, then complete the environment modules required for the ECS read.`

CTA:

`Start Diagnostic`

Destination:

`/start-diagnostic/before-you-begin`

Это старый questionnaire-first entry.

---

# 19. Фактический current `Before You Begin`

Существующая pre-flight surface уже содержит полезный trust pattern:

- что FREE preview выдаёт;
- что FREE preview не выдаёт;
- ограничения;
- distinction от valuation;
- distinction от final deal verdict;
- employment/workforce boundary;
- объяснение, почему существуют ограничения.

Это важный reusable asset.

Но текущий flow всё ещё ведёт в старый diagnostic questionnaire.

---

# 20. Что главная делает правильно уже сейчас

Сохранять по умолчанию:

- компактность;
- text-first hero;
- один главный CTA;
- отсутствие signup gate;
- отдельную action-card;
- левое выравнивание;
- светлый background;
- синий/navy accent;
- белые surfaces;
- тонкие borders;
- restrained radius;
- отсутствие decorative hero art;
- отсутствие generic SaaS sections.

---

# 21. Что главная делает неправильно относительно нового трека

Требуют изменения:

1. unsupported `70%`;
2. over-strong deterministic language;
3. old `Start Diagnostic`;
4. questionnaire-first entry;
5. слишком узкое старое positioning;
6. старые обещания времени, если они не подтверждены новым flow.

---

# 22. Current target: product meaning

Главная должна объяснять:

> MergeVue проверяет организационные предположения, от которых зависит реализация ценности сделки, и превращает поддержанные доказательствами механизмы риска в проверяемые во времени прогнозы.

Не:

- culture-fit tool;
- personality test;
- deal-success predictor;
- generic AI copilot;
- integration consulting site.

---

# 23. Primary CTA

Target:

`Analyze a deal`

Production behavior:

```text
CTA
→ real deal-entry route
→ Acquirer + Target
→ entity resolution
→ minimum context if required
→ public research
→ public result
```

Не:

- локальная имитация;
- signup;
- pricing;
- questionnaire;
- payment.

---

# 24. Trust level

Главная — trust level 0.

До начала анализа не запрашивать:

- account;
- email;
- phone;
- employer;
- private documents;
- respondent data;
- 42Q;
- payment.

---

# 25. Target copy — semantic authority

Рабочий eyebrow:

`M&A Organizational Risk Intelligence`

Рабочий H1:

`Test the organizational assumptions behind the deal.`

Рабочий lead:

`Financial and legal diligence can validate the transaction. MergeVue tests whether the organizations can actually operate in the way the deal thesis requires.`

Closing:

`Start with two company names. No account. No card.`

Эти строки являются semantic target.

Редактор может улучшить American English без изменения certainty или product meaning.

---

# 26. Target action-card

Eyebrow:

`Public deal analysis`

Heading:

`Start with a real deal`

Body:

`Enter the acquirer and target. MergeVue will research the public evidence and show which organizational assumptions deserve further diligence.`

CTA:

`Analyze a deal`

Supporting:

`No account required.`

---

# 27. Secondary links

Допустимы только существующие destinations.

Минимально:

`Methodology`

→ существующая methodology surface.

`Historical cases`

→ существующий `/case-studies`.

Нельзя использовать неактивные labels вместо ссылок.

---

# 28. Global shell decision

Для первого controlled refinement:

> **KEEP current shell.**

Изменение sidebar → top nav не входит в scope главной.

Отдельный navigation contract может пересмотреть это позже.

---

# 29. Route decision

Текущие `/` и `/home` уже существуют.

Нет причины создавать новый homepage route.

Если один route становится canonical:

- второй сохраняется как redirect;
- existing links не ломаются.

---

# 30. Что запрещено добавлять

По умолчанию запрещены:

- `Trusted by`;
- customer logos;
- testimonials;
- fake recent analyses;
- fake deal examples;
- fake dashboard;
- fake compatibility score;
- pricing cards;
- feature grid;
- FAQ;
- newsletter;
- AI graphic;
- stock photography;
- invented footer;
- social proof counters;
- industry logos.

---

# 31. ADD test

Новый block разрешён только если задокументированы:

1. конкретный UX problem;
2. почему existing hero/action-card недостаточны;
3. почему copy fix недостаточен;
4. какой existing component reuse;
5. какие реальные data / content используются;
6. почему block не дублирует existing surface.

---

# 32. Grok test — фактический результат

В тестовом workspace агент создал:

- `src/routes/index.tsx`;
- `src/routes/about-methodology.tsx`;
- `src/components/public-shell.tsx`;
- `src/components/deal-start-card.tsx`;
- отдельный `src/styles.css`.

Два предоставленных Grok workspace дали одинаковые relevant implementation files.

Это означает:

> наблюдавшиеся ошибки являются устойчивым следствием управляющих инструкций, а не случайной вариацией одного рендера.

---

# 33. Что Grok сделал правильно на главной

Полезные результаты:

- сохранил left sidebar;
- сохранил light/navy visual grammar;
- оставил compact hero;
- убрал `70%`;
- использовал `Analyze a deal`;
- не добавил customer logos;
- не добавил pricing;
- не добавил fake score;
- не превратил homepage в длинный landing.

Эти результаты подтверждают правильность existing-product-first strategy.

---

# 34. Что Grok сделал неправильно на главной

## 34.1. Prototype вместо product flow

`DealStartCard` локально раскрывает поля Acquirer/Target.

После submit локально показывает:

`Companies resolved. Public-source research would begin here.`

Это **prototype simulation**, не production implementation.

## 34.2. Broken destination preservation

`Historical cases` был сохранён как текстовый `<span>`, хотя реальный route в MergeVue существует.

Это нарушает LINK INTEGRITY.

## 34.3. Brand drift

Sidebar descriptor:

`Diagnostic`

не был проверен как intentional current brand decision.

Это требует preservation, а не свободной редакции.

---

# 35. Урок из Grok test

Визуальная когерентность недостаточна.

Макет может выглядеть «как MergeVue» и всё равно нарушать product contract.

Gate проверяет одновременно:

- visual lineage;
- semantic lineage;
- route lineage;
- component lineage;
- functional behavior;
- claims discipline.

---

# 36. Desktop behavior

Сохранить:

- ограниченную ширину hero;
- existing shell;
- visible action-card;
- clear CTA;
- restrained whitespace.

Не использовать большой экран как повод добавить blocks.

---

# 37. Tablet / mobile behavior

На узких экранах:

- hero одна колонка;
- action-card одна колонка;
- CTA full-width при необходимости;
- no horizontal scroll;
- current navigation адаптируется existing/canonical способом;
- no content removal.

---

# 38. Accessibility

Target:

WCAG 2.2 AA.

Минимум:

- один H1;
- semantic structure;
- visible focus;
- keyboard access;
- proper links;
- sufficient contrast;
- reflow;
- correct target sizes;
- no color-only meaning.

---

# 39. Analytics

Измерять:

```text
Home viewed
→ Analyze a deal selected
→ companies confirmed
→ public analysis started
→ public result delivered
```

Не считать homepage успешной только по CTR.

---

# 40. WHAT WAS INTENTIONALLY PRESERVED

Перед merge агент обязан перечислить:

- shell;
- routes;
- components;
- CSS;
- layout;
- typography;
- visual tokens;
- responsive patterns;
- existing links.

---

# 41. WHAT CHANGED AND WHY

Для каждого изменения:

```text
OLD
→ NEW
→ DEFECT
→ AUTHORITY
```

Запрещено:

`redesigned for a cleaner experience`

без конкретного defect.

---

# 42. Acceptance criteria

Главная проходит gate только если:

1. LIVE / MAIN / CANON audit выполнен;
2. page узнаваема как MergeVue;
3. current shell сохранён либо отдельно авторизован к изменению;
4. unsupported `70%` отсутствует;
5. deterministic claims отсутствуют;
6. CTA = `Analyze a deal`;
7. CTA ведёт в реальный deal-first flow;
8. prototype behavior не выдается за production;
9. existing destinations остаются рабочими links;
10. no signup gate;
11. no invented route;
12. no fake customer proof;
13. no fake dashboard;
14. no fake score;
15. no invented capability;
16. no invented quantity;
17. no invented brand descriptor;
18. American English only;
19. canonical questions untouched;
20. every material sentence has authority;
21. every `ADD` has documented need;
22. every `REMOVE / REPLACE` has documented defect.

---

# 43. Финальный принцип

> **Существующий MergeVue — это исходный материал, а не препятствие дизайну.**

И:

> **Если улучшение нельзя проследить от существующего элемента к конкретному исправленному дефекту, оно не должно попадать в production.**
