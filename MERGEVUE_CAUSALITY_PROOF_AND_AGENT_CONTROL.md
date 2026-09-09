# MERGEVUE M&A — CAUSALITY PROOF & AGENT CONTROL POLICY

**Status:** OWNER-ACCEPTED controlling project policy for orchestration, implementation evidence, independent verification, and production-integration claims.  
**Project:** MergeVue — Post-Deal Behavior Forecast / M&A Integration Risk Diagnostic  
**Primary consumer:** ORCHESTRATOR (ChatGPT)  
**Applies to:** ANALYST / AUDITOR / CODER / GIT AGENT acts where a change can affect methodology, runtime authority, client output, security, infrastructure, persistence, deployment, or proof of correctness.  
**Owner intent:** agents accelerate a strong operator; they do not replace control of causality.

---

## 1. PURPOSE

The primary risk of agent-assisted engineering is not syntax error.

The primary risk is **divergence between declared intent and actual production causality**.

A change may:

- compile;
- pass local tests;
- satisfy a validator;
- look correct in code review;
- return `PASS` or `COMPLETE`;

and still fail the human claim because the real product path does not obligatorily consume the changed logic.

Therefore MergeVue does not accept critical claims such as:

- production wiring;
- production integration;
- runtime integration;
- end-to-end;
- authoritative;
- report-ready;
- released;
- security control active;

based only on generated code review, isolated unit tests, or an agent report.

For critical acts, the project requires **causal proof**.

---

## 2. AUTHORITY AND PRECEDENCE

This file is an Owner-accepted project policy.

It does not override:

1. current explicit Owner instruction;
2. the active role mandate;
3. `AGENTS.md`;
4. accepted methodology and other Owner-accepted decisions.

If this file conflicts with a current explicit Owner instruction, the Owner instruction wins.

If an agent discovers a conflict between this policy and another accepted contract, it must stop and return the conflict to the ORCHESTRATOR / Owner. It must not silently choose a convenient interpretation.

---

## 3. ROLE DISCIPLINE

Use only the real project roles and exact activation phrases defined in `AGENTS.md`.

Do not invent new roles, titles, personas, or pseudo-agents.

Examples of forbidden invented labels:

- “forensic architect”;
- “repair architect”;
- “semantic contract specialist”;
- “causality auditor”;
- any other role not defined by the project router.

The ORCHESTRATOR may describe the task, but must not rename the role.

The task itself carries the specialization.

---

## 4. HUMAN-MEANING-FIRST RULE

Before technical task design, the ORCHESTRATOR must state internally and, when material, to the Owner:

> **What must become physically true in the real product if this act succeeds?**

Technical language must serve that human meaning.

The ORCHESTRATOR must not accept a narrow technical truth when the act name implies a stronger ordinary meaning.

Examples:

- “function exists” ≠ “integrated”;
- “test calls function” ≠ “production wired”;
- “server invokes function” ≠ “function is authoritative”;
- “response contains result” ≠ “downstream product consumes result”;
- “validator passes” ≠ “user flow is protected”;
- “implementation complete” ≠ “Owner-accepted”.

If ordinary human meaning and narrow technical meaning diverge, use the weaker accurate claim.

---

## 5. MANDATORY INTENT CONTRACT FOR CRITICAL ACTS

Before any critical implementation act, define an **Intent Contract**.

Minimum fields:

### HUMAN CLAIM
What a technically reasonable Owner will understand to be true after success.

### REAL ENTRYPOINT
The actual runtime entrypoint that must reach the changed capability.

Examples:

- normal browser/user completion action;
- real API endpoint;
- scheduler/webhook;
- deployment controller;
- production worker.

A test harness, validator, fixture, or direct helper invocation is not a production entrypoint.

### TARGET CHAIN
The functions/services/policies that must execute.

### AUTHORITATIVE CONSUMER
The real downstream component whose behavior must depend on the result.

### SUCCESS CONSEQUENCE
What user-visible or system-authoritative result becomes possible only after the target chain succeeds.

### FAILURE CONSEQUENCE
What must become impossible when the target chain fails.

### BYPASS CONDITIONS
Which shortcuts must be proven impossible.

### WHAT IS NOT CLAIMED
Explicit exclusions to prevent overstatement.

If these fields cannot be specified, the act is not ready for implementation.

---

