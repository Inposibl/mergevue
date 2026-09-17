# 29. Контракт управления продольными доказательствами и правами на данные MergeVue

**Статус документа:** управляющий target-contract / longitudinal evidence governance and data-rights boundary  
**Файл:** `29_MERGEVUE_LONGITUDINAL_EVIDENCE_GOVERNANCE_AND_DATA_RIGHTS_CONTRACT.md`  
**Версия:** 1.0  
**Дата:** 16 сентября 2026 года  
**Язык документации:** русский  
**Язык клиентского интерфейса:** только American English  
**Рынок первой версии:** США  
**Входной контракт:** `28_MERGEVUE_POST_CLOSE_MONITORING_AND_REMEASUREMENT_CONTRACT.md`  
**Связанные контракты:** `21`–`28` корпуса  
**Главный принцип:** longitudinal evidence может использоваться только в пределах законно определённой цели, прав доступа и разрешённого scope; накопление данных внутри MergeVue не создаёт автоматически право на cross-deal reuse, benchmark, model improvement, case-study publication или future-diligence disclosure  
**Ключевые инварианты:** `DEAL-SPECIFIC BY DEFAULT`, `PURPOSE ≠ OWNERSHIP`, `ACCESS ≠ REUSE RIGHTS`, `ANONYMIZED ≠ AUTOMATICALLY PUBLIC`, `CALIBRATION ≠ PUBLICATION`, `BENCHMARK ≠ RAW DATA SHARING`, `42Q STAYS SEPARATE`, `NO SILENT CROSS-DEAL REUSE`, `NO INVENTED RETENTION POLICY`, `FAIL CLOSED`

---

# 0. Назначение

Этот документ определяет продуктовую и UX-границу для данных, которые накапливаются в MergeVue во времени:

```text
Deal baseline
→ public evidence
→ respondent evidence
→ private documentary evidence
→ analyst review
→ forecast
→ watchpoints
→ observations
→ interventions
→ re-measurements
→ verification outcomes
→ longitudinal history
```

Он отвечает на вопросы:

1. для какой цели конкретные данные были собраны;
2. кто может их видеть;
3. где они могут использоваться повторно;
4. что можно использовать только внутри одного Deal;
5. что потенциально может участвовать в calibration/R&D;
6. что потенциально может войти в benchmark;
7. что потенциально может стать public case study;
8. что потенциально может войти в future Execution Evidence Pack;
9. как не превратить anonymization в фиктивную универсальную лицензию;
10. какие retention/deletion/legal policy решения ещё не определены и поэтому не должны выдумываться интерфейсом.

---

# 1. Authority boundary

Owner-accepted Commercial North Star задаёт будущую цель:

> использовать законно собранные, управляемые, надлежащим образом обезличенные или разрешённые longitudinal evidence для улучшения calibration и benchmark quality.

Он также прямо указывает:

> никакой benchmark, validation или generalization claim не может превышать фактическое evidence coverage.

И отдельно запрещает строить future Execution Evidence Pack до появления:

- longitudinal evidence model;
- data-rights boundaries.

Следовательно:

> **этот контракт создаёт data-rights boundary, но не создаёт сам по себе юридическую лицензию, privacy policy или permission от клиента.**

---

# 2. Current implementation reality

В текущем `main` есть:

- Deal-specific evidence model;
- respondent provenance;
- private/document evidence;
- review states;
- report/forecast versions;
- verification primitives;
- target longitudinal architecture.

Но не установлена как current production authority полноценная customer-facing система:

- data-rights purpose grants;
- retention schedule;
- deletion schedule;
- anonymization certification;
- cross-Deal reuse consent;
- benchmark permission;
- case-publication permission;
- model-training/data-improvement consent;
- execution-evidence-pack disclosure rights.

Поэтому:

> **необходимо проектировать эти capability как target controls, а не притворяться, что юридические права уже существуют.**

---

# 3. No invented ownership claim

Этот документ не утверждает:

- `The client owns all data`;
- `MergeVue owns all derived data`;
- `MergeVue may freely reuse anonymized data`;
- `Uploading grants MergeVue a perpetual license`;
- `Aggregated data is automatically ours`.

Такие утверждения требуют:

- terms;
- privacy policy;
- contract language;
- counsel review;
- jurisdiction-specific analysis where applicable.

Product UX cannot invent them.

---

# 4. Purpose is the first data-rights axis

Каждый material data object должен иметь понятную первоначальную purpose.

Examples:

- perform public Deal analysis;
- produce paid Deal diagnostic;
- support respondent evidence;
- review private evidence;
- create forecast;
- monitor post-close watchpoint;
- verify outcome;
- produce client report.

Potential secondary purposes are separate.

---

# 5. Access is not reuse permission

A user may be permitted to view evidence within one Deal.

Это не означает, что система имеет право:

- reuse it in another Deal;
- train a model on it;
- include it in benchmark;
- publish it;
- export it to another client;
- turn it into case study.

---

# 6. Reuse permission is not publication permission

A dataset may be lawfully used internally for governed calibration.

Это не означает право:

- name client;
- describe Deal;
- publish quotes;
- expose company pair;
- publish case study.

Separate permission.

---

# 7. Publication permission is not broad reuse permission

A client may approve one case study.

That does not necessarily authorize:

- general model training;
- raw benchmark inclusion;
- future Deal reuse;
- unrelated marketing.

Purpose remains bounded.

---

# 8. Data classes

Target architecture should distinguish at least:

1. Public evidence
2. Deal identity / transaction metadata
3. Respondent metadata
4. Respondent answers
5. Private documentary evidence
6. Analyst review material
7. Forecast / seal records
8. Monitoring observations
9. Intervention records
10. Re-measurement records
11. Verification outcomes
12. 42Q / individual-data channel
13. Technical telemetry
14. Commercial/account metadata

These classes do not share one rights model automatically.

---

# 9. Public evidence

Public evidence may originate from:

- filings;
- official websites;
- public records;
- public reporting;
- other lawful public sources.

Its source rights/provenance remain relevant.

Public availability does not mean:

- no copyright constraints;
- no source terms;
- no citation requirements;
- no temporal provenance.

---

# 10. Derived Deal interpretation is not merely public evidence

Even where source facts are public, MergeVue may create:

- evidence classifications;
- mappings;
- Deal-specific interpretation;
- contradiction state;
- report narrative.

Do not treat the whole Deal report as public merely because input sources were public.

---

# 11. Deal identity

Company pair and transaction interest can itself be sensitive client context.

Do not expose:

- recently analyzed Deals;
- search history;
- saved company pairs;
- internal Deal nickname;
- contemplated transactions

outside authorized scope.

---

# 12. Respondent metadata

Includes potentially sensitive context:

- side;
- role;
- function;
- seniority;
- access level;
- observation tenure;
- relationship to Deal.

Default:

> Deal-specific evidence provenance.

Not global respondent profile.

---

# 13. Respondent answer data

Default:

> use for the authorized Deal/evidence workflow for which it was collected.

Do not automatically:

- publish raw answers;
- reuse across Deals;
- benchmark named individuals;
- create respondent reliability leaderboard.

---

# 14. Private documentary evidence

Default:

> restricted to authorized Deal analysis/review purposes.

No automatic:

- model training;
- benchmark extraction;
- public case study;
- cross-client reuse.

---

# 15. Analyst review material

Internal analyst rationale, alternatives and review controls are governance artifacts.

They are not automatically:

- client content;
- benchmark input;
- training corpus;
- marketing material.

---

# 16. Forecast and seal records

Forecast record may have long-term verification value.

But it remains Deal-confidential unless:

- lawful secondary-use right exists;
- publication/aggregation policy permits.

Seal does not make data public.

---

# 17. Monitoring observations

These are especially sensitive because they may reveal:

- integration problems;
- governance disputes;
- employee departures;
- operational weakness;
- leadership changes;
- internal control actions.

Default:

> Deal-specific.

---

# 18. Intervention records

May reveal:

- management decisions;
- remediation actions;
- governance changes;
- private execution strategy.

Do not publish/reuse automatically.

---

# 19. Re-measurement records

They create longitudinal state history.

This history is commercially valuable.

Commercial value does not itself create reuse right.

---

# 20. Verification outcomes

A verification status may be suitable for future aggregate track-record calculation under `27`.

But client confidentiality/data-rights gate remains.

`Confirmed` does not mean:

`Publishable`.

---

# 21. 42Q / individual-data channel

Strict separate lane.

It must not be treated as ordinary organization evidence for:

- generic benchmark;
- public case study;
- cross-Deal model training;
- employee profiling.

Any secondary use requires dedicated authority beyond this contract.

---

# 22. Technical telemetry

Examples:

- load errors;
- upload failures;
- response latency;
- route events.

Do not contaminate telemetry with:

- raw answers;
- private evidence content;
- document names where unnecessary;
- individual-data values;
- secret invite tokens.

---

# 23. Commercial/account metadata

Account/billing/contact data is not analytical evidence.

Do not use CRM/profile data as evidence for environment/risk inference.

---

# 24. Default rights rule

Until a separate lawful secondary-use authority exists:

> **Deal-specific private/internal evidence is used only to provide the authorized service for that Deal and to maintain the associated audit/history required for that service.**

This is a fail-closed product default, not a substitute for legal terms.

---

# 25. Secondary-use purposes

Potential future purposes must be separately represented:

- `Calibration / R&D`
- `Aggregate benchmark`
- `Product quality / non-regression research`
- `Public case study`
- `Named testimonial/reference`
- `Execution Evidence Pack`
- `Client-requested export`

Do not use one checkbox:

`Allow data use`.

---

# 26. Purpose specificity

Permission should be understandable.

Bad:

`I agree to use of my data.`

Better conceptual separation:

`Use de-identified Deal outcomes for governed model evaluation`

vs:

`Allow this Deal to be considered for a public case study`.

Exact legal copy requires counsel.

---

# 27. Consent is not always the only legal basis

This document does not decide legal basis.

Depending on data/purpose/contract, permission may arise through:

- client agreement;
- contract term;
- separate written approval;
- other lawful basis.

UX should represent the resulting rights state, not invent legal doctrine.

---

# 28. No fake consent checkbox

Do not add:

`I consent`

unless:

- exact scope defined;
- legal copy approved;
- storage/audit exists;
- withdrawal/change behavior defined.

---

# 29. Rights state must be auditable

Target conceptual record:

```text
rightsRecordId
subjectScope
purpose
status
basisType?
sourceDocumentOrGrant?
grantedAt?
expiresAt?
withdrawnAt?
constraints[]
createdAt
updatedAt
```

This is conceptual, not legal schema.

---

# 30. Rights status

Potential system states:

- Not assessed
- Permitted
- Restricted
- Prohibited
- Permission required
- Withdrawn
- Expired

Exact enum requires legal/product design.

Do not invent client-facing semantics prematurely.

---

# 31. No silent inheritance

Permission on Deal A does not apply to Deal B.

Permission on report does not automatically apply to raw evidence.

Permission on aggregate benchmark does not automatically apply to case publication.

---

# 32. Rights attach to scope

Scope can include:

- Deal;
- evidence item;
- forecast;
- longitudinal series;
- aggregate cohort;
- case-study artifact.

Need enough granularity to enforce actual permission.

---

# 33. Cross-Deal reuse firewall

Default:

> no Deal-specific private/internal evidence may be used to influence another client Deal directly.

No:

```text
Client A document
→ Client B Deal recommendation
```

---

# 34. Calibration/R&D is not cross-Deal source injection

Even if evidence may be used in governed R&D:

it does not become an evidence source in another live Deal.

Production Deal claims still require admissible Deal-specific evidence.

---

# 35. Benchmark is aggregate, not lookup

A benchmark product should not allow:

`Show me how Client X performed.`

unless explicit publication rights exist.

Benchmark purpose is governed aggregation/comparison.

---

# 36. Benchmark cannot leak Deal identity

Need re-identification analysis.

A narrow industry, date, geography, Deal value or company pattern can reveal identity even after names are removed.

---

# 37. Anonymization ≠ deleting names

Removing:

- company name;
- respondent name

may still leave identifiable Deal.

Consider combination of:

- transaction date;
- industry;
- geography;
- Deal size;
- distinctive event;
- executive departure;
- unique environment pair;
- quoted language.

---

# 38. Pseudonymization ≠ anonymization

Replacing:

`Acquirer X`

with:

`Company A`

does not automatically make data anonymous.

Do not use those terms interchangeably.

---

# 39. “De-identified” scope must be defined

Avoid blanket claim:

`Your data is anonymized.`

Need exact process and risk boundary.

---

# 40. Legacy source precaution

Repository source material contains an explicit precaution that even an anonymized case study may remain re-identifiable and therefore should require written client approval.

This source is not promoted here into universal legal authority.

But it is directionally consistent with fail-closed publication governance:

> **anonymization alone is insufficient to authorize public case-study publication.**

---

# 41. Public case study firewall

To publish a client Deal as public case study, require separate publication authority.

At minimum product/governance should distinguish:

- internal verified Deal;
- aggregate eligible record;
- anonymized research record;
- public case-study candidate;
- public case-study authorized.

---

# 42. Public case-study authority remains separate

Use the existing public case-study governance from `16`/`17`.

This contract does not weaken:

`Public Case Study Authority = Final Calibrated Replay Only`

for historical cases, nor create automatic publication rights for live client Deals.

---

# 43. Prospective client case publication

A prospective client Deal requires its own future publication contract covering:

- rights;
- confidentiality;
- source provenance;
- forecast/outcome disclosure;
- anonymization if applicable;
- client approval where required.

Not automatic.

---

# 44. Track-record inclusion ≠ named case publication

A forecast may contribute to an aggregate verified corpus while the underlying Deal remains non-public, if data rights and methodology allow.

Separate gates.

---

# 45. Track-record inclusion rights

Before including confidential client outcome in aggregate product performance:

need lawful permission/basis for that purpose.

Do not assume:

`aggregate = permission-free`.

---

# 46. Aggregate statistics can still leak

Small cells can expose participants.

Example:

`1 healthcare Deal in Paraguay, $X value, 2026`.

Need minimum disclosure/cell rules before benchmark/public metrics.

No threshold invented here.

---

# 47. Small-cell suppression

Likely necessary for benchmark/privacy protection.

But exact minimum count must be set by future statistical/privacy policy.

Do not invent `N ≥ 5` or `N ≥ 10` without authority.

---

# 48. Benchmark coverage gate

Commercial North Star explicitly requires that no benchmark/generalization claim exceed actual evidence coverage.

Therefore benchmark must carry:

- cohort definition;
- period;
- sample size;
- included data classes;
- missingness;
- dependence caveats;
- confidence/uncertainty where relevant.

---

# 49. No benchmark theater

Do not show:

`Top quartile`

`Industry average`

`Best in class`

without real cohort/method.

---

# 50. No invented industry norm

Especially in early longitudinal corpus.

---

# 51. Calibration purpose

Potentially lawful longitudinal reuse can improve:

- calibration;
- forecast-rule evaluation;
- evidence sufficiency analysis;
- falsifier quality;
- timing rules;
- non-regression.

It cannot silently become client-facing evidence.

---

# 52. Production freeze remains

Calibration data goes to offline R&D.

Do not self-train/live-retune production model from client data automatically.

---

# 53. No automatic model training claim

Do not say:

`MergeVue learns from every Deal.`

Current governance supports governed longitudinal evidence for future calibration, not uncontrolled online learning.

---

# 54. Model-improvement purpose must be explicit

If future policy permits using client-derived data for model improvement:

represent that purpose separately.

Do not hide inside general service operation.

---

# 55. Provider/API data handling

If external model provider receives evidence:

that is a separate processor/transport/privacy question.

This contract does not assert provider retention/training terms.

Need current provider policy and integration contract.

---

# 56. Evidence locality

Existing project quality-gate guidance treats M&A evidence and internal project material as private and emphasizes evidence locality.

Product architecture should preserve the same conservative direction:

- send only necessary evidence;
- minimize scope;
- do not broadcast across tools.

---

# 57. Data minimization

Collect only what current Deal purpose requires.

Longitudinal potential is not justification for:

> `Collect everything now; it may become useful later.`

---

# 58. Purpose creep prohibition

Do not convert:

`respondent answer for Deal analysis`

into:

`employee benchmark profile`

without new authority.

---

# 59. Person-level purpose firewall

42Q / named-leader data cannot be folded into organization benchmark merely by removing name.

Person-level channel needs separate data-governance authority.

---

# 60. Employment decision firewall

No longitudinal person data should enable automated:

- hiring;
- firing;
- promotion;
- demotion;
- compensation action.

---

# 61. Respondent vs client permission

The engagement client may have rights over the Deal workflow.

An individual respondent may also have separate privacy expectations/rights depending on collection design.

Do not assume client permission alone resolves every respondent-data question.

Legal/privacy policy required.

---

# 62. Respondent notice

Where personal respondent data is collected, UX should provide accurate notice of:

- purpose;
- who receives data;
- whether raw responses are shared;
- applicable retention/use terms.

Exact legal wording is out of scope until approved.

---

# 63. No false anonymity

As in `23`:

Do not promise respondent anonymity unless architecture actually prevents relevant identity access.

---

# 64. No false confidentiality

Do not use:

`100% confidential`

without binding product/security/legal basis.

---

# 65. Retention is currently unresolved

This contract intentionally does **not** invent:

- 30-day retention;
- 90-day retention;
- 7-year audit retention;
- indefinite storage.

Exact retention schedules require:

- operational need;
- contractual requirements;
- applicable law;
- security/privacy policy;
- evidence/audit requirements.

---

# 66. Retention must be purpose-specific

Possible data classes may require different periods:

- raw uploaded document;
- derived evidence metadata;
- released report;
- sealed forecast;
- verification record;
- audit log;
- account metadata.

Do not apply one universal deletion timer automatically.

---

# 67. Audit integrity vs deletion rights

Some records may need preserved audit history even if raw data is removed or access revoked.

Potentially:

- report version identity;
- forecast seal;
- verification status;
- legal/audit event.

Exact lawful treatment requires policy.

---

# 68. Deletion is not one action

Potential concepts:

- delete account;
- remove Deal access;
- delete raw evidence;
- withdraw evidence from future use;
- delete derived analytical object;
- suppress from benchmark;
- revoke publication permission.

These are not automatically equivalent.

---

# 69. No fake “Delete all data” button

Do not offer until backend/policy can satisfy exact semantics.

---

# 70. Removal from service use

If client requests removal of private evidence before it was integrated, behavior may differ from evidence already used in released report.

Need lifecycle policy.

---

# 71. Released report history

If underlying source later removed, historical released report may need:

- preserved audit reference;
- invalidation;
- withdrawal;
- revised version.

Do not silently mutate.

---

# 72. Forecast/verification preservation

Prospective track-record integrity may require preserving locked forecast/verification record even if underlying private evidence access changes.

Need lawful retention design.

No automatic answer here.

---

# 73. Rights withdrawal

If secondary-use permission is withdrawable:

system must know:

- effective date;
- future-use effect;
- existing published/aggregate snapshot treatment;
- audit retention.

Do not promise withdrawal behavior before policy exists.

---

# 74. Rights expiration

Some permissions/contracts may expire.

Need machine-readable expiry where applicable.

---

# 75. Legal hold / dispute

Could override ordinary deletion schedule.

This is a legal/policy capability, not product designer assumption.

Do not create UI unless actual process exists.

---

# 76. Export rights

Client may need export of Deal history.

Exact entitlement/format not defined here.

Future export should respect:

- user permissions;
- third-party/respondent privacy;
- restricted evidence;
- internal analyst notes;
- proprietary technical fields.

---

# 77. Client export ≠ full internal database dump

Potential export can include client-authorized:

- Deal report history;
- evidence inventory;
- watchpoints;
- controls;
- verification records.

It need not include:

- internal model weights;
- hidden type codes;
- analyst private notes;
- system secrets.

---

# 78. Execution Evidence Pack

Commercial North Star positions this as later-stage target:

```text
entry baseline
→ forecast
→ controls
→ observations
→ re-measurement
→ leadership / governance evolution
→ realized vs predicted evidence
```

It must **not** be built before:

- longitudinal evidence model;
- data-rights boundaries.

This document establishes only the latter boundary at target-contract level.

---

# 79. Execution Evidence Pack audience

Potential future audience:

- future buyer;
- board;
- seller;
- diligence team;
- advisor.

But disclosure rights differ.

Do not assume current client may share everything with future third party.

---

# 80. Third-party disclosure gate

Before pack disclosure:

must evaluate:

- client authorization;
- respondent/private-evidence restrictions;
- individual-data restrictions;
- source licensing;
- confidentiality;
- report rights.

