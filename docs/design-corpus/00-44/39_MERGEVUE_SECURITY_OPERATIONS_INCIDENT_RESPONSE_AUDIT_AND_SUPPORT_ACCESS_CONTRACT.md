# 39. Контракт security operations, incident response, audit и support access MergeVue

**Файл:** `39_MERGEVUE_SECURITY_OPERATIONS_INCIDENT_RESPONSE_AUDIT_AND_SUPPORT_ACCESS_CONTRACT.md`  
**Версия:** 1.0  
**Дата:** 2026-09-16  
**Язык документа:** русский  
**Язык клиентского интерфейса:** только American English  
**Рынок первой версии:** США  
**Статус:** **OWNER-ACCEPTED / CONTROLLING SECURITY OPERATIONS, INCIDENT RESPONSE, AUDIT AND SUPPORT ACCESS DESIGN CONTRACT; НЕ ЯВЛЯЕТСЯ SOC 2 / ISO 27001 / NIST CERTIFICATION И НЕ УТВЕРЖДАЕТ, ЧТО INCIDENT RESPONSE, SIEM, SOC, BREAK-GLASS ИЛИ 24/7 SECURITY OPERATIONS УЖЕ РЕАЛИЗОВАНЫ В PRODUCTION**  
**Owner acceptance:** **2026-09-16**  
**Аудитная база `main`:** `92c2e0df199d017082b653e72b5a6bfbf5bf6a31`  
**Связанные controlling contracts:** `24`, `29`, `31`, `34`, `35`, `36`, `37`, `38`  
**Главный принцип:** operational/security access существует только для конкретной необходимости, никогда не становится скрытым superuser-доступом к клиентским Deals и не подменяет client authorization.  
**Ключевые инварианты:** `SECURITY EVENT ≠ INCIDENT ≠ BREACH`, `SUPPORT ≠ DEAL ACCESS`, `BREAK-GLASS ≠ ADMIN MODE`, `AUDIT ≠ ANALYTICS`, `LOGS ≠ SOURCE OF ANALYTICAL TRUTH`, `NO SILENT IMPERSONATION`, `NO STANDING SUPERUSER`, `LEAST PRIVILEGE`, `PURPOSE-BOUND ACCESS`, `TIME-BOUND EXCEPTION`, `REAUTH FOR PRIVILEGED ACTION`, `EVERY EXCEPTION AUDITED`, `SECRETS NEVER LOGGED`, `CLIENT DATA MINIMIZED`, `FAIL CLOSED`

---

## 0. Назначение

Этот документ определяет security-operations слой:

```text
security signal
→ triage
→ incident determination
→ containment
→ privileged access if strictly necessary
→ evidence preservation
→ remediation
→ recovery
→ required communication
→ post-incident review
→ audit closure
```

И отдельно:

```text
support request
→ metadata-first diagnosis
→ authorization
→ bounded support action
→ optional exceptional access
→ revoke
→ audit
```

Документ отвечает на вопросы:

1. чем security event отличается от incident;
2. чем incident отличается от legally reportable breach;
3. кто может получить internal operational access;
4. когда support может видеть Deal data;
5. что такое break-glass;
6. можно ли impersonate client;
7. как устроен security audit trail;
8. что нельзя логировать;
9. как должны обрабатываться secrets;
10. как вести vulnerability/patch operations;
11. как действовать при credential/session compromise;
12. как security incident взаимодействует с `34–38`;
13. что клиенту можно обещать;
14. что procurement package может утверждать только после фактической реализации.

---

## 1. Authority hierarchy

При конфликте применяется:

1. явная Owner-инструкция;
2. applicable law / binding security/privacy/legal policy;
3. accepted `38` lifecycle/legal-hold boundary;
4. accepted `37` identity/auth/session security;
5. accepted `34` access permissions;
6. accepted `35` sharing/disclosure;
7. accepted `31` person-level restrictions;
8. accepted `29` data-rights governance;
9. accepted `36` communication semantics;
10. current mechanical truth;
11. настоящий target security-operations contract.

Operational convenience никогда не выше client/data-rights authority.

---

## 2. Current implementation reality

### 2.1. Existing security primitives

Audited `main` establishes some bounded security mechanics, including:

- cryptographic random token generation;
- hashed verifier handling;
- timing-safe compare;
- invite expiration;
- failed-attempt controls;
- lockout concept;
- server-side persistent session path;
- fail-closed storage behavior in selected flows.

These are useful primitives.

### 2.2. These primitives are not a security-operations program

They do not by themselves establish:

- incident-response process;
- SOC;
- SIEM;
- on-call security team;
- centralized security event pipeline;
- vulnerability-management program;
- break-glass approval workflow;
- support access console;
- customer breach-notification system;
- 24/7 response commitment.

### 2.3. Repo search did not establish general incident-response capability

Therefore no product/procurement claim may imply it already exists.

---

## 3. Critical semantic boundary

```text
SECURITY SIGNAL
≠
SECURITY EVENT
≠
SECURITY INCIDENT
≠
DATA BREACH
```

Each escalation requires evidence/authority.

---

## 4. Security signal

Raw observation that may merit review.

Examples:

- repeated failed verification;
- unusual error pattern;
- authorization denial spike;
- secret scan finding;
- suspicious access attempt;
- dependency alert.

A signal is not an incident.

---

## 5. Security event

A confirmed security-relevant occurrence.

Examples:

- revoked token presented;
- repeated account lockout;
- unauthorized access attempt;
- secret exposed in log;
- support access initiated;
- privileged role changed.

Still not automatically a breach.

---

## 6. Security incident

A security event or set of events requiring coordinated containment/remediation.

Requires explicit incident determination.

---

## 7. Data breach

Legal/security classification.

Do not label an incident as breach in client communication unless authorized legal/security process determines that classification.

---

## 8. No automatic breach language

Forbidden:

`Your data was breached`

based only on:

- failed login attempts;
- suspicious IP;
- service outage;
- access-denied event;
- vulnerability scan finding.

---

## 9. Incident object

Conceptual:

```text
incidentId
detectedAt
sourceSignals[]
incidentState
affectedSystems[]
affectedDataClasses[]
affectedDeals?
containmentState
legalReviewRequired
clientNotificationState
owner
closedAt?
policyVersion
```

Not final schema.

---

## 10. Incident states

Conceptual lifecycle:

```text
UNDER_TRIAGE
CONFIRMED_INCIDENT
CONTAINMENT
REMEDIATION
RECOVERY
POST_INCIDENT_REVIEW
CLOSED
```

