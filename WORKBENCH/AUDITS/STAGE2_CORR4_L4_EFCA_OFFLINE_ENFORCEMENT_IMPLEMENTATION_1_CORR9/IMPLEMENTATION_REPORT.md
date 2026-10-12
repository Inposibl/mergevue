# IMPLEMENTATION REPORT — STAGE2_CORR4_L4_EFCA_OFFLINE_ENFORCEMENT_IMPLEMENTATION_1.CORR9

**Actor:** DeepSeek — CODER (`AGENTS_C.md`)
**Mode:** OFFLINE / SYNTHETIC-ONLY / EXACT SIX-FILE ISOLATED WRITES · **Date:** 2026-10-11
**Scope:** **F-45 ONLY** (independent custody-registration entitlement under Owner-accepted OD-45-A); all verified F-1–F-44 protections retained.
**Status:** `COMPLETE` — the CORR9 six-file implementation candidate is produced and author-self-validated. **This is not independent verification, not Owner acceptance and not Git closure.**
**Self-validation:** PASS — 117/117 author-side tests, exit code 0, preservation/git/residue gates clean. `SELF_VALIDATED` only. No formal Independent IV was prepared, requested or started; no Git mutation was performed.

## Lifecycle

| Field | Value |
| --- | --- |
| `od45a` | `OWNER_ACCEPTED` |
| `g2AllocationAuthority` | `OWNER_ACCEPTED` |
| `g3Corr1AuthorityBinding` | `OWNER_ACCEPTED` |
| `corr9ImplementationAuthorization` | `OWNER_AUTHORIZED` |
| `corr9Implementation` | `CANDIDATE_COMPLETE` |
| `authorSelfValidation` | `PASS` |
| `orchestratorPreflight` | `PENDING` |
| `independentIV` | `NOT_PERFORMED` |
| `ownerAcceptanceOfCorr9` | `NOT_GRANTED` |
| `gitClosure` | `NOT_PERFORMED` |
| `realTupleClassification` | `NOT_PERFORMED` |
| `categoryAssignment` | `UNASSIGNED` |
| `tupleLevelName` | `UNASSIGNED` |
| `causeLink` | `UNASSIGNED_PENDING_J1` |

---

## 1. Exact act identity and authorization

**Act:** `STAGE2_CORR4_L4_EFCA_OFFLINE_ENFORCEMENT_IMPLEMENTATION_1.CORR9`
**Role:** CODER (DeepSeek), under `AGENTS.md` §2 and `AGENTS_C.md`.
**Owner authorization:** `OWNER AUTHORIZES CORR9 G4 IMPLEMENTATION`, limited to implementing the accepted OD-45-A independent custody-registration entitlement rule using the exact G2 Owner-approved allocation authority physically bound through G3.CORR1. Controlling preceding decisions: `OWNER ACCEPTS OD-45-A`; `OWNER ACCEPTS CORR9 ALLOCATION AUTHORITY G2`; `OWNER AUTHORIZES CORR9 ALLOCATION AUTHORITY G3 BINDING`; `OWNER AUTHORIZES G3.CORR1 DOCUMENTARY CORRECTION`; Owner acceptance of the exact G3.CORR1 candidate following Orchestrator preflight PASS.
**Instructions honored:** do not initiate Independent IV; do not commit or push; no assignment of verification work to another agent; stop after returning the six-file package.

## 2. Physical baseline and controlling authority

