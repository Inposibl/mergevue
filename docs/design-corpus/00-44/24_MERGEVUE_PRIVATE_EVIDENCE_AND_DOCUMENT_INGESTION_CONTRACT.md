# 24. Контракт private evidence и documentary ingestion MergeVue

**Статус документа:** управляющий target-contract / paid private-evidence ingestion and provenance  
**Файл:** `24_MERGEVUE_PRIVATE_EVIDENCE_AND_DOCUMENT_INGESTION_CONTRACT.md`  
**Версия:** 1.0  
**Дата:** 16 сентября 2026 года  
**Язык документации:** русский  
**Язык коммерческого интерфейса:** только American English  
**Рынок первой версии:** США  
**Входная surface:** Deal Workspace из `22`, deeper-diligence transition из `20`  
**Связанный internal-evidence contract:** `23_MERGEVUE_INTERNAL_EVIDENCE_AND_RESPONDENT_SETUP_CONTRACT.md`  
**Главный принцип:** private/documentary evidence запрашивается только для конкретного unresolved decision gap, сохраняет provenance и review state, не попадает в FREE scoring и не превращается в «upload your data room» без аналитической причины  
**Ключевые инварианты:** `PRIVATE EVIDENCE IS PAID/CONTROLLED`, `EVIDENCE ≠ FILE`, `PROVENANCE BEFORE INTERPRETATION`, `UPLOAD ≠ VERIFIED`, `DOCUMENT ≠ TRUTH`, `NO FREE DOCUMENT SCORING`, `NO GENERIC DATA-ROOM INGESTION`, `NO SILENT CROSS-SCOPE USE`

---

# 0. Назначение

Этот документ определяет product/UX surface для:

```text
Decision Gap
→ evidence need
→ request private/documentary evidence
→ secure ingestion
→ provenance capture
→ review / contradiction handling
→ evidence integration
→ report version update
```

Он не определяет:

- storage vendor;
- encryption implementation;
- legal terms;
- full security architecture;
- analyst adjudication workflow in detail;
- pricing;
- complete report redesign.

---

# 1. Почему private evidence — отдельный trust level

Private evidence может включать:

- organizational charts;
- reporting-line documents;
- management presentations;
- integration plans;
- governance models;
- decision-rights documents;
- retention / compensation data;
- promotion / attrition history;
- leadership-change records;
- interview notes;
- board materials;
- data-room extracts.

Это существенно более чувствительный слой, чем:

- company names;
- public evidence;
- public report;
- structured respondent observations.

Поэтому:

> private evidence начинается только после явного user intent и соответствующего trust/commercial gate.

---

# 2. FREE/public boundary

Current architecture explicitly treats document-supported capability as inadmissible in FREE evidence classification.

Следовательно:

> **private documents do not enter FREE scoring.**

Не допускается:

```text
anonymous public result
→ silently upload/use private file
→ still call it FREE public analysis
```

---

# 3. Public documents vs private documents

Важно различать:

## Public records

Публично доступные документы / filings / official records.

Они могут принадлежать public-source evidence lane.

## Private documentary evidence

Материалы, доступные только пользователю / client / data room.

Они принадлежат paid/private lane.

Одинаковый PDF format не делает эти evidence classes одинаковыми.

---

# 4. Current implementation foundation

В `src/flow/evidenceCapture.js` уже существует Layer 2 evidence model.

Current item types:

- `Document`;
- `Interview note`;
- `Dataroom extract`;
- `Public record`;
- `Other evidence`.

Это сильная существующая основа.

---

# 5. Current document-type vocabulary

Current implementation поддерживает категории:

- `Org chart`;
- `Reporting lines`;
- `Management presentation`;
- `Integration plan`;
- `Governance model`;
- `Decision-rights document`;
- `Retention or compensation data`;
- `Promotion or attrition history`;
- `Leadership-change record`;
- `Interview note`;
- `Board material`;
- `Other`.

Verdict:

> **KEEP AS CURRENT IMPLEMENTATION VOCABULARY, REVIEW PUBLIC LABELS BEFORE EXPOSURE.**

Не добавлять десятки generic M&A document categories только для полноты uploader.

---

# 6. Current source-party vocabulary

Current Layer 2 evidence distinguishes source party:

- Acquirer;
- Target;
- Advisor;
- Board / investment committee;
- External;
- Other.

Это provenance field.

Не удалять ради простоты формы.

---

# 7. Current review states

Current evidence review states:

- `Unreviewed`;
- `Under review`;
- `Verified`;
- `Disputed`.

Это важная semantic axis.

Но:

> review state ≠ analytical conclusion.

---

# 8. “Verified” requires scope clarity

Слово `Verified` может быть двусмысленным.

Client-facing UI должен понимать, что именно означает этот state:

- evidence item has passed defined review;
- не обязательно истинность всей сделки;
- не predictive validation;
- не legal audit.

Если scope не может быть ясно объяснён:

рассмотреть более bounded public label, сохранив internal state.

---

# 9. Current confidence states

Evidence item can carry:

- High;
- Medium;
- Low;
- Cannot determine.

Do not convert into numeric confidence percentage.

---

# 10. Current relationship states

Current evidence item may relate to respondent evidence as:

- `Supports respondent evidence`;
- `Contradicts respondent evidence`;
- `Context only`;
- `Requires follow-up`.

Это один из самых ценных existing semantics.

Preserve.

---

# 11. Evidence item ≠ uploaded file

A file becomes analytical evidence only when system knows at least:

- what it is;
- where it came from;
- when it was produced;
- which Deal it belongs to;
- what question/finding it relates to;
- review state;
- relationship to other evidence.

Therefore:

> raw upload alone must not immediately count as evidence.

---

# 12. Evidence ≠ truth

Document presence does not mean:

- claim proven;
- respondent contradicted;
- Environment changed;
- report updated.

Required sequence:

```text
File received
→ metadata/provenance
→ extraction/review
→ relationship classification
→ contradiction/reconciliation
→ authority gate
→ analytical integration
```

---

# 13. Current implementation reality — no customer uploader yet

Current `main` has:

- evidence model;
- validation;
- coverage;
- report integration primitives.

Но production customer-facing evidence-ingestion/upload surface не является уже готовой capability.

Поэтому:

> **this document is target contract.**

Не показывать upload CTA в production, пока backend/storage/security path реально не существует.

---

# 14. No fake upload surface

Запрещено создавать UI, который:

- accepts local file visually;
- shows “Uploaded”;
- but does not persist securely server-side;
- or does not bind provenance.

Prototype may simulate only if explicitly labeled prototype.

Production — fail closed.

---

# 15. Private evidence begins from a specific gap

Correct flow:

```text
Decision Gap:
Final decision authority after close is unresolved.

Evidence needed:
Decision-rights or governance documentation.

Action:
Add relevant private evidence.
```

Wrong:

```text
Upload files
[drag entire data room here]
```

---

# 16. Evidence request should be minimal

MergeVue should request:

> the smallest evidence set likely to resolve the current uncertainty.

Not:

> everything available.

Reasons:

- privacy;
- security;
- review burden;
- relevance;
- trust;
- commercial scope.

---

# 17. Evidence request object

Conceptually:

```text
evidenceRequestId
dealId
decisionGapId
requestedEvidenceTypes[]
purpose
requestedBy
createdAt
status
```

Not final database schema.

---

# 18. Evidence request client copy

Example:

`Decision-rights evidence needed`

`The public and respondent evidence does not establish who will retain final authority over product decisions after close.`

`Useful evidence may include a governance model, decision-rights document, or integration plan.`

---

# 19. Request examples are not mandatory upload checklist

If UI says:

`Useful evidence may include...`

the user should not infer every item required.

Avoid:

`Required documents: 12`.

unless methodology truly requires them.

---

# 20. No generic due-diligence checklist

MergeVue is not a full legal/financial data-room checklist.

Do not request:

- every contract;
- every employee file;
- tax records;
- IP schedules

