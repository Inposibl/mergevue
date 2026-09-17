# 21. Контракт сохранения сделки, account entry и перехода в Deal Workspace MergeVue

**Статус документа:** управляющий flow-контракт / account and persistence boundary  
**Файл:** `21_MERGEVUE_ACCOUNT_SAVE_AND_DEAL_WORKSPACE_ENTRY_CONTRACT.md`  
**Версия:** 1.0  
**Дата:** 16 сентября 2026 года  
**Язык документации:** русский  
**Язык коммерческого интерфейса:** только American English  
**Рынок первой версии:** США  
**Входные surface:** public result из `19`, deeper-diligence transition из `20`  
**Главный принцип:** account появляется только тогда, когда пользователю нужна persistence, collaboration или private workflow; public analysis и public result остаются доступными без account  
**Ключевые инварианты:** `ACCOUNT ≠ ANALYSIS`, `SAVE WITHOUT DATA LOSS`, `PUBLIC VALUE BEFORE AUTH`, `NO FAKE WORKSPACE`, `EMAIL DELIVERY ≠ ACCOUNT`, `PERSIST THE SAME DEAL`, `NO PARALLEL TRUTH`

---

# 0. Назначение

Этот документ определяет первый переход от anonymous public analysis к authenticated/persisted product state.

Он отвечает на вопросы:

1. когда MergeVue имеет право попросить account;
2. что означает `Save this deal`;
3. что именно должно сохраниться;
4. как anonymous public analysis превращается в persisted Deal;
5. как не заставить пользователя повторять уже сделанную работу;
6. чем account отличается от email delivery;
7. что делать, если полноценной workspace architecture ещё нет;
8. как подготовить product shell для будущего Deal Workspace без выдумывания уже несуществующих функций.

---

# 1. Главный продуктовый принцип

Правильная логика:

```text
Public analysis
→ Public result
→ User chooses to save / continue / collaborate
→ Account required
→ Existing anonymous deal state is attached
→ Persisted Deal created
→ User continues from same point
```

Неправильная логика:

```text
Public analysis
→ Sign up
→ Re-enter deal
→ Re-run analysis
→ Create workspace
```

---

# 2. Account is persistence, not evidence

Создание account:

- не повышает evidence quality;
- не меняет ECS;
- не меняет Environment reading;
- не создаёт forecast;
- не разрешает unknown автоматически.

Account — это:

- identity;
- persistence;
- access;
- collaboration boundary;
- future permission layer.

---

# 3. Public analysis remains anonymous-capable

До `Save this deal` пользователь должен иметь возможность:

- enter deal;
- run public analysis;
- read result;
- inspect sources;
- understand Decision Gap.

Без:

- email;
- password;
- organization;
- payment.

---

# 4. Current implementation reality

В текущем `main`:

- нет dedicated account route;
- нет login route;
- нет signup route;
- нет `/deals`;
- нет `/workspace`;
- нет `/settings`;
- нет authenticated organization shell;
- есть anonymous `INITIAL_SESSION`;
- есть `screen-12-email-capture`;
- есть consultation request;
- есть report delivery record.

Следовательно:

> **этот документ определяет target architecture, но не утверждает, что она уже реализована.**

---

# 5. Existing `screen-12-email-capture` is not account creation

Current email flow:

- asks `Email`;
- asks `First name`;
- validates both;
- creates email-capture record;
- creates report-delivery record;
- sends / records PDF delivery.

Current copy concept:

`Where should we send your report?`

Это distribution action.

Не:

- login;
- signup;
- saved deal;
- workspace membership.

---

# 6. Absolute boundary — EMAIL DELIVERY ≠ ACCOUNT

Нельзя:

- считать email capture существующим account;
- автоматически создать account без user intent;
- автоматически добавить user в workspace после PDF delivery;
- назвать report delivery `Save deal`.

Если future product связывает email и account invitation:

это отдельный explicit step.

---

# 7. `Save this deal` is the canonical account trigger

Primary account-triggering CTA after public result:

`Save this deal`

Meaning:

> preserve this deal, current public report, evidence cutoff, version, and future continuation.

Это честная причина запросить identity.

---

# 8. Other valid account triggers

Account may also be requested when user chooses:

- `Add internal evidence`;
- `Invite respondents`;
- `Go deeper with private evidence`;
- `Collaborate`;
- `Track this deal`;
- `Save report history`.

Но не раньше.

---

# 9. Invalid account triggers

Не просить account только потому, что пользователь:

- opened methodology;
- opened historical case;
- entered Acquirer + Target;
- viewed public result;
- opened evidence provenance;
- clicked environment reference.

---

# 10. Save intent must be explicit

Account creation must follow user action.

Не использовать:

- auto modal after 30 seconds;
- exit-intent signup;
- forced account before closing report;
- blur.

---

# 11. Account entry flow

Conceptual target:

```text
Save this deal
→ Sign in / Create account
→ authenticate
→ attach anonymous analysis
→ create persisted Deal
→ return to saved Deal
```

---

# 12. Sign in vs Create account

User should see two clear paths:

`Sign in`

`Create account`

Do not assume every email is new.

---

# 13. Account fields — minimum

Для first-version target не запрашивать больше, чем нужно для identity.

Potential minimum:

- Email
- Authentication credential / secure identity mechanism
- First name only if product actually needs it immediately

Organization can be deferred until:

- paid engagement;
- collaboration;
- private evidence;
- workspace administration.

---

# 14. No full CRM form at signup

Do not ask by default:

- company;
- job title;
- phone;
- budget;
- deal stage;
- country;
- team size;
- procurement status.

Those may be requested later for a specific workflow.

---

# 15. Authentication mechanism is not defined here

Этот contract не выбирает:

- password;
- magic link;
- OAuth;
- passkey;
- enterprise SSO.

Engineering/security decision comes separately.

UX invariant:

> method must preserve return-to-deal state.

---

# 16. No invented SSO

Do not put:

`Continue with Google`

`Continue with Microsoft`

unless actually supported.

No fake enterprise SSO button.

---

# 17. Return-to-intent after authentication

Critical invariant:

after auth user returns to:

- same deal;
- same report version;
- same Decision Gap;
- same selected next action.

No landing on generic Home.

---

# 18. Anonymous state handoff

Conceptually account attach requires:

```text
anonymousSessionId
publicAnalysisId
dealIdentity
reportVersion
generatedAt
evidenceCutoff
selectedNextAction?
selectedDecisionGap?
```

Exact identifiers may differ.

---

# 19. Do not reconstruct saved state from UI text

Persist machine-readable state.

Не:

- parse H1;
- parse report HTML;
- infer deal from browser title.

---

# 20. Deal identity must survive

Persist at minimum:

- Acquirer canonical entity ID;
- Acquirer display name;
- Target canonical entity ID;
- Target display name;
- transaction identity if resolved;
- current deal status if relevant.

Do not revert to raw typed names only.

---

# 21. Public report baseline must survive

Persist:

- report ID;
- report version;
- generatedAt;
- evidence cutoff;
- block availability states;
- authority reference;
- public evidence provenance references.

This is the baseline for later deepening.

---

# 22. Save operation is atomic

A successful `Save this deal` should not leave:

- account created but deal lost;
- deal created but report missing;
- report saved under wrong user;
- duplicate deal entries without explanation.

From user's perspective:

> one completed action.

---

# 23. Save states

## Idle

`Save this deal`

## Authentication required

sign-in/create-account surface.

## Saving

`Saving deal...`

## Saved

`Deal saved`

## Save failed

`We couldn't save this deal. Try again.`

## Conflict / duplicate

existing deal resolution.

---

# 24. Save failure must preserve public state

If persistence fails:

- public report stays visible;
- anonymous state stays usable;
- user can retry.

Do not lose report because account creation failed.

---

# 25. Duplicate deal handling

If authenticated user already has the same Deal:

do not blindly create duplicate.

Options:

`Open existing deal`

or:

`Save as a separate analysis`

only if product supports analysis versions.

Default safest behavior:

> attach current report/version to existing deal if identity matches and user confirms.

---

# 26. Same companies can represent different deals

Duplicate detection must not use only:

`Acquirer + Target`.

Possible different:

- transaction dates;
- acquisition attempts;
- historical vs current deal;
- separate asset purchases.

Deal identity must include transaction context when known.

---

# 27. Historical case ≠ user Deal

If pair matches a published historical case:

do not merge user workspace Deal with public editorial case-study record.

These are different entities.

---

# 28. Persisted Deal definition

A Deal is the primary authenticated work object.

Conceptually:

```text
Deal
├── identity
├── public analysis baseline
├── evidence channels
├── report versions
├── collaborators
├── decisions / gaps
└── lifecycle state
```

This is target architecture.

---

# 29. Deal is not report

Report is an output/version.

Deal persists across:

- refreshes;
- evidence additions;
- report updates;
- invitations;
- paid escalation.

---

# 30. Deal is not workspace

Deal = primary business object.

Workspace = collaboration / UI container around one or more Deal-related activities.

For first version, a Deal may be its own workspace surface.

Do not invent a separate Workspace entity unless needed.

---

# 31. Current target hierarchy

Preferred first implementation:

```text
Account
→ Deals
→ Deal
```

Not automatically:

```text
Account
→ Organization
→ Workspace
→ Project
→ Deal
→ Analysis
```

