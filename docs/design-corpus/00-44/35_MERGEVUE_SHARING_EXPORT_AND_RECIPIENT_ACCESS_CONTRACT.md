# 35. Контракт обмена, экспорта и доступа получателей MergeVue

**Файл:** `35_MERGEVUE_SHARING_EXPORT_AND_RECIPIENT_ACCESS_CONTRACT.md`  
**Версия:** 1.0  
**Дата:** 2026-09-16  
**Язык документа:** русский  
**Язык клиентского интерфейса:** только American English  
**Рынок первой версии:** США  
**Статус:** **OWNER-ACCEPTED / CONTROLLING SHARING, EXPORT AND RECIPIENT ACCESS DESIGN CONTRACT; НЕ УТВЕРЖДАЕТ, ЧТО SECURE SHARING / EXTERNAL RECIPIENT ACCESS УЖЕ РЕАЛИЗОВАНЫ В PRODUCTION**  
**Owner acceptance:** **2026-09-16**  
**Аудитная база `main`:** `92c2e0df199d017082b653e72b5a6bfbf5bf6a31`  
**Связанные документы:** `21`, `22`, `24`, `26`, `29`, `30`, `31`, `34`  
**Зависимость:** role/permission semantics из `34` используются как target dependency. **Owner acceptance этого `35` не повышает `34` до controlling authority**: пока `34` не Owner-accepted отдельно, его role/permission semantics остаются candidate dependency и применяются здесь только как условная target-ссылка.  
**Главный принцип:** sharing/export не создаёт новых прав на данные. Любой экспорт или внешняя передача — это recipient-specific projection конкретного authoritative artifact/version, сформированный после purpose, rights, audience и permission checks.  
**Ключевые инварианты:** `SHARING ≠ MEMBERSHIP`, `EXPORT ≠ RIGHTS EXPANSION`, `RECIPIENT ≠ COLLABORATOR`, `PDF ≠ SOURCE OF TRUTH`, `RELEASED VERSION ONLY`, `NO ANYONE-WITH-LINK DEFAULT`, `RECIPIENT-SPECIFIC DISCLOSURE`, `REVOKE FUTURE ACCESS, NOT HISTORY`, `DOWNLOAD ≠ RECALLABLE`, `42Q RAW NEVER EXPORTS`, `INTERNAL TYPE NEVER EXPORTS`, `PRIVATE EVIDENCE REMAINS RESTRICTED`, `AUDIENCE/PURPOSE EXPLICIT`, `NO PARALLEL REPORT TRUTH`

---

## 0. Назначение

Этот документ определяет путь:

```text
Authoritative Deal/report artifact
→ user chooses Share / Export
→ intended recipient / audience selected
→ purpose declared
→ rights and permission gate
→ disclosure projection generated
→ immutable distribution artifact/version
→ delivery / recipient access
→ expiry / revocation where applicable
→ audit trail
```

Он отвечает на вопросы:

1. что можно экспортировать;
2. что можно отправлять внешнему получателю;
3. чем внешний recipient отличается от Deal Viewer;
4. нужен ли recipient account;
5. как работать с PDF/download;
6. когда возможен secure web access;
7. можно ли отозвать доступ;
8. что означает expiry;
9. можно ли использовать `Anyone with the link`;
10. как redaction/disclosure filtering соотносится с source truth;
11. как обращаться с private evidence;
12. как обращаться с named-leader output;
13. что можно включать в Execution Evidence Pack;
14. как сохранить report/version identity;
15. что делать после обновления report;
16. как не создавать вторую truth-систему через PDF/email/share link.

---

## 1. Authority boundary

При конфликте применяется:

1. текущая явная Owner-инструкция;
2. `29` data-rights governance;
3. `31` person-level / named-leader restrictions;
4. `24` private evidence access rules;
5. `26` report release/version/forecast-lock rules;
6. `30` Execution Evidence Pack disclosure rules;
7. `34` target collaboration/access rules, после их принятия;
8. current mechanical truth в `main`;
9. этот document как target design contract.

Sharing никогда не ослабляет более строгую source/data-rights policy.

---

## 2. Current implementation reality

### 2.1. Public email delivery существует

Current `main` имеет:

```text
/screen-12-email-capture
```

и flow, который:

- собирает Email;
- собирает First name;
- создаёт email-capture record;
- создаёт report-delivery record;
- связывает delivery с PDF filename / MIME type;
- сохраняет recipient email;
- может хранить provider / messageId.

### 2.2. Current public PDF delivery ≠ secure sharing

Текущий `screen-12-email-capture`:

- не создаёт account;
- не создаёт Deal membership;
- не создаёт Viewer role;
- не определяет rights-based disclosure;
- не создаёт expiring secure link.

Это distribution flow для public report.

### 2.3. Current report PDF machinery существует

Current codebase имеет report/PDF generation path.

Это reusable technical foundation.

### 2.4. Generic Deal share link отсутствует

Current target corpus уже запрещал добавлять:

`Anyone with the link`

без отдельного contract.

Этот `35` и является таким contract, но **не принимает public bearer-link как default**.

---

## 3. Главный distinction

Нужно различать четыре действия:

```text
A. Download
B. Email delivery
C. Secure recipient access
D. Deal membership
```

Они не взаимозаменяемы.

---

## 4. Download

Пользователь получает файл локально.

После download MergeVue не контролирует дальнейшее копирование файла технически.

---

## 5. Email delivery

MergeVue отправляет конкретный artifact recipient email.

Это не Deal access.

---

## 6. Secure recipient access

Recipient получает ограниченный, серверно проверяемый доступ к конкретному artifact/disclosure projection.

Это не полноценное Deal membership.

---

## 7. Deal membership

Определяется `34`.

Membership может открывать ongoing Deal surface, но не нужен для every external report recipient.

---

## 8. Recipient ≠ Viewer

**Deal Viewer**:

- authenticated Deal member;
- ongoing access according to Deal role;
- может видеть current report state.

**External Recipient**:

- получает один конкретный shared artifact/version/purpose scope;
- не получает Deal navigation/member status;
- не получает автоматический future access.

---

## 9. Sharing unit

Основная share unit:

> **Versioned Artifact**

Не:

- whole Deal by default;
- whole evidence corpus;
- live workspace snapshot.

---

## 10. Artifact classes

Target share/export classes:

1. Public Forecast Brief
2. Released Paid Report
3. Released report PDF
4. Client-safe forecast projection
5. Outcome verification summary
6. Execution Evidence Pack
7. Economic exposure summary
8. Named-leader client-safe forecast
9. Evidence appendix / disclosed evidence references
10. Procurement/security artifacts — handled separately from Deal analytics

---

## 11. Source of truth

PDF/email/shared web view всегда derives from:

> **authoritative structured artifact/version**

Не наоборот.

---

## 12. PDF is not source of truth

Если PDF потерян/forwarded:

server canonical report remains authority.

---

## 13. Email is not source of truth

Email body/attachment — distribution artifact.

---

## 14. Shared web view is not independent truth

Он отражает immutable disclosure projection конкретной version.

---

## 15. Export requires released state

Нельзя external-export:

- draft report;
- analyst candidate;
- unapproved forecast;
- unreleased named-leader hypothesis;
- unsealed claim represented as sealed.

---

## 16. Report release vs share authorization

Released report может существовать, но быть **not share-authorized** для конкретного recipient/purpose.

---

## 17. Share permission is separate

Client role/membership может дать:

`VIEW_REPORT`

но не обязательно:

`SHARE_REPORT_EXTERNALLY`.

---

## 18. Minimum sharing permissions

Conceptual:

```text
DOWNLOAD_CLIENT_ARTIFACT
EMAIL_CLIENT_ARTIFACT
SHARE_WITH_EXTERNAL_RECIPIENT
SHARE_EXECUTION_EVIDENCE_PACK
SHARE_NAMED_LEADER_FORECAST
```

Не final enum.

---

## 19. Default client role rule

Target default:

- Deal Administrator: may initiate export/share subject to rights gate;
- Deal Collaborator: may download client-safe report if permitted, but external sharing requires explicit permission;
- Deal Viewer: view only, no external share by default.

Exact role interaction depends on acceptance of `34`.

---

## 20. Internal staff does not automatically share

Analyst ability to view/review report does not grant external disclosure authority.

---

## 21. Share request object

Conceptual:

```text
shareRequestId
sourceDealId
sourceArtifactId
sourceArtifactVersion
requestedBy
recipientIdentity
recipientType
purpose
disclosureScope
rightsPolicyVersion
requestedAt
status
```

---

## 22. Artifact snapshot

Share operation binds:

- artifact ID;
- exact version;
- generated date;
- released date;
- evidence cutoff;
- disclosure projection;
- recipient/purpose.

---

## 23. New report version does not mutate old shared version

If report v3 released after v2 was shared:

v2 share remains v2 historical artifact.

---

## 24. No silent update

Нельзя:

`same link now shows latest report`

если recipient believed it was a fixed issued artifact.

---

## 25. Optional latest-version link

Could exist later only if explicitly labeled:

`Always show latest released report`

and rights model supports.

Not v1 default.

---

## 26. v1 default

> Every secure share references one immutable issued artifact version.

---

## 27. Share audience

Required target field:

```text
INTERNAL_CLIENT_RECIPIENT
EXTERNAL_ADVISER
BOARD_RECIPIENT
LENDER_RECIPIENT
FUTURE_BUYER
OTHER_AUTHORIZED_RECIPIENT
```

Exact closed enum later.

---

## 28. Audience ≠ permission

Selecting `Future buyer` does not unlock more evidence.

---

## 29. Purpose

Required:

- internal review;
- investment committee;
- adviser review;
- financing/refinancing;
- future buyer diligence;
- governance review;
- another authorized bounded purpose.

---

## 30. Purpose changes disclosure

Same underlying Deal can yield different **lawful disclosure projections**.

---

## 31. Different projection ≠ different analytical truth

Allowed:

- omit restricted evidence;
- summarize;
- redact identity;
- omit person-level output.

Not allowed:

- change conclusion to please recipient;
- change forecast meaning;
- hide material limitation while keeping favorable claim.

---

## 32. Disclosure projection

Conceptual:

```text
sourceArtifactVersion
+ recipient
+ purpose
+ rights policy
+ field/component rules
→ disclosureProjectionVersion
```

---

## 33. Projection is versioned

Every issued disclosure artifact should be reproducible.

---

## 34. Rights gate first

Before rendering:

1. recipient identity/purpose known;
2. requester share authority known;
3. source artifact released;
4. source component rights known;
5. person-level restrictions checked;
6. future-buyer/third-party purpose checked;
7. projection generated.

---

## 35. Unknown rights

Fail closed.

---

## 36. Restricted component

Can be:

- omitted;
- referenced only;
- summarized/de-identified if permitted.

Never simply included because PDF is being generated.

---

## 37. Redaction is not rights creation

Black box over text does not automatically make underlying disclosure lawful.

---

## 38. De-identification is not automatic permission

Per `29`.

---

## 39. Public evidence

May remain citeable/disclosable if source terms allow.

But Deal-specific derived interpretation can remain confidential.

---

## 40. Private evidence

Raw private document never auto-attached to report share.

---

## 41. Private evidence reference

Possible:

`Restricted source supports this finding.`

only if source existence itself may be disclosed.

---

## 42. Private evidence attachment

Requires explicit rights and requester authority.

Not default.

---

## 43. Board materials

Reference or summary preferred.

Raw board document not exported by default.

---

## 44. Legal/privileged material

Fail closed unless explicit authority.

---

## 45. Respondent raw answers

Never included in normal external report/export.

---

## 46. Respondent identity

Omitted by default.

---

## 47. Private interview notes

Excluded by default.

---

## 48. Evidence summaries

May be included if generated through authorized canonical report projection.

---

## 49. 42Q raw answers

Absolute:

> **Never included in external export/share.**

---

## 50. 42Q internal type/function

Absolute:

> **Never included.**

---

## 51. Named-leader forecast

May be shared only if:

- released;
- recipient-authorized;
- purpose-authorized;
- client-safe form;
- rights gate passes.

---

## 52. Named-leader disclosure scope

Only:

- behavior claim;
- condition;
- observation window;
- first signs;
- limitations;
- relevant client-safe evidence summary;
- verification status when real.

Not:

- type;
- raw answers;
- internal mappings;
- practitioner rationale.

---

## 53. Named-person future-buyer disclosure

Separate high-sensitivity gate.

Not implied by Deal Administrator share action alone.