unless a specific MergeVue analytical gap requires them.

---

# 21. User can say evidence is unavailable

Valid state:

`Evidence not available`

This may preserve uncertainty.

Do not force fake upload to continue.

---

# 22. User can say evidence does not exist

Distinct from:

`I don't have access`.

Potential states:

- Not available to me;
- Does not exist;
- Will be available later;
- Prefer not to provide.

Only add if workflow actually needs distinction.

---

# 23. Missing private evidence does not become negative evidence

If decision-rights document is absent/unavailable:

do not automatically infer:

> no decision rights exist.

Unknown remains unknown unless methodology says otherwise.

---

# 24. Ingestion entry point in Deal Workspace

Workspace evidence channel:

`Private evidence`

May show:

- Not started;
- Evidence requested;
- Evidence added;
- Under review;
- Conflicting evidence;
- Integrated.

Exact machine mapping required.

---

# 25. CTA

Potential:

`Add private evidence`

or more specific:

`Add decision-rights evidence`

Specific CTA is preferable when gap known.

---

# 26. No “Upload data room” primary CTA

Too broad.

May be supported in future enterprise ingestion, but requires separate contract and security architecture.

---

# 27. Ingestion modalities

Potential evidence entry methods:

1. file upload;
2. secure link to existing repository;
3. structured interview note;
4. manual metadata/reference;
5. data-room extract.

This contract does not assume all are implemented.

UI displays only actual capabilities.

---

# 28. File upload route decision

Exact uploader route is not authorized here.

Could be:

- modal within Deal;
- Deal sub-surface;
- evidence request page.

Route/layout chosen after backend/security design.

---

# 29. File types

Do not invent accepted extensions until backend defines parser/storage support.

Typical PDF/DOCX/XLSX support may be desirable, but must not be claimed before implemented.

No:

`Supports all file types`.

---

# 30. File size

Same rule.

Do not state:

`Up to 100 MB`

without actual configured limit.

---

# 31. Virus/malware scanning

Production private file ingestion should have security controls.

But UI must not claim:

`Virus scanned`

unless such service is actually implemented and result is authoritative.

---

# 32. Upload states

Minimum conceptual states:

- Selecting;
- Uploading;
- Uploaded;
- Processing;
- Processing failed;
- Ready for review;
- Under review;
- Review complete;
- Disputed / follow-up required.

Do not collapse `Uploaded` into `Verified`.

---

# 33. Uploaded ≠ processed

File may be stored but unreadable/unparsed.

State:

`Uploaded`

then:

`Processing`

if extraction is required.

---

# 34. Processed ≠ reviewed

Extraction success does not mean analytical acceptance.

State remains distinct.

---

# 35. Reviewed ≠ integrated

A reviewed item may:

- support;
- contradict;
- provide context only;
- require follow-up.

Only after analytical integration can report change.

---

# 36. Integrated ≠ report released

Even integrated evidence may require:

- contradiction resolution;
- human review;
- report authority.

Do not instantly mutate client report.

---

# 37. Evidence item metadata

Current model requires/contains fields such as:

- title;
- item type;
- document type;
- source party;
- storage reference;
- review status;
- confidence;
- relationship;
- produced date;
- analyst extract;
- document name;
- document size;
- relevant question IDs;
- relevant risk categories;
- related finding IDs;
- contradicts answer IDs;
- corroborates answer IDs.

This is implementation truth.

Not every field is client-editable.

---

# 38. Client-editable metadata

Likely safe user inputs:

- title;
- document type;
- source party;
- produced date, if known;
- optional short context.

But exact set needs implementation authority.

---

# 39. System/internal metadata

Do not ask client to manually set:

- `reviewStatus = verified`;
- analyst extract;
- risk categories;
- finding IDs;
- contradiction IDs;
- confidence if it is reviewer-derived.

Avoid letting user self-authorize evidence.

---

# 40. Relationship classification

Whether document:

- supports;
- contradicts;
- is context only;
- requires follow-up

may be reviewer/system determination.

User may explain intended relevance, but final relationship is governed.

---

# 41. Evidence confidence

Likewise, evidence confidence may be derived or reviewer-controlled.

Do not make client choose `High confidence` for their own upload unless methodology explicitly defines user-supplied confidence.

---

# 42. Produced date

Important provenance field.

If exact date known:

store.

If not:

do not invent.

Potential:

`Date not known`.

---

# 43. Upload date ≠ produced date

Preserve both.

A 2024 document uploaded in 2026 is still produced in 2024.

---

# 44. Temporal lane

For live Deal:

private evidence may belong to different temporal contexts.

Potentially:

- PRE-T0;
- post-announcement / pre-close;
- post-close.

Temporal lane matters if forecast baseline/sealing exists.

Do not merge all evidence into one time bucket.

---

# 45. Pre-T0 immutability

If a forecast has been sealed:

later private evidence must not retroactively enter pre-T0 baseline.

It can create:

- a new analysis version;
- a formation-window delta;
- a post-close update.

But not rewrite locked history.

---

# 46. Formation-window evidence

Future commercial architecture may observe changes after transaction formation.

Private evidence added after T0 should be explicitly separated from sealed PRE-T0 baseline.

---

# 47. Evidence source party

User must not infer source party from uploader identity.

A consultant uploading a Target document does not make source party `Advisor`.

Source party means evidence origin/context.

---

# 48. Evidence owner vs source party

These are distinct:

- uploader;
- source party;
- document author/origin;
- Deal owner.

Future permissions may need all.

Do not collapse.

---

# 49. Document title

Prefer actual document title / meaningful title.

No automatic:

`Document 1`.

If filename exists, it can prefill title but user/reviewer can clarify without changing file identity.

---

# 50. File name vs evidence title

Retain both.

`board_pack_final_v7.pdf`

may have evidence title:

`Board integration governance pack`.

---

# 51. Storage reference

Current model requires a `storageReference`.

Client should not see raw storage path/key by default.

Use server-secure reference.

---

# 52. No filesystem path leakage

Never expose:

- internal bucket paths;
- signed secrets;
- local mount paths;
- evidence-room filesystem.

---

# 53. EvidenceItem ID

Internal.

May be used in technical audit view.

Not primary client identifier.

---

# 54. Evidence provenance card

Client-safe fields may include:

- title;
- type;
- source;
- produced date;
- review state;
- relation to current gap;
- access state.

---

# 55. Evidence detail surface

If opened:

show:

1. evidence identity;
2. provenance;
3. current review state;
4. where it is used;
5. any contradiction/follow-up status;
6. permitted preview/download action.

Do not expose internal analyst notes by default.

---

# 56. Preview

Preview only if:

- file type supported;
- permissions allow;
- secure renderer exists.

Do not promise inline preview universally.

---

# 57. Download

Download private document only if user has permission.

Do not assume upload permission = download permission for all collaborators.

---

# 58. Delete/remove evidence

Sensitive because evidence may already support a report.

Do not use simple trash action without lifecycle rule.

Potential distinctions:

- remove before review;
- withdraw from future use;
- retain audit record;
- cannot delete from sealed version.

Needs separate governance.

---

# 59. Version replacement

Replacing document should create version relationship, not silently overwrite, if evidence already used.

---

# 60. Duplicate detection

Potential helpful feature:

- same file hash;
- same storage reference;
- duplicate title/date.

Do not claim duplicate detection unless implemented.

---

# 61. Evidence provenance must survive report generation

Report claim should be traceable back to evidence item.

No copying extract into report without source link/provenance.

---

# 62. Evidence-to-question relationship

Current model supports `relevantQuestionIds`.

This is internal mapping.

Client may see business-readable relation:

`Supports decision-rights assessment`

rather than raw Q IDs.

---

# 63. Canonical questionnaire protection

Private evidence must not rewrite canonical answers automatically.

Document may:

- corroborate;
- contradict;
- add context;
- trigger follow-up.

It does not silently change respondent selected options.

---

