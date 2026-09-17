# 44. Контракт передачи дизайна в разработку и финальной проверки качества MergeVue

**Файл:** `44_MERGEVUE_DEVELOPMENT_HANDOFF_AND_DESIGN_QA_CONTRACT.md`  
**Версия:** 1.0  
**Дата:** 2026-09-16  
**Язык документации:** русский  
**Язык клиентского интерфейса:** только American English  
**Рынок первой версии:** США  
**Статус:** **OWNER-ACCEPTED / CONTROLLING DEVELOPMENT HANDOFF AND DESIGN QA CONTRACT / R-06 + R-07 CLOSED / 67/67 ACCOUNTED / DESIGN CORPUS 00–44 FROZEN + CLOSED / НЕ ЯВЛЯЕТСЯ IMPLEMENTATION AUTHORIZATION И НЕ ДОКАЗЫВАЕТ PRODUCTION READINESS**  
**Тип документа:** final development handoff / implementation traceability / design QA / corpus closure authority  
**Закрывает planned objects:** `R-06 Development handoff`, `R-07 Design QA`  
**Authority:** accepted design corpus `00–43`; при конфликте более узкий upstream controlling contract сильнее `44`  
**Owner acceptance:** 2026-09-16  
**Corpus freeze:** `00–44`; `44` не разрешает файл `45+`  
**Главный принцип:** разработчик не должен реконструировать продукт по устным объяснениям, старым макетам или локальным предположениям; каждое значимое поведение должно быть трассируемо к controlling contract, а каждое target-only обещание должно оставаться недоступным до фактического readiness gate.  
**Ключевые инварианты:** `HANDOFF ≠ NEW AUTHORITY`, `DESIGN ≠ IMPLEMENTATION`, `TARGET CONTRACT ≠ CURRENT CAPABILITY`, `ROUTE ≠ PRODUCT SEMANTICS`, `UI ≠ AUTHORIZATION`, `PDF ≠ SOURCE OF TRUTH`, `SCREEN = PDF = EMAIL SEMANTICS`, `ACCESS ≠ REUSE RIGHTS`, `PAID ≠ CERTAINTY`, `UNKNOWN ≠ ERROR`, `NO PLACEHOLDERS AS SUCCESS`, `NO FAKE CAPABILITY`, `NO 45+ WITHOUT OWNER CHANGE ACT`, `67/67 ACCOUNTED BEFORE CORPUS CLOSE`, `FAIL CLOSED`.

---

# 0. Решение

`44` — последний numbered design act frozen corpus.

Его функция:

```text
accepted product/design authority 00–43
→ traceability
→ implementation sequence
→ readiness gates
→ acceptance tests
→ professional QA references
→ 67/67 reconciliation
→ development handoff
```

`44` не проектирует ещё один продукт.

Он связывает уже принятый продукт с разработкой.

---

# 1. Что `44` имеет право делать

`44` имеет право:

- связывать route/surface с controlling contract;
- связывать component с semantic authority;
- связывать action с permission/business authority;
- связывать data dependency с source-of-truth;
- определять implementation sequencing;
- определять design/semantic QA;
- определять acceptance evidence;
- фиксировать target-only readiness gates;
- фиксировать non-regression requirements;
- консолидировать professional implementation references;
- закрыть `R-06` и `R-07`;
- дать финальную 67/67 reconciliation.

---

# 2. Что `44` НЕ имеет права делать

`44` не создаёт:

- новую страницу;
- новый route;
- новую роль;
- новый permission;
- новый evidence class;
- новый report block;
- новый state;
- новый forecast state;
- новую verification label;
- новую цену;
- новую paid tier;
- checkout;
- новую legal basis;
- новую privacy right;
- новую security capability;
- новый retention period;
- новую notification event;
- новый questionnaire;
- новую 42Q interpretation;
- новую methodology;
- новый mathematical rule;
- новый economic formula;
- новую product feature.

Если implementation обнаруживает реальный authority gap:

```text
STOP
→ identify exact gap
→ locate nearest controlling contract
→ amend existing contract if lawful
→ only if impossible: Owner Change Act
```

---

# 3. Authority precedence

При конфликте:

```text
binding law / approved legal-security policy where applicable
→ explicit Owner authority
→ narrower controlling domain contract
→ master design documents
→ component contracts 42/43
→ this handoff 44
→ implementation convenience
```

Implementation convenience никогда не сильнее product authority.

---

# 4. Freeze rule

```text
MERGEVUE DESIGN CORPUS = 00–44
```

После acceptance `44`:

- `00–44` — frozen product-design corpus;
- manifest/reconciliation/audit/corrigendum не получают product number;
- `45+` запрещён без Owner Change Act.

---

# 5. Owner Change Act for 45+

Любой новый numbered artifact требует:

1. exact NEW REQUIREMENT;
2. why `00–44` does not cover it;
3. why amendment is insufficient;
4. why standalone artifact is required;
5. authority boundary;
6. prerequisites;
7. overlap analysis;
8. changed scopes;
9. new upper corpus bound;
10. manifest consequences.

---

# 6. Implementation truth classes

Каждая capability перед кодированием/релизом классифицируется:

```text
IMPLEMENTED
PARTIAL
TARGET-ONLY
ABSENT
UNKNOWN / AUDIT REQUIRED
```

Нельзя считать `TARGET-ONLY` реализованным потому, что дизайн подробный.

---

# 7. Handoff package minimum

Development handoff должен содержать:

1. exact corpus/version;
2. route/surface inventory;
3. current implementation audit;
4. target delta;
5. data dependencies;
6. component mapping;
7. state/action mapping;
8. access/security dependencies;
9. responsive/accessibility obligations;
10. print/PDF obligations;
11. implementation sequence;
12. acceptance tests;
13. known blockers;
14. target-only capabilities;
15. non-regression tests;
16. claim/readiness ledger;
17. release evidence.

---

# 8. No oral reconstruction

Developer must not depend on:

- Owner memory;
- designer verbal explanation;
- screenshots without contract;
- stale prototype;
- old price copy;
- old report renderer semantics;
- historical UI labels;
- provider-specific behavior;
- a previous agent's prose.

If behavior is material, authority must be written and traceable.

---

# 9. Corpus identity register

The product design corpus contains 45 numbered documents including `00`.


