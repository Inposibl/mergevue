# 36. Контракт уведомлений, коммуникаций и follow-up MergeVue

**Файл:** `36_MERGEVUE_NOTIFICATIONS_COMMUNICATION_AND_FOLLOW_UP_CONTRACT.md`  
**Версия:** 1.0  
**Дата:** 2026-09-16  
**Язык документа:** русский  
**Язык клиентского интерфейса и сообщений:** только American English  
**Рынок первой версии:** США  
**Статус:** **OWNER-ACCEPTED / CONTROLLING NOTIFICATIONS, COMMUNICATION AND FOLLOW-UP DESIGN CONTRACT; НЕ УТВЕРЖДАЕТ, ЧТО NOTIFICATION CENTER, SCHEDULER, SMS, PUSH ИЛИ CONTINUOUS ALERTING УЖЕ РЕАЛИЗОВАНЫ В PRODUCTION**  
**Owner acceptance:** **2026-09-16**  
**Аудитная база `main`:** `92c2e0df199d017082b653e72b5a6bfbf5bf6a31`  
**Связанные документы:** `21`–`23`, `26`–`29`, `33`–`35`  
**Главный принцип:** notification — вторичная коммуникационная проекция уже существующего authoritative state/event. Уведомление не создаёт report release, respondent completion, share authorization, monitoring signal, verification status или commercial state.  
**Ключевые инварианты:** `STATE FIRST, NOTIFICATION SECOND`, `NOTIFICATION ≠ SOURCE OF TRUTH`, `NO FAKE DELIVERY`, `NO FAKE MONITORING`, `ALERT ≠ CHECKPOINT`, `TRANSACTIONAL ≠ MARKETING`, `RESPONDENT ≠ COLLABORATOR`, `RECIPIENT AUTHORITY REQUIRED`, `MINIMIZE SENSITIVE CONTENT`, `NO EMAIL-AS-DATABASE`, `NO INBOX SPAM`, `FAIL CLOSED WHEN RECIPIENT OR EVENT IS UNCERTAIN`

---

## 0. Назначение

Этот документ определяет коммуникационный слой:

```text
Authoritative event / state change
→ notification eligibility
→ recipient resolution
→ channel selection
→ privacy-safe message projection
→ dispatch
→ provider acknowledgement
→ delivery state
→ optional follow-up
→ audit
```

Он отвечает на вопросы:

1. какие события вообще заслуживают уведомления;
2. кому можно отправлять сообщение;
3. какие сообщения обязательны, а какие optional;
4. когда нужен email;
5. когда достаточно in-product status;
6. чем alert отличается от reminder/checkpoint;
7. что считать delivered/sent/read;
8. как работать с respondent reminders;
9. как уведомлять о report release;
10. как уведомлять о collaboration/share access;
11. как уведомлять о verification due;
12. как не превращать monitoring в surveillance;
13. как хранить communication audit;
14. как не смешивать transactional и marketing communication;
15. какие каналы пока запрещено обещать.

---

## 1. Authority boundary

При конфликте применяется:

1. текущая явная Owner-инструкция;
2. applicable security/privacy/legal policy;
3. `34` collaboration/access contract;
4. `35` sharing/export/recipient-access contract;
5. `31` person-level / 42Q restrictions;
6. `29` data-rights contract;
7. `28` monitoring/re-measurement contract;
8. `27` outcome verification contract;
9. `26` report release/forecast lock contract;
10. `23` respondent orchestration contract;
11. current mechanical truth;
12. настоящий target contract.

Notification layer не может расширить права или semantic state.

---

## 2. Current implementation reality

### 2.1. Public report delivery exists

Current `main` has a public report email-capture flow that stores:

- recipient email;
- report ID;
- PDF filename;
- MIME type;
- generated/delivered timestamps;
- optional provider;
- optional message ID.

### 2.2. Consultation communication exists

Current commercial flow can generate a consultation request/email record.

### 2.3. Respondent invite objects exist

Current respondent architecture has:

- invitation/session identity;
- expiry;
- revocation;
- completed state;
- verification capability.

But a complete communication/reminder delivery system is not established by those objects alone.

### 2.4. Missing current capabilities

Audited `main` does not establish a general production:

- notification center;
- notification preference service;
- recurring scheduler;
- reminder queue;
- push notifications;
- SMS service;
- continuous alert engine;
- general event bus for client communications;
- opened/read tracking authority.

Therefore:

> do not expose those capabilities until implementation proves them.

---

## 3. Core model

```text
AUTHORITATIVE EVENT
→ RECIPIENT ELIGIBILITY
→ COMMUNICATION POLICY
→ MESSAGE PROJECTION
→ DISPATCH RECORD
```

Not:

```text
UI needs a notification
→ invent event
```

---

## 4. Notification is not source of truth

Examples:

- email says report ready only because report state is released;
- email says verification due only because authoritative date/window logic says due;
- email says respondent completed only because completion is persisted;
- share email says access granted only because share object is active.

---

## 5. Notification cannot mutate analytical state

Opening/clicking email does not:

- confirm evidence;
- close Decision Gap;
- verify forecast;
- change Environment;
- release report.

---

## 6. Communication classes

Target v1 distinguishes:

1. **Transactional**
2. **Action required**
3. **Time-triggered**
4. **Condition-triggered**
5. **Informational**
6. **Marketing**

Marketing is separate.

---

## 7. Transactional

Examples:

- collaborator invitation;
- secure-share invitation;
- report delivery requested by user;
- commercial request receipt;
- access removed;
- password/auth event when future auth policy requires.

Purpose:

> complete explicit user action.

---

## 8. Action-required

Examples:

- private evidence needed;
- respondent setup incomplete;
- scope confirmation needed;
- rights/legal review blocks requested action.

These should not become generic nagging.

---

## 9. Time-triggered

Examples:

- monitoring checkpoint due;
- verification window opens;
- verification due;
- secure share approaching expiry, if policy permits.

Requires authoritative clock/date + scheduler.

---

## 10. Condition-triggered

Examples:

- monitored watchpoint enters accepted trigger state;
- material evidence contradiction reaches escalation state;
- secure-access/security event requiring action.

Requires real condition engine.

---

## 11. Informational

Examples:

- report released;
- respondent completed;
- evidence review completed;
- new report version available;
- share accessed/downloaded, only if product chooses and knows.

