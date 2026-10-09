# B5.8 minimum lawful entry preflight — CORR2 (corrected successor)

**Act:** `MERGEVUE_B5_8_MINIMUM_LAWFUL_ENTRY_PREFLIGHT_1.CORR2`
**Actor / role:** Z.ai. ANALYST / TARGETED CORRECTION AUTHOR under `AGENTS.md` / `AGENTS_A.md`. Owner-assigned in the CORR2 act text.
**Date:** 2026-10-09
**Mode:** read-only inspection plus exactly five external output files in one new external CORR2 directory. No repository writes, no Git operations, no scientific execution.

**Correction lineage:**

- Original analytical act: `MERGEVUE_B5_8_MINIMUM_LAWFUL_ENTRY_PREFLIGHT_1` — four analytical files authored by Claude (Opus 5.5); documentary completion manifest authored by Z.ai. Both are immutable inputs.
- CORR1: `MERGEVUE_B5_8_MINIMUM_LAWFUL_ENTRY_PREFLIGHT_1.CORR1` — Z.ai, resolving parent findings IV1-F01 (BLOCKING), IV1-F02 (MAJOR), IV1-F03 (MAJOR), IV1-F04 (MINOR). Immutable.
- Independent audit of CORR1: `MERGEVUE_B5_8_MINIMUM_LAWFUL_ENTRY_PREFLIGHT_1.CORR1.IV1` — Codex. Verdict **FAIL — BLOCKING 1 / MAJOR 0 / MINOR 0 / ADVISORY 0**: single finding `IV1-CORR1-F01` (the Route A shortest-path sentence still reached S8 without establishing the §L-2 measured-pilot condition). Parent F02–F04 dispositions: `VERIFIED_ADDRESSED`. Immutable.
- This file is the Z.ai CORR2 correction resolving exactly `IV1-CORR1-F01` and its synchronized dependents. Nothing else is reopened, and no prior authorship is changed or backdated.

**Status of this file:** analytical CORR2 candidate. It is not an independent verification, not an Owner decision, not a methodological exception or waiver, and not a Control Tree edit.

**Terminal determination: `REQUIRES_SPECIFIC_OWNER_DECISION`** — corrected shape: **two parallel normative decisions** (T1: HOLD-6 actor/process disposition; T2: authorization of §L-4 classification of the existing frozen 1,094-tuple ledger) plus the downstream contractual chain (S4–S6, S8), gated by a fail-closed §L-2 science-eligibility gate at convergence. **Unqualified lawful B5.8 entry remains `NOT_ESTABLISHED` while CORR4 §L-2 measured-pilot process compliance is NOT_ESTABLISHED.** See `B5_8_SHORTEST_LAWFUL_SEQUENCE.md` §2 and §2A.

---

## 1. Baseline verified

Read-only, at the start of this CORR2 act:

| Item | Value | Class |
|---|---|---|
| Repository root | `…/MergeVue-M&A (August 2026)`, origin `github.com/Inposibl/mergevue` | SOURCE |
| HEAD | `3852ca460c44df7c36d4c159a37125c6048f8548` — the same candidate-time HEAD as CORR1 and `CORR1.IV1`. No fetch performed | SOURCE |
| Tracked dirty files | 0 (431 untracked paths, unchanged). No staging, no commit, no reset, no checkout | SOURCE |
| Frozen CORR2 input | `MERGEVUE_B5_8_CORR2_AUTHOR_INPUT_2026-10-09.zip`, SHA-256 `ae8917f3c40fbb5b9d0fe8d8c517dc664890d6fc1f8472d3e4fc4510c3bec7ec`, 245,103 bytes — verified exact; eleven members: `CORR1_CANDIDATE/` (5 files) + `CORR1_IV1_FAIL/` (5 files) + `LINEAGE/` (1 zip), all rehashed and matching their recorded identities | SOURCE |
| Lineage integrity | `LINEAGE/MERGEVUE_B5_8_CORR1_IV1_FULL_INPUT_2026-10-09.zip` equals the IV1 frozen transport `47bd9688c87886187a1460a4e6d4632bfd8ec2f0fbd524c63ff8541e609a5430` (158,113 bytes) | SOURCE |

