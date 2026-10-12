# CORR9-OWNER-ACCEPTANCE-BINDING-1.CORR1.IV1 — INDEPENDENT DOCUMENTARY AUDIT REPORT

**Verdict: PASS — 0 BLOCKING / 0 MAJOR / 2 MINOR / 2 ADVISORY**

**Act:** `CORR9-OWNER-ACCEPTANCE-BINDING-1.CORR1.IV1`
**Auditor:** Z-Ai (Owner-appointed ANALYST/AUDITOR, `AGENTS_A.md`), independent of the author
**Author of audited package:** Claude (Opus 5.5), documentary author — CORR1 and the original binding package
**Date:** 2026-10-12
**Mode:** STRICT READ-ONLY / INDEPENDENT / DOCUMENTARY VERIFICATION
**Audited identity:** `WORKBENCH/AUDITS/CORR9_OWNER_ACCEPTANCE_BINDING_1/` — 45 files, eight root documents byte-exact against the IV1 brief table
**Report location:** `/private/tmp/CORR9_OAB1_CORR1_IV1_AUDIT_2026-10-12/` (external; nothing written into the repository)

---

## 1. Verdict and severity census

**PASS.**

| Severity | Count | IDs |
|---|---:|---|
| BLOCKING | 0 | — |
| MAJOR | 0 | — |
| MINOR | 2 | MINOR-01 (protected-set root enumeration not preserved → digest `b0e6d73c…` not independently reproducible), MINOR-02 (pre-CORR1 predecessor bytes unavailable → six-file field-level delta not byte-provable; byte-unavailability not itself disclosed inside the package) |
| ADVISORY | 2 | ADVISORY-01 (all three historical audits authored by one model family — already self-disclosed), ADVISORY-02 (eight `.gitignore`-matched `.log` members create a future Git-closure obligation — already recorded by the package) |

No in-scope contradiction, misquotation, broken identity, unverifiable claim presented as verified fact, omitted material, suppressed MAJ-01, or prohibited status promotion was found. The two MINORs are disclosure-completeness defects; neither is load-bearing for preservation, which this audit establishes by stronger direct evidence (§13).

## 2. Agent independence declaration

- Executor identity: Z-Ai session under ZCode (GLM), acting in the Owner-appointed ANALYST/AUDITOR role per the Owner authorization of 2026-10-12.
- I did not author any member of the audited package, the CORR9 implementation, the Option B contract, CORR9.IV1, the contract IV1, or CORR9.IV2. The package author (Claude) and this auditor are different actors. Independence per `AGENTS_A.md` §3 and Model Routing §8 (`AUTHOR != INDEPENDENT AUDITOR`): Claude-authored analytical act; Codex is the preferred auditor but authored all three prior audit reports in this chain; Z-Ai is the routing policy's designated alternate for a Claude author when the audit is highly structured/mechanical — exactly this act's shape (hash-oracle documentary verification), and the package's own `CONTROL_TREE_STATUS_PROPOSAL.md` §5 recommends Z-Ai on the same grounds.
- No write, stage, commit, push, reset, clean, or branch operation was performed. All scratch output went to `/private/tmp/CORR9_OAB1_CORR1_IV1_AUDIT_2026-10-12/` and `/tmp/` (outside the repository).
- No self-acceptance: this report does not accept the package on the Owner's behalf and authorizes no next act.

## 3. Repository identity and authority gate

- Physical root: `/Users/entp_psyche/Desktop/InvestProjects2026/MergeVue PayProduct (june 2026)/MergeVue-M&A (August 2026)` — contains `package.json`-bearing project structure, `src/`, `api/`, `docs/`, and `.git`; unambiguous.
- Branch `main`; HEAD `1335d2e23c58d2ff2df4286bbd3d6eff2ace485f` — matches the manifest `repository.baseHead` and the brief.
- Governing authority resolution (all hashed against disk and, where present, against bound `.sha256` sidecars):

