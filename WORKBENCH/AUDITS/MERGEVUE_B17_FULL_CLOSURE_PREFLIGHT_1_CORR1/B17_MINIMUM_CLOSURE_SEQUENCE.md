# B17 minimum closure sequence — CORR1

**Act:** `MERGEVUE_B17_FULL_CLOSURE_PREFLIGHT_1.CORR1`  
**Role:** ANALYST. Bounded documentary correction.  
**Predecessor:** `MERGEVUE_B17_FULL_CLOSURE_PREFLIGHT_1` and its IV1 `FAIL — BLOCKING 2 / MAJOR 2 / MINOR 2`  
**This sequence is a proposed route.** It does not authorize any step, does not execute any step, and is not an independent IV.

A documentary IV PASS of this CORR1 is not Owner acceptance of Stage-2 science.

## How to read a step

Each step has one primary class:

- `MANDATORY_PREDECESSOR` — later unqualified closure depends on it.
- `INDEPENDENT_PARALLEL` — required, and not settled by a neighboring decision.
- `CONDITIONAL_REMEDIAL` — executed only when an earlier independent result requires it.
- `OPTIONAL_DURABILITY` — storage only. Not scientific completion and not a closure blocker.
- `DIAGNOSTIC_SCOPE` — a possible bounded measurement. Not final B17 closure.
- `FINAL_CLOSURE_CONDITION` — required before an unqualified B17/Stage-2 closure claim.
- `SEPARATE_DOWNSTREAM` — outside this correction. Not a new prerequisite of CORR1 or of a diagnostic run.

## 1. Documentary correction and independent IV of CORR1

**Class:** `MANDATORY_PREDECESSOR` for any later use of this candidate as the preflight.  
**State:** this directory is the correction. Independent Codex IV is not authorized by this file.  
**Does not authorize:** classification, rerun, measurement, acceptance, or Git.

## 2. Stratifier §L-4 authority resolution

**Class:** `MANDATORY_PREDECESSOR` of unqualified semantic closure.  
**State:** `L4_STRATIFIER_DISAGREEMENT_DISPOSITION = OPEN`.  
**Content:** either produce a recovered accepted exception that actually narrows CORR4 §L-2/§L-4 for these stratifier disagreements, with path, SHA-256, stable identity, decision authority, and a showing that it applies to stratifier tuples rather than analytical-coder tuples, or authorize classification of the exact frozen 1,094 tuples into `CODER_ERROR`, `DEFINITION_AMBIGUITY`, `MISSING_M`, and `GRAMMAR_GAP`.  
**Classification itself** is not performed in CORR1. It is a later act, and only if the exception is not recovered.  
**Does not authorize:** amending marks, reselecting facts, expanding the pilot, or rerunning the corpus.

## 3. HOLD-6 actor-provenance disposition

**Class:** `MANDATORY_PREDECESSOR` of treating the current B marks as an accepted appointment. `INDEPENDENT_PARALLEL` relative to step 2.  
**State:** open. The B prompt appoints Kimi K3 Extra. The B report states Claude/Cline.  
**Route A:** the Owner accepts the historically reported Claude/Cline execution for marks SHA-256 `7b91967b69bf5f95e831bac14e32bc1246836e2e9c2bcb3ef965874ba7dc2603`.  
**Route B:** the Owner rejects that provenance. A later B-only rerun is then a separate act.  
**Does not settle:** process proof. Route A is not a compliant-process finding.

## 4. Process-evidence verification or explicit limitation disposition

**Class:** `INDEPENDENT_PARALLEL` relative to step 3. `MANDATORY_PREDECESSOR` of any claim that the B execution was a verified independent-coder process.  
**State:** isolation, forbidden-input abstinence, and outcome blindness are agent-reported. Scratch directories are absent. No non-author session check was found. Distinct outputs show that the mark files are not copies. They do not prove isolation.  
**Route A companion:** the Owner may expressly accept this evidence limitation. That acceptance must say it is accepting a limitation. It does not convert unverified process facts into verified facts.  
**Route B trigger:** if a mandatory process requirement remains unsatisfied and is not expressly accepted as a limitation, the later act is a B-only rerun on the frozen permitted inputs, with a fresh execution record, independent verification, and recomputation of dependents that actually change. Stratifier A stays unless a separate established fact requires otherwise.  
**Does not authorize:** the rerun inside this CORR1.

