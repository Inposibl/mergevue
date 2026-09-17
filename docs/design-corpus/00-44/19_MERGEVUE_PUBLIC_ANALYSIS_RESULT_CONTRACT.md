# 19. Контракт результата публичного анализа MergeVue

**Статус документа:** управляющий постраничный контракт / canonical public-result authority  
**Файл:** `19_MERGEVUE_PUBLIC_ANALYSIS_RESULT_CONTRACT.md`  
**Версия:** 1.0  
**Дата:** 16 сентября 2026 года  
**Язык документации:** русский  
**Язык коммерческого интерфейса:** только American English  
**Рынок первой версии:** США  
**Входной контракт:** `18_MERGEVUE_DEAL_ENTRY_AND_PUBLIC_ANALYSIS_START_CONTRACT.md`  
**Текущий canonical report model:** `src/reporting/mergevuePublicReportModel.js`  
**Текущий canonical design lineage:** `src/reporting/mergevueForecastBriefDesignRenderer.js`  
**Главный принцип:** первый публичный результат должен использовать существующую каноническую структуру отчёта, но показывать только то, что действительно поддержано текущими public evidence и report authority  
**Ключевые инварианты:** `SAME CANONICAL REPORT STRUCTURE`, `EVIDENCE BEFORE CONCLUSION`, `BLOCK-LEVEL FAIL CLOSED`, `NO FAKE COMPLETENESS`, `PUBLIC RESULT BEFORE ACCOUNT`, `CONGRUENT WITH PAID/EXPERT REPORT`

---

# 0. Назначение

Эта surface является первым реальным результатом после:

```text
Acquirer + Target
→ entity resolution
→ public-source analysis
→ public result
```

Она должна дать пользователю полезный decision-relevant answer до:

- account;
- payment;
- private documents;
- canonical organizational questionnaires;
- 42Q;
- human analyst review.

Но она не имеет права создавать ложное впечатление, что публичных источников всегда достаточно для полного MergeVue report.

---

# 1. Основной product promise

Публичный результат отвечает:

> `What does the available public evidence support about the organizational assumptions behind this deal, what remains unresolved, and what deserves further diligence?`

Не:

> `Will this deal succeed?`

Не:

> `Which company has the better culture?`

Не:

> `Which executive will leave?`

---

# 2. Existing-product-first

Новый report design не создаётся с нуля.

В текущем `main` уже существуют:

- server-authorized final deliverables;
- `mergevuePublicReportModel.js`;
- fixed public report blocks;
- public report validators;
- PDF generation;
- email copy;
- visual Forecast Brief renderer;
- fail-closed report authority.

Следовательно:

> **REUSE THE CANONICAL PUBLIC REPORT MODEL BEFORE INVENTING A NEW RESULT DASHBOARD.**

---

# 3. Current report authority gate — сохранить

Текущий `FinalDeliverablesScreen` проверяет server report authority.

Если authority отсутствует:

`Final deliverables are locked`

и:

`The current assessment has not received server report authority.`

Это правильный fail-closed pattern.

Verdict:

**KEEP PRINCIPLE.**

Нельзя показывать аналитический report только потому, что frontend может собрать красивый объект локально.

---

# 4. Новый public-analysis authority

Deal-first public analysis может иметь собственный authoritative server projection.

Концептуально:

```text
public analysis request
→ evidence collection
→ evidence validation
→ public interpretation authority
→ public report projection
→ render
```

UI не должен определять truth сам.

---

# 5. PROJECTION ≠ CLIENT STATE

Нельзя строить public result непосредственно из:

- form values;
- locally inferred environment;
- client-side score;
- raw LLM text;
- partial research snippets.

Отчёт рендерится только из authoritative public projection.

---

# 6. Текущие 12 public report blocks

Current canonical order:

1. `Executive Decision Summary`
2. `Structural Watchpoints`
3. `Compatibility Score & Deal Scenario`
4. `Identified Environment Types`
5. `Collision Thesis`
6. `Resource Conflict Map`
7. `Timeline of Expected Friction`
8. `Economic Risk Translation`
9. `Recommended Actions`
10. `Decision Gap`
11. `What the Full Engagement Adds`
12. `Audit Footer`

Это существующая каноническая report grammar.

По умолчанию:

> **KEEP ORDER.**

---

# 7. Каноническая структура важнее dashboard aesthetics

Не заменять отчёт набором случайных dashboard cards:

- `Compatibility 68/100`;
- `Key Risks`;
- `People`;
- `42Q Copilot`;
- `Recommended Actions`;
- `AI Insights`;

только потому, что такой layout выглядит как SaaS.

Если отдельный paid workspace использует dashboard, report всё равно должен сохранять canonical claim structure.

---

# 8. Congruence rule

Public user report, paid report и expert/adjudication view должны быть **block-congruent**.

То есть:

- те же основные blocks;
- тот же order;
- те же claims;
- тот же meaning.

Expert view может добавлять:

- evidence provenance;
- technical fields;
- alternatives;
- conflicts;
- decision controls;
- adjudication states.

Но не создаёт другой unrelated report.

---

# 9. Новый ключевой principle — BLOCK-LEVEL FAIL CLOSED

Наличие 12 canonical blocks **не означает**, что каждый public-source analysis обязан заполнить все 12.

