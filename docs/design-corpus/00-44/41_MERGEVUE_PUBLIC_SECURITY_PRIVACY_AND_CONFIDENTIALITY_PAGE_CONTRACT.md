# 41. Контракт публичной страницы безопасности, приватности и конфиденциальности MergeVue

**Файл:** `41_MERGEVUE_PUBLIC_SECURITY_PRIVACY_AND_CONFIDENTIALITY_PAGE_CONTRACT.md`  
**Версия:** 1.0  
**Дата:** 2026-09-16  
**Язык документации:** русский  
**Язык клиентского интерфейса:** только American English  
**Рынок первой версии:** США  
**Статус:** **OWNER-ACCEPTED / CONTROLLING PUBLIC SECURITY / PRIVACY / CONFIDENTIALITY PAGE CONTRACT / P-14 CLOSED / НЕ УТВЕРЖДАЕТ НОВЫЕ PRODUCTION SECURITY, PRIVACY ИЛИ LEGAL CAPABILITIES**  
**Тип документа:** публичный page contract / trust-surface projection существующих security/privacy/data-rights authorities  
**Закрывает planned object:** `P-14 — безопасность и конфиденциальность` из `00_MERGEVUE_DESIGN_PROGRAM_OVERVIEW_v1.1.md`  
**Upstream authority:** `08`, `09`, `11`, `24`, `29`, `34`, `35`, `36`, `37`, `38`, `39`, `40`  
**Owner acceptance:** 2026-09-16  
**Следующий authorized numbered design act:** `42_MERGEVUE_ANALYTICAL_COMPONENTS_AND_EVIDENCE_VISUALIZATION_CONTRACT.md`  
**Главный принцип:** публичная страница объясняет фактические и разрешённые границы работы с данными понятным клиентским языком; она не создаёт legal basis, privacy rights, retention policy, security certification, техническую capability или обещание, которых нет в controlling authority и реальной реализации.  
**Ключевые инварианты:** `FACT BEFORE REASSURANCE`, `PUBLIC TRUST SURFACE ≠ PRIVACY POLICY`, `PUBLIC TRUST SURFACE ≠ SECURITY CERTIFICATION`, `POLICY TEXT ≠ ENFORCEMENT`, `ACCESS ≠ REUSE RIGHTS`, `PAYMENT ≠ DATA RIGHTS`, `PUBLIC ≠ UNRESTRICTED`, `PRIVATE EVIDENCE IS DEAL-BOUND BY DEFAULT`, `NO FAKE CONFIDENTIALITY`, `NO FAKE ANONYMITY`, `NO FAKE NO-TRAINING CLAIM`, `NO INVENTED RETENTION PERIOD`, `NO INVENTED SECURITY BADGE`, `NO SECRET SECURITY DETAIL`, `FAIL CLOSED WHEN AUTHORITY IS UNKNOWN`

---

# 0. Решение в одном абзаце

MergeVue должен иметь самостоятельную публичную trust-surface, на которой потенциальный клиент до регистрации, загрузки файлов или передачи индивидуальных данных может понять:

1. какие классы данных вообще использует MergeVue;
2. где проходит граница между public, internal, private и person-level information;
3. почему продукт сначала работает с открытыми данными;
4. когда требуется account / permission / notice / legal authority;
5. кто может видеть private evidence;
6. чем access отличается от secondary use;
7. что происходит с sharing/export;
8. что можно и нельзя утверждать о retention/deletion;
9. как сторонние providers вписываются в обработку;
10. какие security assertions являются допустимыми;
11. почему public page не заменяет юридические документы и не должна обещать абсолютную confidentiality.

Страница должна повышать доверие за счёт **точности границ**, а не за счёт широких заверений.

Неправильная модель:

```text
"We take security seriously."
"We use bank-grade encryption."
"Your data is completely confidential."
"We never use your data for training."
"Your data can be deleted at any time."
```

если точная factual / contractual / policy authority не установлена.

Правильная модель:

```text
what data is involved
→ why it is needed
→ which product boundary applies
→ who may access it
→ what uses are permitted
→ which statements are currently supportable
→ where a separate policy / notice / contract governs
```

---

# 1. Граница полномочий `41`

`41` является **публичной проекцией** уже принятых product/security/privacy/data-rights правил.

Он не является самостоятельным источником:

- права;
- legal interpretation;
- privacy policy;
- DPA;
- terms of service;
- retention schedule;
- deletion schedule;
- security architecture;
- cryptographic architecture;
- provider approval;
- subprocessor inventory;
- incident-response policy;
- breach-notification policy;
- access-control implementation;
- authentication implementation;
- permission matrix;
- data-processing agreement;
- model-provider agreement;
- training/data-use consent;
- publication rights;
- R&D rights.

Если public copy `41` конфликтует с upstream authority:

> **upstream authority wins.**

Если controlling authority не даёт фактического основания для client-facing statement:

> **OMIT BEFORE INVENTING.**

Если implementation ещё не существует:

> **TARGET CONTRACT MUST NOT BE PRESENTED AS CURRENT CAPABILITY.**

---

# 2. Authority hierarchy

При конфликте публичной страницы с другими источниками применяется следующий порядок.

1. Applicable law / binding legal advice / signed contractual authority.
2. Approved legal/privacy/security policy applicable to deployment context.
3. Явная текущая Owner-инструкция, не противоречащая пунктам 1–2.
4. `40_MERGEVUE_PRIVACY_LEGAL_BASIS_DATA_PROCESSING_AND_JURISDICTION_POLICY_CONTRACT.md`.
5. `39_MERGEVUE_SECURITY_OPERATIONS_INCIDENT_RESPONSE_AUDIT_AND_SUPPORT_ACCESS_CONTRACT.md`.
6. `38_MERGEVUE_DEAL_ACCOUNT_AND_DATA_LIFECYCLE_RETENTION_AND_DELETION_CONTRACT.md`.
7. `37_MERGEVUE_IDENTITY_AUTHENTICATION_AND_SESSION_SECURITY_CONTRACT.md`.
8. `36_MERGEVUE_NOTIFICATIONS_COMMUNICATION_AND_FOLLOW_UP_CONTRACT.md`.
9. `35_MERGEVUE_SHARING_EXPORT_AND_RECIPIENT_ACCESS_CONTRACT.md`.
10. `34_MERGEVUE_COLLABORATION_ACCESS_AND_PERMISSIONS_CONTRACT.md`.
11. `31_MERGEVUE_42Q_INDIVIDUAL_DATA_AND_NAMED_LEADER_FORECAST_CONTRACT.md`, когда затронут person-level lane.
12. `29_MERGEVUE_LONGITUDINAL_EVIDENCE_GOVERNANCE_AND_DATA_RIGHTS_CONTRACT.md`.
13. `24_MERGEVUE_PRIVATE_EVIDENCE_AND_DOCUMENT_INGESTION_CONTRACT.md`.
14. `11_MERGEVUE_ACCESSIBILITY_RESPONSIVE_AND_CONTENT_RULES.md`.
15. `09_MERGEVUE_DESIGN_DIRECTION.md`.
16. `08_MERGEVUE_CONTENT_AND_CLAIMS_GOVERNANCE.md`.
17. `41` как presentation contract.

`41` находится ниже substantive authorities.

---

# 3. Что именно закрывает `41`

Этот файл закрывает исходную публичную обязанность:

> `Безопасность и конфиденциальность`

не как generic legal footer, а как полноценную public trust surface.

Он должен спроектировать:

- функцию страницы;
- входы на страницу;
- информационную иерархию;
- client questions;
- data-class explanation;
- public/private/person-level boundaries;
- access explanation;
- secondary-use boundary;
- provider/processors explanation;
- retention/deletion explanation;
- security-claims boundary;
- incident/communication boundary;
- account/auth boundary;
- 42Q/person-data boundary;
- sharing/export boundary;
- trust disclosures;
- prohibited claims;
- accessibility;
- responsive behavior;
- analytics;
- acceptance criteria.

---

# 4. Что `41` сознательно НЕ закрывает

Отдельно не определяются:

- legal text privacy policy;
- cookie policy;
- terms of use;
- DPA clauses;
- jurisdiction-specific consumer notice;
- employment privacy notice;
- respondent notice exact text;
- 42Q consent exact legal text;
- exact retention duration;
- exact deletion SLA;
- exact response window for privacy requests;
- exact breach-notification timeline;
- exact security certifications;
- exact encryption algorithms;
- exact cloud/provider architecture;
- exact data-residency region;
- exact authentication vendor;
- MFA policy;
- SSO policy;
- exact session timeout;
- SOC staffing;
- security on-call commitment;
- pentest cadence;
- vulnerability SLA;
- insurance;
- audit-report availability.