Exact production enum later.

---

## 11. Severity

This contract does not invent numerical severity levels.

Severity framework requires operational/security act.

---

## 12. No P0/P1 promise

Do not claim response tiers/times without actual support operation.

---

## 13. Incident triage

Must establish:

- what happened;
- what system/object is affected;
- whether access/data integrity/confidentiality is affected;
- what evidence supports finding;
- whether incident is ongoing;
- immediate containment need.

---

## 14. Evidence before conclusion

Security triage follows same anti-hallucination principle:

> observation is not conclusion.

---

## 15. Containment

Possible classes:

- revoke session;
- revoke token;
- disable account;
- disable share;
- disable endpoint/feature;
- rotate secret;
- block access path;
- isolate processing job.

Only where technically/operationally appropriate.

---

## 16. Containment ≠ deletion

Security containment cannot casually delete client evidence.

---

## 17. Containment ≠ legal hold

Legal hold has separate authority under `38`.

---

## 18. Containment can pause processing

If affected source/action is uncertain:

fail closed.

---

## 19. Recovery

Restore only after:

- vulnerability/access path controlled;
- credentials/tokens addressed;
- relevant authorization revalidated;
- affected state consistency checked.

---

## 20. No insecure emergency bypass

Incident response cannot bypass authentication/authorization just because system is degraded.

---

## 21. Security incident and Deal access

Client permissions remain server-authoritative.

An incident does not automatically expose Deal to support/security staff.

---

## 22. Internal operational roles

Separate from client roles.

Conceptual operational capacities:

- Security Operator;
- Support Operator;
- Platform Operator;
- Internal Auditor;
- Analyst;
- Practitioner.

Exact IAM implementation separate.

---

## 23. Client roles never grant internal role

Absolute.

---

## 24. Internal role never automatically grants client report/evidence visibility

Absolute.

---

## 25. Support principle

> diagnose with metadata first.

---

## 26. Support metadata

Potentially safe minimum:

- account ID;
- Deal ID opaque identifier;
- request/error ID;
- route/action;
- timestamp;
- status code;
- workflow state;
- technical failure code.

Not substantive evidence by default.

---

## 27. Support does not need Deal contents by default

Support should not routinely see:

- report narrative;
- private documents;
- respondent raw answers;
- 42Q;
- named-leader forecast;
- economic confidential inputs.

---

## 28. Support request ≠ permission

Client asking for help does not automatically authorize unrestricted data access.

---

## 29. Support access tiers

Target architecture should distinguish:

```text
METADATA_ONLY
CLIENT_SAFE_VIEW
RESTRICTED_CONTENT_EXCEPTION
```

Conceptual only.

---

## 30. Metadata-only default

First diagnostic state.

---

## 31. Client-safe view

May show same bounded content the requesting user can already see if necessary.

Requires authenticated support workflow.

---

## 32. Restricted-content exception

Only when:

- problem cannot reasonably be resolved otherwise;
- requester/authority permits where required;
- security/privacy policy allows;
- actor is specifically authorized;
- access is time-bound;
- audit record exists.

---

## 33. Raw respondent answers

Support access default: denied.

---

## 34. Raw 42Q

Support access: denied.

---

## 35. Internal type/function

Support access: denied.

---

## 36. Private evidence

Support access: denied unless exceptional rights-approved incident/support need.

---

## 37. Named-leader output

Support access default: denied.

---

## 38. Break-glass definition

Break-glass:

> exceptional, temporary privileged access used only when ordinary access paths cannot safely resolve a material operational/security incident.

Not:

- admin convenience;
- debugging shortcut;
- executive curiosity;
- analyst override.

---

## 39. No standing break-glass session

Absolute.

---

## 40. Break-glass prerequisites

Target requires:

- explicit reason;
- specific actor identity;
- specific affected system/Deal/object;
- requested privilege scope;
- expiry;
- approval authority;
- re-authentication;
- audit.

---

## 41. Approval model

Exact approval model is downstream security decision.

Higher-sensitivity data may require dual approval.

Do not claim two-person control until implemented.

---

## 42. Break-glass duration

Must be bounded.

Exact minutes/hours not invented.

---

## 43. Break-glass auto-expiry

Required.

---

## 44. Break-glass revocation

Immediate manual revoke available.

---

## 45. Break-glass scope

Least privilege:

- one Deal;
- one object;
- one data class;
- one operational action;

not platform-wide by default.

---

## 46. Break-glass and 42Q

Person-level raw data remains separately prohibited unless specific legal/security authority explicitly permits.

`Break-glass` string alone is never sufficient.

---

## 47. Break-glass and evidence export

No automatic export/download.

---

## 48. Break-glass and mutation

Read access does not imply edit/delete/release authority.

---

## 49. Break-glass and audit

Every grant/use/revoke event recorded.

---

## 50. Break-glass client notice

Policy decision.

Do not promise automatic notification until approved.

---

## 51. Impersonation

Default:

> silent client impersonation is prohibited.

---

## 52. What counts as impersonation

Internal actor causing product to behave as if they were a client account.

---

## 53. Why dangerous

Can:

- create false audit history;
- make actions appear client-authorized;
- obscure operator activity;
- bypass least privilege.

---

## 54. Support-as-user mode

Not v1.

---

## 55. If future impersonation exists

Must:

- display persistent operator banner;
- keep true operator identity;
- mark every action as operator action;
- prohibit selected sensitive actions;
- expire automatically;
- require purpose/approval;
- never hide from audit.

---

## 56. No credential sharing

Support never asks user for:

- password;
- OTP;
- magic-link secret;
- recovery code;
- session token.

---

## 57. No “send me your login”

Absolute.

---

## 58. Screen sharing

Operational support could guide user.

Does not grant server-side access.

Not assumed product capability.

---

## 59. Customer screenshots

May themselves contain sensitive Deal data.

Treat as support data under policy.

---

## 60. Support attachments

Need secure intake if ever implemented.

Do not ask clients to email raw private evidence casually.

---

## 61. Audit trail purpose

Security audit answers:

- who;
- what;
- which object;
- when;
- through what authority;
- outcome.

---

## 62. Audit ≠ analytics

Analytics asks product behavior/usage questions.

Security audit proves governed actions.

---

## 63. Audit ≠ report provenance

Analytical provenance is evidence/report lineage.

Security audit is access/operation lineage.

---

## 64. Audit event structure

Conceptual:

```text
auditEventId
occurredAt
actorType
actorId
action
targetType
targetId
authorityRef
result
reasonCode?
requestId?
securityContext?
```

