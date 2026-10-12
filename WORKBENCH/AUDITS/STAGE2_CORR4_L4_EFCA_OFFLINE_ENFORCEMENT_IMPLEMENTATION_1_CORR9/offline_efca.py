#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""offline_efca.py — MergeVue Stage-2 CORR4 §L-4 EFCA offline synthetic
enforcement engine, correction CORR9.

Act: STAGE2_CORR4_L4_EFCA_OFFLINE_ENFORCEMENT_IMPLEMENTATION_1.CORR9
Actor: DeepSeek (CODER role under AGENTS_C.md)
Corrects Orchestrator finding F-45 against the immutable CORR8 candidate
(engine SHA-256
b5ccce54527b23bff1a683c06ec47a3196f760436e458cd90c031da92db6a17f):
registration was first-writer custody capture — any registered
CUSTODIAN could lawfully register any well-formed, not-yet-registered
tuple and thereby become its custodian. Under Owner-accepted OD-45-A the
right to register a specific tuple is established by an independent,
explicit, Owner-approved mapping `tuple identity → custodian identity`
that exists BEFORE actor-facing registration: a registered CUSTODIAN
role and knowledge of the tuple key are insufficient. CORR9 introduces
the verified immutable allocation authority (the G2-accepted,
G3.CORR1-bound eight-entry manifest, SHA-256
53eb3ec43feb4de926e057e0dc17a857473872e4bbc9ff571e5937576c38ecb1),
tuple-specific registration entitlement, engine-derived
OWNER_PINNED/SIMULATION authority modes bound as the immutable pair
(allocationAuthorityMode, allocationsSha256) in GENESIS, the
allocationDigest on TUPLE_REGISTERED, the authority-mode marking of the
procedural evidence record and a fixed uniform NOT_ENTITLED refusal that
discloses nothing about foreign occupancy, allocation or activity.
CORR8 corrected F-44 against the immutable CORR7 candidate
(engine SHA-256
c06875cba1be4f2be841d465faf7515402f3363597347bd9332a0e9e188f77be):
the tuple-local Lane B submission ordinal leaked another reviewer's
earlier filing through the returned identifier (R_LB_001 received
SYN_SUB_001 or SYN_SUB_002 depending on whether R_LB_002 had filed
first). CORR8 replaced it with an ACTOR-LOCAL DETERMINISTIC submission
identity derived only from the filer's own actor id, the tuple key and
the filer's own prior-filing count, folded through a one-way hash — no
cross-reviewer count, order or existence is observable. CORR7 corrected F-40..F-43 against
the immutable CORR6 candidate (994ae06a...):
existence-oracle elimination through an existence-blind authorization
architecture (F-40/F-41) and requester/host namespace separation (F-42/
F-43). CORR6 corrected F-37..F-39 against the CORR5 candidate
(engine SHA-256 e4118af938362c398a69d79f6b776b77fbfb39b71c71604b525eb9b56a02a1e0)
under Owner-accepted OD-37 (scoped procedural disclosure), OD-38
(rubric-derived historical proposition identity), OD-39 (multiple
non-authoritative Lane B submissions) and the accepted CORR6 compatibility
guardrail.
CORR5 corrected F-30..F-36 against the CORR4 candidate (11affbad...), which
corrected F-23..F-29 against CORR3 (5a59e0f3...); CORR3 corrected F-17..F-22
against CORR2 (212a7354...), which corrected F-10..F-16 against CORR1
(b3fb6b79...), which corrected F-1..F-9 of the original implementation
candidate (61b03ad1...).

Scientific authority (unchanged, read-only): the Owner-accepted EFCA
operationalization specification
    WORKBENCH/AUDITS/STAGE2_CORR4_L4_EFCA_OWNER_ACCEPTANCE_BINDING_1/
        EFCA_CORR2_CORR2_CORR1_CORR1_CORR1_CORR1_GPT6_AUTHOR_CANDIDATE.md
    Owner-pinned SHA-256
    5bb887d269e9079754e5a4f7417cd08f58d4ad5d5ff14503ca1dd98646176eba
with its external identity authority SHA256SUMS.txt in the same directory.

======================================================================
CORR2 ROOT CAUSE AND CORRECTION
======================================================================

CORR1 accepted each event as an independently valid transition, but the live
workflow performs COMPOSITE side effects: one public operation could append a
disclosure event whose mandatory contamination consequence lived in a second,
optional companion event (or in embedded payload state). Replay could not see
the missing consequence. Additionally some invariants were checked only as
hash equality or field presence, some read surfaces disclosed tuple-specific
content, the identity gate was satisfied by an embedded constant, and file
reads were not path-bounded.

CORR2 reconciles every event type against one complete invariant model:

1. EXACT EVENT PAYLOAD SCHEMAS (F-15). Every event type has a closed,
   exact key set (no missing, no extra keys). Payloads carrying a `synthetic`
   classification must have synthetic == True; GENESIS must name this engine
   act; custody records must be exactly {id, locator, content, sha} with
   sha == sha256(content). Missing/extra keys and forged flags are refused on
   BOTH the live path and replay — there are no exception paths available
   only to replayed events.

2. DERIVED CONTAMINATION (F-2/F-11/F-12). Exposure is not an optional
   companion event; it is DERIVED state computed from the disclosure events
   themselves plus explicitly reported incidents:
     - LANE_B_DELIVERED to an R_P1/R_IND recipient before that reviewer's
       seal contaminates, whether or not any EXPOSURE_REPORTED companion
       exists, live or replayed;
     - RATIONALE_ACCESSED by an R_IND before their own seal contaminates the
       same way;
     - explicit EXPOSURE_REPORTED incidents keep their F-4 occurrence-time
       semantics (unestablished occurrence fails closed).
   The live operations no longer append automatic companion events; the
   derivation is the single source of truth for both live and replay.

3. PHYSICAL IDENTITY GATE INSIDE REPLAY (F-13). EVIDENCE_RECORD_ISSUED is
   validated by executing the same physical gate as live issuance — reading
   the actual rubric file and sidecar and enforcing
   computed SHA == sidecar SHA == Owner-pinned SHA. An embedded SHA in a
   history is not treated as evidence that the gate ran; import fails closed
   when identity authority is absent.

4. CLOSED SCRATCH BOUNDARY (F-14). Every file operation — requester-scoped
   (persist_history, verify_persisted_history) and engine-host
   (persist_global_history, verify_global_history, restore_global_history,
   replay_legacy_history) — refuses paths outside the configured synthetic
   scratch directory (PATH_ESCAPE_REJECTED). The engine exposes no
   general-purpose file loader.

5. PROOF-CARRYING RECONSTRUCTION (F-16). Historical-record claims follow
   rubric §G.7 ("re-derived from the authenticated records (identity, SHA,
   locator)"), enforced as a bounded, mechanical, synthetic-only check: the
   separate re-derivation declaration AND the per-claim reproduction must
   each cite authenticated records by {recordId, locator, content} where
   sha256(content) equals the authenticated record digest, and the claim's
   evidence must be a subset of the declared set. A bare identifier is not
   a re-derivation. The engine verifies evidence authenticity and procedural
   binding ONLY; whether evidence content proves a claim (its scientific
   threshold) is never evaluated here (E11 firewall preserved).

6. SAFE DISCLOSURE SURFACE (F-10). Reviewer-facing event projections never
   expose tuple-specific Lane B content (question/surface/schemaClaim) or
   reconstruction content before the requester has lawfully sealed the
   tuple; custody reads and the full log remain custodian-only.

======================================================================
CORR4 CORRECTIONS (F-23..F-29)
======================================================================

13. TUPLE-SCOPED STATUS (F-23). workflow_status discloses the full §I view
    only to requesters with an authorized relationship to THAT tuple: its
    custodian, a reviewer who sealed it, or its registered Lane B reviewer.
    Foreign custodians and unrelated actors receive the withheld shape —
    reconciled with events() (F-19) and custody_view().
14. ROLE-BOUNDED EXPOSURE ATTESTATION (F-24). An EXPOSURE_REPORTED event is
    lawful only when reported by the tuple's custodian or by the exposed
    actor themself. Basis in the accepted rubric (not a new authority):
    §G.1 assigns the custodian the recording duties of the tuple's
    protocol; §G.4 steps 1–3 and §G.5 are custodial recording acts; §G.6
    step 1 ("Record what was seen, when, and by whom") is executed inside
    that custodial protocol; and §G.4 contemplates reviewer
    self-disclosure (reviewerIdentity.priorExposure). Append-only incident
    history and lawful late discovery are unchanged.
15. EXACT TICK TYPES (F-25). occurred_at_tick must be a plain integer
    (bool is rejected); stable gate code INVALID_TICK_TYPE on the live and
    replay paths; None (unestablished occurrence) and lawful past integers
    preserved. (SUPERSEDED BY CORR6/OD-37: the reporter now declares a
    scope-local occurrence reference into their own recorded event
    sequence; the global-tick range check against the session clock was an
    indirect session-count probe channel. The type discipline, the None
    handling, the fail-closed range check and the stable INVALID_TICK_TYPE
    code are preserved in the new representation; see §CORR6-27.)
16. ONE EFFECTIVE-CONTAMINATION MODEL (F-26). A single aggregation of
    exposure actors (reported incidents ∪ Lane B deliverers ∪ rationale
    accessors ∪ re-derivation declarers) drives reviewer decisions,
    tuple-level contamination, custody observability, recovery gating and
    status; the retrospective disclosure class is thereby accounted for
    everywhere.
17. BOUNDED HISTORICAL VERIFICATION (F-27). The engine verifies only
    mechanical record provenance (authenticated identity + digest-bound
    reconstruction + declared-set membership). Historical-record claims
    therefore return PROVENANCE_VERIFIED_NOT_ADJUDICATED — a bounded
    mechanical label of THIS offline gate, not a new causal category and
    not an accepted §I status of the rubric. Claim-level
    PROVISIONAL/ADJUDICATED aggregates arise only from normative
    reproductions. Substantive adjudication of a named historical
    proposition is an UNRESOLVED GATE requiring separate scientific
    authority (E11 preserved; no sufficiency algorithm built).
18. ANONYMOUS SURFACE WITHHELD (F-28). Anonymous events() returns a fixed
    aggregate shape with no per-event chronology, no counts and no chain
    material — successive anonymous responses are byte-identical, so
    polling and diffing reveal nothing. (CORR6: all integrity diagnostics
    are constant for every requester; see §CORR6-27.)
19. NORMATIVE COHERENCE (F-29). Enforced exactly within the accepted
    contract (§E.1): determinacy ESTABLISHED requires all admissible
    readings to give the same output, normativeStates determinacy must
    agree with the bound, a sharedOutput must equal that common output,
    and no sharedOutput may exist without established determinacy.
    Contradictory submissions are refused at seal and at replay; no new
    scientific criteria are introduced.

======================================================================
CORR5 CORRECTIONS (F-30..F-36)
======================================================================

20. AUTHORIZED INTEGRITY DIAGNOSTICS (F-30). Unauthenticated
    verify_integrity(), verify_persisted_history(), persist_history and
    import_history responses do not carry eventCount or a seq-indexed
    failure reason. A healthy unauthenticated response is constant, so
    polling cannot infer procedural progress. (SUPERSEDED BY CORR6/OD-37:
    integrity diagnostics are constant for EVERY requester including a
    registered custodian — the session-global eventCount is itself an OD-37
    leak channel; detailed chain diagnostics are host-level only. See
    §CORR6-27.)
21. BLIND PROCEDURAL OMISSION (F-31). While an R_P1/R_IND requester is
    blind on a tuple, foreign tuple events are omitted entirely. The
    visible list uses a local ordinal and does not carry global seq,
    eventId or tick, so types, timestamps, counts, gaps and polling
    diffs of other actors' milestones are not observable. The
    requester's own submissions stay visible. Post-seal redaction is
    unchanged.
22. REGISTRATION IS NOT TUPLE ACCESS (F-32). The accepted rubric does
    not define a custodian-issued Lane B assignment act (§G.4 issuedTo
    is the Phase-1 packet; §I laneB has no assignment field). CORR5
    does not invent one. register_lane_b still files the §G.3 evidence
    record. That filing does not authorize workflow_status.
23. ONE TUPLE-SCOPED READ MODEL (F-33). events() for an R_LB uses the
    same tuple authorization as workflow_status. An unrelated R_LB does
    not receive sealedBytesSha, sealedAt, contaminationStatus or
    revealedAt. The R_LB still sees their own Lane B submission.
24. CLAIM IDENTITY (F-34). Within a tuple, one claimId binds one
    identity. Reuse, including across claim types, is refused live and
    on replay and does not inflate counts.
25. PROVENANCE IS NOT ADJUDICATION (F-35). Historical-record
    verification persists CLAIM_PROVENANCE_VERIFIED, is indexed outside
    adjudications, is excluded from effectiveAdjudications, and is not
    counted as claimsAdjudicatedAtIssuance. The public status remains
    PROVENANCE_VERIFIED_NOT_ADJUDICATED. No historical sufficiency
    algorithm is added.
26. PROPOSITION-BOUND NORMATIVE CLAIMS (F-36). §D.4 and §G.7 bind
    ADJUDICATED to the named proposition. Only NORMATIVE_DETERMINACY,
    whose proposition is the reproduced normative states at tuple
    scope, is adjudicated from a Phase-1 reproduction. A second
    claimId on that same proposition is refused. CONCLUSION and
    RECONCILIATION are not adjudicated from generic state equality.

======================================================================
CORR3 CORRECTIONS (F-17..F-22)
======================================================================

7. BLIND CROSS-REVIEWER BOUNDARY (F-17). While an R_P1/R_IND requester has
   not yet sealed a tuple, every public read discloses NO other actor's
   tuple-specific analytical or procedural results: event projections for
   tuple-specific events reduce to {eventType, tupleKey} (identity fields
   of TUPLE_REGISTERED excepted — they are exactly the lawful packet
   surface), and workflow_status withholds all §I status values until the
   requester's own seal. After the requester seals the tuple, the redacted
   projections of CORR2 become visible (post-seal lawful access). Custodian
   reads keep full raw events for their OWN tuples.
8. RETROSPECTIVE FIREWALL (F-18). A RECORDS_REDERIVED_DECLARED event is a
   tuple-specific disclosure of retrospective record content. Rubric §G.2
   lists retrospective process records among the Phase-1-forbidden inputs
   and §G.4 makes tuple-specific forbidden information before the seal a
   contamination, while §G.7 requires historical-record claims to be
   re-derived from authenticated records with blindness NOT required. The
   scheduling of the two tracks is therefore RESOLVED by accepted
   authority, and the engine derives a RETROSPECTIVE_RECORD contamination
   incident for an R_P1/R_IND actor whose declaration precedes their own
   seal (live and replay; post-seal declaration stays lawful).
9. CUSTODIAN-SCOPED READS (F-19). Holding the CUSTODIAN role grants raw
   CONTENT visibility only into one's OWN tuples. (SUPERSEDED IN PART BY
   CORR6/OD-37: another custodian's tuples no longer appear at all — not
   even as minimal projections — and own-tuple content is disclosed through
   scope-local projections without envelope material; see §CORR6-27. The
   tuple-scope authorization itself is preserved unchanged.) custody_view
   remains tuple-scoped. A global audit context is NOT implemented and
   would require explicit separate Owner authorization; it is documented,
   not silently assumed.
10. FULL SYNTHETIC-TEXT FIREWALL (F-20). Every supported free-text
    entrypoint requires the SYNTHETIC marker: deltas (except the defined
    NO_CHANGE control value), exposure details, completeness statements,
    exclusion reasons, unexcluded flip risks and observation notes. A
    marker is a mechanical classification label, not proof that content is
    fictional; no stronger provenance protection is claimed.
11. EXACT EVENT-ENVELOPE VALIDATION (F-21). verify_chain enforces the
    exact outer envelope: key set {seq, eventId, eventType, t,
    prevEventSha, payload, eventSha}, field types (bool rejected for
    seq/t), the deterministic eventId "E%04d" % seq, genesis tick 0 and
    strictly CONSECUTIVE logical ticks (live operations always advance by
    exactly one). A cryptographically correct but non-engine-constructible
    envelope is rejected as HASH_CHAIN_INVALID on both the diagnostic
    verify and import paths.
12. DETACHED READS (F-22). Every public read returns deep-copied values;
    no operation returns a mutable reference to internal custody,
    adjudication or evidence-record state. Authoritative state changes are
    produced exclusively by lawful events through the single transition
    validator.

======================================================================
CORR6 CORRECTIONS (F-37..F-39, OD-37/OD-38/OD-39,
COMPATIBILITY GUARDRAIL)
======================================================================

27. SCOPED PROCEDURAL DISCLOSURE (F-37, OD-37). A custodian has procedural
    visibility only over tuples under their own custody. No public
    requester-scoped surface reveals foreign procedural activity, directly
    or indirectly, through event types/milestones, global sequence numbers
    or logical ticks, event identifiers, chain hashes or hash links,
    session-global event counts, diagnostics, operation return values or
    persisted artifacts:
      - events() returns role-scoped projections with a local ordinal only;
        foreign tuples (and foreign actor registrations) are OMITTED for
        custodians (supersedes F-19's minimal foreign projections) and
        foreign tuple events stay omitted for blind reviewers (F-31);
      - every disclosed clock value is a scope-local reference
        {"scope": <tupleKey>, "scopeOrdinal": n} — the count of the
        requester's observable events of that scope at or before the
        referenced time; envelope seq/t/eventId/eventSha/prevEventSha never
        appear on any requester-scoped surface;
      - integrity diagnostics are constant for every requester (supersedes
        F-30's custodian eventCount, which was a session-global count and
        is an OD-37 leak channel);
      - the exposure occurrence input is a scope-local reference into the
        reporter's own recorded event sequence (see 28 below), never a
        session tick; the previous occurred_at_tick range check against the
        global clock was a probe channel for the session-global count
        (supersedes F-25's tick-range semantics; F-25's type discipline,
        None handling and stable gate codes are preserved).
    The complete internal append-only event chain and its replay/integrity
    verification are maintained unchanged; scoped public projections are
    explicitly NOT complete global-chain proofs.

28. HISTORICAL PROPOSITION IDENTITY (F-38, OD-38). A historical-record
    proposition is identified by its declared content and complete
    type-specific scope derived from accepted rubric §D.4:
      HISTORICAL_RECORD_EVENT     -> EXECUTION_EVENT
        (operationId, coveredTime; tuple = the filing tuple)
      HISTORICAL_RECORD_LINKAGE   -> TUPLE_LINKAGE (historicalEventId)
      HISTORICAL_RECORD_PRODUCTION-> PRODUCTION_OF_STORED_MARK
        (operationId, survivingValue {sideId, value})
      HISTORICAL_RECORD_APPLICATION -> APPLIED_READING
        (actorId, readingId, exactly one of operationId | coveredWindow)
    Proposition identity, documentary evidence identity and
    provenance-attestation identity are separate: the boundProposition is
    the canonical scope bundle; `evidence` stays the proof-carrying
    reconstruction; each CLAIM_PROVENANCE_VERIFIED is a separate
    attestation. Several attestations may concern one proposition and are
    kept as separate records; distinct bound propositions are counted
    independently; different propositions may cite the same evidence.
    Missing or malformed mandatory scope fails closed
    (REFUSED_INCOMPLETE_PROPOSITION_SCOPE / UNKNOWN_FIELD_REJECTED /
    NON_SYNTHETIC_IDENTIFIER). The surviving mark's identity is never
    reduced to a YES/NO value — the side-anchored mark identity is part of
    the scope. No semantic-equivalence, historical-sufficiency or
    ADJUDICATED-promotion algorithm is added: the result remains
    mechanical provenance (F-35 preserved).

29. MULTIPLE LANE B SUBMISSIONS (F-39, OD-39; identity form superseded
    by CORR8/F-44). Several registered R_LB actors may file independent
    Lane B records for the same tuple; the first submission does not
    monopolize it. Each submission carries a stable engine-constructed
    submission identity (actor-local deterministic under CORR8; see
    §CORR8-34); LANE_B_REGISTERED names the submission and
    LANE_B_DELIVERED references one exact submission. The custodian sees
    the tuple's submissions, each R_LB sees their own, a sealed reviewer
    sees lawful post-seal content, and an unsealed outsider sees nothing
    (F-32/F-33 preserved: registration grants no status and no Phase-1
    secret access). causeLink stays UNASSIGNED_PENDING_J1; no appointment
    mechanism, authoritative reviewer, J-3 execution or scientific
    aggregation is added.

30. COMPATIBILITY GUARDRAIL. Native CORR6 histories are fully persistent,
    recoverable, extendable and semantically replayable through the
    documented engine-host durability channel (persist_global_history /
    verify_global_history / restore_global_history; no requester
    parameter, not reachable through any requester-scoped operation).
    Legacy CORR5 histories (genesis act
    STAGE2_CORR4_L4_EFCA_OFFLINE_ENFORCEMENT_IMPLEMENTATION_1.CORR5,
    engine SHA e4118af9...) may be admitted through
    replay_legacy_history for read-only integrity and semantic replay
    under the frozen CORR5 rule-set (differentially verified against the
    pinned CORR5 engine by the regression suite). Original legacy bytes
    are preserved (read-only). Legacy histories are never adopted, never
    extended by CORR6 events, never upgraded to CORR6 proposition
    identities, and legacy Lane B records can never be referenced by a
    CORR6 delivery. Requester-scoped persistence produces only marked
    scoped projections (artifactClass SCOPED_PROJECTION, explicitly not a
    complete global-chain proof and not an authoritative chain backup);
    requester-scoped paths never accept a complete-chain artifact.

31. REPLAY FIREWALL. The rule-set for a chain is selected by its GENESIS
    act id and is immutable for the whole chain; there is no per-event
    schema sniffing. A correctly rehashed forged extension that imitates
    the older schema inside a CORR6 lineage fails closed under CORR6
    replay; CORR6 construction and CORR6 replay strictly require the new
    proposition scopes and submission identities (no optional fields).
    Legacy admission grants strictly less authority than CORR5 itself
    granted (mechanical provenance only, zero propositions indexed).

======================================================================
CORR7 CORRECTIONS (F-40..F-43)
======================================================================

32. EXISTENCE-BLIND AUTHORIZATION (F-40/F-41). No requester-scoped
    operation's response — success or refusal code/shape/message — may
    differ between (a) a well-formed tuple key that is not registered and
    (b) a registered tuple to which the requester has no relationship.
    Registration status and foreign-activity existence are therefore not
    observable through response differences, error-code ordering or
    polling:
      - Lane B (F-40): authorization is decided BEFORE any existence-
        dependent lookup. A requester without a lawful Lane B relationship
        receives ONE constant REFUSED_LANE_B_ACCESS shape whether the
        tuple is unregistered or foreign and whether or not foreign
        submissions exist. The tuple's custodian and an already-sealed
        reviewer receive the tuple's submissions (an empty list when there
        are none); a registering R_LB receives only their own.
      - Custody-gated operations (issue_packet, acknowledge_seal_receipt,
        reveal, request_new_phase1, deliver_lane_b_to, issue_evidence_record,
        custody_view) evaluate the custody relationship first and refuse
        non-custodians with the same ROLE_MISMATCH for unregistered and
        foreign keys alike (`_require_custodian_uniform_in`).
      - Reviewer operations (fetch_packet, submit_phase1_review) are
        packet-first: without an active packet the refusal is the same
        UNISSUED_PACKET in both states.
      - Reproduction operations (begin_independent_reproduction,
        receive_first_rationale, declare_records_rederived,
        adjudicate_claim) require the CUSTODIAN-ISSUED reproduction packet
        (the reproducer no longer self-issues; the custodian issues the
        R_IND packet exactly as any Phase-1 packet — §G.4 step 1). Without
        that packet the refusal is the same UNISSUED_PACKET in both
        states.
      - workflow_status returns the constant withheld shape and
        category_assignment its constant record for any well-formed key;
        neither consults registration.
      - Self-scoped content records bind to the well-formed key without
        requiring prior registration (uniform success in both states): a
        Lane B filing (§G.3 evidence record) and an exposure
        self-disclosure by the exposed actor themself. A custodian-
        attributed exposure report still requires the custody
        relationship, so its refusal is uniform. No new scientific
        meaning: the tuple binding is the key itself.
      - Intrinsic residual (documented): register_tuple must refuse a
        duplicate custody claim (one custodian per tuple identity);
        eliminating that refusal would require accepting multiple custody
        claims — an Owner-level semantic change that is not authorized.

33. NAMESPACE SEPARATION (F-42/F-43). Requester-scoped projections and
    authoritative engine-host chain files live in SEPARATE namespaces:
      - host chain:  <scratch>/<session_token>/host_chain/<name>
      - projection:  <scratch>/<session_token>/projections/<actorId>/<name>
    A public projection can never reserve, shadow or block a host-backup
    filename and vice versa (F-43). Projection namespaces are per-actor
    inside the session: filename selection, collision (PROJECTION_EXISTS)
    and polling are actor-local and cannot reveal or interfere with
    another actor's exports (F-42). verify_persisted_history returns ONE
    constant negative shape for every artifact that is not the
    requester's own lawful projection — absent, unparseable, another
    actor's projection, or an authoritative chain — so existence at a
    guessed path is not observable.

34. ACTOR-LOCAL SUBMISSION IDENTITY (F-44). The Lane B submissionId is
    SYN_SUB_ + the first 16 hex characters of
    sha256(reviewer "|" tupleKey "|" actor-local-filing-ordinal), where
    the ordinal counts ONLY this reviewer's own prior filings on this
    tuple. Justification against the F-44 constraints:
      1) no cross-reviewer revelation — the input contains only the
         filer's own identity, the tuple key they are filing against and
         their own prior-filing count, folded through a one-way hash; no
         other actor's count, order or existence enters anywhere;
      2) unique and stable — a pure deterministic function of replayed
         state; the actor id is hashed in, so cross-actor and cross-tuple
         identifiers collide only on a hash collision, and the validator
         recomputes the expected identifier, so a collision or a forged
         identifier is REFUSED, never silently accepted;
      3)-4) independent filing and repeated submissions — the actor-local
         ordinal distinguishes an actor's own repeated filings;
      5) exact custodian delivery — identifiers are unique per
         (tuple, reviewer, ordinal); delivery references one record;
      6) replay determinism — same events produce the same per-actor
         counts and therefore the same identifiers;
      7) duplicates, conflicts and forgeries fail closed — the
         engine-constructed equality check (the same discipline as
         packetSha/sealedBytesSha/canonicalHashInput) rejects a repeated
         identifier, a cross-actor identifier and a correctly typed but
         wrongly derived identifier on live and replay paths alike;
      8)-9) no counter leaks — the ordinal lives only inside the one-way
         hash; no global timestamp, sequence, tick, session count or
         hidden event counter enters the identifier or any disclosure
         surface;
      10) the synthetic pattern becomes SYN_SUB_[0-9a-f]{16} and every
         exact-schema rule is unchanged.
    F-45 (custodian assignment/replacement) was left in CORR8 as an
    unresolved residual of the separate Codex analytical track and is
    corrected by CORR9 below.

======================================================================
CORR9 CORRECTIONS (F-45, OD-45-A, ALLOCATION AUTHORITY)
======================================================================