| No. | File | Handoff status |
| --- | --- | --- |
| 00 | 00_MERGEVUE_DESIGN_PROGRAM_OVERVIEW_v1.1.md | CONTROLLING / accepted upstream |
| 01 | 01_MERGEVUE_PRODUCT_NORTH_STAR.md | CONTROLLING / accepted upstream |
| 02 | 02_MERGEVUE_AUDIENCES_BUYERS_AND_ROLES.md | CONTROLLING / accepted upstream |
| 03 | 03_MERGEVUE_END_TO_END_CUSTOMER_JOURNEY.md | CONTROLLING / accepted upstream |
| 04 | 04_MERGEVUE_SERVICE_BLUEPRINT.md | CONTROLLING / accepted upstream |
| 05 | 05_MERGEVUE_INFORMATION_ARCHITECTURE.md | CONTROLLING / accepted upstream |
| 06 | 06_MERGEVUE_TRUST_AND_PROGRESSIVE_DISCLOSURE.md | CONTROLLING / accepted upstream |
| 07 | 07_MERGEVUE_PRODUCT_TIERS_AND_VALUE_MODEL.md | CONTROLLING / accepted upstream |
| 08 | 08_MERGEVUE_CONTENT_AND_CLAIMS_GOVERNANCE.md | CONTROLLING / accepted upstream |
| 09 | 09_MERGEVUE_DESIGN_DIRECTION.md | CONTROLLING / accepted upstream |
| 10 | 10_MERGEVUE_GLOBAL_STATE_MODEL.md | CONTROLLING / accepted upstream |
| 11 | 11_MERGEVUE_ACCESSIBILITY_RESPONSIVE_AND_CONTENT_RULES.md | CONTROLLING / accepted upstream |
| 12 | 12_MERGEVUE_HOME_PAGE_CONTRACT.md | CONTROLLING / accepted upstream |
| 13 | 13_MERGEVUE_HOW_IT_WORKS_PAGE_CONTRACT.md | CONTROLLING / accepted upstream |
| 14 | 14_MERGEVUE_METHODOLOGY_PAGE_CONTRACT.md | CONTROLLING / accepted upstream |
| 15 | 15_MERGEVUE_INTERACTION_ENVIRONMENTS_INDEX_CONTRACT.md | CONTROLLING / accepted upstream |
| 16 | 16_MERGEVUE_HISTORICAL_CASES_INDEX_CONTRACT.md | CONTROLLING / accepted upstream |
| 17 | 17_MERGEVUE_HISTORICAL_CASE_DETAIL_CONTRACT.md | CONTROLLING / accepted upstream |
| 18 | 18_MERGEVUE_DEAL_ENTRY_AND_PUBLIC_ANALYSIS_START_CONTRACT.md | CONTROLLING / accepted upstream |
| 19 | 19_MERGEVUE_PUBLIC_ANALYSIS_RESULT_CONTRACT.md | CONTROLLING / accepted upstream |
| 20 | 20_MERGEVUE_DECISION_GAP_AND_DEEPER_DILIGENCE_TRANSITION_CONTRACT.md | CONTROLLING / accepted upstream |
| 21 | 21_MERGEVUE_ACCOUNT_SAVE_AND_DEAL_WORKSPACE_ENTRY_CONTRACT.md | CONTROLLING / accepted upstream |
| 22 | 22_MERGEVUE_DEAL_WORKSPACE_CONTRACT.md | CONTROLLING / accepted upstream |
| 23 | 23_MERGEVUE_INTERNAL_EVIDENCE_AND_RESPONDENT_SETUP_CONTRACT.md | CONTROLLING / accepted upstream |
| 24 | 24_MERGEVUE_PRIVATE_EVIDENCE_AND_DOCUMENT_INGESTION_CONTRACT.md | CONTROLLING / accepted upstream |
| 25 | 25_MERGEVUE_ANALYST_REVIEW_CONTRADICTION_AND_RELEASE_GATE_CONTRACT.md | CONTROLLING / accepted upstream |
| 26 | 26_MERGEVUE_PAID_REPORT_RELEASE_AND_FORECAST_LOCK_CONTRACT.md | CONTROLLING / accepted upstream |
| 27 | 27_MERGEVUE_OUTCOME_VERIFICATION_AND_TRACK_RECORD_CONTRACT.md | CONTROLLING / accepted upstream |
| 28 | 28_MERGEVUE_POST_CLOSE_MONITORING_AND_REMEASUREMENT_CONTRACT.md | CONTROLLING / accepted upstream |
| 29 | 29_MERGEVUE_LONGITUDINAL_EVIDENCE_GOVERNANCE_AND_DATA_RIGHTS_CONTRACT.md | CONTROLLING / accepted upstream |
| 30 | 30_MERGEVUE_EXECUTION_EVIDENCE_PACK_CONTRACT.md | CONTROLLING / accepted upstream |
| 31 | 31_MERGEVUE_42Q_INDIVIDUAL_DATA_AND_NAMED_LEADER_FORECAST_CONTRACT.md | CONTROLLING / accepted upstream |
| 32 | 32_MERGEVUE_ECONOMIC_EXPOSURE_AND_VALUE_DEPENDENCY_CONTRACT.md | CONTROLLING / accepted upstream |
| 33 | 33_MERGEVUE_PAID_SCOPE_PRICING_AND_COMMERCIAL_TRANSITION_CONTRACT.md | CONTROLLING / accepted upstream |
| 34 | 34_MERGEVUE_COLLABORATION_ACCESS_AND_PERMISSIONS_CONTRACT.md | CONTROLLING / accepted upstream |
| 35 | 35_MERGEVUE_SHARING_EXPORT_AND_RECIPIENT_ACCESS_CONTRACT.md | CONTROLLING / accepted upstream |
| 36 | 36_MERGEVUE_NOTIFICATIONS_COMMUNICATION_AND_FOLLOW_UP_CONTRACT.md | CONTROLLING / accepted upstream |
| 37 | 37_MERGEVUE_IDENTITY_AUTHENTICATION_AND_SESSION_SECURITY_CONTRACT.md | CONTROLLING / accepted upstream |
| 38 | 38_MERGEVUE_DEAL_ACCOUNT_AND_DATA_LIFECYCLE_RETENTION_AND_DELETION_CONTRACT.md | CONTROLLING / accepted upstream |
| 39 | 39_MERGEVUE_SECURITY_OPERATIONS_INCIDENT_RESPONSE_AUDIT_AND_SUPPORT_ACCESS_CONTRACT.md | CONTROLLING / accepted upstream |
| 40 | 40_MERGEVUE_PRIVACY_LEGAL_BASIS_DATA_PROCESSING_AND_JURISDICTION_POLICY_CONTRACT.md | CONTROLLING / accepted upstream |
| 41 | 41_MERGEVUE_PUBLIC_SECURITY_PRIVACY_AND_CONFIDENTIALITY_PAGE_CONTRACT.md | CONTROLLING / accepted upstream |
| 42 | 42_MERGEVUE_ANALYTICAL_COMPONENTS_AND_EVIDENCE_VISUALIZATION_CONTRACT.md | CONTROLLING / accepted upstream |
| 43 | 43_MERGEVUE_INTERACTION_FORMS_AND_SYSTEM_FEEDBACK_COMPONENT_CONTRACT.md | CONTROLLING / accepted upstream |
| 44 | 44_MERGEVUE_DEVELOPMENT_HANDOFF_AND_DESIGN_QA_CONTRACT.md | CANDIDATE / Owner acceptance pending |

---

# 10. Controlling-file rule

The filename identifies the design artifact.

The meaning comes from its accepted content and any explicit supersession/correction.

A developer must not assume:

```text
higher number = stronger authority
```

except where later accepted file explicitly integrates/supersedes a narrower earlier design responsibility.

---

# 11. Candidate vs controlling versions

Where both candidate and final/accepted snapshots exist:

> **use the Owner-accepted controlling version.**

Examples include accepted final states of `41`, `42`, `43`.

Do not bind implementation to an earlier candidate merely because it has the shorter filename.

---

# 12. Current implementation audit required

Before source modification:

1. inspect current route tree;
2. inspect current components;
3. inspect current report renderer;
4. inspect current API/server authority;
5. inspect persistence;
6. inspect authentication;
7. inspect permissions;
8. inspect evidence model;
9. inspect report projection;
10. inspect current production-visible claims.

Result:

```text
AS-IS
vs
TARGET
vs
GAP
```

No redesign begins from assumption.

---

# 13. Existing code is evidence, not design authority

Existing code may prove:

- implemented capability;
- current route;
- current limitation;
- current state vocabulary;
- migration risk.

Existing code does not automatically override accepted product design.

---

# 14. Existing visual implementation

Preserve useful visual lineage where consistent with `09`.

Do not replace stable canonical renderer merely to modernize appearance.

Any replacement requires semantic/print non-regression.

---

# 15. Route rule

`44` does not invent URL paths.

The handoff maps **logical surfaces** to controlling contracts.

Exact URL changes require current route audit and route authority.

---

# 16. Logical surface / authority matrix

