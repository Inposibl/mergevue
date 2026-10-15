# SI0-CORR2-EXECUTION-READINESS-1.CORR2.
# Offline readiness instrument. Not an SI-0 execution and not an independent audit.
# Python 3.9 standard library only. Annex G is loaded from the accepted protocol and is not copied here.

import hashlib
import json

PROTOCOL_SHA = "719826ab98ea25220781b062c69b243718b7ad764429a6602e1c44946745e847"
PROTOCOL_BYTES = 338049
ANNEX_G_SHA = "b776e90c7437ff64cacdce20788800b38c78633b9f8516209f4721dab7168015"
ANNEX_G_BYTES = 46440
EFCA_SHA = "5bb887d269e9079754e5a4f7417cd08f58d4ad5d5ff14503ca1dd98646176eba"
EFCA_BYTES = 97712
DECISIONS_SHA = "2379b320c2b4a78d37825c2704c8ae40c304a685a97b71c3d44c3f3f1fc7f41a"
DECISIONS_BYTES = 21258
ADDENDUM_SHA = "ce5be5652c0fe0ff6ec009af274c7d1c89e4bc4ee96ae292ec313866cf10017e"
ADDENDUM_BYTES = 9904

RES_03 = "OPTION_A"
HISTORICAL_VERDICT = "FAIL"
OD_B = "DECISION"
OD_C = "EXTERNAL"
X_DEC = 3536
EXECUTION_AUTHORIZED = False

PRECONDITIONS = ("P1", "P2", "P5", "P7", "P8", "P9")
BATCH_SIZE = {"MAIN": 40, "QUAL": 10, "CHAL": 10}
ALLOWLIST = ("si0_readiness.py", "validate_readiness.py")


class Refusal(Exception):
    def __init__(self, code, detail=None):
        self.code = code
        self.detail = detail
        if detail is None:
            super().__init__(code)
        else:
            super().__init__("%s: %s" % (code, detail))


class TransportFailure(Exception):
    pass


class Interrupted(Exception):
    pass


def sha256_bytes(blob):
    return hashlib.sha256(blob).hexdigest()


def check_source_identity(entries):
    checked = []
    for entry in entries:
        blob = entry["bytes"]
        if not isinstance(blob, (bytes, bytearray)):
            raise Refusal("IDENTITY_BYTES")
        blob = bytes(blob)
        digest = sha256_bytes(blob)
        if digest != entry["sha256"]:
            raise Refusal("IDENTITY_SHA")
        if "byteCount" in entry and entry["byteCount"] != len(blob):
            raise Refusal("IDENTITY_LEN")
        checked.append({"path": entry["path"], "sha256": digest, "bytes": len(blob)})
    return checked


def extract_annex_g(raw):
    comment = b"<!-- SI0CR1-ANNEX-G-CODE-BEGIN -->\n"
    marker = b"```python\n"
    origin = raw.find(comment)
    if origin < 0:
        raise Refusal("ANNEX_G_FENCE")
    start = raw.find(marker, origin)
    if start < 0:
        raise Refusal("ANNEX_G_FENCE")
    lines = raw[start + len(marker):].splitlines(keepends=True)
    kept = []
    for line in lines:
        if line in (b"```\n", b"```\r\n", b"```"):
            return b"".join(kept)
        kept.append(line)
    raise Refusal("ANNEX_G_FENCE")


def load_annex_g(protocol_path):
    with open(protocol_path, "rb") as handle:
        raw = handle.read()
    if len(raw) != PROTOCOL_BYTES or sha256_bytes(raw) != PROTOCOL_SHA:
        raise Refusal("PROTOCOL_SHA")
    code = extract_annex_g(raw)
    if len(code) != ANNEX_G_BYTES or sha256_bytes(code) != ANNEX_G_SHA:
        raise Refusal("ANNEX_G_SHA")
    namespace = {}
    exec(compile(code, "<annex-g>", "exec"), namespace, namespace)
    ok, summary = namespace["run_all"]()
    if ok is not True:
        raise Refusal("RUN_ALL")
    if summary["si6"] != (1048576, 1, 0) or summary["cxMinor01"] != (1296, 0, 54):
        raise Refusal("RUN_ALL")
    namespace["_protocol_sha"] = PROTOCOL_SHA
    namespace["_annex_sha"] = ANNEX_G_SHA
    return namespace


def reject_transport_config(config):
    if config is None:
        return
    if not isinstance(config, dict):
        raise Refusal("TRANSPORT_CONFIG")
    banned = {"fallback", "retry", "max_retries", "maxRetries", "fallbackModel"}
    found = sorted(banned & set(config))
    if found:
        raise Refusal("RETRY_FORBIDDEN", ",".join(found))


def reject_transport(transport):
    if transport is None:
        return
    for name in ("retry", "fallback"):
        if hasattr(transport, name):
            raise Refusal("RETRY_FORBIDDEN", name)


