# 22. Контракт Deal Workspace MergeVue

**Статус документа:** управляющий target-contract / authenticated Deal surface  
**Файл:** `22_MERGEVUE_DEAL_WORKSPACE_CONTRACT.md`  
**Версия:** 1.0  
**Дата:** 16 сентября 2026 года  
**Язык документации:** русский  
**Язык коммерческого интерфейса:** только American English  
**Рынок первой версии:** США  
**Входной контракт:** `21_MERGEVUE_ACCOUNT_SAVE_AND_DEAL_WORKSPACE_ENTRY_CONTRACT.md`  
**Главный объект:** `Deal`  
**Главный принцип:** Deal Workspace — это продолжение того же анализа сделки после сохранения, а не отдельный SaaS-dashboard с новой логикой  
**Ключевые инварианты:** `DEAL IS THE PRIMARY WORK OBJECT`, `SAME REPORT TRUTH`, `EVIDENCE CHANNELS STAY DISTINCT`, `WORKFLOW STATUS ≠ ANALYTICAL CONFIDENCE`, `NO GENERIC DASHBOARD INVENTION`, `NO NEW GLOBAL NAV WITHOUT REAL CAPABILITY`

---

# 0. Назначение

Deal Workspace — authenticated surface, в которой пользователь продолжает работу с уже сохранённой сделкой.

Он должен позволять:

1. вернуться к public analysis baseline;
2. видеть текущий Decision Gap;
3. понимать, какие evidence channels уже доступны;
4. добавить structured internal evidence;
5. перейти к private evidence;
6. видеть report versions;
7. видеть релевантные respondent / invitation states;
8. понимать, что сейчас блокирует следующий вывод;
9. не терять provenance между public, internal и private layers.

Workspace не является:

- CRM;
- project-management tool;
- generic analytics dashboard;
- AI chat shell;
- document repository без связи с Deal;
- новой отдельной системой truth.

---

# 1. Текущее состояние продукта

В текущем `main` нет готовой customer-facing Deal Workspace page.

Нет подтверждённых public/auth routes вида:

- `/deals`;
- `/deals/:dealId`;
- `/workspace`;
- `/projects`.

Поэтому:

> **этот файл — target contract, а не описание существующей страницы.**

Он не авторизует конкретный route сам по себе.

---

# 2. Existing internal foundation

Текущий canonical data model уже содержит реальные доменные сущности:

- `Deal`;
- `Respondent`;
- `Question`;
- `Answer`;
- `EvidenceItem`;
- `AnalystAssessment`;
- `Contradiction`;
- `RiskOutput`.

Это важный вывод:

> Workspace должен строиться вокруг реального Deal/evidence/report domain model, а не вокруг generic SaaS primitives.

---

# 3. Deal — primary work object

В authenticated product основная единица:

> **Deal**

Не:

- Project;
- Workspace;
- Case;
- Campaign;
- Assessment;
- Report.

Assessment, evidence и reports существуют **внутри Deal**.

---

# 4. Deal ≠ report

Deal продолжает существовать при:

- новом evidence;
- новой report version;
- новом respondent;
- contradiction;
- paid deepening;
- refresh public evidence.

Report — versioned output.

Workspace не должен визуально сводить Deal к одному report PDF.

---

# 5. Deal ≠ assessment session

Current implementation использует assessment/session objects.

Это operational primitives.

Target UX должен мыслить:

`Deal`

внутри которого могут быть:

- public analysis;
- one or more structured assessment flows;
- evidence additions;
- report versions.

Не показывать user internal session IDs как primary navigation.

---

# 6. Deal ≠ Workspace entity by default

Название документа использует `Deal Workspace` как UX concept.

Но отдельная database/entity `Workspace` **не требуется**, если один Deal сам выполняет роль collaborative work container.

Не создавать:

```text
Organization
→ Workspace
→ Project
→ Deal
```

без реальной необходимости.

---

# 7. Основной вопрос пользователя

Workspace должен отвечать:

> `What do we know about this deal now, what evidence changed the analysis, what remains unresolved, and what should we do next?`

Не:

> `What features are available in my account?`

---

# 8. Главная информационная иерархия

Target order:

```text
Deal identity
Current workflow state
Current report / public baseline
Decision gap
Evidence channels
Next required action
Report versions
People / invitations where relevant
```

Не начинать с:

- generic metrics;
- activity feed;
- upsell;
- AI assistant.

---

# 9. Уровень доверия

Deal Workspace появляется после явной trust escalation.

## Текущий trust level

Authenticated persisted Deal.

## Уже разрешённые данные

- resolved Acquirer / Target identity;
- preserved public analysis;
- account identity;
- saved Decision Gap;
- later: structured internal observations explicitly added by user;
- later: authorized private evidence.

## Пока не разрешённые автоматически данные

- private documents;
- broad data-room access;
- individual 42Q data;
- named-leader behavioral forecast;
- organization-wide user directory;
- billing data;
- collaboration graph.

## Следующая trust escalation

Зависит от конкретного action:

- internal observations;
- respondent invitation;
- private evidence;
- economic modeling;
- specific-leader forecast.

## Какая ценность должна быть получена до escalation

Пользователь уже имеет:

