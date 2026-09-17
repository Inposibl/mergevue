# 16. Контракт публичного индекса исторических кейсов MergeVue

**Статус документа:** управляющий постраничный контракт / public-case publication gate  
**Файл:** `16_MERGEVUE_HISTORICAL_CASES_INDEX_CONTRACT.md`  
**Версия:** 1.0  
**Дата:** 16 сентября 2026 года  
**Язык документации:** русский  
**Язык коммерческого интерфейса:** только American English  
**Рынок первой версии:** США  
**Область действия:** `/case-studies`  
**Связанный detail route:** `/case-studies/:caseId`  
**Главный принцип:** публичный индекс показывает только кейсы, имеющие законный public-case authority; существующая визуальная оболочка сохраняется, но hindsight-first и недоказанные aggregate claims удаляются  
**Ключевой governance invariant:** `Public Case Study Authority = Final Calibrated Replay Only`

---

# 0. Назначение

Этот документ определяет публичный **индекс исторических кейсов**, а не полный контракт отдельной страницы одного кейса.

Задача индекса:

1. показать, что MergeVue проверяет свою методологию на реальных исторических сделках;
2. дать пользователю доступ только к тем кейсам, которые действительно разрешены для публичной публикации;
3. не смешивать ретроспективный replay с настоящим prospective forecast;
4. не использовать известный outcome как маркетинговое доказательство того, что MergeVue «предсказал» его заранее;
5. направлять пользователя в отдельную case-detail surface;
6. сохранить существующий visual/component lineage там, где он не нарушает governance.

Следующий отдельный документ должен определить `/case-studies/:caseId`.

---

# 1. Обязательный audit до дизайна

Перед изменением `/case-studies` агент обязан:

1. открыть live `/case-studies`;
2. проверить текущие live cards;
3. открыть `src/App.jsx`;
4. открыть `src/data/caseStudies.js`;
5. открыть `src/screenRegistry.js`;
6. открыть `src/styles.css`;
7. открыть `MERGEVUE_PUBLIC_CASE_STUDY_AUTHORITY_2026-09-05.md`;
8. определить current publication authority каждого candidate case;
9. проверить accepted public terminology;
10. проверить `08_MERGEVUE_CONTENT_AND_CLAIMS_GOVERNANCE.md`;
11. проверить `09_MERGEVUE_DESIGN_DIRECTION.md`;
12. проверить `14` и `15`;
13. заполнить publication matrix.

Если live route недоступен агенту:

> limitation фиксируется; live state не угадывается.

---

# 2. Controlling publication rule

Непереговорное правило:

> **Public Case Study Authority = Final Calibrated Replay Only.**

Публичный case artifact может существовать только если одновременно соблюдены применимые обязательные условия:

- methodological closure;
- applicable method freeze;
- final methodology replay;
- sealed pre-T0 evidence set;
- no post-T0 contamination;
- independent verification;
- explicit Owner acceptance for publication authority;
- sufficient public-source provenance.

Если необходимого authority нет:

> **NO AUTHORITATIVE PUBLIC CASE-STUDY RESULT YET.**

---

# 3. Fail-closed index rule

Индекс не имеет права заполнять свободное место:

- provisional case;
- старой версией case;
- pre-calibration case;
- latest available internal result;
- самым убедительным old hypothesis;
- analyst-selected fallback;
- manually reconstructed public card.

Если case не прошёл publication gate:

> он не появляется как authoritative analytical case card.

---

# 4. Число «10» не является UI-инвариантом

Проект имеет фиксированный десятикейсовый исследовательский corpus.

Но:

> **10 research cases ≠ 10 automatically publishable public cases.**

Публичный index может временно содержать:

- меньше десяти кейсов;
- позднее десять;
- отдельный unresolved case, если его публикация отдельно разрешена.

Нельзя искусственно выводить `10 cases`, пока все десять не прошли public authority gate.