- **Authorized repository root:** `/Users/entp_psyche/Desktop/InvestProjects2026/MergeVue PayProduct (june 2026)/MergeVue-M&A (August 2026)` (proved physically; every write is inside it).
- **Branch:** `main`. **Baseline HEAD:** `1335d2e23c58d2ff2df4286bbd3d6eff2ace485f` (verified before writing; unchanged at completion).
- **Pre-write state:** 0 staged files, 0 tracked modifications; untracked inventory limited to pre-existing WORKBENCH/act material.
- **Documents read in full or in the required sections before writing:** `AGENTS.md`; `AGENTS_C.md` (role mandate); `MERGEVUE_CAUSALITY_PROOF_AND_AGENT_CONTROL.md`; `skills/mergevue-agent-quality-gate/SKILL.md`; `docs/governance/MERGEVUE_GIT_WORKTREE_CLOSURE_GOVERNANCE_2026-09-05.md`; the accepted EFCA rubric (§D.4, §G, §I) at its Owner-pinned identity; OD-37/OD-38/OD-39 as recorded in the accepted CORR6 package and the engine's §27–§31; OD-45-A and the G2/G3/G3.CORR1 authority records; the CORR6 compatibility guardrail (§30/§31 of the engine docstring); the CORR9 design-preflight lineage (PREFLIGHT-1 → CORR1 → CORR2, P-45-1…P-45-7 resolutions as recorded in the bound acts and the project's session records — the preflight documents themselves are not present on disk in this repository; no preflight claim is used here as authority, only the resulting Design that the Owner approved as G2/G3 bytes and the brief's own clauses).
- **Accepted EFCA rubric (verified byte-exact):** `5bb887d269e9079754e5a4f7417cd08f58d4ad5d5ff14503ca1dd98646176eba` (97,712 B) at `WORKBENCH/AUDITS/STAGE2_CORR4_L4_EFCA_OWNER_ACCEPTANCE_BINDING_1/EFCA_CORR2_CORR2_CORR1_CORR1_CORR1_CORR1_GPT6_AUTHOR_CANDIDATE.md`; sidecar `SHA256SUMS.txt` present and used by the engine's live/replay identity gate.
- **No mismatch** between the brief's mandated identities and the physical tree: no stop condition was triggered.

## 3. CORR8 source identities and preservation checks

Every CORR8 identity recomputed by `shasum -a 256` during baseline verification **and** re-verified at completion (identical before/after; the suite also snapshots the CORR8 engine and suite bytes before and after the run):

| CORR8 file (`…_CORR8/`) | SHA-256 | Bytes |
| --- | --- | ---: |
| `offline_efca.py` | `b5ccce54527b23bff1a683c06ec47a3196f760436e458cd90c031da92db6a17f` | 202,466 |
| `test_offline_efca.py` | `1a770ca54e36bbb6e22d31e276b828138a60f6066652b273bbab27f2faf0c292` | 319,040 |
| `synthetic_fixtures.json` | `67de9301963539886fb43b2e3138c90d42c62d528fd715c848ea42116e4acd8c` | 6,497 |
| `TEST_RESULTS.json` | `5f778e48641e4dd1759b5c2eff8bea55f3b618bad80e09c655610a5222338074` | 146,678 |
| `IMPLEMENTATION_REPORT.md` | `45c08fb0b3779370835f7334819e6f33102735a189ecffb8a2c6866a99062e75` | 12,008 |
| `ACT_MANIFEST.json` | `7e008febba01f0fa16b1fc7ce5e4b36936f14adf21a8e476c641aba4d6f40066` | 11,185 |

The CORR8 102-test suite is the regression baseline; CORR8 is a non-adoptable predecessor and the F-45 reproduction oracle (loaded only after its exact SHA-256 is verified). Nothing under the CORR8 directory was written.

## 4. G3.CORR1 identity and approval basis

Read-only authority directory `WORKBENCH/AUDITS/STAGE2_CORR4_L4_EFCA_CORR9_ALLOCATION_AUTHORITY_1_CORR1/`, verified byte-exact:

| File | SHA-256 | Bytes |
| --- | --- | ---: |
| `EFCA_CORR9_ALLOCATIONS_v1.json` | `53eb3ec43feb4de926e057e0dc17a857473872e4bbc9ff571e5937576c38ecb1` | 716 |
| `EFCA_CORR9_ALLOCATIONS_v1.json.sha256` | `8209554567f29c1dd0c10a9b50a4ff7f7c6ceef99012387d2a87db58b975a59d` | 97 |
| `README.md` | `35ddeea82a0189a0b64f5c62ba0581eaf6c705bc5566b3c3c2ef7226d352eb55` | 7,380 |
| `ACT_MANIFEST.json` | `577cbbcc675fc2e69fac46787242491565e97a1372dd5913e909aebbb1f4e286` | 6,790 |

Contents verified: exactly eight allocations, every designated custodian `SYN_CUST_001`, unique tuple keys, canonical encoding (sorted keys, compact separators, one trailing newline), no real historical data. The manifest is read-only controlling authority: no CORR9 engine code invents, allocates, transfers or replaces custody authority; the authority directory was never written to. Approval basis: G2 Owner acceptance of the bytes; G3 physical binding; G3.CORR1 documentary correction (G3-F01/F02/F03); G4 authorization naming this digest.

## 5. Precise code changes by class, method and event

**`offline_efca.py`** (module docstring; constants; module functions; `EFCASession`):