- public report;
- Decision Gap;
- конкретное объяснение, какое evidence необходимо дальше.

---

# 10. Workspace top bar / identity

Минимум:

`Acquirer × Target`

Дополнительно:

- internal Deal nickname, если user его создал;
- transaction context;
- current workflow state;
- last updated.

Не показывать giant compatibility score как Deal identity.

---

# 11. Internal Deal nickname

Если используется:

`Project Orion`

secondary identity:

`Acquirer × Target`

Никогда не скрывать actual company pair полностью.

---

# 12. Deal lifecycle state

Current canonical model содержит workflow statuses уровня:

- draft;
- in diligence;
- analysis;
- report ready;
- sealed;
- archived.

Это internal implementation vocabulary.

Перед client-facing publication необходимо проверить, какие labels действительно должны стать UI terminology.

---

# 13. Workflow status ≠ confidence

Например:

`Analysis in progress`

не означает:

`Low confidence`.

И:

`Report ready`

не означает:

`High confidence`.

Эти оси визуально разделяются.

---

# 14. Multi-axis state model

Workspace может иметь независимые axes:

- Deal workflow;
- public evidence status;
- internal respondent status;
- private evidence status;
- contradiction state;
- report authority;
- payment / engagement state;
- 42Q state;
- verification state.

Не превращать их в один progress percentage.

---

# 15. No universal completion percentage

Запрещено:

`Deal analysis 74% complete`

если нет строго определённого denominator.

Use phase/status labels instead.

---

# 16. Recommended workspace header

Conceptual:

```text
[Deal]
Acquirer × Target
Saved · Public analysis available

[Open current report]
[Add evidence] // only if relevant
```

Не:

```text
Risk 78
Compatibility 62
Confidence 91
```

---

# 17. Current report block

Workspace должен всегда иметь obvious path:

`Current report`

или:

`Public analysis`

depending on current depth.

Display metadata:

- report version;
- generated date;
- evidence scope;
- authority state.

---

# 18. Public baseline is immutable history

Первый public report сохраняется как baseline.

Later report may differ.

Workspace должен позволять понять:

- что изменилось;
- какое evidence вызвало изменение;
- новая ли это report version.

---

# 19. Do not silently mutate baseline

Adding internal/private evidence must not rewrite initial public report in place without version distinction.

---

# 20. Report versions

Target conceptual model:

```text
Version 1 — Public evidence
Version 2 — Internal evidence added
Version 3 — Private evidence added
Version 4 — Final released report
```

Точные labels зависят от production architecture.

Но provenance progression должна сохраняться.

---

# 21. Current report version card

Recommended fields:

- report label;
- generated date;
- evidence scope;
- status;
- `Open report`.

Optional:

`What changed`

if previous version exists.

---

# 22. Decision Gap remains primary

Workspace не должен терять Decision Gap после save.

Block:

`Decision gap`

содержит:

- unresolved question;
- why it matters;
- evidence needed;
- current next step.

---

# 23. Decision Gap is not generic task list

Не превращать:

`Decision gap`

в:

`Tasks`.

Это analytical gap, not project-management todo.

---

# 24. Next required action

Workspace может показать:

`Next best evidence step`

только если current rules действительно определяют один наиболее полезный evidence action.

Иначе:

`Available next steps`

без искусственного ranking.

---

# 25. Evidence channels — core workspace section

Recommended channels:

1. Public evidence
2. Internal organizational observations
3. Private documents / deal context
4. Individual data — only if requested for named-leader forecast

These are evidence channels, not product tiers.

---

# 26. Public evidence channel

Shows:

- latest public review date;
- current availability;
- source/provenance link;
- refresh action if supported.

Does not show:

- fake source scan counter;
- `complete` unless rigorously defined.

---

# 27. Internal observations channel

Uses real existing respondent/questionnaire flows.

Status examples:

- Not started
- Setup required
- Invite sent
- In progress
- Completed
- Requires additional evidence

Exact labels must match governed workflow.

---

# 28. Private evidence channel

May show:

- Not started
- Scope required
- Evidence requested
- Under review
- Reviewed

Do not expose private documents until secure evidence workflow exists.

---

# 29. Individual data channel

Hidden by default.

Shown only if:

> a specific-leader forecast has been requested.

Then:

`Individual data required`

Not:

`42Q premium module`.

---

# 30. Evidence channel ≠ confidence score

Channel status says:

- what evidence exists;
- what is missing.

It does not automatically say:

- report is accurate;
- environment is correct.

---

# 31. Existing EvidenceItem foundation

Current canonical model supports evidence items with fields including:

- item type;
- title;
- source party;
- produced date;
- related questions;
- related risk categories;
- storage reference;
- review status.

Workspace can build evidence UX on this foundation.

---

# 32. Evidence review status

Current model includes:

- unreviewed;
- under review;
- verified;
- disputed.

These are strong existing semantic states.

Before public/client labels are finalized:

- wording review;
- scope review;
- permission review.

Do not replace with generic:

`Uploaded / Done`.

---

# 33. Evidence type distinctions

Current model distinguishes evidence forms such as:

- document;
- interview;
- dataroom extract;
- public record;
- other.

