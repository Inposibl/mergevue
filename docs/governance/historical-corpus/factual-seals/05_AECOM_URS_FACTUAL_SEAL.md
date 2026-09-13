# CASE 5 — AECOM-URS FACTUAL SEAL

**Act:** `HISTORICAL-CASES-2-5-FACTUAL-SEAL-GOVERNANCE-BINDING-1.CORR1`  
**Role of this file:** administrative materialization of an already-existing Owner-accepted factual seal state.  
**Not:** a new factual analysis; not Environment inference; not MD-2; not A5 scoring; not Git closure.

Reconciliation input: `HISTORICAL_CASES_2_5_AUTHORITY_BINDING_RECONCILIATION_1_COMPLETE`  
Physical recovery status: `NOT PHYSICALLY MATERIALIZED IN REPOSITORY OR WORKBENCH`  
Authority/provenance boundary: this was an orchestration-level input used for navigation and continuity. It is not relied upon here as independently inspectable proof. All load-bearing case identity, IV, T0, geometry, debt and acceptance-provenance claims in this binding package were re-established from the physical underlying artifacts and independently verified in IV1.  
Reconciliation class: `OWNER_ACCEPTED_PHYSICAL_BINDING_MISSING`

Workbench root (evidence location, not governance authority merely by presence):

`/Users/entp_psyche/Desktop/InvestProjects2026/MergeVue PayProduct (june 2026)/MergeVue-M&A WORKBENCH`

---

## 1. CASE IDENTITY

`caseId`: `aecom-urs`

---

## 2. CORPUS ORDINAL

`5` of the Owner-frozen ten-member historical corpus.

Authority for ordinal (identity/membership only): `docs/governance/MERGEVUE_CALIBRATION_PRE_REMAINING_CORPUS_AUTHORITY_2026-09-05.md`.

---

## 3. CASE GEOMETRY

- Acquirer = AECOM Technology Corporation
- Target = URS Corporation
- Canonical corpus member count = 1

Acquisition vehicles are NOT case sides. The terminal T0 determination names ACM Mountain I, LLC and ACM Mountain II, LLC as direct wholly-owned AECOM subsidiaries used as merger vehicles. Predecessors, business units, and the later combined entity are also not case sides.

---

## 4. T0

- T0 = `2014-07-13`
- T0 precision = `DATE_ONLY`

---

## 5. TERMINAL FACTUAL PACKAGE

`WORKBENCH/02_CASE_RESEARCH/aecom-urs/01_T0_PRE_T0_BASELINE/candidate/`

This live candidate is the CORR1 factual package. It supersedes the pre-CORR1 identity:

- pre-CORR1 identity `80bad15fdf4de161fcaa70a1ef824882dcea5b9995d58d250479cf3a047cbc9e`
- prior Codex audit of that pre-CORR1 package: `REQUIRES_CORRECTION`

CORR1 authoring act: `AECOM-URS.CORR1` (Z-Ai / ANALYST).  
No later factual package exists after CORR1.

---

## 6. PACKAGE IDENTITY

`c95a623cfccdcba8e35d2069bda11de523e7f039a81c51095e6081deec4466b8`

This act recomputed the identity from the live CORR1 candidate. Exact match.

---

## 7. PACKAGE IDENTITY FORMULA

Deterministic sorted inventory:

```text
relative_path<TAB>sha256<TAB>byte_size
```

UTF-8 concatenation of those lines sorted lexicographically by `relative_path`, each terminated by `LF`, excluding the checksum-list file as defined by the package (`12_SHA256SUMS.txt`).

Package declaration (same formula): `WORKBENCH/02_CASE_RESEARCH/aecom-urs/01_T0_PRE_T0_BASELINE/candidate/12_SHA256SUMS.txt`.

---

## 8. INDEPENDENT VERIFICATION

Terminal independent factual verification (CORR1 re-verification):

