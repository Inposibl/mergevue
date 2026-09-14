# CASE 7 — JPMORGAN-BANK ONE FACTUAL SEAL

**Act:** `HISTORICAL-JPMORGAN-BANK-ONE-FACTUAL-SEAL-GOVERNANCE-BINDING-1`
**Role of this file:** administrative materialization of an already Owner-accepted factual seal state.
**Not:** a new factual analysis; not geometry or T0 adjudication; not Environment inference; not MD-2; not A5; not historical replay; not Git closure.

Workbench root (evidence location, not governance authority merely by presence):

`/Users/entp_psyche/Desktop/InvestProjects2026/MergeVue PayProduct (june 2026)/MergeVue-M&A WORKBENCH`

**Standing statement on this location.** This file's own presence under `docs/governance/` does not create factual authority. It binds authority that already existed elsewhere and was already accepted. Nothing here may be read as originating, upgrading, or re-adjudicating any factual content.

---

## 1. CASE IDENTITY

`caseId`: `jpmorgan-bank-one`

---

## 2. CORPUS ORDINAL

`7` of the fixed Owner-frozen ten-member historical corpus.

Authority for ordinal (identity/membership only): `docs/governance/MERGEVUE_CALIBRATION_PRE_REMAINING_CORPUS_AUTHORITY_2026-09-05.md`.

Canonical corpus order recorded there: 1. `daimler-chrysler` | 2. `deutsche-bankers-trust` | 3. `pfizer-megamergers` | 4. `aol-time-warner` | 5. `aecom-urs` | 6. `exxon-mobil` | 7. `jpmorgan-bank-one` | 8. `google-android` | 9. `disney-pixar` | 10. `amazon-whole-foods`.

That governing document was checksum-verified during this act: `shasum -a 256 -c MERGEVUE_CALIBRATION_PRE_REMAINING_CORPUS_AUTHORITY_2026-09-05.sha256` → `OK`.

---

## 3. CASE GEOMETRY

- Side A = **J.P. Morgan Chase & Co.** — Acquirer / surviving issuer
- Side B = **Bank One Corporation** — Target
- Direct merger
- Canonical corpus member count = 1

No acquisition vehicle is a distinct case side. Subsidiaries, divisions, historical predecessor entities, and the post-combination entity are also not case sides.

Geometry source: the sealed package's own `01_T0_DETERMINATION.md` (locked-input table) and `00_EXECUTIVE_SUMMARY.md`, both restating the Owner-accepted preflight determination. Geometry was not reopened by this act.

---

## 4. T0

- T0 = `2004-01-14`
- T0 precision = `DATE_ONLY`

T0 event, as recorded in the sealed package: joint issuer public announcement that J.P. Morgan Chase & Co. and Bank One Corporation had agreed to merge under a board-approved stock-for-stock Agreement and Plan of Merger.

Controlling T0 rule (CASE-2): first public announcement of the definitive transaction. Not rumor. Not exploratory discussion. Not closing.

**PRE-T0 boundary:** evidence must be publicly knowable **strictly before 2004-01-14**. Because T0 precision is `DATE_ONLY`, the **entire calendar day 2004-01-14 is excluded** from PRE-T0 organizational factual evidence, and no intra-day ordering is permitted.

The EDGAR acceptance timestamp `2004-01-14 21:51:15` is explicitly **not** used to enlarge PRE-T0 eligibility (`02_TEMPORAL_ADMISSIBILITY.md` rule 3).

T0 was not reopened by this act. It matches the T0 stated in the authorizing act brief exactly.

---

## 5. CONTROLLING PREFLIGHT AUTHORITY

Accepted preflight fingerprint:

```text
79b5dff1e279ffacc48b4f8134b6556f40ab8d4d557a4c173b35556223650dfd
```

This is the SHA-256 of the accepted preflight `SHA256SUMS.txt`, physically located at:

`WORKBENCH/02_CASE_RESEARCH/jpmorgan-bank-one/00_CASE_PREFLIGHT_T0/SHA256SUMS.txt`

Independently recomputed from physical bytes during this act: **exact match.** The preflight package itself was not modified by this act, and its bytes were not rewritten.

Carried nonblocking preflight observations (`MIN-1`, `ADV-1`, `ADV-2`, `ADV-3`) remain nonblocking and were not repaired.

---

## 6. TERMINAL FACTUAL PACKAGE