Для каждого блока допустимы состояния:

- `Available`;
- `Limited`;
- `Not enough public evidence`;
- `Not applicable`;
- `Requires private evidence`;
- `Requires individual data`;
- `Blocked by contradiction`.

Нельзя заполнять отсутствующий block выдуманным содержанием.

---

# 10. NO FAKE COMPLETENESS

После ввода двух компаний запрещено автоматически показывать:

- Environment pair;
- ECS;
- resource conflicts;
- precise timeline;
- economic exposure;
- named leader forecast;

если public evidence не поддерживает соответствующий вывод.

Пустой / limited block лучше fabricated certainty.

---

# 11. Public result can be materially useful without complete classification

Пример законного результата:

```text
Executive Decision Summary        AVAILABLE
Structural Watchpoints            AVAILABLE
Compatibility Score               NOT ENOUGH PUBLIC EVIDENCE
Environment Types                 TARGET LIMITED
Collision Thesis                  LIMITED
Resource Conflict Map             NOT ENOUGH PUBLIC EVIDENCE
Timeline                          LIMITED
Economic Risk Translation         REQUIRES DEAL ECONOMICS
Recommended Actions               AVAILABLE
Decision Gap                      AVAILABLE
Full Engagement Adds              AVAILABLE
Audit Footer                      AVAILABLE
```

Такой report является нормальным.

---

# 12. Unknown is a product result

`Unknown`, `Not enough evidence`, `Cannot determine` — не ошибки UX.

Они показывают:

- где public layer заканчивается;
- какие assumptions нельзя считать установленными;
- что нужно проверить следующим шагом.

---

# 13. Current brand fields

Current report model использует:

- `Mergevue`;
- `Post-Deal Friction Preview`;
- `Structural Read`.

Эти strings являются current implementation copy.

Они **не должны автоматически считаться вечным brand authority**.

В рамках нового product direction они проходят content audit.

---

# 14. Public product naming target

Public result должен ощущаться частью:

> **MergeVue M&A Organizational Risk Intelligence**

но финальный product/report label требует отдельного brand/content decision.

Не придумывать:

- `AI Deal Oracle`;
- `Culture Compatibility Report`;
- `Leadership Risk Score`;
- новый proprietary report name.

---

# 15. Current validators — сохранить и расширять

Текущий public report уже имеет forbidden-output protections.

В validators запрещены, среди прочего, формулировки уровня:

- audit-grade confirmation;
- removes the guesswork;
- validated without deviation;
- proven hit-rate;
- named leader / named critical-role overreach;
- raw internal notation leakage;
- placeholder / TODO leakage.

Это ценный production pattern.

Verdict:

**KEEP AND EXTEND — DO NOT BYPASS.**

---

# 16. Report rendering must not bypass validators

Запрещён path:

```text
LLM text
→ React component
→ user
```

Нужен path:

```text
Fact / evidence model
→ governed interpretation
→ narrative rewrite if applicable
→ anti-hallucination / claims checks
→ authoritative report projection
→ renderer
```

---

# 17. Narrative architecture

Existing narrative architecture:

```text
Fact Pack
→ LLM rewrite
→ anti-hallucination verification
→ verified client narrative
```

Это допустимо.

LLM не является source of report truth.

---

# 18. Executive Decision Summary

Current fields:

- headline;
- oneParagraphSummary;
- decisionImplication;
- mainRisk;
- recommendedAction.

Verdict:

**KEEP STRUCTURE.**

Но public evidence may constrain claims.

---

# 19. Executive Summary must lead with the assumption, not a score

Preferred order:

1. material organizational assumption;
2. what public evidence supports;
3. material uncertainty;
4. what to check next.

Do not lead with:

`Compatibility: 71/100`.

---

# 20. Public headline

Good pattern:

`Decision rights appear to be the first organizational assumption that needs deeper diligence.`

Bad:

`This deal will fail because the cultures are incompatible.`

---

# 21. Structural Watchpoints

This block is particularly useful for public analysis.

It can show:

- observable tension;
- assumption under pressure;
- public evidence;
- unresolved contradiction;
- recommended diligence check.

This may be the most valuable FREE block when full environment inference is unavailable.

---

# 22. Watchpoint ≠ prediction

A watchpoint says:

> monitor / investigate this mechanism.

A forecast says:

> a bounded event or observable condition is expected in a defined window.

Do not conflate them.

---

# 23. Current sealed-prediction structure

Current report model includes `sealedPredictions` with:

- statusTitle;
- statusDescription;
- predictions.

Public FREE result must not imply a scored locked forecast ledger if it is not one.

Current design renderer already contains language that the preview is not a scored forecast ledger.

Keep that boundary.

---

# 24. Public forecasts only when authorized

A public-source analysis may produce a bounded forecast only if:

- inputs sufficient;
- forecast authority exists;
- timing logic supported;
- observable sign specified;
- verification condition specified.

Otherwise:

> show watchpoint, not forecast.

---

# 25. Compatibility Score & Deal Scenario

Current fields include:

- Acquirer;
- Target;
- deal type;
- enterprise value band;
- data quality;
- compatibility score;
- compatibility band;
- compatibility explanation.

This block requires significant evidence discipline.

---

# 26. ECS availability gate

Show ECS only if:

- both environment readings lawfully available;
- current resource model applicable;
- report authority includes canonical ECS;
- evidence gate allows release.

Otherwise:

`Compatibility score not available from current public evidence.`

---

# 27. ECS is not a deal score

Required nearby boundary:

`The Environment Compatibility Score is a structural measure. It is not a probability of deal success or a recommendation to proceed or stop.`

Do not hide this in footer only.

---

# 28. Compatibility band

Do not reintroduce old score-band economic claims removed by `14`.

A compatibility band, if retained, must have a current governing semantic definition.

It cannot imply:

- success chance;
- EV loss;
- synergy realization;
- talent flight probability.

---

# 29. Enterprise value band

Current public model contains an illustrative EV band.

New deal-first public result must not fabricate enterprise value.

If public sources provide reliable transaction value:

- may show sourced context.

If not:

`Deal value not established from current public evidence.`

---

# 30. Identified Environment Types

Current model fields include:

- Acquirer environment;
- Target environment;
- descriptions;
- behavior patterns.

Verdict:

**KEEP BLOCK, CHANGE PUBLIC LABEL IF NEEDED.**

`Types` risks personality-test interpretation.

Preferred direction:

`Interaction Environment Readings`

subject to content authority.

---

# 31. Environment classification is evidence-bound

States can be:

- supported;
- provisional;
- unresolved;
- unavailable.

Never force both sides into one of nine just to complete report layout.

---

# 32. Public names only

Use only:

- The Idea Lab;
- The Performance Arena;
- The Disruption Lab;
- The Mission Field;
- The Creative Commons;
- The Hometown Network;
- The Franchise Machine;
- The Power Racket;
- The Enforcer Network.

No internal codes in client report.

---

# 33. Environment ≠ personality

Report should never write:

`The CEO is a Power Racket.`

Organizational environment reading is organizational, not a personal type label.

---

# 34. Collision Thesis

Current fields:

- collisionHeadline;
- collisionSummary;
- primaryTension;
- whyItMatters;
- postCloseFailureMode.

This block should be preserved only when evidence supports a cross-side mechanism.

---

# 35. Rename “Collision” only if needed

`Collision Thesis` is existing report vocabulary.

It may remain if public-safe.

Possible more neutral label:

`Organizational Friction Thesis`

requires separate content decision.

Designer cannot rename it independently.

---

# 36. No deterministic failure language

`postCloseFailureMode` must not become:

`where the integration will fracture`.

Prefer:

`A plausible failure mode if the identified tension is not resolved.`

---

# 37. Resource Conflict Map

Current report model has canonical resource-conflict structures and public direction copy.

This is valuable.

Verdict:

**KEEP WHEN AUTHORIZED.**

---

# 38. Resource map does not require all 17 resources

Public result should prioritize material resources.

But if it calls itself a complete map:

- all 17 must be represented consistently.

Default public view:

> material resources first.

---

# 39. Resource effects

Current public vocabulary includes:

- `Amplifies`;
- `Suppresses`;
- `Neutral`.

These can remain if current methodology authority confirms them.

Do not turn into:

- good;
- bad;
- percentage risk.

---

# 40. Raw notation is internal

Do not show:

`+|-`

`~|+`

or internal environment codes.

Existing validator already protects against raw notation leakage.

Keep this protection.

---

# 41. Timeline of Expected Friction

Current report contains:

- timing logic;
- phases;
- expected friction;
- observable signal;
- recommended check.

Verdict:

**KEEP ONLY WHEN TIMING AUTHORITY EXISTS.**

---

# 42. No generic timeline filler

Do not invent:

- Day 30;
- Day 60;
- 6–18 months;
- first 100 days;

because such phases look useful.

Timing must be derived from governing forecast logic.

---

# 43. Timeline unavailable state

Client copy:

`The current public evidence does not support a reliable timing window.`

This is better than fake precision.

---

# 44. Economic Risk Translation

Current public model contains a substantial economic block.

But current report validators also explicitly restrict hard risk-envelope language.

New public result must stay conservative.

---

# 45. Public economic block purpose

FREE/public result can explain:

- which value-creation dependency may be exposed;
- which organizational assumption matters economically;
- which economic channels require deeper modeling.

It must not automatically calculate:

- expected loss;
- total risk envelope;
- ROI;
- savings.

---

# 46. Economic Exposure formula concept

Public product can explain the chain:

```text
Deal thesis
→ value-creation dependency
→ organizational assumption
→ risk mechanism
→ economic exposure
```

But quantified economic exposure requires proper deal economics and paid methodology.

---

# 47. No causal dollar claim

Not:

`$40M is at risk because of culture.`

Without governed economic bridge.

Safe:

`This value-creation dependency should be tested before assigning a quantified exposure.`

---

# 48. Recommended Actions

Current public report has recommended actions.

This is valuable if actions are bounded.

Verdict:

**KEEP.**

---

# 49. Action should be diligence-oriented in FREE

Examples:

- verify decision-rights ownership;
- test retention dependency;
- check authority conflict;
- preserve a critical operating routine until evidence improves.

Avoid pretending FREE is a full PMI plan.

---

# 50. Recommendation confidence

If action is driven by limited public evidence:

say so.

No universal mandatory protocol without authority.

---

# 51. Decision Gap

This block is highly valuable for progressive disclosure.