Workspace should not flatten everything into `Files`.

---

# 34. Evidence ≠ attachment library

Every evidence item should have analytical context.

At minimum:

- source;
- date;
- relation to question/finding;
- review state.

---

# 35. Raw evidence access

Client workspace may not expose all internal extraction/analyst fields.

Separate:

- client-visible evidence metadata;
- internal analyst extraction;
- private adjudication notes.

---

# 36. Evidence section should not be global by default

Evidence belongs inside a Deal.

A global `Evidence` nav item is not justified until cross-deal evidence management becomes a real use case.

---

# 37. Respondents section

Workspace may expose bounded respondent status.

Useful:

- role/context;
- side;
- invitation status;
- completion status.

Do not expose one respondent's raw answers to other client users unless permissions allow.

---

# 38. Existing respondent model

Current internal model includes:

- deal side;
- role;
- seniority;
- function;
- organization;
- access level;
- observation tenure;
- engagement depth;
- relationship to other side;
- completion state.

These fields support evidence authority.

They are not all necessarily client-visible.

---

# 39. Respondent card minimum

Potential client-visible fields:

- role;
- side;
- status.

Maybe:

- function.

Avoid dumping full evidence-weighting metadata.

---

# 40. Respondent vs collaborator

Workspace must visually separate:

`Collaborators`

from:

`Respondents`.

A respondent provides evidence.

A collaborator has workspace access.

---

# 41. Current invite flows are real assets

Current `main` already has controlled invite/session flows for:

- acquirer verification;
- target observation;
- target self-assessment.

These should be reused.

Do not replace with generic email form.

---

# 42. Invitation status

Possible:

- Not created
- Sent
- Opened — only if backend truly tracks
- Completed
- Expired
- Revoked

Do not invent `Opened` tracking if it does not exist.

---

# 43. Controlled invite identity

Workspace should show enough to manage invitation without exposing sensitive token / digital code unnecessarily.

Never display secret token in general activity feed.

---

# 44. Questionnaire entry from workspace

If internal evidence path selected:

Workspace provides action:

`Continue internal evidence`

not:

`Start premium quiz`.

---

# 45. Canonical questionnaire protection

Workspace shell may route to canonical questionnaires.

It may not:

- reorder questions;
- summarize them;
- create shortcuts that skip required canonical sequence;
- pre-answer them from public evidence;
- merge acquirer and target instruments.

---

# 46. Questionnaire status

Workspace may show:

- Not started;
- In progress;
- Completed;
- Blocked;
- Needs additional respondent.

But completion is workflow, not analytical certainty.

---

# 47. Contradictions as first-class state

Current domain model already contains `Contradiction`.

Workspace should not hide contradictions behind one confidence badge.

When user-facing relevance exists:

`Conflicting evidence`

should be visible.

---

# 48. Contradiction details

Client-visible level can show:

- what topics conflict;
- which evidence channels disagree;
- why it matters;
- what evidence can resolve it.

Do not expose internal respondent identity unless authorized.

---

# 49. Current contradiction states

Internal model supports:

- open;
- under review;
- resolved;
- escalated to finding.

These can inform workspace states.

But client labels require review.

---

# 50. No “AI resolved contradiction” claim

If contradiction was adjudicated through governed process:

show outcome without overclaiming automation.

---

# 51. Analyst assessment

Current internal domain model contains analyst assessments.

These belong to paid/internal review layer.

Ordinary FREE/public Deal Workspace should not imply analyst involvement.

---

# 52. Human review visibility

If paid workflow has a human review:

workspace may show:

`Review in progress`

or:

`Review complete`

only when true.

Do not show analyst name unless product intentionally supports it.

---

# 53. Analyst notes are not client copy

Internal:

- assessment notes;
- severity;
- resolution;
- approval status

should not automatically leak into user-facing workspace.

---

# 54. Risk outputs

Current canonical data model contains risk outputs.

Workspace should not create a generic risk dashboard from them automatically.

Client truth remains canonical report blocks from `19`.

---

# 55. Report first, raw risk objects second

Primary client interpretation:

> canonical report.

Internal risk outputs support report generation.

Do not show every internal risk category as independent card unless authorized.

---

# 56. Avoid legacy risk categories as visible nav

Internal categories like legacy implementation labels must not become global tabs merely because they exist in TypeScript.

UI ontology follows accepted product language.

---

# 57. Workspace overview should remain compact

Target overview is not every detail at once.

Show:

- current state;
- Decision Gap;
- evidence channels;
- report;
- next action.

Detailed evidence/report/respondent content opens within Deal sub-surfaces.

---

# 58. Sub-navigation inside Deal

Potential sections only if implemented:

- Overview
- Report
- Evidence
- Respondents

Maybe:

- Activity

But exact sub-navigation requires actual capabilities.

Do not add empty tabs.

---

# 59. Minimal first workspace version

A first implementation can be one page:

```text
Deal header
Current report
Decision gap
Evidence channels
Respondent status
Next action
```

No need to launch with five sub-routes.

---

# 60. Global navigation

Until more authenticated surfaces exist, do not invent full enterprise nav.

Potentially only:

- Deals
- Account

plus public reference links where useful.

