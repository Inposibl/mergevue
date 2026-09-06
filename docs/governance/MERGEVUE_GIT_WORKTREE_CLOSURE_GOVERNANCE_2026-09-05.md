# MERGEVUE — GIT WORKTREE & CLOSURE GOVERNANCE

**Version:** 1.0  
**Effective date:** 2026-09-05  
**Authority:** OWNER-ACCEPTED  
**Status:** CONTROLLING PROJECT GOVERNANCE RULE  
**Scope:** All future MergeVue acts that may modify tracked repository files.

---

## 1. Purpose

This rule prevents recurrence of the failure mode in which several unfinished or accepted-but-uncommitted workstreams remain layered in the same Git worktree and later commits are created over that unresolved dirty state.

The prohibited historical pattern is:

`implemented / verified / accepted`
→ `accepted bytes remain dirty`
→ `next workstream starts`
→ `new work modifies the same or adjacent files`
→ `later selective commits bypass earlier dirty bytes`
→ `tracked worktree becomes an undocumented stack of historical acts`.

MergeVue no longer permits this state.

---

# 2. Primary invariant

## NO NEW WORKSTREAM ON UNRECONCILED TRACKED DIRTY STATE

Before any new tracked mutation act begins, the canonical worktree MUST be in one of two lawful states.

### State A — CLEAN TRACKED TREE

No tracked dirty paths exist.

### State B — ONE EXPLICITLY BOUNDED ACTIVE WORKSTREAM

Every tracked dirty byte:

- belongs to exactly one active Owner-authorized act;
- is inside that act's explicit write allowlist;
- is physically attributable to that act;
- is represented in the act/candidate manifest;
- is not residue from a prior accepted, failed, abandoned, or unrelated workstream.

Any unexplained tracked dirty path or hunk is a hard **STOP** condition.

---

# 3. Prohibited persistent state

The following state is illegal:

`OWNER-ACCEPTED / STILL DIRTY IN WORKTREE / NEXT WORKSTREAM STARTED`

After Owner acceptance, accepted bytes must go to one of only two destinations:

### Destination 1

`OWNER-ACCEPTED → GIT-CLOSED`

### Destination 2

`OWNER-ACCEPTED → PARKED OUTSIDE REPO → HASHED + MANIFESTED → WORKTREE CLEAN`

There is no lawful third state in which accepted bytes remain dirty while unrelated tracked work continues.

---

# 4. Required lifecycle

Every tracked implementation act follows:

`AUTHORIZED`
→ `IMPLEMENTED`
→ `SELF-VALIDATED`
→ `INDEPENDENTLY VERIFIED`
→ `OWNER-ACCEPTED`
→ `GIT-CLOSED`
→ `NEXT WORKSTREAM`

Where independent verification is explicitly not required, the state must be recorded as:

`NOT REQUIRED BY GOVERNING ACT`

and never silently skipped.

For tracked code, “implemented”, “validated”, “verified”, and “accepted” are not synonyms for “closed”.

---

# 5. One active tracked workstream

Default rule:

## ONE ACTIVE TRACKED WORKSTREAM AT A TIME

Parallel research may run in the external Workbench.

Parallel tracked production implementations are prohibited unless the Owner explicitly authorizes a special exception with:

- separate path partitions;
- separate manifests;
- proven non-overlap;
- separate closure plans.

---

# 6. Mandatory WORKTREE_GATE preflight

Before every repository-mutating act, the agent must record at minimum:

```bash
git rev-parse --show-toplevel
git branch --show-current
git rev-parse HEAD
git status --porcelain=v1
git diff --name-only
git diff --cached --name-only
```

Where remote synchronization matters:

```bash
git fetch origin
git rev-parse origin/main
```

Every tracked dirty path must be classified:

- `CURRENT_ACT_AUTHORIZED`
- `KNOWN_ACTIVE_RESIDUAL`
- `UNRELATED_DIRTY`
- `UNKNOWN`

If any path is `UNRELATED_DIRTY` or `UNKNOWN`:

`WORKTREE_GATE = FAIL`

and the mutation act MUST STOP.

---

# 7. Required ACT_MANIFEST

Every tracked mutation act must have a machine-readable manifest.

Recommended name:

`ACT_MANIFEST_<ACT_ID>.json`

Minimum fields:

- `actId`
- `actor`
- `role`
- `baseHead`
- `branch`
- `allowedTrackedPaths`
- `forbiddenPaths`
- `preActDirtyPaths`
- `preActStagedPaths`
- `candidatePaths`
- `candidateSha256`
- `candidateDiffSha256` where practical
- `selfValidationStatus`
- `independentVerificationStatus`
- `ownerAcceptanceStatus`
- `gitAuthorizationStatus`
- `gitClosureStatus`
- `commitSha`
- `residualTrackedPaths`
- `parkedArtifacts`

The active manifest may live outside Git until its governance disposition is decided.

---

# 8. Candidate identity before verification

Before independent verification, the exact candidate must be physically pinned.

Required evidence:

- controlling HEAD;
- exact modified tracked path set;
- SHA-256 of every modified candidate file;
- exact patch or equivalent diff;
- `git diff --stat`;
- staged state;
- relevant validator results.

A verifier PASS applies only to the exact candidate identity that was verified.

Later byte changes do not inherit that PASS automatically.

---

# 9. CLOSURE_GATE after Owner acceptance

Owner acceptance automatically creates:

`CLOSURE_REQUIRED`

No new tracked workstream may begin until one of the following is complete.

### Git closure

- accepted identity re-confirmed;
- exact staged scope proven;
- local commit created;
- exact committed path set verified;
- residual state reconciled;
- Owner pushes when push is Owner-only;
- remote branch confirms commit.

Final state:

`GIT-CLOSED LOCAL + REMOTE`

### External parking

If Git closure is deliberately deferred:

- candidate copied outside the repo;
- SHA-256 recorded;
- manifest preserved;
- reason for deferral recorded;
- tracked worktree restored to lawful baseline.

Final state:

`PARKED / HASHED / WORKTREE CLEAN`

---

# 10. Selective staging is an exception

Selective staging is allowed only when one physical file contains separable work from more than one provenance.

It is not the default workflow.

Before selective staging, the Git agent must prove:

1. exact accepted hunks;
2. exact excluded hunks;
3. staged index blob identity;
4. working-tree nonregression;
5. residual patch identity.

---

# 11. RESIDUAL_LEDGER after any partial commit

If a commit intentionally leaves tracked residual hunks, immediately record:

- source path;
- post-commit HEAD;
- current file SHA-256;
- residual patch SHA-256;
- exact residual hunk inventory;
- known provenance;
- authority status;
- next required act.

An anonymous residual is forbidden.

No unrelated tracked workstream may start over it.

---

# 12. Failed candidates

A failed candidate must not remain indefinitely dirty.

Required lifecycle:

`FAILED`
→ `PRESERVE OUTSIDE REPO`
→ `HASH`
→ `FAILURE RECORD`
→ `RESTORE TRACKED PATH`

Recommended location:

`MergeVue-M&A WORKBENCH/05_ARCHIVED_CANDIDATES/`

Failed candidates are historical evidence, not production authority.

---

# 13. External Workbench

Anything that is not an active canonical Git candidate should normally live outside the repository.

Canonical sibling:

`MergeVue-M&A WORKBENCH/`

Recommended structure:

```text
MergeVue-M&A WORKBENCH/
├── 00_INBOX/
├── 01_AGENT_REPORTS/
├── 02_CASE_RESEARCH/
├── 03_SOURCE_ARTIFACTS/
├── 04_PENDING_GIT_REVIEW/
├── 05_ARCHIVED_CANDIDATES/
├── 06_GOVERNANCE_INPUTS/
├── 07_DESIGN_REFERENCE/
└── 99_TEMP/
```

The Git repo is not a storage layer for temporary history.

---

# 14. Untracked classification

Every untracked artifact belongs to one of three buckets:

### A. CANONICAL GIT CANDIDATE

Durable project truth that should enter Git through a bounded reviewed commit.

### B. ACTIVE WORKBENCH

Research, evidence, reports, source packages, temporary candidates, rejected/failed artifacts.

### C. DISPOSABLE / MACHINE-LOCAL

Examples:

- `.DS_Store`
- temporary Office lockfiles
- caches
- exact duplicates
- ephemeral generated files.

For machine-local noise, prefer `.git/info/exclude` over changing project `.gitignore` unless repository policy is intended.

---

# 15. Never clean tracked state blindly

For tracked dirty content, lawful dispositions are:

- `KEEP + VERIFY + CLOSE`
- `PRESERVE + RESTORE`
- `SPLIT BY PROVENANCE`
- `OWNER DECISION REQUIRED`

Broad destructive cleanup is prohibited without exact scope proof.

Commands such as:

```bash
git restore .
git checkout -- .
git reset --hard
git clean -fd
```

