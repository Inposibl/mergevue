# 14. Контракт методологической поверхности MergeVue

**Статус документа:** управляющий постраничный контракт / block-preservation authority  
**Файл:** `14_MERGEVUE_METHODOLOGY_PAGE_CONTRACT.md`  
**Версия:** 1.0  
**Дата:** 16 сентября 2026 года  
**Язык документации:** русский  
**Язык коммерческого интерфейса:** только American English  
**Рынок первой версии:** США  
**Область действия:** `/about-methodology`, `/about-methodology/overview` и связанные переходы  
**Главный принцип:** сохранить существующую методологическую поверхность и исправлять только конкретные semantic / claims defects  
**Ключевые инварианты:** `KEEP BY DEFAULT`, `BLOCK-BY-BLOCK PRESERVATION`, `REUSE ROUTE ≠ REPLACE PAGE CONTENT`, `OMIT BEFORE INVENTING`

---

# 0. Назначение

Этот документ не разрешает создать новую методологию.

Он определяет, как улучшить существующие методологические страницы MergeVue так, чтобы:

- не потерять уже построенную структуру;
- не дублировать `How MergeVue works`;
- не превратить методологию в маркетинговый landing;
- не усиливать утверждения сверх доказательств;
- не публиковать внутренние или преждевременные связи как установленную истину;
- сохранить полезные существующие visual / component patterns;
- сохранить отдельную deeper-methodology surface;
- не менять algorithmic contracts.

---

# 1. Обязательное исследование до дизайна

До изменения страницы агент обязан:

1. открыть live `/about-methodology`;
2. открыть live `/about-methodology/overview`, если route доступен;
3. открыть актуальный `src/App.jsx`;
4. открыть `src/screenRegistry.js`;
5. открыть `src/styles.css`;
6. найти существующие `framework-*` classes;
7. проверить `/environments`;
8. проверить `Before You Begin`;
9. проверить `08_MERGEVUE_CONTENT_AND_CLAIMS_GOVERNANCE.md`;
10. проверить `09_MERGEVUE_DESIGN_DIRECTION.md`;
11. проверить `12` и `13`;
12. заполнить block-preservation matrix.

Если live недоступен:

> это фиксируется как limitation; содержание live не угадывается.

---

# 2. Фактические routes в текущем `main`

Существуют:

`/about-methodology`

Current registry title:

`The ST Framework`

И:

`/about-methodology/overview`

Current registry title:

`Post-Deal Behavior Forecast Methodology Overview`

Следовательно:

- routes уже существуют;
- создавать новые methodology routes не требуется;
- existing links должны сохраняться.

---

# 3. Фактическая структура `/about-methodology`

Текущая страница содержит три крупных уровня.

## 3.1. Hero

H1:

`The Post-Deal Behavior Forecast Methodology`

Далее три абзаца:

1. interaction environment как diagnostic unit;
2. nine archetypal operating environments и post-close pressure;
3. falsifiability / sealed claims / later verification.

Есть link:

`Read the methodology paper`

→ `/about-methodology/overview`.

## 3.2. ECS section

Heading:

`The Environment Compatibility Score (ECS)`

Содержит:

- 17 resources;
- pairwise comparison explanation;
- ECS score bands;
- EV ranges;
- synergy ranges;
- talent-flight risk ranges;
- note about high scores / ring-fence / paradoxical incompatibility.

## 3.3. Nine Environments section

Heading:

`The 9 Interaction Environments`

Содержит:

- карточки девяти сред;
- публичные названия / aliases;
- short descriptions;
- links на environment detail routes.

---

# 4. Фактическая структура `/about-methodology/overview`

Current deeper methodology page:

Hero:

`Methodology paper`

H1:

`Post-Deal Behavior Forecast Methodology Overview`

Шесть секций:

1. `Purpose`;
2. `Evidence base`;
3. `The analyst gate`;
4. `Environment Compatibility Score, conceptually`;
5. `Calibration`;
6. `Access`.