Current statuses are not restored from superseded snapshots: B5.5 OWNER_ACCEPTED (bound `d52e7f4`, reaffirmation `9b1a501`); B5.7 OWNER_ACCEPTED (bound `92236dc`, reaffirmation `9b1a501`); B17.5 FEVA CORR2 Owner-accepted, Codex CORR2.IV1 PASS (bound `2f7bcc5`); B17 CORR1 documentary preflight accepted and Git-bound at this HEAD (`3852ca4`); CORR4 accepted as PILOT VERSION (bound `2567223`). None of these predecessors is reopened.

## 2. What B5.8 is (retained derivation, with the IV1 scope qualification)

The parent's derivation is retained unchanged in substance, because neither IV1 audit faulted it (parent gate G6 and CORR1 gate G7: `PASS` / `PASS_WITH_SCOPE_QUALIFICATION`):

- B5.8 on the accepted reconstruction (node matrix `621eca0a…8a97`, bound `9b57f0c`) is "Mechanism normalization (18 sides, outcome-hidden)"; its incoming edges are B5.5, B5.7, B17.5 — all satisfied in their accepted scopes.
- CORR4 §M orders: pilot → disagreement classification → correction/re-IV/rerun cells if required → Owner acceptance of the post-pilot contract → FINAL CONTRACT FREEZE → 905/905 sealed-fact binding across 18/18 sides → independent dual coding → stabilization → HEDC. "905-fact semantic binding before the final freeze is forbidden. Dual coding must not be omitted."
- B5.8 is therefore executed as CORR4 §M's full-population binding under the FINAL frozen contract (derivation class B). The alternative reading (B5.8 = later stabilization) lands after binding and dual coding, hence also after FINAL CONTRACT FREEZE; the entry conclusion is identical either way.
- **CORR2 addition (per IV1-CORR1-F01):** the §M pilot step includes its §L-2 measured-process condition — TWO independent stratification coders under restricted inputs. That condition is part of what must be established before the §M acceptance/freeze chain becomes eligibility-producing; it is carried as the fail-closed G-L2-ELIG gate (§3.G, §4 below).

**IV1 qualification carried:** this is a bounded derivation. It is not an authorized node rename and does not license any execution to omit normalization or traceability states; NON_ANALYTICAL, UNMAPPED, abstention and other fail-closed outcomes remain lawful results of the binding.

## 3. Central findings (CORR1 state preserved; operational path corrected by CORR2)

### A. Has B5.8 already been performed? → `NO_EXECUTION_ESTABLISHED, strictly within the examined scope` (corrects parent IV1-F03; preserved unchanged)

The parent candidate reported a "maximum 27 distinct facts in any one file" coverage measure and concluded "No past execution is available for reuse, and none needs to be fenced off." **Both are retracted** (CORR1, independently verified by Codex `CORR1.IV1`).

Corrected census facts. The broad census cited here is **Codex's independent parent-IV1 census** (source: `IV1_EVIDENCE_RECOMPUTATION.json`, `priorExecutionSearch`); Z.ai did not repeat that sweep and reports it as Codex evidence:

- 22,446 JSON/JSONL files read across repository WORKBENCH, external WORKBENCH, ten Cline worktrees, one Codex worktree and `/private/tmp` (excluding dependency/Git/virtual-environment internals); 367 files carry coding tokens.
- Parsed fact references: **maximum 36 per artifact including test fixtures**; maximum **32 references matching the admitted 905-fact population** in examined artifact-index material. These are **reference counts, not proof of executed 905-fact normalization** — they must not be read as semantic binding coverage.
- Raw fact references, test fixtures, partial pilot results (the 30-fact pilot universe) and actual semantic binding records are distinct categories. No examined file contains an established full 905-fact execution result.
- All execution-boundary records still state the opposite of execution: pilot version lock §15 `905_FACT_BINDING_EXECUTED = NO`; CORR4 IV5 `905_BINDING_EXECUTED = NO`.

