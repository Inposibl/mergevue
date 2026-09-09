# MERGEVUE — POST-FREE ENGINEERING OPTIMIZATION TRACK

**Document:** `MERGEVUE_POST_FREE_ENGINEERING_OPTIMIZATION_TRACK_2026-09-05.md`  
**Date:** 2026-09-05  
**Owner state:** `OWNER-DIRECTED / DEFERRED UNTIL FREE RELEASE`  
**Primary future workstream:** `PERF-0 — PRODUCTION RESOURCE / COMPLEXITY / CONCURRENCY AUDIT`

---

## 1. OWNER DECISION

Engineering optimization is intentionally **deferred until after the FREE release**.

This workstream must not distract from the current MergeVue methodology, historical-case, ASTRA, factual-seal, report, and release-critical work.

The trigger for reopening this track is:

`FREE RELEASE COMPLETED`

Only after that trigger should MergeVue begin the dedicated engineering-performance audit described below.

---

## 2. GOVERNING ENGINEERING PRINCIPLE

The problem is **not** that MergeVue uses a high-level / garbage-collected language.

The governing principle is:

> Abstractions are useful only when the engineering team still understands and constrains their real resource cost.

The future audit must therefore focus on:

- bounded resource consumption;
- algorithmic complexity;
- concurrency behavior;
- memory / heap growth;
- runtime saturation;
- external-provider failure behavior;
- database and persistence pressure;
- report / PDF generation cost;
- large-document and large-evidence behavior;
- maintainability and architectural concentration;
- semantic consistency across runtime, report, validation, and presentation paths.

A language rewrite is not an objective.

Measurement comes first.

---

## 3. CURRENT RISK HIERARCHY

### 3.1 Language choice itself

`LOW RISK`

TypeScript / JavaScript / managed runtimes are not inherently the problem.

Manual memory management is not a prerequisite for a reliable production system.

### 3.2 Heavy or accidentally unbounded runtime paths

`MEDIUM RISK`

Potential examples:

- uncontrolled object growth;
- repeated deep copies;
- large evidence payloads;
- report generation retaining large intermediate structures;
- retry amplification;
- unbounded parallel work;
- provider-response accumulation.

### 3.3 Maintainability / architectural concentration

`MEDIUM → HIGH RISK`

The product must avoid reaching a state where:

- one change has unpredictable effects across multiple surfaces;
- large modules become practically unchangeable;
- duplicated logic creates hidden divergence;
- engineers become afraid to modify critical paths.

### 3.4 Semantic divergence

`HIGH-IMPACT RISK`

For MergeVue this can be more dangerous than raw performance degradation.

The critical failure mode is:

`runtime computes A`
→ `report path interprets B`
→ `validator checks C`
→ `client sees D`

A technically fast system that produces semantically divergent outputs is unacceptable.

### 3.5 Documentary / LLM pipeline scaling

`FUTURE HIGH RISK IF UNBOUNDED`

As MergeVue expands documentary analysis, evidence packs, historical cases, report generation, and LLM-assisted processing, resource limits must become explicit rather than implicit.

---

## 4. PERF-0 PURPOSE

Future act:

`PERF-0 — PRODUCTION RESOURCE / COMPLEXITY / CONCURRENCY AUDIT`

PERF-0 is a **measurement-first, read-only engineering audit**.

Its purpose is to establish the actual production ceilings and failure modes of MergeVue before optimization or architectural rewriting begins.

PERF-0 must answer:

1. Where does CPU time actually go?
2. Where does heap / RAM grow?
3. Which request paths retain memory?
4. What happens under concurrent users?
5. Where does event-loop lag appear?
6. Which workflows scale linearly, quadratically, cubically, or worse?
7. What are the real limits for evidence/document size?
8. What are the real limits for report/PDF generation?
9. What happens during provider latency, timeout, or retry storms?
10. Which database/query paths degrade under load?
11. Which components or modules are becoming architectural bottlenecks?
12. Which duplicated execution paths can semantically diverge?
13. Which limits must become explicit product contracts?

---

## 5. REQUIRED MEASUREMENTS

PERF-0 should measure, where applicable:

- CPU utilization;
- process RAM;
- heap size;
- heap delta per request;
- retained heap after request completion;
- garbage-collection pressure;
- event-loop lag;
- request latency;
- p50 / p95 / p99 latency;
- concurrency saturation point;
- queue depth;
- provider wait time;
- provider retry count;
- network timeout behavior;
- payload size;
- document count;
- evidence object count;
- contradiction count;
- report size;
- PDF generation duration;
- PDF generation memory;
- database/query latency;
- query count per request;
- database connection pressure;
- disk / temporary artifact growth where relevant;
- failure recovery behavior.