| Authority | On-disk SHA-256 (prefix) | Bound match |
|---|---|---|
| `AGENTS.md` | verified via EVIDENCE_INDEX authority row (OK) + disk read | — |
| `AGENTS_A.md` | verified via EVIDENCE_INDEX authority row (OK) + disk read | — |
| `MERGEVUE_CAUSALITY_PROOF_AND_AGENT_CONTROL.md` | verified via EVIDENCE_INDEX authority row (OK); §27 forbidden-substitution and §26 status-language rules applied — the package makes no runtime/production claim and uses candidate-status language consistently | — |
| Control Tree v2.1 `…2026-09-04.md` + sidecar | `360bafa29bad…7128` — sidecar matches disk byte-for-byte | ✓ |
| 2026-10-10 status overlay `.md` + sidecar | `6ad007cc3a7b…eb61` — sidecar matches disk | ✓ |
| EFCA Owner decision 2026-10-10 `.md` + sidecar | `8432f3aa6bd4…ffb4` — sidecar matches disk | ✓ |
| Model Routing & Verification Policy + sidecar | `07fdf43043c3…4a23` — sidecar matches disk | ✓ |
| Git Worktree Closure Governance + sidecar | `27aa43abd0d8…0a85` — sidecar matches disk | ✓ |
| Accepted rubric (Owner decision-bound) | `5bb887d269e9…6eba` — equals the mandate value | ✓ |
| G3.CORR1 allocation `EFCA_CORR9_ALLOCATIONS_v1.json` + sidecar | `53eb3ec43feb…ecb1` — equals mandate and sidecar | ✓ |
| Frozen CORR4 node matrix | `621eca0afead…8a97` — equals the overlay-bound identity claimed in the proposal §1 | ✓ |

- Hierarchy applied: current Owner instruction (this IV1 brief) → `AGENTS_A.md` → `AGENTS.md` → Owner-accepted decisions (EFCA decision, Option B contract under OF-2, OF-3) → repository documentation. No conflict encountered.
- Note (naming): the v2.1 sidecar file is named `MERGEVUE_CONTROL_TREE_v2.1_2026-09-04.sha256` (no `.md` before the extension). Content matches the `.md` file. Cosmetic only; recorded for future verifiers.

## 4. 45-file package census and integrity

- Exactly **45 physical files**; no unexpected member; no missing member. Grouping: 8 root documents + `ARCHIVED_EVIDENCE/CORR9_IV1/` 12 + `ARCHIVED_EVIDENCE/CORR9_IV2/` 22 + `ARCHIVED_EVIDENCE/OPTIONB_CONTRACT_IV1/` 3. The 8 `.log` files matched by `.gitignore:9 *.log` are physically present and inventoried (`ACT_MANIFEST.gitIgnoredMembers`).
- Eight root identities — **DIRECT_BYTE_VERIFICATION**, each equal to the IV1 brief table in both bytes and SHA-256:

| File | Bytes | SHA-256 (full) |
|---|---:|---|
| ACT_MANIFEST.json | 24499 | `333a6b2d9a615a902a9c2b91478a1d32762cc8724fa0c8e774b1dde399928a1d` |
| OWNER_ACCEPTANCE_RECORD.md | 14978 | `8c03697b30cb985709704e228be6d872d78a956c2df555c794ee16d4484ab369` |
| README.md | 7560 | `6427f3d14c0f3c692ac5b4916a744bddcf1c43f6f6762786c4aa45f3474c65e6` |
| EVIDENCE_INDEX.json | 82942 | `dbdd6a56b0d5fa88bf3674589ce4f50d4a21ef33e192b1bde70c41a3b010eabc` |
| CONTROL_TREE_STATUS_PROPOSAL.md | 8191 | `a4b0265d12c5d3a82e576b913aab39898d5da1fd2b45c1f7d833d69c4c6baf8f` |
| SHA256SUMS.txt | 5142 | `819342b11d249ca41176db30ae5fd7ad36ed322497e78e623a4a435b8a8ce0fe` |
| AUDIT_LINEAGE.md | 9033 | `452747e4ea1af614477031da53ed5f5c1dec489cd889464b8d51ffdfa5663b13` |
| OPTION_B_ACCEPTED_CONTRACT.txt | 13499 | `1cf24018e947c389ab3a4875d6223aa7c496df15fb9c33b4466f64fdab44aff2` |

