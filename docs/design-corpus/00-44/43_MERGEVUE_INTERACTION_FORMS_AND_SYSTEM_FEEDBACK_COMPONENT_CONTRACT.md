# 43. Контракт взаимодействия, форм и системной обратной связи MergeVue

**Файл:** `43_MERGEVUE_INTERACTION_FORMS_AND_SYSTEM_FEEDBACK_COMPONENT_CONTRACT.md`  
**Версия:** 1.0  
**Дата:** 2026-09-16  
**Язык документации:** русский  
**Язык клиентского интерфейса:** только American English  
**Рынок первой версии:** США  
**Статус:** **OWNER-ACCEPTED / CONTROLLING INTERACTION, FORMS AND SYSTEM FEEDBACK COMPONENT CONTRACT / C-02, C-08 CLOSED / C-09–C-14 CLOSED AT UI-REPRESENTATION LEVEL / НЕ СОЗДАЁТ НОВЫЕ BUSINESS STATES, AUTHORIZATION, PRICING, QUESTIONNAIRE, NOTIFICATION ИЛИ ANALYTICAL SEMANTICS**  
**Тип документа:** interaction grammar / forms / system feedback / reusable UI behavior authority  
**Закрывает planned objects на design-contract уровне:** `C-02 Набор компонентов`, `C-08 Формы`, а также reusable representation obligations `C-09 Уведомления`, `C-10 Блокировки`, `C-11 Платные ограничения`, `C-12 Ошибки`, `C-13 Неопределённость`, `C-14 Противоречия`  
**C-03 Состояния и смысловые маркеры:** отдельная новая semantic authority здесь не создаётся; state semantics остаются под `10`, analytical state presentation — под `42`, а настоящий `43` определяет только interaction/system-feedback representation этих уже авторизованных состояний  
**Upstream authority:** `09`, `10`, `11`, `18`, `20`, `21`, `22`, `23`, `24`, `31`, `33`, `34`, `35`, `36`, `37`, `41`, `42`, а также page/workflow contracts `12–40` по контексту  
**Owner acceptance:** 2026-09-16  
**Следующий authorized numbered design act:** `44_MERGEVUE_DEVELOPMENT_HANDOFF_AND_DESIGN_QA_CONTRACT.md`  
**Главный принцип:** UI control представляет уже разрешённое действие или уже существующее состояние; control не создаёт entitlement, notification не создаёт state, disabled button не является authorization, toast не является source of truth, form не создаёт новую methodology, а error/blocked/unknown/permission-denied остаются разными состояниями.  
**Ключевые инварианты:** `ACTION ≠ AUTHORITY`, `CONTROL ≠ PERMISSION`, `DISABLED ≠ DENIED`, `AUTHENTICATION ≠ AUTHORIZATION`, `FORM ≠ DATA MODEL AUTHORITY`, `VALIDATION ≠ ANALYTICAL JUDGMENT`, `STATE FIRST, FEEDBACK SECOND`, `NOTIFICATION ≠ SOURCE OF TRUTH`, `ERROR ≠ UNKNOWN`, `UNKNOWN ≠ BLOCKED`, `BLOCKED ≠ NOT ENTITLED`, `PAID ≠ MORE CERTAIN`, `PAYMENT ≠ DATA RIGHTS`, `DIALOG ≠ POLICY`, `CLIENT STATE ≠ SERVER AUTHORITY`, `NO FAKE SUCCESS`, `NO FAKE CHECKOUT`, `NO DARK PATTERNS`, `FAIL CLOSED`.

---

# 0. Назначение

Этот документ определяет reusable interaction grammar MergeVue.

Он отвечает на вопрос:

> **Как пользователь вводит данные, подтверждает действия, понимает системное состояние, получает feedback, проходит auth/commercial/evidence transitions и взаимодействует с analytical components — так, чтобы frontend не изобретал product truth?**

`43` определяет:

1. action hierarchy;
2. buttons;
3. links;
4. icon buttons;
5. form fields;
6. selectors;
7. checkboxes;
8. radio groups;
9. text areas;
10. file-select controls как UI primitive;
11. validation;
12. help text;
13. disclosure controls;
14. tabs/segmented controls where lawful;
15. dialogs;
16. confirmation dialogs;
17. destructive-action dialogs;
18. banners;
19. inline system messages;
20. status notices;
21. success/error feedback;
22. loading/submission;
23. blocked states;
24. disabled states;
25. permission-denied states;
26. paid restriction representation;
27. notification representation;
28. auth/session feedback;
29. invite/respondent interaction patterns;
30. sharing/export interaction patterns;
31. responsive/keyboard/focus behavior;
32. implementation and non-regression rules.

---

# 1. Что `43` НЕ создаёт

Настоящий документ не создаёт:

- новый business workflow;
- новый Deal state;
- новый evidence state;
- новый analytical state;
- новый confidence state;
- новый contradiction state;
- новый notification event;
- новый recipient type;
- новый Deal role;
- новую permission;
- новую entitlement;
- новый paid tier;
- новую цену;
- checkout/payment processor;
- новый questionnaire;
- новый вопрос;
- новый 42Q behavior;
- новую auth technology;
- OAuth/SSO/passkey/MFA capability;
- новый evidence class;
- новый report block;
- новый forecast state;
- новую data-right;
- новую deletion capability;
- новый sharing right;
- новый route;
- новый SLA;
- новую monitoring capability;
- новую security claim.

Если interaction невозможно определить без новой substantive semantic authority:

> **STOP. Upstream contract must resolve it first.**

---

# 2. Authority hierarchy

При конфликте:

1. methodology / mathematical / report authority;
2. domain/business workflow authority;
3. permissions / identity / security / privacy authority;
4. notification / sharing / commercial authority;
5. global state model `10`;
6. analytical presentation `42`;
7. accessibility/content `11`;
8. visual canon `09`;
9. настоящий interaction contract.

`43` не может переопределить upstream.

---

# 3. Базовая формула

```text
AUTHORITATIVE STATE
+
AUTHORIZED ACTION
+
USER INTENT
→
CONTROL
→
REQUEST
→
SERVER RESULT
→
SYSTEM FEEDBACK
```

Не:

```text
CONTROL
→
CLIENT ASSUMES SUCCESS
→
LOCAL STATE
→
PRODUCT TRUTH
```

---

# 4. Interaction ≠ truth

Кнопка:

```text
Save this deal
```

не означает, что Deal сохранён.

Только authoritative completion может дать:

```text
Deal saved
```

Кнопка:

```text
Share report
```

не означает, что recipient authorized.

Только rights/permission/dispatch chain определяет результат.

---

# 5. Server-authoritative rule

Server-authoritative где upstream это требует:

- identity/session;
- Deal access;
- permissions;
- saved Deal;
- evidence persistence;
- invite state;
- report authority;
- report version;
- paid state;
- share state;
- notification/dispatch state where known;
- forecast lock/seal/verification.

Frontend representation не заменяет authority.

---

# 6. Action hierarchy

Каждая surface может иметь:

```text
Primary action
Secondary action
Tertiary action
Destructive action
Contextual action
```

Но visual priority следует user need and workflow authority.

Не revenue pressure.

---

# 7. Primary action

Primary CTA должен соответствовать:

- текущему user intent;
- lawful next step;
- highest-value unresolved need, если rules действительно определяют его.

Если system не может законно выбрать один next step:

> показывать несколько neutral options.

---

# 8. No fake prioritization

Не делать:

```text
Recommended
Best
Most popular
Smart choice
```

если ranking не авторизован.

Commercial tier labels не получают recommendation badge автоматически.

---

# 9. Button copy

Button начинается с глагола и описывает результат.

Предпочтительно:

```text
Analyze deal
Save deal
Add evidence
Invite respondent
Review scope
Share report
Download PDF
Request analysis
Sign in
Create account
```

Не:

```text
Next
Go
Submit
Continue
```

когда действие можно назвать точнее.

`Continue` допустимо только в очевидном линейном flow.

---

# 10. Button semantic rule

Button label отвечает:

> **What will happen if I activate this control?**

Не:

> что продукт хочет от меня.

---

# 11. Button state set

Common presentation states:

```text
idle
hover
focus
active
loading
disabled
```

Это UI states.

Они не являются domain state.

---

# 12. Disabled button

Disabled означает только:

> действие сейчас нельзя активировать через этот control.

Disabled **не объясняет почему**.

Если причина materially relevant:

- show text;
- show required state;
- show permission message;
- or hide control if user should never have it.

---

# 13. Disabled ≠ authorization

Frontend `disabled=true` не является security control.

Protected action всё равно требует server authorization.