Measurements must reflect real production paths, not synthetic microbenchmarks alone.

---

## 6. REQUIRED LOAD LEVELS

At minimum, test representative production paths at increasing concurrency such as:

- 1 active user;
- 10 concurrent users;
- 50 concurrent users;
- 100 concurrent users;

or other evidence-based levels if the deployed architecture requires different thresholds.

The objective is not to claim a universal capacity number.

The objective is to identify:

- first degradation point;
- saturation point;
- failure mode;
- recovery behavior;
- whether failure is controlled or catastrophic.

---

## 7. PATHOLOGICAL / ADVERSARIAL TESTS

PERF-0 must include bounded adversarial tests.

Examples:

- maximum questionnaire payload;
- maximum allowed evidence pack;
- maximum document count;
- maximum single-document size;
- maximum contradiction count;
- repeated report generation;
- repeated PDF generation;
- multiple simultaneous report jobs;
- provider timeout;
- provider retry storm;
- partial provider outage;
- extremely slow upstream response;
- malformed but schema-valid oversized payloads;
- large historical documentary package;
- concurrent heavy users;
- cancellation during long-running work;
- abandoned requests;
- repeated refresh / duplicate submission;
- memory-retention after completed sessions.

The purpose is to expose failure surfaces before users do.

---

## 8. RESOURCE BUDGETS TO ESTABLISH

PERF-0 should recommend explicit budgets such as:

- `MAX_INPUT_BYTES`
- `MAX_DOCUMENT_BYTES`
- `MAX_DOCUMENT_COUNT`
- `MAX_EVIDENCE_OBJECTS`
- `MAX_CONTRADICTIONS`
- `MAX_CONCURRENT_JOBS`
- `MAX_REQUEST_EXECUTION_TIME`
- `MAX_HEAP_DELTA_PER_REQUEST`
- `MAX_LLM_CONTEXT`
- `MAX_PROVIDER_RETRIES`
- `MAX_REPORT_SIZE`
- `MAX_PDF_GENERATION_TIME`
- `MAX_DB_QUERIES_PER_REQUEST`
- `MAX_QUEUE_WAIT`

Names above are conceptual; exact production constants should be chosen only after measurement.

No arbitrary limits should be introduced merely to complete the audit.

---

## 9. FAIL-CLOSED / BOUNDED FAILURE BEHAVIOR

For every resource budget, define controlled behavior.

Examples:

### Oversized document

Expected:

`controlled rejection`

Not:

process-level OOM.

### Provider timeout

Expected:

`timeout`
→ `bounded retry`
→ `controlled failure`

Not:

infinite wait or retry amplification.

### PDF memory spike

Expected:

job termination / controlled error.

Not:

whole-process exhaustion.

### Excessive concurrency

Expected:

backpressure / queue / rejection.

Not:

unbounded parallel execution.

### Oversized evidence graph

Expected:

bounded processing or explicit refusal.

Not:

silent O(n²)/O(n³) explosion.

---

## 10. ALGORITHMIC COMPLEXITY AUDIT

This is a mandatory part of PERF-0.

Every important loop / graph / matching / comparison path involving:

- evidence;
- facts;
- contradictions;
- respondents;
- documents;
- Environment candidates;
- resources;
- report sections;
- historical cases;

should have its asymptotic behavior understood.

Special attention:

- pairwise comparison loops;
- nested contradiction scans;
- repeated full-array filtering;
- repeated serialization;
- repeated deep cloning;
- repeated schema transformation;
- repeated report-model reconstruction;
- graph traversals;
- duplicate provider calls;
- repeated database round trips.

A path that is harmless at 50 objects may become catastrophic at 5,000.

PERF-0 must identify accidental:

- `O(n²)`
- `O(n³)`
- combinatorial
- unbounded-recursive

behavior in production-relevant paths.

---

## 11. MEMORY SAFETY IN A MANAGED RUNTIME

The audit must not assume that garbage collection guarantees memory safety.

Check specifically for:

- unbounded arrays/maps/sets;
- object accumulation across requests;
- global caches without eviction;
- stale listeners;
- retained closures;
- large buffers;
- retained document bodies;
- repeated deep copies;
- report/PDF intermediate objects;
- abandoned async operations;
- retry queues;
- large logs;
- response aggregation;
- caches whose keys grow without bound.

The relevant question is:

> Does memory return to an expected steady state after work completes?

Not merely:

> Does the runtime have a garbage collector?

---

## 12. MAINTAINABILITY / ARCHITECTURAL AUDIT

PERF-0 should include an architectural-maintainability component.

Measure or review:

- module size concentration;
- component concentration;
- duplicated business logic;
- duplicated report logic;
- duplicated validation logic;
- cross-layer coupling;
- dependency direction;
- shared-state scope;
- dead/legacy paths;
- accidental parallel implementations;
- change blast radius;
- testability of critical paths.

The goal is not aesthetic refactoring.

The goal is reducing the probability that a future change creates:

- hidden runtime regressions;
- semantic drift;
- performance regressions;
- inconsistent client outputs.

---

## 13. SEMANTIC CONSISTENCY AUDIT

Because MergeVue is a methodology-sensitive product, PERF-0 must not be treated as a purely infrastructure exercise.

Where multiple execution surfaces exist, verify causal consistency across:

`input`
→ `runtime`
→ `internal model`
→ `report model`
→ `screen`
→ `PDF`
→ `validator`
→ `client-visible result`

Performance optimization must never create a faster but semantically different path.

No optimization is acceptable if it breaks controlling methodology or evidence provenance.

---

## 14. DATABASE / PERSISTENCE AUDIT

Where production persistence exists, inspect:

- query count;
- query plans;
- indexes;
- N+1 query patterns;
- transaction scope;
- connection-pool saturation;
- lock contention;
- large-result materialization;
- repeated full-table scans;
- pagination behavior;
- unbounded history retention;
- cleanup / lifecycle behavior.

Do not assume database failure is a database problem.

Application-level query shape and concurrency may be the cause.

---

## 15. LLM / EXTERNAL PROVIDER AUDIT

Where an external model/provider is used, measure:

- request size;
- context size;
- response size;
- latency;
- timeout rate;
- retries;
- concurrency;
- cancellation;
- duplicate calls;
- partial failures;
- fallback behavior;
- cost amplification;
- provider-side rate-limit behavior.

Explicitly test:

`provider slow`
`provider unavailable`
`provider returns malformed response`
`provider returns partial response`
`provider retry storm`

External latency must not become unbounded internal resource retention.

---

## 16. REPORT / PDF AUDIT

Report generation should be treated as a potentially high-memory production path.

Measure:

- model size before render;
- intermediate representation size;
- render duration;
- heap delta;
- retained memory after completion;
- repeated render behavior;
- concurrent render behavior;
- very large report behavior;
- failure during render;
- cancellation behavior.

The audit must determine whether report generation should remain synchronous or become a bounded job path.

No architectural decision is pre-authorized by this document.

---

## 17. EXPLICIT NON-GOALS

PERF-0 is NOT authorization to:

- rewrite MergeVue in Rust/C++/Go;
- replace TypeScript;
- redesign the product;
- change methodology;
- change Environment logic;
- change questionnaire logic;
- change report semantics;
- change factual evidence rules;
- replace the database;
- introduce microservices;
- add infrastructure for its own sake;
- perform a “clean architecture” rewrite;
- optimize unmeasured code.

First:

`measure`

Then:

`identify bottlenecks`

Then:

`rank by user/product risk`

Then:

`Owner-authorized correction acts`.

---

## 18. FUTURE OUTPUTS

PERF-0 should eventually produce at minimum:

1. runtime topology;
2. measurement methodology;
3. production-path inventory;
4. CPU profile;
5. memory/heap profile;
6. concurrency profile;
7. database/query profile;
8. LLM/provider profile;
9. report/PDF profile;
10. algorithmic-complexity map;
11. architectural-concentration map;
12. semantic-divergence risk map;
13. pathological-test results;
14. proposed resource budgets;
15. fail-closed contract;
16. prioritized remediation backlog;
17. explicit “do not optimize” list;
18. Owner decision frame for subsequent engineering acts.

---

## 19. PRIORITIZATION PRINCIPLE

Future optimization priority should be based on:

`severity × probability × user impact × semantic risk × scaling risk`

Not on:

- developer taste;
- language ideology;
- benchmark vanity;
- desire to rewrite;
- micro-optimizations without production evidence.

A 2× faster function is low value if it is not on a critical path.

A rare semantic divergence can be higher priority than a common 100 ms delay.

---

## 20. CURRENT STATUS

Current state:

`PERF-0 = DEFERRED / NOT STARTED`

Trigger:

`AFTER FREE RELEASE`

Until that trigger:

- do not open the workstream;
- do not divert release-critical engineering effort;
- do not treat this document as authorization for production mutation;
- keep it as a future engineering-control authority / roadmap input.

When FREE is released, return to this document and authorize a bounded read-only PERF-0 audit first.

---

## 21. SHORT FORM

The future engineering question is not:

> Is JavaScript / TypeScript too high-level?

It is:

> Do we understand, measure, bound, and verify the real computational and semantic cost of every production-critical abstraction in MergeVue?

That is the standard PERF-0 must enforce.