Avoid unnecessary SaaS object proliferation.

---

# 32. Organization object

Organization becomes necessary when product needs:

- team membership;
- billing ownership;
- shared private evidence;
- enterprise permissions.

Until then:

> do not force organization creation at first save.

---

# 33. Workspace object gate

Create a distinct Workspace only if it solves a real problem:

- multiple deals under same project;
- cross-deal collaboration;
- multiple analysis tracks;
- enterprise team container.

Otherwise Deal itself is sufficient primary workspace.

---

# 34. Existing-product-first implication

Because current `main` has no workspace shell:

future agent must not copy the earlier conceptual dashboard screenshot as production truth.

That screenshot may inform visual grammar only after provenance / authority check.

---

# 35. No route invention without route decision

Likely future routes could be:

- `/sign-in`;
- `/sign-up`;
- `/deals`;
- `/deals/:dealId`.

But this contract **does not authorize exact route names**.

Route creation requires implementation/IA decision.

---

# 36. Current route preservation

Do not break:

- public routes;
- diagnostic routes;
- report routes;
- invite routes;
- consultation routes.

Authenticated shell can be layered later.

---

# 37. Public → authenticated route handoff

After successful save:

user should reach a Deal surface.

Potential UI label:

`Deal workspace`

But route/technical name not fixed here.

---

# 38. First saved Deal screen purpose

Immediately after save, user should see continuity.

At minimum:

- deal pair;
- public analysis status;
- saved confirmation;
- current Decision Gap;
- next evidence actions.

Not an empty dashboard.

---

# 39. No empty “Welcome to your workspace”

Do not replace valuable deal context with:

`Welcome, Nikolai`

plus onboarding cards.

User came to save a real deal.

The Deal remains center.

---

# 40. Saved Deal top area

Conceptual:

```text
Acquirer × Target
Saved
Public analysis generated [date]

Current state
Decision gap
Next evidence actions
```

---

# 41. Public report remains accessible from saved Deal

User can always reopen:

`Public analysis`

or current canonical report.

Do not bury baseline after save.

---

# 42. Report version identity

If report later changes:

saved Deal should distinguish versions.

At minimum:

- current report;
- generated date;
- evidence cutoff.

Version history may come later.

---

# 43. Do not silently overwrite original public report

When internal/private evidence deepens analysis:

retain public baseline.

This supports:

- provenance;
- confidence change explanation;
- auditability.

---

# 44. Account does not unlock hidden public blocks

After signup, public result should not suddenly populate unavailable blocks without new evidence.

Authentication alone changes access, not evidence.

---

# 45. Account may unlock persistence UI

After signup, new actions can appear:

- Save;
- Rename internal deal label;
- Track;
- Invite;
- Add internal evidence.

These are workflow capabilities.

---

# 46. Deal naming

Default display:

`Acquirer × Target`

User may later add internal label:

`Project Orion`

if needed.

But internal nickname should not replace public company identity entirely.

---

# 47. Internal deal nickname

If supported:

show:

`Project Orion`

secondary:

`Acquirer × Target`

This avoids ambiguity.

---

# 48. Anonymous user must not need a nickname

No project naming at first save.

---

# 49. Collaboration is not automatic

Saving a Deal creates personal/private persisted access.

It should not automatically:

- invite colleagues;
- share with organization;
- create public link.

---

# 50. Default privacy

Target default:

> saved Deal is private to authorized account/user until explicit sharing/collaboration action.

Exact legal/security policy requires separate authority.

---

# 51. No public indexing

Saved Deals and user-entered company pairs must not become:

- public pages;
- recent analyses;
- SEO;
- social proof;
- activity feed.

---

# 52. Sharing is separate

`Share`

requires separate contract for:

- access control;
- expiring links;
- viewer permissions;
- revocation;
- private evidence visibility.

Do not implement generic copy-link here.

---

# 53. Collaboration starts from explicit invite

Potential action:

`Invite a collaborator`

Only after account / Deal exists.

Not part of first save.

---

# 54. Respondent invite ≠ collaborator invite

Important distinction:

## Collaborator

works inside Deal workspace.

## Respondent

provides structured evidence through controlled invite.

A respondent should not automatically become workspace member.

---

# 55. Consultation contact ≠ account member

A person entered in consultation flow is not automatically:

- account;
- collaborator;
- respondent.

Keep identities separate.

---

# 56. Email-delivery recipient ≠ account user

Same critical distinction.

Email delivery record should not grant workspace access.

---

# 57. Account email and delivery email may differ

Future design should not assume:

report recipient email == account identity.

Do not silently merge without confirmation.

---

# 58. Existing email capture — preserve purpose

Keep current `screen-12-email-capture` where report emailing remains useful.