Если такие параметры появятся в production, они должны приходить из соответствующей substantive authority, а `41` только отображает подтверждённый итог.

---

# 5. Основной пользователь страницы

Главные аудитории:

## 5.1. Потенциальный клиент до передачи private data

Типичные роли:

- M&A lead;
- corporate development;
- integration lead;
- operating partner;
- investment professional;
- legal / compliance reviewer;
- security / procurement reviewer;
- executive sponsor.

Главный вопрос:

> `What will MergeVue do with our deal information, and what will it not do?`

## 5.2. Пользователь, уже увидевший public analysis

Главный вопрос:

> `What changes if I save the deal, add internal observations, or upload private evidence?`

## 5.3. Enterprise reviewer

Главный вопрос:

> `Which controls are factual product capabilities, which are policy-dependent, and which require separate contractual or security review?`

## 5.4. Respondent / individual participant

Не является primary audience общей marketing surface, но должен иметь возможность понять:

> `Where can I find the notice that governs my own responses or individual data?`

Точная participant notice остаётся отдельной applicable notice, а не заменяется общей страницей `41`.

---

# 6. Главный результат страницы

После чтения страницы пользователь должен корректно понимать:

1. public analysis может начинаться без private evidence;
2. public data и private client data не являются одним классом;
3. private evidence запрашивается для конкретной analytical purpose, а не «на всякий случай»;
4. доступ к Deal/evidence регулируется server-authoritative authorization;
5. membership не означает доступ ко всем data classes;
6. report recipient не становится Deal collaborator автоматически;
7. access не создаёт право на R&D, publication, benchmark или model training;
8. secondary use требует отдельной authority;
9. person-level / 42Q data имеет более строгую границу;
10. retention/deletion различаются по data class и purpose;
11. MergeVue не должен обещать конкретные retention periods без утверждённой policy;
12. deletion, access revocation, archive и withdrawal — разные operations;
13. security event, incident и breach — разные состояния;
14. support/security staff не имеют скрытого универсального доступа к Deals;
15. provider usage ограничивается approved policy;
16. public copy не является юридическим обещанием сильнее применимой policy/contract;
17. точные legal notices / privacy rights / jurisdiction-specific rules предоставляются там, где они применимы.

---

# 7. Условия входа

Страница является публичной и не требует:

- account;
- Deal membership;
- payment;
- email capture;
- questionnaire;
- 42Q;
- private document upload.

Она должна быть доступна до trust escalation.

Пользователь может прийти:

- из глобальной public navigation;
- с Home;
- из Methodology;
- с public analysis result;
- из account/save flow;
- перед private evidence upload;
- перед respondent/person-data participation;
- из procurement/security review context;
- из footer legal/trust links.

---

# 8. Route decision

Настоящий contract **не создаёт route автоматически**.

До implementation route decision запрещено считать установленным:

```text
/security
/privacy
/security-and-privacy
/trust
/data-security
```

или любой другой URL.

Допустимое навигационное имя поверхности:

```text
Security & Privacy
```

Допустимая более полная H1-функция:

```text
How MergeVue Handles Deal Information
```

Route должен быть выбран implementation/navigation act без создания новой design authority.

---

# 9. Positioning страницы

Страница не должна выглядеть как:

- юридический wall of text;
- маркетинговая страница с замками и щитами;
- SOC 2 sales page без SOC 2;
- AI privacy manifesto;
- generic startup security boilerplate;
- список неподтверждённых certifications;
- обещание «we never see your data»;
- обещание «fully anonymous»;
- обещание «100% confidential»;
- «trust us» copy без operational meaning.

Визуально это:

> **professional transaction-infrastructure trust page**

с тем же институциональным языком, что остальной MergeVue.

---

# 10. Информационная архитектура страницы

Canonical block order:

```text
1. Hero — what this page explains
2. Start with public information
3. Four data boundaries
4. Private evidence: purpose and access
5. Who can see what
6. How data may be used
7. Sharing and external recipients
8. Providers and external processing
9. Retention, deletion and withdrawal
10. Security operations and support access
11. Individual / 42Q data
12. Legal/privacy notices and jurisdiction
13. What MergeVue does not claim
14. Procurement / security review path
15. Related policies / notices / product surfaces
16. Final trust CTA
```

Порядок может адаптироваться визуально, но смысловая лестница должна сохраняться:

> data classes → access → use → lifecycle → security → legal boundary.

---

# 11. Block 1 — Hero

## 11.1. Назначение

Сразу объяснить, что страница даёт product-level transparency, а не generic reassurance.

## 11.2. Рекомендуемый H1

```text
How MergeVue Handles Deal Information
```

## 11.3. Рекомендуемый supporting copy

```text
MergeVue is designed to create value from public information before asking for sensitive deal data. When deeper analysis requires internal observations, private documents, or individual-level information, those data types enter separate controlled workflows with different access and use boundaries.
```

## 11.4. Required qualifier

```text
The exact legal terms, privacy notices, retention rules, and security controls that apply depend on the relevant service, data type, deployment context, and approved policy.
```

## 11.5. Не писать

```text
Your data is always completely secure.
```

```text
Everything you share is 100% confidential.
```

```text
We never access your data.
```

```text
Enterprise-grade security by default.
```

---

# 12. Block 2 — Start with public information

Это центральная trust-message MergeVue.

Пользователь должен понять:

> продукт не требует чувствительные материалы до первого value event.

Рекомендуемый heading:

```text
Start with public information
```

Рекомендуемая copy:

```text
A public MergeVue analysis starts with the companies involved in the deal and public-source research. You do not need to upload private deal documents to see the first public analysis.
```

Дополнительная copy:

```text
If public evidence leaves an important decision gap unresolved, MergeVue can explain what additional evidence would be useful before asking for it.
```

Запрещено:

- создавать впечатление, что public analysis использует private data;
- автоматически приглашать upload;
- требовать account до public value;
- скрывать последующий trust escalation.

---

# 13. Block 3 — Four data boundaries

Публичная страница должна объяснять четыре разных класса на понятном уровне.

## 13.1. Public information

Client label:

```text
Public-source information
```

Meaning:

- public records;
- filings;
- company publications;
- public reporting;
- other lawfully usable public sources.

Client copy:

```text
Public availability does not remove source, citation, copyright, or other use constraints. MergeVue keeps source and provenance boundaries relevant to the analysis.
```

Нельзя писать:

```text
Public information is unrestricted.
```

---

## 13.2. Structured internal observations

Client label:

```text
Internal observations
```

Meaning:

- responses from authorized organizational participants;
- structured observations;
- governed questionnaires;
- respondent-context evidence.

Client copy:

```text
Internal observations are collected for a defined Deal question through governed respondent workflows. They are not treated as public information.
```

---

## 13.3. Private documentary evidence

Client label:

```text
Private deal evidence
```

Examples can include:

- organizational charts;
- reporting lines;
- governance documents;
- integration plans;
- management materials;
- authorized data-room extracts.

Client copy:

```text
Private evidence is requested only when it is relevant to a defined unresolved question. Uploading a document does not automatically make it verified evidence or authorize unrelated reuse.
```

---

## 13.4. Individual / person-level data

Client label:

```text
Individual-level data
```

Meaning:

- 42Q;
- person-specific participation;
- restricted person-level analytical inputs.

Client copy:

```text
Individual-level analysis is a separate restricted lane. It is not required for the standard organizational analysis and is subject to additional eligibility, notice, purpose, access, and legal/privacy gates.
```

---

# 14. Visual treatment of data classes

Предпочтительно использовать четыре спокойных cards/rows.

Каждая card должна содержать:

1. data class;
2. why it exists;
3. whether public/private;
4. when it enters the product;
5. key boundary.

Не использовать:

- red/green privacy ranking;
- lock-count scoring;
- fake sensitivity score;
- «military» visual language;
- skull/warning styling;
- fear-based copy.

---

# 15. Block 4 — Private evidence: purpose before collection

Heading:

```text
Private evidence is collected for a defined purpose
```

Required meaning:

```text
Decision Gap
→ evidence need
→ authorized request
→ secure/approved intake path
→ provenance
→ review
→ bounded analytical use
```

Recommended copy:

```text
MergeVue should not ask for a data room “just in case.” Private evidence is requested when it can help resolve a specific question in the Deal analysis.
```

```text
A file is not treated as analytical truth merely because it was uploaded. Source, provenance, relevance, review state, and contradictions remain part of the evidence record.
```