---

## 65. No raw secret in audit

Never:

- password;
- OTP;
- session token;
- bearer token;
- recovery code;
- private key;
- API key.

---

## 66. No raw 42Q in audit

---

## 67. No raw private document content in audit

---

## 68. Audit IDs

Opaque references sufficient.

---

## 69. Audit immutability

Security-relevant audit should be append-oriented/tamper-controlled.

Exact storage architecture later.

---

## 70. Audit correction

If metadata error found:

append correction/superseding event.

Do not silently rewrite history.

---

## 71. Audit deletion

Controlled by `38` retention/legal policy.

---

## 72. Security-log retention

Still unresolved until retention matrix.

This contract defines classes, not days.

---

## 73. Client access to audit

Client may see bounded client-safe history.

Not internal full security audit by default.

---

## 74. Internal audit access

Least privilege.

---

## 75. Support logs

Do not log full report body for convenience.

---

## 76. Request logging

Scrub:

- authorization headers;
- cookies;
- tokens;
- private evidence body;
- questionnaire answers;
- uploaded document contents.

---

## 77. URL logging

Avoid secrets in URL.

---

## 78. Error logging

Stack trace internal only.

Scrub user data.

---

## 79. Correlation ID

Useful.

Opaque.

---

## 80. Deal identifier in logs

Prefer opaque internal ID.

Do not log company pair where unnecessary.

---

## 81. Person identity in logs

Minimize.

---

## 82. Named-leader subject

Do not put name in generic security log if internal ID sufficient.

---

## 83. Log access

Restricted operational/security role.

---

## 84. Production logs

No broad developer browsing.

---

## 85. Developer access

Production access requires explicit operational policy.

Not implied by GitHub/code access.

---

## 86. Engineering admin

No standing access to client Deals by virtue of being developer.

---

## 87. Database access

Production direct DB access is exceptional.

---

## 88. Read replicas

Still sensitive.

---

## 89. Query tools

Internal query capability must enforce purpose and auditing.

---

## 90. Global search

Accepted `29`: no unauthorized cross-client search.

---

## 91. Cross-client support search

Prohibited by default.

---

## 92. Tenant isolation

Every support/security action stays scoped to target tenant/Deal/account.

---

## 93. Confused-deputy protection

Internal tooling must not let one customer identifier accidentally authorize another customer's resources.

---

## 94. Access token scope

Internal service credentials scoped to service/action where practical.

---

## 95. Secrets management

Secrets never committed to repo/client bundle.

---

## 96. Secrets classes

Examples:

- auth provider secret;
- email provider API key;
- database credential;
- model provider API key;
- encryption key;
- webhook secret;
- signing key.

---

## 97. Secret storage

Managed secure server-side secret mechanism.

Exact provider later.

---

## 98. Secret rotation

Policy/process required.

Exact cadence not invented.

---

## 99. Secret exposure

Treat as security event requiring triage.

---

## 100. Hard-coded secret

Blocking security defect.

---

## 101. Secret in Git history

Requires incident/rotation review.

Deletion from current file alone insufficient.

---

## 102. Secret in logs

Same.

---

## 103. Secret in client bundle

Immediate containment/rotation review.

---

## 104. Environment variables

Server-only secret usage where appropriate.

---

## 105. Public config

Must be explicitly non-secret.

---

## 106. Model provider credentials

Server-side only.

---

## 107. Webhook secrets

Verify signature where webhooks later exist.

---

## 108. Dependency security

Need governed dependency/vulnerability process.

---

## 109. Package install ≠ security approval

---

## 110. Vulnerability finding

Signal until triage.

---

## 111. Known exploitable vulnerability

Requires priority response according to security policy.

Exact SLA later.

---

## 112. Dependency update

Must pass regression/security tests.

---

## 113. Auto-update

Do not automatically deploy security patch without tests if it can break analytical authority.

Need bounded emergency path.

---

## 114. Emergency patch

Can receive expedited review but not bypass all validation.

---

## 115. Security patch vs methodology

Security fix must not silently change analytical methodology.

---

## 116. Methodology fix vs security fix

Separate act even if same release.

---

## 117. Vulnerability scanning

Target capability.

Exact tools/vendor later.

---

## 118. Static analysis

Useful but not sufficient.

---

## 119. Dependency scanning

Useful but not sufficient.

---

## 120. Secret scanning

Required target capability before production maturity.

---

## 121. Dynamic testing

Future security validation.

---

## 122. Penetration testing

Potential enterprise requirement.

Do not claim performed until real.

---

## 123. Bug bounty

Not assumed.

---

## 124. SOC 2

Not claimed.

---

## 125. ISO 27001

Not claimed.

---

## 126. NIST compliance

Not claimed.

---

## 127. HIPAA / GDPR / CCPA slogans

No universal compliance claim.

Applicable legal analysis separate.

---

## 128. Procurement security package

Accepted `33`:

only factual/current security artifacts.

---

## 129. Security questionnaire responses

Answer from real controls/evidence.

Unknown → unknown / planned.

---

## 130. No roadmap-as-control

Planned control is not implemented control.

---

## 131. No “in progress” as certification

---

## 132. Evidence for security claim

Examples:

- test result;
- config;
- architecture record;
- policy;
- audit log sample;
- provider contract;
- independent assessment.

---

## 133. Security control inventory

Target internal object:

```text
controlId
controlStatement
scope
implementationState
evidenceRefs[]
owner
lastVerifiedAt
exceptions[]
```

---

## 134. Control states

Conceptual:

```text
NOT_IMPLEMENTED
IMPLEMENTED_UNVERIFIED
VERIFIED
EXCEPTION
RETIRED
```

Exact enum later.

---

## 135. Client security claims

Only `VERIFIED` or otherwise clearly qualified real state.

---

## 136. Security exception

Temporary deviation from accepted control.

Requires:

- owner;
- reason;
- scope;
- compensating control;
- expiry/review;
- approval;
- audit.

---

## 137. No permanent “temporary” exception

Expiry/review required.

---

## 138. Exception does not lower analytical evidence rules

---

## 139. Incident detection sources

Potential:

- auth/session events;
- authorization denials;
- secret scans;
- dependency alerts;
- infrastructure logs;
- provider notices;
- client reports;
- internal operator reports.

No source assumed implemented.

---

## 140. Automated detection

Only where actual telemetry exists.

---

## 141. Client report

A client security concern can create triage record.

Not automatically confirmed incident.

---

