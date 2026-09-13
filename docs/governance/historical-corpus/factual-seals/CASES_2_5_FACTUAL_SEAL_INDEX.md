# CASES 2–5 FACTUAL SEAL INDEX

**Act:** `HISTORICAL-CASES-2-5-FACTUAL-SEAL-GOVERNANCE-BINDING-1.CORR1`  
**Package:** administrative physical-binding candidate for Owner-accepted factual seals of fixed corpus cases 2–5.

This index is administrative governance material.  
It is not a new factual analysis and does not infer Environment.

Reconciliation input: `HISTORICAL_CASES_2_5_AUTHORITY_BINDING_RECONCILIATION_1_COMPLETE`  
Physical recovery status: `NOT PHYSICALLY MATERIALIZED IN REPOSITORY OR WORKBENCH`  
Authority/provenance boundary: this was an orchestration-level input used for navigation and continuity. It is not relied upon here as independently inspectable proof. All load-bearing case identity, IV, T0, geometry, debt and acceptance-provenance claims in this binding package were re-established from the physical underlying artifacts and independently verified in IV1.  
All four cases classified as: `OWNER_ACCEPTED_PHYSICAL_BINDING_MISSING`

Current administrative status of this package:

```text
OWNER_ACCEPTED_FACTUAL_SEAL /
PHYSICAL_BINDING_CANDIDATE /
AWAITING_CORR1_TARGETED_INDEPENDENT_VERIFICATION /
NO_GIT
```

Not claimed: `GIT-CLOSED`, `GOVERNANCE-BOUND`, `REPLAY-READY`.

---

## COUNTS

```text
TOTAL CASES = 4
NEW FACTUAL JUDGMENTS = 0
NEW SOURCE COLLECTION = 0
NEW T0 DECISIONS = 0
NEW IV ACTS = 0
FACTUAL REOPENINGS = 0
```

---

## CASE ROWS

