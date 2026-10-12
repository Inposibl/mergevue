# CORR9.IV2 — Independent revised read-only verification

**Act:** `STAGE2_CORR4_L4_EFCA_OFFLINE_ENFORCEMENT_IMPLEMENTATION_1.CORR9.IV2`  
**Role:** Codex — Owner-appointed INDEPENDENT AUDITOR  
**Date:** 2026-10-12, America/Asuncion  
**Verdict:** **PASS** — new findings: 0 BLOCKING / 0 MAJOR / 0 MINOR / 0 ADVISORY

## 1. Executive result, independence and scope

The exact unchanged CORR9 implementation satisfies the revised Owner-accepted Option B contract in the **offline, synthetic-only, trusted-host scope**. All mandatory TB-01–04, INV-01–08, NG-01 and RV-01–10 are addressed in the matrix. Host access control and file-source trust are explicitly **ASSUMPTIONS**, not security mechanisms implemented by the Python component. TB-04 is a future integration obligation, not a deployment test that passed.

The new independent reproductions confirm the actor-facing F-45 correction, engine-derived construction modes, untouched cross-mode refusal, semantic replay, procedural evidence context, scoped persistence and compatibility. They also reproduce complete bidirectional mode laundering, including adopted state and continued issuance. That remains NG-01 under privileged host/filesystem capabilities. No permitted requester call accepting an authoritative complete history was found in the inspected surface.

`CORR9.IV1 = FAIL — BLOCKING=0 / MAJOR=1` is **unchanged**. `CORR9-IV1-MAJ-01` remains **MAJOR / ORIGINAL IV1 FAIL / OWNER-RISK-ACCEPTED FOR BOUNDED TRUSTED-HOST SCOPE**. Revised PASS does not authenticate persisted-history origin, prove deployed isolation, validate historical scientific claims or accept the implementation on the Owner's behalf.

Implementation author is DeepSeek; contract author is GPT-6 / Orchestrator, as supplied by the current Owner brief. This auditor has not authored the implementation, accepted contract or load-bearing decision in this session. Prior IV1 and contract-audit reports are adjacent independent evidence, not implementation authorship. Independence is established from current session activity and supplied author identities; no exhaustive cross-session authorship investigation is claimed. No subagents were used.

## 2. Exact audit and artifact identities

Original physical root: `/Users/entp_psyche/Desktop/InvestProjects2026/MergeVue PayProduct (june 2026)/MergeVue-M&A (August 2026)`. Git top level agrees. Branch `main`; HEAD `1335d2e23c58d2ff2df4286bbd3d6eff2ace485f`. Candidate directory: `WORKBENCH/AUDITS/STAGE2_CORR4_L4_EFCA_OFFLINE_ENFORCEMENT_IMPLEMENTATION_1_CORR9/`. Six regular files resolve within that root; no alternate implementation was substituted.
| Candidate member | Bytes | SHA-256 |
| --- | --- | --- |
| ACT_MANIFEST.json | 14285 | `4427d24a216fca459806cbfc19a7a94ea9b30c5c99b4a68cd15613e67cae83d6` |
| IMPLEMENTATION_REPORT.md | 28579 | `863f0124d6200fff67b07e1d3b19bb7c58c76bc7b6a884f65f861ca40a4adf8e` |
| TEST_RESULTS.json | 158114 | `aa5eba440ecd668a17ffa9d1de536a7276d9f60155260ef8e0f1f7974c2b7eb1` |
| offline_efca.py | 233322 | `cff11c1a25baddf4340e0dfff82923e58415505ead43fd9d257eb067c1be8143` |
| synthetic_fixtures.json | 6497 | `67de9301963539886fb43b2e3138c90d42c62d528fd715c848ea42116e4acd8c` |
| test_offline_efca.py | 371607 | `d6af54af5fa76142454cff664e8d58b699e3b4de3302aafedadc430d8161a5d3` |

Accepted contract act: `CORR9-MAJ01-OPTIONB-CONTRACT-ALIGNMENT-1`. Actual `candidate-exact.txt`: **13499 bytes**, SHA-256 `1cf24018e947c389ab3a4875d6223aa7c496df15fb9c33b4466f64fdab44aff2`. Exact byte copy: `accepted_contract.txt`. Its old PENDING OWNER ACCEPTANCE text was not edited. The current Owner-supplied IV2 brief explicitly accepts these exact bytes and controls over that historical lifecycle label. Git binding is not required or claimed.
| Authority or parent path | Bytes | SHA-256 |
| --- | --- | --- |
| WORKBENCH/AUDITS/STAGE2_CORR4_L4_EFCA_OWNER_ACCEPTANCE_BINDING_1/EFCA_CORR2_CORR2_CORR1_CORR1_CORR1_CORR1_GPT6_AUTHOR_CANDIDATE.md | 97712 | `5bb887d269e9079754e5a4f7417cd08f58d4ad5d5ff14503ca1dd98646176eba` |
| WORKBENCH/AUDITS/STAGE2_CORR4_L4_EFCA_OWNER_ACCEPTANCE_BINDING_1/SHA256SUMS.txt | 727 | `2fbe725aa6607ef9903c4f0220df09a590eeb3a41a122f085ee5ed8ca73bd6f9` |
| WORKBENCH/AUDITS/STAGE2_CORR4_L4_EFCA_CORR9_ALLOCATION_AUTHORITY_1_CORR1/ACT_MANIFEST.json | 6790 | `577cbbcc675fc2e69fac46787242491565e97a1372dd5913e909aebbb1f4e286` |
| WORKBENCH/AUDITS/STAGE2_CORR4_L4_EFCA_CORR9_ALLOCATION_AUTHORITY_1_CORR1/EFCA_CORR9_ALLOCATIONS_v1.json | 716 | `53eb3ec43feb4de926e057e0dc17a857473872e4bbc9ff571e5937576c38ecb1` |
| WORKBENCH/AUDITS/STAGE2_CORR4_L4_EFCA_CORR9_ALLOCATION_AUTHORITY_1_CORR1/EFCA_CORR9_ALLOCATIONS_v1.json.sha256 | 97 | `8209554567f29c1dd0c10a9b50a4ff7f7c6ceef99012387d2a87db58b975a59d` |
| WORKBENCH/AUDITS/STAGE2_CORR4_L4_EFCA_CORR9_ALLOCATION_AUTHORITY_1_CORR1/README.md | 7380 | `35ddeea82a0189a0b64f5c62ba0581eaf6c705bc5566b3c3c2ef7226d352eb55` |
| WORKBENCH/AUDITS/STAGE2_CORR4_L4_EFCA_OFFLINE_ENFORCEMENT_IMPLEMENTATION_1_CORR8/offline_efca.py | 202466 | `b5ccce54527b23bff1a683c06ec47a3196f760436e458cd90c031da92db6a17f` |
| WORKBENCH/AUDITS/STAGE2_CORR4_L4_EFCA_OFFLINE_ENFORCEMENT_IMPLEMENTATION_1_CORR8/test_offline_efca.py | 319040 | `1a770ca54e36bbb6e22d31e276b828138a60f6066652b273bbab27f2faf0c292` |