---

## 12. Marketing

Examples:

- product updates;
- newsletters;
- unrelated case studies;
- offers.

Never bundled into transactional consent.

---

## 13. Alert ≠ checkpoint

Per monitoring architecture:

### Alert
Condition-triggered.

### Checkpoint
Time-triggered.

Do not label scheduled reminder as alert.

---

## 14. Reminder ≠ state

A reminder does not imply:

- overdue breach;
- failure;
- analytical weakness.

---

## 15. Notification eligibility

An event may notify only if:

```text
event exists
AND
event is authoritative enough
AND
recipient is eligible
AND
channel is permitted
AND
message can be privacy-safe
AND
notification is useful
```

---

## 16. Event identity

Conceptual:

```text
eventId
dealId?
eventType
sourceObjectId
sourceObjectVersion
occurredAt
actor?
stateBefore?
stateAfter?
```

Not final schema.

---

## 17. Notification object

Conceptual:

```text
notificationId
eventId
recipientIdentity
recipientRoleOrPurpose
channel
messageTemplateVersion
createdAt
dispatchState
providerReference?
deliveredAt?
failedAt?
```

---

## 18. Notification is derived

Do not store unique analytical truth only in notification body.

---

## 19. In-product state first

Workspace should already show current truth.

Email/push is convenience/follow-up.

---

## 20. In-product notification center

Not required for first version.

A Deal-centric `Needs attention` / status surface may be enough.

---

## 21. No notification center theater

Do not create bell icon containing:

- fake demo messages;
- arbitrary activity;
- low-value updates.

---

## 22. V1 channel policy

Initial target channels:

1. **in-product state / action indicator**
2. **email for selected transactional/high-value events**

Not initial default:

- SMS;
- mobile push;
- WhatsApp;
- Slack;
- Teams.

---

## 23. Email is not universal

Do not email every workflow state.

---

## 24. SMS

Not authorized v1.

Requires:

- phone collection;
- consent;
- provider;
- jurisdiction rules;
- opt-out;
- security review.

---

## 25. Push

Not authorized v1.

Requires actual mobile/browser push implementation.

---

## 26. Slack/Teams

Not authorized by this contract.

Separate connector/integration act.

---

## 27. Channel fallback

Do not silently send to another channel if preferred channel fails.

---

## 28. Recipient resolution

Recipient must come from authoritative purpose-specific identity.

---

## 29. Account member

May receive Deal workflow communication if current access allows.

---

## 30. Respondent

Receives only respondent-purpose communication.

Not Deal member messages.

---

## 31. External share recipient

Receives only share/artifact communication.

Not Deal workflow.

---

## 32. Billing contact

Receives commercial/billing communication.

Not evidence/report updates unless separately authorized.

---

## 33. Procurement contact

Receives procurement/security communication.

Not Deal analysis updates.

---

## 34. Consultation contact

Receives consultation/commercial follow-up.

Does not become workspace notification recipient.

---

## 35. Same human, separate purposes

Even if same email is:

- collaborator;
- billing contact;
- respondent;

each notification uses correct purpose/authority.

---

## 36. No identity collapse by email alone

Email equality ≠ permission equality.

---

## 37. Removed member

Must stop receiving future Deal workflow notifications promptly.

---

## 38. Revoked share recipient

Must stop receiving future share-access communications except revocation/security notice if appropriate.

---

## 39. Completed respondent

Should stop receiving completion reminders.

---

## 40. Expired respondent invite

Should not be reminded to complete expired invite.

---

## 41. Revoked respondent invite

No reminder.

---

## 42. Recipient permission recheck

For delayed/scheduled messages:

recheck authority at send time.

---

## 43. Scheduled recipient stale

If recipient lost access after notification was scheduled:

cancel.

---

## 44. Email content minimization

Sensitive email should not contain more Deal information than necessary.

---

## 45. Live M&A confidentiality

Default sensitive subject lines should avoid:

- company pair;
- named executive;
- quantified exposure;
- private evidence title.

until policy confirms safe disclosure.

---

## 46. Safer generic subject

Candidate:

`Action needed in MergeVue`

or:

`A MergeVue report is available`

depending on event.

---

## 47. Public report exception

Public Forecast Brief can use less restrictive copy because content is public-layer output.

---

## 48. Named-leader email

Never put:

- type;
- raw answers;
- behavioral sensitive detail

in subject line.

---

## 49. 42Q participant email

Only:

- invitation purpose;
- access instructions;
- completion/status information.

No result/type.

---

## 50. Raw evidence in email

Never attach/send raw respondent answers automatically.

---

## 51. Private documents in email

No automatic attachments.

Use secure product access.

---

## 52. Paid report attachment

Controlled by `35`.

Notification contract cannot bypass.

---

## 53. Execution Evidence Pack attachment

Controlled by `35`.

---

## 54. Link content

Sensitive links should route through access control.

---

## 55. No permanent bearer secrets

Per `35`.

---

## 56. Report release notification

Authoritative trigger:

```text
REPORT_RELEASED
```

not report generation alone.

---

## 57. Report release copy

Candidate:

`Your report is available.`

This matches `26`.

---

## 58. Do not say sealed unless sealed

Absolute.

---

## 59. Do not say final generically

Use exact:

- report version;
- release state;
- forecast state.

---

## 60. New report version

Could notify relevant Deal members:

`A new report version is available.`

only after release.

---

## 61. Draft update

No external/client notification.

---

## 62. Seal event

Do not notify automatically unless product benefit exists.

`26` already permits silence.

---

## 63. Forecast lock

May be visible in workspace.

Email only if user action/decision benefits.

---

## 64. Verification due

Requires authoritative observation window/date logic.

---

## 65. Verification states

Allowed fixed outcomes remain:

`Confirmed / Partially confirmed / Not determinable / Missed / Falsified`.

Notification does not invent outcome.

---

## 66. Verification reminder

Before outcome review:

`Outcome review is due.`

Not:

`Your prediction result is ready`

unless actual verification record exists.

---

## 67. Verification completed

Can notify:

`Outcome review is available.`

Do not put evaluative result in subject unless policy decides and recipient eligible.

---

## 68. Monitoring checkpoint

Requires active monitoring engagement + real checkpoint date.

---

