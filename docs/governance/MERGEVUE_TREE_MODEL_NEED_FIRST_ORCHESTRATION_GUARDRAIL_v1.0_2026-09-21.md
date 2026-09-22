# MERGEVUE — TREE / MODEL-NEED FIRST ORCHESTRATION GUARDRAIL

**Version:** 1.0  
**Date:** 2026-09-21  
**Status:** OWNER-DIRECTED ORCHESTRATION GUARDRAIL  
**Scope:** all future MergeVue analytical, evidence-ingress, retrieval, methodology, implementation, correction, validation, and report-product workstreams.

---

# 0. PURPOSE

This document controls the order in which MergeVue work must be reasoned about and routed.

It exists to prevent error-driven development, local optimization, legacy-track inertia, and technically correct work on architecture that no longer serves the current model or Control Tree.

The governing rule is:

> **DO NOT START FROM THE ERROR. START FROM THE CURRENT TREE AND THE MODEL'S CURRENT DATA NEED.**

Every next act must be derived in this order:

`CURRENT CONTROLLING TREE / OWNER AUTHORITY`
→ `CURRENT MODEL / ANALYTICAL DATA NEED`
→ `REQUIRED SOURCE → MECHANISM → TREE → MATH CAUSAL PATH`
→ `CURRENT IMPLEMENTATION / RUNTIME`
→ `ACTUAL GAP OR DEFECT`
→ `SMALLEST LAWFUL CORRECTION`
→ `INDEPENDENT VERIFICATION`
→ `STATE REBASE`

An implementation defect is not, by itself, authority to repair that implementation.

A previous plan is not, by itself, authority to continue that plan.

A failed audit is not, by itself, authority to correct the failed component.

---

# 1. AUTHORITY ORDER

Before every substantive act, verify the currently controlling authority stack.

At minimum determine:

1. latest explicit Owner instruction;
2. current Control Tree and any binding addenda;
3. current Root Theory / methodology authorities;
4. current governing mathematical authority;
5. current evidence-ingress / analytical-ingestion authority;
6. current report-product authority where report/client projection is involved;
7. current runtime / implementation state;
8. current accepted, failed, held, parked, superseded, or unclosed workstreams.

Do not rely on:
- stale handoffs;
- old session assumptions;
- historical design intent;
- superseded candidate artifacts;
- unverified WORKBENCH material;
- implementation behavior as methodology authority.

If a newer controlling authority changes the relevance of an older workstream, reclassify the older workstream before continuing it.

---

# 2. MANDATORY PRE-ACT ORCHESTRATION GATE

Before authorizing, drafting, routing, correcting, or implementing any next act, answer these questions in order.

## Gate A — What is the current controlling state?

Identify:
- current Owner decision;
- current Control Tree node;
- current methodology/math authority;
- current product/report authority if relevant;
- current Git/runtime baseline;
- current active workstream;
- any unresolved blocking state.

If this cannot be established, stop.

Terminal state:

`BLOCKED_CURRENT_STATE_NOT_ESTABLISHED`

---

## Gate B — What specific data or analytical object does the model need next?

Do not begin from a file type, API endpoint, parser, validator, or prior bug.

Identify the exact downstream need, for example:
- a required discriminator;
- a mechanism proposition;
- a temporal fact;
- a governance fact;
- an admissible evidence field;
- an Environment-resolution input;
- an ECS/math input;
- a report projection input already established upstream.

State the need in model terms, not implementation terms.

Bad:

> “We need to fix 10-K parsing.”

Good:

> “The model still lacks admissible evidence for discriminator X / mechanism Y required by downstream Environment resolution.”

If no current model need is established, do not continue the technical track.

Terminal state:

`NO_CURRENT_MODEL_NEED_ESTABLISHED`

---

## Gate C — What causal path must the data satisfy?

For every material data source or analytical input, establish the lawful causal chain:

`SOURCE`
→ `OBSERVED / ADMISSIBLE PROPOSITION`
→ `MECHANISM / DISCRIMINATOR`
→ `ENVIRONMENT-TREE SEMANTICS`
→ `DOWNSTREAM MATH / ECS / ANALYTICAL OBJECT`
→ `REPORT PROJECTION`, if applicable.

