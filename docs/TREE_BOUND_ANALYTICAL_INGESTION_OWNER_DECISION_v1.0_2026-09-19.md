# TREE-BOUND ANALYTICAL INGESTION — OWNER DECISION v1.0

**Date:** 2026-09-19  
**Project:** MergeVue M&A  
**Status:** OWNER-ACCEPTED / CONTROLLING PRODUCT AND ANALYTICAL INGESTION PRINCIPLE

## 1. Controlling principle

**TREE-BOUND ANALYTICAL INGESTION**:

All technical proof, provenance, retrieval integrity, coverage diagnostics, source identity, hashing, accession-level bookkeeping, mapping/taxonomy versions, collection deficiencies, and other machine-verification material remain in the **hidden control plane**.

The **analytical plane** may admit only evidence for which the system can establish the chain:

`source → observed mechanism → Environment-tree semantics → ECS downstream`

If that chain cannot be established, the evidence must not enter the analytical calculation pipeline.

## 2. Hidden control plane

The following classes of information are internal verification/control material and are not client-facing analytical report content:

- source URLs and source-page identities;
- accession numbers and physical-record bookkeeping;
- artifact/content hashes;
- retrieval timestamps and HTTP/collection diagnostics;
- collection coverage mechanics;
- unmapped raw-form diagnostics;
- collection deficiencies and engineering truncation diagnostics;
- mapping/taxonomy/reference-data version identities;
- symmetry/execution diagnostics;
- P1/P2 provenance machinery and equivalent verification metadata;
- validator, Git, governance, lifecycle, and audit-control metadata.

This material remains available to the system and auditors to prove that downstream evidence was not fabricated or misbound.

## 3. Analytical-plane admission rule

Evidence enters the analytical plane only when it is relevant to the semantics of the Interaction Environment tree and can lawfully affect downstream Environment determination and ECS calculation.

The required analytical chain is:

`source content`
→ `bounded evidence excerpt / evidence unit`
→ `observed organizational mechanism`
→ `specific Environment-tree semantic target`
→ `support / counterevidence / conflict / gap`
→ `Environment determination`
→ `Acquirer × Target`
→ `ECS downstream`

The system must not ingest generic corporate information merely because it is available.

## 4. Source-selection rule

Analytical ingestion is designed **from the Environment tree outward**, not from available source fields inward.

The sequence is:

1. identify the observable mechanisms required by the Environment-tree semantics;
2. identify source types and source sections capable of evidencing those mechanisms;
3. retrieve only the bounded source content needed for those mechanisms;
4. extract canonical evidence units;
5. map those units to the relevant Environment-tree semantics;
6. preserve support, counterevidence, conflict, alternatives, and uncertainty;
7. feed only lawfully admitted evidence into Environment determination and ECS downstream.

## 5. Scope consequence for the FREE product

The first real FREE analytical report must be driven by real source content admitted through the TREE-BOUND analytical pipeline.

The prior Level-1 SEC index/provenance machinery remains valid as internal plumbing and control-plane infrastructure, but it is not the substantive analytical payload of the final client-facing 12-block FREE report.

The client-facing report should expose analytical conclusions, limitations, and evidence quality at an appropriate human level, while keeping machine-verification details under the hood.

## 6. Current production baseline

The technical Level-1 public-report plumbing is closed and production-verified at Git commit:

`0abc663204e1237f8dd937f740aa5ae44d03c15d`

Production runtime verification returned PASS for:

- exact production deployment identity;
- `/api/start-public-research`;
- `body.level1`;
- server-created `body.publicReport`;
- canonical 12-block rendering;
- O-1 same-tab handoff;
- O-4 Back / Refresh / Edit / Swap continuity;
- bounded sessionStorage without analytical authority;
- absence of material runtime/API errors.

This baseline is retained as infrastructure. The next product workstream is the real analytical-data path for Environment/ECS and the first substantive FREE report.

## 7. Next workstream

The next smallest workstream is:

**TREE-BOUND ANALYTICAL INGESTION → REAL ENVIRONMENT/ECS INPUT → FIRST FREE ANALYTICAL REPORT**

It must begin with a read-only preflight that inventories:

- the controlling Interaction Environment tree and its semantic dimensions;
- the controlling ECS mathematical inputs and interfaces;
- existing historical evidence-unit / semantic adjudication machinery that can be reused;
- candidate public source types capable of supplying the required mechanisms;
- the minimum first vertical slice from real source content to canonical evidence units and into the existing Environment/ECS pipeline.

No generic scraping expansion is authorized by this decision.

No change to the mathematical apparatus, Environment definitions, or ECS semantics is authorized merely by this decision.