```text
WORKBENCH/02_CASE_RESEARCH/jpmorgan-bank-one/01_T0_PRE_T0_BASELINE/candidate/
```

Physical package population: **31 files** (13 root files `00`–`12`, plus 18 `sources/` artifacts).

Identity population (excluding `12_SHA256SUMS.txt`): **30 files** / **13,355,076 bytes**.

There is no `candidate_corrN` lineage for this case. `candidate/` is the terminal and only factual package.

### Authorship

- Factual author: **Grok / HISTORICAL FACTUAL ANALYST / AUTHOR** (act `JPMORGAN-BANK-ONE-T0-PRE-T0-BASELINE-1`).
- Independent verifier: **Z-Ai / INDEPENDENT HISTORICAL FACTUAL AUDITOR** (§9).

---

## 7. GOVERNING FACTUAL BASELINE IDENTITY

```text
243f5cd41e0ef72cc8dc12efa56c41edbf7dd51e9d79f729c94db39008cb9b55
```

This exact identity was recomputed from the physical package during this act, independently of the package's own manifest footer. **Exact match.**

The package's own footer declares the same value:

```text
# candidate_sha256=243f5cd41e0ef72cc8dc12efa56c41edbf7dd51e9d79f729c94db39008cb9b55
```

`12_SHA256SUMS.txt` is an AUTHOR CANDIDATE manifest, not an Owner factual seal. Its own SHA-256 is:

```text
7d58fc24c8e3084f4a324b3d42984662e2c69a88e975a6d9c80ad775eeb864e2
```

---

## 8. PACKAGE IDENTITY FORMULA

SHA-256 of the UTF-8 concatenation of the lexicographically sorted lines:

```text
relative_path<TAB>sha256<TAB>byte_size<LF>
```

over all package files **except** `12_SHA256SUMS.txt`.

Same formula declared by the package in
`WORKBENCH/02_CASE_RESEARCH/jpmorgan-bank-one/01_T0_PRE_T0_BASELINE/candidate/12_SHA256SUMS.txt`.

### Re-establishment performed by this act

Recomputed from the physical package before writing this file:

```text
identity_inventory_file_count = 30
identity_total_bytes          = 13355076
physical_candidate_file_count = 31   (includes 12_SHA256SUMS.txt; hidden files included, none present)
per_file_manifest_mismatches  = 0    (all 30 declared per-file SHA-256 + size pairs re-verified from bytes)
recomputed_identity           = 243f5cd41e0ef72cc8dc12efa56c41edbf7dd51e9d79f729c94db39008cb9b55
declared_identity             = 243f5cd41e0ef72cc8dc12efa56c41edbf7dd51e9d79f729c94db39008cb9b55
result                        = EXACT MATCH
```

`12_SHA256SUMS.txt` was additionally verified entry-by-entry: **30/30 hash+size entries accurate, 0 mismatches, 0 missing entries, 0 unexpected on-disk files.** The manifest is internally consistent. (Note: `shasum -c` cannot parse this manifest directly because each line carries a trailing `  # <bytes>` comment; consistency was therefore verified by mechanical re-derivation of every declared pair, not by `shasum -c`. This is a manifest-format observation only, not a defect.)

---

## 9. CASE STATE CARRIED BY THE SEALED PACKAGE

Restated as read from the sealed package during this act. None of these values was re-adjudicated.

### 9.1 Factual census

| | Count |
|---|---|
| Total admitted facts | **61** |
| J.P. Morgan Chase | **29** |
| Bank One | **32** |
| Facts citing a T0-boundary source | **0** |
| Orphan fact IDs | 0 |
| Duplicate fact IDs | 0 |
| PRE-T0 sources with zero facts | 0 |

Uneven side counts are lawful and internally explained (Bank One carries two extra pre-T0 acquisition events and the two-part One Group record).

All `61/61` facts carry `temporal_status = ADMITTED_PRE_T0`.

### 9.2 Source registry census

| | Count |
|---|---|
| Total source records | **18** |
| `ADMITTED_PRE_T0` (`FACTUAL_EVIDENCE`) | **13** (5 J.P. Morgan Chase, 8 Bank One) |
| `ADMITTED_T0_BOUNDARY` (`T0_GEOMETRY_ONLY`) | **5** |

Every boundary record carries the limitation `Must not support PRE-T0 organizational facts.`

