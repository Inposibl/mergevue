# 17. Контракт детальной страницы исторического кейса MergeVue

**Статус документа:** управляющий постраничный контракт / fail-closed public case-detail authority  
**Файл:** `17_MERGEVUE_HISTORICAL_CASE_DETAIL_CONTRACT.md`  
**Версия:** 1.0  
**Дата:** 16 сентября 2026 года  
**Язык документации:** русский  
**Язык коммерческого интерфейса:** только American English  
**Рынок первой версии:** США  
**Область действия:** `/case-studies/:caseId`  
**Родительский index contract:** `16_MERGEVUE_HISTORICAL_CASES_INDEX_CONTRACT.md`  
**Controlling publication invariant:** `Public Case Study Authority = Final Calibrated Replay Only`  
**Главный принцип:** детальная case-page обязана физически и визуально отделять pre-T0 analytical authority от post-T0 outcome knowledge

---

# 0. Назначение

Эта страница должна позволить пользователю ответить на пять разных вопросов, не смешивая их:

1. **What was the transaction?**
2. **What evidence was lawfully available before the defined cutoff?**
3. **What does the final calibrated replay conclude from that pre-T0 evidence?**
4. **What happened after the cutoff?**
5. **How does the observed outcome compare with the locked/public replay result?**

Страница не является:

- рассказом задним числом;
- клиентским testimonial;
- доказательством общей точности MergeVue;
- полным внутренним audit trail;
- хранилищем methodology-development artifacts.

---

# 1. Непереговорное publication rule

Public case detail существует только если case имеет valid:

> **Final Calibrated Replay public authority.**

Публикационный gate должен требовать применимые обязательные условия:

- relevant methodological closure;
- applicable method freeze;
- final methodology replay;
- sealed pre-T0 evidence set;
- no post-T0 contamination of analytical basis;
- required independent verification;
- explicit Owner acceptance for publication;
- sufficient public-source provenance.

Если gate не пройден:

> **NO AUTHORITATIVE PUBLIC CASE-STUDY RESULT YET.**

---

# 2. Fail-closed runtime behavior

При запросе:

`/case-studies/:caseId`

runtime должен проверять publication authority **до рендера аналитического содержания**.

Нельзя:

- fallback на old `CASE_STUDIES`;
- показать last-known result;
- показать provisional hypothesis;
- показать legacy website copy;
- собрать case из raw implementation fields;
- реконструировать answer из известного outcome.

---

# 3. Unknown case vs unpublished case

Это два разных состояния.

## Unknown case

`Case study not found`

Используется, когда `caseId` неизвестен.

## Known but not publicly authorized

`This historical case study is not currently available for public release.`

Не раскрывать:

- internal hold reason;
- failed audit;
- correction chain;
- Owner status;
- evidence-room state.

---

# 4. Current not-found defect

Текущий `main` пишет:

`Open the case-study index and choose one of the ten available analyses.`

Это больше не допустимо.

Причина:

> research corpus may contain ten cases, but public publication count may be smaller.

Target:

`Return to historical case studies`

без обещания конкретного количества.

---

# 5. Обязательный LIVE → MAIN → CANON audit

До редизайна агент обязан:

1. открыть live detail pages нескольких cases;
2. проверить current `/case-studies/:caseId`;
3. проверить `src/App.jsx`;
4. проверить `src/data/caseStudies.js`;
5. проверить current CSS;
6. проверить controlling public-case authority;
7. получить public-authorized final calibrated replay package конкретного case;
8. проверить public-source provenance;
9. проверить `16`;
10. проверить methodology and visual canon.

Нельзя проектировать case detail только по legacy `caseStudies.js`.

---

# 6. Фактическая current detail structure в `main`

Current page использует:

1. back link `Case studies`;
2. header;
3. outcome / industry / year kicker;
4. company-pair H1;
5. value line;
6. large `ECS / 100`;
7. protocol panel;
8. Acquirer party card;
9. Target party card;
10. `Resource Risk Map`;
11. `Predicted vs Actual Outcomes`;
12. `Framework Analysis`;
13. CTA `Run your own assessment` / `Start Diagnostic`.

