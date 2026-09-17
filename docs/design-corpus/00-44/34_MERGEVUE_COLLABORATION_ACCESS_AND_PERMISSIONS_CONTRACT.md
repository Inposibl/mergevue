# 34. Контракт совместной работы, доступа и разрешений MergeVue

**Файл:** `34_MERGEVUE_COLLABORATION_ACCESS_AND_PERMISSIONS_CONTRACT.md`  
**Версия:** 1.0  
**Дата:** 2026-09-16  
**Язык документа:** русский  
**Язык клиентского интерфейса:** только American English  
**Рынок первой версии:** США  
**Статус:** **OWNER-ACCEPTED / CONTROLLING COLLABORATION, ACCESS AND PERMISSIONS DESIGN CONTRACT; НЕ УТВЕРЖДАЕТ, ЧТО AUTH / COLLABORATION УЖЕ РЕАЛИЗОВАНЫ В PRODUCTION**  
**Owner acceptance:** **2026-09-16**  
**Аудитная база `main`:** `92c2e0df199d017082b653e72b5a6bfbf5bf6a31`  
**Связанные документы:** `21`, `22`, `23`, `24`, `29`, `31`, `33`  
**Главный принцип:** доступ к Deal определяется серверной авторизацией и purpose-bound permissions; членство в Deal не создаёт право видеть все evidence classes, а respondent invite, billing identity, consultation contact и report recipient не превращаются автоматически в workspace membership.  
**Ключевые инварианты:** `DEAL ACCESS IS SERVER-AUTHORITATIVE`, `MEMBERSHIP ≠ ALL-DATA ACCESS`, `RESPONDENT ≠ COLLABORATOR`, `BILLING ≠ ACCESS`, `INVITE ≠ ACCESS UNTIL ACCEPTED`, `REVOKE MEANS REVOKE`, `LEAST PRIVILEGE`, `NO EMAIL-DOMAIN AUTO-ENROLLMENT`, `NO PUBLIC SHARE LINK BY DEFAULT`, `42Q STAYS RESTRICTED`, `ACCESS ≠ REUSE RIGHTS`

---

## 0. Назначение

Этот документ определяет target collaboration layer для persisted Deal:

```text
Saved private Deal
→ explicit collaborator invitation
→ identity verification / authentication
→ permission assignment
→ accepted membership
→ bounded Deal access
→ audited changes
→ revocation / offboarding
```

Он отвечает на вопросы:

1. какие client-side roles нужны;
2. кто может приглашать и удалять участников;
3. кто может читать report;
4. кто может добавлять evidence;
5. кто может видеть private documentary evidence;
6. кто может видеть respondent status;
7. кто может видеть raw respondent answers;
8. кто может видеть 42Q / named-leader material;
9. чем collaborator отличается от respondent;
10. чем billing/procurement contact отличается от Deal member;
11. как должны работать invite, acceptance, expiry и revocation;
12. какие access decisions должен принимать server;
13. как не превратить access control в одну плоскую роль `Admin`.

---

## 1. Граница authority

При конфликте применяется:

1. текущая Owner-инструкция;
2. controlling security/privacy/data-rights authority;
3. `29` data-rights contract;
4. `31` person-level data restrictions;
5. `24` private evidence contract;
6. `23` respondent evidence contract;
7. `22` Deal Workspace contract;
8. `21` account/persistence contract;
9. настоящий документ;
10. current UI convenience.

Этот документ не может ослабить более строгую privacy/methodology boundary.

---

## 2. Current implementation reality

### 2.1. Customer collaboration сейчас отсутствует

В current `main` нет подтверждённой customer-facing архитектуры:

```text
/deals
/deals/:dealId
/workspace
/login
/signup
organization member directory
collaborator role matrix
```

Следовательно:

> этот файл — target contract, не описание уже работающей workspace-permission system.

### 2.2. Current saved-workspace target был intentionally minimal

`21` и `22` до этого разрешали безопасный first step:

```text
creator has access
```

и запрещали преждевременно выдумывать full role matrix.

Настоящий `34` является тем отдельным permission contract, после которого role model можно проектировать.

### 2.3. Respondent invite infrastructure существует

Current respondent/observation flow уже использует:

- assessment/session binding;
- observation session IDs;
- hashed digital code;
- expiry;
- revoked state;
- completed state;
- verification token;
- mismatch checks.

Это реальные security primitives.

### 2.4. Respondent invite не является collaboration invite

Получатель respondent link:

- не получает account автоматически;
- не получает Deal Workspace;
- не получает report;
- не получает private docs;
- не видит other respondent answers.

Эта граница сохраняется.

---

## 3. Existing-product-first disposition

| Текущий asset / правило | Решение | Причина |
|---|---|---|
| Creator-only saved Deal access | **KEEP AS DEFAULT START STATE** | Самая безопасная privacy baseline |
| Respondent token/code invite | **KEEP FOR RESPONDENT FLOWS ONLY** | Реальный governed evidence primitive |
| Respondent expiry/revocation/completed checks | **KEEP** | Хорошие fail-closed security properties |
| Collaboration via respondent token | **DO NOT REUSE** | Иная purpose/authority boundary |
| Email report recipient | **KEEP SEPARATE** | Delivery ≠ membership |
| Consultation contact | **KEEP SEPARATE** | Commercial contact ≠ membership |
| Billing contact | **KEEP SEPARATE** | Payment ≠ evidence access |
| Auto-enroll by corporate email domain | **DO NOT ADD** | Недостаточная authority |
| Generic public `Copy link` | **DO NOT ADD** | Share-link contract отдельный |
| Organization-wide member directory | **DO NOT ADD IN V1** | Не нужен для Deal-first architecture |
| `Owner` client role | **DO NOT USE** | Конфликт с project governance term Owner |
| Internal expert mode as client role | **DO NOT ADD** | Operational authority separate |
| Server-authoritative Deal access | **KEEP / REQUIRE** | Core security invariant |
| Per-evidence restricted visibility | **KEEP / FORMALIZE** | Already required by evidence/data-rights contracts |

---

## 4. Главный объект разрешений

Основной authorization object:

> **Deal**

Не:

- company-wide tenant;
- generic project;
- report file;
- questionnaire;
- person profile.

Membership привязывается к конкретному Deal.

---

## 5. Deal membership ≠ organization membership

Пользователь может иметь доступ:

```text
Deal A
```

и не иметь доступ:

```text
Deal B
```

даже если оба Deal относятся к одной organization.

---

## 6. Organization membership не создаётся автоматически

Не использовать:

```text
@company.com → join all company deals
```

без explicit enterprise policy.

---

## 7. Default privacy

Новый saved Deal:

```text
PRIVATE_TO_CREATOR
```

до explicit collaboration action.

Это target semantic, не current enum.

---

## 8. Client-side role model v1

Минимальный v1 role model:

1. **Deal Administrator**
2. **Deal Collaborator**
3. **Deal Viewer**

Не использовать client role `Owner`.

---

## 9. Deal Administrator

### 9.1. Назначение

Client-side governance role для конкретного Deal.

### 9.2. Может