| Location | Change |
| --- | --- |
| Module docstring | Act identity → CORR9; new §35–§39 (F-45 entitlement, authority modes, GENESIS/registration schemas, evidence marking, trust-model honesty); trust-model section gains the CORR9 allocation-authority boundary sentence. |
| Constants | `ENGINE_ACT_ID` → CORR9; new `CORR8_ENGINE_ACT_ID` / `CORR8_ENGINE_SHA256`; new `ALLOCATION_AUTHORITY_ID`, `ALLOCATION_FILE_NAME`, `OWNER_ALLOCATIONS_SHA256`, `AUTHORITY_MODE_OWNER_PINNED`, `AUTHORITY_MODE_SIMULATION`, `ALLOCATION_AUTHORITY_MODES`, `ALLOCATION_ENTRY_KEYS`, `ALLOCATION_DOCUMENT_KEYS`, `NOT_ENTITLED_MESSAGE`, `DEFAULT_ALLOCATIONS_PATH`. |
| New module functions | `_allocation_entry_digest(tuple_key, custodian)`; `_parse_allocation_document(document, where)`; `_decode_allocation_bytes(raw, where)`; `_load_pinned_authority(path)`; `_load_simulation_authority(document, path)`; new class `AllocationAuthority` (immutable `mode`/`digest`/`custodian_for`/`size`). |
| `_make_genesis` | New signature `(session_label, allocations_sha256, allocation_authority_mode)`; payload gains the two authority fields. |
| `EVENT_PAYLOAD_SCHEMAS` | `GENESIS` key set gains `allocationsSha256`, `allocationAuthorityMode`; `TUPLE_REGISTERED` key set gains `allocationDigest`. `LEGACY_EVENT_PAYLOAD_SCHEMAS` untouched (frozen CORR5 shape). |
| `_index_event` / `_historical_adjudication_gates_in` / `_check_transition` | Native rule-set label `"CORR6"` → `"CORR9"` (defaults and replay calls). |
| `_check_transition` — `GENESIS` | LEGACY branch returns unchanged; native branch validates mode ∈ modes, digest hex64, and compares the **(mode, digest) pair** against `ctx["allocationAuthority"]` → `AUTHORITY_CONTEXT_MISMATCH`. |
| `_check_transition` — `TUPLE_REGISTERED` | Entitlement (`NOT_ENTITLED`) and engine-derived `allocationDigest` equality (`INVALID_TRANSITION`) enforced on live **and** replay, **before** the occupancy lookup; `DUPLICATE_TUPLE` moved after them. LEGACY untouched. |
| `_evidence_record_payload_in` | New `authority_mode` parameter; native `proceduralCompleteness` gains `allocationAuthorityMode` (legacy snapshot byte-identical). |
| `_check_transition` — `EVIDENCE_RECORD_ISSUED` | Expected payload constructed with `ctx["allocationAuthority"].mode` (native) / `None` (legacy). |
| `EFCASession.__init__` | New keyword parameters `allocations_path`, `simulation_allocations`, `simulation_allocations_path`; authority loaded and verified **before** any session state; mode-conflict combination refused; `self._ctx` gains `allocationAuthority`; GENESIS minted with the derived pair. |
| `EFCASession.register_tuple` | Mandatory 5-step ordering (actor → state-independent input → entitlement → own occupancy → lawful transition); fixed `NOT_ENTITLED`; `allocationDigest` computed and returned. |
| `EFCASession.issue_evidence_record` | Passes the session's derived mode into the payload constructor. |
| `EFCASession.persist_global_history` / `restore_global_history` | Host returns gain `allocationAuthorityMode`; restore pre-checks the chain's (mode, digest) pair against the session's context **before** any replay and adopts nothing on mismatch; `NOT_A_NATIVE_HISTORY` message updated for CORR5–CORR8. |
| `replay_legacy_history` | Unchanged (frozen CORR5 rule-set; CORR9-native chains are refused as non-legacy). |

