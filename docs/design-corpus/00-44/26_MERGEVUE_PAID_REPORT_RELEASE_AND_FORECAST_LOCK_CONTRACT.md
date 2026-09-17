# 26. Контракт платного отчёта, release state и фиксации прогноза MergeVue

**Статус документа:** управляющий target-contract / paid client report, forecast locking and sealing  
**Файл:** `26_MERGEVUE_PAID_REPORT_RELEASE_AND_FORECAST_LOCK_CONTRACT.md`  
**Версия:** 1.0  
**Дата:** 16 сентября 2026 года  
**Язык документации:** русский  
**Язык клиентского интерфейса:** только American English  
**Рынок первой версии:** США  
**Входной control layer:** `25_MERGEVUE_ANALYST_REVIEW_CONTRADICTION_AND_RELEASE_GATE_CONTRACT.md`  
**Связанные client-report contracts:** `19_MERGEVUE_PUBLIC_ANALYSIS_RESULT_CONTRACT.md`, `20_MERGEVUE_DECISION_GAP_AND_DEEPER_DILIGENCE_TRANSITION_CONTRACT.md`  
**Главный принцип:** release отчёта, lock прогноза, cryptographic seal и последующая verification — четыре разных события, которые нельзя объединять одним статусом  
**Ключевые инварианты:** `REPORT RELEASE ≠ FORECAST LOCK`, `FORECAST LOCK ≠ SEAL`, `SEAL ≠ VERIFICATION`, `EXACT CLAIMS MUST BE FROZEN`, `NO SILENT EDIT AFTER LOCK`, `SAME CANONICAL REPORT BLOCKS`, `FAIL CLOSED`, `NO CRYPTOGRAPHIC OVERCLAIM`

---

# 0. Назначение

Этот документ определяет:

1. что получает клиент после lawful paid-release gate;
2. как платный report продолжает canonical report structure из public layer;
3. когда report считается released;
4. когда отдельный forecast может считаться locked;
5. когда forecast может считаться sealed;
6. какие данные должны входить в seal;
7. какие client-facing labels допустимы;
8. что запрещено редактировать после lock/seal;
9. как новая evidence создаёт новую version вместо переписывания прошлого;
10. как подготовить subsequent outcome verification без hindsight contamination.

---

# 1. Четыре разных состояния

Absolute distinction:

## A. Report released

Клиенту разрешён конкретный report version.

## B. Forecast locked

Точный prediction claim зафиксирован и больше не редактируется в этой версии.

## C. Forecast sealed

Зафиксированный prediction payload записан в durable tamper-evident / append-only mechanism под server authority.

## D. Forecast verified

После наступления observation window outcome сопоставлен с зафиксированным prediction по governing verification protocol.

Эти состояния нельзя обозначать одним словом:

`Final`.

---

# 2. Почему это критично

Если UI говорит:

`Sealed forecast`

когда на самом деле:

- report только выпущен;
- forecast ещё редактируем;
- seal hash не покрывает прогноз;
- storage не durable;

это ложное утверждение о доказательном качестве продукта.

---

# 3. Existing report foundation

Current MergeVue уже имеет:

- public canonical report model;
- 12-block public report grammar;
- internal final-report engine;
- analyst/release gates;
- PDF/email/report projection;
- prediction ledger API.

Target architecture должна объединять эти primitives без создания параллельного платного report.

---

# 4. Canonical paid-report congruence

Paid report сохраняет те же основные client blocks, что public report:

1. Executive Decision Summary
2. Structural Watchpoints
3. Compatibility Score & Deal Scenario
4. Identified Environment Types / approved future label
5. Collision Thesis / approved future label
6. Resource Conflict Map
7. Timeline of Expected Friction
8. Economic Risk Translation
9. Recommended Actions
10. Decision Gap
11. What the Full Engagement Adds / adapted paid-state equivalent
12. Audit Footer

В paid state blocks становятся глубже.

Не создаётся отдельный unrelated:

`Premium Risk Report`.

---

# 5. Paid depth changes evidence, not ontology

Paid report может добавить:

- structured internal observations;
- private documentary evidence;
- contradiction resolution;
- analyst-reviewed claims;
- quantified economic exposure where valid;
- controlled forecast;
- specific-leader forecast only when individual data exists;
- release metadata.

Но core block structure остаётся congruent.

---

# 6. Current internal final-report engine is not automatically client layout authority

Current `finalReportEngine.js` has an 11-section internal structure:

- executive summary;
- deal context;
- respondent coverage;
- evidence coverage;
- contradiction review;
- triage route;
- analyst findings;
- formal risk outputs;
- actions roadmap;
- limitations;
- audit record.

Это valuable internal structure.

Но public Forecast Brief source audit уже указывает, что этот engine следует использовать прежде всего как source для evidence/audit metadata, а не механически превращать в client-facing Forecast Brief layout.

Следовательно:

> client paid report continues canonical 12-block report grammar; internal 11-section structure feeds it.

---

# 7. No “internal report” exposed as paid report

Не выдавать клиенту сырые sections:

- Triage Route;
- Analyst Findings;
- Formal Risk Outputs;
- Respondent Coverage

как новую платную структуру.

Их клиентское содержание должно быть проецировано в existing canonical blocks.

---

# 8. Paid report release prerequisites

Report can be released only when applicable conditions pass:

- report authority exists;
- blocking triage gate absent/resolved;
- required analyst findings reviewed;
- confidence cap respected;
- evidence review requirements satisfied;
- report validators pass;
- narrative/structured model consistency passes;
- no prohibited claims;
- no private/internal leakage;
- version identity fixed.

---

# 9. Release is server-authoritative

Client/browser cannot set:

`released = true`.

Release event must be server-authoritative.

---

# 10. Report candidate

Before release:

`Draft report`

or:

`Report under review`.

It may be previewed internally.

It is not client final output.

---

# 11. Report released

Client-visible state:

`Report available`

or equivalent.

This means:

> this exact report version is authorized for client access.

It does **not** mean any forecast inside it is locked/sealed.

---

# 12. Released report version identity

Release should bind at minimum:

- Deal ID;
- report ID;
- report version;
- generated timestamp;
- release timestamp;
- evidence scope;
- methodology/engine version pointers;
- release authority state.

Exact technical schema separate.

---

# 13. Released version is immutable

After release:

- no silent prose changes;
- no corrected score in place;
- no revised forecast in same version;
- no updated recommendation without new version.

New evidence or correction:

> new report version.

---

# 14. Correction vs new evidence

If factual/technical error discovered:

new version should identify correction.

If new evidence arrives:

new version should identify evidence-driven update.

Do not obscure reason.

---

# 15. Client version history

First version may show:

- Current report;
- Previous report(s).

At minimum preserve server-side history even if UI initially exposes only current + prior.

---

# 16. Public baseline remains version 0 / prior baseline conceptually

The initial public analysis remains traceable.

Paid report does not erase what was knowable publicly.

---

# 17. Evidence scope labeling

Useful:

`Evidence scope: Public + structured internal + private evidence`

only if exact.

No generic:

`Full data`.

---

# 18. Report release ≠ forecast existence

Paid report may lawfully have no formal forecast.

Example:

- evidence sufficient for watchpoints;
- insufficient for timing;
- contradiction unresolved but non-blocking for some report content.

Do not force a forecast just because paid engagement exists.

---

# 19. Forecast authority gate

Formal forecast may be created only when:

- relevant evidence sufficient;
- timing/window logic supported;
- observable event/sign defined;
- falsification/weakening condition defined;
- scope clear;
- report/review authority allows;
- named-person requirements satisfied if person-specific.

---

# 20. Watchpoint vs forecast

A watchpoint:

> something to monitor or investigate.

A forecast:

> a bounded claim expected within a defined observation window and capable of later evaluation.

Do not relabel watchpoint as forecast for marketing.

---

# 21. Organization-level forecast

Can exist without individual 42Q if methodology supports organization-level claim.

---

# 22. Named-leader forecast

Requires individual-data channel under controlling rule.

No 42Q / individual data:

> no named-leader behavioral forecast.

---

# 23. Person-level boundary

Organizational evidence may support:

- role dependency;
- authority exposure;
- succession dependency.

It cannot substitute for individual behavioral measurement.

---

# 24. Forecast lock definition

`Locked` means:

> exact forecast claim, observation window, observable signs, scope and falsification conditions are frozen for that forecast version before the relevant outcome is known.

Lock is semantic/versioning state.

It is not automatically cryptographic.

---

# 25. Lock event prerequisites

Before lock:

- exact claim text;
- exact scope;
- exact Deal/report/forecast identity;
- exact observation window;
- observable signal(s);
- falsification/weakening condition;
- evidence cutoff;
- methodology version;
- approved report/review authority.

---

# 26. No lock on vague prose

Cannot lock:

`There may be some friction after close.`

A useful locked forecast needs evaluation-ready semantics.

---

# 27. Exact claim preservation

After lock, client-visible claim must remain byte/semantic-identical for that forecast version.

No copywriter polish later.

---

# 28. Language normalization before lock

All final editing happens before lock.

After lock:

only metadata/display formatting that does not alter claim semantics may change.

---

# 29. Forecast ID

Every locked forecast requires stable ID.

Do not identify only by report page position.

---

# 30. Multiple forecasts per Deal

A Deal may have multiple forecast claims.

Each needs:

- own ID;
- own scope;
- own timing;
- own verification criterion;
- own status.

---

# 31. Forecast version

If claim changes before outcome:

new forecast version.

Old locked forecast remains.

Do not overwrite.

---

# 32. Superseding forecast

If new evidence justifies a revised forecast before outcome:

new version may supersede prior forecast operationally.

But prior locked forecast remains in ledger/history and must still be distinguishable for later track-record interpretation.

---

# 33. No retrospective “cleanup”

Do not delete an unfavorable locked forecast because new evidence later changed view.

---

# 34. Current prediction ledger exists

Current `src/server/_predictionLedger.ts` implements:

- server-side seal function;
- server timestamp;
- `SEALED` status;
- ledger entry ID;
- sequence;
- SHA-256 hash;
- audit-row export.

This is valuable existing infrastructure.

---

# 35. Critical current seal limitation — hash coverage

Current `buildPredictionSealHash()` hashes a canonical payload containing only:

- `acquirerEnvironmentCode`;
- `targetEnvironmentCode`;
- `anchors`;
- `sealedAt`.

It does **not** hash:

- `dealId`;
- `primaryActorType`;
- `dominantFunction`;
- `prediction1`;
- `prediction2`;
- `prediction3`;
- `falsificationCondition`;
- report ID/version;
- methodology version;
- evidence cutoff.

Therefore:

> current hash does not cryptographically bind the full prediction record.

---

# 36. Consequence for client claims

Until seal payload is expanded:

Forbidden:

- `The exact forecast is cryptographically sealed.`
- `The prediction text cannot be changed without detection.`
- `This hash proves the full forecast was fixed at this time.`

Current hash can only support the narrower technical statement that its actual canonical input was hashed.

---

# 37. Critical current storage limitation

Current ledger uses a `globalThis` in-process array.

That is not by itself durable persistent storage across:

- process restart;
- cold start;
- deployment;
- runtime recycle.

Therefore:

> current implementation must not be described as a durable immutable production ledger solely on the basis of this code.

---

# 38. “Backend append-only ledger” wording caution

Current return value says:

`backend-append-only-ledger`.

But product claims must reflect actual persistence guarantees.

Append-only in process memory ≠ durable append-only ledger.

---

# 39. Production sealing readiness gate

Before client-facing `Sealed` status:

must have:

1. durable server-side persistence;
2. append-only / immutable-or-versioned semantics;
3. full forecast payload hash coverage;
4. server timestamp;
5. stable forecast identity;
6. access/audit controls;
7. persistence tests across restart/deploy;
8. verification retrieval path.

---

# 40. Target canonical seal payload

Conceptually the seal should cover at least:

```text
dealId
reportId
reportVersion
forecastId
forecastVersion

acquirerIdentity
targetIdentity

environmentPair / applicable structural context

exactForecastClaims[]
observationWindows[]
observableSignals[]
falsificationConditions[]

scope
evidenceCutoff
methodologyVersion
forecastSchemaVersion

sealedAt
```

Exact schema engineering decision.

---

# 41. Hash exact forecast text

If exact client forecast prose is the object to be later verified:

hash must cover that exact canonical text or canonical structured representation from which it is deterministically rendered.

---

# 42. Structured payload preferred

Better:

hash structured canonical forecast object.

Then render UI/PDF from same object.

This prevents typography/copy differences from corrupting semantic identity.

---

# 43. Rendered text snapshot

Optionally preserve rendered client text snapshot too.

But structured payload remains authority.

---

# 44. Falsification condition must be covered

Critical.

If falsification condition can be changed later, track record is meaningless.

---

# 45. Observation window must be covered

Same.

No shifting dates after seeing outcome.

---

# 46. Evidence cutoff must be covered

Need to know what information was admissible when forecast was locked.

---

# 47. Method/version must be covered

Future method changes must not silently rewrite past forecast basis.

---

# 48. Server time is authoritative

Seal timestamp must be server-generated.

Current implementation already follows this principle.

Keep.

---

# 49. Client clock not authority

No user-editable seal timestamp.

---

# 50. Seal ID

Use stable ledger/forecast entry ID.

Do not expose raw UUID prominently unless useful.

---

# 51. Seal hash client visibility

Client does not need a giant SHA-256 string in main report.

Potential audit detail:

- seal status;
- sealed timestamp;
- forecast ID;
- optional abbreviated hash / verification link.

Only after production-grade semantics.

---

# 52. No crypto theater

Hash is evidence of payload integrity, not:

- forecast truth;
- predictive accuracy;
- methodological validation.

---

# 53. Seal status labels

Potential client states:

- `Not locked`
- `Locked`
- `Sealed`

Only use `Sealed` when production seal readiness gate passes.

---

# 54. Current public report preview semantics

Existing Forecast Brief source audit explicitly treats public `Sealed Prediction Preview` as a display-only preview and advises isolating it from ledger wording.

Preserve that distinction.

Public preview:

> not ledger record.

Paid sealed forecast:

> actual governed ledger/seal event only when implemented.

---

# 55. Preview ≠ lock

A preview can show what a forecast could look like.

It must never inherit:

- seal ID;
- seal timestamp;
- locked state;
- track-record status.

---

# 56. Report release without seal

Valid.

Example:

report contains:

- structural findings;
- Decision Gap;
- actions;
- economic exposure;

but no formal locked forecast.

UI should not imply missing seal is product failure.

---

# 57. Forecast locked but not sealed

Potential transitional technical state.

If semantic lock exists but durable cryptographic seal unavailable:

client wording should be precise.

Possible internal state:

`Locked — sealing unavailable`

Client exposure depends product policy.

---

# 58. Seal failure

If seal API fails:

- report release may or may not proceed depending on whether forecast seal is required;
- forecast must not display `Sealed`.

No optimistic status.

---

# 59. Seal incomplete

Current API fails when required input missing.

Target should fail closed.

Do not fill missing prediction fields with placeholders.

---

# 60. Required forecast completeness

Before sealing:

- exact required claims present;
- exactly required anchors/observables present according to schema;
- falsification condition present;
- Deal identity present;
- report/forecast version present.

---

# 61. Current `anchors[3]` requirement

Current seal requires exactly three anchors.

This is existing implementation.

Do not assume three anchors are eternal product/method authority unless current controlling forecast schema confirms it.

Target schema should be explicit.

---

# 62. Existing prediction fields

Current ledger contains:

- prediction 1;
- prediction 2;
- prediction 3;
- falsification condition;
- primary actor type;
- dominant function.

Some fields may reflect legacy forecast design.

Before client paid contract uses them:

compare to current methodology/42Q boundaries.

---

# 63. Primary actor type caution

If this field exposes internal person/type semantics:

do not publish raw type.

Internal ledger may retain governed technical value.

Client report gets behavior forecast, not type label.

---

# 64. Dominant function caution

Same.

Technical forecast variable ≠ necessarily client copy.

---

# 65. Environment codes

Internal ledger may store codes.

Client report uses approved public environment names.

---

# 66. ECS pair in ledger

Technical linkage.

Do not present as cryptographic proof of deal quality.

---

# 67. Paid report audit footer

Can include:

- Report ID
- Report version
- Generated date
- Evidence scope
- Release state
- Forecast state if applicable

If sealed:

- sealed date;
- forecast ID.

No internal storage path/provider.

---

# 68. Report generatedAt vs releasedAt vs sealedAt

Three different timestamps.

Preserve.

## generatedAt
Report candidate generated.

## releasedAt
Authorized to client.

## sealedAt
Forecast payload sealed.

Do not use one date for all three.

---

# 69. Forecast createdAt

Could also differ.

Useful internally.

---

# 70. Evidence cutoff vs sealedAt

Evidence cutoff may precede seal.

Both matter.

---

# 71. Timeline semantics

Formal forecast should specify actual observation timing supported by methodology.

Do not import legacy Day 30/60 copy automatically.

Current source audit notes conflicts in existing timing strings.

Therefore target timing must come from current authoritative forecast object, not static legacy renderer text.

---

# 72. No static timing normalization without authority

Do not force:

`Day 30`

merely because old Forecast Brief adapter expected it.

---

# 73. Falsifiability

Each formal forecast should include:

- what observation would support;
- what observation would weaken/falsify;
- deadline/window.

This enables verification.

---

# 74. “Falsified” must be possible

If forecast cannot ever be scored false:

it is not a meaningful locked prediction.

---

# 75. Client forecast presentation

Recommended:

```text
Forecast

Claim
...

Observation window
...

What to watch
...

What would weaken or falsify this forecast
...

Status
Locked / Sealed

Locked on
...
```

No probabilistic number unless calibrated authority exists.

---

# 76. Specific-leader forecast presentation

If lawful:

show behavior claim, not internal type.

Also show individual-data basis boundary where appropriate.

---

# 77. Organization-level forecast presentation

Make scope explicit:

`Organization-level forecast`

to avoid person inference.

---

# 78. Forecast confidence

May be categorical if governing model supports.

Do not derive numeric confidence from analyst score alone.

---

# 79. Seal does not increase confidence

Cryptographic seal proves fixation, not evidence quality.

Do not visually make sealed forecast “more likely true”.

---

# 80. Lock does not increase confidence

Same.

---

# 81. Released report confidence

Still governed by evidence/review.

---

# 82. Locked forecast as historical artifact

Once locked/sealed:

forecast becomes immutable evidence for future verification.

---

# 83. New evidence after lock

Must not edit locked forecast.

May create:

- supplemental note;
- new forecast version;
- new report version.

---

# 84. New report can coexist with old locked forecast

Report v3 can reference Forecast v1 locked earlier.

Need explicit relation.

---

# 85. Forecast supersession

If new forecast v2 issued:

display:

`Forecast v2 supersedes v1 for forward operational use.`

But v1 remains evaluable according to its original window if outcome allows.

---

# 86. Do not erase misses by supersession

Track-record integrity requires history.

---

# 87. Withdrawal

If forecast is withdrawn before outcome:

withdrawal itself must be recorded with timestamp/reason.

Cannot simply delete.

Verification policy must define treatment.

---

# 88. Cancellation due to Deal change

Example:

transaction terminated.

Forecast may become:

`No longer applicable`.

This is not automatically `Missed` or `Falsified`.

Outcome-verification contract handles.

---

# 89. Verification is future separate act

This document prepares for verification.

It does not itself define outcome adjudication in full.

Next dedicated contract should do that.

---

# 90. Verification target vocabulary

Controlling product vocabulary:

- Confirmed
- Partially confirmed
- Not determinable
- Missed
- Falsified

No `Accuracy score` as substitute.

---

# 91. Verify exact locked claim

Outcome review must compare:

> what was actually locked

not reconstructed memory or latest report prose.

---

# 92. Verification source separation

Outcome evidence comes after forecast lock.

Must be separate from forecast-basis evidence.

---

# 93. No hindsight contamination

Post-outcome evidence can verify.

It cannot alter:

- locked claim;
- evidence cutoff;
- pre-outcome rationale.

---

# 94. Report release UX

For client:

```text
Report available
Version 3
Generated Sep 16, 2026
Evidence scope: Public + internal + private evidence
```

If formal forecast:

separate forecast card/state.

---

# 95. No “Final report” if analysis lifecycle continues

Prefer:

`Current report`

or:

`Released report`

unless truly terminal engagement artifact.

---

# 96. “Final” is version-relative

If used:

`Final report for this analysis cycle`.

Do not imply Deal reality can no longer change.

---

# 97. Client actions after release

Potential:

- Open report
- Download PDF
- View evidence
- View forecast
- Save/share according to access
- Continue monitoring / verification later

Only actual capabilities.

---

# 98. Download PDF

Same authoritative projection.

No separate PDF claim generation.

---

# 99. Email distribution

Same released version.

Email should identify version.

---

# 100. Share

Separate access/share contract.

Do not create public share URL automatically.

---

# 101. Seal visibility in PDF/email

If formal seal state is client-relevant:

same status/timestamp across screen/PDF/email.

No PDF-only `sealed` badge.

---

# 102. Version parity

Report version same everywhere.

Forecast version same everywhere.

---

# 103. Audit metadata parity

Generated/released/sealed timestamps must not conflict across surfaces.

---

# 104. Report content hash

Optional future capability.

Different from forecast seal hash.

Do not conflate.

---

# 105. If full report is cryptographically sealed

That would require separate report-payload hash definition.

Current prediction ledger does not establish this.

Do not claim.

---

# 106. Current seal hash is not full-report hash

Absolute.

---

# 107. Ledger export

Current system supports audit row export.

This is internal audit capability.

Do not expose raw export to client by default.

---

# 108. Ledger privacy

Ledger may contain internal environment codes/person variables.

Access should be restricted.

---

# 109. Client verification link

Future possible:

`Verify forecast seal`

could display:

- forecast ID;
- hash match;
- sealed timestamp.

Only after durable/full-payload seal is real.

Not required first version.

---

# 110. Third-party timestamping

Not required.

Do not imply blockchain/notary.

---

# 111. No blockchain language

Current system is SHA-256 hashing + backend ledger concept.

Not blockchain.

---

# 112. No “tamper-proof”

Safer even after robust implementation:

`tamper-evident`

if technically justified.

---

# 113. No “immutable” unless storage semantics guarantee

Append-only policy alone may not guarantee immutable infrastructure.

Claims require technical review.

---

# 114. Production target seal storage

Must be durable and versioned/append-only.

Potential implementations are engineering decision.

This document does not mandate vendor/database.

---

# 115. Persistence test requirements

Must test:

- process restart;
- deployment;
- multiple runtime instances;
- concurrent seals;
- duplicate retry;
- audit retrieval;
- corrupted/mismatched hash;
- historical retrieval.

---

# 116. Idempotency

Seal action must avoid duplicate ledger entries on retry.

Current API should be reviewed for idempotency.

---

# 117. Current sequence-based entries caution

Process-local sequence may not be stable under distributed runtime.

