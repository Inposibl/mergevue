# MERGEVUE M&A — MODEL ROUTING & VERIFICATION POLICY

**Version:** 1.0  
**Date:** 2026-09-08  
**Status:** OWNER-ACCEPTED — CONTROLLING MODEL ROUTING & VERIFICATION POLICY  
**Primary consumer:** ORCHESTRATOR (ChatGPT)  
**Scope:** Model selection, author/auditor separation, deterministic-vs-LLM proof allocation, fallback routing, and escalation for MergeVue M&A agent acts.  
**Authority boundary:** This document is subordinate to current explicit Owner instructions, `AGENTS.md`, active role mandates (`AGENTS_O.md`, `AGENTS_A.md`, `AGENTS_C.md`, `AGENTS_G.md`), Owner-accepted methodology/product decisions, and any later controlling routing decision. It does not itself authorize a role, source write, Git act, methodology change, or Owner acceptance.

---

## 1. PURPOSE

This policy routes each MergeVue task to the model best suited to the type of cognition and proof required, rather than using one model as a universal worker.

Operating objective:

```text
right task decomposition
→ right eligible actor
→ deterministic proof for mechanical invariants
→ independent semantic verification where judgment is required
→ Owner acceptance where authority is required
```

The policy is evidence-driven. It is based on observed MergeVue act history, especially the Exxon-Mobil factual-candidate correction sequence, where a capable model successfully performed large factual construction but repeatedly exhibited:

- hand-written report drift from generated data;
- relaxation of a strict semantic criterion during self-correction;
- self-authored validators that did not fully test the claimed property;
- finalization/provenance checks that looked stronger than the mechanics actually proved;
- eventual successful closure after mechanical invariants were converted into exact assertions, frozen-parent comparison, clean-build rules, forced-failure tests, and a fresh-process verifier.

The lesson is not that one model is globally “good” or “bad.”

> **Do not ask an LLM to be the sole authority for properties that can be proven mechanically, and do not ask an authoring model to independently certify its own semantic correctness.**

---

## 2. NON-NEGOTIABLE ROLE BOUNDARY

This policy does not create new project roles.

Current role eligibility remains governed by `AGENTS.md` and the active role mandates.

### ORCHESTRATOR
Eligible actor:
- ChatGPT

Primary function:
- decompose Owner intent;
- identify the smallest blocking dependency;
- select a lawful eligible actor;
- prepare bounded act envelopes;
- review returned evidence;
- separate author claims, mechanical proof, independent verification, and Owner acceptance;
- maintain controlling state.

The ORCHESTRATOR must not silently become CODER, independent AUDITOR, GIT AGENT, or Owner.

### ANALYST / AUDITOR
Eligible actors under the current router:
- Claude
- Codex
- Z-Ai

### CODER
Eligible actors under the current router:
- Grok
- Z-Ai
- Codex

### GIT AGENT
Eligible actor:
- Antigravity only.

### OWNER
Only the Owner may:
- accept/reject product direction;
- accept methodology changes;
- accept implementation;
- authorize Git closure;
- override routing;
- change role assignments.

Models outside the current router are not silently usable as project-role actors. They may be used only after an explicit Owner routing change or another lawful controlling update.

---

## 3. ROUTING PRINCIPLE: TASK SHAPE BEFORE MODEL NAME

Before choosing a model, classify the act by dominant failure risk:

1. MECHANICAL / DETERMINISTIC
2. FACTUAL RESEARCH / DOCUMENTARY CONSTRUCTION
3. SEMANTIC / METHODOLOGICAL REASONING
4. IMPLEMENTATION / CODING
5. INDEPENDENT VERIFICATION
6. PRODUCTION-CAUSAL / SECURITY / PERSISTENCE
7. GIT / REPOSITORY CLOSURE

Do not route by habit.
Do not route merely because a model is currently available.
Do not route a task to the same authoring model for independent verification.

---

