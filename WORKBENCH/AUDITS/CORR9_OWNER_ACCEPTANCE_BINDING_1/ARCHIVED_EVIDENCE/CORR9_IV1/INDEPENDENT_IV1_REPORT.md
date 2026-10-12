# CORR9.IV1 independent read-only audit

**Act:** `STAGE2_CORR4_L4_EFCA_OFFLINE_ENFORCEMENT_IMPLEMENTATION_1.CORR9.IV1`  
**Auditor:** Codex, Owner-appointed AUDITOR; implementation author: DeepSeek.  
**Date:** 2026-10-11, America/Asuncion.  
**Overall verdict: FAIL — 0 BLOCKING / 1 MAJOR / 0 new MINOR / 0 new ADVISORY.**

The unchanged 117-test suite reproduced successfully. Independent tests confirmed the actor-facing F-45 correction and the retained confidentiality, compatibility and scientific boundaries. A separate adversarial reproduction established that a SIMULATION history can be relabelled, completely rehashed and adopted by an OWNER_PINNED session; its simulated evidence then appears as OWNER_PINNED and the adopted chain remains extendable. The converse relabelling also succeeds. This fails the current IV1 brief's explicit cross-mode/forged-GENESIS/evidence-marking criteria. It does **not** demonstrate unauthorized actor-facing custody capture, compromise of production, or a change to the allocation assignments.

## 1. Role, authority and stopping point

The attached Owner task explicitly appoints Codex as independent AUDITOR and authorizes this read-only, offline, synthetic-only act, disposable reproduction and an audit report. No implementation or load-bearing CORR9 design was authored in this session. Independence is established for this audit from the supplied author identity and this session's activity; no broader session-history investigation is claimed.

Read: `AGENTS.md`, `AGENTS_A.md`, `MERGEVUE_CAUSALITY_PROOF_AND_AGENT_CONTROL.md`, `skills/mergevue-agent-quality-gate/SKILL.md`, the bound model-routing and worktree-governance policies, the current Control Tree locator/legend and October status overlay, the EFCA acceptance decision and accepted rubric, G3/G3.CORR1 authority records, the CORR6 OD-37/38/39 and compatibility record, and the CORR8/CORR9 candidate material needed for this act. Relevant causal-proof and quality-gate checks were applied: independent oracle, entrypoint ordering, downstream state adoption, forced refusals, bypasses, non-regression, and truthful scope.

The current explicit Owner task controls over older author lifecycle fields. For example, G3.CORR1's frozen README/manifest still record acceptance as pending, and the CORR9 author manifest records Orchestrator preflight as pending. Those are historical author records; the current task explicitly identifies the accepted authority and successful preflight. No lifecycle artifact was edited or silently promoted.

OD-45-A is directly specified by the current Owner task. OD-37/38/39 and the compatibility guardrail were read in the accepted CORR6 package's `IMPLEMENTATION_REPORT.md`, §§4–6, and its manifest; OD-38 scope also independently matches accepted rubric §D.4. Standalone signed/transcribed decision documents for those three OD numbers were not located in the repository search. Their acceptance is supplied by the current task; the package is the available documentary statement of the preserved contract. Source comments were examined as implementation claims, not used to create normative exceptions.

Stopping point: submit this IV1 report. No correction, Owner acceptance, Git closure, production integration, scientific execution or successor act is performed or authorized by the verdict.

## 2. Physical baseline and identities

Authorized physical root:

`/Users/entp_psyche/Desktop/InvestProjects2026/MergeVue PayProduct (june 2026)/MergeVue-M&A (August 2026)`

Git top level equals that root. Branch: `main`. HEAD before and after:

`1335d2e23c58d2ff2df4286bbd3d6eff2ace485f`

All hashes below were computed independently from actual disk bytes, matched the Owner's mandatory values, and remained unchanged after testing. Candidate files were regular files; physical paths resolved within the authorized root. The candidate directory contains exactly the six files plus an empty `synthetic_runs/` directory.

### CORR9 candidate

Directory: `WORKBENCH/AUDITS/STAGE2_CORR4_L4_EFCA_OFFLINE_ENFORCEMENT_IMPLEMENTATION_1_CORR9/`.