Запрещённая primary CTA:

```text
Upload your data room
```

если нет конкретного evidence need.

---

# 16. Upload/security boundary

Публичная страница не имеет права утверждать существование production upload capability только потому, что target design описан в `24`.

До фактической реализации запрещены statements:

```text
Securely upload documents
```

```text
Virus scanned
```

```text
Encrypted data room ingestion
```

```text
Connect SharePoint
```

```text
Connect Dropbox
```

если corresponding backend/security/integration authority отсутствует.

Если feature ещё target-only, public page должна:

- не показывать operational CTA;
- либо явно маркировать capability как недоступную;
- не раскрывать будущую architecture как текущий факт.

---

# 17. Block 5 — Who can see what

Heading:

```text
Access is bounded by the Deal and the data
```

Core message:

```text
Having access to a Deal does not automatically grant access to every data class in that Deal.
```

Рекомендуемая copy:

```text
MergeVue separates account identity, Deal membership, data-class permissions, recipient access, and individual-data restrictions. Access decisions are enforced by the authorized product layer, not by whether a button is visible in the interface.
```

Required distinctions:

```text
Account ≠ Deal access
Deal membership ≠ all-data access
Respondent ≠ collaborator
Report recipient ≠ collaborator
Billing contact ≠ analytical access
Support operator ≠ client user
Access permission ≠ reuse permission
```

---

# 18. Client role explanation

Public page не должна публиковать unnecessary internal permission matrix.

Допустимо объяснить принцип:

```text
Authorized Deal users may have different levels of access depending on their role, the data class, and the action involved.
```

Не нужно раскрывать:

- internal enum names;
- permission codes;
- backend schema;
- capability tokens;
- security role identifiers.

---

# 19. Support and internal operational access

Heading:

```text
Support access is not universal Deal access
```

Client-safe meaning:

```text
Operational support and security functions are separate from client Deal roles. Internal access, where necessary and authorized, should be purpose-bound, minimized, and auditable rather than treated as standing access to client Deals.
```

Не писать:

```text
No employee can ever access your data.
```

если это не factual architecture.

Не писать:

```text
Our support team can access anything to help you.
```

---

# 20. Block 6 — How data may be used

Heading:

```text
Access does not create new data-use rights
```

Core rule:

> Deal-specific private/internal evidence is Deal-specific by default until a separate lawful secondary-use authority exists.

Recommended copy:

```text
Using information to provide the requested Deal analysis is different from using it for benchmarking, research, product improvement, model training, publication, or disclosure to another party. Those purposes do not inherit automatically from primary Deal access.
```

Required purpose distinctions:

- primary Deal service;
- audit/history required for that service;
- benchmark;
- R&D;
- publication/case study;
- model training;
- external disclosure.

Не показывать весь internal enum.

---

# 21. Model-training language

Это high-risk public claim.

Разрешённое правило:

```text
No claim about model training may be made unless the applicable contract, provider configuration, data-rights authority, and actual product behavior support that statement for the relevant data class.
```

Public copy может использовать точную factual statement только после подтверждения.

Например, **только если фактически true для конкретного scope**:

```text
Private client data is not used for model training under the applicable service configuration.
```

Без подтверждения эта строка запрещена.

Запрещено автоматически писать:

```text
We never train on your data.
```

```text
Your data is never used to improve AI.
```

---

# 22. Product improvement / R&D

Не использовать blanket term:

```text
improve our services
```

как магическое разрешение на вторичную обработку.

Если страница объясняет secondary use, формулировка:

```text
Research, benchmarking, publication, or product-improvement uses require their own applicable authority and do not arise simply because information was used in a Deal analysis.
```

---

# 23. Block 7 — Sharing and external recipients

Heading:

```text
Sharing is separate from Deal access
```

Required explanation:

```text
Download
≠
Email delivery
≠
Secure recipient access
≠
Deal membership
```

Recommended copy:

```text
A released report may still require a separate authorization before it can be shared with a particular external recipient. Sending someone a report does not automatically make that person a Deal collaborator or give them access to future Deal information.
```

---

# 24. External recipient boundary

Public page should state conceptually:

```text
External sharing should be recipient- and purpose-specific.
```

Do not promise:

```text
Anyone with the link
```

as default sharing model.

Do not imply:

```text
revocation recalls downloaded files
```

Correct meaning:

```text
Revocation can stop future controlled access where the product supports revocation; it cannot be presented as recalling copies that a recipient has already lawfully downloaded.
```

---

# 25. Raw 42Q and internal type data in sharing

Absolute public principle:

- raw 42Q does not become ordinary report/export content;
- internal type/function state does not become a client-facing attachment;
- named-leader forecast sharing remains recipient/purpose restricted.

Possible client-facing copy:

```text
Restricted individual-level source data is not treated as ordinary Deal report content.
```

Do not expose typological internal terminology.

---

# 26. Block 8 — Providers and external processing

Heading:

```text
External providers are subject to approved processing boundaries
```

Required meaning:

MergeVue may use different categories of infrastructure/services, potentially including:

- cloud hosting;
- authentication;
- email;
- file processing;
- model providers;
- monitoring/security.

But public page must not invent a specific list.

Recommended copy:

```text
Where MergeVue uses an external provider to process restricted data, that use must fit the approved purpose, data class, contractual/privacy posture, and applicable transfer or jurisdiction requirements.
```

---

# 27. Provider minimization

Recommended principle:

```text
Only the information needed for the authorized service should be sent to the relevant provider.
```

Example product logic:

```text
email service needs recipient email
≠
email service receives full Deal evidence
```

Do not reveal technical payload schemas publicly.

---

# 28. LLM/model provider boundary

Client-safe copy:

```text
Private or individual-level information must not be routed to an unapproved model provider merely because a preferred provider is unavailable.
```

This is acceptable as target-policy explanation only when phrased as a product boundary, not as proof that every production path already enforces it.

Forbidden:

```text
All AI providers are zero-retention.
```

```text
All model providers are enterprise-isolated.
```

```text
No provider can store any request.
```

unless factual and contractually verified.

---

# 29. Subprocessor/provider inventory

Если production поддерживает public/current subprocessor inventory, страница может ссылаться на него.

`41` не должен самостоятельно создавать список providers.

Rule:

```text
NO FICTIONAL SUBPROCESSOR LIST
```

Provider names, regions, DPA status, retention/training posture and service role must come from current factual inventory.

---

# 30. Data residency and cross-border claims

Не писать:

```text
Your data stays in the United States.
```

```text
All data is stored in the U.S.
```

```text
No data crosses borders.
```

без factual provider/storage/transfer evidence.

Safe structural copy:

```text
Where location or cross-border processing is legally material, the applicable provider and legal/privacy policy must support that processing before restricted data is sent.
```

---

# 31. Block 9 — Retention, deletion and withdrawal

Heading:

```text
Retention and deletion depend on the data and purpose
```

Core distinction:

```text
Archive
≠
Remove access
≠
Delete Deal
≠
Delete account
≠
Delete raw evidence
≠
Withdraw secondary use
≠
Revoke publication
≠
Legal hold
≠
Backup purge
```

Public page must not compress all into:

```text
Delete all my data
```

unless production policy and backend truly support such semantics.

---

# 32. No invented retention periods

Absolute:

`41` must not invent:

- 30 days;
- 90 days;
- one year;
- seven years;
- any other duration.

Public copy:

```text
Retention rules can differ by data class, purpose, contractual requirement, audit need, and applicable legal policy.
```

If exact periods become approved:

- pull from applicable policy;
- show only current values;
- make scope clear;
- avoid universalizing one period.

---

# 33. Deletion language

Do not write:

```text
Delete your data at any time.
```

without exact applicable behavior.

Better:

```text
Available deletion, withdrawal, or access-revocation actions depend on the data involved and the applicable lifecycle and legal policy.
```

Where real request workflow exists, link to it.

Where only manual request exists, label it honestly.

---

# 34. Account deletion ≠ Deal deletion

Client-safe explanation:

```text
Closing an account is not necessarily the same operation as deleting a Deal or every record associated with that Deal.
```

This should be visible only where it helps understanding, not as alarming legal copy.

---

# 35. Withdrawal / secondary use

Recommended copy:

```text
Withdrawing a secondary-use permission does not automatically rewrite or erase historical records that were lawfully created for the primary Deal service or required audit history.
```

Final exact legal wording belongs to approved policy/counsel.

---

# 36. Legal hold

Public page should not teach legal-hold mechanics.

Allowed boundary:

```text
Certain records may be subject to separate legal or contractual preservation requirements where applicable.
```

