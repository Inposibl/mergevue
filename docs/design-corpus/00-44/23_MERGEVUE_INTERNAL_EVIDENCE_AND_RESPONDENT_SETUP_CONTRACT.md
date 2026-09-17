# 23. Контракт структурированных внутренних доказательств и настройки респондентов MergeVue

**Статус документа:** управляющий flow-контракт / respondent and structured-evidence orchestration  
**Файл:** `23_MERGEVUE_INTERNAL_EVIDENCE_AND_RESPONDENT_SETUP_CONTRACT.md`  
**Версия:** 1.0  
**Дата:** 16 сентября 2026 года  
**Язык документации:** русский  
**Язык коммерческого интерфейса:** только American English  
**Рынок первой версии:** США  
**Входная surface:** Deal Workspace из `22_MERGEVUE_DEAL_WORKSPACE_CONTRACT.md`  
**Главный принцип:** внутренние наблюдения добавляются через существующие канонические respondent/evidence flows; UX может улучшать setup, объяснение, маршрутизацию и статусы, но не содержание или последовательность канонических инструментов  
**Абсолютный инвариант:** `CANONICAL QUESTIONS, OPTIONS, ORDER, ROUTING BINDINGS AND SEMANTIC MAPPINGS ARE NOT DESIGN VARIABLES`  
**Ключевые правила:** `RESPONDENT CONTEXT BEFORE WEIGHTING`, `PROVENANCE PRESERVED`, `UNKNOWN ≠ NEGATIVE`, `CROSS-PARTY ISOLATION`, `INVITE ≠ WORKSPACE ACCESS`, `NO QUESTIONNAIRE SHORTCUTS`

---

# 0. Назначение

Этот документ определяет переход:

```text
Deal Workspace
→ Add internal evidence
→ choose lawful evidence channel
→ configure respondent context
→ invite / authorize respondent where required
→ complete canonical instrument
→ classify evidence
→ submit
→ update Deal evidence state
→ report may deepen only after authority gates
```

Он не определяет сами канонические вопросы.

Он определяет:

- кто должен отвечать;
- когда имеет смысл запрашивать ответ;
- как пользователь понимает цель;
- как создаётся/передаётся приглашение;
- какие respondent metadata необходимы;
- как сохраняется provenance;
- как фиксируется completion;
- как Workspace отражает результат без ложной certainty.

---

# 1. Почему этот слой появляется после public result

Internal observations требуют большего trust, чем:

- company names;
- public evidence;
- reading a public report.

Поэтому этот слой начинается только тогда, когда:

1. пользователь уже получил публичную ценность;
2. Decision Gap показывает, какой вопрос публичные источники не закрывают;
3. пользователь явно выбирает `Add internal evidence`.

---

# 2. Internal evidence is not mandatory for every Deal

Если public evidence достаточно для текущего bounded question:

не нужно принуждать user к questionnaire.

Structured internal evidence используется там, где оно действительно может:

- повысить coverage;
- разрешить contradiction;
- проверить operational assumption;
- поддержать environment reading;
- закрыть Decision Gap.

---

# 3. Existing architecture — preserve

Текущий `main` уже содержит отдельные governed flows:

- Acquirer module;
- Acquirer verification;
- Target Observation Setup;
- Target Observation;
- Target diagnostic levels;
- Target self-assessment;
- Target invite/code gate;
- evidence classification;
- contradiction;
- triage;
- analyst/release downstream.

Поэтому:

> **DO NOT COLLAPSE THESE INTO ONE GENERIC “TEAM SURVEY”.**

---

# 4. Current route family

В текущем `main` существуют, среди прочего:

- `/screen-5-acquirer-module`;
- `/screen-6-acquirer-submit`;
- `/screen-6-acquirer-verification`;
- `/screen-6a-target-observation-setup`;
- `/screen-6a-target-observation-setup/details`;
- `/screen-6a-target-observation-setup/authorized`;
- `/screen-6b-target-observation`;
- `/screen-7-step-2b-level-1`;
- `/screen-8-step-2b-transition`;
- `/screen-9-step-2b-level-2`;
- `/screen-2c-target-self-assessment`;
- `/screen-9a-target-code-gate`.

Эти routes являются существующим implementation truth.

Этот contract не разрешает их wholesale replacement.

---

# 5. Workspace should orchestrate, not duplicate

Deal Workspace должен показывать:

- какой evidence channel нужен;
- кто должен участвовать;
- текущий статус;
- следующий action.

Но сам questionnaire лучше открывать в существующем специализированном flow.

Не нужно inline-рендерить все вопросы в workspace overview.

---

# 6. Primary user question

Перед запуском internal evidence пользователь должен понимать:

> `What unresolved question are we trying to answer, who is in a position to provide reliable evidence, and what will this input affect?`

Не:

> `Who can we send a survey to?`

---

# 7. Evidence request starts from Decision Gap

Рекомендуемый flow:

```text
Decision gap:
Target decision authority is unresolved

Evidence needed:
Direct observations from people with repeated exposure to target decision-making

Recommended channel:
Target observation

Action:
Set up target observation
```

Это лучше, чем generic:

`Invite respondent`.

---

# 8. Evidence channel selection is governed

Не давать пользователю arbitrary menu из всех опросников, если methodology уже определяет применимый channel.

UI может показать recommended / required channel.

Но не создавать:

- custom questionnaire builder;
- pick-any-module;
- shortened version;
- “quick survey”.

---

# 9. Absolute questionnaire immutability

Ни один canonical question нельзя:

- переписать;
- перефразировать;
- сократить;
- упростить;
- перевести для production UI первой американской версии;
- переставить;
- перенести в другой instrument;
- объединить;
- разделить;
- удалить;
- добавить;
- заменить;
- скрыть из required progression;
- изменить option wording;
- изменить option order;
- изменить option value;
- изменить question order;
- изменить multi-select semantics;
- изменить unknown behavior;
- изменить mappings.

---

# 10. Layout adapts to question — never the reverse

Если длинный question плохо помещается:

меняется:

- width;
- line height;
- container;
- page break;
- responsive pattern.

Не меняется question.

---