Визуальная композиция профессиональная и переиспользуемая.

Семантическая authority structure — нет.

---

# 7. Общий verdict по existing blocks

| Current block | Decision |
|---|---|
| Back link | **KEEP** |
| Compact page shell | **KEEP** |
| Case identity header | **KEEP STRUCTURE / REWRITE SEMANTICS** |
| Outcome-first kicker | **REPLACE** |
| Company pair H1 | **KEEP** |
| Year / industry | **KEEP WITH EXACT SEMANTICS** |
| Value line | **MOVE / OMIT UNLESS PUBLICLY AUTHORIZED** |
| Large ECS / 100 | **DEMOTE / CONDITIONAL** |
| Protocol panel | **REPLACE / CONDITIONAL** |
| Acquirer / Target cards | **KEEP STRUCTURE** |
| Legacy party descriptions | **REPLACE WITH FINAL-REPLAY-AUTHORIZED COPY** |
| Resource Risk Map | **REPLACE WITH AUTHORIZED RESOURCE-MECHANISM VIEW** |
| Predicted vs Actual | **KEEP COMPARISON CONCEPT / REBUILD AUTHORITY BOUNDARY** |
| `ST predicted pre-close` | **REPLACE** |
| `What actually happened` | **KEEP AS POST-T0 SECTION** |
| Framework Analysis | **SPLIT INTO PRE-T0 RESULT + VERIFICATION INTERPRETATION** |
| Start Diagnostic CTA | **REPLACE → Analyze a deal** |

---

# 8. Основная новая page architecture

Target reading order:

```text
1. Back to Historical Case Studies
2. Case identity
3. Retrospective-status explanation
4. Transaction and cutoff
5. Final calibrated replay
6. Pre-T0 analytical basis
7. Structural reading / material mechanisms
8. Limitations and uncertainty
9. HARD VISUAL DIVIDER: Outcome revealed after cutoff
10. What happened
11. Verification against the replay
12. Outcome-verification sources
13. Methodology / Analyze a deal actions
```

Ключ:

> outcome cannot visually leak upward into pre-T0 analysis.

---

# 9. Hero / identity block

Recommended eyebrow:

`Historical case study`

Не:

- `FAILURE`;
- `SUCCESS`;
- `$36B destroyed`;
- `Predicted correctly`.

H1:

`Daimler-Benz × Chrysler`

или authoritative public company-pair identity.

Metadata:

`1998 · Automotive`

при условии, что year semantics consistent.

---

# 10. Transaction identity must be authoritative

Case title derives from final public case identity.

Do not inherit old UI grouping if current case geometry differs.

Must verify:

- legal / economic sides;
- transaction date;
- T0 definition;
- merger / acquisition geometry;
- subsidiaries not incorrectly treated as case side;
- public short names.

---

# 11. Date semantics

Detail page should show the actual analytical cutoff separately from the general deal year.

Recommended:

`Pre-event evidence cutoff: January 10, 2000`

or:

`Analytical cutoff: January 10, 2000`

if exact accepted public date exists.

Do not call:

`Prediction date`

unless a real prospective forecast was recorded on that date.

---

# 12. Retrospective disclosure is mandatory

Near the top, show a compact disclosure:

`Retrospective replay`

Working explanation:

`This case was reconstructed after the historical outcome was known, but the analytical replay is restricted to evidence available before the defined cutoff. Outcome evidence is shown separately below and does not form part of the analytical basis.`

This prevents false impression:

> MergeVue literally ran the case at the historical date.

---

# 13. Do not call retrospective replay “pre-close prediction”

Current:

`ST predicted pre-close`

Verdict:

**REMOVE.**

Safe headings:

`Final calibrated replay`

`What the pre-event evidence supported`

`Analytical result using pre-event evidence`

Not:

`What MergeVue predicted in 1998`

unless it actually did.

---

# 14. Pre-T0 vs post-T0 must be visually separated