def order_digest(phase, slot, key):
    return hashlib.sha256(
        ("SI0CR1|order|%s|%s|%s" % (phase, slot, key)).encode("utf-8")
    ).hexdigest()


def schedule_sizes(phase, count):
    if phase == "H":
        raise Refusal("H_EXTERNAL")
    if phase == "QUAL":
        if count != 10:
            raise Refusal("BATCH_SIZE")
        return [10]
    if phase not in ("MAIN", "CHAL") or count < 1:
        raise Refusal("BATCH_SIZE")
    size = BATCH_SIZE[phase]
    sizes = []
    left = count
    while left > size:
        sizes.append(size)
        left -= size
    sizes.append(left)
    return sizes


def assert_batch_sizes(phase, sizes):
    if phase == "H":
        raise Refusal("H_EXTERNAL")
    if phase == "QUAL":
        if list(sizes) != [10]:
            raise Refusal("BATCH_SIZE")
        return
    if phase not in BATCH_SIZE or not sizes:
        raise Refusal("BATCH_SIZE")
    limit = BATCH_SIZE[phase]
    last = len(sizes) - 1
    for index, count in enumerate(sizes):
        if index == last:
            if not (1 <= count <= limit):
                raise Refusal("BATCH_SIZE")
        elif count != limit:
            raise Refusal("BATCH_SIZE")


def canonical_line(g, obj):
    return g["canon"](obj) + "\n"


def canonical_line_bytes(g, obj):
    return canonical_line(g, obj).encode("utf-8")


def record_sha(g, obj):
    # Annex C: a record is a canonical JSON line. Section 11.4 defines that line as canon bytes plus one LF.
    return sha256_bytes(canonical_line_bytes(g, obj))


def build_app(g, questions):
    missing = [domain for domain in g["DS"] if domain not in questions]
    if missing:
        raise Refusal("APP_QUESTIONS", ",".join(missing))
    parts = g["question_parts"]
    head = "".join(domain + ": " + questions[domain] + "\n" for domain in g["DS"])
    tail = "".join(
        domain
        + " parts: "
        + " | ".join(
            "[%d] %s" % (number, questions[domain][start:stop].strip())
            for number, (start, stop) in enumerate(parts(questions[domain]), 1)
        )
        + "\n"
        for domain in g["DS"]
    )
    return head + tail


def build_packet(g, phase, slot, case_id, side_id, fact_id, fact_text, domain, question):
    if phase == "H":
        raise Refusal("H_EXTERNAL")
    if phase == "QUAL":
        case_id = g["QUAL_CASE"]
        side_id = g["QUAL_SIDE"]
    if phase not in ("MAIN", "QUAL", "CHAL"):
        raise Refusal("PHASE")
    key = "|".join((case_id, side_id, fact_id, domain))
    identity_phase = "MAIN" if phase == "CHAL" else phase
    packet = {
        "packetId": g["pid"](identity_phase, slot, key),
        "caseId": case_id,
        "sideId": side_id,
        "factId": fact_id,
        "factText": fact_text,
        "d": domain,
        "question": question,
    }
    return packet, key


def session_input_bytes(phase, brief, app, items, g):
    if phase == "H":
        raise Refusal("H_EXTERNAL")
    if phase not in ("MAIN", "QUAL", "CHAL"):
        raise Refusal("PHASE")
    if not isinstance(brief, (bytes, bytearray)):
        raise Refusal("BRIEF")
    if not isinstance(app, str):
        raise Refusal("APP")
    body = "".join(canonical_line(g, item) for item in items).encode("utf-8")
    return bytes(brief) + b"\n" + app.encode("utf-8") + body


def build_chal_item(g, packet, own_record, other_record, shared_output):
    return {
        "packetId": packet["packetId"],
        "packet": packet,
        "ownRecord": own_record,
        "otherRecord": g["strip_pid"](other_record),
        "sharedOutput": shared_output,
    }