## 69. Unknown close date

No checkpoint date notification.

---

## 70. Relative future window

Can display in-product.

Do not schedule exact email until date becomes authoritative.

---

## 71. Rescheduled close

Future scheduled checkpoint notifications must recompute/cancel based on governing monitoring logic.

---

## 72. Terminated Deal

Cancel post-close checkpoint notifications.

---

## 73. Monitoring paused

No active checkpoint reminders unless pause policy explicitly permits.

---

## 74. Monitoring completed

No new checkpoint reminders.

---

## 75. Watchpoint observed

Only condition-trigger notification if actual monitored evidence enters governing trigger state.

---

## 76. User-entered observation

System can flag immediately during active session.

That is not continuous monitoring.

---

## 77. No fake continuous alerts

Do not say:

`We'll alert you if this happens`

unless:

- data source is actually monitored;
- scheduler/event engine runs;
- trigger rule exists;
- delivery path exists.

---

## 78. Public web monitoring

Not assumed.

---

## 79. Private-source monitoring

Not assumed.

---

## 80. Connector-based monitoring

Requires separate integration contract.

---

## 81. Respondent invitation

Transactional communication allowed when invite actually created.

---

## 82. Invite copy

Explain:

- purpose;
- who requested input where appropriate;
- time/expiry if known;
- access path;
- privacy/notice links where required.

---

## 83. Invite does not disclose Deal report

---

## 84. Respondent reminder

`23` left this for this contract.

Target policy:

> reminders are optional workflow communication, not methodology pressure.

---

## 85. Respondent reminder eligibility

Only if:

- invite active;
- not completed;
- not revoked;
- not expired;
- reminder sender/requester remains authorized.

---

## 86. No unlimited automated reminders

V1 should not send recurring reminders by default.

---

## 87. Manual reminder first

Preferred initial capability:

`Send reminder`

by authorized requester.

---

## 88. Manual reminder rate limit

Required.

Exact interval/count security/product act.

---

## 89. Automated respondent reminder

Future optional capability.

Requires:

- scheduler;
- preference/policy;
- anti-coercion review;
- rate limits.

---

## 90. No punitive reminder language

Do not:

`You are overdue and blocking the acquisition.`

---

## 91. Neutral respondent copy

Candidate:

`Your MergeVue input is still pending.`

---

## 92. Expiry approaching reminder

Could be useful.

Not enabled until scheduler policy.

---

## 93. Invite expired

Requester may be notified in-product.

Email only if useful.

---

## 94. Respondent completed

Requester may receive:

`Respondent input is complete.`

No raw answers.

---

## 95. Multiple respondents

Do not send full group progress to respondents.

Requester can see authorized status.

---

## 96. Cross-party privacy

Acquirer respondent never receives Target respondent completion/answer information unless purpose allows.

---

## 97. Evidence review completed

Could notify Deal members with access:

`Evidence review is complete.`

Only if review state authoritative.

---

## 98. Evidence conflicting

May create action-required notification if user can actually do something.

---

## 99. No alarm for unknown

Unknown/insufficient evidence is not emergency by itself.

---

## 100. Decision Gap

Could become notification only if:

- new material gap appears;
- user action is relevant.

Do not email every unchanged gap.

---

## 101. Private evidence request

Action-required message can identify category, not sensitive source names.

---

## 102. Evidence upload completed

Uploader does not need email merely because their own upload succeeded unless asynchronous processing matters.

In-product confirmation sufficient.

---

## 103. Evidence processing failed

Action-required notification justified if user must re-upload/fix.

---

## 104. Collaboration invite

Transactional email required when collaboration feature uses email invite.

---

## 105. Collaboration invite acceptance

Inviter may get informational notification.

Not required if workspace status already enough.

---

## 106. Member removed

Removed member can receive transactional access notice if policy permits.

---

## 107. Role changed

Transactional notice recommended for material permission change.

---

## 108. Last-admin transfer

High-value transactional confirmation.

---

## 109. Share invitation

Controlled by `35`.

Email must not leak artifact details before auth where sensitive.

---

## 110. Share access opened

Do not notify sender by default.

Could create noise/surveillance feel.

---

## 111. Share downloaded

Could be audit only.

Not default email.

---

## 112. Share expiry

Optional in-product/email notice to sender if continued access matters.

Requires scheduler.

---

## 113. Share revoked

Recipient may be notified if useful.

No sensitive reason required.

---

## 114. Commercial scope request

After submit:

`Request received.`

Transaction receipt.

---

## 115. Proposal ready

May notify commercial requester.

Not Deal members broadly.

---

## 116. Proposal expiry

`33` default = 30 calendar days.

A reminder before expiry is possible only after scheduler implementation.

Exact reminder day not invented here.

---

## 117. Payment request

Billing contact only.

---

## 118. Payment confirmed

Commercial status only.

Does not mean analysis complete.

---

## 119. Paid scope active

Relevant Deal Administrator/requester may be notified.

---

## 120. Payment failure

Billing contact, not evidence collaborators by default.

---

## 121. Procurement response

Procurement contact only.

---

## 122. Security-review status

No Deal evidence details.

---

## 123. Account/security events

Future auth policy controls:

- new sign-in;
- password reset;
- MFA;
- suspicious access.

Security notifications may be mandatory.

---

## 124. Security notifications cannot be disabled casually

Separate security policy.

---

## 125. Notification preferences model

Need category-level, not every micro-event.

---

## 126. Preference classes

Conceptual:

```text
ESSENTIAL_TRANSACTIONAL
DEAL_WORKFLOW
MONITORING
SHARING
COMMERCIAL
MARKETING
```

---

## 127. Essential transactional

Cannot be globally disabled when necessary to complete/security-govern user action.

Examples:

- collaborator/share invite;
- access revoked;
- security alert;
- requested report delivery.

---

## 128. Deal workflow

Optional email preference may include:

- report released;
- respondent completed;
- evidence review ready;
- action required.

---

## 129. Monitoring

Optional email preference may include:

- checkpoint due;
- verification due;
- re-measurement ready;
- condition alert if monitoring engine real.

---

## 130. Sharing

Optional sender notifications:

- share expiry;
- access issue.

Recipient invitation itself transactional.

---

## 131. Commercial

Separate transactional/commercial preference.

Invoice/payment notices may be required.

