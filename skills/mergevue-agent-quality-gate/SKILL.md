---
name: "mergevue-agent-quality-gate"
description: "Audits and improves MergeVue agent work from real act history, prompts, reports, diffs, and validation evidence. Use after a failed or blocked act, after an independent verifier contradicts an implementation report, when the Owner flags prompt/role/routing quality, before repeating a high-risk act family, at major workstream gates, or when asked to improve the agent setup. Scores human-meaning fidelity, authority/role discipline, source-of-truth handling, causal proof, scope control, verification quality, efficiency, and reporting truthfulness; then drafts only evidence-backed skill/prompt/governance improvements. Never self-authorizes product, methodology, Git, or live governance changes."
---

# MergeVue Agent Quality Gate

## 0. Purpose

This skill is the project-level self-improvement and agent-quality discipline for MergeVue M&A.

Its purpose is not to make agents sound more confident.

Its purpose is to reduce:

- false `PASS` / `COMPLETE`;
- human-meaning drift;
- role invention;
- wrong-agent routing;
- scope creep;
- methodology decisions made by implementers;
- validator theater;
- production claims without production causality;
- repeated prompt defects;
- unnecessary Owner questions;
- duplicated audits;
- rework caused by weak task contracts;
- acceptance of evidence that does not prove the actual product claim.

The skill learns only from real evidence.

A successful conversation is not evidence that a skill needs to change.

A failed, blocked, contradicted, overclaimed, or repeatedly corrected conversation is evidence.

The governing rule is:

> Improve the agent system only where observed failure proves that the current system is insufficient.

Do not add process merely because more process looks rigorous.

---

## 1. Authority and precedence

This skill never overrides project governance.

Before using it, establish the current authority chain from the project itself.

At minimum read, when physically available and relevant:

- `AGENTS.md`;
- the active role mandate;
- `MERGEVUE_CAUSALITY_PROOF_AND_AGENT_CONTROL.md`;
- current explicit Owner instruction;
- Owner-accepted decisions governing the act under review.

Use this precedence:

1. current explicit Owner instruction;
2. active role mandate;
3. `AGENTS.md`;
4. Owner-accepted decisions/specifications;
5. controlling project documents;
6. repository/runtime evidence;
7. agent reports and historical summaries;
8. this skill.

If this skill conflicts with higher authority, the higher authority wins.

Do not silently reconcile conflicting accepted contracts.

Return the conflict to ORCHESTRATOR / Owner.

---

## 2. Role discipline

This skill does not create a new role.

The executing agent keeps the role already assigned through `AGENTS.md`.

Never call yourself:

- quality architect;
- forensic orchestrator;
- causality specialist;
- skill doctor;
- meta-auditor;
- repair architect;
- or any other invented role.

The task can be specialized.

The role cannot.

### ORCHESTRATOR

May:

- run the full quality review;
- compare acts across agents;
- draft prompt/skill/governance improvements;
- prepare an Owner decision;
- recommend a new bounded act.

May not:

- accept implementation on behalf of Owner;
- silently modify methodology;
- silently authorize writes;
- become the independent verifier of work it materially implemented.

### ANALYST / AUDITOR

May:

- score evidence quality;
- identify repeated reasoning or verification defects;
- draft improvements;
- independently test claims when authorized.

May not:

- modify source in a read-only act;
- turn recommendations into Owner decisions;
- pass work because the coder report says it passed.

### CODER

May use this skill only as self-checking support inside the authorized implementation boundary.

A CODER may not use a high score from this skill as:

- independent verification;
- Owner acceptance;
- Git authorization;
- methodology authority.

### GIT AGENT

May use this skill only to evaluate Git evidence, worktree identity, closure discipline, and commit/push claim quality.

It must not use the skill to reinterpret implementation or methodology.

---

## 3. Trigger conditions

Use this skill when at least one of the following is true:

1. An act returned `FAIL`, `FAILED`, `BLOCKED`, `INCOMPLETE`, or `REQUIRES_OWNER_DECISION`.
2. An independent verifier contradicted or materially narrowed a coder/analyst claim.
3. The Owner says an agent prompt was weak, truncated, role-confused, overbroad, or semantically wrong.
4. A validator passed but later evidence showed the human claim was not true.
5. A critical act family is about to be repeated after a prior failure of the same class.
6. The same defect has appeared in two or more prompts, reports, validators, or agent acts.
7. The project reaches a major gate:
   - methodology freeze;
   - production composition;
   - security gate;
   - report authority;
   - final renderer;
   - release;
   - post-release calibration.