Potential user action after public result:

`Email this analysis`

This remains separate from:

`Save this deal`.

---

# 59. Email capture fields

Current:

- Email;
- First name.

Do not add password to this screen and pretend it became signup.

If future combined flow is desired:

requires explicit redesign.

---

# 60. Saved Deal status model

Minimum conceptual lifecycle:

- `Public analysis`;
- `Saved`;
- `Internal evidence in progress`;
- `Private evidence in progress`;
- `Review`;
- `Report available`;
- `Archived`.

Exact canonical statuses need separate lifecycle authority.

Do not invent detailed statuses in UI prematurely.

---

# 61. Multi-axis state principle

Deal lifecycle is not one percentage.

Do not show:

`62% complete`.

Because independent axes may include:

- evidence coverage;
- respondent completion;
- report authority;
- payment;
- private docs;
- 42Q;
- contradiction state.

---

# 62. Deal state must not imply analytical confidence

`Saved`

does not mean:

`Verified`.

`In progress`

does not mean:

`Low confidence`.

Workflow status and analytical status remain separate.

---

# 63. Deal list / Deals index

If authenticated product has more than one Deal, a Deals index becomes useful.

This contract defines minimum requirement, not exact visual.

Each row/card may show:

- deal pair;
- internal nickname if any;
- last activity;
- current workflow phase;
- report availability;
- next action.

---

# 64. What Deals index must not show by default

Do not turn list into risk leaderboard:

- red risk score;
- green good deal;
- success probability;
- compatibility ranking.

Deal list is navigation/work management.

---

# 65. Empty Deals state

For new authenticated user with no Deal:

`No saved deals yet.`

CTA:

`Analyze a deal`

Do not invent sample deals in user's workspace.

---

# 66. If account was created from Save flow

Empty state should never occur if attachment succeeded.

User should land directly on the saved Deal.

---

# 67. Authentication cancellation

If user cancels signup/sign-in:

return to public report.

Preserve anonymous state.

No punishment.

---

# 68. Authentication expiration

If auth expires later:

- preserve local non-sensitive continuity where safe;
- redirect to sign in;
- after auth return to same Deal.

---

# 69. Access denied

If user opens unauthorized Deal:

`You don't have access to this deal.`

Do not reveal:

- company pair;
- organization;
- report metadata.

---

# 70. Deal not found

Different:

`Deal not found.`

Do not conflate with access denied where that leaks existence.

Security design may choose a unified external state.

---

# 71. Account deletion / removal

Not defined in full here.

But Deal persistence architecture must support future:

- access revocation;
- account removal;
- organization offboarding.

Do not hard-code user identity into immutable report facts.

---

# 72. Evidence ownership

Public evidence belongs to report provenance.

User-provided internal/private evidence has access controls.

Saving Deal should not change source ownership semantics.

---

# 73. Evidence permissions

Future Deal workspace should distinguish:

- public evidence;
- organization evidence;
- restricted private evidence;
- respondent evidence;
- individual 42Q data.

Do not create one flat evidence bucket.

---

# 74. 42Q privacy boundary

Specific-leader individual data needs stronger access controls than ordinary public report.

Saving a Deal does not grant broad access to 42Q.

Separate permission contract required.

---

# 75. Report access boundary

Collaborators may have different permissions from report viewers.

Do not assume all Deal members see all technical/provenance fields.

---

# 76. Expert view is not customer workspace role by default

Internal expert/adjudicator access is a controlled operational role.

Do not expose:

`Expert mode`

to ordinary client account.

---

# 77. User role taxonomy must be real

Do not invent client roles:

- Admin;
- Analyst;
- Viewer;
- Owner

until permissions architecture exists.

Use minimal access model first.

---

# 78. Product “Owner” terminology conflict

Internal project governance uses `Owner`.

Avoid using `Owner` casually as client workspace role if it could confuse internal docs.

Potential client term:

`Deal administrator`

only if actually needed.

---

# 79. Organization branding

Do not add custom organization logos/colors in first workspace version without need.

Keep MergeVue product visual system.

---

# 80. Visual shell target

Authenticated Deal surface should remain visually coherent with public/report system.

Use:

- same MergeVue brand;
- light blue-gray background;
- white panels;
- thin borders;
- 8px radius;
- navy/blue hierarchy;
- Inter/system sans;
- restrained density.

---

# 81. Paid dashboard screenshot caution

Previously supplied dashboard-like mockup may be used only as a **visual reference after source/provenance verification**.

Its content is not semantic authority.

Elements like:

- compatibility score;
- 42Q copilot;
- risk bars;
- recommended actions

cannot be copied automatically.

---

# 82. Public sidebar vs authenticated shell

A Deal workspace may eventually need a richer authenticated sidebar.