## 4. MECHANICAL / DETERMINISTIC WORK

If a property can be proved by code, schema, exact-set comparison, hashing, parsing, graph closure, or reproducible enumeration, do not leave that property to LLM judgment.

Examples:
- counts;
- IDs and uniqueness;
- source-to-fact edge closure;
- bidirectional reference equality;
- coverage matrices and exact zero-cell inventories;
- SHA-256 identities;
- manifest integrity;
- file allowlists;
- exact physical-tree inventories;
- stale-file detection;
- temporal cutoffs;
- schema and enum validation;
- JSON parsing;
- exact path containment;
- report-summary numeric equality;
- source-file byte identity;
- parent/child lineage completeness;
- Git file inventory;
- exact diff/staging set.

Required pattern:

```text
LLM designs / interprets requirement
→ deterministic validator proves invariant
→ independent actor checks that validator tests the intended property when material
```

A self-authored validator is evidence, not independent proof.

For load-bearing validators, require at least one negative/forced-failure test where practical.

---

## 5. FACTUAL RESEARCH / DOCUMENTARY CASE CONSTRUCTION

Use the current Owner-established historical-case routing first.

Where the Owner has a standing case-family appointment, preserve it.

For the current historical corpus, Grok remains the standing principal factual author unless the Owner explicitly issues a case-specific override.

A case-specific override does not silently amend standing routing for later cases.

### Z-Ai

Z-Ai is suitable for:
- large structured factual extraction;
- source registries;
- case-local package construction;
- deterministic data transformations;
- reproducible manifests;
- large JSON factual layers;
- bounded correction acts;
- building mechanical validators around a well-defined contract.

Observed risk profile:
- may drift in hand-written terminal reporting;
- may locally relax a semantic criterion to achieve closure;
- may write a validator that proves a weaker property than the prose claim;
- may over-trust its own self-validation;
- may need explicit clean-build / frozen-parent / exact-equality controls for long invariant-heavy acts.

Therefore, when Z-Ai authors a high-sensitivity factual package:

```text
Z-Ai authoring
→ deterministic structural gate
→ fresh-process mechanical check when identity/finalization is material
→ different eligible model as independent semantic auditor
```

Z-Ai must not independently audit that package.

### Grok

Use Grok where it is the current Owner-appointed factual author or where broad documentary synthesis and case narrative construction are required within a closed factual contract.

Even when Grok is the standing author:
- structural invariants remain deterministic;
- author self-check is not independent audit;
- a different eligible AUDITOR is required for material factual seal.

---

## 6. SEMANTIC / METHODOLOGICAL ANALYSIS

For questions involving methodology meaning, theory-native inference, semantic atomicity, fact vs inference, source competence, counterevidence sufficiency, proposition scope, conflicting controlling sources, methodology change, historical bridge validity, or client-facing semantic fidelity, prefer the strongest available eligible model for long-horizon semantic consistency.

### Default preference

**Claude** — preferred for:
- semantic audits;
- methodology interpretation;
- contradiction-sensitive long-form reasoning;
- atomicity judgments;
- source-to-claim fidelity;
- detecting criterion drift;
- independent review of factual packages authored by another model.

**Codex** — preferred for:
- hybrid semantic + repository/source investigation;
- exact code/data-path inspection;
- checking whether prose claims correspond to actual mechanical behavior;
- specification-to-implementation consistency.

**Z-Ai** — use for:
- bounded analytical work with a strongly structured contract;
- large tables/ledgers;
- deterministic support;
- secondary challenge where independent of authorship.

For methodology-changing conclusions:

```text
eligible ANALYST
→ ORCHESTRATOR synthesis
→ Owner decision
```

No model may silently convert its analytical recommendation into methodology authority.

---

## 7. IMPLEMENTATION / CODING

Eligible actors remain:
- Grok
- Z-Ai
- Codex