Corrected conclusions (unchanged by CORR2):

1. `NO_EXECUTION_ESTABLISHED` is maintained **strictly as a bounded negative-search state for the examined locations**. It does not assert that B5.8 never ran anywhere.
2. **No reusable accepted full B5.8 result was recovered in the examined locations.** No blanket "nothing needs fencing" statement is made.
3. Any future B5.8 execution packet **must** validate exact source/output identities and perform destination-collision checks before any write, and must preserve any discovered accepted result rather than silently replacing it.
4. Existing accepted material and historical candidates are preserved unchanged.

### B. Accepted common normalization schema → exists only as a pilot version (retained)

Unchanged: controlling instrument `STAGE2_SEMANTIC_SUCCESSOR_CANDIDATE_CORR4.md` (`2de49862…0bb0`, 250,512 B, bound `2567223`, Codex IV5 PASS) is Owner-accepted **as the PILOT VERSION only** (pilot lock `0f9daef2…897a` §4: no 905-fact binding, no final freeze authorized). No Owner-accepted post-pilot contract and no FINAL CONTRACT FREEZE exist (accepted B17 CORR1 steps 7–8: both OPEN). The cumulative successor-chain head `PD3-CLAR-1.CORR1` (`cb08b51e…`) and the post-pilot contract candidate `5e373e16…381d` remain non-authority candidates. No replacement grammar is proposed here.

### C. Listed predecessors (`B5.8 ← B5.5, B5.7, B17.5`) → satisfied in their accepted scopes (retained)

Unchanged: B5.5 (corpus freeze `da9b9de2…cbd6`, Grok IV PASS, reaffirmed `9b1a501`); B5.7 (successor binding `be9593a7…0237`, Codex IV PASS, reaffirmed `9b1a501`, §15 stale lineages / §16 input rule / §17 firewall preserved); B17.5 (FEVA CORR2 `5b37071a…8daa`, 116 records, Codex CORR2.IV1 PASS, bound `2f7bcc5`; full measurement `NOT_RUN / DEFERRED`). Full regression remains NOT_RUN / DEFERRED; B5.8 remains unexecuted as an established accepted full-scope act.

### D. G-3, HOLD-6, §L-4 and §M reconciled (corrects parent IV1-F02 and IV1-F04; preserved unchanged)