# 11. No “UX rewrite” of canonical text

Запрещён prompt:

`Rewrite these questions to sound more natural.`

Запрещён copyediting pass canonical corpus.

Даже грамматическая «коррекция» требует authority, потому что wording может быть алгоритмически значим.

---

# 12. Canonical answer-option protection

Option labels и порядок также являются частью instrument.

Не:

- reorder by popularity;
- randomize;
- shorten;
- collapse options;
- substitute icons;
- map multiple options into one visible label.

---

# 13. Question identifiers stay internal

UI не должен обязательно показывать:

`Q11-E`

или внутренний question ID.

Но скрытие ID не меняет question order / semantics.

---

# 14. Internal mappings remain hidden

Не публиковать respondent:

- environment signal;
- resource binding;
- risk-category mapping;
- evidence multiplier;
- scoring weight;
- hidden reliability logic.

Это может bias answers.

---

# 15. Respondent setup is not questionnaire content

Разрешено проектировать respondent setup отдельно.

Setup может собирать:

- side;
- role;
- seniority;
- function;
- access;
- observation duration;
- evidence exposure context;
- acquisition awareness where current channel requires.

Эти поля определяют evidence provenance / routing.

---

# 16. Respondent context is analytical metadata

Respondent role/context не является просто CRM profile.

Он влияет на:

- admissibility;
- authority;
- weighting;
- interpretation;
- contamination controls.

Поэтому его нельзя произвольно сокращать.

---

# 17. Existing respondent-side model

Current architecture recognizes deal-side contexts including:

- Acquirer;
- Target;
- Advisor;
- Board / Investment Committee.

These are current implementation states.

Before exposing in new UI:

- use current canonical labels;
- do not invent new side categories.

---

# 18. Existing role architecture

Current implementation includes multiple role values across deal, integration, people, finance, legal, board, target leadership and advisory contexts.

Do not replace with one free-text:

`Your role`.

Free text can supplement only where current model permits.

---

# 19. Role list is not UX decoration

If a role option exists because routing/weighting depends on it:

preserve exact semantic category.

Do not merge:

`Finance Lead`

and:

`Legal / Governance Lead`

for a cleaner dropdown.

---

# 20. Seniority

Existing respondent metadata contains seniority categories.

Do not infer seniority from job title automatically unless user confirms or governing mapping exists.

---

# 21. Function

Function is distinct from role.

Examples:

- Finance;
- Legal / Governance;
- Operations;
- Commercial / Sales;
- Product / Technology;
- Strategy / Corporate Development.

Do not collapse role and function into one field if downstream logic uses both.

---

# 22. Access level

Access level describes evidence position, not user privilege.

Do not confuse:

`Full deal-room / leadership access`

with workspace permission.

---

# 23. Observation tenure

Duration of exposure can influence evidence quality.

Do not present it as employment tenure unless that is the specific field.

---

# 24. Target Observation Setup — existing structure

Current target observation setup includes:

- `Observation position`;
- structured respondent context;
- `Evidence collection stage`.

Structured context currently asks about:

1. target exposure duration;
2. closest access to target;
3. primary actors observed;
4. evidence basis.

This is a real governed setup asset.

---

# 25. Target observation setup must remain separate from target self-assessment

These are different evidence channels:

## Target observation

Someone with exposure observes the Target.

## Target self-assessment

A Target-side respondent answers about their own environment/context.

Do not merge them.

---

# 26. Observation position

Current choices identify acquirer/advisor-side observational position.

Do not turn this into generic:

`Observer`.

The position matters to provenance.

---

# 27. Target exposure duration

Existing choices cover ranges from narrow diligence exposure to extended contact.

The UI may improve layout, but values remain governed.

Do not automatically convert them to a continuous month slider.

---

# 28. Closest access to target

Existing categories distinguish:

- documents/data room;
- management interviews;
- site/team sessions;
- direct operating contact.

This is analytical evidence metadata.

Preserve semantic distinctions.

---

# 29. Primary actors observed

Existing categories distinguish levels such as:

- Founder or CEO;
- Senior leadership team;
- Middle management / functional leads;
- Frontline teams.

Do not convert to arbitrary multi-select unless current authority allows multiple.

---

# 30. Evidence basis

Existing target-observation setup distinguishes evidence basis such as:

- single meeting;
- structured interviews;
- repeated workshops;
- live operating behavior.

These categories must preserve meaning.

---

# 31. Evidence collection stage

Current setup distinguishes stages such as:

- pre-signing diligence;
- signing to close;
- first 30 days after close.

This field is temporal provenance.

Do not hide it merely for shorter setup.

---

# 32. Acquisition awareness

Target self-assessment currently includes explicit:

`Awareness of the pending acquisition`

with governed values:

- Yes;
- No;
- Partial.

This field must remain where current flow requires it.

---

# 33. Acquisition awareness is not optional decoration

It participates in contamination handling.

Do not remove because it feels sensitive or redundant.

---

# 34. Framing contamination must remain internal

System may flag acquisition-framing contamination.

Client/respondent UI should not accusatorily label respondent:

`Your answer is biased`.

Use neutral collection UX.

Internal scoring retains contamination logic.

---

# 35. Short-tenure backstop

Current target-self flow can apply tenure-related contamination safeguards.

Do not remove underlying logic to simplify UI.

Do not expose raw weight or multiplier to respondent.

---

# 36. Evidence classification is part of the answer

Current structured answer can include:

- selected answer;
- direct observation gate;
- evidence type;
- knowledge level;
- confidence;
- reliability flags.

These fields are not post-hoc analyst decoration.

They are part of evidence quality.

---

# 37. Direct Observation Gate

Current user-facing options include:

`Yes - direct observation`

and:

`No - indirect basis`.

This distinction must be preserved where the canonical question requires evidence classification.

---

# 38. Evidence type

Current governed evidence-type categories include:

- Direct Observation;
- Document-Supported;
- Reported by Others;
- Inference;
- Hypothetical;
- Unknown / Cannot Answer.

Do not replace them with generic:

`How sure are you?`

---

# 39. FREE document restriction

Current FREE evidence classification explicitly excludes document-supported capability from free routing.