Есть back link на `/about-methodology`.

---

# 5. Общий verdict

## `/about-methodology`

**KEEP ROUTE.**

**KEEP PAGE FUNCTION.**

**KEEP BLOCK STRUCTURE WITH TARGETED ADAPTATION.**

## `/about-methodology/overview`

**KEEP ROUTE.**

**KEEP DEEPER-PAPER FUNCTION.**

**ADAPT CLAIMS WHERE CURRENT COPY IS STRONGER THAN CURRENT AUTHORITY.**

## Новый standalone methodology route

**DO NOT ADD.**

---

# 6. Methodology page не равна `How MergeVue works`

`How MergeVue works` отвечает:

> what happens when I use the product?

Methodology отвечает:

> why does MergeVue interpret organizational interaction this way, what structures does it use, and how should its outputs be understood?

Поэтому:

- process explanation может быть компактно добавлен;
- existing methodology content нельзя заменить process flow;
- methodology остаётся самостоятельной epistemic surface.

---

# 7. Главный пользовательский вопрос страницы

Пользователь должен получить ответ:

> `What is MergeVue actually modeling, what evidence does it use, how should I interpret the outputs, and where are the limits?`

Не:

> `Why is MergeVue amazing?`

Не:

> `What features do I get?`

---

# 8. Trust level

Public / trust level 0.

Методологическая страница:

- доступна без account;
- не требует deal;
- не требует email;
- не требует questionnaire;
- не требует private data;
- не требует payment.

---

# 9. Главный claims principle

> **MergeVue не должен быть убедительнее своих доказательств.**

Methodology page особенно чувствительна к этому правилу, потому что слова:

- method;
- evidence;
- validation;
- prediction;
- calibration;
- score;
- model;
- independent audit;

могут создавать впечатление более сильного proof state, чем реально существует.

---

# 10. Eight claim classes

Дизайнер / редактор должен отличать:

- fact;
- derived fact;
- structural interpretation;
- risk;
- forecast;
- economic claim;
- methodology claim;
- product-quality claim.

Methodology page преимущественно содержит:

- methodology claims;
- structural interpretation rules;
- model-bound definitions.

Она не должна случайно превращать methodology claim в product-quality claim.

---

# 11. Block-preservation matrix — обязательна

Перед изменением `/about-methodology` заполнить:

| Existing block | Current purpose | Current defect | Decision | Authority |
|---|---|---|---|---|
| Methodology hero | | | | |
| Interaction-environment explanation | | | | |
| Nine-environment explanation | | | | |
| Forecast/falsifiability paragraph | | | | |
| Methodology paper link | | | | |
| ECS section | | | | |
| 17-resource explanation | | | | |
| ECS score bands | | | | |
| ECS caveat | | | | |
| 9 environments grid | | | | |
| Environment links | | | | |

Нельзя сделать одну строку:

`Replace methodology page`.

---

# 12. Hero H1

Current:

`The Post-Deal Behavior Forecast Methodology`

Verdict:

**ADAPT, not replace wholesale.**

Проблема:

- делает `Post-Deal Behavior Forecast` единственным именем методологии;
- новая product architecture шире;
- specific-leader behavior forecast имеет отдельную 42Q boundary.

Рабочие направления:

`MergeVue Methodology`

или:

`How MergeVue Models Organizational Risk in M&A`

Окончательный H1 требует brand/content decision.

Не придумывать новый branded methodology name.

---

# 13. Hero paragraph 1 — current defect

Current meaning:

> model how an acquired organisation will actually behave after close.

Проблемы:

- `will actually behave` слишком детерминистично;
- British `organisation` против American-English contract;
- звучит как guaranteed behavioral prediction.

Verdict:

**ADAPT.**

Target meaning:

> MergeVue analyzes how organizational interaction environments may respond under the pressures created by a transaction and post-close integration.

Допустимый working copy:

`MergeVue analyzes organizational interaction patterns in the context of an M&A transaction and uses evidence to assess where post-close operating pressure may become material.`

---

# 14. Interaction environment as unit

Current core idea:

> people do not behave “in general”; behavior is shaped by norms, incentives and pressures of an interaction environment.

Verdict:

**KEEP WITH CLAIMS-SAFE EDITING.**

Public boundary:

> environment describes organizational interaction logic, not a person’s character.

Must remain explicit.

---

# 15. Nine environments origin

Publicly permissible:

`The nine Interaction Environments originate in the proprietary organizational theory developed by MergeVue's founder.`

Also permissible:

`MergeVue uses the nine environments as a taxonomy for organizational interaction.`

Forbidden:

- `Science proved there are nine environments`;
- `Mathematics proves there must be nine`;
- `The nine environments were discovered by clustering M&A cases`.

---

# 16. Hero paragraph 2 — current defect

Current meaning:

> each side is read as one of nine archetypal environments and the system identifies where they will pull apart.

Problems:

- `will pull apart` deterministic;
- may suggest one simplistic label fully defines each organization;
- current architecture includes evidence quality, contradictions, coverage and uncertainty.

Verdict:

**ADAPT.**

Target meaning:

> MergeVue evaluates evidence against the nine-environment framework and compares the structural implications of the resulting readings without erasing uncertainty or contradictions.

---

# 17. Per-leader forecast claim

Current hero says:

> output is a time-bound, per-leader forecast.

This is **not valid as the generic default methodology description**.

Reason:

> specific-leader forecast requires separate individual data, including 42Q.

Verdict:

**REPLACE.**

Target:

`The methodology can support time-bound organizational forecasts. A forecast for a specific named leader requires a separate individual-data channel.`

42Q details can link to a later trust/product surface.

---

# 18. Falsifiability paragraph — preserve concept, revise wording

Current paragraph contains a strong contrast:

> `A personality test can never be wrong. This can — on a clock...`

Problems:

- unnecessarily categorical statement about personality tests;
- marketing rhetoric is stronger than needed;
- distracts from MergeVue verification architecture.

Verdict:

**ADAPT.**

Target:

`A material forecast should be framed so that its timing, observable signs, and conditions for weakening or falsification can be recorded before the outcome and checked later.`

---

# 19. Sealing / locking language

Publicly permissible if implemented for the relevant output:

`Locked forecasts preserve the wording and timing used before the outcome is known so they can later be evaluated against observed events.`

Do not write:

- `tamper-proof`;
- `guaranteed`;
- `scientifically validated by sealing`.

---

# 20. Methodology paper link

Current:

`Read the methodology paper`

→ `/about-methodology/overview`

Verdict:

**KEEP.**

Requirement:

- must remain real link;
- label may be editorially improved;
- route must not become decorative.

Potential:

`Read the methodology overview`

is clearer unless the deeper page is truly treated as a paper.

---

# 21. ECS section — core function

ECS section is valuable because it explains that:

- structural compatibility is modeled;
- resource relations matter;
- one scalar is not a deal verdict.

Verdict:

**KEEP SECTION.**

But current copy must be narrowed.

---

# 22. Current 17-resource model

Current list:

- Authority;
- Trust;
- Reputation;
- Information;
- Influence;
- Will / Discipline;
- Energy;
- Attention;
- Time;
- Health;
- Money;
- Imagination;
- Relationships;
- Status;
- Territory;
- Meaning;
- Security.

Verdict:

**KEEP PUBLIC LIST**, unless a later controlling methodology act restricts it.

User-facing explanation:

> MergeVue compares how organizational environments depend on and affect a shared set of resources.

Do not turn resources into personality traits.

---

# 23. Safe public resource language

Working copy:

`MergeVue compares how the acquirer and target depend on, reinforce, constrain, or compete over a shared set of organizational resources.`

Safe:

- direction of conflict;
- joint reinforcement;
- joint suppression;
- mechanism of risk.

Not safe without bridge:

- resource score = dollars;
- resource score = probability;
- resource score = psychological trait.

---

# 24. ECS definition

Safe public definition:

> `The Environment Compatibility Score is a structural measure derived from the modeled relationship between two environments across the resource framework.`

Also:

> `It is not a probability of deal success and not a recommendation to proceed or stop.`

This boundary should be visible, not hidden in a footnote.

---

# 25. ECS formula

If the product team chooses to expose the formula, it must be exact and version-correct.

Current controlling formula:

`ECS = 100 × (1 − C / 34)`

where `C` is the resource conflict total under the frozen resource-comparison model.

However:

> exposing the formula on the public methodology page is optional.

The designer may not invent or simplify it.

If shown:

- exact;
- versioned;
- contextualized;
- clearly not a probability.

---

# 26. ECS scale visualization

A 0–100 visualization is permissible only if the label remains exact:

`Structural compatibility`

or:

`Environment Compatibility Score`

Forbidden relabeling:

- `Success probability`;
- `Deal health`;
- `Integration probability`;
- `Risk score`.

---

# 27. Current ECS score bands — major defect

Current `ECS_SCORE_BANDS` maps bands to:

- `HIGH COMPATIBILITY`;
- EV loss ranges;
- synergy ranges;
- talent-flight-risk levels.

Examples include mappings such as:

- EV `0%–2%`;
- synergy `85%–100%`;
- talent flight `LOW`;
- and progressively worse ranges.

This is a **material public claims risk**.

Reason:

- ECS is not probability of deal success;
- structural compatibility does not automatically imply economic outcome;
- resource measure cannot be bridged directly to dollars or talent flight without separately validated bridge authority;
- historical outcomes cannot be converted into universal bands by visual implication.

Verdict:

> **REMOVE CURRENT ECONOMIC / SYNERGY / TALENT-FLIGHT BAND CLAIMS FROM PUBLIC METHODOLOGY UNTIL SEPARATELY VALIDATED.**

---

# 28. What replaces current score bands

Preferred minimal solution:

### Option A — neutral structural scale

Show only:

- numeric ECS;
- exact meaning;
- caveat that higher is not automatically safer;
- link to resource mechanism.

No economic ranges.

### Option B — no band visualization

Use short explanatory prose and one resource-comparison diagram.

Default preference:

> **Option A only if exact band semantics are controlling and validated; otherwise Option B.**

Designer cannot create new thresholds.

---

# 29. High ECS caveat

Current valuable insight:

> high structural similarity may still conceal aligned suppression / under-protection.

Verdict:

**KEEP CONCEPT, ADAPT WORDING.**

Safe public copy:

`A high structural score is not automatically reassuring. In some configurations, two environments may align because they weaken or under-protect the same capability. The underlying resource pattern therefore matters more than the score alone.`

Do not call it:

`paradoxical incompatibility`

unless that term is part of accepted external terminology.

---

# 30. Ring-fence claim

Current note ties high scores to `ring-fence protocols`.

This is too prescriptive for a generic methodology explanation unless a separate integration-protocol authority supports it.

Verdict:

**MOVE / OMIT pending dedicated protocol contract.**

Methodology page should explain interpretation, not prescribe an integration mode by score.

---

# 31. Nine Interaction Environments section

Current grid:

- useful;
- already built;
- linked;
- visually coherent.

Verdict:

**KEEP.**

Do not replace with new tiles or new category names for novelty.

---

# 32. Public environment names

Existing public brand names are controlling unless explicitly changed elsewhere.

Do not:

- silently translate them into unofficial Russian equivalents;
- invent new English labels;
- expose internal code names to clients.

---

# 33. Environment card content

Card may show:

- public name;
- short description;
- link to detail.

Do not add:

- personality imagery;
- people score;
- good/bad badge;
- success probability;
- ranking;
- moral language.