## 142. False positive

Close with evidence/rationale.

---

## 143. Security event dedup

Avoid duplicate incident records from retries/repeated logs.

---

## 144. Correlation

May group related signals.

No AI inference as final authority without evidence.

---

## 145. LLM role in security operations

LLM may:

- summarize logs;
- cluster related events;
- draft incident timeline;
- suggest investigation questions.

LLM may not independently:

- declare legal breach;
- grant break-glass;
- delete data;
- notify client of breach;
- rotate production secrets without authorized automation;
- close incident.

---

## 146. AI-generated incident summary

Must cite/trace underlying events internally.

---

## 147. No hidden agent remediation

Production-changing action requires authorized tool/control path.

---

## 148. Automatic token revocation

Can be deterministic for known hard rule.

Example:

revoked token → deny.

---

## 149. Automatic account suspension

Requires predeclared security rule.

Not LLM whim.

---

## 150. Anomaly detection

Future.

No unsupported behavioral surveillance.

---

## 151. Employee/client profiling

Security system should not become HR/personality monitoring.

---

## 152. IP reputation

Signal only.

---

## 153. VPN/Tor

Not automatic malicious classification.

---

## 154. Geolocation anomalies

Signal only.

---

## 155. Rate-limit event

Security event metadata.

---

## 156. Rate limits

Exact thresholds downstream.

---

## 157. Brute-force protection

Required where credentials/codes exist.

---

## 158. Account lockout

Avoid easy denial-of-service.

Mechanism-specific.

---

## 159. Session compromise

Actions may include:

- revoke session;
- logout all;
- credential reset/recovery;
- user security notification.

Controlled by `37`/`36`.

---

## 160. Share compromise

Revoke share per `35`.

Downloaded artifact cannot be recalled.

---

## 161. Collaborator compromise

Revoke membership per `34`.

---

## 162. Respondent token compromise

Revoke invite/session.

No Deal membership impact beyond bounded respondent flow.

---

## 163. 42Q participant compromise

Immediately restrict person-level session and review affected processing.

---

## 164. API/model provider incident

Assess:

- data sent;
- time window;
- affected Deals;
- provider retention;
- credential exposure;
- client/legal obligations.

---

## 165. Email provider incident

Assess recipient metadata/distribution exposure.

---

## 166. Auth provider incident

Assess account/session identity risk.

---

## 167. Storage provider incident

Assess private evidence/data classes.

---

## 168. Payment provider incident

Separate financial/commercial scope.

---

## 169. Third-party incident ≠ MergeVue breach automatically

Requires impact analysis.

---

## 170. Subprocessor inventory

Future security/privacy requirement.

Not public claim until maintained.

---

## 171. Incident timeline

Must be evidence-backed.

---

## 172. Detection time vs occurrence time

Different.

Do not invent occurrence time.

---

## 173. Unknown start time

Mark unknown/bounded estimate internally.

---

## 174. Client notification

Controlled by:

- legal classification;
- affected customer scope;
- approved communication process.

---

## 175. Notification channel

Use accepted `36`.

---

## 176. No raw security details in subject

---

## 177. No public disclosure before authority

---

## 178. No universal breach-notification SLA claim

Legal windows vary.

---

## 179. Client incident copy

Must distinguish known facts from investigation.

---

## 180. Example safe language

Candidate:

`We are investigating a security issue that may affect your MergeVue account.`

Only if factually true.

---

## 181. Never claim affected if unknown

---

## 182. Never claim unaffected without evidence

---

## 183. Regulatory notification

Legal process.

Not product designer decision.

---

## 184. Law enforcement

Legal process.

---

## 185. Public statement

Owner/legal/security authority.

---

## 186. Internal incident channel

Operational tooling later.

No Slack dependency assumed.

---

## 187. Incident commander

Operational role.

Exact staffing later.

---

## 188. Single founder operation

Early-stage reality may require one person to hold several operational roles.

That does not erase logical separation/audit requirements.

---

## 189. Dual control

Recommended for especially sensitive destructive/privileged actions once staffing permits.

Not falsely claimed before available.

---

## 190. Owner emergency authority

Project governance Owner ≠ routine production superuser.

Any production privileged action still follows security act.

---

## 191. Analyst support crossover

Analyst cannot use analytical access as support privilege.

---

## 192. Security operator analytical neutrality

Security operator does not adjudicate Environment/report semantics.

---

## 193. Incident preservation

Security incident may require preserving logs/evidence.

---

## 194. Preservation ≠ client evidence admission

Security evidence does not become M&A analytical evidence.

---

## 195. Legal hold

If incident/legal process requires hold:

use `38`.

---

## 196. No indefinite incident hold

Requires authority/review.

---

## 197. Post-incident review

After recovery:

- root cause;
- affected controls;
- detection gap;
- containment effectiveness;
- corrective actions;
- regression tests;
- policy updates.

---

## 198. Root cause grouping

Prefer root cause over patch proliferation.

---

## 199. Corrective action

Can create:

- code fix;
- configuration fix;
- permission fix;
- process fix;
- training/operational fix;
- vendor action.

---

## 200. Security CORR and MergeVue audit rule

If independent security audit returns material FAIL/BLOCKING:

research mature professional patterns before corrective act, preserving controlling project authority.

---

## 201. Re-test

Material security fix requires verification.

---

## 202. Independent verification

High-risk security change should receive independent review where practical.

---

## 203. Regression

Test security fix does not break:

- report authority;
- permissions;
- evidence lineage;
- questionnaire;
- sharing;
- lifecycle.

---

## 204. Closure criteria

Incident closes only after:

- containment resolved;
- remediation complete or governed residual exception;
- recovery validated;
- notifications/legal obligations addressed;
- corrective actions tracked.

---

## 205. Residual risk

Do not hide.

Can retain explicit exception.

---

## 206. Security debt

Track separately from analytical roadmap.

---

## 207. Risk register

Potential future internal security artifact.

Not client-facing dashboard.

---

## 208. Client-facing security page

Not required v1.

---

## 209. Trust center

Do not create fake trust center with unverified badges.

---

## 210. Security documentation

Can provide factual package on request per `33`.

---

## 211. Policy documents

Only if actual.

---

## 212. Security architecture diagram

Useful if accurate.

---

## 213. Data flow diagram

Useful for procurement/security review.

---

## 214. Access-control description

Can reference accepted design only if labeled target vs implemented.

---

## 215. Incident-response policy

Cannot claim “documented and tested” until actual operational policy/drill.

---

## 216. Security training