Exact global nav requires separate shell contract.

---

# 61. No global `42Q` nav by default

42Q is conditional evidence channel.

Not a standalone product destination for most users.

---

# 62. No global `AI Copilot`

Do not add an assistant/chat surface just because it is common in SaaS.

A future assistant requires actual governed capabilities and a separate contract.

---

# 63. No generic activity feed by default

Activity feed only justified if collaboration/audit needs it.

Do not fill overview with:

- User opened report
- User clicked evidence
- User logged in

unless decision-relevant.

---

# 64. Meaningful activity if later used

Potentially useful events:

- report version issued;
- respondent completed input;
- evidence added;
- contradiction created/resolved;
- report sealed;
- outcome verification due.

But only if product truly tracks them.

---

# 65. Workspace primary CTA

Primary action derives from current Decision Gap / workflow.

Examples:

`Add internal evidence`

`Invite a target observer`

`Review evidence request`

`Open current report`

`Go deeper with private evidence`

Not always:

`Upgrade`.

---

# 66. CTA fail-closed

Do not show action that backend cannot complete.

No placeholder buttons.

---

# 67. No “Analyze with AI” CTA

The product action is evidence/workflow-specific.

---

# 68. Public evidence refresh

If supported:

`Refresh public evidence`

should create a new analysis/version path.

Do not silently mutate.

---

# 69. Refresh status

Show:

- last public evidence review;
- refresh requested;
- refreshed version available.

Not fake live monitoring unless implemented.

---

# 70. Private evidence entry

Workspace can show:

`Private evidence`

with state and action.

But uploader is separate contract.

This document does not define file-upload UI.

---

# 71. Paid boundary

If private evidence requires paid engagement:

state:

`Private evidence is available within a paid engagement.`

Exact commercial copy requires current pricing authority.

---

# 72. No price card on workspace overview by default

Workspace is work surface.

Commercial scope may appear when action requires it.

Do not keep permanent sales banner.

---

# 73. Economic exposure

If current engagement supports it:

workspace may show status:

`Economic exposure modeling — not started / in progress / available`

Do not show dollars until report authority exists.

---

# 74. Individual / 42Q status

Only if relevant:

`Specific-leader forecast`

status:

- Not requested
- Individual data required
- In progress
- Forecast available

Exact labels governed later.

---

# 75. No personality result card

Never:

`Leader type: X`

or:

`Shadow type`.

Client receives behavioral forecast, not internal type.

---

# 76. Verification lifecycle

If Deal eventually has locked forecast and outcome window:

workspace can later show:

`Verification`

with due/available state.

Not required for every Deal overview.

---

# 77. Verification vocabulary

When result exists:

- Confirmed;
- Partially confirmed;
- Not determinable;
- Missed;
- Falsified.

Do not invent accuracy percentage.

---

# 78. Locked forecast state

If forecast is locked:

workspace must distinguish:

- forecast content;
- later evidence;
- outcome verification.

No silent editing of locked claims.

---

# 79. Report congruence

Workspace report view uses same canonical report structure as:

- public report;
- PDF;
- email;
- paid report;
- expert view.

Workspace navigation cannot create a second report ontology.

---

# 80. Expert view relationship

Internal expert view is expanded same Deal/report.

It may add:

- provenance;
- alternatives;
- conflicts;
- decision controls.

But client and expert remain block-congruent.

---

# 81. Client workspace does not expose expert controls

No:

- approve finding;
- override environment;
- analyst severity;
- authority resolution button.

Unless client role specifically has governance authority, which is not current target.

---

# 82. Deal permissions

First version may be simple:

- creator has access.

Collaboration can come later.

Do not invent:

- Admin;
- Editor;
- Viewer;
- Owner;
- Auditor

role matrix prematurely.

---

# 83. Collaboration future-proofing

Data model should allow later collaborator permissions.

UI should not require them now.

---

# 84. Respondent privacy

Respondent can participate through tokenized invite without being workspace collaborator.

Workspace shows completion status, not necessarily identity/raw answers.

---

# 85. Evidence privacy

Private evidence visibility may vary by user.

Workspace should be designed so an evidence item can be:

- visible;
- metadata-only;
- restricted.

Do not assume every Deal member sees every file.

---

# 86. Current evidence review states can support UI

Potential visible status mapping:

`Unreviewed`

`Under review`

`Verified`

`Disputed`

But exact client wording must avoid implying stronger legal/audit status than intended.

---

# 87. “Verified” scope

If used, explain what was verified:

- source identity;
- evidence relevance;
- factual claim;

depending on actual process.

Do not let one green `Verified` badge imply full analytical truth.

---

# 88. Deal overview cards should not become score tiles

Do not create:

- Risk score;
- Confidence score;
- Compatibility score;
- Data completeness score

as four top cards unless each is canonical and decision-useful.

---

# 89. If ECS exists

ECS belongs inside current report/structural result.

It is not Deal header KPI.

---

# 90. If evidence quality exists

Show within affected report/evidence block.

Not one universal top-level percentage.

---

# 91. If contradiction exists

Highlight contextually:

`Conflicting evidence requires review`

with path to relevant block.

---

# 92. If no contradiction

Do not show:

`0 contradictions`

