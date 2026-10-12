# OWNER ACCEPTANCE RECORD — CORR9 OFFLINE EFCA ENFORCEMENT

**Act:** `CORR9-OWNER-ACCEPTANCE-BINDING-1`
**Correction:** `CORR9-OWNER-ACCEPTANCE-BINDING-1.CORR1` (provenance corrections F-01–F-04)
**Recorded by:** Claude, documentary author (not an auditor of the recorded acts)
**Date recorded:** 2026-10-12 (original); 2026-10-12 (CORR1)
**Record status:** documentary candidate; not independently verified; not Git-bound

This file records Owner decisions that already exist. It creates no new decision.

---

## 0. Quotation rule

- Text in a **Literal Owner quotation** block is reproduced character for character: original wording, capitalization, Unicode (including Cyrillic) and punctuation, including the Owner's own spelling.
- Everything else in this file (normalized act IDs, role/function labels, scope summaries, "OF-n" summaries) is **the recorder's wording, not the Owner's**. None of it is presented as verbatim.
- **Provenance of the literal quotations.** Except OF-1, each was transcribed to this act inside the Owner-authorized CORR1 execution brief (2026-10-12). The original message bytes are not archived in this package, and this act does not establish the timestamp of any original statement. No separately timestamped physical Owner decision file for OF-2 or OF-3 existed before this package, and none is claimed. OF-1 is quoted from the bytes of the accepted contract itself.

## 1. Owner facts and their primary sources

### OF-1 — Option B selection and MAJ-01 bounded risk acceptance

Literal Owner quotation (inside the accepted contract bytes, `OPTION_B_ACCEPTED_CONTRACT.txt`, header "Controlling Owner decision"):

```text
OWNER SELECTS MAJ01 OPTION B — EXPLICIT TRUSTED-HOST BOUNDARY; ACCEPTS MAJ-01 AS NON-BLOCKING FOR OFFLINE SYNTHETIC-ONLY USE, SUBJECT TO REVISED INDEPENDENT VERIFICATION.
```

Evidence class: OWNER FACT, as embedded in the Owner-accepted contract (accepted under OF-2).

### OF-2 — Acceptance of the Option B contract

Literal Owner quotation (**primary Owner fact**):

```text
OWNER ACCEPTS CORR9-MAJ01-OPTIONB-CONTRACT-ALIGNMENT-1 EXACT CANDIDATE SHA256 1cf24018e947c389ab3a4875d6223aa7c496df15fb9c33b4466f64fdab44aff2 AS INDEPENDENTLY VERIFIED AND CONTROLLING FOR OFFLINE SYNTHETIC-ONLY CORR9 REVISED VERIFICATION. ORIGINAL CORR9.IV1 FAIL PRESERVED. ADVISORIES A-01/A-02 NON-BLOCKING.
```

Corroborating independent evidence. These sources do **not** substitute for the Owner decision:

- Contract IV1 report (`ARCHIVED_EVIDENCE/OPTIONB_CONTRACT_IV1/INDEPENDENT_CONTRACT_AUDIT_REPORT.md`): PASS 0/0/0/2. It states that it does not accept the contract on the Owner's behalf.
- CORR9.IV2 report §2 (`ARCHIVED_EVIDENCE/CORR9_IV2/INDEPENDENT_IV2_REPORT.md`): records that its Owner brief accepted the exact 13,499 bytes.

The accepted bytes remain 13,499 bytes, SHA-256 `1cf24018e947c389ab3a4875d6223aa7c496df15fb9c33b4466f64fdab44aff2`, unaltered (see §2).

### OF-3 — Acceptance of the CORR9 implementation

Literal Owner quotation (**primary Owner fact**):

```text
OWNER ACCEPTS CORR9 EXACT IMPLEMENTATION CANDIDATE AS INDEPENDENTLY VERIFIED BY IV2, CONTROLLING STRICTLY FOR OFFLINE SYNTHETIC-ONLY TRUSTED-HOST SCOPE UNDER ACCEPTED OPTION B CONTRACT SHA256 1cf24018e947c389ab3a4875d6223aa7c496df15fb9c33b4466f64fdab44aff2. ORIGINAL IV1 FAIL AND MAJ-01 REMAIN PRESERVED. NO HISTORICAL EXECUTION, PRODUCTION OR GIT AUTHORIZED.
```