Therefore FREE respondent UX must not offer document-based choices that backend marks inadmissible.

Do not show disabled fake option merely to tease paid plan unless product explicitly wants that behavior.

---

# 40. Private document evidence enters in paid path

When private documents are allowed later:

document-supported evidence may become valid under that lane.

But this must use the paid/private evidence architecture.

---

# 41. Knowledge level

Current categories include:

- First-Hand;
- Second-Hand;
- Document-Based;
- Pattern-Based;
- Speculative;
- Not Known.

These distinctions cannot be compressed to one confidence slider.

---

# 42. Confidence

Current categories include:

- High;
- Medium;
- Low;
- Cannot Determine.

Allowed confidence values depend on evidence classification.

UI must follow dynamic allowed states from the engine.

---

# 43. `Unknown / Cannot Answer` is a first-class answer

When respondent does not know:

they must be able to say so where allowed.

Do not:

- force nearest answer;
- disable submission;
- treat unknown as negative;
- penalize respondent visually.

---

# 44. Unknown state semantics

Current logic can map unknown to:

- indirect basis;
- not known;
- cannot determine;
- no direct knowledge.

This is valid evidence state.

It is not option `F` unless the canonical question itself defines that.

---

# 45. Q11 special semantics

Where canonical Q11 is present:

- Q11-E = material signal;
- Q11-F = observation gap.

These meanings are controlling.

UI must not collapse:

`F`

into negative response.

---

# 46. Evidence calibration questions

Evidence-calibration questions are part of canonical architecture.

Do not visually make them look optional merely because they are metadata-like.

---

# 47. Reliability flags

Current internal categories include contradictions, evasiveness, overgeneralization, hypothetical basis, no direct knowledge and other signals.

Respondent-facing exposure must be carefully governed.

Not every internal reliability flag belongs as a checkbox shown to the respondent.

---

# 48. Self-classification vs system flags

Distinguish:

## User-provided evidence metadata

what respondent can report about basis.

## System-derived / reviewer flags

what engine/reviewer determines.

Do not ask respondent:

`Was your answer socially desirable?`

unless canonical flow explicitly does.

---

# 49. Evidence classification UI must follow engine affordances

Allowed options depend on:

- direct-observation gate;
- evidence type;
- question allows unknown;
- FREE/private lane.

UI should consume allowed option set.

Do not hard-code all options permanently visible.

---

# 50. No client-side semantic reimplementation

Frontend must not recreate evidence rules independently.

Use canonical flow helpers / server projection where authoritative.

---

# 51. Invite architecture — existing asset

Current flows already use:

- invitation record;
- unique session IDs;
- digital codes;
- hashed code;
- expiration;
- completion;
- revocation.

This is a strong existing pattern.

Keep.

---

# 52. Current invite timing

Acquirer verification, target observation and target self-assessment flows currently use bounded invite TTLs; target observation and target self invitations are implemented with 72-hour validity and six-digit code patterns.

This is current implementation detail, not immutable product doctrine.

Verdict:

**KEEP BY DEFAULT; change only under security/product decision.**

---

# 53. Invitation ≠ workspace access

Receiving a respondent link/code does not:

- create account;
- grant Deal Workspace access;
- reveal report;
- reveal other respondent answers;
- reveal private documents.

This boundary is absolute.

---

# 54. Respondent needs only bounded context

Invite should explain:

- who is requesting input;
- which deal / organization context is relevant;
- why their observation matters;
- approximate task if reliably known;
- privacy/access boundary.

Do not expose the full Deal report by default.

---

# 55. Deal confidentiality in invitation

Show only the minimum Deal identity needed for respondent orientation.

If deal itself is confidential:

invitation policy must respect that.

Do not assume public company pair can always be named.

---

# 56. Digital code

Do not display hashed code.

Respondent uses the human-entered code where current flow requires.

Do not expose mutation capabilities in visible UI.

---

# 57. Secret-bearing URL hygiene

Tokens / capabilities in URLs must not be repeated in:

- page body;
- analytics;
- logs available to client;
- copyable status text.

Technical security contract may strengthen this later.

---

# 58. Invite states

Target UX should support real states such as:

- Ready to invite;
- Invite sent;
- Verified;
- Completed;
- Expired;
- Revoked;
- Invalid;
- Wrong code.

Only expose states backend truly knows.

---

# 59. Do not invent “Opened”

If system does not reliably track invite opening:

do not show:

`Opened 2 hours ago`.

---

# 60. Completed invite is immutable evidence event

Once completed and accepted into authoritative session:

do not allow ordinary UI to mutate respondent answers.

Corrections require governed resubmission/versioning, not silent edit.

---

# 61. Expired invite

Client action:

`Create a new invite`

if workflow allows.

Do not extend expiry client-side.

---

# 62. Revoked invite

A revoked invite must fail closed.

Do not let respondent continue from cached state into authoritative submission.

---

# 63. Wrong code behavior

Respondent sees bounded error.

No details that help enumerate valid codes.

---

# 64. Cross-tab/session completion

Current implementation already carries bounded completion events between tabs/browser contexts.

Preserve server-authoritative completion.

Do not treat a local `completed=true` UI state as sufficient.

---

# 65. Cross-party isolation — critical

Current runtime includes explicit protections against forbidden cross-party evidence leakage.

This must remain a central UX/security invariant.

Acquirer-side respondent should not receive:

- Target self-assessment answers;
- hidden Target respondent metadata;
- other-side canonical response state.

Target respondent should not receive Acquirer confidential responses.

---

# 66. Completion events must stay bounded

Completion payload should communicate:

- relevant session identity;
- completed state;
- timestamp;
- permitted result metadata.

Not raw answers across contexts.

---

# 67. Respondent raw answers are not workspace broadcast

Deal Workspace may show:

`Target self-assessment completed`

without showing raw answers to every collaborator.

---

# 68. Respondent identity privacy

If identity is not necessary for a client user's role:

show role/status rather than personal name.

Exact policy depends on workspace permissions.

---

# 69. Multiple respondents

The architecture supports respondent identifiers.

Future multi-respondent flow should preserve each physical respondent separately.