# 64. Evidence-to-answer relationship

Current model supports:

- contradictsAnswerIds;
- corroboratesAnswerIds.

This is valuable.

Preserve as internal traceability.

---

# 65. Contradiction handling

If private document contradicts respondent evidence:

do not choose document automatically.

Create contradiction state.

Sequence:

```text
Document
↔ Respondent evidence conflict
→ contradiction
→ review / adjudication
→ report authority
```

---

# 66. “Document wins” anti-pattern

A document can be:

- outdated;
- aspirational;
- policy not practice;
- wrong entity;
- incomplete;
- superseded.

Therefore:

> documentary evidence is not automatically superior to live observation.

Weighting follows governing methodology.

---

# 67. “Respondent wins” anti-pattern

Symmetrically, direct observation does not automatically override documentary evidence.

Preserve contradiction.

---

# 68. Board material caution

Board/management presentations may describe intended state, not actual operation.

Review should distinguish:

- declared structure;
- observed structure.

UI need not expose theory, but provenance matters.

---

# 69. Org chart caution

Org chart can show formal reporting, not informal authority.

Do not let uploader cause deterministic authority inference.

---

# 70. Decision-rights documents

Highly relevant but still require:

- date;
- scope;
- whether draft/final;
- actual adoption if known.

---

# 71. Integration plan

Plan ≠ execution.

If report uses plan as evidence:

claim must remain framed as planned state unless later observed.

---

# 72. Retention/compensation data

Potentially highly sensitive.

Needs stricter permission/security handling.

Do not show individual compensation broadly in Deal Workspace.

---

# 73. Promotion/attrition history

Can be person-sensitive.

Avoid turning evidence surface into HR personnel database.

Aggregate or restrict as governed.

---

# 74. Leadership-change record

Can support timeline/outcome context.

Named person behavior must not be inferred from change record alone.

---

# 75. Interview note

Interview note is documentary artifact but source is human report.

Do not misclassify as direct observation automatically.

---

# 76. Dataroom extract

Preserve original source/document locator where possible.

Excerpt without source context is weaker.

---

# 77. Public record in Layer 2 model

Current evidence model includes `Public record`.

This does not mean all public-source FREE evidence should be copied into private Layer 2 store.

Avoid duplicate evidence universes.

Public-source pipeline should remain its own lane.

---

# 78. Why public record may still appear in Layer 2

Possible use:

- reviewer attaches a specific authoritative public filing to a finding;
- public source is formally linked to paid adjudication.

If so, retain its public provenance.

---

# 79. Evidence request should map to report gap

Every request should trace to:

- Decision Gap;
- report block;
- contradiction;
- specific unanswered question.

Generic evidence accumulation is prohibited.

---

# 80. No evidence hoarding

Do not encourage upload “just in case.”

This increases:

- security exposure;
- review cost;
- noise;
- hallucination risk;
- irrelevant contradictions.

---

# 81. Scope statement before upload

User should see:

`Why we need this`

and:

`How it may be used`.

Not legal essay; bounded operational purpose.

---

# 82. Evidence purpose example

`Purpose: determine whether final product decision authority will remain with the Target after close.`

Useful evidence:

- governance model;
- decision-rights matrix;
- integration plan.

---

# 83. Private evidence consent

Uploading indicates user intentionally provides material for analysis.

Exact legal consent belongs to policy/terms.

Do not invent legal language here.

---

# 84. Authorization to upload

Product may need user to confirm they are authorized to provide the document.

Exact checkbox/legal text must be counsel/policy-approved.

Do not improvise.

---

# 85. Security claims

Do not write:

- `bank-grade encryption`;
- `military-grade`;
- `SOC 2`;
- `end-to-end encrypted`;
- `zero knowledge`

unless currently true and authorized.

---

# 86. Security reassurance without overclaim

Safe generic direction:

`Private evidence is handled through the secure Deal workflow.`

Only after secure workflow exists.

Otherwise no claim.

---

# 87. Data residency

Not discussed in UI unless actual product policy requires.

No invented geography.

---

# 88. Retention period

Do not state retention duration unless policy/system exists.

Needs separate data-governance contract.

---

# 89. Model-training promise

Do not state whether documents are/aren't used for model training without actual policy authority.

This is a separate privacy/product policy matter.

---

# 90. Third-party processor disclosure

Separate security/legal surface.

Not uploader microcopy unless required.

---

# 91. Evidence access control

At minimum target architecture should be able to represent:

- uploader access;
- Deal creator access;
- restricted collaborator access;
- internal reviewer access;
- no respondent access by default.

Exact role model later.

---

# 92. Respondent must not see private documents automatically

Respondent evidence channel is separate.

Do not expose data room through questionnaire link.

---

# 93. Collaborator permissions

When collaboration exists, document visibility may vary.

Do not assume all collaborators can view retention/compensation data.

---

# 94. Individual data separation

42Q / person-level data must not be stored as ordinary Deal document item visible to general evidence users.

Separate stronger permission lane.

---

# 95. Sensitive categories

Potential highly sensitive evidence:

- compensation;
- personnel;
- individual performance;
- board materials;
- confidential deal terms.

UI should support restricted handling without creating broad exposure.

---

# 96. Classification labels

Do not invent security classifications such as:

- Confidential;
- Highly Confidential;
- Secret

unless access/security model defines them.

---

# 97. Evidence review workflow

Conceptual:

```text
Unreviewed
→ Under review
→ Verified / Disputed
```

Possible:

`Requires follow-up`

as relationship, not review status.

Do not add more statuses unless needed.

---

# 98. Unreviewed state

Means:

> item captured but not yet reviewed under governed process.

It does not mean poor quality.

---

# 99. Under review

Means processing/review active.

Do not show ETA unless SLA exists.

---

# 100. Verified

Needs scope.

Possible client explanation:

`Reviewed and accepted as usable evidence for the stated analytical purpose.`

Only if that matches actual governance.

---

# 101. Disputed

Means material issue remains.

Could be:

- source authenticity;
- applicability;
- contradiction;
- superseded state.

UI can show bounded reason if permitted.

---

# 102. Disputed evidence stays visible

Do not delete it to make report cleaner.

Counterevidence is part of provenance.

---

# 103. Evidence confidence

If shown to client:

clarify it applies to evidence item/use, not whole report.

Maybe better to keep internal until terminology is finalized.

---

# 104. Relationship to respondent evidence

Client-safe display could be:

`Supports existing evidence`

`Conflicts with existing evidence`

`Provides context`

`Follow-up required`

Do not expose respondent answer IDs.

---

# 105. Evidence count

Counts can be useful operationally:

`3 evidence items under review`

But count ≠ quality.

Do not show:

`Evidence completeness: 80%`

without defined denominator.

---

# 106. Current evidence coverage

Current engine computes:

- totalCount;
- verifiedCount;
- disputedCount;
- underReviewCount;
- unreviewedCount;
- documentSupportedCount;
- linkedFindingCount;
- risk categories covered;
- verified risk categories;
- missing risk categories.

These are useful internal/report primitives.

Not all belong in customer UI.

---

# 107. “Missing critical risk categories” caution

Current legacy evidence coverage computes coverage against current risk-category inventory.

Do not expose:

`7 risks uncovered`

without reviewing current product/methodology terminology.

---

# 108. No generic coverage progress bar

Coverage is multi-dimensional.

Avoid:

`Evidence coverage 65%`.

---

# 109. Evidence request completion

A request can be:

- fulfilled;
- partially fulfilled;
- cannot be fulfilled;
- not needed anymore.

This is separate from evidence review state.

---

# 110. Request status vs item status

Example:

Evidence request:

`Decision-rights evidence — Fulfilled`

Item:

`Governance model — Under review`

Keep distinct.

---

# 111. Multiple items can satisfy one request

Do not force one request = one file.

---

# 112. One item can support multiple questions

Current model supports relevant question arrays.

Preserve.

---

# 113. File preview annotations

