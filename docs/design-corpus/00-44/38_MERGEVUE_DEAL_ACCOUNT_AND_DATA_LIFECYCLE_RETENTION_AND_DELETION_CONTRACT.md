# 38. Контракт Deal / account / data lifecycle, retention и deletion MergeVue

**Файл:** `38_MERGEVUE_DEAL_ACCOUNT_AND_DATA_LIFECYCLE_RETENTION_AND_DELETION_CONTRACT.md`  
**Версия:** 1.0  
**Дата:** 2026-09-16  
**Язык документа:** русский  
**Язык клиентского интерфейса:** только American English  
**Рынок первой версии:** США  
**Статус:** **OWNER-ACCEPTED / CONTROLLING DEAL, ACCOUNT AND DATA LIFECYCLE, RETENTION AND DELETION DESIGN CONTRACT; НЕ ЯВЛЯЕТСЯ ЮРИДИЧЕСКОЙ RETENTION POLICY И НЕ УТВЕРЖДАЕТ, ЧТО ARCHIVE / DELETE / LEGAL HOLD / BACKUP PURGE УЖЕ РЕАЛИЗОВАНЫ В PRODUCTION**  
**Owner acceptance:** **2026-09-16**  
**Аудитная база `main`:** `92c2e0df199d017082b653e72b5a6bfbf5bf6a31`  
**Связанные controlling contracts:** `22`, `24`, `29`, `31`, `34`, `35`, `36`, `37`  
**Главный принцип:** lifecycle actions изменяют состояние доступа, использования или хранения конкретных data classes; они не переписывают историю и не считаются взаимозаменяемыми.  
**Ключевые инварианты:** `ARCHIVE ≠ DELETE`, `ACCOUNT DELETE ≠ DEAL DELETE`, `REMOVE ACCESS ≠ DELETE DATA`, `WITHDRAW USE ≠ ERASE HISTORY`, `RAW EVIDENCE ≠ DERIVED RECORD`, `RELEASED REPORTS ARE IMMUTABLE`, `LEGAL HOLD ≠ ACCESS EXPANSION`, `BACKUP ≠ ACTIVE USE`, `NO SILENT CASCADE DELETE`, `NO FAKE DELETE ALL`, `MOST RESTRICTIVE WHEN POLICY UNKNOWN`, `PURPOSE-SPECIFIC RETENTION`, `FAIL CLOSED`

---

## 0. Назначение

Этот документ определяет lifecycle semantics для:

```text
Account
Deal
Membership
Evidence
Private documents
Respondent data
42Q/person-level data
Released reports
Forecasts
Verification records
Execution Evidence Packs
Share records
Commercial records
Audit/security records
Derived datasets
Backups
```

Он отвечает на вопросы:

1. что означает Archive;
2. что означает Close;
3. что означает Delete;
4. что означает Remove access;
5. что означает Withdraw;
6. что означает Suppress from future use;
7. что происходит с already released report;
8. что происходит с locked/sealed forecast;
9. что происходит с verification history;
10. что происходит с private evidence;
11. что происходит с person-level data;
12. что происходит с account deletion;
13. как не оставить orphaned Deal;
14. что делает legal hold;
15. как учитывать backups;
16. какие retention periods нельзя придумывать;
17. как строится future legal/policy matrix.

---

## 1. Authority hierarchy

При конфликте применяется:

1. явная Owner-инструкция;
2. applicable law / binding legal policy;
3. accepted privacy/security/data-rights policy;
4. `31` person-level restrictions;
5. `29` data-rights governance;
6. `34` access/membership;
7. `35` sharing/disclosure;
8. `37` identity/account security;
9. current mechanical truth;
10. настоящий target lifecycle contract.

Ни Archive, ни Delete UI не могут переопределить legal/data-rights authority.

---

## 2. Current implementation reality

### 2.1. Current `main` does not establish general Deal deletion

Repository audit does not establish production:

- Deal archive endpoint;
- Deal delete endpoint;
- account delete endpoint;
- evidence purge engine;
- legal-hold engine;
- retention scheduler;
- backup deletion propagation;
- customer deletion dashboard.

Therefore:

> lifecycle UI must not be advertised as implemented until backend and policy exist.

### 2.2. Current assessment/session infrastructure is not lifecycle authority

The current assessment ledger may store or mutate workflow state.

It is not a general customer data lifecycle system.

### 2.3. No DELETE endpoint inference

A generic code occurrence of `delete` in JavaScript does not prove product deletion capability.

Only explicit product data lifecycle endpoints/processes count.

---

## 3. Why this contract exists

Earlier contracts intentionally left these questions open.

`22`:

> archive/delete require a separate lifecycle contract.

`24`:

> data deletion requires a separate lifecycle/legal contract.

`29`:

> exact retention is unresolved and deletion is not one action.

`31`:

> person-level production remains blocked without an approved retention/deletion/withdrawal/legal-hold matrix.

---

## 4. Critical boundary: semantic lifecycle vs legal retention schedule

This contract **does** define:

- meanings;
- state transitions;
- object relationships;
- safe UX;
- non-destructive history rules;
- technical enforcement expectations.

This contract **does not** define:

- number of retention days;
- jurisdiction-specific statutory period;
- tax-record retention period;
- employment/privacy-specific legal basis;
- litigation-hold duration.

---

## 5. Acceptance of `38` does not close `31` legal gate

Absolute.

Even if Owner later accepts this file:

> `31` remains production-blocked for person-level data until the approved legal/privacy retention matrix exists for the deployment context.

This file supplies the **product architecture** into which that matrix will plug.

---

## 6. Lifecycle operations are distinct

Never collapse these verbs:

```text
ARCHIVE
CLOSE
REMOVE ACCESS
WITHDRAW
SUPPRESS
DELETE RAW DATA
DELETE ACCOUNT
DELETE DEAL
REVOKE SHARE
REVOKE SECONDARY USE
REVOKE PUBLICATION
LEGAL HOLD
PURGE BACKUP
```

---

## 7. Archive

Archive means:

> remove a Deal from normal active-work surfaces while preserving governed historical records and access according to policy.

Archive does **not** mean deletion.

---

## 8. Close

Close describes business/engagement/transaction lifecycle.

Examples:

- transaction closed;
- transaction terminated;
- engagement completed;
- monitoring completed.

Close does not imply data deletion.

---

## 9. Remove access

Remove access means:

> identity can no longer access protected object.

It does not erase object.

Controlled by `34` / `37`.

---

## 10. Withdraw

Withdraw means:

> a previously granted participation/use permission is withdrawn according to applicable policy.

It can block future use without retroactively erasing every historical artifact.

---

## 11. Suppress from future use

Suppress means:

> record cannot enter a specified future purpose.

Examples:

- benchmark;
- model training;
- publication;
- new scoring;
- future named-leader forecast use.

---

## 12. Delete raw data

Delete raw data means:

> remove specified raw source material from active storage according to legal/policy authority.

It is not equivalent to erasing every derived historical record.

---

## 13. Delete account

Delete account means:

> terminate personal account identity/service relationship according to account lifecycle policy.

It does not automatically delete:

- Deals;
- released reports;
- organization records;
- audit history;
- evidence contributed under another lawful authority.

---

## 14. Delete Deal

Delete Deal is the most complex action.

It potentially affects:

- memberships;
- evidence;
- reports;
- forecasts;
- verification;
- monitoring;
- sharing;
- commercial/audit records.

Therefore no casual cascade.

---

## 15. Revoke share

Controlled by `35`.

Stops future server access.

Does not recall downloaded copies.

---

## 16. Revoke secondary-use permission

Stops eligible future secondary use according to policy.

Does not necessarily invalidate primary Deal use or historical released output.

---

## 17. Revoke publication permission

Stops future publication according to policy.

Treatment of already published material needs explicit legal/policy rule.

---

## 18. Legal hold

Legal hold means:

> ordinary deletion/purge may be suspended for specified records under authorized legal process.

Legal hold does not grant broader access.

---

## 19. Backup purge

Backup purge is infrastructure lifecycle.

It is different from active-store deletion.

---

## 20. Object lifecycle graph

Target conceptual relationship:

```text
Account
  ↕ membership
Deal
  ├─ Evidence
  ├─ Reports
  ├─ Forecasts
  ├─ Verification
  ├─ Monitoring
  ├─ Shares
  ├─ Commercial records
  └─ Audit records
```

Deleting one node does not imply automatic deletion of every connected node.

---

## 21. Deal business state ≠ data lifecycle state

Example:

```text
Deal transaction status: Terminated
Data lifecycle status: Active historical record
```

Perfectly valid.

---

## 22. Engagement status ≠ Deal state

Paid engagement can end while Deal history remains accessible/read-only.

---

## 23. Monitoring state ≠ Deal deletion

Monitoring complete does not erase baseline.

---

## 24. Verification complete ≠ lifecycle complete

Historical record may remain.

---

## 25. Account lifecycle ≠ Deal lifecycle

A user leaving service does not define future lifecycle of shared Deal.

---

## 26. Data class inventory

Lifecycle matrix must eventually cover at least:

1. account identity;
2. authentication/security metadata;
3. Deal metadata;
4. memberships;
5. public evidence references;
6. private uploaded documents;
7. derived evidence facts;
8. respondent raw answers;
9. respondent metadata;
10. 42Q raw answers;
11. 42Q derived internal state;
12. named-leader client-safe forecast;
13. released reports;
14. locked forecasts;
15. sealed forecast records;
16. verification records;
17. monitoring observations;
18. controls/interventions;
19. economic evidence;
20. Execution Evidence Packs;
21. share/distribution records;
22. commercial proposals/invoices metadata;
23. communication audit;
24. access/security audit;
25. R&D eligibility metadata;
26. benchmark/publication eligibility metadata;
27. backups;
28. derived indexes/search embeddings where applicable.

---

## 27. One universal retention timer is prohibited

Different classes can require different policies.

---

## 28. No invented retention durations

Do not put into UI/spec by default:

- 30 days;
- 90 days;
- 1 year;
- 7 years;
- indefinite.

Unless approved by applicable policy.

---

## 29. Retention policy matrix

Target external policy object:

```text
dataClass
purpose
jurisdictionContext
relationshipContext
legalBasisOrContractAuthority
retentionRule
retentionStartEvent
deletionOrSuppressionBehavior
legalHoldBehavior
backupBehavior
auditPreservationBehavior
policyVersion
effectiveAt
approvedBy
```

Not final schema.

---

## 30. Retention start event matters

Possible anchors:

- account closure;
- Deal closure;
- engagement completion;
- evidence collection;
- forecast verification;
- contract termination;
- legal obligation completion.

Exact choice varies by class/policy.

---

## 31. No arbitrary `createdAt + N`

Unless governing policy says so.

---

## 32. Purpose-specific retention

A record may be:

- no longer needed for active Deal work;
- still needed for audit;
- not eligible for R&D;
- not eligible for publication.

These are independent axes.

---

## 33. Primary-use retention

Purpose:

> operate and evidence specific Deal analysis.

---

## 34. Audit retention

Purpose:

> prove what was done, when, under which authority.

Can differ from raw evidence retention.

---

## 35. Track-record retention

Prospective forecast/verification integrity may require preserving bounded record.

Subject to lawful policy.

---

## 36. Security-log retention

Separate security purpose.

---

## 37. Commercial retention

Proposal/payment/invoice records may have separate obligations.

---

## 38. R&D retention

Requires separate rights eligibility.

No automatic inheritance.

---

## 39. Publication retention

Separate.

---

## 40. Archive target semantics

Conceptual Deal lifecycle categories:

```text
ACTIVE
ARCHIVED
DELETION_REVIEW
DELETION_PENDING
RESTRICTED_HOLD
```

Not production enum until implementation act.

---

## 41. Avoid user-facing `DELETED` unless true

If some required audit/legal records remain:

do not claim:

`All data deleted`

without precise scope.

---

## 42. Archived Deal

Target behavior:

- removed from primary active list;
- no active reminders/monitoring by default;
- no new evidence collection by default;
- historical authorized access may remain;
- report history preserved;
- sharing state handled separately.

---

## 43. Archive reversible

Archive should generally be reversible where policy/permissions allow.

---

## 44. Unarchive

Restores active workspace visibility.

Does not generate new analytical version.

---

## 45. Archive permission

Only Deal Administrator or lifecycle-authorized actor.

---

## 46. Archive confirmation

Yes.

But lighter than destructive deletion.

---

## 47. Archive does not revoke members

Unless explicit policy.

---

## 48. Archive does not delete shares automatically

Existing shares may remain until their own expiry/revoke policy.

---

## 49. Archive and notifications

Accepted `36`:

nonessential workflow notifications should stop.

---

## 50. Archive and monitoring

Active monitoring should be ended/paused explicitly before archive if required.

No silent destruction.

---

## 51. Archive and commercial scope

Does not refund/cancel engagement automatically.

Commercial state separate.

---

## 52. Transaction terminated

Product may mark business state:

`Transaction terminated`

if authoritative.

Data may remain for audit/history.

---

## 53. Deal completed

Can remain historically accessible.

---

## 54. Deal deletion request

Should enter review, not immediately cascade.

---

## 55. Why review

Need determine:

- requester authority;
- shared Deal ownership;
- contractual obligations;
- respondent/person rights;
- released reports;
- sealed forecasts;
- legal hold;
- active shares;
- billing/audit obligations;
- backup obligations.

---

## 56. Requester authority

A Deal Administrator is not automatically unilateral legal deletion authority over every record.

---

## 57. Multiple client stakeholders

Shared Deal deletion can affect other authorized users.

Needs policy.

---

## 58. Payer ≠ deletion authority

Billing contact cannot delete Deal merely because payer.

---

## 59. Respondent ≠ Deal deletion authority

Respondent may have person-data rights, not whole Deal authority.

---

## 60. Account holder ≠ organization authority