But current public sidebar must not be replaced globally as a side effect.

Authenticated navigation gets its own shell decision.

---

# 83. Minimal authenticated navigation

First version should avoid overbuilding.

Potential core destinations:

- Deals;
- current Deal;
- Account.

But exact nav is not authorized here.

No automatic:

- Workspaces;
- Reports;
- Evidence;
- 42Q;
- Settings

until those surfaces have contracts.

---

# 84. No navigation from speculative screenshot

Do not adopt an earlier mockup's sidebar merely because it looks complete.

Each destination must correspond to:

- real route;
- real capability;
- approved contract.

---

# 85. Save confirmation

After successful attachment:

compact confirmation:

`Deal saved`

Supporting:

`Your public analysis is now saved to this deal.`

Do not use celebratory confetti.

---

# 86. Continue action

After save, next action should reflect prior intent.

If user clicked Save only:

`View saved deal`

If user clicked Add internal evidence:

continue to internal evidence setup.

If user clicked private evidence:

continue to paid/private onboarding after auth.

---

# 87. Preserve selected path through auth

Conceptual:

```text
returnIntent = SAVE
returnIntent = INTERNAL_EVIDENCE
returnIntent = PRIVATE_EVIDENCE
returnIntent = COLLABORATE
```

No need to expose internal enum.

---

# 88. First authenticated Deal surface — recommended hierarchy

```text
Deal identity
Workflow state
Public analysis baseline

Decision gap
Next evidence action

Evidence channels
Report versions
Collaborators // only when supported
```

No empty generic dashboard.

---

# 89. Public analysis baseline card

Should show:

- generated date;
- evidence scope;
- report status;
- open report action.

Do not duplicate full report inline unless usability requires.

---

# 90. Decision Gap continuity

The same Decision Gap from public result must carry into saved Deal.

Do not regenerate a new sales message.

---

# 91. Evidence-channel status

Potential conceptual list:

- Public evidence — complete for current version;
- Internal observations — not started;
- Private evidence — not started;
- Individual data — not required / not requested.

Only show channels relevant to product.

---

# 92. “Complete” wording caution

`Public evidence — reviewed`

may be safer than:

`complete`

because public universe is not necessarily exhaustive.

Use governed status vocabulary.

---

# 93. No account-based analytical priority

Paid/account users do not get stronger claims merely because they authenticated.

Stronger claims require stronger evidence.

---

# 94. Persisting analysis authority

When anonymous authoritative report attaches to account:

its authority should remain the same.

Do not regenerate just to create account-bound version.

---

# 95. Report ID continuity

Where possible preserve report ID / version relationship.

If persistence creates a new storage identifier:

do not imply new analytical run.

---

# 96. Idempotent attachment

Repeated callback / refresh after auth should not create duplicate Deal.

Save operation should be idempotent.

---

# 97. Cross-device access

Once saved, user should be able to sign in on another device and see Deal.

This is core reason for account persistence.

If not supported in first implementation, do not claim it.

---

# 98. Local-only save is not account save

Browser localStorage persistence is not equivalent to account-backed Deal.

Do not call local browser state:

`Saved to your account`.

---

# 99. Security baseline

Account architecture requires:

- authenticated server-side ownership;
- authorization on Deal access;
- secure session handling.

This contract does not define implementation, but UI must not pretend security exists if it does not.

---

# 100. Server authority for persisted Deal

Deal ownership/access must be server-authoritative.

Client-side hidden button is not access control.

---

# 101. Public analysis attachment must be bounded

Server should validate:

- report exists;
- report/public analysis ID is valid;
- requesting anonymous session has lawful attachment capability;
- report is not another user's private result.

Exact mechanism engineering-specific.

---

# 102. No arbitrary report-ID claiming

User must not be able to enter report ID and claim it.

Attachment token / session proof required.

---

# 103. Email ownership verification

If account uses email:

actual auth system should verify identity appropriately.

Do not assume typed email proves ownership.

---

# 104. Error language

Authentication:

`We couldn't sign you in. Try again.`

Attachment:

`Your account was created, but we couldn't save this deal yet. Your public analysis is still available.`

This distinguishes errors.

---

# 105. Recovery after partial failure

If auth succeeds but save fails:

offer:

`Try saving again`

while authenticated.

Do not force new account.

---

# 106. Sign-in existing account

If email corresponds to existing account:

use supported authentication mechanism.

Do not create duplicate user identity.

---

# 107. Email delivery and account duplication

If user previously emailed report, then later creates account:

system may suggest linking the report only if secure attachment proof exists.

Email match alone may be insufficient.

---

# 108. Marketing consent

Account creation should not automatically subscribe user to marketing.

Keep consent separate.

---

# 109. Terms / privacy acceptance

