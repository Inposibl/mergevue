# 40. Контракт privacy, legal basis, data processing и jurisdiction policy MergeVue

**Файл:** `40_MERGEVUE_PRIVACY_LEGAL_BASIS_DATA_PROCESSING_AND_JURISDICTION_POLICY_CONTRACT.md`  
**Версия:** 1.0  
**Дата:** 2026-09-16  
**Язык документа:** русский  
**Язык клиентского интерфейса:** только American English  
**Рынок первой версии:** США  
**Статус:** **OWNER-ACCEPTED / CONTROLLING PRIVACY, LEGAL BASIS, DATA PROCESSING AND JURISDICTION PRODUCT/LEGAL INTERFACE CONTRACT; НЕ ЯВЛЯЕТСЯ ЮРИДИЧЕСКИМ ЗАКЛЮЧЕНИЕМ, DPA, PRIVACY POLICY ИЛИ COUNSEL APPROVAL**  
**Owner acceptance:** **2026-09-16**  
**Аудитная база `main`:** `92c2e0df199d017082b653e72b5a6bfbf5bf6a31`  
**Связанные controlling contracts:** `23`, `24`, `29`, `31`, `34`, `35`, `36`, `37`, `38`, `39`  
**Главный принцип:** product может исполнять только заранее утверждённую legal/privacy policy; product/model/Owner не придумывают legal basis, controller/processor roles, retention periods или cross-border transfer authority.  
**Ключевые инварианты:** `LEGAL BASIS BEFORE COLLECTION`, `PURPOSE BEFORE DATA`, `NOTICE BEFORE PARTICIPATION`, `CONSENT ≠ UNIVERSAL LEGAL BASIS`, `CLIENT AUTHORITY ≠ PERSON-DATA AUTHORITY`, `ACCESS ≠ REUSE RIGHTS`, `CONTRACT ≠ PUBLICATION RIGHTS`, `DATA MINIMIZATION`, `PURPOSE LIMITATION`, `JURISDICTION IS EXPLICIT`, `PROCESSOR ROLE IS NOT INFERRED`, `NO DARK CONSENT`, `NO BUNDLED MARKETING`, `NO FAKE ANONYMITY`, `NO FAKE CONFIDENTIALITY`, `FAIL CLOSED WHEN LEGAL AUTHORITY IS ABSENT`

---

## 0. Назначение

Этот документ определяет product/legal interface:

```text
data purpose
→ data class
→ relationship context
→ jurisdiction context
→ controller / processor roles
→ approved legal basis / contractual authority
→ notice / consent requirements
→ permitted recipients
→ permitted processing
→ retention/lifecycle rule
→ transfer/subprocessor rule
→ product eligibility
```

Он отвечает на вопросы:

1. когда MergeVue может собирать personal data;
2. что должен знать product до первого вопроса/загрузки;
3. почему client permission недостаточно для respondent/person data;
4. когда consent нужен, а когда он не является legal basis;
5. что значит controller/processor determination;
6. как jurisdiction влияет на product eligibility;
7. как DPA/contractual authority соотносятся с UX;
8. как legal matrix подключается к `38`;
9. как participant notice подключается к `31`;
10. как обрабатывать withdrawal;
11. как задаются recipients/downstream uses;
12. как работает cross-border/provider gate;
13. почему privacy policy text не равен product enforcement;
14. какие юридические решения остаются за counsel;
15. что именно должно существовать, чтобы закрыть legal/privacy gate `31`.

---

## 1. Authority hierarchy

При конфликте применяется:

1. applicable law / binding legal advice;
2. signed client contract / DPA / accepted contractual authority;
3. approved privacy/legal policy matrix;
4. explicit Owner product-governance decision, если не противоречит 1–3;
5. accepted `31` person-level contract;
6. accepted `29` data-rights contract;
7. accepted `38` lifecycle contract;
8. accepted `34–37`, `39` security/access contracts;
9. current implementation;
10. настоящий product/legal interface contract.

Owner acceptance не может создать legal basis там, где law/contract/counsel его не подтверждают.

---

## 2. Current controlling blocker

Accepted `31 v2.1` leaves four external gates.

One is:

> **Legal/privacy gate: approved legal-basis + retention/deletion/withdrawal/legal-hold matrix.**

This file specifies the machine/product structure required to consume that legal decision.

It does **not** itself supply jurisdiction-specific legal advice.

---

## 3. Current implementation reality

Audited current product architecture does not establish a general production:

- jurisdiction-policy engine;
- controller/processor registry;
- legal-basis registry;
- DPA eligibility engine;
- participant privacy-notice version gate;
- cross-border transfer policy engine;
- subprocessor policy registry;
- data-subject request workflow;
- consent ledger for all relevant purposes.

Therefore no production claim may imply those controls already exist.

---

## 4. Legal basis is not product default

Product must never choose:

```text
CONSENT
CONTRACT
LEGITIMATE_INTERESTS
LEGAL_OBLIGATION
```

or any jurisdiction-specific equivalent merely because implementation needs a value.

---

## 5. Counsel-approved matrix

Required input:

```text
Jurisdiction × Relationship × Purpose × Data Class
→ Approved Authority / Requirements / Prohibitions
```

Product consumes this matrix.

Product does not author it.

---

## 6. Relationship context

Examples that may matter legally:

- employee;
- executive;
- contractor;
- board member;
- seller representative;
- buyer representative;
- adviser;
- respondent;
- external recipient;
- public-source subject.

Exact legal significance belongs to counsel.

---

## 7. Purpose context

At minimum distinguish:

- organizational Deal assessment;
- respondent evidence collection;
- private evidence review;
- named-leader behavior forecast;
- monitoring;
- outcome verification;
- secure sharing;
- client service operations;
- security/audit;
- billing/procurement;
- R&D/benchmark;
- publication/case study;
- marketing.

---

## 8. Data-class context

At minimum distinguish:

- account identity;
- business contact data;
- respondent identity;
- respondent raw answers;
- private uploaded documents;
- private document metadata;
- derived organizational evidence;
- raw 42Q answers;
- 42Q derived internal state;
- internal type/function;
- named-leader client-safe forecast;
- economic evidence;
- report/forecast history;
- audit/security logs;
- marketing preference;
- R&D eligibility metadata.

---

## 9. No universal data category

Do not treat all as:

`customer data`

for legal enforcement.

---

## 10. LegalBasisDecision

Target conceptual authority record:

```text
legalBasisDecisionId
jurisdiction
relationshipContext
purpose
dataClasses[]
controllerIdentity
processorIdentity?
approvedAuthorityType
authorityReference
noticeVersion
consentRequired?
permittedRecipients[]
permittedDownstreamUses[]
crossBorderConditions?
retentionPolicyRef
withdrawalPolicyRef
legalHoldPolicyRef
effectiveAt
expiresAt?
approvedBy
decisionVersion
```

Exact schema later.

---