Latest admitted PRE-T0 public (filing/publication) date: **2003-11-26** (Bank One One Group 8-K + Ex. 99).

Mechanical citation re-derivation during this act: 61 fact→source citations resolve across exactly the **13** PRE-T0 sources; **0** citations resolve to any `S-T*` boundary source. Reference counts by source: `S-J1` 18, `S-J2` 3, `S-J3` 5, `S-J4` 2, `S-J5` 1, `S-B1` 14, `S-B2` 3, `S-B3` 4, `S-B4` 7, `S-B5` 1, `S-B6` 1, `S-B7` 1, `S-B8` 1 — total 61, equal to the fact population.

### 9.3 Contradictions

Zero material contradiction records. `NC-01` records the J.P. Morgan Item 1 overview figure (`$759 billion` in assets at December 31, 2002) against the consolidated balance sheet (`Total assets $758,800` million) and disposes of it as `NOT_A_CONTRADICTION_ROUNDING`, faithful to the same year-end figure.

### 9.4 Quarantine and exclusions

Three quarantine entries (`Q-01`…`Q-03`) and six exclusions (`E-01`…`E-06`) are recorded in `05_QUARANTINE_LEDGER.json`, with `outcome_firewall_status = STRUCTURAL_CONTAINMENT`. `Q-03` (forward-looking 2004 accretion language inside the Bank One Zurich Life exhibit) is `EXCLUDED_FROM_FACTS`; admitted facts `F-B-0022` / `F-B-0023` use only the agreement-to-acquire proposition.

### 9.5 Gaps

Eight recorded gaps (`G-01`…`G-08`) are true `NO_ADMITTED_FACT` gaps of the SEC-primary documentary bound. **Gaps are not negative evidence**, and the package's own risk notes forbid reading them as such. Principal gaps: no FY2003 10-K (filing-date rule), thin decision-rights/delegation, no technology-decision facts, no BU-autonomy thresholds, compensation tables not extracted, corporate-trust counterparty unnamed in the admitted excerpt, later One Group enforcement not researched (post-T0 firewall).

---

## 10. INDEPENDENT FACTUAL VERIFICATION

- Act: `JPMORGAN-BANK-ONE-T0-PRE-T0-BASELINE-1.IV1` — Independent Verification 1
- Verifier: **Z-Ai / INDEPENDENT HISTORICAL FACTUAL AUDITOR**
- Mode: `STRICT READ-ONLY`
- Terminal: `JPMORGAN_BANK_ONE_T0_PRE_T0_BASELINE_1_IV1_PASS`
- Findings: **BLOCKING = 0 / MAJOR = 0 / MINOR = 3 / ADVISORY = 3**

Independently reproduced by that verifier and matching claim:

| Item | Observed |
|---|---|
| Exact baseline identity | `243f5cd4…08cb9b55` — matches claim |
| Included file count | 30 — matches claim |
| Included bytes | 13,355,076 — matches claim |
| Source registry against live SEC EDGAR | 18/18 artifacts re-retrieved and **byte-identical** |
| Factual census | 61/61 — 58 `PASS`, 3 `MINOR_DEFECT`, 0 blocking |
| Temporal firewall | held — latest admitted PRE-T0 public date 2003-11-26; 0 T0-day, 0 post-T0 facts |
| Source / excerpt fidelity | 59/61 exact after normalization; 3 disclosed deviations |
| Referential integrity | 61/61 facts resolve; 18/18 artifacts match registry |
| Anti-hindsight firewall | held — zero leakage-term hits |
| Author scope | held — cases 1–6, 8–10 untouched |

Bounded closure facts established by that audit, recorded no stronger than the audit states them: candidate identity PASS; documentary bound defensible; source registry truthful; all 61 facts source-supported with faithful anchors; temporal boundary held; atomicity acceptable; contradictions/exclusions complete and lawful; anti-hindsight held; package referentially closed; author stayed in scope.

The audit was explicit that it did not create Owner acceptance and wrote no correction: *"No correction written. No factual seal. No Owner acceptance."* This seal records the verdict at no stronger strength than the audit issued it.

**Physical recovery status of the IV record:** `RECOVERED AND READ DURING THIS ACT` —

`/Users/entp_psyche/Downloads/MergeVue_Agent_Reports/JPMORGAN-BANK-ONE-T0-PRE-T0-BASELINE-1.IV1__Z-AI__2026-09-14_011054.md`

