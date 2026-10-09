# MERGEVUE B5.5 / B5.6 / B5.7 — OWNER REAFFIRMATION STATUS ADDENDUM (CANDIDATE)

**Act:** `MERGEVUE_B5_5_B5_7_OWNER_REAFFIRMATION_STATUS_RECONCILIATION_1`
**Date:** 2026-10-09
**Author:** Claude (executing model `claude-opus-5-5`). Role: Owner-appointed ANALYST / AUTHOR under `AGENTS_A.md`.
**Reserved independent verifier:** Codex (separate Owner-authorized IV1; not performed).
**Repository baseline:** `Inposibl/mergevue`, `main`, HEAD = remote `main` = `1c694b3db3a27e6385fd7716d7e59153d8df4e46` (verified at authoring).
**Status:** `CANDIDATE_READY_FOR_INDEPENDENT_VERIFICATION`. This file has not been independently verified, has not been accepted by the Owner as a document, and is not Git-bound.

**Relation to earlier records.** This is an **additive successor** to the provenance-only recovery addendum `docs/governance/historical-corpus/MERGEVUE_B5_5_B5_6_B5_7_RECOVERED_EVIDENCE_ADDENDUM_2026-10-09.md` (SHA-256 `229b3c79ec9fc1d28111997666d171122d34d00954f98b15ec2b982a6cac73a2`, bound at `1c694b3`). That addendum is **not edited**. Its status-correction rule says that node status changes need *"separate, explicitly accepted status reconciliation"*. This candidate is that reconciliation. It also answers `needsLaterOwnerControlledStatusAdjudication: true` in the predecessor evidence delta (`1d9c2039…5369`).

Evidence identifiers `EV-nn` refer to `EVIDENCE_AND_AUTHORITY_CROSSWALK.json`. That file records the path, SHA-256 recomputed from actual bytes, bytes, first binding commit, evidence class and authority level for each item.

---

## 1. Result

| Node | CORR4 snapshot (2026-10-08) | Proposed current representation | Changed dimensions |
|---|---|---|---|
| **B5.5** | `CANDIDATE` / `NOT_ESTABLISHED` / `BOUND@d52e7f4` / `N/A` / `N/A` | **`OWNER_ACCEPTED` / `PASS` / `BOUND@d52e7f4`** / `N/A` / `N/A` | governance, independentVerification |
| **B5.6** | `OWNER_ACCEPTED` / `PASS` / `N/A` / `N/A` / `N/A` | unchanged | none (HOLD-2 evidence gap closed) |
| **B5.7** | `CANDIDATE` / `NOT_ESTABLISHED` / `BOUND@92236dc` / `N/A` / `N/A` | **`OWNER_ACCEPTED` / `PASS` / `BOUND@92236dc`** / `N/A` / `N/A` | governance, independentVerification |

Column order: governance / independentVerification / gitBinding / implementation / runtime. Every value is an existing CORR4 enum. `OWNER_REAFFIRMED` appears only as event metadata (`governanceEvent.event`) and never replaces `OWNER_ACCEPTED`. "GIT_BOUND" in the Owner act maps to the existing `BOUND@<commit>` value. The node binding remains the commit that bound the **instrument**. `1c694b3` bound evidence **about** the node, so it is recorded as metadata.

Dependencies are unchanged (B5.5 ← B5.2; B5.6 ← B5.1; B5.7 ← B5.6). The other 60 CORR4 nodes are untouched. See `DOWNSTREAM_DEPENDENCY_NON_PROMOTION_CHECK.md`.

---

## 2. Verified chronology

Commit times come from Git. Auditor-reported repository states are labelled as such.

