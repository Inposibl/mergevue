# Stage-1 transfer-integrity correction campaign 1
Date: 2026-09-25
Role: FACTUAL CORRECTION AUTHOR
Actor: Grok
Act: `POST-10-CALIBRATION-STAGE1-TRANSFER-INTEGRITY-CORRECTION-CAMPAIGN-1`

## 1. ACT / OWNER AUTHORIZATION
The Owner explicitly authorized `POST-10-CALIBRATION-STAGE1-TRANSFER-INTEGRITY-CORRECTION-CAMPAIGN-1` with Grok as correction author. The closed correction scope is DC-001 through DC-019 as consolidated in the pinned census report. This act produced four separate case-local correction candidates and this campaign report. It did not issue an independent PASS, accept the candidates, rebind seals or the corpus freeze, mutate Git, or start Stage 2.

## 2. ROLE / INDEPENDENCE BOUNDARY
Grok acted only as correction author. Grok did not act as independent correction auditor, Owner, methodology authority, Environment analyst, mechanism-normalization author, Git agent, or seal/freeze rebinding authority. Package-local checks in this report are author-side mechanical checks. They are not an independent verification.

## 3. PINNED CONSOLIDATION AUTHORITY
Physical report: `MergeVue-M&A WORKBENCH/01_AGENT_REPORTS/POST_10_CALIBRATION_STAGE1_TRANSFER_INTEGRITY_CENSUS_CONSOLIDATION_1_REPORT_2026-09-25.md`

SHA-256: `b99d7f1728fb7df53f80fdeb0d948cfdf470fb50d833f70a69de38a27d5c77ee`

The hash matched the Owner pin before any candidate was written. Census counts used as the closed register: cases 9/9, sides 18/18, facts reviewed 905/905, confirmed transfer defects 19, blocking 8, major 8, minor 3, advisory 0, unresolved fact IDs none. No new evidence search was performed. No new filing or document class was added.

## 4. FROZEN INPUT IDENTITIES
All four frozen inputs were recomputed and matched before copying.

| Package | Frozen path | Identity formula | Frozen identity |
|---|---|---|---|
| A Daimler–Chrysler | `Downloads/CASE-3.5_DAIMLER_CHRYSLER_BASELINE_v1/` and sibling zip | SHA-256 of `CANONICAL_BASELINE_MANIFEST.json`; SHA-256 of the zip archive | Manifest `652273f1d0a6c8a827b32c66794ce0ee332e66864a915b498ea5edb79cb80236`; ZIP `f31893aec80d35ec6eda4f998aaf9e28bf29f917d9658cbf38b84082b381899a` |
| B Pfizer–Megamergers | `pfizer-megamergers/01_T0_PRE_T0_BASELINE/CORR1/candidate/` | SHA-256 of `11_SHA256SUMS.txt` | `30f5feab45ce6f034641fd095e6a25ce82e3b66a13037b708c3d0e136c5ea94a` |
| C AECOM–URS | `aecom-urs/01_T0_PRE_T0_BASELINE/candidate/` | SHA-256 of sorted `relative_path<TAB>sha256<TAB>byte_size<LF>` lines, excluding `12_SHA256SUMS.txt` | `c95a623cfccdcba8e35d2069bda11de523e7f039a81c51095e6081deec4466b8` (32 members, 14,936,094 bytes) |
| D Exxon–Mobil | `exxon-mobil/01_T0_PRE_T0_BASELINE/candidate_corr7/` | Same inventory formula as Package C, excluding `12_SHA256SUMS.txt` | `995453defabd9ff9a57a89396f8dfda338e0c55a1c8ee17b305a79fbf15cf4f0` (38 members, 3,323,055 bytes) |

Paths for B, C, and D are under `MergeVue-M&A WORKBENCH/02_CASE_RESEARCH/`. Package A is under the repository `Downloads/` tree and was already untracked. The v1.0.5 Daimler identity and Exxon `candidate_corr6` and earlier were not used as correction inputs.

## 5. CANDIDATE OUTPUT PATHS
Sibling names follow each case's existing generation token and do not overwrite the frozen input.

| Package | FROZEN_INPUT_PATH | NEW_CANDIDATE_PATH | Naming basis |
|---|---|---|---|
| A | `Downloads/CASE-3.5_DAIMLER_CHRYSLER_BASELINE_v1/` plus `Downloads/CASE-3.5_DAIMLER_CHRYSLER_BASELINE_v1.zip` | `Downloads/CASE-3.5_DAIMLER_CHRYSLER_BASELINE_v1.0.7_CANDIDATE/` plus `Downloads/CASE-3.5_DAIMLER_CHRYSLER_BASELINE_v1.0.7_CANDIDATE.zip` | Internal manifest versions run 1.0.0 through 1.0.6 inside one folder. Overwrite of that folder is forbidden. The next version token is 1.0.7, placed in a new sibling directory and a new zip. |
| B | `.../pfizer-megamergers/01_T0_PRE_T0_BASELINE/CORR1/candidate/` | `.../pfizer-megamergers/01_T0_PRE_T0_BASELINE/CORR2/candidate/` | CORR1 is the existing correction-generation directory beside `candidate/`. CORR2 is the next sibling. |
| C | `.../aecom-urs/01_T0_PRE_T0_BASELINE/candidate/` | `.../aecom-urs/01_T0_PRE_T0_BASELINE/candidate_corr2/` | The frozen folder is named `candidate` and its checksum comment already labels that generation CORR1. `candidate_corr2` continues that generation number without overwriting `candidate` and without reusing the CORR1 name. |
| D | `.../exxon-mobil/01_T0_PRE_T0_BASELINE/candidate_corr7/` | `.../exxon-mobil/01_T0_PRE_T0_BASELINE/candidate_corr8/` | The existing series is `candidate_corr1` through `candidate_corr7`. `candidate_corr8` is the next sibling. |

## 6. PACKAGE A CORRECTION
DC-002, blocking, Chrysler, `C-B02`, source `C33-S01`.