---

# 81. Execution Evidence Pack must be derived

It should not become a raw evidence-room dump.

Use governed, client-authorized evidence/history.

---

# 82. Raw private evidence may be excluded

A pack may include:

- conclusions;
- traceable evidence references;
- verification history;

while withholding raw documents if rights do not permit.

---

# 83. Benchmark and Execution Pack are different purposes

Benchmark:

> aggregate cross-Deal learning/comparison.

Execution Pack:

> Deal-specific longitudinal evidence asset for future transaction/diligence.

No rights inheritance between them.

---

# 84. Case study and Execution Pack are different

Case study = publication/communication.

Execution Pack = controlled Deal artifact.

---

# 85. Model improvement and benchmark are different

Model-improvement data may not be exposed as benchmark.

Benchmark participation may not authorize raw model training.

---

# 86. Rights matrix — target conceptual model

| Data class | Deal service | Client report | Cross-Deal R&D | Benchmark | Public case | Execution Pack |
|---|---:|---:|---:|---:|---:|---:|
| Public evidence | according to source rights | yes if admissible | separately governed | separately governed | public-source rules | if relevant |
| Respondent metadata | yes | bounded | permission/policy required | permission/policy required | normally no/raw prohibited | permission review |
| Respondent answers | yes | summarized/bounded | permission/policy required | permission/policy required | no raw by default | permission review |
| Private documents | yes | bounded/referenced | separate authority | separate authority | no by default | permission review |
| Analyst rationale | internal | not by default | internal quality use only if authorized | no by default | no | usually excluded |
| Forecast | yes | yes | governed R&D | possible aggregate with authority | separate publication gate | likely yes if authorized |
| Monitoring observations | yes | yes/bounded | separate authority | separate authority | no by default | permission review |
| Verification outcome | yes | yes | governed R&D | possible with authority | separate gate | likely yes if authorized |
| 42Q individual data | restricted | behavioral output only | separate dedicated authority | no by default | prohibited by default | heavily restricted |

This matrix expresses fail-closed product defaults, not contractual legal rights.

---

# 87. Rights enforcement must be server-side

No:

- hidden checkbox only;
- disabled download button only;
- frontend filter as permission.

Server enforces:

- read;
- export;
- secondary use;
- publication eligibility where applicable.

---

# 88. UI should explain why action is unavailable

Client-safe:

`This evidence is restricted to the current deal.`

Not:

`RBAC policy 7.3 denied.`

---

# 89. Rights state not visible everywhere

Ordinary Deal Workspace should not become legal-policy dashboard.

Show rights controls where relevant:

- sharing;
- export;
- case publication;
- benchmark participation;
- data-use preferences if product supports.

---

# 90. No universal “Data settings” page yet

Do not create until actual controls exist.

---

# 91. Account-level vs Deal-level choices

Some rights may be:

- account-wide;
- organization-wide;
- Deal-specific;
- evidence-item-specific.

Do not choose scope just for UI simplicity.

---

# 92. Deal-specific permission is safest default

Especially:

- private evidence;
- monitoring data;
- public case-study consideration.

---

# 93. Organization-wide benchmark permission

Could be future enterprise feature.

Not assumed.

---

# 94. User who uploads may not have authority to grant secondary use

Uploader role ≠ legal permission authority.

Do not ask arbitrary respondent/uploader to consent on behalf of client organization.

---

# 95. Permission authority identity

Future system may need to record who had authority to grant specific rights.

Do not invent role names here.

---

# 96. Respondent cannot grant client case publication alone

Even if respondent consents to answer use.

Different scope.

---

# 97. Analyst cannot grant publication rights

Internal reviewer does not own client data rights.

---

# 98. Admin cannot override legal restriction casually

Any exceptional override needs governed authority/audit.

---

# 99. Permission provenance

Store reference to:

- agreement;
- approved workflow;
- explicit grant;
- policy basis

where applicable.

Do not store only boolean `consent=true` with no scope/source.

---

# 100. Permission versioning

If terms/purpose change:

new rights version.

Do not silently expand old permission.

---

# 101. “Improve MergeVue” is too broad

A secondary-use statement should distinguish:

- bug/quality telemetry;
- methodological R&D;
- calibration;
- aggregate benchmarking;
- generative-model training if ever applicable.

---

# 102. Product-quality telemetry

Using non-content technical events to improve reliability is different from using Deal evidence to improve method.

Keep separate.

---

# 103. Derived features

Even if raw data not reused, derived features may remain sensitive/re-identifiable.

Example:

- environment pair;
- risk signature;
- role dependency;
- rare outcome pattern.

Do not assume derived = anonymous.

---

# 104. Embeddings/vectors

If future product creates embeddings of private documents:

they remain derived private data unless policy proves otherwise.

Do not treat embeddings as anonymized automatically.

---

# 105. Model weights

Whether training on client data embeds information into model is complex.

This contract intentionally does not authorize it.

---

# 106. Prompt/log data

Internal prompts containing Deal evidence are evidence-bearing data.

Do not treat logs as harmless telemetry.

---

# 107. Debug logs

Must avoid:

- raw private document text;
- 42Q content;
- respondent answers;
- invite secrets.

---

# 108. Error reports

Sanitize sensitive context.

---

# 109. Backups

Retention/deletion must eventually account for backups.

Do not promise instant universal erasure if architecture cannot do it.

---

# 110. Cache

Same.

---

# 111. Search indexes / embeddings

Same.

Deletion design must address derived indexes if they contain restricted content.

---

# 112. Generated reports

Reports are derived artifacts.

Deleting raw evidence may not automatically delete released reports.

Policy required.

---

# 113. Exported client files

Once client downloads PDF, MergeVue cannot control their external copies.

Do not imply otherwise.

---

# 114. Revoking access vs recalling copies

Different.

---

# 115. Public sources in exports

Respect citation/source attribution.

---

# 116. Source licensing

Not all publicly accessible content permits unrestricted republication.

Use bounded citation/excerpt rules.

---

# 117. Publication redaction

If future public artifact uses client data:

redaction is not equivalent to permission.

Both may be required.

---

# 118. Re-identification review

Before anonymized publication/benchmark disclosure, assess whether combinations of fields re-identify Deal/person.

No automatic `Remove names → safe` pipeline.

---

# 119. Rare-category suppression

Potential future privacy control.

Exact rule requires policy/statistics.

---

# 120. Quote risk

Distinctive internal phrase can re-identify source even without names.

Public case/benchmark should avoid verbatim private quotes unless explicitly authorized.

---

# 121. Dates as identifiers

Exact dates can re-identify transaction.

Aggregation may need date coarsening if lawful/appropriate.

Do not do silently where chronology matters analytically.

---

# 122. Deal value as identifier

Same.

---

# 123. Industry/geography as identifiers

Same in small cohorts.

---

# 124. Environment pair as potentially distinctive

Could contribute to re-identification in small corpus.

Treat as data, not harmless taxonomy.

---

# 125. Verification outcome as sensitive