| When | Event | Evidence class |
|---|---|---|
| 2026-09-25 00:56 | `6ad8933` binds the outcome-IV durable authority | Git fact |
| 2026-09-25 | Codex authors the B5.5 freeze candidate. Its own bytes say `READY_FOR_INDEPENDENT_VERIFICATION`, `OWNER_ACCEPTED: NO`, `CORPUS_FREEZE_FINAL: NO` (EV-01 :6-10) | historical candidate bytes |
| 2026-09-25 (HEAD `6ad8933`) | Grok IV1 of `da9b9de2…` → **PASS, 0/0/0, ADVISORY A-01..A-03** (EV-03 :9, :179-207) | auditor transcript copy; HEAD auditor-reported |
| 2026-09-25 01:42 | `d52e7f4` binds the B5.5 candidate bytes (blob SHA = `da9b9de2…`, re-verified) | Git fact |
| 2026-09-25 | Codex IV1 of the B5.6 correction campaign → **PASS, four candidates, DC-001..DC-019** (EV-04) | auditor report copy |
| 2026-09-25 | Z.ai authors the B5.7 successor candidate (`STAGE1_CLOSED = NO`, `OWNER_ACCEPTED = NO`, EV-02 :7-11, :404-413). It lists the B5.5 freeze among its "inherited controlling corpus authorities" (EV-02 §2.3) | historical candidate bytes |
| 2026-09-25 (HEAD `d52e7f4`) | Codex IV1 of `be9593a7…` (Workbench copy, pre-binding) → **PASS, 9/9** (EV-05 :12, :88, :100-104) | auditor report copy; HEAD auditor-reported |
| 2026-09-25 18:20 | `92236dc` binds the B5.7 candidate bytes (blob SHA = `be9593a7…`, re-verified) | Git fact |
| 2026-09-25 | Orchestrator handoffs assert Owner acceptance and Git closure for both (EV-06, EV-07) | secondary, agent-reported |
| 2026-10-07 | The Reality Audit asserts the successor binding is "Fully Accepted and Git-Closed" (EV-20 :28) | agent assertion |
| 2026-10-08 | CORR4 is authored on baseline `ee55034`. Its searches find no IV or Owner-acceptance record for B5.5/B5.7 (HOLD-1/HOLD-3) and no B5.6 IV1 bytes (HOLD-2). Bound at `9b57f0c` | Owner-accepted, IV5-verified snapshot |
| 2026-10-08 22:17 | `2f7bcc5` Git-closes B17.5 FEVA CORR2 (Owner-accepted, Codex IV PASS) | bound record (EV-14) |
| 2026-10-09 00:02 / 00:08 | `7f544af` / `8f0085b` bind the harness adaptation and record the Owner's Stage-2 regression sequencing hold (EV-16 :36-41) | bound record |
| 2026-10-09 08:49 | `1c694b3` binds the recovered IV copies, handoffs and provenance-only addendum (no status change) | Git fact |
| 2026-10-09 | **The Owner directly reaffirms B5.5 and B5.7** ("подтверждаю") | current Owner decision (`OWNER_DECISION_PROVENANCE.md`) |

All listed commits are ancestors of `1c694b3`, which equals remote `main`.

---

## 3. Mandatory reconciliation explanations

### 3.1 Historical authoring-time candidate states

Both instruments state, in their own immutable bytes, that they are unaccepted candidates. B5.5 says `OWNER_ACCEPTED: NO` and `CORPUS_FREEZE_FINAL: NO` (EV-01 :9-10). B5.7 says `OWNER_ACCEPTED: NO`, `STAGE1_CLOSED: NO`, and "Independent IV of this candidate is the next act" (EV-02 :8-10, :409-413). These statements record what was true **when each document was authored**. Under the CORR4 dimension rule (IV4-N02), an authoring-time statement never establishes current status. They are preserved verbatim and are not rewritten here.

### 3.2 Later recovered independent IV reports

- **B5.5:** Grok IV1 audited the exact bytes `da9b9de2…` (20,173 bytes). Codex was the author and Grok was not, so the author ≠ auditor rule held. The verdict was `PASS`, BLOCKING 0, MAJOR 0, MINOR 0, with three advisories (A-01 Case-1 v1.0.6 chain reach; A-02 `.DS_Store` touch; A-03 retained non-blocking debt classes). Terminal: `PASS_9_CASE_CORPUS_FREEZE_IV`.
- **B5.6:** Codex IV1 audited the four Grok correction candidates against DC-001..DC-019. The verdict was `PASS — four correction candidates only`, 19/19. It also recorded one deferred downstream analytical dependency (four case-local analytical lineages) as outside candidate scope (EV-04 :89).
- **B5.7:** Codex IV1 audited the exact bytes `be9593a7…` (22,517 bytes). Z.ai was the author and Codex was not. The verdict was `PASS`, with no BLOCKING, MAJOR, MINOR or ADVISORY candidate defect. It confirmed 9/9 successor identities, 18/18 sides, 4/4 transitions and 5/5 unchanged identities, and excluded 4/4 stale lineages.

These are **recovered copies of auditor outputs**, not re-executions. This act did not re-audit and makes no re-audit claim (residual R-2).