If required, use concise links and explicit acceptance according to legal product requirements.

Do not invent legal wording in design spec.

---

# 110. Age / consumer flows

This is professional M&A product.

Do not add consumer onboarding patterns unless required.

---

# 111. Billing identity

Billing is not account-signup requirement unless user is buying paid engagement.

Separate later.

---

# 112. Account name

Do not require legal name for simple Save action unless operationally needed.

First name may be enough for UI, or no name.

---

# 113. Organization domain detection

Do not automatically enroll users into organizations based solely on email domain without explicit enterprise rules.

---

# 114. Invites before account

Respondent invite may be token-based and not require full workspace account.

Do not force respondent into client account architecture unless required.

---

# 115. Collaborator invite after account

A collaborator likely needs authenticated access.

Separate from respondent flow.

---

# 116. Saved Deal permissions

First version can start simple:

- creator can access;
- no collaborators until explicit sharing feature.

This is safer than inventing role matrix.

---

# 117. Account settings

Not defined here.

Do not create full Settings page as part of Save flow.

Only essential identity actions may appear later.

---

# 118. Logout

If auth implemented, logout must exist somewhere accessible.

This contract does not prescribe exact placement.

---

# 119. Deleted / archived Deal

Later lifecycle.

Do not add destructive actions before persistence model is stable.

---

# 120. Rename Deal

Optional later feature.

Not required for first Save implementation.

---

# 121. Deals index ordering

If implemented:

default by recent activity is reasonable only if product approves.

Do not rank by risk.

---

# 122. Deals index metadata

Potential safe metadata:

- company pair;
- last updated;
- current workflow phase;
- report available;
- next action.

Avoid:

- unverified compatibility;
- risk ranking;
- probability.

---

# 123. Search / filters

Not required until users have enough Deals.

No premature enterprise dashboard controls.

---

# 124. Account empty state

If user signs up from generic sign-up route with no attached deal:

`Analyze a deal`

should be primary CTA.

But generic sign-up route itself is not authorized here.

---

# 125. Backward compatibility with current email flow

Keep:

`/screen-12-email-capture`

for report delivery.

Do not remove merely because account exists.

Some users may want email without account.

---

# 126. Report delivery record

Current flow stores:

- delivery status;
- report ID;
- file name;
- MIME type;
- generated/delivered times;
- recipient email;
- provider/message ID where present.

This is useful distribution provenance.

It should stay separate from Deal persistence metadata.

---

# 127. No fake “delivered” state

Current architecture can create delivery records.

Production UI should mark delivered only after actual delivery authority / provider success.

Do not mark on form submit if email failed.

---

# 128. Account-save analytics

Useful:

```text
save_deal_selected
auth_started
auth_completed
deal_attachment_started
deal_saved
deal_save_failed
saved_deal_opened
```

Do not send sensitive deal metadata to third-party ad analytics.

---

# 129. Funnel metric

Measure:

```text
public result
→ save intent
→ successful auth
→ successful persisted Deal
→ return/open later
```

But do not optimize by forcing signup.

---

# 130. Privacy-sensitive analytics

The exact company pair may itself reveal user interest.

Treat as sensitive business context operationally.

Do not use for advertising personalization.

---

# 131. Accessibility — auth

Target WCAG 2.2 AA.

Need:

- real labels;
- error association;
- keyboard navigation;
- visible focus;
- password-manager compatibility if passwords used;
- accessible magic-link status if used;
- return-to-deal state conveyed.

---

# 132. Accessibility — saved Deal

Need:

- semantic page hierarchy;
- workflow states with text;
- actionable links/buttons;
- no color-only stage;
- mobile reflow;
- consistent focus after save.

---

# 133. Mobile auth

Single column.

Do not hide context completely.

Show:

`Saving: Acquirer × Target`

so user knows why authentication is requested.

---

# 134. Context preservation on auth screen

Keep compact banner:

`Save Acquirer × Target`

`Your public analysis will stay available.`

This improves trust.

---

# 135. No generic “Join MergeVue” hero

Auth is task continuation, not marketing landing.

---

# 136. Visual language

Auth/save UI should use existing MergeVue design system:

- light background;
- white card;
- navy/blue;
- thin border;
- 8px radius;
- Inter/system sans;
- restrained spacing.

No consumer-style gradient login.

---

# 137. Auth screen visual scope

Compact.

Do not add:

- testimonials;
- pricing;
- customer logos;
- feature carousel.

---

# 138. Deal workspace visual scope

More information-dense than public pages, but still same product grammar.

Do not import arbitrary Bloomberg/CRM styling.

---

# 139. Public vs authenticated shell coherence

Same:

- logo;
- typography;
- colors;
- surfaces;
- controls.