**`test_offline_efca.py`:** header/docstring for CORR9; new paths/constants (`CORR8_DIR`, `CORR8_ENGINE_SHA`, `CORR8_TEST_SUITE_SHA`, `CORR9_AUTHORITY_FILE_SHA`, `ALLOCATIONS_PATH`, `ALLOCATIONS_SIDECAR_PATH`, `CUST2`, `KEY_002A/009A/077A/088A`, `ACT_DIR_RELATIVE` → CORR9); new loaders `corr8_engine()`; new helpers `alloc_entry_digest`, `sim_doc`, `EFCAUnitTest.sim_session`; `new_session` now passes through engine kwargs; snapshot/preservation extended with CORR8 engine + suite and the CORR9 authority + sidecar; REPORT gains the correction ledger and the `allocationAuthority` evidence block; new classes `Corr9EntitlementTests` (14 tests) and `Corr9LineageTests` (C7).

**`synthetic_fixtures.json`:** byte-identical copy of the CORR8 fixtures (`67de9301…4acd8c`, 6,497 B) — verified by `cmp`.

## 6. Registration authorization ordering

`register_tuple` implements exactly the mandated effective order:

1. **actor identity and role** — `_require_synthetic_actor_in(…, "CUSTODIAN")`;
2. **state-independent request-input validation** — closed spec schema, synthetic identifiers for `caseId/sideId/factId/d`, synthetic texts, mark shape, authenticated retrospective records, engine-computed `canonicalHashInput` check;
3. **tuple-specific entitlement** — `authority.custodian_for(key)`; missing entry or a different custodian raises the fixed `NOT_ENTITLED` (one code, one message) **before any occupancy lookup**;
4. **only for an entitled actor** — own registration/occupancy (`DUPLICATE_TUPLE`);
5. **lawful transition** — `TUPLE_REGISTERED` carrying the engine-derived `allocationDigest`.

An unauthorized requester receives the identical refusal for an unregistered/unallocated key, a key allocated to another custodian and a key already registered under another custodian's custody; the message names no tuple, custodian, allocation or occupancy detail; denied attempts append nothing and mutate no requester-visible state. Entitled custodians receive truthful own-registration information (including their own `allocationDigest`). No API, event or caller can reassign, transfer or replace an entitlement; exactly one effective custodian per tuple is representable.

## 7. Owner-pinned versus simulation construction

- **OWNER_PINNED** (default, non-override): loads `DEFAULT_ALLOCATIONS_PATH` (the G3.CORR1 artifact, resolved relative to the module — stable across working directories) or an explicitly supplied `allocations_path`; the file must hash to `OWNER_ALLOCATIONS_SHA256`; a missing file fails `ALLOCATIONS_AUTHORITY_UNAVAILABLE`, a non-pinned file fails `ALLOCATIONS_IDENTITY_MISMATCH`. A caller cannot replace the Owner pin by supplying a matching hash for their own manifest, and a hash computed from arbitrary supplied JSON is never treated as proof of Owner approval.
- **SIMULATION** (explicitly named test-only parameters `simulation_allocations` / `simulation_allocations_path`): always produces `SIMULATION`, never `OWNER_PINNED`, even for byte-identical Owner-manifest bytes; the engine computes the digest itself; combining a pinned path with a simulation source fails `ALLOCATIONS_MODE_CONFLICT`; there is **no parameter that sets the mode**, so no caller-supplied mode claim exists to spoof.
- **Exact cross-mode invariant (regression-verified):** a simulation session built from the byte-identical Owner manifest declares the same digest but mode SIMULATION; a pinned session refuses that chain and the simulation session refuses the pinned chain (`AUTHORITY_CONTEXT_MISMATCH`), in both directions; each still restores its own chains; two different simulation manifests also refuse each other.
- Requester-facing surfaces expose no inventory and no authority identifiers; simulation labels appear only where required (evidence record, chain GENESIS) or permitted (host-channel returns).

## 8. New GENESIS and TUPLE_REGISTERED schemas

- **GENESIS (native, exact):** `{engineActId, sessionLabel, syntheticOnly, allocationsSha256, allocationAuthorityMode}`. Both authority values are immutable attributes of the native session, derived at construction. Replay compares the pair with the receiving session's trusted construction context and refuses restoration without partial state adoption on mismatch.
- **TUPLE_REGISTERED (native, exact):** previous key set + `allocationDigest`, where the digest = `sha256(canonical_bytes({"custodian": c, "tupleKey": k}))` over the tuple's exact authorized entry; recomputed from the verified effective manifest on live and replay. A registration with a missing, incorrect or mismatched digest — or without a matching entitlement — is refused, so recomputing the event-chain hashes never makes an unauthorized registration lawful.
- **Exact schema discipline:** old-schema GENESIS or TUPLE_REGISTERED events inside a CORR9-native history fail validation (dropping either genesis authority field is refused pre-replay as `AUTHORITY_CONTEXT_MISMATCH`); a genesis whose act id is dropped fails as `NOT_A_NATIVE_HISTORY`. No old schema was relaxed; the frozen CORR5 legacy schemas are untouched; CORR5–CORR8 histories are never relabelled CORR9-native (their GENESIS names their own act).