## 11. Legal basis gate

Before gated collection:

```text
valid decision exists
AND
decision covers jurisdiction
AND
relationship matches
AND
purpose matches
AND
data class matches
AND
decision is effective
AND
required notice/consent state satisfied
→ collection eligible
```

Else:

`LEGAL_BASIS_NOT_ESTABLISHED`.

---

## 12. Person-level hard gate

For 42Q/named-leader:

> first question is blocked if legal-basis decision absent, expired or mismatched.

Accepted `31` remains controlling.

---

## 13. Organizational respondent flow

Respondent evidence can also involve personal data.

Need applicable policy/notice even though output is organization-level.

---

## 14. Client upload authority

Client ability to upload a document does not establish MergeVue's right to:

- republish it;
- use it for benchmark;
- use it for model training;
- share it with future buyer;
- infer person-level characteristics beyond accepted purpose.

---

## 15. Client instruction ≠ universal lawful basis

Absolute.

---

## 16. Controller/processor determination

Must be explicit per processing context where legally relevant.

Do not automatically assume:

`MergeVue is always processor`

or:

`MergeVue is always controller`.

---

## 17. Role can vary by purpose

Potentially:

- providing client-directed service;
- operating account/security;
- improving service;
- publishing case study;

may have different legal-role analysis.

Counsel decides.

---

## 18. No controller/processor UX guess

Client UI should not expose legal-role labels unless approved and useful.

---

## 19. DPA

A DPA can govern relevant processing but does not automatically:

- permit every data class;
- permit publication;
- permit R&D;
- permit every subprocessor;
- satisfy person-level notice;
- resolve international transfer.

---

## 20. Contract authority

Commercial scope acceptance does not itself equal privacy authority for every downstream use.

---

## 21. Payment ≠ legal basis

Absolute.

---

## 22. Named-leader fee ≠ legal eligibility

Accepted `$5,000 per named leader` remains purchasable only after all `31` gates.

---

## 23. Consent semantics

Consent, where used, must be:

- specific enough for governing purpose;
- accurately described;
- recorded;
- withdrawable where applicable;
- not bundled with unrelated marketing;
- not prechecked;
- not coerced by deceptive UX.

Exact legal standard determined by counsel.

---

## 24. Consent is not always required

Do not claim:

`We need consent for all data processing`

unless approved legal policy says so.

---

## 25. Consent is not always sufficient

Do not claim:

`They clicked consent, so any use is allowed`.

---

## 26. Marketing consent separate

Absolute.

Product/service participation cannot silently subscribe marketing.

---

## 27. Collaboration invite ≠ consent for R&D

---

## 28. Paid contract ≠ consent for publication

---

## 29. 42Q completion ≠ consent for case study

---

## 30. Report sharing ≠ consent for model training

---

## 31. Consent ledger

Where consent is governing authority, target record:

```text
consentId
personId
purpose
noticeVersion
scope
capturedAt
source
status
withdrawnAt?
policyVersion
```

No dark patterns.

---

## 32. Notice semantics

Notice explains processing.

Notice does not itself create legal basis if law requires another authority.

---

## 33. Notice before collection

For person-level collection:

notice must be available before first substantive question/data submission.

---

## 34. Notice content architecture

Where applicable, approved notice should cover:

- purpose;
- relevant organization/controller identity;
- MergeVue role where approved;
- data categories;
- recipients/categories;
- raw-answer visibility;
- retention/lifecycle explanation;
- rights/withdrawal route;
- transfer/provider information where required;
- contact/legal links.

Exact text comes from counsel.

---

## 35. Product does not draft final legal text

This contract defines required slots and product behavior.

---

## 36. Privacy policy

Static page is necessary but not sufficient.

---

## 37. Policy link ≠ enforcement

Need machine rules.

---

## 38. No fake privacy center

Do not expose toggles that backend cannot enforce.

---

## 39. No fake anonymity

Accepted principle.

Do not say:

`anonymous`

if MergeVue/client can map identity.

---

## 40. No fake confidentiality

Do not say:

`100% confidential`

without precise architecture/legal basis.

---

## 41. Better language

Use factual statements such as:

`Your responses are used for this assessment according to the applicable privacy notice.`

Only after approved notice exists.

---

## 42. Raw respondent visibility

Notice must accurately state whether:

- raw answers are never shared;
- limited operators can access;
- client gets derived output only.

Do not overstate.

---

## 43. 42Q participant visibility

Client does not receive raw answers/internal type.

Notice should align.

---

## 44. Withdrawal

Withdrawal is purpose-specific.

It does not mean:

`erase every historical record instantly`.

---

## 45. Withdrawal record

Conceptual:

```text
withdrawalId
personId
purpose
effectiveAt
affectedDataClasses[]
policyRef
downstreamReviewState
```

---

## 46. Immediate product effect

Where accepted `31` applies:

- stop new scoring;
- stop new type/function mapping;
- stop new named-leader forecast use;
- revoke participant access;
- mark derived artifacts rights-review.

---

## 47. Historical treatment

Follows `38` + legal matrix.

---

## 48. Legal hold

Withdrawal does not automatically override lawful hold.

---

## 49. Legal hold does not permit new use

Preservation ≠ processing expansion.

---

## 50. Retention matrix integration

`38` defines lifecycle mechanics.

`40` supplies policy authority reference.

---

## 51. Retention policy object

Conceptual approved legal input:

```text
retentionPolicyId
jurisdiction
relationshipContext
purpose
dataClass
startEvent
retentionRule
deletionBehavior
withdrawalBehavior
legalHoldBehavior
backupBehavior
auditPreservation
effectiveAt
approvedBy
```

---

## 52. No durations in `40`

This file does not set days/years.

---

## 53. Why

Retention duration is legal/contractual/operational fact, not product design preference.

---

## 54. Jurisdiction

Must be explicit when legal decision depends on it.

---

## 55. Jurisdiction source

Should come from verified engagement/legal context, not:

- IP geolocation alone;
- browser locale;
- currency;
- user language.

---

## 56. Deal jurisdiction ≠ participant jurisdiction

Could differ.

---

## 57. Client entity jurisdiction ≠ respondent work location

Could differ.

---

## 58. Multi-jurisdiction Deal

May require multiple policy decisions.

---

## 59. Unknown jurisdiction

For high-sensitivity processing:

fail closed.

---

## 60. U.S. launch market

Commercial first market is U.S.

That does not mean all U.S. legal contexts are identical.

---

## 61. State-specific requirements

Counsel matrix may need state granularity.

Product architecture must support it.

---

## 62. International use

Outside approved contexts:

manual legal eligibility review.

Accepted `33` already requires commercial/legal review outside standard launch market.

---

## 63. Participant location

Do not infer from nationality.

---

## 64. Employment relationship

May affect legal analysis.

Product stores only minimum classification required by approved policy.

---

## 65. No unnecessary protected/sensitive attributes

Do not collect:

- race;
- religion;
- medical information;
- sexual orientation;
- political affiliation;
- union status;

unless a separately approved lawful use case exists.

They are not needed for MergeVue core methodology.

---

## 66. Questionnaire content

Canonical questionnaire remains unchanged.

Privacy product layer cannot add intrusive questions casually.

---

## 67. Sensitive person data

42Q is high-sensitivity in MergeVue governance even if legal category varies by jurisdiction.

Use stricter internal safeguards.

---

## 68. Named-leader output

Client-safe behavior forecast only.

No internal type/function disclosure.

---

## 69. Data minimization

Collect only data needed for accepted purpose.

---

## 70. Optional fields

Do not make optional profile data mandatory for convenience.

---

## 71. Derived data

Derived inference remains personal data governed by policy where applicable.

Do not treat inference as ownerless.

---

## 72. Inferred type/function

Restricted internal state.

---

## 73. Organizational inference

Can still derive from personal respondent statements; privacy duties may still apply to raw source.

---

## 74. Public-source personal data

Public availability does not automatically permit every processing purpose.

Legal matrix decides.

---

## 75. Scraping

No broad personal-data scraping authority implied by methodology.

---

## 76. Public professional profiles

May be evidence only within approved methodology/purpose.

---

## 77. Social media

No automatic person-level profiling.

---

## 78. Criminal/background data

Not core MergeVue purpose.

Do not collect/process by default.

---

## 79. Health data

Not core.

---

## 80. Biometric data

Not collected by MergeVue auth even if device passkey uses platform biometrics.

---

## 81. Cookies/auth data

Essential authentication/security processing governed separately from marketing tracking.

---

## 82. Analytics

Privacy-safe product analytics must avoid Deal/private/person-level content.

---

## 83. Marketing analytics

Separate purpose.

---

## 84. Cross-purpose use

Cannot reuse transactional/security data for unrelated marketing merely because technically available.

---

## 85. Security logs

Can contain personal identifiers minimally.

Purpose = security/audit.

Retention = separate matrix.

---

## 86. Support data

Purpose = support.

Does not become R&D corpus.

---

## 87. Incident data

Purpose = security/legal response.

Does not become M&A analytical evidence.

---

## 88. Billing data

Purpose = commercial/financial operations.

Does not become Deal evidence.

---

## 89. Procurement contacts

Purpose-specific.

---

## 90. Share recipients

Purpose-specific recipient identity.

No marketing by default.

---

## 91. External advisers

Access/recipient rights do not create reuse rights.

---

## 92. Future buyers

Third-party disclosure requires separate rights assessment.

---

## 93. Publication

Separate purpose.

Requires publication authority.

---

## 94. Benchmark

Separate purpose.

---

## 95. R&D

Separate purpose.

---

## 96. Model training

Separate purpose.

No private-client training by default.

---

## 97. Product improvement

Must be specifically defined, not catch-all magic phrase.

---

## 98. “Improve our services”

Too broad to act as product permission by itself.

---

## 99. Secondary-use default

Most restrictive per accepted `29`.

---

## 100. Rights ledger

Target per record/purpose:

```text
PRIMARY_DEAL_USE
RND_USE
BENCHMARK_USE
PUBLICATION_USE
MODEL_TRAINING_USE
EXTERNAL_DISCLOSURE
```

Each has own authority state.

Exact enum later.

---

## 101. No rights inheritance

`PRIMARY_DEAL_USE = allowed`

does not imply others.

---

## 102. No consent inheritance

Same.

---

## 103. No client-role inheritance

Deal Administrator cannot grant R&D/publication simply by role toggle.

---

## 104. Recipient rights

Explicit.

---

## 105. Data processing agreement

If DPA required:

commercial activation may depend on signed/accepted DPA state.

---

## 106. DPA state ≠ Deal analytical state

Separate.

---

## 107. DPA state conceptual

```text
NOT_REQUIRED
REQUIRED_NOT_EXECUTED
EXECUTED
SUPERSEDED
```

Exact legal/product enum later.

---

## 108. No DPA self-serve if legal process manual

---

## 109. DPA version

Store exact accepted version.

---

## 110. Terms version

Same.

---

## 111. Privacy notice version

Same.

---

## 112. Contract changes

Do not retroactively claim old consent/authority covered new purpose.

---

## 113. Material purpose change

Requires legal review and possibly new notice/authority.

---

## 114. Subprocessors

Product/provider architecture may involve:

- cloud hosting;
- email;
- authentication;
- LLM provider;
- file processing;
- monitoring/security.

Exact inventory must be current.

---

## 115. No fictional subprocessor list

---

## 116. Subprocessor purpose

Record what each provider receives/does.

---

## 117. Minimum necessary transfer

Do not send full Deal when service needs email address only.

---

## 118. LLM provider boundary

Before private/client data is sent to external model:

approved provider/data-processing posture must cover:

- data class;
- purpose;
- retention;
- training/use;
- security;
- transfer/jurisdiction;
- deletion;
- logging;
- subprocessing.

---

## 119. Consumer AI endpoint

Not acceptable default for live private client data.

---

## 120. Enterprise/no-training terms

May be required.

Must be verified, not assumed.

---

## 121. Provider retention

Record actual applicable configuration/contract.

---

## 122. Provider training

No claim unless contract/configuration supports.

---

## 123. Provider region

Where material, approved policy must cover.

---

## 124. Provider outage fallback

Cannot route private data to unapproved provider.

---

## 125. Model routing

Method/model-routing policy remains separate.

Privacy eligibility constrains which provider may be used.

---

## 126. Provider admissibility object

Conceptual:

```text
providerId
service
permittedDataClasses[]
permittedPurposes[]
jurisdictions[]
trainingUseState
retentionState
transferBasisRef?
dpaRef?
securityApprovalRef
effectiveAt
reReviewAt?
```

---

## 127. Provider unknown

Fail closed for private/person-level data.

---

## 128. Cross-border transfer

Legal mechanism belongs to approved legal matrix.

Product cannot infer.

---

## 129. Transfer region UX

Do not promise:

`Data stays in the U.S.`

unless verified end-to-end.

---

## 130. Data residency

Separate from company headquarters.

---

## 131. Storage region ≠ processing region

Could differ.

---

## 132. Backup region

Also relevant.

---

## 133. Email provider region

May be relevant for personal contact data.

---

## 134. Auth provider

Same.

---

## 135. Subprocessor change

May trigger contractual/notice process.

Not product designer default.

---

## 136. Privacy notice change

Versioned.

---

## 137. Historical notice

Know which notice governed each collection.

---

## 138. Consent renewal

Only if legal/purpose change requires.

No arbitrary annual re-consent.

---

## 139. Withdrawal UI

Must map to real backend action.

---

## 140. No placebo withdrawal

Button cannot merely email support if product claims immediate blocking of future scoring unless actual system enforces.

---

## 141. Manual legal workflow