The CORR9.IV2 report independently establishes the **verification result**. It does not itself grant Owner acceptance; IV2 §16 says acceptance is a separate Owner gate.

### OF-4 — Preservation of MAJ-01, not repair

Recorder's summary, not a quotation. MAJ-01 is risk-accepted in bounded scope by OF-1 ("ACCEPTS MAJ-01 AS NON-BLOCKING FOR OFFLINE SYNTHETIC-ONLY USE"). Its preservation is restated by OF-2 ("ORIGINAL CORR9.IV1 FAIL PRESERVED") and OF-3 ("ORIGINAL IV1 FAIL AND MAJ-01 REMAIN PRESERVED"). No Owner statement authorizes a repair.

### OF-5 — Authorization of this documentary act

Literal Owner quotation:

```text
CORR9-OWNER-ACCEPTANCE-BINDING-1 авторизую
```

Kept apart from the literal quotation:

| Element | Value | Nature |
|---|---|---|
| Normalized act identifier | `CORR9-OWNER-ACCEPTANCE-BINDING-1` | recorder normalization |
| Assigned role | ANALYST (`AGENTS_A.md`) | assigned by the controlling execution brief |
| Function | DOCUMENTARY AUTHOR | assigned by the controlling execution brief |
| Scope | bounded documentary artifact creation under the act-local path; forbidden: implementation/source changes, methodology changes, independent self-audit, Git mutation, production or historical execution | imposed by the controlling execution brief, not the literal Owner words |

### OF-9 — Authorization of CORR1

Literal Owner quotation:

```text
OWNER AUTHORIZES CORR9-OWNER-ACCEPTANCE-BINDING-1.CORR1 — CLAUDE ANALYST DOCUMENTARY AUTHOR. Correct exact Owner-decision provenance and non-verbatim attribution in the acceptance binding package; record the mandatory post-gate local Git commit and Owner-only manual push after Orchestrator PUSH ALLOWED. Preserve all accepted contract, CORR9 and archived-audit bytes. Regenerate affected manifest/index/checksum files, verify preservation, report, and STOP. No independent self-audit, Git mutation or production authorization.
```

### OF-10 — Git operating rules (see §6)

Literal Owner quotations:

```text
git commit этого этапа обязятелен после прохождения всех шагов
```

```text
Git push я делаю в ручном режиме по твоему указанию, что можно
```

### Other Owner facts used (not changed by CORR1)

| # | Fact (recorder's summary) | Evidence class | Physical source |
|---|---|---|---|
| OF-6 | Owner authorized CORR9 G4 implementation. | AGENT-REPORTED (author manifest quotes `OWNER AUTHORIZES CORR9 G4 IMPLEMENTATION`) | CORR9 `ACT_MANIFEST.json` → `ownerAuthorization.verbatim` |
| OF-7 | Owner accepted the EFCA operationalization rubric (SHA-256 `5bb887d2…6eba`). | OWNER FACT, Git-bound | `docs/decisions/MERGEVUE_STAGE2_CORR4_L4_EFCA_OWNER_DECISION_2026-10-10.md`, bound at `1335d2e` |
| OF-8 | OD-45-A and G2 allocation authority: OWNER ACCEPTED. G3 binding and G3.CORR1 correction: OWNER AUTHORIZED. Acceptance of the exact G3.CORR1 candidate is recorded only by the CORR9 author manifest. | AGENT-REPORTED (G3.CORR1 README "Authority chain"; CORR9 manifest `controllingPrecedents`), plus the original execution brief §2, which names the G3.CORR1 allocation SHA `53eb3ec4…ecb1` as additional authority | G3.CORR1 `README.md`; CORR9 `ACT_MANIFEST.json` |

OF-6 to OF-8 keep their original numbers and content. The new literal quotations added by CORR1 are OF-9 and OF-10.

## 2. The accepted contract's own header

The accepted contract bytes still say:

```text
**Status:** CONTRACT CANDIDATE — PENDING OWNER ACCEPTANCE
```

Its §10 also says: "This document remains an authored alignment candidate until separately accepted by the Owner."

Those bytes are the accepted identity. Editing the header would change the SHA-256 and break that identity. Owner acceptance is therefore recorded **here** (OF-2), outside the contract. This does not mean the contract is still pending.

## 3. Historical lifecycle fields that are now outdated — preserved, not repaired

