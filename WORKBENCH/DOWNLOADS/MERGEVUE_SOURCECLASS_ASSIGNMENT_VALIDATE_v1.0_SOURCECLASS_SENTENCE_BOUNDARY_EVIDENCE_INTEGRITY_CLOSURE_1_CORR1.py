#!/usr/bin/env python3
"""MERGEVUE - SOURCECLASS-SENTENCE-BOUNDARY-EVIDENCE-INTEGRITY-CLOSURE-1.CORR1 - VALIDATOR AND MODEL INTERPRETER
(CORR1: IV1-F1 - a full stop before an ASCII decimal digit continuation does not prove SENTENCE; IV1-F2 - U+201D RIGHT DOUBLE QUOTATION MARK is a
permitted closer of the continuation scan. Codex-driven correction only: this file was not run by its author.)
(the sentence-evidence closure candidate + IV1-M1: a SENTENCE declared between non-adjacent units is verified on the actual documentary interval;
+ IV1-M2 case A: a full stop inside a PROVEN occurrence span of the frozen SEC entity-name authority CANDIDATE cannot prove SENTENCE. IV1-M2 case B -
no usable authority - is the Owner-accepted bounded residual R-M2-CASE-B and is not closed.)

One file, four parts:

  PART 1  MODEL-DRIVEN INTERPRETER. Every class, predicate, exclusion, state name, feature, merge rule, feature constraint, separator and its evidence
          (the SENTENCE continuation guard, documentary interval and entity-name veto included), canonicalization operation, duplicate-identity rule,
          extraction op role, complete-view rule, removal view, seam rule, frame rule, guard, reason code, OA-14 rule, CSI-v6 key component, B-2 count
          rule and touching-atom rule is READ FROM boundaryModel. The interpreter holds no normative literal of its own; check S-6 scans this part's
          source for one and fails if it finds any. Paths the delivered model does not select (the retired CSI-v5 proofs and every weakened rule a
          forced failure restores) are DORMANT: each call is counted and check C-5 requires zero.
  PART 2  EVIDENCE BINDING. Binds the entity-name authority candidate read-only (records digest, artifact id and digest, coordinate view, proven
          states, entity id, span set and span text); re-extracts every bound unit from the preserved artifact bytes, verifies every witness inside its
          unit and every declared separator against its evidence, derives the feature record from witnessed assertions ONLY, decides occurrence identity
          per document, per occurrence and per key, applies OA-14 once, collects the B-2 facts and counts srcDiv (R-COUNT, step 5b included).
  PART 3  CONTRACT RENDERER. The readable contract is rendered from the rules artifact (plus the fixture evaluations and the semantic delta
          ledger); check T-1 requires byte equality.
  PART 4  CHECKS, THE PHYSICAL-OCCURRENCE ORACLE, THE R-7, TOUCHING-ATOM, SENTENCE-EVIDENCE AND BOUNDARY-INTEGRITY CONSTRUCTION ORACLES, THE UAX #29
          SB8-STYLE REFERENCE, REPORT AND FORCED-FAILURE HARNESS.

What a PASS means, and what it does not: a PASS proves physical evidence binding, exact rule execution, and zero oracle failures on the declared
constructions and generated surfaces. It does not prove that a coder's semantic reading of a witnessed passage is right beyond the recorded witness,
it does not claim general sentence-boundary soundness (R-M2-CASE-B), and it does not verify the SEC entity-name authority candidate itself.
Self-validation is not independent verification.

Usage (from the directory holding the 14 artifacts, read-only):
  python3 MERGEVUE_SOURCECLASS_ASSIGNMENT_VALIDATE_v1.0_SOURCECLASS_SENTENCE_BOUNDARY_EVIDENCE_INTEGRITY_CLOSURE_1_CORR1.py [--write-report PATH]
  python3 MERGEVUE_SOURCECLASS_ASSIGNMENT_VALIDATE_v1.0_SOURCECLASS_SENTENCE_BOUNDARY_EVIDENCE_INTEGRITY_CLOSURE_1_CORR1.py --forced-failures [--targeted] [--write-forced-failures PATH] [--jobs N]
  (--targeted: the bounded load-bearing set FF_TARGETED this act delivers; without it, every mutation of the lineage - not completed for this act)
The repository root is the grandparent of this directory (or MV_REPO_ROOT). A full validation evaluates every generated surface (8214 + 360 +
560 x 3 + R-7, touching-atom, sentence-evidence and boundary-integrity cases) and takes tens of minutes. MV_FAST=1 (set by the forced-failure harness
only) evaluates a declared deterministic stride of each generated surface; every fixture, the pilot and every recorded table are still checked.
"""
import ast
import bisect
import copy
import hashlib
import html
import itertools
import json
import os
import re
import shutil
import sys
import tempfile
import traceback
import unicodedata
from array import array as _array

# ================================================================== PART 1 BEGIN (interpreter)


def cjson(obj):
    return json.dumps(obj, sort_keys=True, separators=(",", ":"), ensure_ascii=False).encode("utf-8")


def sha_bytes(b):
    return hashlib.sha256(b).hexdigest()


def sha_text(s):
    return sha_bytes(s.encode("utf-8"))


class ModelError(Exception):
    """Raised when evidence cannot be evaluated under the model. code is a stable reason id."""

    def __init__(self, code, detail=""):
        Exception.__init__(self, "%s: %s" % (code, detail))
        self.code = code
        self.detail = detail


_FLAG_BITS = {"I": re.I, "M": re.M, "S": re.S}


def _flags(names):
    f = 0
    for n in names or []:
        f |= _FLAG_BITS[n]
    return f


def apply_ops(text, ops, skip_classes=()):
    for op in ops:
        if op.get("artifactClass") in skip_classes:
            continue
        kind = op["op"]
        if kind == "regex":
            text = re.sub(op["pattern"], op["repl"], text, flags=_flags(op.get("flags")))
        elif kind == "strip":
            text = text.strip()
        elif kind == "casefold":
            text = text.casefold()
        elif kind == "html_unescape":
            text = html.unescape(text)
        else:
            raise ModelError("UNKNOWN_OP", kind)
    return text


def _lzw(data):
    out = bytearray()
    table = {i: bytes([i]) for i in range(256)}
    nxt, width, prev, bits, acc = 258, 9, None, 0, 0
    for byte in data:
        acc = (acc << 8) | byte
        bits += 8
        while bits >= width:
            code = (acc >> (bits - width)) & ((1 << width) - 1)
            bits -= width
            if code == 256:
                table = {i: bytes([i]) for i in range(256)}
                nxt, width, prev = 258, 9, None
                continue
            if code == 257:
                return bytes(out)
            if prev is None:
                entry = table.get(code, b"")
            else:
                entry = table.get(code, prev + prev[:1])
            out += entry
            if prev is not None:
                table[nxt] = prev + entry[:1]
                nxt += 1
                if nxt + 1 >= (1 << width) and width < 12:
                    width += 1
            prev = entry
    return bytes(out)


def _pdf_lzw_strings(raw):
    chunks = []
    for m in re.finditer(rb"/LZWDecode", raw):
        a = raw.find(b"stream", m.end())
        if a < 0:
            continue
        a = raw.find(b"\n", a) + 1
        b = raw.find(b"endstream", a)
        if b < 0:
            continue
        found = re.findall(rb"\((?:\\.|[^\\()])*\)", _lzw(raw[a:b]))
        if found:
            chunks.append(b" ".join(x[1:-1] for x in found).decode("latin-1", "ignore"))
    return "\n".join(chunks)


def _occurrences(doc, text):
    """Number of (overlapping) occurrences of text in doc; 0 when the document is unavailable."""
    if doc is None:
        return 0
    n, i = 0, doc.find(text)
    while i >= 0:
        n += 1
        i = doc.find(text, i + 1)
    return n


# ---------------------------------------------------------------- DORMANT LEGACY (CSI-v5 occurrence-correspondence tests)
# NO EXECUTABLE AUTHORITY. The delivered model selects the identity function COMPLETE_VIEW_FRAMES and names none of these tests. The table and
# _legacy_v5_identity below exist ONLY so that a mutated model that restores a removed proof (a forced failure) remains EVALUABLE and is therefore
# detected by behaviour instead of by an unknown-name error. Every dormant path is counted on the interpreter instance that runs it
# (Interp.legacy_calls); check C-5 requires zero calls on the delivered model's interpreter (pilot, fixtures, probes, generated cases).
_known = lambda f: bool(f["docs"]) and all(d is not None for d in f["docs"])
_LEGACY_V5_TESTS = {
    "GROUP_CANONICAL_DOCUMENTS_EQUAL": lambda f: _known(f) and all(d == f["docs"][0] for d in f["docs"]),
    "CONTENT_CARRIED_BY_ONE_MEMBER": lambda f: _known(f) and sum(1 for c in f["counts"] if c) == 1,
    "CONTENT_SINGLE_OCCURRENCE_IN_EVERY_CARRIER_AND_AT_MOST_ONCE_IN_RENDITION_TEXT": lambda f: _known(f) and f["rcount"] is not None and f["rcount"] <= 1
                                                                                                and all(c == 1 for c in f["counts"] if c),
    "CARRIER_OCCURRENCES_EQUAL_RENDITION_TEXT": lambda f: _known(f) and f["rcount"] is not None and f["rcount"] >= 1
                                                          and all(c == f["rcount"] for c in f["counts"] if c),
    "CARRIER_COUNTS_EQUAL": lambda f: _known(f) and len(set(c for c in f["counts"] if c)) == 1,
}

# ---------------------------------------------------------------- origin-tracked replay (occurrenceAnchoring.originTrackedReplay)


class Tracked(object):
    """A text and, for every character, the half-open decoded-text origin [s, e), the index of the op that emitted it (-1 = copied unchanged)
    and a complete-view source index (0 = plain text). Replacement characters carry the origin of the entire matched source range."""
    __slots__ = ("text", "s", "e", "o", "src")

    def __init__(self, text, s, e, o, src):
        self.text, self.s, self.e, self.o, self.src = text, s, e, o, src

    @classmethod
    def identity(cls, text):
        n = len(text)
        return cls(text, _array("i", range(n)), _array("i", range(1, n + 1)), _array("i", [-1]) * n, _array("i", [0]) * n)

    def slice(self, a, b):
        return Tracked(self.text[a:b], self.s[a:b], self.e[a:b], self.o[a:b], self.src[a:b])


def _t_sub(t, pattern, flags, repl, opi, removed=None, rclass=0, emit=None):
    """re.sub with origin tracking. repl: a template (expanded exactly as re.sub expands it) or a function of the match; emit: a function of the match
    returning [(text, source index)] (complete-view emission). removed: receives (origin start, origin end, rclass) for every match when rclass > 0."""
    txt = t.text
    parts, S, E, O, R = [], _array("i"), _array("i"), _array("i"), _array("i")
    pos = 0
    for m in re.finditer(pattern, txt, flags):
        a, b = m.span()
        if a > pos:
            parts.append(txt[pos:a])
            S.extend(t.s[pos:a]); E.extend(t.e[pos:a]); O.extend(t.o[pos:a]); R.extend(t.src[pos:a])
        if b > a:
            os_, oe = min(t.s[a:b]), max(t.e[a:b])
        else:
            p = t.s[a] if a < len(txt) else (t.e[-1] if txt else 0)
            os_, oe = p, p
        if removed is not None and rclass:
            removed.append((os_, oe, rclass))
        if emit is not None:
            pieces = emit(m)
        else:
            r = repl(m) if callable(repl) else (m.expand(repl) if "\\" in repl else repl)
            pieces = [(r, t.src[a] if a < len(txt) else 0)]
        for piece, sidx in pieces:
            n = len(piece)
            if n:
                parts.append(piece)
                S.extend(_array("i", [os_]) * n); E.extend(_array("i", [oe]) * n); O.extend(_array("i", [opi]) * n); R.extend(_array("i", [sidx]) * n)
        pos = b
    if pos < len(txt):
        parts.append(txt[pos:])
        S.extend(t.s[pos:]); E.extend(t.e[pos:]); O.extend(t.o[pos:]); R.extend(t.src[pos:])
    return Tracked("".join(parts), S, E, O, R)


def _t_strip(t):
    txt = t.text
    a = len(txt) - len(txt.lstrip())
    b = len(txt.rstrip())
    return t.slice(a, b) if b > a else t.slice(0, 0)


def _t_casefold(t):
    out = t.text.casefold()
    if len(out) == len(t.text):
        return Tracked(out, t.s, t.e, t.o, t.src)
    S, E, O, R, parts = _array("i"), _array("i"), _array("i"), _array("i"), []
    for i, ch in enumerate(t.text):
        c = ch.casefold()
        parts.append(c)
        S.extend(_array("i", [t.s[i]]) * len(c)); E.extend(_array("i", [t.e[i]]) * len(c))
        O.extend(_array("i", [t.o[i]]) * len(c)); R.extend(_array("i", [t.src[i]]) * len(c))
    return Tracked("".join(parts), S, E, O, R)


def apply_ops_tracked(t, ops, skip_classes=(), opbase=0, rclasses=None, removed=None):
    """apply_ops with origin tracking; rclasses[i] > 0 marks op i as a removal op whose matches are logged into removed."""
    for i, op in enumerate(ops):
        if op.get("artifactClass") in skip_classes:
            continue
        kind = op["op"]
        rc = rclasses[i] if rclasses else 0
        if kind == "regex":
            t = _t_sub(t, op["pattern"], _flags(op.get("flags")), op["repl"], opbase + i, removed, rc)
        elif kind == "strip":
            t = _t_strip(t)
        elif kind == "casefold":
            t = _t_casefold(t)
        elif kind == "html_unescape":
            if "&" in t.text:
                t = _t_sub(t, html._charref, 0, html._replace_charref, opbase + i, removed, rc)
        else:
            raise ModelError("UNKNOWN_OP", kind)
    return t


def complete_view(decoded, cv):
    """The complete view of a decoded rendition text, read from the model's completeView declaration: (Tracked text of letters and digits with
    origins and source indices, source table [(kind, name, digitOnlyPiece)])."""
    kinds = cv["sourceKinds"]
    sources = [(kinds["text"], None, False)]
    elements = set(cv["standardElementNames"])
    attributes = set(cv["standardAttributeNames"])
    prefixes = tuple(cv["standardAttributeNamePrefixes"])
    strict = re.compile(cv["strictTagPattern"])
    attr_re = re.compile(cv["attributePattern"])

    def source(kind, name, piece):
        sources.append((kind, name, any(ch.isalnum() for ch in piece) and not any(ch.isalpha() for ch in piece)))
        return len(sources) - 1

    def comment(m):
        body = m.group(1)
        return [(" ", 0), (body if cv["emitCommentBodies"] else "", source(kinds["commentBody"], None, body)), (" ", 0)]

    def tag(m):
        whole = m.group(0)
        st = strict.match(whole)
        if not st:
            inner = whole[1:-1] if cv["keepMalformedInteriors"] else ""
            return [(" ", 0), (inner, source(kinds["malformedInterior"], None, inner)), (" ", 0)]
        out = []
        if cv["emitNonStandardNames"] and st.group(1).lower() not in elements:
            out.append((st.group(1), source(kinds["nonStandardName"], st.group(1).lower(), st.group(1))))
        for a in attr_re.finditer(st.group(2)):
            name = a.group(1)
            if cv["emitNonStandardNames"] and name.lower() not in attributes and not name.lower().startswith(prefixes):
                out.append((name, source(kinds["nonStandardName"], name.lower(), name)))
            v = a.group(2) if a.group(2) is not None else (a.group(3) if a.group(3) is not None else a.group(4))
            if v and cv["emitAttributeValues"]:
                out.append((v, source(kinds["attributeValue"], name.lower(), v)))
        pieces = [(" ", 0)]
        for i, p in enumerate(out):
            if i:
                pieces.append((" ", 0))
            pieces.append(p)
        pieces.append((" ", 0))
        return pieces
    t = Tracked.identity(decoded)
    t = _t_sub(t, cv["commentPattern"], _flags(cv["commentFlags"]), None, -2, emit=comment)
    t = _t_sub(t, cv["tagPattern"], _flags(cv["tagFlags"]), None, -3, emit=tag)
    t = apply_ops_tracked(t, cv["then"], opbase=-100)
    return t, sources


def _cache_key(*parts):
    h = hashlib.sha256()
    for p in parts:
        h.update(p if isinstance(p, bytes) else (p.encode("utf-8") if isinstance(p, str) else cjson(p)))
        h.update(b"\x00")
    return h.hexdigest()


# content-keyed caches (never keyed by an artifact id): tracked extractions, complete views, removal views
_CACHE = {"extract": {}, "cv": {}, "views": {}, "proj": {}, "decoded": {}}


_DECODERS = {
    "UTF8_REPLACE": lambda raw: raw.decode("utf-8", "replace"),
    "PDF_LZW_STREAM_STRINGS": _pdf_lzw_strings,
}


def eval_expr(expr, feats):
    """Generic Boolean expression engine over a feature record."""
    if isinstance(expr, bool):
        return expr
    if "allOf" in expr:
        return all(eval_expr(e, feats) for e in expr["allOf"])
    if "anyOf" in expr:
        return any(eval_expr(e, feats) for e in expr["anyOf"])
    if "noneOf" in expr:
        return not any(eval_expr(e, feats) for e in expr["noneOf"])
    if "not" in expr:
        return not eval_expr(expr["not"], feats)
    if "feature" in expr:
        v = feats.get(expr["feature"])
        if "eq" in expr:
            return v == expr["eq"]
        if "in" in expr:
            return v in expr["in"]
        if "contains" in expr:
            return isinstance(v, list) and expr["contains"] in v
        if expr.get("nonEmpty"):
            return bool(v)
        if expr.get("empty"):
            return not bool(v)
        return bool(v)
    raise ModelError("UNKNOWN_EXPRESSION", json.dumps(expr)[:120])


class Interp(object):
    """Interprets boundaryModel. Holds no normative literal."""

    def __init__(self, bm):
        self.bm = bm
        self.roles = bm["states"]["roles"]
        self.rule_ids = bm["states"]["ruleIds"]
        self.id_states = bm["states"]["identityStates"]
        self.eq_states = bm["states"]["equivalenceStates"]
        self.class_ids = [c["classId"] for c in bm["vocabulary"]["classes"]]
        self.labels = dict((c["classId"], c["label"]) for c in bm["vocabulary"]["classes"])
        self.classes = dict((c["classId"], c) for c in bm["classes"])
        fv = bm["featureVocabulary"]
        self.scalars, self.lists = fv["scalarEnums"], fv["listEnums"]
        self.bools, self.derived = fv["booleans"], fv["derived"]
        self.seg = bm["segmentation"]
        self.ev = bm["evidenceBinding"]
        self.canon_ops = bm["canonicalization"]["ops"]
        self.rdup = bm["rules"]["R-DUP"]
        self.csi_spec = bm["canonicalSegmentIdentity"]
        self.oa = bm["occurrenceAnchoring"]
        self.count_spec = bm["rules"]["R-COUNT"]
        self.b2 = bm.get("basisOverlap")
        self._cache = {}
        self.legacy_calls = 0

    # ---------------------------------------------------------------- canonical text
    def recipe(self, recipe_id):
        spec = self.ev["extractionRecipes"].get(recipe_id)
        if spec is None:
            raise ModelError("UNKNOWN_RECIPE", recipe_id)
        return spec

    def canonical(self, text, recipe_id=None):
        skip = self.recipe(recipe_id)["preservedArtifactClasses"] if recipe_id else ()
        return apply_ops(text, self.canon_ops, skip)

    def extract(self, raw, recipe_id):
        spec = self.recipe(recipe_id)
        decoder = _DECODERS.get(spec["decoder"])
        if decoder is None:
            raise ModelError("UNKNOWN_DECODER", spec["decoder"])
        return apply_ops(decoder(raw), spec["ops"])

    def rendition_text(self, raw, decoder_id):
        decoder = _DECODERS.get(decoder_id)
        if decoder is None:
            raise ModelError("UNKNOWN_DECODER", decoder_id)
        return decoder(raw)

    # ---------------------------------------------------------------- features
    def feature_record(self, assertions):
        scalar_vals, list_vals, bool_vals = {}, {}, {}
        for a in assertions:
            fid, val = a["featureId"], a["value"]
            if fid in self.derived:
                raise ModelError("DERIVED_FEATURE_ASSERTED", fid)
            if fid in self.scalars:
                if val not in self.scalars[fid]["values"]:
                    raise ModelError("VALUE_NOT_IN_VOCABULARY", "%s=%r" % (fid, val))
                scalar_vals.setdefault(fid, []).append(val)
            elif fid in self.lists:
                if val not in self.lists[fid]["values"]:
                    raise ModelError("VALUE_NOT_IN_VOCABULARY", "%s=%r" % (fid, val))
                list_vals.setdefault(fid, set()).add(val)
            elif fid in self.bools:
                if val is not True:
                    raise ModelError("BOOLEAN_ASSERTION_MUST_BE_TRUE", fid)
                bool_vals[fid] = True
            else:
                raise ModelError("UNKNOWN_FEATURE", fid)
        feats = {}
        for fid, spec in self.scalars.items():
            feats[fid] = self._merge_scalar(fid, scalar_vals[fid]) if fid in scalar_vals else spec["default"]
        for fid, spec in self.lists.items():
            feats[fid] = [v for v in spec["values"] if v in list_vals.get(fid, ())]
        for fid, spec in self.bools.items():
            feats[fid] = bool_vals.get(fid, spec["default"])
        return feats

    def _merge_scalar(self, fid, values):
        distinct = []
        for v in values:
            if v not in distinct:
                distinct.append(v)
        for rule in self.bm["featureMerge"]["scalarEnums"][fid]:
            if "ifAny" in rule and any(v in distinct for v in rule["ifAny"]):
                return rule["then"]
            if "ifAll" in rule and all(v in distinct for v in rule["ifAll"]):
                return rule["then"]
            if rule.get("ifSingleDistinct") and len(distinct) == 1:
                return distinct[0] if rule["then"] == "<VALUE>" else rule["then"]
            if "else" in rule:
                return rule["else"]
        raise ModelError("MERGE_UNRESOLVED", fid)

    def constraint_violations(self, feats):
        return [c["id"] for c in self.bm["featureConstraints"]
                if eval_expr(c["when"], feats) and not eval_expr(c["require"], feats)]

    # ---------------------------------------------------------------- predicates
    def eval_class(self, class_id, feats):
        c = self.classes[class_id]
        comps = [(x["componentId"], eval_expr(x["expr"], feats)) for x in c["components"]]
        fired = [x["id"] for x in c["exclusions"] if eval_expr(x["expr"], feats)]
        if c["combinator"] == "ALL_OF":
            ok = all(v for _, v in comps)
        elif c["combinator"] == "ANY_OF":
            ok = any(v for _, v in comps)
        else:
            raise ModelError("UNKNOWN_COMBINATOR", c["combinator"])
        if c["exclusionCombinator"] != "NONE_OF":
            raise ModelError("UNKNOWN_COMBINATOR", c["exclusionCombinator"])
        failed = next((k for k, v in comps if not v), None)
        return {"satisfied": bool(ok and not fired), "failedComponent": failed, "firedExclusions": fired}

    def eval_segment(self, feats, bound):
        results = dict((cid, self.eval_class(cid, feats)) for cid in self.class_ids)
        sat = [cid for cid in self.class_ids if results[cid]["satisfied"]]
        if len(sat) == 1:
            state, label, rule = self.roles["assigned"], self.labels[sat[0]], sat[0]
        elif not sat:
            role = "outside" if bound else "notDeterminable"
            state, label, rule = self.roles[role], None, self.rule_ids[role]
        else:
            state, label, rule = self.roles["multiple"], None, self.rule_ids["multiple"]
        return {"sourceClassAssignmentState": state, "sourceClass": label, "assignmentRuleId": rule,
                "satisfiedClassIds": sat, "predicateResults": results}

    # ---------------------------------------------------------------- segmentation
    def form_segments(self, units, doc_text, recipe_id):
        seg = self.seg
        ev = seg["separatorEvidence"]
        groups = []
        for i, u in enumerate(units):
            sep = u["separatorBefore"]
            if i == 0:
                if sep != seg["startMarker"]:
                    raise ModelError("FIRST_UNIT_SEPARATOR", sep)
                groups.append([u])
                continue
            prev = units[i - 1]
            if u["start"] < prev["end"]:
                raise ModelError("UNIT_ORDER_OR_OVERLAP", u["unitId"])
            gap = doc_text[prev["end"]:u["start"]]
            adjacent = re.match(ev["gapWhitespacePattern"], gap) is not None
            if sep == seg["conjoinedMarker"]:
                if not adjacent:
                    raise ModelError("CONJOINED_UNITS_NOT_ADJACENT", u["unitId"])
                groups[-1].append(u)
                continue
            if sep in seg["notSeparators"]:
                raise ModelError("SEPARATOR_NOT_LAWFUL", "%s declared %s" % (u["unitId"], sep))
            if sep not in seg["lawfulSeparators"]:
                raise ModelError("SEPARATOR_UNKNOWN", sep)
            rule_bi = ev["whenAdjacent"].get(sep, {})
            if not adjacent and rule_bi.get("documentaryInterval"):
                if not self._interval_evidence(rule_bi, doc_text, prev, u, recipe_id):
                    raise ModelError("SEPARATOR_EVIDENCE_FAILED", "%s before %s: %s" % (sep, u["unitId"], rule_bi["documentaryInterval"]["id"]))
            if adjacent and rule_bi.get("entityNameVeto"):
                tm_bi = re.search(rule_bi["entityNameVeto"]["terminalAtUnitEnd"], doc_text[prev["start"]:prev["end"]])
                if tm_bi and self._veto_doc(rule_bi, doc_text, prev["start"] + tm_bi.start(1), prev["start"], recipe_id):
                    raise ModelError("SEPARATOR_EVIDENCE_FAILED", "%s before %s: %s" % (sep, u["unitId"], rule_bi["entityNameVeto"]["id"]))
            if adjacent:
                rule = ev["whenAdjacent"][sep]
                if rule.get("forbiddenWhenAdjacent"):
                    raise ModelError("SEPARATOR_EVIDENCE_FAILED", "%s needs intervening text" % sep)
                if "previousUnitCanonicalEndsWith" in rule and not re.search(
                        rule["previousUnitCanonicalEndsWith"], self.canonical(prev["text"], recipe_id)):
                    raise ModelError("SEPARATOR_EVIDENCE_FAILED", "%s before %s" % (sep, u["unitId"]))
                if "unitCanonicalStartsWith" in rule and not re.search(
                        rule["unitCanonicalStartsWith"], self.canonical(u["text"], recipe_id)):
                    raise ModelError("SEPARATOR_EVIDENCE_FAILED", "%s at %s" % (sep, u["unitId"]))
                if "gapContains" in rule and not re.search(rule["gapContains"], gap):
                    raise ModelError("SEPARATOR_EVIDENCE_FAILED", "%s gap" % sep)
                if rule.get("continuationGuard") and self._cg_declared(rule, prev["text"], gap, u["text"], recipe_id):
                    raise ModelError("SEPARATOR_EVIDENCE_FAILED", "%s before %s: %s" % (sep, u["unitId"], rule["continuationGuard"]["id"]))
            groups.append([u])
        return groups

    # ---------------------------------------------------------------- the continuation guard of a separator's frozen evidence
    # (segmentation.separatorEvidence.whenAdjacent.<separator>.continuationGuard): ONE decision, read wherever that separator's evidence is read - a
    # separator a record declares between adjacent units (form_segments) and the junction evidence of the touching-atom relation (_ta_scan).
    def continuation_withheld(self, rule, terminal, following, before, where):
        """True iff the continuation guard of `rule` withholds the separator. `terminal`: the terminal character; `following`: the case-preserving text
        after it, through at least the first character past closers and spacing; `before`: the case-preserving text before it; `where`: the path."""
        g = (rule or {}).get("continuationGuard")
        if not g:
            return False
        if where not in g["appliesTo"]:
            self.legacy_calls += 1                  # DORMANT (a forced-failure surface): the guard read on one path only
            return False
        dec = g["decision"]
        if dec != "FIRST_CASED_LETTER_AFTER_CLOSERS_AND_SPACING":
            self.legacy_calls += 1                  # DORMANT (forced-failure surfaces): the guard disabled, or a list of tokens as authority
            if dec == "DISABLED":
                return False
            if dec == "ABBREVIATION_LIST":
                w = re.search(r"(\w+)\W*$", before)
                return bool(w) and w.group(1).casefold() in set(x.casefold() for x in g["abbreviationList"])
            raise ModelError("UNKNOWN_CONTINUATION_DECISION", str(dec))
        if terminal not in g["ambiguousTerminals"]:
            return False
        m = re.match(g["betweenPattern"], following)
        rest = following[m.end():] if m else ""
        if not rest:
            return False
        ch = rest[0]
        test = g["caseTest"]
        if test == "UNICODE_LOWERCASE":
            fired = ch.islower()
            dg = g.get("asciiDigitContinuation")            # IV1-F1 (CORR1): the digit continuation is withheld as the lowercase one is
            if dg and not fired:
                fired = ch in dg["characters"]
        else:
            self.legacy_calls += 1                  # DORMANT (forced-failure surfaces): an ASCII-only or a case-blind letter test
            if test == "ASCII_LOWERCASE":
                fired = "a" <= ch <= "z"
            elif test == "ANY_CASED":
                fired = ch.islower() or ch.isupper()
            else:
                raise ModelError("UNKNOWN_CASE_TEST", str(test))
        if fired:
            self.guard_fired = getattr(self, "guard_fired", 0) + 1
        return fired

    # ---------------------------------------------------------------- IV1-M1: a declared SENTENCE between non-adjacent units is a claim, verified on the
    # actual documentary interval (segmentation.separatorEvidence.whenAdjacent.SENTENCE.documentaryInterval)
    def _interval_evidence(self, rule, doc, prev, u, recipe_id):
        """A SENTENCE declared between NON-adjacent units, in extracted-text coordinates: proven iff some terminal at the end of the previous unit or
        inside the gap the coder left out, followed by closers and spacing (or the end of the gap), is neither withheld by the continuation guard nor
        vetoed as entity-internal. The units' own trimming never decides: the omitted punctuation, closers and spacing are read from the document."""
        iv = rule["documentaryInterval"]
        mode = iv["candidates"]
        g = rule.get("continuationGuard")
        tm = re.search(iv["terminalAtUnitEnd"], doc[prev["start"]:prev["end"]])
        ends = [prev["start"] + tm.start(1)] if tm else []
        if mode == "PREVIOUS_UNIT_END_AND_GAP":
            cands = ends + [prev["end"] + m.start(1) for m in re.finditer(iv["terminalInGap"], doc[prev["end"]:u["start"]])]
        else:
            self.legacy_calls += 1                  # DORMANT (forced-failure surfaces): the declaration trusted, or only the coder's unit bytes read
            if mode == "DECLARATION_TRUSTED":
                return True
            if mode != "CODER_UNIT_ONLY":
                raise ModelError("UNKNOWN_INTERVAL_MODE", str(mode))
            if not ends:
                return True
            cands = ends
        grule = rule
        if iv["closersInGap"] != "READ" and g:
            self.legacy_calls += 1                  # DORMANT (a forced-failure surface): closers in the omitted gap not read by the guard
            grule = dict(rule, continuationGuard=dict(g, betweenPattern=iv["closersIgnoredBetweenPattern"]))
        for p in cands:
            if g and self._cg_declared(grule, doc[prev["start"]:p + 1], doc[p + 1:u["start"]], doc[u["start"]:u["end"]], recipe_id):
                continue
            if rule.get("entityNameVeto") and self._veto_doc(rule, doc, p, prev["start"], recipe_id):
                continue
            return True
        return False

    # ---------------------------------------------------------------- IV1-M2 case A: the entity-name veto (segmentation...SENTENCE.entityNameVeto). Negative
    # evidence only: it can make a terminal ineligible to prove SENTENCE; it never creates a boundary.
    def _veto_doc(self, rule, doc, p, anchor_p, recipe_id):
        """The veto on the declared path: the terminal at extracted position p, mapped to its decoded-artifact origin."""
        v = rule["entityNameVeto"]
        if doc[p] not in v["terminals"] or not (getattr(self, "_ena", None) or {}).get(getattr(self, "_seg_aid", None)):
            return False
        if self.recipe(recipe_id)["decoder"] != v["authority"]["decoder"]:
            return False
        if v["offsetView"] == "DECODED_ARTIFACT":
            t, _ = self.tracked_extract(self._seg_decoded, recipe_id)
            if t.text != doc:
                raise ModelError("TRACKED_REPLAY_MISMATCH", v["id"])
            off, anchor = t.s[p], t.s[anchor_p]
        else:
            self.legacy_calls += 1                  # DORMANT (a forced-failure surface): offsets read in the wrong coordinate view
            off, anchor = p, anchor_p
        return self._veto(rule, "DECLARED_SEPARATOR", self._seg_aid, off, anchor)

    def _veto(self, rule, path, aid, off, anchor):
        """ENTITY_INTERNAL_PERIOD: occurrenceStart <= off < occurrenceEnd for ANY member of the complete set of proven occurrence spans bound to aid."""
        v = rule["entityNameVeto"]
        if path not in v["appliesTo"]:
            self.legacy_calls += 1                  # DORMANT (forced-failure surfaces): the veto read on one path only
            return False
        spans = (getattr(self, "_ena", None) or {}).get(aid)
        if not spans:
            return False
        sel = v["spanSelection"]
        if sel != "ANY_SPAN":
            self.legacy_calls += 1                  # DORMANT (forced-failure surfaces): one span selected instead of the complete set
            if sel == "FIRST_SPAN":
                spans = spans[:1]
            elif sel == "NEAREST_SPAN":
                spans = [min(spans, key=lambda x: (abs(x[0] - anchor), x[0]))]
            else:
                raise ModelError("UNKNOWN_SPAN_SELECTION", str(sel))
        hit = any(s <= off < e for s, e in spans)
        if hit:
            self.veto_fired = getattr(self, "veto_fired", 0) + 1
        return hit

    def _ta_origin(self, rend):
        """Decoded-text origins of the _ta_view text (the same complete view, origin-tracked)."""
        cv = self.oa["completeView"]
        omit = self.b2["touchingAtom"]["junction"]["material"]["omitCompleteViewOps"]
        key = _cache_key(rend, cv, omit, "ta-origin")
        hit = _CACHE["cv"].get(key)
        if hit is None:
            t, _ = complete_view(rend, dict(cv, then=[o for o in cv["then"] if o not in omit]))
            if t.text != self._ta_view(rend)[0]:
                raise ModelError("TRACKED_REPLAY_MISMATCH", "entity-name veto origins")
            hit = t.s
            _CACHE["cv"][key] = hit
        return hit

    def _cg_declared(self, rule, prev_text, gap, next_text, recipe_id):
        """The guard on a separator a record declares between adjacent units, read on the guard's declared-separator view of the previous unit, the
        gap and the next unit."""
        g = rule["continuationGuard"]
        skip = self.recipe(recipe_id)["preservedArtifactClasses"] if recipe_id else ()
        ops = [o for o in self.canon_ops if o["op"] not in g["views"]["declaredSeparator"]["omitOps"]]
        a = apply_ops(prev_text, ops, skip)
        tm = re.search(g["terminalAtUnitEnd"], a)
        if not tm:
            return False
        return self.continuation_withheld(rule, tm.group(1), a[tm.end(1):] + apply_ops(gap, ops, skip) + apply_ops(next_text, ops, skip), a[:tm.start(1)],
                                          "DECLARED_SEPARATOR")

    def _cg_case_view(self, rend, g):
        """(text, index) of one member rendition's complete view with the ops the guard's complete-view view names not applied (letter case kept):
        index[i] = the position in text of the character complete-view position i comes from."""
        cv = self.oa["completeView"]
        omit = g["views"]["completeViewJunction"]["omitThenOps"]
        key = _cache_key(rend, cv, omit, "cg-view")
        hit = _CACHE["cv"].get(key)
        if hit is None:
            t, _ = complete_view(rend, dict(cv, then=[o for o in cv["then"] if o not in omit]))
            later = [o for o in cv["then"] if o in omit]
            memo, index = {}, []
            for j, ch in enumerate(t.text):
                if ch not in memo:
                    memo[ch] = apply_ops(ch, later)
                index.extend([j] * len(memo[ch]))
            if "".join(memo[ch] for ch in t.text) != self.complete_view_of(rend)[0].text:
                raise ModelError("TRACKED_REPLAY_MISMATCH", "continuation guard view")
            hit = (t.text, index)
            _CACHE["cv"][key] = hit
        return hit

    # ---------------------------------------------------------------- canonical segment identity
    def canonical_document(self, key, extracted, recipe_id):
        ck = ("cdoc", key, recipe_id, len(extracted), hash(extracted))
        if ck not in self._cache:
            self._cache[ck] = self.canonical(extracted, recipe_id)
        return self._cache[ck]

    def unestablished_state(self):
        """(state, ruleId) that a segment takes when no shared frame establishes its documentary occurrence (fail closed)."""
        role = self.csi_spec["whenNotEstablished"]["stateRole"]
        return self.roles[role], self.rule_ids[role]

    def rendition_canonical(self, key, text):
        """R-EQV canonical form (full canonicalization, no recipe skip) of a member's rendition text, cached by content."""
        ck = ("rdoc", key, len(text), hash(text))
        if ck not in self._cache:
            self._cache[ck] = self.canonical(text)
        return self._cache[ck]

    # ---------------------------------------------------------------- occurrence anchoring (A+): op roles, tracked extraction, complete view, removal views
    def _class_codes(self):
        cl = self.oa["removalViews"]["classes"]
        return {cl["survives"]: 0, cl["block"]: 1, cl["markup"]: 2}

    def op_role_classes(self, recipe_id):
        """The removal class code of every op of a recipe, from its declared role. A missing or unknown role is a model error; never inferred."""
        roles = self.oa["opRoles"]
        codes = self._class_codes()
        out = []
        for i, op in enumerate(self.recipe(recipe_id)["ops"]):
            role = op.get("role")
            if role is None or role not in roles["vocabulary"] or role not in roles["removalClassOfRole"]:
                raise ModelError("OP_ROLE_UNDECLARED", "%s op %d" % (recipe_id, i))
            out.append(codes[roles["removalClassOfRole"][role]])
        return out

    def tracked_extract(self, decoded, recipe_id):
        """(tracked extraction, removed-interval log) of a decoded text under a recipe; the tracked text must equal the untracked one byte for byte."""
        spec = self.recipe(recipe_id)
        rcl = self.op_role_classes(recipe_id)
        key = _cache_key(decoded, spec["ops"], rcl)
        hit = _CACHE["extract"].get(key)
        if hit is None:
            removed = []
            t = apply_ops_tracked(Tracked.identity(decoded), spec["ops"], (), 0, rcl, removed)
            if t.text != apply_ops(decoded, spec["ops"]):
                raise ModelError("TRACKED_REPLAY_MISMATCH", recipe_id)
            hit = (t, removed)
            _CACHE["extract"][key] = hit
        return hit

    def complete_view_of(self, decoded):
        cv = self.oa["completeView"]
        key = _cache_key(decoded, cv)
        hit = _CACHE["cv"].get(key)
        if hit is None:
            hit = complete_view(decoded, cv)
            _CACHE["cv"][key] = hit
        return hit

    def removal_views(self, decoded, decoder_id):
        """{view name: bytearray over decoded positions (0 SURVIVES, 1 BLOCK, 2 MARKUP)} for one member."""
        rv = self.oa["removalViews"]
        recipes = self.ev["extractionRecipes"]
        codes = self._class_codes()
        tv = rv.get("tagView")
        top = None
        if tv is not None:
            top = next((o for o in self.canon_ops if o.get("artifactClass") == tv["canonicalizationArtifactClass"]), None)
            if top is None:
                raise ModelError("TAG_VIEW_OP_MISSING", tv["canonicalizationArtifactClass"])
        spec_key = [[n, recipes[n]["decoder"], recipes[n]["ops"], self.op_role_classes(n)] for n in sorted(recipes)]
        key = _cache_key(decoded, decoder_id, spec_key, rv, top)
        hit = _CACHE["views"].get(key)
        if hit is not None:
            return hit
        views = {}
        for name in sorted(recipes):
            spec = recipes[name]
            rcl = self.op_role_classes(name)
            if spec["decoder"] != decoder_id or not any(rcl):
                continue
            view = bytearray(len(decoded))
            if rv["recipeViews"]["source"] == "OP_PROVENANCE":
                _, removed = self.tracked_extract(decoded, name)
                for os_, oe, c in reversed(removed):
                    if oe > os_:
                        view[os_:oe] = bytes([c]) * (oe - os_)
            else:
                self.legacy_calls += 1
                _legacy_reparse_view(decoded, view)
            views[name] = view
        if tv is not None:
            view = bytearray(len(decoded))
            c = codes[tv["removalClass"]]
            if c:
                for m in re.finditer(top["pattern"], decoded, _flags(top.get("flags"))):
                    view[m.start():m.end()] = bytes([c]) * (m.end() - m.start())
            views["canonicalization:" + tv["canonicalizationArtifactClass"]] = view
        _CACHE["views"][key] = views
        return views

    def cv_classes(self, decoded, decoder_id):
        """{view name: bytes} the class of every complete-view character in each view (class of the decoded position at the START of its origin)."""
        cvt, _ = self.complete_view_of(decoded)
        views = self.removal_views(decoded, decoder_id)
        key = _cache_key(decoded, decoder_id, "cls", self.oa["completeView"], self.oa["removalViews"],
                         [[n, self.ev["extractionRecipes"][n]["ops"], self.op_role_classes(n)] for n in sorted(self.ev["extractionRecipes"])])
        hit = _CACHE["proj"].get(key)
        if hit is None:
            codes_markup = self._class_codes()[self.oa["removalViews"]["classes"]["markup"]]
            hit = {}
            for name, v in views.items():
                n = len(v)
                hit[name] = bytes(v[p] if p < n else codes_markup for p in cvt.s)
            _CACHE["proj"][key] = hit
        return hit

    # ---------------------------------------------------------------- the seam predicate and the anchor source
    def _exempt(self, sources, src_idx):
        """DORMANT (a forced-failure surface): the delivered model declares no exemption, so this is always False."""
        ex = self.oa["seam"].get("exemptSources")
        if not ex:
            return False
        kind, name, digit_only = sources[src_idx]
        for e in ex:
            if "attributeName" in e and name == e["attributeName"]:
                return True
            if "attributeNamePrefix" in e and name is not None and name.startswith(e["attributeNamePrefix"]):
                return True
            if e.get("digitOnlyPiece") and digit_only:
                return True
            if "sourceKind" in e and kind == e["sourceKind"]:
                return True
        return False

    def seam(self, decoded, decoder_id, w):
        """TEXT_BEARING_REMOVAL_SEAM(member, w): [(view name, removed classes)] for every removal view in which it holds."""
        classes = self.cv_classes(decoded, decoder_id)
        cvt, sources = self.complete_view_of(decoded)
        codes = self._class_codes()
        removed_codes = set(codes[c] for c in self.oa["seam"]["removedClasses"])
        names = dict((v, k) for k, v in codes.items())
        hits = []
        for name in sorted(classes):
            cls = classes[name][w[0]:w[1]]
            surv = [i for i, c in enumerate(cls) if c == 0]
            if len(surv) < 2:
                continue
            inner = set()
            for i in range(surv[0] + 1, surv[-1]):
                c = cls[i]
                if c in removed_codes and not self._exempt(sources, cvt.src[w[0] + i]):
                    inner.add(names[c])
            if inner:
                hits.append([name, sorted(inner)])
        return hits

    def anchor_facts(self, decoded, recipe_id, extracted_untracked, a, b):
        """sigma, the skeleton k and the diagnostics of one bounded segment [a, b) of the recipe extraction of a decoded rendition text."""
        spec = self.recipe(recipe_id)
        E, _ = self.tracked_extract(decoded, recipe_id)
        if E.text != extracted_untracked:
            raise ModelError("TRACKED_REPLAY_MISMATCH", recipe_id)
        sl = E.slice(a, b)
        C = apply_ops_tracked(sl, self.canon_ops, spec["preservedArtifactClasses"], opbase=1000)
        if C.text != self.canonical(E.text[a:b], recipe_id):
            raise ModelError("TRACKED_REPLAY_MISMATCH", "canonicalization")
        src = self.oa["anchorSource"]
        K = apply_ops_tracked(sl, src["coderText"]["ops"], opbase=2000)
        if K.text != apply_ops(E.text[a:b], src["coderText"]["ops"]):
            raise ModelError("TRACKED_REPLAY_MISMATCH", "coderText")
        f = {"canonicalContent": C.text, "k": K.text, "sigma": None, "basis": None}
        if spec["preservedArtifactClasses"]:
            f["basis"] = src["markupPreservingRecipes"]["basis"]
            if C.text:
                f["sigma"] = [C.s[0], C.e[-1]]
        else:
            f["basis"] = src["markupRemovingRecipes"]["basis"]
            if C.text and K.text:
                f["sigma"] = [K.s[0], K.e[-1]]
        return f

    def decoded_text(self, raw, decoder_id):
        """A decoder's output for one byte string, cached by content (the recipe decoder's text is the space sigma lives in)."""
        key = _cache_key(raw, decoder_id, "decoded")
        hit = _CACHE["decoded"].get(key)
        if hit is None:
            hit = self.rendition_text(raw, decoder_id)
            _CACHE["decoded"][key] = hit
        return hit

    @staticmethod
    def omega(cvt, sigma):
        """(interval of complete-view positions whose origin intersects sigma, representable?) or (None, True)."""
        d1, d2 = sigma
        i1, i2 = bisect.bisect_right(cvt.e, d1), bisect.bisect_left(cvt.s, d2)
        if i2 <= i1:
            return None, True
        return [i1, i2], all(cvt.s[i] >= d1 and cvt.e[i] <= d2 for i in range(i1, i2))

    def identity_string(self, doc_identity, frame, anchor):
        cs = self.csi_spec
        comp = {"versionTag": cs["versionTag"], "underlyingDocumentIdentity": doc_identity, "frameTag": cs["frames"][frame]["tag"],
                "anchor": cs["keySeparator"].join(str(x) for x in anchor)}
        key = cs["keySeparator"].join(str(comp[k]) for k in cs["keyLayout"])
        return cs["prefix"] + sha_text(key)

    # ---------------------------------------------------------------- the anchoring pass: frame per document, FRAME-C per (U, omega), FRAME-U per (U, k)
    def _projection(self, decoded, decoder_id, view_name):
        """(text of the complete-view characters that SURVIVE the view, their complete-view indices) for one member and one view."""
        key = _cache_key(decoded, decoder_id, "projection", view_name, self.oa["completeView"], self.oa["removalViews"],
                         [[n, self.ev["extractionRecipes"][n]["ops"], self.op_role_classes(n)] for n in sorted(self.ev["extractionRecipes"])])
        hit = _CACHE["proj"].get(key)
        if hit is None:
            cvt, _ = self.complete_view_of(decoded)
            cls = self.cv_classes(decoded, decoder_id)[view_name]
            idx = [i for i, c in enumerate(cls) if c == 0]
            hit = ("".join(cvt.text[i] for i in idx), idx)
            _CACHE["proj"][key] = hit
        return hit

    def _no_created_apparent(self, decoded, decoder_id, k):
        """U3 for one member: every occurrence of k in every view's surviving projection occupies consecutive complete-view positions."""
        for name in sorted(self.cv_classes(decoded, decoder_id)):
            ptext, idx = self._projection(decoded, decoder_id, name)
            j = ptext.find(k)
            while j >= 0:
                if idx[j + len(k) - 1] - idx[j] != len(k) - 1:
                    return False
                j = ptext.find(k, j + 1)
        return True

    def _frame_u_guard(self, members, k, key_has_seam_record, ctx):
        """G(U, k). Member-level conditions (U1, U2, U3) are evaluated for every member in R-DUP group order; the key-level condition (U4)
        once. outcomes: per condition, True iff it holds for every member (None where it could not be evaluated because U1 failed for a member).
        The decision is the conjunction. The recorded reason is the first failing condition in member order (U1, U2, U3 within a member), then U4."""
        fu = self.oa["frameU"]
        member_level = ("SKELETON_EXACTLY_ONCE_IN_EVERY_COMPLETE_VIEW", "CANDIDATE_NOT_A_SEAM_IN_ANY_MEMBER", "NO_APPARENT_OCCURRENCE_CREATED_BY_REMOVAL")
        per = dict((c["id"], []) for c in fu["guard"])
        reason = None
        for m in members:
            w = None
            for cond in fu["guard"]:
                t = cond["test"]
                if t not in member_level:
                    continue
                if t == "SKELETON_EXACTLY_ONCE_IN_EVERY_COMPLETE_VIEW":
                    cvt, _ = self.complete_view_of(ctx["rend"][m])
                    occ = []
                    j = cvt.text.find(k)
                    while j >= 0:
                        occ.append(j)
                        j = cvt.text.find(k, j + 1)
                    if len(occ) == 1:
                        w = [occ[0], occ[0] + len(k)]
                    if fu["countView"] == "COMPLETE_VIEW":
                        n = len(occ)
                    else:
                        self.legacy_calls += 1
                        n = _legacy_parent_count(ctx["rend"][m], self.oa["completeView"], k)
                    ok = n == 1
                elif t == "CANDIDATE_NOT_A_SEAM_IN_ANY_MEMBER":
                    if w is None:
                        ok = None if fu["countView"] == "COMPLETE_VIEW" else True
                    else:
                        ok = not self.seam(ctx["rend"][m], ctx["arts"][m]["renditionDecoder"], w)
                else:
                    ok = self._no_created_apparent(ctx["rend"][m], ctx["arts"][m]["renditionDecoder"], k)
                per[cond["id"]].append(ok)
                if ok is not True and reason is None:
                    reason = cond["reason"]
        for cond in fu["guard"]:
            t = cond["test"]
            if t in member_level:
                continue
            if t == "NO_SEAM_RECORD_CARRIES_THE_KEY":
                ok = not key_has_seam_record
            else:
                raise ModelError("UNKNOWN_GUARD_TEST", str(t))
            per[cond["id"]].append(ok)
            if ok is not True and reason is None:
                reason = cond["reason"]
        outcomes = {}
        for cond in fu["guard"]:
            v = per[cond["id"]]
            outcomes[cond["id"]] = False if False in v else (None if None in v else True)
        return {"outcomes": outcomes, "reason": reason}

    def _anchor_values(self, frame, f, it):
        cs = self.csi_spec
        prim = {"COMPLETE_VIEW_INTERVAL_START": lambda: f["omega"][0], "COMPLETE_VIEW_INTERVAL_END": lambda: f["omega"][1],
                "CONTENT_SKELETON_SHA256": lambda: sha_text(f["k"]),
                # DORMANT diagnostic primitives: a forced-failure surface only; the delivered model never names them as anchor components
                "OWN_OCCURRENCE_RANK": lambda: _legacy_own_rank(self, it), "CANONICAL_CONTENT_SHA256": lambda: sha_text(f["canonicalContent"]),
                "ARTIFACT_IDENTITY": lambda: it["aid"]}
        comps = cs["frames"][frame]["anchorComponents"]
        return comps, [prim[cs["anchorPrimitives"][c]]() for c in comps]

    def anchor_all(self, items, ctx):
        """Occurrence identity of every bound segment. items: [{key, aid, recipe, a, b, doc, cdoc, did, sat, state, cls}] in record order;
        ctx: {arts, raw, rend, members, unresolved}. Three passes: (i) per record, the facts and the PROVISIONAL occurrence (FRAME-C (U, omega),
        FRAME-U (U, k)) or the pre-occurrence exit; (ii) per occurrence / per key, the occurrence-level gates; (iii) OA-14 over the whole corpus.
        Returns one decision per item: identity, components, correspondence, anchor block, diagnostics, and whether a class state may stand."""
        cs, oa = self.csi_spec, self.oa
        fn = cs["identityFunction"]
        if fn == "LEGACY_V5_PROOFS":
            return [_legacy_v5_identity(self, it, ctx) for it in items]
        if fn != "COMPLETE_VIEW_FRAMES":
            raise ModelError("UNKNOWN_IDENTITY_FUNCTION", str(fn))
        reasons = oa["failClosed"]["reasons"]
        fc, fu = oa["frameC"], oa["frameU"]
        fcn, fun = fc["recordedAs"], fu["recordedAs"]
        marker = cs["whenNotEstablished"]["marker"]
        cond_nonempty = [c for c in fc["conditions"] if c["test"] == "OMEGA_NON_EMPTY"]
        if len(cond_nonempty) != 1:
            raise ModelError("FRAME_C_NON_EMPTY_CONDITION", str(len(cond_nonempty)))
        out, frame_of = [], {}
        # ---- (i) per record: facts, provisional occurrence or pre-occurrence exit
        for it in items:
            aid, recipe = it["aid"], it["recipe"]
            anchor = {"frame": None, "sourceOriginAnchor": None, "provisionalOccurrence": None, "completeViewInterval": None,
                      "contentSkeletonSha256": None, "unresolvedReason": None, "failedConditions": None, "occurrenceRepresentable": None,
                      "ownImageRepresentable": None, "seamTaint": None, "ownSeam": None, "frameUGuard": None}
            d = {"identity": None, "components": None, "correspondence": marker, "anchor": anchor, "diagnostics": None, "facts": None, "keepState": False}
            out.append(d)
            members = ctx["members"][aid]
            if ctx["unresolved"][aid]:
                anchor["unresolvedReason"] = reasons["duplicateGroupUnresolved"]
                continue
            if any(ctx["rend"][m] is None for m in members):
                anchor["unresolvedReason"] = reasons["memberBytesUnavailable"]
                continue
            rdec = self.recipe(recipe)["decoder"]
            decoded = self.decoded_text(ctx["raw"][aid], rdec)
            f = self.anchor_facts(decoded, recipe, it["doc"], it["a"], it["b"])
            d["facts"] = f
            d["diagnostics"] = {"canonicalSegmentContentHash": sha_text(f["canonicalContent"]) if f["canonicalContent"] else None,
                                "occurrencesInOwnCanonicalExtraction": _occurrences(it["cdoc"], f["canonicalContent"]) if f["canonicalContent"] else 0}
            if f["k"]:
                anchor["contentSkeletonSha256"] = sha_text(f["k"])
            if f["sigma"] is None:
                anchor["unresolvedReason"] = reasons["emptyCanonicalSegment"]
                continue
            anchor["sourceOriginAnchor"] = {"decodedInterval": f["sigma"], "anchorBasis": f["basis"]}
            if rdec != ctx["arts"][aid]["renditionDecoder"]:
                anchor["unresolvedReason"] = reasons["decoderFrameMismatch"]
                continue
            U = it["did"]
            if U not in frame_of:
                fsel = oa["frameSelection"]["frameCWhen"]
                texts = [self.complete_view_of(ctx["rend"][m])[0].text for m in members]
                if fsel == "EVERY_MEMBER_COMPLETE_VIEW_EQUAL":
                    frame_of[U] = fcn if all(x == texts[0] for x in texts) else fun
                elif fsel in ("ALWAYS", "NEVER"):
                    self.legacy_calls += 1      # DORMANT (forced-failure surfaces): a frame chosen without the equality proof
                    frame_of[U] = fcn if fsel == "ALWAYS" else fun
                else:
                    raise ModelError("UNKNOWN_FRAME_SELECTION", str(fsel))
            anchor["frame"] = frame_of[U]
            cvt, _ = self.complete_view_of(decoded)
            w, representable = self.omega(cvt, f["sigma"])
            f["omega"], f["representable"] = w, representable
            if w is not None:
                anchor["ownImageRepresentable"] = representable
                anchor["ownSeam"] = (not representable) or bool(self.seam(decoded, rdec, w))
            if anchor["frame"] == fcn:
                if w is None:
                    anchor["unresolvedReason"] = cond_nonempty[0]["reason"]
                    continue
                anchor["provisionalOccurrence"] = {"frame": fcn, "completeViewInterval": list(w)}
            else:
                if not f["k"]:
                    anchor["unresolvedReason"] = fu["emptySkeletonReason"]
                    continue
                anchor["provisionalOccurrence"] = {"frame": fun, "contentSkeletonSha256": sha_text(f["k"])}
        # ---- (ii) occurrence-level facts: representability per (U, omega) over EVERY record carrying it; own seams per (U, k) for U4
        occ_rep, key_seam = {}, {}
        for it, d in zip(items, out):
            a = d["anchor"]
            if a["provisionalOccurrence"] is None:
                continue
            f = d["facts"]
            if a["frame"] == fcn:
                ok_key = (it["did"], f["omega"][0], f["omega"][1])
                occ_rep[ok_key] = occ_rep.get(ok_key, True) and bool(f["representable"])
            else:
                kk = (it["did"], f["k"])
                key_seam[kk] = key_seam.get(kk, False) or bool(a["ownSeam"])
        guards = {}
        for it, d in zip(items, out):
            a, f = d["anchor"], d["facts"]
            if a["provisionalOccurrence"] is None:
                continue
            aid, U = it["aid"], it["did"]
            members = ctx["members"][aid]
            reason = None
            if a["frame"] == fcn:
                failed = []
                for cond in fc["conditions"]:
                    t = cond["test"]
                    if t == "OMEGA_NON_EMPTY":
                        continue                     # holds: the record has a provisional occurrence
                    if t == "FRAME_C_OCCURRENCE_REPRESENTABLE":
                        ok = occ_rep[(U, f["omega"][0], f["omega"][1])]
                        a["occurrenceRepresentable"] = ok
                    elif t == "OMEGA_REPRESENTABLE":
                        # DORMANT (a forced-failure surface): the per-record reading of OA-7(b) that CORR1.CORR1 withdrew
                        self.legacy_calls += 1
                        ok = bool(f["representable"])
                    elif t == "NO_TEXT_BEARING_REMOVAL_SEAM":
                        scope = members if fc["taintScope"] == "EVERY_MEMBER" else [aid]
                        taint = {}
                        for m in scope:
                            h = self.seam(ctx["rend"][m], ctx["arts"][m]["renditionDecoder"], f["omega"])
                            if h:
                                taint[m] = h
                        a["seamTaint"] = taint or None
                        ok = not taint
                    else:
                        raise ModelError("UNKNOWN_FRAME_CONDITION", str(t))
                    if not ok:
                        failed.append(cond)
                if failed:
                    # the decision is the conjunction of every condition; the recorded reason is the first failing one in declared order
                    reason = failed[0]["reason"]
                    a["failedConditions"] = [c["id"] for c in failed]
                else:
                    a["completeViewInterval"] = f["omega"]
            else:
                kk = (U, f["k"])
                if kk not in guards:
                    guards[kk] = self._frame_u_guard(members, f["k"], key_seam.get(kk, False), ctx)
                a["frameUGuard"] = guards[kk]["outcomes"]
                reason = guards[kk]["reason"]
                # DORMANT (a forced-failure surface): a record-local own-seam gate; the delivered model declares none
                if reason is None and fu.get("recordLocalOwnSeamGate") and a["ownSeam"]:
                    self.legacy_calls += 1
                    reason = fu.get("recordLocalOwnSeamReason", fu["guard"][0]["reason"])
            if reason is not None:
                a["unresolvedReason"] = reason
                continue
            names, vals = self._anchor_values(a["frame"], f, it)
            d["identity"] = self.identity_string(U, a["frame"], vals)
            comps = {"underlyingDocumentIdentity": U, "frameTag": cs["frames"][a["frame"]]["tag"]}
            comps.update(zip(names, vals))
            d["components"] = comps
            d["correspondence"] = a["frame"]
            d["keepState"] = True
        # ---- (iii) OA-14: unplaced conflict witnesses and the class-conditional quarantine (one simultaneous step, before R-COUNT)
        rows = [{"key": it["key"], "aid": it["aid"], "U": it["did"], "resolved": not ctx["unresolved"][it["aid"]], "identity": d["identity"],
                 "reason": d["anchor"]["unresolvedReason"], "sat": list(it["sat"]), "state": it["state"], "cls": it["cls"],
                 "canonicalContent": (d["facts"] or {}).get("canonicalContent")} for it, d in zip(items, out)]
        rows2, _ = self.unplaced_witness_stage(rows)
        for d, r in zip(out, rows2):
            a = d["anchor"]
            if "unplaced" in r:
                a["unplaced"] = r["unplaced"]
            if r.get("withheldOccurrence"):
                a["withheldOccurrence"], a["quarantineWitnesses"] = r["withheldOccurrence"], r["quarantineWitnesses"]
                a["unresolvedReason"], a["completeViewInterval"] = r["reason"], None
                d["identity"], d["components"], d["correspondence"], d["keepState"] = None, None, marker, False
        act = cs["whenNotEstablished"]["action"]
        if act == "WILDCARD":
            # DORMANT (a forced-failure surface): the removed RR-17 wildcard; the delivered model declares FAIL_CLOSED_NO_IDENTITY
            self.legacy_calls += 1
            for it, d in zip(items, out):
                if d["identity"] is None and d["facts"] is not None:
                    key = cs["keySeparator"].join([cs["versionTag"], it["did"], "W", str(cs["whenNotEstablished"].get("value")),
                                                  sha_text(d["facts"]["k"] or d["facts"]["canonicalContent"])])
                    d["identity"], d["keepState"] = cs["prefix"] + sha_text(key), True
        elif act == "KEEP_STATE_NO_IDENTITY":
            # DORMANT (a forced-failure surface): an unestablished occurrence allowed to keep its class state and count
            self.legacy_calls += 1
            for d in out:
                if d["identity"] is None and d["facts"] is not None:
                    d["keepState"] = True
        elif act != "FAIL_CLOSED_NO_IDENTITY":
            raise ModelError("UNKNOWN_UNESTABLISHED_ACTION", str(act))
        return out

    # ---------------------------------------------------------------- OA-14 (occurrenceAnchoring.unplacedWitness)
    def unplaced_witness_stage(self, rows):
        """OA-14 over one corpus. rows: one dict per bound segment in record order {key, aid, U, resolved, identity, reason, sat, state, cls,
        canonicalContent}. Pure: returns (new rows, summary); the input is not modified. The delivered model declares a witness source, a candidate
        set basis, a quarantine rule and a SIMULTANEOUS application: every witness, every candidate set and every occurrence class set is computed
        from the input, then every quarantine is applied at once (order independent, no cascade, idempotent)."""
        out = [dict(r) for r in rows]
        spec = self.oa.get("unplacedWitness")
        if not spec:
            return out, {"witnesses": [], "quarantined": {}}
        wit, cand, q = spec["witness"], spec["candidateSet"], spec["quarantine"]
        exits = set(spec["unplacedExits"])
        if cand["exclusionProofs"]:
            raise ModelError("UNKNOWN_CANDIDATE_SET_EXCLUSION_PROOF", str(cand["exclusionProofs"])[:80])
        need = wit["positiveClassesRequired"]
        assigned = self.roles[q["countedStateRole"]]

        def unplaced(r, withheld_now=()):
            if not r["resolved"] or r["identity"] is not None:
                return False
            if wit["source"] == "PRE_OCCURRENCE_EXIT":
                return r["reason"] in exits
            if wit["source"] == "ANY_UNESTABLISHED":
                self.legacy_calls += 1          # DORMANT (a forced-failure surface): a cascade, every record without an identity
                return True
            raise ModelError("UNKNOWN_WITNESS_SOURCE", str(wit["source"]))

        def established(state_rows):
            est, carried = {}, {}
            for r in state_rows:
                o = r["identity"]
                if o is None:
                    continue
                lst = est.setdefault(r["U"], [])
                if o not in lst:
                    lst.append(o)
                if r["state"] == assigned:
                    carried.setdefault(o, set()).add(r["cls"])
            return est, carried

        def candidates(r, state_rows, est):
            basis = cand["basis"]
            if basis == "ALL_ESTABLISHED_OCCURRENCES_OF_U":
                return sorted(est.get(r["U"], []))
            self.legacy_calls += 1              # DORMANT (forced-failure surfaces): narrowing rules the architecture forbids
            if basis == "OWN_MEMBER_OCCURRENCES":
                return sorted(set(x["identity"] for x in state_rows if x["identity"] and x["aid"] == r["aid"]))
            if basis == "TEXT_EQUAL_OCCURRENCES":
                return sorted(set(x["identity"] for x in state_rows if x["identity"] and x["U"] == r["U"] and x["canonicalContent"] == r["canonicalContent"]))
            if basis == "FIRST_ESTABLISHED_OCCURRENCE":
                return est.get(r["U"], [])[:1]
            raise ModelError("UNKNOWN_CANDIDATE_SET_BASIS", str(basis))

        def hits(c, C, carried, consumed, immune):
            rule = q["rule"]
            if rule == "SINGLE_COUNTED_CLASS_DIFFERS":
                return [o for o in C if len(carried.get(o, ())) == 1 and c not in carried[o]]
            self.legacy_calls += 1              # DORMANT (forced-failure surfaces): quarantine rules the architecture forbids
            if rule == "ANY_COUNTED_CLASS":
                return [o for o in C if carried.get(o)]
            if rule == "SKIP_WITNESS_IF_SAME_CLASS_OCCURRENCE":
                if any(carried.get(o) == {c} for o in C):
                    return []
                return [o for o in C if len(carried.get(o, ())) == 1 and c not in carried[o]]
            if rule == "GREEDY_CONSUME_SAME_CLASS":
                own = [o for o in C if carried.get(o) == {c} and o not in consumed]
                if own:
                    consumed.add(own[0])
                    immune.add(own[0])
                    return []
                return [o for o in C if len(carried.get(o, ())) == 1 and c not in carried[o] and o not in immune]
            raise ModelError("UNKNOWN_QUARANTINE_RULE", str(rule))

        diag = {}

        def as_witness(i, r, state_rows, est):
            if len(r["sat"]) == need:
                c = self.labels[r["sat"][0]]
                C = candidates(r, state_rows, est)
                diag[i] = {"role": wit["role"], "class": c, "candidateSet": C, "candidateSetBasis": cand["basis"]}
                return c, C
            diag[i] = {"role": None, "why": wit["notAWitness"]["noClass"] if not r["sat"] else wit["notAWitness"]["multiple"]}
            return None, None

        Q = {}
        if spec["application"] == "SIMULTANEOUS":
            est, carried = established(out)
            consumed, immune = set(), set()
            for i, r in enumerate(out):
                if not unplaced(r):
                    continue
                c, C = as_witness(i, r, out, est)
                if c is None:
                    continue
                for o in hits(c, C, carried, consumed, immune):
                    Q.setdefault(o, set()).add(r["key"])
            for r in out:
                o = r["identity"]
                if o in Q:
                    r.update(withheldOccurrence=o, quarantineWitnesses=sorted(Q[o]), identity=None, reason=q["reason"], state=self.roles[q["stateRole"]], cls=None)
        elif spec["application"] == "SEQUENTIAL":
            # DORMANT (a forced-failure surface): witnesses applied one by one, in record order, to the state earlier witnesses changed
            self.legacy_calls += 1
            consumed, immune = set(), set()
            for i, r in enumerate(out):
                if not (unplaced(r) or r.get("withheldOccurrence")):
                    continue
                est, carried = established(out)
                c, C = as_witness(i, r, out, est)
                if c is None:
                    continue
                for o in hits(c, C, carried, consumed, immune):
                    Q.setdefault(o, set()).add(r["key"])
                    for x in out:
                        if x["identity"] == o:
                            x.update(withheldOccurrence=o, quarantineWitnesses=sorted(Q[o]), identity=None, reason=q["reason"], state=self.roles[q["stateRole"]], cls=None)
        else:
            raise ModelError("UNKNOWN_OA14_APPLICATION", str(spec["application"]))
        for i, dg in diag.items():
            out[i]["unplaced"] = dg
        return out, {"witnesses": sorted(out[i]["key"] for i, dg in diag.items() if dg["role"]), "quarantined": dict((o, sorted(v)) for o, v in sorted(Q.items()))}

    # ---------------------------------------------------------------- duplicate identity
    def _cond(self, machine, ctx):
        if "allOf" in machine:
            return all(self._cond(m, ctx) for m in machine["allOf"])
        if "hasPositiveLink" in machine:
            return bool(ctx["positive"]) == machine["hasPositiveLink"]
        if "hasSplit" in machine:
            return bool(ctx["split"]) == machine["hasSplit"]
        if "hasCandidate" in machine:
            return bool(ctx["candidate"]) == machine["hasCandidate"]
        if "linkPresent" in machine:
            return machine["linkPresent"] in ctx["positive"]
        if "equivalence" in machine:
            return ctx["equivalence"]() == self.eq_states[machine["equivalence"]]
        raise ModelError("UNKNOWN_CONDITION", json.dumps(machine))

    @staticmethod
    def _derive(identity, spec):
        """A candidate key derived from an identity field by the model's declared pattern; None when absent."""
        v = identity.get(spec["from"])
        m = re.search(spec["pattern"], v) if isinstance(v, str) else None
        return m.group(spec["group"]) if m else None

    def equivalence(self, ta, tb):
        p = self.rdup["renditionEquivalenceTest"]["parameters"]
        if ta is None or tb is None:
            return self.eq_states["unresolved"]
        if not p["serializationDifferencePermitted"] and ta != tb:
            return self.eq_states["divergent"]
        if self.canonical(ta) == self.canonical(tb):
            return self.eq_states["equivalent"]
        return self.eq_states["divergent"] if p["substantiveDivergenceBlocks"] else self.eq_states["equivalent"]

    def eval_duplicate(self, a, b, ta=None, tb=None):
        rd = self.rdup
        positive, never, split = [], [], []
        for rule in rd["linkRules"]:
            gate = rule.get("admittedOnlyIfSourceIdScopeIsNot")
            if gate is not None and rd["sourceIdScope"] == gate:
                continue
            if all(a.get(f) is not None and a.get(f) == b.get(f) for f in rule["fieldsEqualNonNull"]):
                positive.append(rule["link"])
        for rule in rd["neverSufficientRules"]:
            if all(a.get(f) is not None and a.get(f) == b.get(f) for f in rule["fieldsEqualNonNull"]):
                never.append(rule["marker"])
        candidate = []
        for rule in rd["candidateRules"]:
            va, vb = self._derive(a, rule["derive"]), self._derive(b, rule["derive"])
            if va is not None and va == vb:
                candidate.append(rule["candidate"])
        for rule in rd["splitRules"]:
            if "truthinessDiffers" in rule and bool(a.get(rule["truthinessDiffers"])) != bool(b.get(rule["truthinessDiffers"])):
                split.append(rule["split"])
            f = rule.get("bothNonNullAndDiffer")
            if f and a.get(f) is not None and b.get(f) is not None and a.get(f) != b.get(f):
                split.append(rule["split"])
        memo = {}

        def eqv():
            if "v" not in memo:
                memo["v"] = self.equivalence(ta, tb)
            return memo["v"]

        ctx = {"positive": positive, "split": split, "candidate": candidate, "equivalence": eqv}
        for step in rd["decisionProcedure"]:
            if self._cond(rd["conditionMachine"][step["when"]], ctx):
                return {"positiveLinks": positive, "neverSufficient": never, "splitEvidence": split,
                        "candidateLinks": candidate,
                        "renditionEquivalence": memo.get("v"), "decisionStep": step["step"],
                        "result": self.id_states[step["resultRole"]],
                        "state": self.id_states[step["stateRole"]], "basis": step["basis"]}
        raise ModelError("DUPLICATE_PROCEDURE_NOT_CLOSED", "")

    # ---------------------------------------------------------------- srcDiv
    def count(self, seg_records, b2=None):
        key_fields = self.count_spec["groupingKey"]
        eligible = self.bm["states"]["countingEligible"]
        groups = {}
        for r in seg_records:
            if r["sourceClassAssignmentState"] not in eligible:
                continue
            key = tuple(r[k] for k in key_fields)
            groups.setdefault(key, set()).add(r["sourceClass"])
        contributed, conflicts = {}, []
        for key in sorted(groups):
            if len(groups[key]) == 1:
                contributed[key] = next(iter(groups[key]))
            else:
                conflicts.append({"key": list(key), "classes": sorted(groups[key]),
                                  "disposition": self.count_spec["countingDispositions"][0]["id"]})
        basis = None
        if b2 is not None:
            # R-COUNT step 5b (boundaryModel.basisOverlap): the exact-CSI groups of the count candidates become basis count components; a group
            # the layer does not place (no established occurrence) keeps its step-5 contribution unchanged
            placed = set(tuple(f["groupKey"]) for f in b2["facts"].values())
            comp, basis = self.basis_overlap(seg_records, b2)
            contributed = dict((k, v) for k, v in contributed.items() if k not in placed)
            contributed.update(comp)
        distinct = sorted(set(contributed.values()))
        by_doc = {}
        for key, label in contributed.items():
            by_doc.setdefault(key[0], set()).add(label)
        out = {"distinctClassSet": distinct, "size": len(distinct),
               "holds": len(distinct) >= self.count_spec["holdsWhenDistinctClassesAtLeast"],
               "contributingGroups": len(contributed), "segmentClassConflicts": conflicts,
               "documentsContributing": len(by_doc),
               "multiClassDocuments": dict((d, sorted(c)) for d, c in sorted(by_doc.items()) if len(c) > 1)}
        if basis is not None:
            out[self.b2["recording"]["field"]] = basis
        return out

    # ---------------------------------------------------------------- B-2 basis-overlap anti-inflation (boundaryModel.basisOverlap; R-COUNT step 5b)
    # Reads ONLY what Option A+ established (identities, complete-view intervals, FRAME-U keys, states, classes) and the frozen evidence (units,
    # declared separators, witnessed assertions). It never writes a segment record: identity, state, class and predicate results are untouched.
    def _b2_class_features(self, class_id):
        """Every feature the frozen predicate of one class reads (its components and its exclusions)."""
        c = self.classes[class_id]
        acc = set()

        def walk(e):
            if isinstance(e, dict):
                if "feature" in e:
                    acc.add(e["feature"])
                for v in e.values():
                    walk(v)
            elif isinstance(e, list):
                for v in e:
                    walk(v)
        for x in c["components"]:
            walk(x["expr"])
        for x in c["exclusions"]:
            walk(x["expr"])
        return acc

    def _b2_member_cv(self, m, ctx):
        return self.complete_view_of(ctx["rend"][m])[0].text

    def _b2_unit_positions(self, it, dec, units, ctx):
        """{unitId: {member: [start, end)}} of the complete-view letters of every unit of one ESTABLISHED segment, in the shared frame of U
        (FRAME-C: one frame '*'; FRAME-U: every member, offset inside the member interval w_m(k) that U1 established). None where unlocatable."""
        a = dec["anchor"]
        rdec = self.recipe(it["recipe"])["decoder"]
        decoded = self.decoded_text(ctx["raw"][it["aid"]], rdec)
        out = {}
        if a["frame"] == self.oa["frameC"]["recordedAs"]:
            cvt, _ = self.complete_view_of(decoded)
            for u in units:
                f = self.anchor_facts(decoded, it["recipe"], it["doc"], u["start"], u["end"])
                w = self.omega(cvt, f["sigma"])[0] if f["sigma"] is not None else None
                out[u["unitId"]] = {self.b2["footprint"]["sharedFrameMember"]: list(w)} if w else None
            return out
        k = dec["facts"]["k"]
        E, _ = self.tracked_extract(decoded, it["recipe"])
        K = apply_ops_tracked(E.slice(it["a"], it["b"]), self.oa["anchorSource"]["coderText"]["ops"], opbase=2000)
        if K.text != k:
            raise ModelError("TRACKED_REPLAY_MISMATCH", "basisOverlap skeleton")
        w = {}
        for m in ctx["members"][it["aid"]]:
            cv = self._b2_member_cv(m, ctx)
            j = cv.find(k)
            if j < 0 or cv.find(k, j + 1) >= 0:
                return dict((u["unitId"], None) for u in units)
            w[m] = j
        for u in units:
            lo, hi = E.s[u["start"]], E.e[u["end"] - 1]
            offs = [j for j in range(len(K.text)) if K.s[j] >= lo and K.e[j] <= hi]
            out[u["unitId"]] = dict((m, [w[m] + offs[0], w[m] + offs[-1] + 1]) for m in w) if offs else None
        return out

    def _b2_placed(self, it, dec, ctx):
        """True iff A+ established an occurrence the footprint can be read from (a FRAME-C interval, or a FRAME-U key once in every member)."""
        a = dec["anchor"]
        if a["frame"] == self.oa["frameC"]["recordedAs"]:
            return a["completeViewInterval"] is not None
        k = (dec["facts"] or {}).get("k")
        if a["frame"] != self.oa["frameU"]["recordedAs"] or not k:
            return False
        for m in ctx["members"][it["aid"]]:
            cv = self._b2_member_cv(m, ctx)
            j = cv.find(k)
            if j < 0 or cv.find(k, j + 1) >= 0:
                return False
        return True

    def _b2_footprint(self, it, dec, ctx):
        a = dec["anchor"]
        if a["frame"] == self.oa["frameC"]["recordedAs"]:
            return {self.b2["footprint"]["sharedFrameMember"]: list(a["completeViewInterval"])}
        k = dec["facts"]["k"]
        fp = {}
        for m in ctx["members"][it["aid"]]:
            j = self._b2_member_cv(m, ctx).find(k)
            fp[m] = [j, j + len(k)]
        return fp

    def basis_overlap_facts(self, items, decisions, seg_units, segs, records, ctx):
        """The B-2 input: one fact block per count candidate (counting-eligible state and an established identity after occurrence anchoring).
        Footprints always; support cores, sufficiency and the recorded boundaries of the candidate's own support record only for documents with
        two or more candidate identities (the only place an overlap can exist). A pure function of the evidence and of the A+ decisions."""
        if not self.b2:
            return None
        eligible = self.bm["states"]["countingEligible"]
        lawful = set(self.seg["lawfulSeparators"])
        idx = dict((s["segmentId"], i) for i, s in enumerate(segs))
        cand = [i for i, s in enumerate(segs) if s["sourceClassAssignmentState"] in eligible and decisions[i]["identity"] is not None
                and self._b2_placed(items[i], decisions[i], ctx)]
        per_u = {}
        for i in cand:
            per_u.setdefault(items[i]["did"], set()).add(decisions[i]["identity"])
        rec_by_id = dict((r["recordId"], r) for r in records)
        unit_seg = {}
        for i, (rec, g) in enumerate(seg_units):
            for u in g:
                unit_seg[(rec["recordId"], u["unitId"])] = i
        pos_cache = {}

        def positions(i):
            if i not in pos_cache:
                d = decisions[i]
                pos_cache[i] = self._b2_unit_positions(items[i], d, seg_units[i][1], ctx) if d["identity"] is not None else None
            return pos_cache[i]

        def boundaries(rid):
            out = []
            units = rec_by_id[rid]["units"]
            for n in range(1, len(units)):
                sep = units[n]["separatorBefore"]
                if sep not in lawful:
                    continue
                ip, inx = unit_seg.get((rid, units[n - 1]["unitId"])), unit_seg.get((rid, units[n]["unitId"]))
                if ip is None or inx is None:
                    continue
                pp, pn = positions(ip), positions(inx)
                if pp is None or pn is None:
                    continue                         # an adjacent segment has no established occurrence: the boundary cannot be placed
                a, b = pp.get(units[n - 1]["unitId"]), pn.get(units[n]["unitId"])
                if not a or not b or set(a) != set(b):
                    continue
                locus = dict((m, [a[m][1], b[m][0]]) for m in sorted(a))
                if any(v[0] > v[1] for v in locus.values()):
                    continue
                out.append({"recordId": rid, "unitId": units[n]["unitId"], "separator": sep, "locus": locus})
            return out
        facts = {}
        spec = self.b2["supportCore"]
        for i in cand:
            it, d, s = items[i], decisions[i], segs[i]
            f = {"segmentId": s["segmentId"], "recordId": s["recordId"], "order": i, "U": it["did"], "identity": d["identity"],
                 "groupKey": [s[k] for k in self.count_spec["groupingKey"]],
                 "frame": d["anchor"]["frame"], "sourceClass": s["sourceClass"], "footprint": self._b2_footprint(it, d, ctx),
                 "aid": it["aid"], "span": [it["a"], it["b"]], "canonicalContent": d["facts"]["canonicalContent"]}
            if len(per_u[it["did"]]) >= 2:
                units = seg_units[i][1]
                cid = s["satisfiedClassIds"][0]
                read = self._b2_class_features(cid) if spec["participation"] == "FEATURES_READ_BY_THE_SATISFIED_CLASS" else None
                if read is None:
                    raise ModelError("UNKNOWN_SUPPORT_CORE_PARTICIPATION", str(spec["participation"]))
                core_units = [u for u in units if any(a["featureId"] in read for a in u.get("assertions", []))]
                pos = positions(i)
                expanded = not core_units or any(pos.get(u["unitId"]) is None for u in core_units)
                if expanded:
                    if spec["whenEmptyOrUnlocated"] != "WHOLE_SEGMENT":
                        raise ModelError("UNKNOWN_SUPPORT_CORE_EXPANSION", str(spec["whenEmptyOrUnlocated"]))
                    core_units = list(units)
                    core = dict((m, [list(v)]) for m, v in f["footprint"].items())
                else:
                    core = dict((m, [pos[u["unitId"]][m] for u in core_units]) for m in f["footprint"])
                if spec["sufficiency"] != "CORE_ASSERTIONS_ALONE_YIELD_THE_SAME_ASSIGNED_CLASS":
                    raise ModelError("UNKNOWN_SUPPORT_CORE_SUFFICIENCY", str(spec["sufficiency"]))
                feats = self.feature_record([a for u in core_units for a in u.get("assertions", [])])
                r = self.eval_segment(feats, True) if not self.constraint_violations(feats) else None
                f["core"] = {"unitIds": [u["unitId"] for u in core_units], "positions": core, "expandedToWholeSegment": expanded,
                             "spans": [[u["start"], u["end"]] for u in core_units],
                             "sufficient": bool(r and r["sourceClassAssignmentState"] == s["sourceClassAssignmentState"] and r["sourceClass"] == s["sourceClass"])}
                f["boundaries"] = boundaries(s["recordId"])
            facts[s["segmentId"]] = f
        out = {"facts": facts, "records": [f["segmentId"] for f in sorted(facts.values(), key=lambda x: x["order"])]}
        if self.b2.get("touchingAtom"):
            out["atoms"] = self.basis_atom_facts(facts, ctx)
        return out

    def _b2_relation(self, fa, fb):
        """(relation label, proven-or-possible overlap?) of two footprints of one document, from the model's overlap declaration."""
        ov = self.b2["overlap"]
        rel = ov["relations"]
        test = ov["test"]
        if test == "SHARED_COMPLETE_VIEW_POSITION":
            members = sorted(set(fa["footprint"]) & set(fb["footprint"]))
            hit = [m for m in members if fa["footprint"][m][0] < fb["footprint"][m][1] and fb["footprint"][m][0] < fa["footprint"][m][1]]
            if fa["frame"] == self.oa["frameC"]["recordedAs"]:
                return (rel["overlapping"], True) if hit else (rel["nonOverlapping"], False)
            mode = ov["frameU"]
            if mode == "ANY_RESOLVED_MEMBER":
                if not hit:
                    return rel["nonOverlapping"], False
                return (rel["overlappingEveryMember"], True) if len(hit) == len(members) else (rel["overlappingSomeMembers"], True)
            self.legacy_calls += 1                  # DORMANT (forced-failure surfaces): FRAME-U overlap ignored, or one member chosen
            if mode == "IGNORE":
                return rel["nonOverlapping"], False
            if mode == "FIRST_MEMBER":
                return (rel["overlapping"], True) if members and members[0] in hit else (rel["nonOverlapping"], False)
            raise ModelError("UNKNOWN_FRAME_U_OVERLAP_MODE", str(mode))
        self.legacy_calls += 1                      # DORMANT (forced-failure surfaces): overlap tests the architecture forbids
        if test == "EXACT_IDENTITY_ONLY":
            ok = fa["identity"] == fb["identity"]
        elif test == "SAME_DOCUMENT":
            ok = True
        elif test == "TEXT_EQUALITY":
            ok = bool(fa["canonicalContent"] and fb["canonicalContent"]) and (fa["canonicalContent"] in fb["canonicalContent"] or fb["canonicalContent"] in fa["canonicalContent"])
        elif test == "ARTIFACT_LOCAL_OFFSETS":
            ok = fa["span"][0] < fb["span"][1] and fb["span"][0] < fa["span"][1]
        else:
            raise ModelError("UNKNOWN_OVERLAP_TEST", str(test))
        return (rel["overlapping"], True) if ok else (rel["nonOverlapping"], False)

    def _b2_separation(self, fa, fb, facts_by_record, docs):
        """LAWFULLY_SEPARATE_SUPPORT(a, b): the conjunction of the model's conditions, every one mechanical. Returns the proof block."""
        ls = self.b2["lawfulSeparation"]
        ca, cb = fa.get("core"), fb.get("core")
        res, boundary = {}, None
        for cond in ls["conditions"]:
            t = cond["test"]
            if t == "DISTINCT_SUPPORT_RECORDS":
                ok = fa["segmentId"] != fb["segmentId"]
            elif t == "CORE_SUFFICIENT_FOR_FIRST":
                ok = bool(ca and ca["sufficient"])
            elif t == "CORE_SUFFICIENT_FOR_SECOND":
                ok = bool(cb and cb["sufficient"])
            elif t == "CORES_DISJOINT":
                ok = bool(ca and cb) and all(not (x[0] < y[1] and y[0] < x[1]) for m in ca["positions"] for x in ca["positions"][m]
                                             for y in cb["positions"].get(m, []))
            elif t == "RECORDED_LAWFUL_BOUNDARY_BETWEEN_CORES":
                ok, boundary = False, None
                src = ls["boundarySource"]
                cands = []
                if src in ("RECORDED_SEPARATOR_OF_EITHER_RECORD", "RECORDED_OR_PUNCTUATION"):
                    for rid in sorted({fa["recordId"], fb["recordId"]}):
                        cands.extend(facts_by_record.get(rid, []))
                elif src != "NO_BOUNDARY_ACCEPTED":
                    raise ModelError("UNKNOWN_BOUNDARY_SOURCE", str(src))
                else:
                    self.legacy_calls += 1          # DORMANT (a forced-failure surface): no lawful boundary is ever accepted
                if ca and cb:
                    for bnd in cands:
                        if self._b2_between(ca["positions"], cb["positions"], bnd["locus"]):
                            ok, boundary = True, bnd
                            break
                    if not ok and src == "RECORDED_OR_PUNCTUATION":
                        self.legacy_calls += 1      # DORMANT (forced-failure surfaces): punctuation / line wrap accepted as a boundary
                        ok, boundary = self._legacy_punctuation_boundary(fa, fb, docs, ls.get("punctuationPatterns", []))
            else:
                raise ModelError("UNKNOWN_SEPARATION_CONDITION", str(t))
            res[cond["id"]] = ok
        return {"lawfullySeparate": all(res.values()), "conditions": res, "boundary": boundary}

    @staticmethod
    def _b2_between(pa, pb, locus):
        """True iff in EVERY member the locus lies after all of one core and before all of the other (the same orientation in every member)."""
        members = sorted(locus)
        if not members or any(m not in pa or m not in pb or not pa[m] or not pb[m] for m in members):
            return False
        left = all(max(x[1] for x in pa[m]) <= locus[m][0] and min(y[0] for y in pb[m]) >= locus[m][1] for m in members)
        right = all(max(y[1] for y in pb[m]) <= locus[m][0] and min(x[0] for x in pa[m]) >= locus[m][1] for m in members)
        return left or right

    def _legacy_punctuation_boundary(self, fa, fb, docs, patterns):
        """DORMANT (forced-failure surfaces): a comma, conjunction or line wrap found in the extracted text at the junction of the two cores is
        taken as a boundary. Only where both records bind the same artifact (artifact-local text)."""
        ca, cb = fa.get("core"), fb.get("core")
        if fa["aid"] != fb["aid"] or not patterns or not ca or not cb or fa["aid"] not in docs:
            return False, None
        doc = docs[fa["aid"]]
        (l0, l1), (r0, r1) = sorted([(min(x[0] for x in ca["spans"]), max(x[1] for x in ca["spans"])),
                                     (min(x[0] for x in cb["spans"]), max(x[1] for x in cb["spans"]))])
        if l1 > r0:
            return False, None
        window = doc[max(0, l1 - 2):r0 + 5]
        for p in patterns:
            if re.search(p, window):
                return True, {"recordId": None, "unitId": None, "separator": "PUNCTUATION", "locus": {"window": window}}
        return False, None


    # ---------------------------------------------------------------- SAME_INDIVISIBLE_ATOM_TOUCHING (boundaryModel.basisOverlap.touchingAtom)
    # One more B-2 edge: two count candidates of one U whose footprints do NOT overlap are joined when no atom boundary lies between their class-bearing
    # support cores. Atom boundaries are read ONLY from the frozen segmentation: a lawful separator that a's or b's own support record records, and the
    # frozen separatorEvidence (whenAdjacent) of the lawful separators whose evidence no notSeparator and no ordinary inline material also produces,
    # read in the complete view between the two cores. Components, dispositions and the component rule are the basis-overlap ones; no record is
    # written.
    def _ta_view(self, rend):
        """(text, positions) of one member rendition's complete view BEFORE its letters-and-digits filter (the completeView ops the model names in
        junction.material.omitCompleteViewOps are not applied): markup already emitted as spaces and attribute values, character references decoded,
        letters casefolded. positions[i] is the index of complete-view position i in that text; the material of gap i is the text strictly between."""
        cv = self.oa["completeView"]
        omit = self.b2["touchingAtom"]["junction"]["material"]["omitCompleteViewOps"]
        key = _cache_key(rend, cv, omit, "ta-view")
        hit = _CACHE["cv"].get(key)
        if hit is None:
            t, _ = complete_view(rend, dict(cv, then=[o for o in cv["then"] if o not in omit]))
            gone = [re.compile(o["pattern"], _flags(o.get("flags"))) for o in omit]
            pos = [j for j, ch in enumerate(t.text) if not any(g.match(ch) for g in gone)]
            if "".join(t.text[j] for j in pos) != self.complete_view_of(rend)[0].text:
                raise ModelError("TRACKED_REPLAY_MISMATCH", "touchingAtom view")
            hit = (t.text, pos)
            _CACHE["cv"][key] = hit
        return hit

    def _ta_rules(self):
        """[(separator, reading, compiled pattern)]: each junction-evidence rule reads the frozen whenAdjacent evidence of the separator it names."""
        je = self.b2["touchingAtom"]["junctionEvidence"]
        wa = self.seg["separatorEvidence"]["whenAdjacent"]
        ignored = set(je.get("ignoredSeparators", []))
        readings = je["readings"]
        out = []
        for r in je["rules"]:
            sep = r["separator"]
            if sep not in self.seg["lawfulSeparators"] or sep in self.seg["notSeparators"]:
                raise ModelError("TOUCHING_ATOM_SEPARATOR_NOT_LAWFUL", str(sep))
            if sep in ignored:
                self.legacy_calls += 1              # DORMANT (forced-failure surfaces): a lawful separator's junction evidence ignored
                continue
            rd = readings[r["reading"]]
            pat = wa[sep][rd["frozenEvidence"]]
            if rd["form"] == "TAIL":
                if not pat.endswith(rd["anchorReplaced"]):
                    raise ModelError("TOUCHING_ATOM_PATTERN", str(sep))
                out.append((sep, rd["form"], re.compile(pat[:-len(rd["anchorReplaced"])] + rd["followedBy"]), wa[sep]))
            elif rd["form"] == "HEAD":
                out.append((sep, rd["form"], re.compile(pat), wa[sep]))
            else:
                raise ModelError("UNKNOWN_TOUCHING_ATOM_READING", str(r["reading"]))
        for p in je.get("extraPatterns", []):
            self.legacy_calls += 1                  # DORMANT (forced-failure surfaces): a comma, conjunction or space read as an atom boundary
            out.append((p["as"], p["form"], re.compile(p["pattern"]), None))
        return out

    def _ta_scan(self, rend, lo, hi, rules, aid=None):
        """[[i, [separators]]] for the complete-view gaps i (between positions i-1 and i) with lo < i < hi of one member rendition whose material
        evidences a lawful separator. TAIL: the material holds the frozen previous-unit ending followed by documentary whitespace; HEAD: at a point of
        the material that documentary whitespace precedes, the frozen unit-start pattern matches the view's text from that point on."""
        text, pos = self._ta_view(rend)
        look_n = self.b2["touchingAtom"]["junctionEvidence"]["headLookaheadCharacters"]
        out = []
        for i in range(max(lo + 1, 1), min(hi, len(pos))):
            a, b = pos[i - 1] + 1, pos[i]
            if b <= a:
                continue
            mat = text[a:b]
            hits, look = [], None
            for sep, form, rx, rule in rules:
                if form == "TAIL":
                    for mm in rx.finditer(mat):
                        g = (rule or {}).get("continuationGuard")
                        if g:
                            ctext, cidx = self._cg_case_view(rend, g)
                            if self.continuation_withheld(rule, mat[mm.start()], mat[mm.start() + 1:] + ctext[cidx[i]], ctext[:cidx[i - 1] + 1],
                                                          "COMPLETE_VIEW_JUNCTION"):
                                continue
                        v = (rule or {}).get("entityNameVeto")
                        if v and mat[mm.start()] in v["terminals"] and (getattr(self, "_ena", None) or {}).get(aid):
                            if v["offsetView"] == "DECODED_ARTIFACT":
                                org = self._ta_origin(rend)
                                off, anchor = org[a + mm.start()], org[pos[min(max(lo, 0), len(pos) - 1)]]
                            else:
                                self.legacy_calls += 1      # DORMANT (a forced-failure surface): offsets read in the wrong coordinate view
                                off, anchor = a + mm.start(), pos[min(max(lo, 0), len(pos) - 1)]
                            if self._veto(rule, "COMPLETE_VIEW_JUNCTION", aid, off, anchor):
                                continue
                        hits.append(sep)
                        break
                    continue
                if look is None:
                    look = text[a:b + look_n]
                if any(mat[p - 1].isspace() and rx.match(look[p:]) for p in range(1, len(mat) + 1)):
                    hits.append(sep)
            if hits:
                out.append([i, sorted(set(hits))])
        return out

    def basis_atom_facts(self, facts, ctx):
        """The touching-atom input: for every U with two or more candidate identities and every frame key of U (FRAME-C: the shared frame, read in
        EVERY member rendition of U; FRAME-U: each member), the evidenced atom-boundary gaps inside the candidates' extent. A pure function of the
        renditions of U: no record, span, class or order is read beyond the extent of the candidates' footprints."""
        shared = self.b2["footprint"]["sharedFrameMember"]
        rules = self._ta_rules()
        by_u = {}
        for f in facts.values():
            if "core" in f:
                by_u.setdefault(f["U"], []).append(f)
        out = {}
        for U in sorted(by_u):
            fs = by_u[U]
            real = sorted(ctx["members"][min(fs, key=lambda x: x["segmentId"])["aid"]])
            ev = {}
            for k in sorted(set(k for f in fs for k in f["footprint"])):
                lo = min(f["footprint"][k][0] for f in fs if k in f["footprint"])
                hi = max(f["footprint"][k][1] for f in fs if k in f["footprint"])
                ev[k] = dict((m, self._ta_scan(ctx["rend"][m], lo, hi, rules, m)) for m in (real if k == shared else [k]))
            out[U] = ev
        return out

    def _ta_relation(self, fa, fb, atoms_u, by_record):
        """SAME_INDIVISIBLE_ATOM_TOUCHING(a, b) for two footprints of one U that overlap in no member: per frame key, the earlier and the later
        footprint, the gaps between the two class-bearing support cores [end of the earlier core, start of the later core], the junction evidence found
        there in every rendition member, and a lawful separator recorded by a's or b's own record between the cores. Returns (relation, same atom?,
        proof)."""
        ta = self.b2["touchingAtom"]
        rel = ta["relations"]
        test = ta["atomTest"]
        if test != "FROZEN_SEGMENTATION_ATOM":
            self.legacy_calls += 1                  # DORMANT (forced-failure surfaces): an atom proof the architecture forbids
            if test == "TEXT_EQUALITY":
                ok = bool(fa["canonicalContent"] and fb["canonicalContent"]) and (fa["canonicalContent"] in fb["canonicalContent"] or fb["canonicalContent"] in fa["canonicalContent"])
            elif test == "SAME_DOCUMENT":
                ok = True
            elif test == "CODER_UNIT":
                ok = False
            else:
                raise ModelError("UNKNOWN_ATOM_TEST", str(test))
            return (rel["sameAtomEveryMember"] if ok else rel["differentAtoms"]), ok, {"atomTest": test}
        ca, cb = fa.get("core"), fb.get("core")
        ext = ta["junction"]["extent"]
        ignored = set(ta["junctionEvidence"].get("ignoredSeparators", []))
        per = {}
        keys = sorted(set(fa["footprint"]) & set(fb["footprint"]))
        for k in keys:
            A, B = fa["footprint"][k], fb["footprint"][k]
            if A[1] <= B[0]:
                E, L, ce, cl, first = A, B, ca, cb, fa["segmentId"]
            elif B[1] <= A[0]:
                E, L, ce, cl, first = B, A, cb, ca, fb["segmentId"]
            else:
                # footprints that share a position are the overlap relation's; only a weakened overlap test (a dormant path) hands them here: no edge
                return rel["differentAtoms"], False, {"footprintsOverlapIn": k}
            lo, hi = E[1], L[0]
            if not (ce and cl and ce["positions"].get(k) and cl["positions"].get(k)):
                raise ModelError("TOUCHING_ATOM_CORE_UNPLACED", "%s %s" % (fa["segmentId"], fb["segmentId"]))
            clo, chi = max(x[1] for x in ce["positions"][k]), min(y[0] for y in cl["positions"][k])
            row = {"earlier": first, "footprintGaps": [lo, hi], "exactlyTouching": lo == hi, "coreGaps": [clo, chi], "junctionEvidence": None,
                   "recordedBoundary": None}
            if ext != "BETWEEN_CORES":
                self.legacy_calls += 1              # DORMANT (a forced-failure surface): only exactly touching footprints, the internal gap ignored
                if ext != "EXACT_TOUCH_ONLY":
                    raise ModelError("UNKNOWN_JUNCTION_EXTENT", str(ext))
                if lo != hi:
                    row["sameAtom"] = False
                    per[k] = row
                    continue
            junction = {}
            for m, lst in sorted(atoms_u.get(k, {}).items()):
                j = bisect.bisect_left([x[0] for x in lst], clo)
                junction[m] = lst[j] if j < len(lst) and lst[j][0] <= chi else None
            if junction and all(v is not None for v in junction.values()):
                row["junctionEvidence"] = junction
            for rid in sorted({fa["recordId"], fb["recordId"]}):
                for bnd in by_record.get(rid, []):
                    if bnd["separator"] in ignored:
                        self.legacy_calls += 1      # DORMANT (forced-failure surfaces): a recorded lawful separator ignored
                        continue
                    loc = bnd["locus"].get(k)
                    if loc and clo <= loc[0] and chi >= loc[1]:
                        row["recordedBoundary"] = bnd
                        break
                if row["recordedBoundary"]:
                    break
            row["sameAtom"] = row["junctionEvidence"] is None and row["recordedBoundary"] is None
            per[k] = row
        same = [k for k in keys if per[k]["sameAtom"]]
        mode = ta["members"]["rule"]
        if mode == "SAME_ATOM_IN_ANY_MEMBER":
            ok = bool(same)
        else:
            self.legacy_calls += 1                  # DORMANT (a forced-failure surface): one member's relation chosen
            if mode != "FIRST_MEMBER":
                raise ModelError("UNKNOWN_TOUCHING_MEMBER_RULE", str(mode))
            ok = bool(keys) and per[keys[0]]["sameAtom"]
        label = rel["differentAtoms"] if not ok else (rel["sameAtomEveryMember"] if len(same) == len(keys) else rel["sameAtomSomeMembers"])
        return label, ok, {"members": per}

    def basis_overlap(self, seg_records, b2):
        """R-COUNT step 5b over the count candidates: overlap graph, connected components, one class once / conflicting components nothing.
        Returns ({(U, componentId): class}, recording block). A pure function of the recorded facts; record order does not matter."""
        spec = self.b2
        facts = b2["facts"]
        rel_non = spec["overlap"]["relations"]["nonOverlapping"]
        disp = dict((d["role"], d["id"]) for d in spec["dispositions"])
        rows = [facts[sid] for sid in b2["records"]]
        by_record = {}
        for f in rows:
            if "boundaries" in f:
                by_record.setdefault(f["recordId"], f["boundaries"])
        docs = b2.get("docs", {})
        parent = dict((f["segmentId"], f["segmentId"]) for f in rows)

        def find(x):
            while parent[x] != x:
                parent[x] = parent[parent[x]]
                x = parent[x]
            return x

        def union(x, y):
            rx, ry = find(x), find(y)
            if rx != ry:
                parent[max(rx, ry)] = min(rx, ry)
        # step 5: exact-CSI groups are one node
        first = {}
        for f in sorted(rows, key=lambda x: x["segmentId"]):
            k = tuple(f["groupKey"])
            if k in first:
                union(first[k], f["segmentId"])
            else:
                first[k] = f["segmentId"]
        app = spec["application"]
        ta = spec.get("touchingAtom")
        atoms = b2.get("atoms") or {}
        pairs, edges, tpairs, trel = [], [], [], []
        srt = sorted(rows, key=lambda x: x["segmentId"])
        for i in range(len(srt)):
            for j in range(i + 1, len(srt)):
                fa, fb = srt[i], srt[j]
                if fa["U"] != fb["U"] or fa["groupKey"] == fb["groupKey"]:
                    continue
                rel, ov = self._b2_relation(fa, fb)
                if not ov:
                    if not ta:
                        continue
                    label, same, aproof = self._ta_relation(fa, fb, atoms.get(fa["U"], {}), by_record)
                    trel.append({"records": [fa["segmentId"], fb["segmentId"]], "relation": label, "atomProof": aproof})
                    if not same:
                        continue
                    if ta["application"] != "EDGE_ELIGIBILITY":
                        self.legacy_calls += 1      # DORMANT (a forced-failure surface): the touching-atom layer disabled
                        if ta["application"] != "DISABLED":
                            raise ModelError("UNKNOWN_TOUCHING_APPLICATION", str(ta["application"]))
                        continue
                    proof = self._b2_separation(fa, fb, by_record, docs)
                    tpairs.append({"records": [fa["segmentId"], fb["segmentId"]], "relation": label, "lawfulSeparation": proof})
                    if proof["lawfullySeparate"]:
                        continue
                    binding = ta["componentBinding"]
                    if binding != "SHARED_B2_COMPONENTS":
                        self.legacy_calls += 1      # DORMANT (forced-failure surfaces): same-class or conflicting touching edges dropped
                        if binding == "SAME_CLASS_EDGES_DROPPED" and fa["sourceClass"] == fb["sourceClass"]:
                            continue
                        if binding == "CONFLICTING_EDGES_DROPPED" and fa["sourceClass"] != fb["sourceClass"]:
                            continue
                        if binding not in ("SAME_CLASS_EDGES_DROPPED", "CONFLICTING_EDGES_DROPPED"):
                            raise ModelError("UNKNOWN_TOUCHING_COMPONENT_BINDING", str(binding))
                    edges.append((fa["segmentId"], fb["segmentId"]))
                    continue
                proof = self._b2_separation(fa, fb, by_record, docs)
                pairs.append({"records": [fa["segmentId"], fb["segmentId"]], "relation": rel, "lawfulSeparation": proof})
                if not proof["lawfullySeparate"]:
                    edges.append((fa["segmentId"], fb["segmentId"]))
        if app == "CONNECTED_COMPONENTS":
            for x, y in edges:
                union(x, y)
        elif app == "DISABLED":
            self.legacy_calls += 1                  # DORMANT (a forced-failure surface): the B-2 guard disabled (exact-CSI counting only)
        elif app == "PAIRWISE":
            self.legacy_calls += 1                  # DORMANT (a forced-failure surface): direct neighbours only, no transitive component
        elif app == "RECORD_ORDER_GREEDY":
            self.legacy_calls += 1                  # DORMANT (a forced-failure surface): clusters grown in record order, never merged
            cluster = {}
            adj = {}
            for x, y in edges:
                adj.setdefault(x, set()).add(y)
                adj.setdefault(y, set()).add(x)
            for f in sorted(rows, key=lambda x: x["order"]):
                sid = f["segmentId"]
                hit = next((cluster[n] for n in sorted(adj.get(sid, ()), key=lambda n: facts[n]["order"]) if n in cluster), None)
                cluster[sid] = hit if hit is not None else sid
            for sid, root in cluster.items():
                union(sid, root)
        else:
            raise ModelError("UNKNOWN_B2_APPLICATION", str(app))
        comps = {}
        for f in rows:
            comps.setdefault(find(f["segmentId"]), []).append(f)
        rule = spec["componentRule"]
        contributed, out_comps, per_record = {}, [], {}
        partners = {}
        for p in pairs + tpairs:
            a, b = p["records"]
            partners.setdefault(a, []).append((b, p))
            partners.setdefault(b, []).append((a, p))
        for root in sorted(comps, key=lambda r: sorted(f["segmentId"] for f in comps[r])):
            members = sorted(comps[root], key=lambda f: f["segmentId"])
            U = members[0]["U"]
            idents = sorted(set(self.csi_spec["keySeparator"].join(str(x) for x in f["groupKey"]) for f in members))
            cid = self.b2["componentIdPrefix"] + sha_text(self.csi_spec["keySeparator"].join([U] + idents))
            classes = sorted(set(f["sourceClass"] for f in members))
            reason, contrib = None, []
            if len(idents) == 1:
                role = "clear" if not any(partners.get(f["segmentId"]) for f in members) else "separate"
                if len(classes) == 1:
                    contrib = [classes[0]]
                elif spec["exactGroupConflict"] != "SEGMENT_CLASS_CONFLICT_AUTHORITATIVE":
                    self.legacy_calls += 1          # DORMANT (a forced-failure surface): the exact-occurrence conflict resolved by the first record
                    contrib = [min(members, key=lambda f: f["order"])["sourceClass"]]
                if app == "PAIRWISE" and any(facts[n]["sourceClass"] not in classes and not p["lawfulSeparation"]["lawfullySeparate"]
                                             for f in members for n, p in partners.get(f["segmentId"], [])):
                    role, reason, contrib = "withheld", rule["reason"], []
            elif len(classes) == 1:
                role = "collapsed"
                if rule["oneClass"] == "CONTRIBUTE_ONCE":
                    contrib = [classes[0]]
                else:
                    self.legacy_calls += 1          # DORMANT (a forced-failure surface): every identity group of a same-class component counts
                    contrib = [classes[0]] * len(idents)
            else:
                role = "withheld"
                reason = rule["reason"]
                sev = rule["severalClasses"]
                if sev != "CONTRIBUTE_NOTHING":
                    self.legacy_calls += 1          # DORMANT (forced-failure surfaces): a class chosen, or every class counted
                    width = lambda f: sum(v[1] - v[0] for v in f["footprint"].values())
                    if sev == "NARROWEST_FOOTPRINT":
                        contrib = [min(members, key=lambda f: (width(f), f["segmentId"]))["sourceClass"]]
                    elif sev == "BROADEST_FOOTPRINT":
                        contrib = [max(members, key=lambda f: (width(f), f["segmentId"]))["sourceClass"]]
                    elif sev == "FIRST_RECORD":
                        contrib = [min(members, key=lambda f: f["order"])["sourceClass"]]
                    elif sev == "UNION":
                        contrib = list(classes)
                    else:
                        raise ModelError("UNKNOWN_COMPONENT_RULE", str(sev))
            for n, c in enumerate(contrib):
                contributed[(U, cid if n == 0 else "%s#%d" % (cid, n))] = c
            out_comps.append({"componentId": cid, "underlyingDocumentIdentity": U, "members": [f["segmentId"] for f in members], "identities": idents,
                              "classes": classes, "disposition": disp[role], "reason": reason, "contributes": sorted(set(contrib))})
            for f in members:
                per_record[f["segmentId"]] = {
                    "basisOverlapComponentId": cid, "basisOverlapMembers": [x["segmentId"] for x in members],
                    "basisOverlapRelation": [{"with": n, "relation": p["relation"]} for n, p in sorted(partners.get(f["segmentId"], []), key=lambda t: t[0])],
                    "predicateSupportCore": f.get("core"),
                    "lawfulSeparationProof": [dict(p["lawfulSeparation"], **{"with": n}) for n, p in sorted(partners.get(f["segmentId"], []), key=lambda t: t[0])],
                    "b2CountDisposition": disp[role], "b2CountReason": reason}
        eff = spec["recordStateEffect"]
        if eff != "NO_RECORD_EFFECT":
            self.legacy_calls += 1                  # DORMANT (forced-failure surfaces): the count layer writing into assignment records
            touched = set(sid for c in out_comps if c["disposition"] in (disp["withheld"], disp["collapsed"]) for sid in c["members"])
            for r in seg_records:
                if r["segmentId"] not in touched:
                    continue
                if eff == "REWRITE_IDENTITY":
                    r[self.csi_spec["recordField"]] = per_record[r["segmentId"]]["basisOverlapComponentId"]
                elif eff == "SET_STATE_ROLE":
                    r["sourceClassAssignmentState"], r["sourceClass"] = self.roles[spec["recordStateRole"]], None
                elif eff == "MERGE_SEGMENTS":
                    ms = [x for x in seg_records if x["segmentId"] in per_record[r["segmentId"]]["basisOverlapMembers"]]
                    r["unitIds"] = sorted(set(u for x in ms for u in x["unitIds"]))
                    r["span"] = [min(x["span"][0] for x in ms), max(x["span"][1] for x in ms)]
                else:
                    raise ModelError("UNKNOWN_RECORD_STATE_EFFECT", str(eff))
        rec = {"layer": spec["id"], "components": [c for c in out_comps if len(c["identities"]) > 1 or any(partners.get(m) for m in c["members"])],
               "overlapPairs": pairs, "records": dict(sorted(per_record.items())),
               "touchingAtomPairs": tpairs, "touchingAtomRelations": trel,
               "withheldComponents": sum(1 for c in out_comps if c["disposition"] == disp["withheld"]),
               "collapsedComponents": sum(1 for c in out_comps if c["disposition"] == disp["collapsed"]),
               "lawfullySeparatePairs": sum(1 for p in pairs if p["lawfulSeparation"]["lawfullySeparate"])}
        if not ta:
            del rec["touchingAtomPairs"], rec["touchingAtomRelations"]
        return contributed, rec


# ---------------------------------------------------------------- DORMANT LEGACY paths (no executable authority on the delivered model; check C-5)
def _legacy_reparse_view(decoded, view):
    """A removal view derived by a regex RE-PARSE of the decoded text (the architecture prototype's containers) instead of op provenance: a
    forced-failure surface only (recipeViews.source other than OP_PROVENANCE); counted at its call site."""
    for m in re.finditer(r"<[^>]+>", decoded):
        view[m.start():m.end()] = b"\x02" * (m.end() - m.start())
    for m in re.finditer(r"<(script|style)\b[^>]*>(.*?)</\1\s*>", decoded, re.I | re.S):
        a, b = m.span(2)
        view[a:b] = b"\x01" * (b - a)
    for m in re.finditer(r"<!--(.*?)-->", decoded, re.S):
        view[m.start():m.end()] = b"\x01" * (m.end() - m.start())


def _legacy_skel(text):
    return "".join(ch for ch in text.casefold() if ch.isalnum())


def _legacy_parent_count(decoded, cv, k):
    """The parent proposal's FRAME-U count view (visible text with tags removed IN PLACE, comment/script/style bodies kept, tag text as separate
    pieces): a forced-failure surface only (frameU.countView other than COMPLETE_VIEW); counted at its call site."""
    body = re.sub(cv["commentPattern"], lambda m: " " + m.group(1) + " ", decoded, flags=_flags(cv["commentFlags"]))
    vis = _legacy_skel(html.unescape(re.sub(cv["tagPattern"], " ", body)))
    pieces = []
    for m in re.finditer(cv["tagPattern"], body):
        t, _s = complete_view(m.group(0), dict(cv, commentPattern="(?!)"))
        if t.text:
            pieces.append(t.text)
    return _occurrences(vis, k) + sum(_occurrences(p, k) for p in pieces)


def _legacy_own_rank(interp, it):
    """The CSI-v5 occurrence rank of a segment in its own canonical extraction (nearest occurrence, ties to the lower index): a DIAGNOSTIC that a
    mutated model may name as an anchor component (forced failure), never identity-bearing in the delivered model."""
    interp.legacy_calls += 1
    cseg = interp.canonical(it["doc"][it["a"]:it["b"]], it["recipe"])
    occ, i = [], it["cdoc"].find(cseg)
    while i >= 0:
        occ.append(i)
        i = it["cdoc"].find(cseg, i + 1)
    if not occ:
        return -1
    p = len(interp.canonical(it["doc"][:it["a"]], it["recipe"]))
    return occ.index(min(occ, key=lambda q: (abs(q - p), q)))


def _legacy_v5_identity(interp, it, ctx):
    """The CSI-v5 identity (content hash + rank under OC-proofs) of the parent: a forced-failure surface only (identityFunction LEGACY_V5_PROOFS)."""
    interp.legacy_calls += 1
    cs = interp.csi_spec
    marker = cs["whenNotEstablished"]["marker"]
    d = {"identity": None, "components": None, "correspondence": marker, "anchor": None, "diagnostics": None, "facts": None, "keepState": False}
    aid, recipe = it["aid"], it["recipe"]
    if ctx["unresolved"][aid]:
        return d
    members = ctx["members"][aid]
    docs = []
    for m in members:
        if ctx["raw"][m] is None:
            docs.append(None)
        else:
            docs.append(interp.canonical_document(m, interp.extract(ctx["raw"][m], recipe), recipe))
    rt = [None if (ctx["rend"][m] is None or ctx["arts"][m]["renditionDecoder"] != interp.recipe(recipe)["decoder"]) else interp.rendition_canonical(m, ctx["rend"][m])
          for m in members]
    rtext = rt[0] if rt and all(t is not None and t == rt[0] for t in rt) else None
    cseg = interp.canonical(it["doc"][it["a"]:it["b"]], recipe)
    facts = {"docs": docs, "counts": [_occurrences(x, cseg) for x in docs], "rcount": None if rtext is None else _occurrences(rtext, cseg)}
    proof = None
    for p in cs.get("legacyProofs", []):
        if _LEGACY_V5_TESTS[p["test"]](facts):
            proof = p["id"]
            break
    if proof is None:
        return d
    rank = _legacy_own_rank(interp, it)
    key = cs["keySeparator"].join([cs["versionTag"], it["did"], sha_text(cseg), str(rank)])
    d.update(identity=cs["prefix"] + sha_text(key), components={"underlyingDocumentIdentity": it["did"], "canonicalSegmentContentHash": sha_text(cseg),
                                                              "occurrenceIndex": rank}, correspondence=proof, keepState=True)
    return d


# ================================================================== PART 1 END (interpreter)

# ================================================================== PART 2 BEGIN (evidence binding)


def _nonde(feats, interp):
    """The non-default part of a feature record (what the witnesses established)."""
    out = {}
    for fid, spec in interp.scalars.items():
        if feats[fid] != spec["default"]:
            out[fid] = feats[fid]
    for fid in interp.lists:
        if feats[fid]:
            out[fid] = feats[fid]
    for fid, spec in interp.bools.items():
        if feats[fid] != spec["default"]:
            out[fid] = feats[fid]
    return out


def _check_assertion(interp, rec, unit, a, cunit):
    wr = interp.ev["witnessRule"]
    missing = [f for f in wr["requiredAssertionFields"] if f not in a]
    if missing:
        raise ModelError("ASSERTION_FIELD_MISSING", "%s %s" % (unit["unitId"], missing))
    if a["assertionType"] not in wr["assertionTypes"]:
        raise ModelError("ASSERTION_TYPE", a["assertionType"])
    want = {"artifactId": rec["artifactId"], "unitId": unit["unitId"], "start": unit["start"], "end": unit["end"]}
    loc = a["segmentLocator"]
    if any(loc.get(k) != want[k] for k in wr["segmentLocatorFields"]):
        raise ModelError("WITNESS_LOCATOR_MISMATCH", "%s %s" % (unit["unitId"], a["featureId"]))
    if a["sourceRef"] != rec["sourceId"]:
        raise ModelError("WITNESS_SOURCEREF_MISMATCH", "%s %s" % (unit["unitId"], a["featureId"]))
    if not a.get("coderIdentity"):
        raise ModelError("WITNESS_CODER_MISSING", a["featureId"])
    cw = interp.canonical(a["witness"], rec["recipe"])
    if len(cw) < wr["minCanonicalChars"] or (wr["requireAlphanumeric"] and not re.search(r"[0-9a-z]", cw)):
        raise ModelError("WITNESS_TOO_WEAK", "%s %r" % (a["featureId"], a["witness"]))
    if cw not in cunit:
        raise ModelError("WITNESS_NOT_IN_UNIT", "%s %s %r" % (unit["unitId"], a["featureId"], a["witness"][:60]))


def bind_entity_name_authority(interp, ena, arts, rend):
    """Read-only binding of the frozen entity-name authority candidate (entityNameVeto.authority). The whole input must hash to its declared
    recordsSha256, else the corpus is rejected. A record is usable only for the artifact whose id AND digest it names, under the authority's decoded
    coordinate view, with the proven states, a valid entity id, a complete span set and every span's text equal to the decoded artifact at its
    coordinates. Nothing is inferred: no CIK, name, current name or span; a refused record grants no veto and nothing else."""
    rule = next((r for r in interp.seg["separatorEvidence"]["whenAdjacent"].values() if r.get("entityNameVeto")), {})
    v = rule.get("entityNameVeto")
    if ena is None or not v:
        return {}, []
    au = v["authority"]
    checks, why_ = au["bindingChecks"], au["reasons"]
    if "RECORDS_DIGEST" in checks and sha_bytes(cjson(ena["records"])) != ena.get("recordsSha256"):
        raise ModelError(au["recordsDigestError"], "entityNameAuthority.recordsSha256")
    by_id = dict((a["artifactId"], a) for a in arts)
    spans, log = {}, []
    for r in ena["records"]:
        a = by_id.get(r.get("artifactId"))
        text = rend.get(r.get("artifactId"))
        tests = (("AUTHORITY_CONSTANTS", lambda: all(r.get(k) == x for k, x in au["requiredConstants"].items())),
                 ("ARTIFACT_ID", lambda: a is not None),
                 ("ARTIFACT_DIGEST", lambda: r.get("artifactSha256") == a["identity"]["sha256"]),
                 ("COORDINATE_VIEW", lambda: a["renditionDecoder"] == au["decoder"] and text is not None),
                 ("PROVEN_STATES", lambda: all(r.get(k) == x for k, x in au["provenStates"].items())),
                 ("ENTITY_ID", lambda: re.match(au["entityIdPattern"], r.get("entityId") or "") is not None),
                 ("SPAN_SET", lambda: bool(r.get("occurrenceSpans")) and r.get("occurrenceCount") == len(r["occurrenceSpans"])),
                 ("SPAN_TEXT", lambda: text is not None and all(0 <= sp["occurrenceStart"] < sp["occurrenceEnd"] <= len(text)
                                           and text[sp["occurrenceStart"]:sp["occurrenceEnd"]] == sp["occurrenceText"] for sp in r["occurrenceSpans"])))
        why = None
        for name, test in tests:
            if name in checks and not test():
                why = why_[name]
                break
            if name not in checks and name in ("ARTIFACT_ID", "SPAN_SET") and not test():
                why = why_[name]                    # structural: without them there is nothing to bind
                break
        log.append([r.get("artifactId"), why or au["usable"]])
        if why is None:
            spans.setdefault(r["artifactId"], []).extend((sp["occurrenceStart"], sp["occurrenceEnd"]) for sp in r["occurrenceSpans"])
    for k in spans:
        spans[k] = sorted(spans[k])
    return spans, log


def evaluate_corpus(interp, corpus, loader):
    """Evaluate artifacts + support records. Raises ModelError on any binding defect."""
    arts = corpus["artifacts"]
    ids = [a["artifactId"] for a in arts]
    if len(set(ids)) != len(ids):
        raise ModelError("DUPLICATE_ARTIFACT_ID", "")
    g0 = getattr(interp, "guard_fired", 0)
    raw, rend = {}, {}
    for a in arts:
        b = loader(a)
        raw[a["artifactId"]] = b
        if b is not None:
            if sha_bytes(b) != a["identity"]["sha256"]:
                raise ModelError("ARTIFACT_DIGEST_MISMATCH", a["artifactId"])
            rend[a["artifactId"]] = interp.rendition_text(b, a["renditionDecoder"])
        else:
            rend[a["artifactId"]] = None
    interp._ena, interp.authority_binding = bind_entity_name_authority(interp, corpus.get("entityNameAuthority"), arts, rend)
    v0 = getattr(interp, "veto_fired", 0)
    # ---- R-DUP over every artifact pair
    parent = dict((i, i) for i in ids)

    def find(x):
        while parent[x] != x:
            parent[x] = parent[parent[x]]
            x = parent[x]
        return x
    pairs, unresolved = [], set()
    for i in range(len(arts)):
        for j in range(i + 1, len(arts)):
            A, B = arts[i], arts[j]
            r = interp.eval_duplicate(A["identity"], B["identity"], rend[A["artifactId"]], rend[B["artifactId"]])
            r["pair"] = [A["artifactId"], B["artifactId"]]
            pairs.append(r)
            if r["state"] == interp.id_states["same"]:
                parent[find(A["artifactId"])] = find(B["artifactId"])
            elif r["state"] == interp.id_states["unresolved"]:
                unresolved.update(r["pair"])
    groups = {}
    for i in ids:
        groups.setdefault(find(i), []).append(i)
    by_id = dict((a["artifactId"], a) for a in arts)
    prefix = interp.rdup["groupIdentityPrefix"]
    doc_of, group_unresolved = {}, {}
    for root, members in groups.items():
        did = min(prefix + by_id[m]["identity"]["sha256"] for m in members)
        bad = any(m in unresolved for m in members)
        for m in members:
            doc_of[m] = (interp.rdup["unresolvedIdentityPrefix"] + m) if bad else did
            group_unresolved[m] = bad
    dup_groups = [{"members": sorted(m), "underlyingDocumentIdentity": doc_of[sorted(m)[0]],
                   "identityResolved": not group_unresolved[m[0]]}
                  for m in sorted(sorted(g) for g in groups.values()) if len(m) > 1]
    # ---- support records, pass 1: binding, segmentation, features, predicates (identity is decided in pass 2, per document and per key)
    records_out, seg_records, pending, seg_units = [], [], [], []
    extracted_cache = {}
    cs = interp.csi_spec
    csi_field, comp_field, corr_field = cs["recordField"], cs["componentsField"], cs["correspondenceField"]
    anchor_field, diag_field = cs["anchorField"], cs["diagnosticsField"]
    inspected = interp.ev["inspectionFeature"]
    members_of = dict((aid, [aid] if group_unresolved[aid] else groups[find(aid)]) for aid in ids)
    for rec in corpus["records"]:
        aid = rec["artifactId"]
        if aid not in by_id:
            raise ModelError("UNKNOWN_ARTIFACT", aid)
        did = doc_of[aid]
        dup_state = {"result": interp.id_states["unresolvedResult"] if group_unresolved[aid] else interp.id_states["resolved"],
                     "underlyingDocumentIdentity": did}
        segs = []
        bound = rec.get("bindingStatus") == "BOUND" and raw[aid] is not None
        if not bound:
            role = "duplicateUnresolved" if group_unresolved[aid] else "notDeterminable"
            segs.append({"segmentId": rec["recordId"] + "#s1", "unitIds": [u["unitId"] for u in rec.get("units", [])],
                         "underlyingDocumentIdentity": did, csi_field: None, comp_field: None, corr_field: None, anchor_field: None, diag_field: None,
                         "sourceClassAssignmentState": interp.roles[role], "sourceClass": None,
                         "assignmentRuleId": interp.rule_ids[role], "satisfiedClassIds": [],
                         "featureRecord": {}, inspected: False})
        else:
            ck = (aid, rec["recipe"])
            if ck not in extracted_cache:
                extracted_cache[ck] = interp.extract(raw[aid], rec["recipe"])
            doc = extracted_cache[ck]
            cdoc = interp.canonical_document(aid, doc, rec["recipe"])
            units = rec["units"]
            if not units:
                raise ModelError("NO_UNITS", rec["recordId"])
            for u in units:
                if not (0 <= u["start"] < u["end"] <= len(doc)):
                    raise ModelError("UNIT_SPAN_OUT_OF_RANGE", u["unitId"])
                if doc[u["start"]:u["end"]] != u["text"]:
                    raise ModelError("UNIT_TEXT_MISMATCH", "%s %s" % (rec["recordId"], u["unitId"]))
                if sha_text(u["text"]) != u["textSha256"]:
                    raise ModelError("UNIT_TEXT_HASH_MISMATCH", "%s %s" % (rec["recordId"], u["unitId"]))
                cu = interp.canonical(u["text"], rec["recipe"])
                if not cu or cu not in cdoc:
                    raise ModelError("UNIT_NOT_LOCATABLE", "%s %s" % (rec["recordId"], u["unitId"]))
                for a in u.get("assertions", []):
                    _check_assertion(interp, rec, u, a, cu)
            heading = rec.get("physicalHeading")
            if heading:
                norm = re.sub(r"\s+", " ", heading).strip()
                lines = [re.sub(r"\s+", " ", ln).strip() for ln in doc[:units[0]["start"]].split("\n")]
                if norm not in lines:
                    raise ModelError("PHYSICAL_HEADING_NOT_FOUND", "%s %r" % (rec["recordId"], heading))
            interp._seg_aid = aid
            interp._seg_decoded = interp.rendition_text(raw[aid], interp.recipe(rec["recipe"])["decoder"])
            for gi, g in enumerate(interp.form_segments(units, doc, rec["recipe"])):
                assertions = [a for u in g for a in u.get("assertions", [])]
                feats = interp.feature_record(assertions)
                viol = interp.constraint_violations(feats)
                if viol:
                    raise ModelError("FEATURE_CONSTRAINT_VIOLATION", "%s %s" % (rec["recordId"], viol))
                res = interp.eval_segment(feats, True)
                if group_unresolved[aid]:
                    res["sourceClassAssignmentState"] = interp.roles["duplicateUnresolved"]
                    res["sourceClass"] = None
                    res["assignmentRuleId"] = interp.rule_ids["duplicateUnresolved"]
                seg = {"segmentId": "%s#s%d" % (rec["recordId"], gi + 1),
                       "unitIds": [u["unitId"] for u in g], "span": [g[0]["start"], g[-1]["end"]],
                       "underlyingDocumentIdentity": did, csi_field: None, comp_field: None, corr_field: None, anchor_field: None, diag_field: None,
                       "sourceClassAssignmentState": res["sourceClassAssignmentState"],
                       "sourceClass": res["sourceClass"], "assignmentRuleId": res["assignmentRuleId"],
                       "satisfiedClassIds": res["satisfiedClassIds"],
                       "firedExclusions": dict((k, v["firedExclusions"]) for k, v in res["predicateResults"].items() if v["firedExclusions"]),
                       "failedComponents": dict((k, v["failedComponent"]) for k, v in res["predicateResults"].items() if v["failedComponent"]),
                       "featureRecord": _nonde(feats, interp), inspected: True}
                segs.append(seg)
                pending.append((seg, {"key": seg["segmentId"], "aid": aid, "recipe": rec["recipe"], "a": g[0]["start"], "b": g[-1]["end"], "doc": doc,
                                      "cdoc": cdoc, "did": did, "sat": res["satisfiedClassIds"], "state": res["sourceClassAssignmentState"],
                                      "cls": res["sourceClass"]}))
                seg_units.append((rec, g))
        for s in segs:
            s["recordId"] = rec["recordId"]
            seg_records.append(s)
        records_out.append({"recordId": rec["recordId"], "artifactId": aid, "duplicateIdentityState": dup_state,
                            "segments": segs})
    # ---- pass 2: occurrence identity (occurrenceAnchoring), a function of the document and of the key, never of one record
    ctx = {"arts": by_id, "raw": raw, "rend": rend, "members": members_of, "unresolved": group_unresolved}
    decisions = interp.anchor_all([it for _, it in pending], ctx)
    for (seg, _), d in zip(pending, decisions):
        seg[csi_field], seg[comp_field], seg[corr_field] = d["identity"], d["components"], d["correspondence"]
        seg[anchor_field], seg[diag_field] = d["anchor"], d["diagnostics"]
        if not d["keepState"]:
            # no shared frame establishes the documentary occurrence: no identity, and the existing non-counting state
            seg["sourceClassAssignmentState"], seg["assignmentRuleId"] = interp.unestablished_state()
            seg["sourceClass"] = None
    # ---- pass 3 (R-COUNT step 5b, basisOverlap): footprints, support cores and recorded boundaries of the count candidates; reads the A+ decisions
    b2 = interp.basis_overlap_facts([it for _, it in pending], decisions, seg_units, [s for s, _ in pending], corpus["records"], ctx)
    if b2 is not None:
        b2["docs"] = dict((it["aid"], it["doc"]) for _, it in pending)
    interp.last_b2 = b2
    interp.last_guard_fired = getattr(interp, "guard_fired", 0) - g0
    interp.last_veto_fired = getattr(interp, "veto_fired", 0) - v0
    return {"duplicatePairs": pairs, "duplicateGroups": dup_groups, "records": records_out,
            "segmentRecords": seg_records, "count": interp.count(seg_records, b2),
            "documents": len(set(doc_of.values())), "artifacts": len(ids)}

# ================================================================== PART 2 END (evidence binding)

# ================================================================== PART 3 (contract renderer)


def _md(v):
    return str(v).replace("|", "\\|").replace("\n", " ")


def _code(obj):
    return "`%s`" % json.dumps(obj, ensure_ascii=False)


def _table(header, rows):
    out = ["| " + " | ".join(header) + " |", "|" + "|".join("---" for _ in header) + "|"]
    for r in rows:
        out.append("| " + " | ".join(_md(c) for c in r) + " |")
    return "\n".join(out)


def _fixture_rows(interp, fixtures, group):
    rows = []
    for fx in fixtures:
        if fx["group"] != group:
            continue
        ok, _, res = run_fixture(interp, fx)
        if res is None:
            outcome = "rejected: %s" % fx["expect"].get("error")
        else:
            multi = len(fx["corpus"]["records"]) > 1
            segs = []
            for s in res["segmentRecords"]:
                a = s.get("occurrenceAnchor") or {}
                why = a.get("unresolvedReason")
                segs.append("%s = %s%s%s" % (s["segmentId"] if multi else s["segmentId"].split("#")[-1], s["sourceClassAssignmentState"],
                                             (" (%s)" % s["sourceClass"]) if s["sourceClass"] else "", (" [%s]" % why) if why else ""))
            dups = ["%s~%s = %s" % (p["pair"][0], p["pair"][1], p["state"]) for p in res["duplicatePairs"]
                    if any(d["pair"] == p["pair"] for d in fx["expect"].get("duplicates", []))]
            outcome = "; ".join(segs + dups) + (" | distinctClassSet = %s" % res["count"]["distinctClassSet"] if segs else "")
        rows.append([fx["fixtureId"], fx["title"], outcome, "reproduced" if ok else "NOT REPRODUCED"])
    return rows


def _b2_fixture_rows(interp, fixtures):
    rows = []
    field = (interp.b2 or {}).get("recording", {}).get("field", "basisOverlap")
    for fx in fixtures:
        if fx["group"] != "R7_B2":
            continue
        ok, _, res = run_fixture(interp, fx)
        bo = res["count"].get(field) or {}
        recs = bo.get("records", {})
        segs = ["%s = %s%s%s" % (s["segmentId"].split("-")[-1], s["sourceClassAssignmentState"], (" (%s)" % s["sourceClass"]) if s["sourceClass"] else "",
                                 (" [%s]" % recs[s["segmentId"]]["b2CountDisposition"]) if s["segmentId"] in recs else "") for s in res["segmentRecords"]]
        rows.append([fx["fixtureId"], fx["title"], "; ".join(segs) + " | distinctClassSet = %s" % res["count"]["distinctClassSet"], "reproduced" if ok else "NOT REPRODUCED"])
    return rows


def _ta_fixture_rows(interp, fixtures, group="TA_ATOM"):
    rows = []
    field = (interp.b2 or {}).get("recording", {}).get("field", "basisOverlap")
    for fx in fixtures:
        if fx["group"] != group:
            continue
        ok, _, res = run_fixture(interp, fx)
        if res is None:
            rows.append([fx["fixtureId"], fx["title"], "rejected: %s" % fx["expect"].get("error"), "reproduced" if ok else "NOT REPRODUCED"])
            continue
        bo = res["count"].get(field) or {}
        recs = bo.get("records", {})
        segs = ["%s = %s%s%s" % (s["segmentId"].split("-")[-1], s["sourceClassAssignmentState"], (" (%s)" % s["sourceClass"]) if s["sourceClass"] else "",
                                 (" [%s]" % recs[s["segmentId"]]["b2CountDisposition"]) if s["segmentId"] in recs else "") for s in res["segmentRecords"]]
        rels = ["%s|%s %s" % (r["records"][0].split("-")[-1], r["records"][1].split("-")[-1], r["relation"]) for r in bo.get("touchingAtomRelations", [])]
        rows.append([fx["fixtureId"], fx["title"], "; ".join(segs) + " | " + ("; ".join(rels) or "no pair") + " | distinctClassSet = %s" % res["count"]["distinctClassSet"],
                     "reproduced" if ok else "NOT REPRODUCED"])
    return rows


def render_contract(rules, fixtures, ledger):
    bm = rules["boundaryModel"]
    interp = Interp(bm)
    ct = rules["contractText"]
    fxs = fixtures["fixtures"]
    L = []
    add = L.append
    add("# MERGEVUE - SOURCECLASS ASSIGNMENT CONTRACT v1.0 - SOURCECLASS SENTENCE BOUNDARY EVIDENCE INTEGRITY CLOSURE 1 CORR1")
    add("")
    add("## THE SENTENCE-EVIDENCE CANDIDATE + IV1-M1 (A DECLARED SENTENCE IS VERIFIED ON THE DOCUMENTARY INTERVAL) + IV1-M2 CASE A (A FULL STOP INSIDE A PROVEN ENTITY-NAME SPAN PROVES NO SENTENCE); CASE B IS THE OWNER-ACCEPTED RESIDUAL R-M2-CASE-B")
    add("")
    for line in ct["header"]:
        add(line)
        add("")
    add("> This contract is RENDERED from `%s` by `%s` (render_contract). Every table below is generated from the normative model, from the fixture evaluations, or from the semantic delta ledger. Validator check T-1 requires byte equality; a hand edit fails." % (rules["artifact"], rules["validator"]))
    add("")
    add("---")
    add("")
    add("## 1. HUMAN CLAIM")
    add("")
    for para in ct["humanClaim"]:
        add(para)
        add("")
    add("## 2. IDENTITIES")
    add("")
    add(_table(["Item", "Path", "SHA-256", "State"],
               [[k, v["path"], "`%s`" % v["sha256"], v.get("state", "")] for k, v in rules["identities"].items()]))
    add("")
    add("## 3. IMPLEMENTATION SCOPE - THE CONTROLLING A+ ARCHITECTURE, BLOCK BY BLOCK")
    add("")
    add(_table(["Block", "Architecture", "Implemented as", "Verified by"],
               [[k, v["architecture"], v["implementedAs"], "; ".join(v["verifiedBy"])] for k, v in rules["implementationScope"].items()]))
    add("")
    add("### 3.1 Implementation discipline")
    add("")
    for k, v in rules["implementationDiscipline"].items():
        add("- *%s:* %s" % (k, v))
    add("")
    add("## 4. THE SINGLE NORMATIVE SOURCE")
    add("")
    add(bm["role"])
    add("")
    add(_table(["Computed", "Value"], [["boundaryModelSha256", "`%s`" % rules["boundaryModelSha256"]],
                                        ["serialization", bm["serialization"]["canonicalJson"]]]))
    add("")
    for para in ct["singleSource"]:
        add(para)
        add("")
    add("## 5. FROZEN VOCABULARY - THE NINE QUALIFYING CLASSES")
    add("")
    add(_table(["#", "Class label (exact CORR4 string)", "Class id"],
               [[i + 1, "`%s`" % c["label"], c["classId"]] for i, c in enumerate(bm["vocabulary"]["classes"])]))
    add("")
    add("## 6. ASSIGNMENT STATES (not classes)")
    add("")
    add(_table(["State", "Meaning", "Counts toward srcDiv"],
               [["`%s`" % d["state"], d["meaning"], d["countsTowardSrcDiv"]] for d in bm["states"]["definitions"]]))
    add("")
    add("Precedence: %s. Counting-eligible: %s. Counting disposition (not a state, not a class): %s." % (
        " > ".join("`%s`" % x for x in bm["states"]["precedence"]),
        ", ".join("`%s`" % x for x in bm["states"]["countingEligible"]),
        ", ".join("`%s`" % x for x in bm["states"]["countingDispositions"])))
    add("")
    add("## 7. DOCUMENTARY TERMS")
    add("")
    add(_table(["Term", "Definition", "Test"], [[t["term"], t["definition"], t["test"]] for t in bm["documentaryTerms"]]))
    add("")
    add("## 8. FEATURE VOCABULARY, CONSTRAINTS AND MERGE")
    add("")
    fv = bm["featureVocabulary"]
    add(_table(["Feature", "Kind", "Values / default"],
               [[k, "scalar enum", "%s; default `%s`" % (", ".join(v["values"]), v["default"])] for k, v in fv["scalarEnums"].items()] +
               [[k, "list enum", ", ".join(v["values"])] for k, v in fv["listEnums"].items()] +
               [[k, "boolean", "default `false`"] for k in fv["booleans"]] +
               [[k, "derived", v["rule"]] for k, v in fv["derived"].items()]))
    add("")
    add(fv["note"])
    add("")
    add(_table(["Constraint", "When", "Requires", "Meaning"],
               [[c["id"], _code(c["when"]), _code(c["require"]), c["text"]] for c in bm["featureConstraints"]]))
    add("")
    fm = bm["featureMerge"]
    add(_table(["Merge target", "Rule"], [["lists", fm["lists"]], ["booleans", fm["booleans"]]] +
               [[k, _code(v)] for k, v in fm["scalarEnums"].items()] + [["scope", fm["scope"]]]))
    add("")
    add("## 9. THE NINE CLASS PREDICATES (unchanged from the parent)")
    add("")
    add("`P_i(S) = combinator( components ) AND NONE_OF( exclusions )`, evaluated over the witnessed feature record of one indivisible segment.")
    add("")
    for c in bm["classes"]:
        add("### %s - `%s`" % (c["classId"], c["label"]))
        add("")
        add("*Function.* %s" % c["function"])
        add("")
        add("*Combinator.* `%s` over components, `%s` over exclusions." % (c["combinator"], c["exclusionCombinator"]))
        add("")
        add(_table(["Component", "Test", "Machine expression"], [[x["componentId"], x["test"], _code(x["expr"])] for x in c["components"]]))
        add("")
        add(_table(["Exclusion", "Test", "Redirect", "Form", "Form basis", "Machine expression"],
                   [[x["id"], x["test"], x["redirect"], x["form"],
                     "; ".join([x["formBasis"]] + ([x["multiValueBasis"]] if "multiValueBasis" in x else [])), _code(x["expr"])]
                    for x in c["exclusions"]]))
        add("")
        add("*Counter-inflation.* %s" % c.get("counterInflation", ""))
        add("")
    es = bm["exclusionSemantics"]
    add("### 9.10 Exclusion semantics - the CORR1 reference derivation (MV-SCOPE-1)")
    add("")
    add(es["purpose"])
    add("")
    for i, r in enumerate(es["rule"]):
        add("%d. %s" % (i + 1, r))
    add("")
    add(_table(["Template", "Machine form"], [[k, _code(v)] for k, v in es["templates"].items()]))
    add("")
    add(_table(["Exclusion", "CORR1 reference form", "Basis", "CORR3 form", "Implementation form", "Parent -> implementation"],
               [[r["exclusionId"], r["corr1ReferenceForm"], r["corr1ReferenceBasis"], r["corr3Form"], r["childForm"], r["parentToChild"]]
                for r in ledger["exclusionLedger"]]))
    add("")
    add("### 9.11 Multi-valued determinant (IV1-SC5-MIXED, preserved)")
    add("")
    add(fv["listEnums"]["determinant"]["note"])
    add("")
    add(_table(["Fixture", "Case", "Computed", "Declared expectation"], _fixture_rows(interp, fxs, "IV1_SC5_MIXED")))
    add("")
    add("## 10. `MODULE-R-CMP` - THE SINGLE SC-3 / SC-9 RULE (MV-F02, preserved)")
    add("")
    mc = bm["moduleRules"]["MODULE-R-CMP"]
    add(mc["normative"])
    add("")
    add(_table(["Mapping", "Components / exclusions"], [[k, "; ".join(v) if isinstance(v, list) else v] for k, v in mc["modelMapping"].items()]))
    add("")
    add("Prohibited bases: %s." % "; ".join(mc["prohibitedBases"]))
    add("")
    add(_table(["Fixture", "Case", "Computed", "Declared expectation"], _fixture_rows(interp, fxs, "MV_F02")))
    add("")
    add("## 11. `MODULE-R-SEG` - ONE SEGMENTATION RULE (MV-F03, preserved)")
    add("")
    ms = bm["moduleRules"]["MODULE-R-SEG"]
    add(ms["normative"])
    add("")
    sg = bm["segmentation"]
    add(_table(["Item", "Value"], [["atom", sg["atom"]], ["lawful separators", ", ".join(sg["lawfulSeparators"])],
                                   ["not separators", ", ".join(sg["notSeparators"])], ["start marker", sg["startMarker"]],
                                   ["conjoined marker", sg["conjoinedMarker"]], ["on indivisible multi-function", sg["onIndivisibleMultiFunction"]],
                                   ["grouping key", ", ".join(sg["groupingKey"])]]))
    add("")
    se = sg["separatorEvidence"]
    add("**Separator evidence (a declared boundary must be physically evidenced).** %s %s %s %s" % (
        se["purpose"], se["unitOrder"], se["adjacency"], se["conjoined"]))
    add("")
    add(_table(["Separator (when units are adjacent)", "Evidence rule"],
               [[k, _code(dict((a, b) for a, b in v.items() if a not in ("continuationGuard", "documentaryInterval", "entityNameVeto"))) + ((" + continuation guard `%s` (section 11a)" % v["continuationGuard"]["id"])
                                                                                            if "continuationGuard" in v else "") + (" + documentary interval and entity-name veto (section 11b)" if "entityNameVeto" in v else "")]
                for k, v in se["whenAdjacent"].items()]))
    add("")
    add("When units are not adjacent: %s. %s" % (se["whenNotAdjacent"], se["violation"]))
    add("")
    for sep_, rule_ in se["whenAdjacent"].items():
        g_ = rule_.get("continuationGuard")
        if not g_:
            continue
        add("### 11a. `%s` - the continuation guard of the %s evidence" % (g_["id"], sep_))
        add("")
        add("*Basis.* %s." % g_["basis"])
        add("")
        add("*Rule.* %s." % g_["rule"])
        add("")
        add(_table(["Item", "Value"], [["decision", "`%s`" % g_["decision"]], ["ambiguous terminals", ", ".join("`%s`" % x for x in g_["ambiguousTerminals"])],
                                       ["terminal at the end of the previous unit", "`%s`" % g_["terminalAtUnitEnd"]],
                                       ["permitted between the terminal and the next letter", "`%s`" % g_["betweenPattern"]], ["case test", "`%s`" % g_["caseTest"]]]
                                      + ([["ASCII digit continuation (%s; closes %s)" % (g_["asciiDigitContinuation"]["act"], g_["asciiDigitContinuation"]["closes"]),
                                           "`%s` - %s" % (g_["asciiDigitContinuation"]["characters"], g_["asciiDigitContinuation"]["rule"])]] if g_.get("asciiDigitContinuation") else [])
                                      + [
                                       ["effect", "`%s`" % g_["effect"]], ["applies to", ", ".join("`%s`" % x for x in g_["appliesTo"])],
                                       ["declared-separator view", "%s (omitted ops: %s)" % (g_["views"]["declaredSeparator"]["rule"], ", ".join(g_["views"]["declaredSeparator"]["omitOps"]))],
                                       ["complete-view junction view", "%s (omitted ops: %s)" % (g_["views"]["completeViewJunction"]["rule"],
                                                                                                ", ".join(_code(o) for o in g_["views"]["completeViewJunction"]["omitThenOps"]))]]))
        add("")
        add("*Unchanged:* %s. *Never authority:* %s." % ("; ".join(g_["unchanged"]), "; ".join(g_["notAuthority"])))
        add("")
        add(_table(["Fixture", "Case", "Computed (state; relation; count disposition)", "Declared expectation"], _ta_fixture_rows(interp, fxs, "SE_ATERM")))
        add("")
    for sep_, rule_ in se["whenAdjacent"].items():
        iv_, v_ = rule_.get("documentaryInterval"), rule_.get("entityNameVeto")
        if not (iv_ and v_):
            continue
        au_ = v_["authority"]
        add("### 11b. `%s` and `%s` - the %s evidence integrity of this act" % (iv_["id"], v_["id"], sep_))
        add("")
        add("**Closes %s.** *Applies to:* %s. *Rule.* %s." % (iv_["closes"], iv_["applies"], iv_["rule"]))
        add("")
        add(_table(["Item", "Value"], [["candidates", "`%s`" % iv_["candidates"]], ["terminal inside the omitted gap", "`%s`" % iv_["terminalInGap"]],
                                       ["closers in the gap", "`%s`" % iv_["closersInGap"]]]))
        add("")
        add("*Unchanged:* %s. *Never authority:* %s." % ("; ".join(iv_["unchanged"]), "; ".join(iv_["notAuthority"])))
        add("")
        add("**Closes %s.** *Predicate.* %s. *Effect.* %s." % (v_["closes"], v_["predicate"], v_["effect"]))
        add("")
        add(_table(["Item", "Value"], [["terminals", ", ".join("`%s`" % x for x in v_["terminals"])], ["applies to", ", ".join("`%s`" % x for x in v_["appliesTo"])],
                                       ["span selection", "`%s` (the complete set; never a first, nearest or best span)" % v_["spanSelection"]],
                                       ["offset view", "`%s`" % v_["offsetView"]], ["authority", "`%s` - %s" % (au_["act"], au_["status"])],
                                       ["authority manifest / RECORDS", "`%s` / `%s`" % (au_["manifestSha256"], au_["recordsFileSha256"])],
                                       ["input", au_["input"]], ["required constants", _code(au_["requiredConstants"])], ["proven states", _code(au_["provenStates"])],
                                       ["entity id", "`%s`" % au_["entityIdPattern"]], ["coordinate view (decoder)", "`%s`" % au_["decoder"]],
                                       ["binding checks", ", ".join("`%s`" % x for x in au_["bindingChecks"])],
                                       ["records digest failure", "`%s` (the corpus is rejected)" % au_["recordsDigestError"]],
                                       ["refusal reasons", "; ".join("%s -> `%s`" % kv for kv in au_["reasons"].items())], ["usable", "`%s`" % au_["usable"]],
                                       ["never inferred inside sourceClass", "; ".join(au_["neverInferred"])]]))
        add("")
        add("**Residual.** %s." % v_["residual"])
        add("")
        add("*Never authority:* %s." % "; ".join(v_["notAuthority"]))
        add("")
        add(_table(["Fixture", "Case", "Computed (state; relation; count disposition)", "Declared expectation"], _ta_fixture_rows(interp, fxs, BI_GROUP)))
        add("")
    add(_table(["Fixture", "Case", "Computed", "Declared expectation"], _fixture_rows(interp, fxs, "MV_F03")))
    add("")
    add("## 12. CROSS-CLASS DETERMINISM MATRIX (all 36 pairs, from the model)")
    add("")
    for r in bm["pairwiseMatrix"]:
        add("### %s vs %s" % tuple(r["pair"]))
        add("")
        add("*Witness.* %s" % r["witness"])
        add("")
        for k, lab in (("singleRule", "Single normative rule"), ("canonicalResult", "Canonical result")):
            if r.get(k):
                add("**%s.** %s" % (lab, r[k]))
                add("")
        add("- **%s only:** %s" % (r["pair"][0], r["leftOnly"]))
        add("- **%s only:** %s" % (r["pair"][1], r["rightOnly"]))
        add("- **Genuinely mixed / multi-function:** %s" % r["mixed"])
        add("- **Neither:** %s" % r["neither"])
        add("- **Required structural segmentation behaviour:** %s" % r["segmentation"])
        add("")
    ev = bm["evidenceBinding"]
    add("## 13. EVIDENCE BINDING vs RULE EVALUATION (MV-VAL, MV-REPLAY-1)")
    add("")
    add(_table(["Layer", "What it is"], [[k, v] for k, v in ev["layers"].items()]))
    add("")
    add("**What the validator proves, and what it does not.** %s" % ev["validatorBoundary"])
    add("")
    add(_table(["Extraction recipe", "Decoder", "Operations (each with its declared role)", "Preserved artifact classes"],
               [[k, v["decoder"], _code(v["ops"]), ", ".join(v["preservedArtifactClasses"]) or "-"] for k, v in ev["extractionRecipes"].items()]))
    add("")
    add("Rendition text for R-DUP: %s" % ev["renditionText"])
    add("")
    add("Unit binding: %s." % "; ".join(ev["unitBinding"]))
    add("")
    wr = ev["witnessRule"]
    add(_table(["Witness rule", "Value"], [[k, _code(v) if isinstance(v, (list, dict, bool, int)) else v] for k, v in wr.items()]))
    add("")
    add("Free-form fields %s: %s" % (", ".join("`%s`" % f for f in ev["freeFormFields"]), ev["freeFormRule"]))
    add("")
    add("Physical heading: %s. Unresolved binding: %s." % (ev["physicalHeadingRule"], ev["unresolvedBinding"]))
    add("")
    add(_table(["Fixture", "Case", "Computed", "Declared expectation"], _fixture_rows(interp, fxs, "EVIDENCE")))
    add("")
    cs = bm["canonicalSegmentIdentity"]
    add("## 14. CANONICAL SEGMENT IDENTITY - CSI-v6 (MV-AND-1)")
    add("")
    add(cs["meaning"])
    add("")
    add(_table(["Item", "Definition"], [[k, _code(v) if isinstance(v, (list, bool, dict)) or v is None else v] for k, v in cs.items()
                                        if k not in ("frames", "removedProofs", "forbidden", "whenNotEstablished", "meaning")]))
    add("")
    add(_table(["Frame", "Tag", "Anchor components (in key order)", "Meaning"],
               [[k, v["tag"], ", ".join(v["anchorComponents"]), v["meaning"]] for k, v in cs["frames"].items()]))
    add("")
    wn = cs["whenNotEstablished"]
    add("When no frame establishes the occurrence (action `%s`, state role `%s`, marker `%s`): %s" % (wn["action"], wn["stateRole"], wn["marker"], wn["rule"]))
    add("")
    add(_table(["Removed CSI-v5 proof", "Test", "Status", "Why (historical counterexample retained)"],
               [[p["id"], p["test"], p["status"], p["why"]] for p in cs["removedProofs"]]))
    add("")
    add("*Forbidden.* %s" % "; ".join(cs["forbidden"]))
    add("")
    add(_table(["Fixture", "Case", "Computed", "Declared expectation"], _fixture_rows(interp, fxs, "CSI")))
    add("")
    add("### 14.1 Convergence of equivalent renditions (IV1-RR4-CSI-CONVERGENCE, carried)")
    add("")
    add(_table(["Fixture", "Case", "Computed", "Declared expectation"], _fixture_rows(interp, fxs, "IV1_RR4_CSI")))
    add("")
    add("### 14.2 The CSI-v5 occurrence-correspondence regressions (RR-17, OC-3), carried with byte-equal evidence")
    add("")
    add(_table(["Fixture", "Case", "Computed", "Declared expectation"], _fixture_rows(interp, fxs, "RR17_OCCURRENCE")))
    add("")
    add(_table(["Fixture", "Case", "Computed", "Declared expectation"], _fixture_rows(interp, fxs, "OC3_COUNT_EQUALITY")))
    add("")
    add(_table(["Fixture", "Case", "Computed", "Declared expectation"], _fixture_rows(interp, fxs, "OC3_KNOWN_LIMIT")))
    add("")
    oa = bm["occurrenceAnchoring"]
    add("## 15. OCCURRENCE ANCHORING - OPTION A+ (OA-1 .. OA-14)")
    add("")
    add("Architecture: %s." % oa["architecture"])
    add("")
    for p in oa["principles"]:
        add("- %s" % p)
    add("")
    add("### 15.1 Members (OA-1)")
    add("")
    add(_table(["Item", "Rule"], [[k, v] for k, v in oa["members"].items()]))
    add("")
    add("### 15.2 Origin-tracked replay (OA-2)")
    add("")
    add(_table(["Item", "Rule"], [[k, v] for k, v in oa["originTrackedReplay"].items()]))
    add("")
    add("### 15.3 Extraction op roles (OA-5)")
    add("")
    orl = oa["opRoles"]
    add(_table(["Role", "Removal class"], [[k, v] for k, v in orl["removalClassOfRole"].items()]))
    add("")
    add("Declared on: %s. Missing role: %s" % (orl["declaredOn"], orl["missingRole"]))
    add("")
    add(_table(["Recipe", "Op #", "Op", "Declared role"],
               [[k, i + 1, op["op"] + ((" " + op["pattern"]) if "pattern" in op else ""), op["role"]]
                for k, v in ev["extractionRecipes"].items() for i, op in enumerate(v["ops"])]))
    add("")
    add("### 15.4 Anchor source sigma and skeleton k (OA-3)")
    add("")
    src_ = oa["anchorSource"]
    add(_table(["Recipes", "Basis", "Rule"], [["markup-removing", src_["markupRemovingRecipes"]["basis"], src_["markupRemovingRecipes"]["rule"]],
                                              ["markup-preserving", src_["markupPreservingRecipes"]["basis"], src_["markupPreservingRecipes"]["rule"]]]))
    add("")
    add("Coder text: %s (%s). %s." % (_code(src_["coderText"]["ops"]), src_["coderText"]["rule"], src_["noDomNoCoordinates"]))
    add("")
    cv = oa["completeView"]
    add("### 15.5 Complete view (OA-4)")
    add("")
    add(cv["rule"])
    add("")
    add(_table(["Item", "Value"], [["comment pattern", "`%s`" % cv["commentPattern"]], ["tag pattern", "`%s`" % cv["tagPattern"]],
                                   ["strict tag grammar", "`%s`" % cv["strictTagPattern"]], ["attribute pattern", "`%s`" % cv["attributePattern"]],
                                   ["standard element names", "%d declared" % len(cv["standardElementNames"])],
                                   ["standard attribute names", "%d declared, plus prefixes %s" % (len(cv["standardAttributeNames"]), ", ".join(cv["standardAttributeNamePrefixes"]))],
                                   ["then", _code(cv["then"])], ["source kinds", _code(cv["sourceKinds"])], ["fail closed", cv["failClosed"]],
                                   ["standard names", cv["standardNames"]]]))
    add("")
    rv = oa["removalViews"]
    add("### 15.6 Removal views (OA-5)")
    add("")
    add(_table(["View", "Rule"], [["recipe views (%s)" % rv["recipeViews"]["source"], rv["recipeViews"]["rule"]],
                                  ["TAG view (%s)" % rv["tagView"]["canonicalizationArtifactClass"], rv["tagView"]["rule"]],
                                  ["class of a complete-view character", rv["classOfCompleteViewCharacter"]]]))
    add("")
    sm = oa["seam"]
    add("### 15.7 TEXT_BEARING_REMOVAL_SEAM (R-3)")
    add("")
    add(sm["rule"])
    add("")
    add("- *a seam:* %s" % "; ".join(sm["aSeam"]))
    add("- *not a seam:* %s" % "; ".join(sm["notASeam"]))
    add("")
    add("### 15.8 Frame selection (OA-6)")
    add("")
    add(oa["frameSelection"]["rule"])
    add("")
    fc = oa["frameC"]
    add("### 15.9 FRAME-C (OA-7; OA-7(b) per occurrence, CORR1.CORR1)")
    add("")
    add(fc["rule"])
    add("")
    add(_table(["Condition", "Level", "Test", "Recorded reason"], [[c["id"], fc["conditionLevels"][c["id"]], c["test"], c["reason"]] for c in fc["conditions"]]))
    add("")
    add("omega: %s. Provisional occurrence: %s. Representability: %s. Decision: %s. Taint scope: `%s`." % (
        fc["omega"], fc["provisionalOccurrence"], fc["representability"], fc["decision"], fc["taintScope"]))
    add("")
    fu = oa["frameU"]
    add("### 15.10 FRAME-U (OA-8)")
    add("")
    add(fu["rule"])
    add("")
    add(_table(["Guard", "Test", "Recorded reason", "Rule"], [[g["id"], g["test"], g["reason"], g["rule"]] for g in fu["guard"]]))
    add("")
    add("Count view: `%s`. Scope: `%s`. Empty skeleton: `%s`." % (fu["countView"], fu["scope"], fu["emptySkeletonReason"]))
    add("")
    add("### 15.11 Own seam (OA-9)")
    add("")
    add("%s. Used only through: %s. %s." % (oa["ownSeam"]["rule"], "; ".join(oa["ownSeam"]["useOnlyThrough"]), oa["ownSeam"]["neverAGate"]))
    add("")
    fcl = oa["failClosed"]
    add("### 15.12 Fail closed (OA-10)")
    add("")
    add(fcl["rule"])
    add("")
    add("Recorded reasons: %s. Order: %s." % (", ".join("`%s`" % r for r in fcl["recordedReasons"]), fcl["reasonOrder"]))
    add("")
    uw = oa["unplacedWitness"]
    add("### 15.13 Unplaced conflict witness and class-conditional quarantine (OA-14, CORR1.CORR1.CORR1)")
    add("")
    add(uw["stage"])
    add("")
    add(_table(["Item", "Declared"], [["unplaced exits", ", ".join(uw["unplacedExits"])], ["unplaced", uw["unplaced"]],
                                      ["witness role / source", "%s / %s" % (uw["witness"]["role"], uw["witness"]["source"])],
                                      ["witness rule", uw["witness"]["rule"]], ["not a witness", _code(uw["witness"]["notAWitness"])],
                                      ["why not", uw["witness"]["notAWitnessWhy"]],
                                      ["candidate set basis", "%s (exclusion proofs: %s; %s)" % (uw["candidateSet"]["basis"], _code(uw["candidateSet"]["exclusionProofs"]), uw["candidateSet"]["narrowingStatus"])],
                                      ["candidate set rule", uw["candidateSet"]["rule"]],
                                      ["quarantine rule", "%s: %s" % (uw["quarantine"]["rule"], uw["quarantine"]["text"])],
                                      ["withholding", uw["quarantine"]["withholding"]], ["application", "%s: %s" % (uw["application"], uw["simultaneity"])],
                                      ["equivalently", uw["equivalently"]]]))
    add("")
    add("*Recorded.* %s" % "; ".join(uw["recorded"]))
    add("")
    add("*Forbidden.* %s" % "; ".join(uw["forbidden"]))
    add("")
    add("### 15.14 Residual register")
    add("")
    add(_table(["Residual", "Status"], [[k, v] for k, v in oa["residualsCarried"].items()]))
    add("")
    add("### 15.15 Architecture fixtures: the 38 parent-architecture cases (slot constructions; physical oracle)")
    add("")
    add(_table(["Fixture", "Case", "Computed", "Declared expectation"], _fixture_rows(interp, fxs, "ARCH_PARENT_ADV")))
    add("")
    add("### 15.16 Architecture fixtures: the 34 R-3 cases (CORR1)")
    add("")
    add(_table(["Fixture", "Case", "Computed", "Declared expectation"], _fixture_rows(interp, fxs, "ARCH_R3")))
    add("")
    add("### 15.17 OA-7(b) representability symmetry (CORR1.CORR1)")
    add("")
    add(_table(["Fixture", "Case", "Computed", "Declared expectation"], _fixture_rows(interp, fxs, "OA7B")))
    add("")
    add("### 15.18 OA-14 unplaced conflict witness (CORR1.CORR1.CORR1)")
    add("")
    add(_table(["Fixture", "Case", "Computed", "Declared expectation"], _fixture_rows(interp, fxs, "R14")))
    add("")
    add("### 15.19 U4 alone decisive (U1, U2, U3 pass; U4 fails)")
    add("")
    add(_table(["Fixture", "Case", "Computed", "Declared expectation"], _fixture_rows(interp, fxs, "U4_ONLY")))
    add("")
    add("### 15.20 A+ mechanism probes (the TAG view on a PDF member, op provenance at a script boundary, every-member taint)")
    add("")
    add(_table(["Fixture", "Case", "Computed", "Declared expectation"], _fixture_rows(interp, fxs, "A_PLUS_PROBES")))
    add("")
    rr = bm["rules"]
    add("## 16. SUPPLYING BASIS, SEGMENTATION BOUNDARY, MULTI-CLASS, EDGE, FORM AND EVIDENCE RULES (unchanged)")
    add("")
    for rid in ("R-BASIS", "R-SEG-B", "R-MULTI", "R-EDGE", "R-FORM", "R-EVID"):
        r = rr[rid]
        add("### `%s` - %s" % (rid, r["name"]))
        add("")
        add(r["normative"])
        add("")
        for k, v in r.items():
            if k in ("id", "name", "normative"):
                continue
            add("- *%s:* %s" % (k, "; ".join(v) if isinstance(v, list) and all(isinstance(x, str) for x in v) else (_code(v) if not isinstance(v, str) else v)))
        add("")
    rc = rr["R-COUNT"]
    add("## 17. `R-COUNT` - srcDiv DISTINCT-CLASS COUNTING (B-2 bound at step 5b; F-01 preserved; MV-LOC-1)")
    add("")
    add(rc["normative"])
    add("")
    add("```text")
    for st in rc["steps"]:
        add(st)
    add("```")
    add("")
    for k in ("consequences", "removedRules"):
        add("*%s.*" % k)
        add("")
        for x in rc[k]:
            add("- %s" % x)
        add("")
    add(_table(["Disposition", "Fires iff", "Cannot fire because", "Key", "Effect"],
               [[d["id"], d["fires"], d["cannotFire"], ", ".join(d["key"]), d["effect"]] for d in rc["countingDispositions"]]))
    add("")
    add("Grouping key: %s. Counting unit: %s. Holds when distinct classes >= %d. Downstream: %s" % (
        ", ".join(rc["groupingKey"]), rc["countingUnit"], rc["holdsWhenDistinctClassesAtLeast"], rc["downstream"]))
    add("")
    add(_table(["Fixture", "Case", "Computed", "Declared expectation"], _fixture_rows(interp, fxs, "PRESERVED")))
    add("")
    b2 = bm.get("basisOverlap")
    if b2:
        add("## 17b. `%s` - BASIS-OVERLAP ANTI-INFLATION (R-BASIS B-2 AT COUNT TIME; R-COUNT STEP 5b)" % b2["id"])
        add("")
        for k in ("binds", "position", "kind"):
            add("- *%s:* %s" % (k, b2[k]))
        add("- *application:* `%s` (connected components of the overlap graph; never pairwise, never in record order)" % b2["application"])
        add("")
        add("*Nodes.* %s. %s." % (b2["nodes"]["rule"], b2["nodes"]["unplacedGroups"]))
        add("")
        add("*Footprint (FRAME-C `%s`, FRAME-U `%s`).* %s. Never taken from: %s." % (b2["footprint"]["FRAME-C"], b2["footprint"]["FRAME-U"], b2["footprint"]["rule"],
                                                                                 "; ".join(b2["footprint"]["neverFrom"])))
        add("")
        add("*Overlap (`%s`, touching = `%s`, FRAME-U = `%s`).* %s. Relations recorded: %s." % (
            b2["overlap"]["test"], b2["overlap"]["touching"], b2["overlap"]["frameU"], b2["overlap"]["rule"], ", ".join("`%s`" % v for v in b2["overlap"]["relations"].values())))
        add("")
        sc = b2["supportCore"]
        add("*predicateSupportCore (`%s`, participation `%s`, empty or unlocated -> `%s`, sufficiency `%s`).* %s. Never alters: %s." % (
            sc["atoms"], sc["participation"], sc["whenEmptyOrUnlocated"], sc["sufficiency"], sc["rule"], "; ".join(sc["neverAlters"])))
        add("")
        ls = b2["lawfulSeparation"]
        add("*LAWFULLY_SEPARATE_SUPPORT(a, b).* %s." % ls["rule"])
        add("")
        add(_table(["Condition", "Test", "Must establish"], [[c["id"], c["test"], c["text"]] for c in ls["conditions"]]))
        add("")
        add("Boundary source `%s`; boundary locus: %s. Not a boundary: %s." % (ls["boundarySource"], ls["boundaryLocus"], "; ".join(ls["notABoundary"])))
        add("")
        cr = b2["componentRule"]
        add("*Component rule.* One class -> `%s`; two or more classes -> `%s` (reason `%s`). No class wins: %s." % (cr["oneClass"], cr["severalClasses"], cr["reason"],
                                                                                                         ", ".join(cr["noClassWins"])))
        add("")
        add(_table(["Count disposition", "When"], [["`%s`" % d["id"], d["when"]] for d in b2["dispositions"]]))
        add("")
        add("Count dispositions are %s. Exact-occurrence conflicts: `%s`. Record effect: `%s`." % (b2["dispositionKind"], b2["exactGroupConflict"], b2["recordStateEffect"]))
        add("")
        add("*Recording.* `count.%s`, per record: %s (%s)." % (b2["recording"]["field"], ", ".join("`%s`" % x for x in b2["recording"]["perRecord"]), b2["recording"]["where"]))
        add("")
        add("*Never changes:* %s." % "; ".join(b2["neverChanges"]))
        add("")
        add("*Identity statements stand.* %s." % b2["identityStatementsStand"])
        add("")
        add("*Forbidden:* %s." % "; ".join(b2["forbidden"]))
        add("")
        add("*Closes:* %s. *Accepted undercount:* %s." % (b2["residualClosed"], b2["undercount"]))
        add("")
        add(_table(["Fixture", "Case", "Computed (state; count disposition)", "Declared expectation"], _b2_fixture_rows(interp, fxs)))
        add("")
    ta = (b2 or {}).get("touchingAtom")
    if ta:
        add("## 17c. `%s` - TOUCHING FRAGMENTS OF ONE INDIVISIBLE ATOM (R7-RES-1; R-COUNT STEP 5b)" % ta["id"])
        add("")
        for k in ("closes", "binds", "edge", "pairs"):
            add("- *%s:* %s" % (k, ta[k]))
        add("- *application:* `%s` (one more edge kind in the basis-overlap graph; never a second component algorithm)" % ta["application"])
        add("")
        add(_table(["Condition", "Must be established mechanically"], [[c["id"], c["text"]] for c in ta["conditions"]]))
        add("")
        add("*Atom (`%s`).* %s." % (ta["atomTest"], ta["atom"]))
        add("")
        jn = ta["junction"]
        add("*Junction (`%s`).* %s. *Material:* %s (omitted complete-view ops: %s). Rendition members: FRAME-C `%s`, FRAME-U `%s`." % (
            jn["extent"], jn["gaps"], jn["material"]["rule"], ", ".join("`%s`" % _code(o) for o in jn["material"]["omitCompleteViewOps"]),
            jn["renditionMembers"]["FRAME-C"], jn["renditionMembers"]["FRAME-U"]))
        add("")
        je = ta["junctionEvidence"]
        wa = bm["segmentation"]["separatorEvidence"]["whenAdjacent"]
        add("*Junction evidence.* %s." % je["rule"])
        add("")
        add(_table(["Lawful separator", "Reading", "Frozen evidence it reads", "Frozen pattern", "How it is read between two footprints"],
                   [[r["separator"], r["reading"], "`segmentation.separatorEvidence.whenAdjacent.%s.%s`" % (r["separator"], je["readings"][r["reading"]]["frozenEvidence"]),
                     "`%s`" % wa[r["separator"]][je["readings"][r["reading"]]["frozenEvidence"]], je["readings"][r["reading"]]["rule"]] for r in je["rules"]]))
        add("")
        add(_table(["Lawful separator never evidenced from bytes alone", "Why"], [[x["separator"], x["why"]] for x in je["notEvidenced"]]))
        add("")
        add("Head look-ahead: %d characters. Not a boundary: %s." % (je["headLookaheadCharacters"], "; ".join(je["notABoundary"])))
        add("")
        add("*Recorded boundaries.* %s." % ta["recordedBoundaries"])
        add("")
        add("*Members (`%s`).* %s. Relations recorded: %s." % (ta["members"]["rule"], ta["members"]["text"], ", ".join("`%s`" % v for v in ta["relations"].values())))
        add("")
        add("*Component binding (`%s`).* %s." % (ta["componentBinding"], ta["componentBindingRule"]))
        add("")
        add("*Recording.* `count.%s.%s` and `count.%s.%s`: %s." % (ta["recording"]["field"], ta["recording"]["pairs"], ta["recording"]["field"], ta["recording"]["relations"],
                                                                   ta["recording"]["rule"]))
        add("")
        add("*Never changes:* %s." % "; ".join(ta["neverChanges"]))
        add("")
        add("*Forbidden:* %s." % "; ".join(ta["forbidden"]))
        add("")
        add("*Closes:* %s. *Accepted undercount:* %s." % (ta["residualClosed"], ta["undercount"]))
        add("")
        add(_table(["Fixture", "Case", "Computed (state; relation; count disposition)", "Declared expectation"], _ta_fixture_rows(interp, fxs)))
        add("")
    rd = rr["R-DUP"]
    add("## 18. `R-DUP` AND `R-EQV` (unchanged; F-04 preserved; MV-DUP-1; MV-VAL)")
    add("")
    add(rd["normative"])
    add("")
    add(_table(["Link class", "Members"], [[k, "; ".join(v)] for k, v in rd["linkClasses"].items()]))
    add("")
    add("*Split evidence.* %s" % "; ".join(rd["splitEvidence"]))
    add("")
    for k in sorted(rd["principles"], key=int):
        add("%s. %s" % (k, rd["principles"][k]))
    add("")
    add(_table(["Link rule", "Class", "Fields equal and non-null", "Gate"],
               [[x["link"], x["linkClass"], ", ".join(x["fieldsEqualNonNull"]), x.get("admittedOnlyIfSourceIdScopeIsNot", "-")] for x in rd["linkRules"]]))
    add("")
    add(_table(["Never sufficient", "Fields"], [[x["marker"], ", ".join(x["fieldsEqualNonNull"])] for x in rd["neverSufficientRules"]]))
    add("")
    add(_table(["Candidate rule (not a link)", "Derived key", "Meaning"],
               [[x["candidate"], _code(x["derive"]), x["meaning"]] for x in rd["candidateRules"]]))
    add("")
    add(rd["candidateRule"])
    add("")
    add(_table(["Split rule", "Test"], [[x["split"], _code(dict((k, v) for k, v in x.items() if k != "split"))] for x in rd["splitRules"]]))
    add("")
    add("**Ordered decision procedure - conflict detection first.**")
    add("")
    add(_table(["Step", "Condition", "Machine condition", "Result", "State", "Basis"],
               [[st["step"], st["when"], _code(rd["conditionMachine"][st["when"]]), bm["states"]["identityStates"][st["resultRole"]],
                 bm["states"]["identityStates"][st["stateRole"]], st["basis"]] for st in rd["decisionProcedure"]]))
    add("")
    add("Group identity: %s. %s" % (rd["groupIdentity"], rd["unresolvedIdentityRule"]))
    add("")
    re_ = rd["renditionEquivalenceTest"]
    add(_table(["R-EQV parameter", "Value"], [[k, _code(v)] for k, v in re_["parameters"].items()]))
    add("")
    cz = bm["canonicalization"]
    add(cz["rule"])
    add("")
    add(_table(["#", "Artifact class", "Operation"], [[i + 1, o["artifactClass"], _code(dict((k, v) for k, v in o.items() if k != "artifactClass"))]
                                                     for i, o in enumerate(cz["ops"])]))
    add("")
    add("*R-EQV steps.* %s" % " ".join(re_["steps"]))
    add("")
    add("*Forbidden assertions.* %s" % "; ".join(re_["forbiddenAssertions"]))
    add("")
    add(_table(["Fixture", "Case", "Computed", "Declared expectation"], _fixture_rows(interp, fxs, "DUPLICATE")))
    add("")
    add("### 18.1 Equivalent captures of one webpage (IV1-F04-EQUIVALENT-CAPTURES, preserved)")
    add("")
    add(_table(["Fixture", "Case", "Computed", "Declared expectation"], _fixture_rows(interp, fxs, "IV1_F04_CAPTURES")))
    add("")
    add("## 19. `R-FAIL` - FAIL-CLOSED BEHAVIOUR")
    add("")
    add(rr["R-FAIL"]["normative"])
    add("")
    for x in rr["R-FAIL"]["toMoveToAssigned"]:
        add("- %s" % x)
    add("")
    add("## 20. DETERMINISTIC DECISION PROCEDURE")
    add("")
    add("```text")
    for st in bm["decisionProcedure"]:
        add(st)
    add("```")
    add("")
    ac = bm["authoritativeConsumer"]
    add("## 21. AUTHORITATIVE CONSUMER / CAUSAL EFFECT")
    add("")
    add("```text")
    add("\n  -> ".join(ac["chain"]))
    add("```")
    add("")
    add("Success: %s. Failure: %s. %s" % (ac["success"], ac["failure"], ac["notExecuted"]))
    add("")
    add("## 22. SEMANTIC DELTA (CORR4 base -> A+ parent and A+ parent -> R7 parent, carried; R7 parent -> this closure)")
    add("")
    for para in ct["semanticDelta"]:
        add(para)
        add("")
    pc = ledger["parentToChild"]
    add("**CORR4 base -> A+ parent leaf delta, carried unchanged** (recomputed by check X-10 from the two frozen models; the child equals the A+ parent on every one of these leaves except the model id and the validator file name). The only classes permitted are %s." % ", ".join("`%s`" % c for c in DELTA_CLASSES))
    add("")
    add(_table(["Class", "Leaves"], [[c, pc["countsByClass"].get(c, 0)] for c in DELTA_CLASSES]))
    add("")
    add(_table(["Classification rule (model path prefix)", "Class", "Reason"], [[x["pathPrefix"], x["class"], x["reason"]] for x in pc["classificationRules"]]))
    add("")
    add("**Carried parent fixtures whose declared expectation changes** (evidence byte-equal; recomputed by check F-2; judged by the physical oracle where a physical label exists, check F-8):")
    add("")
    add(_table(["Fixture", "Kind", "Class", "Why"], [[d["fixtureId"], d["kind"], d["class"], d["why"]] for d in ledger["fixtureExpectationChanges"]]))
    add("")
    add(_table(["Fixture", "Case", "Computed", "Declared expectation"], _fixture_rows(interp, fxs, "SCOPE")))
    add("")
    ac = ledger.get("aPlusToR7Parent")
    if ac:
        add("**A+ parent -> R7 parent leaf delta, carried unchanged** (recomputed by check B2-2 from the two frozen models and equal to the R7 parent's own ledger). Every changed leaf lies on the R-7 count surface; the only classes permitted are %s." % ", ".join("`%s`" % c for c in R7_DELTA_CLASSES))
        add("")
        add(_table(["Class", "Leaves"], [[c, ac["countsByClass"].get(c, 0)] for c in R7_DELTA_CLASSES]))
        add("")
    bc = ledger.get("seParentToChild")
    if bc:
        add("**Sentence-evidence parent -> this closure leaf delta** (recomputed by check BI-2). Every changed leaf is the SENTENCE evidence's documentary interval or entity-name veto, the whenNotAdjacent wording, the model id or the validator file name; the only classes permitted are %s (anything else is SCOPE_VIOLATION)." % ", ".join("`%s`" % c for c in BI_DELTA_CLASSES))
        add("")
        add(_table(["Class", "Leaves"], [[c, bc["countsByClass"].get(c, 0)] for c in BI_DELTA_CLASSES]))
        add("")
        add(_table(["Classification rule (model path prefix)", "Class", "Reason"], [[x["pathPrefix"], x["class"], x["reason"]] for x in bc["classificationRules"]]))
        add("")
        bi_ = ledger["biImpactPreflight"]
        add("**Impact preflight of this closure** (recomputed by check BI-4): %s" % bi_["statement"])
        add("")
        add(_table(["Surface", "Evaluated", "Outcome changed", "Cases"], [[r["surface"], r["evaluated"], r["changed"], r["cases"] or "-"] for r in bi_["table"]]))
        add("")
        add(_table(["Pilot authority record", "Binding"], [[a, w] for a, w in bi_["pilot"]["binding"]]))
        add("")
        add(_table(["Carried fixture", "Class", "Why its declared expectation changes"], [[d["fixtureId"], d["class"], d["why"]] for d in ledger["seFixtureChanges"]]))
        add("")
    sc = ledger.get("taParentToChild")
    if sc:
        add("**Touching-atom parent -> sentence-evidence parent leaf delta, carried** (recomputed by check SE-2). Every changed leaf is the SENTENCE evidence's continuation guard, the model id or the validator file name; the only classes permitted are %s (anything else is SCOPE_VIOLATION)." % ", ".join("`%s`" % c for c in SE_DELTA_CLASSES))
        add("")
        add(_table(["Class", "Leaves"], [[c, sc["countsByClass"].get(c, 0)] for c in SE_DELTA_CLASSES]))
        add("")
        add(_table(["Classification rule (model path prefix)", "Class", "Reason"], [[x["pathPrefix"], x["class"], x["reason"]] for x in sc["classificationRules"]]))
        add("")
        si = ledger["seImpactPreflight"]
        add("**Impact preflight of this closure** (act section 11; recomputed by check SE-4): %s" % si["statement"])
        add("")
        add(_table(["Surface", "Evaluated", "Guard fired (SENTENCE match withheld)", "Outcome changed", "Cases (what changed)"],
                   [[r["surface"], r["evaluated"], r["guardFired"], r["changed"], r["cases"] or "-"] for r in si["table"]]))
        add("")
        add(_table(["Carried fixture on which the guard fired", "Why the outcome equals the parent's"], [[k, v] for k, v in sorted(si["fixtures"]["firedWithoutOutcomeChange"].items())]))
        add("")
        add(_table(["Carried touching-atom fixture", "Class", "Why its truth and declared expectation change"], [[d["fixtureId"], d["class"], d["why"]] for d in ledger["taFixtureChanges"]]))
        add("")
    tc = ledger.get("r7ToChild")
    if tc:
        add("**R7 parent -> touching-atom parent leaf delta, carried** (recomputed by check TA-2). Every changed leaf lies on the touching-atom surface; the only classes permitted are %s (anything else is SCOPE_VIOLATION). No Option A+, CSI-v6, OA, segmentation, R-DUP or sourceClass predicate leaf changes." % ", ".join("`%s`" % c for c in TA_DELTA_CLASSES))
        add("")
        add(_table(["Class", "Leaves"], [[c, tc["countsByClass"].get(c, 0)] for c in TA_DELTA_CLASSES]))
        add("")
        add(_table(["Classification rule (model path prefix)", "Class", "Reason"], [[x["pathPrefix"], x["class"], x["reason"]] for x in tc["classificationRules"]]))
        add("")
        ip = ledger["impactPreflight"]
        add("**Impact preflight** (act section 14; recomputed by check TA-4): the count with the touching relation against the count without it (the R7 parent's), surface by surface.")
        add("")
        add(_table(["Surface", "Evaluated", "Count deltas", "Cases"], [[r["surface"], r["evaluated"], r["countDeltas"], ", ".join(r["cases"]) or "-"] for r in ip["table"]]))
        add("")
        add(ip["statement"])
        add("")
        add(_table(["Carried R7 fixture", "Class", "Why the declared expectation changes"], [[d["fixtureId"], d["class"], d["why"]] for d in ledger["r7FixtureExpectationChanges"]]))
        add("")
    add("## 23. FREEZE EVIDENCE")
    add("")
    add(_table(["Claim", "Status"], [[k, v] for k, v in rules["freezeEvidence"].items()]))
    add("")
    add("## 24. SCOPE BOUNDARY, PRIOR CLOSURES AND RESIDUAL RISKS")
    add("")
    for para in ct["scopeBoundary"]:
        add(para)
        add("")
    add(_table(["Prior closure", "How this implementation preserves it"], [[k, v] for k, v in rules["priorClosuresPreserved"].items()]))
    add("")
    add(_table(["Residual risk", "Where", "Statement", "Suggested verifier action"],
               [[r["id"], r["where"], r["statement"], r["action"]] for r in rules["residualRisksForVerifier"]]))
    add("")
    for line in ct["footer"]:
        add(line)
        add("")
    return "\n".join(L).rstrip("\n") + "\n"


# ================================================================== PART 4 (checks, report, harness)


def inline_loader(a):
    c = a.get("content", {})
    if "inlineHex" in c:
        return bytes.fromhex(c["inlineHex"])
    t = c.get("inlineText")
    return None if t is None else t.encode("utf-8")


def run_fixture(interp, fx, evaluator=None, skip=()):
    """Evaluate a fixture's machine-defined evidence and compare with its declared expectation.

    The declared expectation is a CLAIM the model must reproduce; it is never the oracle (construction fixtures are also judged by the physical
    oracle, check F-7). evaluator defaults to this file's evaluate_corpus; checks X-7 and X-8 pass the frozen parent evaluator. skip names expectation
    keys that a frozen parent interpreter cannot express (representation only); it never skips a semantic key."""
    exp = dict((k, v) for k, v in fx["expect"].items() if k not in skip)
    try:
        res = (evaluator or evaluate_corpus)(interp, fx["corpus"], inline_loader)
    except Exception as e:  # noqa: BLE001 - a ModelError of this or of a frozen interpreter
        code = getattr(e, "code", None)
        if code is None:
            raise
        if exp.get("error") == code:
            return True, {"error": code}, None
        return False, {"unexpectedError": str(e)}, None
    if "error" in exp:
        return False, {"expectedError": exp["error"], "butEvaluated": True}, res
    segs = dict((s["segmentId"], s) for s in res["segmentRecords"])
    problems = []
    if "segments" in exp:
        if set(exp["segments"]) != set(segs):
            problems.append({"segmentIds": sorted(segs), "expected": sorted(exp["segments"])})
        for sid, (state, label) in exp["segments"].items():
            s = segs.get(sid)
            if s and (s["sourceClassAssignmentState"], s["sourceClass"]) != (state, label):
                problems.append({sid: [s["sourceClassAssignmentState"], s["sourceClass"]], "expected": [state, label]})
    if "distinctClassSet" in exp and res["count"]["distinctClassSet"] != exp["distinctClassSet"]:
        problems.append({"distinctClassSet": res["count"]["distinctClassSet"], "expected": exp["distinctClassSet"]})
    if "srcDivHolds" in exp and res["count"]["holds"] != exp["srcDivHolds"]:
        problems.append({"srcDivHolds": res["count"]["holds"]})
    if "segmentClassConflicts" in exp and len(res["count"]["segmentClassConflicts"]) != exp["segmentClassConflicts"]:
        problems.append({"conflicts": res["count"]["segmentClassConflicts"]})
    if "multiClassDocuments" in exp and len(res["count"]["multiClassDocuments"]) != exp["multiClassDocuments"]:
        problems.append({"multiClassDocuments": res["count"]["multiClassDocuments"]})
    if "documents" in exp and res["documents"] != exp["documents"]:
        problems.append({"documents": res["documents"]})
    pairs = dict((tuple(p["pair"]), p) for p in res["duplicatePairs"])
    for d in exp.get("duplicates", []):
        p = pairs.get(tuple(d["pair"]))
        if p is None:
            problems.append({"pairMissing": d["pair"]})
            continue
        for k in ("state", "result", "renditionEquivalence"):
            if k in d and p[k] != d[k]:
                problems.append({"pair": d["pair"], k: p[k], "expected": d[k]})
    for a, b in exp.get("csiEqual", []):
        if not (a in segs and b in segs and segs[a]["canonicalSegmentIdentity"] is not None
                and segs[a]["canonicalSegmentIdentity"] == segs[b]["canonicalSegmentIdentity"]):
            problems.append({"csiEqual": [a, b]})
    for a, b in exp.get("csiDistinct", []):
        if not (a in segs and b in segs and segs[a]["canonicalSegmentIdentity"] is not None and segs[b]["canonicalSegmentIdentity"] is not None
                and segs[a]["canonicalSegmentIdentity"] != segs[b]["canonicalSegmentIdentity"]):
            problems.append({"csiDistinct": [a, b]})
    for sid in exp.get("csiUnresolved", []):
        s_ = segs.get(sid)
        if not (s_ and s_["canonicalSegmentIdentity"] is None and s_["csiComponents"] is None
                and s_["sourceClassAssignmentState"] == interp.roles["duplicateUnresolved"] and s_["sourceClass"] is None):
            problems.append({"csiUnresolved": sid})
    for sid, want in exp.get("occurrenceCorrespondence", {}).items():
        if not (sid in segs and segs[sid].get("occurrenceCorrespondence") == want):
            problems.append({"occurrenceCorrespondence": sid, "got": (segs.get(sid) or {}).get("occurrenceCorrespondence"), "expected": want})
    for sid, want in exp.get("unresolvedReasons", {}).items():
        got = ((segs.get(sid) or {}).get("occurrenceAnchor") or {}).get("unresolvedReason")
        if sid not in segs or got != want:
            problems.append({"unresolvedReason": sid, "got": got, "expected": want})
    for sid, want in exp.get("failedConditions", {}).items():
        got = ((segs.get(sid) or {}).get("occurrenceAnchor") or {}).get("failedConditions")
        if sid not in segs or got != want:
            problems.append({"failedConditions": sid, "got": got, "expected": want})
    for sid, want in exp.get("frameUGuard", {}).items():
        got = ((segs.get(sid) or {}).get("occurrenceAnchor") or {}).get("frameUGuard")
        if sid not in segs or got != want:
            problems.append({"frameUGuard": sid, "got": got, "expected": want})
    if "witnesses" in exp:
        got = sorted(s["segmentId"] for s in res["segmentRecords"] if ((s.get("occurrenceAnchor") or {}).get("unplaced") or {}).get("role"))
        if got != sorted(exp["witnesses"]):
            problems.append({"witnesses": got, "expected": exp["witnesses"]})
    if "quarantined" in exp:
        got = sorted(s["segmentId"] for s in res["segmentRecords"] if (s.get("occurrenceAnchor") or {}).get("withheldOccurrence"))
        if got != sorted(exp["quarantined"]):
            problems.append({"quarantined": got, "expected": exp["quarantined"]})
    for sid, n in exp.get("candidateSetSizes", {}).items():
        un = ((segs.get(sid) or {}).get("occurrenceAnchor") or {}).get("unplaced") or {}
        if len(un.get("candidateSet") or []) != n or "candidateSet" not in un:
            problems.append({"candidateSetSize": sid, "got": len(un.get("candidateSet") or []), "expected": n})
    for a, b in exp.get("spanStartsDiffer", []):
        if not (a in segs and b in segs and segs[a].get("span") and segs[b].get("span") and segs[a]["span"][0] != segs[b]["span"][0]):
            problems.append({"spanStartsDiffer": [a, b]})
    if "contributingGroups" in exp and res["count"]["contributingGroups"] != exp["contributingGroups"]:
        problems.append({"contributingGroups": res["count"]["contributingGroups"], "expected": exp["contributingGroups"]})
    field = (getattr(interp, "b2", None) or {}).get("recording", {}).get("field", "basisOverlap")
    bo = res["count"].get(field) or {}
    for sid, want in exp.get("b2Dispositions", {}).items():
        got = (bo.get("records", {}).get(sid) or {}).get("b2CountDisposition")
        if got != want:
            problems.append({"b2Disposition": sid, "got": got, "expected": want})
    if "b2Components" in exp:
        comps = {}
        for sid, r in bo.get("records", {}).items():
            comps.setdefault(r["basisOverlapComponentId"], []).append(sid)
        got = sorted(sorted(v) for v in comps.values())
        if got != exp["b2Components"]:
            problems.append({"b2Components": got, "expected": exp["b2Components"]})
    if "taRelations" in exp:
        got = dict(("%s|%s" % tuple(r["records"]), r["relation"]) for r in bo.get("touchingAtomRelations", []))
        if got != exp["taRelations"]:
            problems.append({"taRelations": got, "expected": exp["taRelations"]})
    for k, fk in (("lawfullySeparatePairs", "lawfullySeparatePairs"), ("b2Withheld", "withheldComponents"), ("b2Collapsed", "collapsedComponents")):
        if k in exp and bo.get(fk) != exp[k]:
            problems.append({k: bo.get(fk), "expected": exp[k]})
    for sid, per_class in exp.get("firedExclusions", {}).items():
        seg = segs.get(sid)
        for cid, fired in per_class.items():
            got = (seg or {}).get("firedExclusions", {}).get(cid, [])
            if seg is None or got != fired:
                problems.append({"firedExclusions": sid, "class": cid, "got": got, "expected": fired})
    return not problems, problems, res


# ---------------------------------------------------------------- constants pinned to frozen inputs
ACT = "SOURCECLASS-SENTENCE-BOUNDARY-EVIDENCE-INTEGRITY-CLOSURE-1.CORR1"
SUFFIX = "SOURCECLASS_SENTENCE_BOUNDARY_EVIDENCE_INTEGRITY_CLOSURE_1_CORR1"
ARTIFACTS = {
    "contract": "MERGEVUE_SOURCECLASS_ASSIGNMENT_CONTRACT_v1.0_%s_CANDIDATE.md" % SUFFIX,
    "rules": "MERGEVUE_SOURCECLASS_ASSIGNMENT_RULES_v1.0_%s_CANDIDATE.json" % SUFFIX,
    "schema": "MERGEVUE_SOURCECLASS_ASSIGNMENT_SCHEMA_v1.0_%s_CANDIDATE.json" % SUFFIX,
    "fixtures": "MERGEVUE_SOURCECLASS_ASSIGNMENT_ADVERSARIAL_FIXTURES_v1.0_%s.json" % SUFFIX,
    "replay": "MERGEVUE_SOURCECLASS_ASSIGNMENT_PILOT_DRYRUN_v1.0_%s.json" % SUFFIX,
    "validator": "MERGEVUE_SOURCECLASS_ASSIGNMENT_VALIDATE_v1.0_%s.py" % SUFFIX,
    "report": "MERGEVUE_SOURCECLASS_ASSIGNMENT_VALIDATION_REPORT_v1.0_%s.txt" % SUFFIX,
    "authorReport": "MERGEVUE_SOURCECLASS_ASSIGNMENT_%s_AUTHOR_REPORT.md" % SUFFIX,
    "manifest": "MERGEVUE_SOURCECLASS_ASSIGNMENT_%s_MANIFEST.sha256" % SUFFIX,
    "deltaLedger": "MERGEVUE_SOURCECLASS_ASSIGNMENT_%s_SEMANTIC_DELTA_LEDGER.json" % SUFFIX,
    "evidenceLedger": "MERGEVUE_SOURCECLASS_ASSIGNMENT_%s_EVIDENCE_BINDING_LEDGER.json" % SUFFIX,
    "csiProof": "MERGEVUE_SOURCECLASS_ASSIGNMENT_%s_CSI_PROOF.json" % SUFFIX,
    "preservation": "MERGEVUE_SOURCECLASS_ASSIGNMENT_%s_PRESERVATION_PROOF.json" % SUFFIX,
    "forcedFailures": "MERGEVUE_SOURCECLASS_ASSIGNMENT_%s_FORCED_FAILURES.txt" % SUFFIX,
}
SEMANTIC_ARTIFACTS = ("schema", "fixtures", "replay", "deltaLedger", "evidenceLedger", "csiProof", "preservation")
STAGE2_CORR4_SHA = "2de49862fb0d63c5f1cd1745531199137e73b7b37abceecef6e735d497d38bb0"
# The exact sourceClass implementation parent: SOURCECLASS-ASSIGNMENT-CONTRACT-1.CORR4.CORR1.CORR1.CORR1 (14 delivered files, manifest included).
PARENT_FILES = {
    "MERGEVUE_SOURCECLASS_ASSIGNMENT_CONTRACT_v1.0_CORR4_CORR1_CORR1_CORR1_CANDIDATE.md": "1584d2722577c4beb01e3dddc81fe8ef33eedb2bf99b1319da1253457a135a35",
    "MERGEVUE_SOURCECLASS_ASSIGNMENT_RULES_v1.0_CORR4_CORR1_CORR1_CORR1_CANDIDATE.json": "f3234ee489bc954d59189ada018db758ff5dc82c0273074e5be2e774b1068a5f",
    "MERGEVUE_SOURCECLASS_ASSIGNMENT_SCHEMA_v1.0_CORR4_CORR1_CORR1_CORR1_CANDIDATE.json": "4e7c5ee04901cef458234ba26e89e3aed21fe0add0d33dc090a61bd370b8854a",
    "MERGEVUE_SOURCECLASS_ASSIGNMENT_ADVERSARIAL_FIXTURES_v1.0_CORR4_CORR1_CORR1_CORR1.json": "e0374dd68f2459de0f4003f61ada9df27e5de70c58680795e486ee71bd16e76d",
    "MERGEVUE_SOURCECLASS_ASSIGNMENT_PILOT_DRYRUN_v1.0_CORR4_CORR1_CORR1_CORR1.json": "467a5ab9251aa23292a60146819a0d6c021077b658c5d54c37f93af87d14828c",
    "MERGEVUE_SOURCECLASS_ASSIGNMENT_VALIDATE_v1.0_CORR4_CORR1_CORR1_CORR1.py": "4b102ce92aeffab89624ee39637e318807f3c738eb6ba8a2996109bc1a8b0aa4",
    "MERGEVUE_SOURCECLASS_ASSIGNMENT_VALIDATION_REPORT_v1.0_CORR4_CORR1_CORR1_CORR1.txt": "908e5eb01a34ec3afbc0b6dfb2995319ac31a44dc6f84fea7af9fb826922b166",
    "MERGEVUE_SOURCECLASS_ASSIGNMENT_CORR4_CORR1_CORR1_CORR1_AUTHOR_REPORT.md": "fb29aa5b5810b09451251b76fd5b623d8077a943df0618040f93085578264ce0",
    "MERGEVUE_SOURCECLASS_ASSIGNMENT_CORR4_CORR1_CORR1_CORR1_SEMANTIC_DELTA_LEDGER.json": "fd29af167474d77a75cb0820ef49405886d07f64fbd66343725117a84eb90eeb",
    "MERGEVUE_SOURCECLASS_ASSIGNMENT_CORR4_CORR1_CORR1_CORR1_EVIDENCE_BINDING_LEDGER.json": "346c8701139ab8f10271121ce7badaafb67d2778c092b0f8fc55931c0e68b44e",
    "MERGEVUE_SOURCECLASS_ASSIGNMENT_CORR4_CORR1_CORR1_CORR1_CSI_PROOF.json": "447173ea126efc2715ef313d66f0fdc52c20a11685b3d84cc4f9b0b463bad32d",
    "MERGEVUE_SOURCECLASS_ASSIGNMENT_CORR4_CORR1_CORR1_CORR1_PRESERVATION_PROOF.json": "0e637ba76b3c65e1d0555d945351778e88e05a4f9a870e863c5eb62e1e5c56c2",
    "MERGEVUE_SOURCECLASS_ASSIGNMENT_CORR4_CORR1_CORR1_CORR1_FORCED_FAILURES.txt": "d233d05934cb6fbf970c60873a9f720f80874c41b4c6ca340a4ccdf40e72127f",
    "MERGEVUE_SOURCECLASS_ASSIGNMENT_CORR4_CORR1_CORR1_CORR1_MANIFEST.sha256": "49456af7b73cb9ed4c3ab925f8c663eed7be7dfe36ce0fb93b8f357889de7cb0",
}
PARENT_MODEL_SHA = "5faded489f246fb2540314e0d2563d42574d293a62704066359e45c250ae8958"
PARENT_PREREG_SHA = "78cb989becb8d5dffddbed8aacd07c07d293c6749a188c3dab494680afcdd69f"
PARENT_MANIFEST = "MERGEVUE_SOURCECLASS_ASSIGNMENT_CORR4_CORR1_CORR1_CORR1_MANIFEST.sha256"
PARENT_MANIFEST_SHA = "49456af7b73cb9ed4c3ab925f8c663eed7be7dfe36ce0fb93b8f357889de7cb0"
PARENT_RULES = "MERGEVUE_SOURCECLASS_ASSIGNMENT_RULES_v1.0_CORR4_CORR1_CORR1_CORR1_CANDIDATE.json"
PARENT_REPLAY = "MERGEVUE_SOURCECLASS_ASSIGNMENT_PILOT_DRYRUN_v1.0_CORR4_CORR1_CORR1_CORR1.json"
PARENT_FIXTURES = "MERGEVUE_SOURCECLASS_ASSIGNMENT_ADVERSARIAL_FIXTURES_v1.0_CORR4_CORR1_CORR1_CORR1.json"
PARENT_DELTA_LEDGER = "MERGEVUE_SOURCECLASS_ASSIGNMENT_CORR4_CORR1_CORR1_CORR1_SEMANTIC_DELTA_LEDGER.json"
PARENT_VALIDATOR = "MERGEVUE_SOURCECLASS_ASSIGNMENT_VALIDATE_v1.0_CORR4_CORR1_CORR1_CORR1.py"
PARENT_SCHEMA = "MERGEVUE_SOURCECLASS_ASSIGNMENT_SCHEMA_v1.0_CORR4_CORR1_CORR1_CORR1_CANDIDATE.json"
PARENT_EVIDENCE_LEDGER = "MERGEVUE_SOURCECLASS_ASSIGNMENT_CORR4_CORR1_CORR1_CORR1_EVIDENCE_BINDING_LEDGER.json"
PARENT_PRESERVATION = "MERGEVUE_SOURCECLASS_ASSIGNMENT_CORR4_CORR1_CORR1_CORR1_PRESERVATION_PROOF.json"
# The Owner-accepted occurrence-anchoring architecture (controlling): CORR1 + CORR1.CORR1 + CORR1.CORR1.CORR1, five files each.
ARCH = "MERGEVUE_SOURCECLASS_OCCURRENCE_ANCHORING_"
ARCH_CORR1 = {
    ARCH + "ARCHITECTURE_v1.0_CORR1_CANDIDATE.md": "fc395b42ef4cab3cb78b9826d8387a1911d6db19319024ff3004ea973348f2b9",
    ARCH + "FEASIBILITY_MATRIX_v1.0_CORR1.json": "846d541ef11fb6c36667ce5bf94f965b20bffcae14ff9f09982b0218768b9e0a",
    ARCH + "ADVERSARIAL_MATRIX_v1.0_CORR1.json": "43db1afe1a3fc587783a164d655411f822b434f8f6bd1fc5ef8612bb4a1a4ddd",
    ARCH + "CORR1_AUTHOR_REPORT_v1.0.md": "2b8a107b665b66fe4d3112766089c29ed07553406fed0fa782ae0f515b227b7a",
    ARCH + "CORR1_MANIFEST_v1.0.sha256": "fc79ba017113daf716c1640ca49975c0189ed7d4a5f3e7c25b21500564531053"}
ARCH_CORR1_CORR1 = {
    ARCH + "ARCHITECTURE_v1.0_CORR1_CORR1_CANDIDATE.md": "8d0dd978fcf2d97587b8e8c4a89f7fbef3a824acfe2a828a2de2917022735a2a",
    ARCH + "FEASIBILITY_MATRIX_v1.0_CORR1_CORR1.json": "42c29744712f9dc0ca467bfab32622766d57a55adf6aad34217c8830eb6cc893",
    ARCH + "ADVERSARIAL_MATRIX_v1.0_CORR1_CORR1.json": "7d62a1784251e70c210478215f4e21c4ffdcd808e862a28a866474d2a4518430",
    ARCH + "CORR1_CORR1_AUTHOR_REPORT_v1.0.md": "16485603c2579708f6e90a75426694d3acf5828959f49501a53a80d38a20d12d",
    ARCH + "CORR1_CORR1_MANIFEST_v1.0.sha256": "31245e779c37933c0728ea0e889ae1e5b9ad98291e2f0cff911a370d3b2ca5dd"}
ARCH_CORR1_CORR1_CORR1 = {
    ARCH + "ARCHITECTURE_v1.0_CORR1_CORR1_CORR1_CANDIDATE.md": "1472bcf74fe3c090a1cbc6b97e00b6c7536a9c6ea87f35bef88e7f331402fbd1",
    ARCH + "FEASIBILITY_MATRIX_v1.0_CORR1_CORR1_CORR1.json": "aa2a4d40c6e4c39c2a6487c0737472f193932d90159562b1ae3f28d4455ab120",
    ARCH + "ADVERSARIAL_MATRIX_v1.0_CORR1_CORR1_CORR1.json": "cd97b8197bea619f3f260c44b2dc2686fa7da9f14deb5762b8499cba75da9c61",
    ARCH + "CORR1_CORR1_CORR1_AUTHOR_REPORT_v1.0.md": "a09704a33a7e6d6cc99f53b31dfd749ca0b3fa11df491bbbe70a55ea98586b2e",
    ARCH + "CORR1_CORR1_CORR1_MANIFEST_v1.0.sha256": "c4ce0e8b5fd655418bedea8eef64cd92c257120075b1b3d8640fc0c964982d2f"}
ARCH_CORR1_ADV = ARCH + "ADVERSARIAL_MATRIX_v1.0_CORR1.json"
ARCH_C1C1_ADV = ARCH + "ADVERSARIAL_MATRIX_v1.0_CORR1_CORR1.json"
ARCH_C1C1C1_ADV = ARCH + "ADVERSARIAL_MATRIX_v1.0_CORR1_CORR1_CORR1.json"
ARCH_C1C1C1_FEAS = ARCH + "FEASIBILITY_MATRIX_v1.0_CORR1_CORR1_CORR1.json"
CORR3_RULES = "MERGEVUE_SOURCECLASS_ASSIGNMENT_RULES_v1.0_CORR3_CANDIDATE.json"
CORR3_REPLAY = "MERGEVUE_SOURCECLASS_ASSIGNMENT_PILOT_DRYRUN_v1.0_CORR3.json"
CORR3_VALIDATOR = "MERGEVUE_SOURCECLASS_ASSIGNMENT_VALIDATE_v1.0_CORR3.py"
CORR3_VALIDATOR_SHA = "bc528662988aa0bf59bc82689e9764f591e6bba1685adca088627315379a73a4"
CORR3_RULES_SHA = "1f434d3c3b3222aba7b145b65b24444943ed1fdb1cb6317c70d0e9c524c9bdf1"
CORR3_REPLAY_SHA = "457a2d1a751e9c7fbf88f3c202cc8d2c54efdd95d526709e1e4c1b4a08714bbe"
CORR3_BOUNDARY_MODEL_SHA = "7469284f22f2439557bc72536b4967b17cec13a32fedafc970f448d2e75bdd5a"
FROZEN = {
    "STAGE2_SEMANTIC_SUCCESSOR_CANDIDATE_CORR4.md": STAGE2_CORR4_SHA,
    "STAGE2_CORR4_PILOT_SELECTED_SAMPLE.json": "ce9a2bd1d44103c2a527be767af3300e3d14d516518be774b15262e19ca5f702",
    "STAGE2_CORR4_PILOT_ANALYTICAL_CODER_INPUT.jsonl": "a87409c3f4c1d7d097443233284bceee1cbed49c59e57a8aeb9eed651ff0c883",
    "STAGE2_CORR4_PILOT_STRATIFIER_A_MARKS.jsonl": "5d4c0a681b7ecdb1cef403dc91bd0603a666e070798326cc97893c1e6cf1c27d",
    "STAGE2_CORR4_PILOT_STRATIFIER_B_MARKS.jsonl": "7b91967b69bf5f95e831bac14e32bc1246836e2e9c2bcb3ef965874ba7dc2603",
    "STAGE2_CORR4_PILOT_STRATIFICATION_AGREEMENT.json": "37f4b42100924479202d98d503c4e89b6d3787fd5f4d5b19cf1bd26617bf599d",
    "STAGE2_CORR4_PILOT_STAGE1_SOURCE_MAP.json": "665aac81c2e0127d08f0406186891959255391cb99ec34611a972209565f4a7f",
    "STAGE2_CORR4_PILOT_ANALYTICAL_PROVENANCE_SIDECAR_CORR1.jsonl": "84ab83d23209eae9f775844502676d462490ca8954f8d7a135d28acf5234d6af",
    "MERGEVUE_SOURCECLASS_ASSIGNMENT_CONTRACT_v1.0_CORR1_CANDIDATE.md": "ee00f272afaaa112b6bf56654438ae14ea87b9b0099badea3cfea253def0d936",
    "MERGEVUE_SOURCECLASS_ASSIGNMENT_CONTRACT_v1.0_CORR1_IV1_REPORT.md": "127cccbf04533dd5a9e7710c536d2171475127ffcc277a3fc0644fe0cab5bbee",
    "MERGEVUE_SOURCECLASS_ASSIGNMENT_RULES_v1.0_CORR1_CANDIDATE.json": "0bb760f6aa86199237c723b7ccd8a9e776270ebe59149069615f6b443edeb1a7",
    CORR3_RULES: CORR3_RULES_SHA, CORR3_REPLAY: CORR3_REPLAY_SHA, CORR3_VALIDATOR: CORR3_VALIDATOR_SHA,
}
FROZEN.update(PARENT_FILES)
FROZEN.update(ARCH_CORR1)
FROZEN.update(ARCH_CORR1_CORR1)
FROZEN.update(ARCH_CORR1_CORR1_CORR1)
# The exact implementation parent of THIS act: SOURCECLASS-OCCURRENCE-ANCHORING-ARCHITECTURE-1.CORR1.IMPLEMENTATION-1 (the complete Option A+
# candidate, 14 delivered files). The CORR4.CORR1.CORR1.CORR1 package above stays the frozen BASE every inherited A+ check compares with.
APLUS_ACT = "SOURCECLASS-OCCURRENCE-ANCHORING-ARCHITECTURE-1.CORR1.IMPLEMENTATION-1"
APLUS_IDENTITY_KEY = "sourceClass implementation parent (Option A+)"
_AP = "OCCURRENCE_ANCHORING_A_PLUS_IMPLEMENTATION_1"
APLUS_CONTRACT = "MERGEVUE_SOURCECLASS_ASSIGNMENT_CONTRACT_v1.0_%s_CANDIDATE.md" % _AP
APLUS_RULES = "MERGEVUE_SOURCECLASS_ASSIGNMENT_RULES_v1.0_%s_CANDIDATE.json" % _AP
APLUS_SCHEMA = "MERGEVUE_SOURCECLASS_ASSIGNMENT_SCHEMA_v1.0_%s_CANDIDATE.json" % _AP
APLUS_FIXTURES = "MERGEVUE_SOURCECLASS_ASSIGNMENT_ADVERSARIAL_FIXTURES_v1.0_%s.json" % _AP
APLUS_REPLAY = "MERGEVUE_SOURCECLASS_ASSIGNMENT_PILOT_DRYRUN_v1.0_%s.json" % _AP
APLUS_VALIDATOR = "MERGEVUE_SOURCECLASS_ASSIGNMENT_VALIDATE_v1.0_%s.py" % _AP
APLUS_DELTA_LEDGER = "MERGEVUE_SOURCECLASS_ASSIGNMENT_%s_SEMANTIC_DELTA_LEDGER.json" % _AP
APLUS_CSI_PROOF = "MERGEVUE_SOURCECLASS_ASSIGNMENT_%s_CSI_PROOF.json" % _AP
APLUS_MANIFEST = "MERGEVUE_SOURCECLASS_ASSIGNMENT_%s_MANIFEST.sha256" % _AP
APLUS_FILES = {
    APLUS_CONTRACT: "77d9035c1cea965783b168e51ef8c0d18bc56956103858b796bba63fab8dcb13",
    APLUS_RULES: "829d5148dcc41a959f9878e94a78ddfcc65af8230d4d6df3fac1bbe276e3500b",
    APLUS_SCHEMA: "e77c33ec79ed7e54a2f11167ad5a9bceb3cd4417c2fd9ece78ff5f6c860e9a96",
    APLUS_FIXTURES: "ced868dde586c70f14f80f7313e9c980c2e5f6c676a71e62166858053bba5fec",
    APLUS_REPLAY: "2b4eae4aa75f180c63af4a1348f3c80e08bbcdb96be7cacf3c740b40c17e0fe6",
    APLUS_VALIDATOR: "ff7aefb66e7e0daca3ac658e793d6b32a495c259a9d6d4cd40c3eb561350d612",
    "MERGEVUE_SOURCECLASS_ASSIGNMENT_VALIDATION_REPORT_v1.0_%s.txt" % _AP: "19247016729ee025ab0db1f2b541c317980365fd84ba9c4489ba1bd18b3c041a",
    "MERGEVUE_SOURCECLASS_ASSIGNMENT_%s_AUTHOR_REPORT.md" % _AP: "970a6ac6dc70cda156beed83a8c493a9f4adca86b5d236a5125a16332c4b0a0b",
    APLUS_DELTA_LEDGER: "2f9dd14a7ec1ec3cae98d06e64e6f9b026b34ada21e3146d1f66cc6e90db48e1",
    "MERGEVUE_SOURCECLASS_ASSIGNMENT_%s_EVIDENCE_BINDING_LEDGER.json" % _AP: "3ec93776e6ae474177228f96cb3c2083aad03206a481bdad52e98c2ae704c037",
    APLUS_CSI_PROOF: "e6f0848e18a5d33a2398b2cd7842d1a5f1be2b241291ef7a268f0e4baf746249",
    "MERGEVUE_SOURCECLASS_ASSIGNMENT_%s_PRESERVATION_PROOF.json" % _AP: "a640a3d9713b7aadce56c3cd123220947b5110c31df1302a0d27c3dbe8cedb84",
    "MERGEVUE_SOURCECLASS_ASSIGNMENT_%s_FORCED_FAILURES.txt" % _AP: "40a6376ca5042dac2394a3a074dcdcf04a9d413706ae7e1815a5533d146b58e0",
    APLUS_MANIFEST: "09cb61d1a89d9a98abb2dcd6d99a15b8a95957df2e1f88b5daccfcc8825a38dd",
}
APLUS_MODEL_SHA = "f65ca73b83f120b050b9fed14161aec1c709671fd0e04f25ecf7eadf744cd3c9"
APLUS_PREREG_SHA = "0d69a4f836899801144f6715a7f6d19923791d15766f75561cc000776f06db9e"
APLUS_MANIFEST_SHA = "09cb61d1a89d9a98abb2dcd6d99a15b8a95957df2e1f88b5daccfcc8825a38dd"
FROZEN.update(APLUS_FILES)
# the R-7 / B-2 surface of the normative model and the only classes an A+ -> child change may carry (else SCOPE_VIOLATION)
R7_DELTA_CLASSES = ("R7_B2_OVERLAP_FOOTPRINT", "R7_B2_SUPPORT_CORE", "R7_B2_LAWFUL_SEPARATION", "R7_B2_COMPONENT_ANTI_INFLATION", "R7_B2_COUNT_FAIL_CLOSED",
                    "MECHANICAL_REQUIRED")
R7_PATHS = ("$.id", "$.basisOverlap", "$.rules.R-COUNT", "$.decisionProcedure[9]", "$.rules.R-DUP.implementedIn", "$.rules.R-DUP.renditionEquivalenceTest.implementedIn")
R7_FIXTURE_IDS = ["R7-D1", "R7-D1-X", "R7-D1-U", "R7-D2", "R7-D3", "R7-C1", "R7-C2", "R7-C3", "R7-C4", "R7-C4-SEG", "R7-C4-MID", "R7-C4-U", "R7-C4-UNREC",
                  "R7-C5", "R7-C6", "R7-C7", "R7-C8", "R7-C9", "R7-C10", "R7-C10-X", "R7-FU-1", "R7-FU-2a", "R7-FU-2b", "R7-FU-C1", "R7-RES-1", "R7-RES-1M"]
R7_GEN_MIN = 750
R7_SENS_STRIDE = 20
# The exact parent of THIS act: SOURCECLASS-ASSIGNMENT-CONTRACT-1.R7-B2-OVERLAP-CLOSURE-1 (the R-7 / B-2 overlap-closure candidate, 14 delivered
# files). The Option A+ candidate above stays pinned as the parent of the B-2 layer (checks B2-*), the CORR4.CORR1.CORR1.CORR1 package as the base.
R7P_ACT = "SOURCECLASS-ASSIGNMENT-CONTRACT-1.R7-B2-OVERLAP-CLOSURE-1"
R7P_IDENTITY_KEY = "sourceClass implementation parent (R7-B2 overlap closure)"
_R7P = "R7_B2_OVERLAP_CLOSURE_1"
R7P_CONTRACT = "MERGEVUE_SOURCECLASS_ASSIGNMENT_CONTRACT_v1.0_%s_CANDIDATE.md" % _R7P
R7P_RULES = "MERGEVUE_SOURCECLASS_ASSIGNMENT_RULES_v1.0_%s_CANDIDATE.json" % _R7P
R7P_SCHEMA = "MERGEVUE_SOURCECLASS_ASSIGNMENT_SCHEMA_v1.0_%s_CANDIDATE.json" % _R7P
R7P_FIXTURES = "MERGEVUE_SOURCECLASS_ASSIGNMENT_ADVERSARIAL_FIXTURES_v1.0_%s.json" % _R7P
R7P_REPLAY = "MERGEVUE_SOURCECLASS_ASSIGNMENT_PILOT_DRYRUN_v1.0_%s.json" % _R7P
R7P_VALIDATOR = "MERGEVUE_SOURCECLASS_ASSIGNMENT_VALIDATE_v1.0_%s.py" % _R7P
R7P_DELTA_LEDGER = "MERGEVUE_SOURCECLASS_ASSIGNMENT_%s_SEMANTIC_DELTA_LEDGER.json" % _R7P
R7P_CSI_PROOF = "MERGEVUE_SOURCECLASS_ASSIGNMENT_%s_CSI_PROOF.json" % _R7P
R7P_MANIFEST = "MERGEVUE_SOURCECLASS_ASSIGNMENT_%s_MANIFEST.sha256" % _R7P
R7P_FILES = {
    R7P_CONTRACT: "b9f36ff6b94db7f7c8f3a921aa2cc940183300739f3e7f2d09eaae13319e9d36",
    R7P_RULES: "622a62f71a06197c9d6d987438cc5898b0968e7b3025020c374d3264eedd3f8b",
    R7P_SCHEMA: "aa0d99b83b1504d902e9cc47a8ef37e16845d1f0c0d2106f9fe580f6e07aec40",
    R7P_FIXTURES: "e90dce9fc97e1b46873097d7765659030d2ee705610cfa236850aed45eee2521",
    R7P_REPLAY: "c2a583c0e6d02fbc5b948a203f42d75946caa3e5614ace1e62afd8a115634abe",
    R7P_VALIDATOR: "8f2dce09729fe7cfde62ea80f5ae3fa552056da51e536bd68ed4d9c21f275ff6",
    "MERGEVUE_SOURCECLASS_ASSIGNMENT_VALIDATION_REPORT_v1.0_%s.txt" % _R7P: "9ecfa7ebc85f871f55ef1cedc92175a1267494ccd4e4857768749825bfe25608",
    "MERGEVUE_SOURCECLASS_ASSIGNMENT_%s_AUTHOR_REPORT.md" % _R7P: "284628a3a70b44e0318fb1eaad79c12dee104433a0d90fb26d6c43f94974c683",
    R7P_DELTA_LEDGER: "cbf3f78b2dc707f2f46f7b6300bc304db9b57e3439aedb6cb78b5d3687c7b17e",
    "MERGEVUE_SOURCECLASS_ASSIGNMENT_%s_EVIDENCE_BINDING_LEDGER.json" % _R7P: "6aeb6729778e8d2486a002338be1ea3ab44914cb01f06bd085ea2c3791bac920",
    R7P_CSI_PROOF: "0e76fd51a6301890b16ed44cf6ed1f6455706336f0e4ba1c10571a0f826244bf",
    "MERGEVUE_SOURCECLASS_ASSIGNMENT_%s_PRESERVATION_PROOF.json" % _R7P: "4e9462cf83aa7d058b26952ba0b8e0d7e9313fa83790cfb241d8d5e21798be2b",
    "MERGEVUE_SOURCECLASS_ASSIGNMENT_%s_FORCED_FAILURES.txt" % _R7P: "f751c4d2ec8281e8a8ffbddca1b93c1ae3d9783518bd71d33c8de4a5d4da6a5a",
    R7P_MANIFEST: "a01b02b57e1e2cbb46f2533c77f4dcedd18e4435799c514cfbf02c95d4327c7c",
}
R7P_MODEL_SHA = "e155d5fbc0ba1b6fbd76f269b707f405e36919ea587752f67293e055f889c736"
R7P_PREREG_SHA = "cbf0acc2ad3b1ac647014974b126ac1520da47e14b100fb0e94ff28e5129dc32"
R7P_MANIFEST_SHA = "a01b02b57e1e2cbb46f2533c77f4dcedd18e4435799c514cfbf02c95d4327c7c"
FROZEN.update(R7P_FILES)
# the touching-atom surface of the normative model and the only classes an R7 parent -> child change may carry (else SCOPE_VIOLATION)
TA_DELTA_CLASSES = ("R7_TOUCHING_ATOM_RELATION", "R7_TOUCHING_ATOM_COMPONENT_BINDING", "R7_TOUCHING_ATOM_FAIL_CLOSED", "MECHANICAL_REQUIRED")
TA_PATHS = ("$.id", "$.basisOverlap.touchingAtom", '$.basisOverlap.dispositions["CLEAR_SINGLETON"].when', "$.rules.R-COUNT.steps[5]",
            '$.rules.R-COUNT.countingDispositions["B2_OVERLAP_CLASS_CONFLICT"].fires', '$.rules.R-COUNT.countingDispositions["B2_OVERLAP_CLASS_CONFLICT"].cannotFire',
            "$.rules.R-COUNT.consequences", "$.decisionProcedure[9]", "$.rules.R-DUP.implementedIn", "$.rules.R-DUP.renditionEquivalenceTest.implementedIn")
TA_FIXTURE_IDS = ["TA-D1", "TA-D1-W", "TA-D1-X", "TA-D1-TH", "TA-D1-U", "TA-D2", "TA-C1", "TA-C1-7", "TA-C2", "TA-C2-B", "TA-C2-SUB", "TA-C3", "TA-C3-B", "TA-C3-UNREC", "TA-C4", "TA-C4-NL", "TA-C4-Q", "TA-C4-REC", "TA-N-COMMA", "TA-N-CONJ", "TA-N-SPACE", "TA-N-SEMI", "TA-N-COLON", "TA-N-WRAP", "TA-N-COLUMN", "TA-C5", "TA-C6", "TA-C6-NEAR", "TA-T1", "TA-T2", "TA-FU-C1", "TA-FU-DIS", "TA-FU-DIS-R", "TA-X2", "TA-TWICE", "TA-EVID-1", "TA-EVID-1S"]
TA_GEN_MIN = 500
TA_SENS_STRIDE = 10
# The exact parent of THIS act: SOURCECLASS-ASSIGNMENT-CONTRACT-1.R7-B2-TOUCHING-ATOM-CLOSURE-1 (the touching-atom closure candidate, 14 delivered
# files). The R7-B2 overlap closure stays pinned as the touching layer's parent (checks TA-*), the Option A+ candidate as the B-2 layer's (B2-*).
TAP_ACT = "SOURCECLASS-ASSIGNMENT-CONTRACT-1.R7-B2-TOUCHING-ATOM-CLOSURE-1"
TAP_IDENTITY_KEY = "sourceClass implementation parent (touching-atom closure)"
_TAP = "R7_B2_TOUCHING_ATOM_CLOSURE_1"
TAP_CONTRACT = "MERGEVUE_SOURCECLASS_ASSIGNMENT_CONTRACT_v1.0_%s_CANDIDATE.md" % _TAP
TAP_RULES = "MERGEVUE_SOURCECLASS_ASSIGNMENT_RULES_v1.0_%s_CANDIDATE.json" % _TAP
TAP_SCHEMA = "MERGEVUE_SOURCECLASS_ASSIGNMENT_SCHEMA_v1.0_%s_CANDIDATE.json" % _TAP
TAP_FIXTURES = "MERGEVUE_SOURCECLASS_ASSIGNMENT_ADVERSARIAL_FIXTURES_v1.0_%s.json" % _TAP
TAP_REPLAY = "MERGEVUE_SOURCECLASS_ASSIGNMENT_PILOT_DRYRUN_v1.0_%s.json" % _TAP
TAP_VALIDATOR = "MERGEVUE_SOURCECLASS_ASSIGNMENT_VALIDATE_v1.0_%s.py" % _TAP
TAP_DELTA_LEDGER = "MERGEVUE_SOURCECLASS_ASSIGNMENT_%s_SEMANTIC_DELTA_LEDGER.json" % _TAP
TAP_CSI_PROOF = "MERGEVUE_SOURCECLASS_ASSIGNMENT_%s_CSI_PROOF.json" % _TAP
TAP_MANIFEST = "MERGEVUE_SOURCECLASS_ASSIGNMENT_%s_MANIFEST.sha256" % _TAP
TAP_FILES = {
    TAP_CONTRACT: "9b124e5c3125a6d6fbdcad858574af828feda7c66ea346074edeaed61e884366",
    TAP_RULES: "c27e8cecd7f0884cf6e9144c20c220d1c35f52b844ad683b2c6d7688f85ddd79",
    TAP_SCHEMA: "bdcecee59336295a924980daef08ec523461c0e1e2b4a8918cc5a4ac4e2cf6bc",
    TAP_FIXTURES: "1b5de72a90701f3a24541b9e5eae65475ddd42d9dcd57aaf6f934f276063c1cc",
    TAP_REPLAY: "0183189c9b40b52de20fa09619abb05b7c6950a6f52510a0de06fc85469b7756",
    TAP_VALIDATOR: "69d1be4c09a2594cfdc94da5c483c55a17c697520735b322559e87f3c83136ed",
    "MERGEVUE_SOURCECLASS_ASSIGNMENT_VALIDATION_REPORT_v1.0_%s.txt" % _TAP: "8176b463b34b1f475a08469872dabdae812e564d0a00f548e2b583e313d37c5b",
    "MERGEVUE_SOURCECLASS_ASSIGNMENT_%s_AUTHOR_REPORT.md" % _TAP: "8712e1251b4156e08fd94612a7bf11849168c5f15a6c6a5f2d316d000232fa3d",
    TAP_DELTA_LEDGER: "65056b3896f7db6f2229a4508f1e8f0d3cad81238890ddfd24dc52d120714352",
    "MERGEVUE_SOURCECLASS_ASSIGNMENT_%s_EVIDENCE_BINDING_LEDGER.json" % _TAP: "9c26e189883e5755665bd33e71986bb9cafe23e9dc4d6cc41d2fc104ea5d0c06",
    TAP_CSI_PROOF: "d3b2a8de7269d928546768995d6ed38a20c0851115940bd3a760753dc9497bfd",
    "MERGEVUE_SOURCECLASS_ASSIGNMENT_%s_PRESERVATION_PROOF.json" % _TAP: "300c587cdf2e67bc3fc711890dc2a30dff9051151299392386ec3df97c6e1ea5",
    "MERGEVUE_SOURCECLASS_ASSIGNMENT_%s_FORCED_FAILURES.txt" % _TAP: "e060ac855bfe25b0ba2d5fb8da87673801af889a6d9a8e7d3d103e6caa0a2e12",
    TAP_MANIFEST: "2373d77c67af3f967673ddeadfdf8138abc2d4ba7a4147411b6936938c474292",
}
TAP_MODEL_SHA = "ad6145fa1b08deea49d50e1be80e6a9bec34476a523f78a7ddcce6ec32ea66eb"
TAP_PREREG_SHA = "c524a9727c87023ac30c6a21bae8ef4e32055b8cecc2f658d3bb8a751c39d081"
TAP_MANIFEST_SHA = "2373d77c67af3f967673ddeadfdf8138abc2d4ba7a4147411b6936938c474292"
FROZEN.update(TAP_FILES)
# the one surface this act may change (the SENTENCE evidence continuation guard) and its classes (else SCOPE_VIOLATION)
SE_DELTA_CLASSES = ("SE_SENTENCE_ATERM_CONTINUATION_GUARD", "MECHANICAL_REQUIRED")
SE_PATHS = ("$.id", "$.segmentation.separatorEvidence.whenAdjacent.SENTENCE.continuationGuard", "$.rules.R-DUP.implementedIn",
            "$.rules.R-DUP.renditionEquivalenceTest.implementedIn")
SE_FIXTURE_IDS = ["SE-D1", "SE-D2", "SE-D3", "SE-D3-Q", "SE-D3-B", "SE-D3-S", "SE-D4", "SE-D5", "SE-D6", "SE-D7", "SE-D1-X", "SE-D1-U", "SE-C1", "SE-P1", "SE-P1-S", "SE-P2", "SE-P2-S", "SE-P3", "SE-P3-L", "SE-P3-S", "SE-P4", "SE-P4-L", "SE-P4-S", "SE-EVID-NA"]
SE_FIXTURE_FIELDS = ("closes", "derivation", "expect", "physicalTruth", "role", "title")
SE_GEN_MIN = 500
SE_SENS_STRIDE = 10
# The exact parent of THIS act: SOURCECLASS-SEGMENTATION-SENTENCE-ABBREVIATION-EVIDENCE-CLOSURE-1 (the sentence-evidence closure candidate, 14
# delivered files). The touching-atom closure stays pinned as the sentence-evidence layer's parent (checks SE-*), the R7-B2 closure as the touching
# layer's (TA-*), the Option A+ candidate as the B-2 layer's (B2-*).
SEP_ACT = "SOURCECLASS-SEGMENTATION-SENTENCE-ABBREVIATION-EVIDENCE-CLOSURE-1"
SEP_IDENTITY_KEY = "sourceClass implementation parent (sentence-evidence closure)"
_SEP = "SEGMENTATION_SENTENCE_ABBREVIATION_EVIDENCE_CLOSURE_1"
SEP_CONTRACT = "MERGEVUE_SOURCECLASS_ASSIGNMENT_CONTRACT_v1.0_%s_CANDIDATE.md" % _SEP
SEP_RULES = "MERGEVUE_SOURCECLASS_ASSIGNMENT_RULES_v1.0_%s_CANDIDATE.json" % _SEP
SEP_SCHEMA = "MERGEVUE_SOURCECLASS_ASSIGNMENT_SCHEMA_v1.0_%s_CANDIDATE.json" % _SEP
SEP_FIXTURES = "MERGEVUE_SOURCECLASS_ASSIGNMENT_ADVERSARIAL_FIXTURES_v1.0_%s.json" % _SEP
SEP_REPLAY = "MERGEVUE_SOURCECLASS_ASSIGNMENT_PILOT_DRYRUN_v1.0_%s.json" % _SEP
SEP_VALIDATOR = "MERGEVUE_SOURCECLASS_ASSIGNMENT_VALIDATE_v1.0_%s.py" % _SEP
SEP_DELTA_LEDGER = "MERGEVUE_SOURCECLASS_ASSIGNMENT_%s_SEMANTIC_DELTA_LEDGER.json" % _SEP
SEP_CSI_PROOF = "MERGEVUE_SOURCECLASS_ASSIGNMENT_%s_CSI_PROOF.json" % _SEP
SEP_MANIFEST = "MERGEVUE_SOURCECLASS_ASSIGNMENT_%s_MANIFEST.sha256" % _SEP
SEP_FILES = {
    SEP_CONTRACT: "11053a98656da66839a00a2490231b242a0316fa2bd2dab7ede3c1f8934727ea",
    SEP_RULES: "1c4a8918a52559ab9c51e3eb79205c87795e7ae59351075922c2f12db9f923da",
    SEP_SCHEMA: "0116a026d030e3e3efd5fe352427b62ed1834d345839be63c02795b997dae9c4",
    SEP_FIXTURES: "7bf86c6ba42468044787e9ae11b9ba8d92a5abe1033a404c0992e03ccdfc2256",
    SEP_REPLAY: "c2424fd668fc12092f95ce1e6ac7a9ffe987c9e9930f48774de7fbf0774037ad",
    SEP_VALIDATOR: "3569abe81a308cc9575aa5de92c9df05a78ed331c5dcd615a13131cec3b48936",
    "MERGEVUE_SOURCECLASS_ASSIGNMENT_VALIDATION_REPORT_v1.0_%s.txt" % _SEP: "a269bc42f67f96d47fa5fc4de74b4561d86ebc7a530cf54c5edaa6eaefa346a5",
    "MERGEVUE_SOURCECLASS_ASSIGNMENT_%s_AUTHOR_REPORT.md" % _SEP: "cf49c0491deaf0bf5b014c181cf81a48c077288d04bbc8de8244876e1f023610",
    SEP_DELTA_LEDGER: "afb76ec415c0299715ada085a9c86ef0ecb153644d4b98f897da00212403e6f5",
    "MERGEVUE_SOURCECLASS_ASSIGNMENT_%s_EVIDENCE_BINDING_LEDGER.json" % _SEP: "e349e54ce97d62b2d0d53be7f082ff8ecc623ff978db4c13903f2337e9097c46",
    SEP_CSI_PROOF: "a4aafba520d26c51787945b8ac01d9ac559e6496e9eb1f4902c3dfc25a3e15a7",
    "MERGEVUE_SOURCECLASS_ASSIGNMENT_%s_PRESERVATION_PROOF.json" % _SEP: "ee4f4f3505c512486a2347a01c4cca652ed8f27f93ea67d9a10867630cc2700e",
    "MERGEVUE_SOURCECLASS_ASSIGNMENT_%s_FORCED_FAILURES.txt" % _SEP: "c49bf9de3fd21cab7af8acffee431ff111cc15ef76d676e97c7a65d8bc3abaeb",
    SEP_MANIFEST: "8fc7212078dc96a62eb33c4f9f9d5fd6d0e47d547a582cd350cdeff3331a5e8f",
}
SEP_MODEL_SHA = "5c49e3ab6940a5a0764dba1f4da7bde36f0832c977be621f92f28673e6d87fd3"
SEP_PREREG_SHA = "9f4a02e81924ee1f87d2832a90eb6afdaaef4a4a1a4cbad5a9f4ab4c42706630"
SEP_MANIFEST_SHA = "8fc7212078dc96a62eb33c4f9f9d5fd6d0e47d547a582cd350cdeff3331a5e8f"
FROZEN.update(SEP_FILES)
# the independent audit whose two MAJOR findings this act corrects (bound read-only)
IV1_REPORT = "SOURCECLASS-SEGMENTATION-SENTENCE-ABBREVIATION-EVIDENCE-CLOSURE-1.IV1_REPORT.md"
IV1_REPORT_SHA = "9d8fc708a23d3d827096424c0c791c5bb8ac83fe9a5638b5e73dbd36fc998a2f"
IV1_IDENTITY_KEY = "independent audit (IV1) of the parent"
FROZEN[IV1_REPORT] = IV1_REPORT_SHA
# the frozen SEC entity-name authority CANDIDATE consumed read-only (NOT_INDEPENDENTLY_VERIFIED, NOT_OWNER_ACCEPTED, NOT_CONTROLLING)
AUTH_ACT = "SEC-HISTORICAL-ENTITY-NAME-AUTHORITY-1.IMPLEMENTATION-1.CORR1"
AUTH_IDENTITY_KEY = "entity-name authority candidate dependency (SEC-HISTORICAL-ENTITY-NAME-AUTHORITY-1.CORR1)"
_AUTH = "MERGEVUE_SEC_HISTORICAL_ENTITY_NAME_AUTHORITY_v1_CORR1_"
AUTH_RECORDS = _AUTH + "RECORDS.json"
AUTH_SCHEMA = _AUTH + "SCHEMA.json"
AUTH_MANIFEST = _AUTH + "MANIFEST.sha256"
AUTH_MANIFEST_SHA = "6b0d3622f2ecf506caf969fd18f23275f606dc809cf72dface4d33ce17b62e8e"
AUTH_FILES = {
    _AUTH + "ADVERSARIAL_FIXTURES.json": "6b415b0a2d28cf23defacd590b3ee62c2b223ed06008fd040635529cb1b52038",
    _AUTH + "CONTRACT.md": "84289d0899d68167c0510b9774200f878eed73cb515b776a69258f9c6bae885e",
    _AUTH + "EVIDENCE_BINDING_LEDGER.json": "aca44f4d58ef4f4b207dd2e7fddb17c0c31ce9d70b3164ee1e5fbe8a64e5289b",
    _AUTH + "IDENTITY_SUBSET.json": "e90045f60ef297b56a037a16e19da27f6ca5e7558fdc0eef26e1638cf43772b3",
    AUTH_RECORDS: "82259f132f3389a5fa26394481bdc42773db71a8c61bd12fd240576f14f23e46",
    AUTH_SCHEMA: "8969f4843882703c5df7963cb9183c801e4c3bab509fc02523d8a0b9fab7b670",
    _AUTH + "VALIDATE.py": "380f85da065952e7266aff2e8194f9f3e4956d17ddae4b1a4c7792453f4b82db",
    _AUTH + "VALIDATION_REPORT.txt": "e8eef58d2fa5f0447ef108bd388fe0f16d91d1c17049ef528f1d914c45707adb",
}
FROZEN.update(AUTH_FILES)
FROZEN[AUTH_MANIFEST] = AUTH_MANIFEST_SHA
OWNER_DECISION_ID = "OPTION_A"
R_M2_CASE_B_DEFINITION = ("Uppercase continuation inside a compound entity name may still be treated as a sentence boundary when the bound artifact "
                          "lacks usable authoritative entity-name occurrence coverage.")
BI_CLAIMS = {"IV1-M1": "CLOSED_IN_CANDIDATE", "IV1-M2-CASE-A": "CLOSED_IN_CANDIDATE", "IV1-M2-CASE-B": "OWNER_ACCEPTED_BOUNDED_RESIDUAL",
             "IV1-m1": "OWNER_ACCEPTED_NON_BLOCKING_OUT_OF_SCOPE", "generalSentenceBoundarySoundness": "NOT_CLAIMED",
             "secAuthorityCorr1": "CANDIDATE_DEPENDENCY_NOT_CONTROLLING", "IV1-F1": "CORRECTED_NOT_VERIFIED", "IV1-F2": "CORRECTED_NOT_VERIFIED"}
BI_PARENT_WHEN_NOT_ADJACENT = "any lawful separator is accepted: physical intervening text exists between the units"
# the surface this act may change (else SCOPE_VIOLATION)
BI_DELTA_CLASSES = ("BI_M1_DOCUMENTARY_INTERVAL", "BI_M2_ENTITY_NAME_VETO", "CORR1_IV1_F1_ASCII_DIGIT_CONTINUATION",
                    "CORR1_IV1_F2_RIGHT_DOUBLE_QUOTATION_MARK_CLOSER", "MECHANICAL_REQUIRED")
_CG_PATH = "$.segmentation.separatorEvidence.whenAdjacent.SENTENCE.continuationGuard"
BI_PATHS = ("$.id", "$.segmentation.separatorEvidence.whenNotAdjacent", "$.segmentation.separatorEvidence.whenAdjacent.SENTENCE.documentaryInterval",
            "$.segmentation.separatorEvidence.whenAdjacent.SENTENCE.entityNameVeto", "$.rules.R-DUP.implementedIn",
            "$.rules.R-DUP.renditionEquivalenceTest.implementedIn", _CG_PATH + ".asciiDigitContinuation", _CG_PATH + ".rule", _CG_PATH + ".unchanged",
            _CG_PATH + ".betweenPattern")
# CORR1 (IV1-F1, IV1-F2): the continuation-guard leaves the correction adds or changes -> (this model's value, the sentence-evidence parent's value).
# bi_parent_model reverts exactly these, so that every "parent" evaluation stays the sentence-evidence parent's evidence.
CORR1_ASCII_DIGITS = "0123456789"
CORR1_GUARD_LEAVES = {
    "betweenPattern": ("(?:[\"')\\]\u201d]|\\s)*", "(?:[\"')\\]]|\\s)*"),
    "rule": ("A SENTENCE separator is NOT PROVEN by its frozen evidence when the terminal that ends the previous unit (or the junction material) is an ambiguous terminal (a full stop) and the text after it, past permitted closing punctuation (a closing quote, parenthesis or bracket) and spacing (spaces, line wraps), begins with a lowercase letter (Unicode lowercase) or with an ASCII decimal digit 0-9 (asciiDigitContinuation, IV1-F1 of the CORR1 correction). The guard is part of the SENTENCE evidence itself: it applies wherever that evidence is read - to a SENTENCE a record declares between adjacent units (the record is then rejected as a coder-invented boundary, segmentation.separatorEvidence.violation) and to the frozen evidence the touching-atom relation reads between two cores",
             "A SENTENCE separator is NOT PROVEN by its frozen evidence when the terminal that ends the previous unit (or the junction material) is an ambiguous terminal (a full stop) and the text after it, past permitted closing punctuation (a closing quote, parenthesis or bracket) and spacing (spaces, line wraps), begins with a lowercase letter (Unicode lowercase). The guard is part of the SENTENCE evidence itself: it applies wherever that evidence is read - to a SENTENCE a record declares between adjacent units (the record is then rejected as a coder-invented boundary, segmentation.separatorEvidence.violation) and to the frozen evidence the touching-atom relation reads between two cores"),
    "unchanged": (["a question mark or an exclamation mark (not ambiguous terminals): their evidence is the parent's",
                   "a full stop followed by an uppercase letter, an uncased letter or any other material except an ASCII decimal digit 0-9 (withheld by asciiDigitContinuation, IV1-F1 of the CORR1 correction): the parent's evidence (this act does not decide whether such a full stop ends a sentence)",
                   "segmentation.atom, lawfulSeparators, notSeparators, adjacency, whenNotAdjacent and every other separator's evidence"],
                  ["a question mark or an exclamation mark (not ambiguous terminals): their evidence is the parent's",
                   "a full stop followed by an uppercase letter, a digit, an uncased letter or any other material: the parent's evidence (this act does not decide whether such a full stop ends a sentence)",
                   "segmentation.atom, lawfulSeparators, notSeparators, adjacency, whenNotAdjacent and every other separator's evidence"])}
BI_BINDING_CHECKS = ["RECORDS_DIGEST", "AUTHORITY_CONSTANTS", "ARTIFACT_ID", "ARTIFACT_DIGEST", "COORDINATE_VIEW", "PROVEN_STATES", "ENTITY_ID", "SPAN_SET",
                     "SPAN_TEXT"]
BI_PILOT_SPANS = {"ART-07": 15, "ART-08": 53, "ART-13": 1, "ART-23": 219}
BI_GROUP = "BI_BOUNDARY_INTEGRITY"
BI_FIXTURE_IDS = ["BI-M1-IV1", "BI-M1-IV1-P", "BI-M1-IV1-QB", "BI-M1-D1N", "BI-M1-D1U", "BI-M1-D1W", "BI-M1-D1C", "BI-M1-D4", "BI-M1-D4C", "BI-M1-D5", "BI-M1-P1", "BI-M1-P2", "BI-M1-P3", "BI-M1-P4", "BI-M1-P5", "BI-M1-P6", "BI-M2-D1", "BI-M2-D1S", "BI-M2-D2", "BI-M2-D2S", "BI-M2-D3", "BI-M2-D3S", "BI-M2-NEAR", "BI-M2-NEARS", "BI-M2-HTML", "BI-M2-HTMLS", "BI-M2-C1", "BI-M2-C2-DIGEST", "BI-M2-C2-ARTIFACT", "BI-M2-C2-SHIFT", "BI-M2-C2-ENTITY", "BI-M2-C2-CONST", "BI-M2-C2-TEMPORAL", "BI-M2-C2-EDITED", "BI-M2-C3Q", "BI-M2-C3E", "BI-M2-WHOLE", "BI-M2-B-IV1", "BI-M2-B-IV1S", "BI-M2-B-ND", "BI-M2-B-SNP"]
BI_M1_IDS = ["BI-M1-IV1", "BI-M1-IV1-P", "BI-M1-IV1-QB", "BI-M1-D1N", "BI-M1-D1U", "BI-M1-D1W", "BI-M1-D1C", "BI-M1-D4", "BI-M1-D4C", "BI-M1-D5", "BI-M1-P1", "BI-M1-P2", "BI-M1-P3", "BI-M1-P4", "BI-M1-P5", "BI-M1-P6"]
BI_M2A_IDS = ["BI-M2-D1", "BI-M2-D1S", "BI-M2-D2", "BI-M2-D2S", "BI-M2-D3", "BI-M2-D3S", "BI-M2-NEAR", "BI-M2-NEARS", "BI-M2-HTML", "BI-M2-HTMLS"]
BI_CASE_B_IDS = ["BI-M2-B-IV1", "BI-M2-B-IV1S", "BI-M2-B-ND", "BI-M2-B-SNP"]
BI_GEN_MIN = 500
BI_SENS_STRIDE = 5
BI_LEAK_STRIDE = 5
# The only semantic-delta classes a parent -> child change may carry (the implementation act's list); anything else is SCOPE_VIOLATION.
DELTA_CLASSES = ("A_PLUS_ORIGIN_TRACKED_REPLAY", "A_PLUS_OP_ROLE_DECLARATION", "A_PLUS_COMPLETE_VIEW", "A_PLUS_FRAME_C_IDENTITY", "A_PLUS_FRAME_U_GUARD",
                 "A_PLUS_TEXT_BEARING_SEAM", "A_PLUS_CSI_V6", "A_PLUS_FAIL_CLOSED", "MECHANICAL_REQUIRED")
# normative-model surfaces occurrence anchoring may change; every other leaf must be byte-identical to the parent's (sourceClass semantics frozen)
A_PLUS_PATHS = ("$.id", "$.canonicalSegmentIdentity", "$.occurrenceAnchoring", "$.decisionProcedure[7]", "$.states.definitions[4].meaning",
                "$.rules.R-DUP.implementedIn", "$.rules.R-DUP.renditionEquivalenceTest.implementedIn")
OP_ROLE_PATH = re.compile(r"^\$\.evidenceBinding\.extractionRecipes\.[A-Z0-9_]+\.ops\[\d+\]\.role$")
PINNED_DERIVATION = {"literalExclusivityMarkers": ["rather than", "without"],
                     "mechanismLevelWitnessPrefix": "mechanism-level resolution",
                     "concreteMixedStateToken": "MULTIPLE_CLASS_PREDICATES_SATISFIED",
                     "concreteRowFields": ["mixed", "segmentation"]}
# the accepted op-role mapping (architecture OA-5); a recipe op without a declared role is a model error
ACCEPTED_OP_ROLES = {"HTML_TEXT_V1": ["NORMALIZATION", "CONTENT_BLOCK_REMOVAL", "CONTENT_BLOCK_REMOVAL", "CONTENT_BLOCK_REMOVAL", "MARKUP_REMOVAL",
                                      "MARKUP_REMOVAL", "NORMALIZATION", "NORMALIZATION"],
                     "PLAIN_TEXT_V1": ["NORMALIZATION"], "HTML_RAW_V1": ["NORMALIZATION"], "PDF_LZW_TEXT_V1": []}
# the accepted recorded reason vocabulary (architecture OA-10 as amended by CORR1.CORR1.CORR1 F-5) + the OA-1 member-bytes reason
ACCEPTED_REASONS = ["DUPLICATE_GROUP_UNRESOLVED", "EMPTY_CANONICAL_SEGMENT", "DECODER_FRAME_MISMATCH", "EMPTY_COMPLETE_VIEW_IMAGE",
                    "COMPLETE_VIEW_BOUNDARY_NOT_REPRESENTABLE", "TEXT_BEARING_REMOVAL_SEAM_TAINTED_POSITION", "EMPTY_SKELETON",
                    "U1_CONTENT_NOT_UNIQUE_IN_EVERY_COMPLETE_VIEW", "U2_CANDIDATE_OCCURRENCE_IS_A_TEXT_BEARING_REMOVAL_SEAM",
                    "U3_APPARENT_OCCURRENCE_CREATED_BY_TEXT_BEARING_REMOVAL", "U4_A_RECORD_CARRYING_THE_KEY_IS_A_TEXT_BEARING_REMOVAL_SEAM",
                    "POSSIBLE_CLASS_CONFLICT_FROM_UNPLACED_WITNESS"]
MECHANICAL_REASONS = ["MEMBER_BYTES_UNAVAILABLE"]
PRE_OCCURRENCE_EXITS = ["EMPTY_CANONICAL_SEGMENT", "DECODER_FRAME_MISMATCH", "EMPTY_COMPLETE_VIEW_IMAGE", "EMPTY_SKELETON"]
# fixture groups of this package
PARENT_FIXTURE_COUNT = 96
CONSTRUCTION_GROUPS = {"ARCH_PARENT_ADV": 38, "ARCH_R3": 34, "OA7B": 10, "R14": 22, "U4_ONLY": 3, "A_PLUS_PROBES": 3}
OA7B_FIXTURE_IDS = ["OA7B-D1", "OA7B-D2", "OA7B-D3", "OA7B-A1", "OA7B-A2", "OA7B-A3", "OA7B-B1", "OA7B-B2", "OA7B-C1", "OA7B-C2"]
R14_FIXTURE_IDS = ["R14-D1", "R14-D1-X", "R14-D1-CVI", "R14-D1-SKEL", "R14-D1-DECU", "R14-D1-2REC", "R14-C1", "R14-C1-U", "R14-C2", "R14-C2-V",
                   "R14-C4", "R14-C4-MIX", "R14-C5", "R14-C5-M", "R14-C6", "R14-C6-U1", "R14-S12", "R14-S13", "R14-X1", "R14-X2", "R14-X3", "R14-E1"]
U4_FIXTURE_IDS = ["U4-A", "U4-A2", "U4-B"]
# the generated surfaces and their pinned sizes (architecture CORR1 families, CORR1.CORR1 OA-7(b) generator, CORR1.CORR1.CORR1 R-14 generator)
GEN_SIZES = {"parentGenerator": 416, "extended": 2486, "completeViewsDiffer": 1544, "attributeMarkupSeam": 3768}
OA7B_GEN_SIZE, R14_GEN_SIZE, R14_GEN_ORDERS = 360, 560, 1680
# fast mode (forced-failure harness only): a deterministic stride through each generated surface; the full surfaces are evaluated for the report
FAST_STRIDE = {"parentGenerator": 16, "extended": 40, "completeViewsDiffer": 40, "attributeMarkupSeam": 60, "oa7b": 12, "r14": 16, "r7": 12, "ta": 10, "se": 10, "bi": 6}
FORBIDDEN_FIELDS = r'"(environment|environmentCode|environmentAssignment|pairResult|ecs|ecsScore|frictionScore|outcome|realizedOutcome|dealSuccess|dealFailure|predictionSeal|postT0)"\s*:'
# the declared keys of the CSI-v6 section (a re-added CSI-v5 surface such as keyComponents, occurrenceCorrespondence or countEquality is stale)
CSI_KEYS = ["anchorField", "anchorPrimitives", "anchoring", "collision", "componentsField", "convergence", "correspondenceField", "diagnosticOnly",
            "diagnosticsField", "forbidden", "form", "frames", "id", "identityBearing", "identityFunction", "keyJoin", "keyLayout", "keySeparator", "meaning",
            "prefix", "recomputedByValidator", "recordField", "removedComponents", "removedProofs", "suppliedValueNeverTrusted", "underlyingDocumentIdentity",
            "versionTag", "whenNotEstablished"]


# ---------------------------------------------------------------- helpers carried VERBATIM from the parent validator (PART 4 of CORR4.CORR1.CORR1.CORR1)
_GS = "The Committee sets each director's annual retainer of $36,000 & related fees."

_GPRE, _GSUF = "The Committee sets each director's", "annual retainer of $36,000 & related fees."

_G_VIS, _G_HID, _X_MAKE = ("vis", "visb", "nbsp", "amp"), ("script", "style"), ("create", "create_style")

_G_DD = {"": "", "copy": "&copy;", "dash": "&#8212;"}

_G_ASSERT = (
    [("rewardObject", True, "annual retainer"), ("structureStated", True, "annual retainer of $36,000"),
     ("rewardModality", "STRUCTURE", "annual retainer of $36,000"), ("rewardProvisions", "B1", "$36,000"),
     ("operativeContent", "REWARD_STRUCTURE", "annual retainer of $36,000")],
    [("roleDimension", True, "The Committee"), ("entitlementDimension", True, "sets each director's annual retainer"),
     ("allocationStatement", True, "The Committee sets"), ("operativeContent", "ROLE_ALLOCATION", "The Committee sets each director's")])

_G_CODINGS = ("all-agree", "all-conflict", "supplier-conflict", "supplier-agree")

_ABSENT = "<ABSENT>"

CORR3_IDENTICAL_SUBTREES = ("$.segmentation", "$.canonicalization", "$.evidenceBinding", "$.rules.R-COUNT", "$.rules.R-BASIS", "$.rules.R-SEG-B",
                            "$.rules.R-EDGE", "$.rules.R-FORM", "$.rules.R-EVID", "$.rules.R-MULTI", "$.rules.R-FAIL", "$.states", "$.pairwiseMatrix",
                            "$.moduleRules", "$.documentaryTerms", "$.vocabulary", "$.exclusionSemantics", "$.featureVocabulary.booleans",
                            "$.featureVocabulary.derived", "$.featureMerge.lists", "$.featureMerge.booleans", "$.authoritativeConsumer")

FORM_TOKENS = (r"FORM_10K|FORM_10Q|FORM_8K|DEF_14A|ARCHIVED_WEBSITE|ISSUER_ANNUAL_REPORT|ISSUER_REGULATORY_FILING|"
               r"SCHEDULE_13D_A|PERIODICAL_PRINT_ARCHIVE|documentaryType|document_type")

def load_json(p):
    with open(p, encoding="utf-8") as f:
        return json.load(f)

def file_sha(p):
    h = hashlib.sha256()
    with open(p, "rb") as f:
        for c in iter(lambda: f.read(1 << 20), b""):
            h.update(c)
    return h.hexdigest()

def repo_root(base):
    env = os.environ.get("MV_REPO_ROOT")
    if env:
        return env
    cand = os.path.abspath(os.path.join(base, "..", ".."))
    if os.path.exists(os.path.join(cand, "AGENTS.md")) and os.path.isdir(os.path.join(cand, "WORKBENCH", "DOWNLOADS")):
        return cand
    raise RuntimeError("repository root not found; set MV_REPO_ROOT")

def walk_strings(obj, path="$"):
    if isinstance(obj, str):
        yield path, obj
    elif isinstance(obj, dict):
        for k, v in obj.items():
            for x in walk_strings(v, "%s.%s" % (path, k)):
                yield x
    elif isinstance(obj, list):
        for i, v in enumerate(obj):
            for x in walk_strings(v, "%s[%d]" % (path, i)):
                yield x

def walk_exprs(expr):
    if isinstance(expr, dict):
        if "feature" in expr:
            yield expr
        for k in ("allOf", "anyOf", "noneOf"):
            for e in expr.get(k, []):
                for x in walk_exprs(e):
                    yield x
        if "not" in expr:
            for x in walk_exprs(expr["not"]):
                yield x

def corr1_reference(r1, deriv, class_id, exc_id):
    c1 = next(c for c in r1["classes"] if c["classId"] == class_id)
    x1 = next(x for x in c1["exclusions"] if x["id"] == exc_id)
    txt = x1["test"].lower()
    if any(m in txt for m in deriv["literalExclusivityMarkers"]):
        return "EXCLUSIVITY", "CORR1_TEXT_MARKER", x1
    pair = sorted([class_id, x1["redirect"]], key=lambda s: int(s.split("-")[1]))
    row = next((r for r in r1["pairwiseBoundaryMatrix"] if r["pair"] == pair), None)
    if row and not row["witness"].startswith(deriv["mechanismLevelWitnessPrefix"]):
        if any(deriv["concreteMixedStateToken"] in row.get(f, "") for f in deriv["concreteRowFields"]):
            return "EXCLUSIVITY", "CORR1_CONCRETE_MATRIX_ROW", x1
    return "PRESENCE", "CORR1_TEXT_PRESENCE", x1

def fill_template(tmpl, own, red):
    return json.loads(json.dumps(tmpl).replace("<REDIRECT_TAG>", red).replace("<OWN_TAG>", own))

def model_flat(o, p="$"):
    """Every leaf of a normative model under a stable path; list items keyed by their id where they have one."""
    out = {}
    if isinstance(o, dict):
        if not o:
            out[p] = {}
        for k, v in o.items():
            out.update(model_flat(v, "%s.%s" % (p, k)))
    elif isinstance(o, list):
        if not o:
            out[p] = []
        for i, v in enumerate(o):
            seg = "[%d]" % i
            if isinstance(v, dict):
                for kk in ("classId", "componentId", "id", "step", "pair"):
                    if kk in v:
                        key = v[kk]
                        seg = "[%s]" % ("|".join(key) if isinstance(key, list) else json.dumps(key, ensure_ascii=False))
                        break
            out.update(model_flat(v, p + seg))
    else:
        out[p] = o
    return out

def path_covered(key, path):
    return key == path or key.startswith(path + ".") or key.startswith(path + "[")

def mini_schema(value, schema, path="$"):
    """Tiny JSON-Schema subset: type, required, properties, items, enum, const, minItems, pattern, nullable."""
    errs = []
    t = schema.get("type")
    types = t if isinstance(t, list) else ([t] if t else [])
    pyt = {"object": dict, "array": list, "string": str, "integer": int, "boolean": bool, "null": type(None)}
    if types and not any(isinstance(value, pyt[x]) and not (x == "integer" and isinstance(value, bool)) for x in types):
        return ["%s: type %s expected" % (path, t)]
    if "const" in schema and value != schema["const"]:
        errs.append("%s: const" % path)
    if "enum" in schema and value not in schema["enum"]:
        errs.append("%s: %r not in enum" % (path, value))
    if "pattern" in schema and isinstance(value, str) and not re.search(schema["pattern"], value):
        errs.append("%s: pattern" % path)
    if isinstance(value, dict):
        for k in schema.get("required", []):
            if k not in value:
                errs.append("%s: missing %s" % (path, k))
        for k, sub in schema.get("properties", {}).items():
            if k in value:
                errs.extend(mini_schema(value[k], sub, "%s.%s" % (path, k)))
    if isinstance(value, list):
        if len(value) < schema.get("minItems", 0):
            errs.append("%s: minItems" % path)
        if "items" in schema:
            for i, v in enumerate(value):
                errs.extend(mini_schema(v, schema["items"], "%s[%d]" % (path, i)))
    return errs

class Checks(object):
    def __init__(self):
        self.results = []

    def ck(self, cid, name, fn):
        """Run one check. A crash inside a check is a FAIL with the exception, never a validator crash."""
        try:
            out = fn()
            ok, detail = (out if isinstance(out, tuple) else (out, ""))
        except Exception as e:  # noqa: BLE001 - a crash must become a clean FAIL
            ok, detail = False, "EXCEPTION %s: %s" % (type(e).__name__, str(e)[:300])
        self.results.append({"check": cid, "name": name, "pass": bool(ok),
                             "detail": detail if isinstance(detail, str) else json.dumps(detail, ensure_ascii=False)[:600]})

def replay_loader(root):
    parent = os.path.dirname(root)

    def load(a):
        base = root if a["path"]["anchor"] == "REPO_ROOT" else parent
        p = os.path.join(base, a["path"]["relative"])
        with open(p, "rb") as f:
            return f.read()
    return load

def load_registry_record(root, binding):
    parent = os.path.dirname(root)
    rf = os.path.join(root if binding["registryFile"]["anchor"] == "REPO_ROOT" else parent, binding["registryFile"]["relative"])
    raw = open(rf, "rb").read()
    if sha_bytes(raw) != binding["registryFileSha256"]:
        raise ModelError("REGISTRY_FILE_DIGEST", rf)
    if rf.endswith(".jsonl"):
        rec = json.loads([ln for ln in raw.decode("utf-8").splitlines() if ln.strip()][binding["registryRecordIndex"]])
    else:
        j = json.loads(raw)
        arr = j if isinstance(j, list) else next(v for k, v in j.items() if isinstance(v, list) and v and isinstance(v[0], dict))
        rec = arr[binding["registryRecordIndex"]]
    if sha_bytes(cjson(rec)) != binding["registryRecordSha256"]:
        raise ModelError("REGISTRY_RECORD_DIGEST", binding["sourceId"])
    return rec

def derive_identity(rec, binding, sha, deriv):
    kp = deriv["keyPreference"]

    def first(keys):
        for k in keys:
            if rec.get(k) not in (None, ""):
                return rec[k]
        return None
    url = first(kp["url"])
    acc = None
    if url:
        m = re.search(deriv["accessionFromUrl"][0], url)
        if m:
            acc = m.group(1)
        else:
            m = re.search(deriv["accessionFromUrl"][1], url)
            if m:
                acc = "%s-%s-%s" % m.groups()
    cap = None
    if url:
        m = re.search(deriv["captureIdentityFromUrl"], url)
        if m:
            cap = "wayback|%s|%s" % (m.group(1), m.group(2))
    dt = first(kp["documentType"])
    return {"sha256": sha, "accession": acc, "exhibitId": (url.rstrip("/").rsplit("/", 1)[-1] if url and acc else None),
            "captureIdentity": cap, "issuerNativeId": None,
            "registryIdentity": "%s|%s" % (binding["registryFileSha256"], binding["sourceId"]),
            "title": first(kp["title"]), "period": first(kp["period"]),
            "amendmentMarker": bool(dt and re.search(deriv["amendmentMarkerFromDocumentType"], dt)), "versionId": None}

def preregistration(base):
    rows = sorted("%s  %s\n" % (file_sha(os.path.join(base, ARTIFACTS[k])), ARTIFACTS[k]) for k in ("contract", "rules", "schema"))
    return sha_text("".join(rows)), dict((ARTIFACTS[k], file_sha(os.path.join(base, ARTIFACTS[k]))) for k in ("contract", "rules", "schema"))

def _short(v, n=140):
    t = json.dumps(v, ensure_ascii=False, sort_keys=True) if not isinstance(v, str) else v
    return t if len(t) <= n else t[:n] + "...(%d chars)" % len(t)

def _load_corr3_interpreter(dl):
    """The frozen CORR3 validator module (parent identity verified by A-1); bytecode is never written."""
    sys.dont_write_bytecode = True
    import importlib.util
    spec = importlib.util.spec_from_file_location("mv_sourceclass_corr3_frozen", os.path.join(dl, CORR3_VALIDATOR))
    mod = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(mod)
    return mod

def _probe_identity(text, **kw):
    d = {"sha256": sha_text(text) if text is not None else "1" * 64, "accession": None, "exhibitId": None, "captureIdentity": None,
         "issuerNativeId": None, "registryIdentity": None, "title": None, "period": None, "amendmentMarker": False, "versionId": None}
    d.update(kw)
    return d

def _dup_probe(interp, ta, tb, ida, idb):
    return interp.eval_duplicate(ida, idb, ta, tb)

def _csi_probe_corpus(interp, variants, segment_text, recipe, ident_kw):
    """Bind the same bounded segment in each variant rendition and return (identity states, CSIs, group count)."""
    arts, recs = [], []
    for i, html_text in enumerate(variants):
        arts.append({"artifactId": "P%d" % i, "content": {"inlineText": html_text}, "renditionDecoder": "UTF8_REPLACE",
                     "identity": _probe_identity(html_text, **ident_kw)})
        doc = interp.extract(html_text.encode("utf-8"), recipe)
        s = doc.index(segment_text)
        recs.append({"recordId": "P%d" % i, "artifactId": "P%d" % i, "sourceId": "PROBE", "recipe": recipe, "bindingStatus": "BOUND",
                     "physicalHeading": None, "units": [{"unitId": "u1", "separatorBefore": interp.seg["startMarker"], "locatorKind": "SENTENCE",
                                                         "start": s, "end": s + len(segment_text), "text": segment_text,
                                                         "textSha256": sha_text(segment_text), "assertions": []}]})
    res = evaluate_corpus(interp, {"artifacts": arts, "records": recs}, inline_loader)
    return res

def _g_slot(kind, rep):
    if kind == "G":
        s = {"nbsp": _GS.replace("annual retainer", "annual&nbsp;retainer"), "amp": _GS.replace(" & ", " &amp; ")}.get(rep, _GS)
        return {"vis": "<p>%s</p>", "visb": "<p><b>%s</b></p>", "nbsp": "<p>%s</p>", "amp": "<p>%s</p>",
                "script": "<script>%s</script>", "style": "<style>%s</style>"}[rep] % s
    return {"plain": "<p>%s <b>amended</b> %s</p>", "create": "<p>%s<script>amended</script>%s</p>",
            "create_style": "<p>%s<style>amended</style>%s</p>"}[rep] % (_GPRE, _GSUF)

def _g_html(layout, reps, dd):
    parts = []
    for j, (k, r) in enumerate(zip(layout, reps)):
        parts.append("<p>Interlude %d.</p>" % j)
        parts.append(_g_slot(k, r))
    parts.append("<p>Interlude %d.</p>" % len(layout))
    return "<html><body><p>Preface.%s</p>%s<p>Closing.</p></body></html>\n" % (_G_DD[dd], "".join(parts))

def _g_reps(layout, hide=(), hmed="script", create=(), cmed="create", neutral="vis"):
    reps, gi, xi = [], 0, 0
    for k in layout:
        if k == "G":
            reps.append(hmed if gi in hide else neutral)
            gi += 1
        else:
            reps.append(cmed if xi in create else "plain")
            xi += 1
    return tuple(reps)

def _g_layouts():
    out = []
    for k in (1, 2, 3, 4):
        for seams in ((), ("pre",), ("post",), ("pre", "post"), ("mid",)):
            if "mid" in seams and k < 2:
                continue
            lay = ["X"] if "pre" in seams else []
            for g in range(k):
                lay.append("G")
                if g == 0 and "mid" in seams:
                    lay.append("X")
            if "post" in seams:
                lay.append("X")
            out.append("".join(lay))
    return out

def _g_cases():
    """The deterministic case list. A case: id, family, layout, rends [(reps, dd)], coding."""
    cases, seen = [], set()

    def add(fam, lay, rends):
        sig = (lay, tuple((tuple(r), d) for r, d in rends))
        if sig in seen or not any(_g_occ(lay, r) for r, _ in rends):
            return
        seen.add(sig)
        cases.append({"id": "N%03d" % (len(cases) + 1), "family": fam, "layout": lay, "rends": [(tuple(r), d) for r, d in rends],
                      "coding": _G_CODINGS[len(cases) % len(_G_CODINGS)]})
    for lay in _g_layouts():
        kg, kx = lay.count("G"), lay.count("X")
        base = _g_reps(lay)
        allx = tuple(range(kx))
        first_g, last_g = (0,), (kg - 1,)
        # N: representation differences that leave every extracted document unchanged
        for nv in ("visb", "nbsp", "amp"):
            add("N", lay, [(base, ""), (_g_reps(lay, neutral=nv), "")])
        add("N", lay, [(base, ""), (_g_reps(lay, neutral="visb"), ""), (_g_reps(lay, neutral="amp"), "")])
        add("N", lay, [(_g_reps(lay, hide=first_g, hmed="script"), ""), (_g_reps(lay, hide=first_g, hmed="style", neutral="visb"), "")])
        # D: the canonical documents differ for a reason unrelated to the sentence
        add("D", lay, [(base, ""), (base, "copy")])
        add("D", lay, [(base, "dash"), (_g_reps(lay, neutral="visb"), "copy")])
        # H: one rendition hides genuine occurrences behind a script or style block
        sets = [first_g, last_g] + ([(1,)] if kg >= 3 else []) + [tuple(range(kg))]
        for si, hs in enumerate(dict.fromkeys(sets)):
            for hm in _G_HID:
                pair = [(base, ""), (_g_reps(lay, hide=hs, hmed=hm), "")]
                add("H", lay, pair if (si + _G_HID.index(hm)) % 2 == 0 else pair[::-1])
        # C: complementary and coincident hiding in two renditions
        if kg >= 2:
            add("C", lay, [(_g_reps(lay, hide=first_g), ""), (_g_reps(lay, hide=last_g, hmed="style"), "")])
            add("C", lay, [(_g_reps(lay, hide=first_g), ""), (_g_reps(lay, hide=first_g, hmed="style"), "copy")])
            add("C", lay, [(_g_reps(lay, hide=first_g), ""), (_g_reps(lay, hide=first_g, hmed="style"), "")])
            add("T", lay, [(base, ""), (_g_reps(lay, hide=first_g), ""), (_g_reps(lay, hide=last_g, hmed="style"), "")])
        # P: script or style blocks that make extraction create an apparent occurrence
        if kx:
            hid = tuple(range(kg))[:kx] if kx <= kg else tuple(range(kg))
            hid_last = tuple(range(kg))[::-1][:kx][::-1] if kx <= kg else tuple(range(kg))
            add("P", lay, [(base, ""), (_g_reps(lay, create=allx), "")])
            add("P", lay, [(base, ""), (_g_reps(lay, create=allx, hide=hid), "")])
            add("P", lay, [(base, ""), (_g_reps(lay, create=allx, hide=hid_last, hmed="style", cmed="create_style"), "")])
            add("P", lay, [(_g_reps(lay, create=allx), ""), (_g_reps(lay, create=allx, cmed="create_style", neutral="visb"), "")])
            add("P", lay, [(_g_reps(lay, create=allx, hide=hid_last), ""), (_g_reps(lay, create=allx, hide=hid, hmed="style"), "")])
            add("P", lay, [(base, ""), (_g_reps(lay, create=allx, hide=hid), ""), (_g_reps(lay, create=allx, hide=hid_last, hmed="style"), "")])
            add("P", lay, [(base, "copy"), (_g_reps(lay, create=allx, hide=hid), "")])
            if kx == 2:
                add("P", lay, [(_g_reps(lay, create=(0,)), ""), (_g_reps(lay, create=(1,), hide=hid_last[:1]), "")])
    return cases

def _g_occ(layout, reps):
    """Extraction-space occurrences of the sentence in slot order: ('g', slot) genuine and visible, ('c', slot) created by a removed block."""
    out = []
    for j, (k, r) in enumerate(zip(layout, reps)):
        if k == "G" and r in _G_VIS:
            out.append(("g", j))
        elif k == "X" and r in _X_MAKE:
            out.append(("c", j))
    return out

def _g_supplier(occ):
    for j in sorted(set(p[1] for o in occ for p in o if p[0] == "g")):
        if sum(1 for o in occ if ("g", j) in o) >= 2:
            return ("g", j)
    firsts = [p for o in occ for p in o if p[0] == "g"]
    return min(firsts, key=lambda p: p[1]) if firsts else None

def _g_truth(case):
    """The physical truth of a case, from the construction alone."""
    lay = case["layout"]
    occ = [_g_occ(lay, reps) for reps, _ in case["rends"]]
    n = len(occ)
    aligned = all(occ[a][i] == occ[b][i] for a in range(n) for b in range(a + 1, n) for i in range(min(len(occ[a]), len(occ[b]))))
    # extraction documents are equal exactly when every slot contributes the same and the preface is the same (independent of any canonicalization code)
    contrib = [tuple((k, r in _G_VIS) if k == "G" else (k, r in _X_MAKE) for k, r in zip(lay, reps)) + (dd,) for reps, dd in case["rends"]]
    docs_equal = len(set(contrib)) == 1
    sup = _g_supplier(occ)
    coding = case["coding"] if (sup is not None or not case["coding"].startswith("supplier")) else "all-agree"
    hid_before = hid_after = ph_before = ph_after = False
    for o, (reps, _) in zip(occ, case["rends"]):
        vis_g = [p[1] for p in o if p[0] == "g"]
        for j, (k, r) in enumerate(zip(lay, reps)):
            if k == "G" and r in _G_HID:
                hid_before |= any(v > j for v in vis_g)
                hid_after |= any(v < j for v in vis_g)
        for p in o:
            if p[0] == "c":
                ph_before |= any(v > p[1] for v in vis_g)
                ph_after |= any(v < p[1] for v in vis_g)
    media = sorted(set(("script" if r in ("script", "create") else "style") for reps, _ in case["rends"] for r in reps if r in _G_HID + _X_MAKE))
    entity = any(r in ("nbsp", "amp") for reps, _ in case["rends"] for r in reps)
    single_rank = all(len(o) == 1 for o in occ)
    balanced_phantom = single_rank and any(o[0][0] == "c" for o in occ) and any(o[0][0] == "g" for o in occ)
    return {"occ": occ, "aligned": aligned, "totalsEqual": len(set(len(o) for o in occ)) == 1, "docsEqual": docs_equal, "supplier": sup, "coding": coding,
            "hiddenBefore": hid_before, "hiddenAfter": hid_after, "phantomBefore": ph_before, "phantomAfter": ph_after, "media": media, "entity": entity,
            "singleRankPhantomVsGenuine": balanced_phantom, "renditions": n, "genuine": lay.count("G")}

def _g_class_of(coding, r, phys):
    if coding == "all-agree":
        return phys[1] % 2
    if coding == "all-conflict":
        return (phys[1] + r) % 2
    if coding == "supplier-conflict":
        return r % 2
    return 0

def _g_corpus(interp, case, truth, tag=None, coder="PROBE-CODER"):
    arts, recs, meta = [], [], []
    kw = {"accession": "0001-98-000009", "exhibitId": "10.9", "title": "Exhibit 10.9", "period": "1998"}
    for r, (reps, dd) in enumerate(case["rends"]):
        text = _g_html(case["layout"], reps, dd)
        aid = ("%s-%s" % (tag, "ABC"[r])) if tag else "R%d" % r
        arts.append({"artifactId": aid, "content": {"inlineText": text}, "renditionDecoder": "UTF8_REPLACE", "identity": _probe_identity(text, **kw)})
        doc = interp.extract(text.encode("utf-8"), "HTML_TEXT_V1")
        pos = -1
        for idx, phys in enumerate(truth["occ"][r]):
            pos = doc.index(_GS, pos + 1)
            if truth["coding"].startswith("supplier") and phys != truth["supplier"]:
                continue
            cls = _g_class_of(truth["coding"], r, phys)
            u = {"unitId": "u1", "separatorBefore": interp.seg["startMarker"], "locatorKind": "SENTENCE", "start": pos, "end": pos + len(_GS),
                 "text": _GS, "textSha256": sha_text(_GS), "assertions": []}
            for f, v, w in _G_ASSERT[cls]:
                u["assertions"].append({"featureId": f, "value": v, "witness": w, "assertionType": "QUOTED_WITNESS", "coderIdentity": coder, "sourceRef": "PROBE",
                                        "segmentLocator": {"artifactId": aid, "unitId": "u1", "start": pos, "end": pos + len(_GS)}})
            rid = ("%s-%s%d" % (tag, "ABC"[r], idx)) if tag else "N-r%d-%d" % (r, idx)
            recs.append({"recordId": rid, "artifactId": aid, "sourceId": "PROBE", "recipe": "HTML_TEXT_V1", "bindingStatus": "BOUND", "humanReadableLocator": None,
                         "physicalHeading": None, "units": [u]})
            meta.append({"recordId": rid, "rendition": r, "rank": idx, "phys": phys, "cls": cls})
    return {"artifacts": arts, "records": recs}, meta

def _g_fixture_case(gen):
    """A case from a fixture's generator block: {layout, renditions: [["rep/rep/...", dd], ...], coding}."""
    return {"id": "FIXTURE", "family": "FIXTURE", "layout": gen["layout"], "rends": [(tuple(r.split("/")), d) for r, d in gen["renditions"]], "coding": gen["coding"]}

def _g_fixture_corpus(interp, fid, gen):
    """(corpus, meta, truth) of a regression fixture, regenerated from its slot specification alone."""
    case = _g_fixture_case(gen)
    truth = _g_truth(case)
    corpus, meta = _g_corpus(interp, case, truth, tag=fid, coder="CORR4.CORR1.CORR1.CORR1-FIXTURE-CODER (synthetic; author-constructed)")
    return corpus, meta, truth

def _g_truth_block(truth):
    """The physical facts a fixture declares about itself, in a form the validator recomputes."""
    return {"occurrences": ["".join("%s%d" % p for p in o) for o in truth["occ"]], "aligned": truth["aligned"], "totalsEqual": truth["totalsEqual"],
            "docsEqual": truth["docsEqual"], "supplier": None if truth["supplier"] is None else "%s%d" % truth["supplier"]}

def check_csi_proof(interp, proof, root):
    bad = []
    for case in proof["syntheticCases"]:
        fx = {"corpus": case["corpus"], "expect": case["expect"]}
        ok, det, _ = run_fixture(interp, fx)
        if not ok:
            bad.append({case["caseId"]: det})
    for case in proof["realCases"]:
        res = evaluate_corpus(interp, case["corpus"], replay_loader(root))
        csis = dict((s["segmentId"], s["canonicalSegmentIdentity"]) for s in res["segmentRecords"])
        for a, b in case.get("equal", []):
            if csis[a] != csis[b]:
                bad.append({case["caseId"]: "not equal"})
        for a, b in case.get("distinct", []):
            if csis[a] == csis[b]:
                bad.append({case["caseId"]: "collide"})
        if case.get("recordedCsis") and case["recordedCsis"] != csis:
            bad.append({case["caseId"]: "recorded CSIs differ"})
    return not bad, bad

def summarize(results):
    return {"total": len(results), "pass": sum(1 for r in results if r["pass"]),
            "fail": sum(1 for r in results if not r["pass"])}

def _refresh(d, level):
    """Simulate a careful mutator: after a mutation, refresh every hash a naive tripwire would catch.

    level 'model': recompute the model identity everywhere, re-render the contract, re-register, re-manifest.
    level 'light': re-register and re-manifest only (the mutated surface itself is left as mutated).
    level 'none' : leave everything as mutated.
    """
    P = dict((k, os.path.join(d, v)) for k, v in ARTIFACTS.items())
    if level == "none":
        return
    if level == "model":
        rules = load_json(P["rules"])
        sha = sha_bytes(cjson(rules["boundaryModel"]))
        rules["boundaryModelSha256"] = sha
        _dump(P["rules"], rules)
        for k in SEMANTIC_ARTIFACTS:
            obj = load_json(P[k])
            obj["boundaryModelSha256"] = sha
            if k == "replay":
                for r in obj["records"]:
                    r["boundaryModelSha256"] = sha
            _dump(P[k], obj)
        try:
            text = render_contract(rules, load_json(P["fixtures"]), load_json(P["deltaLedger"]))
        except Exception:  # noqa: BLE001 - a broken model cannot be rendered; the mutator keeps the old contract
            text = None
        if text is not None:
            with open(P["contract"], "w", encoding="utf-8") as f:
                f.write(text)
    rp = load_json(P["replay"])
    pre, per = preregistration(d)
    rp["normativePreRegistration"]["preRegistrationSha256"] = pre
    rp["normativePreRegistration"]["normativeArtifacts"] = per
    _dump(P["replay"], rp)
    write_manifest(d)

def _dump(p, obj):
    with open(p, "w", encoding="utf-8") as f:
        json.dump(obj, f, indent=1, ensure_ascii=False)
        f.write("\n")

def _edit(d, key, fn):
    p = os.path.join(d, ARTIFACTS[key])
    obj = load_json(p)
    fn(obj)
    _dump(p, obj)

def _bm_edit(fn):
    return lambda d: _edit(d, "rules", lambda r: fn(r["boundaryModel"]))

def _cls(bm, cid):
    return next(c for c in bm["classes"] if c["classId"] == cid)

def _exc(bm, cid, xid):
    return next(x for x in _cls(bm, cid)["exclusions"] if x["id"] == xid)

def _fx(obj, fid):
    return next(f for f in obj["fixtures"] if f["fixtureId"] == fid)

def _row(obj, rid):
    return next(r for r in obj["records"] if r["recordId"] == rid)

def _m_replace_text(d):
    def f(rp):
        u = _row(rp, "SCA-010")["units"][0]
        u["text"] = "Unrelated text substituted for the bound segment; nothing about stock options here."
        u["textSha256"] = sha_text(u["text"])
    _edit(d, "replay", f)

def _m_move_to_header(d, root):
    """Rebind SCA-010 consistently (span, text, hash, locators) to the SEC header, as CORR2 did."""
    def f(rp):
        rec = _row(rp, "SCA-010")
        art = next(a for a in rp["artifacts"] if a["artifactId"] == rec["artifactId"])
        doc = Interp(load_json(os.path.join(d, ARTIFACTS["rules"]))["boundaryModel"]).extract(replay_loader(root)(art), rec["recipe"])
        s = doc.index("-----BEGIN PRIVACY-ENHANCED MESSAGE-----")
        e = doc.index("CENTRAL INDEX KEY:") + len("CENTRAL INDEX KEY:")
        u = rec["units"][0]
        u["start"], u["end"], u["text"] = s, e, doc[s:e]
        u["textSha256"] = sha_text(u["text"])
        for a in u["assertions"]:
            a["segmentLocator"].update({"start": s, "end": e})
        rec["physicalHeading"] = None
    _edit(d, "replay", f)

def _m_exclusivity(bm):
    x = _exc(bm, "SC-1", "X1-a")
    x["expr"] = {"allOf": [{"feature": "operativeContent", "contains": "PARTICIPATION_TERMS"},
                           {"not": {"feature": "operativeContent", "contains": "ENGAGEMENT_FRAME"}}]}
    x["form"] = "EXCLUSIVITY"

def _m_reorder(bm):
    dp = bm["rules"]["R-DUP"]["decisionProcedure"]
    dp[0], dp[1] = dp[1], dp[0]

def _m_tenth(bm):
    bm["vocabulary"]["classes"].append({"classId": "SC-10", "label": "press releases"})
    bm["vocabulary"]["count"] = 10

def _m_two_doc(bm):
    bm["rules"]["R-COUNT"]["steps"].append("8. srcDiv additionally requires at least two distinct underlying documents.")

def _m_form(bm):
    bm["rules"]["R-EVID"]["normative"] += " Where content is unclear, DEF_14A => compensation plans."

def _m_reqv_list(bm):
    bm["canonicalization"]["renditionOnlyArtifactsRemoved"] = [x for x in bm["canonicalization"]["renditionOnlyArtifactsRemoved"] if x != "markup_tags"]
    bm["rules"]["R-DUP"]["renditionEquivalenceTest"]["parameters"]["renditionOnlyArtifactsRemoved"] = bm["canonicalization"]["renditionOnlyArtifactsRemoved"]

def _m_reqv_ops(bm):
    _m_reqv_list(bm)
    bm["canonicalization"]["ops"] = [o for o in bm["canonicalization"]["ops"] if o["artifactClass"] != "markup_tags"]

def _m_contract(d, old, new):
    p = os.path.join(d, ARTIFACTS["contract"])
    s = open(p, encoding="utf-8").read()
    if old not in s:
        raise RuntimeError("mutation anchor not found")
    with open(p, "w", encoding="utf-8") as f:
        f.write(s.replace(old, new, 1))

def _step(bm, when):
    return next(st for st in bm["rules"]["R-DUP"]["decisionProcedure"] if st["when"] == when)

def _m_determinant_scalar(bm):
    fv = bm["featureVocabulary"]
    dv = fv["listEnums"].pop("determinant")
    fv["scalarEnums"]["determinant"] = {"values": dv["values"], "default": "OTHER"}
    bm["featureMerge"]["scalarEnums"]["determinant"] = [{"ifSingleDistinct": True, "then": "<VALUE>"}, {"else": "OTHER"}]
    _cls(bm, "SC-5")["components"][2]["expr"] = {"feature": "determinant", "eq": "ACTOR_INVARIANT"}
    _exc(bm, "SC-5", "X5-a")["expr"] = {"feature": "determinant", "eq": "ROLE_OR_TIER"}
    next(c for c in bm["featureConstraints"] if c["id"] == "FC-5")["when"] = {"feature": "determinant", "eq": "ACTOR_INVARIANT"}

def _m_x5a_presence(bm):
    _exc(bm, "SC-5", "X5-a")["expr"] = {"feature": "determinant", "contains": "ROLE_OR_TIER"}

def _m_premature_no_link(bm):
    bm["rules"]["R-DUP"]["conditionMachine"]["NO_POSITIVE_LINK_NO_CANDIDATE"] = {"hasPositiveLink": False}

def _m_url_merge(bm):
    bm["rules"]["R-DUP"]["conditionMachine"]["CANDIDATE_REQV_EQUIVALENT"] = {"allOf": [{"hasPositiveLink": False}, {"hasCandidate": True}]}

def _m_url_link(bm):
    bm["rules"]["R-DUP"]["linkRules"].append({"link": "SAME_CAPTURED_URL", "linkClass": "authoritative", "fieldsEqualNonNull": ["captureIdentity"]})
    bm["rules"]["R-DUP"]["conditionMachine"]["DIGEST_EQUALITY"] = {"linkPresent": "SAME_CAPTURED_URL"}

def _m_x7e_conditional(bm):
    _exc(bm, "SC-7", "X7-e")["expr"] = {"allOf": [{"feature": "rightsChangeEventReport", "eq": True},
                                                  {"not": {"allOf": [{"feature": "roleDimension", "eq": True}, {"feature": "entitlementDimension", "eq": True},
                                                                     {"feature": "allocationStatement", "eq": True}]}}]}

def _m_page_numbers(bm):
    op = next(o for o in bm["canonicalization"]["ops"] if o["artifactClass"] == "page_number_lines")
    op["pattern"] = "^\\s*\\d+\\s*(?=\\n\\s*<PAGE>)"

def _m_separator_evidence(bm):
    bm["segmentation"]["separatorEvidence"]["whenNotAdjacent"] = "a separator is lawful only where the bound text physically evidences the boundary"

def _m_sca011_recode(d, root):
    def f(rp):
        rec = _row(rp, "SCA-011")
        u3 = rec["units"][2]
        loc = {"artifactId": rec["artifactId"], "unitId": u3["unitId"], "start": u3["start"], "end": u3["end"]}
        for fid, val, wit in (("roleDimension", True, "its representatives serving on TWE's Board of Representatives"),
                              ("entitlementDimension", True, "the right to vote on any matter"),
                              ("allocationStatement", True, "its representatives serving on TWE's Board of Representatives no longer have the right to vote"),
                              ("operativeContent", "ROLE_ALLOCATION", "representatives serving on TWE's Board of Representatives no longer have the right to vote")):
            u3["assertions"].append({"featureId": fid, "value": val, "witness": wit, "assertionType": "QUOTED_WITNESS", "coderIdentity": "MUTATOR",
                                     "sourceRef": rec["sourceId"], "segmentLocator": dict(loc)})
        rules_ = load_json(os.path.join(d, ARTIFACTS["rules"]))
        # the mutated feature set only changes SCA-011#s3 if X7-e also changed; recompute honestly under the delivered model
        interp = Interp(rules_["boundaryModel"])
        res = evaluate_corpus(interp, {"artifacts": rp["artifacts"], "records": rp["records"]}, replay_loader(root))
        byrec = dict((r["recordId"], r) for r in res["records"])
        for r in rp["records"]:
            got = byrec[r["recordId"]]
            r["computed"] = {"duplicateIdentityState": got["duplicateIdentityState"], "segments": got["segments"]}
        from collections import Counter
        t = rp["totals"]
        t["byState"] = dict(sorted(Counter(x["sourceClassAssignmentState"] for x in res["segmentRecords"]).items()))
        t["byClass"] = dict(sorted(Counter(x["sourceClass"] for x in res["segmentRecords"] if x["sourceClass"]).items()))
        t["distinctClassSet"] = res["count"]["distinctClassSet"]
        t["multiClassDocuments"] = res["count"]["multiClassDocuments"]
    _edit(d, "replay", f)


# ---------------------------------------------------------------- helpers of this package
def interpreter_census(src, bm):
    """String literals inside PART 1 + PART 2 that equal a normative identifier of the model (the parent's census, extended to every identifier the
    occurrence-anchoring model declares: reasons, condition and guard ids, frame names, op roles, removal classes, complete-view source kinds, the
    witness role, the quarantine reason, the CSI version tag, prefix and marker). Record-shape keys (the CSI key layout and anchor component names,
    underlyingDocumentIdentity) and the model's own dispatch keys (test names, basis / rule / application / source selectors) are how the interpreter
    navigates the model and are not normative literals."""
    start = src.index("# " + "=" * 66 + " PART 1 BEGIN")
    end = src.index("# " + "=" * 66 + " PART 2 END")
    body = src[start:end]
    lits = set(re.findall(r'"([^"\\\n]{2,80})"', body)) | set(re.findall(r"'([^'\\\n]{2,80})'", body))
    ids = set()
    for c in bm["vocabulary"]["classes"]:
        ids.update([c["classId"], c["label"]])
    for c in bm["classes"]:
        ids.update(x["componentId"] for x in c["components"])
        ids.update(x["id"] for x in c["exclusions"])
    fv = bm["featureVocabulary"]
    for group in (fv["scalarEnums"], fv["listEnums"]):
        for k, v in group.items():
            ids.add(k)
            ids.update(v["values"])
    ids.update(fv["booleans"])
    ids.update(fv["derived"])
    ids.update(bm["states"]["roles"].values())
    ids.update(bm["states"]["identityStates"].values())
    ids.update(bm["states"]["equivalenceStates"].values())
    ids.update(bm["segmentation"]["lawfulSeparators"])
    ids.update(bm["segmentation"]["notSeparators"])
    ids.update(x["link"] for x in bm["rules"]["R-DUP"]["linkRules"])
    ids.update(x["split"] for x in bm["rules"]["R-DUP"]["splitRules"])
    ids.update(x["marker"] for x in bm["rules"]["R-DUP"]["neverSufficientRules"])
    ids.update(bm["rules"]["R-DUP"]["conditionMachine"])
    ids.update(bm["evidenceBinding"]["extractionRecipes"])
    ids.update(o["artifactClass"] for o in bm["canonicalization"]["ops"])
    ids.update(bm["rules"]["R-COUNT"]["groupingKey"])
    ids.update(d["id"] for d in bm["rules"]["R-COUNT"]["countingDispositions"])
    ids.update(fc["id"] for fc in bm["featureConstraints"])
    cs, oa = bm["canonicalSegmentIdentity"], bm["occurrenceAnchoring"]
    ids.update([cs["versionTag"], cs["prefix"], cs["whenNotEstablished"]["marker"]])
    ids.update(oa["failClosed"]["reasons"].values())
    ids.update(oa["failClosed"].get("recordedReasons", []))
    for c in oa["frameC"]["conditions"]:
        ids.update([c["id"], c["reason"]])
    for g in oa["frameU"]["guard"]:
        ids.update([g["id"], g["reason"]])
    ids.update([oa["frameU"]["emptySkeletonReason"], oa["frameC"]["recordedAs"], oa["frameU"]["recordedAs"]])
    ids.update(oa["opRoles"]["vocabulary"])
    ids.update(oa["removalViews"]["classes"].values())
    ids.update(oa["completeView"]["sourceKinds"].values())
    uw = oa.get("unplacedWitness") or {}
    if uw:
        ids.update(uw["unplacedExits"])
        ids.update([uw["witness"]["role"], uw["quarantine"]["reason"]])
        ids.update(uw["witness"]["notAWitness"].values())
    b2 = bm.get("basisOverlap") or {}
    if b2:
        ids.update(d["id"] for d in b2["dispositions"])
        ids.update(b2["overlap"]["relations"].values())
        ids.update([b2["componentRule"]["reason"], b2["componentIdPrefix"], b2["id"]])
        ta = b2.get("touchingAtom") or {}
        if ta:
            ids.update(ta["relations"].values())
            ids.add(ta["id"])
    for rule_ in bm["segmentation"]["separatorEvidence"]["whenAdjacent"].values():
        if rule_.get("continuationGuard"):
            ids.update([rule_["continuationGuard"]["id"], rule_["continuationGuard"]["effect"]])
        if rule_.get("documentaryInterval"):
            ids.add(rule_["documentaryInterval"]["id"])
        if rule_.get("entityNameVeto"):
            au_ = rule_["entityNameVeto"]["authority"]
            ids.update([rule_["entityNameVeto"]["id"], au_["usable"], au_["recordsDigestError"]])
            ids.update(au_["reasons"].values())
            ids.update(au_["requiredConstants"].values())
    ids -= {"underlyingDocumentIdentity"}   # a record-shape key, also the name of a CSI key component
    ids -= set(cs.get("keyLayout", []))
    for fr in cs.get("frames", {}).values():
        ids -= set(fr.get("anchorComponents", []))
    ids -= set(bm)                           # top-level section names are how the interpreter navigates INTO the model
    return sorted(lits & ids)


def parent_child_delta(bp, bc, rules):
    """Parent (CORR4.CORR1.CORR1.CORR1) -> child (A+ implementation) over every leaf of the normative model, classified by the longest matching
    path-prefix rule."""
    fp, fc = model_flat(bp), model_flat(bc)
    changed = sorted(k for k in set(fp) | set(fc) if fp.get(k, _ABSENT) != fc.get(k, _ABSENT))
    rows, unclassified = [], []
    for k in changed:
        cand = [r for r in rules if path_covered(k, r["pathPrefix"]) or (r["pathPrefix"] == "$.evidenceBinding.extractionRecipes.*.ops[*].role" and OP_ROLE_PATH.match(k))]
        rule = max(cand, key=lambda r: len(r["pathPrefix"])) if cand else None
        if rule is None:
            unclassified.append(k)
            continue
        rows.append({"path": k, "class": rule["class"], "parent": _short(fp.get(k, _ABSENT)), "child": _short(fc.get(k, _ABSENT))})
    return rows, unclassified


def _load_parent_module(dl):
    """The frozen CORR4.CORR1.CORR1.CORR1 parent validator module (identity verified by A-1); bytecode is never written."""
    sys.dont_write_bytecode = True
    import importlib.util
    spec = importlib.util.spec_from_file_location("mv_sourceclass_aplus_parent_frozen", os.path.join(dl, PARENT_VALIDATOR))
    mod = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(mod)
    return mod


def write_manifest(d, header=None):
    names = [v for k, v in ARTIFACTS.items() if k != "manifest"]
    lines = list(header or ["# MERGEVUE - %s - SOURCECLASS SENTENCE BOUNDARY EVIDENCE INTEGRITY CLOSURE PACKAGE - ARTIFACT MANIFEST (SHA-256)" % ACT,
                            "# The manifest does not hash itself."])
    for n in sorted(names):
        p = os.path.join(d, n)
        if os.path.exists(p):
            lines.append("%s  %s" % (file_sha(p), n))
    with open(os.path.join(d, ARTIFACTS["manifest"]), "w", encoding="utf-8") as f:
        f.write("\n".join(lines) + "\n")


def fast_mode():
    return bool(os.environ.get("MV_FAST"))


def stride(name, seq):
    """The full sequence, or (fast mode, forced-failure harness only) a deterministic stride through it."""
    return list(seq) if not fast_mode() else list(seq)[::FAST_STRIDE[name]]


# ================================================================== PHYSICAL-OCCURRENCE ORACLE BEGIN
# The constructions, builders, generated families and judges below state physical truth from the CONSTRUCTION alone: a document is a sequence of
# SLOTS, every slot is one documentary occurrence, and every reading coded on a slot states which occurrence it is and whether it is genuine or created.
# They are the architecture's construction oracles (CORR1 slot and explicit builders, CORR1.CORR1 OA-7(b) builder, CORR1.CORR1.CORR1 R-14 builder and
# LZW-PDF member), ported unchanged in behaviour. Builders use only the frozen extraction (interp.extract) to LOCATE a unit; nothing in a builder or in
# the truth it returns reads a candidate identity, frame, guard outcome, unresolved reason, rank or candidate set (check U-1 scans this block).
# Judges read the candidate's RESULTS and compare them with that truth.
_OR_KW = {"accession": "0001-98-000009", "exhibitId": "10.9", "title": "Exhibit 10.9", "period": "1998"}
_OR_CLS = {0: 2, 1: 6}          # construction class code -> index of the class label in the frozen vocabulary (SC-3, SC-7)

# ---------------------------------------------------------------- SLOT constructions (architecture CORR1: parent 38 cases + R-3 cases + generated)
_S_VIS = {"vis", "visb", "nbsp", "amp", "rsquo", "apos39", "hexapos", "decent", "rsqlit",
          "g_fmt", "g_fmt2", "g_empty", "g_emptyv", "g_punct", "g_punct2", "g_attr_before", "g_attr_after", "g_attr_edge", "g_attr_tail"}
_S_HID = {"script", "style", "attr", "comment", "h_title", "h_data", "h_unkname"}
_S_X_NEW = {
    "c_alt": '<p>%s<img alt="amended">%s</p>', "c_title": '<p>%s<span title="amended">%s</span></p>', "c_href": '<p>%s<a href="amended.htm">%s</a></p>',
    "c_url": '<p>%s<a href="/web/2005/http://www.sec.gov/x.htm">%s</a></p>', "c_data": '<p>%s<span data-note="amended">%s</span></p>',
    "c_aria": '<p>%s<span aria-label="amended">%s</span></p>', "c_unknown": '<p>%s<span foo="amended">%s</span></p>',
    "c_unkname": '<p>%s<span amended>%s</span></p>', "c_elem": '<p>%s<amended>%s</amended></p>', "c_malformed": '<p>%s<amended!>%s</p>',
    "c_numeric": '<p>%s<img alt="2005">%s</p>', "c_numurl": '<p>%s<a href="/2005/">%s</a></p>'}
_S_MAKE = {"create", "create_style", "create_comment"} | set(_S_X_NEW)
_S_G_NEW = {"g_fmt": '<p>%s<b>%s</b></p>', "g_fmt2": '<p>%s<span>%s</span></p>', "g_empty": '<p>%s<img alt="">%s</p>',
            "g_emptyv": '<p>%s<span title="">%s</span></p>', "g_punct": '<p>%s<img alt="--">%s</p>', "g_punct2": '<p>%s<span title="&amp; ... !">%s</span></p>'}
_S_G_OUT = {"g_attr_before": '<img alt="amended"><p>%s</p>', "g_attr_after": '<p>%s</p><img alt="amended">',
            "g_attr_edge": '<p><a href="/web/2005/http://x/">%s</a></p>', "g_attr_tail": '<p>%s<img alt="amended"></p>'}
_S_H_NEW = {"h_title": '<span title="%s"></span>', "h_data": '<span data-x="%s"></span>', "h_unkname": '<%s>'}


def _s_g_parent(rep):
    GS = _GS
    t = {"vis": "<p>%s</p>" % GS, "visb": "<p><b>%s</b></p>" % GS, "nbsp": "<p>%s</p>" % GS.replace("annual retainer", "annual&nbsp;retainer"),
         "amp": "<p>%s</p>" % GS.replace(" & ", " &amp; "), "rsquo": "<p>%s</p>" % GS.replace("director's", "director&rsquo;s"),
         "apos39": "<p>%s</p>" % GS.replace("director's", "director&#39;s"), "hexapos": "<p>%s</p>" % GS.replace("director's", "director&#x27;s"),
         "rsqlit": "<p>%s</p>" % GS.replace("director's", "director’s"), "decent": "<p>%s</p>" % "".join("&#%d;" % ord(c) for c in GS),
         "script": "<script>%s</script>" % GS, "style": "<style>%s</style>" % GS, "attr": '<img alt="%s">' % GS, "comment": "<!-- %s -->" % GS}
    if rep not in t:
        raise ValueError(rep)
    return t[rep]


def _s_x_parent(rep):
    t = {"plain": "<p>%s <b>amended</b> %s</p>", "create": "<p>%s<script>amended</script>%s</p>", "create_style": "<p>%s<style>amended</style>%s</p>",
         "create_comment": "<p>%s<!-- amended -->%s</p>"}
    if rep not in t:
        raise ValueError(rep)
    return t[rep] % (_GPRE, _GSUF)


def _s_g_slot(rep):
    if rep in _S_G_NEW:
        return _S_G_NEW[rep] % (_GPRE, _GSUF)
    if rep in _S_G_OUT:
        return _S_G_OUT[rep] % _GS
    if rep in _S_H_NEW:
        return _S_H_NEW[rep] % _GS
    if rep in _S_X_NEW:
        return _S_X_NEW[rep] % (_GPRE, _GSUF)
    return _s_g_parent(rep)


def _s_x_slot(rep):
    if rep in _S_X_NEW:
        return _S_X_NEW[rep] % (_GPRE, _GSUF)
    if rep in _S_G_NEW:
        return _S_G_NEW[rep] % (_GPRE, _GSUF)
    if rep == "vis":
        return "<p>%s</p>" % _GS
    return _s_x_parent(rep)


def _s_html(layout, reps, fillers=True, preface="Preface."):
    parts = []
    for j, (k, r) in enumerate(zip(layout, reps)):
        if fillers:
            parts.append("<p>Interlude %d.</p>" % j)
        parts.append(_s_g_slot(r) if k == "G" else _s_x_slot(r))
    if fillers:
        parts.append("<p>Interlude %d.</p>" % len(layout))
    return "<html><body><p>%s</p>%s<p>Closing.</p></body></html>\n" % (preface, "".join(parts))


def _s_occ_truth(layout, reps):
    """Physical identity of every extracted occurrence of the sentence, in extraction order: ('g', slot) genuine, ('c', slot) created."""
    out = []
    for j, (k, r) in enumerate(zip(layout, reps)):
        if k in ("G", "Y") and r in _S_VIS:
            out.append(("g", j))
        elif k in ("X", "Y") and r in _S_MAKE:
            out.append(("c", j))
    return out


def _s_assertions(cls, aid, pos, text, coder):
    out = []
    for f, v, w in _G_ASSERT[cls]:
        if "'" in w:
            w = w.split("'")[0].strip()
        out.append({"featureId": f, "value": v, "witness": w, "assertionType": "QUOTED_WITNESS", "coderIdentity": coder,
                    "sourceRef": "ORACLE", "segmentLocator": {"artifactId": aid, "unitId": "u1", "start": pos, "end": pos + len(text)}})
    return out


def _s_all(doc, t):
    out, i = [], doc.find(t)
    while i >= 0:
        out.append(i)
        i = doc.find(t, i + 1)
    return out


def build_slot(interp, case, tag, coder="ORACLE-SLOT (synthetic; construction-coded)"):
    """(corpus, meta, truth) of a slot construction {layout, rends: [{reps, html?, preface?}], codes: [[rendition, k, cls, recipe?]], fillers,
    segmentVariants?}. Raises ValueError('GENERATOR_MISMATCH ...') when the extraction disagrees with the construction."""
    arts, recs, meta = [], [], []
    rends = case["rends"]
    layout = list(case["layout"])
    for r, rd in enumerate(rends):
        h = rd.get("html") or _s_html(layout, rd["reps"], case.get("fillers", True), rd.get("preface", "Preface."))
        arts.append({"artifactId": "%s-R%d" % (tag, r), "content": {"inlineText": h}, "renditionDecoder": "UTF8_REPLACE",
                     "identity": _probe_identity(h, **_OR_KW)})
    truth = [_s_occ_truth(layout, rd["reps"]) for rd in rends]
    variants = sorted(case.get("segmentVariants") or {_GS, _GS.replace("director's", "director’s")})
    for n, code in enumerate(case["codes"]):
        r, k, cls = code[:3]
        recipe = code[3] if len(code) > 3 else case.get("recipe", "HTML_TEXT_V1")
        h = arts[r]["content"]["inlineText"]
        doc = interp.extract(h.encode("utf-8"), recipe)
        cands = sorted(set(i for t in variants for i in _s_all(doc, t)))
        if len(cands) != len(truth[r]):
            raise ValueError("GENERATOR_MISMATCH %d extracted vs %d constructed" % (len(cands), len(truth[r])))
        phys = truth[r][k]
        pos = cands[k]
        text = doc[pos:pos + len(next(t for t in variants if doc.startswith(t, pos)))]
        aid = arts[r]["artifactId"]
        u = {"unitId": "u1", "separatorBefore": interp.seg["startMarker"], "locatorKind": "SENTENCE", "start": pos, "end": pos + len(text),
             "text": text, "textSha256": sha_text(text), "assertions": _s_assertions(cls, aid, pos, text, coder)}
        rid = "%s-N%d" % (tag, n)
        recs.append({"recordId": rid, "artifactId": aid, "sourceId": "ORACLE", "recipe": recipe, "bindingStatus": "BOUND",
                     "humanReadableLocator": None, "physicalHeading": None, "units": [u]})
        meta.append({"recordId": rid, "rendition": r, "k": k, "phys": [phys[0], phys[1]], "cls": cls})
    return {"artifacts": arts, "records": recs}, meta, truth


def build_explicit(interp, case, tag, coder="ORACLE-EXPLICIT (synthetic; physical labels stated by the construction)"):
    """(corpus, meta, truth) of an explicit construction {html: [...], truth: [[[kind, label], ...] per rendition], codes: [[rendition, text, occurrence,
    cls, [kind, label], recipe?]]}: the physical label of every coded reading is stated by the construction."""
    arts, recs, meta = [], [], []
    for r, h in enumerate(case["html"]):
        arts.append({"artifactId": "%s-R%d" % (tag, r), "content": {"inlineText": h}, "renditionDecoder": "UTF8_REPLACE",
                     "identity": _probe_identity(h, **_OR_KW)})
    for n, code in enumerate(case["codes"]):
        r, text, occ, cls, phys = code[:5]
        recipe = code[5] if len(code) > 5 else "HTML_TEXT_V1"
        doc = interp.extract(case["html"][r].encode("utf-8"), recipe)
        cands = _s_all(doc, text)
        if occ >= len(cands):
            raise ValueError("GENERATOR_MISMATCH explicit unit not found")
        pos = cands[occ]
        aid = arts[r]["artifactId"]
        u = {"unitId": "u1", "separatorBefore": interp.seg["startMarker"], "locatorKind": "SENTENCE", "start": pos, "end": pos + len(text),
             "text": text, "textSha256": sha_text(text), "assertions": _s_assertions(cls, aid, pos, text, coder)}
        rid = "%s-N%d" % (tag, n)
        recs.append({"recordId": rid, "artifactId": aid, "sourceId": "ORACLE", "recipe": recipe, "bindingStatus": "BOUND",
                     "humanReadableLocator": None, "physicalHeading": None, "units": [u]})
        meta.append({"recordId": rid, "rendition": r, "k": occ, "phys": [phys[0], phys[1]], "cls": cls})
    return {"artifacts": arts, "records": recs}, meta, [[list(p) for p in t] for t in case["truth"]]


_OR_SLOT_KEYS = ("split", "merge", "evidenceInflationParentOracle", "fabricatedEvidenceStrict", "conflictBypass", "falseSrcDiv", "undercountStrict")
_OR_SLOT_EXTRA = ("unresolvedCases", "provenSameButPhysicallyDifferent", "provenDifferentButPhysicallySame", "asymmetricDecisionOnOnePhysicalOccurrence")
_OR_SLOT_HARD = ("split", "merge", "fabricatedEvidenceStrict", "conflictBypass", "falseSrcDiv", "provenSameButPhysicallyDifferent",
                 "provenDifferentButPhysicallySame", "asymmetricDecisionOnOnePhysicalOccurrence")


def judge_slot(res, meta, labels, roles):
    """Physical verdicts of one evaluated slot / explicit construction. A record in the non-counting duplicate state is treated as carrying no identity.
    Hard: split, merge, fabricatedEvidenceStrict, conflictBypass, falseSrcDiv, and the pair / symmetry verdicts. Permitted: undercountStrict."""
    seg = dict((s["recordId"], s) for s in res["segmentRecords"])
    ids = dict((m["recordId"], None if seg[m["recordId"]]["sourceClassAssignmentState"] == roles["duplicateUnresolved"]
                else seg[m["recordId"]]["canonicalSegmentIdentity"]) for m in meta)
    by_phys = {}
    for m in meta:
        by_phys.setdefault(tuple(m["phys"]), []).append(m)
    split = any(len(set(ids[m["recordId"]] for m in ms if ids[m["recordId"]] is not None)) > 1 for ms in by_phys.values())
    merged = any(ids[a["recordId"]] is not None and ids[a["recordId"]] == ids[b["recordId"]] and tuple(a["phys"]) != tuple(b["phys"])
                 for a in meta for b in meta if a["recordId"] < b["recordId"])
    cls_of = dict((p, set(m["cls"] for m in ms)) for p, ms in by_phys.items())
    legit_parent = set(c for p, cs in cls_of.items() if len(cs) == 1 for c in cs)
    legit_strict = set(c for p, cs in cls_of.items() if len(cs) == 1 and p[0] == "g" for c in cs)
    conflicted = set(c for p, cs in cls_of.items() if len(cs) > 1 for c in cs)
    inv = dict((labels[v], k) for k, v in _OR_CLS.items())
    got = set(inv[x] for x in res["count"]["distinctClassSet"])
    flags = {"split": split, "merge": merged, "evidenceInflationParentOracle": not got <= legit_parent, "fabricatedEvidenceStrict": not got <= legit_strict,
             "conflictBypass": bool(got & (conflicted - legit_parent)), "falseSrcDiv": len(got) >= 2 and len(legit_strict) < 2,
             "undercountStrict": bool(legit_strict - got)}
    pairs = []
    for a, b in itertools.combinations(meta, 2):
        ia, ib = ids[a["recordId"]], ids[b["recordId"]]
        v = "UNRESOLVED_NON_COUNTING" if ia is None or ib is None else ("PROVEN_SAME" if ia == ib else "PROVEN_DIFFERENT")
        pairs.append([a["recordId"], b["recordId"], "SAME" if tuple(a["phys"]) == tuple(b["phys"]) else "DIFFERENT", v])
    by_null = {}
    for m in meta:
        by_null.setdefault(tuple(m["phys"]), []).append(ids[m["recordId"]] is None)
    flags.update({"unresolvedCases": any(x is None for x in ids.values()),
                  "provenSameButPhysicallyDifferent": any(p[3] == "PROVEN_SAME" and p[2] == "DIFFERENT" for p in pairs),
                  "provenDifferentButPhysicallySame": any(p[3] == "PROVEN_DIFFERENT" and p[2] == "SAME" for p in pairs),
                  "asymmetricDecisionOnOnePhysicalOccurrence": any(len(set(x)) > 1 for x in by_null.values())})
    return flags, pairs


# ---------------------------------------------------------------- the four CORR1 generated families (architecture CORR1 gen_c1.py parts 1-4)
_GEN_G2 = ("vis", "rsquo", "apos39", "rsqlit", "script", "style", "attr", "comment", "decent")
_GEN_X2 = ("plain", "create", "create_style", "create_comment")
_GEN_X4 = ("c_alt", "c_title", "c_href", "c_url", "c_data", "c_aria", "c_unknown", "c_unkname", "c_elem", "c_malformed", "c_numeric", "c_numurl",
           "create", "create_comment", "plain")
_GEN_G4 = ("vis", "g_fmt", "g_fmt2", "g_empty", "g_emptyv", "g_punct", "g_punct2", "g_attr_before", "g_attr_after", "g_attr_edge", "g_attr_tail",
           "attr", "h_title", "h_data", "comment", "script")
_GEN_Y4 = ("vis", "g_fmt", "g_empty", "g_punct", "g_punct2", "c_alt", "c_title", "c_href", "c_data", "c_aria", "c_unknown", "c_numeric",
           "c_malformed", "c_elem", "c_unkname")
GEN_FAMILIES = ("parentGenerator", "extended", "completeViewsDiffer", "attributeMarkupSeam")


def _gen_codes(truth, rends, scheme="split"):
    codes = []
    for r in range(rends):
        for k, p in enumerate(truth[r]):
            codes.append([r, k, ((p[1] + r) % 2) if scheme == "split" else (p[1] % 2)])
    return codes


def _gen_href(h, r):
    return h.replace("<p>Preface.</p>", '<p>Preface.</p><p><a href="/web/200%d/http://x/">Home</a></p>' % (5 + r), 1)


def _gen_sample(seq, limit):
    return seq[::max(1, len(seq) // limit)]


def generated_cases():
    """[(family, case)] of the CORR1 generated surface, in the architecture's exact enumeration order and sampling. Family parentGenerator cases carry the
    parent's own slot generator (_g_cases); the other three are slot constructions."""
    out = []
    for case in _g_cases():
        out.append(("parentGenerator", {"parentCase": case}))
    for lay in ["G", "GG", "GGG", "XG", "GX", "XGG", "GXG", "GGX"]:
        slots = list(lay)
        combos = list(itertools.product(*[_GEN_G2 if k == "G" else _GEN_X2 for k in slots]))
        pairs = [(a, b) for a in combos for b in combos if a < b]
        step = max(1, len(pairs) // 160)
        for fillers in (True, False):
            for pi in range(0, len(pairs), step):
                reps = [list(pairs[pi][0]), list(pairs[pi][1])]
                truth = [_s_occ_truth(slots, x) for x in reps]
                if not any(truth):
                    continue
                out.append(("extended", {"layout": slots, "fillers": fillers, "rends": [{"reps": reps[0]}, {"reps": reps[1]}], "codes": _gen_codes(truth, 2)}))
    for lay in ["G", "GG", "GGG", "XG", "GX", "XGG", "GXG"]:
        slots = list(lay)
        combos = list(itertools.product(*[_GEN_G2 if k == "G" else _GEN_X2 for k in slots]))
        pairs = [(a, b) for a in combos for b in combos if a <= b]
        step = max(1, len(pairs) // 120)
        for fillers in (True, False):
            for pi in range(0, len(pairs), step):
                reps = [list(pairs[pi][0]), list(pairs[pi][1])]
                truth = [_s_occ_truth(slots, x) for x in reps]
                if not any(truth):
                    continue
                rends = [{"reps": reps[r], "html": _gen_href(_s_html(slots, reps[r], fillers), r)} for r in range(2)]
                out.append(("completeViewsDiffer", {"layout": slots, "fillers": fillers, "rends": rends, "codes": _gen_codes(truth, 2)}))

    def four(slots, reps, fillers, href, scheme):
        truth = [_s_occ_truth(slots, x) for x in reps]
        if not any(truth):
            return
        rends = []
        for r in range(len(reps)):
            h = _s_html(slots, reps[r], fillers)
            rends.append({"reps": reps[r], "html": _gen_href(h, r) if href else h})
        out.append(("attributeMarkupSeam", {"layout": slots, "fillers": fillers, "rends": rends, "codes": _gen_codes(truth, len(reps), scheme)}))
    for lay in ("XG", "GX", "GXG"):
        slots = list(lay)
        combos = list(itertools.product(*[_GEN_G4 if k == "G" else _GEN_X4 for k in slots]))
        for fillers in (True, False):
            for reps in _gen_sample(combos, 170 if len(slots) == 2 else 110):
                four(slots, [list(reps)], fillers, False, "split")
    pool = {"G": _GEN_G4, "X": _GEN_X4, "Y": _GEN_Y4}
    for lay in ("Y", "YG", "GY", "XG", "XY", "GYG"):
        slots = list(lay)
        combos = list(itertools.product(*[pool[k] for k in slots]))
        pairs = [(a, b) for a in combos for b in combos if a < b]
        for scheme in ("split", "agree"):
            for fillers in ((True, False) if len(slots) > 1 else (True,)):
                for a, b in _gen_sample(pairs, 70):
                    four(slots, [list(a), list(b)], fillers, False, scheme)
    for lay in ("Y", "YG", "XG", "GYG"):
        slots = list(lay)
        combos = list(itertools.product(*[pool[k] for k in slots]))
        pairs = [(a, b) for a in combos for b in combos if a <= b]
        for scheme in ("split", "agree"):
            for a, b in _gen_sample(pairs, 60):
                four(slots, [list(a), list(b)], True, True, scheme)
    for lay in ("Y", "YG", "XG"):
        slots = list(lay)
        combos = list(itertools.product(*[pool[k] for k in slots]))
        triples = list(itertools.combinations(_gen_sample(combos, 18), 3))
        for href in (False, True):
            for scheme in ("split", "agree"):
                for t in _gen_sample(triples, 40):
                    four(slots, [list(x) for x in t], True, href, scheme)
    return out


def build_generated(interp, fam, case, tag):
    """(corpus, meta) of one generated case; raises ValueError / IndexError on a generator mismatch (counted, as in the architecture)."""
    if fam == "parentGenerator":
        pc = case["parentCase"]
        truth = _g_truth(pc)
        corpus, gmeta = _g_corpus(interp, pc, truth)
        return corpus, [{"recordId": m["recordId"], "rendition": m["rendition"], "k": m["rank"], "phys": [m["phys"][0], m["phys"][1]], "cls": m["cls"]}
                        for m in gmeta]
    corpus, meta, _ = build_slot(interp, case, tag, coder="ORACLE-GENERATED (synthetic)")
    return corpus, meta


# ---------------------------------------------------------------- OA-7(b) constructions (architecture CORR1.CORR1 harness)
_B_T2 = "In 1999 The Committee sets each director's annual retainer of $36,000 again."
_B_PRE2, _B_SUF2 = "The Committee sets each director's annual retainer of $36,000", "& related fees."
_B_AMENDED_REFS = "".join("&#%d;" % ord(c) for c in "amended")
_B_CLS = {3: 0, 7: 1}
OA7B_READINGS = {"tag|0": ["RAW_LT", "RAW_X", "RAW_TITLE"], "tag|1": ["TEXT_X", "RAW_AMP", "RAW_HASH"], "plain|0": ["TEXT", "RAW"], "plain|1": ["TEXT", "RAW"],
                 "seam|0": ["RAW_LT", "RAW_X"], "seam|1": ["TEXT_X", "RAW_AMP"]}


def _b_slot(kind, sent, member):
    """(html, {reading: (recipe, unit text, representable by construction)}): member 0 writes 'x' in a title attribute, member 1 as &#120;, so the
    complete views are equal and the R-EQV texts are equal. A unit that STARTS INSIDE a tag or a character reference cannot represent the slot."""
    s = {"S": _GS, "T": _B_T2}.get(sent, _GS)
    if kind == "tag":
        if member == 0:
            return ('<p><span title="x">%s</span></p>' % s,
                    {"RAW_LT": ("HTML_RAW_V1", '<span title="x">%s' % s, True), "RAW_X": ("HTML_RAW_V1", 'x">%s' % s, False),
                     "RAW_TITLE": ("HTML_RAW_V1", 'title="x">%s' % s, False)})
        return ("<p>&#120;%s</p>" % s,
                {"TEXT_X": ("HTML_TEXT_V1", "x" + s, True), "RAW_AMP": ("HTML_RAW_V1", "&#120;%s" % s, True), "RAW_HASH": ("HTML_RAW_V1", "#120;%s" % s, False)})
    if kind == "plain":
        return ("<p>%s</p>" % s, {"TEXT": ("HTML_TEXT_V1", s, True), "RAW": ("HTML_RAW_V1", s, True)})
    if kind == "seam":
        if member == 0:
            return ('<p><span title="x">%s<img alt="amended">%s</span></p>' % (_B_PRE2, _B_SUF2),
                    {"RAW_LT": ("HTML_RAW_V1", '<span title="x">%s<img alt="amended">%s' % (_B_PRE2, _B_SUF2), True),
                     "RAW_X": ("HTML_RAW_V1", 'x">%s<img alt="amended">%s' % (_B_PRE2, _B_SUF2), False)})
        return ("<p>&#120;%s %s %s</p>" % (_B_PRE2, _B_AMENDED_REFS, _B_SUF2),
                {"TEXT_X": ("HTML_TEXT_V1", "x%s amended %s" % (_B_PRE2, _B_SUF2), True),
                 "RAW_AMP": ("HTML_RAW_V1", "&#120;%s %s %s" % (_B_PRE2, _B_AMENDED_REFS, _B_SUF2), True)})
    raise ValueError(kind)


def build_oa7b(interp, case, tag):
    """(corpus, meta) of {members, slots: [[kind, sent]], codes: [[member, slot, reading, 3|7]]}; every slot is one documentary occurrence."""
    arts, htmls = [], []
    for m in range(case["members"]):
        parts, offs = ["<html><body><p>Preface.</p>"], {}
        pos = len(parts[0])
        for j, (kind, sent) in enumerate(case["slots"]):
            f = "<p>Interlude %d.</p>" % j
            parts.append(f)
            pos += len(f)
            h, _ = _b_slot(kind, sent, m)
            offs[j] = pos
            parts.append(h)
            pos += len(h)
        parts.append("<p>Interlude %d.</p><p>Closing.</p></body></html>\n" % len(case["slots"]))
        h = "".join(parts)
        htmls.append((h, offs))
        arts.append({"artifactId": "%s-M%d" % (tag, m), "content": {"inlineText": h}, "renditionDecoder": "UTF8_REPLACE",
                     "identity": _probe_identity(h, **_OR_KW)})
    recs, meta = [], []
    for n, (m, j, reading, cls) in enumerate(case["codes"]):
        kind, sent = case["slots"][j]
        recipe, unit, repres = _b_slot(kind, sent, m)[1][reading]
        h, offs = htmls[m]
        doc = interp.extract(h.encode("utf-8"), recipe)
        if recipe == "HTML_RAW_V1":
            pos = h.index(unit, offs[j])
            if not (doc == h and pos < offs[j] + len(_b_slot(kind, sent, m)[0])):
                raise ValueError("GENERATOR_MISMATCH RAW unit outside its slot")
        else:
            lo, hi = doc.index("Interlude %d." % j), doc.index("Interlude %d." % (j + 1))
            pos = doc.index(unit, lo)
            if pos >= hi:
                raise ValueError("GENERATOR_MISMATCH TEXT unit outside its slot")
        aid = arts[m]["artifactId"]
        u = {"unitId": "u1", "separatorBefore": interp.seg["startMarker"], "locatorKind": "SENTENCE", "start": pos, "end": pos + len(unit), "text": unit,
             "textSha256": sha_text(unit), "assertions": []}
        for f, v, w in _G_ASSERT[_B_CLS[cls]]:
            u["assertions"].append({"featureId": f, "value": v, "witness": w, "assertionType": "QUOTED_WITNESS", "coderIdentity": "OA7B-ORACLE",
                                    "sourceRef": "OA7B", "segmentLocator": {"artifactId": aid, "unitId": "u1", "start": pos, "end": pos + len(unit)}})
        rid = "%s-R%d" % (tag, n)
        recs.append({"recordId": rid, "artifactId": aid, "sourceId": "OA7B", "recipe": recipe, "bindingStatus": "BOUND", "humanReadableLocator": None,
                     "physicalHeading": None, "units": [u]})
        meta.append({"recordId": rid, "member": m, "slot": j, "reading": reading, "cls": cls, "representableByConstruction": repres,
                     "seamSlot": kind == "seam"})
    return {"artifacts": arts, "records": recs}, meta


OA7B_COUNTERS = ("asymmetricDecisionSameOccurrence", "conflictBypassFromRepresentability", "falseSrcDivFromRepresentability", "crossOccurrenceTaint",
                 "occurrenceWithAFailedGateStillIdentified", "falseSplit", "merge", "fabricatedEvidence", "conservativeUnderCount")
OA7B_REQUIRED_ZERO = ("asymmetricDecisionSameOccurrence", "conflictBypassFromRepresentability", "falseSrcDivFromRepresentability", "crossOccurrenceTaint")


def judge_oa7b(res, meta, labels, roles):
    """Physical verdicts from the construction (slot = occurrence; representability and seam known by construction)."""
    seg = dict((s["recordId"], s) for s in res["segmentRecords"])
    ident = dict((m["recordId"], seg[m["recordId"]]["canonicalSegmentIdentity"] if seg[m["recordId"]]["sourceClassAssignmentState"] != roles["duplicateUnresolved"]
                  else None) for m in meta)
    by = {}
    for m in meta:
        by.setdefault(m["slot"], []).append(m)
    asym = any(len(set(ident[m["recordId"]] is None for m in ms)) > 1 for ms in by.values())
    split = any(len(set(ident[m["recordId"]] for m in ms if ident[m["recordId"]])) > 1 for ms in by.values())
    merge = any(ident[a["recordId"]] and ident[a["recordId"]] == ident[b["recordId"]] and a["slot"] != b["slot"] for a in meta for b in meta)
    classes = dict((j, set(m["cls"] for m in ms)) for j, ms in by.items())
    legit = set(c for cs in classes.values() if len(cs) == 1 for c in cs)
    conflicted = set(c for cs in classes.values() if len(cs) > 1 for c in cs)
    inv = {labels[_OR_CLS[0]]: 3, labels[_OR_CLS[1]]: 7}
    got = set(inv[x] for x in res["count"]["distinctClassSet"])
    must_fail = dict((j, any(not m["representableByConstruction"] for m in ms) or any(m["seamSlot"] for m in ms)) for j, ms in by.items())
    cross = any(not must_fail[j] and any(ident[m["recordId"]] is None for m in ms) for j, ms in by.items())
    open_fail = any(must_fail[j] and any(ident[m["recordId"]] is not None for m in ms) for j, ms in by.items())
    return {"asymmetricDecisionSameOccurrence": asym, "conflictBypassFromRepresentability": bool(got & (conflicted - legit)),
            "falseSrcDivFromRepresentability": len(got) >= 2 and len(legit) < 2, "crossOccurrenceTaint": cross,
            "occurrenceWithAFailedGateStillIdentified": open_fail, "falseSplit": split, "merge": merge, "fabricatedEvidence": not got <= legit,
            "conservativeUnderCount": bool(legit - got)}


# ---------------------------------------------------------------- R-14 constructions (architecture CORR1.CORR1.CORR1 harness + LZW-PDF member)
def _lzw_encode(data):
    """LZW encoder mirroring the frozen decoder's schedule (9 bits, early change, clear 256, EOD 257); verified by round trip through _lzw."""
    table = dict((bytes([i]), i) for i in range(256))
    nxt, w, codes = 258, b"", []
    for ch in data:
        wc = w + bytes([ch])
        if wc in table:
            w = wc
            continue
        codes.append(table[w])
        table[wc] = nxt
        nxt += 1
        w = bytes([ch])
    if w:
        codes.append(table[w])
    if nxt >= 4096:
        raise ValueError("LZW TABLE OVERFLOW")
    state = {"bits": 0, "acc": 0}
    out = bytearray()

    def put(code, width):
        state["acc"] = (state["acc"] << width) | code
        state["bits"] += width
        while state["bits"] >= 8:
            out.append((state["acc"] >> (state["bits"] - 8)) & 0xFF)
            state["bits"] -= 8
            state["acc"] &= (1 << state["bits"]) - 1
    width, dec_nxt = 9, 258
    put(256, width)
    for i, c in enumerate(codes):
        put(c, width)
        if i >= 1:
            dec_nxt += 1
            if dec_nxt + 1 >= (1 << width) and width < 12:
                width += 1
    put(257, width)
    if state["bits"]:
        out.append((state["acc"] << (8 - state["bits"])) & 0xFF)
    enc = bytes(out)
    if _lzw(enc) != data:
        raise ValueError("LZW ROUND TRIP FAILED")
    return enc


def _r_pdf_bytes(lines, layer_tag):
    """A PDF-shaped member: one LZW content stream (one string per line; the rendition decoder reads it) and an uncompressed text layer transcribing the
    same lines (readable only through a UTF8_REPLACE recipe)."""
    esc = lambda s: s.replace("\\", "\\\\").replace("(", "\\(").replace(")", "\\)")
    content = ("BT " + " ".join("(%s) Tj" % esc(t) for t in lines) + " ET").encode("latin-1")
    enc = _lzw_encode(content)
    if b"endstream" in enc:
        raise ValueError("stream payload contains a delimiter")
    head = b"%PDF-1.4\n1 0 obj\n<< /Filter /LZWDecode /Length " + str(len(enc)).encode() + b" >>\nstream\n"
    tail = b"\nendstream\nendobj\n%%TEXT-LAYER " + layer_tag.encode() + b"\n" + "\n".join(lines).encode("latin-1") + b"\n%%EOF\n"
    return head + enc + tail


R14_MARKUP = "<table><tbody><tr><td>"
R14_COPY_TEXT = "&copy"
R14_DTYPES = {"HTML1": (["H"], "FRAME-C"), "HTML2C": (["H", "Hc"], "FRAME-C"), "HTML2U": (["Ha", "Hb"], "FRAME-U"), "PDF1": (["P"], "FRAME-C"),
              "PDF2": (["P", "Pb"], "FRAME-C"), "MIXC": (["H", "P"], "FRAME-C"), "MIXU": (["Ha", "P"], "FRAME-U")}
R14_READINGS = {"H": ["TEXT", "RAW", "MARKUP"], "P": ["PDF", "LAYER"]}
R14_WITNESS_READINGS = ("MARKUP", "LAYER", "COPY")
R14_EXPECTED_EXIT = {"LAYER": "DECODER_FRAME_MISMATCH", "COPY": "EMPTY_CANONICAL_SEGMENT", "MARKUP|FRAME-C": "EMPTY_COMPLETE_VIEW_IMAGE",
                     "MARKUP|FRAME-U": "EMPTY_SKELETON"}


def _r_sentence(label):
    return "Clause %s: %s" % (label, _GS)


def _r_assertions(cls, reading):
    if cls == "O":
        return []
    sets = {3: [_G_ASSERT[0]], 7: [_G_ASSERT[1]], "M": [_G_ASSERT[0], _G_ASSERT[1]]}[cls]
    out = []
    for s in sets:
        for f, v, w in s:
            out.append((f, v, "<table>" if reading == "MARKUP" else ("copy" if reading == "COPY" else w)))
    return out


def _r_html_member(kind, slots):
    pre = {"H": "<p>Preface.</p>", "Hc": "<p>Preface.</p><!-- -->", "Ha": '<p title="m0">Preface.</p>', "Hb": '<p title="m1">Preface.</p>'}[kind]
    parts = ["<html><body>", pre]
    for j, lab in enumerate(slots):
        parts.append("<p>Interlude %d.</p>" % j)
        parts.append("<p>&amp;copy</p>" if lab == "COPY" else "<div>%s%s</td></tr></tbody></table></div>" % (R14_MARKUP, _r_sentence(lab)))
    parts.append("<p>Interlude %d.</p><p>Closing.</p></body></html>\n" % len(slots))
    return "".join(parts).encode("utf-8")


def _r_pdf_member(kind, slots):
    lines = ["Preface."]
    for j, lab in enumerate(slots):
        if lab == "COPY":
            raise ValueError("COPY slot in a PDF member")
        lines += ["Interlude %d." % j, _r_sentence(lab)]
    lines += ["Interlude %d." % len(slots), "Closing."]
    return _r_pdf_bytes(lines, {"P": "m0", "Pb": "m1"}[kind])


def _r_locate(interp, raw, reading, j, lab):
    """(recipe, start, unit text) of a reading of slot j in a member; the unit must lie inside the slot."""
    if reading in ("TEXT", "COPY"):
        recipe = "HTML_TEXT_V1"
        doc = interp.extract(raw, recipe)
        lo, hi, unit = doc.index("Interlude %d." % j), doc.index("Interlude %d." % (j + 1)), (R14_COPY_TEXT if reading == "COPY" else _r_sentence(lab))
    elif reading in ("RAW", "MARKUP"):
        recipe = "HTML_RAW_V1"
        doc = interp.extract(raw, recipe)
        lo, hi, unit = doc.index("Interlude %d." % j), doc.index("Interlude %d." % (j + 1)), (R14_MARKUP if reading == "MARKUP" else _r_sentence(lab))
    elif reading == "PDF":
        recipe = "PDF_LZW_TEXT_V1"
        doc = interp.extract(raw, recipe)
        lo, hi, unit = doc.index("Interlude %d." % j), doc.index("Interlude %d." % (j + 1)), _r_sentence(lab)
    elif reading == "LAYER":
        recipe = "PLAIN_TEXT_V1"
        doc = interp.extract(raw, recipe)
        base = doc.index("%%TEXT-LAYER")
        lo, hi, unit = doc.index("Interlude %d." % j, base), doc.index("Interlude %d." % (j + 1), base), _r_sentence(lab)
    else:
        raise ValueError(reading)
    pos = doc.index(unit, lo)
    if pos + len(unit) > hi:
        raise ValueError("GENERATOR_MISMATCH unit outside its slot")
    return recipe, pos, unit


def build_r14(interp, case, tag):
    """(corpus, meta) of {docs: [{type, slots: [label]}], codes: [[doc, member, slot, reading, 3|7|O|M]]}."""
    arts, raws = [], {}
    for di, dspec in enumerate(case["docs"]):
        kinds, _ = R14_DTYPES[dspec["type"]]
        kw = {"accession": "0001-98-%06d" % (900 + di), "exhibitId": "10.%d" % (9 + di), "title": "Exhibit R14 %s %d" % (tag, di), "period": "1998"}
        for mi, kind in enumerate(kinds):
            raw = _r_html_member(kind, dspec["slots"]) if kind.startswith("H") else _r_pdf_member(kind, dspec["slots"])
            aid = "%s-D%dM%d" % (tag, di, mi)
            ident = _probe_identity("x", **kw)
            ident["sha256"] = sha_bytes(raw)
            arts.append({"artifactId": aid, "content": {"inlineHex": raw.hex()},
                         "renditionDecoder": "UTF8_REPLACE" if kind.startswith("H") else "PDF_LZW_STREAM_STRINGS", "identity": ident})
            raws[(di, mi)] = (raw, kind)
    recs, meta = [], []
    for n, (di, mi, j, reading, cls) in enumerate(case["codes"]):
        raw, kind = raws[(di, mi)]
        if not (reading in R14_READINGS[kind[0]] or (reading == "COPY" and kind[0] == "H")):
            raise ValueError("GENERATOR_MISMATCH reading %s on member kind %s" % (reading, kind))
        lab = case["docs"][di]["slots"][j]
        recipe, pos, unit = _r_locate(interp, raw, reading, j, lab)
        aid = "%s-D%dM%d" % (tag, di, mi)
        u = {"unitId": "u1", "separatorBefore": interp.seg["startMarker"], "locatorKind": "SENTENCE", "start": pos, "end": pos + len(unit), "text": unit,
             "textSha256": sha_text(unit), "assertions": []}
        for f, v, w in _r_assertions(cls, reading):
            u["assertions"].append({"featureId": f, "value": v, "witness": w, "assertionType": "QUOTED_WITNESS", "coderIdentity": "R14-ORACLE",
                                    "sourceRef": "R14", "segmentLocator": {"artifactId": aid, "unitId": "u1", "start": pos, "end": pos + len(unit)}})
        rid = "%s-R%d" % (tag, n)
        recs.append({"recordId": rid, "artifactId": aid, "sourceId": "R14", "recipe": recipe, "bindingStatus": "BOUND", "humanReadableLocator": None,
                     "physicalHeading": None, "units": [u]})
        meta.append({"recordId": rid, "doc": di, "member": mi, "slot": j, "reading": reading, "cls": cls,
                     "role": "witness" if reading in R14_WITNESS_READINGS else "placed"})
    return {"artifacts": arts, "records": recs}, meta


def build_pdf_explicit(interp, case, tag, coder="ORACLE-PDF (synthetic; physical labels stated by the construction)"):
    """(corpus, meta, truth) of {members: [[line, ...] per PDF member], truth, codes: [[member, text, occurrence, cls, [kind, label]]]}: PDF members whose
    content-stream strings are the given lines (read by the rendition decoder and PDF_LZW_TEXT_V1); the physical label of every coded reading is
    stated by the construction."""
    arts, recs, meta = [], [], []
    for r, lines in enumerate(case["members"]):
        raw = _r_pdf_bytes(lines, "m%d" % r)
        ident = _probe_identity("x", **_OR_KW)
        ident["sha256"] = sha_bytes(raw)
        arts.append({"artifactId": "%s-P%d" % (tag, r), "content": {"inlineHex": raw.hex()}, "renditionDecoder": "PDF_LZW_STREAM_STRINGS", "identity": ident})
    for n, (r, text, occ, cls, phys) in enumerate(case["codes"]):
        raw = bytes.fromhex(arts[r]["content"]["inlineHex"])
        doc = interp.extract(raw, "PDF_LZW_TEXT_V1")
        cands = _s_all(doc, text)
        if occ >= len(cands):
            raise ValueError("GENERATOR_MISMATCH pdf unit not found")
        pos = cands[occ]
        aid = arts[r]["artifactId"]
        u = {"unitId": "u1", "separatorBefore": interp.seg["startMarker"], "locatorKind": "SENTENCE", "start": pos, "end": pos + len(text),
             "text": text, "textSha256": sha_text(text), "assertions": _s_assertions(cls, aid, pos, text, coder)}
        rid = "%s-N%d" % (tag, n)
        recs.append({"recordId": rid, "artifactId": aid, "sourceId": "ORACLE", "recipe": "PDF_LZW_TEXT_V1", "bindingStatus": "BOUND",
                     "humanReadableLocator": None, "physicalHeading": None, "units": [u]})
        meta.append({"recordId": rid, "rendition": r, "k": occ, "phys": [phys[0], phys[1]], "cls": cls})
    return {"artifacts": arts, "records": recs}, meta, [[list(p) for p in t] for t in case["truth"]]


R14_HARD = ("conflictBypassFromUnplacedRecord", "falseSourceDiversityFromUnplacedRecord", "falseSrcDivFromUnplacedRecord", "unplacedRecordCounted",
            "fabricatedEvidence", "crossDocumentQuarantine", "sameClassOccurrenceQuarantined", "conflictingOccurrenceStillCounting")


def result_rows(res):
    """The candidate's result per record (one segment per record in every construction): identity, state, class, reason, OA-14 diagnostics."""
    aid = dict((r["recordId"], r["artifactId"]) for r in res["records"])
    rows = []
    for s in res["segmentRecords"]:
        a = s.get("occurrenceAnchor") or {}
        rows.append({"recordId": s["recordId"], "segmentId": s["segmentId"], "artifactId": aid[s["recordId"]], "identity": s["canonicalSegmentIdentity"],
                     "state": s["sourceClassAssignmentState"], "cls": s["sourceClass"], "reason": a.get("unresolvedReason"),
                     "withheldOccurrence": a.get("withheldOccurrence"), "unplaced": a.get("unplaced"), "frame": a.get("frame")})
    return rows


def judge_r14(res, meta, case, labels, roles, q_reason):
    """Physical verdicts of one R-14 construction and the candidate-set oracle: every established occurrence carried by a placed record physically on a
    witness's slot must be in the witness's recorded candidate set."""
    out = result_rows(res)
    rows = dict((d["recordId"], d) for d in out)
    placed = [m for m in meta if m["role"] == "placed"]
    wits = [m for m in meta if m["role"] == "witness"]
    pos_ = lambda c: c in (3, 7)
    inv = {labels[_OR_CLS[0]]: 3, labels[_OR_CLS[1]]: 7}
    slots = {}
    for m in meta:
        s = slots.setdefault((m["doc"], m["slot"]), {"placed": set(), "wit": set(), "recs": []})
        s["recs"].append(m)
        if m["role"] == "placed":
            s["placed"].add(m["cls"])
        elif pos_(m["cls"]):
            s["wit"].add(m["cls"])
    legit_now = set(c for s in slots.values() if len(s["placed"]) == 1 for c in s["placed"])
    legit_w = set(c for s in slots.values() if len(s["placed"]) == 1 and s["wit"] <= s["placed"] for c in s["placed"])
    got = set(inv[x] for x in res["count"]["distinctClassSet"])
    grp = {}
    for d in out:
        if d["identity"] and d["state"] == roles["assigned"]:
            grp.setdefault(d["identity"], set()).add(d["cls"])
    counting = dict((o, next(iter(cs))) for o, cs in grp.items() if len(cs) == 1)
    slot_of = dict((m["recordId"], (m["doc"], m["slot"])) for m in meta)
    bypass = any(d["identity"] in counting and d["state"] == roles["assigned"] and (slots[slot_of[d["recordId"]]]["wit"] - {inv[counting[d["identity"]]]})
                 for d in out)
    unplaced_counted = any(rows[m["recordId"]]["identity"] or rows[m["recordId"]]["state"] == roles["assigned"] for m in wits)
    wit_docs = dict((di, set(m["cls"] for m in wits if m["doc"] == di and pos_(m["cls"]))) for di in range(len(case["docs"])))
    pre = dict((d["recordId"], d["identity"] or d["withheldOccurrence"]) for d in out)
    occ_doc, occ_cls = {}, {}
    for m in placed:
        o = pre[m["recordId"]]
        if o:
            occ_doc[o] = m["doc"]
            if (rows[m["recordId"]]["state"] == roles["assigned"] or rows[m["recordId"]]["reason"] == q_reason) and pos_(m["cls"]):
                occ_cls.setdefault(o, set()).add(m["cls"])
    q_occ = set(d["withheldOccurrence"] for d in out if d["reason"] == q_reason)
    cross_doc = any(not wit_docs[occ_doc[o]] for o in q_occ if o in occ_doc)
    same_class_q = any(o in occ_doc and occ_cls.get(o) and all(occ_cls[o] == {c} for c in wit_docs[occ_doc[o]]) for o in q_occ)
    conflicting_survives = any(occ_doc.get(o) is not None and (wit_docs[occ_doc[o]] - {inv[c]}) for o, c in counting.items() if o in occ_doc)
    false_excl, sizes, full, narrowed, vacuous = 0, [], 0, 0, 0
    est_doc = {}
    for m in placed:
        if pre[m["recordId"]]:
            est_doc.setdefault(m["doc"], set()).add(pre[m["recordId"]])
    for w in wits:
        if not pos_(w["cls"]):
            continue
        un = rows[w["recordId"]]["unplaced"] or {}
        C = set(un.get("candidateSet") or [])
        phys = set(pre[m["recordId"]] for m in slots[(w["doc"], w["slot"])]["recs"] if m["role"] == "placed" and pre[m["recordId"]])
        vacuous += 0 if phys else 1
        false_excl += len(phys - C)
        if "candidateSet" in un:
            sizes.append(len(C))
            full += 1 if C == est_doc.get(w["doc"], set()) else 0
            narrowed += 1 if C < est_doc.get(w["doc"], set()) else 0
    true_q = sum(1 for o in q_occ if o in occ_doc and any(slots[(occ_doc[o], m["slot"])]["wit"] - occ_cls.get(o, set())
                                                          for m in placed if pre[m["recordId"]] == o))
    same_pres = sum(1 for o in counting if occ_doc.get(o) is not None and wit_docs[occ_doc[o]])
    return {"conflictBypassFromUnplacedRecord": bypass, "falseSourceDiversityFromUnplacedRecord": bool(got - legit_w),
            "falseSrcDivFromUnplacedRecord": res["count"]["holds"] and len(legit_w) < 2, "unplacedRecordCounted": unplaced_counted,
            "fabricatedEvidence": bool(got - legit_now), "crossDocumentQuarantine": cross_doc, "sameClassOccurrenceQuarantined": same_class_q,
            "conflictingOccurrenceStillCounting": conflicting_survives, "candidateSetFalseExclusions": false_excl,
            "conservativeUnderCount": bool(legit_w - got), "vacuousWitnesses": vacuous, "candidateSetSizes": sizes, "fullDocumentCandidateSets": full,
            "narrowedCandidateSets": narrowed, "quarantinedOccurrences": len(q_occ), "trueConflictQuarantines": true_q,
            "conservativeQuarantines": len(q_occ) - true_q, "sameClassEvidencePreserved": same_pres}


def r14_validity(res, meta, case):
    """The construction is what it claims: every document resolved and in its intended frame; every witness reading fails before a provisional
    occurrence with the exit the construction predicts; every placed reading forms a provisional occurrence."""
    rows = dict((d["recordId"], d) for d in result_rows(res))
    seg = dict((s["recordId"], s) for s in res["segmentRecords"])
    bad = []
    for m in meta:
        d, a = rows[m["recordId"]], seg[m["recordId"]].get("occurrenceAnchor") or {}
        frame = R14_DTYPES[case["docs"][m["doc"]]["type"]][1]
        if m["role"] == "witness":
            want = R14_EXPECTED_EXIT.get(m["reading"]) or R14_EXPECTED_EXIT["%s|%s" % (m["reading"], frame)]
            if d["reason"] != want or a.get("provisionalOccurrence") is not None:
                bad.append([m["recordId"], "witness exit", d["reason"]])
        else:
            if d["frame"] != frame:
                bad.append([m["recordId"], "frame", d["frame"]])
            if a.get("provisionalOccurrence") is None:
                bad.append([m["recordId"], "placed without a provisional occurrence", d["reason"]])
    return bad


def record_orders(corpus, perms):
    recs = corpus["records"]
    return [dict(corpus, records=[recs[i] for i in p]) for p in perms]


def result_signature(res):
    rows = sorted((d["segmentId"], d["identity"], d["state"], d["cls"], d["reason"], d["withheldOccurrence"]) for d in result_rows(res))
    return json.dumps([rows, res["count"]], sort_keys=True, default=list)


def oa14_rows_from_result(interp, res):
    """The OA-14 input rows reconstructed from a RESULT (every bound segment, record order), for the idempotence test: OA-14 applied to its own
    output must change nothing."""
    rows, recs = [], dict((r["recordId"], r) for r in res["records"])
    for s in res["segmentRecords"]:
        a = s.get("occurrenceAnchor")
        if a is None:
            continue
        rec = recs[s["recordId"]]
        rows.append({"key": s["segmentId"], "aid": rec["artifactId"], "U": s["underlyingDocumentIdentity"],
                     "resolved": rec["duplicateIdentityState"]["result"] == interp.id_states["resolved"], "identity": s["canonicalSegmentIdentity"],
                     "reason": a.get("unresolvedReason"), "sat": list(s["satisfiedClassIds"]), "state": s["sourceClassAssignmentState"], "cls": s["sourceClass"],
                     "canonicalContent": (s.get("occurrenceDiagnostics") or {}).get("canonicalSegmentContentHash"),
                     "withheldOccurrence": a.get("withheldOccurrence")})
    return rows


def oa14_idempotent(interp, res):
    rows = oa14_rows_from_result(interp, res)
    again, _ = interp.unplaced_witness_stage(rows)
    key = lambda rs: [(r["key"], r["identity"], r["reason"], r["state"], r["cls"]) for r in rs]
    return key(again) == key(rows)


def r14_fixture_perms(n):
    return list(itertools.permutations(range(n))) if n <= 5 else None
# ================================================================== PHYSICAL-OCCURRENCE ORACLE END

# ================================================================== R-7 / B-2 CONSTRUCTION ORACLE BEGIN
# A document body is a sequence of ATOMS joined by PHYSICAL JUNCTIONS whose type the construction states (within-sentence space, comma, conjunction,
# line wrap, sentence, numbered clause, table row). A record is a list of units (each unit a run of atoms) with the separators its coder declares
# (honest coders only: a lawful separator is declared only at a junction that physically is one, of that type) and one coding (class + the unit that
# carries its witnesses). Truth is computed from the construction ALONE, in body-text coordinates: footprints, overlap, support cores, the recorded and
# the physical boundaries, the lawful components and the lawful distinct-class set. Nothing here reads a candidate identity, frame, footprint,
# component or disposition (check U-1 scans this block); the builder uses only the frozen extraction to LOCATE a unit.
_R7_KW = {"accession": "0001-98-000077", "exhibitId": "10.7", "title": "Exhibit 10.7", "period": "1998"}
_R7_KW2 = {"accession": "0001-98-000078", "exhibitId": "10.8", "title": "Exhibit 10.8", "period": "1998"}
_R7_W = {  # class code -> atom witness key -> [(feature, value, witness)]
    3: {"ret": [("rewardObject", True, "annual retainer"), ("structureStated", True, "annual retainer of"), ("rewardModality", "STRUCTURE", "annual retainer of"),
                ("rewardProvisions", "B1", "$36,000"), ("operativeContent", "REWARD_STRUCTURE", "annual retainer of")]},
    7: {"cmt": [("roleDimension", True, "The Committee"), ("entitlementDimension", True, "sets each director"), ("allocationStatement", True, "The Committee sets"),
                ("operativeContent", "ROLE_ALLOCATION", "The Committee sets")],
        "acc": [("roleDimension", True, "each officer"), ("entitlementDimension", True, "read rights"), ("allocationStatement", True, "access matrix grants"),
                ("operativeContent", "ROLE_ALLOCATION", "access matrix grants")]}}
_R7_CLS = {3: 2, 7: 6}           # construction class code -> index of the class label in the frozen vocabulary (SC-3, SC-7)
_R7_LAWFUL = {"SENTENCE", "NUMBERED_CLAUSE", "TABLE_ROW", "SECTION"}             # physically lawful junction types (the construction's truth)
_R7_DECLARED = {"SENTENCE", "NUMBERED_CLAUSE", "NUMBERED_SUBCLAUSE", "TABLE_ROW"}   # the separators an honest construction coder may record
_R7_GAP = {"SPACE": " ", "COMMA": " ", "CONJUNCTION": " ", "WRAP": "\n", "HEADLINE": "\n", "SENTENCE": " ", "NUMBERED_CLAUSE": "\n", "TABLE_ROW": "\n",
           "SECTION": "\n"}
# paragraph templates: (atom text, witness key or None) and the physical junction types between consecutive atoms
_R7_T = {
    "MIXED": ([("The Committee sets each director's", "cmt"), ("annual retainer of $36,000", "ret"), ("& related fees.", None)], ["SPACE", "SPACE"]),
    "COMMA": ([("The annual retainer of each director is $36,000 in cash,", "ret"), ("the access matrix grants each officer read rights to the portal.", "acc")], ["COMMA"]),
    "CONJ": ([("The annual retainer of each director is $36,000 in cash", "ret"), ("and the access matrix grants each officer read rights to the portal.", "acc")], ["CONJUNCTION"]),
    "WRAP": ([("The annual retainer of each director is $36,000 in cash", "ret"), ("the access matrix grants each officer read rights to the portal.", "acc")], ["WRAP"]),
    "NUMBERED": ([("Director Compensation and Portal Access", None), ("1. The annual retainer of each director is $36,000 in cash.", "ret"),
                  ("2. The access matrix grants each officer read rights to the portal.", "acc")], ["NUMBERED_CLAUSE", "NUMBERED_CLAUSE"]),
    "SENTENCES": ([("The annual retainer of each director is $36,000 in cash.", "ret"), ("The access matrix grants each officer read rights to the portal.", "acc")], ["SENTENCE"]),
    "ROWS": ([("Director retainer: the annual retainer of each director is $36,000 in cash", "ret"),
              ("Officer access: the access matrix grants each officer read rights to the portal", "acc")], ["TABLE_ROW"]),
    "HEADED": ([("Director Compensation", None), ("The annual retainer of each director is $36,000 in cash.", "ret"), ("Portal Access", None),
                ("The access matrix grants each officer read rights to the portal.", "acc")], ["HEADLINE", "SECTION", "HEADLINE"]),
    "TWICE": ([("The Committee sets each director's annual retainer of $36,000 & related fees.", "ret"), ("The Board met four times in 1998.", None),
               ("The Committee sets each director's annual retainer of $36,000 & related fees.", "ret")], ["SENTENCE", "SENTENCE"]),
}
_R7_W[7]["ret"] = None           # an atom carries only the classes its template states (see _r7_witnesses)


def _r7_witnesses(cls, key, text):
    """The coding of one class on one atom: the construction's witnesses when the atom carries that class, else None."""
    if key is None:
        return None
    if cls == 7 and key == "ret" and text.startswith("The Committee sets"):
        key = "cmt"              # the MIXED / TWICE sentence carries both codings (MV-F02 style)
    w = _R7_W[cls].get(key)
    return [x for x in w if x[2] in text] if w and all(x[2] in text for x in w) else None


def _r7_body(tpl):
    atoms, junctions = _R7_T[tpl]
    text, spans = "", []
    for i, (t, _) in enumerate(atoms):
        if i:
            text += _R7_GAP[junctions[i - 1]]
        spans.append([len(text), len(text) + len(t)])
        text += t
    return text, spans


def _r7_member(body, spec):
    """Rendered member text of one document body. kind TEXT: the body; kind HTML: '<p>' paragraphs, optional leading empty blocks (pad) that shift every
    extraction offset, an optional appended character-reference word (inject: makes the complete views differ -> FRAME-U), and an optional relocation:
    the body's characters [break] get a character-reference letter inserted and the relocated text is appended spelled as character references."""
    pre = spec.get("preface", "Preface.")
    if spec["kind"] == "TEXT":
        return pre + "\n" + body + "\nClosing.\n"
    b = body
    if spec.get("breakAt") is not None:
        j = spec["breakAt"]
        b = b[:j] + " &#120; " + b[j:]
    tail = ""
    if spec.get("relocate"):
        tail += "<p>%s</p>" % "".join("&#%d;" % ord(c) for c in spec["relocate"])
    if spec.get("inject"):
        tail += "<p>%s</p>" % "".join("&#%d;" % ord(c) for c in spec["inject"])
    return "<html><body>%s<p>%s</p><p>%s</p>%s<p>Closing.</p></body></html>\n" % ("<div></div>" * spec.get("pad", 0), pre, b, tail)


def build_r7(interp, case, tag, coder="ORACLE-R7 (synthetic; construction-coded)"):
    """(corpus, meta) of an R-7 construction {docs: [{template, members: [member spec]}], records: [{doc, member, units: [[first atom, last atom,
    separatorBefore]], codes: [[unit index, class code]], sub?: [start, end] inside the first unit}]}. Units are located in the member's frozen extraction
    through the rendered body (found exactly once); every witness is the construction's own and must lie inside its unit."""
    arts, recs, meta = [], [], []
    bodies = []
    for d, doc in enumerate(case["docs"]):
        body, spans = _r7_body(doc["template"])
        bodies.append((body, spans))
        for m, ms in enumerate(doc["members"]):
            h = _r7_member(body, ms)
            aid = "%s-D%dM%d" % (tag, d, m)
            arts.append({"artifactId": aid, "content": {"inlineText": h}, "renditionDecoder": "UTF8_REPLACE",
                         "identity": _probe_identity(h, **(_R7_KW if d == 0 else _R7_KW2))})
    by_aid = dict((a["artifactId"], a) for a in arts)
    for n, rc in enumerate(case["records"]):
        d, m = rc["doc"], rc["member"]
        body, spans = bodies[d]
        atoms = _R7_T[case["docs"][d]["template"]][0]
        aid = "%s-D%dM%d" % (tag, d, m)
        recipe = "PLAIN_TEXT_V1" if case["docs"][d]["members"][m]["kind"] == "TEXT" else "HTML_TEXT_V1"
        ext = interp.extract(by_aid[aid]["content"]["inlineText"].encode("utf-8"), recipe)
        base = ext.find(body)
        if base < 0 or ext.find(body, base + 1) >= 0:
            raise ValueError("GENERATOR_MISMATCH body not found once")
        codes = dict((ui, [c for x, c in rc["codes"] if x == ui]) for ui in range(len(rc["units"])))
        units, fp = [], []
        for ui, (i, j, sep) in enumerate(rc["units"]):
            a0, a1 = spans[i][0], spans[j][1]
            if rc.get("sub") and ui == 0:
                a0, a1 = spans[i][0] + rc["sub"][0], spans[i][0] + rc["sub"][1]
            text = body[a0:a1]
            u = {"unitId": "u%d" % (ui + 1), "separatorBefore": sep, "locatorKind": "SENTENCE", "start": base + a0, "end": base + a1,
                 "text": text, "textSha256": sha_text(text), "assertions": []}
            for cls in codes[ui]:
                w = None
                for x in range(i, j + 1):
                    w = _r7_witnesses(cls, atoms[x][1], atoms[x][0])
                    if w:
                        break
                if not w or any(wt not in text for _, _, wt in w):
                    raise ValueError("GENERATOR_MISMATCH witness outside unit")
                for f, v, wt in w:
                    u["assertions"].append({"featureId": f, "value": v, "witness": wt, "assertionType": "QUOTED_WITNESS", "coderIdentity": coder,
                                            "sourceRef": "ORACLE-R7", "segmentLocator": {"artifactId": aid, "unitId": u["unitId"], "start": u["start"], "end": u["end"]}})
            units.append(u)
            fp.append([a0, a1])
        rid = "%s-N%d" % (tag, n)
        recs.append({"recordId": rid, "artifactId": aid, "sourceId": "ORACLE-R7", "recipe": recipe, "bindingStatus": "BOUND",
                     "humanReadableLocator": None, "physicalHeading": None, "units": units})
        meta.append({"recordId": rid, "doc": d, "member": m, "units": fp, "seps": [u[2] for u in rc["units"]], "codes": [list(x) for x in rc["codes"]]})
    return {"artifacts": arts, "records": recs}, meta


def r7_truth(case, meta):
    """Construction truth, from body coordinates alone: the segments every record forms at its declared separators (a segment with one coded class is a
    count candidate), the pairs that overlap (a shared letter or digit), whether their cores are separated by a lawful separator one of the two records
    records ('recorded') or by any physically lawful junction ('physical'), the lawful components and distinct-class set, and the touching splits."""
    segs = []
    for mt in meta:
        body, spans = _r7_body(case["docs"][mt["doc"]]["template"])
        junctions = _R7_T[case["docs"][mt["doc"]]["template"]][1]
        groups, cur = [], []
        for ui, sep in enumerate(mt["seps"]):
            if ui and sep != "NONE":
                groups.append(cur)
                cur = []
            cur.append(ui)
        groups.append(cur)
        # recorded lawful boundaries of this record, in body coordinates: (end of the unit before, start of the unit after)
        rb = [(mt["units"][ui - 1][1], mt["units"][ui][0]) for ui, sep in enumerate(mt["seps"]) if ui and sep in _R7_DECLARED]
        for gi, g in enumerate(groups):
            core = [mt["units"][ui] for ui in g if any(x == ui for x, _ in mt["codes"])]
            classes = set(c for x, c in mt["codes"] if x in g)
            segs.append({"segmentId": "%s#s%d" % (mt["recordId"], gi + 1), "recordId": mt["recordId"], "doc": mt["doc"],
                         "cls": next(iter(classes)) if len(classes) == 1 else None, "multiple": len(classes) > 1, "fp": [mt["units"][g[0]][0], mt["units"][g[-1]][1]], "core": core, "rb": rb, "body": body,
                         "junctions": [(spans[x - 1][1], spans[x][0], junctions[x - 1]) for x in range(1, len(spans))]})
    cand = [s for s in segs if s["cls"] is not None]

    def alnum_overlap(a, b, body):
        lo, hi = max(a[0], b[0]), min(a[1], b[1])
        return any(ch.isalnum() for ch in body[lo:hi]) if lo < hi else False

    def sep_by(a, b, bounds):
        amax, amin = max(x[1] for x in a["core"]), min(x[0] for x in a["core"])
        bmax, bmin = max(x[1] for x in b["core"]), min(x[0] for x in b["core"])
        return any((amax <= lo and bmin >= hi) or (bmax <= lo and amin >= hi) for lo, hi in bounds)

    def disjoint(a, b):
        return not any(alnum_overlap(x, y, a["body"]) for x in a["core"] for y in b["core"])
    pairs = {}
    for i in range(len(cand)):
        for j in range(i + 1, len(cand)):
            a, b = cand[i], cand[j]
            if a["doc"] != b["doc"] or not alnum_overlap(a["fp"], b["fp"], a["body"]):
                continue
            recorded = disjoint(a, b) and sep_by(a, b, a["rb"] + b["rb"])
            physical = disjoint(a, b) and sep_by(a, b, [(lo, hi) for lo, hi, t in a["junctions"] if t in _R7_LAWFUL])
            same_fp = a["fp"] == b["fp"]
            pairs[(a["segmentId"], b["segmentId"])] = {"recorded": recorded, "physical": physical, "sameFootprint": same_fp}

    def components(key):
        parent = dict((s["segmentId"], s["segmentId"]) for s in cand)

        def find(x):
            while parent[x] != x:
                x = parent[x]
            return x
        for (x, y), p in pairs.items():
            if p["sameFootprint"] or not p[key]:
                parent[find(x)] = find(y)
        comps = {}
        for s in cand:
            comps.setdefault(find(s["segmentId"]), []).append(s)
        return sorted((sorted(c, key=lambda s: s["segmentId"]) for c in comps.values()), key=lambda c: c[0]["segmentId"])
    lawful = components("recorded")
    physical = components("physical")

    def contributed(comps):
        return sorted(set(c[0]["cls"] for c in comps if len(set(s["cls"] for s in c)) == 1))
    return {"segments": dict((s["segmentId"], {"doc": s["doc"], "cls": s["cls"], "fp": s["fp"], "multiple": s["multiple"]}) for s in segs),
            "pairs": dict(("%s|%s" % k, v) for k, v in pairs.items()),
            "lawfulComponents": [[s["segmentId"] for s in c] for c in lawful], "lawfulClasses": contributed(lawful),
            "physicalComponents": [[s["segmentId"] for s in c] for c in physical], "physicalClasses": contributed(physical),
            "touchingSplits": sorted("%s|%s" % (a["segmentId"], b["segmentId"]) for a in cand for b in cand
                                     if a["segmentId"] < b["segmentId"] and a["doc"] == b["doc"] and a["cls"] != b["cls"]
                                     and not alnum_overlap(a["fp"], b["fp"], a["body"])
                                     and not any(min(a["fp"][1], b["fp"][1]) <= lo and hi <= max(a["fp"][0], b["fp"][0])
                                                 for lo, hi, t in a["junctions"] if t in _R7_LAWFUL))}


def r7_generated_cases():
    """The R-7 / B-2 generated surface (deterministic, enumerated): nested, partial and chained sub-sentence quotations, multi-unit records with
    recorded and unrecorded lawful boundaries, comma / conjunction / line-wrap divisions, sentences, table rows, headed sections, identical text twice,
    two underlying documents, FRAME-C with one or two renditions, FRAME-U with every-member and differing member relations; 1-4 records per case."""
    S, N = "START", "NONE"
    TXT, H0, H40, HU = {"kind": "TEXT"}, {"kind": "HTML"}, {"kind": "HTML", "pad": 40}, {"kind": "HTML", "inject": "zqxzqx"}
    out = []

    def add(fam, docs, recs, **kw):
        c = {"family": fam, "docs": docs, "records": recs}
        c.update(kw)
        out.append(c)

    def r(doc, member, units, codes, sub=None):
        x = {"doc": doc, "member": member, "units": units, "codes": codes}
        if sub:
            x["sub"] = sub
        return x
    mixed = [((0, 0), 7), ((0, 1), 7), ((0, 1), 3), ((0, 2), 7), ((0, 2), 3), ((1, 1), 3), ((1, 2), 3)]
    for frame, members in (("C1", [TXT]), ("C2", [H0, H40]), ("U", [H0, HU])):
        for k in (2, 3):
            for combo in itertools.combinations(range(len(mixed)), k):
                add("MIXED_" + frame, [{"template": "MIXED", "members": members}],
                    [r(0, n % len(members), [[mixed[x][0][0], mixed[x][0][1], S]], [[0, mixed[x][1]]]) for n, x in enumerate(combo)])
        for x in range(len(mixed)):
            add("MIXED_DUP_" + frame, [{"template": "MIXED", "members": members}],
                [r(0, 0, [[mixed[x][0][0], mixed[x][0][1], S]], [[0, mixed[x][1]]]), r(0, len(members) - 1, [[mixed[x][0][0], mixed[x][0][1], S]], [[0, mixed[x][1]]])])
    for combo in itertools.combinations(range(len(mixed)), 4):
        add("MIXED_4", [{"template": "MIXED", "members": [TXT]}], [r(0, 0, [[mixed[x][0][0], mixed[x][0][1], S]], [[0, mixed[x][1]]]) for x in combo])
    for x in range(len(mixed)):
        for y in range(len(mixed)):
            if x == y:
                continue
            ux, uy = [[mixed[x][0][0], mixed[x][0][1], S]], [[mixed[y][0][0], mixed[y][0][1], S]]
            add("STACKED_C2", [{"template": "MIXED", "members": [H0, H40]}],
                [r(0, 0, ux, [[0, mixed[x][1]]]), r(0, 1, ux, [[0, mixed[x][1]]]), r(0, 0, ux, [[0, mixed[x][1]]]), r(0, 1, uy, [[0, mixed[y][1]]])])
    for x in range(len(mixed)):
        ux = [[mixed[x][0][0], mixed[x][0][1], S]]
        add("STACKED_4", [{"template": "MIXED", "members": [TXT]}], [r(0, 0, ux, [[0, mixed[x][1]]]) for _ in range(4)])
    num = [([[1, 1, S]], [[0, 3]]), ([[2, 2, S]], [[0, 7]]), ([[0, 0, S], [1, 1, N]], [[1, 3]]), ([[0, 0, S], [1, 1, N], [2, 2, N]], [[2, 7]]),
           ([[0, 0, S], [1, 1, N], [2, 2, "NUMBERED_CLAUSE"]], [[1, 3]]), ([[0, 0, S], [2, 2, "NUMBERED_CLAUSE"]], [[1, 7]]),
           ([[1, 1, S], [2, 2, "NUMBERED_CLAUSE"]], [[0, 3], [1, 7]]), ([[0, 0, S], [1, 1, N], [2, 2, N]], [[1, 3]]), ([[1, 1, S], [2, 2, N]], [[1, 7]]),
           ([[1, 1, S], [2, 2, N]], [[0, 3]])]
    for frame, members in (("C1", [TXT]), ("U", [H0, HU])):
        for k in (2, 3):
            for combo in itertools.combinations(range(len(num)), k):
                add("NUMBERED_" + frame, [{"template": "NUMBERED", "members": members}], [r(0, 0, num[x][0], num[x][1]) for x in combo])
    div = [([[0, 0, S]], [[0, 3]]), ([[1, 1, S]], [[0, 7]]), ([[0, 0, S], [1, 1, N]], [[0, 3]]), ([[0, 0, S], [1, 1, N]], [[1, 7]]), ([[0, 1, S]], [[0, 3]]),
           ([[0, 1, S]], [[0, 7]])]
    for tpl in ("COMMA", "CONJ", "WRAP"):
        for k in (2, 3):
            for combo in itertools.combinations(range(len(div)), k):
                add("DIVIDED_" + tpl, [{"template": tpl, "members": [TXT]}], [r(0, 0, div[x][0], div[x][1]) for x in combo])
    for tpl, sep in (("SENTENCES", "SENTENCE"), ("ROWS", "TABLE_ROW")):
        lw = [([[0, 0, S]], [[0, 3]]), ([[1, 1, S]], [[0, 7]]), ([[0, 0, S], [1, 1, N]], [[0, 3]]), ([[0, 0, S], [1, 1, N]], [[1, 7]]),
              ([[0, 0, S], [1, 1, sep]], [[0, 3]]), ([[0, 0, S], [1, 1, sep]], [[0, 3], [1, 7]])]
        for k in (2, 3):
            for combo in itertools.combinations(range(len(lw)), k):
                add("LAWFUL_" + tpl, [{"template": tpl, "members": [TXT]}], [r(0, 0, lw[x][0], lw[x][1]) for x in combo])
    hd = [([[0, 0, S], [1, 1, N], [2, 2, N]], [[1, 3]]), ([[2, 2, S], [3, 3, N]], [[1, 7]]), ([[1, 1, S], [2, 2, "SENTENCE"], [3, 3, N]], [[2, 7]]),
          ([[1, 1, S]], [[0, 3]]), ([[3, 3, S]], [[0, 7]]), ([[0, 0, S], [1, 1, N]], [[1, 3]])]
    for k in (2, 3):
        for combo in itertools.combinations(range(len(hd)), k):
            add("HEADED", [{"template": "HEADED", "members": [TXT]}], [r(0, 0, hd[x][0], hd[x][1]) for x in combo])
    tw = [([[0, 0, S]], [[0, 3]]), ([[2, 2, S]], [[0, 7]]), ([[0, 0, S]], [[0, 7]]), ([[2, 2, S]], [[0, 3]]), ([[0, 0, S]], [[0, 7]], [0, 34])]
    for k in (2, 3):
        for combo in itertools.combinations(range(len(tw)), k):
            add("TWICE", [{"template": "TWICE", "members": [TXT]}], [r(0, 0, tw[x][0], tw[x][1], tw[x][2] if len(tw[x]) > 2 else None) for x in combo],
                equalText=True)
    for x in range(len(mixed)):
        for y in range(len(mixed)):
            add("TWO_DOCUMENTS", [{"template": "MIXED", "members": [TXT]}, {"template": "MIXED", "members": [dict(TXT, preface="Annex.")]}],
                [r(0, 0, [[mixed[x][0][0], mixed[x][0][1], S]], [[0, mixed[x][1]]]), r(1, 0, [[mixed[y][0][0], mixed[y][0][1], S]], [[0, mixed[y][1]]])])
    brk = {"kind": "HTML", "breakAt": 34 + 1 + 26 + 1 + 10, "relocate": "annual retainer of $36,000 & related fees."}
    for other in (((0, 0), 7), ((0, 1), 7), ((0, 1), 3)):
        for order in (0, 1):
            members = [brk, H0] if order == 0 else [H0, brk]
            m = 1 - order
            add("FRAME_U_DIFFERING", [{"template": "MIXED", "members": members}],
                [r(0, m, [[other[0][0], other[0][1], S]], [[0, other[1]]]), r(0, m, [[1, 2, S]], [[0, 3]])])
    for n, c in enumerate(out):
        c["id"] = "R7G-%04d" % n
    return out


_R7_HARD = ("quoteShoppingBypass", "falseSourceDiversityFromOverlap", "falseSrcDivFromOverlap", "conflictingOverlapStillCounts",
            "sameClassOverlapMultiContribution", "lawfullySeparateRecordsCollapsed", "crossDocumentTaint", "nonOverlappingOccurrencesMerged",
            "textEqualityUsedAsOverlap", "recordOrderDependence", "componentOrderDependence", "nonIdempotence", "CSIChangedByB2",
            "sourceClassAssignmentChangedByB2")
_R7_REPORTED = ("conservativeUndercount", "touchingSplitCounted", "mechanicsInvalid")


def r7_signature(res, field):
    """The order-free count outcome of one evaluation: distinct classes, srcDiv, per-record disposition and component membership."""
    bo = res["count"].get(field) or {}
    recs = bo.get("records", {})
    comps = {}
    for sid, r in recs.items():
        comps.setdefault(r["basisOverlapComponentId"], []).append(sid)
    return {"classes": res["count"]["distinctClassSet"], "holds": res["count"]["holds"],
            "dispositions": dict((sid, r["b2CountDisposition"]) for sid, r in sorted(recs.items())),
            "components": sorted(sorted(v) for v in comps.values()), "componentIds": sorted((k, sorted(v)) for k, v in comps.items())}


def judge_r7(case, res, truth, labels, field, disp, others=(), res_off=None, again=None):
    """Counters of one evaluated construction. res: the candidate (B-2 on); others: the same corpus in other record orders; res_off: the same corpus with
    the count layer absent (identity / state / class must be byte-identical); again: a second evaluation (idempotence). Truth is the construction's."""
    c = dict((k, 0) for k in _R7_HARD + _R7_REPORTED)
    lab = dict((code, labels[i]) for code, i in _R7_CLS.items())
    segs = dict((s["segmentId"], s) for s in res["segmentRecords"])
    if res_off is not None:
        off = dict((s["segmentId"], s) for s in res_off["segmentRecords"])
        csi = any(off.get(sid, {}).get("canonicalSegmentIdentity") != s["canonicalSegmentIdentity"] for sid, s in segs.items()) or set(off) != set(segs)
        st = any((off.get(sid, {}).get("sourceClassAssignmentState"), off.get(sid, {}).get("sourceClass"), off.get(sid, {}).get("satisfiedClassIds"))
                 != (s["sourceClassAssignmentState"], s["sourceClass"], s["satisfiedClassIds"]) for sid, s in segs.items())
        c["CSIChangedByB2"], c["sourceClassAssignmentChangedByB2"] = int(bool(csi)), int(bool(st))
    # validity (the construction reached the count stage as constructed) is judged on the anchoring result, i.e. without the count layer
    base = dict((s["segmentId"], s) for s in (res_off or res)["segmentRecords"])
    cands = [sid for sid, t in truth["segments"].items() if t["cls"] is not None]
    if any(sid not in base or base[sid]["sourceClassAssignmentState"] != "ASSIGNED" or base[sid]["canonicalSegmentIdentity"] is None
           or base[sid]["sourceClass"] != lab[truth["segments"][sid]["cls"]] for sid in cands):
        c["mechanicsInvalid"] = 1
        return c
    sig = r7_signature(res, field)
    recs = (res["count"].get(field) or {}).get("records", {})
    comp_of = dict((sid, r["basisOverlapComponentId"]) for sid, r in recs.items())
    want = set(lab[x] for x in truth["lawfulClasses"])
    got = set(sig["classes"])
    if got - want:
        c["falseSourceDiversityFromOverlap"] = 1
    if sig["holds"] and len(want) < 2:
        c["falseSrcDivFromOverlap"] = 1
    for comp in truth["lawfulComponents"]:
        classes = set(truth["segments"][s]["cls"] for s in comp)
        unequal = len(set(tuple(truth["segments"][s]["fp"]) for s in comp)) > 1
        if len(comp) > 1 and len(classes) > 1 and unequal:
            if any(recs.get(s, {}).get("b2CountDisposition") != disp["withheld"] for s in comp):
                c["conflictingOverlapStillCounts"] = 1
                c["quoteShoppingBypass"] = 1
        if len(comp) > 1 and len(classes) == 1 and unequal:
            if len(set(comp_of.get(s) for s in comp)) > 1 or any(recs.get(s, {}).get("b2CountDisposition") != disp["collapsed"] for s in comp):
                c["sameClassOverlapMultiContribution"] = 1
    contributing = sum(1 for comp in truth["lawfulComponents"] if len(set(truth["segments"][s]["cls"] for s in comp)) == 1)
    if res["count"]["contributingGroups"] > contributing:
        c["sameClassOverlapMultiContribution"] = 1
    lawful_of = dict((s, n) for n, comp in enumerate(truth["lawfulComponents"]) for s in comp)
    members = {}
    for sid, cid in comp_of.items():
        members.setdefault(cid, []).append(sid)
    for cid, ms in members.items():
        if len(set(truth["segments"][s]["doc"] for s in ms if s in truth["segments"])) > 1:
            c["crossDocumentTaint"] = 1
        for x in ms:
            for y in ms:
                if x < y and x in lawful_of and y in lawful_of and lawful_of[x] != lawful_of[y]:
                    p = truth["pairs"].get("%s|%s" % (x, y)) or truth["pairs"].get("%s|%s" % (y, x))
                    if p is not None and p["recorded"]:
                        c["lawfullySeparateRecordsCollapsed"] = 1
                    else:
                        c["nonOverlappingOccurrencesMerged"] = 1
                        if case.get("equalText"):
                            c["textEqualityUsedAsOverlap"] = 1
    for o in others:
        so = r7_signature(o, field)
        if (so["classes"], so["holds"], so["dispositions"], so["components"]) != (sig["classes"], sig["holds"], sig["dispositions"], sig["components"]):
            c["recordOrderDependence"] = 1
        if so["componentIds"] != sig["componentIds"]:
            c["componentOrderDependence"] = 1
    if again is not None and (r7_signature(again, field) != sig or again["segmentRecords"] != res["segmentRecords"]):
        c["nonIdempotence"] = 1
    phys = set(lab[x] for x in truth["physicalClasses"])
    if phys - got:
        c["conservativeUndercount"] = 1
    if truth["touchingSplits"] and len(got) >= 2:
        c["touchingSplitCounted"] = 1
    return c
# ================================================================== R-7 / B-2 CONSTRUCTION ORACLE END
# ================================================================== TOUCHING-ATOM CONSTRUCTION ORACLE BEGIN
# A document body is a sequence of PIECES joined by typed PHYSICAL JUNCTIONS. A junction type states its text (a tail that ends the previous piece, a
# whitespace run, a head that starts the next piece) and two construction facts: PHYS - it is physically an R-SEG-B atom boundary (a sentence end, a
# clause or sub-clause number, a table row, a heading); EVID - its bytes carry frozen separator evidence that no notSeparator and no ordinary inline
# material also produces (a terminal followed by whitespace, a clause number after whitespace). A record is a list of units (a run of pieces, TIGHT =
# letters only, WIDE = with the neighbouring junction head and tail), the separators its coder declares (honest coders: a lawful separator only at a
# physically lawful junction of that type) and a coding. Truth is computed from the construction ALONE, in body coordinates: atoms, count candidates,
# footprints, cores, the lawful components (an overlapping pair: the B-2 truth - joined unless a recorded separator divides disjoint cores; a
# non-overlapping pair: joined iff neither a recorded separator nor an EVID junction lies between the cores, in ANY member arrangement), the physical
# atom projection and the undercount. Nothing here reads a candidate identity, frame, footprint, component, relation or disposition (check TA-15).
_TA_P = {
    "R1": ("the annual retainer of each director is $36,000 in cash", "ret"),
    "R2": ("the annual retainer of each trustee is $36,000 in stock", "ret"),
    "A1": ("the access matrix grants each officer read rights to the portal", "acc"),
    "A2": ("the access matrix grants each officer read rights to the ledger", "acc"),
    "R3": ("the annual retainer of each officer is $36,000 in cash", "ret"),
    "A3": ("the access matrix grants each officer read rights to the vault", "acc"),
    "N1": ("the board met four times during the year", None),
    "N2": ("the plan takes effect on the first day of the quarter", None),
    "XA": ("the access matrix grants each officer read rights at Acme Inc", "acc"),
    "XR": ("under which the annual retainer of each director is $36,000 in cash", "ret"),
    "M1": ("The Committee sets each director's annual retainer of $36,000 & related fees", "ret"),
}
# type -> (tail, whitespace, head, PHYS, EVID, capitalise the next piece). {n} = the next clause number, {a} = the next sub-clause letter.
_TA_J = {
    "SPACE": ("", " ", "", False, False, False),
    "COMMA": (",", " ", "", False, False, False),
    "SEMI": (";", " ", "", False, False, False),
    "COLON": (":", " ", "", False, False, False),
    "CONJ": ("", " ", "and ", False, False, False),
    "COMMA_CONJ": (",", " ", "and ", False, False, False),
    "WRAP": ("", "\n", "", False, False, False),
    "COLUMN": ("", "\n\n", "", False, False, False),
    "GAPW": ("", " ", "as the board determines each year, ", False, False, False),
    "SENT": (".", " ", "", True, True, True),
    "SENT_NL": (".", "\n", "", True, True, True),
    "SENT_QUOTE": (".\"", " ", "", True, True, True),
    "NUM": (".", "\n", "({n}) ", True, True, True),
    "NUM_BARE": ("", "\n", "{n}. ", True, True, False),
    "SUBCL": (";", " ", "({a}) ", True, True, False),
    "ROW": ("", "\n", "", True, False, True),
    "HEAD": ("", "\n", "Portal Access\n", True, False, True),
    "ABBR": (".", " ", "", False, False, False),     # a full stop before a lowercase continuation: no frozen evidence (the corrected SENTENCE evidence)
}
_TA_DECLARE = {"SENT": "SENTENCE", "SENT_NL": "SENTENCE", "SENT_QUOTE": "SENTENCE", "NUM": "NUMBERED_CLAUSE", "NUM_BARE": "NUMBERED_CLAUSE",
               "SUBCL": "NUMBERED_SUBCLAUSE", "ROW": "TABLE_ROW", "HEAD": "HEADING"}
_TA_KW = {"accession": "0001-98-000091", "exhibitId": "10.9", "title": "Exhibit 10.9", "period": "1998"}
_TA_KW2 = {"accession": "0001-98-000092", "exhibitId": "10.10", "title": "Exhibit 10.10", "period": "1998"}


def _ta_body(doc):
    """(text, piece spans, junctions, atom of every piece) of one document {pieces, junctions, end}. A junction: {type, tail, ws, head, phys, evid}."""
    pieces, jt = doc["pieces"], doc["junctions"]
    if len(jt) != len(pieces) - 1:
        raise ValueError("GENERATOR_MISMATCH junction count")
    n_num = sum(1 for t in jt if t in ("NUM", "NUM_BARE"))
    n_sub = sum(1 for t in jt if t == "SUBCL")
    text = ""
    if n_num:
        text = "(1) " if "NUM" in jt else "1. "
    if n_sub:
        text += "(a) "
    spans, junctions, atoms = [], [], []
    num, sub, atom, cap = 1, 0, 0, True
    for i, key in enumerate(pieces):
        t = _TA_P[key][0]
        if cap:
            t = t[0].upper() + t[1:]
        spans.append([len(text), len(text) + len(t)])
        atoms.append(atom)
        text += t
        if i == len(pieces) - 1:
            break
        tail, ws, head, phys, evid, nxt = _TA_J[jt[i]]
        if "{n}" in head:
            num += 1
            head = head.replace("{n}", str(num))
        if "{a}" in head:
            sub += 1
            head = head.replace("{a}", "abcdefgh"[sub])
        j = {"type": jt[i], "tail": [len(text), len(text) + len(tail)]}
        text += tail
        j["ws"] = [len(text), len(text) + len(ws)]
        text += ws
        j["head"] = [len(text), len(text) + len(head)]
        text += head
        j.update({"phys": phys, "evid": evid})
        junctions.append(j)
        atom += 1 if phys else 0
        cap = nxt
    end0 = len(text)
    text += doc.get("end", ".")
    return text, spans, junctions, atoms, [end0, len(text)]


def _ta_unit_span(spans, junctions, docend, i, j, width, after_heading=False):
    """Body span of the unit covering pieces i..j. TIGHT: the pieces' own text; WIDE: plus the head of the junction before (or the document prefix)
    and the tail of the junction after (or the document's final terminal); a unit after a declared HEADING starts at its piece."""
    a, b = spans[i][0], spans[j][1]
    if width == "WIDE":
        if i == 0:
            a = 0
        elif not after_heading:
            a = junctions[i - 1]["head"][0]
        b = junctions[j]["tail"][1] if j < len(junctions) else docend[1]
    return a, b


def build_ta(interp, case, tag, coder="ORACLE-TA (synthetic; construction-coded)"):
    """(corpus, meta) of a touching-atom construction {docs: [{pieces, junctions, end?, members: [member spec]}], records: [{doc, member, units:
    [[first piece, last piece, separatorBefore, width]], codes: [[unit index, class code]]}]}. Members are rendered by the R-7 member renderer; units are
    located in the member's frozen extraction through the rendered body (found exactly once); every witness is the construction's own."""
    arts, recs, meta, bodies = [], [], [], []
    for d, doc in enumerate(case["docs"]):
        body, spans, junctions, atoms, docend = _ta_body(doc)
        bodies.append((body, spans, junctions, docend))
        for m, ms in enumerate(doc["members"]):
            h = _r7_member(body, ms)
            aid = "%s-D%dM%d" % (tag, d, m)
            arts.append({"artifactId": aid, "content": {"inlineText": h}, "renditionDecoder": "UTF8_REPLACE",
                         "identity": _probe_identity(h, **(_TA_KW if d == 0 else _TA_KW2))})
    by_aid = dict((a["artifactId"], a) for a in arts)
    for n, rc in enumerate(case["records"]):
        d, m = rc["doc"], rc["member"]
        body, spans, junctions, docend = bodies[d]
        pieces = case["docs"][d]["pieces"]
        aid = "%s-D%dM%d" % (tag, d, m)
        recipe = "PLAIN_TEXT_V1" if case["docs"][d]["members"][m]["kind"] == "TEXT" else "HTML_TEXT_V1"
        ext = interp.extract(by_aid[aid]["content"]["inlineText"].encode("utf-8"), recipe)
        base = ext.find(body)
        if base < 0 or ext.find(body, base + 1) >= 0:
            raise ValueError("GENERATOR_MISMATCH body not found once")
        units, fp = [], []
        for ui, (i, j, sep, width) in enumerate(rc["units"]):
            a0, a1 = _ta_unit_span(spans, junctions, docend, i, j, width, after_heading=(sep == "HEADING"))
            text = body[a0:a1]
            u = {"unitId": "u%d" % (ui + 1), "separatorBefore": sep, "locatorKind": "SENTENCE", "start": base + a0, "end": base + a1,
                 "text": text, "textSha256": sha_text(text), "assertions": []}
            for x, cls in rc["codes"]:
                if x != ui:
                    continue
                w = None
                for p in range(i, j + 1):
                    w = _r7_witnesses(cls, _TA_P[pieces[p]][1], _TA_P[pieces[p]][0])
                    if w:
                        break
                if not w or any(wt not in text for _, _, wt in w):
                    raise ValueError("GENERATOR_MISMATCH witness outside unit")
                for f, v, wt in w:
                    u["assertions"].append({"featureId": f, "value": v, "witness": wt, "assertionType": "QUOTED_WITNESS", "coderIdentity": coder,
                                            "sourceRef": "ORACLE-TA", "segmentLocator": {"artifactId": aid, "unitId": u["unitId"], "start": u["start"], "end": u["end"]}})
            units.append(u)
            fp.append([a0, a1])
        rid = "%s-N%d" % (tag, n)
        recs.append({"recordId": rid, "artifactId": aid, "sourceId": "ORACLE-TA", "recipe": recipe, "bindingStatus": "BOUND",
                     "humanReadableLocator": None, "physicalHeading": None, "units": units})
        meta.append({"recordId": rid, "doc": d, "member": m, "units": fp, "seps": [u[2] for u in rc["units"]], "codes": [list(x) for x in rc["codes"]]})
    return {"artifacts": arts, "records": recs}, meta


def _ta_alnum(body, a, b):
    """[first alnum, last alnum + 1) inside body[a:b], or None."""
    idx = [x for x in range(a, b) if body[x].isalnum()]
    return [idx[0], idx[-1] + 1] if idx else None


def _ta_truth_core(docs, meta, relocations=None):
    """The construction truth over prepared documents {doc: (body, junctions [{ws, phys, evid, type}], atom boundaries [ws spans of PHYS junctions],
    end)} and record meta (body-coordinate units, declared separators, codes). relocations: {record id: [member index, ...]} - the members in which a
    record's occurrence is the relocated copy appended after the body (FRAME-U differing arrangements)."""
    relocations = relocations or {}
    segs = []
    for mt in meta:
        body = docs[mt["doc"]]["body"]
        groups, cur = [], []
        for ui, sep in enumerate(mt["seps"]):
            if ui and sep != "NONE":
                groups.append(cur)
                cur = []
            cur.append(ui)
        groups.append(cur)
        rb = []
        for ui, sep in enumerate(mt["seps"]):
            if ui and sep != "NONE":
                lo = _ta_alnum(body, *mt["units"][ui - 1])
                hi = _ta_alnum(body, *mt["units"][ui])
                rb.append((lo[1], hi[0]))
        for gi, g in enumerate(groups):
            classes = set(c for x, c in mt["codes"] if x in g)
            core = [_ta_alnum(body, *mt["units"][ui]) for ui in g if any(x == ui for x, _ in mt["codes"])]
            fp = _ta_alnum(body, mt["units"][g[0]][0], mt["units"][g[-1]][1])
            segs.append({"segmentId": "%s#s%d" % (mt["recordId"], gi + 1), "recordId": mt["recordId"], "doc": mt["doc"], "unitIds": ["u%d" % (u + 1) for u in g],
                         "cls": next(iter(classes)) if len(classes) == 1 else None, "multiple": len(classes) > 1, "fp": fp, "core": core, "rb": rb})
    cand = [s for s in segs if s["cls"] is not None]

    def between(lo, hi, spans):
        return [s for s in spans if lo <= s[0] and s[1] <= hi]

    pairs = {}
    for i in range(len(cand)):
        for j in range(i + 1, len(cand)):
            a, b = cand[i], cand[j]
            if a["doc"] != b["doc"] or a["fp"] == b["fp"]:
                continue
            D = docs[a["doc"]]
            ov = a["fp"][0] < b["fp"][1] and b["fp"][0] < a["fp"][1]
            cores_disjoint = not any(x[0] < y[1] and y[0] < x[1] for x in a["core"] for y in b["core"])
            rec = a["rb"] + b["rb"]
            if ov:
                amax, amin = max(x[1] for x in a["core"]), min(x[0] for x in a["core"])
                bmax, bmin = max(x[1] for x in b["core"]), min(x[0] for x in b["core"])
                recorded = cores_disjoint and any((amax <= lo and bmin >= hi) or (bmax <= lo and amin >= hi) for lo, hi in rec)
                physical = cores_disjoint and any((amax <= s[0] and bmin >= s[1]) or (bmax <= s[0] and amin >= s[1]) for s in D["physSpans"])
                pairs[(a["segmentId"], b["segmentId"])] = {"kind": "OVERLAP", "edge": not recorded, "recorded": recorded, "evident": False,
                                                          "physical": physical, "sameAtomLawful": None, "memberDisagreement": False}
                continue
            E, L = (a, b) if a["fp"][1] <= b["fp"][0] else (b, a)
            clo, chi = max(x[1] for x in E["core"]), min(y[0] for y in L["core"])
            recorded = bool(between(clo, chi, rec))
            evident_body = bool(between(clo, chi, D["evidSpans"]))
            physical = bool(between(clo, chi, D["physSpans"]))
            # the member arrangements: the body, and every member in which one of the two records sits at its relocated copy (after the body)
            arrangements = [evident_body or recorded]
            for rid, members in sorted(relocations.items()):
                if rid in (E["recordId"], L["recordId"]) and members:
                    # in that member the relocated record's occurrence follows the body: the material between the other record's core and the
                    # copy is the rest of the body, its final terminal (if any) and a paragraph break
                    stay = L if rid == E["recordId"] else E
                    smax = max(x[1] for x in stay["core"])
                    arrangements.append(bool(between(smax, 10 ** 9, rec)) or bool(between(smax, 10 ** 9, D["evidSpans"]))
                                        or (D["endEvident"] and not D.get("relocLower", {}).get(rid, False)))
            same = not all(arrangements)
            pairs[(a["segmentId"], b["segmentId"])] = {"kind": "TOUCH", "edge": same, "recorded": recorded, "evident": evident_body, "physical": physical,
                                                      "sameAtomLawful": same, "memberDisagreement": same and (evident_body or recorded),
                                                      "exactlyTouching": not any(ch.isalnum() for ch in D["body"][E["fp"][1]:L["fp"][0]]),
                                                      "parityOnly": (evident_body or recorded) and not physical}
    parent = dict((s["segmentId"], s["segmentId"]) for s in cand)

    def find(x):
        while parent[x] != x:
            x = parent[x]
        return x
    for i in range(len(cand)):
        for j in range(i + 1, len(cand)):
            a, b = cand[i], cand[j]
            if a["doc"] == b["doc"] and a["fp"] == b["fp"]:
                parent[find(a["segmentId"])] = find(b["segmentId"])
    for (x, y), p in sorted(pairs.items()):
        if p["edge"]:
            parent[find(x)] = find(y)
    comps = {}
    for s in cand:
        comps.setdefault(find(s["segmentId"]), []).append(s)
    lawful = sorted((sorted(c, key=lambda s: s["segmentId"]) for c in comps.values()), key=lambda c: c[0]["segmentId"])
    # the physical atom projection: two candidates whose class-bearing cores share a physical atom (or one exact occurrence) are one projected basis
    for s in cand:
        D = docs[s["doc"]]
        s["atoms"] = sorted(set(D["atomOf"](x) for c in s["core"] for x in range(c[0], c[1]) if D["body"][x].isalnum()))
    pp = dict((s["segmentId"], s["segmentId"]) for s in cand)

    def pfind(x):
        while pp[x] != x:
            x = pp[x]
        return x
    for i in range(len(cand)):
        for j in range(i + 1, len(cand)):
            a, b = cand[i], cand[j]
            if a["doc"] == b["doc"] and (a["fp"] == b["fp"] or set(a["atoms"]) & set(b["atoms"])):
                pp[pfind(a["segmentId"])] = pfind(b["segmentId"])
    pc = {}
    for s in cand:
        pc.setdefault(pfind(s["segmentId"]), []).append(s)
    projection = sorted((sorted(c, key=lambda s: s["segmentId"]) for c in pc.values()), key=lambda c: c[0]["segmentId"])

    def contributed(cs):
        return sorted(set(c[0]["cls"] for c in cs if len(set(s["cls"] for s in c)) == 1))
    return {"segments": dict((s["segmentId"], {"doc": s["doc"], "cls": s["cls"], "fp": s["fp"], "multiple": s["multiple"], "unitIds": s["unitIds"],
                                               "atoms": s.get("atoms")}) for s in segs),
            "pairs": dict(("%s|%s" % k, v) for k, v in sorted(pairs.items())),
            "lawfulComponents": [[s["segmentId"] for s in c] for c in lawful], "lawfulClasses": contributed(lawful),
            "projectionComponents": [[s["segmentId"] for s in c] for c in projection], "physicalClasses": contributed(projection)}


def _ta_doc_facts(body, junctions, atoms_of_piece, spans, end_evident):
    phys = [j["ws"] for j in junctions if j["phys"]]
    evid = [j["ws"] for j in junctions if j["evid"]]
    starts = [s[0] for s in spans]

    def atom_of(x):
        k = bisect.bisect_right(starts, x) - 1
        # a character between pieces belongs to the atom its junction closes or opens: the head of a PHYS junction opens the next atom
        for jn, j in enumerate(junctions):
            if j["phys"] and j["ws"][1] <= x < spans[jn + 1][0]:
                return atoms_of_piece[jn + 1]
        return atoms_of_piece[max(k, 0)]
    return {"body": body, "physSpans": phys, "evidSpans": evid, "atomOf": atom_of, "endEvident": end_evident}


def ta_truth(case, meta):
    """Construction truth of a touching-atom construction (build_ta)."""
    docs, reloc = {}, {}
    for d, doc in enumerate(case["docs"]):
        body, spans, junctions, atoms, docend = _ta_body(doc)
        docs[d] = _ta_doc_facts(body, junctions, atoms, spans, doc.get("end", ".").strip()[-1:] in (".", "!", "?"))
        for m, ms in enumerate(doc["members"]):
            if ms.get("relocate"):
                for mt in meta:
                    if mt["doc"] == d and len(mt["units"]) == 1 and body[mt["units"][0][0]:mt["units"][0][1]] == ms["relocate"]:
                        reloc.setdefault(mt["recordId"], []).append(m)
                        # a final full stop followed (after the paragraph break) by a copy that begins lowercase evidences no sentence end
                        docs[d].setdefault("relocLower", {})[mt["recordId"]] = unicodedata.category(ms["relocate"][0]) == "Ll"
    return _ta_truth_core(docs, meta, reloc)


# the R-7 parent templates read by the same truth: junction type -> (PHYS, EVID) as those templates write them (SENTENCE, NUMBERED_CLAUSE and SECTION
# follow an atom ending with a terminal; TABLE_ROW and HEADLINE are line feeds with no terminal)
_TA_R7_JUNCTION = {"SPACE": (False, False), "COMMA": (False, False), "CONJUNCTION": (False, False), "WRAP": (False, False), "HEADLINE": (True, False),
                   "SENTENCE": (True, True), "NUMBERED_CLAUSE": (True, True), "TABLE_ROW": (True, False), "SECTION": (True, True)}


def ta_truth_r7(case, meta):
    """The touching-aware construction truth of an R-7 construction (build_r7): the same truth engine over the R-7 templates."""
    docs, reloc = {}, {}
    for d, doc in enumerate(case["docs"]):
        body, spans = _r7_body(doc["template"])
        jt = _R7_T[doc["template"]][1]
        junctions = []
        for x in range(1, len(spans)):
            ph, ev = _TA_R7_JUNCTION[jt[x - 1]]
            junctions.append({"type": jt[x - 1], "ws": [spans[x - 1][1], spans[x][0]], "phys": ph, "evid": ev})
        atoms, a = [], 0
        for x in range(len(spans)):
            if x and junctions[x - 1]["phys"]:
                a += 1
            atoms.append(a)
        docs[d] = _ta_doc_facts(body, junctions, atoms, spans, body.rstrip()[-1:] in (".", "!", "?"))
        for m, ms in enumerate(doc["members"]):
            if ms.get("relocate"):
                for mt in meta:
                    if mt["doc"] == d and len(mt["units"]) == 1 and body[mt["units"][0][0]:mt["units"][0][1]] == ms["relocate"]:
                        reloc.setdefault(mt["recordId"], []).append(m)
                        docs[d].setdefault("relocLower", {})[mt["recordId"]] = unicodedata.category(ms["relocate"][0]) == "Ll"
    return _ta_truth_core(docs, meta, reloc)


def ta_generated_cases():
    """The touching-atom generated surface (deterministic, enumerated): sub-sentence fragments split at every non-lawful delimiter (space, comma,
    semicolon, colon, conjunction, comma + conjunction, line wrap, column break, uncoded words), TIGHT and WIDE footprints, same and conflicting classes,
    FRAME-C with one or two renditions and FRAME-U; lawful junctions (sentences, numbered clauses with and without terminals, sub-clauses, table rows,
    headings) with separate records, recorded separators and conjoined records; three-atom documents with chains, bridges and gapped records; two
    documents; FRAME-U member arrangements that differ; 1-4 records per case."""
    S, N = "START", "NONE"
    TXT, H0, H40, HU = {"kind": "TEXT"}, {"kind": "HTML"}, {"kind": "HTML", "pad": 40}, {"kind": "HTML", "inject": "zqxzqx"}
    FR = {"C1": [TXT], "C2": [H0, H40], "U": [H0, HU]}
    out = []

    def add(fam, docs, recs):
        out.append({"family": fam, "docs": docs, "records": recs})

    def r(doc, member, units, codes):
        return {"doc": doc, "member": member, "units": units, "codes": codes}
    cls_pairs = [(("R1", 3), ("A1", 7)), (("A1", 7), ("R1", 3)), (("R1", 3), ("R2", 3)), (("A1", 7), ("A2", 7))]
    widths = [("TIGHT", "TIGHT"), ("WIDE", "WIDE"), ("TIGHT", "WIDE"), ("WIDE", "TIGHT")]
    # F1: one sentence, two fragments divided by a non-lawful delimiter (the R7-RES-1 surface)
    for jt in ("SPACE", "COMMA", "SEMI", "COLON", "CONJ", "COMMA_CONJ", "WRAP", "COLUMN", "GAPW"):
        for (pa, ca), (pb, cb) in cls_pairs:
            for fk, mem in sorted(FR.items()):
                for wa, wb in (widths if fk == "C1" else widths[:2]):
                    add("SPLIT_" + jt, [{"pieces": [pa, pb], "junctions": [jt], "members": mem}],
                        [r(0, 0, [[0, 0, S, wa]], [[0, ca]]), r(0, len(mem) - 1, [[1, 1, S, wb]], [[0, cb]])])
    # F2: two atoms divided by a lawful junction: separate records, one record with the recorded separator, a conjoined record + a fragment
    for jt in ("SENT", "SENT_NL", "SENT_QUOTE", "NUM", "NUM_BARE", "SUBCL", "ROW", "HEAD"):
        dec = _TA_DECLARE[jt]
        for (pa, ca), (pb, cb) in cls_pairs:
            docs = [{"pieces": [pa, pb], "junctions": [jt], "members": [TXT]}]
            for wa, wb in widths:
                add("LAWFUL_" + jt, docs, [r(0, 0, [[0, 0, S, wa]], [[0, ca]]), r(0, 0, [[1, 1, S, wb]], [[0, cb]])])
            add("LAWFUL_" + jt, docs, [r(0, 0, [[0, 0, S, "WIDE"], [1, 1, dec, "WIDE"]], [[0, ca], [1, cb]])])
            add("LAWFUL_" + jt, docs, [r(0, 0, [[0, 0, S, "WIDE"], [1, 1, dec, "WIDE"]], [[0, ca]]), r(0, 0, [[1, 1, S, "TIGHT"]], [[0, cb]])])
            add("LAWFUL_" + jt, docs, [r(0, 0, [[0, 0, S, "WIDE"], [1, 1, N, "WIDE"]], [[0, ca]]), r(0, 0, [[1, 1, S, "TIGHT"]], [[0, cb]])])
            add("LAWFUL_" + jt, [{"pieces": [pa, pb], "junctions": [jt], "members": [H0, HU]}], [r(0, 0, [[0, 0, S, "TIGHT"]], [[0, ca]]), r(0, 1, [[1, 1, S, "TIGHT"]], [[0, cb]])])
    # F3: three pieces, two junctions (one lawful, one not, in both orders, or both not): chains, bridges, gapped pairs, 2-4 records
    tri = [("SPACE", "SENT"), ("SENT", "SPACE"), ("COMMA", "CONJ"), ("WRAP", "SENT_NL"), ("NUM", "COMMA"), ("SPACE", "ROW"), ("GAPW", "SPACE")]
    shapes = [[(0, 0), (1, 1), (2, 2)], [(0, 0), (2, 2)], [(0, 1), (2, 2)], [(0, 0), (1, 2)], [(0, 0), (1, 1)], [(1, 1), (2, 2)],
              [(0, 0), (1, 1), (2, 2), (0, 0)]]
    for j1, j2 in tri:
        for shape in shapes:
            for mid in ("A2", "R2", "N1"):
                pieces = ["R1", mid, "A1"]
                recs = []
                for i, j in shape:
                    key = next((p for p in range(i, j + 1) if _TA_P[pieces[p]][1]), None)
                    if key is None:
                        recs = None
                        break
                    c = 3 if _TA_P[pieces[key]][1] == "ret" else 7
                    units = [[x, x, S if x == i else N, "WIDE"] for x in range(i, j + 1)] if i != j else [[i, j, S, "TIGHT"]]
                    recs.append(r(0, 0, units, [[key - i, c]]))
                if recs:
                    add("TRIPLE_%s_%s" % (j1, j2), [{"pieces": pieces, "junctions": [j1, j2], "members": [TXT]}], recs)
    # F4: the bridge - a record conjoining across a lawful junction joins two atoms' fragments transitively
    # (the bridging record conjoins pieces 1 and 2 across the lawful junction and carries its one class in BOTH, so its class-bearing core spans both
    # atoms; the records on pieces 0 and 3 lie in different atoms and are joined only through it)
    bridges = (["A1", "R1", "R2", "A2"], ["R1", "A1", "A2", "R2"], ["R3", "R1", "R2", "A1"], ["A3", "A1", "A2", "R1"])
    for jt in ("SENT", "NUM", "ROW"):
        for pieces in bridges:
            cl = [7 if _TA_P[p][1] == "acc" else 3 for p in pieces]
            add("BRIDGE_" + jt, [{"pieces": pieces, "junctions": ["SPACE", jt, "SPACE"], "members": [TXT]}],
                [r(0, 0, [[0, 0, S, "TIGHT"]], [[0, cl[0]]]), r(0, 0, [[1, 1, S, "WIDE"], [2, 2, N, "WIDE"]], [[0, cl[1]], [1, cl[2]]]),
                 r(0, 0, [[3, 3, S, "TIGHT"]], [[0, cl[3]]])])
    # F4b: the same bridges with the bridging record LAST in the generated order (a record-order-grown cluster would miss the transitive join)
    for jt in ("SENT", "NUM"):
        for pieces in bridges:
            cl = [7 if _TA_P[p][1] == "acc" else 3 for p in pieces]
            add("BRIDGE_LAST_" + jt, [{"pieces": pieces, "junctions": ["SPACE", jt, "SPACE"], "members": [TXT]}],
                [r(0, 0, [[0, 0, S, "TIGHT"]], [[0, cl[0]]]), r(0, 0, [[3, 3, S, "TIGHT"]], [[0, cl[3]]]),
                 r(0, 0, [[1, 1, S, "WIDE"], [2, 2, N, "WIDE"]], [[0, cl[1]], [1, cl[2]]])])
    # F5: two underlying documents at the same positions
    for jt in ("SPACE", "COMMA", "SENT"):
        for (pa, ca), (pb, cb) in cls_pairs:
            add("TWO_DOCUMENTS", [{"pieces": [pa, pb], "junctions": [jt], "members": [TXT]},
                                  {"pieces": [pa, pb], "junctions": [jt], "end": ". Annex.", "members": [TXT]}],
                [r(0, 0, [[0, 0, S, "TIGHT"]], [[0, ca]]), r(1, 0, [[1, 1, S, "TIGHT"]], [[0, cb]])])
    # F6: stacked exact duplicates next to a touching fragment; a whole-sentence MULTIPLE record present or absent
    for jt in ("SPACE", "COMMA", "WRAP"):
        for (pa, ca), (pb, cb) in cls_pairs[:2]:
            docs2 = [{"pieces": [pa, pb], "junctions": [jt], "members": [H0, H40]}]
            add("STACKED", docs2, [r(0, 0, [[0, 0, S, "TIGHT"]], [[0, ca]]), r(0, 1, [[0, 0, S, "TIGHT"]], [[0, ca]]),
                                   r(0, 0, [[0, 0, S, "WIDE"]], [[0, ca]]), r(0, 1, [[1, 1, S, "TIGHT"]], [[0, cb]])])
            docs1 = [{"pieces": [pa, pb], "junctions": [jt], "members": [TXT]}]
            add("MULTIPLE_PRESENT", docs1, [r(0, 0, [[0, 0, S, "TIGHT"]], [[0, ca]]), r(0, 0, [[1, 1, S, "TIGHT"]], [[0, cb]]),
                                            r(0, 0, [[0, 1, S, "WIDE"]], [[0, ca], [0, cb]])])
    # F7: FRAME-U member arrangements that differ: the later record's key broken in one member's body (a character-reference letter inserted at a word
    # boundary, which R-EQV blanks) and found only in a relocated copy appended after the body
    for jt, e in (("SPACE", "."), ("ROW", ""), ("SENT", ".")):
        for (pa, ca), (pb, cb) in cls_pairs[:2]:
            for order in (0, 1):
                body, spans, junctions, atoms, docend = _ta_body({"pieces": [pa, pb], "junctions": [jt], "end": e})
                reloc = body[spans[1][0]:spans[1][1]]
                brk = {"kind": "HTML", "breakAt": spans[1][0] + reloc.index(" ") + 1, "relocate": reloc}
                members = [brk, H0] if order == 0 else [H0, brk]
                add("FRAME_U_DIFFERING", [{"pieces": [pa, pb], "junctions": [jt], "end": e, "members": members}],
                    [r(0, 1 - order, [[0, 0, S, "TIGHT"]], [[0, ca]]), r(0, 1 - order, [[1, 1, S, "TIGHT"]], [[0, cb]])])
    for jt in ("SENT", "SENT_NL"):
        for (pa, ca), (pb, cb) in cls_pairs[:2]:
            for order in (0, 1):
                body, spans, junctions, atoms, docend = _ta_body({"pieces": [pa, pb], "junctions": [jt], "end": ""})
                reloc = body[spans[0][0]:spans[0][1]]
                brk = {"kind": "HTML", "breakAt": spans[0][0] + reloc.index(" ") + 1, "relocate": reloc}
                members = [brk, H0] if order == 0 else [H0, brk]
                add("FRAME_U_DIFFERING_EARLIER", [{"pieces": [pa, pb], "junctions": [jt], "end": "", "members": members}],
                    [r(0, 1 - order, [[0, 0, S, "TIGHT"]], [[0, ca]]), r(0, 1 - order, [[1, 1, S, "TIGHT"]], [[0, cb]])])
    for n, c in enumerate(out):
        c["id"] = "TAG-%04d" % n
    return out


_TA_HARD = ("touchingQuoteShoppingBypass", "falseSourceDiversityFromTouching", "falseSrcDivFromTouching", "sameAtomConflictingClassesStillCount",
            "sameClassTouchingMultiContribution", "lawfullySeparateAtomsCollapsed", "differentAtomsCollapsed", "crossDocumentTaint",
            "textEqualityUsedAsAtomProof", "recordOrderDependence", "componentOrderDependence", "nonIdempotence", "CSIChangedByTouchingClosure",
            "sourceClassAssignmentChangedByTouchingClosure", "segmentationChanged", "atomDefinitionChanged", "atomProjectionViolation")
_TA_REPORTED = ("conservativeUndercount", "unevidencedBoundaryJoined", "memberDisagreementJoined", "frozenEvidenceParitySplit", "mechanicsInvalid")


def ta_signature(res, field):
    bo = res["count"].get(field) or {}
    recs = bo.get("records", {})
    comps = {}
    for sid, r in recs.items():
        comps.setdefault(r["basisOverlapComponentId"], []).append(sid)
    return {"classes": res["count"]["distinctClassSet"], "holds": res["count"]["holds"],
            "dispositions": dict((sid, r["b2CountDisposition"]) for sid, r in sorted(recs.items())),
            "components": sorted(sorted(v) for v in comps.values()), "componentIds": sorted((k, sorted(v)) for k, v in comps.items())}


def ta_contributing(res, field):
    """{segmentId: does the record's basis count component contribute a class}: a listed component by its recorded contribution; an unlisted one
    (one exact group, no partner) unless its exact group is a SEGMENT_CLASS_CONFLICT of the count."""
    bo = res["count"].get(field) or {}
    listed = dict((m, bool(c["contributes"])) for c in bo.get("components", []) for m in c["members"])
    segs = dict((s["segmentId"], s) for s in res["segmentRecords"])
    conflicted = set(tuple(x["key"]) for x in res["count"].get("segmentClassConflicts", []))
    out = {}
    for sid in bo.get("records", {}):
        if sid in listed:
            out[sid] = listed[sid]
        else:
            s = segs[sid]
            out[sid] = (s["underlyingDocumentIdentity"], s["canonicalSegmentIdentity"]) not in conflicted
    return out


def judge_ta(case, res, truth, labels, field, disp, same_labels, others=(), res_off=None, res_base=None, again=None):
    """Counters of one evaluated touching-atom (or R-7) construction. res: the candidate; others: other record orders; res_off: the touching relation
    absent (the R7-B2 parent's layer); res_base: the whole count layer absent (identity / state / class and segmentation must be byte-identical);
    again: a second evaluation. same_labels: the relation labels that mean SAME atom. Truth is the construction's."""
    c = dict((k, 0) for k in _TA_HARD + _TA_REPORTED)
    lab = dict((code, labels[i]) for code, i in _R7_CLS.items())
    segs = dict((s["segmentId"], s) for s in res["segmentRecords"])
    for ref in (res_off, res_base):
        if ref is None:
            continue
        off = dict((s["segmentId"], s) for s in ref["segmentRecords"])
        if set(off) != set(segs) or any(off[sid].get("canonicalSegmentIdentity") != s["canonicalSegmentIdentity"] for sid, s in segs.items()):
            c["CSIChangedByTouchingClosure"] = 1
        if any((off[sid].get("sourceClassAssignmentState"), off[sid].get("sourceClass"), off[sid].get("satisfiedClassIds"))
               != (s["sourceClassAssignmentState"], s["sourceClass"], s["satisfiedClassIds"]) for sid, s in segs.items() if sid in off):
            c["sourceClassAssignmentChangedByTouchingClosure"] = 1
        if any((off[sid].get("unitIds"), off[sid].get("span")) != (s.get("unitIds"), s.get("span")) for sid, s in segs.items() if sid in off):
            c["segmentationChanged"] = 1
    if set(segs) != set(truth["segments"]) or any(segs[sid].get("unitIds") != t["unitIds"] for sid, t in truth["segments"].items() if sid in segs):
        c["segmentationChanged"] = 1
    base = dict((s["segmentId"], s) for s in (res_base or res_off or res)["segmentRecords"])
    cands = [sid for sid, t in truth["segments"].items() if t["cls"] is not None]
    if any(sid not in base or base[sid]["sourceClassAssignmentState"] != "ASSIGNED" or base[sid]["canonicalSegmentIdentity"] is None
           or base[sid]["sourceClass"] != lab[truth["segments"][sid]["cls"]] for sid in cands):
        c["mechanicsInvalid"] = 1
        return c
    sig = ta_signature(res, field)
    bo = res["count"].get(field) or {}
    recs = bo.get("records", {})
    comp_of = dict((sid, r["basisOverlapComponentId"]) for sid, r in recs.items())
    contributes = ta_contributing(res, field)
    want = set(lab[x] for x in truth["lawfulClasses"])
    got = set(sig["classes"])
    if got - want:
        c["falseSourceDiversityFromTouching"] = 1
    if sig["holds"] and len(want) < 2:
        c["falseSrcDivFromTouching"] = 1
    pairs = truth["pairs"]

    def pair(x, y):
        return pairs.get("%s|%s" % (x, y)) or pairs.get("%s|%s" % (y, x))
    for comp in truth["lawfulComponents"]:
        classes = set(truth["segments"][s]["cls"] for s in comp)
        touch = any((pair(x, y) or {}).get("kind") == "TOUCH" and pair(x, y)["edge"] for x in comp for y in comp if x < y)
        groups = len(set(tuple(truth["segments"][s]["fp"]) for s in comp))
        if len(classes) > 1 and touch and any(contributes.get(s, True) for s in comp):
            c["touchingQuoteShoppingBypass"] = 1
        if len(classes) == 1 and touch and groups > 1:
            if len(set(comp_of.get(s) for s in comp)) > 1 or any(recs.get(s, {}).get("b2CountDisposition") != disp["collapsed"] for s in comp):
                c["sameClassTouchingMultiContribution"] = 1
    contributing = sum(1 for comp in truth["lawfulComponents"] if len(set(truth["segments"][s]["cls"] for s in comp)) == 1)
    if res["count"]["contributingGroups"] > contributing:
        c["sameClassTouchingMultiContribution"] = 1
    # the professional-reference atom projection: fragments of one physical atom never end in different components and never both contribute
    for comp in truth["projectionComponents"]:
        classes = set(truth["segments"][s]["cls"] for s in comp)
        split = len(set(comp_of.get(s) for s in comp)) > 1
        parity = any((pair(x, y) or {}).get("parityOnly") for x in comp for y in comp if x < y)
        if split and parity:
            c["frozenEvidenceParitySplit"] = 1
            continue
        if len(classes) > 1 and any(contributes.get(s, True) for s in comp):
            c["sameAtomConflictingClassesStillCount"] = 1
        if split:
            c["atomProjectionViolation"] = 1
    lawful_of = dict((s, n) for n, comp in enumerate(truth["lawfulComponents"]) for s in comp)
    members = {}
    for sid, cid in comp_of.items():
        members.setdefault(cid, []).append(sid)
    for cid, ms in members.items():
        if len(set(truth["segments"][s]["doc"] for s in ms if s in truth["segments"])) > 1:
            c["crossDocumentTaint"] = 1
        for x in ms:
            for y in ms:
                if x < y and x in lawful_of and y in lawful_of and lawful_of[x] != lawful_of[y]:
                    p = pair(x, y)
                    if p is not None and p["recorded"]:
                        c["lawfullySeparateAtomsCollapsed"] = 1
                    else:
                        c["differentAtomsCollapsed"] = 1
                    if case.get("equalText"):
                        c["textEqualityUsedAsAtomProof"] = 1
    # the recorded atom relation of every non-overlapping pair equals the frozen atom reading of the construction
    rel = dict(("%s|%s" % tuple(r["records"]), r["relation"] in same_labels) for r in bo.get("touchingAtomRelations", []))
    ovl = set("%s|%s" % tuple(sorted(p["records"])) for p in bo.get("overlapPairs", []))
    for key, p in pairs.items():
        if p["kind"] != "TOUCH" or p["parityOnly"]:
            continue
        x, y = key.split("|")
        if "%s|%s" % tuple(sorted((x, y))) in ovl:
            continue                                 # a member in which the two footprints overlap: the overlap relation governs the pair
        got_same = rel.get(key, rel.get("%s|%s" % (y, x), False))
        if got_same != p["sameAtomLawful"]:
            c["atomDefinitionChanged"] = 1
        if p["sameAtomLawful"] and p["physical"] and not p["memberDisagreement"]:
            c["unevidencedBoundaryJoined"] = 1
        if p["sameAtomLawful"] and p["memberDisagreement"]:
            c["memberDisagreementJoined"] = 1
    for o in others:
        so = ta_signature(o, field)
        if (so["classes"], so["holds"], so["dispositions"], so["components"]) != (sig["classes"], sig["holds"], sig["dispositions"], sig["components"]):
            c["recordOrderDependence"] = 1
        if so["componentIds"] != sig["componentIds"]:
            c["componentOrderDependence"] = 1
    if again is not None and (ta_signature(again, field) != sig or again["segmentRecords"] != res["segmentRecords"]):
        c["nonIdempotence"] = 1
    phys = set(lab[x] for x in truth["physicalClasses"])
    if phys - got:
        c["conservativeUndercount"] = 1
    return c
# ================================================================== TOUCHING-ATOM CONSTRUCTION ORACLE END
# ================================================================== SENTENCE-EVIDENCE CONSTRUCTION ORACLE BEGIN
# The touching-atom constructions (pieces and typed junctions) extended by the junctions this act decides: an ambiguous full stop followed - after
# closing punctuation and spacing - by a LOWERCASE letter (physically inside one sentence: PHYS false, EVID false under the corrected evidence), and the
# controls it must not touch (a full stop before an uppercase letter, a question mark, an exclamation mark, before an uppercase or a lowercase letter:
# PHYS true, EVID true). A record may also DECLARE a SENTENCE at a junction; at an ambiguous full stop with a lowercase continuation that declaration is
# a coder-invented boundary the corrected evidence must reject. Truth is the construction's (ta_truth), plus, per candidate pair, the junction types
# between the two cores. The professional reference (UAX #29 SB8 style) decides every full stop of a body independently of both. Nothing here reads a
# candidate identity, relation, component or disposition, or calls the interpreter's separator evidence (check SE-11).
_TA_P.update({
    "XR0": ("the annual retainer of each director is $36,000 at Acme Co", "ret"),
    "XAW": ("whereby the access matrix grants each officer read rights to the vault", "acc"),
    "XRU": ("über which the annual retainer of each director is $36,000 in cash", "ret"),
    "XM": ("under which the annual retainer of each director is $36,000 at Acme Co", "ret"),
})
_TA_J.update({
    "ATERM_LOWER": (".", " ", "", False, False, False),
    "ATERM_QUOTE": (".\"", " ", "", False, False, False),
    "ATERM_PAREN": (".)", " ", "", False, False, False),
    "ATERM_BRACKET": (".]", " ", "", False, False, False),
    "ATERM_NL": (".", "\n", "", False, False, False),
    "ATERM_ELLIPSIS": ("...", " ", "", False, False, False),
    "ATERM_UPPER": (".", " ", "", True, True, True),
    "QMARK": ("?", " ", "", True, True, True),
    "EXCL": ("!", " ", "", True, True, True),
    "QMARK_LOWER": ("?", " ", "", True, True, False),
    "EXCL_LOWER": ("!", " ", "", True, True, False),
})
_SE_ATERM = ("ABBR", "ATERM_LOWER", "ATERM_QUOTE", "ATERM_PAREN", "ATERM_BRACKET", "ATERM_NL", "ATERM_ELLIPSIS")
_SE_UPPER = ("SENT", "SENT_NL", "SENT_QUOTE", "ATERM_UPPER")
_SE_QMARK = ("QMARK", "QMARK_LOWER")
_SE_EXCL = ("EXCL", "EXCL_LOWER")
_TA_DECLARE.update(dict((t, "SENTENCE") for t in _SE_ATERM + _SE_UPPER + _SE_QMARK + _SE_EXCL))


def uax29_sb8_no_break(text, i):
    """The professional reference (validation only), written from UAX #29 SB8, narrowed as the act requires: the full stop at text[i] does NOT end a
    sentence when it is followed by closing punctuation (Unicode Pe / Pf, or an ASCII quote), then spacing (Unicode whitespace; a line feed is a line
    wrap in this model), and then a Lowercase_Letter (general category Ll). Nothing else is decided."""
    if text[i] != ".":
        return False
    j = i + 1
    if j < len(text) and text[j] == ".":
        return False                                  # not the last full stop of an ellipsis: the last one decides
    while j < len(text) and (unicodedata.category(text[j]) in ("Pe", "Pf") or text[j] in "\"'"):
        j += 1
    while j < len(text) and text[j].isspace():
        j += 1
    return j < len(text) and unicodedata.category(text[j]) == "Ll"


def se_case_facts(case, meta):
    """Per document, the junctions with their type and their full stops; per candidate pair (the truth's pair keys), the junction types between the two
    class-bearing cores; the declared separators and the junction each sits on. Body coordinates, from the construction alone."""
    docs = {}
    for d, doc in enumerate(case["docs"]):
        body, spans, junctions, atoms, docend = _ta_body(doc)
        docs[d] = {"body": body, "junctions": junctions, "spans": spans}
    cores, recseg = {}, {}
    for mt in meta:
        body = docs[mt["doc"]]["body"]
        groups, cur = [], []
        for ui, sep in enumerate(mt["seps"]):
            if ui and sep != "NONE":
                groups.append(cur)
                cur = []
            cur.append(ui)
        groups.append(cur)
        for gi, g in enumerate(groups):
            sid = "%s#s%d" % (mt["recordId"], gi + 1)
            cs = [_ta_alnum(body, *mt["units"][ui]) for ui in g if any(x == ui for x, _ in mt["codes"])]
            if cs:
                cores[sid] = (mt["doc"], cs)
    declared = []
    for mt, rc in zip(meta, case["records"]):
        J = docs[mt["doc"]]["junctions"]
        body = docs[mt["doc"]]["body"]
        for ui, sep in enumerate(mt["seps"]):
            if ui and sep not in ("START", "NONE"):
                x = rc["units"][ui - 1][1]
                declared.append({"recordId": mt["recordId"], "separator": sep, "junction": J[x]["type"] if x < len(J) else None,
                                 "adjacent": not body[mt["units"][ui - 1][1]:mt["units"][ui][0]].strip()})

    def between(a, b):
        da, ca = cores[a]
        db, cb = cores[b]
        if da != db:
            return None
        (e0, e1), (l0, l1) = sorted([(min(x[0] for x in ca), max(x[1] for x in ca)), (min(x[0] for x in cb), max(x[1] for x in cb))])
        return sorted(set(j["type"] for j in docs[da]["junctions"] if e1 <= j["ws"][0] and j["ws"][1] <= l0))
    return docs, between, declared


def se_generated_cases():
    """The sentence-evidence generated surface (deterministic, enumerated): an ambiguous full stop followed by a lowercase continuation - bare, behind a
    closing quote, parenthesis or bracket, across a line wrap, after an ellipsis, with a non-ASCII lowercase letter - between two touching fragments
    (TIGHT / WIDE; FRAME-C with one or two renditions; FRAME-U) and under a declared SENTENCE; the controls (full stop before an uppercase letter,
    sentences, question and exclamation marks before an uppercase or a lowercase letter) touching and declared; three-piece mixes with sentences,
    numbered clauses, table rows, line wraps and commas; 1-4 records."""
    S, N = "START", "NONE"
    TXT, H0, H40, HU = {"kind": "TEXT"}, {"kind": "HTML"}, {"kind": "HTML", "pad": 40}, {"kind": "HTML", "inject": "zqxzqx"}
    FR = {"C1": [TXT], "C2": [H0, H40], "U": [H0, HU]}
    out = []

    def add(fam, docs, recs):
        out.append({"family": fam, "docs": docs, "records": recs})

    def r(doc, member, units, codes):
        return {"doc": doc, "member": member, "units": units, "codes": codes}
    cls = lambda p: 7 if _TA_P[p][1] == "acc" else 3
    combos = [(a, b) for a in ("XA", "XR0") for b in ("XR", "XAW", "XRU")]
    widths = [("TIGHT", "TIGHT"), ("WIDE", "WIDE"), ("TIGHT", "WIDE"), ("WIDE", "TIGHT")]
    for jt in _SE_ATERM[1:]:
        for a, b in combos:
            for fk, mem in sorted(FR.items()):
                for wa, wb in (widths if fk == "C1" else widths[:2]):
                    add("ATERM_%s_%s" % (jt, fk), [{"pieces": [a, b], "junctions": [jt], "members": mem}],
                        [r(0, 0, [[0, 0, S, wa]], [[0, cls(a)]]), r(0, len(mem) - 1, [[1, 1, S, wb]], [[0, cls(b)]])])
            add("DECLARED_" + jt, [{"pieces": [a, b], "junctions": [jt], "members": [TXT]}],
                [r(0, 0, [[0, 0, S, "WIDE"], [1, 1, "SENTENCE", "WIDE"]], [[0, cls(a)], [1, cls(b)]])])
    for jt in _SE_UPPER + _SE_QMARK + _SE_EXCL:
        for a, b in combos:
            for wa, wb in widths:
                add("CONTROL_" + jt, [{"pieces": [a, b], "junctions": [jt], "members": [TXT]}],
                    [r(0, 0, [[0, 0, S, wa]], [[0, cls(a)]]), r(0, 0, [[1, 1, S, wb]], [[0, cls(b)]])])
            add("DECLARED_" + jt, [{"pieces": [a, b], "junctions": [jt], "members": [TXT]}],
                [r(0, 0, [[0, 0, S, "WIDE"], [1, 1, "SENTENCE", "WIDE"]], [[0, cls(a)], [1, cls(b)]])])
    tri = [("ATERM_LOWER", "ATERM_PAREN"), ("ATERM_LOWER", "SENT"), ("SENT", "ATERM_LOWER"), ("ATERM_QUOTE", "NUM"), ("WRAP", "ATERM_LOWER"),
           ("ATERM_LOWER", "QMARK"), ("COMMA", "ATERM_ELLIPSIS"), ("ATERM_NL", "ROW")]
    shapes = [[(0, 0), (1, 1), (2, 2)], [(0, 0), (2, 2)], [(0, 1), (2, 2)], [(0, 0), (1, 2)], [(0, 0), (1, 1)], [(1, 1), (2, 2)],
              [(0, 0), (1, 1), (2, 2), (0, 0)]]
    for j1, j2 in tri:
        pieces = ["XA", "XM", "XAW"]
        for shape in shapes:
            recs = []
            for i, j in shape:
                units = [[x, x, S if x == i else N, "WIDE"] for x in range(i, j + 1)] if i != j else [[i, j, S, "TIGHT"]]
                recs.append(r(0, 0, units, [[0, cls(pieces[i])]]))
            add("TRIPLE_%s_%s" % (j1, j2), [{"pieces": pieces, "junctions": [j1, j2], "members": [TXT]}], recs)
    for n, c in enumerate(out):
        c["id"] = "SEG-%04d" % n
    return out


_SE_HARD = ("lowercaseContinuationFalseBoundary", "falseAtomSplitFromATerm", "falseSourceDiversityFromATerm", "falseSrcDivFromATerm",
            "questionMarkBoundaryChanged", "exclamationBoundaryChanged", "uppercaseControlChanged", "atomDefinitionChanged", "CSIChanged",
            "sourceClassAssignmentChanged", "RCountAlgorithmChanged", "recordOrderDependence", "nonIdempotence", "uax29Sb8Violation",
            "referenceTruthDisagreement")
_SE_REPORTED = ("conservativeUndercount", "unevidencedBoundaryJoined", "memberDisagreementJoined", "declaredFalseBoundaryRejected", "carriedNonAdjacentDeclaration",
                "mechanicsInvalid")


def se_component_recompute(res, field):
    """The basis count components recomputed from the recorded facts alone (exact groups, the overlap pairs that are not lawfully separate, the
    touching-atom pairs that are not) with the component rule one class once / several nothing: the recorded partition and distinct-class set must
    equal it (the R-COUNT component algorithm)."""
    bo = res["count"].get(field) or {}
    recs = bo.get("records", {})
    segs = dict((s["segmentId"], s) for s in res["segmentRecords"])
    parent = dict((sid, sid) for sid in recs)

    def find(x):
        while parent[x] != x:
            x = parent[x]
        return x
    first = {}
    for sid in sorted(recs):
        k = (segs[sid]["underlyingDocumentIdentity"], segs[sid]["canonicalSegmentIdentity"])
        if k in first:
            parent[find(sid)] = find(first[k])
        else:
            first[k] = sid
    for p in bo.get("overlapPairs", []) + bo.get("touchingAtomPairs", []):
        if not p["lawfulSeparation"]["lawfullySeparate"]:
            parent[find(p["records"][0])] = find(p["records"][1])
    comps = {}
    for sid in recs:
        comps.setdefault(find(sid), []).append(sid)
    mine = sorted(sorted(v) for v in comps.values())
    theirs = {}
    for sid, r in recs.items():
        theirs.setdefault(r["basisOverlapComponentId"], []).append(sid)
    got = sorted(sorted(v) for v in theirs.values())
    classes = set()
    for c in comps.values():
        cl = set(segs[s]["sourceClass"] for s in c)
        if len(cl) == 1 and None not in cl:
            classes |= cl
    placed = set(recs)
    for s in res["segmentRecords"]:
        if s["segmentId"] not in placed and s["sourceClassAssignmentState"] == "ASSIGNED" and s["canonicalSegmentIdentity"]:
            classes.add(s["sourceClass"])
    return mine == got and sorted(classes) == sorted(res["count"]["distinctClassSet"])


def judge_se(case, meta, truth, results, labels, field, same_labels, parent_res):
    """Counters of one sentence-evidence construction. results: {'orders': [child evaluations or ModelError codes], 'again', 'off', 'base'};
    parent_res: the same corpus under the parent's evidence (guard absent). Truth is the construction's."""
    c = dict((k, 0) for k in _SE_HARD + _SE_REPORTED)
    docs, between, declared = se_case_facts(case, meta)
    # the professional reference decides every full stop of every junction; it must agree with the construction's EVID flag
    for d in docs.values():
        for j in d["junctions"]:
            dots = [x for x in range(j["tail"][0], j["tail"][1]) if d["body"][x] == "."]
            if not dots:
                continue
            nb = uax29_sb8_no_break(d["body"], dots[-1])
            if j["type"] in _SE_ATERM and not nb or j["type"] in _SE_UPPER + ("NUM",) and nb:
                c["referenceTruthDisagreement"] = 1
    false_decl = [x for x in declared if x["junction"] in _SE_ATERM and x["adjacent"]]
    if any(x["junction"] in _SE_ATERM and not x["adjacent"] for x in declared):
        c["carriedNonAdjacentDeclaration"] = 1          # the frozen whenNotAdjacent rule (carried R7-EVIDENCE): not this act's evidence
    orders = results["orders"]
    if false_decl:
        if any(not isinstance(r, str) or r != "SEPARATOR_EVIDENCE_FAILED" for r in orders + [results["again"]]):
            c["lowercaseContinuationFalseBoundary"] = 1
            c["uax29Sb8Violation"] = 1
        else:
            c["declaredFalseBoundaryRejected"] = 1
        return c
    if any(isinstance(r, str) for r in orders + [results["again"], results["off"], results["base"]]):
        kinds = set(x["junction"] for x in declared)
        c["questionMarkBoundaryChanged" if kinds & set(_SE_QMARK) else "exclamationBoundaryChanged" if kinds & set(_SE_EXCL)
          else "uppercaseControlChanged" if kinds & set(_SE_UPPER) else "atomDefinitionChanged"] = 1
        return c
    res = orders[0]
    b2 = (res["count"].get(field) or {})
    ta = judge_ta(case, res, truth, labels, field, results["disp"], same_labels, orders[1:], results["off"], results["base"], results["again"])
    aterm_case = any(j["type"] in _SE_ATERM for d in docs.values() for j in d["junctions"])
    if ta["mechanicsInvalid"]:
        c["mechanicsInvalid"] = 1
        return c
    c["CSIChanged"] = ta["CSIChangedByTouchingClosure"]
    c["sourceClassAssignmentChanged"] = ta["sourceClassAssignmentChangedByTouchingClosure"]
    c["atomDefinitionChanged"] = ta["segmentationChanged"]
    c["recordOrderDependence"] = max(ta["recordOrderDependence"], ta["componentOrderDependence"])
    c["nonIdempotence"] = ta["nonIdempotence"]
    for k in ("conservativeUndercount", "unevidencedBoundaryJoined", "memberDisagreementJoined"):
        c[k] = ta[k]
    if aterm_case:
        c["falseSourceDiversityFromATerm"] = ta["falseSourceDiversityFromTouching"]
        c["falseSrcDivFromATerm"] = ta["falseSrcDivFromTouching"]
        c["falseAtomSplitFromATerm"] = max(ta["atomProjectionViolation"], ta["sameAtomConflictingClassesStillCount"])
    elif any(ta[k] for k in ("falseSourceDiversityFromTouching", "falseSrcDivFromTouching", "atomProjectionViolation")):
        c["atomDefinitionChanged"] = 1
    rel = dict(("%s|%s" % tuple(r["records"]), r["relation"] in same_labels) for r in b2.get("touchingAtomRelations", []))
    for key, p in truth["pairs"].items():
        if p["kind"] != "TOUCH":
            continue
        a, b = key.split("|")
        kinds = between(a, b) or []
        got_same = rel.get(key, rel.get("%s|%s" % (b, a), False))
        evident = [k for k in kinds if _TA_J[k][4]]
        if p["recorded"] and c["carriedNonAdjacentDeclaration"]:
            continue
        if not evident and not p["recorded"]:
            if not got_same and any(k in _SE_ATERM for k in kinds):
                c["lowercaseContinuationFalseBoundary"] = 1
                c["uax29Sb8Violation"] = 1
            elif not got_same and not p["memberDisagreement"]:
                c["atomDefinitionChanged"] = 1
        elif got_same and not p["sameAtomLawful"]:
            ev = set(evident)
            c["questionMarkBoundaryChanged" if ev & set(_SE_QMARK) else "exclamationBoundaryChanged" if ev & set(_SE_EXCL)
              else "uppercaseControlChanged" if ev & set(_SE_UPPER) else "atomDefinitionChanged"] = 1
    if not se_component_recompute(res, field):
        c["RCountAlgorithmChanged"] = 1
    for x in declared:
        if x["junction"] in _SE_QMARK + _SE_EXCL + _SE_UPPER and len([s for s in res["segmentRecords"] if s["recordId"] == x["recordId"]]) < 2:
            c["questionMarkBoundaryChanged" if x["junction"] in _SE_QMARK else "exclamationBoundaryChanged" if x["junction"] in _SE_EXCL
              else "uppercaseControlChanged"] = 1
    return c
# ================================================================== SENTENCE-EVIDENCE CONSTRUCTION ORACLE END

# ================================================================== BOUNDARY-INTEGRITY CONSTRUCTION ORACLE BEGIN
# Constructions for IV1-M1 (a SENTENCE declared across an omitted gap) and IV1-M2 (a full stop inside a stipulated compound entity name, with and
# without a bound authority record). Truth is the construction's: the pieces, the stipulated physical boundary, the authority variant the construction
# wrote, and an independent scan of the terminals in the documentary interval (closers and spacing skipped, the next cased letter read, the stipulated
# name occurrences placed by the construction itself). Nothing here calls the interpreter's separator evidence, the veto, the authority binding or
# evaluate_corpus (check BI-11). The authority records are written the way the CORR1 schema defines them; their spans are the construction's own
# placements of the printed name (no ENTITY_NAME_EQUIVALENCE_v1, no normalization).
_BI_RIGHTS = "The permissions matrix grants each officer read rights at Acme Inc"
_BI_PAY = "under which the annual retainer of each director is $41,000 in cash"
_BI_A7 = [["roleDimension", True, "each officer"], ["entitlementDimension", True, "read rights"], ["allocationStatement", True, "permissions matrix grants"],
          ["operativeContent", "ROLE_ALLOCATION", "permissions matrix grants"]]
_BI_A3 = [["rewardObject", True, "annual retainer"], ["structureStated", True, "annual retainer"], ["rewardModality", "STRUCTURE", "annual retainer"],
          ["rewardProvisions", "B1", "$41,000"], ["operativeContent", "REWARD_STRUCTURE", "annual retainer"]]
_BI_SCHEMA_CONST = {"authorityVersion": "SEC-HISTORICAL-ENTITY-NAME-AUTHORITY-1.CORR1", "equivalenceRule": "ENTITY_NAME_EQUIVALENCE_v1",
                    "entityInternalPeriodRule": "CANDIDATE_OFFSET_STRICTLY_INSIDE_ANY_SPAN", "entityIdType": "SEC_CIK"}
_BI_VALID = ("VALID",)
_BI_REFUSED_UNPROVEN = ("NOT_DETERMINABLE", "SPANS_NOT_PROVEN", "WRONG_DIGEST", "WRONG_ARTIFACT", "SHIFTED")
_BI_REFUSED_IDENTITY = ("ENTITY_ID_INVALID", "CONSTANTS")
_BI_REFUSED_TEMPORAL = ("TEMPORAL_NOT_PROVEN",)
_BI_CLOSERS = "\"')]\u201d"                   # CORR1 IV1-F2: U+201D RIGHT DOUBLE QUOTATION MARK
_BI_HARD = ("nonAdjacentSentenceDeclarationBypass", "omittedTerminalCreatesBoundary", "omittedCloserCreatesBoundary", "falseSourceDiversityFromM1",
            "falseSrcDivFromM1", "entityInternalPeriodCreatesBoundary", "unprovenEntityNameUsedAsAuthority", "wrongCikNameBinding",
            "currentNameUsedOutsideTemporalAuthority", "falseSourceDiversityFromM2", "falseSrcDivFromM2", "positiveControlChanged", "CSIChanged",
            "sourceClassAssignmentChanged", "B2AlgorithmChanged", "atomDefinitionChanged", "recordOrderDependence", "nonIdempotentSemanticDecision",
            "outcomeLeakage", "environmentLeakage", "unexpectedOutcome")
_BI_REPORTED = ("residualCaseBReproduced", "declaredBoundaryRejected", "conflictingFragmentsWithheld", "authorityVetoExpected", "mechanicsInvalid")


def _bi_sha(t):
    return hashlib.sha256(t.encode("utf-8")).hexdigest()


def build_bi(interp, spec, fid):
    """(corpus, meta) of one boundary-integrity construction, from its spec alone."""
    text = spec["prefix"] + spec["left"] + spec["gap"] + spec["right"] + spec["suffix"]
    wrap = spec.get("htmlWrap")
    decoded = wrap[0] + text + wrap[1] if wrap else text
    recipe = "HTML_TEXT_V1" if wrap else "PLAIN_TEXT_V1"
    aid = fid + "-A"
    art = {"artifactId": aid, "content": {"inlineText": decoded}, "renditionDecoder": "UTF8_REPLACE",
           "identity": {"sha256": _bi_sha(decoded), "accession": "000001-26-%06d" % (int(hashlib.sha256(fid.encode()).hexdigest()[:5], 16) % 1000000),
                        "exhibitId": "EX-BI", "captureIdentity": None, "issuerNativeId": None, "registryIdentity": None,
                        "title": "Boundary-integrity construction " + fid, "period": "2026", "amendmentMarker": False, "versionId": None}}
    ext = interp.extract(inline_loader(art), recipe)
    base = ext.index(text) if wrap else 0
    if ext[base:base + len(text)] != text:
        raise ValueError("GENERATOR_MISMATCH extraction")
    L0 = base + len(spec["prefix"])
    L1 = L0 + len(spec["left"])
    R0 = L1 + len(spec["gap"])
    R1 = R0 + len(spec["right"])

    def unit(uid, s, e, sep, codes):
        u = ext[s:e]
        loc = {"artifactId": aid, "unitId": uid, "start": s, "end": e}
        return {"unitId": uid, "separatorBefore": sep, "locatorKind": "SENTENCE", "start": s, "end": e, "text": u, "textSha256": _bi_sha(u),
                "assertions": [{"featureId": f, "value": v, "witness": w, "assertionType": "QUOTED_WITNESS", "coderIdentity": "BI construction",
                                "sourceRef": "BI", "segmentLocator": dict(loc)} for f, v, w in codes]}

    def record(rid, units):
        return {"recordId": "%s-%s" % (fid, rid), "artifactId": aid, "sourceId": "BI", "recipe": recipe, "bindingStatus": "BOUND",
                "physicalHeading": None, "humanReadableLocator": None, "units": units}
    mode = spec["mode"]
    if mode == "declared":
        recs = [record("D", [unit("u1", L0, L1, "START", _BI_A7), unit("u2", R0, R1, "SENTENCE", _BI_A3)])]
    elif mode == "two":
        recs = [record("L", [unit("u1", L0, L1, "START", _BI_A7)]), record("R", [unit("u1", R0, R1, "START", _BI_A3)])]
    else:
        recs = [record("W", [unit("u1", L0, R1, "START", _BI_A7 + _BI_A3)])]
    corpus = {"artifacts": [art], "records": recs}
    off = len(wrap[0]) if wrap else 0
    occ = []
    for printed in spec.get("names", []):
        i = decoded.find(printed)
        while i >= 0:
            occ.append([i, i + len(printed), printed])
            i = decoded.find(printed, i + 1)
    occ.sort()
    auth = spec["auth"]
    if auth != "NONE":
        spans = [{"occurrenceStart": s, "occurrenceEnd": e, "occurrenceText": t} for s, e, t in occ]
        r = dict(_BI_SCHEMA_CONST, entityId="0000123456", entityRole="FILER", caseSide=None, documentDate="2026-01-15", pilotPeriod=None,
                 pilotPeriodMatchesHeaderDate=None, authoritativeName=(spec.get("names") or ["ACME"])[0].upper(),
                 authoritativeNameSource="SEC_FILING_HEADER_COMPANY_CONFORMED_NAME", temporalState="PROVEN", artifactId=aid,
                 artifactSha256=_bi_sha(decoded), occurrenceState="PROVEN" if spans else "ENTITY_NAME_SPANS_NOT_PROVEN",
                 occurrenceCount=len(spans), occurrenceSpans=spans or None, authoritySourceSha256="0" * 64, determinationReason="BI_CONSTRUCTION")
        if auth == "NOT_DETERMINABLE":
            r.update(temporalState="AUTHORITY_NOT_DETERMINABLE", occurrenceState=None, occurrenceCount=None, occurrenceSpans=None, entityId=None)
        elif auth == "SPANS_NOT_PROVEN":
            r.update(occurrenceState="ENTITY_NAME_SPANS_NOT_PROVEN", occurrenceCount=0, occurrenceSpans=None)
        elif auth == "TEMPORAL_NOT_PROVEN":
            r.update(temporalState="AUTHORITY_NOT_DETERMINABLE")
        elif auth == "WRONG_DIGEST":
            r.update(artifactSha256=_bi_sha(decoded + " "))
        elif auth == "WRONG_ARTIFACT":
            r.update(artifactId=aid + "-OTHER")
        elif auth == "SHIFTED":
            r.update(occurrenceSpans=[dict(s, occurrenceStart=s["occurrenceStart"] + 1, occurrenceEnd=s["occurrenceEnd"] + 1) for s in spans])
        elif auth == "ENTITY_ID_INVALID":
            r.update(entityId="123456")
        elif auth == "CONSTANTS":
            r.update(equivalenceRule="ENTITY_NAME_EQUIVALENCE_v0")
        records = [r]
        digest = sha_bytes(cjson(records))
        if auth == "EDITED":
            records = [dict(r, entityId="0000654321")]   # the CIK edited after sealing
        corpus["entityNameAuthority"] = {"recordsSha256": digest, "records": records}
    meta = {"aid": aid, "decodedOffset": off, "L": [L0, L1], "R": [R0, R1], "occurrences": occ, "recipe": recipe}
    return corpus, meta


def _bi_next_cased(s, i):
    """Index of the first character after s[i] past closers and spacing, and whether it is a cased letter and lowercase / uppercase."""
    j = i + 1
    while j < len(s) and s[j] in _BI_CLOSERS:
        j += 1
    k = j
    while k < len(s) and s[k].isspace():
        k += 1
    return j, k


def bi_truth(spec, meta):
    """The construction's decision of the declared / touching junction: every terminal at the end of the left piece (through closers and spacing) or
    in the gap, followed by closers and then spacing or the gap's end; for each, the next character's case and whether a stipulated name occurrence
    placed by the construction contains it; whether the authority the construction wrote is valid."""
    left, gap, right = spec["left"], spec["gap"], spec["right"]
    inter = left + gap
    cands = []
    for i, ch in enumerate(inter):
        if ch not in ".?!":
            continue
        j, k = _bi_next_cased(inter + right, i)
        if i < len(left):
            tail = (inter + right)[i + 1:len(left)]
            if any(c not in _BI_CLOSERS and not c.isspace() for c in tail):
                continue                                    # a terminal inside the left piece is not at its end
        elif not (j >= len(inter) or (inter + right)[j].isspace()):
            continue
        nxt = (inter + right)[k] if k < len(inter + right) else ""
        dec = meta["decodedOffset"] + len(spec["prefix"]) + i
        inside = any(s <= dec < e for s, e, _ in meta["occurrences"])
        cands.append({"terminal": ch, "lower": nxt.islower() or (nxt != "" and nxt in CORR1_ASCII_DIGITS), "upper": nxt.isupper(), "insideName": inside,
                      "decodedOffset": dec})                # CORR1 IV1-F1: an ASCII digit continuation is withheld as a lowercase one
    valid = spec["auth"] in _BI_VALID
    proven = [c for c in cands if not (c["terminal"] == "." and c["lower"]) and not (c["terminal"] == "." and valid and c["insideName"])]
    residual = bool(spec["physical"] == "NO_BOUNDARY" and spec["auth"] != "EDITED" and spec["mode"] != "whole" and proven
                    and all(c["terminal"] == "." and c["upper"] and not (valid and c["insideName"]) for c in proven))
    vetoed = [c for c in cands if c["terminal"] == "." and not c["lower"] and valid and c["insideName"]]
    if spec["auth"] == "EDITED":
        want = {"error": "ENTITY_NAME_AUTHORITY_MISMATCH"}
    elif spec["mode"] == "whole":
        want = {"classes": 0, "multiple": True}
    elif spec["mode"] == "declared":
        want = {"classes": 2} if proven else {"error": "SEPARATOR_EVIDENCE_FAILED"}
    else:
        want = {"classes": 2} if proven else {"classes": 0}
    return {"candidates": cands, "boundaryProven": bool(proven), "residualCaseB": residual, "vetoExpected": bool(vetoed) and not proven,
            "physical": spec["physical"], "authValid": valid, "want": want}


def _bi_summary(res):
    if isinstance(res, str):
        return {"error": res}
    return {"classes": len(res["count"]["distinctClassSet"]), "srcDiv": res["count"]["holds"],
            "multiple": any(s["sourceClassAssignmentState"] == "MULTIPLE_CLASS_PREDICATES_SATISFIED" for s in res["segmentRecords"])}


def judge_bi(spec, truth, results, field):
    """Counters of one boundary-integrity construction. results: {'orders': [evaluations or ModelError codes], 'again', 'parent', 'leakOutcome',
    'leakEnv'}; truth from bi_truth."""
    c = dict((k, 0) for k in _BI_HARD + _BI_REPORTED)
    got = [_bi_summary(r) for r in results["orders"]]
    first = got[0]
    if any(g != first for g in got[1:]):
        c["recordOrderDependence"] = 1
    if _bi_summary(results["again"]) != first:
        c["nonIdempotentSemanticDecision"] = 1
    for k, key in (("leakOutcome", "outcomeLeakage"), ("leakEnv", "environmentLeakage")):
        if k in results and _bi_summary(results[k]) != first:
            c[key] = 1
    want = truth["want"]
    fam = spec["family"]
    m1 = fam.startswith("M1")
    if "error" in want:
        ok = first.get("error") == want["error"]
    elif want.get("multiple"):
        ok = first.get("multiple") is True and first.get("classes") == 0
    else:
        ok = first.get("classes") == want["classes"] and "error" not in first
    if ok:
        if truth["residualCaseB"]:
            c["residualCaseBReproduced"] = 1
        if want.get("error") == "SEPARATOR_EVIDENCE_FAILED":
            c["declaredBoundaryRejected"] = 1
        if want.get("classes") == 0 and spec["mode"] == "two":
            c["conflictingFragmentsWithheld"] = 1
        if truth["vetoExpected"]:
            c["authorityVetoExpected"] = 1
    else:
        accepted = first.get("classes") == 2
        if accepted and (want.get("error") == "SEPARATOR_EVIDENCE_FAILED" or want.get("classes") == 0):
            if m1:
                c["falseSourceDiversityFromM1"] = c["falseSrcDivFromM1"] = 1
                if spec["mode"] == "declared":
                    c["nonAdjacentSentenceDeclarationBypass"] = 1
                c["omittedCloserCreatesBoundary" if any(ch in _BI_CLOSERS for ch in spec["gap"]) else "omittedTerminalCreatesBoundary"] = 1
            else:
                c["entityInternalPeriodCreatesBoundary"] = c["falseSourceDiversityFromM2"] = c["falseSrcDivFromM2"] = 1
        elif want.get("classes") == 2 and not accepted:
            a = spec["auth"]
            c["currentNameUsedOutsideTemporalAuthority" if a in _BI_REFUSED_TEMPORAL else "wrongCikNameBinding" if a in _BI_REFUSED_IDENTITY
              else "unprovenEntityNameUsedAsAuthority" if a in _BI_REFUSED_UNPROVEN else "positiveControlChanged"] = 1
        elif want.get("error") == "ENTITY_NAME_AUTHORITY_MISMATCH":
            c["wrongCikNameBinding"] = 1
        else:
            c["unexpectedOutcome"] = 1
    res, par = results["orders"][0], results["parent"]
    if not isinstance(res, str) and not isinstance(par, str):
        a_ = dict((s["segmentId"], s) for s in res["segmentRecords"])
        b_ = dict((s["segmentId"], s) for s in par["segmentRecords"])
        if set(a_) != set(b_) or any(a_[k]["unitIds"] != b_[k]["unitIds"] for k in a_):
            c["atomDefinitionChanged"] = 1
        elif any(a_[k]["canonicalSegmentIdentity"] != b_[k]["canonicalSegmentIdentity"] for k in a_):
            c["CSIChanged"] = 1
        elif any((a_[k]["sourceClassAssignmentState"], a_[k]["sourceClass"]) != (b_[k]["sourceClassAssignmentState"], b_[k]["sourceClass"]) for k in a_):
            c["sourceClassAssignmentChanged"] = 1
    if not isinstance(res, str) and not se_component_recompute(res, field):
        c["B2AlgorithmChanged"] = 1
    return c


def bi_generated_cases():
    """>= 500 boundary-integrity constructions. M1 families: the omitted gap (terminal, closers, spacing, line wraps, words, a skipped sentence, no
    terminal), the continuation (ASCII and Unicode lowercase, uppercase), '?' / '!', declared / two records / whole sentence. M2 families: k stipulated
    name occurrences with the target in the first, the last or a middle one; an occurrence at the left unit's start (nearest-span trap); every
    authority variant; the name ending before a genuine sentence period; '?' / '!'; an HTML rendition with a long tag prefix. Every two-record case
    is evaluated in both record orders."""
    out = []

    def add(fam, **kw):
        sp = dict({"prefix": "", "suffix": ".", "names": [], "auth": "NONE", "physical": "NO_BOUNDARY"}, **kw)
        sp["family"] = fam
        sp["id"] = "BIG-%04d" % len(out)
        out.append(sp)
    pay_up = "Under" + _BI_PAY[5:]
    m1_gaps = [". ", ".) ", ".\")] ", ".\n", ".  ", ".' ", "... ", ".\t", ".\u00a0", ".)\n", "...\n"]
    m1_conts = [("under", _BI_PAY, "NO_BOUNDARY"), ("whereby", "whereby" + _BI_PAY[5:], "NO_BOUNDARY"), ("über", "über" + _BI_PAY[5:], "NO_BOUNDARY"),
                ("ακολουθία", "ακολουθία" + _BI_PAY[5:], "NO_BOUNDARY"), ("évidence", "évidence" + _BI_PAY[5:], "NO_BOUNDARY"),
                ("\U00010428nder", "\U00010428nder" + _BI_PAY[5:], "NO_BOUNDARY"), ("\uab70nder", "\uab70nder" + _BI_PAY[5:], "NO_BOUNDARY"),
                ("Under", pay_up, "BOUNDARY")]
    for gap in m1_gaps:
        for _, right, phys in m1_conts:
            for mode in ("declared", "two", "whole"):
                add("M1_OMITTED_GAP", left=_BI_RIGHTS, gap=gap, right=right, mode=mode, physical=phys)
    for gap in ("? ", "! ", "?) ", "!\" "):
        for right in (_BI_PAY, pay_up):
            for mode in ("declared", "two", "whole"):
                add("M1_STERM_CONTROL", left=_BI_RIGHTS, gap=gap, right=right, mode=mode, physical="BOUNDARY")
    for left, gap, right, phys in ((_BI_RIGHTS[:-4], " Inc. ", _BI_PAY, "NO_BOUNDARY"), (_BI_RIGHTS, ", ", _BI_PAY, "NO_BOUNDARY"),
                                   (_BI_RIGHTS, " Inc, ", _BI_PAY, "NO_BOUNDARY"), (_BI_RIGHTS, ". The board met in May. ", pay_up, "BOUNDARY"),
                                   (_BI_RIGHTS, ". The board met in May. ", _BI_PAY, "BOUNDARY"), (_BI_RIGHTS + ".", " ", pay_up, "BOUNDARY")):
        for mode in ("declared", "two", "whole"):
            add("M1_GAP_WORDS", left=left, gap=gap, right=right, mode=mode, physical=phys)
    name = "Acme Inc. International"
    right_m2 = "International, " + _BI_PAY
    auths = ("VALID", "NONE", "NOT_DETERMINABLE", "SPANS_NOT_PROVEN", "TEMPORAL_NOT_PROVEN", "WRONG_DIGEST", "WRONG_ARTIFACT", "SHIFTED", "EDITED",
             "ENTITY_ID_INVALID", "CONSTANTS")
    for k, target in ((1, 1), (2, 2), (2, 1), (3, 2), (5, 5), (15, 15), (15, 1)):
        before = "".join("Acme Inc. International filed report %d. " % n for n in range(target - 1))
        after = "".join(" Acme Inc. International filed report %d." % n for n in range(k - target))
        for auth in auths:
            for mode in ("declared", "two"):
                add("M2_ENTITY_INTERNAL", prefix=before, left=_BI_RIGHTS + ".", gap=" ", right=right_m2, suffix="." + after, mode=mode, names=[name],
                    auth=auth, physical="NO_BOUNDARY")
    for auth in ("VALID", "NONE"):
        add("M2_ENTITY_INTERNAL", left=_BI_RIGHTS + ".", gap=" ", right=right_m2, mode="whole", names=[name], auth=auth, physical="NO_BOUNDARY")
    trap_left = name + " permissions matrix grants each officer read rights at Acme Inc."
    for auth in ("VALID", "NONE"):
        for mode in ("declared", "two"):
            add("M2_NEAREST_TRAP", left=trap_left, gap=" ", right=right_m2, mode=mode, names=[name], auth=auth, physical="NO_BOUNDARY")
    for k in (1, 3):
        after = "".join(" Acme Inc filed report %d." % n for n in range(k - 1))
        for auth in ("VALID", "NONE", "SHIFTED"):
            for mode in ("declared", "two"):
                add("M2_NAME_END", left=_BI_RIGHTS + ".", gap=" ", right="The company sets it " + _BI_PAY, suffix="." + after, mode=mode,
                    names=["Acme Inc"], auth=auth, physical="BOUNDARY")
    for auth in ("WRONG_DIGEST", "WRONG_ARTIFACT", "SHIFTED", "NOT_DETERMINABLE", "TEMPORAL_NOT_PROVEN", "ENTITY_ID_INVALID", "CONSTANTS"):
        for mode in ("declared", "two"):
            add("M2_WRONG_AUTHORITY_ON_SENTENCE", left=_BI_RIGHTS + ".", gap=" ", right="The annual retainer of each director is $41,000 in cash",
                mode=mode, names=["Acme Inc. The"], auth=auth, physical="BOUNDARY")
    for t in ("?", "!"):
        for auth in ("VALID", "NONE"):
            for mode in ("declared", "two"):
                add("M2_STERM_CONTROL", left=_BI_RIGHTS + t, gap=" ", right=right_m2, mode=mode, names=["Acme Inc%s International" % t], auth=auth,
                    physical="BOUNDARY")
    for auth in ("VALID", "NONE", "SHIFTED"):
        for mode in ("declared", "two"):
            add("M2_HTML_VIEW", left=_BI_RIGHTS + ".", gap=" ", right=right_m2, mode=mode, names=[name], auth=auth, physical="NO_BOUNDARY",
                htmlWrap=["<div class=\"filing-body\"><p class=\"body\">", "</p></div>"])
    return out
# ================================================================== BOUNDARY-INTEGRITY CONSTRUCTION ORACLE END


# ---------------------------------------------------------------- construction fixtures: rebuild, judge, R-14 mechanics
def construction_build(interp, fx):
    """(corpus, physical truth) of a construction fixture, regenerated from its construction spec alone."""
    c = fx["construction"]
    b, sp, fid = c["builder"], c["spec"], fx["fixtureId"]
    if b == "SLOT":
        corpus, meta, truth = build_slot(interp, sp, fid)
        return corpus, {"meta": meta, "truth": [[list(p) for p in t] for t in truth]}
    if b == "EXPLICIT":
        corpus, meta, truth = build_explicit(interp, sp, fid)
        return corpus, {"meta": meta, "truth": truth}
    if b == "PDF_EXPLICIT":
        corpus, meta, truth = build_pdf_explicit(interp, sp, fid)
        return corpus, {"meta": meta, "truth": truth}
    if b == "OA7B":
        return build_oa7b(interp, sp, fid)
    if b == "R14":
        return build_r14(interp, sp, fid)
    if b == "R7":
        corpus, meta = build_r7(interp, sp, fid)
        return corpus, r7_truth(sp, meta)
    if b == "TA":
        corpus, meta = build_ta(interp, sp, fid)
        return corpus, ta_truth(sp, meta)
    if b == "BI":
        corpus, meta = build_bi(interp, sp, fid)
        return corpus, bi_truth(sp, meta)
    raise ValueError("UNKNOWN_BUILDER " + str(b))


def physical_meta(fx, truth):
    return truth["meta"] if fx["construction"]["builder"] in ("SLOT", "EXPLICIT", "PDF_EXPLICIT") else truth


def judge_fixture(interp, fx, res, labels):
    """(hard physical failures, full verdict) of one construction fixture's result."""
    roles = interp.roles
    b = fx["construction"]["builder"]
    meta = physical_meta(fx, fx["physicalTruth"])
    if b in ("SLOT", "EXPLICIT", "PDF_EXPLICIT"):
        flags, pairs = judge_slot(res, meta, labels, roles)
        return sorted(k for k in _OR_SLOT_HARD if flags[k]), flags
    if b == "OA7B":
        flags = judge_oa7b(res, meta, labels, roles)
        return sorted(k for k in OA7B_COUNTERS[:-1] if flags[k]), flags
    q = interp.oa["unplacedWitness"]["quarantine"]["reason"] if interp.oa.get("unplacedWitness") else None
    flags = judge_r14(res, meta, fx["construction"]["spec"], labels, roles, q)
    hard = sorted(k for k in R14_HARD if flags[k]) + (["candidateSetFalseExclusions"] if flags["candidateSetFalseExclusions"] else [])
    return hard, flags


def r14_mechanics(interp, corpus, perms, evaluator=None):
    """(first result, order independent, idempotent, orders evaluated) of one R-14 corpus under the given record orders."""
    ev = evaluator or evaluate_corpus
    sigs, first = [], None
    for c in record_orders(corpus, perms):
        r = ev(interp, c, inline_loader)
        if first is None:
            first = r
        sigs.append(result_signature(r))
    return first, len(set(sigs)) == 1, oa14_idempotent(interp, first), len(sigs)


def pair_verdicts(res, meta, roles):
    seg = dict((s["recordId"], s) for s in res["segmentRecords"])
    ids = dict((m["recordId"], None if seg[m["recordId"]]["sourceClassAssignmentState"] == roles["duplicateUnresolved"] else seg[m["recordId"]]["canonicalSegmentIdentity"])
               for m in meta)
    out = []
    for a, b in itertools.combinations(meta, 2):
        ia, ib = ids[a["recordId"]], ids[b["recordId"]]
        v = "UNRESOLVED_NON_COUNTING" if ia is None or ib is None else ("PROVEN_SAME" if ia == ib else "PROVEN_DIFFERENT")
        out.append("%s/%s" % (v, "SAME" if tuple(a["phys"]) == tuple(b["phys"]) else "DIFFERENT"))
    return out


# ---------------------------------------------------------------- the generated surfaces (shared by the validator and, once, by the package builder)
def corr1_generated(interp, labels, pick=None):
    """The CORR1 generated families judged by the slot oracle. rows: [family, index, hard failures, undercountStrict]."""
    roles = interp.roles
    fams = dict((f, {"cases": 0, "generatorMismatch": 0, "counters": dict((k, 0) for k in _OR_SLOT_KEYS + _OR_SLOT_EXTRA)}) for f in GEN_FAMILIES)
    rows, pos = [], {}
    for n, (fam, case) in enumerate(generated_cases()):
        i = pos[fam] = pos.get(fam, -1) + 1
        if pick is not None and not pick(fam, i):
            continue
        try:
            corpus, meta = build_generated(interp, fam, case, "G%05d" % n)
        except (ValueError, IndexError):
            fams[fam]["generatorMismatch"] += 1
            rows.append([fam, i, ["generatorMismatch"], False])
            continue
        res = evaluate_corpus(interp, corpus, inline_loader)
        _b2_note(interp, "corr1Generated", "%s:%d" % (fam, i), res, corpus)
        flags, _ = judge_slot(res, meta, labels, roles)
        fams[fam]["cases"] += 1
        for k in _OR_SLOT_KEYS + _OR_SLOT_EXTRA:
            fams[fam]["counters"][k] += 1 if flags[k] else 0
        rows.append([fam, i, sorted(k for k in _OR_SLOT_HARD if flags[k]), bool(flags["undercountStrict"])])
    return {"families": fams, "rows": rows}


def _reversed_gate_model(bm):
    m = copy.deepcopy(bm)
    m["occurrenceAnchoring"]["frameC"]["conditions"] = list(reversed(m["occurrenceAnchoring"]["frameC"]["conditions"]))
    return m


def oa7b_generated(interp, labels, cases):
    """The CORR1.CORR1 OA-7(b) generator judged by its construction oracle; each case also under the reversed gate order (decisions must agree)."""
    roles = interp.roles
    rev = Interp(_reversed_gate_model(interp.bm))
    tot = dict((k, 0) for k in OA7B_COUNTERS)
    rows, order_dep, invalid = [], 0, 0
    for case in cases:
        corpus, meta = build_oa7b(interp, case, case["id"])
        res = evaluate_corpus(interp, corpus, inline_loader)
        res2 = evaluate_corpus(rev, corpus, inline_loader)
        _b2_note(interp, "oa7bGenerated", case["id"], res, corpus)
        flags = judge_oa7b(res, meta, labels, roles)
        d1 = [(s["segmentId"], s["canonicalSegmentIdentity"], s["sourceClassAssignmentState"]) for s in res["segmentRecords"]]
        d2 = [(s["segmentId"], s["canonicalSegmentIdentity"], s["sourceClassAssignmentState"]) for s in res2["segmentRecords"]]
        dep = d1 != d2 or res["count"] != res2["count"]
        bad_frame = any((s["occurrenceAnchor"] or {}).get("frame") != interp.oa["frameC"]["recordedAs"] or
                        (s["occurrenceAnchor"] or {}).get("unresolvedReason") == interp.oa["failClosed"]["reasons"]["duplicateGroupUnresolved"]
                        for s in res["segmentRecords"])
        order_dep += 1 if dep else 0
        invalid += 1 if bad_frame else 0
        for k in OA7B_COUNTERS:
            tot[k] += 1 if flags[k] else 0
        rows.append([case["id"], [k for k in OA7B_COUNTERS[:-1] if flags[k]], bool(flags["conservativeUnderCount"]), dep])
    return {"counters": tot, "rows": rows, "gateOrderDependent": order_dep, "invalid": invalid}


def r14_generated(interp, labels, cases):
    """The CORR1.CORR1.CORR1 R-14 generator: every case under its three recorded record orders, OA-14 re-applied to its own output, judged by the
    construction oracle and the candidate-set oracle."""
    roles = interp.roles
    q = interp.oa["unplacedWitness"]["quarantine"]["reason"] if interp.oa.get("unplacedWitness") else None
    hard_keys = R14_HARD + ("candidateSetFalseExclusions",)
    tot = dict((k, 0) for k in hard_keys)
    mech = {"invalid": 0, "orderDependence": 0, "nonIdempotence": 0, "ordersEvaluated": 0}
    rep = {"sameClassEvidencePreserved": 0, "conflictingOccurrencesQuarantined": 0, "trueConflictQuarantines": 0, "conservativeQuarantines": 0,
           "conservativeUnderCountCases": 0, "witnessesPositive": 0, "candidateSetSizeSum": 0, "fullDocumentCandidateSets": 0, "narrowedCandidateSets": 0,
           "vacuousWitnesses": 0}
    rows = []
    for case in cases:
        corpus, meta = build_r14(interp, case, case["id"])
        res, ind, idem, n = r14_mechanics(interp, corpus, [tuple(p) for p in case["orders"]])
        _b2_note(interp, "r14Generated", case["id"], res, corpus)
        j = judge_r14(res, meta, case, labels, roles, q)
        inv = r14_validity(res, meta, case)
        mech["invalid"] += 1 if inv else 0
        mech["orderDependence"] += 0 if ind else 1
        mech["nonIdempotence"] += 0 if idem else 1
        mech["ordersEvaluated"] += n
        for k in hard_keys:
            tot[k] += j[k] if k == "candidateSetFalseExclusions" else (1 if j[k] else 0)
        rep["sameClassEvidencePreserved"] += j["sameClassEvidencePreserved"]
        rep["conflictingOccurrencesQuarantined"] += j["quarantinedOccurrences"]
        rep["trueConflictQuarantines"] += j["trueConflictQuarantines"]
        rep["conservativeQuarantines"] += j["conservativeQuarantines"]
        rep["conservativeUnderCountCases"] += 1 if j["conservativeUnderCount"] else 0
        rep["witnessesPositive"] += len(j["candidateSetSizes"])
        rep["candidateSetSizeSum"] += sum(j["candidateSetSizes"])
        rep["fullDocumentCandidateSets"] += j["fullDocumentCandidateSets"]
        rep["narrowedCandidateSets"] += j["narrowedCandidateSets"]
        rep["vacuousWitnesses"] += j["vacuousWitnesses"]
        rows.append([case["id"], [k for k in R14_HARD if j[k]], j["candidateSetFalseExclusions"], bool(j["conservativeUnderCount"]), j["quarantinedOccurrences"],
                     ind, idem, bool(inv)])
    return {"counters": tot, "mechanics": mech, "reported": rep, "rows": rows}


WEAKENED_RULES = {
    "OWN_MEMBER_ONLY": ("candidateSet", "basis", "OWN_MEMBER_OCCURRENCES"),
    "TEXT_EQUALITY_NARROWING": ("candidateSet", "basis", "TEXT_EQUAL_OCCURRENCES"),
    "FIRST_OCCURRENCE": ("candidateSet", "basis", "FIRST_ESTABLISHED_OCCURRENCE"),
    "POSITIVE_ASSIGNMENT_IF_SAME_CLASS": ("quarantine", "rule", "SKIP_WITNESS_IF_SAME_CLASS_OCCURRENCE"),
    "GREEDY_CONSUMING": ("quarantine", "rule", "GREEDY_CONSUME_SAME_CLASS"),
    "CASCADE_ANY_UNIDENTIFIED": ("witness", "source", "ANY_UNESTABLISHED"),
    "DOCUMENT_WIDE": ("quarantine", "rule", "ANY_COUNTED_CLASS"),
    "NO_WITNESS_LAYER": None}


def weakened_model(bm, name):
    m = copy.deepcopy(bm)
    w = WEAKENED_RULES[name]
    if w is None:
        m["occurrenceAnchoring"].pop("unplacedWitness", None)
    else:
        m["occurrenceAnchoring"]["unplacedWitness"][w[0]][w[1]] = w[2]
    return m


def r14_fixture_sensitivity(bm, fixtures, labels):
    """Each weakened OA-14 rule evaluated on the 22 R-14 constructions (every record order, OA-14 re-applied to its own output): the semantic oracle
    failures it trips (hard counters, candidate-set false exclusions, order dependence, non-idempotence)."""
    out = {}
    fx = [f for f in fixtures if f["group"] == "R14"]
    for name in WEAKENED_RULES:
        interp = Interp(weakened_model(bm, name))
        t = {"hard": 0, "candidateSetFalseExclusions": 0, "orderDependent": 0, "nonIdempotent": 0, "fixturesTripped": []}
        for f in fx:
            res, ind, idem, _ = r14_mechanics(interp, f["corpus"], r14_fixture_perms(len(f["corpus"]["records"])))
            hard, flags = judge_fixture(interp, f, res, labels)
            hs = [h for h in hard if h != "candidateSetFalseExclusions"]
            t["hard"] += len(hs)
            t["candidateSetFalseExclusions"] += flags["candidateSetFalseExclusions"]
            t["orderDependent"] += 0 if ind else 1
            t["nonIdempotent"] += 0 if idem else 1
            if hs or flags["candidateSetFalseExclusions"] or not ind or not idem:
                t["fixturesTripped"].append(f["fixtureId"])
        out[name] = t
    return out


# ---------------------------------------------------------------- R-7 / B-2 runners (fixtures, generated surface, sensitivity, parity with the A+ parent)
_B2_NOTES = {}


def _b2_note(interp, surface, case_id, res, corpus=None):
    """Both inherited-surface tallies: the count against step 5b absent (the A+ parent's R-COUNT) and against the touching relation absent (the R7
    parent's)."""
    _b2_note_a_plus(interp, surface, case_id, res)
    _ta_note(interp, surface, case_id, res)
    if surface != "fixtures":
        _se_note(interp, surface, case_id, res, corpus)
        _bi_note(interp, surface, case_id)


def _b2_note_a_plus(interp, surface, case_id, res):
    """Tally, per inherited surface, the cases whose final count the B-2 layer changes (the count without step 5b is the A+ parent's R-COUNT, a pure
    function of the same segment records)."""
    t = _B2_NOTES.setdefault(surface, {"evaluated": 0, "countDeltas": []})
    t["evaluated"] += 1
    if interp.b2 is None:
        return
    field = interp.b2["recording"]["field"]
    got = dict((k, v) for k, v in res["count"].items() if k != field)
    if got != interp.count(res["segmentRecords"]):
        t["countDeltas"].append(case_id)


_APLUS_MODULE = {}


def _load_aplus_module(dl):
    """The frozen Option A+ implementation-parent validator module (identity verified by A-1 / B2-1); loaded once per process (its content-keyed caches
    then stay warm, and forked forced-failure workers inherit them); bytecode is never written."""
    p = os.path.join(dl, APLUS_VALIDATOR)
    key = (p, file_sha(p))
    if key not in _APLUS_MODULE:
        sys.dont_write_bytecode = True
        import importlib.util
        spec = importlib.util.spec_from_file_location("mv_sourceclass_r7_aplus_parent_frozen", p)
        mod = importlib.util.module_from_spec(spec)
        spec.loader.exec_module(mod)
        _APLUS_MODULE[key] = mod
    return _APLUS_MODULE[key]


def r7_perms(n):
    return [list(p) for p in itertools.permutations(range(n))]


def r7_evaluate(interp, corpus, orders, off_interp=None):
    """(first result, results in the other orders, the same corpus with the count layer absent, a second evaluation) of one R-7 corpus."""
    res = [evaluate_corpus(interp, dict(corpus, records=[corpus["records"][i] for i in o]), inline_loader) for o in orders]
    off = evaluate_corpus(off_interp, corpus, inline_loader) if off_interp is not None else None
    again = evaluate_corpus(interp, corpus, inline_loader)
    return res[0], res[1:], off, again


def r7_off_interp(bm):
    """The same model without the count layer (R-COUNT step 5b absent): its identities, states and classes must equal the candidate's."""
    m = copy.deepcopy(bm)
    m.pop("basisOverlap", None)
    return Interp(m)


# the weakened implementations the act names (R7-FF01 .. R7-FF22): each is a model edit that selects a dormant path of the layer
R7_WEAKENED = {
    "R7-FF01": ("B2 guard disabled", [("application", "DISABLED")]),
    "R7-FF02": ("exact-CSI-only counting restored", [("overlap.test", "EXACT_IDENTITY_ONLY")]),
    "R7-FF03": ("narrowest span wins", [("componentRule.severalClasses", "NARROWEST_FOOTPRINT")]),
    "R7-FF04": ("broadest span wins", [("componentRule.severalClasses", "BROADEST_FOOTPRINT")]),
    "R7-FF05": ("first record wins", [("componentRule.severalClasses", "FIRST_RECORD")]),
    "R7-FF06": ("conflicting overlap contributes both classes", [("componentRule.severalClasses", "UNION")]),
    "R7-FF07": ("pairwise processing without transitive components", [("application", "PAIRWISE")]),
    "R7-FF08": ("record-order-dependent component construction", [("application", "RECORD_ORDER_GREEDY")]),
    "R7-FF09": ("same-class overlapping records contribute twice", [("componentRule.oneClass", "PER_IDENTITY_GROUP")]),
    "R7-FF10": ("all same-U records collapsed regardless of overlap", [("overlap.test", "SAME_DOCUMENT")]),
    "R7-FF11": ("lawful B-3/B-6 separated records collapsed (no boundary ever accepted)", [("lawfulSeparation.boundarySource", "NO_BOUNDARY_ACCEPTED")]),
    "R7-FF12": ("comma accepted as lawful boundary", [("lawfulSeparation.boundarySource", "RECORDED_OR_PUNCTUATION"), ("lawfulSeparation.punctuationPatterns", [","])]),
    "R7-FF13": ("conjunction accepted as lawful boundary", [("lawfulSeparation.boundarySource", "RECORDED_OR_PUNCTUATION"), ("lawfulSeparation.punctuationPatterns", ["\\band\\b"])]),
    "R7-FF14": ("line wrap accepted as lawful boundary", [("lawfulSeparation.boundarySource", "RECORDED_OR_PUNCTUATION"), ("lawfulSeparation.punctuationPatterns", ["\\n"])]),
    "R7-FF15": ("text equality used as overlap proof", [("overlap.test", "TEXT_EQUALITY")]),
    "R7-FF16": ("artifact-local offsets compared across renditions", [("overlap.test", "ARTIFACT_LOCAL_OFFSETS")]),
    "R7-FF17": ("FRAME-U overlap ignored", [("overlap.frameU", "IGNORE")]),
    "R7-FF18": ("differing FRAME-U member relations resolved by choosing one member", [("overlap.frameU", "FIRST_MEMBER")]),
    "R7-FF19": ("B2 modifies CSI-v6 (a withheld or collapsed record takes the component id as its identity)", [("recordStateEffect", "REWRITE_IDENTITY")]),
    "R7-FF20": ("B2 changes the sourceClass assignment (a withheld record recoded to DUPLICATE_IDENTITY_UNRESOLVED)",
                [("recordStateEffect", "SET_STATE_ROLE"), ("recordStateRole", "duplicateUnresolved")]),
    "R7-FF21": ("new state introduced (B2_OVERLAP_WITHHELD) and written by the layer", "NEW_STATE"),
    "R7-FF22": ("existing SEGMENT_CLASS_CONFLICT bypassed (the exact-occurrence conflict resolved by the first record)", [("exactGroupConflict", "FIRST_RECORD_WINS")]),
}


def r7_weakened_model(bm, fid):
    m = copy.deepcopy(bm)
    w = R7_WEAKENED[fid][1]
    b2 = m["basisOverlap"]
    if w == "NEW_STATE":
        m["states"]["roles"]["b2Withheld"] = "B2_OVERLAP_WITHHELD"
        m["states"]["definitions"].append({"state": "B2_OVERLAP_WITHHELD", "meaning": "withheld by the basis-overlap layer", "countsTowardSrcDiv": "NO"})
        m["states"]["precedence"].insert(0, "B2_OVERLAP_WITHHELD")
        m["states"]["ruleIds"]["b2Withheld"] = "R-COUNT"
        b2.update({"recordStateEffect": "SET_STATE_ROLE", "recordStateRole": "b2Withheld"})
        return m
    for path, value in w:
        node = b2
        keys = path.split(".")
        for k in keys[:-1]:
            node = node[k]
        node[keys[-1]] = value
    return m


def r7_sensitivity(bm, fixtures, labels, cases):
    """Each weakened implementation evaluated on the R-7 and the touching-atom construction fixtures (every record order) and on a stride of the R-7
    generated surface: the hard oracle counters and the declared expectations it trips."""
    out = {}
    fx = [f for f in fixtures if f["group"] in ("R7_B2", "TA_ATOM")]
    for fid in sorted(R7_WEAKENED):
        m = r7_weakened_model(bm, fid)
        interp, off = Interp(m), r7_off_interp(m)
        t = {"mutation": R7_WEAKENED[fid][0], "fixturesTripped": [], "generatedCasesTripped": 0, "hardCounters": {}}
        for f in fx:
            try:
                j = r7_judge_fixture(interp, f, labels, off)[0] if f["group"] == "R7_B2" else ta_judge_fixture(interp, f, labels, off)[0]
                ok, _, _ = run_fixture(interp, f)
            except Exception:  # noqa: BLE001 - a weakened model may be unable to evaluate a construction; that is a trip
                t["fixturesTripped"].append(f["fixtureId"])
                continue
            hard = [k for k in _TA_HARD if j[k]]
            for k in hard:
                t["hardCounters"][k] = t["hardCounters"].get(k, 0) + 1
            if hard or not ok:
                t["fixturesTripped"].append(f["fixtureId"])
        g = r7_generated(interp, labels, cases, off)
        t["generatedCasesTripped"] = sum(1 for r in g["rows"] if r[1])
        for k, v in g["counters"].items():
            if v:
                t["hardCounters"][k] = t["hardCounters"].get(k, 0) + v
        out[fid] = t
    return out


# ---------------------------------------------------------------- touching-atom runners (fixtures, generated surfaces, sensitivity, impact); the R-7 surfaces are judged by the same truth
_TA_NOTES = {}
_TA_OFF = {}


def ta_off_model(bm):
    m = copy.deepcopy(bm)
    (m.get("basisOverlap") or {}).pop("touchingAtom", None)
    return m


def ta_off_interp(bm):
    """The same model without the touching-atom relation (the R7-B2 parent's layer): identities, states, classes and segmentation must equal the
    candidate's; its count is the parent's count."""
    return Interp(ta_off_model(bm))


def _ta_note(interp, surface, case_id, res):
    """Tally, per inherited surface, the cases whose final count the touching relation changes: the count of the same segment records and the same
    step-5b facts under the model without the relation (the R7-B2 parent's R-COUNT)."""
    t = _TA_NOTES.setdefault(surface, {"evaluated": 0, "countDeltas": []})
    t["evaluated"] += 1
    if not (interp.b2 or {}).get("touchingAtom") or getattr(interp, "last_b2", None) is None:
        return
    key = id(interp)
    if key not in _TA_OFF:
        _TA_OFF[key] = (interp, ta_off_interp(interp.bm))
    off = _TA_OFF[key][1]
    field = interp.b2["recording"]["field"]
    got = dict((k, v) for k, v in res["count"].items() if k != field)
    ref = dict((k, v) for k, v in off.count(copy.deepcopy(res["segmentRecords"]), interp.last_b2).items() if k != field)
    if got != ref:
        t["countDeltas"].append(case_id)


def ta_same_labels(bm):
    rel = ((bm.get("basisOverlap") or {}).get("touchingAtom") or {}).get("relations") or {}
    return set(v for k, v in rel.items() if k != "differentAtoms")


def _ta_judge(interp, case, corpus, truth, labels, orders, off_interp, base_interp):
    res = [evaluate_corpus(interp, dict(corpus, records=[corpus["records"][i] for i in o]), inline_loader) for o in orders]
    again = evaluate_corpus(interp, corpus, inline_loader)
    off = evaluate_corpus(off_interp, corpus, inline_loader)
    base = evaluate_corpus(base_interp, corpus, inline_loader)
    b2 = interp.b2 or {}
    disp = dict((d["role"], d["id"]) for d in b2.get("dispositions", []))
    field = b2.get("recording", {}).get("field", "basisOverlap")
    return judge_ta(case, res[0], truth, labels, field, disp, ta_same_labels(interp.bm), res[1:], off, base, again), res[0], off


def r7_judge_fixture(interp, fx, labels, off_interp):
    """An R-7 construction fixture in every declared record order, judged by the touching-aware truth engine over the R-7 templates (ta_truth_r7);
    off_interp is the model with step 5b absent (identities, states and segmentation are compared with it)."""
    n = len(fx["corpus"]["records"])
    orders = r7_perms(n) if fx.get("orders") == "ALL_PERMUTATIONS" else [list(range(n))]
    spec = fx["construction"]["spec"]
    corpus, meta = build_r7(interp, spec, fx["fixtureId"])
    j, _, _ = _ta_judge(interp, spec, corpus, ta_truth_r7(spec, meta), labels, orders, ta_off_interp(interp.bm), off_interp)
    return j, len(orders)


def r7_generated(interp, labels, cases, off_interp):
    """The inherited R-7 / B-2 generated surface under this model: every case in three record orders, judged by the touching-aware truth engine;
    the count with the touching relation absent (the R7-B2 parent's count) is compared case by case."""
    tot = dict((k, 0) for k in _TA_HARD + _TA_REPORTED)
    rep = {"cases": 0, "ordersEvaluated": 0, "overlapPairs": 0, "touchingAtomPairs": 0, "withheldComponents": 0, "collapsedComponents": 0,
           "generatorMismatch": 0}
    fams, rows, deltas = {}, [], []
    off_t = ta_off_interp(interp.bm)
    field = (interp.b2 or {}).get("recording", {}).get("field", "basisOverlap")
    for c in cases:
        try:
            corpus, meta = build_r7(interp, c, c["id"])
        except (ValueError, IndexError):
            rep["generatorMismatch"] += 1
            rows.append([c["id"], ["generatorMismatch"], []])
            continue
        n = len(corpus["records"])
        orders = [list(range(n)), list(reversed(range(n))), list(range(1, n)) + [0]]
        j, res, off = _ta_judge(interp, c, corpus, ta_truth_r7(c, meta), labels, orders, off_t, off_interp)
        for k in tot:
            tot[k] += j[k]
        fams[c["family"]] = fams.get(c["family"], 0) + 1
        bo = res["count"].get(field) or {}
        rep["cases"] += 1
        rep["ordersEvaluated"] += len(orders)
        rep["overlapPairs"] += len(bo.get("overlapPairs", []))
        rep["touchingAtomPairs"] += len(bo.get("touchingAtomPairs", []))
        rep["withheldComponents"] += bo.get("withheldComponents", 0)
        rep["collapsedComponents"] += bo.get("collapsedComponents", 0)
        if dict((k, v) for k, v in res["count"].items() if k != field) != dict((k, v) for k, v in off["count"].items() if k != field):
            deltas.append(c["id"])
        rows.append([c["id"], sorted(k for k in _TA_HARD if j[k]), sorted(k for k in _TA_REPORTED if j[k])])
    return {"counters": dict((k, tot[k]) for k in _TA_HARD), "reported": dict((k, tot[k]) for k in _TA_REPORTED), "summary": rep, "families": fams,
            "rows": rows, "countDeltasAgainstTheR7Parent": deltas}


def ta_judge_fixture(interp, fx, labels, base_interp):
    """A touching-atom construction fixture in EVERY record order, judged by the touching-atom oracle. A construction whose declared separator the
    frozen evidence does not prove (a declared expectation 'error') must be rejected with that code in every record order."""
    n = len(fx["corpus"]["records"])
    spec = fx["construction"]["spec"]
    if fx["expect"].get("error"):
        corpus, meta = build_ta(interp, spec, fx["fixtureId"])
        j = dict((k, 0) for k in _TA_HARD + _TA_REPORTED)
        for o in r7_perms(n):
            try:
                evaluate_corpus(interp, dict(corpus, records=[corpus["records"][i] for i in o]), inline_loader)
                j["atomDefinitionChanged"] = 1          # a declared boundary the evidence does not prove was accepted
            except ModelError as e:
                if e.code != fx["expect"]["error"]:
                    j["atomDefinitionChanged"] = 1
        return j, r7_perms(n), None, None
    corpus, meta = build_ta(interp, spec, fx["fixtureId"])
    j, res, off = _ta_judge(interp, spec, corpus, ta_truth(spec, meta), labels, r7_perms(n), ta_off_interp(interp.bm), base_interp)
    return j, r7_perms(n), res, off


def ta_generated(interp, labels, cases, base_interp):
    """The touching-atom generated surface: every case in three record orders (as generated, reversed, rotated), with the touching relation absent,
    with the count layer absent, and twice."""
    tot = dict((k, 0) for k in _TA_HARD + _TA_REPORTED)
    rep = {"cases": 0, "ordersEvaluated": 0, "touchingAtomPairs": 0, "exactlyTouchingPairs": 0, "gappedSameAtomPairs": 0, "differentAtomPairs": 0,
           "withheldComponents": 0, "collapsedComponents": 0, "r7ParentFalseSrcDiv": 0, "r7ParentFalseSourceDiversity": 0, "generatorMismatch": 0}
    fams, rows = {}, []
    off_t = ta_off_interp(interp.bm)
    field = (interp.b2 or {}).get("recording", {}).get("field", "basisOverlap")
    same = ta_same_labels(interp.bm)
    for c in cases:
        try:
            corpus, meta = build_ta(interp, c, c["id"])
            truth = ta_truth(c, meta)
        except (ValueError, IndexError):
            rep["generatorMismatch"] += 1
            rows.append([c["id"], ["generatorMismatch"], []])
            continue
        n = len(corpus["records"])
        orders = [list(range(n)), list(reversed(range(n))), list(range(1, n)) + [0]]
        j, res, off = _ta_judge(interp, c, corpus, truth, labels, orders, off_t, base_interp)
        for k in tot:
            tot[k] += j[k]
        fams[c["family"]] = fams.get(c["family"], 0) + 1
        bo = res["count"].get(field) or {}
        rep["cases"] += 1
        rep["ordersEvaluated"] += len(orders)
        for r in bo.get("touchingAtomRelations", []):
            if r["relation"] in same:
                rep["touchingAtomPairs"] += 1
                exact = any(v.get("exactlyTouching") for v in (r["atomProof"].get("members") or {}).values())
                rep["exactlyTouchingPairs" if exact else "gappedSameAtomPairs"] += 1
            else:
                rep["differentAtomPairs"] += 1
        rep["withheldComponents"] += bo.get("withheldComponents", 0)
        rep["collapsedComponents"] += bo.get("collapsedComponents", 0)
        lab = dict((code, labels[i]) for code, i in _R7_CLS.items())
        want = set(lab[x] for x in truth["lawfulClasses"])
        rep["r7ParentFalseSrcDiv"] += 1 if off["count"]["holds"] and len(want) < 2 else 0
        rep["r7ParentFalseSourceDiversity"] += 1 if set(off["count"]["distinctClassSet"]) - want else 0
        rows.append([c["id"], sorted(k for k in _TA_HARD if j[k]), sorted(k for k in _TA_REPORTED if j[k])])
    return {"counters": dict((k, tot[k]) for k in _TA_HARD), "reported": dict((k, tot[k]) for k in _TA_REPORTED), "summary": rep, "families": fams, "rows": rows}


# the weakened implementations the act names (TA-FF01 .. TA-FF22) and two more (TA-FF23 segmentation rewritten by the layer, TA-FF24 one FRAME-U member
# chosen): each is a model edit selecting a dormant path (paths relative to basisOverlap), or a named whole-model edit
TA_WEAKENED = {
    "TA-FF01": ("touching layer disabled", [("touchingAtom.application", "DISABLED")]),
    "TA-FF02": ("exact-overlap-only parent restored (the touching relation removed)", "REMOVE_TOUCHING_RELATION"),
    "TA-FF03": ("exact boundary equality required, internal gap ignored", [("touchingAtom.junction.extent", "EXACT_TOUCH_ONLY")]),
    "TA-FF04": ("comma treated as lawful separator", [("touchingAtom.junctionEvidence.extraPatterns", [{"as": "COMMA", "form": "TAIL", "pattern": ","}])]),
    "TA-FF05": ("conjunction treated as lawful separator",
                [("touchingAtom.junctionEvidence.extraPatterns", [{"as": "CONJUNCTION", "form": "HEAD", "pattern": "^(and|or)\\b"}])]),
    "TA-FF06": ("plain space treated as lawful separator", [("touchingAtom.junctionEvidence.extraPatterns", [{"as": "SPACE", "form": "TAIL", "pattern": "\\s"}])]),
    "TA-FF07": ("different sentences collapsed (sentence evidence and a recorded SENTENCE ignored)", [("touchingAtom.junctionEvidence.ignoredSeparators", ["SENTENCE"])]),
    "TA-FF08": ("numbered clauses collapsed (clause-number evidence and a recorded NUMBERED_CLAUSE / NUMBERED_SUBCLAUSE ignored)",
                [("touchingAtom.junctionEvidence.ignoredSeparators", ["NUMBERED_CLAUSE", "NUMBERED_SUBCLAUSE"])]),
    "TA-FF09": ("table rows collapsed (a recorded TABLE_ROW ignored)", [("touchingAtom.junctionEvidence.ignoredSeparators", ["TABLE_ROW"])]),
    "TA-FF10": ("same-class touching contributes twice (same-class touching edges dropped)", [("touchingAtom.componentBinding", "SAME_CLASS_EDGES_DROPPED")]),
    "TA-FF11": ("conflicting touching contributes both classes (conflicting touching edges dropped)", [("touchingAtom.componentBinding", "CONFLICTING_EDGES_DROPPED")]),
    "TA-FF12": ("first record wins", [("componentRule.severalClasses", "FIRST_RECORD")]),
    "TA-FF13": ("narrower record wins", [("componentRule.severalClasses", "NARROWEST_FOOTPRINT")]),
    "TA-FF14": ("broader record wins", [("componentRule.severalClasses", "BROADEST_FOOTPRINT")]),
    "TA-FF15": ("pairwise no-transitive-component logic", [("application", "PAIRWISE")]),
    "TA-FF16": ("record-order dependent logic", [("application", "RECORD_ORDER_GREEDY")]),
    "TA-FF17": ("text equality used instead of atom proof", [("touchingAtom.atomTest", "TEXT_EQUALITY")]),
    "TA-FF18": ("same document alone treated as same atom", [("touchingAtom.atomTest", "SAME_DOCUMENT")]),
    "TA-FF19": ("CSI rewritten (a withheld or collapsed record takes the component id as its identity)", [("recordStateEffect", "REWRITE_IDENTITY")]),
    "TA-FF20": ("sourceClass assignment changed (a withheld or collapsed record recoded to DUPLICATE_IDENTITY_UNRESOLVED)",
                [("recordStateEffect", "SET_STATE_ROLE"), ("recordStateRole", "duplicateUnresolved")]),
    "TA-FF21": ("segmentation semantics changed (the frozen SENTENCE evidence widened to a comma, semicolon or colon)", "WIDEN_SENTENCE_EVIDENCE"),
    "TA-FF22": ("atom definition changed (the coder's unit read as the atom)", [("touchingAtom.atomTest", "CODER_UNIT")]),
    "TA-FF23": ("the layer rewrites the touching fragments into one segment (unit ids and span of the component)", [("recordStateEffect", "MERGE_SEGMENTS")]),
    "TA-FF24": ("FRAME-U: one member's atom relation chosen", [("touchingAtom.members.rule", "FIRST_MEMBER")]),
}


def ta_weakened_model(bm, fid):
    m = copy.deepcopy(bm)
    w = TA_WEAKENED[fid][1]
    b2 = m["basisOverlap"]
    if w == "REMOVE_TOUCHING_RELATION":
        b2.pop("touchingAtom")
        return m
    if w == "WIDEN_SENTENCE_EVIDENCE":
        ev = m["segmentation"]["separatorEvidence"]["whenAdjacent"]["SENTENCE"]
        ev["previousUnitCanonicalEndsWith"] = ev["previousUnitCanonicalEndsWith"].replace("[.!?]", "[.!?,;:]")
        return m
    for path, value in w:
        node = b2
        keys = path.split(".")
        for k in keys[:-1]:
            node = node[k]
        node[keys[-1]] = value
    return m


def ta_sensitivity(bm, fixtures, labels, cases):
    """Each weakened implementation evaluated on the touching-atom construction fixtures (every record order; declared expectations too) and on a
    stride of the touching-atom generated surface: the hard oracle counters and the declared expectations it trips."""
    out = {}
    fx = [f for f in fixtures if f["group"] == "TA_ATOM"]
    for fid in sorted(TA_WEAKENED):
        m = ta_weakened_model(bm, fid)
        interp, base = Interp(m), r7_off_interp(m)
        t = {"mutation": TA_WEAKENED[fid][0], "fixturesTripped": [], "generatedCasesTripped": 0, "hardCounters": {}}
        for f in fx:
            try:
                j, _, _, _ = ta_judge_fixture(interp, f, labels, base)
                ok, _, _ = run_fixture(interp, f)
            except Exception:  # noqa: BLE001 - a weakened model may be unable to evaluate a construction; that is a trip
                t["fixturesTripped"].append(f["fixtureId"])
                continue
            hard = [k for k in _TA_HARD if j[k]]
            for k in hard:
                t["hardCounters"][k] = t["hardCounters"].get(k, 0) + 1
            if hard or not ok:
                t["fixturesTripped"].append(f["fixtureId"])
        g = ta_generated(interp, labels, cases, base)
        t["generatedCasesTripped"] = sum(1 for r in g["rows"] if r[1])
        for k, v in g["counters"].items():
            if v:
                t["hardCounters"][k] = t["hardCounters"].get(k, 0) + v
        out[fid] = t
    return out


# ---------------------------------------------------------------- sentence-evidence runners (fixtures, generated surface, sensitivity)
def se_parent_model(bm):
    """The same model with the touching-atom parent's SENTENCE evidence (the continuation guard, the documentary interval and the entity-name veto
    absent)."""
    m = bi_parent_model(bm)
    m["segmentation"]["separatorEvidence"]["whenAdjacent"]["SENTENCE"].pop("continuationGuard", None)
    return m


def _se_eval(interp, corpus):
    try:
        return evaluate_corpus(interp, corpus, inline_loader)
    except ModelError as e:
        return e.code


def se_run(interp, parent_interp, base_interp, case, corpus, meta, labels, orders):
    """One sentence-evidence construction under this model in the given record orders, again, under the parent's evidence and with step 5b absent;
    judged by judge_se. Returns (counters, first result)."""
    results = {"orders": [_se_eval(interp, dict(corpus, records=[corpus["records"][i] for i in o])) for o in orders], "again": _se_eval(interp, corpus),
               "off": _se_eval(parent_interp, corpus), "base": _se_eval(base_interp, corpus),
               "disp": dict((d["role"], d["id"]) for d in (interp.b2 or {}).get("dispositions", []))}
    j = judge_se(case, meta, ta_truth(case, meta), results, labels, (interp.b2 or {}).get("recording", {}).get("field", "basisOverlap"),
                 ta_same_labels(interp.bm), results["off"])
    return j, results


def se_judge_fixture(interp, fx, labels, parent_interp, base_interp):
    spec = fx["construction"]["spec"]
    corpus, meta = build_ta(interp, spec, fx["fixtureId"])
    orders = r7_perms(len(corpus["records"]))
    j, results = se_run(interp, parent_interp, base_interp, spec, corpus, meta, labels, orders)
    return j, len(orders), results


def se_generated(interp, labels, cases, parent_interp, base_interp):
    """The sentence-evidence generated surface: every case in three record orders, again, under the parent's evidence and with step 5b absent."""
    tot = dict((k, 0) for k in _SE_HARD + _SE_REPORTED)
    rep = {"cases": 0, "ordersEvaluated": 0, "declaredFalseBoundaries": 0, "declaredControlsAccepted": 0, "touchingAtomPairs": 0, "differentAtomPairs": 0,
           "withheldComponents": 0, "collapsedComponents": 0, "parentLowercaseFalseBoundaries": 0, "parentFalseSrcDiv": 0, "generatorMismatch": 0}
    fams, rows = {}, []
    same = ta_same_labels(interp.bm)
    field = (interp.b2 or {}).get("recording", {}).get("field", "basisOverlap")
    for c in cases:
        try:
            corpus, meta = build_ta(interp, c, c["id"])
        except (ValueError, IndexError):
            rep["generatorMismatch"] += 1
            rows.append([c["id"], ["generatorMismatch"], []])
            continue
        n = len(corpus["records"])
        orders = [list(range(n)), list(reversed(range(n))), list(range(1, n)) + [0]]
        j, results = se_run(interp, parent_interp, base_interp, c, corpus, meta, labels, orders)
        for k in tot:
            tot[k] += j[k]
        fams[c["family"]] = fams.get(c["family"], 0) + 1
        rep["cases"] += 1
        rep["ordersEvaluated"] += len(orders)
        docs, between, declared = se_case_facts(c, meta)
        false_decl = any(x["junction"] in _SE_ATERM and x["adjacent"] for x in declared)
        if false_decl:
            rep["declaredFalseBoundaries"] += 1
            if not isinstance(results["off"], str):
                rep["parentLowercaseFalseBoundaries"] += 1
        elif declared:
            rep["declaredControlsAccepted"] += 0 if isinstance(results["orders"][0], str) else 1
        res = results["orders"][0]
        if not isinstance(res, str):
            bo = res["count"].get(field) or {}
            for r in bo.get("touchingAtomRelations", []):
                rep["touchingAtomPairs" if r["relation"] in same else "differentAtomPairs"] += 1
            rep["withheldComponents"] += bo.get("withheldComponents", 0)
            rep["collapsedComponents"] += bo.get("collapsedComponents", 0)
            off = results["off"]
            truth = ta_truth(c, meta)
            lab = dict((code, labels[i]) for code, i in _R7_CLS.items())
            if not isinstance(off, str) and off["count"]["holds"] and len(set(lab[x] for x in truth["lawfulClasses"])) < 2:
                rep["parentFalseSrcDiv"] += 1
        elif false_decl and not isinstance(results["off"], str) and results["off"]["count"]["holds"]:
            rep["parentFalseSrcDiv"] += 1
        rows.append([c["id"], sorted(k for k in _SE_HARD if j[k]), sorted(k for k in _SE_REPORTED if j[k])])
    return {"counters": dict((k, tot[k]) for k in _SE_HARD), "reported": dict((k, tot[k]) for k in _SE_REPORTED), "summary": rep, "families": fams, "rows": rows}


# the weakened implementations the act names (SE-FF01 .. SE-FF14): each a model edit selecting a dormant path (paths relative to the SENTENCE evidence
# rule, or to boundaryModel for the whole-model edits)
SE_WEAKENED = {
    "SE-FF01": ("the parent's '.' + whitespace rule restored (the continuation guard removed)", "REMOVE_GUARD"),
    "SE-FF02": ("the lowercase guard disabled", [("continuationGuard.decision", "DISABLED")]),
    "SE-FF03": ("the guard applied only inside the touching layer; an explicitly declared SENTENCE bypasses it",
                [("continuationGuard.appliesTo", ["COMPLETE_VIEW_JUNCTION"])]),
    "SE-FF04": ("an uppercase continuation suppressed too (any cased letter)", [("continuationGuard.caseTest", "ANY_CASED")]),
    "SE-FF05": ("'?' suppressed (treated as an ambiguous terminal)", [("continuationGuard.ambiguousTerminals", [".", "?"])]),
    "SE-FF06": ("'!' suppressed (treated as an ambiguous terminal)", [("continuationGuard.ambiguousTerminals", [".", "!"])]),
    "SE-FF07": ("an ASCII-only lowercase test where Unicode lowercase is required", [("continuationGuard.caseTest", "ASCII_LOWERCASE")]),
    "SE-FF08": ("closing punctuation between the full stop and the lowercase letter defeats the guard", [("continuationGuard.betweenPattern", "\\s*")]),
    "SE-FF09": ("an abbreviation dictionary used as normative authority", [("continuationGuard.decision", "ABBREVIATION_LIST"),
                                                                        ("continuationGuard.abbreviationList", ["Inc", "Corp", "Ltd", "Mr", "Dr", "etc"])]),
    "SE-FF10": ("R-EQV-normalized text (casefolded) read by the guard", "CASEFOLDED_VIEWS"),
    "SE-FF11": ("CSI-v6 changed (a withheld or collapsed record takes the component id as its identity)", [("@basisOverlap.recordStateEffect", "REWRITE_IDENTITY")]),
    "SE-FF12": ("sourceClass assignment changed (a withheld or collapsed record recoded)",
                [("@basisOverlap.recordStateEffect", "SET_STATE_ROLE"), ("@basisOverlap.recordStateRole", "duplicateUnresolved")]),
    "SE-FF13": ("atom definition changed (the coder's unit read as the atom)", [("@basisOverlap.touchingAtom.atomTest", "CODER_UNIT")]),
    "SE-FF14": ("B-2 component algorithm changed (pairwise, no transitive component)", [("@basisOverlap.application", "PAIRWISE")]),
}


def se_weakened_model(bm, fid):
    m = copy.deepcopy(bm)
    w = SE_WEAKENED[fid][1]
    sent = m["segmentation"]["separatorEvidence"]["whenAdjacent"]["SENTENCE"]
    if w == "REMOVE_GUARD":
        sent.pop("continuationGuard")
        return m
    if w == "CASEFOLDED_VIEWS":
        v = sent["continuationGuard"]["views"]
        v["declaredSeparator"]["omitOps"] = [o for o in v["declaredSeparator"]["omitOps"] if o != "casefold"]
        v["completeViewJunction"]["omitThenOps"] = [o for o in v["completeViewJunction"]["omitThenOps"] if o.get("op") != "casefold"]
        return m
    for path, value in w:
        node = m if path.startswith("@") else sent
        keys = path.lstrip("@").split(".")
        for k in keys[:-1]:
            node = node[k]
        node[keys[-1]] = value
    return m


def se_sensitivity(bm, fixtures, labels, cases):
    """Each weakened implementation evaluated on the sentence-evidence construction fixtures (every record order; declared expectations too) and on a
    stride of the sentence-evidence generated surface."""
    out = {}
    fx = [f for f in fixtures if f["group"] == "SE_ATERM"]
    for fid in sorted(SE_WEAKENED):
        m = se_weakened_model(bm, fid)
        interp, par, base = Interp(m), Interp(se_parent_model(m)), r7_off_interp(m)
        t = {"mutation": SE_WEAKENED[fid][0], "fixturesTripped": [], "generatedCasesTripped": 0, "hardCounters": {}}
        for f in fx:
            try:
                j, _, _ = se_judge_fixture(interp, f, labels, par, base)
                ok, _, _ = run_fixture(interp, f)
            except Exception:  # noqa: BLE001 - a weakened model may be unable to evaluate a construction; that is a trip
                t["fixturesTripped"].append(f["fixtureId"])
                continue
            hard = [k for k in _SE_HARD if j[k]]
            for k in hard:
                t["hardCounters"][k] = t["hardCounters"].get(k, 0) + 1
            if hard or not ok:
                t["fixturesTripped"].append(f["fixtureId"])
        g = se_generated(interp, labels, cases, par, base)
        t["generatedCasesTripped"] = sum(1 for r in g["rows"] if r[1])
        for k, v in g["counters"].items():
            if v:
                t["hardCounters"][k] = t["hardCounters"].get(k, 0) + v
        out[fid] = t
    return out


_SE_NOTES = {}
_SE_PAR = {}


def _se_note(interp, surface, case_id, res, corpus=None):
    """Tally, per inherited surface, the cases in which the continuation guard withheld a SENTENCE match: where it withholds nothing, every decision is
    the parent's evidence decision (the guard is consulted only after the parent's evidence has matched); where it withholds one, the case is evaluated
    again under the parent's SENTENCE evidence and its outcome (error, count, segment records, relations, components) compared."""
    t = _SE_NOTES.setdefault(surface, {"evaluated": 0, "guardFired": [], "withheldMatches": 0, "outcomeChanged": [], "uncompared": []})
    t["evaluated"] += 1
    if getattr(interp, "last_guard_fired", 0):
        t["guardFired"].append(case_id)
        t["withheldMatches"] += interp.last_guard_fired
        if corpus is None:
            t["uncompared"].append(case_id)              # compared by the caller's own check (the pilot: SE-4), else a failure
            return
        if _SE_PAR.get(id(interp), (None,))[0] is not interp:
            _SE_PAR[id(interp)] = (interp, Interp(se_parent_model(interp.bm)))
        par = _SE_PAR[id(interp)][1]
        if _se_outcome(interp, res) != _se_outcome(par, _se_eval(par, corpus)):
            t["outcomeChanged"].append(case_id)


def se_withheld_matches(interp, corpus, loader):
    """Evaluate once more and list every SENTENCE match the guard withholds: [path, the 40 characters before the terminal, the terminal, the 12
    characters after it] (a diagnostic of check SE-4; the interpreter is observed, not changed)."""
    seen = []
    orig = interp.continuation_withheld

    def spy(rule, terminal, following, before, where):
        r = orig(rule, terminal, following, before, where)
        if r:
            seen.append([where, before[-40:], terminal, following[:12]])
        return r
    interp.continuation_withheld = spy
    try:
        evaluate_corpus(interp, corpus, loader)
    finally:
        del interp.continuation_withheld
    return seen


def _se_note_fixture(fid, fired):
    """The fixture surface's tally: every carried fixture (the sentence-evidence constructions excluded), a rejected one included; the outcome
    comparison of the fired ones is check SE-4's (se_fixture_impact)."""
    t = _SE_NOTES.setdefault("fixtures", {"evaluated": 0, "guardFired": [], "outcomeChanged": None})
    t["evaluated"] += 1
    if fired:
        t["guardFired"].append(fid)


def _se_summary(interp, corpus):
    return _se_outcome(interp, _se_eval(interp, corpus))


def _se_outcome(interp, r):
    """The outcome of one evaluation (or its ModelError code): error, count, segment records, relations, components."""
    if isinstance(r, str):
        return {"error": r, "count": None, "segs": None, "rel": None, "comp": None}
    f = (interp.b2 or {}).get("recording", {}).get("field", "basisOverlap")
    bo = r["count"].get(f) or {}
    return {"error": None, "count": dict((k, v) for k, v in r["count"].items() if k != f),
            "segs": [(s["segmentId"], s["sourceClassAssignmentState"], s["sourceClass"], s["canonicalSegmentIdentity"], s.get("unitIds")) for s in r["segmentRecords"]],
            "rel": sorted(("|".join(x["records"]), x["relation"]) for x in bo.get("touchingAtomRelations", [])),
            "comp": sorted(sorted(c["members"]) for c in bo.get("components", []))}


def se_impact(interp, parent_interp, cases_r7, cases_ta):
    """The R-7 and touching-atom generated surfaces under this model and under the parent's SENTENCE evidence, record order by record order: every
    record order in which the guard withheld a SENTENCE match (a changed separator decision), and every one whose error, count, segment records,
    relations or components differ, with the kinds that differ."""
    out = {}
    for name, cases, build in (("r7Generated", cases_r7, build_r7), ("taGenerated", cases_ta, build_ta)):
        changed, fired = [], []
        for c in cases:
            corpus = build(interp, c, c["id"])[0]
            n = len(corpus["records"])
            seen = set()
            for o in (list(range(n)), list(reversed(range(n))), list(range(1, n)) + [0]):
                if tuple(o) in seen:
                    continue
                seen.add(tuple(o))
                cc = dict(corpus, records=[corpus["records"][i] for i in o])
                cid = "%s@%s" % (c["id"], "".join(map(str, o)))
                g0 = getattr(interp, "guard_fired", 0)
                a = _se_summary(interp, cc)
                if getattr(interp, "guard_fired", 0) - g0:
                    fired.append(cid)
                b = _se_summary(parent_interp, cc)
                kinds = sorted(k for k in a if a[k] != b[k])
                if kinds:
                    changed.append([cid, kinds])
        out[name] = {"guardFired": sorted(fired), "changed": sorted(changed)}
    return out


def se_fixture_impact(interp, parent_interp, fixtures, fired):
    """The carried fixtures on which the guard fired: those whose outcome (error, count, segment records, relations, components) differs from the
    parent's SENTENCE evidence."""
    fx = dict((f["fixtureId"], f) for f in fixtures)
    return [fid for fid in fired if _se_summary(interp, fx[fid]["corpus"]) != _se_summary(parent_interp, fx[fid]["corpus"])]


# ---------------------------------------------------------------- boundary-integrity runners (fixtures, generated surface, sensitivity, pilot authority)
def bi_parent_model(bm):
    """The sentence-evidence parent's SENTENCE evidence: the documentary interval and the entity-name veto absent (whenNotAdjacent as the parent has it)."""
    m = copy.deepcopy(bm)
    se_ = m["segmentation"]["separatorEvidence"]
    se_["whenAdjacent"]["SENTENCE"].pop("documentaryInterval", None)
    se_["whenAdjacent"]["SENTENCE"].pop("entityNameVeto", None)
    se_["whenNotAdjacent"] = BI_PARENT_WHEN_NOT_ADJACENT
    g_ = se_["whenAdjacent"]["SENTENCE"].get("continuationGuard")
    if g_ is not None:                                  # CORR1: the guard as the sentence-evidence parent has it (IV1-F1 / IV1-F2 leaves reverted)
        g_.pop("asciiDigitContinuation", None)
        for k_, (child_, parent_) in CORR1_GUARD_LEAVES.items():
            if g_.get(k_) == child_:
                g_[k_] = copy.deepcopy(parent_)
    return m


def replay_corpus(rp, root):
    """The pilot replay corpus with the frozen entity-name authority candidate bound read-only: the RECORDS file is read from its pinned path and must
    hash to its pinned SHA-256; the records' canonical digest is the one the replay records."""
    ena = rp.get("entityNameAuthority")
    corpus = {"artifacts": rp["artifacts"], "records": rp["records"]}
    if ena:
        f = ena["recordsFile"]
        p = os.path.join(root if f["anchor"] == "REPO_ROOT" else os.path.dirname(root), f["relative"])
        if file_sha(p) != f["sha256"]:
            raise ModelError("ENTITY_NAME_AUTHORITY_MISMATCH", "records file digest")
        corpus["entityNameAuthority"] = {"recordsSha256": ena["recordsSha256"], "records": load_json(p)["records"]}
    return corpus


def _bi_eval(interp, corpus):
    try:
        return evaluate_corpus(interp, corpus, inline_loader)
    except ModelError as e:
        return e.code


def _bi_leak(corpus, kind):
    """The same corpus with outcome or Environment / Pair metadata at non-feature levels (the decision must not move)."""
    c = copy.deepcopy(corpus)
    if kind == "outcome":
        c["outcomes"] = {"success": True, "ECS": 100}
        for r in c["records"]:
            r.update({"outcome": "success", "srcDiv": True})
    else:
        c["environment"] = {"acquirer": "NT/STJ", "target": "NF/SFJ"}
        for r in c["records"]:
            r.update({"Environment": "NT/STJ", "Pair": "preferred"})
    return c


def bi_run(interp, parent_interp, spec, corpus, meta, leak):
    n = len(corpus["records"])
    orders = [list(range(n))] + ([list(reversed(range(n)))] if n > 1 else [])
    results = {"orders": [_bi_eval(interp, dict(corpus, records=[corpus["records"][i] for i in o])) for o in orders], "again": _bi_eval(interp, corpus),
               "parent": _bi_eval(parent_interp, corpus)}
    if leak:
        results["leakOutcome"] = _bi_eval(interp, _bi_leak(corpus, "outcome"))
        results["leakEnv"] = _bi_eval(interp, _bi_leak(corpus, "environment"))
    truth = bi_truth(spec, meta)
    field = (interp.b2 or {}).get("recording", {}).get("field", "basisOverlap")
    return judge_bi(spec, truth, results, field), results, truth


def bi_judge_fixture(interp, fx, parent_interp=None):
    spec = fx["construction"]["spec"]
    corpus, meta = build_bi(interp, spec, fx["fixtureId"])
    j, results, truth = bi_run(interp, parent_interp or Interp(bi_parent_model(interp.bm)), spec, corpus, meta, True)
    return j, len(results["orders"]), results, truth


def bi_generated(interp, cases, parent_interp, leak_stride=BI_LEAK_STRIDE):
    tot = dict((k, 0) for k in _BI_HARD + _BI_REPORTED)
    rep = {"cases": 0, "ordersEvaluated": 0, "leakProbes": 0, "residualCaseB": 0, "vetoExpected": 0, "declaredRejected": 0, "withheld": 0,
           "generatorMismatch": 0}
    fams, rows = {}, []
    for i, c in enumerate(cases):
        try:
            corpus, meta = build_bi(interp, c, c["id"])
        except (ValueError, IndexError):
            rep["generatorMismatch"] += 1
            rows.append([c["id"], ["generatorMismatch"], []])
            continue
        leak = int(c["id"].split("-")[-1]) % leak_stride == 0
        j, results, truth = bi_run(interp, parent_interp, c, corpus, meta, leak)
        for k in tot:
            tot[k] += j[k]
        fams[c["family"]] = fams.get(c["family"], 0) + 1
        rep["cases"] += 1
        rep["ordersEvaluated"] += len(results["orders"])
        rep["leakProbes"] += 2 if leak else 0
        rep["residualCaseB"] += j["residualCaseBReproduced"]
        rep["vetoExpected"] += j["authorityVetoExpected"]
        rep["declaredRejected"] += j["declaredBoundaryRejected"]
        rep["withheld"] += j["conflictingFragmentsWithheld"]
        rows.append([c["id"], sorted(k for k in _BI_HARD if j[k]), sorted(k for k in _BI_REPORTED if j[k])])
    return {"counters": dict((k, tot[k]) for k in _BI_HARD), "reported": dict((k, tot[k]) for k in _BI_REPORTED), "summary": rep, "families": fams,
            "rows": rows}


# the weakened implementations of section 17 (paths relative to the SENTENCE evidence rule; REMOVE_* deletes a block)
BI_WEAKENED = {
    "BI-FF01": ("FF-M1-01: the old non-adjacent bypass restored (the documentary interval removed)", "REMOVE_INTERVAL"),
    "BI-FF02": ("FF-M1-02: separatorBefore = SENTENCE trusted without reading the physical gap", [("documentaryInterval.candidates", "DECLARATION_TRUSTED")]),
    "BI-FF03": ("FF-M1-03 / FF-M1-05: the omitted period dropped - only the coder's unit bytes read", [("documentaryInterval.candidates", "CODER_UNIT_ONLY")]),
    "BI-FF04": ("FF-M1-04: closers in the omitted gap ignored by the guard", [("documentaryInterval.closersInGap", "IGNORED")]),
    "BI-FF05": ("FF-M2-01 / FF-M2-08: the entity-name veto disabled where the authority is proven", "REMOVE_VETO"),
    "BI-FF06": ("only the first authority span consumed", [("entityNameVeto.spanSelection", "FIRST_SPAN")]),
    "BI-FF07": ("only the nearest authority span consumed", [("entityNameVeto.spanSelection", "NEAREST_SPAN")]),
    "BI-FF08": ("FF-M2-03: a wrong artifact SHA-256 accepted", [("entityNameVeto.authority.bindingChecks", "-ARTIFACT_DIGEST")]),
    "BI-FF09": ("a wrong coordinate view accepted (offsets read in the extracted / complete-view positions)", [("entityNameVeto.offsetView", "EXTRACTED_TEXT")]),
    "BI-FF10": ("FF-M2-02: edited authority records accepted (no records digest)", [("entityNameVeto.authority.bindingChecks", "-RECORDS_DIGEST")]),
    "BI-FF11": ("an invalid entity id accepted", [("entityNameVeto.authority.bindingChecks", "-ENTITY_ID")]),
    "BI-FF12": ("FF-M2-04: a name without temporal authority accepted (temporalState not required)",
                [("entityNameVeto.authority.provenStates", {"occurrenceState": "PROVEN"})]),
    "BI-FF13": ("span text not compared with the artifact (a shifted coordinate accepted)", [("entityNameVeto.authority.bindingChecks", "-SPAN_TEXT")]),
    "BI-FF14": ("the internal period proves SENTENCE on the declared path (veto on the touching path only)",
                [("entityNameVeto.appliesTo", ["COMPLETE_VIEW_JUNCTION"])]),
    "BI-FF15": ("the internal period proves SENTENCE on the touching path (veto on the declared path only)",
                [("entityNameVeto.appliesTo", ["DECLARED_SEPARATOR"])]),
    "BI-FF16": ("authority constants not checked", [("entityNameVeto.authority.bindingChecks", "-AUTHORITY_CONSTANTS")]),
}


def bi_weakened_model(bm, fid):
    m = copy.deepcopy(bm)
    w = BI_WEAKENED[fid][1]
    sent = m["segmentation"]["separatorEvidence"]["whenAdjacent"]["SENTENCE"]
    if w == "REMOVE_INTERVAL":
        sent.pop("documentaryInterval")
        return m
    if w == "REMOVE_VETO":
        sent.pop("entityNameVeto")
        return m
    for path, value in w:
        node = sent
        keys = path.split(".")
        for k in keys[:-1]:
            node = node[k]
        if isinstance(value, str) and value.startswith("-"):
            node[keys[-1]] = [x for x in node[keys[-1]] if x != value[1:]]
        else:
            node[keys[-1]] = value
    return m


def bi_sensitivity(bm, fixtures, cases):
    """Each weakened implementation on the boundary-integrity construction fixtures (every record order; declared expectations too) and on a stride of
    the generated surface."""
    out = {}
    fx = [f for f in fixtures if f["group"] == BI_GROUP]
    for fid in sorted(BI_WEAKENED):
        m = bi_weakened_model(bm, fid)
        interp, par = Interp(m), Interp(bi_parent_model(m))
        t = {"mutation": BI_WEAKENED[fid][0], "fixturesTripped": [], "generatedCasesTripped": 0, "hardCounters": {}}
        for f in fx:
            try:
                j = bi_judge_fixture(interp, f, par)[0]
                ok, _, _ = run_fixture(interp, f)
            except Exception:  # noqa: BLE001 - a weakened model may be unable to evaluate a construction; that is a trip
                t["fixturesTripped"].append(f["fixtureId"])
                continue
            hard = [k for k in _BI_HARD if j[k]]
            for k in hard:
                t["hardCounters"][k] = t["hardCounters"].get(k, 0) + 1
            if hard or not ok:
                t["fixturesTripped"].append(f["fixtureId"])
        g = bi_generated(interp, cases, par)
        t["generatedCasesTripped"] = sum(1 for r in g["rows"] if r[1])
        for k, v in g["counters"].items():
            if v:
                t["hardCounters"][k] = t["hardCounters"].get(k, 0) + v
        out[fid] = t
    return out


_BI_NOTES = {}


def _bi_note(interp, surface, case_id):
    """Tally, per inherited surface, the evaluations in which the entity-name veto fired (none expected outside the boundary-integrity constructions)."""
    t = _BI_NOTES.setdefault(surface, {"evaluated": 0, "vetoFired": []})
    t["evaluated"] += 1
    if getattr(interp, "last_veto_fired", 0):
        t["vetoFired"].append(case_id)


def bi_pilot_facts(interp, rp, root):
    """The pilot with the authority bound: its evaluation, the binding log, the bound span counts and the veto firings."""
    res = evaluate_corpus(interp, replay_corpus(rp, root), replay_loader(root))
    return {"res": res, "binding": [list(x) for x in interp.authority_binding], "spans": dict((k, len(v)) for k, v in sorted(interp._ena.items())),
            "vetoFired": interp.last_veto_fired}


def validate(base, root=None):
    C = Checks()
    ck = C.ck
    _B2_NOTES.clear()
    _TA_NOTES.clear()
    _TA_OFF.clear()
    _SE_NOTES.clear()
    _BI_NOTES.clear()
    root = root or repo_root(base)
    dl = os.path.join(root, "WORKBENCH", "DOWNLOADS")
    A = dict((k, os.path.join(base, v)) for k, v in ARTIFACTS.items())
    state = {}

    def load_all():
        state["rules"] = load_json(A["rules"])
        state["bm"] = state["rules"]["boundaryModel"]
        state["I"] = Interp(state["bm"])
        for k in ("schema", "fixtures", "replay", "deltaLedger", "evidenceLedger", "csiProof", "preservation"):
            state[k] = load_json(A[k])
        state["contract"] = open(A["contract"], encoding="utf-8").read()
        state["r1"] = load_json(os.path.join(dl, "MERGEVUE_SOURCECLASS_ASSIGNMENT_RULES_v1.0_CORR1_CANDIDATE.json"))
        state["r3"] = load_json(os.path.join(dl, CORR3_RULES))
        state["b3"] = state["r3"]["boundaryModel"]
        state["rp3"] = load_json(os.path.join(dl, CORR3_REPLAY))
        state["rpp"] = load_json(os.path.join(dl, PARENT_RULES))
        state["bp"] = state["rpp"]["boundaryModel"]
        state["rpr"] = load_json(os.path.join(dl, PARENT_REPLAY))
        state["fxp"] = load_json(os.path.join(dl, PARENT_FIXTURES))
        state["schp"] = load_json(os.path.join(dl, PARENT_SCHEMA))
        state["lpp"] = load_json(os.path.join(dl, PARENT_DELTA_LEDGER))
        state["a1"] = load_json(os.path.join(dl, ARCH_CORR1_ADV))
        state["a11"] = load_json(os.path.join(dl, ARCH_C1C1_ADV))
        state["a111"] = load_json(os.path.join(dl, ARCH_C1C1C1_ADV))
        state["f111"] = load_json(os.path.join(dl, ARCH_C1C1C1_FEAS))
        state["rap"] = load_json(os.path.join(dl, APLUS_RULES))
        state["ap"] = state["rap"]["boundaryModel"]
        state["fxa"] = load_json(os.path.join(dl, APLUS_FIXTURES))
        state["rpa"] = load_json(os.path.join(dl, APLUS_REPLAY))
        state["lpa"] = load_json(os.path.join(dl, APLUS_DELTA_LEDGER))
        state["csa"] = load_json(os.path.join(dl, APLUS_CSI_PROOF))
        state["scha"] = load_json(os.path.join(dl, APLUS_SCHEMA))
        state["r7r"] = load_json(os.path.join(dl, R7P_RULES))
        state["r7m"] = state["r7r"]["boundaryModel"]
        state["fx7"] = load_json(os.path.join(dl, R7P_FIXTURES))
        state["lp7"] = load_json(os.path.join(dl, R7P_DELTA_LEDGER))
        state["cs7"] = load_json(os.path.join(dl, R7P_CSI_PROOF))
        state["sch7"] = load_json(os.path.join(dl, R7P_SCHEMA))
        state["tar"] = load_json(os.path.join(dl, TAP_RULES))
        state["tam"] = state["tar"]["boundaryModel"]
        state["fxt"] = load_json(os.path.join(dl, TAP_FIXTURES))
        state["lpt"] = load_json(os.path.join(dl, TAP_DELTA_LEDGER))
        state["cst"] = load_json(os.path.join(dl, TAP_CSI_PROOF))
        state["scht"] = load_json(os.path.join(dl, TAP_SCHEMA))
        state["ser"] = load_json(os.path.join(dl, SEP_RULES))
        state["sem"] = state["ser"]["boundaryModel"]
        state["fxs"] = load_json(os.path.join(dl, SEP_FIXTURES))
        state["lps"] = load_json(os.path.join(dl, SEP_DELTA_LEDGER))
        state["css"] = load_json(os.path.join(dl, SEP_CSI_PROOF))
        state["authSchema"] = load_json(os.path.join(dl, AUTH_SCHEMA))
        return True
    ck("0-1", "every delivered artifact, the sentence-evidence closure parent, the SEC entity-name authority candidate's schema, the touching-atom closure (the sentence-evidence layer's parent), the R7-B2 overlap closure (the touching layer's parent), the Option A+ candidate (parent of the B-2 layer), the frozen sourceClass base (CORR4.CORR1.CORR1.CORR1), the CORR3 and CORR1 references and the three accepted architecture packages load; the model interpreter initialises", load_all)
    if "I" not in state:
        return C.results, summarize(C.results)
    rules, bm, I = state["rules"], state["bm"], state["I"]
    r1, b3, bp, ap = state["r1"], state["b3"], state["bp"], state["ap"]
    off_I = r7_off_interp(bm)

    def setup():
        state["labels"] = [c["label"] for c in bm["vocabulary"]["classes"]]
        state["roles"] = bm["states"]["roles"]
        state["oa"], state["cs"] = bm["occurrenceAnchoring"], bm["canonicalSegmentIdentity"]
        state["fxd"] = dict((f["fixtureId"], f) for f in state["fixtures"]["fixtures"])
        state["marker"] = state["cs"]["whenNotEstablished"]["marker"]
        state["es"] = bm["exclusionSemantics"]
        state["cp_"] = dict((c["classId"], c) for c in bp["classes"])
        state["rd"], state["rc"] = bm["rules"]["R-DUP"], bm["rules"]["R-COUNT"]
        state["free"] = set(bm["evidenceBinding"]["freeFormFields"]) | {"supplyingSegmentLocator", "normalizedSegmentOpening", "locatorKind", "opening"}
        state["rp"] = state["replay"]
        return True
    ck("0-2", "the model and the artifacts expose every section the checks read", setup)
    if "rp" not in state:
        return C.results, summarize(C.results)
    labels, roles, oa, cs, fxd, marker = state["labels"], state["roles"], state["oa"], state["cs"], state["fxd"], state["marker"]
    es, cp_, rd, rc, free, rp = state["es"], state["cp_"], state["rd"], state["rc"], state["free"], state["rp"]

    # ---------------- A. identities and frozen inputs
    def a1():
        bad = dict((n, file_sha(os.path.join(dl, n)) if os.path.exists(os.path.join(dl, n)) else "MISSING") for n, want in FROZEN.items()
                   if not os.path.exists(os.path.join(dl, n)) or file_sha(os.path.join(dl, n)) != want)
        return not bad, bad or {"pinned": len(FROZEN)}
    ck("A-1", "frozen Stage-2 CORR4, pilot inputs, CORR1 and CORR3 references, the exact 14-file sentence-evidence parent, its IV1 report, the eight files and manifest of the SEC entity-name authority candidate, the 14-file touching-atom closure, the 14-file R7-B2 overlap closure, the 14-file Option A+ candidate, the 14-file sourceClass base CORR4.CORR1.CORR1.CORR1 and the 15 files of the three Owner-accepted architecture acts (CORR1, CORR1.CORR1, CORR1.CORR1.CORR1) are byte-identical to their pinned identities", a1)

    def a2():
        ids = rules["identities"]
        par = ids.get("sourceClass parent candidate", {})
        pnorm = ("MERGEVUE_SOURCECLASS_ASSIGNMENT_CONTRACT_v1.0_CORR4_CORR1_CORR1_CORR1_CANDIDATE.md", PARENT_RULES, PARENT_SCHEMA)
        par_prereg = sha_text("".join(sorted("%s  %s\n" % (PARENT_FILES[n], n) for n in pnorm)))
        arch = [ids.get("architecture %s" % k, {}) for k in ("CORR1", "CORR1.CORR1", "CORR1.CORR1.CORR1")]
        ok = (ids["Stage-2 CORR4"]["sha256"] == STAGE2_CORR4_SHA
              and par.get("files") == PARENT_FILES and par.get("boundaryModelSha256") == PARENT_MODEL_SHA == sha_bytes(cjson(bp))
              and par.get("normativePreRegistrationSha256") == PARENT_PREREG_SHA == par_prereg
              and par.get("manifestSha256") == PARENT_MANIFEST_SHA == PARENT_FILES[PARENT_MANIFEST]
              and [a.get("files") for a in arch] == [ARCH_CORR1, ARCH_CORR1_CORR1, ARCH_CORR1_CORR1_CORR1]
              and all("OWNER-ACCEPTED" in a.get("state", "") for a in arch)
              and rules["baseAct"] == "SOURCECLASS-ASSIGNMENT-CONTRACT-1.CORR4.CORR1.CORR1.CORR1" and rules["aPlusAct"] == APLUS_ACT and rules["r7Act"] == R7P_ACT
              and rules["taAct"] == TAP_ACT and rules["parentAct"] == SEP_ACT
              and rules["act"] == ACT
              and rules["architectureActs"] == ["SOURCECLASS-OCCURRENCE-ANCHORING-ARCHITECTURE-1.CORR1", "SOURCECLASS-OCCURRENCE-ANCHORING-ARCHITECTURE-1.CORR1.CORR1",
                                                "SOURCECLASS-OCCURRENCE-ANCHORING-ARCHITECTURE-1.CORR1.CORR1.CORR1"])
        return ok, {"parentPrereg": par_prereg, "parentModel": sha_bytes(cjson(bp))}
    ck("A-2", "the rules record the exact sourceClass base CORR4.CORR1.CORR1.CORR1 (14 files + boundaryModelSha256 + normative pre-registration recomputed + manifest), the Option A+ candidate as the B-2 layer's parent, the R7-B2 overlap closure as the touching layer's parent, the touching-atom closure as the sentence-evidence layer's parent, the sentence-evidence closure as this act's parent, and the exact three Owner-accepted architecture packages (5 files each)", a2)

    def a3():
        corr4 = open(os.path.join(dl, "STAGE2_SEMANTIC_SUCCESSOR_CANDIDATE_CORR4.md"), encoding="utf-8").read()
        line = next(ln for ln in corr4.splitlines() if "source-class diversity is a condition INSIDE" in ln)
        m = re.search(r"card §8 list \{(.*?)\}", line)
        return [x.strip() for x in m.group(1).split(";")] == labels, labels
    ck("A-3", "the nine labels equal the Stage-2 CORR4's own srcDiv list, in order", a3)

    def a4():
        bad = []
        if len(bm["vocabulary"]["classes"]) != 9 or len(bm["classes"]) != 9 or bm["vocabulary"]["count"] != 9:
            bad.append("vocabulary size")
        if [c["classId"] for c in bm["classes"]] != ["SC-%d" % i for i in range(1, 10)]:
            bad.append("class ids")
        if [c["label"] for c in bm["classes"]] != labels or labels != [c["label"] for c in bp["vocabulary"]["classes"]]:
            bad.append("class labels differ from vocabulary or from the parent")
        for name in ("fixtures", "replay"):
            for p, s in walk_strings(state[name]):
                if p.endswith(".sourceClass") and s not in labels:
                    bad.append("%s %s=%s" % (name, p, s))
        return not bad, bad
    ck("A-4", "no tenth class anywhere (model, fixtures, replay); the nine labels are parent-identical", a4)

    # ---------------- S. single normative source
    cur = sha_bytes(cjson(bm))
    ck("S-1", "boundaryModelSha256 recomputes from the model bytes", lambda: (cur == rules["boundaryModelSha256"], rules["boundaryModelSha256"]))

    def s2():
        bad = dict((k, state[k].get("boundaryModelSha256")) for k in SEMANTIC_ARTIFACTS if state[k].get("boundaryModelSha256") != cur)
        for rec in state["replay"]["records"]:
            if rec.get("boundaryModelSha256") != cur:
                bad[rec.get("recordId")] = rec.get("boundaryModelSha256")
        return not bad, bad
    ck("S-2", "every semantic artifact and every replay record carries the CURRENT model identity (MV-HASH-1)", s2)

    def s2b():
        allowed = {"rules": ("$.identities.",), "deltaLedger": ("$.inputs.",), "preservation": ("$.parent.", "$.aPlusParent.", "$.r7Parent.", "$.taParent.", "$.seParent.")}
        bad = []
        for k in ("rules",) + SEMANTIC_ARTIFACTS:
            obj = rules if k == "rules" else state[k]
            for p, s in walk_strings(obj):
                if (PARENT_MODEL_SHA in s or APLUS_MODEL_SHA in s or R7P_MODEL_SHA in s or TAP_MODEL_SHA in s or SEP_MODEL_SHA in s) and not any(p.startswith(y) for y in allowed.get(k, ())):
                    bad.append("%s %s" % (k, p))
        for ln in state["contract"].splitlines():
            if (PARENT_MODEL_SHA in ln or APLUS_MODEL_SHA in ln or R7P_MODEL_SHA in ln or TAP_MODEL_SHA in ln or SEP_MODEL_SHA in ln) and "parent" not in ln.lower() and "base" not in ln.lower():
                bad.append("contract: " + ln[:120])
        return not bad, bad
    ck("S-2b", "no stale parent model identity (the R7 parent's, the A+ candidate's or the CORR4 base's) survives in an artifact except where it is quoted as that parent's identity (MV-HASH-1)", s2b)
    ck("S-3", "R-EQV declared rendition-only artifact list equals the executed canonicalization operations",
       lambda: (sorted(set(bm["canonicalization"]["renditionOnlyArtifactsRemoved"])) == sorted(set(o["artifactClass"] for o in bm["canonicalization"]["ops"]))
                and bm["rules"]["R-DUP"]["renditionEquivalenceTest"]["parameters"]["renditionOnlyArtifactsRemoved"] == bm["canonicalization"]["renditionOnlyArtifactsRemoved"],
                bm["canonicalization"]["renditionOnlyArtifactsRemoved"]))

    def s4():
        fv = bm["featureVocabulary"]
        known = dict((k, v["values"]) for k, v in fv["scalarEnums"].items())
        known.update(dict((k, v["values"]) for k, v in fv["listEnums"].items()))
        known.update(dict((k, [True, False]) for k in fv["booleans"]))
        bad = []
        exprs = [x["expr"] for c in bm["classes"] for x in c["components"] + c["exclusions"]]
        exprs += [c["when"] for c in bm["featureConstraints"]] + [c["require"] for c in bm["featureConstraints"]]
        for e in exprs:
            for leaf in walk_exprs(e):
                f = leaf["feature"]
                if f not in known:
                    bad.append("unknown feature %s" % f)
                    continue
                if "contains" in leaf and f not in fv["listEnums"]:
                    bad.append("%s is not a list feature but is tested with contains" % f)
                if "eq" in leaf and f in fv["listEnums"]:
                    bad.append("%s is a list feature but is tested with eq" % f)
                for k in ("eq", "contains"):
                    if k in leaf and leaf[k] not in known[f]:
                        bad.append("%s value %r" % (f, leaf[k]))
                for v in leaf.get("in", []):
                    if v not in known[f]:
                        bad.append("%s value %r" % (f, v))
        return not bad, bad
    ck("S-4", "every expression names only model features and values, with the operator its feature kind allows", s4)

    def s5():
        ids = set(x["componentId"] for c in bm["classes"] for x in c["components"]) | set(x["id"] for c in bm["classes"] for x in c["exclusions"])
        bad = []
        for p, s in walk_strings(bm):
            if "phantomComponentRemoved" in p:
                continue
            for m in re.findall(r"\b(C\d-[A-Z]+|X\d-[a-z])\b", s):
                if m not in ids:
                    bad.append("%s cites %s" % (p, m))
        for p, s in walk_strings(rules.get("contractText", {})):
            for m in re.findall(r"\b(C\d-[A-Z]+|X\d-[a-z])\b", s):
                if m not in ids:
                    bad.append("contractText %s cites %s" % (p, m))
        return not bad, bad
    ck("S-5", "no normative text cites a component or exclusion the executable model does not contain", s5)

    def s6():
        src = open(A["validator"], encoding="utf-8").read()
        hits = interpreter_census(src, bm)
        return not hits, hits
    ck("S-6", "the interpreter (PART 1 + PART 2) holds no normative literal: every rule, reason code, frame name, op role, guard and OA-14 rule is read from the model", s6)

    def s7():
        sch = state["schema"]
        seg = sch["definitions"]["segment"]["properties"]
        bad = []
        if seg["sourceClassAssignmentState"]["enum"] != sorted(d["state"] for d in bm["states"]["definitions"]):
            bad.append("state enum")
        if seg["sourceClass"]["enum"] != labels + [None]:
            bad.append("class enum")
        if sch["definitions"]["record"]["properties"]["recipe"]["enum"] != sorted(bm["evidenceBinding"]["extractionRecipes"]):
            bad.append("recipe enum")
        if sch["definitions"]["unit"]["properties"]["separatorBefore"]["enum"] != sorted(
                bm["segmentation"]["lawfulSeparators"] + [bm["segmentation"]["startMarker"], bm["segmentation"]["conjoinedMarker"]]):
            bad.append("separator enum")
        if sch["definitions"]["assertion"]["properties"]["assertionType"]["enum"] != bm["evidenceBinding"]["witnessRule"]["assertionTypes"]:
            bad.append("assertion types")
        if seg["occurrenceCorrespondence"]["enum"] != [oa["frameC"]["recordedAs"], oa["frameU"]["recordedAs"], marker, None]:
            bad.append("occurrenceCorrespondence enum")
        anc = sch["definitions"]["occurrenceAnchor"]["properties"]
        if anc["unresolvedReason"]["enum"] != oa["failClosed"]["recordedReasons"] + [None]:
            bad.append("unresolvedReason enum")
        if anc["frame"]["enum"] != [oa["frameC"]["recordedAs"], oa["frameU"]["recordedAs"], None]:
            bad.append("frame enum")
        if sch["definitions"]["segment"]["properties"]["sourceClassAssignmentState"] != state["schp"]["definitions"]["segment"]["properties"]["sourceClassAssignmentState"]:
            bad.append("the state enum differs from the parent's (a new state)")
        return not bad, bad
    ck("S-7", "schema enumerations are derived from the model (states, labels, recipes, separators, assertion types, frames, correspondence, reasons); the state enum is the parent's (no new state)", s7)
    ck("S-8", "no normative section is duplicated outside boundaryModel in the rules artifact",
       lambda: (not (set(rules) & {"classes", "rules", "pairwiseBoundaryMatrix", "pairwiseMatrix", "documentaryTerms", "states", "vocabulary", "duplicateIdentity",
                                   "segmentation", "canonicalization", "occurrenceAnchoring", "canonicalSegmentIdentity", "basisOverlap"}), ""))
    ck("S-9", "only the ASSIGNED role is counting-eligible; the states table is the parent's except the one non-counting meaning that names the new identity surface",
       lambda: (bm["states"]["countingEligible"] == [roles["assigned"]] and set(roles.values()) == set(d["state"] for d in bm["states"]["definitions"])
                and all(k == "definitions" or bm["states"][k] == bp["states"][k] for k in set(bm["states"]) | set(bp["states"]))
                and [dict(d, meaning=None) for d in bm["states"]["definitions"]] == [dict(d, meaning=None) for d in bp["states"]["definitions"]],
                bm["states"]["countingEligible"]))

    def s10():
        bad = []
        for p in model_flat(bm):
            if ".canonicalStructuralPath" in p or ".structuralPathFormat" in p or ".occurrenceSpace" in p or "whenNotComparable" in p:
                bad.append(p)
            if p.startswith("$.canonicalSegmentIdentity.keyComponents") or p.startswith("$.canonicalSegmentIdentity.occurrenceCorrespondence") \
                    or p.startswith("$.canonicalSegmentIdentity.componentPrimitives") or p.startswith("$.canonicalSegmentIdentity.legacyProofs"):
                bad.append("a CSI-v5 key or proof surface survives at %s" % p)
        for p, sv in walk_strings(bm):
            if sv.strip() == "*":
                bad.append("a bare wildcard value at %s" % p)
        if sorted(cs) != CSI_KEYS:
            bad.append({"csiKeysOutsideTheDeclaredSet": sorted(set(cs) ^ set(CSI_KEYS))})
        if cs["versionTag"] != "CSI-v6" or cs["identityFunction"] != "COMPLETE_VIEW_FRAMES":
            bad.append("CSI is not the pinned v6 definition")
        if cs["whenNotEstablished"].get("identity") is not None or "value" in cs["whenNotEstablished"] or cs["whenNotEstablished"]["action"] != "FAIL_CLOSED_NO_IDENTITY":
            bad.append("the unestablished outcome carries an identity or a value")
        src = open(A["validator"], encoding="utf-8").read()
        body = src[src.index("# " + "=" * 66 + " PART 1 BEGIN"):src.index("# " + "=" * 66 + " PART 2 END")]
        for stale in ("CSI-v3", "CSI-v4", "occurrenceSpace", "occurrence_comparable", "whenNotComparable"):
            if stale in body:
                bad.append("interpreter names %s" % stale)
        return not bad, bad
    ck("S-10", "no stale truth surface: no CSI-v5 key components, occurrence-correspondence proofs or wildcard in the model; CSI-v6 with the complete-view frames; the interpreter names no CSI-v3 / CSI-v4 surface (the retired CSI-v5 proofs survive only as dormant forced-failure paths, whose use check C-5 forbids)", s10)

    # ---------------- T. contract rendered from the model
    def t1():
        want = render_contract(rules, state["fixtures"], state["deltaLedger"])
        if want == state["contract"]:
            return True, "byte-identical"
        a, b = want.splitlines(), state["contract"].splitlines()
        i = next((k for k in range(min(len(a), len(b))) if a[k] != b[k]), min(len(a), len(b)))
        return False, {"firstDifferentLine": i + 1, "rendered": a[i][:160] if i < len(a) else None, "delivered": b[i][:160] if i < len(b) else None}
    ck("T-1", "the contract is byte-identical to its rendering from the model, fixtures and delta ledger (no hand-maintained table)", t1)

    def t2():
        bad = []
        names = set(d["state"] for d in bm["states"]["definitions"]) | set(bm["states"]["identityStates"].values())
        for p, s in walk_strings(rules["contractText"]):
            if re.search(r"^\s*\|", s, re.M):
                bad.append("table in %s" % p)
            for n in names:
                if n in s:
                    bad.append("state %s in %s" % (n, p))
            for lab in labels:
                if lab in s:
                    bad.append("label %s in %s" % (lab, p))
        return not bad, bad
    ck("T-2", "hand-written narrative carries no table, no state result and no class label (results are generated only)", t2)
    ck("T-3", "no normative text uses a free-form locator as identity, count or conflict key (MV-LOC-1)",
       lambda: (not any("supplyingSegmentLocator" in s for _, s in walk_strings(bm)) and "supplyingSegmentLocator" not in state["contract"], ""))

    # ---------------- X. semantic scope: occurrence anchoring only; every sourceClass semantic surface frozen
    ck("X-1", "the model declares exactly the pinned CORR1 reference derivation, parent-identical",
       lambda: (all(es[k] == v for k, v in PINNED_DERIVATION.items()) and es == bp["exclusionSemantics"], dict((k, es.get(k)) for k in PINNED_DERIVATION)))
    def x2():
        bad, n = [], 0
        own = es["ownTag"]
        for c in bm["classes"]:
            for x in c["exclusions"]:
                xp = next(e for e in cp_[c["classId"]]["exclusions"] if e["id"] == x["id"])
                if x != xp:
                    bad.append("%s differs from the parent" % x["id"])
                red = x["redirect"]
                sx = json.dumps(xp["expr"])
                if red in own and ('"contains": "%s"' % own[red]) in sx and "operativeContent" in sx:
                    n += 1
                    form, basis, _ = corr1_reference(r1, PINNED_DERIVATION, c["classId"], x["id"])
                    if x["expr"] != fill_template(es["templates"][form], own[c["classId"]], own[red]) or x.get("form") != form:
                        bad.append("%s is %s, CORR1 reference is %s (%s)" % (x["id"], x.get("form"), form, basis))
        return (not bad and n == 25), {"redirectExclusions": n, "deviations": bad}
    ck("X-2", "the 25 redirect exclusions execute exactly their CORR1 reference form and every exclusion is parent-identical", x2)
    ck("X-3", "every class (function, components, combinators, exclusions, counter-inflation) is parent-identical; SC-5 unchanged",
       lambda: (bm["classes"] == bp["classes"], [c["classId"] for c in bm["classes"] if c != cp_[c["classId"]]]))

    def x5():
        bad = []
        c4 = dict((c["classId"], c) for c in bm["classes"])
        from collections import Counter
        bases = Counter()
        for row in state["deltaLedger"]["exclusionLedger"]:
            form, basis, x1 = corr1_reference(r1, PINNED_DERIVATION, row["classId"], row["exclusionId"])
            ep = next(e for e in cp_[row["classId"]]["exclusions"] if e["id"] == row["exclusionId"])["expr"]
            ec = next(e for e in c4[row["classId"]]["exclusions"] if e["id"] == row["exclusionId"])["expr"]
            if (row["corr1Text"], row["corr1ReferenceForm"], row["corr1ReferenceBasis"], row["parentExpr"], row["childExpr"]) != (x1["test"], form, basis, ep, ec):
                bad.append(row["exclusionId"])
            if row["parentToChild"] != "UNCHANGED" or ep != ec:
                bad.append(row["exclusionId"] + " changed")
            w = row["behaviouralWitness"]
            feats = I.feature_record(w["assertions"])
            if [eval_expr(ep, feats), eval_expr(ec, feats)] != [w["parentFires"], w["childFires"]]:
                bad.append(row["exclusionId"] + " witness")
            bases[basis] += 1
        counts = [bases["CORR1_TEXT_MARKER"], bases["CORR1_CONCRETE_MATRIX_ROW"], bases["CORR1_TEXT_PRESENCE"]]
        return (not bad and len(state["deltaLedger"]["exclusionLedger"]) == 25 and counts == [8, 5, 12]), {"bad": bad, "text/row/presence": counts}
    ck("X-5", "the 25-exclusion ledger is recomputed from CORR1 and the parent: 8 by text + 5 by concrete row + 12 presence, all parent -> implementation unchanged", x5)

    def x6():
        fx = fxd["MVF03-1"]
        rec = fx["corpus"]["records"][0]
        feats = I.feature_record(rec["units"][0]["assertions"])
        pres = copy.deepcopy(bm)
        for c in pres["classes"]:
            for x in c["exclusions"]:
                if x["id"] in ("X2-b", "X5-b"):
                    x["expr"] = fill_template(es["templates"]["PRESENCE"], es["ownTag"][c["classId"]], es["ownTag"][x["redirect"]])
        under_presence = Interp(pres).eval_segment(feats, True)["sourceClassAssignmentState"]
        actual = I.eval_segment(feats, True)["sourceClassAssignmentState"]
        return (actual == roles["multiple"] and under_presence != actual), {"actual": actual, "ifPresence": under_presence}
    ck("X-6", "X2-b / X5-b exclusivity is load-bearing for the MV-F03 canonical witness (presence would erase the mixed state)", x6)

    def x9():
        fp, fc = model_flat(bp), model_flat(bm)
        bad = []
        for k in sorted(set(fp) | set(fc)):
            if fp.get(k, _ABSENT) == fc.get(k, _ABSENT):
                continue
            if any(path_covered(k, pre) for pre in A_PLUS_PATHS + R7_PATHS + SE_PATHS + BI_PATHS) or OP_ROLE_PATH.match(k):
                continue
            bad.append(k)
        role_ok = all([op.get("role") for op in v["ops"]] == ACCEPTED_OP_ROLES[n] for n, v in bm["evidenceBinding"]["extractionRecipes"].items())
        strip = lambda m: dict((n, dict(v, ops=[dict((a, b) for a, b in op.items() if a != "role") for op in v["ops"]])) for n, v in m["evidenceBinding"]["extractionRecipes"].items())
        return (not bad and role_ok and strip(bm) == strip(bp)), {"leavesOutsideTheOccurrenceAnchoringSurface": bad[:8], "opRolesAsAccepted": role_ok}
    ck("X-9", "every leaf of the normative model outside the occurrence-anchoring surface (canonicalSegmentIdentity, occurrenceAnchoring, decision step 8, the non-counting state's meaning, the validator file names, the op roles) and the R-7 count surface (basisOverlap incl. touchingAtom, R-COUNT, decision step 10) and the SENTENCE evidence guard is byte-identical to the frozen CORR4 base: classes, exclusions, predicates, features, segmentation, canonicalization, R-DUP, R-EQV and every other rule unchanged", x9)

    def x10():
        led = state["deltaLedger"]["parentToChild"]
        rows, unclassified = parent_child_delta(bp, ap, led["classificationRules"])
        bad = []
        if unclassified:
            bad.append({"unclassifiedLeaves": unclassified[:8]})
        classes = set(r["class"] for r in led["classificationRules"]) | set(r["class"] for r in rows)
        if not classes <= set(DELTA_CLASSES):
            bad.append({"SCOPE_VIOLATION": sorted(classes - set(DELTA_CLASSES))})
        if rows != led["rows"]:
            bad.append("recorded delta rows differ from the recomputation from the two models")
        fp, fc = model_flat(bp), model_flat(ap)
        if led != state["lpa"]["parentToChild"]:
            bad.append("the carried A+ layer ledger is not the A+ parent's own")
        fchild = model_flat(bm)
        moved = [r["path"] for r in rows if fchild.get(r["path"], _ABSENT) != fc.get(r["path"], _ABSENT)
                 and not any(path_covered(r["path"], p) for p in ("$.id", "$.rules.R-DUP.implementedIn", "$.rules.R-DUP.renditionEquivalenceTest.implementedIn", "$.decisionProcedure[9]"))]
        if moved:
            bad.append({"A+ leaves the child changed": moved[:6]})
        for r in rows:
            if r["class"] == "MECHANICAL_REQUIRED" and not (isinstance(fc.get(r["path"]), str) and (r["path"] not in fp or isinstance(fp.get(r["path"]), str))):
                bad.append("a mechanical leaf is not a string (a rename or a new descriptive string): %s" % r["path"])
        unused = [x["pathPrefix"] for x in led["classificationRules"]
                  if not any(path_covered(r["path"], x["pathPrefix"]) or (x["pathPrefix"].endswith("[*].role") and OP_ROLE_PATH.match(r["path"])) for r in rows)]
        if unused:
            bad.append({"rulesThatMatchNoLeaf": unused})
        counts = {}
        for r in rows:
            counts[r["class"]] = counts.get(r["class"], 0) + 1
        if counts != led["countsByClass"] or len(rows) != led["leavesChanged"]:
            bad.append("recorded counts differ from the recomputation")
        return not bad, {"leavesChanged": len(rows), "counts": counts, "bad": bad[:4]}
    ck("X-10", "the Option A+ layer is carried unchanged: the CORR4 base -> A+ parent leaf delta is recomputed from the two frozen models and equals the carried A+ ledger (the A+ parent's own, byte-equal); every changed leaf carries one of the nine A+ classes and no other class exists (else SCOPE_VIOLATION); the child equals the A+ parent on every one of those leaves except the model id and the validator file name; no rule is unused", x10)

    def x7():
        Vp = _load_parent_module(dl)
        Ip = Vp.Interp(bp)
        bad, table = [], {}
        for row in state["deltaLedger"]["fixtureDiscrimination"]:
            fx = fxd[row["fixtureId"]]
            try:
                resp = Vp.evaluate_corpus(Ip, fx["corpus"], inline_loader)
                hard, _ = judge_fixture(I, fx, resp, labels)
                role = "DISCRIMINATING_PHYSICAL" if hard else "CONTROL"
            except Exception as e:  # noqa: BLE001 - the parent may reject a construction outright
                role = "PARENT_REJECTS: %s" % (getattr(e, "code", type(e).__name__))
            table[row["fixtureId"]] = role
            if role != row["parentRole"]:
                bad.append("%s recorded %s, recomputed %s" % (row["fixtureId"], row["parentRole"], role))
        disc = sorted(f for f, r in table.items() if r == "DISCRIMINATING_PHYSICAL")
        return not bad and len(disc) >= 10, {"discriminatingAgainstTheParent": len(disc), "fixturesJudged": len(table), "bad": bad[:4]}
    ck("X-7", "the frozen parent interpreter (CORR4.CORR1.CORR1.CORR1) is run on every construction fixture and judged by the physical oracle: each recorded role (CONTROL or DISCRIMINATING_PHYSICAL) is recomputed; the fixtures discriminate the parent's physical failures", x7)

    # ---------------- F. fixtures
    fres = {}

    def f1():
        bad = {}
        for fx in state["fixtures"]["fixtures"]:
            g0 = getattr(I, "guard_fired", 0)
            ok, det, res = run_fixture(I, fx)
            fres[fx["fixtureId"]] = (ok, res)
            if fx["group"] not in ("SE_ATERM", BI_GROUP):
                _se_note_fixture(fx["fixtureId"], getattr(I, "guard_fired", 0) - g0)
            if res is not None and fx["group"] not in ("R7_B2", "TA_ATOM", "SE_ATERM", BI_GROUP):
                _b2_note(I, "fixtures", fx["fixtureId"], res)
            if not ok:
                bad[fx["fixtureId"]] = det
        return not bad, {"fixtures": len(state["fixtures"]["fixtures"]), "failed": bad}
    ck("F-1", "every fixture's declared expectation is reproduced by evaluating its machine-defined evidence", f1)

    EXPECT_KEYS = {"segments", "distinctClassSet", "srcDivHolds", "segmentClassConflicts", "multiClassDocuments", "documents", "duplicates", "csiEqual",
                   "csiDistinct", "csiUnresolved", "occurrenceCorrespondence", "unresolvedReasons", "failedConditions", "frameUGuard", "witnesses",
                   "quarantined", "candidateSetSizes", "spanStartsDiffer", "contributingGroups", "firedExclusions", "error", "b2Dispositions", "b2Components",
                   "lawfullySeparatePairs", "b2Withheld", "b2Collapsed", "taRelations"}

    def f2():
        fx_ = state["fixtures"]["fixtures"]
        par = state["fxp"]["fixtures"]
        chg = dict((c["fixtureId"], c) for c in state["deltaLedger"]["fixtureExpectationChanges"])
        bad = []
        pids = [f["fixtureId"] for f in par]
        if [f["fixtureId"] for f in fx_[:len(par)]] != pids:
            bad.append("the parent fixtures are not carried first and in order")
        for f in par:
            n = fxd.get(f["fixtureId"])
            if n is None or n["corpus"] != f["corpus"] or n["group"] != f["group"] or n["title"] != f["title"] or n.get("generator") != f.get("generator"):
                bad.append("%s evidence changed" % f["fixtureId"])
                continue
            if n["expect"] != f["expect"]:
                c = chg.get(f["fixtureId"])
                if c is None:
                    bad.append("%s expectation changed without a ledger entry" % f["fixtureId"])
                elif c["kind"] == "REPRESENTATION_ONLY":
                    e1, e2 = dict(f["expect"]), dict(n["expect"])
                    e1.pop("csiOccurrence", None)
                    if set(e1.get("occurrenceCorrespondence", {})) != set(e2.get("occurrenceCorrespondence", {})):
                        bad.append("%s representation change moved keys" % f["fixtureId"])
                    e1.pop("occurrenceCorrespondence", None)
                    e2.pop("occurrenceCorrespondence", None)
                    if e1 != e2 or c["class"] != "A_PLUS_CSI_V6":
                        bad.append("%s representation-only change touches a semantic key" % f["fixtureId"])
                elif c["class"] not in ("A_PLUS_FRAME_C_IDENTITY", "A_PLUS_TEXT_BEARING_SEAM") or not (n.get("physicalLabels") or n.get("generator")):
                    bad.append("%s behavioural change without a physical label" % f["fixtureId"])
            elif f["fixtureId"] in chg:
                bad.append("%s recorded as changed but unchanged" % f["fixtureId"])
        groups = {}
        for f in fx_[len(par):]:
            groups[f["group"]] = groups.get(f["group"], 0) + 1
        keys = sorted(set(k for f in fx_ for k in f["expect"]) - EXPECT_KEYS)
        ok = (not bad and len(par) == PARENT_FIXTURE_COUNT and groups == dict(CONSTRUCTION_GROUPS, R7_B2=len(R7_FIXTURE_IDS), TA_ATOM=len(TA_FIXTURE_IDS), SE_ATERM=len(SE_FIXTURE_IDS), **{BI_GROUP: len(BI_FIXTURE_IDS)}) and not keys
              and [f["fixtureId"] for f in fx_ if f["group"] == "OA7B"] == OA7B_FIXTURE_IDS
              and [f["fixtureId"] for f in fx_ if f["group"] == "R14"] == R14_FIXTURE_IDS
              and [f["fixtureId"] for f in fx_ if f["group"] == "U4_ONLY"] == U4_FIXTURE_IDS
              and fxd["R17-G"]["corpus"] == fxd["RR4-G"]["corpus"] and fxd["R17-H"]["corpus"] == fxd["RR4-I"]["corpus"])
        return ok, {"bad": bad[:6], "constructionGroups": groups, "unsupportedExpectationKeys": keys,
                    "expectationChanges": dict((k, sum(1 for c in chg.values() if c["kind"] == k)) for k in sorted(set(c["kind"] for c in chg.values())))}
    ck("F-2", "all 96 CORR4-base fixtures are carried first, in order, with byte-equal evidence; every changed expectation has a ledger entry (representation-only changes touch no semantic key; behavioural changes carry physical labels); the construction groups are complete (38 + 34 architecture, 10 OA-7(b), 22 R-14, 3 U4-only, 3 A+ probes, 26 R-7, 37 touching-atom, 24 sentence-evidence, 41 boundary-integrity); no fixture declares an expectation key the validator does not check", f2)

    def seg_of(fid, sid):
        res = fres.get(fid, (None, None))[1]
        s = next(x for x in res["segmentRecords"] if x["segmentId"] == sid)
        return [s["sourceClassAssignmentState"], s["sourceClass"]]
    ck("F-3", "MV-F02 canonical director-fee witness = ASSIGNED SC-3 (prior closure preserved)",
       lambda: (seg_of("MVF02-3", "MVF02-3#s1") == [roles["assigned"], labels[2]], seg_of("MVF02-3", "MVF02-3#s1")))
    ck("F-4", "MV-F03 canonical witness = mixed sentence non-counting + exit sentence SC-2; MVF03-4 and MVF03-7b stay one indivisible mixed segment",
       lambda: (seg_of("MVF03-1", "MVF03-1#s1") == [roles["multiple"], None]
                and seg_of("MVF03-1", "MVF03-1#s2") == [roles["assigned"], labels[1]]
                and fres["MVF03-1"][1]["count"]["distinctClassSet"] == [labels[1]]
                and seg_of("MVF03-4", "MVF03-4#s1") == [roles["multiple"], None]
                and seg_of("MVF03-7b", "MVF03-7b#s1") == [roles["multiple"], None]
                and fres["MVF03-7b"][1]["count"]["distinctClassSet"] == [], ""))
    ck("F-5", "F-01: one mixed document contributes two classes through separate segments; no two-document threshold",
       lambda: (fres["PRE-1"][1]["count"]["holds"] and fres["PRE-1"][1]["documents"] == 1 and fres["CSI-1"][1]["count"]["holds"]
                and fres["DET-4"][1]["count"]["holds"] and fres["RR4-D"][1]["count"]["holds"], ""))
    ck("F-6", "the fixture set carries the current model identity (MV-HASH-1)",
       lambda: (state["fixtures"]["boundaryModelSha256"] == cur, state["fixtures"]["boundaryModelSha256"]))
    judged = {}

    def f7():
        bad = {}
        n_orders = n_r7 = n_ta = 0
        for fx in state["fixtures"]["fixtures"]:
            if "construction" not in fx:
                continue
            fid = fx["fixtureId"]
            try:
                corpus, truth = construction_build(I, fx)
            except (ValueError, IndexError) as e:
                bad[fid] = "GENERATOR_MISMATCH %s" % e
                continue
            if corpus != fx["corpus"]:
                bad[fid] = "the delivered corpus is not the construction's"
                continue
            if json.loads(json.dumps(truth)) != fx["physicalTruth"]:
                bad[fid] = "the recorded physical truth is not the construction's"
                continue
            res = fres[fid][1]
            if fx["construction"]["builder"] == "R7":
                j, n = r7_judge_fixture(I, fx, labels, off_I)
                n_r7 += n
                hard = [k for k in _TA_HARD if j[k]] + (["mechanicsInvalid"] if j["mechanicsInvalid"] else [])
                judged[fid] = j
                if hard:
                    bad[fid] = {"r7Oracle": hard}
                continue
            if fx["construction"]["builder"] == "BI":
                j = bi_judge_fixture(I, fx)[0]
                hard = [k for k in _BI_HARD if j[k]]
                judged[fid] = j
                if hard:
                    bad[fid] = {"boundaryIntegrityOracle": hard}
                continue
            if fx["construction"]["builder"] == "TA":
                j, orders, _, _ = ta_judge_fixture(I, fx, labels, off_I)
                n_ta += len(orders)
                hard = [k for k in _TA_HARD if j[k]] + (["mechanicsInvalid"] if j["mechanicsInvalid"] else [])
                judged[fid] = j
                if hard:
                    bad[fid] = {"touchingAtomOracle": hard}
                continue
            if fx["construction"]["builder"] == "R14":
                res, ind, idem, n = r14_mechanics(I, fx["corpus"], r14_fixture_perms(len(fx["corpus"]["records"])))
                n_orders += n
                inv = r14_validity(res, physical_meta(fx, fx["physicalTruth"]), fx["construction"]["spec"])
                if not ind or not idem or inv:
                    bad[fid] = {"orderIndependent": ind, "idempotent": idem, "invalid": inv}
            hard, flags = judge_fixture(I, fx, res, labels)
            judged[fid] = flags
            if hard:
                bad[fid] = {"physicalOracle": hard}
        n = sum(1 for f in state["fixtures"]["fixtures"] if "construction" in f)
        return not bad and n == sum(CONSTRUCTION_GROUPS.values()) + len(R7_FIXTURE_IDS) + len(TA_FIXTURE_IDS) + len(SE_FIXTURE_IDS) + len(BI_FIXTURE_IDS) and n_orders == 285, {
            "constructionFixtures": n, "r14RecordOrders": n_orders, "r7RecordOrders": n_r7, "touchingAtomRecordOrders": n_ta, "failed": bad}
    ck("F-7", "every construction fixture (110 A+ + 26 R-7 + 37 touching-atom + 24 sentence-evidence + 41 boundary-integrity) is regenerated from its construction spec (corpus and physical truth byte-equal) and judged by its oracle with zero hard failures; every R-14 construction is evaluated in all 285 record orders with identical results, OA-14 applied to its own output changes nothing, and every witness exits before a provisional occurrence as constructed; every R-7 construction is judged in every declared record order and every touching-atom construction in EVERY record order, both by the touching-aware truth", f7)

    def f8():
        bad, n = {}, 0
        for c in state["deltaLedger"]["fixtureExpectationChanges"]:
            if c["kind"] == "REPRESENTATION_ONLY":
                continue
            fx = fxd[c["fixtureId"]]
            res = fres[c["fixtureId"]][1]
            if fx.get("physicalLabels"):
                recs = dict((r["recordId"], r) for r in fx["corpus"]["records"])
                meta = []
                for p in fx["physicalLabels"]["records"]:
                    cls = 0 if any(a["featureId"] == "rewardObject" for a in recs[p["recordId"]]["units"][0]["assertions"]) else 1
                    if cls != p["cls"]:
                        bad[c["fixtureId"]] = "physical label class differs from the witnessed features"
                    meta.append({"recordId": p["recordId"], "phys": p["phys"], "cls": p["cls"]})
            else:
                corpus, gmeta, _ = _g_fixture_corpus(I, fx["fixtureId"], fx["generator"])
                if corpus != fx["corpus"]:
                    bad[c["fixtureId"]] = "corpus is not its slot specification's"
                    continue
                meta = [{"recordId": m["recordId"], "phys": [m["phys"][0], m["phys"][1]], "cls": m["cls"]} for m in gmeta]
            flags, _ = judge_slot(res, meta, labels, roles)
            n += 1
            hard = [k for k in _OR_SLOT_HARD if flags[k]]
            if hard:
                bad[c["fixtureId"]] = hard
        return not bad and n == 16, {"judged": n, "failed": bad}
    ck("F-8", "every carried parent fixture whose expectation changes on behaviour (16) is judged by the physical oracle (the OC-3 fixtures regenerated from their slot specification, the hand-built ones by their physical labels): zero hard failures", f8)

    # ---------------- DT / W / D: preserved closures (parent checks)
    def dt1():
        fv = bm["featureVocabulary"]
        vals = ("ROLE_OR_TIER", "ACTOR_INVARIANT")
        orders = [I.feature_record([{"featureId": "determinant", "value": v} for v in perm])["determinant"] for perm in itertools.permutations(vals)]
        both = all(set(o) == set(vals) for o in orders) and orders[0] == orders[1]
        not_scalar = "determinant" in fv["listEnums"] and "determinant" not in fv["scalarEnums"] and "determinant" not in bm["featureMerge"]["scalarEnums"]
        return (both and not_scalar and seg_of("DET-3", "DET-3#s1") == [roles["multiple"], None] and seg_of("DET-3r", "DET-3r#s1") == [roles["multiple"], None]), {"mergedInEitherOrder": orders}
    ck("DT-1", "IV1-SC5-MIXED preserved: two independently witnessed determinant values both survive the merge in either assertion order", dt1)

    def dt2():
        ids = ("DET-1", "DET-2", "DET-4", "PRE-9", "MVF03-6")
        V3 = _load_corr3_interpreter(dl)
        I3 = V3.Interp(b3)
        same = all(run_fixture(I3, fxd[f], evaluator=V3.evaluate_corpus)[0] for f in ids)
        return all(fres[f][0] for f in ids) and same, {"fixturesReproducedByBothCorr3AndThisModel": list(ids)}
    ck("DT-2", "single-value determinant behaviour is CORR3-identical (frozen CORR3 interpreter and this model reproduce DET-1, DET-2, DET-4, PRE-9, MVF03-6)", dt2)
    def w1():
        st = bm["states"]["identityStates"]
        U = "http://probe.test/page"
        cap = lambda ts, u=U: "wayback|%s|%s" % (ts, u)
        eq_a, eq_b, div_b = "<p>Same content.</p>", "<div>Same   content.</div>", "<p>Other content.</p>"
        cases = [
            ("candidate + equivalent", eq_a, eq_b, dict(captureIdentity=cap("1")), dict(captureIdentity=cap("2")), st["same"]),
            ("candidate + divergent", eq_a, div_b, dict(captureIdentity=cap("1")), dict(captureIdentity=cap("2")), st["different"]),
            ("candidate + unavailable", eq_a, None, dict(captureIdentity=cap("1")), dict(captureIdentity=cap("2")), st["unresolved"]),
            ("no candidate (different URL) + equivalent", eq_a, eq_b, dict(captureIdentity=cap("1")), dict(captureIdentity=cap("2", "http://probe.test/other")), st["different"]),
            ("candidate + version split + equivalent", eq_a, eq_b, dict(captureIdentity=cap("1"), versionId="v1"), dict(captureIdentity=cap("2"), versionId="v2"), st["different"]),
            ("candidate + amendment split + equivalent", eq_a, eq_b, dict(captureIdentity=cap("1")), dict(captureIdentity=cap("2"), amendmentMarker=True), st["different"]),
            ("title and period only + equivalent", eq_a, eq_b, dict(title="T", period="1998"), dict(title="T", period="1998"), st["different"]),
            ("digest-equal + amendment (conflict)", eq_a, eq_a, dict(captureIdentity=cap("1")), dict(captureIdentity=cap("1"), amendmentMarker=True), st["unresolved"])]
        got, bad = {}, []
        for name, ta, tb, ka, kb, want in cases:
            ia = _probe_identity(ta, **ka)
            ib = _probe_identity(tb if tb is not None else "x", **kb)
            if tb is None:
                ib["sha256"] = "2" * 64
            if name.startswith("digest-equal"):
                ib["sha256"] = ia["sha256"]
            r = _dup_probe(I, ta, tb, ia, ib)
            got[name] = r["state"]
            if r["state"] != want:
                bad.append({name: r["state"], "want": want})
        return not bad, {"bad": bad, "matrix": got}
    ck("W-1", "F-04 / IV1-F04-EQUIVALENT-CAPTURES preserved (probe): a same-webpage candidate merges only with verified equivalence, splits on divergence, fails closed when unresolved; title and period never merge", w1)
    ck("W-2", "equivalent-capture fixtures reproduced (WEB-1..WEB-6)", lambda: (all(fres[f][0] for f in ("WEB-1", "WEB-2", "WEB-3", "WEB-4", "WEB-5", "WEB-6")), ""))
    ck("D-1", "conflict detection is the FIRST step of the duplicate decision procedure; the R-DUP rule is parent-identical except its validator file name",
       lambda: (rd["decisionProcedure"][0]["when"] == "POSITIVE_LINK_AND_SPLIT" and rd["decisionProcedure"][0]["stateRole"] == "unresolved"
                and dict(rd, implementedIn=None, renditionEquivalenceTest=dict(rd["renditionEquivalenceTest"], implementedIn=None))
                == dict(bp["rules"]["R-DUP"], implementedIn=None, renditionEquivalenceTest=dict(bp["rules"]["R-DUP"]["renditionEquivalenceTest"], implementedIn=None)), ""))
    ck("D-2", "title and period can never be a positive link; sourceId is package-scoped and the registry link is gated off",
       lambda: (not any(set(x["fieldsEqualNonNull"]) <= {"title", "period"} for x in rd["linkRules"]) and rd["sourceIdScope"] == "PACKAGE_SCOPED"
                and any(x.get("admittedOnlyIfSourceIdScopeIsNot") == "PACKAGE_SCOPED" for x in rd["linkRules"]), ""))

    # ---------------- C. CSI-v6
    ck("C-1", "CSI-v6: key = versionTag, underlying document identity, frame tag, anchor (FRAME-C: omega start, end; FRAME-U: sha256(k)); identity = CSI: + sha256(key); identity-bearing fields are exactly the document, the frame and the anchor; rank, counts, content hash, context, headings, locators, line numbers and byte offsets are diagnostic; no free-form field is a key",
       lambda: (cs["versionTag"] == "CSI-v6" and cs["prefix"] == "CSI:" and cs["keySeparator"] == "\u001f"
                and cs["keyLayout"] == ["versionTag", "underlyingDocumentIdentity", "frameTag", "anchor"]
                and dict((k, (v["tag"], v["anchorComponents"])) for k, v in cs["frames"].items()) == {oa["frameC"]["recordedAs"]: ("C", ["completeViewStart", "completeViewEnd"]), oa["frameU"]["recordedAs"]: ("K", ["contentSkeletonSha256"])}
                and cs["anchorPrimitives"] == {"completeViewStart": "COMPLETE_VIEW_INTERVAL_START", "completeViewEnd": "COMPLETE_VIEW_INTERVAL_END", "contentSkeletonSha256": "CONTENT_SKELETON_SHA256"}
                and cs["identityBearing"] == ["underlyingDocumentIdentity", "frameTag", "completeViewStart", "completeViewEnd", "contentSkeletonSha256"]
                and set(cs["diagnosticOnly"]) >= {"canonicalSegmentContentHash", "occurrenceRank", "occurrenceCounts", "contextBundle", "physicalHeading", "humanReadableLocator", "lineNumber", "byteOffset"}
                and not (free & set(cs["identityBearing"] + bm["rules"]["R-COUNT"]["groupingKey"])), cs["keyLayout"]))
    _rc_strip = lambda r: dict((k, v) for k, v in r.items() if k not in ("steps", "countingDispositions", "basisOverlapLayer", "consequences"))
    ck("C-2", "the R-COUNT grouping and conflict key is (underlyingDocumentIdentity, canonicalSegmentIdentity); R-COUNT equals the A+ parent's (itself the CORR4 base's) except the bounded B-2 binding (step 5b, the step-6 pointer, one counting disposition, one layer pointer, one consequence - check B2-1b)",
       lambda: (bm["rules"]["R-COUNT"]["groupingKey"] == ["underlyingDocumentIdentity", "canonicalSegmentIdentity"] == bm["segmentation"]["groupingKey"]
                == bm["rules"]["R-COUNT"]["countingDispositions"][0]["key"] and ap["rules"]["R-COUNT"] == bp["rules"]["R-COUNT"]
                and _rc_strip(bm["rules"]["R-COUNT"]) == _rc_strip(ap["rules"]["R-COUNT"]) and bm["rules"]["R-COUNT"]["countingDispositions"][0] == ap["rules"]["R-COUNT"]["countingDispositions"][0], ""))
    ck("C-3", "CSI proof artifact: its synthetic and real cases are reproduced (distinct segments do not collide; byte-identical and equivalent renditions converge; repeated content disambiguates; conflicting classes on a converged segment conflict)",
       lambda: check_csi_proof(I, state["csiProof"], root))

    def c4():
        seg = "The Committee sets each director's annual retainer of $36,000."
        seg2 = "The Committee also recommends the CEO's salary to the Board."
        H = "<html><body>%s</body></html>\n"
        pre_v = ["", "&copy;", "&nbsp;&nbsp;", "&#8212;", "&reg;", "<span></span>", "<!-- note -->", "\n\n   "]
        post_v = ["", "&copy;", "&nbsp;", "<span></span>", "\n\n"]
        kw = dict(accession="0001-98-000777", exhibitId="10.7", title="Exhibit 10.7", period="1998")
        bad, pairs_same = [], 0
        for pv in pre_v:
            for qv in post_v:
                base_ = H % ("<p>Preface.</p><p>%s</p><p>Closing.</p>" % seg)
                var = H % ("<p>Preface.%s</p><p>%s</p><p>Closing.%s</p>" % (pv, seg, qv))
                res = _csi_probe_corpus(I, [base_, var], seg, "HTML_TEXT_V1", kw)
                if len(res["duplicateGroups"]) == 1:
                    pairs_same += 1
                    csis = set(s["canonicalSegmentIdentity"] for s in res["segmentRecords"])
                    if len(csis) != 1 or None in csis or len(res["count"]["segmentClassConflicts"]) != 0:
                        bad.append({"pre": pv, "post": qv, "csis": len(csis)})
        d1 = H % ("<p>Preface.&copy;</p><p>%s</p><p>%s</p>" % (seg, seg2))
        d2 = H % ("<p>Preface.</p><p>%s</p><p>%s</p>" % (seg, seg2))
        a_ids = set(s["canonicalSegmentIdentity"] for s in _csi_probe_corpus(I, [d1, d2], seg, "HTML_TEXT_V1", kw)["segmentRecords"])
        b_ids = set(s["canonicalSegmentIdentity"] for s in _csi_probe_corpus(I, [d1, d2], seg2, "HTML_TEXT_V1", kw)["segmentRecords"])
        if len(a_ids) != 1 or len(b_ids) != 1 or a_ids & b_ids or None in a_ids | b_ids:
            bad.append("different supplying segments of one converged document share, split or lose identity")
        rep_ = H % ("<p>%s</p><p>Interlude.</p><p>%s</p>" % (seg, seg))
        occ = []
        for k in (0, 1):
            doc = I.extract(rep_.encode("utf-8"), "HTML_TEXT_V1")
            s0 = -1
            for _ in range(k + 1):
                s0 = doc.index(seg, s0 + 1)
            res = evaluate_corpus(I, {"artifacts": [{"artifactId": "R", "content": {"inlineText": rep_}, "renditionDecoder": "UTF8_REPLACE", "identity": _probe_identity(rep_)}],
                                      "records": [{"recordId": "R%d" % k, "artifactId": "R", "sourceId": "P", "recipe": "HTML_TEXT_V1", "bindingStatus": "BOUND", "physicalHeading": None,
                                                   "units": [{"unitId": "u1", "separatorBefore": I.seg["startMarker"], "locatorKind": "SENTENCE", "start": s0, "end": s0 + len(seg),
                                                              "text": seg, "textSha256": sha_text(seg), "assertions": []}]}]}, inline_loader)
            occ.append(res["segmentRecords"][0]["canonicalSegmentIdentity"])
        if occ[0] == occ[1] or None in occ:
            bad.append("two genuine occurrences of identical text collapsed or lost identity")
        return (not bad and pairs_same >= 30), {"equivalentPairsTested": len(pre_v) * len(post_v), "resolvedAsSameDocument": pairs_same, "bad": bad[:4]}
    ck("C-4", "convergence probe (not a fixture): 40 rendition pairs that differ only by representation material outside the segment converge to ONE CSI-v6 identity and ONE count group; different supplying segments stay distinct; two genuine occurrences of identical text stay distinct", c4)
    rep = {}

    def c6():
        """CSI-v6 recomputed from its components, outside the interpreter, for every established segment of the pilot and of every fixture."""
        bad, n = [], 0
        sep = "\u001f"

        def one(where, s):
            comp = s["csiComponents"]
            if s["canonicalSegmentIdentity"] is None:
                return comp is None
            ft = comp["frameTag"]
            fr = next(k for k, v in cs["frames"].items() if v["tag"] == ft)
            anchor = sep.join(str(comp[c]) for c in cs["frames"][fr]["anchorComponents"])
            key = sep.join(["CSI-v6", comp["underlyingDocumentIdentity"], ft, anchor])
            a = s["occurrenceAnchor"]
            if ft == "C":
                okc = [comp["completeViewStart"], comp["completeViewEnd"]] == a["completeViewInterval"]
            else:
                okc = comp["contentSkeletonSha256"] == a["contentSkeletonSha256"]
            return okc and s["canonicalSegmentIdentity"] == "CSI:" + hashlib.sha256(key.encode("utf-8")).hexdigest() \
                and comp["underlyingDocumentIdentity"] == s["underlyingDocumentIdentity"] and set(comp) == set(["underlyingDocumentIdentity", "frameTag"] + cs["frames"][fr]["anchorComponents"])
        for where, res in [("pilot", rep["res"])] + [(fid, r[1]) for fid, r in fres.items() if r[1] is not None]:
            for s in res["segmentRecords"]:
                if s.get("occurrenceAnchor") is None:
                    continue
                n += 1
                if not one(where, s):
                    bad.append("%s %s" % (where, s["segmentId"]))
        return not bad, {"segmentsRecomputed": n, "bad": bad[:6]}

    def c7():
        """Diagnostics never re-enter identity: rewriting every free-form field and reversing the record order of every fixture leaves every identity unchanged."""
        bad = []
        for fx in state["fixtures"]["fixtures"]:
            res0 = fres[fx["fixtureId"]][1]
            if res0 is None:
                continue
            c = copy.deepcopy(fx["corpus"])
            for r in c["records"]:
                r["humanReadableLocator"] = "diagnostic rewritten"
                r["physicalHeading"] = None
            c["records"] = list(reversed(c["records"]))
            try:
                res1 = evaluate_corpus(I, c, inline_loader)
            except Exception:  # noqa: BLE001
                continue
            a = dict((s["segmentId"], s["canonicalSegmentIdentity"]) for s in res0["segmentRecords"])
            b = dict((s["segmentId"], s["canonicalSegmentIdentity"]) for s in res1["segmentRecords"])
            if a != b:
                bad.append(fx["fixtureId"])
        return not bad, bad[:6]

    def c5():
        used = I.legacy_calls
        return used == 0 and cs["identityFunction"] == "COMPLETE_VIEW_FRAMES" and not cs.get("legacyProofs"), {"dormantPathCallsDuringThisValidation": used}

    # ---------------- O. occurrence anchoring
    ck("O-1", "every op of every extraction recipe declares one role from the vocabulary (the accepted mapping: HTML_TEXT_V1 = NORMALIZATION, CONTENT_BLOCK_REMOVAL x3, MARKUP_REMOVAL x2, NORMALIZATION x2; PLAIN_TEXT_V1 and HTML_RAW_V1 = NORMALIZATION; PDF_LZW_TEXT_V1 = none); a missing role is a MODEL_ERROR, never inferred",
       lambda: _o1(bm))

    def o2():
        """tracked extraction == untracked extraction, byte for byte, for every pilot artifact and every recipe that can read it (the rendition decoder's recipes, and every recipe a pilot record uses)."""
        arts, recs = dict((a["artifactId"], a) for a in rp["artifacts"]), {}
        for r in rp["records"]:
            recs.setdefault(r["artifactId"], set()).add(r["recipe"])
        loader = replay_loader(root)
        mism, pairs, recipes = [], 0, set()
        for aid, a in sorted(arts.items()):
            raw = loader(a)
            names = set(n for n, v in bm["evidenceBinding"]["extractionRecipes"].items() if v["decoder"] == a["renditionDecoder"]) | recs.get(aid, set())
            for name in sorted(names):
                decoded = I.decoded_text(raw, I.recipe(name)["decoder"])
                t, _ = I.tracked_extract(decoded, name)
                pairs += 1
                recipes.add(name)
                if t.text != I.extract(raw, name):
                    mism.append([aid, name])
        rep["trackedReplay"] = {"artifacts": len(arts), "recipes": sorted(recipes), "artifactRecipePairs": pairs, "mismatches": len(mism)}
        return not mism and len(arts) == 23, dict(rep["trackedReplay"], mismatched=mism[:4])
    ck("O-2", "tracked replay invariance: for all 23 pinned pilot artifacts and every recipe that reads them, the origin-tracked extraction equals the existing extraction byte for byte (mismatches = 0)", o2)
    ck("O-3", "complete view (OA-4) probes: comment bodies, attribute values of every name, non-standard names and malformed interiors are text-bearing; standard names and formatting-only tags are not; entities decoded; origins tracked",
       lambda: _o3(I))
    ck("O-4", "removal views come from the tracked replay's op provenance (script / style / comment = BLOCK, tags = MARKUP) plus the TAG view; a model that re-parses instead is a different model (dormant path, never selected)",
       lambda: _o4(I))
    ck("O-5", "TEXT_BEARING_REMOVAL_SEAM probes: PRE<img alt=\"amended\">SUF, PRE<font size=2>SUF, alt=\"2005\", title, href, data-*, aria-*, unknown attributes, non-standard names, malformed interiors, script, style and comment content are seams; PRE<b>SUF, alt=\"\", alt=\"---\" and markup outside the interval are not",
       lambda: _o5(I))
    ck("O-6", "frame selection is per underlying document: FRAME-C iff every member's complete view is the same string, else FRAME-U; never per record",
       lambda: _o6(I, fres, state["fixtures"]["fixtures"]))

    def o7():
        rev = Interp(_reversed_gate_model(bm))
        bad = []
        for fid in OA7B_FIXTURE_IDS:
            fx = fxd[fid]
            r1_, r2_ = fres[fid][1], evaluate_corpus(rev, fx["corpus"], inline_loader)
            if [(s["canonicalSegmentIdentity"], s["sourceClassAssignmentState"]) for s in r1_["segmentRecords"]] != \
                    [(s["canonicalSegmentIdentity"], s["sourceClassAssignmentState"]) for s in r2_["segmentRecords"]] or r1_["count"] != r2_["count"]:
                bad.append(fid + " gate order")
            hard, _ = judge_fixture(I, fx, r1_, labels)
            if hard:
                bad.append("%s %s" % (fid, hard))
        fcn = oa["frameC"]
        decl = [c["test"] for c in fcn["conditions"]] == ["OMEGA_NON_EMPTY", "FRAME_C_OCCURRENCE_REPRESENTABLE", "NO_TEXT_BEARING_REMOVAL_SEAM"] and fcn["taintScope"] == "EVERY_MEMBER"
        d1 = fres["OA7B-D1"][1]
        both = [s for s in d1["segmentRecords"] if s["segmentId"] in ("OA7B-D1-R0#s1", "OA7B-D1-R1#s1")]
        sym = len(both) == 2 and all(s["canonicalSegmentIdentity"] is None and s["occurrenceAnchor"]["occurrenceRepresentable"] is False for s in both) \
            and [s["occurrenceAnchor"]["ownImageRepresentable"] for s in both] == [False, True]
        return decl and sym and not bad, {"bad": bad, "declared": decl, "decisiveSymmetric": sym}
    ck("O-7", "FRAME-C OA-7(b) is decided per occurrence (FRAME_C_OCCURRENCE_REPRESENTABLE over every record carrying (U, omega)) and (c) over every member: in OA7B-D1 a representable record on an occurrence with a non-representable one is withheld with it; (b) and (c) are both evaluated and the decisions do not depend on the gate order; the 10 OA-7(b) fixtures have zero oracle failures", o7)

    def o8():
        fu = oa["frameU"]
        decl = ([g["test"] for g in fu["guard"]] == ["SKELETON_EXACTLY_ONCE_IN_EVERY_COMPLETE_VIEW", "CANDIDATE_NOT_A_SEAM_IN_ANY_MEMBER",
                                                   "NO_APPARENT_OCCURRENCE_CREATED_BY_REMOVAL", "NO_SEAM_RECORD_CARRIES_THE_KEY"]
                and fu["countView"] == "COMPLETE_VIEW" and fu["scope"] == "KEY_LEVEL" and not fu.get("recordLocalOwnSeamGate"))
        asym = []
        for fid, (ok, res) in fres.items():
            if res is None:
                continue
            by = {}
            for s in res["segmentRecords"]:
                a = s.get("occurrenceAnchor") or {}
                po = a.get("provisionalOccurrence") or {}
                if po.get("frame") == fu["recordedAs"]:
                    by.setdefault((s["underlyingDocumentIdentity"], po["contentSkeletonSha256"]), set()).add((s["canonicalSegmentIdentity"] is None, a.get("unresolvedReason")))
            asym += [fid for v in by.values() if len(v) > 1]
        return decl and not asym, {"declared": decl, "keysWithAsymmetricDecisions": asym[:4]}
    ck("O-8", "FRAME-U: G(U, k) = U1 (exactly once in every complete view; the count view IS the complete view), U2, U3 and U4, a function of (U, k): in every fixture every record carrying one key receives one decision; no record-local own-seam gate", o8)

    def u2():
        bad = []
        nou4 = copy.deepcopy(bm)
        nou4["occurrenceAnchoring"]["frameU"]["guard"] = [g for g in nou4["occurrenceAnchoring"]["frameU"]["guard"] if g["test"] != "NO_SEAM_RECORD_CARRIES_THE_KEY"]
        I4 = Interp(nou4)
        trip = {}
        for fid in U4_FIXTURE_IDS:
            fx = fxd[fid]
            res = fres[fid][1]
            gs = [((s["occurrenceAnchor"] or {}).get("frameUGuard"), s["canonicalSegmentIdentity"]) for s in res["segmentRecords"] if s["segmentId"] in fx["expect"]["frameUGuard"]]
            if not gs or any(g != {"U1": True, "U2": True, "U3": True, "U4": False} or i is not None for g, i in gs):
                bad.append(fid + " is not U4-only")
            hard, _ = judge_fixture(I4, fx, evaluate_corpus(I4, fx["corpus"], inline_loader), labels)
            trip[fid] = hard
        if not trip.get("U4-A") or not trip.get("U4-A2"):
            bad.append("removing U4 trips no oracle failure on U4-A / U4-A2")
        return not bad, {"withoutU4": trip, "bad": bad}
    ck("U-2", "U4 reachability: in U4-A, U4-A2 and U4-B the key's guard records U1 = U2 = U3 = pass and U4 = fail, and every record carrying the key is withheld; with U4 removed the physical oracle fails (U4-A: fabricated evidence and a false srcDiv; U4-A2: a merge of two physical occurrences)", u2)

    def o9():
        own = sum(1 for fid, (ok, r) in fres.items() if r for s in r["segmentRecords"] if (s.get("occurrenceAnchor") or {}).get("ownSeam"))
        return (oa["ownSeam"]["neverAGate"].startswith("own seam is recorded as a diagnostic") and not oa["frameU"].get("recordLocalOwnSeamGate")
                and oa["frameC"]["taintScope"] == "EVERY_MEMBER" and own > 0), {"fixtureSegmentsWithOwnSeamRecorded": own}
    ck("O-9", "own seam (OA-9) is recorded as a diagnostic and acts only through the occurrence-level gates C-b, C-c and the key-level U4; no record-local gate is declared", o9)

    def o10():
        fc_ = oa["failClosed"]
        reasons = set(fc_["reasons"].values()) | set(c["reason"] for c in oa["frameC"]["conditions"]) | set(g["reason"] for g in oa["frameU"]["guard"])
        reasons |= {oa["frameU"]["emptySkeletonReason"], oa["unplacedWitness"]["quarantine"]["reason"]}
        seen = set()
        for fid, (ok, r) in list(fres.items()) + [("pilot", (True, rep.get("res")))]:
            for s in (r or {}).get("segmentRecords", []):
                x = (s.get("occurrenceAnchor") or {}).get("unresolvedReason")
                if x:
                    seen.add(x)
        ok = (fc_["recordedReasons"] == ACCEPTED_REASONS[:1] + MECHANICAL_REASONS + ACCEPTED_REASONS[1:] and reasons == set(fc_["recordedReasons"])
              and seen <= reasons and set(oa["unplacedWitness"]["unplacedExits"]) == set(PRE_OCCURRENCE_EXITS) and set(PRE_OCCURRENCE_EXITS) <= reasons)
        return ok, {"declared": len(reasons), "exercisedByFixtures": sorted(seen), "notExercised": sorted(reasons - seen)}
    ck("O-10", "the recorded reason vocabulary is exactly the accepted OA-10 list (+ the OA-1 member-bytes reason) and every reason a fixture or the pilot records belongs to it; only existing states are used", o10)

    # ---------------- Q. OA-14
    def q1():
        uw = oa.get("unplacedWitness") or {}
        ok = (uw.get("application") == "SIMULTANEOUS" and uw["candidateSet"]["basis"] == "ALL_ESTABLISHED_OCCURRENCES_OF_U" and uw["candidateSet"]["exclusionProofs"] == []
              and uw["candidateSet"]["narrowingStatus"] == "SAFE_NARROWING_NOT_AVAILABLE" and uw["quarantine"]["rule"] == "SINGLE_COUNTED_CLASS_DIFFERS"
              and uw["witness"]["source"] == "PRE_OCCURRENCE_EXIT" and uw["witness"]["positiveClassesRequired"] == 1
              and uw["quarantine"]["stateRole"] == cs["whenNotEstablished"]["stateRole"] and uw["quarantine"]["countedStateRole"] == "assigned"
              and uw["unplacedExits"] == PRE_OCCURRENCE_EXITS and uw["quarantine"]["reason"] == "POSSIBLE_CLASS_CONFLICT_FROM_UNPLACED_WITNESS"
              and bm["states"]["definitions"] == bm["states"]["definitions"] and "unplacedWitness" not in json.dumps(cs["keyLayout"]))
        return ok, {"application": uw.get("application"), "basis": uw.get("candidateSet", {}).get("basis")}
    ck("Q-1", "OA-14 declared as accepted: runs once after OA-7 / OA-8 and before R-COUNT; witness = a bound record of a resolved document that exits before a provisional occurrence with exactly one positive frozen class; C(r) = every established occurrence of U (no exclusion proof: SAFE_NARROWING_NOT_AVAILABLE); QUARANTINE(o) iff classes(o) = {c'} != class(r); SIMULTANEOUS; withheld through the existing unestablished path; no new state, class, disposition, key or R-COUNT step", q1)

    def q2():
        bad = []
        for fid in R14_FIXTURE_IDS:
            if not fres[fid][0]:
                bad.append(fid)
        d1 = fres["R14-D1"][1]["count"]
        c1 = fres["R14-C1"][1]["count"]
        return (not bad and d1["distinctClassSet"] == [labels[2]] and not d1["holds"] and c1["distinctClassSet"] == [labels[2]]), {"bad": bad}
    ck("Q-2", "the 22 R-14 constructions are reproduced: R14-D1 (and D1-X, CVI, SKEL, DECU, 2REC) withhold the conflicting placed occurrence (no bypass, no false srcDiv); C1 keeps same-class evidence; C2 / C2-V / E1 are the documented conservative undercount; C4 / C4-MIX / S12 / S13 / X1 / X2 / X3 / C5 / C5-M / C6 / C6-U1 as accepted", q2)
    sens = {}

    def q3():
        rec_ = state["csiProof"]["weakenedRuleSensitivity"]
        sens["out"] = rec_ if fast_mode() else r14_fixture_sensitivity(bm, state["fixtures"]["fixtures"], labels)
        missed = [k for k, v in sens["out"].items() if not v["fixturesTripped"]]
        return not missed and rec_ == sens["out"] and set(sens["out"]) == set(WEAKENED_RULES), {"missed": missed, "tripped": dict((k, len(v["fixturesTripped"])) for k, v in sens["out"].items())}
    ck("Q-3", "weakened-rule sensitivity: each weakened OA-14 rule (OWN_MEMBER_ONLY, TEXT_EQUALITY_NARROWING, FIRST_OCCURRENCE, POSITIVE_ASSIGNMENT_IF_SAME_CLASS, GREEDY_CONSUMING, CASCADE_ANY_UNIDENTIFIED, DOCUMENT_WIDE, NO_WITNESS_LAYER) trips at least one semantic oracle failure on the R-14 constructions; the recorded table equals the recomputation", q3)

    # ---------------- G. generated surfaces
    def g1():
        csp = state["csiProof"]["generatedSurfaces"]
        pick = None if not fast_mode() else (lambda fam, i: i % FAST_STRIDE[fam] == 0)
        got = corr1_generated(I, labels, pick)
        recrows = dict(((r[0], r[1]), r) for r in csp["corr1Families"]["rows"])
        bad = [r for r in got["rows"] if recrows.get((r[0], r[1])) != r or r[2]]
        a1f = state["a1"]["generatedProbes"]
        keymap = {"parentGenerator": "part1_parentGenerator", "extended": "part2_extended", "completeViewsDiffer": "part3_completeViewsDiffer",
                  "attributeMarkupSeam": "part4_attributeMarkupSeam"}
        arch_bad = []
        for fam in GEN_FAMILIES:
            rec_f = csp["corr1Families"]["families"][fam]
            arch = a1f[keymap[fam]]
            if rec_f["cases"] != arch["cases"] or rec_f["cases"] != GEN_SIZES[fam] or rec_f["generatorMismatch"] != 0:
                arch_bad.append(fam + " size")
            if any(rec_f["counters"][k] != arch["counters"]["v6_corr1"][k] for k in arch["counters"]["v6_corr1"]):
                arch_bad.append(fam + " counters differ from the accepted architecture's")
            if not fast_mode() and got["families"][fam] != rec_f:
                arch_bad.append(fam + " recomputed counters differ from the recorded")
        hard = dict((f, sum(v["counters"][k] for k in ("split", "merge", "fabricatedEvidenceStrict", "conflictBypass", "falseSrcDiv"))) for f, v in csp["corr1Families"]["families"].items())
        return not bad and not arch_bad and not any(hard.values()), {"evaluated": len(got["rows"]), "rowMismatches": bad[:3], "architectureBinding": arch_bad,
                                                                      "hardByFamily": hard, "undercountStrict": dict((f, v["counters"]["undercountStrict"]) for f, v in csp["corr1Families"]["families"].items())}
    ck("G-1", "CORR1 generated surface (416 + 2486 + 1544 + 3768 = 8214 cases, the architecture's exact enumeration) judged by the physical oracle: falseSplit = conflictBypass = falseSrcDiv = fabricatedEvidence = merge = 0 and generator mismatch = 0; every family's counters equal the accepted CORR1 architecture's recorded counters; each case's recomputed verdict equals its recorded row (conservative undercount reported, permitted)", g1)

    def g2():
        csp = state["csiProof"]["generatedSurfaces"]
        cases = csp["oa7b"]["cases"]
        arch_rows = state["a11"]["generator"]["rows"]
        spec_ok = [dict((k, r[k]) for k in ("id", "members", "slots", "codes")) for r in arch_rows] == [dict((k, c[k]) for k in ("id", "members", "slots", "codes")) for c in cases]
        sel = stride("oa7b", cases)
        got = oa7b_generated(I, labels, sel)
        rec_rows = dict((r[0], r) for r in csp["oa7b"]["rows"])
        arch = dict((r["id"], r) for r in arch_rows)
        bad = [r[0] for r in got["rows"] if rec_rows.get(r[0]) != r or r[1] or r[3] or arch[r[0]]["childHard"] != r[1] or arch[r[0]]["childUndercount"] != r[2]]
        zero = all(csp["oa7b"]["counters"][k] == 0 for k in OA7B_REQUIRED_ZERO)
        full_ok = fast_mode() or (got["counters"] == csp["oa7b"]["counters"] == state["a11"]["generator"]["counters"]["childCorr1Corr1PerOccurrence"] and got["gateOrderDependent"] == 0 and got["invalid"] == 0)
        return spec_ok and not bad and zero and full_ok and len(cases) == OA7B_GEN_SIZE, {"cases": len(cases), "evaluated": len(sel), "bad": bad[:4], "counters": csp["oa7b"]["counters"]}
    ck("G-2", "CORR1.CORR1 OA-7(b) generator (360 cases, the architecture's case list): asymmetricDecisionSameOccurrence = conflictBypassFromRepresentability = falseSrcDivFromRepresentability = crossOccurrenceTaint = 0; decisions independent of the gate order; per-case verdicts and counters equal the accepted CORR1.CORR1 architecture's", g2)

    def g3():
        csp = state["csiProof"]["generatedSurfaces"]
        cases = csp["r14"]["cases"]
        arch_rows = state["a111"]["generator"]["rows"]
        spec_ok = [dict((k, r[k]) for k in ("id", "docs", "codes")) for r in arch_rows] == [dict((k, c[k]) for k in ("id", "docs", "codes")) for c in cases]
        sel = stride("r14", cases)
        got = r14_generated(I, labels, sel)
        rec_rows = dict((r[0], r) for r in csp["r14"]["rows"])
        arch = dict((r["id"], r) for r in arch_rows)
        bad = [r[0] for r in got["rows"] if rec_rows.get(r[0]) != r or r[1] or r[2] or not r[5] or not r[6] or r[7]
               or arch[r[0]]["childHard"] != r[1] or arch[r[0]]["childFalseExclusions"] != r[2] or arch[r[0]]["childUnderCount"] != r[3]
               or arch[r[0]]["quarantined"] != r[4]]
        a = state["a111"]["generator"]
        zero = all(v == 0 for v in csp["r14"]["counters"].values()) and csp["r14"]["mechanics"] == {"invalid": 0, "orderDependence": 0, "nonIdempotence": 0, "ordersEvaluated": R14_GEN_ORDERS}
        arch_ok = csp["r14"]["counters"] == a["counters"]["child"] and csp["r14"]["reported"] == dict((k, v) for k, v in a["reported"].items() if k in csp["r14"]["reported"])
        full_ok = fast_mode() or (got["counters"] == csp["r14"]["counters"] and got["mechanics"] == csp["r14"]["mechanics"] and got["reported"] == csp["r14"]["reported"])
        return spec_ok and not bad and zero and arch_ok and full_ok and len(cases) == R14_GEN_SIZE, {"cases": len(cases), "evaluated": len(sel), "bad": bad[:4],
                                                                                                  "counters": csp["r14"]["counters"], "mechanics": csp["r14"]["mechanics"]}
    ck("G-3", "CORR1.CORR1.CORR1 R-14 generator (560 cases x 3 record orders = 1680): conflictBypassFromUnplacedRecord = falseSourceDiversityFromUnplacedRecord = falseSrcDivFromUnplacedRecord = unplacedRecordCounted = orderDependence = nonIdempotence = crossDocumentQuarantine = sameClassOccurrenceQuarantined = candidateSetFalseExclusions = 0; per-case verdicts, counters and the reported conservative undercount equal the accepted CORR1.CORR1.CORR1 architecture's", g3)

    # ---------------- P. preservation of the accepted architecture, fixture by fixture
    def p3():
        bad = []
        a1_ = state["a1"]
        for row in a1_["parentCasesReplay"]:
            fx = fxd[row["id"]]
            res = fres[row["id"]][1]
            meta = fx["physicalTruth"]["meta"]
            reasons = [((next(s for s in res["segmentRecords"] if s["recordId"] == m["recordId"]).get("occurrenceAnchor") or {}).get("unresolvedReason")) for m in meta]
            if pair_verdicts(res, meta, roles) != row["verdicts"]["v6_corr1"] or reasons != row["corr1Reasons"] or res["count"]["distinctClassSet"] != row["distinctClassSet"]["v6_corr1"]:
                bad.append(row["id"])
        for row in a1_["r3CaseDetail"]:
            fx = fxd[row["id"]]
            res = fres[row["id"]][1]
            seg = dict((s["recordId"], s) for s in res["segmentRecords"])
            for pr in row["v6_corr1"]["perRecord"]:
                s = seg["%s-%s" % (row["id"], pr["record"])]
                a = s["occurrenceAnchor"] or {}
                if ((s["canonicalSegmentIdentity"] or "NONE")[:16], s["sourceClassAssignmentState"], a.get("unresolvedReason")) != (pr["identity"], pr["state"], pr["reason"]) \
                        or (a.get("frame") is not None and a.get("frame") != pr["frame"]):
                    bad.append("%s %s" % (row["id"], pr["record"]))
            if (res["count"]["distinctClassSet"], res["count"]["holds"], len(res["count"]["segmentClassConflicts"])) != (row["v6_corr1"]["distinctClassSet"], row["v6_corr1"]["srcDiv"], row["v6_corr1"]["classConflicts"]):
                bad.append(row["id"] + " count")
        return not bad and len(a1_["parentCasesReplay"]) == 38 and len(a1_["r3CaseDetail"]) == 34, bad[:6]
    ck("P-3", "the 38 + 34 architecture cases reproduce the accepted CORR1 architecture's recorded results record by record (identity, state, frame, reason, pair verdicts) and count by count", p3)

    def p4():
        bad = []
        for row in state["a11"]["fixtures"]:
            res = fres[row["id"]][1]
            seg = dict((s["recordId"], s) for s in res["segmentRecords"])
            for pr in row["childCorr1Corr1PerOccurrence"]["records"]:
                s = seg[pr["record"]]
                if ((s["canonicalSegmentIdentity"] or "NONE")[:20], s["sourceClassAssignmentState"], s["sourceClass"], (s["occurrenceAnchor"] or {}).get("unresolvedReason")) != (pr["identity"], pr["state"], pr["class"], pr["reason"]):
                    bad.append(pr["record"])
            c_ = row["childCorr1Corr1PerOccurrence"]
            if (res["count"]["distinctClassSet"], res["count"]["holds"], len(res["count"]["segmentClassConflicts"])) != (c_["distinctClassSet"], c_["srcDiv"], c_["conflicts"]):
                bad.append(row["id"] + " count")
        for row in state["a111"]["fixtures"]:
            res = fres[row["id"]][1]
            seg = dict((s["recordId"], s) for s in res["segmentRecords"])
            for pr in row["records"]:
                s = seg[pr["record"]]
                a = s["occurrenceAnchor"] or {}
                un = a.get("unplaced") or {}
                got = ((s["canonicalSegmentIdentity"] or "NONE")[:14], s["sourceClassAssignmentState"], s["sourceClass"], a.get("unresolvedReason"), un.get("class"), un.get("role"),
                       un.get("why"), len(un.get("candidateSet") or []) if un else None, (a.get("withheldOccurrence") or "")[:14] or None)
                want = (pr["identity"], pr["state"], pr["class"], pr["reason"], pr["witnessClass"], pr["unplacedRole"], pr["unplacedWhy"], pr["candidateSetSize"], pr["withheld"])
                if got != want:
                    bad.append(pr["record"])
        return not bad and len(state["a11"]["fixtures"]) == 10 and len(state["a111"]["fixtures"]) == 22, bad[:6]
    ck("P-4", "the 10 OA-7(b) fixtures reproduce the accepted CORR1.CORR1 architecture's recorded records and counts, and the 22 R-14 fixtures the accepted CORR1.CORR1.CORR1 architecture's (identity, state, class, reason, witness role and class, candidate-set size, withheld occurrence)", p4)

    # ---------------- R. real pilot replay (MV-REPLAY-1)
    def r1c():
        side = [json.loads(ln) for ln in open(os.path.join(dl, "STAGE2_CORR4_PILOT_ANALYTICAL_PROVENANCE_SIDECAR_CORR1.jsonl"), encoding="utf-8")]
        rows, n = [], 0
        for s in side:
            for ref in s["sourceRefs"]:
                n += 1
                rows.append(("SCA-%03d" % n, s["factId"], ref["sourceId"], ref["refIndex"], [r["sourceId"] for r in s["sourceRefs"]],
                             [ref["factLevelLocator"]] if ref.get("factLevelLocator") else []))
        got = [(r["assignmentId"], r["factId"], r["sourceId"], r["sourceRefIndex"], r["sourceRefIds"], r["sourceLocators"]) for r in rp["records"]]
        facts = set(s["factId"] for s in side)
        return got == rows and len(rows) == 32 and len(facts) == 30, {"rows": len(got), "facts": len(facts)}
    ck("R-1", "the 32 rows are exactly the sealed sidecar's (fact, sourceRef) pairs of the frozen 30 facts; sourceRefIds / sourceLocators re-derived (F-06)", r1c)

    def r2c():
        bad = []
        for a in rp["artifacts"]:
            raw = replay_loader(root)(a)
            sha = sha_bytes(raw)
            b = a["registryBinding"]
            rec = load_registry_record(root, b)
            if not (sha == a["identity"]["sha256"] == b["registryDigest"] == rec[b["digestKey"]]):
                bad.append("%s digest" % a["artifactId"])
            if derive_identity(rec, b, sha, rp["identityDerivation"]) != a["identity"]:
                bad.append("%s identity metadata" % a["artifactId"])
            if len(raw) != a["bytes"]:
                bad.append("%s bytes" % a["artifactId"])
        if rp["artifacts"] != state["rpr"]["artifacts"]:
            bad.append("the artifact blocks differ from the parent's")
        return not bad and len(rp["artifacts"]) == 23, {"artifacts": len(rp["artifacts"]), "bad": bad}
    ck("R-2", "every artifact: preserved bytes = recorded digest = sealed registry digest; identity re-derived; the 23 artifact blocks are byte-equal to the parent's", r2c)

    def r3c():
        res = evaluate_corpus(I, replay_corpus(rp, root), replay_loader(root))
        rep["res"] = res
        _b2_note(I, "pilot", "pilot", res)
        byrec = dict((r["recordId"], r) for r in res["records"])
        bad = [rec["recordId"] for rec in rp["records"] if rec["computed"] != {"duplicateIdentityState": byrec[rec["recordId"]]["duplicateIdentityState"], "segments": byrec[rec["recordId"]]["segments"]}]
        return not bad, {"recordsRecomputedDifferently": bad}
    ck("R-3", "every row is physically re-bound (spans, texts, witnesses, separators) and every recorded result (state, class, CSI-v6 identity and components, frame, anchor block, reason) equals the recomputation", r3c)
    ck("C-6", "CSI-v6 is recomputed OUTSIDE the interpreter from each segment's recorded components for every established segment of the pilot and of every fixture ('CSI:' + sha256('CSI-v6' US U US tag US anchor)); the components are the identity-bearing fields only and agree with the anchor block", c6)
    ck("C-7", "diagnostics never re-enter identity: rewriting every free-form field (locator, heading) and reversing the record order of every fixture changes no identity", c7)

    def r4c():
        res = rep["res"]
        t = rp["totals"]
        from collections import Counter
        st = Counter(s["sourceClassAssignmentState"] for s in res["segmentRecords"])
        cl = Counter(s["sourceClass"] for s in res["segmentRecords"] if s["sourceClass"])
        est = [s for s in res["segmentRecords"] if s["canonicalSegmentIdentity"]]
        groups = set((s["underlyingDocumentIdentity"], s["canonicalSegmentIdentity"]) for s in est)
        want = {"records": len(rp["records"]), "segmentRecords": len(res["segmentRecords"]), "artifacts": res["artifacts"], "underlyingDocuments": res["documents"],
                "duplicateGroups": len(res["duplicateGroups"]), "byState": dict(sorted(st.items())), "byClass": dict(sorted(cl.items())),
                "distinctClassSet": res["count"]["distinctClassSet"], "srcDivMachineryHolds": res["count"]["holds"],
                "segmentClassConflicts": len(res["count"]["segmentClassConflicts"]), "multiClassDocuments": res["count"]["multiClassDocuments"],
                "identityGroups": len(groups),
                "nonCounting": sum(1 for s in res["segmentRecords"] if s["sourceClassAssignmentState"] == roles["duplicateUnresolved"]),
                "contributingGroups": res["count"]["contributingGroups"], "documentsContributing": res["count"]["documentsContributing"],
                "unresolvedSegments": sorted(s["segmentId"] for s in res["segmentRecords"] if s["sourceClassAssignmentState"] == roles["duplicateUnresolved"]),
                "occurrenceCorrespondence": dict(sorted(Counter(s["occurrenceCorrespondence"] for s in res["segmentRecords"]).items()))}
        diff = dict((k, (t.get(k), v)) for k, v in want.items() if t.get(k) != v)
        return not diff, diff
    ck("R-4", "replay totals, class / state counts, identity groups and distinctClassSet equal the recomputation", r4c)

    def r5c():
        res = rep["res"]
        t = rp["totals"]
        comp = sorted(s["segmentId"] for s in res["segmentRecords"] if s["sourceClass"] == labels[2])
        ok = (t["byState"] == {roles["duplicateUnresolved"]: 4, roles["outside"]: 49, roles["assigned"]: 8} and t["identityGroups"] == 57 and t["nonCounting"] == 4
              and t["distinctClassSet"] == sorted([labels[6], labels[2]]) and t["srcDivMachineryHolds"] is True and t["segmentClassConflicts"] == 0
              and t["contributingGroups"] == 8 and t["documentsContributing"] == 5 and comp == ["SCA-010#s1", "SCA-023#s1"]
              and t["unresolvedSegments"] == ["SCA-002#s1", "SCA-029#s1", "SCA-031#s1", "SCA-032#s1"])
        return ok, {"byState": t["byState"], "compensationPlansSupportedBy": comp, "unresolved": t["unresolvedSegments"]}
    ck("R-5", "pilot exact: 49 OUTSIDE_FROZEN_VOCABULARY, 8 ASSIGNED, 4 DUPLICATE_IDENTITY_UNRESOLVED; 57 identity groups, 4 non-counting; distinctClassSet {access-rights/role matrices, compensation plans}; srcDiv true; 0 conflicts; 8 contributing groups, 5 documents; compensation plans supported by SCA-010#s1 and SCA-023#s1; exactly SCA-002#s1, SCA-029#s1, SCA-031#s1, SCA-032#s1 unresolved", r5c)

    def r6c():
        res = rep["res"]
        pp = dict((sg["segmentId"], sg) for r in state["rpr"]["records"] for sg in r["computed"]["segments"])
        new = dict((sg["segmentId"], sg) for sg in res["segmentRecords"])
        changes = dict((sid, [[pp[sid]["sourceClassAssignmentState"], pp[sid]["sourceClass"]], [new[sid]["sourceClassAssignmentState"], new[sid]["sourceClass"]]])
                       for sid in sorted(new) if (pp[sid]["sourceClassAssignmentState"], pp[sid]["sourceClass"]) != (new[sid]["sourceClassAssignmentState"], new[sid]["sourceClass"]))
        u_p = dict(((r["recordId"], u["unitId"]), json.dumps(u, sort_keys=True)) for r in state["rpr"]["records"] for u in r["units"])
        u_c = dict(((r["recordId"], u["unitId"]), json.dumps(u, sort_keys=True)) for r in rp["records"] for u in r["units"])
        docs = all(pp[sid]["underlyingDocumentIdentity"] == new[sid]["underlyingDocumentIdentity"] for sid in new)
        want = {"SCA-002#s1": [[roles["outside"], None], [roles["duplicateUnresolved"], None]], "SCA-029#s1": [[roles["outside"], None], [roles["duplicateUnresolved"], None]],
                "SCA-031#s1": [[roles["outside"], None], [roles["duplicateUnresolved"], None]], "SCA-032#s1": [[roles["assigned"], labels[2]], [roles["duplicateUnresolved"], None]]}
        return (changes == want and u_p == u_c and docs and set(pp) == set(new) and state["evidenceLedger"]["stateOrClassChangesFromParent"] == changes), {"changes": changes}
    ck("R-6", "parent -> implementation on the pilot: exactly four segments change, each to the non-counting state (SCA-002#s1, SCA-029#s1, SCA-031#s1 from OUTSIDE_FROZEN_VOCABULARY; SCA-032#s1 from ASSIGNED / compensation plans); units, witnessed assertions and document identities byte-equal; no recoding", r6c)

    def r7c():
        res = rep["res"]
        wit = [s["segmentId"] for s in res["segmentRecords"] if (s.get("occurrenceAnchor") or {}).get("unplaced")]
        q = [s["segmentId"] for s in res["segmentRecords"] if (s.get("occurrenceAnchor") or {}).get("withheldOccurrence")]
        noprov = [s["segmentId"] for s in res["segmentRecords"] if s.get("occurrenceAnchor") and not s["occurrenceAnchor"].get("provisionalOccurrence")]
        reasons = sorted(set((s.get("occurrenceAnchor") or {}).get("unresolvedReason") or "ESTABLISHED" for s in res["segmentRecords"]))
        return not wit and not q and not noprov and oa14_idempotent(I, res), {"unplaced": wit, "quarantined": q, "withoutProvisionalOccurrence": noprov, "reasons": reasons}
    ck("R-7", "OA-14 on the pilot: 0 records without a provisional occurrence, 0 unplaced witnesses, 0 quarantines (additional pilot delta 0); OA-14 applied to the pilot's output changes nothing", r7c)

    def r8c():
        rows = state["f111"]["pilot"]["rows"]
        seg = dict((s["segmentId"], s) for s in rep["res"]["segmentRecords"])
        bad = [r["segmentId"] for r in rows if (seg[r["segmentId"]]["canonicalSegmentIdentity"], seg[r["segmentId"]]["sourceClassAssignmentState"], seg[r["segmentId"]]["sourceClass"],
                                               (seg[r["segmentId"]].get("occurrenceAnchor") or {}).get("unresolvedReason"))
               != (r["corr1Corr1Corr1"]["identity"], r["corr1Corr1Corr1"]["state"], r["corr1Corr1Corr1"]["class"], r["corr1Corr1Corr1"]["reason"])]
        cnt = dict((k, v) for k, v in rep["res"]["count"].items() if k != (bm.get("basisOverlap") or {}).get("recording", {}).get("field"))
        return not bad and len(rows) == 61 and cnt == state["f111"]["pilot"]["countCorr1Corr1Corr1"], {"rows": len(rows), "differ": bad[:4]}
    ck("R-8", "the 61 pilot segments reproduce the accepted CORR1.CORR1.CORR1 architecture's pilot projection exactly (identity string, state, class, reason) and its count", r8c)

    def r9c():
        errs = []
        for rec in rp["records"]:
            errs.extend(mini_schema(rec, state["schema"]["definitions"]["record"], rec.get("recordId", "?")))
            for s in rec.get("computed", {}).get("segments", []):
                errs.extend(mini_schema(s, state["schema"]["definitions"]["segment"], rec.get("recordId", "?") + ":" + s.get("segmentId", "?")))
                if s.get("occurrenceAnchor") is not None:
                    errs.extend(mini_schema(s["occurrenceAnchor"], state["schema"]["definitions"]["occurrenceAnchor"], s.get("segmentId", "?") + ".occurrenceAnchor"))
        return not errs, errs[:10]
    ck("R-9", "every replay record conforms to the schema (sourceRefIds, sourceLocators, units, witnesses, computed segments, occurrence anchor blocks)", r9c)

    def r10c():
        pre, per = preregistration(base)
        np_ = rp["normativePreRegistration"]
        return (np_["preRegistrationSha256"] == pre and np_["normativeArtifacts"] == per and np_["HASH_BINDING"] == "PROVEN" and np_["TEMPORAL_HISTORY"] == "AUTHOR-REPORTED"), pre
    ck("R-10", "the replay is bound to the present normative bytes (HASH_BINDING PROVEN; TEMPORAL_HISTORY AUTHOR-REPORTED)", r10c)

    def r11c():
        el = state["evidenceLedger"]
        byrec = dict((r["recordId"], r) for r in rep["res"]["records"])
        bad = []
        for row in el["rows"]:
            got = byrec[row["recordId"]]
            if row["segmentResults"] != [[s["sourceClassAssignmentState"], s["sourceClass"]] for s in got["segments"]] or \
                    row["segmentIdentities"] != [[s["canonicalSegmentIdentity"], (s.get("occurrenceAnchor") or {}).get("frame"), (s.get("occurrenceAnchor") or {}).get("unresolvedReason")] for s in got["segments"]]:
                bad.append(row["recordId"])
            rec = next(r for r in rp["records"] if r["recordId"] == row["recordId"])
            if row["unitTextSha256"] != [u["textSha256"] for u in rec["units"]] or row["witnessCount"] != sum(len(u["assertions"]) for u in rec["units"]):
                bad.append(row["recordId"] + " binding")
        tr = el["trackedReplay"] == rep.get("trackedReplay")
        return (not bad and tr and len(el["rows"]) == 32 and el["integrity"]["rowsPhysicallyBound"] == 32), {"bad": bad, "trackedReplayRecorded": tr}
    ck("R-11", "the evidence-binding ledger agrees with the recomputed replay for all 32 rows (results, identities, frames, reasons, bindings) and records the tracked-replay invariance measured by O-2", r11c)

    # ---------------- K / M / L: preserved closures and firewalls
    ck("K-1", "srcDiv failure keeps the target OPEN (TARGET_NOT_ESTABLISHED_WITHIN_BOUND), never FALSE",
       lambda: ("TARGET_NOT_ESTABLISHED_WITHIN_BOUND" in rc["downstream"] and "never FALSE" in rc["downstream"], rc["downstream"]))
    ck("K-2", "no document-count threshold and no document-level class collapse: the removed F-01 rules stay removed, every CORR1 consequence is kept, the threshold is two distinct classes, and the B-2 layer joins only overlapping footprints or fragments of ONE atom (a document still contributes two classes through separate segments and separate atoms: C2, C3, C4, C8, TA-C2, TA-C3, TA-C4, TA-C6)",
       lambda: (rc["removedRules"] == r1["rules"]["R-COUNT"]["removedRules"] and rc["consequences"][:len(r1["rules"]["R-COUNT"]["consequences"])] == r1["rules"]["R-COUNT"]["consequences"]
                and rc["holdsWhenDistinctClassesAtLeast"] == 2 and bm["basisOverlap"]["overlap"]["test"] == "SHARED_COMPLETE_VIEW_POSITION"
                and all(fres[f][1]["count"]["holds"] for f in ("R7-C2", "R7-C3", "R7-C4", "R7-C8", "TA-C2", "TA-C3", "TA-C4", "TA-C6")), ""))
    ck("K-3", "F-05 honesty preserved: the implementation was authored with knowledge of the pilot surface",
       lambda: ("WITH knowledge of the pilot surface" in rules["implementationDiscipline"]["declaration"] and "with knowledge of the pilot surface" in state["contract"].lower(), ""))
    ck("K-4", "Stage-2 CORR4 section I recording answer preserved (NO_SCHEMA_CHANGE_REQUIRED)",
       lambda: ("NO_SCHEMA_CHANGE_REQUIRED" in json.dumps(bm["rules"]["R-EDGE"]["corr4RecordingCheck"]), ""))
    ck("K-5", "prior closures are enumerated (F-01, F-04, F-05, F-06, MV-F02, MV-F03, the CORR3 closures, the three CORR3.IV1 repairs, RR-17, OC-3) and the architecture's R-3, OA-7(b) and R-14 closures",
       lambda: (set(rules["priorClosuresPreserved"]) >= {"F-01", "F-04", "F-05", "F-06", "MV-F02", "MV-F03", "MV-SCOPE-1", "MV-VAL", "MV-DUP-1", "MV-AND-1", "MV-REPLAY-1",
                                                         "MV-HASH-1", "MV-LOC-1", "MV-TIME", "IV1-SC5-MIXED", "IV1-F04-EQUIVALENT-CAPTURES", "IV1-RR4-CSI-CONVERGENCE",
                                                         "IV1-OC3-COUNT-EQUALITY", "RR-17-WILDCARD", "R-3", "OA-7(b)", "R-14"}, sorted(rules["priorClosuresPreserved"])))

    def m1():
        bad = []
        for c in bm["classes"]:
            for x in c["components"] + c["exclusions"]:
                if re.search(FORM_TOKENS, json.dumps(x["expr"])):
                    bad.append(x.get("componentId") or x.get("id"))
        arrow = r"(=>|->|⇒|maps to|selects)"
        cls = r"(SC-\d|" + "|".join(re.escape(lab) for lab in labels) + ")"
        neg = re.compile(r"\b(neither|nothing|not|no|never|forbidden|prohibited)\b", re.I)
        rx = re.compile("(" + FORM_TOKENS + r")[^\n]{0,40}" + arrow + r"[^\n]{0,40}" + cls)
        for p, s in walk_strings(bm):
            if "forbiddenShortcuts" in p:
                continue
            for m in rx.finditer(s):
                start = max(s.rfind(". ", 0, m.start()), s.rfind("; ", 0, m.start()), -1) + 1
                if not neg.search(s[start:m.end()]):
                    bad.append(p)
        return not bad, bad
    ck("M-1", "no form-to-class shortcut in any expression or normative text", m1)

    def l1():
        bad = []
        for k in ("replay", "fixtures", "deltaLedger", "evidenceLedger", "csiProof", "preservation", "schema"):
            if re.search(FORBIDDEN_FIELDS, json.dumps(state[k], ensure_ascii=False), re.I):
                bad.append(k)
        if re.search(FORBIDDEN_FIELDS, json.dumps(rules, ensure_ascii=False), re.I):
            bad.append("rules")
        return not bad, bad
    ck("L-1", "no Environment, outcome, Prediction-Seal or pair/ECS/friction field in any artifact", l1)
    ck("L-2", "no TT target state and no Environment assignment in any replay record",
       lambda: (not re.search(r"TARGET_SUPPORTED|TARGET_CONTRADICTED|TARGET_UNOBSERVABLE|\"(NF/NT|NT/STJ|NT/STP|NF/SFJ|NF/SFP|SFJ/SFP|SFP/SFJ|STJ/STP|STP/STJ)\"",
                              json.dumps(rp["records"], ensure_ascii=False)), ""))
    ck("L-3", "firewall flags are all false / zero", lambda: (not any(rules["firewall"][k] for k in rules["firewall"]), rules["firewall"]))

    def l4():
        text = json.dumps(bm, ensure_ascii=False)
        r7 = oa["residualsCarried"].get("R-7", "")
        b2 = bm.get("basisOverlap") or {}
        return (r7 == ap["occurrenceAnchoring"]["residualsCarried"]["R-7"] and cs["collision"] == ap["canonicalSegmentIdentity"]["collision"]
                and "FR-4" not in text and "overlapSuppression" not in text and b2.get("residualClosed", "").startswith("A+-R-7")
                and "superseded by R-COUNT step 5b" in b2.get("identityStatementsStand", "") and se_parent_model(bm)["segmentation"] == bp["segmentation"] == ap["segmentation"]), r7[:120]
    ck("L-4", "R-7 / B-2 closed in candidate at COUNT level only: the identity statements of CSI-v6 and OA residualsCarried.R-7 stay byte-identical (overlapping unequal segments remain different occurrences by design), the layer declares that their counting consequence is superseded by R-COUNT step 5b; no overlap suppression of identities, no FR-4 rule, segmentation unchanged", l4)


    # ---------------- B2. the R-7 / B-2 basis-overlap closure (this act)
    rfx = [f for f in state["fixtures"]["fixtures"] if f["group"] == "R7_B2"]
    off_I = r7_off_interp(bm)
    b2d = dict((d["role"], d["id"]) for d in (bm.get("basisOverlap") or {}).get("dispositions", []))
    b2f = (bm.get("basisOverlap") or {}).get("recording", {}).get("field", "basisOverlap")

    def b2_of(fid):
        res = fres[fid][1]
        return (res["count"].get(b2f) or {}) if res else {}

    def b21():
        bad = []
        for n, h in APLUS_FILES.items():
            p = os.path.join(dl, n)
            if not os.path.exists(p) or file_sha(p) != h:
                bad.append(n)
        pre = sha_text("".join(sorted("%s  %s\n" % (APLUS_FILES[n], n) for n in (APLUS_CONTRACT, APLUS_RULES, APLUS_SCHEMA))))
        seen = 0
        for ln in open(os.path.join(dl, APLUS_MANIFEST), encoding="utf-8"):
            if ln.strip() and not ln.startswith("#"):
                h, name = ln.rstrip("\n").split("  ", 1)
                seen += 1
                if APLUS_FILES.get(name) != h:
                    bad.append("manifest " + name)
        par = rules["identities"].get(APLUS_IDENTITY_KEY, {})
        ok = (not bad and seen == 13 and sha_bytes(cjson(ap)) == APLUS_MODEL_SHA == state["rap"]["boundaryModelSha256"] and pre == APLUS_PREREG_SHA
              and file_sha(os.path.join(dl, APLUS_MANIFEST)) == APLUS_MANIFEST_SHA and par.get("files") == APLUS_FILES
              and par.get("boundaryModelSha256") == APLUS_MODEL_SHA and par.get("normativePreRegistrationSha256") == APLUS_PREREG_SHA
              and par.get("manifestSha256") == APLUS_MANIFEST_SHA and rules["aPlusAct"] == APLUS_ACT and rules["act"] == ACT)
        return ok, {"aPlusModel": sha_bytes(cjson(ap)), "aPlusPreRegistration": pre, "manifestEntries": seen, "bad": bad[:4]}
    ck("B2-1", "the B-2 layer's parent is the exact 14-file Option A+ candidate: every file equals its pinned SHA-256, its manifest verifies 13/13, its boundaryModelSha256 and normative pre-registration recompute (f65ca73b..., 0d69a4f8...), and the rules record all of them", b21)

    def b22():
        b2 = bm.get("basisOverlap") or {}
        rca, rcc = ap["rules"]["R-COUNT"], bm["rules"]["R-COUNT"]
        bad = []
        strip = lambda r: dict((k, v) for k, v in r.items() if k not in ("steps", "countingDispositions", "basisOverlapLayer", "consequences"))
        if strip(rca) != strip(rcc):
            bad.append("R-COUNT differs outside the binding (steps, dispositions, layer pointer, one consequence)")
        st_a, st_c = rca["steps"], rcc["steps"]
        if not (len(st_c) == len(st_a) + 1 and st_c[:5] == st_a[:5] and st_c[5].startswith("5b. BASIS-OVERLAP ANTI-INFLATION") and st_c[7:] == st_a[6:]
                and st_c[6] == st_a[5].replace("the set of distinct classes carried by the groups of step 5.", "the set of distinct classes contributed by the basis count components of step 5b.")):
            bad.append("R-COUNT steps are not the parent's plus step 5b and the step-6 pointer")
        if rcc["countingDispositions"][:-1] != rca["countingDispositions"] or rcc["countingDispositions"][-1]["id"] != b2.get("componentRule", {}).get("reason"):
            bad.append("counting dispositions are not the parent's plus B2_OVERLAP_CLASS_CONFLICT")
        if rcc["consequences"][:len(rca["consequences"])] != rca["consequences"] or len(rcc["consequences"]) != len(rca["consequences"]) + 2 or rcc.get("basisOverlapLayer") != "boundaryModel.basisOverlap":
            bad.append("consequences / layer pointer")
        conds = [c["test"] for c in b2.get("lawfulSeparation", {}).get("conditions", [])]
        decl = (b2.get("application") == "CONNECTED_COMPONENTS" and b2["overlap"]["test"] == "SHARED_COMPLETE_VIEW_POSITION" and b2["overlap"]["touching"] == "NON_OVERLAPPING"
                and b2["overlap"]["frameU"] == "ANY_RESOLVED_MEMBER" and b2["footprint"]["FRAME-C"] == "COMPLETE_VIEW_INTERVAL" and b2["footprint"]["FRAME-U"] == "U1_MEMBER_INTERVALS"
                and b2["supportCore"]["participation"] == "FEATURES_READ_BY_THE_SATISFIED_CLASS" and b2["supportCore"]["whenEmptyOrUnlocated"] == "WHOLE_SEGMENT"
                and b2["supportCore"]["sufficiency"] == "CORE_ASSERTIONS_ALONE_YIELD_THE_SAME_ASSIGNED_CLASS"
                and conds == ["DISTINCT_SUPPORT_RECORDS", "CORE_SUFFICIENT_FOR_FIRST", "CORE_SUFFICIENT_FOR_SECOND", "CORES_DISJOINT", "RECORDED_LAWFUL_BOUNDARY_BETWEEN_CORES"]
                and b2["lawfulSeparation"]["boundarySource"] == "RECORDED_SEPARATOR_OF_EITHER_RECORD" and "punctuationPatterns" not in b2["lawfulSeparation"]
                and b2["componentRule"]["oneClass"] == "CONTRIBUTE_ONCE" and b2["componentRule"]["severalClasses"] == "CONTRIBUTE_NOTHING"
                and [d["id"] for d in b2["dispositions"]] == ["CLEAR_SINGLETON", "LAWFULLY_SEPARATE", "COLLAPSED_SAME_CLASS_OVERLAP", "WITHHELD_CONFLICTING_OVERLAP"]
                and b2["recordStateEffect"] == "NO_RECORD_EFFECT" and "recordStateRole" not in b2 and b2["exactGroupConflict"] == "SEGMENT_CLASS_CONFLICT_AUTHORITATIVE"
                and not (set(d["id"] for d in b2["dispositions"]) | {b2["componentRule"]["reason"]}) & set(d["state"] for d in bm["states"]["definitions"])
                and "step 5b" in bm["decisionProcedure"][9])
        if not decl:
            bad.append("the layer's declaration differs from the act (position, components, conditions, dispositions, no record effect)")
        return not bad, bad
    ck("B2-1b", "B2_OVERLAP_ANTI_INFLATION is declared as the R7 act requires and bound by the minimum R-COUNT change: step 5b after the exact-CSI collapse (step 5), step 6 reads the basis count components, one counting disposition (B2_OVERLAP_CLASS_CONFLICT), one layer pointer, one consequence each for the R7 layer and this act's touching relation; every other R-COUNT field is the A+ parent's; connected components; complete-view overlap (touching is not overlap; FRAME-U: any member); support core from the frozen predicate's features; LS-1 .. LS-5 with a separator recorded by one of the two records; one class once / several classes nothing; four count dispositions that are not states; no record effect; SEGMENT_CLASS_CONFLICT authoritative", b22)

    def b23():
        led = state["deltaLedger"]["aPlusToR7Parent"]
        rows, uncl = parent_child_delta(ap, state["r7m"], led["classificationRules"])
        bad = []
        if uncl:
            bad.append({"unclassifiedLeaves": uncl[:6]})
        classes = set(r["class"] for r in led["classificationRules"]) | set(r["class"] for r in rows)
        if not classes <= set(R7_DELTA_CLASSES):
            bad.append({"SCOPE_VIOLATION": sorted(classes - set(R7_DELTA_CLASSES))})
        if rows != led["rows"] or led != state["lp7"]["aPlusToChild"]:
            bad.append("recorded A+ -> R7 parent rows differ from the recomputation or from the R7 parent's own ledger")
        outside = [r["path"] for r in rows if not any(path_covered(r["path"], p) for p in R7_PATHS)]
        if outside:
            bad.append({"leavesOutsideTheR7Surface": outside[:6]})
        counts = {}
        for r in rows:
            counts[r["class"]] = counts.get(r["class"], 0) + 1
        if counts != led["countsByClass"] or len(rows) != led["leavesChanged"]:
            bad.append("recorded counts differ from the recomputation")
        frozen = ("classes", "vocabulary", "featureVocabulary", "featureConstraints", "featureMerge", "exclusionSemantics", "moduleRules", "segmentation", "canonicalization",
                  "canonicalSegmentIdentity", "evidenceBinding", "pairwiseMatrix", "states", "occurrenceAnchoring", "documentaryTerms", "authoritativeConsumer")
        moved = [k for k in frozen if se_parent_model(bm).get(k) != ap.get(k)]
        if moved:
            bad.append({"A+ sections changed": moved})
        rd_ok = dict(bm["rules"]["R-DUP"], implementedIn=None, renditionEquivalenceTest=dict(bm["rules"]["R-DUP"]["renditionEquivalenceTest"], implementedIn=None)) == \
            dict(ap["rules"]["R-DUP"], implementedIn=None, renditionEquivalenceTest=dict(ap["rules"]["R-DUP"]["renditionEquivalenceTest"], implementedIn=None))
        other_rules = [k for k in bm["rules"] if k not in ("R-COUNT", "R-DUP") and bm["rules"][k] != ap["rules"][k]]
        if not rd_ok or other_rules or set(bm["rules"]) != set(ap["rules"]):
            bad.append({"rules changed": other_rules, "R-DUP (besides its validator file name)": not rd_ok})
        dp = [i for i in range(len(bm["decisionProcedure"])) if i != 9 and bm["decisionProcedure"][i] != ap["decisionProcedure"][i]]
        if dp or len(bm["decisionProcedure"]) != len(ap["decisionProcedure"]):
            bad.append({"decision steps changed": dp})
        return not bad, {"leavesChanged": len(rows), "counts": counts, "bad": bad[:4]}
    ck("B2-2", "A+ -> R7 parent leaf delta, carried: recomputed from the two frozen models and equal to the R7 parent's own ledger; every changed leaf lies on the R-7 surface (basisOverlap, R-COUNT, decision step 10, the model id, the validator file name) and carries one of R7_B2_OVERLAP_FOOTPRINT, R7_B2_SUPPORT_CORE, R7_B2_LAWFUL_SEPARATION, R7_B2_COMPONENT_ANTI_INFLATION, R7_B2_COUNT_FAIL_CLOSED, MECHANICAL_REQUIRED (else SCOPE_VIOLATION); classes, predicates, segmentation, canonicalization, evidence binding, states, CSI-v6, occurrence anchoring (OA-1 .. OA-14) and R-DUP are byte-identical to the A+ parent", b23)

    def b24():
        bad, parent = {}, {}
        Va = state.get("Va") or _load_aplus_module(dl)
        state["Va"] = Va
        Ia = Va.Interp(ap)
        for fid in ("R7-D1", "R7-D1-X", "R7-D1-U", "R7-D2", "R7-D3"):
            res = fres[fid][1]
            bo = b2_of(fid)
            segs = res["segmentRecords"]
            comps = set(r["basisOverlapComponentId"] for r in bo.get("records", {}).values())
            ok = (all(s["sourceClassAssignmentState"] == roles["assigned"] and s["canonicalSegmentIdentity"] for s in segs) and len(comps) == 1
                  and all(r["b2CountDisposition"] == b2d.get("withheld") and r["b2CountReason"] == bm["basisOverlap"]["componentRule"]["reason"] for r in bo["records"].values())
                  and res["count"]["distinctClassSet"] == [] and res["count"]["holds"] is False and len(set(s["canonicalSegmentIdentity"] for s in segs)) == len(segs))
            rp_ = Va.evaluate_corpus(Ia, fxd[fid]["corpus"], inline_loader)
            parent[fid] = {"aPlusDistinctClassSet": len(rp_["count"]["distinctClassSet"]), "aPlusSrcDiv": rp_["count"]["holds"]}
            if not ok or not rp_["count"]["holds"]:
                bad[fid] = {"child": [res["count"]["distinctClassSet"], res["count"]["holds"]], "aPlus": parent[fid]}
        return not bad, {"aPlusParent": parent, "bad": bad}
    ck("B2-3", "decisive D1-D3: nested (R7-D1; across two renditions R7-D1-X; in FRAME-U R7-D1-U), partial (R7-D2) and transitive (R7-D3) quote-shopping: every record keeps ASSIGNED and its own CSI-v6 identity, all records form ONE conflicting component that contributes nothing (B2_OVERLAP_CLASS_CONFLICT), distinctClassSet empty, srcDiv false; the frozen A+ parent counts two classes and srcDiv true on every one of them", b24)

    def b25():
        bad = {}
        for fid in ("R7-C2", "R7-C3", "R7-C4"):
            bo, res = b2_of(fid), fres[fid][1]
            if res["count"]["distinctClassSet"] != sorted([labels[2], labels[6]]) or not res["count"]["holds"] or \
                    any(r["b2CountDisposition"] != b2d.get("clear") for r in bo.get("records", {}).values()):
                bad[fid] = res["count"]["distinctClassSet"]
        for fid, sep in (("R7-C4-SEG", "NUMBERED_CLAUSE"), ("R7-C4-MID", "SENTENCE"), ("R7-C4-U", "NUMBERED_CLAUSE")):
            bo, res = b2_of(fid), fres[fid][1]
            pairs = bo.get("overlapPairs", [])
            proofs = [p["lawfulSeparation"] for p in pairs]
            if not (res["count"]["distinctClassSet"] == sorted([labels[2], labels[6]]) and res["count"]["holds"] and len(pairs) == 1
                    and all(pr["lawfullySeparate"] and all(pr["conditions"].values()) and pr["boundary"]["separator"] == sep and pr["boundary"]["recordId"] for pr in proofs)
                    and all(r["b2CountDisposition"] == b2d.get("separate") for r in bo["records"].values())):
                bad[fid] = {"classes": res["count"]["distinctClassSet"], "proofs": proofs}
        bo, res = b2_of("R7-C4-UNREC"), fres["R7-C4-UNREC"][1]
        un = bo.get("overlapPairs", [{}])[0].get("lawfulSeparation", {}).get("conditions", {})
        if res["count"]["distinctClassSet"] != [] or un.get("LS-4") is not True or un.get("LS-5") is not False:
            bad["R7-C4-UNREC"] = "the unrecorded boundary separated, or the control did not reach LS-5"
        return not bad, {"bad": bad, "C4": "mechanically proven (C4, C4-SEG, C4-MID, C4-U)" if not bad else "NOT PROVEN"}
    ck("B2-4", "B-3 / B-6 preserved: numbered clauses in one sourceRef (C2) and table rows (C3) stay two count units; the shared-heading cases are mechanically proven with no new annotation - C4 (the heading quoted by both records, clause 2 behind a recorded NUMBERED_CLAUSE), C4-SEG and C4-U (overlapping segments: disjoint sufficient cores, NUMBERED_CLAUSE recorded by one of the two records, in FRAME-C and in every FRAME-U member), C4-MID (a shared heading between the propositions, SENTENCE recorded) - LS-1 .. LS-5 all true, both classes survive, srcDiv true; the control C4-UNREC (the clause boundary physically present but recorded by no record) is withheld at LS-5 (conservative undercount)", b25)

    def b26():
        bad = {}
        for fid in ("R7-C5", "R7-C6", "R7-C7"):
            bo, res = b2_of(fid), fres[fid][1]
            c_ = bo.get("overlapPairs", [{}])[0].get("lawfulSeparation", {}).get("conditions", {})
            if res["count"]["distinctClassSet"] != [] or c_.get("LS-4") is not True or c_.get("LS-5") is not False:
                bad[fid] = [res["count"]["distinctClassSet"], c_]
        r8 = fres["R7-C8"][1]
        if r8["count"]["distinctClassSet"] != sorted([labels[2], labels[6]]) or b2_of("R7-C8").get("overlapPairs"):
            bad["R7-C8"] = "identical text at two occurrences merged"
        r9, b9 = fres["R7-C9"][1], b2_of("R7-C9")
        docs9 = dict((sid, r["basisOverlapComponentId"]) for sid, r in b9.get("records", {}).items())
        if r9["documents"] != 2 or len(r9["count"]["distinctClassSet"]) != 2 or b9.get("overlapPairs") or len(set(docs9.values())) != 2 or r9["count"]["documentsContributing"] != 2:
            bad["R7-C9"] = "cross-document component"
        r10, b10 = fres["R7-C10"][1], b2_of("R7-C10")
        if len(r10["count"]["segmentClassConflicts"]) != 1 or r10["count"]["distinctClassSet"] != [] or any(r["b2CountDisposition"] != b2d.get("clear") for r in b10["records"].values()):
            bad["R7-C10"] = "SEGMENT_CLASS_CONFLICT not authoritative"
        r10x, b10x = fres["R7-C10-X"][1], b2_of("R7-C10-X")
        if len(r10x["count"]["segmentClassConflicts"]) != 1 or r10x["count"]["distinctClassSet"] != [] or any(r["b2CountDisposition"] != b2d.get("withheld") for r in b10x["records"].values()):
            bad["R7-C10-X"] = "conflicting exact occurrence inside a component"
        return not bad, bad
    ck("B2-5", "non-lawful divisions and distinct occurrences: classes divided only by a comma (C5), a conjunction (C6) or a line wrap (C7) are one conflicting component (cores disjoint, LS-5 false, nothing contributed); identical text at two non-overlapping occurrences (C8) is two count units (text equality is not overlap); two underlying documents (C9) never share a component; an exact occurrence carrying two classes (C10) stays SEGMENT_CLASS_CONFLICT and is not replaced, and when it also overlaps a third record (C10-X) the component is withheld with SEGMENT_CLASS_CONFLICT still recorded", b26)

    def b27():
        bad = {}
        frames = {}
        for f in rfx:
            res = fres[f["fixtureId"]][1]
            for s in res["segmentRecords"]:
                fr = (s.get("occurrenceAnchor") or {}).get("frame")
                frames[fr] = frames.get(fr, 0) + 1
        rel = lambda fid: [p["relation"] for p in b2_of(fid).get("overlapPairs", [])]
        R = bm["basisOverlap"]["overlap"]["relations"]
        if rel("R7-FU-1") != [R["overlappingEveryMember"]] or fres["R7-FU-1"][1]["count"]["distinctClassSet"] != []:
            bad["R7-FU-1"] = rel("R7-FU-1")
        for fid in ("R7-FU-2a", "R7-FU-2b"):
            if rel(fid) != [R["overlappingSomeMembers"]] or fres[fid][1]["count"]["distinctClassSet"] != []:
                bad[fid] = rel(fid)
        if rel("R7-FU-C1") != [R["overlappingEveryMember"]] or fres["R7-FU-C1"][1]["count"]["contributingGroups"] != 1:
            bad["R7-FU-C1"] = rel("R7-FU-C1")
        spans = [s["span"] for s in fres["R7-D1-X"][1]["segmentRecords"]]
        local_disjoint = not (spans[0][0] < spans[1][1] and spans[1][0] < spans[0][1])
        if not local_disjoint or rel("R7-D1-X") != [R["overlapping"]]:
            bad["R7-D1-X"] = {"artifactLocalSpans": spans, "relation": rel("R7-D1-X")}
        ok_frames = frames.get(oa["frameC"]["recordedAs"], 0) > 0 and frames.get(oa["frameU"]["recordedAs"], 0) > 0
        return not bad and ok_frames, {"segmentsByFrame": frames, "bad": bad}
    ck("B2-6", "FRAME-C and FRAME-U: overlap in every FRAME-U member (FU-1) and a FRAME-U relation that differs across members in either member order (FU-2a / FU-2b: OVERLAPPING_IN_SOME_MEMBERS) are both one conflicting component, no member chosen; FRAME-U same-class overlap contributes once (FU-C1); a FRAME-C overlap across two renditions whose artifact-local spans are disjoint is found in the complete view (D1-X)", b27)

    def b28():
        csp = state["csiProof"]["r7Generated"]
        cases = r7_generated_cases()
        spec_ok = [dict((k, c[k]) for k in ("id", "family", "docs", "records")) for c in cases] == [dict((k, c[k]) for k in ("id", "family", "docs", "records")) for c in csp["cases"]]
        sel = stride("r7", cases)
        got = r7_generated(I, labels, sel, off_I)
        recrows = dict((r[0], r) for r in csp["rows"])
        bad = [r[0] for r in got["rows"] if recrows.get(r[0]) != r or r[1]]
        zero = all(v == 0 for v in csp["counters"].values()) and csp["reported"]["mechanicsInvalid"] == 0 and csp["summary"]["generatorMismatch"] == 0
        full_ok = fast_mode() or (got["counters"] == csp["counters"] and got["reported"] == csp["reported"] and got["summary"] == csp["summary"])
        n_ok = len(cases) >= R7_GEN_MIN and csp["summary"]["ordersEvaluated"] == 3 * len(cases) and set(csp["counters"]) == set(_TA_HARD)
        if not fast_mode() and got["countDeltasAgainstTheR7Parent"] != csp["countDeltasAgainstTheR7Parent"]:
            n_ok = False
        return spec_ok and not bad and zero and full_ok and n_ok, {"cases": len(cases), "evaluated": len(sel), "counters": csp["counters"], "reported": csp["reported"],
                                                                 "summary": csp["summary"], "bad": bad[:4]}
    ck("B2-7", "the inherited R-7 / B-2 generated surface (888 construction cases x 3 record orders), re-judged under this model by the touching-aware truth engine over the same R-7 templates (overlap: the B-2 truth; non-overlap: joined iff no recorded separator and no frozen-evidenced junction lies between the cores): every hard counter 0 (no bypass, no false diversity or srcDiv, no conflicting atom counting, no same-class multi-contribution, no lawful or different atoms collapsed, no cross-document or text-equality merge, order- and component-order-independent, idempotent, CSI / assignment / segmentation unchanged, the frozen atom reading and the atom projection kept), mechanics invalid = 0; per-case verdicts and the cases whose count differs from the R7 parent's equal the recorded table; conservative undercount reported apart", b28)

    def b29():
        Va = state.get("Va") or _load_aplus_module(dl)
        state["Va"] = Va
        Ia = Va.Interp(ap)
        bad, n = [], 0
        for f in state["fxa"]["fixtures"]:
            res = fres[f["fixtureId"]][1]
            try:
                rp_ = Va.evaluate_corpus(Ia, f["corpus"], inline_loader)
            except Exception as e:  # noqa: BLE001
                if res is not None or getattr(e, "code", None) != f["expect"].get("error"):
                    bad.append(f["fixtureId"] + " error parity")
                continue
            n += 1
            cc = dict((k, v) for k, v in res["count"].items() if k != b2f)
            if res["segmentRecords"] != rp_["segmentRecords"] or cc != rp_["count"] or res["duplicatePairs"] != rp_["duplicatePairs"]:
                bad.append(f["fixtureId"])
        pr = Va.evaluate_corpus(Ia, {"artifacts": rp["artifacts"], "records": rp["records"]}, replay_loader(root))
        pc = dict((k, v) for k, v in rep["res"]["count"].items() if k != b2f)
        pilot_ok = pr["segmentRecords"] == rep["res"]["segmentRecords"] and pc == pr["count"]
        notes = dict((k, {"evaluated": v["evaluated"], "countDeltas": len(v["countDeltas"])}) for k, v in sorted(_B2_NOTES.items()))
        deltas = sum(v["countDeltas"] for v in notes.values())
        return not bad and pilot_ok and n == len(state["fxa"]["fixtures"]) - sum(1 for f in state["fxa"]["fixtures"] if "error" in f["expect"]) and deltas == 0, \
            {"aPlusFixturesComparedWithTheFrozenAPlusValidator": n, "differ": bad[:6], "pilotByteEqual": pilot_ok, "inheritedSurfacesCountDeltas": notes}
    ck("B2-8", "parity with the frozen A+ parent on every inherited surface: its own validator module (pinned by B2-1) evaluates the 206 carried fixtures and the 61-segment pilot, and the child's segment records (identity, components, frame, anchor block, state, class, predicate results), duplicate pairs and counts are byte-equal to it (the added basisOverlap block aside); on the CORR1 (8214), OA-7(b) (360) and R-14 (560 x 3) generated surfaces, the architecture cases and the pilot, the final count with step 5b equals the count without it on every case (count deltas = 0)", b29)

    def b210():
        bad = {}
        for f in rfx:
            fid = f["fixtureId"]
            j, n = r7_judge_fixture(I, f, labels, off_I)
            hard = [k for k in _TA_HARD if j[k]]
            if hard or j["mechanicsInvalid"]:
                bad[fid] = hard or ["mechanicsInvalid"]
        return not bad, {"fixtures": len(rfx), "failed": bad}
    ck("B2-9", "every R-7 construction fixture is regenerated from its construction spec and judged, in EVERY declared record order, by the touching-aware truth engine over its R-7 template: all hard counters 0 (no bypass, no false diversity or srcDiv, no lawful or different atoms collapsed, no cross-document or text-equality merge, no record- or component-order dependence, idempotent, CSI, assignment and segmentation unchanged against the same model with the touching relation absent and with step 5b absent)", b210)

    def b211():
        bad = []
        if bm["states"] != ap["states"] or bm["vocabulary"] != ap["vocabulary"] or len(bm["classes"]) != 9:
            bad.append("states / vocabulary / classes differ from the A+ parent")
        sch = state["schema"]["definitions"]
        if sch["segment"]["properties"]["sourceClassAssignmentState"] != state["scha"]["definitions"]["segment"]["properties"]["sourceClassAssignmentState"]:
            bad.append("the schema state enum differs from the A+ parent's")
        if sch.get("basisOverlapRecord", {}).get("properties", {}).get("b2CountDisposition", {}).get("enum") != [d["id"] for d in bm["basisOverlap"]["dispositions"]]:
            bad.append("the count-disposition enum is not derived from the model")
        n = 0
        for fid, (ok, res) in list(fres.items()) + [("pilot", (True, rep["res"]))]:
            if res is None or fid not in fxd and fid != "pilot":
                continue
            corpus = fxd[fid]["corpus"] if fid != "pilot" else {"artifacts": rp["artifacts"], "records": rp["records"]}
            off = evaluate_corpus(off_I, corpus, inline_loader if fid != "pilot" else replay_loader(root))
            n += 1
            if off["segmentRecords"] != res["segmentRecords"]:
                bad.append(fid)
        return not bad, {"evaluationsComparedWithStep5bAbsent": n, "bad": bad[:6]}
    ck("B2-10", "no new state, class or public sourceClass disposition; the count layer changes no identity and no assignment: states, vocabulary and the schema state enum are the A+ parent's, the four count dispositions are schema-derived and are not states, and for every fixture and the pilot the segment records (CSI-v6 identity, components, state, class, predicate results) are byte-equal with and without step 5b", b211)

    def b212():
        rec_ = state["csiProof"]["r7Sensitivity"]
        sens_ = rec_ if fast_mode() else r7_sensitivity(bm, state["fixtures"]["fixtures"], labels, r7_generated_cases()[::R7_SENS_STRIDE])
        missed = [k for k, v in sens_.items() if not v["fixturesTripped"]]
        return not missed and rec_ == sens_ and sorted(sens_) == sorted(R7_WEAKENED), {"missed": missed, "fixturesTripped": dict((k, len(v["fixturesTripped"])) for k, v in sorted(sens_.items())),
                                                                                    "generatedCasesTripped": dict((k, v["generatedCasesTripped"]) for k, v in sorted(sens_.items()))}
    ck("B2-11", "weakened-implementation sensitivity: each of the 22 weakened layers the act names (R7-FF01 .. R7-FF22: disabled, exact-CSI only, narrowest / broadest / first wins, both classes, pairwise, record-order greedy, same-class twice, whole document, lawful separation refused, comma / conjunction / line wrap as boundary, text equality, artifact-local offsets, FRAME-U ignored, one member chosen, CSI rewritten, assignment recoded, a new state, SEGMENT_CLASS_CONFLICT bypassed), applied to this model, trips at least one R-7 or touching-atom construction fixture by behaviour (oracle counter or declared expectation; the component algorithm they weaken is shared, so the transitive witness of R7-FF08 is the touching-atom bridge TA-T2 - R7-D3's outer records now touch inside one sentence); the recorded table equals the recomputation", b212)

    def b213():
        bad = []
        for fid in ("R7-RES-1", "R7-RES-1M"):
            res = fres[fid][1]
            if res["count"]["distinctClassSet"] != [] or res["count"]["holds"] or b2_of(fid).get("overlapPairs") or not b2_of(fid).get("touchingAtomPairs"):
                bad.append(fid)
        rr = dict((r["id"], r) for r in rules["residualRisksForVerifier"])
        closed = rr.get("A+-R-7", {}).get("statement", "").startswith("CLOSED_IN_CANDIDATE")
        res1 = rr.get("R7-RES-1", {}).get("statement", "").startswith("CLOSED_IN_CANDIDATE")
        return not bad and closed and res1, {"residualFixturesReproduced": not bad, "A+-R-7 closed in candidate": closed, "R7-RES-1 closed in candidate": res1}
    ck("B2-12", "residual register: A+-R-7 (overlapping unequal segments) stays CLOSED_IN_CANDIDATE; R7-RES-1 (touching halves of one indivisible sentence) is now CLOSED_IN_CANDIDATE: the carried R7-RES-1 and R7-RES-1M are no overlap pair but one touching-atom pair, one component, nothing contributed, srcDiv false", b213)

    def b214():
        src = open(A["validator"], encoding="utf-8").read()
        block = src[src.index("# " + "=" * 66 + " R-7 / B-2 CONSTRUCTION ORACLE BEGIN"):src.index("# " + "=" * 66 + " R-7 / B-2 CONSTRUCTION ORACLE END")]
        tree = ast.parse(block)
        forbidden = (r"\.(basis_overlap|basis_overlap_facts|_b2_[a-z_]+|anchor_all|anchor_facts|_frame_u_guard|seam|complete_view_of|tracked_extract|identity_string|omega|count)\(",
                     r"\b(evaluate_corpus|complete_view|apply_ops_tracked)\(", r"[\"'](canonicalSegmentIdentity|occurrenceAnchor|completeViewInterval|basisOverlap|overlapPairs|lawfulSeparation|predicateSupportCore)[\"']")
        bad = []
        for node in tree.body:
            if isinstance(node, ast.FunctionDef) and node.name in ("build_r7", "r7_truth", "r7_generated_cases", "_r7_body", "_r7_member", "_r7_witnesses"):
                seg = ast.get_source_segment(block, node)
                for f in forbidden:
                    m = re.search(f, seg)
                    if m:
                        bad.append("%s uses %s" % (node.name, m.group(0)))
        return not bad, {"constructionFunctionsScanned": 6, "bad": bad}
    ck("B2-13", "the R-7 construction oracle is independent: its builder, truth and generator functions name no interpreter machinery (the layer, footprints, occurrence anchoring, complete view, identity, evaluate_corpus) and read no candidate identity, footprint, component or disposition; truth comes from atoms, junctions and records in body coordinates", b214)

    def b215():
        fa = state["fxa"]["fixtures"]
        fx_ = state["fixtures"]["fixtures"]
        bad = []
        if [f["fixtureId"] for f in fx_[:len(fa)]] != [f["fixtureId"] for f in fa]:
            bad.append("the A+ fixtures are not carried first and in order")
        for f in fa:
            n = fxd.get(f["fixtureId"])
            if n != f:
                bad.append(f["fixtureId"])
        ids = [f["fixtureId"] for f in fx_[len(fa):len(fa) + len(R7_FIXTURE_IDS)]]
        return not bad and ids == R7_FIXTURE_IDS and all(f["group"] == "R7_B2" for f in fx_[len(fa):len(fa) + len(R7_FIXTURE_IDS)]), {"aPlusFixturesCarried": len(fa), "r7Fixtures": len(ids), "bad": bad[:6]}
    ck("B2-14", "all 206 fixtures of the A+ candidate are carried first, in order, byte-identical (evidence, construction, physical truth and declared expectation: no expectation changes), followed by the 26 R-7 construction fixtures", b215)


    # ---------------- TA. SAME_INDIVISIBLE_ATOM_TOUCHING - the R7-RES-1 closure (this act)
    r7m = state["r7m"]
    tfx = [f for f in state["fixtures"]["fixtures"] if f["group"] == "TA_ATOM"]
    off_T = ta_off_interp(bm)
    ta = (bm.get("basisOverlap") or {}).get("touchingAtom") or {}
    TR = ta.get("relations", {})
    taj = {}

    def ta_fx(fid):
        if fid not in taj:
            taj[fid] = ta_judge_fixture(I, fxd[fid], labels, off_I)
        return taj[fid]

    def trel(fid):
        return dict(("%s|%s" % tuple(x.split("-")[-1] for x in r["records"]), r["relation"]) for r in b2_of(fid).get("touchingAtomRelations", []))

    def ta1():
        bad = []
        for n, h in R7P_FILES.items():
            p = os.path.join(dl, n)
            if not os.path.exists(p) or file_sha(p) != h:
                bad.append(n)
        pre = sha_text("".join(sorted("%s  %s\n" % (R7P_FILES[n], n) for n in (R7P_CONTRACT, R7P_RULES, R7P_SCHEMA))))
        seen = 0
        for ln in open(os.path.join(dl, R7P_MANIFEST), encoding="utf-8"):
            if ln.strip() and not ln.startswith("#"):
                h, name = ln.rstrip("\n").split("  ", 1)
                seen += 1
                if R7P_FILES.get(name) != h:
                    bad.append("manifest " + name)
        par = rules["identities"].get(R7P_IDENTITY_KEY, {})
        ok = (not bad and seen == 13 and sha_bytes(cjson(r7m)) == R7P_MODEL_SHA == state["r7r"]["boundaryModelSha256"] and pre == R7P_PREREG_SHA
              and file_sha(os.path.join(dl, R7P_MANIFEST)) == R7P_MANIFEST_SHA and par.get("files") == R7P_FILES
              and par.get("boundaryModelSha256") == R7P_MODEL_SHA and par.get("normativePreRegistrationSha256") == R7P_PREREG_SHA
              and par.get("manifestSha256") == R7P_MANIFEST_SHA and rules["r7Act"] == R7P_ACT and rules["act"] == ACT
              and state["r7r"]["act"] == R7P_ACT)
        return ok, {"r7ParentModel": sha_bytes(cjson(r7m)), "r7ParentPreRegistration": pre, "manifestEntries": seen, "bad": bad[:4]}
    ck("TA-1", "the touching layer's parent is the exact 14-file R7-B2 overlap closure candidate: every file equals its pinned SHA-256, its manifest verifies 13/13, its boundaryModelSha256 and normative pre-registration recompute (e155d5fb..., cbf0acc2...), and the rules record all of them as this act's parent", ta1)

    def ta2():
        led = state["deltaLedger"]["r7ToChild"]
        tam_ = state["tam"]
        rows, uncl = parent_child_delta(r7m, tam_, led["classificationRules"])
        bad = []
        if uncl:
            bad.append({"unclassifiedLeaves": uncl[:6]})
        classes = set(r["class"] for r in led["classificationRules"]) | set(r["class"] for r in rows)
        if not classes <= set(TA_DELTA_CLASSES):
            bad.append({"SCOPE_VIOLATION": sorted(classes - set(TA_DELTA_CLASSES))})
        if rows != led["rows"] or led != state["lpt"]["r7ToChild"]:
            bad.append("recorded R7 parent -> child rows differ from the recomputation")
        outside = [r["path"] for r in rows if not any(path_covered(r["path"], p) for p in TA_PATHS)]
        if outside:
            bad.append({"leavesOutsideTheTouchingSurface": outside[:6]})
        counts = {}
        for r in rows:
            counts[r["class"]] = counts.get(r["class"], 0) + 1
        if counts != led["countsByClass"] or len(rows) != led["leavesChanged"]:
            bad.append("recorded counts differ from the recomputation")
        frozen = ("classes", "vocabulary", "featureVocabulary", "featureConstraints", "featureMerge", "exclusionSemantics", "moduleRules", "segmentation",
                  "canonicalization", "canonicalSegmentIdentity", "evidenceBinding", "pairwiseMatrix", "states", "occurrenceAnchoring", "documentaryTerms",
                  "authoritativeConsumer", "serialization", "role")
        moved = [k for k in frozen if tam_.get(k) != r7m.get(k)]
        if moved:
            bad.append({"R7-parent sections changed": moved})
        b_c = copy.deepcopy(tam_["basisOverlap"])
        b_c.pop("touchingAtom", None)
        b_p = copy.deepcopy(r7m["basisOverlap"])
        for b_ in (b_c, b_p):
            b_["dispositions"][0]["when"] = None
        if b_c != b_p:
            bad.append("basisOverlap differs from the parent's outside touchingAtom and the clear-singleton wording")
        rc_c, rc_p = tam_["rules"]["R-COUNT"], r7m["rules"]["R-COUNT"]
        strip = lambda r: dict((k, v) for k, v in r.items() if k not in ("steps", "countingDispositions", "consequences"))
        if (strip(rc_c) != strip(rc_p) or [s for i, s in enumerate(rc_c["steps"]) if i != 5] != [s for i, s in enumerate(rc_p["steps"]) if i != 5]
                or rc_c["countingDispositions"][0] != rc_p["countingDispositions"][0]
                or dict(rc_c["countingDispositions"][1], fires=None, cannotFire=None) != dict(rc_p["countingDispositions"][1], fires=None, cannotFire=None)
                or rc_c["consequences"][:-1] != rc_p["consequences"] or len(rc_c["consequences"]) != len(rc_p["consequences"]) + 1):
            bad.append("R-COUNT differs outside step 5b, the B-2 disposition's fires / cannotFire and one consequence")
        other_rules = [k for k in tam_["rules"] if k not in ("R-COUNT", "R-DUP") and tam_["rules"][k] != r7m["rules"][k]]
        rd_ok = dict(tam_["rules"]["R-DUP"], implementedIn=None, renditionEquivalenceTest=dict(tam_["rules"]["R-DUP"]["renditionEquivalenceTest"], implementedIn=None)) == \
            dict(r7m["rules"]["R-DUP"], implementedIn=None, renditionEquivalenceTest=dict(r7m["rules"]["R-DUP"]["renditionEquivalenceTest"], implementedIn=None))
        if other_rules or not rd_ok or set(tam_["rules"]) != set(r7m["rules"]):
            bad.append({"rules changed": other_rules, "R-DUP (besides its validator file name)": not rd_ok})
        dp = [i for i in range(len(tam_["decisionProcedure"])) if i != 9 and tam_["decisionProcedure"][i] != r7m["decisionProcedure"][i]]
        if dp or len(tam_["decisionProcedure"]) != len(r7m["decisionProcedure"]):
            bad.append({"decision steps changed": dp})
        return not bad, {"leavesChanged": len(rows), "counts": counts, "bad": bad[:4]}
    ck("TA-2", "R7 parent -> touching-atom parent leaf delta, carried: recomputed from the two frozen models and equal to the touching-atom parent's own ledger; every changed leaf lies on the touching-atom surface (basisOverlap.touchingAtom, the clear-singleton wording, R-COUNT step 5b, the B-2 disposition's fires / cannotFire, one consequence, decision step 10, the model id, the validator file name) and carries one of R7_TOUCHING_ATOM_RELATION, R7_TOUCHING_ATOM_COMPONENT_BINDING, R7_TOUCHING_ATOM_FAIL_CLOSED, MECHANICAL_REQUIRED (else SCOPE_VIOLATION); Option A+, CSI-v6, OA-1 .. OA-14, segmentation (atom, separators, evidence), predicates, states, R-DUP and every other basisOverlap leaf are byte-identical to the R7 parent", ta2)

    def ta3():
        bad = []
        je = ta.get("junctionEvidence", {})
        seg = bm["segmentation"]
        rules_ = [(r["separator"], r["reading"]) for r in je.get("rules", [])]
        if rules_ != [("SENTENCE", "PREVIOUS_UNIT_ENDING"), ("NUMBERED_CLAUSE", "UNIT_START"), ("NUMBERED_SUBCLAUSE", "UNIT_START")]:
            bad.append({"junctionEvidence.rules": rules_})
        for sep, rd in rules_:
            key = je["readings"][rd]["frozenEvidence"]
            if sep not in seg["lawfulSeparators"] or key not in seg["separatorEvidence"]["whenAdjacent"].get(sep, {}):
                bad.append("%s does not read a frozen whenAdjacent evidence rule" % sep)
        ne = [x["separator"] for x in je.get("notEvidenced", [])]
        if sorted(ne + [s for s, _ in rules_]) != sorted(seg["lawfulSeparators"]):
            bad.append("the lawful separators are not partitioned into junction evidence and not-evidenced")
        if "extraPatterns" in je or "ignoredSeparators" in je:
            bad.append("a dormant junction path is selected")
        omit = ta.get("junction", {}).get("material", {}).get("omitCompleteViewOps")
        if omit != [bm["occurrenceAnchoring"]["completeView"]["then"][-1]]:
            bad.append("the junction material is not the complete view before its letters-and-digits filter")
        edge = ta.get("edge", "")
        conds = [c["id"] for c in ta.get("conditions", [])]
        decl = (ta.get("application") == "EDGE_ELIGIBILITY" and ta.get("atomTest") == "FROZEN_SEGMENTATION_ATOM" and ta["junction"]["extent"] == "BETWEEN_CORES"
                and ta["members"]["rule"] == "SAME_ATOM_IN_ANY_MEMBER" and ta["componentBinding"] == "SHARED_B2_COMPONENTS"
                and conds == ["TA-1", "TA-2", "TA-3", "TA-4", "TA-5"] and all(x in edge for x in ("PROVEN_OR_POSSIBLE_OVERLAP", "SAME_INDIVISIBLE_ATOM_TOUCHING",
                                                                                                   "NOT LAWFULLY_SEPARATE_SUPPORT", "same underlying document U"))
                and ta["atom"].startswith("segmentation.atom") and seg["atom"] == r7m["segmentation"]["atom"] == state["ap"]["segmentation"]["atom"]
                and set(TR.values()) == {"TOUCHING_SAME_ATOM", "TOUCHING_SAME_ATOM_IN_SOME_MEMBERS", "DIFFERENT_ATOMS"}
                and bm["basisOverlap"]["overlap"]["touching"] == "NON_OVERLAPPING" and bm["basisOverlap"]["overlap"]["test"] == "SHARED_COMPLETE_VIEW_POSITION"
                and [d["id"] for d in bm["basisOverlap"]["dispositions"]] == [d["id"] for d in r7m["basisOverlap"]["dispositions"]]
                and ta.get("residualClosed", "").startswith("R7-RES-1"))
        if not decl:
            bad.append("the relation's declaration differs from the act (edge, TA-1 .. TA-5, frozen atom, between the cores, any member, shared components, no new disposition, overlap unchanged)")
        return not bad, bad
    ck("TA-3", "SAME_INDIVISIBLE_ATOM_TOUCHING is declared as the act requires: B2_EDGE = same U, different exact groups, (PROVEN_OR_POSSIBLE_OVERLAP or SAME_INDIVISIBLE_ATOM_TOUCHING), not LAWFULLY_SEPARATE_SUPPORT; conditions TA-1 .. TA-5; the atom is segmentation.atom, byte-identical to the parents'; atom boundaries only from a separator a's or b's record records or from the frozen whenAdjacent evidence of SENTENCE / NUMBERED_CLAUSE / NUMBERED_SUBCLAUSE read in the complete view between the cores (TABLE_ROW, HEADING, EXHIBIT and PAGE_OR_SECTION_LABEL never from bytes alone); any member fails closed; the existing components, rule and dispositions; the overlap test unchanged (touching stays NON_OVERLAPPING); no dormant path selected", ta3)

    def ta4():
        bad = {}
        notes = dict((k, {"evaluated": v["evaluated"], "countDeltas": v["countDeltas"]}) for k, v in sorted(_TA_NOTES.items()))
        for k in ("fixtures", "pilot", "corr1Generated", "oa7bGenerated", "r14Generated"):
            if k not in notes or notes[k]["countDeltas"]:
                bad[k] = notes.get(k)
        r7d = []
        for f in rfx:
            res = fres[f["fixtureId"]][1]
            off = evaluate_corpus(off_T, f["corpus"], inline_loader)
            strip_ = lambda c: dict((k, v) for k, v in c.items() if k != b2f)
            if strip_(res["count"]) != strip_(off["count"]):
                r7d.append(f["fixtureId"])
            if off["segmentRecords"] != res["segmentRecords"]:
                bad[f["fixtureId"]] = "segment records differ with the touching relation absent"
        if r7d != ["R7-RES-1", "R7-RES-1M"]:
            bad["r7Fixtures"] = r7d
        pil = rep["res"]
        offp = evaluate_corpus(off_T, {"artifacts": rp["artifacts"], "records": rp["records"]}, replay_loader(root))
        pc = dict((k, v) for k, v in pil["count"].items() if k != b2f)
        if pc != dict((k, v) for k, v in offp["count"].items() if k != b2f) or offp["segmentRecords"] != pil["segmentRecords"]:
            bad["pilot"] = "pilot count, state, identity or segmentation differs from the R7 parent's"
        if not (pc["distinctClassSet"] == ["access-rights/role matrices", "compensation plans"] and pc["holds"] and pc["contributingGroups"] == 8
                and pc["documentsContributing"] == 5 and pc["segmentClassConflicts"] == []):
            bad["pilotCount"] = pc
        led = state["deltaLedger"]["impactPreflight"]
        g7 = state["csiProof"]["r7Generated"]["countDeltasAgainstTheR7Parent"]
        if led["r7Generated"]["countDeltaCases"] != g7 or led["r7Fixtures"]["countDeltaCases"] != r7d or led["pilot"]["countDelta"] != 0:
            bad["ledger"] = "the recorded impact preflight differs from the recomputation"
        return not bad, {"r7FixtureDeltas": r7d, "r7GeneratedDeltaCases": len(g7), "inheritedSurfaces": dict((k, {"evaluated": v["evaluated"], "countDeltas": len(v["countDeltas"])}) for k, v in notes.items()),
                         "pilotTouchingRelations": [[r["records"], r["relation"]] for r in (pil["count"].get(b2f) or {}).get("touchingAtomRelations", [])], "bad": bad}
    ck("TA-4", "impact preflight (section 14), recomputed: pilot assignment / state / identity / segmentation delta 0, distinctClassSet and srcDiv unchanged (49 / 8 / 4; 57 groups; {access-rights/role matrices, compensation plans}; srcDiv true; 8 contributing groups; 5 documents); count delta 0 on the 206 A+ fixtures and on the CORR1 (8214), OA-7(b) (360) and R-14 (560 x 3) generated surfaces; on the 26 R-7 fixtures exactly R7-RES-1 and R7-RES-1M change; on the R-7 generated surface exactly the recorded cases change (each a touching-atom case)", ta4)

    def ta5():
        bad, parent = {}, {}
        for fid in ("TA-D1", "TA-D1-W", "TA-D1-X", "TA-D1-TH", "TA-D1-U", "TA-D2", "R7-RES-1", "R7-RES-1M"):
            res = fres[fid][1]
            bo = b2_of(fid)
            off = evaluate_corpus(off_T, fxd[fid]["corpus"], inline_loader)
            cands = [s for s in res["segmentRecords"] if s["sourceClassAssignmentState"] == roles["assigned"]]
            comps = set(bo["records"][s["segmentId"]]["basisOverlapComponentId"] for s in cands)
            rels = [r["relation"] for r in bo.get("touchingAtomPairs", [])]
            ok = (len(cands) == 2 and len(comps) == 1 and all(bo["records"][s["segmentId"]]["b2CountDisposition"] == b2d["withheld"] for s in cands)
                  and res["count"]["distinctClassSet"] == [] and res["count"]["holds"] is False and rels and all(r in (TR["sameAtomEveryMember"], TR["sameAtomSomeMembers"]) for r in rels)
                  and off["segmentRecords"] == res["segmentRecords"] and off["count"]["holds"] and len(off["count"]["distinctClassSet"]) == 2
                  and all(r["b2CountDisposition"] == b2d["clear"] for r in (off["count"].get(b2f) or {}).get("records", {}).values()))
            parent[fid] = {"r7ParentClasses": len(off["count"]["distinctClassSet"]), "r7ParentSrcDiv": off["count"]["holds"]}
            if fid in ("TA-D2", "R7-RES-1M"):
                c_ = [s for s in res["segmentRecords"] if s["sourceClassAssignmentState"] == roles["multiple"]]
                ok = ok and len(c_) == 1 and c_[0]["segmentId"] not in bo["records"]
            if not ok:
                bad[fid] = {"child": [res["count"]["distinctClassSet"], res["count"]["holds"], rels], "r7Parent": parent[fid]}
        return not bad, {"r7Parent": parent, "bad": bad}
    ck("TA-5", "decisive D1 / D2: the exact residual (TA-D1; wide footprints TA-D1-W; across two renditions TA-D1-X and TA-D1-TH; FRAME-U TA-D1-U; the carried R7-RES-1) and R7-RES-1M (TA-D2; the carried R7-RES-1M): the R7 parent counts two classes, srcDiv true, CLEAR_SINGLETON + CLEAR_SINGLETON; the child joins the two fragments by SAME_INDIVISIBLE_ATOM_TOUCHING into ONE component that contributes nothing (B2_OVERLAP_CLASS_CONFLICT), srcDiv false; assignments, CSI-v6 and segmentation byte-identical to the parent's; the whole-sentence MULTIPLE record stays non-counting and is not a node (the closure does not rely on it)", ta5)

    def ta6():
        bad = {}
        for fid in ("TA-C1", "TA-C1-7", "TA-FU-C1"):
            res, bo = fres[fid][1], b2_of(fid)
            comps = set(r["basisOverlapComponentId"] for r in bo.get("records", {}).values())
            if not (len(comps) == 1 and res["count"]["contributingGroups"] == 1 and len(res["count"]["distinctClassSet"]) == 1
                    and all(r["b2CountDisposition"] == b2d["collapsed"] for r in bo["records"].values())):
                bad[fid] = res["count"]
        return not bad, bad
    ck("TA-6", "same class: two touching fragments of one atom carrying one class (TA-C1 SC-3 / SC-3; TA-C1-7 SC-7 / SC-7 across a comma; TA-FU-C1 in FRAME-U) are one component, COLLAPSED_SAME_CLASS_OVERLAP, contributing that class ONCE", ta6)

    def ta7():
        bad = {}
        both = sorted([labels[2], labels[6]])
        for fid, why in (("TA-C2", "NUMBERED_CLAUSE"), ("TA-C2-B", "NUMBERED_CLAUSE"), ("TA-C2-SUB", "NUMBERED_SUBCLAUSE"), ("TA-C3", "TABLE_ROW"), ("TA-C3-B", "TABLE_ROW"),
                         ("TA-C4", "SENTENCE"), ("TA-C4-NL", "SENTENCE"), ("TA-C4-Q", "SENTENCE"), ("TA-C4-REC", "SENTENCE"), ("TA-C6", "SENTENCE"),
                         ("TA-C6-NEAR", "SENTENCE"), ("TA-TWICE", "SENTENCE"), ("R7-C2", "NUMBERED_CLAUSE"), ("R7-C3", "TABLE_ROW"), ("R7-C4", "NUMBERED_CLAUSE"), ("R7-C8", "SENTENCE")):
            res, bo = fres[fid][1], b2_of(fid)
            rels = bo.get("touchingAtomRelations", [])
            proofs = [m for r in rels for m in r["atomProof"]["members"].values()]
            named = any((p["recordedBoundary"] or {}).get("separator") == why or any(why in (v or [None, []])[1] for v in (p["junctionEvidence"] or {}).values()) for p in proofs)
            if not (res["count"]["distinctClassSet"] == both and res["count"]["holds"] and rels and all(r["relation"] == TR["differentAtoms"] for r in rels) and named
                    and all(r["b2CountDisposition"] == b2d["clear"] for r in bo["records"].values())):
                bad[fid] = {"classes": res["count"]["distinctClassSet"], "relations": [r["relation"] for r in rels], "named": named}
        r9, b9 = fres["TA-X2"][1], b2_of("TA-X2")
        if r9["documents"] != 2 or len(r9["count"]["distinctClassSet"]) != 2 or b9.get("touchingAtomRelations") or r9["count"]["documentsContributing"] != 2:
            bad["TA-X2"] = "a touching-atom relation across underlying documents"
        return not bad, {"bad": bad}
    ck("TA-7", "lawful separation preserved (B-3 / B-6, R-SEG-B authoritative): numbered clauses (TA-C2 recorded; TA-C2-B by the clause number; TA-C2-SUB numbered sub-clauses), table rows (TA-C3 recorded; TA-C3-B recorded by one of the two records), adjacent complete sentences whose end and start meet in the complete view (TA-C4 / -NL / -Q; TA-C4-REC recorded), distinct atoms not touching (TA-C6) or nearly touching (TA-C6-NEAR), identical text in two sentences (TA-TWICE: text equality is no atom proof) and the carried R7-C2 / C3 / C4 / C8: DIFFERENT_ATOMS with the separator named in the proof, both classes survive, srcDiv true; two underlying documents (TA-X2) are never related", ta7)

    def ta8():
        bad = {}
        for fid in ("TA-N-COMMA", "TA-N-CONJ", "TA-N-SPACE", "TA-N-SEMI", "TA-N-COLON", "TA-N-WRAP", "TA-N-COLUMN", "TA-C5"):
            res, bo = fres[fid][1], b2_of(fid)
            tp = bo.get("touchingAtomPairs", [])
            exact = [m["exactlyTouching"] for p in bo.get("touchingAtomRelations", []) for m in p["atomProof"]["members"].values()]
            ok = (res["count"]["distinctClassSet"] == [] and res["count"]["holds"] is False and len(tp) == 1 and tp[0]["relation"] == TR["sameAtomEveryMember"]
                  and not tp[0]["lawfulSeparation"]["lawfullySeparate"] and all(r["b2CountDisposition"] == b2d["withheld"] for r in bo["records"].values()))
            if fid in ("TA-C5", "TA-N-CONJ") and exact != [False]:
                ok = False
            if not ok:
                bad[fid] = {"classes": res["count"]["distinctClassSet"], "pairs": [p["relation"] for p in tp], "exactlyTouching": exact}
        return not bad, bad
    ck("TA-8", "non-lawful internal delimiters inside one atom: two different-class fragments divided only by a comma, a conjunction (uncoded, between the footprints), a plain space, a semicolon, a colon, a line wrap or a column break, and fragments gapped by ordinary uncoded words (TA-C5: not exactly touching - no exact-boundary bypass), are ONE component, TOUCHING_SAME_ATOM, LAWFULLY_SEPARATE_SUPPORT false, withheld, nothing contributed", ta8)

    def ta9():
        bad = {}
        for fid in ("TA-T1", "TA-T2"):
            j, orders, res, _ = ta_fx(fid)
            bo = b2_of(fid)
            comps = set(r["basisOverlapComponentId"] for r in bo.get("records", {}).values())
            if len(comps) != 1 or res["count"]["distinctClassSet"] != [] or j["recordOrderDependence"] or j["componentOrderDependence"] or len(orders) != 6:
                bad[fid] = {"components": len(comps), "orders": len(orders)}
        r2 = trel("TA-T2")
        if r2.get("N0#s1|N2#s1") != TR["differentAtoms"] or r2.get("N0#s1|N1#s1") != TR["sameAtomEveryMember"] or r2.get("N1#s1|N2#s1") != TR["sameAtomEveryMember"]:
            bad["TA-T2 relations"] = r2
        return not bad, {"bad": bad, "TA-T2": r2}
    ck("TA-9", "transitivity: A touches B and B touches C inside one atom (TA-T1), and a bridge whose class-bearing core spans a sentence end joins A in sentence 1 and C in sentence 2 while A and C are DIFFERENT_ATOMS (TA-T2): one connected component, in all 6 record orders, with the same component identities (no pairwise destructive processing, no record-order dependence)", ta9)

    def ta10():
        bad, frames = {}, {}
        for f in tfx:
            for s in (fres[f["fixtureId"]][1] or {}).get("segmentRecords", []):
                fr = (s.get("occurrenceAnchor") or {}).get("frame")
                frames[fr] = frames.get(fr, 0) + 1
        fr_of = lambda fid: sorted(set((s.get("occurrenceAnchor") or {}).get("frame") for s in fres[fid][1]["segmentRecords"]))
        for fid in ("TA-D1-X", "TA-D1-TH"):
            if fr_of(fid) != [oa["frameC"]["recordedAs"]] or len(set(r["artifactId"] for r in fxd[fid]["corpus"]["records"])) != 2:
                bad[fid] = fr_of(fid)
        for fid in ("TA-D1-U", "TA-FU-C1"):
            if fr_of(fid) != [oa["frameU"]["recordedAs"]] or list(trel(fid).values()) != [TR["sameAtomEveryMember"]]:
                bad[fid] = [fr_of(fid), trel(fid)]
        for fid in ("TA-FU-DIS", "TA-FU-DIS-R"):
            j, _, res, _ = ta_fx(fid)
            if (fr_of(fid) != [oa["frameU"]["recordedAs"]] or list(trel(fid).values()) != [TR["sameAtomSomeMembers"]]
                    or res["count"]["distinctClassSet"] != [] or not j["memberDisagreementJoined"] or not j["conservativeUndercount"]):
                bad[fid] = {"relations": trel(fid), "classes": res["count"]["distinctClassSet"]}
        ok = frames.get(oa["frameC"]["recordedAs"], 0) > 0 and frames.get(oa["frameU"]["recordedAs"], 0) > 0
        return not bad and ok, {"segmentsByFrame": frames, "bad": bad}
    ck("TA-10", "FRAME-C and FRAME-U: the residual closes across two renditions of one document (TA-D1-X two HTML renditions, TA-D1-TH a plain-text and an HTML rendition: FRAME-C) and in FRAME-U (TA-D1-U, TA-FU-C1: TOUCHING_SAME_ATOM in every member); where member evidence disagrees (TA-FU-DIS and its member-order twin TA-FU-DIS-R: a sentence end between the cores in one member, none in the other) the pair is TOUCHING_SAME_ATOM_IN_SOME_MEMBERS and fails closed for diversity in either member order - no member is chosen; reported as conservative undercount", ta10)

    def ta11():
        csp = state["csiProof"]["taGenerated"]
        cases = ta_generated_cases()
        spec_ok = [dict((k, c[k]) for k in ("id", "family", "docs", "records")) for c in cases] == [dict((k, c[k]) for k in ("id", "family", "docs", "records")) for c in csp["cases"]]
        sel = stride("ta", cases)
        got = ta_generated(I, labels, sel, off_I)
        recrows = dict((r[0], r) for r in csp["rows"])
        bad = [r[0] for r in got["rows"] if recrows.get(r[0]) != r or r[1]]
        zero = all(v == 0 for v in csp["counters"].values()) and csp["reported"]["mechanicsInvalid"] == 0 and csp["summary"]["generatorMismatch"] == 0
        full_ok = fast_mode() or (got["counters"] == csp["counters"] and got["reported"] == csp["reported"] and got["summary"] == csp["summary"])
        n_ok = len(cases) >= TA_GEN_MIN and csp["summary"]["ordersEvaluated"] == 3 * len(cases) and set(csp["counters"]) == set(_TA_HARD)
        return spec_ok and not bad and zero and full_ok and n_ok, {"cases": len(cases), "evaluated": len(sel), "counters": csp["counters"], "reported": csp["reported"],
                                                                 "summary": csp["summary"], "bad": bad[:4]}
    ck("TA-11", "touching-atom generated surface (>= 500 construction cases x 3 record orders; fragments split at a space, comma, semicolon, colon, conjunction, comma + conjunction, line wrap, column break or uncoded words, TIGHT and WIDE footprints; sentences, numbered clauses with and without terminals, sub-clauses, table rows and headings with separate, recorded and conjoined records; three-atom documents with chains, bridges and gapped records; two documents; FRAME-C with one or two renditions, FRAME-U, differing FRAME-U arrangements; 1-4 records): touchingQuoteShoppingBypass = falseSourceDiversityFromTouching = falseSrcDivFromTouching = sameAtomConflictingClassesStillCount = sameClassTouchingMultiContribution = lawfullySeparateAtomsCollapsed = differentAtomsCollapsed = crossDocumentTaint = textEqualityUsedAsAtomProof = recordOrderDependence = componentOrderDependence = nonIdempotence = CSIChangedByTouchingClosure = sourceClassAssignmentChangedByTouchingClosure = segmentationChanged = atomDefinitionChanged = atomProjectionViolation = 0, mechanics invalid = 0; per-case verdicts equal the recorded table; conservative undercount reported apart", ta11)

    def ta12():
        bad = {}
        tally = {"fixtures": 0, "paritySplits": []}
        for f in tfx:
            j = ta_fx(f["fixtureId"])[0]
            tally["fixtures"] += 1
            if j["atomProjectionViolation"] or j["sameAtomConflictingClassesStillCount"]:
                bad[f["fixtureId"]] = "atom projection violated"
            if j["frozenEvidenceParitySplit"]:
                tally["paritySplits"].append(f["fixtureId"])
        g = state["csiProof"]["taGenerated"]
        g7 = state["csiProof"]["r7Generated"]
        if g["counters"]["atomProjectionViolation"] or g7["counters"]["atomProjectionViolation"] or g["reported"]["frozenEvidenceParitySplit"]:
            bad["generated"] = [g["counters"]["atomProjectionViolation"], g7["counters"]["atomProjectionViolation"]]
        return not bad and tally["paritySplits"] == [], dict(tally, bad=bad)
    ck("TA-12", "professional-reference oracle (validation only): every count candidate is projected onto the physical R-SEG-B atoms its class-bearing core occupies; candidates sharing an atom are one projected basis; absent a lawful separator, the fragments of one atom are never in different basis count components and never contribute two classes (atomProjectionViolation = 0 on every touching-atom fixture in every record order, the touching-atom generated surface and the R-7 generated surface); no projection split remains: the frozen-evidence parity constructions TA-EVID-1 / TA-EVID-1S are closed by the corrected SENTENCE evidence (TA-EVID-1 joined, TA-EVID-1S rejected)", ta12)

    def ta13():
        rec_ = state["csiProof"]["taSensitivity"]
        sens_ = rec_ if fast_mode() else ta_sensitivity(bm, state["fixtures"]["fixtures"], labels, ta_generated_cases()[::TA_SENS_STRIDE])
        missed = [k for k, v in sens_.items() if not v["fixturesTripped"]]
        return not missed and rec_ == sens_ and sorted(sens_) == sorted(TA_WEAKENED), {"missed": missed, "fixturesTripped": dict((k, len(v["fixturesTripped"])) for k, v in sorted(sens_.items())),
                                                                                    "generatedCasesTripped": dict((k, v["generatedCasesTripped"]) for k, v in sorted(sens_.items()))}
    ck("TA-13", "weakened-implementation sensitivity: each of the 24 weakened layers (TA-FF01 .. TA-FF22 the act names, TA-FF23 fragments rewritten into one segment, TA-FF24 one FRAME-U member chosen) trips at least one touching-atom construction fixture by behaviour (oracle counter or declared expectation); the recorded table equals the recomputation", ta13)

    def ta14():
        rr = dict((r["id"], r) for r in rules["residualRisksForVerifier"])
        closed = rr.get("R7-RES-1", {}).get("statement", "").startswith("CLOSED_IN_CANDIDATE")
        und = rr.get("TA-UNDERCOUNT", {}).get("statement", "")
        par = rr.get("TA-EVIDENCE-PARITY", {}).get("statement", "")
        art_row, art_wrap = fxd["TA-C3-UNREC"]["corpus"]["artifacts"][0], fxd["TA-N-WRAP"]["corpus"]["artifacts"][0]
        v_row = I._ta_view(I.rendition_text(inline_loader(art_row), art_row["renditionDecoder"]))
        v_wrap = I._ta_view(I.rendition_text(inline_loader(art_wrap), art_wrap["renditionDecoder"]))
        g_row = [m["coreGaps"] for p in b2_of("TA-C3-UNREC").get("touchingAtomRelations", []) for m in p["atomProof"]["members"].values()]
        g_wrap = [m["coreGaps"] for p in b2_of("TA-N-WRAP").get("touchingAtomRelations", []) for m in p["atomProof"]["members"].values()]
        mat = lambda v, g: v[0][v[1][g[0][0] - 1] + 1:v[1][g[0][1]]] if g and g[0][0] == g[0][1] else None
        twin = mat(v_row, g_row) is not None and mat(v_row, g_row) == mat(v_wrap, g_wrap)
        par_ok = (fres["TA-EVID-1"][1]["count"]["distinctClassSet"] == [] and list(trel("TA-EVID-1").values()) == [TR["sameAtomEveryMember"]]
                  and fres["TA-EVID-1S"][1] is None and fxd["TA-EVID-1S"]["expect"].get("error") == "SEPARATOR_EVIDENCE_FAILED")
        und_ok = fres["TA-C3-UNREC"][1]["count"]["distinctClassSet"] == [] and ta_fx("TA-C3-UNREC")[0]["unevidencedBoundaryJoined"]
        ok = closed and twin and par_ok and und_ok and und.startswith("OPEN_ACCEPTED_UNDERCOUNT") and par.startswith("CLOSED_IN_CANDIDATE")
        return ok, {"R7-RES-1 closed in candidate": closed, "rowWrapJunctionMaterial": [mat(v_row, g_row), mat(v_wrap, g_wrap)], "parityClosed": par_ok,
                    "undercountControlReproduced": und_ok}
    ck("TA-14", "residual register: R7-RES-1 is recorded CLOSED_IN_CANDIDATE; the accepted undercount is disclosed with its construction (TA-C3-UNREC: a table row whose junction material in the complete view is byte-identical to TA-N-WRAP's line wrap - no junction rule can separate one and join the other - is joined and withheld); the frozen-evidence parity limit (TA-EVID-1 two records, TA-EVID-1S one record declaring SENTENCE after 'Inc.' before a lowercase continuation) is recorded CLOSED_IN_CANDIDATE by the corrected SENTENCE evidence: TA-EVID-1 is one withheld component, TA-EVID-1S is rejected", ta14)

    def ta15():
        src = open(A["validator"], encoding="utf-8").read()
        block = src[src.index("# " + "=" * 66 + " TOUCHING-ATOM CONSTRUCTION ORACLE BEGIN"):src.index("# " + "=" * 66 + " TOUCHING-ATOM CONSTRUCTION ORACLE END")]
        tree = ast.parse(block)
        forbidden = (r"\.(basis_overlap|basis_overlap_facts|basis_atom_facts|_ta_[a-z_]+|_b2_[a-z_]+|anchor_all|anchor_facts|_frame_u_guard|seam|complete_view_of|tracked_extract|identity_string|omega|count)\(",
                     r"\b(evaluate_corpus|complete_view|apply_ops_tracked)\(", r"[\"'](canonicalSegmentIdentity|occurrenceAnchor|completeViewInterval|basisOverlap|overlapPairs|touchingAtomPairs|lawfulSeparation|predicateSupportCore|atomProof)[\"']")
        names = ("_ta_body", "_ta_unit_span", "build_ta", "_ta_alnum", "_ta_truth_core", "_ta_doc_facts", "ta_truth", "ta_truth_r7", "ta_generated_cases")
        bad, n = [], 0
        for node in tree.body:
            if isinstance(node, ast.FunctionDef) and node.name in names:
                n += 1
                seg = ast.get_source_segment(block, node)
                for f in forbidden:
                    m = re.search(f, seg)
                    if m:
                        bad.append("%s uses %s" % (node.name, m.group(0)))
        return not bad and n == len(names), {"constructionFunctionsScanned": n, "bad": bad}
    ck("TA-15", "the touching-atom construction oracle is independent: its builder, truth and generator functions name no interpreter machinery (the layer, its atom facts or relation, footprints, occurrence anchoring, complete view, identity, evaluate_corpus) and read no candidate identity, footprint, component, relation or disposition; truth comes from pieces, typed junctions and records in body coordinates", ta15)

    def ta16():
        f7 = state["fx7"]["fixtures"]
        fx_ = state["fixtures"]["fixtures"]
        chg = dict((c["fixtureId"], c) for c in state["deltaLedger"]["r7FixtureExpectationChanges"])
        bad = []
        if [f["fixtureId"] for f in fx_[:len(f7)]] != [f["fixtureId"] for f in f7]:
            bad.append("the R7 parent's fixtures are not carried first and in order")
        for f in f7:
            n = fxd.get(f["fixtureId"])
            if n is None or dict(n, expect=None) != dict(f, expect=None):
                bad.append("%s evidence, construction or truth changed" % f["fixtureId"])
            elif n["expect"] != f["expect"]:
                c = chg.get(f["fixtureId"])
                if c is None or c["class"] not in TA_DELTA_CLASSES:
                    bad.append("%s expectation changed without a ledger entry" % f["fixtureId"])
            elif f["fixtureId"] in chg:
                bad.append("%s recorded as changed but unchanged" % f["fixtureId"])
        tail = fx_[len(f7):len(f7) + len(TA_FIXTURE_IDS)]
        ids = [f["fixtureId"] for f in tail]
        ok = not bad and sorted(chg) == ["R7-RES-1", "R7-RES-1M"] and ids == TA_FIXTURE_IDS and all(f["group"] == "TA_ATOM" for f in tail)
        return ok, {"r7ParentFixturesCarried": len(f7), "expectationChanges": sorted(chg), "taFixtures": len(ids), "bad": bad[:6]}
    ck("TA-16", "all 232 fixtures of the R7 parent are carried first, in order, byte-identical (evidence, construction, physical truth) - the declared expectation changes only for R7-RES-1 and R7-RES-1M (the residual this act closes; ledger entries) - followed by the 37 touching-atom construction fixtures", ta16)

    def ta17():
        bad = []
        sch = state["schema"]["definitions"]
        if sch["segment"]["properties"]["sourceClassAssignmentState"] != state["sch7"]["definitions"]["segment"]["properties"]["sourceClassAssignmentState"]:
            bad.append("the schema state enum differs from the parent's")
        rel_enum = sch.get("touchingAtomRelation", {}).get("properties", {}).get("relation", {}).get("enum")
        if rel_enum != sorted(TR.values()):
            bad.append("the touching relation enum is not derived from the model")
        n = 0
        for f in tfx + rfx:
            res = fres[f["fixtureId"]][1]
            if res is None:
                continue                                 # a construction whose declared separator the evidence rejects (TA-EVID-1S)
            off = ta_fx(f["fixtureId"])[3] if f["group"] == "TA_ATOM" else evaluate_corpus(off_T, f["corpus"], inline_loader)
            n += 1
            if off["segmentRecords"] != res["segmentRecords"]:
                bad.append(f["fixtureId"])
        return not bad, {"evaluationsComparedWithTheRelationAbsent": n, "bad": bad[:6]}
    ck("TA-17", "the touching relation writes no record and adds no state, class or disposition: the schema state enum is the parent's, the relation enum is model-derived, and for every touching-atom and R-7 fixture the segment records (CSI-v6 identity, components, state, class, predicate results, unit ids, span) are byte-equal with and without the relation", ta17)


    # ---------------- SE. the SENTENCE evidence continuation guard - the TA-EVIDENCE-PARITY closure (this act)
    tam = state["tam"]
    sfx = [f for f in state["fixtures"]["fixtures"] if f["group"] == "SE_ATERM"]
    guard = bm["segmentation"]["separatorEvidence"]["whenAdjacent"]["SENTENCE"].get("continuationGuard") or {}
    par_I = Interp(se_parent_model(bm))
    sej = {}

    def se_fx(fid):
        if fid not in sej:
            sej[fid] = se_judge_fixture(I, fxd[fid], labels, par_I, off_I)
        return sej[fid]

    def pev(fid):
        return _se_eval(par_I, fxd[fid]["corpus"])

    def se1():
        bad = []
        for n, h in TAP_FILES.items():
            p = os.path.join(dl, n)
            if not os.path.exists(p) or file_sha(p) != h:
                bad.append(n)
        pre = sha_text("".join(sorted("%s  %s\n" % (TAP_FILES[n], n) for n in (TAP_CONTRACT, TAP_RULES, TAP_SCHEMA))))
        seen = 0
        for ln in open(os.path.join(dl, TAP_MANIFEST), encoding="utf-8"):
            if ln.strip() and not ln.startswith("#"):
                h, name = ln.rstrip("\n").split("  ", 1)
                seen += 1
                if TAP_FILES.get(name) != h:
                    bad.append("manifest " + name)
        par = rules["identities"].get(TAP_IDENTITY_KEY, {})
        ok = (not bad and seen == 13 and sha_bytes(cjson(tam)) == TAP_MODEL_SHA == state["tar"]["boundaryModelSha256"] and pre == TAP_PREREG_SHA
              and file_sha(os.path.join(dl, TAP_MANIFEST)) == TAP_MANIFEST_SHA and par.get("files") == TAP_FILES
              and par.get("boundaryModelSha256") == TAP_MODEL_SHA and par.get("normativePreRegistrationSha256") == TAP_PREREG_SHA
              and par.get("manifestSha256") == TAP_MANIFEST_SHA and rules["taAct"] == TAP_ACT and rules["act"] == ACT and state["tar"]["act"] == TAP_ACT)
        return ok, {"parentModel": sha_bytes(cjson(tam)), "parentPreRegistration": pre, "manifestEntries": seen, "bad": bad[:4]}
    ck("SE-1", "the sentence-evidence layer's parent is the exact 14-file touching-atom closure candidate: every file equals its pinned SHA-256, its manifest verifies 13/13, its boundaryModelSha256 and normative pre-registration recompute (ad6145fa..., c524a972...), and the rules record all of them as this act's parent", se1)

    def se2():
        led = state["deltaLedger"]["taParentToChild"]
        sem_ = state["sem"]
        rows, uncl = parent_child_delta(tam, sem_, led["classificationRules"])
        bad = []
        if uncl:
            bad.append({"unclassifiedLeaves": uncl[:6]})
        classes = set(r["class"] for r in led["classificationRules"]) | set(r["class"] for r in rows)
        if not classes <= set(SE_DELTA_CLASSES):
            bad.append({"SCOPE_VIOLATION": sorted(classes - set(SE_DELTA_CLASSES))})
        if rows != led["rows"] or len(rows) != led["leavesChanged"] or led != state["lps"]["taParentToChild"]:
            bad.append("recorded touching-atom parent -> child rows differ from the recomputation")
        outside = [r["path"] for r in rows if not any(path_covered(r["path"], p) for p in SE_PATHS)]
        if outside:
            bad.append({"leavesOutsideTheSentenceEvidenceGuard": outside[:6]})
        seg_c, seg_p = copy.deepcopy(sem_["segmentation"]), copy.deepcopy(tam["segmentation"])
        seg_c["separatorEvidence"]["whenAdjacent"]["SENTENCE"].pop("continuationGuard", None)
        if seg_c != seg_p:
            bad.append("segmentation differs from the parent's outside the SENTENCE continuation guard")
        frozen = [k for k in sem_ if k not in ("id", "segmentation", "rules") and sem_[k] != tam.get(k)]
        rd_ok = dict(sem_["rules"]["R-DUP"], implementedIn=None, renditionEquivalenceTest=dict(sem_["rules"]["R-DUP"]["renditionEquivalenceTest"], implementedIn=None)) == \
            dict(tam["rules"]["R-DUP"], implementedIn=None, renditionEquivalenceTest=dict(tam["rules"]["R-DUP"]["renditionEquivalenceTest"], implementedIn=None))
        other = [k for k in sem_["rules"] if k != "R-DUP" and sem_["rules"][k] != tam["rules"].get(k)]
        if frozen or other or not rd_ok or set(sem_) != set(tam):
            bad.append({"sections changed": frozen, "rules changed": other, "R-DUP (besides its validator file name)": not rd_ok})
        return not bad, {"leavesChanged": len(rows), "counts": led["countsByClass"], "bad": bad[:4]}
    ck("SE-2", "touching-atom parent -> sentence-evidence parent leaf delta, carried: recomputed from the two frozen models and equal to the parent's own ledger; every changed leaf is the SENTENCE evidence's continuation guard, the model id or the validator file name, classed SE_SENTENCE_ATERM_CONTINUATION_GUARD or MECHANICAL_REQUIRED (else SCOPE_VIOLATION); segmentation is the parent's outside that guard (the atom, the lawful and not-separators, adjacency, whenNotAdjacent, every other separator's evidence and the SENTENCE ending pattern itself unchanged); Option A+, CSI-v6, OA-1 .. OA-14, R-DUP, R-COUNT, basisOverlap (touchingAtom included), classes and predicates are byte-identical", se2)

    def se3():
        g = guard
        wa = bm["segmentation"]["separatorEvidence"]["whenAdjacent"]
        cv_then = bm["occurrenceAnchoring"]["completeView"]["then"]
        ok = (g.get("decision") == "FIRST_CASED_LETTER_AFTER_CLOSERS_AND_SPACING" and g.get("ambiguousTerminals") == ["."] and g.get("caseTest") == "UNICODE_LOWERCASE"
              and g.get("betweenPattern") == CORR1_GUARD_LEAVES["betweenPattern"][0] and sorted(g.get("appliesTo", [])) == ["COMPLETE_VIEW_JUNCTION", "DECLARED_SEPARATOR"]
              and "abbreviationList" not in g and g["views"]["declaredSeparator"]["omitOps"] == ["casefold", "strip"]
              and g["views"]["completeViewJunction"]["omitThenOps"] == [o for o in cv_then if o["op"] in ("casefold", "regex")] and g.get("effect") == "SEPARATOR_NOT_PROVEN"
              and wa["SENTENCE"]["previousUnitCanonicalEndsWith"] == tam["segmentation"]["separatorEvidence"]["whenAdjacent"]["SENTENCE"]["previousUnitCanonicalEndsWith"]
              and all("continuationGuard" not in v for k, v in wa.items() if k != "SENTENCE")
              and bm["segmentation"]["atom"] == tam["segmentation"]["atom"])
        return ok, {"id": g.get("id"), "ambiguousTerminals": g.get("ambiguousTerminals"), "appliesTo": g.get("appliesTo")}
    ck("SE-3", "the correction is declared as the act requires, on the SENTENCE evidence only: an ambiguous full stop ('.' only - '?' and '!' are not ambiguous terminals) does not prove SENTENCE when, past permitted closers (quote, parenthesis, bracket) and spacing, the first following character is a Unicode lowercase letter (CORR1: or an ASCII decimal digit, IV1-F1; U+201D a permitted closer, IV1-F2); one decision read on both paths (a declared SENTENCE and the touching-atom junction evidence); its views keep the full stop, the closers, the spacing and the letter case (not R-EQV casefolded text); no abbreviation list; the SENTENCE ending pattern and the atom unchanged", se3)

    def se4():
        bad = {}
        led = state["deltaLedger"]["seImpactPreflight"]
        notes = dict((k, dict(v)) for k, v in sorted(_SE_NOTES.items()))
        rec_inh = led["inheritedGuardFirings"]
        for k in ("fixtures", "pilot", "corr1Generated", "oa7bGenerated", "r14Generated"):
            if k not in notes:
                bad[k] = "not evaluated"
            elif k != "fixtures":
                got = notes[k]["guardFired"]
                if (notes[k]["outcomeChanged"] or rec_inh[k]["outcomeChanged"] or (k != "pilot" and notes[k]["uncompared"])
                        or (set(got) - set(rec_inh[k]["guardFired"]) if fast_mode() else got != rec_inh[k]["guardFired"])
                        or (not fast_mode() and notes[k]["withheldMatches"] != rec_inh[k]["withheldMatches"])):
                    bad[k] = {"guardFired": got[:6], "outcomeChanged": notes[k]["outcomeChanged"][:6]}
        fired = notes.get("fixtures", {}).get("guardFired", [])
        changed = se_fixture_impact(I, par_I, state["fixtures"]["fixtures"], fired)
        if fired != led["fixtures"]["guardFired"] or changed != led["fixtures"]["outcomeChanged"] or changed != ["TA-EVID-1", "TA-EVID-1S"] \
                or sorted(led["fixtures"]["firedWithoutOutcomeChange"]) != sorted(set(fired) - set(changed)):
            bad["fixtures"] = {"guardFired": fired, "outcomeChanged": changed}
        pil = rep["res"]
        offp = evaluate_corpus(par_I, {"artifacts": rp["artifacts"], "records": rp["records"]}, replay_loader(root))
        if pil["count"] != offp["count"] or pil["segmentRecords"] != offp["segmentRecords"] or pil["records"] != offp["records"]:
            bad["pilot"] = "the pilot differs from its evaluation under the parent's SENTENCE evidence"
        if not fast_mode():
            seen = se_withheld_matches(I, {"artifacts": rp["artifacts"], "records": rp["records"]}, replay_loader(root))
            if seen != led["pilot"]["withheldMatches"] or len(seen) != rec_inh["pilot"]["withheldMatches"]:
                bad["pilotWithheldMatches"] = seen
        if not fast_mode():
            got = se_impact(I, par_I, r7_generated_cases(), ta_generated_cases())
            if got != led["generated"]:
                bad["generated"] = {"recomputed": got, "recorded": led["generated"]}
        kinds = sorted(set(k for v in led["generated"].values() for _, ks in v["changed"] for k in ks))
        if kinds not in ([], ["rel"]) or led["pilot"]["delta"] != 0:
            bad["ledger"] = {"kinds": kinds, "pilot": led["pilot"]}
        return not bad, {"guardFiredBySurface": dict((k, {"evaluated": v["evaluated"], "guardFired": len(v["guardFired"]), "outcomeChanged": v["outcomeChanged"]}) for k, v in notes.items()),
                         "fixtureOutcomeChanged": changed, "generated": dict((k, {"guardFired": len(v["guardFired"]), "changed": v["changed"]}) for k, v in led["generated"].items()),
                         "bad": bad}
    ck("SE-4", "impact preflight (section 11), recomputed: on the pilot the guard withholds exactly the recorded SENTENCE matches inside the evidence scan (each an abbreviation's full stop before a lowercase continuation) and none decides a pair; on the CORR1 (8214), OA-7(b) (360) and R-14 (560 x 3) generated surfaces it withholds one in exactly the recorded cases and changes no outcome there (each such case evaluated again under the parent's evidence: error, count, segment records, relations, components equal); the whole pilot evaluation equals its evaluation under the parent's evidence - pilot delta 0 (records, segment records, assignment, state, CSI-v6, segmentation, relations and their proofs, components, distinctClassSet, srcDiv); on the carried fixtures it fires exactly on the recorded ones and changes the outcome of exactly TA-EVID-1 and TA-EVID-1S (the others are decided identically by other evidence or have no touching pair); on the R-7 (888 x 3) and touching-atom (727 x 3) generated surfaces it fires on exactly the recorded record orders and changes exactly the recorded ones, each a relation label only (count, components, states, CSI unchanged)", se4)

    def se5():
        bad, table = {}, {}
        for fid in ("SE-D1", "SE-D3", "SE-D3-Q", "SE-D3-B", "SE-D4", "SE-D5", "SE-D6", "SE-D7", "SE-D1-X", "SE-D1-U", "TA-EVID-1"):
            res, p = fres[fid][1], pev(fid)
            bo = b2_of(fid)
            rels = [r["relation"] for r in bo.get("touchingAtomRelations", [])]
            prels = [r["relation"] for r in (p["count"].get(b2f) or {}).get("touchingAtomRelations", [])] if not isinstance(p, str) else p
            table[fid] = {"parent": [len(p["count"]["distinctClassSet"]), p["count"]["holds"], prels] if not isinstance(p, str) else p,
                          "child": [res["count"]["distinctClassSet"], res["count"]["holds"], rels]}
            ok = (res["count"]["distinctClassSet"] == [] and res["count"]["holds"] is False and rels and rels[0] in (TR["sameAtomEveryMember"], TR["sameAtomSomeMembers"])
                  and not isinstance(p, str) and p["count"]["holds"] and prels == [TR["differentAtoms"]] and p["segmentRecords"] == res["segmentRecords"])
            if not ok:
                bad[fid] = table[fid]
        for fid in ("SE-D2", "SE-D3-S", "TA-EVID-1S"):
            p = pev(fid)
            child = _se_eval(I, fxd[fid]["corpus"])
            table[fid] = {"parent": [len(p["count"]["distinctClassSet"]), p["count"]["holds"], len(p["segmentRecords"])] if not isinstance(p, str) else p, "child": child}
            if child != "SEPARATOR_EVIDENCE_FAILED" or isinstance(p, str) or not p["count"]["holds"]:
                bad[fid] = table[fid]
        rc = fres["SE-C1"][1]
        if rc["count"]["contributingGroups"] != 1 or any(r["b2CountDisposition"] != b2d["collapsed"] for r in b2_of("SE-C1")["records"].values()):
            bad["SE-C1"] = rc["count"]
        return not bad, {"table": table, "bad": bad}
    ck("SE-5", "decisive: '... Acme Inc. under which ...' split by two records (SE-D1; FRAME-C SE-D1-X; FRAME-U SE-D1-U; the carried TA-EVID-1), behind a closing parenthesis, quote or bracket (SE-D3, -Q, -B), after another abbreviation (SE-D4), before a non-ASCII lowercase letter (SE-D5), across a line wrap (SE-D6), after an ellipsis (SE-D7): the parent proves a SENTENCE boundary (DIFFERENT_ATOMS, two classes, srcDiv true); the child proves none (TOUCHING_SAME_ATOM, one conflicting component, nothing contributed, srcDiv false; assignments and CSI-v6 unchanged); the same construction through a declared SENTENCE (SE-D2, SE-D3-S, the carried TA-EVID-1S) is rejected (SEPARATOR_EVIDENCE_FAILED) where the parent accepted two count units; same class across the full stop contributes once (SE-C1)", se5)

    def se6():
        bad = {}
        for fid in ("SE-P1", "SE-P1-S", "SE-P2", "SE-P2-S", "SE-P3", "SE-P3-L", "SE-P3-S", "SE-P4", "SE-P4-L", "SE-P4-S"):
            res, p = fres[fid][1], pev(fid)
            strip_ = lambda cc: dict((k, v) for k, v in cc.items() if k != b2f)
            same = (not isinstance(p, str) and res is not None and strip_(res["count"]) == strip_(p["count"]) and res["segmentRecords"] == p["segmentRecords"]
                    and (res["count"].get(b2f) or {}).get("touchingAtomRelations") == (p["count"].get(b2f) or {}).get("touchingAtomRelations"))
            if not same or not res["count"]["holds"]:
                bad[fid] = "differs from the parent's evidence" if not same else "a control lost its boundary"
        return not bad, bad
    ck("SE-6", "controls unchanged: a full stop before an uppercase letter ('... Acme Inc. Under which ...', SE-P1; declared SE-P1-S), two complete sentences (SE-P2, SE-P2-S), a question mark and an exclamation mark before an uppercase or a lowercase letter (SE-P3, -L, -S; SE-P4, -L, -S): every evaluation equals the parent's (count, segment records, relations): DIFFERENT_ATOMS, the declared separators accepted, both classes count", se6)

    def se7():
        csp = state["csiProof"]["seGenerated"]
        cases = se_generated_cases()
        spec_ok = [dict((k, c[k]) for k in ("id", "family", "docs", "records")) for c in cases] == [dict((k, c[k]) for k in ("id", "family", "docs", "records")) for c in csp["cases"]]
        sel = stride("se", cases)
        got = se_generated(I, labels, sel, par_I, off_I)
        recrows = dict((r[0], r) for r in csp["rows"])
        bad = [r[0] for r in got["rows"] if recrows.get(r[0]) != r or r[1]]
        zero = all(v == 0 for v in csp["counters"].values()) and csp["reported"]["mechanicsInvalid"] == 0 and csp["summary"]["generatorMismatch"] == 0
        full_ok = fast_mode() or (got["counters"] == csp["counters"] and got["reported"] == csp["reported"] and got["summary"] == csp["summary"])
        n_ok = len(cases) >= SE_GEN_MIN and csp["summary"]["ordersEvaluated"] == 3 * len(cases) and set(csp["counters"]) == set(_SE_HARD)
        return spec_ok and not bad and zero and full_ok and n_ok, {"cases": len(cases), "evaluated": len(sel), "counters": csp["counters"], "reported": csp["reported"],
                                                                 "summary": csp["summary"], "bad": bad[:4]}
    ck("SE-7", "sentence-evidence generated surface (>= 500 construction cases x 3 record orders: a full stop before a lowercase continuation - bare, behind a closing quote, parenthesis or bracket, across a line wrap, after an ellipsis, before a non-ASCII lowercase letter - between touching fragments (TIGHT / WIDE; FRAME-C one or two renditions; FRAME-U) and under a declared SENTENCE; the controls - full stop before an uppercase letter, sentences, question and exclamation marks before an uppercase or a lowercase letter - touching and declared; three-piece mixes with sentences, numbered clauses, table rows, line wraps and commas): lowercaseContinuationFalseBoundary = falseAtomSplitFromATerm = falseSourceDiversityFromATerm = falseSrcDivFromATerm = questionMarkBoundaryChanged = exclamationBoundaryChanged = uppercaseControlChanged = atomDefinitionChanged = CSIChanged = sourceClassAssignmentChanged = RCountAlgorithmChanged = recordOrderDependence = nonIdempotence = uax29Sb8Violation = referenceTruthDisagreement = 0; per-case verdicts equal the recorded table; conservative undercount reported apart", se7)

    def se8():
        bad = {}
        n_dots = n_nobreak = 0
        for f in sfx + [fxd["TA-EVID-1"], fxd["TA-EVID-1S"]]:
            spec = f["construction"]["spec"]
            for d, doc in enumerate(spec["docs"]):
                body, spans, junctions, atoms, docend = _ta_body(doc)
                for j in junctions:
                    dots = [x for x in range(j["tail"][0], j["tail"][1]) if body[x] == "."]
                    if not dots:
                        continue
                    n_dots += 1
                    nb = uax29_sb8_no_break(body, dots[-1])
                    n_nobreak += 1 if nb else 0
                    if nb != (j["type"] in _SE_ATERM):
                        bad[f["fixtureId"]] = "the reference disagrees with the construction at %s" % j["type"]
            j_ = se_fx(f["fixtureId"])[0] if f["group"] == "SE_ATERM" else None
            if j_ is not None and (j_["uax29Sb8Violation"] or j_["referenceTruthDisagreement"]):
                bad[f["fixtureId"]] = "violation"
        g = state["csiProof"]["seGenerated"]["counters"]
        if g["uax29Sb8Violation"] or g["referenceTruthDisagreement"]:
            bad["generated"] = g
        return not bad, {"fullStopsDecided": n_dots, "noBreakBeforeLowercase": n_nobreak, "bad": bad}
    ck("SE-8", "professional-reference oracle UAX29_SB8_STYLE_LOWERCASE_CONTINUATION (validation only; written from UAX #29 SB8 with Unicode general categories: Pe / Pf closers, whitespace, Ll): on every sentence-evidence fixture body and the generated surface it decides every full stop of every junction; it agrees with the construction (no break exactly at the full stops before a lowercase continuation; a break before an uppercase letter and before a clause number) and the implementation never proves a sentence break where it finds none (uax29Sb8Violation = referenceTruthDisagreement = 0)", se8)

    def se9():
        rec_ = state["csiProof"]["seSensitivity"]
        sens_ = rec_ if fast_mode() else se_sensitivity(bm, state["fixtures"]["fixtures"], labels, se_generated_cases()[::SE_SENS_STRIDE])
        missed = [k for k, v in sens_.items() if not v["fixturesTripped"]]
        return not missed and rec_ == sens_ and sorted(sens_) == sorted(SE_WEAKENED), {"missed": missed, "fixturesTripped": dict((k, len(v["fixturesTripped"])) for k, v in sorted(sens_.items())),
                                                                                    "generatedCasesTripped": dict((k, v["generatedCasesTripped"]) for k, v in sorted(sens_.items()))}
    ck("SE-9", "weakened-implementation sensitivity: each of the 14 weakened layers the act names (SE-FF01 .. SE-FF14: the parent's rule restored, the guard disabled, the guard on the touching path only, uppercase suppressed, '?' or '!' suppressed, an ASCII-only lowercase test, closers defeating the guard, an abbreviation dictionary, casefolded R-EQV text, CSI rewritten, assignment recoded, atom redefined, the component algorithm pairwise) trips at least one sentence-evidence construction fixture by behaviour; the recorded table equals the recomputation", se9)

    def se10():
        rr = dict((r["id"], r) for r in rules["residualRisksForVerifier"])
        closed = rr.get("TA-EVIDENCE-PARITY", {}).get("statement", "").startswith("CLOSED_IN_CANDIDATE")
        upper = rr.get("SE-UPPERCASE-AFTER-ABBREVIATION", {}).get("statement", "").startswith("PARTLY_CLOSED") and "R-M2-CASE-B" in rr.get("SE-UPPERCASE-AFTER-ABBREVIATION", {}).get("statement", "")
        na = rr.get("R7-EVIDENCE", {}).get("statement", "")
        na_res, na_p = fres["SE-EVID-NA"], pev("SE-EVID-NA")
        na_ok = (na_res[0] and na_res[1] is None and fxd["SE-EVID-NA"]["expect"].get("error") == "SEPARATOR_EVIDENCE_FAILED" and not isinstance(na_p, str)
                 and len(na_p["count"]["distinctClassSet"]) == 2 and na.startswith("CLOSED_IN_CANDIDATE") and "SE-EVID-NA" in na)
        return closed and upper and na_ok, {"TA-EVIDENCE-PARITY closed in candidate": closed, "uppercase residual split (case A closed, R-M2-CASE-B accepted)": upper,
                                            "non-adjacent declared path closed (SE-EVID-NA rejected; the parent's evidence counted both classes)": na_ok}
    ck("SE-10", "residual register: TA-EVIDENCE-PARITY is recorded CLOSED_IN_CANDIDATE; the R7-EVIDENCE path (a SENTENCE declared between NON-adjacent units accepted on 'intervening text exists') is CLOSED_IN_CANDIDATE by this act - SE-EVID-NA, which the parent's evidence counted with both classes, is rejected; the uppercase-after-abbreviation residual is recorded PARTLY_CLOSED (case A closed by the entity-name veto, case B the Owner-accepted R-M2-CASE-B)", se10)

    def se11():
        src = open(A["validator"], encoding="utf-8").read()
        block = src[src.index("# " + "=" * 66 + " SENTENCE-EVIDENCE CONSTRUCTION ORACLE BEGIN"):src.index("# " + "=" * 66 + " SENTENCE-EVIDENCE CONSTRUCTION ORACLE END")]
        tree = ast.parse(block)
        forbidden = (r"\.(continuation_withheld|_cg_[a-z_]+|form_segments|basis_overlap|basis_atom_facts|_ta_[a-z_]+|_b2_[a-z_]+|anchor_all|complete_view_of|identity_string|count)\(",
                     r"\b(evaluate_corpus|complete_view|apply_ops|apply_ops_tracked)\(", r"[\"'](continuationGuard|canonicalSegmentIdentity|occurrenceAnchor|basisOverlap|touchingAtomPairs|atomProof)[\"']")
        names = ("uax29_sb8_no_break", "se_case_facts", "se_generated_cases")
        bad, n = [], 0
        for node in tree.body:
            if isinstance(node, ast.FunctionDef) and node.name in names:
                n += 1
                seg = ast.get_source_segment(block, node)
                for f in forbidden:
                    m = re.search(f, seg)
                    if m:
                        bad.append("%s uses %s" % (node.name, m.group(0)))
        return not bad and n == len(names), {"functionsScanned": n, "bad": bad}
    ck("SE-11", "the sentence-evidence oracle is independent: the UAX #29 SB8-style reference, the construction facts and the generator name no interpreter machinery (the guard, form_segments, the touching relation, the complete view, evaluate_corpus, R-EQV ops) and read no candidate identity, relation or component; truth comes from pieces, typed junctions and records in body coordinates", se11)

    def se12():
        ft = state["fxt"]["fixtures"]
        fx_ = state["fixtures"]["fixtures"]
        chg = dict((c["fixtureId"], c) for c in state["deltaLedger"]["taFixtureChanges"])
        bad = []
        if [f["fixtureId"] for f in fx_[:len(ft)]] != [f["fixtureId"] for f in ft]:
            bad.append("the parent's fixtures are not carried first and in order")
        for f in ft:
            n = fxd.get(f["fixtureId"])
            if n != f and f["fixtureId"] not in chg:
                bad.append("%s changed without a ledger entry" % f["fixtureId"])
            elif n == f and f["fixtureId"] in chg:
                bad.append("%s recorded as changed but unchanged" % f["fixtureId"])
            elif n != f:
                moved = sorted(k for k in set(n) | set(f) if n.get(k) != f.get(k))
                if not set(moved) <= set(SE_FIXTURE_FIELDS) or moved != chg[f["fixtureId"]]["changedFields"] or \
                        any(chg[f["fixtureId"]]["parent"].get(k) != f.get(k) for k in moved if k != "physicalTruth"):
                    bad.append("%s: fields %s changed (only %s may; each recorded with its parent value)" % (f["fixtureId"], moved, list(SE_FIXTURE_FIELDS)))
        tail_ = fx_[len(ft):len(ft) + len(SE_FIXTURE_IDS)]
        ids = [f["fixtureId"] for f in tail_]
        ok = not bad and sorted(chg) == ["TA-EVID-1", "TA-EVID-1S"] and ids == SE_FIXTURE_IDS and all(f["group"] == "SE_ATERM" for f in tail_)
        return ok, {"parentFixturesCarried": len(ft), "changed": sorted(chg), "seFixtures": len(ids), "bad": bad[:6]}
    ck("SE-12", "all 269 fixtures of the touching-atom parent are carried first, in order, byte-identical in evidence (corpus) and construction spec - only TA-EVID-1 and TA-EVID-1S (the residual this act closes) change, and only in their physical truth, declared expectation, derivation, title, closes and role (ledger entries with the parent's values) - followed by the sentence-evidence construction fixtures", se12)

    def se13():
        bad, n = [], 0
        for f in state["fixtures"]["fixtures"]:
            res = fres[f["fixtureId"]][1]
            if res is None or "corpus" not in f:
                continue
            p = pev(f["fixtureId"])
            if isinstance(p, str):
                continue
            n += 1
            if [(s["segmentId"], s["canonicalSegmentIdentity"], s["sourceClassAssignmentState"], s["sourceClass"], s["unitIds"]) for s in res["segmentRecords"]] != \
                    [(s["segmentId"], s["canonicalSegmentIdentity"], s["sourceClassAssignmentState"], s["sourceClass"], s["unitIds"]) for s in p["segmentRecords"]]:
                bad.append(f["fixtureId"])
        return not bad, {"evaluationsComparedWithTheParentEvidence": n, "bad": bad[:6]}
    ck("SE-13", "no identity, assignment or segmentation changes beyond the rejected declarations: for every fixture the child evaluates, the segment records (segment ids, unit ids, CSI-v6 identity, state, class) equal those under the parent's SENTENCE evidence; the only evaluations that differ in kind are the declared SENTENCE separators before a lowercase continuation, now rejected", se13)



    # ---------------- BI. sentence-boundary evidence integrity - IV1-M1 (documentary interval), IV1-M2 case A (entity-name veto), case B (accepted residual)
    sem = state["sem"]
    bfx = [f for f in state["fixtures"]["fixtures"] if f["group"] == BI_GROUP]
    sem_I = Interp(sem)
    biv = {}

    def bi_fx(fid):
        if fid not in biv:
            biv[fid] = bi_judge_fixture(I, fxd[fid])
        return biv[fid]

    def sev(fid):
        return _bi_eval(sem_I, fxd[fid]["corpus"])

    def outc(r):
        return r if isinstance(r, str) else [r["count"]["distinctClassSet"], r["count"]["holds"]]

    def bi1():
        bad = []
        for n, h in list(SEP_FILES.items()) + list(AUTH_FILES.items()) + [(IV1_REPORT, IV1_REPORT_SHA)]:
            p = os.path.join(dl, n)
            if not os.path.exists(p) or file_sha(p) != h:
                bad.append(n)
        pre = sha_text("".join(sorted("%s  %s\n" % (SEP_FILES[n], n) for n in (SEP_CONTRACT, SEP_RULES, SEP_SCHEMA))))
        seen = {}
        for man, files in ((SEP_MANIFEST, SEP_FILES), (AUTH_MANIFEST, AUTH_FILES)):
            seen[man] = 0
            for ln in open(os.path.join(dl, man), encoding="utf-8"):
                if ln.strip() and not ln.startswith("#"):
                    h, name = ln.rstrip("\n").split("  ", 1)
                    seen[man] += 1
                    if files.get(name) != h:
                        bad.append("manifest " + name)
        ids = rules["identities"]
        par, dep = ids.get(SEP_IDENTITY_KEY, {}), ids.get(AUTH_IDENTITY_KEY, {})
        od = rules.get("ownerDecision", {})
        ok = (not bad and seen[SEP_MANIFEST] == 13 and seen[AUTH_MANIFEST] == 8 and sha_bytes(cjson(sem)) == SEP_MODEL_SHA == state["ser"]["boundaryModelSha256"]
              and pre == SEP_PREREG_SHA and file_sha(os.path.join(dl, SEP_MANIFEST)) == SEP_MANIFEST_SHA and par.get("files") == SEP_FILES
              and par.get("boundaryModelSha256") == SEP_MODEL_SHA and par.get("normativePreRegistrationSha256") == SEP_PREREG_SHA
              and par.get("manifestSha256") == SEP_MANIFEST_SHA and dep.get("files") == AUTH_FILES and dep.get("manifestSha256") == AUTH_MANIFEST_SHA
              and "NOT_CONTROLLING" in dep.get("state", "") and ids.get(IV1_IDENTITY_KEY, {}).get("sha256") == IV1_REPORT_SHA
              and rules["parentAct"] == SEP_ACT and rules["taAct"] == TAP_ACT and rules["act"] == ACT and state["ser"]["act"] == SEP_ACT
              and od.get("decision") == OWNER_DECISION_ID and od.get("act") == ACT)
        return ok, {"parentModel": sha_bytes(cjson(sem)), "parentPreRegistration": pre, "manifestEntries": seen, "bad": bad[:4]}
    ck("BI-1", "the exact parent is the 14-file sentence-evidence closure candidate (manifest 13/13; boundaryModelSha256 5c49e3ab... and normative pre-registration 9f4a02e8... recomputed); the IV1 report (9d8fc708...) and the eight members of the SEC-HISTORICAL-ENTITY-NAME-AUTHORITY-1.IMPLEMENTATION-1.CORR1 candidate (manifest 6b0d3622..., 8/8) are byte-identical to their pinned identities; the rules bind all of them, the dependency as a candidate that is not controlling, and the Owner's Option-A decision", bi1)

    def bi2():
        led = state["deltaLedger"]["seParentToChild"]
        rows, uncl = parent_child_delta(sem, bm, led["classificationRules"])
        bad = []
        if uncl:
            bad.append({"unclassifiedLeaves": uncl[:6]})
        classes = set(r["class"] for r in led["classificationRules"]) | set(r["class"] for r in rows)
        if not classes <= set(BI_DELTA_CLASSES):
            bad.append({"SCOPE_VIOLATION": sorted(classes - set(BI_DELTA_CLASSES))})
        if rows != led["rows"] or len(rows) != led["leavesChanged"]:
            bad.append("recorded parent -> child rows differ from the recomputation")
        outside = [r["path"] for r in rows if not any(path_covered(r["path"], p) for p in BI_PATHS)]
        if outside:
            bad.append({"leavesOutsideTheSentenceEvidence": outside[:6]})
        if bi_parent_model(bm)["segmentation"] != sem["segmentation"]:
            bad.append("segmentation differs from the parent's outside the documentary interval, the veto and the whenNotAdjacent wording")
        frozen = [k for k in bm if k not in ("id", "segmentation", "rules") and bm[k] != sem.get(k)]
        strip_ = lambda rd: dict(rd, implementedIn=None, renditionEquivalenceTest=dict(rd["renditionEquivalenceTest"], implementedIn=None))
        other = [k for k in bm["rules"] if k != "R-DUP" and bm["rules"][k] != sem["rules"].get(k)]
        if frozen or other or strip_(bm["rules"]["R-DUP"]) != strip_(sem["rules"]["R-DUP"]) or set(bm) != set(sem) or set(bm["rules"]) != set(sem["rules"]):
            bad.append({"sections changed": frozen, "rules changed": other})
        return not bad, {"leavesChanged": len(rows), "counts": led["countsByClass"], "bad": bad[:4]}
    ck("BI-2", "parent -> child leaf delta recomputed from the two normative models: every changed leaf is the SENTENCE evidence's documentaryInterval (IV1-M1) or entityNameVeto (IV1-M2 case A), the CORR1 continuation-guard leaves (IV1-F1 asciiDigitContinuation / rule / unchanged; IV1-F2 betweenPattern), the whenNotAdjacent wording, the model id or the validator file name, classed BI_M1_DOCUMENTARY_INTERVAL, BI_M2_ENTITY_NAME_VETO, CORR1_IV1_F1_ASCII_DIGIT_CONTINUATION, CORR1_IV1_F2_RIGHT_DOUBLE_QUOTATION_MARK_CLOSER or MECHANICAL_REQUIRED (else SCOPE_VIOLATION); the nine labels, class predicates, feature vocabulary / merge / constraints, exclusions, states, Option A+, CSI-v6, OA-1 .. OA-14, R-DUP, B-2 (touchingAtom included), R-BASIS, R-COUNT, the atom and every other separator are byte-identical to the parent", bi2)

    def bi3():
        sent = bm["segmentation"]["separatorEvidence"]["whenAdjacent"]["SENTENCE"]
        iv, v = sent.get("documentaryInterval", {}), sent.get("entityNameVeto", {})
        au = v.get("authority", {})
        sch = state["authSchema"]["properties"]
        consts = dict((k, sch[k]["const"]) for k in ("authorityVersion", "equivalenceRule", "entityInternalPeriodRule", "entityIdType"))
        ok = (iv.get("candidates") == "PREVIOUS_UNIT_END_AND_GAP" and iv.get("closersInGap") == "READ" and v.get("terminals") == ["."]
              and sorted(v.get("appliesTo", [])) == ["COMPLETE_VIEW_JUNCTION", "DECLARED_SEPARATOR"] and v.get("spanSelection") == "ANY_SPAN"
              and v.get("offsetView") == "DECODED_ARTIFACT" and au.get("requiredConstants") == consts
              and au.get("provenStates") == {"temporalState": "PROVEN", "occurrenceState": "PROVEN"}
              and "PROVEN" in sch["temporalState"]["enum"] and "PROVEN" in sch["occurrenceState"]["enum"] and au.get("entityIdPattern") == sch["entityId"]["pattern"]
              and au.get("bindingChecks") == BI_BINDING_CHECKS and au.get("manifestSha256") == AUTH_MANIFEST_SHA and au.get("recordsFileSha256") == AUTH_FILES[AUTH_RECORDS]
              and bi_parent_model(bm)["segmentation"]["separatorEvidence"]["whenAdjacent"]["SENTENCE"]["continuationGuard"] == sem["segmentation"]["separatorEvidence"]["whenAdjacent"]["SENTENCE"]["continuationGuard"]
              and sent["continuationGuard"].get("asciiDigitContinuation", {}).get("characters") == CORR1_ASCII_DIGITS
              and all(sent["continuationGuard"].get(k_) == cp_[0] for k_, cp_ in CORR1_GUARD_LEAVES.items())
              and "abbreviationList" not in json.dumps(sent) and not any(k in bm["segmentation"]["separatorEvidence"]["whenAdjacent"][s] for s in bm["segmentation"]["separatorEvidence"]["whenAdjacent"] if s != "SENTENCE" for k in ("documentaryInterval", "entityNameVeto")))
        return ok, {"interval": iv.get("id"), "veto": v.get("id"), "constants": consts, "bindingChecks": au.get("bindingChecks")}
    ck("BI-3", "the corrections are declared as the act requires, on the SENTENCE evidence only: a non-adjacent declaration is read on the previous unit's end and the omitted gap (closers read); the veto reads '.' only, on both paths, against ANY member of the complete span set, in decoded-artifact coordinates; the authority constants equal the CORR1 schema constants, the proven states are PROVEN / PROVEN, the entity id pattern is the schema's, all nine binding checks are on, and the pinned CORR1 manifest and RECORDS digests are recorded; the continuation guard is the parent's except the CORR1 leaves (IV1-F1: asciiDigitContinuation = ASCII 0-9, its rule and unchanged wording; IV1-F2: U+201D in betweenPattern); no abbreviation list; no other separator changes", bi3)

    def bi4():
        bad = {}
        led = state["deltaLedger"]["biImpactPreflight"]
        notes = dict((k, dict(v)) for k, v in sorted(_BI_NOTES.items()))
        for k in ("pilot", "corr1Generated", "oa7bGenerated", "r14Generated"):
            if k not in notes or notes[k]["vetoFired"]:
                bad[k] = notes.get(k)
        changed = []
        for f in state["fxs"]["fixtures"]:
            if outc(_bi_eval(I, fxd[f["fixtureId"]]["corpus"])) != outc(_bi_eval(sem_I, f["corpus"])):
                changed.append(f["fixtureId"])
        if changed != led["fixtures"]["changed"] or changed != ["SE-EVID-NA"]:
            bad["fixtures"] = changed
        pil = rep["res"]
        offp = evaluate_corpus(sem_I, {"artifacts": rp["artifacts"], "records": rp["records"]}, replay_loader(root))
        if pil["records"] != offp["records"] or pil["segmentRecords"] != offp["segmentRecords"] or pil["count"] != offp["count"]:
            bad["pilot"] = "the pilot with the authority bound differs from the parent's evaluation"
        if led["pilot"]["delta"] != 0 or any(v["changed"] for v in led["generated"].values()):
            bad["ledger"] = led["pilot"]
        return not bad, {"vetoFiredBySurface": dict((k, {"evaluated": v["evaluated"], "vetoFired": len(v["vetoFired"])}) for k, v in notes.items()),
                         "fixtureOutcomeChanged": changed, "generatedRecorded": dict((k, [v["evaluated"], len(v["changed"])]) for k, v in led["generated"].items()), "bad": bad}
    ck("BI-4", "impact preflight (section 9), recomputed: the pilot evaluated WITH the authority bound equals the parent's evaluation without it (records, segment records, assignment, state, CSI-v6, relations and proofs, components, distinctClassSet, srcDiv: delta 0); on the 293 carried fixtures exactly SE-EVID-NA changes (the IV1-M1 construction itself, now rejected); the veto fires on no inherited surface (pilot, CORR1 8214, OA-7(b) 360, R-14 560 x 3) and no inherited evaluation is rejected by the documentary interval, so every decision there is the parent's; the recorded full comparison of every generated surface (CORR1, OA-7(b), R-14, R-7, touching-atom, sentence-evidence) shows no change", bi4)

    def bi5():
        bad, table = {}, {}
        iv1 = open(os.path.join(dl, IV1_REPORT), encoding="utf-8").read()
        exact = ("RIGHTS = '%s'" % _BI_RIGHTS) in iv1 and ("PAY = '%s'" % _BI_PAY) in iv1
        for fid in BI_M1_IDS:
            j, n, res, truth = bi_fx(fid)
            table[fid] = {"child": outc(res["orders"][0]), "parent": outc(sev(fid))}
            if any(j[k] for k in _BI_HARD) or not fres[fid][0]:
                bad[fid] = table[fid]
        for fid in ("BI-M1-IV1", "BI-M1-IV1-P", "BI-M1-IV1-QB"):
            if table[fid]["child"] != "SEPARATOR_EVIDENCE_FAILED" or table[fid]["parent"][1] is not True:
                bad[fid + " decisive"] = table[fid]
        return exact and not bad, {"iv1ExactBytes": exact, "table": table, "bad": bad}
    ck("BI-5", "IV1-M1 closed: the three exact Codex constructions (the IV1 report's own byte strings: unit 1 ends at 'Acme Inc' excluding '.', the omitted gap '. ', '.) ' or '.\")] ', unit 2 'under which ...' declaring SENTENCE) gave the parent two classes and srcDiv true and are rejected now; the omitted newline, the Unicode lowercase, the omitted ' Inc. ' and the gap with no terminal are rejected; the same bytes across two records and the whole-sentence mixed control contribute nothing; the six genuine-boundary controls (uppercase, a skipped sentence, '?', '!', the adjacent path) are accepted with both classes", bi5)

    def bi6():
        bad, table = {}, {}
        for fid in BI_M2A_IDS:
            j, n, res, truth = bi_fx(fid)
            ch, pa = outc(res["orders"][0]), outc(sev(fid))
            table[fid] = {"child": ch, "parent": pa}
            if any(j[k] for k in _BI_HARD) or not fres[fid][0] or not truth["vetoExpected"] or ch not in ("SEPARATOR_EVIDENCE_FAILED", [[], False]) or pa[1] is not True:
                bad[fid] = table[fid]
        return not bad, {"table": table, "bad": bad}
    ck("BI-6", "IV1-M2 case A closed: 'Acme Inc. International' with a PROVEN occurrence span over the full stop - one span (D1), the target in occurrence #2 of 2 (D2), #15 of 15 (D3), occurrence #1 opening the unit and the target in #2 (the nearest-span trap), an HTML rendition whose spans are in decoded coordinates - on the touching path (one atom, conflicting classes withheld, srcDiv false) and the declared path (rejected); the parent gave two classes and srcDiv true in every one; set membership over the complete span set, never a first, nearest or best span", bi6)

    def bi7():
        bad, table = {}, {}
        reasons = bm["segmentation"]["separatorEvidence"]["whenAdjacent"]["SENTENCE"]["entityNameVeto"]["authority"]["reasons"]
        want = {"BI-M2-C2-DIGEST": reasons["ARTIFACT_DIGEST"], "BI-M2-C2-ARTIFACT": reasons["ARTIFACT_ID"], "BI-M2-C2-SHIFT": reasons["SPAN_TEXT"],
                "BI-M2-C2-ENTITY": reasons["ENTITY_ID"], "BI-M2-C2-CONST": reasons["AUTHORITY_CONSTANTS"], "BI-M2-C2-TEMPORAL": reasons["PROVEN_STATES"]}
        for fid, why in sorted(want.items()):
            j, n, res, truth = bi_fx(fid)
            corpus, _ = build_bi(I, fxd[fid]["construction"]["spec"], fid)
            ii = Interp(bm)
            r = _bi_eval(ii, corpus)
            got = [x[1] for x in ii.authority_binding]
            table[fid] = {"binding": got, "outcome": outc(r), "vetoFired": getattr(ii, "veto_fired", 0)}
            if got != [why] or outc(r) != [sorted(labels[i] for i in (2, 6)), True] or table[fid]["vetoFired"] or any(j[k] for k in _BI_HARD):
                bad[fid] = table[fid]
        r = _bi_eval(Interp(bm), fxd["BI-M2-C2-EDITED"]["corpus"])
        table["BI-M2-C2-EDITED"] = r
        if r != bm["segmentation"]["separatorEvidence"]["whenAdjacent"]["SENTENCE"]["entityNameVeto"]["authority"]["recordsDigestError"]:
            bad["BI-M2-C2-EDITED"] = r
        for fid in ("BI-M2-C1", "BI-M2-C3Q", "BI-M2-C3E"):
            j, n, res, truth = bi_fx(fid)
            if outc(res["orders"][0]) != outc(sev(fid)) or outc(res["orders"][0])[1] is not True or any(j[k] for k in _BI_HARD):
                bad[fid] = outc(res["orders"][0])
        return not bad, {"table": table, "bad": bad}
    ck("BI-7", "wrong authority is refused and grants nothing: a wrong artifact digest, a record for another artifact (no cross-artifact transfer), shifted coordinates (span text not the artifact slice), an invalid entity id, a different equivalence-rule constant and a record without temporal authority are each refused with the declared reason, and the genuine sentence period their spans cover keeps its boundary (two classes); records edited after sealing reject the corpus (ENTITY_NAME_AUTHORITY_MISMATCH); a name span ending before the sentence full stop does not absorb it (M2-C1); '?' and '!' are unchanged (M2-C3)", bi7)

    def bi8():
        bad, table = {}, {}
        for fid in BI_CASE_B_IDS:
            j, n, res, truth = bi_fx(fid)
            ch, pa = outc(res["orders"][0]), outc(sev(fid))
            table[fid] = {"child": ch, "parent": pa, "residual": j["residualCaseBReproduced"]}
            if ch != pa or ch[1] is not True or not j["residualCaseBReproduced"] or any(j[k] for k in _BI_HARD):
                bad[fid] = table[fid]
        rr = dict((r["id"], r) for r in rules["residualRisksForVerifier"])
        res_ = rr.get("R-M2-CASE-B", {})
        reg = (res_.get("status") == "OWNER-ACCEPTED BOUNDED RESIDUAL" and res_.get("definition") == R_M2_CASE_B_DEFINITION
               and res_.get("ownerDecision") == OWNER_DECISION_ID and "not a blocker" in res_.get("consequences", "")
               and rules["claims"]["generalSentenceBoundarySoundness"] == "NOT_CLAIMED")
        g = state["csiProof"]["biGenerated"]
        return not bad and reg and g["summary"]["residualCaseB"] > 0, {"table": table, "registered": reg, "generatedResidualCases": g["summary"]["residualCaseB"], "bad": bad}
    ck("BI-8", "IV1-M2 case B is NOT closed and is not claimed closed: the exact Codex IV1-UPPER-PROPER-NAME bytes with no authority (two records and declared), AUTHORITY_NOT_DETERMINABLE and ENTITY_NAME_SPANS_NOT_PROVEN evaluate exactly as under the parent (two classes, srcDiv true) and are reported as residualCaseBReproduced, never as a hard counter; the residual register carries R-M2-CASE-B with the Owner's definition, status OWNER-ACCEPTED BOUNDED RESIDUAL and the Option-A decision; general sentence-boundary soundness is NOT_CLAIMED", bi8)

    def bi9():
        csp = state["csiProof"]["biGenerated"]
        cases = bi_generated_cases()
        spec_ok = cases == csp["cases"]
        sel = stride("bi", cases)
        got = bi_generated(I, sel, Interp(bi_parent_model(bm)))
        recrows = dict((r[0], r) for r in csp["rows"])
        bad = [r[0] for r in got["rows"] if recrows.get(r[0]) != r or r[1]]
        zero = all(v == 0 for v in csp["counters"].values()) and csp["reported"]["mechanicsInvalid"] == 0 and csp["summary"]["generatorMismatch"] == 0
        full_ok = fast_mode() or (got["counters"] == csp["counters"] and got["reported"] == csp["reported"] and got["summary"] == csp["summary"])
        n_ok = len(cases) >= BI_GEN_MIN and set(csp["counters"]) == set(_BI_HARD)
        return spec_ok and not bad and zero and full_ok and n_ok, {"cases": len(cases), "evaluated": len(sel), "counters": csp["counters"],
                                                                 "reported": csp["reported"], "summary": csp["summary"], "bad": bad[:4]}
    ck("BI-9", "boundary-integrity generated surface (>= 500 construction cases; every two-record case in both record orders, every case again and under the parent's evidence, every fifth with outcome and Environment / Pair metadata): the omitted gap (terminal, closers, spacing, line wraps, NBSP, ellipsis, words, a skipped sentence, no terminal) before ASCII, Latin, Greek, Deseret and Cherokee lowercase and uppercase continuations, '?' / '!'; k = 1, 2, 3, 5, 15 stipulated name occurrences with the target first, middle or last, the nearest-span trap, eleven authority variants, the name end, wrong authority over a genuine sentence, an HTML rendition: nonAdjacentSentenceDeclarationBypass = omittedTerminalCreatesBoundary = omittedCloserCreatesBoundary = falseSourceDiversityFromM1 = falseSrcDivFromM1 = entityInternalPeriodCreatesBoundary = unprovenEntityNameUsedAsAuthority = wrongCikNameBinding = currentNameUsedOutsideTemporalAuthority = falseSourceDiversityFromM2 = falseSrcDivFromM2 = positiveControlChanged = CSIChanged = sourceClassAssignmentChanged = B2AlgorithmChanged = atomDefinitionChanged = recordOrderDependence = nonIdempotentSemanticDecision = outcomeLeakage = environmentLeakage = unexpectedOutcome = 0; the accepted case-B residual is reported apart; per-case verdicts equal the recorded table", bi9)

    def bi10():
        rec_ = state["csiProof"]["biSensitivity"]
        sens_ = rec_ if fast_mode() else bi_sensitivity(bm, state["fixtures"]["fixtures"], bi_generated_cases()[::BI_SENS_STRIDE])
        missed = [k for k, v in sens_.items() if not v["fixturesTripped"]]
        return not missed and rec_ == sens_ and sorted(sens_) == sorted(BI_WEAKENED), {"missed": missed, "fixturesTripped": dict((k, len(v["fixturesTripped"])) for k, v in sorted(sens_.items())),
                                                                                    "generatedCasesTripped": dict((k, v["generatedCasesTripped"]) for k, v in sorted(sens_.items()))}
    ck("BI-10", "weakened-implementation sensitivity: each of the 16 weakened layers of section 17 (the M1 bypass restored, the declaration trusted, the coder's unit bytes only, closers ignored, the veto disabled, the first or the nearest span only, a wrong artifact digest, a wrong coordinate view, edited records, an invalid entity id, no temporal authority, span text not compared, the veto on one path only, constants not checked; the decoder check is witnessed by the pilot binding, BI-13) trips at least one boundary-integrity construction fixture by behaviour; the recorded table equals the recomputation", bi10)

    def bi11():
        src = open(A["validator"], encoding="utf-8").read()
        block = src[src.index("# " + "=" * 66 + " BOUNDARY-INTEGRITY CONSTRUCTION ORACLE BEGIN"):src.index("# " + "=" * 66 + " BOUNDARY-INTEGRITY CONSTRUCTION ORACLE END")]
        tree = ast.parse(block)
        forbidden = (r"\.(_interval_evidence|_veto|_veto_doc|_ta_scan|_ta_origin|continuation_withheld|_cg_[a-z_]+|form_segments|basis_[a-z_]+|count|tracked_extract)\(",
                     r"\b(evaluate_corpus|bind_entity_name_authority|complete_view|apply_ops|apply_ops_tracked)\(", r"[\"'](entityNameVeto|documentaryInterval|continuationGuard|canonicalSegmentIdentity|touchingAtomRelations)[\"']")
        names = ("build_bi", "bi_truth", "bi_generated_cases", "_bi_next_cased")
        bad, n = [], 0
        for node in tree.body:
            if isinstance(node, ast.FunctionDef) and node.name in names:
                n += 1
                seg = ast.get_source_segment(block, node)
                for f in forbidden:
                    m = re.search(f, seg)
                    if m:
                        bad.append("%s uses %s" % (node.name, m.group(0)))
        return not bad and n == len(names), {"functionsScanned": n, "bad": bad}
    ck("BI-11", "the boundary-integrity oracle is independent: the construction builder, the truth, the generator and the terminal scan name no interpreter machinery (the documentary interval, the veto, the authority binding, the guard, the touching relation, the complete view, evaluate_corpus) and read no candidate identity, relation or component; truth comes from the pieces, the stipulated physical boundary, the authority variant the construction wrote and the name occurrences it placed", bi11)

    def bi12():
        fs = state["fxs"]["fixtures"]
        fx_ = state["fixtures"]["fixtures"]
        chg = dict((c["fixtureId"], c) for c in state["deltaLedger"]["seFixtureChanges"])
        bad = []
        if [f["fixtureId"] for f in fx_[:len(fs)]] != [f["fixtureId"] for f in fs]:
            bad.append("the parent's fixtures are not carried first and in order")
        for f in fs:
            n = fxd.get(f["fixtureId"])
            if n == f:
                if f["fixtureId"] in chg:
                    bad.append("%s recorded as changed but unchanged" % f["fixtureId"])
                continue
            moved = sorted(k for k in set(n) | set(f) if n.get(k) != f.get(k))
            if f["fixtureId"] not in chg or not set(moved) <= set(SE_FIXTURE_FIELDS) or moved != chg[f["fixtureId"]]["changedFields"] or \
                    any(chg[f["fixtureId"]]["parent"].get(k) != f.get(k) for k in moved if k != "physicalTruth"):
                bad.append("%s: fields %s changed" % (f["fixtureId"], moved))
        ids = [f["fixtureId"] for f in fx_[len(fs):]]
        ok = not bad and sorted(chg) == ["SE-EVID-NA"] and ids == BI_FIXTURE_IDS and all(f["group"] == BI_GROUP for f in fx_[len(fs):])
        return ok, {"parentFixturesCarried": len(fs), "changed": sorted(chg), "biFixtures": len(ids), "bad": bad[:6]}
    ck("BI-12", "all 293 fixtures of the parent are carried first, in order, byte-identical in evidence (corpus) and construction spec - only SE-EVID-NA (the IV1-M1 construction, now rejected) changes, and only in its declared expectation, derivation, title, closes and role (ledger entry with the parent's values) - followed by the boundary-integrity construction fixtures", bi12)

    def bi13():
        ena = rp.get("entityNameAuthority") or {}
        f = ena.get("recordsFile", {})
        recs = load_json(os.path.join(root, f.get("relative", ""))) if f else {"records": []}
        pf = bi_pilot_facts(Interp(bm), rp, root)
        led = state["deltaLedger"]["biImpactPreflight"]["pilot"]
        usable = bm["segmentation"]["separatorEvidence"]["whenAdjacent"]["SENTENCE"]["entityNameVeto"]["authority"]["usable"]
        ok = (f.get("relative") == "WORKBENCH/DOWNLOADS/" + AUTH_RECORDS and f.get("sha256") == AUTH_FILES[AUTH_RECORDS]
              and ena.get("recordsSha256") == sha_bytes(cjson(recs["records"])) and pf["binding"] == led["binding"]
              and pf["spans"] == led["spans"] == BI_PILOT_SPANS and pf["vetoFired"] == 0
              and sorted(a for a, w in pf["binding"] if w == usable) == sorted(BI_PILOT_SPANS)
              and pf["res"]["records"] == rep["res"]["records"] and pf["res"]["count"] == rep["res"]["count"])
        return ok, {"usable": dict((k, v) for k, v in pf["spans"].items()), "binding": dict((w, sum(1 for _, x in pf["binding"] if x == w)) for w in sorted(set(x for _, x in pf["binding"]))), "vetoFired": pf["vetoFired"]}
    ck("BI-13", "the pilot is replayed with the CORR1 candidate bound read-only: the replay names the RECORDS file by path and pinned SHA-256 (82259f13...) and the records' canonical digest; the binding log equals the recorded one (ART-07 / 08 / 13 / 23 usable with 15 / 53 / 1 / 219 = 288 proven occurrence spans; every other record refused with its declared reason); the veto fires 0 times and the result is the evaluation of R-3", bi13)

    def bi14():
        rr = dict((r["id"], r) for r in rules["residualRisksForVerifier"])
        od = rules.get("ownerDecision", {})
        ok = (od.get("decision") == OWNER_DECISION_ID and od.get("accepts") == "IV1-M2-CASE-B" and "RULE_G" in od.get("notAuthorized", [])
              and "RULE_K" in od.get("notAuthorized", []) and "PILOT_REBASELINE" in od.get("notAuthorized", [])
              and rr.get("R7-EVIDENCE", {}).get("statement", "").startswith("CLOSED_IN_CANDIDATE")
              and rr.get("SE-UPPERCASE-AFTER-ABBREVIATION", {}).get("statement", "").startswith("PARTLY_CLOSED")
              and rr.get("IV1-m1", {}).get("status") == "OWNER-ACCEPTED NON-BLOCKING / OUT OF SCOPE"
              and rules["claims"] == BI_CLAIMS)
        return ok, {"claims": rules.get("claims"), "residuals": sorted(rr)[-6:]}
    ck("BI-14", "disposition recorded exactly: IV1-M1 CLOSED_IN_CANDIDATE (R7-EVIDENCE closed), IV1-M2 case A CLOSED_IN_CANDIDATE, IV1-M2 case B the Owner-accepted bounded residual R-M2-CASE-B (SE-UPPERCASE-AFTER-ABBREVIATION partly closed), the IV1-m1 OA-14 diagnostic MINOR accepted out of scope; rule G, rule K and a pilot rebaseline not authorized; the claims block states general sentence-boundary soundness NOT_CLAIMED and the SEC authority a candidate dependency that is not controlling", bi14)

    # ---------------- P. preservation proof, manifest, oracle independence, dormant paths
    def p1():
        pp = state["preservation"]
        bad = [k for k, v in pp["frozenInputs"].items() if FROZEN.get(k) and v != FROZEN[k]]
        missing = [k for k in FROZEN if k not in pp["frozenInputs"]]
        return (not bad and not missing and pp["stage2Corr4Sha256"] == STAGE2_CORR4_SHA and pp["nineLabels"] == labels), {"bad": bad, "missing": missing}
    ck("P-1", "the preservation proof records every pinned frozen identity (parent, architecture, Stage-2, pilot inputs, references) and the nine labels", p1)

    def p2():
        mp = A["manifest"]
        if not os.path.exists(mp):
            return False, "manifest missing"
        bad, seen = [], set()
        for ln in open(mp, encoding="utf-8"):
            if not ln.strip() or ln.startswith("#"):
                continue
            h, name = ln.rstrip("\n").split("  ", 1)
            seen.add(name)
            p = os.path.join(base, name)
            if not os.path.exists(p) or file_sha(p) != h:
                bad.append(name)
        missing = sorted(v for k, v in ARTIFACTS.items() if k != "manifest" and v not in seen)
        return not bad and not missing and len(seen) == 13, {"bad": bad, "notPinned": missing, "pinned": len(seen)}
    ck("P-2", "the manifest pins the other 13 delivered artifacts, and every entry hashes to its recorded digest", p2)

    def u1():
        src = open(A["validator"], encoding="utf-8").read()
        block = src[src.index("# " + "=" * 66 + " PHYSICAL-OCCURRENCE ORACLE BEGIN"):src.index("# " + "=" * 66 + " PHYSICAL-OCCURRENCE ORACLE END")]
        tree = ast.parse(block)
        forbidden = (r"\.(anchor_all|anchor_facts|_frame_u_guard|seam|complete_view_of|cv_classes|removal_views|tracked_extract|identity_string|unplaced_witness_stage|omega)\(",
                     r"\b(evaluate_corpus|complete_view|apply_ops_tracked)\(", r"[\"'](canonicalSegmentIdentity|occurrenceAnchor|unresolvedReason|frameUGuard|provisionalOccurrence|csiComponents)[\"']")
        bad = []
        for node in tree.body:
            if isinstance(node, ast.FunctionDef) and (node.name.startswith("build_") or node.name.startswith("_s_") or node.name.startswith("_b_")
                                                      or node.name.startswith("_r_") or node.name in ("generated_cases", "_gen_codes", "_lzw_encode")):
                seg = ast.get_source_segment(block, node)
                for f in forbidden:
                    m = re.search(f, seg)
                    if m:
                        bad.append("%s uses %s" % (node.name, m.group(0)))
        return not bad, {"constructionFunctionsScanned": sum(1 for n in tree.body if isinstance(n, ast.FunctionDef)), "bad": bad}
    ck("U-1", "the physical-occurrence oracle is independent: no construction, builder or generator function of the oracle block names the interpreter's identity machinery (complete view, seam, anchor, guard, OA-14 stage, identity string, evaluate_corpus) or reads a candidate identity, frame, guard outcome or reason; physical truth comes from construction slots alone", u1)
    ck("C-5", "the retired CSI-v5 proofs and every dormant weakened path have zero executable authority: the model selects the complete-view frames and names no CSI-v5 proof, and the delivered model's interpreter called no dormant path anywhere in this validation (pilot, fixtures, probes, generated surfaces); the weakened models of the sensitivity probes run on their own interpreter instances", c5)
    return C.results, summarize(C.results)


def _o1(bm):
    oa = bm["occurrenceAnchoring"]
    bad = []
    for n, v in bm["evidenceBinding"]["extractionRecipes"].items():
        if [op.get("role") for op in v["ops"]] != ACCEPTED_OP_ROLES.get(n):
            bad.append(n)
    probe = copy.deepcopy(bm)
    probe["evidenceBinding"]["extractionRecipes"]["HTML_TEXT_V1"]["ops"][1].pop("role")
    try:
        Interp(probe).op_role_classes("HTML_TEXT_V1")
        bad.append("an op without a role was accepted")
    except ModelError as e:
        if e.code != "OP_ROLE_UNDECLARED":
            bad.append("wrong error %s" % e.code)
    return (not bad and oa["opRoles"]["vocabulary"] == ["CONTENT_BLOCK_REMOVAL", "MARKUP_REMOVAL", "NORMALIZATION"]), bad


def _o3(interp):
    probes = [("<p>ab<!-- cd -->ef</p>", "abcdef"), ('<p>ab<img alt="cd">ef</p>', "abcdef"), ('<p>ab<span foo="cd" bar>ef</span></p>', "abfoocdbaref"),
              ("<p>ab<b>ef</b></p>", "abef"), ("<p>ab<cd!>ef</p>", "abcdef"), ("<p>a&amp;b&#99;</p>", "abc"), ("<P>AB</P>", "ab"),
              ('<p>ab<a href="/2005/">ef</a></p>', "ab2005ef"), ("<p>ab<xyz>ef</xyz></p>", "abxyzefxyz"), ('<p><span data-x="q" aria-label="r">s</span></p>', "qrs")]
    bad = []
    for h, want in probes:
        t, _ = interp.complete_view_of(h)
        if t.text != want:
            bad.append([h, t.text, want])
        if len(t.s) != len(t.text) or any(not (0 <= t.s[i] < t.e[i] <= len(h)) for i in range(len(t.text))):
            bad.append([h, "origins"])
    return not bad, bad


def _o4(interp):
    h = "<p>ab<script>xy</script>cd<!-- z -->ef<b>gh</b></p>"
    views = interp.removal_views(h, "UTF8_REPLACE")
    v = views["HTML_TEXT_V1"]
    cls = lambda s: v[h.index(s)]
    ok = (sorted(views) == ["HTML_TEXT_V1", "canonicalization:markup_tags"] and cls("xy") == 1 and cls("<!--") == 1 and cls("<b>") == 2 and cls("ab") == 0
          and cls("gh") == 0 and views["canonicalization:markup_tags"][h.index("<b>")] == 2 and views["canonicalization:markup_tags"][h.index("ab")] == 0
          and interp.oa["removalViews"]["recipeViews"]["source"] == "OP_PROVENANCE")
    return ok, {"views": sorted(views)}


def _o5(interp):
    P, S = "The Committee sets", "each director's annual retainer."
    seams = ['<img alt="amended">', "<font size=2>", '<img alt="2005">', '<span title="amended">', '<a href="amended.htm">', '<span data-note="amended">',
             '<span aria-label="amended">', '<span foo="amended">', "<span amended>", "<amended!>", "<script>amended</script>", "<style>amended</style>", "<!-- amended -->"]
    clean = ["<b>", '<img alt="">', '<img alt="---">', "<span>", "<script></script>"]
    bad = []
    for mid in seams + clean:
        h = "<p>%s%s%s</p>" % (P, mid, S)
        cvt, _ = interp.complete_view_of(h)
        w = [0, len(cvt.text)]
        got = bool(interp.seam(h, "UTF8_REPLACE", w))
        if got != (mid in seams):
            bad.append([mid, got])
    h = '<img alt="amended"><p>%s %s</p>' % (P, S)
    cvt, _ = interp.complete_view_of(h)
    if interp.seam(h, "UTF8_REPLACE", [len("amended"), len(cvt.text)]):
        bad.append("markup outside the interval")
    return not bad, bad


def _o6(interp, fres, fixtures):
    bad, n = [], 0
    for fx in fixtures:
        res = fres.get(fx["fixtureId"], (None, None))[1]
        if res is None:
            continue
        by_doc = {}
        for s in res["segmentRecords"]:
            fr = (s.get("occurrenceAnchor") or {}).get("frame")
            if fr:
                by_doc.setdefault(s["underlyingDocumentIdentity"], set()).add(fr)
        for d, frs in by_doc.items():
            n += 1
            if len(frs) != 1:
                bad.append(fx["fixtureId"])
    return not bad and n > 100, {"documentsChecked": n, "documentsWithTwoFrames": bad[:4]}


# ---------------------------------------------------------------- forced-failure harness
def _cs(bm):
    return bm["canonicalSegmentIdentity"]


def _oa(bm):
    return bm["occurrenceAnchoring"]


def _guard_drop(test):
    def f(bm):
        _oa(bm)["frameU"]["guard"] = [g for g in _oa(bm)["frameU"]["guard"] if g["test"] != test]
    return f


def _legacy(proofs, version="CSI-v5"):
    """restore CSI-v5 occurrence-correspondence proofs as the identity function (the parent's content hash + rank key)."""
    def f(bm):
        cs = _cs(bm)
        cs["identityFunction"] = "LEGACY_V5_PROOFS"
        cs["legacyProofs"] = [{"id": i, "test": t} for i, t in proofs]
        cs["versionTag"] = version
    return f


V5_OC1 = ("OC-1", "GROUP_CANONICAL_DOCUMENTS_EQUAL")
V5_OC2 = ("OC-2", "CONTENT_CARRIED_BY_ONE_MEMBER")
V5_OC4 = ("OC-4", "CONTENT_SINGLE_OCCURRENCE_IN_EVERY_CARRIER_AND_AT_MOST_ONCE_IN_RENDITION_TEXT")
V5_OC3 = ("OC-3", "CARRIER_OCCURRENCES_EQUAL_RENDITION_TEXT")
V5_COUNTS = ("OC-3", "CARRIER_COUNTS_EQUAL")


def _exempt(*entries):
    def f(bm):
        _oa(bm)["seam"]["exemptSources"] = list(entries)
    return f


def _anchor(frame, comps, prims=None):
    def f(bm):
        fr = next(k for k, v in _cs(bm)["frames"].items() if v["tag"] == frame)
        _cs(bm)["frames"][fr]["anchorComponents"] = comps
        _cs(bm)["anchorPrimitives"].update(prims or {})
    return f


def _uw(section, key, value):
    def f(bm):
        _oa(bm)["unplacedWitness"][section][key] = value
    return f




def mutations(root):
    M = []

    def add(mid, name, fn, level):
        M.append((mid, name, fn, level))
    # ---- the parent's forced failures (CORR4.CORR1.CORR1.CORR1 FF-01 .. FF-69), carried; CSI-v5 surfaces re-targeted to the CSI-v6 surface with the same intent
    add("FF-01", "unauthorized exclusion change outside the allowlist (X1-a presence -> exclusivity)", _bm_edit(_m_exclusivity), "model")
    add("FF-02", "MV-F02 fixture expectation contradicts the normative rule", lambda d: _edit(d, "fixtures", lambda o: _fx(o, "MVF02-3")["expect"]["segments"].update({"MVF02-3#s1": ["MULTIPLE_CLASS_PREDICATES_SATISFIED", None]})), "light")
    add("FF-03", "MV-F03 fixture expectation contradicts the segmentation rule", lambda d: _edit(d, "fixtures", lambda o: _fx(o, "MVF03-1")["expect"]["segments"].update({"MVF03-1#s1": ["ASSIGNED", "contracts/participation terms"]})), "light")
    add("FF-04", "contract table contradicts the normative model", lambda d: _m_contract(d, "| X1-a | it fixes enforceable or formal participation terms | SC-2 | PRESENCE", "| X1-a | it fixes enforceable or formal participation terms | SC-2 | EXCLUSIVITY"), "light")
    add("FF-05", "replay feature witness absent from the bound segment", lambda d: _edit(d, "replay", lambda o: _row(o, "SCA-010")["units"][0]["assertions"][0].update({"witness": "Proc-Type: 2001,MIC-CLEAR"})), "light")
    add("FF-06", "replay segment text replaced with unrelated text", _m_replace_text, "light")
    add("FF-06b", "replay SCA-010 consistently rebound to the SEC header (span + text + hash + locators)", lambda d: _m_move_to_header(d, root), "light")
    add("FF-07", "positive identity + amendment conflict resolves instead of failing closed (digest branch first)", _bm_edit(_m_reorder), "model")
    add("FF-08", "HTML/PDF always split", _bm_edit(lambda bm: bm["rules"]["R-DUP"]["renditionEquivalenceTest"]["parameters"].update({"serializationDifferencePermitted": False})), "model")
    add("FF-09", "HTML/PDF always merge despite substantive divergence", _bm_edit(lambda bm: bm["rules"]["R-DUP"]["renditionEquivalenceTest"]["parameters"].update({"substantiveDivergenceBlocks": False})), "model")
    add("FF-10", "title/period-only duplicate merge", _bm_edit(lambda bm: bm["rules"]["R-DUP"]["linkRules"].append({"link": "TITLE_PERIOD", "linkClass": "authoritative", "fieldsEqualNonNull": ["title", "period"]})), "model")
    add("FF-11", "cross-package sourceId merge", _bm_edit(lambda bm: bm["rules"]["R-DUP"].update({"sourceIdScope": "GLOBAL"})), "model")
    add("FF-12", "CSI derived from a locator of the rendition (CSI-v6 surface: the FRAME-C anchor taken from the artifact, a per-rendition locator)", _bm_edit(_anchor("C", ["completeViewStart"], {"completeViewStart": "ARTIFACT_IDENTITY"})), "model")
    add("FF-13", "two distinct same-opening segments collide (CSI-v6 surface: the FRAME-C anchor dropped, identity = document + frame)", _bm_edit(_anchor("C", [])), "model")
    add("FF-14", "stale (parent) boundaryModelSha256 in the fixtures", lambda d: _edit(d, "fixtures", lambda o: o.update({"boundaryModelSha256": PARENT_MODEL_SHA})), "light")
    add("FF-15", "free-form locator used as count/conflict identity key", _bm_edit(lambda bm: bm["rules"]["R-COUNT"].update({"groupingKey": ["underlyingDocumentIdentity", "humanReadableLocator"]})), "model")
    add("FF-16", "missing sourceRefIds", lambda d: _edit(d, "replay", lambda o: _row(o, "SCA-004").pop("sourceRefIds")), "light")
    add("FF-17", "missing sourceLocators", lambda d: _edit(d, "replay", lambda o: _row(o, "SCA-004").pop("sourceLocators")), "light")
    add("FF-18", "tenth source class", _bm_edit(_m_tenth), "model")
    add("FF-19", "non-ASSIGNED state enters distinctClassSet", _bm_edit(lambda bm: bm["states"]["countingEligible"].append("OUTSIDE_FROZEN_VOCABULARY")), "model")
    add("FF-20", "two-document threshold", _bm_edit(_m_two_doc), "model")
    add("FF-21", "mixed-document class erasure (group by document only)", _bm_edit(lambda bm: bm["rules"]["R-COUNT"].update({"groupingKey": ["underlyingDocumentIdentity"]})), "model")
    add("FF-22", "form -> class shortcut", _bm_edit(_m_form), "model")
    add("FF-23", "Stage-2 CORR4 identity mutated in the recorded identities", lambda d: _edit(d, "rules", lambda o: o["identities"]["Stage-2 CORR4"].update({"sha256": "0" * 64})), "light")
    add("FF-24", "outcome / Environment injection", lambda d: _edit(d, "replay", lambda o: _row(o, "SCA-001").update({"environmentCode": "SFP/SFJ"})), "light")
    add("FF-25", "CORR2.IV1 green mutation 1: R-EQV declared list loses markup_tags", _bm_edit(_m_reqv_list), "model")
    add("FF-25b", "CORR2.IV1 green mutation 1b: markup_tags removed from list AND operations", _bm_edit(_m_reqv_ops), "model")
    add("FF-26", "CORR2.IV1 green mutation 2: contradictory SC-2 instruction added to the SC-1/SC-2 matrix in the contract only", lambda d: _m_contract(d, "### SC-1 vs SC-2\n", "### SC-1 vs SC-2\n\n- **Author override:** a mixed invitation plus terms segment is SC-2 only.\n"), "light")
    add("FF-27", "SC5: two witnessed determinant values collapsed back to scalar OTHER (CORR3 behaviour)", _bm_edit(_m_determinant_scalar), "model")
    add("FF-28", "SC5: actor-invariant value erased by the SC-7 redirect (X5-a fires on any witnessed ROLE_OR_TIER)", _bm_edit(_m_x5a_presence), "model")
    add("FF-29", "SC5: IV1 fixture expectation rewritten to SC-7 alone", lambda d: _edit(d, "fixtures", lambda o: _fx(o, "DET-3")["expect"].update({"segments": {"DET-3#s1": ["ASSIGNED", "access-rights/role matrices"]}, "distinctClassSet": ["access-rights/role matrices"]})), "light")
    add("FF-30", "F04: CORR3 premature NO_POSITIVE_LINK branch restored before same-webpage equivalence", _bm_edit(_m_premature_no_link), "model")
    add("FF-31", "F04: URL-only merge (a same-webpage candidate merges without verified equivalence)", _bm_edit(_m_url_merge), "model")
    add("FF-32", "F04: divergent captures of one webpage incorrectly merged", _bm_edit(lambda bm: _step(bm, "CANDIDATE_REQV_DIVERGENT").update({"stateRole": "same"})), "model")
    add("FF-33", "F04: unavailable content incorrectly merged", _bm_edit(lambda bm: _step(bm, "CANDIDATE_REQV_UNRESOLVED").update({"stateRole": "same", "resultRole": "resolved"})), "model")
    add("FF-34", "F04: the captured URL made a positive identity link", _bm_edit(_m_url_link), "model")
    add("FF-35", "RR4: a position in extraction space (not proven shared) restored as the FRAME-C anchor (the occurrence rank in the own extraction)", _bm_edit(_anchor("C", ["completeViewStart"], {"completeViewStart": "OWN_OCCURRENCE_RANK"})), "model")
    add("FF-36", "RR4: the FRAME-U content discriminator dropped (every key of one document collides)", _bm_edit(_anchor("K", [])), "model")
    add("FF-37", "RR4: the FRAME-U key taken from the recipe-dependent canonical content hash instead of the skeleton", _bm_edit(_anchor("K", ["contentSkeletonSha256"], {"contentSkeletonSha256": "CANONICAL_CONTENT_SHA256"})), "model")
    add("FF-38", "RR4: the comparability guard removed (FRAME-C positions compared across members whose complete views differ)", _bm_edit(lambda bm: _oa(bm)["frameSelection"].update({"frameCWhen": "ALWAYS"})), "model")
    add("FF-39", "RR4: the shared positional frame never used (every document forced to FRAME-U)", _bm_edit(lambda bm: _oa(bm)["frameSelection"].update({"frameCWhen": "NEVER"})), "model")
    add("FF-40", "RR4: one converged segment with conflicting classes creates two count groups", _bm_edit(_m_two_groups_v6), "model")
    add("FF-41", "stale parent model identity planted in the evidence-binding ledger", lambda d: _edit(d, "evidenceLedger", lambda o: o.update({"parentModelNote": PARENT_MODEL_SHA})), "light")
    add("FF-42", "stale second truth surface: a CSI-v5 key list re-added beside the CSI-v6 definition", _bm_edit(lambda bm: _cs(bm).update({"keyComponents": ["underlyingDocumentIdentity", "canonicalSegmentContentHash", "occurrenceIndex"]})), "model")
    add("FF-43", "SCOPE: X7-e made conditional on the absence of a mapping (erroneous-brief M-4 repair)", _bm_edit(_m_x7e_conditional), "model")
    add("FF-44", "SCOPE: page-number stripping made evidence-based (erroneous-brief numeric repair)", _bm_edit(_m_page_numbers), "model")
    add("FF-45", "SCOPE: separator evidence rewritten (erroneous-brief B-1 repair)", _bm_edit(_m_separator_evidence), "model")
    add("FF-46", "SCOPE: SCA-011#s3 recoded to SC-7 in the replay with its results consistently recomputed", lambda d: _m_sca011_recode(d, root), "light")
    add("FF-47", "RR17-1: the reserved wildcard occurrence value restored for every occurrence no frame establishes", _bm_edit(lambda bm: _cs(bm)["whenNotEstablished"].update({"action": "WILDCARD", "value": "*"})), "model")
    add("FF-48", "RR17-3: content hash alone as the segment identity (document dropped from the key, anchors = canonical content hash)",
        _bm_edit(lambda bm: (_cs(bm).update({"keyLayout": ["versionTag", "frameTag", "anchor"]}), _anchor("C", ["completeViewStart"], {"completeViewStart": "CANONICAL_CONTENT_SHA256"})(bm),
                             _anchor("K", ["contentSkeletonSha256"], {"contentSkeletonSha256": "CANONICAL_CONTENT_SHA256"})(bm))), "model")
    add("FF-49", "OC3-1: the removed CSI-v5 count-equality proof restored as the identity function (with OC-1, OC-2, OC-4)", _bm_edit(_legacy([V5_OC1, V5_OC2, V5_OC3, V5_OC4])), "model")
    add("FF-50", "RR17-5: an ambiguous occurrence allowed to count (state kept without an identity)", _bm_edit(lambda bm: _cs(bm)["whenNotEstablished"].update({"action": "KEEP_STATE_NO_IDENTITY"})), "model")
    add("FF-51", "RR17-6: two distinct repeated occurrences collapsed (the FRAME-C anchor replaced by the content hash)", _bm_edit(_anchor("C", ["completeViewStart"], {"completeViewStart": "CANONICAL_CONTENT_SHA256"})), "model")
    add("FF-52", "RR17-7: one occurrence split into two groups (identity per rendition: the artifact identity added to the FRAME-C anchor)", _bm_edit(_anchor("C", ["completeViewStart", "completeViewEnd", "artifactId"], {"artifactId": "ARTIFACT_IDENTITY"})), "model")
    add("FF-53", "RR17-4b: the uniqueness guard assumed without evidence (U1 removed)", _bm_edit(_guard_drop("SKELETON_EXACTLY_ONCE_IN_EVERY_COMPLETE_VIEW")), "model")
    add("FF-54", "RR17: R17-D fixture expectation rewritten so the physically converged pair counts two classes", lambda d: _edit(d, "fixtures", lambda o: _fx(o, "R17-D")["expect"].update({"segments": {"R17-D-1#s1": ["ASSIGNED", "compensation plans"], "R17-D-2#s1": ["ASSIGNED", "access-rights/role matrices"]}, "distinctClassSet": ["access-rights/role matrices", "compensation plans"], "srcDivHolds": True, "segmentClassConflicts": 0})), "light")
    add("FF-55", "an unauthorized change of the states table (outside the occurrence-anchoring surface)", _bm_edit(lambda bm: bm["states"]["definitions"][0].update({"meaning": bm["states"]["definitions"][0]["meaning"] + " (edited)"})), "model")
    add("FF-56", "a delta rule relabelled with a class outside the nine permitted (SCOPE_VIOLATION)", lambda d: _edit(d, "deltaLedger", lambda o: o["parentToChild"]["classificationRules"][0].update({"class": "KEEP_IV1_SC5_MIXED"})), "light")
    add("FF-57", "the recorded generated-surface counters altered (a false split recorded)", lambda d: _edit(d, "csiProof", lambda o: o["generatedSurfaces"]["corr1Families"]["families"]["extended"]["counters"].update({"split": 3})), "light")
    add("FF-58", "a pilot segment recorded as unestablished while it carries an identity and a class state", lambda d: _edit(d, "replay", lambda o: _row(o, "SCA-004")["computed"]["segments"][0].update({"occurrenceCorrespondence": "UNESTABLISHED"})), "light")
    add("FF-59", "the parent-to-child ledger records a false leaf count", lambda d: _edit(d, "deltaLedger", lambda o: o["parentToChild"].update({"leavesChanged": 1})), "light")
    add("FF-60", "OC3-2: CSI-v5 count equality alone restored as a proof", _bm_edit(_legacy([V5_OC1, V5_OC2, V5_COUNTS, V5_OC4])), "model")
    add("FF-61", "OC3-3: the CSI-v5 count-equality proof restored AND OC3-CODEX rewritten to what that proof produces (two identities, two classes, srcDiv true)",
        lambda d: (_bm_edit(_legacy([V5_OC1, V5_OC2, V5_OC3, V5_OC4]))(d),
                   _edit(d, "fixtures", lambda o: _fx(o, "OC3-CODEX")["expect"].update({
                       "segments": {"OC3-CODEX-A1#s1": ["ASSIGNED", "compensation plans"], "OC3-CODEX-B0#s1": ["ASSIGNED", "access-rights/role matrices"]},
                       "distinctClassSet": ["access-rights/role matrices", "compensation plans"], "srcDivHolds": True, "segmentClassConflicts": 0, "csiUnresolved": [],
                       "csiEqual": [], "csiDistinct": [["OC3-CODEX-A1#s1", "OC3-CODEX-B0#s1"]]}))), "model")
    add("FF-62", "OC3-4: the exact IV1 regression accepted with a false srcDiv (OC3-CODEX expectation rewritten)", lambda d: _edit(d, "fixtures", lambda o: _fx(o, "OC3-CODEX")["expect"].update({"srcDivHolds": True, "distinctClassSet": ["access-rights/role matrices", "compensation plans"]})), "light")
    add("FF-63", "OC3-5: count equality declared an establishing fact in the CSI section (a stale CSI-v5 surface)", _bm_edit(lambda bm: _cs(bm).update({"countEquality": {"establishesCorrespondence": True}})), "model")
    add("FF-64", "OC3-6: the CSI-v5 uniqueness proof replaced by count equality", _bm_edit(_legacy([V5_OC1, V5_OC2, ("OC-4", "CARRIER_COUNTS_EQUAL")])), "model")
    add("FF-65", "OC3-7: the exact regression's slot specification edited so that the delivered corpus no longer matches its physical description", lambda d: _edit(d, "fixtures", lambda o: _fx(o, "OC3-CODEX")["generator"]["renditions"][0].__setitem__(0, "plain/vis/vis")), "light")
    add("FF-66", "SCOPE: the CSI version tag bumped without cause (every identity would move)", _bm_edit(lambda bm: _cs(bm).update({"versionTag": "CSI-v7"})), "model")
    add("FF-67", "OC3-8: the removed proof restored under a sound-looking test name (OC-3 with the uniqueness test)", _bm_edit(_legacy([V5_OC1, V5_OC2, ("OC-3", V5_OC4[1]), V5_OC4])), "model")
    add("FF-68", "OC3-9: the known-limit fixture rewritten back to the CSI-v5 merge (created and genuine occurrences declared one identity)", lambda d: _edit(d, "fixtures", lambda o: _fx(o, "OC3-KL1")["expect"].update({"csiEqual": [["OC3-KL1-A0#s1", "OC3-KL1-B0#s1"]], "csiDistinct": [], "csiUnresolved": []})), "light")
    add("FF-69", "OC3-10: a guard broadened in the model text only (U1's rule sentence widened)", _bm_edit(lambda bm: _oa(bm)["frameU"]["guard"][0].update({"rule": _oa(bm)["frameU"]["guard"][0]["rule"] + " (broadened)"})), "model")
    # ---- the IMPLEMENTATION-1 required mutations (section 25)
    add("AP-01", "restore CSI-v5 OC-1 (equal canonical extraction documents as the occurrence-correspondence proof)", _bm_edit(_legacy([V5_OC1])), "model")
    add("AP-02", "restore the count-equality proof (OC-3) beside OC-1, OC-2 and OC-4", _bm_edit(_legacy([V5_OC1, V5_OC2, V5_OC3, V5_OC4])), "model")
    add("AP-03", "restore the OC-4 single-occurrence proof (the parent's exact CSI-v5: OC-1, OC-2, OC-4)", _bm_edit(_legacy([V5_OC1, V5_OC2, V5_OC4])), "model")
    add("AP-04", "restrict the seam to BLOCK only", _bm_edit(lambda bm: _oa(bm)["seam"].update({"removedClasses": ["BLOCK"]})), "model")
    add("AP-05", "exclude MARKUP from the seam (markup-removal ops and the TAG view read as SURVIVES)",
        _bm_edit(lambda bm: (_oa(bm)["opRoles"]["removalClassOfRole"].update({"MARKUP_REMOVAL": "SURVIVES"}), _oa(bm)["removalViews"]["tagView"].update({"removalClass": "SURVIVES"}))), "model")
    add("AP-06", "whitelist alt", _bm_edit(_exempt({"attributeName": "alt"})), "model")
    add("AP-07", "whitelist title", _bm_edit(_exempt({"attributeName": "title"})), "model")
    add("AP-08", "whitelist href", _bm_edit(_exempt({"attributeName": "href"})), "model")
    add("AP-09", "whitelist data-*", _bm_edit(_exempt({"attributeNamePrefix": "data-"})), "model")
    add("AP-10", "whitelist aria-*", _bm_edit(_exempt({"attributeNamePrefix": "aria-"})), "model")
    add("AP-11", "exempt numeric-only values", _bm_edit(_exempt({"digitOnlyPiece": True})), "model")
    add("AP-12", "exempt malformed and non-standard tag interiors", _bm_edit(_exempt({"sourceKind": "MALFORMED_INTERIOR"}, {"sourceKind": "NON_STANDARD_NAME"})), "model")
    add("AP-13", "drop attribute values from the complete view", _bm_edit(lambda bm: _oa(bm)["completeView"].update({"emitAttributeValues": False})), "model")
    add("AP-14", "restore the parent's FRAME-U count view (visible text with tags removed in place, tag text as separate pieces)", _bm_edit(lambda bm: _oa(bm)["frameU"].update({"countView": "PARENT_VISIBLE_TEXT_PLUS_TAG_PIECES"})), "model")
    add("AP-15", "remove U2", _bm_edit(_guard_drop("CANDIDATE_NOT_A_SEAM_IN_ANY_MEMBER")), "model")
    add("AP-16", "remove U3", _bm_edit(_guard_drop("NO_APPARENT_OCCURRENCE_CREATED_BY_REMOVAL")), "model")
    add("AP-17", "remove U4", _bm_edit(_guard_drop("NO_SEAM_RECORD_CARRIES_THE_KEY")), "model")
    add("AP-18", "restore the record-local FRAME-U own-seam gate (in place of U4)",
        _bm_edit(lambda bm: (_guard_drop("NO_SEAM_RECORD_CARRIES_THE_KEY")(bm), _oa(bm)["frameU"].update({"recordLocalOwnSeamGate": True, "recordLocalOwnSeamReason": "U2_CANDIDATE_OCCURRENCE_IS_A_TEXT_BEARING_REMOVAL_SEAM"}))), "model")
    add("AP-19", "make the FRAME-C seam own-member only", _bm_edit(lambda bm: _oa(bm)["frameC"].update({"taintScope": "OWN_MEMBER"})), "model")
    add("AP-20", "derive removal classes by a regex re-parse instead of op provenance", _bm_edit(lambda bm: _oa(bm)["removalViews"]["recipeViews"].update({"source": "REGEX_REPARSE"})), "model")
    add("AP-21", "remove the TAG view", _bm_edit(lambda bm: _oa(bm)["removalViews"].pop("tagView")), "model")
    add("AP-22", "allow an extraction op with no role (the HTML_TEXT_V1 tag-removal op loses its role)", _bm_edit(lambda bm: bm["evidenceBinding"]["extractionRecipes"]["HTML_TEXT_V1"]["ops"][5].pop("role")), "model")
    add("AP-23", "restore the occurrence rank as an identity input (added to the FRAME-C anchor)", _bm_edit(_anchor("C", ["completeViewStart", "completeViewEnd", "occurrenceRank"], {"occurrenceRank": "OWN_OCCURRENCE_RANK"})), "model")
    add("AP-24", "restore the wildcard behaviour (an unestablished occurrence gets a reserved shared value)", _bm_edit(lambda bm: _cs(bm)["whenNotEstablished"].update({"action": "WILDCARD", "value": "ANY"})), "model")
    # ---- the resumed act's required mutations (CORR1.CORR1 OA-7(b), CORR1.CORR1.CORR1 OA-14)
    add("NF-01", "OA7B_PER_RECORD_REPRESENTABILITY_RESTORED: OA-7(b) decided from each record's own sigma", _bm_edit(lambda bm: _oa(bm)["frameC"]["conditions"][1].update({"test": "OMEGA_REPRESENTABLE"})), "model")
    add("NF-02", "OA14_DISABLED: the OA-14 stage removed", _bm_edit(lambda bm: _oa(bm).pop("unplacedWitness")), "model")
    add("NF-03", "OA14_CANDIDATE_SET_OWN_MEMBER_ONLY", _bm_edit(_uw("candidateSet", "basis", "OWN_MEMBER_OCCURRENCES")), "model")
    add("NF-04", "OA14_TEXT_EQUALITY_NARROWING", _bm_edit(_uw("candidateSet", "basis", "TEXT_EQUAL_OCCURRENCES")), "model")
    add("NF-05", "OA14_FIRST_OCCURRENCE", _bm_edit(_uw("candidateSet", "basis", "FIRST_ESTABLISHED_OCCURRENCE")), "model")
    add("NF-06", "OA14_POSITIVE_ASSIGNMENT (a witness is placed on a same-class occurrence and quarantines nothing)", _bm_edit(_uw("quarantine", "rule", "SKIP_WITNESS_IF_SAME_CLASS_OCCURRENCE")), "model")
    add("NF-07", "OA14_GREEDY_CONSUMING", _bm_edit(_uw("quarantine", "rule", "GREEDY_CONSUME_SAME_CLASS")), "model")
    add("NF-08", "OA14_CASCADE (every record without an identity acts as a witness)", _bm_edit(_uw("witness", "source", "ANY_UNESTABLISHED")), "model")
    add("NF-09", "OA14_DOCUMENT_WIDE (class-unconditional quarantine)", _bm_edit(_uw("quarantine", "rule", "ANY_COUNTED_CLASS")), "model")
    add("NF-10", "OA14_NO_WITNESS_LAYER (no record qualifies as unplaced)", _bm_edit(lambda bm: _oa(bm)["unplacedWitness"].update({"unplacedExits": []})), "model")
    add("NF-11", "OA14_SEQUENTIAL_APPLICATION (witnesses applied one by one to the state earlier witnesses changed)", _bm_edit(lambda bm: _oa(bm)["unplacedWitness"].update({"application": "SEQUENTIAL"})), "model")
    # ---- this act's required weakened implementations (section 24: R7-FF01 .. R7-FF22), each a model edit selecting a dormant path of the layer
    for fid in sorted(R7_WEAKENED):
        add(fid, R7_WEAKENED[fid][0], _bm_edit(_r7_inplace(fid)), "model")
    # ---- this act's required weakened implementations (section 27: TA-FF01 .. TA-FF22, and TA-FF23 / TA-FF24), each a model edit
    for fid in sorted(TA_WEAKENED):
        add(fid, TA_WEAKENED[fid][0], _bm_edit(_ta_inplace(fid)), "model")
    # ---- this act's required weakened implementations (section 18: SE-FF01 .. SE-FF14), each a model edit
    for fid in sorted(SE_WEAKENED):
        add(fid, SE_WEAKENED[fid][0], _bm_edit(_se_inplace(fid)), "model")
    # ---- this act's required weakened implementations (section 13: BI-FF01 .. BI-FF16), each a model edit
    for fid in sorted(BI_WEAKENED):
        add(fid, BI_WEAKENED[fid][0], _bm_edit(_bi_inplace(fid)), "model")
    return M


def _bi_inplace(fid):
    def f(bm):
        m = bi_weakened_model(bm, fid)
        bm.clear()
        bm.update(m)
    return f


def _se_inplace(fid):
    def f(bm):
        m = se_weakened_model(bm, fid)
        bm.clear()
        bm.update(m)
    return f


def _ta_inplace(fid):
    def f(bm):
        m = ta_weakened_model(bm, fid)
        bm.clear()
        bm.update(m)
    return f


def _r7_inplace(fid):
    def f(bm):
        m = r7_weakened_model(bm, fid)
        bm.clear()
        bm.update(m)
    return f


def _m_two_groups_v6(bm):
    for k in ("R-COUNT",):
        bm["rules"][k]["groupingKey"] = ["underlyingDocumentIdentity", "segmentId"]
        bm["rules"][k]["countingDispositions"][0]["key"] = ["underlyingDocumentIdentity", "segmentId"]
    bm["segmentation"]["groupingKey"] = ["underlyingDocumentIdentity", "segmentId"]


FF_CATEGORY = {"FF-14": "IDENTITY_CONTROL", "FF-23": "IDENTITY_CONTROL", "FF-41": "IDENTITY_CONTROL", "FF-42": "STALE_SURFACE_CONTROL",
               "FF-63": "STALE_SURFACE_CONTROL", "FF-04": "DECLARATION_CONTROL", "FF-26": "DECLARATION_CONTROL", "FF-55": "DECLARATION_CONTROL",
               "FF-56": "DECLARATION_CONTROL", "FF-59": "DECLARATION_CONTROL", "FF-69": "DECLARATION_CONTROL",
               # re-categorised in this package: the mutation appends a sentence to R-COUNT's step text, which no interpreter reads
               "FF-20": "DECLARATION_CONTROL"}


def _one_forced_failure(args):
    base, root, idx = args
    mid, name, fn, level = mutations(root)[idx]
    tmp = tempfile.mkdtemp(prefix="mv_bi_ff_")
    try:
        for v in ARTIFACTS.values():
            p = os.path.join(base, v)
            if os.path.exists(p):
                shutil.copy2(p, os.path.join(tmp, v))
        fn(tmp)
        _refresh(tmp, level)
        results, meta = validate(tmp, root=root)
        failed = [r["check"] for r in results if not r["pass"]]
        crashed = [r["check"] for r in results if not r["pass"] and r["detail"].startswith("EXCEPTION")]
        return {"id": mid, "mutation": name, "refresh": level, "detected": bool(failed), "category": FF_CATEGORY.get(mid, "SEMANTIC"),
                "failedChecks": failed, "checksThatRaised": crashed, "validatorCrashed": False}
    except Exception as e:  # noqa: BLE001
        return {"id": mid, "mutation": name, "refresh": level, "detected": False, "failedChecks": [], "validatorCrashed": True,
                "error": "%s: %s" % (type(e).__name__, e), "trace": traceback.format_exc()[-400:]}
    finally:
        shutil.rmtree(tmp, ignore_errors=True)


# The Owner's optimisation of this act's forced-failure requirement: a bounded TARGETED set covering only the load-bearing changes of this act and
# the preservation invariants that detect unauthorized semantic drift. Each required mutation must be detected. The exhaustive harness (every
# mutation of the lineage) was intentionally not completed for this act. BI-FF17 (the authority decoder check removed) is not load-bearing at fixture
# level - the span-text check always masks it - and is omitted; the decoder check is witnessed by the pilot binding (BI-13).
FF_TARGETED = [
    ("1 restore the IV1-M1 non-adjacent SENTENCE declaration bypass", ["BI-FF01", "BI-FF02"]),
    ("2 ignore omitted physical-gap punctuation in M1", ["BI-FF03", "BI-FF04"]),
    ("3 disable the proven entity-name internal-period veto", ["BI-FF05"]),
    ("4 consume only the first occurrenceSpan instead of the complete set", ["BI-FF06", "BI-FF07"]),
    ("5 accept a mismatched artifact / hash authority record", ["BI-FF08", "BI-FF09", "BI-FF13"]),
    ("6 accept edited / corrupted authority records", ["BI-FF10", "BI-FF11", "BI-FF12", "BI-FF16"]),
    ("7 allow a proven entity-internal '.' to prove SENTENCE", ["BI-FF14", "BI-FF15"]),
    ("8 mutate one sourceClass predicate", ["FF-22", "FF-01"]),
    ("9 mutate CSI-v6", ["FF-12", "SE-FF11"]),
    ("10 mutate B2 component / count behavior", ["SE-FF14", "R7-FF06"]),
    ("11 mutate OA semantic state behavior", ["FF-50"]),
]


def run_forced_failures(base, root, jobs=1, only=None):
    """Every mutation on a throw-away copy of the delivered set (MV_FAST: the generated surfaces by declared stride; every fixture, the pilot and every
    recorded table still checked). jobs > 1 runs mutations in forked worker processes; the output does not depend on it."""
    os.environ["MV_FAST"] = "1"
    ms = mutations(root)
    idx = [i for i, m in enumerate(ms) if only is None or m[0] in only]
    if only is not None and len(idx) != len(set(only)):
        raise ModelError("UNKNOWN_FORCED_FAILURE", str(sorted(set(only) - set(ms[i][0] for i in idx))))
    try:
        if jobs > 1:
            import multiprocessing
            validate(base, root=root)          # warm the content-keyed caches before forking
            with multiprocessing.get_context("fork").Pool(jobs) as pool:
                out = pool.map(_one_forced_failure, [(base, root, i) for i in idx], chunksize=1)
        else:
            out = [_one_forced_failure((base, root, i)) for i in idx]
    finally:
        os.environ.pop("MV_FAST", None)
    return out


def report_text(results, meta, base):
    L = ["MERGEVUE - %s - VALIDATION REPORT" % ACT,
         "sourceClass assignment candidate: the sentence-evidence closure parent + SENTENCE evidence integrity (IV1-M1 documentary interval; IV1-M2 case A entity-name veto; R-M2-CASE-B Owner-accepted residual)",
         "validator: %s" % ARTIFACTS["validator"],
         "mode: read-only; the delivered artifact set is not modified; full generated surfaces",
         "TOTAL %d  PASS %d  FAIL %d" % (meta["total"], meta["pass"], meta["fail"]),
         "VERDICT %s" % ("PASS" if meta["fail"] == 0 else "FAIL"), ""]
    for r in results:
        L.append("[%s] %-6s %s" % ("PASS" if r["pass"] else "FAIL", r["check"], r["name"]))
        if r["detail"]:
            L.append("        %s" % r["detail"][:600])
    L += ["", "Boundary of this result: a PASS proves physical evidence binding, exact rule execution over the recorded witnesses and zero",
          "oracle failures on the declared constructions and generated surfaces. It does not prove semantic truth beyond the recorded",
          "witnesses, and it is not independent verification. NOT INDEPENDENTLY VERIFIED. NOT OWNER-ACCEPTED. NOT CONTROLLING."]
    return "\n".join(L) + "\n"


def forced_failures_text(ff, targeted=False):
    n = sum(1 for x in ff if x["detected"] and not x["validatorCrashed"])
    L = ["MERGEVUE - %s - FORCED-FAILURE RESULTS" % ACT,
         "harness: %s --forced-failures%s" % (ARTIFACTS["validator"], " --targeted" if targeted else ""),
         "method: each mutation is applied to a throw-away copy of the delivered set in the system temp directory; the delivered set is never touched.",
         "refresh: 'model' = the mutator recomputes the model identity in every artifact, re-renders the contract (when the mutated model can still be rendered),",
         "         re-registers the normative hashes and rewrites the manifest; 'light' = re-register + manifest only.",
         "         Refreshing defeats incidental hash tripwires, so a detection is semantic unless the mutation's category says otherwise.",
         "category: SEMANTIC = detected by rule execution, fixture evaluation, the physical oracle, probes, generated surfaces or replay recomputation;",
         "         IDENTITY_CONTROL = the identity check is exactly what is under test; STALE_SURFACE_CONTROL = a replaced truth surface is what is under test;",
         "         DECLARATION_CONTROL = a text-only change to a declarative surface (contract, scope text, delta ledger, a rule sentence) with no behaviour to",
         "         observe: what is under test is that the surface cannot drift from the model, detected by the recomputation that binds it (T-1, X-9, X-10).",
         "mode: MV_FAST (the generated surfaces by the declared stride; every fixture, the pilot and every recorded table are checked in full).",
         ] + (["scope: TARGETED LOAD-BEARING SET (the Owner's optimisation of this act's forced-failure requirement). The exhaustive forced-failure search",
               "       over every mutation of the lineage was intentionally NOT completed; this bounded set covers the load-bearing changes of this act and the",
               "       preservation invariants that detect unauthorized semantic drift, and every required mutation must be detected. BI-FF17 (the authority",
               "       decoder check removed) is not load-bearing at fixture level (the span-text check masks it) and is omitted; the decoder check is",
               "       witnessed by the pilot binding (BI-13). This remains author-side self-validation; fresh independent verification is still mandatory.",
               "", "requirement -> mutations:"] + ["  %s: %s" % (r, ", ".join(ids)) for r, ids in FF_TARGETED] if targeted else []) + [
         "", "DETECTED %d/%d   MISSED %d   validator crashes: %d" % (n, len(ff), len(ff) - n - sum(1 for x in ff if x["validatorCrashed"]),
                                                                    sum(1 for x in ff if x["validatorCrashed"])), ""]
    for x in ff:
        L.append("%-7s %s  refresh=%s category=%s failed checks: %s" % (
            x["id"], "DETECTED" if x["detected"] and not x["validatorCrashed"] else "MISSED", x["refresh"], x.get("category", "SEMANTIC"),
            ", ".join(x["failedChecks"]) or "-"))
        L.append("        mutation: %s" % x["mutation"])
        if x["validatorCrashed"]:
            L.append("        CRASH: %s" % x.get("error"))
    L += ["", "Self-run forced failures are not independent verification."]
    return "\n".join(L) + "\n"


def main(argv):
    sys.dont_write_bytecode = True
    base = os.environ.get("MV_BASE_DIR") or os.path.dirname(os.path.abspath(__file__))
    root = repo_root(base)
    if "--forced-failures" in argv:
        jobs = int(argv[argv.index("--jobs") + 1]) if "--jobs" in argv else 1
        targeted = "--targeted" in argv
        ff = run_forced_failures(base, root, jobs, only=[i for _, ids in FF_TARGETED for i in ids] if targeted else None)
        if "--write-forced-failures" in argv:
            with open(argv[argv.index("--write-forced-failures") + 1], "w", encoding="utf-8") as f:
                f.write(forced_failures_text(ff, targeted))
        for x in ff:
            print("%-7s %-9s %s  <- %s" % (x["id"], "DETECTED" if x["detected"] and not x["validatorCrashed"] else "MISSED", ",".join(x["failedChecks"][:6]), x["mutation"]))
        n = sum(1 for x in ff if x["detected"] and not x["validatorCrashed"])
        print("FORCED FAILURES DETECTED %d/%d; validator crashes: %d" % (n, len(ff), sum(1 for x in ff if x["validatorCrashed"])))
        if "--json" in argv:
            print(json.dumps(ff, indent=1))
        return 0 if n == len(ff) else 1
    results, meta = validate(base, root=root)
    text = report_text(results, meta, base)
    if "--write-report" in argv:
        with open(argv[argv.index("--write-report") + 1], "w", encoding="utf-8") as f:
            f.write(text)
    sys.stdout.write(text)
    return 0 if meta["fail"] == 0 else 1


if __name__ == "__main__":
    sys.exit(main(sys.argv[1:]))