The author-side recovery report is also physically present at `…/JPMORGAN-BANK-ONE-T0-PRE-T0-BASELINE-1__GROK__2026-09-14_004943.md`.

---

## 11. OWNER FACTUAL ACCEPTANCE

**OWNER DECISION — VERBATIM BLOCK (as issued to this act):**

```text
JPMORGAN-BANK-ONE T0-BOUND PRE-T0 FACTUAL BASELINE + IV1
— OWNER ACCEPTED

Exact package identity accepted:
243f5cd41e0ef72cc8dc12efa56c41edbf7dd51e9d79f729c94db39008cb9b55

Z-Ai IV1 PASS accepted.
61-fact PRE-T0 baseline accepted.
Documentary/source boundary accepted.
MIN-IV1-1 through MIN-IV1-3 and the three advisories
accepted as nonblocking carried observations.
No factual CORR required.
```

Accepted state: `OWNER_ACCEPTED_FACTUAL_SEAL`.

**Boundary of the acceptance.** The Owner acceptance did **not** itself authorize governance binding, Git closure, Case 8, historical replay, MD-2 execution, or downstream Environment inference. This act is the separately bounded governance-binding act.

The acceptance additionally does **not**:

- authorize factual-scope expansion;
- change T0;
- change geometry;
- change the source universe or source-registry membership;
- constitute independent verification of *this* governance file.

### Recovery status of the standalone Owner acceptance artifact

```text
OWNER ACCEPTANCE STATE:                                  ESTABLISHED
ORIGINAL STANDALONE OWNER ARTIFACT FOR THE BASELINE:      NOT PHYSICALLY RECOVERED
```

Searches performed during this act: repository tree; Workbench tree; `~/Downloads/MergeVue_Agent_Reports/`; corpus-authority and Control Tree governance documents.

What the search established:

- no standalone Owner factual-acceptance document for this baseline exists at any searched location;
- the Control Tree (`MERGEVUE_CONTROL_TREE_v2.1_2026-09-04.md`) predates Case 7 corpus work and carries no `jpmorgan-bank-one` status row, so it is not an available acceptance record here (unlike the Daimler case, where the Control Tree does carry one);
- no downstream A5/corpus identity pin referencing this baseline was located.

The acceptance state is therefore recorded as **issued to this act** by the Owner, on the strength of the Owner's instruction. This is provenance honesty about the artifact, not a downgrade of the Owner decision. No standalone Owner artifact was fabricated to fill the gap.

---

## 12. CARRIED MINOR FINDINGS AND ADVISORIES

Owner-accepted as **NONBLOCKING**. No factual CORR is required. This act does not repair, strengthen, or reopen any of them.

### MIN-IV1-1 — `F-J-0009` excerpt anchor normalization

The artifact cover reads `New York, NY 10017`; the stored excerpt expands the abbreviation to `New York, New York 10017`. Root cause: anchor normalization. Impact: none on factual truth — the address proposition, zip, locator and source are all verified. Proposition remains fully supported.

### MIN-IV1-2 — `F-B-0016` excerpt list-format normalization

Source bullets are merged into semicolon-separated clauses, and the registered-trademark symbol is dropped (`Visa ®` rendered `Visa`). Root cause: list-format normalization. Content is otherwise verbatim. Impact: none on factual truth. Proposition remains fully supported.

### MIN-IV1-3 — `F-B-0015` atomicity-note cross-reference slip

`atomicity_check_note` points to `F-B-0028` (Q3 net income) where `F-B-0031` / `F-B-0032` (One Group letter) is the intended reference. Root cause: author metadata slip. Impact: none on the fact's proposition, linkage fields, or source graph — all verified correct.

### ADV-IV1-1 — exclusion-date metadata inconsistency

`E-05` dates earnings 8-Ks `2003-10-22 (both issuers)` while `04_SEARCH_LOG.md` reports the latest pre-T0 J.P. Morgan 8-K as `2003-10-27`. Both concern excluded, non-admitted material; no admitted fact is affected.

### ADV-IV1-2 — `F-B-0029` anchor truncated mid-word

The anchor reads `Investme` and is disclosed in-note; the load-bearing segment-name claim is fully supported.

### ADV-IV1-3 — disclosed corroboration pair