as success trophy.

Absence can simply be silent.

---

# 93. Current public result card

A saved Deal should visibly preserve:

`Public analysis`

as first report/evidence stage.

This reinforces that value existed before account.

---

# 94. “Start over” action

Not prominent.

Creating a new analysis should not accidentally erase current Deal.

If re-analysis needed:

create version / refresh process.

---

# 95. New Deal action

Authenticated shell may eventually offer:

`Analyze another deal`

or:

`New deal`

This creates a separate Deal.

No need in first single-Deal surface header.

---

# 96. Deals index relationship

If `/deals` exists later:

Deal Workspace is detail.

Back action:

`All deals`

Only when index is implemented.

Do not render dead breadcrumb.

---

# 97. Breadcrumbs

Potential:

`Deals / Acquirer × Target`

only if Deals route exists.

No fake breadcrumbs.

---

# 98. Browser title

Candidate:

`Acquirer × Target — MergeVue`

Avoid:

`Workspace Dashboard`.

---

# 99. Visual lineage

Workspace should inherit MergeVue canon:

- light blue-gray background;
- dark ink;
- white surfaces;
- thin gray borders;
- 8px radius;
- navy/blue active states;
- restrained shadow;
- Inter/system sans;
- mono only for IDs/timestamps where useful.

---

# 100. Density

Authenticated work surface can be denser than public marketing pages.

But no:

- tiny dashboard typography;
- Bloomberg-like wall of numbers;
- 12 KPIs above fold.

Decision hierarchy stays clear.

---

# 101. Recommended desktop layout

Possible:

```text
Authenticated shell

Deal header

Main column:
  Current report
  Decision gap
  Evidence channels

Secondary column:
  Next action
  Respondent status
  Current workflow state
```

Not fixed; designer may choose a strong alternative preserving hierarchy.

---

# 102. Mobile layout

One column:

1. Deal identity
2. Current report
3. Decision gap
4. Next action
5. Evidence channels
6. Respondents
7. secondary metadata

No horizontal dashboard.

---

# 103. Responsive sidebar

If authenticated sidebar exists:

must collapse accessibly.

Do not hide essential Deal identity.

---

# 104. Accessibility

Target WCAG 2.2 AA.

Need:

- one H1;
- semantic sections;
- state labels in text;
- keyboard access;
- visible focus;
- accessible tables;
- responsive evidence lists;
- no color-only workflow state;
- no drag-only interactions.

---

# 105. Keyboard order

Order follows decision hierarchy, not visual CSS rearrangement.

---

# 106. Status announcement

After evidence/report update:

screen reader should receive meaningful confirmation.

Example:

`New report version is available.`

---

# 107. Loading state

Workspace may load several server-backed objects.

Prefer section-level loading.

Do not block entire Deal if one secondary section fails.

---

# 108. Partial backend failure

Example:

report loads;
respondent service unavailable.

Show report and local error in respondent block.

No whole-screen fatal error unnecessarily.

---

# 109. Authority failure

If current report loses/does not have valid authority:

fail closed only affected report.

Deal Workspace can still exist and show workflow/evidence state.

---

# 110. Unauthorized access

Do not render Deal identity before access decision.

Security beats continuity.

---

# 111. Offline / network loss

Do not claim save/update completed until server confirms.

If read-only cached view exists, label appropriately.

---

# 112. Empty evidence state

`No internal evidence has been added yet.`

CTA if appropriate:

`Add internal evidence`

Not:

`Your analysis is incomplete` as blanket warning.

---

# 113. Empty respondent state

`No respondents have been invited.`

Only show invite CTA if current workflow calls for respondents.

---

# 114. Empty private evidence state

If private evidence not yet needed:

no alarm.

If Decision Gap requires it:

explain why.

---

# 115. Empty report history

If only one report:

show current report.

Do not create empty `History` tab.

---

# 116. Workspace no-data principle

Absence of data must not be dressed as analytics.

No zero charts.

---

# 117. Workspace no-demo principle

Do not populate new Deal with sample evidence, fake respondents, or fake risk cards.

---

# 118. No generic onboarding checklist

Do not show:

`Complete your profile`

`Invite teammates`

`Upload logo`

unless relevant to Deal analysis.

---

# 119. Deal-centric onboarding

If user needs guidance:

`Your public analysis is saved. The next unresolved question is [X].`

That is enough.

---

# 120. Private documents and evidence uploader

Workspace can route to uploader.

But file handling, states, security, permissions and provenance need a separate contract.

No inline ad-hoc upload unless that contract exists.

---

# 121. Evidence requests

Workspace may show generated/requested evidence needs:

`Requested evidence`

Example:

`Decision-rights document or integration governance plan`

Only if report authority supports request.

---

# 122. No arbitrary document checklist

Do not use generic M&A data-room checklist as if MergeVue requires all of it.

Ask only evidence relevant to current gap.

---

# 123. Economic data requests

Same rule.

Ask economic inputs only when quantification path selected.

---

# 124. Named leader request

If user adds a named-leader forecast request:

workspace should clearly switch to individual-data requirement.

No attempt to infer from organizational evidence.

---

# 125. Specific-leader object

Do not automatically create a permanent `People` module.