35. INDEPENDENT CUSTODY-REGISTRATION ENTITLEMENT (F-45, OD-45-A).
    Registration is no longer first-writer custody capture. The right to
    register a specific tuple is established by the independent,
    explicit, Owner-approved mapping `tuple identity → custodian
    identity` in the bound allocation authority, verified before any
    actor-facing operation; a registered CUSTODIAN role and knowledge of
    the tuple key are insufficient. The controlling rule is
    `tupleKey → authorizedCustodian`; exactly one effective custodian
    per tuple exists and no API, event or caller may reassign, transfer
    or replace an entitlement (the artifact is immutable: a modified
    authority fails its Owner-approved digest and the session fails
    closed at construction, before any actor-facing operation).
      - MANDATORY REGISTRATION ORDER: (1) actor identity and role,
        (2) state-independent request-input validation, (3) tuple-
        specific entitlement against the verified immutable authority,
        (4) for an entitled actor only: own registration/occupancy,
        (5) the lawful registration transition for an unregistered key.
      - UNIFORM REFUSAL: an unauthorized requester receives ONE fixed
        code and message — NOT_ENTITLED — identically for an
        unregistered/unallocated key, a key allocated to another
        custodian and a key already registered under another custodian's
        custody. No foreign occupancy, ownership, timestamp, counter,
        registration status or activity detail is disclosed; a denied
        attempt mutates no authoritative history and no requester-visible
        procedural state. An entitled custodian may receive truthful
        information about their own registration.
      - NO IMPLICIT CUSTODY: a pre-registration Lane B filing and an
        exposure self-disclosure bind to the well-formed key as
        self-scoped content records (F-41 preserved) but confer no
        custody entitlement; no custody exists until the entitled
        custodian performs the lawful registration transition.
      - NO SCIENTIFIC MEANING: allocation confers no category, tuple
        level or causal status; categoryAssignment/tupleLevelName stay
        UNASSIGNED and causeLink stays UNASSIGNED_PENDING_J1. No
        synthetic-manifest entry exists for any historical tuple.

36. ALLOCATION-AUTHORITY MODES (OWNER_PINNED / SIMULATION). Exactly two
    engine-DERIVED authority modes exist; the mode is never an
    arbitrary caller-supplied authority claim. The default, non-override
    native construction loads the Owner-pinned manifest at the fixed
    default path and requires its SHA-256 to equal the Owner pin; a
    caller cannot replace the Owner pin by supplying a matching hash for
    their own manifest (a differently-hashed file fails
    ALLOCATIONS_IDENTITY_MISMATCH; a caller-supplied path is additionally
    constrained to the pin). Explicitly named simulation-specific test
    parameters (`simulation_allocations` / `simulation_allocations_path`)
    ALWAYS produce SIMULATION and never OWNER_PINNED; simulation
    allocations are not Owner-approved and no simulation artifact claims
    Owner authorization in evidence records, metadata, history, host
    results or projections. CROSS-MODE INVARIANT: a SIMULATION session
    holding an exact byte-identical copy of the Owner-pinned manifest
    still remains SIMULATION — the same allocation bytes and digest do
    not make the modes interchangeable; cross-mode replay and restore
    fail closed even when the digest matches.

37. GENESIS AND REGISTRATION SCHEMAS (CORR9-native). The CORR9-native
    GENESIS payload is exactly {engineActId, sessionLabel, syntheticOnly,
    allocationsSha256, allocationAuthorityMode}; the last two are
    immutable attributes of the native session derived at construction.
    Replay compares BOTH against the effective trusted construction
    context of the receiving session and refuses restoration without
    partial state adoption on mismatch (AUTHORITY_CONTEXT_MISMATCH).
    TUPLE_REGISTERED carries `allocationDigest`, deterministically
    derived from the exact authorized allocation entry
    (sha256 of the canonical encoding of {custodian, tupleKey}) and
    recomputed from the verified effective manifest on BOTH the live and
    the replay path: a registration with a missing, incorrect or
    mismatched digest — or one that lacks a matching entitlement — is
    refused, so a registration never becomes lawful merely because an
    attacker recomputed the event-chain hashes. Old-schema GENESIS or
    TUPLE_REGISTERED events inside a CORR9-native history fail exact-
    schema validation; prior CORR5–CORR8 lineages are never silently
    relabelled CORR9-native (their GENESIS names their own act).

38. EVIDENCE-RECORD AUTHORITY MARKING. The engine-constructed
    proceduralCompleteness snapshot gains the engine-derived
    `allocationAuthorityMode`, so simulation-generated evidence is
    affirmatively labelled SIMULATION and never claims Owner approval.
    The allocation inventory and global authority identifiers are never
    added to requester-facing views; the Phase-1 packet surface remains
    exactly five fields; the mode may appear on engine-host channel
    returns (host-level only). No additional scientific claim or
    adjudication arises from an allocation record.

39. TRUST-MODEL HONESTY. The offline hash chain, within the API
    contract, NOW guarantees: an immutable per-chain (mode, digest)
    binding; a default constructor that mints OWNER_PINNED chains only
    from the true pinned artifact; permanent simulation/pinned
    distinguishability including for identical allocation bytes; and a
    per-construction manifest integrity re-check. It still CANNOT
    guarantee, without an external signature: protection against a
    process/filesystem-level actor who edits the engine's OWN pin
    constant (their artifact then genuinely pins their modified engine)
    or who fabricates an entirely procedurally-lawful chain — the
    CORR5..CORR8 trust boundary, unchanged. No signer, secret, PKI or
    host authority is invented, and no cryptographic property beyond
    the documented offline model is claimed.

======================================================================
SCOPE, BOUNDARIES AND TRUST MODEL
======================================================================

1. SYNTHETIC-ONLY. Every identifier matches a SYN_* pattern; free texts
   carry a "SYNTHETIC" marker. No historical file is opened; no path-based
   historical loader exists; the only files the engine may open are the
   accepted rubric and its sidecar (identity gate) and history files inside
   the session scratch directory.

2. NO SCIENTIFIC AUTHORITY. The four frozen category names appear only as
   inert constants. categoryAssignment / tupleLevelName are permanently
   UNASSIGNED across live state, imported histories and issued records.
   UNRESOLVED is a workflow disposition. No J-1/J-4 logic, no precedence,
   no exclusivity; reviewer agreement is never causal evidence.

3. PROCEDURAL GATE ONLY, per rubric §G.1–G.8 and §I. Re-derivation content
   is verified for authenticity (digest identity), never for sufficiency.

4. OFFLINE IDENTITY TRUST MODEL (documented limitation): actor identities
   are session-enforced role assignments, not authenticated humans; the
   disclosure boundary governs the engine's public operations. A caller with
   arbitrary access to the Python process (private attributes,
   monkeypatching, process memory) is outside this trust model. The event
   hash chain is anchored only in the first external inspection of the
   persisted file; a privileged filesystem actor could rewrite a whole
   history and recompute every hash — semantic replay forces any rewrite to
   remain procedurally lawful but cannot prevent it.
   CORR6 durability boundary: the authoritative complete chain is
   persisted and restored only through the ENGINE-HOST channel
   (persist_global_history / verify_global_history / restore_global_history
   / replay_legacy_history). These methods carry no requester, are not
   reachable through any requester-scoped operation, and grant no actor
   visibility; they belong to the offline engine host, which the trust
   model already places outside the actor boundary. Requester-scoped
   persistence (persist_history / verify_persisted_history) produces and
   accepts only marked scoped projections — never the authoritative chain,
   and never as a complete global-chain proof.
   CORR7 namespace boundary: host chain files and requester projections
   are physically separated (host_chain/ vs projections/<actorId>/ under
   the session directory); requester-scoped verification discloses one
   constant negative shape for every non-own artifact (F-42/F-43).
   CORR9 allocation-authority boundary: the tuple→custodian entitlement
   mapping is loaded once at construction from the Owner-pinned manifest
   (default path, fixed digest) or from an explicitly declared
   simulation manifest; the inventory is never disclosed through any
   requester-facing operation and the mode is engine-derived, so the
   offline model's limitation (§39) is the only place where a
   process-level actor could substitute authority — by editing the
   engine's own source constant, which the trust model already excludes
   from the actor boundary.

5. TIME. Deterministic logical clock (monotonic integer ticks); timestamps
   prove sequencing, not wall-clock instants.

DETERMINISTIC SERIALIZATION (unchanged):
    canonical_bytes(obj) = json.dumps(obj, sort_keys=True,
        separators=(",", ":"), ensure_ascii=False).encode("utf-8")