All mandatory identity values matched. The approved allocation JSON has eight unique tuple keys, all assigned to SYN_CUST_001; original G3 and G3.CORR1 allocation JSON are byte-identical. Predecessor ORIGINAL and CORR1–7 engines were copied unchanged and freshly pin-checked by the full suite. Exact full inventory is `preservation_before.json`; predecessor identity evidence is also in generated TEST_RESULTS.json/sourcePreservation.
| Prior independent evidence | Bytes | SHA-256 |
| --- | --- | --- |
| /private/tmp/mergevue-optionb-contract-iv1-2wvtrxgl/INDEPENDENT_CONTRACT_AUDIT_REPORT.md | 44075 | `e26272de9422800f1f235ec4c242d3e6e1526fc5a80efb10a45a0c326489a52a` |
| /private/tmp/mergevue_corr9_iv1_pxytpw33/mode_origin_contract_results.json | 4715 | `b2935d69aa28c2837c886190a394576813b5f10bebdc25e02bb59c05feccaf64` |
| /private/tmp/mergevue_corr9_iv1_pxytpw33/mode_origin_contract.py | 2443 | `f1cc880dc1456671cd041413ff48df0c46667c1765a2c323529394a77d1f8f53` |
| /private/tmp/mergevue_corr9_iv1_pxytpw33/INDEPENDENT_IV1_REPORT.md | 36450 | `2194b20106e9da2fa792ef3d4c29b26ec79b6b0180b86a959dc1c11464ea237a` |
| /private/tmp/mergevue_corr9_iv1_pxytpw33/mode_origin_contract.log | 4715 | `b2935d69aa28c2837c886190a394576813b5f10bebdc25e02bb59c05feccaf64` |


## 3. Governance and authority gate

Applied hierarchy: current explicit Owner authorization and attached IV2 brief → AGENTS_A.md → AGENTS.md → exact Owner-accepted Option B contract and preserved accepted decisions → bound governance and scientific rubric → source/runtime → prior agent reports. No report PASS was used as Owner acceptance. The current brief appoints Codex as independent AUDITOR and permits the isolated executions and external report writes.

Read the router and full auditor mandate, causal-proof policy and applicable quality-gate material; bound Model Routing and Verification Policy; bound Git Worktree Closure Governance; Control Tree v2.1 legend and October current-status overlay; later EFCA Owner decision; accepted rubric §§D.4, G.1–G.8, I/I.2; G3/G3.CORR1 authority records; CORR6 implementation record §§4–6 and compatibility guardrail; exact contract; both prior reports and original attack scripts/results/logs; exact candidate and predecessor code/tests. No later numbered Control Tree was located. The overlay and later EFCA decision preserve scientific and deployment gates.

OD-37/38/39 and OD-45-A are expressly preserved by the current brief/accepted contract. CORR6 and G3.CORR1 records give their available documentary statement; OD-38 also corresponds to accepted rubric D.4. The original Owner-supplied IV1 attachment at `/Users/entp_psyche/.codex/attachments/efe5c4bb-1971-493e-99e4-e18581e50bb2/Pasted text.txt` was retrieved and inspected for exact allocation/OD-45-A lineage. Standalone independently bound OD-37/38/39 transcripts were not established; their authority here comes from the current Owner-adopted preserved requirements, not a coder report. Historical pending fields in G3.CORR1/author manifests were preserved rather than silently upgraded.

Governance staleness checks recomputed physical hashes, matched sidecars and inspected last per-path binding commits:

| Document | Physical SHA-256; sidecar matched | Last binding commit |
| --- | --- | --- |
| docs/governance/MERGEVUE_MODEL_ROUTING_AND_VERIFICATION_POLICY_2026-09-08.md | `07fdf43043c3a2245c7cb0eae2e89ff42f88d66100736751227f2ddfb7d34a23` | d43de38a16f90500b4bf24542e6b1d476674efbe |
| docs/governance/MERGEVUE_GIT_WORKTREE_CLOSURE_GOVERNANCE_2026-09-05.md | `27aa43abd0d8ce93b500231ded6b47d98949ba2a475f991098081c320b270a85` | 3c9884984222e0d7d9ddf7f380f969b011220f14 |
| docs/governance/MERGEVUE_CONTROL_TREE_v2.1_2026-09-04.md | `360bafa29bad5ea93752323d4a217bf59aaec628e0e2b236350a2edd9c1f7128` | 7792c5e390afbbc990ab61a870a337538bf2d2e3 |
| docs/governance/MERGEVUE_CONTROL_TREE_CURRENT_STATUS_INTEGRATION_ADDENDUM_2026-10-10.md | `6ad007cc3a7bace275de46264f4e035988267ad31f8f3402885fec9f2129eb61` | 33ed68083d1b1167f1cc3b34fab1b98573eabb3f |
| docs/decisions/MERGEVUE_STAGE2_CORR4_L4_EFCA_OWNER_DECISION_2026-10-10.md | `8432f3aa6bd408bd1111208dc5957877e73d5dc34e014f6755f4e11a2449ffb4` | 1335d2e23c58d2ff2df4286bbd3d6eff2ace485f |