### 3.3 Original Git bindings

The B5.5 instrument was bound at `d52e7f499eff4b2c9ee290380fe7cb7db5ec8e5f` and the B5.7 instrument at `92236dc1341c3f85565514c60029af388bc51422`. Re-hashing the Git blobs at those commits gives exactly `da9b9de2…` and `be9593a7…`. Both files are unchanged at HEAD. Both commits are reachable from remote `main`.

### 3.4 The 2026-10-09 evidence-restoration commit

`1c694b3db3a27e6385fd7716d7e59153d8df4e46` binds the three recovered IV files. Their Git blobs hash to `9aea5e0e…`, `8eb434e4…` and `04840444…`, matching the Owner act. The same commit binds the handoffs, the correction report and the provenance-only addendum. That commit changed no node status, by its own terms. It made the IV evidence durable and auditable, but it could not supply Owner acceptance.

### 3.5 The Owner's direct reaffirmation (2026-10-09)

The Owner answered "подтверждаю" to the question quoted verbatim in `OWNER_DECISION_PROVENANCE.md`. This is a **current** primary Owner decision (`AGENTS.md` §3, level 1). It is **not** the original September 25 message and is not represented as one. Its scope is bounded as follows:

- it covers the previously accepted state of B5.5 and B5.7 only;
- it applies within the boundaries stated in the Owner act (§4, §6);
- all historical limitations are preserved;
- B5.8–B5.19 are not recognized as executed.

### 3.6 Why B5.5 and B5.7 are now `OWNER_ACCEPTED / PASS / BOUND@<commit>`

Each dimension now has its own independent support, and no dimension is inferred from another:

- **Governance `OWNER_ACCEPTED`:** the direct 2026-10-09 Owner decision. It does not rest on the handoffs (EV-06/EV-07), which remain secondary.
- **IV `PASS`:** the recovered, hash-verified, candidate-specific auditor outputs (EV-03, EV-05). Each one names the exact audited SHA, and each was issued by an actor other than the author.
- **Git `BOUND@d52e7f4` / `BOUND@92236dc`:** blob identity re-verified at the original commits (§3.3).

Under the Control Tree v2.1 legend, "independently verified + Owner-accepted" is the ✅ CLOSED definition. That is consistent with this representation for the stated scope only.

**Derived consequences.** These are shown as derivations and are not separate Owner statements.

- **B5.5 freeze effect is operative.** EV-01 :94 makes the freeze effect conditional on (a) IV and (b) explicit Owner acceptance of the exact candidate. Both conditions are now met. The scope is the 9-case / 18-side **input** corpus. The B5.5 package identities for Cases 1, 3, 5 and 6 remain the frozen *historical* record. Current pre-T0 factual input for those cases is the B5.7 successor set, which applies the freeze's own reopening clause (EV-01 :94) through B5.7 as a separate act.
- **B5.7 `STAGE1_CLOSED = YES`**, strictly for the factual-authority successor-binding lifecycle. EV-02 :298-321 makes closure conditional on IV → Owner acceptance → physical Git binding / remote verification. All three are now evidenced. The historical `STAGE1_CLOSED = NO` stays verbatim in the instrument as its authoring-time status.

### 3.7 Why B5.6 needs only closure of its missing-report evidence gap

B5.6 was already `OWNER_ACCEPTED / PASS` in CORR4, and the acceptance locus was the bound successor bytes (EV-02 §2; CORR4 E11). Its only open item was HOLD-2: the IV1 report's physical bytes had not been located, and its SHA `8eb434e4…` was carried as lineage only. The recovered file hashes to exactly that pin. The check that B5.7 §19 asked for ("if the physical bytes later surface, they should be hash-checked against the pin") is therefore satisfied. HOLD-2 is resolved as of `1c694b3`.

No dimension changes and no new acceptance is required. The downstream analytical debt is **not** discharged: four case-local analytical lineages are still excluded from the next stage by EV-02 §16.

### 3.8 Why CORR4's search statements were reasonable then and are outdated now

CORR4 (E10, E11, E12; HOLD-1/2/3) searched the repository, the Workbench and Git history (up to baseline `ee55034`) and found no candidate-specific IV reports and no B5.6 IV1 bytes. That conclusion was correct for the evidence available at the time. The recovered files were not in the repository until `1c694b3` (2026-10-09), and the restoration index shows that they came from an external archive (`MERGEVUE_TEN_ARCHIVE_RECONCILIATION_2026-10-09.zip`).