### Codex — preferred when
- the change is code-dense and high-risk;
- repository mechanics and implementation semantics must be held together;
- exact diff scope matters;
- production wiring or complex TypeScript/runtime behavior is involved;
- tests/validators need to be designed against real behavior;
- subtle source/runtime divergence is likely.

### Grok — preferred when
- the implementation is broad but well-specified;
- sustained coding across multiple connected files is required;
- the Owner has a standing implementation assignment;
- speed plus competent structural implementation is useful and the semantic contract is already settled.

### Z-Ai — preferred when
- implementation is bounded and deterministic;
- code generation is tightly constrained by schema/contract;
- data transformation, manifest generation, or validator construction is central;
- exact write allowlists and post-write checks are available.

For Z-Ai coding on critical acts, do not let “validator PASS” become the main proof of correctness. Require independent review of whether the validator tests the actual human claim.

---

## 8. INDEPENDENT VERIFICATION ROUTING

### Hard rule

**The author of a material act must never independently verify that same act.**

```text
AUTHOR != INDEPENDENT AUDITOR
```

### Preferred pairings

| Author | Preferred independent auditor | Alternate |
|---|---|---|
| Z-Ai factual/semantic author | Claude | Codex |
| Claude analytical author | Codex | Z-Ai when the audit is highly structured/mechanical |
| Codex analytical author | Claude | Z-Ai for bounded structured dimensions |
| Grok implementation author | Codex | Claude when public semantics/methodology dominate |
| Z-Ai implementation author | Codex | Claude when semantic fidelity dominates |
| Codex implementation author | Claude | Z-Ai for mechanical/structured dimensions |

When possible, prefer a different model family for the independent audit to reduce correlated failure.

### Audit-type selection

Use **Claude** when the dominant question is:
- Does this mean what it claims?
- Is the proposition atomic?
- Is the evidence semantically sufficient?
- Did the author relax the criterion?
- Does the report overclaim?

Use **Codex** when the dominant question is:
- Does the code/data/runtime actually do this?
- Is the validator proving the intended property?
- Is the source graph mechanically closed?
- Is the production path wired?
- Does the exact diff implement the accepted contract?

Use **Z-Ai** as independent auditor only when:
- Z-Ai did not author the act;
- the task is strongly bounded;
- the audit is structured;
- deterministic or external-oracle evidence is available;
- the audit does not depend mainly on unconstrained long-horizon self-consistency.

---

## 9. CRITICAL ACTS: TWO-INTELLIGENCE RULE

For high-sensitivity acts use two distinct kinds of proof.

### Intelligence A — semantic/model reasoning
Required for:
- meaning;
- methodology;
- factual sufficiency;
- atomicity;
- counterevidence;
- source competence;
- scope;
- interpretation.

### Intelligence B — deterministic/mechanical proof
Required for:
- counts;
- hashes;
- manifests;
- exact path sets;
- IDs;
- graph closure;
- schemas;
- temporal boundaries;
- report census;
- runtime traces where applicable.

Preferred critical pattern:

```text
AUTHOR MODEL
→ deterministic gate
→ independent model auditor
→ ORCHESTRATOR review
→ Owner acceptance
```

Do not collapse any of these states.

---

## 10. SELF-AUDIT LIMIT

An authoring model may perform self-validation.

It may not convert self-validation into independent authority.

Allowed author statuses should remain candidate-scoped, for example:
- `COMPLETE`
- `CANDIDATE_COMPLETE`
- `READY_FOR_INDEPENDENT_VERIFICATION`
- other act-defined candidate statuses.

Do not treat `author says PASS` as independent verification.

Do not let the same model write a validator, run it, and use its green result as the sole proof of the semantic property the validator was designed to assert.

---

## 11. REPORTING-TRUTH RULE

Repeated MergeVue failures have shown that the factual/data artifact may be correct while the model's hand-written terminal report is wrong.

For material quantitative reports use:

```text
machine-readable final summary
→ deterministic render
→ human-readable report
```