Evidence classification: authorization/contract acceptance are OWNER FACTS; the bound rubric/decisions are GOVERNANCE/METHOD facts for the preserved ceilings; source locations and new probe outputs are SOURCE/RUNTIME FACTS; original reports are prior INDEPENDENT-REPORTED evidence; operational host restrictions are ASSUMPTIONS; no public/production capability is inferred.

## 4. Repository baseline and execution isolation

All audit writes are below `/private/tmp/mergevue_corr9_iv2_odn67a24`. A **fresh** disposable `repo/` copied 710 tracked/relevant dependency files and local Git metadata, preserving relative paths. Source code, original tests and their assertions were not changed. The copied suite writes its own TEST_RESULTS.json; this never touched the original byte-frozen result file. Copied Git metadata supports the suite's read-only checks; no branch, commit, checkout, fetch, stage, reset, clean, push or deployment occurred.
Original baseline: 0 tracked dirty paths, empty staged diff, 828 expanded untracked entries; expanded porcelain SHA-256 `1bfe59e3137693ba48ef94e3a97a1639328cb036ef0902fa855fb35ea81f5f64`. Original synthetic_runs was empty; no pycache/pyc residue appeared. Relevant original candidate, authority and predecessor files were hashed before execution. 19 external prior contract/audit/report/probe/result/log files were independently identified and preserved.

## 5. Actual unchanged 117-test execution

Command: `PYTHONDONTWRITEBYTECODE=1 GIT_OPTIONAL_LOCKS=0 python3 test_offline_efca.py`. CWD: `/private/tmp/mergevue_corr9_iv2_odn67a24/repo/WORKBENCH/AUDITS/STAGE2_CORR4_L4_EFCA_OFFLINE_ENFORCEMENT_IMPLEMENTATION_1_CORR9`. Python 3.9.4; macOS-10.16-x86_64-i386-64bit. UTC 2026-10-12T11:25:58.148978+00:00 → 2026-10-12T11:26:00.779778+00:00; measured wall duration 2.631 s; exit 0.
| Executed | Passed | Failed | Errors | Skipped |
| --- | --- | --- | --- | --- |
| 117 | 117 | 0 | 0 | 0 |

| Family | Actual executed methods |
| --- | --- |
| C-retained | 6 |
| C7 | 1 |
| F-retained | 54 |
| F45 | 14 |
| T-retained | 42 |

Individual result records are the copied candidate `TEST_RESULTS.json/tests` (117 records), and `full_suite.log` records the actual invocation. The unchanged suite still labels its report AUTHOR_SELF_VALIDATION; reproduction is independent execution of author-designed assertions, **AUTHOR-TEST-REPRODUCED**, not independent test design. The new probes below provide separate attack oracles.

AST comparison found no removed CORR8 test methods. Retained 102 methods execute plus fourteen F45 and C7 additions. Eleven retained executable test adaptations bind lawful allocationDigest/context or explicit simulation allocations; registration/privacy/scientific assertions were retained. Engine changes are allocation loaders/context, GENESIS, registration entitlement/digest, evidence mode and native version/recovery checks. No engine function was removed. Confidentiality/Lane B mechanisms retained their prior executable paths. No production reference to EFCASession/offline_efca/host recovery was found in the inspected src/, api/ or scripts/ search.

## 6. Independent RV-01–RV-10 results

Eight new independently constructed probe groups executed successfully. They use invented IV2 actors such as SYN_CUST_312, SYN_RP1_312 and SYN_RLB_312 and fresh tuple text/records. They do not invoke author test methods or reuse previous execution results. Previous attack scripts were read as reproduction evidence; the new IV2 oracle code is `iv2_probes.py` and `iv2_supplement.py`.

| Probe group | Observed result |
| --- | --- |
| RV03-F45 | PASS |
| RV04-CONSTRUCTOR | PASS |
| RV05-RV06-RV08-BIDIRECTIONAL | PASS |
| RV07-SEMANTIC | PASS |
| RV09-REQUESTER-HOST | PASS |
| RV07-RV08-INV07-INV08 | PASS |
| RV07-PHYSICAL-GATE-AND-NATIVE-DURABILITY | PASS |
| RV07-LEGACY-NATIVE-MIXED-SCHEMA | PASS |


RV-03 proves parent first-writer capture, current uniform NOT_ENTITLED in absent/unallocated, foreign-allocated and foreign-registered states, actor/input validation before entitlement, no events/index/authority mutation on refusal, exact independently computed allocationDigest, lawful own registration, own duplicate and both competing orders.

RV-04 covers all eight subsets of pinned-path / in-memory simulation / simulation-path sources: four valid forms and four conflicting combinations. Equal approved bytes yield pinned context only in the pinned construction form; both simulation forms remain SIMULATION. Caller mode/digest keywords are rejected. Malformed/conflicting/foreign authorities fail. Post-construction mutation of supplied JSON or simulation-file bytes does not change the effective mapping. Constructor choice and input paths remain trusted host setup, not requester credentials.

RV-05 generates genuine issued-evidence histories in both modes at equal allocation bytes/digest. Each untouched opposite-mode restore refuses with AUTHORITY_CONTEXT_MISMATCH and zero state adoption. RV-06 repeats the full forgery separately, below.

RV-07 constructs thirteen envelope-valid hostile native histories: unauthorized custodian (with freshly computed attacker-entry digest), wrong/missing digest, extra/missing schema fields, wrong GENESIS context, incorrect/missing evidence metadata, scientific promotion, wrong packet-reviewer role, prior engine-act and illegal actor/tuple ordering. Each refuses on both empty and nonempty lawful-prefix destinations; snapshots of events, complete index and authority remain equal. The supplemental mixed CORR5/CORR9 registration-schema chain also refuses read-only admission. A changed physical rubric blocks both lawful issuance and replay of an otherwise lawful issued record without partial state adoption. This is causal evidence that semantic and physical controls govern component state.