| File | Actual bytes | Independently computed SHA-256 |
|---|---:|---|
| offline_efca.py | 233322 | `cff11c1a25baddf4340e0dfff82923e58415505ead43fd9d257eb067c1be8143` |
| test_offline_efca.py | 371607 | `d6af54af5fa76142454cff664e8d58b699e3b4de3302aafedadc430d8161a5d3` |
| synthetic_fixtures.json | 6497 | `67de9301963539886fb43b2e3138c90d42c62d528fd715c848ea42116e4acd8c` |
| TEST_RESULTS.json | 158114 | `aa5eba440ecd668a17ffa9d1de536a7276d9f60155260ef8e0f1f7974c2b7eb1` |
| IMPLEMENTATION_REPORT.md | 28579 | `863f0124d6200fff67b07e1d3b19bb7c58c76bc7b6a884f65f861ca40a4adf8e` |
| ACT_MANIFEST.json | 14285 | `4427d24a216fca459806cbfc19a7a94ea9b30c5c99b4a68cd15613e67cae83d6` |

The manifest identity is external; no self-embedded digest was demanded.

### Accepted scientific and allocation artifacts

Rubric directory: `WORKBENCH/AUDITS/STAGE2_CORR4_L4_EFCA_OWNER_ACCEPTANCE_BINDING_1/`.

| Artifact | Bytes | SHA-256 |
|---|---:|---|
| EFCA_CORR2_CORR2_CORR1_CORR1_CORR1_CORR1_GPT6_AUTHOR_CANDIDATE.md | 97712 | `5bb887d269e9079754e5a4f7417cd08f58d4ad5d5ff14503ca1dd98646176eba` |
| SHA256SUMS.txt | 727 | `2fbe725aa6607ef9903c4f0220df09a590eeb3a41a122f085ee5ed8ca73bd6f9` |

Allocation directory: `WORKBENCH/AUDITS/STAGE2_CORR4_L4_EFCA_CORR9_ALLOCATION_AUTHORITY_1_CORR1/`.

| Artifact | Bytes | SHA-256 |
|---|---:|---|
| EFCA_CORR9_ALLOCATIONS_v1.json | 716 | `53eb3ec43feb4de926e057e0dc17a857473872e4bbc9ff571e5937576c38ecb1` |
| EFCA_CORR9_ALLOCATIONS_v1.json.sha256 | 97 | `8209554567f29c1dd0c10a9b50a4ff7f7c6ceef99012387d2a87db58b975a59d` |
| README.md | 7380 | `35ddeea82a0189a0b64f5c62ba0581eaf6c705bc5566b3c3c2ef7226d352eb55` |
| ACT_MANIFEST.json | 6790 | `577cbbcc675fc2e69fac46787242491565e97a1372dd5913e909aebbb1f4e286` |

Parsed contents: exactly eight unique allocations; all assigned to `SYN_CUST_001`; canonical UTF-8 compact, sorted-key JSON with one newline. Original G3 allocation bytes also agree. Test simulation documents were kept separate.

### Immediate predecessor

Directory: `WORKBENCH/AUDITS/STAGE2_CORR4_L4_EFCA_OFFLINE_ENFORCEMENT_IMPLEMENTATION_1_CORR8/`.

| Artifact | Bytes | SHA-256 |
|---|---:|---|
| offline_efca.py | 202466 | `b5ccce54527b23bff1a683c06ec47a3196f760436e458cd90c031da92db6a17f` |
| test_offline_efca.py | 319040 | `1a770ca54e36bbb6e22d31e276b828138a60f6066652b273bbab27f2faf0c292` |

### Governance binding/staleness checks

Each following document matched its physical SHA sidecar. Read-only `git log -1 -- <path>` established the last binding commit; no later modification to the same artifact appeared in that history.

| Document | SHA-256 | Last binding commit |
|---|---|---|
| Model routing policy, 2026-09-08 | `07fdf43043c3a2245c7cb0eae2e89ff42f88d66100736751227f2ddfb7d34a23` | `d43de38a16f90500b4bf24542e6b1d476674efbe` |
| Worktree governance, 2026-09-05 | `27aa43abd0d8ce93b500231ded6b47d98949ba2a475f991098081c320b270a85` | `3c9884984222e0d7d9ddf7f380f969b011220f14` |
| Control Tree v2.1 | `360bafa29bad5ea93752323d4a217bf59aaec628e0e2b236350a2edd9c1f7128` | `7792c5e390afbbc990ab61a870a337538bf2d2e3` |
| Current-status integration addendum, 2026-10-10 | `6ad007cc3a7bace275de46264f4e035988267ad31f8f3402885fec9f2129eb61` | `33ed68083d1b1167f1cc3b34fab1b98573eabb3f` |
| EFCA Owner acceptance decision, 2026-10-10 | `8432f3aa6bd408bd1111208dc5957877e73d5dc34e014f6755f4e11a2449ffb4` | `1335d2e23c58d2ff2df4286bbd3d6eff2ace485f` |

No later numbered Control Tree was located. The October overlay and subsequent EFCA decision preserve the distinction between specification acceptance and scientific execution/implementation acceptance.