Frozen proposition said the LH team "used manual versions of production tools." The registered excerpt already says the team "wanted to use manual versions of the tools that would be used in production" and invited manufacturing representatives to help design them. The early-prototype sentence and the manufacturing-invitation clause were left in place.

Corrected proposition: "The LH team built its first prototype 30 weeks earlier than normal practice, wanted to use manual versions of production tools, and invited manufacturing representatives to help design them to test production feasibility early."

The same proposition string was aligned in `BASELINE_FACT_PACK.json`, `CERTIFIED_FACT_REGISTER.json`, and `admittedFacts` inside `CANONICAL_BASELINE_MANIFEST.json`. The `exactEdgeCorrectionRegister` rationale for `C-B02` no longer says "using manual production tools"; it now records the team's stated intent to use manual production tools. The stored excerpt was already the source sentence and was not rewritten. `C33-S01` bytes were not changed.

`VALIDATION_REPORT.md` did not itself state the completed-use clause. Its current-version statements were updated to v1.0.7, and a DC-002 preface was added. The CORR6 narrative, including "Candidate v1.0.6 performs only the Owner-authorized local corrections," remains as the historical v1.0.6 record.

Current JSON version fields are 1.0.7. Frozen v1.0.6 is appended in `supersededCandidates` with the frozen manifest and archive hashes and with verifier text that this act issues no verdict. `C-B01` and `C-B04` propositions are unchanged. The package-local `BASELINE_EVIDENCE_SEAL_CANDIDATE.json` in the new directory records the new manifest hash, version 1.0.7, timestamp 2026-09-25, `PENDING_INDEPENDENT_REVERIFICATION`, `ownerSigned` false. That file is not the governance factual seal.

New manifest SHA-256: `d72b8125fee09866a6a25c1415a021f891aadc15449f758a2b2f10ee521abaeb`
New zip SHA-256: `3951b0167f01d196da53b9df758d2bf4fff8b00df6feb9158aae366e5377544d`

## 7. PACKAGE B CORRECTION
DC-003, blocking, Wyeth, `F0028`, source `S0011`.

The frozen proposition made the person serving as CFO eligible regardless of age and omitted the source condition. The existing bounded passage already says eligibility is "subject to meeting the other eligibility criteria for participation in the plan" and that Gregory Norden met the other criteria other than age. The passage was not rewritten. No new source was added.

Corrected proposition restores that condition on the general CFO rule, keeps the 1 December 2008 effective date and the age-waiver meaning, and keeps the Norden identification together with the supported statement that he met those other eligibility criteria.

`10_MANIFEST.json` identity fields were updated for this generation: `act_id` `PFIZER-MEGAMERGERS-T0-PRE-T0-BASELINE-CORR2`, parent identity `30f5feab45ce6f034641fd095e6a25ce82e3b66a13037b708c3d0e136c5ea94a`, verification `NOT_PERFORMED_FOR_CORR2`, seal status `NOT_GRANTED_FOR_CORR2`, correction findings `DC-003`. Repository head, geometry, fact counts, and the prior verifier hash were left as carried fields. Warner-Lambert and Pharmacia geometry was not reopened. `S0011` bytes were not changed. F0028 has no contradiction ID.

New package identity, SHA-256 of `11_SHA256SUMS.txt`: `5f4e698bf696911a525e7b77b5758f8496f1cb31904c9cf8fac64ee534766af5`

## 8. PACKAGE C CORRECTION
Eight facts in `06_FACTS.json`. Registered SEC source bytes were not changed. `07_CONTRADICTIONS.json` C-02 was rechecked and left unchanged: it links `F-U-0016` and `F-U-0020` and keeps the March 26 / March 27 distinction, and it does not spell the director name. Source graph, coverage, gaps, and the executive summary do not restate Creil, "sole compensation consultant," or "Thomas H. Hicks," so they were not edited.

| DC | Fact | Correction |
|---|---|---|
| DC-001 | `F-U-0027` | August 2013 Cook selection: sole → primary. Vote history, outreach, and ISS review remain. The November redesign sentence that uses sole in a narrower scope was not pulled into this fact and was not rewritten as primary. The bounded excerpt already said primary. |
| DC-005 | `F-A-0028` | Base salary is what the letter agreement provides. The 150% cash figure is eligibility to earn a target incentive. The Promotion Award and the option award are granted equity. No payout was invented. The S-A5 excerpt was expanded to those three predicates. |
| DC-006 | `F-A-0029` | Severance requires both a change in control and an eligible termination. Performance-based equity uses achievement through the change-in-control date. Pledging is prohibited except in limited circumstances subject to Company approval. Hedging prohibition, gross-up statement, clawback, multiples, health continuation, and the pro-rata target bonus remain. The S-A2 excerpt was expanded to those conditions. |
| DC-007 | `F-U-0018` | Continuation as CEO, Chairman, and director is "in his sole discretion." The bounded S-U4 excerpt already contained that qualifier. |
| DC-008 | `F-U-0016` | Diane C. Creil → Diane C. Creel. The bounded excerpt did not contain the misspelled name. Board-expansion terms are unchanged. |
| DC-009 | `F-U-0020` | Ms. Creil → Ms. Creel in the proposition and in the S-U5 excerpt. Committee assignments are unchanged. |
| DC-010 | `F-U-0023` | Diane C. Creil → Diane C. Creel in the proposition and in the S-U6 excerpt. Vote counts 59,952,016 FOR / 512,175 AGAINST and the other vote rows are unchanged. |
| DC-011 | `F-U-0033` | Thomas H. Hicks → H. Thomas Hicks. Agreement terms are unchanged. |

Person chain: `F-U-0016`, `F-U-0020`, and `F-U-0023` now use Diane C. Creel. The census named `F-U-0011` as the Hicks officer link. In the frozen package `F-U-0011` is the Koffel CEO fact and does not name Hicks. The officer fact that already says H. Thomas Hicks is `F-U-0013`. `F-U-0011` and `F-U-0013` were not edited. `F-U-0033` now uses the same H. Thomas Hicks identity as `F-U-0013`. The amendment 8-K narrative uses "Thomas H. Hicks" once; the exhibit title in that filing, and the FY2013 officer table, use "H. Thomas Hicks." The correction follows the confirmed DC and the officer-table identity. Source bytes were not changed.