Same.

---

## 61. Deal delete request object

Conceptual:

```text
requestId
dealId
requestedBy
requestedAt
requestedScope
reason?
authorityBasis?
affectedDataClasses[]
legalHoldState
reviewState
decision
decisionAt
policyVersion
```

---

## 62. No single browser DELETE call for whole Deal

Not before lifecycle policy engine exists.

---

## 63. Deletion preview

Before irreversible action:

show categories affected.

Not hundreds of technical rows.

---

## 64. Confirmation language

Must distinguish:

`Archive deal`

from:

`Request deletion`

---

## 65. Strong confirmation for destructive action

Could require:

- re-authentication under `37`;
- explicit typed confirmation or equivalent;
- consequence summary.

Exact UX later.

---

## 66. Re-auth required

Deal deletion request/action is high sensitivity.

---

## 67. Deletion state visible

If request pending:

`Deletion review in progress`

or approved equivalent.

Do not lie:

`Deleted`

before completed.

---

## 68. Delete operation idempotent

Repeated request cannot produce inconsistent partial destruction.

---

## 69. Partial failure

Fail safely.

Need durable progress/audit.

---

## 70. Evidence lifecycle categories

For evidence:

```text
ACTIVE
WITHDRAWN_FROM_FUTURE_USE
RESTRICTED
DELETION_REVIEW
REMOVED_FROM_ACTIVE_STORE
```

Conceptual only.

---

## 71. Evidence archive ≠ delete

Could retain for history but hide from active evidence list.

---

## 72. Remove from analysis

Distinct action.

Potential meaning:

> future analysis versions cannot use this evidence.

---

## 73. Historical report impact

If evidence already supported released report:

cannot silently rewrite old report.

---

## 74. Future report impact

Future report generation must obey current eligibility/use state.

---

## 75. Withdraw before integration

If evidence never entered released report:

future-use suppression/deletion can be simpler.

Still audit.

---

## 76. Withdraw after integration

Need lineage analysis.

---

## 77. Affected derived artifacts

System should identify:

- report versions;
- forecasts;
- economic analysis;
- verification;
- Pack.

---

## 78. No automatic retroactive falsification

Source withdrawal does not mean original analytical conclusion was factually false.

---

## 79. Report status after source removal

Potential governed outcomes:

- remains historical with provenance note;
- superseded by revised report;
- withdrawn from client use;
- rights-review state.

Exact rule depends on source/legal authority.

---

## 80. Immutable released report

Never edit released version in place.

---

## 81. Revised report

Create new version.

---

## 82. Withdrawn report

Historical identity may remain for audit.

Client visibility policy separate.

---

## 83. Forecast lock preservation

Locked forecast must not be rewritten because evidence later removed.

---

## 84. Seal preservation

A seal is historical integrity record.

Do not delete/reseal casually.

---

## 85. Verification preservation

Verification linked to exact forecast/version.

---

## 86. Track-record eligibility

If evidence rights issue later arises:

record may remain historical but become ineligible for certain aggregate/public track record purpose.

Separate axes.

---

## 87. Raw private document deletion

Potentially physically removable from active storage when policy permits.

---

## 88. Derived source reference

May need retained bounded metadata:

- source ID;
- date;
- existence;
- prior role;
- deletion event.

Only if lawful.

---

## 89. Do not preserve deleted raw text in hidden cache

Deletion engine must cover:

- active object store;
- search index;
- extracted text cache;
- embeddings/vector index;
- processing cache.

Where applicable.

---

## 90. Derived embeddings

If derived from deleted/restricted private text:

must follow deletion/suppression policy.

---

## 91. LLM provider copies

Provider retention/control depends on actual architecture/contracts.

Need vendor policy review.

Do not claim deletion beyond our control unless verified.

---

## 92. Temporary processing files

Must have lifecycle policy.

---

## 93. Upload failure residue

Temporary artifacts should not persist indefinitely.

---

## 94. Evidence duplicates

Deletion scope must identify duplicate stored copies/references.

---

## 95. Deduplicated storage

Deleting one Deal reference must not erase same public/shared object needed lawfully elsewhere without reference accounting.

---

## 96. Private cross-Deal dedupe

Avoid by default unless rights architecture supports.

---

## 97. Respondent raw answers

Lifecycle must respect:

- purpose;
- consent/notice;
- client permissions;
- applicable legal policy.

---

## 98. Respondent withdrawal

Can block future use.

Does not automatically erase released report history.

---

## 99. Respondent identity mapping

May have different retention from raw answers.

---

## 100. De-identified derived evidence

Still governed.

De-identification does not create indefinite retention right.

---

## 101. 42Q raw responses

Highest-sensitivity lifecycle class.

---

## 102. 42Q withdrawal

Per accepted `31`:

- immediately block new scoring;
- block new mapping;
- block new forecast use;
- revoke participant access;
- mark affected derived artifacts for rights review;
- preserve audit as policy requires.

---

## 103. 42Q retention schedule

Still requires approved external matrix.

---

## 104. Internal type/function state

Cannot outlive governing permission automatically.

---

## 105. Named-leader released forecast

Historical released client artifact may have separate retention from raw 42Q.

---

## 106. Participant identity

Minimize.

---

## 107. Participant accountless session

Expiry/access termination separate from storage deletion.

---

## 108. Account deletion

Account lifecycle operation.

---

## 109. Account deletion request

Should check:

- last Deal Administrator issue;
- active shares;
- paid engagement;
- billing identity separation;
- legal/security holds;
- other Deals.

---

## 110. Last Administrator block

If account is last Deal Administrator:

require transfer or Deal lifecycle resolution before account deletion completes.

---

## 111. Account deletion and memberships

Memberships revoked/removed according to Deal policy.

---

## 112. Account deletion and authored evidence

Do not erase evidence simply because contributor account deleted.

---

## 113. Account deletion and audit

Audit can preserve stable pseudonymous/internal account ID where lawful.

---

## 114. Account deletion and email

Active identity/contact information should be removed/anonymized according to policy.

---

## 115. Account deletion and commercial records

May require separate lawful retention.

---

## 116. Account deletion and security logs

Separate retention.

---

## 117. Account deletion and public report delivery history

May have independent email/privacy treatment.

---

## 118. No orphaned Deals

Absolute.

---

## 119. Account disabled vs deleted

Distinct.

Disabled account may remain for security/contract reasons.

---

## 120. Account suspended

Temporary access state.

Not deletion.

---

## 121. Recovery pending

Not deletion.

---

## 122. Membership removal

Controlled by `34`.

Does not delete account.

---

## 123. Membership revocation history

Preserved in audit.

---

## 124. Share lifecycle

Controlled by `35`.

---

## 125. Share expired

Access ends.

Share record can remain as audit.

---

## 126. Share revoked

Same.

---

## 127. Downloaded artifact

Cannot be recalled.

---

## 128. Share record deletion

Audit/security/legal policy.

Do not casually erase evidence of external disclosure.

---

## 129. Communication audit

Accepted `36` dispatch records may require retention separate from email body.

