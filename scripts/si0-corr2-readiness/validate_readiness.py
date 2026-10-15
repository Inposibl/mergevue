# Synthetic offline self-validation for SI0-CORR2-EXECUTION-READINESS-1.CORR2.
# This script is not an independent audit and does not execute SI-0.

import copy
import hashlib
import importlib.util
import json
import os

_SPEC = importlib.util.spec_from_file_location(
    "si0_readiness",
    os.path.join(os.path.dirname(os.path.abspath(__file__)), "si0_readiness.py"),
)
s = importlib.util.module_from_spec(_SPEC)
_SPEC.loader.exec_module(s)

ROOT = os.path.dirname(os.path.abspath(__file__))
REPO = (
    "/Users/entp_psyche/Desktop/InvestProjects2026/"
    "MergeVue PayProduct (june 2026)/MergeVue-M&A (August 2026)"
)
PROTOCOL = os.path.join(
    REPO, "docs/governance/MERGEVUE_SI0_COMPACT_PROTOCOL_v1.0_CORR2_ACCEPTED.md"
)
DECISIONS = os.path.join(
    REPO, "docs/governance/MERGEVUE_SI0_CORR2_OWNER_DECISIONS_AND_DISPOSITION_2026-10-14.md"
)
ADDENDUM = os.path.join(
    REPO, "docs/governance/MERGEVUE_CONTROL_TREE_SI0_CORR2_ADDENDUM_2026-10-14.md"
)
EFCA = os.path.join(
    REPO,
    "WORKBENCH/AUDITS/STAGE2_CORR4_L4_EFCA_OWNER_ACCEPTANCE_BINDING_1/"
    "EFCA_CORR2_CORR2_CORR1_CORR1_CORR1_CORR1_GPT6_AUTHOR_CANDIDATE.md",
)


class Script:
    def __init__(self, steps):
        self.steps = list(steps)
        self.calls = 0
        self.seen = []

    def issue(self, payload):
        self.calls += 1
        self.seen.append(payload)
        if not self.steps:
            raise AssertionError("transport script exhausted")
        step = self.steps.pop(0)
        if isinstance(step, Exception):
            raise step
        return step


def allowlist():
    names = sorted(os.listdir(ROOT))
    if names != list(s.ALLOWLIST):
        raise AssertionError(names)


def expect(name, code, fn):
    try:
        fn()
    except s.Refusal as exc:
        if exc.code != code:
            raise AssertionError("%s: expected %s got %s (%s)" % (name, code, exc.code, exc.detail))
        print("PASS", name)
        return
    raise AssertionError("%s: expected %s" % (name, code))


def check(name, fn):
    fn()
    print("PASS", name)


def read_bytes(path):
    with open(path, "rb") as handle:
        return handle.read()


def questions_for(g):
    return {domain: "Does the sealed note mention %s?" % domain for domain in g["DS"]}


def fact_for(number, domain):
    return "Synthetic fact %d keeps marker %s in the note." % (number, domain)


def blind_s2(packet, output="YES"):
    opposite = "NO" if output == "YES" else "YES"
    return {
        "packetId": packet["packetId"],
        "readings": [
            {
                "readingId": "r1",
                "output": output,
                "questionAnchor": "sealed note",
                "factAnchor": "Synthetic fact" if output == "YES" else "",
                "gloss": "synthetic",
                "status": "ADMISSIBLE",
                "exclusion": None,
            }
        ],
        "flipExclusions": [
            {
                "flipClass": "opposite class",
                "flipOutput": opposite,
                "questionAnchor": "sealed note",
                "criterion": "a",
                "quote": "sealed note",
            }
        ],
        "state": "S2",
        "output": output,
        "constructNote": None,
    }


def confirm(packet, other):
    endorsements = ["other:fx:%d" % index for index in range(len(other["flipExclusions"]))]
    endorsements.extend(
        "other:rd:" + reading["readingId"]
        for reading in other["readings"]
        if reading["status"] == "EXCLUDED"
    )
    return {
        "packetId": packet["packetId"],
        "verdict": "CONFIRM",
        "endorsements": endorsements,
        "challenges": [],
    }


def jsonl(g, records):
    return b"".join(s.canonical_line_bytes(g, record) for record in records)


def stage1_of(packets):
    found = {}
    for packet in packets:
        key = "|".join((packet["caseId"], packet["sideId"], packet["factId"]))
        found[key] = packet["factText"]
    return found


def qual_material(g, slot, number_base, output="YES"):
    questions = questions_for(g)
    packets = []
    records = []
    bank = {}
    domain = "D-01"
    for index in range(10):
        text = fact_for(number_base + index, domain)
        packet, _key = s.build_packet(
            g, "QUAL", slot, "IGNORED", "IGNORED", "Q-%02d" % (index + 1),
            text, domain, questions[domain],
        )
        packets.append(packet)
        records.append(blind_s2(packet, output))
        bank[packet["factId"]] = {"factText": text, "d": domain, "output": "YES"}
    return packets, records, {"slot": slot, "questions": questions, "bank": bank}


def main_ctx(g, slot, packets):
    return {"slot": slot, "questions": questions_for(g), "stage1": stage1_of(packets)}


def snapshot(run):
    return {
        "calls": None if run.transport is None else run.transport.calls,
        "journal": run.journal.text(),
        "sessions": tuple(sorted(run.sessions)),
        "attempts": dict(run.issued_attempt),
        "fb": None if run.fb is None else (run.fb["sha"], run.fb["bytes"]),
        "ref": None if run.fref is None else (run.fref["sha"], run.fref["bytes"]),
        "records": tuple(sorted(
            (key, rec["sha"], rec["contaminated"]) for key, rec in run.records.items()
        )),
        "qual": tuple(sorted(
            (slot, state["status"], state["used"], state["passSession"])
            for slot, state in run.qual.items()
        )),
    }


def assert_unchanged(before, run, transport=None):
    after = snapshot(run)
    if transport is not None:
        after["calls"] = transport.calls
        before = dict(before)
        before["calls"] = before["calls"]
    if after != before:
        raise AssertionError("refusal changed scientific or custody state")


def decision_case(g, tuple_key, label):
    case_id, side_id, _fact_id, domain = tuple_key.split("|")
    cells = {}
    for stratum in g["STRATA"]:
        cell = "%s|%s|%s|%s" % (stratum, domain, case_id, side_id)
        cells[cell] = [tuple_key] if stratum == "NN" else []
    requirement = label if label in ("Y", "N") else "N"
    return {
        "labels": {tuple_key: label},
        "X": [tuple_key],
        "clauses": [
            {
                "id": "LIT:" + tuple_key,
                "type": "LIT",
                "tuples": [tuple_key],
                "req": requirement,
            }
        ],
        "stratum": {tuple_key: "NN"},
        "cells": cells,
        "route": "EXTERNAL",
        "h21": {},
        "process": {"F-PS-04": g["SUR"], "F-PS-07": g["SUR"]},
        "pre": {name: True for name in s.PRECONDITIONS},
        "scope": "DECISION",
    }