---

# 14. Hide vs disable

## Hide

Использовать когда:

- action irrelevant;
- action would leak restricted capability/data;
- role should not know action exists;
- state makes action nonsensical.

## Disable

Использовать когда:

- action concept relevant;
- user benefits from knowing it exists;
- clear prerequisite can be communicated.

---

# 15. Disabled control help

If disabled due to prerequisite:

```text
Complete company confirmation before starting analysis.
```

not:

```text
Unavailable.
```

unless exact reason cannot safely be disclosed.

---

# 16. Action deduplication

Одна semantic action не должна одновременно появляться:

- top bar;
- card;
- sticky footer;
- sidebar;

без UX need.

Avoid CTA echo.

---

# 17. Link vs button

Button:

> changes state / submits / starts action.

Link:

> navigates to another location/resource.

Do not style navigation as submit without reason.

---

# 18. External link

If external destination:

- preserve context;
- no hidden data in URL;
- appropriate accessible indication where useful.

---

# 19. Icon-only control

Allowed only for universally recognizable low-risk actions when accessible label exists.

High-impact actions require text.

No icon-only:

- delete;
- revoke access;
- lock forecast;
- share externally;
- submit final respondent answers.

---

# 20. Component family inventory

`43` defines reusable interaction families:

```text
A. Action Button
B. Action Group
C. Text Input
D. Search / Entity Input
E. Text Area
F. Select / Combobox
G. Radio Group
H. Checkbox
I. File Selection Control
J. Inline Help / Hint
K. Field Error
L. Form Error Summary
M. Step / Progress Indicator
N. Disclosure / Accordion
O. Tabs / Segmented Navigation
P. Inline Status Notice
Q. Banner
R. Success Notice
S. Error Notice
T. Blocking Notice
U. Permission Notice
V. Paid Restriction / Commercial Transition
W. Confirmation Dialog
X. Destructive Confirmation Dialog
Y. Auth / Re-auth Prompt
Z. Notification Representation
AA. Invite / Recipient Status Control
AB. Share / Export Control
AC. Loading / Skeleton
AD. Retry Pattern
AE. Empty / Unavailable Interaction State
```

---

# 21. Common interaction component anatomy

Каждый interactive component имеет:

1. purpose;
2. triggering user intent;
3. authoritative action/state;
4. required data;
5. allowed roles/surfaces;
6. enabled condition;
7. disabled/hidden condition;
8. loading state;
9. success result;
10. recoverable failure;
11. blocking failure;
12. permission failure;
13. keyboard behavior;
14. focus behavior;
15. screen-reader name/description;
16. mobile behavior;
17. prohibited inference.

---

# 22. Form principle

Form собирает только данные, необходимые для конкретной current task.

No CRM creep.

No trust-level overcollection.

---

# 23. Progressive data request

Request data at moment it becomes necessary.

Examples:

- company names for public entry;
- account identity only when saving;
- organization detail when paid/collaboration/private evidence requires;
- private files only for specific evidence need;
- 42Q only for named-leader forecast context.

---

# 24. Trust progression ≠ security classification

UX trust progression may deepen:

```text
public
account
internal observations
private evidence
individual data
```

Это не security label taxonomy.

Do not show `Trust level 4` to users.

---

# 25. Do not over-request

Saving public report must not require:

- job title;
- phone;
- company size;
- budget;
- private documents;
- 42Q.

Unless separate workflow authority later requires.

---

# 26. Required fields

Mark required before input where possible.

Do not wait until submit to reveal all requirements.

---

# 27. Optional fields

Do not visually imply optional field is required.

If optional but useful, explain purpose briefly.

---

# 28. Labels

Every input has visible label.

Placeholder is not label.

---

# 29. Placeholder

Use for example/format only.

Not instructions that disappear on typing.

---

# 30. Help text

Help answers:

- why requested;
- expected format;
- privacy/use context where material.

Do not turn form into legal wall.

---

# 31. Field grouping

Group by user task.

Not database schema.

---

# 32. Field order

Natural cognitive order.

Do not order by backend property names.

---

# 33. Validation layers

Distinguish:

```text
syntactic validation
semantic/domain validation
authorization
analytical validation
server/process validation
```

UI must not conflate.

---

# 34. Client-side validation

Appropriate for:

- required field;
- obvious format;
- known length;
- immediate usability.

Client validation never proves server acceptance.

---

# 35. Server validation

Authoritative for:

- identity;
- entity resolution;
- permissions;
- save;
- invite;
- evidence persistence;
- paid/commercial state;
- share;
- report authority.

---

# 36. Validation timing

Prefer:

- on blur where helpful;
- on submit;
- immediately for obvious format only.

Avoid aggressive errors while user is still typing.

---

# 37. Error placement

Field error adjacent to field.

Also add error summary for long/complex form where useful.

---

# 38. Error copy

Error says:

1. what went wrong;
2. how to fix if known.

Prefer:

```text
Enter both company names.
```

Not:

```text
Invalid input.
```

---

# 39. Error does not blame

No:

```text
You entered an invalid company.
```

Better:

```text
We couldn't match this company. Check the name or choose a suggested company.
```

---

# 40. Unknown entity

Unknown entity is not technical error.

Could require:

- clarification;
- alternate candidate;
- retry;
- manual bounded input.

Do not fake resolution.

---

# 41. Entity resolution confirmation

When multiple candidates:

show enough identifying context for user to choose.

Do not show sensitive/unverified enrichment as if confirmed.

---

# 42. Company entry

First public entry requires two company names.

Other fields deferred/conditional according to `18`.

Do not reintroduce long intake before first value.

---

# 43. Public entry success

Success only after actual authoritative state.

No:

```text
Companies resolved
```

before both are resolved.

No:

```text
Analysis ready
```

before report authority.

---

# 44. Public research limitation

Limited public evidence is a limitation, not error.

System feedback must say that accurately.

---

# 45. Submission state model

Generic form:

```text
idle
validating
submitting
success
recoverable failure
blocking failure
```

Domain state remains separate.

---

# 46. Prevent duplicate submit

During non-idempotent action:

- disable duplicate activation;
- preserve accessible loading state;
- backend idempotency where required.

UI lock alone insufficient.

---

# 47. Loading labels

Use exact action:

```text
Saving deal…
Creating invitation…
Uploading document…
Sending request…
```

Not generic spinner only.

---

# 48. Loading honesty

Do not say:

```text
Analyzing…
Verifying…
Securing…
```

unless that exact process is occurring.

---

# 49. Async processing

If backend processing continues after request:

show authoritative processing state.

Do not require tab open if backend truly supports persistence.

Do not claim background completion if not implemented.

---

# 50. Skeleton

Skeleton indicates content loading.

It does not imply:

- object exists;
- object authorized;
- item count;
- success.

---

# 51. Success notice

Success text describes completed authoritative action.

Examples:

```text
Deal saved
Invitation created
Request sent
Report shared
```

only when true.

---

# 52. No fake success

Frontend click is never enough.

No optimistic success for high-impact operations unless architecture guarantees rollback/consistency and wording remains truthful.

---

# 53. Success persistence

Success toast may disappear.

Underlying state must remain visible where it matters.

Toast is not source of truth.

---

# 54. Error categories

Global interaction system distinguishes:

```text
FIELD_ERROR
FORM_ERROR
NETWORK_ERROR
SERVER_ERROR
PERMISSION_ERROR
AUTH_REQUIRED
SESSION_EXPIRED
DOMAIN_BLOCK
QUALITY_BLOCK
NOT_FOUND
CONFLICT
RATE_LIMIT / RETRY_LATER where real
```

Exact internal enums may differ.

---

# 55. Technical error ≠ business block

Example:

```text
Could not save due to network error
```

≠

```text
Report blocked pending review
```

---

# 56. Error ≠ unknown

System failure does not become `Cannot determine`.

---

# 57. Error ≠ no data

Failed fetch does not render empty state.

---

# 58. Retry

Offer retry only where safe.

If retry could duplicate action:

use idempotency/status check.

---

# 59. Retry copy

Prefer:

```text
Try again
```

with retained input.

Do not force full re-entry unless necessary.

---

# 60. Preserve user work

Recoverable failure should preserve:

- typed fields;
- selected Deal;
- selected action;
- uploaded metadata where safe;
- report context.

Do not erase public report on save failure.

---

# 61. Conflict state

Conflict/duplicate gets own treatment.

Example saving Deal:

- existing Deal found;
- provide lawful resolution.

Do not create duplicate silently.

---

# 62. Form dirty state

Unsaved changes warning only if actual data would be lost.

