# CONTROL TREE STATUS PROPOSAL — CORR9 OFFLINE EFCA ENFORCEMENT

**Act:** `CORR9-OWNER-ACCEPTANCE-BINDING-1`
**Status:** **PROPOSAL ONLY. Not controlling. Not an edit to governance.**
**Author:** Claude, documentary author

Nothing in this file changes `docs/governance/MERGEVUE_CONTROL_TREE_v2.1_2026-09-04.md`, `docs/governance/MERGEVUE_CONTROL_TREE_CURRENT_STATUS_INTEGRATION_ADDENDUM_2026-10-10.md`, the frozen CORR4 node matrix, or any decision record. A later, separately authorized governance-binding act must decide whether to adopt any of it.

---

## 1. Where this workstream currently sits in the Control Tree

| Check | Result |
|---|---|
| Base tree v2.1 sidecar | `360bafa2…7128` — physical file matches |
| Current-status overlay 2026-10-10 sidecar | `6ad007cc…9eb61` — matches; bound at `33ed680` |
| Frozen CORR4 matrix | `621eca0a…8a97` — matches the identity the overlay binds |
| Later numbered Control Tree | none found in `docs/governance/` |
| Matrix node covering EFCA L-4 offline enforcement / CORR9 | **none.** The 63 nodes were searched for `L-4`, `L4`, `EFCA`, `1,094`, `disagreement`, `Stage-2`. Hits were B5.7, B5.8, B17.1, B17.3, B17.5 and B17.7. None represents the EFCA operationalization or its offline enforcement engine. The matrix was reconstructed on 2026-10-08, before the EFCA decision of 2026-10-10. |

The overlay rules are explicit (§3.3 rules 3, 5, 6). No handwritten node table has authority; the matrix is not rewritten; later Owner decisions are represented **only as separate dated governance overlays**. A new matrix node is therefore not lawful. The only consistent form is a dated overlay entry. This follows mechanically from the overlay's text, so it is not presented as an Owner question (`AGENTS.md` §14A.1, gate 2).

## 2. Proposed overlay entry (text for a future governance act)

```text
OVERLAY ENTRY (proposed): OV-2026-10-12-EFCA-L4-CORR9
Subject:   STAGE2_CORR4_L4_EFCA_OFFLINE_ENFORCEMENT_IMPLEMENTATION_1.CORR9
           (six-file offline synthetic EFCA procedural-enforcement engine)
Matrix:    NOT a matrix node. No change to the 63 nodes / 52 edges.
Related:   EFCA Owner decision 2026-10-10 (rubric 5bb887d2…6eba, bound 1335d2e);
           G3.CORR1 allocation authority 53eb3ec4…ecb1;
           Stage-2 controlling contract B17.1 (reference only, no new edge).

Five dimensions (legend of overlay §3.1):
  G  = ACCEPTED_BY_OWNER_DESIGNATED_USE
       designated use = OFFLINE, SYNTHETIC-ONLY, TRUSTED-HOST
  IV = PASS (CORR9.IV2, revised Option B scope, 2026-10-12)
       preceded by CORR9.IV1 = FAIL 0/1 (MAJ-01 preserved, Owner-risk-accepted)
  B  = UNTRACKED (until a separately authorized Git closure)
  C  = COMPLETE for the six-file offline component only (untracked workbench code;
       no src/ / api/ / scripts/ code)
  R  = OFFLINE_VALIDATED_ONLY (no production reference found by IV2 §5)

Contract:  CORR9-MAJ01-OPTIONB-CONTRACT-ALIGNMENT-1,
           13,499 bytes, 1cf24018…aff2 — Owner-accepted; contract IV1 PASS 0/0/0/2.

Carried:   CORR9-IV1-MAJ-01 / NG-01 (MAJOR, bounded risk acceptance);
           ALIGN-IV1-A01, ALIGN-IV1-A02 (ADVISORY, open);
           V-IV1-MIN-01, V-IV1-MIN-02, V-IV1-ADV-01 (open).

Unchanged: §L-4 classification of 1,094 disagreements — OPEN;
           J-1/J-4, J-2/J-3 — OPEN; FINAL CONTRACT FREEZE — OPEN;
           B5.8 — NOT AUTHORIZED; production integration — NOT AUTHORIZED;
           TB-04 future integration obligations — OPEN.
```

Reasons for the specific values:

- **G = `ACCEPTED_BY_OWNER_DESIGNATED_USE`**, not plain `OWNER_ACCEPTED`. The Owner's acceptance is limited by use (offline, synthetic, trusted host). The overlay legend already has this value. Plain `OWNER_ACCEPTED` would drop the limit.
- **IV = `PASS`**, with IV1 FAIL kept in the same entry. The legend has one IV value per item. Leaving out the FAIL would erase the history the contract (§2) requires to stay visible.
- **B = `UNTRACKED`.** The package and the CORR9 code are untracked workbench files. Writing `BOUND` before a Git closure would be false.
- **R = `OFFLINE_VALIDATED_ONLY`**, never `INTEGRATED_CODE_PATH`. IV2 found no production reference. Option B TB-04 makes production integration a future obligation.

Legend mapping for the v2.1 tree (§0): within its designated use, the item meets the ✅ definition (independently verified + Owner-accepted). This must not be read as "Git-bound" or "production". If the governance act prefers to show the Git state in the symbol, ☑️ until Git closure is the conservative choice. Either way the five dimensions above stay separate (`AGENTS.md` §5.4 status rule).

## 3. What this proposal deliberately does not do

- It does not change Stage-2 status. HOLD-6 / G-L2-ELIG (OD-09) stay as recorded in the 2026-10-10 overlay §2.2.
- It does not promote B5.8 or any B17 node.
- It does not state anything about deployment, release readiness or commercial capability.
- It does not close any advisory or MINOR finding.

## 4. Preconditions before any governance act adopts this proposal

1. Independent documentary IV of this package returns PASS (§5).
2. Owner accepts this package.
3. Owner authorizes the governance-binding or Git act, and decides whether that act also brings the CORR9 six-file package and its predecessor chain under Git. That is a separate scope question (see the act report).

## 5. Proposed scope for the next independent documentary IV of this package

**Eligible verifier:** not Claude (author of this package; `AGENTS_A.md` §3; Model Routing §8). Codex is the default for a Claude-authored act (Model Routing §8 table), but Codex wrote all three audit reports this package summarizes. **Recommendation: Z-Ai**, which is allowed for a strongly bounded, mechanical audit with an external hash oracle (Model Routing §8) and is independent of every act in this chain. Codex is the lawful alternate.

Checks the verifier should run:

1. **Identity.** Recompute SHA-256 and bytes for every file in this package and compare them with `SHA256SUMS.txt` and `ACT_MANIFEST.json`.
2. **Copy fidelity.** For every `ARCHIVED_EVIDENCE/` file and `OPTION_B_ACCEPTED_CONTRACT.txt`, compare bytes with the origin path recorded in `EVIDENCE_INDEX.json` while the origin still exists. Check the copies against the auditors' own prior pins (IV2 `evidence_index.json`; IV2 `preservation_before.json` → `external`).
3. **Contract identity.** The copied contract must be exactly 13,499 bytes with `1cf24018…aff2`, and must match the original Codex attachment input.
4. **CORR9 and authority identities.** Six candidate files, rubric `5bb887d2…6eba`, G3.CORR1 `53eb3ec4…ecb1` — all unchanged.
5. **Representational fidelity.** Every verdict, count, finding ID and limitation in `AUDIT_LINEAGE.md` and `OWNER_ACCEPTANCE_RECORD.md` must match the archived reports. In particular:
   - IV1 FAIL 0/1 is not softened;
   - MAJ-01 is described as unrepaired;
   - IV2 PASS is not presented as proof of isolation, authentication or deployment safety;
   - A-01 and A-02 and the three rubric findings are still open.
6. **Status separation.** No sentence merges Owner acceptance, independent verification, governance binding, Git closure or production.
7. **Owner-fact sourcing (as corrected by CORR1).** OF-2 and OF-3 are recorded as the Owner's literal statements, which are the primary Owner facts; contract IV1 and IV2 are only corroborating evidence. No field named or presented as verbatim contains a paraphrase. Literal quotations are kept separate from normalized act IDs, role/function and brief-imposed scope. No earlier separately timestamped Owner decision file is claimed to exist. The Git workflow (`OWNER_ACCEPTANCE_RECORD.md` §6) is recorded as a future workflow, not a current permission.
8. **Non-mutation.** Git state and every protected file are unchanged, apart from the one new untracked directory.
9. **Scientific firewall.** The three `UNASSIGNED` values and the five-field packet are stated correctly. No historical-execution authorization is implied.

The verifier should not re-audit CORR9, the contract or IV2. Those audits are complete and accepted.