Do not claim unless real.

---

## 217. Background checks

Do not claim.

---

## 218. Cyber insurance

Do not claim.

---

## 219. Certifications

Do not claim.

---

## 220. Encryption at rest

Do not claim globally until verified for actual stores/providers.

---

## 221. Encryption in transit

Same factual requirement.

---

## 222. Key management

Separate implementation.

---

## 223. Tenant isolation

Must be validated in production architecture.

---

## 224. Environment separation

Production/staging/dev should be separated.

---

## 225. Production data in staging

Prohibited by default.

---

## 226. Synthetic test data

Preferred.

---

## 227. Production debugging

Metadata/log-first.

---

## 228. Snapshot copying

No full production DB copy to developer laptop.

---

## 229. Developer laptop

Not approved private-data store.

---

## 230. Local exports

Sensitive production exports prohibited except authorized incident process.

---

## 231. Temporary incident artifact

Encrypted/restricted and lifecycle-controlled.

---

## 232. Security evidence storage

Separate protected location/process.

---

## 233. Incident screenshots

Can contain private data.

Handle accordingly.

---

## 234. Packet/network captures

Potentially sensitive.

Scoped, retained per incident policy.

---

## 235. Database snapshots

High sensitivity.

Not routine incident artifact.

---

## 236. Client data minimization during forensics

Collect only necessary data.

---

## 237. Forensic tool/vendor

Requires privacy/security review.

---

## 238. External security consultant

Does not receive data automatically.

Contract/access gate required.

---

## 239. External auditor

Bounded access.

---

## 240. Pen tester

Use scoped testing environment/authorization.

---

## 241. No production destructive testing without explicit authorization

---

## 242. Responsible disclosure

Future vulnerability-reporting process.

Not required v1 but valuable.

---

## 243. Security contact

Do not invent email address.

---

## 244. `security@mergevue...`

Not shown until mailbox/domain exists.

---

## 245. Support contact

Same.

---

## 246. Phishing

Official security communication should avoid requesting credentials.

---

## 247. Client verification of message

Future support/security page may help.

Not required.

---

## 248. Notification signing

Email-domain controls operational later.

---

## 249. Security alerts via `36`

Essential security messages may bypass ordinary marketing/workflow opt-outs.

---

## 250. Security event client preference

Critical security notification should not depend on marketing preference.

---

## 251. Incident and account deletion

Accepted `38`:

incident may delay deletion only through authorized containment/legal process.

---

## 252. Incident and legal hold

Use explicit hold.

No silent indefinite pause.

---

## 253. Incident and backup

Preservation must not turn backup into active use.

---

## 254. Incident and share links

Affected shares can be revoked.

---

## 255. Incident and public report

Public layer may remain available if unaffected.

---

## 256. Incident and paid Deal

Could temporarily deny access for safety.

Need clear bounded state.

---

## 257. Maintenance vs incident

Planned maintenance is not security incident.

---

## 258. Outage vs incident

Availability outage is not automatically security incident.

---

## 259. Data corruption

Can be security/integrity incident depending cause.

---

## 260. Analytical defect

Not security incident by default.

---

## 261. Model hallucination

Analytical quality issue, not security incident unless caused by compromised data/system.

---

## 262. Unauthorized methodology mutation

Could be security/integrity incident.

---

## 263. Unauthorized report release

Security/access incident.

---

## 264. Wrong-recipient share

Potential confidentiality incident.

Requires triage.

---

## 265. Wrong-recipient email attachment

Cannot recall.

Escalate.

---

## 266. Accidental raw 42Q disclosure

High-sensitivity security/privacy incident.

Immediate containment and legal/privacy review.

---

## 267. Cross-Deal evidence leakage

Material security/privacy incident.

---

## 268. Unauthorized internal browsing

Security incident.

---

## 269. Support misuse

Security incident.

---

## 270. Operator credential compromise

Security incident.

---

## 271. Secret leak

Security event / possible incident.

---

## 272. Dependency compromise

Security incident if impacted.

---

## 273. Supply-chain compromise

Same.

---

## 274. Malicious uploaded file

Security event.

Private document ingestion should have file-security controls.

---

## 275. Malware scanning

Target upload-security capability.

Exact vendor/tool later.

---

## 276. File quarantine

Potential state.

Not implemented claim.

---

## 277. File type validation

Required at ingestion implementation.

---

## 278. Content sniffing

Implementation security.

---

## 279. Archive bomb / parser abuse

Need upload limits/processing isolation.

---

## 280. Prompt injection in documents

AI security issue.

Uploaded content is untrusted data, not instructions.

---

## 281. Document prompt injection rule

LLM-processing layer must not allow uploaded evidence text to modify system/tool authority.

---

## 282. External web content prompt injection

Same.

---

## 283. Tool authority

Only application policy controls tools/actions.

---

## 284. LLM sees secret

Avoid sending credentials/secrets to model.

---

## 285. Private evidence to model provider

Only according to approved processing/data policy.

---

## 286. Model provider retention

Must be verified before procurement/security claim.

---

## 287. Provider outage

Fail closed where authoritative processing unavailable.

---

## 288. Provider fallback

Must preserve data-rights/security and model-routing policy.

No ad hoc consumer endpoint.

---

## 289. Data exfiltration prevention

Architecture should minimize unnecessary outbound payloads.

---

## 290. Prompt/response logs

Do not store sensitive full prompts by default unless purpose/policy.

---

## 291. LLM observability

Metadata preferable.

---

## 292. Security testing for AI pipeline

Include:

- prompt injection;
- data exfiltration;
- cross-Deal context;
- tool misuse;
- hidden instruction override;
- private evidence leakage.

---

## 293. Cross-session context

No accidental client data carryover.

---

## 294. Cache isolation

Per Deal/tenant where sensitive.

---

## 295. Vector retrieval isolation

Per `29`.

---

## 296. Error fallback

Never dump raw prompt/evidence to client error message.

---

## 297. Security headers

Production web security hardening required.

Exact headers/deployment configuration separate.

---

## 298. CSP

Target control.

---

## 299. CORS

Restrictive authenticated API policy.

---

## 300. CSRF

Per `37`.

---

## 301. XSS

Security control.

---

## 302. Clickjacking

Security control.

---

## 303. SSRF

Relevant if server fetches URLs/documents.

---

## 304. File upload RCE

Relevant to private ingestion.

---

## 305. SQL/NoSQL injection

Backend security baseline.

---

## 306. Command injection

No shell construction from untrusted input.

---

## 307. Path traversal