## 6. CAUSAL GRAPH REQUIREMENT

Any claim of production integration must prove the full causal graph:

```text
REAL PRODUCTION ENTRYPOINT
→ REQUIRED TARGET CHAIN
→ VALIDATED / AUTHORITATIVE RESULT
  OR CANONICAL FAILURE
→ REAL DOWNSTREAM CONSUMER
→ OBSERVABLE PRODUCT CONSEQUENCE
```

For a success-capable path, the proof must show that the target result is actually consumed.

For a failure path, the proof must show that failure blocks or changes the corresponding product result.

Presence, imports, logs, telemetry, audit attachments, response fields, email copies, or background side effects do not count as authoritative downstream consumption unless the product decision actually depends on them.

---

## 7. FAILURE-CAUSALITY TEST

Every critical integration requires at least one forced-failure proof.

The project must be able to demonstrate:

```text
same valid upstream evidence
+ target control works
→ valid downstream outcome
```

and:

```text
same valid upstream evidence
+ target control is forced to fail
→ valid downstream outcome disappears or becomes explicitly blocked
```

If forced failure does not materially change the real downstream result, the control is ornamental, optional, or bypassed.

Such an act must not receive a production-integration PASS.

---

## 8. BYPASS-RESISTANCE REQUIREMENT

Critical authority controls must be tested against realistic bypasses.

As applicable, verify:

- direct navigation to a final UI route;
- direct API invocation;
- refresh after partial success;
- retry after failure;
- stale cached success;
- client-supplied authority fields;
- locally reconstructed result;
- alternate endpoint;
- duplicate server implementation;
- optional email/PDF/audit path;
- fallback branch;
- skipped middleware;
- direct helper import;
- stale persisted state;
- replay of old revision/session data.

A critical act is not closed until the relevant bypass set has been defined and tested.

---

## 9. PRODUCTION REACHABILITY PROOF

For claims involving production reachability, prove both directions.

### DOWNWARD REACHABILITY

From the real production root, trace the exact dependency path to the target function/service.

### UPWARD AUTHORITY

From the target result/failure, trace the exact downstream path to the authoritative consumer.

Both are mandatory.

A function may be reachable but non-authoritative.

A result may exist but be ignored.

A server call may happen after the product result was already created.

These cases are FAIL for a production-authority claim.

---

## 10. CONTRACT TESTING

Critical contracts must be executable wherever practical.

Contract tests should prove behavior between real boundaries, not only helper correctness.

Examples:

- browser/client ↔ API;
- API ↔ semantic authority;
- semantic authority ↔ report eligibility;
- policy decision ↔ downstream creation;
- infrastructure declaration ↔ deployed resource;
- health endpoint ↔ actual dependency readiness.

Contract tests must include negative cases, not only happy-path shape checks.

---

## 11. POLICY-AS-CODE

Where a governance rule can be mechanically enforced, prefer executable policy over prose-only instruction.

Suitable MergeVue examples include:

- only approved server roots may create authoritative report-ready state;
- client code may not import low-level semantic validator/judge internals;
- reporting/UI may consume only approved high-level façades;
- client-supplied score/environment/Agent result/report-ready fields are never authority;
- a validator/test harness cannot be the only consumer proving production integration;
- invalid or unknown semantic state fails closed;
- internal environment codes are not exposed through public output;
- forbidden cross-layer imports fail CI;
- known critical endpoints require specified auth/policy checks;
- one canonical authority path must exist where the contract requires one.

Policy-as-code should detect prohibited architecture, not merely assert that one preferred file exists.

---

## 12. DEPENDENCY-TRACE EVIDENCE

For critical acts, the implementation report should include a dependency trace.

Minimum evidence:

- real entrypoint;
- route/handler;
- intermediate services/functions;
- policy checks;
- target function;
- returned result/failure;
- authoritative consumer;
- observable downstream consequence.

Where static analysis is sufficient, provide file/function path evidence.

Where runtime behavior matters, provide runtime trace evidence.

Static reachability alone is insufficient for claims about mandatory execution or runtime authority.

---

## 13. RUNTIME TRACE POLICY

Critical flows should carry a correlation/session trace identifier where architecture permits.

A typical authoritative trace may look like:

```text
USER_COMPLETE
→ AUTHORITY_REQUEST
→ TRUSTED_INPUT_RECONSTRUCTION
→ SEMANTIC_START
→ SEMANTIC_VALIDATED
→ AUTHORITY_GRANTED
→ DELIVERABLE_CREATED
→ REPORT_MODEL_CREATED
→ REPORT_READY
```

Failure example:

```text
USER_COMPLETE
→ AUTHORITY_REQUEST
→ SEMANTIC_START
→ SEMANTIC_FAILURE
→ AUTHORITY_DENIED
→ REPORT_BLOCKED
```

The exact event vocabulary is implementation-specific.

The invariant is not the names.

The invariant is that the trace proves causal ordering and prevents a later stage from appearing before its prerequisite authority.

Do not log sensitive M&A evidence merely to satisfy traceability.

Prefer identifiers, decision codes, hashes, revision IDs, and bounded metadata.

---

## 14. AGENT EVIDENCE PACKAGE

For critical implementation, an agent must not finish with only:

> “done”, “fixed”, “works”, “production ready”.

The implementation evidence package should report, as applicable:

1. exact repository/root;
2. exact baseline HEAD;
3. exact files changed;
4. exact resources created/changed;
5. exact endpoints created/changed;
6. exact runtime entrypoint affected;
7. exact downstream consumer affected;
8. dependency trace;
9. success test evidence;
10. forced-failure evidence;
11. bypass test evidence;
12. healthcheck result;
13. smoke-test result;
14. canary result, when applicable;
15. build/validator/contract-test results;
16. runtime trace IDs or equivalent evidence;
17. policy-as-code checks;
18. what was not verified;
19. remaining debt;
20. Git state.

Agent self-report remains evidence, not acceptance.

---

## 15. EVIDENCE MANIFEST

For high-sensitivity acts, prefer a machine-generated or mechanically reproducible evidence manifest.

Suggested fields:

```text
ACT_ID
BASELINE_HEAD
CANDIDATE_HEAD_OR_WORKTREE_ID
BUILD_ID
CHANGED_PATHS
ENTRYPOINTS
ENDPOINTS
TARGET_FUNCTIONS
AUTHORITATIVE_CONSUMERS
POLICIES_CHECKED
CONTRACT_TESTS
NEGATIVE_TESTS
BYPASS_TESTS
HEALTHCHECKS
SMOKE_TESTS
CANARY_CHECKS
TRACE_REFERENCES
UNVERIFIED_CLAIMS
KNOWN_DEBT
```

The evidence manifest must not become a new source of truth.

Its role is to point to reproducible proof.

Do not create recursive evidence bureaucracy.

---

## 16. INDEPENDENT VERIFICATION STANDARD

For material changes, the independent verifier must not merely read the coder report.

The verifier should independently establish the critical causal claims.

Depending on the act, this may require:

- tracing the real runtime root;
- independently checking dependency edges;
- executing contract tests;
- forcing failure;
- attempting bypass;
- checking runtime traces;
- confirming policy-as-code behavior;
- checking the actual deployed/staging resources;
- confirming the downstream result changes when authority changes.

A PASS is valid only for the human claim actually proven.

---

## 17. CANARY POLICY

For changes with material runtime, security, report-authority, infrastructure, persistence, or deployment risk, use canary validation when a suitable environment exists.

A canary should test real assembled behavior on a bounded candidate deployment before broader release.

Canary evidence should include:

- candidate build identity;
- deployed revision;
- health state;
- critical happy-path smoke test;
- critical forced-failure test where safe;
- policy checks;
- downstream output verification;
- rollback readiness.

Canary is not a substitute for contract tests.

Contract tests prove the intended relationship.

Canary proves the assembled deployment still exhibits it.

---

## 18. HEALTHCHECK POLICY

A healthcheck must test the health property it claims.

Do not call an endpoint healthy merely because the HTTP process returns `200`.

Separate, when relevant:

### LIVENESS
The process is running.

### READINESS
Required dependencies/configuration are usable.

### AUTHORITY-CHAIN HEALTH
The critical policy/semantic path can execute sufficiently to support the product claim.

### DOWNSTREAM HEALTH
The authoritative consumer can consume the result.

Healthchecks must not leak sensitive evidence.

---

## 19. SMOKE TEST POLICY

Every deployable critical flow should have a small deterministic smoke suite.

For MergeVue, representative canaries/smokes may include:

- normal admissible dual path;
- lawful PRE_CORE path;
- lawful single-respondent/no-R2 path after implementation;
- invalid/partial/stale R2 fail-closed path;
- semantic failure;
- judge/provider failure where safe and mockable;
- direct final-screen bypass attempt;
- client-forged authority attempt;
- report-ready success only after server authority.

The exact suite follows the current accepted product contract.

Do not freeze future methodology accidentally in infrastructure tests.

---

## 20. CI/CD GATE

For critical candidate changes, CI/CD should distinguish at least:

1. syntax/build;
2. component regression;
3. contract tests;
4. policy-as-code;
5. integration/causal tests;
6. security checks when applicable;
7. artifact/dependency identity;
8. deploy to bounded environment when authorized;
9. healthcheck;
10. smoke/canary;
11. release eligibility.

A green build is only the first gate.

Do not collapse all gates into one generic “tests passed” status.

---

## 21. INFRASTRUCTURE-AS-CODE

If MergeVue uses managed Kubernetes, Terraform, or another declarative infrastructure layer, infrastructure changes must follow the same causal-proof model.

Infrastructure agents must report:

- resources declared;
- resources planned;
- resources actually created/changed;
- provider/account/project/region context;
- network/service exposure;
- ingress/egress policy;
- secrets/config references;
- workload identity/service account;
- health/readiness configuration;
- deployed image/revision identity;
- policy checks;
- smoke/canary result.

A Terraform plan is not proof that resources exist.

A successful apply is not proof that the application works.

A healthy pod is not proof that the authoritative product path works.

Infrastructure proof must continue through runtime smoke/canary where the human claim depends on runtime behavior.

---

## 22. MANAGED KUBERNETES / TERRAFORM ADOPTION RULE

Managed Kubernetes + Terraform may be used when it materially improves:

- reproducibility;
- environment isolation;
- canary deployment;
- rollback;
- health/readiness checks;
- policy enforcement;
- runtime evidence;
- infrastructure auditability.

Do not introduce Kubernetes, Terraform, service mesh, or other infrastructure solely to create the appearance of rigor.

Infrastructure complexity is justified only when it reduces a named product/deployment risk.

The ORCHESTRATOR must first ask whether the same causal proof can be achieved in the current deployment architecture with lower risk.

---

## 23. CRITICAL MERGEVUE EXAMPLE — J5 / REPORT AUTHORITY

For J5 or any successor report-authority act, the human claim is approximately:

> A valid final report cannot exist unless the real production flow passes the authoritative semantic chain.

The required success graph is:

```text
normal completed user flow
→ mandatory server authority route
→ trusted input reconstruction
→ runProductionInterpretation
→ validated report-eligible result
→ authoritative final prerequisites
→ buildFinalDeliverable
→ buildMergevuePublicReportModel
→ report-ready response
→ actual final report consumer
```

The required failure graph is:

```text
semantic / judge / provider / contract failure
OR non-report-eligible branch
→ no authoritative deliverable
→ no report model
→ no report-ready state
→ final report consumer remains blocked
```

A validator that directly calls `runProductionInterpretation` does not prove J5.

A server endpoint that calls it after the report already exists does not prove J5.

An email attachment or audit field containing the result does not prove J5.

Only causal authority over report readiness proves J5.

---

## 24. ORCHESTRATOR PRE-ACT CHECKLIST

Before routing a critical act, the ORCHESTRATOR must establish:

1. **Owner objective:** what real product state is desired?
2. **Layer:** methodology, runtime, reporting, security, infrastructure, etc.
3. **Authority:** is the intended semantic/product decision already accepted?
4. **Real entrypoint:** where does the user/system actually enter the flow?
5. **Target chain:** what must execute?
6. **Consumer:** what must causally depend on the result?
7. **Failure consequence:** what must disappear/block on failure?
8. **Bypasses:** how could the product avoid the control?
9. **Proof type:** static, contract, runtime, canary, or combination?
10. **Agent role:** use only the exact real role activation from `AGENTS.md`.
11. **Independence:** who can verify without auditing their own implementation?
12. **Git boundary:** no Git closure until evidence and acceptance gates are satisfied.

If the ORCHESTRATOR cannot answer items 3–8, route analysis before implementation.

---

## 25. ORCHESTRATOR POST-ACT CHECKLIST