| Logical surface | Zone | Primary authority | Supporting authority | Data/access boundary | Implementation rule |
| --- | --- | --- | --- | --- | --- |
| Public home | Public | 12 | 09–11, 43 | Public only | Route/implementation audit before coding; do not invent |
| How it works | Public | 13 | 09–11, 43 | Public only | Route/implementation audit before coding |
| Methodology / theory / resources / public math / limitations | Public | 14 | 09–11, 42–43 | Public only | One authority; no proliferation into duplicate pages unless IA requires |
| Environments index + detail | Public | 15 | 09–11, 42–43 | Public only | Index/detail contract; preserve nine-Environments authority |
| Historical cases index | Public | 16 | 09–11, 42–43 | Public historical corpus | No outcome leakage before allowed reveal |
| Historical case detail | Public | 17 | 09–11, 42–43 | Public historical corpus | PRE-T0 / POST-T0 boundary preserved |
| Deal entry / entity confirmation / research start | Public analysis | 18 | 10–11, 43 | Public evidence | Existing route family audited; no new /analyze route without route authority |
| Public analysis result | Public analysis | 19 | 10–11, 42–43 | Public evidence | Canonical 12-block result; screen/PDF same semantics |
| Decision Gap / deeper diligence transition | Public→workspace/paid | 20 | 33, 43 | Public result + authorized context | Decision Gap first; no forced conversion |
| Public Security / Privacy / Confidentiality | Public trust | 41 | 08, 11, 24, 29, 34–40, 43 | Public trust claims | Dynamic claims require factual ledger |
| Save / account entry | Account transition | 21 | 37, 43 | Public report + identity | Return-to-intent; auth ≠ access |
| Deal workspace | Authenticated | 22 | 10, 34, 37, 42–43 | Deal-authorized | Server-authoritative Deal state |
| Internal evidence / respondents | Authenticated evidence | 23 | 29, 34, 36–37, 42–43 | Deal-authorized internal evidence | Respondent ≠ collaborator |
| Private evidence ingestion | Paid/private | 24 | 29, 34, 37–40, 42–43 | Restricted Deal data | No customer uploader claim before backend/security readiness |
| Analyst review / contradiction / release gate | Internal governance | 25 | 10, 42–43 | Authorized analyst only | No client bypass; client/analyst congruence |
| Paid report / forecast lock | Paid released artifact | 26 | 25, 29, 31–32, 35, 42–43 | Released authorized projection | Release/lock/seal remain distinct |
| Outcome verification / track record | Longitudinal | 27 | 26, 29, 42–43 | Authorized Deal + verification data | Fixed outcome vocabulary; no aggregate score without method |
| Post-close monitoring / remeasurement | Longitudinal | 28 | 27, 29, 36, 42–43 | Deal-specific monitoring | No continuous monitoring claim without infrastructure |
| Data rights / longitudinal governance | Cross-cutting governance | 29 | 34–41 | All relevant data classes | Rights gate before secondary use |
| Execution Evidence Pack | Controlled artifact | 30 | 29, 31, 35, 42–43 | Rights-filtered Deal artifact | Not raw evidence dump |
| 42Q / named-leader forecast | Restricted person-level | 31 | 29, 34–37, 40, 42–43 | High sensitivity | No raw 42Q/type reveal |
| Economic exposure / value dependency | Paid analytical | 32 | 42–43 | Deal/economic evidence | Exposure ≠ loss; quantified method gate |
| Paid scope / pricing | Commercial | 33 | 20, 43 | Decision Gap + scope authority | $0/$5k/$10k/$15k/$30k current target; no fake checkout |
| Collaboration / permissions | Authenticated | 34 | 37, 43 | Server-authorized | Frontend hiding ≠ authorization |
| Sharing / export | Distribution | 35 | 29, 34, 37, 42–43 | Released rights-filtered artifact | Recipient ≠ member; version/purpose binding |
| Notifications / follow-up | Communication | 36 | 29, 34–35, 43 | Authorized recipient/event | State first; notification second |
| Identity / authentication / session | Security foundation | 37 | 34–35, 43 | Identity/session | No fake SSO; exact auth mechanism implementation decision |
| Lifecycle / retention / deletion | Lifecycle governance | 38 | 29, 34, 37, 40–41, 43 | Purpose/policy dependent | No invented retention/deletion semantics |
| Security operations / incident / support access | Security operations | 39 | 34, 37, 40–41, 43 | Operational/internal | Security event ≠ incident ≠ breach |
| Privacy / legal basis / jurisdiction | Legal/privacy interface | 40 | 29, 31, 37–41 | Purpose/jurisdiction dependent | Product contract ≠ legal advice |

---

# 17. Current-route preservation

Where an existing route is explicitly preserved by an upstream contract, implementation uses it until a separate route decision changes it.

Example authority already exists for the public deal-entry family.

Do not create a cleaner-looking `/analyze` path solely for design consistency.

---

# 18. Route alias / redirect

Redirects may preserve compatibility.

They must not:

- lose Deal identity;
- lose report version;
- lose Decision Gap;
- bypass auth;
- bypass permission;
- bypass evidence cutoff;
- collapse public and protected routes.

---

# 19. Deep-link rule

Protected deep links:

```text
request
→ authentication
→ authorization
→ object/version lookup
→ render
```

Never:

```text
opaque URL exists
→ render sensitive object
```

---

# 20. Page contract implementation

For every implemented page/surface, engineering must be able to answer:

1. purpose;
2. primary user;
3. user question;
4. entry condition;
5. expected result;
6. information hierarchy;
7. required content;
8. primary action;
9. secondary actions;
10. data dependencies;
11. states;
12. trust elements;
13. prohibited claims;
14. responsive behavior;
15. accessibility;
16. analytics;
17. designer freedom;
18. acceptance criteria.

These requirements come from `00` and the relevant page contract.

---

# 21. Product milestone priority

The first proof of product value remains:

```text
user enters two companies
→ entities resolve
→ public research executes
→ generated public report appears
```

No account/private-data/payment dependency may be inserted before this path unless a real technical/legal necessity requires it.

---

# 22. Public value before trust escalation

Sequence:

```text
public understanding
→ historical evidence
→ own-deal public analysis
→ public result
→ account/save
→ internal evidence
→ private evidence
→ paid depth
→ restricted person-level data where eligible
```

Do not reverse.

---

# 23. Implementation phases

| Phase | Workstream | Gate | Required work | Authority | Exit evidence |
| --- | --- | --- | --- | --- | --- |
| 0 | Bind corpus + audit current main | Before any redesign | Pin 00–44 authority; inventory existing routes/components/renderers; classify IMPLEMENTED / PARTIAL / TARGET-ONLY / ABSENT; no source edits from design docs alone. | 44 + all upstream | Audit package; implementation delta map |
| 1 | Public value path | Highest product priority | Home → method/cases optional → enter two companies → resolve → public research → public result. This is the first end-to-end product proof. | 12–20, 42–43 | Real public analysis flow returning canonical report |
| 2 | Save and workspace continuity | After public value works | Save report/Deal; identity/auth; return-to-intent; Deal workspace with public baseline and Decision Gap. | 21–22, 34, 37, 43 | Persisted Deal without loss of public baseline |
| 3 | Structured internal evidence | After workspace persistence | Respondents/invitations/canonical instruments; provenance; separate submission vs analysis update. | 23, 29, 34, 36–37, 42–43 | Internal evidence lane operational |
| 4 | Private evidence + paid scoping | Only after security/data-rights readiness | Decision Gap → scope → commercial request → private evidence ingestion; no fake checkout. | 20, 24, 29, 32–33, 37–41, 43 | Restricted evidence path with real controls |
| 5 | Analyst review + paid release | After evidence model and gates | Contradiction/review; release gate; canonical paid report; PDF parity. | 25–26, 35, 42–43 | Released versioned paid artifact |
| 6 | Forecast lock / 42Q where eligible | After exact forecast hardening | Organization forecast and restricted named-leader lane; lock/seal only where real. | 26, 31, 42–43 | Immutable/versioned forecast objects |
| 7 | Post-close verification / monitoring | After prospective records exist | Observation, intervention context, remeasurement, verification and track-record logic. | 27–30, 36, 42–43 | Longitudinal Deal history without hindsight rewriting |
| 8 | Collaboration / sharing / lifecycle hardening | Before broad enterprise use | Permissions, external recipients, lifecycle, support/security, privacy/legal operationalization. | 29, 34–41, 43 | Enterprise-safe access/distribution/lifecycle |
| 9 | Final release QA | Before each production release | Functional, semantic, accessibility, responsive, print, security, claims, data-rights and regression tests. | 44 | Signed release evidence; unresolved blockers explicit |

---

# 24. Phase 0 — bind before build

Required output:

```text
CORPUS_BINDING
CURRENT_MAIN_AUDIT
ROUTE_INVENTORY
COMPONENT_INVENTORY
DATA_SOURCE_INVENTORY
TARGET_ONLY_REGISTER
CLAIM_REGISTER
BLOCKER_REGISTER
```

No production claim may be upgraded by design alone.

---

# 25. One smallest blocker

During implementation, orchestration should maintain one smallest blocking dependency for the active act.

Do not open multiple speculative feature branches because future contracts exist.

---

# 26. Public-path implementation gate

Before Phase 1 exit:

- two-company input real;
- entity resolution real;
- analysis start real;
- public evidence path real;
- report projection real;
- failure/limited-evidence states real;
- public result not fake prototype text.

---

# 27. Save/workspace gate

Before Phase 2 exit:

- account flow real;
- persisted Deal real;
- report binding real;
- return-to-intent real;
- refresh safe;
- server authority real;
- no localStorage-as-workspace.

---

# 28. Internal-evidence gate

Before Phase 3 exit:

- canonical instrument semantics frozen;
- invitations server-authoritative;
- respondent identity/channel separated;
- answer persistence real;
- completion real;
- provenance real;
- report-update state separate.

---

# 29. Private-evidence gate

Before Phase 4 receives real client private documents:

- purpose defined;
- access enforced;
- storage architecture approved;
- provider/process inventory factual;
- private evidence lifecycle defined enough for collection;
- logging minimizes sensitive content;
- rights/legal/security gate passed;
- UI does not overclaim scanning/encryption/training posture.

---

# 30. Paid commercial gate

Commercial UI may ship only with actual sales/engagement mechanics.

No fake self-serve payment.