- Path: `WORKBENCH/02_CASE_RESEARCH/aecom-urs/03_CORR1_INDEPENDENT_REVERIFICATION/`
- Report: `00_CORR1_REVERIFICATION_REPORT.md`
- Manifest: `02_MANIFEST.json`
- Act: `AECOM-URS.CORR1.IV`
- Verifier: Claude / INDEPENDENT_FACTUAL_AUDITOR
- Candidate author: Z-Ai / ANALYST
- Prior independent auditor of the superseded pre-CORR1 package: Codex
- Date: 2026-09-07
- Verdict field: `reverification_result.verdict` = `PASS_WITH_NON_BLOCKING_DEBT_READY_FOR_OWNER_FACTUAL_SEAL`
- Defect scale: `LOCAL`
- Additional corrective acts required: `0`
- The verifier did not claim to create Owner acceptance.

The prior Codex audit under `02_INDEPENDENT_FACTUAL_VERIFICATION/` targeted the superseded pre-CORR1 identity and is not the terminal IV.

---

## 9. IV TARGET IDENTITY

`c95a623cfccdcba8e35d2069bda11de523e7f039a81c51095e6081deec4466b8`

Manifest fields:

- `candidate.corr1_sha256_recomputed`
- `candidate.identity_status` = `VERIFIED_EXACT_MATCH`

Identity match: exact.

---

## 10. OWNER FACTUAL ACCEPTANCE STATE

`OWNER_ACCEPTED_FACTUAL_SEAL`

This is the recovered Owner decision state for this exact CORR1 package identity.  
This file is not itself the original Owner message.

---

## 11. OWNER ACCEPTANCE PROVENANCE

Project continuity and downstream identity-pinned records establish that the Owner accepted this exact factual package as factually sealed.

Cited downstream records (records ABOUT the seal; not a second factual analysis):

1. `WORKBENCH/06_GOVERNANCE_INPUTS/ASTRA_TRACK/ASTRA-A5_HISTORICAL_CORPUS_EXPANSION/aecom-urs/01_CASE_MODULE/00_CASE_MODULE_REPORT.md`  
   Wording: “The Owner-sealed, independently re-verified PRE-T0 factual baseline for `aecom-urs`”.  
   Independent CORR1 re-verification verdict cited: `PASS_WITH_NON_BLOCKING_DEBT_READY_FOR_OWNER_FACTUAL_SEAL`, “explicitly Owner-accepted with the factual seal”.  
   Candidate package identity cited: `c95a623cfccdcba8e35d2069bda11de523e7f039a81c51095e6081deec4466b8`.

2. `WORKBENCH/06_GOVERNANCE_INPUTS/ASTRA_TRACK/ASTRA-A5_HISTORICAL_CORPUS_EXPANSION/aecom-urs/01_CASE_MODULE/04_MANIFEST.json`  
   `authority_inputs.candidate_package_sha256`: `c95a623cfccdcba8e35d2069bda11de523e7f039a81c51095e6081deec4466b8`  
   Status field: `owner_status` = `FACTUALLY_SEALED_INDEPENDENTLY_VERIFIED_OWNER_ACCEPTED`.

A5 materials are not factual-seal authority. They are identity-pinned downstream records of the already-accepted seal.

---

## 12. ORIGINAL OWNER WORDING RECOVERY STATUS

OWNER DECISION STATE:  
`RECOVERED AND CONTINUITY-CONFIRMED`

ORIGINAL OWNER WORDING:  
`NOT PHYSICALLY RECOVERED`

This is provenance honesty. It is not a downgrade of the Owner decision.

---

## 13. IDENTITY MATCH

| Check | Result |
|---|---|
| Live CORR1 package identity recomputed this act | `c95a623cfccdcba8e35d2069bda11de523e7f039a81c51095e6081deec4466b8` |
| Declared terminal identity | exact match |
| Terminal IV target identity | exact match |
| Downstream Owner-acceptance records pin the same identity | exact match |

---

## 14. CARRIED NON-BLOCKING DEBT

Knowingly carried factual-seal LOCAL debt D-01 through D-06. Not repaired and not strengthened by this act.