---

## 54. Economic evidence

Client-safe economic exposure can export if rights permit.

---

## 55. Economic exposure ≠ loss

Export must preserve `32` disclaimer/semantics.

---

## 56. Execution Evidence Pack

`30` controls Pack content.

`35` controls how an already rights-approved Pack is distributed.

---

## 57. Pack audience/purpose

Must match `30` request identity.

---

## 58. Pack third-party disclosure

Requires explicit machine/governed rights decision.

---

## 59. Pack share cannot expand contents

If generated as future-buyer disclosure-limited version, share that exact projection.

---

## 60. Full internal Pack

Not to external recipient by default.

---

## 61. Verification summaries

Can share exact fixed outcome:

`Confirmed / Partially confirmed / Not determinable / Missed / Falsified`

if recipient rights allow.

---

## 62. No global accuracy claims via export

---

## 63. Forecast status preservation

If forecast is locked but not sealed:

export says locked, not sealed.

---

## 64. Seal status preservation

If sealed:

show only what seal authority genuinely covers.

---

## 65. Pack seal confusion

A sealed forecast inside Pack does not seal the Pack.

---

## 66. Artifact integrity

Every exported PDF/share view should include client-safe identity:

- report/pack ID;
- version;
- generated date;
- released date;
- as-of/evidence cutoff;
- disclosure purpose where appropriate.

---

## 67. Optional artifact hash

Future.

Do not call cryptographically sealed unless full artifact is actually sealed.

---

## 68. File naming

File name should include bounded artifact identity.

Candidate examples:

```text
mergevue-deal-report-v3.pdf
mergevue-execution-evidence-pack-v2.pdf
```

Do not include secret IDs.

---

## 69. Confidentiality label

Only if real policy supports.

Candidate:

`Confidential — recipient-specific`

but not a substitute for access control.

---

## 70. Watermark

Possible future control:

recipient email/name + issued date.

Not required v1.

---

## 71. Watermark ≠ DRM

Do not imply file cannot be copied.

---

## 72. Download

Download permission separate from view permission.

---

## 73. Secure web access v1 target

Preferred external sharing method for sensitive artifacts:

```text
recipient-specific secure access
```

over bearer link.

---

## 74. Recipient account requirement

For sensitive private paid artifacts:

> recipient should authenticate or pass equivalent verified identity gate.

Exact auth method not defined here.

---

## 75. Public Forecast Brief exception

Public report email/PDF may remain simple distribution because content itself is public-layer output.

---

## 76. Paid report external recipient

Requires secure recipient identity.

---

## 77. Execution Evidence Pack recipient

Requires secure recipient identity.

---

## 78. Named-leader forecast recipient

Requires strongest recipient identity + rights gate.

---

## 79. Anyone-with-link

v1 default:

> **NOT AUTHORIZED.**

---

## 80. Public bearer links

Only possible later for deliberately public artifact classes.

Not for live Deal paid reports.

---

## 81. Secret URL is not sufficient security

Link entropy alone is not membership/recipient verification.

---

## 82. Share token

Can bootstrap access to recipient-auth flow.

Should not remain permanent bearer credential after acceptance.

---

## 83. Recipient binding

Secure share should bind intended recipient identity.

---

## 84. Forwarded email protection

Forwarded share email should not grant access to different identity.

---

## 85. Shared recipient does not become collaborator

No Deal navigation.

---

## 86. Recipient does not join Deal membership list

May appear in separate:

`Shared with`

history.

---

## 87. Share record

Conceptual:

```text
shareId
artifactId
artifactVersion
projectionVersion
recipient
purpose
createdBy
createdAt
expiresAt
revokedAt
accessMode
downloadAllowed
status
```

---

## 88. Share state

Target:

```text
PENDING
ACTIVE
EXPIRED
REVOKED
DELIVERED
FAILED
```

Exact state model later.

---

## 89. Email-delivered attachment state

If PDF attachment delivered:

`DELIVERED`

does not mean future revocable.

---

## 90. Secure-link state

Can be ACTIVE/EXPIRED/REVOKED.

---

## 91. Revocation semantics

Revocation stops **future server access**.

---

## 92. Revocation does not recall downloaded file

Absolute.

---

## 93. UI must state this where material

Example:

`Revoking access prevents future access through MergeVue. Files already downloaded cannot be recalled.`

---

## 94. Email attachment revocation

Not technically possible.

Therefore sensitive artifacts should prefer secure web access.

---

## 95. Download toggle

For secure recipient access:

```text
View only
Allow download
```

potential future permission.

---

## 96. View-only is not perfect anti-copy

Screenshots/copy possible.

Do not overclaim.

---

## 97. Expiry

Secure share should support expiration.

---

## 98. Exact default expiry

Not set in v1 contract.

Security/product decision required.

---

## 99. No indefinite external access by default

Secure share needs expiry or review policy.

---

## 100. Renewal

New/extended access requires authorized requester action.

---

## 101. Revoked artifact and re-share

Requires new share event.

---

## 102. Source artifact superseded

Old share can remain if still valid historical disclosure.

But UI may warn:

`A newer report version is available.`

Only to authorized source-side user, not silently to recipient.

---

## 103. Recipient latest-version access

Not automatic.

---

## 104. Share of obsolete materially incorrect report

If source report formally withdrawn/corrected:

future access to withdrawn version may need blocking/warning.

Lifecycle policy required.

---

## 105. Correction

If issued artifact contains confirmed defect:

create corrected version.

Do not replace file in place without version identity.

---

## 106. Resend

Resending same artifact:

- same artifact version;
- new distribution event.

---

## 107. Re-export

Same source projection can produce a new distribution artifact.

Does not create new analytical version.

---

## 108. Share copy

Email should identify:

- MergeVue;
- sender/requesting organization if safe;
- artifact type;
- action;
- expiry if known.

---

## 109. Email privacy

For sensitive Deal:

avoid company pair in subject/body until recipient authentication if policy chooses.

---

## 110. Email attachment policy

Public Forecast Brief:

allowed.

Sensitive paid report:

prefer secure access over attachment.

---

## 111. Email attachment for paid report

Could be enabled only under explicit policy.

Not v1 default.

---

## 112. Execution Pack email attachment

Not default.

---

## 113. Named-leader forecast email attachment

Not default.

---

## 114. Recipient notification