Event record: {seq, eventId, eventType, t, prevEventSha, payload};
eventSha = sha256(canonical_bytes(record without eventSha)); genesis has
seq 0 and prevEventSha "0"*64. Persisted history: JSONL under
<scratch>/<session_token>/<name>.
"""

import hashlib
import json
import re
import uuid
from pathlib import Path

# --------------------------------------------------------------------------
# Bound constants
# --------------------------------------------------------------------------

ENGINE_ACT_ID = "STAGE2_CORR4_L4_EFCA_OFFLINE_ENFORCEMENT_IMPLEMENTATION_1.CORR9"

# The immutable predecessor of this correction act (never adoptable; kept
# as a physical identity for the suite's lineage checks and for the
# non-adoptable-lineage refusal). CORR8 is the F-45 reproduction oracle.
CORR8_ENGINE_ACT_ID = (
    "STAGE2_CORR4_L4_EFCA_OFFLINE_ENFORCEMENT_IMPLEMENTATION_1.CORR8"
)
CORR8_ENGINE_SHA256 = (
    "b5ccce54527b23bff1a683c06ec47a3196f760436e458cd90c031da92db6a17f"
)

# The immutable predecessor of this correction act (never adoptable; kept
# as a physical identity for the suite's lineage checks and for the
# non-adoptable-lineage refusal).
CORR7_ENGINE_ACT_ID = (
    "STAGE2_CORR4_L4_EFCA_OFFLINE_ENFORCEMENT_IMPLEMENTATION_1.CORR7"
)
CORR7_ENGINE_SHA256 = (
    "c06875cba1be4f2be841d465faf7515402f3363597347bd9332a0e9e188f77be"
)

# The immutable predecessor of this correction act (never adoptable; kept
# as a physical identity for the suite's lineage checks and for the
# non-adoptable-lineage refusal).
CORR6_ENGINE_ACT_ID = (
    "STAGE2_CORR4_L4_EFCA_OFFLINE_ENFORCEMENT_IMPLEMENTATION_1.CORR6"
)
CORR6_ENGINE_SHA256 = (
    "994ae06a150d535b8d64011be656cd0b84910d3ae4c2de46a4c542418a763382"
)

# CORR6 compatibility guardrail: the frozen immediate predecessor. Chains
# whose GENESIS names this act are admitted ONLY through
# replay_legacy_history (read-only integrity + semantic replay under the
# frozen CORR5 rule-set); they are never adopted, extended or upgraded.
LEGACY_ENGINE_ACT_ID = (
    "STAGE2_CORR4_L4_EFCA_OFFLINE_ENFORCEMENT_IMPLEMENTATION_1.CORR5"
)
LEGACY_ENGINE_SHA256 = (
    "e4118af938362c398a69d79f6b776b77fbfb39b71c71604b525eb9b56a02a1e0"
)

RUBRIC_ACT_ID = (
    "STAGE2_CORR4_L4_CAUSAL_TAXONOMY_OPERATIONALIZATION_1"
    ".CORR2.CORR2.CORR1.CORR1.CORR1.CORR1"
)
RUBRIC_FILE_NAME = "EFCA_CORR2_CORR2_CORR1_CORR1_CORR1_CORR1_GPT6_AUTHOR_CANDIDATE.md"
RUBRIC_EXPECTED_SHA256 = (
    "5bb887d269e9079754e5a4f7417cd08f58d4ad5d5ff14503ca1dd98646176eba"
)
PARENT_RUBRIC_ACT_ID = (
    "STAGE2_CORR4_L4_CAUSAL_TAXONOMY_OPERATIONALIZATION_1"
    ".CORR2.CORR2.CORR1.CORR1.CORR1"
)
PARENT_RUBRIC_SHA256 = (
    "cf59fc80f013dfc660cee85a18699411ecdf5e650371ab741fdcfbe0c0d0fa11"
)

CONTRACT_IDENTITY = {
    "fileName": "STAGE2_SEMANTIC_SUCCESSOR_CANDIDATE_CORR4.md",
    "sha256": "2de49862fb0d63c5f1cd1745531199137e73b7b37abceecef6e735d497d38bb0",
    "note": (
        "Stage-2 controlling semantic contract identity recorded as a "
        "constant; the engine never opens this file."
    ),
}

FROZEN_CATEGORY_NAMES = (
    "CODER_ERROR",
    "DEFINITION_AMBIGUITY",
    "MISSING_M",
    "GRAMMAR_GAP",
)
CATEGORY_ASSIGNMENT = "UNASSIGNED"
TUPLE_LEVEL_NAME = "UNASSIGNED"
EXCLUSIVITY = "NOT_CLAIMED"

ROLES = ("CUSTODIAN", "R_P1", "R_IND", "R_LB")

PACKET_FIELDS = (
    "caseId",
    "sideId",
    "factId",
    "sealedFactText",
    "questionText",
)

FORBIDDEN_FIELD_HINTS = (
    "markA", "markB", "marks", "disagreementDirection", "direction",
    "populationStatistics", "sampleMetadata", "priorRationale",
    "mRegistry", "ttRegistry", "dispatchTable", "grammar", "laneB",
    "outcome", "environment", "evidenceForm", "planCurrentState",
    "formal_or_operative", "announced_or_effective", "state_at_t0",
    "support_status", "temporal_status", "retrospectiveTrace", "d",
    "sourcePath", "path", "loader",
)

SYNTHETIC_TEXT_MARKER = "SYNTHETIC"

SYN_PATTERNS = {
    "caseId": re.compile(r"^SYN_CASE_[0-9]{3}$"),
    "sideId": re.compile(r"^SYN_SIDE_[A-Z]$"),
    "factId": re.compile(r"^SYN_FACT_[0-9]{3}$"),
    "d": re.compile(r"^SYN_D_[0-9]{2}$"),
    "claimId": re.compile(r"^SYN_CLAIM_[0-9]{3}$"),
    "retrospectiveId": re.compile(r"^SYN_RET_[0-9]{3}$"),
    "locator": re.compile(r"^SYN_LOCATOR_RET_[0-9]{3}$"),
    # CORR6/F-38: declared historical proposition scope tokens (opaque
    # invented identifiers; the engine binds and compares them, never
    # interprets them). historicalEventId is deliberately distinct from the
    # procedural envelope eventId ("E%04d") — see §CORR6-28.
    "operationId": re.compile(r"^SYN_OP_[0-9]{3}$"),
    "coveredTime": re.compile(r"^SYN_TIME_[0-9]{3}$"),
    "coveredWindow": re.compile(r"^SYN_WIN_[0-9]{3}$"),
    "historicalEventId": re.compile(r"^SYN_HEV_[0-9]{3}$"),
    "readingId": re.compile(r"^SYN_RDG_[0-9]{3}$"),
    # CORR8/F-44: engine-constructed, actor-local deterministic Lane B
    # submission identity (sha256-derived; see §CORR8-34).
    "submissionId": re.compile(r"^SYN_SUB_[0-9a-f]{16}$"),
}
SYN_ACTOR_PATTERNS = {
    "CUSTODIAN": re.compile(r"^SYN_CUST_[0-9]{3}$"),
    "R_P1": re.compile(r"^SYN_RP1_[0-9]{3}$"),
    "R_IND": re.compile(r"^SYN_RIND_[0-9]{3}$"),
    "R_LB": re.compile(r"^SYN_RLB_[0-9]{3}$"),
}

EXPOSURE_KINDS = {
    "MARK_A": "an original A mark",
    "MARK_B": "an original B mark",
    "DISAGREEMENT_DIRECTION": "the disagreement direction",
    "POPULATION_STATISTICS": "ledger/population statistics",
    "SAMPLE_METADATA": "selected-sample metadata",
    "PRIOR_RATIONALE": "a prior rationale or earlier review",
    "M_REGISTRY": "M registry / dispatch material",
    "TT_REGISTRY": "TT registry material",
    "GRAMMAR": "grammar material",
    "LANE_B_MATERIAL": "Lane B schema material for the tuple",
    "OUTCOME_OR_ENVIRONMENT": "outcome or Environment material",
    "STAGE1_PROXY": "Stage-1 proxy classification",
    "RETROSPECTIVE_RECORD": "retrospective process record",
    "M_DISPATCH_ROW": "the tuple's M registry dispatch row",
}

CLAIM_TYPES_NORMATIVE = (
    "NORMATIVE_DETERMINACY",
    "NORMATIVE_CONCLUSION",
    "NORMATIVE_RECONCILIATION",
)
CLAIM_TYPES_HISTORICAL = (
    "HISTORICAL_RECORD_EVENT",
    "HISTORICAL_RECORD_LINKAGE",
    "HISTORICAL_RECORD_PRODUCTION",
    "HISTORICAL_RECORD_APPLICATION",
)

# F-15: closed, exact per-event payload key sets. Set equality is enforced
# in _check_transition for BOTH live transitions and replayed histories.
# CORR6 changes (F-38/F-39): LANE_B_REGISTERED and LANE_B_DELIVERED carry a
# tuple-local submissionId; EXPOSURE_REPORTED carries the scope-local
# occurrence reference beside the resolved internal tick. CORR9 changes
# (F-45/OD-45-A): GENESIS carries the immutable (allocationAuthorityMode,
# allocationsSha256) pair and TUPLE_REGISTERED carries the engine-derived
# allocationDigest; an old-schema GENESIS or TUPLE_REGISTERED event inside
# a CORR9-native history is refused by this exact schema.
EVENT_PAYLOAD_SCHEMAS = {
    "GENESIS": frozenset(("engineActId", "sessionLabel", "syntheticOnly",
                          "allocationsSha256", "allocationAuthorityMode")),
    "ACTOR_REGISTERED": frozenset(("actorId", "role")),
    "TUPLE_REGISTERED": frozenset((
        "custodian", "caseId", "sideId", "factId", "d",
        "canonicalHashInput", "sealedFactText", "questionText",
        "custodyMarks", "retrospectiveRecords", "allocationDigest",
        "synthetic")),
    "PACKET_ISSUED": frozenset((
        "tupleKey", "custodian", "reviewer", "packetSha", "issuedAt",
        "phase")),
    "PHASE1_SEALED": frozenset((
        "tupleKey", "reviewer", "packetSha", "sealedBytesSha", "sealedAt",
        "contamination", "sealedPayload")),
    "SEAL_RECEIPT_ACKNOWLEDGED": frozenset(("tupleKey", "custodian", "reviewer")),
    "REVEALED": frozenset(("tupleKey", "custodian", "reviewer")),
    "DELTA_APPENDED": frozenset(("tupleKey", "reviewer", "delta")),
    "LANE_B_REGISTERED": frozenset((
        "tupleKey", "reviewer", "submissionId", "question", "surface",
        "schemaClaim")),
    "LANE_B_DELIVERED": frozenset((
        "tupleKey", "custodian", "deliveredTo", "submissionId")),
    "EXPOSURE_REPORTED": frozenset((
        "tupleKey", "exposedTo", "what", "reportedBy", "detail",
        "occurredAtTick", "occurredScopeRef")),
    "NEW_PHASE1_REQUESTED": frozenset(("tupleKey", "custodian", "newReviewer")),
    "RATIONALE_ACCESSED": frozenset(("tupleKey", "reviewer")),
    "RECORDS_REDERIVED_DECLARED": frozenset(("tupleKey", "reviewer", "recordRefs")),
    "CLAIM_ADJUDICATED": frozenset((
        "tupleKey", "reviewer", "claimType", "claimId", "prerequisites")),
    "CLAIM_PROVENANCE_VERIFIED": frozenset((
        "tupleKey", "reviewer", "claimType", "claimId", "prerequisites")),
    "EVIDENCE_RECORD_ISSUED": frozenset((
        "tupleKey", "custodian", "rubricIdentity", "parentRubricIdentity",
        "contractIdentity", "categoryAssignment", "tupleLevelName",
        "exclusivity", "proceduralCompleteness", "synthetic")),
}
EVENT_TYPES = tuple(EVENT_PAYLOAD_SCHEMAS.keys())

# CORR6 compatibility guardrail: the frozen CORR5 exact key sets (engine
# SHA e4118af9...). Selected ONLY for chains whose GENESIS declares the
# legacy act id; there is no per-event mixing and no relaxed variant of the
# CORR6 sets. The regression suite differentially verifies legacy replay
# against the physically pinned CORR5 engine.
LEGACY_EVENT_PAYLOAD_SCHEMAS = {
    "GENESIS": frozenset(("engineActId", "sessionLabel", "syntheticOnly")),
    "ACTOR_REGISTERED": frozenset(("actorId", "role")),
    "TUPLE_REGISTERED": frozenset((
        "custodian", "caseId", "sideId", "factId", "d",
        "canonicalHashInput", "sealedFactText", "questionText",
        "custodyMarks", "retrospectiveRecords", "synthetic")),
    "PACKET_ISSUED": frozenset((
        "tupleKey", "custodian", "reviewer", "packetSha", "issuedAt",
        "phase")),
    "PHASE1_SEALED": frozenset((
        "tupleKey", "reviewer", "packetSha", "sealedBytesSha", "sealedAt",
        "contamination", "sealedPayload")),
    "SEAL_RECEIPT_ACKNOWLEDGED": frozenset(("tupleKey", "custodian", "reviewer")),
    "REVEALED": frozenset(("tupleKey", "custodian", "reviewer")),
    "DELTA_APPENDED": frozenset(("tupleKey", "reviewer", "delta")),
    "LANE_B_REGISTERED": frozenset((
        "tupleKey", "reviewer", "question", "surface", "schemaClaim")),
    "LANE_B_DELIVERED": frozenset(("tupleKey", "custodian", "deliveredTo")),
    "EXPOSURE_REPORTED": frozenset((
        "tupleKey", "exposedTo", "what", "reportedBy", "detail",
        "occurredAtTick")),
    "NEW_PHASE1_REQUESTED": frozenset(("tupleKey", "custodian", "newReviewer")),
    "RATIONALE_ACCESSED": frozenset(("tupleKey", "reviewer")),
    "RECORDS_REDERIVED_DECLARED": frozenset(("tupleKey", "reviewer", "recordRefs")),
    "CLAIM_ADJUDICATED": frozenset((
        "tupleKey", "reviewer", "claimType", "claimId", "prerequisites")),
    "CLAIM_PROVENANCE_VERIFIED": frozenset((
        "tupleKey", "reviewer", "claimType", "claimId", "prerequisites")),
    "EVIDENCE_RECORD_ISSUED": frozenset((
        "tupleKey", "custodian", "rubricIdentity", "parentRubricIdentity",
        "contractIdentity", "categoryAssignment", "tupleLevelName",
        "exclusivity", "proceduralCompleteness", "synthetic")),
}

# CORR6/F-38: complete type-specific declared scope per accepted rubric
# §D.4, bound into the historical proposition identity. `oneOf` means
# exactly one of the listed keys must be present. No other keys are lawful.
HISTORICAL_PROPOSITION_SCOPES = {
    "HISTORICAL_RECORD_EVENT": {
        "required": ("operationId", "coveredTime"), "oneOf": (),
    },
    "HISTORICAL_RECORD_LINKAGE": {
        "required": ("historicalEventId",), "oneOf": (),
    },
    "HISTORICAL_RECORD_PRODUCTION": {
        "required": ("operationId", "survivingValue"), "oneOf": (),
    },
    "HISTORICAL_RECORD_APPLICATION": {
        "required": ("actorId", "readingId"),
        "oneOf": ("operationId", "coveredWindow"),
    },
}
SURVIVING_VALUE_KEYS = frozenset(("sideId", "value"))
OCCURRENCE_REF_KEYS = frozenset(("scope", "scopeOrdinal"))
SCOPE_REF_KEYS = frozenset(("scope", "scopeOrdinal"))

# CORR6/F-37: the marker carried by requester-scoped persisted artifacts.
PROJECTION_ARTIFACT_CLASS = "SCOPED_PROJECTION"
CHAIN_ARTIFACT_CLASS = "AUTHORITATIVE_GLOBAL_CHAIN"

RECORD_REF_KEYS = frozenset(("recordId", "locator", "content"))
CUSTODY_RECORD_KEYS = frozenset(("id", "locator", "content", "sha"))

TUPLE_SPEC_KEYS = frozenset(
    ("caseId", "sideId", "factId", "d", "sealedFactText", "questionText",
     "custodyMarks", "retrospectiveRecords")
)
REVIEW_SPEC_KEYS = frozenset(
    ("interpretationBound", "rationale", "normativeStates",
     "nonAuthoritativeObservations")
)
SEALED_PAYLOAD_KEYS = REVIEW_SPEC_KEYS | frozenset(("packetSha", "reviewer", "synthetic"))
LANE_B_SPEC_KEYS = frozenset(("question", "surface", "schemaClaim"))
INTERPRETATION_BOUND_KEYS = frozenset(
    ("readingsConsidered", "completenessStatement", "exclusions",
     "unexcludedFlipRisk", "determinacy")
)
NORMATIVE_STATES_KEYS = frozenset(("determinacy", "sharedOutput"))

DETERMINACY_VALUES = ("ESTABLISHED", "NOT_ESTABLISHED")
MARK_VALUES = ("YES", "NO")

COMPLETENESS_STATEMENT = (
    "this record represents the procedural state at issuance and implies no "
    "seal, reveal, PROVISIONAL status or adjudication that did not occur"
)

_BINDING_DIR = (
    Path(__file__).resolve().parents[1]
    / "STAGE2_CORR4_L4_EFCA_OWNER_ACCEPTANCE_BINDING_1"
)
DEFAULT_RUBRIC_PATH = _BINDING_DIR / RUBRIC_FILE_NAME
DEFAULT_SIDECAR_PATH = _BINDING_DIR / "SHA256SUMS.txt"
DEFAULT_SCRATCH_DIR = Path(__file__).resolve().parent / "synthetic_runs"

# --------------------------------------------------------------------------
# CORR9/OD-45-A: accepted independent custody-registration entitlement
# --------------------------------------------------------------------------
# The Owner-accepted allocation authority (G2 acceptance, bound physically
# by G3 and corrected documentarily by G3.CORR1): exactly eight synthetic
# allocations, every designated custodian SYN_CUST_001, canonical JSON with
# one trailing newline. The digest below is the Owner-approved pin; the
# default path identifies the physically bound G3.CORR1 artifact relative
# to this module (stable across working directories) and the session fails
# closed when the authority is unavailable or does not hash to the pin.
ALLOCATION_AUTHORITY_ID = "STAGE2_CORR4_L4_EFCA_CORR9_ALLOCATIONS_v1"
ALLOCATION_FILE_NAME = "EFCA_CORR9_ALLOCATIONS_v1.json"
OWNER_ALLOCATIONS_SHA256 = (
    "53eb3ec43feb4de926e057e0dc17a857473872e4bbc9ff571e5937576c38ecb1"
)
AUTHORITY_MODE_OWNER_PINNED = "OWNER_PINNED"
AUTHORITY_MODE_SIMULATION = "SIMULATION"
ALLOCATION_AUTHORITY_MODES = (
    AUTHORITY_MODE_OWNER_PINNED, AUTHORITY_MODE_SIMULATION)
ALLOCATION_ENTRY_KEYS = frozenset(("custodian", "tupleKey"))
ALLOCATION_DOCUMENT_KEYS = frozenset(("allocationAuthority", "allocations"))
# ONE fixed refusal for every unauthorized registration attempt (F-45):
# identical message for an unregistered/unallocated key, a key allocated to
# another custodian and a key already registered under another custodian's
# custody. It names no tuple, custodian, allocation or occupancy detail.
NOT_ENTITLED_MESSAGE = (
    "registration requires an Owner-approved custody entitlement for this "
    "precise tuple identity under the session's verified allocation "
    "authority; a registered CUSTODIAN role and knowledge of the tuple key "
    "are insufficient (OD-45-A)"
)
_ALLOCATION_DIR = (
    Path(__file__).resolve().parents[1]
    / "STAGE2_CORR4_L4_EFCA_CORR9_ALLOCATION_AUTHORITY_1_CORR1"
)
DEFAULT_ALLOCATIONS_PATH = _ALLOCATION_DIR / ALLOCATION_FILE_NAME


# --------------------------------------------------------------------------
# Canonical serialization and hashing
# --------------------------------------------------------------------------

def canonical_bytes(obj):
    return json.dumps(
        obj, sort_keys=True, separators=(",", ":"), ensure_ascii=False
    ).encode("utf-8")


def sha256_hex(data):
    if isinstance(data, str):
        data = data.encode("utf-8")
    return hashlib.sha256(data).hexdigest()


def tuple_key_of(case_id, side_id, fact_id):
    return "%s|%s|%s" % (case_id, side_id, fact_id)


def _is_hex64(value):
    return (isinstance(value, str)
            and re.fullmatch(r"[0-9a-fA-F]{64}", value) is not None)


# --------------------------------------------------------------------------
# Errors
# --------------------------------------------------------------------------

class EFCAGateError(Exception):
    """A mandatory gate refused the requested transition (fail closed; the
    session state is unchanged). `code` is a stable machine-readable code."""

    def __init__(self, code, message):
        super().__init__("%s: %s" % (code, message))
        self.code = code


class IdentityGateError(EFCAGateError):
    """§I.2 rubric-identity issuance gate: NOT ISSUABLE. Never a scientific
    falsifier; never changes any scientific status."""


# --------------------------------------------------------------------------
# Schema validation helpers (closed schemas)
# --------------------------------------------------------------------------

def _check_closed(spec, allowed_keys, where):
    if not isinstance(spec, dict):
        raise EFCAGateError("INVALID_PAYLOAD", "%s must be an object" % where)
    unknown = sorted(set(spec.keys()) - set(allowed_keys))
    if unknown:
        hint = ""
        lowered = {k.lower(): k for k in unknown}
        for bad in FORBIDDEN_FIELD_HINTS:
            if bad.lower() in lowered:
                hint = " (forbidden Phase-1 material: %s)" % lowered[bad.lower()]
                break
        raise EFCAGateError(
            "UNKNOWN_FIELD_REJECTED",
            "%s rejects unknown field(s): %s%s" % (where, ", ".join(unknown), hint),
        )


def _require_syn_id(kind, value):
    pattern = SYN_PATTERNS.get(kind)
    if pattern is None or not isinstance(value, str) or not pattern.fullmatch(value):
        raise EFCAGateError(
            "NON_SYNTHETIC_IDENTIFIER",
            "%s=%r is not a lawful synthetic identifier; this engine accepts "
            "invented SYN_* identifiers only and never historical tuples"
            % (kind, value),
        )


def _require_synthetic_text(field, value):
    if not isinstance(value, str) or not value:
        raise EFCAGateError("INVALID_PAYLOAD", "%s must be a non-empty string" % field)
    if SYNTHETIC_TEXT_MARKER not in value:
        raise EFCAGateError(
            "NON_SYNTHETIC_CONTENT",
            "%s does not carry the %s classification marker" % (field, SYNTHETIC_TEXT_MARKER),
        )


def _validate_interpretation_bound(bound):
    _check_closed(bound, INTERPRETATION_BOUND_KEYS, "interpretationBound")
    readings = bound.get("readingsConsidered")
    if not isinstance(readings, list) or not readings:
        raise EFCAGateError("INVALID_PAYLOAD", "readingsConsidered must be non-empty")
    for r in readings:
        if (not isinstance(r, dict)
                or set(r.keys()) != {"id", "output"}
                or not isinstance(r["id"], str) or not r["id"]
                or r["output"] not in MARK_VALUES):
            raise EFCAGateError(
                "INVALID_PAYLOAD", "each reading must be {id, output in YES/NO}"
            )
    if not isinstance(bound.get("completenessStatement"), str):
        raise EFCAGateError("INVALID_PAYLOAD", "completenessStatement required")
    _require_synthetic_text("completenessStatement",
                            bound["completenessStatement"])
    exclusions = bound.get("exclusions")
    if not isinstance(exclusions, list):
        raise EFCAGateError("INVALID_PAYLOAD", "exclusions must be a list")
    for ex in exclusions:
        if (not isinstance(ex, dict)
                or set(ex.keys()) != {"readingClass", "reason"}
                or not isinstance(ex["readingClass"], str)
                or not isinstance(ex["reason"], str)):
            raise EFCAGateError(
                "INVALID_PAYLOAD", "each exclusion must be {readingClass, reason}"
            )
        _require_synthetic_text("exclusion reason", ex["reason"])
    if not isinstance(bound.get("unexcludedFlipRisk"), str):
        raise EFCAGateError("INVALID_PAYLOAD", "unexcludedFlipRisk required")
    _require_synthetic_text("unexcludedFlipRisk", bound["unexcludedFlipRisk"])
    if bound.get("determinacy") not in DETERMINACY_VALUES:
        raise EFCAGateError(
            "INVALID_PAYLOAD", "determinacy must be in %s" % (DETERMINACY_VALUES,)
        )


def _validate_normative_states(states):
    _check_closed(states, NORMATIVE_STATES_KEYS, "normativeStates")
    if states.get("determinacy") not in DETERMINACY_VALUES:
        raise EFCAGateError("INVALID_PAYLOAD", "normativeStates.determinacy required")
    shared = states.get("sharedOutput")
    if shared is not None and shared not in MARK_VALUES:
        raise EFCAGateError("INVALID_PAYLOAD", "sharedOutput must be YES, NO or null")


def _validate_normative_coherence(bound, states):
    """F-29: enforce exactly the relationships the accepted rubric states
    (§E.1) among admissible readings, determinacy and shared output. No new
    scientific criteria: a contradictory proof claim is refused, not
    interpreted."""
    outputs = [r["output"] for r in bound.get("readingsConsidered", [])]
    if bound.get("determinacy") == "ESTABLISHED":
        if len(set(outputs)) != 1:
            raise EFCAGateError(
                "INVALID_NORMATIVE_CONSISTENCY",
                "determinacy ESTABLISHED requires all admissible readings to "
                "give the same output; a bound with diverging outputs has no "
                "established determinacy (rubric §E.1 states 1 vs 2; F-29)")
        if states.get("determinacy") != "ESTABLISHED":
            raise EFCAGateError(
                "INVALID_NORMATIVE_CONSISTENCY",
                "normativeStates determinacy disagrees with the "
                "interpretation bound (F-29)")
        if states.get("sharedOutput") != outputs[0]:
            raise EFCAGateError(
                "INVALID_NORMATIVE_CONSISTENCY",
                "a shared output must equal the readings' common output "
                "(F-29)")
    else:
        if states.get("determinacy") == "ESTABLISHED":
            raise EFCAGateError(
                "INVALID_NORMATIVE_CONSISTENCY",
                "normativeStates determinacy disagrees with the "
                "interpretation bound (F-29)")
        if states.get("sharedOutput") is not None:
            raise EFCAGateError(
                "INVALID_NORMATIVE_CONSISTENCY",
                "no shared output may be declared without established "
                "determinacy (rubric §E.1 state 1; F-29)")


def _validate_raw_observations(observations):
    if not isinstance(observations, list):
        raise EFCAGateError("INVALID_PAYLOAD",
                            "nonAuthoritativeObservations must be a list")
    for obs in observations:
        if (not isinstance(obs, dict) or set(obs.keys()) != {"note"}
                or not isinstance(obs.get("note"), str)):
            raise EFCAGateError(
                "INVALID_PAYLOAD",
                "each observation must be exactly {note: str}; observations "
                "are non-authoritative test observations only",
            )
        _require_synthetic_text("observation note", obs["note"])


def _validate_sealed_observations(observations):
    if not isinstance(observations, list):
        raise EFCAGateError("INVALID_PAYLOAD",
                            "nonAuthoritativeObservations must be a list")
    for obs in observations:
        if (not isinstance(obs, dict)
                or set(obs.keys()) != {"note", "authoritative"}
                or not isinstance(obs.get("note"), str)
                or obs.get("authoritative") is not False):
            raise EFCAGateError(
                "INVALID_PAYLOAD",
                "sealed observations must be exactly "
                "{note: str, authoritative: false}",
            )
        _require_synthetic_text("observation note", obs["note"])


def _validate_raw_review(review):
    """Closed-schema validation of the CALLER-FACING review input: exactly
    the raw review fields, nothing else (client hashes, roles, synthetic
    flags or scientific fields are rejected here)."""
    _check_closed(review, REVIEW_SPEC_KEYS, "phase1_review")
    _validate_interpretation_bound(review.get("interpretationBound"))
    rationale = review.get("rationale")
    if not isinstance(rationale, str) or not rationale:
        raise EFCAGateError("INVALID_PAYLOAD", "rationale required")
    _require_synthetic_text("rationale", rationale)
    _validate_normative_states(review.get("normativeStates"))
    _validate_normative_coherence(review.get("interpretationBound"),
                                  review.get("normativeStates"))
    _validate_raw_observations(review.get("nonAuthoritativeObservations", []))


def _validate_review_payload(payload):
    """Validate the sealed payload: exact key set, review content, and the
    mandatory synthetic=true classification (F-15)."""
    _check_closed(payload, SEALED_PAYLOAD_KEYS, "phase1_review")
    if payload.get("synthetic") is not True:
        raise EFCAGateError(
            "INVALID_TRANSITION",
            "a sealed Phase-1 payload must carry synthetic=true; forged "
            "classification flags are refused on live and replayed paths "
            "alike (F-15)",
        )
    _validate_interpretation_bound(payload.get("interpretationBound"))
    rationale = payload.get("rationale")
    if not isinstance(rationale, str) or not rationale:
        raise EFCAGateError("INVALID_PAYLOAD", "rationale required")
    _require_synthetic_text("rationale", rationale)
    _validate_normative_states(payload.get("normativeStates"))
    _validate_normative_coherence(payload.get("interpretationBound"),
                                  payload.get("normativeStates"))
    _validate_sealed_observations(payload.get("nonAuthoritativeObservations", []))


def _validate_custody_records(records):
    """Authenticated invented retrospective records: exactly
    {id, locator, content, sha} with sha == sha256(content)."""
    if not isinstance(records, list):
        raise EFCAGateError("INVALID_PAYLOAD",
                            "retrospectiveRecords must be a list")
    seen, normalized = set(), []
    for r in records:
        if not isinstance(r, dict) or set(r.keys()) != CUSTODY_RECORD_KEYS:
            raise EFCAGateError(
                "INVALID_PAYLOAD",
                "each retrospective record must be exactly "
                "{id, locator, content, sha}",
            )
        _require_syn_id("retrospectiveId", r.get("id"))
        _require_syn_id("locator", r.get("locator"))
        _require_synthetic_text("retrospective record content", r.get("content"))
        if not _is_hex64(r.get("sha")):
            raise EFCAGateError("INVALID_PAYLOAD",
                                "retrospective record sha must be hex64")
        if sha256_hex(r["content"]) != r["sha"]:
            raise EFCAGateError(
                "RECORD_DIGEST_MISMATCH",
                "the authenticated record digest must equal sha256 of the "
                "record content",
            )
        if r["id"] in seen:
            raise EFCAGateError("INVALID_PAYLOAD",
                                "duplicate retrospective id %r" % r["id"])
        seen.add(r["id"])
        normalized.append({"id": r["id"], "locator": r["locator"],
                           "content": r["content"], "sha": r["sha"]})
    return normalized


def _validate_record_refs_in(ix, tuple_key, refs, where):
    """Proof-carrying reconstruction references (F-16): each reference cites
    an authenticated record by {recordId, locator, content}, and the content
    must hash to the authenticated record digest. Used identically by live
    operations and replay validation."""
    if not isinstance(refs, list) or not refs:
        raise EFCAGateError(
            "INVALID_RECORD_LOCATORS",
            "the %s must cite at least one authenticated reconstruction "
            "reference {recordId, locator, content}; a bare identifier is "
            "not a re-derivation (F-16)" % where,
        )
    tup = _require_tuple_in(ix, tuple_key)
    by_id = {r["id"]: r for r in tup["retrospectiveRecords"]}
    seen, out = set(), []
    for ref in refs:
        if not isinstance(ref, dict) or set(ref.keys()) != RECORD_REF_KEYS:
            raise EFCAGateError(
                "INVALID_RECORD_LOCATORS",
                "each reconstruction reference must be exactly "
                "{recordId, locator, content}",
            )
        rid = ref.get("recordId")
        record = by_id.get(rid) if isinstance(rid, str) else None
        if record is None:
            raise EFCAGateError(
                "INVALID_RECORD_LOCATORS",
                "record reference %r is not an authenticated retrospective "
                "record of this tuple" % (rid,),
            )
        if rid in seen:
            raise EFCAGateError("INVALID_RECORD_LOCATORS",
                                "duplicate record reference %r" % rid)
        if ref.get("locator") != record["locator"]:
            raise EFCAGateError(
                "INVALID_RECORD_LOCATORS",
                "locator mismatch for %s; the re-derivation must cite the "
                "authenticated locator" % rid,
            )
        _require_synthetic_text("reconstruction content", ref.get("content"))
        if sha256_hex(ref["content"]) != record["sha"]:
            raise EFCAGateError(
                "RECONSTRUCTION_DIGEST_MISMATCH",
                "the reproduced content for %s does not hash to the "
                "authenticated record digest; an unverified assertion is "
                "not a re-derivation (F-16)" % rid,
            )
        seen.add(rid)
        out.append({"recordId": rid, "locator": record["locator"],
                    "content": ref["content"]})
    return out


# --------------------------------------------------------------------------
# CORR6/F-38: declared historical proposition scope (rubric §D.4)
# --------------------------------------------------------------------------

def _validate_historical_proposition_scope(claim_type, proposition):
    """OD-38/F-38. The proposition is identified by its declared content and
    COMPLETE type-specific scope from accepted rubric §D.4. Missing or
    malformed mandatory scope fails closed; declared tokens are bound and
    canonicalized, never interpreted (no semantic-equivalence algorithm, no
    sufficiency, no promotion)."""
    rules = HISTORICAL_PROPOSITION_SCOPES.get(claim_type)
    if rules is None:
        raise EFCAGateError(
            "REFUSED_INCOMPLETE_PROPOSITION_SCOPE",
            "claim type %r has no declared historical proposition scope "
            "under this engine (F-38)" % (claim_type,))
    if not isinstance(proposition, dict):
        raise EFCAGateError(
            "REFUSED_INCOMPLETE_PROPOSITION_SCOPE",
            "a historical-record claim requires the complete declared "
            "proposition scope %s per rubric §D.4; a missing mandatory "
            "scope fails closed (OD-38/F-38)"
            % (sorted(set(rules["required"]) | set(rules["oneOf"])),))
    allowed = set(rules["required"]) | set(rules["oneOf"])
    _check_closed(proposition, allowed, "proposition scope")
    missing = [k for k in rules["required"] if k not in proposition]
    if missing:
        raise EFCAGateError(
            "REFUSED_INCOMPLETE_PROPOSITION_SCOPE",
            "declared proposition scope is missing mandatory slot(s) %s; an "
            "incomplete scope fails closed and is never defaulted (OD-38/"
            "F-38)" % ", ".join(sorted(missing)))
    oneof = tuple(rules["oneOf"])
    if oneof:
        present = [k for k in oneof if k in proposition]
        if len(present) != 1:
            raise EFCAGateError(
                "REFUSED_INCOMPLETE_PROPOSITION_SCOPE",
                "the declared proposition scope must carry exactly one of "
                "%s (found %s); the engine never chooses a scope slot for "
                "the declarer (OD-38/F-38)" % (sorted(oneof), sorted(present)))
    normalized = {}
    for key in sorted(proposition):
        value = proposition[key]
        if key == "survivingValue":
            if not isinstance(value, dict) or set(value.keys()) != SURVIVING_VALUE_KEYS:
                raise EFCAGateError(
                    "INVALID_PAYLOAD",
                    "survivingValue must be exactly {sideId, value}: the "
                    "surviving mark keeps its side-anchored identity and is "
                    "never reduced to a YES/NO value (F-38)")
            _require_syn_id("sideId", value.get("sideId"))
            if value.get("value") not in MARK_VALUES:
                raise EFCAGateError(
                    "INVALID_PAYLOAD",
                    "survivingValue.value must be YES or NO")
            normalized[key] = {"sideId": value["sideId"],
                               "value": value["value"]}
        elif key == "actorId":
            if (not isinstance(value, str)
                    or not any(pat.fullmatch(value)
                               for pat in SYN_ACTOR_PATTERNS.values())):
                raise EFCAGateError(
                    "NON_SYNTHETIC_IDENTIFIER",
                    "actorId=%r is not a lawful synthetic actor identifier "
                    "for a declared proposition scope (F-38)" % (value,))
            normalized[key] = value
        else:
            _require_syn_id(key, value)
            normalized[key] = value
    return normalized


def _resolve_occurrence_ref_in(ix, actor_id, ordinal):
    """OD-37/F-37. The exposure occurrence is declared as a scope-local
    reference into the reporter's own recorded event sequence (registration
    and every event naming the reporter as a party). The acceptance bound is
    the reporter's own record — never the session clock — so neither
    acceptance nor refusal can probe the session-global count or tick."""
    seq = ix["actor_ticks"].get(actor_id, [])
    if not _is_plain_int(ordinal):
        raise EFCAGateError(
            "INVALID_TICK_TYPE",
            "occurredScopeRef.scopeOrdinal must be a plain integer ordinal; "
            "booleans, floats and strings are not valid occurrence "
            "references (F-25 type discipline preserved under OD-37)")
    if ordinal < 1 or ordinal > len(seq):
        raise EFCAGateError(
            "INVALID_PAYLOAD",
            "the occurrence reference must name one of your own recorded "
            "events (1..%d); an occurrence cannot postdate your own "
            "observable record (OD-37/F-37 scope-local bound)"
            % (len(seq),))
    return seq[ordinal - 1]


def _event_participants(et, p):
    """Actors named as parties by an event. This is the reporter's own
    recorded sequence used by occurrence references: structural and
    monotone (it does not depend on sealing or blindness), so references
    stay stable as history grows."""
    out = []
    for key in ("actorId", "custodian", "reviewer", "deliveredTo",
                "exposedTo", "reportedBy", "newReviewer"):
        value = p.get(key)
        if isinstance(value, str):
            out.append(value)
    return out


# --------------------------------------------------------------------------
# Hash-chain primitives
# --------------------------------------------------------------------------

GENESIS_PREV = "0" * 64


def _event_sha(record_without_sha):
    return sha256_hex(canonical_bytes(record_without_sha))


def _make_genesis(session_label, allocations_sha256, allocation_authority_mode):
    """CORR9-native GENESIS: the immutable (mode, digest) allocation-
    authority pair is derived at construction from the verified effective
    authority and bound into the chain's genesis payload."""
    record = {
        "seq": 0,
        "eventId": "E0000",
        "eventType": "GENESIS",
        "t": 0,
        "prevEventSha": GENESIS_PREV,
        "payload": {"engineActId": ENGINE_ACT_ID, "sessionLabel": session_label,
                    "syntheticOnly": True,
                    "allocationsSha256": allocations_sha256,
                    "allocationAuthorityMode": allocation_authority_mode},
    }
    record["eventSha"] = _event_sha(
        {k: v for k, v in record.items() if k != "eventSha"}
    )
    return record


EVENT_ENVELOPE_KEYS = frozenset((
    "seq", "eventId", "eventType", "t", "prevEventSha", "payload",
    "eventSha"))


def _is_plain_int(value):
    return isinstance(value, int) and not isinstance(value, bool)


def verify_chain(events):
    """Cryptographic AND envelope verification (F-21): exact outer key set,
    field types, deterministic eventId "E%04d" % seq, genesis tick 0,
    strictly consecutive logical ticks, seq continuity, prev linkage, event
    hashes, unique ids, known types. Semantic/procedural validity is a
    SEPARATE layer (_check_transition): a chain that verifies here is not
    yet proven procedurally lawful."""
    if not events:
        return False, "empty history"
    prev = GENESIS_PREV
    prev_t = None
    seen_ids = set()
    for i, ev in enumerate(events):
        if not isinstance(ev, dict):
            return False, "event %d is not an object" % i
        if set(ev.keys()) != EVENT_ENVELOPE_KEYS:
            return False, ("envelope schema violation at %d: expected "
                           "exactly %s (F-21)"
                           % (i, sorted(EVENT_ENVELOPE_KEYS)))
        if not _is_plain_int(ev["seq"]) or ev["seq"] != i:
            return False, "seq discontinuity at %d" % i
        if (not isinstance(ev["eventType"], str)
                or ev["eventType"] not in EVENT_PAYLOAD_SCHEMAS):
            return False, "unknown event type at seq %d" % i
        if (not isinstance(ev["eventId"], str)
                or ev["eventId"] != "E%04d" % i):
            return False, ("non-deterministic eventId %r at seq %d (F-21)"
                           % (ev.get("eventId"), i))
        if ev["eventId"] in seen_ids:
            return False, "duplicate eventId %r" % ev["eventId"]
        seen_ids.add(ev["eventId"])
        if (not isinstance(ev["prevEventSha"], str)
                or ev["prevEventSha"] != prev):
            return False, "prev-linkage break at seq %d" % i
        if not isinstance(ev["eventSha"], str):
            return False, "invalid eventSha type at seq %d" % i
        body = {k: v for k, v in ev.items() if k != "eventSha"}
        if _event_sha(body) != ev["eventSha"]:
            return False, "hash mismatch at seq %d" % i
        if not isinstance(ev["payload"], dict):
            return False, "payload must be an object at seq %d" % i
        if not _is_plain_int(ev["t"]):
            return False, "non-integer logical time at seq %d" % i
        expected_t = 0 if i == 0 else prev_t + 1
        if ev["t"] != expected_t:
            return False, ("non-consecutive logical tick %s at seq %d "
                           "(expected %s; F-21)" % (ev["t"], i, expected_t))
        prev_t = ev["t"]
        prev = ev["eventSha"]
    if events[0].get("eventType") != "GENESIS":
        return False, "first event is not GENESIS"
    return True, "ok"


def _fresh_index():
    return {
        "actors": {},             # actorId -> role
        "tuples": {},             # tupleKey -> custody dict
        "packets": {},            # (tupleKey, reviewer) -> [packets]
        "seals": {},              # (tupleKey, reviewer) -> seal record
        "receipts": {},           # (tupleKey, reviewer) -> tick
        "reveals": {},            # (tupleKey, reviewer) -> tick
        "deltas": [],             # (tupleKey, reviewer, delta, tick)
        "lane_b": {},             # (tupleKey, submissionId) -> record (F-39)
        "lane_b_actor_counts": {},  # (tupleKey, reviewer) -> own filings
        "lane_b_legacy": {},      # tupleKey -> record (frozen CORR5 shape)
        "lane_b_deliveries": [],  # (tupleKey, submissionId|None, actor, tick)
        "incidents": {},          # tupleKey -> {actorId: [explicit incidents]}
        "rationale_access": {},   # (tupleKey, reviewer) -> tick
        "rederivations": {},      # (tupleKey, reviewer) -> {recordRefs, tick}
        "adjudications": [],      # normative CLAIM_ADJUDICATED records only
        "provenance": [],         # CLAIM_PROVENANCE_VERIFIED records (F-35)
        "propositions": {},       # canonical boundProposition key -> F-38 record
        "claim_ids": {},          # (tupleKey, claimId) -> claimType (F-34)
        "named_normative": {},    # (tupleKey, claimType) -> claimId (F-36)
        "evidence_records": [],   # issued records
        "actor_ticks": {},        # actorId -> [ticks of events naming them]
        "last_t": 0,
    }