A falsified/confirmed forecast may reveal confidential integration outcome.

No automatic public track record row with identifiable Deal.

---

# 126. Aggregate track record

If lawful:

publish cohort-level data without exposing individual Deal unless separate publication authority.

---

# 127. Denominator privacy

Even numerator/denominator can reveal participants in tiny cohort.

Need disclosure review.

---

# 128. Benchmark cohort membership may be confidential

Do not list member companies automatically.

---

# 129. Client opt-out / exclusion

If future program permits exclusion from secondary-use cohort:

must be enforceable in data pipeline, not marketing preference only.

Exact policy not defined here.

---

# 130. Benchmark snapshot lineage

Need record of which permissioned/eligible data records contributed.

For audit, not public disclosure.

---

# 131. Revocation after benchmark snapshot

Complex policy issue.

Need define whether future snapshots exclude record and how published historical snapshots are handled.

Do not promise behavior yet.

---

# 132. R&D dataset lineage

Need:

- source Deal IDs internally;
- rights eligibility;
- extraction version;
- de-identification transformation;
- dataset version.

---

# 133. Dataset freeze

Blind evaluation/calibration dataset should be version-frozen.

Do not mutate silently.

---

# 134. Train/test leakage

Longitudinal Deal reused in R&D can contaminate held-out evaluation.

Need dataset partition governance.

This is methodology/data-science control, not client UI.

---

# 135. Client-specific model adaptation

Not authorized by this contract.

Do not create silent personalized model trained on one client's evidence.

---

# 136. Organization-level benchmark

Could eventually be permissioned enterprise feature.

Requires cohort sufficiency and data rights.

---

# 137. External research publication

Separate purpose again.

Academic paper/public research using client-derived data requires distinct authority.

---

# 138. Investor materials

Do not use named/anonymized client data as investor proof without appropriate publication/use rights.

---

# 139. Sales demos

Do not use a client's private Deal as demo dataset.

Use synthetic/demo or publicly authorized case.

---

# 140. Internal QA fixtures

Prefer synthetic/authorized fixtures.

Do not copy raw client private evidence into test fixtures casually.

---

# 141. Support/debug access

Operational support may require data access.

Need role/access audit.

Do not expose all Deals to all internal staff by default.

---

# 142. Least privilege

Target principle:

> person/system sees only data needed for current authorized function.

---

# 143. Analyst access

Deal-scoped/review-scoped.

No global browsing unless job requires and permission exists.

---

# 144. Model provider access

Minimize payload.

No full evidence room if only small excerpt/context required.

---

# 145. Processor substitution

Changing model/storage provider may change data-handling implications.

Needs review.

Do not assume provider swap is data-rights neutral.

---

# 146. Data residency

Not defined here.

No regional-hosting claims until infrastructure/policy real.

---

# 147. Encryption

Not defined here.

Do not make marketing claims beyond actual security architecture.

---

# 148. Security vs data rights

Encryption protects access.

It does not authorize reuse.

Different axes.

---

# 149. Audit logs

Material rights actions should be logged:

- permission created;
- changed;
- withdrawn;
- publication approved;
- export generated;
- benchmark inclusion decision.

Exact retention separate.

---

# 150. No rights state in local browser only

Server-authoritative.

---

# 151. Rights check before secondary processing

Any cross-Deal/R&D/benchmark/publication job should evaluate rights before data enters pipeline.

Not after output generated.

---

# 152. Fail closed

If rights state missing/ambiguous:

> do not use data for secondary purpose.

---

# 153. Missing permission ≠ denial of core service

A client should still receive contracted Deal analysis even if they decline secondary-use/publication permission, unless contract explicitly says otherwise.

Do not coerce research permission through core-service access.

---

# 154. No dark patterns

No:

- pre-checked benchmark participation;
- “Accept all to continue” for unrelated secondary use;
- hidden publication clause in upload step;
- confusing double negatives.

Exact legal UI still requires policy approval.

---

# 155. Value exchange

If asking for secondary-use permission:

explain what it enables.

Do not overpromise personalized benefit unless true.

---

# 156. Permission timing

Do not request broad future rights at first anonymous public analysis.

Trust escalation principle applies.

---

# 157. First appropriate moment

Potentially after:

- paid engagement established;
- specific longitudinal feature activated;
- client understands data generated.

Not decided universally here.

---

# 158. Public analysis stage

No secondary-use private-data question because no private client data exists yet.

---

# 159. Private evidence stage

Request only rights needed to provide that Deal analysis unless separate purpose genuinely necessary.

---

# 160. Monitor stage

Longitudinal secondary-use request can be explained more concretely because client sees resulting history.

Still optional/separate unless contract defines otherwise.

---

# 161. Case-study request timing

Ask only when there is actual candidate case worth publishing.

Do not demand blanket case-study rights during signup.

---

# 162. Benchmark request timing

Can be Deal/organization program decision.

Do not bury inside respondent questionnaire.

---

# 163. Respondent should not see benchmark permission intended for client organization

Separate actors.

---

# 164. Rights dashboard future

If actual controls become numerous, a Deal-level `Data use` or `Data rights` surface may be justified.

Not current route authorization.

---

# 165. Minimum first-version rights UI

Could be contextual only:

- evidence restricted/private badge where necessary;
- export/share availability;
- case-publication permission state if relevant.

No legal-control center required initially.

---

# 166. Client-facing labels

Potential exact UI concepts, subject to policy:

- `Restricted to this deal`
- `Not approved for public use`
- `Public case study permission required`
- `Aggregate research use: not enabled`

Do not ship until rights semantics/back-end real.

---

# 167. No “Anonymous” badge without anonymization standard

Prefer:

`De-identified dataset` only if process defined.

Even that may need caveat.

---

# 168. Internal rights labels

Can be more technical.

But must map to enforced policy.

---

# 169. Data-access card in Deal Workspace

Not primary dashboard element.

Could appear under settings/evidence details only where relevant.

---

# 170. Public case candidate state

Potential internal state:

`Publication permission required`.

No auto-publish.

---

# 171. Benchmark eligibility state

Separate from verification eligibility.

A forecast can be statistically eligible but rights-ineligible for aggregate use.

---

# 172. Two eligibility axes

## Methodological eligibility

Does record meet protocol?

## Data-rights eligibility

May record be used for that secondary purpose?

Need both.

---

# 173. Do not conflate

`Verified` ≠ `benchmark-eligible`.

`Benchmark-eligible` ≠ `publishable`.

---

# 174. Track-record calculator

Must filter by both:

- methodological eligibility;
- rights eligibility

for any published aggregate derived from confidential client data.

---

# 175. Internal methodological R&D dataset

May have a different rights eligibility scope than public benchmark.

Keep separate.

---

# 176. Synthetic data

Synthetic fixtures can support engineering tests.

They are not empirical evidence.

Do not mix into calibration/benchmark corpus.

---

# 177. Public historical corpus

Historical public-source cases are governed separately.

They do not inherit private-client rights model.

Still follow publication/source authority.

---

# 178. Live client Deal corpus