No nuisance confirmation on harmless navigation.

---

# 63. Destructive action definition

Destructive includes actions that can:

- delete;
- revoke;
- remove access;
- invalidate invitation;
- discard unsaved material;
- lock irreversible artifact where policy treats it as irreversible.

---

# 64. Destructive hierarchy

Destructive action visually distinct but not theatrical.

No large red surface unless needed.

---

# 65. Confirmation dialog

Use when:

- consequence material;
- difficult to reverse;
- identity/recipient matters;
- action affects access/data/report state.

---

# 66. Confirmation dialog anatomy

Required:

```text
Title describing action
Object affected
Consequence
Irreversibility/reversibility
Primary confirm action
Cancel
```

Optional:

- reason;
- current recipient;
- exact report version.

---

# 67. Confirmation button wording

Use exact action:

```text
Remove access
Revoke invitation
Delete draft
Lock forecast
Share report
```

Not:

```text
Yes
Confirm
OK
```

when consequence material.

---

# 68. Cancel

Cancel remains easy and neutral.

No dark-pattern styling.

---

# 69. Destructive typing confirmation

Do not require typing object name unless consequence/high risk justifies.

Avoid ceremony as substitute for authorization.

---

# 70. Delete semantics

Do not show generic:

```text
Delete all data
```

unless exact lifecycle capability exists.

Archive/remove access/delete Deal/delete account/delete evidence remain distinct.

---

# 71. Account deletion

Do not imply account deletion = Deal deletion.

Interaction must follow `38/41` lifecycle authority.

---

# 72. Respondent deletion

No casual delete button because provenance/history may require preservation.

---

# 73. Withdrawal

If withdrawal capability not governed, do not invent UI.

---

# 74. Disclosure / accordion

Use to reveal:

- deeper evidence detail;
- methodology reference;
- provenance;
- legal/privacy explanation;
- additional help.

Material limitation cannot live only collapsed if needed for correct interpretation.

---

# 75. Disclosure control semantics

Button communicates expanded/collapsed state to assistive tech.

---

# 76. Tabs

Tabs appropriate for peer sections within one context.

Not for unrelated workflows.

---

# 77. Tabs do not create state

Selecting tab does not imply workflow completion.

---

# 78. Tabs vs navigation

If route/history/deep link matters, use navigation pattern rather than fake local tab.

---

# 79. Stepper

Stepper only if sequence is genuinely ordered.

Do not force different evidence channels into one five-step pipe for visual symmetry.

---

# 80. Progress indicator

Allowed when real denominator/steps exist.

No universal:

```text
82% complete
```

without objective denominator.

---

# 81. Phase progress

Can show real workflow phases if supported:

```text
Public analysis
Internal evidence
Private evidence
Review
Report
```

but not imply every Deal must traverse all phases.

---

# 82. Inline status notice

For local object state.

Examples:

```text
Additional evidence required
Review in progress
Responses submitted · analysis update pending
```

only if authoritative.

---

# 83. Banner

Banner reserved for broad context affecting current page/section.

Examples:

- system outage where capability exists;
- session warning;
- report blocked;
- permissions changed.

Not every success.

---

# 84. Global banner

Only global condition.

Do not use Deal-specific issue as global app outage.

---

# 85. System outage banner

Operational capability separate from ordinary notifications.

Do not invent uptime/status service.

---

# 86. Success toast

Suitable for low-risk confirmation where persistent underlying state visible.

Examples:

```text
Link copied
Draft saved
```

if true.

Not sole feedback for major operation.

---

# 87. Error toast

Not enough for form errors requiring correction.

Use inline + summary.

---

# 88. Toast duration

Must allow reading.

Critical error should persist or be represented in page state.

---

# 89. Toast stacking

Avoid notification storm.

Deduplicate repeated events.

---

# 90. Notification representation principle

From `36`:

> **STATE FIRST, NOTIFICATION SECOND.**

`43` renders notification-related feedback.

It does not create notification eligibility/event semantics.

---

# 91. Notification channels

Initial design must not imply general availability of:

- SMS;
- push;
- Slack;
- Teams;
- continuous alerting;
- general notification center.

---

# 92. In-product state first

For many workflows, visible Deal status is primary.

Email is secondary convenience/transactional follow-up.

---

# 93. Notification center

Not required for v1.

Do not add bell icon with fake activity.

A real `Needs attention` surface can be enough.

---

# 94. Notification center ≠ activity feed

Do not conflate:

- system/user-relevant notifications;
- every event log.

---

# 95. Needs attention

Only real actionable items.

No arbitrary engagement prompts.

---

# 96. Notification severity

`Urgent` / `Critical` only with real authority.

UI layer cannot invent severity.

---

# 97. Transactional ≠ marketing

Form/checkbox/notification settings must keep separate.

Submitting Deal action does not subscribe user to marketing.

---

# 98. Marketing consent

Separate explicit optional choice where used.

No prechecked unrelated consent.

---

# 99. Essential transactional communication

May remain necessary for action/security workflow.

Marketing unsubscribe must not disable essential security messages.

---

# 100. Notification dispatch states

Only show states system actually knows.

Potential upstream states:

```text
QUEUED
SENT_TO_PROVIDER
DELIVERED
BOUNCED
FAILED
CANCELLED
```

No UI invention.

---

# 101. Sent ≠ delivered

Never relabel provider acceptance as delivered unless architecture supports.

---

# 102. Delivered ≠ read

No `Read` without actual tracking authority.

---

# 103. Opened ≠ understood

Do not infer user comprehension.

---

# 104. Clicked ≠ action completed

A link click is not respondent completion/share acceptance/etc.

---

# 105. Email is not database

Notification body is not unique holder of analytical state.

User must be able to return to authoritative surface where applicable.

---

# 106. Sensitive notification content

Do not include by default:

- raw respondent answers;
- raw 42Q;
- type/function;
- private document content;
- secret invite token beyond governed access mechanism;
- internal analyst notes.

---

# 107. Respondent reminder

Manual before automated unless automation authority exists.

Do not imply scheduler.

---

# 108. Reminder cancellation

Once complete/revoked/expired/superseded, stale reminder should not remain active.

---

# 109. Alert ≠ checkpoint ≠ reminder

Visual system can distinguish labels/icons, but meanings come from `36`.

---

# 110. Paid restriction principle

Paid UI answers:

> **What additional evidence/work is justified by current Decision Gap?**

Not:

> **Which premium feature can we sell?**

---

# 111. Price placement

Price follows:

1. Decision Gap;
2. evidence need;
3. scope rationale.

Not first screen hero.

---

# 112. Current target price ladder

Where current accepted commercial authority applies:

```text
$0
$5,000
$10,000
$15,000
$30,000
```

`43` does not create/alter these values.

---

# 113. Paid scope card

May show:

```text
scope name
why this scope
what will be tested
what user receives
what is excluded
price
next action
lower sufficient alternative if applicable
```

No feature-grid theater.

---

# 114. Paid ≠ certainty

Do not imply:

```text
Pay more → higher confidence
```

Evidence can remain contradictory or `Cannot determine`.

---

# 115. Stay free

Valid user path.

Do not hide public result.

---

# 116. Lower sufficient scope

When authority says smaller scope sufficient:

show it.

No decoy tier.

---

# 117. Commercial badges forbidden

No:

```text
Most popular
Best value
Recommended for you
Limited offer
```

unless separate truthful authority.

---

# 118. Fake discount forbidden

No:

- crossed-out invented price;
- countdown;
- fake scarcity;
- urgency timer.

---

# 119. Fear anchor forbidden

No UI framing:

```text
What you lose if you do nothing
```

without Deal-specific evidence authority.

---

# 120. ROI/savings

No guaranteed ROI/savings claims.

---

# 121. Fake checkout forbidden

Do not render:

- credit-card form;
- Stripe checkout;
- `Pay now`;
- payment success;

unless actual commercial/payment infrastructure authority exists.

---

# 122. Request analysis vs buy

Use actual motion.

Current design may use:

```text
Request this analysis
Discuss scope
```

when self-serve checkout absent.

---

# 123. Consultation

Consultation not universal gate.

Keep minimal fields.

Carry forward Deal context.

---

# 124. Consultation fields

Do not add:

- budget;
- company size;
- procurement stage;
- phone;
- timeline;

without actual process need.

---

# 125. Consultation success

After authoritative request created:

```text
Request received
```

plus known next step.

No response-time promise without SLA.

---

# 126. No fake calendar

If no booking integration:

do not show slots.

---

# 127. Email capture purpose

Explicit:

```text
Email me this analysis
```

or:

```text
Create an account to save this deal
```