Do not independently retype counts, file inventories, coverage numbers, graph counts, SHA values, contradiction counts, gap counts, or status censuses.

Where report truth is load-bearing:
- compare rendered report block to canonical summary by exact equality;
- include a forced-failure test;
- prefer fresh-process identity verification for frozen artifacts.

---

## 12. LONG-INVARIANT TASK RULE

When an act requires the model to hold many simultaneous invariants over a long execution, split the burden.

Do not solve reliability by only making the prompt longer.

Instead:
1. freeze the semantic contract;
2. separate invariants into machine-checkable vs judgment-required;
3. machine-check the former;
4. give the model a smaller semantic surface;
5. require exact stop conditions;
6. use immutable parent identities for correction chains;
7. use clean builds for finalization;
8. use an independent model for semantic closure.

A prompt may be comprehensive, but proof must not depend on the model remembering every clause.

---

## 13. RESOURCE / AVAILABILITY FALLBACK

Model availability is not authority.

When the preferred model is unavailable:
1. preserve the required role;
2. identify the next eligible actor for that role;
3. check independence;
4. preserve the same proof contract;
5. disclose the fallback;
6. if fallback materially changes risk, strengthen deterministic or independent verification;
7. never silently appoint an ineligible model.

If no eligible independent auditor is available:
- PARK the candidate;
- do not self-audit;
- do not lower the verification standard merely to maintain throughput.

A temporary case-specific override does not change standing routing unless the Owner explicitly says so.

---

## 14. ESCALATION RULES

Escalate to the Owner only for irreducible judgment or authority.

Do not ask the Owner to decide:
- a fact answerable from controlling source;
- a count answerable by code;
- a routing question already settled by the router;
- a repository fact answerable by inspection;
- whether a validator proves equality when that can be tested mechanically.

Escalate when:
- methodology choices remain genuinely open;
- two lawful product outcomes exist;
- an eligible actor must be reassigned;
- a standing route must change;
- source writes require authorization;
- Git closure requires authorization;
- Owner acceptance is the next gate.

---

## 15. HISTORICAL CASE PROGRAM — DEFAULT PATTERN

For the 10-case historical corpus, unless the Owner changes the route:

```text
1. factual author
2. deterministic structural package checks
3. independent factual / semantic auditor
4. Owner factual seal
5. A5-compatible module construction
6. PARK
```

No rater launch during case construction.
No Environment inference during factual baseline construction.
No outcome reveal to repair PRE-T0 evidence.
No A5 before factual seal.

For factual-author corrections:
- preserve immutable prior candidate identities;
- correction acts are bounded;
- independent verification happens only after author-side closure;
- the author never becomes the independent verifier.

---

## 16. PRODUCTION / SECURITY / PERSISTENCE ACTS

For causally significant claims, model routing alone is insufficient.

Apply the controlling causal-proof policy.

Required shape:

```text
real entrypoint
→ required target chain
→ authoritative result or canonical failure
→ real downstream consumer
→ observable consequence
```

Also require, as applicable:
- forced failure;
- bypass resistance;
- non-regression;
- contract tests;
- runtime evidence;
- canary/smoke evidence.

Preferred routing:
- Codex for code/path-centric implementation or verification;
- Claude for semantic/public-claim review;
- different eligible actor from the author for independent audit.

---

## 17. GIT ROUTING

Git handling is not a model-choice optimization problem.

Route Git only to:

**Antigravity**

and only under exact Owner authorization.

Default:
- local commit only when authorized;
- no push unless the Owner explicitly overrides the default;
- unrelated worktree contamination must be reported, not cleaned or absorbed.

No ANALYST, CODER, ORCHESTRATOR, or AUDITOR substitutes for the GIT AGENT.

---

## 18. MODEL PERFORMANCE IS DYNAMIC

This policy records current observed task-fit, not permanent intelligence rankings.

Do not assume:
- a model that failed one long act is globally weak;
- a model that succeeded once is globally best;
- a faster model is less capable in every dimension;
- a stronger reasoning model eliminates the need for deterministic proof.