---

# 5. Фактический current index в `main`

Current implementation:

## Hero

H1:

`10 Retroactive Analyses`

Lead:

`$400B+ in value destroyed. $1T+ enabled. The same ECS formula - computed before the deal closed.`

## Grouping

Кейсы делятся на:

`Successes - 5 Cases`

и:

`Failures - 5 Cases`

## Cards

Карточки используют:

- outcome headline;
- company pair;
- year;
- industry;
- protocol pill;
- environment pair;
- integration mode;
- route на case detail.

Current visual grid:

- two columns on desktop;
- white cards;
- thin borders;
- 8px radius;
- red / green outcome accents.

---

# 6. Общий verdict по текущей странице

## Route `/case-studies`

**KEEP.**

## Existing public shell

**KEEP.**

## Two-column card grid

**KEEP.**

## Compact editorial hero

**KEEP STRUCTURE, REPLACE CLAIMS.**

## Cards as links to detail

**KEEP.**

## Fixed `10` in hero

**REMOVE UNTIL PUBLICATION GATE SUPPORTS IT.**

## `$400B+ destroyed / $1T+ enabled`

**REMOVE PENDING SEPARATE CLAIM AUTHORITY.**

## `same ECS formula - computed before the deal closed`

**REMOVE / REPLACE.**

## Success/failure grouping

**REPLACE WITH NEUTRAL CASE INDEX.**

## Red / green success-failure taxonomy

**REMOVE FROM INDEX AS PRIMARY ORGANIZING PRINCIPLE.**

---

# 7. Почему `Retroactive` нужно заменить

Для методологического языка предпочтительно:

`Retrospective`

а не:

`Retroactive`.

Причины:

- профессиональная исследовательская терминология;
- ясное отличие от prospective;
- отсутствие оттенка «задним числом переписали результат».

Working title:

`Historical Case Studies`

или:

`Retrospective M&A Case Studies`

Default preference:

> `Historical Case Studies`

---

# 8. Почему current hero claim недопустим

Current:

`The same ECS formula - computed before the deal closed.`

Проблема:

исторический replay может использовать только pre-T0 evidence, но сам replay выполняется **после** исторического события.

Это не означает:

> MergeVue реально вычислил ECS до исторического closing.

Правильное различие:

> `using evidence available before the defined transaction cutoff`

не равно:

> `computed before the deal closed`.

---

# 9. Safe retrospective wording

Допустимо:

`Each published historical case is reconstructed using a defined pre-event evidence cutoff and is presented separately from the later outcome evidence.`

Допустимо:

`The analytical basis is restricted to evidence that was available before the defined case cutoff.`

Недопустимо:

`MergeVue predicted this deal in 1998.`

если такого реального prospective prediction не существовало.

---

# 10. Aggregate `$400B+ / $1T+` claim

Current aggregate value claim требует отдельной source-and-attribution authority.

Проблемы:

- aggregation methodology;
- meaning of `destroyed`;
- meaning of `enabled`;
- causal attribution;
- double counting;
- retrospective outcome knowledge;
- relationship between deal outcome and MergeVue mechanism.

Verdict:

> **REMOVE FROM INDEX HERO UNTIL A SEPARATE VERIFIED AGGREGATION ARTIFACT AUTHORIZES IT.**

Не заменять другим большим долларовым числом.

---

# 11. Outcome-first grouping creates hindsight bias

Текущая структура сначала сообщает:

> success or failure

и только затем показывает analytical content.

Это противоречит смыслу pre-T0 replay:

> пользователь должен иметь возможность отличить analytical basis от known outcome.

Индекс не должен учить пользователя читать кейсы как:

`bad outcome → therefore model explanation must be right`.

---

# 12. Target grouping

Default:

> **одна нейтральная коллекция Historical Case Studies.**

Допустимы нейтральные filters позднее:

- industry;
- year;
- environment pair;
- publication status — только если это публично полезно.

Не использовать default grouping:

- successes;
- failures;
- winners;
- disasters.

---

# 13. Outcome may still exist inside detail

Удаление success/failure grouping не означает скрывать историю.

На detail page outcome может быть показан.

Но он должен быть:

- визуально отделён;
- явно post-T0;
- снабжён отдельными outcome-verification sources.

Индекс может показывать год и companies без outcome judgment.

---

# 14. Hero target

Eyebrow:

`Historical case studies`

H1 candidate:

`See how MergeVue applies its methodology to historical M&A cases.`

Supporting copy candidate:

`Published cases use a defined pre-event evidence cutoff and separate the analytical basis from what became known later.`

Optional second line:

`Only cases that have passed the required publication gates are shown here.`

---

# 15. Не превращать hero в validation claim

Не писать:

- `Proven across 10 deals`;
- `Validated on $1T+ of M&A`;
- `77.8% accurate`;
- `Predicted the biggest failures`;
- `Our model would have saved billions`;
- `The model knew before the market`.

---

# 16. Historical corpus ≠ predictive proof

Публичный index должен различать:

## Historical replay

ретроспективная реконструкция с pre-event cutoff.

## Prospective forecast

утверждение, записанное до outcome.

Наличие исторического corpus не должно визуально превращаться в:

> general predictive accuracy certificate.

---

# 17. Public card purpose

Карточка должна отвечать:

1. какая сделка;
2. когда;
3. какая отрасль;
4. что это за case-study artifact;
5. куда перейти для reading.

Она не должна пытаться уместить весь analytical verdict.

---

# 18. Minimum card fields

Рекомендуемые поля:

- company pair;
- year;
- industry;
- optional short analytical focus;
- `View case study`.

Если publication authority supports environment names:

- environment pair may remain.

---

# 19. Card headline

Current cards use aggressive outcome headlines such as:

`FAILURE - $36B DESTROYED`

Это не должно быть primary card identity.

Primary identity:

> company pair.

Например:

`Daimler-Benz × Chrysler`

Supporting:

`1998 · Automotive`

Optional analytical line:

`Retrospective case study`

---

# 20. Dollar outcomes on index cards

По умолчанию:

> **OMIT.**

Причины:

- создают outcome-first reading;
- требуют precise sourcing;
- могут implying causation;
- детали лучше объяснять на case page.

Если позднее owner-authorized disclosure contract разрешит amount:

- source required;
- exact meaning required;
- no causal shortcut.

---

# 21. Current protocol pill

Current card contains labels such as:

- `Seamless`;
- `Moderate`;

и integration modes.

Эти labels могут быть:

- legacy;
- methodology-version dependent;
- overly interpretive;
- tied to outdated score bands.

Verdict:

> **DO NOT DISPLAY ON INDEX BY DEFAULT.**

Они могут существовать на detail page только после current-methodology authority check.

---

# 22. Environment pair on index

May remain if:

- final calibrated replay authorizes the pair;
- public terminology uses only accepted aliases;
- no internal codes;
- classification uncertainty is handled.

If case final state is unresolved:

> do not fabricate a pair.

---

# 23. Environment pair is not the whole case

Index must not imply:

> case outcome is explained solely by environment A → environment B.

The pair is one analytical result inside a larger evidence structure.

---

# 24. Integration mode on index

Current:

- `Full Integration`;
- `Selective Integration`;
- similar labels.

These may be recommendation-like outputs.

Index is not the right place unless separately authorized.

Default:

> **MOVE TO DETAIL / OMIT FROM INDEX.**

---

# 25. Public publication status

Do not display internal statuses such as:

- Owner accepted;
- IV passed;
- factually sealed;
- CORR;
- replay generation.

These are governance mechanics, not client-facing content.

Public implication:

> card is visible because publication gate passed.

---

# 26. Unresolved final case