Current target scope/price authority comes from `33`, not legacy code.

---

# 31. Analyst/release gate

Before paid report release:

- required review complete;
- contradictions handled/preserved;
- confidence caps respected;
- validators pass;
- release authority server-side;
- report version immutable;
- screen/PDF/email projection congruent.

---

# 32. Forecast gate

Before strong `locked` / `sealed` claims:

- canonical structured forecast exists;
- exact claim/window/observable/falsifier present;
- lock state authoritative;
- seal payload/persistence/version meets `26`;
- legacy partial seal is not relabeled.

---

# 33. 42Q gate

Before person-level collection:

- specific named-leader purpose;
- eligibility;
- notice/legal/privacy authority;
- restricted storage/access;
- practitioner/analyst flow where required;
- no raw type/personality disclosure to client.

---

# 34. Longitudinal gate

Before official prospective track record:

- forecast identity stable;
- timestamp/lock/seal criteria pass;
- outcome evidence scoped;
- verification protocol applied;
- interventions recorded when material;
- rights for aggregation/publication separately checked.

---

# 35. Collaboration gate

Before multi-user Deal access:

- authentication;
- server authorization;
- Deal membership model;
- restricted data-class permissions;
- invite abuse protections;
- revocation;
- audit;
- security/data-rights review.

---

# 36. Sharing gate

Before external sensitive sharing:

- released artifact;
- rights-filtered projection;
- requester share authority;
- recipient identity/purpose;
- immutable version;
- access mode;
- revocation/expiry behavior;
- no raw 42Q;
- no internal storage refs.

---

# 37. Lifecycle gate

Before deletion/retention claims:

- exact operation semantics;
- policy authority;
- affected data classes;
- historical/audit handling;
- backups/derived records treatment where applicable;
- client copy approved.

No invented period.

---

# 38. Security/privacy claim gate

Before publishing dynamic claim, verify:

```text
claim
→ class
→ scope
→ authority
→ implementation evidence
→ legal/security/provider review if required
→ approved / conditional / omit
```

---

# 39. Claim ledger

Minimum fields:

```text
claimId
clientCopy
claimClass
dataScope
authoritySource
implementationRequired
legalReviewRequired
securityReviewRequired
providerEvidenceRequired
status
lastVerified
reReviewTrigger
```

---

# 40. Analytical component handoff

Every analytical component from `42` must bind to:

```text
authoritativeObject
clientProjection
states
provenance
permission
mobile
print
accessibility
prohibitedInference
```

No local analytical calculation.

---

# 41. Interaction component handoff

Every interactive component from `43` must bind to:

```text
semanticSource
actionSource
allowedRoles
enabledWhen
hiddenWhen
loading
success
errors
confirmation
focus
keyboard
mobile
```

No local permission truth.

---

# 42. Component → authority minimum map

| Component family | Presentation authority | Domain authority required |
|---|---|---|
| Analytical table | 42 | object-specific |
| Evidence card | 42 | 22/23/24/25/29 as applicable |
| Provenance | 42 | evidence/data-rights authority |
| Contradiction block | 42 | 10/25 |
| Timeline | 42 | 26/27/28 as applicable |
| Forecast block | 42 | 26/31 |
| Verification block | 42 | 27 |
| Economic exposure | 42 | 32 |
| Button / action | 43 | workflow + permission |
| Form | 43 | workflow/data contract |
| Error / feedback | 43 | source state |
| Paid restriction | 43 | 20/33 |
| Notification representation | 43 | 36 |
| Auth prompt | 43 | 37 |
| Share control | 43 | 35 + 34/37 |
| Permission notice | 43 | 34/37 |

---

# 43. Data-source rule

For each visible value engineering records:

```text
field
→ authoritative source
→ freshness/version
→ permission
→ transformation
→ client projection
```

If source unknown:

> do not display as factual value.

---

# 44. Derived values

Derived values require explicit derivation authority.

Frontend arithmetic is allowed only where the governing method makes the derivation deterministic and appropriate.

No UI-created analytical metric.

---

# 45. LLM output boundary

LLM may draft/explain only after structured authority.

LLM may not become source of truth for:

- state;
- permission;
- release;
- confidence;
- forecast lock;
- verification;
- dollar amount;
- legal basis;
- security capability.

---

# 46. State-source matrix

Every visible state must identify its source axis.

At minimum:

```text
AUTHENTICATION
DEAL LIFECYCLE
ENTITLEMENT
PERMISSION
DATA AVAILABILITY
ANALYSIS
QUALITY GATE
OBJECT-SPECIFIC
```

Do not flatten.

---

# 47. Action-source matrix

Every material action must identify:

```text
who may act
on which object
under which preconditions
which server check
which success record
which failure classes
```

---

# 48. No client-side authority

Frontend may render eligibility.

Backend enforces:

- protected reads;
- protected writes;
- role changes;
- invite creation;
- evidence access;
- report release;
- sharing;
- person-level access;
- rights-sensitive exports.

---

# 49. Report source of truth

Canonical structured report projection.

Not:

- PDF;
- email;
- WYSIWYG;
- screenshot;
- cached narrative.

---

# 50. Artifact-source rule

PDF/email/shared view derives from immutable/released structured artifact/version.

Distribution never becomes independent truth.

---

# 51. Screen/PDF/email parity

Same included claim must mean the same thing across:

- screen;
- PDF;
- email-delivered report;
- secure recipient view.

Audience-specific omission may occur only if authorized and must not alter remaining fact meaning.

---

# 52. Print QA

Print/PDF must preserve:

- report order;
- headings;
- material limitations;
- contradictions;
- evidence references;
- forecast exact claim;
- forecast window;
- verification state;
- report/version metadata.

---

# 53. Responsive QA

Narrow view may change composition, never semantic completeness of material state.

No material caveat disappears because desktop column is hidden.

---

# 54. Accessibility target

Product target remains:

```text
WCAG 2.2 AA
```

This is an implementation target.

Do not claim conformance until tested.

---

# 55. W3C implementation references

Non-authoritative implementation references:

- WCAG 2.2 Recommendation — `https://www.w3.org/TR/WCAG22/`
- WAI-ARIA Authoring Practices Guide — `https://www.w3.org/WAI/ARIA/apg/`

Use these for implementation/testing patterns.

They do not override MergeVue product semantics.

---

# 56. Security implementation references

Non-authoritative professional references:

- OWASP ASVS 5.0.0 — current stable application-security verification reference as of 2026-09-16;
- NIST SP 800-218 SSDF 1.1 — final secure-development framework;
- NIST SP 800-218 Rev.1 / SSDF 1.2 was an Initial Public Draft as of 2026-09-16 and is not treated here as final controlling standard.

These references guide implementation assurance.

`44` does **not** claim MergeVue certification or conformance.

---

# 57. Native HTML first

For standard controls:

- button;
- input;
- select;
- checkbox;
- radio;
- dialog semantics where supported;

prefer native semantics before custom ARIA recreation.

---

# 58. ARIA rule

ARIA supplements semantics.

ARIA does not repair incorrect interaction logic.

Keyboard behavior must match the chosen pattern.

---

# 59. Accessibility release evidence

For every critical flow record:

- keyboard result;
- focus order;
- accessible names;
- error association;
- dialog behavior;
- contrast/non-color state;
- zoom/reflow;
- mobile;
- screen reader spot-check.

---

# 60. Browser/device matrix

Define current supported browser/device matrix at implementation time.

`44` does not invent exact versions.

Test at minimum desktop + narrow mobile layouts in supported browsers.

---

# 61. Visual QA

Compare implemented screens against:

- `09`;
- accepted canonical report lineage;
- page contracts;
- `42`;
- `43`.

No generic SaaS redesign.

---

# 62. Content QA

Every client-facing string passes:

- American English;
- sentence case;
- claim authority;
- state vocabulary;
- privacy/security/commercial boundaries;
- no unsupported absolutes.

---

# 63. Data-rights QA

Before any secondary-use, export, benchmark, case publication or external disclosure:

- purpose known;
- authority known;
- scope known;
- recipient known where applicable;
- rights state known;
- missing rights fail closed.

---

# 64. Privacy QA

Do not leak sensitive data through:

- URL;
- analytics;
- logs;
- error messages;
- notifications;
- search suggestions;
- row counts;
- PDF metadata;
- browser cache;
- unauthorized skeletons/previews.

---

# 65. Security QA

Design QA verifies user-visible boundaries.

Engineering/security QA verifies actual enforcement.

A secure-looking UI is not security evidence.

---

# 66. Test evidence classes

Release evidence can include:

```text
automated functional
automated semantic
accessibility automated
manual keyboard
manual screen reader
responsive visual
print/PDF diff
permission/security negative tests
claims review
data-rights review
human semantic review
```

---

# 67. Machine-checkable first

Where a rule is deterministic:

automate it.

Examples:

- forbidden label;
- raw field leakage;
- route auth;
- report version;
- locked claim mutation;
- permission endpoint response;
- screen/PDF field parity.

---

# 68. Human review reserved

Human review for:

- visual hierarchy;
- comprehension;
- irreducible semantic interpretation;
- copy nuance;
- complex accessibility usability;
- contradiction explanation.

---

# 69. QA severity

Recommended implementation QA classes:

```text
BLOCKING
MAJOR
MINOR
NOTE
```

This classification is QA workflow only.

It is not product risk scoring.

---

# 70. BLOCKING examples

- unauthorized private data disclosure;
- wrong report version;
- fake release state;
- locked forecast mutated;
- raw 42Q leak;
- auth bypass;
- report screen/PDF semantic divergence;
- public outcome leakage in historical PRE-T0 experience;
- fabricated commercial/security/legal capability.

---

# 71. MAJOR examples

- material mobile omission;
- inaccessible primary form;
- contradiction hidden;
- wrong action hierarchy causing likely incorrect workflow;
- source/provenance inaccessible;
- stale pricing copied from legacy target.

---

# 72. MINOR examples

- spacing inconsistency;
- non-material wording drift;
- secondary alignment issue;
- cosmetic icon inconsistency without semantic effect.

---

# 73. No release with BLOCKING

Absolute.

---

# 74. Known limitation handling

A known target gap must be:

```text
documented
+
bounded
+
not marketed as complete
```

No placeholder success.

---

# 75. Implementation placeholders

Allowed only in development environment and clearly marked.

Never production client copy:

```text
Coming soon
AI will analyze here
Payment successful
Upload complete
```

when capability absent.

---

# 76. Feature flags

Feature flag does not create authority.

Flagged capability still needs all semantic/security/readiness gates.

---

# 77. Demo mode

Demo data must never be confused with real Deal state.

No synthetic result on real user Deal without unmistakable boundary.

---

# 78. Analytics vs audit

Product analytics ≠ security/access/release audit.

Do not use one store as semantic substitute without architecture authority.

---

# 79. Observability

Technical observability may track failures/performance.

Do not ingest raw sensitive evidence unnecessarily.

---

# 80. Release record

Each release should record:

```text
app version / commit
corpus version
routes tested
critical flows tested
known blockers
known target-only gaps
accessibility result
print/PDF result
security/permission test result
claim ledger status
release decision
```

---

# 81. Rollback

If release introduces semantic/security regression:

rollback/disable path should exist according to deployment architecture.

Do not preserve wrong client output for cosmetic continuity.

---

# 82. Migration

Existing stored artifacts retain historical meaning.

Do not migrate:

- old seal;
- old report;
- old forecast;

into stronger modern semantics retroactively.

---

# 83. Legacy copy

Legacy UI copy is not authority.

Examples requiring removal/review include obsolete pricing anchors and unsupported claims identified by accepted contracts.

---

# 84. Current production claims audit

Before launch of redesigned surface:

crawl client-visible strings and classify:

```text
KEEP
REWRITE
REMOVE
BLOCK UNTIL AUTHORITY
```

---

# 85. Public methodology QA

Must distinguish:

- theory;
- formalization;
- evidence;
- mathematics;
- retrospective evaluation;
- prospective verification.

No claim that nine Environments were generated from ten cases or by an LLM.

---

# 86. Historical case QA

Must preserve:

```text
PRE-T0 evidence
→ allowed prediction
→ locked temporal boundary
→ POST-T0 outcome
→ verification
```

No hindsight contamination.

---

# 87. Public report QA

Canonical report:

- block order retained;
- missing block not fabricated;
- contradiction visible;
- Decision Gap visible;
- sources/limitations visible;
- no transaction verdict;
- no valuation opinion.

---

# 88. Paid report QA

Paid report is expanded evidence depth, not unrelated consulting deck.

Client/expert congruence preserved.

---

# 89. Expert view QA

Same canonical claims/blocks.

Adds:

- provenance;
- alternatives;
- conflicts;
- rationale;
- decision controls;
- release state.

Does not create parallel truth.

---

# 90. Economic QA

No `EV × score` shortcut.

No automatic dollar loss.

No total aggregation before accepted overlap/method rules.

---

# 91. 42Q QA

Person channel remains separate.

No employee-performance product drift.

No automated employment decision.

---

# 92. Notification QA

State precedes message.

Stale follow-up cancelled.

No fake read/open.

---

# 93. Sharing QA

Exact artifact/version/recipient/purpose.

No silent latest-version replacement.

---

# 94. Lifecycle QA

Deletion copy matches actual operation.

No blanket `Delete all my data`.

---

# 95. Security/public trust QA

`41` dynamic claim ledger current before publication.

Unknown factual claim omitted.

---

# 96. Design-review packet

For each major surface, review packet should include:

- desktop screenshot;
- narrow/mobile screenshot;
- keyboard notes;
- state variants;
- error/block variants;
- source contract IDs;
- data-source mapping;
- target-only markers;
- print sample if report-bearing.

---

# 97. Page-state coverage

Do not review only happy path.

At minimum test where applicable:

```text
normal
loading
empty
limited data
unknown
contradiction
error
blocked
auth required
permission denied
paid transition
analysis in progress
analysis ready
locked/sealed/verified object states
```

---

# 98. No fake uniformity

Different surfaces need different state machines.

QA tests semantic correctness, not identical count of variants.

---

# 99. Design freedom test

Reviewer must distinguish:

```text
FIXED
ADAPTABLE
DESIGNER CHOICE
```

Do not reject lawful visual improvement because layout differs from draft.

Do reject semantic drift.

---

# 100. 67-planned-object reconciliation

The original `00` registry contains 67 planned responsibilities:

```text
12 master
+ 14 public
+ 20 working
+ 14 component
+ 7 report/handoff
= 67
```

The final corpus does not require 67 separate files.

Anti-proliferation intentionally consolidates overlapping responsibilities.

The following table is the final accounting.