## 5. B17.4 component acceptance or reaffirmation, if still required

**Class:** `MANDATORY_PREDECESSOR` of claiming Owner acceptance of CORR10, A-E001, and F0024. Not a rerun.  
**State:** `OWNER_ACCEPTANCE_NOT_ESTABLISHED`. The bound B5.5/B5.7 provenance does not contain primary instruments for these three acts. Historical IV PASS reports and Git bindings remain.  
**If no primary instrument is produced:** one batched reaffirmation of the unchanged identities is the minimum documentary proposal. It is not itself acceptance.  
**If step 3 or 4 orders a B-only rerun:** historical component bytes may still be reaffirmed as history. Effective-view use that depends on the current B intersection must not be accepted in that same decision. It has to be recomputed after the rerun.  
**Does not authorize:** a new IV unless the bytes change.

## 6. Post-pilot disagreement and affected-cell closure

**Class:** `MANDATORY_PREDECESSOR` of post-pilot contract acceptance, and `CONDITIONAL_REMEDIAL` in its execution.  
**State:** not executed for the stratifier universe.  
**Rule:** correct, re-IV, or rerun only cells that an independent classification assigns to a class requiring a change. If no cell requires a change, this remedial branch is not executed.  
**Boundary:** the existing analytical-coder reconciliation is not classification of the 1,094 stratifier tuples and does not close this step.

## 7. Owner acceptance of the post-pilot semantic contract

**Class:** `MANDATORY_PREDECESSOR` of the final freeze. `FINAL_CLOSURE_CONDITION`.  
**State:** `POST_PILOT_CONTRACT_OWNER_ACCEPTANCE = OPEN`.  
**Not satisfied by:** the pilot-version lock, an IV PASS, FEVA acceptance, adapter acceptance, or a Git commit.

## 8. FINAL CONTRACT FREEZE

**Class:** `MANDATORY_PREDECESSOR` of 905-fact binding. `FINAL_CLOSURE_CONDITION`.  
**State:** `STAGE2_FINAL_SEMANTIC_CONTRACT_FREEZE = OPEN`.  
**Distinct from:** `PILOT VERSION LOCK`, B7.1 methodology acceptance, and the B5.10 HEDC-rule freeze.  
**Forbidden before this step:** 905/905 sealed-fact semantic binding.

## 9. 905/905 fact semantic binding and independent dual coding

**Class:** `MANDATORY_PREDECESSOR` of the later mechanism, HEDC, and historical-validation work in CORR4 §M. `FINAL_CLOSURE_CONDITION` for semantic closure.  
**Order:** binding across 18/18 sides only after step 8, then independent dual coding under that same frozen contract.  
**State:** not executable now. Not a separate shortcut around steps 7 and 8.

## 10. Evidence preservation

**Class:** `OPTIONAL_DURABILITY`. `INDEPENDENT_PARALLEL` in the sense that it does not gate a diagnostic measurement and does not complete methodology.  
**State:** 40 minimal reproduction objects were rehashed and are available now. Nine of them have a Git path or a verified archive member. Thirty-one live objects have no stable locator. An SHA-256 without a file is not preservation.  
**Future act, separately authorized:** Git binding by the Git actor, or a durable manifested park, of the live-only objects, without changing bytes.  
**Not a blocker** of CORR1 IV or of recording the open scientific gates.

## 11. Diagnostic or full-measurement authorization, or continued deferral

**Class:** `DIAGNOSTIC_SCOPE`. Not a `FINAL_CLOSURE_CONDITION` by itself.  
**State:** full measurement is `NOT_RUN / DEFERRED / REQUIRES_NEW_OWNER_AUTHORIZATION`.  
**Ambiguity, not a fabricated prerequisite:** CORR4 §M does not name the FEVA regression. The accepted adapter closure defers full measurement until a new authorization and does not place that run after semantic freeze. No recovered authority requires the diagnostic run to wait for steps 7 and 8, and none says the run closes those gates.  
**A separately authorized diagnostic `regress(path)`** may be described on the exact accepted FEVA CORR2 while steps 2, 7, and 8 stay open. That run would cover 116 assembled records. It would not be unqualified B17 or Stage-2 final closure.  
**If the Owner rejects the current B execution:** the present FEVA identity cannot be assumed to remain the lawful input.  
**If the Owner keeps the current B marks:** a diagnostic run still does not immunize those records against a later §L-4 affected-cell correction.  
**Continued deferral** remains a valid Owner decision. Eligibility is not authorization.  
**This step does not add a Control Tree edge and does not make B5.8–B5.19 prerequisites.**