Relevant to file processing.

---

## 308. Deserialization

Fail closed on malformed untrusted objects.

---

## 309. Resource exhaustion

Rate/size/timeout controls.

---

## 310. Denial of service

Operational security.

---

## 311. Availability

Security objective but no SLA invented.

---

## 312. Business continuity

Separate operational policy.

---

## 313. Disaster recovery

Separate infrastructure policy.

---

## 314. Backup recovery test

Needed before resilience claims.

---

## 315. RPO/RTO

Not invented.

---

## 316. Uptime

Not promised here.

---

## 317. Status page

Not required v1.

---

## 318. Incident banner

Only if real incident and useful.

---

## 319. Client-safe incident status

Avoid sensitive exploit details during active incident.

---

## 320. Postmortem

Internal by default.

Client/public postmortem only when authorized.

---

## 321. Blameless language

Operational process can focus on root cause/control gaps.

Does not remove accountability.

---

## 322. Root-cause evidence

Separate facts from hypotheses.

---

## 323. Security finding status

Conceptual:

```text
OPEN
MITIGATED
VERIFIED_CLOSED
ACCEPTED_EXCEPTION
```

Not final enum.

---

## 324. Finding owner

Named internal owner.

---

## 325. Finding due date

Only if operationally assigned.

No public promise.

---

## 326. Vulnerability SLA

Not invented.

---

## 327. Pen-test finding

Requires remediation/verification.

---

## 328. Independent audit finding

Same.

---

## 329. False-positive security finding

Close with evidence.

---

## 330. Procurement disclosure

Can state:

`Security controls are under development`

if accurate.

Not:

`Enterprise-grade security`

without basis.

---

## 331. Customer security review

Manual initially.

---

## 332. Security questionnaire owner

Internal designated person.

Not analyst by default.

---

## 333. Questionnaire source of truth

Security control inventory + evidence.

Not memory.

---

## 334. Reuse questionnaire answers

Only if still current and scope matches.

---

## 335. Expired security evidence

Do not reuse indefinitely.

---

## 336. Security evidence date

Track.

---

## 337. Policy version

Track.

---

## 338. Architecture version

Track where claim depends.

---

## 339. Deployment environment

Claim scope matters.

---

## 340. “Production” meaning

Actual live client environment.

Not local/staging.

---

## 341. Security review gate before collaboration launch

Accepted `34`.

---

## 342. Security review gate before secure sharing launch

Accepted `35`.

---

## 343. Security review gate before notifications

Accepted `36`.

---

## 344. Security review gate before auth launch

Accepted `37`.

---

## 345. Security review gate before deletion

Accepted `38`.

---

## 346. Security review deliverable

Target:

```text
scope
threats
controls
exceptions
test evidence
open blockers
release decision
```

---

## 347. Release decision

Security reviewer may return:

- PASS;
- FAIL;
- PASS WITH EXPLICIT ACCEPTED EXCEPTION.

Exact governance later.

---

## 348. Owner acceptance

Owner can accept a documented business/security exception.

But factual security claim remains factual.

---

## 349. Owner cannot make an unimplemented control implemented by declaration

Absolute.

---

## 350. Risk acceptance ≠ control existence

---

## 351. Client disclosure of exception

Legal/commercial decision depending materiality.

---

## 352. Internal risk register

Could track.

Not client report.

---

## 353. Security baseline for v1

Before private paid workflow launch, target minimum:

- server-side authentication/authorization;
- least privilege;
- secret management;
- production/staging separation;
- protected private evidence;
- no cross-Deal leakage;
- audit of privileged/access changes;
- rate/abuse controls;
- dependency/secret scanning;
- incident-response process;
- backup/lifecycle alignment;
- secure sharing;
- safe notification;
- tested revocation.

This is target readiness list, not current claim.

---

## 354. Additional person-level baseline

Before 42Q/named-leader production:

- legal basis;
- retention matrix;
- person-data isolation;
- restricted operator access;
- incident path for person-data exposure;
- audit;
- withdrawal propagation.

---

## 355. Support-access readiness

Before any support content-access feature:

- authenticated internal operator identity;
- role separation;
- metadata-first flow;
- explicit ticket/request;
- permission/approval;
- expiry;
- re-auth;
- audit;
- restricted-data hard denials;
- client-safe communication.

---

## 356. Break-glass readiness

Additional:

- defined qualifying conditions;
- approval authority;
- bounded scope;
- automatic expiry;
- event monitoring;
- post-use review;
- revocation;
- testing.

---

## 357. Incident-response readiness

At minimum:

- incident intake;
- triage owner;
- containment playbook;
- access/secret/session revoke capability;
- evidence preservation;
- legal/privacy escalation;
- client communication path;
- recovery validation;
- post-incident review.

---

## 358. Testing

At minimum:

1. unauthorized support user attempts Deal access;
2. Support Operator metadata-only path;
3. restricted content access denied;
4. break-glass expired;
5. break-glass revoked;
6. wrong Deal scope;
7. operator action audit;
8. no secret in audit;
9. no raw 42Q in logs;
10. no private document body in logs;
11. revoked session denied;
12. wrong-recipient share incident triage;
13. cross-Deal leakage test;
14. support misuse event;
15. secret exposure test;
16. dependency alert triage;
17. provider incident scope;
18. upload malicious-file handling;
19. prompt-injection document does not alter authority;
20. model/tool exfiltration attempt blocked;
21. incident does not silently create legal hold;
22. legal hold does not broaden access;
23. deleted/suppressed source stays blocked during incident restore;
24. incident notification does not overclaim breach;
25. production/staging isolation.

---

## 359. Audit tests

- every privileged grant has actor;
- every grant has scope;
- every grant has authority reference;
- every grant has expiry where exception;
- every use is attributable;
- every revoke recorded;
- denied access events available for security analysis without private content;
- audit cannot be edited silently;
- analytics cannot replace audit;
- audit logs do not contain credentials.

---

## 360. Support tests

- client ticket does not auto-grant data access;
- metadata sufficient path works;
- restricted content needs separate grant;
- raw respondent answers denied;
- raw 42Q denied;
- account credentials never requested;
- support cannot change analytical conclusion;
- support cannot release report;
- support cannot delete Deal ad hoc;
- support cannot alter client membership without accepted authority.

---

## 361. AI-security tests

- uploaded prompt injection treated as data;
- malicious web source cannot override system rules;
- one Deal context cannot leak into another;
- LLM cannot grant itself tool scope;
- LLM cannot classify legal breach autonomously;
- LLM cannot mint break-glass;
- LLM cannot issue client incident communication without approved state;
- sensitive full prompt logs are absent unless governed.

