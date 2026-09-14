# CASE 6 — EXXON-MOBIL FACTUAL SEAL

**Act:** `HISTORICAL-EXXON-MOBIL-FACTUAL-SEAL-GOVERNANCE-BINDING-1`  
**Role of this file:** administrative materialization of an already Owner-accepted factual seal state.  
**Not:** a new factual analysis; not Environment inference; not MD-2; not A5; not historical replay; not Git closure.

Workbench root (evidence location, not governance authority merely by presence):

`/Users/entp_psyche/Desktop/InvestProjects2026/MergeVue PayProduct (june 2026)/MergeVue-M&A WORKBENCH`

---

## 1. CASE IDENTITY

`caseId`: `exxon-mobil`

---

## 2. CORPUS ORDINAL

`6` of the fixed Owner-frozen ten-member historical corpus.

Authority for ordinal (identity/membership only): `docs/governance/MERGEVUE_CALIBRATION_PRE_REMAINING_CORPUS_AUTHORITY_2026-09-05.md`.

Canonical corpus order recorded there: 1. `daimler-chrysler` | 2. `deutsche-bankers-trust` | 3. `pfizer-megamergers` | 4. `aol-time-warner` | 5. `aecom-urs` | 6. `exxon-mobil` | 7. `jpmorgan-bank-one` | 8. `google-android` | 9. `disney-pixar` | 10. `amazon-whole-foods`.

---

## 3. CASE GEOMETRY

- Acquirer = Exxon Corporation
- Target = Mobil Corporation
- Canonical corpus member count = 1

Acquisition vehicles are NOT case sides. The T0 determination names Lion Acquisition Subsidiary Corporation (a Delaware corporation and wholly-owned direct Exxon subsidiary) as the merger vehicle. Subsidiaries, divisions, historical predecessor entities, and the post-combination entity are also not case sides.

Geometry source: sealed terminal package `01_T0_DETERMINATION.md` §2.

---

## 4. T0

- T0 = `1998-11-27`
- T0 precision = `DATE_ONLY`

T0 event, as recorded in the sealed package: joint issuer confirmation of merger discussions, distributed by Business Wire and filed with the SEC by Mobil under Item 5 of Form 8-K the same day.

---

## 5. TERMINAL FACTUAL PACKAGE

`WORKBENCH/02_CASE_RESEARCH/exxon-mobil/01_T0_PRE_T0_BASELINE/candidate_corr7/`

---

## 6. TERMINAL FACTUAL ACT / LINEAGE

Terminal factual act: `EXXON-MOBIL-FACTUAL-CANDIDATE.CORR7-2026-09-08`.

`candidate_corr7/` is the terminal factual package and the sealed factual input for this case.

The earlier packages in the same directory are superseded factual lineage and are **not** the sealed terminal input:

- `candidate/` (pre-CORR)
- `candidate_corr1/` through `candidate_corr6/`

Superseded lineage identities, as declared by the terminal package's own manifest footer (`12_SHA256SUMS.txt`):

| Lineage position | Declared identity |
|---|---|
| `candidate/` | `1cae092950a8b7f1d9d417a4cedfe0fa71a473a69e3caec8a32688f075ea45e4` |
| `candidate_corr1/` | `f3f6b3ad02163a06babf714aef2c9b842e25aa81ef63f8f6ff9ce17e1d3d7fb9` |
| `candidate_corr2/` | `dc66304b7de20da133b03b4658f373753f21ab9f6c3aada636a6764bc8e0342d` |
| `candidate_corr3/` | `c0c035ddf76228651f02576d0590c86bb08d3752ec4dbb39cdd7e706c971bd5c` |
| `candidate_corr4/` | `c4c1cf34a442850feb5ca20ceacafe57321e4434f4a00b51fc68890dc5a65756` |
| `candidate_corr5/` | `a9243ff7c4c77b9faff2b3c6fad61e842370773b5456f5f2ea6d182c001e993c` |
| `candidate_corr6/` | `acc7bde253945e84f8f0e9d2e79be53847ab29de11daf5f7aa0032f530620fb6` |

### Authorship / provenance

- Factual CORR7 author: **Z-Ai / ANALYST**. Source: author-side working record `_WORKING/corr7_act_log_2026-09-08.txt` header ("Author: Z-Ai, role ANALYST"), consistent with the act and status fields inside the frozen package.
- Independent verifier of the CORR7 package: **Grok / AUDITOR** (see §9).

`_WORKING/` is author-side working material inside the Workbench evidence root. It is cited here as authorship provenance only, not as governance authority.

### Status separation

Authoring, independent verification, Owner acceptance, physical governance binding, and Git closure are distinct states and are not collapsed here:

| State | This case |
|---|---|
| Authoring | `Z-Ai / ANALYST` — CORR7 |
| Independent verification | `Grok / AUDITOR` — `PASS` (§9) |
| Owner acceptance | `OWNER_ACCEPTED_FACTUAL_SEAL` (§10) |
| Physical governance binding | `PHYSICAL_BINDING_CANDIDATE` — this file (§14) |
| Git closure | `NO_GIT` (§14) |

---

## 7. PACKAGE IDENTITY

```text
995453defabd9ff9a57a89396f8dfda338e0c55a1c8ee17b305a79fbf15cf4f0
```

This exact identity was recomputed from the physical terminal package during this act, independently of the package's own footer. Exact match.

---

## 8. PACKAGE IDENTITY FORMULA

SHA-256 of the UTF-8 concatenation of the lexicographically sorted lines:

```text
relative_path<TAB>sha256<TAB>byte_size<LF>
```

over all package files **except** `12_SHA256SUMS.txt`.

Same formula declared by the package in
`WORKBENCH/02_CASE_RESEARCH/exxon-mobil/01_T0_PRE_T0_BASELINE/candidate_corr7/12_SHA256SUMS.txt`.

### Re-establishment performed by this act

Recomputed from the physical terminal package before writing this file:

```text
identity_inventory_file_count = 38
identity_total_bytes          = 3323055
physical_candidate_file_count = 39   (includes 12_SHA256SUMS.txt; hidden files included, none present)
per_file_manifest_mismatches  = 0    (all 38 declared per-file SHAs re-verified from bytes)
recomputed_identity           = 995453defabd9ff9a57a89396f8dfda338e0c55a1c8ee17b305a79fbf15cf4f0
declared_identity             = 995453defabd9ff9a57a89396f8dfda338e0c55a1c8ee17b305a79fbf15cf4f0
result                        = EXACT MATCH
```

---

## 9. INDEPENDENT VERIFICATION

- Act: `EXXON-MOBIL-CORR7-CLASS-CLOSURE-INDEPENDENT-REVERIFICATION-1`
- Verifier: **Grok / AUDITOR** (Grok 4.6)
- Verdict: `PASS`
- Audited and independently recomputed identity: `995453defabd9ff9a57a89396f8dfda338e0c55a1c8ee17b305a79fbf15cf4f0`

Bounded closure facts established by that audit, recorded no stronger than the audit states them:

- unique terminal path `candidate_corr7` established;
- exact identity match established;
- 198 / 198 cohort members audited; 198 `PASS` / 0 `FAIL`;
- B-01 (`F-M-0352`) `PASS`;
- B-02 (`F-E-0010`) `PASS`;
- additional same-class repairs `PASS`;
- excerpt-normalization inventory `PASS`;
- `audit_contract` `PASS`;
- closure chain `facts → lineage → coverage → graph → summary → reports → manifest → identity` `PASS`;
- CORR6 → CORR7 authority-bound diff `PASS`;
- BLOCKING findings = 0;
- MATERIAL findings = 0.

The audit did not claim to create Owner acceptance, and this file does not claim a stronger verdict than `PASS`.

### Physical recovery status of the IV record

`NOT LOCATED IN REPOSITORY OR WORKBENCH DURING THIS ACT`

Searches performed: repository tree; Workbench tree; Workstation-wide search under `/Users/entp_psyche/Desktop` for the act identifier `EXXON-MOBIL-CORR7-CLASS-CLOSURE-INDEPENDENT-REVERIFICATION` and for the sealed identity `995453defabd9ff9a57a89396f8dfda338e0c55a1c8ee17b305a79fbf15cf4f0`.

The identity resolves, on the evidence available, only inside the sealed package's own manifest and inside the author-side CORR7 working log. No standalone independent-verification report artifact was found at any of those locations.

This is a statement about where the IV evidence currently physically lives. It is not a downgrade of the IV verdict and not a challenge to the Owner decision recorded in §10.

---

## 10. OWNER FACTUAL SEAL

**OWNER DECISION — VERBATIM BLOCK (as issued to this act):**

```text
EXXON-MOBIL CORR7 + INDEPENDENT REVERIFICATION — OWNER ACCEPTED.
Exact package identity accepted:
995453defabd9ff9a57a89396f8dfda338e0c55a1c8ee17b305a79fbf15cf4f0

OBS-01 through OBS-03 accepted as nonblocking carried observations.
CORR8 not required.
```

Accepted state: `OWNER_ACCEPTED_FACTUAL_SEAL`.

Boundary of the acceptance:

- it **does not** authorize factual-scope expansion;
- it **does not** change T0;
- it **does not** change geometry;
- it **does not** change the source universe;
- it **does not** change source-registry membership.

`CORR8` is not required.

### Recovery status