Can be acceptable if UI says:

`Submit privacy request`

rather than falsely `Delete now`.

---

## 142. Data-subject request classes

Potential:

- access;
- correction;
- deletion;
- restriction;
- objection;
- portability;
- withdrawal.

Only applicable rights offered according to governing law/policy.

---

## 143. No universal rights menu

Do not promise every right to every user worldwide.

---

## 144. Request intake

Could be manual initially.

Needs authenticated/verified identity where necessary.

---

## 145. Identity verification

Proportional.

Do not overcollect ID documents by default.

---

## 146. Requester scope

Person can request rights over their own personal data.

Not whole Deal automatically.

---

## 147. Client organization request

Separate contractual request.

---

## 148. Account privacy request

Separate from Deal administrator action.

---

## 149. Request tracking

Use `38` lifecycle status model.

---

## 150. Response SLA

Not invented.

Applicable law/counsel decides.

---

## 151. Legal hold conflict

Request may be partially blocked where lawful.

Approved legal explanation needed.

---

## 152. Third-party rights conflict

One person's request cannot automatically delete another person's records.

---

## 153. Report integrity conflict

Raw personal data removal can coexist with preserved historical report/audit where lawful.

---

## 154. Accuracy/correction

Correcting account identity data is different from changing analytical conclusion.

---

## 155. Evidence dispute

If respondent disputes content:

methodology/evidence governance determines analytical treatment.

Privacy correction process does not silently rewrite report truth.

---

## 156. Data portability

Client export governed by `35`.

Personal-data portability may require different scope/format.

---

## 157. No internal method exposure

Privacy export need not expose proprietary model weights/type maps unless legally required.

---

## 158. Request audit

Record without excessive request content.

---

## 159. Privacy request notification

Use accepted `36`.

---

## 160. Marketing suppression

Separate from account deletion.

---

## 161. Do-not-contact

Separate marketing/commercial state.

---

## 162. Essential transactional messages

May remain permissible even if marketing opt-out.

---

## 163. Participant invitation

Must carry approved notice reference before collection.

---

## 164. Invitation sender

Do not misrepresent who is asking.

---

## 165. Participant voluntariness

Product copy should not claim voluntary if employment/client process legally/operationally makes participation mandatory.

Counsel/client context decides exact statement.

---

## 166. No coercive consent copy

Avoid:

`You must consent to keep your job`

unless legally/contractually true and approved.

---

## 167. Refusal

Refusing 42Q does not lower organizational score.

Accepted `31`.

---

## 168. Refusal does not automatically notify manager with sensitive reason

Only workflow status permitted.

---

## 169. Completion status

Can be disclosed to requester if authorized.

---

## 170. Raw refusal explanation

Not needed.

---

## 171. Minors

Not target user population.

If encountered, person-level processing should fail closed pending legal policy.

---

## 172. Capacity/guardian issues

Out of v1.

---

## 173. Automated decision-making

MergeVue does not position 42Q/named-leader output as autonomous employment decision.

---

## 174. No hire/fire recommendation

Accepted `31`.

---

## 175. Human review

Named-leader pipeline includes practitioner adjudication.

But human review does not itself solve legal basis.

---

## 176. Significant employment decision

Not product purpose.

Do not enable client to represent MergeVue as employee scoring tool.

---

## 177. Employment screening

Not authorized by this contract.

---

## 178. HR personality testing

Not MergeVue framing.

---

## 179. Purpose abuse

If client requests use outside accepted purpose:

block/re-scope.

---

## 180. Purpose declaration

Sensitive request should state:

- Deal;
- decision need;
- person/role;
- intended use;
- recipient group.

Accepted `31` already requires bounded request.

---

## 181. Legal policy matching

Purpose string must map to approved category.

Free-text alone cannot authorize.

---

## 182. Recipient policy

Legal matrix can restrict recipients.

---

## 183. Client-side forwarding

`35` sharing gate applies.

---

## 184. Download limitation

Cannot guarantee downstream control after lawful download.

---

## 185. Confidentiality agreements

Contractual measure, not technical right expansion.

---

## 186. NDA

Does not itself create legal basis for collecting unrelated personal data.

---

## 187. M&A clean team

Potential enterprise/legal pattern.

Not assumed.

---

## 188. Information barriers

`34` leaves enterprise barriers future.

Legal policy may require them before certain engagements.

---

## 189. Antitrust-sensitive information

Not specifically modeled by current product contract.

Separate legal workflow may be required.

---

## 190. Privileged legal documents

Private evidence ingestion must respect privilege/restriction.

---

## 191. Attorney-client privilege

Product should not claim to preserve privilege as legal conclusion.

---

## 192. Legal memo access

Restricted evidence class.

---

## 193. Trade secrets

Private/confidential data.

Security/access restrictions apply.

---

## 194. Public disclosure

No publication without authority.

---

## 195. Case-study consent/authority

Separate legal object.

---

## 196. Case-study de-identification

Does not replace publication authority automatically.

---

## 197. Benchmark disclosure

Aggregate threshold/method requires separate methodology/privacy act.

---

## 198. Small cohort risk

Do not call aggregate anonymous if re-identification plausible.

---

## 199. Anonymization standard

Legal/technical determination.

Product does not casually label.

---

## 200. Pseudonymization

Still potentially personal data.

---

## 201. Data lineage

Legal/privacy decisions must attach to real records.

---

## 202. Rights provenance

Need know:

- why this data is held;
- what purposes allowed;
- who can receive;
- when policy changes.

---

## 203. No spreadsheet-only legal authority

Approved matrix can originate in counsel artifact but production enforcement needs versioned machine representation.

---

## 204. Counsel artifact identity

Store:

- document/reference;
- version;
- effective date;
- approving authority.

---

## 205. Policy compiler

Future implementation can transform approved counsel matrix into machine rules.

---

## 206. Compiler cannot expand authority

---

## 207. Missing row

Fail closed.

---

## 208. Conflicting rows

Use accepted precedence or escalate.

Do not average legal authority.

---

## 209. Expired decision

Fail closed for new collection/use.

---

## 210. Existing historical data

Follow lifecycle policy, not immediate silent purge.

---

## 211. Policy change

May trigger:

- stop collection;
- recipient restriction;
- new notice;
- withdrawal review;
- lifecycle migration.

---

## 212. Audit

Every legal/privacy gate decision should be explainable by:

- policy ID/version;
- jurisdiction;
- relationship;
- purpose;
- data class;
- outcome.

---

## 213. No lawyer notes in client UI

Internal legal rationale stays restricted.

---

## 214. Client-safe block reason

Possible:

`This assessment isn't available for this participant or jurisdiction.`

Do not expose legal strategy.

---

## 215. Internal block code

`LEGAL_BASIS_NOT_ESTABLISHED`

accepted for `31`.

---

## 216. Other conceptual block codes