Do not merge answers into one pseudo-respondent before adjudication.

---

# 70. Same person across modules

If one person answers multiple modules:

system may link respondent identity where governance permits.

But UI must not assume two sessions are same person solely because email matches.

---

# 71. Evidence provenance per respondent

Every structured answer should retain:

- respondent ID;
- side;
- role/context;
- module;
- question ID;
- timestamp;
- evidence classification.

Do not strip provenance when moving into report.

---

# 72. Multiresponse adjudication

When multiple respondents disagree:

system follows canonical adjudication.

UI should surface contradiction/coverage, not majority vote automatically.

---

# 73. No “most people chose B” as truth

Frequency of answer is not sufficient semantic resolution.

Do not display vote-style result as canonical output.

---

# 74. Respondent setup can reduce bad evidence

The setup should help user choose someone who actually has relevant exposure.

Useful prompt:

`Choose a respondent with direct or repeated access to the organizational behavior you need to assess.`

Do not guarantee their evidence will be sufficient.

---

# 75. Do not invite by title alone

A prestigious title does not guarantee direct observation.

Access/exposure metadata matters.

---

# 76. Board / advisor respondent

External or board respondents can be valid within governed routes.

Do not show warning merely because they are external.

Evidence basis will affect interpretation.

---

# 77. Target self-assessment positioning

Target self flow has separate positioning/context fields before questionnaire.

These are not removable onboarding friction.

They support contamination and provenance logic.

---

# 78. “Other — specify”

Where canonical positioning option requires free-text specification:

UI must show exact required free-text field.

Do not omit because rare.

---

# 79. Submit validation

Questionnaire submission must fail if:

- required canonical answer missing;
- evidence classification invalid;
- required positioning missing;
- invite authorization invalid;
- server authority unavailable.

Do not accept partial as completed.

---

# 80. Partial progress

If canonical flow supports draft progress:

label:

`In progress`.

Do not call:

`Submitted`.

Current implementation specifics determine whether draft persistence exists.

---

# 81. Back navigation

Existing flow has warnings around progress loss.

Future workspace-backed flow should reduce unnecessary data loss.

But until persisted drafts exist:

do not falsely promise autosave.

---

# 82. Autosave

Only show:

`Saved`

if server confirms respondent progress persistence.

No decorative autosave label.

---

# 83. Question progress indicator

Because questionnaire order is fixed:

a truthful progress indicator is allowed if denominator is fixed.

Examples:

`Question 12 of 67`

only if 67 actually applies to that exact current instrument/flow.

Do not use global 67 if respondent module contains a subset/route.

---

# 84. Routed questionnaire progress

If routing lawfully changes the applicable set:

progress denominator must reflect actual canonical applicable sequence.

Do not hide skipped questions by silently altering instrument.

---

# 85. No gamification

No:

- streak;
- score;
- completion confetti;
- personality reveal teaser.

Professional evidence collection.

---

# 86. No preview of result to influence answers

Before submission, respondent should not see:

- emerging Environment;
- ECS;
- “you are trending toward...”.

This could bias later answers.

---

# 87. No answer coaching

Do not say:

`Most successful integrations answer A.`

No normative hints.

---

# 88. Neutral questionnaire shell

Question screen should prioritize:

- question;
- options;
- evidence classification;
- progress;
- help/definitions where governed.

No sales content.

---

# 89. Definitions / help

If a term in canonical question needs explanation:

help text must come from authorized glossary.

Do not improvise paraphrase that changes question meaning.

---

# 90. American English

Client UI shell and non-canonical copy use American English.

Canonical question text remains exact source wording even if inherited spelling differs, unless canonical authority itself updates it.

This is an exception to ordinary American-English normalization.

---

# 91. Canonical text takes precedence over style guide

Important:

> If exact canonical question contains wording that conflicts with ordinary editorial preference, canonical text wins.

Do not “correct” it locally.

---

# 92. Questionnaire visual consistency

Reuse MergeVue visual system:

- light background;
- white question surfaces;
- thin borders;
- 8px radius;
- navy/blue active/focus;
- clear form controls;
- readable typography.

Do not create personality-test aesthetic.

---

# 93. No illustrated answer archetypes

No faces, avatars, emoji or character icons for options.

They add semantic bias.

---

# 94. Selected option styling

Selection should be obvious but neutral.

Do not make one option visually more positive.

---

# 95. Unknown styling

`Unknown / Cannot Answer` should not look like warning/error.

It is a valid answer state.

---

# 96. Evidence classification progressive disclosure

To reduce cognitive load, evidence metadata may appear after selecting answer, if canonical logic permits.

But all required classification must be complete before submission.

---

# 97. Do not hide evidence classification entirely

Because it affects interpretation.

A “simple mode” without classification would change algorithm.

Forbidden.

---

# 98. Document-supported option in FREE

Since current FREE routing excludes document-supported capability:

do not let UI collect it and then silently discard.

Either:

- option not offered in FREE where canonical flow allows filtering;
- or user is explicitly moved to paid/private evidence path.

No hidden loss.

---

# 99. Respondent setup and FREE/PAID boundary

Structured observations can exist in the allowed FREE/internal lane according to product routing.

Private documents remain paid.

Do not turn all respondent evidence into paid solely because it is internal.

---

# 100. Report update after respondent completion

Completion alone does not authorize immediate result change.

Sequence:

```text
submission
→ validation
→ scoring / evidence integration
→ contradiction checks
→ authority gates
→ report version/update
```

Workspace should not change environment label at the instant respondent clicks submit unless backend authority already returned it.

---

# 101. “Thanks” screen

Respondent completion screen should say:

`Your responses have been submitted.`

It should not reveal:

- Environment result;
- Deal recommendation;
- other-side results.

---

# 102. Respondent post-submit access

Whether respondent can revisit answers is a governance decision.

Do not invent edit history.

Default after authoritative submit:

read-only completion state unless resubmission explicitly allowed.

---

# 103. Workspace completion state

Requester sees:

`Target observation completed`

or governed equivalent.

Not raw score by default.

---

# 104. Preliminary assessment is internal, not client trophy

