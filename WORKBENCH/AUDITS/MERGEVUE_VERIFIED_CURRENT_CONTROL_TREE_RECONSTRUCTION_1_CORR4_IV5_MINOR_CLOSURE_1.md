# MERGEVUE — CORR4 IV5 MINOR CLOSURE — DOCUMENTARY ADDENDUM `CORR4.IV5.MINOR_CLOSURE_1`

**Act:** `MERGEVUE_VERIFIED_CURRENT_CONTROL_TREE_RECONSTRUCTION_1.CORR4.IV5.MINOR_CLOSURE_1`
**Date:** 2026-10-08
**Author:** Z.ai (GLM-5.3 Flash via ZCode), Owner-assigned AUTHOR
**Auditor:** Codex — targeted read-only verification (the two corrected statements, the untouched CORR4 identities, and this addendum's internal consistency; not yet performed)
**Baseline:** `ee55034f5b40dadffc59aa3b842eb9b69157df68` (unchanged; verified this act)
**Verified parent candidate:** `MERGEVUE_VERIFIED_CURRENT_CONTROL_TREE_RECONSTRUCTION_1.CORR4` — **PASSED Codex IV5** (see §1)
**Status:** `CANDIDATE / NOT CONTROLLING GOVERNANCE`. This addendum is act-local documentary material under `WORKBENCH/AUDITS/`. It explains two inaccuracies **without modifying** the independently verified CORR4 candidate, any predecessor package, any controlling governance artifact, any AGENTS file, or any production source. No Owner acceptance may be inferred from the IV5 PASS or from this addendum.

---

## 0. Scope and method

The independent Codex IV5 verification of the CORR4 candidate returned **PASS** with exactly two non-blocking MINOR findings (IV5-N01, IV5-N02). Per the Owner's mandate this act (a) records the complete, mechanically established CORR3→CORR4 node inventory and identifies precisely where the CORR4 *narrative* inventory omitted one node id; (b) corrects the documentary interpretation of the *historical* CORR3 generator's inputs vs the CORR4 generator's inputs, identifying the exact inaccurate CORR4 ledger statement; (c) evidences that the CORR4 package remains byte-identical to the IV5-verified candidate; (d) preserves HOLD-1…HOLD-9 without promotion or closure. The CORR4 package and all predecessor packages are **untouched**: the only file this act creates is this addendum.

**Provenance:** the Codex IV5 report's physical bytes were not located in the workspace (searched this act: repository tree incl. `WORKBENCH/AUDITS/` and `WORKBENCH/DOWNLOADS/` — the same-named IV5 files found belong to the unrelated Stage-2 semantic-successor chain, e.g. `STAGE2_SEMANTIC_SUCCESSOR_CORR4_IV5_REPORT.md`). The verdict and the two findings are executed from the **Owner task's complete transcription** (the controlling act definition), consistent with the established HOLD-8/HOLD-9 provenance practice of this chain; falsifiable by locating the report bytes.

---

## 1. CORR4 IV5 PASS — identity and verdict

- **Verdict:** **PASS — 0 BLOCKING / 0 MAJOR / 2 MINOR** (IV5-N01, IV5-N02), per the Owner's controlling task statement.
- **Verified candidate identity (the object IV5 passed):** the eight-member CORR4 package at `WORKBENCH/AUDITS/MERGEVUE_VERIFIED_CURRENT_CONTROL_TREE_RECONSTRUCTION_1_CORR4/`, bound by the SHA-256 identities in its own `MERGEVUE_MANIFEST.json`: TREE `823739148801e078b47dd6933904b8b9580b63ceddc0e5ba0b3dd9ebce865107` · MTX `621eca0afeadca4b40450a41d3277fb69df9843b73c9663e93042e7d76b98a97` · EVI `7ffa355ce60d9cc83c12d1c21bbeaa65009d91963e927676ce27ea4c08dc9011` · CPATH `e32c74d831f8076ee91a7158f5ee5b5c746e45df352d679d5d401131cf0961ec` · REPT `236be0de00321ae14f25dcd86957149bc6ddef3be6f1ac858fbdea66a0e60220` · LEDGER `8c886c440a242068ab733214adfc30943139481d724ead5724ac38a79e868086` · generator `5b3fce30c96dbb2507eebe46007e8ff8c4288d6d237ef5a27e0a142dd57f7a12` (the manifest does not hash itself; it is bound by reading it at the act directory).
- **Byte-identity re-verification (this act):** all seven hashed members re-hashed and byte-identical to those identities (§4). The verified candidate is therefore physically present and unmutated at the time of this addendum.

## 2. IV5-N01 — Annotation-only node inventory (MINOR, closed by this addendum)

**Finding (narrative defect only).** The CORR4 narrative enumerated the 16 annotation-only nodes of the CORR3→CORR4 transition in three classification classes but listed only **15** of them: **B6.4 was omitted** from the first class ("act-attribution repairs on carried checks"), to which it belongs — B6.4's only change is its `evidence` text, which replaced the ambiguous CORR3-era stamp "re-grepped this act" with the explicit attribution "(re-grepped CORR3; src/ api/ scripts/ unchanged since — baseline tree identical)" (a check performed in CORR3, not re-performed in CORR4 — the same class as B3.3/B4.3/B5.5/B5.7/B10.1).

**Precise omission sites (both verified against current bytes this act):**

1. `WORKBENCH/AUDITS/MERGEVUE_VERIFIED_CURRENT_CONTROL_TREE_RECONSTRUCTION_1_CORR4/MERGEVUE_RECONSTRUCTION_REPORT.md` **line 40** — the CORR3→CORR4 bullet enumerates: B0.1; then "B3.3/B4.3/B5.5/B5.7/B10.1" (class 1 — **B6.4 missing here**); then "B6.2/B6.3/B8.1/B17.4/B17.5/B5.13" (class 2); then "B5.9/B5.19/B7.1" (class 3): 5 + 6 + 3 = **15 of the 16**.
2. `WORKBENCH/AUDITS/MERGEVUE_VERIFIED_CURRENT_CONTROL_TREE_RECONSTRUCTION_1_CORR4/MERGEVUE_MANIFEST.json` **line 123** (`changedNodeAccounting.CORR3_to_CORR4.note`) — the same three class lists "B3.3/B4.3/B5.5/B5.7/B10.1" / "B6.2/B6.3/B8.1/B17.4/B17.5/B5.13/B0.1" / "B5.9/B5.19/B7.1": 5 + 7 + 3 = **15 of the 16** (**B6.4 missing from class 1**).

Not omission sites (checked): the generator's own `changedNodeAccounting` note (`build_matrix.py` line 566, carried into the matrix JSON) names B5.8 and B0.1 as examples without purporting to enumerate the 16; TREE and CPATH contain no per-node enumeration of the transition; the LEDGER states only the counts.

**Corrected statements (recorded here; the verified files are NOT edited):**

- Corrected REPT §3 class 1: "**B3.3/B4.3/B5.5/B5.7/B10.1**" → "**B3.3/B4.3/B5.5/B5.7/B6.4/B10.1**" (act-attribution of carried checks made explicit; for B6.4 specifically: the HEDC code-grep attribution re-stamped to CORR3). 6 + 6 + 3 + B0.1 = **16**.
- Corrected MANIFEST `CORR3_to_CORR4.note` class 1: "(B3.3/B4.3/B5.5/B5.7/B10.1: …)" → "(B3.3/B4.3/B5.5/B5.7/**B6.4**/B10.1: …)". 6 + 7 + 3 = **16**.

**Complete mechanically established CORR3→CORR4 inventory (authoritative):**

| Measure | Value |
|---|---|
| Added node ids | **0** |
| Removed node ids | **0** |
| Modified node objects | **17** |
| — status-bearing | **1: B5.8** (governance `NOT_REACHED` → `UNKNOWN`; the only status-bearing change) |
| — annotation-only | **16: B0.1, B3.3, B4.3, B5.5, B5.7, B5.9, B5.13, B5.19, B6.2, B6.3, B6.4, B7.1, B8.1, B10.1, B17.4, B17.5** (**B6.4 included**) |
| Identical node objects | **46** |
| Dependency graph | identical to CORR3's (52 direct edges, per-node lists equal) |

**Confirmation that the physical diff and machine accounting were correct and need no repair.** Recomputed this act, read-only, from the physical CORR3 and CORR4 matrices: added 0 / removed 0 / modified 17 (status-bearing [B5.8] + annotation-only 16 **including B6.4**) / identical 46; B6.4's only changed field is `evidence` (annotation-only); B5.8 is the sole status-bearing change (governance `UNKNOWN`); the dependency sets are identical (52 edges). The machine-readable accounting is correct in all three locations: `MERGEVUE_MANIFEST.json` line 121 (`modifiedAnnotationOnly`, 16 ids **incl. B6.4**); `MERGEVUE_NODE_STATUS_MATRIX.json` `changedNodeAccounting.CORR3_to_CORR4.modifiedAnnotationOnly` (16 ids **incl. B6.4**; array at JSON lines 326–343); `MERGEVUE_EVIDENCE_INDEX.json` **E53** (all 16 enumerated **incl. B6.4**). **No repair is needed anywhere** — the defect was narrative-only, and this addendum is the record of it.

## 3. IV5-N02 — Historical generator inputs (MINOR, closed by this addendum)

**The exact inaccurate CORR4 ledger statement.** `WORKBENCH/AUDITS/MERGEVUE_VERIFIED_CURRENT_CONTROL_TREE_RECONSTRUCTION_1_CORR4/MERGEVUE_CORRECTION_LEDGER.md` **line 42** (the IV4-N03 defect paragraph), clause:

> "its docstring "input description" mentioned **two predecessor matrices while four are consumed**"

"…while four are consumed" misstates the **CORR3** generator's actual consumption (the sentence's subject is the CORR3 generator's docstring).

**Corrected documentary interpretation:**

- **CORR3 generator** (`MERGEVUE_VERIFIED_CURRENT_CONTROL_TREE_RECONSTRUCTION_1_CORR3/build_matrix.py`, preserved unchanged): its docstring (lines 12–13) says "the only file inputs are the **two** predecessor matrices read read-only from their fixed act directories", but its code actually consumed **THREE** predecessor matrices — Reconstruction-1, CORR1 and CORR2 (directory definitions lines 27–29; loads `load_nodes(PARENT_DIR/CORR1_DIR/CORR2_DIR)` at lines 450–452) — **plus its separate tree input**, the CORR3 tree candidate's §21 diagram (`TREE_MD`, line 418). Accurate defect statement: *the CORR3 docstring's input description mentioned two predecessor matrices while three were consumed, in addition to the separate tree-diagram input.*
- **CORR4 generator** (`MERGEVUE_VERIFIED_CURRENT_CONTROL_TREE_RECONSTRUCTION_1_CORR4/build_matrix.py`, the verified file): docstring lines 15–18 correctly state the actual inputs — **FOUR** predecessor matrices (Reconstruction-1, CORR1, CORR2, CORR3; directory definitions lines 31–38 incl. `CORR3_DIR` at line 38; loads at lines 538–541) **plus the tree candidate's §21 diagram (mermaid block + edge-manifest + declared adjacency) and the reconstruction report's independent edge transcription**. The CORR4 generator's own input description is accurate and required no correction under IV4-N03.
- The same "four predecessor matrices + diagram + report transcription" description of the **CORR4** generator appears correctly in the manifest (`supportingFiles[0].role`) and in ledger line 44's correction bullet ("the four predecessor matrices (Reconstruction-1, CORR1, CORR2, CORR3 …)") — those statements are about the CORR4 generator and are accurate.

**Historical generator files preserved unchanged:** the CORR3 generator (and the Reconstruction-1/CORR1/CORR2 generators) are not edited by this act; their byte identities remain as recorded in the CORR4 manifest `predecessorIdentityCheck` (CORR3 generator `c288720f0dd2abb4…7461a`, re-verified §4).

## 4. Evidence — the CORR4 package is byte-identical to the IV5-verified candidate

Re-hashed this act (2026-10-08) against the manifest identities IV5 verified; **7/7 PASS** (SHA-256 and byte size):

| File | Result |
|---|---|
| `MERGEVUE_CURRENT_CONTROL_TREE_CANDIDATE.md` | PASS — `823739148801e078…` / 38,032 B |
| `MERGEVUE_NODE_STATUS_MATRIX.json` | PASS — `621eca0afeadca4b…` / 73,443 B |
| `MERGEVUE_EVIDENCE_INDEX.json` | PASS — `7ffa355ce60d9cc8…` / 35,011 B |
| `MERGEVUE_CRITICAL_PATH.md` | PASS — `e32c74d831f8076e…` / 10,683 B |
| `MERGEVUE_RECONSTRUCTION_REPORT.md` | PASS — `236be0de00321ae1…` / 22,026 B |
| `MERGEVUE_CORRECTION_LEDGER.md` | PASS — `8c886c440a242068…` / 12,411 B |
| `build_matrix.py` | PASS — `5b3fce30c96dbb25…` / 77,319 B |

`MERGEVUE_MANIFEST.json` remains bound by read-at-audit-time per its self-hash policy. No file inside the CORR4 directory, the four predecessor directories, `docs/`, `src/`, `api/`, `scripts/`, or any governance artifact was written by this act; the sole output is this addendum. Tracked Git worktree clean at baseline `ee55034`; no Git operation performed.

## 5. Residual holds — preserved without promotion or closure

HOLD-1 (freeze-candidate lifecycle NOT ESTABLISHED) · HOLD-2 (correction-campaign IV1 bytes not located) · HOLD-3 (successor-binding current closure + exact-byte acceptance NOT ESTABLISHED) · HOLD-4 (per-case identities not re-hashed) · HOLD-5 (no deployed-runtime evidence) · HOLD-6 (stratifier provenance deviation carried) · HOLD-7 (v1.7 report-SHA debt) · HOLD-8 (IV3 report bytes not located) · HOLD-9 (IV4 report bytes not located) — **all nine carried unchanged** in the verified CORR4 package. This addendum promotes none of them, closes none of them, and creates no new hold; the IV5-report provenance note in §0 is an act-local documentary record consistent with the HOLD-8/HOLD-9 practice, not a change to the package's hold registry.

## 6. No-modification statement and restrictions compliance

This addendum **explains the two inaccuracies without modifying the underlying verified candidate**: the CORR4 package's files, the IV5-verified matrix, report, ledger, manifest and generator are byte-identical to what Codex verified (§4), and the corrections live **only here**. Compliance: no CORR5 created; the CORR4 matrix not regenerated; no modification of CORR4 or predecessor packages, controlling governance, AGENTS files, or production source; no Git add/commit/push/reset/deployment; no Owner acceptance inferred from the IV5 PASS or claimed for this addendum.

## 7. Verification performed and next act

**Author-side (this act, local documentary and hash checks only):** byte-identity re-hash 7/7 PASS (§4); read-only physical diff recomputation reproducing the machine accounting exactly, including B6.4 ∈ annotation-only and B5.8 as sole status-bearing (§2); line-number verification of every citation in §2–§3 against current bytes; addendum self-hash check (§8). Author-side validation is not independent verification.

**Next act — targeted Codex verification, read-only, limited to:** (a) the two corrected statements (§2 class-1 corrected enumeration = 16 incl. B6.4; §3 corrected CORR3/CORR4 generator-input descriptions), (b) the untouched CORR4 identities (re-hash the eight members against the CORR4 manifest; confirm the two omission sites and the ledger clause at the cited lines still read as quoted), and (c) this addendum's internal consistency (counts, hashes, HOLD preservation). **No full reconstruction replay is authorized.**

## 8. Addendum identity (self-hash record)

A file cannot contain its own complete SHA-256. This addendum therefore carries its identity in two forms:

- **In-file self-hash:** `sha256-excluding-hash-record` below is the SHA-256 of this file's complete bytes **up to and including the newline that precedes this final record line** (the record line itself and any trailing newline excluded). Verify mechanically: `python3 -c "import hashlib,sys; d=open(sys.argv[1],'rb').read().rstrip(); i=d.rfind(b'\n'); print(hashlib.sha256(d[:i+1]).hexdigest())" <this-file>`
- **Full-file hash:** recorded in this act's terminal report to the Owner; any reader can recompute it with `shasum -a 256 <this-file>`.

sha256-excluding-hash-record: e2eda4bcd2814472d42b2aa01abedd4c4263563e5a5b50cce5a85240cfa9c458