RV-08 observes actual native evidence under both modes and registration digests. The evidence record contains derived mode under proceduralCompleteness, rubric/parent/contract identity, procedural completeness and UNASSIGNED ceilings. It does **not** have a top-level allocationDigest or global allocation inventory: the exact entry digest belongs to TUPLE_REGISTERED/registration return. No additional evidence field was invented as a requirement. Isolated incorrect evidence snapshots fail replay; whole-history substitution remains NG-01.

RV-09 explicitly inventories requester, setup and host methods and evaluates direct object access; see §§8–9. Native genuine round trips in both modes reproduce full events/index and all sampled actor projections, extend lawfully and survive another fresh restore. RV-10 preservation passes, §15.

Auditor harness development corrections: the first supplemental science probe compared category_assignment's returned dictionary to a string; it was corrected to inspect categoryAssignment. A round-trip probe compared dictionary repr insertion order instead of dictionary values; direct comparison proved index equality and the oracle was corrected. Both initial failure logs are retained (`probe_setup_category_return_shape.log`, `probe_setup_dictionary_order.log`). These were probe errors, not candidate failures. Only new auditor scripts were changed; candidate source/assertions were never modified. Final runs shown above are the evidence used for the verdict.

## 7. Full MAJ-01 reproduction and bounded disposition

For each direction the auditor: constructed a genuine source session; registered seven invented roles and one lawful tuple; issued actual evidence; persisted the native history; checked untouched destination refusal; made a separate file rewriting GENESIS allocationAuthorityMode and every issued evidence proceduralCompleteness mode; recomputed all prevEventSha/eventSha values with an independent canonical serializer; independently verified the full envelope; invoked host restore on a fresh congruent destination; inspected adopted state and requester-visible evidence; registered another lawful tuple and issued new evidence.

| Origin → destination | Untouched control | Forged envelope / restore | Evidence before → adopted → continued | State adoption / continuation |
| --- | --- | --- | --- | --- |
| SIMULATION → OWNER_PINNED | AUTHORITY_CONTEXT_MISMATCH | True / True | SIMULATION → OWNER_PINNED → OWNER_PINNED | state hash changed; lawful extension succeeded |
| OWNER_PINNED → SIMULATION | AUTHORITY_CONTEXT_MISMATCH | True / True | OWNER_PINNED → SIMULATION → SIMULATION | state hash changed; lawful extension succeeded |

Exact files: `iv2_runs/iv2_native_SIMULATION.jsonl`, `iv2_native_OWNER_PINNED.jsonl`, `iv2_forged_to_OWNER_PINNED.jsonl`, `iv2_forged_to_SIMULATION.jsonl`. Actual full original/adopted/continued evidence records, paths, hashes, restore returns and state hashes are in independent_results.json/RV05-RV06-RV08-BIDIRECTIONAL. No engine pin, allocation bytes or source constant was modified.

The attack requires complete native-chain read/write/replacement, full-chain rehash and host restoration access. No inspected requester operation grants those capabilities. A caller given the session object can call host restore directly; this is expressly demonstrated, not hidden by a missing requester_id parameter. If that caller is an untrusted requester in a later workflow, the same success is an in-scope defect for that workflow and cannot use NG-01 as an exemption.

Mechanism: restore compares declared mode/digest with receiving construction context (4457–4466), semantically replays with that same context (4467–4478), then adopts events/index (4491–4492). Evidence replay computes expected mode from the destination (2939–2961). Those checks prove self-consistency/legality; they supply no independent origin anchor. Requester events then expose the relabelled lawful evidence. SHA-256 chain validity is not history origin authentication.

Disposition: **known MAJOR, original IV1 FAIL, Owner-risk-accepted only for bounded trusted-host synthetic scope; not a new in-scope failing defect in IV2**. No retrospective rewrite occurred.

## 8. Complete public/setup/host API inventory

`api_inventory.json` contains every EFCASession method, exact signature, source line range, docstring, return expressions, direct self-call edges and transitive requester-call closure. The table includes every public/setup/host entrypoint; internal helper calls are preserved in that JSON. All source locations below refer to exact candidate offline_efca.py, not the auditor scripts.