Future analyst may annotate/extract.

Client view should not display internal highlight/annotation unless approved.

---

# 114. Analyst extract

Current model stores `analystExtract`.

This is internal/reviewer-derived text.

Do not treat as original-source quote.

If exposed:

label as interpretation/extract and preserve exact source locator.

---

# 115. Quote integrity

Do not paraphrase a direct document excerpt and present in quotes.

Report narrative can paraphrase as interpretation with source.

---

# 116. OCR / extraction

Automated extraction is not truth.

If extraction fails/ambiguous:

review needed.

UI can show:

`Processing failed`

rather than fabricated text.

---

# 117. Tables/spreadsheets

If evidence is spreadsheet:

parser may extract structured data.

But do not infer unsupported totals/relationships.

Separate technical ingestion spec needed.

---

# 118. Scanned documents

Same.

No OCR claim until implemented.

---

# 119. Password-protected files

If unsupported:

say:

`This file cannot be processed in its current form.`

Do not request password in insecure field.

---

# 120. Corrupt file

Bounded error.

Keep evidence request open.

---

# 121. Unsupported file

Bounded error.

No fake successful upload.

---

# 122. Processing failure

User can retry or provide another form.

Do not mark item reviewed.

---

# 123. Duplicate upload

If backend detects duplicate:

tell user.

But preserve legitimate version if needed.

---

# 124. Upload progress

Real byte progress only if available.

No fake 50/75/100 animation.

---

# 125. Batch upload

Not required first version.

One evidence request may accept multiple items.

But batch UI only if backend robust.

---

# 126. Drag-and-drop

Optional interaction.

Must also support keyboard/file picker.

---

# 127. Mobile upload

If supported, must work without desktop-only drag/drop.

---

# 128. External repository connectors

Potential future:

- Drive;
- Box;
- SharePoint;
- Dropbox;
- data room.

Do not add connector buttons until real integration/security exists.

---

# 129. Connected source ≠ automatically trusted

A file from enterprise Drive still needs provenance/review.

---

# 130. Bulk data-room integration

Separate future contract.

It requires:

- scope selection;
- access permissions;
- indexing;
- relevance filtering;
- deletion/revocation;
- processing cost controls.

Not part of first evidence uploader.

---

# 131. Evidence relevance filtering

System should not send every uploaded file into every analysis block.

Need bounded relation to:

- Decision Gap;
- question;
- finding;
- risk mechanism.

---

# 132. LLM document analysis boundary

LLM may assist extraction/summarization within governed pipeline.

It cannot:

- invent missing content;
- infer document authenticity;
- override contradictions;
- directly release client claim.

---

# 133. Document summary

If shown:

label:

`MergeVue summary`

or equivalent.

Do not confuse with original document.

---

# 134. Summary must preserve limitations

If source unclear:

summary should reflect uncertainty.

---

# 135. Document language

First product UI English.

Documents may be in other languages.

Do not promise multilingual extraction unless supported.

---

# 136. Translation

If evidence is translated:

retain original, translation provenance, method/version if material.

Do not silently treat machine translation as original.

---

# 137. Evidence integration to report

Sequence:

```text
Evidence item reviewed
→ relevant claims/findings updated
→ contradiction/triage
→ report projection regenerated
→ validators
→ report authority
→ new report version
```

No direct evidence-to-client conclusion bypass.

---

# 138. Report block congruence

Private evidence deepens same canonical blocks from `19`.

Example:

Public:

`Decision Gap — authority unresolved`

Private evidence:

`Decision-Rights Conflict Map` / relevant block gains stronger support.

Do not create separate “Private Insights” report with unrelated ontology.

---

# 139. Report version change

When private evidence changes conclusion:

user should see:

- new version;
- evidence scope;
- what materially changed.

Do not silently replace prior report.

---

# 140. Public baseline remains preserved

Always distinguish:

`Public evidence baseline`

from:

`Current analysis with private evidence`.

---

# 141. Evidence scope label

Potential:

`Evidence scope: Public + structured internal + private documents`

only if exact.

---

# 142. Do not call paid analysis “more accurate” automatically

More evidence can increase:

- coverage;
- confidence;
- contradiction.

It may also reduce confidence.

Use evidence-specific language.

---

# 143. Private evidence can weaken previous conclusion

This is legitimate.

Workspace should support:

`Previous conclusion weakened by new private evidence.`

---

# 144. Private evidence can falsify previous hypothesis

Also legitimate.

Do not hide because user paid.

---

# 145. Private evidence can remain inconclusive

Paid ≠ certainty.

---

# 146. Contradiction escalation

If private evidence materially conflicts:

report release may pause pending review.

Client-safe state:

`Additional review required`

or exact governed language.

---

# 147. Human analyst in paid lane

Paid private evidence may require human analyst/reviewer according to current architecture.

But UI should only promise human review if current product commitment says so.

---

# 148. Reviewer identity

Not necessary by default.

Status is enough.

---

# 149. Review SLA

Do not promise:

`Reviewed within 24 hours`

without actual operational SLA.

---

# 150. Evidence request generation

Can be system-suggested from Decision Gap.

But suggestions must be bounded and derived from report logic.

No LLM-generated arbitrary checklist without validation.

---

# 151. User-added evidence outside request

May be allowed:

`Add other relevant evidence`

but system should still require:

- title;
- type;
- source;
- relevance.

Avoid open dump.

---

# 152. “Other” evidence type

Current model has `Other evidence` and `Other` document type.

Keep for edge cases.

But ask short description.

---

# 153. Interview note as evidence item

If user adds interview note:

must distinguish:

- interview date;
- source party;
- note author;
- whether direct quote or summary if current system supports.

Do not pretend note is respondent questionnaire evidence.

---

# 154. Evidence source hierarchy

No universal hierarchy is defined here.

Methodology determines weight.

UI should not label one type “stronger” generically unless authorized.

---

# 155. Evidence provenance before preview beauty

A less polished but correctly sourced evidence item is better than rich document cards with ambiguous origin.

---

# 156. Document identity

Where possible preserve:

- original filename;
- title;
- version/date;
- source;
- hash/internal integrity metadata.

Client need not see hash.

---

# 157. Hashing

Backend may hash document for integrity/dedup.

Do not expose cryptographic hash as “proof of truth.”

---

# 158. Audit trail

Private evidence actions should be traceable internally:

- uploaded;
- reviewed;
- status changed;
- used in report;
- removed/withdrawn if allowed.

Client activity UI separate.

---

# 159. No audit-theater UI

Do not display 64-character hashes and call it trust.

Use meaningful provenance.

---

# 160. User comments

Not required first version.

If context needed, one bounded:

`Why this evidence is relevant`

field may help.

Do not build comment thread.

---

# 161. Notes vs evidence

User note should not automatically become evidence item unless provenance/schema supports.

---

# 162. Evidence request notes

Can be part of workflow, separate from source evidence.

---

# 163. Board material privacy

Consider restricted viewer access.

Do not preview in shared respondent links.

---

# 164. Compensation data privacy

Same, with stronger restriction.

No employee-level numbers in overview cards.

---

# 165. Personally identifiable information

Private documents may contain PII.

Security/data governance must address.

UX should not encourage unnecessary PII upload.

---

# 166. Data minimization copy

Where applicable:

`Upload only the material needed to resolve this evidence request.`

This is a useful product principle.

---

# 167. Redaction

Future useful capability.

Do not claim automatic redaction unless implemented.

---

# 168. User-prepared redacted version

Can be accepted like any other evidence, but should note it is redacted if known.

---

# 169. Evidence completeness

Never claim completeness based solely on upload count.

---

# 170. Evidence priority

If multiple requested documents:

priority may be shown only if method/report logic supports.

No arbitrary ranking by filename/type.

---

# 171. Review order

Operational internal concern.

Client need not see queue number.

---

# 172. Evidence request due date

Only if engagement process actually sets one.

Do not invent deadlines.

---

# 173. Notification