def _index_event(ev, ix, version="CORR9"):
    et = ev["eventType"]
    p = ev["payload"]
    t = ev["t"]
    ix["last_t"] = t
    for actor in sorted(set(_event_participants(et, p))):
        ix["actor_ticks"].setdefault(actor, []).append(t)
    if et == "GENESIS":
        return
    if et == "ACTOR_REGISTERED":
        ix["actors"][p["actorId"]] = p["role"]
    elif et == "TUPLE_REGISTERED":
        key = tuple_key_of(p["caseId"], p["sideId"], p["factId"])
        ix["tuples"][key] = {
            "custodian": p["custodian"],
            "tupleId": {"caseId": p["caseId"], "sideId": p["sideId"],
                        "factId": p["factId"], "d": p["d"]},
            "canonicalHashInput": p["canonicalHashInput"],
            "sealedFactText": p["sealedFactText"],
            "questionText": p["questionText"],
            "custodyMarks": dict(p["custodyMarks"]),
            "retrospectiveRecords": [dict(r) for r in p["retrospectiveRecords"]],
            "registeredAt": t,
            "synthetic": True,
        }
    elif et == "PACKET_ISSUED":
        ix["packets"].setdefault((p["tupleKey"], p["reviewer"]), []).append(
            {"packetSha": p["packetSha"], "issuedAt": p["issuedAt"],
             "phase": p["phase"], "custodian": p["custodian"]}
        )
    elif et == "PHASE1_SEALED":
        ix["seals"][(p["tupleKey"], p["reviewer"])] = {
            "packetSha": p["packetSha"],
            "sealedBytesSha": p["sealedBytesSha"],
            "sealedAt": p["sealedAt"],
            "contamination": json.loads(json.dumps(p["contamination"])),
            "sealedPayload": json.loads(json.dumps(p["sealedPayload"])),
        }
    elif et == "SEAL_RECEIPT_ACKNOWLEDGED":
        ix["receipts"][(p["tupleKey"], p["reviewer"])] = t
    elif et == "REVEALED":
        ix["reveals"][(p["tupleKey"], p["reviewer"])] = t
    elif et == "DELTA_APPENDED":
        ix["deltas"].append((p["tupleKey"], p["reviewer"], p["delta"], t))
    elif et == "LANE_B_REGISTERED":
        record = {
            "reviewer": p["reviewer"],
            "question": p["question"], "surface": p["surface"],
            "schemaClaim": p["schemaClaim"],
            "causeLink": "UNASSIGNED_PENDING_J1", "registeredAtTick": t,
        }
        if version == "LEGACY":
            ix["lane_b_legacy"][p["tupleKey"]] = record
        else:
            record["submissionId"] = p["submissionId"]
            ix["lane_b"][(p["tupleKey"], p["submissionId"])] = record
            counts = ix["lane_b_actor_counts"]
            counts[(p["tupleKey"], p["reviewer"])] = (
                counts.get((p["tupleKey"], p["reviewer"]), 0) + 1)
    elif et == "LANE_B_DELIVERED":
        ix["lane_b_deliveries"].append(
            (p["tupleKey"], p.get("submissionId"), p["deliveredTo"], t))
    elif et == "EXPOSURE_REPORTED":
        ix["incidents"].setdefault(p["tupleKey"], {}).setdefault(
            p["exposedTo"], []).append(
            {"what": p["what"], "occurredAtTick": p.get("occurredAtTick"),
             "reportedTick": t, "reportedBy": p["reportedBy"],
             "detail": p.get("detail", "")}
        )
    elif et == "NEW_PHASE1_REQUESTED":
        pass
    elif et == "RATIONALE_ACCESSED":
        ix["rationale_access"][(p["tupleKey"], p["reviewer"])] = t
    elif et == "RECORDS_REDERIVED_DECLARED":
        ix["rederivations"][(p["tupleKey"], p["reviewer"])] = {
            "recordRefs": [dict(r) for r in p["recordRefs"]], "tick": t,
        }
    elif et == "CLAIM_ADJUDICATED":
        ix["adjudications"].append({
            "tupleKey": p["tupleKey"], "reviewer": p["reviewer"],
            "claimType": p["claimType"], "claimId": p["claimId"],
            "prerequisites": json.loads(json.dumps(p["prerequisites"])),
            "tick": t,
        })
        ix["claim_ids"][(p["tupleKey"], p["claimId"])] = p["claimType"]
        if p["claimType"] == "NORMATIVE_DETERMINACY":
            ix["named_normative"][(p["tupleKey"], p["claimType"])] = p["claimId"]
    elif et == "CLAIM_PROVENANCE_VERIFIED":
        ix["provenance"].append({
            "tupleKey": p["tupleKey"], "reviewer": p["reviewer"],
            "claimType": p["claimType"], "claimId": p["claimId"],
            "prerequisites": json.loads(json.dumps(p["prerequisites"])),
            "tick": t,
        })
        ix["claim_ids"][(p["tupleKey"], p["claimId"])] = p["claimType"]
        if version != "LEGACY":
            bound = p["prerequisites"].get("boundProposition")
            if isinstance(bound, dict):
                key = canonical_bytes(bound).decode("utf-8")
                rec = ix["propositions"].setdefault(key, {
                    "tupleKey": p["tupleKey"],
                    "boundProposition": json.loads(json.dumps(bound)),
                    "attestations": [],
                })
                rec["attestations"].append({
                    "claimId": p["claimId"], "reviewer": p["reviewer"],
                    "tick": t,
                })
        # LEGACY: the frozen CORR5 shape carries an incomplete proposition
        # (claimType + authenticated-records + recordIds). It is provenance
        # only and is NEVER indexed as a complete bound proposition.
    elif et == "EVIDENCE_RECORD_ISSUED":
        ix["evidence_records"].append(json.loads(json.dumps(p)))
    else:  # pragma: no cover - verify_chain guards this
        raise EFCAGateError("HASH_CHAIN_INVALID",
                            "unknown event type during replay: %s" % et)


# --------------------------------------------------------------------------
# Semantic helpers shared by live ops, validators and status computation
# --------------------------------------------------------------------------

def _require_actor_in(ix, actor_id, role=None):
    if not isinstance(actor_id, str) or actor_id not in ix["actors"]:
        raise EFCAGateError("UNKNOWN_ACTOR",
                            "actor %r is not registered in this session" % actor_id)
    trusted = ix["actors"][actor_id]
    if role is not None and trusted != role:
        raise EFCAGateError(
            "ROLE_MISMATCH",
            "actor %r has trusted role %s; operation requires %s. "
            "Caller-supplied role claims cannot override the session registry."
            % (actor_id, trusted, role),
        )
    return trusted


def _require_synthetic_actor_in(ix, actor_id, role=None):
    _require_actor_in(ix, actor_id, role)
    pattern = SYN_ACTOR_PATTERNS[ix["actors"][actor_id]]
    if not pattern.fullmatch(actor_id):
        raise EFCAGateError("NON_SYNTHETIC_IDENTIFIER",
                            "actor id %r violates the synthetic pattern" % actor_id)


def _require_tuple_key_form(tuple_key):
    if not isinstance(tuple_key, str):
        raise EFCAGateError("NON_SYNTHETIC_IDENTIFIER", "tuple key must be a string")
    parts = tuple_key.split("|")
    if len(parts) != 3:
        raise EFCAGateError("NON_SYNTHETIC_IDENTIFIER",
                            "tuple key %r is malformed" % tuple_key)
    for kind, value in zip(("caseId", "sideId", "factId"), parts):
        _require_syn_id(kind, value)


# --------------------------------------------------------------------------
# CORR9/OD-45-A: verified immutable allocation authority (tuple → custodian)
# --------------------------------------------------------------------------

def _allocation_entry_digest(tuple_key, custodian):
    """CORR9/OD-45-A canonical digest of ONE authorized allocation entry:
    sha256 over the canonical (sorted-keys, compact separators) encoding of
    exactly {"custodian", "tupleKey"}. Deterministic, engine-recomputable
    on both the live and the replay path; the `allocationDigest` carried by
    TUPLE_REGISTERED is this value for the tuple's exact authorized
    entry."""
    return sha256_hex(canonical_bytes(
        {"custodian": custodian, "tupleKey": tuple_key}))


class AllocationAuthority(object):
    """CORR9/OD-45-A: an immutable, verified `tupleKey → authorizedCustodian`
    entitlement mapping. Constructed only by this module's own loaders (the
    Owner-pinned loader or the explicitly declared simulation loader); the
    inventory itself is never disclosed through any requester-facing
    operation. Exactly one entry per tuple key: the mapping refuses
    duplicate keys at load time, so no caller, API or event can reallocate,
    transfer or replace an entry at runtime."""

    __slots__ = ("_mode", "_digest", "_by_tuple")

    def __init__(self, mode, digest, by_tuple):
        self._mode = mode
        self._digest = digest
        self._by_tuple = dict(by_tuple)

    @property
    def mode(self):
        """The engine-derived authority mode: OWNER_PINNED for the default
        construction from the Owner-pinned manifest, SIMULATION for any
        explicitly declared test-only allocation override."""
        return self._mode

    @property
    def digest(self):
        """SHA-256 of the exact effective allocation-authority bytes."""
        return self._digest

    def custodian_for(self, tuple_key):
        """The single authorized custodian of this tuple, or None when the
        verified authority contains no entitlement for it (no first-writer
        capture is lawful)."""
        return self._by_tuple.get(tuple_key)

    def size(self):
        """Number of allocated tuple identities (host-level introspection
        used for evidence assertions; never disclosed to requesters)."""
        return len(self._by_tuple)


def _parse_allocation_document(document, where):
    """Closed-schema validation of one allocation-authority document.
    Exact key sets only (unknown fields are rejected), approved authority
    identifier required, every tuple key and custodian must match the
    synthetic patterns, and a duplicate tuple key is a conflicting
    allocation — refused (ALLOCATION_CONFLICT), never last-writer-wins."""
    if (not isinstance(document, dict)
            or set(document.keys()) != ALLOCATION_DOCUMENT_KEYS):
        raise EFCAGateError(
            "ALLOCATIONS_MALFORMED",
            "%s must be exactly {allocationAuthority, allocations} "
            "(closed schema; unknown or missing fields are refused)"
            % where)
    if document.get("allocationAuthority") != ALLOCATION_AUTHORITY_ID:
        raise EFCAGateError(
            "ALLOCATIONS_MALFORMED",
            "%s does not declare the approved authority identifier %r"
            % (where, ALLOCATION_AUTHORITY_ID))
    allocations = document.get("allocations")
    if not isinstance(allocations, list):
        raise EFCAGateError("ALLOCATIONS_MALFORMED",
                            "%s.allocations must be a list" % where)
    by_tuple = {}
    for entry in allocations:
        if (not isinstance(entry, dict)
                or set(entry.keys()) != ALLOCATION_ENTRY_KEYS):
            raise EFCAGateError(
                "ALLOCATIONS_MALFORMED",
                "each allocation entry of %s must be exactly "
                "{custodian, tupleKey} (unknown fields are refused)" % where)
        key = entry.get("tupleKey")
        custodian = entry.get("custodian")
        _require_tuple_key_form(key)
        if (not isinstance(custodian, str)
                or not SYN_ACTOR_PATTERNS["CUSTODIAN"].fullmatch(custodian)):
            raise EFCAGateError(
                "NON_SYNTHETIC_IDENTIFIER",
                "allocation custodian %r is not a lawful synthetic "
                "CUSTODIAN identifier; this engine accepts invented SYN_* "
                "identifiers only and never historical actors" % (custodian,))
        if key in by_tuple:
            raise EFCAGateError(
                "ALLOCATION_CONFLICT",
                "%s contains more than one allocation for the same tuple "
                "identity; conflicting or ambiguous allocations fail closed "
                "and exactly one effective custodian per tuple is lawful "
                "(OD-45-A)" % where)
        by_tuple[key] = custodian
    return by_tuple


def _decode_allocation_bytes(raw, where):
    """Decode + canonical-encoding verification shared by both loaders: the
    accepted encoding is JSON, UTF-8, no BOM, keys sorted recursively,
    compact separators and exactly one trailing newline."""
    try:
        document = json.loads(raw.decode("utf-8"))
    except (ValueError, UnicodeDecodeError) as exc:
        raise EFCAGateError(
            "ALLOCATIONS_MALFORMED",
            "%s is not valid UTF-8 JSON: %s" % (where, exc))
    if raw != canonical_bytes(document) + b"\n":
        raise EFCAGateError(
            "ALLOCATIONS_MALFORMED",
            "%s does not use the accepted canonical encoding (sorted keys, "
            "compact separators, one trailing newline); a re-encoded or "
            "decorated authority is not the accepted artifact" % where)
    return document


def _load_pinned_authority(path):
    """The default, non-override native construction: load the
    Owner-pinned allocation manifest and verify its SHA-256 against the
    exact Owner-approved pin BEFORE any actor-facing operation. A caller
    cannot replace the Owner pin by supplying a matching hash for their own
    manifest: the pin is an engine source constant, and a caller-supplied
    path is checked against that same constant."""
    target = Path(path)
    if not target.is_file():
        raise EFCAGateError(
            "ALLOCATIONS_AUTHORITY_UNAVAILABLE",
            "the Owner-approved allocation authority is not present at %s; "
            "the session fails closed rather than operating without a "
            "verified entitlement mapping (OD-45-A)" % target)
    raw = target.read_bytes()
    digest = sha256_hex(raw)
    if digest != OWNER_ALLOCATIONS_SHA256:
        raise EFCAGateError(
            "ALLOCATIONS_IDENTITY_MISMATCH",
            "computed allocation-authority SHA-256 %s does not equal the "
            "Owner-approved pin %s; an authority whose bytes are not the "
            "Owner-approved bytes is not Owner approval — a hash computed "
            "from arbitrary supplied JSON is not proof of Owner approval "
            "(OD-45-A)" % (digest, OWNER_ALLOCATIONS_SHA256))
    document = _decode_allocation_bytes(
        raw, "the Owner-pinned allocation authority")
    by_tuple = _parse_allocation_document(
        document, "the Owner-pinned allocation authority")
    return AllocationAuthority(
        AUTHORITY_MODE_OWNER_PINNED, digest, by_tuple)


def _load_simulation_authority(document=None, path=None):
    """Explicit, clearly named test-only allocation overrides for isolated
    synthetic regression scenarios. A construction that uses either
    simulation parameter ALWAYS produces SIMULATION, never OWNER_PINNED;
    the digest is computed by the engine from the effective bytes, so the
    simulation interface cannot be used to set the authoritative mode or to
    claim Owner authorization — including when the supplied allocation
    bytes are an exact copy of the Owner-pinned manifest."""
    if document is not None and path is not None:  # pragma: no cover
        raise EFCAGateError(
            "ALLOCATIONS_MODE_CONFLICT",
            "declare at most one simulation allocation source")
    if path is not None:
        target = Path(path)
        if not target.is_file():
            raise EFCAGateError(
                "ALLOCATIONS_AUTHORITY_UNAVAILABLE",
                "the declared simulation allocation authority is not "
                "present at %s; the session fails closed" % target)
        raw = target.read_bytes()
        document = _decode_allocation_bytes(
            raw, "the simulation allocation authority")
        digest = sha256_hex(raw)
    else:
        raw = canonical_bytes(document) + b"\n"
        digest = sha256_hex(raw)
    by_tuple = _parse_allocation_document(
        document, "the simulation allocation authority")
    return AllocationAuthority(
        AUTHORITY_MODE_SIMULATION, digest, by_tuple)


def _require_tuple_in(ix, tuple_key):
    _require_tuple_key_form(tuple_key)
    if tuple_key not in ix["tuples"]:
        raise EFCAGateError("UNKNOWN_TUPLE", "tuple %r is not registered" % tuple_key)
    return ix["tuples"][tuple_key]


def _require_custodian_of_in(ix, tuple_key, actor_id):
    _require_synthetic_actor_in(ix, actor_id, "CUSTODIAN")
    tup = _require_tuple_in(ix, tuple_key)
    if tup["custodian"] != actor_id:
        raise EFCAGateError(
            "ROLE_MISMATCH",
            "actor %r is not the custodian of %s" % (actor_id, tuple_key),
        )
    return tup


def _active_packet_in(ix, tuple_key, reviewer):
    packets = ix["packets"].get((tuple_key, reviewer), [])
    return packets[-1] if packets else None


def _require_active_packet_uniform_in(ix, tuple_key, reviewer_id):
    """CORR7/F-41 packet-first gate for reproducer operations: an
    unregistered key and a foreign tuple without a packet to this requester
    produce the identical UNISSUED_PACKET refusal, so registration status is
    not observable."""
    packet = _active_packet_in(ix, tuple_key, reviewer_id)
    if packet is None:
        raise EFCAGateError(
            "UNISSUED_PACKET",
            "no packet is currently issued to %r for this tuple; the "
            "tuple's custodian issues the Phase-1 / reproduction packet "
            "(§G.4 step 1; F-41 packet-first)" % (reviewer_id,))
    return packet


def _submission_identity(reviewer_id, tuple_key, own_ordinal):
    """CORR8/F-44: actor-local deterministic Lane B submission identity.
    sha256(reviewer | tupleKey | own_ordinal)[:16] — one-way, stable under
    replay, unique per (tuple, reviewer, ordinal), and independent of any
    other actor's filings. No global timestamp, sequence, tick or hidden
    counter enters."""
    return "SYN_SUB_" + sha256_hex(
        "%s|%s|%d" % (reviewer_id, tuple_key, own_ordinal))[:16]


def _custodian_relationship_in(ix, tuple_key, actor_id):
    """CORR7/F-41 existence-blind custody predicate: an unregistered key
    can never have a custodian, so this is False both before a foreign
    registration and for a foreign tuple — the two states are
    indistinguishable through this predicate."""
    return ix["tuples"].get(tuple_key, {}).get("custodian") == actor_id


def _require_custodian_uniform_in(ix, tuple_key, actor_id):
    """CORR7/F-41 uniform custody gate for live operations: an
    unregistered key and a tuple held by another custodian produce the
    identical ROLE_MISMATCH refusal."""
    _require_synthetic_actor_in(ix, actor_id, "CUSTODIAN")
    if not _custodian_relationship_in(ix, tuple_key, actor_id):
        raise EFCAGateError(
            "ROLE_MISMATCH",
            "actor %r is not the custodian of this tuple" % (actor_id,))
    return ix["tuples"][tuple_key]


def _p1_sealers_in(ix, tuple_key):
    return [r for (tk, r) in ix["seals"]
            if tk == tuple_key and ix["actors"].get(r) == "R_P1"]


def _effective_incidents_in(ix, tuple_key, actor_id):
    """DERIVED contamination (F-11/F-12/F-4). Effective incidents are the
    union of:
      - explicitly reported incidents (manual discovery records) with F-4
        occurrence semantics (unestablished occurrence fails closed);
      - Lane B deliveries of this tuple to an R_P1/R_IND actor that are not
        after that actor's own seal — derived from the disclosure event
        itself, so its mandatory consequence cannot be omitted (F-11);
      - the first-rationale access by an R_IND before their own seal (F-12).
    An unsealed actor's disclosures all count (a previously exposed reviewer
    can never obtain a blind seal). Deterministic order for live/replay
    snapshot equality."""
    seal = ix["seals"].get((tuple_key, actor_id))
    seal_tick = seal["sealedAt"] if seal else None

    def counts(occurred):
        return seal_tick is None or occurred is None or occurred < seal_tick

    out, seen = [], set()
    for inc in ix["incidents"].get(tuple_key, {}).get(actor_id, []):
        if counts(inc.get("occurredAtTick")):
            out.append({"what": inc["what"],
                        "occurredAtTick": inc.get("occurredAtTick"),
                        "reportedTick": inc["reportedTick"],
                        "reportedBy": inc["reportedBy"],
                        "detail": inc.get("detail", ""), "derived": False})
            seen.add((inc["what"], inc.get("occurredAtTick")))
    if ix["actors"].get(actor_id) in ("R_P1", "R_IND"):
        for (tk, sid, to, tick) in ix["lane_b_deliveries"]:
            if tk != tuple_key or to != actor_id:
                continue
            if counts(tick) and ("LANE_B_MATERIAL", tick) not in seen:
                out.append({
                    "what": "LANE_B_MATERIAL", "occurredAtTick": tick,
                    "reportedTick": tick, "reportedBy": "ENGINE_DERIVED",
                    "detail": "derived: Lane B material delivered before the "
                              "reviewer's seal (F-2/F-11); the mandatory "
                              "consequence cannot be omitted",
                    "derived": True})
                seen.add(("LANE_B_MATERIAL", tick))
    access = ix["rationale_access"].get((tuple_key, actor_id))
    if (access is not None and counts(access)
            and ("PRIOR_RATIONALE", access) not in seen):
        out.append({
            "what": "PRIOR_RATIONALE", "occurredAtTick": access,
            "reportedTick": access, "reportedBy": "ENGINE_DERIVED",
            "detail": "derived: the original rationale was accessible before "
                      "the reproducer's own seal (S26/F-12)",
            "derived": True})
    decl = ix["rederivations"].get((tuple_key, actor_id))
    if (decl is not None and ix["actors"].get(actor_id) in ("R_P1", "R_IND")
            and counts(decl["tick"])
            and ("RETROSPECTIVE_RECORD", decl["tick"]) not in seen):
        out.append({
            "what": "RETROSPECTIVE_RECORD", "occurredAtTick": decl["tick"],
            "reportedTick": decl["tick"], "reportedBy": "ENGINE_DERIVED",
            "detail": "derived: tuple-specific retrospective record content "
                      "was disclosed to this actor before their own seal "
                      "(§G.2 forbidden inputs; §G.4; F-18). Historical-record "
                      "reproduction itself stays lawful post-seal (§G.7)",
            "derived": True})
    return out


def _contamination_snapshot_in(ix, tuple_key, actor_id):
    incidents = _effective_incidents_in(ix, tuple_key, actor_id)
    return {"status": "CONTAMINATED" if incidents else "CLEAN",
            "incidents": [dict(i) for i in incidents]}


def _seal_effectively_clean_in(ix, tuple_key, reviewer):
    return ((tuple_key, reviewer) in ix["seals"]
            and not _effective_incidents_in(ix, tuple_key, reviewer))


def _exposure_actors_in(ix, tuple_key):
    """F-26: the SINGLE aggregation of actors with potential exposure on a
    tuple — every derived and reported class accounted for here — used by
    tuple-level contamination, custody observability, recovery gating and
    status alike."""
    actors = set(ix["incidents"].get(tuple_key, {}).keys())
    actors |= {to for (tk, sid, to, t) in ix["lane_b_deliveries"]
               if tk == tuple_key}
    actors |= {r for ((tk, r), t) in ix["rationale_access"].items()
               if tk == tuple_key}
    actors |= {r for (tk, r) in ix["rederivations"] if tk == tuple_key}
    return actors


def _tuple_contamination_exists_in(ix, tuple_key):
    for a in sorted(_exposure_actors_in(ix, tuple_key)):
        if _effective_incidents_in(ix, tuple_key, a):
            return True
    return False


def _packet_content_of(tup):
    return {
        "caseId": tup["tupleId"]["caseId"],
        "sideId": tup["tupleId"]["sideId"],
        "factId": tup["tupleId"]["factId"],
        "sealedFactText": tup["sealedFactText"],
        "questionText": tup["questionText"],
    }


def _original_normative_claim_in(ix, tuple_key):
    """The identifiable original claim source for normative reproduction
    (F-3/F-5): the effectively clean R_P1 seal(s) on the tuple. Fails closed
    on absence or ambiguity with differing propositions."""
    candidates = []
    for r in _p1_sealers_in(ix, tuple_key):
        if _seal_effectively_clean_in(ix, tuple_key, r):
            candidates.append((r, ix["seals"][(tuple_key, r)]))
    if not candidates:
        raise EFCAGateError(
            "REFUSED_NO_ORIGINAL_CLAIM",
            "independent normative adjudication requires an identifiable, "
            "effectively clean ORIGINAL R_P1 review on this tuple; a "
            "reproducer's own answer cannot serve as both the original and "
            "the reproduction (F-5)",
        )
    states = [c[1]["sealedPayload"]["normativeStates"] for c in candidates]
    first = states[0]
    if any(s != first for s in states[1:]):
        raise EFCAGateError(
            "REFUSED_AMBIGUOUS_ORIGINAL",
            "multiple effectively clean original R_P1 reviews disagree on "
            "the normative proposition; the original claim is not "
            "identifiable, so the claim stays NOT_ADJUDICATED",
        )
    return candidates[0][0], candidates[0][1]


def _enforce_claim_identity(ix, tuple_key, claim_id, claim_type, kind):
    """F-34/F-36. Within one tuple a claimId binds one identity. A
    normative proposition (§D.4 / §G.7) is the named claim type, not a
    free identifier, so a second claimId on the same named normative
    proposition is refused. Provenance records share the claimId map and
    therefore cannot contradict an adjudication, but a distinct historical
    claimId remains lawful: uniqueness here is identity, not a scientific
    one-event-per-historical-type rule."""
    prior = ix["claim_ids"].get((tuple_key, claim_id))
    if prior is not None:
        if prior == claim_type:
            raise EFCAGateError(
                "DUPLICATE_CLAIM_ID",
                "claimId %s is already bound on this tuple; a repeated "
                "event must not inflate adjudication or provenance counts "
                "(F-34)" % claim_id,
            )
        raise EFCAGateError(
            "CONFLICTING_CLAIM_IDENTITY",
            "claimId %s is already bound to %s on this tuple and cannot "
            "also name %s (F-34)" % (claim_id, prior, claim_type),
        )
    if kind == "NORMATIVE":
        existing = ix["named_normative"].get((tuple_key, claim_type))
        if existing is not None:
            raise EFCAGateError(
                "DUPLICATE_NAMED_CLAIM",
                "the named proposition %s is already adjudicated on this "
                "tuple as %s; equality of the reproduced normative states "
                "does not adjudicate a second claimId (F-36)"
                % (claim_type, existing),
            )


def _normative_adjudication_gates_in(ix, tuple_key, r_ind_id, claim_id,
                                     claim_type):
    """Shared gate body for live adjudication AND replay validation of
    CLAIM_ADJUDICATED (normative). Returns the prerequisites payload or
    raises. Single model: the replay validator calls this exact function and
    requires payload equality. F-36: only NORMATIVE_DETERMINACY, whose
    proposition is the reproduced normative states at tuple scope, is
    adjudicated from a Phase-1 reproduction."""
    _require_syn_id("claimId", claim_id)
    if claim_type != "NORMATIVE_DETERMINACY":
        raise EFCAGateError(
            "REFUSED_UNBOUND_PROPOSITION",
            "§D.4 and §G.7 bind ADJUDICATED to one named proposition. "
            "%s is not adjudicated from equality of generic normative "
            "states; no sufficiency algorithm for conclusion or "
            "reconciliation is authorized (F-36)" % claim_type,
        )
    original_reviewer, original_seal = _original_normative_claim_in(ix, tuple_key)
    own_seal = ix["seals"].get((tuple_key, r_ind_id))
    if own_seal is None:
        raise EFCAGateError(
            "REFUSED_NOT_BLIND",
            "the reproducer has no own sealed Phase 1 for this tuple",
        )
    access_tick = ix["rationale_access"].get((tuple_key, r_ind_id))
    own_seal_tick = own_seal["sealedAt"]
    if not (access_tick is None or own_seal_tick < access_tick):
        raise EFCAGateError(
            "REFUSED_NOT_BLIND",
            "ownPhase1SealedBeforeRationale is FALSE by observed ordering "
            "(the first rationale access does not follow the reproducer's "
            "own seal); the normative claim stays NOT_ADJUDICATED (S26). "
            "Ordering is verified internally; no session clock values are "
            "disclosed (OD-37/F-37)",
        )
    if not _seal_effectively_clean_in(ix, tuple_key, r_ind_id):
        raise EFCAGateError(
            "REFUSED_NOT_BLIND",
            "the reproducer's Phase 1 is effectively CONTAMINATED and cannot "
            "adjudicate the normative claim",
        )
    own_states = own_seal["sealedPayload"]["normativeStates"]
    original_states = original_seal["sealedPayload"]["normativeStates"]
    if own_states != original_states:
        raise EFCAGateError(
            "REFUSED_REPRODUCTION_CONTRADICTION",
            "the reproducer's normative determination %r contradicts the "
            "original claim %r; reviewer disagreement on a normative bound "
            "is a failure to reproduce, so the named claim stays "
            "NOT_ADJUDICATED (§G.7, F-3)"
            % (own_states, original_states),
        )
    reproduced = json.loads(json.dumps(original_states))
    return {
        "claimKind": "NORMATIVE",
        "ownPhase1SealedBeforeRationale": True,
        "reproducedOriginalClaim": True,
        "originalClaimSource": {
            "reviewer": original_reviewer,
            "sealedBytesSha": original_seal["sealedBytesSha"],
            "normativeStates": reproduced,
        },
        "boundProposition": {
            "claimType": "NORMATIVE_DETERMINACY",
            "scope": "tuple",
            "normativeStates": json.loads(json.dumps(reproduced)),
        },
    }