Only if approved legal copy supports it.

Never imply:

```text
legal hold gives MergeVue broader access
```

It does not.

---

# 37. Block 10 — Security operations

Heading:

```text
Security claims must match implemented controls
```

Public page should explain the principle without publishing sensitive architecture.

Allowed:

```text
MergeVue separates client authorization from internal operational access and is designed around least-privilege, purpose-bound access to restricted information.
```

Only claim implemented specifics if factual.

---

# 38. Forbidden security marketing

Without exact authority do not use:

```text
bank-grade encryption
military-grade encryption
SOC 2 certified
SOC 2 compliant
ISO 27001 certified
NIST certified
HIPAA compliant
zero trust certified
tamper-proof
breach-proof
unhackable
24/7 SOC
24/7 security monitoring
continuous threat monitoring
```

Do not use certification logos without current certification and display authority.

---

# 39. Encryption language

`41` should not expose:

- encryption algorithms;
- key-management details;
- cipher modes;
- secrets architecture;
- internal vault names;
- infrastructure topology.

If production authority later permits public high-level wording:

```text
Data is protected using the security controls documented for the relevant service.
```

is preferable to unauthoritative technical specifics.

Exact public statement should be reviewed against current security implementation.

---

# 40. Security details vs trust

Trust page should disclose:

- meaningful boundaries;
- current certifications if true;
- current security contact/process if authorized;
- data-use and access logic.

It should not disclose information that materially assists attack planning.

`TRANSPARENCY ≠ SECURITY CONFIG DUMP`.

---

# 41. Incident language

Public page may explain principle:

```text
Security signals, confirmed security incidents, and legally reportable data breaches are different states and are not treated as interchangeable.
```

Do not write:

```text
We notify customers of every security event.
```

Do not promise notification timing without governing policy.

---

# 42. Incident communication

Client communication after an event is governed by:

- facts;
- incident classification;
- legal/security authority;
- affected data/systems;
- applicable notification obligations.

Public page can say:

```text
When a security or privacy event requires client communication, the message should reflect the confirmed facts and the applicable legal/security process rather than speculate beyond the evidence.
```

---

# 43. Block 11 — Authentication and account security

Heading:

```text
Public access and protected Deal access are different
```

Required meaning:

```text
public analysis
→ no account required

persistence / private Deal / collaboration / sensitive action
→ identity / authentication / authorization as applicable
```

Client copy:

```text
MergeVue keeps the public product low-friction. Identity and authorization become relevant when a user wants to save a Deal, access protected information, collaborate, or perform another restricted action.
```

---

# 44. Authentication ≠ authorization

Client-safe statement:

```text
Signing in establishes account identity. Access to a particular Deal or restricted data still depends on authorization for that Deal and action.
```

Do not expose internal auth implementation.

---

# 45. No fake authentication features

Public page must not claim:

- MFA;
- passkeys;
- enterprise SSO;
- SCIM;
- OAuth providers;
- passwordless login;
- session duration;
- device management;

until implemented and accepted.

---

# 46. Block 12 — Individual / 42Q data

Heading:

```text
Individual-level analysis has a separate boundary
```

Required copy:

```text
MergeVue's standard organizational analysis does not require a person-level profile. A forecast about a specific named leader uses a separate restricted process and is available only when its eligibility, purpose, data, notice, access, and legal/privacy requirements are satisfied.
```

Do not frame 42Q as:

- employee assessment;
- personality test product;
- universal executive screening;
- HR scoring;
- leadership ranking.

---

# 47. Individual-data confidentiality language

Do not write:

```text
42Q responses are 100% confidential.
```

unless exact access architecture and legal terms support it.

Better factual approach:

```text
The applicable participant notice must state who can access raw responses, what derived information may be produced, and which recipients may receive client-safe output.
```

The general `41` page should link to applicable participant notice when lane is active.

---

# 48. Individual data and client visibility

Public page should make clear at a high level:

- raw 42Q is restricted;
- internal type/function state is not ordinary client output;
- client receives only authorized bounded output;
- participation does not automatically create secondary-use rights.

Do not reveal internal type labels.

---

# 49. Block 13 — Legal/privacy notices and jurisdiction

Heading:

```text
Legal and privacy requirements depend on context
```

Core copy:

```text
The legal basis, notice, consent, contractual requirements, retention rules, recipient permissions, and cross-border conditions that apply can depend on the type of information, the relationship involved, the purpose, and the relevant jurisdiction.
```

---

# 50. Product does not invent legal basis

Public page must never imply:

```text
By using MergeVue, all processing is automatically covered by consent.
```

or:

```text
Our contract allows all processing.
```

or:

```text
If the client provides the data, MergeVue may use it.
```

Client instruction, payment, account membership and upload capability are not universal legal authority.

---

# 51. Consent boundary

Do not describe consent as:

- universally required;
- universally sufficient;
- permanent;
- blanket authority for all uses.

Safe page-level explanation:

```text
Where consent is the applicable authority, it must relate to the relevant purpose and process. Other contexts may rely on different approved legal or contractual authority.
```

Final wording requires legal review.

---

# 52. Notices

General page should distinguish:

```text
Security & Privacy page
≠
Privacy Policy
≠
Participant Notice
≠
42Q Notice
≠
Contract / DPA
```

Recommended:

```text
This page explains the product's data-handling boundaries. The specific legal notice or contractual terms applicable to a particular processing activity are provided separately where required.
```

---

# 53. Privacy rights

Do not promise universal rights vocabulary to every person in every context.

Avoid generic claim:

```text
You always have the right to delete, access, correct, and export all data.
```

unless this exactly reflects applicable policy.

Better:

```text
Applicable privacy requests and rights are handled according to the relevant legal/privacy policy and relationship context.
```

If a real request path exists, surface it.

---

# 54. Block 14 — What MergeVue does not claim

Это обязательный trust block.

Heading:

```text
What this page does not claim
```

Recommended list:

```text
This page does not claim that:
• every MergeVue feature is available in every deployment;
• every data type can be processed in every jurisdiction;
• every user can access every Deal or evidence class;
• private information can be reused for unrelated purposes;
• all external providers have the same data-processing terms;
• one retention period applies to all data;
• revoking access recalls files already downloaded by an authorized recipient;
• every security event is a data breach;
• MergeVue holds a certification unless that certification is current and explicitly stated;
• a public trust page replaces the applicable privacy notice, contract, DPA, or legal review.
```

---

# 55. Block 15 — Procurement / security review

Enterprise prospects may need deeper diligence.

Heading:

```text
Need a security or privacy review?
```

Allowed CTA only if real contact/process exists:

```text
Request security information
```

или:

```text
Contact us for a security or privacy review
```

Не обещать:

- security package;
- DPA turnaround;
- SOC report;
- pentest;
- questionnaire SLA;

если actual process не существует.

---

# 56. Procurement artifact boundary

Public page may eventually link to factual artifacts such as:

- current subprocessor list;
- current privacy policy;
- security overview;
- DPA;
- certification report;
- contact channel.

Только если artifacts:

- существуют;
- current;
- approved;
- appropriate for public/prospect disclosure.

`41` не создаёт их.

---

# 57. Block 16 — Related surfaces

Footer/related links can include only actual routes.

Potential relationships:

- Methodology;
- Analyze a deal;
- Privacy Policy;
- Terms;
- Contact;
- participant notice;
- security review contact.

Не добавлять dead/fake links.

---

# 58. Final CTA

Preferred primary CTA:

```text
Analyze a deal
```

Потому что trust page должна возвращать к core product value.

Secondary CTA, только если operationally real:

```text
Request security information
```

Не делать primary CTA:

```text
Upload documents
```

---

# 59. Exact claim taxonomy

Каждая client-facing statement в `41` должна быть классифицирована перед выпуском.

## 59.1. Product fact

Пример:

```text
Public analysis does not require an account.
```

Требует current implementation authority.

## 59.2. Target-policy statement

Пример:

```text
Restricted data should not be routed to an unapproved provider.
```

Допустимо только если явно presentation as governing target/product rule и не создаёт ложного current-state claim.

## 59.3. Legal/privacy statement

Пример:

```text
Consent is required.
```

Нельзя публиковать без applicable legal authority/context.

## 59.4. Security implementation claim

Пример:

```text
Files are malware scanned.
```

Требует factual implementation evidence.

## 59.5. Certification claim

Пример:

```text
SOC 2 Type II.
```

Требует current certification authority.

## 59.6. Contractual/provider claim

Пример:

```text
Provider does not train on client data.
```

Требует applicable provider contract/configuration evidence.

---

# 60. Claim verification table