1. **Is `regress(path)` a prerequisite of B5.8? → `DEFERRED / NO_MANDATORY_EDGE_RECOVERED / G3_NOT_DETERMINED`.** No accepted mandatory `regress(path) → B5.8` edge was recovered (CORR4 §M does not name it; adapter closure `7f1cd15b…e968` §§36–41 defers the full run pending new Owner authorization; B17 CORR1 step 11 classifies it `DIAGNOSTIC_SCOPE` and step 16 keeps G-3 `NOT DETERMINED`). G-3 is not silently marked resolved; the unresolved relationship is preserved as a residual for the eventual B5.8 entry packet. Continued deferral is lawful under §14A gate 6 (NOW).
2. **Does HOLD-6 precede §L-4 classification? → NO. The two are independent parallel tracks.** The accepted B17 CORR1 preflight defines them as separate decisions: step 3 (HOLD-6 actor-provenance disposition) is `INDEPENDENT_PARALLEL` relative to step 2 (§L-4 authority resolution); step 4 (process-evidence verification or explicit limitation) is likewise `INDEPENDENT_PARALLEL`. The parent's `MANDATORY_BEFORE_B5_8 … Parent of S2` edge and its "every later step depends on HOLD-6" narrative are **retracted**. No Control Tree edge is inserted. The historical ledger can be classified **as that historical ledger** without first ratifying its future accepted use; if a later B-only execution changes the effective disagreement set, only the affected classification and dependent calculations require reassessment. A preference to resolve HOLD-6 first is a **scheduling recommendation**, not a methodological dependency.
3. **Do the stratifier disagreements affect admission? → YES, through §M.** All effective stratifier disagreements require §L-4 four-way disposition (`CODER_ERROR / DEFINITION_AMBIGUITY / MISSING_M / GRAMMAR_GAP`) before post-pilot acceptance; `MISSING_M` and `GRAMMAR_GAP` route to schema review and can change the very contract B5.8 executes. Accepted B17 CORR1 records `L4_STRATIFIER_DISAGREEMENT_DISPOSITION = OPEN`, `MANDATORY_PREDECESSOR`.
4. **Are post-pilot acceptance and FINAL CONTRACT FREEZE mandatory before B5.8? → YES.** CORR4 §M: "905-fact semantic binding before the final freeze is forbidden." B17 CORR1 steps 7–8: `POST_PILOT_CONTRACT_OWNER_ACCEPTANCE = OPEN`; `STAGE2_FINAL_SEMANTIC_CONTRACT_FREEZE = OPEN`. **CORR2 boundary (per IV1-CORR1-F01):** acceptance/freeze recorded while the §L-2 science-eligibility gate is closed are documentary preparation or explicitly scoped conditional document acceptance — they are not the eligibility-producing §M post-pilot acceptance and FINAL CONTRACT FREEZE, and they do not make B5.8 lawful to begin.
5. **Where do the 905/905 binding and dual coding sit?** The 905/905 binding is B5.8's own content, performed within it, never before it. Independent dual coding is B5.9, after B5.8, and cannot retroactively prove pilot independence. Whether a B5.8 execution may run as two concurrent independent passes remains NOT_DETERMINED (decide in the S8 act if material).

### E. Input firewall → identities satisfied; view design not yet established (retained; artifact carried byte-identically)

Unchanged: all nine successor package identities recomputed 9/9 by the parent author and independently reproduced by Codex IV1 (G3 `PASS`); record files equal the pilot source map (`665aac81…f7f`); per-case fact counts 43/35/38/50/86/428/61/51/113 = 905; corrected generations for Cases 1, 3, 5, 6 (v1.0.7, CORR2, candidate_corr2, CORR8) are used; **Disney–Pixar is not substituted into the nine-case population**; no outcome-like record keys or package paths. The full-corpus coder view and its permitted-input allow-list remain NOT_ESTABLISHED and belong inside the future B5.8 act packet (S7). The advisory disclosure stands: case identities and company names are visible in fact text; no accepted rule requires masking; model prior knowledge of famous outcomes is an unmitigated, disclosed limitation.

`B5_8_INPUT_AUTHORITY_AND_FIREWALL.json` is **carried byte-identically from CORR1** (SHA-256 `b1694e0aafd64efb673d2833d9a8f544300b549c0c2dcaa1261a7363dbab44fd`) under the Owner's express authorization in the CORR2 act text: no change was necessary, because that artifact contains no Route A→S8 path claim and already records (in its `historicalStatusCorrection_IV1_F01` note) that retention of the historical bytes is not accepted §L-2 compliance and does not clear the §M lawful-pilot predecessor. Provenance is disclosed in the CORR2 manifest. Z.ai did not re-parse the nine record files in this CORR2; the nine-case identities and counts are carried from the parent author's recomputation and Codex IV1's independent reproduction.

### F. Historical stratifier B: retained as history, compliance NOT_ESTABLISHED (corrects parent IV1-F01; operational path corrected per IV1-CORR1-F01)

The parent represented Route A (bounded historical acceptance) as clearing CORR4 §L-2's "TWO independent stratification coders" requirement, arguing from distinct outputs and future B5.9 re-testing. **That inference was retracted by CORR1** (independently confirmed by both IV1 audits). The corrected determination:

**Established facts (evidence, not process proof):**

- Two distinct, complete mark sets exist: A (`5d4c0a68…c27d`, 11,765 unique tuples, 1,598 YES) and B (`7b91967b…2603`, 11,765 unique tuples, 956 YES). Pair counts: NO/NO 9,941; YES/YES 730; YES/NO 868; NO/YES 226. Agreements 10,671; disagreements **1,094**, exactly equal to the frozen ledger (`990950c5…e0b`); zero §L-4 classifications assigned (`classificationAssigned: false`, re-verified mechanically by Z.ai again in this CORR2). Row counts 11,765 / 11,765 / 1,094 were re-verified mechanically by Z.ai again in this CORR2; the agreement arithmetic and selection reproduction are carried from the parent author's and Codex IV1's prior computations.
- **The original B appointment named Kimi K3 Extra** (fresh isolated session; prompt `50f6653d…d211`). **The reported B executor is Claude/Cline** (B report `7572c68f…65c3` :5). This appointment/executor mismatch is a primary documentary fact.
- The B report's isolation, forbidden-input abstinence and outcome-firewall attestations are **author-reported only**. The B scratch directory is absent; no independent contemporaneous execution trace was recovered in examined Cline/Claude locators.

**Corrected determinations (CORR1 state preserved; determination 7 is made operationally enforceable by CORR2):**

1. **Historical B marks may be retained as immutable historical evidence with disclosed limitations.** Retention is documentary, not scientific ratification.
2. **Historical B process compliance remains `NOT_ESTABLISHED`.** Actual model identity, fresh execution isolation, outcome blindness and forbidden-input abstinence are **not independently proven**.
3. **No affirmative contamination breach is established by the available audit.** The limitation is evidentiary absence, not a finding of breach.
4. **Differences between A and B marks do not prove independent execution.** Distinct outputs are equally compatible with independent or non-independent processes; they prove only that the files are not copies.
5. **Future B5.9 full-scale dual coding cannot retroactively prove B17 pilot independence.** A later re-test measures the future process; it cannot reconstruct the historical pilot selection process.
6. **Ordinary Owner acceptance of uncertainty is not a methodological waiver.** Recording a limitation disposition preserves history; it does not convert unknown process facts into verified compliance, and no accepted methodological exception for §L-2 was recovered.
7. **Route A must not be represented as clearing the mandatory CORR4 §L-2 second-independent-stratifier requirement** — and, per IV1-CORR1-F01, this is now **operationally enforced**: the corrected sequence terminates at the fail-closed G-L2-ELIG gate rather than offering any Route A continuation to S8. CORR1's "shortest path … → S5 → S6 → S8" sentence and every equivalent inference are **removed**.
8. **Route A activity boundary while §L-2 remains NOT_ESTABLISHED (CORR2, per IV1-CORR1-F01):** Route A supports only appropriately bounded documentary activity — separately authorized historical-ledger analysis (including T2 classification of the frozen ledger as historical evidence), documentary preparation and review of future act materials, and explicitly scoped conditional document acceptance. Documentary preparation and conditional document acceptance are **distinct from** the eligibility-producing §M post-pilot acceptance (S5) and FINAL CONTRACT FREEZE (S6): they do not establish scientific entry and cannot yield the freeze that §M requires as the full-binding predecessor.
9. **Before S8, the path requires** admissible historical §L-2 process proof (independently verified), **or** a separately authorized, independently verified replacement (B-only rerun) plus affected-only recomputation/repair. Any explicit methodological exception is a different Owner-authorized methodology act; none is supplied, granted or requested by this package.

**Recommended corrective route (carried with attribution):** the independent Codex IV1 recommends that, under the unchanged methodology, **a separately authorized, verifiably independent B-only rerun** — frozen permitted inputs, Owner-designated eligible executor, fresh isolation, attributable execution record, independent process/output verification — is the corrective route **if admissible historical compliance evidence remains unavailable**. This recommendation was adopted by CORR1 with explicit attribution and supporting reasoning, and is carried unchanged by CORR2. **This is a recommendation, not a new accepted Owner decision.**