OWNER DECISION STATE: `RECORDED AS ISSUED TO THIS ACT`

ORIGINAL STANDALONE OWNER ARTIFACT: `NOT PHYSICALLY RECOVERED`

This is provenance honesty about the artifact, not a downgrade of the Owner decision.

---

## 11. CARRIED OBSERVATIONS

Owner-accepted as nonblocking carried observations:

### OBS-01

174 `KEEP` members retain the historical boilerplate `atomic_object_justification` in `06_FACTS.json`, while the required record-specific machine-readable grounds live in `18_ATOMICITY_COHORT_ADJUDICATION_CORR7.json`.

Re-checked against the sealed package during this act: exactly 174 records in `06_FACTS.json` carry the boilerplate value `single documented proposition (no multi-clause content)`, while the parent cohort is 198 and every one of the 198 members has an explicit record-specific adjudication row in `18_ATOMICITY_COHORT_ADJUDICATION_CORR7.json` (174 `KEEP_ATOMIC_WITH_SPECIFIC_GROUND`, 19 `EXCERPT_REPAIR`, 4 `SPLIT`, 1 `RESTATE`). Consistent with OBS-01 as stated.

### OBS-02

Four adjudication grounds are phrased at parent block/facet level but remain record-specific and nonblocking.

Not independently re-derived during this act: the specific four grounds referenced by the audit were not physically recovered (see §9). Recorded as an Owner-accepted carried observation, not as an act-verified count.

### OBS-03

`05_QUARANTINE_LEDGER.json` differs from CORR6 only by mechanical revision / note / `generated_at` restamping; the underlying four entries are unchanged.

Re-checked against the sealed package during this act: the `entries` array is byte-identical between `candidate_corr6/05_QUARANTINE_LEDGER.json` and `candidate_corr7/05_QUARANTINE_LEDGER.json` (same four entries `Q-01`…`Q-04`); `counts` (`total = 4`), `case_id`, and `outcome_firewall_status` are also identical. The only differences are `revision` (`CORR6` → `CORR7`), `generated_at`, and the note field. Consistent with OBS-03 as stated.

### Standing statement

These are accepted nonblocking carried observations. They are **not** authorization to modify the sealed factual package, and this act does not repair, strengthen, or reopen any of them.

---

## 12. FROZEN / SUPERSEDED STATE

- `candidate_corr7` is the terminal sealed factual package for this case.
- Earlier Exxon-Mobil candidates are superseded **for factual-input purposes**.
- Do not delete them and do not rewrite them.
- The sealed package is frozen. This act writes governance material only and touches no byte of the package.

Note on the package's internal status fields: the frozen package's own `00_EXECUTIVE_SUMMARY.md` and `01_T0_DETERMINATION.md` carry author-candidate status wording such as "not independently verified; not Owner-accepted". Those fields are the pre-seal author-candidate status and are part of the frozen bytes by design. Independent verification (§9) and Owner acceptance (§10) occurred after the package was frozen, so they are recorded in governance material such as this file rather than inside the frozen package. The seal does not contradict the package; the acceptance for this identity is external to it.

---

## 13. ANTI-HINDSIGHT / CONTAMINATION FIREWALL

This seal does not import:

- post-T0 outcomes;
- Environment;
- A5;
- ECS;
- Pair;
- report or product narrative.

Not used as factual or Environment authority:

- `src/data/caseStudies.js`
- `src/data/finalDeliverableData.js`
- `src/generated/newlogic/reporting.json`

---

## 14. GOVERNANCE STATUS

Status of this file at creation time:

```text
OWNER_ACCEPTED_FACTUAL_SEAL /
PHYSICAL_BINDING_CANDIDATE /
AWAITING_INDEPENDENT_BINDING_VERIFICATION /
NO_GIT
```

Not claimed at creation time: `GOVERNANCE-BOUND`, `GIT-CLOSED`, `REMOTE-PUSHED`, `REPLAY-READY`.

### Files neither created nor modified by this act

- `02_DEUTSCHE_BANKERS_TRUST_FACTUAL_SEAL.md`
- `03_PFIZER_MEGAMERGERS_FACTUAL_SEAL.md`
- `04_AOL_TIME_WARNER_FACTUAL_SEAL.md`
- `05_AECOM_URS_FACTUAL_SEAL.md`
- `CASES_2_5_FACTUAL_SEAL_INDEX.md`
- `CASES_2_5_FACTUAL_SEAL_SHA256SUMS.txt`

The cases 2–5 index and its checksum list declare a cases-2–5 scope. Case 6 is outside that declared scope and is therefore not registered into them by this act.

---

## 15. NEXT REQUIRED ACT

Targeted independent verification of this exact two-file physical-binding candidate.

That act is outside this file.