No ambiguous lead form.

---

# 128. Account creation principle

Account follows user action.

No timed modal.

No exit-intent signup.

No blur-gate before earned public value.

---

# 129. Auth choice

Where supported:

```text
Sign in
Create account
```

clear distinction.

---

# 130. No fake auth option

Do not render:

```text
Continue with Google
Continue with Microsoft
Enterprise SSO
Passkey
```

unless implemented/authorized.

---

# 131. Authentication ≠ authorization

Successful login does not automatically grant Deal access.

UI must represent access denial separately.

---

# 132. Account ≠ Deal access

Do not route authenticated user into Deal merely because email matches.

---

# 133. Session ≠ permission

Active session can coexist with denied object.

---

# 134. Re-auth

High-sensitivity actions may require re-auth if `37`/implementation says so.

Preserve return intent.

---

# 135. Session expiry

If session expires during work:

- preserve safe draft where architecture permits;
- prompt sign-in/re-auth;
- do not expose protected content after expiry;
- return to lawful context.

---

# 136. Logout

Logout ≠ delete data.

Feedback:

```text
Signed out
```

not:

```text
Account removed
```

---

# 137. Auth error privacy

Avoid user enumeration.

Do not disclose unnecessary account existence.

---

# 138. Recovery

`43` does not select password/magic-link/etc recovery technology.

UI follows actual identity architecture.

---

# 139. Return to intent

After sign-in/re-auth:

return to:

- same Deal;
- same report version;
- same Decision Gap;
- selected action where still allowed.

No generic Home reset.

---

# 140. Save this deal flow

Conceptual:

```text
Save this deal
→ auth if required
→ persist authoritative Deal/report binding
→ return to saved Deal
```

---

# 141. Save states

Client-facing pattern:

```text
Save this deal
Saving deal…
Deal saved
We couldn't save this deal. Try again.
```

Conflict/duplicate separate.

---

# 142. Save atomicity

Do not show success if:

- account exists but Deal missing;
- Deal created but wrong user;
- report not bound where required.

---

# 143. Save failure

Must preserve public analysis access/state.

---

# 144. Invite/respondent principles

Invitation is distinct from:

- account membership;
- collaborator;
- billing contact;
- share recipient.

---

# 145. Respondent setup form

Collect only fields required by methodology/workflow.

Do not turn into employee directory.

---

# 146. Create invitation

Use:

```text
Create invitation
```

only when requester authorized.

System creates authoritative invite.

Frontend does not invent code/status.

---

# 147. Invitation state

Use actual upstream state.

Possible concepts vary by flow:

- not created;
- pending/sent;
- completed;
- expired;
- revoked.

No fake `Opened`.

---

# 148. Invite code

Do not generalize respondent code into account auth.

Do not display secret token in general activity.

---

# 149. Copy invite link

If capability token involved:

warn appropriately.

No broad public sharing.

---

# 150. Multiple respondents

Each person/session visible separately where methodology requires.

No shared code by default.

---

# 151. Respondent confidentiality copy

No:

```text
Anonymous
100% confidential
```

without real policy/system basis.

---

# 152. Respondent exit

Do not promise saved progress unless actual draft persistence.

---

# 153. Respondent re-entry

Only if invite still valid and system supports.

Completed invite should not restart questionnaire.

---

# 154. Invite expiry

Exact date can be shown if authoritative.

No urgency countdown by default.

---

# 155. Questionnaire protection

Interaction shell must not:

- reorder canonical questions;
- skip required sequence;
- summarize question into different meaning;
- pre-answer from public evidence;
- merge Acquirer/Target instruments;
- invent progress denominator.

---

# 156. Questionnaire buttons

Within linear canonical instrument:

`Continue` may be valid if next action unambiguous.

Final submit must be explicit.

---

# 157. Questionnaire final submission

If irreversible/material:

confirmation may clarify:

- responses will be submitted;
- later edit behavior if any.

Do not imply analysis result instantly if downstream pending.

---

# 158. Completion ≠ analytical certainty

`Questionnaire completed` is workflow state.

Not report confidence.

---

# 159. Internal evidence submitted

If analysis update pending:

show both states.

No fake recalculation animation.

---

# 160. Private evidence form

Form starts from evidence need.

Not generic data-room uploader.

---

# 161. File picker ≠ evidence

Selecting file does not make it analytical evidence.

UI stages should reflect:

```text
selected
uploaded/received where real
processing/review where real
integrated where authoritative
```

---

# 162. Upload success

Do not say:

```text
Evidence verified
```

after upload.

---

# 163. Upload error

Preserve metadata/selection where safe.

Explain retry.

---

# 164. Unsupported file

Only claim supported types actually implemented.

---

# 165. Malware/security state

Do not show:

```text
Virus scanned
Safe
```

unless actual authority.

---

# 166. Private evidence access

File control visibility follows permissions.

Frontend hiding not security.

---

# 167. Sharing interaction principle

Four distinct actions:

```text
Download
Email delivery
Secure recipient access
Deal membership
```

Do not collapse into `Share`.

---

# 168. Sharing menu

If multiple authorized methods:

group clearly.

Do not show method unavailable by architecture.

---

# 169. Download

Local artifact action.

User should understand file may leave MergeVue control.

---

# 170. Email delivery

Not Deal membership.

Do not imply recipient gains workspace.

---

# 171. Secure recipient access

Recipient-specific artifact access.

Not ongoing Deal access.

---

# 172. Deal membership

Managed under `34`.

Not required for every external recipient.

---

# 173. Share form

For sensitive artifact, fields may include authorized:

- artifact/version;
- recipient;
- purpose;
- access mode;
- download permission if supported.

Do not invent expiry default.

---

# 174. Share preview

If provided:

must match exact disclosure projection.

No preview of richer internal artifact.

---

# 175. Share confirmation

Before sensitive share:

show exact:

```text
artifact
version
recipient
purpose
download behavior where relevant
```

---

# 176. Share success

Only after actual authoritative share record/dispatch state.

---

# 177. Share failure

Does not change report release state.

---

# 178. Anyone with link

Not authorized by default for sensitive Deal artifacts.

Do not render generic toggle.

---

# 179. Download permission

Distinct from view.

No UI implication that view-only is impossible to copy.

---

# 180. Revoke share

Confirmation should state:

> revocation prevents future access through MergeVue; already downloaded files cannot be recalled.

Where material.

---

# 181. Resend

Resend does not create new analytical version.

---

# 182. Recipient identity

External recipient does not become collaborator/account member automatically.

---

# 183. Permission notice

When action denied:

client-safe:

```text
You don't have permission to share this report.
```

or bounded reason.

Do not expose internal RBAC codes.

---

# 184. Permission denied vs unavailable

Distinct:

```text
You do not have permission
```

vs:

```text
This action is not available in the current report state
```

---

# 185. Permission unknown

Fail closed.

Do not render action enabled while checking sensitive permission.

---

# 186. Loading permission

Can show neutral loading state.

Avoid flicker that briefly exposes restricted controls/content.

---

# 187. Role control

Role selection only from upstream-defined roles.

No designer-invented role.

---

# 188. Role change

High-impact; confirm if needed.

Server authority.

Audit upstream.

---

# 189. Remove member

Destructive confirmation.

Member removal does not delete contributed evidence.

Do not imply deletion.

---

# 190. Last administrator

UI must respect upstream invariant preventing invalid Deal governance state.

No client-side bypass.

---

# 191. Respondent ≠ member

Member list excludes respondents unless separate product requirement.

---

# 192. Billing contact ≠ member

Do not mix.

---

# 193. Analyst ≠ client member

Internal access separated.

---

# 194. Mobile member management

Show:

- identity;
- role;
- status;
- accessible action menu.

No dense permission matrix.

---

# 195. Permission grids

Only if scale/complexity warrants.

Do not create enterprise IAM UI prematurely.

---

# 196. Blocking feedback principle

A block is an authoritative condition preventing an action/output.

UI explains:

- what is blocked;
- why at client-safe level;
- what can resolve it if known.

---

# 197. Block categories

Examples:

```text
quality gate
review required
missing evidence
permission
identity/auth
commercial scope
rights
technical dependency
```

Do not collapse into generic `Blocked`.

---

# 198. Quality block

Example:

```text
Report blocked pending review
```

if upstream state says so.

No bypass button.

---

# 199. Paid output blocked

Absolute where governing state says.

No:

```text
Publish anyway
Continue anyway
Override
```

in ordinary client/analyst UI.

---

# 200. Conditional output

Conditional ≠ released.

Interaction should route to required review/resolution.

---

# 201. Cannot determine