`F-B-0010` / `F-B-0011` are a two-source corroboration of one proposition (Dimon CEO since 2000-03-27, from the 10-K and the proxy respectively). Carry as dependency context, not as independent evidence mass. This pair is explicitly disclosed, not a false-independence defect.

---

## 13. TEMPORAL AND ANTI-HINDSIGHT FIREWALL

Established by the sealed package and independently confirmed by IV1:

- **zero T0-day facts** — the entire calendar day 2004-01-14 is excluded;
- **zero post-T0 facts** — no document with filing date ≥ 2004-01-14 exists under `sources/jpmorgan_chase/` or `sources/bank_one/`;
- **zero facts cite any `S-T*` T0-boundary source**;
- T0-boundary sources remain **evidence of the T0 boundary and of locked geometry only** — they are not PRE-T0 organizational evidence, and the announcement and the merger agreement are not PRE-T0 evidence of either side's pre-announcement organization;
- FY2003 Forms 10-K were excluded by the fail-closed filing-date rule and were not retrieved;
- forward-looking 2004 accretion language was quarantined, not admitted;
- the later One Group enforcement outcome was not researched.

This seal does not import:

- post-T0 outcomes;
- Environment;
- A5 analytical content;
- ECS;
- Pair output;
- resource interaction;
- friction;
- report or product narrative.

Not used as factual or Environment authority:

- `src/data/caseStudies.js`
- `src/data/finalDeliverableData.js`
- `src/generated/newlogic/reporting.json`

**Gaps are not negative evidence.** The eight recorded gaps are lawful limitations of the SEC-primary documentary bound. Absence of an admitted fact about a domain is not evidence that no such arrangement existed.

---

## 14. FROZEN STATE

- `candidate/` is the terminal sealed factual package for this case.
- The package is frozen. This act writes governance material only and touches **no byte** of the package.
- No superseded factual lineage exists for this case (no `candidate_corrN`).
- Do not delete, rewrite, or "clean up" the package or its manifest.

### Note on the package's internal status fields

The frozen package's own `00_EXECUTIVE_SUMMARY.md`, `11_CANDIDATE_REPORT.md` and `12_SHA256SUMS.txt` carry author-candidate status wording such as `AUTHOR CANDIDATE — not independently verified; not Owner-accepted; not a factual seal`. Those fields are the pre-seal author-candidate status and are **part of the frozen bytes by design**. Independent verification (§10) and Owner acceptance (§11) occurred after the package was frozen, so they are recorded in governance material such as this file rather than inside the frozen package. The seal does not contradict the package; the acceptance for this identity is external to it.

`12_SHA256SUMS.txt` likewise carries the header line `AUTHOR CANDIDATE identity — not an Owner factual seal`. That statement remains true of the manifest as a package artifact, and remains true after this act; the *identity value* it declares is the one this governance act binds.

---

## 15. IRREGULAR PROVENANCE AND PHYSICAL LIMITATIONS (DISCLOSED, NOT HIDDEN)

Nothing below was repaired, normalized, relocated, or rewritten to look cleaner. These are recorded as the honest physical state of the evidence.

### 15.1 Evidence root is outside the repository

The Workbench evidence root —

`/Users/entp_psyche/Desktop/InvestProjects2026/MergeVue PayProduct (june 2026)/MergeVue-M&A WORKBENCH`

— is a **sibling** of the repository root, not a directory inside it. The act brief's shorthand paths (`WORKBENCH/02_CASE_RESEARCH/…`) are relative to that sibling root. Disclosed because a reader must not infer repository governance standing from the shorthand, and must not look for the evidence inside the repository.

Per `AGENTS.md` §5.4, nothing under `MergeVue-M&A WORKBENCH/` is authority. It is the physical evidence location here, and it is cited as such only.

### 15.2 The preflight package was originally located under an irregular intermediate directory

The act brief named the controlling preflight authority without its physical parent, and the preflight's own manifest header identifies the act `JPMORGAN-BANK-ONE-CASE-PREFLIGHT-T0-1`. The package is physically reachable at the path recorded in §5, and its fingerprint reproduces exactly there. No relocation was performed by this act.

### 15.3 Recovery reports live outside the project

The independent IV record and the author recovery report for this case are physically located under:

`/Users/entp_psyche/Downloads/MergeVue_Agent_Reports/`

This is a recovery/report location, **not** a regular governance path. It is disclosed because the material is cited as locatable evidence; its location does not confer and does not remove authority. See §10 and §11.