It should answer:

> `What important decision cannot yet be supported by the available evidence?`

This naturally creates a reason for deeper evidence without sales pressure.

---

# 52. Decision Gap target structure

Potential:

- unresolved question;
- why it matters;
- what evidence is missing;
- what next evidence channel could resolve it.

---

# 53. Decision Gap is not upsell copy

Do not write:

`Upgrade to unlock the answer.`

First explain actual epistemic gap.

Then:

`Private evidence may help resolve this question.`

---

# 54. What the Full Engagement Adds

Current canonical block exists.

Verdict:

**KEEP, BUT SUBORDINATE.**

It appears after public value.

---

# 55. Full engagement explanation

Can include:

- private-document evidence;
- structured organizational observations;
- deeper economic exposure;
- controlled forecast release;
- specific-leader forecast when 42Q is available and requested;
- additional review gates.

---

# 56. Do not make 42Q a generic paid feature

Correct:

`Specific-leader forecasting requires individual data.`

Not:

`Paid plans include personality profiling.`

---

# 57. Audit Footer

Current model includes:

- report ID;
- generatedAt;
- reportVersion;
- scenarioId;
- source;
- brand;
- contactEmail;
- public URL pattern;
- track record URL.

This structure is valuable.

---

# 58. Audit footer purpose

It provides:

- report identity;
- version trace;
- production provenance;
- reproducibility anchor.

It should not become audit theater.

---

# 59. What not to expose in public footer

No:

- Git commit hash by default;
- provider/model names;
- internal CORR IDs;
- Owner acceptance IDs;
- hidden artifact hashes;
- internal rater names.

Unless a separate technical transparency surface requires them.

---

# 60. Data Quality

Public report already carries evidence-quality concepts.

The result surface should expose quality in business-readable form.

Possible states:

- Strong public support;
- Moderate public support;
- Limited public support;
- Insufficient public evidence.

Exact labels must map to governing thresholds.

---

# 61. Do not invent confidence percentages

No:

`83% confidence`

unless methodology defines and validates that exact numeric quantity.

Use categorical confidence where controlling.

---

# 62. Contradictions must remain visible

If public sources conflict:

show:

`Conflicting public evidence`

and explain bounded disagreement.

Do not silently resolve by choosing the source that supports the narrative.

---

# 63. Missing evidence is not zero evidence

If no public source supports a field:

state unavailable.

Do not interpret absence as suppression / negative signal.

---

# 64. Source provenance

Every material public factual claim should be traceable to sources.

Result UI should support:

- source title;
- publisher;
- date;
- link;
- locator when available.

---

# 65. Evidence / interpretation / forecast visual separation

Recommended semantic labels:

- `Evidence`;
- `Interpretation`;
- `Risk mechanism`;
- `Watchpoint`;
- `Forecast`;
- `Unknown`.

This helps user understand claim class.

---

# 66. Inline citation pattern

Material claim can include compact:

`Sources (3)`

or citation markers.

But do not turn screen into academic bibliography.

Detailed provenance may open progressively.

---

# 67. Source count must be real

No decorative:

`126 sources analyzed`

unless count is exact and semantically meaningful.

---

# 68. Source recency / cutoff

For current deal analysis, show relevant temporal context when material.

Example:

`Public evidence reviewed through September 16, 2026.`

Only if analysis actually has such cutoff.

---

# 69. Result timestamp

Show:

`Generated Sep 16, 2026`

or actual generated date.

For American English use unambiguous date format.

---

# 70. Public analysis is not historical replay by default

If user analyzes an active/current transaction:

this is current public analysis.

Do not show historical case replay language.

If deal is historical and user requests pre-event reconstruction:

use `17` case-study governance.

---

# 71. Public result is not a deal verdict

Required limitation near executive layer:

`This analysis is not a recommendation to proceed with or abandon the transaction.`

Use exact approved copy from current report authority where available.

---

# 72. Not valuation

If economic block present:

`This is not a valuation opinion.`

Current report model already contains this boundary.

Keep.

---

# 73. Not employment decision

If people-related risk appears:

report must not become automated employment decision support.

No:

- fire;
- retain;
- promote;
- remove

as automated recommendation about named person in FREE.

---

# 74. Named people in public result

Default:

> do not produce named-person behavioral forecast from public organizational analysis.

Specific leader forecast requires 42Q / individual-data path.

---

# 75. Public facts about executives

A public report may mention a named executive as a factual transaction actor if relevant and sourced.

This is distinct from:

> predicting their personal behavior.

---

# 76. Current `Post-Deal Friction Preview` renderer

Existing design renderer already frames the report as:

`Display-only structural preview`

and explicitly says it is not:

- scored forecast ledger;
- valuation opinion;
- deal verdict.

This boundary is valuable.

---

# 77. “Display-only” wording review

`Display-only` may be implementation-era language.

It can be simplified in future UX if function remains:

> public preview ≠ locked paid forecast ledger.

Do not remove semantic boundary.

---

# 78. Visual direction — preserve current Forecast Brief lineage

Existing canonical renderer is closer to target than a generic analytics dashboard.

Preserve:

- light neutral background;
- navy / blue;
- white report surfaces;
- thin borders;
- 8px radius;
- structured section rhythm;
- restrained information density;
- print compatibility.

---