Not block by itself unless upstream says.

Can be lawful released conclusion.

---

# 202. Unknown

Unknown may require more data.

Do not automatically upsell.

---

# 203. Contradiction feedback

`42` defines analytical contradiction representation.

`43` defines interaction around it:

- expand details;
- add evidence;
- request review;
- navigate to relevant source;

only when authorized.

---

# 204. Contradiction ≠ error

Do not style as system failure.

---

# 205. Contradiction action

Do not present:

```text
Resolve contradiction
```

unless user actually has governed resolution authority.

Better:

```text
Review conflicting evidence
Add evidence
```

depending role.

---

# 206. Unknown/uncertainty interaction

Provide lawful next step when known.

No pressure to select a forced answer.

---

# 207. Form option “Cannot determine”

When canonical instrument includes it:

preserve exact option.

Do not visually de-emphasize.

---

# 208. Error vs limitation wording

Technical:

```text
We couldn't load this evidence.
```

Analytical:

```text
The available evidence is limited.
```

Never swap.

---

# 209. Error summary

Long form with multiple errors:

- summary at top;
- links/focus to fields;
- individual errors near fields.

---

# 210. Focus on error

After submit failure:

focus summary or first invalid field based form complexity/accessibility.

---

# 211. Focus on dialog open

Move focus into dialog.

On close, return to triggering control if still present.

---

# 212. Escape

Dismiss non-destructive modal if safe.

Do not allow Escape to silently submit/cancel irreversible backend process.

---

# 213. Focus trap

Modal dialog should trap focus while open.

---

# 214. Native semantics

Use native HTML controls where practical.

Do not recreate checkbox/select/button unnecessarily.

---

# 215. Keyboard

All interactive functionality keyboard accessible.

No hover-only action.

---

# 216. Focus visibility

Never remove focus outline without accessible replacement.

---

# 217. Screen-reader feedback

Async success/error may use appropriate live region.

Avoid repeated noisy announcements.

---

# 218. Accessible name

Icon/button/input all have meaningful accessible name.

---

# 219. Accessible description

Use for:

- consequences;
- constraints;
- format;
- sensitive context.

---

# 220. Error color

Red can support.

Text/icon/semantics required.

---

# 221. Warning color

Yellow/orange not sole meaning.

---

# 222. Success color

Green does not mean analytical positive outcome.

Use success only for interaction completion.

---

# 223. Status color collision

Do not reuse same green to imply:

- action saved;
- Deal low risk;
- forecast confirmed;
- evidence verified;

as if same semantic.

---

# 224. Responsive form

Mobile:

- one primary column;
- sufficient tap targets;
- labels visible;
- errors adjacent;
- no horizontal form scroll.

---

# 225. Responsive action group

Primary action prominent.

Secondary actions may stack.

Destructive action separated.

---

# 226. Sticky action bar

Allowed if helpful.

Must not obscure:

- errors;
- footer;
- content;
- keyboard focus.

---

# 227. Mobile dialogs

Use viewport-safe dialog/sheet.

Focus and screen-reader semantics unchanged.

---

# 228. Desktop density

Professional, restrained.

No consumer app gamification.

---

# 229. Print

Interactive controls generally omitted.

System state/limitations required for report meaning remain via `42`.

---

# 230. Content tone

Operational, factual, calm.

No dramatic urgency.

---

# 231. Sentence case

Client UI uses sentence case.

---

# 232. Headings

Meaningful:

```text
What we still need
Who can access this deal
Share this report
Private evidence
```

Not generic:

```text
Settings
Options
Manage
```

when context can be clearer.

---

# 233. Descriptive buttons

Prefer exact outcome labels.

---

# 234. No jargon

Client view avoids:

- RBAC;
- enum code;
- CORR;
- internal gate code;
- provider status code.

---

# 235. Internal/admin surface

May show technical identifiers where operationally required.

Still not secret material.

---

# 236. Tooltip rule

Tooltip not sole place for:

- error;
- permission reason;
- destructive consequence;
- paid exclusion;
- analytical limitation.

---

# 237. Copy-to-clipboard

Provide explicit feedback:

```text
Link copied
```

No automatic share event.

---

# 238. Clipboard sensitivity

Do not copy secret/access token unless workflow explicitly allows.

---

# 239. Search/combobox

For entity/member selection:

- keyboard accessible;
- loading state;
- no result state;
- exact selected identity.

---

# 240. Search privacy

Do not allow unauthorized enumeration of:

- users;
- Deal members;
- recipients;
- companies in private Deal history.

---

# 241. No-result search

Explain:

```text
No matching company found.
```

not generic error.

---

# 242. Select

Use when options fixed and not too numerous.

Options come from authoritative vocabulary.

---

# 243. Radio group

Use for mutually exclusive meaningful choices.

No preselection where it could silently grant permission/consent.

---

# 244. Checkbox

Use for independent binary choices.

Do not use checkbox for mutually exclusive scopes.

---

# 245. Consent checkbox

Separate from core action where optional purpose.

No bundling marketing.

---

# 246. Permission checkbox

Checkbox cannot grant rights user lacks authority to grant.

---

# 247. Terms acknowledgement

Do not invent NDA/legal effect through checkbox.

Legal copy/authority separate.

---

# 248. File selection

Show selected filename only if safe/relevant.

Do not expose full local path.

---

# 249. Drag and drop

Optional enhancement.

Keyboard/button equivalent required.

---

# 250. Multi-file upload

Do not enable just because browser supports it.

Follow evidence/workflow authority.

---

# 251. File count

No plan/price scope derived purely from file count.

---

# 252. Form autosave

Only claim autosave if backend/draft actually supports.

---

# 253. Save draft

Separate action/state from final submit where workflow supports.

---

# 254. Draft badge

Do not use if no persisted draft.

---

# 255. Session draft

Browser-only temporary state not called saved Deal.

---

# 256. localStorage

May support UX only.

Never authority for:

- auth;
- permission;
- Deal;
- report release;
- evidence;
- paid state.

---

# 257. Navigation guard

Use only for real unsaved loss.

---

# 258. Browser back

Should preserve reasonable flow where safe.

Do not treat Back as destructive reset.

---

# 259. Deep links

Protected deep links enforce auth/permission server-side.

---

# 260. Route errors

Differentiate:

```text
not found
not authorized
expired link
revoked invitation
```

without leaking restricted object.

---

# 261. Invite expired

Explain next lawful step if available.

No automatic new invite if requester permission unknown.

---

# 262. Share expired

No artifact preview before reauthorization.

---

# 263. Session expired

Re-authenticate.

Preserve safe return intent.

---

# 264. Payment pending

If commercial system has this state:

show exact authoritative meaning.

Do not fake payment success.

---

# 265. Paid restriction representation

A restriction can explain:

- what current public/free analysis supports;
- what evidence depth required;
- what paid scope would add;
- why.

Not generic padlock theater.

---

# 266. Lock icon

Do not use padlock to imply security/entitlement ambiguously.

Text must identify:

```text
Requires paid analysis
Restricted evidence
Forecast locked
```

These are different meanings.

---

# 267. Upsell placement

Contextual after actual Decision Gap.

No popover interruption before public value.

---

# 268. Modal upsell

Avoid.

Commercial transition deserves explicit page/card context.

---

# 269. Paywall

`43` does not authorize self-serve paywall.

No blur-the-report technique.

---

# 270. Public result preservation

Already-earned public value remains readable.

---

# 271. 42Q trigger

Only show person-level action when specific-leader forecast context exists and eligibility allows.

No generic `Unlock 42Q`.

---

# 272. 42Q privacy notice

Exact legal/privacy copy comes from authorized policy.

No false anonymity/confidentiality.

---

# 273. 42Q completion

Do not reveal internal personality/type by default.

---

# 274. 42Q errors

Do not expose scoring/type internals.

---

# 275. 42Q refusal/decline

Organizational flow can continue where upstream says.

Do not shame/pressure participant.

---

# 276. Notification preferences

Do not create preference center until actual categories/channels exist.

---

# 277. Channel toggles

No SMS/push toggle if channel absent.

---

# 278. Frequency controls

No daily/weekly frequency without scheduler.

---

# 279. Continuous alerts

No toggle:

```text
Monitor continuously
```

without actual monitoring infrastructure.

---

# 280. System feedback persistence

Persistent state for persistent issue.

Ephemeral toast for ephemeral confirmation.

---

# 281. Banner dismissal

If issue still materially affects action, dismissing banner must not erase underlying state.

---

# 282. Warning acknowledgement

Acknowledgement is not override unless upstream authority says.

---

# 283. Blocking dialog