### 15.4 No standalone Owner artifact physically recovered

Disclosed in full at §11. Distinguished explicitly:

```text
AUTHORITY STATE ESTABLISHED                     — yes
STANDALONE AUTHORITY ARTIFACT PHYSICALLY
RECOVERED / NOT RECOVERED                       — NOT RECOVERED
```

The existence of nearby recovery material was **not** upgraded into a substitute for a standalone Owner artifact.

### 15.5 The manifest footer is not `shasum -c` parseable

Recorded at §8. Format observation only; internal consistency was verified by mechanical re-derivation. Not a defect and not repaired.

---

## 16. STATE SEPARATION

Authoring, independent factual verification, Owner factual acceptance, governance materialization, independent governance-binding verification, Owner governance acceptance, and Git closure are distinct states and are **not** collapsed here:

| State | This case |
|---|---|
| Factual authoring | Grok / HISTORICAL FACTUAL ANALYST / AUTHOR |
| Independent factual verification | Z-Ai — `PASS` (§10) |
| Owner factual acceptance | `OWNER_ACCEPTED_FACTUAL_SEAL` (§11) |
| Governance materialization | `PHYSICAL_BINDING_CANDIDATE` — this file (§17) |
| Independent governance-binding verification | `NOT PERFORMED` (§18) |
| Owner acceptance of these governance bytes | `NOT OBTAINED` |
| Git closure | `NO_GIT` (§17) |

Governance location does not create factual authority. It binds authority already established elsewhere.

---

## 17. GOVERNANCE STATUS

Status of this file at creation time:

```text
OWNER_ACCEPTED_FACTUAL_SEAL /
PHYSICAL_BINDING_CANDIDATE /
AWAITING_INDEPENDENT_BINDING_VERIFICATION /
NO_GIT
```

The Owner-accepted state above attaches to the **factual package** bound in §7. It does **not** mean the Owner has accepted these governance bytes; that acceptance, if it comes, is a separate and later act.

Not claimed at creation time: `GOVERNANCE-BOUND`, `GIT-CLOSED`, `REMOTE-PUSHED`, `REPLAY-READY`, `CASE 7 100% COMPLETE`, `10/10 CORPUS FROZEN`.

### Files neither created nor modified by this act

- `01_DAIMLER_CHRYSLER_FACTUAL_SEAL.md`
- `01_DAIMLER_CHRYSLER_FACTUAL_SEAL.sha256`
- `02_DEUTSCHE_BANKERS_TRUST_FACTUAL_SEAL.md`
- `03_PFIZER_MEGAMERGERS_FACTUAL_SEAL.md`
- `04_AOL_TIME_WARNER_FACTUAL_SEAL.md`
- `05_AECOM_URS_FACTUAL_SEAL.md`
- `06_EXXON_MOBIL_FACTUAL_SEAL.md`
- `06_EXXON_MOBIL_FACTUAL_SEAL.sha256`
- `CASES_2_5_FACTUAL_SEAL_INDEX.md`
- `CASES_2_5_FACTUAL_SEAL_SHA256SUMS.txt`

The cases 2–5 index and its checksum list declare a cases-2–5 scope. Case 7 is outside that declared scope and is therefore **not** registered into them by this act. The case-6 sidecar convention (a per-file `.sha256` sidecar) is followed here by this act's own `07_JPMORGAN_BANK_ONE_FACTUAL_SEAL.sha256`.

The Workbench baseline package and the preflight package were not modified. No byte of either was written.

---

## 18. NEXT REQUIRED ACT

Targeted independent verification of this exact two-file physical-binding candidate.

That act is outside this file. This file makes no claim about its outcome.

---

## 19. DO NOT REDO

Do not redo:

- factual research for this case;
- SEC source collection or live EDGAR retrieval;
- firstness / T0 determination;
- geometry adjudication;
- atomicity adjudication;
- fact or excerpt rewriting;
- source-registry changes;
- package regeneration;
- the documentary-bound design or its exclusions;
- independent factual verification of this package;
- the Owner's factual judgment of this package;
- the carried MINOR/ADVISORY dispositions;
- housekeeping of the items disclosed in §15.

Do not inspect post-T0 outcomes. Do not perform Environment inference, MD-2, A5, or historical replay. Do not start Case 8.

**This governance materialization does not reopen fact selection.**