Separate from historical corpus.

Do not mix rows silently.

---

# 179. Benchmark provenance

Need know whether aggregate derives from:

- historical public cases;
- prospective client Deals;
- blind held-out cases;
- mixed cohort.

Disclose appropriately.

---

# 180. No cross-population generalization

A benchmark from one population cannot be marketed as universal M&A norm without evidence.

---

# 181. Data-quality gate

Secondary-use record should retain:

- evidence quality;
- missingness;
- verification state;
- method version.

Do not strip context just to increase N.

---

# 182. Rights quality is also data quality

Record with unknown rights cannot enter secondary-use dataset.

---

# 183. Dataset manifest

Future R&D/benchmark dataset should have machine-readable manifest:

```text
datasetId
purpose
version
createdAt
eligibilityRuleVersion
rightsPolicyVersion
recordIds[]
transformations[]
cohortDefinition
```

---

# 184. De-identification transformation record

If applied:

record what fields:

- removed;
- generalized;
- transformed.

Do not lose auditability.

---

# 185. Raw-to-derived linkage

Internal secure mapping may be required for audit/removal.

Access restricted.

---

# 186. No reversible public pseudonym key

Never expose mapping.

---

# 187. Benchmark output review

Before publication:

- statistical review;
- re-identification review;
- claims review;
- rights review.

No single product manager “publish” switch.

---

# 188. Public case output review

Separate publication gate.

---

# 189. Client-specific export review

Different gate.

---

# 190. Retention policy versioning

When future retention policy exists:

store applicable version/effective date.

Do not reinterpret old records silently.

---

# 191. Rights-policy versioning

Same.

---

# 192. Terms update

New terms do not automatically expand old collected-data rights unless legally/product-approved.

Do not assume.

---

# 193. Legacy data migration

For records collected before rights system exists:

status should be:

`Permission not established for secondary use`

unless historical authority proves otherwise.

Do not grandfather automatically.

---

# 194. Legacy client data

Fail closed for:

- public case publication;
- benchmark;
- model-improvement corpus.

Until rights resolved.

---

# 195. Public records exception

Public-source material can potentially be reused according to source rights/provenance without client permission.

But Deal-specific private interpretation remains separate.

---

# 196. Derived anonymized statistics from public data

Still require methodological integrity.

Data rights are not only concern.

---

# 197. Data rights do not validate a claim

Permission to use data does not mean data supports inference.

---

# 198. Evidence validity does not create permission

Symmetrically, valid evidence may remain rights-restricted.

---

# 199. Two independent gates

Every secondary use passes:

```text
EVIDENCE / METHODOLOGY GATE
AND
DATA-RIGHTS / PRIVACY GATE
```

Both required.

---

# 200. Security is third gate

And production handling also requires:

```text
SECURITY / ACCESS GATE
```

No permission if storage/access unsafe.

---

# 201. Three-gate model

```text
May we use it?
→ rights/privacy

Does it support the claim?
→ methodology/evidence

Can we handle it safely?
→ security/access
```

All independent.

---

# 202. Уровень доверия

## Текущий уровень доверия

Authenticated paid Deal with potentially sensitive longitudinal evidence accumulated across time.

## Уже разрешённые данные

Only data required for the authorized Deal service and explicitly enabled evidence channels:

- existing Deal evidence;
- monitoring observations;
- intervention records;
- re-measurement;
- verification data.

## Данные, которые нельзя автоматически использовать шире

- raw respondent answers;
- private documents;
- analyst rationale;
- 42Q individual data;
- longitudinal observations;
- verification outcomes;
- derived Deal signatures

for:

- another Deal;
- public benchmark;
- public case study;
- external research;
- model improvement;
- future third-party diligence.

## Следующая эскалация доверия

Only when a specific secondary purpose is proposed and its rights/policy are ready.

## Ценность до эскалации

The client already receives the full Deal-specific product value they purchased.

Secondary-use permission is not required merely to unlock already-contracted analysis unless governing contract explicitly states otherwise.

---

# 203. Data-rights UI must follow progressive disclosure

Do not ask broad rights at signup.

Ask at the point of real purpose.

---

# 204. No secondary-use hostage pattern

Do not:

`Allow benchmark use to download your report.`

unless benchmark use is genuinely part of contract/consideration and legally approved.

---

# 205. Clear refusal path

Where optional permission is requested, declining should have predictable bounded effect.

Example:

`Your deal will not be considered for public case-study use.`

Not vague punishment.

---

# 206. Case-study permission UI target

If future:

```text
Public case-study permission
Not granted

This does not affect your Deal analysis or report.
```

Exact legal copy pending.

---

# 207. Benchmark/R&D UI target

If future policy supports opt-in/out:

explain:

- aggregate purpose;
- whether Deal identity removed;
- whether raw evidence used;
- whether public disclosure possible;
- withdrawal behavior.

No generic checkbox.

---

# 208. Organization admin vs Deal user

Permission control may need authorized organization representative.

Do not give every collaborator legal-use controls.

---

# 209. Rights control role

Separate future permission model.

No invented `Data Owner` role yet.

---

# 210. Internal review role

Privacy/data-rights review may be needed for publication/benchmark.

Do not invent job title.

---

# 211. Rights conflict

If two grants conflict:

fail closed to more restrictive use until resolved.

---

# 212. Parent/child scope conflicts

Organization-wide permission should not silently override evidence-item restriction if policy says item is more restrictive.

Need precedence rules.

---

# 213. Most-restrictive default

Until precedence contract exists:

prefer most restrictive applicable state for secondary use.

---

# 214. Confidentiality flags from source

If source document has explicit restriction:

retain metadata.

Do not assume client upload removes restriction.

---

# 215. Third-party material

Client may upload document authored by another party.

Permission to analyze within Deal may differ from permission to republish.

---

# 216. Public quotes from private documents

Prohibited by default.

Separate explicit authority required.

---

# 217. Source attribution in internal R&D

Can preserve secure lineage without public attribution.

---

# 218. Data contamination controls

A rights-ineligible record must not leak into:

- training dataset;
- benchmark cache;
- public report template;
- demo fixture.

Need technical enforcement/tests.

---

# 219. Dataset build is explicit operation

Do not query entire production DB ad hoc and call it calibration corpus.

Build governed dataset with manifest and eligibility filters.

---

# 220. Dataset access

Restricted to authorized R&D/audit roles.

No client access by default.

---

# 221. Research environment separation

Prefer separation of production client evidence from R&D workspace/dataset.

Exact infrastructure decision later.

---

# 222. No direct production mutation from R&D

Reinforces production freeze.

---

# 223. Benchmark generation should not need raw document access when derived fields suffice

Data minimization.

---

# 224. Derived fields must remain auditable

Know how computed.

---

# 225. Rights-aware aggregation

Aggregation pipeline should use only records whose rights permit that exact aggregate purpose.

---

# 226. Rights-aware export

Execution Pack/export filters restricted records appropriately.

---

# 227. Rights-aware search

Internal global search should not expose restricted Deal/evidence to unauthorized staff.