---

## 130. Email body

Could have shorter/minimized retention.

Exact policy later.

---

## 131. Commercial proposal

Superseded/expired proposal remains commercial history where required.

---

## 132. Payment metadata

Separate financial/legal policy.

---

## 133. No billing deletion cascade

Deleting Deal does not necessarily erase invoice/payment records.

---

## 134. Procurement/security artifacts

Separate vendor/commercial retention.

---

## 135. Monitoring lifecycle

Monitoring engagement can:

- active;
- paused;
- complete.

Historical observations remain Deal records subject to retention.

---

## 136. Monitoring stop

Stops new collection/scheduling.

Not historical deletion.

---

## 137. Watchpoint observations

Retention aligned to Deal/history purpose.

---

## 138. Controls/interventions

Same.

---

## 139. Outcome verification

Track-record/audit importance.

---

## 140. Execution Evidence Pack

Released Pack immutable.

---

## 141. Pack deletion

External issued copy may already exist.

Internal artifact lifecycle still policy-controlled.

---

## 142. Pack source evidence deletion

Pack may need rights review.

Do not silently regenerate with changed history.

---

## 143. Public historical cases

Separate corpus.

Client Deal deletion does not affect public historical corpus.

---

## 144. Public source evidence reference

May remain if source itself public and Deal-specific derived record retention permits.

---

## 145. Private client corpus

No cross-client reuse by default.

---

## 146. R&D dataset

Deletion/withdrawal must propagate to eligibility.

---

## 147. Dataset manifest

Must enable affected-record identification.

---

## 148. R&D snapshot already used

Policy must define:

- future exclusion;
- model artifact implications;
- historical audit;
- published research treatment.

Do not promise impossible retroactive untraining.

---

## 149. Model training

No private-client training by default absent permission.

---

## 150. If future training enabled

Lifecycle/withdrawal implications need separate accepted policy.

---

## 151. Benchmark dataset

Rights withdrawal removes from future eligible builds where policy requires.

---

## 152. Published benchmark

Treatment of already published aggregate is policy/legal question.

---

## 153. Public case study

Publication permission revoked:

future publication behavior governed by policy.

---

## 154. No silent re-use after revocation

Absolute.

---

## 155. Legal hold object

Conceptual:

```text
holdId
scope
authorityReference
effectiveAt
releasedAt?
dataClasses[]
reasonCategory
approvedBy
policyVersion
```

Do not expose sensitive legal details broadly.

---

## 156. Legal hold is scoped

Can apply to:

- one Deal;
- one account;
- one evidence set;
- specified records.

---

## 157. Hold does not preserve all data universally

Only scoped classes/items.

---

## 158. Hold does not grant access

No user suddenly gets evidence because held.

---

## 159. Hold blocks purge where applicable

But ordinary access/reuse restrictions remain.

---

## 160. Hold release

Resume lifecycle calculation according to policy.

Do not assume immediate deletion.

---

## 161. Client UI for legal hold

Not required v1.

Could show bounded:

`Deletion is currently restricted by a legal or contractual requirement.`

Only if approved.

---

## 162. No legal details leak

---

## 163. Backups

Deletion architecture must distinguish:

- active store;
- replica;
- backup;
- immutable disaster-recovery copy.

---

## 164. Backup ≠ active use

Deleted/suppressed data in backup must not be restored into active use except disaster recovery process.

---

## 165. Restore after deletion

If old backup restored:

deletion/suppression tombstones must reapply.

---

## 166. Backup retention schedule

External infrastructure/legal policy.

No days invented.

---

## 167. Backup purge tracking

Need proof/process once deletion claim depends on it.

---

## 168. No immediate backup-erasure claim

Unless architecture guarantees.

---

## 169. User-facing deletion copy

Do not say:

`Permanently erased everywhere instantly`

unless true.

---

## 170. Better scoped copy

Example candidate:

`Your deletion request is being processed according to the applicable retention policy.`

Only when process exists.

---

## 171. Delete account CTA

Not shown until semantics implemented.

---

## 172. Delete Deal CTA

Not shown until lifecycle backend/policy implemented.

---

## 173. Archive CTA

Can be earlier because non-destructive.

Still requires real state.

---

## 174. Remove access CTA

Already governed by `34`.

---

## 175. Revoke share CTA

Governed by `35`.

---

## 176. Withdraw 42Q participation

Governed by `31`.

---

## 177. UX danger hierarchy

Least destructive:

```text
Archive
Remove my access
Revoke a share
Withdraw future use
Request deletion
```

Do not visually equate.

---

## 178. Destructive action placement

Not primary navigation.

---

## 179. Confirmation

Show:

- scope;
- irreversible effects;
- preserved records where known;
- pending-review nature where applicable.

---

## 180. No misleading trash icon

If action is archive, call it Archive.

---

## 181. No delete for remove membership

Call:

`Remove access`.

---

## 182. No delete for evidence suppression

Call:

`Remove from future analysis`

or approved exact copy.

---

## 183. No generic “Delete all data”

Until system can define exact scope and perform it.

---

## 184. Export before deletion

Could be offered if user rights permit.

Not mandatory.

---

## 185. Export itself governed by `35`

---

## 186. Deletion and active processing

Need stop/cancel new processing using affected raw data.

---

## 187. In-flight LLM analysis

If withdrawal/deletion occurs mid-process:

affected job must be cancelled or result quarantined if policy requires.

---

## 188. Async jobs

Lifecycle events must propagate.

---

## 189. Queue messages

Do not leave usable raw data indefinitely.

---

## 190. Search indexes

Deletion/suppression propagates.

---

## 191. Vector stores

Same.

---

## 192. Caches

Same.

---

## 193. Derived feature tables

Rights/purpose-specific.

---

## 194. Audit logs

Never store raw private evidence just because logging is convenient.

---

## 195. Tombstone

A minimal lifecycle tombstone may be necessary:

```text
objectId
deletedOrSuppressedAt
policyVersion
reasonCode
```

No raw content.

---

## 196. Tombstone purpose

Prevent:

- accidental resurrection;
- duplicate re-ingest;
- backup restore misuse;
- future-use leakage.

---

## 197. Tombstone retention

External policy.

---

## 198. Resurrection

Deleted/suppressed object cannot silently reappear from:

- backup;
- reindex;
- retry;
- sync;
- duplicate import.

---

## 199. Re-upload

New upload is new evidence object.

Do not silently reconnect to deleted source unless policy allows.

---

## 200. Hash matching

Hash match can detect duplicate but should not resurrect prohibited data.

---

## 201. Retention scheduler

Future durable service.

---

## 202. No browser timer

---

## 203. Scheduler input

Reads accepted retention matrix.

---

## 204. Scheduler action

Generates lifecycle tasks:

- review;
- suppress;
- purge;
- legal-hold skip;
- backup/tombstone update.

---

## 205. Human review

Needed for ambiguous legal/policy cases.

---

## 206. Human cannot override hard privacy prohibition casually

---

## 207. Policy versioning

Every lifecycle decision references policy version.