Do not use modal repeatedly for permanent blocked state.

Prefer inline explanation with lawful next path.

---

# 284. Permission request

If product supports request-access flow later, that requires upstream workflow.

Do not add generic `Request access` unless real.

---

# 285. Support contact

Do not make `Contact support` universal fallback if no support process.

---

# 286. Contact sales

Do not use as universal error fallback.

Commercial request must be context-appropriate.

---

# 287. Generic fallback

If no recovery action known:

state limitation honestly.

---

# 288. Error IDs

May show bounded support reference if infrastructure supports.

Do not expose stack trace.

---

# 289. Security-sensitive error

Minimize details that enable enumeration/attack.

---

# 290. Rate-limit feedback

Only if real.

Do not invent exact wait seconds unless authoritative.

---

# 291. Offline

If app detects network offline reliably:

state connection problem.

Do not imply server rejected action.

---

# 292. Reconnection

Do not auto-resubmit destructive action unless idempotency guarantees.

---

# 293. Concurrent edit

If version conflict:

show conflict/reload resolution.

Do not silently overwrite released/locked artifacts.

---

# 294. Stale report action

Action tied to specific report version must remain version-aware.

---

# 295. Stale share

New report version does not silently mutate existing shared artifact.

---

# 296. Notification after state change

Notification must derive after authoritative event.

No preemptive success email.

---

# 297. Analytics event after action

Product analytics can record interaction.

It does not become audit authority.

---

# 298. Audit ≠ analytics

Permission/auth/share/audit records remain governed separately.

---

# 299. Data minimization in analytics

Do not send:

- raw private evidence;
- raw respondent answers;
- 42Q;
- invite secrets;
- unnecessary Deal identity.

---

# 300. Interaction event naming

Internal event names can be technical.

Client copy remains human.

---

# 301. Component API rule

Reusable components accept semantic state from authoritative projection.

They do not infer domain state from label text.

---

# 302. No boolean collapse

Avoid generic:

```text
isPremium
isGood
isDone
isAllowed
```

when multi-axis state exists.

---

# 303. Action descriptor

Prefer explicit API conceptually:

```text
actionId
label
enabled
hidden
reason
requiresConfirmation
permissionState
requestState
```

Exact engineering schema later.

---

# 304. Feedback descriptor

Conceptually:

```text
feedbackType
title
message
persistence
action?
sourceState
```

No feedback-generated truth.

---

# 305. Dialog descriptor

Conceptually:

```text
object
consequence
confirmLabel
cancelLabel
riskLevel
```

Risk level cannot invent domain severity.

---

# 306. Form descriptor

Conceptually:

```text
fieldId
label
type
required
optionsFromAuthority
help
validation
sensitivity
```

Exact code not prescribed.

---

# 307. State mapping registry

Implementation must maintain explicit mapping:

```text
domain state
→ client label
→ UI pattern
→ allowed actions
→ source authority
```

No ad hoc page-local synonym.

---

# 308. Notification mapping registry

Explicit:

```text
authoritative event
→ in-product state
→ optional communication representation
```

No toast/email directly from frontend guess.

---

# 309. Permission mapping registry

Explicit:

```text
permission result
→ control visibility
→ enabled/disabled
→ client explanation
```

Server remains enforcement.

---

# 310. Paid restriction mapping registry

Explicit:

```text
Decision Gap
→ evidence need
→ scope authority
→ commercial action
```

No `feature locked` generic path.

---

# 311. Error mapping registry

Explicit:

```text
technical error
domain block
permission denial
validation failure
unknown state
```

must not converge to same generic banner.

---

# 312. Accessibility target

WCAG 2.2 AA target remains.

---

# 313. Accessible form checklist

Every form:

- visible labels;
- programmatic labels;
- required indication;
- error association;
- keyboard order;
- logical heading;
- focus handling;
- no color-only error.

---

# 314. Accessible dialog checklist

- role/name;
- focus enters;
- focus trapped;
- Escape where safe;
- focus returns;
- confirm/cancel order coherent;
- destructive consequence announced.

---

# 315. Accessible status checklist

- text meaning;
- live region only where appropriate;
- no endless announcement loop;
- state change understandable.

---

# 316. Accessible loading checklist

- visible label;
- `aria-busy`/equivalent where appropriate;
- no focus loss;
- avoid spinner-only.

---

# 317. Touch target

Controls sufficiently large for mobile/touch.

---

# 318. Zoom

At 200%/400% reasonable reflow.

No essential horizontal scrolling except genuinely tabular content governed by `42`.

---

# 319. Motion

Avoid unnecessary animation.

Respect reduced-motion where used.

No countdown/attention animation for commercial pressure.

---

# 320. Keyboard order

Matches visual/logical order.

---

# 321. Shortcut keys

Not required.

If added, avoid browser/assistive conflicts.

---

# 322. Print

Interactive controls omitted from analytical print/PDF.

Do not print disabled buttons/toolbars.

---

# 323. Localization boundary

American English client UI v1.

Do not mix Russian internal labels into production client interface.

---

# 324. Date/time feedback

Unambiguous.

Use local-friendly display with authoritative timestamp retained upstream.

---

# 325. Money feedback

Show currency explicitly.

Commercial price exact from authority.

---

# 326. Number formatting

Do not create false precision.

---

# 327. Sensitive values

Mask only where actual security need.

Do not mask ordinary analytical values theatrically.

---

# 328. Password/secret fields

Only if actual auth flow uses them.

No fake password field.

---

# 329. Copy secret

Avoid by default.

---

# 330. Browser autofill

Use correct autocomplete attributes according to actual identity/contact field.

---

# 331. Email field

Purpose-specific.

Email capture ≠ account.

---

# 332. Phone field

Do not add by default.

---

# 333. Organization field

Defer until workflow need.

---

# 334. Search history

Do not expose analyzed Deal history publicly.

---

# 335. Recent Deal selector

Only authenticated/authorized future capability.

Not implied here.

---

# 336. Empty workspace state

Should orient user to real next action.

Not generic marketing.

---

# 337. Empty notification state

If no center exists, no empty center.

If future center exists:

```text
No notifications requiring attention
```

only from real event model.

---

# 338. Empty member state

If only owner/admin:

represent actual access.

No invite CTA if user lacks permission.

---

# 339. Empty evidence state

Use `42` semantics.

Action to add/request evidence only if lawful.

---

# 340. Empty report state

No fake report template.

Show actual prerequisite/status.

---

# 341. Error page

Keep navigation/recovery.

Do not lose Deal context unnecessarily.

---

# 342. 404 vs denied

Do not leak object existence if sensitive.

Security may intentionally converge externally.

Client copy follows auth/security authority.

---

# 343. Session warning

Only if actual session timeout known.

Do not invent countdown.

---

# 344. Maintenance

Only if operations capability communicates real maintenance.

---

# 345. Browser unsaved warning

Only if browser can truly detect unsaved work.

---

# 346. Interaction visual tone

Quiet, professional, operational.

No social/gamified design.

---

# 347. Avatar usage

Optional cosmetic.

Avatar/initials not identity authority.

---

# 348. Status chips

Use restrained.

Text first.

No badge proliferation.

---

# 349. Warning icon

Support text.

Not standalone meaning.

---

# 350. Destructive iconography

Trash icon alone insufficient.

---

# 351. Lock icon collision registry

Must distinguish:

- protected/private;
- forecast locked;
- paid restriction;
- access denied.

Prefer text over same lock icon for all.

---

# 352. Action menu

Overflow menu for secondary actions.

Do not bury primary user need.

---

# 353. Dangerous overflow

Destructive action separated visually within menu.

---

# 354. Bulk actions

Not v1 unless upstream authorizes.

No bulk invite/import/role change by default.

---

# 355. Undo

Use only if actual operation reversible.

Do not fake undo after irreversible external email/download.

---

# 356. Revocation

Revocation semantics exact.

No false promise to recall external downloaded file.

---

# 357. Export interaction

Export only from released/authorized artifact.

No raw database dump.

---

# 358. Download all

No generic `Download all evidence` by default.

---

# 359. CSV/JSON raw export

Not default client capability.

---

# 360. Print action

Print/PDF derives from canonical artifact.

---

# 361. Copy report text

If enabled later, must respect disclosure rights.

Not authorized here.

---

# 362. Sharing purpose field

Where rights depend on purpose, collect explicit purpose from authorized vocabulary/process.

Do not bury.

---

# 363. Recipient change

New recipient means new share assessment/record.

UI should not silently edit recipient on active share.

---

# 364. Purpose change

Requires reassessment where upstream says.

---

# 365. Share edit vs new share