## 3. Read-only scope and evidence classes

All audit writes and test outputs are under `/private/tmp/mergevue_corr9_iv1_pxytpw33/`. The original repository was never the test working directory. The sandbox contains copied tracked files, EFCA candidate/authority dependencies and copied Git metadata, preserving relative paths. Copy identities were verified before execution. No source, assertion, accepted authority or candidate fixture was patched in either location.

The auditor's **new** probe scripts were corrected during development: initial invented record locators did not match the required `SYN_LOCATOR_RET_###` form; a Lane B surface initially lacked its synthetic marker; CORR5's durability API is `persist_history`, unlike its successors. These were auditor harness errors, not candidate defects. Their logs are retained separately. Only those new scripts were changed; the final valid-input runs are the evidence used here.

Evidence classes remain distinct:

- **AUTHOR_SELF_VALIDATION:** the original six-file package, its original TEST_RESULTS and author's 117/117 assertion. Read as claims/evidence, not independent proof.
- **ORCHESTRATOR_PREFLIGHT:** successful preflight and authorization supplied in the current Owner task. Its procedure was not rerun or represented as this auditor's work. This audit independently repeated the physical identity gates.
- **INDEPENDENT_IV1:** unchanged-suite execution in the sandbox, new auditor scenarios, correctly rehashed histories, static diff/architecture examination, and original-tree preservation checks.

The generated sandbox TEST_RESULTS file retains its author's `SELF_VALIDATION` wording because the suite was unchanged. Independent reproduction is established by the auditor's execution record; that wording does not transform the source tests into independent test design.

## 4. Full-suite reproduction

Executed unchanged, in the copied CORR9 directory:

```text
PYTHONDONTWRITEBYTECODE=1 python3 test_offline_efca.py
```

Python 3.9.4, Darwin. Recorded UTC run: 2026-10-12 00:49:30–00:49:32.

**Exit 0; Ran 117 tests; 117 passed; 0 failed; 0 errors; 0 skipped.** Suite preservation, Git comparison and cache-residue gates were also true. All 117 actually executed; there was no missing dependency or environmental HOLD.

Census confirmed from test definitions and execution records: 42 retained T tests, 54 retained F tests, six retained C tests, fourteen new F-45 tests and one new C7. CORR8 has 102 retained test methods; none was removed.

Evidence: `full_suite.log` and the sandbox candidate's generated `TEST_RESULTS.json`. They are distinct from the byte-frozen original TEST_RESULTS.

## 5. Independent adversarial results

The new probes use invented specifications and new actors such as `SYN_CUST_211`, `SYN_RP1_211` and `SYN_RLB_211`, rather than invoking the author's test methods. Allocation-entry and event-chain hashes were computed independently using the documented serialization convention.

| Audit criterion | Independent test | Actual observed result |
|---|---|---|
| A: parent F-45 reproduction | IV-A01 | Exact CORR8 permits CUST_211 to register Owner-allocated tuple 001 and obtain custody. CORR9 returns NOT_ENTITLED with unchanged history/index/views; CUST_001 subsequently registers lawfully. |
| B: uniform refusal | IV-B01 | Absent/unallocated 211, foreign-allocated 001 and foreign-registered 001 have identical exception class, code, full string and arguments. Refusals change neither authoritative nor scoped state. |
| C: lawful/duplicate/malformed/competition | IV-C01 | Lawful 002/B returns independently verified allocationDigest. Own duplicate is DUPLICATE_TUPLE. Wrong role, actor, tuple and malformed content fail without mutation. Both custodian orders retain lawful custody. |
| D: authority integrity | IV-D01 | Unknown fields, invalid authority IDs, invalid synthetic IDs, duplicate/conflicting tuple allocations, malformed JSON, duplicate JSON keys, BOM, pretty encoding and newline deviations are rejected. Wrong pinned bytes fail identity; absent file fails availability; a caller digest keyword grants nothing. |
| E: constructor isolation | IV-E01, IV-M02 | Unmodified native histories refuse cross-mode restore both ways, including identical allocation SHA. Different digests also refuse. Mode kwargs are not accepted; mixed sources fail MODE_CONFLICT. Mutating the supplied document after construction cannot change effective allocation. |
| F/G: native schema and semantic replay | IV-FG01, IV-M03 | Fully rehashed unauthorized registrations, incorrect/missing entry digests, missing/altered/mismatched GENESIS fields, old registration schemas, mixed-version GENESIS and malformed evidence-mode payloads fail. All forged envelopes first independently chain-verify. No partial event adoption on refusal. |
| H: lawful persistence | IV-H01 | Native disk restore reproduces actor views and custody content, then extends lawfully and survives a second restore. |
| I: confidentiality | IV-I01 | Twelve requester outcomes/views are equal with and without foreign activity. Actor-local projection paths remain separate from each other and host backups; foreign/absent/host verification negatives are identical. Lane B return identities are equal in both filing orders. |
| J: compatibility | IV-J01 | CORR5 is admitted read-only, byte-preserved and non-adoptable; CORR6/7/8 are refused by both relevant adoption/admission paths. Projections cannot restore as chains; requester verification does not accept a host backup. |
| K: scientific firewall | IV-K01, IV-M01, IV-M04 | Exactly five packet fields; forbidden packet requests refuse. Categories remain UNASSIGNED and Lane B causeLink remains pending J1. Historical-record attestations remain provenance only, with three attestations/two distinct propositions and no scientific adjudication. Pre-registration filing grants no custody. |
| Strict E/G/H mode provenance | IV-L01; mode_origin_contract.py | **Violation:** a rehashed, destination-congruent GENESIS/evidence mode relabelling is adopted in both directions; simulated evidence becomes OWNER_PINNED and lawful extension succeeds. See MAJ-01. |