---

## 208. Policy changes

New policy cannot silently rewrite historical event timestamps.

---

## 209. Re-evaluation

Existing records may need recalculation under changed policy where legally required.

Explicit migration.

---

## 210. Grandfathering

Legal/policy decision.

Not designer default.

---

## 211. Jurisdiction context

Retention matrix may vary by:

- client entity;
- respondent relationship;
- processing purpose;
- contractual scope.

---

## 212. Location inference

Do not infer legal jurisdiction from IP alone.

---

## 213. Client-selected country

Not sufficient legal authority alone.

---

## 214. Legal basis record

For sensitive person data, use accepted `31` gate.

---

## 215. Unknown legal context

Fail closed for new high-sensitivity collection.

---

## 216. Existing low-sensitivity Deal data

Unknown deletion rule → do not auto-purge.

Escalate policy review.

---

## 217. Most restrictive default for secondary use

Per `29`.

If rights ambiguous:

exclude from R&D/benchmark/publication.

---

## 218. Primary service retention ambiguity

Cannot always simply delete; requires policy review.

---

## 219. Client request tracking

Deletion/withdrawal request needs durable audit.

---

## 220. Request status

Conceptual:

```text
RECEIVED
UNDER_REVIEW
BLOCKED_BY_HOLD
APPROVED
PARTIALLY_APPROVED
COMPLETED
DENIED_WITH_BASIS
```

Not final enum.

---

## 221. Partial completion

Possible:

- raw evidence removed;
- audit record retained;
- commercial record retained.

UI must explain scope.

---

## 222. No binary “done” if partial

---

## 223. Denial

If legal/contractual reason prevents deletion:

client-facing explanation must use approved legal copy.

---

## 224. Appeals/escalation

Legal process separate.

---

## 225. Service termination

Ending account/subscription does not equal deletion request.

---

## 226. Contract termination

May trigger retention clock according to policy.

---

## 227. Nonpayment

Must not erase analytical history.

Accepted principle from `22`.

---

## 228. Billing failure

Same.

---

## 229. Free account inactivity

No auto-delete period invented.

---

## 230. Dormant account

Future policy.

---

## 231. Dormant Deal

Could be archived later.

No automatic date here.

---

## 232. Inactivity emails

Not lifecycle authority.

---

## 233. User death/incapacity

Out of v1 scope; legal account process later.

---

## 234. Organization acquisition/transfer

Deal ownership/access transfer separate governance.

---

## 235. Organization termination

May require account/membership changes.

No automatic Deal deletion.

---

## 236. Data controller/processor roles

Legal matrix.

Not inferred here.

---

## 237. Data subject request

Legal/privacy operational process.

Product UI may later support intake.

---

## 238. Access request vs deletion request

Different.

---

## 239. Correction request

Different.

---

## 240. Restriction request

Different.

---

## 241. Portability/export request

Different.

---

## 242. No universal privacy-rights promise

Only applicable rights under governing context.

---

## 243. Privacy center

Not required first version.

---

## 244. Lifecycle audit

Minimum event examples:

```text
deal_archived
deal_unarchived
deal_deletion_requested
deal_deletion_decided
membership_revoked
evidence_withdrawn
evidence_active_store_removed
secondary_use_revoked
publication_permission_revoked
legal_hold_applied
legal_hold_released
account_deletion_requested
account_disabled
account_deleted_or_deidentified
backup_purge_confirmed
```

Only implemented events.

---

## 245. Audit actor

Store authorized actor/service.

---

## 246. Audit reason

Use bounded reason category where appropriate.

---

## 247. Audit does not store deleted raw content

---

## 248. Audit access

Restricted.

---

## 249. Client lifecycle history

Can show bounded statuses.

No internal legal/security details.

---

## 250. Security incident

May suspend deletion until containment/legal review where authorized.

---

## 251. Incident does not create indefinite hold automatically

---

## 252. Data breach

Separate incident-response policy.

---

## 253. Lifecycle metrics

Operational:

- deletion requests pending;
- purge failures;
- hold skips;
- stale jobs;
- backup reapplication checks.

Not marketing.

---

## 254. SLA

No deletion SLA invented.

Legal/policy may require response windows; separate.

---

## 255. Customer promise

No:

`Deleted within 24 hours`

without approved operational/legal authority.

---

## 256. Support script

Support must not promise deletion scope/timing beyond policy.

---

## 257. Account support

Cannot manually delete database rows ad hoc.

---

## 258. Engineer direct DB delete

Not normal lifecycle process.

---

## 259. Break-glass purge

Security/legal exceptional act with audit.

Separate policy.

---

## 260. Database foreign keys

Implementation must preserve referential/audit integrity.

---

## 261. Soft delete

Implementation technique only.

Not user-facing semantic guarantee.

---

## 262. Hard delete

Same.

---

## 263. Anonymization

Separate transform.

Do not call deletion unless legal/product definition permits.

---

## 264. Pseudonymization

Not deletion.

---

## 265. Encryption-key destruction

Potential lifecycle mechanism.

Requires architecture proof.

Do not claim automatically.

---

## 266. Crypto-shredding

Same.

---

## 267. Redaction

Not deletion.

---

## 268. Nulling field

May be part of de-identification, not automatically full deletion.

---

## 269. Aggregation

Does not automatically eliminate privacy obligations.

---

## 270. Historical verification truth

Do not fabricate history to satisfy deletion UX.

---

## 271. Client-visible history after raw deletion

May show:

`Source no longer retained`

if policy permits.

---

## 272. Evidence provenance after raw deletion

Preserve only minimal lawful provenance.

---

## 273. Missing source

Do not pretend source still inspectable.

---

## 274. Report replay

If source deleted, system may no longer be able to reproduce old result fully.

Do not claim reproducibility falsely.

---

## 275. Integrity vs privacy tension

Must be explicit.

Some records can remain for audit while raw material is removed.

---

## 276. No hidden shadow copy for reproducibility

Not allowed if deletion policy requires removal.

---

## 277. Public artifact already exported

Cannot recall.

---

## 278. Secure share

Can revoke future access.

---

## 279. Email attachment

Cannot recall.

---

## 280. Execution Pack recipient copy

Cannot recall after download.

---

## 281. Third-party processor deletion

If providers store data:

deletion workflow must include provider obligations/capabilities.

---

## 282. Provider acknowledgement

Audit where applicable.

---

## 283. Provider inability

Must be known before making deletion promise.

---

## 284. No unsupported vendor claim

---

## 285. Backup provider

Same.

---

## 286. Analytics vendor

Do not send private Deal data unnecessarily in first place.

---

## 287. Error-monitoring vendor

Scrub.

---

## 288. Email provider

Recipient metadata retention separate.

---

## 289. Payment provider

Financial lifecycle separate.

---

## 290. Auth provider

Identity lifecycle coordination needed.

---

## 291. Account deletion and auth provider

Terminate/revoke authenticator/account linkage according to provider design.

---

## 292. External IdP

Cannot delete corporate IdP account from MergeVue.