Future notifications:

- evidence received;
- review complete;
- follow-up requested;
- report update available.

Separate communications contract.

---

# 174. Email acknowledgment

Only if actual email notification exists.

No fake `We'll email you`.

---

# 175. Upload success copy

Good:

`Evidence received.`

Then state:

`Under review` if applicable.

Bad:

`Evidence verified successfully.`

immediately after upload.

---

# 176. Upload failure copy

`We couldn't upload this file. Your current analysis has not changed.`

Preserve Deal state.

---

# 177. Processing failure copy

`The file was received, but MergeVue could not process it.`

Then recovery path.

---

# 178. Review disputed copy

`This evidence conflicts with other material in the Deal and requires review.`

Avoid accusatory:

`Invalid document`.

unless invalidity actually established.

---

# 179. Follow-up request

If reviewer/system needs clarification:

show:

- question;
- related evidence;
- response action.

No generic support ticket.

---

# 180. Evidence item lifecycle

Conceptual:

```text
REQUESTED
→ RECEIVED
→ PROCESSING
→ READY_FOR_REVIEW
→ UNDER_REVIEW
→ VERIFIED / DISPUTED
→ INTEGRATED
```

Exact implementation enum may differ.

Do not force current `reviewStatus` enum to carry upload processing states.

---

# 181. Separate ingestion status from review status

Critical.

Example:

```text
ingestionStatus = processed
reviewStatus = unreviewed
```

This avoids semantic overload.

---

# 182. Separate review state from relationship

Example:

```text
reviewStatus = verified
relationship = contradicts
```

A verified document can contradict respondent evidence.

Do not assume verified = supportive.

---

# 183. Separate confidence from relationship

High-confidence evidence can:

- support;
- contradict;
- provide context.

Axes stay independent.

---

# 184. Separate source party from access permission

Acquirer-sourced document may be restricted from some acquirer collaborators.

Different axes.

---

# 185. Evidence card design

Potential card:

```text
Decision-rights matrix
Decision-rights document

Source: Target
Produced: Aug 28, 2026

Under review

Related to:
Decision authority after close
```

No risk score.

---

# 186. Evidence list filters

First version may not need filters.

If many items:

filters by:

- status;
- type;
- source party;
- related gap.

Do not filter by invented risk score.

---

# 187. Search

Useful when evidence volume grows.

Not required initially.

---

# 188. Sort

Default recent/relevance requires actual semantics.

Simple most recent received is acceptable operationally.

Do not sort verified above disputed as implied truth hierarchy unless user intent.

---

# 189. Evidence list badge discipline

Limit badges.

Potential:

- Under review;
- Disputed;
- Restricted.

Do not create badge soup.

---

# 190. Color

Use:

- neutral for unreviewed;
- informational for under review;
- status color for verified/disputed only with text.

Red does not mean “bad document”.

---

# 191. Accessibility

WCAG 2.2 AA target.

Need:

- file picker accessible;
- drag/drop alternative;
- progress announced;
- error associated with file;
- status in text;
- keyboard evidence actions;
- focus after upload;
- accessible table/list;
- no color-only review state.

---

# 192. Mobile

File picker should work.

Evidence cards stack.

Do not require drag/drop.

Long filenames wrap.

---

# 193. Large evidence detail

Metadata first.

Preview below/optional.

No horizontal overflow.

---

# 194. Upload modal vs page

Designer may choose based on complexity.

If user must provide:

- multiple metadata fields;
- request context;
- permissions;

a dedicated surface may be clearer than tiny modal.

---

# 195. Evidence request context must remain visible during upload

User should know:

> what question this file is intended to resolve.

Avoid detached generic uploader.

---

# 196. Cancel

Cancel before upload leaves no evidence item.

Cancel during upload follows backend capability.

Do not show fake deletion if transfer completed.

---

# 197. Retry

Retry should not create duplicate records if prior transfer actually succeeded.

Idempotency needed.

---

# 198. Server authority

Evidence existence, review state and integration state must be server-authoritative.

No client-only local evidence item as production truth.

---

# 199. Storage authority

`storageReference` must resolve to secured server-side object/reference.

No browser blob URL as persisted evidence.

---

# 200. Access check before metadata

Unauthorized user should not learn:

- title;
- filename;
- source;
- existence

of restricted evidence.

---

# 201. Signed URLs

If used, temporary signed URLs should not be stored/exposed as permanent storageReference.

Engineering detail, but important boundary.

---

# 202. Analytics

Allowed operational events:

```text
evidence_request_viewed
evidence_upload_started
evidence_upload_completed
evidence_processing_failed
evidence_review_status_viewed
evidence_follow_up_opened
report_update_after_evidence_viewed
```

Do not send:

- filename;
- document title;
- source text;
- extracted text;
- deal confidential metadata

to generic marketing analytics.

---

# 203. File-content analytics prohibited

Never send private document content to analytics tools.

---

# 204. Upload telemetry

Technical telemetry may need:

- file size;
- MIME;
- error code.

Keep separate from marketing analytics and protect appropriately.

---

# 205. No public indexing

Private evidence never becomes public case/source automatically.

---

# 206. Historical case evidence firewall

Client private evidence from a live Deal must not be reused in public historical case studies without separate authorization.

---

# 207. Cross-deal evidence firewall

Evidence belongs to one Deal by default.

Do not reuse document across Deals automatically.

---

# 208. Same company, different Deal

Still separate provenance.

A governance document could be relevant twice, but reuse must be explicit and temporally appropriate.

---

# 209. Temporal freshness

A governance model from previous year may not describe current structure.

Review should consider produced date.

Do not treat latest upload as latest document.

---

# 210. Superseded documents

If evidence indicates newer version:

old item stays traceable but may become superseded.

Current enum does not include superseded.

Do not invent state without workflow decision.

Potential future relationship/version field.

---

# 211. Draft vs final documents

If known, provenance should capture.

Do not infer from filename alone.

---

# 212. Evidence authenticity

System may not be able to authenticate a document cryptographically.

Do not use `Verified` to imply forensic authenticity unless that is actually checked.

---

# 213. User attestation

Can be useful but requires policy.

Not defined here.

---

# 214. Client-provided interpretation

If user writes context:

separate:

`User context`

from:

`Document content`.

Do not merge into source extract.

---

# 215. LLM extraction provenance

If machine-generated extract exists:

retain:

- source document;
- locator where possible;
- extraction version;
- review state.

Client may not need technical version.

---

# 216. Hallucination guard

If extractor cannot locate supporting text:

claim cannot be treated as documentary evidence.

---

# 217. Document-grounded claims

Each material claim from private document should bind to:

- evidence item;
- locator/excerpt if feasible;
- review state.

---

# 218. No freeform narrative as sole evidence integration

Do not store only:

`Analyst says document shows weak governance`.

Need underlying source reference.

---

# 219. Relationship to canonical report

Report narrative may summarize private evidence.

But evidence drawer/details must allow traceability for authorized users.

---

# 220. Report source visibility

If client has permission:

report can show:

`Private evidence (2)`

with bounded references.

If not:

`Private evidence — restricted`

while preserving claim access according to policy.

---

# 221. Expert view

Expert/adjudication view can show expanded evidence fields:

- internal IDs;
- question mappings;
- analyst extract;
- contradictory answers;
- alternative interpretation;
- decision controls.

Client view remains congruent at report-block level.

---

# 222. Analyst workflow relation

Current evidence items feed risk/report logic alongside analyst worksheet and contradiction/triage.

Do not build private evidence UI as independent side system.

---

# 223. Current risk-output coupling is internal, not UI authority

Current legacy risk engine can rank risk categories using evidence/analyst findings.

Do not expose those numeric risk scores automatically in the private-evidence screen.

---

# 224. Current risk category vocabulary review

Legacy risk labels include categories such as:

- Integration Fracture Risk;
- Leadership Accountability Risk;
- Decision-Rights Conflict Risk;
- Months 6–18 Failure Risk.