Marketing not bundled.

---

## 132. Marketing

Separate explicit consent.

---

## 133. Default preference philosophy

Do not default every optional category to high-frequency email.

---

## 134. V1 preferences surface

Can remain simple:

```text
Email me about deal actions that need my attention
Email me when a report or review is ready
Email me about monitoring checkpoints
```

only after capabilities exist.

---

## 135. No settings page solely for nonexistent preferences

---

## 136. Recipient-level preference

Preference belongs to identity/purpose.

Respondent may need separate communication preference from collaborator.

---

## 137. Deal-specific mute

Useful future:

mute nonessential Deal workflow emails while retaining in-product status.

Not required first implementation.

---

## 138. Essential event override

Security/transactional can bypass mute when necessary and lawful.

---

## 139. Timezone

Time-triggered email requires recipient/user timezone or clear Deal/time authority.

---

## 140. No invented timezone

If unknown:

avoid local-clock promise.

---

## 141. Date display

Use unambiguous American English date/time.

---

## 142. Quiet hours

Not required v1.

---

## 143. Digest

Not required v1.

---

## 144. Daily/weekly digest

Could later reduce noise.

Not default.

---

## 145. Frequency cap

Needed before automated workflow email.

Exact number later.

---

## 146. Deduplication

One authoritative event should not create duplicate emails due to retries.

---

## 147. Idempotency key

Conceptual:

```text
eventId + recipient + channel + templateVersion
```

or equivalent.

---

## 148. Retry

Provider failure may retry.

Must not duplicate after confirmed send/delivery state.

---

## 149. Dispatch states

Target distinction:

```text
QUEUED
SENT_TO_PROVIDER
DELIVERED
BOUNCED
FAILED
CANCELLED
```

Only use states provider/system actually knows.

---

## 150. Current public `delivered` caveat

Current public report flow records `delivered`.

Production architecture must align that label with provider truth.

---

## 151. Sent ≠ delivered

Provider acceptance ≠ mailbox delivery.

---

## 152. Delivered ≠ read

---

## 153. Opened ≠ understood

---

## 154. Clicked ≠ action completed

---

## 155. No fake engagement metrics

---

## 156. Read/open tracking

Not v1 requirement.

Privacy implications.

---

## 157. Pixel tracking

Not default.

---

## 158. Link tracking

Only security/audit where needed.

Not marketing behavior analytics by default.

---

## 159. Bounce

If email bounces:

- mark communication failed/bounced;
- do not change underlying Deal state;
- surface action if needed.

---

## 160. Invalid recipient

Fail before dispatch where possible.

---

## 161. Repeated bounce

May require recipient update.

No silent replacement.

---

## 162. Alternate email

User must explicitly provide/verify.

---

## 163. Provider outage

Queue/retry according to delivery architecture.

Do not mark event undone.

---

## 164. Notification outage

Workspace source-of-truth remains accessible.

---

## 165. Email unavailable

Critical workflow should not rely solely on email if authenticated product exists.

---

## 166. No email-as-database

Email history is not audit source.

---

## 167. Audit event

Communication audit should preserve:

- event ID;
- recipient;
- purpose/category;
- template version;
- channel;
- dispatch timestamps;
- provider reference if available;
- final known status.

---

## 168. Message content retention

Policy/security decision.

Audit may store template/version + variables rather than full sensitive body.

---

## 169. Sensitive variables

Minimize.

---

## 170. Provider metadata

Internal only.

---

## 171. Client-visible notification history

Not required v1.

---

## 172. Activity history

Could show meaningful workflow events separate from notifications.

---

## 173. Activity ≠ notification

Event may be recorded without email.

---

## 174. Notification center ≠ activity feed

Do not conflate.

---

## 175. Needs-attention surface

Better first authenticated pattern:

```text
Needs attention
- Review evidence request
- Respondent input pending
- Outcome review due
```

only real current actions.

---

## 176. No “3 notifications” for informational noise

---

## 177. Priority

Only use priority when grounded in action/materiality.

---

## 178. Urgent

Reserved for genuine deadline/security/material trigger.

---

## 179. Red badge

Do not use for normal waiting.

---

## 180. Expired respondent invite

Neutral.

---

## 181. Verification due

Action-needed, not emergency by default.

---

## 182. Monitoring condition alert

May be high priority only if governing risk/control rule says so.

---

## 183. No severity invention

Notification layer cannot invent High/Medium/Low risk.

---

## 184. Subject line language

Concise, factual.

---

## 185. No fear language

Not:

`Critical culture risk detected!`

---

## 186. No false urgency

Not:

`Act now!`

unless actual bounded deadline.

---

## 187. No sales copy in analytical notifications

---

## 188. No cross-sell in respondent invite

---

## 189. No promotional footer in sensitive Deal notifications

Except minimal product/legal footer.

---

## 190. CTA must map to real action

Examples:

`View report`

`Review evidence request`

`Open checkpoint`

`Complete input`

`Review shared report`

---

## 191. Dead CTA forbidden

---

## 192. CTA authority

Link destination still enforces auth/access.

---

## 193. Deep-link privacy

Do not reveal Deal before auth.

---

## 194. Return intent

After auth, return to relevant Deal/action.

---

## 195. Expired action link

Show bounded state.

---

## 196. Mobile email

Readable and one primary action.

---

## 197. Accessibility

Email/in-product notices:

- meaningful subject/header;
- semantic HTML;
- keyboard accessible links/buttons;
- sufficient contrast;
- not color-only;
- plain-text fallback where infrastructure supports;
- no image-only critical content.

---

## 198. Localization

V1 client communication only American English.

---

## 199. No mixed-language email

---

## 200. Date format

Prefer explicit month name where ambiguity matters:

`September 16, 2026`.

---

## 201. Timezone label

Include if deadline/time exact.

---

## 202. Relative time

`in 2 days`

only if computed reliably.

---

## 203. Reminder timing

No exact default schedule set in this contract.

---

## 204. Why timing remains open

Depends on:

- invitation expiry;
- checkpoint date;
- commercial proposal validity;
- user preferences;
- anti-spam/coercion policy.

---

## 205. Follow-up object

Conceptual:

```text
followUpId
sourceEventId
reason
eligibleAt
cancelCondition
recipient
status
```

---

## 206. Follow-up cancellation