There are fourteen successful assertion groups plus one observational trust-characterization group. A separate contract reproduction records **two directional contract violations**, rather than treating successful execution of that reproduction as a passing correctness assertion.

## 6. Spec → Code → Test → Evidence matrix

For this table, **E** is the exact CORR9 `offline_efca.py` in the candidate directory in §2; **T** is its exact `test_offline_efca.py`. Line ranges refer to those frozen files. `INDEPENDENT-REPRODUCTION` distinguishes the observer from the author; rows explicitly name when evidence additionally uses unchanged author-designed assertions. `STATIC` is not substituted for runtime proof.

| Spec ID | Normative obligation | Code location, function and line range | Test reference | Observed result | Evidence classification | Verdict |
|---|---|---|---|---|---|---|
| OD-45-A / F-45 | Exact tuple allocated to the requesting custodian before registration; no first-writer priority | E: register_tuple 3079–3154, especially 3128–3135; _check_transition 2472–2496 | IV-A01/B01/C01; T F45 parent/uniform/lawful tests 6303–6441 | Parent captures custody; CORR9 denies unauthorized requests before occupancy and changes no state; entitled registration succeeds | STATIC; INDEPENDENT-REPRODUCTION | PASS |
| OD-45-A authority identity | Arbitrary manifest or caller digest cannot establish Owner approval | E: _load_pinned_authority 1837–1866; _decode_allocation_bytes 1818–1834; _parse_allocation_document 1767–1815 | IV-D01/M02 | Fixed source pin, closed schema, canonical bytes, unique tuple keys; substitutions rejected | STATIC; INDEPENDENT-REPRODUCTION | PASS |
| OD-37 / F-37 | Own scoped disclosure without foreign tuples, global sequence/ticks/counts or detailed integrity diagnostics | E: _scope_ref 3834–3851; events 3997–4038; custody_view 4040–4132; verify_integrity 4187–4191 | IV-I01; unchanged T F37 tests 4927–5076 | Foreign activity leaves scoped outcomes equal; no global-envelope material added | STATIC; INDEPENDENT-REPRODUCTION | PASS |
| OD-38 / rubric D.4 | Complete proposition scope; evidence identity, proposition identity and repeated attestation are separate; no scientific promotion | E: _validate_historical_proposition_scope 1328–1394; _historical_adjudication_gates_in 2212–2276; _index_event 1637–1666 | IV-M01; unchanged T F38 tests 5080–5250 | Missing scope refused; 3 attestations/2 distinct propositions; PROVENANCE_VERIFIED_NOT_ADJUDICATED | STATIC; INDEPENDENT-REPRODUCTION | PASS |
| OD-39 / F-39 | Independent multi-submission Lane B; exact delivery reference; filing grants no custody or scientific status | E: register_lane_b 3377–3410; deliver_lane_b_to 3412–3440; lane_b_view 4134–4174 | IV-I01/M04; unchanged T F39 5254–5341 | Multi-actor filing lawful; scoped views; pre-registration filing not entitlement | STATIC; INDEPENDENT-REPRODUCTION | PASS |
| F-40 | Unauthorized Lane B requester receives no foreign submission/existence oracle | E: lane_b_view 4134–4174 | IV-I01; unchanged T F40 5597–5659 | Full refusal output identical before/after foreign registration/submission | INDEPENDENT-REPRODUCTION | PASS |
| F-41 | Existence-blind requester outcomes; packet-first access; self records do not authorize custody | E: _require_active_packet_uniform_in 1924–1936; _require_custodian_uniform_in 1957–1966; fetch_packet 3175–3196; workflow_status 3678–3772 | IV-B01/I01/M04; unchanged T F41 5663–5817 | Blind status, packet/custody refusals and unauthorized registration do not expose foreign occupancy | STATIC; INDEPENDENT-REPRODUCTION | PASS |
| F-42 | Actor-isolated projection namespace; identical negatives for non-own artifacts | E: _projection_path 4228–4240; verify_persisted_history 4297–4327 | IV-I01; unchanged T F42 5826–5889 | Same bare names do not collide; foreign/absent/host negatives equal | INDEPENDENT-REPRODUCTION | PASS |
| F-43 | Requester projections and authoritative host backups have distinct storage/admission | E: _host_history_path 4222–4226; persist_history 4242–4295; persist_global_history 4337–4389 | IV-I01/J01; unchanged T F43 5899–5942 | Three distinct paths; projections cannot become host-chain backups | INDEPENDENT-REPRODUCTION | PASS |
| F-44 | Lane B submission identity depends only on filer, tuple and own filing count | E: _submission_identity 1939–1946; register_lane_b 3377–3410 | IV-I01; unchanged T F44 6008–6208 | Actor return values equal in both filing orders; retained repeat/delivery/forgery assertions all execute successfully | STATIC; INDEPENDENT-REPRODUCTION | PASS |
| GENESIS integrity / IV1 §7.F–G | Closed schema; effective mode/digest checked; missing or incongruent declarations refuse | E: EVENT_PAYLOAD_SCHEMAS 819–825; _make_genesis 1445–1463; _check_transition 2372–2424; restore_global_history 4457–4466 | IV-FG01; unchanged T F45 genesis 6698–6731 | Missing/incongruent mode or digest refuses; extra payload refused | STATIC; INDEPENDENT-REPRODUCTION | PASS for schema/context matching |
| Registration digest / IV1 §7.F–G | Engine computes exact entry digest live and replays it against effective authority | E: _allocation_entry_digest 1716–1724; register_tuple 3128–3154; _check_transition 2472–2496 | IV-C01/FG01; unchanged T F45 forged registrations 6615–6696 | Unauthorized custodian and wrong/missing digest rejected despite valid hash chain | INDEPENDENT-REPRODUCTION | PASS |
| Simulation isolation / IV1 §7.E | Mode derived by constructor; simulation sources cannot mint OWNER_PINNED sessions | E: EFCASession.__init__ 2984–3050; _load_simulation_authority 1869–1898 | IV-E01/M02 | Identical bytes remain SIMULATION when supplied through simulation parameters; mixed sources refused | STATIC; INDEPENDENT-REPRODUCTION | PASS for live construction |
| Simulation isolation / IV1 §7.E–G | Cross-mode restore fails both ways, including identical SHA; simulated evidence cannot claim Owner authority through forged GENESIS | E: restore_global_history 4457–4492; _check_transition 2394–2424 and 2944–2956; evidence payload 2316–2324 | mode_origin_contract.py; IV-L01; contrast with T F45 genesis 6698–6731 | Rewriting persisted mode to destination context and evidence snapshot, then rehashing, yields restored=true, adopted state, opposite-mode evidence and continued extension | INDEPENDENT-REPRODUCTION | **FAIL — MAJ-01** |
| Evidence authority marking / IV1 §7.F | Engine-derived mode in the complete evidence snapshot; altered/missing snapshot refused | E: _evidence_record_payload_in 2279–2342; issue_evidence_record 3661–3674; _check_transition 2939–2961 | IV-E01/K01/M03 | Live mode correct; single-payload mutations rejected; congruent whole-history laundering remains MAJ-01 | INDEPENDENT-REPRODUCTION | PASS locally; FAIL for origin provenance |
| CORR6 compatibility guardrail | Native durable recovery; frozen CORR5 read-only admission; no CORR6/7/8 adoption; no projection backups | E: restore_global_history 4405–4497; replay_legacy_history 4499–4556; verify_persisted_history 4297–4327 | IV-H01/J01; unchanged T C1–C7 5411–5554, 5951–5979, 6224–6252, 6990–7030 | Native semantic round trips and extension work; foreign versions/projections reject; legacy remains read-only | STATIC; INDEPENDENT-REPRODUCTION | PASS for preserved version/backup boundaries |
| Rubric G.2/G.4/G.6–G.7/I; scientific firewall | Five-field blind packet; preserve contamination controls; categories/name remain UNASSIGNED; causeLink pending J1; no historical adjudication | E: fetch_packet 3175–3196; _evidence_record_payload_in 2279–2342; category_assignment 3774–3784; _index_event 1600–1666 | IV-K01/M01; independently executed retained T/F suite | Exact field set; forbidden requests refuse; provenance not promoted; frozen constants and retained blindness assertions preserved | STATIC; INDEPENDENT-REPRODUCTION | PASS within procedural scope |
| F-1–F-44 regression | Preserve retained protections except the explicitly authorized initial-registration change | CORR8→CORR9 executable AST/diff; unchanged control paths identified in §7 | Complete retained 102 test methods; IV-A–K/M | No removed test; 11 justified retained-test adaptations; all execute successfully | STATIC; INDEPENDENT-REPRODUCTION | PASS for inspected regression scope |