- `SHA256SUMS.txt`: 44 entries, excluding itself; **all 44 verify OK against disk** (`shasum -c`); the ledger's path set equals the disk set minus the ledger itself (no hidden or omitted member, ignoring ignored-status).
- `ACT_MANIFEST.json`: parses; lists **43 members** (excluding itself and the ledger per its stated self-reference policy); all 43 match on-disk bytes+SHA-256 exactly. Member kinds: 38 `BYTE_IDENTICAL_COPY` (= 37 archival copies + the accepted-contract copy), 4 `AUTHORED`, 1 `GENERATED`. Self-reference policy is internally coherent: the manifest does not record its own hash but is itself recorded in `SHA256SUMS.txt`, which excludes only itself.
- `EVIDENCE_INDEX.json`, `audit_summary.json`, all other JSON members: parse clean.
- `writeAllowlist.createdFiles = 45` — matches the physical census.

## 5. Archival copy fidelity (37 files)

Three independent verification layers, each computed fresh from disk bytes by this auditor:

1. **Package ledger** — all 37 `ARCHIVED_EVIDENCE` copies match `EVIDENCE_INDEX.json` archivedCopies bytes+SHA-256: 37/37, 0 mismatch.
2. **Prior pins** — 34 copies carry prior independent pins (`priorIndependentPin.match = true`): 12 CORR9.IV1 files pinned by CORR9.IV2 `preservation_before.json#external` (19 entries; 13 resolvable in-package, all matching; 6 originals checked live, below); 21 further CORR9.IV2 members pinned by CORR9.IV2 `evidence_index.json` (65 entries; every entry resolvable on disk matches — 21 in-package + candidate files; re-verified **65/65 against the live `/private/tmp/mergevue_corr9_iv2_odn67a24/` originals, 0 mismatch**). 3 copies are honestly classified `NONE — identity as found 2026-10-12 only` (Option B `identity.json`, Option B `preservation-check.json`, CORR9.IV2 `evidence_index.json`); their as-found status is **not upgraded** anywhere.
3. **Live originals** — all three original audit sandboxes still exist and are unpurged: `/private/tmp/mergevue_corr9_iv1_pxytpw33/`, `/private/tmp/mergevue_corr9_iv2_odn67a24/`, `/private/tmp/mergevue-optionb-contract-iv1-2wvtrxgl/`. **All 37 archived copies match their live originals byte-for-byte (37/37, 0 mismatch, 0 unavailable)** — this is the strongest fidelity proof available and exceeds the brief's minimum requirement.

Additional contract-capture fidelity: all four recorded captures of the accepted contract are byte-identical at `1cf24018…aff2`, 13,499 bytes — verified live at the package copy, the contract-IV1 `candidate-exact.txt`, and the original Owner-supplied Codex attachment (`~/.codex/attachments/497416a3-…/Pasted text.txt`); the fourth (IV2 `accepted_contract.txt`) is covered by the 65/65 live match. The contract's historical `CONTRACT CANDIDATE — PENDING OWNER ACCEPTANCE` header is preserved unedited inside the accepted bytes and correctly explained (`OWNER_ACCEPTANCE_RECORD.md` §2).

**Classification:** DIRECT_BYTE_VERIFICATION (live originals + ledger), with INDEPENDENT_PRIOR_PIN corroboration for the 34 pinned copies.

## 6. Original-to-CORR1 delta

- Declared correction scope: exactly six members (`ACT_MANIFEST.json`, `OWNER_ACCEPTANCE_RECORD.md`, `README.md`, `EVIDENCE_INDEX.json`, `CONTROL_TREE_STATUS_PROPOSAL.md`, `SHA256SUMS.txt`), each with `previousSha256` recorded in `ACT_MANIFEST.correction.changedMembers`. This matches the brief's expectation exactly.
- Unchanged set — **directly proven**: `AUDIT_LINEAGE.md`, `OPTION_B_ACCEPTED_CONTRACT.txt`, and all 37 archival copies are byte-verified against the ledger, prior pins, and live originals (§5). Their current identities are the pre-CORR1 identities.
- Dependency check: `CONTROL_TREE_STATUS_PROPOSAL.md` §5 item 7 was changed because it instructed the verifier to check the pre-correction attribution — a justified direct dependency of F-01, disclosed in `ACT_MANIFEST.correction.dependencyNote`. All six changes are within F-01–F-04 or that dependency; no unrelated edit found.
- `EVIDENCE_INDEX.json` "three provenance fields + correction block" claim: the `correction.changedFields` list is exactly `[optionBContract.ownerAcceptance, missingOrNotLocated[0].handling, missingOrNotLocated[1].handling]`; all three fields verified in corrected form on disk (OF-2 named as primary literal Owner fact with `corroborationIsNotSubstitute: true`; the two `handling` strings route primary fact to OF-2/OF-3 transcriptions). Every other index section agrees with independent byte evidence: 37 archive entries (§5), 16 authority rows (§3/§11), 6 candidate rows (§11), optionBContract 4 captures (§5), iv2 rechecks 65/65 and 19/19 (§5). **Limitation (MINOR-02):** the predecessor bytes of the six changed files are not preserved anywhere (searched repository and `/private/tmp`; only the recorded `previousSha256` values exist), so a byte-level structural diff is impossible; the field-level claim is established by exhaustive consistency against external byte evidence, not by diffing predecessor bytes. See §15.