Required visual boundary:

```text
PRE-EVENT ANALYSIS
────────────────────────
... analytical basis ...
... result ...
... limitations ...

OUTCOME — REVEALED AFTER THE ANALYTICAL CUTOFF
────────────────────────
... what happened ...
... verification ...
```

This separation must remain:

- on desktop;
- on mobile;
- in print;
- with screen reader structure.

---

# 15. Final calibrated replay is the only analytical result

Public analytical content must come from one authorized final replay projection.

It may include:

- final Environment reading;
- resource mechanisms;
- structural tension / support;
- bounded risk mechanism;
- forecast-like replay statements where authorized;
- uncertainty;
- limitations;
- control implications if authorized.

It may not mix:

- old hypothesis wording;
- earlier ECS;
- legacy protocol;
- new outcome interpretation.

---

# 16. Public replay may lawfully be unresolved

Valid final result can be:

- `Unresolved`;
- `Insufficient evidence`;
- blocked;
- unavailable pair;
- another accepted uncertainty state.

Page must preserve this.

Do not turn unresolved into:

- `Low confidence conclusion`;
- guessed pair;
- marketing-friendly determination.

---

# 17. Acquirer / Target cards

Current side-by-side party-card pattern is useful.

Verdict:

**KEEP GEOMETRY.**

Each card can show:

- party name;
- authorized public Interaction Environment;
- short public-safe rationale.

Do not show:

- internal environment code;
- old `Test fit:` wording by default;
- confidence number unless explicitly authorized;
- personality language.

---

# 18. If one side is unresolved

Party card should say:

`Environment reading unresolved`

or current public-authorized equivalent.

Do not hide the card.

Do not assign nearest environment.

---

# 19. Environment aliases

Only canonical public names:

- The Idea Lab;
- The Performance Arena;
- The Disruption Lab;
- The Mission Field;
- The Creative Commons;
- The Hometown Network;
- The Franchise Machine;
- The Power Racket;
- The Enforcer Network.

No internal codes.

---

# 20. ECS in case detail

Current UI gives ECS a large high-salience circle.

This is too dominant.

ECS is:

> structural compatibility measure,

not:

- deal score;
- success probability;
- safety score;
- forecast accuracy.

Target:

**ECS is subordinate analytical metadata, not the hero result.**

---

# 21. When ECS may be shown

Show exact ECS only when:

- final calibrated replay contains current valid ECS;
- exact calculation belongs to public-authorized replay;
- resource inputs are valid;
- public disclosure is authorized.

Otherwise:

> omit.

Do not fallback to legacy caseStudies.js `exactEcs`.

---

# 22. ECS visual treatment

Recommended:

small metadata card:

`Environment Compatibility Score`

`91.2 / 100`

Supporting:

`Structural compatibility measure — not a probability of deal success.`

No large green / red ring.

---

# 23. High ECS is not “safe”

Required boundary if ECS shown:

`A higher structural score does not by itself mean the deal is safer. Material risk can remain concentrated in a small number of resources or mechanisms.`

Use exact current methodology wording where available.

---

# 24. Current protocol panel

Legacy page shows:

- protocol title;
- integration mode;
- protocol body;
- stabilization timing.

Examples:

`SEAMLESS - REQUIRED PROTOCOL`

`Full Integration`

This is too prescriptive to preserve automatically.

Verdict:

**REPLACE / CONDITIONAL.**

---

# 25. Target “control implication” block

If final calibrated replay explicitly authorizes a control implication:

Heading:

`Control implication`

Then bounded business-language recommendation.

Example form:

`Preserve separate decision rights for [specific function] during [defined period or condition].`

Do not call it:

`REQUIRED PROTOCOL`

unless exact authority requires that language.

---

# 26. Integration mode is not automatic

Do not show:

- Full Integration;
- Selective Integration;
- Ring-fence;
- Seamless;

merely because legacy data contains it.

It must be current replay output or omitted.

---

# 27. Stabilization timing

A timing statement is high-risk.

Show only if:

- current replay supports it;
- evidence basis exists;
- it is not inherited from outcome knowledge.

No legacy `12–18 months` or similar without authority.

---

# 28. Current Resource Risk Map defect

Legacy implementation renders all 17 resources with numeric 0–100 scores.

It applies UI thresholds:

- high;
- medium;
- low.

This presentation must **not** be preserved as methodology truth without current authority.

---

# 29. Why legacy 0–100 resource scores are unsafe

Current controlling resource model is not simply:

> each resource has a universal risk percentage.

Numeric rows can falsely imply:

- probability;
- severity;
- validated normalization;
- comparability to ECS.

Verdict:

> **DO NOT RENDER LEGACY 0–100 RESOURCE SCORES BY DEFAULT.**

---

# 30. Target resource block

Preferred:

`Material resource mechanisms`

Show only resources materially relevant to final replay.

Potential row structure:

| Resource | Relationship | Why it matters |
|---|---|---|
| Authority | Conflict | bounded public explanation |
| Trust | Joint pressure | bounded public explanation |
| Information | Misalignment | bounded public explanation |

Exact relation vocabulary must come from current resource authority.

---

# 31. 17-resource completeness

The methodology has 17 resources.

Case detail does **not** need to show all 17 if most are non-material.

But if page claims:

`complete resource map`

then all 17 and their exact semantics must be represented.

Default:

> material resource mechanisms only.

---

# 32. No resource heatmap by decorative scoring

Do not invent:

- 0–100 risk;
- red/yellow/green bands;
- severity bars;
- percentage conflict.

Use categorical or textual relation only if current method authorizes.

---

# 33. Pre-T0 analytical basis sources

Mandatory public section:

`Analytical basis sources`

These are only sources lawfully available to the sealed pre-T0 replay.

Each source should preserve, when available:

- title;
- publisher / originating institution;
- publication date;
- public URL;
- page / section / timestamp locator.

---

# 34. Source purpose

Where useful, source can indicate:

`Supports transaction geometry`

`Supports authority structure evidence`

`Supports resource mechanism`

But do not expose internal hidden scoring.

---

# 35. Primary sources first

Order or distinguish:

- transaction filings;
- company filings;
- regulatory sources;
- official statements;
- high-quality reporting;
- secondary sources.

Internal MergeVue summary never substitutes for accessible original source.

---

# 36. Source count

Do not show a total source count if:

- analytical and outcome sources are mixed;
- citations include duplicates;
- count itself has no decision value.

Better:

> list auditable sources.

---

# 37. Final replay result block

Recommended heading:

`Final calibrated replay`

Structure:

1. `Structural reading`
2. `Material risk mechanism`
3. `Expected observable signs`
4. `Timing window`, if authorized
5. `What would weaken or falsify this reading`
6. `Limitations`

Not every case must populate every field.

---

# 38. “Forecast” wording in historical replay

Historical replay can present:

`Replay forecast statement`

only if methodologically defined.

But user-facing copy must make clear:

> this statement was generated in a retrospective replay using only pre-T0 evidence.

Avoid:

`prediction`

without retrospective qualifier.

---

# 39. Hindsight contamination test

Every sentence in pre-T0 section must pass:

> Could this sentence have been supported using only sources available before the cutoff?

If no:

> move to outcome section or remove.

---

# 40. Outcome separator

Use a strong but neutral divider.

Candidate:

`Outcome — revealed after the analytical cutoff`

Supporting:

`The evidence below is shown only to compare the historical outcome with the replay. It did not contribute to the analytical basis above.`

This text is important enough to remain visible.

---

# 41. What happened section

Current heading:

`What actually happened`

Concept is useful.

Verdict:

**KEEP.**

But all facts must be:

- sourced;
- post-T0;
- separated from analytical basis.

---

# 42. Outcome facts

Good outcome facts are concrete:

- named executive departure;
- divestiture;
- documented restructuring;
- reported write-down;
- verified operational change;
- publicly documented synergy outcome.

Avoid vague:

`culture collapsed`

unless operationalized and sourced.