Transactional only.

No marketing opt-in.

---

## 115. Sender copy

No hidden CC/BCC unless operationally authorized.

---

## 116. Current hiddenCopy behavior

Current public email delivery object has `hiddenCopy`.

Target production sharing must audit/authorize any hidden-copy behavior.

No silent confidential-recipient copies.

---

## 117. Delivery status truth

Do not mark delivered until provider/backend confirms applicable success state.

---

## 118. `sent` vs `delivered`

If provider only confirms accepted/sent, do not claim recipient read/delivered.

---

## 119. Open tracking

Not needed by default.

Potential privacy concern.

---

## 120. Read receipts

Not default.

---

## 121. Recipient access audit

For secure share, useful events:

```text
share_created
share_email_sent
share_access_opened
share_downloaded
share_expired
share_revoked
```

Only if actually known.

---

## 122. No fake `viewed`

Do not infer from email sent.

---

## 123. Download audit

Record successful server download if infrastructure knows.

---

## 124. External forwarding unknown

Cannot know once downloaded.

---

## 125. Audit log vs analytics

Sharing audit is security/business record.

Not marketing analytics.

---

## 126. Generic analytics

Must not receive:

- recipient email;
- Deal identity;
- private artifact filename;
- named-leader subject;
- restricted purpose details.

---

## 127. Client share history

Deal Administrator can potentially see client-safe share history.

---

## 128. Collaborator share history

Only if permission allows.

---

## 129. Viewer share history

No by default.

---

## 130. Recipient cannot see other recipients

---

## 131. Recipient cannot enumerate Deal members

---

## 132. Recipient cannot browse reports

Only shared artifact.

---

## 133. Recipient cannot access source evidence unless separately included/authorized

---

## 134. Recipient cannot request role change through share link

---

## 135. Recipient account

Account may be lightweight authentication identity.

Does not imply workspace membership.

---

## 136. Recipient identity collision

Same email used for existing collaborator:

system may authenticate same account but retains separate share/membership permissions.

---

## 137. Membership can make share redundant

If user already has Deal Viewer/Collaborator access, product may offer:

`Open in MergeVue`

instead of separate external share.

But external artifact history can still exist.

---

## 138. Board recipient

Could be Deal Viewer if ongoing need.

Could be external recipient for one artifact.

Do not force membership.

---

## 139. Adviser recipient

Same.

---

## 140. Future buyer

Should generally be external recipient, not member of seller's Deal Workspace.

---

## 141. Lender

Same.

---

## 142. Data room upload

Future client may download artifact then upload to external VDR.

MergeVue loses access control after export.

UI should distinguish:

`Download for external data room`

from secure MergeVue recipient access where needed.

---

## 143. VDR integration

Not v1.

---

## 144. Google Drive / Dropbox export

Not v1.

---

## 145. API export

Not v1.

---

## 146. CSV export

Not default for reports.

---

## 147. JSON export

Internal/API future, not client default.

---

## 148. Word/DOCX export

Not required v1.

---

## 149. PDF is primary portable format

Because current machinery already exists.

---

## 150. HTML secure view

Preferred secure recipient format when sensitive.

---

## 151. Print

Treat as export.

If viewer can print browser content, that is effectively download/copy.

Policy should not claim otherwise.

---

## 152. Copy text

Not reliable security boundary.

---

## 153. Screenshot

Cannot prevent reliably.

---

## 154. DRM

Not assumed.

---

## 155. Password-protected PDF

Possible future fallback but not equivalent to recipient-authenticated secure access.

Not v1 default.

---

## 156. PDF password sharing risk

Password can be forwarded.

---

## 157. Share purpose banner

Sensitive recipient view may show:

`Shared for [purpose]`

if useful.

---

## 158. Purpose limitation

Recipient access is scoped to stated disclosure purpose.

Technical enforcement limited after download.

---

## 159. Terms acknowledgement

Could be required for sensitive recipient.

Exact legal wording external gate.

---

## 160. NDA acknowledgement

Not assumed.

Could be enterprise requirement.

---

## 161. Legal disclaimer

Use actual approved wording only.

---

## 162. No fake confidentiality agreement

Clicking link does not create NDA unless legal mechanism says.

---

## 163. Recipient identity fields

Minimum:

- email / verified identity;
- optional display name;
- recipient type/purpose.

Avoid CRM overcollection.

---

## 164. Recipient organization

May be relevant for future buyer/lender.

Not authorization by itself.

---

## 165. Recipient title

Not required unless purpose needs.

---

## 166. Share requester

Must have server-authoritative permission.

---

## 167. Requester self-attestation not enough for restricted disclosure

For third-party sensitive artifact, system must use rights metadata/policy.

---

## 168. Deal Administrator limitation

Even Administrator cannot externally share restricted person data unless separate gate passes.

---

## 169. Collaborator limitation

Cannot share externally by default.

---

## 170. Viewer limitation

No external share/download by default except ordinary client-safe download if policy explicitly grants.

---

## 171. Internal analyst limitation

Analyst cannot choose external recipient unless operational process grants.

---

## 172. Share authorization chain

```text
requester authority
AND
artifact release state
AND
recipient identity
AND
purpose
AND
data-rights eligibility
AND
projection pass
→ share eligible
```

---

## 173. Rights-filter validator

Before issuance:

- forbidden field leakage;
- raw respondent leakage;
- 42Q leakage;
- internal type leakage;
- analyst note leakage;
- restricted source leakage;
- version mismatch;
- wrong recipient/purpose;
- withdrawn report.

---

## 174. Machine first

Rights filter should be deterministic where possible.

---

## 175. Human review

Needed for material external packs where interpretation of disclosure rights is irreducible.

---

## 176. Human review cannot override prohibition

Analyst cannot decide to reveal 42Q raw.

---

## 177. Disclosure manifest

Each sensitive external artifact should have internal manifest:

```text
sourceArtifactId
sourceArtifactVersion
projectionVersion
recipient
purpose
includedComponents[]
excludedComponents[]
rightsPolicyVersion
generatedAt
generatedBy
```

---

## 178. Client-safe disclosure note

Could state:

`This version excludes restricted source material.`

when meaningful.

---

## 179. Do not mislead on omission

If omission materially limits interpretation:

include limitation.

---

## 180. No invisible conclusion distortion