Current target invite flow creates preliminary assessment containing environment codes, contradiction and triage.

Do not expose raw preliminary object.

Client report waits for appropriate authority.

---

# 105. Target self-assessment invitation precondition

Current flow requires prior prerequisite/preliminary assessment before target invite can be generated.

Preserve fail-closed sequencing.

Do not let workspace send target self invite whenever user wants if methodology prerequisites are unmet.

---

# 106. Invite button state

If prerequisite unmet:

show why action unavailable in user language.

Example:

`Complete target observation before requesting target self-assessment.`

Only if exact workflow still requires it.

---

# 107. Acquirer verification

Current architecture supports separate acquirer verification invitation when required.

Workspace must distinguish:

- acquirer module completed;
- verification required;
- verification completed.

Do not merge them into `Acquirer done`.

---

# 108. Verification respondent

Acquirer verification respondent may be distinct from primary respondent.

Preserve separate identity/session.

---

# 109. Target observer

Target observation respondent is not necessarily target employee.

Current observation-position options are acquirer/advisor perspectives.

Do not call this:

`Target respondent`

generically.

---

# 110. Target self respondent

Target self-assessment is actual Target-side self input.

UI terminology must distinguish from target observation.

---

# 111. Three distinct human-input concepts

At minimum:

1. Acquirer-side structured input;
2. Observation of Target;
3. Target self-assessment.

These are not interchangeable.

---

# 112. Workspace respondent summary

Recommended conceptual rows:

```text
Acquirer input
Status: Completed / Verification required / ...

Target observation
Status: Not started / Invite ready / Completed

Target self-assessment
Status: Not available yet / Invite ready / Completed
```

Only show paths applicable to current Deal.

---

# 113. Avoid internal screen numbers in client workspace

Do not show:

`Screen 6A`

`Step 2-B Level 1`.

Use client-readable labels.

Routes/internal logs can retain screen IDs.

---

# 114. Route labels vs product labels

Existing route names can stay for compatibility.

Client-facing label can be clearer without changing questionnaire semantics.

Example:

`Target observation`

instead of:

`Step 2-B`.

---

# 115. Do not rename methodology concepts carelessly

Editorial label change is allowed only for navigation/shell, not canonical question/module meaning.

---

# 116. Respondent status ≠ evidence quality

`Completed`

does not mean:

`Reliable`.

Evidence-quality classification and contradictions are separate.

---

# 117. Evidence-quality summary

After submission, client workspace may show bounded status:

- sufficient for current question;
- limited;
- conflicting;
- cannot determine.

Only if authoritative.

---

# 118. No respondent score

Do not score person:

`Respondent reliability 62/100`.

Evidence calibration applies to evidence, not a social rating of the person.

---

# 119. No shaming reliability flags

Do not show client:

`Respondent evasive`

as raw label unless analyst-facing workflow requires it and governance permits.

Client output should focus on evidence limitation.

---

# 120. Cross-side comparison

When both sides provide evidence:

system may compare structured conclusions.

Do not reveal one side's raw answers to the other.

---

# 121. Contradiction UI

Client-safe:

`Acquirer and Target evidence disagree on decision authority.`

Not:

`Jane answered B while Mark answered D.`

unless permissions and product require respondent-level transparency.

---

# 122. Provenance drill-down

Expert/internal expanded view can show:

- respondent IDs;
- question IDs;
- evidence classifications;
- source linkages.

Client standard workspace can show summarized provenance.

---

# 123. EvidenceCalibrationScore

Internal evidence calibration score is not necessarily client-facing.

Do not show unless separate client interpretation is defined.

---

# 124. Thresholds remain internal unless authorized

Do not expose:

- θ_gap;
- θ_support;
- θ_coverage;

in respondent UX.

---

# 125. AEM / weighting

Respondent evidence multiplier and tenure weighting remain internal.

Never tell respondent:

`Your answers count 0.5x`.

That could bias behavior and is not needed.

---

# 126. FREE engine selector

Engine/provider routing is internal.

Do not mention model vendor/provider to respondent.

---

# 127. Human analyst boundary

FREE structured respondent flow does not imply human analyst review.

Do not show:

`An analyst will review your answers`

unless current lane truly guarantees it.

---

# 128. Paid reviewer boundary

If later paid review applies:

show at Deal level, not respondent questionnaire unless relevant.

---

# 129. Questionnaire privacy statement

Respondent should know, in bounded language:

- their responses are used for this analysis;
- access may be restricted;
- they do not automatically receive full Deal results.

Exact privacy/legal copy requires policy authority.

---

# 130. No false anonymity promise

Do not say:

`Anonymous`

unless respondent identity truly is not available to relevant system/client.

Use accurate privacy language.

---

# 131. No false confidentiality promise

Do not say:

`100% confidential`

without policy.

---

# 132. Exit behavior

If respondent exits mid-flow:

behavior depends on actual draft persistence.

Do not claim saved progress if none.

---

# 133. Re-entry

Invite/code should restore authorized state if still valid and current system supports it.

Completed invite should not restart questionnaire.

---

# 134. Invite expiration UX

Before expiration, no countdown urgency unless operationally needed.

Can show:

`This link expires on Sep 19, 2026.`

if useful and accurate.

---

# 135. Code delivery

This document does not define email/SMS provider.

Do not show SMS if unsupported.

Invitation may expose shareable link + code only through governed channel.

---

# 136. Copy-link security

If requester can copy invite link:

warn appropriately if link contains access capability.

No broad public sharing.

---

# 137. Workspace invitation creation

Requester action:

`Create invitation`

then:

- system creates authoritative invite;
- displays link/code if permitted;
- status stored server-side.

Not client-generated random code.

---

# 138. Invite regeneration

Creating new invite may revoke old invite.

Behavior must be explicit and server-authoritative.

---

# 139. Multiple target respondents

If methodology later supports multiple Target self respondents:

use separate invites/respondent IDs.

Do not share one code among multiple people by default.

---

# 140. Multiresponse completion

Workspace should show each respondent/session completion separately where relevant.

Aggregation happens downstream.

---

# 141. Respondent deletion

Not defined here.