| Ordinal | caseId | T0 | Package identity | Identity formula | Terminal IV verdict | Owner acceptance state | Carried debt summary | Physical binding candidate path | Current administrative status |
|---|---|---|---|---|---|---|---|---|---|
| 2 | `deutsche-bankers-trust` | `1998-11-23` `DATE_ONLY` | `d5e42537d39f52385944f9f7c1794ce5648a4f6e21439c65c834a0a8417621a0` | SHA-256 of `11_SHA256SUMS.txt` | `PASS` | `OWNER_ACCEPTED_FACTUAL_SEAL` (decision recovered and continuity-confirmed; original Owner wording not physically recovered) | None specified as seal-carried LOCAL debt; unrepaired IV transcription notes F-2/F-3/F-4 only | `docs/governance/historical-corpus/factual-seals/02_DEUTSCHE_BANKERS_TRUST_FACTUAL_SEAL.md` | `OWNER_ACCEPTED_FACTUAL_SEAL / PHYSICAL_BINDING_CANDIDATE / AWAITING_CORR1_TARGETED_INDEPENDENT_VERIFICATION / NO_GIT` |
| 3 | `pfizer-megamergers` | `2009-01-26` `DATE_ONLY` | `30f5feab45ce6f034641fd095e6a25ce82e3b66a13037b708c3d0e136c5ea94a` | SHA-256 of `11_SHA256SUMS.txt` | `PASS` (CORR1 targeted re-verification) | `OWNER_ACCEPTED_FACTUAL_SEAL` (decision recovered and continuity-confirmed; original Owner wording not physically recovered) | None specified as seal-carried LOCAL debt | `docs/governance/historical-corpus/factual-seals/03_PFIZER_MEGAMERGERS_FACTUAL_SEAL.md` | `OWNER_ACCEPTED_FACTUAL_SEAL / PHYSICAL_BINDING_CANDIDATE / AWAITING_CORR1_TARGETED_INDEPENDENT_VERIFICATION / NO_GIT` |
| 4 | `aol-time-warner` | `2000-01-10` `DATE_ONLY` | `9bfe1b32ab25b882b0bed81f60e550f43fcf594ca59d77275b762be6d76d468e` | deterministic sorted inventory `relative_path<TAB>sha256<TAB>byte_size` excluding `12_SHA256SUMS.txt` | `PASS_WITH_NON_BLOCKING_DEBT_READY_FOR_OWNER_FACTUAL_SEAL` | `OWNER_ACCEPTED_FACTUAL_SEAL` (decision recovered and continuity-confirmed; original Owner wording not physically recovered) | Knowingly carried LOCAL: F0030 / G0003; not repaired | `docs/governance/historical-corpus/factual-seals/04_AOL_TIME_WARNER_FACTUAL_SEAL.md` | `OWNER_ACCEPTED_FACTUAL_SEAL / PHYSICAL_BINDING_CANDIDATE / AWAITING_CORR1_TARGETED_INDEPENDENT_VERIFICATION / NO_GIT` |
| 5 | `aecom-urs` | `2014-07-13` `DATE_ONLY` | `c95a623cfccdcba8e35d2069bda11de523e7f039a81c51095e6081deec4466b8` | deterministic sorted inventory `relative_path<TAB>sha256<TAB>byte_size` excluding the package checksum-list file | `PASS_WITH_NON_BLOCKING_DEBT_READY_FOR_OWNER_FACTUAL_SEAL` (CORR1 re-verification) | `OWNER_ACCEPTED_FACTUAL_SEAL` (decision recovered and continuity-confirmed; original Owner wording not physically recovered) | Knowingly carried LOCAL: D-01 through D-06; plus CORR1 IV inferential byte-identity limitation for six large source artifacts; not repaired | `docs/governance/historical-corpus/factual-seals/05_AECOM_URS_FACTUAL_SEAL.md` | `OWNER_ACCEPTED_FACTUAL_SEAL / PHYSICAL_BINDING_CANDIDATE / AWAITING_CORR1_TARGETED_INDEPENDENT_VERIFICATION / NO_GIT` |

---

## PFIZER GEOMETRY (INDEX NOTE)

`pfizer-megamergers` remains one unsplit canonical corpus member.

- Terminal episode = Pfizer / Wyeth
- Warner-Lambert and Pharmacia = PRE-T0 longitudinal Pfizer episodes only
- `OD-PFIZER-GEO-1 CONTENT:` `RECOVERED`
- `ORIGINAL STANDALONE OWNER ARTIFACT:` `NOT PHYSICALLY RECOVERED`

---

## A3 / A5 STATUS HAZARD

`ASTRA-A3.P0` is a stale earlier snapshot for cases 2–4 and must not be used as current factual-seal status.

Path: `WORKBENCH/06_GOVERNANCE_INPUTS/ASTRA_TRACK/ASTRA-A3_BLINDED_REPRODUCIBILITY/00_INPUT_FREEZE/00_INPUT_FREEZE_REPORT.md`

That freeze recorded `deutsche-bankers-trust` and `pfizer-megamergers` as `AWAITING_OWNER_FACTUAL_SEAL` against the same package identities later treated as Owner-accepted. The identities were already correct; the A3.P0 *status* field is stale.

A5 materials may contain records ABOUT Owner factual seals but are not themselves factual-seal authority.

This index does not:

- rewrite A3;
- rewrite A5;
- promote A5 analytical content;
- import A5 Environment assignments;
- import ECS;
- import outcome fields.

---

## PRODUCT / LEGACY CONTAMINATION FIREWALL

Not used as factual or Environment authority:

- `src/data/caseStudies.js`
- `src/data/finalDeliverableData.js`
- `src/generated/newlogic/reporting.json`

---

## NEXT REQUIRED ACT

Targeted independent verification of this CORR1 six-file physical-binding candidate package.  
Do not treat this index as Git-closed, governance-bound, or replay-ready.