## 7. F-01–F-04 owner-decision provenance

**F-01 — Verbatim attribution: SATISFIED.** The original defect (a normalized authorization stored as if verbatim) is corrected in both locations consistently:
- `ACT_MANIFEST.ownerAuthorization` and `OWNER_ACCEPTANCE_RECORD.md` §1 OF-5 now carry the literal quotation `CORR9-OWNER-ACCEPTANCE-BINDING-1 авторизую` as a separate `literalOwnerQuotation`, character-exact including Cyrillic; the normalized act ID `CORR9-OWNER-ACCEPTANCE-BINDING-1`, the brief-assigned role (ANALYST) and function (DOCUMENTARY AUTHOR), and the brief-imposed scope (with its explicit forbiddens) are each labelled as recorder normalization / brief-imposed, never as Owner words.
- The same separation is applied to OF-2/OF-3/OF-9/OF-10 (transcriptions) and OF-1 (embedded in accepted contract bytes — the only Owner quotation whose original bytes are physically in the package). No paraphrase is presented as verbatim anywhere in the audited documents.
- Cross-check `OWNER_ACCEPTANCE_RECORD.md` ↔ `ACT_MANIFEST.recordedOwnerDecisions`: OF-1/OF-2/OF-3/OF-10 quotations are byte-identical between the two files; OF-4 is explicitly `literalOwnerQuotation: null` with a recorder summary. Consistent.

**F-02 — Option B acceptance: SATISFIED.** OF-2 is recorded as the **primary** Owner acceptance fact for the exact contract `1cf24018…aff2` (13,499 bytes) in both files, with contract IV1 (PASS 0/0/0/2) and CORR9.IV2 §2 explicitly demoted to corroborating evidence (`corroborationIsNotSubstitute: true`). The accepted bytes are unmodified (four live-verified captures, §5), PENDING header intact.

**F-03 — CORR9 implementation acceptance: SATISFIED.** OF-3 is the primary literal Owner statement, scoped strictly to OFFLINE SYNTHETIC-ONLY / TRUSTED-HOST under the accepted contract. The five facts remain independently identifiable (`OWNER_ACCEPTANCE_RECORD.md` §4.2 table; `ACT_MANIFEST.separateLifecycleFacts`): IV1 = FAIL 0/1; MAJ-01 = historical MAJOR, preserved, not repaired; Owner bounded risk acceptance (OF-1); IV2 = PASS 0 new findings; Owner implementation acceptance (OF-3). The record states outright: "IV2 PASS does not convert IV1 into a PASS. Risk acceptance (3) is not a repair of (2)." The archived IV1 report's FAIL verdict and MAJ-01 text are unmodified.

**F-04 — Git governance: SATISFIED.** Both Owner rules preserved verbatim, including the Owner's own spelling (`обязятелен`, sic) in `git commit этого этапа обязятелен после прохождения всех шагов` and `Git push я делаю в ручном режиме по твоему указанию, что можно`. The package correctly distinguishes: mandatory FUTURE local commit (after all gates); no commit authorization in CORR1 or this IV1; Antigravity as GIT AGENT for a separately authorized local commit; Orchestrator verification of commit SHA/parent/path-set/hashes/preservation/target; `PUSH ALLOWED` only after positive verification; Owner manual push; independent remote reconciliation before `REMOTE GIT-CLOSED`. Neither author nor auditor granted themselves Git permission; this audit performed zero Git mutation.