Cannot remove adverse evidence while retaining favorable conclusion if that makes output misleading.

---

## 181. Material limitation

Must remain in export.

---

## 182. Open Decision Gap

Must remain if relevant.

---

## 183. Contradiction

Must remain if material to included conclusion.

---

## 184. No cherry-picked recipient version

Disclosure scope can narrow evidence, not manipulate analytical conclusion.

---

## 185. Canonical report congruence

Exported paid report uses same client report grammar.

---

## 186. Expert/internal report cannot be exported as ordinary client report

---

## 187. Internal codes

No.

---

## 188. Provider/model metadata

No, unless specific audit purpose.

---

## 189. CORR/internal governance IDs

No client export by default.

---

## 190. Client-safe audit footer

Per `26`.

---

## 191. Forecast ID/version

May be shown if relevant.

---

## 192. Seal hash

Only if client-safe and semantics clear.

Do not put hash in public URL.

---

## 193. Evidence cutoff

Must survive export.

---

## 194. As-of date

Must survive Pack export.

---

## 195. Report version

Must survive export.

---

## 196. Generated vs released date

Distinguish.

---

## 197. Export generated later

If PDF generated today from report released earlier:

show both where useful.

---

## 198. No regenerated content drift

Renderer update must not silently change analytical content of old version.

---

## 199. Renderer version

Internal metadata can track.

---

## 200. Historical rendering

Prefer projecting stored authoritative records.

---

## 201. No hindsight recalculation

Especially Execution Pack.

---

## 202. Public source links in PDF

Allowed as references.

---

## 203. Dead links

Preserve title/date/locator, do not invent replacements.

---

## 204. Private links

Do not expose object-store URLs.

---

## 205. Evidence attachments

Not default.

---

## 206. Evidence bundle ZIP

Not v1.

---

## 207. Full data-room export

Not v1.

---

## 208. One-click `Download all evidence`

Forbidden by default.

---

## 209. CSV of respondent answers

Forbidden client export by default.

---

## 210. 42Q spreadsheet export

Forbidden.

---

## 211. Analyst notes export

Forbidden.

---

## 212. Audit export

Separate client-safe vs internal full.

---

## 213. Internal full audit export

Security/compliance use only.

---

## 214. Client audit record

Can include bounded metadata:

- report ID/version;
- release;
- seal status;
- evidence scope;
- share artifact identity.

---

## 215. Public report resend

Current email capture can remain.

---

## 216. Public report recipient

Does not need account.

---

## 217. Public report forwarding

Content is public-layer; no Deal membership effect.

---

## 218. Saved Deal paid report download

Requires authenticated Deal access and download permission.

---

## 219. Paid report emailed to current Deal member

Could be allowed as distribution event.

But membership remains separate.

---

## 220. Paid report emailed to non-member

Treat as external share with rights/recipient gate.

---

## 221. Share to same organization

Still recipient-specific.

Organization domain alone not enough.

---

## 222. Share to board mailing list

Distribution list can multiply recipients.

Not supported v1 unless individual recipients governed.

---

## 223. Group email alias

Avoid for sensitive artifact v1.

---

## 224. Multiple recipients

v1 should create separate share records per recipient.

---

## 225. Bulk share

Not v1.

---

## 226. Recipient change

New recipient = new share.

---

## 227. Purpose change

New material purpose = new share/rights assessment.

---

## 228. Expiry extension

Audited update/new access grant.

---

## 229. Revocation reason

May store internal/client-safe reason where useful.

---

## 230. Share cancellation before recipient access

Supported if backend real.

---

## 231. Secure share access screen

Minimum:

```text
MergeVue
Shared artifact type
Shared by
Purpose
Version
Access status
[Authenticate / Continue]
```

Avoid Deal details before identity gate if sensitive.

---

## 232. Recipient artifact screen

After access:

```text
Artifact title
Deal identity if authorized
Version / as-of
Disclosure note
View
Download if permitted
Expiry
```

---

## 233. No workspace sidebar

External recipient should not see internal Deal navigation.

---

## 234. No member list

---

## 235. No evidence uploader

---

## 236. No comments

---

## 237. No report-version browser

Unless specifically shared.

---

## 238. No upsell

External recipient is not marketing lead by default.

---

## 239. No marketing signup prechecked

---

## 240. No `Create account to continue` unless identity mechanism genuinely requires account

Could use secure verified identity flow.

---

## 241. Account creation purpose

If required:

`Access a report shared with you`

not generic product onboarding.

---

## 242. Return to artifact after auth

Critical.

---

## 243. Access denied

`You don't have access to this shared report.`

No Deal leak.

---

## 244. Expired

`This shared access has expired.`

---

## 245. Revoked

Could use same generic unavailable copy for security.

---

## 246. Artifact withdrawn

`This report version is no longer available.`

Only if withdrawal policy real.

---

## 247. Download label

`Download PDF`

only if permitted.

---

## 248. Share label inside Deal

Candidate:

`Share report`

Not generic `Share` if ambiguity.

---

## 249. Export label

`Download PDF`

`Export report`

only when actual options exist.

---

## 250. Execution Pack label

`Share evidence pack`

only when Pack release/rights ready.

---

## 251. Named-leader label

Avoid prominent share action by default.

High-sensitivity.

---

## 252. Confirmation before external share

Show:

- recipient;
- artifact/version;
- purpose;
- disclosure scope;
- expiry if known;
- download permission if relevant.

---

## 253. Preview

Optional but valuable for restricted projection.

---

## 254. Preview must reflect exact issued projection

---

## 255. Client acknowledgment

`I confirm this recipient is authorized`

may supplement but never replace server rights checks.

---

## 256. No broad self-attestation only

---

## 257. Sharing audit event

On issuance, freeze who/what/why.

---

## 258. Email delivery event

Separate.

---

## 259. Recipient access event

Separate.

---

## 260. Download event

Separate.

---

## 261. Revoke event

Separate.

---

## 262. No recipient tracking beyond purpose

Do not add invasive analytics.

---

## 263. Accessibility

Target WCAG 2.2 AA.

Need:

- keyboard share dialog;
- labeled recipient fields;
- explicit role/status text;
- accessible PDF;
- logical reading order;
- no color-only access state;
- clear warning for irreversible download exposure.

---

## 264. Mobile sharing

Flow:

1. choose artifact;
2. recipient;
3. purpose;
4. review;
5. send.