---

# 34. Environment detail relationship

Methodology page should remain index-level.

Deep details stay on:

`/environments/:id`

Do not duplicate the full environment definition into `/about-methodology`.

---

# 35. Optional `How MergeVue works` insertion

Per `13`, this methodology surface may host a compact process explanation.

But only as:

> **ADD BLOCK**

not:

> **REPLACE PAGE**.

If added, preferred position:

```text
Hero
→ optional compact How MergeVue works
→ ECS / resource model
→ 9 environments
```

Alternative position can be chosen after visual audit.

---

# 36. Process insertion must preserve methodology

If a 7-step process is shown:

- all steps present;
- order 1→7;
- step 4 present;
- 42Q trigger correct;
- process compact;
- existing methodology blocks remain.

---

# 37. Methodology Overview — general rule

The deeper page is not a place to repeat marketing copy.

It should be:

- more precise;
- more explicit about limitations;
- more source-conscious;
- less visual;
- more epistemically disciplined.

---

# 38. Overview section 1 — `Purpose`

Current claim includes:

> forecasting integration success or failure before deal close.

Problem:

- too close to overall deal-outcome prediction;
- MergeVue forecasts bounded organizational mechanisms, not universal transaction success/failure.

Verdict:

**ADAPT.**

Target meaning:

`MergeVue is designed to identify and test organizational risk mechanisms in defined M&A contexts and to frame observable, time-bound forecasts where the evidence supports doing so.`

---

# 39. Overview section 2 — `Evidence base`

Current section names three evidence categories:

- structured respondent observational data;
- historical case reconstructions;
- sealed forward predictions.

Core structure:

**KEEP.**

Claims correction:

- do not call instruments `validated` unless exact validation status is stated;
- historical case reconstructions are not automatically independent predictive tests;
- locked forward forecasts should be described as a verification program, not proof of general accuracy.

---

# 40. Safer evidence-base copy direction

`The methodology can draw on structured organizational observations, documentary evidence, retrospective case reconstructions with pre-event cutoffs, and prospective forecasts that are recorded before outcomes and later evaluated.`

Then explicitly:

`These evidence modes have different evidentiary status and must not be treated as interchangeable.`

---

# 41. Overview section 3 — current `The analyst gate`

Current copy presents trained analyst judgement as a general mandatory path.

This conflicts with current architecture where:

- FREE does not depend on human analyst;
- human analyst belongs to PAID / exception routes according to governance.

Verdict:

**REPLACE / REFRAME.**

Suggested section title:

`Quality and release gates`

---

# 42. Quality / release gate target

Safe public meaning:

`MergeVue uses structured input validation, deterministic checks, evidence-quality rules, contradiction handling, and release gates. Higher-stakes paid outputs may require additional review before release.`

Do not state:

- every FREE conclusion is human reviewed;
- every output has an analyst;
- AI independently determines truth.

---

# 43. AI on methodology page

AI is not the hero.

Safe:

`Automated analysis and controlled language-generation steps operate inside a bounded process with validation and release controls.`

Not safe:

- `AI discovers the real culture`;
- `AI predicts deal outcomes`;
- `AI replaces analysts`;
- `AI is more objective than humans`.

---

# 44. Overview section 4 — ECS concept

Current claim says ECS:

- is calibrated against actual outcomes;
- identifies where friction will arise;
- identifies intensity;
- identifies timeline.

This is too strong.

Verdict:

**ADAPT.**

Target:

`ECS summarizes the structural relationship between two environment readings under the resource model. It can help organize where structural tension or alignment should be examined. It does not by itself determine deal outcome, severity, or timing.`

---

# 45. Timing is separate from ECS

Critical rule:

> ECS ≠ timeline.

If a forecast has timing, timing comes from a separate forecast construction and evidence path.

Do not write:

> ECS predicts when friction will occur

unless a separate validated bridge exists.

---

# 46. Overview section 5 — `Calibration`