def extract_records(output, issued_ids, g):
    """Associate canonical records by identifier.

    A line is a candidate only when its exact bytes are one canonical JSON line.
    Unique candidates whose identifier was issued are returned. A malformed line,
    a duplicate identifier, a missing identifier, or an extraneous identifier does
    not remove any other unique candidate. Line order is reported and is not a
    rejection condition. outputSha is the SHA-256 of these unmodified bytes.
    """
    if not isinstance(output, (bytes, bytearray)):
        raise Refusal("OUTPUT_BYTES")
    output = bytes(output)
    report = {
        "outputSha": sha256_bytes(output),
        "byId": {},
        "lineBytes": {},
        "missing": [],
        "duplicate": [],
        "extraneous": [],
        "malformed": [],
        "observedOrder": [],
    }
    if output.endswith(b"\n"):
        parts = output.split(b"\n")[:-1]
    else:
        parts = output.split(b"\n")[:-1]
        report["malformed"].append({"index": len(parts), "reason": "missing-lf"})
    issued = []
    seen = set()
    for ident in issued_ids:
        if ident in seen:
            raise Refusal("DUPLICATE_ISSUE")
        seen.add(ident)
        issued.append(ident)
    groups = {}
    for index, raw_line in enumerate(parts):
        try:
            line = raw_line.decode("utf-8")
        except UnicodeDecodeError:
            report["malformed"].append({"index": index, "reason": "utf-8"})
            continue
        if line == "":
            report["malformed"].append({"index": index, "reason": "empty"})
            continue
        try:
            obj = json.loads(line)
        except json.JSONDecodeError:
            report["malformed"].append({"index": index, "reason": "json"})
            continue
        if not isinstance(obj, dict) or line != g["canon"](obj):
            report["malformed"].append({"index": index, "reason": "noncanonical"})
            continue
        has_packet = "packetId" in obj
        has_fact = "factKey" in obj
        if has_packet == has_fact:
            report["malformed"].append({"index": index, "reason": "identity"})
            continue
        ident = obj["packetId"] if has_packet else obj["factKey"]
        if not isinstance(ident, str):
            report["malformed"].append({"index": index, "reason": "identity"})
            continue
        report["observedOrder"].append(ident)
        groups.setdefault(ident, []).append((obj, raw_line + b"\n"))
    for ident, hits in groups.items():
        if ident not in seen:
            report["extraneous"].append(ident)
            continue
        if len(hits) != 1:
            report["duplicate"].append(ident)
            continue
        obj, line_bytes = hits[0]
        report["byId"][ident] = obj
        report["lineBytes"][ident] = line_bytes
    for ident in issued:
        if ident not in report["byId"] and ident not in set(report["duplicate"]):
            report["missing"].append(ident)
    report["duplicate"].sort()
    report["extraneous"].sort()
    return report


def _validate_received(g, phase, item, record):
    if phase in ("MAIN", "QUAL"):
        return g["validate_blind"](record, item)
    if phase == "CHAL":
        return g["validate_chal"](
            record,
            item["packet"],
            item["ownRecord"],
            item["otherRecord"],
            item["sharedOutput"],
        )
    raise Refusal("H_EXTERNAL")


class Journal:
    def __init__(self):
        self._lines = []

    def append(self, time, event, path, digest):
        for field in (time, event, path, digest):
            if not isinstance(field, str) or "\n" in field or " | " in field:
                raise Refusal("JOURNAL_FIELD")
        self._lines.append("%s | %s | %s | %s" % (time, event, path, digest))

    def text(self):
        if not self._lines:
            return ""
        return "\n".join(self._lines) + "\n"

    def sha(self):
        return sha256_bytes(self.text().encode("utf-8"))

    def rewrite(self, index, value):
        raise Refusal("JOURNAL_APPEND_ONLY")