| Method and full parameters | Lines | Boundary | Return / behavior |
| --- | --- | --- | --- |
| __init__(rubric_path=None, sidecar_path=None, scratch_dir=None, session_label='SYN_SESSION_001', allocations_path=None, simulation_allocations=None, simulation_allocations_path=None) | 2984–3050 | TRUSTED_HOST | Constructed native session; verified authority, GENESIS/index (no requester-facing return) |
| register_actor(actor_id, role) | 3073–3077 | TRUSTED_HOST | actorId/role payload; host trusted role setup; no caller authentication |
| register_tuple(custodian_id, tuple_spec) | 3079–3154 | REQUESTER_SCOPED_OR_CONSTANT | tupleKey, canonicalHashInput, own allocationDigest, local registeredAt, synthetic |
| issue_packet(custodian_id, reviewer_id, tuple_key) | 3158–3173 | REQUESTER_SCOPED_OR_CONSTANT | exact five-field blind packet |
| fetch_packet(reviewer_id, tuple_key, fields=None) | 3175–3196 | REQUESTER_SCOPED_OR_CONSTANT | selected lawful five-field packet; forbidden fields refuse |
| submit_phase1_review(reviewer_id, tuple_key, review) | 3198–3250 | REQUESTER_SCOPED_OR_CONSTANT | own sealed-review metadata / local scope |
| acknowledge_seal_receipt(custodian_id, tuple_key, reviewer_id) | 3252–3262 | REQUESTER_SCOPED_OR_CONSTANT | custody receipt / local scope |
| reveal(custodian_id, reviewer_id, tuple_key) | 3266–3286 | REQUESTER_SCOPED_OR_CONSTANT | lawful post-receipt marks/records |
| append_delta(reviewer_id, tuple_key, delta) | 3288–3301 | REQUESTER_SCOPED_OR_CONSTANT | own append-only delta payload |
| report_exposure(reporter_id, tuple_key, exposed_to_id, what, detail='', occurred=None) | 3305–3361 | REQUESTER_SCOPED_OR_CONSTANT | incident / own scope metadata |
| request_new_phase1(custodian_id, tuple_key, new_reviewer_id) | 3363–3373 | REQUESTER_SCOPED_OR_CONSTANT | new blind packet for different eligible reviewer |
| register_lane_b(r_lb_id, tuple_key, lane_b_spec) | 3377–3410 | REQUESTER_SCOPED_OR_CONSTANT | own actor-local submission identity and pending-J1 record |
| deliver_lane_b_to(custodian_id, actor_id, tuple_key, submission_id) | 3412–3440 | REQUESTER_SCOPED_OR_CONSTANT | exact referenced delivery / local scope |
| begin_independent_reproduction(r_ind_id, tuple_key) | 3444–3474 | REQUESTER_SCOPED_OR_CONSTANT | independent reproduction gate outcome |
| receive_first_rationale(r_ind_id, tuple_key) | 3476–3500 | REQUESTER_SCOPED_OR_CONSTANT | lawful rationale; contamination consequential |
| declare_records_rederived(r_ind_id, tuple_key, record_refs) | 3502–3520 | REQUESTER_SCOPED_OR_CONSTANT | bound re-derivation declaration |
| adjudicate_claim(r_ind_id, tuple_key, claim_type, claim_id, record_refs=None, proposition=None, observation=None) | 3522–3606 | REQUESTER_SCOPED_OR_CONSTANT | named procedural result or mechanical provenance; no scientific category |
| issue_evidence_record(custodian_id, tuple_key) | 3661–3674 | REQUESTER_SCOPED_OR_CONSTANT | derived-mode procedural evidence with UNASSIGNED ceilings |
| workflow_status(tuple_key, requester_id=None) | 3678–3772 | REQUESTER_SCOPED_OR_CONSTANT | authorized scoped status or withheld shape |
| category_assignment(tuple_key) | 3774–3782 | REQUESTER_SCOPED_OR_CONSTANT | constant UNASSIGNED dictionary for well-formed tuple; no occupancy read |
| events(requester_id=None) | 3997–4038 | REQUESTER_SCOPED_OR_CONSTANT | anonymous withheld aggregate or scoped event projections |
| custody_view(custodian_id, tuple_key) | 4040–4132 | REQUESTER_SCOPED_OR_CONSTANT | own tuple custody and scoped status |
| lane_b_view(requester_id, tuple_key) | 4134–4174 | REQUESTER_SCOPED_OR_CONSTANT | permitted submissions / pending-J1; uniform unauthorized refusal |
| verify_integrity(requester_id=None) | 4187–4191 | REQUESTER_SCOPED_OR_CONSTANT | constant valid/reason diagnostic, no global count |
| persist_history(name, requester_id=None) | 4242–4295 | REQUESTER_SCOPED_OR_CONSTANT | path + projection marker; completeGlobalChainProof=false, authoritativeChainBackup=false |
| verify_persisted_history(path, requester_id=None) | 4297–4327 | REQUESTER_SCOPED_OR_CONSTANT | shape-only own-projection valid/reason; never state adoption |
| persist_global_history(name) | 4337–4389 | TRUSTED_HOST | complete JSONL chain path/class, act/mode/token/global eventCount |
| verify_global_history(path) | 4391–4403 | TRUSTED_HOST | envelope valid/detail/global count; not semantic or origin proof |
| restore_global_history(path) | 4405–4497 | TRUSTED_HOST | semantic/context/lineage-checked state adoption; restored/count/act/mode |
| replay_legacy_history(path) | 4499–4556 | TRUSTED_HOST | frozen CORR5 diagnostics, adopted=false, extendable=false |


## 9. Dependency map and requester/host conclusions

```text
TRUSTED HOST setup
  __init__ → pinned/simulation loader → immutable authority → GENESIS/index
  register_actor → _transition → _check_transition → append/index role

HOST-BOUND ACTOR operation
  actor/input validation → entitlement or scoped relationship → _transition
    → _check_transition → append/index → scoped return
  events → observation predicate → redacted/scoped projection
  persist_history → actor namespace → events → marked projection (not chain)
  verify_persisted_history → scratch-bound shape diagnostic (no adoption)

TRUSTED HOST persistence/recovery
  persist_global_history → host_chain namespace → complete native JSONL
  verify_global_history → scratch-bound envelope check (detail/count)
  restore_global_history → envelope → native context → semantic replay
    → extension/lineage check → adopt events/index
  replay_legacy_history → frozen CORR5 replay → diagnostics only

PRIVILEGED full-history substitution
  mode/evidence rewrite → valid full rehash → congruent host restore
    → adopted relabelled evidence → lawful continuation [NG-01]
```

**A. Demonstrated offline restrictions.** The 24 scoped/constant public operations have no direct or transitive self-call path to construction, actor registration or host persistence/restoration. Static call inspection includes helpers and the actual shared transition/index pipeline; no dynamic host dispatcher or arbitrary history argument is present in these methods. Runtime probes prove actor-scoped outputs, uniform diagnostics and refusals, separate host/projection/actor namespaces and projection rejection as native backup. Requester keyword attempts cannot set allocation mode. Their permitted inputs cannot replace GENESIS or adopt an authoritative complete history.

**B. Assumed operational restrictions.** The host must select lawful construction inputs, control role registration, bind the authenticated/operational requester to the actor ID passed to the method and expose only that actor's permitted operations. The module has no authenticated human/session principal. It does not compare caller identity to requester_id. A direct privileged Python caller can pass another custodian's ID and obtain that custodian's view; it can construct default OWNER_PINNED sessions, register roles, obtain full chains through host persistence, read global diagnostics and invoke restore. Existing role rebinding refuses DUPLICATE_ACTOR, but unrestricted setup access still creates new roles. These facts were probed. They are not proof of an exposed requester route under the accepted restricted model.