## 9. Evidence-record authority-mode treatment

The engine-constructed `proceduralCompleteness` snapshot gains `allocationAuthorityMode` (OWNER_PINNED or SIMULATION), constructed identically on the live and replay paths and compared by full-payload equality against the engine constructor. Simulation-generated evidence is affirmatively labelled SIMULATION and claims no Owner authorization; the record contains neither the allocation digest, nor the inventory, nor any global authority identifier (asserted by test); the Phase-1 packet surface remains exactly five fields; no additional scientific claim or adjudication arises from an allocation record. The mode appears on engine-host channel returns (host-level only). Requester projections carry no authority claim at all; none was added.

## 10. Live/replay equivalence

The same `_check_transition` validator serves live transitions and replay: GENESIS pair check, entitlement check and `allocationDigest` recomputation run identically on both paths, plus the engine-constructed evidence payload. The regression suite verifies: genuine pinned round trip reproduces scoped views byte-identically and remains extendable; simulation histories round-trip within their own context; forged or relabelled histories (correctly rehashed) fail semantic replay; refusals leave state untouched.

## 11. Compatibility with CORR5–CORR8

- **CORR5 legacy:** unchanged read-only admission through `replay_legacy_history` under the frozen CORR5 rule-set (differentially verified against the pinned CORR5 engine by the retained C2 test); original bytes preserved; never adopted or extended.
- **CORR6/CORR7/CORR8:** byte-pinned and non-adoptable; a genuine CORR8 chain is refused by native restore (`NOT_A_NATIVE_HISTORY`) and by legacy admission (`NOT_A_LEGACY_HISTORY`); CORR9 chains are likewise never adopted as legacy. Mixed-version histories fail closed; no per-event schema sniffing exists.
- All immutable predecessor identities verified byte-exact (CORR8 engine + suite, CORR7, CORR6, CORR5, CORR4, CORR3, CORR2, CORR1, ORIGINAL engines, rubric, sidecar, semantic successor contract).

## 12. Full test results and adaptations

**Command (from the CORR9 act directory):** `PYTHONDONTWRITEBYTECODE=1 python3 test_offline_efca.py`
**Final frozen run: exit code 0 — Ran 117 tests — OK (117 passed / 0 failed / 0 errors / 0 skipped).**
Census: 42 T-family (retained), 54 F-family F1–F44 (retained), 6 C-family C1–C6 (retained), **14 new F-45 tests**, **1 new C7** lineage test. `TEST_RESULTS.json` records every test id, gate, expectation, observed outcome, duration, the source-preservation before/after snapshot, the git-state comparison, the residue census and the allocation-authority evidence block (`suiteOutcome PASS`, `sourcePreservationIntact true`, `gitStateClean true`, `noResidue true`).

**Retained-suite adaptations (contract-based ledger; no assertion weakened):**

| # | Site | Adaptation | Basis |
| --- | --- | --- | --- |
| 1 | `test_F9_cross_session_persistence_isolation` | the hand-built lawful "ahead" `TUPLE_REGISTERED` payload gained the engine-derived `allocationDigest` (mirror-computed for `005|A|005` → `SYN_CUST_001`) | CORR9-native exact schema; the scenario tests stale-writer lineage, not schema forgery — the extension must stay restorable |
| 2 | `test_F15_forged_flags_and_missing_extra_fields_refused` | the forged `009|A|009` payload gained its correct `allocationDigest` | preserves the test's intent: the refusal exercised is the missing/flipped `synthetic` flag, not an accidental schema or entitlement mismatch |
| 3 | `test_F15b_every_event_type_missing_or_extra_keys_refused` | expected-code map: dropping the GENESIS `allocationsSha256` or `allocationAuthorityMode` now yields `AUTHORITY_CONTEXT_MISMATCH` (the pre-replay construction-context check fires first); the `drop_engineActId` case remains `NOT_A_NATIVE_HISTORY`; all other mutations remain `PROCEDURALLY_INVALID_HISTORY` | OD-45-A: a genesis without the effective context no longer describes this session; refusal is strictly earlier, never weaker |
| 4 | `F19`, `F23`, `F37` (×2), `F40`, `F41` (×2), `F44_orders` | the session is an EXPLICIT simulation session declaring exactly the tuples it registers (e.g. `{(001|A, SYN_CUST_001), (002|B, SYN_CUST_002)}`); `F41`'s host restore uses a matching simulation session | OD-45-A: those scenarios need custodian/tuple combinations outside the eight Owner-approved allocations; the Owner manifest was NOT broadened and no catch-all inventory was introduced |