Authenticated shell can have richer navigation later.

---

# 140. Current route decision matrix

| Current / target surface | Decision |
|---|---|
| `/screen-12-email-capture` | **KEEP AS EMAIL DELIVERY** |
| consultation route | **KEEP SEPARATE** |
| public result | **KEEP ANONYMOUS** |
| account route | **TARGET NEEDED, EXACT ROUTE NOT AUTHORIZED** |
| sign-in route | **TARGET NEEDED, EXACT ROUTE NOT AUTHORIZED** |
| Deals index | **TARGET WHEN PERSISTED DEALS EXIST** |
| Deal detail/workspace | **TARGET NEEDED AFTER SAVE** |
| separate Workspace entity | **DO NOT ADD WITHOUT NEED** |
| Organization creation at signup | **DEFER** |

---

# 141. Existing state decision matrix

| Existing concept | Decision |
|---|---|
| anonymous `INITIAL_SESSION` | **KEEP AS PUBLIC STARTING STATE** |
| `sessionId` | **KEEP / SERVER-BOUND WHERE AUTHORITATIVE** |
| email capture | **KEEP SEPARATE FROM ACCOUNT** |
| report delivery | **KEEP** |
| consultation request | **KEEP** |
| public report authority | **KEEP** |
| public report version | **PERSIST ON SAVE** |
| public evidence baseline | **PERSIST ON SAVE** |

---

# 142. Target persisted Deal minimum schema

Conceptual only:

```text
dealId
createdByUserId
createdAt
updatedAt

dealIdentity
  acquirerEntityId
  acquirerDisplayName
  targetEntityId
  targetDisplayName
  transactionIdentity?

publicBaseline
  publicAnalysisId
  reportId
  reportVersion
  generatedAt
  evidenceCutoff

currentWorkflowState
currentDecisionGaps[]
selectedNextAction?

access
  creatorUserId
```

Do not treat this as final database schema.

---

# 143. Fields NOT needed at first save

Do not require:

- billing account;
- organization ID;
- workspace ID;
- custom project name;
- full role matrix;
- private document index;
- 42Q;
- deal economics.

They enter only as needed.

---

# 144. Account / Deal split

Account can exist with zero Deals.

Deal can belong to account access domain.

Do not make account itself carry analysis fields.

---

# 145. Saved Deal and assessment session

Existing assessment session can be linked to persisted Deal.

Do not necessarily merge concepts.

One Deal may later have:

- multiple assessment sessions;
- refreshed reports;
- prospective versions.

Target architecture should allow that.

---

# 146. One Deal, multiple report versions

Likely future need.

Do not encode one-to-one forever.

But first version can expose current report only.

---

# 147. One Deal, multiple evidence phases

Public → internal → private → individual.

Persistence object must not assume all evidence is available at creation.

---

# 148. Account auth does not need to precede public session creation

Anonymous session can exist first.

This is intentional.

---

# 149. Anonymous session expiry

If anonymous session expires before save:

product may not be able to attach.

UI should be honest.

Potential:

`This analysis session has expired. Re-run the public analysis to save it.`

Only if necessary.

---

# 150. Preserve result long enough for save

Operationally, anonymous result should not disappear immediately.

No artificial urgency.

---

# 151. No security claims without authority

Do not write:

- bank-grade;
- enterprise-grade;
- encrypted end-to-end;
- SOC 2 compliant

unless actually true/current.

---

# 152. Secure private flow comes later

Account save only creates persistence boundary.

Private document security gets separate contract.

---

# 153. Deal deletion not required here

Do not delay Save implementation waiting for full lifecycle UX.

But backend governance must eventually support data-control obligations.

---

# 154. User agency

User can choose:

- keep reading anonymously;
- email report;
- save deal;
- deepen evidence;
- leave.

No forced branch.

---

# 155. Account value statement

Safe:

`Save this deal to keep the public analysis and continue later.`

Not:

`Create an account to unlock more accurate results.`

Accuracy depends on evidence, not account.

---

# 156. First authenticated next-step copy

After save:

`Your deal is saved.`

`Continue with the public analysis, add internal evidence, or come back later.`

No aggressive sales message.

---

# 157. Workspace naming in client UI

Use `Deal` as primary object.

`Workspace` may be used if/when the UI genuinely contains collaborative workspace capability.

Do not label a simple saved Deal as `Workspace` just because enterprise SaaS does.

---

# 158. Current mock dashboard caution

Earlier conceptual dashboard included:

- Home;
- Deals;
- Workspaces;
- Historical Cases;
- Methodology;
- 42Q;
- Reports;
- Evidence;
- Settings.

This navigation is **not authorized** by this document.

Each destination needs a real route/capability contract.

---

# 159. No 42Q global nav by default