Do not translate an agent’s `COMPLETE` into product success automatically.

Check:

1. Did the changed code/resources match the authorized scope?
2. Was the real production entrypoint proven?
3. Was mandatory execution proven?
4. Was downstream authority proven?
5. Was forced failure tested?
6. Were relevant bypasses attempted?
7. Did policy-as-code pass?
8. Did runtime evidence match static intent?
9. Did smoke/canary pass where required?
10. Are any claims still agent-reported only?
11. Does the final wording match ordinary human meaning?
12. Is Owner acceptance still required?

If any load-bearing proof is missing, use a weaker status.

---

## 26. STATUS LANGUAGE

Critical acts must use truthful status language.

### ANALYSIS / AUDIT

Use the project-defined terminal states.

Do not use `PASS` for a stronger human claim than the evidence supports.

### IMPLEMENTATION

`COMPLETE` means the authorized implementation work is complete.

It does not mean:

- independently verified;
- Owner-accepted;
- production integrated;
- deployed;
- released.

### PRODUCTION CLAIMS

Use `production`, `integrated`, `wired`, `authoritative`, `end-to-end`, or equivalent strong language only after causal proof appropriate to the claim.

---

## 27. FORBIDDEN EVIDENCE SUBSTITUTIONS

Do not substitute:

- code review for runtime causality;
- unit tests for integration authority;
- validator PASS for real production reachability;
- static import for mandatory execution;
- server invocation for downstream consumption;
- response field for authority;
- log line for product gating;
- deploy success for application readiness;
- pod health for business-path health;
- Terraform plan for created infrastructure;
- agent report for independent verification;
- independent PASS for Owner acceptance.

---

## 28. ANTI-ORNAMENTAL-INTEGRATION RULE

A control is ornamental if it executes but does not govern the claimed outcome.

Examples:

- semantic check runs only for email copy after report creation;
- security policy logs a violation but still returns success;
- validation result is attached to audit metadata but ignored by the product decision;
- infrastructure policy runs in CI but an alternate deployment path bypasses CI;
- authority endpoint exists but client can build the final artifact locally.

Ornamental integration must be reported as a defect when the human claim is authoritative integration.

---

## 29. MINIMUM PROOF TABLE FOR CRITICAL ACTS

Every critical acceptance package should answer:

| Question | Required evidence |
|---|---|
| What human claim is being made? | Intent Contract |
| What real root starts the path? | Runtime/static entrypoint proof |
| Does the target execute? | Dependency trace / runtime trace |
| Is execution mandatory? | Bypass + negative control |
| Who consumes the result? | Downstream dependency proof |
| Does failure matter? | Forced-failure test |
| Can the client/operator bypass it? | Bypass tests |
| Do architecture policies hold? | Policy-as-code |
| Does assembled deployment work? | Health + smoke/canary |
| What remains unverified? | Explicit limitations |

If the table has a load-bearing blank, the strong claim is not proven.

---

## 30. NO GOVERNANCE RECURSION

This policy must reduce uncertainty, not manufacture paperwork.

Do not create:

- audit-of-audit chains;
- duplicate manifests;
- redundant validators;
- evidence documents with no reproducible source;
- ceremonial canaries;
- infrastructure solely for compliance theatre.

Every added control must protect against a named causal or product risk.

---

## 31. SESSION-START REQUIREMENT FOR ORCHESTRATOR

When this file is present in the controlling project source, the ORCHESTRATOR should read it together with:

- `AGENTS.md`;
- `AGENTS_O.md`;
- the current Owner instruction;

before designing any non-trivial critical act.

For a critical integration/security/infrastructure task, the ORCHESTRATOR should explicitly check the Intent Contract and causal-proof requirements in this file before routing work to another agent.

---

## 32. CLOSING RULE

**Human meaning first.  
Intent before implementation.  
Production root before production claim.  
Downstream authority before “integrated”.  
Forced failure before “mandatory”.  
Bypass testing before “protected”.  
Runtime evidence before “works in production”.  
Independent proof before verification.  
Owner acceptance before closure.**

The governing principle is:

> **An agent has not proven a critical change by showing that the code exists. It has proven the change only when the declared intent is demonstrated as a necessary cause of the real product behavior, and the corresponding product result disappears or becomes blocked when that cause is removed or forced to fail.**