- открыть Deal;
- видеть client-safe report;
- видеть Decision Gap;
- видеть client-safe evidence summaries;
- добавлять разрешённые Deal evidence;
- инициировать allowed respondent flows;
- приглашать client collaborators;
- изменять client workspace role;
- удалять/revoke client members;
- видеть membership audit summary;
- инициировать commercial scope request;
- управлять Deal-level client access.

### 9.3. Не может автоматически

- видеть raw 42Q answers;
- видеть internal latent type;
- видеть practitioner notes;
- видеть hidden analyst rationale;
- менять methodology;
- approve/override Environment;
- менять thresholds;
- release/seal forecast;
- grant R&D/publication rights;
- обходить private-evidence restrictions;
- grant permissions выше собственных authority;
- видеть server/internal secrets.

---

## 10. Deal Collaborator

### 10.1. Назначение

Рабочий client member, который участвует в Deal analysis.

### 10.2. Может по умолчанию

- открыть Deal;
- видеть client-safe report;
- видеть Decision Gap;
- видеть client-safe evidence summaries;
- добавлять evidence в разрешённых channels;
- видеть respondent workflow status;
- участвовать в requested Deal workflow.

### 10.3. Не может по умолчанию

- приглашать/remove workspace members;
- менять client roles;
- видеть restricted raw private documents без item/class permission;
- видеть raw respondent answers;
- видеть raw 42Q;
- видеть internal analyst/adjudicator content;
- менять commercial terms;
- менять data-use rights;
- archive/delete Deal.

---

## 11. Deal Viewer

### 11.1. Назначение

Authenticated read-only Deal access.

### 11.2. Может

- открыть current client-safe report;
- видеть bounded Deal identity;
- видеть Decision Gap;
- видеть allowed summary-level workflow status;
- видеть only evidence summaries permitted to viewers.

### 11.3. Не может

- добавлять evidence;
- приглашать respondents;
- приглашать collaborators;
- редактировать Deal context;
- видеть private documents по умолчанию;
- видеть raw respondent answers;
- видеть 42Q raw/internal data;
- менять commercial/data-rights settings.

---

## 12. Почему Viewer не равен external report recipient

Deal Viewer:

- authenticated;
- accepted membership;
- server-authorized.

Email/PDF recipient:

- получает конкретный delivered artifact;
- не получает Deal membership автоматически.

---

## 13. Internal operational roles — отдельная плоскость

Не смешивать client roles с:

- Analyst;
- Practitioner reviewer;
- Security operator;
- Support operator;
- Internal auditor.

Это operational access, а не customer workspace membership.

---

## 14. Billing contact — отдельная identity

Billing contact может:

- получать proposal;
- invoice;
- receipt;
- commercial notices.

Но не получает Deal evidence автоматически.

---

## 15. Procurement contact — отдельная identity

Procurement/security recipient может получать:

- vendor/security documents;
- commercial materials.

Не Deal evidence.

---

## 16. Respondent — не Deal member

Respondent:

- предоставляет evidence;
- действует через purpose-bound invite/session;
- может вообще не иметь account;
- не получает workspace membership.

---

## 17. Named-leader participant — не Deal member автоматически

42Q participant:

- участвует в person-level evidence workflow;
- не получает report;
- не получает collaborator access;
- не получает latent type.

---

## 18. Role ≠ data class permission

Client role — только первая authorization layer.

Вторая layer:

> **data class / item-level access**

---

## 19. Минимальные data classes

1. Public evidence
2. Client-safe report output
3. Deal metadata
4. Internal organizational evidence summary
5. Raw respondent answers
6. Private documentary evidence
7. Restricted private evidence
8. Analyst review material
9. Forecast/seal metadata
10. Monitoring/re-measurement records
11. Economic evidence
12. 42Q raw answers
13. 42Q derived internal state
14. Named-leader client-safe forecast
15. Commercial/billing metadata
16. Data-rights/consent records
17. Technical audit/security logs

---

## 20. Access classes

Target conceptual visibility:

```text
CLIENT_REPORT
CLIENT_SUMMARY
CLIENT_PRIVATE
RESTRICTED_CASE
PERSON_RESTRICTED
INTERNAL_OPERATIONAL
SECURITY_ONLY
```

Exact enum требует implementation act.

---

## 21. Default client permission matrix

| Data class | Deal Administrator | Deal Collaborator | Deal Viewer |
|---|---:|---:|---:|
| Deal identity | Да | Да | Да |
| Client-safe current report | Да | Да | Да |
| Decision Gap | Да | Да | Да |
| Public evidence provenance | Да | Да | Да |
| Evidence summaries | Да | Да | Да, bounded |
| Add organizational evidence | Да | Да | Нет |
| Respondent workflow status | Да | Да | Summary only |
| Raw respondent answers | Нет by default | Нет | Нет |
| Private document metadata | Да | Да if granted | Нет by default |
| Raw private documents | Да if rights permit | Explicit grant only | Нет |
| Analyst rationale | Нет | Нет | Нет |
| Internal adjudication notes | Нет | Нет | Нет |
| Forecast client output | Да | Да | Да if report-visible |
| Seal metadata client-safe | Да | Да | Да if report-visible |
| Economic client-safe evidence | Да | Да | Report-level only |
| 42Q raw answers | Нет | Нет | Нет |
| Internal type/function state | Нет | Нет | Нет |
| Named-leader client-safe forecast | Да if recipient-authorized | Explicit recipient permission | Explicit recipient permission |
| Membership management | Да | Нет | Нет |
| Commercial/billing records | Only if also authorized commercial contact | Нет by default | Нет |
| Data-use rights management | Separate authority required | Нет | Нет |

---

## 22. Deal Administrator не является superuser

Deal Administrator не имеет права видеть всё только потому, что управляет membership.

Это особенно важно для:

- 42Q;
- restricted person data;
- analyst notes;
- legal/security records;
- confidential source material.

---

## 23. Private evidence item visibility

Private evidence item может иметь:

```text
visible
metadata-only
restricted
```

Workspace role не уничтожает item-level restriction.

---

## 24. Restricted private evidence

Пример:

- sensitive board note;
- privileged legal memo;
- compensation data;
- executive assessment material.

Доступ требует explicit authorization.

---

## 25. Metadata-only state

Member может знать:

`A restricted document supports this finding`

без доступа к содержимому.

---

## 26. Raw respondent answers

Default client rule:

> **raw respondent answers are not broadcast to Deal members.**

Client-facing system показывает:

- completion;
- bounded derived evidence;
- contradiction where lawful;
- provenance/status.

---

## 27. Why raw answers are restricted

Чтобы:

- не разрушать respondent independence;
- не создавать cross-party leakage;
- не превращать evidence collection в surveillance;
- сохранять methodology/privacy boundaries.

---

## 28. Cross-party isolation

Acquirer-side member не получает raw Target answers только из-за Deal membership.

Target-side evidence также не становится общим workspace content автоматически.

---

## 29. Respondent identity

Если имя не нужно для client purpose:

показывать:

- role;
- side;
- completion state.

Не персональное имя.

---

## 30. 42Q absolute boundary

Ни Deal Administrator, ни Collaborator, ни Viewer не получают:

- raw 42Q answers;
- item-level scores;
- latent type;
- function vector/state;
- practitioner private rationale.

---

## 31. Named-leader client-safe forecast

Может быть показан только:

- recipient-authorized;
- Deal-bound;
- released;
- rights-eligible;
- в client-safe behavioral form по `31`.