Governance allows the final calibrated result to be:

- `UNRESOLVED`;
- `INSUFFICIENT`;
- blocked;
- unavailable pair.

If such case is intentionally published:

- card must not force success/failure;
- detail must preserve uncertainty;
- card may say:

`Final replay remained unresolved`

only if public-selection authority permits that wording.

---

# 27. No publication pressure toward certainty

The index must not create an incentive to publish only neat, decisive examples.

Legitimate indeterminacy is methodologically valuable.

But selection of which cases appear publicly is a separate product decision.

---

# 28. Source traceability requirement

Each published case detail must ultimately expose public source traceability.

Index itself does not need to list every source.

But each card must route to a page capable of showing:

- source title;
- publisher / institution;
- publication date;
- public URL;
- locator where available.

---

# 29. Analytical vs outcome sources

Case detail must separate:

`Analytical basis sources`

from:

`Outcome verification sources`.

Index must not merge these in a source count.

Do not show:

`47 sources`

if that count combines pre-T0 and post-T0 material without explanation.

---

# 30. Primary-source preference

Public case system should prefer:

- regulatory filings;
- transaction documents;
- official company records;
- authoritative institutional sources;
- nearest-to-primary sources.

Internal MergeVue summaries must not substitute for available public sources.

---

# 31. Current `src/data/caseStudies.js` is not publication authority

This file currently contains:

- case titles;
- outcomes;
- ECS values;
- protocols;
- environment assignments;
- predictions;
- actuals;
- analyses;
- resource maps.

But:

> implementation data is not equivalent to public authority.

A case cannot be published merely because it exists in this JavaScript array.

---

# 32. Hard runtime publication gate

Future runtime must enforce:

```text
case requested
→ check Final Calibrated Replay authority
→ check IV
→ check Owner publication acceptance
→ check public source provenance
→ render
```

If gate fails:

> do not render old case data as fallback.

---

# 33. Index data source target

The index should eventually consume a publication-safe projection, not raw historical working data.

Conceptual shape:

```text
publicCaseId
displayTitle
year
industry
publicSummary
publicEnvironmentNames?
publicationAuthorized = true
detailRoute
```

No internal chain.

---

# 34. No silent fallback to legacy `CASE_STUDIES`

If new publication registry is unavailable:

> index fails closed or shows only verified entries.

It must not automatically use `src/data/caseStudies.js` because «otherwise page is empty».

---

# 35. Empty state is valid

If no case is currently publication-authorized:

H1:

`Historical case studies`

Body:

`No historical case study is currently available for public release.`

Optional:

`Read the methodology`

This is preferable to publishing provisional material.

---

# 36. Partial-publication state is valid

If 4 of 10 cases are authorized:

> show 4.

Do not show:

`4 of 10 complete`

unless product deliberately wants to expose research progress.

Default:

> no progress tracker.

---

# 37. No internal development chronology

Public case index must not expose:

- calibration deltas;
- correction chains;
- auditor identities;
- rater identities;
- methodology debt;
- internal labels;
- seals;
- hashes;
- Workbench artifacts.

---

# 38. No internal terminology

Forbidden public terms include:

- internal environment codes;
- `Phenomenon`;
- `Essence`;
- internal hypothesis IDs;
- CORR IDs;
- provider names;
- internal route gates.

Use business language and public environment names.

---

# 39. Case-title accuracy

Company names must match the authoritative case geometry.

Do not simplify:

- legal side;
- party identity;
- date;
- transaction type

when simplification changes the meaning.

Index may use recognizable short company names only if public-safe and unambiguous.

---

# 40. Year / date semantics

If card shows year:

- define whether it is announcement year;
- signing year;
- closing year.

Prefer internally consistent convention.

Do not mix year semantics across cards.

The exact case contract should define it.

---

# 41. Current Pfizer aggregate case issue

Legacy data may aggregate multiple Pfizer transactions into one card.