No external wrapper, authenticated dispatch, capability restriction or OS/process isolation is present in the exact six-file offline candidate; no application import/reference was found in the inspected src/api/scripts. The logical restriction is defined by the Owner-accepted workflow/contract and enforced operationally by the **trusted host**, with code enforcing scope **after a host-bound identity is supplied**. This audit cannot demonstrate an external host permission policy that was not supplied. It does not label methods “host-only” as a security enforcement proof.

**C. Future integration remains unverified.** If an application grants untrusted callers unrestricted object/module/process access, arbitrary identity inputs, constructor authority selection or a file upload-to-restore path, these prerequisites fail and the revised offline PASS does not apply to it. Independently verify the concrete application's authenticated entrypoints, host-method reachability, actor binding and native-file lifecycle before exposing it.

One precise diagnostic limitation: verify_persisted_history checks projection shape/declared own ID and flags; a substituted own-shaped projection can return valid=true. The new probe demonstrates that the diagnostic does not authenticate content and adopts no state. It cannot promote that projection to OWNER_PINNED native authority; host restore refuses it as PROJECTION_IS_NOT_A_CHAIN. This is a preserved, non-authoritative diagnostic behavior, not evidence of authenticated export origin.

## 10. Specification → Code → Test → Evidence → Trust Boundary

Machine-readable equivalent: spec_evidence_matrix.json. PASS for a host/future row means the applicable prerequisite is identified and correctly bounded; it never means external isolation/origin trust has been mechanically demonstrated.

