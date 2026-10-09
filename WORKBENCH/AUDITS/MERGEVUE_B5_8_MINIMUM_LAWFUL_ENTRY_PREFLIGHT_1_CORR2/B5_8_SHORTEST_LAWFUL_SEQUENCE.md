# B5.8 shortest lawful sequence — CORR2 (corrected successor)

**Act:** `MERGEVUE_B5_8_MINIMUM_LAWFUL_ENTRY_PREFLIGHT_1.CORR2`. Z.ai, ANALYST / TARGETED CORRECTION AUTHOR.
**HEAD:** `3852ca460c44df7c36d4c159a37125c6048f8548`.
**Corrects:** the CORR1 sequence of `MERGEVUE_B5_8_MINIMUM_LAWFUL_ENTRY_PREFLIGHT_1.CORR1` (Z.ai) exactly per the single remaining BLOCKING finding `IV1-CORR1-F01` of the independent Codex audit `CORR1.IV1`. The exact CORR1 candidate and its IV1 FAIL record are immutable; this successor replaces the CORR1 sequence analytically.

**Scope discipline (CORR2):** this correction resolves only `IV1-CORR1-F01` and its synchronized dependents. CORR1's corrections of the parent findings IV1-F02, IV1-F03 and IV1-F04 — independently assessed `VERIFIED_ADDRESSED` by Codex `CORR1.IV1` — are preserved unchanged in substance, as are all accepted factual predecessors (B5.5, B5.7, B17.5, the accepted B17 CORR1 documentary preflight, CORR4 as pilot version) and the T1 ∥ T2 independent-parallel structure. Finding-ID namespaces: `IV1-F01…F04` are the parent-audit findings; `IV1-CORR1-F01` is the CORR1-audit finding resolved here.

This is a proposed route only. It authorizes nothing, adds no Control Tree edges, grants no methodological exception, and decides no HOLD-6 question. Every ordering comes from CORR4 §M (`2de49862…0bb0`, anchored to RT §7–§12) or the accepted B17 CORR1 preflight (`b28bc838…c82b1`, Git-bound `3852ca4`, Codex IV1 PASS). Every edge is cited.

## 1. Classified obligations