| Registry ID | Original planned responsibility | Controlling authority | Final disposition |
| --- | --- | --- | --- |
| M-00 | Master design program / corpus plan | 00 | DIRECT |
| M-01 | Product North Star | 01 | DIRECT |
| M-02 | Audiences, buyers and roles | 02 | DIRECT |
| M-03 | End-to-end user journey | 03 | DIRECT |
| M-04 | Service blueprint | 04 | DIRECT |
| M-05 | Information architecture | 05 | DIRECT |
| M-06 | Trust ladder / progressive disclosure | 06 | DIRECT |
| M-07 | Product tiers / value model | 07 | DIRECT |
| M-08 | Public claims governance | 08 | DIRECT |
| M-09 | Visual direction | 09 | DIRECT |
| M-10 | Global state model | 10 | DIRECT |
| M-11 | Responsive / accessibility / content rules | 11 | DIRECT |
| P-01 | Home | 12 | DIRECT |
| P-02 | How it works | 13 | DIRECT |
| P-03 | Methodology overview | 14 | DIRECT |
| P-04 | Theory origin | 14 | ABSORBED into methodology authority |
| P-05 | Nine Environments index | 15 | DIRECT |
| P-06 | Environment detail template | 15 | ABSORBED into Environment index/detail contract |
| P-07 | Resource interaction | 14 | ABSORBED into methodology authority |
| P-08 | Public mathematics | 14 | ABSORBED into methodology authority |
| P-09 | Forecasting / falsifiability | 14 | ABSORBED into methodology authority |
| P-10 | Validation / limitations | 14 | ABSORBED into methodology authority |
| P-11 | Historical cases index | 16 | DIRECT |
| P-12 | Historical case template | 17 | DIRECT |
| P-13 | Paid tiers / commercial scope | 20 + 33 | ABSORBED into Decision Gap + commercial authority |
| P-14 | Security / privacy / confidentiality public surface | 41 | COMPOSITE REMAINING ACT CLOSED by 41 |
| W-01 | Public analysis start | 18 | DIRECT |
| W-02 | Company confirmation | 18 | ABSORBED into deal-entry/entity-resolution contract |
| W-03 | Deal context | 18 | ABSORBED into deal-entry contract |
| W-04 | Public research process | 18 | ABSORBED into public-analysis-start contract |
| W-05 | Public result | 19 | DIRECT |
| W-06 | Evidence detail / public evidence surface | 19 + 42 | ABSORBED into canonical public report + analytical components |
| W-07 | Registration / save transition | 21 | DIRECT |
| W-08 | Deal workspace | 22 | DIRECT |
| W-09 | Structured internal surveys | 23 | DIRECT |
| W-10 | Respondent invitations | 23 | DIRECT |
| W-11 | Paid/private document ingestion | 24 | DIRECT |
| W-12 | Evidence register | 22 + 24 + 42 | ABSORBED into workspace/evidence/component authorities |
| W-13 | Individual 42Q channel | 31 | DIRECT |
| W-14 | 42Q invitation / completion | 23 + 31 | ABSORBED into respondent + 42Q authorities |
| W-15 | Individual-analysis status | 31 + 43 | ABSORBED into 42Q semantics + interaction representation |
| W-16 | Material findings / contradiction review | 25 | DIRECT |
| W-17 | Named-leader behavioral forecast without type reveal | 31 | DIRECT |
| W-18 | Forecasts | 26 | DIRECT |
| W-19 | Forecast lock / ledger | 26 | DIRECT |
| W-20 | Follow-up / verification / monitoring | 27 + 28 | ABSORBED into verification + monitoring authorities |
| C-01 | Visual principles | 09 | DIRECT |
| C-02 | Reusable component set | 43 | COMPOSITE REMAINING ACT CLOSED by 43 |
| C-03 | States and semantic markers | 10 + 42 + 43 | ABSORBED: semantics in 10; representation in 42/43 |
| C-04 | Analytical tables | 42 | COMPOSITE REMAINING ACT CLOSED by 42 |
| C-05 | Evidence cards | 42 | COMPOSITE REMAINING ACT CLOSED by 42 |
| C-06 | Timelines | 42 | COMPOSITE REMAINING ACT CLOSED by 42 |
| C-07 | Forecast blocks | 42 | COMPOSITE REMAINING ACT CLOSED by 42 |
| C-08 | Forms | 43 | COMPOSITE REMAINING ACT CLOSED by 43 |
| C-09 | Notifications UI | 36 + 43 | ABSORBED: semantics in 36; representation in 43 |
| C-10 | Blocking UI | 10 + 25 + 43 | ABSORBED: state/gate semantics upstream; representation in 43 |
| C-11 | Paid restrictions UI | 33 + 43 | ABSORBED: commercial semantics in 33; representation in 43 |
| C-12 | Errors | 10 + 43 | ABSORBED: semantic distinction in 10; interaction representation in 43 |
| C-13 | Uncertainty | 10 + 42 + 43 | ABSORBED across state/analytical/interaction authorities |
| C-14 | Contradictions | 10 + 25 + 42 + 43 | ABSORBED across state/review/analytical/interaction authorities |
| R-01 | Public short report | 19 | DIRECT |
| R-02 | Paid analytical report | 26 | DIRECT |
| R-03 | Print / PDF representation | 19 + 26 + 42 | ABSORBED into canonical report + paid release + components |
| R-04 | Evidence presentation | 42 | ABSORBED into analytical component authority |
| R-05 | Forecast presentation | 26 + 42 | ABSORBED into forecast/release + component authority |
| R-06 | Development handoff | 44 | FINAL REMAINING ACT — THIS CONTRACT |
| R-07 | Design QA | 44 | FINAL REMAINING ACT — THIS CONTRACT |

---

# 101. Reconciliation result

```text
ORIGINAL PLANNED RESPONSIBILITIES = 67
ACCOUNTED = 67
UNACCOUNTED = 0
AMBIGUOUS = 0
```

`67/67` means:

> every original responsibility has a controlling destination.

It does **not** mean:

> 67 standalone files must exist.

---

# 102. Final corpus shape

```text
00–11  Master product/design system
12–41  Public/product/workspace/commercial/security contracts
42     Analytical/evidence component system
43     Interaction/forms/system-feedback component system
44     Development handoff + design QA
```

Total:

```text
00–44 = 45 numbered product-design documents
```

---

# 103. Remaining-manifest closure

The accepted remaining-corpus sequence was:

```text
41 → 42 → 43 → 44
```

Upon Owner acceptance of `44`:

```text
REMAINING NUMBERED DESIGN ACTS = 0
```

---

# 104. No 45

After acceptance:

```text
NEXT NUMBERED DESIGN ACT = NONE
```

A future requirement should first amend an existing controlling contract where lawful.

---

# 105. Post-freeze change workflow

```text
new requirement
→ identify controlling authority
→ determine whether requirement fits
→ amend existing contract if lawful
→ run non-regression / targeted QA
→ only if genuinely separate durable responsibility:
   Owner Change Act
```

---

# 106. Amendment numbering

Corrigenda/audits/revisions remain attached to existing product number.

They do not become `45`.

---

# 107. Design corpus vs implementation backlog

Corpus freeze does **not** mean product implementation complete.

After `44`, work shifts from:

```text
design-authority creation
```

to:

```text
implementation
audit
verification
release
```

---

# 108. Design completeness ≠ product readiness

Final design corpus can be complete while:

- auth not implemented;
- private uploader absent;
- payment absent;
- notification center absent;
- secure sharing partial;
- forecasting persistence not hardened;
- legal copy pending;
- security claims unverified.

Those are implementation/readiness facts, not reason for file `45`.

---

# 109. Handoff acceptance evidence

A development handoff is sufficient when engineer can answer, without oral reconstruction:

1. what to build;
2. what not to build;
3. which authority controls each behavior;
4. where data comes from;
5. which states exist;
6. which actions require permissions;
7. how responsive behavior works;
8. how accessibility is tested;
9. how screen/PDF stay congruent;
10. which target-only features must stay hidden;
11. which tests gate release;
12. what to do when authority is missing.

---

# 110. QA acceptance evidence

Design QA is sufficient when:

- all critical surfaces reviewed;
- all critical states covered;
- semantic non-regression passes;
- accessibility target tested;
- responsive tests pass;
- print/PDF tests pass;
- permission/privacy/security negative tests pass;
- claims reviewed;
- no BLOCKING remains;
- 67/67 accounted.

---

# 111. Full QA matrix