Do not admit evidence merely because:
- it is available;
- it is structured;
- it is easy to retrieve;
- it appears relevant in generic M&A practice;
- an LLM can summarize it.

If the path from source to downstream consumer cannot be established, the source is not yet justified for analytical ingestion.

Terminal state:

`CAUSAL_PATH_NOT_ESTABLISHED`

---

# 3. SOURCE SELECTION RULE

Source selection must follow model need.

Do not use:

`AVAILABLE DOCUMENT → EXTRACT EVERYTHING → SEARCH FOR USE`

Use:

`MODEL NEED`
→ `MOST COMPETENT LAWFUL SOURCE CLASS`
→ `BOUNDED COLLECTION`
→ `ADMISSIBLE PROPOSITIONS`
→ `DOWNSTREAM SUFFICIENCY TEST`.

For FREE public evidence, apply the Owner-authorized value-ranked evidence acquisition rule:

> Document classes are selected by their expected ability to close specific methodological discriminators.

> Collection expands sequentially only while evidence remains insufficient for lawful bounded analysis.

> Once predefined sufficiency is reached, collection stops.

> Unreviewed remainder is not treated as searched and creates no negative evidence.

> The result remains explicitly bounded to the evidence envelope actually examined.

Do not equate:
- document quantity with evidence quality;
- text volume with information value;
- retrieval success with analytical sufficiency;
- model confidence with evidence sufficiency;
- absence in searched material with universal absence.

---

# 4. ERROR-FIRST DEVELOPMENT IS PROHIBITED

When a bug, FAIL, BLOCKING finding, or runtime defect is discovered, do not automatically authorize a correction.

First perform a state rebase:

1. Does the current Control Tree still require this component?
2. Does the current model still need the data this component was designed to deliver?
3. Is the source/document class still high-value under the current acquisition strategy?
4. Is the failed component still on the shortest lawful causal path to the needed analytical input?
5. Has a newer Owner decision changed the architecture?
6. Would repairing this component preserve a stale assumption?
7. Is there now a smaller or more direct route to the model need?

Only after these questions are answered may the defect become a correction target.

A defect may be classified as:

- `STILL_LOAD_BEARING`
- `SUBORDINATE_COMPONENT`
- `DEFERRED`
- `SUPERSEDED`
- `NO_LONGER_REQUIRED`

Only `STILL_LOAD_BEARING` defects should normally receive immediate correction priority.

---

# 5. STATE REBASE AFTER EVERY MATERIAL ACT

After every act that changes any of the following:

- Owner decision;
- methodology;
- mathematical authority;
- Control Tree;
- evidence-ingress contract;
- report-product authority;
- runtime implementation;
- independent verification state;
- Git-closed state;
- production state;

perform a fresh `STATE REBASE` before routing the next act.

The rebase must answer:

1. What changed?
2. What is now controlling?
3. What previous assumption is no longer safe?
4. What model need is now highest priority?
5. What workstream is now load-bearing?
6. What previously planned work is now unnecessary, subordinate, or premature?
7. What is the smallest next act?

Never chain acts merely because they were preplanned.

---

# 6. TREE-FIRST RULE

The current Control Tree is not a reporting artifact. It is a routing constraint.

For every proposed act, identify:

- which current tree node it advances;
- which blocking parent dependency it relies on;
- which downstream node consumes its result;
- whether the act is on the current critical path.

If an act cannot be placed on the current controlling tree, it must not be treated as roadmap work.

If an act is technically useful but not on the current critical path, classify it as:

`DEFERRED_R&D`
or
`NON-CRITICAL SUPPORT`

unless the Owner explicitly elevates it.

---

# 7. MODEL-NEED FIRST RULE

The model's need must be expressed in specific data terms.

Do not write vague needs such as:
- “more evidence”;
- “better SEC data”;
- “more complete filings”;
- “higher confidence.”

Specify:

- exact proposition class;
- exact discriminator/mechanism;
- exact temporal requirement;
- exact company/side scope;
- exact downstream consumer;
- exact unresolved alternative, if applicable;
- exact admissibility requirement;
- exact sufficiency condition already defined by governing methodology, where available.