---

# 228. Rights-aware backups

Future deletion/withdrawal policy must consider backups.

---

# 229. Rights-aware AI retrieval

An assistant/agent should retrieve only evidence permitted for current Deal/purpose.

No global semantic search across all client Deals unless explicitly governed.

---

# 230. No cross-client RAG by default

Absolute target default.

---

# 231. Public-source knowledge base exception

A separately curated public-source corpus can be reused across Deals if source rights/methodology permit.

Keep physically/logically separate from private client corpus where practical.

---

# 232. Anonymized benchmark corpus separation

Future de-identified/permissioned benchmark corpus should be a derived governed dataset, not direct production-table browsing.

---

# 233. Public case-study corpus separation

Only publication-authorized cases.

---

# 234. Execution Pack generation uses Deal-local records

Not cross-Deal benchmark data unless explicitly included as separate contextual benchmark.

---

# 235. Benchmark context in Execution Pack

If future:

must be clearly separate from client's own evidence.

---

# 236. “Your data helped improve MergeVue” claim

Do not state unless system can prove eligible use actually occurred.

---

# 237. Permission audit transparency

Potential client future feature:

`How this Deal's data may be used`.

Only once rights model real.

---

# 238. No fake transparency center

A static policy page without enforcement is insufficient as product control.

---

# 239. Policy link still needed

Legal privacy/terms pages are separate deliverables and should eventually be linked appropriately.

This design corpus does not author legal text.

---

# 240. Live/main audit finding

Current repository search did not establish a dedicated production customer-facing data-rights/retention/secondary-use surface.

Therefore:

- do not claim such controls exist;
- do not create dead settings routes;
- perform final LIVE + route audit before implementation.

---

# 241. Visual direction

If rights controls appear:

use ordinary MergeVue work-surface grammar.

No:

- scary legal wall;
- consent pop-up spam;
- green privacy theater badges.

---

# 242. Copy tone

Plain operational language.

Examples:

`Restricted to this deal`

`Public use is not approved`

`Permission is required before this deal can be used as a public case study`

Avoid:

`Your privacy is our top priority` as untestable filler.

---

# 243. Accessibility

Rights/permission controls must meet WCAG 2.2 AA target.

Need:

- explicit labels;
- no prechecked unrelated optional consent;
- keyboard operation;
- clear consequences;
- accessible policy links;
- status in text;
- no color-only restriction state.

---

# 244. Mobile

Permission detail must remain understandable without hidden tooltips.

No dense legal matrix as primary mobile UI.

---

# 245. Auditability

Internal system should answer:

> Why was this record allowed into this dataset/publication/export?

Need:

- rights state;
- policy version;
- eligibility decision;
- source grant/reference where applicable.

---

# 246. Reproducibility

Given same rights/policy state, dataset build should be reproducible.

---

# 247. Rights regression tests

Tests should prove:

- Deal-only evidence cannot enter cross-Deal dataset;
- publication-restricted evidence cannot enter public case;
- 42Q cannot leak to org benchmark;
- withdrawn permission blocks future eligible builds where policy requires;
- missing rights fail closed;
- public source lane remains distinct;
- respondent raw answer not exposed by aggregate API;
- restricted private document not exposed by export.

---

# 248. Re-identification tests

Before public benchmark/case pipeline:

adversarially test whether output can identify:

- company;
- transaction;
- respondent;
- named leader.

Exact privacy methodology later.

---

# 249. No arbitrary anonymization score

Do not invent:

`Anonymity score 92%`.

---

# 250. No privacy claim from hashing IDs

Hashed Deal ID is still linkable identifier in many contexts.

Not anonymization proof.

---

# 251. Data-rights readiness gate for Stage I

Before data/calibration moat is activated with client longitudinal data:

require:

- rights-purpose model;
- server enforcement;
- dataset lineage;
- de-identification/permission process;
- privacy review;
- R&D access controls;
- production/R&D separation;
- methodology eligibility;
- no live retuning.

---

# 252. Benchmark readiness gate

Additionally:

- cohort definition;
- minimum disclosure/privacy rules;
- re-identification review;
- statistical sufficiency;
- claim governance;
- public/client presentation contract.

---

# 253. Public case readiness gate

Additionally:

- publication authority;
- client permission/right where required;
- source provenance;
- redaction/de-identification where used;
- claims review;
- no private evidence leakage.

---

# 254. Execution Evidence Pack readiness gate

Additionally:

- Deal-local longitudinal model complete;
- disclosure audience defined;
- export rights;
- third-party restrictions;
- respondent/42Q filtering;
- immutable history;
- source/access policy.

---

# 255. Existing asset decision matrix

| Existing source / capability | Решение |
|---|---|
| Commercial North Star Stage I | **KEEP AS STRATEGIC DATA/CALIBRATION DIRECTION** |
| `lawfully collected, governed, appropriately anonymized or permissioned` rule | **KEEP ABSOLUTELY** |
| `No benchmark/generalization beyond evidence coverage` | **KEEP ABSOLUTELY** |
| Stage J Execution Evidence Pack | **KEEP AS LATER TARGET ONLY** |
| `Do not build before longitudinal model and data-rights boundaries exist` | **KEEP ABSOLUTELY** |
| Deal-specific evidence model | **KEEP** |
| Respondent provenance | **KEEP** |
| Private evidence access boundary | **KEEP** |
| 42Q separate lane | **KEEP ABSOLUTELY** |
| Client anonymized case-study caution in legacy source | **USE AS CONSERVATIVE PRECEDENT, NOT UNIVERSAL LEGAL AUTHORITY** |
| Dedicated retention policy | **NOT CURRENTLY ESTABLISHED — DO NOT INVENT** |
| Automatic cross-Deal reuse | **FORBIDDEN BY DEFAULT** |
| Automatic benchmark inclusion | **FORBIDDEN BY DEFAULT** |
| Automatic public case publication | **FORBIDDEN** |
| Automatic model-training use | **NOT AUTHORIZED** |

---

# 256. Что мы сознательно НЕ меняем

1. Evidence remains Deal-centered.
2. Public/private/respondent/42Q lanes remain distinct.
3. Client report authority remains evidence-bound.
4. Forecast/verification history remains versioned.
5. Public case-study governance remains separate.
6. Production model remains frozen from automatic online learning.
7. Historical corpus remains separate from private live-client corpus.
8. 42Q does not become public/personality benchmark.
9. Access control remains server-authoritative target.
10. No claim may exceed actual evidence coverage.

---

# 257. Что меняется и почему

Format for implementation review:

```text
CURRENT
→ TARGET
→ REASON
→ SEMANTIC / RIGHTS DELTA
→ AUTHORITY
```

Example:

```text
Deal-specific longitudinal records with no explicit secondary-use field
→ purpose-scoped rights/eligibility metadata
→ future calibration/benchmark/publication requires enforceable data-rights boundary
→ no analytical semantic change; adds use-governance state
→ Commercial North Star Stage I / Stage J boundary
```

---

# 258. Target conceptual rights architecture