The missing mode-origin mechanism is classified as an **implementation/evidence-authority defect against the current explicit IV1 criteria**. It is not scientific-method uncertainty. Actor authentication, process-private memory integrity, malicious source-pin edits and multiprocess concurrency remain authorized out-of-scope trust limits; they were not converted into new requirements. See §9 for the distinction.

## 7. Architecture, directory and dependency map

| Boundary | Concrete implementation | Assessment |
|---|---|---|
| Allocation loading and identity | _load_pinned_authority / _load_simulation_authority → decode → parse → AllocationAuthority, E 1716–1898 | Intentional new filesystem dependency: exact G3.CORR1 manifest; source-pinned content identity. Closed schemas and unique entitlements. |
| Constructor/mode derivation | EFCASession.__init__, E 2984–3050 | Source form determines mode before GENESIS, actor registration and tuple operations. No caller-set mode/digest parameter. |
| Registration/entitlement | register_tuple, E 3079–3154 | Actor → input validation → entitlement → occupancy → transition. Runtime consequence observed independently. |
| Native event authorization | _check_transition, E 2349–2961, then _index_event | Same validator handles live/replay. No event adoption until validation. Entitlement/digest enforced; mode-origin authenticity is absent. |
| GENESIS | _make_genesis, E 1445–1463; validation 2372–2424 | Stores effective context; restore checks declarations against destination, not independently established origin. |
| Host persistence/recovery | persist_global_history / restore_global_history, E 4337–4497 | Canonical JSONL, scratch confinement, hash/semantic/lineage checks. MAJ-01 occurs through restore, followed by events/evidence/extension. |
| Requester projections | events / _scope_ref / custody_view / lane_b_view; projection methods, E 3834–4327 | Own scoped material, actor namespaces, constant negatives; no new allocation inventory/global digest disclosure. |
| Legacy admission | replay_legacy_history, E 4499–4556 | Frozen CORR5 only, no state adoption or extension. Native/foreign labels refused. |
| Evidence marking | _evidence_record_payload_in / issue_evidence_record, E 2279–2342, 3661–3674 | Generated mode checked by replay payload equality; both derive from destination context, enabling the demonstrated congruent forgery. |