```text
JURISDICTION_NOT_APPROVED
NOTICE_NOT_SATISFIED
CONSENT_REQUIRED
RECIPIENT_NOT_AUTHORIZED
PROVIDER_NOT_APPROVED
TRANSFER_AUTHORITY_NOT_ESTABLISHED
RETENTION_POLICY_NOT_ESTABLISHED
```

Candidate internal semantics, exact enums later.

---

## 217. Commercial behavior

If legal gate fails:

- do not sell/activate gated module;
- do not collect person data;
- explain availability limitation accurately;
- do not quietly substitute another purpose.

---

## 218. Refund/commercial handling

If paid module cannot activate because eligibility fails:

follow accepted `33` contract/proposal/refund terms.

Legal copy separate.

---

## 219. Pre-sale eligibility

Prefer determine high-level legal eligibility before accepting named-leader payment.

---

## 220. No paid legal experiment

Do not collect money first just to discover obvious jurisdiction prohibition if avoidable.

---

## 221. Proposal language

Can state:

`Subject to privacy and legal eligibility review.`

If approved commercial copy.

---

## 222. Standard U.S. launch

Need approved launch matrix for target U.S. contexts before person-level release.

---

## 223. Outside U.S.

Manual eligibility review unless matrix includes context.

---

## 224. Enterprise client contract

May add negotiated restrictions.

Policy engine must support deal/client-specific override if legally approved.

---

## 225. Contract override

Cannot weaken applicable law.

---

## 226. Most restrictive applicable rule

Where multiple binding rules apply:

product should follow controlling legal precedence.

Exact legal precedence from counsel.

---

## 227. No model interpretation of statutes at runtime

LLM should not decide:

`GDPR applies`

or:

`consent is valid`

as production authority.

---

## 228. LLM role

May:

- summarize approved policy;
- explain internal block reason;
- draft client-safe text from approved templates.

May not:

- create legal basis;
- choose controller role;
- waive notice;
- decide legal hold;
- approve transfer;
- approve provider;
- answer binding legal request.

---

## 229. Legal question escalation

Route to human legal/privacy authority.

---

## 230. Counsel approval field

Must reference real authority.

Not model-generated name.

---

## 231. Owner role

Owner approves product governance.

Owner is not automatically legal counsel.

---

## 232. Practitioner role

Not legal authority.

---

## 233. Analyst role

Not legal authority.

---

## 234. Security operator

Not legal authority unless separately designated.

---

## 235. Privacy/legal approver

Separate operational authority.

Exact staffing later.

---

## 236. Small-team reality

One human may hold several roles early.

System should still distinguish which authority they exercised.

---

## 237. Purpose-bound approval

Legal approval for 42Q cannot automatically authorize publication.

---

## 238. Authority expiry

Supported.

---

## 239. Re-review

Provider/policy/jurisdiction changes may require.

---

## 240. Regulatory change

Requires updated counsel matrix.

Product does not self-update legal rules from web search.

---

## 241. No legal web scraping as authority

Absolute.

---

## 242. Public regulatory research

Can inform counsel/review.

Not production authority.

---

## 243. Legal-source citations

Internal counsel package may cite law.

Product runtime uses approved policy ID.

---

## 244. Privacy notice hosting

Need stable URL/version once implemented.

No URL invented here.

---

## 245. Terms URL

Same.

---

## 246. DPA process

Can remain manual B2B initially.

---

## 247. Signature/e-sign

Provider/process not selected here.

---

## 248. Contract repository

Operational decision.

---

## 249. DPA retrieval

Authorized operations only.

---

## 250. Client procurement

Can request DPA/security package.

---

## 251. Security package vs legal package

Separate but coordinated.

---

## 252. Procurement contact

Does not receive Deal evidence.

---

## 253. Privacy/security questionnaire

Answers factual current state.

---

## 254. Data map

Target internal artifact.

---

## 255. Processing activity inventory

Target internal governance.

---

## 256. Subprocessor inventory

Target internal governance.

---

## 257. Transfer inventory

Target internal governance.

---

## 258. Data retention matrix

Target legal input.

---

## 259. Data rights matrix

Accepted `29` + legal augmentation.

---

## 260. Data-class owner

Operational accountability.

---

## 261. Policy ownership

Human privacy/legal owner.

---

## 262. Legal-policy change management

Versioned and audited.

---

## 263. Test environment

No real personal/private data by default.

---

## 264. Synthetic person data

Preferred.

---

## 265. Production support

Accepted `39`: metadata-first.

---

## 266. Incident response

Privacy incident uses `39` + legal authority.

---

## 267. Breach determination

Human legal/security process.

---

## 268. Data-subject notification

Legal process + `36`.

---

## 269. Privacy incident preservation

Can invoke legal hold if authorized.

---

## 270. Privacy incident does not expand analytic use

---

## 271. Data breach and deletion request

Incident/legal preservation may affect lifecycle through `38`.

---

## 272. No silent hold

Audit authority.

---

## 273. Privacy metrics

Operational:

- blocked collections due to missing authority;
- withdrawal propagation failures;
- stale notices;
- expired legal decisions;
- unauthorized-provider blocks;
- DSR backlog.

No sensitive content.

---

## 274. Marketing metrics

Separate.

---

## 275. No privacy dark pattern optimization

Do not optimize consent acceptance rate as product success metric.

---

## 276. Consent decline

Valid state.

---

## 277. Consent decline UX

No shame/fear copy.

---

## 278. Alternative service

Only if legitimately available.

Do not falsely imply organizational report requires 42Q.

---

## 279. Incomplete legal matrix

System supports only approved rows.

---

## 280. Pilot

A pilot is not exemption from privacy/legal requirements.

---

## 281. Internal test with real person data

Still needs authority.

---

## 282. Historical cases

Public/historical PRE-T0 corpus is separate from live client person-data collection.

---

## 283. Synthetic calibration

Can be used if methodology allows.

No privacy issue from nonexistent people.

---

## 284. Real calibration data

Requires independent rights/authority.

---

## 285. Expert bootstrap

Owner/practitioner expert decisions do not create rights over respondent data.

---

## 286. Publication of research

Separate.

---

## 287. Academic collaboration

Separate DPA/data-sharing/publication rights.

---

## 288. Data-sharing agreement

May be needed for external research partner.

Not assumed.

---

## 289. Merger parties

Acquirer and Target may have distinct confidentiality/privacy duties.

---

## 290. Cross-party raw answer isolation

Accepted and preserved.

---

## 291. Buyer access to seller respondent data

Only through approved derived disclosure, not raw default.

---

## 292. Seller access to buyer respondent data

Same.

---

## 293. Clean-room/clean-team

Possible future enterprise mechanism.

Not authorized by this file alone.

---

## 294. Privileged Deal

Could require stricter data routing.

Manual/legal scope.

---

## 295. Deal code names

Privacy/confidentiality aid, not legal basis.

---

## 296. Company identity

Business data can still be confidential.

