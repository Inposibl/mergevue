# MERGEVUE — RECONSTRUCTION REPORT **CORR4**

**Act:** `MERGEVUE_VERIFIED_CURRENT_CONTROL_TREE_RECONSTRUCTION_1.CORR4`
**Date:** 2026-10-08
**Author:** Z.ai (GLM-5.3 Flash via ZCode) — Owner-assigned AUTHOR; local Git restricted to artifact creation
**Corrects:** `MERGEVUE_VERIFIED_CURRENT_CONTROL_TREE_RECONSTRUCTION_1.CORR3` — **FAILED Codex IV4 (0 BLOCKING / 1 MAJOR / 2 MINOR: IV4-M01, IV4-N02, IV4-N03)**
**Lineage:** Reconstruction-1 → CORR1 → CORR2 → CORR3 → **CORR4** (direct parent = CORR3; Reconstruction-1/CORR1/CORR2 preserved as failed candidates, CORR3 preserved as the failed direct parent)
**Independent auditor:** Codex (IV5 — targeted to the three IV4 findings, package integrity and no-regression verification; this candidate has **not** been verified; no self-verification claimed)
**Terminal status:** `CORR4_CANDIDATE_READY_FOR_CODEX_IV5`

**IV4 report provenance:** the Codex IV4 report's physical bytes were **not located** in the workspace (structured search: repo, external Workbench, paste-attachment area, home Downloads, wider project tree — the only on-disk "IV4" files belong to a different project's Stage-2 chain). This act was executed from the **Owner task's complete transcription** of the three findings; each finding was independently re-verified against primary sources before correction (E55). Recorded as HOLD-9; falsifiable by locating the report bytes.

---

## 1. What this act did

Corrected exactly three IV4 findings with ledgered, evidence-bound changes (see `MERGEVUE_CORRECTION_LEDGER.md`). Reconstruction-1, CORR1, CORR2 **and CORR3** are preserved unmutated in their own directories (re-hashed this act; manifest `predecessorIdentityCheck`). No implementation, methodology, governance, or AGENTS change; no Git operation; the only writes are the CORR4 files in this directory. Baseline HEAD `ee55034…` re-checked unchanged; all previously confirmed identities are preserved, and the identities re-pinned "this act" (Control Tree v2.1, RP pair, freeze, successor, CORR6, FEVA RECORDS, the three B17.4 IV reports) were recomputed from physical bytes.

## 2. Headline state (one paragraph, corrected)

Unchanged from CORR3 in substance, with three corrections. **Correction 1 (IV4-M01):** the CORR3 ASCII diagram left B5.19 on a `|-->` branch of the B7.1 trunk in addition to its real B5.12 chain, visually implying a direct `B7.1 → B5.19` dependency the matrix does not contain; because shared vertical trunk branches are structurally ambiguous in static ASCII, the §21 diagram is **replaced by a full-view Mermaid diagram** in which every one of the matrix's **52 direct dependencies** is a single explicit `A --> B` declaration — the drawn edge set now **equals** the matrix edge set, B5.19's only drawn incoming edge is `B5.12 --> B5.19`, and four representations (mermaid declarations, edge-manifest, declared adjacency, independent transcription §4A) are generator-asserted equal to the matrix. **Correction 2 (IV4-N02):** B5.8's current governance is **`UNKNOWN`** — the former current `NOT_REACHED` claim is withdrawn because it derived current status from the authoring-time `STAGE_2_STARTED = NO` record (successor doc :399, 2026-09-25), negative file searches, and unresolved predecessors; the historical statement is preserved with its date and source; IV stays `NOT_ESTABLISHED`; implementation/runtime `ABSENT` stays scoped to tracked-code inspection; the representation now distinguishes five independent layers (authoring-time state / current authorization / current execution evidence / current IV evidence / eligibility to proceed), and "blocked from authorized forward progression" is never read as "never executed". **Correction 3 (IV4-N03):** all stale provenance is repaired — the generator header/docstring, runtime `ACT`, in-memory execution fallback, input description, matrix `act`/`status`/`correctionOf` metadata and `findingsCorrected` now describe the exact **CORR3 → CORR4** correction chain with the full Reconstruction-1 → CORR1 → CORR2 → CORR3 → CORR4 lineage (direct parent CORR3; CORR3's generator had carried a CORR2-era docstring and misidentified the direct parent as CORR1).