Only local linkage/session.

---

## 293. SSO offboarding

Local Deal permissions still revoke.

---

## 294. Data migration

Lifecycle state/tombstones must migrate.

---

## 295. Backup migration

Must not resurrect deleted data.

---

## 296. Environment cloning

Do not copy production private data to staging.

---

## 297. Fixtures

Use synthetic data.

---

## 298. Historical public corpus

Not populated from deleted client Deal silently.

---

## 299. Demo data

Same.

---

## 300. Search/RAG

Accepted `29`: no cross-client RAG.

Deletion propagates to Deal-local retrieval indexes.

---

## 301. AI memory/cache

Any system-side derived retrieval cache must obey lifecycle policy.

---

## 302. User-facing AI conversation

If future workspace assistant exists, deleting Deal may affect chat/history separately.

Not defined here.

---

## 303. Comments/tasks

Not current product.

No lifecycle semantics needed yet.

---

## 304. Organization directory

Not current.

---

## 305. Billing center

Not current.

---

## 306. Lifecycle center

Not required first.

---

## 307. First-version UX

At most:

- Archive Deal;
- Unarchive Deal;
- Remove access;
- Revoke share;
- Request deletion if backend/legal process real.

---

## 308. No `Delete everything` shortcut

---

## 309. Archive in Deal menu

Secondary action.

---

## 310. Deletion in settings/security area

High-friction deliberate action.

---

## 311. Account deletion

Account settings/lifecycle surface once implemented.

---

## 312. Evidence withdrawal

Evidence detail/action where permitted.

---

## 313. 42Q withdrawal

Participant/privacy path per `31`.

---

## 314. Loading state

Deletion request submission:

`Submitting request…`

Not:

`Deleting…`

if actual action is review.

---

## 315. Completed state

Only after lifecycle process confirms.

---

## 316. Failure state

Bounded:

`We couldn't process this request. Try again or contact support.`

Exact support path only if exists.

---

## 317. Partial completion copy

Must explain retained categories generally.

---

## 318. Legal-hold copy

Approved wording only.

---

## 319. Accessibility

Destructive actions:

- keyboard accessible;
- explicit labels;
- no color-only warnings;
- confirmation focus management;
- clear consequences;
- no accidental default destructive button.

---

## 320. Mobile

Destructive actions not placed next to normal navigation without separation.

---

## 321. Undo

Archive can support undo.

Hard deletion generally cannot promise undo.

---

## 322. Grace period

Could exist.

Exact period not invented.

---

## 323. Delayed purge

Could provide cancellation window.

External policy/implementation.

---

## 324. Deletion request cancellation

Allowed only while process state permits.

---

## 325. Legal hold prevents cancellation logic?

Separate.

---

## 326. Account export before deletion

Possible if user entitled.

---

## 327. Deal export before deletion

Possible per `35`.

---

## 328. Export does not block deletion indefinitely

---

## 329. Downloaded client copy

Out of server lifecycle after lawful export.

---

## 330. Data processor register

Operational/legal governance.

---

## 331. Record of processing

Legal/compliance layer.

Not client product spec.

---

## 332. Retention policy UI

Do not expose technical matrix directly.

---

## 333. Client-facing retention statement

Only approved legal/privacy copy.

---

## 334. No security/legal hallucination

If policy unknown:

`To be determined / unavailable`

internally.

Do not invent.

---

## 335. Fail-closed for collection

If required retention/legal basis missing for high-sensitivity collection:

block collection.

---

## 336. Fail-closed for deletion

If exact legal treatment unknown:

do not claim deletion complete.

Escalate review.

---

## 337. Fail-closed for secondary use

Unknown permission:

exclude.

---

## 338. Fail-closed for publication

Unknown:

do not publish.

---

## 339. Fail-closed for backup resurrection

Suppressed/deleted records stay suppressed after restore.

---

## 340. Acceptance-gate relationship with `31`

This document closes only:

> **product lifecycle semantics architecture**

It does not close:

> **jurisdiction-specific retention/deletion legal matrix**

Therefore named-leader production release remains gated until that external matrix exists.

---

## 341. Acceptance-gate relationship with `29`

This document resolves the previously deferred lifecycle semantics.

But `29` data-rights purpose/eligibility rules remain controlling.

---

## 342. Acceptance-gate relationship with `37`

Account deletion can now have target semantics.

Actual auth provider account removal still implementation-specific.

---

## 343. Acceptance-gate relationship with `34`

Member removal remains access action, not data deletion.

---

## 344. Acceptance-gate relationship with `35`

Share revoke remains share lifecycle, not Deal delete.

---

## 345. Acceptance-gate relationship with `36`

Notifications follow lifecycle events only after they are authoritative.

---

## 346. Production readiness gate

Before exposing Deal/account deletion UI:

- accepted lifecycle policy;
- authoritative requester permission;
- retention/legal matrix;
- legal-hold handling;
- lineage/affected-object discovery;
- active-store deletion/suppression mechanics;
- index/cache propagation;
- backup behavior;
- third-party processor handling;
- audit;
- idempotency;
- partial failure recovery;
- accurate client copy.

---

## 347. Person-level production readiness gate

Additional:

- legal basis matrix;
- person-data retention matrix;
- withdrawal behavior;
- participant notice;
- derived artifact rights-review;
- backup/index behavior.

---

## 348. Archive readiness gate

Much smaller:

- persisted archive state;
- permission;
- workspace filtering;
- notification behavior;
- monitoring interaction;
- audit.

---

## 349. Account deletion readiness gate

Need:

- identity lifecycle;
- last-admin check;
- membership transition;
- active Deal review;
- legal/commercial/security record treatment;
- auth-provider termination;
- audit.

---

## 350. Evidence deletion readiness gate

Need:

- source lineage;
- report impact discovery;
- raw/index/cache deletion;
- future-use suppression;
- audit;
- rights/legal policy.

---

## 351. Backup readiness gate

Need:

- restore-time tombstone reapplication;
- backup schedule policy;
- purge/expiry process;
- audit evidence.

---

## 352. Testing

At minimum:

1. Archive active Deal.
2. Unarchive.
3. Archive with active monitoring.
4. Remove member without deleting Deal.
5. Delete-account request as non-admin.
6. Delete-account request as last Administrator.
7. Deal deletion request with multiple members.
8. Deal deletion under legal hold.
9. Evidence withdrawal before integration.
10. Evidence withdrawal after released report.
11. Raw evidence purge propagates to search/index.
12. Backup restore does not resurrect suppressed data.
13. 42Q withdrawal blocks new scoring.
14. Share revoke does not claim downloaded file recall.
15. Released report remains immutable.
16. Locked forecast remains immutable.
17. R&D eligibility revoked.
18. Publication permission revoked.
19. Partial deletion correctly reported.
20. Idempotent repeated request.
21. Processor failure.
22. Scheduler retry.
23. Account provider deletion failure.
24. Wrong Deal ID/authority.
25. Audit contains no raw deleted content.

---

## 353. Security tests