**Evidence-provenance limitation — correctly disclosed.** OF-2, OF-3, OF-5, OF-9, OF-10 are identified as transcriptions delivered through the CORR1 execution brief; the package states in four places (record §0, §1 source fields; README §6; manifest source fields; `missingOrNotLocated` entries) that original message bytes/timestamps are not archived and that no standalone original Owner acceptance record was found or is claimed. `NOT_LOCATED` is recorded rather than papered over.

## 8. Owner quotation fidelity and provenance limitations

- OF-1: verified **directly inside the accepted contract bytes** (`OPTION_B_ACCEPTED_CONTRACT.txt` header "Controlling Owner decision") — the archived lineage's claim that OF-1 comes from contract bytes is true.
- OF-2/OF-3: quoted identically in record and manifest; carry the exact contract SHA inside the quotation text; provenance marked "transcription … not archived in this package" in both.
- OF-5: character-exact against the brief's F-01 requirement.
- OF-9: matches the CORR1 authorization quoted in this IV1 brief (same text recorded in the manifest `correctionAuthorization`).
- OF-10: character-exact against the brief's F-04 wording, including the Owner's spelling.
- Weakest evidence class used where applicable; no quotation class inflation found (matrix §14).

## 9. IV1 / contract-IV1 / IV2 lineage reconciliation

All required historical results verified against the archived reports' own bytes (themselves live-original-verified copies):

| Claim in package | Archived report says | Verdict |
|---|---|---|
| CORR9.IV1 = FAIL — 0 BLOCKING / 1 MAJOR | "Overall verdict: FAIL — 0 BLOCKING / 1 MAJOR / 0 new MINOR / 0 new ADVISORY." (line 6; "Final overall verdict: FAIL." line 282) | MATCH |
| `CORR9-IV1-MAJ-01` congruent rehashed cross-mode laundering, both directions, deterministic, not repaired | IV1 §9 and severity block: "Severity: MAJOR. Deterministic: YES…"; disposition not repaired | MATCH |
| Contract IV1 = PASS 0/0/0/2 | "Verdict: PASS — 0 BLOCKING / 0 MAJOR / 0 MINOR / 2 ADVISORY." + defect register totals | MATCH |
| CORR9.IV2 = PASS, 0 new findings | "Verdict: PASS — new findings: 0 … 0 ADVISORY" | MATCH |
| Regression 117/117; probes 8/8 | IV1 line 116 (117/117, exit 0); IV2 §5 table 117/117/0/0/0; "Eight new independently constructed probe groups" all PASS | MATCH |
| MAJ-01 reproduced in IV2, disposition known/risk-accepted | IV2 §7 (per lineage §5; IV2 report §1: "complete bidirectional mode laundering… remains NG-01"; MAJ-01 "remains MAJOR / ORIGINAL IV1 FAIL / OWNER-RISK-ACCEPTED") | MATCH |
| 65/65 evidence-index recheck | Re-verified live by this auditor: 65/65 match against `/private/tmp` originals | MATCH (strengthened) |

The chain is presented with the FAIL first and preserved; no retrospective overwrite exists in any audited file.

## 10. MAJ-01 and trust-boundary preservation

All required statements are explicit and unmodified in the package (README §3–4; record §1 OF-1/OF-4, §4.2; lineage §3, §6; manifest `trustBoundary`; proposal §2):

- Privileged whole-history mode laundering (SIMULATION ↔ OWNER_PINNED) reproducible both directions, with adopted state and lawful continuation — preserved as MAJOR, original IV1 FAIL, **not repaired**, Owner-risk-accepted only within the accepted scope.
- Trusted host is a **prerequisite/assumption**, not a demonstrated deployment security property (README §4.1; IV2: "ASSUMPTIONS, not security mechanisms").
- The Python component does **not** authenticate human callers; no authenticated principal; no requester/`requester_id` comparison (README §4.2; IV2 TB-01/TB-02 rows; api inventory: 30 entrypoints, 24 requester-scoped/constant, no requester→host self-call path).
- Unrestricted access to the session object permits direct host-method access (`__init__`, `register_actor`, `persist_global_history`, `verify_global_history`, `restore_global_history`, `replay_legacy_history`) (README §4.3).
- SHA-256 event chains are **not** independent cryptographic origin attestations (README §4.4).
- No production integration authorized; TB-04 remains a future integration obligation (README §4.8; IV2 TB-04 row "Future integration obligations preserved"; IV2 §16 "Decide implementation acceptance separately").
- No previous MINOR or ADVISORY silently closed: `AUDIT_LINEAGE.md` §6 carried-findings register keeps `CORR9-IV1-MAJ-01`, `ALIGN-IV1-A01/A02`, `V-IV1-MIN-01/02`, `V-IV1-ADV-01` OPEN with original severities; record §5 repeats them.