## 3. Node census and changed-node accounting (mechanically computed — IV1-N02 / IV2-P01 / IV4-N02)

**63 nodes** across branches B0–B17 (structure unchanged — the N02 correction required a governance-value change only, per the regression constraint). Census computed by `build_matrix.py` from the node table:

| Dimension | Distribution (63 nodes) |
|---|---|
| Governance | OWNER_ACCEPTED 25 · NOT_REACHED **20** · **UNKNOWN 1** · CANDIDATE 9 · OWNER_ACCEPTANCE_NOT_ESTABLISHED 1 · OWNER_AUTHORIZED 2 · ACCEPTED_BY_OWNER_DESIGNATED_USE 1 · OWNER_ACCEPTED_ARCHITECTURE_ONLY 1 · OWNER_ACCEPTED_RESIDUALS 1 · OWNER_ACCEPTED_SEMANTICS_ONLY 1 · REJECTED_BY_OWNER 1 |
| Independent verification | PASS 24 · NOT_RUN 26 · NOT_ESTABLISHED 12 · FAIL 1 |
| Git binding | BOUND 33 (17 unqualified + 16 commit-pinned) · UNTRACKED 4 · REVERTED 1 · N/A 25 |
| Implementation | COMPLETE 10 · PARTIAL 9 · ABSENT 20 · N/A 24 |
| Runtime | INTEGRATED_CODE_PATH 14 · OFFLINE_VALIDATED_ONLY 3 · NOT_ESTABLISHED 2 · ABSENT 20 · N/A 24 |

**Changed-node accounting — computed from the physical predecessor matrices** (embedded in the matrix `changedNodeAccounting` block; four transitions):