---

## 297. Personal business email

Personal data treatment may apply.

---

## 298. Generic corporate mailbox

Still contact/communication data.

---

## 299. IP address

Security/technical personal data where applicable.

Minimize.

---

## 300. Device data

No unnecessary fingerprinting.

---

## 301. Cookies

Essential auth/security only as needed; marketing separate.

---

## 302. Session logs

Privacy-security purpose.

---

## 303. Download logs

Security/audit purpose.

---

## 304. Share recipient logs

Disclosure audit.

---

## 305. Email delivery logs

Communication audit.

---

## 306. No cross-purpose CRM enrichment

Do not take respondent email and create sales lead.

---

## 307. No sales use of participant list

Absolute target default.

---

## 308. No recruiter use

---

## 309. No employee ranking use

---

## 310. No shadow HR database

---

## 311. No longitudinal person scoring outside Deal purpose

Unless separate approved purpose/authority.

---

## 312. Named-leader longitudinal verification

Only as bounded Deal forecast verification under accepted rules.

---

## 313. Re-measurement

New collection may require renewed active legal decision.

---

## 314. Prior legal decision

May be reused only if still effective and same context/purpose.

---

## 315. Deal change

New parties/context can invalidate prior decision.

---

## 316. Role change

Person relationship context may change.

---

## 317. Acquisition close

Post-close employment/relationship context may differ.

---

## 318. Monitoring after close

Requires applicable continuing authority.

---

## 319. Verification contact after close

Same.

---

## 320. Participant removal

No unnecessary further contact.

---

## 321. Email suppression

Withdrawal from participant process stops future unnecessary reminders.

---

## 322. Security email

May remain where necessary.

---

## 323. Requesting new purpose

Requires new decision.

---

## 324. Purpose creep detection

Tests should verify no route silently reuses restricted data.

---

## 325. Legal policy tests

At minimum:

1. no legal-basis record → 42Q first question blocked;
2. expired record → blocked;
3. wrong jurisdiction → blocked;
4. wrong relationship → blocked;
5. wrong purpose → blocked;
6. missing notice → blocked where required;
7. consent-required/not captured → blocked;
8. consent withdrawn → new processing blocked;
9. client permission without person authority → blocked;
10. DPA-required/not executed → gated service blocked;
11. provider not approved → outbound transfer blocked;
12. transfer authority absent → provider call blocked;
13. R&D not permitted → dataset build excludes;
14. publication not permitted → case-study pipeline excludes;
15. marketing consent absent → no marketing;
16. share recipient outside permitted recipients → blocked;
17. retention policy missing for gated person data → production blocked;
18. legal hold does not enable new processing;
19. policy version change triggers re-evaluation where required;
20. test/staging does not ingest production person data casually.

---

## 326. Withdrawal tests

- scoring stops;
- mapping stops;
- named-leader use stops;
- participant invite/session revoked;
- reminders stop;
- derived artifacts enter review;
- raw data lifecycle follows policy;
- audit preserved lawfully;
- R&D/benchmark future eligibility removed where applicable.

---

## 327. Provider tests

- private payload cannot route to unapproved model provider;
- provider fallback respects policy;
- provider config matches DPA/retention/training posture;
- consumer endpoint blocked;
- restricted data classes excluded;
- logs do not retain prohibited payload.

---

## 328. Access tests

- Deal Administrator cannot grant R&D rights;
- collaborator cannot override participant consent;
- support cannot bypass legal basis;
- security break-glass cannot create secondary-use rights;
- practitioner cannot create legal authority;
- LLM cannot create legal authority.

---

## 329. Notice tests

- correct notice version before collection;
- outdated notice flagged;
- participant can access notice;
- marketing not bundled;
- raw-answer visibility statement matches product;
- 42Q internal type not promised to participant/client;
- no fake anonymity/confidentiality.

---

## 330. Retention integration tests

- correct policy ref attached by class;
- no hard-coded universal days;
- expired policy blocks new collection where required;
- `38` scheduler consumes approved rule;
- legal hold preserves but does not expand use;
- restore respects tombstones/suppression.

---

## 331. Commercial tests

- named-leader sale cannot activate before legal eligibility;
- payment does not bypass gate;
- proposal can be legally gated;
- refund/cancellation follows `33`;
- non-U.S. context routes to review where not approved.

---

## 332. Security/privacy tests

- privacy request identity verified proportionally;
- no request leaks another person's data;
- incident classification does not become legal breach automatically;
- sensitive notice/consent records are access-controlled;
- legal rationale not exposed to normal client role.

---

## 333. Product UX surfaces

Minimum eventual surfaces:

- privacy/terms links;
- participant notice;
- consent control only where legally required;
- privacy request entry;
- blocked-state explanation;
- organization/client legal setup status where relevant.

No universal privacy dashboard required.

---

## 334. Client setup

Paid engagement may require internal legal setup record before private/person data collection.

---

## 335. Legal setup should be invisible when simple

Do not burden user with legal matrix internals.

---

## 336. Complex client

Manual legal/privacy setup acceptable.

---

## 337. Self-serve

Only for contexts pre-approved by matrix.

---

## 338. Self-serve named-leader

Not authorized in accepted `33` even after readiness; remains manual until later Owner act.

---

## 339. Error copy

Candidate:

`This assessment isn't available for this participant or jurisdiction.`

No legal advice.

---

## 340. Missing policy copy

Client-facing:

`Additional privacy review is required before this assessment can begin.`

Only if operational process exists.

---

## 341. Participant withdrawal copy

Counsel-approved.

No promise of instant universal deletion.

---

## 342. Privacy request receipt

`We received your request.`

Do not promise legal outcome.

---

## 343. Consent record

No public technical IDs.

---

## 344. Accessibility

Notice/consent/request UX:

- plain structure;
- keyboard accessible;
- no prechecked control;
- no color-only consequence;
- meaningful link labels;
- readable on mobile;
- refusal path visible.

---

## 345. No manipulative hierarchy

`Agree` cannot be giant while `Decline` hidden.

---

## 346. No forced scroll trick

---

## 347. No consent wall for unrelated public content

---

## 348. No marketing cookie wall tied to report access if not necessary

---

## 349. Legal text readability

Counsel owns exact text; product should present legibly.

---

## 350. Record of acceptance

Store exact version where required.

---

## 351. Уровень доверия

### 351.1. Need for legal/privacy gate

**Высокое доверие / controlling blocker.**

Accepted `31` explicitly leaves it open.

### 351.2. Product lifecycle architecture

**OWNER-ACCEPTED `38`.**

Ready to consume approved policy but not a substitute for it.

### 351.3. Data-rights architecture

**OWNER-ACCEPTED `29` target governance.**

Access and secondary-use rights remain separate.

### 351.4. Person-level product restrictions

**OWNER-ACCEPTED `31`.**

### 351.5. Jurisdiction-specific legal basis