The `06_FACTS.json` revision string keeps the CORR1 sentence and appends a CORR2 transfer-integrity line. New inventory identity: `d8b6d21e32198c6d240954c04715ad10561af5383461c7cc56b32d56efa94517` (32 members, 14,938,029 bytes).

## 9. PACKAGE D CORRECTION
Nine facts in `06_FACTS.json`, plus direct-dependency content in `F-M-0235`. Source files were not mutated. CORR7 historical members `13` through `19` are byte-identical to `candidate_corr7`. A new lineage file `20_TRANSFER_INTEGRITY_CORRECTION_LINEAGE.json` was added. The `06_FACTS.json` revision string keeps the CORR7 text and appends a CORR8 line.

`18_ATOMICITY_COHORT_ADJUDICATION_CORR7.json` still quotes the pre-correction propositions. That file is the preserved CORR7 adjudication record, copied byte-for-byte. It is not the current proposition carrier. Current propositions are in `06_FACTS.json`.

| DC | Fact | Correction |
|---|---|---|
| DC-004 | `F-E-0066` | 1997 wages, salaries and employee benefits are $5,695 million. $5,916 million is the 1993 column. The excerpt and limitation now carry the year header 1997, 1996, 1995, 1994, 1993. |
| DC-012 | `F-E-0042` | The 0.7 percent figure is common shares outstanding excluding treasury shares, measured on December 31 of the preceding year, with unused annual capacity carried forward. The S-E1 excerpt was extended through the carryover sentence. |
| DC-013 | `F-M-0104` | The majority rule excepts the Item 2 independent-auditor appointment. Abstentions count as votes cast but are not counted for the SEC resubmission percentage tests. |
| DC-014 | `F-M-0138` | The committee annually reviews ranges and approves adjustments when necessary. The fact does not say the ranges were adjusted every year. The unrelated Noto-only excerpt was replaced with the salary-range passage. |
| DC-015 | `F-M-0148` | Broader comparator cross-checks are stated each year. Outside-consultant review is stated for 1997 and the prior year. |
| DC-016 | `F-M-0233` | Nine-month net income is $2,568 million in 1997 and $1,856 million in 1998, a decline of $712 million. The excerpt keeps the 1997-then-1998 column header and the printed change. The false "figures verified" limitation was removed. |
| DC-017 | `F-M-0234` | The $61 million decline is operating earnings adjusted for special items, $102 million to $41 million. Reported Chemical earnings are $155 million to $41 million, a decline of $114 million. The two series are not merged. |
| DC-018 | `F-M-0304` | Trigger (4) is any stockholder or a group of stockholders acting in concert, owning beneficially or having acquired the right to vote more than 25 percent. |
| DC-019 | `F-M-0306` | The named executive group, including Noto, Renna, Swanson, DeLoach, and Arnheim, is covered when employment ends within two years of a change of control. `F-M-0307` remains the separate other-employee designated-period rule and was not edited. |

`F-M-0235` is the direct dependency of DC-016. Its limitation had described nine-month 1998 net income as $2,568 million versus $1,856 million and called that a favorable direction. That statement is now the corrected decline, and `F-M-0233` is restored to `counterevidence_ids` beside `F-M-0232` because the package's own rule retains an opposite or limiting direction. The `F-M-0235` proposition was not changed. Historical `15_FINDING_DISPOSITION_CORR5.json` was not rewritten.

Checked and left unchanged: `F-E-0065`, `F-M-0117`, `F-M-0232`, `F-M-0295`, `F-M-0297`, `F-M-0298`, `F-M-0303`, `F-M-0305`, `F-M-0307`, `F-M-0157`. `F-E-0065` still reads year-end 1997 headcount as 80 thousand and 1993 as 91 thousand, which is the same 1997-first column order as the corrected wage figure. `F-M-0303` already includes the individual-stockholder path at the 10 percent threat trigger. `F-M-0157` states the 31 December 1997 payable amounts on the source's amounts sentence; the two-year condition is carried on `F-M-0306`. `F-M-0232` still states third-quarter 1998 net income of $509 million versus $892 million in third-quarter 1997.

Non-defect debt called out by the census was not repaired: `F-E-0213` provenance underbinding, `F-M-0232` excerpt underbinding, `F-M-0245` Delaware excerpt underbinding, and `F-M-0011` retirement-date limitation precision.

New inventory identity: `f50f6c74512b1c13d9253c1f6f8345136c824bf51e18587cbccfa339eb732833` (39 members, 3,328,312 bytes).

## 10. EXACT DC-001…DC-019 CORRECTION MATRIX