Source: terminal IV `00_CORR1_REVERIFICATION_REPORT.md` §12.

| ID | Class | Records | Content |
|---|---|---|---|
| D-01 | Quote fidelity | F-U-0016, F-U-0020, F-U-0023 | URS director Diane C. Creel spelled “Creil” in five places, twice inside quoted excerpts. Sources read “Creel.” Pre-existing; not introduced by CORR1. |
| D-02 | Quote fidelity | F-A-0032 | Excerpt reads “Global Linguist Solutions”; S-A3 reads “Global Linguists Solutions.” Carried through CORR1. |
| D-03 | Quote fidelity | F-A-0024, F-A-0031, F-U-0030, F-U-0035 | Four excerpts deviate from strict verbatim quotation inside quotation marks. Underlying values independently confirmed. |
| D-04 | Scope anchor | F-U-0027 | “Sole compensation consultant” attached to the August 2013 selection where S-U2 says “primary … going forward.” The fact’s own excerpt quotes “primary” correctly. |
| D-05 | Documentation | — | `11_CANDIDATE_REPORT.md` §7 describes checksum lines as `sha256<TAB>relative_path`; the file uses the standard two-space `sha256sum` separator. Identity formula itself is documented correctly and reproduces exactly. |
| D-06 | Atomicity observation | F-A-0035 | Bundles four independently falsifiable proxy statements in one record. Observation, not a defect. |

Also recorded, and not repaired or strengthened:

The independent CORR1 re-verification explicitly carried one inferential byte-identity limitation for six large source artifacts (10-K / 10-Q / DEF 14A). The pre-CORR1 `12_SHA256SUMS.txt` was superseded in place, and the prior Codex audit recorded only the aggregate identity, not per-file hashes. For those six large artifacts, byte identity to the pre-CORR1 frozen source universe was established by mtime ordering, the untouched source registry, byte-identical `_WORKING` retrieval copies for the nine 8-K artifacts, and file-count/byte arithmetic — not by direct comparison against a retained pre-CORR1 per-file hash list. Manifest field: `stated_limitations[0]`. Report: §3 “Stated limitation.”

---

## 15. SUPERSESSION / REOPEN STATUS

CORR1 superseded pre-CORR1 identity `80bad15fdf4de161fcaa70a1ef824882dcea5b9995d58d250479cf3a047cbc9e`.  
No later factual act superseded or reopened the exact CORR1 package `c95a623cfccdcba8e35d2069bda11de523e7f039a81c51095e6081deec4466b8`.

---

## 16. AUTHORITY BOUNDARY

This record materializes Owner-accepted factual-seal identity, geometry, T0, package path, IV target, and carried debt.

It does not:

- assign an Environment;
- evaluate SUPPORT;
- use MD-2;
- interpret the Relation Library;
- calculate ECS;
- run historical replay;
- create Pair output;
- call LLM inference;
- repair D-01 through D-06;
- strengthen the inferential byte-identity limitation;
- treat acquisition vehicles as case sides;
- import A5 analytical content.

Excluded legacy/product surfaces (not used as factual or Environment authority):

- `src/data/caseStudies.js`
- `src/data/finalDeliverableData.js`
- `src/generated/newlogic/reporting.json`

---

## 17. DO NOT REDO

Do not redo:

- T0 determination;
- source collection;
- baseline construction;
- CORR1 factual correction;
- independent factual re-verification of this CORR1 package;
- Owner factual judgment of this package;
- optional housekeeping of D-01 through D-06.

---

## 18. CURRENT ADMINISTRATIVE STATUS

```text
OWNER_ACCEPTED_FACTUAL_SEAL /
PHYSICAL_BINDING_CANDIDATE /
AWAITING_CORR1_TARGETED_INDEPENDENT_VERIFICATION /
NO_GIT
```

Not claimed: `GIT-CLOSED`, `GOVERNANCE-BOUND`, `REPLAY-READY`.

---

## 19. NEXT REQUIRED ACT

Targeted independent verification of this CORR1 physical-binding candidate package. Those acts are outside this file.