**Distinctions preserved (no exception granted or implied):** historical retention ≠ verified process compliance ≠ explicit methodology exception ≠ new independently verified execution. HOLD-6 (whether to accept the historical appointment deviation and the process-evidence limitation, and whether to authorize a replacement execution) **remains the Owner's normative decision and is not decided here.**

### G. CORR2 operational correction: the fail-closed §L-2 science-eligibility gate (resolves IV1-CORR1-F01)

Codex `CORR1.IV1` found exactly one BLOCKING defect: CORR1's sequence line 68 still offered a Route A shortest path `T1 ∥ T2 → C1 → S4 (identity selection only) → S5 → S6 → S8` while other passages (lines 183/190) denied that Route A clears §L-2 — a methodological contradiction in which a false eligibility inference survived operationally despite correct warnings elsewhere. CORR2 resolves it as follows:

1. **Removed:** the Route A → S8 shortcut sentence and every equivalent inference. No surface of this package now offers any path from bounded historical retention to S8 while §L-2 is NOT_ESTABLISHED.
2. **Added — the gate:** at convergence (C1), CORR4 §L-2 measured-pilot process compliance is an explicit mandatory condition of scientific convergence and lawful progression toward B5.8 (`G-L2-ELIG`, fail-closed). Convergence without established §L-2 is documentary-only.
3. **Credited correctly or not at all:** S5/S6 are credited as the lawful §M-chain predecessor of full binding **only after** the gate passes; acceptance/freeze labels recorded while the gate is closed are documentary or explicitly conditional dispositions, not the eligibility-producing §M acceptance/freeze.
4. **Negative control:** a static logical test (`NT-1`, in `B5_8_GATE_MATRIX.json`; mirrored in sequence §2A) demonstrates that Route A with §L-2 NOT_ESTABLISHED cannot reach S8 even when every documentary label is present.
5. **Synchronized:** sequence §1/§2/§2A/§3, this report §4 (diagram), the gate matrix (`G-L2-ELIG`, `G-F1-HISTB`, `terminalBasis`, `eligibilityPredicate`, `NT-1`) and the manifest's strengthened VCH-05/VCH-06 assertions.
6. **Preserved:** CORR1's F02–F04 corrections (`VERIFIED_ADDRESSED` per `CORR1.IV1`), all accepted factual predecessors (re-hashed this act: 17/17 identities match), and the T1 ∥ T2 independent-parallel structure.

The gate is a necessary condition derived from existing accepted methodology (CORR4 §L-2/§M; accepted B17 CORR1 steps 3–4; pilot lock). It is **not** a new Control Tree edge, not a new prerequisite invented outside the method, and not a waiver of anything: if the Owner later grants an explicit methodological exception, that will be a different Owner-authorized methodology act with changed applicability.

## 4. Why the result is an Owner decision and not "ready"

The corrected critical path has this shape (full frame in `B5_8_SHORTEST_LAWFUL_SEQUENCE.md`):

```text
T1: HOLD-6 actor/process disposition (Owner, normative)   ─┐
T2: §L-4 classification of the frozen 1,094 tuples          ─┤ parallel
                                                              │
   convergence: effective disagreement set settled            │
   (conditional recompute/repair if a B rerun occurred)      ─┘
   ► G-L2-ELIG — fail-closed science-eligibility gate (§L-2):
     measured-pilot process compliance ESTABLISHED?
     NO  ⇒ science eligibility stays OPEN; bounded documentary
           activity only; S4–S6 get NO §M eligibility credit;
           S6 is not the eligibility-producing freeze; S8 UNREACHABLE.
     YES ⇒ continue.
   → S4 exact post-pilot contract identity (+ S4b if relied on)
   → S5 Owner acceptance → S6 FINAL CONTRACT FREEZE
   → S7+S8 B5.8 act packet + explicit Owner authorization
   → B5.8 execution; then B5.9 independent dual coding
```