| Artifact | Field | Recorded value | Later event that supersedes it (recorded here only) |
|---|---|---|---|
| CORR9 `ACT_MANIFEST.json` (`4427d24a…83d6`) | `implementationLifecycle.independentIV` | `NOT_PERFORMED` | CORR9.IV1 (FAIL, 2026-10-11), then CORR9.IV2 (PASS, 2026-10-12) |
| same | `implementationLifecycle.ownerAcceptanceOfCorr9` | `NOT_GRANTED` | OF-3 |
| same | `implementationLifecycle.orchestratorPreflight` | `PENDING` | IV1 §3 reports a successful preflight supplied by the Owner task. Not independently re-established here. |
| same | `remainingHolds[0]` | `formal Independent IV: NOT_PERFORMED` | IV1 + IV2 |
| G3.CORR1 `README.md` (`35ddeea8…eb55`) | `G3.CORR1_OWNER_ACCEPTANCE` | `NOT GRANTED` | OF-8 |

These fields describe the authoring moment and were not wrong when written. This act does not modify them.

## 4. Lifecycle — each state kept separate

### 4.1 Option B contract (`CORR9-MAJ01-OPTIONB-CONTRACT-ALIGNMENT-1`)

| State | Value | Evidence |
|---|---|---|
| Authored | YES — GPT-6 / Orchestrator, per IV2 §1 | IV2 report |
| Independent contract audit | **PASS — 0 BLOCKING / 0 MAJOR / 0 MINOR / 2 ADVISORY** (Codex) | `ARCHIVED_EVIDENCE/OPTIONB_CONTRACT_IV1/INDEPENDENT_CONTRACT_AUDIT_REPORT.md` |
| Owner acceptance | **ACCEPTED** — OF-2 literal statement (primary) | §1 OF-2; corroborated by contract IV1 and IV2 §2 |
| Exact identity preserved | YES — 13,499 bytes, `1cf24018…aff2`, four byte-identical captures | `EVIDENCE_INDEX.json` |
| Advisories A-01 / A-02 | **NON-BLOCKING per OF-2; still OPEN, carried, not closed** | contract IV1 §8 advisory register; IV2 §14 |
| Git binding | NOT PERFORMED | — |

### 4.2 CORR9 implementation (`STAGE2_CORR4_L4_EFCA_OFFLINE_ENFORCEMENT_IMPLEMENTATION_1.CORR9`)

| State | Value | Evidence |
|---|---|---|
| Authored | YES — DeepSeek, CODER | CORR9 `ACT_MANIFEST.json` |
| Candidate bytes | **UNCHANGED** — six files re-hashed 2026-10-12, all match | `EVIDENCE_INDEX.json` → `corr9Candidate` |
| Author self-validation | PASS 117/117 (`AUTHOR_SELF_VALIDATION_ONLY`) | CORR9 `TEST_RESULTS.json` |
| Production integration | **NOT ESTABLISHED / NOT AUTHORIZED** (OF-3: "NO HISTORICAL EXECUTION, PRODUCTION OR GIT AUTHORIZED") | IV2 §§5, 9.C, 12; OF-3 |
| Git binding | NOT PERFORMED | — |

The five facts below are separate. None implies, cancels or replaces another:

| # | Fact | Kind | Source |
|---|---|---|---|
| 1 | Original CORR9.IV1 = **FAIL — 0 BLOCKING / 1 MAJOR** (Codex, 2026-10-11) | independent verification result | `ARCHIVED_EVIDENCE/CORR9_IV1/INDEPENDENT_IV1_REPORT.md` |
| 2 | `CORR9-IV1-MAJ-01` = **historical MAJOR**, preserved as issued, **not repaired** | audit finding | IV1 §9; IV2 §§7, 14 |
| 3 | Owner's **bounded risk acceptance** of MAJ-01 (offline synthetic-only, trusted-host) | Owner decision | OF-1 (contract-embedded literal) |
| 4 | Revised CORR9.IV2 = **PASS — 0 new findings**; regression 117/117; probe groups 8/8 (Codex, 2026-10-12) | independent verification result | `ARCHIVED_EVIDENCE/CORR9_IV2/INDEPENDENT_IV2_REPORT.md`, `audit_summary.json` |
| 5 | Owner's **implementation acceptance**, strictly offline synthetic-only / trusted-host, under contract `1cf24018…aff2` | Owner decision | OF-3 literal statement |

IV2 PASS does not convert IV1 into a PASS. Risk acceptance (3) is not a repair of (2). Implementation acceptance (5) is the Owner's decision, not the auditor's (4).