Engine imports remain standard-library `hashlib`, `json`, `re`, `uuid`, `pathlib.Path`; no new package, network or production dependency. Default authority/rubric paths resolve relative to the module. Caller-selected allocation paths are host construction inputs checked against the fixed content pin; their pathname is not itself Owner approval. History operations enforce the configured scratch boundary.

The suite's predecessor imports are test dependencies, loaded only after source hash checks. Native engine execution does not import the predecessor engines. No source/app/CI/hook/directory contract was created.

Executable comparison found no removed engine function. Changes are allocation loading, constructor context, GENESIS, entitlement/digest checks, evidence mode, native version labels and host mode returns/restore checks. Confidentiality and Lane B identity methods are executable-equivalent to CORR8. Frozen legacy payload schemas are unchanged. No unrelated scientific or category algorithm was added.

## 8. Regression and compatibility interpretation

All 102 CORR8 test methods remain. Eleven changed executable bodies are:

- F9 and F15: add correct entry digest to lawful/otherwise targeted forged registrations, so the original property remains the refusal/success cause.
- F15b: missing GENESIS authority fields now trigger the earlier AUTHORITY_CONTEXT_MISMATCH rather than semantic-replay rejection.
- F19, F23, two F37 tests, F40, two F41 tests and F44-orders: explicitly supply simulation allocations for custodian/tuple combinations outside the eight-entry Owner inventory; F41 restore uses the same simulation context.

The retained correctness/privacy assertions were not removed or weakened in those diffs. Fourteen F45 tests and C7 were added. Synthetic fixtures are byte-identical to CORR8. This is stronger than trusting the author's census, but it is not proof that every conceivable F1–F44 bypass is absent.