No dense rights matrix.

---

## 265. Desktop sharing

Can show disclosure preview + recipient details side by side.

---

## 266. Error states

Need bounded:

- artifact not released;
- user lacks share permission;
- recipient not eligible;
- rights unresolved;
- projection validation failed;
- delivery failed;
- share expired/revoked.

---

## 267. Retry

Retry delivery does not change artifact version.

---

## 268. Share failure

Does not affect report release state.

---

## 269. Rights failure

Does not destroy source artifact.

---

## 270. Section omission

May generate narrower projection.

---

## 271. Entire artifact blocked

If essential claim cannot be disclosed without prohibited source/person data:

do not share misleading shell.

---

## 272. Partial projection threshold

Needs machine/human check for interpretability.

---

## 273. No blank redaction theater

Do not produce 80% blacked-out document if unusable.

Better block or create intentional summarized projection.

---

## 274. Future buyer Pack

Should be purpose-built disclosure projection from `30`.

---

## 275. Internal board report

Could include broader material if rights allow.

---

## 276. Lender view

May be narrower.

---

## 277. Adviser view

May mirror client report if authority.

---

## 278. Audience-specific omission

Allowed.

Audience-specific factual rewriting:

not allowed.

---

## 279. Share vs publication

External recipient share remains private disclosure.

It does not become public case study.

---

## 280. Public case study

Separate `29` publication rights.

---

## 281. Share vs benchmark

No connection.

---

## 282. Share vs training

No connection.

---

## 283. Recipient acceptance does not grant MergeVue secondary-use rights

---

## 284. Data residency

Not defined here.

---

## 285. Encryption

Transport/storage security required by security architecture.

Exact implementation separate.

---

## 286. Link token security

Needs strong cryptographic randomness.

Do not reuse `simpleHash()` patterns for sensitive secure sharing.

---

## 287. Current public report ID hash

Prototype/distribution identifier is not secure authorization token.

---

## 288. Token storage

Hashed/opaque according to security best practice.

---

## 289. Token replay

After identity binding/acceptance, use authenticated session.

---

## 290. Rate limiting

Required.

Exact thresholds later.

---

## 291. Brute-force

Recipient access must resist.

---

## 292. Enumeration

No existence leakage.

---

## 293. Secure headers / caching

Security implementation later, but sensitive recipient pages must not be casually cached/shared.

---

## 294. Browser history

Avoid secret-bearing permanent URLs.

---

## 295. Search indexing

Noindex/private.

---

## 296. Referrer leakage

Sensitive token design must consider.

---

## 297. Link preview bots

Do not reveal Deal details before auth; email/chat preview bots may open links.

---

## 298. One-time invite vs reusable access

Invitation/auth bootstrap can be one-time.

Recipient authenticated access can continue until expiry/revoke.

---

## 299. Recipient account session

Ends according to auth/session policy.

---

## 300. Revoked share

Session-level authorization rechecked server-side.

---

## 301. No client-side expiry authority

Server time.

---

## 302. Clock mismatch

Server authoritative.

---

## 303. Share version policy

Policy version stored.

---

## 304. Rights policy version

Stored.

---

## 305. Projection method version

Stored.

---

## 306. Recipient identity verification version

Optional internal metadata.

---

## 307. Historical audit

Should answer:

- who shared;
- what version;
- with whom;
- for what purpose;
- when;
- whether access/download occurred where known;
- when expired/revoked.

---

## 308. Deleted recipient account

Share access terminates.

Audit remains per policy.

---

## 309. Recipient organization change

Does not auto-transfer share.

---

## 310. Email change

Secure identity policy decides.

Do not silently rebind recipient to new email.

---

## 311. Share to incorrect recipient

Requester should revoke immediately.

Cannot recall downloaded artifacts.

---

## 312. UI warning

For download-enabled share:

`Downloaded copies cannot be revoked.`

---

## 313. Confidentiality incident

Security process separate.

---

## 314. Export package virus/malware

Generated PDFs should come from controlled renderer, not user-submitted attachments.

---

## 315. Attached private docs

If future sharing includes attachments, malware/content controls needed.

Not v1.

---

## 316. PDF metadata

Avoid leaking:

- local paths;
- internal usernames;
- model/provider;
- internal case IDs not intended;
- source storage URLs.

---

## 317. PDF document properties

Can include:

- MergeVue;
- report ID/version;
- generated date.

---

## 318. Filename confidentiality

Avoid sensitive company names if policy prefers.

Could use report ID.

---

## 319. Printed footer

Useful:

`Report version X · Generated Y`

---

## 320. Recipient watermark later

Optional.

---

## 321. Recipient purpose later

Could appear footer for highly sensitive share.

---

## 322. No recipient name in canonical source report

Watermark/distribution layer only.

---

## 323. Export rendering should not mutate canonical report

---

## 324. Same projection across screen/PDF

Semantic parity.

---

## 325. Layout may differ

Content semantics must not.

---

## 326. Accessibility PDF

Text selectable, headings/tables tagged where tooling supports.

---

## 327. Print CSS

No hidden critical limitation.

---

## 328. Truncation

Never silently truncate evidence/limitations due to PDF page limits.

---

## 329. Overflow

Renderer should paginate.

---

## 330. Attachment size

Operational email limits may require secure link instead.

Do not compress away content silently.

---

## 331. Secure link preferred for large Pack

---

## 332. Offline archive

User may download if authorized.

---

## 333. Retention of generated export

Retention policy separate.

---

## 334. Regeneration

Can regenerate from canonical artifact/version if source retained and rights still permit.

---

## 335. Rights changed after old export

Cannot erase past lawful export.

Future generation/access must obey current/governing policy.

---

## 336. Legal hold

May preserve share/audit records.

Does not expand recipient access.

---

## 337. Evidence deletion

Could make regeneration impossible.

Existing issued artifact treatment follows retention/legal policy.

---

## 338. Recipient request deletion

Privacy/legal process separate.

---

## 339. Version retention

Released artifact identity should remain auditable even if raw file removed per policy.

---

## 340. Share history is not analytics metric only

It is governance record.

---

## 341. No viral sharing

Product should not encourage:

`Share with your team!`

for sensitive M&A artifacts without rights context.

---

## 342. No social sharing

No LinkedIn/X/etc.

---

## 343. No public embed