CORR4's own rule defines `NOT_ESTABLISHED` as "searched, not found — a missing-evidence marker, never a negative finding". The recovery therefore **supersedes** those markers without contradicting them. It is outdated only in these dimensions:

- B5.5 IV and B5.7 IV (now PASS evidence);
- B5.6 report bytes (now present);
- B5.5/B5.7 governance (now covered by a current Owner decision that did not exist on 2026-10-08).

CORR4 also recorded an anomaly: binding precedes the declared lifecycle. The recovered reports narrow it. Both auditors report a HEAD that predates the respective binding commit, which indicates that IV came before binding. The ordering of the original Owner acceptance relative to binding remains **NOT DETERMINABLE**. That ordering is not load-bearing for current status after the reaffirmation.

### 3.9 Why the original September Owner messages remain unrecovered

The only September-dated acceptance statements located are secondary Orchestrator handoffs (EV-06, EV-07), later agent assertions (EV-20), and the external Grok 2026-09-26 document cited by CORR4. None of them is the Owner's own message. The restoration act recovered no primary message either. This act did not search further, by instruction ("Do not repeat evidence collection"). The finding "NOT RECOVERED" is therefore inherited from the restoration act and CORR4, and was not re-established here. The 2026-10-09 reaffirmation makes the missing originals non-load-bearing for **current** status, but it does not recover them. Residual R-1 stays open.

### 3.10 Why no other node or methodology status changes

- The Owner's decision explicitly withholds recognition of B5.8–B5.19 as executed.
- In the CORR4 52-edge graph, B5.8 is the only direct child of B5.5/B5.7. B5.7 is the only child of B5.6.
- Resolving a predecessor removes a **blocking** reason. It neither authorizes nor executes a successor.
- No methodology source, contract or runtime was touched, and no analytical stage was run.
- B17.5's current state comes from its own post-CORR4 bound closures. This act neither re-states it as changed nor rolls it back to the CORR4 snapshot.

---

## 4. Six-way distinction (kept separate)

| | B5.5 | B5.6 | B5.7 |
|---|---|---|---|
| Historical acceptance **asserted by handoff** | yes — EV-06 (secondary) | n/a | yes — EV-07 (secondary) |
| Historical acceptance **directly observed** | **no** (not recovered) | no primary message. Acceptance is recorded in bound successor bytes (EV-02 §2) and stated as an Owner instruction in EV-05 :16 | **no** (not recovered) |
| **Current direct Owner reaffirmation** | yes — 2026-10-09 | not required / not given | yes — 2026-10-09 |
| **Independent IV evidence** | Grok PASS 0/0/0 + 3 ADVISORY (EV-03, copy) | Codex PASS, four candidates (EV-04, copy) | Codex PASS 9/9 (EV-05, copy) |
| **Git binding** | instrument `d52e7f4`; IV evidence `1c694b3` | node N/A; IV evidence `1c694b3` | instrument `92236dc`; IV evidence `1c694b3` |
| **Scientific / runtime readiness** | **not established** (EV-01 :98) | **not established**; downstream debt intact | **not established** |

---

## 5. Explicitly not established by this candidate

- HEDC validity, methodology or implementation closure
- Outcome-hidden mechanism normalization (B5.8)
- Independent dual coding, rule freeze, blind replay, reproduction, falsification, LOCO, coverage verdicts (B5.9–B5.11, B5.15–B5.18)
- Owner methodology acceptance (B7.1)
- Final calibrated replay and its verification (B5.12, B5.19)
- Calibrated predictive performance
- Nine software-generated historical reports (B5.13)
- Public case studies, Public Proof Ready, Product Ready, release (B5.14, B10.3, B16.x)
- Completion of the full Stage-2 measurement regression
- Any runtime or production behavior

---

## 6. Preservation

This act did not modify any of the following:

- `docs/governance/MERGEVUE_CONTROL_TREE_v2.1_2026-09-04.md`
- the CORR4 package and its IV5 closure addendum
- the two historical candidates and their sidecars
- the recovery addendum and the recovery directory (including the recovered reports)
- any case package
- source, API, tests or configuration
- any B5.8–B5.19 or B17 artifact

The before/after hash proof is recorded in `AUTHOR_REPORT.md`.

**This candidate becomes controlling documentary status only after separate independent verification, explicit Owner acceptance of its exact bytes, and authorized Git binding.**