| Category | Test | Requirement | Gate |
| --- | --- | --- | --- |
| Authority & corpus integrity | 01 | No implementation decision contradicts a narrower controlling contract. | PASS required before applicable release |
| Authority & corpus integrity | 02 | No new numbered design artifact 45+ is created without Owner Change Act. | PASS required before applicable release |
| Authority & corpus integrity | 03 | Every implemented page/surface maps to at least one controlling file. | PASS required before applicable release |
| Authority & corpus integrity | 04 | Every material component maps to 42 or 43 plus its domain authority. | PASS required before applicable release |
| Authority & corpus integrity | 05 | Historical/superseded candidate versions are not treated as controlling. | PASS required before applicable release |
| Authority & corpus integrity | 06 | Target-only design is never presented as implemented production capability. | PASS required before applicable release |
| Authority & corpus integrity | 07 | Design copy does not silently become legal, security, methodology or commercial authority. | PASS required before applicable release |
| Public value path | 01 | User can enter two real companies before account creation. | PASS required before applicable release |
| Public value path | 02 | Entity-resolution ambiguity is surfaced rather than guessed. | PASS required before applicable release |
| Public value path | 03 | Public research uses actual runtime path rather than prototype success text. | PASS required before applicable release |
| Public value path | 04 | Public result is generated from authoritative structured report projection. | PASS required before applicable release |
| Public value path | 05 | Public result remains accessible before signup/paid transition. | PASS required before applicable release |
| Public value path | 06 | Decision Gap appears only from actual analytical state. | PASS required before applicable release |
| Public value path | 07 | Deeper-diligence actions are contextual, not a generic wall of upsells. | PASS required before applicable release |
| State semantics | 01 | Authentication, entitlement, permission, data availability, analysis state and quality gate remain separate axes. | PASS required before applicable release |
| State semantics | 02 | No universal Deal completion percentage exists without denominator authority. | PASS required before applicable release |
| State semantics | 03 | Unknown does not render as zero/negative/low. | PASS required before applicable release |
| State semantics | 04 | Technical error does not render as Cannot determine. | PASS required before applicable release |
| State semantics | 05 | Contradiction does not render as low confidence. | PASS required before applicable release |
| State semantics | 06 | Review complete does not imply high analytical confidence. | PASS required before applicable release |
| State semantics | 07 | Computed output does not imply release authority. | PASS required before applicable release |
| Evidence | 01 | Upload/selecting a file does not mark it verified evidence. | PASS required before applicable release |
| Evidence | 02 | Public, internal, private and person-level lanes remain distinct. | PASS required before applicable release |
| Evidence | 03 | Evidence provenance survives screen and report projection. | PASS required before applicable release |
| Evidence | 04 | Evidence review state does not become analytical conclusion. | PASS required before applicable release |
| Evidence | 05 | Restricted evidence is filtered server-side. | PASS required before applicable release |
| Evidence | 06 | Raw respondent answers are not exposed to ordinary client roles. | PASS required before applicable release |
| Evidence | 07 | Private evidence does not silently enter FREE scoring. | PASS required before applicable release |
| Reports & forecasts | 01 | Canonical report structure/order is not replaced by dashboard cards. | PASS required before applicable release |
| Reports & forecasts | 02 | Screen/PDF/email derive from same released semantic projection. | PASS required before applicable release |
| Reports & forecasts | 03 | Report version is explicit where history matters. | PASS required before applicable release |
| Reports & forecasts | 04 | Locked, sealed, released and verified remain distinct. | PASS required before applicable release |
| Reports & forecasts | 05 | Locked forecast wording/window is not changed after outcome. | PASS required before applicable release |
| Reports & forecasts | 06 | Verification attaches to exact forecast ID/version. | PASS required before applicable release |
| Reports & forecasts | 07 | No overall Deal forecast accuracy score is invented. | PASS required before applicable release |
| Economics & commercial | 01 | Economic exposure is not relabeled expected loss. | PASS required before applicable release |
| Economics & commercial | 02 | Not quantified / Cannot determine remain lawful outputs. | PASS required before applicable release |
| Economics & commercial | 03 | No dollar figure is invented by UI/LLM. | PASS required before applicable release |
| Economics & commercial | 04 | No incompatible currencies/time bases are silently aggregated. | PASS required before applicable release |
| Economics & commercial | 05 | Pricing uses current accepted scope authority, not legacy anchors. | PASS required before applicable release |
| Economics & commercial | 06 | No fake discount/countdown/scarcity/Most popular badge. | PASS required before applicable release |
| Economics & commercial | 07 | No fake checkout/card/Stripe surface without implementation authority. | PASS required before applicable release |
| Economics & commercial | 08 | Paid depth is not marketed as guaranteed certainty. | PASS required before applicable release |
| 42Q / person-level | 01 | 42Q appears only for an authorized named-leader purpose. | PASS required before applicable release |
| 42Q / person-level | 02 | Raw answers/item IDs/axis scores/type/function stack remain restricted. | PASS required before applicable release |
| 42Q / person-level | 03 | Client report uses approved behavior claim rather than type label. | PASS required before applicable release |
| 42Q / person-level | 04 | Participant decline does not get coerced or converted to adverse score. | PASS required before applicable release |
| 42Q / person-level | 05 | Named-person disclosure passes recipient/purpose/data-rights gate. | PASS required before applicable release |
| 42Q / person-level | 06 | Ordinary client cannot export raw 42Q. | PASS required before applicable release |
| Identity / permissions / sharing | 01 | Authentication does not grant Deal authorization. | PASS required before applicable release |
| Identity / permissions / sharing | 02 | Protected APIs enforce permissions independently of UI. | PASS required before applicable release |
| Identity / permissions / sharing | 03 | Forwarded invite/share does not grant wrong identity access. | PASS required before applicable release |
| Identity / permissions / sharing | 04 | External recipient does not become collaborator. | PASS required before applicable release |
| Identity / permissions / sharing | 05 | Anyone-with-link is not default for sensitive artifacts. | PASS required before applicable release |
| Identity / permissions / sharing | 06 | Download permission remains distinct from view. | PASS required before applicable release |
| Identity / permissions / sharing | 07 | Revocation messaging does not promise recall of already-downloaded files. | PASS required before applicable release |
| Notifications | 01 | In-product state exists independently of notification. | PASS required before applicable release |
| Notifications | 02 | No notification center theater / fake demo messages. | PASS required before applicable release |
| Notifications | 03 | Sent, delivered and read are not conflated. | PASS required before applicable release |
| Notifications | 04 | Transactional communication does not subscribe marketing. | PASS required before applicable release |
| Notifications | 05 | No raw private evidence/42Q appears in notification body. | PASS required before applicable release |
| Notifications | 06 | No continuous monitoring/alert promise without scheduler/trigger infrastructure. | PASS required before applicable release |
| Privacy / security / lifecycle | 01 | Public trust claims have current factual authority. | PASS required before applicable release |
| Privacy / security / lifecycle | 02 | No invented certification, encryption, region, DPA, provider or no-training claim. | PASS required before applicable release |
| Privacy / security / lifecycle | 03 | Archive/remove access/delete Deal/delete account/delete evidence remain distinct. | PASS required before applicable release |
| Privacy / security / lifecycle | 04 | No invented retention period. | PASS required before applicable release |
| Privacy / security / lifecycle | 05 | Security event, incident and breach remain distinct. | PASS required before applicable release |
| Privacy / security / lifecycle | 06 | Support access is not treated as universal Deal access. | PASS required before applicable release |
| Privacy / security / lifecycle | 07 | Sensitive implementation details are not exposed in public UX. | PASS required before applicable release |
| Accessibility / responsive | 01 | WCAG 2.2 AA target is tested for every critical user flow. | PASS required before applicable release |
| Accessibility / responsive | 02 | All primary functionality is keyboard operable. | PASS required before applicable release |
| Accessibility / responsive | 03 | Focus order and focus restoration are correct. | PASS required before applicable release |
| Accessibility / responsive | 04 | Form labels/errors/descriptions are programmatically associated. | PASS required before applicable release |
| Accessibility / responsive | 05 | Dialogs have correct focus entry/trap/return behavior. | PASS required before applicable release |
| Accessibility / responsive | 06 | Color is never sole carrier of state. | PASS required before applicable release |
| Accessibility / responsive | 07 | Mobile preserves material claims, limitations and provenance. | PASS required before applicable release |
| Accessibility / responsive | 08 | Touch targets and zoom/reflow are usable. | PASS required before applicable release |
| Print / PDF | 01 | Print preserves semantic order. | PASS required before applicable release |
| Print / PDF | 02 | Interactive controls are omitted. | PASS required before applicable release |
| Print / PDF | 03 | Material limitations and contradictions remain. | PASS required before applicable release |
| Print / PDF | 04 | Tables remain readable. | PASS required before applicable release |
| Print / PDF | 05 | Forecast exact claim/window/status remain. | PASS required before applicable release |
| Print / PDF | 06 | Report/version/evidence-scope metadata remain where required. | PASS required before applicable release |
| Print / PDF | 07 | No private/internal metadata leaks into PDF. | PASS required before applicable release |
| Claims & content | 01 | American English and sentence case are applied to client UI. | PASS required before applicable release |
| Claims & content | 02 | Buttons describe outcomes rather than generic Continue when possible. | PASS required before applicable release |
| Claims & content | 03 | No dramatic or fear-based unsupported copy. | PASS required before applicable release |
| Claims & content | 04 | Public theory/method claims distinguish theory, formalization, evidence and empirical validation. | PASS required before applicable release |
| Claims & content | 05 | Historical cases preserve PRE-T0 / POST-T0 boundary. | PASS required before applicable release |
| Claims & content | 06 | AI/provider branding does not become evidence or authority. | PASS required before applicable release |
| Regression / release | 01 | Existing canonical renderer behavior is compared before replacement. | PASS required before applicable release |
| Regression / release | 02 | Critical flows have automated machine-checkable tests where possible. | PASS required before applicable release |
| Regression / release | 03 | Human review is reserved for irreducible semantic/visual judgment. | PASS required before applicable release |
| Regression / release | 04 | No release occurs with unresolved blocking QA finding. | PASS required before applicable release |
| Regression / release | 05 | Known target-only gaps are documented rather than mocked as complete. | PASS required before applicable release |
| Regression / release | 06 | Each release stores evidence of the corpus/version tested. | PASS required before applicable release |

---

# 112. QA evidence format

Each test record should include:

```text
testId
surface
authority
build/commit
precondition
steps / automated assertion
expected
actual
result
evidence reference
reviewer
date
```

---

# 113. Visual screenshot evidence

Screenshot is evidence of rendering only.

It does not prove:

- server authorization;
- persistence;
- idempotency;
- delivery;
- rights;
- data lifecycle;
- security control.

---

# 114. Automated test evidence

Automated PASS proves only asserted behavior.

Do not generalize beyond coverage.

---

# 115. Manual test evidence

Manual review should record exact environment and object state.

Avoid vague:

```text
looks good
```

---

# 116. Accessibility automated tooling