---

# 43. Outcome does not retroactively validate every mechanism

If observed outcome is consistent with replay:

do not say:

`This proves the mechanism was correct.`

Safe:

`The observed outcome is consistent with the replay on [specific dimension].`

Or use canonical verification status.

---

# 44. Verification section

Heading:

`Verification against the outcome`

Must use current verification vocabulary where applicable:

- `Confirmed`;
- `Partially confirmed`;
- `Not determinable`;
- `Missed`;
- `Falsified`.

Do not reduce to:

- accuracy percentage;
- green check;
- red X only.

---

# 45. Verification must be claim-level where possible

One case can contain:

- confirmed element;
- missed event;
- unresolved part.

Therefore:

> case-level binary success/failure should not erase claim-level verification.

---

# 46. No overall “model was right” badge

Do not show:

- `Prediction correct`;
- `Model success`;
- `100% accurate`;
- `Validated`.

Instead:

`Verification result`

with bounded findings.

---

# 47. Outcome verification sources

Mandatory separate section:

`Outcome verification sources`

These sources may be post-T0.

They support:

- what happened;
- when;
- observable outcome.

They do not support pre-T0 analysis.

---

# 48. Source separation in DOM

Analytical and outcome sources should be in separate semantic sections, not one collapsible bibliography.

Reason:

> visual and accessibility structure should preserve methodological firewall.

---

# 49. Current “Predicted vs Actual Outcomes” pattern

Side-by-side comparison is useful.

But current labels are wrong.

Target:

Left:

`Final calibrated replay`

Right:

`Observed outcome`

Above grid:

`Comparison`

Required notice:

`The replay uses pre-event evidence only. Outcome evidence is shown separately for verification.`

---

# 50. Mobile comparison

On mobile:

1. replay;
2. divider;
3. observed outcome;
4. verification.

Do not interleave bullet-by-bullet unless there is exact claim pairing.

---

# 51. Current Framework Analysis

Legacy `Framework Analysis` may combine:

- pre-T0 interpretation;
- known outcome;
- recommendation.

This must be split.

---

# 52. Target analysis placement

Pre-T0 reasoning:

`Why the replay reached this result`

Post-T0 reasoning:

`Verification interpretation`

They must not be one paragraph.

---

# 53. No hindsight language in replay explanation

Forbidden in pre-T0 section:

- `as later proved`;
- `which ultimately destroyed`;
- `we now know`;
- `eventually`;
- `after the failure`;
- outcome amount.

Unless sentence is explicitly in post-T0 section.

---

# 54. Case economic amounts

Deal value or transaction price may appear in transaction metadata if:

- authoritative source;
- role clear.

Outcome loss / write-down amount belongs:

> post-T0 outcome section.

Do not place `$99B destroyed` in hero.

---

# 55. “Value destroyed” language

Requires very careful authority.

Prefer exact documented event:

`The company recorded a $99 billion write-down in 2002.`

over:

`The merger destroyed $99 billion.`

The latter makes a causal attribution.

---

# 56. Transaction metadata block

Recommended:

- Acquirer;
- Target;
- announced / signed / closed date as relevant;
- case analytical cutoff;
- industry;
- transaction type;
- publicly documented deal value if useful.

Do not overfill hero.

---

# 57. Case geometry

If legal transaction involved merger sub or special vehicle:

detail should preserve correct geometry where material.

But index / H1 may use recognizable two-side names.

A small:

`Transaction structure`

block can explain legal geometry if necessary.

---

# 58. Exact T0

T0 must come from accepted case authority.

If DATE_ONLY:

show date only.

Do not invent time.

If exact intraday time is not known:

do not imply it.

---

# 59. Pre-T0 source eligibility

Analytical source must satisfy the case temporal rule.

A later article summarizing earlier events is not automatically eligible as pre-T0 evidence merely because it discusses pre-T0 facts.

Eligibility must follow case evidence governance.

---

# 60. No post-T0 leak through excerpt

Current legacy `excerpt` fields can include outcome language.