---

## 362. Уровень доверия

### 362.1. Existing bounded security primitives

**Высокое доверие** к existence of selected current primitives:

- cryptographic random tokens;
- hashing;
- timing-safe comparison;
- invite TTL;
- failed-attempt/lockout concepts.

### 362.2. General incident-response system

**Не подтверждено как current production capability.**

### 362.3. Break-glass support access

**Не подтверждено / не реализовано как accepted current capability.**

### 362.4. Full security audit pipeline

**Не подтверждено как unified production system.**

### 362.5. Internal operational role model

**OWNER-ACCEPTED target design.**

It is separate from accepted client roles and remains subject to downstream IAM/security implementation.

### 362.6. Security-event / incident / breach distinction

**High-confidence architectural boundary.**

### 362.7. Security certifications

**None claimed by this contract.**

### 362.8. 24/7 SOC / on-call

**Not claimed.**

### 362.9. Security readiness gates

**OWNER-ACCEPTED target design**, still pending actual implementation and verification before any corresponding production capability or security claim is made.

---

## 363. Что мы сознательно НЕ меняем

1. Client roles remain `Deal Administrator / Deal Collaborator / Deal Viewer`.
2. Internal roles remain separate.
3. Support does not become client collaborator.
4. Break-glass does not become permanent superuser.
5. Authentication remains governed by `37`.
6. Client authorization remains governed by `34`.
7. Sharing remains governed by `35`.
8. Notifications remain governed by `36`.
9. Lifecycle/legal hold remains governed by `38`.
10. Data rights remain governed by `29`.
11. Person-level restrictions remain governed by `31`.
12. Private evidence remains governed by `24`.
13. Raw respondent answers remain restricted.
14. Raw 42Q remains restricted.
15. Internal type/function remains restricted.
16. No security certification is claimed.
17. No 24/7 response is claimed.
18. No incident SLA is invented.
19. No vulnerability-remediation SLA is invented.
20. No break-glass duration is invented.
21. No production support console route is authorized.
22. No SOC/SIEM vendor is selected.
23. No security@ email is invented.
24. No pen test is claimed.
25. No new analytical authority is created.

---

## 364. Acceptance criteria

Contract passes only if:

1. Security signal differs from event.
2. Security event differs from incident.
3. Incident differs from legal breach.
4. No automatic breach wording.
5. Incident determination is evidence-based.
6. Incident lifecycle is explicit.
7. Severity numbers are not invented.
8. Incident SLA is not invented.
9. Containment differs from deletion.
10. Containment differs from legal hold.
11. Incident response never bypasses auth.
12. Internal roles differ from client roles.
13. Client role never grants internal role.
14. Internal role never grants Deal content by default.
15. Support is metadata-first.
16. Support ticket is not access grant.
17. Support raw respondent access denied by default.
18. Support raw 42Q access denied.
19. Support private evidence access exceptional.
20. Break-glass is exceptional only.
21. No standing break-glass.
22. Break-glass requires actor/reason/scope/expiry/authority.
23. Break-glass requires re-authentication.
24. Exact break-glass duration remains external.
25. Break-glass auto-expires.
26. Break-glass is least privilege.
27. Break-glass does not imply export.
28. Break-glass read does not imply mutate.
29. Break-glass events are audited.
30. Silent impersonation prohibited.
31. Future impersonation preserves operator identity.
32. Support never asks for credentials.
33. Audit differs from analytics.
34. Audit differs from analytical provenance.
35. Audit stores actor/action/target/authority/outcome.
36. Audit never stores secrets.
37. Audit never stores raw 42Q.
38. Audit never stores raw private-document body.
39. Audit history is not silently rewritten.
40. Security-log retention remains `38` policy matter.
41. Client audit view is bounded.
42. Request logs scrub credentials/tokens.
43. Deal name/company pair minimized in logs.
44. Named-leader name minimized in logs.
45. Developer access does not imply production Deal access.
46. Direct DB access is exceptional.
47. Cross-client support search prohibited by default.
48. Tenant scoping applies to operator actions.
49. Secrets stay server-side.
50. Secret rotation process required.
51. Secret exposure triggers triage.
52. Hard-coded secret is blocking defect.
53. Client-bundle secret is blocking incident.
54. Dependency security is governed.
55. Dependency update requires regression.
56. Security patch cannot silently change methodology.
57. Secret/dependency scanning are target controls.
58. Pen test not claimed before real.
59. SOC 2 not claimed.
60. ISO 27001 not claimed.
61. NIST certification not claimed.
62. Procurement security answers are factual.
63. Roadmap is not represented as implemented control.
64. Security control inventory is evidence-backed.
65. Security exception is scoped/approved/time-bound.
66. No permanent temporary exception.
67. Client security claim reflects actual state.
68. Signals can come from multiple real sources.
69. LLM may summarize but not declare legal breach.
70. LLM cannot grant break-glass.
71. LLM cannot delete or notify autonomously.
72. Automatic revocation only follows predeclared hard rules.
73. Anomaly signals are not person profiling.
74. IP/VPN/location are signals, not verdicts.
75. Brute-force controls exist where credentials exist.
76. Session compromise can revoke sessions.
77. Share compromise uses `35`.
78. Membership compromise uses `34`.
79. Respondent compromise remains bounded.
80. 42Q compromise receives high-sensitivity response.
81. Provider incident receives impact assessment.
82. Third-party incident is not automatically MergeVue breach.
83. Incident timeline separates occurrence/detection times.
84. Client notification is legally/security authorized.
85. Notification uses `36`.
86. No universal breach SLA.
87. Client copy distinguishes facts from investigation.
88. Regulatory/public statements are separately authorized.
89. Early-stage staffing does not erase logical role separation.
90. Project Owner is not routine production superuser.
91. Analyst access is not support privilege.
92. Security operator does not adjudicate analytical truth.
93. Security evidence does not become M&A evidence.
94. Legal hold uses `38`.
95. No indefinite incident hold.
96. Post-incident review covers root cause/control gaps.
97. Material fix is re-tested.
98. High-risk change receives independent review where practical.
99. Security fix receives non-regression review.
100. Incident closure criteria are explicit.
101. Residual exception is visible internally.
102. Fake trust center prohibited.
103. Security package contains only current factual artifacts.
104. “Documented and tested IR” not claimed until true.
105. Encryption claims require verified scope.
106. Tenant isolation claim requires verification.
107. Production/staging separation is target baseline.
108. Production data not copied casually to staging.
109. Production debugging is metadata-first.
110. Developer laptop is not approved client-data store.
111. Temporary incident artifacts are lifecycle-controlled.
112. External auditor/consultant access is bounded.
113. No destructive security testing without authorization.
114. Security contact email is not invented.
115. Critical security notices are not marketing.
116. Incident cannot silently delay deletion indefinitely.
117. Wrong-recipient disclosure triggers triage.
118. Cross-Deal leakage is material incident.
119. Accidental raw 42Q disclosure is high-sensitivity incident.
120. Unauthorized internal browsing is incident.
121. Support misuse is incident.
122. Prompt injection is treated as untrusted data.
123. Uploaded evidence cannot redefine system authority.
124. Model/tool boundaries prevent self-escalation.
125. Sensitive provider payloads follow approved data policy.
126. Cross-session/cross-Deal AI context leakage prohibited.
127. Security headers/hardening are implementation requirements.
128. Availability/SOC/RPO/RTO promises not invented.
129. Security review gates precede protected feature launches.
130. Security reviewer can identify blocking defects/exceptions.
131. Owner acceptance of risk does not make control implemented.
132. Client claims remain factual despite risk acceptance.
133. V1 security baseline is readiness target, not current claim.
134. Person-level baseline is stricter.
135. Support-access feature cannot launch before audit/expiry/permissions.
136. Break-glass cannot launch before approval/expiry/review machinery.
137. Incident response requires containment/recovery/communication path.
138. Tests cover operator scope and secret leakage.
139. Tests cover prompt injection/cross-Deal isolation.
140. LIVE audit occurs before implementation because this contract audits `main`, not deployed production.