def main():
    allowlist()
    print("PASS", "allowlist-before")
    g = s.load_annex_g(PROTOCOL)
    print("PASS", "annex-g-load-run-all")
    questions = questions_for(g)
    app = s.build_app(g, questions)
    brief = b"SYNTHETIC BRIEF\n"

    def test_pins():
        entries = [
            {"path": PROTOCOL, "bytes": read_bytes(PROTOCOL), "sha256": s.PROTOCOL_SHA, "byteCount": s.PROTOCOL_BYTES},
            {"path": DECISIONS, "bytes": read_bytes(DECISIONS), "sha256": s.DECISIONS_SHA, "byteCount": s.DECISIONS_BYTES},
            {"path": ADDENDUM, "bytes": read_bytes(ADDENDUM), "sha256": s.ADDENDUM_SHA, "byteCount": s.ADDENDUM_BYTES},
            {"path": EFCA, "bytes": read_bytes(EFCA), "sha256": s.EFCA_SHA, "byteCount": s.EFCA_BYTES},
        ]
        checked = s.check_source_identity(entries)
        if [row["sha256"] for row in checked] != [s.PROTOCOL_SHA, s.DECISIONS_SHA, s.ADDENDUM_SHA, s.EFCA_SHA]:
            raise AssertionError(checked)
        if s.RES_03 != "OPTION_A" or s.HISTORICAL_VERDICT != "FAIL":
            raise AssertionError("verdict pins")
        if s.OD_B != "DECISION" or s.OD_C != "EXTERNAL" or s.X_DEC != 3536:
            raise AssertionError("population pins")
        if s.EXECUTION_AUTHORIZED is not False:
            raise AssertionError("execution pin")

    def test_bad_identity():
        s.check_source_identity([{"path": "mem", "bytes": b"abc", "sha256": "0" * 64}])

    def test_session_formula():
        packet, _key = s.build_packet(g, "MAIN", "R1", "SYN", "S", "F0", fact_for(0, "D-01"), "D-01", questions["D-01"])
        raw = s.session_input_bytes("MAIN", brief, app, [packet], g)
        again = s.session_input_bytes("MAIN", brief, app, [packet], g)
        expect_bytes = brief + b"\n" + app.encode("utf-8") + s.canonical_line_bytes(g, packet)
        if raw != expect_bytes or again != raw:
            raise AssertionError("session bytes")
        if s.sha256_bytes(raw) != s.sha256_bytes(again):
            raise AssertionError("session sha")
        chal = s.session_input_bytes("CHAL", b"BB\n", app, [packet], g)
        if b"SYNTHETIC BRIEF" in chal or not chal.startswith(b"BB\n\n"):
            raise AssertionError("chal formula")

    def test_record_line_sha():
        packet, _key = s.build_packet(g, "MAIN", "R1", "SYN", "S", "F0", fact_for(0, "D-01"), "D-01", questions["D-01"])
        record = blind_s2(packet)
        ok, why = g["validate_blind"](record, packet)
        if not ok:
            raise AssertionError(why)
        line = s.canonical_line_bytes(g, record)
        if s.sha256_bytes(line) != s.record_sha(g, record):
            raise AssertionError("record sha")
        if s.sha256_bytes(g["canon"](record).encode("utf-8")) == s.record_sha(g, record):
            raise AssertionError("lf excluded")

    def test_order_and_batches():
        first = s.order_digest("MAIN", "R1", "a|b|c|D-01")
        if first != s.order_digest("MAIN", "R1", "a|b|c|D-01"):
            raise AssertionError("unstable order")
        if first == s.order_digest("MAIN", "R2", "a|b|c|D-01"):
            raise AssertionError("slot ignored")
        if s.schedule_sizes("MAIN", 41) != [40, 1]:
            raise AssertionError("main schedule")
        if s.schedule_sizes("CHAL", 11) != [10, 1]:
            raise AssertionError("chal schedule")
        s.assert_batch_sizes("MAIN", [40, 1])
        s.assert_batch_sizes("CHAL", [10])
        s.assert_batch_sizes("QUAL", [10])

    def test_extraction_granularity():
        left, _key = s.build_packet(g, "MAIN", "R1", "SYN", "S", "F1", fact_for(1, "D-01"), "D-01", questions["D-01"])
        right, _key = s.build_packet(g, "MAIN", "R1", "SYN", "S", "F2", fact_for(2, "D-01"), "D-01", questions["D-01"])
        rec_left = blind_s2(left)
        rec_right = blind_s2(right)
        reversed_output = jsonl(g, [rec_right, rec_left])
        extracted = s.extract_records(reversed_output, [left["packetId"], right["packetId"]], g)
        if extracted["observedOrder"] != [right["packetId"], left["packetId"]]:
            raise AssertionError(extracted["observedOrder"])
        if set(extracted["byId"]) != {left["packetId"], right["packetId"]}:
            raise AssertionError("order rejected a unique record")
        if extracted["missing"] or extracted["duplicate"] or extracted["malformed"]:
            raise AssertionError(extracted)
        mixed = jsonl(g, [rec_left]) + b"not json\n\n" + jsonl(g, [rec_right])
        mixed_report = s.extract_records(mixed, [left["packetId"], right["packetId"]], g)
        if set(mixed_report["byId"]) != {left["packetId"], right["packetId"]}:
            raise AssertionError("malformed line removed a sibling")
        reasons = [row["reason"] for row in mixed_report["malformed"]]
        if "json" not in reasons or "empty" not in reasons:
            raise AssertionError(reasons)
        duplicate = jsonl(g, [rec_left, rec_left, rec_right])
        duplicate_report = s.extract_records(duplicate, [left["packetId"], right["packetId"]], g)
        if left["packetId"] in duplicate_report["byId"] or right["packetId"] not in duplicate_report["byId"]:
            raise AssertionError("duplicate policy")
        if duplicate_report["duplicate"] != [left["packetId"]]:
            raise AssertionError(duplicate_report["duplicate"])
        omitted = s.extract_records(jsonl(g, [rec_right]), [left["packetId"], right["packetId"]], g)
        if omitted["missing"] != [left["packetId"]] or right["packetId"] not in omitted["byId"]:
            raise AssertionError("omission policy")
        foreign, _key = s.build_packet(g, "MAIN", "R1", "SYN", "S", "F3", fact_for(3, "D-01"), "D-01", questions["D-01"])
        extra = s.extract_records(jsonl(g, [rec_left, blind_s2(foreign)]), [left["packetId"]], g)
        if extra["extraneous"] != [foreign["packetId"]] or left["packetId"] not in extra["byId"]:
            raise AssertionError("extraneous policy")
        if extra["outputSha"] == s.record_sha(g, rec_left):
            raise AssertionError("outputSha collapsed to a record hash")
        spaced = json.dumps(rec_left).encode("utf-8") + b"\n" + jsonl(g, [rec_right])
        spaced_report = s.extract_records(spaced, [left["packetId"], right["packetId"]], g)
        if left["packetId"] in spaced_report["byId"] or right["packetId"] not in spaced_report["byId"]:
            raise AssertionError("noncanonical policy")
        broken = b"\xff\n" + jsonl(g, [rec_right])
        broken_report = s.extract_records(broken, [left["packetId"], right["packetId"]], g)
        if right["packetId"] not in broken_report["byId"] or left["packetId"] not in broken_report["missing"]:
            raise AssertionError("utf-8 policy")
        if broken_report["outputSha"] != hashlib.sha256(broken).hexdigest():
            raise AssertionError("outputSha")

    def test_wrong_key_keeps_sibling():
        left, _key = s.build_packet(g, "MAIN", "R1", "SYN", "S", "F4", fact_for(4, "D-01"), "D-01", questions["D-01"])
        right, _key = s.build_packet(g, "MAIN", "R1", "SYN", "S", "F5", fact_for(5, "D-01"), "D-01", questions["D-01"])
        bad = blind_s2(left)
        bad["note"] = "extra"
        q_packets, q_records, q_ctx = qual_material(g, "R1", 400)
        transport = Script([jsonl(g, q_records), jsonl(g, [bad, blind_s2(right)])])
        run = s.Run(g, transport)
        run.issue_session(
            "qual-wrong", "QUAL", "R1", 0, 0, q_packets, brief, app, "slot-r1",
            "TQ0", "TQ1", "TQ2", True, input_ctx=q_ctx,
        )
        if run.qual_status("R1") != "PASS":
            raise AssertionError(run.qual_status("R1"))
        session = run.issue_session(
            "wrong-key", "MAIN", "R1", 0, 0, [left, right], brief, app, "slot-r1",
            "T0", "T1", "T2", True, input_ctx=main_ctx(g, "R1", [left, right]),
        )
        if transport.calls != 2:
            raise AssertionError(transport.calls)
        if session["validIds"] != [right["packetId"]]:
            raise AssertionError(session["validIds"])
        if session["rejected"][0]["id"] != left["packetId"]:
            raise AssertionError(session["rejected"])
        if run.lacks_valid("MAIN", "R1", right["packetId"]):
            raise AssertionError("sibling lost")

    def test_transport_failure_and_third_attempt():
        packet, _key = s.build_packet(g, "MAIN", "R1", "SYN", "S", "F6", fact_for(6, "D-01"), "D-01", questions["D-01"])
        q_packets, q_records, q_ctx = qual_material(g, "R1", 600)
        transport = Script([jsonl(g, q_records), s.TransportFailure(), s.TransportFailure(), b"{}\n"])
        run = s.Run(g, transport)
        run.issue_session(
            "qual-fail", "QUAL", "R1", 0, 0, q_packets, brief, app, "slot-r1",
            "TQ0", "TQ1", "TQ2", True, input_ctx=q_ctx,
        )
        ctx = main_ctx(g, "R1", [packet])
        failed = run.issue_session(
            "fail-0", "MAIN", "R1", 0, 0, [packet], brief, app, "slot-r1",
            "T0", "T1", "T2", True, input_ctx=ctx,
        )
        if failed["outputSha"] is not None or failed["status"] != "TRANSPORT_FAILURE" or transport.calls != 2:
            raise AssertionError((failed["status"], transport.calls))
        if hashlib.sha256(b"").hexdigest() in run.journal.text():
            raise AssertionError("empty hash used as a seal")
        run.issue_session(
            "fail-1", "MAIN", "R1", 0, 1, [packet], brief, app, "slot-r1",
            "T3", "T4", "T5", True, input_ctx=ctx,
        )
        if transport.calls != 3:
            raise AssertionError(transport.calls)
        before_calls = transport.calls
        try:
            run.issue_session(
                "fail-2", "MAIN", "R1", 0, 2, [packet], brief, app, "slot-r1",
                "T6", "T7", "T8", True, input_ctx=ctx,
            )
            raise AssertionError("third attempt issued")
        except s.Refusal:
            if transport.calls != before_calls:
                raise AssertionError(transport.calls)
            raise

    def test_interrupted_resume():
        packet, _key = s.build_packet(g, "MAIN", "R1", "SYN", "S", "F7", fact_for(7, "D-01"), "D-01", questions["D-01"])
        q_packets, q_records, q_ctx = qual_material(g, "R1", 700)
        transport = Script([jsonl(g, q_records), s.Interrupted(), b"{}\n"])
        run = s.Run(g, transport)
        run.issue_session(
            "qual-stop", "QUAL", "R1", 0, 0, q_packets, brief, app, "slot-r1",
            "TQ0", "TQ1", "TQ2", True, input_ctx=q_ctx,
        )
        session = run.issue_session(
            "stop", "MAIN", "R1", 0, 0, [packet], brief, app, "slot-r1",
            "T0", "T1", "T2", True, input_ctx=main_ctx(g, "R1", [packet]),
        )
        if session["status"] != "INTERRUPTED" or session["outputSha"] is not None or transport.calls != 2:
            raise AssertionError(session["status"])
        run.resume("stop")

    def test_hashes_and_transcript():
        packet, key = s.build_packet(g, "MAIN", "R1", "SYN", "S", "F8", fact_for(8, "D-01"), "D-01", questions["D-01"])
        record = blind_s2(packet)
        q_packets, q_records, q_ctx = qual_material(g, "R1", 800)
        transport = Script([jsonl(g, q_records), jsonl(g, [record])])
        run = s.Run(g, transport)
        run.issue_session(
            "qual-hash", "QUAL", "R1", 0, 0, q_packets, brief, app, "slot-r1",
            "TQ0", "TQ1", "TQ2", True, input_ctx=q_ctx,
        )
        ctx = {"slot": "R1", "questions": questions, "stage1": stage1_of([packet])}
        session = run.issue_session(
            "hash", "MAIN", "R1", 0, 0, [packet], brief, app, "slot-r1",
            "T0", "T1", "T2", True, input_ctx=ctx,
        )
        if session["outputSha"] != s.sha256_bytes(session["transcript"]):
            raise AssertionError("output sha")
        if session["validIds"] != [packet["packetId"]]:
            raise AssertionError(session["rejected"])
        run.check_transcript("hash")
        run.check_input("hash")
        session["transcript"] = session["transcript"][:-1] + b"?"
        run.check_transcript("hash")

    def test_input_tamper():
        packet, _key = s.build_packet(g, "MAIN", "R1", "SYN", "S", "F9", fact_for(9, "D-01"), "D-01", questions["D-01"])
        q_packets, q_records, q_ctx = qual_material(g, "R1", 900)
        transport = Script([jsonl(g, q_records), jsonl(g, [blind_s2(packet)])])
        run = s.Run(g, transport)
        run.issue_session(
            "qual-input", "QUAL", "R1", 0, 0, q_packets, brief, app, "slot-r1",
            "TQ0", "TQ1", "TQ2", True, input_ctx=q_ctx,
        )
        run.issue_session(
            "input", "MAIN", "R1", 0, 0, [packet], brief, app, "slot-r1",
            "T0", "T1", "T2", True, input_ctx=main_ctx(g, "R1", [packet]),
        )
        run.sessions["input"]["brief"] = b"OTHER\n"
        run.check_input("input")

    def test_premature_and_batches_and_h():
        packet, _key = s.build_packet(g, "MAIN", "R1", "SYN", "S", "F10", fact_for(10, "D-02"), "D-02", questions["D-02"])
        transport = Script([b"{}\n"])
        run = s.Run(g, transport)
        try:
            run.issue_session(
                "early-chal", "CHAL", "R1", 0, 0, [packet], brief, app, "slot-r1",
                "T0", "T1", "T2", True,
            )
        except s.Refusal:
            if transport.calls != 0:
                raise AssertionError(transport.calls)
            raise

    def test_batch_and_h_and_result(run, transport):
        if transport.calls != 0:
            raise AssertionError("premature chal called transport")
        run.assemble_c7({"scope": "DECISION", "route": "EXTERNAL", "pre": {}, "process": {}})

    def test_unauthorized_sizes():
        transport = Script([b"{}\n"])
        run = s.Run(g, transport)
        try:
            run.issue_session(
                "wide", "MAIN", "R1", 0, 0, [{}] * 41, brief, app, "slot-r1",
                "T0", "T1", "T2", True,
            )
        except s.Refusal:
            if transport.calls != 0:
                raise AssertionError(transport.calls)
            raise

    def test_nonfinal_size():
        transport = Script([b"{}\n"])
        run = s.Run(g, transport)
        try:
            run.issue_session(
                "short", "MAIN", "R1", 0, 0, [{}] * 39, brief, app, "slot-r1",
                "T0", "T1", "T2", False,
            )
        except s.Refusal:
            if transport.calls != 0:
                raise AssertionError(transport.calls)
            raise

    def test_h_item():
        transport = Script([b"{}\n"])
        run = s.Run(g, transport)
        try:
            run.issue_session(
                "h", "H", "H1", 0, 0, [{"factKey": "a|b|c"}], brief, app, "h1",
                "T0", "T1", "T2", True,
            )
        except s.Refusal:
            if transport.calls != 0:
                raise AssertionError(transport.calls)
            raise

    def test_retry_config():
        s.Run(g, Script([b""]), {"retry": 1})

    def test_reissue_omission_once():
        first, key_first = s.build_packet(g, "MAIN", "R1", "SYN", "S", "F11", fact_for(11, "D-01"), "D-01", questions["D-01"])
        second, key_second = s.build_packet(g, "MAIN", "R1", "SYN", "S", "F12", fact_for(12, "D-01"), "D-01", questions["D-01"])
        rec_second = blind_s2(second)
        rec_first = blind_s2(first)
        q_packets, q_records, q_ctx = qual_material(g, "R1", 1100)
        transport = Script([
            jsonl(g, q_records), jsonl(g, [rec_second]), jsonl(g, [rec_first]), jsonl(g, [rec_first]),
        ])
        run = s.Run(g, transport)
        run.issue_session(
            "qual-omit", "QUAL", "R1", 0, 0, q_packets, brief, app, "slot-r1",
            "TQ0", "TQ1", "TQ2", True, input_ctx=q_ctx,
        )
        ctx = main_ctx(g, "R1", [first, second])
        run.issue_session(
            "omit", "MAIN", "R1", 0, 0, [first, second], brief, app, "slot-r1",
            "T0", "T1", "T2", True, input_ctx=ctx,
        )
        if run.lacks_valid("MAIN", "R1", second["packetId"]) or not run.lacks_valid("MAIN", "R1", first["packetId"]):
            raise AssertionError("omission eligibility")
        plan = run.reissue_plan("MAIN", "R1", [first, second], [key_first, key_second])
        if len(plan) != 1 or plan[0] != [first]:
            raise AssertionError(plan)
        if transport.calls != 2:
            raise AssertionError(transport.calls)
        run.issue_session(
            "omit-again", "MAIN", "R1", 0, 1, [second], brief, app, "slot-r1",
            "T3", "T4", "T5", True, input_ctx=ctx,
        )

    def test_qual_alignment():
        packets = []
        records = []
        bank = {}
        for index in range(10):
            domain = "D-01"
            text = fact_for(100 + index, domain)
            packet, _key = s.build_packet(
                g, "QUAL", "R1", "IGNORED", "IGNORED", "Q-%02d" % (index + 1), text, domain, questions[domain]
            )
            packets.append(packet)
            records.append(blind_s2(packet))
            bank[packet["factId"]] = {"factText": text, "d": domain, "output": "YES"}
        ctx = {"slot": "R1", "questions": questions, "bank": bank}
        for packet in packets:
            ok, why = g["validate_packet_qual"](packet, ctx)
            if not ok:
                raise AssertionError(why)
        by_id = {}
        for record in reversed(records):
            by_id[record["packetId"]] = record
        aligned = s.records_for_qual(packets, by_id)
        if g["qual_pass"](packets, aligned, bank) is not True:
            raise AssertionError("qual alignment")
        if g["qual_pass"](packets, list(reversed(records)), bank) is not False:
            raise AssertionError("positional zip accepted a reversed response")
        s.assert_batch_sizes("QUAL", s.schedule_sizes("QUAL", 10))

    def test_positive_chain():
        text = fact_for(20, "D-03")
        domain = "D-03"
        left, key = s.build_packet(g, "MAIN", "R1", "SYN", "S", "F20", text, domain, questions[domain])
        right, _same = s.build_packet(g, "MAIN", "R2", "SYN", "S", "F20", text, domain, questions[domain])
        if left["packetId"] == right["packetId"]:
            raise AssertionError("pid")
        rec_left = blind_s2(left)
        rec_right = blind_s2(right)
        for record, packet in ((rec_left, left), (rec_right, right)):
            ok, why = g["validate_blind"](record, packet)
            if not ok:
                raise AssertionError(why)
        q1, q1_records, q1_ctx = qual_material(g, "R1", 2000)
        q2, q2_records, q2_ctx = qual_material(g, "R2", 2100)
        transport = Script(
            [
                jsonl(g, q1_records),
                jsonl(g, q2_records),
                jsonl(g, [rec_left]),
                jsonl(g, [rec_right]),
                jsonl(g, [confirm(left, rec_right)]),
                jsonl(g, [confirm(right, rec_left)]),
            ]
        )
        run = s.Run(g, transport)
        run.issue_session(
            "qual-r1", "QUAL", "R1", 0, 0, q1, brief, app, "r1",
            "TQ0", "TQ1", "TQ2", True, input_ctx=q1_ctx,
        )
        run.issue_session(
            "qual-r2", "QUAL", "R2", 0, 0, q2, brief, app, "r2",
            "TQ3", "TQ4", "TQ5", True, input_ctx=q2_ctx,
        )
        if run.qual_status("R1") != "PASS" or run.qual_status("R2") != "PASS":
            raise AssertionError((run.qual_status("R1"), run.qual_status("R2")))
        stage1 = stage1_of([left])
        later, _later_key = s.build_packet(
            g, "MAIN", "R1", "SYN", "S", "F99", fact_for(99, domain), domain, questions[domain]
        )
        later_ctx = {"slot": "R1", "questions": questions, "stage1": stage1_of([left, later])}
        run.issue_session(
            "main-r1", "MAIN", "R1", 0, 0, [left], brief, app, "r1",
            "T0", "T1", "T2", True,
            input_ctx={"slot": "R1", "questions": questions, "stage1": stage1},
        )
        run.issue_session(
            "main-r2", "MAIN", "R2", 0, 0, [right], brief, app, "r2",
            "T3", "T4", "T5", True,
            input_ctx={"slot": "R2", "questions": questions, "stage1": stage1},
        )
        blind = run.freeze_blind([(key, "R1", left), (key, "R2", right)], "T6")
        blind_bytes = blind["bytes"]
        run.send_fb("T7")
        held_fb = snapshot(run)
        expect("main-after-fb", "BLIND_FROZEN", lambda: run.issue_session(
            "main-after-fb", "MAIN", "R1", 1, 0, [later], brief, app, "r1",
            "TX0", "TX1", "TX2", True, input_ctx=later_ctx,
        ))
        q9, _q9_records, q9_ctx = qual_material(g, "R9", 2300)
        expect("qual-after-blind", "BLIND_FROZEN", lambda: run.issue_session(
            "qual-after-blind", "QUAL", "R9", 0, 0, q9, brief, app, "r9",
            "TX3", "TX4", "TX5", True, input_ctx=q9_ctx,
        ))
        expect("reissue-plan-after-fb", "BLIND_FROZEN", lambda: run.reissue_plan("MAIN", "R1", [left], [key]))
        assert_unchanged(held_fb, run)
        item_left = s.build_chal_item(g, left, rec_left, rec_right, "YES")
        item_right = s.build_chal_item(g, right, rec_right, rec_left, "YES")
        blind_map = {("R1", key): rec_left, ("R2", key): rec_right}
        run.issue_session(
            "chal-r1", "CHAL", "R1", 0, 0, [item_left], b"CHAL BRIEF\n", app, "r1",
            "T8", "T9", "T10", True,
            input_ctx={"slot": "R1", "questions": questions, "stage1": stage1, "blind": blind_map},
        )
        run.issue_session(
            "chal-r2", "CHAL", "R2", 0, 0, [item_right], b"CHAL BRIEF\n", app, "r2",
            "T11", "T12", "T13", True,
            input_ctx={"slot": "R2", "questions": questions, "stage1": stage1, "blind": blind_map},
        )
        if b"SYNTHETIC BRIEF" in run.sessions["chal-r1"]["inputBytes"]:
            raise AssertionError("chal input contains the main brief")
        if run.sessions["chal-r1"]["status"] != "RECEIVED" or run.sessions["chal-r2"]["status"] != "RECEIVED":
            raise AssertionError("chal between FB and F was not received")
        if run.frozen_ref:
            raise AssertionError("chal ran after the reference freeze")
        ref = run.freeze_ref([{"tuple": key, "p1": left, "p2": right}], "T14")
        ref_bytes = ref["bytes"]
        if ref["rows"][0]["label"] != "Y" or ref["rows"][0]["basis"] != "BLIND_S2_REPRODUCED_UNCHALLENGED":
            raise AssertionError(ref["rows"][0])
        run.send_f("T15")
        held_f = snapshot(run)
        expect("main-after-f", "REF_FROZEN", lambda: run.issue_session(
            "main-after-f", "MAIN", "R1", 1, 0, [later], brief, app, "r1",
            "TY0", "TY1", "TY2", True, input_ctx=later_ctx,
        ))
        expect("reissue-plan-after-f", "REF_FROZEN", lambda: run.reissue_plan("CHAL", "R1", [item_left], [key]))
        assert_unchanged(held_f, run)
        case = decision_case(g, key, "Y")
        ref_sha = run.fref["sha"]
        ref_bytes = bytes(run.fref["bytes"])

        def refuse_labels(name, labels, population):
            blocked = dict(case)
            blocked["labels"] = labels
            blocked["X"] = population
            expect(name, "LABEL_REF", lambda: run.assemble_c7(blocked))

        refuse_labels("c7-label-inconsistent", {key: "I"}, [key])
        extra_key = key + "|EXTRA"
        refuse_labels("c7-label-extra", {key: "Y", extra_key: "N"}, [key, extra_key])
        refuse_labels("c7-label-omitted", {}, [])
        refuse_labels("c7-label-swapped", {key: "N"}, [key])
        if run.fref["sha"] != ref_sha or run.fref["bytes"] != ref_bytes:
            raise AssertionError("frozen REF changed after a label refusal")
        blocked_result = g["evaluate"](
            {
                "labels": {key: "N"},
                "X": [key],
                "clauses": case["clauses"],
                "stratum": case["stratum"],
                "cells": case["cells"],
                "route": "EXTERNAL",
                "h21": {},
                "process": {"F-PS-04": g["SUR"], "F-PS-07": g["SUR"]},
                "pre": {name: True for name in s.PRECONDITIONS},
            }
        )
        if blocked_result["SI-6"] != g["INSUFF"] or blocked_result["step"] != 3:
            raise AssertionError((blocked_result["SI-6"], blocked_result["step"]))
        c7, c7_line = run.assemble_c7(case)
        if c7["SI-6"] != g["SUFF"] or c7["step"] != 5:
            raise AssertionError((c7["SI-6"], c7["step"], c7["falsifiers"]))
        if c7["route"] != "EXTERNAL" or c7["hGate"] is not False or c7["h21Sha"] is not None:
            raise AssertionError("external boundary")
        if c7["protocolSha"] != s.PROTOCOL_SHA or c7["blindSha"] != blind["sha"] or c7["refSha"] != ref["sha"]:
            raise AssertionError("c7 hashes")
        if c7["scope"] != "DECISION" or set(c7["preconditions"]) != set(s.PRECONDITIONS):
            raise AssertionError("c7 contract")
        export = run.iv_export(c7, c7_line)
        parsed = json.loads(export)
        if parsed["independentVerification"] is not False or parsed["executionAuthorized"] is not False:
            raise AssertionError("proof state")
        if parsed["historicalProceduralVerdict"] != "FAIL" or parsed["res03"] != "OPTION_A":
            raise AssertionError("verdict export")
        if parsed["xDec"] != 3536 or parsed["selfValidation"] != "NOT_INDEPENDENT":
            raise AssertionError("export bounds")
        if parsed["act"] != "SI0-CORR2-EXECUTION-READINESS-1.CORR2":
            raise AssertionError(parsed["act"])
        if parsed["e4Ready"] is not False or parsed["labelsSource"] != "FROZEN_REF":
            raise AssertionError("e4 or label source claim")
        provenance = parsed["preconditionProvenance"]
        if provenance["establishedBy"] != "CALLER_SYNTHETIC" or provenance["independentlyVerified"] is not False:
            raise AssertionError(provenance)
        if provenance["values"] != c7["preconditions"]:
            raise AssertionError("provenance values")
        if s.sha256_bytes(c7_line) != parsed["c7Sha"]:
            raise AssertionError("c7 sha")
        withheld = dict(case)
        withheld["pre"] = dict(case["pre"])
        del withheld["pre"]["P1"]
        try:
            run.assemble_c7(withheld)
            raise AssertionError("missing precondition was accepted")
        except s.Refusal as exc:
            if exc.code != "PRECONDITION":
                raise
        if c7["preconditions"]["P1"] is not True:
            raise AssertionError("saved result was rewritten")
        negative = dict(case)
        negative["pre"] = dict(case["pre"])
        negative["pre"]["P1"] = False
        negative_c7, _line = run.assemble_c7(negative)
        if negative_c7["SI-6"] != g["NOT_EST"] or negative_c7["step"] != 1:
            raise AssertionError((negative_c7["SI-6"], negative_c7["step"]))
        smuggled = dict(case)
        smuggled["h21"] = {"SYN|S|F20": "IMMATERIAL"}
        try:
            run.assemble_c7(smuggled)
            raise AssertionError("h21 accepted under EXTERNAL")
        except s.Refusal as exc:
            if exc.code != "H_EXTERNAL":
                raise
        if run.fb["bytes"] != blind_bytes or run.fref["bytes"] != ref_bytes:
            raise AssertionError("freeze changed")
        try:
            run.mutate_after_freeze()
            raise AssertionError("mutation accepted")
        except s.Refusal as exc:
            if exc.code != "MUTATION_AFTER_FREEZE":
                raise
        if run.fb["bytes"] != blind_bytes or run.fref["bytes"] != ref_bytes:
            raise AssertionError("mutation changed frozen bytes")
        if run.fps04 != g["FIRED"] or "MUTATION_AFTER_FREEZE" not in run.defects:
            raise AssertionError("defect not recorded")
        if "MUTATION_AFTER_FREEZE" in export:
            raise AssertionError("earlier export was rewritten")
        failed_c7, _line = run.assemble_c7(case)
        if failed_c7["falsifiers"]["F-PS-04"] != g["FIRED"] or failed_c7["SI-6"] != g["NOT_EST"]:
            raise AssertionError(failed_c7["falsifiers"])
        if c7["falsifiers"]["F-PS-04"] != g["SUR"]:
            raise AssertionError("original c7 mutated")
        parts = run.journal.text().strip().split("\n")
        if any(len(line.split(" | ")) != 4 for line in parts):
            raise AssertionError("journal shape")

    def test_contamination():
        first, key_first = s.build_packet(g, "MAIN", "R1", "SYN", "S", "F30", fact_for(30, "D-01"), "D-01", questions["D-01"])
        second, key_second = s.build_packet(g, "MAIN", "R1", "SYN", "S", "F31", fact_for(31, "D-01"), "D-01", questions["D-01"])
        q_packets, q_records, q_ctx = qual_material(g, "R1", 3000)
        transport = Script([jsonl(g, q_records), jsonl(g, [blind_s2(first), blind_s2(second)])])
        run = s.Run(g, transport)
        run.issue_session(
            "qual-dirty", "QUAL", "R1", 0, 0, q_packets, brief, app, "r1",
            "TQ0", "TQ1", "TQ2", True, input_ctx=q_ctx,
        )
        run.issue_session(
            "dirty", "MAIN", "R1", 0, 0, [first, second], brief, app, "r1",
            "T0", "T1", "T2", True, input_ctx=main_ctx(g, "R1", [first, second]),
        )
        run.contaminate("dirty", "T3")
        if not run.lacks_valid("MAIN", "R1", first["packetId"]) or not run.lacks_valid("MAIN", "R1", second["packetId"]):
            raise AssertionError("contaminated record remained evidence")
        if not run.archive:
            raise AssertionError("contaminated record was deleted")
        plan = run.reissue_plan("MAIN", "R1", [first, second], [key_first, key_second])
        if len(plan) != 1 or len(plan[0]) != 2:
            raise AssertionError(len(plan[0]) if plan else 0)

    def test_bad_main_packet():
        packet, _key = s.build_packet(g, "MAIN", "R1", "SYN", "S", "F40", fact_for(40, "D-01"), "D-01", questions["D-01"])
        broken = dict(packet)
        broken["factText"] = "different synthetic fact"
        q_packets, q_records, q_ctx = qual_material(g, "R1", 4000)
        transport = Script([jsonl(g, q_records), b"{}\n"])
        run = s.Run(g, transport)
        run.issue_session(
            "qual-bad", "QUAL", "R1", 0, 0, q_packets, brief, app, "r1",
            "TQ0", "TQ1", "TQ2", True, input_ctx=q_ctx,
        )
        ctx = {"slot": "R1", "questions": questions, "stage1": stage1_of([packet])}
        before_calls = transport.calls
        try:
            run.issue_session(
                "bad-packet", "MAIN", "R1", 0, 0, [broken], brief, app, "r1",
                "T0", "T1", "T2", True, input_ctx=ctx,
            )
            raise AssertionError("bad packet issued")
        except s.Refusal as exc:
            if exc.code != "MAIN_PACKET":
                raise
        if transport.calls != before_calls:
            raise AssertionError(transport.calls)

    def test_main_without_qual():
        packet, _key = s.build_packet(g, "MAIN", "R1", "SYN", "S", "F60", fact_for(60, "D-01"), "D-01", questions["D-01"])
        transport = Script([jsonl(g, [blind_s2(packet)])])
        run = s.Run(g, transport)
        before = snapshot(run)
        try:
            run.issue_session(
                "no-qual", "MAIN", "R1", 0, 0, [packet], brief, app, "r1",
                "T0", "T1", "T2", True, input_ctx=main_ctx(g, "R1", [packet]),
            )
            raise AssertionError("main without qualification was issued")
        except s.Refusal as exc:
            if exc.code != "QUAL_REQUIRED":
                raise
        if transport.calls != 0:
            raise AssertionError(transport.calls)
        assert_unchanged(before, run)

    def test_qual_failure_then_second_session():
        failed_packets, failed_records, failed_ctx = qual_material(g, "R1", 5000, "NO")
        passed_packets, passed_records, passed_ctx = qual_material(g, "R1", 5000, "YES")
        if [row["packetId"] for row in failed_packets] != [row["packetId"] for row in passed_packets]:
            raise AssertionError("qual identity drifted")
        for packet, record in zip(failed_packets, failed_records):
            ok, why = g["validate_blind"](record, packet)
            if not ok:
                raise AssertionError(why)
        if g["qual_pass"](failed_packets, failed_records, failed_ctx["bank"]) is not False:
            raise AssertionError("bank mismatch was accepted by qual_pass")
        if g["qual_pass"](passed_packets, passed_records, passed_ctx["bank"]) is not True:
            raise AssertionError("matching bank was rejected by qual_pass")
        failed_ctx = dict(failed_ctx)
        failed_ctx["qualPass"] = True
        main_packet, _key = s.build_packet(
            g, "MAIN", "R1", "SYN", "S", "F61", fact_for(61, "D-01"), "D-01", questions["D-01"]
        )
        transport = Script([
            jsonl(g, failed_records),
            jsonl(g, passed_records),
            jsonl(g, [blind_s2(main_packet)]),
        ])
        run = s.Run(g, transport)
        first = run.issue_session(
            "qual-no", "QUAL", "R1", 0, 0, failed_packets, brief, app, "r1",
            "T0", "T1", "T2", True, input_ctx=failed_ctx,
        )
        if run.qual_status("R1") != "OPEN" or len(first["validIds"]) != 10:
            raise AssertionError((run.qual_status("R1"), first["validIds"]))
        if any(run.lacks_valid("QUAL", "R1", packet["packetId"]) for packet in failed_packets):
            raise AssertionError("mv-valid qualification failure was discarded")
        try:
            run.reissue_plan("QUAL", "R1", failed_packets, ["k"] * 10)
            raise AssertionError("qual element reissue was planned")
        except s.Refusal as exc:
            if exc.code != "QUAL_FRESH_SESSION":
                raise
        before_main = transport.calls
        try:
            run.issue_session(
                "main-before-pass", "MAIN", "R1", 0, 0, [main_packet], brief, app, "r1",
                "T3", "T4", "T5", True, input_ctx=main_ctx(g, "R1", [main_packet]),
            )
            raise AssertionError("failed qualification authorized main")
        except s.Refusal as exc:
            if exc.code != "QUAL_REQUIRED":
                raise
        if transport.calls != before_main:
            raise AssertionError(transport.calls)
        second = run.issue_session(
            "qual-yes", "QUAL", "R1", 0, 1, passed_packets, brief, app, "r1",
            "T6", "T7", "T8", True, input_ctx=passed_ctx,
        )
        if run.qual_status("R1") != "PASS" or len(second["validIds"]) != 10:
            raise AssertionError(run.qual_status("R1"))
        issued = run.issue_session(
            "main-after-pass", "MAIN", "R1", 0, 0, [main_packet], brief, app, "r1",
            "T9", "T10", "T11", True, input_ctx=main_ctx(g, "R1", [main_packet]),
        )
        if issued["validIds"] != [main_packet["packetId"]] or transport.calls != 3:
            raise AssertionError((issued["validIds"], transport.calls))
        before_extra = snapshot(run)
        try:
            run.issue_session(
                "qual-extra", "QUAL", "R1", 0, 0, passed_packets, brief, app, "r1",
                "T12", "T13", "T14", True, input_ctx=passed_ctx,
            )
            raise AssertionError("extra qualification was issued")
        except s.Refusal as exc:
            if exc.code != "QUAL_CLOSED":
                raise
        assert_unchanged(before_extra, run)

    def test_qual_exhausted_and_hold():
        packets, _records, ctx = qual_material(g, "R1", 5200)
        transport = Script([s.TransportFailure(), s.TransportFailure(), b"{}\n"])
        run = s.Run(g, transport)
        first = run.issue_session(
            "qual-t0", "QUAL", "R1", 0, 0, packets, brief, app, "r1",
            "T0", "T1", "T2", True, input_ctx=ctx,
        )
        second = run.issue_session(
            "qual-t1", "QUAL", "R1", 0, 1, packets, brief, app, "r1",
            "T3", "T4", "T5", True, input_ctx=ctx,
        )
        if first["status"] != "TRANSPORT_FAILURE" or second["status"] != "TRANSPORT_FAILURE":
            raise AssertionError((first["status"], second["status"]))
        if first["outputSha"] is not None or second["outputSha"] is not None:
            raise AssertionError("transport failure stored a seal")
        if run.qual_status("R1") != "HOLD" or transport.calls != 2:
            raise AssertionError((run.qual_status("R1"), transport.calls))
        before = snapshot(run)
        try:
            run.issue_session(
                "qual-t2", "QUAL", "R1", 0, 1, packets, brief, app, "r1",
                "T6", "T7", "T8", True, input_ctx=ctx,
            )
            raise AssertionError("third qualification was issued")
        except s.Refusal as exc:
            if exc.code != "QUAL_EXHAUSTED":
                raise
        packet, _key = s.build_packet(
            g, "MAIN", "R1", "SYN", "S", "F62", fact_for(62, "D-01"), "D-01", questions["D-01"]
        )
        try:
            run.issue_session(
                "main-held", "MAIN", "R1", 0, 0, [packet], brief, app, "r1",
                "T9", "T10", "T11", True, input_ctx=main_ctx(g, "R1", [packet]),
            )
            raise AssertionError("held slot issued main")
        except s.Refusal as exc:
            if exc.code != "QUAL_HOLD":
                raise
        assert_unchanged(before, run)

    def test_qual_slot_isolation():
        packets, records, ctx = qual_material(g, "R1", 5300)
        packet, _key = s.build_packet(
            g, "MAIN", "R2", "SYN", "S", "F63", fact_for(63, "D-01"), "D-01", questions["D-01"]
        )
        transport = Script([jsonl(g, records), jsonl(g, [blind_s2(packet)])])
        run = s.Run(g, transport)
        run.issue_session(
            "qual-r1-only", "QUAL", "R1", 0, 0, packets, brief, app, "r1",
            "T0", "T1", "T2", True, input_ctx=ctx,
        )
        if run.qual_status("R1") != "PASS" or run.qual_status("R2") != "OPEN":
            raise AssertionError((run.qual_status("R1"), run.qual_status("R2")))
        before = snapshot(run)
        try:
            run.issue_session(
                "main-r2", "MAIN", "R2", 0, 0, [packet], brief, app, "r2",
                "T3", "T4", "T5", True, input_ctx=main_ctx(g, "R2", [packet]),
            )
            raise AssertionError("R1 qualification authorized R2")
        except s.Refusal as exc:
            if exc.code != "QUAL_REQUIRED":
                raise
        assert_unchanged(before, run)

    def test_missing_validation_context():
        packets, records, ctx = qual_material(g, "R1", 5400)
        packet, _key = s.build_packet(
            g, "MAIN", "R1", "SYN", "S", "F64", fact_for(64, "D-01"), "D-01", questions["D-01"]
        )
        transport = Script([jsonl(g, records), b"{}\n"])
        run = s.Run(g, transport)
        try:
            run.issue_session(
                "qual-no-ctx", "QUAL", "R1", 0, 0, packets, brief, app, "r1",
                "T0", "T1", "T2", True, input_ctx=None,
            )
            raise AssertionError("qualification without context was issued")
        except s.Refusal as exc:
            if exc.code != "QUAL_CONTEXT":
                raise
        if transport.calls != 0 or run.qual_status("R1") != "OPEN":
            raise AssertionError((transport.calls, run.qual_status("R1")))
        run.issue_session(
            "qual-ctx", "QUAL", "R1", 0, 0, packets, brief, app, "r1",
            "T3", "T4", "T5", True, input_ctx=ctx,
        )
        before = snapshot(run)
        try:
            run.issue_session(
                "main-no-ctx", "MAIN", "R1", 0, 0, [packet], brief, app, "r1",
                "T6", "T7", "T8", True, input_ctx=None,
            )
            raise AssertionError("main without validation context was issued")
        except s.Refusal as exc:
            if exc.code != "MAIN_CONTEXT":
                raise
        assert_unchanged(before, run)

    def test_qual_contamination_revoke():
        first_packets, first_records, first_ctx = qual_material(g, "R1", 5500)
        transport = Script([jsonl(g, first_records), jsonl(g, first_records), b"{}\n"])
        run = s.Run(g, transport)
        run.issue_session(
            "qual-c0", "QUAL", "R1", 0, 0, first_packets, brief, app, "r1",
            "T0", "T1", "T2", True, input_ctx=first_ctx,
        )
        run.contaminate("qual-c0", "T3")
        if run.qual_status("R1") != "OPEN":
            raise AssertionError(run.qual_status("R1"))
        run.issue_session(
            "qual-c1", "QUAL", "R1", 0, 1, first_packets, brief, app, "r1",
            "T4", "T5", "T6", True, input_ctx=first_ctx,
        )
        if run.qual_status("R1") != "PASS":
            raise AssertionError(run.qual_status("R1"))
        run.contaminate("qual-c0", "T7")
        if run.qual_status("R1") != "PASS":
            raise AssertionError("contaminating the failed session revoked the later pass")
        run.contaminate("qual-c1", "T8")
        if run.qual_status("R1") != "HOLD":
            raise AssertionError(run.qual_status("R1"))
        before = snapshot(run)
        try:
            run.issue_session(
                "qual-c2", "QUAL", "R1", 0, 1, first_packets, brief, app, "r1",
                "T9", "T10", "T11", True, input_ctx=first_ctx,
            )
            raise AssertionError("third qualification followed two consumed sessions")
        except s.Refusal as exc:
            if exc.code != "QUAL_EXHAUSTED":
                raise
        assert_unchanged(before, run)

    def test_eligible_reissue_after_freeze():
        first, key_first = s.build_packet(
            g, "MAIN", "R1", "SYN", "S", "F70", fact_for(70, "D-01"), "D-01", questions["D-01"]
        )
        second, key_second = s.build_packet(
            g, "MAIN", "R1", "SYN", "S", "F71", fact_for(71, "D-01"), "D-01", questions["D-01"]
        )
        q_packets, q_records, q_ctx = qual_material(g, "R1", 5700)
        transport = Script([jsonl(g, q_records), jsonl(g, [blind_s2(second)]), b"{}\n"])
        run = s.Run(g, transport)
        run.issue_session(
            "qual-re", "QUAL", "R1", 0, 0, q_packets, brief, app, "r1",
            "T0", "T1", "T2", True, input_ctx=q_ctx,
        )
        ctx = main_ctx(g, "R1", [first, second])
        run.issue_session(
            "main-re", "MAIN", "R1", 0, 0, [first, second], brief, app, "r1",
            "T3", "T4", "T5", True, input_ctx=ctx,
        )
        if not run.lacks_valid("MAIN", "R1", first["packetId"]) or run.lacks_valid("MAIN", "R1", second["packetId"]):
            raise AssertionError("omission was not eligible for reissue")
        run.freeze_blind([(key_first, "R1", first), (key_second, "R1", second)], "T6")
        run.send_fb("T7")
        held = snapshot(run)
        expect("eligible-reissue-plan-after-fb", "BLIND_FROZEN", lambda: run.reissue_plan(
            "MAIN", "R1", [first, second], [key_first, key_second]
        ))
        expect("eligible-reissue-after-fb", "BLIND_FROZEN", lambda: run.issue_session(
            "reissue-fb", "MAIN", "R1", 0, 1, [first], brief, app, "r1",
            "T8", "T9", "T10", True, input_ctx=ctx,
        ))
        assert_unchanged(held, run)
        ref = run.freeze_ref([{"tuple": key_second, "p1": second, "p2": second}], "T11")
        ref_bytes = bytes(ref["bytes"])
        ref_sha = ref["sha"]
        run.send_f("T12")
        held_f = snapshot(run)
        expect("eligible-reissue-after-f", "REF_FROZEN", lambda: run.issue_session(
            "reissue-f", "MAIN", "R1", 0, 1, [first], brief, app, "r1",
            "T13", "T14", "T15", True, input_ctx=ctx,
        ))
        expect("main-after-f-separate", "REF_FROZEN", lambda: run.issue_session(
            "main-f", "MAIN", "R1", 1, 0, [first], brief, app, "r1",
            "T16", "T17", "T18", True, input_ctx=ctx,
        ))
        assert_unchanged(held_f, run)
        if run.fref["bytes"] != ref_bytes or run.fref["sha"] != ref_sha:
            raise AssertionError("REF changed")

    def test_chal_after_f():
        text = fact_for(80, "D-04")
        domain = "D-04"
        left, key = s.build_packet(g, "MAIN", "R1", "SYN", "S", "F80", text, domain, questions[domain])
        right, _same = s.build_packet(g, "MAIN", "R2", "SYN", "S", "F80", text, domain, questions[domain])
        rec_left = blind_s2(left)
        rec_right = blind_s2(right)
        q1, q1_records, q1_ctx = qual_material(g, "R1", 5800)
        q2, q2_records, q2_ctx = qual_material(g, "R2", 5900)
        transport = Script([
            jsonl(g, q1_records), jsonl(g, q2_records), jsonl(g, [rec_left]), jsonl(g, [rec_right]), b"{}\n",
        ])
        run = s.Run(g, transport)
        run.issue_session(
            "qual-c-r1", "QUAL", "R1", 0, 0, q1, brief, app, "r1",
            "T0", "T1", "T2", True, input_ctx=q1_ctx,
        )
        run.issue_session(
            "qual-c-r2", "QUAL", "R2", 0, 0, q2, brief, app, "r2",
            "T3", "T4", "T5", True, input_ctx=q2_ctx,
        )
        stage1 = stage1_of([left])
        run.issue_session(
            "main-c-r1", "MAIN", "R1", 0, 0, [left], brief, app, "r1",
            "T6", "T7", "T8", True, input_ctx={"slot": "R1", "questions": questions, "stage1": stage1},
        )
        run.issue_session(
            "main-c-r2", "MAIN", "R2", 0, 0, [right], brief, app, "r2",
            "T9", "T10", "T11", True, input_ctx={"slot": "R2", "questions": questions, "stage1": stage1},
        )
        run.freeze_blind([(key, "R1", left), (key, "R2", right)], "T12")
        run.send_fb("T13")
        item = s.build_chal_item(g, left, rec_left, rec_right, "YES")
        chal_ctx = {
            "slot": "R1",
            "questions": questions,
            "stage1": stage1,
            "blind": {("R1", key): rec_left, ("R2", key): rec_right},
        }
        ok, why = g["validate_item_chal"](item, chal_ctx)
        if not ok:
            raise AssertionError(why)
        blind_bytes = bytes(run.fb["bytes"])
        blind_sha = run.fb["sha"]
        ref = run.freeze_ref([{"tuple": key, "p1": left, "p2": right}], "T14")
        ref_bytes = bytes(ref["bytes"])
        ref_sha = ref["sha"]
        run.send_f("T15")
        held = snapshot(run)
        expect("chal-after-f", "REF_FROZEN", lambda: run.issue_session(
            "chal-late", "CHAL", "R1", 0, 0, [item], b"CHAL BRIEF\n", app, "r1",
            "T16", "T17", "T18", True, input_ctx=chal_ctx,
        ))
        assert_unchanged(held, run)
        if run.fref["bytes"] != ref_bytes or run.fref["sha"] != ref_sha:
            raise AssertionError("REF changed")
        if run.fb["bytes"] != blind_bytes or run.fb["sha"] != blind_sha:
            raise AssertionError("BLIND changed")

    def sealed_y_run(number):
        domain = "D-03"
        text = fact_for(number, domain)
        left, key = s.build_packet(g, "MAIN", "R1", "SYN", "S", "F%d" % number, text, domain, questions[domain])
        right, _same = s.build_packet(g, "MAIN", "R2", "SYN", "S", "F%d" % number, text, domain, questions[domain])
        rec_left = blind_s2(left)
        rec_right = blind_s2(right)
        q1, q1_records, q1_ctx = qual_material(g, "R1", number + 1000)
        q2, q2_records, q2_ctx = qual_material(g, "R2", number + 2000)
        transport = Script(
            [
                jsonl(g, q1_records),
                jsonl(g, q2_records),
                jsonl(g, [rec_left]),
                jsonl(g, [rec_right]),
                jsonl(g, [confirm(left, rec_right)]),
                jsonl(g, [confirm(right, rec_left)]),
            ]
        )
        run = s.Run(g, transport)
        run.issue_session(
            "qual-a-%s" % number, "QUAL", "R1", 0, 0, q1, brief, app, "r1",
            "T0", "T1", "T2", True, input_ctx=q1_ctx,
        )
        run.issue_session(
            "qual-b-%s" % number, "QUAL", "R2", 0, 0, q2, brief, app, "r2",
            "T3", "T4", "T5", True, input_ctx=q2_ctx,
        )
        stage1 = stage1_of([left])
        run.issue_session(
            "main-a-%s" % number, "MAIN", "R1", 0, 0, [left], brief, app, "r1",
            "T6", "T7", "T8", True,
            input_ctx={"slot": "R1", "questions": questions, "stage1": stage1},
        )
        run.issue_session(
            "main-b-%s" % number, "MAIN", "R2", 0, 0, [right], brief, app, "r2",
            "T9", "T10", "T11", True,
            input_ctx={"slot": "R2", "questions": questions, "stage1": stage1},
        )
        run.freeze_blind([(key, "R1", left), (key, "R2", right)], "T12")
        run.send_fb("T13")
        item_left = s.build_chal_item(g, left, rec_left, rec_right, "YES")
        item_right = s.build_chal_item(g, right, rec_right, rec_left, "YES")
        blind_map = {("R1", key): rec_left, ("R2", key): rec_right}
        chal_ctx = {"slot": "R1", "questions": questions, "stage1": stage1, "blind": blind_map}
        chal_ctx_r2 = {"slot": "R2", "questions": questions, "stage1": stage1, "blind": blind_map}
        run.issue_session(
            "chal-a-%s" % number, "CHAL", "R1", 0, 0, [item_left], b"CHAL BRIEF\n", app, "r1",
            "T14", "T15", "T16", True, input_ctx=chal_ctx,
        )
        run.issue_session(
            "chal-b-%s" % number, "CHAL", "R2", 0, 0, [item_right], b"CHAL BRIEF\n", app, "r2",
            "T17", "T18", "T19", True, input_ctx=chal_ctx_r2,
        )
        ref = run.freeze_ref([{"tuple": key, "p1": left, "p2": right}], "T20")
        run.send_f("T21")
        case = decision_case(g, key, "Y")
        return run, key, case, ref

    def expect_without_evaluate(name, code, run, case):
        original = g["evaluate"]

        def trap(payload):
            raise AssertionError("%s called Annex G evaluate" % name)

        g["evaluate"] = trap
        try:
            expect(name, code, lambda: run.assemble_c7(case))
        finally:
            g["evaluate"] = original

    def test_ref_seal_authority():
        run, key, case, ref = sealed_y_run(9100)
        seal_bytes = bytes(run.fref["bytes"])
        seal_sha = run.fref["sha"]
        if ref["rows"][0]["label"] != "Y" or b'"label":"Y"' not in seal_bytes:
            raise AssertionError("fixture did not seal Y")
        if ref is run.fref or ref["rows"][0] is run.fref["rows"][0]:
            raise AssertionError("freeze_ref returned a live REF alias")
        before, _line = run.assemble_c7(case)
        if before["SI-6"] != g["SUFF"] or before["step"] != 5 or before["EP-1"] != g["SUR"]:
            raise AssertionError((before["SI-6"], before["step"], before["EP-1"]))
        if before["refSha"] != seal_sha:
            raise AssertionError("positive control used a different REF identity")
        duplicate = dict(case)
        duplicate["X"] = [key, key]
        expect("c7-duplicate-tuple", "LABEL_REF", lambda: run.assemble_c7(duplicate))
        ref["rows"][0]["label"] = "N"
        changed = copy.deepcopy(case)
        changed["labels"][key] = "N"
        expect_without_evaluate("codex-returned-alias", "LABEL_REF", run, changed)
        if run.fref["bytes"] != seal_bytes or run.fref["sha"] != seal_sha:
            raise AssertionError("Codex alias mutation changed the sealed REF")
        if run.fref["rows"][0]["label"] != "Y" or b'"label":"N"' in run.fref["bytes"]:
            raise AssertionError("authoritative REF followed the returned alias")
        if run.fps04 is not None:
            raise AssertionError("software inconsistency fired F-PS-04")
        again, _again_line = run.assemble_c7(case)
        if again["SI-6"] != before["SI-6"] or again["EP-1"] != before["EP-1"] or again["step"] != 5:
            raise AssertionError("untouched REF no longer reproduces the sealed result")

        run_b, key_b, case_b, _ref_b = sealed_y_run(9200)
        sealed_b = bytes(run_b.fref["bytes"])
        sha_b = run_b.fref["sha"]
        run_b.fref["rows"][0]["label"] = "N"
        if run_b.fref["bytes"] != sealed_b or run_b.fref["sha"] != sha_b:
            raise AssertionError("row mutation changed the seal")
        expect_without_evaluate("tampered-internal-rows-y", "REF_INTEGRITY", run_b, case_b)
        forged = copy.deepcopy(case_b)
        forged["labels"][key_b] = "N"
        expect_without_evaluate("tampered-internal-rows-n", "REF_INTEGRITY", run_b, forged)
        if run_b.fref["bytes"] != sealed_b or run_b.fref["sha"] != sha_b or run_b.fps04 is not None:
            raise AssertionError("row refusal rewrote the seal or fired F-PS-04")
        run_b.fref["rows"][0]["label"] = "Y"
        run_b.fref["rows"][0]["injected"] = "malformed"
        expect_without_evaluate("malformed-ref-row", "REF_INTEGRITY", run_b, case_b)
        if run_b.fref["bytes"] != sealed_b:
            raise AssertionError("malformed-row refusal rewrote sealed bytes")

        run_c, _key_c, case_c, _ref_c = sealed_y_run(9300)
        original_bytes = bytes(run_c.fref["bytes"])
        original_sha = run_c.fref["sha"]
        original_rows = [dict(row) for row in run_c.fref["rows"]]
        run_c.fref["bytes"] = original_bytes[:-2] + b"Z\n"
        expect_without_evaluate("tampered-ref-bytes", "REF_INTEGRITY", run_c, case_c)
        if run_c._ref_seal != (original_sha, original_bytes) or run_c.fps04 is not None:
            raise AssertionError("byte refusal replaced the private seal")
        run_c.fref["bytes"] = original_bytes
        run_c.fref["sha"] = "0" * 64
        expect_without_evaluate("tampered-ref-sha", "REF_INTEGRITY", run_c, case_c)
        forged_row = dict(original_rows[0])
        forged_row["label"] = "N"
        forged_blob = s.canonical_line_bytes(g, forged_row)
        run_c.fref["bytes"] = forged_blob
        run_c.fref["sha"] = s.sha256_bytes(forged_blob)
        run_c.fref["rows"] = [forged_row]
        expect_without_evaluate("substituted-ref-identity", "REF_INTEGRITY", run_c, forged)
        if run_c._ref_seal != (original_sha, original_bytes):
            raise AssertionError("substitution replaced the private seal")
        duplicate_blob = forged_blob + forged_blob
        run_c._ref_seal = (s.sha256_bytes(duplicate_blob), duplicate_blob)
        run_c.fref["bytes"] = duplicate_blob
        run_c.fref["sha"] = run_c._ref_seal[0]
        run_c.fref["rows"] = [dict(forged_row), dict(forged_row)]
        expect_without_evaluate("duplicate-sealed-tuple", "REF_INTEGRITY", run_c, forged)

    def test_journal_append_only():
        run = s.Run(g, None)
        run.journal.append("T0", "NOTE", "mem", "ab" * 32)
        before = run.journal.text()
        try:
            run.journal.rewrite(0, "changed")
            raise AssertionError("rewrite accepted")
        except s.Refusal as exc:
            if exc.code != "JOURNAL_APPEND_ONLY":
                raise
        if run.journal.text() != before:
            raise AssertionError("journal changed")

    check("source-pins", test_pins)
    expect("incorrect-hash", "IDENTITY_SHA", test_bad_identity)
    check("session-formula", test_session_formula)
    check("record-line-sha", test_record_line_sha)
    check("order-and-legal-batches", test_order_and_batches)
    expect("main-batch-41", "BATCH_SIZE", test_unauthorized_sizes)
    expect("main-nonfinal-39", "BATCH_SIZE", test_nonfinal_size)
    expect("qual-batch-9", "BATCH_SIZE", lambda: s.schedule_sizes("QUAL", 9))
    expect("chal-nonfinal-9", "BATCH_SIZE", lambda: s.assert_batch_sizes("CHAL", [9, 1]))
    expect("h-schedule", "H_EXTERNAL", lambda: s.schedule_sizes("H", 1))
    check("extraction-granularity", test_extraction_granularity)
    check("wrong-key-keeps-sibling", test_wrong_key_keeps_sibling)
    expect("third-attempt", "ATTEMPT", test_transport_failure_and_third_attempt)
    expect("interrupted-resume", "RESUME_NO_REISSUE", test_interrupted_resume)
    expect("modified-transcript", "TRANSCRIPT_MUTATED", test_hashes_and_transcript)
    expect("incorrect-input-hash", "INPUT_SHA", test_input_tamper)
    expect("premature-chal", "PREMATURE_CHAL", test_premature_and_batches_and_h)
    premature = s.Run(g, Script([b"{}\n"]))
    expect("premature-c7", "PREMATURE_RESULT", lambda: test_batch_and_h_and_result(premature, premature.transport))
    if premature.transport.calls != 0:
        raise AssertionError("premature result called transport")
    print("PASS", "premature-result-no-call")
    expect("h-item-external", "H_EXTERNAL", test_h_item)
    expect("retry-forbidden", "RETRY_FORBIDDEN", test_retry_config)
    expect("reissue-of-valid-record", "REISSUE_NOT_ELIGIBLE", test_reissue_omission_once)
    check("qual-packetid-alignment", test_qual_alignment)
    check("positive-chain-freeze-c7", test_positive_chain)
    check("contamination-reissue-eligibility", test_contamination)
    check("bad-main-packet-not-issued", test_bad_main_packet)
    check("main-without-qual", test_main_without_qual)
    check("qual-failure-then-authorized-main", test_qual_failure_then_second_session)
    check("qual-exhausted-hold", test_qual_exhausted_and_hold)
    check("qual-slot-isolation", test_qual_slot_isolation)
    check("missing-validation-context", test_missing_validation_context)
    check("qual-contamination-revoke", test_qual_contamination_revoke)
    check("eligible-reissue-after-freeze", test_eligible_reissue_after_freeze)
    check("chal-after-f-no-transport", test_chal_after_f)
    check("ref-seal-authority", test_ref_seal_authority)
    check("journal-append-only", test_journal_append_only)

    class HasRetry:
        def retry(self):
            return None

        def issue(self, payload):
            return b""

    expect("retry-method", "RETRY_FORBIDDEN", lambda: s.Run(g, HasRetry()))
    allowlist()
    print("PASS", "allowlist-after")
    print("SELF_VALIDATION_PASS")


if __name__ == "__main__":
    main()