Production ledger needs concurrency-safe ordering/identity.

---

# 118. Duplicate seal attempt

If same forecast payload already sealed:

system should return existing seal or create explicit superseding entry according to policy.

Do not silently duplicate.

---

# 119. Seal after report release

Possible sequence:

`report released → forecast seal`.

But if client report claims forecast sealed at release, seal must complete before that claim appears.

Preferred if seal is required:

```text
forecast locked
→ seal succeeds
→ report release projection includes sealed status
→ release
```

---

# 120. Report release before seal failure

If report can release without forecast seal:

remove seal claim.

Do not leave stale badge.

---

# 121. Forecast lock server authority

Do not implement only with disabled textarea.

Lock is backend state.

---

# 122. Client cannot unlock

No UI.

---

# 123. Analyst cannot edit locked forecast

They can create new version.

---

# 124. Practitioner cannot edit history

Same.

---

# 125. Admin emergency correction

If ever necessary:

append correction record, never rewrite.

Policy separate.

---

# 126. Forecast status state machine

Conceptual:

```text
DRAFT
→ REVIEW_REQUIRED
→ READY_TO_LOCK
→ LOCKED
→ SEALING
→ SEALED
→ VERIFICATION_DUE
→ VERIFIED
```

Branches:

- BLOCKED
- SUPERSEDED
- WITHDRAWN
- NOT_APPLICABLE

Exact enum separate.

---

# 127. Do not collapse to `FINAL`

---

# 128. Report status state machine

Conceptual:

```text
DRAFT
→ UNDER_REVIEW
→ BLOCKED / CONDITIONAL
→ READY_FOR_RELEASE
→ RELEASED
→ SUPERSEDED
```

Separate from forecast states.

---

# 129. Deal status is third axis

Deal status:

- diligence;
- analysis;
- sealed etc.

Do not use Deal status as report or forecast status.

---

# 130. “Sealed” Deal status caution

Canonical data model has Deal status `sealed`.

This legacy/current term must not automatically imply every report/forecast is sealed.

Need clear semantics before client exposure.

---

# 131. Three state axes

UI/internal model must distinguish:

1. Deal lifecycle state;
2. Report release state;
3. Forecast lock/seal/verification state.

---

# 132. Client Deal Workspace display

Example:

```text
Current report
Released · Version 3

Forecast
Sealed · Forecast v1
Observation window: ...

Verification
Not yet due
```

Only when true.

---

# 133. If no forecast

```text
Forecast
Not issued
Current evidence supports watchpoints but not a locked forecast.
```

This is legitimate.

---

# 134. If forecast blocked

Client-safe:

`Forecast not available — additional review is required.`

No internal triage code.

---

# 135. If forecast unsealed

Do not show `Sealed`.

---

# 136. Lock confirmation internal

Before lock:

show exact payload summary.

Analyst/releaser confirms:

`Lock forecast version X? This version cannot be edited after lock.`

Only if authorized role.

---

# 137. Seal confirmation

May happen automatically after lock.

Prefer minimize separate human click if machine can seal deterministically.

---

# 138. Human approves semantics, machine performs seal

Best division:

- human/governed process approves exact claim;
- server creates lock/seal.

---

# 139. No manual hash entry

Never.

---

# 140. Seal response validation

Client/internal UI trusts server response only after verifying required fields.

---

# 141. Hash verification

On retrieval, server can recompute canonical hash and compare.

Need target endpoint/process.

---

# 142. Mismatch

If mismatch:

hard integrity incident.

Do not render sealed status.

---

# 143. Audit trail

Seal/release events internally log:

- actor/authority;
- timestamp;
- version;
- result.

---

# 144. Client actor identity

Not necessary.

---

# 145. Forecast scope

Must say whether:

- organization-level;
- function-level;
- specific leader;
- resource/mechanism-level.

No ambiguous universal scope.

---

# 146. Forecast subject

If named person:

individual-data prerequisite.

---

# 147. Forecast event

Must be observable.

Avoid abstract:

`culture will deteriorate`.

Prefer operational observable if methodology supports.

---

# 148. Forecast window

Must be defined.

No moving window after lock.

---

# 149. Forecast threshold

If claim uses threshold:

threshold fixed before outcome.

---

# 150. Forecast evidence basis

Client may see summarized basis.

Internal technical view links full evidence.

---

# 151. Forecast uncertainty

Include limitations at lock time.

Do not add after miss to weaken prediction retroactively.

---

# 152. Falsification clause

Visible or auditable before outcome.

Not hidden internal-only if it materially defines prediction.

---

# 153. Verification method

Should be specified pre-outcome when possible.

---

# 154. Outcome source class

Defined later.

Do not use arbitrary press headline as verification unless protocol permits.

---

# 155. No verification before observation window

Do not prematurely mark Confirmed.

---

# 156. Early falsification

If protocol allows decisive early falsifier:

record according to verification rules.

Separate contract.

---

# 157. Partial confirmation

Needs pre-defined semantics.

Do not use as convenient middle status after seeing outcome.

---

# 158. Not determinable

Must remain available when outcome evidence insufficient.

---

# 159. Missed vs Falsified

Need distinct governing definitions.

Do not interchange.

---

# 160. No score inflation

Do not convert statuses into hidden favorable accuracy calculation without accepted methodology.

---

# 161. Track record

Future track record uses verified sealed predictions only according to eligibility rules.

Not all reports.

---

# 162. Public track record eligibility

Separate governance.

Do not automatically publish client Deal outcome.

---

# 163. Client confidentiality

Sealed ledger record can remain private.

Sealing does not make Deal public.

---

# 164. No public ledger implication

“Ledger” is internal architecture unless client-facing transparency decision exists.

---

# 165. Report title

Working direction:

`MergeVue Deal Analysis`

or accepted future brand label.

Do not create grandiose:

`Definitive M&A Forecast`.

---

# 166. Forecast section title

Possible:

`Locked forecast`

only after lock.

Before:

`Forecast candidate`

internal only.

---

# 167. Public preview title

Keep separate wording:

`Forecast preview`

or existing approved display-only wording.

---

# 168. Paid report header

Recommended:

```text
Acquirer × Target
MergeVue Deal Analysis
Report version 3
Released Sep 16, 2026
```

If forecast sealed:

secondary status.

---

# 169. No seal badge as hero

Analytical claim remains primary.

Seal is integrity metadata.

---

# 170. Visual styling

Use existing Forecast Brief / report canon.

Do not turn seal into cyber-security visual aesthetic.

No:

- blockchain icons;
- shields everywhere;
- green crypto hashes.

---

# 171. Forecast card styling

Serious analytical panel.

Fields separated semantically.

---

# 172. Locked visual indicator

Small text/icon + timestamp.

Text is authoritative.

---

# 173. Seal detail disclosure

Expandable technical detail if client needs.

---

# 174. Client technical comprehension

Do not require client to understand SHA-256 to trust report.

Explain operationally:

`This forecast version was fixed before the observation period and cannot be edited in place.`

Only if true.

---

# 175. Stronger seal explanation after readiness

Potential:

`The canonical forecast payload was timestamped and stored as an append-only sealed record.`

Only when technically accurate.

---

# 176. Avoid “proof” wording

Hash does not prove outcome truth.

---

# 177. Accessibility

Forecast status must be textual.

Hash/details keyboard accessible.

No color-only sealed state.

PDF text selectable/readable.

---

# 178. Mobile

Forecast panel stacks:

- claim;
- window;
- observable;
- falsifier;
- status.

No horizontal dense ledger table.

---

# 179. Print/PDF

Preserve:

- exact forecast claim;
- version;
- observation window;
- falsification condition;
- lock/seal timestamp if applicable;
- report version.

---

# 180. PDF generation timing

Generate from released canonical projection.

If seal completes after initial PDF generation but seal is supposed to appear:

regenerate as new distribution artifact of same released report metadata only if semantics unchanged and policy permits.

Better:

seal before final client distribution.

---

# 181. Email copy

Do not say:

`Your sealed forecast is ready`

unless sealed.

Use report state exactly.

---

# 182. Client notification

When report released:

`Your report is available.`

When seal occurs separately:

only notify if product benefits.

---

# 183. No resend mutation

Resending report does not create new version.

---

# 184. Audit footer fields

Client-safe target:

- Report ID
- Report version
- Generated
- Released
- Evidence scope
- Forecast ID/status if applicable
- Sealed date if applicable
- Methodology reference

Avoid:

- internal risk engine version clutter;
- provider;
- CORR IDs.

---

# 185. Internal audit metadata

May include more:

- engine versions;
- evidence snapshot ID;
- worksheet version;
- triage report version;
- validator result;
- release actor;
- seal hash;
- seal schema version.

---

# 186. Report source of truth

Structured canonical report projection.

Not PDF.

Not email.

Not analyst WYSIWYG.

---

# 187. Forecast source of truth

Canonical structured forecast payload.

Not rendered paragraph alone.

---

# 188. Ledger source of truth

Durable sealed record after production hardening.

Not browser state.

---

# 189. Verification source of truth

Later verification record linked to exact sealed forecast ID/version.

---

# 190. Current code migration requirement

Current prediction ledger must be audited/updated before client sealing launch.

At minimum:

- full payload coverage;
- durable persistence;
- idempotency;
- distributed runtime behavior;
- exact schema version;
- retrieval verification.

---

# 191. Hash payload version

Current `sha256-v1`.

New expanded payload likely requires new seal version.

Do not silently change v1 semantics.

---

# 192. Backward compatibility

Old v1 seals remain interpretable according to what they actually covered.

Do not relabel them as full forecast seals retroactively.

---

# 193. Migration policy

Possible:

- v1 = legacy partial seal;
- v2 = full forecast payload seal.

Exact naming/decision engineering/governance.

---

# 194. Legacy ledger entries

Must preserve.

No re-hash with new payload and pretend original time.

---

# 195. Re-sealing old prediction

If done later, new timestamp means new seal event.

Cannot claim historical seal.

---

# 196. Current in-memory ledger entries

If not durably persisted, should not be used as long-term track-record authority.

---

# 197. Production track-record gate

Only forecast records satisfying accepted persistence/seal/version criteria enter official prospective track record.

---

# 198. Public MVP sealed-preview firewall

Existing public preview content remains clearly:

- preview;
- not ledger-recorded;
- not scored forecast ledger.

Do not accidentally upgrade it because paid seal system exists elsewhere.

---

# 199. FREE vs PAID forecast distinction

FREE can expose:

- structural watchpoints;
- bounded preview where allowed.

PAID can expose:

- controlled locked/sealed forecast when evidence/review requirements pass.

No guarantee paid always produces one.

---

# 200. Individual channel distinction

Specific-leader forecast only when 42Q/individual data complete.

Organization forecast can remain separate.

---

# 201. Forecast timing and intensity

Do not claim exact leader timing/intensity from organization layer if current caveat says individual verification needed.

---

# 202. Existing legacy caveat

Current validation sources contain language distinguishing structural-level forecast from individual-verified prediction.

Preserve the conceptual boundary even if copy is rewritten.

---

# 203. No type publication

Technical ledger `primaryActorType` does not authorize client type label.

---

# 204. Economic forecast vs organizational forecast

Do not seal an economic loss range as if it were same kind of behavioral forecast unless separate methodology defines it.

---

# 205. Economic exposure may be report analysis, not prediction ledger item

Keep distinct.

---

# 206. Recommendation is not forecast

Do not include recommended action as verification target unless specifically part of forecast design.

---

# 207. Decision Gap is not forecast

Same.

---

# 208. Resource conflict is not automatically forecast

Can support forecast mechanism, but itself may be structural finding.