- lifecycle endpoint requires auth;
- object authorization;
- re-auth for destructive action;
- CSRF protection where applicable;
- no IDOR;
- no bulk-delete privilege escalation;
- legal-hold bypass blocked;
- tombstone tampering blocked;
- deleted source inaccessible;
- restricted source not returned from cache/index;
- backup restore re-applies restrictions.

---

## 354. Data integrity tests

- no orphaned reports;
- no orphaned memberships;
- no dangling share authority;
- no duplicate deletion task;
- released version identity preserved;
- forecast/verification linkage preserved;
- audit event references stable IDs;
- deletion does not mutate historical timestamps.

---

## 355. Уровень доверия

### 355.1. Current lifecycle product capability

**Низкое / не подтверждено как general production capability.**

No general archive/delete/retention engine established in audited `main`.

### 355.2. Need for lifecycle contract

**Высокое доверие.**

`22`, `24`, `29`, `31`, `37` all defer material lifecycle questions to a separate contract/policy.

### 355.3. Archive semantics

**OWNER-ACCEPTED target design.**

Non-destructive archive is the controlling first lifecycle action unless a later higher-authority decision supersedes it.

### 355.4. Deletion semantics

**High-confidence architectural boundary:**

deletion is not one universal action.

### 355.5. Retention periods

**Unknown / intentionally not defined.**

Require legal/security/operational matrix.

### 355.6. Person-level retention gate

**Still external/blocking.**

This contract alone cannot satisfy `31` production release gate.

### 355.7. Backup deletion behavior

**Architecture requirement accepted only after this contract is accepted; exact schedule remains implementation/policy.**

### 355.8. Legal hold

**Required conceptual capability for policy architecture, not current product feature.**

---

## 356. Что мы сознательно НЕ меняем

1. Released report versions remain immutable.
2. Locked forecasts remain immutable.
3. Sealed historical records are not silently rewritten.
4. Verification vocabulary remains unchanged.
5. Membership removal remains governed by `34`.
6. Share revocation remains governed by `35`.
7. Notifications remain governed by `36`.
8. Authentication/account access remains governed by `37`.
9. Data-rights purpose/eligibility remains governed by `29`.
10. 42Q withdrawal rules remain governed by `31`.
11. Private evidence remains governed by `24`.
12. Archive is not deletion.
13. Account deletion is not Deal deletion.
14. Deal deletion is not automatic cascade.
15. Remove access is not delete.
16. Secondary-use withdrawal is not Deal deletion.
17. Publication revocation is separate.
18. Legal hold does not grant access.
19. Backup retention is not invented.
20. Retention periods are not invented.
21. No `Delete all data` button is authorized.
22. No deletion SLA is invented.
23. No universal 30/90-day policy.
24. No new route is authorized here.
25. No legal conclusion is made by this design contract.

---

## 357. Acceptance criteria

Contract passes only if:

1. Archive and delete are distinct.
2. Close and delete are distinct.
3. Remove access and delete are distinct.
4. Withdraw and delete are distinct.
5. Suppress future use and delete are distinct.
6. Account deletion and Deal deletion are distinct.
7. Share revoke remains separate.
8. Legal hold remains separate.
9. Backup purge remains separate.
10. One universal retention timer is prohibited.
11. Exact retention days are not invented.
12. Lifecycle matrix is data-class and purpose-specific.
13. Jurisdiction/relationship can affect policy.
14. Retention start event is explicit.
15. Secondary-use ambiguity defaults restrictive.
16. Unknown primary-use deletion treatment goes to review.
17. Archive removes from active workflow but preserves history.
18. Archive is reversible where permitted.
19. Archive does not silently revoke members.
20. Archive does not silently delete shares.
21. Archive stops nonessential workflow notifications.
22. Monitoring lifecycle is resolved before archive where needed.
23. Deal deletion begins with authority/policy review.
24. Deal Administrator is not automatically universal legal deletion authority.
25. Billing contact cannot delete Deal by payer status.
26. Respondent cannot delete entire Deal.
27. Account holder cannot delete organization data solely by account ownership.
28. Deletion request is durable/audited.
29. Destructive action uses re-authentication.
30. No casual single-call cascade.
31. Partial failure is recoverable/auditable.
32. Evidence withdrawal before integration is distinguished from after integration.
33. Source withdrawal does not rewrite old report.
34. Future report obeys current evidence eligibility.
35. Affected derived artifacts can be identified.
36. Released report never mutates in place.
37. Revised report creates new version.
38. Forecast lock remains historical.
39. Seal remains historical integrity record.
40. Verification remains linked to exact forecast.
41. Track-record eligibility can change without deleting history.
42. Raw private source can be deleted separately from bounded audit metadata.
43. Search/index/cache deletion is included.
44. Embeddings follow source lifecycle.
45. Provider copies are considered before deletion promises.
46. Temp processing files have lifecycle.
47. Duplicate storage does not create hidden retention.
48. Respondent withdrawal blocks future use as applicable.
49. Respondent identity/raw answer may have distinct retention.
50. 42Q is high-sensitivity class.
51. 42Q withdrawal follows `31`.
52. 42Q legal retention matrix remains required.
53. Named-leader released forecast remains separate from raw responses.
54. Account deletion checks last Administrator.
55. Account deletion does not erase contributed evidence automatically.
56. Account deletion can preserve bounded audit where lawful.
57. Account deletion coordinates with auth provider.
58. No orphaned Deals.
59. Account suspension/disable differs from deletion.
60. Share expiry/revoke does not erase audit.
61. Downloaded artifact cannot be recalled.
62. Communication audit has separate lifecycle.
63. Commercial records have separate lifecycle.
64. Billing records do not cascade with Deal deletion.
65. Monitoring stop does not delete history.
66. Execution Pack remains immutable once released.
67. Pack rights can enter review after source deletion.
68. Public historical corpus stays separate.
69. R&D/benchmark eligibility responds to withdrawal.
70. No retroactive untraining promise.
71. Legal hold is scoped.
72. Legal hold does not broaden access.
73. Legal hold blocks applicable purge only.
74. Backup is not active use.
75. Restore reapplies deletion/suppression.
76. No instant backup-erasure promise.
77. User-facing copy scopes deletion accurately.
78. No `Permanently erased everywhere instantly` unless proven.
79. Archive CTA can precede delete capability.
80. Delete CTA blocked until backend/policy real.
81. Remove access copy is not Delete.
82. Evidence suppression copy is not Delete.
83. No fake `Delete all data`.
84. In-flight processing reacts to withdrawal/deletion.
85. Async jobs cannot continue unlawful future use.
86. Search/vector indexes purge/suppress.
87. Logs do not preserve raw deleted evidence.
88. Tombstones contain no raw content.
89. Tombstones prevent resurrection.
90. Re-upload is a new object.
91. Retention scheduler is durable/server-side.
92. Scheduler uses approved matrix.
93. Human review handles ambiguous cases.
94. Policy version is stored.
95. Policy changes do not rewrite historical timestamps.
96. Legal jurisdiction is not inferred from IP alone.
97. Unknown legal basis blocks high-sensitivity collection.
98. Client requests have durable status.
99. Partial completion is disclosed accurately.
100. Service termination is not deletion.
101. Nonpayment is not deletion.
102. Inactivity period is not invented.
103. Privacy rights are not universally promised outside applicable context.
104. Lifecycle audit records actions without raw deleted content.
105. Security incidents do not create indefinite hold automatically.
106. No deletion SLA invented.
107. Support cannot overpromise.
108. Engineers do not perform ad hoc normal deletion.
109. Soft delete/hard delete are implementation details.
110. Anonymization is not automatically deletion.
111. Pseudonymization is not deletion.
112. Redaction is not deletion.
113. Historical verification truth is not rewritten.
114. Deleted-source provenance is minimal/lawful.
115. Reproducibility claims reflect source availability.
116. No hidden shadow copy defeats deletion.
117. External exported copies cannot be recalled.
118. Third-party processors are part of lifecycle scope.
119. Provider acknowledgements are audited where applicable.
120. Provider limitations constrain user promises.
121. Auth/email/payment vendors have separate lifecycle duties.
122. Migration preserves tombstones/lifecycle state.
123. Staging is not populated casually with production data.
124. Synthetic fixtures preferred.
125. Deal-local search/RAG respects deletion.
126. AI retrieval caches follow lifecycle.
127. First-version lifecycle UX remains minimal.
128. Archive is secondary, non-destructive action.
129. Delete/request deletion is high-friction.
130. 42Q withdrawal remains accessible through governed person-data flow.
131. Loading copy does not falsely say deletion is complete.
132. Completed status only after actual completion.
133. Partial completion is not shown as full deletion.
134. Accessibility requirements apply.
135. Hard deletion does not promise undo.
136. Grace period is not invented.
137. Deletion request cancellation depends on real state.
138. Export-before-delete remains rights-controlled.
139. Retention policy UI does not expose internal legal matrix casually.
140. Acceptance of `38` does not close `31` legal/retention release gate.