A specific-leader forecast request can live within Deal.

---

# 126. No global people database

MergeVue is not HRIS.

Do not turn individual channel into employee profiles.

---

# 127. Report sealing / locking

If paid forecast becomes locked:

workspace should show bounded state:

`Forecast locked`

with timestamp/version if public/client appropriate.

Not editable through ordinary UI.

---

# 128. Forecast verification due

Future:

`Verification due` or `Outcome review available`

only when timing exists.

No generic reminder for every Deal.

---

# 129. Notifications

Not defined fully here.

Workspace may need notifications for:

- respondent completed;
- report ready;
- evidence review completed;
- verification due.

Do not invent notification center until communication architecture exists.

---

# 130. Email notifications

Separate preference/notification contract.

Do not assume every state sends email.

---

# 131. Activity timestamps

Use unambiguous American-English dates/times.

Avoid overwhelming user with technical timestamps.

---

# 132. Internal IDs

Hide by default.

Report ID may appear in audit/footer context.

Deal ID does not need to be prominent.

---

# 133. Version labels

Human-readable:

`Report version 2`

or current canonical naming.

Do not expose hash as version label.

---

# 134. Audit provenance

Detailed audit/provenance can be available in bounded technical view later.

Workspace overview only shows enough to establish report identity/trust.

---

# 135. No governance leakage

Do not show:

- Owner accepted;
- IV PASS;
- CORR4;
- model provider;
- hidden artifact;
- audit package hash

as client-facing workspace states.

---

# 136. Exception handling

Internal exception/review may be represented client-side as:

`Additional review required`

if relevant.

No internal process details unless user needs them.

---

# 137. Workspace state source of truth

Server-authoritative state for:

- Deal access;
- saved evidence;
- invite completion;
- report authority;
- report versions.

Client UI does not infer completion from navigation alone.

---

# 138. Current session ledger is useful infrastructure

Existing server-side session ledger already stores portions of assessment state.

Future Deal persistence can build on governed server-side state rather than relying on browser-only session.

But this file does not dictate database implementation.

---

# 139. No localStorage-as-workspace

Browser persistence can help UX but cannot be the authoritative persisted Deal.

---

# 140. Refresh safety

Refreshing Deal Workspace must not erase state.

---

# 141. Cross-device claim

Only advertise cross-device access if account-backed persistence actually supports it.

---

# 142. Archiving

Future Deal state may allow archive.

Do not make Archive/Delete primary actions in first version.

---

# 143. Destructive actions

Require confirmation and appropriate permissions.

Separate lifecycle contract later.

---

# 144. Account-level shell

Workspace must not force public methodology/case-study links into authenticated primary navigation if that makes work harder.

They may be secondary/help links.

---

# 145. No product-mode confusion

Authenticated user should still recognize:

- same MergeVue;
- same visual language;
- same report semantics.

No abrupt switch to unrelated app design.

---

# 146. Design freedom

Designer may decide:

- exact two-column proportions;
- panel density;
- sticky side actions;
- sub-navigation pattern;
- responsive collapse;
- badge shape;
- whitespace.

Designer may not decide:

- new evidence types;
- new Deal statuses;
- new analytical scores;
- new report blocks;
- new respondent roles;
- new 42Q behavior;
- new routes/capabilities without authority.

---

# 147. Suggested first-version content inventory

Minimum viable Deal Workspace:

```text
Deal identity
Current report baseline
Decision Gap
Current next action
Evidence channels summary
Respondent summary when applicable
```

Everything else can come later.

---

# 148. Do not overbuild first version

Not required initially:

- comments;
- tasks;
- chat;
- notifications center;
- organization management;
- billing center;
- global reports library;
- global evidence library;
- customizable dashboards;
- integrations marketplace.

---

# 149. Product-object discipline

Every workspace component must answer:

> does this help the user understand or improve the evidence→analysis→decision chain for this Deal?

If no:

omit.

---

# 150. Proposed workspace section statuses

Not final enums, but UX categories:

## Current report

- Available
- Update available
- In review
- Not yet available

## Public evidence

- Reviewed
- Refresh available
- Limited

## Internal evidence

- Not started
- In progress
- Submitted
- Needs follow-up

## Private evidence

- Not started
- Requested
- Under review
- Reviewed

## Individual data

- Not required
- Required for requested forecast
- In progress
- Available

These labels must later map to real machine states.

---

# 151. Avoid fake uniformity

Different evidence channels have different state machines.

Do not force them into identical five-step pipeline just for UI symmetry.

---

# 152. Evidence-completion visibility

When questionnaire completed:

show completion.

Do not immediately show environment result before authority/calculation gates complete.

---

# 153. Report-ready visibility

Only server-authoritative reportReady state can unlock report.

Maintain current fail-closed principle.

---

# 154. Analyst-review visibility

If `analystReviewRequired` or equivalent governed state applies:

show review state only if paid/client workflow exposes it.

Do not auto-release.

---

# 155. Paid engagement status

Can exist as workflow metadata.

But do not place payment as main analytical status.

---

# 156. Billing failure

If later payment fails:

should not erase existing public report/evidence.

Commercial state is separate from analytical history.

---