Must cancel when:

- action completed;
- invite revoked;
- recipient loses access;
- event superseded;
- Deal terminated;
- monitoring paused/completed.

---

## 207. No stale reminders

Critical.

---

## 208. Superseded report

Do not remind user to review v2 if v3 already released and v2 action obsolete.

---

## 209. Duplicate respondent invite

Do not send reminders from obsolete invite.

---

## 210. Commercial proposal superseded

Do not remind about expired/superseded proposal.

---

## 211. Share revoked

Cancel expiry/usage follow-ups.

---

## 212. Verification completed

Cancel verification-due reminders.

---

## 213. Checkpoint completed

Cancel checkpoint reminder.

---

## 214. Condition alert resolved

Do not continue repeated alert unless policy says recurrence.

---

## 215. Repeated condition

Needs dedup/cooldown logic.

Exact cooldown later.

---

## 216. Escalation path

If notification ignored:

do not automatically escalate to executive unless policy exists.

---

## 217. Human escalation

Commercial/operational process separate.

---

## 218. Respondent escalation

No manager escalation by default.

Could be coercive.

---

## 219. Named-leader participant

No escalation to employer by default.

---

## 220. Confidentiality

Recipient list itself may be sensitive.

---

## 221. BCC/CC

Sensitive Deal emails should avoid broad CC.

---

## 222. Distribution lists

Not default.

---

## 223. Group notifications

Use individual authorized recipients where possible.

---

## 224. Deal Administrator

Can receive workspace workflow notifications according to preference.

---

## 225. Deal Collaborator

Only events relevant to actions/access.

---

## 226. Deal Viewer

Mostly report-ready/version events if opted in.

No evidence-action reminders.

---

## 227. Role change

Recipient event eligibility recomputed.

---

## 228. No broadcast-to-all Deal members by default

Each event has intended audience.

---

## 229. Report released audience

Could be:

- requester;
- relevant Deal members with report access.

Not every respondent/billing contact.

---

## 230. Respondent completed audience

Requester/admin with authorized workflow visibility.

Not Viewer necessarily.

---

## 231. Private evidence review audience

Relevant contributor/requester, not all members.

---

## 232. Named-leader output ready audience

Only authorized recipient set from `31`/`34`.

---

## 233. Economic exposure update audience

Members with report/economic access.

No billing recipient by default.

---

## 234. Verification outcome audience

Those with access to underlying forecast/report.

---

## 235. Execution Pack ready audience

Requester/authorized recipients, not all Deal members.

---

## 236. Security event audience

Affected user/security operations per security policy.

---

## 237. System error

Do not send raw stack trace.

---

## 238. Provider error

No internal provider name in client copy unless needed.

---

## 239. Internal governance terms

Never include:

- Owner accepted;
- IV PASS;
- CORR;
- hidden model/provider routing.

---

## 240. Template versioning

Messages are versioned content assets.

---

## 241. Event/template compatibility

Template must only reference fields guaranteed by event schema.

---

## 242. Missing field

Omit or block.

Do not invent.

---

## 243. Placeholder leakage

Fail release.

No:

`{{deal_name}}`

in sent messages.

---

## 244. Test recipients

Production test mode must not use real client addresses casually.

---

## 245. Environment separation

Dev/staging/prod notification dispatch separated.

---

## 246. Sandbox suppression

Non-production can suppress sends.

---

## 247. Test mode labeling

Internal.

Do not send `TEST` messages to clients unless intended.

---

## 248. Notification security testing

Before launch:

- authorization;
- recipient resolution;
- link access;
- token leakage;
- stale schedule cancellation;
- duplicate send;
- wrong-Deal leakage.

---

## 249. Cross-Deal leakage test

Deal A event cannot notify Deal B member.

---

## 250. Cross-party leakage test

Respondent-side rules preserved.

---

## 251. Person-level leakage test

42Q/named-leader raw content never enters notification variables.

---

## 252. Share-recipient leakage test

Share recipient receives no workspace event emails.

---

## 253. Billing leakage test

Billing contact receives no Deal evidence email.

---

## 254. Removed-member test

No future scheduled messages.

---

## 255. Report-version test

Notification references exact released version.

---

## 256. Verification-date test

No due email before governing window.

---

## 257. Monitoring-date test

No checkpoint email if close not confirmed.

---

## 258. Termination test

No post-close reminders after Deal terminated.

---

## 259. Idempotency test

Retry does not duplicate.

---

## 260. Bounce/failure test

Underlying state remains unchanged.

---

## 261. Provider acknowledgement test

`sent/delivered` semantics honest.

---

## 262. Accessibility test

Email/readable action path.

---

## 263. Preference test

Optional email respects preference.

---

## 264. Marketing separation test

Transactional action does not subscribe marketing.

---

## 265. Unsubscribe

Marketing unsubscribe separate.

Do not use marketing unsubscribe to disable essential security messages.

---

## 266. Deal workflow opt-out

Future preference control.

---

## 267. Respondent communication opt-out

Must balance voluntary participation and active invite.

Legal/product policy required.

---

## 268. Participant withdrawal

`31` withdrawal immediately stops downstream person-analysis use and future unnecessary reminders.

---

## 269. Data deletion request

Should not trigger promotional follow-ups.

---

## 270. Archived Deal

No nonessential workflow notifications by default.

---

## 271. Historical report

No periodic “check-in” marketing masquerading as Deal notification.

---

## 272. Inactivity reminder

Not v1.

---

## 273. “Come back to MergeVue”

Marketing/product engagement message, not transactional.

Separate consent.

---

## 274. Upsell reminder

Commercial/marketing, not Deal workflow.

---

## 275. Scope upgrade suggestion

Can appear in-product when new Decision Gap justifies.

Do not email repeatedly.

---

## 276. Paid analysis recommended

One contextual notification may be legitimate if user asked for deeper analysis.

Not recurring sales campaign.

---

## 277. Commercial proposal expiry

Transactional commercial event, not marketing.

---

## 278. Renewal

Monitoring commercial renewal separate policy.

---

## 279. No subscription renewal email until subscription model exists

---

## 280. Monitoring commercial state

`33` says monitoring not bundled/recurring in v1.

Notification layer cannot imply subscription.

---

## 281. Monitoring checkpoint communication

Can exist for separately active monitoring scope.