### 4.3 Scientific authority

| State | Value |
|---|---|
| EFCA rubric identity | unchanged — `5bb887d2…6eba`, 97,712 bytes, Git-bound at `1335d2e` |
| G3.CORR1 allocation identity | unchanged — `53eb3ec4…ecb1`, 716 bytes, untracked workbench |
| Predecessors (ORIGINAL, CORR1–CORR8) | unchanged — see `ACT_MANIFEST.json` → `preservation` |
| New scientific category or causal adjudication | **NONE** |
| `categoryAssignment` / `tupleLevelName` / `causeLink` | `UNASSIGNED` / `UNASSIGNED` / `UNASSIGNED_PENDING_J1` |
| Phase-1 blind packet | exactly five fields: `caseId`, `sideId`, `factId`, `sealedFactText`, `questionText` (IV2 §13) |
| Historical data execution | **NOT AUTHORIZED** |

### 4.4 Repository state of this package

| State | Value |
|---|---|
| Documentary package | **PREPARED — CORR1 candidate** |
| Independent verification of this package | **NOT PERFORMED** |
| Owner acceptance of this package | **NOT GRANTED** |
| Physical controlling-governance binding | **NOT PERFORMED** (no edit to `docs/governance/`, `docs/decisions/`, Control Tree, overlay or matrix) |
| Local Git commit | **MANDATORY for eventual completion (OF-10); NOT AUTHORIZED for execution in CORR1** |
| Git push | **Owner-only, manual, only after Orchestrator `PUSH ALLOWED`** |
| Git mutation by this act or CORR1 | **NONE** |

## 5. What remains open after this record

Carried unchanged, not closed by this record:

- `CORR9-IV1-MAJ-01` / NG-01 — known, bounded, Owner-risk-accepted.
- `ALIGN-IV1-A01`, `ALIGN-IV1-A02` — contract advisories. Non-blocking per OF-2; still OPEN.
- `V-IV1-MIN-01`, `V-IV1-MIN-02`, `V-IV1-ADV-01` — EFCA rubric findings, OPEN (EFCA decision §3.3).
- Option B TB-04 future integration obligations.
- 1,094-disagreement classification; J-1/J-4; J-2/J-3; B5.8 (NOT AUTHORIZED); FINAL CONTRACT FREEZE.
- Standalone bound transcripts for OD-37/38/39 — not located (IV1 §1, IV2 §3).
- Git closure scope (whether CORR9 engine/predecessor packages also enter Git) — undecided; for a separately authorized closure act.

## 6. Git closure workflow (OF-10) — future workflow, not a permission for this act

OF-10 establishes two standing operational rules:

- a local Git commit of this stage is **mandatory** once every preceding step has passed;
- the Owner performs Git push **manually**, and only when told it is allowed.

**Permissions in CORR1:** none. CORR1 performs no `git add`, commit, push, branch operation or deployment. A local commit being mandatory does **not** authorize any agent to execute it now.

Required sequence (no step may be skipped or reordered):

1. Claude completes the CORR1 documentary candidate. *(this act)*
2. A **different** authorized agent performs independent documentary verification of the exact CORR1 candidate.
3. Owner accepts the exact independently verified candidate.
4. Antigravity (GIT AGENT, `AGENTS_G.md`) executes the **separately authorized** local Git commit.
5. Orchestrator verifies the commit SHA, parent, exact path set, content hashes, preservation and intended remote target.
6. Orchestrator issues `PUSH ALLOWED` only after that verification is positive.
7. Owner performs the Git push **manually**.
8. The remote commit and its contents are independently reconciled before the state may be recorded as `REMOTE GIT-CLOSED`.

Binding constraints on that future workflow:

- No agent may infer push authorization from a successful local commit. Push is never an agent action.
- **The eight `.gitignore`-matched `.log` members** (listed in `ACT_MANIFEST.json` → `gitIgnoredMembers`) belong to the package. The Git Agent must explicitly verify that all eight are in the commit using the allowed Git workflow and must not silently omit them. Note for the closure brief: Git refuses an ignored path under plain `git add <exact path>`; whether the allowed workflow permits a forced add of exact paths is for the separately authorized closure brief to state. This record does not decide it.
- The Git scope beyond this package (untracked CORR9 engine and predecessor packages, G3/G3.CORR1) is **not** decided here and is not expanded by this record.