Independent CORR5 admission preserves original bytes and does not adopt live state. CORR6/7/8 histories refuse as native and as legacy. Old-shaped/mixed events refuse under the fixed native schemas. Requester projections are never accepted as complete chains. Lawful native persistence and continuation work. These passing boundaries do not authenticate the origin of a congruently rewritten native history.

## 9. Full defect register

### CORR9-IV1-MAJ-01 — Congruent rehashed mode laundering permits opposite-mode state/evidence adoption

**Severity:** MAJOR. **Deterministic:** YES, reproduced in both directions. **Evidence:** INDEPENDENT_IV1 runtime/source fact. **Affected criteria:** current task §7.E, §7.F–G, §7.H; simulation distinguishability in the accepted allocation record; evidence mode at issuance. **Not a finding of:** actor-facing entitlement bypass, scientific misclassification, or production vulnerability.

**Reproduction inputs and steps:**

1. Construct a SIMULATION session through `simulation_allocations_path` pointing to a byte-identical copy of the exact eight-entry Owner manifest. Use default `SYN_SESSION_001`.
2. Register invented actors and lawfully register tuple `SYN_CASE_001|SYN_SIDE_A|SYN_FACT_001` as `SYN_CUST_001`.
3. Issue and persist a native evidence record. Its recorded mode is SIMULATION.
4. Positive negative-control: restoring that untouched file into a fresh OWNER_PINNED session returns AUTHORITY_CONTEXT_MISMATCH and adopts nothing.
5. In a separate audit-created history file, change GENESIS `allocationAuthorityMode` to OWNER_PINNED and change each issued evidence record's `proceduralCompleteness.allocationAuthorityMode` to OWNER_PINNED. Leave the manifest, its SHA, authorized custodian and entry digests untouched.
6. Recompute every `prevEventSha` and `eventSha`. Envelope verification succeeds.
7. Restore the new file into a fresh OWNER_PINNED session. It returns:

```json
{"restored":true,"eventCount":10,"engineActId":"STAGE2_CORR4_L4_EFCA_OFFLINE_ENFORCEMENT_IMPLEMENTATION_1.CORR9","allocationAuthorityMode":"OWNER_PINNED"}
```

8. Requester `events(SYN_CUST_001)` exposes the adopted issued record as OWNER_PINNED. Lawful registration of tuple 003 and new evidence issuance succeed on the adopted chain.
9. Repeat OWNER_PINNED → SIMULATION by rewriting the same two mode locations and rehashing: restoration, evidence relabelling and continued extension also succeed.

No engine code/private context/pin or allocation-authority bytes were changed. The originating and forged history files are separate; the original persisted file remains intact.

**Exact code path:** `restore_global_history` E 4457–4466 checks only the *declared* mode/digest against the receiving session. `_check_transition` E 2394–2424 repeats that check. E 2944–2956 regenerates expected evidence from that same receiving context, accepting the rewritten mode. E 4470–4471 semantically indexes the history; E 4491–4492 adopts `_events`/`_ix`. Requester projection then returns the rewritten evidence payload. Subsequent authorized transitions extend the adopted state.

**Expected under the current explicit audit contract:** forged cross-mode provenance must not restore as the opposite mode or let simulation-generated evidence claim Owner authority; refusal must leave state unchanged.

**Observed:** both rehashed histories restore successfully, change authoritative component state, expose opposite-mode evidence and remain extendable. The digest/entitlement checks still protect the fixed tuple allocation; they do not authenticate construction/issuance provenance.

**Why this remains a MAJOR rather than being silently exempted:** the existing offline host trust boundary is acknowledged. Source §39 itself allows a filesystem actor to fabricate a fully lawful chain, and older host-channel separation does not authenticate file origin. That explains the mechanism but does not supply an Owner exception to the current brief's explicit rehashed-GENESIS and simulation-evidence criteria. The brief also forbids using source comments as controlling normative authority. This report therefore fails the stronger, explicitly requested mode-provenance claim while retaining the narrower passing actor-boundary result. It does not invent a mandate to implement signatures or a particular new security architecture.

**Author-test coverage gap:** `test_F45_genesis_relabeling_fails`, T 6698–6731, changes a pinned chain's label to SIMULATION but restores it into a **pinned** destination. That tests an incongruent context. The identical-byte tests restore untouched opposite-mode chains. Neither tests changing history and evidence to match the destination. Successful 117/117 reproduction consequently does not discharge this requirement.

**Correction and Owner-methodology adjudication:** no scientific-methodology adjudication is required to recognize the discrepancy. Repair of mode-origin enforcement, or an explicit Owner narrowing of the promise to trusted/unmodified host artifacts, needs a separately authorized bounded act. The auditor neither implements a repair nor selects a new persistence-authority mechanism.