Some may be legacy/outdated public language.

Evidence UI should not expose these as primary categories until claims/methodology review.

---

# 225. Evidence relevance via Decision Gap is safer

Instead of asking uploader:

`Choose risk category`

prefer:

`This evidence was requested for: Decision authority after close`.

Internal risk linkage can be assigned later.

---

# 226. No client assignment of finding IDs

Never.

---

# 227. No client assignment of contradiction IDs

Never.

---

# 228. No client “mark verified”

Review state controlled by authorized process.

---

# 229. Reviewer action permissions

Separate internal/expert contract.

Client may upload/provide context, not self-verify.

---

# 230. Evidence removal before review

May be allowed if item accidentally uploaded and not integrated.

Needs secure backend behavior.

Do not assume.

---

# 231. Evidence withdrawal after integration

Must preserve audit/report history.

Separate lifecycle rule.

---

# 232. Report invalidation

If evidence later withdrawn/disputed:

current report may need re-review/version.

Workspace should be able to represent report no longer current.

---

# 233. “Current report” status

Potential:

`Update required`

if evidence state changes materially.

Do not leave stale report silently marked current.

---

# 234. Private evidence and payment state

Evidence upload must not open merely because client sees paid option.

Commercial authorization/engagement must exist if product requires paid access.

No insecure hidden route bypass.

---

# 235. Paid engagement gating

Server should enforce paid/private capability.

Frontend lock alone insufficient.

---

# 236. Payment failure does not delete already authorized evidence

Commercial lifecycle separate.

Access policy decides ongoing view/edit.

---

# 237. No paywall on previously provided evidence metadata without policy

If engagement ends, data access behavior requires contract.

Not defined here.

---

# 238. NDA

Private evidence may be subject to NDA.

Product can support secure handling.

Do not claim MergeVue itself establishes/fulfills client's NDA obligations.

---

# 239. Legal privilege

Do not claim privilege preservation.

This is legal matter outside product promise.

---

# 240. Regulated data

No broad claim of compliance with sector-specific regulations unless actual.

---

# 241. Personal data

Minimize.

Especially:

- compensation;
- retention;
- leadership/personnel history.

Use only where Deal analysis legitimately needs it.

---

# 242. No automated employment action

Even private evidence cannot authorize automated:

- firing;
- hiring;
- promotion;
- demotion.

Person-level decisions remain human-controlled and separately governed.

---

# 243. Specific-leader forecast

If private documents mention leader:

this does not substitute for required individual-data channel.

Named-leader behavioral forecast still requires 42Q/individual data under current rule.

---

# 244. Organizational evidence ≠ individual inference

Critical.

No:

```text
board deck + org chart
→ infer CEO personality
```

Forbidden.

---

# 245. Private evidence can support role dependency

It may support:

- role criticality;
- authority structure;
- decision process;
- retention exposure.

This is organizational/deal evidence.

Not personality diagnosis.

---

# 246. Economic inputs

Some private evidence may provide:

- deal value;
- compensation;
- retention economics.

These can feed economic modeling only under the separate governed economic path.

Upload does not automatically calculate exposure.

---

# 247. Currency and unit integrity

If economic data extracted:

preserve:

- currency;
- units;
- status;
- source.

No silent FX conversion.

---

# 248. Estimated vs confirmed

Current economics architecture distinguishes status.

Private evidence can strengthen status only if source supports.

---

# 249. Source conflict in economics

If two documents give different deal value:

create conflict/choose governed authoritative source.

Do not average automatically.

---

# 250. Private evidence status in Deal Workspace

Example:

```text
Private evidence
3 items received
1 under review
1 verified for current purpose
1 disputed

Decision gap:
Decision authority remains unresolved
```

Do not translate count into confidence percentage.

---

# 251. Evidence-request completion in Workspace

Example:

`Decision-rights evidence — Partially fulfilled`

if uploaded items still insufficient.

Only if workflow supports.

---

# 252. Client-facing item relation

Potential:

`Used in current report`

`Not yet integrated`

`Follow-up required`

These are more useful than raw finding IDs.

---

# 253. Evidence drawer in report

Potentially clicking source badge opens private evidence detail if permissions allow.

This supports report congruence/provenance.

---

# 254. No duplicate client/source text

Do not copy entire document into report.

Use bounded excerpt/paraphrase with link.

---

# 255. Source locator

Where possible:

- page;
- section;
- slide;
- sheet/cell;
- paragraph.

This improves verification.

---

# 256. Spreadsheet locator

Could include:

`Sheet: Compensation, rows 10–25`

if parser supports.

Do not invent.

---

# 257. Slide deck locator

`Slide 14`

if known.

---

# 258. Interview note locator

Timestamp/section if available.

---

# 259. File preview annotation as evidence locator

Future.

Not required first version.

---

# 260. Data-room source provenance

If extracted from data room:

retain original folder/document context where allowed.

Do not expose entire data-room path to unauthorized viewers.

---

# 261. Evidence “Other” description

Require short description.

Otherwise analyst cannot interpret.

---

# 262. Relationship “Context only”

Important valid state.

Not all evidence must support/contradict.

Preserve.

---

# 263. “Requires follow-up”

Valid outcome.

Evidence can create a new question rather than resolve one.

---

# 264. Follow-up creates new evidence request

Potential:

```text
Evidence item
→ Requires follow-up
→ new request
```

This is legitimate.

Do not treat as workflow failure.

---

# 265. Evidence request recursion control

Avoid endless document-request loops.

Each follow-up should tie to material decision relevance.

---

# 266. Anti-proliferation

Do not create a new evidence subsystem for every document type.

Reuse one evidence-item model with type-specific metadata.

---

# 267. Current evidence model limitations

Current model is useful but not sufficient for production ingestion because it lacks explicit fields for:

- ingestion status;
- access permissions;
- immutable file version;
- uploader identity;
- temporal lane;
- retention/security policy;
- file integrity metadata;
- processing errors.

These are target additions, not evidence that current model is wrong.

---

# 268. Schema evolution principle

Extend existing evidence model.

Do not fork:

`PrivateEvidenceV2`

with unrelated semantics unless migration requires.

---

# 269. Proposed target extensions

Conceptual only:

```text
uploaderUserId
ingestionStatus
processingStatus
accessPolicy
sourceProducedAt
temporalLane
fileVersion
contentHash?
mimeType
processingError?
evidenceRequestId
integratedReportVersion?
```

Needs engineering/security review.

---

# 270. No client-facing schema exposure

These are technical.

UI uses business labels.

---

# 271. Existing storageReference compatibility

Current model requires it.

Target backend can preserve mapping while storage architecture evolves.

---

# 272. Server persistence

Evidence must survive:

- page reload;
- browser restart;
- new authenticated session;
- report regeneration.

No session-only array as production persistence.

---

# 273. Current session evidence array is not final storage architecture

Current implementation stores evidence in session model.

Production Deal Workspace requires persistent server-backed Deal evidence store.

---

# 274. Migration

If legacy evidence/session exists:

migration must preserve IDs/provenance where possible.

Do not re-create as newly uploaded item.

---

# 275. Live surface audit

No dedicated customer-facing private evidence uploader has been established in the current audited `main`.

Therefore future implementation must explicitly mark:

> new surface built on existing evidence semantics.

Do not claim KEEP for a page that does not exist.

---

# 276. Visual direction

Use MergeVue work-surface canon:

- light background;
- white evidence panels;
- dark ink;
- restrained blue/navy;
- thin gray borders;
- 8px radius;
- no colorful file-type icons as dominant visual;
- compact status chips;
- readable metadata.

---

# 277. Avoid Dropbox clone aesthetic

Private evidence surface is not generic file manager.

Primary hierarchy:

```text
Decision gap
Evidence request
Evidence items
Review/integration state
```

Not folders first.

---

# 278. File icon use

Allowed as secondary affordance.

Do not make icon determine semantics without text.