## 11. CORR9 / rubric / G3.CORR1 identity

Re-hashed from disk by this auditor:

| Artifact | On-disk SHA-256 | Mandate | Verdict |
|---|---|---|---|
| `offline_efca.py` (engine) | `cff11c1a25baddf4340e0dfff82923e58415505ead43fd9d257eb067c1be8143` | mandatory | ✓ EXACT |
| `test_offline_efca.py` | `d6af54af…` (full hash computed, matches index) | candidate member | ✓ |
| `synthetic_fixtures.json`, `TEST_RESULTS.json`, `IMPLEMENTATION_REPORT.md`, `ACT_MANIFEST.json` | all match `EVIDENCE_INDEX.corr9Candidate` | candidate members | ✓ 6/6, `allMatch: true` |
| Accepted rubric binding candidate | `5bb887d269e9079754e5a4f7417cd08f58d4ad5d5ff14503ca1dd98646176eba` | mandatory | ✓ EXACT |
| G3.CORR1 allocation + `.sha256` sidecar | `53eb3ec43feb4de926e057e0dc17a857473872e4bbc9ff571e5937576c38ecb1` | mandatory | ✓ EXACT, sidecar equal |

No CORR9 test was run and no implementation re-audit performed — documentary verification only, as instructed.

## 12. Scientific and governance restrictions

Verified **in engine bytes** (`WORKBENCH/AUDITS/STAGE2_CORR4_L4_EFCA_OFFLINE_ENFORCEMENT_IMPLEMENTATION_1_CORR9/offline_efca.py`):

- Line 727: `CATEGORY_ASSIGNMENT = "UNASSIGNED"`; line 728: `TUPLE_LEVEL_NAME = "UNASSIGNED"`; line 1605 emits `"causeLink": "UNASSIGNED_PENDING_J1"` (plus three doc-statement hits). ✓ preserved.
- `PACKET_FIELDS = ("caseId", "sideId", "factId", "sealedFactText", "questionText",)` — exactly the five-field blind Phase-1 packet. ✓
- The package authorizes none of: historical execution, the 1,094 disagreements, J-1/J-4, J-2/J-3, B5.8, a scientific freeze, production integration/deployment — stated in README §2, record §5, manifest `scientificFirewall.notAuthorized` (7 items), proposal §3.
- `CONTROL_TREE_STATUS_PROPOSAL.md` is labelled `PROPOSAL ONLY. Not controlling. Not an edit to governance.`; its factual anchors were verified by this auditor (tree sidecar `360bafa2…`, overlay sidecar `6ad007cc…`, matrix `621eca0a…` all match disk) — and none of the three was modified (0 tracked dirty).
- The frozen 63-node matrix and the 2026-10-10 overlay are unedited and not silently superseded (matrix hash equals the overlay-bound identity; no later numbered Control Tree exists in `docs/governance/`).

## 13. Git and protected-set preservation (before/after)

Before/after captures by this auditor (audit start vs. completion) — **identical**:

| Check | Before | After |
|---|---|---|
| HEAD | `1335d2e23c58d2ff2df4286bbd3d6eff2ace485f` | same |
| Branch | `main` | same |
| Tracked modified | 0 | 0 |
| Staged | 0 | 0 |
| Expanded untracked inventory, package excluded (raw git order) | 828 entries, SHA-256 `1bfe59e3137693ba48ef94e3a97a1639328cb036ef0902fa855fb35ea81f5f64` | same |
| Collapsed porcelain, package excluded (raw order) | SHA-256 `ac07c5e537eadf001f42a470e798e1bc9e7d555b5ee48fee9c9f33560fa39e1d` | same |
| Package files | 45 | 45 |