### Carried specification findings, unchanged

The accepted EFCA decision retains `V-IV1-MIN-01`, `V-IV1-MIN-02` and `V-IV1-ADV-01` as open, non-blocking rubric findings. They concern fixture/textual scope and prior-audit UUID metadata. They were not corrected or counted as new CORR9 defects. Their accepted status does not excuse MAJ-01.

## 10. Scientific firewall and trust-model limits

`categoryAssignment = UNASSIGNED`, `tupleLevelName = UNASSIGNED`, and `causeLink = UNASSIGNED_PENDING_J1` remain true in inspected native/legacy/scoped/evidence paths. Category constants are inert names; no actual tuple label or cause is assigned. Phase-1 packets contain exactly `caseId`, `sideId`, `factId`, `sealedFactText`, `questionText`; allocation data did not enlarge that surface. Existing blind-seal/reveal/contamination assertions executed successfully. Historical-record identity attestations remain mechanical provenance, never scientific sufficiency or historical causal adjudication.

No actual historical tuples, disagreement ledger, marks, outcomes or selected sample were used in scenarios. No J-1/J-4 adjudication, J-2/J-3 historical execution, B5.8, final methodology freeze or production integration is claimed.

Authorized scope limits: synthetic actor labels are not authenticated humans; source mutation/monkeypatching/private-memory access are outside the actor boundary; host durability methods must not be exposed to requesters; current hashes do not prove historical purity or detect mutation-and-revert; no multiprocess concurrency guarantee or cryptographic signer was audited. Constructor-selected mode and unchanged-chain context matching work. Authentic mode-of-origin persistence does not; its stronger claim is the reported defect, rather than an assumed external prerequisite already satisfied.

## 11. Source/Git preservation

| Property | Before | After |
|---|---|---|
| Branch | main | main |
| HEAD | 1335d2e23c58d2ff2df4286bbd3d6eff2ace485f | same |
| Staged paths | 0 | 0 |
| Tracked dirty paths | 0 | 0 |
| Untracked paths, expanded | 828 | 828, exact same inventory |
| SHA of expanded porcelain bytes | `1bfe59e3137693ba48ef94e3a97a1639328cb036ef0902fa855fb35ea81f5f64` | same |
| Rehashed source/dependency files | 710 in baseline snapshot | 710; 0 missing/changed |
| Original CORR9 candidate/authority/parent identities | values in §2 | all unchanged |
| Original candidate pycache/pyc residue | none observed | none |
| Original synthetic_runs contents | empty | empty |

The 710-file preservation set covers tracked files and all copied EFCA candidate/authority package dependencies, including the exact candidate, rubric, sidecars, predecessors and semantic contract. This is not a claim to have hashed every unrelated untracked download. Original expanded Git status and every audited original file were preserved. Owner untracked files were never deleted, moved, cleaned or normalized.

Only audit sandbox artifacts were created. No add, commit, push, checkout, branch, merge, fetch, reset or clean was executed.

## 12. Evidence index and final disposition

All following files are in `/private/tmp/mergevue_corr9_iv1_pxytpw33/`:

- `full_suite.log`: actual unchanged 117-test execution.
- `repo/WORKBENCH/AUDITS/STAGE2_CORR4_L4_EFCA_OFFLINE_ENFORCEMENT_IMPLEMENTATION_1_CORR9/TEST_RESULTS.json`: generated sandbox suite results; original file untouched.
- `copied_identity.json`, `preservation_before.json`, `preservation_after.json`: copy/source/Git identity evidence.
- `independent_probes.py`, `independent_results.json`, `independent_probes.log`: new A–L scenarios and actual outcomes.
- `supplemental_probes.py`, `supplemental_results.json`, `supplemental_probes.log`: OD-38, construction-conflict, evidence-schema and implicit-custody probes.
- `mode_origin_contract.py`, `mode_origin_contract_results.json`, `mode_origin_contract.log`: deterministic two-direction MAJ-01 reproduction and controls.
- `offline_efca.py.diff`, `test_offline_efca.py.diff`: exact CORR8→CORR9 comparisons.
- `probe_setup_*.log`: disclosed auditor harness failures, excluded from candidate-defect claims.

**Final overall verdict: FAIL.** The actor-facing F-45 correction and all 117 existing tests pass, but MAJ-01 violates the explicit independent audit criteria. No environmental HOLD prevented mandatory execution. No source repair or acceptance is inferred. Return the finding to the Owner/Orchestrator for a separately bounded decision/correction act; this audit stops here.