---


## 357.1. Owner acceptance boundary

**Owner acceptance состоялся 2026-09-16.**

С этого момента `38 v1.0` является **controlling Deal, account and data lifecycle, retention and deletion design contract** для MergeVue.

Owner acceptance включает как controlling target policy:

- `ARCHIVE ≠ DELETE`;
- `ACCOUNT DELETE ≠ DEAL DELETE`;
- `REMOVE ACCESS ≠ DELETE DATA`;
- `WITHDRAW USE ≠ ERASE HISTORY`;
- `RAW EVIDENCE ≠ DERIVED RECORD`;
- released reports remain immutable;
- locked/sealed forecasts and verification history are not silently rewritten;
- legal hold may suspend deletion but never expands access;
- backup data is not active-use authority;
- restoration must reapply deletion/suppression state;
- one universal retention timer is prohibited;
- retention is data-class, purpose and governing-context specific;
- no `Delete all data` shortcut without exact enforceable semantics;
- account deletion cannot orphan a governed Deal;
- destructive actions require governed authority, audit and high-sensitivity security treatment;
- lifecycle changes must propagate to search/index/cache/R&D eligibility where applicable;
- secondary-use uncertainty defaults restrictive;
- deletion/withdrawal cannot be represented as complete until the actual applicable lifecycle process is complete.

Owner acceptance **не означает автоматически**:

- that any legal retention duration is approved;
- that a 30-day, 90-day, 7-year or indefinite schedule exists;
- that Archive/Delete/account-deletion UI or endpoints are implemented;
- that a legal-hold engine exists;
- that backup purge is implemented;
- that third-party processor deletion has been verified;
- that deletion SLAs are approved;
- that jurisdiction-specific privacy/legal obligations are resolved;
- that person-level production is released.

**Критическая граница:** acceptance of `38` closes the **product lifecycle-semantics architecture only**. It does **not** close the separate jurisdiction-specific legal/privacy retention-deletion-withdrawal gate required by accepted `31`. Until that approved matrix exists for the deployment context, the corresponding person-level production gate remains open and must fail closed.


## 358. Implementation sequence

### Phase 0 — terminology freeze

Define distinct internal concepts:

```text
archive
access revoke
use withdrawal
raw-data removal
Deal deletion request
account deletion request
legal hold
backup purge
```

### Phase 1 — non-destructive Archive

Implement first:

- persisted archive state;
- permission;
- filter active/archived;
- unarchive;
- notification/monitoring integration;
- audit.

### Phase 2 — lifecycle inventory + lineage

System must locate affected:

- evidence;
- reports;
- forecasts;
- Pack;
- indexes;
- shares;
- participant data.

### Phase 3 — policy engine interface

Implement a machine-readable retention/deletion policy input.

Do not hard-code arbitrary durations.

### Phase 4 — evidence withdrawal/suppression

Implement:

- future-use gate;
- derived artifact rights review;
- index/cache propagation;
- audit.

### Phase 5 — account lifecycle

Implement:

- deletion request;
- last-admin check;
- membership handling;
- identity provider coordination;
- audit.

### Phase 6 — Deal deletion workflow

Only after:

- authority review;
- policy matrix;
- legal hold;
- lineage;
- partial-failure recovery.

### Phase 7 — backup/tombstone hardening

Implement:

- restore-time suppression;
- provider/process reconciliation;
- purge audit.

### Phase 8 — person-level production closure

Plug approved jurisdiction-specific `31` matrix into lifecycle engine.

Only then can the retention/deletion portion of `31` release gate be considered for closure.

---

## 359. External/downstream decisions still required

1. actual retention duration by data class;
2. jurisdiction-specific legal basis;
3. contract/tax/accounting retention;
4. security-log retention;
5. audit-record retention;
6. forecast/seal/verification lawful retention;
7. exact legal-hold procedure;
8. backup retention/purge schedule;
9. processor/vendor deletion commitments;
10. response windows for data-subject/client requests;
11. grace/cancellation period if any;
12. support escalation process;
13. account deletion legal copy;
14. Deal deletion legal copy;
15. person-level retention matrix required by `31`;
16. treatment of already published aggregate/case study after rights withdrawal;
17. model-training withdrawal implications if private training is ever enabled;
18. exact lifecycle enums/schema;
19. exact lifecycle routes/UI;
20. owner/delegated authority for policy updates.

---

## 360. Финальная формула

> **MergeVue must never use one “Delete” button to represent several legally and methodologically different actions.**

> **Archive changes active workflow visibility. Remove access changes authorization. Withdraw changes permitted future use. Delete raw data changes storage. Account deletion changes identity. Deal deletion is a governed multi-object lifecycle process. Legal hold can pause deletion, but never broaden access.**

> **Released analytical history is not silently rewritten. Where lawful, raw evidence can disappear while a minimal audit/identity record remains; future analysis must respect the new eligibility state.**

> **Retention is purpose-specific and data-class-specific. This contract defines the architecture, not the number of days. Person-level production remains blocked until the separate approved legal/retention matrix required by `31` exists.**