def _historical_adjudication_gates_in(ix, tuple_key, r_ind_id, record_refs,
                                      claim_type, proposition=None,
                                      version="CORR9"):
    """Shared gate body for live verification AND replay validation of
    CLAIM_PROVENANCE_VERIFIED. F-16: a declaration alone is not
    reproduction; the named claim must carry its own proof-carrying
    reconstruction (identity + SHA + locator) against the authenticated
    records, and that evidence must belong to the declared re-derivation
    set. The engine verifies evidence authenticity and procedural binding
    only — never the scientific sufficiency of the evidence. F-35: the
    result is mechanical provenance, not CLAIM_ADJUDICATED.
    F-38/OD-38: the bound proposition is the COMPLETE declared scope bundle
    per accepted rubric §D.4 (claim type, filing tuple, type-specific
    scope); evidence identity and attestation identity are separate. A
    missing mandatory scope fails closed. Legacy replay keeps the frozen
    CORR5 proposition shape and never upgrades it."""
    decl = ix["rederivations"].get((tuple_key, r_ind_id))
    if decl is None:
        raise EFCAGateError(
            "REFUSED_RECORDS_NOT_REDERIVED",
            "historical-record claims require the separately declared "
            "recordsRederived prerequisite; it is not inferred from "
            "agreement or summaries",
        )
    if record_refs is None:
        raise EFCAGateError(
            "REFUSED_UNVERIFIED_EVIDENCE",
            "historical-record claims require the per-claim proof-carrying "
            "reconstruction {recordId, locator, content}; a declaration "
            "referencing record identifiers alone is not reproduction of "
            "the named claim (F-16)",
        )
    normalized = _validate_record_refs_in(
        ix, tuple_key, record_refs, "per-claim reconstruction evidence")
    declared_ids = {r["recordId"] for r in decl["recordRefs"]}
    for ref in normalized:
        if ref["recordId"] not in declared_ids:
            raise EFCAGateError(
                "REFUSED_EVIDENCE_NOT_DECLARED",
                "claim evidence %s is not part of the declared "
                "re-derivation set" % ref["recordId"],
            )
    if version == "LEGACY":
        # Frozen CORR5 proposition: claim type + authenticated-records +
        # record ids. Mechanical provenance only; never indexed as a
        # complete bound proposition and never promoted (guardrail).
        bound = {
            "claimType": claim_type,
            "scope": "authenticated-records",
            "recordIds": [ref["recordId"] for ref in normalized],
        }
    else:
        scope = _validate_historical_proposition_scope(claim_type,
                                                      proposition)
        bound = {
            "claimType": claim_type,
            "tupleKey": tuple_key,
            "scope": scope,
        }
    return {"claimKind": "HISTORICAL_RECORD", "recordsRederived": True,
            "evidence": normalized,
            "mechanicalVerificationOnly": True,
            "scientificAdjudication": "UNRESOLVED_GATE",
            "claimLevelStatus": "PROVENANCE_VERIFIED_NOT_ADJUDICATED",
            "boundProposition": bound}


def _evidence_record_payload_in(ix, tuple_key, custodian_id, rubric_digest,
                                version="CORR9", authority_mode=None):
    """Engine-constructed EVIDENCE_RECORD_ISSUED payload (F-6/F-8/F-13). The
    live operation and the replay validator both use this exact constructor;
    any caller-supplied deviation is procedurally invalid. F-38: the native
    completeness snapshot additionally counts DISTINCT bound propositions
    independently of provenance attestations; the frozen legacy snapshot is
    reproduced byte-exactly for legacy replay. CORR9/OD-45-A: the snapshot
    additionally carries the engine-derived allocationAuthorityMode, so a
    simulation-generated evidence record is affirmatively labelled
    SIMULATION and claims no Owner authorization; the allocation inventory
    and global authority identifiers never enter the record."""
    any_seal = [r for (tk, r) in ix["seals"] if tk == tuple_key]
    clean_seals = [r for r in any_seal
                   if _seal_effectively_clean_in(ix, tuple_key, r)]
    revealed = [r for (tk, r) in ix["reveals"] if tk == tuple_key]
    deltas = [d for d in ix["deltas"] if d[0] == tuple_key]
    adjudications = [a for a in ix["adjudications"] if a["tupleKey"] == tuple_key]
    provenance = [a for a in ix["provenance"] if a["tupleKey"] == tuple_key]
    provisional = any(
        (tuple_key, r) in ix["receipts"] and any(
            d[0] == tuple_key and d[1] == r for d in ix["deltas"])
        for r in clean_seals)
    completeness = {
        "phase1Sealed": bool(any_seal),
        "effectivelyCleanPhase1Seals": sorted(clean_seals),
        "custodyReceipt": bool(any(
            (tk, r) in ix["receipts"]
            for (tk, r) in ix["receipts"] if tk == tuple_key)),
        "revealed": sorted(revealed),
        "deltaCount": len(deltas),
        "tupleLevelAtIssuance": "PROVISIONAL" if provisional else "IN_PROGRESS",
        "claimsAdjudicatedAtIssuance": len(adjudications),
        "provenanceVerifiedNotAdjudicatedAtIssuance": len(provenance),
        "statement": COMPLETENESS_STATEMENT,
    }
    if version != "LEGACY":
        completeness["distinctBoundPropositionsAtIssuance"] = len(
            [k for k, v in ix["propositions"].items()
             if v["tupleKey"] == tuple_key])
        # CORR9/OD-45-A: the effective allocation-authority mode is an
        # engine-derived attribute of this record; simulation evidence is
        # permanently identifiable as simulation evidence.
        completeness["allocationAuthorityMode"] = authority_mode
    return {
        "tupleKey": tuple_key,
        "custodian": custodian_id,
        "rubricIdentity": {
            "actId": RUBRIC_ACT_ID,
            "fileName": RUBRIC_FILE_NAME,
            "sha256": rubric_digest,
            "status": "VERIFIED_AT_RECORD_ISSUANCE",
        },
        "parentRubricIdentity": {
            "actId": PARENT_RUBRIC_ACT_ID,
            "sha256": PARENT_RUBRIC_SHA256,
        },
        "contractIdentity": dict(CONTRACT_IDENTITY),
        "categoryAssignment": CATEGORY_ASSIGNMENT,
        "tupleLevelName": TUPLE_LEVEL_NAME,
        "exclusivity": EXCLUSIVITY,
        "proceduralCompleteness": completeness,
        "synthetic": True,
    }


# --------------------------------------------------------------------------
# The single transition validator (live + replay, F-7/F-8/F-13/F-15)
# --------------------------------------------------------------------------

def _check_transition(ev, ix, ctx, version="CORR9"):
    """Semantic validation of one event against the index state it is being
    applied to. Used by BOTH live public operations and replay. A
    cryptographically valid chain whose events fail here is procedurally
    invalid and must be rejected.

    Compatibility guardrail: `version` is selected by the chain's GENESIS
    act id (never per event) and is immutable for the whole chain — "CORR9"
    for native chains, "LEGACY" for the frozen CORR5 rule-set admitted
    read-only through replay_legacy_history. There is no mixed rule-set and
    no relaxed variant of the native exact schemas."""
    et = ev["eventType"]
    p = ev["payload"]
    t = ev["t"]
    schemas = (EVENT_PAYLOAD_SCHEMAS if version != "LEGACY"
               else LEGACY_EVENT_PAYLOAD_SCHEMAS)

    # F-15: exact, event-specific closed payload schema (missing/extra keys
    # are refused identically on live and replayed paths).
    if not isinstance(p, dict) or set(p.keys()) != schemas[et]:
        raise EFCAGateError(
            "INVALID_TRANSITION",
            "%s payload schema violation: expected exactly %s (missing or "
            "extra keys are refused; F-15, %s rule-set)"
            % (et, sorted(schemas[et]), version),
        )

    if et == "GENESIS":
        if ev["seq"] != 0:
            raise EFCAGateError("INVALID_TRANSITION", "GENESIS at non-zero seq")
        expected_act = ENGINE_ACT_ID if version != "LEGACY" else LEGACY_ENGINE_ACT_ID
        if p.get("engineActId") != expected_act:
            raise EFCAGateError(
                "INVALID_TRANSITION",
                "GENESIS must name the %s engine act (%s)"
                % (version, expected_act))
        if p.get("syntheticOnly") is not True:
            raise EFCAGateError("INVALID_TRANSITION",
                                "GENESIS must declare syntheticOnly=true")
        if version == "LEGACY":
            # Frozen CORR5 genesis shape: no allocation-authority context
            # existed in the legacy rule-set; byte-exact legacy replay is
            # preserved unchanged.
            return
        # CORR9/OD-45-A: the GENESIS carries the immutable (mode, digest)
        # pair and replay compares BOTH against the effective trusted
        # construction context of the receiving session. The same
        # allocation bytes and digest never make the modes interchangeable:
        # a byte-identical-manifest SIMULATION chain is refused by an
        # OWNER_PINNED session (digest equal, mode differs) and a pinned
        # chain is refused by a simulation session (no downgrade or
        # relabel), in both directions.
        mode = p.get("allocationAuthorityMode")
        digest = p.get("allocationsSha256")
        if mode not in ALLOCATION_AUTHORITY_MODES:
            raise EFCAGateError(
                "INVALID_TRANSITION",
                "GENESIS allocationAuthorityMode must be exactly one of %s "
                "(engine-derived; never a caller-supplied claim)"
                % (ALLOCATION_AUTHORITY_MODES,))
        if not _is_hex64(digest):
            raise EFCAGateError(
                "INVALID_TRANSITION",
                "GENESIS allocationsSha256 must be a hex64 allocation-"
                "authority digest (OD-45-A)")
        auth = ctx["allocationAuthority"]
        if mode != auth.mode or digest != auth.digest:
            raise EFCAGateError(
                "AUTHORITY_CONTEXT_MISMATCH",
                "the chain's declared allocation-authority context does "
                "not match the effective trusted construction context of "
                "this session; owner-pinned and simulation authority "
                "chains are never interchangeable, including when the "
                "allocation bytes and digest are identical (OD-45-A/F-45)")
        return
    if t <= ix["last_t"]:
        raise EFCAGateError("INVALID_TRANSITION",
                            "event tick %s does not advance the logical clock" % t)

    if et == "ACTOR_REGISTERED":
        role = p.get("role")
        actor_id = p.get("actorId")
        if role not in ROLES:
            raise EFCAGateError("INVALID_PAYLOAD",
                                "role must be one of %s" % (ROLES,))
        if (not isinstance(actor_id, str)
                or not SYN_ACTOR_PATTERNS[role].fullmatch(actor_id)):
            raise EFCAGateError(
                "NON_SYNTHETIC_IDENTIFIER",
                "actorId %r does not match the synthetic pattern for role %s"
                % (actor_id, role),
            )
        if actor_id in ix["actors"]:
            raise EFCAGateError("DUPLICATE_ACTOR", "actor already registered")

    elif et == "TUPLE_REGISTERED":
        _require_synthetic_actor_in(ix, p.get("custodian"), "CUSTODIAN")
        for kind in ("caseId", "sideId", "factId", "d"):
            _require_syn_id(kind, p.get(kind))
        _require_synthetic_text("sealedFactText", p.get("sealedFactText"))
        _require_synthetic_text("questionText", p.get("questionText"))
        if p.get("synthetic") is not True:
            raise EFCAGateError(
                "INVALID_TRANSITION",
                "TUPLE_REGISTERED must carry synthetic=true (F-15)")
        marks = p.get("custodyMarks")
        if (not isinstance(marks, dict)
                or set(marks.keys()) != {"A", "B"}
                or marks.get("A") not in MARK_VALUES
                or marks.get("B") not in MARK_VALUES):
            raise EFCAGateError("INVALID_PAYLOAD",
                                "custodyMarks must be {A: YES|NO, B: YES|NO}")
        _validate_custody_records(p.get("retrospectiveRecords"))
        key = tuple_key_of(p["caseId"], p["sideId"], p["factId"])
        expected_hash = sha256_hex("%s|%s|%s" % (p["caseId"], p["sideId"],
                                                 p["factId"]))
        if p.get("canonicalHashInput") != expected_hash:
            raise EFCAGateError(
                "INVALID_TRANSITION",
                "canonicalHashInput is engine-computed and must equal "
                "sha256(caseId|sideId|factId); caller-supplied values are "
                "not accepted",
            )
        if version != "LEGACY":
            # CORR9/OD-45-A (F-45): the entitlement is evaluated BEFORE any
            # occupancy lookup, and the event's engine-derived
            # allocationDigest is recomputed from the verified effective
            # authority on BOTH the live and the replay path — a
            # registration never becomes lawful merely because an attacker
            # recomputed the event-chain hashes. The frozen CORR5 shape
            # (no entitlement, no digest) is untouched.
            auth = ctx["allocationAuthority"]
            entitled = auth.custodian_for(key)
            if entitled is None or entitled != p.get("custodian"):
                raise EFCAGateError("NOT_ENTITLED", NOT_ENTITLED_MESSAGE)
            expected_digest = _allocation_entry_digest(key, entitled)
            if p.get("allocationDigest") != expected_digest:
                raise EFCAGateError(
                    "INVALID_TRANSITION",
                    "allocationDigest is engine-derived from the exact "
                    "authorized allocation entry of this tuple and is "
                    "recomputed against the verified effective allocation "
                    "authority; the declared value is not this tuple's "
                    "authorized entry digest (OD-45-A/F-45)",
                )
        if key in ix["tuples"]:
            raise EFCAGateError("DUPLICATE_TUPLE", "tuple already registered")

    elif et == "PACKET_ISSUED":
        _require_custodian_of_in(ix, p.get("tupleKey"), p.get("custodian"))
        reviewer = p.get("reviewer")
        _require_synthetic_actor_in(ix, reviewer)
        role = ix["actors"][reviewer]
        if role not in ("R_P1", "R_IND"):
            raise EFCAGateError(
                "ROLE_MISMATCH",
                "a Phase-1 packet may be issued to R_P1 or R_IND only; %r "
                "is %s" % (reviewer, role),
            )
        if reviewer == p.get("custodian"):
            raise EFCAGateError(
                "CUSTODIAN_CANNOT_REVIEW",
                "the custodian of a tuple may not review that tuple",
            )
        if (p["tupleKey"], reviewer) in ix["seals"]:
            raise EFCAGateError(
                "REVIEWER_ALREADY_SEALED",
                "reviewer already sealed a Phase 1 for this tuple; seals are "
                "immutable and not re-issuable",
            )
        if _effective_incidents_in(ix, p["tupleKey"], reviewer):
            raise EFCAGateError(
                "REVIEWER_ALREADY_EXPOSED",
                "reviewer's effective contamination on this tuple includes "
                "pre-seal disclosures (derived from the disclosure events "
                "themselves); the reviewer can never obtain a valid blind "
                "seal for it (F-2/F-11/F-12)",
            )
        tup = ix["tuples"][p["tupleKey"]]
        expected_packet_sha = sha256_hex(canonical_bytes(_packet_content_of(tup)))
        if p.get("packetSha") != expected_packet_sha:
            raise EFCAGateError(
                "INVALID_TRANSITION",
                "packetSha is engine-computed from custody state; "
                "caller-supplied hashes are not accepted",
            )
        expected_phase = "IND_REPRODUCTION" if role == "R_IND" else "PHASE_1"
        if p.get("phase") != expected_phase:
            raise EFCAGateError("INVALID_TRANSITION",
                                "packet phase must match the reviewer role")
        if p.get("issuedAt") != t:
            raise EFCAGateError("INVALID_TRANSITION",
                                "issuedAt must equal the event tick")

    elif et == "PHASE1_SEALED":
        reviewer = p.get("reviewer")
        _require_synthetic_actor_in(ix, reviewer)
        if ix["actors"][reviewer] not in ("R_P1", "R_IND"):
            raise EFCAGateError(
                "ROLE_MISMATCH",
                "only R_P1 or R_IND reviewers may seal a Phase-1 review",
            )
        _require_tuple_in(ix, p.get("tupleKey"))
        packet = _active_packet_in(ix, p["tupleKey"], reviewer)
        if packet is None:
            raise EFCAGateError("UNISSUED_PACKET",
                                "cannot review a tuple before packet issuance")
        if (p["tupleKey"], reviewer) in ix["seals"]:
            raise EFCAGateError(
                "SEALED_IMMUTABLE",
                "a sealed Phase 1 already exists for this reviewer and "
                "tuple; sealed bytes can neither be edited nor replaced",
            )
        _validate_review_payload(p.get("sealedPayload"))
        sealed_payload = p["sealedPayload"]
        if sealed_payload.get("packetSha") != packet["packetSha"]:
            raise EFCAGateError(
                "SEAL_PACKET_MISMATCH",
                "the sealed payload references a packet identity other than "
                "the packet issued to this reviewer",
            )
        if sealed_payload.get("reviewer") != reviewer:
            raise EFCAGateError("INVALID_TRANSITION",
                                "sealedPayload.reviewer must equal the sealer")
        expected_seal_sha = sha256_hex(canonical_bytes(sealed_payload))
        if p.get("sealedBytesSha") != expected_seal_sha:
            raise EFCAGateError(
                "INVALID_TRANSITION",
                "sealedBytesSha is engine-computed over the sealed payload; "
                "caller-supplied digests are not accepted",
            )
        expected_snapshot = _contamination_snapshot_in(ix, p["tupleKey"], reviewer)
        if p.get("contamination") != expected_snapshot:
            raise EFCAGateError(
                "INVALID_TRANSITION",
                "contamination snapshot is engine-computed from the "
                "effective incident registry at seal time",
            )
        if p.get("packetSha") != packet["packetSha"]:
            raise EFCAGateError("SEAL_PACKET_MISMATCH",
                                "seal packet identity mismatch")
        if p.get("sealedAt") != t:
            raise EFCAGateError("INVALID_TRANSITION",
                                "sealedAt must equal the event tick")

    elif et == "SEAL_RECEIPT_ACKNOWLEDGED":
        _require_custodian_of_in(ix, p.get("tupleKey"), p.get("custodian"))
        _require_synthetic_actor_in(ix, p.get("reviewer"))
        if (p["tupleKey"], p["reviewer"]) not in ix["seals"]:
            raise EFCAGateError(
                "NO_VALID_SEAL",
                "custody cannot be acknowledged before a valid seal exists",
            )
        if (p["tupleKey"], p["reviewer"]) in ix["receipts"]:
            raise EFCAGateError("DUPLICATE_EVENT",
                                "custody receipt already recorded (append-only)")

    elif et == "REVEALED":
        _require_custodian_of_in(ix, p.get("tupleKey"), p.get("custodian"))
        reviewer = p.get("reviewer")
        _require_synthetic_actor_in(ix, reviewer)
        seal = ix["seals"].get((p["tupleKey"], reviewer))
        if seal is None:
            raise EFCAGateError("REVEAL_BEFORE_SEAL",
                                "reveal is refused before a valid Phase-1 seal")
        packet = _active_packet_in(ix, p["tupleKey"], reviewer)
        if packet is None or seal["packetSha"] != packet["packetSha"]:
            raise EFCAGateError(
                "SEAL_PACKET_MISMATCH",
                "the sealed packet identity does not match the packet "
                "currently issued to this reviewer",
            )
        if (p["tupleKey"], reviewer) not in ix["receipts"]:
            raise EFCAGateError(
                "REVEAL_BEFORE_CUSTODY_RECEIPT",
                "reveal is refused before the custodian has acknowledged "
                "the seal",
            )
        if _effective_incidents_in(ix, p["tupleKey"], reviewer):
            raise EFCAGateError(
                "REVEAL_FORBIDDEN_CONTAMINATED",
                "an effectively contaminated Phase 1 can never serve as "
                "blind proof (including pre-seal disclosures discovered "
                "after sealing, F-4/F-11/F-12)",
            )
        if (p["tupleKey"], reviewer) in ix["reveals"]:
            raise EFCAGateError("REVEAL_ALREADY_PERFORMED",
                                "reveal happened; later phases append only")

    elif et == "DELTA_APPENDED":
        _require_synthetic_actor_in(ix, p.get("reviewer"))
        _require_tuple_in(ix, p.get("tupleKey"))
        if (p["tupleKey"], p["reviewer"]) not in ix["reveals"]:
            raise EFCAGateError(
                "DELTA_BEFORE_REVEAL",
                "a Phase-2 delta may be appended only after the lawful reveal",
            )
        if not isinstance(p.get("delta"), str) or not p["delta"]:
            raise EFCAGateError(
                "INVALID_PAYLOAD",
                "delta must be a non-empty string ('NO_CHANGE' records the "
                "no-change case)",
            )
        if p["delta"] != "NO_CHANGE":
            _require_synthetic_text("delta", p["delta"])

    elif et == "LANE_B_REGISTERED":
        # CORR7/F-41: the standard-form Lane B filing binds to the
        # well-formed tuple key without requiring prior registration (an
        # existence-blind self-scoped content record); legacy semantics are
        # unchanged below.
        _require_synthetic_actor_in(ix, p.get("reviewer"), "R_LB")
        _require_tuple_key_form(p.get("tupleKey"))
        spec = {"question": p.get("question"), "surface": p.get("surface"),
                "schemaClaim": p.get("schemaClaim")}
        _check_closed(spec, LANE_B_SPEC_KEYS, "lane_b_registration")
        _require_synthetic_text("question", p.get("question"))
        _require_synthetic_text("surface", p.get("surface"))
        _require_synthetic_text("schemaClaim", p.get("schemaClaim"))
        if version == "LEGACY":
            # Frozen CORR5 semantics: at most one Lane B record per tuple.
            if p["tupleKey"] in ix["lane_b_legacy"]:
                raise EFCAGateError(
                    "DUPLICATE_EVENT",
                    "a Lane B record already exists for this tuple "
                    "(frozen CORR5 semantics)")
            return
        # F-39/OD-39: several independent submissions are lawful. CORR8/
        # F-44: the submission identity is engine-constructed from the
        # FILER'S OWN identity and OWN prior-filing count only (actor-local
        # deterministic, §CORR8-34); a repeated, cross-actor or forged id
        # is not engine-constructible and fails closed.
        sid = p.get("submissionId")
        _require_syn_id("submissionId", sid)
        expected = _submission_identity(
            p["reviewer"], p["tupleKey"],
            ix["lane_b_actor_counts"].get((p["tupleKey"], p["reviewer"]), 0)
            + 1)
        if sid != expected:
            raise EFCAGateError(
                "INVALID_TRANSITION",
                "submissionId is engine-constructed from the filer's own "
                "actor identity and own prior-filing count (%s); the "
                "declared %r is not this reviewer's next lawful submission "
                "(F-39/F-44)"
                % (expected, sid))
        if (p["tupleKey"], sid) in ix["lane_b"]:
            raise EFCAGateError("DUPLICATE_EVENT",
                                "this submission already exists")

    elif et == "LANE_B_DELIVERED":
        _require_custodian_of_in(ix, p.get("tupleKey"), p.get("custodian"))
        _require_synthetic_actor_in(ix, p.get("deliveredTo"))
        if version == "LEGACY":
            if p["tupleKey"] not in ix["lane_b_legacy"]:
                raise EFCAGateError("INVALID_PAYLOAD",
                                    "no Lane B record exists for this tuple")
            return
        # F-39: the delivery references exactly one existing submission.
        sid = p.get("submissionId")
        _require_syn_id("submissionId", sid)
        if (p["tupleKey"], sid) not in ix["lane_b"]:
            raise EFCAGateError(
                "INVALID_PAYLOAD",
                "the delivery must reference one exact existing Lane B "
                "submission of this tuple; %r is not one (F-39/OD-39)" % (sid,))

    elif et == "EXPOSURE_REPORTED":
        # CORR7/F-41: the reporter authorization is decided BEFORE any
        # existence-dependent lookup; the exposure self-disclosure by the
        # exposed actor themself is a self-scoped content record that binds
        # to the well-formed key without requiring prior registration
        # (uniform outcome in both states). A custodian-attributed report
        # requires the custody relationship, so its refusal is identical
        # for unregistered and foreign keys.
        _require_synthetic_actor_in(ix, p.get("reportedBy"))
        _require_tuple_key_form(p.get("tupleKey"))
        _require_synthetic_actor_in(ix, p.get("exposedTo"))
        reporting_tuple = ix["tuples"].get(p.get("tupleKey"))
        if not ((reporting_tuple is not None
                 and reporting_tuple["custodian"] == p.get("reportedBy"))
                or p.get("exposedTo") == p.get("reportedBy")):
            raise EFCAGateError(
                "UNAUTHORIZED_EXPOSURE_REPORTER",
                "exposure attestation for a tuple is role-bounded to that "
                "tuple's custodian or the exposed actor themself (rubric "
                "§G.1 recording duties; §G.4/§G.5 custodial acts; §G.6 step "
                "1; reviewer self-disclosure per §G.4); foreign custodians "
                "and unrelated actors cannot alter another tuple's "
                "evidentiary status (F-24)")
        if p.get("what") not in EXPOSURE_KINDS:
            raise EFCAGateError(
                "INVALID_PAYLOAD",
                "exposure kind must be one of the recognized "
                "Phase-1-forbidden classes %s" % sorted(EXPOSURE_KINDS),
            )
        if not isinstance(p.get("detail"), str):
            raise EFCAGateError("INVALID_PAYLOAD", "detail must be a string")
        if p["detail"]:
            _require_synthetic_text("exposure detail", p["detail"])
        occurred = p.get("occurredAtTick")
        ref = p.get("occurredScopeRef")
        if version == "LEGACY":
            # Frozen CORR5 semantics: the occurrence is a past session tick
            # (1 <= occurred_at_tick < now). Retained byte-exactly for
            # legacy replay; the CORR6 path replaces this representation.
            if occurred is not None:
                if not _is_plain_int(occurred):
                    raise EFCAGateError(
                        "INVALID_TICK_TYPE",
                        "occurred_at_tick must be a plain integer logical "
                        "tick; booleans, floats and strings are not valid "
                        "ticks (F-25)",
                    )
                if occurred < 1 or occurred >= t:
                    raise EFCAGateError(
                        "INVALID_PAYLOAD",
                        "occurred_at_tick must be a past logical tick "
                        "(1 <= occurred_at_tick < now); future occurrences "
                        "are impossible and present-tick occurrences use the "
                        "event tick itself",
                    )
            return
        # OD-37/F-37: the occurrence is a scope-local reference into the
        # reporter's own recorded event sequence. The session clock is never
        # exposed through acceptance or refusal, so the operation cannot be
        # used to probe the session-global count or tick.
        if ref is None:
            if occurred is not None:
                raise EFCAGateError(
                    "INVALID_TRANSITION",
                    "occurredAtTick must be null when no occurrence "
                    "reference is declared (engine-constructed consistency)")
            return
        _check_closed(ref, OCCURRENCE_REF_KEYS, "occurredScopeRef")
        if ref.get("scope") != "self":
            raise EFCAGateError(
                "INVALID_TICK_TYPE",
                "an occurrence reference may name only your own recorded "
                "scope ('self'); foreign or session scopes are not lawful "
                "(OD-37/F-37)")
        resolved = _resolve_occurrence_ref_in(ix, p.get("reportedBy"),
                                              ref.get("scopeOrdinal"))
        if occurred != resolved:
            raise EFCAGateError(
                "INVALID_TRANSITION",
                "occurredAtTick is the engine-resolved occurrence time; it "
                "must equal the resolution of the declared scope-local "
                "reference (F-37)")

    elif et == "NEW_PHASE1_REQUESTED":
        _require_custodian_of_in(ix, p.get("tupleKey"), p.get("custodian"))
        new_reviewer = p.get("newReviewer")
        _require_synthetic_actor_in(ix, new_reviewer, "R_P1")
        if not _tuple_contamination_exists_in(ix, p["tupleKey"]):
            raise EFCAGateError(
                "INVALID_PAYLOAD",
                "a new Phase 1 is requested only as contamination recovery; "
                "no effective contamination exists for this tuple (§G.6)",
            )
        if _effective_incidents_in(ix, p["tupleKey"], new_reviewer):
            if (p["tupleKey"], new_reviewer) in ix["seals"]:
                raise EFCAGateError(
                    "EXPOSED_REVIEWER_CANNOT_CURE",
                    "the exposed reviewer cannot restore blindness by "
                    "repeating their own review",
                )
            raise EFCAGateError(
                "REVIEWER_ALREADY_EXPOSED",
                "this reviewer's effective contamination on the tuple "
                "excludes them from performing the new blind Phase 1",
            )
        if (p["tupleKey"], new_reviewer) in ix["seals"]:
            raise EFCAGateError("REVIEWER_ALREADY_SEALED",
                                "a fresh reviewer is required")

    elif et == "RATIONALE_ACCESSED":
        _require_synthetic_actor_in(ix, p.get("reviewer"), "R_IND")
        _require_tuple_in(ix, p.get("tupleKey"))
        try:
            _original_normative_claim_in(ix, p["tupleKey"])
        except EFCAGateError:
            raise EFCAGateError(
                "REFUSED_NO_ORIGINAL_CLAIM",
                "no effectively clean original R_P1 rationale exists for "
                "this tuple (F-5)",
            )
        if (p["tupleKey"], p["reviewer"]) in ix["rationale_access"]:
            raise EFCAGateError("DUPLICATE_EVENT",
                                "rationale already accessed (append-only)")

    elif et == "RECORDS_REDERIVED_DECLARED":
        _require_synthetic_actor_in(ix, p.get("reviewer"), "R_IND")
        _require_tuple_in(ix, p.get("tupleKey"))
        if (p["tupleKey"], p["reviewer"]) in ix["rederivations"]:
            raise EFCAGateError("DUPLICATE_EVENT",
                                "re-derivation already declared (append-only)")
        _validate_record_refs_in(ix, p["tupleKey"], p.get("recordRefs"),
                                 "re-derivation declaration")

    elif et == "CLAIM_ADJUDICATED":
        r_ind_id = p.get("reviewer")
        _require_synthetic_actor_in(ix, r_ind_id, "R_IND")
        _require_tuple_in(ix, p.get("tupleKey"))
        claim_type = str(p.get("claimType"))
        if claim_type.startswith("CAUSAL_CATEGORY") or claim_type not in (
                CLAIM_TYPES_NORMATIVE + CLAIM_TYPES_HISTORICAL):
            raise EFCAGateError(
                "UNSUPPORTED_SCIENTIFIC_ADJUDICATION",
                "claim type %r is outside the procedural gate; this engine "
                "never adjudicates causal categories, J-1 or J-4 "
                "(categoryAssignment stays %s)"
                % (claim_type, CATEGORY_ASSIGNMENT),
            )
        if r_ind_id in _p1_sealers_in(ix, p["tupleKey"]):
            raise EFCAGateError("AUTHOR_CANNOT_REPRODUCE",
                                "a non-author reproducer is required")
        _require_syn_id("claimId", p.get("claimId"))
        if claim_type in CLAIM_TYPES_HISTORICAL:
            raise EFCAGateError(
                "PROVENANCE_IS_NOT_ADJUDICATION",
                "mechanical provenance verification must not be persisted "
                "as CLAIM_ADJUDICATED; historical-record checks use "
                "CLAIM_PROVENANCE_VERIFIED and are not substantive claim "
                "adjudication (F-35)",
            )
        expected = _normative_adjudication_gates_in(
            ix, p["tupleKey"], r_ind_id, p.get("claimId"), claim_type)
        _enforce_claim_identity(ix, p["tupleKey"], p.get("claimId"),
                                claim_type, "NORMATIVE")
        if p.get("prerequisites") != expected:
            raise EFCAGateError(
                "INVALID_TRANSITION",
                "prerequisites are engine-observed/declared; a "
                "caller-supplied or forged prerequisite block is not "
                "accepted (F-3/F-8/F-16)",
            )

    elif et == "CLAIM_PROVENANCE_VERIFIED":
        r_ind_id = p.get("reviewer")
        _require_synthetic_actor_in(ix, r_ind_id, "R_IND")
        _require_tuple_in(ix, p.get("tupleKey"))
        claim_type = str(p.get("claimType"))
        if claim_type in CLAIM_TYPES_NORMATIVE:
            raise EFCAGateError(
                "NORMATIVE_IS_NOT_PROVENANCE",
                "a normative claim is not mechanical provenance and cannot "
                "be recorded as CLAIM_PROVENANCE_VERIFIED (F-35)",
            )
        if claim_type.startswith("CAUSAL_CATEGORY") or claim_type not in (
                CLAIM_TYPES_HISTORICAL):
            raise EFCAGateError(
                "UNSUPPORTED_SCIENTIFIC_ADJUDICATION",
                "claim type %r is outside the procedural gate; this engine "
                "never adjudicates causal categories, J-1 or J-4 "
                "(categoryAssignment stays %s)"
                % (claim_type, CATEGORY_ASSIGNMENT),
            )
        if r_ind_id in _p1_sealers_in(ix, p["tupleKey"]):
            raise EFCAGateError("AUTHOR_CANNOT_REPRODUCE",
                                "a non-author reproducer is required")
        _require_syn_id("claimId", p.get("claimId"))
        raw_refs = None
        raw_scope = None
        prereq = p.get("prerequisites")
        if isinstance(prereq, dict):
            raw_refs = prereq.get("evidence")
            if version != "LEGACY":
                raw_bound = prereq.get("boundProposition")
                if isinstance(raw_bound, dict):
                    raw_scope = raw_bound.get("scope")
                elif raw_bound is not None:
                    raw_scope = raw_bound
        expected = _historical_adjudication_gates_in(
            ix, p["tupleKey"], r_ind_id, raw_refs, claim_type,
            proposition=raw_scope, version=version)
        _enforce_claim_identity(ix, p["tupleKey"], p.get("claimId"),
                                claim_type, "PROVENANCE")
        if p.get("prerequisites") != expected:
            raise EFCAGateError(
                "INVALID_TRANSITION",
                "prerequisites are engine-observed/declared; a "
                "caller-supplied or forged prerequisite block is not "
                "accepted (F-3/F-8/F-16/F-35/F-38)",
            )

    elif et == "EVIDENCE_RECORD_ISSUED":
        custodian = p.get("custodian")
        _require_custodian_of_in(ix, p.get("tupleKey"), custodian)
        if p.get("synthetic") is not True:
            raise EFCAGateError(
                "INVALID_TRANSITION",
                "EVIDENCE_RECORD_ISSUED must carry synthetic=true (F-15)")
        # F-13: the PHYSICAL identity gate executes on both paths; an
        # embedded SHA in a history is not evidence that the gate ran.
        digest = ctx["rubricGate"]()
        expected = _evidence_record_payload_in(
            ix, p["tupleKey"], custodian, digest, version=version,
            authority_mode=(None if version == "LEGACY"
                            else ctx["allocationAuthority"].mode))
        if p != expected:
            raise EFCAGateError(
                "INVALID_TRANSITION",
                "the evidence-record payload is engine-constructed from "
                "constants and engine-computed completeness; forged "
                "scientific-authority fields, wrong rubric identities or "
                "mismatched procedural snapshots are procedurally invalid "
                "(F-6/F-8/F-13)",
            )

    else:  # pragma: no cover - verify_chain guards event types
        raise EFCAGateError("INVALID_TRANSITION",
                            "unknown event type %r" % et)