```text
DATA OBJECT
→ PRIMARY PURPOSE
→ ACCESS POLICY
→ SECONDARY-USE ELIGIBILITY
→ TRANSFORMATION / DE-IDENTIFICATION IF APPLICABLE
→ METHODOLOGY ELIGIBILITY
→ SECURITY GATE
→ ALLOWED OUTPUT
```

No secondary path skips these gates.

---

# 259. Minimal target data model additions

Conceptual only:

```text
DataUseRight
  id
  subjectType
  subjectId
  purpose
  status
  scope
  authorityRef?
  effectiveAt?
  expiresAt?
  withdrawnAt?
  policyVersion

SecondaryUseEligibility
  subjectId
  purpose
  rightsEligible
  methodologyEligible
  privacyEligible
  securityEligible
  decision
  reason
  evaluatedAt
```

Not final database schema.

---

# 260. No universal `consent` boolean

One boolean cannot represent:

- analysis;
- R&D;
- benchmark;
- publication;
- export.

---

# 261. Data lifecycle state is separate from analytical state

Evidence can be:

`Verified`

analytically, while:

`Restricted to this Deal`

for rights.

Do not combine.

---

# 262. Data rights is separate from evidence confidence

A low-confidence item can still be legally restricted.

A high-confidence item can still be ineligible for reuse.

---

# 263. Data rights is separate from review status

Same.

---

# 264. Data rights is separate from publication status

Same.

---

# 265. Four independent axes

At minimum:

1. Evidence/analytical state
2. Access/security state
3. Rights/purpose state
4. Publication/secondary-use eligibility

No one `Approved` flag.

---

# 266. No global “approved” badge

Must say approved for what.

---

# 267. Failure modes to prevent

- private evidence appears in demo;
- case-study candidate published because names removed;
- respondent answer becomes benchmark row automatically;
- 42Q vector enters general model-training dataset;
- old client Deal included because no rights field existed;
- benchmark API exposes tiny identifiable cohort;
- deleted source remains in embeddings/search index unnoticed;
- new terms silently broaden legacy-data use;
- client export contains internal analyst note;
- future buyer receives evidence current client did not authorize for disclosure.

---

# 268. Anti-proliferation

Do not create separate rights engine for:

- benchmark;
- case study;
- R&D;
- export.

Prefer one purpose-scoped rights model plus purpose-specific eligibility rules.

---

# 269. Existing-first engineering rule

Before implementing:

inspect:

- current Deal access model;
- evidence permissions;
- account/org model when available;
- report sharing;
- 42Q storage;
- audit logs;
- existing privacy/legal pages.

Extend existing capabilities where possible.

---

# 270. No new route without route decision

Potential future surfaces:

- Deal data-use details;
- organization data settings;
- publication permission dialog.

Not authorized by this document.

---

# 271. Legal content ownership

Final:

- privacy notice;
- terms;
- consent language;
- DPA language;
- retention schedule;
- jurisdictional rights

must be written/approved through proper legal process.

This corpus defines product behavior boundaries only.

---

# 272. Acceptance criteria

Longitudinal evidence/data-rights architecture passes only if:

1. data is classified by source/type;
2. primary purpose is known;
3. access and reuse rights are separate;
4. reuse and publication rights are separate;
5. no legal ownership claim is invented;
6. private/internal evidence is Deal-specific by default;
7. no silent cross-Deal source reuse;
8. R&D data never becomes live Deal evidence automatically;
9. benchmark is aggregate, not client lookup;
10. benchmark cohort membership can remain confidential;
11. anonymization is not equated with name removal;
12. pseudonymization is not called anonymization;
13. re-identification risk is assessed before publication/benchmark;
14. no public case from anonymization alone;
15. case publication uses separate authority;
16. verified forecast does not auto-become public;
17. verification eligibility distinct from rights eligibility;
18. track-record calculator respects rights eligibility where client-private data used;
19. no example/test records enter corpus;
20. no secondary-use corpus from records with unknown rights;
21. no auto model training from client Deal data;
22. no online self-retuning;
23. R&D is offline/governed;
24. 42Q remains separate;
25. no 42Q benchmark by default;
26. no person-level public case from 42Q;
27. no automated employment decision;
28. uploader cannot automatically grant organization-wide rights;
29. respondent permission not treated as client publication permission;
30. analyst cannot grant publication rights;
31. permission scope/version retained;
32. changed purpose requires new authority evaluation;
33. no one generic `consent=true` field;
34. no prechecked unrelated optional permission;
35. declining optional secondary use does not silently block core Deal service;
36. retention period not invented;
37. deletion semantics not invented;
38. audit-retention vs deletion conflict handled by future policy;
39. backups/indexes/embeddings considered in deletion design;
40. raw private content excluded from generic telemetry;
41. prompt/logs treated as evidence-bearing where applicable;
42. source licensing remains relevant for public evidence;
43. raw private quotes prohibited from public output by default;
44. small-cell privacy considered;
45. no invented benchmark minimum N;
46. no invented privacy score;
47. no privacy claim from hashed IDs;
48. benchmark claim does not exceed evidence coverage;
49. methodological and rights gates both pass;
50. security/access gate also passes;
51. rights checks occur before secondary processing;
52. missing rights fail closed;
53. rights state server-authoritative;
54. exports filter restricted fields;
55. execution pack has separate disclosure gate;
56. execution pack not built before rights model exists;
57. future buyer does not receive raw data automatically;
58. client report and data-rights layers stay conceptually separate;
59. rights metadata does not change analytical result;
60. longitudinal history remains immutable/versioned;
61. current/live Deal evidence not silently mixed with historical corpus;
62. benchmark provenance records population/source;
63. R&D dataset has manifest/version;
64. de-identification transformation is auditable;
65. dataset partition prevents evaluation leakage;
66. production and R&D are separated appropriately;
67. no cross-client RAG by default;
68. public-source corpus remains separate from private corpus;
69. public case-study corpus contains only authorized cases;
70. client rights actions are auditable;
71. rights-policy versions are stored when policy exists;
72. legacy data does not gain new rights automatically;
73. future terms changes do not silently expand legacy-use scope;
74. exact client-facing permission copy gets legal approval;
75. WCAG 2.2 AA target maintained;
76. no dark-pattern permission UX;
77. trust escalation happens only at real secondary-purpose moment;
78. all product claims about privacy/use match actual backend enforcement;
79. no fake Data Settings surface before controls exist;
80. final LIVE/route/security audit occurs before implementation release.

---

# 273. Финальный принцип

> **Longitudinal evidence can become one of MergeVue's strongest defensibility assets only if its provenance, purpose and rights are as disciplined as its analytical semantics.**

> **Data collected for one Deal is not automatically a training corpus, a benchmark, a case study or an asset for the next Deal. Each secondary purpose requires its own lawful and governable path.**

> **Anonymization reduces disclosure risk; it does not manufacture permission. Permission allows a use; it does not validate a claim. Evidence can support a claim; that does not make the evidence publishable. These boundaries must remain independent.**