| DC | Severity | Case | Side | Fact | Old error | Corrected candidate meaning | Changed members | Source | Direct dependency members | Status |
|---|---|---|---|---|---|---|---|---|---|---|
| DC-001 | BLOCKING | AECOM–URS | URS | `F-U-0027` | August 2013 Cook selection called sole compensation consultant | August selection is primary compensation consultant; November sole redesign was not broadened | `06_FACTS.json` | S-U2 | none edited; November distinction left in the source | CORRECTED_IN_CANDIDATE |
| DC-002 | BLOCKING | Daimler–Chrysler | Chrysler | `C-B02` | Completed use of manual production tools | Intent: wanted to use manual versions of production tools; prototype and manufacturing invitation kept | fact pack, certified register, manifest admitted fact and edge rationale | C33-S01 | `C-B01`, `C-B04` checked, unchanged; DISC-2 binding left stale | CORRECTED_IN_CANDIDATE |
| DC-003 | BLOCKING | Pfizer–Megamergers | Wyeth | `F0028` | CFO eligible regardless of age, condition omitted | General CFO age waiver remains subject to the other eligibility criteria; Norden met those other criteria | `04_ATOMIC_FACT_LEDGER.jsonl` | S0011 | no contradiction ID | CORRECTED_IN_CANDIDATE |
| DC-004 | BLOCKING | Exxon–Mobil | Exxon | `F-E-0066` | 1997 wages $5,916 million | 1997 wages $5,695 million; $5,916 million is 1993; year header retained | `06_FACTS.json` | S-E1 | `F-E-0065` checked, unchanged | CORRECTED_IN_CANDIDATE |
| DC-005 | BLOCKING | AECOM–URS | AECOM | `F-A-0028` | One "received" predicate covered salary, target cash, and equity | Agreement provides base salary; cash incentive is eligibility to earn the target; equity awards were granted | `06_FACTS.json` | S-A5 | no contradiction ID | CORRECTED_IN_CANDIDATE |
| DC-006 | BLOCKING | AECOM–URS | AECOM | `F-A-0029` | Double-trigger, performance basis, and pledge exception omitted | Both change in control and eligible termination; performance achievement through the change-in-control date; pledging has Company-approved exceptions | `06_FACTS.json` | S-A2 | no contradiction ID | CORRECTED_IN_CANDIDATE |
| DC-007 | BLOCKING | AECOM–URS | URS | `F-U-0018` | Koffel continuation omitted "in his sole discretion" | Continuation is in his sole discretion | `06_FACTS.json` | S-U4 | excerpt already contained the qualifier | CORRECTED_IN_CANDIDATE |
| DC-008 | MAJOR | AECOM–URS | URS | `F-U-0016` | Diane C. Creil | Diane C. Creel | `06_FACTS.json` | S-U4 | C-02 checked, unchanged | CORRECTED_IN_CANDIDATE |
| DC-009 | MAJOR | AECOM–URS | URS | `F-U-0020` | Ms. Creil, including the bounded excerpt | Ms. Creel in proposition and excerpt | `06_FACTS.json` | S-U5 | C-02 checked, unchanged | CORRECTED_IN_CANDIDATE |
| DC-010 | MAJOR | AECOM–URS | URS | `F-U-0023` | Vote row bound to Diane C. Creil | Diane C. Creel; vote numbers unchanged | `06_FACTS.json` | S-U6 | person chain with `F-U-0016` and `F-U-0020` | CORRECTED_IN_CANDIDATE |
| DC-011 | MINOR | AECOM–URS | URS | `F-U-0033` | Thomas H. Hicks | H. Thomas Hicks | `06_FACTS.json` | S-U7 | `F-U-0013` already used H. Thomas Hicks and was not edited; `F-U-0011` is Koffel and was not edited | CORRECTED_IN_CANDIDATE |
| DC-012 | MAJOR | Exxon–Mobil | Exxon | `F-E-0042` | 0.7 percent of total common shares, no date, no carryover | Prior December 31 shares outstanding excluding treasury; unused capacity carries forward | `06_FACTS.json` | S-E1 | no contradiction ID | CORRECTED_IN_CANDIDATE |
| DC-013 | MAJOR | Exxon–Mobil | Mobil | `F-M-0104` | General non-director majority rule without Item 2 or SEC abstention exception | Item 2 auditor exception and abstention exception for SEC resubmission tests restored | `06_FACTS.json` | S-M2 | `F-M-0117` checked, unchanged | CORRECTED_IN_CANDIDATE |
| DC-014 | MINOR | Exxon–Mobil | Mobil | `F-M-0138` | Annually reviewed and adjusted | Annual review and adjustments approved when necessary | `06_FACTS.json` | S-M2 | `F-M-0295` checked, unchanged | CORRECTED_IN_CANDIDATE |
| DC-015 | MINOR | Exxon–Mobil | Mobil | `F-M-0148` | Outside consultant conducted the eighteen-company review each year | Annual broader cross-check; consultant review stated for 1997 and the prior year | `06_FACTS.json` | S-M2 | `F-M-0297`, `F-M-0298` checked, unchanged | CORRECTED_IN_CANDIDATE |
| DC-016 | BLOCKING | Exxon–Mobil | Mobil | `F-M-0233` | Nine-month 1998 $2,568 million versus 1997 $1,856 million, called verified | 1997 $2,568 million, 1998 $1,856 million, decline $712 million; false verified limitation removed | `06_FACTS.json` | S-M3 | `F-M-0235` corrected; `F-M-0232` and `F-M-0234` rechecked | CORRECTED_IN_CANDIDATE |
| DC-017 | MAJOR | Exxon–Mobil | Mobil | `F-M-0234` | $61 million called unqualified Chemical income | $61 million is adjusted operating earnings; reported decline is $114 million | `06_FACTS.json` | S-M3 | limitation no longer states nine-month 1997 net income as $1,856 million | CORRECTED_IN_CANDIDATE |
| DC-018 | MAJOR | Exxon–Mobil | Mobil | `F-M-0304` | >25 percent trigger limited to a group acting in concert | Any stockholder or a group acting in concert, beneficial ownership or voting right | `06_FACTS.json` | S-M2 | `F-M-0303`, `F-M-0305` checked, unchanged | CORRECTED_IN_CANDIDATE |
| DC-019 | MAJOR | Exxon–Mobil | Mobil | `F-M-0306` | Executives under generic designated periods | Named executive group: termination within two years after change of control | `06_FACTS.json` | S-M2 | `F-M-0307` and `F-M-0157` checked, unchanged | CORRECTED_IN_CANDIDATE |

No DC is omitted, duplicated, or added. Every status is `CORRECTED_IN_CANDIDATE`.

## 11. CHANGED-MEMBER MANIFEST
Removed frozen members: none. Every row below is tied to DC-001…DC-019 or to a mechanical identity consequence of those edits.