---

## 32. Commercial price does not widen data access

$30k scope не создаёт автоматически больше person-level access, чем $5k.

---

## 33. Membership management

Только Deal Administrator может:

- invite collaborator/viewer;
- change client role;
- revoke membership.

---

## 34. Administrator count

V1 должен поддерживать минимум одного active Deal Administrator.

Нельзя revoke/remove последнего administrator без controlled transfer or Deal closure action.

---

## 35. Creator role on first save

Если collaboration feature реализована:

creator persisted Deal получает:

> `Deal Administrator`

по default target.

---

## 36. Creator ≠ permanent administrator

Role может быть transferred/changed при наличии другого active administrator.

---

## 37. Invite collaborator — explicit action

Candidate client CTA:

`Invite collaborator`

Только после:

- account;
- saved Deal;
- administrator authority.

---

## 38. Invite must name intended access

Перед отправкой:

```text
Invite to this deal
Role: Collaborator / Viewer
```

Не generic:

`Invite to MergeVue`.

---

## 39. Invite identity

Minimum:

- recipient email or enterprise identity;
- intended Deal;
- intended role;
- inviter;
- createdAt;
- expiry;
- invite status.

---

## 40. Invite ≠ membership

До acceptance:

```text
PENDING_INVITE
```

Recipient не имеет Deal access.

---

## 41. Invite acceptance

Требует:

- recipient identity verification/authentication;
- invite still valid;
- invite not revoked;
- Deal still active;
- inviter authority still valid;
- accepted role still permitted.

---

## 42. Email forwarding protection

Invitation token alone не должен создавать transferable Deal access без identity check.

---

## 43. Collaborator invite token

Не использовать respondent digital code semantics как workspace credential.

Collaborator invite требует authentication/account-backed acceptance.

---

## 44. Respondent invite stays separate

Respondent token may remain accountless where governing flow allows.

---

## 45. Invite TTL

Не копировать автоматически respondent TTL `72 hours`.

Collaboration invite expiry — separate security policy.

До принятия exact TTL:

- invite must expire;
- expiry must be server-enforced;
- UI не обещает конкретный период.

---

## 46. Invite status model

Target:

```text
PENDING
ACCEPTED
EXPIRED
REVOKED
INVALID
```

No access from any state except accepted membership.

---

## 47. Invite resend

New resend should issue new authority/token or explicitly extend according to security policy.

Не silently revive revoked invite.

---

## 48. Revocation before acceptance

Administrator can revoke pending invite.

Revoked invite fails closed.

---

## 49. Membership revocation

Removing member must:

- revoke future Deal access;
- revoke active authenticated Deal capabilities;
- invalidate Deal deep-link authorization;
- preserve audit event;
- not delete evidence they lawfully contributed.

---

## 50. Revocation latency

Authorization should stop on next server access decision.

Не ждать browser refresh как security mechanism.

---

## 51. Already downloaded artifacts

Revocation cannot recall PDF already lawfully downloaded.

UX/policy must not imply otherwise.

---

## 52. Existing derived evidence after member removal

Evidence provenance remains.

Do not erase contributor history merely because access removed.

---

## 53. Role downgrade

Admin → Collaborator / Viewer:

new permissions apply immediately server-side.

---

## 54. Role upgrade

Requires authorized administrator action and audit.

---

## 55. Self-role escalation prohibited

Collaborator cannot promote self.

---

## 56. Client role cannot grant internal role

Deal Administrator cannot assign:

- Analyst;
- Practitioner;
- Auditor;
- Security operator.

---

## 57. Internal staff access

Must be service/operationally justified.

Not inherited from being MergeVue employee in UI.

---

## 58. Support access

No default raw Deal access.

If future support impersonation/break-glass exists:

- explicit support policy;
- reason;
- time-bound;
- audit;
- client/security governance where required.

Not authorized by this file.

---

## 59. Internal analyst assignment

Analyst access should be Deal-scoped.

No global browsing of all client Deals by default.

---

## 60. Practitioner access

Only when:

- review/escalation assigned;
- relevant data class required.

---

## 61. Least privilege

Every access path should answer:

> What exact task requires this data?

---

## 62. No permission by UI hiding

Security cannot be:

`button not shown`.

Server must enforce.

---

## 63. Server-authoritative access decision

Before returning Deal identity/content:

server determines access.

---

## 64. Unauthorized Deal

External response must not leak:

- Deal pair;
- client name;
- report status;
- member names;
- evidence count.

---

## 65. Not-found vs unauthorized

Security policy may unify externally.

Client UI should not infer existence from status difference.

---

## 66. Deep links

Every future:

```text
/deals/:dealId/...
```

must perform server-side access check.

---

## 67. URL is not authority

Knowing a Deal ID does not grant access.

---

## 68. No public indexing

Saved/client Deal URLs:

- no SEO;
- no public directory;
- no recent activity feed.

---

## 69. Share links

Generic share link remains **out of scope**.

Do not add:

`Anyone with the link`.

External report delivery belongs to later sharing/export contract.

---

## 70. Workspace collaborator ≠ share-link viewer

Different authority model.

---

## 71. Report viewer role does not mean raw evidence viewer

Deal Viewer sees client-safe report, not underlying private corpus by default.

---

## 72. Evidence contributor ≠ collaborator role

A respondent/evidence contributor can submit without ongoing workspace access.

---

## 73. Account ≠ membership

Authenticated MergeVue user can have zero Deals.

---

## 74. Membership ≠ account ownership

No client-side notion of owning MergeVue account.

---

## 75. Deal Administrator terminology

Use exact client-facing label candidate:

`Deal administrator`

Avoid:

`Owner`.

---

## 76. Collaborator terminology

Candidate:

`Collaborator`

---

## 77. Viewer terminology

Candidate:

`Viewer`

---

## 78. Respondent terminology

Keep role/context-specific evidence wording.

Do not call respondent `Guest collaborator`.

---

## 79. Membership screen

Target composition:

```text
People with access

Deal administrator
[Name/email] [Role]

Collaborators
[Name/email] [Role]

Viewers
[Name/email] [Role]

Pending invitations
[email] [intended role] [status]

[Invite collaborator]
```

Only if collaboration backend exists.

---

## 80. Respondents not shown in membership list

Separate section.

---

## 81. Billing contacts not shown in membership list by default

Separate commercial section.

---

## 82. Internal analysts not shown as ordinary client collaborators

May show service status if useful, not full internal directory.

---

## 83. Member detail

Minimum:

- identity;
- role;
- status;
- joined/accepted date;
- access summary.

Do not show unnecessary internal metadata.

---

## 84. No org chart

---

## 85. No employee directory

---

## 86. No presence indicators initially

`Online now` not needed.

---

## 87. No chat/messaging implied

Collaboration means shared Deal work, not Slack replacement.

---

## 88. No task assignment system by default

Not project-management product.

---

## 89. No comment threads by default

Separate feature act if needed.

---

## 90. No @mentions by default

---

## 91. Collaborative editing

Not required v1.

---

## 92. Concurrent edits

If later implemented:

must use conflict-safe versioning.

Not last-write-wins silently on authority-bearing data.

---

## 93. Evidence upload by Collaborator

Allowed only within:

- Deal;
- permitted evidence channel;
- accepted rights;
- file/security policy.

---

## 94. Evidence deletion

Do not grant ordinary collaborator irreversible deletion.

---

## 95. Evidence withdrawal/revocation

Different from destructive erase.

Governed by data-rights/lifecycle.

---

## 96. Report editing

Client members do not edit released report conclusions directly.

---

## 97. Deal metadata editing

Potentially:

- nickname;
- non-method context.

But cannot alter sealed/frozen historical facts silently.

---

## 98. Acquirer/Target identity

Once authoritative Deal identity established:

changes require controlled correction, not ordinary collaborator edit.

---

## 99. Decision Gap

Client may add context/evidence.

Cannot simply mark methodological gap `Resolved` manually.

---

## 100. Workflow action permissions

Examples:

| Action | Administrator | Collaborator | Viewer |
|---|---:|---:|---:|
| View Deal | Да | Да | Да |
| View report | Да | Да | Да |
| Add internal evidence | Да | Да | Нет |
| Upload private evidence | Да | Да if scope permits | Нет |
| Initiate respondent setup | Да | Да if allowed | Нет |
| Invite collaborator | Да | Нет | Нет |
| Change role | Да | Нет | Нет |
| Revoke member | Да | Нет | Нет |
| View membership | Да | Да | Bounded/optional |
| Edit commercial scope | Separate commercial authority | Нет by default | Нет |
| Delete/archive Deal | Separate lifecycle authority | Нет | Нет |

---

## 101. Respondent invite action

Collaborator may initiate respondent flow only if:

- methodology prerequisites met;
- Deal permission allows;
- backend authority says eligible.

---

## 102. No arbitrary invite

UI cannot let user invite anyone to any questionnaire at any time.

---

## 103. Current respondent prerequisites remain

`23` sequencing remains controlling.

---

## 104. Acquirer vs Target flows remain separate

Permissions layer does not merge questionnaires.

---

## 105. Member side does not rewrite evidence side

A client collaborator may work for Acquirer, but workspace role is not evidence-authority metadata automatically.

Respondent/evidence context still collected separately.

---

## 106. No inferred evidence authority from workspace role

`Deal Administrator` does not mean `senior decision-maker evidence`.

---

## 107. Data rights vs access

Critical:

```text
access permission
≠
reuse permission
```

---

## 108. Administrator cannot enable benchmark/publication rights by membership action

Secondary-use consent/authority remains separate.

---

## 109. Data-rights settings

If later exposed:

must reflect actual policy.

Not simple role toggle.

---

## 110. Publication permission

Not implied by collaborator invite.

---

## 111. R&D permission

Not implied by paid scope.

---

## 112. Cross-Deal reuse

Never granted by Deal membership.

---

## 113. Cross-Deal access

User with membership in multiple Deals sees each only through separate membership.

---

## 114. Organization portfolio view

Not authorized here.

Could later aggregate Deal navigation for authorized user, but no cross-Deal evidence merging.

---

## 115. Commercial roles

Commercial requester can differ from Deal Administrator.

---

## 116. Payment success

Does not add billing contact to Deal.

---

## 117. Procurement review

Does not add procurement contact.

---

## 118. Consultation form

Does not create member.

---

## 119. Email delivery

Does not create member.

---

## 120. Collaborator invitation cannot be bundled with marketing consent

---

## 121. Authentication

`21` still controls authentication choice.

This document does not select:

- password;
- magic link;
- OAuth;
- passkey;
- SSO.

---

## 122. Invite acceptance requires real authentication

Whatever auth method is selected, collaborator access is account-backed.

---

## 123. Enterprise SSO

Not claimed until implemented.

---

## 124. Domain restrictions

Future enterprise admin may restrict Deal membership to approved domain(s).

Not enabled by default here.

---

## 125. External advisors

May be collaborators if explicitly invited.

Do not block personal/external domain categorically without policy.

---

## 126. Law firms / bankers / consultants

Same.

Access derives from invitation/role, not company category.

---

## 127. Chinese walls / information barriers

Potential enterprise need.

Not implemented by this v1 model beyond Deal-specific membership and item restrictions.

---

## 128. Conflict of interest

Operational/legal policy.

Not inferred by product.

---

## 129. MFA

Security policy may require.

Not selected by design contract.

---

## 130. Session expiration

Auth/security policy.

But stale client session must not preserve access after server revocation.

---

## 131. Cached data

Client should minimize sensitive cache.

Revocation must block future fetch.

---

## 132. Offline mode

Not supported for sensitive workspace by default.

---

## 133. Downloaded private files

If download allowed, revocation cannot recall them.

Permissions should therefore avoid unnecessary download exposure.

---

## 134. Download permission

Not automatically equal to view permission.

Target architecture should be able to distinguish:

```text
VIEW
DOWNLOAD
```

for sensitive private evidence.

Exact implementation later.

---

## 135. Export permission

Separate from Deal membership.

Later `36` contract.

---

## 136. Copy/paste restriction

Do not rely on UI anti-copy as real security.

---

## 137. Watermarks

Potential future control for sensitive exports.

Not required here.

---

## 138. Audit log

Membership actions require event history.

Minimum events:

```text
invite_created
invite_revoked
invite_expired
invite_accepted
member_role_changed
member_revoked
restricted_access_granted
restricted_access_revoked
```

---

## 139. Audit record

Should contain:

- Deal ID;
- actor;
- action;
- target identity;
- previous role/access where relevant;
- new role/access;
- timestamp;
- reason where required.

---

## 140. Audit log visibility

Deal Administrator may see client-safe membership history.

Security/internal audit contains more technical detail.

---

## 141. No secret/token in audit UI

---

## 142. Invite secret storage

Do not store plaintext transferable secret where unnecessary.

Use hashed/opaque token patterns according to security implementation.

---

## 143. Do not copy respondent hashing blindly

Current respondent hash function is implementation-specific evidence.

Collaboration authentication needs production-grade identity/security design.

---

## 144. Completed invite

Cannot be reused to add another identity.

---

## 145. Accepted invitation and email change

Membership binds verified account identity, not forever the original invite string.

Account email change policy separate.

---

## 146. Invite sent to wrong email

Administrator can revoke and issue new invite.

Do not transfer pending invite silently.

---

## 147. Duplicate membership

One account should not create duplicate active memberships for same Deal.

---

## 148. Multiple roles

V1 client role should be one primary Deal role.

Fine-grained restricted-evidence grants may be additional permissions.

---

## 149. Role stacking

Avoid:

`Viewer + Collaborator + Admin`.

Use one primary role.

---

## 150. Fine-grained permission grants

Only for data classes/items where necessary.

Do not create 50 toggles.

---

## 151. Permission anti-proliferation

Target:

- 3 client roles;
- small set of restricted-data exceptions.

---

## 152. Permission inheritance

Default:

role grants baseline.

Item/class restriction can **remove** visibility.

Explicit restricted grant can expand only within higher policy bounds.

---

## 153. Deny wins

If any controlling restriction denies access:

deny.

---

## 154. Unknown permission state

Fail closed.

---

## 155. Missing rights metadata

Fail closed for sensitive data.

---

## 156. No optimistic UI access

Do not render sensitive data and then hide after API failure.

Access decision first.

---

## 157. Loading order