Update routing only when repeated observed project evidence justifies it.

A proposed durable routing change remains a candidate until the Owner accepts it.

---

## 19. ORCHESTRATOR PRE-ROUTING CHECKLIST

Before every material act, answer:

1. What is the exact human claim?
2. What project layer is this?
3. Is the semantic decision already authorized?
4. What can be proven deterministically?
5. What still requires model judgment?
6. Who is the best currently eligible author for that judgment?
7. Who can independently verify it without authorship conflict?
8. What failure mode is most likely for this task shape?
9. What forced-failure or negative test is appropriate?
10. What must remain frozen?
11. What is the exact stopping point?
12. What is the one smallest blocking dependency?

If the act cannot answer these, it is not ready to route.

---

## 20. ROUTING QUICK REFERENCE

| Task shape | Preferred route |
|---|---|
| Methodology / semantic interpretation | Claude ANALYST → ORCHESTRATOR → Owner if decision changes methodology |
| Hybrid source + code/runtime investigation | Codex ANALYST |
| Historical factual authoring | Current Owner-appointed case author; standing Grok route unless explicitly overridden |
| Large structured factual/data package | Z-Ai ANALYST + deterministic gate + independent Claude/Codex audit |
| Complex/high-risk implementation | Codex CODER or current Owner-appointed CODER |
| Broad well-specified implementation | Grok CODER |
| Bounded deterministic implementation/data tooling | Z-Ai CODER |
| Semantic factual audit | Claude AUDITOR |
| Code/runtime causal audit | Codex AUDITOR |
| Structured mechanical audit | independent Z-Ai AUDITOR when not author and when external/mechanical oracle exists |
| Git closure | Antigravity only |
| Acceptance / methodology change / routing override | Owner only |

---

## 21. EXXON-MOBIL RETROSPECTIVE LESSON

The Exxon-Mobil correction chain established a reusable project lesson.

A capable authoring model can:
- find and structure a large factual corpus;
- create substantial useful code;
- repair its own errors when given precise evidence;

while still repeatedly failing at:
- exhaustive self-consistency;
- exact semantic-criterion preservation;
- validator adequacy;
- report truthfulness;
- proof of finalization.

The successful resolution was not “use a smarter prompt forever.”

It was:

```text
semantic criterion made explicit
+ mechanical invariants converted to assertions
+ immutable parent identities
+ exact set equality
+ clean builds
+ single-source report truth
+ forced-failure tests
+ fresh-process verification
+ independent-auditor boundary preserved
```

Reuse that pattern whenever the cost of a false COMPLETE is high.

---

## 22. STATUS LANGUAGE

Keep these dimensions separate:

```text
AUTHORED
SELF-VALIDATED
MECHANICALLY VERIFIED
INDEPENDENTLY VERIFIED
OWNER-ACCEPTED
FACTUALLY SEALED
IMPLEMENTED
GIT-CLOSED
REMOTE-PUSHED
PRODUCTION-PROVEN
```

Never collapse them into one generic `DONE`.

---

## 23. CLOSING RULE

**Route by task shape, not habit.  
Use models for judgment and code for invariants.  
Never let the author be its own independent auditor.  
Prefer different model families for independent review when possible.  
Do not solve long-invariant reliability with prompt length alone.  
Treat validators as evidence, not authority.  
Keep Owner acceptance separate from model confidence.**

---

## OWNER DECISION

**ACCEPTED.**

OWNER ACCEPTS MERGEVUE MODEL ROUTING & VERIFICATION POLICY v1.0 as controlling project policy, subordinate to current explicit Owner instructions, `AGENTS.md`, active role mandates, controlling methodology, current status authority, and case-specific routing overrides. It does not itself authorize implementation, methodology changes, Git acts, or Owner acceptance.

Owner: Nikolai Petyaev
Date: 2026-09-08