| # | Step | Class | Controlling source | Why load-bearing |
|---|---|---|---|---|
| S0 | B5.5 / B5.7 / B17.5 predecessors | `ALREADY_SATISFIED` | `9b1a501`; `92236dc`; `d52e7f4`; `2f7bcc5` | Tree edges `B5.5/B5.7/B17.5 → B5.8` are met in their accepted scopes. Not reopened |
| S0b | Successor input identities, 9 cases / 18 sides / 905 facts | `ALREADY_SATISFIED` | B5.7 §10/§16; recomputed by the parent author (Claude), independently reproduced by Codex IV1, 9/9 | The input exists in accepted and usable form |
| S0c | Prior B5.8 execution check | `ALREADY_SATISFIED` as a check: `NO_EXECUTION_ESTABLISHED, strictly within the examined scope` | Census: Codex IV1 (`IV1_EVIDENCE_RECOMPUTATION.json priorExecutionSearch`); entry report §3.A | Protects against silent re-execution or silent reliance (G-4). Corrected per F03: the parent's max-27 coverage measure is retracted; no blanket no-fencing conclusion is drawn; any future execution must validate exact source/output identities and run destination-collision checks before writing, and must preserve discovered results |
| **T1** | **HOLD-6 disposition: (a) actor provenance; (b) process-evidence limitation of stratifier B** | **`MANDATORY_BEFORE_B5_8` (as part of the pilot-lawfulness chain). Owner normative decision. `PARALLEL` with T2 — NOT a parent of it** | CORR4 §L-2 ("TWO independent stratification coders"); §M (pilot step); B17 CORR1 steps 3–4 (`INDEPENDENT_PARALLEL`) | Decides whether the pilot step of §M is lawfully established. Route A = bounded historical retention only; it does **not** clear §L-2 (corrected per parent F01) and it does not open the §L-2 science-eligibility gate (corrected per IV1-CORR1-F01) |
| T1b | B-only rerun on frozen permitted inputs, with recomputation of affected dependents | `CONDITIONAL_ON_PRIOR_RESULT` — only if T1 rejects historical B provenance, or admissible historical compliance evidence remains unavailable and the Owner authorizes replacement | B17 CORR1 step 4 Route B; CORR4 §L-2 unchanged methodology | Recommended corrective route under unchanged methodology when admissible evidence is unavailable (recommendation of Codex IV1, adopted with attribution — not an accepted Owner decision). Impact is conditional and exact-input dependent; it does not require wholesale recreation of the factual corpus or automatic invalidation of every downstream artifact. A verified replacement is one of the two ways the §L-2 science-eligibility gate can open |
| **T2** | **§L-4 disposition of the stratifier disagreements — the exact existing frozen 1,094 tuples** | **`MANDATORY_BEFORE_B5_8` for use of that ledger. `PARALLEL` with T1 — independently executable now** | CORR4 §L-2, §L-4, §M; B17 CORR1 step 2 (`OPEN`; exception searched, `NOT_RECOVERED`); steps 3–4 (`INDEPENDENT_PARALLEL` relative to step 2) | `MISSING_M` / `GRAMMAR_GAP` can change the contract B5.8 executes. Classifying the historical ledger does **not** ratify its future accepted use (corrected per parent F02) |
| C1 | **Convergence — the science-eligibility gate: effective disagreement set settled AND CORR4 §L-2 measured-pilot process compliance established** | `CONVERGENCE_POINT` and **fail-closed science-eligibility gate** before contract acceptance (corrected per IV1-CORR1-F01) | CORR4 §L-2/§L-4/§M; B17 CORR1 steps 2–4 | Convergence is **science-eligible** only when both elements are established: (i) the effective §L-4 disagreement disposition/repairs are settled, and (ii) §L-2 compliance is established — via admissible historical process proof, or via a separately authorized, independently verified replacement (T1b). If T1b ran: recompute affected A/B relationships and the effective disagreement ledger; revisit **only** affected classification and dependent calculations (conditional affected-cell correction, independent verification, targeted reruns where required). If no rerun: T2's output is the effective ledger — but the §L-2 element is still required. While (ii) is NOT_ESTABLISHED, convergence is **documentary-only** and cannot feed the eligibility-producing §M acceptance/freeze chain. See the gate in §2 and the negative control in §2A |
| S3 | Affected-cell correction / re-IV / rerun | `CONDITIONAL_ON_PRIOR_RESULT` (only for cells classified as requiring change) | CORR4 §L-4, §M; B17 CORR1 step 6 | If nothing requires change, it is skipped |
| **S4** | **One exact post-pilot contract identity presented for acceptance** | **`MANDATORY_BEFORE_B5_8`** (the object of §M's acceptance step, not a new edge). Whether new authoring is needed is `CONDITIONAL_ON_PRIOR_RESULT` (T2/S3) | CORR4 §M; worktree governance §20 | No single consolidated text is established today. The Owner cannot accept "the post-pilot contract" without one byte identity |
| S4b | B17.4 acceptance provenance (CORR10, A-E001, F0024) | `CONDITIONAL_ON_PRIOR_RESULT`: mandatory only if the S4 contract relies on those components | B17 CORR1 step 5 | Owner acceptance of a contract that embeds unaccepted components would be inconsistent |
| **S5** | **Owner acceptance of the S4 post-pilot contract** (after a non-author IV if S4 has new bytes) | **`MANDATORY_BEFORE_B5_8`** | CORR4 §M; B17 CORR1 step 7 | Class A order. Acceptance recorded while the C1 §L-2 element is NOT_ESTABLISHED is **documentary preparation or an explicitly scoped conditional document acceptance only** — it is not the eligibility-producing §M post-pilot acceptance (corrected per IV1-CORR1-F01) |
| **S6** | **FINAL CONTRACT FREEZE** | **`MANDATORY_BEFORE_B5_8`** | CORR4 §M ("905-fact semantic binding before the final freeze is forbidden"); B17 CORR1 step 8 | Class A prohibition. A freeze recorded while the C1 §L-2 element is NOT_ESTABLISHED is a documentary disposition and is **not** the eligibility-producing §M FINAL CONTRACT FREEZE; a downstream label does not supply the missing upstream §L-2 condition (corrected per IV1-CORR1-F01) |
| S7 | B5.8 act packet: full-corpus coder view, permitted-input allow-list, exact source/output identity validation, destination-collision checks, actor routing, outcome firewall, B5.8/B5.9 boundary | Part of the B5.8 authorization itself. **Not a separate predecessor act.** Contents are `NOT_ESTABLISHED` today | CORR4 §H, §I, §L-2 blindness; B5.7 §16/§17; F03 fencing requirements | The pilot view `0cb5a6b5…` is bound to the pilot. A full-corpus view and the fencing checks must be fixed before coding. S7 is **retained inside the eventual S8 execution packet** (per IV1-CORR1-F01 required correction) |
| S8 | Bounded Owner authorization of B5.8 (905/905 binding under the frozen contract) | `MANDATORY_BEFORE_B5_8` (G-2). **Unreachable while the C1 §L-2 element is NOT_ESTABLISHED: there is no Route A path to S8** (corrected per IV1-CORR1-F01) | §14A.5; CORR4 §L-2/§M | Eligibility is not authorization; and documentary labels do not substitute for the unestablished upstream §L-2 condition |
| P1 | Full FEVA `regress(path)` | **`DEFERRED / NO_MANDATORY_EDGE_RECOVERED / G3_NOT_DETERMINED`** (corrected per F04 — replaces the parent's categorical `PARALLEL_NOT_BLOCKING`) | Adapter closure `7f1cd15b…e968` §§36–41 (new authorization required); B17 CORR1 steps 11 and 16 | Not named in §M; deferral is lawful under §14A gate 6 (NOW). No prerequisite is invented; no categorical nonblocking settlement is made in every future context; G-3 is not silently resolved — the residual stays on the entry-packet checklist |
| P2 | Preservation of the live-only pilot objects (incl. marks, ledger, prompts) | `OPTIONAL_DURABILITY`, advisable before T1b or T2 | B17 CORR1 step 10 | Inputs for T2 are untracked. An SHA without a file is not preservation |
| P3 | Independent IV of this CORR2 | Required before this package is cited as authority | `AGENTS.md` §10, §14; routing policy preferred pairings | Z.ai-authored; Claude preferred, Codex alternate (non-author); Owner appoints. Until that IV, this package is an author-declared candidate only |
| O1 | Independent dual coding; mechanism-layer stabilization; HEDC | `OUTSIDE_B5_8_ENTRY` (B5.9, after B5.8) | CORR4 §M; RT §8–§9; Tree B5.9 | Must not be omitted — and must not be presented as retroactive proof of historical pilot independence (corrected per parent F01) |
| O2 | Whether B5.8 may itself run as two concurrent passes | `NOT_ESTABLISHED`. Decide in the S8 act if material | — | No source settles it |

Steps eliminated as already satisfied by accepted evidence: S0, S0b, S0c, and the re-proof of B5.5, B5.7 and FEVA. A fresh B17 documentary preflight is not proposed.

## 2. Minimal ordered path (corrected dependency shape, fail-closed at §L-2)

```text
accepted exact corpus and bounded predecessors (S0, S0b, S0c)
                |
   +------------+------------------------------+
   |                                           |
T1 HOLD-6 actor/process                  T2 §L-4 classification of the
disposition (Owner, normative);          exact frozen 1,094 tuples
conditional T1b B-only rerun             (independently executable;
   |                                      no dependency on T1)
   |                                           |
   +--> if T1b ran: recompute affected A/B relationships and
        the effective disagreement ledger; revisit only affected
        classification and dependent calculations ------------+
   |                                                           |
   +---------------------------> C1 convergence: effective disagreement set
                                              settled
                                                 |
   =====================================================================
   G-L2-ELIG (fail-closed science-eligibility gate, CORR4 §L-2/§M;
   corrected per IV1-CORR1-F01):
   is CORR4 §L-2 measured-pilot process compliance ESTABLISHED —
   by admissible historical process proof, or by a separately
   authorized, independently verified B-only replacement?
        NO  -> science eligibility stays OPEN. Only bounded documentary
               activity is available under Route A (separately authorized
               historical-ledger analysis, documentary preparation/review,
               explicitly scoped conditional document acceptance). S4–S6
               receive NO eligibility-producing §M credit; S6 is not the
               eligibility-producing FINAL CONTRACT FREEZE; S8 is
               UNREACHABLE. The path terminates here for lawful-entry
               purposes. Documentary continuation never cures the gate.
        YES -> continue to the serial §M eligibility chain below.
   =====================================================================
                                                 |
                        [S3 if required: affected-cell correction / re-IV / rerun]
                                                 |
                        S4 exact post-pilot contract identity (+ S4b if relied on)
                                                 |
                        S5 Owner acceptance -> S6 FINAL CONTRACT FREEZE
                                                 |
                        S7 + S8 B5.8 act packet + explicit Owner authorization
                                                 |
                        B5.8: outcome-hidden full-population normalization
                        under the frozen contract
                                                 |
                        B5.9 independent dual coding -> stabilization -> HEDC
```

There are the two parallel mandatory tracks (T1, T2), then the fail-closed §L-2 science-eligibility gate, and only after that gate the serial contractual chain S4 → S5 → S6, plus the act authorization (S8). Remedial steps T1b, S3 and S4b are conditional.

**Corrected per IV1-CORR1-F01 — there is no Route A path to S8.** The CORR1 sentence proposing that, under historical bounded retention with no rerun, a shortest path `T1 ∥ T2 → C1 → S4 (identity selection only) → S5 → S6 → S8` exists, is **withdrawn in full**; no equivalent inference survives anywhere in this package. Under unchanged methodology, S8 requires the C1 §L-2 element to be ESTABLISHED — via admissible historical §L-2 process proof, or via a separately authorized, independently verified replacement (T1b) plus affected-only recomputation/repair. While §L-2 compliance remains NOT_ESTABLISHED, Route A (bounded historical retention) supports **only** appropriately bounded documentary activity: separately authorized historical-ledger analysis (including T2 classification of the frozen ledger as historical evidence), documentary preparation and review of future act materials, and explicitly scoped conditional document acceptance. None of that activity establishes scientific entry, produces the eligibility-producing §M post-pilot acceptance or FINAL CONTRACT FREEZE, or reaches S8. Any explicit methodological exception would be a different, separately Owner-authorized methodology act; none is supplied, granted or requested by this package.

**Scheduling note (corrected per F02, preserved):** preferring to resolve T1 before starting extensive T2 work, to avoid classifying a ledger a rerun might supersede, is a legitimate **scheduling recommendation**. It is not a methodological dependency: T2 on the historical ledger is lawful work whose output survives unchanged when no rerun occurs, and only affected classification needs revisiting when a rerun changes the effective set. The two tracks converge before final post-pilot contract acceptance and freeze. **No Control Tree edge is created by this diagram.**

## 2A. Fail-closed eligibility test (negative control; required by the CORR2 act)

Static logical counterexample over the controlling source predicates. It executes nothing, authorizes nothing, and classifies nothing.

**Scenario inputs:**

| Input | Value in the test scenario |
|---|---|
| T1 outcome | Option A — bounded historical retention; actor/limitation disposition recorded |
| CORR4 §L-2 measured-pilot process compliance | **NOT_ESTABLISHED** (no admissible historical proof; no separately authorized independently verified replacement) |
| T2 outcome | historical 1,094-tuple ledger classified; no `MISSING_M` / `GRAMMAR_GAP` finding |
| S4 | exact post-pilot contract identity selected |
| Documentary labels | Owner-acceptance label (S5) and freeze label (S6) supplied |
| `documentaryLabelsAllPresent` | `true` |

**Expected result under this corrected sequence:**

1. `S8_reachable = false`. The path terminates at the G-L2-ELIG gate in §2, before any eligibility-producing §M credit.
2. The S5/S6 labels are documentary or explicitly conditional dispositions only. They are **not** the eligibility-producing §M post-pilot acceptance and **not** the eligibility-producing FINAL CONTRACT FREEZE: a downstream label does not supply evidence of the missing upstream §L-2 condition.
3. Lawful-entry state: `UNQUALIFIED_SCIENTIFIC_ENTRY_NOT_ESTABLISHED`. The gate opens only via (a) established admissible historical §L-2 process proof, independently verified, or (b) a separately authorized, independently verified B-only replacement plus affected-only recomputation/repair.
4. Any explicit methodological exception would be a different Owner-authorized methodology act with changed applicability; none is supplied, granted or requested by this package.

The same scenario in machine-readable form, with the governing eligibility predicate, is `routeAReachabilityNegativeTest` (test `NT-1`) in `B5_8_GATE_MATRIX.json`. Manifest checks VCH-05/VCH-06 verify the gate's presence and consistency and that no Route A→S8 promotion survives.

## 3. Owner Decision Frame — historical stratifier B and the two parallel decisions (corrected per parent F01; operational path corrected per IV1-CORR1-F01)

### Distinction the frame must preserve

Normative choices (the Owner's to make):

- N1 — whether historical B is retained **only as bounded history** with disclosed limitations;
- N2 — whether historical B provenance is **excluded from accepted scientific compliance** pending replacement;
- N3 — whether to **authorize a specific replacement execution** (a B-only rerun) in a later act.

Epistemic questions (evidence questions — **not** Owner truth-choices; never to be settled by preference or vote):

- whether the historical B process actually complied;
- whether historical execution evidence exists in unexamined locations;
- whether independence, blindness and isolation can be independently demonstrated.

Ordinary Owner acceptance of uncertainty is **not** a methodological waiver: no accepted §L-2 exception was recovered, and none is invented here.

### Evidence ledger

```text
ACT: decide the accepted-use boundary of historical stratifier B provenance
     (N1/N2) and whether to authorize a B-only replacement execution (N3);
     separately, whether to authorize §L-4 classification of the frozen 1,094
     tuples as an independent parallel act (T2). Under CORR2: no Owner answer
     reaches S8 while §L-2 compliance is NOT_ESTABLISHED.
ROLE: Z.ai, ANALYST / TARGETED CORRECTION AUTHOR (Owner-assigned for CORR2).

READ:
- STAGE2_SEMANTIC_SUCCESSOR_CANDIDATE_CORR4.md 2de49862…0bb0 §§L-2/§L-4/§M →
  stratification is measured process by TWO independent coders; four-way
  disagreement taxonomy; §M order to freeze and binding.
- B17_MINIMUM_CLOSURE_SEQUENCE.md b28bc838…c82b1 (Git-bound 3852ca4; Codex IV1
  PASS) steps 2–4 → step 2 (L-4) INDEPENDENT_PARALLEL relative to steps 3–4;
  Route A is not a compliant-process finding; limitation acceptance is allowed
  but proves nothing about the historical process.
- MERGEVUE_CORR4_PILOT_STRATIFIER_B_PROMPT.md 50f6653d…d211 → appoints
  Kimi K3 Extra, fresh isolated session.
- STAGE2_CORR4_PILOT_STRATIFIER_B_REPORT.md 7572c68f…65c3 :5 → reported
  executor Claude/Cline; isolation/abstinence/blindness attestations are
  author-reported.
- IV1_REPORT.md / IV1_FINDINGS.json / IV1_EVIDENCE_RECOMPUTATION.json (Codex,
  FAIL) → four parent findings; census; mark arithmetic; Route B recommendation.
- CORR1_IV1_FAIL/IV1_FINDINGS.json + IV1_REPORT.md (Codex, CORR1.IV1 FAIL,
  1 BLOCKING: IV1-CORR1-F01) → the operational Route A→S8 defect and its
  required correction, resolved by this CORR2.
- Pilot lock 0f9daef2…897a §4/§15 → pilot-only authorization; 905 binding and
  freeze not authorized; 905_FACT_BINDING_EXECUTED = NO.
- B5.7 successor binding be9593a7…0237 §§10/15/16/17 → authoritative
  generations and excluded lineages (independent of B provenance).

DERIVED:
- B provenance does not touch the 905-fact B5.8 factual input ← B5.7 §10/§16.
- It does affect the §L-2 two-independent-stratifier condition and the
  post-pilot contract's evidence base ← §L-2 + §M.
- Different outputs (1,094 disagreements; A YES 1,598 vs B YES 956) do not
  prove independent execution ← distinct outputs are compatible with either
  process; no contemporaneous trace recovered.
- Classification of the existing immutable ledger can proceed without actor
  ratification ← B17 CORR1 steps 2–4; no contrary §L-2/§L-4/§M edge.
- Final freeze precedes full binding; B5.9 cannot retroactively validate the
  pilot ← §M.
- No Route A path to S8 exists while §L-2 compliance is NOT_ESTABLISHED;
  acceptance/freeze labels recorded under Route A are documentary or
  explicitly conditional only ← CORR4 §L-2/§M; B17 CORR1 steps 3–4;
  IV1-CORR1-F01 required correction.

INSPECTED:
- HEAD 3852ca460c44df7c36d4c159a37125c6048f8548 = candidate-time HEAD, same
  baseline as CORR1 and CORR1.IV1; 0 tracked dirty, 431 untracked, 0 staged
  (read-only git status/rev-parse; no fetch). CORR2 author input transport
  MERGEVUE_B5_8_CORR2_AUTHOR_INPUT_2026-10-09.zip ae8917f3…c7ec (245,103 B):
  11 members = CORR1_CANDIDATE/ five files + CORR1_IV1_FAIL/ five files +
  LINEAGE/ one zip; all ten file members rehashed and equal to their
  IV1-recorded identities; the lineage zip equals the IV1 frozen transport
  47bd9688…5430 (158,113 B). CORR1 candidate and CORR1 IV1 FAIL records
  unmutated (read-only).

ELIMINATED:
- "Who was appointed B?" — GATE 1 SOURCE: Kimi K3 Extra in the original prompt.
- "Do the mark files differ?" — GATE 2/3: exact-set comparison (parent author;
  Codex IV1) proves 1,094 differences.
- "Does that difference prove a real second independent coder?" — GATE 2
  DERIVATION: no; compatible with independent or non-independent processes.
- "Can B5.9 dual coding retroactively prove pilot independence?" — GATE 2
  DERIVATION: no; a later re-test cannot reconstruct the historical process.
- "Does ordinary limitation acceptance waive §L-2?" — GATE 1/5: no accepted
  exception recovered; a waiver cannot be inferred.
- "Can Route A with documentary labels reach S8 while §L-2 is
  NOT_ESTABLISHED?" — GATE 2 DERIVATION: no; resolved by the fail-closed gate
  (§2) and negative control NT-1 (§2A) per IV1-CORR1-F01.
- "Must §L-4 wait for HOLD-6?" — GATE 1/2: no; B17 CORR1 steps 2–4 make them
  independent parallel decisions.
- "Is regress(path) needed first?" — GATE 1/6: no mandatory edge recovered;
  G-3 stays NOT DETERMINED; deferral lawful for the next act.
- "Was B5.8 already run?" — GATE 3: bounded negative search: no reusable
  accepted result recovered in examined locations (not proof of global absence).

UNRESOLVED AFTER SEARCH:
- N1/N2 (normative): retain historical B as bounded history only, or exclude
  it from accepted compliance pending replacement — no accepted authority
  decides acceptance of an appointment deviation.
- N3 (normative): whether/when to authorize a replacement execution.
- T2 (normative): authorization of classification work — required, not yet
  authorized; scheduling is flexible.
- Epistemic (NOT an Owner truth-choice): actual B model/session/reads/
  blindness remain unknown; no independent process trace recovered in
  inspected locators.
```

### Frame

**DECISION:** two independent decisions, may share one Owner round as separate questions (B17 CORR1 "What may share one Owner round"):

1. **T1 / HOLD-6** — record up to three clauses: (a) accept or reject the reported Claude/Cline execution as the historical B actor for marks `7b91967b…2603`; (b) expressly accept the process-evidence limitation **as a limitation** (this does not convert it into verified compliance and does not open the §L-2 science-eligibility gate); (c) if compliance evidence is unavailable and N2 exclusion is chosen, whether to authorize a separately verified B-only rerun (N3) in a bounded later act.
2. **T2** — whether to authorize §L-4 classification of the exact frozen 1,094 tuples as an independent parallel act (executor, blindness controls, and §L-4 four-way output contract to be fixed in its own act packet).

**WHY THIS REQUIRES THE OWNER:**

- CORR4, the pilot lock, B17 CORR1, the parent IV1 audit and the CORR1 IV1 audit fix the facts, the two tracks, the fail-closed gate and the routes; none of them decides whether a historical appointment deviation may stand as accepted pilot compliance, and none authorizes classification or a rerun by itself.
- N1–N3 are normative risk-posture choices (§14A gate 5). The epistemic questions are excluded from the frame: they are evidence questions this package answers only as NOT_ESTABLISHED, and no Owner answer can make an unknowable past process fact true.

**OPTIONS (T1/N1–N3):**

- **A — Bounded historical retention.** Preserve the exact B marks, report and prompt as history, with the actor recorded as reported Claude/Cline against the Kimi K3 Extra appointment, and process conditions recorded NOT_ESTABLISHED. Under this option the §L-2 second-independent-stratifier condition remains **unestablished**: Route A does not clear the mandatory requirement, does not open the G-L2-ELIG science-eligibility gate, and does not by itself make the §M pilot step lawfully complete for unqualified B5.8 entry. While Option A stands alone, the lawful path to S8 stays blocked: S4–S6 can proceed only as documentary preparation or explicitly scoped conditional document acceptance and cannot be credited as the eligibility-producing §M post-pilot acceptance and FINAL CONTRACT FREEZE. Agreement figures are reportable only as "differences between these exact historical mark files", never as "verified independent-coder agreement".
- **B — Exclude historical B from accepted compliance and authorize a separately verified B-only rerun.** Preserve history and A; run B fresh on the frozen permitted inputs under an attributable execution record with independent process/output verification; recompute affected A/B relationships, the effective disagreement ledger and the deterministic selection; revisit only affected classification and dependent calculations. This is the route that can establish the missing evidence under the **unchanged** methodology and — after independent verification of the replacement — is the route that can open the G-L2-ELIG gate. It does **not** require wholesale recreation of the factual corpus and does not automatically invalidate every downstream artifact: A marks and the 905 factual identities are unchanged unless separate established cause requires correction, and impact is conditional and exact-input dependent.

**RECOMMENDATION: B** — if admissible historical independent-process evidence remains unavailable after the bounded search. **Attribution:** this is the independent Codex IV1 recommendation (parent IV1_REPORT §9; IV1-F01 requiredCorrection), carried through CORR1 and re-affirmed by this CORR2 with the following supporting reasoning: stratification is explicitly part of the measured method (§L-2); the pilot sample construction feeds the entire post-pilot evidence base; a later full-scale dual-coding stage cannot reconstruct the pilot's selection process; and B preserves the factual substrate and A evidence while creating an evidentiary route under the unchanged contract. This adoption is a corrected analytical recommendation, **not a new accepted Owner decision**.

**CONSEQUENCE:**

- If A → the next acts stay bounded to T2 (if authorized) and to bounded documentary activity. Because Option A leaves §L-2 NOT_ESTABLISHED, the G-L2-ELIG gate stays closed: convergence is documentary-only, S4–S6 cannot be credited as the eligibility-producing §M post-pilot acceptance and FINAL CONTRACT FREEZE, and S8 is unreachable **until** admissible historical §L-2 process proof is established and independently verified, or a separately authorized independently verified B-only replacement (N3/T1b) is executed with affected-only recomputation/repair. Any explicit methodological exception would be a separate Owner-authorized methodology act — none is supplied, granted or requested by this package. No waiver, final acceptance or freeze is implied.
- If B → a bounded later act covers B-only execution and verification under the frozen permitted-input contract; affected intersections/ledger/sample are recalculated and only changed dependent coding/corrections/views require reassessment; unchanged tuples may retain applicable classification evidence. A methodological change is not authorized by this choice. No new Tree edge is required. Independent verification of the replacement is what opens the G-L2-ELIG gate; it does not by itself authorize S4–S8 (§14A.5).

**REVERSIBILITY:**

- A is reversible: a later rerun remains available while the frozen B prompt and permitted inputs are preserved (P2), but the cost of reversing grows with each step taken on A and is largest after S6.
- B consumes a bounded rerun and conditional dependent review; unchanged values may be retained with updated provenance; it cannot casually overwrite accepted outputs, and superseding an accepted effective identity requires its normal verification and Owner disposition.

**Disclosure:** this correction is authored by Z.ai, which also authored the parent package's documentary completion manifest and the full CORR1 correction. Z.ai did not author the four parent analytical files (Claude) and did not author the CORR1 or CORR2 audit records (Codex). Z.ai reports no stake in either route beyond methodological consistency. The recommended IV actor for this CORR2 is Claude (preferred) or Codex (alternate), per the routing policy's preferred pairings for a Z-Ai-authored analytical artifact; neither may be excluded from scrutiny of this recommendation.

## 4. Not bundled

The following are **not** asked now, because they are children of the above decisions or not needed now (§14A.4, gate 6):

- post-pilot contract identity;
- B17.4 reaffirmation;
- freeze;
- `regress(path)` authorization (G-3 residual preserved for the entry packet);
- B5.8 authorization.

An answer to T1 or T2 settles a choice. It does not authorize T1b, S3, S4 or any downstream work (§14A.5). No surface of this package proposes a Route A path to S8 while §L-2 compliance is NOT_ESTABLISHED.