Automated tooling helps detect classes of defects.

It does not prove full WCAG conformance.

Manual keyboard/assistive-technology review remains necessary.

---

# 117. Security references are not certification

Using ASVS/NIST guidance does not permit client claim:

```text
ASVS compliant
NIST certified
```

without an actual applicable assurance basis.

---

# 118. Claims-release coupling

A redesigned page cannot publish a stronger claim than current implementation simply because target design anticipates it.

---

# 119. Dynamic claim re-review

Re-review when:

- provider changes;
- region changes;
- auth method changes;
- storage changes;
- retention policy changes;
- security control changes;
- legal basis changes;
- training posture changes;
- DPA/certification status changes.

---

# 120. Release-blocking claim mismatch

If client-facing security/privacy/commercial claim exceeds factual implementation:

```text
BLOCK RELEASE OR NARROW/OMIT CLAIM
```

Do not ship aspiration as fact.

---

# 121. Data classification in handoff

At minimum distinguish:

```text
PUBLIC
DEAL INTERNAL
PRIVATE DOCUMENTARY
PERSON-LEVEL RESTRICTED
INTERNAL GOVERNANCE
SECURITY SECRET
```

Exact technical classification may be refined by security architecture.

Do not collapse.

---

# 122. Logging rule

Logs should preserve enough auditability without becoming a sensitive-data copy.

---

# 123. Test data

Use synthetic/de-identified test fixtures where feasible.

Do not use real client private/42Q data for routine UI regression.

---

# 124. Production/staging separation

Identity/data boundaries must preserve environment separation.

No production data in demo screenshot environment without authority.

---

# 125. Release checklist — public

- home/content current;
- methodology claims bounded;
- cases PRE/POST boundary;
- public analysis real;
- result real;
- public report accessible;
- Decision Gap correct;
- security/privacy claims current;
- no forced signup;
- no fake paid action.

---

# 126. Release checklist — workspace

- save persists;
- auth/session real;
- Deal authorization real;
- public baseline preserved;
- evidence channels correct;
- refresh safe;
- states server-authoritative;
- permission denial safe.

---

# 127. Release checklist — evidence

- respondent flow canonical;
- private/document lane gated;
- provenance retained;
- upload ≠ verified;
- contradiction preserved;
- no raw restricted leakage.

---

# 128. Release checklist — paid/report

- scope/pricing current;
- report gate passes;
- released version immutable;
- PDF congruent;
- sharing rights-filtered;
- forecast lock/seal accurate.

---

# 129. Release checklist — longitudinal

- forecast identity stable;
- observations versioned;
- intervention context preserved;
- verification exact;
- no hindsight mutation;
- track-record eligibility governed.

---

# 130. Release checklist — cross-cutting

- WCAG 2.2 AA target tested;
- mobile;
- print;
- claims;
- data rights;
- security;
- privacy;
- analytics minimization;
- no BLOCKING.

---

# 131. Developer DO

- start from exact controlling contract;
- audit current code;
- reuse existing viable components;
- preserve semantic state distinctions;
- enforce protected actions server-side;
- keep source-of-truth structured;
- version immutable artifacts;
- write regression tests;
- keep target-only capability hidden/labelled;
- return authority gaps instead of guessing.

---

# 132. Developer DO NOT

- invent routes;
- invent roles;
- invent prices;
- invent scores;
- invent confidence;
- invent security badges;
- invent retention;
- invent payment;
- invent notification center;
- invent SSO;
- invent monitoring;
- invent benchmark;
- invent person scoring;
- replace canonical report with dashboard;
- create `45`.

---

# 133. Designer DO

- adapt composition;
- improve hierarchy;
- reduce visual noise;
- use accepted components;
- make states understandable;
- preserve professional analytical tone;
- make mobile/keyboard/print usable.

---

# 134. Designer DO NOT

- change methodology;
- change report order;
- change evidence meaning;
- change state meaning;
- change role/permission;
- turn uncertainty into certainty;
- turn paid into confidence guarantee;
- create new product truth through visuals.

---

# 135. Product/Owner decision boundary

Owner decision required when:

- authority conflict cannot be resolved by hierarchy;
- genuine new requirement outside corpus appears;
- a target-only capability needs production commitment;
- an unresolved commercial/legal/security choice blocks implementation;
- a proposed change would alter product semantics.

---

# 136. Engineering decision boundary

Engineering may decide implementation detail where contracts intentionally leave freedom:

- framework-level composition;
- storage/query optimization;
- exact component code organization;
- caching;
- routing mechanics consistent with route authority;
- accessible native implementation;
- observability mechanism;
- test tooling.

Engineering may not change product meaning to simplify code.

---

# 137. Security decision boundary

Security engineering chooses technical control details where contracts intentionally avoid invention.

Public copy waits for factual implementation evidence.

---

# 138. Legal/privacy decision boundary

Counsel/policy authority controls legal text, basis, jurisdiction, DPA/terms, retention/deletion commitments where applicable.

Product design does not fabricate.

---

# 139. Release decision boundary

A release decision should consider:

```text
product semantics
implementation correctness
security
privacy/data rights
accessibility
claims
regression
```

A visually complete build can still fail release.

---

# 140. Final implementation definition of done

A feature is not done until:

```text
authority identified
implementation exists
server/data truth exists
states exist
errors exist
permissions enforced
responsive behavior works
accessibility tested
claims match reality
regression tests pass
release evidence recorded
```

---

# 141. Final corpus definition of done

The design corpus is complete when:

```text
00–44 present
41 accepted
42 accepted
43 accepted
44 accepted
67/67 accounted
0 unaccounted
0 ambiguous
0 unauthorized 45+
```

`44` is currently CANDIDATE until Owner acceptance.

---

# 142. Owner acceptance and final corpus closure

Owner explicitly ACCEPTED this contract on:

```text
2026-09-16
```

From that point:

```text
44_MERGEVUE_DEVELOPMENT_HANDOFF_AND_DESIGN_QA_CONTRACT.md
=
OWNER-ACCEPTED
CONTROLLING DEVELOPMENT HANDOFF AND DESIGN QA CONTRACT

R-06 = CLOSED
R-07 = CLOSED

PLANNED RESPONSIBILITIES = 67
ACCOUNTED = 67
UNACCOUNTED = 0
AMBIGUITY = 0

DESIGN CORPUS 00–44 = FROZEN / CLOSED
NEXT NUMBERED DESIGN ACT = NONE
45+ = PROHIBITED WITHOUT OWNER CHANGE ACT
```

This acceptance closes the remaining design-program obligations for:

- development handoff;
- route/page/component/state/data-dependency traceability;
- implementation sequencing;
- target-only readiness gates;
- full acceptance-test framework;
- responsive/accessibility/print QA;
- claims/security/privacy/data-rights release checks;
- final 67/67 reconciliation.

This acceptance does **not** mean:

- production implementation is complete;
- all target capabilities exist;
- security/privacy/legal claims are approved beyond their own authority;
- payment infrastructure exists;
- authentication/collaboration/sharing is production-ready;
- private evidence ingestion is production-ready;
- 42Q/person-level production operation is authorized merely by design completion;
- any external standard compliance/certification is established;
- future implementation defects are waived.

The design corpus is now complete as a written authority system.

Future work moves to:

```text
IMPLEMENTATION
→ AUDIT
→ VERIFICATION
→ RELEASE
```

New requirements must first be mapped to an existing controlling contract. A new numbered artifact is exceptional and requires a separate Owner Change Act.

Final state:

```text
STATUS = OWNER-ACCEPTED / CONTROLLING
R-06 = CLOSED
R-07 = CLOSED
67/67 = ACCOUNTED
UNACCOUNTED = 0
AMBIGUITY = 0
DESIGN CORPUS = 00–44 FROZEN / CLOSED
NEXT NUMBERED DESIGN ACT = NONE
45+ = PROHIBITED WITHOUT OWNER CHANGE ACT
```

---

# 143. Финальная формула

> **MergeVue design is ready for development only when implementation can be derived from written authority rather than reconstructed from memory.**

> **The purpose of the handoff is not to make every target capability look finished. It is to make the boundary between implemented, partial, target-only, absent and blocked capability impossible to misunderstand.**

> **The purpose of design QA is not cosmetic approval. It is to prove that the rendered product still means what the controlling corpus says it means — across states, permissions, evidence depth, forecasts, reports, mobile, accessibility, print, privacy and security.**

> **With `44` accepted, the numbered design corpus ends at `00–44`. Future work moves into implementation, verification and release. A new numbered design artifact is an exception requiring explicit Owner Change Act, not the default response to every new engineering detail.**