Current historical program can have a different fixed case geometry.

Therefore:

> do not preserve legacy card identity solely because current `caseStudies.js` contains it.

Publication identity comes from final public-case authority.

---

# 42. Fixed research corpus vs legacy website cards

The research corpus and legacy website data may diverge.

The publication pipeline must use:

> current final calibrated public case identity.

Not:

> whatever cases happen to exist in old UI data.

---

# 43. Visual shell

Current index visual grammar:

- public sidebar;
- light background;
- compact hero;
- two-column card grid;
- white cards;
- thin border;
- 8px radius.

Verdict:

**KEEP.**

No need for major visual redesign.

---

# 44. Card density

Current cards are moderately dense.

Target index should become slightly simpler semantically because:

- outcome headline removed;
- protocol removed;
- integration mode removed.

This is a content simplification, not a visual redesign.

---

# 45. Card layout candidate

```text
[Historical case study]

Company A × Company B

Year · Industry

Optional one-sentence analytical focus

[Environment A → Environment B]  // only if authorized

View case study →
```

No outcome color as primary signal.

---

# 46. Card labels

Use sentence case.

Potential small label:

`Historical case study`

Not:

`SUCCESS`

`FAILURE`

---

# 47. Red / green removal

Current index uses red for failure and green for success.

This should not be the primary case taxonomy.

Reason:

- hindsight bias;
- implied model judgment;
- visual moralization;
- simplistic binary outcome.

Use neutral navy / ink UI.

---

# 48. Outcome can have local semantics later

On detail page:

- outcome section may use status treatment;
- but meaning must be explicit text;
- color secondary only.

This does not justify outcome-coloring the index.

---

# 49. Sorting

Default options:

1. chronological;
2. fixed research-corpus order;
3. alphabetical.

Do not sort by:

- biggest failure;
- biggest value destroyed;
- model confidence;
- dramatic value.

Preferred:

> use governing corpus order if publication set derives from fixed corpus, otherwise chronological.

Exact choice should be consistent and documented.

---

# 50. Filters

Do not add filters until number of public cases creates actual usability need.

Ten or fewer cards usually do not require:

- search;
- industry filter;
- outcome filter.

Avoid unnecessary UI.

---

# 51. Search

Not required for first commercial version of case index.

Add only if public corpus materially expands.

---

# 52. Historical-case CTA

Each card:

`View case study`

must be real route.

No decorative cards without links.

---

# 53. Primary page CTA

The index does not require a large conversion CTA at top.

At bottom, optional:

`Analyze a deal`

after historical evidence has delivered value.

This CTA must use real deal-first flow.

---

# 54. Methodology link

Hero or footer of index may include:

`Read the methodology`

This must route to existing methodology surface.

---

# 55. Public case index is not investor evidence room

Do not expose:

- complete method history;
- audits;
- recalibration logs;
- internal packages.

Those belong to separately governed surfaces.

---

# 56. Copy discipline

Index copy must remain descriptive.

Safe:

`Historical case studies show how MergeVue applies its methodology to pre-event evidence from real M&A transactions.`

Unsafe:

`These cases prove MergeVue predicts M&A failures.`

---

# 57. No counterfactual savings claims

Do not write:

- `MergeVue would have saved $36B`;
- `This warning would have prevented the loss`;
- `Clients can avoid this outcome with MergeVue`.

Historical analysis does not establish causal savings.

---

# 58. No overall deal recommendation

Case card should not say:

- `This deal should not have happened`;
- `BUY`;
- `DON'T BUY`;
- `Good acquisition`;
- `Bad acquisition`.

MergeVue analyzes bounded organizational assumptions.

---

# 59. Integration recommendation belongs deeper

If a final replay supports a specific integration control:

- detail page may describe it;
- index should not reduce case to recommendation pill.

---

# 60. Outcome semantics

Terms like:

- success;
- failure;