| Spec ID | Code location | Test | Observed outcome | Evidence | Trust boundary | Proof class | Verdict |
| --- | --- | --- | --- | --- | --- | --- | --- |
| TB-01 | EFCASession.__init__ 2984–3050; register_actor 3073–3077; host channel 4337–4556 | RV04-CONSTRUCTOR; RV09-REQUESTER-HOST | Trusted setup identified. Direct Python object can call host methods and pass foreign IDs. External identity binding/isolation is not enforced. | api_inventory.json; independent_results.json | Trusted host / direct process access | STATIC + INDEPENDENT-PROBE + ASSUMPTION | PASS |
| TB-02 | events 3997–4038; persist_history 4242–4295; verify_persisted_history 4297–4327; scoped workflow methods 3079–4187 | RV09-REQUESTER-HOST; F37/F40/F41/F42/F43 | Scoped projections, constant negatives, no authoritative import via inspected requester calls; no transitive requester→host call edge. Restricting actual caller capabilities remains external. | api_inventory.json; independent_results.json | Actor operations with host-bound identity; withholding object/host access assumed | STATIC + INDEPENDENT-PROBE + ASSUMPTION | PASS |
| TB-03 | persist_global_history 4337–4389; restore_global_history 4405–4497 | RV05-RV06-RV08-BIDIRECTIONAL | Native round trips work; whole-history substitutes are accepted. Trusted provenance/admission cannot be inferred from envelope/semantic checks. | independent_results.json; supplemental_results.json; iv2_runs/iv2_forged_to_*.jsonl | Trusted host / privileged filesystem | INDEPENDENT-PROBE + ASSUMPTION | PASS |
| TB-04 | No deployment isolation implementation in six-file candidate | RV09-REQUESTER-HOST; source reference search | Future integration obligations preserved; no deployed isolation, upload prevention or permissions verified. | api_inventory.json; report §12 | Future integration | STATIC + ASSUMPTION | PASS |
| INV-01 | _load_pinned_authority 1837–1866; _parse_allocation_document 1767–1815 | RV04-CONSTRUCTOR; F45 authority tests | Exact approved pin only; substitute and missing pinned artifacts refuse; equal approved bytes at another path retain approval. | independent_results.json; preservation_before.json | Trusted constructor / source pin | INDEPENDENT-PROBE + STATIC | PASS |
| INV-02 | register_tuple 3079–3154; _check_transition 2472–2496 | RV03-F45; F45 regression tests | CORR8 captures; CORR9 uniform NOT_ENTITLED in three states, no mutation; own registration/digest/duplicate and both competing orders verified. | independent_results.json#RV03-F45 | Actor with host-bound ID / exact allocation | INDEPENDENT-PROBE + AUTHOR-TEST-REPRODUCED | PASS |
| INV-03 | __init__ 2984–3050; _load_simulation_authority 1869–1898 | RV04-CONSTRUCTOR | All eight authority-source combinations checked; explicit simulation remains simulation at same digest; mode/digest kwargs refuse; input mutations do not alter effective mapping. | independent_results.json#RV04-CONSTRUCTOR | Trusted host construction | INDEPENDENT-PROBE | PASS |
| INV-04 | restore_global_history 4457–4466; _check_transition 2394–2424 | RV05-RV06-RV08-BIDIRECTIONAL | Unchanged native opposite-mode histories refuse both directions at identical allocation digest; events/index/authority unchanged. | independent_results.json#RV05-RV06-RV08-BIDIRECTIONAL | Untouched host histories | INDEPENDENT-PROBE | PASS |
| INV-05 | _check_transition 2349–2961; _transition 3054–3069; restore_global_history 4467–4492 | RV07-SEMANTIC; RV07-PHYSICAL-GATE-AND-NATIVE-DURABILITY | Correctly rehashed illegal registrations, digests, schemas, evidence and order refuse; empty/nonempty destinations adopt nothing; physical rubric failure blocks live/replay. | independent_results.json; supplemental_results.json | Actor transitions / host replay | INDEPENDENT-PROBE | PASS |
| INV-06 | _evidence_record_payload_in 2279–2342; issue_evidence_record 3661–3674; _check_transition 2939–2961 | RV05-RV06-RV08-BIDIRECTIONAL; RV07-SEMANTIC | Lawful evidence mode equals derived mode; no allocation inventory added; isolated snapshot forgeries refuse; substituted full history metadata is not origin proof. | independent_results.json | Lawful issuance / privileged file substitution | INDEPENDENT-PROBE | PASS |
| INV-07 | Scoped methods 3079–4327; compatibility 4405–4556; retained CORR8→9 test/AST diff | 117 unchanged tests; RV09-REQUESTER-HOST; RV07-RV08-INV07-INV08; supplements | All retained 102 tests executed plus 15 additions; blind/scoped/Lane B/proposition/native/legacy properties preserved in independent scenarios. | full_suite.log; generated TEST_RESULTS.json; independent_results.json; supplemental_results.json | Actor disclosure / host durability | AUTHOR-TEST-REPRODUCED + INDEPENDENT-PROBE + STATIC | PASS |
| INV-08 | fetch_packet 3175–3196; category_assignment 3774–3782; evidence 2279–2342; Lane B 3377–3440 | RV07-RV08-INV07-INV08; RV07-SEMANTIC | Exactly five packet fields; UNASSIGNED values and pending-J1 causeLink; scientific promotion in replay refuses; provenance is not adjudication. | independent_results.json | Synthetic procedural / scientific firewall | INDEPENDENT-PROBE + AUTHOR-TEST-REPRODUCED | PASS |
| NG-01 | restore_global_history 4457–4492; _check_transition 2939–2961 | RV05-RV06-RV08-BIDIRECTIONAL | Complete GENESIS/evidence rewrite plus rehash restores both directions; scoped output relabelled, state adopted, lawful extension succeeds. Accepted limitation only outside requester capability model. | iv2_runs/iv2_forged_to_*.jsonl; independent_results.json | Privileged history filesystem + host restore | INDEPENDENT-PROBE | PASS |
| RV-01 | Six-file package; fixed constants and loaders; predecessor imports | Fresh hash gate and unchanged-suite pinned loaders | All mandatory candidate/contract/rubric/G3.CORR1/CORR8 identities match; predecessor sources and prior audit evidence identified. | preservation_before.json; full_suite.log; report §2 | Pinned bytes / authority records | INDEPENDENT-PROBE | PASS |
| RV-02 | test_offline_efca.py unchanged, 7132 lines | python3 test_offline_efca.py | 117 executed, 117 PASS, exit 0, no skip/error/failure; new generated records outside original repository. | suite_execution.json; full_suite.log; generated TEST_RESULTS.json | Disposable copied repository | AUTHOR-TEST-REPRODUCED | PASS |
| RV-03 | register_tuple 3079–3154 | RV03-F45 | Parent capture and independent correction oracle pass; both orders and refusal immutability. | independent_results.json; supplemental_results.json; api_inventory.json | Actor | INDEPENDENT-PROBE | PASS |
| RV-04 | __init__ 2984–3050 | RV04-CONSTRUCTOR | Constructor forms/conflicts/pin/input immutability independently checked. | independent_results.json; supplemental_results.json; api_inventory.json | Trusted construction | INDEPENDENT-PROBE | PASS |
| RV-05 | restore_global_history 4457–4466 | RV05-RV06-RV08-BIDIRECTIONAL | Opposite-mode genuine histories both refuse with zero adoption. | independent_results.json; supplemental_results.json; api_inventory.json | Untouched host history | INDEPENDENT-PROBE | PASS |
| RV-06 | restore_global_history 4405–4497 | RV05-RV06-RV08-BIDIRECTIONAL | Full successful bidirectional laundering retained; NG-01 bounded disposition. | independent_results.json; supplemental_results.json; api_inventory.json | Privileged filesystem / host | INDEPENDENT-PROBE | PASS |
| RV-07 | _check_transition 2349–2961 | RV07-SEMANTIC | 13 rehashed hostile chains rejected in empty and nonempty destinations; supplemental rubric and mixed-legacy failures pass. | independent_results.json; supplemental_results.json; api_inventory.json | Actor legality / host replay | INDEPENDENT-PROBE | PASS |
| RV-08 | Evidence construction 2279–2342, 3661–3674 | RV05-RV06-RV08-BIDIRECTIONAL | Exact native mode and procedural evidence observed both ways, contrasted with substitute history. | independent_results.json; supplemental_results.json; api_inventory.json | Native issuance versus substituted file | INDEPENDENT-PROBE | PASS |
| RV-09 | API methods 2984–4556 | RV09-REQUESTER-HOST | 30 public/setup/host entrypoints inventoried; 24 scoped/constant operations; no requester-to-host self-call path; direct object counterexamples and external assumptions disclosed. | independent_results.json; supplemental_results.json; api_inventory.json | Actor / host / future isolation | INDEPENDENT-PROBE + STATIC + ASSUMPTION | PASS |
| RV-10 | Original repository/candidate/dependency/evidence set | Before/after exact bytes and expanded Git status | 710 repository files and 19 prior-evidence files unchanged; root/HEAD/branch/status/diffs unchanged; no original residue. | preservation_before.json; preservation_after.json; preservation_comparison.json | Original repository versus audit sandbox | INDEPENDENT-PROBE | PASS |


## 11. Confirmed implementation guarantees and external assumptions

Confirmed: fixed approved allocation bytes for pinned construction; explicit simulation modes; entitlement before occupancy; uniform unauthorized refusal and immutability; exact entry digests; untouched native mode-context separation; shared live/replay schema/entitlement/procedural validation; atomic adoption after complete validation; actual physical rubric gate; derived native evidence context; requester-scoped confidentiality/diagnostics/exports; Lane B actor-local identity; proposition/provenance separation; native durability; frozen read-only CORR5 admission; prior-native/projection/mixed-version refusal; scientific ceilings and exact blind packet fields.

Assumptions, not implemented guarantees: authenticated human identity and actor binding; lawful host constructor and role setup; withholding session object/module/private memory/host methods from untrusted actors; filesystem/process permissions; trusted source admission and custody for native history files; no hostile full-history replacement; protection of engine source/pin; safe forwarding of host diagnostics; single-process operational discipline. No signature, authenticated checkpoint, hardware origin anchor or concurrency/security certification was established or added as a requirement.

## 12. Future integration gates

TB-04 requires independently demonstrated host/requester isolation, filesystem/process permissions, prevention of untrusted replacement/upload-to-restore, preserved mode separation and explicit compromised-host treatment. Map actual exposed routes to this inventory; verify identity binding and allowlisted methods; test that untrusted arbitrary chain files cannot enter trusted restoration solely on self-consistency. Define whether authenticated history origin is required in that new context before relying on imported history. These are future gates only; no production integration, architecture choice or successor act is authorized here.