**NOT ESTABLISHED by this file.**

Requires counsel/legal approval.

### 351.6. Retention periods

**NOT ESTABLISHED.**

### 351.7. Controller/processor roles

**NOT ESTABLISHED globally.**

Must be approved per applicable processing context.

### 351.8. Provider transfer/legal posture

**Requires actual provider/contract/configuration evidence.**

### 351.9. Product/legal interface model

**OWNER-ACCEPTED target product/legal interface design.**

---

## 352. Что мы сознательно НЕ меняем

1. `31` remains production-gated.
2. `38` lifecycle semantics remain controlling.
3. `29` secondary-use rights remain separate.
4. `34` membership does not create data rights.
5. `35` sharing requires recipient/purpose rights.
6. `36` marketing remains separate from transactional communication.
7. `37` account authentication is not legal authority.
8. `39` break-glass is not legal authority.
9. Public analysis remains low-friction.
10. Organizational forecast remains independent of 42Q.
11. Refusal/incomplete 42Q does not lower org score.
12. Raw 42Q is not client output.
13. Internal type/function is not client output.
14. No universal consent requirement is invented.
15. No universal legitimate-interest claim is invented.
16. No universal controller/processor role is invented.
17. No retention days are invented.
18. No DPA text is drafted as final legal text.
19. No privacy policy is drafted as legal advice.
20. No state/country legal conclusion is made.
21. No cross-border transfer mechanism is invented.
22. No provider is declared legally approved without evidence.
23. No legal right is promised universally.
24. No new route is authorized here.
25. Owner acceptance cannot substitute for counsel approval.

---

## 353. Acceptance criteria

Contract passes only if:

1. Legal basis exists before gated collection.
2. Purpose exists before data.
3. Notice occurs before person-level collection where required.
4. Consent is not assumed universal.
5. Consent is not assumed sufficient for every purpose.
6. Client permission does not equal person-data authority.
7. Payment does not create legal basis.
8. Named-leader price does not create eligibility.
9. Controller/processor role is explicit where applicable.
10. DPA does not imply publication/R&D rights.
11. Marketing consent is separate.
12. Collaboration invite does not create R&D consent.
13. Paid contract does not create publication permission.
14. 42Q completion does not create case-study permission.
15. Report sharing does not create training permission.
16. Consent records are purpose/version bound.
17. No prechecked/dark consent.
18. Withdrawal is purpose-specific.
19. Withdrawal does not automatically erase all history.
20. Legal hold preservation does not create new use.
21. `38` remains lifecycle execution authority.
22. Retention durations are external.
23. Jurisdiction source is not IP alone.
24. Deal and participant jurisdiction can differ.
25. Unknown high-sensitivity jurisdiction fails closed.
26. U.S. launch does not imply one uniform legal rule.
27. Sensitive attributes are not collected by default.
28. Questionnaire is not expanded for privacy convenience.
29. Derived type/function remains restricted.
30. Public data does not mean unrestricted purpose.
31. Social/public profiles do not authorize broad person profiling.
32. Security/support/billing data stay purpose-limited.
33. Secondary-use purposes have separate rights.
34. No rights inheritance from primary Deal use.
35. DPA state remains separate from analytical state.
36. Terms/notice/DPA versions are tracked.
37. New purpose can require new authority.
38. Subprocessor inventory is factual.
39. Minimum necessary provider transfer applies.
40. Private data cannot go to unapproved LLM provider.
41. Consumer AI endpoint is not default.
42. Provider retention/training posture is verified.
43. Provider fallback cannot bypass privacy gate.
44. Cross-border authority is not inferred.
45. Data-residency claims require evidence.
46. Withdrawal UI maps to real backend action.
47. Manual privacy-request workflow is allowed if accurately labeled.
48. Privacy rights are only promised when applicable.
49. Request identity verification is proportional.
50. Requester cannot delete entire Deal by personal-data request alone.
51. Report integrity and raw-data rights can coexist.
52. Portability does not expose proprietary internals automatically.
53. Marketing suppression differs from account deletion.
54. Participant invite references approved notice.
55. Voluntary-participation language must be accurate.
56. Refusal does not lower organizational assessment.
57. Refusal does not expose sensitive reason to manager.
58. Minor/person-capacity edge cases fail closed.
59. MergeVue does not become employment-screening tool.
60. Hire/fire recommendation remains prohibited.
61. Purpose abuse is blocked.
62. Free-text purpose is not authorization.
63. Recipient policy constrains sharing.
64. NDA does not create unrelated processing authority.
65. Publication is separate purpose.
66. Benchmark is separate purpose.
67. R&D is separate purpose.
68. Training is separate purpose.
69. “Improve our services” is not blanket authority.
70. Rights provenance is record-level/purpose-level.
71. Counsel matrix is versioned.
72. Machine policy cannot expand counsel authority.
73. Missing matrix row fails closed.
74. Conflicting authority is escalated.
75. Expired authority blocks new use.
76. Policy changes do not silently erase history.
77. Legal decision is auditable by policy/version/context.
78. Legal rationale is restricted internally.
79. Client-safe block reason gives no legal advice.
80. Internal `LEGAL_BASIS_NOT_ESTABLISHED` remains valid.
81. Legal gate failure blocks gated module activation.
82. No person data collected while gated.
83. Commercial refund handling remains `33`.
84. Pre-sale eligibility is preferred where feasible.
85. Non-U.S. contexts route to review unless approved.
86. Contract overrides cannot weaken law.
87. LLM does not interpret statutes as runtime authority.
88. LLM cannot create legal basis.
89. LLM cannot approve transfer/provider/legal hold.
90. Legal questions escalate to human authority.
91. Owner is not automatically legal counsel.
92. Analyst/practitioner/security operator are not legal authority by role.
93. Small-team role overlap retains authority labeling.
94. Approval is purpose-bound.
95. Regulatory change requires policy update.
96. Web research is not production legal authority.
97. Notice/terms have stable versions once implemented.
98. DPA can remain manual B2B initially.
99. Procurement contact receives no Deal evidence.
100. Privacy/security questionnaire answers remain factual.
101. Test environment avoids real private/person data.
102. Security incidents use `39`.
103. Breach determination is human/legal/security.
104. Privacy metrics do not expose sensitive content.
105. Consent acceptance rate is not optimization goal.
106. Pilot does not waive privacy requirements.
107. Historical corpus is separate from live person collection.
108. Real calibration data requires rights.
109. Expert bootstrap does not create rights.
110. Buyer/seller raw respondent isolation remains.
111. No automatic clean-team capability is invented.
112. Privileged material gets restrictive handling.
113. Anonymization is not casually claimed.
114. Pseudonymization does not equal anonymity.
115. Legal/privacy policy attaches to lineage.
116. No spreadsheet-only authority in production.
117. Counsel artifact identity/version is preserved.
118. Policy compiler is non-expansive.
119. Participant/workflow changes can trigger re-evaluation.
120. Post-close context can require new authority.
121. No sales use of participant list.
122. No recruiter/HR shadow database.
123. No longitudinal person scoring outside purpose.
124. Re-measurement checks current legal authority.
125. Tests cover missing/expired/wrong-context authority.
126. Tests cover withdrawal propagation.
127. Tests cover provider admissibility.
128. Tests prove Deal Administrator cannot grant secondary-use rights.
129. Tests prove support/break-glass cannot create legal authority.
130. Notice tests match actual visibility.
131. Retention integration uses approved matrix.
132. Named-leader sale cannot bypass legal gate.
133. Privacy-request handling does not leak others' data.
134. Accessibility and non-manipulative consent UX required.
135. `38` remains architecture, counsel matrix supplies legal values.
136. `40` itself is not legal advice.
137. Owner acceptance of `40` would accept product behavior, not jurisdiction-specific legal conclusions.
138. `31` legal/privacy gate remains open until actual approved matrix exists.
139. No production-release claim follows merely from accepting this file.
140. LIVE audit occurs before implementation because this contract audits architecture/main, not deployed legal compliance.