Do not add delete button casually because evidence provenance may need preservation.

---

# 142. Withdrawn response

If policy supports withdrawal, it needs separate governance.

Do not silently remove submitted evidence.

---

# 143. Amendments

If respondent corrects factual mistake after submission:

create amended version/event where governance permits.

Do not overwrite history invisibly.

---

# 144. Evidence timestamp

Submission timestamp matters.

Retain.

Do not use browser display time as authoritative record.

---

# 145. Timezone display

Use local-friendly display in UI but store authoritative timestamp.

No ambiguity.

---

# 146. Evidence source lane

Structured respondent answers must remain distinct from:

- public sources;
- private documents;
- 42Q individual data.

Do not merge into one evidence count.

---

# 147. Report source scope after internal evidence

If report deepens:

can say:

`Public + structured internal observations`

where accurate.

This is more honest than:

`Premium analysis`.

---

# 148. Workspace evidence channel update

After successful authoritative submission:

channel state updates.

If scoring/report update still pending:

show separate state.

Example:

`Responses submitted · analysis update pending`

only if actual backend state exists.

---

# 149. No fake real-time recalculation

Do not animate scores instantly unless backend calculation returned authoritative update.

---

# 150. No environmental reveal to respondent by default

The respondent's role is evidence contribution, not personality feedback.

Do not show:

`Your organization is The Mission Field`

unless separate product decision authorizes respondent result feedback.

---

# 151. No individual psychological feedback

Especially target self-assessment does not become a self-typing tool.

---

# 152. Setup screens can explain why metadata matters

Safe copy:

`We ask about your role and access so MergeVue can distinguish direct observation from inference.`

Do not expose weighting formulas.

---

# 153. Setup copy should be short

Do not front-load methodology paper.

Respondent needs:

- context;
- purpose;
- privacy;
- time/effort if accurate;
- how to answer unknown.

---

# 154. “Answer only what you know” principle

Helpful respondent instruction:

`Use “Unknown / Cannot Answer” when you do not have a reliable basis. Do not guess.`

Only where unknown is allowed by canonical question.

---

# 155. If question disallows unknown

Do not add unknown option.

Instead use governing validation/help behavior.

---

# 156. Evidence classification instruction

Safe:

`After each response, identify whether it comes from direct observation, another source, inference, or an unknown basis where available.`

Exact UI may be more compact.

---

# 157. No respondent training to game model

Do not teach:

- which evidence gets more weight;
- which answers produce favorable environment;
- which flags lower confidence.

---

# 158. Accessibility — setup

WCAG 2.2 AA target.

Need:

- real field labels;
- accessible radio/select groups;
- visible descriptions;
- error association;
- keyboard navigation;
- logical focus;
- no color-only state.

---

# 159. Accessibility — questionnaire

Need:

- question heading;
- grouped options;
- clear selected state;
- keyboard operation;
- evidence classification controls reachable in logical order;
- error summary;
- focus moves to first error on failed submit where appropriate.

---

# 160. Mobile questionnaire

One question/context block at readable width.

Do not create tiny two-column answer options.

Evidence-classification fields stack below answer.

---

# 161. Desktop questionnaire

Can use larger content width, but preserve one clear focal question.

Do not show many questions simultaneously if that encourages skipping ordering.

---

# 162. Question order in DOM

DOM order = canonical order.

CSS cannot visually reorder.

---

# 163. Save/continue buttons

Use truthful copy:

`Continue`

`Submit responses`

not:

`Next insight`.

---

# 164. Final submit confirmation

Because authoritative submit may be difficult to edit:

confirmation can be justified:

`Submit responses?`

with concise note.

Do not add unnecessary confirmation after every page.

---

# 165. Validation errors are not semantic coaching

Example:

`Select an answer.`

`Complete the evidence basis.`

Not:

`Choose a stronger answer.`

---

# 166. Instrument source integrity

Data should come from canonical data adapters / current source files.

No hard-coded copy duplicated into component.

This reduces drift.

---

# 167. Version integrity

Questionnaire version should be traceable internally.

Respondent UI does not need to show verbose version unless audit requires.

---

# 168. Submission must bind to instrument version

So later report can reproduce what was answered.

---

# 169. Do not silently upgrade in-progress questionnaire version

If canonical questionnaire changes under explicit future Owner authority:

in-progress sessions need migration/version policy.

Current frozen instrument should not change.

---

# 170. Evidence metadata versioning

Respondent context schema also needs provenance if it affects weighting.

Current code already has provenance helpers for Target Observation Setup.

Preserve this pattern.

---

# 171. Metadata provenance

Setup values should retain:

- canonical vocabulary;
- mapping/version provenance;
- timestamp.

UI need not expose technical pointers.

---

# 172. No free-text replacement for governed categorical fields

Free text is not a shortcut around canonical respondent context.

Use free text only where field explicitly supports it.

---

# 173. Deal Workspace orchestration states

Conceptual:

## Internal evidence unavailable
No current Decision Gap requires it.

## Setup required
Need respondent context.

## Ready to invite
Setup valid.

## Invite active
Waiting.

## In progress
Authorized respondent working.

## Submitted
Responses received.

## Processing
Analysis update not yet authorized.

## Integrated
Evidence reflected in an authorized report/version.

Exact machine states may differ.

---

# 174. “Integrated” is stronger than “Submitted”

Do not collapse.

Submission does not mean report used it successfully.

---

# 175. Failed evidence integration

If contradiction/quality prevents use:

show bounded client-safe state:

`Additional review required`

or:

`Evidence is conflicting`

according to authority.

---

# 176. User can add another respondent only if method permits

Do not expose unlimited:

`Add respondent`

button.

Additional respondents affect adjudication and burden.

Methodology decides applicability.

---

# 177. Respondent selection guidance

Workspace may suggest role profile, not named person.

Example:

`Choose someone with repeated direct exposure to target leadership decisions.`

User picks actual person.

---

# 178. No automated employee selection

Do not algorithmically nominate employees for respondent role based on HR data unless separate authority exists.

---

# 179. No automated employment action

Structured evidence may inform Deal risk.

It must not produce automated hiring/firing decisions.

---