8. The Owner explicitly asks:
   - how well the agents are working;
   - which skills are helping;
   - how to improve the agent setup;
   - what caused repeated rework;
   - how to make prompts/verification more reliable.

Do not run the full retrospective for trivial formatting tasks or low-risk one-line changes.

Prefer the smallest review scope that can answer the quality question.

---

## 4. Modes

This skill has three modes.

### MODE A — PRE-ACT QUALITY GATE

Use before routing a critical new act.

Goal:

> prevent a known class of failure from being repeated.

### MODE B — POST-ACT QUALITY REVIEW

Use after an act produces a report, implementation, audit, or Git result.

Goal:

> determine whether the evidence really proves the human claim and whether a process defect caused waste or overclaim.

### MODE C — RETROSPECTIVE SELF-IMPROVEMENT

Use across multiple acts/conversations.

Goal:

> identify repeated failure patterns and draft minimal evidence-backed changes to prompts, skills, mandates, or policy-as-code.

Do not mix modes accidentally.

A PRE-ACT gate should not become a full historical research project.

A retrospective should not mutate current source.

---

## 5. Privacy and evidence locality

Treat agent conversations, repository state, M&A evidence, and internal prompts as private project material.

Default rules:

- keep transcripts local;
- do not upload conversations or excerpts to external services;
- do not use web search to score private agent behavior;
- do not paste confidential evidence into third-party tools;
- do not expose hidden M&A evidence merely to improve a score.

If local agent/session history is available, read it locally.

If it is not available, grade only the material explicitly supplied.

Never invent missing conversation history.

Use:

`NOT DETERMINABLE FROM AVAILABLE EVIDENCE`

when the evidence is insufficient.

If a shareable report is requested, include only bounded findings chosen for sharing.

Do not include sensitive transcript excerpts by default.

---

## 6. Scope selection

Before a retrospective, define the evaluation scope.

Prefer, in order:

1. current act;
2. current workstream;
3. current repository/project;
4. selected prior workstreams;
5. all available local agent conversations.

If the Owner has already specified the scope, do not ask again.

If scope is ambiguous and materially affects the result, ask one concise question.

For a project-wide review, identify:

- act IDs / names;
- agent used;
- assigned role;
- prompt;
- returned report;
- independent verification, if any;
- Owner decision, if any;
- Git result, if any;
- later contradiction/correction, if any.

Do not treat a later summary as equivalent to the underlying report when the underlying evidence is available.

---

## 7. Evidence classification

Every material assertion in a quality review must be classified as one of:

### OWNER FACT

A current explicit Owner instruction or explicit Owner acceptance.

### GOVERNANCE FACT

A statement physically present in controlling project governance.

### METHODOLOGY FACT

A statement physically supported by the controlling methodology corpus or accepted canonical export.

### SOURCE / RUNTIME FACT

A statement established from current repository source, runtime behavior, or mechanically reproducible execution.

### PUBLIC-OUTPUT FACT

What the actual UI/PDF/email/output physically shows.

### AGENT-REPORTED CLAIM

A statement made by an agent report but not independently established.

### INFERENCE

A reasoned conclusion from established facts.

### NOT DETERMINABLE

Evidence is insufficient.

Do not collapse these categories.

A recurring MergeVue failure pattern is:

`AGENT-REPORTED CLAIM → silently promoted to SOURCE FACT`.

This skill must actively detect that promotion.

---

## 8. Hard-fail quality gates

Scores never override the following defects.

If any applicable hard-fail condition is present, mark the reviewed act as failed for skill-improvement evidence even if its average score is high.

### HF-01 — Role invention or role crossover

Examples:

- coder acts as methodology author;
- auditor fixes source;
- Orchestrator commits;
- verifier audits its own implementation;
- agent invents a pseudo-role.

### HF-02 — Self-authorization

Agent treats:

- plan;
- TODO;
- prior `PASS`;
- recommendation;
- code comment;
- agent report

as Owner authorization.

### HF-03 — Scope mutation

Agent writes outside the closed allowlist or fixes unrelated debt.

### HF-04 — Methodology choice by implementation agent

Coder resolves an unresolved product/methodology question without Owner acceptance.

### HF-05 — Human-meaning overclaim