---


## 353.1. Owner acceptance boundary

**Owner acceptance состоялся 2026-09-16.**

С этого момента `40 v1.0` является **controlling privacy, legal basis, data processing and jurisdiction product/legal interface contract** для MergeVue.

Owner acceptance устанавливает как controlling target policy:

- `LEGAL BASIS BEFORE COLLECTION`;
- `PURPOSE BEFORE DATA`;
- `NOTICE BEFORE PARTICIPATION` where applicable;
- client permission, payment, Deal membership and consent are not interchangeable authorities;
- consent is neither assumed universally required nor universally sufficient;
- controller/processor roles are not inferred by product;
- jurisdiction and relationship context must be explicit where legally material;
- 42Q / named-leader collection remains blocked when applicable legal authority is absent, expired or mismatched;
- secondary-use rights remain purpose-specific and do not inherit from primary Deal use;
- provider/subprocessor eligibility constrains whether private/person-level data may be sent externally;
- unapproved provider fallback is prohibited;
- runtime LLM/model logic cannot create legal basis, approve transfer, determine controller status or waive notice/consent requirements;
- product consumes a human-approved, versioned legal/privacy policy matrix rather than inventing legal rules;
- `38` remains the lifecycle execution architecture into which approved retention/deletion/withdrawal/legal-hold rules are plugged;
- legal/privacy decisions must be traceable to policy/version/context;
- where legal authority is missing or ambiguous for gated high-sensitivity processing, the system fails closed.

Owner acceptance **не означает автоматически**:

- legal advice;
- counsel approval;
- a signed DPA;
- an approved Privacy Policy;
- approval of any U.S. state-specific or non-U.S. legal matrix;
- approval of controller/processor determinations;
- approval of retention durations;
- approval of a legal-hold schedule;
- approval of cross-border transfer mechanisms;
- approval of any subprocessor/provider;
- approval of consent language;
- approval of privacy-request response windows;
- production implementation authorization;
- permission to release named-leader forecasts.

**Критическая граница:** acceptance of `40` closes the **product/legal interface architecture**, but does **not** close the substantive **Legal/privacy gate** in accepted `31`. That gate remains open until there is an actual counsel-/legal-approved jurisdiction × relationship × purpose × data-class matrix plus the required retention/deletion/withdrawal/legal-hold and provider/transfer rules, represented in a machine-enforceable form and verified in runtime.


## 354. Implementation sequence

### Phase 0 — legal inventory

Counsel/privacy owner defines:

- supported jurisdictions;
- relationship contexts;
- purposes;
- data classes;
- controller/processor roles;
- required contractual/notice mechanisms.

### Phase 1 — approved matrix

Create versioned human-approved legal/privacy matrix.

No runtime inference.

### Phase 2 — machine policy representation

Compile approved rows into:

- legal-basis decisions;
- provider eligibility;
- recipient rules;
- retention policy refs;
- notice requirements.

### Phase 3 — participant gate

Integrate with `31`:

```text
request
→ legal decision
→ notice
→ consent if required
→ invitation
→ first question
```

### Phase 4 — lifecycle integration

Integrate approved retention/withdrawal/legal-hold policies with `38`.

### Phase 5 — provider gate

Before private/person-level external processing:

- provider approval;
- DPA/terms;
- training/retention posture;
- transfer/jurisdiction;
- deletion/logging.

### Phase 6 — privacy requests

Implement bounded request intake/status and approved operational workflow.

### Phase 7 — procurement/legal package

Provide factual current:

- DPA;
- privacy notice;
- subprocessor list;
- data-flow summary;
- security package.

Only when real.

---

## 355. What closes the `31` legal/privacy gate

The gate can be considered for closure only when all applicable elements are evidenced:

1. approved counsel/legal authority for supported jurisdiction × relationship × purpose;
2. controller/processor determination where required;
3. approved participant notice;
4. consent mechanism where required;
5. recipient/downstream-use rules;
6. retention matrix by data class/purpose;
7. deletion/withdrawal/legal-hold rules;
8. provider/subprocessor eligibility;
9. cross-border/transfer authority where applicable;
10. machine-enforceable policy version;
11. tested fail-closed runtime gate;
12. audit linking collection to the applicable policy decision.

Owner acceptance of this file satisfies the **product architecture decision only** and satisfies **none of the substantive legal approvals** above.

---

## 356. Downstream decisions still required

1. actual U.S. legal matrix;
2. state-specific treatment where needed;
3. outside-U.S. jurisdictions;
4. controller/processor analysis;
5. final privacy notice text;
6. final DPA;
7. consent requirements by context;
8. retention periods by class;
9. legal-hold policy;
10. privacy-request response windows;
11. cross-border transfer mechanisms;
12. approved subprocessor/provider inventory;
13. LLM-provider DPA/training/retention posture;
14. legal approver role/staffing;
15. contract-repository/e-sign process;
16. publication/case-study authority model;
17. benchmark/R&D consent/authority;
18. privacy-request operational route;
19. exact legal/policy enums;
20. counsel re-review cadence.

---

## 357. Финальная формула

> **MergeVue does not “choose” a legal basis at runtime. A human-approved legal/privacy decision defines whether a specific purpose, data class, relationship and jurisdiction are eligible; the product only enforces that decision.**

> **Client permission, payment, Deal membership and consent are not interchangeable authorities. Each purpose—Deal analysis, person-level assessment, sharing, R&D, benchmark, publication and marketing—must stand on its own approved rights basis.**

> **The accepted lifecycle architecture in `38` explains how retention, withdrawal, deletion and legal hold are executed. `40` defines where the legal values must come from. Neither document invents the number of days.**

> **Until an approved jurisdiction-specific matrix exists and the runtime gate can enforce it, the named-leader legal/privacy gate in `31` remains open and production must fail closed.**
