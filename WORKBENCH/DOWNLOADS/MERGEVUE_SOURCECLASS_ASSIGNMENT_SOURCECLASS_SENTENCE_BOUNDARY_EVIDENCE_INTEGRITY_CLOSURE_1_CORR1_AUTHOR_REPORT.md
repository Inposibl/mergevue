# MERGEVUE - SOURCECLASS-SENTENCE-BOUNDARY-EVIDENCE-INTEGRITY-CLOSURE-1.CORR1 - AUTHOR REPORT

**ACT:** `SOURCECLASS-SENTENCE-BOUNDARY-EVIDENCE-INTEGRITY-CLOSURE-1.CORR1` (Owner-authorized). **EXECUTION MODE:** CODEX-DRIVEN CORRECTION ONLY. **AUTHOR:** Claude Opus 5.5. **SOLE VERIFIER:** Codex.
**CORRECTS:** `SOURCECLASS-SENTENCE-BOUNDARY-EVIDENCE-INTEGRITY-CLOSURE-1` (boundaryModelSha256 `8f66179681a0f1e8d582e9f7a25b4f538fc0c5b69bcc553ea178afeb0a5329e5`, normative pre-registration `9ddc7279a2ad7aa7a6b91a56b6140fdafe82463aae32e8888e5e9ac3b7ca1c72`, manifest `ee3c7b631bc48862294ba3de8c5b49e9468f5b686dc4601fd77f68d13433e5ae`).
**INPUT VERDICT (relayed by the Owner):** IV1 = FAIL; BLOCKING 0, MAJOR 2, MINOR 0. Authorized items: IV1-F1, IV1-F2 (closed enumeration).

No validation, regression, forced-failure, mutation, adversarial search, preflight, pilot replay, inherited-fixture or generated-surface run was performed. No claim is made that either defect is closed.

## CORRECTION ITEM IV1-F1

**Exact correction made.**

- Model: new leaf block `segmentation.separatorEvidence.whenAdjacent.SENTENCE.continuationGuard.asciiDigitContinuation` = `{act, closes, characters: "0123456789", rule}`.
- Interpreter (`continuation_withheld`, PART 1): inside the existing `UNICODE_LOWERCASE` branch, after the existing terminal / closer / spacing scan (`betweenPattern`), the first following character is also withheld when it is one of `asciiDigitContinuation.characters` (read from the model; no literal in the interpreter). Only `.` (the existing `ambiguousTerminals`) is affected.
- Wording that would otherwise be false: `segmentation.separatorEvidence.whenAdjacent.SENTENCE.continuationGuard.rule` (names the digit continuation) and `segmentation.separatorEvidence.whenAdjacent.SENTENCE.continuationGuard.unchanged[1]` (a digit removed from the parent-evidence continuations).
- No new reason identifier was added: the existing guard id and `SEPARATOR_NOT_PROVEN` effect carry the path.

**Exact files changed:** the RULES artifact (model) and the VALIDATE artifact (interpreter).

**Scope statement:** `.` + (closers + spacing per the existing scan) + ASCII `0`-`9` no longer proves SENTENCE. The decision is the existing shared `continuation_withheld`, so it applies on both paths that decision already serves (declared separator, touching-atom junction). Uppercase continuation, R-M2-CASE-B, `?`, `!`, abbreviation handling, NLP / NER, the entity-name authority, the touching algorithm, B-2, CSI-v6, OA, predicates and count rules are not changed. No character class beyond ASCII decimal digits.

**No unrelated intentional change.**

## CORRECTION ITEM IV1-F2

**Exact correction made.** Model leaf `segmentation.separatorEvidence.whenAdjacent.SENTENCE.continuationGuard.betweenPattern`: `(?:["')\]]|\s)*` -> `(?:["')\]”]|\s)*` - U+201D RIGHT DOUBLE QUOTATION MARK added to the existing permitted closer class of the continuation scan that the documentary-interval path passes through (`_interval_evidence` -> `_cg_declared` -> `continuation_withheld`). U+2018, U+2019, U+201C and every other quotation character were not added; no normalization added. The documentary interval's own `terminalAtUnitEnd` / `terminalInGap` patterns, `previousUnitCanonicalEndsWith` and every other separator are not changed.