---

## 282. Event sourcing preference

Where feasible, notification triggers from durable authoritative events.

Not browser navigation.

---

## 283. Browser event is insufficient

Opening report page does not create `report_released`.

---

## 284. Client clock insufficient

Date-trigger events computed server-side.

---

## 285. Scheduler source

Future durable scheduler/job queue.

Not set here.

---

## 286. No setTimeout-as-production scheduler

---

## 287. Deployment/restart persistence

Scheduled notifications must survive production restarts once claimed.

---

## 288. Exactly-once illusion

System should use idempotency rather than claiming perfect exactly-once transport.

---

## 289. Provider duplicates

Deduplicate at product layer as feasible.

---

## 290. Delivery ordering

If v3 released before delayed v2 email:

cancel obsolete v2 notification.

---

## 291. Event priority ordering

Security revocation overrides scheduled access reminders.

---

## 292. Notification TTL

Some messages become stale.

Do not send after relevance window.

---

## 293. Queue lag

If stale by dispatch time:

cancel.

---

## 294. Event supersession

Explicit relationship.

---

## 295. Audit reason for cancellation

Useful internally:

`action_completed`

`access_revoked`

`superseded`

`deal_terminated`

---

## 296. In-product unread state

Not required v1.

---

## 297. Mark as read

Not required v1.

---

## 298. Notification archive

Not required v1.

---

## 299. Search notifications

Not needed.

---

## 300. Notification preferences route

No route authorized by this file alone.

---

## 301. Bell icon

No until enough real event volume.

---

## 302. Deal-local messages

Preferred first.

---

## 303. Global messages

Only security/account/global system matters.

---

## 304. System outage banner

Separate operational status capability.

---

## 305. Maintenance notification

Operational product communication.

Not Deal-specific.

---

## 306. Incident notification

Security/operations policy.

---

## 307. Notification metrics

Useful:

- queued;
- sent;
- failed;
- bounced;
- action completed after message.

But avoid vanity opens.

---

## 308. Success metric

Did notification help user perform relevant action without excess noise?

---

## 309. Notification fatigue metric

Monitor:

- opt-outs;
- repeated ignores;
- duplicate rate;
- unnecessary sends.

---

## 310. No optimization toward click-through alone

Could incentivize fear/urgency.

---

## 311. Content governance

Notification claims follow `08` content/claims rules.

---

## 312. Methodology claims

No oversimplified:

`Culture risk increased`.

unless report state supports exact statement.

---

## 313. Economic claims

No dollar amount in subject.

Body only if recipient authorized and current report permits.

---

## 314. Person-level claims

No sensitive behavior detail in subject.

---

## 315. Public-source event

If used for monitoring later, notification must distinguish:

`New public evidence detected`

from:

`Risk confirmed`.

---

## 316. Evidence detection ≠ adjudication

Critical.

---

## 317. Monitoring alert pipeline

Future correct sequence:

```text
source event
→ admissibility/provenance
→ governing watchpoint test
→ trigger state
→ notification
```

Not:

```text
web headline
→ alert client
```

---

## 318. Verification pipeline

```text
window due
→ outcome evidence process
→ verification result
→ optional result notification
```

---

## 319. No auto verdict from scraped outcome

Per `26/27`.

---

## 320. Human exception

If event requires review before client notification:

hold message until authority state final.

---

## 321. Notification preview for operator

Possible for unusual high-sensitivity messages.

---

## 322. Automated low-risk transactional

Can dispatch without human review after templates/logic accepted.

---

## 323. High-sensitivity external message

May require review based on policy.

---

## 324. Named-leader release notification

High sensitivity.

Recommended minimal:

`A restricted Deal analysis is available.`

No subject detail.

---

## 325. 42Q invitation

Legal/privacy notice links accurate.

---

## 326. Respondent consent state

No reminder after withdrawal.

---

## 327. Private-evidence request

Do not expose restricted document title to unauthorized user.

---

## 328. Collaboration invitation

Deal detail minimized before auth per `34`.

---

## 329. Share invitation

Same per `35`.

---

## 330. Commercial communication

Use MergeVue brand.

Remove legacy Structural Typology address/copy when actual brand migration implemented.

---

## 331. Current consultation destination

Existing `info@structural-typology.academy` is legacy implementation detail, not target client communication authority.

---

## 332. Sender identity

Future production email must use authorized MergeVue sender/domain.

Exact domain not invented here.

---

## 333. Reply-to

Operational policy.

Do not use no-reply if human response required.

---

## 334. Support address

Not invented.

---

## 335. Email authentication

SPF/DKIM/DMARC operational security requirement when production domain configured.

Exact records separate.

---

## 336. Bounce handling

Production email provider should support.

---

## 337. Abuse/complaint handling

Required for scaled email.

---

## 338. Suppression list

Marketing and operational distinctions need care.

Not specified here.

---

## 339. Legal footer

Only approved legal text.

---

## 340. Physical address requirement

Marketing-law question, not invented in product spec.

---

## 341. Retention

Notification/audit retention follows data policy.

No days invented.

---

## 342. Sensitive email body retention

Minimize provider persistence where possible under policy.

---

## 343. Provider training/use

External provider terms must be reviewed.

Do not claim.

---

## 344. PII minimization

Email address + minimum context.

---

## 345. Data residency

Provider/security decision.

---

## 346. International recipient

Jurisdiction/legal policy.

Not automatic denial.

---

## 347. Time-sensitive legal notice

Separate from normal product notifications.

---

## 348. Production readiness gate

Before first general automated notification system:

- durable event identity;
- recipient authority;
- template governance;
- preference model;
- email provider truth states;
- idempotency;
- retry;
- stale cancellation;
- access-safe links;
- audit;
- security/privacy review.

---

## 349. Monitoring notification readiness gate

Additional:

- authoritative monitoring engagement;
- confirmed close/date;
- watchpoint/checkpoint objects;
- scheduler;
- trigger rule;
- cancellation logic.

---

## 350. Condition alert readiness gate

Additional:

- real data ingestion;
- accepted condition rule;
- provenance/admissibility;
- dedup/cooldown;
- false-alert review.

---

## 351. Respondent reminder readiness gate

Additional:

- active invitation state;
- voluntary/non-coercive copy;
- reminder rate limits;
- completion/revocation cancellation.