---

## 365. Implementation sequence

### Phase 0 — terminology and role separation

Freeze:

```text
client role
internal operational role
support access
security access
break-glass
incident
breach
audit
analytics
```

### Phase 1 — security audit foundation

Implement security-relevant event records for:

- authentication;
- permission changes;
- sharing;
- lifecycle;
- privileged operations;
- denied access.

No raw secrets/private content.

### Phase 2 — support metadata mode

Implement support capability that can diagnose:

- request ID;
- account state;
- Deal opaque ID;
- workflow status;
- error state;

without Deal evidence content.

### Phase 3 — internal operational IAM

Add explicit internal identities/roles.

No hidden global superuser.

### Phase 4 — incident intake and triage

Create:

- incident record;
- evidence-backed timeline;
- containment actions;
- owner;
- closure record.

### Phase 5 — privileged exception access

Only after phases 1–4:

- approval;
- re-auth;
- scope;
- expiry;
- audit;
- post-use review.

### Phase 6 — vulnerability/secret management

Add:

- dependency scan;
- secret scan;
- remediation tracking;
- verified closure.

### Phase 7 — AI/security hardening

Test:

- prompt injection;
- cross-Deal context;
- tool misuse;
- provider boundary;
- sensitive logging.

### Phase 8 — procurement evidence layer

Generate factual control inventory and evidence package from real implementation.

No certification theater.

---

## 366. Downstream decisions still required

1. internal operational role names/final IAM schema;
2. break-glass approval authority;
3. whether dual approval is mandatory for selected classes;
4. exact break-glass maximum duration;
5. security-log retention schedule;
6. incident severity taxonomy;
7. incident-response ownership/on-call model;
8. response/remediation SLAs if any;
9. SIEM/logging provider;
10. security monitoring stack;
11. vulnerability scanning tools;
12. secret management provider;
13. penetration-testing cadence/provider;
14. responsible-disclosure channel;
15. client incident-notification legal process;
16. external forensic vendor process;
17. support attachment/intake mechanism;
18. internal support console architecture;
19. client-visible security/audit history;
20. security control evidence refresh cadence.

---

## 367. Owner acceptance and final release boundary

**Owner acceptance состоялся 2026-09-16.**

С этого момента `39 v1.0` является **controlling security operations, incident response, audit and support access design contract** для MergeVue.

Owner acceptance устанавливает как controlling target policy:

- `SECURITY SIGNAL ≠ SECURITY EVENT ≠ SECURITY INCIDENT ≠ DATA BREACH`;
- support operates metadata-first;
- internal operational roles remain separate from client roles;
- no standing superuser;
- silent client impersonation is prohibited;
- break-glass is exceptional, scoped, time-bound, re-authenticated, audited and automatically expires;
- support does not receive raw respondent answers, raw 42Q, private evidence or named-leader material by default;
- security audit is distinct from analytics and analytical provenance;
- secrets and sensitive client content are excluded from logs;
- developer/repository access does not create production Deal access;
- production DB access is exceptional rather than routine support behavior;
- wrong-recipient disclosure, cross-Deal leakage, unauthorized internal browsing and raw 42Q disclosure are security/privacy incidents requiring governed triage;
- LLMs may assist triage but may not autonomously declare a legal breach, grant break-glass, delete data, notify clients of an incident or close incidents;
- procurement/security claims must reflect current verified controls rather than roadmap intentions;
- incident handling must preserve the access, data-rights, lifecycle and person-level boundaries established by `29`, `31`, `34`, `35`, `37` and `38`.

Owner acceptance **не означает автоматически**:

- implementation authorization;
- that incident-response tooling exists;
- that a SIEM/SOC exists;
- that a 24/7 on-call function exists;
- that break-glass tooling exists;
- that a support console exists;
- that production security monitoring exists;
- that penetration testing has been performed;
- that SOC 2, ISO 27001, NIST or any other certification/compliance status exists;
- that any incident-response or vulnerability-remediation SLA exists;
- that security-log retention has been legally/policy-approved;
- that any unverified security control may be represented to clients as implemented.

Every production security claim remains **evidence-dependent**. The downstream decisions listed in §366 remain separate implementation/security/legal acts.

---

## 368. Финальная формула

> **MergeVue security operations must not create a hidden class of people who can simply “see everything.” Client authorization, data rights and person-level restrictions remain intact even during support and incident response.**

> **Support begins with metadata. Privileged content access is exceptional. Break-glass is temporary, scoped, approved, re-authenticated, audited and automatically expires. It is never a permanent admin mode.**

> **A security signal is not an incident, and an incident is not automatically a legally reportable breach. Communication must follow evidence and authorized classification.**

> **The security audit trail proves who did what under which authority. It is not product analytics, not analytical provenance, and never a convenient place to copy raw client data or secrets.**