must never be used to reconcile unknown tracked state.

---

# 16. Git-agent rule

Git writes are performed only by the designated Git agent under explicit Owner authorization.

Current MergeVue preference:

**Git Agent: Antigravity**

Git agent verifies:

- exact path scope;
- exact candidate identity;
- exact staged diff;
- exact commit contents;
- unchanged unrelated state.

Owner performs remote push unless explicitly changed.

---

# 17. Coder rule

Before coding, coder must:

- run `WORKTREE_GATE`;
- verify allowed paths;
- record baseline;
- stop on unknown dirty state.

Coder may not self-classify work as independently verified.

Coder may not self-close Git unless explicitly assigned Git-agent authority.

---

# 18. Independent verifier rule

Verifier must:

- verify candidate identity first;
- not rely only on coder-authored validators;
- distinguish validator PASS from provenance;
- distinguish semantic acceptance from byte identity;
- report exact candidate hashes;
- avoid mutation unless Owner explicitly grants a correction exception.

---

# 19. No validator self-authority

A dirty or newly authored validator does not prove itself.

Validator PASS proves only what the validator actually exercises.

For material runtime/security/report boundaries, string or AST checks must not be treated as runtime proof when runtime behavior matters.

Where practical, use negative controls:

`KNOWN BAD → FAIL`

and:

`ACCEPTED CANDIDATE → PASS`

---

# 20. Owner acceptance rule

Owner acceptance should identify the exact act/candidate being accepted.

Where practical bind:

- act ID;
- candidate or manifest SHA;
- independent-verification verdict;
- known residuals;
- Git authorization status.

Owner acceptance is not Git closure.

---

# 21. No silent status advancement

These statuses remain distinct:

- `IMPLEMENTED`
- `SELF-VALIDATED`
- `INDEPENDENTLY VERIFIED`
- `OWNER-ACCEPTED`
- `GIT-AUTHORIZED`
- `GIT-CLOSED LOCAL`
- `GIT-CLOSED LOCAL + REMOTE`

No agent may compress them into “done”.

---

# 22. NEXT_WORKSTREAM_GATE

Before a new tracked workstream begins, report:

```text
NEXT_WORKSTREAM_GATE

Tracked dirty paths: 0
Staged paths: 0
Accepted-but-unclosed tracked acts: 0
Unknown residuals: 0

STATUS: PASS
```

If any count is non-zero:

`STATUS: FAIL`

and the new workstream must not start.

The only exception is a continuation of the exact same active bounded workstream.

---

# 23. Exception process

Any exception requires explicit Owner authorization stating:

- why clean closure cannot happen first;
- exact paths allowed to remain dirty;
- exact provenance;
- exact candidate hashes;
- maximum temporary duration / next act;
- why later commits cannot be contaminated.

Silence is not authorization.

Urgency is not authorization.

Agent convenience is not authorization.

---

# 24. Governance defect condition

The following is itself a project governance defect:

> A new tracked mutation act begins while the canonical worktree contains tracked dirty bytes whose provenance is not completely reconciled.

If detected:

1. stop the new act;
2. preserve current state;
3. classify all dirty paths/hunks;
4. reconcile, close, or park them;
5. restore a lawful worktree state;
6. only then resume.

---

# 25. Required project integration

This rule should be physically integrated into:

- Git-agent instructions;
- coder instructions;
- verifier instructions;
- MergeVue quality-gate skill;
- control-tree / roadmap governance;
- pre-act templates;
- Git-closure templates.

A lightweight preflight validator should ultimately enforce:

`WORKTREE_GATE`

and:

`NEXT_WORKSTREAM_GATE`.

---

# 26. Controlling summary

The canonical MergeVue repository may contain only:

**clean committed truth**

or:

**one explicitly bounded active tracked candidate**.

Everything else belongs in:

- Git history;
- a physically hashed external Workbench package;
- or an explicitly authorized residual ledger.

The controlling sequence is:

`AUTHORIZE`
→ `IMPLEMENT`
→ `VERIFY`
→ `OWNER ACCEPT`
→ `GIT CLOSE OR PARK`
→ `CLEAN WORKTREE`
→ `NEXT WORKSTREAM`

Never again:

`ACCEPT`
→ `LEAVE DIRTY`
→ `START SOMETHING ELSE`.

---

## OWNER DECISION

**ACCEPTED.**

This rule is controlling for all future MergeVue tracked-repository work unless explicitly superseded by a later Owner decision.