---

## 352. Уровень доверия

### 352.1. Current notification infrastructure

**Низкое как general product capability.**

No general notification center/scheduler/alert engine established.

### 352.2. Public email delivery primitive

**Высокое доверие к существованию.**

It is narrow public-report distribution.

### 352.3. Consultation email primitive

**Высокое доверие к existence of current commercial email path.**

### 352.4. Respondent invite state

**Высокое доверие к invite lifecycle primitives.**

Communication delivery/reminders remain separate.

### 352.5. Report-ready notification semantic

**Высокая authority** from `26`:

`Your report is available.` only after release.

### 352.6. Monitoring notification categories

**Supported as future target** by `28`:

- checkpoint due;
- watchpoint observed;
- intervention review due;
- re-measurement available.

No channel promise yet.

### 352.7. SMS / push / continuous monitoring

**Not established.**

### 352.8. Target v1 communication architecture

**OWNER-ACCEPTED target design:**

- in-product state first;
- selective email;
- no general notification center requirement;
- no SMS/push;
- manual respondent reminder before automation;
- no fake alerts.

---

## 353. Что мы сознательно НЕ меняем

1. Workspace state remains source of truth.
2. Report release remains controlled by `26`.
3. Verification remains controlled by `27`.
4. Monitoring remains controlled by `28`.
5. Data rights remain controlled by `29`.
6. 42Q restrictions remain controlled by `31`.
7. Collaboration permissions remain controlled by accepted `34`.
8. Sharing permissions remain controlled by accepted `35`.
9. Respondent invite lifecycle remains `23`.
10. Public report email flow remains available.
11. Email delivery does not create account.
12. Respondent does not become collaborator.
13. Billing/procurement identities remain separate.
14. Marketing consent remains separate.
15. No SMS is introduced.
16. No push is introduced.
17. No Slack/Teams is introduced.
18. No notification center is required.
19. No continuous monitoring claim is introduced.
20. No automated web surveillance is introduced.
21. No raw respondent answers are emailed.
22. No raw 42Q/type is emailed.
23. No private evidence attachments by default.
24. No new route is authorized here.
25. No email provider is selected here.

---

## 354. Acceptance criteria

Contract passes only if:

1. Notifications derive from authoritative events.
2. Notifications never become source of truth.
3. Notification cannot mutate analytical state.
4. Transactional communication is distinct from marketing.
5. Alert is distinct from checkpoint.
6. Reminder is distinct from state.
7. Recipient authority is resolved before send.
8. Delayed sends recheck recipient authority.
9. Removed members stop receiving Deal workflow notices.
10. Revoked share recipients stop relevant future notices.
11. Completed respondents stop reminders.
12. Expired/revoked invites do not receive reminders.
13. Same email does not collapse identity purposes.
14. Sensitive emails minimize Deal detail.
15. Company pair not required in sensitive subject.
16. Named leader/type not in subject.
17. Raw respondent answers not emailed.
18. Raw 42Q/type not emailed.
19. Private docs not automatically attached.
20. Paid report attachments remain governed by `35`.
21. Execution Pack attachments remain governed by `35`.
22. Public report delivery remains supported.
23. Report release notification only after `REPORT_RELEASED`.
24. Copy does not claim seal unless sealed.
25. Draft reports do not trigger client-ready messages.
26. New report version only notifies after release.
27. Seal event email is optional, not automatic.
28. Verification due requires authoritative timing.
29. Verification result only after authoritative verification record.
30. Fixed verification vocabulary preserved.
31. Monitoring checkpoint requires active monitoring + real date.
32. Unknown close date does not schedule exact checkpoint.
33. Rescheduled close updates future scheduled notifications.
34. Terminated Deal cancels post-close reminders.
35. Paused/completed monitor cancels applicable reminders.
36. Watchpoint alert requires real condition rule.
37. User-session flag is not called continuous alerting.
38. Public/private continuous monitoring not claimed without infrastructure.
39. Respondent invitation is transactional.
40. Respondent reminder only for active incomplete invite.
41. V1 does not auto-repeat respondent reminders.
42. Manual reminder is preferred first capability.
43. Reminder language is non-coercive.
44. Respondent completed notification includes no raw answers.
45. Cross-party evidence privacy preserved.
46. Evidence review notification requires authoritative review state.
47. Unknown evidence is not alarm by itself.
48. Decision Gap email only when material/actionable.
49. Collaboration invite governed by `34`.
50. Share invite governed by `35`.
51. Share open/download is audit-first, not spam.
52. Commercial scope request has transaction receipt.
53. Proposal ready goes to commercial requester.
54. Billing messages go to billing identity.
55. Payment confirmation does not imply analysis completion.
56. Procurement updates do not carry Deal evidence.
57. Security notices governed separately and may be mandatory.
58. V1 channels are in-product + selective email.
59. SMS not claimed.
60. Push not claimed.
61. Slack/Teams not claimed.
62. Optional workflow email preferences are category-level.
63. Marketing requires separate consent.
64. Marketing unsubscribe does not disable essential security notices.
65. No settings surface before preferences are real.
66. Time-trigger message needs authoritative time/timezone handling.
67. Exact reminder cadence not invented here.
68. Follow-ups cancel on completion/revocation/supersession.
69. No stale reminders.
70. No reminders for superseded report/proposal/invite.
71. No executive escalation without policy.
72. No respondent-manager escalation by default.
73. No broadcast to all Deal members by default.
74. Event audience is purpose-specific.
75. Deal Viewer does not receive evidence-action reminders by default.
76. 42Q/named-leader output-ready audience is restricted.
77. Notification claim uses exact source state.
78. No fear language.
79. No false urgency.
80. No sales language in analytical workflow notices.
81. CTA maps to real action.
82. CTA destination rechecks auth.
83. Deep links do not leak Deal before auth.
84. Messages are accessible.
85. American English only for client messages.
86. Dates/times are unambiguous.
87. Idempotency prevents duplicate sends.
88. Retry does not duplicate confirmed dispatch.
89. Dispatch states distinguish queued/sent/delivered/bounced/failed.
90. Sent is not delivered.
91. Delivered is not read.
92. Read/open tracking not assumed.
93. Bounce does not alter underlying state.
94. Provider outage does not undo authoritative event.
95. Email is not audit source.
96. Communication audit stores event/recipient/channel/template/status.
97. Sensitive content retention minimized.
98. Provider metadata stays internal.
99. Notification center is not activity feed.
100. Needs-attention surface contains only real actions.
101. Priority/urgent labels require real basis.
102. Notification layer does not invent severity.
103. Template version is stored.
104. Missing template field does not get invented.
105. Placeholder leakage is blocked.
106. Non-production send separation exists.
107. Authorization tests cover cross-Deal leakage.
108. Tests cover respondent/collaborator separation.
109. Tests cover person-level leakage.
110. Tests cover billing/share recipient separation.
111. Tests cover removed-member scheduling cancellation.
112. Tests cover report-version accuracy.
113. Tests cover verification/monitoring date gates.
114. Marketing separation tested.
115. No subscription renewal message until recurring product exists.
116. Event triggers prefer durable server events.
117. Browser navigation cannot create authoritative notification event.
118. Server time controls scheduled events.
119. Production scheduler must be durable before timing claims.
120. Obsolete queued notifications cancel before dispatch.
121. Queue lag cannot send materially stale message.
122. Internal cancellation reason is auditable.
123. Global bell icon not required.
124. Deal-local communication is preferred first.
125. System errors do not leak stack/provider internals.
126. Internal governance vocabulary never enters client messages.
127. Monitoring external-source alert pipeline preserves admissibility/adjudication.
128. Detected public evidence is not called confirmed risk.
129. Human review can hold high-sensitivity message.
130. Human review cannot override hard privacy prohibition.
131. Named-leader release message remains minimal.
132. 42Q participant messages do not reveal results.
133. Participant withdrawal stops unnecessary reminders.
134. Private evidence request does not leak restricted source name.
135. Collaboration/share invitation minimizes details before auth.
136. Target sender identity eventually uses MergeVue brand.
137. Legacy consultation email address is not target brand authority.
138. Email authentication/security is required before scaled production email.
139. Notification retention follows accepted data policy.
140. LIVE audit occurs before implementation because this document audits `main`, not deployed production.