may be historically meaningful but require definition.

Default index avoids them.

Detail may use specific observed outcomes:

- divestiture;
- executive departures;
- integration delay;
- synergy result;
- operational change;

instead of one unqualified binary label.

---

# 61. Claim provenance

Every quantitative public card field must have traceability.

Examples:

- deal value;
- write-down;
- acquisition price;
- date;
- outcome amount.

If not necessary for the card:

> omit rather than increase sourcing burden.

---

# 62. Historical case ≠ customer case study

Do not use typical SaaS language:

- `Customer story`;
- `Client success story`;
- `How MergeVue helped...`

These are documentary historical analyses, not client testimonials.

---

# 63. No company endorsement implication

Public presentation must not imply:

- company participated;
- company endorsed MergeVue;
- company used MergeVue.

Use neutral editorial framing.

---

# 64. Logos

Do not add company logos automatically.

Reasons:

- endorsement implication;
- trademark presentation;
- unnecessary visual noise;
- current index already works without them.

Company names are sufficient.

---

# 65. Photography

Do not add stock or transaction photography.

The case system should remain analytical/documentary.

---

# 66. Visual consistency with methodology

Reuse:

- same page shell;
- same hero treatment;
- same card borders;
- same navy hierarchy;
- same typography.

Case index should feel like evidence connected to methodology.

---

# 67. Mobile behavior

At narrow width:

- one-column card list;
- no horizontal scroll;
- company names wrap;
- metadata remains readable;
- CTA remains visible.

Do not truncate company names into ambiguous abbreviations.

---

# 68. Accessibility

Target:

WCAG 2.2 AA.

Need:

- one H1;
- H2 only for true sections;
- each card title meaningful;
- card route keyboard accessible;
- focus visible;
- no outcome meaning only by color;
- touch targets;
- logical reading order.

---

# 69. Card as one link vs nested links

Prefer simple semantic structure:

- case title / whole card link;
- avoid several competing nested clickable targets.

If whole card is clickable:

- ensure keyboard semantics remain correct.

---

# 70. Invalid case route

Index link must never point to unpublished case.

If a formerly public case is revoked:

- detail should fail closed;
- index must remove it;
- bookmarked route gets neutral unavailable state.

---

# 71. Revocation state

Client copy candidate:

`This historical case study is not currently available for public release.`

Do not expose internal reason.

---

# 72. Version drift

If a final calibrated replay is superseded by a new authorized replay:

- public card should point to current authorized version;
- historical public copy should not silently mix old and new fields.

Versioning rules belong to publication pipeline.

---

# 73. Historical outcome date

Case detail must make clear:

- pre-T0 cutoff;
- post-T0 outcome period.

Index does not need both dates.

---

# 74. Analytics

Useful:

- case index viewed;
- case selected;
- methodology selected;
- Analyze a deal selected.

Do not optimize ranking toward the most dramatic cases without product reason.

---

# 75. Publication-selection analytics

Internal analytics may track:

- which cases users read.

But this must not feed back into methodological truth.

Popularity ≠ validation.

---

# 76. Existing implementation decisions

| Current element | Decision |
|---|---|
| `/case-studies` route | **KEEP** |
| Compact hero structure | **KEEP** |
| `10 Retroactive Analyses` | **REPLACE** |
| `$400B+ / $1T+` hero claim | **REMOVE** |
| `same ECS formula - computed before close` | **REMOVE / REPLACE WITH PRE-EVENT CUTOFF LANGUAGE** |
| Success/failure grouping | **REPLACE WITH NEUTRAL INDEX** |
| Red/green group headings | **REMOVE** |
| Two-column card grid | **KEEP** |
| White card / thin border / 8px radius | **KEEP** |
| Outcome-first card headline | **REMOVE FROM PRIMARY IDENTITY** |
| Company pair | **KEEP** |
| Year | **KEEP WITH CONSISTENT SEMANTICS** |
| Industry | **KEEP** |
| Protocol pill | **MOVE / OMIT FROM INDEX** |
| Environment pair | **KEEP ONLY IF PUBLIC REPLAY AUTHORIZES** |
| Integration mode | **MOVE / OMIT FROM INDEX** |
| Detail route | **KEEP** |
| Raw `CASE_STUDIES` array as publication source | **REPLACE WITH PUBLICATION-GATED PROJECTION** |