- The author's reported inventory digest `1bfe59e3…` and count 828 were **independently reproduced exactly** (serialization: raw-order `git status --porcelain -uall`, package paths excluded — consistent with the author's pre-act capture where the package did not yet exist; the same digest is recorded in IV2's `preservation_comparison.json` and IV1's `preservation_before.json`, demonstrating three-way agreement across acts).
- Content-level preservation of the workbench area is independently established by the archived CORR9.IV1 `preservation_before.json`: **710 files pinned at IV1 time (HEAD `1335d2e`, statusSha `1bfe59e3…`) — all 710 re-hashed by this auditor against current disk: 710/710 match.** Combined with the mandate hashes (§11), the 45-file table (§4), the 37 live-original comparisons (§5), and 0 tracked/staged changes, every load-bearing protected byte is covered by direct evidence.
- **MINOR-01:** the binding act's protected set (287 files / 23 roots, digest `b0e6d73c…`, method "sorted `sha256  path` lines") is documented with method, counts, and before/generation equality — but the 23-root enumeration is preserved nowhere (searched `WORKBENCH/` and `/private/tmp/`), so this auditor could not reproduce that specific digest. Classified AUTHOR_ASSERTION_ONLY and **non-load-bearing**: preservation does not rest on it (evidence above). The 287-file set is necessarily a subset of {tracked files} ∪ {828 untracked files}, both of which are directly verified at path level, with content level covered by the 710-file pin plus the mandate/package hashes for all files this audit depends on.
- Original CORR9 six-file candidate, rubric, allocation bytes: unchanged (§11). No Git stage/commit/push/reset/clean/branch occurred. Scratch output only under `/private/tmp/CORR9_OAB1_CORR1_IV1_AUDIT_2026-10-12/` and `/tmp/`.

## 14. Independent verification matrix

Proof classes: **DBV** = DIRECT_BYTE_VERIFICATION · **IPP** = INDEPENDENT_PRIOR_PIN · **DCR** = DOCUMENTARY_CROSS_REFERENCE · **OQT** = OWNER_QUOTATION_TRANSCRIPTION · **AAO** = AUTHOR_ASSERTION_ONLY · **UNV** = UNVERIFIABLE

| # | Requirement | Source | Package representation | Independent check | Observed | Evidence | Verdict |
|---|---|---|---|---|---|---|---|
| 1 | Identity | IV1 brief table | 8 root files | Fresh SHA-256 + bytes from disk | 8/8 exact | DBV | PASS |
| 2 | Archive copy fidelity | 37 archived files | "byte-identical copies" | Ledger check; prior-pin check; live `/private/tmp` original check | 37/37 / 34 pinned / 37/37 live | DBV + IPP | PASS |
| 3 | F-01 | Owner brief; record §0/§1; manifest | separated literal/normalized fields | Character comparison vs required wording; record↔manifest cross-check | exact; consistent | OQT + DCR | PASS |
| 4 | F-02 | OF-2 primary | primary + corroborating-only rank | Record, manifest, IV2 §2 demotion, PENDING header intact | satisfied | OQT + DBV (bytes) | PASS |
| 5 | F-03 | OF-3 primary; 5 separated facts | §4.2 table; separateLifecycleFacts | Record vs manifest vs archived reports | satisfied | OQT + DCR | PASS |
| 6 | F-04 | OF-10 verbatim; future workflow | §6 sequence; no permission | Character check incl. `обязятелен`; workflow-order check; zero Git mutation by auditor | satisfied | OQT + DCR | PASS |
| 7 | Original IV1 FAIL | archived IV1 report | FAIL 0/1 preserved | Read archived report bytes (live-verified copy) | exact | DCR→DBV | PASS |
| 8 | Contract IV1 PASS | archived contract IV1 report | PASS 0/0/0/2; A-01/A-02 open | Read archived report bytes | exact | DCR→DBV | PASS |
| 9 | Revised IV2 PASS | archived IV2 report | PASS, 0 new, 117/117, 8/8 | Read archived report bytes | exact | DCR→DBV | PASS |
| 10 | MAJ-01 | IV1 §9 / IV2 §7 | historical MAJOR, unrepaired, risk-accepted | Archived text + register §6 | preserved | DCR→DBV | PASS |
| 11 | Host security assumptions | contract TB/RV; IV2 §§1,9,11,12 | README §4; manifest trustBoundary | Term-by-term check against archived reports | all explicit | DCR→DBV | PASS |
| 12 | Scientific firewall | engine bytes | UNASSIGNED ×2 + PENDING_J1; 5-field packet | Grep engine lines 727/728/1605 + PACKET_FIELDS | exact | DBV | PASS |
| 13 | Governance proposal status | proposal file | PROPOSAL ONLY | Label check; anchors re-hashed; no governance edit (0 dirty) | satisfied | DBV + DCR | PASS |
| 14 | Git & protected preservation | repo state | preActState + preservation block | Before/after captures; 828-entry digest; 710-file content pin; mandate hashes | identical; 828 exact; 710/710 | DBV (protected-set digest: AAO — MINOR-01) | PASS |
| 15 | Six-file delta boundedness | manifest correction | 6 changedMembers + previousSha256 | Changed set vs unchanged set byte proof; dependency justification | satisfied; predecessor bytes unavailable (MINOR-02) | DBV (unchanged set) + AAO (previous hashes) | PASS w/ MINOR |