42Q is conditional evidence channel.

It does not need a global top-level nav item in first authenticated shell unless product usage proves otherwise.

---

# 160. No Evidence global nav by default

Evidence can live within Deal.

Global Evidence library is only justified if users manage evidence across Deals.

---

# 161. No Reports global nav by default

Reports can live within Deal.

Global report index is a later need.

---

# 162. No Workspaces nav without Workspaces entity

Do not add empty conceptual navigation.

---

# 163. Deals as first authenticated home

If authenticated user returns:

a Deals list may be the most natural home once they have multiple Deals.

If one active Deal only, direct return to last Deal may be better.

This needs usability/data, not assumption.

---

# 164. Account landing decision

Not fixed here.

Must preserve:

- task continuity;
- Deal-centric model.

Do not default to generic dashboard out of habit.

---

# 165. Mandatory implementation audit

Before coding account/save:

| Question | Current state | Target |
|---|---|---|
| Is auth implemented? | | |
| Is server user identity implemented? | | |
| Can anonymous analysis be attached securely? | | |
| Can Deal be persisted? | | |
| Can ownership be enforced? | | |
| Can report version be preserved? | | |
| Can return intent survive auth? | | |
| Can duplicate save be prevented? | | |
| Can email delivery remain separate? | | |
| Is workspace actually needed? | | |

No UI should claim capability before these are answered.

---

# 166. WHAT WAS INTENTIONALLY PRESERVED

Before merge list:

- anonymous public flow;
- public result;
- report authority;
- email delivery;
- consultation flow;
- existing assessment session;
- downstream evidence architecture;
- product visual grammar.

---

# 167. WHAT CHANGED AND WHY

Format:

```text
OLD
→ NEW
→ DEFECT / NEED
→ AUTHORITY
```

Example:

```text
Email capture as the only post-report identity collection
→ separate Email this analysis and Save this deal actions
→ report distribution and persistent authenticated access are different user intents and permissions
→ progressive trust + product object model
```

---

# 168. Acceptance criteria

Account/save transition passes only if:

1. public analysis remains anonymous-capable;
2. public result remains readable without account;
3. account appears only after explicit persistence/deeper-work intent;
4. `Save this deal` is a real persistence action;
5. email delivery is not mislabeled as account;
6. email recipient is not automatically account user;
7. consultation contact is not account member;
8. sign-in and create-account are distinct;
9. auth method not faked;
10. no unsupported OAuth/SSO buttons;
11. auth returns user to same Deal/intention;
12. anonymous state is attached, not recreated;
13. Acquirer/Target canonical identities persist;
14. transaction identity persists when known;
15. public report ID/version persists;
16. evidence cutoff persists;
17. Decision Gap persists;
18. save operation is atomic from user perspective;
19. partial failure preserves public result;
20. duplicate Deal handling exists;
21. same pair can represent multiple transactions;
22. historical public case is not merged with user Deal;
23. Deal is primary authenticated work object;
24. Deal ≠ report;
25. Workspace is not invented unless needed;
26. Organization is deferred unless needed;
27. no generic enterprise object proliferation;
28. saved Deal is private by default;
29. no automatic sharing;
30. respondent ≠ collaborator;
31. respondent invite does not grant workspace access;
32. email-delivery recipient ≠ collaborator;
33. public baseline remains accessible after save;
34. deeper evidence does not overwrite public baseline silently;
35. account does not change analytical confidence;
36. report authority remains same on attachment;
37. repeated auth callback is idempotent;
38. no client-only access control;
39. ownership enforced server-side;
40. no arbitrary report claiming;
41. marketing consent separate;
42. billing not required for simple save;
43. Deal screen is not empty generic dashboard;
44. saved Deal shows continuity from public result;
45. no speculative global Workspaces/42Q/Reports/Evidence nav;
46. exact auth routes are not invented without route decision;
47. existing public routes remain functional;
48. existing email capture remains functional;
49. American English only;
50. WCAG 2.2 AA target maintained;
51. mobile auth preserves deal context;
52. visual language remains MergeVue;
53. no unsupported security claims;
54. no public indexing of saved Deals;
55. analytics do not expose sensitive deal interest to ad systems;
56. user can cancel auth and return to report;
57. no data loss on escalation;
58. no account-based claim strengthening;
59. saved state is machine-readable, not reconstructed from copy;
60. every new account/workspace capability corresponds to actual backend support.

---

# 169. Финальный принцип

> **Account is a persistence and permission boundary, not an analytical upgrade.**

> **The user should never have to repeat a deal, lose a public report, or wonder whether creating an account changed the underlying analysis.**

> **Save the same deal, preserve the same report, then deepen the same canonical evidence structure. Do not create a parallel SaaS universe after signup.**
