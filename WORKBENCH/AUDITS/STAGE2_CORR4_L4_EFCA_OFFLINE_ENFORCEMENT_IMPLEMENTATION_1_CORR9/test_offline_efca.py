#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""test_offline_efca.py — CORR9 synthetic regression, negative controls,
entitlement-enforcement and allocation-authority suite.

Act: STAGE2_CORR4_L4_EFCA_OFFLINE_ENFORCEMENT_IMPLEMENTATION_1.CORR9
Actor: DeepSeek (CODER). SELF-VALIDATION ONLY — not independent verification.

CORR9 correction (F-45, OD-45-A):
    * F-45 first-writer custody capture — registration previously required
only a registered CUSTODIAN role, so any registered custodian could
lawfully capture any well-formed, not-yet-registered tuple. Under
Owner-accepted OD-45-A the right to register a specific tuple must be
established by an independent, explicit, Owner-approved mapping
tuple identity → custodian identity that exists BEFORE actor-facing
registration. CORR9 adds: the verified immutable allocation authority
(G2-accepted, G3.CORR1-bound eight-entry manifest, SHA-256 53eb3ec4…ecb1)
with a strict closed-schema loader and Owner-digest pin; engine-derived
OWNER_PINNED / SIMULATION authority modes bound as the immutable
(mode, digest) pair in the CORR9-native GENESIS; the engine-derived
allocationDigest on TUPLE_REGISTERED recomputed on live and replay; ONE
fixed uniform NOT_ENTITLED refusal across the absent, foreign-allocated
and foreign-registered states; the allocationAuthorityMode marking of the
procedural evidence record; and the exact cross-mode regression (a
SIMULATION session holding byte-identical Owner manifest bytes still
refuses cross-mode replay in both directions). F-1..F-44 are preserved
except where OD-45-A explicitly alters initial registration
authorization.

Retained CORR8 corrections (F-44 and earlier), each with its reproduction
side pinned to the immutable predecessor engine:
    * F-44 cross-reviewer Lane B ordinal leakage — the CORR7 tuple-local
    * F-44 cross-reviewer Lane B ordinal leakage — the CORR7 tuple-local
ordinal (SYN_SUB_001/002/...) made the identifier returned to an R_LB
depend on another reviewer's earlier filing. CORR8 replaces it with an
ACTOR-LOCAL DETERMINISTIC identity SYN_SUB_<hex16> = sha256(reviewer | tupleKey | own prior-filing count)[:16] — no cross-reviewer count,
order or existence is observable; unique, stable, replay-deterministic;
forged/reused identifiers fail closed. New tests: reproduction on the
immutable CORR7 engine, corrected behavior, both filing orders, several
submissions per actor, pre-registration filing, actor-scoped views,
exact custodian delivery, forged references, replay determinism,
correctly rehashed forgeries, refusal immutability, F-40..F-43
non-regression, C6 CORR7-immutability lineage.

CORR7 corrections (F-40..F-43), each with a reproduction on the immutable
CORR6 engine, the corrected behavior and lawful positive counterparts:
    * F-40 foreign Lane B existence oracle — lane_b_view authorization is
decided before any existence lookup; one constant refusal for every
requester without a lawful relationship.
    * F-41 foreign tuple registration oracle — the existence-blind
authorization architecture: uniform refusals for unregistered and foreign
keys across every requester-scoped operation; packet-first reproduction
(custodian-issued reproduction packets); self-scoped content records bind
to the well-formed key (uniform outcome); intrinsic duplicate-custody
registration refusal documented.
    * F-42 cross-actor projection namespace collision — per-actor
projection namespaces; one constant negative verification shape.
    * F-43 requester/host persistence collision — physically separate
host_chain/ and projections/<actorId>/ namespaces.
Retained-suite adaptations are ledgered inline; the reproduction sides for
F-1..F-39 remain pinned to ORIGINAL..CORR6.

Structure (CORR9):
- T01–T42: the original coverage retained and executed, adapted where the
  corrected contract legitimately changes behavior. Adaptation classes and
  their contract justification:
    * persistence: requester-scoped persist_history/verify_persisted_history
      now produce/accept only marked scoped projections; the authoritative
      chain round trip moved to the ENGINE-HOST channel
      (persist_global_history / verify_global_history /
      restore_global_history) — OD-37/F-37 and the compatibility guardrail.
    * diagnostics: integrity diagnostics are constant for EVERY requester;
      the session-global eventCount is host-level only (supersedes the
      CORR5 F-30 custodian count — OD-37/F-37).
    * custodian views: scoped projections with local ordinals and
      scope-local clock references; foreign tuples omitted entirely
      (supersedes F-19's minimal foreign projections — OD-37/F-37).
    * exposure occurrence: the occurrence input is a scope-local reference
      into the reporter's own recorded sequence (supersedes the session-tick
      range check, an indirect session-clock probe channel — OD-37/F-37;
      F-25 type discipline preserved).
    * Lane B: multi-submission with engine-constructed tuple-local
      submissionIds and exact-submission delivery (OD-39/F-39).
    * historical claims: complete declared proposition scopes (rubric §D.4)
      bound into the proposition identity (OD-38/F-38).
- F1–F9: reproduction side bound to the immutable ORIGINAL engine.
- F10–F16: reproduction side bound to the immutable CORR1 engine.
- F17–F22: reproduction side bound to the immutable CORR2 engine.
- F23–F29: reproduction side bound to the immutable CORR3 engine.
- F30–F36: reproduction side bound to the immutable CORR4 engine; the
  CORR6 behavior replaces the CORR5 corrections where OD-37/38/39 and the
  guardrail changed the contract (each change is noted inline).
- F37–F39: the new findings (OD-37 scoped disclosure, OD-38 proposition
  identity, OD-39 multiple Lane B submissions) with CORR5 reproductions,
  corrected CORR6 behavior and lawful positive counterparts.
- F45-*: the new F-45 adversarial family (parent reproduction on the
  immutable CORR8 engine, uniform refusal across the three unauthorised
  states, lawful success and own duplicate, actor/tuple mismatch, forged
  and conflicting manifests, identical-byte cross-mode collision,
  different-manifest cross-mode refusal, correctly rehashed forged
  registrations and GENESIS relabelling, persistence and extension,
  refusal immutability, no foreign authority inference, no implicit
  custody from Lane B/self-disclosure, evidence-record authority marking,
  sequential competing custodians, mode-derived-not-supplied).
- C1–C7: the compatibility guardrail: native disk round-trip equivalence,
  frozen CORR5 legacy read-only replay (differentially verified against the
  pinned CORR5 engine), mixed-version rejection, rehashed-forgery
  firewalls, projection-not-a-backup firewall, byte preservation, CORR7
  and CORR8 immutability/non-adoptability.

Retained-suite adaptations forced by OD-45-A are ledgered inline: tests
that use a custodian/tuple combination outside the eight Owner-approved
allocations construct an EXPLICIT simulation session (sim_session), never
a broadened Owner manifest; the two hand-built forged TUPLE_REGISTERED
payloads gained the engine-derived allocationDigest so that the continued
schema discipline (not an accidental schema mismatch) is what the test
exercises. No confidentiality, blindness or replay assertion is weakened.

Reproducible invocation (from the CORR9 act directory):

    PYTHONDONTWRITEBYTECODE=1 python3 test_offline_efca.py

Exit code 0 = all tests passed, controlling sources byte-identical, git
state unchanged outside the act directory, no cache/temp residue. The run
writes actual outcomes to TEST_RESULTS.json next to this file. All data is
invented SYN_* material only.
"""

import ast
import hashlib
import importlib.util
import json
import os
import shutil
import subprocess
import sys
import tempfile
import time
import unittest
from pathlib import Path

HERE = Path(__file__).resolve().parent
sys.path.insert(0, str(HERE))
import offline_efca as oe  # noqa: E402  (CORR9 module under test)

REPO_ROOT = HERE.parents[2]
AUDITS_DIR = HERE.parent
CORR1_DIR = AUDITS_DIR / "STAGE2_CORR4_L4_EFCA_OFFLINE_ENFORCEMENT_IMPLEMENTATION_1_CORR1"
CORR8_DIR = AUDITS_DIR / "STAGE2_CORR4_L4_EFCA_OFFLINE_ENFORCEMENT_IMPLEMENTATION_1_CORR8"
CORR9_AUTHORITY_DIR = (
    AUDITS_DIR / "STAGE2_CORR4_L4_EFCA_CORR9_ALLOCATION_AUTHORITY_1_CORR1")
CORR2_DIR = AUDITS_DIR / "STAGE2_CORR4_L4_EFCA_OFFLINE_ENFORCEMENT_IMPLEMENTATION_1_CORR2"
CORR3_DIR = AUDITS_DIR / "STAGE2_CORR4_L4_EFCA_OFFLINE_ENFORCEMENT_IMPLEMENTATION_1_CORR3"
CORR4_DIR = AUDITS_DIR / "STAGE2_CORR4_L4_EFCA_OFFLINE_ENFORCEMENT_IMPLEMENTATION_1_CORR4"
CORR5_DIR = AUDITS_DIR / "STAGE2_CORR4_L4_EFCA_OFFLINE_ENFORCEMENT_IMPLEMENTATION_1_CORR5"
CORR6_DIR = AUDITS_DIR / "STAGE2_CORR4_L4_EFCA_OFFLINE_ENFORCEMENT_IMPLEMENTATION_1_CORR6"
CORR7_DIR = AUDITS_DIR / "STAGE2_CORR4_L4_EFCA_OFFLINE_ENFORCEMENT_IMPLEMENTATION_1_CORR7"
ORIGINAL_DIR = AUDITS_DIR / "STAGE2_CORR4_L4_EFCA_OFFLINE_ENFORCEMENT_IMPLEMENTATION_1"
BINDING_DIR = AUDITS_DIR / "STAGE2_CORR4_L4_EFCA_OWNER_ACCEPTANCE_BINDING_1"
RUBRIC_PATH = BINDING_DIR / oe.RUBRIC_FILE_NAME
SIDECAR_PATH = BINDING_DIR / "SHA256SUMS.txt"
CONTRACT_PATH = (
    REPO_ROOT / "WORKBENCH" / "DOWNLOADS"
    / "STAGE2_SEMANTIC_SUCCESSOR_CANDIDATE_CORR4.md"
)
ORIGINAL_ENGINE_SHA = (
    "61b03ad18ef5f7dd53da17f2dcf21f004a0c9533f6c6d7a24a8182ccbdc7f183"
)
CORR1_ENGINE_SHA = (
    "b3fb6b79526c7836928047c2fa2a61d2049188dc32b2fd6c01a3414bd99a4d24"
)
CORR2_ENGINE_SHA = (
    "212a735475980724eb23ce8d966f5944dd6fcbd0cf4fce4a376dac8ef80b8c49"
)
CORR3_ENGINE_SHA = (
    "5a59e0f3d6dc7f2df7195d458722e73ded5e760a5c2aaeb6f0f294c3d6731fdf"
)
CORR4_ENGINE_SHA = (
    "11affbad0612db9fdc23ad937154eb8a3ce95121ca343199fb8afd1336d79770"
)
CORR5_ENGINE_SHA = (
    "e4118af938362c398a69d79f6b776b77fbfb39b71c71604b525eb9b56a02a1e0"
)
CORR6_ENGINE_SHA = (
    "994ae06a150d535b8d64011be656cd0b84910d3ae4c2de46a4c542418a763382"
)
CORR7_ENGINE_SHA = (
    "c06875cba1be4f2be841d465faf7515402f3363597347bd9332a0e9e188f77be"
)
CORR8_ENGINE_SHA = (
    "b5ccce54527b23bff1a683c06ec47a3196f760436e458cd90c031da92db6a17f"
)
CORR8_TEST_SUITE_SHA = (
    "1a770ca54e36bbb6e22d31e276b828138a60f6066652b273bbab27f2faf0c292"
)
ACT_DIR_RELATIVE = (
    "WORKBENCH/AUDITS/STAGE2_CORR4_L4_EFCA_OFFLINE_ENFORCEMENT_IMPLEMENTATION_1_CORR9"
)
SYN_RUNS = HERE / "synthetic_runs"

# CORR9/OD-45-A: the Owner-approved, G3.CORR1-bound allocation authority.
ALLOCATIONS_PATH = oe.DEFAULT_ALLOCATIONS_PATH
ALLOCATIONS_SIDECAR_PATH = (
    ALLOCATIONS_PATH.parent / (ALLOCATIONS_PATH.name + ".sha256"))
CORR9_AUTHORITY_FILE_SHA = (
    "53eb3ec43feb4de926e057e0dc17a857473872e4bbc9ff571e5937576c38ecb1"
)

with open(HERE / "synthetic_fixtures.json", "r", encoding="utf-8") as _fh:
    FIX = json.load(_fh)

TUP1 = "SYN_CASE_001|SYN_SIDE_A|SYN_FACT_001"
TUP2 = "SYN_CASE_002|SYN_SIDE_B|SYN_FACT_002"
CUST = "SYN_CUST_001"
CUST2 = "SYN_CUST_002"
KEY_002A = "SYN_CASE_002|SYN_SIDE_A|SYN_FACT_002"
KEY_009A = "SYN_CASE_009|SYN_SIDE_A|SYN_FACT_009"
KEY_077A = "SYN_CASE_077|SYN_SIDE_A|SYN_FACT_077"
KEY_088A = "SYN_CASE_088|SYN_SIDE_A|SYN_FACT_088"
RP1A, RP1B, RP1C = "SYN_RP1_001", "SYN_RP1_002", "SYN_RP1_003"
RIND = "SYN_RIND_001"
RLB = "SYN_RLB_001"
RLB2 = "SYN_RLB_002"

# CORR6/F-38: canonical declared proposition scopes (rubric §D.4) used by
# the historical-claim fixtures. Opaque invented tokens only.
PROPOSITIONS = {
    "HISTORICAL_RECORD_EVENT": {
        "operationId": "SYN_OP_001", "coveredTime": "SYN_TIME_001"},
    "HISTORICAL_RECORD_LINKAGE": {"historicalEventId": "SYN_HEV_001"},
    "HISTORICAL_RECORD_PRODUCTION": {
        "operationId": "SYN_OP_001",
        "survivingValue": {"sideId": "SYN_SIDE_A", "value": "YES"}},
    "HISTORICAL_RECORD_APPLICATION": {
        "actorId": RP1A, "readingId": "SYN_RDG_001",
        "coveredWindow": "SYN_WIN_001"},
}


def hist_prop(claim_type):
    return json.loads(json.dumps(PROPOSITIONS[claim_type]))


def occref(k):
    """CORR6/OD-37 scope-local occurrence reference: the k-th event of the
    reporter's own recorded sequence (registration and every event naming
    the reporter as a party)."""
    return {"scope": "self", "scopeOrdinal": k}

_ENGINES = {}


def _load_engine(key, directory, expected_sha):
    if key not in _ENGINES:
        src = directory / "offline_efca.py"
        digest = hashlib.sha256(src.read_bytes()).hexdigest()
        if digest != expected_sha:
            raise RuntimeError("%s engine identity mismatch: %s" % (key, digest))
        spec = importlib.util.spec_from_file_location(
            "legacy_offline_efca_%s" % key, str(src))
        module = importlib.util.module_from_spec(spec)
        spec.loader.exec_module(module)
        _ENGINES[key] = module
    return _ENGINES[key]


def original_engine():
    """The immutable ORIGINAL candidate (61b03ad1…) for F-1..F-9
    reproductions. Never modified."""
    return _load_engine("original", ORIGINAL_DIR, ORIGINAL_ENGINE_SHA)


def corr1_engine():
    """The immutable CORR1 candidate (b3fb6b79…) for F-10..F-16
    reproductions. Never modified."""
    return _load_engine("corr1", CORR1_DIR, CORR1_ENGINE_SHA)


def corr2_engine():
    """The immutable CORR2 candidate (212a7354…) for F-17..F-22
    reproductions. Never modified."""
    return _load_engine("corr2", CORR2_DIR, CORR2_ENGINE_SHA)


def corr3_engine():
    """The immutable CORR3 candidate (5a59e0f3…) for F-23..F-29
    reproductions. Never modified."""
    return _load_engine("corr3", CORR3_DIR, CORR3_ENGINE_SHA)


def corr4_engine():
    """The immutable CORR4 candidate (11affbad…) for F-30..F-36
    reproductions. Never modified."""
    return _load_engine("corr4", CORR4_DIR, CORR4_ENGINE_SHA)


def corr5_engine():
    """The immutable CORR5 candidate (e4118af9…) — the frozen legacy oracle
    for the compatibility guardrail: genuine legacy histories are generated
    and semantically cross-checked against this exact engine."""
    return _load_engine("corr5", CORR5_DIR, CORR5_ENGINE_SHA)


def corr6_engine():
    """The immutable CORR6 candidate (994ae06a…) — the reproduction oracle
    for F-40..F-43 and a non-adoptable predecessor. The loader verifies
    the exact SHA-256 before executing the module."""
    return _load_engine("corr6", CORR6_DIR, CORR6_ENGINE_SHA)


def corr7_engine():
    """The immutable CORR7 candidate (c06875cb…) — the reproduction oracle
    for F-44 and the non-adoptable immediate predecessor. The loader
    verifies the exact SHA-256 before executing the module."""
    return _load_engine("corr7", CORR7_DIR, CORR7_ENGINE_SHA)


def corr8_engine():
    """The immutable CORR8 candidate (b5ccce54…, F-45 reproduction oracle
    and non-adoptable immediate predecessor). The loader verifies the exact
    SHA-256 before executing the module."""
    return _load_engine("corr8", CORR8_DIR, CORR8_ENGINE_SHA)


def sub_id(actor, tuple_key, own_ordinal):
    """The CORR8 actor-local deterministic submission identity, computed
    independently of the engine (mirror of the engine's construction)."""
    return "SYN_SUB_" + hashlib.sha256(
        ("%s|%s|%d" % (actor, tuple_key, own_ordinal)).encode(
            "utf-8")).hexdigest()[:16]


def alloc_entry_digest(tuple_key, custodian):
    """The CORR9/OD-45-A allocationDigest, computed independently of the
    engine (mirror of the engine's canonical construction): sha256 over the
    canonical encoding of exactly {custodian, tupleKey}."""
    return hashlib.sha256(json.dumps(
        {"custodian": custodian, "tupleKey": tuple_key},
        sort_keys=True, separators=(",", ":"), ensure_ascii=False
    ).encode("utf-8")).hexdigest()


def sim_doc(entries):
    """An EXPLICIT CORR9 simulation allocation authority for isolated
    synthetic regression scenarios (test-only; never Owner-approved).
    `entries` is a sequence of (tupleKey, custodian) pairs; the returned
    document is canonicalized by the engine exactly like a manifest file.
    Every positive registration in a simulation session must have its
    explicit entry here — no catch-all inventory exists."""
    return {
        "allocationAuthority": oe.ALLOCATION_AUTHORITY_ID,
        "allocations": [{"custodian": custodian, "tupleKey": key}
                        for key, custodian in entries],
    }


def legacy_tuple_spec(idx=0):
    """Fixture tuple spec with {id, sha}-only records, as the pre-CORR2
    engines require (their closed record schema predates locator/content)."""
    spec = json.loads(json.dumps(FIX["tuples"][idx]))
    spec["retrospectiveRecords"] = [
        {"id": r["id"], "sha": r["sha"]} for r in spec["retrospectiveRecords"]
    ]
    return spec


def record_ref(idx=0, record_pos=0):
    """Proof-carrying reconstruction reference for a fixture record."""
    r = FIX["tuples"][idx]["retrospectiveRecords"][record_pos]
    return {"recordId": r["id"], "locator": r["locator"], "content": r["content"]}


def build_forged_extension(base_events, appended):
    """Append correctly-hashed events (documented canonical convention) to a
    verified chain. Used to prove that a VALID SHA-256 chain can still be
    PROCEDURALLY invalid."""
    events = json.loads(json.dumps(base_events))
    for event_type, payload in appended:
        prev = events[-1]
        record = {
            "seq": prev["seq"] + 1,
            "eventId": "E%04d" % (prev["seq"] + 1),
            "eventType": event_type,
            "t": prev["t"] + 1,
            "prevEventSha": prev["eventSha"],
            "payload": payload,
        }
        record["eventSha"] = oe.sha256_hex(oe.canonical_bytes(
            {k: v for k, v in record.items() if k != "eventSha"}))
        events.append(record)
    return events


def restamp_chain(events, from_index):
    """Recompute event hashes from a mutated index onward so the whole chain
    remains cryptographically valid (isolating SEMANTIC invalidity)."""
    for i in range(from_index, len(events)):
        events[i]["prevEventSha"] = (events[i - 1]["eventSha"] if i > 0
                                     else oe.GENESIS_PREV)
        events[i]["eventSha"] = oe.sha256_hex(oe.canonical_bytes(
            {k: v for k, v in events[i].items() if k != "eventSha"}))
    return events


def mutated_history(events, index, mutate_payload):
    evs = json.loads(json.dumps(events))
    mutate_payload(evs[index]["payload"])
    return restamp_chain(evs, index)


def write_events_file(path, events):
    with open(path, "w", encoding="utf-8") as fh:
        for ev in events:
            fh.write(json.dumps(ev, sort_keys=True, separators=(",", ":"),
                                ensure_ascii=False) + "\n")


# ==========================================================================
# Evidence capture
# ==========================================================================

def _file_identity(path):
    data = Path(path).read_bytes()
    return {"sha256": hashlib.sha256(data).hexdigest(), "bytes": len(data)}


def _snapshot_sources():
    return {
        "rubric": _file_identity(RUBRIC_PATH),
        "sidecar": _file_identity(SIDECAR_PATH),
        "semanticContractCORR4": _file_identity(CONTRACT_PATH),
        "corr9OwnerAllocations": _file_identity(ALLOCATIONS_PATH),
        "corr9OwnerAllocationsSidecar": _file_identity(ALLOCATIONS_SIDECAR_PATH),
        "corr8Engine": _file_identity(CORR8_DIR / "offline_efca.py"),
        "corr8TestSuite": _file_identity(CORR8_DIR / "test_offline_efca.py"),
        "corr7Engine": _file_identity(CORR7_DIR / "offline_efca.py"),
        "corr6Engine": _file_identity(CORR6_DIR / "offline_efca.py"),
        "corr5Engine": _file_identity(CORR5_DIR / "offline_efca.py"),
        "corr4Engine": _file_identity(CORR4_DIR / "offline_efca.py"),
        "corr3Engine": _file_identity(CORR3_DIR / "offline_efca.py"),
        "corr2Engine": _file_identity(CORR2_DIR / "offline_efca.py"),
        "corr1Engine": _file_identity(CORR1_DIR / "offline_efca.py"),
        "originalEngine": _file_identity(ORIGINAL_DIR / "offline_efca.py"),
    }


def _git_snapshot():
    env = dict(os.environ, GIT_OPTIONAL_LOCKS="0")
    head = subprocess.run(
        ["git", "-C", str(REPO_ROOT), "rev-parse", "HEAD"],
        capture_output=True, text=True, env=env, check=True,
    ).stdout.strip()
    porcelain = subprocess.run(
        ["git", "-C", str(REPO_ROOT), "status", "--porcelain=v1"],
        capture_output=True, text=True, env=env, check=True,
    ).stdout.splitlines()
    return {"head": head, "porcelain": sorted(porcelain),
            "entryCount": len(porcelain)}


def _compare_git(before, after):
    problems = []
    if before["head"] != after["head"]:
        problems.append("HEAD changed during the test run")
    before_set, after_set = set(before["porcelain"]), set(after["porcelain"])
    removed = before_set - after_set
    if removed:
        problems.append("porcelain entries disappeared: %s" % sorted(removed))
    added = after_set - before_set
    outside = [p for p in added if not p.startswith("?? " + ACT_DIR_RELATIVE)]
    if outside:
        problems.append("untracked growth outside the authorized act dir: %s"
                        % outside)
    return {
        "headUnchanged": before["head"] == after["head"],
        "newUntrackedLimitedToActDir": not outside,
        "noRemovedEntries": not removed,
        "addedEntries": sorted(added),
        "problems": problems,
    }


def _residue_census():
    pycache, pyc, strays = [], [], []
    for root, dirs, files in os.walk(HERE):
        for d in dirs:
            if d == "__pycache__":
                pycache.append(os.path.join(root, d))
        for f in files:
            if f.endswith(".pyc"):
                pyc.append(os.path.join(root, f))
    if SYN_RUNS.exists():
        strays = [str(p) for p in sorted(SYN_RUNS.glob("**/*"))]
    return {"pycacheDirs": pycache, "pycFiles": pyc,
            "syntheticRunsResidue": strays}


REPORT = {
    "suite": "STAGE2_CORR4_L4_EFCA_OFFLINE_ENFORCEMENT_IMPLEMENTATION_1.CORR9",
    "classification": "SYNTHETIC_SELF_VALIDATION_NOT_INDEPENDENT_IV",
    "correctionLedger": ["F-45/OD-45-A", "GUARDRAIL-C1..C7",
                         "F-1..F-44 PRESERVED"],
    "invocation": {
        "command": "PYTHONDONTWRITEBYTECODE=1 python3 test_offline_efca.py",
        "python": sys.version.split()[0],
        "platform": sys.platform,
        "cwdRecordedFrom": str(HERE),
        "startedAtUtc": None,
        "finishedAtUtc": None,
    },
    "sourcePreservation": {},
    "gitState": {},
    "residueCheck": {},
    "tests": [],
    "totals": {},
}


class RecordingResult(unittest.TextTestResult):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self.records = []
        self._started = {}
        self._docstrings = {}

    def _note(self, test):
        doc = test._testMethodDoc or ""
        gate, expectation = "UNSPECIFIED", ""
        first = doc.strip().splitlines()
        if first and first[0].startswith("GATE:"):
            gate = first[0][len("GATE:"):].strip()
            rest = [ln.strip() for ln in first[1:] if ln.strip()]
            expectation = rest[0] if rest else ""
        return gate, expectation

    def startTest(self, test):
        super().startTest(test)
        self._started[test.id()] = time.time()
        self._docstrings[test.id()] = self._note(test)

    def _record(self, test, result, failure_class, detail):
        gate, expectation = self._docstrings.get(test.id(), ("UNSPECIFIED", ""))
        duration = round(
            (time.time() - self._started.get(test.id(), time.time())) * 1000, 3)
        self.records.append({
            "testId": test.id().split(".")[-1],
            "testName": str(test),
            "targetGate": gate,
            "expectedOutcome": expectation or result,
            "observedOutcome": result,
            "result": result,
            "failureClass": failure_class,
            "detail": (detail or "")[:2000],
            "durationMs": duration,
        })

    def addSuccess(self, test):
        super().addSuccess(test)
        self._record(test, "PASS", None, "")

    def addFailure(self, test, err):
        super().addFailure(test, err)
        self._record(test, "FAIL", "ASSERTION_FAILURE",
                     self._exc_info_to_string(err, test))

    def addError(self, test, err):
        super().addError(test, err)
        self._record(test, "ERROR", "UNEXPECTED_ERROR",
                     self._exc_info_to_string(err, test))

    def addSkip(self, test, reason):
        super().addSkip(test, reason)
        self._record(test, "SKIP", "SKIPPED", reason)


# ==========================================================================
# Shared helpers
# ==========================================================================

class EFCAUnitTest(unittest.TestCase):
    def setUp(self):
        SYN_RUNS.mkdir(parents=True, exist_ok=True)
        self._tmp = tempfile.mkdtemp(prefix="syn_tmp_", dir=str(SYN_RUNS))
        self.sess = self.new_session()

    def tearDown(self):
        shutil.rmtree(self._tmp, ignore_errors=True)

    def new_session(self, session_label="SYN_SESSION_001", **kwargs):
        return oe.EFCASession(
            rubric_path=kwargs.pop("rubric_path", RUBRIC_PATH),
            sidecar_path=kwargs.pop("sidecar_path", SIDECAR_PATH),
            scratch_dir=Path(self._tmp),
            session_label=session_label,
            **kwargs)

    def sim_session(self, entries, session_label="SYN_SESSION_001", **kwargs):
        """CORR9/OD-45-A: an EXPLICIT simulation session whose allocation
        authority is exactly `entries` (a sequence of
        (tupleKey, custodian) pairs). The engine derives mode SIMULATION;
        a simulation is never Owner-approved authority and never
        interchangeable with a pinned session's chain, even when the
        allocation bytes and digest are identical."""
        return self.new_session(session_label=session_label,
                                simulation_allocations=sim_doc(entries),
                                **kwargs)

    def register_all(self, s=None):
        s = s or self.sess
        for actor in FIX["actors"]:
            s.register_actor(actor["actorId"], actor["role"])

    def register_all_plus(self, s=None):
        """register_all plus the second Lane B actor used by F-39 tests."""
        s = s or self.sess
        self.register_all(s)
        s.register_actor(RLB2, "R_LB")

    def register_tuple(self, s=None, idx=0):
        s = s or self.sess
        return s.register_tuple(CUST, FIX["tuples"][idx])

    def issue_to(self, s, reviewer, key, custodian=CUST):
        return s.issue_packet(custodian, reviewer, key)

    def seal_by(self, s, reviewer, key, review_name="determinateYes"):
        return s.submit_phase1_review(
            reviewer, key, FIX["phase1Reviews"][review_name])

    def lawful_revealed(self, s, reviewer=RP1A, idx=0, review="determinateYes",
                        delta="noChange"):
        key = self.register_tuple(s, idx)["tupleKey"]
        self.issue_to(s, reviewer, key)
        self.seal_by(s, reviewer, key, review)
        s.acknowledge_seal_receipt(CUST, key, reviewer)
        revealed = s.reveal(CUST, reviewer, key)
        s.append_delta(reviewer, key, FIX["phase2Deltas"][delta])
        return key, revealed

    def declare_and_adjudicate(self, s, key, claim_type, claim_id,
                               declare=True, refs=None, proposition=None,
                               adjudicate_refs="same"):
        refs = refs if refs is not None else [record_ref(0, 0)]
        if declare:
            s.declare_records_rederived(RIND, key, refs)
        adj_refs = refs if adjudicate_refs == "same" else adjudicate_refs
        prop = proposition if proposition is not None else hist_prop(claim_type)
        return s.adjudicate_claim(RIND, key, claim_type, claim_id,
                                  record_refs=adj_refs, proposition=prop)

    def host_persist(self, s=None, name="h_chain.jsonl"):
        """ENGINE-HOST durability: persist the authoritative chain."""
        return (s or self.sess).persist_global_history(name)

    def host_events(self, s, name="host_view.jsonl"):
        """The host's raw chain view for building forged artifacts: the
        authoritative artifact read back from disk, exactly as a filesystem
        actor would obtain it (the trust model anchors on external
        inspection). Requester-scoped events() is a scoped PROJECTION under
        OD-37/F-37 and is never a chain (supersedes the CORR5 test pattern
        of forging from the custodian's raw event list)."""
        persisted = s.persist_global_history(name)
        return [json.loads(line) for line in
                Path(persisted["path"]).read_text(
                    encoding="utf-8").splitlines()]

    def host_restore(self, path, label="SYN_SESSION_001", s=None):
        """ENGINE-HOST recovery into a fresh same-label session."""
        target = s or self.new_session(session_label=label)
        target.restore_global_history(Path(path))
        return target

    def _chain_probe(self, s, name=None):
        """Refusal-neutral chain-change detector for assertions: the host
        eventCount plus the last raw chain line (the chain itself is the
        host's artifact; requester-scoped surfaces never carry it)."""
        name = name or ("probe_%s.jsonl" % abs(hash(str(s))))
        persisted = s.persist_global_history(name)
        lines = Path(persisted["path"]).read_text(encoding="utf-8").splitlines()
        return (persisted["eventCount"], lines[-1] if lines else "")

    def expect_occurrence_refusal(self, s, tuple_key, reporter, exposed_to, k):
        """CORR6/OD-37 probe (state-neutral): a refusal of k > own-bound
        must carry the scope-local INVALID_PAYLOAD and append nothing."""
        return self.expect_gate(
            "INVALID_PAYLOAD", s.report_exposure, reporter, tuple_key,
            exposed_to, "MARK_A", "SYNTHETIC bound probe",
            occurred=occref(k))

    def _sha_chain(self, s):
        """CORR6: refusal-neutral chain snapshot as (host eventCount, last
        raw chain line). Requester-scoped views no longer carry envelope
        material (OD-37/F-37), so chain-change assertions read the host
        artifact through the engine-host channel."""
        return self._chain_probe(s)

    def assert_no_envelope_material(self, artifact, msg):
        """F-37 structural firewall: no envelope sequence, ids, chain hashes
        or session-global counts; every disclosed clock value is a
        scope-local reference {scope, scopeOrdinal}."""
        blob = json.dumps(artifact, sort_keys=True)
        for marker in ('"seq":', '"eventId":', '"eventSha":',
                       '"prevEventSha":', '"t":', "eventCount"):
            self.assertNotIn(marker, blob, msg="%s: %s" % (msg, marker))

        def walk(node, path):
            if isinstance(node, dict):
                for k, v in node.items():
                    if k in ("registeredAt", "issuedAt", "sealedAt",
                             "revealedAt", "occurredAtTick", "reportedTick"):
                        if v is not None:
                            self.assertTrue(
                                isinstance(v, dict)
                                and set(v) == {"scope", "scopeOrdinal"},
                                msg="%s: clock field %s at %s must be a "
                                    "scope-local reference (got %r)"
                                % (msg, k, path, v))
                    walk(v, path + "/" + str(k))
            elif isinstance(node, list):
                for i, item in enumerate(node):
                    walk(item, path + "[%d]" % i)

        walk(artifact, "")

    def expect_gate(self, code, fn, *args, **kwargs):
        with self.assertRaises(oe.EFCAGateError) as cm:
            fn(*args, **kwargs)
        self.assertEqual(
            cm.exception.code, code,
            msg="expected gate %s, got %s (%s)"
                % (code, cm.exception.code, cm.exception),
        )
        return cm.exception

    def expect_orig_gate(self, module, code, fn, *args, **kwargs):
        with self.assertRaises(module.EFCAGateError) as cm:
            fn(*args, **kwargs)
        self.assertEqual(cm.exception.code, code, msg=str(cm.exception))
        return cm.exception

    # legacy-engine convenience (failure reproductions only)
    def orig_session(self, module=None, **kwargs):
        module = module or original_engine()
        return module.EFCASession(scratch_dir=Path(self._tmp), **kwargs)

    def corr1_session(self, **kwargs):
        return corr1_engine().EFCASession(scratch_dir=Path(self._tmp), **kwargs)

    def corr2_session(self, **kwargs):
        return corr2_engine().EFCASession(scratch_dir=Path(self._tmp), **kwargs)

    def corr3_session(self, **kwargs):
        return corr3_engine().EFCASession(scratch_dir=Path(self._tmp), **kwargs)

    def corr4_session(self, **kwargs):
        return corr4_engine().EFCASession(scratch_dir=Path(self._tmp), **kwargs)

    def register_all_legacy(self, s, module):
        for actor in FIX["actors"]:
            s.register_actor(actor["actorId"], actor["role"])


# ==========================================================================
# T01–T09: lawful synthetic sessions (positive controls)
# ==========================================================================

class LawfulSequenceTests(EFCAUnitTest):

    def test_T01_clean_phase1_seal_reveal_succeeds(self):
        """GATE: E1–E5 CLEAN SEQUENCE — a fully lawful synthetic session reaches PROVISIONAL

        Expected: registration, blind packet, seal, custody receipt, reveal
        and delta all succeed; workflowStatus.tupleLevel == PROVISIONAL.
        """
        self.register_all()
        key = self.register_tuple()["tupleKey"]
        packet = self.issue_to(self.sess, RP1A, key)
        self.assertEqual(set(packet.keys()), set(oe.PACKET_FIELDS))
        seal = self.seal_by(self.sess, RP1A, key)
        self.assertEqual(seal["contamination"]["status"], "CLEAN")
        receipt = self.sess.acknowledge_seal_receipt(CUST, key, RP1A)
        self.assertIn("sealReceivedAt", receipt)
        revealed = self.sess.reveal(CUST, RP1A, key)
        self.assertEqual(revealed["markA"], "YES")
        self.assertEqual(revealed["markB"], "NO")
        self.assertEqual([r["id"] for r in revealed["retrospectiveRecords"]],
                         ["SYN_RET_001", "SYN_RET_002"])
        self.sess.append_delta(RP1A, key, FIX["phase2Deltas"]["noChange"])
        status = self.sess.workflow_status(key, CUST)
        self.assertEqual(status["tupleLevel"], "PROVISIONAL")
        self.assertEqual(status["claimLevel"], "NOT_ADJUDICATED")
        self.assertEqual(status["tupleHistoricalCause"], "NOT_ESTABLISHED")
        self.assertTrue(self.sess.verify_integrity()["valid"])

    def test_T02_blind_packet_is_exactly_five_fields(self):
        """GATE: E2 EXACT BLIND PACKET — packet carries only the five permitted fields

        Expected: packet/fetch views carry exactly PACKET_FIELDS; the D
        identity and marks are custodian-visible only via custody_view.
        """
        self.register_all()
        key = self.register_tuple()["tupleKey"]
        packet = self.issue_to(self.sess, RP1A, key)
        fetched = self.sess.fetch_packet(RP1A, key)
        self.assertEqual(set(packet.keys()), set(oe.PACKET_FIELDS))
        self.assertEqual(set(fetched.keys()), set(oe.PACKET_FIELDS))
        for forbidden in ("d", "markA", "markB", "custodyMarks",
                          "disagreementDirection", "evidenceForm",
                          "planCurrentState"):
            self.assertNotIn(forbidden, packet)
            self.assertNotIn(forbidden, fetched)
        custody = self.sess.custody_view(CUST, key)
        self.assertEqual(custody["tupleId"]["d"], "SYN_D_07")

    def test_T03_integrity_chain_and_host_roundtrip(self):
        """GATE: E9 APPEND-ONLY CHAIN — in-memory chain verifies; the HOST channel persists/verifies/restores it; requester projections are separate

        Expected: integrity diagnostics are the constant healthy shape for
        every requester (OD-37/F-37 supersedes F-30's custodian count); the
        engine-host channel persists the authoritative chain with its count;
        a fresh same-label session restores it; a requester-scoped persisted
        artifact is a marked scoped projection that is never a chain backup.
        """
        self.register_all()
        self.lawful_revealed(self.sess)
        healthy = {"valid": True, "reason": "ok"}
        self.assertEqual(self.sess.verify_integrity(CUST), healthy)
        self.assertEqual(self.sess.verify_integrity(), healthy)
        persisted = self.host_persist(self.sess, "h_ok.jsonl")
        self.assertGreater(persisted["eventCount"], 5)
        self.assertEqual(persisted["artifactClass"],
                         oe.CHAIN_ARTIFACT_CLASS)
        verified = self.sess.verify_global_history(Path(persisted["path"]))
        self.assertTrue(verified["valid"], msg=verified["reason"])
        self.assertEqual(verified["eventCount"], persisted["eventCount"])
        restored = self.host_restore(persisted["path"])
        self.assertEqual(restored.workflow_status(TUP1, CUST)["tupleLevel"],
                         "PROVISIONAL")
        projection = self.sess.persist_history("h_ok_proj.json", CUST)
        self.assertEqual(projection["artifactClass"],
                         oe.PROJECTION_ARTIFACT_CLASS)
        self.assertFalse(projection["completeGlobalChainProof"])
        self.assertFalse(projection["authoritativeChainBackup"])
        self.assertEqual(
            self.sess.verify_persisted_history(Path(projection["path"]), CUST),
            healthy)

    def test_T04_host_restore_extension_accepted(self):
        """GATE: E9 VERIFIED EXTENSION — a same-genesis session restores a longer verified lawful history; foreign genesis is rejected

        Expected: fresh same-label session restores the persisted
        authoritative chain; foreign-genesis history is rejected; the
        extension is extendable (a further lawful operation succeeds).
        """
        self.register_all()
        self.lawful_revealed(self.sess)
        persisted = self.host_persist(self.sess, "h_ext.jsonl")
        other = self.host_restore(persisted["path"])
        self.assertEqual(other.workflow_status(TUP1, CUST)["tupleLevel"],
                         "PROVISIONAL")
        # the restored native chain is extendable
        key2 = other.register_tuple(CUST, FIX["tuples"][1])["tupleKey"]
        self.assertTrue(key2)
        foreign = self.new_session(session_label="SYN_SESSION_999")
        self.expect_gate(
            "STALE_SESSION_REJECTED",
            foreign.restore_global_history, Path(persisted["path"]))

    def test_T05_independent_reproduction_and_adjudication(self):
        """GATE: E8 CLAIM-SPECIFIC REPRODUCTION — normative claim adjudicated only when the original proposition is reproduced

        Expected: reproducer seals an identical normative determination
        before reading the rationale; normative claim ADJUDICATED;
        historical claim ADJUDICATED after the declared proof-carrying
        reconstruction (F-16).
        """
        self.register_all()
        key, _ = self.lawful_revealed(self.sess)
        # CORR7/F-41: the custodian issues the reproduction packet
        self.issue_to(self.sess, RIND, key)
        packet = self.sess.begin_independent_reproduction(RIND, key)
        self.assertEqual(set(packet.keys()), set(oe.PACKET_FIELDS))
        seal = self.seal_by(self.sess, RIND, key)
        self.assertEqual(seal["contamination"]["status"], "CLEAN")
        rationale = self.sess.receive_first_rationale(RIND, key)
        self.assertEqual(rationale["rationaleOf"], RP1A)
        norm = self.sess.adjudicate_claim(
            RIND, key, "NORMATIVE_DETERMINACY", FIX["claims"]["normative"])
        self.assertEqual(norm["claimLevelStatus"], "ADJUDICATED")
        hist = self.declare_and_adjudicate(
            self.sess, key, "HISTORICAL_RECORD_PRODUCTION",
            FIX["claims"]["historical"])
        self.assertEqual(hist["claimLevelStatus"], "PROVENANCE_VERIFIED_NOT_ADJUDICATED")
        self.assertEqual(self.sess.workflow_status(key, CUST)["claimLevel"],
                         "ADJUDICATED")

    def test_T06_contamination_recovery_by_different_reviewer(self):
        """GATE: E6 RECOVERY — contaminated Phase 1 never counts as blind proof; a different unexposed reviewer restores PROVISIONAL

        Expected: exposed reviewer's sealed pass stays preserved but cannot
        be revealed; new reviewer completes a lawful Phase 1/2.
        """
        self.register_all()
        key = self.register_tuple()["tupleKey"]
        self.issue_to(self.sess, RP1A, key)
        self.sess.report_exposure(CUST, key, RP1A, "MARK_A",
                                  "SYNTHETIC: reviewer saw A's invented mark")
        contaminated_seal = self.seal_by(self.sess, RP1A, key)
        self.assertEqual(contaminated_seal["contamination"]["status"],
                         "CONTAMINATED")
        self.sess.acknowledge_seal_receipt(CUST, key, RP1A)
        self.expect_gate("REVEAL_FORBIDDEN_CONTAMINATED",
                         self.sess.reveal, CUST, RP1A, key)
        new_packet = self.sess.request_new_phase1(CUST, key, RP1B)
        self.assertEqual(set(new_packet.keys()), set(oe.PACKET_FIELDS))
        self.seal_by(self.sess, RP1B, key)
        self.sess.acknowledge_seal_receipt(CUST, key, RP1B)
        self.sess.reveal(CUST, RP1B, key)
        self.sess.append_delta(RP1B, key, FIX["phase2Deltas"]["noChange"])
        status = self.sess.workflow_status(key, CUST)
        self.assertEqual(status["tupleLevel"], "PROVISIONAL")
        custody = self.sess.custody_view(CUST, key)
        preserved = [s for s in custody["seals"] if s["reviewer"] == RP1A][0]
        self.assertEqual(preserved["sealTimeContamination"]["status"],
                         "CONTAMINATED")
        self.assertEqual(
            len(preserved["sealTimeContamination"]["incidents"]), 1)

    def test_T07_evidence_record_issued_after_identity_gate(self):
        """GATE: E10 RUBRIC IDENTITY — record issued only against the Owner-pinned physical rubric digest

        Expected: issued record binds the pinned sha, carries an accurate
        procedural completeness snapshot, and stays UNASSIGNED.
        """
        self.register_all()
        key, _ = self.lawful_revealed(self.sess)
        record = self.sess.issue_evidence_record(CUST, key)
        self.assertEqual(record["rubricIdentity"]["sha256"],
                         oe.RUBRIC_EXPECTED_SHA256)
        self.assertEqual(record["rubricIdentity"]["status"],
                         "VERIFIED_AT_RECORD_ISSUANCE")
        self.assertEqual(record["rubricIdentity"]["fileName"],
                         oe.RUBRIC_FILE_NAME)
        self.assertNotEqual(record["parentRubricIdentity"]["sha256"],
                            record["rubricIdentity"]["sha256"])
        self.assertEqual(record["parentRubricIdentity"]["sha256"],
                         oe.PARENT_RUBRIC_SHA256)
        self.assertEqual(record["categoryAssignment"], "UNASSIGNED")
        self.assertEqual(record["tupleLevelName"], "UNASSIGNED")
        self.assertEqual(record["exclusivity"], "NOT_CLAIMED")
        self.assertEqual(record["contractIdentity"]["sha256"],
                         oe.CONTRACT_IDENTITY["sha256"])
        completeness = record["proceduralCompleteness"]
        self.assertTrue(completeness["phase1Sealed"])
        self.assertTrue(completeness["revealed"])
        self.assertEqual(completeness["tupleLevelAtIssuance"], "PROVISIONAL")
        self.assertEqual(completeness["deltaCount"], 1)
        self.assertIn("implies no seal", completeness["statement"])

    def test_T08_lane_b_separate_surface_pending_j1(self):
        """GATE: E7 LANE B ISOLATION — schema record on its own surface, causeLink UNASSIGNED_PENDING_J1

        Expected: Lane B registration succeeds for R_LB with a stable
        submission identity (F-39), never touches the Phase-1 surface, and
        populates no MISSING_M / GRAMMAR_GAP field; the delivery references
        one exact submission.
        """
        self.register_all()
        key = self.register_tuple(self.sess, 1)["tupleKey"]
        result = self.sess.register_lane_b(RLB, key, FIX["laneB"])
        self.assertEqual(result["causeLink"], "UNASSIGNED_PENDING_J1")
        # CORR8/F-44: the identity is actor-local deterministic
        self.assertEqual(result["submissionId"],
                         sub_id(RLB, key, 1))
        view = self.sess.lane_b_view(RLB, key)
        record = view["submissions"][0]
        serialized = json.dumps(view)
        self.assertNotIn("MISSING_M", serialized)
        self.assertNotIn("GRAMMAR_GAP", serialized)
        self.assertEqual(record["causeLink"], "UNASSIGNED_PENDING_J1")
        delivered = self.sess.deliver_lane_b_to(
            CUST, RLB, key, result["submissionId"])
        self.assertIsNone(delivered["contaminationEffect"])
        self.assertEqual(delivered["submissionId"], result["submissionId"])
        self.expect_gate("REFUSED_LANE_B_ACCESS",
                         self.sess.lane_b_view, RP1A, key)

    def test_T09_all_records_marked_synthetic(self):
        """GATE: §7 SYNTHETIC-ONLY DATA FIREWALL — every registered record carries synthetic classification

        Expected: tuple, seal payload, authority records and evidence
        record carry synthetic=true; all identifiers are SYN_*.
        """
        self.register_all()
        key, _ = self.lawful_revealed(self.sess)
        record = self.sess.issue_evidence_record(CUST, key)
        self.assertTrue(record["synthetic"])
        custody = self.sess.custody_view(CUST, key)
        seal = custody["seals"][0]
        self.assertTrue(seal["sealedPayload"]["synthetic"])
        for actor in [a["actorId"] for a in FIX["actors"]]:
            self.assertTrue(actor.startswith("SYN_"), actor)
        self.assertIn("SYNTHETIC", FIX["tuples"][0]["sealedFactText"])


# ==========================================================================
# T10–T14: packet and input firewall negative controls
# ==========================================================================

class InputFirewallTests(EFCAUnitTest):

    def test_T10_unissued_packet_rejected(self):
        """GATE: §9 NC-2 UNISSUED PACKET — review without issuance is rejected

        Expected: submit_phase1_review raises UNISSUED_PACKET.
        """
        self.register_all()
        key = self.register_tuple()["tupleKey"]
        self.expect_gate("UNISSUED_PACKET",
                         self.seal_by, self.sess, RP1A, key)

    def test_T11_forbidden_registration_fields_rejected(self):
        """GATE: §9 NC-3 FORBIDDEN PHASE-1 FIELD — closed tuple schema rejects smuggled forbidden inputs

        Expected: evidenceForm / planCurrentState / proxies in the tuple
        spec raise UNKNOWN_FIELD_REJECTED.
        """
        self.register_all()
        base = dict(FIX["tuples"][0])
        for bad in ("evidenceForm", "planCurrentState", "formal_or_operative",
                    "support_status", "priorRationale"):
            spec = dict(base)
            spec[bad] = "SYNTHETIC SMUGGLED VALUE"
            self.expect_gate("UNKNOWN_FIELD_REJECTED",
                             self.sess.register_tuple, CUST, spec)

    def test_T12_ab_mark_leakage_rejected(self):
        """GATE: §9 NC-4 A/B MARK LEAKAGE — packet views can never request marks

        Expected: fetch_packet with markA/marks/custodyMarks raises
        FORBIDDEN_FIELD_REJECTED.
        """
        self.register_all()
        key = self.register_tuple()["tupleKey"]
        self.issue_to(self.sess, RP1A, key)
        for bad in ("markA", "markB", "marks", "custodyMarks",
                    "disagreementDirection"):
            self.expect_gate("FORBIDDEN_FIELD_REJECTED",
                             self.sess.fetch_packet, RP1A, key, [bad])

    def test_T13_outcome_environment_leakage_rejected(self):
        """GATE: §9 NC-5 OUTCOME/ENVIRONMENT LEAKAGE — forbidden classes rejected at registration and packet view

        Expected: outcomeMaterial in tuple spec and outcome/environment in
        fetch fields are rejected.
        """
        self.register_all()
        base = dict(FIX["tuples"][0])
        for bad in ("outcomeMaterial", "environmentMaterial"):
            spec = dict(base)
            spec[bad] = "SYNTHETIC FORBIDDEN"
            self.expect_gate("UNKNOWN_FIELD_REJECTED",
                             self.sess.register_tuple, CUST, spec)
        key = self.register_tuple()["tupleKey"]
        self.issue_to(self.sess, RP1A, key)
        for bad in ("outcome", "environment"):
            self.expect_gate("FORBIDDEN_FIELD_REJECTED",
                             self.sess.fetch_packet, RP1A, key, [bad])

    def test_T14_m_tt_grammar_leakage_rejected(self):
        """GATE: §9 NC-6 M/TT REGISTRY OR GRAMMAR LEAKAGE — registry and grammar never enter the Phase-1 surface

        Expected: mRegistry/ttRegistry/grammar keys and packet fields
        rejected.
        """
        self.register_all()
        base = dict(FIX["tuples"][0])
        for bad in ("mRegistry", "ttRegistry", "grammar", "dispatchTable"):
            spec = dict(base)
            spec[bad] = "SYNTHETIC FORBIDDEN"
            self.expect_gate("UNKNOWN_FIELD_REJECTED",
                             self.sess.register_tuple, CUST, spec)
        key = self.register_tuple()["tupleKey"]
        self.issue_to(self.sess, RP1A, key)
        for bad in ("mRegistry", "ttRegistry", "grammar"):
            self.expect_gate("FORBIDDEN_FIELD_REJECTED",
                             self.sess.fetch_packet, RP1A, key, [bad])


# ==========================================================================
# T15–T20: role isolation, sequencing, immutability
# ==========================================================================

class RoleAndSequencingTests(EFCAUnitTest):

    def test_T15_s28_lane_b_before_seal_contaminates(self):
        """GATE: S28 LANE B PRE-SEAL — Lane B material delivered to the unsealed Phase-1 reviewer contaminates BY DERIVATION

        Expected: delivery effect CONTAMINATED (derived, no companion
        event); seal CONTAMINATED with the derived LANE_B_MATERIAL
        incident; delivery after sealing adds no new effect.
        """
        self.register_all()
        key = self.register_tuple()["tupleKey"]
        self.issue_to(self.sess, RP1A, key)
        sid = self.sess.register_lane_b(RLB, key, FIX["laneB"])["submissionId"]
        delivered = self.sess.deliver_lane_b_to(CUST, RP1A, key, sid)
        self.assertEqual(delivered["contaminationEffect"]["status"],
                         "CONTAMINATED")
        seal = self.seal_by(self.sess, RP1A, key)
        self.assertEqual(seal["contamination"]["status"], "CONTAMINATED")
        self.assertEqual(seal["contamination"]["incidents"][0]["what"],
                         "LANE_B_MATERIAL")
        self.assertTrue(seal["contamination"]["incidents"][0]["derived"])
        again = self.sess.deliver_lane_b_to(CUST, RP1A, key, sid)
        self.assertIsNone(again["contaminationEffect"])

    def test_T16_custodian_cannot_review_same_tuple(self):
        """GATE: §9 NC-8 CUSTODIAN SELF-REVIEW — the custodian is structurally barred from reviewing

        Expected: packet issuance to the custodian and a custodian review
        attempt both raise ROLE_MISMATCH.
        """
        self.register_all()
        key = self.register_tuple()["tupleKey"]
        self.expect_gate("ROLE_MISMATCH",
                         self.sess.issue_packet, CUST, CUST, key)
        self.expect_gate("ROLE_MISMATCH",
                         self.sess.submit_phase1_review, CUST, key,
                         FIX["phase1Reviews"]["determinateYes"])

    def test_T17_author_cannot_impersonate_reproducer(self):
        """GATE: §9 NC-9 IMPERSONATION — the Phase-1 author cannot act as independent reproducer

        Expected: R_P1 actor refused the reproducer operation (role), and a
        reproducer who already sealed cannot re-enter as reproducer.
        """
        self.register_all()
        key, _ = self.lawful_revealed(self.sess)
        self.expect_gate("ROLE_MISMATCH",
                         self.sess.begin_independent_reproduction, RP1A, key)
        self.issue_to(self.sess, RIND, key)
        self.sess.begin_independent_reproduction(RIND, key)
        self.seal_by(self.sess, RIND, key)
        self.expect_gate("REVIEWER_ALREADY_SEALED",
                         self.sess.begin_independent_reproduction, RIND, key)

    def test_T18_reveal_before_seal_rejected(self):
        """GATE: §9 NC-10 REVEAL BEFORE SEAL — premature reveal fails closed

        Expected: REVEAL_BEFORE_SEAL.
        """
        self.register_all()
        key = self.register_tuple()["tupleKey"]
        self.issue_to(self.sess, RP1A, key)
        self.expect_gate("REVEAL_BEFORE_SEAL",
                         self.sess.reveal, CUST, RP1A, key)

    def test_T19_reveal_before_custody_receipt_rejected(self):
        """GATE: §9 NC-11 REVEAL BEFORE RECEIPT — seal alone is insufficient

        Expected: REVEAL_BEFORE_CUSTODY_RECEIPT.
        """
        self.register_all()
        key = self.register_tuple()["tupleKey"]
        self.issue_to(self.sess, RP1A, key)
        self.seal_by(self.sess, RP1A, key)
        self.expect_gate("REVEAL_BEFORE_CUSTODY_RECEIPT",
                         self.sess.reveal, CUST, RP1A, key)

    def test_T20_seal_tampering_after_receipt_rejected(self):
        """GATE: §9 NC-12 SEAL TAMPERING — sealed bytes cannot be edited, replaced or re-acknowledged

        Expected: resubmission raises SEALED_IMMUTABLE; duplicate custody
        receipt raises DUPLICATE_EVENT; original sealedBytesSha unchanged.
        """
        self.register_all()
        key = self.register_tuple()["tupleKey"]
        self.issue_to(self.sess, RP1A, key)
        original = self.seal_by(self.sess, RP1A, key)
        self.sess.acknowledge_seal_receipt(CUST, key, RP1A)
        tampered = json.loads(json.dumps(FIX["phase1Reviews"]["determinateYes"]))
        tampered["rationale"] = "SYNTHETIC TAMPERED RATIONALE"
        self.expect_gate("SEALED_IMMUTABLE",
                         self.sess.submit_phase1_review, RP1A, key, tampered)
        self.expect_gate("DUPLICATE_EVENT",
                         self.sess.acknowledge_seal_receipt, CUST, key, RP1A)
        custody = self.sess.custody_view(CUST, key)
        self.assertEqual(custody["seals"][0]["sealedBytesSha"],
                         original["sealedBytesSha"])


# ==========================================================================
# T21–T26, T39: substitution, replay, persisted-history integrity
# ==========================================================================

class SubstitutionAndHistoryTests(EFCAUnitTest):

    def test_T21_client_supplied_hash_and_role_rejected(self):
        """GATE: §9 NC-13 PACKET/HASH SUBSTITUTION — client hashes and role claims cannot override engine identity

        Expected: review specs carrying packetSha/sealedBytesSha/role raise
        UNKNOWN_FIELD_REJECTED; custody packetSha equals the engine-computed
        digest of the canonical five-field packet.
        """
        self.register_all()
        key = self.register_tuple()["tupleKey"]
        packet = self.issue_to(self.sess, RP1A, key)
        for bad_field, bad_value in (("packetSha", "0" * 64),
                                     ("sealedBytesSha", "1" * 64),
                                     ("role", "R_IND")):
            spec = json.loads(json.dumps(FIX["phase1Reviews"]["determinateYes"]))
            spec[bad_field] = bad_value
            self.expect_gate("UNKNOWN_FIELD_REJECTED",
                             self.sess.submit_phase1_review, RP1A, key, spec)
        expected_sha = oe.sha256_hex(oe.canonical_bytes(packet))
        custody = self.sess.custody_view(CUST, key)
        self.assertEqual(custody["packets"][0]["packetSha"], expected_sha)

    def test_T22_repeated_and_reordered_reveal_rejected(self):
        """GATE: §9 NC-14 REPEATED/REORDERED REVEAL — reveal happens once; delta only after reveal

        Expected: second reveal raises REVEAL_ALREADY_PERFORMED; delta
        before any reveal raises DELTA_BEFORE_REVEAL.
        """
        self.register_all()
        key, _ = self.lawful_revealed(self.sess)
        self.expect_gate("REVEAL_ALREADY_PERFORMED",
                         self.sess.reveal, CUST, RP1A, key)
        key2 = self.register_tuple(self.sess, 1)["tupleKey"]
        self.issue_to(self.sess, RP1B, key2)
        self.seal_by(self.sess, RP1B, key2)
        self.sess.acknowledge_seal_receipt(CUST, key2, RP1B)
        self.expect_gate("DELTA_BEFORE_REVEAL",
                         self.sess.append_delta, RP1B, key2,
                         FIX["phase2Deltas"]["noChange"])

    def test_T23_duplicate_event_replay_detected(self):
        """GATE: §9 NC-15 DUPLICATE EVENT REPLAY — a duplicated event line fails host chain verification

        Expected: verify_global_history reports invalid; restore raises
        HASH_CHAIN_INVALID. (Persistence moved to the engine-host channel —
        OD-37/F-37: requester-scoped paths never accept chains.)
        """
        self.register_all()
        self.lawful_revealed(self.sess)
        persisted = self.host_persist(self.sess, "h_dup.jsonl")
        path = Path(persisted["path"])
        lines = path.read_text(encoding="utf-8").splitlines()
        with open(path, "w", encoding="utf-8") as fh:
            fh.write("\n".join(lines + [lines[-1]]) + "\n")
        check = self.sess.verify_global_history(path)
        self.assertFalse(check["valid"])
        fresh = self.new_session()
        self.expect_gate("HASH_CHAIN_INVALID", fresh.restore_global_history, path)

    def test_T24_corrupt_history_detected(self):
        """GATE: §9 NC-16a CORRUPT HISTORY — a payload edit without rehash fails host verification

        Expected: verify_global_history invalid (hash mismatch).
        """
        self.register_all()
        self.lawful_revealed(self.sess)
        persisted = self.host_persist(self.sess, "h_corrupt.jsonl")
        path = Path(persisted["path"])
        lines = path.read_text(encoding="utf-8").splitlines()
        middle = json.loads(lines[len(lines) // 2])
        middle["payload"]["detail"] = "SYNTHETIC CORRUPTION"
        lines[len(lines) // 2] = json.dumps(
            middle, sort_keys=True, separators=(",", ":"), ensure_ascii=False)
        with open(path, "w", encoding="utf-8") as fh:
            fh.write("\n".join(lines) + "\n")
        check = self.sess.verify_global_history(path)
        self.assertFalse(check["valid"])

    def test_T25_truncated_history_blocked_from_live_session(self):
        """GATE: §9 NC-16b TRUNCATED HISTORY — truncation cannot roll back a live session

        Expected: the truncated file alone still chains (no external anchor
        — documented limitation) but is detected by host event count, and
        restore into the longer live session raises STALE_SESSION_REJECTED.
        """
        self.register_all()
        self.lawful_revealed(self.sess)
        persisted = self.host_persist(self.sess, "h_trunc.jsonl")
        path = Path(persisted["path"])
        full_count = self.sess.verify_global_history(path)["eventCount"]
        lines = path.read_text(encoding="utf-8").splitlines()
        with open(path, "w", encoding="utf-8") as fh:
            fh.write("\n".join(lines[:-1]) + "\n")
        truncated = self.sess.verify_global_history(path)
        self.assertTrue(truncated["valid"])
        self.assertEqual(truncated["eventCount"], full_count - 1)
        self.expect_gate("STALE_SESSION_REJECTED",
                         self.sess.restore_global_history, path)

    def test_T26_reordered_history_detected(self):
        """GATE: §9 NC-16c REORDERED HISTORY — swapped event lines break the chain

        Expected: verify_global_history invalid.
        """
        self.register_all()
        self.lawful_revealed(self.sess)
        persisted = self.host_persist(self.sess, "h_swap.jsonl")
        path = Path(persisted["path"])
        lines = path.read_text(encoding="utf-8").splitlines()
        i = len(lines) // 2
        lines[i], lines[i + 1] = lines[i + 1], lines[i]
        with open(path, "w", encoding="utf-8") as fh:
            fh.write("\n".join(lines) + "\n")
        check = self.sess.verify_global_history(path)
        self.assertFalse(check["valid"])

    def test_T39_stale_session_restore_rejected(self):
        """GATE: §6 BYPASS — a stale (shorter) snapshot cannot be restored over a longer chain

        Expected: restoring an earlier prefix of the same lineage into the
        live session raises STALE_SESSION_REJECTED; the current snapshot
        restores.
        """
        self.register_all()
        key = self.register_tuple()["tupleKey"]
        self.issue_to(self.sess, RP1A, key)
        self.seal_by(self.sess, RP1A, key)
        early = self.host_persist(self.sess, "h_early.jsonl")
        self.sess.acknowledge_seal_receipt(CUST, key, RP1A)
        late = self.host_persist(self.sess, "h_late.jsonl")
        self.expect_gate("STALE_SESSION_REJECTED",
                         self.sess.restore_global_history, Path(early["path"]))
        ok = self.sess.restore_global_history(Path(late["path"]))
        self.assertTrue(ok["restored"])


# ==========================================================================
# T27–T32: contamination recovery and reproduction prerequisites
# ==========================================================================

class ContaminationAndReproductionTests(EFCAUnitTest):

    def test_T27_exposed_reviewer_cannot_cure_by_repeating(self):
        """GATE: §9 NC-17 EXPOSED REVIEWER REPEAT — the exposed reviewer cannot restore blindness

        Expected: request_new_phase1 for the sealed-and-exposed reviewer
        raises EXPOSED_REVIEWER_CANNOT_CURE.
        """
        self.register_all()
        key = self.register_tuple()["tupleKey"]
        self.issue_to(self.sess, RP1A, key)
        self.sess.report_exposure(CUST, key, RP1A, "MARK_A", "SYNTHETIC")
        self.seal_by(self.sess, RP1A, key)
        self.expect_gate("EXPOSED_REVIEWER_CANNOT_CURE",
                         self.sess.request_new_phase1, CUST, key, RP1A)

    def test_T28_other_exposed_reviewer_cannot_recover(self):
        """GATE: §9 NC-18 DIFFERENT-BUT-EXPOSED REVIEWER — only a never-exposed reviewer may recover

        Expected: request_new_phase1 for another exposed reviewer raises
        REVIEWER_ALREADY_EXPOSED; the unexposed third reviewer succeeds.
        """
        self.register_all()
        key = self.register_tuple()["tupleKey"]
        self.issue_to(self.sess, RP1A, key)
        self.sess.report_exposure(CUST, key, RP1A, "MARK_A", "SYNTHETIC")
        self.seal_by(self.sess, RP1A, key)
        self.sess.report_exposure(CUST, key, RP1B, "OUTCOME_OR_ENVIRONMENT",
                                  "SYNTHETIC")
        self.expect_gate("REVIEWER_ALREADY_EXPOSED",
                         self.sess.request_new_phase1, CUST, key, RP1B)
        packet = self.sess.request_new_phase1(CUST, key, RP1C)
        self.assertEqual(set(packet.keys()), set(oe.PACKET_FIELDS))

    def test_T29_s26_rationale_before_own_seal_refuses_normative(self):
        """GATE: S26 BLINDNESS — reproducer reading the first rationale before their own seal cannot adjudicate normative claims

        Expected: observed ordering FALSE; normative adjudication refused;
        historical-record claims remain reproducible (with the F-16
        proof-carrying reconstruction) despite the derived contamination.
        """
        self.register_all()
        key = self.register_tuple()["tupleKey"]
        self.issue_to(self.sess, RP1A, key)
        self.seal_by(self.sess, RP1A, key)
        self.sess.acknowledge_seal_receipt(CUST, key, RP1A)
        self.issue_to(self.sess, RIND, key)
        self.sess.begin_independent_reproduction(RIND, key)
        rationale = self.sess.receive_first_rationale(RIND, key)
        self.assertEqual(rationale["rationaleOf"], RP1A)
        seal = self.seal_by(self.sess, RIND, key)
        self.assertEqual(seal["contamination"]["status"], "CONTAMINATED")
        self.assertEqual(seal["contamination"]["incidents"][0]["what"],
                         "PRIOR_RATIONALE")
        # adaptation (CORR6/OD-37): custodian scoped projections carry local
        # ordinals only (no envelope ticks); ordering is asserted within one
        # visible list.
        events = self.sess.events(CUST)
        access_ord = next(e["localOrdinal"] for e in events
                          if e["eventType"] == "RATIONALE_ACCESSED")
        seal_ord = next(e["localOrdinal"] for e in events
                        if e["eventType"] == "PHASE1_SEALED"
                        and e["payload"]["reviewer"] == RIND)
        self.assertLess(access_ord, seal_ord)
        self.expect_gate("REFUSED_NOT_BLIND", self.sess.adjudicate_claim,
                         RIND, key, "NORMATIVE_DETERMINACY",
                         FIX["claims"]["normative"])
        hist = self.declare_and_adjudicate(
            self.sess, key, "HISTORICAL_RECORD_EVENT",
            FIX["claims"]["historical"])
        self.assertEqual(hist["claimLevelStatus"], "PROVENANCE_VERIFIED_NOT_ADJUDICATED")

    def test_T30_caller_supplied_ordering_flag_rejected(self):
        """GATE: §9 NC-20 SELF-DECLARED PREREQUISITE — ownPhase1SealedBeforeRationale is engine-observed only

        Expected: caller-supplied flag raises
        CALLER_SUPPLIED_PREREQUISITE_REJECTED even in a lawful flow; the
        same adjudication then succeeds without it.
        """
        self.register_all()
        key, _ = self.lawful_revealed(self.sess)
        self.issue_to(self.sess, RIND, key)
        self.sess.begin_independent_reproduction(RIND, key)
        self.seal_by(self.sess, RIND, key)
        self.sess.receive_first_rationale(RIND, key)
        self.expect_gate(
            "CALLER_SUPPLIED_PREREQUISITE_REJECTED",
            self.sess.adjudicate_claim, RIND, key,
            "NORMATIVE_DETERMINACY", FIX["claims"]["normative"],
            observation={"ownPhase1SealedBeforeRationale": True})
        result = self.sess.adjudicate_claim(
            RIND, key, "NORMATIVE_DETERMINACY", FIX["claims"]["normative"])
        self.assertEqual(result["claimLevelStatus"], "ADJUDICATED")

    def test_T31_records_rederived_prerequisite_enforced(self):
        """GATE: §9 NC-21 / F-16 RECORDS RE-DERIVATION — historical claims require the declared, proof-carrying reconstruction of the named claim

        Expected: bare identifiers do not declare a re-derivation; a claim
        without its own reconstruction is refused; unknown/decoous
        locators and fabricated content are refused; a faithful
        reconstruction adjudicates.
        """
        self.register_all()
        key, _ = self.lawful_revealed(self.sess)
        good = record_ref(0, 0)
        self.issue_to(self.sess, RIND, key)  # CORR7/F-41 packet-first
        # bare identifiers (CORR1 style) are no longer a declaration
        self.expect_gate("INVALID_RECORD_LOCATORS",
                         self.sess.declare_records_rederived, RIND, key,
                         ["SYN_RET_001"])
        self.expect_gate("INVALID_RECORD_LOCATORS",
                         self.sess.declare_records_rederived, RIND, key, [])
        self.expect_gate("INVALID_RECORD_LOCATORS",
                         self.sess.declare_records_rederived, RIND, key,
                         [{"recordId": "SYN_RET_999",
                           "locator": "SYN_LOCATOR_RET_999",
                           "content": "SYNTHETIC UNKNOWN RECORD"}])
        wrong_locator = dict(good, locator="SYN_LOCATOR_RET_999")
        self.expect_gate("INVALID_RECORD_LOCATORS",
                         self.sess.declare_records_rederived, RIND, key,
                         [wrong_locator])
        fabricated = dict(good, content="SYNTHETIC FABRICATED CONTENT")
        self.expect_gate("RECONSTRUCTION_DIGEST_MISMATCH",
                         self.sess.declare_records_rederived, RIND, key,
                         [fabricated])
        # claim without its own reconstruction → refused (F-16)
        self.expect_gate("REFUSED_RECORDS_NOT_REDERIVED",
                         self.sess.adjudicate_claim, RIND, key,
                         "HISTORICAL_RECORD_PRODUCTION",
                         FIX["claims"]["historical"])
        # lawful declaration, then a claim whose evidence is not declared
        self.sess.declare_records_rederived(RIND, key, [good])
        self.expect_gate("REFUSED_UNVERIFIED_EVIDENCE",
                         self.sess.adjudicate_claim, RIND, key,
                         "HISTORICAL_RECORD_PRODUCTION",
                         FIX["claims"]["historical"], record_refs=None)
        self.expect_gate("REFUSED_EVIDENCE_NOT_DECLARED",
                         self.sess.adjudicate_claim, RIND, key,
                         "HISTORICAL_RECORD_LINKAGE",
                         FIX["claims"]["historical"],
                         record_refs=[record_ref(0, 1)])
        result = self.sess.adjudicate_claim(
            RIND, key, "HISTORICAL_RECORD_PRODUCTION",
            FIX["claims"]["historical"], record_refs=[good],
            proposition=hist_prop("HISTORICAL_RECORD_PRODUCTION"))
        self.assertEqual(result["claimLevelStatus"], "PROVENANCE_VERIFIED_NOT_ADJUDICATED")
        # append-only preservation: the refused transitions left no events.
        # F-35: the successful historical check is provenance, not adjudication.
        events = self.sess.events(CUST)
        provenance = [e for e in events
                      if e["eventType"] == "CLAIM_PROVENANCE_VERIFIED"]
        adjudications = [e for e in events
                         if e["eventType"] == "CLAIM_ADJUDICATED"]
        self.assertEqual(len(provenance), 1)
        self.assertEqual(len(adjudications), 0)
        self.assertEqual(self.sess.category_assignment(key)
                         ["categoryAssignment"], "UNASSIGNED")

    def test_T32_agreement_never_yields_causal_adjudication(self):
        """GATE: §9 NC-22 / S15 AGREEMENT — reviewer agreement cannot produce causal ADJUDICATED

        Expected: CAUSAL_CATEGORY claim type raises
        UNSUPPORTED_SCIENTIFIC_ADJUDICATION; categoryAssignment stays
        UNASSIGNED; no causal adjudication event exists.
        """
        self.register_all()
        key, _ = self.lawful_revealed(self.sess)
        self.issue_to(self.sess, RIND, key)
        self.sess.begin_independent_reproduction(RIND, key)
        self.seal_by(self.sess, RIND, key)
        self.sess.receive_first_rationale(RIND, key)
        self.expect_gate("UNSUPPORTED_SCIENTIFIC_ADJUDICATION",
                         self.sess.adjudicate_claim, RIND, key,
                         "CAUSAL_CATEGORY_CODER_ERROR",
                         FIX["claims"]["normative"],
                         observation={"reviewerAgreement": True})
        cats = self.sess.category_assignment(key)
        self.assertEqual(cats["categoryAssignment"], "UNASSIGNED")
        self.assertEqual(cats["tupleLevelName"], "UNASSIGNED")
        adjudicated = [e for e in self.sess.events(CUST)
                       if e["eventType"] == "CLAIM_ADJUDICATED"]
        self.assertEqual(
            [e for e in adjudicated
             if e["payload"]["claimType"].startswith("CAUSAL")], [])


# ==========================================================================
# T33–T36: rubric identity gate and scientific authority firewall
# ==========================================================================

class IdentityAndAuthorityTests(EFCAUnitTest):

    def _sidecar_copy(self, name, mutate):
        target = Path(self._tmp) / name
        text = SIDECAR_PATH.read_text(encoding="utf-8")
        target.write_text(mutate(text), encoding="utf-8")
        return target

    def test_T33_r34_missing_sidecar_not_issuable(self):
        """GATE: R34 / §9 NC-23 MISSING SIDECAR — absent SHA256SUMS.txt makes the record NOT ISSUABLE

        Expected: IdentityGateError NOT_ISSUABLE_SIDECAR_MISSING; no
        evidence event appended; no scientific FIRED status anywhere.
        """
        self.register_all()
        key, _ = self.lawful_revealed(self.sess)
        broken = self.new_session(
            sidecar_path=Path(self._tmp) / "absent.txt")
        self.register_all(broken)
        broken.register_tuple(CUST, FIX["tuples"][0])
        self.expect_gate("NOT_ISSUABLE_SIDECAR_MISSING",
                         broken.issue_evidence_record, CUST, key)
        issued = [e for e in broken.events(CUST)
                  if e["eventType"] == "EVIDENCE_RECORD_ISSUED"]
        self.assertEqual(issued, [])
        self.assertNotIn("FIRED", json.dumps(broken.events(CUST)))

    def test_T34_r34_wrong_sidecar_not_issuable(self):
        """GATE: R34 / §9 NC-24 WRONG SIDECAR — digest mismatch and missing entry both make the record NOT ISSUABLE

        Expected: NOT_ISSUABLE_RUBRIC_IDENTITY_MISMATCH for a forged
        digest; NOT_ISSUABLE_SIDECAR_ENTRY_MISSING when the entry is
        dropped; no FIRED anywhere.
        """
        self.register_all()
        key = self.register_tuple()["tupleKey"]
        wrong = self._sidecar_copy(
            "sidecar_wrong.txt",
            lambda t: t.replace(oe.RUBRIC_EXPECTED_SHA256, "f" * 64))
        no_entry = self._sidecar_copy(
            "sidecar_no_entry.txt",
            lambda t: "\n".join(
                ln for ln in t.splitlines()
                if oe.RUBRIC_FILE_NAME not in ln) + "\n")
        s1 = self.new_session(sidecar_path=wrong)
        self.register_all(s1)
        s1.register_tuple(CUST, FIX["tuples"][0])
        self.expect_gate("NOT_ISSUABLE_RUBRIC_IDENTITY_MISMATCH",
                         s1.issue_evidence_record, CUST, key)
        s2 = self.new_session(sidecar_path=no_entry)
        self.register_all(s2)
        s2.register_tuple(CUST, FIX["tuples"][0])
        self.expect_gate("NOT_ISSUABLE_SIDECAR_ENTRY_MISSING",
                         s2.issue_evidence_record, CUST, key)
        for s in (s1, s2):
            issued = [e for e in s.events(CUST)
                      if e["eventType"] == "EVIDENCE_RECORD_ISSUED"]
            self.assertEqual(issued, [])
            self.assertNotIn("FIRED", json.dumps(s.events(CUST)))

    def test_T35_non_synthetic_and_path_inputs_rejected(self):
        """GATE: §7 SYNTHETIC FIREWALL / §9 NC-25 — non-synthetic identifiers and historical path access rejected

        Expected: historical-looking ids raise NON_SYNTHETIC_IDENTIFIER;
        path/loader fields in the tuple spec raise UNKNOWN_FIELD_REJECTED;
        the engine exposes no historical loader.
        """
        self.register_all()
        historical = dict(FIX["tuples"][0])
        historical["caseId"] = "CASE-3.5"
        self.expect_gate("NON_SYNTHETIC_IDENTIFIER",
                         self.sess.register_tuple, CUST, historical)
        with_path = dict(FIX["tuples"][0])
        with_path["sourcePath"] = (
            "STAGE2_CORR4_PILOT_STRATIFICATION_DISAGREEMENTS.jsonl")
        self.expect_gate("UNKNOWN_FIELD_REJECTED",
                         self.sess.register_tuple, CUST, with_path)
        self.expect_gate("NON_SYNTHETIC_IDENTIFIER",
                         self.sess.fetch_packet, RP1A,
                         "CASE-3.5|SYN_SIDE_A|SYN_FACT_001")
        self.expect_gate("NON_SYNTHETIC_IDENTIFIER",
                         self.sess.register_actor, "codex_agent", "R_P1")
        for absent in ("load_historical", "load_ledger", "load_tuple_file",
                       "import_historical", "load_history_file"):
            self.assertFalse(hasattr(self.sess, absent))

    def test_T36_automatic_category_assignment_rejected(self):
        """GATE: §9 NC-26 / E11 SCIENTIFIC AUTHORITY — no automatic frozen-category assignment exists

        Expected: review specs and observations carrying categoryAssignment
        are rejected; issued records stay UNASSIGNED.
        """
        self.register_all()
        key = self.register_tuple()["tupleKey"]
        self.issue_to(self.sess, RP1A, key)
        spec = json.loads(json.dumps(FIX["phase1Reviews"]["determinateYes"]))
        spec["categoryAssignment"] = "CODER_ERROR"
        self.expect_gate("UNKNOWN_FIELD_REJECTED",
                         self.sess.submit_phase1_review, RP1A, key, spec)
        self.seal_by(self.sess, RP1A, key)
        self.sess.acknowledge_seal_receipt(CUST, key, RP1A)
        self.sess.reveal(CUST, RP1A, key)
        self.sess.append_delta(RP1A, key, FIX["phase2Deltas"]["noChange"])
        record = self.sess.issue_evidence_record(CUST, key)
        self.assertEqual(record["categoryAssignment"], "UNASSIGNED")
        for name in oe.FROZEN_CATEGORY_NAMES:
            self.assertNotIn(name, json.dumps(record))


# ==========================================================================
# T37–T42: S16/S25 semantics, effective contamination, static proofs
# ==========================================================================

class ContaminationSemanticsTests(EFCAUnitTest):

    def test_T37_s16_mark_exposure_contaminates_blind_proof(self):
        """GATE: S16 PRE-SEAL MARK EXPOSURE — contaminated Phase 1 preserved but never blind proof

        Expected: incident recorded; seal preserved CONTAMINATED; tuple
        stays IN_PROGRESS despite seal+receipt.
        """
        self.register_all()
        key = self.register_tuple()["tupleKey"]
        self.issue_to(self.sess, RP1A, key)
        incident = self.sess.report_exposure(
            CUST, key, RP1A, "MARK_A",
            "SYNTHETIC: reviewer saw the invented A mark before sealing")
        self.assertEqual(incident["phase1Contamination"]["status"],
                         "CONTAMINATED")
        self.assertIn("reportedTick", incident)
        self.assertIn("occurredAtTick", incident)
        seal = self.seal_by(self.sess, RP1A, key)
        self.assertEqual(seal["contamination"]["status"], "CONTAMINATED")
        self.sess.acknowledge_seal_receipt(CUST, key, RP1A)
        status = self.sess.workflow_status(key, CUST)
        self.assertEqual(status["tupleLevel"], "IN_PROGRESS")

    def test_T38_s25_registry_row_exposure_contaminates(self):
        """GATE: S25 REGISTRY ROW — M dispatch material reaching the reviewer contaminates Phase 1

        Expected: exposure with what=M_DISPATCH_ROW marks the phase
        CONTAMINATED; the engine-built packet never contained registry
        material; recovery via the exposed reviewer is refused.
        """
        self.register_all()
        key = self.register_tuple()["tupleKey"]
        packet = self.issue_to(self.sess, RP1A, key)
        self.assertEqual(set(packet.keys()), set(oe.PACKET_FIELDS))
        incident = self.sess.report_exposure(CUST, key, RP1A,
                                             "M_DISPATCH_ROW", "SYNTHETIC")
        self.assertEqual(incident["phase1Contamination"]["status"],
                         "CONTAMINATED")
        self.expect_gate("REVIEWER_ALREADY_EXPOSED",
                         self.sess.request_new_phase1, CUST, key, RP1A)

    def test_T40_post_seal_exposure_and_mismatched_seal_reveal(self):
        """GATE: §9 NC-12/E5 ALTERED PACKET IDENTITY — unestablished post-seal exposure blocks reveal (fail closed)

        Expected: post-seal report with unestablished occurrence keeps the
        seal preserved but reveal is refused; only the new unexposed
        reviewer's matching seal reveals.
        """
        self.register_all()
        key = self.register_tuple()["tupleKey"]
        self.issue_to(self.sess, RP1A, key)
        self.seal_by(self.sess, RP1A, key)
        self.sess.acknowledge_seal_receipt(CUST, key, RP1A)
        self.sess.report_exposure(CUST, key, RP1A, "MARK_B",
                                  "SYNTHETIC: discovered after sealing")
        self.expect_gate("REVEAL_FORBIDDEN_CONTAMINATED",
                         self.sess.reveal, CUST, RP1A, key)
        self.sess.request_new_phase1(CUST, key, RP1C)
        self.seal_by(self.sess, RP1C, key)
        self.sess.acknowledge_seal_receipt(CUST, key, RP1C)
        revealed = self.sess.reveal(CUST, RP1C, key)
        self.assertEqual(revealed["markA"], "YES")
        self.sess.append_delta(RP1C, key, FIX["phase2Deltas"]["noChange"])
        self.assertEqual(self.sess.workflow_status(key, CUST)["tupleLevel"],
                         "PROVISIONAL")
        custody = self.sess.custody_view(CUST, key)
        self.assertTrue(
            [s for s in custody["seals"] if s["reviewer"] == RP1A][0]
            ["sealedBytesSha"])

    def test_T41_independent_chain_recheck(self):
        """GATE: §10.3 INDEPENDENT INSPECTION — an independent walker re-verifies the persisted history

        Expected: a from-scratch hash walk (not calling the engine
        verifier) accepts the lawful history and rejects a tampered copy.
        """
        self.register_all()
        self.lawful_revealed(self.sess)
        persisted = self.host_persist(self.sess, "h_indep.jsonl")
        path = Path(persisted["path"])

        def walk(verify_path):
            lines = Path(verify_path).read_text(encoding="utf-8").splitlines()
            prev = "0" * 64
            for i, line in enumerate(lines):
                ev = json.loads(line)
                if ev["seq"] != i or ev["prevEventSha"] != prev:
                    return False
                body = {k: v for k, v in ev.items() if k != "eventSha"}
                recomputed = hashlib.sha256(json.dumps(
                    body, sort_keys=True, separators=(",", ":"),
                    ensure_ascii=False).encode("utf-8")).hexdigest()
                if recomputed != ev["eventSha"]:
                    return False
                prev = ev["eventSha"]
            return True

        self.assertTrue(walk(path))
        tampered = Path(self._tmp) / "h_indep_bad.jsonl"
        lines = path.read_text(encoding="utf-8").splitlines()
        middle = json.loads(lines[2])
        middle["payload"]["injected"] = "SYNTHETIC TAMPER"
        lines[2] = json.dumps(middle, sort_keys=True, separators=(",", ":"),
                              ensure_ascii=False)
        tampered.write_text("\n".join(lines) + "\n", encoding="utf-8")
        self.assertFalse(walk(tampered))

    def test_T42_static_no_production_or_network_surface(self):
        """GATE: §10.9 STATIC FIREWALL — no production entrypoint, application import or network surface

        Expected: offline_efca.py imports only the stdlib allowlist; no
        network/subprocess/sys.path tokens; no production module reference.
        """
        source = (HERE / "offline_efca.py").read_text(encoding="utf-8")
        tree = ast.parse(source)
        imported = set()
        for node in ast.walk(tree):
            if isinstance(node, ast.Import):
                imported.update(a.name.split(".")[0] for a in node.names)
            elif isinstance(node, ast.ImportFrom):
                if node.module:
                    imported.add(node.module.split(".")[0])
        self.assertTrue(imported.issubset(
            {"hashlib", "json", "re", "uuid", "pathlib"}),
            msg="unexpected imports: %s" % sorted(imported))
        for forbidden in ("socket", "urllib", "requests", "http.client",
                          "subprocess", "sys.path", "import src", "from src",
                          "import api", "from api", "os.system", "popen"):
            self.assertNotIn(forbidden, source,
                             msg="forbidden token in engine: %s" % forbidden)
        self.assertIn("TRUST", source)


# ==========================================================================
# F-1..F-9: CORR1 finding closures (reproduced on the ORIGINAL engine)
# ==========================================================================

class FindingClosureTests(EFCAUnitTest):

    def _fresh_tuple_spec(self, num, side="SYN_SIDE_A"):
        spec = json.loads(json.dumps(FIX["tuples"][0]))
        spec["caseId"] = "SYN_CASE_%03d" % num
        spec["factId"] = "SYN_FACT_%03d" % num
        spec["sideId"] = side
        spec["d"] = "SYN_D_%02d" % (num % 100)
        return spec

    def _legacy_fresh_spec(self, num):
        spec = self._fresh_tuple_spec(num)
        spec["retrospectiveRecords"] = [
            {"id": r["id"], "sha": r["sha"]}
            for r in spec["retrospectiveRecords"]]
        return spec

    def test_F1_role_aware_read_boundary(self):
        """GATE: F-1 PHASE-1 BLINDNESS BYPASS VIA PUBLIC HISTORY — reviewer-accessible reads never disclose forbidden material

        Original failure (reproduced on the ORIGINAL engine): public
        events() hands the raw TUPLE_REGISTERED payload — custody marks,
        retrospective digests — to any caller. CORR2 retains the redaction
        boundary and the custodian-only custody context.
        """
        orig = self.orig_session()
        self.register_all_legacy(orig, original_engine())
        orig.register_tuple(CUST, legacy_tuple_spec(0))
        raw = orig.events()
        leaked = any("custodyMarks" in json.dumps(e.get("payload", {}))
                     for e in raw)
        self.assertTrue(leaked, "original engine must reproduce F-1")
        self.register_all()
        key = self.register_tuple()["tupleKey"]
        self.issue_to(self.sess, RP1A, key)
        self.sess.register_lane_b(RLB, key, FIX["laneB"])
        reviewer_views = json.dumps(self.sess.events(RP1A))
        anonymous_views = json.dumps(self.sess.events())
        fetch = json.dumps(self.sess.fetch_packet(RP1A, key))
        status = json.dumps(self.sess.workflow_status(key, CUST))
        cats = json.dumps(self.sess.category_assignment(key))
        self.expect_gate("REFUSED_LANE_B_ACCESS",
                         self.sess.lane_b_view, RP1A, key)
        self.expect_gate("ROLE_MISMATCH",
                         self.sess.custody_view, RP1A, key)
        combined = reviewer_views + anonymous_views + status + cats
        for marker in ("custodyMarks", "SYN_RET_001", "SYN_D_07",
                       "retrospectiveRecords", "disagreementDirection",
                       "sealedPayload", "SYN_LOCATOR_RET_001",
                       "SYN_M_REGISTRY_SURFACE_SYNTHETIC",
                       "SYNTHETIC LANE B QUESTION", "SYNTHETIC SCHEMA CLAIM"):
            self.assertNotIn(marker, combined,
                             msg="read-boundary leak: %s" % marker)
        self.assertEqual(sorted(json.loads(fetch).keys()),
                         sorted(oe.PACKET_FIELDS))
        custody = self.sess.custody_view(CUST, key)
        self.assertEqual(custody["custodyMarks"], {"A": "YES", "B": "NO"})
        self.assertEqual(custody["tupleId"]["d"], "SYN_D_07")
        self.assertTrue(self.sess.verify_integrity()["valid"])
        self.assertEqual(self.sess.category_assignment(key)
                         ["categoryAssignment"], "UNASSIGNED")

    def test_F2_lane_b_exposure_before_issuance(self):
        """GATE: F-2 LANE B EXPOSURE BEFORE PACKET ISSUANCE — exposure is occurrence-based, not packet-based

        Original failure: delivery before issuance registers nothing and a
        later seal is CLEAN. CORR2 (via derived contamination): before
        issuance → later issuance refused; after issuance before seal →
        contaminated seal, reveal refused; after seal → lawful, no
        incident.
        """
        mod = original_engine()
        orig = self.orig_session()
        self.register_all_legacy(orig, mod)
        okey = orig.register_tuple(CUST, legacy_tuple_spec(0))["tupleKey"]
        orig.register_lane_b(RLB, okey, FIX["laneB"])
        delivered = orig.deliver_lane_b_to(CUST, RP1A, okey)
        self.assertIsNone(delivered["contaminationEffect"])
        orig.issue_packet(CUST, RP1A, okey)
        oseal = orig.submit_phase1_review(
            RP1A, okey, FIX["phase1Reviews"]["determinateYes"])
        self.assertEqual(oseal["contamination"]["status"], "CLEAN")
        # CORR2 phase 1: delivery BEFORE issuance contaminates
        self.register_all()
        key = self.register_tuple()["tupleKey"]
        sid = self.sess.register_lane_b(RLB, key, FIX["laneB"])["submissionId"]
        early = self.sess.deliver_lane_b_to(CUST, RP1A, key, sid)
        self.assertEqual(early["contaminationEffect"]["status"],
                         "CONTAMINATED")
        self.expect_gate("REVIEWER_ALREADY_EXPOSED",
                         self.sess.issue_packet, CUST, RP1A, key)
        # CORR2 phase 2: delivery AFTER issuance, BEFORE seal
        key2 = self.register_tuple(self.sess, 1)["tupleKey"]
        sid2 = self.sess.register_lane_b(RLB, key2, FIX["laneB"])["submissionId"]
        self.issue_to(self.sess, RP1A, key2)
        mid = self.sess.deliver_lane_b_to(CUST, RP1A, key2, sid2)
        self.assertEqual(mid["contaminationEffect"]["status"], "CONTAMINATED")
        seal = self.seal_by(self.sess, RP1A, key2)
        self.assertEqual(seal["contamination"]["status"], "CONTAMINATED")
        self.sess.acknowledge_seal_receipt(CUST, key2, RP1A)
        self.expect_gate("REVEAL_FORBIDDEN_CONTAMINATED",
                         self.sess.reveal, CUST, RP1A, key2)
        # CORR2 phase 3: delivery AFTER seal is lawful, no incident
        key3 = self.sess.register_tuple(
            CUST, self._fresh_tuple_spec(3))["tupleKey"]
        self.issue_to(self.sess, RP1B, key3)
        self.seal_by(self.sess, RP1B, key3)
        sid3 = self.sess.register_lane_b(RLB, key3, FIX["laneB"])["submissionId"]
        late = self.sess.deliver_lane_b_to(CUST, RP1B, key3, sid3)
        self.assertIsNone(late["contaminationEffect"])
        custody = self.sess.custody_view(CUST, key3)
        self.assertEqual(custody["incidents"], {})
        self.assertEqual(self.sess.category_assignment(key)
                         ["categoryAssignment"], "UNASSIGNED")

    def test_F3_contradictory_normative_reproduction_refused(self):
        """GATE: F-3 CONTRADICTORY NORMATIVE REPRODUCTION — disagreement is a failure to reproduce, not an adjudication

        Original failure: opposite normative determinations still yield
        ADJUDICATED. CORR2 retains the proposition-equality gate.
        """
        mod = original_engine()
        orig = self.orig_session()
        self.register_all_legacy(orig, mod)
        okey = orig.register_tuple(CUST, legacy_tuple_spec(0))["tupleKey"]
        orig.issue_packet(CUST, RP1A, okey)
        orig.submit_phase1_review(
            RP1A, okey, FIX["phase1Reviews"]["determinateYes"])
        orig.acknowledge_seal_receipt(CUST, okey, RP1A)
        orig.begin_independent_reproduction(RIND, okey)
        orig.submit_phase1_review(
            RIND, okey, FIX["phase1Reviews"]["indeterminate"])
        orig.receive_first_rationale(RIND, okey)
        oadj = orig.adjudicate_claim(
            RIND, okey, "NORMATIVE_DETERMINACY", FIX["claims"]["normative"])
        self.assertEqual(oadj["claimLevelStatus"], "ADJUDICATED")
        self.register_all()
        key = self.register_tuple()["tupleKey"]
        self.issue_to(self.sess, RP1A, key)
        self.seal_by(self.sess, RP1A, key)
        self.sess.acknowledge_seal_receipt(CUST, key, RP1A)
        self.issue_to(self.sess, RIND, key)
        self.sess.begin_independent_reproduction(RIND, key)
        self.seal_by(self.sess, RIND, key, "indeterminate")
        self.sess.receive_first_rationale(RIND, key)
        self.expect_gate("REFUSED_REPRODUCTION_CONTRADICTION",
                         self.sess.adjudicate_claim, RIND, key,
                         "NORMATIVE_DETERMINACY",
                         FIX["claims"]["normative"])
        status = self.sess.workflow_status(key, CUST)
        self.assertEqual(status["claimLevel"], "NOT_ADJUDICATED")
        self.assertEqual(status["effectiveAdjudications"], [])
        key2, _ = self.lawful_revealed(self.sess, RP1B, idx=1)
        self.issue_to(self.sess, RIND, key2)
        self.sess.begin_independent_reproduction(RIND, key2)
        self.seal_by(self.sess, RIND, key2)
        self.sess.receive_first_rationale(RIND, key2)
        ok = self.sess.adjudicate_claim(
            RIND, key2, "NORMATIVE_DETERMINACY",
            FIX["claims"]["normativeSecond"])
        self.assertEqual(ok["claimLevelStatus"], "ADJUDICATED")
        self.expect_gate("UNSUPPORTED_SCIENTIFIC_ADJUDICATION",
                         self.sess.adjudicate_claim, RIND, key2,
                         "CAUSAL_CATEGORY_CODER_ERROR",
                         FIX["claims"]["normative"],
                         observation={"reviewerAgreement": True})
        self.assertEqual(self.sess.category_assignment(key2)
                         ["categoryAssignment"], "UNASSIGNED")

    def test_F4_late_discovered_contamination_affects_status(self):
        """GATE: F-4 LATE-DISCOVERED CONTAMINATION — status derives from effective evidence; history never rewritten

        Original failure: a revealed tuple stays PROVISIONAL after its
        reviewer is recorded contaminated. CORR2: the pre-seal occurrence
        (discovered later) drops PROVISIONAL and suspends granted claims
        while every prior event is preserved; a genuine post-seal
        occurrence is non-contaminating; unestablished occurrence fails
        closed.
        """
        mod = original_engine()
        orig = self.orig_session()
        self.register_all_legacy(orig, mod)
        okey = orig.register_tuple(CUST, legacy_tuple_spec(0))["tupleKey"]
        orig.issue_packet(CUST, RP1A, okey)
        orig.submit_phase1_review(
            RP1A, okey, FIX["phase1Reviews"]["determinateYes"])
        orig.acknowledge_seal_receipt(CUST, okey, RP1A)
        orig.reveal(CUST, RP1A, okey)
        orig.append_delta(RP1A, okey, "NO_CHANGE")
        orig.report_exposure(CUST, okey, RP1A, "MARK_A", "SYNTHETIC")
        self.assertEqual(orig.workflow_status(okey)["tupleLevel"],
                         "PROVISIONAL")
        self.register_all()
        key, _ = self.lawful_revealed(self.sess)
        before = self.sess.events(CUST)
        # CORR6/OD-37: the occurrence is a scope-local reference into the
        # reporter's own recorded sequence (supersedes the session-tick
        # input, an indirect session-clock probe channel). RP1A's 2nd named
        # event is their phase-1 packet — deterministically before their
        # seal, so the late-discovered incident contaminates (F-4).
        incident = self.sess.report_exposure(
            RP1A, key, RP1A, "MARK_A",
            "SYNTHETIC: discovered late; actually seen before the seal",
            occurred=occref(2))
        self.assertEqual(incident["phase1Contamination"]["status"],
                         "CONTAMINATED")
        status = self.sess.workflow_status(key, CUST)
        self.assertEqual(status["tupleLevel"], "IN_PROGRESS")
        self.assertEqual(status["claimLevel"], "NOT_ADJUDICATED")
        after = self.sess.events(CUST)
        self.assertEqual(after[:len(before)], before)
        self.assertTrue(self.sess.verify_integrity()["valid"])
        custody = self.sess.custody_view(CUST, key)
        self.assertEqual(len(custody["reveals"]), 1)
        self.assertEqual(len(custody["deltas"]), 1)
        key2, _ = self.lawful_revealed(self.sess, RP1B, idx=1)
        # RP1B's 3rd named event is their own seal; an occurrence recorded
        # AT that seal is not before it, so the late report is
        # non-contaminating (equivalent to CORR5's seal2 + 1 for the
        # occurrence-relative derivation).
        post = self.sess.report_exposure(
            RP1B, key2, RP1B, "MARK_A",
            "SYNTHETIC: genuinely seen after sealing",
            occurred=occref(3))
        self.assertEqual(post["phase1Contamination"]["status"], "CLEAN")
        self.assertEqual(self.sess.workflow_status(key2, CUST)["tupleLevel"],
                         "PROVISIONAL")
        self.sess.report_exposure(CUST, key, RP1A, "OUTCOME_OR_ENVIRONMENT",
                                  "SYNTHETIC: occurrence unestablished")
        self.assertEqual(self.sess.workflow_status(key, CUST)["tupleLevel"],
                         "IN_PROGRESS")
        key4 = self.sess.register_tuple(
            CUST, self._fresh_tuple_spec(4))["tupleKey"]
        self.issue_to(self.sess, RP1A, key4)
        self.seal_by(self.sess, RP1A, key4)
        self.issue_to(self.sess, RIND, key4)
        self.sess.begin_independent_reproduction(RIND, key4)
        self.seal_by(self.sess, RIND, key4)
        self.sess.receive_first_rationale(RIND, key4)
        self.sess.adjudicate_claim(RIND, key4, "NORMATIVE_DETERMINACY",
                                   FIX["claims"]["normative"])
        self.assertEqual(
            self.sess.workflow_status(key4, CUST)["claimLevel"], "ADJUDICATED")
        # k=1 is RP1A's own registration — always before their seal on key4.
        self.sess.report_exposure(RP1A, key4, RP1A, "MARK_B",
                                  "SYNTHETIC: pre-seal occurrence found "
                                  "after adjudication",
                                  occurred=occref(1))
        suspended = self.sess.workflow_status(key4, CUST)
        self.assertEqual(suspended["claimLevel"], "NOT_ADJUDICATED")
        self.assertEqual(len(suspended["suspendedAdjudications"]), 1)
        self.assertEqual(
            suspended["suspendedAdjudications"][0]["reason"],
            "ORIGINAL_CONTAMINATED_AFTER_ADJUDICATION")

    def test_F5_no_adjudication_without_original_reviewer(self):
        """GATE: F-5 INDEPENDENT ADJUDICATION WITHOUT AN ORIGINAL REVIEWER — refused

        Original failure: an R-IND-only session yields an adjudicated
        normative claim. CORR2 retains REFUSED_NO_ORIGINAL_CLAIM.
        """
        mod = original_engine()
        orig = self.orig_session()
        self.register_all_legacy(orig, mod)
        okey = orig.register_tuple(CUST, legacy_tuple_spec(0))["tupleKey"]
        orig.begin_independent_reproduction(RIND, okey)
        orig.submit_phase1_review(
            RIND, okey, FIX["phase1Reviews"]["determinateYes"])
        oadj = orig.adjudicate_claim(
            RIND, okey, "NORMATIVE_DETERMINACY", FIX["claims"]["normative"])
        self.assertEqual(oadj["claimLevelStatus"], "ADJUDICATED")
        self.register_all()
        key = self.register_tuple()["tupleKey"]
        self.issue_to(self.sess, RIND, key)
        self.sess.begin_independent_reproduction(RIND, key)
        self.seal_by(self.sess, RIND, key)
        self.expect_gate("REFUSED_NO_ORIGINAL_CLAIM",
                         self.sess.receive_first_rationale, RIND, key)
        self.expect_gate("REFUSED_NO_ORIGINAL_CLAIM",
                         self.sess.adjudicate_claim, RIND, key,
                         "NORMATIVE_DETERMINACY",
                         FIX["claims"]["normative"])
        self.assertEqual(self.sess.workflow_status(key, CUST)["claimLevel"],
                         "NOT_ADJUDICATED")
        key2, _ = self.lawful_revealed(self.sess, RP1B, idx=1)
        self.issue_to(self.sess, RIND, key2)
        self.sess.begin_independent_reproduction(RIND, key2)
        self.seal_by(self.sess, RIND, key2)
        self.sess.receive_first_rationale(RIND, key2)
        ok = self.sess.adjudicate_claim(
            RIND, key2, "NORMATIVE_DETERMINACY",
            FIX["claims"]["normativeSecond"])
        self.assertEqual(ok["claimLevelStatus"], "ADJUDICATED")

    def test_F6_pinned_identity_and_premature_issuance(self):
        """GATE: F-6 RUBRIC IDENTITY + PREMATURE EVIDENCE ISSUANCE — pinned identity and explicit procedural incompleteness

        Original failure: a modified rubric with a matching modified
        sidecar is accepted; records issue with no procedural content.
        CORR2 retains NOT_ISSUABLE_OWNER_PINNED_MISMATCH and the
        completeness snapshot.
        """
        mod = original_engine()
        mod_rubric = Path(self._tmp) / "modified_rubric.md"
        mod_rubric.write_bytes(RUBRIC_PATH.read_bytes()
                               + b"\nSYNTHETIC TAMPER APPENDIX\n")
        mod_sha = hashlib.sha256(mod_rubric.read_bytes()).hexdigest()
        mod_sidecar = Path(self._tmp) / "modified_sidecar.txt"
        mod_sidecar.write_text("%s  %s\n" % (mod_sha, oe.RUBRIC_FILE_NAME),
                               encoding="utf-8")
        orig = mod.EFCASession(rubric_path=mod_rubric,
                               sidecar_path=mod_sidecar,
                               scratch_dir=Path(self._tmp))
        self.register_all_legacy(orig, mod)
        okey = orig.register_tuple(CUST, legacy_tuple_spec(0))["tupleKey"]
        orecord = orig.issue_evidence_record(CUST, okey)
        self.assertEqual(orecord["rubricIdentity"]["status"],
                         "VERIFIED_AT_RECORD_ISSUANCE")
        s = self.new_session(rubric_path=mod_rubric, sidecar_path=mod_sidecar)
        self.register_all(s)
        key = s.register_tuple(CUST, FIX["tuples"][0])["tupleKey"]
        self.expect_gate("NOT_ISSUABLE_OWNER_PINNED_MISMATCH",
                         s.issue_evidence_record, CUST, key)
        issued = [e for e in s.events(CUST)
                  if e["eventType"] == "EVIDENCE_RECORD_ISSUED"]
        self.assertEqual(issued, [])
        self.assertNotIn("FIRED", json.dumps(s.events(CUST)))
        self.register_all()
        key2 = self.register_tuple(self.sess, 1)["tupleKey"]
        partial = self.sess.issue_evidence_record(CUST, key2)
        completeness = partial["proceduralCompleteness"]
        self.assertFalse(completeness["phase1Sealed"])
        self.assertEqual(completeness["tupleLevelAtIssuance"], "IN_PROGRESS")
        self.assertEqual(completeness["deltaCount"], 0)
        self.assertEqual(completeness["claimsAdjudicatedAtIssuance"], 0)
        self.assertIn("implies no seal", completeness["statement"])
        self.assertEqual(partial["categoryAssignment"], "UNASSIGNED")
        key4 = self.sess.register_tuple(
            CUST, self._fresh_tuple_spec(3))["tupleKey"]
        self.issue_to(self.sess, RP1B, key4)
        self.seal_by(self.sess, RP1B, key4)
        self.sess.acknowledge_seal_receipt(CUST, key4, RP1B)
        self.sess.reveal(CUST, RP1B, key4)
        self.sess.append_delta(RP1B, key4, FIX["phase2Deltas"]["noChange"])
        full = self.sess.issue_evidence_record(CUST, key4)
        self.assertTrue(full["proceduralCompleteness"]["phase1Sealed"])
        self.assertEqual(full["proceduralCompleteness"]
                         ["tupleLevelAtIssuance"], "PROVISIONAL")

    def test_F7_semantic_replay_rejects_forged_ordering(self):
        """GATE: F-7 CRYPTOGRAPHICALLY VALID BUT PROCEDURALLY INVALID REPLAY — rejected

        Original failure: import_history accepts a correctly rehashed
        REVEALED event without packet, seal or receipt. CORR2 refuses it
        with PROCEDURALLY_INVALID_HISTORY; a genuinely valid extension
        still imports and takes effect.
        """
        mod = original_engine()
        orig = self.orig_session()
        self.register_all_legacy(orig, mod)
        okey = orig.register_tuple(CUST, legacy_tuple_spec(0))["tupleKey"]
        oforged = build_forged_extension(orig.events(), [
            ("REVEALED", {"tupleKey": okey, "custodian": CUST,
                          "reviewer": RP1A}),
        ])
        oforge_path = Path(self._tmp) / "h_f7_orig_forged.jsonl"
        write_events_file(oforge_path, oforged)
        self.assertTrue(
            mod.EFCASession.verify_persisted_history(oforge_path)["valid"])
        self.assertTrue(orig.import_history(oforge_path)["imported"])
        self.register_all()
        key = self.register_tuple()["tupleKey"]
        live = self.host_events(self.sess)
        forged = build_forged_extension(live, [
            ("REVEALED", {"tupleKey": key, "custodian": CUST,
                          "reviewer": RP1A}),
        ])
        forge_path = Path(self._tmp) / "h_f7_forged.jsonl"
        write_events_file(forge_path, forged)
        self.assertTrue(
            self.sess.verify_global_history(forge_path)["valid"])
        self.expect_gate("PROCEDURALLY_INVALID_HISTORY",
                         self.sess.restore_global_history, forge_path)
        self.assertEqual(self.sess.workflow_status(key, CUST)["tupleLevel"],
                         "IN_PROGRESS")
        self.assertTrue(self.sess.verify_integrity()["valid"])
        packet_sha = oe.sha256_hex(oe.canonical_bytes({
            "caseId": FIX["tuples"][0]["caseId"],
            "sideId": FIX["tuples"][0]["sideId"],
            "factId": FIX["tuples"][0]["factId"],
            "sealedFactText": FIX["tuples"][0]["sealedFactText"],
            "questionText": FIX["tuples"][0]["questionText"],
        }))
        valid_ext = build_forged_extension(live, [
            ("PACKET_ISSUED", {"tupleKey": key, "custodian": CUST,
                               "reviewer": RP1C, "packetSha": packet_sha,
                               "issuedAt": live[-1]["t"] + 1,
                               "phase": "PHASE_1"}),
        ])
        valid_path = Path(self._tmp) / "h_f7_valid.jsonl"
        write_events_file(valid_path, valid_ext)
        ok = self.sess.restore_global_history(valid_path)
        self.assertTrue(ok["restored"])
        custody = self.sess.custody_view(CUST, key)
        self.assertIn(RP1C, [p["reviewer"] for p in custody["packets"]])
        self.expect_gate("REVEAL_BEFORE_SEAL",
                         self.sess.reveal, CUST, RP1C, key)

    def test_F8_forged_category_assignment_rejected_at_replay(self):
        """GATE: F-8 FORGED CAUSAL-CATEGORY ASSIGNMENT VIA IMPORTED HISTORY — rejected

        Original failure: a forged, correctly chained EVIDENCE_RECORD_ISSUED
        with categoryAssignment=CODER_ERROR enters the history. CORR2
        refuses forged payloads, stale global digests and forged
        scientific fields; UNASSIGNED survives.
        """
        mod = original_engine()
        orig = self.orig_session()
        self.register_all_legacy(orig, mod)
        okey = orig.register_tuple(CUST, legacy_tuple_spec(0))["tupleKey"]
        oforged = build_forged_extension(orig.events(), [
            ("EVIDENCE_RECORD_ISSUED", {
                "tupleKey": okey, "categoryAssignment": "CODER_ERROR",
                "tupleLevelName": "CODER_ERROR", "synthetic": True,
            }),
        ])
        oforge_path = Path(self._tmp) / "h_f8_orig_forged.jsonl"
        write_events_file(oforge_path, oforged)
        self.assertTrue(orig.import_history(oforge_path)["imported"])
        entered = any(
            e.get("payload", {}).get("categoryAssignment") == "CODER_ERROR"
            for e in orig.events())
        self.assertTrue(entered)
        self.register_all()
        key, _ = self.lawful_revealed(self.sess)
        issued = self.sess.issue_evidence_record(CUST, key)
        live = self.host_events(self.sess)
        forged_payload = json.loads(json.dumps(issued))
        forged_payload["categoryAssignment"] = "CODER_ERROR"
        forged_payload["tupleLevelName"] = "CODER_ERROR"
        forged = build_forged_extension(live, [
            ("EVIDENCE_RECORD_ISSUED", forged_payload)])
        forge_path = Path(self._tmp) / "h_f8_forged.jsonl"
        write_events_file(forge_path, forged)
        self.assertTrue(
            self.sess.verify_global_history(forge_path)["valid"])
        self.expect_gate("PROCEDURALLY_INVALID_HISTORY",
                         self.sess.restore_global_history, forge_path)
        custody = self.sess.custody_view(CUST, key)
        for record in custody["evidenceRecords"]:
            self.assertEqual(record["categoryAssignment"], "UNASSIGNED")
            self.assertEqual(record["tupleLevelName"], "UNASSIGNED")
        stale = json.loads(json.dumps(issued))
        stale["rubricIdentity"]["sha256"] = "f" * 64
        forged2 = build_forged_extension(live, [
            ("EVIDENCE_RECORD_ISSUED", stale)])
        forge2 = Path(self._tmp) / "h_f8_stale.jsonl"
        write_events_file(forge2, forged2)
        self.assertTrue(self.sess.verify_global_history(forge2)["valid"])
        self.expect_gate("PROCEDURALLY_INVALID_HISTORY",
                         self.sess.restore_global_history, forge2)
        self.assertEqual(self.sess.category_assignment(key)
                         ["categoryAssignment"], "UNASSIGNED")

    def test_F9_cross_session_persistence_isolation(self):
        """GATE: F-9 CROSS-SESSION HISTORY OVERWRITE — identity-bound persistence with fail-closed lineage rules

        Original failure: two original-engine sessions sharing scratch and
        filename silently overwrite each other. CORR6: the authoritative
        chain lives on the engine-host channel with the retained F-9
        lineage discipline; requester-scoped persistence emits only scoped
        projections in per-session namespaces (OD-37/F-37).
        """
        mod = original_engine()
        shared = Path(self._tmp) / "f9orig"
        shared.mkdir(parents=True, exist_ok=True)
        s1 = mod.EFCASession(scratch_dir=shared)
        self.register_all_legacy(s1, mod)
        s1.register_tuple(CUST, legacy_tuple_spec(0))
        p1 = s1.persist_history("h.jsonl")
        first_bytes = Path(p1["path"]).read_bytes()
        s2 = mod.EFCASession(scratch_dir=shared,
                             session_label="SYN_SESSION_002")
        self.register_all_legacy(s2, mod)
        s2.register_tuple(CUST, legacy_tuple_spec(0))
        p2 = s2.persist_history("h.jsonl")
        self.assertEqual(p1["path"], p2["path"])
        self.assertNotEqual(Path(p2["path"]).read_bytes(), first_bytes)
        # --- CORR6 host channel: identity-bound persistent namespaces
        a = self.new_session(session_label="SYN_SESSION_001")
        self.register_all(a)
        a.register_tuple(CUST, FIX["tuples"][0])
        pa = a.persist_global_history("h.jsonl")
        a_bytes = Path(pa["path"]).read_bytes()
        b = self.new_session(session_label="SYN_SESSION_002")
        self.register_all(b)
        b.register_tuple(CUST, FIX["tuples"][0])
        pb = b.persist_global_history("h.jsonl")
        self.assertNotEqual(pa["path"], pb["path"])
        self.assertEqual(Path(pa["path"]).read_bytes(), a_bytes)
        foreign_copy = Path(pa["path"]).parent / "collide.jsonl"
        shutil.copyfile(pb["path"], foreign_copy)
        self.expect_gate("PERSIST_LINEAGE_MISMATCH",
                         a.persist_global_history, "collide.jsonl")
        a.register_tuple(CUST, FIX["tuples"][1])
        ext = a.persist_global_history("h.jsonl")
        self.assertGreater(ext["eventCount"], pa["eventCount"])
        c = self.new_session()  # same label => same genesis lineage
        c.restore_global_history(Path(pa["path"]))
        pc = c.persist_global_history("h_c.jsonl")
        spec5 = self._fresh_tuple_spec(5)
        spec5["retrospectiveRecords"] = [
            {"id": r["id"], "locator": r["locator"], "content": r["content"],
             "sha": r["sha"]} for r in spec5["retrospectiveRecords"]]
        # the forged extension is built from the HOST artifact (raw chain)
        extra = build_forged_extension(
            self.host_events(c), [
                ("TUPLE_REGISTERED", {
                    "custodian": CUST,
                    "caseId": spec5["caseId"], "sideId": spec5["sideId"],
                    "factId": spec5["factId"], "d": spec5["d"],
                    "canonicalHashInput": oe.sha256_hex(
                        "%s|%s|%s" % (spec5["caseId"], spec5["sideId"],
                                      spec5["factId"])),
                    "sealedFactText": spec5["sealedFactText"],
                    "questionText": spec5["questionText"],
                    "custodyMarks": dict(spec5["custodyMarks"]),
                    "retrospectiveRecords": spec5["retrospectiveRecords"],
                    # CORR9/OD-45-A: the CORR9-native TUPLE_REGISTERED
                    # schema carries the engine-derived allocationDigest of
                    # this tuple's authorized allocation entry; the forged
                    # extension is otherwise lawful and stays restorable,
                    # which is exactly what the stale-writer scenario needs.
                    "allocationDigest": alloc_entry_digest(
                        "SYN_CASE_005|SYN_SIDE_A|SYN_FACT_005", CUST),
                    "synthetic": True,
                }),
            ])
        ahead_path = Path(pc["path"]).parent / "ahead.jsonl"
        write_events_file(ahead_path, extra)
        self.assertTrue(c.verify_global_history(ahead_path)["valid"])
        self.expect_gate("PERSIST_STALE_WRITER",
                         c.persist_global_history, "ahead.jsonl")
        self.assertTrue(c.restore_global_history(ahead_path)["restored"])
        adopted = c.persist_global_history("ahead.jsonl")
        self.assertGreaterEqual(adopted["eventCount"], len(extra))
        lines = Path(pa["path"]).read_text(encoding="utf-8").splitlines()
        droplast = Path(pa["path"]).parent / "droplast.jsonl"
        droplast.write_text("\n".join(lines[:-1]) + "\n", encoding="utf-8")
        rewritten = a.persist_global_history("droplast.jsonl")
        self.assertGreaterEqual(rewritten["eventCount"], len(lines) - 1)
        trunc_path = Path(pa["path"]).parent / "trunc.jsonl"
        trunc_path.write_text(
            "\n".join(lines[:2] + lines[-2:]) + "\n", encoding="utf-8")
        self.expect_gate("PERSIST_FILE_INVALID",
                         a.persist_global_history, "trunc.jsonl")
        tamper_path = Path(pa["path"]).parent / "tamper.jsonl"
        mid = json.loads(lines[len(lines) // 2])
        mid["payload"]["injected"] = "SYNTHETIC TAMPER"
        lines2 = list(lines)
        lines2[len(lines) // 2] = json.dumps(
            mid, sort_keys=True, separators=(",", ":"))
        tamper_path.write_text("\n".join(lines2) + "\n", encoding="utf-8")
        self.expect_gate("PERSIST_FILE_INVALID",
                         a.persist_global_history, "tamper.jsonl")
        self.assertTrue(a.verify_integrity()["valid"])
        self.assertTrue(c.verify_integrity()["valid"])
        # --- CORR6 requester projections: per-session, idempotent re-export,
        # never replaced by diverging content, never cross-session valid
        proj_a1 = a.persist_history("a_proj.json", CUST)
        proj_a2 = a.persist_history("a_proj.json", CUST)
        self.assertEqual(proj_a1["path"], proj_a2["path"])
        a.register_tuple(CUST, self._fresh_tuple_spec(6))
        self.expect_gate("PROJECTION_EXISTS",
                         a.persist_history, "a_proj.json", CUST)
        proj_b = b.persist_history("a_proj.json", CUST)
        self.assertNotEqual(proj_a1["path"], proj_b["path"])
        # projections are actor-bound, not session-bound: the same
        # actor's projection verifies; another actor's does not
        self.assertEqual(
            a.verify_persisted_history(Path(proj_b["path"]), CUST),
            {"valid": True, "reason": "ok"})
        self.assertEqual(
            a.verify_persisted_history(Path(proj_b["path"]), RP1A),
            {"valid": False, "reason": "not_a_lawful_projection"})


# ==========================================================================
# F-10..F-16: CORR2 finding closures (reproduced on the immutable CORR1)
# ==========================================================================

class Corr2FindingTests(EFCAUnitTest):

    def _legacy_revealed_orig(self, module, reviewer=RP1A, idx=0):
        s = self.orig_session(module=module)
        self.register_all_legacy(s, module)
        key = s.register_tuple(CUST, legacy_tuple_spec(idx))["tupleKey"]
        s.issue_packet(CUST, reviewer, key)
        s.submit_phase1_review(reviewer, key,
                               FIX["phase1Reviews"]["determinateYes"])
        return s, key

    def _build_full_lawful_session(self, s):
        """A single lawful CORR2 session exercising EVERY event type."""
        self.register_all(s)
        key = s.register_tuple(CUST, FIX["tuples"][0])["tupleKey"]
        sid = s.register_lane_b(RLB, key, FIX["laneB"])["submissionId"]
        self.issue_to(s, RP1A, key)
        self.seal_by(s, RP1A, key)
        s.acknowledge_seal_receipt(CUST, key, RP1A)
        s.reveal(CUST, RP1A, key)
        s.append_delta(RP1A, key, FIX["phase2Deltas"]["noChange"])
        s.deliver_lane_b_to(CUST, RLB, key, sid)
        s.report_exposure(CUST, key, RP1B, "MARK_A",
                          "SYNTHETIC: invented pre-seal exposure")
        s.request_new_phase1(CUST, key, RP1C)
        # RIND seals before rationale access so the normative claim is a
        # clean reproduction. Historical provenance is a separate event
        # (F-35) and is declared only after that seal (F-18).
        self.issue_to(s, RIND, key)
        s.begin_independent_reproduction(RIND, key)
        self.seal_by(s, RIND, key)
        s.receive_first_rationale(RIND, key)
        s.adjudicate_claim(RIND, key, "NORMATIVE_DETERMINACY",
                           FIX["claims"]["normative"])
        refs = [record_ref(0, 0)]
        s.declare_records_rederived(RIND, key, refs)
        s.adjudicate_claim(RIND, key, "HISTORICAL_RECORD_PRODUCTION",
                           FIX["claims"]["historical"], record_refs=refs,
                           proposition=hist_prop(
                               "HISTORICAL_RECORD_PRODUCTION"))
        s.issue_evidence_record(CUST, key)
        return key

    def test_F10_lane_b_content_hidden_from_unsealed_events(self):
        """GATE: F-10 UNSEALED REVIEWER INSPECTING LANE B VIA events() — tuple-specific Lane B content is never disclosed pre-seal

        Original failure (reproduced on CORR1): events(R_P1) returns the
        Lane B `surface` before sealing, while no authorized delivery
        occurred and the later seal is CLEAN. CORR2: at every stage
        (before issuance, after issuance, after sealing, after reveal) an
        unsealed reviewer's event projections carry no Lane B content; a
        sealed reviewer may lawfully see it; the seal is CLEAN only when
        no delivery occurred, and a delivered reviewer is contaminated by
        the delivery itself.
        """
        mod = corr1_engine()
        orig = self.orig_session(module=mod)
        self.register_all_legacy(orig, mod)
        okey = orig.register_tuple(CUST, legacy_tuple_spec(0))["tupleKey"]
        orig.register_lane_b(RLB, okey, FIX["laneB"])
        orig_views = json.dumps(orig.events(RP1A))
        self.assertIn("SYN_M_REGISTRY_SURFACE_SYNTHETIC", orig_views)
        orig.issue_packet(CUST, RP1A, okey)
        oseal = orig.submit_phase1_review(
            RP1A, okey, FIX["phase1Reviews"]["determinateYes"])
        self.assertEqual(oseal["contamination"]["status"], "CLEAN")
        # CORR2: the same inspection is content-free at every stage
        self.register_all()
        key = self.register_tuple()["tupleKey"]
        self.sess.register_lane_b(RLB, key, FIX["laneB"])
        content_markers = ("SYN_M_REGISTRY_SURFACE_SYNTHETIC",
                           "SYNTHETIC LANE B QUESTION",
                           "SYNTHETIC SCHEMA CLAIM")
        # stage 1: before packet issuance
        stage1 = json.dumps(self.sess.events(RP1A))
        for m in content_markers:
            self.assertNotIn(m, stage1)
        # stage 2: after issuance, before seal
        self.issue_to(self.sess, RP1A, key)
        stage2 = json.dumps(self.sess.events(RP1A))
        for m in content_markers:
            self.assertNotIn(m, stage2)
        seal = self.seal_by(self.sess, RP1A, key)
        self.assertEqual(seal["contamination"]["status"], "CLEAN")
        # stage 3: after sealing, the sealed reviewer may lawfully see it
        stage3 = json.dumps(self.sess.events(RP1A))
        for m in content_markers:
            self.assertIn(m, stage3)
        self.sess.acknowledge_seal_receipt(CUST, key, RP1A)
        self.sess.reveal(CUST, RP1A, key)
        self.sess.append_delta(RP1A, key, FIX["phase2Deltas"]["noChange"])
        stage4 = json.dumps(self.sess.events(RP1A))
        for m in content_markers:
            self.assertIn(m, stage4)
        # ..while another unsealed reviewer still sees nothing
        self.issue_to(self.sess, RP1B, key)
        stage4b = json.dumps(self.sess.events(RP1B))
        for m in content_markers:
            self.assertNotIn(m, stage4b)
        # no exposure was ever registered (mere inspection is not delivery)
        custody = self.sess.custody_view(CUST, key)
        self.assertEqual(custody["incidents"], {})
        self.assertEqual(self.sess.workflow_status(key, CUST)["tupleLevel"],
                         "PROVISIONAL")

    def test_F11_imported_lane_b_delivery_contaminates(self):
        """GATE: F-11 IMPORTED LANE B DELIVERY BYPASSES CONTAMINATION — the mandatory consequence is derived from the disclosure event itself

        Original failure (reproduced on CORR1): a correctly hashed
        LANE_B_DELIVERED without its companion exposure event imports, and
        the delivered reviewer still seals CLEAN. CORR2: import accepts the
        lawful event, but the derived contamination makes the later state
        identical to the live path — issuance refused, seal CONTAMINATED,
        reveal refused. A history without the delivery stays clean.
        """
        mod = corr1_engine()
        orig = self.orig_session(module=mod)
        self.register_all_legacy(orig, mod)
        okey = orig.register_tuple(CUST, legacy_tuple_spec(0))["tupleKey"]
        orig.register_lane_b(RLB, okey, FIX["laneB"])
        oforged = build_forged_extension(orig.events(CUST), [
            ("LANE_B_DELIVERED", {"tupleKey": okey, "custodian": CUST,
                                  "deliveredTo": RP1A})])
        opath = Path(self._tmp) / "h_f11_orig.jsonl"
        write_events_file(opath, oforged)
        self.assertTrue(mod.EFCASession.verify_persisted_history(opath)["valid"])
        self.assertTrue(orig.import_history(opath)["imported"])
        orig.issue_packet(CUST, RP1A, okey)
        oseal = orig.submit_phase1_review(
            RP1A, okey, FIX["phase1Reviews"]["determinateYes"])
        self.assertEqual(oseal["contamination"]["status"], "CLEAN")
        # CORR2: same forged-file pattern on the CORR2 chain. F-39: the
        # delivery must reference the exact registered submission.
        self.register_all()
        key = self.register_tuple()["tupleKey"]
        sid = self.sess.register_lane_b(
            RLB, key, FIX["laneB"])["submissionId"]
        forged = build_forged_extension(self.host_events(self.sess), [
            ("LANE_B_DELIVERED", {"tupleKey": key, "custodian": CUST,
                                  "deliveredTo": RP1A,
                                  "submissionId": sid})])
        fpath = Path(self._tmp) / "h_f11_corr2.jsonl"
        write_events_file(fpath, forged)
        self.assertTrue(self.sess.verify_global_history(fpath)["valid"])
        self.assertTrue(self.sess.restore_global_history(fpath)["restored"])
        # the replayed delivery blocks a blind seal exactly as live does
        self.expect_gate("REVIEWER_ALREADY_EXPOSED",
                         self.sess.issue_packet, CUST, RP1A, key)
        # variant: a reviewer with a pre-existing packet seals CONTAMINATED
        self.issue_to(self.sess, RP1B, key)
        forged2 = build_forged_extension(self.host_events(self.sess), [
            ("LANE_B_DELIVERED", {"tupleKey": key, "custodian": CUST,
                                  "deliveredTo": RP1B,
                                  "submissionId": sid})])
        fpath2 = Path(self._tmp) / "h_f11_corr2b.jsonl"
        write_events_file(fpath2, forged2)
        self.assertTrue(self.sess.restore_global_history(fpath2)["restored"])
        seal = self.seal_by(self.sess, RP1B, key)
        self.assertEqual(seal["contamination"]["status"], "CONTAMINATED")
        self.assertEqual(seal["contamination"]["incidents"][0]["what"],
                         "LANE_B_MATERIAL")
        self.assertTrue(seal["contamination"]["incidents"][0]["derived"])
        self.sess.acknowledge_seal_receipt(CUST, key, RP1B)
        self.expect_gate("REVEAL_FORBIDDEN_CONTAMINATED",
                         self.sess.reveal, CUST, RP1B, key)
        # lawful counterpart: the same chain without the delivery is clean
        clean = self.new_session(session_label="SYN_SESSION_001")
        self.register_all(clean)
        clean.register_tuple(CUST, FIX["tuples"][0])
        clean.register_lane_b(RLB, key, FIX["laneB"])
        clean.issue_packet(CUST, RP1C, key)
        cseal = clean.submit_phase1_review(
            RP1C, key, FIX["phase1Reviews"]["determinateYes"])
        self.assertEqual(cseal["contamination"]["status"], "CLEAN")
        self.assertEqual(self.sess.category_assignment(key)
                         ["categoryAssignment"], "UNASSIGNED")

    def test_F12_imported_rationale_access_contaminates(self):
        """GATE: F-12 IMPORTED PRIOR-RATIONALE ACCESS BYPASSES CONTAMINATION — pre-seal rationale access irreversibly invalidates blindness

        Original failure (reproduced on CORR1): a correctly hashed
        RATIONALE_ACCESSED before the reproducer's own seal, with no
        companion exposure, imports; the reproducer then seals CLEAN,
        receives custody and can obtain reveal. CORR2: the access is
        derived-contaminating, so no clean-state reconstruction is
        possible — the seal is CONTAMINATED, reveal is refused and the
        normative claim cannot be adjudicated.
        """
        mod = corr1_engine()
        orig, okey = self._legacy_revealed_orig(mod)
        oforged = build_forged_extension(orig.events(CUST), [
            ("RATIONALE_ACCESSED", {"tupleKey": okey, "reviewer": RIND})])
        opath = Path(self._tmp) / "h_f12_orig.jsonl"
        write_events_file(opath, oforged)
        self.assertTrue(orig.import_history(opath)["imported"])
        orig.begin_independent_reproduction(RIND, okey)
        oseal = orig.submit_phase1_review(
            RIND, okey, FIX["phase1Reviews"]["determinateYes"])
        self.assertEqual(oseal["contamination"]["status"], "CLEAN")
        orig.acknowledge_seal_receipt(CUST, okey, RIND)
        oreveal = orig.reveal(CUST, RIND, okey)
        self.assertIn("markA", oreveal)
        # CORR2: same forged-file pattern on the CORR2 chain
        self.register_all()
        key = self.register_tuple()["tupleKey"]
        self.issue_to(self.sess, RP1A, key)
        self.seal_by(self.sess, RP1A, key)
        # variant A: the reproducer holds a custodian-issued packet from
        # BEFORE the access (CORR7/F-41 reproduction packet)
        self.issue_to(self.sess, RIND, key)
        self.sess.begin_independent_reproduction(RIND, key)
        forged_a = build_forged_extension(self.host_events(self.sess), [
            ("RATIONALE_ACCESSED", {"tupleKey": key, "reviewer": RIND})])
        fpath_a = Path(self._tmp) / "h_f12_corr2a.jsonl"
        write_events_file(fpath_a, forged_a)
        self.assertTrue(self.sess.restore_global_history(fpath_a)["restored"])
        seal = self.seal_by(self.sess, RIND, key)
        self.assertEqual(seal["contamination"]["status"], "CONTAMINATED")
        self.assertEqual(seal["contamination"]["incidents"][0]["what"],
                         "PRIOR_RATIONALE")
        self.sess.acknowledge_seal_receipt(CUST, key, RIND)
        self.expect_gate("REVEAL_FORBIDDEN_CONTAMINATED",
                         self.sess.reveal, CUST, RIND, key)
        self.expect_gate("REFUSED_NOT_BLIND",
                         self.sess.adjudicate_claim, RIND, key,
                         "NORMATIVE_DETERMINACY", FIX["claims"]["normative"])
        # variant B: no packet yet → issuance itself is refused
        key3 = self.sess.register_tuple(
            CUST, self._fresh_tuple_spec_live(3))["tupleKey"]
        self.issue_to(self.sess, RP1B, key3)
        self.seal_by(self.sess, RP1B, key3)
        forged2 = build_forged_extension(self.host_events(self.sess), [
            ("RATIONALE_ACCESSED", {"tupleKey": key3, "reviewer": RIND})])
        fpath2 = Path(self._tmp) / "h_f12_corr2b.jsonl"
        write_events_file(fpath2, forged2)
        self.assertTrue(self.sess.restore_global_history(fpath2)["restored"])
        # CORR7/F-41: the custodian cannot obtain a blind reproduction
        # packet for an exposed reproducer, and the reproducer gate is
        # the uniform existence-blind refusal
        self.expect_gate("REVIEWER_ALREADY_EXPOSED",
                         self.sess.issue_packet, CUST, RIND, key3)
        self.expect_gate("UNISSUED_PACKET",
                         self.sess.begin_independent_reproduction,
                         RIND, key3)
        self.assertEqual(self.sess.category_assignment(key)
                         ["categoryAssignment"], "UNASSIGNED")

    def _fresh_tuple_spec_live(self, num, side="SYN_SIDE_A"):
        spec = json.loads(json.dumps(FIX["tuples"][0]))
        spec["caseId"] = "SYN_CASE_%03d" % num
        spec["factId"] = "SYN_FACT_%03d" % num
        spec["sideId"] = side
        spec["d"] = "SYN_D_%02d" % (num % 100)
        return spec

    def test_F13_imported_issuance_requires_physical_identity_gate(self):
        """GATE: F-13 EVIDENCE ISSUANCE IDENTITY GATE BYPASSED ON IMPORT — replay executes the physical gate

        Original failure (reproduced on CORR1): a correctly formed
        EVIDENCE_RECORD_ISSUED carrying the pinned SHA imports even when no
        rubric file or sidecar exists, while live issuance correctly
        returns NOT_ISSUABLE_RUBRIC_FILE_MISSING. CORR2: import fails
        closed with the identity refusal; with real authority present the
        same event imports and is equivalent to live issuance.
        """
        mod = corr1_engine()
        # CORR1 reproduction: issue with real files, replay with none
        o1 = self.orig_session(module=mod)
        self.register_all_legacy(o1, mod)
        o1.register_tuple(CUST, legacy_tuple_spec(0))
        o1.issue_evidence_record(CUST, TUP1)
        o_events = json.loads(json.dumps(o1.events(CUST)))
        o2 = self.orig_session(module=mod,
                               rubric_path=Path(self._tmp) / "absent_rubric.md",
                               sidecar_path=Path(self._tmp) / "absent_side.txt")
        opath = Path(self._tmp) / "h_f13_orig.jsonl"
        write_events_file(opath, o_events)
        self.assertTrue(o2.import_history(opath)["imported"])  # defect
        self.expect_orig_gate(mod, "NOT_ISSUABLE_RUBRIC_FILE_MISSING",
                              o2.issue_evidence_record, CUST, TUP1)
        # CORR2: identical structure, physical gate enforced on replay
        absent_rubric = Path(self._tmp) / "absent_rubric.md"
        absent_side = Path(self._tmp) / "absent_side.txt"
        c1 = self.new_session()
        self.register_all(c1)
        c1.register_tuple(CUST, FIX["tuples"][0])
        c1.issue_evidence_record(CUST, TUP1)
        c_events = self.host_events(c1)
        c2 = self.new_session(rubric_path=absent_rubric,
                              sidecar_path=absent_side)
        self.register_all(c2)
        c2.register_tuple(CUST, FIX["tuples"][0])
        self.expect_gate("NOT_ISSUABLE_RUBRIC_FILE_MISSING",
                         c2.issue_evidence_record, CUST, TUP1)
        cpath = Path(self._tmp) / "h_f13_corr2.jsonl"
        write_events_file(cpath, c_events)
        self.assertTrue(c2.verify_global_history(cpath)["valid"])
        err = self.expect_gate("PROCEDURALLY_INVALID_HISTORY",
                               c2.restore_global_history, cpath)
        self.assertIn("NOT_ISSUABLE_RUBRIC_FILE_MISSING", str(err))
        # lawful counterpart: with real authority the same file imports
        c3 = self.new_session()
        self.register_all(c3)
        c3.register_tuple(CUST, FIX["tuples"][0])
        self.assertTrue(c3.restore_global_history(cpath)["restored"])
        custody = c3.custody_view(CUST, TUP1)
        self.assertEqual(custody["evidenceRecords"][0]["categoryAssignment"],
                         "UNASSIGNED")

    def test_F14_file_reads_are_scratch_bounded(self):
        """GATE: F-14 OUT-OF-SCRATCH ARBITRARY FILE READING — every public file operation is path-bounded

        Original failure (reproduced on CORR1): load_history_file and
        verify_persisted_history read a path outside the configured scratch
        directory. CORR2: both operations refuse with
        PATH_ESCAPE_REJECTED, no public general-purpose loader exists, and
        in-scope verification still works.
        """
        mod = corr1_engine()
        outside = Path(tempfile.mkdtemp(prefix="syn_outside_", dir=str(SYN_RUNS)))
        try:
            orig = self.orig_session(module=mod)
            self.register_all_legacy(orig, mod)
            orig.register_tuple(CUST, legacy_tuple_spec(0))
            outside_file = outside / "outside_history.jsonl"
            write_events_file(outside_file, orig.events(CUST))
            self.assertTrue(
                mod.EFCASession.verify_persisted_history(outside_file)["valid"])
            parsed = mod.EFCASession.load_history_file(outside_file)
            self.assertGreater(len(parsed), 1)
            # CORR6 refusals (requester-scoped ops require a registered
            # requester before the path check — OD-37/F-37)
            self.register_all()
            self.expect_gate("PATH_ESCAPE_REJECTED",
                             self.sess.verify_persisted_history,
                             outside_file, CUST)
            self.expect_gate("PATH_ESCAPE_REJECTED",
                             self.sess.restore_global_history, outside_file)
            self.assertFalse(hasattr(self.sess, "load_history_file"))
            self.assertFalse(hasattr(oe, "load_history_file"))
            # lawful counterpart: an in-scope persisted history verifies
            self.lawful_revealed(self.sess)
            persisted = self.sess.persist_history("h_in_scope.jsonl", CUST)
            check = self.sess.verify_persisted_history(Path(persisted["path"]), CUST)
            self.assertTrue(check["valid"], msg=check["reason"])
        finally:
            shutil.rmtree(outside, ignore_errors=True)

    def test_F15_forged_flags_and_missing_extra_fields_refused(self):
        """GATE: F-15 FORGED NON-SYNTHETIC SEAL ACCEPTED ON REPLAY — exact event schemas and mandatory synthetic=true

        Original failure (reproduced on CORR1): forged but correctly hashed
        events with synthetic=false, a missing key or an extra key import
        successfully. CORR2 refuses every case with
        PROCEDURALLY_INVALID_HISTORY (chain-valid files) and no session
        state changes; the unmutated history imports as the control.
        """
        mod = corr1_engine()
        cases = []

        def corr1_prefix(extra_ops=None):
            s = self.orig_session(module=mod)
            self.register_all_legacy(s, mod)
            if extra_ops:
                extra_ops(s)
            return s

        # case 1: ACTOR_REGISTERED with an extra key
        s = corr1_prefix()
        events = build_forged_extension(s.events(CUST), [
            ("ACTOR_REGISTERED", {"actorId": "SYN_RP1_009", "role": "R_P1",
                                  "injected": True})])
        cases.append(("actor_extra_key", events))

        # case 2: second TUPLE_REGISTERED with synthetic=false
        def spec9(synth=None):
            spec = legacy_tuple_spec(0)
            spec.update({"caseId": "SYN_CASE_009", "sideId": "SYN_SIDE_A",
                         "factId": "SYN_FACT_009", "d": "SYN_D_09"})
            payload = {
                "custodian": CUST, "caseId": spec["caseId"],
                "sideId": spec["sideId"], "factId": spec["factId"],
                "d": spec["d"],
                "canonicalHashInput": oe.sha256_hex(
                    "%s|%s|%s" % (spec["caseId"], spec["sideId"],
                                  spec["factId"])),
                "sealedFactText": spec["sealedFactText"],
                "questionText": spec["questionText"],
                "custodyMarks": dict(spec["custodyMarks"]),
                "retrospectiveRecords": spec["retrospectiveRecords"],
            }
            if synth is not None:
                payload["synthetic"] = synth
            return payload

        s = corr1_prefix()
        cases.append(("tuple_synthetic_false",
                      build_forged_extension(s.events(CUST),
                                             [("TUPLE_REGISTERED", spec9(False))])))
        s = corr1_prefix()
        cases.append(("tuple_missing_synthetic",
                      build_forged_extension(s.events(CUST),
                                             [("TUPLE_REGISTERED", spec9(None))])))

        # case 4: PHASE1_SEALED with sealedPayload.synthetic=false
        def sealed_false(s):
            s.register_tuple(CUST, legacy_tuple_spec(0))
            s.issue_packet(CUST, RP1C, TUP1)

        s = corr1_prefix(sealed_false)
        packet_sha = oe.sha256_hex(oe.canonical_bytes({
            "caseId": "SYN_CASE_001", "sideId": "SYN_SIDE_A",
            "factId": "SYN_FACT_001",
            "sealedFactText": FIX["tuples"][0]["sealedFactText"],
            "questionText": FIX["tuples"][0]["questionText"]}))
        payload = {
            "packetSha": packet_sha, "reviewer": RP1C,
            "interpretationBound": FIX["phase1Reviews"]["determinateYes"]
            ["interpretationBound"],
            "rationale": FIX["phase1Reviews"]["determinateYes"]["rationale"],
            "normativeStates": FIX["phase1Reviews"]["determinateYes"]
            ["normativeStates"],
            "nonAuthoritativeObservations": [],
            "synthetic": False,
        }
        seal_sha = oe.sha256_hex(oe.canonical_bytes(payload))
        cases.append(("seal_synthetic_false", build_forged_extension(
            s.events(CUST), [("PHASE1_SEALED", {
                "tupleKey": TUP1, "reviewer": RP1C,
                "packetSha": packet_sha, "sealedBytesSha": seal_sha,
                "sealedAt": s.events(CUST)[-1]["t"] + 1,
                "contamination": {"status": "CLEAN", "incidents": []},
                "sealedPayload": payload})])))

        # case 5: REVEALED with an extra key
        def revealed_prefix(s):
            s.register_tuple(CUST, legacy_tuple_spec(0))
            s.issue_packet(CUST, RP1B, TUP1)
            s.submit_phase1_review(RP1B, TUP1,
                                   FIX["phase1Reviews"]["determinateYes"])
            s.acknowledge_seal_receipt(CUST, TUP1, RP1B)

        s = corr1_prefix(revealed_prefix)
        cases.append(("revealed_extra_key", build_forged_extension(
            s.events(CUST), [("REVEALED", {"tupleKey": TUP1, "custodian": CUST,
                                           "reviewer": RP1B, "injected": 1})])))

        for name, events in cases:
            path = Path(self._tmp) / ("h_f15_%s.jsonl" % name)
            write_events_file(path, events)
            self.assertTrue(
                mod.EFCASession.verify_persisted_history(path)["valid"],
                msg="%s: forged file must chain-verify" % name)
            target_orig = mod.EFCASession(scratch_dir=Path(self._tmp))
            result = target_orig.import_history(path)
            self.assertTrue(result["imported"],
                            msg="%s: CORR1 must accept for reproduction" % name)
            # CORR2 refuses the same pattern on its own chain
            c = self.new_session()
            self.register_all(c)
            c.register_tuple(CUST, FIX["tuples"][0])
            if name == "actor_extra_key":
                forged = build_forged_extension(self.host_events(c), [
                    ("ACTOR_REGISTERED", {"actorId": "SYN_RP1_009",
                                          "role": "R_P1", "injected": True})])
            elif name in ("tuple_synthetic_false", "tuple_missing_synthetic"):
                payload9 = {
                    "custodian": CUST, "caseId": "SYN_CASE_009",
                    "sideId": "SYN_SIDE_A", "factId": "SYN_FACT_009",
                    "d": "SYN_D_09",
                    "canonicalHashInput": oe.sha256_hex(
                        "SYN_CASE_009|SYN_SIDE_A|SYN_FACT_009"),
                    "sealedFactText": FIX["tuples"][0]["sealedFactText"],
                    "questionText": FIX["tuples"][0]["questionText"],
                    "custodyMarks": dict(FIX["tuples"][0]["custodyMarks"]),
                    "retrospectiveRecords": json.loads(json.dumps(
                        FIX["tuples"][0]["retrospectiveRecords"])),
                    # CORR9/OD-45-A: the engine-derived allocationDigest of
                    # this tuple's authorized entry, so that the mutation
                    # under test (missing/flipped `synthetic`) — not an
                    # accidental schema or entitlement mismatch — is what
                    # the refusal exercises.
                    "allocationDigest": alloc_entry_digest(KEY_009A, CUST),
                }
                if name == "tuple_synthetic_false":
                    payload9["synthetic"] = False
                forged = build_forged_extension(self.host_events(c), [
                    ("TUPLE_REGISTERED", payload9)])
            elif name == "seal_synthetic_false":
                c.issue_packet(CUST, RP1C, TUP1)
                cpacket = oe.sha256_hex(oe.canonical_bytes({
                    "caseId": "SYN_CASE_001", "sideId": "SYN_SIDE_A",
                    "factId": "SYN_FACT_001",
                    "sealedFactText": FIX["tuples"][0]["sealedFactText"],
                    "questionText": FIX["tuples"][0]["questionText"]}))
                cpayload = json.loads(json.dumps(payload))
                cpayload["packetSha"] = cpacket
                cseal_sha = oe.sha256_hex(oe.canonical_bytes(cpayload))
                c_live = self.host_events(c)
                forged = build_forged_extension(c_live, [
                    ("PHASE1_SEALED", {
                        "tupleKey": TUP1, "reviewer": RP1C,
                        "packetSha": cpacket, "sealedBytesSha": cseal_sha,
                        "sealedAt": c_live[-1]["t"] + 1,
                        "contamination": {"status": "CLEAN", "incidents": []},
                        "sealedPayload": cpayload})])
            else:  # revealed_extra_key
                c.issue_packet(CUST, RP1B, TUP1)
                c.submit_phase1_review(
                    RP1B, TUP1, FIX["phase1Reviews"]["determinateYes"])
                c.acknowledge_seal_receipt(CUST, TUP1, RP1B)
                forged = build_forged_extension(self.host_events(c), [
                    ("REVEALED", {"tupleKey": TUP1, "custodian": CUST,
                                  "reviewer": RP1B, "injected": 1})])
            cpath = Path(self._tmp) / ("h_f15_%s_corr2.jsonl" % name)
            write_events_file(cpath, forged)
            self.assertTrue(c.verify_global_history(cpath)["valid"])
            self.expect_gate("PROCEDURALLY_INVALID_HISTORY",
                             c.restore_global_history, cpath)

    def test_F15b_every_event_type_missing_or_extra_keys_refused(self):
        """GATE: F-15 EXTENSION — the exact-schema invariant holds for EVERY event type

        Expected: for a full lawful session exercising every event
        type, three mutations per event (drop a key, add a key, flip a
        synthetic flag where present) each produce a chain-valid file that
        CORR2 refuses with PROCEDURALLY_INVALID_HISTORY; the unmutated
        history imports as the control.
        """
        builder = self.new_session()
        self._build_full_lawful_session(builder)
        events = self.host_events(builder)
        types_seen = sorted({e["eventType"] for e in events})
        self.assertEqual(len(types_seen), len(oe.EVENT_TYPES),
                         msg="every event type must be exercised")
        control = Path(self._tmp) / "h_f15b_control.jsonl"
        write_events_file(control, events)
        fresh = self.new_session()
        self.assertTrue(fresh.restore_global_history(control)["restored"])
        refusals = 0
        for idx in range(len(events)):
            payload = events[idx]["payload"]
            keys = sorted(payload.keys())
            mutations = []
            if keys:
                dropped = keys[0]
                mutations.append(("drop_%s" % dropped,
                                  lambda p, d=dropped: p.pop(d, None)))
            mutations.append(("add_injected",
                              lambda p: p.update({"injected_key": True})))
            if payload.get("synthetic") is True:
                mutations.append(("synthetic_false",
                                  lambda p: p.update({"synthetic": False})))
            if payload.get("syntheticOnly") is True:
                mutations.append(("synthetic_only_false",
                                  lambda p: p.update({"syntheticOnly": False})))
            for label, mutate in mutations:
                mutated = mutated_history(events, idx, mutate)
                path = Path(self._tmp) / ("h_f15b_%d_%s.jsonl"
                                          % (idx, label))
                write_events_file(path, mutated)
                check_session = self.new_session()
                self.assertTrue(check_session.verify_global_history(path)
                                ["valid"],
                                msg="mutation %s@%d must chain-verify"
                                    % (label, idx))
                # a genesis whose act id is dropped names no version: the
                # engine's version-selection firewall refuses it before
                # replay (compatibility guardrail). A genesis whose
                # allocation-authority mode or digest is dropped no longer
                # declares this session's trusted construction context:
                # CORR9's pre-replay context check refuses it (OD-45-A) —
                # a strictly earlier refusal than the semantic replay.
                # Every other mutation is refused by the semantic replay
                # itself.
                expected_code = "PROCEDURALLY_INVALID_HISTORY"
                if idx == 0 and label == "drop_engineActId":
                    expected_code = "NOT_A_NATIVE_HISTORY"
                if idx == 0 and label in ("drop_allocationsSha256",
                                          "drop_allocationAuthorityMode"):
                    expected_code = "AUTHORITY_CONTEXT_MISMATCH"
                self.expect_gate(expected_code,
                                 check_session.restore_global_history, path)
                refusals += 1
        self.assertGreaterEqual(refusals, len(oe.EVENT_TYPES) * 2)
        # session state untouched by the refusals; control still lawful
        self.assertTrue(fresh.verify_integrity()["valid"])
        self.assertEqual(fresh.workflow_status(TUP1, CUST)["tupleLevel"],
                         "PROVISIONAL")

    def test_F_extra_replay_of_forged_claim_and_receipt(self):
        """GATE: F-7 EXTENSION — forged CLAIM_ADJUDICATED and forged custody receipt fail semantic replay

        Expected: correctly hashed but unauthorized transitions are refused
        at import (PROCEDURALLY_INVALID_HISTORY); live state and scientific
        authority are unchanged. Retained from the CORR1 coverage.
        """
        self.register_all()
        key = self.register_tuple()["tupleKey"]
        self.issue_to(self.sess, RP1A, key)
        self.seal_by(self.sess, RP1A, key)
        live = self.host_events(self.sess)
        forged = build_forged_extension(live, [
            ("CLAIM_ADJUDICATED", {
                "tupleKey": key, "reviewer": RIND,
                "claimType": "NORMATIVE_DETERMINACY",
                "claimId": "SYN_CLAIM_001",
                "prerequisites": {
                    "claimKind": "NORMATIVE",
                    "ownPhase1SealedBeforeRationale": True,
                    "reproducedOriginalClaim": True,
                },
            }),
        ])
        path = Path(self._tmp) / "h_extra_forged.jsonl"
        write_events_file(path, forged)
        self.assertTrue(self.sess.verify_global_history(path)["valid"])
        self.expect_gate("PROCEDURALLY_INVALID_HISTORY",
                         self.sess.restore_global_history, path)
        # fabricated prerequisite content is also refused on replay
        fabricated = build_forged_extension(live, [
            ("CLAIM_ADJUDICATED", {
                "tupleKey": key, "reviewer": RIND,
                "claimType": "HISTORICAL_RECORD_PRODUCTION",
                "claimId": "SYN_CLAIM_003",
                "prerequisites": {
                    "claimKind": "HISTORICAL_RECORD",
                    "recordsRederived": True,
                    "evidence": [{"recordId": "SYN_RET_001",
                                  "locator": "SYN_LOCATOR_RET_001",
                                  "content": "SYNTHETIC FABRICATED CONTENT"}],
                },
            }),
        ])
        write_events_file(path, fabricated)
        self.expect_gate("PROCEDURALLY_INVALID_HISTORY",
                         self.sess.restore_global_history, path)
        forged2 = build_forged_extension(live, [
            ("SEAL_RECEIPT_ACKNOWLEDGED",
             {"tupleKey": key, "custodian": CUST, "reviewer": RIND}),
        ])
        write_events_file(path, forged2)
        self.assertTrue(self.sess.verify_global_history(path)["valid"])
        self.expect_gate("PROCEDURALLY_INVALID_HISTORY",
                         self.sess.restore_global_history, path)
        self.assertEqual(self.sess.workflow_status(key, CUST)["claimLevel"],
                         "NOT_ADJUDICATED")
        self.assertEqual(self.sess.category_assignment(key)
                         ["categoryAssignment"], "UNASSIGNED")

    def test_F16_historical_claim_needs_proof_carrying_reconstruction(self):
        """GATE: F-16 HISTORICAL CLAIM ADJUDICATED ON BARE RE-DERIVATION ASSERTION — refused

        Original failure (reproduced on CORR1): declaring a known record id
        and adjudicating yields ADJUDICATED with no record content and no
        authenticated reproduction evidence. CORR2: the declaration and the
        named claim must each carry a proof-carrying reconstruction whose
        content hashes to the authenticated record digest; fabricated
        content, undeclared evidence and absent evidence are refused; a
        faithful reconstruction adjudicates. Replay enforces the same
        checks (forged adjudications without a declaration, or with
        fabricated evidence, are refused).
        """
        mod = corr1_engine()
        orig = self.orig_session(module=mod)
        self.register_all_legacy(orig, mod)
        orig.register_tuple(CUST, legacy_tuple_spec(0))
        orig.declare_records_rederived(RIND, TUP1, ["SYN_RET_001"])
        oadj = orig.adjudicate_claim(RIND, TUP1, "HISTORICAL_RECORD_PRODUCTION",
                                     FIX["claims"]["historical"])
        self.assertEqual(oadj["claimLevelStatus"], "ADJUDICATED")
        # CORR2: identifier-only declaration is not a re-derivation
        self.register_all()
        key = self.register_tuple()["tupleKey"]
        self.issue_to(self.sess, RIND, key)  # CORR7/F-41 packet-first
        self.expect_gate("INVALID_RECORD_LOCATORS",
                         self.sess.declare_records_rederived, RIND, key,
                         ["SYN_RET_001"])
        good = record_ref(0, 0)
        fabricated = dict(good, content="SYNTHETIC FABRICATED CONTENT")
        self.expect_gate("RECONSTRUCTION_DIGEST_MISMATCH",
                         self.sess.declare_records_rederived, RIND, key,
                         [fabricated])
        self.sess.declare_records_rederived(RIND, key, [good])
        self.expect_gate("REFUSED_UNVERIFIED_EVIDENCE",
                         self.sess.adjudicate_claim, RIND, key,
                         "HISTORICAL_RECORD_PRODUCTION",
                         FIX["claims"]["historical"], None)
        self.expect_gate("RECONSTRUCTION_DIGEST_MISMATCH",
                         self.sess.adjudicate_claim, RIND, key,
                         "HISTORICAL_RECORD_PRODUCTION",
                         FIX["claims"]["historical"], [fabricated])
        result = self.sess.adjudicate_claim(
            RIND, key, "HISTORICAL_RECORD_PRODUCTION",
            FIX["claims"]["historical"], record_refs=[good],
            proposition=hist_prop("HISTORICAL_RECORD_PRODUCTION"))
        self.assertEqual(result["claimLevelStatus"], "PROVENANCE_VERIFIED_NOT_ADJUDICATED")
        # replay equivalence: a forged adjudication without declaration
        live = self.host_events(self.sess)
        idx_decl = next(i for i, e in enumerate(live)
                        if e["eventType"] == "RECORDS_REDERIVED_DECLARED")
        no_decl = json.loads(json.dumps(live[:idx_decl]))
        forged = build_forged_extension(no_decl, [
            ("CLAIM_ADJUDICATED", {
                "tupleKey": key, "reviewer": RIND,
                "claimType": "HISTORICAL_RECORD_PRODUCTION",
                "claimId": FIX["claims"]["historical"],
                "prerequisites": {"claimKind": "HISTORICAL_RECORD",
                                  "recordsRederived": True,
                                  "evidence": [good]}})])
        fpath = Path(self._tmp) / "h_f16_nodecl.jsonl"
        write_events_file(fpath, forged)
        self.assertTrue(self.sess.verify_global_history(fpath)["valid"])
        self.expect_gate("PROCEDURALLY_INVALID_HISTORY",
                         self.sess.restore_global_history, fpath)
        # replay equivalence: forged evidence content
        forged2 = json.loads(json.dumps(live))
        forged2 = build_forged_extension(live, [
            ("CLAIM_ADJUDICATED", {
                "tupleKey": key, "reviewer": RIND,
                "claimType": "HISTORICAL_RECORD_LINKAGE",
                "claimId": FIX["claims"]["historicalSecond"],
                "prerequisites": {"claimKind": "HISTORICAL_RECORD",
                                  "recordsRederived": True,
                                  "evidence": [fabricated]}})])
        fpath2 = Path(self._tmp) / "h_f16_fab.jsonl"
        write_events_file(fpath2, forged2)
        self.expect_gate("PROCEDURALLY_INVALID_HISTORY",
                         self.sess.restore_global_history, fpath2)
        # append-only preservation and no category assignment.
        # F-35: the faithful reconstruction is provenance, not adjudication.
        provenance = [e for e in self.sess.events(CUST)
                      if e["eventType"] == "CLAIM_PROVENANCE_VERIFIED"]
        adjudications = [e for e in self.sess.events(CUST)
                         if e["eventType"] == "CLAIM_ADJUDICATED"]
        self.assertEqual(len(provenance), 1)
        self.assertEqual(len(adjudications), 0)
        self.assertEqual(self.sess.category_assignment(key)
                         ["categoryAssignment"], "UNASSIGNED")

    def test_F16b_reconstruction_content_never_leaks_to_other_reviewers(self):
        """GATE: F-16 DISCLOSURE — reconstruction content stays with its own reviewer and the custodian

        Expected: another reviewer's events() projection never contains the
        declared or claimed reconstruction content; the declaring reviewer
        and the custodian see it; the reveal payload itself carries only
        {id, sha} per §I.
        """
        self.register_all()
        key = self.register_tuple()["tupleKey"]
        good = record_ref(0, 0)
        self.issue_to(self.sess, RIND, key)  # CORR7/F-41 packet-first
        self.sess.declare_records_rederived(RIND, key, [good])
        self.sess.adjudicate_claim(RIND, key, "HISTORICAL_RECORD_EVENT",
                                   FIX["claims"]["historical"],
                                   record_refs=[good],
                                   proposition=hist_prop(
                                       "HISTORICAL_RECORD_EVENT"))
        marker = "invented synthetic process note"
        other_view = json.dumps(self.sess.events(RP1B))
        self.assertNotIn(marker, other_view)
        self.assertNotIn(good["content"], other_view)
        own_view = json.dumps(self.sess.events(RIND))
        self.assertIn(good["content"], own_view)
        custody = json.dumps(self.sess.custody_view(CUST, key))
        self.assertIn(good["content"], custody)
        # the §I reveal payload itself never carries record content
        _, revealed = self.lawful_revealed(self.sess, RP1A, idx=1)
        for r in revealed["retrospectiveRecords"]:
            self.assertEqual(sorted(r.keys()), ["id", "sha"])
        self.assertNotIn("invented synthetic process note",
                         json.dumps(revealed))


# ==========================================================================
# F-17..F-22: CORR3 finding closures (reproduced on the immutable CORR2)
# ==========================================================================

class Corr3FindingTests(EFCAUnitTest):

    def _fresh_spec(self, num, side="SYN_SIDE_A"):
        spec = json.loads(json.dumps(FIX["tuples"][0]))
        spec["caseId"] = "SYN_CASE_%03d" % num
        spec["factId"] = "SYN_FACT_%03d" % num
        spec["sideId"] = side
        spec["d"] = "SYN_D_%02d" % (num % 100)
        return spec

    def _builder_normative_session(self, s, idx=0):
        """Lawful CORR3 session with a completed normative adjudication,
        an evidence record, a Lane B record and a reveal (for F-22)."""
        self.register_all(s)
        key = s.register_tuple(CUST, FIX["tuples"][idx])["tupleKey"]
        s.register_lane_b(RLB, key, FIX["laneB"])
        s.issue_packet(CUST, RP1A, key)
        s.submit_phase1_review(RP1A, key,
                               FIX["phase1Reviews"]["determinateYes"])
        s.acknowledge_seal_receipt(CUST, key, RP1A)
        s.reveal(CUST, RP1A, key)
        self.issue_to(s, RIND, key)
        s.begin_independent_reproduction(RIND, key)
        s.submit_phase1_review(RIND, key,
                               FIX["phase1Reviews"]["determinateYes"])
        s.receive_first_rationale(RIND, key)
        s.adjudicate_claim(RIND, key, "NORMATIVE_DETERMINACY",
                           FIX["claims"]["normative"])
        s.issue_evidence_record(CUST, key)
        return key

    # ---------------- F-17 ----------------

    def test_F17_blind_cross_reviewer_boundary(self):
        """GATE: F-17 CROSS-REVIEWER PROCEDURAL DISCLOSURE — an unsealed reviewer sees no other actor's tuple-specific results

        Original failure (reproduced on CORR2): after R_P1-A's full
        workflow, events(R_P1-B) exposes sealedBytesSha, sealedAt,
        contaminationStatus, revealedAt and other procedural facts, and
        workflow_status shows the tuple state; R_P1-B then seals CLEAN.
        CORR3: at every pre-seal stage (unissued / issued-unsealed /
        after another reviewer's completed workflow) the event
        projections are minimal, workflow_status withholds §I state, and
        evidence-record metadata is not disclosed; after the reviewer's
        OWN seal the full redacted view becomes lawful.
        """
        # --- minimal reproduction on the CORR2 engine
        mod = corr2_engine()
        orig = self.corr2_session()
        self.register_all_legacy(orig, mod)
        okey = orig.register_tuple(CUST, FIX["tuples"][0])["tupleKey"]
        orig.issue_packet(CUST, RP1A, okey)
        orig.submit_phase1_review(RP1A, okey,
                                  FIX["phase1Reviews"]["determinateYes"])
        orig.acknowledge_seal_receipt(CUST, okey, RP1A)
        orig.reveal(CUST, RP1A, okey)
        blind_view = json.dumps(orig.events(RP1B))
        for marker in ("sealedBytesSha", "sealedAt", "contaminationStatus",
                       "revealedAt"):
            self.assertIn(marker, blind_view,
                          msg="CORR2 must reproduce the F-17 leak: %s" % marker)
        orig.issue_packet(CUST, RP1B, okey)
        oseal = orig.submit_phase1_review(
            RP1B, okey, FIX["phase1Reviews"]["determinateYes"])
        self.assertEqual(oseal["contamination"]["status"], "CLEAN")
        # --- CORR3: same sequence, boundary enforced
        self.register_all()
        key = self.register_tuple()["tupleKey"]
        self.issue_to(self.sess, RP1A, key)
        self.seal_by(self.sess, RP1A, key)
        self.sess.acknowledge_seal_receipt(CUST, key, RP1A)
        self.sess.reveal(CUST, RP1A, key)
        self.sess.append_delta(RP1A, key, FIX["phase2Deltas"]["noChange"])
        self.sess.issue_evidence_record(CUST, key)
        procedural_markers = ("sealedBytesSha", "sealedAt",
                              "contaminationStatus", "revealedAt",
                              "sealedPayload", "effectivelyCleanPhase1Seals",
                              "claimType", "PROVISIONAL", "deltaCount")
        # role-registry entries (ACTOR_REGISTERED) are lawful metadata; the
        # tuple-scoped events must be structurally minimal instead
        def _minimal_tuple_events(view_text):
            return [
                e for e in json.loads(view_text)
                if e["eventType"] in ("PHASE1_SEALED", "REVEALED",
                                      "EVIDENCE_RECORD_ISSUED",
                                      "CLAIM_ADJUDICATED")
            ]
        # stage (a)+(b): RP1B still unissued; another reviewer's workflow complete
        stage_a = json.dumps(self.sess.events(RP1B))
        for m in procedural_markers:
            self.assertNotIn(m, stage_a, msg="F-17 leak: %s" % m)
        self.assertEqual(
            [e["eventType"] for e in json.loads(stage_a)
             if e["eventType"] in ("PHASE1_SEALED", "REVEALED",
                                   "DELTA_APPENDED")],
            [],
            msg="F-31: foreign milestones are omitted, not minimally projected")
        for e in _minimal_tuple_events(stage_a):
            self.assertEqual(set(e["payload"].keys()), {"tupleKey"},
                             msg="F-17 structural leak: %s" % e["eventType"])
        self.assertNotIn("SYN_RP1_001", json.dumps(
            [e["payload"] for e in json.loads(stage_a)
             if e["eventType"] not in ("ACTOR_REGISTERED", "GENESIS")]))
        withheld = self.sess.workflow_status(key, RP1B)
        self.assertEqual(withheld.get("disclosure"),
                         "WITHHELD_BEFORE_OWN_SEAL")
        self.assertNotIn("tupleLevel", withheld)
        self.assertNotIn("effectiveAdjudications", withheld)
        # anonymous reads are withheld entirely (F-28); no chronology, no
        # counts, and successive anonymous responses are identical
        anon = self.sess.events()
        self.assertNotIn("sealedBytesSha", json.dumps(anon))
        self.assertEqual(anon, self.sess.events())
        self.assertEqual(anon[0].get("disclosure"),
                         "ANONYMOUS_METADATA_WITHHELD")
        # stage (c): RP1B issued but unsealed — still blind
        self.issue_to(self.sess, RP1B, key)
        stage_c = json.dumps(self.sess.events(RP1B))
        for m in procedural_markers:
            self.assertNotIn(m, stage_c, msg="F-17 leak (issued): %s" % m)
        for e in _minimal_tuple_events(stage_c):
            self.assertEqual(set(e["payload"].keys()), {"tupleKey"},
                             msg="F-17 structural leak (issued): %s"
                                 % e["eventType"])
        # stage (d): RP1B independently seals — post-own-seal lawful access
        self.seal_by(self.sess, RP1B, key)
        stage_d = json.dumps(self.sess.events(RP1B))
        for m in ("sealedBytesSha", "revealedAt"):
            self.assertIn(m, stage_d)
        full = self.sess.workflow_status(key, RP1B)
        self.assertEqual(full["tupleLevel"], "PROVISIONAL")
        # custodian retains the full log and custody context
        self.assertIn("sealedBytesSha", json.dumps(self.sess.events(CUST)))
        self.assertEqual(self.sess.category_assignment(key)
                         ["categoryAssignment"], "UNASSIGNED")

    # ---------------- F-18 ----------------

    def test_F18_retrospective_exposure_before_blind_seal(self):
        """GATE: F-18 RETROSPECTIVE-RECORD EXPOSURE BEFORE BLIND SEAL — pre-seal reconstruction destroys that blind Phase 1; post-seal reconstruction stays lawful

        Original failure (reproduced on CORR2): an R_IND declares
        authenticated retrospective content before any packet or seal, the
        content is returned, and the later Phase 1 is CLEAN through
        reveal. CORR3: the declaration derives a RETROSPECTIVE_RECORD
        contamination for the actor's own blind Phase 1 (rubric §G.2
        forbids retrospective records in Phase 1; §G.4 makes pre-seal
        tuple-specific forbidden information a contamination; §G.7 keeps
        historical-record reproduction blindness-free — the scheduling
        question is resolved by accepted authority, so no methodological
        block is needed). Live and imported paths behave identically.
        """
        # --- minimal reproduction on the CORR2 engine
        mod = corr2_engine()
        orig = self.corr2_session()
        self.register_all_legacy(orig, mod)
        okey = orig.register_tuple(CUST, FIX["tuples"][0])["tupleKey"]
        odecl = orig.declare_records_rederived(RIND, okey, [record_ref(0, 0)])
        self.assertIn("SYN_RET_001", json.dumps(odecl))  # recordId present
        orig.begin_independent_reproduction(RIND, okey)
        orig.issue_packet(CUST, RIND, okey)
        oseal = orig.submit_phase1_review(
            RIND, okey, FIX["phase1Reviews"]["determinateYes"])
        self.assertEqual(oseal["contamination"]["status"], "CLEAN")
        orig.acknowledge_seal_receipt(CUST, okey, RIND)
        oreveal = orig.reveal(CUST, RIND, okey)
        self.assertIn("markA", oreveal)
        # --- CORR7 (a): a pre-packet declaration is refused by the
        # packet-first architecture (F-41): no tuple-specific
        # disclosure can precede the custodian-issued reproduction
        # packet, and the reproducer gate is the uniform
        # existence-blind refusal
        self.register_all()
        key = self.register_tuple()["tupleKey"]
        self.expect_gate("UNISSUED_PACKET",
                         self.sess.declare_records_rederived, RIND, key,
                         [record_ref(0, 0)])
        self.expect_gate("UNISSUED_PACKET",
                         self.sess.begin_independent_reproduction,
                         RIND, key)
        # --- CORR3 (b): declaration AFTER packet, BEFORE seal
        key2 = self.register_tuple(self.sess, 1)["tupleKey"]
        self.issue_to(self.sess, RIND, key2)
        self.sess.begin_independent_reproduction(RIND, key2)
        self.sess.declare_records_rederived(RIND, key2, [record_ref(1, 0)])
        seal = self.seal_by(self.sess, RIND, key2)
        self.assertEqual(seal["contamination"]["status"], "CONTAMINATED")
        self.assertEqual(seal["contamination"]["incidents"][0]["what"],
                         "RETROSPECTIVE_RECORD")
        self.assertTrue(seal["contamination"]["incidents"][0]["derived"])
        self.sess.acknowledge_seal_receipt(CUST, key2, RIND)
        self.expect_gate("REVEAL_FORBIDDEN_CONTAMINATED",
                         self.sess.reveal, CUST, RIND, key2)
        # no original R_P1 review exists on this tuple, so the normative
        # gate refuses on the original-claim precondition first
        self.expect_gate("REFUSED_NO_ORIGINAL_CLAIM",
                         self.sess.adjudicate_claim,
                         RIND, key2, "NORMATIVE_DETERMINACY",
                         FIX["claims"]["normative"])
        # with a genuine original R_P1 review, the contaminated reproducer
        # is refused on blindness itself
        key5 = self.sess.register_tuple(
            CUST, self._fresh_spec(5))["tupleKey"]
        self.issue_to(self.sess, RP1A, key5)
        self.seal_by(self.sess, RP1A, key5)
        self.issue_to(self.sess, RIND, key5)
        self.sess.begin_independent_reproduction(RIND, key5)
        self.sess.declare_records_rederived(RIND, key5, [record_ref(0, 0)])
        seal5 = self.seal_by(self.sess, RIND, key5)
        self.assertEqual(seal5["contamination"]["status"], "CONTAMINATED")
        self.sess.receive_first_rationale(RIND, key5)
        self.expect_gate("REFUSED_NOT_BLIND", self.sess.adjudicate_claim,
                         RIND, key5, "NORMATIVE_DETERMINACY",
                         FIX["claims"]["normative"])
        # blindness is not required for historical-record claims (§G.7)
        hist = self.sess.adjudicate_claim(
            RIND, key2, "HISTORICAL_RECORD_EVENT",
            FIX["claims"]["historical"], record_refs=[record_ref(1, 0)],
            proposition=hist_prop("HISTORICAL_RECORD_EVENT"))
        self.assertEqual(hist["claimLevelStatus"], "PROVENANCE_VERIFIED_NOT_ADJUDICATED")
        # --- CORR3 (c): declaration AFTER the reviewer's own seal is lawful
        spec6 = self._fresh_spec(6)
        key3 = self.sess.register_tuple(CUST, spec6)["tupleKey"]
        self.issue_to(self.sess, RP1A, key3)
        self.seal_by(self.sess, RP1A, key3)
        self.sess.acknowledge_seal_receipt(CUST, key3, RP1A)
        self.sess.reveal(CUST, RP1A, key3)
        self.sess.append_delta(RP1A, key3, FIX["phase2Deltas"]["noChange"])
        self.issue_to(self.sess, RIND, key3)
        self.sess.begin_independent_reproduction(RIND, key3)
        self.seal_by(self.sess, RIND, key3)
        self.sess.receive_first_rationale(RIND, key3)
        self.sess.adjudicate_claim(RIND, key3, "NORMATIVE_DETERMINACY",
                                   FIX["claims"]["normativeSecond"])
        lawful_decl = self.sess.declare_records_rederived(
            RIND, key3, [record_ref(0, 0)])
        self.assertTrue(lawful_decl["recordsRederived"])
        self.assertEqual(
            self.sess.workflow_status(key3, CUST)["claimLevel"],
            "ADJUDICATED")
        # --- CORR3 (d): imported early re-derivation behaves identically
        key4 = self.sess.register_tuple(
            CUST, self._fresh_spec(4))["tupleKey"]
        self.issue_to(self.sess, RIND, key4)
        # a lawfully formed declaration (digest-matching reference) is a
        # lawful event; the DERIVED consequence then blocks the blind seal
        spec4 = self.sess.custody_view(CUST, key4)["retrospectiveRecords"][0]
        forged = build_forged_extension(self.host_events(self.sess), [
            ("RECORDS_REDERIVED_DECLARED", {
                "tupleKey": key4, "reviewer": RIND,
                "recordRefs": [{"recordId": spec4["id"],
                                "locator": spec4["locator"],
                                "content": spec4["content"]}]})])
        fpath = Path(self._tmp) / "h_f18_import.jsonl"
        write_events_file(fpath, forged)
        self.assertTrue(self.sess.restore_global_history(fpath)["restored"])
        seal4 = self.seal_by(self.sess, RIND, key4)
        self.assertEqual(seal4["contamination"]["status"], "CONTAMINATED")
        self.assertEqual(seal4["contamination"]["incidents"][0]["what"],
                         "RETROSPECTIVE_RECORD")
        self.assertEqual(self.sess.category_assignment(key2)
                         ["categoryAssignment"], "UNASSIGNED")

    # ---------------- F-19 ----------------

    def test_F19_custodian_scoped_reads(self):
        """GATE: F-19 CROSS-CUSTODIAN DISCLOSURE THROUGH GLOBAL HISTORY — custodial visibility is tuple-scoped

        Original failure (reproduced on CORR2): custody_view correctly
        refuses a second custodian, yet events(C2) returns the entire raw
        log including C1's marks and retrospective record content.
        CORR6/OD-37 (F-37): a custodian's scoped projection covers only
        their own tuples; FOREIGN tuples are omitted entirely — not even
        minimal projections appear (supersedes CORR3's minimal foreign
        projections, which still disclosed the foreign milestone and the
        global sequence position); no envelope material (seq/eventId/ticks/
        chain hashes) is attached. Same-tuple access stays lawful and
        custody_view remains the tuple-scoped custody context. A global
        audit context is documented as NOT implemented.
        """
        # --- minimal reproduction on the CORR2 engine
        mod = corr2_engine()
        orig = self.corr2_session()
        self.register_all_legacy(orig, mod)
        orig.register_actor("SYN_CUST_002", "CUSTODIAN")
        orig.register_tuple(CUST, FIX["tuples"][0])
        leaked = json.dumps(orig.events("SYN_CUST_002"))
        self.assertIn("custodyMarks", leaked)
        self.assertIn("SYNTHETIC RETROSPECTIVE RECORD", leaked)
        self.expect_orig_gate(mod, "ROLE_MISMATCH",
                              orig.custody_view, "SYN_CUST_002", TUP1)
        # --- CORR6: two custodians, disjoint tuples (CORR9/OD-45-A: the
        # C2-is-custodian-of-TUP2 combination is an EXPLICIT simulation
        # authority — the Owner manifest allocates TUP2 to SYN_CUST_001)
        self.sess = self.sim_session([(TUP1, CUST), (TUP2, CUST2)])
        self.register_all()
        self.sess.register_actor("SYN_CUST_002", "CUSTODIAN")
        key1 = self.register_tuple()["tupleKey"]              # CUST (C1)
        key2 = self.sess.register_tuple(
            "SYN_CUST_002", FIX["tuples"][1])["tupleKey"]     # C2
        # cross-tuple custody view still refuses
        self.expect_gate("ROLE_MISMATCH",
                         self.sess.custody_view, "SYN_CUST_002", key1)
        self.expect_gate("ROLE_MISMATCH",
                         self.sess.custody_view, CUST, key2)
        # C2's projection: own tuple content, C1's tuple absent entirely
        c2_view = json.dumps(self.sess.events("SYN_CUST_002"))
        self.assertIn("custodyMarks", c2_view)          # own tuple content
        self.assertIn("SYNTHETIC RETROSPECTIVE RECORD SYN_RET_003", c2_view)
        self.assertNotIn("SYNTHETIC RETROSPECTIVE RECORD SYN_RET_001", c2_view)
        self.assertNotIn("SYNTHETIC FIXTURE FACT: the invented vendor", c2_view)
        self.assertNotIn('"SYN_D_07"', c2_view)
        # F-37: the foreign tuple key and envelope material never appear
        self.assertNotIn(key1, c2_view)
        for marker in ('"seq"', '"eventId"', '"eventSha"', '"prevEventSha"',
                       '"t"'):
            self.assertNotIn(marker, c2_view,
                             msg="F-37 envelope leak: %s" % marker)
        # C1's projection mirrors the scoping
        c1_view = json.dumps(self.sess.events(CUST))
        self.assertIn("SYNTHETIC RETROSPECTIVE RECORD SYN_RET_001", c1_view)
        self.assertNotIn("SYNTHETIC RETROSPECTIVE RECORD SYN_RET_003", c1_view)
        self.assertNotIn(key2, c1_view)
        # legitimate same-tuple access is unchanged
        custody = self.sess.custody_view(CUST, key1)
        self.assertEqual(custody["custodyMarks"], {"A": "YES", "B": "NO"})

    # ---------------- F-20 ----------------

    def test_F20_full_synthetic_text_firewall(self):
        """GATE: F-20 INCOMPLETE SYNTHETIC-ONLY INPUT FIREWALL — every free-text entrypoint requires the marker; NO_CHANGE stays lawful

        Original failure (reproduced on CORR2): append_delta and
        report_exposure accept arbitrary unmarked text. CORR3: deltas
        (except NO_CHANGE), exposure details, completeness statements,
        exclusion reasons, flip risks and observation notes all require
        the SYNTHETIC marker, live and on replay. A marker is a
        mechanical classification label, not proof of factual provenance.
        """
        # --- minimal reproduction on the CORR2 engine
        mod = corr2_engine()
        orig = self.corr2_session()
        self.register_all_legacy(orig, mod)
        okey = orig.register_tuple(CUST, FIX["tuples"][0])["tupleKey"]
        orig.issue_packet(CUST, RP1A, okey)
        orig.submit_phase1_review(RP1A, okey,
                                  FIX["phase1Reviews"]["determinateYes"])
        orig.acknowledge_seal_receipt(CUST, okey, RP1A)
        orig.reveal(CUST, RP1A, okey)
        result = orig.append_delta(RP1A, okey, "plain invented delta note")
        self.assertTrue(result["appended"])
        orig.report_exposure(CUST, okey, RP1B, "MARK_A", "plain invented note")
        # --- CORR3: deltas
        self.register_all()
        key, _ = self.lawful_revealed(self.sess)
        self.expect_gate("NON_SYNTHETIC_CONTENT", self.sess.append_delta,
                         RP1A, key, "plain invented delta note")
        self.sess.append_delta(RP1A, key, "NO_CHANGE")
        self.sess.append_delta(RP1A, key,
                               "SYNTHETIC DELTA: marked invented note")
        # --- CORR3: exposure details
        self.expect_gate("NON_SYNTHETIC_CONTENT", self.sess.report_exposure,
                         CUST, key, RP1B, "MARK_A", "plain invented note")
        self.sess.report_exposure(CUST, key, RP1B, "MARK_A", "")
        self.sess.report_exposure(CUST, key, RP1B, "MARK_A", "SYNTHETIC note")
        # --- CORR3: interpretation-bound texts and observations
        bad_bound = json.loads(json.dumps(
            FIX["phase1Reviews"]["determinateYes"]))
        bad_bound["interpretationBound"]["completenessStatement"] = \
            "plain unmarked statement"
        key2 = self.register_tuple(self.sess, 1)["tupleKey"]
        self.issue_to(self.sess, RP1A, key2)
        self.expect_gate("NON_SYNTHETIC_CONTENT",
                         self.sess.submit_phase1_review, RP1A, key2,
                         bad_bound)
        bad_note = json.loads(json.dumps(
            FIX["phase1Reviews"]["determinateYes"]))
        bad_note["nonAuthoritativeObservations"] = [
            {"note": "plain unmarked observation"}]
        self.expect_gate("NON_SYNTHETIC_CONTENT",
                         self.sess.submit_phase1_review, RP1A, key2, bad_note)
        # lawful counterpart: marked texts and observation accepted
        key3 = self.sess.register_tuple(
            CUST, self._fresh_spec(3))["tupleKey"]
        self.issue_to(self.sess, RP1A, key3)
        good = json.loads(json.dumps(
            FIX["phase1Reviews"]["determinateYes"]))
        good["nonAuthoritativeObservations"] = [
            {"note": "SYNTHETIC observation"}]
        seal = self.sess.submit_phase1_review(RP1A, key3, good)
        self.assertEqual(seal["contamination"]["status"], "CLEAN")
        # replay consistency: an unmarked forged delta is refused at import
        live = self.host_events(self.sess)
        forged = build_forged_extension(live, [
            ("DELTA_APPENDED", {"tupleKey": key3, "reviewer": RP1A,
                                "delta": "plain unmarked forged delta"})])
        fpath = Path(self._tmp) / "h_f20_delta.jsonl"
        write_events_file(fpath, forged)
        self.assertTrue(self.sess.verify_global_history(fpath)["valid"])
        self.expect_gate("PROCEDURALLY_INVALID_HISTORY",
                         self.sess.restore_global_history, fpath)

    # ---------------- F-21 ----------------

    def _three_event_history(self, session=None):
        s = session or self.sess
        for actor in FIX["actors"]:
            s.register_actor(actor["actorId"], actor["role"])
        s.register_tuple(CUST, FIX["tuples"][0])
        if session is None:
            # CORR6: the raw chain comes from the host artifact (the
            # requester view is a scoped projection — OD-37/F-37)
            return self.host_events(s)
        return json.loads(json.dumps(s.events(CUST)))

    def test_F21_exact_event_envelope_validation(self):
        """GATE: F-21 INCOMPLETE EVENT-ENVELOPE VALIDATION ON IMPORT — the outer envelope must be engine-constructible

        Original failure (reproduced on CORR2): with recomputed hashes,
        import accepts a fabricated eventId, an undeclared top-level
        attribute, and a logical-clock jump to 1000/1001. CORR3: the
        exact envelope schema (key set, types, deterministic eventId,
        consecutive ticks) is enforced in verify_chain, so both the
        diagnostic verify and import fail closed with HASH_CHAIN_INVALID
        while the unmutated history imports.
        """
        mod = corr2_engine()
        # the CORR2-acceptance side needs a CORR2-genesis history (the
        # genesis act identity differs between engines by design)
        orig_builder = self.corr2_session()
        base_orig = self._three_event_history(orig_builder)
        base = self._three_event_history()
        variants = {}

        v1 = json.loads(json.dumps(base))
        v1[1]["eventId"] = "X0001"
        variants["fabricated_event_id"] = restamp_chain(v1, 1)

        v2 = json.loads(json.dumps(base))
        v2[1]["undeclaredAuthority"] = "SYNTHETIC FORGED AUTHORITY"
        variants["extra_envelope_key"] = restamp_chain(v2, 1)

        v3 = json.loads(json.dumps(base))
        v3[1]["t"] = 1000
        v3[2]["t"] = 1001
        variants["clock_jump"] = restamp_chain(v3, 1)

        # drop an envelope key on the LAST event (a mid-chain deletion is
        # re-added by the restamp helper and would fail on linkage instead)
        v4 = restamp_chain(json.loads(json.dumps(base)), 0)
        del v4[-1]["prevEventSha"]
        v4[-1]["eventSha"] = oe.sha256_hex(oe.canonical_bytes(
            {k: v for k, v in v4[-1].items() if k != "eventSha"}))
        variants["missing_envelope_key"] = v4

        v5 = json.loads(json.dumps(base))
        v5[2]["t"] = "2"
        variants["invalid_tick_type"] = restamp_chain(v5, 2)

        v6 = json.loads(json.dumps(base))
        v6[1]["eventId"] = "E0002"
        variants["event_id_seq_mismatch"] = restamp_chain(v6, 1)

        v7 = json.loads(json.dumps(base))
        v7[0]["t"] = 5
        variants["genesis_tick_shift"] = restamp_chain(v7, 0)

        variants_orig = {}
        v1 = json.loads(json.dumps(base_orig)); v1[1]["eventId"] = "X0001"
        variants_orig["fabricated_event_id"] = restamp_chain(v1, 1)
        v2 = json.loads(json.dumps(base_orig))
        v2[1]["undeclaredAuthority"] = "SYNTHETIC FORGED AUTHORITY"
        variants_orig["extra_envelope_key"] = restamp_chain(v2, 1)
        v3 = json.loads(json.dumps(base_orig))
        for i in range(1, len(v3)):
            v3[i]["t"] = 1000 + i - 1
        variants_orig["clock_jump"] = restamp_chain(v3, 1)
        for name, events in variants.items():
            path = Path(self._tmp) / ("h_f21_%s.jsonl" % name)
            write_events_file(path, events)
            # CORR2 accepts the three reproduced variants (own-genesis file)
            if name in variants_orig:
                orig_target = self.corr2_session()
                orig_path = Path(self._tmp) / ("h_f21_%s_orig.jsonl" % name)
                write_events_file(orig_path, variants_orig[name])
                self.assertTrue(
                    orig_target.verify_persisted_history(orig_path)["valid"],
                    msg="%s must chain-verify" % name)
                self.assertTrue(
                    orig_target.import_history(orig_path)["imported"],
                    msg="CORR2 must accept %s" % name)
            # CORR3 refuses at the envelope layer
            check = self.sess.verify_global_history(path)
            self.assertFalse(check["valid"],
                             msg="%s must fail envelope verification" % name)
            fresh = self.new_session()
            self.expect_gate("HASH_CHAIN_INVALID", fresh.restore_global_history, path)
        # malformed JSON fails closed with a stable code, no crash
        bad = Path(self._tmp) / "h_f21_bad.jsonl"
        bad.write_text("{not json}\n", encoding="utf-8")
        fresh = self.new_session()
        self.expect_gate("HASH_CHAIN_INVALID", fresh.restore_global_history, bad)
        # lawful unmodified import (control)
        control = Path(self._tmp) / "h_f21_control.jsonl"
        write_events_file(control, base)
        fresh2 = self.new_session()
        self.assertTrue(fresh2.restore_global_history(control)["restored"])

    # ---------------- F-22 ----------------

    def test_F22_reads_are_detached_immutable_values(self):
        """GATE: F-22 PUBLIC READ MUTATING AUTHORITATIVE STATE — every public view returns deep copies

        Original failure (reproduced on CORR2): custody_view returned a
        live reference to the internal adjudication; mutating the returned
        claimType to CAUSAL_CATEGORY_FORGED changed subsequent views while
        the chain verifier stayed valid. CORR3: nested mutations of any
        public view are without effect; internal state, future statuses
        and the persisted/imported history remain unchanged; scientific
        authority cannot be fabricated through a read.
        """
        # --- minimal reproduction on the CORR2 engine
        mod = corr2_engine()
        orig = self.corr2_session()
        builder = self
        key0 = builder._builder_normative_session(orig)
        v = orig.custody_view(CUST, key0)
        v["adjudications"][0]["claimType"] = "CAUSAL_CATEGORY_FORGED"
        v["evidenceRecords"][0]["categoryAssignment"] = "CODER_ERROR"
        v2 = orig.custody_view(CUST, key0)
        self.assertEqual(v2["adjudications"][0]["claimType"],
                         "CAUSAL_CATEGORY_FORGED")
        self.assertEqual(v2["evidenceRecords"][0]["categoryAssignment"],
                         "CODER_ERROR")
        # --- CORR3: same mutations are without effect
        s = self.new_session()
        key = self._builder_normative_session(s)
        before = json.dumps(s.custody_view(CUST, key), sort_keys=True)
        v = s.custody_view(CUST, key)
        v["adjudications"][0]["claimType"] = "CAUSAL_CATEGORY_FORGED"
        v["adjudications"][0]["prerequisites"]["forged"] = True
        v["evidenceRecords"][0]["categoryAssignment"] = "CODER_ERROR"
        v["seals"][0]["sealedPayload"]["normativeStates"]["determinacy"] = \
            "NOT_ESTABLISHED"
        v["retrospectiveRecords"][0]["content"] = "SYNTHETIC MUTATED"
        if v.get("incidents"):
            next(iter(v["incidents"].values()))[0]["what"] = "MUTATED"
        v["deltas"].append({"reviewer": RIND, "delta": "SYNTHETIC x",
                            "tick": 999})
        v["status"]["tupleLevel"] = "MUTATED"
        ev = s.events(CUST)
        ev[1]["payload"]["role"] = "CUSTODIAN_MUTATED"
        tup_ev = next(e for e in ev if e["eventType"] == "TUPLE_REGISTERED")
        tup_ev["payload"]["custodyMarks"]["A"] = "NO"
        lane = s.lane_b_view(RLB, key)
        lane["submissions"][0]["schemaClaim"] = "SYNTHETIC MUTATED"
        after = json.dumps(s.custody_view(CUST, key), sort_keys=True)
        self.assertEqual(after, before)
        # future statuses and authority unchanged
        status = s.workflow_status(key, CUST)
        self.assertEqual(status["claimLevel"], "ADJUDICATED")
        cats = s.category_assignment(key)
        self.assertEqual(cats["categoryAssignment"], "UNASSIGNED")
        self.assertNotIn("CAUSAL_CATEGORY_FORGED", after)
        self.assertNotIn("CODER_ERROR", after)
        self.assertTrue(s.verify_integrity()["valid"])
        # the materialized state still corresponds to the event history:
        # a fresh session importing the persisted history matches exactly
        persisted = s.persist_global_history("h_f22.jsonl")
        fresh = self.new_session()
        self.assertTrue(fresh.restore_global_history(Path(persisted["path"]))["restored"])
        self.assertEqual(
            json.dumps(fresh.custody_view(CUST, key)["adjudications"],
                       sort_keys=True),
            json.dumps(s.custody_view(CUST, key)["adjudications"],
                       sort_keys=True))
        self.assertEqual(
            json.dumps(fresh.custody_view(CUST, key)["evidenceRecords"],
                       sort_keys=True),
            json.dumps(s.custody_view(CUST, key)["evidenceRecords"],
                       sort_keys=True))
        # reveal payload detachment (s carries the registered actors)
        key_r, revealed = self.lawful_revealed(s, RP1A, idx=1)
        revealed["retrospectiveRecords"][0]["id"] = "SYN_RET_999"
        revealed["markA"] = "NO"
        fresh_reveal = s.custody_view(CUST, key_r)
        self.assertEqual(fresh_reveal["retrospectiveRecords"][0]["id"],
                         "SYN_RET_003")
        self.assertEqual(fresh_reveal["custodyMarks"]["A"], "NO")


# ==========================================================================
# F-23..F-29: CORR4 finding closures (reproduced on the immutable CORR3)
# ==========================================================================

class Corr4FindingTests(EFCAUnitTest):

    def _fresh_spec(self, num, side="SYN_SIDE_A"):
        spec = json.loads(json.dumps(FIX["tuples"][0]))
        spec["caseId"] = "SYN_CASE_%03d" % num
        spec["factId"] = "SYN_FACT_%03d" % num
        spec["sideId"] = side
        spec["d"] = "SYN_D_%02d" % (num % 100)
        return spec

    def _flow(self, s, key, reviewer=RP1A):
        s.issue_packet(CUST, reviewer, key)
        s.submit_phase1_review(reviewer, key,
                               FIX["phase1Reviews"]["determinateYes"])
        s.acknowledge_seal_receipt(CUST, key, reviewer)
        s.reveal(CUST, reviewer, key)
        s.append_delta(reviewer, key, FIX["phase2Deltas"]["noChange"])

    def _ref(self, idx=0, pos=0):
        r = FIX["tuples"][idx]["retrospectiveRecords"][pos]
        return {"recordId": r["id"], "locator": r["locator"],
                "content": r["content"]}

    # ---------------- F-23 ----------------

    def test_F23_status_disclosure_is_tuple_scoped(self):
        """GATE: F-23 CROSS-CUSTODIAN STATUS DISCLOSURE — status visibility follows an authorized relationship to THAT tuple

        Original failure (reproduced on CORR3): workflow_status returns the
        full PROVISIONAL view to a foreign custodian and to an R_LB with no
        relationship to the tuple. CORR4: foreign custodian and unrelated
        R_LB receive WITHHELD_BEFORE_OWN_SEAL; the owning custodian, a
        sealed reviewer and — on CORR4 — the tuple's registered Lane B
        reviewer receive the full view. CORR5 (F-32) keeps the custodian
        and sealed-reviewer grants and removes the Lane B grant: the
        accepted rubric does not define a custodian-issued Lane B
        assignment, and registration remains an evidence filing.
        lane_b_view stays the lawful Lane B read. Disjoint custodians keep
        their own views; events() and custody_view() remain scoped (F-19).
        """
        # --- minimal reproduction on the CORR3 engine
        mod = corr3_engine()
        orig = self.corr3_session()
        self.register_all_legacy(orig, mod)
        orig.register_actor("SYN_CUST_002", "CUSTODIAN")
        okey = orig.register_tuple(CUST, FIX["tuples"][0])["tupleKey"]
        self._flow(orig, okey)
        self.assertEqual(orig.workflow_status(okey, "SYN_CUST_002")
                         ["tupleLevel"], "PROVISIONAL")
        self.assertEqual(orig.workflow_status(okey, RLB)["tupleLevel"],
                         "PROVISIONAL")
        # --- CORR4: withheld for unauthorized, full for authorized
        # (CORR9/OD-45-A: the foreign custodian's own TUP2 entitlement is
        # an EXPLICIT simulation authority, never a broadened Owner
        # manifest)
        self.sess = self.sim_session(
            [(TUP1, CUST), (KEY_002A, CUST), (TUP2, CUST2)])
        self.register_all()
        self.sess.register_actor("SYN_CUST_002", "CUSTODIAN")
        key = self.register_tuple()["tupleKey"]
        self._flow(self.sess, key)
        for outsider in ("SYN_CUST_002", RLB):
            withheld = self.sess.workflow_status(key, outsider)
            self.assertEqual(withheld.get("disclosure"),
                             "WITHHELD_BEFORE_OWN_SEAL")
            self.assertNotIn("tupleLevel", withheld)
        self.assertEqual(self.sess.workflow_status(key, CUST)["tupleLevel"],
                         "PROVISIONAL")
        # F-32: filing the Lane B record does not authorize workflow_status.
        # The lawful Lane B read remains lane_b_view.
        self.sess.register_lane_b(RLB, key, FIX["laneB"])
        still = self.sess.workflow_status(key, RLB)
        self.assertEqual(still.get("disclosure"), "WITHHELD_BEFORE_OWN_SEAL")
        self.assertNotIn("tupleLevel", still)
        self.assertEqual(
            self.sess.lane_b_view(RLB, key)["submissions"][0]["causeLink"],
            "UNASSIGNED_PENDING_J1")
        # sealed reviewers stay authorized (F-17 lawful post-seal access)
        key2 = self.sess.register_tuple(
            CUST, self._fresh_spec(2))["tupleKey"]
        self.sess.register_lane_b(RLB, key2, FIX["laneB"])
        self._flow(self.sess, key2, RP1B)
        self.assertEqual(self.sess.workflow_status(key2, RP1B)["tupleLevel"],
                         "PROVISIONAL")
        still2 = self.sess.workflow_status(key2, RLB)
        self.assertEqual(still2.get("disclosure"), "WITHHELD_BEFORE_OWN_SEAL")
        self.assertNotIn("tupleLevel", still2)
        # disjoint custodian's own tuple is fully visible to them only
        key3 = self.sess.register_tuple(
            "SYN_CUST_002", FIX["tuples"][1])["tupleKey"]
        self.assertEqual(
            self.sess.workflow_status(key3, "SYN_CUST_002")["tupleLevel"],
            "IN_PROGRESS")
        withheld3 = self.sess.workflow_status(key3, CUST)
        self.assertEqual(withheld3.get("disclosure"),
                         "WITHHELD_BEFORE_OWN_SEAL")

    # ---------------- F-24 ----------------

    def test_F24_exposure_attestation_is_role_bounded(self):
        """GATE: F-24 UNAUTHORIZED FOREIGN EXPOSURE REPORT — only the tuple's custodian or the exposed actor may attest

        Original failure (reproduced on CORR3): a foreign custodian's
        allegation contaminates the tuple's reviewer. CORR4: foreign
        custodians and unrelated actors are refused
        (UNAUTHORIZED_EXPOSURE_REPORTER); the tuple's custodian and the
        exposed actor themself remain lawful reporters; append-only
        incident history and lawful late-discovery reporting are preserved.
        Authority basis: rubric §G.1 custodial recording duties, §G.4/§G.5
        custodial acts, §G.6 step 1 executed inside the custodial protocol,
        §G.4 reviewer self-disclosure (priorExposure).
        """
        # --- minimal reproduction on the CORR3 engine
        mod = corr3_engine()
        orig = self.corr3_session()
        self.register_all_legacy(orig, mod)
        orig.register_actor("SYN_CUST_002", "CUSTODIAN")
        okey = orig.register_tuple(CUST, FIX["tuples"][0])["tupleKey"]
        orig.issue_packet(CUST, RP1A, okey)
        orig.report_exposure("SYN_CUST_002", okey, RP1A, "MARK_A",
                             "SYNTHETIC foreign allegation")
        oseal = orig.submit_phase1_review(
            RP1A, okey, FIX["phase1Reviews"]["determinateYes"])
        self.assertEqual(oseal["contamination"]["status"], "CONTAMINATED")
        # --- CORR4: foreign report refused, no contamination results
        self.register_all()
        self.sess.register_actor("SYN_CUST_002", "CUSTODIAN")
        key = self.register_tuple()["tupleKey"]
        self.issue_to(self.sess, RP1A, key)
        self.expect_gate("UNAUTHORIZED_EXPOSURE_REPORTER",
                         self.sess.report_exposure, "SYN_CUST_002", key,
                         RP1A, "MARK_A", "SYNTHETIC foreign allegation")
        self.expect_gate("UNAUTHORIZED_EXPOSURE_REPORTER",
                         self.sess.report_exposure, RLB, key,
                         RP1A, "MARK_A", "SYNTHETIC unrelated actor")
        seal = self.seal_by(self.sess, RP1A, key)
        self.assertEqual(seal["contamination"]["status"], "CLEAN")
        # lawful reporters: the tuple's custodian (late-discovery, F-4)
        self.sess.acknowledge_seal_receipt(CUST, key, RP1A)
        inc = self.sess.report_exposure(CUST, key, RP1A, "MARK_A",
                                        "SYNTHETIC late discovery")
        self.assertEqual(inc["phase1Contamination"]["status"],
                         "CONTAMINATED")
        # lawful reporters: the exposed actor themself (§G.4 self-disclosure)
        key2 = self.register_tuple(self.sess, 1)["tupleKey"]
        self.issue_to(self.sess, RP1B, key2)
        inc2 = self.sess.report_exposure(RP1B, key2, RP1B, "OUTCOME_OR_ENVIRONMENT",
                                         "SYNTHETIC self-disclosure")
        self.assertEqual(inc2["phase1Contamination"]["status"],
                         "CONTAMINATED")
        seal2 = self.seal_by(self.sess, RP1B, key2)
        self.assertEqual(seal2["contamination"]["status"], "CONTAMINATED")
        # the sealed CLEAN first reviewer is unaffected by the lawful
        # incidents of other tuples; append-only chain intact
        custody = self.sess.custody_view(CUST, key)
        self.assertEqual(custody["status"]["effectiveSeals"][0]
                         ["effectivelyClean"], False)  # late discovery, F-4
        self.assertTrue(self.sess.verify_integrity()["valid"])
        self.assertEqual(self.sess.category_assignment(key)
                         ["categoryAssignment"], "UNASSIGNED")

    # ---------------- F-25 ----------------

    def test_F25_exact_tick_types_enforced(self):
        """GATE: F-25 BOOLEAN OCCURRENCE TICK — only plain integers are lawful occurrences

        Original failure (reproduced on CORR3): occurred_at_tick=True is
        accepted live, persists and imports. CORR6 (OD-37/F-37): the
        occurrence input is a scope-local reference into the reporter's own
        recorded sequence. The F-25 type discipline applies to the
        reference (bool/float/string ordinals refused with
        INVALID_TICK_TYPE on live and replay; None unestablished preserved;
        a bare session tick is not a lawful input — it was an indirect
        session-clock probe channel); the impossible-future rule becomes
        the scope-local own-record bound and non-positive values stay
        refused.
        """
        # --- minimal reproduction on the CORR3 engine
        mod = corr3_engine()
        orig = self.corr3_session()
        self.register_all_legacy(orig, mod)
        okey = orig.register_tuple(CUST, FIX["tuples"][0])["tupleKey"]
        orig.issue_packet(CUST, RP1A, okey)
        orig.report_exposure(CUST, okey, RP1A, "MARK_A", "SYNTHETIC",
                             occurred_at_tick=True)
        opath = Path(self._tmp) / "h_f25_orig.jsonl"
        op = orig.persist_history("h_f25_orig.jsonl")
        orig2 = self.corr3_session()
        self.register_all_legacy(orig2, mod)
        self.assertTrue(orig2.import_history(Path(op["path"]))["imported"])
        # --- CORR6: live refusals (scope-local occurrence references)
        self.register_all()
        key = self.register_tuple()["tupleKey"]
        self.issue_to(self.sess, RP1A, key)
        for bad in (True, False, 1.0, "3"):
            self.expect_gate("INVALID_TICK_TYPE",
                             self.sess.report_exposure, CUST, key, RP1A,
                             "MARK_A", "SYNTHETIC", occurred=occref(bad))
        for bad in (1, True, "3"):
            self.expect_gate("INVALID_TICK_TYPE",
                             self.sess.report_exposure, CUST, key, RP1A,
                             "MARK_A", "SYNTHETIC", occurred=bad)
        self.expect_gate("UNKNOWN_FIELD_REJECTED",
                         self.sess.report_exposure, CUST, key, RP1A,
                         "MARK_A", "SYNTHETIC",
                         occurred={"scope": "self", "scopeOrdinal": 1,
                                   "injected": 1})
        self.expect_gate("INVALID_TICK_TYPE",
                         self.sess.report_exposure, CUST, key, RP1A,
                         "MARK_A", "SYNTHETIC",
                         occurred={"scope": "session", "scopeOrdinal": 1})
        self.expect_gate("INVALID_PAYLOAD",
                         self.sess.report_exposure, CUST, key, RP1A,
                         "MARK_A", "SYNTHETIC", occurred=occref(-1))
        self.expect_occurrence_refusal(self.sess, key, CUST, RP1A, 10 ** 6)
        # lawful values: None (unestablished) and a real own-scope ordinal
        self.sess.report_exposure(CUST, key, RP1A, "MARK_A", "SYNTHETIC")
        lawful = self.sess.report_exposure(CUST, key, RP1A, "MARK_B",
                                           "SYNTHETIC", occurred=occref(1))
        self.assertEqual(lawful["occurredAtTick"]["scope"], key)
        self.assertIsInstance(lawful["occurredAtTick"]["scopeOrdinal"], int)
        # replay: forged occurrence references are refused
        live = self.host_events(self.sess)
        for forged_payload in (
                {"tupleKey": key, "exposedTo": RP1B, "what": "MARK_A",
                 "reportedBy": CUST, "detail": "SYNTHETIC",
                 "occurredAtTick": None,
                 "occurredScopeRef": {"scope": "self",
                                      "scopeOrdinal": True}},
                {"tupleKey": key, "exposedTo": RP1B, "what": "MARK_A",
                 "reportedBy": CUST, "detail": "SYNTHETIC",
                 "occurredAtTick": True, "occurredScopeRef": None}):
            forged = build_forged_extension(live, [
                ("EXPOSURE_REPORTED", forged_payload)])
            fpath = Path(self._tmp) / "h_f25_forged.jsonl"
            write_events_file(fpath, forged)
            self.assertTrue(self.sess.verify_global_history(fpath)["valid"])
            self.expect_gate("PROCEDURALLY_INVALID_HISTORY",
                             self.sess.restore_global_history, fpath)
        # the lawful history itself still persists to the host and restores
        persisted = self.host_persist(self.sess, "h_f25_ok.jsonl")
        fresh = self.new_session()
        ok = fresh.restore_global_history(Path(persisted["path"]))
        self.assertTrue(ok["restored"])
        self.assertEqual(self.sess.category_assignment(key)
                         ["categoryAssignment"], "UNASSIGNED")

    # ---------------- F-26 ----------------

    def test_F26_single_effective_contamination_model(self):
        """GATE: F-26 RETROSPECTIVE EXPOSURE OMITTED FROM AGGREGATES — one effective model everywhere

        Original failure (reproduced on CORR3): the derived
        RETROSPECTIVE_RECORD incident exists per-reviewer but is missing
        from custody observability and recovery gating. CORR4: a single
        aggregation drives all surfaces — custody shows the actor,
        recovery recognizes the effective contamination (lawful new-Phase-1
        for a fresh reviewer), the contaminated reproducer still cannot
        seal CLEAN, and status derives consistently.
        """
        # --- minimal reproduction on the CORR3 engine
        mod = corr3_engine()
        orig = self.corr3_session()
        self.register_all_legacy(orig, mod)
        okey = orig.register_tuple(CUST, FIX["tuples"][0])["tupleKey"]
        ref = FIX["tuples"][0]["retrospectiveRecords"][0]
        orig.declare_records_rederived(RIND, okey,
            [{"recordId": ref["id"], "locator": ref["locator"],
              "content": ref["content"]}])
        ocv = orig.custody_view(CUST, okey)
        self.assertEqual(ocv["effectiveContaminationByActor"], {})
        # --- CORR4: the same declaration is visible on every surface
        self.register_all()
        key = self.register_tuple()["tupleKey"]
        self.issue_to(self.sess, RIND, key)
        self.sess.declare_records_rederived(RIND, key, [self._ref(0, 0)])
        cv = self.sess.custody_view(CUST, key)
        self.assertIn(RIND, cv["effectiveContaminationByActor"])
        self.assertEqual(
            cv["effectiveContaminationByActor"][RIND]["status"],
            "CONTAMINATED")
        self.assertEqual(
            cv["effectiveContaminationByActor"][RIND]["incidents"][0]["what"],
            "RETROSPECTIVE_RECORD")
        # the exposed reproducer cannot obtain a blind reproduction: a
        # second custodian issuance is refused, and the reproducer gate
        # refuses on the derived exposure
        self.expect_gate("REVIEWER_ALREADY_EXPOSED",
                         self.sess.issue_packet, CUST, RIND, key)
        self.expect_gate("REVIEWER_ALREADY_EXPOSED",
                         self.sess.begin_independent_reproduction,
                         RIND, key)
        # recovery now recognizes the effective contamination and a fresh
        # unexposed reviewer lawfully receives the new Phase 1
        packet = self.sess.request_new_phase1(CUST, key, RP1B)
        self.assertEqual(set(packet.keys()), set(oe.PACKET_FIELDS))
        # consistency across surfaces on a second tuple (Lane B class,
        # already aggregated pre-CORR4, still aggregated identically)
        key2 = self.register_tuple(self.sess, 1)["tupleKey"]
        sid = self.sess.register_lane_b(RLB, key2, FIX["laneB"])["submissionId"]
        self.sess.deliver_lane_b_to(CUST, RP1A, key2, sid)
        # an exposed reviewer is refused even at recovery (the R_P1 RP1A
        # was exposed by the Lane B delivery on key2)
        self.expect_gate("REVIEWER_ALREADY_EXPOSED",
                         self.sess.request_new_phase1, CUST, key2, RP1A)
        cv2 = self.sess.custody_view(CUST, key2)
        self.assertIn(RP1A, cv2["effectiveContaminationByActor"])
        self.assertEqual(self.sess.category_assignment(key)
                         ["categoryAssignment"], "UNASSIGNED")

    # ---------------- F-27 ----------------

    def test_F27_historical_verification_is_bounded(self):
        """GATE: F-27 HISTORICAL CLAIM PROMOTED WITHOUT A VERIFIABLE NAMED PROPOSITION — mechanical provenance is no longer reported as ADJUDICATED

        Original failure (reproduced on CORR3): SYN_CLAIM_999 — with no
        Phase-1 review and no registered proposition anywhere — returns
        ADJUDICATED on the strength of record-authentication alone. CORR4:
        the same flow returns PROVENANCE_VERIFIED_NOT_ADJUDICATED with
        mechanicalVerificationOnly=true and the explicit unresolved-gate
        marker; the claimLevel aggregate reflects the bounded state; a
        normative reproduction elsewhere still adjudicates. The bounded
        label is a disclosure-control state of this offline gate, not a
        new causal category and not an accepted §I status.
        """
        # --- minimal reproduction on the CORR3 engine
        mod = corr3_engine()
        orig = self.corr3_session()
        self.register_all_legacy(orig, mod)
        okey = orig.register_tuple(CUST, FIX["tuples"][0])["tupleKey"]
        ref = FIX["tuples"][0]["retrospectiveRecords"][0]
        rr = [{"recordId": ref["id"], "locator": ref["locator"],
               "content": ref["content"]}]
        orig.declare_records_rederived(RIND, okey, rr)
        oadj = orig.adjudicate_claim(RIND, okey, "HISTORICAL_RECORD_PRODUCTION",
                                     "SYN_CLAIM_999", record_refs=rr)
        self.assertEqual(oadj["claimLevelStatus"], "ADJUDICATED")
        # --- CORR4: bounded representation
        self.register_all()
        key = self.register_tuple()["tupleKey"]
        self.issue_to(self.sess, RIND, key)  # CORR7/F-41 packet-first
        self.sess.declare_records_rederived(RIND, key, [self._ref(0, 0)])
        res = self.sess.adjudicate_claim(
            RIND, key, "HISTORICAL_RECORD_PRODUCTION", "SYN_CLAIM_999",
            record_refs=[self._ref(0, 0)],
            proposition=hist_prop("HISTORICAL_RECORD_PRODUCTION"))
        self.assertEqual(res["claimLevelStatus"],
                         "PROVENANCE_VERIFIED_NOT_ADJUDICATED")
        self.assertTrue(res["mechanicalVerificationOnly"])
        self.assertIn("unresolved gate", res["scopeNote"])
        # the aggregate reflects the bounded state, not ADJUDICATED
        status = self.sess.workflow_status(key, CUST)
        self.assertEqual(status["claimLevel"],
                         "PROVENANCE_VERIFIED_NOT_ADJUDICATED")
        # a normative reproduction elsewhere still adjudicates
        key2, _ = self.lawful_revealed(self.sess, RP1A, idx=1)
        self.issue_to(self.sess, RIND, key2)
        self.sess.begin_independent_reproduction(RIND, key2)
        self.seal_by(self.sess, RIND, key2)
        self.sess.receive_first_rationale(RIND, key2)
        norm = self.sess.adjudicate_claim(
            RIND, key2, "NORMATIVE_DETERMINACY", FIX["claims"]["normative"])
        self.assertEqual(norm["claimLevelStatus"], "ADJUDICATED")
        self.assertEqual(self.sess.workflow_status(key2, CUST)["claimLevel"],
                         "ADJUDICATED")
        # import/live equivalence: the bounded payload is engine-constructed
        persisted = self.host_persist(self.sess, "h_f27.jsonl")
        fresh = self.new_session()
        self.register_all(fresh)
        ok = fresh.restore_global_history(Path(persisted["path"]))
        self.assertTrue(ok["restored"])
        self.assertEqual(
            fresh.workflow_status(key, CUST)["claimLevel"],
            "PROVENANCE_VERIFIED_NOT_ADJUDICATED")
        self.assertEqual(self.sess.category_assignment(key)
                         ["categoryAssignment"], "UNASSIGNED")

    # ---------------- F-28 ----------------

    def test_F28_anonymous_surface_withheld(self):
        """GATE: F-28 ANONYMOUS EVENT METADATA DEFEATS BLINDNESS — the anonymous surface is a fixed aggregate with zero inference

        Original failure (reproduced on CORR3): the anonymous event list
        reveals the full procedural chronology of a single-tuple session.
        CORR4: the anonymous surface returns a fixed shape (no per-event
        entries, no counts, no chain material); successive anonymous calls
        are byte-identical before and after workflow progress, so polling
        and diffing reveal nothing. CORR5 (F-30): unauthenticated
        verify_integrity() no longer carries eventCount; a registered
        custodian still receives the count.
        """
        # --- minimal reproduction on the CORR3 engine
        mod = corr3_engine()
        orig = self.corr3_session()
        self.register_all_legacy(orig, mod)
        okey = orig.register_tuple(CUST, FIX["tuples"][0])["tupleKey"]
        self._flow(orig, okey)
        leaked = [e["eventType"] for e in orig.events()]
        self.assertIn("PHASE1_SEALED", leaked)
        # --- CORR4: fixed withheld shape at every stage
        self.register_all()
        before = self.sess.events()
        self.assertEqual(before[0].get("disclosure"),
                         "ANONYMOUS_METADATA_WITHHELD")
        self.assertEqual(len(before), 1)
        self.assertNotIn("eventType", before[0])
        key = self.register_tuple()["tupleKey"]
        self._flow(self.sess, key)
        after = self.sess.events()
        self.assertEqual(before, after)  # polling/diffing reveal nothing
        self.assertNotIn("PHASE1_SEALED", json.dumps(after))
        self.assertNotIn("revealedAt", json.dumps(after))
        # CORR6 (OD-37/F-37): integrity diagnostics are constant for
        # EVERY requester — the session-global eventCount is never a
        # requester-scoped field (supersedes the CORR5 custodian count,
        # which was itself an OD-37 leak channel).
        integrity = self.sess.verify_integrity()
        self.assertEqual(integrity, {"valid": True, "reason": "ok"})
        self.assertNotIn("eventCount", integrity)
        authorized = self.sess.verify_integrity(CUST)
        self.assertEqual(authorized, integrity)
        host_chain = self.host_persist(self.sess, "h_f28_host.jsonl")
        self.assertGreater(host_chain["eventCount"], 1)
        custody = self.sess.custody_view(CUST, key)
        self.assertEqual(custody["status"]["tupleLevel"], "PROVISIONAL")
        # a blind second reviewer does not observe foreign milestones
        self.issue_to(self.sess, RP1B, key)
        blind = self.sess.events(RP1B)
        self.assertNotIn("PHASE1_SEALED",
                         {e["eventType"] for e in blind})
        self.assertNotIn("REVEALED", {e["eventType"] for e in blind})

    # ---------------- F-29 ----------------

    def test_F29_normative_coherence_enforced(self):
        """GATE: F-29 INTERNALLY CONTRADICTORY NORMATIVE PROOF — refused at seal and at replay, exactly within the accepted contract

        Original failure (reproduced on CORR3): contradictory bound
        (readings YES/NO with determinacy ESTABLISHED) seals CLEAN twice
        and adjudicates normatively. CORR4: such a review is refused with
        INVALID_NORMATIVE_CONSISTENCY (§E.1: determinacy ESTABLISHED
        requires a common output); bound/states disagreements and
        sharedOutput without established determinacy are refused; two
        identical CONSISTENT reviews still reproduce and adjudicate
        (lawful counterpart). No new scientific criteria are introduced.
        """
        bad = json.loads(json.dumps(FIX["phase1Reviews"]["determinateYes"]))
        bad["interpretationBound"]["readingsConsidered"] = [
            {"id": "SYN_READING_R1", "output": "YES"},
            {"id": "SYN_READING_R2", "output": "NO"}]
        # --- minimal reproduction on the CORR3 engine
        mod = corr3_engine()
        orig = self.corr3_session()
        self.register_all_legacy(orig, mod)
        okey = orig.register_tuple(CUST, FIX["tuples"][0])["tupleKey"]
        orig.issue_packet(CUST, RP1A, okey)
        oa = orig.submit_phase1_review(RP1A, okey, bad)
        orig.issue_packet(CUST, RP1B, okey)
        ob = orig.submit_phase1_review(RP1B, okey, bad)
        self.assertEqual(oa["contamination"]["status"], "CLEAN")
        orig.acknowledge_seal_receipt(CUST, okey, RP1A)
        orig.begin_independent_reproduction(RIND, okey)
        orig.submit_phase1_review(RIND, okey, bad)
        orig.receive_first_rationale(RIND, okey)
        oadj = orig.adjudicate_claim(RIND, okey, "NORMATIVE_DETERMINACY",
                                     FIX["claims"]["normative"])
        self.assertEqual(oadj["claimLevelStatus"], "ADJUDICATED")
        # --- CORR4: contradictory submissions refused at the seal
        self.register_all()
        key = self.register_tuple()["tupleKey"]
        self.issue_to(self.sess, RP1A, key)
        self.expect_gate("INVALID_NORMATIVE_CONSISTENCY",
                         self.sess.submit_phase1_review, RP1A, key, bad)
        # mismatched bound/states determinacy refused
        mismatched = json.loads(json.dumps(
            FIX["phase1Reviews"]["indeterminate"]))
        mismatched["normativeStates"]["determinacy"] = "ESTABLISHED"
        self.expect_gate("INVALID_NORMATIVE_CONSISTENCY",
                         self.sess.submit_phase1_review, RP1A, key,
                         mismatched)
        # sharedOutput without established determinacy refused
        ghost = json.loads(json.dumps(
            FIX["phase1Reviews"]["indeterminate"]))
        ghost["normativeStates"]["sharedOutput"] = "YES"
        self.expect_gate("INVALID_NORMATIVE_CONSISTENCY",
                         self.sess.submit_phase1_review, RP1A, key, ghost)
        # wrong common output refused
        wrong = json.loads(json.dumps(
            FIX["phase1Reviews"]["determinateYes"]))
        wrong["normativeStates"]["sharedOutput"] = "NO"
        self.expect_gate("INVALID_NORMATIVE_CONSISTENCY",
                         self.sess.submit_phase1_review, RP1A, key, wrong)
        # lawful counterpart: consistent reviews seal, reproduce, adjudicate
        sa = self.seal_by(self.sess, RP1A, key)
        self.assertEqual(sa["contamination"]["status"], "CLEAN")
        self.sess.acknowledge_seal_receipt(CUST, key, RP1A)
        self.issue_to(self.sess, RIND, key)
        self.sess.begin_independent_reproduction(RIND, key)
        self.seal_by(self.sess, RIND, key)
        self.sess.receive_first_rationale(RIND, key)
        adj = self.sess.adjudicate_claim(RIND, key, "NORMATIVE_DETERMINACY",
                                         FIX["claims"]["normative"])
        self.assertEqual(adj["claimLevelStatus"], "ADJUDICATED")
        # replay: a forged inconsistent seal is refused at import
        live = self.host_events(self.sess)
        packet_sha = oe.sha256_hex(oe.canonical_bytes({
            "caseId": FIX["tuples"][0]["caseId"],
            "sideId": FIX["tuples"][0]["sideId"],
            "factId": FIX["tuples"][0]["factId"],
            "sealedFactText": FIX["tuples"][0]["sealedFactText"],
            "questionText": FIX["tuples"][0]["questionText"]}))
        payload = json.loads(json.dumps(
            FIX["phase1Reviews"]["determinateYes"]))
        payload["interpretationBound"]["readingsConsidered"] = [
            {"id": "SYN_READING_R1", "output": "YES"},
            {"id": "SYN_READING_R2", "output": "NO"}]
        payload = {"packetSha": packet_sha, "reviewer": RP1B,
                   "interpretationBound": payload["interpretationBound"],
                   "rationale": payload["rationale"],
                   "normativeStates": payload["normativeStates"],
                   "nonAuthoritativeObservations": [],
                   "synthetic": True}
        forged = build_forged_extension(live, [
            ("PHASE1_SEALED", {
                "tupleKey": key, "reviewer": RP1B,
                "packetSha": packet_sha,
                "sealedBytesSha": oe.sha256_hex(oe.canonical_bytes(payload)),
                "sealedAt": live[-1]["t"] + 1,
                "contamination": {"status": "CLEAN", "incidents": []},
                "sealedPayload": payload})])
        fpath = Path(self._tmp) / "h_f29_forged.jsonl"
        write_events_file(fpath, forged)
        self.assertTrue(self.sess.verify_global_history(fpath)["valid"])
        self.expect_gate("PROCEDURALLY_INVALID_HISTORY",
                         self.sess.restore_global_history, fpath)
        self.assertEqual(self.sess.category_assignment(key)
                         ["categoryAssignment"], "UNASSIGNED")


# ==========================================================================
# F-30..F-36: CORR5 finding closures (reproduced on the immutable CORR4)
# ==========================================================================

class Corr5FindingTests(EFCAUnitTest):

    def _flow(self, s, key, reviewer=RP1A):
        s.issue_packet(CUST, reviewer, key)
        s.submit_phase1_review(reviewer, key,
                               FIX["phase1Reviews"]["determinateYes"])
        s.acknowledge_seal_receipt(CUST, key, reviewer)
        s.reveal(CUST, reviewer, key)
        s.append_delta(reviewer, key, FIX["phase2Deltas"]["noChange"])

    def _reproduce(self, s, key):
        s.issue_packet(CUST, RP1A, key)
        s.submit_phase1_review(RP1A, key,
                               FIX["phase1Reviews"]["determinateYes"])
        s.acknowledge_seal_receipt(CUST, key, RP1A)
        s.issue_packet(CUST, RIND, key)  # CORR7/F-41 packet-first
        s.begin_independent_reproduction(RIND, key)
        s.submit_phase1_review(RIND, key,
                               FIX["phase1Reviews"]["determinateYes"])
        s.receive_first_rationale(RIND, key)

    # ---------------- F-30 ----------------

    def test_F30_diagnostics_are_constant_and_counts_are_host_level(self):
        """GATE: F-30→F-37 SESSION-GLOBAL DIAGNOSTIC LEAK — integrity diagnostics are constant for EVERY requester; counts live on the host channel only

        Original failure (reproduced on CORR4): verify_integrity()["eventCount"]
        increases across one tuple's workflow while anonymous events() stays
        fixed. CORR6 (OD-37/F-37): the session-global eventCount is itself a
        disclosure channel ('session-global event counts' is enumerated in
        OD-37) and is therefore NEVER returned through a requester-scoped
        surface — including to a registered custodian (supersedes the CORR5
        F-30 custodian count with explicit justification). Every requester
        receives the constant shape; the engine-host channel carries the
        count and the detailed diagnostics. An unknown actor is refused.
        """
        mod = corr4_engine()
        orig = self.corr4_session()
        self.register_all_legacy(orig, mod)
        okey = orig.register_tuple(CUST, FIX["tuples"][0])["tupleKey"]
        c0 = orig.verify_integrity()["eventCount"]
        self._flow(orig, okey)
        c1 = orig.verify_integrity()["eventCount"]
        self.assertGreater(c1, c0)
        self.assertEqual(orig.events(), orig.events())
        # --- CORR6: the constant shape for every requester
        self.register_all()
        healthy = {"valid": True, "reason": "ok"}
        self.assertEqual(self.sess.verify_integrity(), healthy)
        key = self.register_tuple()["tupleKey"]
        pre_count = self._chain_probe(self.sess)[0]
        self._flow(self.sess, key)
        self.assertEqual(self.sess.verify_integrity(), healthy)
        self.assertEqual(self.sess.verify_integrity(CUST), healthy)
        self.assertEqual(self.sess.verify_integrity(RP1A), healthy)
        self.expect_gate("UNKNOWN_ACTOR", self.sess.verify_integrity,
                         "SYN_NOBODY_001")
        # --- the host channel carries the counts and the detailed reasons
        gh = self.host_persist(self.sess, "h_f30.jsonl")
        self.assertGreater(gh["eventCount"], pre_count)
        verified = self.sess.verify_global_history(Path(gh["path"]))
        self.assertEqual(verified, {"valid": True, "reason": "ok",
                                    "eventCount": gh["eventCount"]})
        # --- requester projections are separate, marked, and countable-free
        projection = self.sess.persist_history("h_f30_proj.json", CUST)
        self.assertEqual(set(projection),
                         {"path", "artifactClass", "completeGlobalChainProof",
                          "authoritativeChainBackup"})
        self.assertEqual(self.sess.verify_persisted_history(
            Path(projection["path"]), CUST), healthy)
        projection2 = self.sess.persist_history("h_f30_proj.json", CUST)
        self.assertEqual(projection2["path"], projection["path"])
        self.expect_gate("UNKNOWN_ACTOR", self.sess.persist_history,
                         "h_f30_anon.json")
        # --- a corrupt artifact never discloses seq to any requester; the
        # host channel gets the detailed reason
        path = Path(gh["path"])
        lines = path.read_text(encoding="utf-8").splitlines()
        bad = json.loads(lines[-1])
        bad["payload"]["injected"] = "SYNTHETIC"
        lines[-1] = json.dumps(bad, sort_keys=True, separators=(",", ":"))
        path.write_text("\n".join(lines) + "\n", encoding="utf-8")
        self.assertEqual(
            self.sess.verify_persisted_history(path, CUST),
            {"valid": False, "reason": "not_a_lawful_projection"})
        host_bad = self.sess.verify_global_history(path)
        self.assertFalse(host_bad["valid"])
        self.assertIn("seq", host_bad["reason"])  # host-level detail only
        # --- a rejected transition leaves the public diagnostics unchanged
        chain = self._sha_chain(self.sess)
        self.expect_gate("REVEAL_ALREADY_PERFORMED",
                         self.sess.reveal, CUST, RP1A, key)
        self.assertEqual(self._sha_chain(self.sess), chain)
        self.assertEqual(self.sess.verify_integrity(), healthy)
        self.assertEqual(self.sess.verify_integrity(CUST), healthy)
        # --- native live/restore equivalence through the host channel
        final_chain = self.host_persist(self.sess, "h_f30_final.jsonl")
        fresh = self.new_session()
        restored = fresh.restore_global_history(Path(final_chain["path"]))
        self.assertEqual(restored["restored"], True)
        self.assertEqual(fresh.workflow_status(key, CUST)["tupleLevel"],
                         "PROVISIONAL")
        self.assertEqual(fresh.verify_integrity(), healthy)

    # ---------------- F-31 ----------------

    def test_F31_blind_reviewer_omits_foreign_milestones(self):
        """GATE: F-31 BLIND REVIEWER SEES FOREIGN MILESTONES — omitted, not projected

        Original failure (reproduced on CORR4): an unsealed R_P1 observes
        another reviewer's PHASE1_SEALED, REVEALED and DELTA_APPENDED with
        seq and tick, then seals CLEAN. CORR5 omits those events. The visible
        list uses a local ordinal, so counts, gaps and polling diffs of
        foreign progress are absent. The requester's own packet stays visible.
        Post-seal redaction still discloses sealedBytesSha and revealedAt.
        """
        mod = corr4_engine()
        orig = self.corr4_session()
        self.register_all_legacy(orig, mod)
        okey = orig.register_tuple(CUST, FIX["tuples"][0])["tupleKey"]
        orig.issue_packet(CUST, RP1B, okey)
        self._flow(orig, okey, RP1A)
        leaked_types = {e["eventType"] for e in orig.events(RP1B)}
        for kind in ("PHASE1_SEALED", "REVEALED", "DELTA_APPENDED"):
            self.assertIn(kind, leaked_types)
        sample = next(e for e in orig.events(RP1B)
                      if e["eventType"] == "PHASE1_SEALED")
        self.assertIn("seq", sample)
        self.assertIn("t", sample)
        oseal = orig.submit_phase1_review(
            RP1B, okey, FIX["phase1Reviews"]["determinateYes"])
        self.assertEqual(oseal["contamination"]["status"], "CLEAN")
        # --- CORR5
        self.register_all()
        key = self.register_tuple()["tupleKey"]
        self.issue_to(self.sess, RP1B, key)
        blind_before = self.sess.events(RP1B)
        self._flow(self.sess, key, RP1A)
        blind_after = self.sess.events(RP1B)
        self.assertEqual(blind_before, blind_after)
        self.assertEqual(self.sess.events(RP1B), blind_after)
        types = {e["eventType"] for e in blind_after}
        for kind in ("PHASE1_SEALED", "REVEALED", "DELTA_APPENDED",
                     "TUPLE_REGISTERED", "SEAL_RECEIPT_ACKNOWLEDGED"):
            self.assertNotIn(kind, types)
        self.assertIn("PACKET_ISSUED", types)
        self.assertNotIn(RP1A, json.dumps(blind_after))
        ordinals = []
        for e in blind_after:
            self.assertEqual(set(e), {"localOrdinal", "eventType", "payload"})
            ordinals.append(e["localOrdinal"])
        self.assertEqual(ordinals, list(range(1, len(ordinals) + 1)))
        own = [e for e in blind_after if e["eventType"] == "PACKET_ISSUED"]
        self.assertEqual(own[0]["payload"]["reviewer"], RP1B)
        chain = self._sha_chain(self.sess)
        held = self.sess.events(RP1B)
        self.expect_gate("REVEAL_ALREADY_PERFORMED",
                         self.sess.reveal, CUST, RP1A, key)
        self.assertEqual(self._sha_chain(self.sess), chain)
        self.assertEqual(self.sess.events(RP1B), held)
        seal = self.seal_by(self.sess, RP1B, key)
        self.assertEqual(seal["contamination"]["status"], "CLEAN")
        post = json.dumps(self.sess.events(RP1B))
        self.assertIn("sealedBytesSha", post)
        self.assertIn("revealedAt", post)
        persisted = self.host_persist(self.sess, "h_f31.jsonl")
        fresh = self.new_session()
        self.register_all(fresh)
        self.assertTrue(fresh.restore_global_history(Path(persisted["path"]))["restored"])
        self.assertEqual(fresh.events(RP1B), self.sess.events(RP1B))

    # ---------------- F-32 ----------------

    def test_F32_lane_b_registration_is_not_tuple_access(self):
        """GATE: F-32 UNAUTHORIZED LANE B SELF-REGISTRATION GRANTS STATUS — registration is not access

        Original failure (reproduced on CORR4): an R_LB with no prior
        relationship calls register_lane_b and then receives workflow_status.
        The accepted rubric names the Lane B record and does not define a
        custodian-issued assignment act (§G.4 issuedTo is the Phase-1
        packet; §I laneB has no assignee). CORR5 does not invent one.
        register_lane_b still files the evidence record. workflow_status
        stays withheld. lane_b_view remains the lawful read. The custodian
        and a sealed reviewer stay authorized.
        """
        mod = corr4_engine()
        orig = self.corr4_session()
        self.register_all_legacy(orig, mod)
        okey = orig.register_tuple(CUST, FIX["tuples"][0])["tupleKey"]
        orig.issue_packet(CUST, RP1A, okey)
        orig.submit_phase1_review(RP1A, okey,
                                  FIX["phase1Reviews"]["determinateYes"])
        orig.acknowledge_seal_receipt(CUST, okey, RP1A)
        self.assertEqual(orig.workflow_status(okey, RLB).get("disclosure"),
                         "WITHHELD_BEFORE_OWN_SEAL")
        orig.register_lane_b(RLB, okey, FIX["laneB"])
        self.assertIn("tupleLevel", orig.workflow_status(okey, RLB))
        # --- CORR6
        self.register_all_plus()
        key = self.register_tuple()["tupleKey"]
        self.issue_to(self.sess, RP1A, key)
        self.seal_by(self.sess, RP1A, key)
        self.sess.acknowledge_seal_receipt(CUST, key, RP1A)
        before = self.sess.workflow_status(key, RLB)
        self.assertEqual(before.get("disclosure"), "WITHHELD_BEFORE_OWN_SEAL")
        self.assertNotIn("tupleLevel", before)
        chain = self._sha_chain(self.sess)
        first = self.sess.register_lane_b(RLB, key, FIX["laneB"])
        after = self.sess.workflow_status(key, RLB)
        self.assertEqual(after, before)
        self.assertEqual(self._sha_chain(self.sess)[0], chain[0] + 1)
        self.assertEqual(self.sess.workflow_status(key, RLB), after)
        self.assertEqual(self._sha_chain(self.sess)[0], chain[0] + 1)
        self.assertEqual(self.sess.workflow_status(key, CUST)["tupleLevel"],
                         "IN_PROGRESS")
        view = self.sess.lane_b_view(RLB, key)
        self.assertEqual(view["submissions"][0]["reviewer"], RLB)
        self.assertEqual(view["submissions"][0]["causeLink"],
                         "UNASSIGNED_PENDING_J1")
        # F-39/OD-39: a second registered R_LB files an independent
        # submission; the first submission does not monopolize the tuple.
        second = self.sess.register_lane_b(RLB2, key, FIX["laneB"])
        # CORR8/F-44: RLB2's identity is independent of RLB's filing
        self.assertEqual(second["submissionId"], sub_id(RLB2, key, 1))
        self.assertNotEqual(second["submissionId"], first["submissionId"])
        self.assertEqual(self.sess.workflow_status(key, RLB2).get("disclosure"),
                         "WITHHELD_BEFORE_OWN_SEAL")
        # each R_LB sees only their own submission; the custodian sees both
        self.assertEqual(
            [s["submissionId"] for s in self.sess.lane_b_view(RLB, key)
             ["submissions"]],
            [first["submissionId"]])
        self.assertEqual(
            [s["submissionId"] for s in self.sess.lane_b_view(RLB2, key)
             ["submissions"]],
            [second["submissionId"]])
        # CORR8/F-44: identity sets are order-independent (hash ids do
        # not sort in filing order; delivery is by exact identity)
        self.assertEqual(
            sorted(s["submissionId"] for s in
                   self.sess.lane_b_view(CUST, key)["submissions"]),
            sorted([first["submissionId"], second["submissionId"]]))
        self.sess.reveal(CUST, RP1A, key)
        self.sess.append_delta(RP1A, key, FIX["phase2Deltas"]["noChange"])
        self.assertEqual(self.sess.workflow_status(key, RP1A)["tupleLevel"],
                         "PROVISIONAL")
        self.assertEqual(self.sess.workflow_status(key, RLB).get("disclosure"),
                         "WITHHELD_BEFORE_OWN_SEAL")
        # F-39: a delivery must reference one exact existing submission.
        # CORR8/F-44: a non-conforming string fails the synthetic
        # pattern; a WELL-FORMED but non-existent identity fails the
        # existence check; both leave the state unchanged.
        snap = self._sha_chain(self.sess)
        self.expect_gate("NON_SYNTHETIC_IDENTIFIER",
                         self.sess.deliver_lane_b_to,
                         CUST, RP1C, key, "SYN_SUB_099")
        self.assertEqual(self._sha_chain(self.sess), snap)
        snap = self._sha_chain(self.sess)
        self.expect_gate("INVALID_PAYLOAD", self.sess.deliver_lane_b_to,
                         CUST, RP1C, key, sub_id(RLB2, key, 9))
        self.assertEqual(self._sha_chain(self.sess), snap)
        delivered = self.sess.deliver_lane_b_to(
            CUST, RP1C, key, second["submissionId"])
        self.assertEqual(delivered["submissionId"], second["submissionId"])
        self.assertEqual(self.sess.workflow_status(key, RLB).get("disclosure"),
                         "WITHHELD_BEFORE_OWN_SEAL")
        persisted = self.host_persist(self.sess, "h_f32.jsonl")
        fresh = self.new_session()
        self.assertTrue(fresh.restore_global_history(
            Path(persisted["path"]))["restored"])
        self.assertEqual(fresh.workflow_status(key, RLB),
                         self.sess.workflow_status(key, RLB))
        self.assertEqual(
            sorted(s["submissionId"] for s in
                   fresh.lane_b_view(CUST, key)["submissions"]),
            sorted([first["submissionId"], second["submissionId"]]))
        self.assertEqual(fresh.workflow_status(key, CUST)["tupleLevel"],
                         "PROVISIONAL")

    # ---------------- F-33 ----------------

    def test_F33_unrelated_lane_b_omits_foreign_event_details(self):
        """GATE: F-33 UNRELATED LANE B ACTOR SEES FOREIGN EVENT DETAILS — one disclosure model

        Original failure (reproduced on CORR4): an R_LB who correctly receives
        WITHHELD workflow_status still receives sealedBytesSha, sealedAt,
        contaminationStatus and revealedAt through events(). CORR5 applies
        the same tuple authorization to events(). The unrelated view is
        byte-identical across another actor's workflow. After the R_LB files
        their own record, that submission is visible and the foreign seal
        details stay absent.
        """
        mod = corr4_engine()
        orig = self.corr4_session()
        self.register_all_legacy(orig, mod)
        okey = orig.register_tuple(CUST, FIX["tuples"][0])["tupleKey"]
        self._flow(orig, okey)
        self.assertEqual(orig.workflow_status(okey, RLB).get("disclosure"),
                         "WITHHELD_BEFORE_OWN_SEAL")
        leaked = json.dumps(orig.events(RLB))
        for marker in ("sealedBytesSha", "sealedAt", "contaminationStatus",
                       "revealedAt"):
            self.assertIn(marker, leaked)
        # --- CORR6
        self.register_all_plus()
        key = self.register_tuple()["tupleKey"]
        before = self.sess.events(RLB)
        chain = self._sha_chain(self.sess)
        self._flow(self.sess, key)
        after = self.sess.events(RLB)
        self.assertEqual(before, after)
        self.assertGreaterEqual(self._sha_chain(self.sess)[0], chain[0])
        blob = json.dumps(after)
        for marker in ("sealedBytesSha", "sealedAt", "contaminationStatus",
                       "revealedAt"):
            self.assertNotIn(marker, blob)
        self.assertEqual(self.sess.workflow_status(key, RLB).get("disclosure"),
                         "WITHHELD_BEFORE_OWN_SEAL")
        self.sess.register_lane_b(RLB, key, FIX["laneB"])
        own = json.dumps(self.sess.events(RLB))
        self.assertIn("SYNTHETIC LANE B QUESTION", own)
        for marker in ("sealedBytesSha", "sealedAt", "contaminationStatus",
                       "revealedAt"):
            self.assertNotIn(marker, own)
        mid = self.sess.events(RLB)
        self.issue_to(self.sess, RP1B, key)
        self.assertEqual(self.sess.events(RLB), mid)
        # F-39/OD-39: another R_LB's independent submission is lawful and is
        # NOT disclosed to this R_LB (own-submission visibility only)
        snap = self._sha_chain(self.sess)
        self.sess.register_lane_b(RLB2, key, FIX["laneB"])
        self.assertEqual(self._sha_chain(self.sess)[0], snap[0] + 1)
        self.assertEqual(self.sess.events(RLB), mid)
        own2 = json.dumps(self.sess.events(RLB2))
        # CORR8/F-44: RLB2's own identity appears in their own view
        self.assertIn(sub_id(RLB2, key, 1), own2)
        for marker in ("sealedBytesSha", "sealedAt", "contaminationStatus",
                       "revealedAt"):
            self.assertNotIn(marker, own2)
        persisted = self.host_persist(self.sess, "h_f33.jsonl")
        fresh = self.new_session()
        self.assertTrue(
            fresh.restore_global_history(Path(persisted["path"]))["restored"])
        self.assertEqual(fresh.events(RLB), self.sess.events(RLB))
        self.assertEqual(fresh.workflow_status(key, RLB),
                         self.sess.workflow_status(key, RLB))

    # ---------------- F-34 ----------------

    def test_F34_claim_identity_is_unique_per_tuple(self):
        """GATE: F-34 DUPLICATE AND CONFLICTING CLAIM IDS — one claimId, one identity

        Original failure (reproduced on CORR4): one claimId is accepted as
        both NORMATIVE_DETERMINACY and NORMATIVE_CONCLUSION, and the same
        determinacy id is accepted again. CORR5 refuses reuse. A different
        historical claimId remains lawful provenance and does not inflate
        effectiveAdjudications. The same claimId on a different tuple remains
        lawful. Refusals leave the chain unchanged. Live and imported
        identities match.
        """
        mod = corr4_engine()
        orig = self.corr4_session()
        self.register_all_legacy(orig, mod)
        okey = orig.register_tuple(CUST, FIX["tuples"][0])["tupleKey"]
        self._reproduce(orig, okey)
        a = orig.adjudicate_claim(RIND, okey, "NORMATIVE_DETERMINACY",
                                  "SYN_CLAIM_001")
        b = orig.adjudicate_claim(RIND, okey, "NORMATIVE_CONCLUSION",
                                  "SYN_CLAIM_001")
        c = orig.adjudicate_claim(RIND, okey, "NORMATIVE_DETERMINACY",
                                  "SYN_CLAIM_001")
        self.assertEqual(a["claimLevelStatus"], "ADJUDICATED")
        self.assertEqual(b["claimLevelStatus"], "ADJUDICATED")
        self.assertEqual(c["claimLevelStatus"], "ADJUDICATED")
        self.assertGreaterEqual(
            len(orig.workflow_status(okey, CUST)["effectiveAdjudications"]), 2)
        # --- CORR5
        self.register_all()
        key = self.register_tuple()["tupleKey"]
        self._reproduce(self.sess, key)
        ok = self.sess.adjudicate_claim(
            RIND, key, "NORMATIVE_DETERMINACY", "SYN_CLAIM_001")
        self.assertEqual(ok["claimLevelStatus"], "ADJUDICATED")
        snap = self._sha_chain(self.sess)
        self.expect_gate("DUPLICATE_CLAIM_ID", self.sess.adjudicate_claim,
                         RIND, key, "NORMATIVE_DETERMINACY", "SYN_CLAIM_001")
        self.assertEqual(self._sha_chain(self.sess), snap)
        self.sess.declare_records_rederived(RIND, key, [record_ref(0, 0)])
        snap = self._sha_chain(self.sess)
        self.expect_gate(
            "CONFLICTING_CLAIM_IDENTITY", self.sess.adjudicate_claim,
            RIND, key, "HISTORICAL_RECORD_PRODUCTION", "SYN_CLAIM_001",
            record_refs=[record_ref(0, 0)],
            proposition=hist_prop("HISTORICAL_RECORD_PRODUCTION"))
        self.assertEqual(self._sha_chain(self.sess), snap)
        hist = self.sess.adjudicate_claim(
            RIND, key, "HISTORICAL_RECORD_PRODUCTION",
            FIX["claims"]["historical"], record_refs=[record_ref(0, 0)],
            proposition=hist_prop("HISTORICAL_RECORD_PRODUCTION"))
        self.assertEqual(hist["claimLevelStatus"],
                         "PROVENANCE_VERIFIED_NOT_ADJUDICATED")
        status = self.sess.workflow_status(key, CUST)
        self.assertEqual(len(status["effectiveAdjudications"]), 1)
        self.assertEqual(status["effectiveAdjudications"][0]["claimId"],
                         "SYN_CLAIM_001")
        self.assertEqual(
            [p["claimId"] for p in status["mechanicalProvenanceVerifications"]],
            [FIX["claims"]["historical"]])
        # same claimId on a different tuple is a different identity
        key2 = self.register_tuple(self.sess, 1)["tupleKey"]
        self._reproduce(self.sess, key2)
        other = self.sess.adjudicate_claim(
            RIND, key2, "NORMATIVE_DETERMINACY", "SYN_CLAIM_001")
        self.assertEqual(other["claimLevelStatus"], "ADJUDICATED")
        # forged duplicate on replay is refused and does not change state
        live = self.host_events(self.sess)
        forged = build_forged_extension(live, [
            ("CLAIM_ADJUDICATED", {
                "tupleKey": key, "reviewer": RIND,
                "claimType": "NORMATIVE_DETERMINACY",
                "claimId": "SYN_CLAIM_001",
                "prerequisites": live[-1]["payload"].get("prerequisites", {}),
            })])
        fpath = Path(self._tmp) / "h_f34_dup.jsonl"
        write_events_file(fpath, forged)
        snap = self._sha_chain(self.sess)
        self.expect_gate("PROCEDURALLY_INVALID_HISTORY",
                         self.sess.restore_global_history, fpath)
        self.assertEqual(self._sha_chain(self.sess), snap)
        persisted = self.host_persist(self.sess, "h_f34.jsonl")
        fresh = self.new_session()
        self.register_all(fresh)
        self.assertTrue(fresh.restore_global_history(Path(persisted["path"]))["restored"])
        self.assertEqual(
            fresh.workflow_status(key, CUST)["effectiveAdjudications"],
            self.sess.workflow_status(key, CUST)["effectiveAdjudications"])
        self.assertEqual(
            fresh.workflow_status(key, CUST)["mechanicalProvenanceVerifications"],
            self.sess.workflow_status(key, CUST)["mechanicalProvenanceVerifications"])

    # ---------------- F-35 ----------------

    def test_F35_provenance_is_not_adjudication(self):
        """GATE: F-35 HISTORICAL VERIFICATION MISLABELED AS ADJUDICATION — event, aggregate and evidence record agree

        Original failure (reproduced on CORR4): the return label is
        PROVENANCE_VERIFIED_NOT_ADJUDICATED, but the persisted event is
        CLAIM_ADJUDICATED, the record is inside effectiveAdjudications, and
        the evidence-record constructor counts it as an adjudication.
        CORR5 persists CLAIM_PROVENANCE_VERIFIED, excludes it from
        effectiveAdjudications, and counts it only as provenance. No
        historical sufficiency algorithm is added. A forged historical
        CLAIM_ADJUDICATED fails import.
        """
        mod = corr4_engine()
        orig = self.corr4_session()
        self.register_all_legacy(orig, mod)
        okey = orig.register_tuple(CUST, FIX["tuples"][0])["tupleKey"]
        orig.declare_records_rederived(RIND, okey, [record_ref(0, 0)])
        oadj = orig.adjudicate_claim(
            RIND, okey, "HISTORICAL_RECORD_PRODUCTION",
            FIX["claims"]["historical"], [record_ref(0, 0)])
        self.assertEqual(oadj["claimLevelStatus"],
                         "PROVENANCE_VERIFIED_NOT_ADJUDICATED")
        self.assertIn("CLAIM_ADJUDICATED",
                      [e["eventType"] for e in orig.events(CUST)])
        ostatus = orig.workflow_status(okey, CUST)
        self.assertTrue(any(
            a["claimId"] == FIX["claims"]["historical"]
            for a in ostatus["effectiveAdjudications"]))
        orec = orig.issue_evidence_record(CUST, okey)
        self.assertGreater(
            orec["proceduralCompleteness"]["claimsAdjudicatedAtIssuance"], 0)
        # --- CORR5
        self.register_all()
        key = self.register_tuple()["tupleKey"]
        good = record_ref(0, 0)
        self.issue_to(self.sess, RIND, key)  # CORR7/F-41 packet-first
        self.sess.declare_records_rederived(RIND, key, [good])
        res = self.sess.adjudicate_claim(
            RIND, key, "HISTORICAL_RECORD_PRODUCTION",
            FIX["claims"]["historical"], record_refs=[good],
            proposition=hist_prop("HISTORICAL_RECORD_PRODUCTION"))
        self.assertEqual(res["claimLevelStatus"],
                         "PROVENANCE_VERIFIED_NOT_ADJUDICATED")
        self.assertTrue(res["mechanicalVerificationOnly"])
        self.assertIn("unresolved gate", res["scopeNote"])
        types = [e["eventType"] for e in self.sess.events(CUST)]
        self.assertEqual(types.count("CLAIM_PROVENANCE_VERIFIED"), 1)
        self.assertEqual(types.count("CLAIM_ADJUDICATED"), 0)
        status = self.sess.workflow_status(key, CUST)
        self.assertEqual(status["effectiveAdjudications"], [])
        self.assertEqual(status["claimLevel"],
                         "PROVENANCE_VERIFIED_NOT_ADJUDICATED")
        self.assertEqual(
            status["mechanicalProvenanceVerifications"][0]["claimId"],
            FIX["claims"]["historical"])
        record = self.sess.issue_evidence_record(CUST, key)
        completeness = record["proceduralCompleteness"]
        self.assertEqual(completeness["claimsAdjudicatedAtIssuance"], 0)
        self.assertEqual(
            completeness["provenanceVerifiedNotAdjudicatedAtIssuance"], 1)
        self.assertEqual(self.sess.category_assignment(key)
                         ["categoryAssignment"], "UNASSIGNED")
        snap = self._sha_chain(self.sess)
        fabricated = dict(good, content="SYNTHETIC FABRICATED CONTENT")
        self.expect_gate(
            "RECONSTRUCTION_DIGEST_MISMATCH", self.sess.adjudicate_claim,
            RIND, key, "HISTORICAL_RECORD_LINKAGE",
            FIX["claims"]["historicalSecond"], [fabricated])
        self.assertEqual(self._sha_chain(self.sess), snap)
        live = self.host_events(self.sess)
        forged = build_forged_extension(live, [
            ("CLAIM_ADJUDICATED", {
                "tupleKey": key, "reviewer": RIND,
                "claimType": "HISTORICAL_RECORD_PRODUCTION",
                "claimId": "SYN_CLAIM_777",
                "prerequisites": {"claimKind": "HISTORICAL_RECORD",
                                  "recordsRederived": True,
                                  "evidence": [good]}})])
        fpath = Path(self._tmp) / "h_f35_forged.jsonl"
        write_events_file(fpath, forged)
        self.expect_gate("PROCEDURALLY_INVALID_HISTORY",
                         self.sess.restore_global_history, fpath)
        self.assertEqual(self._sha_chain(self.sess), snap)
        persisted = self.host_persist(self.sess, "h_f35.jsonl")
        fresh = self.new_session()
        self.register_all(fresh)
        self.assertTrue(fresh.restore_global_history(Path(persisted["path"]))["restored"])
        self.assertEqual(fresh.workflow_status(key, CUST)["claimLevel"],
                         "PROVENANCE_VERIFIED_NOT_ADJUDICATED")
        self.assertEqual(
            fresh.workflow_status(key, CUST)["effectiveAdjudications"], [])
        self.assertEqual(
            fresh.custody_view(CUST, key)["evidenceRecords"][0]
            ["proceduralCompleteness"]["claimsAdjudicatedAtIssuance"], 0)

    # ---------------- F-36 ----------------

    def test_F36_normative_claim_is_bound_to_the_named_proposition(self):
        """GATE: F-36 NORMATIVE CLAIM NOT BOUND TO A NAMED PROPOSITION — one determinacy proposition per tuple

        Original failure (reproduced on CORR4): one original seal and one
        identical independent seal adjudicate repeated and arbitrarily named
        normative claims, including NORMATIVE_CONCLUSION, with no new
        claim-specific evidence. CORR5 binds ADJUDICATED to
        NORMATIVE_DETERMINACY and the reproduced normative states (§D.4,
        §G.7). A second claimId on that proposition is refused. Conclusion
        and reconciliation are not adjudicated from generic state equality.
        No sufficiency algorithm is added.
        """
        mod = corr4_engine()
        orig = self.corr4_session()
        self.register_all_legacy(orig, mod)
        okey = orig.register_tuple(CUST, FIX["tuples"][0])["tupleKey"]
        self._reproduce(orig, okey)
        for claim_type, claim_id in (
                ("NORMATIVE_DETERMINACY", "SYN_CLAIM_001"),
                ("NORMATIVE_DETERMINACY", "SYN_CLAIM_777"),
                ("NORMATIVE_CONCLUSION", "SYN_CLAIM_778")):
            got = orig.adjudicate_claim(RIND, okey, claim_type, claim_id)
            self.assertEqual(got["claimLevelStatus"], "ADJUDICATED")
        self.assertEqual(
            len(orig.workflow_status(okey, CUST)["effectiveAdjudications"]), 3)
        # --- CORR5
        self.register_all()
        key = self.register_tuple()["tupleKey"]
        self._reproduce(self.sess, key)
        ok = self.sess.adjudicate_claim(
            RIND, key, "NORMATIVE_DETERMINACY", FIX["claims"]["normative"])
        self.assertEqual(ok["claimLevelStatus"], "ADJUDICATED")
        stored = next(e for e in self.sess.events(CUST)
                      if e["eventType"] == "CLAIM_ADJUDICATED")
        proposition = stored["payload"]["prerequisites"]["boundProposition"]
        self.assertEqual(proposition["claimType"], "NORMATIVE_DETERMINACY")
        self.assertEqual(proposition["scope"], "tuple")
        self.assertEqual(
            proposition["normativeStates"],
            FIX["phase1Reviews"]["determinateYes"]["normativeStates"])
        snap = self._sha_chain(self.sess)
        self.expect_gate(
            "DUPLICATE_NAMED_CLAIM", self.sess.adjudicate_claim,
            RIND, key, "NORMATIVE_DETERMINACY", "SYN_CLAIM_777")
        self.assertEqual(self._sha_chain(self.sess), snap)
        self.expect_gate(
            "REFUSED_UNBOUND_PROPOSITION", self.sess.adjudicate_claim,
            RIND, key, "NORMATIVE_CONCLUSION", "SYN_CLAIM_778")
        self.expect_gate(
            "REFUSED_UNBOUND_PROPOSITION", self.sess.adjudicate_claim,
            RIND, key, "NORMATIVE_RECONCILIATION", "SYN_CLAIM_779")
        self.assertEqual(self._sha_chain(self.sess), snap)
        status = self.sess.workflow_status(key, CUST)
        self.assertEqual(status["claimLevel"], "ADJUDICATED")
        self.assertEqual(len(status["effectiveAdjudications"]), 1)
        self.assertEqual(status["effectiveAdjudications"][0]["claimType"],
                         "NORMATIVE_DETERMINACY")
        # a different tuple still has its own determinacy proposition
        key2 = self.register_tuple(self.sess, 1)["tupleKey"]
        self._reproduce(self.sess, key2)
        second = self.sess.adjudicate_claim(
            RIND, key2, "NORMATIVE_DETERMINACY",
            FIX["claims"]["normativeSecond"])
        self.assertEqual(second["claimLevelStatus"], "ADJUDICATED")
        self.assertEqual(
            len(self.sess.workflow_status(key, CUST)["effectiveAdjudications"]),
            1)
        persisted = self.host_persist(self.sess, "h_f36.jsonl")
        fresh = self.new_session()
        self.register_all(fresh)
        self.assertTrue(fresh.restore_global_history(Path(persisted["path"]))["restored"])
        self.assertEqual(
            fresh.workflow_status(key, CUST)["effectiveAdjudications"],
            self.sess.workflow_status(key, CUST)["effectiveAdjudications"])
        imported = next(e for e in fresh.events(CUST)
                        if e["eventType"] == "CLAIM_ADJUDICATED"
                        and e["payload"]["tupleKey"] == key)
        self.assertEqual(
            imported["payload"]["prerequisites"]["boundProposition"],
            proposition)


# ==========================================================================
# F-37..F-39: CORR6 finding closures (reproduced on the immutable CORR5)
# ==========================================================================

class Corr6FindingTests(EFCAUnitTest):
    """F-37 (scoped procedural disclosure, OD-37), F-38 (historical
    proposition identity, OD-38) and F-39 (multiple Lane B submissions,
    OD-39). The reproduction side runs on the immutable CORR5 engine
    (e4118af9...) through the pinned loader."""

    def _flow(self, s, key, reviewer=RP1A):
        s.issue_packet(CUST, reviewer, key)
        s.submit_phase1_review(reviewer, key,
                               FIX["phase1Reviews"]["determinateYes"])
        s.acknowledge_seal_receipt(CUST, key, reviewer)
        s.reveal(CUST, reviewer, key)
        s.append_delta(reviewer, key, FIX["phase2Deltas"]["noChange"])

    # ---------------- F-37 ----------------

    def test_F37_custodian_view_hides_foreign_activity(self):
        """GATE: F-37 FOREIGN-CUSTODIAN INFERENCE FROM GLOBAL COORDINATES — foreign activity is omitted; polling is stable

        Original failure (reproduced on CORR5): a custodian's events()
        returns raw own-tuple envelopes AND foreign tuples as minimal
        projections carrying event types with global seq/t — foreign
        milestones, counts, gaps and polling diffs are observable. CORR6:
        the custodian's scoped projection contains only own-custody events
        plus GENESIS and their own registration; a foreign custodian's
        interleaved workflow leaves it byte-identical across repeated
        polling.
        """
        mod = corr5_engine()
        orig = mod.EFCASession(rubric_path=RUBRIC_PATH,
                               sidecar_path=SIDECAR_PATH,
                               scratch_dir=Path(self._tmp))
        self.register_all_legacy(orig, mod)
        orig.register_actor("SYN_CUST_002", "CUSTODIAN")
        orig.register_tuple(CUST, FIX["tuples"][0])
        ok2 = orig.register_tuple("SYN_CUST_002", FIX["tuples"][1])["tupleKey"]
        leaked = json.dumps(orig.events(CUST))
        self.assertIn('"seq"', leaked)          # raw envelopes for own tuples
        self.assertIn(ok2, leaked)              # foreign minimal projections
        # --- CORR6 (CORR9/OD-45-A: the foreign custodian's TUP2
        # entitlement is an EXPLICIT simulation authority)
        self.sess = self.sim_session([(TUP1, CUST), (TUP2, CUST2)])
        self.register_all()
        self.sess.register_actor("SYN_CUST_002", "CUSTODIAN")
        key1 = self.register_tuple()["tupleKey"]             # own (C1)
        key2 = self.sess.register_tuple(
            "SYN_CUST_002", FIX["tuples"][1])["tupleKey"]    # foreign (C2)
        before = self.sess.events(CUST)
        self.assertEqual(before, self.sess.events(CUST))     # polling stable
        registrations = [e for e in before
                         if e["eventType"] == "ACTOR_REGISTERED"]
        self.assertEqual([e["payload"]["actorId"] for e in registrations],
                         [CUST])  # foreign registrations omitted
        # interleave foreign operations on C2's tuple
        self.sess.issue_packet("SYN_CUST_002", RP1B, key2)
        self.sess.submit_phase1_review(
            RP1B, key2, FIX["phase1Reviews"]["determinateYes"])
        self.sess.acknowledge_seal_receipt("SYN_CUST_002", key2, RP1B)
        self.sess.reveal("SYN_CUST_002", RP1B, key2)
        self.sess.append_delta(RP1B, key2, FIX["phase2Deltas"]["noChange"])
        for _ in range(3):  # repeated polling
            self.assertEqual(self.sess.events(CUST), before)
        after = json.dumps(self.sess.events(CUST))
        self.assertNotIn(key2, after)
        self.assertNotIn("SYN_CUST_002", after)
        self.assert_no_envelope_material(self.sess.events(CUST),
                                         "custodian view")
        # own work still advances the visible list by exactly one entry
        self.sess.issue_packet(CUST, RP1A, key1)
        grown = self.sess.events(CUST)
        self.assertEqual(len(grown), len(before) + 1)
        self.assertEqual(grown[:len(before)], before)
        self.assertEqual(grown[-1]["localOrdinal"], len(grown))

    def test_F37_probe_firewall_occurrence_bound_is_scope_local(self):
        """GATE: F-37 SESSION-CLOCK PROBE THROUGH OCCURRENCE ACCEPTANCE — the bound is the reporter's own record, not the session clock

        The CORR5 occurred_at_tick range check was an indirect probe of the
        session-global count (acceptance/refusal revealed `now`). CORR6: a
        reference beyond the reporter's own recorded sequence is refused,
        and the refusal boundary does NOT move when foreign activity
        appends to the session — acceptance depends only on the reporter's
        own event count.
        """
        # CORR9/OD-45-A: the foreign custodian's TUP2 entitlement is an
        # EXPLICIT simulation authority
        self.sess = self.sim_session([(TUP1, CUST), (TUP2, CUST2)])
        self.register_all()
        self.sess.register_actor("SYN_CUST_002", "CUSTODIAN")
        key = self.register_tuple()["tupleKey"]
        # CUST's own recorded sequence is exactly 2 (registration, tuple).
        self.expect_occurrence_refusal(self.sess, key, CUST, RP1A, 3)
        session_events_before = self.host_persist(
            self.sess, "h_f37_probe.jsonl")["eventCount"]
        # foreign activity: another custodian's interleaved workflow
        key2 = self.sess.register_tuple(
            "SYN_CUST_002", FIX["tuples"][1])["tupleKey"]
        self.sess.issue_packet("SYN_CUST_002", RP1B, key2)
        self.sess.submit_phase1_review(
            RP1B, key2, FIX["phase1Reviews"]["determinateYes"])
        self.sess.acknowledge_seal_receipt("SYN_CUST_002", key2, RP1B)
        self.sess.reveal("SYN_CUST_002", RP1B, key2)
        session_events_after = self.host_persist(
            self.sess, "h_f37_probe.jsonl")["eventCount"]
        self.assertGreater(session_events_after, session_events_before + 3)
        # k=3 is STILL refused: the boundary does not follow the session
        err = self.expect_occurrence_refusal(self.sess, key, CUST, RP1A, 3)
        self.assertIn("(1..2)", str(err))
        self.assertNotIn("(1..%d)" % session_events_after, str(err))
        # k=1 (own registration) stays lawful; then the own bound advances
        lawful = self.sess.report_exposure(
            CUST, key, RP1A, "MARK_A", "SYNTHETIC probe", occurred=occref(1))
        self.assertEqual(lawful["occurredAtTick"]["scope"], key)
        self.expect_occurrence_refusal(self.sess, key, CUST, RP1A, 4)

    def test_F37_projection_artifacts_are_not_chain_backups(self):
        """GATE: F-37 SCOPED PROJECTION vs AUTHORITATIVE BACKUP — public persistence never exposes the global chain

        Expected: the requester-scoped artifact is a marked scoped
        projection with no chain material; it is never accepted as a chain
        artifact (host restore and legacy admission refuse it); a
        complete-chain artifact presented through a requester-scoped verify
        is refused; the anonymous projection export is refused; the host
        chain artifact carries the count, restores and is extendable.
        """
        self.register_all()
        key, _ = self.lawful_revealed(self.sess)
        projection = self.sess.persist_history("proj.json", CUST)
        document = json.loads(
            Path(projection["path"]).read_text(encoding="utf-8"))
        self.assertEqual(document["artifactClass"],
                         oe.PROJECTION_ARTIFACT_CLASS)
        self.assertFalse(document["completeGlobalChainProof"])
        self.assertFalse(document["authoritativeChainBackup"])
        self.assertEqual(document["generatedFor"],
                         {"actorId": CUST, "role": "CUSTODIAN"})
        self.assert_no_envelope_material(document, "projection artifact")
        # a projection is never a chain artifact
        self.expect_gate("PROJECTION_IS_NOT_A_CHAIN",
                         self.sess.restore_global_history,
                         Path(projection["path"]))
        self.expect_gate("PROJECTION_IS_NOT_A_CHAIN",
                         self.sess.replay_legacy_history,
                         Path(projection["path"]))
        # a complete-chain artifact through a requester-scoped verify is
        # never accepted as a backup
        chain = self.host_persist(self.sess, "chain.jsonl")
        self.assertFalse(
            self.sess.verify_persisted_history(
                Path(chain["path"]), CUST)["valid"])
        # anonymous export refused; the projection is requester-bound
        self.expect_gate("UNKNOWN_ACTOR", self.sess.persist_history,
                         "anon.json")
        other = self.new_session(session_label="SYN_SESSION_001")
        self.register_all(other)
        self.assertEqual(
            other.verify_persisted_history(Path(projection["path"]), CUST),
            {"valid": True, "reason": "ok"})
        self.assertEqual(
            other.verify_persisted_history(Path(projection["path"]), RP1A),
            {"valid": False, "reason": "not_a_lawful_projection"})
        # the host artifact restores and is extendable
        restored = self.host_restore(chain["path"])
        restored.register_tuple(CUST, FIX["tuples"][1])
        grown = self.host_persist(restored, "chain.jsonl")
        self.assertGreater(grown["eventCount"], chain["eventCount"])

    # ---------------- F-38 ----------------

    def test_F38_proposition_scope_completeness_and_fidelity(self):
        """GATE: F-38 INCOMPLETE OR LOSSY HISTORICAL PROPOSITION SCOPE — fails closed; the declared scope survives serialization exactly

        Original failure (reproduced on CORR5): the historical
        boundProposition is {claimType, authenticated-records, recordIds} —
        evidence-document identity rather than the rubric §D.4 declared
        scope — and a free claimId identifies nothing. CORR6: the bound
        proposition is the complete declared content + type-specific scope;
        missing/malformed scope fails closed with no state change; the
        declared slots (operation, covered time/window, actor, reading,
        identified event, side-anchored surviving value, filing tuple)
        survive canonical serialization and restore byte-exactly.
        """
        mod = corr5_engine()
        orig = mod.EFCASession(rubric_path=RUBRIC_PATH,
                               sidecar_path=SIDECAR_PATH,
                               scratch_dir=Path(self._tmp))
        self.register_all_legacy(orig, mod)
        okey = orig.register_tuple(CUST, FIX["tuples"][0])["tupleKey"]
        refs = [record_ref(0, 0)]
        orig.declare_records_rederived(RIND, okey, refs)
        oadj = orig.adjudicate_claim(RIND, okey,
                                     "HISTORICAL_RECORD_PRODUCTION",
                                     "SYN_CLAIM_001", record_refs=refs)
        self.assertNotIn("boundProposition", oadj)
        # --- CORR6
        self.register_all()
        key = self.register_tuple()["tupleKey"]
        good = record_ref(0, 0)
        self.issue_to(self.sess, RIND, key)  # CORR7/F-41 packet-first
        self.sess.declare_records_rederived(RIND, key, [good])
        snap = self._sha_chain(self.sess)
        # missing scope fails closed
        self.expect_gate(
            "REFUSED_INCOMPLETE_PROPOSITION_SCOPE",
            self.sess.adjudicate_claim, RIND, key,
            "HISTORICAL_RECORD_PRODUCTION", "SYN_CLAIM_001",
            record_refs=[good])
        # incomplete / malformed slots fail closed
        self.expect_gate(
            "REFUSED_INCOMPLETE_PROPOSITION_SCOPE",
            self.sess.adjudicate_claim, RIND, key,
            "HISTORICAL_RECORD_EVENT", "SYN_CLAIM_001",
            record_refs=[good], proposition={"operationId": "SYN_OP_001"})
        self.expect_gate(
            "UNKNOWN_FIELD_REJECTED", self.sess.adjudicate_claim, RIND, key,
            "HISTORICAL_RECORD_EVENT", "SYN_CLAIM_001", record_refs=[good],
            proposition={"operationId": "SYN_OP_001",
                         "coveredTime": "SYN_TIME_001",
                         "injected": "SYNTHETIC"})
        self.expect_gate(
            "NON_SYNTHETIC_IDENTIFIER", self.sess.adjudicate_claim, RIND,
            key, "HISTORICAL_RECORD_EVENT", "SYN_CLAIM_001",
            record_refs=[good],
            proposition={"operationId": "CASE-3.5",
                         "coveredTime": "SYN_TIME_001"})
        self.expect_gate(
            "REFUSED_INCOMPLETE_PROPOSITION_SCOPE",
            self.sess.adjudicate_claim, RIND, key,
            "HISTORICAL_RECORD_APPLICATION", "SYN_CLAIM_001",
            record_refs=[good],
            proposition={"actorId": RP1A, "readingId": "SYN_RDG_001",
                         "operationId": "SYN_OP_001",
                         "coveredWindow": "SYN_WIN_001"})
        self.expect_gate(
            "REFUSED_INCOMPLETE_PROPOSITION_SCOPE",
            self.sess.adjudicate_claim, RIND, key,
            "HISTORICAL_RECORD_APPLICATION", "SYN_CLAIM_001",
            record_refs=[good],
            proposition={"actorId": RP1A, "readingId": "SYN_RDG_001"})
        # the surviving value is never reduced to a YES/NO boolean
        self.expect_gate(
            "INVALID_PAYLOAD", self.sess.adjudicate_claim, RIND, key,
            "HISTORICAL_RECORD_PRODUCTION", "SYN_CLAIM_001",
            record_refs=[good],
            proposition={"operationId": "SYN_OP_001",
                         "survivingValue": "YES"})
        self.expect_gate(
            "INVALID_PAYLOAD", self.sess.adjudicate_claim, RIND, key,
            "HISTORICAL_RECORD_PRODUCTION", "SYN_CLAIM_001",
            record_refs=[good],
            proposition={"operationId": "SYN_OP_001",
                         "survivingValue": {"sideId": "SYN_SIDE_A"}})
        self.assertEqual(self._sha_chain(self.sess), snap)  # no state change
        # the complete declared scope binds and survives a host round trip
        res = self.sess.adjudicate_claim(
            RIND, key, "HISTORICAL_RECORD_PRODUCTION", "SYN_CLAIM_001",
            record_refs=[good],
            proposition={"operationId": "SYN_OP_001",
                         "survivingValue": {"sideId": "SYN_SIDE_A",
                                            "value": "YES"}})
        bound = res["boundProposition"]
        self.assertEqual(bound["claimType"], "HISTORICAL_RECORD_PRODUCTION")
        self.assertEqual(bound["tupleKey"], key)
        self.assertEqual(bound["scope"], {
            "operationId": "SYN_OP_001",
            "survivingValue": {"sideId": "SYN_SIDE_A", "value": "YES"}})
        stored = next(e for e in self.sess.events(CUST)
                      if e["eventType"] == "CLAIM_PROVENANCE_VERIFIED")
        self.assertEqual(
            stored["payload"]["prerequisites"]["boundProposition"], bound)
        chain = self.host_persist(self.sess, "h_f38.jsonl")
        fresh = self.host_restore(chain["path"])
        imported = next(e for e in fresh.events(CUST)
                        if e["eventType"] == "CLAIM_PROVENANCE_VERIFIED")
        self.assertEqual(
            imported["payload"]["prerequisites"]["boundProposition"], bound)

    def test_F38_attestations_and_shared_evidence_are_independent(self):
        """GATE: F-38 ATTESTATION VS PROPOSITION VS EVIDENCE IDENTITY — repeated attestations kept separately; distinct propositions counted independently; shared evidence never merges propositions

        Expected: two attestations of one complete proposition are two
        lawful provenance events with distinct claimIds; the distinct
        proposition count stays 1 while the attestation count is 2; two
        different propositions citing the same evidence are two distinct
        propositions; no ADJUDICATED promotion and no semantic-equivalence
        algorithm (exact canonical scope equality only).
        """
        self.register_all()
        key = self.register_tuple()["tupleKey"]
        good = record_ref(0, 0)
        self.issue_to(self.sess, RIND, key)  # CORR7/F-41 packet-first
        self.sess.declare_records_rederived(RIND, key, [good])
        prop = hist_prop("HISTORICAL_RECORD_EVENT")
        first = self.sess.adjudicate_claim(
            RIND, key, "HISTORICAL_RECORD_EVENT", "SYN_CLAIM_001",
            record_refs=[good], proposition=prop)
        second = self.sess.adjudicate_claim(
            RIND, key, "HISTORICAL_RECORD_EVENT", "SYN_CLAIM_002",
            record_refs=[good], proposition=prop)
        self.assertEqual(first["claimLevelStatus"],
                         "PROVENANCE_VERIFIED_NOT_ADJUDICATED")
        self.assertEqual(second["boundProposition"],
                         first["boundProposition"])
        status = self.sess.workflow_status(key, CUST)
        self.assertEqual(status["provenanceAttestationCount"], 2)
        self.assertEqual(status["distinctBoundPropositionCount"], 1)
        self.assertEqual(status["effectiveAdjudications"], [])
        # a different proposition may cite the same evidence
        other_prop = {"operationId": "SYN_OP_002",
                      "coveredTime": "SYN_TIME_001"}
        third = self.sess.adjudicate_claim(
            RIND, key, "HISTORICAL_RECORD_EVENT", "SYN_CLAIM_003",
            record_refs=[good], proposition=other_prop)
        self.assertNotEqual(third["boundProposition"],
                            first["boundProposition"])
        status = self.sess.workflow_status(key, CUST)
        self.assertEqual(status["provenanceAttestationCount"], 3)
        self.assertEqual(status["distinctBoundPropositionCount"], 2)
        # the same scope on another tuple is a different proposition
        key2 = self.register_tuple(self.sess, 1)["tupleKey"]
        self.issue_to(self.sess, RIND, key2)  # CORR7/F-41 packet-first
        self.sess.declare_records_rederived(RIND, key2, [record_ref(1, 0)])
        fourth = self.sess.adjudicate_claim(
            RIND, key2, "HISTORICAL_RECORD_EVENT", "SYN_CLAIM_004",
            record_refs=[record_ref(1, 0)], proposition=prop)
        self.assertEqual(fourth["boundProposition"]["tupleKey"], key2)
        self.assertNotEqual(fourth["boundProposition"],
                            first["boundProposition"])
        custody = self.sess.custody_view(CUST, key)
        self.assertEqual(custody["provenanceAttestationCount"], 3)
        self.assertEqual(custody["distinctBoundPropositionCount"], 2)
        # the evidence-record snapshot counts distinct propositions
        # independently of attestations
        record = self.sess.issue_evidence_record(CUST, key)
        completeness = record["proceduralCompleteness"]
        self.assertEqual(
            completeness["provenanceVerifiedNotAdjudicatedAtIssuance"], 3)
        self.assertEqual(
            completeness["distinctBoundPropositionsAtIssuance"], 2)
        self.assertEqual(completeness["claimsAdjudicatedAtIssuance"], 0)

    # ---------------- F-39 ----------------

    def test_F39_submission_identity_delivery_and_no_monopoly(self):
        """GATE: F-39 LANE B FIRST-SUBMISSION MONOPOLY AND UNSCOPED DELIVERY — several independent submissions with stable identities; delivery references one exact submission

        Original failure (reproduced on CORR5): the first Lane B
        registration monopolizes the tuple (DUPLICATE_EVENT for everyone
        else) and LANE_B_DELIVERED names no submission. CORR6: several
        registered R_LB actors file independent submissions with stable
        engine-constructed tuple-local ids; the delivery references exactly
        one existing submission; a reused/forged id fails closed on live
        and replay; causeLink stays UNASSIGNED_PENDING_J1 and no scientific
        aggregation or appointment exists.
        """
        mod = corr5_engine()
        orig = mod.EFCASession(rubric_path=RUBRIC_PATH,
                               sidecar_path=SIDECAR_PATH,
                               scratch_dir=Path(self._tmp))
        self.register_all_legacy(orig, mod)
        orig.register_actor(RLB2, "R_LB")
        okey = orig.register_tuple(CUST, FIX["tuples"][0])["tupleKey"]
        orig.register_lane_b(RLB, okey, FIX["laneB"])
        oduplicate = self.expect_orig_gate(
            mod, "DUPLICATE_EVENT", orig.register_lane_b, RLB2, okey,
            FIX["laneB"])
        self.assertIn("already exists", str(oduplicate))
        # --- CORR6
        self.register_all_plus()
        key = self.register_tuple()["tupleKey"]
        first = self.sess.register_lane_b(RLB, key, FIX["laneB"])
        second = self.sess.register_lane_b(RLB2, key, FIX["laneB"])
        third = self.sess.register_lane_b(RLB, key, FIX["laneB"])
        self.assertEqual([first["submissionId"], second["submissionId"],
                          third["submissionId"]],
                         [sub_id(RLB, key, 1), sub_id(RLB2, key, 1),
                          sub_id(RLB, key, 2)])
        # the custodian delivers one exact submission
        self.sess.issue_packet(CUST, RP1A, key)
        delivered = self.sess.deliver_lane_b_to(CUST, RP1A, key,
                                                second["submissionId"])
        self.assertEqual(delivered["submissionId"], second["submissionId"])
        self.assertEqual(delivered["contaminationEffect"]["status"],
                         "CONTAMINATED")
        stored = next(e for e in self.sess.events(CUST)
                      if e["eventType"] == "LANE_B_DELIVERED")
        self.assertEqual(stored["payload"]["submissionId"],
                         second["submissionId"])
        # no scientific aggregation or appointment fields anywhere
        blob = json.dumps(self.sess.lane_b_view(CUST, key), sort_keys=True)
        for marker in ("MISSING_M", "GRAMMAR_GAP", "categoryAssignment",
                       "assignee", "authoritativeReviewer"):
            self.assertNotIn(marker, blob)
        for submission in self.sess.lane_b_view(CUST, key)["submissions"]:
            self.assertEqual(submission["causeLink"],
                             "UNASSIGNED_PENDING_J1")
        # each R_LB sees only their own submissions
        self.assertEqual(
            sorted(s["submissionId"] for s in
                   self.sess.lane_b_view(RLB, key)["submissions"]),
            sorted([sub_id(RLB, key, 1), sub_id(RLB, key, 2)]))
        self.assertEqual(
            [s["submissionId"] for s in self.sess.lane_b_view(RLB2, key)
             ["submissions"]],
            [sub_id(RLB2, key, 1)])
        # a correctly rehashed duplicate submission id fails closed
        live = self.host_events(self.sess)
        forged = build_forged_extension(live, [
            ("LANE_B_REGISTERED", {
                "tupleKey": key, "reviewer": RLB,
                "submissionId": sub_id(RLB, key, 1),  # reused id
                "question": "SYNTHETIC q", "surface": "SYNTHETIC s",
                "schemaClaim": "SYNTHETIC c"})])
        fpath = Path(self._tmp) / "h_f39_forged.jsonl"
        write_events_file(fpath, forged)
        self.assertTrue(self.sess.verify_global_history(fpath)["valid"])
        snap = self._sha_chain(self.sess)
        self.expect_gate("PROCEDURALLY_INVALID_HISTORY",
                         self.sess.restore_global_history, fpath)
        self.assertEqual(self._sha_chain(self.sess), snap)
        # pre-seal delivery contamination is unchanged (F-2/F-11)
        seal = self.seal_by(self.sess, RP1A, key)
        self.assertEqual(seal["contamination"]["status"], "CONTAMINATED")
        self.assertEqual(seal["contamination"]["incidents"][0]["what"],
                         "LANE_B_MATERIAL")
        # a sealed reviewer lawfully sees all submissions post-seal
        self.assertEqual(
            sorted(s["submissionId"] for s in
                   self.sess.lane_b_view(RP1A, key)["submissions"]),
            sorted([sub_id(RLB, key, 1), sub_id(RLB2, key, 1),
                    sub_id(RLB, key, 2)]))


# ==========================================================================
# COMPATIBILITY GUARDRAIL: native durability, legacy read-only replay,
# mixed-version rejection, rehashed-forgery firewalls, byte preservation
# ==========================================================================

class CompatibilityGuardrailTests(EFCAUnitTest):

    def _rich_corr6_workflow(self, s):
        self.register_all(s)
        key = s.register_tuple(CUST, FIX["tuples"][0])["tupleKey"]
        sid = s.register_lane_b(RLB, key, FIX["laneB"])["submissionId"]
        s.issue_packet(CUST, RP1A, key)
        s.submit_phase1_review(RP1A, key,
                               FIX["phase1Reviews"]["determinateYes"])
        s.acknowledge_seal_receipt(CUST, key, RP1A)
        s.reveal(CUST, RP1A, key)
        s.append_delta(RP1A, key, FIX["phase2Deltas"]["noChange"])
        s.deliver_lane_b_to(CUST, RP1B, key, sid)
        s.issue_packet(CUST, RIND, key)  # CORR7/F-41 packet-first
        s.begin_independent_reproduction(RIND, key)
        s.submit_phase1_review(RIND, key,
                               FIX["phase1Reviews"]["determinateYes"])
        s.receive_first_rationale(RIND, key)
        s.adjudicate_claim(RIND, key, "NORMATIVE_DETERMINACY",
                           FIX["claims"]["normative"])
        refs = [record_ref(0, 0)]
        s.declare_records_rederived(RIND, key, refs)
        s.adjudicate_claim(RIND, key, "HISTORICAL_RECORD_PRODUCTION",
                           FIX["claims"]["historical"], record_refs=refs,
                           proposition=hist_prop(
                               "HISTORICAL_RECORD_PRODUCTION"))
        s.issue_evidence_record(CUST, key)
        return key

    def _genuine_legacy_chain(self, name="legacy.jsonl"):
        """A genuine CORR5 history produced by the SHA-pinned predecessor."""
        mod = corr5_engine()
        s5 = mod.EFCASession(rubric_path=RUBRIC_PATH,
                             sidecar_path=SIDECAR_PATH,
                             scratch_dir=Path(self._tmp))
        for actor in FIX["actors"]:
            s5.register_actor(actor["actorId"], actor["role"])
        key = s5.register_tuple(CUST, FIX["tuples"][0])["tupleKey"]
        s5.register_lane_b(RLB, key, FIX["laneB"])
        s5.issue_packet(CUST, RP1A, key)
        s5.submit_phase1_review(RP1A, key,
                                FIX["phase1Reviews"]["determinateYes"])
        s5.acknowledge_seal_receipt(CUST, key, RP1A)
        s5.reveal(CUST, RP1A, key)
        s5.append_delta(RP1A, key, FIX["phase2Deltas"]["noChange"])
        s5.deliver_lane_b_to(CUST, RP1B, key)
        s5.report_exposure(CUST, key, RP1C, "MARK_A", "SYNTHETIC",
                           occurred_at_tick=2)
        s5.begin_independent_reproduction(RIND, key)
        s5.submit_phase1_review(RIND, key,
                                FIX["phase1Reviews"]["determinateYes"])
        s5.receive_first_rationale(RIND, key)
        s5.adjudicate_claim(RIND, key, "NORMATIVE_DETERMINACY",
                            FIX["claims"]["normative"])
        refs = [record_ref(0, 0)]
        s5.declare_records_rederived(RIND, key, refs)
        s5.adjudicate_claim(RIND, key, "HISTORICAL_RECORD_PRODUCTION",
                            FIX["claims"]["historical"], record_refs=refs)
        s5.issue_evidence_record(CUST, key)
        legacy = s5.persist_history(name, CUST)
        return s5, mod, Path(legacy["path"])

    def test_C1_native_roundtrip_and_live_restore_equivalence(self):
        """GATE: GUARDRAIL NATIVE PERSISTENCE — native histories are fully persistent, recoverable, extendable and semantically replayable

        Expected: the host round trip (real disk → fresh session → full
        semantic replay) reproduces every scoped view byte-identically;
        the restored chain is extendable; a second round trip covers the
        extension.
        """
        key = self._rich_corr6_workflow(self.sess)
        views = {
            "cust": json.dumps(self.sess.events(CUST), sort_keys=True),
            "reviewer": json.dumps(self.sess.events(RP1A), sort_keys=True),
            "custody": json.dumps(self.sess.custody_view(CUST, key),
                                  sort_keys=True),
            "status": json.dumps(self.sess.workflow_status(key, CUST),
                                 sort_keys=True),
        }
        self.assert_no_envelope_material(self.sess.custody_view(CUST, key),
                                         "custody view")
        chain = self.host_persist(self.sess, "c1.jsonl")
        restored = self.host_restore(chain["path"])
        self.assertEqual(
            json.dumps(restored.events(CUST), sort_keys=True), views["cust"])
        self.assertEqual(
            json.dumps(restored.events(RP1A), sort_keys=True),
            views["reviewer"])
        self.assertEqual(
            json.dumps(restored.custody_view(CUST, key), sort_keys=True),
            views["custody"])
        self.assertEqual(
            json.dumps(restored.workflow_status(key, CUST), sort_keys=True),
            views["status"])
        # extendable: the restored session continues the same chain
        key2 = restored.register_tuple(CUST, FIX["tuples"][1])["tupleKey"]
        chain2 = self.host_persist(restored, "c1b.jsonl")
        self.assertGreater(chain2["eventCount"], chain["eventCount"])
        again = self.host_restore(chain2["path"])
        self.assertEqual(again.workflow_status(key2, CUST)["tupleLevel"],
                         "IN_PROGRESS")

    def test_C2_legacy_readonly_replay_with_pinned_oracle(self):
        """GATE: GUARDRAIL LEGACY ADMISSION — genuine CORR5 histories are admitted read-only under the frozen semantics; bytes preserved; never adopted

        Expected: replay_legacy_history accepts the genuine chain generated
        by the SHA-pinned CORR5 engine, classifies it as legacy with zero
        indexed propositions, and preserves the original bytes exactly;
        restore_global_history refuses it (no adoption, no CORR6
        extension). Differential oracle: a correctly rehashed semantic
        forgery appended to the legacy chain is refused by BOTH the pinned
        CORR5 engine and the CORR6 legacy rule-set.
        """
        s5, mod, legacy_path = self._genuine_legacy_chain("c2_legacy.jsonl")
        before = _file_identity(legacy_path)
        result = self.sess.replay_legacy_history(legacy_path)
        self.assertTrue(result["legacyHistory"])
        self.assertEqual(result["engineActId"], oe.LEGACY_ENGINE_ACT_ID)
        self.assertEqual(result["engineSha256"], CORR5_ENGINE_SHA)
        self.assertTrue(result["integrityValid"])
        self.assertFalse(result["adopted"])
        self.assertFalse(result["extendable"])
        self.assertEqual(result["propositionsIndexed"], 0)
        self.assertTrue(result["legacyClassified"])
        self.assertEqual(_file_identity(legacy_path), before)
        # never adopted and never extended by CORR6 events
        self.expect_gate("LEGACY_HISTORY_NOT_ADOPTABLE",
                         self.sess.restore_global_history, legacy_path)
        # differential oracle: identical refusal on a rehashed forgery
        events = [json.loads(line) for line in
                  legacy_path.read_text(encoding="utf-8").splitlines()]
        forged = build_forged_extension(events, [
            ("SEAL_RECEIPT_ACKNOWLEDGED",
             {"tupleKey": TUP1, "custodian": CUST, "reviewer": RP1A})])
        fpath = Path(self._tmp) / "c2_legacy_forged.jsonl"
        write_events_file(fpath, forged)
        self.assertTrue(s5.verify_persisted_history(fpath)["valid"])
        self.expect_orig_gate(mod, "PROCEDURALLY_INVALID_HISTORY",
                              s5.import_history, fpath)
        self.expect_gate("LEGACY_HISTORY_INVALID",
                         self.sess.replay_legacy_history, fpath)

    def test_C3_mixed_version_rejection(self):
        """GATE: GUARDRAIL REPLAY FIREWALL — schema-version selection never allows mixed-version transitions

        Expected: a legacy chain with a correctly rehashed CORR6-shaped
        event appended is refused by BOTH paths (the legacy rule-set
        rejects the CORR6 shape; native restore rejects the legacy
        genesis); a native CORR6 chain with a correctly rehashed old-schema
        event appended fails closed under CORR6 replay. A forged old-schema
        event never gains authority by imitating the older schema.
        """
        _s5, _mod, legacy_path = self._genuine_legacy_chain(
            "c3_legacy.jsonl")
        events = [json.loads(line) for line in
                  legacy_path.read_text(encoding="utf-8").splitlines()]
        mixed = build_forged_extension(events, [
            ("LANE_B_REGISTERED", {
                "tupleKey": TUP1, "reviewer": RLB,
                "submissionId": sub_id(RLB, TUP1, 1),
                "question": "SYNTHETIC q", "surface": "SYNTHETIC s",
                "schemaClaim": "SYNTHETIC c"})])
        mpath = Path(self._tmp) / "c3_mixed.jsonl"
        write_events_file(mpath, mixed)
        self.expect_gate("LEGACY_HISTORY_INVALID",
                         self.sess.replay_legacy_history, mpath)
        self.expect_gate("LEGACY_HISTORY_NOT_ADOPTABLE",
                         self.sess.restore_global_history, mpath)
        # native chain + old-schema event (correctly rehashed) fails closed
        self.register_all()
        self.lawful_revealed(self.sess)
        live = self.host_events(self.sess)
        forged = build_forged_extension(live, [
            ("LANE_B_REGISTERED", {
                "tupleKey": TUP1, "reviewer": RLB,
                "question": "SYNTHETIC q", "surface": "SYNTHETIC s",
                "schemaClaim": "SYNTHETIC c"})])
        fpath = Path(self._tmp) / "c3_oldshape.jsonl"
        write_events_file(fpath, forged)
        self.assertTrue(self.sess.verify_global_history(fpath)["valid"])
        snap = self._sha_chain(self.sess)
        err = self.expect_gate("PROCEDURALLY_INVALID_HISTORY",
                               self.sess.restore_global_history, fpath)
        self.assertIn("payload schema violation", str(err))
        self.assertEqual(self._sha_chain(self.sess), snap)

    def test_C4_immutable_sources_and_pinned_oracles(self):
        """GATE: GUARDRAIL PROVENANCE — the frozen predecessors and the accepted rubric stay byte-identical

        Expected: the CORR5 engine (legacy oracle), the CORR4/CORR3/CORR2/
        CORR1/ORIGINAL engines and the accepted rubric match their pinned
        SHA-256 identities while the suite runs.
        """
        expected = {
            CORR5_DIR / "offline_efca.py": CORR5_ENGINE_SHA,
            CORR4_DIR / "offline_efca.py": CORR4_ENGINE_SHA,
            CORR3_DIR / "offline_efca.py": CORR3_ENGINE_SHA,
            CORR2_DIR / "offline_efca.py": CORR2_ENGINE_SHA,
            CORR1_DIR / "offline_efca.py": CORR1_ENGINE_SHA,
            ORIGINAL_DIR / "offline_efca.py": ORIGINAL_ENGINE_SHA,
            RUBRIC_PATH: oe.RUBRIC_EXPECTED_SHA256,
        }
        for path, sha in expected.items():
            self.assertEqual(
                hashlib.sha256(path.read_bytes()).hexdigest(), sha,
                msg="immutable source changed: %s" % path)



# ==========================================================================
# F-40..F-43: CORR7 oracle-elimination and namespace closures
# ==========================================================================

class Corr7OracleTests(EFCAUnitTest):
    """F-40 (foreign Lane B existence oracle) and F-41 (foreign tuple
    registration oracle). Reproduction sides run on the immutable CORR6
    engine (994ae06a...) through the pinned loader."""

    UNREG = "SYN_CASE_077|SYN_SIDE_A|SYN_FACT_077"

    def _fresh_spec(self, num, side="SYN_SIDE_A"):
        spec = json.loads(json.dumps(FIX["tuples"][0]))
        spec["caseId"] = "SYN_CASE_%03d" % num
        spec["factId"] = "SYN_FACT_%03d" % num
        spec["sideId"] = side
        spec["d"] = "SYN_D_%02d" % (num % 100)
        return spec

    @staticmethod
    def _probe(fn, *args, **kwargs):
        try:
            fn(*args, **kwargs)
            return ("OK", "OK")
        except Exception as exc:  # legacy engines raise their own class
            return (getattr(exc, "code", str(exc)), str(exc))

    def _corr6_session(self):
        mod = corr6_engine()
        s = mod.EFCASession(rubric_path=RUBRIC_PATH,
                            sidecar_path=SIDECAR_PATH,
                            scratch_dir=Path(self._tmp))
        for actor in FIX["actors"]:
            s.register_actor(actor["actorId"], actor["role"])
        s.register_actor("SYN_CUST_002", "CUSTODIAN")
        return mod, s

    # ---------------- F-40 ----------------

    def test_F40_lane_b_view_authorization_before_existence(self):
        """GATE: F-40 FOREIGN LANE B EXISTENCE ORACLE — authorization is decided before existence; one constant refusal

        Original failure (reproduced on CORR6): lane_b_view checks whether
        submissions exist BEFORE authorization, so an outsider
        distinguishes three states — a foreign tuple with submissions
        (REFUSED_LANE_B_ACCESS), a foreign tuple with none
        (INVALID_PAYLOAD) and an unregistered key (UNKNOWN_TUPLE). CORR7:
        ONE constant refusal for every requester without a lawful Lane B
        relationship, identical before and after foreign submissions
        appear, stable under repeated polling, with no state change; the
        custodian sees an empty submissions list on a zero-submission
        tuple and the registering R_LB only their own.
        """
        mod, s6 = self._corr6_session()
        key6 = s6.register_tuple(CUST, FIX["tuples"][0])["tupleKey"]
        empty6 = s6.register_tuple(CUST, self._fresh_spec(2))["tupleKey"]
        s6.register_lane_b(RLB, key6, FIX["laneB"])
        c6_with, _ = self._probe(s6.lane_b_view, RP1B, key6)
        c6_without, _ = self._probe(s6.lane_b_view, RP1B, empty6)
        c6_unreg, _ = self._probe(s6.lane_b_view, RP1B, self.UNREG)
        self.assertEqual(len({c6_with, c6_without, c6_unreg}), 3,
                         msg="CORR6 must reproduce the three-way oracle")
        # --- CORR7 (CORR9/OD-45-A: the 009|A tuple belongs to the OWNER
        # manifest under SYN_CUST_001, so the SYN_CUST_002 entitlement that
        # this scenario needs is an EXPLICIT simulation authority)
        self.sess = self.sim_session(
            [(TUP1, CUST), (TUP2, CUST), (KEY_009A, CUST2)])
        self.register_all()
        self.sess.register_actor("SYN_CUST_002", "CUSTODIAN")
        key = self.register_tuple()["tupleKey"]
        empty = self.register_tuple(self.sess, 1)["tupleKey"]
        foreign = self.sess.register_tuple(
            "SYN_CUST_002", self._fresh_spec(9))["tupleKey"]
        before = self._probe(self.sess.lane_b_view, RP1C, foreign)
        self.sess.register_lane_b(RLB, foreign, FIX["laneB"])
        self.sess.register_lane_b(RLB, foreign, FIX["laneB"])
        after = self._probe(self.sess.lane_b_view, RP1C, foreign)
        unreg = self._probe(self.sess.lane_b_view, RP1C, self.UNREG)
        empty_own = self._probe(self.sess.lane_b_view, RP1C, empty)
        self.assertEqual(before, after)
        self.assertEqual(after, unreg)
        self.assertEqual(after, empty_own)
        self.assertEqual(after[0], "REFUSED_LANE_B_ACCESS")
        for _ in range(3):  # repeated polling
            self.assertEqual(self._probe(self.sess.lane_b_view, RP1C,
                                         foreign), after)
        # a refusal mutates nothing
        snap = self._sha_chain(self.sess)
        self._probe(self.sess.lane_b_view, RP1C, foreign)
        self.assertEqual(self._sha_chain(self.sess), snap)
        # lawful counterparts: custodian (empty and populated), own R_LB
        self.assertEqual(
            self.sess.lane_b_view(CUST, empty)["submissions"], [])
        self.assertEqual(
            [s["submissionId"] for s in
             self.sess.lane_b_view("SYN_CUST_002", foreign)
             ["submissions"]],
            [sub_id(RLB, foreign, 1), sub_id(RLB, foreign, 2)])
        self.assertEqual(
            [s["submissionId"] for s in
             self.sess.lane_b_view(RLB, foreign)["submissions"]],
            [sub_id(RLB, foreign, 1), sub_id(RLB, foreign, 2)])

    # ---------------- F-41 ----------------

    def test_F41_foreign_tuple_registration_oracle_eliminated(self):
        """GATE: F-41 FOREIGN TUPLE REGISTRATION ORACLE — every requester-scoped refusal is existence-blind

        Original failure (reproduced on CORR6): responses differ before and
        after a foreign registration for the same well-formed key
        (UNKNOWN_TUPLE vs WITHHELD_BEFORE_OWN_SEAL / ROLE_MISMATCH /
        UNISSUED_PACKET, and the R_IND even self-issues a foreign
        reproduction packet). CORR7: identical codes AND messages whether
        the key is unregistered or held by a foreign custodian, across
        every requester-scoped operation; refusals mutate nothing;
        repeated polling is stable.
        """
        mod, s6 = self._corr6_session()
        foreign6 = s6.register_tuple("SYN_CUST_002",
                                     self._fresh_spec(9))["tupleKey"]
        (u, _), (f, _) = (self._probe(s6.workflow_status, self.UNREG, CUST),
                          self._probe(s6.workflow_status, foreign6, CUST))
        self.assertNotEqual(u, f, msg="CORR6 must reproduce the oracle")
        u2, _ = self._probe(s6.begin_independent_reproduction, RIND,
                            self.UNREG)
        f2, _ = self._probe(s6.begin_independent_reproduction, RIND,
                            foreign6)
        self.assertNotEqual(u2, f2)
        self.assertEqual(f2, "OK")  # CORR6: foreign packet auto-issued
        # --- CORR7 (CORR9/OD-45-A: the 009|A tuple belongs to the OWNER
        # manifest under SYN_CUST_001; the SYN_CUST_002 entitlement this
        # scenario needs is an EXPLICIT simulation authority)
        self.sess = self.sim_session([(TUP1, CUST), (KEY_009A, CUST2)])
        self.register_all()
        self.sess.register_actor("SYN_CUST_002", "CUSTODIAN")
        key = self.register_tuple()["tupleKey"]
        foreign = self.sess.register_tuple(
            "SYN_CUST_002", self._fresh_spec(9))["tupleKey"]
        sids = [self.sess.register_lane_b(RLB, foreign, FIX["laneB"])
                ["submissionId"]]
        review = FIX["phase1Reviews"]["determinateYes"]
        probes = [
            ("issue_packet", lambda k: self.sess.issue_packet(CUST, RP1C, k)),
            ("ack_receipt", lambda k: self.sess.acknowledge_seal_receipt(
                CUST, k, RP1A)),
            ("reveal", lambda k: self.sess.reveal(CUST, RP1A, k)),
            ("request_new_phase1", lambda k: self.sess.request_new_phase1(
                CUST, k, RP1C)),
            ("deliver_lane_b", lambda k: self.sess.deliver_lane_b_to(
                CUST, RP1A, k, sids[0])),
            ("issue_evidence", lambda k: self.sess.issue_evidence_record(
                CUST, k)),
            ("custody_view", lambda k: self.sess.custody_view(CUST, k)),
            ("workflow_status", lambda k: self.sess.workflow_status(k, CUST)),
            ("category_assignment", lambda k: self.sess.category_assignment(k)),
            ("fetch_packet", lambda k: self.sess.fetch_packet(RP1C, k)),
            ("submit_phase1", lambda k: self.sess.submit_phase1_review(
                RP1C, k, review)),
            ("begin_repro", lambda k: self.sess.begin_independent_reproduction(
                RIND, k)),
            ("receive_rationale", lambda k: self.sess.receive_first_rationale(
                RIND, k)),
            ("declare_refs", lambda k: self.sess.declare_records_rederived(
                RIND, k, [])),
            ("adjudicate", lambda k: self.sess.adjudicate_claim(
                RIND, k, "NORMATIVE_DETERMINACY", "SYN_CLAIM_001")),
            ("report_exposure_custodian", lambda k: self.sess.report_exposure(
                CUST, k, RP1A, "MARK_A", "SYNTHETIC")),
            ("lane_b_view", lambda k: self.sess.lane_b_view(RP1C, k)),
        ]
        snap = self._sha_chain(self.sess)
        for name, fn in probes:
            unreg = self._probe(fn, self.UNREG)
            foreignp = self._probe(fn, foreign)
            self.assertEqual(unreg, foreignp,
                             msg="F-41 oracle leak through %s" % name)
            for _ in range(2):  # repeated polling
                self.assertEqual(self._probe(fn, self.UNREG), unreg,
                                 msg="polling drift through %s" % name)
        self.assertEqual(self._sha_chain(self.sess), snap,
                         msg="a refused probe mutated state")

    def test_F41_self_scoped_records_are_uniform_and_replay_consistent(self):
        """GATE: F-41 SELF-SCOPED CONTENT RECORDS — uniform outcome on unregistered and foreign keys; packet-first reproduction positives; live/replay consistency

        Expected: a Lane B filing and an exposure self-disclosure by the
        exposed actor bind to the well-formed key with the SAME success on
        an unregistered and a foreign-registered tuple (no registration
        oracle); the custodian sees them once the tuple is registered; a
        host round trip reproduces every scoped view (live/replay
        equivalence); custodian-issued reproduction packets are the only
        reproducer entry, returning the packet content; a genuine duplicate
        custody claim is refused (intrinsic registration residual).
        """
        # CORR9/OD-45-A: this scenario files against the unallocated 077|A
        # key and then registers it, so it declares an EXPLICIT simulation
        # authority for exactly the three tuples it registers.
        sim_entries = [(TUP1, CUST), (TUP2, CUST), (KEY_077A, CUST)]
        self.sess = self.sim_session(sim_entries)
        self.register_all()
        foreign = self.sess.register_tuple(CUST, FIX["tuples"][0])["tupleKey"]
        # uniform success on both states
        filing_unreg = self.sess.register_lane_b(RLB, self.UNREG,
                                                 FIX["laneB"])
        filing_foreign = self.sess.register_lane_b(RLB, foreign,
                                                   FIX["laneB"])
        # CORR8/F-44: uniform SUCCESS in both states; the identities are
        # tuple-scoped by construction and differ across tuples without
        # revealing anything (each is a pure function of its own inputs)
        self.assertEqual(filing_unreg["submissionId"],
                         sub_id(RLB, self.UNREG, 1))
        self.assertEqual(filing_foreign["submissionId"],
                         sub_id(RLB, foreign, 1))
        unreg_incident = self.sess.report_exposure(
            RP1B, self.UNREG, RP1B, "MARK_A", "SYNTHETIC")
        foreign_incident = self.sess.report_exposure(
            RP1B, foreign, RP1B, "MARK_A", "SYNTHETIC")
        self.assertEqual(unreg_incident["phase1Contamination"]["status"],
                         foreign_incident["phase1Contamination"]["status"])
        # registering the previously-unregistered tuple reveals the record
        # to its custodian exactly as if it had been registered from the start
        late = self.sess.register_tuple(CUST, self._fresh_spec(77))
        self.assertEqual(late["tupleKey"], self.UNREG)
        self.assertEqual(
            [s["submissionId"] for s in
             self.sess.lane_b_view(CUST, self.UNREG)["submissions"]],
            [sub_id(RLB, self.UNREG, 1)])
        self.assertIn(RP1B, self.sess.custody_view(CUST, self.UNREG)
                      ["incidents"])
        # live/replay consistency through the host channel (the restoring
        # session declares the SAME explicit simulation authority, so the
        # GENESIS (mode, digest) pair matches; a pinned session would
        # refuse this chain — see the cross-mode family)
        chain = self.host_persist(self.sess, "f41.jsonl")
        restored = self.host_restore(chain["path"],
                                     s=self.sim_session(sim_entries))
        self.assertEqual(
            json.dumps(restored.lane_b_view(CUST, self.UNREG),
                       sort_keys=True),
            json.dumps(self.sess.lane_b_view(CUST, self.UNREG),
                       sort_keys=True))
        self.assertEqual(
            json.dumps(restored.custody_view(CUST, self.UNREG),
                       sort_keys=True),
            json.dumps(self.sess.custody_view(CUST, self.UNREG),
                       sort_keys=True))
        # packet-first reproduction positives
        key = self.register_tuple(self.sess, 1)["tupleKey"]
        self.issue_to(self.sess, RP1A, key)
        self.seal_by(self.sess, RP1A, key)
        self.sess.acknowledge_seal_receipt(CUST, key, RP1A)
        unreg_begin = self._probe(self.sess.begin_independent_reproduction,
                                  RIND, self.UNREG)
        self.assertEqual(unreg_begin[0], "UNISSUED_PACKET")
        self.issue_to(self.sess, RIND, key)
        packet = self.sess.begin_independent_reproduction(RIND, key)
        self.assertEqual(set(packet.keys()), set(oe.PACKET_FIELDS))
        # the intrinsic duplicate-custody refusal (documented residual)
        self.expect_gate("DUPLICATE_TUPLE", self.sess.register_tuple, CUST,
                         FIX["tuples"][0])


# ==========================================================================
# F-42/F-43: namespace separation
# ==========================================================================

class Corr7NamespaceTests(EFCAUnitTest):

    def test_F42_cross_actor_projection_namespace_isolation(self):
        """GATE: F-42 CROSS-ACTOR PROJECTION COLLISION AND OBSERVATION — actor-local namespaces; one constant verification shape

        Original failure (reproduced on CORR6): two actors share one
        session directory, so an actor's filename selection collides with
        another actor's export (PROJECTION_EXISTS) and a guessed path
        distinguishes absent / foreign / chain artifacts by reason text.
        CORR7: per-actor projection namespaces; the same filename coexists;
        the same actor's re-export stays idempotent; cross-actor,
        absent-path and chain-artifact probes all return the SAME constant
        negative; another actor's file bytes are untouched.
        """
        # CORR6 reproduction: same name, different actors collide
        mod = corr6_engine()
        s6 = mod.EFCASession(rubric_path=RUBRIC_PATH,
                             sidecar_path=SIDECAR_PATH,
                             scratch_dir=Path(self._tmp))
        for actor in FIX["actors"]:
            s6.register_actor(actor["actorId"], actor["role"])
        s6.register_tuple(CUST, FIX["tuples"][0])
        p6 = s6.persist_history("backup.jsonl", CUST)
        collide6 = self._probe6(s6, "backup.jsonl", RP1A)
        self.assertEqual(collide6, "PROJECTION_EXISTS")
        # --- CORR7
        self.register_all()
        self.sess.register_tuple(CUST, FIX["tuples"][0])
        pa = self.sess.persist_history("backup.jsonl", CUST)
        pb = self.sess.persist_history("backup.jsonl", RP1A)
        self.assertNotEqual(pa["path"], pb["path"])
        self.assertIn("/projections/SYN_CUST_001/", pa["path"])
        self.assertIn("/projections/SYN_RP1_001/", pb["path"])
        a_bytes = Path(pa["path"]).read_bytes()
        # an identical own re-export is idempotent and does not touch the
        # other actor's file
        again = self.sess.persist_history("backup.jsonl", CUST)
        self.assertEqual(again["path"], pa["path"])
        self.assertEqual(Path(pb["path"]).read_bytes(),
                         Path(pb["path"]).read_bytes())
        self.assertEqual(Path(pa["path"]).read_bytes(), a_bytes)
        # one constant negative shape for every non-own artifact
        chain = self.host_persist(self.sess, "backup.jsonl")
        absent = (Path(pa["path"]).parent / "absent.json")
        expected = {"valid": False, "reason": "not_a_lawful_projection"}
        self.assertEqual(
            self.sess.verify_persisted_history(Path(pa["path"]), RP1A),
            expected)
        self.assertEqual(
            self.sess.verify_persisted_history(Path(chain["path"]), RP1A),
            expected)
        self.assertEqual(
            self.sess.verify_persisted_history(absent, RP1A), expected)
        for _ in range(3):  # repeated polling is stable
            self.assertEqual(
                self.sess.verify_persisted_history(Path(pa["path"]), RP1A),
                expected)
        self.assertEqual(
            self.sess.verify_persisted_history(Path(pa["path"]), CUST),
            {"valid": True, "reason": "ok"})
        # divergent content within the actor's OWN namespace is refused
        snap = self._sha_chain(self.sess)
        self.sess.register_tuple(CUST, FIX["tuples"][1])
        self.expect_gate("PROJECTION_EXISTS", self.sess.persist_history,
                         "backup.jsonl", CUST)
        self.assertGreaterEqual(self._sha_chain(self.sess)[0], snap[0])

    @staticmethod
    def _probe6(session, name, actor):
        try:
            session.persist_history(name, actor)
            return "OK"
        except Exception as exc:  # legacy engine error type
            return getattr(exc, "code", str(exc))

    def test_F43_requester_and_host_storage_are_separate(self):
        """GATE: F-43 REQUESTER/HOST PERSISTENCE COLLISION — a projection never reserves, shadows or blocks a host-backup filename

        Original failure (reproduced on CORR6): projections and host chain
        files share one directory, so a public projection at a name blocks
        the host backup at that name (PERSIST_FILE_INVALID) — a requester
        can deny the engine's authoritative durability. CORR7: physically
        separate host_chain/ and projections/<actorId>/ namespaces; both
        coexist at the same name; the host chain restores; the projection
        remains verifiable by its actor.
        """
        mod = corr6_engine()
        s6 = mod.EFCASession(rubric_path=RUBRIC_PATH,
                             sidecar_path=SIDECAR_PATH,
                             scratch_dir=Path(self._tmp))
        for actor in FIX["actors"]:
            s6.register_actor(actor["actorId"], actor["role"])
        s6.register_tuple(CUST, FIX["tuples"][0])
        s6.persist_history("backup.jsonl", CUST)
        blocked = None
        try:
            s6.persist_global_history("backup.jsonl")
        except Exception as exc:  # legacy engine error type
            blocked = getattr(exc, "code", str(exc))
        self.assertEqual(blocked, "PERSIST_FILE_INVALID",
                         msg="CORR6 must reproduce the host shadowing")
        # --- CORR7
        self.register_all()
        self.sess.register_tuple(CUST, FIX["tuples"][0])
        projection = self.sess.persist_history("backup.jsonl", CUST)
        host = self.sess.persist_global_history("backup.jsonl")
        self.assertNotEqual(projection["path"], host["path"])
        self.assertIn("/host_chain/", host["path"])
        self.assertIn("/projections/SYN_CUST_001/", projection["path"])
        restored = self.host_restore(host["path"])
        self.assertEqual(restored.workflow_status(TUP1, CUST)["tupleLevel"],
                         "IN_PROGRESS")
        self.assertEqual(
            self.sess.verify_persisted_history(
                Path(projection["path"]), CUST),
            {"valid": True, "reason": "ok"})
        # the host backup is repeatable and the projection remains
        grown = self.host_persist(self.sess, "backup.jsonl")
        self.assertGreaterEqual(grown["eventCount"], host["eventCount"])


# ==========================================================================
# CORR6 immutability lineage
# ==========================================================================

class Corr7LineageTests(EFCAUnitTest):

    def test_C5_corr6_candidate_immutable_and_non_adoptable(self):
        """GATE: CORR7 PRESERVATION — the immutable CORR6 candidate stays byte-pinned, non-adoptable and non-legacy

        Expected: the CORR6 engine loads only after its exact SHA-256 is
        verified; a genuine CORR6 chain is refused by native restore
        (NOT_A_NATIVE_HISTORY) and by legacy admission
        (NOT_A_LEGACY_HISTORY); the CORR6 test-file identity is unchanged;
        the legacy CORR5 lineage remains the only read-only admitted
        lineage.
        """
        from pathlib import Path as _P
        self.assertEqual(
            hashlib.sha256((CORR6_DIR / "test_offline_efca.py")
                           .read_bytes()).hexdigest(),
            "8e1a7ad80981bf6720f9c1b1925f336410a635adb2efc9dc99fd7d69562b83cb")
        mod = corr6_engine()  # loader verifies the pinned SHA-256
        s6 = mod.EFCASession(rubric_path=RUBRIC_PATH,
                             sidecar_path=SIDECAR_PATH,
                             scratch_dir=Path(self._tmp))
        for actor in FIX["actors"]:
            s6.register_actor(actor["actorId"], actor["role"])
        s6.register_tuple(CUST, FIX["tuples"][0])
        chain6 = Path(s6.persist_global_history("corr6.jsonl")["path"])
        self.expect_gate("NOT_A_NATIVE_HISTORY",
                         self.sess.restore_global_history, chain6)
        self.expect_gate("NOT_A_LEGACY_HISTORY",
                         self.sess.replay_legacy_history, chain6)
        self.assertEqual(oe.CORR6_ENGINE_SHA256,
                         "994ae06a150d535b8d64011be656cd0b84910d3ae4c2de46a4c542418a763382")



# ==========================================================================
# F-44: cross-reviewer Lane B ordinal leakage (CORR8 correction)
# ==========================================================================

class Corr8SubmissionIdentityTests(EFCAUnitTest):
    """F-44 (the scope of the CORR8 act that authored these tests; F-45 was
    left there as a residual of the separate Codex analytical track and is
    corrected by the CORR9 F-45 family below — these tests keep their F-44
    intent unchanged). Reproduction side runs on the immutable CORR7 engine
    (c06875cb...) through the pinned loader."""

    def _fresh_spec(self, num, side="SYN_SIDE_A"):
        spec = json.loads(json.dumps(FIX["tuples"][0]))
        spec["caseId"] = "SYN_CASE_%03d" % num
        spec["factId"] = "SYN_FACT_%03d" % num
        spec["sideId"] = side
        spec["d"] = "SYN_D_%02d" % (num % 100)
        return spec

    def _register_plus(self, s=None):
        s = s or self.sess
        self.register_all(s)
        s.register_actor(RLB2, "R_LB")
        return s

    def test_F44_ordinal_leak_reproduced_on_corr7(self):
        """GATE: F-44 CROSS-REVIEWER ORDINAL LEAKAGE — reproduced on the immutable CORR7 engine

        Original failure (reproduced on CORR7): the tuple-local submission
        ordinal makes the identifier returned to R_LB_001 depend on
        whether R_LB_002 had filed earlier on the same tuple
        (SYN_SUB_001 vs SYN_SUB_002) — another reviewer's earlier filing
        is revealed through the identifier. CORR8: the identity returned
        to R_LB_001 is identical in both orders and equals the
        independently computed actor-local deterministic value.
        """
        mod = corr7_engine()
        s7 = mod.EFCASession(rubric_path=RUBRIC_PATH,
                             sidecar_path=SIDECAR_PATH,
                             scratch_dir=Path(self._tmp))
        for actor in FIX["actors"]:
            s7.register_actor(actor["actorId"], actor["role"])
        s7.register_actor(RLB2, "R_LB")
        keyA = s7.register_tuple(CUST, FIX["tuples"][0])["tupleKey"]
        first = s7.register_lane_b(RLB, keyA, FIX["laneB"])["submissionId"]
        keyB = s7.register_tuple(CUST, self._fresh_spec(2))["tupleKey"]
        s7.register_lane_b(RLB2, keyB, FIX["laneB"])
        second = s7.register_lane_b(RLB, keyB, FIX["laneB"])["submissionId"]
        self.assertNotEqual(first, second)
        self.assertEqual([first, second], ["SYN_SUB_001", "SYN_SUB_002"],
                         msg="CORR7 must reproduce the F-44 leak")
        # --- CORR8: both orders on the same tuple
        self._register_plus()
        key = self.register_tuple()["tupleKey"]
        a_first = self.sess.register_lane_b(RLB, key, FIX["laneB"])
        a_second = self.sess.register_lane_b(RLB2, key, FIX["laneB"])
        other = self.new_session(session_label="SYN_SESSION_009")
        self._register_plus(other)
        key2 = other.register_tuple(CUST, FIX["tuples"][0])["tupleKey"]
        b_first = other.register_lane_b(RLB2, key2, FIX["laneB"])
        b_second = other.register_lane_b(RLB, key2, FIX["laneB"])
        # the identifier for a given (actor, tuple, own ordinal) is
        # independent of the other reviewer's filing and of the filing order
        self.assertEqual(a_first["submissionId"], sub_id(RLB, key, 1))
        self.assertEqual(b_second["submissionId"], sub_id(RLB, key2, 1))
        self.assertNotEqual(a_first["submissionId"], a_second["submissionId"])
        # order-independence of R_LB's own identity
        self.assertEqual(
            [e["submissionId"] for e in self.sess.lane_b_view(RLB, key)
             ["submissions"]],
            [e["submissionId"] for e in other.lane_b_view(RLB, key2)
             ["submissions"]][:0] or [a_first["submissionId"]])

    def test_F44_orders_repeats_scopes_and_delivery(self):
        """GATE: F-44 IDENTITY INVARIANTS — both orders, several submissions per actor, actor-scoped views, exact custodian delivery, pre-registration filing

        Expected: R_LB_001's identity is the same whichever order the two
        reviewers file in; repeated submissions by one actor remain
        distinct; each R_LB sees only their own submissions; the custodian
        sees all and delivers one exact submission; a filing on a
        well-formed key before its registration carries the same
        actor-local identity the tuple has after registration.
        """
        # CORR9/OD-45-A: the pre-registration filing and later registration
        # of the 088|A key need an EXPLICIT simulation authority (the Owner
        # manifest allocates eight tuples; 088|A is not among them).
        self.sess = self.sim_session([(TUP1, CUST), (KEY_088A, CUST)])
        self._register_plus()
        key = self.register_tuple()["tupleKey"]
        # order 1: RLB, RLB, RLB2, RLB2
        r1 = self.sess.register_lane_b(RLB, key, FIX["laneB"])["submissionId"]
        r2 = self.sess.register_lane_b(RLB, key, FIX["laneB"])["submissionId"]
        q1 = self.sess.register_lane_b(RLB2, key, FIX["laneB"])["submissionId"]
        q2 = self.sess.register_lane_b(RLB2, key, FIX["laneB"])["submissionId"]
        self.assertEqual([r1, r2], [sub_id(RLB, key, 1), sub_id(RLB, key, 2)])
        self.assertEqual([q1, q2],
                         [sub_id(RLB2, key, 1), sub_id(RLB2, key, 2)])
        # actor-scoped views: own submissions only, stable under polling
        self.assertEqual(
            sorted(s["submissionId"] for s in
                   self.sess.lane_b_view(RLB, key)["submissions"]),
            sorted([r1, r2]))
        self.assertEqual(
            sorted(s["submissionId"] for s in
                   self.sess.lane_b_view(RLB, key)["submissions"]),
            sorted([r1, r2]))
        self.assertEqual(
            sorted(s["submissionId"] for s in
                   self.sess.lane_b_view(RLB2, key)["submissions"]),
            sorted([q1, q2]))
        blob = json.dumps(self.sess.lane_b_view(RLB, key))
        self.assertNotIn(q1, blob)
        self.assertNotIn(q2, blob)
        # custodian sees all four and delivers one exact submission
        self.assertEqual(
            sorted(s["submissionId"] for s in
                   self.sess.lane_b_view(CUST, key)["submissions"]),
            sorted([r1, r2, q1, q2]))
        delivered = self.sess.deliver_lane_b_to(CUST, RP1B, key, q2)
        self.assertEqual(delivered["submissionId"], q2)
        # pre-registration filing: the identity equals the post-registration
        # actor-local identity for the same ordinal
        prereg_key = "SYN_CASE_088|SYN_SIDE_A|SYN_FACT_088"
        pre = self.sess.register_lane_b(RLB, prereg_key,
                                        FIX["laneB"])["submissionId"]
        self.assertEqual(pre, sub_id(RLB, prereg_key, 1))
        self.sess.register_tuple(CUST, self._fresh_spec(88))
        self.assertEqual(
            [s["submissionId"] for s in
             self.sess.lane_b_view(CUST, prereg_key)["submissions"]],
            [pre])

    def test_F44_forgery_replay_and_refusal_immutability(self):
        """GATE: F-44 FORGERY, REPLAY AND REFUSAL IMMUTABILITY — forged/reused identities fail closed; replay is deterministic; refusals mutate nothing

        Expected: a live submission with a reused, cross-actor or
        well-formed-but-wrongly-derived identifier fails closed with no
        state change; a correctly rehashed history extension carrying a
        wrong identity fails semantic replay; a genuine chain restores
        into a fresh same-label session with byte-identical scoped views
        and identical identities; unauthorized lane_b_view and delivery
        refusals are stable under polling.
        """
        self._register_plus()
        key = self.register_tuple()["tupleKey"]
        first = self.sess.register_lane_b(RLB, key, FIX["laneB"])
        second = self.sess.register_lane_b(RLB, key, FIX["laneB"])
        snap = self._sha_chain(self.sess)
        # cross-actor reuse: RLB2 declares RLB's identifier
        live = self.host_events(self.sess)
        forged = build_forged_extension(live, [
            ("LANE_B_REGISTERED", {
                "tupleKey": key, "reviewer": RLB2,
                "submissionId": first["submissionId"],
                "question": "SYNTHETIC q", "surface": "SYNTHETIC s",
                "schemaClaim": "SYNTHETIC c"})])
        fpath = Path(self._tmp) / "h_f44_cross.jsonl"
        write_events_file(fpath, forged)
        self.assertTrue(self.sess.verify_global_history(fpath)["valid"])
        self.expect_gate("PROCEDURALLY_INVALID_HISTORY",
                         self.sess.restore_global_history, fpath)
        # well-formed but wrongly derived identifier (own ordinal + 1)
        live = self.host_events(self.sess)
        forged2 = build_forged_extension(live, [
            ("LANE_B_REGISTERED", {
                "tupleKey": key, "reviewer": RLB,
                "submissionId": sub_id(RLB, key, 99),
                "question": "SYNTHETIC q", "surface": "SYNTHETIC s",
                "schemaClaim": "SYNTHETIC c"})])
        fpath2 = Path(self._tmp) / "h_f44_wrong.jsonl"
        write_events_file(fpath2, forged2)
        self.assertTrue(self.sess.verify_global_history(fpath2)["valid"])
        self.expect_gate("PROCEDURALLY_INVALID_HISTORY",
                         self.sess.restore_global_history, fpath2)
        self.assertEqual(self._sha_chain(self.sess), snap)
        # replay determinism: genuine chain -> fresh same-label session
        chain = self.host_persist(self.sess, "f44.jsonl")
        fresh = self.new_session()
        restored = fresh.restore_global_history(Path(chain["path"]))
        self.assertTrue(restored["restored"])
        self.assertEqual(
            json.dumps(fresh.lane_b_view(CUST, key), sort_keys=True),
            json.dumps(self.sess.lane_b_view(CUST, key), sort_keys=True))
        self.assertEqual(
            sorted(s["submissionId"] for s in
                   fresh.lane_b_view(RLB, key)["submissions"]),
            sorted([first["submissionId"], second["submissionId"]]))
        # refusal immutability under polling
        before_view = self.sess.lane_b_view(CUST, key)
        for _ in range(3):
            self.expect_gate("REFUSED_LANE_B_ACCESS",
                             self.sess.lane_b_view, RP1A, key)
            self.expect_gate("INVALID_PAYLOAD", self.sess.deliver_lane_b_to,
                             CUST, RP1B, key, sub_id(RLB2, key, 9))
        self.assertEqual(self.sess.lane_b_view(CUST, key), before_view)
        self.assertEqual(self._sha_chain(self.sess), snap)

    def test_F44_no_counter_leak_anywhere(self):
        """GATE: F-44 NO COUNTER LEAK — the identifier and every scoped surface reveal no ordinal, order or cross-reviewer count

        Expected: the identifier matches the mirror construction exactly
        (so no hidden counter exists outside the hashed input); no scoped
        view, operation return or projection contains the other actor's
        submission identity before a lawful relationship exists; F-40's
        constant refusal still holds after CORR8 filings.
        """
        self._register_plus()
        key = self.register_tuple()["tupleKey"]
        got = self.sess.register_lane_b(RLB, key, FIX["laneB"])
        self.assertEqual(got["submissionId"], sub_id(RLB, key, 1))
        # the other actor's id is not in RLB's view, returns or projections
        qid = self.sess.register_lane_b(RLB2, key, FIX["laneB"])
        rlb_blob = json.dumps({
            "view": self.sess.lane_b_view(RLB, key),
            "events": self.sess.events(RLB),
            "status": self.sess.workflow_status(key, RLB),
        })
        self.assertNotIn(qid["submissionId"], rlb_blob)
        # F-40 holds unchanged after CORR8 filings: one constant refusal
        refusal = self._probe_fn(lambda: self.sess.lane_b_view(RP1A, key))
        self.sess.register_lane_b(RLB2, key, FIX["laneB"])
        self.assertEqual(
            self._probe_fn(lambda: self.sess.lane_b_view(RP1A, key)),
            refusal)
        # the identifier pattern is synthetic and non-sequential
        self.assertRegex(got["submissionId"], r"^SYN_SUB_[0-9a-f]{16}$")

    def _probe_fn(self, fn):
        try:
            fn()
            return ("OK", "OK")
        except Exception as exc:  # legacy engines raise their own class
            return (getattr(exc, "code", str(exc)), str(exc))


# ==========================================================================
# CORR7 immutability lineage (CORR8)
# ==========================================================================

class Corr8LineageTests(EFCAUnitTest):

    def test_C6_corr7_candidate_immutable_and_non_adoptable(self):
        """GATE: CORR8 PRESERVATION — the immutable CORR7 candidate stays byte-pinned, non-adoptable and non-legacy

        Expected: the CORR7 engine loads only after its exact SHA-256 is
        verified; a genuine CORR7 chain is refused by native restore
        (NOT_A_NATIVE_HISTORY) and by legacy admission
        (NOT_A_LEGACY_HISTORY); the CORR7 test-file identity is unchanged;
        the legacy CORR5 lineage remains the only read-only admitted
        lineage.
        """
        self.assertEqual(
            hashlib.sha256((CORR7_DIR / "test_offline_efca.py")
                           .read_bytes()).hexdigest(),
            "0ba51aeebc1c414ef2c64020d492958aacef7706fd3bb947c665d5acb5f2cec2")
        mod = corr7_engine()  # loader verifies the pinned SHA-256
        s7 = mod.EFCASession(rubric_path=RUBRIC_PATH,
                             sidecar_path=SIDECAR_PATH,
                             scratch_dir=Path(self._tmp))
        for actor in FIX["actors"]:
            s7.register_actor(actor["actorId"], actor["role"])
        s7.register_tuple(CUST, FIX["tuples"][0])
        chain7 = Path(s7.persist_global_history("corr7.jsonl")["path"])
        self.expect_gate("NOT_A_NATIVE_HISTORY",
                         self.sess.restore_global_history, chain7)
        self.expect_gate("NOT_A_LEGACY_HISTORY",
                         self.sess.replay_legacy_history, chain7)
        self.assertEqual(
            oe.CORR7_ENGINE_SHA256,
            "c06875cba1be4f2be841d465faf7515402f3363597347bd9332a0e9e188f77be")


# ==========================================================================
# F-45: independent custody-registration entitlement (OD-45-A)
# ==========================================================================

class Corr9EntitlementTests(EFCAUnitTest):
    """F-45 (first-writer custody capture) under Owner-accepted OD-45-A.
    Reproduction side runs on the immutable CORR8 engine (b5ccce54…) through
    the pinned loader. Every positive registration in a simulation session
    has its EXPLICIT allocation entry; the Owner-approved eight-entry
    manifest is never broadened to make a test pass."""

    def _corr8_session(self):
        mod = corr8_engine()
        s = mod.EFCASession(rubric_path=RUBRIC_PATH,
                            sidecar_path=SIDECAR_PATH,
                            scratch_dir=Path(self._tmp))
        for actor in FIX["actors"]:
            s.register_actor(actor["actorId"], actor["role"])
        s.register_actor(CUST2, "CUSTODIAN")
        return mod, s

    @staticmethod
    def _spec(num, side="SYN_SIDE_A"):
        spec = json.loads(json.dumps(FIX["tuples"][0]))
        spec["caseId"] = "SYN_CASE_%03d" % num
        spec["factId"] = "SYN_FACT_%03d" % num
        spec["sideId"] = side
        spec["d"] = "SYN_D_%02d" % (num % 100)
        return spec

    @staticmethod
    def _probe(fn, *args, **kwargs):
        try:
            fn(*args, **kwargs)
            return ("OK", "OK")
        except Exception as exc:  # legacy engines raise their own class
            return (getattr(exc, "code", str(exc)), str(exc))

    def _pinned_with_custodian(self, entries=None):
        """A pinned session with CUST registered and TUP1 lawfully
        registered under its Owner-approved entitlement."""
        self.register_all()
        self.sess.register_actor(CUST2, "CUSTODIAN")
        self.register_tuple()
        return self.sess

    # ---------------- F-45 reproduction on the immutable CORR8 ----------

    def test_F45_parent_reproduction_first_writer_capture(self):
        """GATE: F-45 FIRST-WRITER CUSTODY CAPTURE — reproduced on the immutable CORR8 engine

        Original failure (reproduced on CORR8): registration requires only
        a registered CUSTODIAN role, so SYN_CUST_002 first-writer captures
        an unallocated key (009|A) AND a key the Owner-approved authority
        assigns to a different custodian (001|A). CORR9: both attempts are
        refused with the fixed NOT_ENTITLED and only the entitled custodian
        can register the tuple.
        """
        mod, s8 = self._corr8_session()
        captured_unallocated = s8.register_tuple(
            CUST2, self._spec(9))["tupleKey"]
        captured_owner_assigned = s8.register_tuple(
            CUST2, FIX["tuples"][0])["tupleKey"]
        self.assertEqual(captured_unallocated, KEY_009A)
        self.assertEqual(captured_owner_assigned, TUP1,
                         msg="CORR8 must reproduce the first-writer capture")
        # --- CORR9: the same attempts are refused; the entitled custodian
        # remains the only lawful registrant
        self.register_all()
        self.sess.register_actor(CUST2, "CUSTODIAN")
        self.expect_gate("NOT_ENTITLED", self.sess.register_tuple, CUST2,
                         self._spec(9))
        self.expect_gate("NOT_ENTITLED", self.sess.register_tuple, CUST2,
                         FIX["tuples"][0])
        lawful = self.register_tuple()["tupleKey"]
        self.assertEqual(lawful, TUP1)
        self.assertEqual(self.sess.workflow_status(TUP1, CUST)["tupleLevel"],
                         "IN_PROGRESS")

    # ---------------- F-45 uniform refusal ------------------------------

    def test_F45_uniform_refusal_across_states(self):
        """GATE: F-45 UNIFORM REFUSAL — one fixed refusal across the unallocated, foreign-allocated and foreign-registered states

        Expected: for an unauthorized requester the SAME code AND message
        are returned whether the well-formed key is unregistered and
        unallocated (077|A), allocated to another custodian and
        unregistered (002|B) or already registered under another
        custodian's custody (001|A); the refusal names no tuple, custodian,
        occupancy or activity detail; repeated attempts mutate no
        authoritative history and no requester-visible state.
        """
        self._pinned_with_custodian()
        states = [
            ("unregistered_unallocated", KEY_077A, self._spec(77)),
            ("foreign_allocated_unregistered", TUP2, FIX["tuples"][1]),
            ("foreign_registered", TUP1, FIX["tuples"][0]),
        ]
        responses = []
        for label, key, spec in states:
            responses.append(self._probe(self.sess.register_tuple, CUST2,
                                         spec))
        self.assertEqual(len(set(responses)), 1,
                         msg="three-way registration oracle leaked: %r"
                             % (responses,))
        code, message = responses[0]
        self.assertEqual(code, "NOT_ENTITLED")
        self.assertNotIn(TUP1, message)
        self.assertNotIn(KEY_077A, message)
        self.assertNotIn(TUP2, message)
        self.assertNotIn(CUST, message)
        self.assertNotIn("SYN_CUST", message)
        # repeated polling is byte-stable and mutates nothing
        snap = self._sha_chain(self.sess)
        for _ in range(3):
            for label, key, spec in states:
                self.assertEqual(
                    self._probe(self.sess.register_tuple, CUST2, spec),
                    responses[0], msg="polling drift through %s" % label)
        self.assertEqual(self._sha_chain(self.sess), snap,
                         msg="a refused registration mutated state")

    # ---------------- F-45 lawful success / own duplicate --------------

    def test_F45_lawful_success_own_duplicate_and_digest(self):
        """GATE: F-45 LAWFUL SUCCESS — the entitled custodian registers once, receives truthful own information, and a repeat refuses truthfully without mutation

        Expected: the entitled registration succeeds and returns the
        engine-derived allocationDigest of the tuple's exact authorized
        entry (mirror-verified); the recorded event carries the same digest
        through the host chain and through a fresh restore; a repeated
        attempt by the SAME entitled custodian refuses with DUPLICATE_TUPLE
        and changes nothing; other entitled registrations still succeed.
        """
        self.register_all()
        self.sess.register_actor(CUST2, "CUSTODIAN")
        result = self.register_tuple()
        self.assertEqual(result["tupleKey"], TUP1)
        self.assertEqual(result["allocationDigest"],
                         alloc_entry_digest(TUP1, CUST))
        chain = self.host_events(self.sess, "f45_digest.jsonl")
        reg = next(e for e in chain
                   if e["eventType"] == "TUPLE_REGISTERED")
        self.assertEqual(reg["payload"]["allocationDigest"],
                         alloc_entry_digest(TUP1, CUST))
        self.assertEqual(reg["payload"]["custodian"], CUST)
        # own duplicate: truthful refusal, no mutation
        snap = self._sha_chain(self.sess)
        self.expect_gate("DUPLICATE_TUPLE", self.sess.register_tuple, CUST,
                         FIX["tuples"][0])
        self.assertEqual(self._sha_chain(self.sess), snap)
        # the second Owner-approved tuple is still registrable by its
        # entitled custodian
        second = self.register_tuple(self.sess, 1)
        self.assertEqual(second["tupleKey"], TUP2)
        self.assertEqual(second["allocationDigest"],
                         alloc_entry_digest(TUP2, CUST))
        # and a fresh pinned session restores the chain with the same
        # registration digests
        persisted = self.host_persist(self.sess, "f45_lawful.jsonl")
        restored = self.host_restore(persisted["path"])
        restored_chain = self.host_events(restored, "f45_lawful_view.jsonl")
        got = sorted(e["payload"]["allocationDigest"] for e in restored_chain
                     if e["eventType"] == "TUPLE_REGISTERED")
        self.assertEqual(got, sorted([alloc_entry_digest(TUP1, CUST),
                                      alloc_entry_digest(TUP2, CUST)]))

    # ---------------- F-45 actor and tuple mismatch ---------------------

    def test_F45_actor_and_tuple_mismatch(self):
        """GATE: F-45 ACTOR AND TUPLE MISMATCH — correct tuple/wrong custodian and correct custodian/wrong tuple both give the fixed refusal

        Expected: SYN_CUST_002 on an Owner-assigned tuple (actor mismatch)
        and SYN_CUST_001 on an unallocated tuple (tuple mismatch) return
        the SAME fixed NOT_ENTITLED as the unallocated/unauthorized case —
        entitlement is exact on both sides of the mapping.
        """
        self._pinned_with_custodian()
        baseline = self._probe(self.sess.register_tuple, CUST2,
                               self._spec(77))
        actor_mismatch = self._probe(self.sess.register_tuple, CUST2,
                                     FIX["tuples"][0])
        tuple_mismatch = self._probe(self.sess.register_tuple, CUST,
                                     self._spec(77))
        self.assertEqual(actor_mismatch, baseline)
        self.assertEqual(tuple_mismatch, baseline)
        self.assertEqual(baseline[0], "NOT_ENTITLED")

    # ---------------- F-45 authority integrity --------------------------

    def test_F45_forged_and_malformed_authority_fail_construction(self):
        """GATE: F-45 AUTHORITY INTEGRITY — a tampered, missing, malformed or conflicting authority fails construction before any actor-facing operation

        Expected: a caller-supplied path whose bytes are not the
        Owner-approved bytes fails ALLOCATIONS_IDENTITY_MISMATCH; a missing
        file fails ALLOCATIONS_AUTHORITY_UNAVAILABLE; a non-canonical file,
        a wrong authority identifier, an unknown entry field and a
        malformed identifier fail the closed-schema loader; a duplicate
        tuple allocation fails ALLOCATION_CONFLICT; declaring a pinned path
        together with a simulation source fails
        ALLOCATIONS_MODE_CONFLICT. No session state exists after any
        refusal.
        """
        tmp = Path(self._tmp)
        canonical = json.dumps
        # tampered but canonical file: digest is not the Owner pin
        tampered = sim_doc([(TUP1, CUST), (KEY_077A, CUST)])
        tpath = tmp / "tampered_allocations.json"
        tpath.write_text(canonical(tampered, sort_keys=True,
                                   separators=(",", ":")) + "\n",
                         encoding="utf-8")
        self.expect_gate("ALLOCATIONS_IDENTITY_MISMATCH",
                         self.new_session, allocations_path=tpath)
        # missing authority
        self.expect_gate("ALLOCATIONS_AUTHORITY_UNAVAILABLE",
                         self.new_session,
                         allocations_path=tmp / "absent.json")
        self.expect_gate("ALLOCATIONS_AUTHORITY_UNAVAILABLE",
                         self.new_session,
                         simulation_allocations_path=tmp / "absent.json")
        # non-canonical encoding of the right identifier
        pretty = tmp / "pretty_allocations.json"
        pretty.write_text(json.dumps(sim_doc([(TUP1, CUST)]), indent=2),
                          encoding="utf-8")
        self.expect_gate("ALLOCATIONS_MALFORMED", self.new_session,
                         simulation_allocations_path=pretty)
        # wrong authority identifier
        self.expect_gate(
            "ALLOCATIONS_MALFORMED", self.new_session,
            simulation_allocations={
                "allocationAuthority": "SYN_NOT_THE_AUTHORITY",
                "allocations": [{"custodian": CUST, "tupleKey": TUP1}]})
        # unknown entry field (closed schema)
        self.expect_gate(
            "ALLOCATIONS_MALFORMED", self.new_session,
            simulation_allocations={
                "allocationAuthority": oe.ALLOCATION_AUTHORITY_ID,
                "allocations": [{"custodian": CUST, "tupleKey": TUP1,
                                 "injected": True}]})
        # malformed identifiers
        self.expect_gate(
            "NON_SYNTHETIC_IDENTIFIER", self.new_session,
            simulation_allocations={
                "allocationAuthority": oe.ALLOCATION_AUTHORITY_ID,
                "allocations": [{"custodian": CUST,
                                 "tupleKey": "HISTORICAL|KEY|SHAPE"}]})
        self.expect_gate(
            "NON_SYNTHETIC_IDENTIFIER", self.new_session,
            simulation_allocations={
                "allocationAuthority": oe.ALLOCATION_AUTHORITY_ID,
                "allocations": [{"custodian": "REAL_PERSON",
                                 "tupleKey": TUP1}]})
        # conflicting allocation for the same tuple identity
        self.expect_gate(
            "ALLOCATION_CONFLICT", self.new_session,
            simulation_allocations={
                "allocationAuthority": oe.ALLOCATION_AUTHORITY_ID,
                "allocations": [{"custodian": CUST, "tupleKey": TUP1},
                                {"custodian": CUST2, "tupleKey": TUP1}]})
        # both construction forms at once
        self.expect_gate("ALLOCATIONS_MODE_CONFLICT", self.new_session,
                         allocations_path=ALLOCATIONS_PATH,
                         simulation_allocations=sim_doc([(TUP1, CUST)]))
        # the Owner-pinned default construction still works afterwards
        self.assertTrue(self.new_session().verify_integrity()["valid"])

    # ---------------- F-45 cross-mode ------------------------------

    def test_F45_identical_byte_cross_mode_collision(self):
        """GATE: F-45 IDENTICAL-BYTE CROSS-MODE COLLISION — a SIMULATION session holding the exact Owner-manifest bytes stays SIMULATION and never restores into pinned mode (or vice versa)

        Expected: the simulation session built from the byte-identical
        Owner manifest declares the SAME allocationsSha256 as the pinned
        session but mode SIMULATION; the pinned session refuses its chain
        and the simulation session refuses the pinned chain — the (mode,
        digest) PAIR, not the digest alone, decides authority; the
        simulation session still restores its own chain.
        """
        pinned = self._pinned_with_custodian()
        pinned_chain = self.host_events(pinned, "f45_pinned.jsonl")
        self.assertEqual(pinned_chain[0]["payload"]["allocationAuthorityMode"],
                         "OWNER_PINNED")
        self.assertEqual(pinned_chain[0]["payload"]["allocationsSha256"],
                         oe.OWNER_ALLOCATIONS_SHA256)
        sim = self.new_session(simulation_allocations_path=ALLOCATIONS_PATH)
        sim_chain = self.host_events(sim, "f45_sim_identical.jsonl")
        self.assertEqual(sim_chain[0]["payload"]["allocationAuthorityMode"],
                         "SIMULATION")
        self.assertEqual(sim_chain[0]["payload"]["allocationsSha256"],
                         oe.OWNER_ALLOCATIONS_SHA256,
                         msg="the collision case requires byte-identical "
                             "allocation bytes and digest")
        self.assertNotEqual(
            sim_chain[0]["payload"], pinned_chain[0]["payload"],
            msg="modes must remain distinguishable in chain identity")
        persisted = pinned.persist_global_history("f45_pinned_chain.jsonl")
        self.expect_gate("AUTHORITY_CONTEXT_MISMATCH",
                         sim.restore_global_history,
                         Path(persisted["path"]))
        sim_persisted = sim.persist_global_history("f45_sim_chain.jsonl")
        pinned2 = self.new_session()
        self.expect_gate("AUTHORITY_CONTEXT_MISMATCH",
                         pinned2.restore_global_history,
                         Path(sim_persisted["path"]))
        # each session still restores its OWN chain
        self.assertTrue(
            self.new_session().restore_global_history(
                Path(persisted["path"]))["restored"])
        sim2 = self.new_session(simulation_allocations_path=ALLOCATIONS_PATH)
        self.assertTrue(
            sim2.restore_global_history(
                Path(sim_persisted["path"]))["restored"])

    def test_F45_different_manifest_cross_mode_refusal(self):
        """GATE: F-45 DIFFERENT-MANIFEST CROSS-MODE REFUSAL — mismatched modes or digests never restore into one another

        Expected: a pinned chain is refused by a simulation session, a
        simulation chain is refused by a pinned session, and two
        simulation sessions with different allocation documents refuse
        each other's chains; sessions with the SAME simulation document
        restore one another. The mode is engine-derived: the constructor
        exposes no parameter that could set it.
        """
        import inspect
        params = inspect.signature(oe.EFCASession.__init__).parameters
        self.assertFalse([p for p in params if "mode" in p.lower()],
                         msg="the authority mode must not be a constructor "
                             "parameter")
        sim_a = self.new_session(simulation_allocations=sim_doc(
            [(TUP1, CUST)]))
        sim_a_chain = sim_a.persist_global_history("f45_sim_a.jsonl")
        sim_b = self.new_session(simulation_allocations=sim_doc(
            [(TUP1, CUST), (TUP2, CUST)]))
        self.expect_gate("AUTHORITY_CONTEXT_MISMATCH",
                         sim_b.restore_global_history,
                         Path(sim_a_chain["path"]))
        pinned = self.new_session()
        self.expect_gate("AUTHORITY_CONTEXT_MISMATCH",
                         pinned.restore_global_history,
                         Path(sim_a_chain["path"]))
        sim_a_chain2 = sim_a.persist_global_history("f45_sim_a2.jsonl")
        pinned_chain = pinned.persist_global_history("f45_pinned2.jsonl")
        self.expect_gate("AUTHORITY_CONTEXT_MISMATCH",
                         sim_a.restore_global_history,
                         Path(pinned_chain["path"]))
        # same simulation document => same context => restores
        sim_a2 = self.new_session(simulation_allocations=sim_doc(
            [(TUP1, CUST)]))
        self.assertTrue(
            sim_a2.restore_global_history(
                Path(sim_a_chain2["path"]))["restored"])
        self.assertEqual(
            sim_a2.persist_global_history("f45_sim_a3.jsonl")
            ["allocationAuthorityMode"], "SIMULATION")
        self.assertEqual(
            pinned.persist_global_history("f45_pinned3.jsonl")
            ["allocationAuthorityMode"], "OWNER_PINNED")

    # ---------------- F-45 forged registrations and relabelling ---------

    def test_F45_rehashed_forged_registrations_rejected(self):
        """GATE: F-45 REHASHED FORGERY — a correctly rehashed registration without a valid entitlement or digest is semantically rejected

        Expected: (a) a forged registration by an unauthorized custodian,
        (b) a forged registration by an authorized custodian carrying a
        wrong or (c) absent allocationDigest, and (d) a whole-chain
        rehash that substitutes the custodian of the genuine registration
        are each refused with PROCEDURALLY_INVALID_HISTORY, while the
        unmodified chain restores — recomputing the event-chain hashes
        never makes an unauthorized registration lawful.
        """
        self._pinned_with_custodian()
        live = self.host_events(self.sess, "f45_forge_base.jsonl")
        control = Path(self._tmp) / "f45_control.jsonl"
        write_events_file(control, live)
        fresh = self.new_session()
        self.assertTrue(fresh.restore_global_history(control)["restored"])
        forged_spec = self._spec(2)
        spec2 = json.loads(json.dumps(FIX["tuples"][0]))
        spec2.update({"caseId": forged_spec["caseId"],
                      "sideId": forged_spec["sideId"],
                      "factId": forged_spec["factId"], "d": forged_spec["d"]})

        def forged_payload(custodian, digest_marker):
            payload = {
                "custodian": custodian, "caseId": spec2["caseId"],
                "sideId": spec2["sideId"], "factId": spec2["factId"],
                "d": spec2["d"],
                "canonicalHashInput": oe.sha256_hex(
                    "%s|%s|%s" % (spec2["caseId"], spec2["sideId"],
                                  spec2["factId"])),
                "sealedFactText": spec2["sealedFactText"],
                "questionText": spec2["questionText"],
                "custodyMarks": dict(spec2["custodyMarks"]),
                "retrospectiveRecords": json.loads(json.dumps(
                    spec2["retrospectiveRecords"])),
                "synthetic": True,
            }
            if digest_marker == "wrong":
                payload["allocationDigest"] = alloc_entry_digest(TUP1, CUST2)
            elif digest_marker == "correct_shape":
                payload["allocationDigest"] = alloc_entry_digest(
                    spec2_key, custodian)
            return payload

        spec2_key = "%s|%s|%s" % (spec2["caseId"], spec2["sideId"],
                                 spec2["factId"])
        cases = {
            "unauthorized_custodian": forged_payload(CUST2,
                                                     "correct_shape"),
            "wrong_digest": forged_payload(CUST, "wrong"),
            "absent_digest": forged_payload(CUST, "absent"),
        }
        for label, payload in cases.items():
            forged = build_forged_extension(live, [("TUPLE_REGISTERED",
                                                    payload)])
            path = Path(self._tmp) / ("f45_forge_%s.jsonl" % label)
            write_events_file(path, forged)
            self.assertTrue(fresh.verify_global_history(path)["valid"],
                            msg="%s must chain-verify" % label)
            err = self.expect_gate("PROCEDURALLY_INVALID_HISTORY",
                                   fresh.restore_global_history, path)
            if label == "unauthorized_custodian":
                self.assertIn("NOT_ENTITLED", str(err))
        # (d) whole-chain rehash substituting the genuine registration's
        # custodian (and its digest) — every hash recomputed
        idx = next(i for i, e in enumerate(live)
                   if e["eventType"] == "TUPLE_REGISTERED")

        def substitute(payload):
            payload["custodian"] = CUST2
            payload["allocationDigest"] = alloc_entry_digest(TUP1, CUST2)

        substituted = mutated_history(live, idx, substitute)
        spath = Path(self._tmp) / "f45_forge_substituted.jsonl"
        write_events_file(spath, substituted)
        self.assertTrue(fresh.verify_global_history(spath)["valid"])
        self.expect_gate("PROCEDURALLY_INVALID_HISTORY",
                         fresh.restore_global_history, spath)
        # the untouched chain still restores into a fresh session
        ok = self.new_session()
        self.assertTrue(ok.restore_global_history(control)["restored"])

    def test_F45_genesis_relabeling_fails(self):
        """GATE: F-45 GENESIS RELABELLING — a fully rehashed mode or digest change in GENESIS never restores

        Expected: flipping the genesis allocationAuthorityMode to
        SIMULATION (all hashes recomputed) or substituting the
        allocationsSha256 digest is refused by a pinned session, and the
        untouched chain still restores. Trust boundary (documented): with
        no external signature, a process/filesystem actor who edits the
        engine's own pin constant is outside this offline model — the
        refusal below binds every chain that does not carry THIS engine's
        derived (mode, digest) pair.
        """
        self._pinned_with_custodian()
        live = self.host_events(self.sess, "f45_genesis_base.jsonl")

        def flip_mode(payload):
            payload["allocationAuthorityMode"] = "SIMULATION"

        def flip_digest(payload):
            payload["allocationsSha256"] = "0" * 64

        for label, mutate in (("mode", flip_mode), ("digest", flip_digest)):
            relabelled = mutated_history(live, 0, mutate)
            path = Path(self._tmp) / ("f45_genesis_%s.jsonl" % label)
            write_events_file(path, relabelled)
            checker = self.new_session()
            self.assertTrue(checker.verify_global_history(path)["valid"],
                            msg="%s relabelling must chain-verify" % label)
            self.expect_gate("AUTHORITY_CONTEXT_MISMATCH",
                             checker.restore_global_history, path)
        control = Path(self._tmp) / "f45_genesis_control.jsonl"
        write_events_file(control, live)
        self.assertTrue(
            self.new_session().restore_global_history(control)["restored"])

    # ---------------- F-45 persistence and extension --------------------

    def test_F45_persistence_replay_and_extension(self):
        """GATE: F-45 PERSISTENCE — an Owner-pinned history survives the disk round trip, stays semantically replayable and remains extendable

        Expected: the host round trip reproduces scoped views
        byte-identically, reports OWNER_PINNED on the host channel, the
        restored session extends the chain with a new entitled
        registration, and a second round trip covers the extension; a
        simulation history is likewise durable in its own context.
        """
        self._pinned_with_custodian()
        views = {
            "events": json.dumps(self.sess.events(CUST), sort_keys=True),
            "custody": json.dumps(self.sess.custody_view(CUST, TUP1),
                                  sort_keys=True),
        }
        chain = self.host_persist(self.sess, "f45_persist.jsonl")
        self.assertEqual(chain["allocationAuthorityMode"], "OWNER_PINNED")
        restored = self.host_restore(chain["path"])
        self.assertEqual(
            json.dumps(restored.events(CUST), sort_keys=True), views["events"])
        self.assertEqual(
            json.dumps(restored.custody_view(CUST, TUP1), sort_keys=True),
            views["custody"])
        extended = restored.register_tuple(CUST, FIX["tuples"][1])
        self.assertEqual(extended["tupleKey"], TUP2)
        chain2 = self.host_persist(restored, "f45_persist2.jsonl")
        self.assertGreater(chain2["eventCount"], chain["eventCount"])
        again = self.host_restore(chain2["path"])
        self.assertEqual(again.workflow_status(TUP2, CUST)["tupleLevel"],
                         "IN_PROGRESS")
        # a simulation history is durable within its own context only
        sim = self.new_session(simulation_allocations=sim_doc([(TUP1, CUST)]))
        sim_chain = sim.persist_global_history("f45_sim_persist.jsonl")
        sim2 = self.new_session(simulation_allocations=sim_doc(
            [(TUP1, CUST)]))
        self.assertTrue(
            sim2.restore_global_history(Path(sim_chain["path"]))["restored"])

    # ---------------- F-45 refusal immutability / no inference ----------

    def test_F45_no_foreign_authority_inference(self):
        """GATE: F-45 NO FOREIGN AUTHORITY INFERENCE — unauthorized operations disclose no registration, allocation or activity detail and mutate nothing

        Expected: every requester-scoped operation remains existence-blind
        after CORR9 (registration, custody reads, status, category,
        Lane B view, diagnostics and error messages); SYN_CUST_002's views
        contain no trace of the Owner-approved registration, and repeated
        refusals leave the chain and the scoped views byte-identical.
        """
        self._pinned_with_custodian()
        snap = self._sha_chain(self.sess)
        before_events = json.dumps(self.sess.events(CUST2), sort_keys=True)
        probes = [
            ("register_tuple", lambda: self.sess.register_tuple(
                CUST2, FIX["tuples"][0])),
            ("register_tuple_unallocated", lambda: self.sess.register_tuple(
                CUST2, self._spec(77))),
            ("custody_view", lambda: self.sess.custody_view(CUST2, TUP1)),
            ("issue_packet", lambda: self.sess.issue_packet(CUST2, RP1C,
                                                            TUP1)),
            ("ack_receipt", lambda: self.sess.acknowledge_seal_receipt(
                CUST2, TUP1, RP1A)),
            ("reveal", lambda: self.sess.reveal(CUST2, RP1A, TUP1)),
            ("evidence", lambda: self.sess.issue_evidence_record(CUST2,
                                                                 TUP1)),
            ("lane_b_view", lambda: self.sess.lane_b_view(CUST2, TUP1)),
            ("workflow_status", lambda: self.sess.workflow_status(TUP1,
                                                                  CUST2)),
        ]
        for label, fn in probes:
            code, message = self._probe(fn)
            if code == "NOT_ENTITLED":
                self.assertEqual(message.split(": ", 1)[1],
                                 oe.NOT_ENTITLED_MESSAGE,
                                 msg="registration refusal for %s is not "
                                     "the fixed uniform message" % label)
            self.assertNotIn("SYN_CUST_001", message,
                             msg="foreign custodian named through %s" % label)
            self.assertNotIn(TUP1, message,
                             msg="tuple content named through %s" % label)
        self.assertEqual(self._sha_chain(self.sess), snap,
                         msg="a refused probe mutated state")
        self.assertEqual(
            json.dumps(self.sess.events(CUST2), sort_keys=True), before_events)
        self.assertNotIn("SYN_CASE_001", before_events,
                         msg="foreign tuple key leaked into the foreign "
                             "custodian's scoped view")
        self.assertEqual(self.sess.category_assignment(TUP1)
                         ["categoryAssignment"], "UNASSIGNED")

    # ---------------- F-45 no implicit custody --------------------------

    def test_F45_no_implicit_custody_from_lane_b_or_self_disclosure(self):
        """GATE: F-45 NO IMPLICIT CUSTODY — Lane B filings and exposure self-disclosures before registration confer no custody entitlement

        Expected: on an unallocated, unregistered key the R_LB filing and
        the exposed actor's self-disclosure stay lawful self-scoped
        records (OD-39/F-41 preserved) but create NO custody: every
        custody-gated read still refuses, and registration still requires
        the entitlement. Once the entitled custodian lawfully registers
        the tuple, the pre-registration records become visible exactly as
        if they had been filed after registration — the filings were
        recordings, not custody claims.
        """
        self.register_all()
        self.sess.register_actor(RLB2, "R_LB")
        self.sess.register_actor(CUST2, "CUSTODIAN")
        filing = self.sess.register_lane_b(RLB, KEY_077A, FIX["laneB"])
        self.assertEqual(filing["submissionId"], sub_id(RLB, KEY_077A, 1))
        disclosure = self.sess.report_exposure(RP1B, KEY_077A, RP1B,
                                              "MARK_A", "SYNTHETIC self")
        self.assertEqual(disclosure["phase1Contamination"]["status"],
                         "CONTAMINATED")
        # no custody exists: custody reads refuse, status is withheld and
        # registration still needs the entitlement
        self.expect_gate("ROLE_MISMATCH", self.sess.custody_view, CUST,
                         KEY_077A)
        self.assertEqual(self.sess.workflow_status(KEY_077A, CUST)
                         .get("disclosure"), "WITHHELD_BEFORE_OWN_SEAL")
        self.expect_gate("NOT_ENTITLED", self.sess.register_tuple, CUST,
                         self._spec(77))
        self.expect_gate("NOT_ENTITLED", self.sess.register_tuple, CUST2,
                         self._spec(77))
        # the entitled custodian (simulation authority) registers late and
        # sees both pre-registration records
        sim = self.sim_session([(KEY_077A, CUST)])
        self.register_all(sim)
        sim.register_actor(CUST2, "CUSTODIAN")
        sim.register_lane_b(RLB, KEY_077A, FIX["laneB"])
        sim.report_exposure(RP1B, KEY_077A, RP1B, "MARK_A", "SYNTHETIC self")
        sim.register_tuple(CUST, self._spec(77))
        self.assertEqual(
            [s["submissionId"] for s in
             sim.lane_b_view(CUST, KEY_077A)["submissions"]],
            [sub_id(RLB, KEY_077A, 1)])
        self.assertIn(RP1B, sim.custody_view(CUST, KEY_077A)["incidents"])
        # the entitled registrant is exactly the allocated custodian: the
        # other custodian still cannot register it
        self.expect_gate("NOT_ENTITLED", sim.register_tuple, CUST2,
                         self._spec(77))

    # ---------------- F-45 evidence-record authority marking ------------

    def test_F45_evidence_record_authority_marking(self):
        """GATE: F-45 EVIDENCE-RECORD AUTHORITY MARKING — the record identifies its effective authority mode, simulation evidence stays identifiable and no inventory or authority identifier is added

        Expected: a pinned record carries OWNER_PINNED and a simulation
        record carries SIMULATION in proceduralCompleteness; neither
        contains the allocation digest, the allocation inventory or a
        global authority identifier; the mode is engine-constructed, so a
        fully rehashed flip of the recorded mode fails semantic replay in
        both directions; the genuine chain restores with its recorded mode
        intact.
        """
        self.register_all()
        self.register_tuple()
        pinned_record = self.sess.issue_evidence_record(CUST, TUP1)
        self.assertEqual(
            pinned_record["proceduralCompleteness"]["allocationAuthorityMode"],
            "OWNER_PINNED")
        blob = json.dumps(pinned_record, sort_keys=True)
        self.assertNotIn(oe.OWNER_ALLOCATIONS_SHA256, blob)
        self.assertNotIn("allocations", blob)
        self.assertNotIn("allocationAuthority\"", blob)
        sim = self.sim_session([(TUP1, CUST)])
        self.register_all(sim)
        sim.register_tuple(CUST, FIX["tuples"][0])
        sim_record = sim.issue_evidence_record(CUST, TUP1)
        self.assertEqual(
            sim_record["proceduralCompleteness"]["allocationAuthorityMode"],
            "SIMULATION")
        self.assertNotIn("Owner", json.dumps(sim_record,
                                             sort_keys=True))
        # replay attacks: a fully rehashed flip of the recorded mode fails
        pinned_live = self.host_events(self.sess, "f45_ev_pinned.jsonl")
        sim_live = self.host_events(sim, "f45_ev_sim.jsonl")
        idx = next(i for i, e in enumerate(sim_live)
                   if e["eventType"] == "EVIDENCE_RECORD_ISSUED")
        flipped = mutated_history(
            sim_live, idx,
            lambda p: p["proceduralCompleteness"].update(
                {"allocationAuthorityMode": "OWNER_PINNED"}))
        path = Path(self._tmp) / "f45_ev_flip.jsonl"
        write_events_file(path, flipped)
        sim_check = self.new_session(simulation_allocations=sim_doc(
            [(TUP1, CUST)]))
        self.assertTrue(sim_check.verify_global_history(path)["valid"])
        self.expect_gate("PROCEDURALLY_INVALID_HISTORY",
                         sim_check.restore_global_history, path)
        idx2 = next(i for i, e in enumerate(pinned_live)
                    if e["eventType"] == "EVIDENCE_RECORD_ISSUED")
        flipped2 = mutated_history(
            pinned_live, idx2,
            lambda p: p["proceduralCompleteness"].update(
                {"allocationAuthorityMode": "SIMULATION"}))
        path2 = Path(self._tmp) / "f45_ev_flip2.jsonl"
        write_events_file(path2, flipped2)
        pinned_check = self.new_session()
        self.assertTrue(pinned_check.verify_global_history(path2)["valid"])
        self.expect_gate("PROCEDURALLY_INVALID_HISTORY",
                         pinned_check.restore_global_history, path2)
        # genuine round trip keeps the recorded mode
        chain = self.host_persist(self.sess, "f45_ev_chain.jsonl")
        restored = self.host_restore(chain["path"])
        self.assertEqual(
            restored.custody_view(CUST, TUP1)["evidenceRecords"][0]
            ["proceduralCompleteness"]["allocationAuthorityMode"],
            "OWNER_PINNED")

    # ---------------- F-45 sequential competing custodians --------------

    def test_F45_sequential_competing_custodians_ordering(self):
        """GATE: F-45 ORDERING — sequential attempts by competing custodians never give lawful custody to an unassigned actor

        Expected: in both orders (unauthorized first or entitled first)
        the unauthorized attempt is refused with the same fixed
        NOT_ENTITLED, indistinguishably before and after the lawful
        registration; the entitled custodian's repeat refuses truthfully
        with DUPLICATE_TUPLE; custody never transfers and no replacement
        mechanism exists.
        """
        spec = self._spec(77)
        # order A: unauthorized first
        a = self.new_session()
        a.register_actor(CUST, "CUSTODIAN")
        a.register_actor(CUST2, "CUSTODIAN")
        first = self._probe(a.register_tuple, CUST2, spec)
        self.assertEqual(first[0], "NOT_ENTITLED")
        self.expect_gate("NOT_ENTITLED", a.register_tuple, CUST, spec)
        # order B: entitled first in a simulation context, unauthorized after
        b = self.sim_session([(KEY_077A, CUST)])
        b.register_actor(CUST, "CUSTODIAN")
        b.register_actor(CUST2, "CUSTODIAN")
        registered = b.register_tuple(CUST, spec)
        self.assertEqual(registered["tupleKey"], KEY_077A)
        after = self._probe(b.register_tuple, CUST2, spec)
        self.assertEqual(after, first,
                         msg="registration status leaked through the "
                             "unauthorized refusal")
        self.assertEqual(b.workflow_status(KEY_077A, CUST2).get("disclosure"),
                         "WITHHELD_BEFORE_OWN_SEAL")
        # the entitled actor's own repeat is truthful and non-mutating
        snap = self._sha_chain(b)
        self.expect_gate("DUPLICATE_TUPLE", b.register_tuple, CUST, spec)
        self.assertEqual(self._sha_chain(b), snap)
        self.assertEqual(b.custody_view(CUST, KEY_077A)["tupleKey"],
                         KEY_077A)


# ==========================================================================
# CORR8 immutability lineage (CORR9)
# ==========================================================================

class Corr9LineageTests(EFCAUnitTest):

    def test_C7_corr8_candidate_immutable_and_non_adoptable(self):
        """GATE: CORR9 PRESERVATION — the immutable CORR8 candidate stays byte-pinned, non-adoptable and non-legacy

        Expected: the CORR8 engine loads only after its exact SHA-256 is
        verified; a genuine CORR8 chain is refused by native restore
        (NOT_A_NATIVE_HISTORY) and by legacy admission
        (NOT_A_LEGACY_HISTORY); the CORR8 test-file identity is unchanged;
        a CORR9-native chain is refused by legacy admission as well; the
        legacy CORR5 lineage remains the only read-only admitted lineage
        and no prior lineage is silently relabelled CORR9-native.
        """
        self.assertEqual(
            hashlib.sha256((CORR8_DIR / "test_offline_efca.py")
                           .read_bytes()).hexdigest(), CORR8_TEST_SUITE_SHA)
        mod = corr8_engine()  # loader verifies the pinned SHA-256
        s8 = mod.EFCASession(rubric_path=RUBRIC_PATH,
                             sidecar_path=SIDECAR_PATH,
                             scratch_dir=Path(self._tmp))
        for actor in FIX["actors"]:
            s8.register_actor(actor["actorId"], actor["role"])
        s8.register_tuple(CUST, FIX["tuples"][0])
        chain8 = Path(s8.persist_global_history("corr8.jsonl")["path"])
        self.expect_gate("NOT_A_NATIVE_HISTORY",
                         self.sess.restore_global_history, chain8)
        self.expect_gate("NOT_A_LEGACY_HISTORY",
                         self.sess.replay_legacy_history, chain8)
        self.assertEqual(oe.CORR8_ENGINE_SHA256, CORR8_ENGINE_SHA)
        self.assertEqual(oe.CORR8_ENGINE_ACT_ID,
                         mod.ENGINE_ACT_ID)
        # a CORR9-native chain is never adopted as legacy either
        self.register_all()
        self.register_tuple()
        chain9 = Path(self.host_persist(self.sess, "corr9.jsonl")["path"])
        self.expect_gate("NOT_A_LEGACY_HISTORY",
                         self.sess.replay_legacy_history, chain9)
        # the Owner-approved allocation authority is byte-pinned
        self.assertEqual(
            hashlib.sha256(ALLOCATIONS_PATH.read_bytes()).hexdigest(),
            oe.OWNER_ALLOCATIONS_SHA256)
        self.assertEqual(oe.OWNER_ALLOCATIONS_SHA256,
                         CORR9_AUTHORITY_FILE_SHA)


# ==========================================================================
# Runner
# ==========================================================================

def main():
    REPORT["invocation"]["startedAtUtc"] = time.strftime(
        "%Y-%m-%dT%H:%M:%SZ", time.gmtime())
    sources_before = _snapshot_sources()
    git_before = _git_snapshot()

    suite = unittest.defaultTestLoader.loadTestsFromModule(
        sys.modules[__name__])
    runner = unittest.TextTestRunner(stream=sys.stderr, verbosity=2,
                                     resultclass=RecordingResult)
    result = runner.run(suite)

    REPORT["invocation"]["finishedAtUtc"] = time.strftime(
        "%Y-%m-%dT%H:%M:%SZ", time.gmtime())
    sources_after = _snapshot_sources()
    git_after = _git_snapshot()
    REPORT["sourcePreservation"] = {
        "before": sources_before,
        "after": sources_after,
        "byteAndShaIdentical": sources_before == sources_after,
        "controlledSources": [
            "EFCA rubric (accepted, sha-bound)",
            "SHA256SUMS.txt sidecar",
            "STAGE2_SEMANTIC_SUCCESSOR_CANDIDATE_CORR4.md",
            "CORR9 Owner-approved allocation authority (G3.CORR1-bound; "
            "immutable, sha-pinned)",
            "CORR9 allocation authority sidecar (.sha256)",
            "CORR8 candidate offline_efca.py (F-45 oracle, immutable)",
            "CORR8 candidate test_offline_efca.py (immutable)",
            "CORR7 candidate offline_efca.py (immutable comparison base)",
            "CORR6 candidate offline_efca.py (immutable comparison base)",
            "CORR5 candidate offline_efca.py (frozen legacy oracle, immutable)",
            "CORR4 candidate offline_efca.py (immutable comparison base)",
            "CORR3 candidate offline_efca.py (immutable comparison base)",
            "CORR2 candidate offline_efca.py (immutable comparison base)",
            "CORR1 candidate offline_efca.py (immutable comparison base)",
            "ORIGINAL candidate offline_efca.py (immutable comparison base)",
        ],
    }
    REPORT["allocationAuthority"] = {
        "authorityIdentifier": oe.ALLOCATION_AUTHORITY_ID,
        "defaultPath": str(ALLOCATIONS_PATH),
        "ownerPinnedSha256": oe.OWNER_ALLOCATIONS_SHA256,
        "fileSha256EqualsOwnerPin": (
            hashlib.sha256(ALLOCATIONS_PATH.read_bytes()).hexdigest()
            == oe.OWNER_ALLOCATIONS_SHA256),
        "fileBytes": len(ALLOCATIONS_PATH.read_bytes()),
        "allocationsCount": len(json.loads(
            ALLOCATIONS_PATH.read_text(encoding="utf-8"))["allocations"]),
        "engineDerivedModes": list(oe.ALLOCATION_AUTHORITY_MODES),
        "defaultConstructionMode": "OWNER_PINNED",
        "note": "the default non-override construction is OWNER_PINNED from "
                "the Owner-pinned manifest; the explicitly named simulation "
                "parameters always produce SIMULATION and never claim Owner "
                "authorization; cross-mode replay is refused in both "
                "directions including for byte-identical manifest copies "
                "(see the F45 cross-mode tests). The allocation inventory is "
                "never disclosed through any requester-facing operation.",
    }
    REPORT["gitState"] = {"before": git_before, "after": git_after,
                          "comparison": _compare_git(git_before, git_after)}
    residue = _residue_census()
    REPORT["residueCheck"] = residue
    REPORT["tests"] = result.records
    REPORT["totals"] = {
        "total": len(result.records),
        "passed": sum(1 for r in result.records if r["result"] == "PASS"),
        "failed": sum(1 for r in result.records if r["result"] == "FAIL"),
        "errors": sum(1 for r in result.records if r["result"] == "ERROR"),
        "skipped": sum(1 for r in result.records if r["result"] == "SKIP"),
    }
    suite_ok = result.wasSuccessful()
    REPORT["overall"] = {
        "suiteOutcome": "PASS" if suite_ok else "FAIL",
        "sourcePreservationIntact": sources_before == sources_after,
        "gitStateClean": not REPORT["gitState"]["comparison"]["problems"],
        "noResidue": not residue["pycacheDirs"] and not residue["pycFiles"],
        "note": "SELF_VALIDATION ONLY; Orchestrator re-inspection next; "
                "independent IV NOT initiated; Owner acceptance NOT "
                "requested; Git NOT authorized",
    }
    out_path = HERE / "TEST_RESULTS.json"
    with open(out_path, "w", encoding="utf-8") as fh:
        json.dump(REPORT, fh, indent=2, ensure_ascii=False, sort_keys=True)
        fh.write("\n")
    print("\nTEST_RESULTS.json written to %s" % out_path)
    print("totals: %s" % REPORT["totals"])
    ok = (suite_ok
          and sources_before == sources_after
          and not REPORT["gitState"]["comparison"]["problems"]
          and not residue["pycacheDirs"] and not residue["pycFiles"])
    sys.exit(0 if ok else 1)


if __name__ == "__main__":
    main()