---

## 344. No QR public report for paid artifact

---

## 345. No short URL service

---

## 346. No generic copy-link

Until secure recipient model implemented.

---

## 347. Public methodology pages can still use normal public links

Separate category.

---

## 348. Public historical case links

Separate category.

---

## 349. Public Forecast Brief email

Keep existing flow.

---

## 350. Current public email delivery caveat

Current code marks delivery record as `delivered` during flow creation.

Production delivery truth should align with actual provider success semantics before using strong delivery claim.

---

## 351. Уровень доверия

### 351.1. Current public distribution

**Высокое доверие** к existence of:

- `/screen-12-email-capture`;
- Email + First name collection;
- public PDF delivery record;
- PDF filename/MIME/recipient metadata.

### 351.2. Secure external sharing

**Не реализовано / не подтверждено** в audited current `main`.

### 351.3. Current PDF generation

**Реальный reusable implementation asset.**

### 351.4. Data-rights model

**Высокое доверие** к controlling principle:

- access ≠ reuse;
- disclosure purpose matters;
- private evidence remains restricted;
- Execution Pack rights-filtered;
- named-leader data stricter.

### 351.5. Recipient-specific secure access model

**OWNER-ACCEPTED target design.** Реализация всё ещё требует downstream security/auth/access-control acts.

### 351.6. Exact auth mechanism

**Не определён.**

### 351.7. Exact share expiry

**Не определён.**

### 351.8. Exact legal recipient terms

**Не определены.**

### 351.9. Default public bearer link

**Не разрешён.**

---

## 352. Что мы сознательно НЕ меняем

1. Canonical report remains source of truth.
2. PDF remains distribution artifact.
3. Public email capture remains report-delivery flow.
4. Email recipient does not become account/member.
5. Deal membership remains separate under `34`.
6. Released report version remains immutable.
7. New evidence creates new report version.
8. Forecast lock/seal semantics remain `26`.
9. Verification vocabulary remains `27`.
10. Data rights remain `29`.
11. Execution Pack content remains `30`.
12. Named-leader restrictions remain `31`.
13. Private evidence restrictions remain `24`.
14. Raw respondent answers are not exported by default.
15. 42Q raw/internal state never exported.
16. Analyst/internal notes remain internal.
17. Public share link is not default.
18. Download cannot be revoked retroactively.
19. Share does not create publication rights.
20. Share does not create benchmark/R&D rights.
21. Audience does not change analytical truth.
22. Redaction does not create rights.
23. Recipient does not become collaborator.
24. No new route is authorized by this document alone.
25. No auth provider is selected here.

---

## 353. Acceptance criteria

Контракт проходит только если:

1. Sharing is artifact/version-based.
2. Source artifact is canonical structured record.
3. PDF is not source of truth.
4. Email is not source of truth.
5. Secure view is not parallel truth.
6. Draft reports cannot be externally shared as final.
7. Released state required.
8. Share authorization is separate from report release.
9. Share permission is separate from view permission.
10. Recipient is separate from Deal membership.
11. Deal Viewer is distinct from external recipient.
12. External recipient does not gain Deal navigation.
13. Recipient does not gain evidence upload.
14. Recipient does not gain member list.
15. Recipient does not gain future versions automatically.
16. Share binds exact artifact version.
17. New report version does not mutate old share.
18. No silent latest-version replacement.
19. Recipient and purpose are explicit.
20. Audience does not grant rights.
21. Rights gate runs before rendering.
22. Unknown rights fail closed.
23. Restricted data can be omitted/referenced/summarized only if policy permits.
24. Redaction does not create rights.
25. De-identification does not automatically create permission.
26. Private documents are not auto-attached.
27. Respondent raw answers are excluded.
28. Respondent identity minimized.
29. Interview notes excluded by default.
30. Raw 42Q never exports.
31. Internal type/function never exports.
32. Named-leader forecast requires released client-safe form.
33. Named-leader forecast requires recipient authorization.
34. Future-buyer person disclosure has separate high-sensitivity gate.
35. Economic export preserves exposure ≠ loss.
36. Execution Pack content remains controlled by `30`.
37. Pack audience/purpose preserved.
38. Pack generation does not expand rights.
39. Verification status uses fixed vocabulary.
40. Locked/sealed distinction preserved.
41. Forecast seal does not imply Pack seal.
42. Artifact includes version identity.
43. Evidence cutoff/as-of survives export.
44. No report hash in URL.
45. No internal provider/CORR metadata by default.
46. Current public PDF machinery reused where suitable.
47. No second unrelated PDF truth stack.
48. Secure web access preferred for sensitive external artifacts.
49. Sensitive recipient authenticates/verifies identity.
50. Public Forecast Brief may remain simple email distribution.
51. Paid external report share requires rights gate.
52. Execution Pack share requires secure recipient.
53. Named-leader share requires strongest gate.
54. `Anyone with the link` not authorized by default.
55. Secret URL alone not considered sufficient for sensitive access.
56. Forwarded share does not authorize wrong recipient.
57. Share record is auditable.
58. Pending share/invite gives no unauthorized access.
59. Revocation stops future server access.
60. Revocation does not recall downloaded files.
61. UI states download irreversibility where material.
62. Email attachments are not revocable.
63. Sensitive artifacts prefer secure access.
64. Download permission can be distinct from view.
65. View-only is not marketed as impossible to copy.
66. Secure shares expire/review rather than default indefinite.
67. Exact expiry is not invented here.
68. Resend does not create analytical version.
69. Re-export does not create analytical version.
70. Corrected report creates new version.
71. Share failure does not change report release state.
72. Rights failure does not delete source report.
73. Email delivery truth reflects actual provider/backend status.
74. Sent is not mislabeled opened/viewed.
75. Recipient access/download events only claimed when known.
76. Generic analytics exclude recipient/Deal sensitive data.
77. Share audit is separate from marketing analytics.
78. Client can see share history only if authorized.
79. Recipient cannot see other recipients.
80. Recipient cannot enumerate members.
81. External recipient cannot browse Deal.
82. Recipient account does not imply membership.
83. Existing collaborator identity does not collapse share permissions.
84. Future buyer not automatically seller-workspace member.
85. Lender/adviser not forced into membership.
86. VDR integration not invented.
87. Drive/Dropbox export not invented.
88. API export not invented.
89. CSV/JSON raw evidence export not default.
90. PDF remains primary portable client format.
91. HTML secure view remains target sensitive-access format.
92. DRM not claimed.
93. Password PDF not treated as secure-recipient equivalent.
94. Purpose limitation remains explicit.
95. NDA not implied by click.
96. Requester requires share authority.
97. Self-attestation does not replace rights check.
98. Client Administrator cannot bypass person restrictions.
99. Collaborator external share not default.
100. Viewer external share not default.
101. Rights-filter validator exists before sensitive issuance.
102. Machine-checkable prohibitions run before human review.
103. Human review cannot override hard prohibition.
104. Disclosure manifest exists internally for sensitive share.
105. Material omitted limitations remain visible.
106. No cherry-picked analytical version for recipient.
107. Audience-specific omission cannot alter included fact meaning.
108. Expert/internal report not exported as ordinary client report.
109. Evidence storage URLs never leak.
110. Group aliases/bulk sharing not initial v1.
111. Separate share record per recipient.
112. Recipient change creates new share.
113. Purpose change triggers new rights assessment.
114. Share confirmation shows exact artifact/recipient/purpose.
115. Preview matches exact projection where provided.
116. Sharing does not create publication rights.
117. Sharing does not create benchmark rights.
118. Sharing does not create model-training rights.
119. Link tokens use security-grade design, not simple hash identifiers.
120. Share pages avoid Deal leak before authentication.
121. Share URLs avoid permanent bearer secrets.
122. Server enforces expiry/revocation.
123. Client clock not authority.
124. PDF metadata does not leak internal paths/providers.
125. Export rendering does not mutate canonical report.
126. Screen/PDF semantic parity maintained.
127. PDF limitations are not silently truncated.
128. Generated artifacts are version-identifiable.
129. Historical artifact regeneration uses stored authoritative records.
130. No hindsight recalculation in Pack exports.
131. No `Download all evidence` by default.
132. No respondent-answer CSV export.
133. No 42Q export.
134. No analyst-notes export.
135. Client-safe audit export differs from internal full audit.
136. Public report delivery remains backward-compatible.
137. Paid report sharing is not forced through public email-capture semantics.
138. Sharing does not become sales/marketing lead flow.
139. WCAG 2.2 AA target maintained.
140. LIVE audit occurs before implementation because this document audits `main`, not deployed production.