# 157. Deal list card relationship

Workspace contract implies future Deals index card can summarize:

- deal identity;
- current phase;
- latest report;
- next action.

Not risk score.

---

# 158. Searchability

If Deals index grows, search by company pair / internal nickname.

No need inside single Deal Workspace.

---

# 159. URLs

Exact future route not fixed.

Candidate semantics:

`/deals/:dealId`

but this is not route authorization.

Implementation must create route decision and preserve backward navigation.

---

# 160. Deep links

Future Deal sub-surface deep links must enforce access server-side.

No security through obscurity.

---

# 161. Share links

Not in scope.

Do not add until separate contract.

---

# 162. Page title

Candidate:

`Acquirer × Target — MergeVue`

If internal nickname exists:

`Project Orion — Acquirer × Target — MergeVue`

---

# 163. Empty Deal protection

A Deal should not be created with no valid resolved identity except explicit internal draft workflow.

User-save flow creates Deal from an existing public analysis.

---

# 164. Deal creation source

Persist provenance:

- created from public analysis;
- created from authenticated new-deal flow;
- other authorized path.

UI need not expose technical source.

---

# 165. Report source scope

Workspace can show:

`Public evidence`

`Public + internal evidence`

`Public + internal + private evidence`

if accurate.

This helps user understand depth.

---

# 166. No “premium” evidence badge

Evidence scope is epistemic, not marketing.

---

# 167. Evidence provenance drill-down

Clicking evidence status can lead to evidence detail/list later.

No need to inline all sources on overview.

---

# 168. Decision Gap drill-down

Can link to canonical report block that produced gap.

This strengthens congruence.

---

# 169. Report change summary

If new report version available:

potential:

`What changed`

with bounded claim-level changes.

Do not let LLM freely summarize differences without structured diff authority.

---

# 170. No score delta theater

Do not show:

`Risk +12%`

unless canonical score genuinely supports that delta.

---

# 171. Version diff hierarchy

Prefer:

- resolved unknown;
- changed environment reading;
- new contradiction;
- changed recommended action;
- new forecast authority.

Only actual structured changes.

---

# 172. Client language around uncertainty

Good:

`Public evidence remains insufficient to determine the target's interaction environment.`

Not:

`Analysis incomplete — 40%.`

---

# 173. Visual severity

Do not make uncertainty look like system failure.

Neutral amber/info treatment if canon permits.

---

# 174. Deal Workspace and historical case studies

A saved live Deal should not automatically link to a historical case just because same companies appear.

Could show `Related historical case study` only if materially useful and deliberate.

---

# 175. Methodology reference

Workspace can link:

`Methodology`

from report/evidence explanation.

Not primary work nav.

---

# 176. Environment reference links

If report names an Interaction Environment:

link may open public environment reference.

Do not expose internal code.

---

# 177. Cross-surface consistency

Same public environment alias everywhere.

Same report block name everywhere.

Same evidence status meaning everywhere.

---

# 178. No alias drift

Workspace cannot invent shortened labels like:

`Performance`

for `The Performance Arena`.

---

# 179. Copy tone

Professional, factual, compact.

Avoid:

- celebratory gamification;
- fear copy;
- sales language in analytical panels;
- internal engineering jargon.

---

# 180. American English

All client copy American English.

Normalize inherited British forms where user-facing.

---

# 181. Dates

Use unambiguous dates.

Example:

`Sep 16, 2026`.

---

# 182. Monetary values

Only if source/authority exists.

Workspace overview does not need transaction value as decorative KPI.

---

# 183. Performance

Workspace should prioritize loading:

1. access decision;
2. Deal identity;
3. current report state;
4. Decision Gap;
5. secondary evidence/respondent data.

Do not block first paint on every sub-resource.

---

# 184. Error isolation

Each section can fail independently where safe.

---

# 185. Mutation controls

Actions that mutate analysis/evidence should reflect server-confirmed state.

No optimistic analytical conclusion changes.

---

# 186. Stale view

If Deal changed elsewhere:

refresh / conflict handling required.

Do not overwrite silently.

---

# 187. Concurrent collaborator edits

Future concern.

Do not overbuild until collaborators implemented.

---

# 188. Current internal model ≠ direct UI contract

The existence of fields in `canonicalDataModel.ts` does not authorize exposing them all.

Use it as domain foundation, not screen blueprint.

---

# 189. Legacy fields review

Some internal risk/status fields may reflect older product language.

Before client exposure:

- compare to current methodology;
- claims governance;
- public-safe vocabulary.

---

# 190. No stale `months 6–18` category as workspace nav

Legacy internal field names should not become UI just because they exist.

---

# 191. No client-facing internal severity unless governed

`Critical / high / medium / low` can be useful only if severity semantics are current and public-authorized.

Do not automatically decorate every risk with legacy severity.

---

# 192. Recommended first target layout

```text
[Authenticated shell]

Acquirer × Target
Saved deal · Last updated Sep 16, 2026

[Current report]
Public analysis
Open report

[Decision gap]
What remains unresolved
Why it matters
What evidence would help

[Next action]
Contextual CTA

[Evidence channels]
Public evidence
Internal observations
Private evidence
Individual data if relevant

[Respondents]
Only when applicable
```