# 180. Acquirer/Target power asymmetry

Respondent UX should avoid coercive language.

Do not tell Target respondent:

`Your answers will determine whether the acquisition proceeds.`

Use neutral purpose.

---

# 181. Independent response principle

Respondent should answer based on own knowledge.

Do not show other side's answers before completion.

---

# 182. Response editing while in progress

If supported:

allow change until final submit.

After final submit:

use governed version/amendment.

---

# 183. No forced synchronized completion

Different respondents can complete asynchronously.

Workspace reflects status.

---

# 184. Expired invite is not respondent failure

Use neutral state.

No red “Failed respondent”.

---

# 185. Reminder actions

If reminders are later supported:

separate communication contract.

Do not invent automated reminders.

---

# 186. Current invite security details

Current implementation uses:

- IDs tied to assessment/session;
- code hashes;
- expiry;
- revoked/completed state;
- bounded verification tokens/capabilities.

These are good security primitives.

Preserve by default.

---

# 187. Do not expose mutation capability

Any mutation capability/token is technical security material.

Never render in client copy.

---

# 188. URL query hygiene

Frontend logs/analytics should avoid capturing secret-bearing query parameters.

This needs engineering enforcement.

---

# 189. Referrer leakage

Invite surfaces should apply appropriate referrer/security controls if sensitive URL tokens exist.

Separate technical security review required.

---

# 190. Workspace invite history

First version can show current invite state.

Full historical invite ledger not required client-side.

Internal audit retains necessary records.

---

# 191. Questionnaire content vs respondent metadata visual separation

Make clear:

`About your perspective`

then:

`Questions`

This helps user understand metadata is about evidence basis, not scored personality.

---

# 192. Evidence classification repeated burden

The classification may be repeated per answer where canonical logic requires.

Do not remove repetition simply because UX designer finds it tedious.

Optimization can improve interaction mechanics without removing required data.

---

# 193. Interaction optimization allowed

Examples:

- sensible defaults only when canonically safe;
- keyboard navigation;
- sticky progress;
- collapsed explanatory help;
- preserving prior classification only if methodology explicitly allows carry-forward.

Do not assume carry-forward.

---

# 194. No default evidence type that biases answer

Do not preselect:

`Direct Observation`.

Respondent must classify.

---

# 195. No default confidence

Same principle.

---

# 196. Reliability acknowledgments

If current flow requires acknowledgment of reliability flags:

preserve it.

Do not auto-acknowledge client-side.

---

# 197. Evidence quality errors

If selected combination is invalid:

explain the inconsistency.

Example:

`“Unknown / Cannot Answer” cannot be combined with High confidence.`

Exact validation copy should derive from rules.

---

# 198. Dynamic option changes

When respondent changes direct/indirect basis:

incompatible evidence classification values may be cleared by engine.

UI should explain changed state subtly, not retain invalid hidden selections.

---

# 199. No stale hidden values

If UI hides a field after classification change:

its previous value must not remain submitted unless canonical engine retains it intentionally.

---

# 200. Client-side and server-side validation parity

Frontend validation improves UX.

Server must still enforce canonical rules.

No client-only trust.

---

# 201. Cross-party answer leakage test

Before release, test:

- Acquirer invite cannot access Target answers;
- Target observer cannot access Target self raw answers;
- Target self cannot access Acquirer raw answers;
- completion events contain no forbidden cross-party evidence;
- workspace summaries do not expose hidden respondent data.

---

# 202. Respondent link access test

Test:

- valid code;
- wrong code;
- expired;
- revoked;
- completed;
- malformed link;
- reused completed token;
- mismatched assessment/session IDs.

---

# 203. Report integration test

After respondent completion:

- report does not update before authority;
- contradictions preserved;
- unknown remains unknown;
- public baseline version preserved;
- new report indicates deeper evidence scope;
- no raw internal codes leak.

---

# 204. Questionnaire non-regression test

Any UI change must prove:

- same question count for applicable path;
- same IDs;
- same text;
- same order;
- same options;
- same option order;
- same allowsUnknown;
- same evidence-classification requirements;
- same routing.

---

# 205. Visual regression is secondary to semantic parity

A prettier flow that changes one question/order is a failure.

---

# 206. No design-system component that normalizes option order

Generic form components must preserve source order.

No automatic alphabetical sorting.

---

# 207. No localization in first version

Client UI American English only.

Canonical questionnaire localization requires a separate validated translation program.

Do not add runtime translation toggle.

---

# 208. Browser autofill

Disable inappropriate autofill where it could accidentally populate questionnaire responses.

Use normal autofill for contact fields only where appropriate.

---

# 209. Sensitive free text

If canonical free-text exists:

treat as potentially sensitive.

Do not send to marketing analytics.

---

# 210. Analytics

Allowed product events:

```text
internal_evidence_started
respondent_setup_completed
invite_created
invite_completed
questionnaire_started
questionnaire_submitted
evidence_integration_ready
```

Do not log:

- actual answer text;
- selected options;
- 42Q data;
- invite secret/code.

---

# 211. Time-on-question analytics

Avoid unless specifically needed and privacy-reviewed.

Do not infer psychology from hesitation.

---

# 212. Completion funnel

Useful:

```text
setup
→ invite
→ authorized entry
→ start
→ submit
→ integrated
```

This measures workflow friction, not respondent quality.

---

# 213. Deal Workspace summary target

After internal evidence begins:

```text
Internal evidence
Target observation — Completed
Target self-assessment — Waiting for response
Acquirer verification — Not required

Current analytical state
Conflicting evidence on decision authority

Next step
Wait for target self-assessment
```

Only if these states are authoritative.

---

# 214. No global respondent dashboard

Respondents are Deal-specific.

Global respondent directory not needed first version.

---

# 215. No HR database

Do not accumulate respondent profiles as employee records beyond analytical need.

---

# 216. Data minimization

Collect only metadata required by current canonical evidence architecture.

Do not add demographic/profile questions.

---

# 217. Respondent withdrawal/privacy rights

Detailed policy requires separate legal/privacy contract.

UX architecture should allow future governed handling.

---

# 218. Evidence retention