1. authenticate;
2. authorize Deal;
3. resolve role;
4. resolve data-class/item permissions;
5. fetch/render permitted data.

---

## 158. Unauthorized notification

Do not send Deal notifications to removed member.

---

## 159. Notification preferences

Later contract.

---

## 160. Email invitation content

Minimum client-safe:

`You've been invited to collaborate on a MergeVue deal.`

Need not reveal company pair in email if privacy policy prefers minimal disclosure.

---

## 161. Invite email Deal disclosure

Default safer target:

- inviter identity;
- MergeVue;
- no sensitive Deal detail before authentication.

After authentication and access check → Deal identity.

---

## 162. Invitation phishing safety

Email should state:

- sender/product identity;
- intended action;
- no request for questionnaire answers by email.

---

## 163. External forward

Forwarded invite cannot authorize different account.

---

## 164. Invitation recipient mismatch

Fail closed.

---

## 165. Member offboarding

Trigger examples:

- explicit administrator revoke;
- organization relationship ended;
- security incident;
- legal request.

Exact HR/enterprise automation not assumed.

---

## 166. Organization offboarding

If enterprise relationship ends:

Deal memberships may need bulk revocation.

Future enterprise control.

Not implicit from email domain.

---

## 167. Deal archive

Archive does not automatically revoke historical access unless lifecycle policy says.

---

## 168. Deal delete

Separate lifecycle/data-rights authority.

---

## 169. Access after Deal close

Deal close status does not automatically reveal or revoke access.

Policy-specific.

---

## 170. Post-close monitoring collaborators

Same Deal membership can continue if engagement/purpose permits.

Do not create new organization automatically.

---

## 171. New future transaction

New Deal requires new membership.

No automatic carry-over.

---

## 172. Execution Evidence Pack

Access/share governed separately.

Membership in source Deal does not authorize disclosure to future buyer.

---

## 173. Historical public cases

Not governed by customer Deal membership.

---

## 174. Public report

Anonymous public result remains outside private workspace permission model until saved.

---

## 175. Saved public baseline

Once attached to Deal, authenticated members may access saved version according to role.

Public-source provenance remains public-source provenance.

---

## 176. Client-safe report

Viewer-level surface should not expose:

- analyst-only notes;
- internal model state;
- raw evidence;
- hidden methodology.

---

## 177. Analyst view

Expanded same canonical report, not a client role.

---

## 178. Admin cannot switch to analyst view

---

## 179. Internal support cannot switch to client admin by UI shortcut without controlled impersonation policy

---

## 180. No universal `Admin mode`

---

## 181. Access denied copy

Client-facing candidate:

`You don't have access to this deal.`

Do not reveal details.

---

## 182. Invite expired copy

`This invitation is no longer valid.`

---

## 183. Invite revoked copy

Same externally if security prefers.

---

## 184. Invite already accepted

Direct user to sign in / Deal if identity matches.

---

## 185. Member removed

On next access:

`You no longer have access to this deal.`

No Deal details.

---

## 186. Restricted evidence copy

`Restricted evidence`

`You don't have permission to view this source.`

Avoid implying content.

---

## 187. Metadata-only evidence copy

`A restricted source supports this finding.`

Only if even existence disclosure is authorized.

---

## 188. 42Q copy

Do not show:

`Restricted personality results`.

Prefer no client-visible raw instrument section.

---

## 189. Member management CTA strings

Candidate:

`Invite collaborator`

`Change access`

`Remove access`

`Cancel invitation`

---

## 190. Role descriptions

### Deal administrator

`Can manage deal access and contribute to the analysis. Restricted evidence remains subject to separate permissions.`

### Collaborator

`Can work on this deal and add permitted evidence. Cannot manage access.`

### Viewer

`Can view the deal and client-facing analysis. Cannot add evidence or manage access.`

---

## 191. No dangerous ambiguity

Do not label role:

`Member`

without permission explanation.

---

## 192. Confirmation for removal

Require confirmation.

---

## 193. Confirmation for administrator transfer

Require explicit confirmation.

---

## 194. Last administrator protection

Cannot remove last Deal Administrator.

---

## 195. Invitation role default

Do not silently default to Administrator.

Safer UI default can be:

`Collaborator`

only if explicitly accepted as product default during implementation.

Until then require role selection.

---

## 196. Viewer as safest read-only

Useful for IC stakeholders who need report access without evidence contribution.

---

## 197. Role change UI

Show current + new role.

---

## 198. Permission preview

Before invite/change:

show concise description of access.

---

## 199. Do not expose internal data-class matrix to normal user

Client needs understandable scope, not 30 permissions.

---

## 200. Restricted evidence grants UI

Only where real restricted evidence exists.

---

## 201. Member count

No pricing based on member count in current `33`.

---

## 202. Collaboration does not create paid upgrade automatically

---

## 203. Paid scope may justify collaboration

But membership itself isn't evidence or analytical value.

---

## 204. Commercial administrator vs Deal administrator

Do not assume same person.

---

## 205. Payer cannot remove Deal members unless separately Deal Administrator

---

## 206. Deal Administrator cannot alter invoice unless separately billing-authorized

---

## 207. Access request

Future feature may allow user to request access.

Not required v1.

---

## 208. No discoverable Deal directory for requesting access

---

## 209. Manual invite only v1

Collaboration starts from authorized admin invitation.

---

## 210. No organization-wide public join link

---

## 211. No QR access link

---

## 212. No unprotected PDF as workspace substitute

---

## 213. Data minimization

Membership profile stores minimum identity needed for access.

---

## 214. Job title

Not required for collaborator access.

May be separate evidence/business context.

---

## 215. Organization

Can be useful but not proof of permission.

---

## 216. Email domain

Not proof of Deal authorization.

---

## 217. Role within organization

Not inferred from title/email.

---

## 218. Access reason

For high sensitivity grants, capture reason.

---

## 219. Time-limited restricted access

Future option.

Not necessary for ordinary role.

---

## 220. Temporary external advisor

Could use Viewer/Collaborator plus later expiry policy.

No special role required.

---

## 221. Membership expiry

Not standard v1.

If business need arises, separate policy.

---

## 222. Invite expiry vs membership expiry

Different concepts.

---

## 223. Security incident

Security can override/revoke access independent of client admin.

---

## 224. Legal hold

Does not imply broader read access.

---

## 225. Audit preservation

Revocation/removal does not destroy authorization history.

---

## 226. Privacy notices

Collaborator/account notice governed by identity/privacy policy.

Respondent notice remains separate.

---

## 227. Consent

Collaboration invite acceptance is not consent for:

- benchmark;
- R&D;
- publication;
- marketing.

---

## 228. Marketing

No automatic opt-in.

---

## 229. Data export

Later contract.

---

## 230. Personal data export

Legal/privacy process separate.

---

## 231. Analytics events

Allowed target events:

```text
collaborator_invite_created
collaborator_invite_accepted
collaborator_invite_revoked
collaborator_invite_expired
deal_member_role_changed
deal_member_access_revoked
restricted_evidence_access_granted
restricted_evidence_access_revoked
```

---

## 232. Generic analytics must not receive

- Deal company pair;
- invite email;
- respondent identity;
- private filename;
- 42Q data;
- restricted evidence description.

---

## 233. Security monitoring