Do not reuse them in replay hero unless checked against T0.

---

# 61. Public case identity vs legacy caseStudies.js

Legacy data may contain obsolete case identities.

Example categories:

- aggregated Pfizer megamergers;
- old names;
- old year convention;
- old environment pair.

Target detail must use:

> current publication-authorized case identity.

---

# 62. Resource / Environment consistency

Public case page must use the same public Environment names as:

- methodology;
- environment browser;
- reports.

Resource names must use current public resource labels.

No one-off synonyms.

---

# 63. Public explanation must not expose internal theory language

Forbidden:

- Phenomenon;
- Essence;
- internal codes;
- internal hypothesis IDs;
- calibration labels;
- rater labels;
- provider identities.

---

# 64. Internal audit chain

Do not show ordinary public user:

- CORR acts;
- IV chain;
- package hashes;
- Git commits;
- independent model identities;
- failed auditors;
- Owner acceptance mechanics.

These remain internal / separately governed evidence-room content.

---

# 65. Public credibility without audit theater

Credibility should come from:

- clear cutoff;
- source traceability;
- visible uncertainty;
- outcome separation;
- exact verification.

Not:

- badges;
- hash strings;
- “independently verified” stickers without scope.

---

# 66. Independent verification claim

If mentioned publicly:

must specify object.

Example safe form:

`The final replay was independently checked for consistency with the frozen case evidence and methodology.`

Only if exact authority allows.

Do not imply:

> independent verification proves predictive validity.

---

# 67. Method version

A compact audit metadata area may expose:

`Methodology version`

if stable public version exists.

Do not expose internal act names.

---

# 68. Publication version

Case page may have:

`Case study version`

and:

`Last updated`

if public projection is versioned.

This helps avoid silent historical rewrite.

---

# 69. No silent replacement of public replay

If an updated final replay becomes authority:

- version changes;
- publication history retained internally;
- public current version clearly identified.

Do not merge old/new sentences.

---

# 70. Retrospective replay disclosure survives print/export

If user prints page:

- retrospective label;
- cutoff;
- outcome divider;
- source separation

must remain.

Do not rely on interactive disclosure only.

---

# 71. Visual preservation

Current visual language is useful:

- 980px-ish content shell;
- white analytical panels;
- thin borders;
- 8px radius;
- party-card grid;
- resource panel;
- two-column comparison;
- compact CTA.

Verdict:

**KEEP VISUAL GRAMMAR.**

---

# 72. What changes visually

Semantic changes require:

- neutral case kicker;
- smaller ECS treatment;
- no red/green outcome hero;
- no protocol color implying correctness;
- stronger pre/post divider;
- source sections;
- neutral verification block.

This is an evolution of existing page.

---

# 73. Red / green use

Do not use:

- red for failed deal;
- green for successful deal.

Canonical verification status may have semantic status color, but always with text.

---

# 74. Resource visualization

Preferred:

- table or compact rows;
- no decorative gauge;
- no arbitrary risk color threshold.

If exact categorical resource state has accepted semantic colors:

use only those.

---

# 75. Party cards responsive behavior

Desktop:

two columns.

Mobile:

stack:

1. Acquirer;
2. Target.

Do not side-scroll.

---

# 76. Source lists responsive behavior

Source title first.

Publisher/date secondary.

URL/action accessible.

Locators readable.

No tiny footnotes requiring zoom.

---

# 77. Long source lists

Use:

- semantic list;
- optional progressive disclosure after first few sources.

But material sources supporting headline analytical result should not be entirely hidden.

---

# 78. Accessibility

Target:

WCAG 2.2 AA.

Must include:

- one H1;
- semantic H2 sections;
- logical pre/post order;
- real links;
- visible focus;
- non-color status labels;
- accessible source links;
- mobile reflow;
- text equivalent for resource diagrams.

---

# 79. Page title

Recommended:

`Daimler-Benz × Chrysler — Historical Case Study — MergeVue`

Do not include:

`FAILURE`

or internal code.

---

# 80. CTA at bottom

Current:

`Run your own assessment`

`Start Diagnostic`

Target:

Heading:

`Analyze a deal`

Supporting:

`Start with an acquirer and target. No account required to begin the public analysis.`

Button/link:

`Analyze a deal`

Must route into real deal-first flow.

---

# 81. Secondary bottom links

Optional:

`Read the methodology`

`View all historical case studies`

Both must be real routes.

---

# 82. No lead capture after case

Do not gate:

- sources;
- outcome;
- full authorized case

behind email.

Public case provides trust before registration.

---

# 83. Analytics

Useful:

- case detail viewed;
- analytical sources expanded;
- outcome section viewed;
- methodology opened;
- Analyze a deal selected.

Do not create:

`case persuaded user`

or pseudo-scientific engagement score.

---

# 84. Publication-safe target data model

Conceptual public projection:

```text
caseId
displayTitle
industry
transactionMetadata
preEventCutoff
retrospectiveDisclosure
partyReadings[]
ecs?                      // only if authorized
materialResourceMechanisms[]
finalReplay
limitations[]
analyticalSources[]
outcomeSummary
verification
outcomeSources[]
methodologyVersion?
publicationVersion?
```

Not raw internal case package.

---

# 85. Fields that should not come from legacy data without gate

Do not auto-import:

- `result`;
- `headline`;
- `valueLine`;
- `protocol`;
- `protocolTone`;
- `protocolTitle`;
- `integrationMode`;
- `protocolBody`;
- `protocolStabilization`;
- legacy `resources.score`;
- `predicted`;
- `actual`;
- `analysis`.

Each must be replaced by public projection derived from final authority.

---

# 86. Why `predicted` legacy field is particularly dangerous

Its name and copy can imply:

> prediction existed before deal outcome.

Target schema should use something like:

`finalReplayStatements`

with explicit retrospective status.

This reduces semantic leakage.

---

# 87. Why `actual` also needs regeneration

Legacy outcome statements may:

- lack source;
- aggregate years;
- overstate causality;
- mix fact and interpretation.

Target:

`outcomeFacts`

each with provenance.

---

# 88. Why `analysis` needs split fields

One `analysis` string is insufficient.

Need at least conceptual separation:

```text
preEventInterpretation
verificationInterpretation
```

This prevents hindsight mixing.

---

# 89. Source-to-claim traceability

For material claim, internal public projection should support:

```text
claimId
claimText
temporalLane: PRE_T0 | POST_T0
sourceIds[]
```

UI does not need to expose claim IDs.

But rendering must not mix temporal lanes.

---

# 90. Temporal lane is fail-closed

If source temporal lane cannot be determined:

- do not use it to support pre-T0 claim;
- resolve before publication.

---

# 91. Comparison is not pairwise forced

Do not force each replay bullet to pair with exactly one outcome bullet if reality is more complex.

Allow:

- one replay claim → multiple observed outcomes;
- several replay claims → one outcome;
- not determinable.

---

# 92. Verification result can include misses

Public case may show:

- confirmed;
- partially confirmed;
- missed;
- falsified;
- not determinable.

Misses are not hidden.

This is a trust feature.

---

# 93. No post-hoc retuning on page

Do not change replay wording to make it better match observed outcome.

Public replay must use authorized frozen wording / projection.

Outcome comparison comes after.

---

# 94. No rhetorical hindsight

Avoid:

- `exactly as predicted`;
- `the warning came true`;
- `MergeVue saw it coming`;

unless a real prospective locked forecast exists and exact statement is warranted.

Historical replay uses more conservative language.

---

# 95. True prospective case in future

If future public case comes from a genuinely locked pre-outcome forecast:

page may use different disclosure:

`Prospective forecast`

This is distinct from retrospective replay.

Do not reuse retrospective disclaimer.

---

# 96. Case type must be explicit

Public projection needs:

`caseMode`

at least conceptual:

- `RETROSPECTIVE_REPLAY`;
- `PROSPECTIVE_FORECAST`.

UI wording derives from it.

---

# 97. Existing block-preservation matrix — mandatory