## 15. Residual findings and corrective recommendations (not applied)

**MINOR-01 — Protected-set root enumeration not preserved.** `ACT_MANIFEST.preservation.protectedSet` records method, counts (23/287), and digest equality but not the root list; the digest `b0e6d73c…` cannot be reproduced by a third party. Consequence: none for preservation (proven independently, §13). Recommendation: if a future act re-states a protected set, embed the enumerated root list (or a rooted manifest file) alongside the digest. No repair authorized by this audit.

**MINOR-02 — Predecessor bytes of the six CORR1-changed files unavailable.** Only their `previousSha256` values survive (recorded in `ACT_MANIFEST.correction`); a byte-level structural diff of the delta is impossible, and the package does not itself state this limitation. The delta was established here by exhaustive consistency of all externally-pinned content plus the recorded previous identities. Recommendation: the Owner acceptance of this package may note that the six-file field-level delta rests on recorded previous identities + consistency evidence, not a predecessor-byte diff; a future correction framework should preserve predecessor copies (e.g., a `PREDECESSOR_BYTES/` sibling or external archive) when editing evidence-bearing documents in place. No repair authorized by this audit.

**ADVISORY-01 — Single auditor model family.** IV1, contract IV1, and IV2 were all authored by Codex; `AUDIT_LINEAGE.md` §2 already records this as a fact against the routing policy's preference. No action required; noted for future verifier rotation.

**ADVISORY-02 — `.gitignore`-matched `.log` members.** The eight `.log` files are present in the package but invisible to plain `git add`; the package itself defers forced-add permission to the separately authorized closure brief. Carried; Git Agent must explicitly verify inclusion at closure. No action in this act.

## 16. Recommended Owner disposition

This audit applies to the exact CORR1 candidate `WORKBENCH/AUDITS/CORR9_OWNER_ACCEPTANCE_BINDING_1/` (45 files; eight root identities per §4) and to nothing else.

**Recommended disposition: the Owner may accept this exact CORR1 documentary package** — identity, archive fidelity, owner-decision provenance (F-01–F-04), audit lineage, trust boundaries, scientific restrictions, and repository preservation all verify, with no BLOCKING or MAJOR finding. The two MINORs are disclosure-completeness items that do not weaken any load-bearing claim and require no rework before acceptance; they may be recorded as residual notes.

Acceptance of this package does **not** by itself authorize the next acts. Per the package's own recorded workflow (which this audit verified as correctly represented): the subsequent steps remain (1) Owner acceptance of the exact verified candidate; (2) a separately authorized Antigravity (GIT AGENT) local commit including all eight `.log` members under an allowed workflow; (3) Orchestrator verification; (4) `PUSH ALLOWED`; (5) Owner manual push; (6) independent remote reconciliation before `REMOTE GIT-CLOSED`. The scope question of whether the CORR9 engine and predecessor packages enter Git remains undecided and separate.

**STOP — this audit delivers the independent documentary IV1 report and performs no further act.**

---
*Auditor scratch/inputs: `/private/tmp/CORR9_OAB1_CORR1_IV1_AUDIT_2026-10-12/`. Repository untouched: HEAD `1335d2e`, 0 modified, 0 staged at close.*