# 79. On-screen report vs PDF

Screen and PDF must be semantically congruent.

No:

- stronger claim in PDF;
- missing limitation in email;
- different environment pair;
- different ECS.

---

# 80. Email result

If user later requests email delivery:

email is distribution of the same authorized report.

It does not regenerate interpretation independently.

---

# 81. Public result before email capture

Do not require email to reveal public result.

Email is optional:

`Email this analysis`

or account/save action after value.

---

# 82. Account CTA

After result:

`Save this deal`

can require account.

Explain benefit:

- save analysis;
- track updates;
- add internal evidence;
- collaborate.

---

# 83. Paid CTA

After `Decision Gap` / `What the Full Engagement Adds`:

possible:

`Go deeper with private evidence`

Not:

`Upgrade to see the real answer.`

---

# 84. Public result limitations block

Current model exposes `evidenceBasisAndLimits` even though canonical block label list calls corresponding section `Decision Gap`.

Target report should make limitations explicit.

Do not bury all uncertainty in footer.

---

# 85. Block nomenclature consistency

Current model and renderer may have legacy naming differences.

Before implementation:

create a canonical block-ID → public label registry.

Do not allow:

- screen label A;
- PDF label B;
- email label C

for same block without reason.

---

# 86. Canonical report block registry target

Conceptual:

```text
blockId
publicLabel
order
availabilityState
claimClassesAllowed
sourceRequirements
paidExpansion?
```

This reduces semantic drift.

---

# 87. Block availability states

Each block in authoritative projection should carry machine-readable state.

Example:

```text
status: AVAILABLE
status: LIMITED
status: INSUFFICIENT_PUBLIC_EVIDENCE
status: REQUIRES_PRIVATE_EVIDENCE
status: NOT_APPLICABLE
status: BLOCKED_BY_CONTRADICTION
```

Exact enum engineering decision may differ.

---

# 88. UI rendering of unavailable block

Do not hide all unavailable blocks by default.

For decision-relevant blocks, showing why unavailable can create value.

Example:

`Compatibility Score`

`Not available from current public evidence.`

`A defensible score requires reliable environment readings for both sides.`

---

# 89. Avoid paywall-shaped unknowns

If unavailable because evidence is missing:

say evidence missing.

If requires private data:

say private data required.

Do not label both:

`Premium feature`.

---

# 90. Public report should tell user what to verify next

Every material unknown should ideally map to:

- a diligence question;
- a source category;
- structured observation;
- private document;
- later individual-data need.

This makes uncertainty actionable.

---

# 91. Report result states

Page-level states:

## Researching

analysis not yet authoritative.

## Partial result available

some blocks authorized.

## Result ready

public report projection ready.

## Cannot determine

insufficient evidence for central conclusion.

## Blocked

material contradiction / authority gate blocks release.

## Temporarily unavailable

technical failure.

---

# 92. Partial result

If some blocks are ready while others still researching:

show partial only if server authority explicitly allows partial release.

Do not stream speculative LLM content before authority.

---

# 93. Researching screen

Can show real stages:

- resolving transaction;
- collecting public evidence;
- evaluating evidence;
- preparing public analysis.

No fake percentage.

---

# 94. Technical failure

Client copy:

`Deal analysis is temporarily unavailable.`

Keep deal identity.

Allow retry.

Do not route to questionnaire as fallback.

---

# 95. Cannot determine

Client-facing structure:

- what was established;
- what remains unknown;
- what blocked determination;
- what evidence would help.

This is a full result, not an error.

---

# 96. Evidence integrity state

Current model already supports `NOT ASSESSED` in some evidence-integrity paths.

Keep distinction:

- not assessed;
- assessed low;
- missing.

Do not collapse them.

---

# 97. Provisional state

Current report model already supports a `provisional` qualification.

This is useful.

UI must make provisional status visible near affected blocks.

---

# 98. Provisional does not mean useless

Safe:

`The result can be used as a preliminary diligence view, but the affected conclusions should not be treated as high-confidence until additional evidence is available.`

Use exact governed copy where existing.

---

# 99. Homogeneous / same-environment cases

Current model has separate homogeneous handling.

Do not force collision-language onto same-environment cases.

Existing validators already prohibit heterogeneous copy in homogeneous reports.

Keep.

---

# 100. Same environment does not mean no risk

If both sides share an environment:

report should explain structural similarity and any same-direction blind spots.

No:

`Perfect fit`.

---

# 101. Concealed conflict

Current public report supports a bounded false-alignment / concealed-conflict explanation.

This is important:

> high compatibility can coexist with material latent differences.

Do not simplify report to one score.

---

# 102. Public source evidence and questionnaires are distinct channels

Result should indicate evidence source class.

Public-source result:

`Public evidence`

Later internal result:

`Structured organizational observations`

Paid:

`Private evidence`

Do not merge provenance.

---

# 103. If report later deepens, preserve canonical block positions

Example:

Public:

`Resource Conflict Map — Limited`

After internal evidence:

same block becomes richer.

Do not create unrelated second report.

---

# 104. Expert escalation

If paid output requires expert review:

expert sees expanded same block.

Client should not receive a different claim ordering because expert tool has another structure.

---

# 105. Report versioning

Current model includes report version.

Keep.

If methodology changes:

- report version updates;
- old saved reports preserve their version;
- do not silently re-render old analysis under new semantics without labeling.

---

# 106. Analysis freshness

For public research:

report should retain evidence cutoff / generatedAt.

If user revisits later:

possible action:

`Refresh public evidence`

only if supported.

Do not silently mutate saved report.

---

# 107. Refresh behavior

A refreshed analysis is a new version.

Preserve previous version if user saved deal and version history exists.

This is later workspace behavior but report architecture should not preclude it.

---

# 108. Print behavior

Public result should print cleanly.

Preserve:

- block order;
- limitation text;
- report identity;
- generated date;
- evidence availability states.

Do not hide disclaimers in print CSS.

---

# 109. PDF behavior

PDF must use same authoritative projection.

No separate PDF-only calculations.

No client-side recomputation.

---

# 110. Accessibility

Target:

WCAG 2.2 AA.

Must include:

- one H1;
- semantic H2 block headings;
- logical order matching canonical block order;
- accessible status text;
- source links;
- tables with headers where used;
- no color-only confidence/risk meaning;
- keyboard access to provenance disclosures;
- mobile reflow.

---

# 111. Mobile order

Mobile preserves canonical order.

Do not reorder cards for visual convenience.

Executive summary first.

Audit footer last.

---

# 112. Graphs / diagrams

Only use if they clarify real data.

No decorative radar chart.

No fake trend line.

No invented compatibility gauge.

A resource diagram must have textual equivalent.

---

# 113. Score visualization

If ECS shown:

prefer restrained numeric/card treatment.

Do not make giant circular gauge the visual hero.

Main value is mechanism and evidence.

---

# 114. Colors

Use status colors carefully.

Red is not `bad deal`.

Green is not `good deal`.

Use color for bounded status:

- contradiction;
- blocked;
- verified;
- provisional.

Always with text.

---

# 115. Visual canon

Reuse current Forecast Brief visual language:

- background `#F6F7F8` / current compatible light gray;
- white surfaces;
- dark ink;
- restrained navy/blue;
- thin gray borders;
- 8px radius;
- Inter/system sans;
- mono for IDs / timestamps if needed;
- minimal shadow.

No neon / gradient AI aesthetic.

---

# 116. Public shell vs report shell

Report may use a report-focused shell while keeping public navigation accessible.

Do not introduce unrelated dashboard navigation.

If user is anonymous:

- Home;
- Methodology;
- Historical Cases;
- Analyze a deal

remain understandable paths.

---

# 117. Result identity

Top area should show:

- Acquirer × Target;
- report / analysis label;
- generated date;
- evidence scope;
- optional overall data-quality state.

Do not lead with account upsell.

---

# 118. H1 candidate

`Acquirer × Target`

Supporting:

`Public organizational risk analysis`

This is clearer than generic:

`Results`.

---

# 119. Evidence scope line

Candidate:

`Based on publicly available evidence reviewed for this analysis.`

If cutoff exists:

`Public evidence reviewed through Sep 16, 2026.`

Only use actual cutoff.

---

# 120. Public result limitations near top

Compact note:

`This public analysis is a diligence aid, not a valuation opinion or a recommendation to proceed with or abandon the transaction.`

Do not hide only in footer.

---

# 121. No user registration overlay

Do not blur report and require signup to reveal it.

Public result means public result.

---

# 122. Save / email actions

After result:

- `Save this deal`;
- `Email this analysis`;
- `Download PDF` if supported.

These are secondary actions.

They do not block reading.

---

# 123. Download PDF

Only show if production PDF is generated from same authoritative report model.

Current architecture already has PDF path.

Keep that lineage.

---

# 124. Email analysis

Only if email system available.

Do not invent delivery success.

Email capture occurs after report value.

---

# 125. Sources action

Potential:

`View evidence`

opens provenance details.

This can materially strengthen trust.

But raw internal evidence objects should not leak.

---

# 126. Evidence privacy

Public analysis uses public evidence.

If later report includes private evidence:

source presentation must respect permissions.

Same report block can display:

`Private evidence — access restricted`

without exposing document content to unauthorized users.

---

# 127. No respondent leakage

Paid / questionnaire evidence must not expose individual respondent identity unless governance explicitly permits.

Public FREE report never exposes private respondent metadata.

---

# 128. Action hierarchy at end

Preferred:

Primary next value action:

`Add internal evidence`

or:

`Go deeper with private evidence`

if context warrants.

Secondary:

`Save this deal`

`Read the methodology`

Do not always make payment the primary CTA.

---

# 129. Public-to-internal transition

If user chooses `Add internal evidence`:

then account / respondent context can begin.

This is where existing diagnostic architecture becomes relevant.

---

# 130. Preserve old downstream architecture

Do not delete:

- acquirer questionnaire;
- target observation;
- target self assessment;
- evidence classification;
- contradiction engine;
- triage;
- final report.

The new public result sits **before** these deeper channels.

---

# 131. Current report model can be reused selectively

Some current blocks depend on questionnaire-derived deliverable.

New public-source analysis should not fake those inputs.

Implementation options:

1. authoritative public-analysis projection maps into same report schema;
2. schema evolves to block-level availability states;
3. renderer supports unavailable/limited blocks.

Preferred:

> evolve current schema, not fork a second report universe.

---

# 132. No duplicated report models