---


## 353.1. Owner acceptance boundary

**Owner acceptance состоялся 2026-09-16.**

С этого момента `35 v1.0` является controlling design contract для:

- sharing released artifacts;
- export/download boundaries;
- recipient-specific external access;
- disclosure projection;
- recipient/purpose binding;
- expiry/revocation semantics;
- rights-filtered distribution;
- Execution Evidence Pack distribution;
- named-leader client-safe distribution boundary.

Owner acceptance `35` **не означает автоматически**:

- implementation authorization;
- existence of secure-share routes;
- existence of recipient authentication;
- approval of a specific share TTL;
- approval of email attachments for paid reports;
- approval of a watermark/DRM scheme;
- approval of VDR/cloud-storage integrations;
- legal approval of recipient terms/NDA language;
- production readiness of future-buyer disclosure;
- acceptance of `34`.

`34_MERGEVUE_COLLABORATION_ACCESS_AND_PERMISSIONS_CONTRACT.md` remains a **separate candidate dependency** until explicitly accepted by Owner. Therefore `35` is controlling for sharing/export semantics, while any rule that depends on a client role from `34` must remain fail-closed or conditional until `34` receives its own Owner acceptance.


## 354. Implementation sequence

### Фаза 0 — preserve current public delivery

- keep `/screen-12-email-capture`;
- keep public Forecast Brief PDF delivery;
- audit real provider status semantics;
- do not convert public delivery route into secure paid sharing.

### Фаза 1 — export permission

Implement for authenticated Deal:

- source artifact/version;
- requester permission;
- PDF generation from canonical release;
- audit event.

No external secure share yet.

### Фаза 2 — disclosure projection

Implement:

- recipient type;
- purpose;
- rights filter;
- projection manifest;
- forbidden-field validation.

### Фаза 3 — secure recipient sharing

Implement:

- recipient identity binding;
- access token bootstrap;
- auth/verification;
- server access;
- expiry;
- revoke;
- audit.

### Фаза 4 — download policy

Add:

- view-only vs download;
- download event;
- clear irrevocability warning.

### Фаза 5 — high-sensitivity artifacts

Separate readiness gates for:

- Execution Evidence Pack;
- named-leader client-safe forecast;
- external future-buyer disclosure.

### Фаза 6 — enterprise integrations

Only later:

- VDR;
- storage connectors;
- SSO recipient access;
- organization-wide policy.

---

## 355. Что требует отдельного downstream решения

Следующие параметры deliberately не заполняются дизайнерским default:

1. exact secure-share authentication mechanism;
2. exact share-link expiry/default TTL;
3. paid-report email attachment policy;
4. default download permission for external recipients;
5. recipient terms/NDA/legal acknowledgement;
6. watermark policy;
7. password-protected PDF policy;
8. enterprise VDR integrations;
9. cloud-storage export integrations;
10. group/distribution-list recipient policy;
11. withdrawal/correction treatment of already issued artifacts;
12. generated-artifact retention schedule;
13. open/read tracking policy;
14. recipient access notification policy;
15. external future-buyer legal disclosure matrix;
16. support/security break-glass access to share records.

Эти вопросы требуют security/legal/implementation authority и не должны появляться в UI как факт заранее.

---

## 356. Финальная формула

> **MergeVue sharing is not “send the Deal.” It is the controlled disclosure of one exact released artifact version to one authorized recipient for one declared purpose.**

> **A PDF, email or secure link never creates new rights. Rights determine what may enter the artifact before the artifact is generated.**

> **External recipients are not collaborators. Collaborators are not automatically external-disclosure authorities. Billing contacts, respondents and named-leader participants remain separate identities.**

> **Revocation can stop future access through MergeVue. It cannot recall a file that was already downloaded. Therefore sensitive external disclosure should prefer recipient-authenticated secure access over permanent bearer links or email attachments.**

> **The safe default is: immutable version, explicit recipient, explicit purpose, fail-closed rights filtering, no public bearer link, auditable delivery, and zero raw 42Q/internal personality data in exports.**