The gate (►) is the CORR2 correction of the report diagram per `IV1-CORR1-F01` (the CORR1 diagram omitted a fail-closed scientific-process predicate between convergence and execution). It is derived from CORR4 §L-2/§M and the accepted B17 CORR1 preflight; it adds no Control Tree edge.

Two distinct normative choices now sit before the Owner — the HOLD-6 disposition (T1) and the authorization of §L-4 classification work (T2) — and neither is decided by the other. Epistemic questions (whether the historical B process actually complied; whether execution evidence exists) are evidence questions and are **not** put to the Owner as truth-choices. Downstream, S4–S6 remain mandatory before any B5.8 start, and S8 additionally requires the gate to have opened.

## 5. What was not done

None of the following was done by this CORR2 act:

- B5.8 execution or any normalization; any B-only rerun; any new stratifier mark generation;
- §L-4 classification of any tuple;
- a HOLD-6 Owner decision (the decision is framed, not made);
- any methodological exception or waiver; any post-pilot contract acceptance; any FINAL CONTRACT FREEZE (eligibility-producing or otherwise);
- any 905-fact binding; any independent dual coding; any regression execution;
- B5.9–B5.19 advancement; any Control Tree alteration; any product or production modification;
- any Git staging, commit, push, reset, clean or checkout; any repository write;
- modification of the CORR1 candidate, the CORR1 IV1 FAIL record, the parent candidate, the parent author directory, or any prior IV1 record;
- self-IV; any retroactive acceptance claim; any repeat of Codex's full census (it is cited, not re-performed);
- any execution of the negative control beyond static logic (it is a source-predicate counterexample; it runs nothing).

## 6. Independence and quality-gate disclosure

- **Authorship.** Z.ai authored the parent package's documentary completion manifest, the full CORR1 correction, and this CORR2 correction. Z.ai did not author the four Claude analytical files. Codex authored both IV1 audit records. No prior authorship is altered.
- **Attribution discipline.** Codex's census, recomputations and recommendations are cited as Codex evidence; the parent author's recomputations are carried with their provenance; Z.ai's own mechanical re-verifications (transport/eleven-member identities, row counts 11,765/11,765/1,094, `classificationAssigned = false`, 17/17 predecessor identity re-hash, live baseline) are labeled as such. No third party's work is claimed as Z.ai's own.
- **Independence boundary for the next IV.** Z.ai must not verify this CORR2. Per the routing policy's preferred pairings (Z-Ai factual/semantic author → Claude preferred, Codex alternate), Claude is the recommended IV actor, with Codex eligible as alternate; the Owner makes the final appointment. The IV must test CORR2's correction against `IV1-CORR1-F01`; the CORR1 package's other dispositions (`F02–F04 VERIFIED_ADDRESSED`) and both prior FAIL records are immutable inputs.
- The quality skill was applied in Mode A as a boundary check only (evidence classification; hard-fail scan). It produced no scoring and no new verification layer (§13 no-governance-recursion).

## 7. Recommended next action

1. Owner decides T1 (HOLD-6 disposition) and T2 (§L-4 classification authorization) — they are independent and may be taken in one Owner round as separate decisions (B17 CORR1 "What may share one Owner round"). A scheduling preference to resolve T1 first is permissible but is not a dependency. Under either answer, S8 remains unreachable until the G-L2-ELIG gate opens (admissible historical §L-2 proof, or a separately authorized independently verified replacement).
2. This CORR2 remains a candidate until a fresh non-author IV (Claude preferred, Codex alternate) verifies the `IV1-CORR1-F01` correction. This act does not authorize that IV.

**STOP.** No continuation into IV, Owner acceptance, HOLD-6 disposition, §L-4 execution or B5.8.