### Package A
| Path | Old SHA-256 | New SHA-256 | Class | Why / DC |
|---|---|---|---|---|
| `BASELINE_FACT_PACK.json` | `0cd93473a596ed0b60b04791918863fa6404544e400cace9eaddb41d024fd6cf` | `e34d6a78c8d44e0854cdb9b6060cfb1a855f59c2c0175dfb3947aaf1dbee8d2c` | FACTUAL_CORRECTION | `C-B02` proposition; version fields 1.0.7. DC-002 |
| `CERTIFIED_FACT_REGISTER.json` | `a92fef31cf9eab6c525131f995eaa4076c69c4846e4a7aea0a8c2683164ec476` | `268ee5818a3fc6f660a634cc125679c365c759b0a5c0c226f4bca11aca37f532` | FACTUAL_CORRECTION | same `C-B02` proposition; version 1.0.7. DC-002 |
| `CANONICAL_BASELINE_MANIFEST.json` | `652273f1d0a6c8a827b32c66794ce0ee332e66864a915b498ea5edb79cb80236` | `d72b8125fee09866a6a25c1415a021f891aadc15449f758a2b2f10ee521abaeb` | FACTUAL_CORRECTION | admitted `C-B02`, edge rationale, version 1.0.7, frozen v1.0.6 appended to supersededCandidates. DC-002 |
| `VALIDATION_REPORT.md` | `17fee759a47fa7d5a6a186f3574c70361e25620e6f3a9c41685a104f87c5dc78` | `f986ef18d1bb4acbd1ba84fc582a7c048627a35ee2c6da2082030de6515743e5` | DIRECT_DEPENDENCY_CORRECTION | current-version statements and DC-002 preface; CORR6 narrative retained. DC-002 |
| `BASELINE_EVIDENCE_SEAL_CANDIDATE.json` | `3aeb301bb32d45e5d325304dc65a66caec1e75bafa64c47c2f59789f0c816277` | `ed43cf769b350bdfa0b14aa8eb7fde7112b7246c0b27b7f459718602b6d59c43` | MECHANICAL_IDENTITY_UPDATE | package-local pending seal candidate now names the new manifest hash. Not a governance seal. DC-002 |
| `EXCLUDED_CANDIDATE_FACTS.json` | `9e6e98214193d7223222d460fd568306b1a16ad4c94379d7ea3b53d1e12dea78` | `c77637111e64b1a536a6182846acb8d1f3d70dd1f686afdc7c19e59a0c5e4f8d` | MECHANICAL_IDENTITY_UPDATE | current version field 1.0.7 only |
| `SOURCE_ARTIFACT_INDEX.json` | `680775bbe8b4cc45f1e1861312f25a5fbc8bffc2ac41374f17fd8d4a1056160c` | `5f9041734f52858c0b268eab3fd184aafd8db1a476a5162d3f839278becbd1c8` | MECHANICAL_IDENTITY_UPDATE | current version field 1.0.7 only |
| `SOURCE_REGISTER.json` | `a1bddc423e47fec95c3c088a6bea0531c1e907ab415c9f35882eff6c372ec23e` | `64ca097dccaa95ec17642c6ceaed495e2d1064462627cad3ed47c8de04226109` | MECHANICAL_IDENTITY_UPDATE | current version field 1.0.7 only |
| `T0_DETERMINATION_RECORD.json` | `47a972aa4b655f6b4c1ce434d8360d9ac1427fbaa584bc037d660e36267a9671` | `4f7ad5fd73bfaaf44aac91498db1088c38b17a482853540e8a1a464427cbca06` | MECHANICAL_IDENTITY_UPDATE | current version field 1.0.7 only |
| `CASE-3.5_DAIMLER_CHRYSLER_BASELINE_v1.0.7_CANDIDATE.zip` | added sibling; frozen zip unchanged | `3951b0167f01d196da53b9df758d2bf4fff8b00df6feb9158aae366e5377544d` | MECHANICAL_IDENTITY_UPDATE | new archive of the new directory. DC-002 |

### Package B
| Path | Old SHA-256 | New SHA-256 | Class | Why / DC |
|---|---|---|---|---|
| `04_ATOMIC_FACT_LEDGER.jsonl` | `23846a6d3e48cf0cfa3989ed14843568c9581a06f77dff7ea2db01625bf04af8` | `b1f0e206a0233b3a5bf4929286173160352c2524a8b0bbfc70b4d96d2fd12ca7` | FACTUAL_CORRECTION | `F0028` proposition only. DC-003 |
| `10_MANIFEST.json` | `722204675753131454dbfc3d4e613591804462214d6ceb1d2c4024979b4a2c4f` | `2ca32e4753f5bffb436f401cccca70497190b295c9415aa4f0ec9c82800915dc` | MECHANICAL_IDENTITY_UPDATE | CORR2 act id, parent identity, unverified status, finding id DC-003 |
| `11_SHA256SUMS.txt` | `30f5feab45ce6f034641fd095e6a25ce82e3b66a13037b708c3d0e136c5ea94a` | `5f4e698bf696911a525e7b77b5758f8496f1cb31904c9cf8fac64ee534766af5` | MECHANICAL_IDENTITY_UPDATE | checksum lines for the ledger and manifest |

### Package C
| Path | Old SHA-256 | New SHA-256 | Class | Why / DC |
|---|---|---|---|---|
| `06_FACTS.json` | `9b17c7a48aba6e1efd5f84162f370a48a6158ac2639f16eba4bc4737f2239a19` | `a341928f14d8ff44fe4699bbf751cee3f1ac8993ab546d967c2c3ce537a879c4` | FACTUAL_CORRECTION | eight target facts; revision line appended. DC-001, DC-005–DC-011 |
| `12_SHA256SUMS.txt` | `fe31f1f04e62f0fd2b9a9f0b0efb8f0ec0a630e6070d3071c49c13ba84d53aa6` | `f6990db05d36439506d3c0e02986409b97ae26a0b2431ffe832c7674e22279c0` | MECHANICAL_IDENTITY_UPDATE | recomputed hashes and CORR2 inventory identity |