## 13. Scientific firewall and compatibility

categoryAssignment=UNASSIGNED, tupleLevelName=UNASSIGNED, causeLink=UNASSIGNED_PENDING_J1 are preserved. Phase-1 fields remain exactly caseId, sideId, factId, sealedFactText, questionText. Forbidden field requests refuse. Lane B is non-authoritative, multi-submission and actor-local; both filing orders yield the same filer identities. The independent historical-record procedural scenario produces three provenance attestations for two distinct declared propositions, retains PROVENANCE_VERIFIED_NOT_ADJUDICATED and refuses incomplete scope. No scientific sufficiency decision is made.

Genuine CORR5 histories are admitted read-only with no state adoption, no extension, no proposition upgrading and byte preservation. CORR6/7/8 histories refuse native restore and legacy admission. Old native/schema/mixed-legacy forgeries fail despite valid envelopes. Genuine CORR9 histories in both modes recover, preserve views/index and extend. Regression assertions retain blindness, seal/reveal/contamination, Lane B and historical-record procedural controls F-1–44.

No real historical execution, category classification, 1,094-disagreement processing, J-1/J-4 judgment, J-2/J-3 historical execution, B5.8, final scientific freeze or production operation was performed. Synthetic procedural role tests do not imply a historical program execution.

## 14. Full defect/advisory register and quality gate

| ID | Severity/status | Evidence and disposition |
| --- | --- | --- |
| CORR9-IV1-MAJ-01 | MAJOR / original IV1 FAIL / bounded Owner-risk-accepted | Bidirectional full rehash/adoption/evidence/extension newly reproduced; remains NG-01 only under excluded privileged host capabilities; original report untouched. |
| ALIGN-IV1-A01 | ADVISORY / carried non-blocking | Optional exact-identity appendix. This report/envelope binds identities; accepted contract bytes were not changed and advisory is not silently closed. |
| ALIGN-IV1-A02 | ADVISORY / carried non-blocking | Trusted constructor/setup/role/identity/object-access assumptions explicitly evaluated in §§8–11. No authentication mechanism implemented or claimed; contract unchanged. |
| V-IV1-MIN-01 | MINOR / OPEN, carried | Accepted rubric B.1 missing-world summary differs from governing Q10/D.4/F.2 falsifier rule; preserved unchanged per EFCA decision §3.3. |
| V-IV1-MIN-02 | MINOR / OPEN, carried | S21 fixture temporal restriction “after Copy2” differs from general production threshold; preserved unchanged. |
| V-IV1-ADV-01 | ADVISORY / OPEN, carried | Prior-auditor UUID documentary metadata divergence; accepted scientific/specification identity unaffected; preserved unchanged. |

New IV2 defect census is 0 BLOCKING / 0 MAJOR / 0 MINOR / 0 ADVISORY. Carried findings are separate: one historical risk-accepted MAJOR, two rubric MINORs, one rubric ADVISORY and two contract ADVISORYs. The historical MAJOR is not downgraded or included as a new unaccepted in-scope defect. No Owner decision is needed to finish this authorized act; acceptance of implementation remains a separate Owner gate.
Quality gate applied before PASS: no self-authorship, role crossover, source/assertion correction, self-authorization, new methodology selection, unsupported production claim or validator-as-sole-oracle. Component entrypoints, success/failure consequences, genuine/forged distinction and realistic permitted-vs-privileged bypasses were independently established. Named material risk is history/role authority and confidentiality; no audit-of-audit layer or durable governance changes were created.

## 15. After-audit preservation and its limits

| Measured property | Before → after |
| --- | --- |
| Physical root / branch / HEAD | equal; main; 1335d2e23c58d2ff2df4286bbd3d6eff2ace485f |
| Tracked dirty / staged diffs | 0 / empty → unchanged |
| Expanded untracked entries | 828 → exact same inventory |
| Porcelain SHA-256 | 1bfe59e3137693ba48ef94e3a97a1639328cb036ef0902fa855fb35ea81f5f64 → identical |
| Repository identity set | 710 files; zero missing/changed |
| External prior evidence identity set | 19 files; zero changed |
| Original candidate/rubric/allocation/predecessor bytes | all unchanged |
| Original synthetic_runs / pycache/pyc | empty / none → unchanged |

Evidence: preservation_before.json, preservation_after.json and preservation_comparison.json. The repository identity set covers tracked regular files and relevant EFCA candidate/authority/predecessor packages plus the semantic contract. The external set covers enumerated reports/contracts/probes/results/logs, not the entire earlier disposable repository or every earlier generated raw history. This is not a hash census of every unrelated untracked download, a filesystem monitoring proof or detection of mutation-and-revert by unrelated processes. All audit/test artifacts are outside the original repository. No Owner material was cleaned, normalized, moved, deleted, staged or committed.

## 16. Evidence index and recommended Owner disposition

Primary evidence: audit_summary.json (mechanical census); spec_evidence_matrix.json; api_inventory.json; suite_execution.json; full_suite.log; copied candidate generated TEST_RESULTS.json (individual records); iv2_probes.py/independent_probes.log/independent_results.json; iv2_supplement.py/supplemental_probes.log/supplemental_results.json; iv2_runs native/forged/projection/semantic fixtures; exact accepted_contract.txt; before/after preservation records. evidence_index.json hashes all delivered audit outputs and generated fixtures.

Recommended Owner disposition: accept **this IV2 PASS as revised independent verification of the exact unchanged candidate within the accepted offline synthetic trusted-host contract**, with NG-01 and the operational assumptions visible. Decide implementation acceptance separately. Preserve original IV1 FAIL and its MAJOR, carried rubric/contract findings and all future integration/scientific/Git gates. No repair, Git binding/closure, deployment or successor work is authorized by this report.

**Final verdict: PASS — strictly the revised offline synthetic trusted-host scope. STOP after report delivery.**