Avoid:

- `publicSourceReportV2` with unrelated fields;
- `questionnaireReportV1` with different order;
- `paidExpertReport` with another claim system.

Canonical blocks should survive evidence-channel expansion.

---

# 133. Report-model migration requirement

Before implementation:

create mapping:

```text
CURRENT FIELD
→ CANONICAL CLAIM / BLOCK
→ REQUIRED EVIDENCE
→ PUBLIC-SOURCE AVAILABILITY
→ PAID EXPANSION
```

This prevents accidental semantics change.

---

# 134. Current top-level model keys

Current report model already contains structured objects including:

- brand;
- metadata;
- executiveDecisionSummary;
- sealedPredictions;
- compatibilityScoreAndDealScenario;
- theTwoEnvironments;
- collisionThesis;
- resourceConflictMap;
- timelineOfExpectedFriction;
- economicRiskTranslation;
- recommendedActions;
- evidenceBasisAndLimits;
- whatTheFullEngagementAdds;
- auditFooter.

This is a strong foundation.

---

# 135. Preserve machine-readable structure

Do not collapse report back into one giant LLM narrative.

Structured fields enable:

- validation;
- screen/PDF parity;
- expert congruence;
- claims checking;
- source binding;
- versioning.

---

# 136. Narrative may summarize, not replace structure

Executive narrative is an overlay over structured facts.

If narrative conflicts with structured model:

> fail release.

---

# 137. Claims registry

Each material report field should conceptually map to:

- claim class;
- evidence requirement;
- confidence / availability state;
- provenance;
- public/private visibility.

This should be machine-enforceable where practical.

---

# 138. Deal result without Environment pair

A public analysis may still produce:

- assumptions under pressure;
- governance watchpoints;
- contradictory evidence;
- diligence actions;

without environment classification.

Do not make environment pair mandatory for all public value.

---

# 139. Deal result without ECS

Same principle.

ECS is one structural output, not the existence condition for MergeVue value.

---

# 140. Deal result without economic quantification

Still useful.

Can say:

`This assumption appears material to the integration thesis, but public evidence is insufficient to quantify economic exposure.`

---

# 141. Public result and Product North Star

The report should answer:

- what assumption is expensive;
- what evidence puts it under pressure;
- when / how it may become observable if support exists;
- what to verify before relying on it.

This is more important than showing all model machinery.

---

# 142. No generic “culture fit” language

Avoid:

- cultural fit;
- culture clash score;
- culture compatibility as sole frame.

MergeVue analyzes organizational interaction and resource mechanisms.

---

# 143. No deal-success prediction

Do not write:

`68% chance of successful integration`.

No such output without a separate validated probabilistic model.

---

# 144. No overall recommendation

Do not output:

- BUY;
- DON'T BUY;
- proceed;
- reject deal.

Recommended actions are diligence / integration-control actions, not political-style choice or transaction verdict.

---

# 145. No hidden score synthesis

Do not combine:

- ECS;
- data quality;
- risk tiers;
- source count

into a new `MergeVue Score`.

---

# 146. Output language

American English only.

Use:

- organization;
- behavior;
- analyze;
- prioritization.

Avoid British spellings inherited from old files.

---

# 147. Sentence case

Report labels:

`Executive decision summary`

may use sentence case in UI even if current constant has title case.

But block identity remains the same.

Final capitalization can be visual-system decision.

---

# 148. Dates

Use:

`September 16, 2026`

or:

`Sep 16, 2026`.

Avoid ambiguous numeric dates.

---

# 149. Money

Use:

`$5 million`

or:

`$5M`

consistently.

Do not use precise currency figures unless sourced.

---

# 150. Loading-to-result transition

When authority becomes ready:

- preserve deal identity;
- move focus to report H1 / status announcement accessibly;
- no celebratory animation;
- no confetti.

---

# 151. Failure-to-result transition

If analysis blocked:

show reason class, not internal exception.

Examples:

`Insufficient public evidence`

`Conflicting evidence prevents a reliable conclusion`

`Analysis service unavailable`

---

# 152. Report refresh / retry

Technical retry:

`Try again`

Evidence refresh:

`Refresh public evidence`

These are different actions.

---

# 153. Sharing

Public anonymous report should not automatically have globally guessable URL containing confidential pair data.

Share-link architecture requires separate access/share contract.

---

# 154. SEO / indexing

User-generated deal analyses should not be indexed publicly by default.

Historical case studies are separate public editorial artifacts.

---

# 155. Privacy of active deal

Even when companies are public, the fact that a user is analyzing a specific pair may be sensitive.

Do not expose:

- recent public analyses;
- popular user-entered deals;
- activity feed.

---

# 156. Analytics

Useful funnel:

```text
public_analysis_result_ready
public_analysis_result_viewed
source_provenance_opened
decision_gap_viewed
save_deal_selected
add_internal_evidence_selected
paid_depth_selected
```

Do not log private evidence into marketing analytics.

---

# 157. Success metric

A good public result causes the user to understand:

1. what is supported;
2. what is uncertain;
3. why it matters;
4. what to check next.

Not simply:

> user clicked Upgrade.

---

# 158. Existing block decision matrix