Separate security/data governance contract.

Do not make claims in questionnaire UI beyond actual policy.

---

# 219. Design freedom

Designer may improve:

- setup page grouping;
- spacing;
- navigation clarity;
- progress visualization;
- error presentation;
- responsive behavior;
- invite card layout;
- completion screen.

Designer may not change:

- question corpus;
- answer options;
- order;
- evidence classifications;
- respondent-context semantics;
- routing logic;
- invite security semantics;
- completion authority.

---

# 220. Current asset decision matrix

| Existing asset | Decision |
|---|---|
| Acquirer module | **KEEP** |
| Acquirer verification | **KEEP** |
| Target Observation Setup | **KEEP** |
| Target Observation | **KEEP** |
| Target diagnostic levels | **KEEP** |
| Target self-assessment | **KEEP** |
| Target code gate | **KEEP** |
| Existing invite TTL/code pattern | **KEEP BY DEFAULT** |
| Evidence classification | **KEEP** |
| Unknown / Cannot Answer | **KEEP AS VALID STATE** |
| Acquisition awareness | **KEEP WHERE REQUIRED** |
| Respondent metadata/provenance | **KEEP** |
| Cross-party isolation | **KEEP ABSOLUTELY** |
| Screen-number client labels | **ADAPT TO BUSINESS LABELS** |
| Generic one-survey replacement | **FORBIDDEN** |

---

# 221. Target workspace action matrix

| Decision Gap / need | Evidence channel | Action |
|---|---|---|
| Acquirer operating logic insufficient | Acquirer structured input | governed Acquirer flow |
| Acquirer answer needs independent verification | Acquirer verification | create verification invite |
| Target behavior observable from deal team | Target observation | set up observer |
| Target-side self evidence required | Target self-assessment | create target invite after prerequisite |
| Public/private contradiction | relevant structured follow-up | governed follow-up |
| Private document needed | private evidence | paid/private path, not questionnaire |
| Named leader forecast | individual evidence | 42Q path, not organizational questionnaire |

---

# 222. Mandatory pre-design audit

| Surface / primitive | LIVE | MAIN | Canonical source | Preserve? | Defect? |
|---|---|---|---|---|---|
| Acquirer module | | | | | |
| Acquirer verification | | | | | |
| Target Observation Setup | | | | | |
| Target Observation | | | | | |
| Target diagnostic | | | | | |
| Target self-assessment | | | | | |
| Code gate | | | | | |
| Evidence classification | | | | | |
| Invite states | | | | | |
| Workspace summary | | | | | |

No redesign before this audit.

---

# 223. WHAT WAS INTENTIONALLY PRESERVED

Before merge list:

- exact instruments;
- exact question order;
- option order;
- respondent routing;
- evidence classification;
- invite security;
- code/expiry behavior;
- cross-party isolation;
- provenance;
- server-authoritative completion;
- contradiction/adjudication path.

---

# 224. WHAT CHANGED AND WHY

Format:

```text
OLD SHELL / ROUTE LABEL
→ NEW CLIENT PRESENTATION
→ UX DEFECT
→ SEMANTIC DELTA: NONE
→ AUTHORITY
```

Example:

```text
Screen 6A / Target Observation Setup
→ Target observation setup
→ internal screen number is not meaningful to client
→ semantic delta: NONE
→ existing target observation flow
```

---

# 225. Any semantic delta requires stop

If proposed UI change would alter:

- who answers;
- when they answer;
- what question appears;
- option semantics;
- weighting metadata;
- routing;
- required classification;

designer/agent must stop.

This is no longer design adaptation.

It is methodology change requiring separate Owner authority.

---

# 226. Acceptance criteria

Internal evidence/respondent flow passes only if:

1. starts after public value / explicit user choice;
2. begins from a real Decision Gap;
3. evidence channel is methodologically appropriate;
4. no generic survey replaces canonical flows;
5. all canonical questions exact;
6. all question order exact;
7. all answer options exact;
8. all option order exact;
9. no questions added;
10. no questions removed;
11. no questions merged/split;
12. no paraphrased questions;
13. respondent metadata preserved;
14. side preserved;
15. role preserved;
16. seniority/function/access preserved where required;
17. Target Observation Setup fields preserved;
18. acquisition awareness preserved where required;
19. contamination logic preserved;
20. evidence classification preserved;
21. direct-observation gate preserved;
22. evidence type preserved;
23. knowledge level preserved;
24. confidence rules preserved;
25. unknown remains valid where allowed;
26. unknown not treated as negative;
27. Q11-E / Q11-F semantics preserved;
28. FREE document restriction preserved;
29. no document-supported FREE answer silently discarded;
30. invite is server-authoritative;
31. invite has valid session binding;
32. expiry enforced;
33. revocation enforced;
34. completed invite cannot be reused;
35. code/token secrets not leaked;
36. invite ≠ workspace access;
37. respondent ≠ collaborator;
38. cross-party raw evidence cannot leak;
39. completion event contains bounded data only;
40. respondent result is not revealed as personality feedback;
41. no answer coaching;
42. no emerging Environment reveal;
43. no respondent reliability score;
44. multiple respondents remain separately identifiable internally;
45. disagreement not resolved by majority vote;
46. provenance retained per answer;
47. submission validation matches canonical rules;
48. server validates authoritative submission;
49. submitted state distinct from integrated state;
50. report does not update before authority;
51. public baseline preserved;
52. contradictions preserved;
53. report evidence scope updates honestly;
54. client shell uses American English;
55. canonical question text overrides editorial normalization;
56. no localization without validated translation authority;
57. WCAG 2.2 AA target maintained;
58. mobile preserves canonical order;
59. no analytics capture answer content/secrets;
60. every UI simplification proves semantic delta = NONE.

---

# 227. Финальный принцип

> **The respondent experience may become clearer, faster, and easier to navigate. The instrument itself may not change by a single word, option, or position without methodology authority.**

> **Internal evidence is valuable because MergeVue knows who observed what, from what position, on what basis, and with what limitations — not because more people filled out a survey.**

> **Design the orchestration around the canonical evidence system. Never redesign the evidence system to fit the interface.**