# --------------------------------------------------------------------------
# The offline EFCA session (public workflow facade)
# --------------------------------------------------------------------------

class EFCASession(object):
    """Offline, synthetic-only EFCA enforcement session (CORR6).

    All state changes flow through _transition(), which validates every
    event with _check_transition against the live index before committing.
    Native replay (restore_global_history) runs the SAME validator; legacy
    CORR5 histories are admitted read-only through replay_legacy_history
    under the frozen legacy rule-set and are never adopted. Public read
    operations enforce the OD-37 scoped-disclosure boundary (role-scoped
    projections, scope-local clock references, no foreign procedural
    activity), and every requester-scoped file operation is path-bounded to
    the session scratch directory and produces/accepts only scoped
    projections. The authoritative chain is persisted/restored only through
    the engine-host channel.
    """

    def __init__(self, rubric_path=None, sidecar_path=None, scratch_dir=None,
                 session_label="SYN_SESSION_001", allocations_path=None,
                 simulation_allocations=None, simulation_allocations_path=None):
        """CORR9/OD-45-A construction. Exactly two engine-DERIVED authority
        modes exist and there is no parameter to set the mode directly:

        - the default, non-override native construction loads the
          Owner-pinned allocation manifest (fixed default path or the
          explicitly supplied `allocations_path`, always verified against
          the engine's Owner pin) and produces OWNER_PINNED;
        - the clearly named simulation parameters
          (`simulation_allocations` in-memory document, or
          `simulation_allocations_path`) declare test-only allocations and
          ALWAYS produce SIMULATION — never OWNER_PINNED, even when the
          supplied allocation bytes are an exact copy of the Owner-pinned
          manifest. A caller cannot replace the Owner pin by supplying a
          matching hash for their own manifest, and cannot declare a
          simulation and a pinned path together.
        The authority is verified BEFORE any actor-facing operation: an
        unavailable, malformed, conflicting or non-pinned authority fails
        construction with no session state."""
        self.rubric_path = Path(rubric_path) if rubric_path else DEFAULT_RUBRIC_PATH
        self.sidecar_path = Path(sidecar_path) if sidecar_path else DEFAULT_SIDECAR_PATH
        self.scratch_dir = Path(scratch_dir) if scratch_dir else DEFAULT_SCRATCH_DIR
        if not isinstance(session_label, str) or "SYN" not in session_label:
            raise EFCAGateError("NON_SYNTHETIC_IDENTIFIER",
                                "sessionLabel must be synthetic")
        self.session_label = session_label
        # CORR9/OD-45-A: verify the effective allocation authority before
        # any actor-facing operation. The mode is derived by the engine
        # from the construction form; it is never an accepted caller claim.
        if (simulation_allocations is not None
                or simulation_allocations_path is not None):
            if simulation_allocations is not None and simulation_allocations_path is not None:
                raise EFCAGateError(
                    "ALLOCATIONS_MODE_CONFLICT",
                    "declare at most one simulation allocation source")
            if allocations_path is not None:
                raise EFCAGateError(
                    "ALLOCATIONS_MODE_CONFLICT",
                    "a session is either OWNER_PINNED (the Owner-pinned "
                    "manifest) or SIMULATION (explicit test-only "
                    "allocations); the two construction forms are never "
                    "combined, so neither mode can be relabelled into the "
                    "other (OD-45-A)")
            self._authority = _load_simulation_authority(
                document=simulation_allocations,
                path=simulation_allocations_path)
        else:
            self._authority = _load_pinned_authority(
                allocations_path if allocations_path is not None
                else DEFAULT_ALLOCATIONS_PATH)
        # F-9: per-session persistence namespace; distinct session instances
        # never share a persisted history file.
        self.session_token = "SYNSESS_%s" % uuid.uuid4().hex[:12]
        # F-13: the physical identity gate is the single rubric-identity
        # authority for both live issuance and replay of issuance events.
        # CORR9/OD-45-A: the verified allocation authority is the second
        # trusted construction context used by live transitions and replay.
        self._ctx = {"rubricGate": self._rubric_identity_gate,
                     "allocationAuthority": self._authority}
        genesis = _make_genesis(session_label, self._authority.digest,
                                self._authority.mode)
        self._events = [genesis]
        self._ix = _fresh_index()
        _check_transition(genesis, self._ix, self._ctx)
        _index_event(genesis, self._ix)

    # ---------------- internal single-model transition ----------------

    def _transition(self, event_type, payload):
        record = {
            "seq": self._events[-1]["seq"] + 1,
            "eventId": "E%04d" % (self._events[-1]["seq"] + 1),
            "eventType": event_type,
            "t": self._events[-1]["t"] + 1,
            "prevEventSha": self._events[-1]["eventSha"],
            "payload": payload,
        }
        record["eventSha"] = _event_sha(
            {k: v for k, v in record.items() if k != "eventSha"}
        )
        _check_transition(record, self._ix, self._ctx)
        self._events.append(record)
        _index_event(record, self._ix)
        return record

    # ---------------- public operations: actors and tuples ----------------

    def register_actor(self, actor_id, role):
        """Register an actor under a trusted role (E1). The role is fixed
        here and can never be overridden by caller-supplied fields."""
        return dict(self._transition("ACTOR_REGISTERED",
                                     {"actorId": actor_id, "role": role})["payload"])

    def register_tuple(self, custodian_id, tuple_spec):
        """Register a synthetic tuple under custodian custody (E2/E3). The
        spec is validated against a CLOSED schema; marks and authenticated
        retrospective records live in custody only. Records must be exactly
        {id, locator, content, sha} with sha == sha256(content) (F-16).

        CORR9/OD-45-A (F-45): registration requires BOTH a registered
        CUSTODIAN role AND a matching Owner-approved entitlement for this
        precise tuple identity — role membership and knowledge of the tuple
        key are insufficient. The effective order is:
          (1) actor identity and role,
          (2) state-independent input validation,
          (3) tuple-specific entitlement against the verified immutable
              allocation authority,
          (4) for an entitled actor only: own registration/occupancy,
          (5) the lawful registration transition on an unregistered key.
        An unauthorized requester receives ONE fixed refusal — the same
        NOT_ENTITLED code and message — for an unregistered/unallocated
        key, a key allocated to another custodian and a key already
        registered under another custodian's custody: no foreign
        occupancy, ownership, timestamp, counter, registration status or
        activity detail is disclosed and a denied attempt mutates no
        authoritative history and no requester-visible procedural state.
        An entitled custodian receives truthful information about their own
        registration (including their own allocationDigest)."""
        # (1) actor identity and role
        _require_synthetic_actor_in(self._ix, custodian_id, "CUSTODIAN")
        # (2) state-independent request-input validation
        _check_closed(tuple_spec, TUPLE_SPEC_KEYS, "tuple_spec")
        for kind in ("caseId", "sideId", "factId", "d"):
            _require_syn_id(kind, tuple_spec.get(kind))
        _require_synthetic_text("sealedFactText", tuple_spec.get("sealedFactText"))
        _require_synthetic_text("questionText", tuple_spec.get("questionText"))
        marks = tuple_spec.get("custodyMarks")
        if (not isinstance(marks, dict)
                or set(marks.keys()) != {"A", "B"}
                or marks["A"] not in MARK_VALUES
                or marks["B"] not in MARK_VALUES):
            raise EFCAGateError("INVALID_PAYLOAD",
                                "custodyMarks must be {A: YES|NO, B: YES|NO}")
        records = _validate_custody_records(tuple_spec.get("retrospectiveRecords"))
        key = tuple_key_of(tuple_spec["caseId"], tuple_spec["sideId"],
                           tuple_spec["factId"])
        # (3) tuple-specific entitlement (verified immutable authority);
        # evaluated BEFORE any occupancy lookup, so the refusal is
        # identical across the unregistered, foreign-allocated and
        # foreign-registered states.
        entitled = self._authority.custodian_for(key)
        if entitled is None or entitled != custodian_id:
            raise EFCAGateError("NOT_ENTITLED", NOT_ENTITLED_MESSAGE)
        allocation_digest = _allocation_entry_digest(key, entitled)
        # (4) own registration / occupancy (entitled actors only)
        if key in self._ix["tuples"]:
            raise EFCAGateError("DUPLICATE_TUPLE", "tuple already registered")
        canonical_hash = sha256_hex(
            "%s|%s|%s" % (tuple_spec["caseId"], tuple_spec["sideId"],
                          tuple_spec["factId"]))
        # (5) the lawful registration transition
        ev = self._transition("TUPLE_REGISTERED", {
            "custodian": custodian_id,
            "caseId": tuple_spec["caseId"],
            "sideId": tuple_spec["sideId"],
            "factId": tuple_spec["factId"],
            "d": tuple_spec["d"],
            "canonicalHashInput": canonical_hash,
            "sealedFactText": tuple_spec["sealedFactText"],
            "questionText": tuple_spec["questionText"],
            "custodyMarks": {"A": marks["A"], "B": marks["B"]},
            "retrospectiveRecords": records,
            "allocationDigest": allocation_digest,
            "synthetic": True,
        })
        return {"tupleKey": key, "canonicalHashInput": canonical_hash,
                "allocationDigest": allocation_digest,
                "registeredAt": self._scope_ref(custodian_id, key, ev["t"]),
                "synthetic": True}

    # ---------------- public operations: Phase 1 (E1–E4) ----------------

    def issue_packet(self, custodian_id, reviewer_id, tuple_key):
        """Custodian-issued identity-verified blind packet (§G.4, E3).
        CORR7/F-41: the custody relationship is evaluated first; the refusal
        is identical for an unregistered key and a foreign tuple."""
        _require_tuple_key_form(tuple_key)
        tup = _require_custodian_uniform_in(self._ix, tuple_key, custodian_id)
        packet = _packet_content_of(tup)
        packet_sha = sha256_hex(canonical_bytes(packet))
        role = self._ix["actors"].get(reviewer_id)
        phase = "IND_REPRODUCTION" if role == "R_IND" else "PHASE_1"
        self._transition("PACKET_ISSUED", {
            "tupleKey": tuple_key, "custodian": custodian_id,
            "reviewer": reviewer_id, "packetSha": packet_sha,
            "issuedAt": self._events[-1]["t"] + 1, "phase": phase,
        })
        return dict(packet)

    def fetch_packet(self, reviewer_id, tuple_key, fields=None):
        """Reviewer-side blind view of an issued packet (E2).
        CORR7/F-41: packet-first; the refusal does not depend on whether the
        tuple is registered."""
        _require_synthetic_actor_in(self._ix, reviewer_id)
        _require_tuple_key_form(tuple_key)
        _require_active_packet_uniform_in(self._ix, tuple_key, reviewer_id)
        if fields is None:
            wanted = list(PACKET_FIELDS)
        else:
            if not isinstance(fields, (list, tuple)):
                raise EFCAGateError("INVALID_PAYLOAD", "fields must be a list")
            for f in fields:
                if f not in PACKET_FIELDS:
                    raise EFCAGateError(
                        "FORBIDDEN_FIELD_REJECTED",
                        "field %r is not a lawful Phase-1 packet field; the "
                        "Phase-1 surface is exactly %s" % (f, list(PACKET_FIELDS)),
                    )
            wanted = list(fields)
        full = _packet_content_of(self._ix["tuples"][tuple_key])
        return {f: full[f] for f in wanted}

    def submit_phase1_review(self, reviewer_id, tuple_key, review):
        """Reviewer seals a Phase-1 review (§G.4, E4). Immutable once sealed.
        A reviewer whose effective contamination includes pre-seal
        disclosures may still seal; the seal is preserved and marked
        CONTAMINATED (§G.6) and can never serve as blind proof."""
        _require_synthetic_actor_in(self._ix, reviewer_id)
        if self._ix["actors"][reviewer_id] not in ("R_P1", "R_IND"):
            raise EFCAGateError(
                "ROLE_MISMATCH",
                "only R_P1 or R_IND reviewers may seal a Phase-1 review",
            )
        _require_tuple_key_form(tuple_key)
        packet = _require_active_packet_uniform_in(self._ix, tuple_key,
                                                   reviewer_id)
        if (tuple_key, reviewer_id) in self._ix["seals"]:
            raise EFCAGateError(
                "SEALED_IMMUTABLE",
                "a sealed Phase 1 already exists for this reviewer and "
                "tuple; sealed bytes can neither be edited nor replaced",
            )
        _validate_raw_review(review)
        sealed_payload = {
            "packetSha": packet["packetSha"],
            "reviewer": reviewer_id,
            "interpretationBound": json.loads(
                json.dumps(review["interpretationBound"])),
            "rationale": review["rationale"],
            "normativeStates": json.loads(
                json.dumps(review["normativeStates"])),
            "nonAuthoritativeObservations": [
                {"note": o["note"], "authoritative": False}
                for o in review.get("nonAuthoritativeObservations", [])
            ],
            "synthetic": True,
        }
        sealed_sha = sha256_hex(canonical_bytes(sealed_payload))
        contamination = _contamination_snapshot_in(self._ix, tuple_key,
                                                   reviewer_id)
        ev = self._transition("PHASE1_SEALED", {
            "tupleKey": tuple_key, "reviewer": reviewer_id,
            "packetSha": packet["packetSha"],
            "sealedBytesSha": sealed_sha,
            "sealedAt": self._events[-1]["t"] + 1,
            "contamination": contamination,
            "sealedPayload": sealed_payload,
        })
        return {
            "sealedBytesSha": sealed_sha,
            "sealedAt": self._scope_ref(reviewer_id, tuple_key, ev["t"]),
            "contamination": self._disclosed_contamination(
                reviewer_id, tuple_key, contamination),
            "sealedBytesImmutable": True,
        }

    def acknowledge_seal_receipt(self, custodian_id, tuple_key, reviewer_id):
        """Custodian records sealReceivedAt (§G.4 step 3, E4).
        CORR7/F-41: uniform custody gate."""
        _require_tuple_key_form(tuple_key)
        _require_custodian_uniform_in(self._ix, tuple_key, custodian_id)
        ev = self._transition("SEAL_RECEIPT_ACKNOWLEDGED", {
            "tupleKey": tuple_key, "custodian": custodian_id,
            "reviewer": reviewer_id,
        })
        return {"sealReceivedAt": self._scope_ref(custodian_id, tuple_key,
                                                  ev["t"])}

    # ---------------- public operations: Phase 2 (E5) ----------------

    def reveal(self, custodian_id, reviewer_id, tuple_key):
        """Custodian reveals marks and retrospective record locators
        (§G.5: "reveals the marks and retrospective records {id, sha}"),
        gated on effective (derived, occurrence-aware) contamination.
        CORR7/F-41: uniform custody gate."""
        _require_tuple_key_form(tuple_key)
        tup = _require_custodian_uniform_in(self._ix, tuple_key, custodian_id)
        self._transition("REVEALED", {
            "tupleKey": tuple_key, "custodian": custodian_id,
            "reviewer": reviewer_id,
        })
        reveal_tick = self._ix["reveals"][(tuple_key, reviewer_id)]
        return {
            "markA": tup["custodyMarks"]["A"],
            "markB": tup["custodyMarks"]["B"],
            "retrospectiveRecords": [
                {"id": r["id"], "sha": r["sha"]}
                for r in tup["retrospectiveRecords"]
            ],
            "revealedAt": self._scope_ref(custodian_id, tuple_key, reveal_tick),
        }

    def append_delta(self, reviewer_id, tuple_key, delta):
        """Append the Phase-2 delta, including the defined 'NO_CHANGE'
        control value (§G.5). Free-text deltas require the SYNTHETIC
        classification marker (F-20; a marker is a mechanical label, not
        proof of factual provenance)."""
        if not isinstance(delta, str) or not delta:
            raise EFCAGateError("INVALID_PAYLOAD",
                                "delta must be a non-empty string")
        if delta != "NO_CHANGE":
            _require_synthetic_text("delta", delta)
        self._transition("DELTA_APPENDED", {
            "tupleKey": tuple_key, "reviewer": reviewer_id, "delta": delta,
        })
        return {"appended": True, "appendOnly": True}

    # ---------------- public operations: contamination (E6, F-2/F-4) -----

    def report_exposure(self, reporter_id, tuple_key, exposed_to_id, what,
                        detail="", occurred=None):
        """Register a Phase-1-forbidden exposure (§G.6, S16/S25/S28).

        CORR6/OD-37: `occurred` is the scope-local occurrence reference
        {"scope": "self", "scopeOrdinal": k} naming the k-th event of the
        reporter's own recorded sequence (registration and every event
        naming the reporter as a party). The exposure HAPPENED at that
        own-scope event; discovery may be later (F-4). None means the
        occurrence time is not established, which is treated as
        contaminating (fail closed). The previous session-tick input was an
        indirect session-clock probe channel (acceptance/refusal revealed
        the session-global count); the internally resolved tick preserves
        the F-4 occurrence-time derivation exactly for equivalent
        declarations. Lane B deliveries, pre-seal rationale accesses and
        pre-seal retrospective disclosures are contaminated by DERIVATION
        and need no companion report (F-11/F-12/F-18). A non-empty detail
        requires the SYNTHETIC marker (F-20)."""
        _require_synthetic_actor_in(self._ix, reporter_id)
        if detail:
            _require_synthetic_text("exposure detail", detail)
        resolved = None
        normalized_ref = None
        if occurred is not None:
            if not isinstance(occurred, dict):
                raise EFCAGateError(
                    "INVALID_TICK_TYPE",
                    "the occurrence reference must be an object "
                    "{scope, scopeOrdinal} or None; a bare tick is not a "
                    "lawful occurrence reference (OD-37/F-37)")
            _check_closed(occurred, OCCURRENCE_REF_KEYS, "occurred")
            if occurred.get("scope") != "self":
                raise EFCAGateError(
                    "INVALID_TICK_TYPE",
                    "the occurrence reference may name only your own "
                    "recorded scope ('self'); foreign or session scopes are "
                    "not lawful (OD-37/F-37)")
            resolved = _resolve_occurrence_ref_in(self._ix, reporter_id,
                                                  occurred.get("scopeOrdinal"))
            normalized_ref = {"scope": "self",
                              "scopeOrdinal": occurred["scopeOrdinal"]}
        ev = self._transition("EXPOSURE_REPORTED", {
            "tupleKey": tuple_key, "exposedTo": exposed_to_id,
            "what": what, "reportedBy": reporter_id, "detail": detail,
            "occurredAtTick": resolved,
            "occurredScopeRef": normalized_ref,
        })
        return {
            "exposedTo": exposed_to_id, "what": what,
            "occurredAtTick": (None if resolved is None else
                               self._scope_ref(reporter_id, tuple_key,
                                               resolved)),
            "reportedTick": self._scope_ref(reporter_id, tuple_key, ev["t"]),
            "phase1Contamination": self._disclosed_contamination(
                reporter_id, tuple_key,
                _contamination_snapshot_in(self._ix, tuple_key, exposed_to_id)),
        }

    def request_new_phase1(self, custodian_id, tuple_key, new_reviewer_id):
        """Contamination recovery (§G.6 step 5): only a different reviewer
        who never received forbidden tuple-specific material.
        CORR7/F-41: uniform custody gate."""
        _require_tuple_key_form(tuple_key)
        _require_custodian_uniform_in(self._ix, tuple_key, custodian_id)
        self._transition("NEW_PHASE1_REQUESTED", {
            "tupleKey": tuple_key, "custodian": custodian_id,
            "newReviewer": new_reviewer_id,
        })
        return self.issue_packet(custodian_id, new_reviewer_id, tuple_key)

    # ---------------- public operations: Lane B (E7, F-2, F-10) ----------

    def register_lane_b(self, r_lb_id, tuple_key, lane_b_spec):
        """Register one Lane B schema-inspection record on its own surface
        (causeLink UNASSIGNED_PENDING_J1; no category fields exist; no
        assignment protocol is invented). F-39/OD-39: several registered
        R_LB actors may file independent submissions on the same tuple and
        the first submission does not monopolize it. The submissionId is
        engine-constructed as the tuple-local ordinal of registrations, so
        it is stable, unique and replay-deterministic.
        CORR7/F-41: the standard-form Lane B filing is a self-scoped content
        record bound to the well-formed tuple key; it does not require prior
        registration, so its outcome does not disclose registration status
        (uniform success in both states; no new scientific meaning — the
        tuple binding is the key itself).
        CORR8/F-44: the identity is ACTOR-LOCAL DETERMINISTIC — derived
        only from the filer's own actor id, the tuple key and the filer's
        own prior-filing count through a one-way hash — so the returned
        identifier reveals no other reviewer's filing count, order or
        existence."""
        _require_synthetic_actor_in(self._ix, r_lb_id, "R_LB")
        _require_tuple_key_form(tuple_key)
        _check_closed(lane_b_spec, LANE_B_SPEC_KEYS, "lane_b_spec")
        submission_id = _submission_identity(
            r_lb_id, tuple_key,
            self._ix["lane_b_actor_counts"].get((tuple_key, r_lb_id), 0)
            + 1)
        self._transition("LANE_B_REGISTERED", {
            "tupleKey": tuple_key, "reviewer": r_lb_id,
            "submissionId": submission_id,
            "question": lane_b_spec["question"],
            "surface": lane_b_spec["surface"],
            "schemaClaim": lane_b_spec["schemaClaim"],
        })
        return {"laneBRecord": True, "submissionId": submission_id,
                "causeLink": "UNASSIGNED_PENDING_J1"}

    def deliver_lane_b_to(self, custodian_id, actor_id, tuple_key,
                          submission_id):
        """Deliver ONE exact Lane B submission to an actor (F-2/F-11,
        F-39/OD-39: the custodian's delivery references a particular
        submission).

        If the recipient is an R_P1/R_IND reviewer who has NOT sealed this
        tuple — packet issued or not — the delivery is a contaminating
        exposure by DERIVATION from this event alone (no companion event is
        required, live or replayed). Delivery after that reviewer's seal is
        lawful and registers no incident. CORR7/F-41: uniform custody
        gate."""
        _require_tuple_key_form(tuple_key)
        _require_custodian_uniform_in(self._ix, tuple_key, custodian_id)
        ev = self._transition("LANE_B_DELIVERED", {
            "tupleKey": tuple_key, "custodian": custodian_id,
            "deliveredTo": actor_id, "submissionId": submission_id,
        })
        contamination_effect = None
        if (self._ix["actors"].get(actor_id) in ("R_P1", "R_IND")
                and (tuple_key, actor_id) not in self._ix["seals"]):
            contamination_effect = {
                "status": "CONTAMINATED", "what": "LANE_B_MATERIAL",
                "occurredAtTick": self._scope_ref(custodian_id, tuple_key,
                                                  ev["t"]),
            }
        return {"deliveredTo": actor_id, "submissionId": submission_id,
                "tick": self._scope_ref(custodian_id, tuple_key, ev["t"]),
                "contaminationEffect": contamination_effect}

    # ---------------- public operations: independent reproduction (E8) ----

    def begin_independent_reproduction(self, r_ind_id, tuple_key):
        """Return the reproducer's own custodian-issued Phase-1 packet
        (distinct non-author). CORR7/F-41: the reproducer no longer
        self-issues — the tuple's custodian issues the R_IND packet exactly
        as any Phase-1 packet (§G.4 step 1). Without that packet the
        refusal is the identical UNISSUED_PACKET for an unregistered key and
        a foreign tuple, so registration status is not observable."""
        _require_synthetic_actor_in(self._ix, r_ind_id, "R_IND")
        _require_tuple_key_form(tuple_key)
        packet = _require_active_packet_uniform_in(self._ix, tuple_key,
                                                   r_ind_id)
        if r_ind_id in _p1_sealers_in(self._ix, tuple_key):
            raise EFCAGateError(
                "AUTHOR_CANNOT_REPRODUCE",
                "an author of a Phase-1 review cannot impersonate the "
                "independent reproducer for the same tuple",
            )
        if (tuple_key, r_ind_id) in self._ix["seals"]:
            raise EFCAGateError(
                "REVIEWER_ALREADY_SEALED",
                "the reproducer already sealed a Phase-1 review for this "
                "tuple; a sealed reproduction is immutable and is not "
                "re-enterable",
            )
        if _effective_incidents_in(self._ix, tuple_key, r_ind_id):
            raise EFCAGateError(
                "REVIEWER_ALREADY_EXPOSED",
                "an exposed actor (including derived pre-seal disclosures) "
                "cannot serve as the independent reproducer for this tuple",
            )
        return _packet_content_of(self._ix["tuples"][tuple_key])

    def receive_first_rationale(self, r_ind_id, tuple_key):
        """Expose the original reviewer's sealed rationale to the reproducer
        (the ONLY public path). ownPhase1SealedBeforeRationale is computed
        from event ordering, never declared. Access before the reproducer's
        own seal contaminates the reproducer's Phase 1 BY DERIVATION from
        this event alone (S26/F-12). CORR7/F-41: packet-first; the
        reproducer participates only in tuples whose custodian issued them a
        reproduction packet."""
        _require_synthetic_actor_in(self._ix, r_ind_id, "R_IND")
        _require_tuple_key_form(tuple_key)
        _require_active_packet_uniform_in(self._ix, tuple_key, r_ind_id)
        original_reviewer, original_seal = _original_normative_claim_in(
            self._ix, tuple_key)
        self._transition("RATIONALE_ACCESSED", {
            "tupleKey": tuple_key, "reviewer": r_ind_id,
        })
        return {
            "rationaleOf": original_reviewer,
            "sealedBytesSha": original_seal["sealedBytesSha"],
            "interpretationBound": json.loads(json.dumps(
                original_seal["sealedPayload"]["interpretationBound"])),
            "rationale": original_seal["sealedPayload"]["rationale"],
            "normativeStates": json.loads(json.dumps(
                original_seal["sealedPayload"]["normativeStates"])),
        }

    def declare_records_rederived(self, r_ind_id, tuple_key, record_refs):
        """Separately declared recordsRederived prerequisite (§G.7), made
        proof-carrying (F-16): each reference cites an authenticated record
        by {recordId, locator, content} and the content must hash to the
        authenticated record digest. CORR7/F-41: packet-first."""
        _require_synthetic_actor_in(self._ix, r_ind_id, "R_IND")
        _require_tuple_key_form(tuple_key)
        _require_active_packet_uniform_in(self._ix, tuple_key, r_ind_id)
        if (tuple_key, r_ind_id) in self._ix["rederivations"]:
            raise EFCAGateError("DUPLICATE_EVENT",
                                "re-derivation already declared (append-only)")
        normalized = _validate_record_refs_in(self._ix, tuple_key, record_refs,
                                              "re-derivation declaration")
        self._transition("RECORDS_REDERIVED_DECLARED", {
            "tupleKey": tuple_key, "reviewer": r_ind_id,
            "recordRefs": normalized,
        })
        return {"recordsRederived": True,
                "recordRefs": json.loads(json.dumps(normalized))}

    def adjudicate_claim(self, r_ind_id, tuple_key, claim_type, claim_id,
                         record_refs=None, proposition=None, observation=None):
        """Claim-specific adjudication gate (§G.7, E8/F-3/F-5/F-16).
        Procedural, never scientific (E11).

        - NORMATIVE_*: requires the reproducer's own Phase 1 sealed BEFORE
          the first rationale access (observed ordering), uncontaminated,
          and the reproduced proposition identical to the identified
          original claim.
        - HISTORICAL_RECORD_*: requires the declared re-derivation AND the
          per-claim proof-carrying reconstruction (`record_refs`) AND the
          complete declared proposition scope (`proposition`, rubric §D.4 /
          OD-38/F-38); a missing mandatory scope fails closed. The bound
          proposition is the declared content + type-specific scope; each
          verification is a separate attestation and several attestations
          may concern one proposition. No scientific adjudication of the
          historical proposition and no semantic-equivalence algorithm are
          performed.
        CORR7/F-41: packet-first; the refusal is existence-blind.
        """
        _require_synthetic_actor_in(self._ix, r_ind_id, "R_IND")
        _require_tuple_key_form(tuple_key)
        _require_active_packet_uniform_in(self._ix, tuple_key, r_ind_id)
        _require_tuple_in(self._ix, tuple_key)  # implied by the packet
        claim_type = str(claim_type)
        if claim_type.startswith("CAUSAL_CATEGORY") or claim_type not in (
                CLAIM_TYPES_NORMATIVE + CLAIM_TYPES_HISTORICAL):
            raise EFCAGateError(
                "UNSUPPORTED_SCIENTIFIC_ADJUDICATION",
                "claim type %r is outside the procedural gate; this engine "
                "never adjudicates causal categories, J-1 or J-4 "
                "(categoryAssignment stays %s)"
                % (claim_type, CATEGORY_ASSIGNMENT),
            )
        if observation is not None:
            if not isinstance(observation, dict):
                raise EFCAGateError("INVALID_PAYLOAD",
                                    "observation must be an object")
            bad = {"ownPhase1SealedBeforeRationale", "recordsRederived",
                   "role", "categoryAssignment", "packetSha", "sealedBytesSha",
                   "reproducedOriginalClaim", "originalClaimSource",
                   "recordRefs", "evidence", "reconstruction", "recordIds",
                   "boundProposition", "proposition", "scope"}
            hit = sorted(set(observation.keys()) & bad)
            if hit:
                raise EFCAGateError(
                    "CALLER_SUPPLIED_PREREQUISITE_REJECTED",
                    "prerequisite field(s) %s are engine-observed/declared, "
                    "never caller-supplied" % ", ".join(hit),
                )
        if r_ind_id in _p1_sealers_in(self._ix, tuple_key):
            raise EFCAGateError("AUTHOR_CANNOT_REPRODUCE",
                                "a non-author reproducer is required")
        _require_syn_id("claimId", claim_id)
        if claim_type in CLAIM_TYPES_NORMATIVE:
            prerequisites = _normative_adjudication_gates_in(
                self._ix, tuple_key, r_ind_id, claim_id, claim_type)
            event_type = "CLAIM_ADJUDICATED"
        else:
            prerequisites = _historical_adjudication_gates_in(
                self._ix, tuple_key, r_ind_id, record_refs, claim_type,
                proposition=proposition)
            event_type = "CLAIM_PROVENANCE_VERIFIED"
        ev = self._transition(event_type, {
            "tupleKey": tuple_key, "reviewer": r_ind_id,
            "claimType": claim_type, "claimId": claim_id,
            "prerequisites": prerequisites,
        })
        bounded = claim_type in CLAIM_TYPES_HISTORICAL
        return {
            "claimId": claim_id, "claimType": claim_type,
            "claimLevelStatus": ("PROVENANCE_VERIFIED_NOT_ADJUDICATED"
                                 if bounded else "ADJUDICATED"),
            "mechanicalVerificationOnly": bounded,
            "boundProposition": json.loads(
                json.dumps(prerequisites["boundProposition"])),
            "tick": self._scope_ref(r_ind_id, tuple_key, ev["t"]),
            "scopeNote": ("ADJUDICATED attaches to this named normative "
                          "claim only" if not bounded else
                          "only mechanical record provenance was verified "
                          "against the complete declared proposition scope; "
                          "substantive adjudication of the named historical "
                          "proposition is an unresolved gate requiring "
                          "separate scientific authority (F-27/F-38)"),
        }

    # ---------------- public operations: issuance gate (E10, F-6/F-13) ---

    def _rubric_identity_gate(self):
        """§I.2 + F-6: computed SHA == sidecar SHA == Owner-pinned SHA.
        Identity gate only; never a scientific falsifier. Executed on both
        the live issuance path and the replay path (F-13)."""
        rubric = self.rubric_path
        if not rubric.is_file():
            raise IdentityGateError(
                "NOT_ISSUABLE_RUBRIC_FILE_MISSING",
                "accepted rubric file not found at %s" % rubric,
            )
        sidecar = self.sidecar_path
        if not sidecar.is_file():
            raise IdentityGateError(
                "NOT_ISSUABLE_SIDECAR_MISSING",
                "external SHA256SUMS.txt sidecar not found at %s" % sidecar,
            )
        digest = sha256_hex(rubric.read_bytes())
        if digest != RUBRIC_EXPECTED_SHA256:
            raise IdentityGateError(
                "NOT_ISSUABLE_OWNER_PINNED_MISMATCH",
                "computed rubric SHA-256 %s does not equal the Owner-pinned "
                "accepted identity %s; a modified rubric is NOT ISSUABLE "
                "even when its sidecar is modified to match (F-6)"
                % (digest, RUBRIC_EXPECTED_SHA256),
            )
        entries = {}
        for line in sidecar.read_text(encoding="utf-8").splitlines():
            m = re.fullmatch(r"([0-9a-fA-F]{64})\s+\*?(\S.*)", line.strip())
            if m:
                entries[m.group(2).strip()] = m.group(1).lower()
        expected = entries.get(RUBRIC_FILE_NAME)
        if expected is None:
            raise IdentityGateError(
                "NOT_ISSUABLE_SIDECAR_ENTRY_MISSING",
                "sidecar has no entry for %s" % RUBRIC_FILE_NAME,
            )
        if digest != expected:
            raise IdentityGateError(
                "NOT_ISSUABLE_RUBRIC_IDENTITY_MISMATCH",
                "computed rubric SHA-256 %s does not match the exact sidecar "
                "entry %s; the record is NOT ISSUABLE and no scientific "
                "status is modified" % (digest, expected),
            )
        if digest == PARENT_RUBRIC_SHA256:
            raise IdentityGateError(
                "NOT_ISSUABLE_PARENT_IDENTITY_AS_CURRENT",
                "the controlling accepted rubric identity must remain "
                "distinct from the parent rubric identity",
            )
        return digest

    def issue_evidence_record(self, custodian_id, tuple_key):
        """Issue a synthetic EFCA evidence record after the triple identity
        gate. The payload — including the procedural completeness snapshot —
        is engine-constructed (F-6); a partial procedural record is issued
        with its incompleteness represented explicitly and implies nothing
        that did not occur. CORR7/F-41: uniform custody gate."""
        _require_tuple_key_form(tuple_key)
        _require_custodian_uniform_in(self._ix, tuple_key, custodian_id)
        digest = self._rubric_identity_gate()
        payload = _evidence_record_payload_in(
            self._ix, tuple_key, custodian_id, digest,
            authority_mode=self._authority.mode)
        ev = self._transition("EVIDENCE_RECORD_ISSUED", payload)
        return json.loads(json.dumps(ev["payload"]))

    # ---------------- public operations: status and reads (E9,F-1,F-4,F-10)

    def workflow_status(self, tuple_key, requester_id=None):
        """§I workflow status derived from CURRENT EFFECTIVE evidence and
        derived incident state (F-4/F-11/F-12/F-18). Nothing historical is
        rewritten. F-17: while an R_P1/R_IND requester has not sealed the
        tuple (or no requester is given), all §I status values and
        adjudication summaries are WITHHELD — procedural state is not
        exposed through a read API merely because events are append-only.
        Full status is visible to the tuple's custodian and to an
        already-sealed reviewer. F-32: filing a Lane B evidence record
        does not authorize this read. The accepted rubric does not define
        a custodian-issued Lane B assignment, and none is invented here.
        CORR7/F-41: existence-blind — the withheld shape is returned for any
        well-formed key to any requester without an authorized relationship,
        whether or not the tuple is registered."""
        _require_tuple_key_form(tuple_key)
        blind = True
        if requester_id is not None:
            _require_synthetic_actor_in(self._ix, requester_id)
            role = self._ix["actors"][requester_id]
            tup = self._ix["tuples"].get(tuple_key)
            authorized = (
                (role == "CUSTODIAN" and tup is not None
                 and tup["custodian"] == requester_id)
                or (tuple_key, requester_id) in self._ix["seals"])
            if authorized:
                blind = False
        if blind:
            return {
                "disclosure": "WITHHELD_BEFORE_OWN_SEAL",
                "tupleHistoricalCause": "NOT_ESTABLISHED",
                "note": "tuple-specific §I status, adjudication summaries "
                        "and contamination information are withheld from an "
                        "unsealed reviewer (F-17); lawful post-seal access "
                        "restores the full view",
            }
        provisional = False
        effective_seals = []
        for (tk, reviewer) in self._ix["seals"]:
            if tk != tuple_key:
                continue
            clean = _seal_effectively_clean_in(self._ix, tuple_key, reviewer)
            effective_seals.append({"reviewer": reviewer, "effectivelyClean": clean})
            if (clean
                    and (tuple_key, reviewer) in self._ix["receipts"]
                    and any(d[0] == tuple_key and d[1] == reviewer
                            for d in self._ix["deltas"])):
                provisional = True
        effective, suspended = [], []
        normative_effective = 0
        for adj in self._ix["adjudications"]:
            if adj["tupleKey"] != tuple_key:
                continue
            entry = {"claimId": adj["claimId"], "claimType": adj["claimType"],
                     "reviewer": adj["reviewer"]}
            source = adj["prerequisites"].get("originalClaimSource", {})
            src_reviewer = source.get("reviewer")
            if not _seal_effectively_clean_in(self._ix, tuple_key,
                                              src_reviewer):
                suspended.append(dict(
                    entry, reason="ORIGINAL_CONTAMINATED_AFTER_ADJUDICATION"))
                continue
            if not _seal_effectively_clean_in(self._ix, tuple_key,
                                              adj["reviewer"]):
                suspended.append(dict(
                    entry, reason="ADJUDICATOR_CONTAMINATED_AFTER_ADJUDICATION"))
                continue
            normative_effective += 1
            effective.append(entry)
        provenance = [
            {"claimId": rec["claimId"], "claimType": rec["claimType"],
             "reviewer": rec["reviewer"],
             "claimLevelStatus": "PROVENANCE_VERIFIED_NOT_ADJUDICATED"}
            for rec in self._ix["provenance"] if rec["tupleKey"] == tuple_key
        ]
        claim_level = ("ADJUDICATED" if normative_effective else
                       "PROVENANCE_VERIFIED_NOT_ADJUDICATED"
                       if provenance else "NOT_ADJUDICATED")
        return {
            "tupleLevel": "PROVISIONAL" if provisional else "IN_PROGRESS",
            "claimLevel": claim_level,
            "effectiveSeals": sorted(
                effective_seals, key=lambda s: s["reviewer"]),
            "effectiveAdjudications": effective,
            "mechanicalProvenanceVerifications": provenance,
            "provenanceAttestationCount": len(provenance),
            "distinctBoundPropositionCount": len(
                [k for k, v in self._ix["propositions"].items()
                 if v["tupleKey"] == tuple_key]),
            "suspendedAdjudications": suspended,
            "tupleHistoricalCause": "NOT_ESTABLISHED",
            "note": "engine is a procedural gate; it never establishes "
                    "historical causation or any frozen §L-4 category; "
                    "status reflects current effective derived contamination "
                    "across the append-only history (F-4/F-11/F-12)",
        }

    def category_assignment(self, tuple_key):
        """Read-only: always UNASSIGNED; no public operation can change it.
        CORR7/F-41: a constant record for any well-formed key; registration
        status is not consulted."""
        _require_tuple_key_form(tuple_key)
        return {"categoryAssignment": CATEGORY_ASSIGNMENT,
                "tupleLevelName": TUPLE_LEVEL_NAME,
                "frozenNames": list(FROZEN_CATEGORY_NAMES),
                "unresolvedIsWorkflowDispositionNotCategory": True}

    # ---------------- F-1/F-10: role-aware read boundary ----------------

    def _blind_for(self, requester_id, tuple_key):
        """F-17: the requester is an R_P1/R_IND actor who has not yet sealed
        this tuple — no OTHER actor's tuple-specific analytical or
        procedural results may be disclosed to them."""
        if requester_id is None:
            return True
        role = self._ix["actors"].get(requester_id)
        if role in ("R_P1", "R_IND"):
            return (tuple_key, requester_id) not in self._ix["seals"]
        return False

    @staticmethod
    def _own_event(payload, requester_id):
        """True when the disclosed event is the requester's own act; a
        reviewer always has access to what they themselves submitted."""
        return (payload.get("reviewer") == requester_id
                or payload.get("deliveredTo") == requester_id
                or payload.get("newReviewer") == requester_id
                or payload.get("exposedTo") == requester_id)

    def _may_observe_event(self, requester_id, role, e):
        """F-37/OD-37: the single tuple-scope visibility predicate used by
        events() and by every scope-local clock reference. A custodian sees
        GENESIS, their own registration, and events of tuples under their
        own custody — foreign tuples and foreign registrations are omitted
        entirely (supersedes F-19's minimal foreign projections). Every
        other role keeps the F-31/F-33 reviewer boundary."""
        if role == "CUSTODIAN":
            if e["eventType"] == "GENESIS":
                return True
            if e["eventType"] == "ACTOR_REGISTERED":
                return e["payload"].get("actorId") == requester_id
            tk = self._event_tuple_key(e["eventType"], e["payload"])
            return (isinstance(tk, str)
                    and self._ix["tuples"].get(tk, {}).get("custodian")
                    == requester_id)
        return self._reviewer_may_observe(requester_id, e["eventType"],
                                          e["payload"])

    def _event_scope_name(self, e):
        et, p = e["eventType"], e["payload"]
        if et == "GENESIS":
            return "session"
        if et == "ACTOR_REGISTERED":
            return "self"
        tk = self._event_tuple_key(et, p)
        return tk if isinstance(tk, str) else "session"

    def _scope_ref(self, requester_id, scope_name, tick):
        """F-37/OD-37: every disclosed clock value is a scope-local
        reference — the count of the requester's OBSERVABLE events of that
        scope at or before the referenced time. No global seq, tick, count
        or chain hash is ever attached to a requester-scoped surface, so
        foreign activity cannot be inferred from gaps, magnitudes or
        polling diffs."""
        count = 0
        if tick is not None:
            role = self._ix["actors"].get(requester_id)
            for e in self._events:
                if not self._may_observe_event(requester_id, role, e):
                    continue
                if self._event_scope_name(e) != scope_name:
                    continue
                if e["t"] <= tick:
                    count += 1
        return {"scope": scope_name, "scopeOrdinal": count}

    def _disclosed_contamination(self, requester_id, tuple_key, snapshot):
        """Disclosure form of a contamination snapshot: every incident tick
        becomes a scope-local reference (OD-37/F-37)."""
        out = {"status": snapshot["status"], "incidents": []}
        for inc in snapshot["incidents"]:
            entry = dict(inc)
            occurred = entry.get("occurredAtTick")
            reported = entry.get("reportedTick")
            entry["occurredAtTick"] = (
                None if occurred is None
                else self._scope_ref(requester_id, tuple_key, occurred))
            entry["reportedTick"] = (
                None if reported is None
                else self._scope_ref(requester_id, tuple_key, reported))
            out["incidents"].append(entry)
        return out

    def _custodian_projection(self, et, p, t, requester_id):
        """F-19 substance under F-37: the tuple's custodian retains full
        CONTENT visibility over their own tuples, disclosed as a scoped
        projection — envelope sequence, ids, ticks and chain hashes are
        never attached, and clock-bearing fields become scope-local
        references. The reporter's own-scope occurrence declaration
        (occurredScopeRef) is an internal representation and is not
        re-disclosed; the disclosed occurrence time is recomputed as a
        reference relative to THIS requester's observable record."""
        payload = json.loads(json.dumps(p))
        tk = self._event_tuple_key(et, p)
        if et == "TUPLE_REGISTERED":
            payload["registeredAt"] = self._scope_ref(requester_id, tk, t)
        elif et == "PACKET_ISSUED":
            payload["issuedAt"] = self._scope_ref(requester_id, tk,
                                                  p["issuedAt"])
        elif et == "PHASE1_SEALED":
            payload["sealedAt"] = self._scope_ref(requester_id, tk,
                                                  p["sealedAt"])
        elif et == "EXPOSURE_REPORTED":
            payload.pop("occurredScopeRef", None)
            if p.get("occurredAtTick") is not None:
                payload["occurredAtTick"] = self._scope_ref(
                    requester_id, tk, p["occurredAtTick"])
        return payload

    def _event_tuple_key(self, et, payload):
        if et == "TUPLE_REGISTERED":
            return tuple_key_of(payload.get("caseId"), payload.get("sideId"),
                                payload.get("factId"))
        return payload.get("tupleKey")

    def _reviewer_may_observe(self, requester_id, et, payload):
        """F-31/F-33. Omit foreign procedural progress. Keep the requester's
        own submissions. After the requester has sealed a tuple, that
        tuple's redacted events are visible. Authorization matches
        workflow_status: custodian handling is separate; an R_LB filing is
        not tuple access."""
        if et == "GENESIS":
            return True
        if et == "ACTOR_REGISTERED":
            return payload.get("actorId") == requester_id
        if self._own_event(payload, requester_id):
            return True
        tk = self._event_tuple_key(et, payload)
        return (isinstance(tk, str)
                and (tk, requester_id) in self._ix["seals"])

    def _projected_payload(self, et, p, t, requester_id):
        """Post-seal and own-submission projection. No global seq, event id
        or envelope tick is attached by the caller; clock-bearing fields are
        scope-local references (F-37/OD-37)."""
        if et == "GENESIS":
            return {"engineActId": p["engineActId"],
                    "sessionLabel": p["sessionLabel"],
                    "syntheticOnly": True}
        if et == "ACTOR_REGISTERED":
            return {"actorId": p["actorId"], "role": p["role"]}
        if et == "TUPLE_REGISTERED":
            tk = tuple_key_of(p["caseId"], p["sideId"], p["factId"])
            return {"caseId": p["caseId"], "sideId": p["sideId"],
                    "factId": p["factId"],
                    "registeredAt": self._scope_ref(requester_id, tk, t),
                    "synthetic": True}
        if et == "PACKET_ISSUED":
            return {"tupleKey": p["tupleKey"], "reviewer": p["reviewer"],
                    "packetSha": p["packetSha"],
                    "issuedAt": self._scope_ref(requester_id, p["tupleKey"],
                                                p["issuedAt"]),
                    "phase": p["phase"]}
        if et == "PHASE1_SEALED":
            view = {"tupleKey": p["tupleKey"], "reviewer": p["reviewer"],
                    "sealedBytesSha": p["sealedBytesSha"],
                    "sealedAt": self._scope_ref(requester_id, p["tupleKey"],
                                                p["sealedAt"]),
                    "contaminationStatus": p["contamination"]["status"]}
            if p["reviewer"] == requester_id:
                view["sealedPayload"] = json.loads(
                    json.dumps(p["sealedPayload"]))
            return view
        if et == "SEAL_RECEIPT_ACKNOWLEDGED":
            return {"tupleKey": p["tupleKey"], "reviewer": p["reviewer"]}
        if et == "REVEALED":
            return {"tupleKey": p["tupleKey"], "reviewer": p["reviewer"],
                    "revealedAt": self._scope_ref(requester_id, p["tupleKey"], t)}
        if et == "DELTA_APPENDED":
            view = {"tupleKey": p["tupleKey"], "reviewer": p["reviewer"]}
            if p["reviewer"] == requester_id:
                view["delta"] = p["delta"]
            return view
        if et == "LANE_B_REGISTERED":
            view = {"tupleKey": p["tupleKey"],
                    "submissionId": p["submissionId"]}
            sealed_here = (p["tupleKey"], requester_id) in self._ix["seals"]
            if requester_id == p["reviewer"] or sealed_here:
                view.update({"question": p["question"],
                             "surface": p["surface"],
                             "schemaClaim": p["schemaClaim"],
                             "causeLink": "UNASSIGNED_PENDING_J1"})
            return view
        if et == "LANE_B_DELIVERED":
            return {"tupleKey": p["tupleKey"], "deliveredTo": p["deliveredTo"],
                    "submissionId": p["submissionId"]}
        if et == "EXPOSURE_REPORTED":
            return {"tupleKey": p["tupleKey"],
                    "exposedTo": p["exposedTo"], "what": p["what"]}
        if et == "NEW_PHASE1_REQUESTED":
            return {"tupleKey": p["tupleKey"],
                    "newReviewer": p["newReviewer"]}
        if et == "RATIONALE_ACCESSED":
            return {"tupleKey": p["tupleKey"], "reviewer": p["reviewer"]}
        if et == "RECORDS_REDERIVED_DECLARED":
            view = {"tupleKey": p["tupleKey"], "reviewer": p["reviewer"]}
            if p["reviewer"] == requester_id:
                view["recordRefs"] = json.loads(json.dumps(p["recordRefs"]))
            return view
        if et in ("CLAIM_ADJUDICATED", "CLAIM_PROVENANCE_VERIFIED"):
            view = {"tupleKey": p["tupleKey"], "reviewer": p["reviewer"],
                    "claimType": p["claimType"], "claimId": p["claimId"]}
            if p["reviewer"] == requester_id:
                view["prerequisites"] = json.loads(
                    json.dumps(p["prerequisites"]))
            return view
        if et == "EVIDENCE_RECORD_ISSUED":
            return json.loads(json.dumps(p))
        return {"eventType": et}  # pragma: no cover

    def events(self, requester_id=None):
        """Append-only event history under the OD-37 scoped-disclosure
        boundary (F-1/F-10/F-17/F-19/F-31/F-33 as corrected by F-37).

        - requester_id None (anonymous): one fixed withheld aggregate. No
          per-event chronology, counts or chain material (F-28).
        - CUSTODIAN: scoped projections of the tuples under their OWN
          custody (F-19 substance), plus their own registration and
          GENESIS. Foreign tuples and foreign registrations are omitted
          entirely; envelope seq/eventId/t/hashes are never attached and
          clock-bearing fields are scope-local references (F-37/OD-37).
        - Every other role: foreign procedural events are omitted while the
          requester has not sealed that tuple (F-31/F-33). The visible list
          uses a local ordinal and does not carry global seq, eventId or
          tick, so omitted events leave no gap. Own submissions stay
          visible. After the requester's own seal, the redacted projections
          apply, including Lane B content (F-10).
        """
        if requester_id is None:
            return [{"disclosure": "ANONYMOUS_METADATA_WITHHELD",
                     "reason": "anonymous event chronology can reveal "
                               "tuple-specific procedural progress in a "
                               "single-tuple or inferable session (F-28); "
                               "authorized requesters receive scoped views",
                     "sessionSyntheticOnly": True}]
        _require_synthetic_actor_in(self._ix, requester_id)
        role = self._ix["actors"][requester_id]
        visible = []
        for e in self._events:
            et, p, t = e["eventType"], e["payload"], e["t"]
            if not self._may_observe_event(requester_id, role, e):
                continue
            if role == "CUSTODIAN":
                payload = self._custodian_projection(et, p, t, requester_id)
            else:
                payload = self._projected_payload(et, p, t, requester_id)
            visible.append({
                "localOrdinal": len(visible) + 1,
                "eventType": et,
                "payload": payload,
            })
        return visible

    def custody_view(self, custodian_id, tuple_key):
        """Full custody/audit view of one tuple, restricted to the tuple's
        custodian (F-1 explicit custody context). F-37/OD-37: every clock
        value in the view is a scope-local reference; no session-global
        tick, count or chain material is disclosed. CORR7/F-41: uniform
        custody gate."""
        _require_tuple_key_form(tuple_key)
        tup = _require_custodian_uniform_in(self._ix, tuple_key, custodian_id)
        seals = []
        for (tk, reviewer) in sorted(self._ix["seals"], key=lambda k: k[1]):
            if tk != tuple_key:
                continue
            seal = self._ix["seals"][(tk, reviewer)]
            seals.append({
                "reviewer": reviewer,
                "packetSha": seal["packetSha"],
                "sealedBytesSha": seal["sealedBytesSha"],
                "sealedAt": self._scope_ref(custodian_id, tuple_key,
                                            seal["sealedAt"]),
                "sealedPayload": json.loads(json.dumps(seal["sealedPayload"])),
                "sealTimeContamination": self._disclosed_contamination(
                    custodian_id, tuple_key, seal["contamination"]),
                "effectiveContamination": self._disclosed_contamination(
                    custodian_id, tuple_key,
                    _contamination_snapshot_in(self._ix, tuple_key, reviewer)),
            })
        packets = [
            {"reviewer": reviewer, "packetSha": pkts[-1]["packetSha"],
             "issuedAt": self._scope_ref(custodian_id, tuple_key,
                                         pkts[-1]["issuedAt"]),
             "phase": pkts[-1]["phase"],
             "issuanceCount": len(pkts)}
            for (tk, reviewer), pkts in sorted(self._ix["packets"].items(),
                                               key=lambda kv: kv[0][1])
            if tk == tuple_key
        ]
        exposure_actors = _exposure_actors_in(self._ix, tuple_key)
        return {
            "tupleKey": tuple_key,
            "tupleId": json.loads(json.dumps(tup["tupleId"])),
            "canonicalHashInput": tup["canonicalHashInput"],
            "custodyMarks": dict(tup["custodyMarks"]),
            "retrospectiveRecords": json.loads(
                json.dumps(tup["retrospectiveRecords"])),
            "packets": packets,
            "seals": seals,
            "receipts": {r: self._scope_ref(custodian_id, tuple_key, tick)
                         for (tk, r), tick in self._ix["receipts"].items()
                         if tk == tuple_key},
            "reveals": {r: self._scope_ref(custodian_id, tuple_key, tick)
                        for (tk, r), tick in self._ix["reveals"].items()
                        if tk == tuple_key},
            "deltas": [{"reviewer": d[1], "delta": d[2],
                        "at": self._scope_ref(custodian_id, tuple_key, d[3])}
                       for d in self._ix["deltas"] if d[0] == tuple_key],
            "incidents": {
                actor: [dict(entry,
                             occurredAtTick=(
                                 None if entry.get("occurredAtTick") is None
                                 else self._scope_ref(custodian_id, tuple_key,
                                                      entry["occurredAtTick"])),
                             reportedTick=self._scope_ref(custodian_id,
                                                          tuple_key,
                                                          entry["reportedTick"]))
                        for entry in incs]
                for actor, incs
                in self._ix["incidents"].get(tuple_key, {}).items()},
            "effectiveContaminationByActor": {
                actor: self._disclosed_contamination(
                    custodian_id, tuple_key,
                    _contamination_snapshot_in(self._ix, tuple_key, actor))
                for actor in sorted(exposure_actors)},
            "adjudications": [
                dict(json.loads(json.dumps(
                    {k: v for k, v in a.items() if k != "tick"})),
                    at=self._scope_ref(custodian_id, tuple_key, a["tick"]))
                for a in self._ix["adjudications"] if a["tupleKey"] == tuple_key],
            "provenanceVerifications": [
                dict(json.loads(json.dumps(
                    {k: v for k, v in a.items() if k != "tick"})),
                    at=self._scope_ref(custodian_id, tuple_key, a["tick"]))
                for a in self._ix["provenance"] if a["tupleKey"] == tuple_key],
            "provenanceAttestationCount": len(
                [a for a in self._ix["provenance"]
                 if a["tupleKey"] == tuple_key]),
            "distinctBoundPropositionCount": len(
                [k for k, v in self._ix["propositions"].items()
                 if v["tupleKey"] == tuple_key]),
            "evidenceRecords": json.loads(json.dumps(
                [r for r in self._ix["evidence_records"]
                 if r["tupleKey"] == tuple_key])),
            "status": self.workflow_status(tuple_key, custodian_id),
        }

    def lane_b_view(self, requester_id, tuple_key):
        """Lane B submission view (F-1/F-10, F-39/OD-39). CORR7/F-40:
        authorization is decided BEFORE any existence-dependent lookup, and
        the refusal for every requester without a lawful Lane B relationship
        is ONE constant shape — identical whether the tuple is unregistered
        or foreign and whether or not foreign submissions exist, so no
        foreign-submission or registration-status oracle remains. The
        tuple's custodian and an already-sealed reviewer receive the
        tuple's submissions (an empty list when there are none); a
        registering R_LB receives only their own. Registration grants no
        tuple status (F-32) and causeLink stays UNASSIGNED_PENDING_J1."""
        _require_tuple_key_form(tuple_key)
        _require_synthetic_actor_in(self._ix, requester_id)
        tup = self._ix["tuples"].get(tuple_key)
        sealed = (tuple_key, requester_id) in self._ix["seals"]
        custodian = tup is not None and tup["custodian"] == requester_id
        own = [r for (tk, sid), r in sorted(self._ix["lane_b"].items())
               if tk == tuple_key and r["reviewer"] == requester_id]
        if not (custodian or sealed or own):
            raise EFCAGateError(
                "REFUSED_LANE_B_ACCESS",
                "no Lane B material is visible to this requester for this "
                "tuple (S28/F-1/F-10/F-39/F-40)")
        if custodian or sealed:
            records = [r for (tk, sid), r in sorted(self._ix["lane_b"].items())
                       if tk == tuple_key]
        else:
            records = own
        submissions = []
        for r in records:
            submissions.append({
                "submissionId": r["submissionId"],
                "reviewer": r["reviewer"],
                "question": r["question"],
                "surface": r["surface"],
                "schemaClaim": r["schemaClaim"],
                "causeLink": r["causeLink"],
                "registeredAt": self._scope_ref(requester_id, tuple_key,
                                                r["registeredAtTick"]),
            })
        return {"tupleKey": tuple_key, "submissions": submissions}

    # ---------------- integrity and persistence (E9, F-9, F-14) ----------

    def _constant_diagnostic(self, ok):
        """OD-37/F-37: integrity diagnostics are constant for EVERY
        requester. The session-global eventCount and any seq-bearing failure
        reason are leak channels (they reveal foreign procedural activity
        directly or indirectly) and are never returned to a requester;
        detailed chain diagnostics exist only on the engine-host channel.
        (Supersedes F-30's custodian eventCount.)"""
        return {"valid": bool(ok), "reason": "ok" if ok else "integrity_failure"}

    def verify_integrity(self, requester_id=None):
        if requester_id is not None:
            _require_synthetic_actor_in(self._ix, requester_id)
        ok, _reason = verify_chain(self._events)
        return self._constant_diagnostic(ok)

    def _require_scratch_path(self, path):
        """F-14: every public file operation is bounded to the configured
        synthetic scratch directory. The engine exposes no general-purpose
        file reader."""
        target = Path(path).resolve()
        base = self.scratch_dir.resolve()
        if base != target and base not in target.parents:
            raise EFCAGateError(
                "PATH_ESCAPE_REJECTED",
                "the session may read and write only inside its configured "
                "synthetic scratch directory (%s); reading arbitrary "
                "project paths is not a supported operation (F-14)" % base,
            )
        return target

    def _session_dir(self, part):
        target = self.scratch_dir.resolve() / self.session_token / part
        target.mkdir(parents=True, exist_ok=True)
        return target

    @staticmethod
    def _resolve_bare_name(name):
        if not isinstance(name, str) or not name:
            raise EFCAGateError("INVALID_PAYLOAD", "history file name required")
        if "/" in name or "\\" in name or name in (".", ".."):
            raise EFCAGateError("PATH_ESCAPE_REJECTED",
                                "history file name must be a bare file name")
        return name

    def _host_history_path(self, name):
        """CORR7/F-43: the authoritative host-chain namespace, physically
        separate from requester projections; a public projection can never
        reserve, shadow or block a host-backup filename and vice versa."""
        return self._session_dir("host_chain") / self._resolve_bare_name(name)

    def _projection_path(self, actor_id, name):
        """CORR7/F-42: per-actor projection namespace inside the session.
        Filename selection, collisions (PROJECTION_EXISTS) and polling are
        actor-local and cannot reveal or interfere with another actor's
        exports."""
        base = self._session_dir("projections") / actor_id
        base.mkdir(parents=True, exist_ok=True)
        base = base.resolve()
        target = (base / self._resolve_bare_name(name)).resolve()
        if base not in target.parents:
            raise EFCAGateError("PATH_ESCAPE_REJECTED",
                                "projection path escapes the actor directory")
        return target

    def persist_history(self, name, requester_id=None):
        """REQUESTER-SCOPED persistence (OD-37/F-37). Emits ONLY a marked
        scoped projection artifact — the requester's own scoped view, with
        no global chain material (no seq, eventId, ticks, chain hashes or
        session-global counts). The artifact declares explicitly that it is
        NOT a complete global-chain proof and NOT an authoritative chain
        backup, and it is never accepted as one (verify_persisted_history
        accepts only projections; restore_global_history accepts only
        chain artifacts). A registered requester is required; anonymous
        exports are refused. Re-exporting an identical projection is
        idempotent; a diverging file at the same path is refused.
        CORR7/F-42/F-43: the artifact is written into the requester's OWN
        projection namespace (projections/<actorId>/ inside the session
        directory), physically separate from the engine-host chain
        namespace; no other actor's filename selection, collision or poll
        can observe or affect it."""
        if requester_id is None:
            raise EFCAGateError(
                "UNKNOWN_ACTOR",
                "a scoped projection is exported for a registered requester "
                "only; anonymous exports are refused (OD-37/F-37)")
        _require_synthetic_actor_in(self._ix, requester_id)
        role = self._ix["actors"][requester_id]
        target = self._projection_path(requester_id, name)
        document = {
            "artifactClass": PROJECTION_ARTIFACT_CLASS,
            "engineActId": ENGINE_ACT_ID,
            "generatedFor": {"actorId": requester_id, "role": role},
            "sessionLabel": self.session_label,
            "completeGlobalChainProof": False,
            "authoritativeChainBackup": False,
            "scopeNote": (
                "a scoped projection is not a complete global-chain proof "
                "and must not be accepted as an authoritative chain backup; "
                "the authoritative chain is persisted only through the "
                "engine-host durability channel (OD-37/F-37)"),
            "scopedEvents": self.events(requester_id),
        }
        data = json.dumps(document, sort_keys=True, separators=(",", ":"),
                          ensure_ascii=False)
        if target.exists():
            existing = target.read_text(encoding="utf-8")
            if existing != data:
                raise EFCAGateError(
                    "PROJECTION_EXISTS",
                    "a different scoped projection already exists at this "
                    "path; projections are append-only evidence and are not "
                    "silently replaced")
        with open(target, "w", encoding="utf-8") as fh:
            fh.write(data)
        return {"path": str(target),
                "artifactClass": PROJECTION_ARTIFACT_CLASS,
                "completeGlobalChainProof": False,
                "authoritativeChainBackup": False}

    def verify_persisted_history(self, path, requester_id=None):
        """REQUESTER-SCOPED read-only diagnostic (OD-37/F-37/F-14).
        Accepts only this requester's own marked scoped-projection artifact;
        a complete-chain artifact is never accepted through a
        requester-scoped path and never treated as a chain backup. The
        response is constant (valid/ok or a generic reason); no counts,
        chain material or seq-bearing reasons are disclosed.
        CORR7/F-42: ONE constant negative shape for every artifact that is
        not the requester's own lawful projection — absent, unparseable,
        another actor's projection or a chain artifact — so existence at a
        guessed path is not observable."""
        if requester_id is None:
            raise EFCAGateError(
                "UNKNOWN_ACTOR",
                "a scoped projection is verified for a registered requester "
                "only; anonymous verification is refused (OD-37/F-37)")
        _require_synthetic_actor_in(self._ix, requester_id)
        target = self._require_scratch_path(path)
        try:
            document = json.loads(target.read_text(encoding="utf-8"))
        except (ValueError, OSError):
            return {"valid": False, "reason": "not_a_lawful_projection"}
        ok = (isinstance(document, dict)
              and document.get("artifactClass") == PROJECTION_ARTIFACT_CLASS
              and isinstance(document.get("generatedFor"), dict)
              and document["generatedFor"].get("actorId") == requester_id
              and isinstance(document.get("scopedEvents"), list)
              and document.get("completeGlobalChainProof") is False
              and document.get("authoritativeChainBackup") is False)
        return {"valid": bool(ok),
                "reason": "ok" if ok else "not_a_lawful_projection"}

    # ---------------- ENGINE-HOST durability channel (OD-37/F-37) --------
    #
    # These operations are the offline engine host's durability surface:
    # they carry NO requester parameter, are reachable through NO
    # requester-scoped operation, and grant NO actor visibility (the trust
    # model already places the host process outside the actor boundary).
    # Detailed diagnostics on this channel must never be relayed to actors.

    def persist_global_history(self, name):
        """ENGINE-HOST durability: persist the COMPLETE authoritative
        append-only chain as JSONL under the session's own namespace. The
        F-9 overwrite discipline is preserved: an existing file must
        chain-verify, belong to this session lineage and be a prefix of the
        current chain; foreign lineage, a stale writer, truncated and
        tampered files fail closed. This artifact is the authoritative
        chain backup and is never produced or accepted by requester-scoped
        paths. CORR7/F-43: written to the dedicated host_chain/ namespace,
        physically separate from requester projections."""
        target = self._host_history_path(name)
        if target.exists():
            existing = _read_event_lines(target)
            ok, reason = verify_chain(existing)
            if not ok:
                raise EFCAGateError(
                    "PERSIST_FILE_INVALID",
                    "existing history file fails chain verification "
                    "(%s); refusing to touch it" % reason,
                )
            cur = self._events
            if existing[0] != cur[0]:
                raise EFCAGateError(
                    "PERSIST_LINEAGE_MISMATCH",
                    "the existing file belongs to a different session "
                    "lineage; a session must not silently replace "
                    "another session's persisted history (F-9)",
                )
            n_file, n_cur = len(existing), len(cur)
            if n_file > n_cur and existing[:n_cur] == cur:
                raise EFCAGateError(
                    "PERSIST_STALE_WRITER",
                    "the existing file is a verified extension ahead of "
                    "this session's chain; restore it before persisting "
                    "(stale writer, F-9)",
                )
            if existing[:n_file] != cur[:n_file]:
                raise EFCAGateError(
                    "PERSIST_LINEAGE_MISMATCH",
                    "the existing file diverges from this session's chain "
                    "within the same lineage; incompatible state fails "
                    "closed (F-9)",
                )
        with open(target, "w", encoding="utf-8") as fh:
            for ev in self._events:
                fh.write(json.dumps(ev, sort_keys=True, separators=(",", ":"),
                                    ensure_ascii=False) + "\n")
        return {"path": str(target),
                "artifactClass": CHAIN_ARTIFACT_CLASS,
                "engineActId": ENGINE_ACT_ID,
                "allocationAuthorityMode": self._authority.mode,
                "sessionToken": self.session_token,
                "eventCount": len(self._events)}

    def verify_global_history(self, path):
        """ENGINE-HOST read-only envelope verification with a detailed
        reason. Semantic (procedural) validity requires
        restore_global_history — a chain that verifies here is not yet
        proven procedurally lawful (F-7)."""
        target = self._require_scratch_path(path)
        try:
            events = _read_event_lines(target)
        except EFCAGateError as exc:
            return {"valid": False, "reason": exc.code + ": " + str(exc),
                    "eventCount": None}
        ok, reason = verify_chain(events)
        return {"valid": ok, "reason": reason, "eventCount": len(events)}

    def restore_global_history(self, path):
        """ENGINE-HOST recovery: adopt the authoritative chain only if it
        (1) chain-verifies, (2) is a NATIVE CORR9 history — the genesis
        names this engine act; legacy and foreign lineages (including the
        immutable CORR5–CORR8 predecessors) are refused and schema-version
        selection never allows a mixed-version live transition
        (guardrail), (3) declares the SAME effective allocation-authority
        context as this session — the GENESIS (mode, digest) pair must
        equal this session's derived pair, so an OWNER_PINNED chain
        replays only against an OWNER_PINNED context and a simulation
        chain only against its matching simulation context, even when the
        allocation bytes and digest are identical (OD-45-A/F-45); a
        mismatch refuses restoration WITHOUT partial state adoption,
        (4) passes the SAME per-event semantic transition validation as
        live execution (F-7/F-8/F-13/F-15, F-38/F-39 and the F-45
        entitlement/digest checks), and (5) verifiably extends the current
        chain (F-9 lineage rules)."""
        target = self._require_scratch_path(path)
        events = _read_event_lines(target)
        if (events and isinstance(events[0], dict)
                and events[0].get("artifactClass") == PROJECTION_ARTIFACT_CLASS):
            raise EFCAGateError(
                "PROJECTION_IS_NOT_A_CHAIN",
                "a scoped projection is never accepted as an authoritative "
                "chain backup (compatibility guardrail)")
        ok, reason = verify_chain(events)
        if not ok:
            raise EFCAGateError("HASH_CHAIN_INVALID", reason)
        act_id = None
        if isinstance(events[0].get("payload"), dict):
            act_id = events[0]["payload"].get("engineActId")
        if act_id == LEGACY_ENGINE_ACT_ID:
            raise EFCAGateError(
                "LEGACY_HISTORY_NOT_ADOPTABLE",
                "a legacy CORR5 history is admitted only through "
                "replay_legacy_history for read-only integrity and semantic "
                "replay; it is never adopted, never extended by CORR6 "
                "events and never upgraded to CORR6 proposition identities "
                "(compatibility guardrail)")
        if act_id != ENGINE_ACT_ID:
            raise EFCAGateError(
                "NOT_A_NATIVE_HISTORY",
                "the restored chain must be a native history of this engine "
                "act (%s); the immutable CORR5–CORR8 predecessors and every "
                "other foreign lineage are refused (compatibility "
                "guardrail)" % ENGINE_ACT_ID)
        # CORR9/OD-45-A: the effective trusted construction context check
        # runs BEFORE any replay, and nothing is adopted on mismatch. The
        # (mode, digest) PAIR is compared — byte-identical allocation bytes
        # do not make the modes interchangeable.
        chain_mode = events[0]["payload"].get("allocationAuthorityMode")
        chain_digest = events[0]["payload"].get("allocationsSha256")
        auth = self._authority
        if chain_mode != auth.mode or chain_digest != auth.digest:
            raise EFCAGateError(
                "AUTHORITY_CONTEXT_MISMATCH",
                "the restored chain's allocation-authority context "
                "(mode=%r) does not match this session's effective "
                "construction context (mode=%r); owner-pinned and "
                "simulation histories are never interchangeable, including "
                "when the allocation bytes and digest are identical "
                "(OD-45-A/F-45)" % (chain_mode, auth.mode))
        replay_ix = _fresh_index()
        try:
            for ev in events:
                _check_transition(ev, replay_ix, self._ctx, version="CORR9")
                _index_event(ev, replay_ix, version="CORR9")
        except EFCAGateError as exc:
            raise EFCAGateError(
                "PROCEDURALLY_INVALID_HISTORY",
                "the history chains cryptographically but contains a "
                "transition that is not procedurally lawful: %s: %s "
                "(F-7/F-8/F-13/F-15: a forged event with a valid SHA-256 is "
                "not an authorized event)" % (exc.code, exc),
            ) from exc
        cur = self._events
        if len(events) < len(cur) or events[:len(cur)] != cur:
            if events and cur and events[0] != cur[0]:
                raise EFCAGateError(
                    "STALE_SESSION_REJECTED",
                    "the restored history belongs to a different session "
                    "lineage (foreign genesis)",
                )
            raise EFCAGateError(
                "STALE_SESSION_REJECTED",
                "the restored history is not a verified extension of the "
                "current chain (stale/truncated session state)",
            )
        self._events = list(events)
        self._ix = replay_ix
        return {"restored": True, "eventCount": len(events),
                "engineActId": ENGINE_ACT_ID,
                "allocationAuthorityMode": self._authority.mode}

    def replay_legacy_history(self, path):
        """ENGINE-HOST read-only legacy admission (compatibility guardrail).
        A genuine CORR5 history (genesis act CORR5, engine SHA
        e4118af9...) is verified and semantically replayed under the FROZEN
        CORR5 rule-set and classified as legacy. Original bytes are read
        only and are preserved byte-for-byte. The chain is never adopted,
        never extended, never indexed for complete propositions and never
        upgraded; legacy provenance remains mechanical provenance
        (PROVENANCE_VERIFIED_NOT_ADJUDICATED) and legacy Lane B records
        cannot be referenced by any CORR6 delivery. The regression suite
        differentially verifies this rule-set against the physically pinned
        CORR5 engine."""
        target = self._require_scratch_path(path)
        events = _read_event_lines(target)
        if (events and isinstance(events[0], dict)
                and events[0].get("artifactClass") == PROJECTION_ARTIFACT_CLASS):
            raise EFCAGateError(
                "PROJECTION_IS_NOT_A_CHAIN",
                "a scoped projection is never accepted as a chain artifact "
                "(compatibility guardrail)")
        ok, reason = verify_chain(events)
        if not ok:
            raise EFCAGateError("HASH_CHAIN_INVALID", reason)
        act_id = None
        if isinstance(events[0].get("payload"), dict):
            act_id = events[0]["payload"].get("engineActId")
        if act_id != LEGACY_ENGINE_ACT_ID:
            raise EFCAGateError(
                "NOT_A_LEGACY_HISTORY",
                "legacy admission serves the frozen CORR5 lineage only "
                "(genesis act %s)" % LEGACY_ENGINE_ACT_ID)
        legacy_ix = _fresh_index()
        try:
            for ev in events:
                _check_transition(ev, legacy_ix, self._ctx, version="LEGACY")
                _index_event(ev, legacy_ix, version="LEGACY")
        except EFCAGateError as exc:
            raise EFCAGateError(
                "LEGACY_HISTORY_INVALID",
                "the legacy history chains cryptographically but contains a "
                "transition that is not lawful under the frozen CORR5 "
                "rule-set: %s: %s" % (exc.code, exc),
            ) from exc
        return {
            "legacyHistory": True,
            "engineActId": act_id,
            "engineSha256": LEGACY_ENGINE_SHA256,
            "integrityValid": True,
            "eventCount": len(events),
            "legacyClassified": True,
            "adopted": False,
            "extendable": False,
            "propositionsIndexed": 0,
            "note": "read-only legacy admission under the frozen CORR5 "
                    "semantics; the history is never extended by CORR6 "
                    "events and is never upgraded to CORR6 proposition "
                    "identities (compatibility guardrail)",
        }


def _read_event_lines(path):
    """Module-private JSONL reader; reachable publicly only after the
    session scratch-boundary check (F-14)."""
    events = []
    with open(path, "r", encoding="utf-8") as fh:
        for lineno, line in enumerate(fh, 1):
            line = line.strip()
            if not line:
                raise EFCAGateError("HASH_CHAIN_INVALID",
                                    "blank line %d (truncated history?)" % lineno)
            try:
                events.append(json.loads(line))
            except ValueError as exc:
                raise EFCAGateError("HASH_CHAIN_INVALID",
                                    "unparseable line %d: %s" % (lineno, exc))
    return events