No scientific, confidentiality, blindness or replay assertion was changed; F-40…F-44 protections remain exercised (their reproduction sides remain pinned to the immutable predecessor engines).

**Post-freeze documentary correction:** a retained CORR8-era class docstring in `test_offline_efca.py` (`Corr8SubmissionIdentityTests`) still described F-45 in the present tense as an unresolved residual — accurate for the CORR8 act, stale for CORR9. The docstring was corrected (no test code, assertion or name changed) and the suite was re-run to regenerate the authoritative `TEST_RESULTS.json` (same outcome: 117/117 PASS, exit 0). The act manifest binds the post-correction identities of both files.

## 13. Adversarial regression findings

New F-45 evidence (all synthetic):
1. **Parent reproduction** — on the immutable CORR8 engine, `SYN_CUST_002` first-writer captures both an unallocated key and a key the Owner authority assigns to another custodian; on CORR9 both are refused and only the entitled custodian registers.
2. **Uniform refusal** — one identical code AND message across the unregistered/unallocated, foreign-allocated and foreign-registered states; no tuple, custodian or occupancy detail; polling stable; zero mutation.
3. **Lawful success** — entitled registration returns the mirror-verified `allocationDigest`; replay reproduces it; own duplicate refuses truthfully (`DUPLICATE_TUPLE`) without mutation; other entitled registrations still succeed.
4. **Actor/tuple mismatch** — correct tuple/wrong custodian and correct custodian/wrong tuple both give the same fixed `NOT_ENTITLED`.
5. **Authority integrity** — tampered (canonical) file → `ALLOCATIONS_IDENTITY_MISMATCH`; missing file → `ALLOCATIONS_AUTHORITY_UNAVAILABLE`; non-canonical encoding, wrong identifier, unknown entry field, malformed identifiers → closed-schema refusals; duplicate allocation → `ALLOCATION_CONFLICT`; combined construction forms → `ALLOCATIONS_MODE_CONFLICT`; the pinned construction still works afterwards.
6. **Identical-byte cross-mode collision** — simulation with the exact Owner manifest bytes: same digest, mode SIMULATION, differing GENESIS; cross-mode restore refused both directions; each context restores its own chain.
7. **Different-manifest cross-mode refusal** — pinned ↔ simulation and simulation ↔ simulation (different digests) refused; same-document contexts restore; no constructor mode parameter exists (`inspect.signature` assertion) and an unexpected `allocationAuthorityMode` kwarg is rejected by Python itself.
8. **Correctly rehashed forgery** — unauthorized-custodian registration, wrong-digest, absent-digest and whole-chain custodian substitution (all hashes recomputed) each fail `PROCEDURALLY_INVALID_HISTORY`; the unmodified chain restores.
9. **GENESIS relabelling** — fully rehashed mode flip and fabricated digest refused; untouched chain restores. Trust boundary documented, not overclaimed.
10. **Persistence** — pinned round trip byte-identical scoped views, host channel reports OWNER_PINNED, extension works, second round trip covers it; simulation durability within its own context.
11. **No foreign authority inference** — registration/custody/status/category/Lane B/diagnostics probes disclose no foreign custodian, tuple or occupancy detail; refusals leave chain and scoped views byte-identical.
12. **No implicit custody** — pre-registration Lane B filings and exposure self-disclosures (OD-39/F-41 preserved) create no custody; the entitled custodian registering later sees them exactly as lawful pre-registration recordings.
13. **Evidence-record marking** — OWNER_PINNED vs SIMULATION recorded correctly; no digest/inventory/authority identifier in the record; rehashed mode flips fail semantic replay both directions; genuine round trip preserves the recorded mode.
14. **Ordering** — competing custodians in both orders: the unauthorized refusal is identical before and after the lawful registration; custody never transfers.
15. **C7 lineage** — CORR8 engine/suite byte-pinned, chains non-adoptable and non-legacy; CORR9 chains not adoptable as legacy; the Owner authority file byte-pinned.