Technical evidence proves a weaker claim than the act name/report implies.

Examples:

- helper exists → “integrated”;
- validator calls helper → “production wired”;
- response contains result → “authoritative”;
- build passes → “release ready”.

### HF-06 — Validator-as-authority

A changed/new validator is treated as the sole proof of the behavior it was written to assert.

### HF-07 — Missing failure causality

A critical control is claimed effective without proving that forced failure blocks/removes the downstream consequence.

### HF-08 — Unchecked bypass

A material authority/security control is accepted without testing realistic bypasses relevant to that control.

### HF-09 — Wrong project/root/HEAD used as basis for writes

Unless the act explicitly allows movement to another baseline.

### HF-10 — Git authority violation

Commit/push/restore/reset/stash/clean or other Git mutation performed outside the Git mandate/authorization.

### HF-11 — Independent verification failure

Verifier materially authored the implementation being independently verified, or merely repeats the coder's tests/report without independent oracle evidence.

### HF-12 — Source-of-truth substitution

Legacy/runtime/report sample/agent summary is silently used as methodology authority.

---

## 9. Scoring rubric

Score each applicable dimension from `0.0` to `1.0`.

Use only:

- `1.0` — strong;
- `0.75` — mostly strong, bounded weakness;
- `0.5` — materially incomplete;
- `0.25` — major defect;
- `0.0` — absent / opposite behavior.

Do not curve scores.

Correctness is more important than making the report look good.

### Q1 — Human-meaning fidelity — 15%

Ask:

- Did the prompt/report state what must become physically true?
- Did technical proof match ordinary human meaning?
- Were stronger claims explicitly excluded?
- Did the final status remain at the proven level?

### Q2 — Role and authority discipline — 15%

Ask:

- Correct agent?
- Exact real role?
- Explicit Owner authorization where required?
- No self-acceptance?
- No role crossover?
- Proper stop point?

### Q3 — Source-of-truth discipline — 10%

Ask:

- Governance, methodology, source/runtime, public output separated?
- Agent reports treated as evidence, not truth?
- Staleness/provenance checked?
- Conflicts surfaced rather than silently reconciled?

### Q4 — Causal proof quality — 20%

Ask, where applicable:

- Real entrypoint established?
- Target chain established?
- Authoritative downstream consumer established?
- Success consequence shown?
- Forced-failure consequence shown?
- Downward reachability and upward authority both proven?
- Relevant bypasses tested?
- Component/test evidence not mislabeled production?

For non-runtime tasks, score the analogous causal chain for the human claim.

### Q5 — Scope and change control — 10%

Ask:

- Closed write/read boundary?
- No unrelated fixes?
- No accidental methodology change?
- No unauthorized dependencies/files?
- Dirty-state contamination handled correctly?

### Q6 — Validation and independence — 15%

Ask:

- Were validations appropriate to the claim?
- Were new validators independently checked?
- Was an independent oracle used for load-bearing behavior?
- Did verifier inspect real diff/path rather than trust report?
- Were failures and limitations reported?

### Q7 — Efficiency and rework prevention — 10%

Ask:

- Did the task avoid unnecessary branching?
- Did the prompt avoid making the agent rediscover known facts?
- Were Owner questions limited to true decisions?
- Did the act stop at the smallest dependency?
- Did the process avoid repeated audits with no named material risk?
- Were prompts complete enough to avoid predictable correction loops?

### Q8 — Reporting truthfulness — 5%

Ask:

- Exact files/commands/results reported?
- Pre/post state reported where material?
- `PASS`, `COMPLETE`, Owner acceptance, Git closure kept distinct?
- `NOT VERIFIED` section honest?
- No unsupported certainty language?

### Overall score

```text
overall =
0.15*Q1 +
0.15*Q2 +
0.10*Q3 +
0.20*Q4 +
0.10*Q5 +
0.15*Q6 +
0.10*Q7 +
0.05*Q8
```

Suggested diagnostic grade:

- `A` >= 0.90
- `B` >= 0.80
- `C` >= 0.70
- `D` >= 0.60
- `F` < 0.60

A hard-fail gate overrides the letter grade for acceptance purposes.

The score is diagnostic.

It is never Owner acceptance.

---

## 10. Failed-conversation rule

For self-improvement purposes, an act/conversation counts as failed when:

- any applicable quality dimension is below `0.5`; or
- any hard-fail gate applies; or
- later independent evidence materially invalidates the act's claimed success; or
- the Owner has to correct the same prompt/role/scope defect that should have been encoded already.

