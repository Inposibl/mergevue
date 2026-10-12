# AUDIT LINEAGE — CORR9 OFFLINE EFCA ENFORCEMENT

**Act:** `CORR9-OWNER-ACCEPTANCE-BINDING-1`
**Recorded by:** Claude, documentary author. This file reports what the audits said and where their bytes are. It does not re-audit anything.

---

## 1. Sequence

```text
2026-10-11  CORR9 implementation candidate (DeepSeek, CODER)            self-validation 117/117
2026-10-11  CORR9.IV1 (Codex, AUDITOR)                                  FAIL — 0 BLOCKING / 1 MAJOR
               └─ CORR9-IV1-MAJ-01  congruent rehashed mode laundering
2026-10-11  Owner selects MAJ-01 Option B (trusted-host boundary)
2026-10-11  Option B contract authored (GPT-6 / Orchestrator)           13,499 bytes, 1cf24018…aff2
2026-10-12  Option B contract IV1 (Codex, AUDITOR)                      PASS — 0/0/0/2 ADVISORY
2026-10-12  Owner accepts the exact contract bytes
2026-10-12  CORR9.IV2 (Codex, AUDITOR) on the unchanged candidate        PASS — 0 new findings
2026-10-12  Owner accepts CORR9 — offline synthetic-only / trusted-host
2026-10-12  this documentary package (Claude)                            candidate, not verified
```

Dates come from the report headers (America/Asuncion) and file modification times. The Owner-decision rows are dated from their order in the audit evidence and the current Owner instruction. No standalone timestamped Owner decision file exists for them.

## 2. Actors and independence

| Act | Author | Independent auditor | Independence basis |
|---|---|---|---|
| CORR9 implementation | DeepSeek (CODER) | — | — |
| CORR9.IV1 | — | Codex | IV1 §1: no CORR9 implementation or design authored in that session |
| Option B contract | GPT-6 / Orchestrator (per IV2 §1) | — | — |
| Contract IV1 | — | Codex | contract IV1 §1 |
| CORR9.IV2 | — | Codex | IV2 §1 |
| This package | Claude (ANALYST, documentary author) | **not yet assigned** | Claude authored this package and must not verify it (`AGENTS_A.md` §3; Model Routing §8) |

All three audits were run by Codex, so the audit chain shares one model family. The routing policy (§8) prefers different families but does not require them. Recorded as a fact, not a defect.

## 3. CORR9.IV1 — original FAIL (preserved)

| Field | Value |
|---|---|
| Act | `STAGE2_CORR4_L4_EFCA_OFFLINE_ENFORCEMENT_IMPLEMENTATION_1.CORR9.IV1` |
| Verdict | **FAIL — 0 BLOCKING / 1 MAJOR / 0 new MINOR / 0 new ADVISORY** |
| Regression | 117/117 reproduced, exit 0 |
| Report (original) | `/private/tmp/mergevue_corr9_iv1_pxytpw33/INDEPENDENT_IV1_REPORT.md` — 36,450 bytes — `2194b20106e9da2fa792ef3d4c29b26ec79b6b0180b86a959dc1c11464ea237a` |
| Report (copy) | `ARCHIVED_EVIDENCE/CORR9_IV1/INDEPENDENT_IV1_REPORT.md` — byte-identical |
| MAJ-01 reproduction | `mode_origin_contract.py` (`f1cc880d…8f53`), `mode_origin_contract_results.json` / `.log` (`b2935d69…af64` — identical bytes) |
| Prior pin of these bytes | all 12 copied IV1 files appear in IV2 `preservation_before.json` → `external`, with matching SHA-256 |

**CORR9-IV1-MAJ-01, as issued (IV1 §9):** a SIMULATION-native history can have its GENESIS `allocationAuthorityMode` and each issued evidence record's `proceduralCompleteness.allocationAuthorityMode` rewritten to OWNER_PINNED. After a full `prevEventSha`/`eventSha` rehash, it restores into a fresh OWNER_PINNED session. The requester then sees the evidence as OWNER_PINNED, and lawful extension continues. The converse direction also succeeds. Untouched opposite-mode histories are correctly refused (`AUTHORITY_CONTEXT_MISMATCH`).

IV1 says explicitly that this is **not** an actor-facing entitlement bypass, a scientific misclassification or a production vulnerability. It is the absence of an origin anchor (`restore_global_history` checks the declared mode against the receiving context, E 4457–4466; adoption at E 4491–4492).

Disposition: **not repaired.** Owner chose Option B and risk-accepted the finding for the bounded scope. The finding remains MAJOR and remains the reason IV1 is a FAIL.

## 4. Option B contract IV1 — PASS

| Field | Value |
|---|---|
| Act | `CORR9-MAJ01-OPTIONB-CONTRACT-ALIGNMENT-1.IV1` |
| Verdict | **PASS — 0 BLOCKING / 0 MAJOR / 0 MINOR / 2 ADVISORY** |
| Input | `/Users/entp_psyche/.codex/attachments/497416a3-2dca-49e4-8384-a63f6f82e56f/Pasted text.txt` |
| Exact capture | `/private/tmp/mergevue-optionb-contract-iv1-2wvtrxgl/candidate-exact.txt` |
| Contract identity | 13,499 bytes — `1cf24018e947c389ab3a4875d6223aa7c496df15fb9c33b4466f64fdab44aff2` |
| Report (original) | `/private/tmp/mergevue-optionb-contract-iv1-2wvtrxgl/INDEPENDENT_CONTRACT_AUDIT_REPORT.md` — 44,075 bytes — `e26272de9422800f1f235ec4c242d3e6e1526fc5a80efb10a45a0c326489a52a` |
| Report (copy) | `ARCHIVED_EVIDENCE/OPTIONB_CONTRACT_IV1/INDEPENDENT_CONTRACT_AUDIT_REPORT.md` — byte-identical |
| Prior pin | report and capture appear in IV2 `preservation_before.json` → `external` |