**Exact files changed:** the RULES artifact (model). The interpreter reads the pattern from the model; no interpreter code changed for IV1-F2.

**Scope statement:** `.` + U+201D + spacing + lowercase now traverses the closer and reaches the existing lowercase guard. `betweenPattern` is the guard's single closer set, so the same admission applies wherever that guard already reads it (declared separator, touching-atom junction).

**No unrelated intentional change.**

## MECHANICAL PROPAGATION (required by the two changes; not new methodology)

- Identity: act / suffix `SOURCECLASS_SENTENCE_BOUNDARY_EVIDENCE_INTEGRITY_CLOSURE_1_CORR1`, model id, R-DUP / R-EQV `implementedIn` validator file name, contract title.
- Validator pins of the guard: check SE-3 (the `betweenPattern` value), check BI-3 (the guard equals the parent's after reverting the CORR1 leaves; the CORR1 leaves have their authorized values), check BI-2 scope (`BI_PATHS`, `BI_DELTA_CLASSES` + `CORR1_IV1_F1_ASCII_DIGIT_CONTINUATION`, `CORR1_IV1_F2_RIGHT_DOUBLE_QUOTATION_MARK_CLOSER`), `BI_CLAIMS` (+ IV1-F1 / IV1-F2 `CORRECTED_NOT_VERIFIED`).
- `bi_parent_model` reverts exactly the CORR1 guard leaves so every "parent" evaluation remains the sentence-evidence parent's evidence.
- Boundary-integrity construction oracle: `_BI_CLOSERS` + U+201D; `bi_truth` treats an ASCII digit continuation as a lowercase one. The inherited TA / SE oracles and the UAX #29 SB8-style reference were not edited.
- Contract renderer: the guard table shows the `asciiDigitContinuation` row.

## NEW CANDIDATE

- **Candidate:** `SOURCECLASS-SENTENCE-BOUNDARY-EVIDENCE-INTEGRITY-CLOSURE-1.CORR1`
- **boundaryModelSha256:** `9c8011f743a76ca8b1bf94b699b54567d7f510bfb0e678a35f8f690f82a0c501`
- **normative pre-registration:** `8f66961799bddc8957b8f55f7376f9106af62ea775e55986b03c0e7c51cb15e6`
- **Manifest:** `reported outside this file` (the manifest file's own SHA-256 is reported outside it).
- **Changed-file set (12, all new names, no pre-existing file touched):**
  - normative / implementation change: RULES, VALIDATE, CONTRACT (re-rendered from RULES by the validator's renderer - the file-generation command; its fixture tables were produced by that renderer and not inspected);
  - recomputed by pure model diff / equality: SEMANTIC_DELTA_LEDGER (`seParentToChild` rows + new `corr1Delta`), PRESERVATION_PROOF (`unchangedAgainstTheSeParent`);
  - identity re-bound only, recorded content carried from CLOSURE-1: SCHEMA, ADVERSARIAL_FIXTURES, PILOT_DRYRUN (+ re-computed pre-registration), EVIDENCE_BINDING_LEDGER, CSI_PROOF;
  - new: AUTHOR_REPORT, MANIFEST.
- **Not produced:** VALIDATION_REPORT and FORCED_FAILURES (author validation and forced failures NOT RUN). The validator still names them; Codex produces the report with `--write-report`.

## STATUS

```
IV1_F1 = CORRECTED_NOT_VERIFIED
IV1_F2 = CORRECTED_NOT_VERIFIED
AUTHOR_VALIDATION = NOT_RUN
REGRESSION = NOT_RUN
FORCED_FAILURES = NOT_RUN
ADVERSARIAL_SEARCH = NOT_RUN
NOT_INDEPENDENTLY_VERIFIED
NOT_OWNER_ACCEPTED
NOT_CONTROLLING
GIT_MUTATION = 0
PRODUCTION_WIRING = 0
```