Only failed acts may justify durable skill/governance/prompt-system changes.

Successful acts may be used to show that a proposed change does not destroy good behavior, but they are not primary evidence for adding process.

This prevents generic best-practice inflation.

---

## 11. Root-cause taxonomy

For every failed act, classify the dominant cause.

Use one or more:

### RC-ROUTING

Wrong actor/role or independence plan.

### RC-AUTHORITY

Authorization or acceptance boundary unclear.

### RC-OBJECTIVE

Human claim not defined precisely.

### RC-SOURCE

Wrong/stale/non-authoritative source used.

### RC-SCOPE

Allowlist or forbidden-effects boundary weak.

### RC-CAUSALITY

Evidence showed existence but not necessary causal effect.

### RC-VALIDATION

Tests/validators did not prove the claim.

### RC-BYPASS

Alternate path not modeled.

### RC-FAILURE-SEMANTICS

Fail-open, silent normalization, or wrong canonical failure.

### RC-PROMPT

Brief missing a necessary constraint, output, stop condition, or distinction.

### RC-REPORTING

Agent overstated what was proven.

### RC-GOVERNANCE

Standing rule is absent, ambiguous, contradictory, or duplicated.

### RC-TOOLING

Harness/tool limitation caused avoidable loss of evidence.

### RC-IMPLEMENTATION

The task contract was sufficient but code was wrong.

Do not patch `AGENTS.md` for a pure implementation bug.

Do not patch code for a pure routing bug.

Put the control at the layer where the failure originates.

---

## 12. PRE-ACT QUALITY GATE

Before a critical act is sent to another agent, check the following.

### 12.1 Human meaning

Write one sentence internally:

> If this act succeeds, what becomes physically true?

If that sentence cannot be written unambiguously, the act is not ready.

### 12.2 Layer

Classify the act:

- methodology;
- source/runtime;
- agent semantics;
- report/public output;
- security;
- persistence;
- infrastructure;
- Git;
- research/analysis.

### 12.3 Authority

Establish:

- what is already Owner-accepted;
- what is still a decision;
- what the agent may infer mechanically;
- what the agent must not choose.

### 12.4 Role

Select only a role defined by `AGENTS.md`.

Plan verifier independence before implementation when material.

### 12.5 Physical baseline

When source is involved:

- authorized root;
- branch;
- controlling HEAD;
- known dirty state;
- sibling repositories to avoid.

### 12.6 Closed scope

For a CODER act define:

- ALLOWED WRITES;
- READ-ONLY DEPS;
- FORBIDDEN EFFECTS;
- stop-if-additional-file-needed behavior.

### 12.7 Intent contract

For a causally significant act define:

- HUMAN CLAIM;
- REAL ENTRYPOINT;
- TARGET CHAIN;
- AUTHORITATIVE CONSUMER;
- SUCCESS CONSEQUENCE;
- FAILURE CONSEQUENCE;
- BYPASS CONDITIONS;
- WHAT IS NOT CLAIMED.

If a field is not applicable, say why.

Do not omit it silently.

### 12.8 Validation contract

Require proof proportional to the claim:

- static/source proof;
- contract test;
- independent oracle;
- forced failure;
- bypass test;
- build;
- integration;
- runtime;
- smoke/canary;
- public-output inspection.

Do not require every proof type for every act.

### 12.9 Report contract

Require exact statuses appropriate to the active role.

Never allow a CODER report to return Owner acceptance.

Never allow an AUDITOR `PASS` to imply Git authorization.

### 12.10 Stop point

Every prompt must end with a bounded stop.

No automatic transition to the next act.

---

## 13. Prompt quality test

Before sending a long prompt, score it on these binary checks.

A critical prompt should normally satisfy all applicable items.

```text
[ ] exact role activation inherited from router
[ ] act name
[ ] exact Owner authorization, if required
[ ] human claim
[ ] what is not claimed
[ ] controlling accepted decisions
[ ] root / HEAD where relevant
[ ] closed write allowlist where relevant
[ ] read-only dependencies
[ ] forbidden effects
[ ] source-of-truth rule
[ ] causal path to prove
[ ] forced-failure proof
[ ] bypass set
[ ] non-regression requirement
[ ] required validations
[ ] exact output structure/status vocabulary
[ ] Git boundary
[ ] stopping point
```