### Package D
| Path | Old SHA-256 | New SHA-256 | Class | Why / DC |
|---|---|---|---|---|
| `06_FACTS.json` | `5c5f1af030f2175fd5078ec5a6a98a1285d03f4d8930b06c7d682030c77d4b63` | `415907847a64479d38298e6c48b38a727c93d26397867d7c6897843b7f05da36` | FACTUAL_CORRECTION | nine target facts plus `F-M-0235` dependency; CORR8 revision line appended. DC-004, DC-012–DC-019 |
| `20_TRANSFER_INTEGRITY_CORRECTION_LINEAGE.json` | added | `fab5effee7e137df96d925bd85ccd33f0ce71422b24dd0392bb72567b3e85ac1` | CORRECTION_LINEAGE | new CORR8 lineage; does not rewrite files 13–19 |
| `12_SHA256SUMS.txt` | `372587450e2fcd3b6f2f6203a32403944a2d838c826cb6f5eee362b6103c6d75` | `c66d4da8e2d878ce9da4eb1cc77aabc8670307f1e8861114d3acdf55f00ee5b4` | MECHANICAL_IDENTITY_UPDATE | recomputed hashes and CORR8 inventory identity |

`F-M-0235` changes sit inside `06_FACTS.json` and are `DIRECT_DEPENDENCY_CORRECTION` for DC-016. Bounded-excerpt replacements inside the same fact objects are `BOUNDED_EVIDENCE_ALIGNMENT` for DC-004, DC-005, DC-006, DC-009, DC-010, DC-012, DC-013, DC-014, DC-015, DC-016, DC-017, DC-018, and DC-019.

## 12. OLD VS NEW PACKAGE IDENTITIES

| Package | Old identity | New identity | Formula | Members | Total bytes | Checksum file SHA-256 |
|---|---|---|---|---|---|---|
| A | manifest `652273f1d0a6c8a827b32c66794ce0ee332e66864a915b498ea5edb79cb80236`; zip `f31893aec80d35ec6eda4f998aaf9e28bf29f917d9658cbf38b84082b381899a` | manifest `d72b8125fee09866a6a25c1415a021f891aadc15449f758a2b2f10ee521abaeb`; zip `3951b0167f01d196da53b9df758d2bf4fff8b00df6feb9158aae366e5377544d` | SHA-256 of the canonical manifest; SHA-256 of the sibling zip. The manifest does not contain its own zip hash. | 38 files in the directory, same count as the frozen directory | not part of the Daimler identity formula | no checksum-list file; the manifest is the identity carrier |
| B | `30f5feab45ce6f034641fd095e6a25ce82e3b66a13037b708c3d0e136c5ea94a` | `5f4e698bf696911a525e7b77b5758f8496f1cb31904c9cf8fac64ee534766af5` | SHA-256 of `11_SHA256SUMS.txt` | 32 physical files | not the identity carrier | `5f4e698bf696911a525e7b77b5758f8496f1cb31904c9cf8fac64ee534766af5` |
| C | `c95a623cfccdcba8e35d2069bda11de523e7f039a81c51095e6081deec4466b8` | `d8b6d21e32198c6d240954c04715ad10561af5383461c7cc56b32d56efa94517` | sorted `relative_path<TAB>sha256<TAB>byte_size<LF>`, excluding `12_SHA256SUMS.txt` | 32 | 14,938,029 | `f6990db05d36439506d3c0e02986409b97ae26a0b2431ffe832c7674e22279c0` |
| D | `995453defabd9ff9a57a89396f8dfda338e0c55a1c8ee17b305a79fbf15cf4f0` | `f50f6c74512b1c13d9253c1f6f8345136c824bf51e18587cbccfa339eb732833` | same inventory formula, excluding `12_SHA256SUMS.txt` | 39 inventory members; 40 physical files including the checksum file | 3,328,312 | `c66d4da8e2d878ce9da4eb1cc77aabc8670307f1e8861114d3acdf55f00ee5b4` |

No identity hashes itself. Package A does not put the new zip hash inside the manifest. Packages C and D do not put `12_SHA256SUMS.txt` inside the inventory digest. Package B's identity is the checksum file, and that file does not contain its own hash.

## 13. DIRECT DEPENDENCY CHECKS
- Daimler `C-B01` and `C-B04` share `C33-S01`. Their propositions and excerpts were compared and are unchanged. `C-B02` continuity remains `TEMPORAL CONTINUITY TO T0 = UNRESOLVED`.
- Pfizer `F0028` has an empty contradiction list. No other ledger line changed.
- AECOM C-02 still links `F-U-0016` and `F-U-0020` and still distinguishes March 26 from March 27. It was not edited. Creel is consistent across `F-U-0016`, `F-U-0020`, and `F-U-0023`. H. Thomas Hicks is consistent between `F-U-0033` and pre-existing `F-U-0013`.
- Exxon `F-E-0065` proposition unchanged and remains consistent with 1997-first columns. `F-M-0117`, `F-M-0295`, `F-M-0297`, `F-M-0298`, `F-M-0232`, `F-M-0303`, `F-M-0305`, `F-M-0307`, and `F-M-0157` propositions unchanged. `F-M-0235` dependency text and counterevidence list were corrected. `F-M-0234` no longer states the reversed nine-month net-income binding.

## 14. STALE SEAL/FREEZE BINDINGS
`STALE_BINDINGS_CREATED`

This act did not edit these files. They still bind the frozen package identities:

- `docs/governance/historical-corpus/factual-seals/01_DAIMLER_CHRYSLER_FACTUAL_SEAL.md` binds manifest `652273f1…` and zip `f31893ae…`
- `docs/governance/historical-corpus/factual-seals/03_PFIZER_MEGAMERGERS_FACTUAL_SEAL.md` binds `30f5feab…`
- `docs/governance/historical-corpus/factual-seals/05_AECOM_URS_FACTUAL_SEAL.md` binds `c95a623c…`
- `docs/governance/historical-corpus/factual-seals/06_EXXON_MOBIL_FACTUAL_SEAL.md` binds `995453de…`
- `docs/governance/historical-corpus/factual-seals/CASES_2_5_FACTUAL_SEAL_INDEX.md` repeats the Pfizer and AECOM factual identities
- `docs/governance/historical-corpus/MERGEVUE_POST_10_CALIBRATION_9_CASE_CORPUS_FREEZE_2026-09-25.md` binds all four frozen factual identities
- Package A additionally leaves stale the DISC-2 controlling-baseline copy at `MergeVue-M&A WORKBENCH/02_CASE_RESEARCH/CASE-3.5/SEALED_SUPPLEMENTS/DISC-2_2026-09-05/CASE-3.5_DISC-2_SEAL_MANIFEST.json`, which embeds the frozen manifest and zip hashes

Rebinding those authorities requires a later act after independent correction verification.

## 15. DOWNSTREAM DEPENDENCY CLASSIFICATION
No analytical package, Prediction Seal, outcome package, or other downstream file was modified. Outcome text was not used as factual evidence. Historical census reports, hygiene inventories, and earlier Exxon generations `candidate` through `candidate_corr6` still contain the old identities or the old propositions because they are historical records of those generations. They were not correction inputs and were not edited.

| Downstream artifact | Class |
|---|---|
| Four governance factual seals and the nine-case corpus freeze | IDENTITY_BINDING_ONLY, and reported above as stale bindings. Not modified. |
| Daimler DISC-2 seal manifest | IDENTITY_BINDING_ONLY. Embeds the frozen baseline manifest and zip. Not modified. |
| Daimler `CASE-3.6_2026-09-05` and `CASE-3.6.CORR1_2026-09-05` pre-outcome analysis, including the working TRV copy | SEMANTIC_DEPENDENCY_CONFIRMED. They bind the frozen manifest and zip, and `04_CHRYSLER_ANALYSIS.md` states mechanism `M-C02` as "Early prototyping with manual production tools." Other `C-B02` cites are continuity and scope, which remain in force. |
| Pfizer analytical candidate `04_PRE_OUTCOME_NATIVE_PAEC_ANALYTICAL_ZAI/candidate/` | SEMANTIC_DEPENDENCY_CONFIRMED. It binds `30f5feab…`, and `04_SIDE_B_ANALYSIS.md` says the retirement-plan amendment made the serving CFO eligible regardless of age without the other-eligibility condition. |
| Pfizer analytical IV, Prediction Seal `06_PRE_OUTCOME_PREDICTION_SEAL_ZAI/`, and outcome package `07_OUTCOME_REVEAL_CALIBRATION_ZAI/` | IDENTITY_BINDING_ONLY. They contain the frozen factual identity. The false CFO sentence was not found in those layers by this search. |
| AECOM analytical candidate `04_PRE_OUTCOME_NATIVE_PAEC_ANALYTICAL_ZAI/candidate/` | SEMANTIC_DEPENDENCY_CONFIRMED. It binds `c95a623c…` and records D-01 (Creil) and D-04 (sole versus primary) as carried unrepaired debt on the sealed record. |
| AECOM Prediction Seal, outcome package, and their IV reports | IDENTITY_BINDING_ONLY. They contain the frozen factual identity. |
| Exxon–Mobil analytical candidate `02_PRE_OUTCOME_NATIVE_PAEC_ANALYTICAL_ZAI/candidate/` | SEMANTIC_DEPENDENCY_POSSIBLE. It binds `995453de…` and lists corrected fact IDs, including `F-E-0066`, `F-M-0233`, `F-M-0304`, and `F-M-0306`. The searched analysis prose uses those CoC facts as formal provisions and does not restate the reversed nine-month figures. |
| Exxon–Mobil Prediction Seal, outcome package, outcome IV, and the superseded outcome archive | IDENTITY_BINDING_ONLY. They contain the frozen factual identity. |
| Exxon `candidate_corr8/18_ATOMICITY_COHORT_ADJUDICATION_CORR7.json` | Preserved historical adjudication inside the new candidate, byte-identical to the frozen input. It still quotes pre-correction propositions as the CORR7 record. It is not a current-fact carrier and was not rewritten. |
| ASTRA, PAEC control ledgers, and repository-hygiene inventories that quote the old hashes | IDENTITY_BINDING_ONLY historical citations. Not modified. |

## 16. SOURCE IMMUTABILITY CHECK
Registered source artifacts in all four new candidates are byte-identical to the frozen inputs. Compared path sets: Daimler `SOURCE_ARTIFACTS/`, Pfizer `sources/`, AECOM `sources/`, Exxon `sources/`. `SOURCE_ARTIFACTS_CHANGED = 0`.

## 17. FROZEN-INPUT IMMUTABILITY CHECK
Recomputed after the candidates were written:

- Daimler manifest still `652273f1d0a6c8a827b32c66794ce0ee332e66864a915b498ea5edb79cb80236`
- Daimler zip still `f31893aec80d35ec6eda4f998aaf9e28bf29f917d9658cbf38b84082b381899a`
- Pfizer `11_SHA256SUMS.txt` still `30f5feab45ce6f034641fd095e6a25ce82e3b66a13037b708c3d0e136c5ea94a`
- AECOM inventory still `c95a623cfccdcba8e35d2069bda11de523e7f039a81c51095e6081deec4466b8`
- Exxon CORR7 inventory still `995453defabd9ff9a57a89396f8dfda338e0c55a1c8ee17b305a79fbf15cf4f0`

`OLD_FROZEN_PACKAGES_OVERWRITTEN = 0`

## 18. FORBIDDEN-DELTA CHECK
Author comparison of every fact proposition:

- Daimler: the only proposition change in the fact pack, certified register, and manifest admitted facts is `C-B02`. The only edge-register object that changed is `C-B02`. Other JSON differences are version fields, the appended superseded v1.0.6 record, the package-local seal hash and timestamp, and the validation report.
- Pfizer: the only ledger line that changed is `F0028`, and within that line only `atomic_proposition` changed. The bounded passage is unchanged. Checksum lines changed only for the ledger and the manifest.
- AECOM: proposition changes are exactly `F-A-0028`, `F-A-0029`, `F-U-0016`, `F-U-0018`, `F-U-0020`, `F-U-0023`, `F-U-0027`, and `F-U-0033`. No other fact object changed. The header revision string was appended.
- Exxon: proposition changes are exactly the nine target facts. `F-M-0235` changed only in its limitation and counterevidence list. No other fact object changed. The header revision string was appended. Files 13–19 are byte-identical to the frozen input.

`UNAUTHORIZED_FACT_CHANGES = 0`. `NEW_FACTS_ADDED = 0`.

## 19. VALIDATION RESULTS
Author-side, not independent verification.

| Check | A | B | C | D |
|---|---|---|---|---|
| A. Target-fact census | 1/1 | 1/1 | 8/8 | 9/9 |
| B. Forbidden proposition delta | none | none | none | none |
| C. Source bytes | unchanged | unchanged | unchanged | unchanged |
| D. Members removed | none | none | none | none |
| E. Checksum / identity reconciliation | manifest and zip recomputed | every `11_SHA256SUMS.txt` line matches its file; identity is that file's hash | every `12_SHA256SUMS.txt` line matches; inventory digest matches the comment | every `12_SHA256SUMS.txt` line matches; inventory digest matches the comment |
| F. Frozen input | unchanged | unchanged | unchanged | unchanged |
| G. Listed direct dependencies | checked | checked | checked | checked |

Cross-package: four candidates exist; 19/19 DCs corrected; no DC omitted, duplicated, or added.

## 20. LIMITATIONS
- The census pointed the Hicks officer link at `F-U-0011`. The physical officer fact already using H. Thomas Hicks is `F-U-0013`. `F-U-0011` is the Koffel fact. Neither was edited. This is a dependency-label observation, not an additional factual correction.
- `S-U7` uses "Thomas H. Hicks" once in the narrative and "H. Thomas Hicks" in the exhibit title. The correction follows DC-011 and the officer-table form. The source file was not edited.
- Exxon `candidate_corr8` keeps the pre-correction wording inside the preserved CORR7 adjudication file `18_ATOMICITY_COHORT_ADJUDICATION_CORR7.json`. Current facts are in `06_FACTS.json`.
- Earlier Exxon generations and the pre-CORR1 Pfizer `candidate/` still contain the old propositions. They were not the frozen inputs for this act.
- Package-local Daimler seal JSON in the new candidate names the new manifest and remains unsigned and pending. It does not rebind the governance seal.
- Downstream analytical prose that repeats the old meanings was classified and left in place.
- These checks were performed by the correction author.

## 21. CANDIDATE COMPLETION STATUS
`TRANSFER_INTEGRITY_CORRECTION_CAMPAIGN_CANDIDATE_COMPLETE`

This means four separate correction candidates exist, all 19 authorized DCs are corrected in those candidates, the author-side package checks passed, frozen inputs and registered sources are unchanged, and no seal, freeze, governance, or Git object was mutated. It does not mean independent PASS, Owner acceptance, or Stage 1 closure.

## 22. WHAT THIS ACT DOES NOT CLAIM
- Independent correction PASS or FAIL.
- Owner acceptance of any candidate.
- Stage 1 closed.
- Factual seals rebound.
- Nine-case corpus freeze rebound.
- DISC-2 rebound.
- Analytical packages, Prediction Seals, or outcome packages regenerated.
- Environment, mechanism, pair, ECS, or friction work.
- Stage 2 started.
- Git commit, push, or index mutation.
- A new evidence search or a new admitted fact.

## 23. EXTERNAL REPORT IDENTITY NOTE
This report does not embed a self-referential SHA-256. Compute SHA-256, byte size, and LF count from the file after this exclusive write. The report is not a corrected factual package and not a governance or seal binding.

## Required counts
```
CORRECTION_PACKAGES_EXPECTED = 4
CORRECTION_PACKAGES_PRODUCED = 4

DC_EXPECTED = 19
DC_CORRECTED = 19 / 19

BLOCKING_DC_CORRECTED = 8 / 8
MAJOR_DC_CORRECTED = 8 / 8
MINOR_DC_CORRECTED = 3 / 3

PACKAGE_A_DC_CORRECTED = 1 / 1
PACKAGE_B_DC_CORRECTED = 1 / 1
PACKAGE_C_DC_CORRECTED = 8 / 8
PACKAGE_D_DC_CORRECTED = 9 / 9

SOURCE_ARTIFACTS_CHANGED = 0
UNAUTHORIZED_FACT_CHANGES = 0
NEW_FACTS_ADDED = 0
OLD_FROZEN_PACKAGES_OVERWRITTEN = 0
FACTUAL_SEALS_MUTATED = 0
CORPUS_FREEZE_MUTATED = 0
GOVERNANCE_MUTATED = 0
GIT_MUTATED = 0
NEW_ISSUES_OUTSIDE_SCOPE = 0
```

## Forbidden effects
```
NEW_EVIDENCE_SEARCH = NO
NEW_FACT_ADMISSION = NO
METHODOLOGY_CHANGE = NO
MECHANISM_NORMALIZATION = NO
ENVIRONMENT_INFERENCE = NO
PAIR_ECS_WORK = NO
OUTCOME_BASED_REASONING = NO
UNRELATED_CLEANUP = NO
OLD_HISTORY_OVERWRITE = NO
FACTUAL_SEAL_MUTATION = NO
CORPUS_FREEZE_MUTATION = NO
GOVERNANCE_MUTATION = NO
GIT_MUTATION = NO
STAGE_2_STARTED = NO
```

Repository HEAD at the end of this act: `d52e7f499eff4b2c9ee290380fe7cb7db5ec8e5f`. Tracked diff and staged diff were empty. The new Daimler candidate is an untracked sibling of the already untracked frozen package. Packages B, C, and D and this report are outside that Git repository.