| Current canonical block | Decision |
|---|---|
| Executive Decision Summary | **KEEP** |
| Structural Watchpoints | **KEEP** |
| Compatibility Score & Deal Scenario | **KEEP + BLOCK-LEVEL AVAILABILITY** |
| Identified Environment Types | **KEEP / LABEL REVIEW** |
| Collision Thesis | **KEEP + CLAIMS BOUNDARY** |
| Resource Conflict Map | **KEEP WHEN AUTHORIZED** |
| Timeline of Expected Friction | **KEEP WHEN TIMING SUPPORTED** |
| Economic Risk Translation | **KEEP, QUALITATIVE IN PUBLIC UNLESS AUTHORIZED** |
| Recommended Actions | **KEEP** |
| Decision Gap | **KEEP / STRENGTHEN** |
| What the Full Engagement Adds | **KEEP, SUBORDINATE** |
| Audit Footer | **KEEP** |
| Fixed all-block completeness | **REMOVE** |
| Generic score-first hero | **DO NOT ADD** |
| Dashboard-only replacement | **DO NOT ADD** |

---

# 159. Current infrastructure decision matrix

| Existing asset | Decision |
|---|---|
| `mergevuePublicReportModel.js` | **KEEP + EVOLVE** |
| `mergevueForecastBriefDesignRenderer.js` | **KEEP AS VISUAL CANON SOURCE** |
| server report authority gate | **KEEP** |
| PDF path | **KEEP** |
| email copy path | **KEEP** |
| public report validators | **KEEP + EXTEND** |
| raw LLM-to-screen path | **FORBIDDEN** |
| client-side report truth | **FORBIDDEN** |
| questionnaire-only requirement for any public value | **REMOVE FROM FIRST-VALUE FLOW** |

---

# 160. Mandatory pre-implementation mapping

Before code:

| Block | Current source | Public-source evidence available? | Authority | Target availability state |
|---|---|---:|---|---|
| Executive summary | | | | |
| Watchpoints | | | | |
| Compatibility | | | | |
| Environments | | | | |
| Collision thesis | | | | |
| Resources | | | | |
| Timeline | | | | |
| Economic translation | | | | |
| Actions | | | | |
| Decision gap | | | | |
| Full engagement | | | | |
| Audit footer | | | | |

No block gets fabricated just to make table complete.

---

# 161. WHAT WAS INTENTIONALLY PRESERVED

Before merge agent must list:

- canonical report blocks;
- block order;
- report model structure;
- authority gate;
- validators;
- visual renderer lineage;
- PDF congruence;
- email congruence;
- audit footer;
- limitations architecture.

---

# 162. WHAT CHANGED AND WHY

Format:

```text
OLD
→ NEW
→ DEFECT
→ AUTHORITY
```

Example:

```text
Every public report assumes both environment readings and ECS exist
→ each canonical block carries an evidence/availability state
→ deal-first public research may not lawfully support complete classification
→ progressive disclosure + evidence-first + fail-closed report governance
```

---

# 163. Acceptance criteria

Public result passes only if:

1. entry from `18` lands on a real authoritative analysis result;
2. no account is required to read public result;
3. server / authoritative projection controls report truth;
4. current canonical block order preserved;
5. report is not replaced by generic dashboard;
6. block-level availability exists;
7. unavailable blocks are not fabricated;
8. unknown / cannot-determine supported;
9. executive summary does not overstate certainty;
10. watchpoints distinguished from forecasts;
11. forecast shown only with sufficient authority;
12. ECS shown only when valid;
13. ECS not presented as success probability;
14. no old economic score-band claims;
15. environment readings may remain unresolved;
16. public environment names only;
17. environment ≠ personality;
18. collision thesis bounded;
19. resource notation internal;
20. timeline only if evidence supports timing;
21. no generic Day 30/60 filler;
22. economic block does not fabricate dollar exposure;
23. recommended actions remain diligence/control actions;
24. Decision Gap explicitly shows missing evidence;
25. paid depth follows public value;
26. 42Q appears only for specific-leader forecast context;
27. audit footer retained;
28. internal governance IDs not leaked;
29. data quality visible;
30. contradictions visible;
31. missing evidence not converted to zero/negative signal;
32. material facts source-traceable;
33. claim classes visually distinguishable;
34. no fake source counts;
35. limitations near relevant conclusions;
36. not a deal verdict;
37. not valuation;
38. no automated employment recommendation;
39. no named-person behavioral forecast without individual data;
40. same semantic projection powers screen/PDF/email;
41. report validators remain in path;
42. LLM cannot bypass authoritative structure;
43. report version retained;
44. generated date / evidence scope accurate;
45. user-generated deal analysis not publicly indexed by default;
46. no signup overlay before result;
47. save/email/download are secondary actions;
48. public/private evidence provenance stays distinct;
49. paid/expert report remains block-congruent;
50. American English only;
51. WCAG 2.2 AA target maintained;
52. print preserves limitations and audit identity;
53. mobile preserves block order;
54. no color-only risk meaning;
55. every material claim has authority.

---

# 164. Финальный принцип

> **The public result is not a teaser version of the “real” answer. It is the strongest answer that the current public evidence lawfully supports.**

> **The report structure stays stable while evidence depth grows. Public, paid, and expert views deepen the same canonical blocks rather than creating separate truths.**

> **If a block cannot be supported, say why. Never fill a report template with invented certainty.**