---

# 279. Metadata density

Evidence work is metadata-heavy.

Desktop can use compact table/list.

Mobile stacks critical fields.

---

# 280. Recommended first-version ingestion screen

```text
Deal identity

Evidence request
Why this evidence is needed

Add evidence
[Select file]

Document type
Source
Produced date
Context

[Upload evidence]

Existing evidence for this request
Item · Status · Source · Date
```

Only real fields/capabilities.

---

# 281. Recommended evidence detail

```text
Title
Review state

Source / produced date
Document type
Related decision gap

File access / preview

Current relationship
Supports / contradicts / context / follow-up

Report use
Not yet integrated / Used in report version X
```

Exact labels governed.

---

# 282. Evidence request card in Workspace

Compact:

`Decision-rights evidence`

`Needed to resolve: final product authority after close`

`2 items received · 1 under review`

`Open request`

---

# 283. No permanent sales block

Once private engagement active:

evidence surface is work tool, not upsell page.

---

# 284. Commercial gate before entry

If user not entitled:

explain private evidence requires deeper engagement.

Do not show disabled uploader with fake file list.

---

# 285. After entitlement

Commercial messaging recedes.

---

# 286. Evidence request owner

Could be system-generated/analyst-generated.

Client does not need internal actor identity unless useful.

---

# 287. User-created request

Not needed first version.

No custom evidence-request builder.

---

# 288. Expert-requested evidence

If human reviewer requests follow-up:

client can see bounded request.

No internal analyst notes.

---

# 289. Request wording must be specific

Good:

`Provide the current decision-rights matrix for product and engineering.`

Bad:

`Upload governance docs`.

---

# 290. Evidence context field

Short user explanation can be helpful:

`This is the draft governance model approved by the integration steering committee.`

Treat as user-provided context, not document fact.

---

# 291. Draft/final status field

Potential if material and canonical.

Do not infer.

---

# 292. Source author

Potential but not mandatory for first version.

If needed, capture as provenance.

---

# 293. Confidentiality marker

Only if access model defines real behavior.

No decorative lock badge.

---

# 294. Download audit

If security requires tracking downloads, backend concern.

Client activity may not need display.

---

# 295. Secure viewer

Separate implementation.

No fake preview placeholder.

---

# 296. Evidence validation

Before item becomes complete:

required current fields include:

- title;
- item type;
- document type;
- source party;
- storage reference;
- valid review/confidence/relationship defaults.

Target ingestion may populate internal defaults server-side.

---

# 297. Defaults caution

Current model defaults:

- reviewStatus → unreviewed;
- confidence → medium;
- relationship → context.

For production target:

> internal defaults must not mislead UI.

Especially `medium` confidence may not be appropriate to expose immediately after upload.

UI can omit confidence until reviewed even if legacy internal default exists.

---

# 298. Legacy default ≠ public statement

Important.

Do not display:

`Confidence: Medium`

on fresh upload solely because current model default is medium.

---

# 299. Relationship default context

Same.

Fresh upload should not visually assert `Context only` unless relationship actually reviewed.

Schema may need nullable/unknown state in production evolution.

---

# 300. Review of current model defaults

Before production ingestion:

audit whether confidence/relationship defaults should remain.

This is an engineering/methodology act.

Do not silently change in UX contract.

---

# 301. Risk-category link

Current user-facing evidence upload should not require risk category.

Internal mapping can occur during review.

---

# 302. Current report integration shows evidence bullets

Current App/report path can render evidence items with:

- title;
- review status;
- document type;
- analyst extract/storage reference.

This demonstrates existing report consumption.

Target must improve privacy:

> never expose raw storage reference to ordinary client report.

---

# 303. analystExtract vs storageReference fallback defect

If current report output falls back to storageReference when no extract exists, this may leak implementation details.

Target client-facing renderer must not use raw storageReference as narrative content.

Use safe placeholder:

`Evidence item available`

or source title.

---

# 304. Private paths are not user copy

Absolute.

---

# 305. Evidence coverage in final report

Evidence coverage can inform limitations.

Do not expose internal coverage inventory mechanically.

Use client-safe:

`Private evidence coverage remains limited for decision authority.`

---

# 306. Evidence report wording

Avoid:

`No evidence exists.`

Prefer:

`No reviewed evidence has been provided for this question.`

when that is what system knows.

---

# 307. Distinguish not provided vs not existing

Critical.

---

# 308. Evidence request and report Decision Gap congruence

If report says:

`Need decision-rights evidence`

Workspace request must use same concept.

No naming drift.

---

# 309. Private evidence and source claims

Every client-facing source label must say whether source is:

- public;
- structured respondent;
- private document.

Do not merge.

---

# 310. Evidence source counts

If displayed:

separate classes.

Example:

`Public sources: 12 · Structured observations: 2 · Private evidence: 3`

only if counts exact/useful.

Not required.

---

# 311. Source count is not persuasion

Do not headline:

`We analyzed 146 documents`.

Quality/relevance more important.

---

# 312. No document volume tiering

Do not sell:

`Up to 50 documents`

as product value unless actual commercial model requires limits.

---

# 313. Cost/process protection

Backend may need upload limits to manage cost/security.

Present as operational limit, not analytical feature.

---

# 314. Privacy at upload

Do not show other private evidence item names in a respondent-facing context.

---

# 315. Workspace collaborator restrictions

Future evidence list should obey permission filtering server-side.

No client filter as security.

---

# 316. Evidence request confidentiality

Even request title can reveal sensitive Deal assumptions.

Unauthorized user must not see.

---

# 317. Deal access first

Before rendering any private evidence metadata:

server access decision.

---

# 318. Logged-out link

If user follows private evidence link while logged out:

authenticate then return if authorized.

Do not reveal metadata before auth.

---

# 319. Expired session

Same.

---

# 320. Share links

Not defined.

No evidence share link until separate contract.

---

# 321. External reviewer access

Future.

Separate access mode.

---

# 322. Download watermark

Not defined.

Do not invent.

---

# 323. Evidence archive

Future.

No broad archive UI first version.

---

# 324. Evidence export

Not defined.

Could be important for audit, but separate contract.

---

# 325. Data deletion

Separate lifecycle/legal contract.

No casual delete.

---

# 326. “Remove from analysis”

Could differ from delete.

Future governance needed.

---

# 327. Relevance dispute

Reviewer may mark evidence not relevant.

Current relationship options don't have `irrelevant`.

Do not invent client state without model decision.

Could use context/follow-up or model extension after audit.

---

# 328. Evidence supersession

Also missing current explicit state.

Requires model evolution.

---

# 329. Security incident state

Not in ordinary evidence UI.

Separate operational/security flow.

---

# 330. Upload throttling

Technical.

Client sees bounded retry/rate error if necessary.

---

# 331. Large batch processing

No estimated completion unless actual.

---

# 332. Background processing

If analysis takes long:

Workspace can retain status.

Do not require user keep tab open if backend supports async.

Do not claim async if not implemented.

---

# 333. Notifications suggestion

When review complete, potential notification.

But notification system separate.

---

# 334. Evidence-driven report update

Workspace can show:

`A new report version is available after private evidence review.`

Only when authority exists.

---

# 335. Diff view

Future:

`What changed`

claim-level.

Do not create freeform LLM summary without structured diff.

---

# 336. Public vs private report comparison

Possible:

- Environment reading changed;
- Decision Gap resolved;
- contradiction introduced;
- recommended action changed.

This is valuable.

Not required first uploader version.

---

# 337. Evidence cannot directly change locked forecast

If forecast locked:

new evidence belongs to subsequent version/verification lane.

No rewriting.

---

# 338. Outcome evidence

After event/outcome, private evidence used for verification is post-outcome lane.

Separate from forecast basis.

---

# 339. Historical case firewall

The pre/post distinction from `17` applies here too.

---

# 340. Security review gate

Before production private ingestion:

required separate security review for:

- upload path;
- storage;
- malware handling;
- authentication/authorization;
- signed access;
- logging;
- retention;
- deletion;
- sensitive categories.

This design contract cannot substitute.

---

# 341. Privacy review gate

Likewise for:

- PII;
- compensation;
- personnel history;
- 42Q separation;
- analytics;
- third parties.

---

# 342. Methodology review gate

Required for:

- new evidence types;
- new relationship states;
- confidence semantics;
- relevance mappings;
- report integration.

---

# 343. Commercial review gate

Required for:

- who can upload;
- included evidence depth;
- pricing/limits;
- consultation requirement;
- analyst review commitment.

---

# 344. Route decision gate

Required before creating exact new URL.

---

# 345. Backend readiness gate

Production uploader only if:

- authenticated Deal exists;
- server storage exists;
- access control exists;
- evidence item persistence exists;
- upload/processing failures recover;
- provenance fields persist;
- review states server-authoritative;
- report integration is governed.

---

# 346. No local-only prototype promotion

A local file picker that stores metadata in React/session is not production private evidence.

---

# 347. Block/source matrix

Before implementation:

| Target block | Existing source | Target-only addition | Authority |
|---|---|---|---|
| Evidence request | Decision Gap / report | request object | |
| Evidence item | `evidenceCapture.js` | persistent store | |
| Document type | existing options | none unless approved | |
| Source party | existing options | none unless approved | |
| Review state | existing options | processing state separate | |
| Relationship | existing options | none unless approved | |
| Provenance | current fields | uploader/temporal/access extensions | |
| Report use | current report engine | version linkage | |
| Access | account/Deal | private permissions | |

---

# 348. Current asset decision matrix

| Existing asset | Decision |
|---|---|
| `evidenceCapture.js` | **KEEP + EVOLVE** |
| Evidence item types | **KEEP** |
| Document type vocabulary | **KEEP / PUBLIC LABEL REVIEW** |
| Source party | **KEEP** |
| Review states | **KEEP / SCOPE LABEL REVIEW** |
| Confidence axis | **KEEP INTERNAL / CLIENT EXPOSURE REVIEW** |
| Relationship axis | **KEEP** |
| Relevant question IDs | **KEEP INTERNAL TRACEABILITY** |
| Contradicts/corroborates answer IDs | **KEEP INTERNAL** |
| Related finding IDs | **KEEP INTERNAL** |
| `storageReference` | **KEEP INTERNAL / DO NOT DISPLAY RAW** |
| Session evidence array | **NOT SUFFICIENT FOR PRODUCTION PERSISTENCE** |
| Customer uploader | **TARGET — NOT CURRENTLY ESTABLISHED** |
| Generic data room ingestion | **DO NOT ADD** |
| FREE document scoring | **FORBIDDEN** |

---

# 349. Target first-version capability matrix

| Capability | First version |
|---|---|
| Evidence request tied to Decision Gap | **YES** |
| Single/multiple bounded file upload | **IF BACKEND READY** |
| Document metadata | **YES** |
| Source party | **YES** |
| Produced date | **YES / unknown allowed if governed** |
| Review state | **YES** |
| Evidence relationship | **YES after review** |
| Secure persistent storage | **REQUIRED** |
| Access control | **REQUIRED** |
| Full data-room sync | **NO** |
| External connectors | **NO unless separately implemented** |
| AI bulk document chat | **NO** |
| Arbitrary folder hierarchy | **NO** |
| Person-level evidence storage | **SEPARATE LANE** |

---

# 350. WHAT WAS INTENTIONALLY REUSED

Before merge list:

- Layer 2 evidence model;
- item-type vocabulary;
- document-type vocabulary;
- source-party vocabulary;
- review states;
- relationship states;
- evidence coverage;
- contradiction linkages;
- report integration;
- Deal-centric evidence architecture.

---

# 351. WHAT IS NEW

Explicitly target-only until implemented:

- secure customer upload;
- evidence request surface;
- persistent Deal evidence store;
- ingestion/processing state;
- permission layer;
- uploader identity;
- temporal-lane metadata;
- file versioning;
- client-safe evidence detail;
- report-version linkage.

---

# 352. WHAT CHANGED AND WHY

Format:

```text
EXISTING PRIMITIVE
→ TARGET CLIENT SURFACE
→ NEED / DEFECT
→ SEMANTIC DELTA
→ AUTHORITY
```

Example:

```text
storageReference in Layer 2 evidence
→ secure evidence item link/preview
→ raw storage reference is implementation metadata and may leak internal storage
→ semantic delta: NONE to evidence identity
→ private-evidence security boundary
```

---

# 353. Acceptance criteria

Private evidence ingestion passes only if:

1. starts from explicit Decision Gap/evidence need;
2. public value already exists;
3. private evidence remains outside FREE scoring;
4. public and private document lanes stay distinct;
5. no generic data-room dump required;
6. requested evidence is minimal/relevant;
7. user can indicate evidence unavailable;
8. missing evidence not treated as negative;
9. customer uploader only exists when real backend/storage exists;
10. file upload is server-persisted;
11. access control server-side;
12. upload state distinct from review state;
13. review state distinct from relationship;
14. relationship distinct from confidence;
15. Uploaded ≠ Verified;
16. Processed ≠ Reviewed;
17. Reviewed ≠ Integrated;
18. Integrated ≠ Report released;
19. title retained;
20. item type retained;
21. document type retained;
22. source party retained;
23. produced date retained when known;
24. upload date not confused with produced date;
25. storageReference not exposed raw;
26. relevant question/finding linkage preserved internally;
27. contradiction/corroboration linkage preserved;
28. canonical questionnaire answers not silently changed by documents;
29. documentary conflict creates contradiction, not automatic override;
30. no “document always wins” rule;
31. public baseline preserved;
32. locked forecasts not rewritten;
33. report deepens same canonical blocks;
34. report version changes explicitly;
35. private evidence may weaken/falsify prior conclusion;
36. paid analysis may remain inconclusive;
37. no automated person-level behavioral inference;
38. specific-leader forecast still requires individual data;
39. no automated employment decisions;
40. no unsupported file types claimed;
41. no unsupported size limits claimed;
42. no fake malware/security claims;
43. no unsupported compliance claims;
44. no invented retention policy;
45. no raw private content in marketing analytics;
46. no secret-bearing URLs/tokens logged to analytics;
47. unauthorized users cannot see evidence metadata;
48. respondents cannot see private evidence by default;
49. collaborator permission not assumed universal;
50. highly sensitive evidence can be restricted;
51. evidence request remains visible during upload;
52. accessibility supports keyboard/file picker;
53. mobile upload works if feature supported;
54. no drag-and-drop-only interaction;
55. error/retry preserves Deal/report;
56. duplicate retries are idempotent;
57. evidence list does not become risk leaderboard;
58. no generic coverage percentage;
59. client cannot self-mark evidence verified;
60. client cannot assign finding/contradiction IDs;
61. analyst extract not confused with original source;
62. material claim remains traceable to source;
63. source locators preserved where available;
64. public/private evidence source classes remain explicit;
65. no public indexing;
66. no cross-Deal silent reuse;
67. no historical-case silent reuse;
68. sensitive person data minimized;
69. economic inputs preserve currency/status/source;
70. report validators/authority remain in path;
71. current evidence schema is evolved rather than forked without need;
72. legacy defaults are not automatically exposed as client truth;
73. raw storage reference never appears as report narrative;
74. security/privacy review occurs before production;
75. target-only capabilities remain labeled target until built.

---

# 354. Финальный принцип

> **A private document becomes useful to MergeVue only when it has provenance, a defined analytical purpose, a review state, and a traceable relationship to the Deal's evidence chain.**

> **Uploading more files is not deeper diligence. Resolving a material Decision Gap with better evidence is deeper diligence.**

> **Never turn a file transfer into an analytical conclusion. Ingest first, preserve provenance, review, reconcile, and only then allow the same canonical report to change.**