May collect technical identifiers under security policy.

Separate from product analytics.

---

## 234. Audit ≠ analytics

Do not use marketing analytics as permission audit log.

---

## 235. Notifications

Invite/member notifications require later notification contract.

Minimal transactional invite notification is part of collaboration.

---

## 236. Notification revocation

Removed member should not receive subsequent Deal updates.

---

## 237. Email delivery security

Invite email must not contain private report attachment by default.

---

## 238. Accessibility

Target WCAG 2.2 AA.

Member management needs:

- semantic table/list;
- keyboard accessible role controls;
- explicit text status;
- confirm dialogs;
- focus management;
- no color-only permission state.

---

## 239. Mobile

Member list:

- identity;
- role;
- status;
- actions in accessible menu.

Avoid dense desktop permission grid on mobile.

---

## 240. Desktop

Can show:

- People with access;
- pending invitations;
- role summaries;
- restricted-access note.

---

## 241. Visual tone

Operational, quiet, professional.

No social-network avatars wall.

---

## 242. No profile cards as product centerpiece

---

## 243. Initials/avatar optional

Only cosmetic.

Not identity authority.

---

## 244. Status labels

Candidate:

`Active`

`Invitation pending`

`Invitation expired`

`Access removed`

---

## 245. Deal member search

Not needed until membership scale warrants.

---

## 246. Bulk invite

Not v1.

---

## 247. Bulk role change

Not v1.

---

## 248. CSV member import

Not v1.

---

## 249. SCIM

Not v1.

---

## 250. SSO group mapping

Not v1.

---

## 251. Enterprise directory sync

Not v1.

---

## 252. Access review

Future enterprise feature.

Not required initial collaboration.

---

## 253. Periodic access recertification

Future security feature.

---

## 254. Access reason visibility

Admin may see membership role.

Detailed internal reason for staff access not necessarily client-visible.

---

## 255. Internal access transparency

If later promised to clients, requires real audit/reporting.

Do not claim now.

---

## 256. Support impersonation disclosure

Not implemented.

---

## 257. Security logs retention

Policy separate.

---

## 258. Authentication logs

Security policy separate.

---

## 259. Invite abuse prevention

Future implementation should include:

- rate limits;
- anti-enumeration;
- token entropy;
- replay resistance.

Exact numbers security act.

---

## 260. Email enumeration

Invite/login errors should avoid revealing account existence unnecessarily.

---

## 261. Brute-force protection

Relevant to any code/token authentication.

Current respondent 6-digit code requires its own protection.

Collaborator auth should not rely on six-digit invite code.

---

## 262. Current respondent code

Do not promote simple existing hash implementation to general account security standard.

---

## 263. Security review before collaboration launch

Required.

---

## 264. Data access review before collaboration launch

Required against `24`, `29`, `31`.

---

## 265. Route decision before collaboration launch

Because current `main` has no authenticated Deal route authority.

---

## 266. Backend readiness gate

Before UI ships:

- account-backed identity real;
- persisted Deal real;
- server authorization real;
- membership store real;
- invite acceptance real;
- revocation real;
- audit log real;
- evidence visibility enforcement real.

---

## 267. No prototype-as-production

Mock role selector does not mean access control exists.

---

## 268. No localStorage membership

Never authoritative.

---

## 269. No client-only role check

Frontend role is presentation only.

---

## 270. No hidden API bypass

Every protected endpoint checks permission.

---

## 271. No export bypass

Later export endpoint must check same rights.

---

## 272. No PDF-generation bypass

If report is restricted, PDF endpoint cannot ignore membership.

---

## 273. No direct object storage bypass

Private evidence storageReference never becomes public download URL.

---

## 274. No raw database IDs as authorization

ID ≠ permission.

---

## 275. No shared secret in URL for collaborator membership after acceptance

Use authenticated access.

---

## 276. No permanent bearer collaboration links

---

## 277. Invite token lifecycle

One-time acceptance capability.

After acceptance:

normal authenticated membership.

---

## 278. Membership source

Store:

- invited by;
- acceptedAt;
- role;
- current status.

---

## 279. Contribution provenance

Evidence contributed by removed member retains contributor identity/reference per policy.

---

## 280. Role at time of contribution

May be useful audit metadata.

---

## 281. Permission at time of access

Security audit may preserve.

---

## 282. Client-safe activity

Potential:

`Alex added private evidence`

only if identity/activity disclosure allowed.

Not required v1.

---

## 283. Activity feed

Not required.

---

## 284. Notification of role change

Transactional notice recommended once notifications implemented.

---

## 285. Notification of removal

Can be sent if policy supports.

---

## 286. No anonymous collaborator

Workspace collaborator must authenticate.

Respondent can remain controlled anonymous/pseudonymous where methodology allows.

---

## 287. Guest viewer

Not a separate v1 role.

Use authenticated Viewer.

---

## 288. External report sharing

Later contract can support recipient-specific delivery without workspace membership.

---

## 289. Viewer can be external advisor

If authenticated/invited.

---

## 290. Client-side row-level restrictions

Need not expose internal policy expression.

---

## 291. Private evidence restriction source

May come from:

- uploader request;
- legal/privacy policy;
- person-level rules;
- analyst classification;
- data-rights metadata.

---

## 292. User cannot downgrade system-required restriction

---

## 293. User may make evidence more restrictive

Potential future feature.

Needs policy.

---

## 294. Public evidence remains public-source class

But derived Deal analysis is still private Deal context after save.

---

## 295. Client report confidentiality

Saved paid report is not public merely because some sources are public.

---

## 296. Deal identity sensitivity

Even company pair can be confidential in live M&A.

Treat saved Deal identity as protected workspace metadata.

---

## 297. Invite email privacy

Default minimal disclosure is important for live transaction confidentiality.

---

## 298. Calendar integration

Not relevant to collaboration access.

---

## 299. Comments

Future.

---

## 300. Approvals

Client approval workflow not required.

---

## 301. Release authority

Client members do not self-release system report.

---

## 302. Forecast lock

Controlled by `26`, not admin role.

---

## 303. Verification outcome

Controlled by `27`.

---

## 304. Monitoring observations

Members may contribute only if relevant workflow allows.

Role alone not enough.

---

## 305. Intervention records

May have narrower editing permissions later.

Not defined here.

---

## 306. Economic evidence

Collaborator may add allowed economic basis under `32`.

Cannot mark it confirmed merely by upload.

---

## 307. Commercial proposal

Deal Administrator may initiate request.

Billing acceptance may involve other actor.

---

## 308. No role leakage into methodology

Membership is workflow authority, not evidence weight.

---

## 309. No methodology leakage into membership

Environment/type does not determine user permissions.

---

## 310. No personality-based access

Never.

---

## 311. No seniority-based automatic access

CEO title does not auto-grant Deal.

---

## 312. No board-title automatic access

Same.

---

## 313. Explicit invitation wins over title inference

Within policy.

---

## 314. Client identity verification

Must precede accepted workspace access.

---

## 315. Invitation sender identity

Recipient should know inviter when safe.

---

## 316. Account linking

Do not link email-delivery recipient to account automatically.

---

## 317. Existing report email and collaborator invite

Different email purposes/templates.

---

## 318. Unsubscribe

Transactional access emails not same as marketing list.

---