---

# 209. Forecast claim taxonomy

Target structured forecast should classify:

- subject;
- event;
- mechanism;
- observation window;
- observable;
- falsifier;
- evidence basis;
- confidence;
- scope.

This improves later verification.

---

# 210. No free-text-only seal

A structured schema is required for reliable verification.

Narrative can be derived.

---

# 211. Narrative and structured claim parity

Client prose must not add stronger prediction than sealed structure.

Validator required.

---

# 212. If narrative differs

Fail release/seal.

---

# 213. Forecast translation/localization future

If multilingual later:

seal canonical semantic payload + canonical language version.

Translations derived and versioned.

First version English only.

---

# 214. American English

All client forecast copy American English.

---

# 215. No post-seal grammar correction

Even typo correction should create corrected/superseding forecast version if exact text is part of sealed payload.

Better to validate before seal.

---

# 216. Pre-seal quality checklist

- spelling;
- subject;
- claim;
- timing;
- observable;
- falsifier;
- scope;
- confidentiality;
- 42Q requirement;
- claim limits.

---

# 217. Seal preview

Internal pre-seal preview shows exact client rendering.

Analyst/releaser sees what will be locked.

---

# 218. Double confirmation

Could be justified for irreversible lock.

Avoid multiple redundant dialogs.

---

# 219. Forecast sealing permission

Separate from ordinary analyst review if policy requires.

Do not assume every analyst can seal.

---

# 220. Release permission

Same.

---

# 221. System-generated seal

Human approves; server seals.

---

# 222. No local seal computation as authority

Client may verify hash locally, but authoritative seal event server-side.

---

# 223. Seal API authentication

Current endpoint must be protected in production.

Do not expose unauthenticated sealing capability.

Security contract separate.

---

# 224. Audit export authentication

Same.

---

# 225. Rate limiting / abuse

Engineering/security concern.

---

# 226. Deal ownership

Seal request must bind authorized Deal/report/forecast.

No arbitrary dealId input accepted from client without server check.

---

# 227. Current API input trust review

Current seal function accepts fields directly.

Production path must derive/validate from authoritative report/forecast object rather than trusting client-supplied prediction text.

---

# 228. Best target sealing flow

```text
Authorized forecast object stored server-side
→ reviewer approves exact forecast ID/version
→ server loads canonical object
→ server validates completeness
→ server computes seal
→ server persists append-only record
→ server returns seal state
```

Not:

```text
browser sends arbitrary prediction strings
→ server hashes them
```

---

# 229. Seal payload provenance

Seal references authoritative forecast object/version.

---

# 230. No disconnected seal

A seal record without retrievable forecast object is not enough.

---

# 231. Report-to-forecast linkage

Report should reference forecast ID/version.

Forecast references report/evidence snapshot.

---

# 232. Verification linkage

Later outcome record references forecast ID/version and seal record.

---

# 233. Evidence snapshot

Ideally freeze reference to evidence snapshot/cutoff used.

Do not necessarily duplicate all evidence into seal payload.

Stable snapshot pointer + integrity may be enough.

---

# 234. Evidence privacy in seal

Do not hash/store sensitive raw evidence if not needed.

Hash structured forecast + references.

---

# 235. Hash privacy

Hash can still be public-safe generally, but metadata may leak Deal identity.

Access governed.

---

# 236. Audit export redaction

Client/export audience matters.

Internal full ledger vs client-safe audit record may differ.

---

# 237. No report hash in URL

Avoid leaking.

---

# 238. Forecast verification window state

Before window:

`Not yet due`.

During:

`Observation window open`.

After:

`Verification due`.

Only if date logic exact.

---

# 239. No automated outcome scraping verdict without review policy

Public events can inform verification.

Final status follows verification protocol.

---

# 240. Verification should not be analyst discretion alone

Need predefined outcome criteria.

Next contract.

---

# 241. Report release decision matrix

| State | Client paid report | Formal forecast | Seal claim |
|---|---|---|---|
| Report blocked | No new final report | No | No |
| Report conditional | No final release until condition met | No final lock | No |
| Report released, no forecast authority | Yes | No | No |
| Report released, forecast draft | Yes | Internal draft only | No |
| Forecast locked, seal unavailable | Yes | Yes, locked | No |
| Forecast sealed production-grade | Yes | Yes | Yes |
| Forecast verified later | Yes | Historical locked claim | Verification status |

---

# 242. Current asset decision matrix

| Existing asset | Decision |
|---|---|
| Canonical public report model | **KEEP AS CLIENT REPORT GRAMMAR** |
| `finalReportEngine.js` | **KEEP AS INTERNAL EVIDENCE/AUDIT INPUT** |
| report release authority | **KEEP** |
| PDF/email same projection | **KEEP** |
| `/api/seal-prediction` | **KEEP CONCEPT / HARDEN BEFORE PRODUCTION SEAL CLAIMS** |
| `_predictionLedger.ts` | **KEEP CONCEPT / REPLACE EPHEMERAL STORAGE WITH DURABLE PERSISTENCE** |
| Server-generated sealedAt | **KEEP** |
| SHA-256 mechanism | **KEEP POSSIBLE / EXPAND PAYLOAD** |
| Current `sha256-v1` payload | **LEGACY PARTIAL COVERAGE** |
| Display-only public sealed preview | **KEEP SEPARATE FROM LEDGER** |
| Raw environment/type codes | **INTERNAL ONLY** |
| Full forecast text not hash-covered | **BLOCKING DEBT FOR “FULL FORECAST SEALED” CLAIM** |
| In-memory global ledger | **BLOCKING DEBT FOR DURABLE LEDGER CLAIM** |

---

# 243. Target seal readiness checklist

Before first real client `Sealed` badge:

- [ ] forecast schema approved;
- [ ] exact forecast object server-authoritative;
- [ ] seal payload covers exact prediction semantics;
- [ ] falsification criteria covered;
- [ ] observation windows covered;
- [ ] Deal/report/forecast IDs covered;
- [ ] evidence cutoff covered;
- [ ] method/schema version covered;
- [ ] server timestamp;
- [ ] durable persistent append-only/versioned storage;
- [ ] idempotency;
- [ ] concurrent-runtime safety;
- [ ] hash verification endpoint/process;
- [ ] access control;
- [ ] audit retrieval;
- [ ] restart/deployment persistence tests;
- [ ] screen/PDF/email parity;
- [ ] verification linkage.

Until all required items pass:

> do not claim production sealed forecast.

---

# 244. Target first-version paid report surface

Minimum:

```text
Deal identity
Report version / released date / evidence scope

Canonical report blocks

Forecast
  only if forecast authority exists
  claim
  scope
  observation window
  observable
  falsification condition
  lock/seal status

Limitations
Audit footer
```

---

# 245. WHAT WAS INTENTIONALLY PRESERVED

Before implementation list:

- canonical client report blocks;
- report authority;
- analyst/release gates;
- versioning principle;
- public baseline;
- report validators;
- prediction ledger concept;
- server-generated timestamp;
- falsifiability;
- pre/post evidence separation;
- 42Q boundary.

---

# 246. WHAT IS NEW / TARGET

- explicit report/forecast/seal state separation;
- production-grade forecast object/version;
- full-payload seal schema;
- durable ledger storage;
- idempotent seal;
- report-to-forecast linkage;
- evidence-cutoff linkage;
- client-safe seal metadata;
- verification-ready forecast schema.

---

# 247. WHAT MUST BE REPAIRED BEFORE PRODUCTION SEAL CLAIM

Two current implementation defects are blocking:

## Defect A — incomplete hash coverage

Current SHA-256 payload does not include the actual prediction strings/falsification condition.

## Defect B — non-durable ledger persistence

Current ledger is process-memory `globalThis` storage.

These defects do not invalidate the prototype/architecture.

They **do** invalidate any strong client claim that the complete prediction is durably cryptographically sealed.

---

# 248. WHAT CHANGED AND WHY

Format:

```text
CURRENT
→ TARGET
→ DEFECT
→ AUTHORITY
```

Example:

```text
SHA-256 over environment codes + anchors + sealedAt
→ SHA-256 over complete canonical forecast payload + identities + version + evidence cutoff
→ current hash does not bind exact prediction text or falsification criterion
→ forecast integrity / prospective verification requirement
```

---

# 249. Acceptance criteria

Paid report / forecast lock passes only if:

1. paid report uses canonical client report grammar;
2. internal final-report sections do not replace client ontology;
3. public baseline remains traceable;
4. report candidate distinct from released report;
5. report release server-authoritative;
6. released report version immutable;
7. new evidence creates new version;
8. report release distinct from forecast lock;
9. forecast existence is not forced;
10. watchpoint distinct from forecast;
11. organization forecast distinct from named-leader forecast;
12. named-leader forecast requires individual data;
13. locked forecast has stable forecast ID;
14. locked forecast has explicit version;
15. exact claim frozen;
16. observation window frozen;
17. observable signs frozen;
18. falsification condition frozen;
19. evidence cutoff recorded;
20. method/schema version recorded;
21. no post-lock prose mutation;
22. changed forecast creates new version;
23. old forecast remains;
24. supersession does not erase old forecast;
25. current seal limitation recognized;
26. no claim that current v1 hash covers full forecast;
27. full forecast seal requires expanded payload;
28. deal/report/forecast identity included in target seal;
29. exact forecast semantics included in target seal;
30. falsification condition included in target seal;
31. observation window included in target seal;
32. evidence cutoff included in target seal;
33. server timestamp authoritative;
34. client clock not authoritative;
35. durable ledger required;
36. process-memory ledger not described as durable;
37. restart/deploy persistence tested;
38. concurrent sealing safe;
39. seal action idempotent;
40. seal hash verification supported;
41. hash mismatch fails closed;
42. no `Sealed` UI when seal fails;
43. no `Sealed` UI when using preview only;
44. public sealed-preview remains explicitly separate;
45. report may release without forecast if policy permits;
46. report may release without seal only without seal claim;
47. seal does not imply predictive confidence;
48. lock does not imply predictive confidence;
49. hash does not imply forecast truth;
50. no blockchain/tamper-proof overclaim;
51. no raw type labels to client;
52. no internal environment codes to client;
53. report/forecast/generated/released/sealed timestamps distinct;
54. PDF/email/screen show same report/forecast version;
55. audit footer accurate;
56. no separate PDF-only seal claim;
57. formal forecast is verification-ready;
58. verification compares exact locked claim later;
59. post-outcome evidence cannot alter locked baseline;
60. verification vocabulary reserved for outcome stage;
61. track record uses only eligible locked/sealed/verified forecasts;
62. client Deal remains confidential;
63. seal record does not imply public ledger;
64. exact route/API access server-protected;
65. client cannot submit arbitrary Deal/forecast to seal without authority;
66. server seals canonical stored forecast object;
67. report links forecast version;
68. forecast links evidence/report snapshot;
69. verification can later link exact seal;
70. American English client copy;
71. WCAG 2.2 AA target maintained;
72. no seal badge as marketing hero;
73. no cryptographic theater;
74. legacy `sha256-v1` semantics preserved accurately;
75. no retroactive resealing presented as historical seal.

---

# 250. Финальный принцип

> **A report can be released without a forecast. A forecast can be locked without being sealed. A seal proves fixation of exactly what the seal covers — not truth, accuracy, or success. Verification happens later against the exact locked claim.**

> **MergeVue must never gain credibility by using the word “sealed” more strongly than the underlying storage and hash semantics justify.**

> **The value of a locked forecast is not that it looks certain. The value is that its claim, timing, observable signs and falsification conditions are fixed before the outcome and can later be judged without rewriting history.**
