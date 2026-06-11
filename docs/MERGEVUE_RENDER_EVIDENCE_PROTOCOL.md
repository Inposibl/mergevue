# Mergevue Render Evidence Protocol

This protocol applies to every change that affects the Mergevue Forecast Brief, public report model, report renderer, PDF output, screen output, email attachment output, or report delivery copy.

The purpose is to prevent unverifiable render changes. A final PDF, screenshot, or verbal claim is not sufficient evidence. Every report-rendering change must be traceable from root cause to validation.

## 1. Scope

Every evidence package must state:

- files changed
- report surface affected: model, screen, PDF, email, hidden-copy delivery, source workbook, exporter, or generated data
- report block or UI area affected
- whether the change touches public copy, source data, layout, accessibility, text layer, validator coverage, or delivery logic

Generated data must not be edited directly unless the approved exporter/source workflow is used.

## 2. Root Cause

Before fixing, identify the exact failure class:

- model-level defect
- renderer/layout defect
- PDF text-layer/accessibility defect
- visual pagination/orphan defect
- public-copy safety defect
- source-data or workbook provenance defect
- delivery/email attachment defect
- validator coverage gap

The root-cause note must include the exact source path and the relevant function, block, selector, or data field.

## 3. Red Evidence

A fix must be preceded by at least one red or failing evidence item, unless the change is explicitly documentation-only.

Acceptable red evidence includes:

- failing validator output
- failing assertion or harness output
- source-code proof of the bad state
- extracted text showing the defect
- rasterized screenshot for visual/PDF defects
- source trace proving a wrong binding or wrong field path

For PDF visual or text-layer issues, evidence must distinguish between visual correctness and extracted-text/accessibility correctness.

## 4. Patch Discipline

The patch must be minimal.

Required patch discipline:

- do not touch unrelated files
- do not rename source data to solve public-copy problems
- do not edit generated data by hand
- do not change email, routing, polling, or delivery logic unless the defect is in that layer
- preserve source-of-truth boundaries from docs/methodology-source-of-truth.md
- public/client-facing strings must route through approved public-safe mapping or adapter logic

## 5. Green Evidence

For Forecast Brief / public report changes, the standard green set is:

npm run validate:mergevue-public-report
npm run validate:mergevue-public-report-pdf
npm run validate:mergevue-public-report-screen
npm run validate:mergevue-public-report-email
npm run build
git diff --check

If one command is not applicable, the evidence package must say why.

## 6. Diff Evidence

Every evidence package must include:

- git diff --stat
- summary of changed hunks
- confirmation that no unrelated file changed

For public copy, also state which forbidden or legacy terms were guarded or checked.

## 7. Commit Evidence

Every completed change must record:

- commit hash
- commit message
- push range, if pushed
- whether the working tree is clean after push

## 8. Residual Risk

Every evidence package must end with residual risk:

- what was not verified
- whether remaining risk is visual, text-layer, data-source, validator coverage, email-delivery, or methodology-source risk
- whether follow-up is required

## 9. Minimum Evidence Package Template

Scope:
Root cause:
Red evidence:
Patch:
Green evidence:
Diff evidence:
Commit evidence:
Residual risk:

## 10. Current Standard

For report-rendering work, the target standard is:

root cause established before fix; red evidence captured before patch where applicable; minimal patch; green validators; diff check; commit and push only after evidence is complete.