If a prompt repeats the full project constitution unnecessarily, shorten it.

Reference standing mandates instead of copying them unless the agent/harness cannot reliably access those files.

A prompt is not better merely because it is longer.

It is better when every line closes a real ambiguity.

---

## 14. Post-act review

After any material agent report:

1. Separate what the agent claims from what it proved.
2. Check the claimed physical state.
3. Check the exact scope/diff.
4. Compare the human claim with the evidence.
5. Check whether tests are self-authored.
6. Identify what independent oracle is still required.
7. Identify unverified production/runtime claims.
8. Check whether the agent crossed role/authority boundaries.
9. Check whether a new Owner decision actually exists.
10. Recommend only the next bounded dependency.

Do not reflexively create an independent audit for every implementation.

Use independent verification when there is a named material risk, critical causal claim, security/public-output authority, or governance requirement.

---

## 15. Independent verification quality

An independent verifier must prove the load-bearing claim independently.

At minimum, for a causally significant implementation, evaluate whether the verifier:

- read the candidate diff;
- rebuilt the relevant source/data path;
- created an independent success oracle;
- created a forced-failure oracle;
- attempted realistic bypasses;
- checked non-regression;
- distinguished component from production;
- checked failure-class consistency;
- checked worktree/scope;
- did not rely primarily on changed validators;
- reported limitations.

A verifier may run modified validators.

But the logical form:

```text
new validator says PASS
therefore candidate is correct
```

is forbidden.

Preferred form:

```text
independent oracle establishes behavior
modified validator asserts the same behavior
therefore validator and implementation are mutually consistent
```

---

## 16. Causal-proof quality test

For every claim containing words like:

- production;
- wired;
- integrated;
- runtime;
- authoritative;
- protected;
- fail-closed;
- report-ready;
- released;
- security control active;

ask:

### Downward reachability

Can we trace:

```text
real root
→ target control
```

### Upward authority

Can we trace:

```text
target result/failure
→ authoritative consumer
→ changed/blocking product consequence
```

### Forced failure

Can we show:

```text
same lawful upstream state
+ target failure
→ downstream success disappears or blocks
```

### Bypass resistance

Can the product:

- navigate around it;
- call another endpoint;
- reconstruct locally;
- replay stale state;
- inject authority fields;
- use a duplicate implementation;
- continue through email/PDF/audit-only side path?

If any required edge is absent, reduce the claim.

Never increase the evidence wording to match the act name.

Reduce the act/status wording to match the evidence.

---

## 17. Efficiency analysis

Efficiency is not token minimization.

Efficiency means reducing work that does not increase confidence in the human claim.

Flag:

- duplicate audits with no distinct risk;
- Owner questions that source inspection could answer;
- prompts requiring agents to rediscover accepted decisions;
- huge allowlists for narrow changes;
- broad validator runs unrelated to changed behavior;
- repeated full-repo scans where a causal path is already known;
- agents fixing adjacent debt;
- repeated corrections caused by missing prompt constraints;
- prose-heavy reports with no reproducible evidence;
- invented status taxonomy;
- unnecessary new files or documentation;
- manual steps that could be encoded as policy-as-code.

Do not flag:

- independent verification of a critical causal claim;
- forced-failure tests;
- bypass tests;
- root/HEAD checks before writes;
- explicit limitations;
- bounded extra inspection needed to disprove an overclaim.

---

## 18. Improvement drafting rule

After scoring failed acts, propose the smallest durable change that would have prevented the failure.

The possible targets are:

1. prompt template;
2. this skill;
3. role mandate;
4. `AGENTS.md`;
5. causal-control policy;
6. validator / policy-as-code;
7. source architecture;
8. harness/tooling.

For every proposed change include:

### TARGET

Exact skill/document/template/control.

### OBSERVED FAILURE

Act/session and exact failure moment.

### ROOT CAUSE

One or more `RC-*` labels.

### CHANGE

One-sentence description.

### WHY THIS LAYER

Why the fix belongs here instead of code/governance/prompt/etc.

### EXPECTED PREVENTION

What future failure it prevents.

### RISK OF OVERCONTROL

What good behavior could be harmed by making the rule too broad.

### PROPOSED DIFF

When a file exists, draft a unified diff or complete replacement text.

Do not modify live governance/skills merely because this skill recommends a change.

Owner authorization still applies.

---

## 19. Skill-edit evidence rule