До release page owner должен иметь internal claim ledger.

Minimum columns:

| Field | Meaning |
|---|---|
| Claim ID | stable page claim |
| Client copy | exact proposed text |
| Claim class | product / legal / security / provider / policy |
| Data scope | public / internal / private / person-level |
| Authority source | exact controlling source |
| Current implementation required | yes/no |
| Legal review required | yes/no |
| Security review required | yes/no |
| Provider evidence required | yes/no |
| Status | approved / conditional / omit |
| Last verified | date/version |
| Re-review trigger | implementation/policy/provider change |

Этот ledger может быть implementation artifact, но `41` требует его наличие до publication.

---

# 61. Dynamic vs static claims

## Static-ish structural claims

Могут меняться редко:

- public vs private boundary;
- access ≠ reuse rights;
- account ≠ Deal authorization;
- Deal-specific by default;
- 42Q separate lane.

## Dynamic factual claims

Требуют re-verification:

- provider list;
- region;
- certification;
- encryption implementation;
- auth methods;
- support channels;
- retention period;
- deletion workflow;
- security contact;
- DPA availability;
- training posture;
- subprocessor terms.

Public page architecture должна позволять обновлять dynamic claims без redesign.

---

# 62. No false completeness

Если какой-то policy parameter не определён:

не скрывать это ложной универсальной фразой.

Например вместо:

```text
Your data is retained only as long as necessary.
```

если эта фраза не approved legal copy,

лучше:

```text
Retention rules are defined by the applicable data class, purpose, contract, and approved policy.
```

или вообще omit section detail до появления authority.

---

# 63. Confidentiality terminology

Слово:

```text
confidential
```

нельзя использовать как магический абсолют.

Различать:

- contractually confidential;
- access-restricted;
- private;
- client-provided;
- non-public;
- person-level restricted.

Не создавать security labels:

```text
Confidential
Highly Confidential
Secret
```

как system classification без corresponding model.

---

# 64. Anonymity terminology

Do not say:

```text
anonymous
```

если product может хранить:

- email;
- respondent identity;
- participant link;
- account ID;
- Deal association;
- audit metadata.

Использовать более точное:

```text
not shown to the client
```

```text
restricted from ordinary Deal collaborators
```

```text
de-identified in this output
```

только если это реально соответствует data flow.

---

# 65. Privacy by progressive disclosure

Trust messaging должно появляться в нужный момент.

## Public analysis

Minimum reassurance:

```text
No private documents required.
```

## Save Deal

Explain:

- account;
- persistence;
- Deal access.

## Add internal evidence

Explain:

- respondent purpose;
- provenance;
- visibility.

## Upload private evidence

Explain:

- why requested;
- access;
- processing;
- applicable policy link.

## 42Q

Separate notice and restricted boundary.

Не заставлять пользователя читать enterprise privacy/security wall до получения public value.

---

# 66. Microcopy rules

Security/privacy microcopy must be:

- factual;
- bounded;
- calm;
- non-alarmist;
- non-celebratory;
- specific about the action;
- explicit about unknown or unavailable state.

Avoid:

```text
Don't worry
Rest assured
Totally secure
Completely private
Safe with us
Military-grade
Bank-level
World-class security
Best-in-class privacy
```

---

# 67. Unknown state

Если page cannot establish a factual claim:

internal state:

```text
CLAIM_NOT_VERIFIED
```

не client copy.

Client behavior:

- omit the claim;
- use a narrower structural statement;
- link to applicable authoritative policy;
- route enterprise reviewer to human review if appropriate.

Unknown is not approval.

---

# 68. Contradiction state

Если:

- website says one thing;
- provider terms say another;
- contract says another;
- implementation differs;

page release must fail for the affected claim.

No precedence by prettier copy.

Conceptual:

```text
CONTRADICTED_SECURITY_OR_PRIVACY_CLAIM
→ BLOCK PUBLICATION OF THAT CLAIM
→ RESOLVE AUTHORITY
→ REVERIFY
```

---

# 69. Stale claim state

Dynamic claims require freshness.

Examples:

- certification expired;
- provider changed;
- DPA changed;
- region changed;
- auth system changed.

Target:

```text
claim validity can expire independently of page design
```

Do not leave stale badge because page was once approved.

---

# 70. Page state model

Minimum page states:

## 70.1. Normal

All displayed material claims currently authorized.

## 70.2. Partial factual availability

Optional dynamic claim omitted because not verified.

Page remains useful through structural boundaries.

## 70.3. Policy link unavailable

Do not fabricate policy content.

Show only approved bounded fallback if applicable.

## 70.4. Enterprise-review unavailable

Do not show fake CTA.

## 70.5. Error

Normal technical page error.

No sensitive diagnostics.

---

# 71. No personalized privacy determination on public page

Do not implement:

```text
Enter your country → we decide your legal rights
```

without legal-policy engine authority.

Public page can explain that jurisdiction matters.

Specific eligibility belongs to approved policy/runtime, not marketing JavaScript inference.

---

# 72. No privacy chatbot authority

If a general assistant appears on the site, it must not answer binding questions such as:

- `Are you my processor?`
- `Is consent required?`
- `Can we upload EU employee data?`
- `Is this transfer lawful?`
- `Can you delete this under GDPR?`

as authoritative legal determinations.

Route to human/legal/privacy process.

---

# 73. No security chatbot authority

Assistant must not disclose:

- infrastructure secrets;
- internal network topology;
- operational credentials;
- vulnerability details;
- internal incident data;
- privileged support process details.

It also must not invent security controls.

---

# 74. Human access explanation

Public page may explain:

```text
Human access, where applicable, is governed by the relevant role, purpose, data class, and approved access process.
```

Do not state:

```text
No human ever sees your data.
```

unless architecture makes this true for exact scope.

Do not state:

```text
Analysts review everything.
```

unless true.

---

# 75. Logging explanation

Allowed high-level wording:

```text
Relevant protected actions and operational events may be recorded for security, access-control, service, or audit purposes according to the applicable system and policy.
```

Exact log content and retention should not be invented.

Do not expose internal log schema.

---

# 76. Audit ≠ surveillance

Do not frame audit logging as employee/user surveillance.

Explain purpose:

- access accountability;
- security;
- product state integrity;
- authorized service history.

Avoid broad behavioral tracking claims.

---

# 77. Cookies / analytics

`41` does not create cookie policy.

If website analytics exist:

- separate applicable disclosure/policy;
- no blanket tracking statements unless factual;
- no claim that product analytics equals Deal evidence.

Marketing analytics must not silently become M&A evidence.

---

# 78. Marketing separation

Security/privacy page viewing, report delivery, account creation or transactional email must not imply marketing subscription.

If page contains email/contact capture:

- transactional purpose explicit;
- marketing consent separate where applicable.

---

# 79. Accessibility

Target:

> **WCAG 2.2 AA**

Requirements:

- keyboard navigable;
- visible focus;
- correct semantic headings;
- no color-only meaning;
- sufficient contrast;
- text alternatives for meaningful icons;
- disclosure controls accessible;
- tables linearize on narrow screens;
- links describe destination;
- legal/trust links remain reachable by keyboard;
- no hover-only security explanation;
- no inaccessible tooltip as sole carrier of important limitation.

---

# 80. Screen-reader structure

Preferred landmarks:

```text
header
main
section
section
section
...
footer
```

Heading order:

```text
H1
→ H2 blocks
→ H3 subsections
```

No visual-only hierarchy.

Data-class cards need semantic labels.

---

# 81. Responsive behavior

Desktop:

- readable institutional page;
- moderate width;
- cards/tables where useful;
- no dense security dashboard.

Mobile:

- single-column;
- block order preserved;
- long comparison tables convert to stacked rows;
- no horizontal legal/security table;
- CTA remains readable;
- footnotes/qualifiers remain visible;
- no collapsed section that hides a material limitation by default.

---

# 82. Content density

Page should be detailed enough for trust but not replicate contracts `24/29/34–40`.

Public user needs:

- boundaries;
- meanings;
- decision points;
- links.

Not:

- 300 internal rules;
- internal enums;
- API schemas;
- internal security operations.

---

# 83. Progressive detail

Use:

```text
short principle
→ concise explanation
→ optional "Learn more"
→ authoritative policy/contact where applicable
```

Do not dump every legal/security nuance at top level.

---

# 84. Visual components

Allowed:

- neutral data-class cards;
- boundary diagrams;
- access/use distinction;
- lifecycle distinction;
- small factual status rows;
- FAQ/disclosure blocks;
- trust/contact CTA.

Avoid:

- security score gauge;
- shield score;
- compliance meter;
- risk heatmap for privacy;
- certification carousel unless factual;
- decorative hacker imagery;
- padlock wallpaper.

---

# 85. Recommended boundary diagram

```text
PUBLIC INFORMATION
        ↓
PUBLIC ANALYSIS
        ↓
OPTIONAL SAVE / INTERNAL EVIDENCE
        ↓
PRIVATE DEAL EVIDENCE
        ↓
RESTRICTED INDIVIDUAL LANE, IF ELIGIBLE
```

Adjacent rule:

```text
MORE SENSITIVE DATA
≠
MORE UNIVERSAL ACCESS
```

Instead:

```text
MORE SENSITIVE DATA
→
STRONGER PURPOSE / ACCESS / POLICY GATES
```

---

# 86. Recommended access/use diagram

```text
CAN ACCESS FOR DEAL PURPOSE
        ≠
CAN REUSE FOR RESEARCH
        ≠
CAN PUBLISH
        ≠
CAN TRAIN A MODEL
        ≠
CAN SHARE EXTERNALLY
```

Это один из наиболее важных explanatory visuals страницы.

---

# 87. Recommended lifecycle diagram

```text
ACTIVE USE
→ ARCHIVE?
→ ACCESS REVOKED?
→ RAW DATA DELETED?
→ DERIVED RECORD RETAINED?
→ SECONDARY USE WITHDRAWN?
→ LEGAL HOLD?
→ BACKUP POLICY?
```

Не показывать arrows как гарантированный universal lifecycle.

Use caption:

```text
Different data classes can follow different approved lifecycle rules.
```

---

# 88. FAQ — обязательный набор вопросов

FAQ может быть частью страницы.

## Q1

```text
Do I need to upload private documents to use MergeVue?
```

Answer:

```text
No. The first public analysis is designed to start with company identity and public-source information. Private evidence is a separate later step when it is relevant to an unresolved Deal question.
```

## Q2

```text
Who can see private Deal information?
```

Answer:

```text
Access depends on the Deal, the user's authorization, the data class, and the action involved. Deal membership does not automatically grant access to every category of information.
```

## Q3

```text
Does sharing a report give someone access to my Deal?
```

Answer:

```text
No. A report recipient and a Deal collaborator are different access relationships. External sharing should be limited to the authorized artifact, recipient, and purpose.
```

## Q4

```text
Can MergeVue reuse our private evidence for another purpose?
```

Answer:

```text
Primary Deal use does not automatically create rights for research, benchmarking, publication, model training, or another external disclosure. Any additional use must have its own applicable authority.
```

## Q5

```text
Does MergeVue use private client data to train AI models?
```

Answer rule:

**DO NOT PUBLISH A UNIVERSAL ANSWER UNTIL EXACT CURRENT POLICY/PROVIDER/CONTRACT AUTHORITY IS VERIFIED.**

If verified no-training scope exists, use exact approved wording for that scope.

Otherwise preferred factual answer:

```text
Model-training use is a separate purpose and is not authorized merely because information was used for a Deal analysis. The applicable service terms and privacy/data-use policy govern the exact treatment of the relevant data.
```

## Q6

```text
How long is information retained?
```

Answer:

```text
Retention can differ by data class, purpose, contractual requirement, audit need, and applicable policy. MergeVue should not present one universal retention period unless an approved policy actually establishes one for the relevant scope.
```

## Q7

```text
Can I delete my information?
```

Answer:

```text
Deletion, account closure, Deal deletion, access revocation, and withdrawal from a secondary use are different operations. Available actions depend on the relevant data and applicable lifecycle and legal policy.
```

## Q8

```text
Is MergeVue SOC 2 or ISO 27001 certified?
```

Answer rule:

- state factual current certification only if verified;
- otherwise do not create certification;
- enterprise reviewer may be routed to current security-review contact if one exists.

## Q9

```text
What happens if there is a security incident?
```

Answer:

```text
A security signal, a confirmed incident, and a legally reportable breach are different states. Any required client communication should follow the confirmed facts and the applicable security and legal process.
```

## Q10

```text
Is individual 42Q data part of the normal Deal analysis?
```

Answer:

```text
No. Individual-level analysis is a separate restricted lane and is not required for the standard organizational analysis.
```

---

# 89. FAQ language boundary

FAQ answers must not become shortcuts around legal/security authority.

Every answer still requires claim verification.

A FAQ is not a weaker-governance zone.

---

# 90. Public page navigation

Preferred placement:

Top/public navigation or footer area where a serious buyer can find it without entering product flow.

Potential grouping:

```text
Methodology
Historical Cases
Security & Privacy
```

Do not bury solely under:

```text
Legal
```

because this is partly a product trust surface.

But actual global navigation is governed by information architecture and current product nav.

---

# 91. Relationship to Home

Home may use one bounded trust line and link to `41`.

Example:

```text
Public analysis first. Private evidence only when deeper diligence requires it.
```

Do not duplicate full security claims on Home.

---

# 92. Relationship to Public Result

Public report can link to `41` near:

- source/provenance explanation;
- `What the Full Engagement Adds`;
- save/deepen analysis;
- private evidence transition.

Purpose:

> user understands trust escalation before giving more data.

---

# 93. Relationship to Deal Workspace

Workspace can show context-specific mini-copy sourced from substantive contracts.

`41` remains general trust explanation.

Workspace must not treat public page as permission authority.

---

# 94. Relationship to private upload

Before actual private upload:

- show exact purpose;
- relevant data handling notice;
- access/processing statement;
- applicable legal/privacy link.

Do not force user to infer these from `41`.

`41` is context, not replacement for action-specific notice.

---

# 95. Relationship to 42Q

Before 42Q:

- separate participant notice;
- purpose;
- eligibility;
- respondent rights/authority as applicable;
- raw-answer/client-output boundary.

`41` can explain architecture but cannot substitute participant notice.

---

# 96. Relationship to security review

Enterprise diligence can begin from `41`, then move to:

- factual security overview;
- contractual review;
- DPA;
- provider information;
- security questionnaire;
- certification artifacts;

only where those artifacts exist.

---

# 97. Analytics

Allowed page analytics:

- page viewed;
- section expanded;
- policy link clicked;
- security-review CTA clicked;
- `Analyze a deal` clicked.

Do not collect sensitive inferred privacy concerns.

Do not treat page behavior as M&A evidence.

Do not infer:

```text
this prospect is security-sensitive
```

into analytical Deal model.

---

# 98. Analytics privacy

Website analytics themselves must follow applicable privacy/cookie policy.

`41` cannot exempt its own analytics from privacy governance.

---

# 99. SEO

Potential title:

```text
Security & Privacy | MergeVue
```

Potential description:

```text
Learn how MergeVue separates public, private, internal, and individual-level deal information, and how access, use, sharing, retention, and security boundaries are handled.
```

Do not use SEO claims:

```text
Most secure M&A AI platform
```

```text
SOC 2-grade security
```

```text
100% confidential M&A analysis
```

---

# 100. Content governance

Every material paragraph must have one of:

- stable upstream principle;
- verified implementation fact;
- approved legal/privacy text;
- verified provider/contract fact.

No paragraph may derive solely from:

- design preference;
- LLM suggestion;
- generic SaaS convention;
- competitor wording;
- old website wording;
- unsupported assumption.

---

# 101. Implementation-data dependency

Target page model can conceptually distinguish:

```text
STATIC_APPROVED_PRINCIPLE
CURRENT_PRODUCT_FACT
CURRENT_SECURITY_FACT
CURRENT_PROVIDER_FACT
CURRENT_CERTIFICATION_FACT
POLICY_LINK
CONTACT_LINK
```

Not required exact schema.

Goal:

> dynamic factual claims can update independently.

---

# 102. No hard-coded certification truth

Certification badges/data should not be permanent hard-coded marketing decorations.

If used:

- status current;
- scope current;
- evidence current;
- expiry/review handled.

When no certification exists:

> no empty fake badge placeholder.

---

# 103. No hard-coded provider truth

Likewise provider/subprocessor information should come from current authoritative inventory, not page prose copied once.

---

# 104. No hard-coded retention truth

Exact retention values, if ever displayed, must come from applicable approved policy, not designer copy.

---

# 105. No security theater

A user should not see:

- fake scan animation;
- padlock animation;
- `Secured` badge with no meaning;
- `Encrypted` badge without scope;
- green compliance score;
- fake security checklist.

Every security indicator needs semantic authority.

---

# 106. Error and privacy

Technical errors on `41` must not reveal:

- provider secrets;
- internal endpoints;
- stack traces;
- policy IDs not intended public;
- account/Deal existence;
- auth details.

Generic error with retry/contact path.

---

# 107. Searchability

Page content can be indexed publicly only if it contains no restricted implementation details.

Links to private policies/artifacts must respect access control.

Do not expose procurement-only artifacts through public crawl accidentally.

---

# 108. Print

Page should print cleanly if user/procurement team saves it.

Print must preserve:

- headings;
- qualifiers;
- date/version if displayed;
- link labels;
- non-certification caveats;
- no color-only meaning.

Do not add a printable claim that is absent on screen.

---

# 109. Page version / freshness

Because security/privacy factual statements change, public page should support internal content-version control.

Optional public footer:

```text
Last updated: <approved publication date>
```

Only if update process is maintained.

Do not show false precision if page is not actually reviewed.

---

# 110. Review triggers

`41` must be re-reviewed when any material event occurs:

- provider/subprocessor change;
- auth architecture change;
- new private-data feature;
- 42Q production launch;
- data-region change;
- new certification;
- certification expiry;
- retention policy approval/change;
- privacy policy change;
- new jurisdiction deployment;
- new sharing capability;
- new connector;
- new model provider;
- material incident-response policy change;
- new deletion workflow;
- new R&D/training policy.

---

# 111. No automatic propagation from target design

Acceptance of:

- `24`;
- `29`;
- `34–40`;

as target design does not prove runtime implementation.

Therefore `41` must distinguish:

```text
controlling target rule
```

from:

```text
currently implemented client capability
```

before publishing implementation claims.

---

# 112. Current-state audit requirement before go-live

Before this page becomes public, implementer/reviewer must verify current production truth for:

1. account availability;
2. authentication method;
3. Deal access enforcement;
4. sharing capabilities;
5. upload capability;
6. supported file-processing path;
7. provider inventory;
8. model-provider posture;
9. actual no-training terms, if claimed;
10. data regions, if claimed;
11. retention policy, if claimed;
12. deletion/request workflow, if claimed;
13. security certifications, if claimed;
14. security contact;
15. privacy policy;
16. terms;
17. DPA/procurement artifacts;
18. 42Q availability;
19. participant notice;
20. incident/client notification statement.

Anything not verified:

> omit or narrow.

---

# 113. Visual freedom

Designer may choose:

- card vs row;
- illustration vs diagram;
- section spacing;
- icon family;
- FAQ accordion;
- desktop column arrangement;
- CTA placement;
- subtle status typography.

Designer may not change:

- data boundaries;
- access semantics;
- rights semantics;
- legal authority;
- security claims;
- retention meaning;
- 42Q restrictions;
- no-fake-capability rule;
- page block function.

---

# 114. Three freedom classes

## 114.1. FIXED

- page purpose;
- public-first principle;
- access ≠ reuse;
- private evidence deal-bound default;
- no invented retention;
- no fake certifications;
- no fake confidentiality;
- person-level separate;
- provider eligibility boundary;
- no route/capability invention;
- public page ≠ legal policy.

## 114.2. ADAPTABLE

- exact educational wording;
- section titles;
- examples;
- FAQ ordering;
- diagram style;
- navigation label if IA approves.

## 114.3. DESIGNER-OWNED

- typography;
- layout;
- spacing;
- icon selection;
- non-semantic decorative treatment;
- disclosure animation;
- desktop/mobile composition within accessibility constraints.

---

# 115. Acceptance tests — semantic

`41` fails if any of the following is true:

1. page implies private documents are required for first value;
2. public and private evidence are presented as same data class;
3. account membership is described as all-data access;
4. sharing is described as Deal membership;
5. access is described as reuse authority;
6. client upload is described as training/R&D/publication permission;
7. universal no-training claim lacks authority;
8. universal confidentiality claim appears;
9. universal anonymity claim appears;
10. exact retention period is invented;
11. delete/account/archive operations are collapsed;
12. support is implied to have universal Deal access;
13. security event is called breach automatically;
14. certification is claimed without evidence;
15. provider/data region is invented;
16. private data fallback to arbitrary AI provider is implied;
17. 42Q raw answers are described as ordinary client report content;
18. participant notice is replaced by generic page;
19. consent is described as universal legal basis;
20. page implies legal/privacy compliance solely from Owner/product decision.

---

# 116. Acceptance tests — UX

Page passes only if:

1. user can understand data classes without legal knowledge;
2. primary message appears before dense detail;
3. first value/public-first principle is clear;
4. every sensitive claim has a qualifier where needed;
5. mobile preserves block order;
6. keyboard access works;
7. no essential content is hover-only;
8. no color-only meaning;
9. disclosure components expose semantic state;
10. CTA does not trigger unauthorized sensitive flow;
11. contact/security-review CTA only appears if real;
12. links point to current routes/documents;
13. user can distinguish product explanation from legal policy;
14. page does not look like fear-based security marketing.

---

# 117. Acceptance tests — claims

Before go-live:

1. every material claim has authority source;
2. dynamic claims have freshness review;
3. certifications have current evidence;
4. provider claims match current contract/configuration;
5. no-training claim, if present, matches exact scope;
6. retention language matches approved policy;
7. deletion language matches real backend/policy;
8. auth claims match real implementation;
9. sharing claims match real implementation;
10. security operations claims match real implementation;
11. privacy/legal statements approved where required;
12. stale/contradicted claims are omitted or blocked.

---

# 118. Acceptance tests — security

Page fails if:

- internal secrets exposed;
- internal endpoint/schema details disclosed unnecessarily;
- support privilege details create attack guidance;
- certification documents made public accidentally;
- private procurement artifact linked without access control;
- error messages leak infrastructure;
- public page embeds sensitive client data;
- public analytics leak Deal identity unexpectedly.

---

# 119. Acceptance tests — corpus non-duplication

`41` must not duplicate substantive authority from:

- `24`;
- `29`;
- `31`;
- `34`;
- `35`;
- `36`;
- `37`;
- `38`;
- `39`;
- `40`.

Passing behavior:

> summarize client-relevant boundary and link/defer to authority.

Failing behavior:

> rewrite the full upstream contract inside page spec and accidentally create competing rules.

---

# 120. Final client-facing skeleton

Canonical skeleton for implementation:

```text
NAV
  Security & Privacy

HERO
  How MergeVue Handles Deal Information
  Public-first explanation
  Applicable-policy qualifier
  Analyze a deal

SECTION
  Start with public information

SECTION
  Four data boundaries
    Public-source information
    Internal observations
    Private deal evidence
    Individual-level data

SECTION
  Private evidence is collected for a defined purpose

SECTION
  Access is bounded by the Deal and the data

SECTION
  Access does not create new data-use rights

SECTION
  Sharing is separate from Deal access

SECTION
  External providers are subject to approved processing boundaries

SECTION
  Retention and deletion depend on the data and purpose

SECTION
  Security claims must match implemented controls

SECTION
  Public access and protected Deal access are different

SECTION
  Individual-level analysis has a separate boundary

SECTION
  Legal and privacy requirements depend on context

SECTION
  What this page does not claim

FAQ
  10 governed questions

CTA
  Analyze a deal
  Optional factual security-review contact

FOOTER
  Applicable current legal/policy links
```

---

# 121. Exact recommended top-page copy candidate

The following is design copy, not final legal text.

```text
How MergeVue Handles Deal Information

MergeVue is designed to create value from public information before asking for sensitive deal data. A public analysis starts with the companies involved and public-source research.

When deeper analysis requires internal observations, private documents, or individual-level information, those data types enter separate controlled workflows with different purpose, access, sharing, and use boundaries.

The exact legal terms, privacy notices, retention rules, and security controls that apply depend on the relevant service, data type, deployment context, and approved policy.
```

CTA:

```text
Analyze a deal
```

---

# 122. Exact recommended public-first block copy

```text
Start with public information

You do not need to upload private deal documents to see the first public MergeVue analysis.

If public evidence leaves an important decision gap unresolved, MergeVue can explain what additional evidence would be useful before asking for it.
```

---

# 123. Exact recommended data-use block copy

```text
Access does not create new data-use rights

Information used to provide an authorized Deal analysis does not automatically become available for research, benchmarking, publication, model training, or disclosure to another party.

Those purposes require their own applicable authority.
```

---

# 124. Exact recommended access block copy

```text
Access is bounded by the Deal and the data

Signing in, joining a Deal, receiving a report, or providing an observation are different relationships.

Access to restricted information depends on the authorized Deal, data class, recipient, and action. Deal membership does not automatically grant access to every category of information.
```

---