## 12. Actual `regress(path)` execution

**Class:** `CONDITIONAL_REMEDIAL` only in the sense that it happens solely under a future authorization from step 11. It is not remedial science for §L-4.  
**State:** not run. The public entrypoint remains `regress(path)`. The CLI printing `measurementExecuted: false` is not a measurement.  
**Historical evidence that stays visible:** the original regression report remains FAIL. The correction IV1 remains HOLD, including REG-007. This CORR1 does not decide REG-007. A future run may FAIL or HOLD.

## 13. Independent verification of the measurement

**Class:** `MANDATORY_PREDECESSOR` of Owner disposition of a measurement result. It exists only if step 12 produced a result.  
**Verifier:** a different actor from the measurement executor. Codex authored the harness, so Codex does not independently verify a measurement it executed. The historical Grok adapter IV PASS remains valid inside its original scope and is not the measurement verdict. This CORR1 does not re-certify that adapter IV.

## 14. Owner disposition of the exact verified results

**Class:** `FINAL_CLOSURE_CONDITION` for the measurement lane, and only for the exact result that was independently verified.  
**State:** no result exists to accept.  
**Does not accept:** Stage-2 science, §M, or B5.8.

## 15. Separately authorized Git closure

**Class:** `MANDATORY_PREDECESSOR` of binding whatever the Owner has actually accepted. Not implied by this preflight, by an IV PASS, or by a measurement run.  
**Actor:** the Git actor under a later authorization.  
**Does not start** from this file.

## 16. Downstream scientific and product stages

**Class:** `SEPARATE_DOWNSTREAM`.  
**Contents:** mechanism normalization, HEDC, rule freeze, blind replay, falsification, LOCO, T10, pair/ECS, and B5.8–B5.19.  
**State:** not promoted. The B5.5/B5.7 reconciliation removes those two nodes as "lifecycle-unresolved" predecessors in the old CORR4 sentence. It does not clear B5.8. Gates G-2 through G-6 in the bound downstream check remain as written. G-3, whether the measurement deferral also gates B5.8, stays `NOT DETERMINED`.  
**Not a prerequisite** of this CORR1 or of a diagnostic measurement.

## What may share one Owner round

Steps 3, 4, and 5 may be decided in one Owner round when the Owner is not ordering a B-only rerun. The round must still record three decisions: actor, process-evidence limitation, and B17.4 reaffirmation of unchanged historical identities.

Step 2 is a different decision. It may be asked in the same round only as an independent question. It must not be treated as answered by actor ratification.

Step 11 must not be bundled into acceptance of steps 7 or 8. An authorization to run a diagnostic measurement is not acceptance of the semantic contract, and acceptance of the semantic contract is not authorization to run the measurement.

A B-only rerun must not be bundled into acceptance of downstream views that depend on the current B marks.

## Unqualified closure condition

Unqualified B17/Stage-2 final closure is not available while any of these remain:

1. `L4_STRATIFIER_DISAGREEMENT_DISPOSITION = OPEN`
2. `POST_PILOT_CONTRACT_OWNER_ACCEPTANCE = OPEN`
3. `STAGE2_FINAL_SEMANTIC_CONTRACT_FREEZE = OPEN`
4. HOLD-6 actor disposition open
5. process-proof limitation unresolved or not expressly accepted as a limitation
6. B17.4 primary acceptance unrecovered
7. full measurement `NOT_RUN`, if the Owner requires measurement before calling the B17.5 lane closed

Items 1–3 and the §M order are contractual. Item 7 is the measurement lane, not a substitute for items 1–3. Preservation is absent from this list on purpose.

Completed component lanes that this correction does not reopen: B17.1, B17.2, FEVA CORR2, the compatibility adapter inside its historical IV scope, and B17.6 with its accepted punctuation residual. That is not a claim that B17 has no further mandatory methodology work. The B17.7 inventory conclusion does not discharge §L-4 or §M.