Carried advisories (contract IV1 §8, IV2 §14). **Both OPEN, not closed by this package:**

- `ALIGN-IV1-A01` — RV-01 cites the six-file act but does not embed the hash table, rubric SHA or original audit identity. Optional identity appendix. *This package's `EVIDENCE_INDEX.json` gives that identity record externally. It does not change the contract and does not close A-01; closing A-01 needs a separate disposition.*
- `ALIGN-IV1-A02` — TB-01 names construction, persistence and restoration, but `register_actor`, identity binding and constructor inputs are also trusted-setup surfaces. Optional annotation.

## 5. CORR9.IV2 — revised PASS

| Field | Value |
|---|---|
| Act | `STAGE2_CORR4_L4_EFCA_OFFLINE_ENFORCEMENT_IMPLEMENTATION_1.CORR9.IV2` |
| Verdict | **PASS — new findings 0 BLOCKING / 0 MAJOR / 0 MINOR / 0 ADVISORY**, strictly within the revised offline synthetic trusted-host scope |
| Regression | 117 executed / 117 passed / 0 failed / 0 errors / 0 skipped; Python 3.9.4; exit 0. Status `AUTHOR-TEST-REPRODUCED` (independent execution of author-designed assertions) |
| Independent probes | 8 of 8 groups PASS: RV03-F45, RV04-CONSTRUCTOR, RV05-RV06-RV08-BIDIRECTIONAL, RV07-SEMANTIC, RV09-REQUESTER-HOST, RV07-RV08-INV07-INV08, RV07-PHYSICAL-GATE-AND-NATIVE-DURABILITY, RV07-LEGACY-NATIVE-MIXED-SCHEMA |
| API inventory | 30 public/setup/host entrypoints; 24 requester-scoped or constant; no requester→host self-call path |
| Report (original) | `/private/tmp/mergevue_corr9_iv2_odn67a24/INDEPENDENT_IV2_REPORT.md` — **46,428 bytes** — `563d9ba44ae9cc6cadbcc5a4bbdcc98f4454cba5b483e423a5ded2c96217fd72` |
| Report (copy) | `ARCHIVED_EVIDENCE/CORR9_IV2/INDEPENDENT_IV2_REPORT.md` — byte-identical |
| IV2's own evidence index | `evidence_index.json` (`955b958a…26a7`) lists 65 files. Re-checked 2026-10-12: **65/65 match**; the only file not in the index is the index itself |
| Preservation | `preservation_comparison.json`: 710 repository files and 19 external files unchanged; HEAD `1335d2e`; 0 tracked dirty; 828 untracked; porcelain SHA `1bfe59e3…5f64` |

**MAJ-01 in IV2 (§7):** reproduced again, in both directions, with adopted state and lawful extension. Disposition: *known MAJOR, original IV1 FAIL, Owner-risk-accepted only for the bounded trusted-host synthetic scope; not a new in-scope failing defect in IV2.* IV2 adds that if a caller holding the session object is an untrusted requester in a later workflow, the same success becomes an in-scope defect there, and NG-01 does not excuse it.

**What IV2 PASS does not prove (IV2 §§1, 9.B, 11, 12):** authenticated history origin; OS, process or filesystem isolation; caller authentication; deployed or public-web safety; historical scientific validity; Owner acceptance on the Owner's behalf. Host access control and file-source trust are **assumptions**, not mechanisms implemented by the component.

## 6. Carried findings register (unchanged)

| ID | Severity / status | Origin |
|---|---|---|
| CORR9-IV1-MAJ-01 | MAJOR / original IV1 FAIL / Owner-risk-accepted, bounded | CORR9.IV1 |
| ALIGN-IV1-A01 | ADVISORY / OPEN | contract IV1 |
| ALIGN-IV1-A02 | ADVISORY / OPEN | contract IV1 |
| V-IV1-MIN-01 | MINOR / OPEN | EFCA rubric IV1 (EFCA decision §3.3) |
| V-IV1-MIN-02 | MINOR / OPEN | EFCA rubric IV1 |
| V-IV1-ADV-01 | ADVISORY / OPEN | EFCA rubric IV1 |

No finding was closed, downgraded or re-worded by this package.

## 7. Evidence-integrity notes

- Each audit says it made harness corrections to its **own** probe scripts and kept the failure logs (IV1 §3; IV2 §6). The CORR9 candidate source and assertions were not changed. The IV2 failure logs are archived.
- IV2 `preservation_before.json` and `preservation_after.json` are byte-identical (`0fab9287…f5a2c`). That is consistent with "no change" because the records hold no timestamps.
- The CORR9 candidate directory also has an empty `synthetic_runs/` scratch directory. Its manifest declares it, IV1 and IV2 observed it, and it was still empty on 2026-10-12. It is not one of the six identity-bearing files.