---


## 354.1. Owner acceptance boundary

**Owner acceptance состоялся 2026-09-16.**

С этого момента `36 v1.0` является **controlling notifications, communication and follow-up design contract** для MergeVue.

Owner acceptance включает как controlling target policy:

- `STATE FIRST, NOTIFICATION SECOND`;
- notification never becomes source of truth;
- initial v1 channels = in-product state + selective transactional email;
- no SMS / push / Slack / Teams by default;
- no general notification center requirement;
- alert/checkpoint/reminder separation;
- recipient-purpose separation across collaborator, respondent, share recipient, billing, procurement and consultation identities;
- manual respondent reminder before automation;
- cancellation of stale follow-ups after completion/revocation/expiry/supersession;
- exact report/verification/monitoring state must precede communication;
- sent/delivered/read remain distinct;
- transactional communication remains separate from marketing;
- no raw respondent answers, raw 42Q/type/function, or private-document content in notification messages;
- no fake continuous monitoring or alert promises without real ingestion/scheduler/trigger infrastructure.

Owner acceptance **не означает автоматически**:

- implementation authorization;
- selection of a production email provider;
- authorization of a sender domain/address;
- existence of a durable scheduler;
- existence of automated respondent reminders;
- existence of continuous monitoring;
- existence of SMS/push/Slack/Teams channels;
- approval of exact reminder cadence/frequency caps;
- approval of open/read tracking;
- approval of a notification-center route or UI;
- completion of privacy/security/legal review for production messaging.

Downstream implementation/security/legal decisions remain those listed in §356. Until they are separately resolved, the product must follow the fail-closed behavior defined in this contract rather than inventing communication defaults.


## 355. Implementation sequence

### Phase 0 — preserve current narrow flows

Keep:

- public report email delivery;
- consultation request email path;
- respondent invite objects.

Do not claim general notifications.

### Phase 1 — durable communication event model

Implement:

- authoritative event reference;
- recipient;
- category;
- template version;
- dispatch audit;
- idempotency.

### Phase 2 — selected transactional email

Start with:

- collaboration invite;
- secure-share invite;
- report released;
- commercial request receipt;
- respondent invitation.

Only where upstream capability exists.

### Phase 3 — Deal-local needs-attention

Add bounded authenticated surface for real current actions.

No global bell required.

### Phase 4 — respondent reminders

First:

- authorized manual reminder;
- active invite check;
- rate limiting;
- cancellation on complete/revoke/expire.

### Phase 5 — scheduler

Only when time-trigger needs are real:

- verification due;
- checkpoint due;
- share/proposal expiry.

Must be durable/restart-safe.

### Phase 6 — monitoring alerts

Only after:

- monitoring data ingestion;
- accepted trigger rules;
- provenance;
- dedup;
- false-alert controls.

### Phase 7 — preferences

Add user-facing optional categories when enough notifications exist to justify settings.

---

## 356. Downstream decisions still required

The following are deliberately not invented:

1. production email provider;
2. MergeVue sender domain/address;
3. exact respondent-reminder interval/count;
4. exact frequency caps;
5. exact notification preference defaults;
6. exact share-expiry reminder timing;
7. exact proposal-expiry reminder timing;
8. quiet hours;
9. digest policy;
10. opened/read tracking;
11. mobile/browser push;
12. SMS;
13. Slack/Teams integration;
14. notification retention schedule;
15. bounce/suppression operational policy;
16. support/escalation ownership;
17. security-notification specifics;
18. legal email footer/copy;
19. exact monitoring alert cooldown;
20. notification-center route/UI.

These remain implementation/security/legal decisions, not designer defaults.

---

## 357. Финальная формула

> **MergeVue does not notify because a screen changed. It notifies because an authoritative event occurred and a specific authorized person needs to know or act.**

> **The Deal, report, forecast, monitoring record and verification record remain the source of truth. Email and in-product messages are only projections of that truth.**

> **A checkpoint is scheduled. An alert is triggered. A reminder follows an unfinished action. Those are different objects and must not be collapsed into one generic notification stream.**

> **The safest first version is small: accurate in-product state, selective transactional email, no SMS/push, no fake continuous monitoring, no unlimited reminders, and strong cancellation when the underlying action is complete, revoked, expired or superseded.**