- **parent → CORR1:** 6 new / 0 removed / 32 modified (19 status-bearing + 13 annotation-only) / 20 identical (carried; corrects the CORR1 manifest per IV2-P01).
- **CORR1 → CORR2:** 5 new / 0 removed / 24 modified (11 status-bearing + 13 annotation-only) / 34 identical (carried).
- **CORR2 → CORR3:** 0 new / 0 removed / 3 modified / 60 identical — status-bearing: B5.8 (IV `NOT_RUN` → `NOT_ESTABLISHED`); annotation-only: B0.1, B8.1 (carried).
- **CORR3 → CORR4 (this act):** **0 new / 0 removed / 17 modified / 46 identical** — status-bearing (1): **B5.8** (governance `NOT_REACHED` → `UNKNOWN`, the N02-mandated change, with a structured five-layer `lifecycleDisambiguation` object; the 52-edge dependency set is regression-asserted identical to CORR3's). Annotation-only (16): **B0.1** (HEAD re-check re-pinned to CORR4 authoring time), **B3.3/B4.3/B5.5/B5.7/B10.1** (act-attribution of carried checks made explicit — e.g. validator re-run CORR2, searches re-run CORR2/CORR3 — replacing ambiguous "this act" stamps for checks not re-performed in CORR4), **B6.2/B6.3/B8.1/B17.4/B17.5/B5.13** (checks actually re-performed this act re-stamped to CORR4: md2 :963 re-read; CORR6 SHA; `:886/:893/:955` re-read; three B17.4 IV-report SHAs recomputed — with the F0024 IV1 filename disambiguated to `AOL_F0024_RECONCILIATION_1_IV1_REPORT.md`; FEVA RECORDS SHA), **B5.9/B5.19/B7.1** (IV4-N02 reading-rule / IV4-M01 single-parent notes propagating the two corrections). All 16 leave every status dimension and every dependency unchanged.

## 4. Finding → correction map

| Finding | Correction (one line) |
|---|---|
| **IV4-M01** hidden ASCII dependency `B7.1 → B5.19` | §21 replaced with a full-view Mermaid diagram drawing all 52 direct matrix dependencies as single explicit `A --> B` declarations (matrix untouched); B5.19's sole incoming edge is `B5.12 --> B5.19`; the machine-readable `(edge-manifest: …)` line, the 63-line declared adjacency, the mermaid declarations and the independent human-readable transcription (§4A below) are all generator-asserted **equal to the matrix edge set** (not merely a subset); no ASCII trunk art or shared vertical branch remains in §21 |
| **IV4-N02** B5.8 governance overclaim | Current governance → **`UNKNOWN`**; the authoring-time `STAGE_2_STARTED = NO` (:399, SHA `be9593a7…0237`, bound `92236dc`, dated 2026-09-25) preserved as historical with date and source; IV `NOT_ESTABLISHED` preserved; C/R `ABSENT` preserved **scoped to tracked-code inspection** (grep re-run: 0 hits); current `NOT_REACHED` withdrawn (was derived from authoring-time record + negative searches + unresolved predecessors); five-layer `lifecycleDisambiguation` recorded in the matrix; forward-progression blocking distinguished from non-execution; disposition propagated across tree §0.1/§6.6, matrix, critical path (A5), report, ledger, evidence index (E38 corrected, E55 new), manifest; governance census recomputed mechanically (`NOT_REACHED` 21 → 20, `UNKNOWN` 0 → 1) |
| **IV4-N03** generator and matrix provenance | `build_matrix.py` header/docstring identify **CORR4**; runtime `ACT` = `…CORR4`; exec fallback resolves the CORR4 directory; the input description lists the actual consumed inputs (four predecessor matrices + tree §21 diagram + report transcription); matrix `act`, `status` (`CORR4_CANDIDATE_READY_FOR_CODEX_IV5`), `correctionOf` (direct parent **CORR3**, full five-step lineage preserved) and `findingsCorrected` (IV4-M01, IV4-N02, IV4-N03) describe the exact CORR3→CORR4 chain; a fourth accounting transition (`CORR3_to_CORR4`) is computed from the physical CORR3 matrix; prior audit history preserved (no removal or rewrite) |

## 4A. Independent human-readable edge transcription (IV4-M01 artifact)

Transcription of the entire §21 diagram as visible declared arrows, in plain language, produced as a **separate** reading pass from the machine-readable `(edge-manifest: …)` line (which lives in the tree §21 text fence). The generator mechanically cross-checks this transcription against the mermaid declarations, the edge manifest, and the matrix: all four must contain exactly the same 52 edges. Reading direction: `A -> B` = *B depends directly on A*.

<!-- EDGE-TRANSCRIPTION-BEGIN -->
1. B1.1 -> B1.2 — the exact nine Environment state space directly depends on Root Definitional Authority v1.7.
2. B1.1 -> B1.3 — the E9 semantic authority CORR3 directly depends on Root Definitional Authority v1.7.
3. B3.1 -> B3.2 — evidence scoring / contradiction / dual-respondent logic directly depends on the questionnaire baseline and generated NewLogic artifacts.
4. B3.2 -> B3.3 — candidate-pair determination directly depends on the evidence-scoring logic.
5. B1.4 -> B4.2 — Level-1 Mode-D Slice-1 directly depends on the CASE-3.4 documentary contract v1.3.
6. B5.1 -> B5.2 — case-level blind-cycle completion directly depends on nine-case corpus membership and geometry.
7. B5.2 -> B5.3 — the nine prediction-seal packages directly depend on case-level blind-cycle completion.
8. B5.2 -> B5.5 — the nine-case input-freeze candidate directly depends on case-level blind-cycle completion.
9. B5.1 -> B5.6 — the Stage-1 transfer-integrity correction campaign directly depends on nine-case corpus membership and geometry.
10. B5.6 -> B5.7 — the Stage-1 factual-authority successor binding candidate directly depends on the correction campaign.
11. B5.7 -> B5.8 — mechanism normalization directly depends on the Stage-1 successor-binding candidate.
12. B5.5 -> B5.8 — mechanism normalization directly depends on the nine-case input-freeze candidate.
13. B17.5 -> B5.8 — mechanism normalization directly depends on the Final Effective View Assembly CORR1 terminal candidate.
14. B5.8 -> B5.9 — dual coding and candidate HEDC contract construction directly depend on mechanism normalization.
15. B5.9 -> B5.10 — the candidate determination-rule (HEDC contract) freeze directly depends on candidate HEDC contract construction.
16. B5.10 -> B5.15 — the frozen blind replay directly depends on the candidate rule freeze.
17. B5.15 -> B5.16 — independent reproduction of the frozen replay directly depends on the frozen blind replay.
18. B5.16 -> B5.11 — the outcome-based behavioral and program falsification gate directly depends on independent reproduction.
19. B5.11 -> B5.17 — leave-one-case-out (LOCO) stability testing directly depends on the falsification gate.
20. B5.17 -> B5.18 — realized-coverage analysis and the T10 / MD-1..6 verdicts directly depend on LOCO.
21. B5.18 -> B7.1 — the Owner methodology-acceptance gate (METHOD FREEZE DECISION) directly depends on the coverage/verdicts stage.
22. B7.1 -> B5.12 — the final calibrated replay directly depends on Owner methodology acceptance.
23. B5.12 -> B5.19 — full-corpus independent verification of the replay directly depends on the final calibrated replay; this is B5.19's only incoming edge (IV4-M01).
24. B5.19 -> B5.13 — the nine internal historical reports directly depend on the verified replay.
25. B6.4 -> B5.13 — the nine internal historical reports directly depend on the HEDC deterministic classifier implementation chain.
26. B9.1 -> B5.13 — the nine internal historical reports directly depend on the target analytical core.
27. B5.19 -> B5.14 — public case studies publication-ready directly depend on the verified replay.
28. B6.1 -> B6.2 — the MD-2 structural-inference kernel directly depends on the OD-MS-9 historical Environment route design.
29. B7.1 -> B6.4 — the HEDC deterministic classifier implementation chain directly depends on Owner methodology acceptance.
30. B6.1 -> B6.4 — the HEDC deterministic classifier implementation chain directly depends on the OD-MS-9 route design.
31. B3.3 -> B8.1 — ECS semantics directly depend on candidate-pair determination.
32. B8.1 -> B8.2 — the friction static lookup directly depends on ECS semantics.
33. B7.1 -> B9.1 — the target hard-coded analytical core directly depends on Owner methodology acceptance.
34. B4.2 -> B10.1 — the FREE 12-block canonical report registry and Mode-D projection directly depend on Level-1 Mode-D Slice-1.
35. B10.1 -> B10.2 — public flow screens and API wiring directly depend on the report registry / projection.
36. B10.2 -> B10.3 — the FREE Product-Ready residual items directly depend on public flow screens and API wiring.
37. B10.2 -> B10.4 — report delivery and persistence mechanisms directly depend on public flow screens and API wiring.
38. B9.1 -> B11.1 — the paid 19-block report and paid diagnostic surface directly depend on the target analytical core.
39. B10.1 -> B12.1 — anonymous / temporarily FREE version semantics directly depend on the report registry / projection.
40. B10.1 -> B13.1 — the paid vs FREE epistemic boundary directly depend on the report registry / projection.
41. B11.1 -> B14.1 — the integration monitor directly depends on the paid diagnostic surface.
42. B11.1 -> B16.1 — the commercial stack directly depends on the paid diagnostic surface.
43. B16.4 -> B16.1 — the commercial stack directly depends on the Owner public-release authorization gate.
44. B10.3 -> B16.2 — the PRODUCT READY gate directly depends on the FREE Product-Ready residual items.
45. B5.14 -> B16.3 — the PUBLIC PROOF READY gate directly depends on publication-ready public case studies.
46. B5.19 -> B16.3 — the PUBLIC PROOF READY gate directly depends on the verified replay.
47. B16.2 -> B16.4 — the Owner public-release authorization gate directly depends on PRODUCT READY.
48. B16.3 -> B16.4 — the Owner public-release authorization gate directly depends on PUBLIC PROOF READY.
49. B17.1 -> B17.2 — the pilot version lock lineage directly depends on the Stage-2 semantic successor contract CORR4 (Stage-2 chain).
50. B17.2 -> B17.3 — the executed bounded pilot stratification directly depends on the pilot version lock.
51. B17.3 -> B17.4 — the post-pilot corrections (CORR10 + A-E001 + F0024) directly depend on the executed pilot.
52. B17.4 -> B17.5 — the Final Effective View Assembly CORR1 terminal candidate directly depends on the post-pilot corrections.
<!-- EDGE-TRANSCRIPTION-END -->

**Literal-drawing verification (IV4-M01):** the generator asserts that the §21 section contains no ASCII trunk/branch art lines (no `|-->`, no pure `|`/`v` glyph lines), that every mermaid line is either a node declaration or a single exact `A --> B` edge, that no alternative arrow forms (`-.->`, `==>`) appear, that the declared node set equals the 63 matrix ids, and that the edge sets of mermaid, manifest, adjacency and this transcription are each **exactly equal** to the matrix's 52 direct dependencies (equality both ways, count 52). The specific IV4 false relationship `B7.1 --> B5.19` is asserted absent as a literal in both the mermaid block and this transcription, alongside the retained IV3 assertions (`B6.4 --> B9.1`, `B5.13 --> B16.3` absent).

## 5. Regression traps F01–F06 (re-checked under the corrections)

| Trap | Result in CORR4 |
|---|---|
| F01 | PASS — B17.5 unchanged: CANDIDATE MATERIALIZED / READY_FOR_IV; SHA `3603c316…` (116 records) re-verified this act |
| F02 | PASS by construction — six dimensions per node; zero status emoji (mechanical scan of all 8 authored files); per-control dispositions in tree §20 |
| F03 | PASS — B10.1 evidence unchanged (carried) |
| F04 | PASS — B5.6/B5.7 distinct instruments; B5.5 NOT_ESTABLISHED (carried) |
| F05 | PASS — md2.js:963 re-read this act; CORR6 SHA re-verified this act |
| F06 | PASS — gates unchanged (full restored chain B5.9→…→B5.19 + three launch gates + corrected RP-5); the §21 diagram equals the matrix edge-for-edge (IV3-M01 + IV4-M01) |

## 6. Regression constraints (Owner-mandated, verified preserved)

63-node matrix structure preserved (0 nodes added/removed; one governance value changed strictly per N02); valid 52-dependency graph preserved (0 dependencies added/removed/retargeted — computed this act: the matrix edge set is identical to CORR3's); established methodology sequence untouched (generator chain + predecessor-relation assertions unchanged); B5.13 ancestry through B5.19, B6.4, B9.1 preserved; ECS semantics and citations (`:886`, `:893`, `:955`) re-verified against baseline bytes this act; E38 census (22 uppercase / 26 case-insensitive, scoped) re-run this act with identical counts and its limited interpretation preserved; Stage-1 uncertainty and acceptance-provenance distinctions (B5.5/B5.7 four-layer lifecycle, HOLD-1/2/3) untouched; B17.4 Owner-acceptance uncertainty (IV2-M02) untouched; RP-5 entitlement limitations untouched; FEVA CORR1 identity (`3603c316…`, 116 records) re-verified; nine-case membership and 18-side geometry untouched; historical offline ingress / report-delivery / case-study distinctions untouched; Product Ready / Public Proof Ready / Owner release gates untouched; prior audit history preserved (Reconstruction-1 through CORR3 byte-unmutated, re-hashed this act). No changes to production source code or mathematical methodology.

## 7. Evidence gaps / HOLD findings (terminal)

HOLD-1 … HOLD-8 carried unchanged. **HOLD-9 (new):** the Codex IV4 report's physical bytes were not located; this act was executed from the Owner task's complete transcription (E55). No hold was silently resolved.

## 8. Reproducibility

From the repository root at `main` = `ee55034…` (root-stable, read-only except the generator's own matrix write):

```bash
PKG=WORKBENCH/AUDITS/MERGEVUE_VERIFIED_CURRENT_CONTROL_TREE_RECONSTRUCTION_1_CORR4
git rev-parse HEAD                                    # ee55034f5b40dadffc59aa3b842eb9b69157df68
python3 "$PKG/build_matrix.py"                        # all assertions incl. IV4-M01 four-way diagram validation
shasum -a 256 "$PKG/MERGEVUE_NODE_STATUS_MATRIX.json" # == manifest value
sed -n '886p;893p;955p' src/flow/finalDeliverableFlow.js
sed -n '963p' src/historical/md2.js                   # environmentBinding = "NONE"
REPO="$PWD"; WB="../MergeVue-M&A WORKBENCH"
find "$REPO" -name .git -prune -o -type f -name '*MECHANISM*' -print | wc -l   # 2
find "$WB" -type f -name '*MECHANISM*' | wc -l                                # 20  (combined 22)
sed -n '399p' docs/governance/historical-corpus/MERGEVUE_STAGE1_FACTUAL_AUTHORITY_SUCCESSOR_BINDING_AND_CLOSURE_2026-09-25.md   # STAGE_2_STARTED = NO (authoring-time record, 2026-09-25 — IV4-N02)
```

In-memory reproduction (IV2 audit pattern): `exec(src.split("\nout = ", 1)[0], ns)` and byte-compare — **without writing during the in-memory check** — verified byte-identical this act. (Provenance history, preserved: the CORR3 generator's exec fallback had pointed at the CORR2 directory — found and fixed during CORR3 authoring, disclosed in CORR3 E45/REPT §8; IV4-N03 required the same class of identifier repair for CORR4, and the CORR4 fallback resolves the CORR4 directory.)

## 9. Exact next authorized action

**Codex IV5 of this CORR4 candidate package — limited to the three IV4 findings, package integrity and no-regression verification**: (a) M01 — independently enumerate the §21 mermaid edges, the edge-manifest, the declared adjacency and the §4A transcription against the matrix; confirm full equality (52/52, both directions), B5.19's single incoming edge from B5.12, the absence of `B7.1 --> B5.19`, and that no matrix dependency was altered vs CORR3; (b) N02 — confirm B5.8 governance `UNKNOWN` with the five-layer `lifecycleDisambiguation`, the preserved historical `STAGE_2_STARTED = NO` with date/source, IV `NOT_ESTABLISHED`, scoped C/R `ABSENT`, no `OWNER_AUTHORIZED`/`OWNER_ACCEPTED`/completed-execution inference, the corrected census, and the propagation across tree/matrix/critical path/report/ledger/evidence index/manifest; (c) N03 — confirm the generator header/docstring, runtime `ACT`, exec fallback, input description, matrix `act`/`status`/`correctionOf`/`findingsCorrected` and the four-transition accounting all describe the exact Reconstruction-1 → CORR1 → CORR2 → CORR3 → CORR4 chain with direct parent CORR3; (d) package integrity — regenerate the matrix byte-identically (script and in-memory exec), re-hash all eight members against the manifest, confirm the four predecessor packages unmutated; (e) no-regression — confirm the §6 constraint list. No Git mutation is authorized for this act; binding requires a separate Owner authorization after IV5 PASS and Owner acceptance; all remote pushes remain Owner-controlled.