If sufficiency is not defined by current authority, do not invent it.

Return:

`OWNER_DECISION_REQUIRED`

with one precise decision frame.

---

# 8. IMPLEMENTATION MUST FOLLOW ANALYTICAL NECESSITY

Implementation architecture must not dictate methodology.

Examples:

Wrong:
- API only exposes 10-K, therefore 10-K becomes primary evidence.
- current parser handles HTML, therefore HTML-rich filings become preferred.
- one SEC endpoint is easier, therefore its content defines the evidence universe.
- existing runtime expects one source family, therefore the methodology is narrowed to that family.

Correct:
- methodology identifies the needed discriminator;
- source ranking identifies the most competent document class;
- retrieval architecture is then adapted to acquire that class lawfully.

Engineering convenience is subordinate to analytical need.

---

# 9. RETRIEVAL / INGESTION CAUSAL PROOF

For any retrieval or ingestion implementation claimed to serve analysis, prove:

1. real entrypoint;
2. exact source authority;
3. exact byte/document identity where required;
4. exact parsed proposition;
5. exact admissibility transformation;
6. exact mechanism/discriminator binding;
7. exact Environment-tree consumer;
8. exact downstream math/ECS consumer where applicable;
9. success consequence;
10. forced-failure consequence;
11. no bypass around the authoritative path.

Do not accept:

`helper exists`
or
`validator passes`

as proof that analytical ingestion is causally connected.

---

# 10. CORRECTION PRIORITY RULE

Correction priority is:

`CURRENT MODEL BLOCKER`
>
`CURRENT CAUSAL-PATH DEFECT`
>
`CURRENT RUNTIME DEFECT`
>
`LOCAL CODE QUALITY`
>
`LEGACY DEFECT`

A severe defect in a non-load-bearing component may be lower priority than a small defect blocking the current model path.

Severity alone does not define roadmap priority.

---

# 11. VALUE-RANKED EVIDENCE ACQUISITION — STANDING ORCHESTRATION RULE

For FREE public-company evidence acquisition:

1. Start from unresolved methodological discriminator.
2. Identify the most competent lawful document class.
3. Collect only the bounded material required by the current protocol.
4. Admit only evidence with a proven source→mechanism→tree path.
5. Re-evaluate sufficiency.
6. If insufficient, expand to the next ranked source/document class.
7. If sufficient, STOP.
8. Record what was consulted.
9. Record what remains unreviewed.
10. Do not convert unreviewed remainder into negative evidence.
11. Do not claim exhaustive public research unless exhaustive search actually occurred.
12. Do not continue collection merely because more documents exist.

The ordering must be pre-governed or derived from controlling methodology/evidence, not selected opportunistically after seeing a desired conclusion.

---

# 12. STOPPING-BIAS CONTROL

Stopping after sufficiency must not become confirmation bias.

Before stopping, verify:

- strongest material alternative has been handled as required by governing methodology;
- no mandatory counterevidence-capable source class remains unsearched for the unresolved discriminator;
- no contradiction requiring escalation remains open;
- the stop condition was defined before seeing the desired final conclusion;
- the report/result will remain bounded to the actual evidence envelope.

Do not continue to lower-ranked sources merely because they might hypothetically change the result, unless the governing acquisition protocol requires them.

FREE is bounded analysis, not exhaustive public due diligence.

---

# 13. REPORT-PRODUCT BOUNDARY

The report is downstream projection only.

Before any report/UI/PDF/Brief/PPTX act, verify:

`EVIDENCE`
→ `ENVIRONMENT SEMANTICS`
→ `GOVERNING MATH`
→ `TRANSACTION-SPECIFIC ANALYTICAL OBJECT`
→ `CLIENT-SAFE PROJECTION`.

The report layer must not create:
- new evidence;
- new mechanisms;
- new rankings;
- new scores;
- new confidence;
- new causal certainty;
- new analytical truth.

If report needs data that upstream model does not lawfully produce, return upstream.

Do not solve it in the report layer.

---

# 14. WORKSTREAM CONTINUATION RULE

Before continuing an existing workstream, explicitly answer:

**CONTINUE / REBASE / DEFER / SUPERSEDE?**

Use:

### CONTINUE
when current tree, model need, causal path, and implementation architecture still align.

### REBASE
when the need remains but controlling authority or architecture changed.

### DEFER
when useful but not currently load-bearing.

### SUPERSEDE
when a newer strategy removes the old assumption or makes the old architecture strategically wrong.

Do not silently continue a workstream across an Owner decision that changes its premise.

---

# 15. REQUIRED ORCHESTRATOR OUTPUT BEFORE EACH NEW ACT

Before drafting the next agent prompt, the ORCHESTRATOR should internally or explicitly establish:

1. **CURRENT TREE NODE**
2. **CURRENT CONTROLLING AUTHORITY**
3. **CURRENT MODEL DATA NEED**
4. **SOURCE / DATA TYPE REQUIRED**
5. **CAUSAL PATH TO DOWNSTREAM MODEL**
6. **CURRENT IMPLEMENTATION STATE**
7. **ACTUAL BLOCKER**
8. **WHY THIS BLOCKER IS LOAD-BEARING**
9. **WHY THE PROPOSED ACT IS THE SMALLEST NEXT ACT**
10. **WHAT IS EXPLICITLY NOT AUTHORIZED**
11. **WHAT STATE CHANGE WILL TRIGGER THE NEXT REBASE**

If any of 1–8 cannot be established, do not route implementation.

---

# 16. OWNER DECISION BOUNDARY

Do not ask the Owner to decide matters already determined by controlling authority.

Do ask the Owner when:

- two lawful architectures remain and choosing one changes methodology/governance;
- sufficiency requires a new normative threshold;
- source priority cannot be derived from evidence;
- pair symmetry vs side-specific behavior is unresolved by existing authority;
- a proposed fix would change scope or meaning rather than mechanics.

Ask one precise decision at a time.

Do not bundle unrelated choices.

---

# 17. ANTI-PATTERNS

Prohibited orchestration patterns:

- “The auditor found F-2, therefore fix F-2 next.”
- “The old plan says 10-K, therefore continue 10-K.”
- “We already spent time building it, therefore finish it.”
- “This source is easy to retrieve, therefore ingest it.”
- “More documents must mean better analysis.”
- “The model is confident, therefore stop.”
- “The validator passes, therefore integration is proven.”
- “The report needs it, therefore invent it upstream.”
- “The code already has a field, therefore the methodology should use it.”
- “The source contains useful information, therefore it belongs in the analytical plane.”
- “The next act was already drafted, therefore execute it without state rebase.”

---

# 18. DEFAULT PRIORITY FORMULA

When choosing among candidate next acts, use this qualitative order:

**Highest priority**
- directly blocks a current model-required analytical input;
- lies on the proven source→mechanism→tree→math path;
- required by current Control Tree;
- smallest act that changes the controlling state.

**Lower priority**
- improves reliability of a subordinate path;
- broadens evidence coverage beyond current sufficiency;
- improves developer ergonomics;
- repairs a legacy component not currently needed;
- optimizes performance before correctness/necessity is established.

Do not create synthetic numeric priority scores unless separately authorized.

---

# 19. GOVERNING SHORT FORM

When context is limited, preserve this exact short-form rule:

> **TREE FIRST. MODEL NEED SECOND. CAUSAL DATA PATH THIRD. IMPLEMENTATION FOURTH. ERROR CORRECTION FIFTH. STATE REBASE AFTER EVERY MATERIAL CHANGE.**

And for evidence acquisition:

> **DO NOT SEARCH BECAUSE A DOCUMENT EXISTS. SEARCH BECAUSE THE MODEL NEEDS A SPECIFIC LAWFUL PROPOSITION. STOP WHEN PREDEFINED SUFFICIENCY IS REACHED; UNREVIEWED REMAINDER STAYS UNREVIEWED.**

---

# 20. TERMINAL PRINCIPLE

MergeVue work must optimize the shortest lawful path to a model-usable analytical state, not the shortest path to fixing the latest visible technical error.

A technically perfect component that no longer serves the current analytical need is not progress.

A small correction that restores a proven model-critical causal path is progress.

When in doubt:

**re-read the current tree, identify the model's exact missing data, prove the causal path, and only then touch the error.**