Prefer new record when identity/purpose changes, according to `35`.

---

# 366. Notification recipient

Resolve authoritative recipient.

Do not let generic free-text recipient bypass permission where sensitive.

---

# 367. Email typo

Allow correction before send.

After send, correction is new dispatch/share as appropriate.

---

# 368. Delivery failure

Show failed/bounced if actually known.

Underlying report/share state stays separate.

---

# 369. Resend failure

Does not revoke prior successful delivery.

---

# 370. Notification preference future

Not in v1 unless actual service.

---

# 371. Commercial status separation

Requested scope ≠ engaged ≠ paid ≠ active analysis.

Do not compress.

---

# 372. Approval in progress

If corporate approval state exists, represent separately from payment.

---

# 373. Payment pending

Separate from analysis active.

---

# 374. Paid analysis active

Only authoritative commercial/workflow state.

---

# 375. Entitlement

Entitlement does not change analytical confidence.

---

# 376. Permission

Permission does not change analytical output.

It changes what user may see/do.

---

# 377. State composability

Protected page can simultaneously be:

- authenticated;
- Deal access granted;
- paid entitlement active;
- private evidence restricted;
- report under review.

UI must handle composition.

---

# 378. No one `status` field in component API

Do not flatten multi-axis state.

---

# 379. System feedback precedence

When multiple issues:

1. security/auth block;
2. permission;
3. domain/release block;
4. validation;
5. recoverable technical error;
6. informational.

Exact priority contextual.

Do not hide important block behind toast.

---

# 380. One-message discipline

Avoid showing:

- banner;
- inline error;
- toast;

all repeating identical issue unless each serves separate purpose.

---

# 381. Message persistence

Persistent issue → persistent representation.

Transient completion → ephemeral allowed.

---

# 382. User dismissibility

Do not allow dismissing mandatory block into invisible state without remaining indicator.

---

# 383. System-generated help

Help text must be bounded.

No LLM-generated instruction that changes policy.

---

# 384. Support escalation

Only show if real path exists.

---

# 385. Human review

Do not promise universal analyst.

Show review state only when applicable.

---

# 386. Analyst controls

Internal controls never rendered to ordinary client.

---

# 387. Override controls

No ordinary UI override for hard prohibition.

---

# 388. Admin override

Any exceptional override belongs upstream governance/security.

Not invented here.

---

# 389. Implementation mapping table

Before code:

| Interaction component | Trigger | Authoritative action/state | Enabled rule | Failure states | Permission source | Upstream contract |
|---|---|---|---|---|---|---|
| Primary button | | | | | | |
| Form | | | | | | |
| Dialog | | | | | | |
| Blocking notice | | | | | | |
| Paid restriction | | | | | | |
| Notification feedback | | | | | | |
| Auth prompt | | | | | | |
| Invite control | | | | | | |
| Share control | | | | | | |
| Error state | | | | | | |

No row filled from designer invention.

---

# 390. Required implementation contract per interactive component

Each reusable component spec must record conceptually:

```text
purpose
semanticSource
actionSource
allowedSurfaces
allowedRoles
enabledWhen
hiddenWhen
disabledReason
loadingState
successState
recoverableErrors
blockingErrors
permissionErrors
confirmationRule
focusRule
keyboardRule
mobileRule
prohibitedInference
```

---

# 391. Semantic registry non-regression

Tests prove same upstream state maps to same label/meaning across pages.

---

# 392. Action authorization test

Enabled frontend control with unauthorized server user must still fail.

---

# 393. Hidden control leakage test

Restricted action not discoverable through client-only UI bypass.

---

# 394. Fake success test

Frontend cannot show success before authoritative response for high-impact action.

---

# 395. Duplicate submit test

Repeated activation does not create duplicate Deal/invite/share where idempotency required.

---

# 396. Form retention test

Recoverable error preserves user work.

---

# 397. Error distinction test

Technical error never maps to `Cannot determine`.

---

# 398. Block distinction test

Quality block never maps to permission denial.

---

# 399. Permission distinction test

Permission denial never maps to paid upsell automatically.

---

# 400. Paid restriction test

Public value remains accessible.

No fake checkout.

No fake discount.

No dark pattern.

---

# 401. Notification test

Notification does not create underlying state.

No fake delivery/read.

---

# 402. Auth test

Login does not create Deal permission.

---

# 403. Session test

Expired/revoked session loses protected access safely.

---

# 404. Invite test

Wrong/revoked/expired invite cannot proceed.

---

# 405. Share test

Recipient/purpose/version fixed.

Unauthorized share blocked.

---

# 406. Destructive action test

Confirmation + permission required.

---

# 407. Accessibility regression test

- keyboard;
- focus;
- labels;
- errors;
- live regions;
- dialogs;
- mobile;
- no color-only meaning.

---

# 408. Mobile regression test

All primary workflows usable at narrow viewport.

No desktop-only hover.

---

# 409. Content regression test

American English / sentence case / action-oriented buttons.

No local synonyms for governed statuses.

---

# 410. Privacy regression test

No sensitive Deal/respondent/person content leaked in:

- error;
- notification;
- analytics;
- URL;
- share preview;
- unauthorized state.

---

# 411. Commercial regression test

No legacy `$90K–$200K`, no `213%`, no fear/urgency anchors in target flow.

Commercial labels derive from current `33`.

---

# 412. Questionnaire regression test

Canonical questions/order/options untouched.

---

# 413. 42Q regression test

No raw answers/type/personality leaked.

---

# 414. Evidence regression test

Upload success not mislabeled Verified.

---

# 415. Report regression test

Interaction cannot bypass report release authority.

---

# 416. Forecast regression test

Interaction cannot change locked claim.

---

# 417. Verification regression test

No interaction invents verification result.

---

# 418. State registry test

No universal Deal completion percentage introduced.

---

# 419. Interaction anti-pattern — disabled as security

Forbidden.

---

# 420. Interaction anti-pattern — modal wall

Do not use modals for every step.

---

# 421. Interaction anti-pattern — toast as state

Forbidden.

---

# 422. Interaction anti-pattern — success on click

Forbidden for authoritative operations.

---

# 423. Interaction anti-pattern — fake feature lock

Do not lock every advanced-looking item with paid icon.

---

# 424. Interaction anti-pattern — dark pattern CTA

No paid CTA oversized solely for conversion.

---

# 425. Interaction anti-pattern — forced signup

No account before earned public result.

---

# 426. Interaction anti-pattern — fake SSO

Forbidden.

---

# 427. Interaction anti-pattern — fake scheduler

Forbidden.

---

# 428. Interaction anti-pattern — notification theater

No bell with fabricated activity.

---

# 429. Interaction anti-pattern — AI resolved

No generic:

```text
AI resolved
AI verified
AI approved
```

without exact authority.

---

# 430. Interaction anti-pattern — one generic error

Do not map all failures to:

```text
Something went wrong.
```

when actionable distinction exists.

---

# 431. Interaction anti-pattern — status synonym drift

No page-local:

```text
Ready
Complete
Done
Approved
Final
```

for distinct governed states.

---

# 432. Interaction anti-pattern — progress theater

No fake percentages.

---

# 433. Interaction anti-pattern — permission upsell

Access denied is not automatically opportunity to sell plan.

---

# 434. Interaction anti-pattern — consent coercion

Core action not blocked by unrelated optional marketing consent.

---

# 435. Interaction anti-pattern — destructive default

No preselected delete/revoke action.

---

# 436. Interaction anti-pattern — irreversible email undo

Do not show Undo after external attachment send unless technically meaningful.

---

# 437. Interaction anti-pattern — misleading view-only

Do not promise recipient cannot copy content.

---

# 438. Interaction anti-pattern — secret URL security

Do not equate link possession with authorization for sensitive content.

---

# 439. Interaction anti-pattern — raw provider error

No stack/provider internals to client.

---

# 440. Interaction anti-pattern — security marketing

No badges/labels implying certification/encryption from generic lock component.

---

# 441. Interaction anti-pattern — overcollection

Do not ask for data because backend schema has field.

---

# 442. Design freedom

Designer may choose:

- exact button geometry;
- field spacing;
- form layout;
- dialog width;
- banner geometry;
- toast placement;
- responsive stacking;
- disclosure animation;
- icon set within canon;
- density;
- action-group layout.

---

# 443. Design prohibition

Designer may not choose:

- new workflow;
- new state;
- new role;
- new permission;
- new price;
- new entitlement;
- new consent scope;
- new notification event;
- new questionnaire behavior;
- new share right;
- new auth mechanism;
- new destructive semantics.

---