# 125. Exact recommended lifecycle block copy

```text
Retention and deletion depend on the data and purpose

Different data classes can be subject to different lifecycle rules.

Account closure, Deal deletion, access revocation, raw-data deletion, secondary-use withdrawal, legal preservation, and backup handling are not the same operation. The applicable policy determines which actions are available for a particular data type and context.
```

---

# 126. Exact recommended provider block copy

```text
External providers are subject to approved processing boundaries

Where an external provider is used for restricted information, the processing must fit the approved purpose, data class, provider posture, and applicable legal or contractual requirements.

Restricted data should not be redirected to an unapproved provider simply because another service is unavailable.
```

---

# 127. Exact recommended person-level block copy

```text
Individual-level analysis has a separate boundary

MergeVue's standard organizational analysis does not require a person-level profile.

A forecast about a specific named leader uses a separate restricted process and is available only when its eligibility, purpose, data, notice, access, and legal/privacy requirements are satisfied.
```

---

# 128. Exact recommended non-claim block copy

```text
What this page does not claim

This page does not create a privacy right, legal basis, security certification, data-processing agreement, retention period, or technical control.

Where a specific notice, contract, policy, or security review applies, that authority governs the relevant processing.
```

---

# 129. Legal-copy handoff boundary

Before publication, legal/privacy reviewer should classify candidate copy into:

```text
A. Pure product fact
B. Product-policy explanation
C. Legal/privacy representation
D. Contractual representation
E. Security implementation representation
F. Provider representation
G. Certification representation
```

Classes C–G require their applicable approval/evidence.

Design acceptance does not equal legal/security approval.

---

# 130. Security-copy handoff boundary

Security reviewer validates:

- implemented control claims;
- support-access statements;
- incident language;
- certifications;
- security contact/process;
- provider/security statement;
- confidential implementation detail exposure.

Security reviewer does not rewrite analytical methodology.

---

# 131. Engineering handoff boundary

Engineering validates:

- current route/nav feasibility;
- page data source for dynamic facts;
- no fake CTAs;
- current auth capability;
- current sharing capability;
- current upload capability;
- link validity;
- contact workflow;
- claim freshness mechanism.

Engineering cannot approve legal basis by implementation convenience.

---

# 132. Owner decision boundary

Owner may approve:

- product positioning;
- scope;
- page function;
- hierarchy;
- non-legal product wording;
- design intent.

Owner acceptance alone cannot create:

- legal basis;
- certification;
- provider contract;
- data region;
- retention law;
- breach classification;
- security implementation.

---

# 133. Freeze / anti-proliferation effect

После acceptance `41` закрывает `P-14`.

Не создавать отдельные numbered design files для:

- Security Overview Page;
- Privacy Overview Page;
- Confidentiality Page;
- Data Handling Page;
- Trust Center Page;

только потому, что эти labels можно разделить.

Если implementation позже создаёт несколько routes, они по умолчанию остаются projections/children `41`, пока отдельный Owner Change Act не установит genuinely new functional responsibility.

---

# 134. Relationship to future `42`

`41` не проектирует reusable analytical evidence components.

Он может использовать общие cards/tables/diagrams, но formal reusable component contract будет определён в:

`42_MERGEVUE_ANALYTICAL_COMPONENTS_AND_EVIDENCE_VISUALIZATION_CONTRACT.md`.

Не начинать `42` внутри `41`.

---

# 135. Relationship to future `43`

`41` не определяет полный forms/system-feedback component library.

Contact form, accordions, errors, status feedback и disclosure controls должны следовать будущему:

`43_MERGEVUE_INTERACTION_FORMS_AND_SYSTEM_FEEDBACK_COMPONENT_CONTRACT.md`.

До `43` `41` задаёт только functional requirements этих элементов.

---

# 136. Relationship to final `44`

`44` должен проверить, что:

- `41` реально покрывает original `P-14`;
- every public security/privacy claim traceable;
- implementation does not exceed authority;
- page included in route/nav matrix;
- page included in content QA;
- page included in accessibility QA;
- dynamic claims have maintenance owner/process;
- no extra design file required.

---

# 137. Completion criterion

`41` считается design-complete только если одновременно выполнено:

1. `P-14` закрыт одной coherent public trust surface.
2. Public-first data principle является главным.
3. Public/internal/private/person-level classes различены.
4. Private evidence связан с defined purpose.
5. Access / membership / sharing / reuse различены.
6. Secondary-use rights не наследуются автоматически.
7. Provider boundary объяснена без fictional provider list.
8. Model-training wording fail-closed.
9. Retention/deletion wording не содержит invented periods.
10. Account / Deal / deletion operations не смешаны.
11. Security claims limited to factual authority.
12. Certification claims fail closed.
13. Incident ≠ breach сохранено.
14. Support ≠ universal Deal access сохранено.
15. Authentication ≠ authorization сохранено.
16. 42Q/person-level boundary сохранена.
17. Public page ≠ Privacy Policy сохранено.
18. Jurisdiction/legal basis not inferred.
19. Marketing consent separation сохранена.
20. Accessibility target WCAG 2.2 AA встроен.
21. Mobile and print behavior определены.
22. Claim verification process определён.
23. Dynamic-claim re-review triggers определены.
24. Никакая новая legal/security capability не изобретена.
25. Не создана новая product theme вне frozen manifest.
26. Downstream `42` может начаться без unresolved design dependency из scope `41`.

---

# 138. Final non-regression checklist

Перед acceptance проверить:

- [ ] `00` public security/privacy requirement закрыт.
- [ ] `08` claims discipline не ослаблена.
- [ ] `09` visual direction сохранён.
- [ ] `11` accessibility/responsive rules сохранены.
- [ ] `24` private evidence boundary сохранена.
- [ ] `29` access ≠ reuse rights сохранено.
- [ ] `31` person-level restrictions сохранены.
- [ ] `34` permissions не переопределены.
- [ ] `35` sharing ≠ membership сохранено.
- [ ] `36` transactional ≠ marketing сохранено.
- [ ] `37` authentication ≠ authorization сохранено.
- [ ] `38` no invented retention сохранено.
- [ ] `39` incident/breach/support boundaries сохранены.
- [ ] `40` legal basis / provider / jurisdiction gate сохранён.
- [ ] No privacy policy invented.
- [ ] No security certification invented.
- [ ] No production feature invented.
- [ ] No provider inventory invented.
- [ ] No exact legal wording represented as counsel-approved unless actually approved.
- [ ] No new numbered file implied.

---

# 139. Owner acceptance and controlling status

Owner explicitly ACCEPTED this contract on:

```text
2026-09-16
```

From that point:

```text
41_MERGEVUE_PUBLIC_SECURITY_PRIVACY_AND_CONFIDENTIALITY_PAGE_CONTRACT.md
=
OWNER-ACCEPTED
CONTROLLING PUBLIC SECURITY / PRIVACY / CONFIDENTIALITY PAGE CONTRACT
P-14 CLOSED
```

This acceptance establishes the design authority for the public Security & Privacy / confidentiality trust surface.

It does **not** create or imply:

- legal basis;
- jurisdiction-specific legal advice;
- Privacy Policy approval;
- DPA approval;
- certification;
- encryption capability;
- retention period;
- deletion SLA;
- provider/subprocessor approval;
- no-training guarantee;
- data-residency guarantee;
- security operations capability;
- incident-response capability;
- production readiness of any target-only feature.

Those remain governed by their respective upstream authorities and current implementation truth.

Under:

`MERGEVUE_REMAINING_CORPUS_MANIFEST_v1.0`

the next and only authorized numbered design act is:

```text
42_MERGEVUE_ANALYTICAL_COMPONENTS_AND_EVIDENCE_VISUALIZATION_CONTRACT.md
```

No new numbered design artifact may be inserted between `41` and `42` without a separate Owner Change Act.

Final state:

```text
STATUS = OWNER-ACCEPTED / CONTROLLING
P-14 = CLOSED
AMBIGUITY = 0
NEXT NUMBERED ACT = 42
```

---

# 140. Финальная формула

> **MergeVue earns trust by showing exactly where each data class enters the product, why it is needed, who may access it, what uses are permitted, which lifecycle rule applies, and which claims are actually supported.**

> **The public trust surface must never be stronger than the underlying legal, privacy, security, provider, access, and implementation authority.**

> **When a security/privacy fact is unknown, outdated, conditional, jurisdiction-specific or not yet implemented, MergeVue narrows or omits the statement rather than inventing reassurance.**

> **Public value comes first; sensitive data enters only through progressively stronger purpose, access, rights, security and legal gates.**