class Run:
    def __init__(self, g, transport=None, config=None):
        reject_transport_config(config)
        reject_transport(transport)
        self.g = g
        self.transport = transport
        self.journal = Journal()
        self.sessions = {}
        self.records = {}
        self.archive = []
        self.issued_attempt = {}
        self.open_ids = set()
        self.fb = None
        self.fref = None
        self._ref_seal = None
        self.frozen_blind = False
        self.frozen_ref = False
        self.fps04 = None
        self.defects = []
        self.route = OD_C
        self.execution_authorized = EXECUTION_AUTHORIZED
        self.qual = {}

    def _element_key(self, phase, slot, ident):
        return (phase, slot, ident)

    def _open(self, phase, slot, ident):
        return self._element_key(phase, slot, ident) in self.open_ids

    def lacks_valid(self, phase, slot, ident):
        rec = self.records.get(self._element_key(phase, slot, ident))
        return rec is None or rec["contaminated"]

    def used(self, phase, slot, ident):
        rec = self.records.get(self._element_key(phase, slot, ident))
        if rec is None or rec["contaminated"]:
            return None
        return rec

    def _release(self, phase, slot, ident):
        self.open_ids.discard(self._element_key(phase, slot, ident))

    def _note_defect(self):
        self.defects.append("MUTATION_AFTER_FREEZE")
        self.fps04 = self.g["FIRED"]

    def resume(self, session_id):
        if session_id not in self.sessions:
            raise Refusal("UNKNOWN_SESSION")
        raise Refusal("RESUME_NO_REISSUE")

    def qual_status(self, slot):
        state = self.qual.get(slot)
        if state is None:
            return "OPEN"
        return state["status"]

    def _qual_gate(self, slot):
        state = self.qual.get(slot)
        status = "OPEN" if state is None else state["status"]
        used = 0 if state is None else state["used"]
        if status == "PASS":
            raise Refusal("QUAL_CLOSED")
        if status == "HOLD" or used >= 2:
            raise Refusal("QUAL_EXHAUSTED")
        return used

    def _require_main_qualification(self, slot):
        state = self.qual.get(slot)
        if state is None or state["status"] != "PASS" or state.get("passSession") not in self.sessions:
            if state is not None and state["status"] == "HOLD":
                raise Refusal("QUAL_HOLD")
            raise Refusal("QUAL_REQUIRED")

    def _require_main_context(self, slot, ctx):
        if not isinstance(ctx, dict) or ctx.get("slot") != slot:
            raise Refusal("MAIN_CONTEXT")
        if not isinstance(ctx.get("questions"), dict) or not isinstance(ctx.get("stage1"), dict):
            raise Refusal("MAIN_CONTEXT")

    def _qual_bank(self, slot, items, ctx):
        if not isinstance(ctx, dict) or ctx.get("slot") != slot:
            raise Refusal("QUAL_CONTEXT")
        questions = ctx.get("questions")
        bank = ctx.get("bank")
        if not isinstance(questions, dict) or not isinstance(bank, dict) or len(bank) != 10:
            raise Refusal("QUAL_CONTEXT")
        fact_ids = []
        for item in items:
            if not isinstance(item, dict) or not isinstance(item.get("factId"), str):
                raise Refusal("QUAL_CONTEXT")
            fact_ids.append(item["factId"])
        if len(fact_ids) != len(set(fact_ids)) or set(fact_ids) != set(bank):
            raise Refusal("QUAL_CONTEXT")
        copied = {}
        for fact_id, row in bank.items():
            if not isinstance(fact_id, str) or not isinstance(row, dict):
                raise Refusal("QUAL_CONTEXT")
            text = row.get("factText")
            domain = row.get("d")
            output = row.get("output")
            if not isinstance(text, str) or not isinstance(domain, str) or output not in ("YES", "NO"):
                raise Refusal("QUAL_CONTEXT")
            copied[fact_id] = {"factText": text, "d": domain, "output": output}
        return copied

    def _close_qual(self, session, passed):
        if session.get("qualClosed"):
            return
        session["qualClosed"] = True
        state = self.qual.get(session["slot"])
        if state is None:
            state = {"status": "OPEN", "used": 0, "passSession": None}
            self.qual[session["slot"]] = state
        state["used"] = state["used"] + 1
        if state.get("bank") is None and session.get("bank") is not None:
            state["bank"] = session["bank"]
        if passed is True:
            state["status"] = "PASS"
            state["passSession"] = session["sessionId"]
            return
        state["passSession"] = None
        if state["used"] >= 2:
            state["status"] = "HOLD"
        else:
            state["status"] = "OPEN"

    def _revoke_qual_pass(self, session):
        state = self.qual.get(session["slot"])
        if state is None or state.get("passSession") != session["sessionId"]:
            return
        state["passSession"] = None
        if state["used"] >= 2:
            state["status"] = "HOLD"
        else:
            state["status"] = "OPEN"

    def issue_session(
        self,
        session_id,
        phase,
        slot,
        batch_index,
        attempt,
        items,
        brief,
        app,
        issued_to,
        issued_at,
        sealed_at,
        seal_received_at,
        is_final,
        input_ctx=None,
    ):
        if phase == "H":
            raise Refusal("H_EXTERNAL")
        if self.frozen_ref:
            raise Refusal("REF_FROZEN")
        if phase in ("MAIN", "QUAL") and self.frozen_blind:
            raise Refusal("BLIND_FROZEN")
        if phase == "CHAL" and not (self.fb and self.fb.get("sentAt")):
            raise Refusal("PREMATURE_CHAL")
        if phase not in BATCH_SIZE:
            raise Refusal("PHASE")
        qual_used = None
        if phase == "QUAL":
            qual_used = self._qual_gate(slot)
        if attempt not in (0, 1):
            raise Refusal("ATTEMPT")
        if session_id in self.sessions:
            raise Refusal("RESUME_NO_REISSUE")
        if not items:
            raise Refusal("BATCH_SIZE")
        limit = BATCH_SIZE[phase]
        count = len(items)
        if phase == "QUAL":
            if count != 10:
                raise Refusal("BATCH_SIZE")
        elif is_final:
            if not (1 <= count <= limit):
                raise Refusal("BATCH_SIZE")
        elif count != limit:
            raise Refusal("BATCH_SIZE")
        idents = []
        for item in items:
            if not isinstance(item, dict) or not isinstance(item.get("packetId"), str):
                raise Refusal("ITEM_ID")
            ident = item["packetId"]
            if ident in idents:
                raise Refusal("DUPLICATE_ISSUE")
            idents.append(ident)
            key = self._element_key(phase, slot, ident)
            if key in self.open_ids:
                raise Refusal("RESUME_NO_REISSUE")
            if phase == "QUAL":
                # Section 6.6 authorizes a second fresh bank session, not an element reissue.
                continue
            prev = self.issued_attempt.get(key)
            if attempt == 0 and prev is not None:
                raise Refusal("ATTEMPT")
            if attempt == 1:
                if prev != 0 or not self.lacks_valid(phase, slot, ident):
                    raise Refusal("ATTEMPT" if prev != 0 else "REISSUE_NOT_ELIGIBLE")
        if phase == "QUAL" and attempt != qual_used:
            raise Refusal("ATTEMPT")
        if phase == "MAIN":
            self._require_main_qualification(slot)
        bank_copy = None
        if phase == "MAIN":
            self._require_main_context(slot, input_ctx)
            for item in items:
                ok, why = self.g["validate_packet_main"](item, input_ctx)
                if not ok:
                    raise Refusal("MAIN_PACKET", why)
        elif phase == "QUAL":
            bank_copy = self._qual_bank(slot, items, input_ctx)
            stored = self.qual.get(slot)
            if stored is not None and stored.get("bank") is not None and bank_copy != stored["bank"]:
                raise Refusal("QUAL_CONTEXT")
            qual_ctx = {"slot": slot, "questions": input_ctx["questions"], "bank": bank_copy}
            for item in items:
                ok, why = self.g["validate_packet_qual"](item, qual_ctx)
                if not ok:
                    raise Refusal("QUAL_PACKET", why)
        elif phase == "CHAL":
            if input_ctx is None:
                raise Refusal("CHAL_CONTEXT")
            for item in items:
                ok, why = self.g["validate_item_chal"](item, input_ctx)
                if not ok:
                    raise Refusal("CHAL_ITEM", why)
        if self.transport is not None and (sealed_at is None or seal_received_at is None):
            raise Refusal("TIMESTAMPS")
        raw_input = session_input_bytes(phase, brief, app, items, self.g)
        input_sha = sha256_bytes(raw_input)
        session = {
            "sessionId": session_id,
            "slot": slot,
            "phase": phase,
            "batch": batch_index,
            "attempt": attempt,
            "inputSha": input_sha,
            "inputBytes": raw_input,
            "brief": bytes(brief),
            "app": app,
            "items": items,
            "transcriptRef": "mem:%s" % session_id,
            "transcript": None,
            "outputSha": None,
            "issuedTo": issued_to,
            "issuedAt": issued_at,
            "sealedAt": None,
            "sealReceivedAt": None,
            "status": "ISSUED",
            "contaminated": False,
            "extraction": None,
            "validIds": [],
            "rejected": [],
            "bank": bank_copy,
            "qualClosed": False,
        }
        self.sessions[session_id] = session
        for ident in idents:
            self.issued_attempt[self._element_key(phase, slot, ident)] = attempt
            self.open_ids.add(self._element_key(phase, slot, ident))
        self.journal.append(issued_at, "ISSUE", session["transcriptRef"], input_sha)
        try:
            if self.transport is None:
                raise Interrupted()
            output = self.transport.issue(raw_input)
        except Interrupted:
            session["status"] = "INTERRUPTED"
            self.journal.append(issued_at, "INTERRUPTED", session["transcriptRef"], input_sha)
            for ident in idents:
                self._release(phase, slot, ident)
            if phase == "QUAL":
                self._close_qual(session, False)
            return session
        except TransportFailure:
            session["status"] = "TRANSPORT_FAILURE"
            self.journal.append(issued_at, "TRANSPORT_FAILURE", session["transcriptRef"], input_sha)
            for ident in idents:
                self._release(phase, slot, ident)
            if phase == "QUAL":
                self._close_qual(session, False)
            return session
        return self._receive(session, output, sealed_at, seal_received_at)

    def _receive(self, session, output, sealed_at, seal_received_at):
        phase = session["phase"]
        slot = session["slot"]
        output = bytes(output)
        session["transcript"] = output
        session["outputSha"] = sha256_bytes(output)
        session["sealedAt"] = sealed_at
        session["sealReceivedAt"] = seal_received_at
        session["status"] = "RECEIVED"
        self.journal.append(seal_received_at, "OUTPUT", session["transcriptRef"], session["outputSha"])
        extracted = extract_records(output, [item["packetId"] for item in session["items"]], self.g)
        session["extraction"] = {
            "outputSha": extracted["outputSha"],
            "missing": list(extracted["missing"]),
            "duplicate": list(extracted["duplicate"]),
            "extraneous": list(extracted["extraneous"]),
            "malformed": list(extracted["malformed"]),
            "observedOrder": list(extracted["observedOrder"]),
        }
        valid_ids = []
        rejected = []
        passed = False
        try:
            if extracted["outputSha"] != session["outputSha"]:
                raise Refusal("OUTPUT_SHA")
            for item in session["items"]:
                ident = item["packetId"]
                self._release(phase, slot, ident)
                record = extracted["byId"].get(ident)
                if record is None:
                    continue
                ok, why = _validate_received(self.g, phase, item, record)
                if not ok:
                    rejected.append({"id": ident, "reason": why})
                    continue
                line_bytes = extracted["lineBytes"][ident]
                if line_bytes != canonical_line_bytes(self.g, record):
                    raise Refusal("RECORD_BYTES")
                stored = {
                    "record": record,
                    "sha": sha256_bytes(line_bytes),
                    "attempt": session["attempt"],
                    "sessionId": session["sessionId"],
                    "contaminated": False,
                    "phase": phase,
                    "slot": slot,
                }
                key = self._element_key(phase, slot, ident)
                previous = self.records.get(key)
                if previous is not None:
                    self.archive.append(previous)
                self.records[key] = stored
                valid_ids.append(ident)
            session["validIds"] = valid_ids
            session["rejected"] = rejected
            if phase == "QUAL":
                accepted = set(valid_ids)
                ordered = []
                for item in session["items"]:
                    ident = item["packetId"]
                    if ident in accepted:
                        ordered.append(self.records[self._element_key(phase, slot, ident)]["record"])
                    else:
                        ordered.append(None)
                passed = self.g["qual_pass"](session["items"], ordered, session["bank"]) is True
        finally:
            if phase == "QUAL":
                self._close_qual(session, passed)
        return session

    def check_transcript(self, session_id):
        session = self.sessions[session_id]
        if session["outputSha"] is None or session["transcript"] is None:
            raise Refusal("NO_OUTPUT")
        if sha256_bytes(session["transcript"]) != session["outputSha"]:
            raise Refusal("TRANSCRIPT_MUTATED")
        return session["outputSha"]

    def check_input(self, session_id):
        session = self.sessions[session_id]
        rebuilt = session_input_bytes(
            session["phase"], session["brief"], session["app"], session["items"], self.g
        )
        if sha256_bytes(rebuilt) != session["inputSha"] or rebuilt != session["inputBytes"]:
            raise Refusal("INPUT_SHA")
        return session["inputSha"]

    def contaminate(self, session_id, time):
        if session_id not in self.sessions:
            raise Refusal("UNKNOWN_SESSION")
        if self.frozen_blind or self.frozen_ref:
            self._note_defect()
            raise Refusal("MUTATION_AFTER_FREEZE")
        session = self.sessions[session_id]
        session["contaminated"] = True
        for rec in self.records.values():
            if rec["sessionId"] == session_id:
                rec["contaminated"] = True
                self.archive.append(dict(rec))
        self._revoke_qual_pass(session)
        self.journal.append(time, "CONTAMINATED", session["transcriptRef"], session["inputSha"])
        return session

    def reissue_plan(self, phase, slot, items, keys):
        if phase == "H":
            raise Refusal("H_EXTERNAL")
        if self.frozen_ref:
            raise Refusal("REF_FROZEN")
        if phase in ("MAIN", "QUAL") and self.frozen_blind:
            raise Refusal("BLIND_FROZEN")
        if phase == "QUAL":
            raise Refusal("QUAL_FRESH_SESSION")
        if len(items) != len(keys):
            raise Refusal("REISSUE_PLAN")
        eligible = []
        for item, key in zip(items, keys):
            ident = item["packetId"]
            if self._open(phase, slot, ident):
                raise Refusal("RESUME_NO_REISSUE")
            if self.lacks_valid(phase, slot, ident):
                eligible.append((order_digest(phase, slot, key), item))
        eligible.sort(key=lambda pair: pair[0])
        ordered = [item for _, item in eligible]
        if not ordered:
            return []
        sizes = schedule_sizes(phase, len(ordered))
        batches = []
        cursor = 0
        for size in sizes:
            batches.append(ordered[cursor:cursor + size])
            cursor += size
        return batches

    def freeze_blind(self, pairs, frozen_at):
        if self.frozen_blind:
            self._note_defect()
            raise Refusal("MUTATION_AFTER_FREEZE")
        rows = []
        for tuple_key, slot, packet in pairs:
            rec = self.used("MAIN", slot, packet["packetId"])
            rows.append(
                {
                    "tuple": tuple_key,
                    "slot": slot,
                    "record": None if rec is None else rec["sha"],
                }
            )
        rows.sort(key=lambda row: (row["tuple"], row["slot"]))
        blob = b"".join(canonical_line_bytes(self.g, row) for row in rows)
        self.fb = {
            "sha": sha256_bytes(blob),
            "bytes": blob,
            "rows": rows,
            "sentAt": None,
            "frozenAt": frozen_at,
        }
        self.frozen_blind = True
        self.journal.append(frozen_at, "FB", "BLIND", self.fb["sha"])
        return self.fb

    def send_fb(self, time):
        if not self.fb:
            raise Refusal("NO_FB")
        if self.fb["sentAt"] is not None:
            raise Refusal("ALREADY_SENT")
        self.fb["sentAt"] = time
        self.journal.append(time, "FB_SENT", "BLIND", self.fb["sha"])
        return self.fb

    def freeze_ref(self, specs, frozen_at):
        if not (self.fb and self.fb.get("sentAt")):
            raise Refusal("PREMATURE_REF")
        if self.frozen_ref:
            self._note_defect()
            raise Refusal("MUTATION_AFTER_FREEZE")
        rows = []
        for spec in specs:
            left = self.used("MAIN", "R1", spec["p1"]["packetId"])
            right = self.used("MAIN", "R2", spec["p2"]["packetId"])
            chal_left = self.used("CHAL", "R1", spec["p1"]["packetId"])
            chal_right = self.used("CHAL", "R2", spec["p2"]["packetId"])
            label, basis = self.g["assign_label"](
                spec["p1"],
                spec["p2"],
                None if left is None else left["record"],
                None if right is None else right["record"],
                None if chal_left is None else chal_left["record"],
                None if chal_right is None else chal_right["record"],
            )
            rows.append(
                {
                    "tuple": spec["tuple"],
                    "label": label,
                    "basis": basis,
                    "r1": None if left is None else left["sha"],
                    "r2": None if right is None else right["sha"],
                    "c1": None if chal_left is None else chal_left["sha"],
                    "c2": None if chal_right is None else chal_right["sha"],
                }
            )
        rows.sort(key=lambda row: row["tuple"])
        blob = b"".join(canonical_line_bytes(self.g, row) for row in rows)
        digest = sha256_bytes(blob)
        self._ref_seal = (digest, blob)
        self.fref = {
            "sha": digest,
            "bytes": blob,
            "rows": rows,
            "sentAt": None,
            "frozenAt": frozen_at,
        }
        self.frozen_ref = True
        self.journal.append(frozen_at, "F", "REF", digest)
        return self._ref_view()

    def _ref_view(self):
        ref = self.fref
        return {
            "sha": ref["sha"],
            "bytes": ref["bytes"],
            "rows": [dict(row) for row in ref["rows"]],
            "sentAt": ref["sentAt"],
            "frozenAt": ref["frozenAt"],
        }

    def _decode_ref_blob(self, blob):
        if not isinstance(blob, (bytes, bytearray)):
            raise Refusal("REF_INTEGRITY")
        blob = bytes(blob)
        if not blob.endswith(b"\n"):
            raise Refusal("REF_INTEGRITY")
        rows = []
        seen = set()
        rebuilt = []
        for raw in blob.split(b"\n")[:-1]:
            if raw == b"":
                raise Refusal("REF_INTEGRITY")
            try:
                text = raw.decode("utf-8")
                obj = json.loads(text)
            except (UnicodeDecodeError, json.JSONDecodeError):
                raise Refusal("REF_INTEGRITY")
            if (
                not isinstance(obj, dict)
                or set(obj) != {"tuple", "label", "basis", "r1", "r2", "c1", "c2"}
                or text != self.g["canon"](obj)
            ):
                raise Refusal("REF_INTEGRITY")
            identity = obj["tuple"]
            label = obj["label"]
            if not isinstance(identity, str) or identity == "" or identity in seen:
                raise Refusal("REF_INTEGRITY")
            if label not in self.g["LABELS"]:
                raise Refusal("REF_INTEGRITY")
            if not isinstance(obj["basis"], str):
                raise Refusal("REF_INTEGRITY")
            for name in ("r1", "r2", "c1", "c2"):
                value = obj[name]
                if value is not None and (not isinstance(value, str) or len(value) != 64):
                    raise Refusal("REF_INTEGRITY")
            seen.add(identity)
            rows.append(obj)
            rebuilt.append(raw + b"\n")
        if b"".join(rebuilt) != blob:
            raise Refusal("REF_INTEGRITY")
        if [row["tuple"] for row in rows] != sorted(identity for identity in seen):
            raise Refusal("REF_INTEGRITY")
        return rows

    def _authenticated_ref(self):
        seal = self._ref_seal
        public = self.fref
        if (
            not isinstance(seal, tuple)
            or len(seal) != 2
            or not isinstance(public, dict)
        ):
            raise Refusal("REF_INTEGRITY")
        digest, blob = seal
        if not isinstance(digest, str) or not isinstance(blob, (bytes, bytearray)):
            raise Refusal("REF_INTEGRITY")
        blob = bytes(blob)
        if sha256_bytes(blob) != digest:
            raise Refusal("REF_INTEGRITY")
        if public.get("sha") != digest or public.get("bytes") != blob:
            raise Refusal("REF_INTEGRITY")
        rows = self._decode_ref_blob(blob)
        cached = public.get("rows")
        if not isinstance(cached, list) or cached != rows:
            raise Refusal("REF_INTEGRITY")
        labels = {}
        for row in rows:
            labels[row["tuple"]] = row["label"]
        return labels, digest

    def send_f(self, time):
        if not self.fref:
            raise Refusal("NO_F")
        if self.fref["sentAt"] is not None:
            raise Refusal("ALREADY_SENT")
        self.fref["sentAt"] = time
        self.journal.append(time, "F_SENT", "REF", self.fref["sha"])
        return self._ref_view()

    def mutate_after_freeze(self):
        if not (self.frozen_blind or self.frozen_ref):
            raise Refusal("RECORD_IMMUTABLE")
        self._note_defect()
        raise Refusal("MUTATION_AFTER_FREEZE")

    def _checked_preconditions(self, case):
        pre = case.get("pre")
        if not isinstance(pre, dict):
            raise Refusal("PRECONDITION")
        if set(pre) != set(PRECONDITIONS):
            raise Refusal("PRECONDITION")
        return {name: pre[name] for name in PRECONDITIONS}

    def assemble_c7(self, case):
        if not (self.fb and self.fb.get("sentAt") and self.fref and self.fref.get("sentAt")):
            raise Refusal("PREMATURE_RESULT")
        if case.get("scope") != OD_B:
            raise Refusal("SCOPE")
        if case.get("route") != OD_C:
            raise Refusal("ROUTE")
        if case.get("h21"):
            raise Refusal("H_EXTERNAL")
        process = case.get("process")
        if not isinstance(process, dict) or "F-PS-04" not in process or "F-PS-07" not in process:
            raise Refusal("PROCESS")
        pre = self._checked_preconditions(case)
        frozen_labels, ref_sha = self._authenticated_ref()
        supplied = case.get("labels")
        population = case.get("X")
        if supplied != frozen_labels:
            raise Refusal("LABEL_REF")
        if (
            not isinstance(population, list)
            or len(population) != len(set(population))
            or set(population) != set(frozen_labels)
        ):
            raise Refusal("LABEL_REF")
        labels = dict(frozen_labels)
        fps04 = self.fps04 if self.fps04 is not None else process["F-PS-04"]
        evaluated = self.g["evaluate"](
            {
                "labels": labels,
                "X": list(population),
                "clauses": case["clauses"],
                "stratum": case["stratum"],
                "cells": case["cells"],
                "route": OD_C,
                "h21": {},
                "process": {"F-PS-04": fps04, "F-PS-07": process["F-PS-07"]},
                "pre": pre,
            }
        )
        clause_states = {clause["id"]: self.g["clause_state"](clause, labels) for clause in case["clauses"]}
        materiality = {
            clause["id"]: self.g["label_materiality"](clause, labels) for clause in case["clauses"]
        }
        c7 = {
            "protocolSha": PROTOCOL_SHA,
            "scope": OD_B,
            "route": OD_C,
            "hGate": evaluated["hGate"],
            "blindSha": self.fb["sha"],
            "refSha": ref_sha,
            "h21Sha": None,
            "EP-1": evaluated["EP-1"],
            "clauseStates": clause_states,
            "labelMateriality": materiality,
            "h21States": {},
            "coverage": evaluated["coverage"],
            "falsifiers": evaluated["falsifiers"],
            "preconditions": pre,
            "SI-6": evaluated["SI-6"],
            "step": evaluated["step"],
        }
        line = canonical_line_bytes(self.g, c7)
        return c7, line

    def iv_export(self, c7, c7_line):
        sessions = []
        for session_id in sorted(self.sessions):
            session = self.sessions[session_id]
            sessions.append(
                {
                    "sessionId": session_id,
                    "slot": session["slot"],
                    "phase": session["phase"],
                    "batch": session["batch"],
                    "attempt": session["attempt"],
                    "inputSha": session["inputSha"],
                    "transcriptRef": session["transcriptRef"],
                    "outputSha": session["outputSha"],
                    "issuedTo": session["issuedTo"],
                    "issuedAt": session["issuedAt"],
                    "sealedAt": session["sealedAt"],
                    "sealReceivedAt": session["sealReceivedAt"],
                    "status": session["status"],
                    "validIds": list(session["validIds"]),
                    "extraction": session["extraction"],
                }
            )
        payload = {
            "act": "SI0-CORR2-EXECUTION-READINESS-1.CORR2",
            "protocolSha": PROTOCOL_SHA,
            "annexGSha": ANNEX_G_SHA,
            "res03": RES_03,
            "historicalProceduralVerdict": HISTORICAL_VERDICT,
            "odA": None,
            "res01": "UNRESOLVED",
            "odB": OD_B,
            "odC": OD_C,
            "xDec": X_DEC,
            "executionAuthorized": False,
            "independentVerification": False,
            "selfValidation": "NOT_INDEPENDENT",
            "sessions": sessions,
            "journalSha": self.journal.sha(),
            "freezes": {
                "FB": None if self.fb is None else {"sha": self.fb["sha"], "sentAt": self.fb["sentAt"]},
                "F": None if self.fref is None else {"sha": self.fref["sha"], "sentAt": self.fref["sentAt"]},
                "H21": None,
            },
            "defects": list(self.defects),
            "c7Sha": sha256_bytes(c7_line),
            "c7": c7,
            "labelsSource": "FROZEN_REF",
            "e4Ready": False,
            "preconditionProvenance": {
                "values": {name: c7["preconditions"][name] for name in PRECONDITIONS},
                "establishedBy": "CALLER_SYNTHETIC",
                "independentlyVerified": False,
            },
        }
        return self.g["canon"](payload)


def records_for_qual(packets, by_id):
    return [by_id.get(packet["packetId"]) for packet in packets]