# 444. Frontend freedom

Frontend may manage:

- focus;
- open/closed;
- client-side format validation;
- transient loading;
- local filter/search over authorized data;
- animation;
- draft input before submit.

---

# 445. Frontend prohibition

Frontend may not authoritatively decide:

- auth;
- access;
- Deal persistence;
- evidence status;
- report release;
- paid state;
- share authorization;
- forecast lock/seal;
- verification;
- notification delivery truth.

---

# 446. Backend projection obligations

Where relevant, backend supplies:

- action eligibility;
- state;
- permission-safe reason;
- object/version;
- allowed options;
- success/failure result.

Frontend should not infer from labels.

---

# 447. Content authority

Client copy that has legal/privacy/security/commercial consequence must come from relevant approved authority.

---

# 448. Visual canon

All components inherit `09`.

No parallel design system.

---

# 449. Analytical congruence

Where interaction appears around analytical component, `42` semantics remain controlling.

---

# 450. Final first-version component inventory

Minimum reusable implementation set:

```text
Button
Button group
Link
Text input
Entity combobox
Text area
Select
Radio group
Checkbox
Field help
Field error
Form error summary
Disclosure
Tabs/navigation primitive
Inline status
Banner
Success message
Error message
Blocking message
Permission message
Paid scope/restriction card
Confirmation dialog
Destructive dialog
Auth/re-auth prompt
Invite status/action
Share/export action
Loading/skeleton
Retry
Empty/unavailable interaction state
```

This is a reusable UI inventory, not a new domain ontology.

---

# 451. Planned-object closure map

## C-02 — Набор компонентов

Closed by:

- Sections 6–21;
- family inventory;
- common anatomy;
- interaction primitives;
- implementation registry.

## C-08 — Формы

Closed by:

- Sections 22–62;
- validation;
- loading;
- errors;
- field semantics;
- progressive data collection;
- form accessibility.

## C-09 — Уведомления

Representation obligations closed by:

- Sections 90–109;
- in-product state first;
- notification center boundaries;
- dispatch-state honesty;
- transactional/marketing separation.

Underlying event/recipient/channel semantics remain controlled by `36`.

## C-10 — Блокировки

Representation obligations closed by:

- Sections 196–202;
- client-safe block explanation;
- no bypass;
- separation from technical errors/permissions.

Underlying gate semantics remain upstream.

## C-11 — Платные ограничения

Representation obligations closed by:

- Sections 110–127 and 264–270;
- Decision Gap-first commercial transition;
- no fake paywall/checkout;
- no dark patterns;
- public value preservation.

Pricing/scope semantics remain `33`.

## C-12 — Ошибки

Representation obligations closed by:

- Sections 33–61, 208–220, 287–293;
- error taxonomy;
- recovery;
- focus/accessibility;
- no semantic collapse.

## C-13 — Неопределённость

Representation/interactions closed by:

- Sections 201–207;
- no forced answer;
- no automatic upsell;
- lawful next-step handling.

Analytical uncertainty semantics remain `10`/`42`.

## C-14 — Противоречия

Interaction obligations closed by:

- Sections 203–205;
- review/add-evidence actions;
- no “Resolve” control without authority;
- contradiction ≠ error.

Analytical contradiction semantics remain `22`/`25`/`42`.

---

# 452. C-03 accounting

`C-03 Состояния и смысловые маркеры` does not require a new standalone design file because:

- semantic/global states are controlled by `10`;
- analytical state rendering is controlled by `42`;
- interaction/system-feedback mapping is controlled by `43`.

`43` does not claim to replace `10`.

This is an absorbed responsibility, not a missing artifact.

---

# 453. Explicit non-closure

`43` does not close:

- implementation handoff;
- route-by-route traceability;
- complete acceptance-test matrix for the full corpus;
- final 67-object reconciliation;
- implementation sequencing across all surfaces;
- final design QA certification.

Those belong to `44`.

---

# 454. Anti-proliferation effect

После Owner acceptance не создавать отдельные numbered design files для:

- Buttons;
- Forms;
- Dialogs;
- Toasts;
- Banners;
- Error states;
- Notification UI;
- Permission notices;
- Paid locks;
- Blocking states;
- Auth prompt UI;
- Invite controls;
- Share controls;

если requirement является variant настоящего contract.

Standalone numbered artifact requires Owner Change Act.

---

# 455. Relationship to `44`

`44` должен проверить:

1. route/page → component traceability;
2. each action → authority;
3. each form → data/validation authority;
4. each status → state authority;
5. each paid CTA → commercial authority;
6. each notification → event authority;
7. each protected action → auth/permission enforcement;
8. each analytical component → `42`;
9. accessibility;
10. responsive behavior;
11. no fake capabilities;
12. regression tests;
13. all planned objects accounted;
14. no unauthorized file `45+`.

---

# 456. Owner acceptance and controlling status

Owner explicitly ACCEPTED this contract on:

```text
2026-09-16
```

From that point:

```text
43_MERGEVUE_INTERACTION_FORMS_AND_SYSTEM_FEEDBACK_COMPONENT_CONTRACT.md
=
OWNER-ACCEPTED
CONTROLLING INTERACTION, FORMS AND SYSTEM FEEDBACK COMPONENT CONTRACT

C-02 = CLOSED
C-08 = CLOSED
C-09 = CLOSED AT UI-REPRESENTATION LEVEL
C-10 = CLOSED AT UI-REPRESENTATION LEVEL
C-11 = CLOSED AT UI-REPRESENTATION LEVEL
C-12 = CLOSED AT UI-REPRESENTATION LEVEL
C-13 = CLOSED AT UI-REPRESENTATION LEVEL
C-14 = CLOSED AT UI-REPRESENTATION LEVEL

C-03 = SUBSTANTIVELY GOVERNED BY 10
C-03 REPRESENTATION = 42 + 43
NO NEW C-03 SEMANTIC AUTHORITY CREATED
```

This acceptance establishes the reusable interaction/presentation authority for:

- buttons and action hierarchy;
- forms and validation;
- disclosures, tabs and step/progress representation;
- loading/submission/retry patterns;
- success/error/system feedback;
- blocking and permission notices;
- paid restriction/commercial-transition representation;
- notification representation;
- confirmation/destructive dialogs;
- auth/re-auth prompts;
- invite/respondent controls;
- sharing/export controls;
- accessibility, focus, keyboard and responsive interaction behavior.

This acceptance does **not** create or modify:

- business/domain states;
- Deal lifecycle semantics;
- analytical states;
- confidence semantics;
- evidence semantics;
- contradiction semantics;
- notification event eligibility;
- permissions;
- authorization;
- entitlement;
- pricing;
- payment infrastructure;
- questionnaires or 42Q semantics;
- authentication technology;
- sharing rights;
- data rights;
- forecast/verification semantics;
- release authority.

All underlying semantics remain governed by their respective upstream controlling contracts.

Under:

`MERGEVUE_REMAINING_CORPUS_MANIFEST_v1.0`

the next and only authorized numbered design act is:

```text
44_MERGEVUE_DEVELOPMENT_HANDOFF_AND_DESIGN_QA_CONTRACT.md
```

No numbered design artifact may be inserted between `43` and `44` without a separate Owner Change Act.

Final state:

```text
STATUS = OWNER-ACCEPTED / CONTROLLING
C-02 = CLOSED
C-08 = CLOSED
C-09 = CLOSED AT UI-REPRESENTATION LEVEL
C-10 = CLOSED AT UI-REPRESENTATION LEVEL
C-11 = CLOSED AT UI-REPRESENTATION LEVEL
C-12 = CLOSED AT UI-REPRESENTATION LEVEL
C-13 = CLOSED AT UI-REPRESENTATION LEVEL
C-14 = CLOSED AT UI-REPRESENTATION LEVEL
C-03 = GOVERNED BY 10 / REPRESENTED BY 42+43
AMBIGUITY = 0
NEXT NUMBERED ACT = 44
```

---

# 457. Финальная формула

> **A MergeVue control is an interface to an authorized action, not an authority of its own.**

> **A button does not grant permission. A disabled button does not enforce security. A toast does not create state. A form does not redefine the data model. A paid badge does not justify payment. A notification does not make an event true. A dialog does not create policy.**

> **The interface must preserve the distinctions already established by the product: authentication versus authorization, workflow versus analytical confidence, error versus uncertainty, contradiction versus failure, public value versus paid depth, recipient access versus membership, and interaction completion versus analytical truth.**

> **When the system does not know, cannot act, lacks authority, lacks permission, or has failed technically, the UI must say the correct one of those things — never collapse them into a convenient generic state.**