---

# 77. Publication matrix — mandatory

Before rendering index:

| Case | Final calibrated replay | IV | Owner publication acceptance | Public provenance | Publish? |
|---|---:|---:|---:|---:|---:|
| Case A | | | | | |
| Case B | | | | | |
| ... | | | | | |

Only `Publish = YES` enters public index.

This matrix is internal.

---

# 78. Block-preservation matrix — mandatory

| UI block | LIVE | MAIN | Defect | Decision | Authority |
|---|---|---|---|---|---|
| Public shell | | | | | |
| Hero | | | | | |
| Hero claim | | | | | |
| Grouping | | | | | |
| Grid | | | | | |
| Card title | | | | | |
| Card metadata | | | | | |
| Protocol | | | | | |
| Environment pair | | | | | |
| CTA/link | | | | | |

---

# 79. WHAT WAS INTENTIONALLY PRESERVED

Before merge list:

- route;
- public shell;
- page width;
- hero geometry;
- card grid;
- card component lineage;
- responsive behavior;
- detail-route relationship.

---

# 80. WHAT CHANGED AND WHY

Format:

```text
OLD
→ NEW
→ DEFECT
→ AUTHORITY
```

Example:

```text
Successes / Failures
→ neutral Historical Case Studies collection
→ outcome-first grouping creates hindsight-led interpretation and conflates outcome with pre-T0 analytical basis
→ Public Case Study Authority + claims governance
```

---

# 81. No wholesale rewrite of case-detail content in this act

Этот contract не авторизует:

- переписывать detail page;
- изменять final calibrated case;
- менять evidence;
- менять outcome;
- менять environment determination.

Индекс только выбирает и представляет authorized cases.

---

# 82. Dependency on next document

Следующий case-specific contract должен определить:

- detail-page information hierarchy;
- pre-T0 analytical basis;
- final calibrated result;
- public sources;
- post-T0 outcome;
- outcome verification;
- limitations;
- source separation;
- report / methodology links.

---

# 83. Acceptance criteria

Index проходит gate только если:

1. LIVE / MAIN / CANON audit выполнен;
2. route сохранён;
3. каждый visible case имеет valid public authority;
4. index fail-closed;
5. fixed number `10` не показан без authority;
6. `$400B+ / $1T+` removed unless separately verified and authorized;
7. no claim that retrospective replay was actually computed before historic close;
8. retrospective vs prospective distinction clear;
9. outcome-first success/failure grouping removed;
10. red/green binary taxonomy removed;
11. card grid preserved;
12. company identity is primary;
13. protocol labels not shown by default;
14. integration-mode recommendation not shown by default;
15. environment pair only if authorized;
16. internal codes absent;
17. `Phenomenon / Essence` absent;
18. no development logs;
19. no audit-chain exposure;
20. no provisional fallback;
21. public sources available through detail;
22. analytical and outcome sources separable;
23. no causal savings claims;
24. no BUY / DON'T BUY;
25. no company endorsement implication;
26. American English only;
27. WCAG target maintained;
28. real links preserved;
29. empty / partial publication state supported;
30. every quantitative card claim has traceability.

---

# 84. Финальный принцип

> **Historical cases are evidence of how the method is applied, not a marketing shortcut to “we predicted the past.”**

> **The known outcome must never contaminate the authority of the pre-event analytical basis.**

> **Show fewer cases rather than publish one case without valid Final Calibrated Replay authority.**