Current section:

- references ten retrospective M&A cases;
- gives a specific AECOM–URS statement;
- references independent quantitative audit;
- can imply predictive validation.

Verdict:

**ADAPT STRONGLY.**

---

# 47. Historical cases wording

Allowed:

- `historical case`;
- `retrospective reconstruction`;
- `historical test with a pre-event cutoff`.

Not automatically allowed:

- `independent predictive trial`;
- `proof of accuracy`;
- `model accuracy = X%`.

---

# 48. Historical vs prospective evidence

Methodology page should clearly distinguish:

## Retrospective

Outcome already exists; anti-hindsight controls are necessary.

## Prospective

Forecast recorded before outcome; later checked.

The two cannot be visually merged into one `Validation` badge.

---

# 49. AECOM–URS example

Detailed claims about one historical case belong primarily on its case page.

Methodology overview may link to a case.

Preferred:

`See a retrospective case reconstruction`

rather than:

`AECOM confirms the prediction`.

---

# 50. Technical audit claim

Independent software / formula audits can support:

- implementation correctness;
- specification parity;
- bounded technical claims.

They do not prove:

- scientific validity;
- forecasting accuracy;
- market effectiveness.

Methodology page must name the object of the audit.

---

# 51. Safer calibration section direction

Potential title:

`Historical and prospective evaluation`

Working copy:

`MergeVue evaluates the methodology through documented retrospective case work and a separate prospective program in which forecasts can be recorded before outcomes and checked later. Technical verification of formulas or software is reported separately from predictive evaluation.`

---

# 52. Overview section 6 — `Access`

Current section states certain materials are released under NDA and references:

- diagnostic instruments;
- resource architecture;
- full case portfolio;
- integration protocols;
- operational ECS computation;
- Investment Memorandum;
- pilot terms.

This may be partially outdated.

Verdict:

**REVIEW / ADAPT.**

The page should not promise availability of a document or commercial artifact unless it currently exists and is actually distributable.

---

# 53. Access section target function

Explain:

- what methodology is publicly visible;
- what remains proprietary;
- what client evidence remains private;
- where deeper due diligence / security documentation lives.

Do not use NDA language as prestige decoration.

---

# 54. What should remain proprietary

Public methodology does not need to expose:

- exact question-to-environment mappings;
- scoring bindings;
- hidden typological mapping;
- internal 42Q type variables;
- proprietary adjudication instructions;
- private agent routing;
- internal safety rule implementation.

---

# 55. Canonical questions — absolute protection

Methodology page may explain that structured instruments exist.

It may not:

- rewrite questions;
- show edited examples;
- expose mappings;
- rearrange items;
- create simplified demo questions.

If a real question is shown:

> exact canonical text + exact options + exact order.

Default:

> do not show question examples on methodology page.

---

# 56. Evidence uncertainty

Methodology page should explain:

- unknown ≠ negative;
- contradiction reduces certainty;
- missing evidence can block a conclusion;
- one source does not automatically override another;
- evidence quality and coverage matter.

This is a stronger differentiator than vague `AI-powered` language.

---

# 57. Safe public evidence explanation

Working copy:

`MergeVue does not treat the most frequent answer as automatically correct. Evidence is evaluated by source quality, coverage, directness, contradiction, and the strength of support for competing structural explanations.`

Only publish if wording exactly matches current method.

---

# 58. Distinguish evidence / interpretation / risk / forecast

Recommended visual grammar:

- `Evidence`;
- `Interpretation`;
- `Risk mechanism`;
- `Forecast`;
- `Unknown / unresolved`.

Do not rely only on color.

---

# 59. No science theater

Do not add:

- formulas as decoration;
- Greek letters without explanation;
- fake confidence charts;
- scientific imagery;
- neural network graphics;
- academic citations that do not support exact claims.

Methodology should look rigorous because it is precise, not because it looks complex.

---

# 60. Visual preservation

Keep existing:

- public shell;
- page-shell;
- framework hero;
- framework section rhythm;
- environment cards;
- environment links;
- restrained white/navy language.

No reason for wholesale restyle.

---

# 61. ECS visualization style

Do not use traffic-light semantics implying:

- green = good deal;
- red = bad deal.

If a scale remains:

- exact label;
- neutral explanation;
- accessible text;
- no economic implication.

---

# 62. Red / green discipline

Red may indicate:

- blocking evidence state;
- explicit contradiction;
- falsified forecast.

Green may indicate:

- verified state;
- approved state.

Do not use them as:

- buy / don't buy;
- good culture / bad culture;
- safe / unsafe deal.

---

# 63. Interaction-environment visual treatment

Environment cards should look like:

- taxonomy / model reference;

not:

- personality cards;
- archetype quiz results;
- team personas.

---

# 64. Methodology depth

Public methodology page should provide enough depth for:

- serious M&A professional;
- diligence buyer;
- skeptical advisor;
- procurement / risk reviewer.

But should not expose proprietary bindings.

---

# 65. Suggested target page order

Minimal evolution of current page:

```text
1. Existing methodology hero — ADAPT
2. Methodology overview link — KEEP
3. Optional compact How MergeVue works section — ADD only if 13 audit authorizes
4. ECS / resource model section — KEEP + claims repair
5. Nine Interaction Environments — KEEP
6. Optional short Evidence / Uncertainty boundary — ADD only if needed
```

Do not create 12 new sections.

---

# 66. Suggested deeper overview order

Keep current six-section skeleton if possible:

```text
1. Purpose
2. Evidence base
3. Quality and release gates
4. ECS conceptually
5. Historical and prospective evaluation
6. Access / proprietary boundaries
```

This is an **ADAPTATION of the current six**, not a new paper.

---

# 67. What should NOT move to homepage

Keep deeper methodology off homepage:

- 17-resource taxonomy;
- ECS formula;
- evidence categories;
- calibration discussion;
- proprietary boundaries.

Homepage can link here.

---

# 68. What should NOT move to `How MergeVue works`

Do not duplicate:

- full ECS explanation;
- full environment taxonomy;
- historical-validation caveats;
- proprietary-access details.

`13` process section should remain compact.

---

# 69. Calls to action

Primary methodology CTA should be informational, not commercial.

Potential:

`Analyze a deal`

as a secondary conversion action at the end.

Also:

`See historical cases`

`Explore the 9 Interaction Environments`

`Read the methodology overview`

All must link to real routes.

---

# 70. No fake downloadable paper

Do not add:

`Download methodology PDF`

unless a real approved downloadable artifact exists.

---

# 71. No fake audit badge

Do not add:

`Independently validated`

`Scientifically verified`

`Audited methodology`

as decorative badges.

If an audit is named:

- exact object;
- exact scope;
- exact status.

---

# 72. Live vs main divergence rule

If live copy differs from `main`:

- document the difference;
- do not silently copy whichever sounds stronger;
- use current governing claims rules to decide.

---

# 73. English language

All UI copy:

- American English;
- `organization`, not `organisation`;
- sentence case;
- no unnecessary capitalization;
- no internal jargon if a professional user-facing term exists.

---

# 74. Responsive behavior

Desktop:

- preserve editorial reading width;
- environment grid can use multiple columns;
- ECS explanation remains readable.

Tablet:

- cards reduce columns;
- score explanation stays in reading order.

Mobile:

- one-column content;
- environment cards stack;
- no horizontal overflow;
- no large score visualization that dominates context.

---

# 75. Accessibility

Target:

WCAG 2.2 AA.

Need:

- one H1;
- logical headings;
- real links;
- keyboard access;
- visible focus;
- text alternative for diagrams;
- non-color semantic explanation;
- mobile reflow.

---

# 76. Analytics

Useful events:

- methodology page viewed;
- methodology overview opened;
- environment detail opened;
- historical cases opened;
- Analyze a deal selected.

Do not infer methodological comprehension from scroll depth alone.

---

# 77. What designer may change

Allowed:

- spacing;
- line length;
- card density;
- responsive grid;
- exact visual hierarchy inside existing sections;
- copy wrapping;
- neutral diagram presentation.

---

# 78. What designer may NOT change

Without separate authority:

- nine-environment names;
- resource set;
- ECS formula;
- questionnaire content;
- question mappings;
- historical case facts;
- 42Q trigger;
- verification states;
- methodology meaning;
- claim strength;
- route architecture.

---

# 79. WHAT WAS INTENTIONALLY PRESERVED

Before merge agent must list:

- `/about-methodology`;
- `/about-methodology/overview`;
- public shell;
- methodology hero structure;
- ECS section structure;
- 9-environment index;
- environment links;
- methodology overview skeleton;
- back/deep links.

---

# 80. WHAT CHANGED AND WHY

Format:

```text
OLD CLAIM / BLOCK
→ NEW CLAIM / BLOCK
→ DEFECT
→ AUTHORITY
```

Example:

```text
“forecasting integration success or failure”
→ bounded organizational risk forecasting
→ current wording implies whole-deal outcome prediction
→ content governance
```

---

# 81. Explicit current block decisions

| Current block | Decision |
|---|---|
| `/about-methodology` route | **KEEP** |
| `/about-methodology/overview` route | **KEEP** |
| Methodology hero | **ADAPT** |
| Interaction-environment concept | **KEEP + ADAPT LANGUAGE** |
| 9 environments origin | **KEEP WITH CLAIM BOUNDARY** |
| Generic per-leader forecast wording | **REPLACE** |
| Falsifiability concept | **KEEP + ADAPT** |
| Methodology overview link | **KEEP** |
| ECS section | **KEEP** |
| 17 resources | **KEEP** |
| Current EV/synergy/talent score bands | **REMOVE PENDING SEPARATE VALIDATION** |
| High-score caveat | **KEEP + ADAPT** |
| Ring-fence prescription in ECS note | **MOVE / OMIT** |
| 9 environment cards | **KEEP** |
| Environment detail links | **KEEP** |
| Overview `Purpose` | **ADAPT** |
| Overview `Evidence base` | **ADAPT** |
| Overview `Analyst gate` | **REPLACE WITH QUALITY/RELEASE GATES** |
| Overview `ECS conceptually` | **ADAPT** |
| Overview `Calibration` | **ADAPT STRONGLY** |
| Overview `Access` | **REVIEW / ADAPT** |

---

# 82. Acceptance criteria

Методологическая поверхность проходит gate только если:

1. live / main / canon audit выполнен;
2. existing routes сохранены;
3. existing blocks не заменены wholesale;
4. page остаётся methodology surface;
5. `How MergeVue works` не вытесняет methodology;
6. nine-environment origin описан без false scientific claim;
7. environment ≠ personality;
8. generic per-leader forecast claim удалён;
9. 42Q boundary соблюдена;
10. ECS не назван probability of success;
11. ECS не превращён в deal verdict;
12. economic / synergy / talent bands не публикуются без отдельной validated bridge authority;
13. historical cases не названы independent predictive trials без основания;
14. technical audit не представлен как predictive validation;
15. analyst gate не обещан для FREE, если его там нет;
16. methodology overview сохраняет deeper-paper function;
17. all existing links remain functional;
18. canonical questionnaires untouched;
19. American English;
20. WCAG target соблюдён;
21. no fake badges;
22. no invented scientific authority;
23. every material methodology claim has source authority;
24. removed content has explicit defect record.

---

# 83. Финальное правило

> **Methodology is not marketing decoration.**

> **A model description must be no stronger than the model authority that supports it.**

> **Preserve the existing methodology surface, repair its claims, and do not use redesign as a hidden mechanism for changing the methodology.**