## 14. Failed runs and corrections

| Run | Outcome | Cause | Repair |
| --- | --- | --- | --- |
| smoke 1 (pre-suite) | `NON_SYNTHETIC_IDENTIFIER` at construction | the loader validated the custodian with a pattern lookup that does not exist for `custodian` (actor patterns live under `CUSTODIAN`) | dedicated `SYN_ACTOR_PATTERNS["CUSTODIAN"]` check in `_parse_allocation_document` |
| suite 1 (102 retained) | 92 PASS / 1 FAIL / 9 ERROR | exactly the predicted adaptation set (8 scenario windows needing simulation, 2 forged-payload/F15b schema items) | the 4-row adaptation ledger in §12 — no source or assertion weakened |
| suite 2 (102 retained) | 102 PASS | — | — |
| suite 3 (117) | 115 PASS / 1 FAIL / 1 ERROR | two authoring mistakes in the NEW tests: `sim.register_all()` (helper is on the test class, not the session); `SYN_CUST_002` not registered before its refusal probe | `self.register_all(sim)` / `sim.register_actor(CUST2, "CUSTODIAN")` |
| suite 4 (117) | 116 PASS / 1 ERROR | second `sim.register_all()` occurrence in another new test | same helper correction |
| suite 5 (117) | 116 PASS / 1 FAIL | `SYN_CUST_002` missing from the simulation session's actor registry in the no-implicit-custody test | registered the actor in the simulation session |
| suite 6 (117) | 117 PASS, exit 0 | — | — |
| final frozen run | 117 PASS, exit 0 | — | — |

No production source or retained assertion was weakened to obtain a green run; all repairs were confined to the two CORR9 writable files.

## 15. Scope and preservation checks

- Writes only under `…_CORR9/`: the six final files plus the empty disposable `synthetic_runs/` (verified empty at completion).
- No writes to ORIGINAL, CORR1–CORR8, the allocation-authority directories, the rubric, sidecars, decisions, contracts, governance, `src/`, `api/`, `scripts/`; no governance edits; no Git operations (no add/commit/push/checkout/branch/merge); `git diff --check` clean.
- Authorized-scope verification at completion: HEAD `1335d2e23c58d2ff2df4286bbd3d6eff2ace485f` unchanged; 0 staged; no tracked modifications; untracked growth limited to exactly the CORR9 act directory; no `__pycache__`/`.pyc`/scratch residue; all predecessor and authority hashes recomputed and identical before/after.
- The suite itself snapshots rubric, sidecar, semantic contract, CORR9 authority + sidecar, CORR8 engine + suite and CORR1–CORR7/ORIGINAL engines before and after the run and refuses to exit 0 on any drift.

## 16. Remaining limitations

- Author self-validation is not independent IV and not Owner acceptance; a passing author suite does not prove scientific predictive quality, production readiness, deployment fitness or security certification.
- The offline trust model is unchanged and is stated in §39 of the engine: with no external signature, a process/filesystem-level actor can edit the engine's own pin constant or fabricate an entirely procedurally-lawful chain; the (mode, digest) binding protects the API contract, not a privileged process. No signer, secret, PKI or host authority was invented.
- Registered simulators remain test-only constructs; they are permanently distinguishable and never Owner-approved authority, but a real deployment would still need an out-of-scope authority-distribution decision.
- F-45's resolution concerns *registration authorization* only; custodian assignment/replacement beyond the immutable mapping, Lane B delivery policy and any J-1/J-3 scientific work remain outside this act (`causeLink = UNASSIGNED_PENDING_J1`).
- The two retained MINOR findings and one ADVISORY of the accepted rubric remain documented and open; nothing in this act touches them.

## 17. Explicit absence of formal Independent IV, Owner acceptance and Git closure

No formal Independent IV was initiated, requested or prepared; no verification work was assigned to another agent; the Orchestrator's preflight is `PENDING`. Owner acceptance of CORR9 is `NOT_GRANTED`. No Git add/commit/push/checkout/branch/merge occurred; closure is `NOT_PERFORMED` and remains the Owner's decision via the Git agent. No real historical tuple was executed; no classification of the 1,094 frozen disagreements, no category assignment, no J-1/J-4, no J-2/J-3, no B5.8; no new scientific thresholds; no blind-reviewer contamination; no production wiring or deployment. No further act (CORR10 or otherwise) is started or authorized by this report.