A proposed skill edit must trace to a failed act.

For each proposed edit, cite:

- failed act;
- quality dimension or hard-fail;
- exact behavior that failed;
- why the current skill/trigger did not prevent it.

If an installed skill never triggered during a failed act where it clearly should have, investigate the skill description/trigger language first.

Do not expand every skill trigger to “always”.

Broad triggers create noise and reduce agent attention.

---

## 20. Prompt-improvement rule

When repeated failures originate in prompts rather than standing governance:

- edit the act template, not the constitution;
- encode the missing decision once;
- add exact negative controls when the same bypass recurs;
- specify exact output/status language when agents repeatedly overclaim;
- define `WHAT IS NOT CLAIMED` when act names repeatedly imply too much;
- define a closed write allowlist when scope repeatedly expands;
- add a stop condition when agents auto-continue.

Do not duplicate permanent rules into every prompt if the role files already carry them reliably.

---

## 21. Governance-improvement rule

Change standing governance only when:

- at least two materially similar failures reveal the same missing rule; or
- one severe failure demonstrates a systemic authority/safety gap; or
- the Owner explicitly requests the governance change.

Before proposing a governance change, check whether the rule already exists but failed to trigger.

If it already exists, the problem may be:

- routing;
- prompt activation;
- skill description;
- agent compliance;
- verification.

Do not solve compliance failure by endlessly duplicating the same rule.

---

## 22. Policy-as-code preference

When a critical invariant can be mechanically enforced, prefer an executable control over prose alone.

Examples:

- closed allowed status set;
- PRE_CORE cannot carry pair context;
- report-ready cannot exist without validated authority;
- unknown/stale resource identity fails closed;
- forbidden fields rejected rather than ignored;
- commit scope matches Owner-accepted files.

But policy-as-code itself needs independent proof.

A validator cannot appoint itself as authority.

---

## 23. Retrospective aggregation

For a multi-act retrospective:

### Step 1 — Score every sampled act

Record:

- agent;
- role;
- act;
- Q1–Q8;
- hard-fail gates;
- dominant root causes;
- outcome.

### Step 2 — Define failed acts

Use Section 10.

### Step 3 — Derive patterns only from failed acts

Find the three most impactful repeated patterns.

Good finding:

> Three acts used green validators as primary evidence of production wiring; later source tracing showed no real App/API consumer.

Bad finding:

> Agents should test more.

### Step 4 — Rank by expected rework prevented

Prioritize issues that cause:

- false acceptance;
- methodology corruption;
- security bypass;
- repeated implementation;
- wrong Git closure;
- Owner rework;
- public-output error.

### Step 5 — Draft no more than the necessary improvements

Do not generate ten process changes because three were enough.

---

## 24. Quality report format

Unless the Owner requests another format, return:

1. **SCOPE**
2. **EVIDENCE REVIEWED**
3. **QUALITY SCORECARD**
4. **HARD-FAIL GATES**
5. **FAILED ACTS**
6. **TOP 3 FINDINGS**
7. **ROOT-CAUSE MAP**
8. **WHAT IS WORKING**
9. **PROPOSED IMPROVEMENTS**
10. **PROPOSED DIFFS / FULL SKILL TEXT**
11. **EXPECTED IMPACT**
12. **RISK OF OVERCONTROL**
13. **WHAT WAS NOT DETERMINABLE**
14. **OWNER DECISIONS REQUIRED**
15. **RECOMMENDED NEXT ACTION**

Do not hide the strongest defect behind the average score.

Lead with the three findings that matter most.

---

## 25. Per-act score record

Use this compact structure:

```text
ACT:
AGENT:
ROLE:
OUTCOME:

Q1 HUMAN MEANING:
Q2 ROLE / AUTHORITY:
Q3 SOURCE TRUTH:
Q4 CAUSAL PROOF:
Q5 SCOPE CONTROL:
Q6 VALIDATION / INDEPENDENCE:
Q7 EFFICIENCY:
Q8 REPORTING:

OVERALL:
HARD FAILS:
ROOT CAUSES:

WHY:
<1–3 sentences tied to concrete evidence>
```

If code quality is not observable, do not invent a code-quality judgment.

Score the dimensions for which evidence exists and mark the others:

`INSUFFICIENT_EVIDENCE`.

---

## 26. Improvement acceptance boundary

A report from this skill can produce:

- diagnosis;
- score;
- prompt draft;
- skill draft;
- governance diff;
- validator recommendation;
- act recommendation.

It cannot produce:

- Owner acceptance;
- methodology acceptance;
- implementation authorization;
- Git authorization;
- deployment authorization.

Only the Owner controls those transitions.

---

## 27. Integration into the agent workflow

Recommended integration pattern:

### ORCHESTRATOR

Use PRE-ACT QUALITY GATE before critical acts.

Use POST-ACT QUALITY REVIEW after material coder/auditor reports.

Run RETROSPECTIVE SELF-IMPROVEMENT only:

- after a meaningful failure pattern;
- at major delivery gates;
- or on Owner request.

### ANALYST / AUDITOR

Before returning strong claims, use:

- evidence classification;
- hard-fail scan;
- causal-proof quality test;
- reporting-truthfulness check.

### CODER

Before `COMPLETE`, use:

- role/authority check;
- closed-scope check;
- human-claim vs implementation check;
- forced-failure requirement;
- report-truthfulness check.

Do not self-award independent quality.

### GIT AGENT

Before closure, use:

- Owner acceptance check;
- exact candidate scope;
- worktree contamination check;
- commit identity;
- push authority;
- claim boundary.

---

## 28. Recommended automatic triggers for MergeVue

If the harness supports automatic skill triggering, trigger this skill on language including:

- “проверь работу агентов”;
- “улучши наши промпты”;
- “почему опять ошиблись”;
- “что не так с процессом”;
- “какие skills работают”;
- “сделай ретроспективу”;
- “аудит промптов”;
- “качество агентов”;
- “повысить качество работы агентов”;
- “почему PASS оказался ложным”;
- “production wiring” after a prior wiring failure;
- “independent verification” for a critical authority act;
- repeated `FAIL` / `BLOCKED` in the same workstream.

Do not auto-trigger on ordinary low-risk coding merely because the word “quality” appears.

---

## 29. Minimal scratch-artifact policy

If the executing harness can create local scratch files and a retrospective needs artifacts:

- use a temporary directory outside the repository;
- never write audit transcripts into the project tree;
- never make the scratch report a new source of truth;
- delete nothing from the repository;
- do not Git-add report artifacts.

Useful optional scratch artifacts:

```text
inventory.json
scorecard.json
failed-acts.json
proposed/<skill>/SKILL.md
report.md
```

A report artifact is evidence organization only.

The underlying source, prompts, conversations, diffs, and Owner decisions remain authority.

---

## 30. Anti-bureaucracy rules

This skill must not become a second management system.

Do not:

- require a retrospective after every act;
- create permanent score ledgers without Owner request;
- add an audit because an audit feels safe;
- invent new status tokens when existing role statuses are sufficient;
- add governance text when a validator is the correct control;
- add validators when source architecture can make the invalid state unrepresentable;
- turn a one-file bug into a cross-project process review;
- use scores as acceptance gates unless Owner explicitly adopts them.

The objective is lower rework and stronger truth.

Not more ceremony.

---

## 31. Final self-check for this skill

Before returning a quality review, ask:

```text
[ ] Did I use real evidence rather than memory alone?
[ ] Did I separate Owner fact, source fact, agent claim, and inference?
[ ] Did I identify the human claim?
[ ] Did I detect any hard-fail gate?
[ ] Did I avoid promoting test evidence to production evidence?
[ ] Did I use failed acts as the basis for durable improvements?
[ ] Is every proposed change tied to an observed failure?
[ ] Did I put the change at the correct layer?
[ ] Did I avoid unnecessary process growth?
[ ] Did I preserve Owner authority?
[ ] Did I state what remains unverified?
[ ] Did I recommend only the next bounded action?
```

If any answer is no, correct the review before returning it.

---

## 32. Core quality principle

MergeVue agents are not graded by how much code, prose, or validation they produce.

They are graded by whether they preserve this chain:

```text
OWNER INTENT
→ CORRECT ROLE
→ AUTHORITATIVE SOURCE
→ BOUNDED ACT
→ PHYSICAL CHANGE / ANALYSIS
→ CAUSAL PROOF
→ INDEPENDENT EVIDENCE WHEN MATERIAL
→ TRUTHFUL CLAIM
→ OWNER DECISION
→ SEPARATE GIT CLOSURE
```

The strongest agent is not the agent that says `PASS` most often.

It is the agent that makes an incorrect `PASS` difficult to produce.