| Existing block | Current function | Authority defect | Decision |
|---|---|---|---|
| Back link | navigation | none | KEEP |
| Header | case identity | outcome-first | ADAPT |
| ECS circle | structural score | over-dominant / legacy source risk | DEMOTE / CONDITIONAL |
| Protocol panel | recommendation | legacy / possibly unapproved | REPLACE / CONDITIONAL |
| Party cards | comparison | legacy copy | KEEP STRUCTURE / REGENERATE |
| Resource map | resource view | unsupported numeric scale | REPLACE |
| Predicted vs Actual | comparison | retrospective/prospective conflation | REBUILD |
| Framework Analysis | explanation | pre/post mixing | SPLIT |
| Bottom CTA | conversion | old diagnostic flow | REPLACE |

---

# 98. Publication matrix — mandatory

Before page can render:

| Gate | Required | Passed? |
|---|---:|---:|
| Final calibrated replay | YES | |
| Methodology freeze applicable | YES | |
| Sealed pre-T0 evidence | YES | |
| No post-T0 contamination | YES | |
| Independent verification | YES | |
| Owner public acceptance | YES | |
| Public analytical provenance | YES | |
| Outcome provenance if shown | YES | |

Any required `NO`:

> block analytical publication.

---

# 99. WHAT WAS INTENTIONALLY PRESERVED

Before merge list:

- route;
- shell;
- back navigation;
- company-pair hierarchy;
- party-card geometry;
- analytical panel language;
- comparison layout concept;
- responsive structure;
- canonical typography and borders.

---

# 100. WHAT CHANGED AND WHY

Format:

```text
OLD
→ NEW
→ DEFECT
→ AUTHORITY
```

Example:

```text
ST predicted pre-close
→ Final calibrated replay — pre-event evidence only
→ retrospective replay was incorrectly presented as a prediction actually made before historical close
→ Public Case Study Authority
```

---

# 101. Acceptance criteria

Case detail passes only if:

1. case has valid Final Calibrated Replay authority;
2. runtime fails closed;
3. unknown and unpublished states distinguished;
4. research-corpus count not assumed;
5. retrospective mode explicit;
6. exact pre-event cutoff shown;
7. pre-T0 analysis visually precedes and is separated from outcome;
8. outcome cannot contaminate replay wording;
9. analytical sources are pre-T0 eligible;
10. outcome sources are separately listed;
11. public source traceability exists;
12. party readings use public environment names;
13. unresolved party reading remains unresolved;
14. internal codes absent;
15. ECS shown only if current authorized replay supports it;
16. ECS not hero verdict;
17. ECS labeled non-probabilistically;
18. legacy protocol not auto-rendered;
19. control implication only if authorized;
20. legacy resource 0–100 map removed unless exact methodology authorizes it;
21. resource mechanisms use current authority;
22. no `$X destroyed` causal hero;
23. no outcome-first red/green identity;
24. `ST predicted pre-close` absent for retrospective replay;
25. `Framework Analysis` split by temporal lane;
26. canonical verification vocabulary used;
27. misses / falsification not hidden;
28. no overall accuracy badge;
29. no internal audit chain;
30. no methodology-development history;
31. no post-hoc rewriting;
32. version integrity maintained;
33. real methodology and index links work;
34. bottom CTA = `Analyze a deal`;
35. deal CTA routes to real public-analysis flow;
36. American English only;
37. WCAG 2.2 AA target maintained;
38. print/export preserves pre/post boundary;
39. every material public claim has traceability;
40. every temporal claim has correct lane.

---

# 102. Финальный принцип

> **A historical case is not persuasive because the outcome is dramatic. It is persuasive when the reader can see exactly what evidence was available before the cutoff, what the final replay concluded from that evidence, what happened later, and where the replay did or did not hold.**

> **Pre-T0 analysis and post-T0 outcome are different evidentiary worlds. The page must make it impossible to confuse them.**

> **If the publication authority is incomplete, show no analytical case rather than a legacy or provisional substitute.**