## 319. Account deletion

If member deletes account:

- access terminates;
- audit/provenance handling follows policy;
- contributed evidence not silently destroyed.

---

## 320. Organization departure

Does not automatically prove Deal access should terminate unless enterprise policy says; but client admin/security can revoke.

---

## 321. Emergency lock

Security may suspend Deal access.

Future security action.

---

## 322. Suspended membership

Potential future state.

Not needed in minimal client UI unless implemented.

---

## 323. Access request denial

Do not show target member list.

---

## 324. Permission error resilience

If one restricted block denied:

render allowed Deal sections.

Do not fail entire Workspace unless Deal-level access denied.

---

## 325. Section-level permission

Report may be visible while raw evidence hidden.

---

## 326. Person-level section

Can be omitted/withheld for member lacking recipient rights.

---

## 327. Economic sensitive section

Could be hidden if source agreement restricts.

---

## 328. Permission provenance

System should know why access allowed:

- role baseline;
- explicit restricted grant;
- internal assignment;
- rights policy.

---

## 329. Client explanation

Normal user sees simple reason:

`Your role does not include access to this source.`

---

## 330. Internal explanation

Can include policy identifiers.

---

## 331. No false anonymity

Membership identity is not anonymous unless architecture actually supports pseudonymity.

---

## 332. No false confidentiality guarantee

Do not say `Only you can ever see this` unless technically/policy true.

---

## 333. Deal Administrator onboarding

Explain:

- they can manage client access;
- restricted evidence may still remain inaccessible;
- respondent and participant invites are separate.

---

## 334. Collaborator onboarding

Explain:

- can work on Deal;
- cannot manage access;
- may not see all restricted sources.

---

## 335. Viewer onboarding

Explain read-only boundary.

---

## 336. Respondent completion

Does not prompt:

`Join workspace`

by default.

---

## 337. 42Q participant completion

Does not prompt workspace access.

---

## 338. Future promotion from respondent to collaborator

Requires separate explicit invite/authentication.

No implicit conversion.

---

## 339. Same person in multiple capacities

Possible:

- billing contact;
- collaborator;
- respondent.

System keeps roles/permissions separate even if identity same.

---

## 340. No identity collapse

Do not assume same email purpose records are same authorization object without secure identity linkage.

---

## 341. Permission migration

If role model changes later:

version policy and migrate explicitly.

---

## 342. Legacy data

Creator-only Deal remains accessible to creator.

No automatic new collaborators added.

---

## 343. Policy version

Membership/access decisions should bind:

```text
permissionPolicyVersion
```

future schema.

---

## 344. Audit version

Role change record should preserve policy version where useful.

---

## 345. Test matrix

Before release test at least:

- creator access;
- admin access;
- collaborator access;
- viewer read-only;
- unauthorized account;
- pending invite;
- expired invite;
- revoked invite;
- accepted invite;
- forwarded invite wrong identity;
- role downgrade;
- member removal;
- last-admin protection;
- restricted private evidence;
- raw respondent denial;
- cross-party denial;
- raw 42Q denial;
- named-leader recipient denial;
- deep-link denial;
- PDF/export denial where applicable.

---

## 346. Cross-party leakage tests

Specifically:

- Acquirer collaborator cannot fetch hidden Target raw answers;
- Target respondent cannot fetch workspace;
- Viewer cannot fetch raw private docs;
- removed member cannot reuse old URL;
- billing contact cannot fetch Deal;
- consultation email recipient cannot fetch Deal.

---

## 347. Person-level tests

- Deal Administrator cannot fetch raw 42Q;
- Collaborator cannot fetch raw 42Q;
- Viewer cannot fetch raw 42Q;
- client cannot fetch internal type;
- only released recipient-authorized behavior forecast projected.

---

## 348. Revocation tests

Need verify:

- API denies;
- UI removes Deal;
- notifications stop;
- cached navigation does not restore;
- deep links fail;
- invite cannot be replayed.

---

## 349. Audit tests

Every access change creates authoritative event.

---

## 350. No existence leakage tests

Unauthorized endpoint must not leak:

- Deal name;
- pair;
- report count;
- member count;
- evidence metadata.

---

## 351. Уровень доверия

### 351.1. Current collaboration implementation

**Низкий / отсутствует как customer capability.**

Current `main` does not provide full account-backed Deal collaboration.

### 351.2. Current respondent invite infrastructure

**Высокое доверие к существованию primitives:**

- session binding;
- code hash;
- expiry;
- revocation;
- completed state;
- mismatch protection.

Но это evidence collection, не workspace membership.

### 351.3. Target role model

**OWNER-ACCEPTED target design.**

Три client roles:

- Deal Administrator;
- Deal Collaborator;
- Deal Viewer.

Эти role semantics являются controlling design authority для client-side Deal collaboration. Их production use всё ещё требует backend/auth/security implementation gates.

### 351.4. Evidence privacy

**Высокое доверие к boundary:**

- raw respondent answers are not broadcast;
- private evidence can be restricted;
- 42Q requires stronger access controls;
- access ≠ reuse rights.

### 351.5. Exact authentication mechanism

**Не определён.**

### 351.6. Exact collaboration invite TTL

**Не определён.**

### 351.7. Share-link architecture

**Не определена этим документом.**

### 351.8. Value before broader collaboration

Даже creator-only persisted Deal имеет ценность.

Collaboration добавляется только когда backend permission enforcement real.

---

## 352. Что мы сознательно НЕ меняем

1. Deal остаётся primary work object.
2. Public analysis remains usable before account.
3. `Save this deal` остаётся canonical persistence trigger.
4. Email report delivery ≠ account.
5. Consultation contact ≠ account.
6. Billing identity ≠ access.
7. Respondent ≠ collaborator.
8. Current respondent token flow остаётся respondent-only.
9. Canonical questionnaires не меняются.
10. Evidence provenance не меняется от membership.
11. Raw respondent answers не становятся workspace broadcast.
12. 42Q raw/internal data не раскрываются client roles.
13. Private evidence retains item/class restriction.
14. Server remains access authority.
15. `Owner` не используется как client role.
16. Expert/analyst roles остаются internal operational.
17. Generic share links не добавляются.
18. No email-domain auto-enrollment.
19. No organization-wide access by default.
20. Payment does not change evidence rights.
21. Data access does not grant reuse/publication rights.
22. No route is authorized by this file alone.
23. No SSO/OAuth/password mechanism is invented.
24. No public indexing of saved Deals.
25. Report truth remains canonical and versioned.

---

## 353. Acceptance criteria

Контракт проходит только если:

1. Saved Deal defaults private to creator.
2. Collaboration begins only by explicit invite.
3. Client role `Owner` is not used.
4. V1 has Deal Administrator.
5. V1 has Deal Collaborator.
6. V1 has Deal Viewer.
7. Creator becomes Deal Administrator when collaboration is active.
8. Deal Administrator manages client membership.
9. Collaborator cannot manage membership.
10. Viewer is read-only.
11. Last Administrator cannot be removed without transfer.
12. Deal membership is Deal-specific.
13. Organization membership is not inferred.
14. Email domain does not auto-enroll.
15. Workspace role is not evidence authority.
16. Workspace role does not change evidence weight.
17. Respondent is not collaborator.
18. Named-leader participant is not collaborator.
19. Billing contact is not collaborator.
20. Procurement contact is not collaborator.
21. Consultation contact is not collaborator.
22. Email report recipient is not collaborator.
23. Invite is not membership before acceptance.
24. Invite is bound to intended Deal.
25. Invite is bound to intended role.
26. Invite requires verified/authenticated recipient identity.
27. Forwarded invite cannot authorize wrong identity.
28. Pending invite gives no Deal access.
29. Revoked invite gives no Deal access.
30. Expired invite gives no Deal access.
31. Accepted invite transitions to account-backed membership.
32. Collaborator invite does not reuse respondent credential model.
33. Respondent invite remains accountless-capable where governed.
34. Exact collaborator TTL is not invented.
35. Membership revocation is server-enforced.
36. Removed member cannot fetch Deal via old deep link.
37. Revocation is audited.
38. Role changes are audited.
39. Member removal does not delete contributed evidence.
40. Deal identity is not leaked before access decision.
41. Deep links enforce access server-side.
42. IDs/URLs are not authority.
43. No public indexing.
44. No public share link by default.
45. Report viewer does not imply raw evidence access.
46. Role baseline and data-class permission remain separate.
47. Private evidence can be visible/metadata-only/restricted.
48. Deal Administrator is not universal superuser.
49. Raw respondent answers are denied by default to client roles.
50. Cross-party raw evidence is isolated.
51. Respondent identity is minimized.
52. Raw 42Q is denied to all client roles.
53. Internal type/function state is denied to client roles.
54. Named-leader output requires recipient authorization.
55. Paid price does not widen person-level permissions.
56. Analyst rationale is internal.
57. Internal adjudication notes are internal.
58. Client admin cannot assign internal roles.
59. Support does not get default raw Deal access.
60. Internal analyst access is Deal-scoped.
61. Practitioner access is assignment-based.
62. Deny wins over lower-level grant.
63. Unknown sensitive permission fails closed.
64. Missing rights metadata fails closed.
65. Frontend hiding is not authorization.
66. Protected APIs enforce permissions.
67. PDF/export endpoints later enforce same access.
68. Private storage references never become authorization.
69. Membership profile is minimal.
70. Job title does not create access.
71. Seniority does not create access.
72. Organization identity does not create access.
73. Explicit client invitation controls membership.
74. Access does not grant benchmark rights.
75. Access does not grant R&D rights.
76. Access does not grant publication rights.
77. Access does not grant cross-Deal reuse.
78. Client-safe report remains available by role.
79. Person-restricted sections can be withheld independently.
80. One denied section need not break whole Deal page.
81. Membership actions have audit records.
82. Generic analytics do not contain invite email/Deal identity.
83. Security audit is separate from marketing analytics.
84. Invitation email minimizes sensitive Deal disclosure.
85. Invite email contains no questionnaire answers.
86. Member list excludes respondents.
87. Member list excludes billing contacts by default.
88. Member list excludes internal analyst directory.
89. No organization directory in initial v1.
90. No project-management features implied.
91. No comments/chat/tasks invented.
92. No bulk invite/import/SCIM invented.
93. No enterprise SSO claimed.
94. No localStorage authority.
95. No client-only permission check.
96. Authentication mechanism remains separate.
97. Collaboration launch requires security review.
98. Collaboration launch requires data-rights review.
99. Collaboration launch requires backend enforcement.
100. LIVE audit occurs before implementation because this contract audits `main`, not deployed UI.

---


## 353.1. Owner acceptance boundary

**Owner acceptance состоялся 2026-09-16.**

С этого момента `34 v1.0` является **controlling collaboration, access and permissions design contract** для MergeVue.

Owner acceptance включает как controlling target policy:

- private-to-creator default for saved Deal;
- три client roles: `Deal Administrator`, `Deal Collaborator`, `Deal Viewer`;
- prohibition on client role `Owner`;
- separation of workspace membership from respondent, billing, procurement, consultation and report-delivery identities;
- separation of role from data-class/item permission;
- raw respondent-answer firewall;
- 42Q/person-level firewall;
- server-authoritative Deal access;
- explicit collaborator invitation and authenticated acceptance;
- immediate server-side revocation semantics;
- last-Administrator protection;
- least-privilege and deny-wins principles;
- prohibition on email-domain auto-enrollment and public/share-link shortcuts.

Owner acceptance **не означает автоматически**:

- implementation authorization;
- existence of `/deals/:dealId` or other authenticated Deal routes;
- selection of password / magic-link / OAuth / passkey / SSO;
- approval of exact collaborator invite TTL;
- approval of MFA/SCIM/domain administration;
- approval of support break-glass access;
- production readiness of item-level evidence permissions;
- completion of security review;
- completion of data-rights review.

`35_MERGEVUE_SHARING_EXPORT_AND_RECIPIENT_ACCESS_CONTRACT.md` is already separately **OWNER-ACCEPTED**. Therefore, after this acceptance, `35` may rely on the role/permission semantics defined here without treating them as a candidate dependency.


## 354. Implementation sequence

### Фаза 0 — preserve creator-only baseline

- no collaboration UI;
- creator-only persisted Deal;
- server access requirement.

### Фаза 1 — membership data model

Add conceptual:

```text
dealMembershipId
dealId
accountId
role
status
invitedBy
invitedAt
acceptedAt
revokedAt
permissionPolicyVersion
```

Exact schema implementation act.

### Фаза 2 — collaborator invite

Implement:

- authenticated admin action;
- recipient identity;
- role;
- expiry;
- one-time invite acceptance;
- revoke;
- audit.

### Фаза 3 — role enforcement

Implement server checks for:

- Deal access;
- evidence add;
- membership management;
- viewer read-only.

### Фаза 4 — evidence-class enforcement

Integrate:

- private evidence;
- respondent raw answer firewall;
- economic evidence;
- 42Q/person-level restrictions.

### Фаза 5 — member management UI

Only after backend complete.

### Фаза 6 — internal operational access hardening

Separate analyst/support/security policy review.

### Фаза 7 — sharing/export

Move to later dedicated contract; do not implement generic share links here.

---

## 355. Что требует отдельного downstream решения

Следующие параметры intentionally не фиксируются этим file:

1. authentication mechanism;
2. exact collaborator invite TTL;
3. MFA requirement;
4. enterprise SSO;
5. domain allow/block policy;
6. break-glass support access;
7. temporary membership expiry;
8. organization-level administration;
9. public/external share links;
10. download/export policy;
11. Deal lifecycle delete/archive authority;
12. data-retention schedule;
13. security-log retention;
14. notification preferences;
15. comments/tasks/activity collaboration features;
16. enterprise SCIM/directory sync.

Это не licence для дизайнерского default.

---

## 356. Финальная формула

> **MergeVue collaboration is Deal-specific access, not organization-wide visibility.**

> **A collaborator receives only the permissions required to work on the Deal. Membership never creates automatic access to every evidence class, raw respondent answer, private document or person-level record.**

> **Respondents contribute evidence. Collaborators work inside the Deal. Billing and procurement contacts handle commercial process. These identities may belong to the same human, but their permissions never collapse automatically.**

> **The safest default is a private Deal, explicit invitation, authenticated acceptance, least privilege, server-side enforcement and immediate revocation.**