---

# 193. Not in first target layout

- generic KPI ribbon;
- charts without report authority;
- AI assistant;
- task board;
- notes;
- chat;
- billing;
- organization admin;
- settings;
- activity stream;
- empty tabs.

---

# 194. Block-preservation / source matrix

Because no current workspace page exists, implementation must map each new block to an existing real source:

| Target block | Existing source primitive | New UI only? | Authority |
|---|---|---:|---|
| Deal identity | dealContext / Deal | | |
| Current report | serverReportProjection / report model | | |
| Decision gap | canonical report | | |
| Public evidence | report provenance | | |
| Internal evidence | session / answers / evidence | | |
| Private evidence | evidence model / paid flow | | |
| Respondents | respondent/invite flows | | |
| Contradictions | contradiction engine/model | | |
| Next action | workflow rules | | |

No block can be filled from designer invention.

---

# 195. Route decision artifact required

Before implementing exact authenticated route:

create:

`DEAL WORKSPACE ROUTE DECISION`

with:

- auth route architecture;
- Deal ID strategy;
- return intent;
- public route compatibility;
- access enforcement;
- deep-link policy.

---

# 196. Backend readiness gate

Do not ship customer workspace UI unless backend can support:

- authenticated identity;
- server-authorized Deal ownership;
- persistent Deal;
- public report attachment;
- report retrieval;
- secure mutation.

Read-only mock workspace is not production Deal Workspace.

---

# 197. WHAT WAS INTENTIONALLY REUSED

Before merge list:

- existing Deal/domain model;
- current assessment/session state;
- current report model;
- server report authority;
- evidence capture model;
- respondent flows;
- contradiction model;
- invitation flows;
- visual canon.

---

# 198. WHAT IS NEW

Explicitly mark target-only elements:

- authenticated Deal persistence;
- Deal Workspace surface;
- current-report baseline card;
- Decision Gap continuity;
- evidence-channel overview;
- optional Deals index relationship.

Do not describe them as existing until implemented.

---

# 199. WHAT CHANGED AND WHY

Format:

```text
EXISTING PRIMITIVE
→ TARGET WORKSPACE USE
→ PRODUCT NEED
→ AUTHORITY
```

Example:

```text
server assessment session + report projection
→ persistent Deal with current report baseline
→ user must be able to save public value and continue later without recreating analysis
→ account/save contract + canonical report congruence
```

---

# 200. Acceptance criteria

Deal Workspace passes only if:

1. authenticated persistence really exists;
2. exact route has separate route decision;
3. server enforces Deal access;
4. Deal is primary work object;
5. separate Workspace entity not invented without need;
6. public report baseline is preserved;
7. report version is visible/retrievable;
8. Decision Gap persists from public result;
9. next action derives from real workflow/evidence state;
10. account state does not alter analytical confidence;
11. workflow status and confidence are separate;
12. no universal progress percentage;
13. evidence channels remain distinct;
14. public evidence provenance preserved;
15. internal observations use existing canonical flows;
16. private evidence remains controlled;
17. 42Q hidden unless named-leader forecast requested;
18. no personality labels;
19. respondent ≠ collaborator;
20. invite flows reuse governed infrastructure;
21. canonical questions untouched;
22. evidence items retain provenance/review status;
23. contradictions remain visible where material;
24. no generic risk-dashboard replacement of report;
25. no giant ECS KPI as Deal identity;
26. report remains canonical client truth;
27. expert view remains congruent;
28. internal analyst controls not exposed to client;
29. no speculative role matrix;
30. saved Deal private by default;
31. no public indexing;
32. no global 42Q nav by default;
33. no global Evidence nav without cross-deal need;
34. no global Reports nav without cross-deal need;
35. no Workspaces nav without Workspace object;
36. no AI Copilot without governed capability;
37. no fake activity feed;
38. no fake invitation states;
39. no placeholder actions;
40. no generic onboarding checklist;
41. no fake source/evidence metrics;
42. no unsupported security claims;
43. no localStorage represented as authoritative persistence;
44. report authority remains server-side;
45. section-level failures do not unnecessarily destroy whole page;
46. unauthorized access does not leak Deal identity;
47. mobile preserves decision hierarchy;
48. WCAG 2.2 AA target maintained;
49. American English only;
50. no legacy internal terminology leaks;
51. no internal provider/governance artifacts shown;
52. exact environment aliases remain canonical;
53. no stale internal field becomes UI merely because it exists;
54. Deal identity and report survive refresh;
55. version changes are explicit;
56. adding evidence does not silently overwrite public baseline;
57. report/evidence state is machine-readable;
58. user sees what remains unresolved;
59. every workspace block maps to a real source primitive;
60. target-only functionality is labeled as target until implemented.

---

# 201. Финальный принцип

> **Deal Workspace is not a dashboard around MergeVue. It is MergeVue's evidence-to-decision chain organized around one transaction.**

> **The Deal stays the same while evidence deepens, reports version, contradictions emerge, and trust escalates.**

> **Do not create new product objects, scores, tabs, or navigation simply to make the authenticated product look complete. Build only the surfaces required by the real Deal, evidence, report, and respondent architecture.**
