#!/usr/bin/env python3
# Owner-authorized CODER act IMPLEMENTATION-1.CORR6, CODEX, 2026-10-06.
# C5-01..06: authoritative package resolution; typed row variants; exact enums;
# registry counter target binding; external two-layer author self-validation.
# CORR4 migration and established W/T/U mechanics are the starting implementation.
# Candidate machinery only, no production wiring/acceptance claim. A-E001 stays
# re-adjudication-only. No final effective view or Environment math is authorized.
import argparse
import copy
import hashlib
import json
import os
import re
import sys
import tempfile
from pathlib import Path
from dataclasses import dataclass

LEGACY_VOCAB = {
    "DIRECT_SUPPORT", "DIRECT_CONTRADICTION", "SHARED_NON_UNIQUE",
    "NON_DISCRIMINATING", "NOT_DETERMINABLE",
}
SUCCESSOR_BEARING_VOCAB = {
    "DIRECT_SUPPORT", "DIRECT_CONTRADICTION", "SHARED_NON_UNIQUE", "NON_DISCRIMINATING",
}
EVALUABILITY_VOCAB = {"EVALUABLE", "INDETERMINATE"}
REASON_ORDER = [
    "SOURCE_CONTENT_INACCESSIBLE",       # EV-1
    "MECHANISM_READING_AMBIGUOUS",       # EV-2
    "COMPONENT_NOT_ASSESSABLE",          # EV-3
    "TARGET_BINDING_UNRESOLVED",         # EV-4
]
HOLD_CODES = {"HOLD-ND", "HOLD-AMB", "HOLD-NA", "HOLD-T", "HOLD-U"}

ACCEPTED_REGISTRY_SHA = "cb08b51e1c2fbaec7765989a7a4e15db1788c53eb5fec43f2628ecb88c1d6c73"
NACR_CLAUSE_M = "M-RES-ASYMMETRIC-RETENTION"
NACR_CLAUSE_C = "c3"

# SEP-B-1a (Owner Decision 3) — availability of the C34 §6 "Constitutive-rule exception",
# derived from bound authority, never from a caller value (CORR2-IV1-06). The bound C34
# §6 contract states: "For the current authority corpus, no known constitutive structural
# discriminator instance exists" and "If no such anchor is identified and independently
# verified: CONSTITUTIVE EXCEPTION = NOT AVAILABLE"
# (docs/reference/root-definitional-v1.7/contract/CASE-3.4_CONTRACT_v1.3.md, §6,
# version-bound). No engine path reads a caller-supplied availability flag.
C34_CONSTITUTIVE_EXCEPTION = "NOT_AVAILABLE"


def constitutive_exception_available(tree_target_id=None):
    """Per-TT availability of the C34 §6 constitutive exception. Derived solely from the
    bound C34_CONSTITUTIVE_EXCEPTION authority state above: NOT_AVAILABLE for every tree
    target of the frozen corpus (Owner Decision 3 / SEP-B-1a / SEP-I-5)."""
    return C34_CONSTITUTIVE_EXCEPTION != "NOT_AVAILABLE"


# --------------------------------------------------------------------------------------
# IV1-F05 — one canonical normalization for the forbidden-output guard
# --------------------------------------------------------------------------------------

def _norm_key(k):
    """THE single canonical normalization applied to BOTH an incoming key and every
    member of the forbidden set. No mixed-case comparison survives this function."""
    return str(k).strip().lower()


# Forbidden output fields per the read-only successor schema (forbiddenOutputFields)
# plus the Environment-Math gate surfaces. Stored pre-normalized.
_ENV_FORBIDDEN_KEYS = frozenset(_norm_key(k) for k in (
    "score", "probability", "confidence", "weight", "threshold",
    "environment", "environmentAssignment", "environmentCode", "environmentRanking",
    "prediction", "predictionAccuracy",
    "ecs", "pair", "friction",
    "outcome", "realizedOutcome", "success", "failure",
    "stratificationMark", "stratumLabel", "sampleDLabel", "peerCoderResult",
    "supportClass",       # successor records carry no supportClass key (SEP-I-4)
))


def assert_environment_safe(payload):
    """Recursive guard: no emitted structure may carry a forbidden output key under any
    casing (IV1-F05). Returns the list of offending key paths (empty == safe)."""
    banned = []

    def scan(o, path=""):
        if isinstance(o, dict):
            for k, v in o.items():
                if isinstance(k, str) and _norm_key(k) in _ENV_FORBIDDEN_KEYS:
                    banned.append(path + "." + k)
                scan(v, path + "." + str(k))
        elif isinstance(o, list):
            for i, v in enumerate(o):
                scan(v, "%s[%d]" % (path, i))

    scan(payload)
    return banned


# --------------------------------------------------------------------------------------
# Registry parse (Class B mechanical extraction; methodology cb08b51e… only; unchanged
# from CORR2 — independently verified 74/62/40/219/Cmp 74/74 by IV1 §17 and re-crossed
# against the published census table by the CORR2.IV1 oracle)
# --------------------------------------------------------------------------------------

def _split_row(line):
    """Split a §D table row on '|' at brace depth 0 only (open-category {a|b} content)."""
    cells, cur, depth = [], [], 0
    for ch in line:
        if ch == "{":
            depth += 1
        elif ch == "}":
            depth = max(0, depth - 1)
        if ch == "|" and depth == 0:
            cells.append("".join(cur).strip())
            cur = []
        else:
            cur.append(ch)
    cells.append("".join(cur).strip())
    return cells


def _norm_id(cell):
    return cell.split()[0] if cell.split() else cell


def _component_ids(cell):
    cell = cell.split("‖")[0]
    ids = []
    for part in cell.split("·"):
        m = re.match(r"^(c\d+)\b", part.strip())
        if m:
            ids.append(m.group(1))
    return ids


def parse_registry(meth_text):
    m_rows = {}
    tt_blocks = {}
    lines = meth_text.splitlines()
    section = None
    for raw in lines:
        line = raw.rstrip()
        if line.startswith("### Presentation objects"):
            section = "presentation"
            continue
        if line.startswith("### Mechanism objects"):
            section = "mechanism"
            continue
        if line.startswith("### "):
            if section in ("presentation", "mechanism"):
                section = None
            continue
        if section not in ("presentation", "mechanism"):
            continue
        if not line.startswith("| M-"):
            continue
        cells = _split_row(line.strip().strip("|"))
        if section == "presentation":
            if len(cells) < 11:
                continue
            mid = _norm_id(cells[0])
            req, altcell = cells[5], cells[9]
            d_ids = ["D-01"]
        else:
            if len(cells) < 9:
                continue
            mid = _norm_id(cells[0])
            dcell, req, altcell = cells[2], cells[6], cells[7]
            d_ids = re.findall(r"D-\d+", dcell)
        if not mid.startswith("M-"):
            continue
        m_rows[mid] = {
            "id": mid,
            "objectType": "ORGANIZATIONAL_PRESENTATION" if section == "presentation" else "ORGANIZATIONAL_MECHANISM",
            "D": d_ids,
            "requiredComponents": _component_ids(req),
            "altDeclared": re.findall(r"M-[A-Z0-9-]+", altcell),
            "explicitNonMeaning": cells[4] if section == "presentation" else cells[5],
        }

    env_re = re.compile(r"^loc:\s*(\S+)")
    cur = None
    for raw in lines:
        line = raw.rstrip()
        h = re.match(r"^###\s+(TT-[A-Z0-9-]+)\s*$", line)
        if h:
            cur = h.group(1)
            tt_blocks[cur] = {"id": cur, "env": None, "docStatus": None, "verdict": None,
                              "mechExpr": [], "D": [], "prohib": []}
            continue
        if cur is None:
            continue
        if line.startswith("### "):
            cur = None
            continue
        m = env_re.match(line)
        if m:
            tt_blocks[cur]["env"] = m.group(1)
        for t in (x.strip() for x in line.split("|")):
            for key, field in (("docStatus:", "docStatus"), ("verdict:", "verdict"), ("prohib:", "prohib")):
                if t.startswith(key):
                    val = t[len(key):].strip()
                    if field == "prohib":
                        tt_blocks[cur]["prohib"] = re.findall(r"PR-[A-Z0-9-]+", val)
                    elif val:
                        tt_blocks[cur][field] = val
            if t.startswith("mechExpr:"):
                tt_blocks[cur]["mechExpr"] = re.findall(r"M-[A-Z0-9-]+", t[len("mechExpr:"):])
            if t.startswith("D:"):
                tt_blocks[cur]["D"] = re.findall(r"D-\d+", t[len("D:"):])

    env_of_m = {}
    for mid in m_rows:
        envs = sorted({tt["env"] for tt in tt_blocks.values() if mid in tt["mechExpr"] and tt["env"]})
        env_of_m[mid] = envs[0] if len(envs) == 1 else (envs or None)

    nacr = {}
    asym = m_rows.get(NACR_CLAUSE_M)
    if asym and NACR_CLAUSE_C in asym["requiredComponents"]:
        nacr["NACR-1"] = {
            "mechanismPropositionId": NACR_CLAUSE_M,
            "componentId": NACR_CLAUSE_C,
            "trigger": "contribution and return channels identified, channels heterogeneous, and no LAWFUL comparison basis",
        }
    cmp_table = {}
    for mid, row in m_rows.items():
        others = set()
        for mid2, row2 in m_rows.items():
            if mid2 == mid:
                continue
            if env_of_m.get(mid2) in (None, env_of_m.get(mid)):
                continue
            if set(row2["D"]) & set(row["D"]):
                others.add(mid2)
            elif mid2 in row["altDeclared"] or mid in row2["altDeclared"]:
                others.add(mid2)
        cmp_table[mid] = sorted(others)

    return {"m": m_rows, "tt": tt_blocks, "nacr": nacr, "envOfM": env_of_m, "cmp": cmp_table, "counterOf": counter_mapping(meth_text)}


def counter_mapping(meth_text):
    """E-R8 explicitly listed incompatibilities only; alternative lists are not counters."""
    lines = [line for line in meth_text.splitlines() if "M-ADJ-ARGUMENT-QUALITY ↔ M-AUTH-TOPDOWN-EXPLICIT" in line]
    if len(lines) != 1:
        raise ValueError("frozen E-R8 counter relation not uniquely resolved")
    pairs = re.findall(r"(M-[A-Z0-9-]+) ↔ (M-[A-Z0-9-]+)", lines[0])
    mapping = {}
    for left, right in pairs:
        mapping.setdefault(left, set()).add(right)
        mapping.setdefault(right, set()).add(left)
    return {mid: sorted(leaves) for mid, leaves in sorted(mapping.items())}


def countered_leaves(record, tt, registry):
    mids = record.get("mechanismPropositionIds") or []
    if record.get("relation") != "COUNTER_M" or len(mids) != 1:
        return set()
    return set(registry.get("counterOf", {}).get(mids[0], ())) & set(tt.get("mechExpr", ()))


def registry_identity(meth_bytes):
    return hashlib.sha256(meth_bytes).hexdigest()


def consuming_tts(registry, m_id):
    """Registry-derived lawful consuming TTs of M (EXACT + DOCUMENTARY_COMPLETE_CANDIDATE).
    Mechanically derived — never read from a caller summary (IV1-F02 W-3 basis)."""
    return sorted(t["id"] for t in registry["tt"].values()
                  if m_id in t["mechExpr"]
                  and t["verdict"] == "EXACT"
                  and t["docStatus"] == "DOCUMENTARY_COMPLETE_CANDIDATE")


# --------------------------------------------------------------------------------------
# Abstention declarations with EXACT identity binding (IV1-F04)
# --------------------------------------------------------------------------------------

def extract_declarations(abstention):
    if abstention is None or abstention == {}:
        return []
    if isinstance(abstention, dict):
        if abstention.get("declared") is False and not abstention.get("declarations"):
            return []
        declarations = abstention.get("declarations")
        if isinstance(declarations, list):
            return [{"code": d.get("code"), "mechanismPropositionId": d.get("mechanismPropositionId"),
                     "componentId": d.get("componentId")} if isinstance(d, dict)
                    else {"code": None} for d in declarations]
    return [{"code": None}]


def classify_declaration(d, registry_nacr):
    """Classify one declaration against the accepted clause registry.
    Returns (kind, clauseKey). kind ∈ NACR | CONDITION_NOT_MET | NONCOMPONENT | INVALID.
    A NACR-family code is VALID only if it binds EXACTLY the accepted clause identity
    (mechanism AND component). Nothing is normalized, substituted or repaired."""
    code = d["code"]
    if not isinstance(code, str):
        return ("INVALID", None)
    if code in ("SRC-INACCESSIBLE", "EST-CHAR", "EST-PLAN", "EST-SILENCE"):
        return ("NONCOMPONENT", None)
    base = code.split(":")[0]
    if base in registry_nacr and code in (base, base + ":CONDITION_NOT_MET"):
        clause = registry_nacr[base]
        if d.get("mechanismPropositionId") != clause["mechanismPropositionId"]:
            return ("INVALID", base)   # wrong mechanism named
        if d.get("componentId") != clause["componentId"]:
            return ("INVALID", base)   # wrong component named
        if code.endswith(":CONDITION_NOT_MET"):
            return ("CONDITION_NOT_MET", base)
        return ("NACR", base)
    return ("INVALID", None)           # unknown / out-of-registry code (SEP-NACR-1)


# --------------------------------------------------------------------------------------
# Component partition (unchanged semantics; consumes only VALID NACR declarations)
# --------------------------------------------------------------------------------------

def supplied_component_ids(record):
    out = set()
    for e in record.get("componentSupply") or []:
        if isinstance(e, dict) and isinstance(e.get("componentId"), str) and e["componentId"].strip():
            out.add(e["componentId"])
        elif isinstance(e, str):
            out.add(e)
    return out


def _supplies_of(record, m_id):
    """The record's componentSupply entries bound to exactly this M (frozen §I six-key
    form; H-5 per-component supplying facts). Callers enforce exactly-one per component."""
    return [s for s in (record.get("componentSupply") or [])
            if isinstance(s, dict) and s.get("mechanismPropositionId") == m_id]


def component_partition(record, m_row, registry_nacr):
    supplied = supplied_component_ids(record)
    declared = {}
    for d in extract_declarations(record.get("abstention")):
        kind, key = classify_declaration(d, registry_nacr)
        if kind == "NACR":
            clause = registry_nacr[key]
            if clause["mechanismPropositionId"] == m_row["id"]:
                declared[clause["componentId"]] = key
    partition = {}
    for c in m_row["requiredComponents"]:
        na = c in declared
        sup = c in supplied
        if na and sup:
            partition[c] = "SUPPLIED_AND_NON_ASSESSABLE_CONTRADICTION"
        elif na:
            partition[c] = "NON_ASSESSABLE"
        elif sup:
            partition[c] = "SUPPLIED"
        else:
            partition[c] = "ORDINARY_MISSING_ASSESSABLE"
    return partition


def ev_input_signature(record, m_id):
    amb = record.get("ambiguity") or {}
    return {
        "sourceQualityState": record.get("sourceQualityState"),
        "ambiguity.competingMechanismIds": amb.get("competingMechanismIds", []) if isinstance(amb, dict) else [],
        "ambiguity.resolutionState": amb.get("resolutionState") if isinstance(amb, dict) else None,
        "abstention.declarations": extract_declarations(record.get("abstention")),
        "componentSupply.componentIds": sorted(supplied_component_ids(record)),
        "mechanismPropositionIds": record.get("mechanismPropositionIds", []),
        "treeTargetIds": record.get("treeTargetIds", []),
        "M": m_id,
    }


# --------------------------------------------------------------------------------------
# Admission (S2) — IV1-F04 identity-enforcing
# --------------------------------------------------------------------------------------

SEMANTIC_DOMAINS = {
    "relevanceState": ("ANALYTICAL_MAPPED", "UNMAPPED_OBSERVATION", "NON_ANALYTICAL"),
    "relation": ("SUPPORTS_LEAF", "NEGATES_LEAF", "COUNTER_M"),
    "evidenceForm": ("DE-1", "DE-2", "DE-3", "DE-4"),
    "sourceQualityState": ("COMPETENT", "COMPETENT_SELF_DESCRIPTION_UNCORROBORATED", "NOT_COMPETENT_FOR_PROPOSITION", "CONTENT_INACCESSIBLE"),
    "edgeState": ("SUPPORTED", "PARTIAL", "CONFLICT", "AMBIGUOUS", "GAP", "COUNTEREVIDENCE", "NOT_DETERMINABLE"),
}

def admit(record, m_row, registry_nacr, registry_sha):
    for field, domain in SEMANTIC_DOMAINS.items():
        value = record.get(field)
        if not isinstance(value, str) or value not in domain:
            return False, "HOLD-NA", [field + " outside exact frozen domain"]
    if record.get("relation") not in ("SUPPORTS_LEAF", "NEGATES_LEAF", "COUNTER_M"):
        return False, "HOLD-NA", ["relation outside frozen §I domain"]
    if record.get("evidenceForm") not in ("DE-1", "DE-2", "DE-3", "DE-4"):
        return False, "HOLD-NA", ["evidenceForm outside frozen H-6/schema domain"]
    edge = record.get("edgeState")
    decls = extract_declarations(record.get("abstention"))
    supplied = supplied_component_ids(record)

    # AV-1
    if edge == "NOT_DETERMINABLE":
        has_ev1 = record.get("sourceQualityState") == "CONTENT_INACCESSIBLE"
        has_nacr = any(classify_declaration(d, registry_nacr)[0] == "NACR" for d in decls)
        if not has_ev1 and not has_nacr:
            return False, "HOLD-ND", ["edgeState NOT_DETERMINABLE without EV-1 cause and without a valid NACR declaration"]
    # AV-2
    amb = record.get("ambiguity") or {}
    competing = bool(amb.get("competingMechanismIds")) if isinstance(amb, dict) else False
    unresolved = competing and amb.get("resolutionState") != "RESOLVED"
    if edge == "AMBIGUOUS" and not unresolved:
        return False, "HOLD-AMB", ["edgeState AMBIGUOUS while the ambiguity record has no unresolved competing M-ids"]
    if edge != "AMBIGUOUS" and unresolved:
        return False, "HOLD-AMB", ["unresolved competing M-ids while edgeState is not AMBIGUOUS"]
    # AV-3 (IV1-F04: exact identity binding; invalid declarations are never reinterpreted)
    for d in decls:
        kind, key = classify_declaration(d, registry_nacr)
        if kind == "INVALID":
            clause = registry_nacr.get(key) if key else None
            if clause is not None:
                return False, "HOLD-NA", [
                    "NACR declaration identity binding invalid (SEP-NACR-1/AV-3): code=%s names "
                    "mechanism=%s component=%s; the accepted clause is %s/%s — never normalized"
                    % (d["code"], d.get("mechanismPropositionId"), d.get("componentId"),
                       clause["mechanismPropositionId"], clause["componentId"])]
            return False, "HOLD-NA", ["inadmissible abstention code (SEP-NACR-1): %s" % d["code"]]
        if d["code"] == "SRC-INACCESSIBLE" and record.get("sourceQualityState") != "CONTENT_INACCESSIBLE":
            return False, "HOLD-NA", ["SRC-INACCESSIBLE without sourceQualityState CONTENT_INACCESSIBLE"]
    # NACR-domain explicit-disposition requirement (valid dispositions only)
    if m_row["id"] == NACR_CLAUSE_M and NACR_CLAUSE_C not in supplied:
        has_valid = any(classify_declaration(d, registry_nacr)[0] in ("NACR", "CONDITION_NOT_MET")
                        for d in decls)
        if not has_valid:
            return False, "HOLD-NA", ["NACR-domain record whose clause component is unsupplied carries no valid explicit NACR-1 / NACR-1:CONDITION_NOT_MET disposition"]
    # SEP-NACR-V version binding
    if registry_sha and registry_sha != ACCEPTED_REGISTRY_SHA:
        return False, "HOLD-NA", ["registry identity not covered by SEP-NACR-V"]
    # AV-6
    part = component_partition(record, m_row, registry_nacr)
    for c, st in part.items():
        if st == "SUPPLIED_AND_NON_ASSESSABLE_CONTRADICTION":
            return False, "HOLD-NA", ["AV-6: component %s both SUPPLIED and NON_ASSESSABLE (valid declaration)" % c]
    return True, None, []


# --------------------------------------------------------------------------------------
# EV gates (S3; unchanged — exact closed signature)
# --------------------------------------------------------------------------------------

def ev_gates(record, m_row, partition, registry, tree_target_id=None):
    failing = []
    if record.get("sourceQualityState") == "CONTENT_INACCESSIBLE":
        failing.append("SOURCE_CONTENT_INACCESSIBLE")
    amb = record.get("ambiguity") or {}
    if isinstance(amb, dict) and amb.get("competingMechanismIds") and amb.get("resolutionState") != "RESOLVED":
        failing.append("MECHANISM_READING_AMBIGUOUS")
    if any(st == "NON_ASSESSABLE" for st in partition.values()):
        failing.append("COMPONENT_NOT_ASSESSABLE")
    for tt_id in ([tree_target_id] if tree_target_id is not None else record.get("treeTargetIds", [])):
        tt = registry["tt"].get(tt_id)
        if tt is None or tt["verdict"] != "EXACT" or tt["docStatus"] != "DOCUMENTARY_COMPLETE_CANDIDATE" \
                or (m_row["id"] not in tt["mechExpr"] and not countered_leaves(record, tt, registry)):
            failing.append("TARGET_BINDING_UNRESOLVED")
            break
    order = {r: i for i, r in enumerate(REASON_ORDER)}
    return sorted(set(failing), key=lambda r: order[r])


# --------------------------------------------------------------------------------------
# CORR3 — directionality trace CLOSURE (T-1..T-5 enforced; fail closed), binding only
# frozen-contract fields (CORR2-IV1-01) and certified fact content (CORR2-IV1-04)
# --------------------------------------------------------------------------------------

# Frozen identity members (CORR1 §6.5; successor schema + source matrix).
IDENTITY_FIELDS = ("side", "caseId", "factualPackageIdentity", "contractIdentity",
                   "vocabularyVersion", "coderIdentity")
MD2_DOMAIN = frozenset(("TRIGGERED", "NOT_TRIGGERED"))
W_DISPOSITION_DOMAIN = frozenset(("SELECTED", "NOT_SELECTABLE"))


def _canon(value):
    """Type-exact canonical form for structured identity equality (CORR2-IV1-08):
    JSON serialization distinguishes 1 / 1.0 / true, which Python == conflates."""
    return json.dumps(value, sort_keys=True, ensure_ascii=False)


def _present(value):
    """Identity-member presence: None, "" and {} are absent; any other value — including
    0 or False — is present (structured members are compared by _canon, never coerced)."""
    return value is not None and _canon(value) not in ("null", '""', "{}")


def _identity_errors(actual, expected):
    """All six frozen identity members must be present on BOTH sides and canonically
    equal (CORR1 §6.5). Equality is type-exact (CORR2-IV1-08): no numeric/bool coercion."""
    if not isinstance(actual, dict) or not isinstance(expected, dict):
        return ["missing identity envelope"]
    errors = []
    for k in IDENTITY_FIELDS:
        expected_v = expected.get(k)
        actual_v = actual.get(k)
        if not _present(expected_v) or not _present(actual_v) or _canon(actual_v) != _canon(expected_v):
            errors.append(k)
    return errors


def _md_disposition(value, comparator, registry):
    """Exact token domain; CO_ENTAILS requires a local component of the named M'.
    Rationale is a separate companion field. Unknown tokens have no semantics."""
    if value in ("NO_CO_ENTAILMENT", "UNRESOLVED"):
        return value, None
    if isinstance(value, str):
        legal = registry["m"].get(comparator, {}).get("requiredComponents", [])
        for c in legal:
            if value == "CO_ENTAILS " + c:
                return "CO_ENTAILS", c
    return None, None


def _md2_clause_set(cell):
    """T-2: exact registry clauses; delimiters inside quoted content remain content."""
    result, token, closing = [], [], None
    quote_ends = {'"': '"', '“': '”', '‘': '’'}
    escaped = False
    for ch in cell or "":
        if escaped:
            token.append(ch)
            escaped = False
        elif ch == "\\" and closing:
            token.append(ch)
            escaped = True
        elif closing:
            token.append(ch)
            if ch == closing:
                closing = None
        elif ch in quote_ends:
            closing = quote_ends[ch]
            token.append(ch)
        elif ch == ";":
            result.append("".join(token))
            token = []
        else:
            token.append(ch)
    if closing:
        return set()
    result.append("".join(token))
    return {cl.strip().rstrip(".").strip() for cl in result if cl.strip()}


SOURCE_MAP_SHA = "665aac81c2e0127d08f0406186891959255391cb99ec34611a972209565f4a7f"
SOURCE_MAP_REL = "WORKBENCH/DOWNLOADS/STAGE2_CORR4_PILOT_STAGE1_SOURCE_MAP.json"
PI3_MEMBERS = ("caseSlug", "stage1Generation", "packageDir", "recordFile", "recordFormat", "recordFileBytes", "recordFileSha256")
LOCATOR_KEYS = ("recordListKey", "factTextKey", "factIdKey", "caseIdKey", "sideIdKey", "factIdLocator", "caseIdLocator", "sideIdLocator", "factTextLocator")

@dataclass(frozen=True)
class ResolvedPackageIdentity:
    authority: str
    record_file: Path
    digest: str
    source_entry: dict

@dataclass(frozen=True)
class CertifiedFact:
    authority: str
    package_digest: str
    fact_id: str
    case_id: str
    side: str
    proposition: str

class ProductionPackageAuthority:
    """Only the hash-bound Stage-1 map can supply locators and package paths.
    trusted_base is explicit; mapped sibling packages are allowed only under that
    base. Caller identity members are equality assertions, never read locations.
    """
    def __init__(self, repository_root, trusted_base=None):
        self.repository_root = Path(repository_root).resolve()
        self.trusted_base = Path(trusted_base).resolve() if trusted_base is not None else self.repository_root.parent
        raw = (self.repository_root / SOURCE_MAP_REL).read_bytes()
        if hashlib.sha256(raw).hexdigest() != SOURCE_MAP_SHA:
            raise ValueError("unbound Stage-1 source map")
        self.entries = json.loads(raw)["cases"]
        self.identity = "FROZEN_STAGE1_SOURCE_MAP:" + SOURCE_MAP_SHA

    def resolve(self, identity):
        if not isinstance(identity, dict) or not all(k in identity for k in PI3_MEMBERS):
            return None
        matches = [entry for entry in self.entries if all(_canon(identity[k]) == _canon(entry[k]) for k in PI3_MEMBERS)]
        if len(matches) != 1:
            return None
        entry = matches[0]
        # New locator overrides are refused. Redundant PI-3 locator labels already
        # carried by historical identities are equality-checked against the map.
        if any(k in identity for k in ("recordListKey", "factTextKey", "factTextLocator")):
            return None
        if any(k in identity and _canon(identity[k]) != _canon(entry.get(k)) for k in LOCATOR_KEYS):
            return None
        # PI-3 matrix + physical authority binding: additional members are
        # checked assertions. The source map, never the caller, supplies values.
        assertions = {
            "packageFactCount": entry["factCount"],
            "packageSideCount": entry["sideCount"],
            "identityAuthority": Path(SOURCE_MAP_REL).name,
            "identityAuthoritySha256": SOURCE_MAP_SHA,
        }
        if any(k in identity and _canon(identity[k]) != _canon(v) for k, v in assertions.items()):
            return None
        allowed = set(PI3_MEMBERS) | set(LOCATOR_KEYS) | set(assertions)
        if set(identity) - allowed:
            return None
        path = Path(entry["recordFile"])
        path = (self.trusted_base / path).resolve() if not path.is_absolute() else path.resolve()
        if not path.is_relative_to(self.trusted_base):
            return None
        if path.parent != Path(entry["packageDir"]).resolve():
            return None
        return ResolvedPackageIdentity(self.identity, path, entry["recordFileSha256"], dict(entry))

    def certify(self, identity, fact_id, case_id, side):
        resolved = self.resolve(identity)
        if resolved is None:
            return None
        try:
            raw = resolved.record_file.read_bytes()
            entry = resolved.source_entry
            if len(raw) != entry["recordFileBytes"] or hashlib.sha256(raw).hexdigest() != resolved.digest:
                return None
            document = json.loads(raw) if entry["recordFormat"] == "json" else None
            rows = (document if isinstance(document, list) else document[entry["recordListKey"]]) if entry["recordFormat"] == "json" else [json.loads(line) for line in raw.splitlines() if line.strip()]
            matches = [row for row in rows if _canon(row.get(entry["factIdKey"])) == _canon(fact_id)]
            if len(matches) != 1:
                return None
            row = matches[0]
            actual_case = document.get(entry["caseIdKey"]) if entry["caseIdLocator"].startswith("package-level") else row.get(entry["caseIdKey"])
            actual_side = row.get(entry["sideIdKey"])
            text = row.get(entry["factTextKey"])
            if _canon(actual_case) != _canon(case_id) or _canon(actual_side) != _canon(side):
                return None
            if not isinstance(text, str) or not text:
                return None
            return CertifiedFact(self.identity, resolved.digest, fact_id, actual_case, actual_side, text)
        except (OSError, ValueError, TypeError, KeyError, AttributeError):
            return None

class SyntheticTestAuthority:
    """Explicit scratch-only authority; production resolve never accepts its ID.
    Constructed by the test runner, never from coder rows or identity locators.
    """
    def __init__(self, identity, package_path, expected_digest):
        self.path = Path(package_path).resolve()
        if not self.path.is_relative_to(Path("/private/tmp")):
            raise ValueError("synthetic authority must reside in /private/tmp")
        self.identity = dict(identity)
        if set(self.identity) != {"syntheticAuthority", "recordFileSha256"} or self.identity["recordFileSha256"] != expected_digest:
            raise ValueError("invalid synthetic test authority identity")
        self.digest = expected_digest

    def certify(self, identity, fact_id, case_id, side):
        if _canon(identity) != _canon(self.identity):
            return None
        try:
            raw = self.path.read_bytes()
            if hashlib.sha256(raw).hexdigest() != self.digest:
                return None
            doc = json.loads(raw)
            rows = [r for r in doc["facts"] if r["factId"] == fact_id]
            if len(rows) != 1 or doc["caseId"] != case_id or rows[0]["side"] != side:
                return None
            return CertifiedFact(self.identity["syntheticAuthority"], self.digest, fact_id, case_id, side, rows[0]["certifiedText"])
        except (OSError, ValueError, TypeError, KeyError):
            return None


def _package_certified_text(fact_id, record, evidence_entry, authority=None):
    package = record.get("factualPackageIdentity")
    if not isinstance(evidence_entry, dict) or _canon(evidence_entry.get("factualPackageIdentity")) != _canon(package):
        return None
    if authority is None:
        # Anchored module path is a fixed default, never ambient CWD. Scratch
        # execution supplies an explicit authority created with the trusted root.
        root = Path(__file__).resolve().parents[3]
        try:
            authority = ProductionPackageAuthority(root)
        except (OSError, ValueError, KeyError):
            return None
    if not isinstance(authority, (ProductionPackageAuthority, SyntheticTestAuthority)):
        return None
    fact = authority.certify(package, fact_id, record.get("caseId"), record.get("side"))
    return fact.proposition if fact is not None and fact.proposition == evidence_entry.get("certifiedText") else None


def _basis_errors(basis, supply, record, component, certified_text, evidence, authority=None):
    """T-2 (CORR1 §6.6; B3-2/B3-3): the component basis is the supplying factIds plus the
    recorded entailment basis, and that basis is certified content of those supplying
    facts, bound through the factual package (CORR2-IV1-04). The §I record stays in its
    frozen six-key componentSupply form: no entailmentBasis field is required or read on
    the §I record, no fact text is carried on it, and no basis identity envelope is
    demanded (CORR2-IV1-01)."""
    if not isinstance(basis, dict):
        return ["basis is not a mapping"]
    if not isinstance(supply, dict):
        return ["supply entry is not a mapping"]
    errors = []
    record_facts = record.get("factIds") if isinstance(record.get("factIds"), list) else []
    supply_facts = supply.get("factIds")
    basis_facts = basis.get("factIds")
    supply_ok = (isinstance(supply_facts, list)
                 and all(isinstance(f, str) and _present(f) for f in supply_facts)
                 and set(supply_facts) <= set(record_facts))
    facts_ok = (supply_ok and isinstance(basis_facts, list) and bool(basis_facts)
                and all(isinstance(f, str) and _present(f) for f in basis_facts)
                and set(basis_facts) <= set(supply_facts))
    if not facts_ok:
        errors.append("supplying factIds not bound to the record through the component supply")
    entailment = basis.get("entailmentBasis")
    if not isinstance(entailment, dict) or not entailment:
        errors.append("recorded entailmentBasis missing")
    elif facts_ok:
        bound_text = {}
        for f in basis_facts:
            ev = evidence.get(f) if isinstance(evidence, dict) else None
            text = _package_certified_text(f, record, ev, authority)
            if text is None:
                errors.append("supplying fact %s is not bound to certified factual-package content" % f)
            else:
                bound_text[f] = text
        for ref, span in entailment.items():
            if (not isinstance(span, str) or not _present(span)
                    or not any(span in text for text in bound_text.values())):
                errors.append("entailmentBasis %s is not certified content of the supplying facts" % ref)
    # Supply fields are identity-bearing when present; required M/component/facts
    # are never inferred from a component id alone.
    if supply.get("mechanismPropositionId") != record["mechanismPropositionIds"][0]:
        errors.append("supply mechanism")
    if "status" in supply and supply["status"] != "SUPPLIED":
        errors.append("supply status")
    if supply.get("componentId") != component:
        errors.append("supply component")
    if "treeTargetId" in supply and supply["treeTargetId"] not in (record.get("treeTargetIds") or []):
        errors.append("supply TT")
    return errors


def trace_closure(trace, supplies, expected_universe_list, record, tt, registry, registry_sha, ctx):
    """T-1..T-5 closure for ONE (record, treeTargetId) — the frozen T(r) key (CORR1 §6.6;
    CORR2-IV1-02). Unknown domains, foreign identity, unbound basis or absent judgment
    provenance produce INCOMPLETE before aggregation. One lawful co-entailment/unresolved
    witness suffices for NON_DISTINGUISHING; a DISTINGUISHING component requires every
    comparator explicitly excluded."""
    errors, comp_verdicts = [], {}
    if not isinstance(trace, dict):
        return "INCOMPLETE", {}, ["T-1: trace is not a mapping"]
    if not isinstance(record.get("factIds"), list) or not record.get("factIds"):
        return "INCOMPLETE", {}, ["T-1: record carries no supplying facts"]
    if not isinstance(record.get("mechanismPropositionIds"), list) or not record["mechanismPropositionIds"]:
        return "INCOMPLETE", {}, ["T-1: record carries no mechanism proposition"]
    mid = record["mechanismPropositionIds"][0]
    # T-1 key, registry and supplying facts; T-5 coder provenance. The trace carries no
    # side/caseId/package/contract/vocabulary envelope — those are W(f) members, and
    # demanding them here was CORR2-IV1-01 (derivable Class-C copies).
    for k, expected in (("record", record.get("edgeId")), ("factIds", record.get("factIds")),
                        ("mechanismPropositionId", mid), ("treeTargetId", tt),
                        ("registryIdentity", registry_sha)):
        if k == "factIds":
            actual = trace.get(k)
            equal = (isinstance(actual, list) and all(isinstance(f, str) for f in actual)
                     and len(actual) == len(expected) and set(actual) == set(expected))
        else:
            equal = _canon(trace.get(k)) == _canon(expected)
        if not _present(expected) or not equal:
            errors.append("T-1 identity: " + k)
    if registry_sha != ACCEPTED_REGISTRY_SHA:
        errors.append("T-1: unbound registry")
    coder_id = trace.get("coderIdentity")
    if not isinstance(coder_id, str) or not _present(coder_id) \
            or _canon(coder_id) != _canon(record.get("coderIdentity")):
        errors.append("T-5 provenance: coderIdentity")
    flags = trace.get("judgmentFlags")
    if not (isinstance(flags, dict) and all(k in flags for k in ("MD1", "MD2", "MD3"))):
        errors.append("T-5: judgment flags per step missing (T-5 requires flags per step and coderIdentity)")
    uni = trace.get("universe")
    if (not isinstance(uni, list) or any(not isinstance(x, str) for x in uni)
            or sorted(uni) != sorted(expected_universe_list)):
        errors.append("T-1 universe mismatch: trace universe != Cmp(M) ∪ Sel_other(f)")
    uni_set = set(expected_universe_list)
    supplied_ids = [s.get("componentId") for s in supplies if isinstance(s, dict)]
    if len(set(supplied_ids)) != len(supplied_ids):
        errors.append("T-2 supply binding: duplicate componentId in componentSupply")
    comps = trace.get("components")
    if not isinstance(comps, dict):
        return "INCOMPLETE", {}, errors + ["T-2: components is not a mapping"]
    if set(comps) != set(supplied_ids):
        errors.append("T-2 supply binding: trace component set differs from SUPPLIED set")
    # Certified content channel (Class A): factId -> certifiedText from the factual
    # package; nothing else about the evidence envelope is required (CORR2-IV1-01).
    evidence = ctx.get("factualEvidence")
    evidence = evidence if isinstance(evidence, dict) else {}
    certified_text = {}
    for f2 in record["factIds"]:
        ev = evidence.get(f2)
        if isinstance(ev, dict) and isinstance(ev.get("certifiedText"), str):
            certified_text[f2] = ev["certifiedText"]
    md2_clauses = _md2_clause_set(registry["m"].get(mid, {}).get("explicitNonMeaning"))
    required = set(registry["m"][mid]["requiredComponents"])
    for c, e in comps.items():
        if not isinstance(e, dict) or c not in required:
            errors.append("T-2: invalid component entry " + str(c))
            continue
        entries_c = [s for s in supplies if isinstance(s, dict) and s.get("componentId") == c]
        if len(entries_c) != 1:
            errors.append("T-2: component %s lacks exactly one bound supply" % c)
            continue
        binding = _basis_errors(e.get("basis"), entries_c[0], record, c, certified_text, evidence, ctx.get("packageAuthority"))
        errors.extend("T-2 basis %s: %s" % (c, x) for x in binding)
        md2 = e.get("MD2")
        if not isinstance(md2, str) or md2 not in MD2_DOMAIN:
            errors.append("T-2 MD2: non-domain value on " + c)
            continue
        if md2 == "TRIGGERED":
            quote = e.get("explicitNonMeaningClause")
            if not isinstance(quote, str) or quote.strip().rstrip(".").strip() not in md2_clauses:
                errors.append("T-2 MD2: TRIGGERED without the quoted registry explicitNonMeaning clause on " + c)
        md3 = e.get("MD3")
        if not isinstance(md3, dict):
            errors.append("T-3: MD3 is not a mapping on " + c)
            continue
        disps = {}
        for m, value in md3.items():
            disp, target = _md_disposition(value, m, registry)
            if m not in uni_set or disp is None:
                errors.append("T-3 MD3: non-domain or out-of-universe judgment on %s/%s" % (c, m))
            else:
                disps[m] = disp
        if md2 == "TRIGGERED":
            comp_verdicts[c] = "NON_DISTINGUISHING"
        elif set(disps) == uni_set and all(v == "NO_CO_ENTAILMENT" for v in disps.values()):
            comp_verdicts[c] = "DISTINGUISHING"
        elif any(v in ("CO_ENTAILS", "UNRESOLVED") for v in disps.values()):
            comp_verdicts[c] = "NON_DISTINGUISHING"
        else:
            errors.append("T-3/T-4: incomplete comparator judgments on " + c)
    if errors:
        return "INCOMPLETE", comp_verdicts, errors
    if any(v == "DISTINGUISHING" for v in comp_verdicts.values()):
        return "DIRECTIONAL", comp_verdicts, []
    if supplied_ids and set(comp_verdicts) == set(supplied_ids) and all(v == "NON_DISTINGUISHING" for v in comp_verdicts.values()):
        return "NON_DIRECTIONAL", comp_verdicts, []
    return "INCOMPLETE", comp_verdicts, ["T-4 aggregation incomplete over supplied components"]


def expected_universe(m_id, witness_selected, registry):
    """T-1: Cmp+(r) = Cmp(M) ∪ Sel_other(f); other-Environment SELECTED Ms only."""
    env = registry["envOfM"].get(m_id)
    base = set(registry["cmp"].get(m_id, []))
    sel_other = {
        mid for mid in witness_selected
        if mid != m_id and registry["envOfM"].get(mid) not in (None, env)
    }
    return sorted(base | sel_other)


# --------------------------------------------------------------------------------------
# CORR3 — per-(record, treeTargetId) evaluation units (CORR2-IV1-02)
# --------------------------------------------------------------------------------------

def _subject_trace_outcomes(record, supplies, expected_universe_list, registry, registry_sha, ctx, tree_target_id=None):
    """B-3 for the record itself: one complete lawful T(r) for EVERY
    (edgeId, treeTargetId) of the record (T(r) is keyed edgeId + treeTargetId; CORR1
    §6.6). Any (edgeId, TT) without a complete trace holds the record (SEP-AV-4), never
    directs it. The caller supplies exactly one consuming TT; no cross-TT fold is lawful."""
    outcomes = []
    for tt in ([tree_target_id] if tree_target_id is not None else record.get("treeTargetIds") or []):
        tr = (ctx.get("traces") or {}).get((record.get("edgeId"), tt))
        if not isinstance(tr, dict):
            outcomes.append({"treeTargetId": tt, "verdict": "ABSENT",
                             "errors": ["SEP-AV-4: T(r) absent for (%s, %s)" % (record.get("edgeId"), tt)]})
            continue
        verdict, compv, errs = trace_closure(tr, supplies, expected_universe_list, record, tt,
                                             registry, registry_sha, ctx)
        outcomes.append({"treeTargetId": tt, "verdict": verdict,
                         "componentVerdicts": compv, "errors": errs})
    if any(o["verdict"] in ("ABSENT", "INCOMPLETE") for o in outcomes):
        return "HELD", outcomes
    if len(outcomes) != 1:
        raise ValueError("bearing must be evaluated at the frozen (edge, TT) grain")
    return outcomes[0]["verdict"], outcomes


def _merge_component_verdicts(outcomes):
    """Order-independent component-verdict merge across a record's TTs
    (DISTINGUISHING wins; diagnostic output only)."""
    merged = {}
    for o in outcomes:
        for c, v in (o.get("componentVerdicts") or {}).items():
            if v == "DISTINGUISHING" or c not in merged:
                merged[c] = v
    return merged


def classify_row(record):
    """Canonical variant boundary. All rows remain visible to W-3.
    Non-mapped rows may carry null or in-domain descriptive metadata; a populated
    M/TT/supply is analytical content and cannot hide under a non-mapped class.
    """
    if not isinstance(record, dict):
        return None, ["unreadable row"]
    kind = record.get("relevanceState")
    if not isinstance(kind, str) or kind not in SEMANTIC_DOMAINS["relevanceState"]:
        return None, ["unknown relevanceState"]
    errors = []
    facts = record.get("factIds")
    if not isinstance(facts, list) or not facts or any(not isinstance(f, str) or not f for f in facts) or len(set(facts)) != len(facts):
        errors.append("ambiguous fact membership")
    for field, domain in SEMANTIC_DOMAINS.items():
        value = record.get(field)
        if kind != "ANALYTICAL_MAPPED" and value is None:
            continue
        if not isinstance(value, str) or value not in domain:
            errors.append("exact domain: " + field)
    if kind == "ANALYTICAL_MAPPED":
        for field in ("mechanismPropositionIds", "treeTargetIds"):
            value = record.get(field)
            if not isinstance(value, list) or not value or any(not isinstance(x, str) or not x for x in value) or len(set(value)) != len(value):
                errors.append("analytical " + field)
        if isinstance(record.get("mechanismPropositionIds"), list) and len(record["mechanismPropositionIds"]) != 1:
            errors.append("analytical single mechanism")
        supplies = record.get("componentSupply")
        if not isinstance(supplies, list):
            errors.append("analytical componentSupply")
        else:
            for entry in supplies:
                fs = entry.get("factIds") if isinstance(entry, dict) else None
                keys = {"mechanismPropositionId", "componentId", "factIds", "relationInstanceId", "organizationalObjectRef", "linkageEvidence"}
                if not isinstance(entry, dict) or set(entry) != keys:
                    errors.append("analytical six-key componentSupply grammar")
                elif (entry["mechanismPropositionId"] not in (record.get("mechanismPropositionIds") or [])
                      or not isinstance(entry["componentId"], str) or not entry["componentId"]
                      or not isinstance(entry["linkageEvidence"], dict)):
                    errors.append("analytical componentSupply binding")
                if not isinstance(fs, list) or not fs or any(not isinstance(x, str) or not x for x in fs) or len(set(fs)) != len(fs) or (isinstance(facts,list) and not set(fs) <= set(facts)):
                    errors.append("analytical supplying facts")
    else:
        for field in ("mechanismPropositionIds", "treeTargetIds", "componentSupply"):
            value = record.get(field)
            if value is not None and value != []:
                errors.append("hidden analytical content: " + field)
    return kind, errors


def _coder_output_errors(coder_output):
    if not isinstance(coder_output, dict):
        return ["coderOutput is not a mapping"]
    errors = []
    for group in coder_output.values():
        if not isinstance(group, list):
            errors.append("non-list coder-output group")
        else:
            for row in group:
                _kind, problems = classify_row(row)
                errors.extend(problems)
    return errors


def records_of(fact_id, coder_output):
    errors = _coder_output_errors(coder_output)
    if errors:
        raise ValueError("W-3 enumeration failed: " + "; ".join(errors))
    seen, out = set(), []
    for group in coder_output.values():
        for r in group:
            if fact_id in r["factIds"] and id(r) not in seen:
                seen.add(id(r))
                out.append(r)
    return out


def _fact_traces(ctx, fact_records):
    """Traces belonging to the fact's records, keyed (edgeId, treeTargetId)."""
    traces = ctx.get("traces") or {}
    out = {}
    for r in fact_records:
        for tt in (r.get("treeTargetIds") or []):
            key = (r.get("edgeId"), tt)
            if key in traces:
                out[key] = traces[key]
    return out


# --------------------------------------------------------------------------------------
# IV1-F02 — witness closure DERIVED from W-1..W-4 (caller booleans are never authority)
# --------------------------------------------------------------------------------------

def witness_closure(witness, fact_id, registry, registry_sha, fact_records, fact_traces, record):
    """W-1 exact domain/coverage, W-2 all identity members (type-exact), W-3 same-fact
    lawful materialization over every record of the fact in the supplied coder output,
    W-4 supply equivalence and co-entailment target binding (H-5 per-component supplying
    facts; no §I entailmentBasis requirement — CORR2-IV1-01). Caller closed/isClosed/
    complete booleans are diagnostic only."""
    reasons = []
    w = witness if isinstance(witness, dict) else {}
    entries = w.get("entries")
    entries = entries if isinstance(entries, list) else []
    reg_ids = set(registry["m"])
    got = [e.get("mechanismPropositionId") for e in entries if isinstance(e, dict)]
    w1 = (len(got) == len(entries) == len(reg_ids)
          and all(isinstance(m, str) for m in got) and len(set(got)) == len(reg_ids)
          and set(got) == reg_ids
          and all(isinstance(e.get("disposition"), str) and e["disposition"] in W_DISPOSITION_DOMAIN for e in entries))
    if not w1:
        reasons.append("W-1: exact registry coverage / disposition domain failed")
    entry_by_m = {e.get("mechanismPropositionId"): e for e in entries
                  if isinstance(e, dict) and isinstance(e.get("mechanismPropositionId"), str)}
    selected = {m for m, e in entry_by_m.items() if e.get("disposition") == "SELECTED"}
    id_errors = _identity_errors(w, record)
    if w.get("factId") != fact_id or fact_id not in (record.get("factIds") or []):
        id_errors.append("factId")
    if w.get("registryIdentity") != registry_sha or registry_sha != ACCEPTED_REGISTRY_SHA:
        id_errors.append("registryIdentity")
    for r in fact_records:
        id_errors.extend(_identity_errors(r, record))
        if "registryIdentity" in r and r["registryIdentity"] != registry_sha:
            id_errors.append("record registryIdentity")
    w2 = not id_errors
    if not w2:
        reasons.append("W-2: required identity missing or inconsistent: " + ", ".join(sorted(set(id_errors))))
    supp_by_m = {}
    w3 = True
    if record not in fact_records:
        w3 = False
        reasons.append("W-3: evaluated record is not one of the fact's materialized coder-output rows")
    for r in fact_records:
        if r.get("relation") != "SUPPORTS_LEAF":
            continue
        mids, tts = r.get("mechanismPropositionIds"), r.get("treeTargetIds")
        lawful = (_present(r.get("edgeId"))
                  and isinstance(r.get("factIds"), list) and all(isinstance(f, str) for f in r["factIds"])
                  and fact_id in r["factIds"]
                  and r.get("relevanceState") == "ANALYTICAL_MAPPED"
                  and isinstance(mids, list) and len(mids) == 1 and mids[0] in reg_ids
                  and isinstance(tts, list) and bool(tts) and all(isinstance(tt, str) for tt in tts)
                  and len(set(tts)) == len(tts)
                  and not r.get("placeholder")
                  and all(tt in consuming_tts(registry, mids[0]) for tt in tts))
        if not lawful:
            w3 = False
            reasons.append("W-3: foreign-fact, placeholder or unlawful M/TT materialized record " + str(r.get("edgeId")))
            continue
        supp_by_m.setdefault(mids[0], []).append(r)
    for m in sorted(reg_ids):
        recs = supp_by_m.get(m, [])
        covered = {tt for r in recs for tt in r["treeTargetIds"]}
        need = set(consuming_tts(registry, m))
        if m in selected:
            if not recs or not need or covered != need:
                w3 = False
                reasons.append("W-3: SELECTED %s exact consuming-TT coverage failed" % m)
        elif recs:
            w3 = False
            reasons.append("W-3: NOT_SELECTABLE %s has a SUPPORTS_LEAF record" % m)
    # W-4 quantifies over ALL supply-bearing records of f, independently of
    # relation. W-3 and Alt retain their SUPPORTS_LEAF-only materialization.
    supply_records_by_m = {}
    for r in fact_records:
        for s in r.get("componentSupply") or []:
            m = s.get("mechanismPropositionId")
            if r not in supply_records_by_m.setdefault(m, []):
                supply_records_by_m[m].append(r)
    w4 = True
    for m, recs in supply_records_by_m.items():
        if any(fact_id in (s.get("factIds") or []) for r in recs for s in r["componentSupply"] if s.get("mechanismPropositionId") == m):
            if m not in selected:
                w4 = False
                reasons.append("W-4: supplying fact has components for NOT_SELECTABLE " + str(m))
    for m in sorted(selected):
        e = entry_by_m[m]
        required = set(registry["m"].get(m, {}).get("requiredComponents", []))
        entail, missing, bases = e.get("entailedComponents"), e.get("missingComponents"), e.get("bases")
        legal = (isinstance(entail, list) and bool(entail) and all(isinstance(c, str) for c in entail)
                 and len(set(entail)) == len(entail) and set(entail) <= required
                 and isinstance(missing, list) and all(isinstance(c, str) for c in missing)
                 and len(set(missing)) == len(missing) and set(missing) == required - set(entail)
                 and isinstance(bases, dict) and set(bases) == set(entail))
        if not legal:
            w4 = False
            reasons.append("W-4: invalid witness component/basis/missing partition for " + m)
            continue
        for r in supply_records_by_m.get(m, []):
            supplies = r.get("componentSupply")
            supplies = supplies if isinstance(supplies, list) else []
            bound = [s.get("componentId") for s in supplies
                     if isinstance(s, dict) and s.get("mechanismPropositionId") == m]
            per_fact = {s.get("componentId") for s in supplies
                        if isinstance(s, dict) and s.get("mechanismPropositionId") == m
                        and fact_id in (s.get("factIds") or [])}
            aggregate = {s.get("componentId") for rr in supply_records_by_m.get(m, [])
                         for s in (rr.get("componentSupply") or [])
                         if isinstance(s, dict) and s.get("mechanismPropositionId") == m
                         and fact_id in (s.get("factIds") or [])}
            rm = r.get("missingComponents")
            if (any(not isinstance(s, dict) for s in supplies)
                    or len(bound) != len(supplies)
                    or len(set(bound)) != len(bound)
                    or not per_fact <= set(entail) or aggregate != set(entail)
                    or not isinstance(rm, list) or any(not isinstance(c, str) for c in rm)
                    or len(set(rm)) != len(rm) or set(rm) != required - set(bound)):
                w4 = False
                reasons.append("W-4: bidirectional componentSupply/missingComponents mismatch on " + str(r.get("edgeId")))
                continue
            for s in supplies:
                if "treeTargetId" in s and s["treeTargetId"] not in (r.get("treeTargetIds") or []):
                    w4 = False
                    reasons.append("W-4: supply TT mismatch on " + str(r.get("edgeId")))
    for (eid, tt), tr in sorted(fact_traces.items()):
        comps = tr.get("components") if isinstance(tr, dict) else None
        for e in (comps or {}).values():
            if not isinstance(e, dict) or not isinstance(e.get("MD3"), dict):
                continue
            if fact_id not in ((e.get("basis") or {}).get("factIds") or []):
                continue
            for m2, token in e["MD3"].items():
                disp, c2 = _md_disposition(token, m2, registry)
                if disp == "CO_ENTAILS" and (m2 not in selected or c2 not in entry_by_m[m2].get("entailedComponents", [])):
                    w4 = False
                    reasons.append("W-4: CO_ENTAILS target/component not established by SELECTED witness")
    closed = bool(w1 and w2 and w3 and w4)
    caller_flag = w.get("closed", w.get("isClosed", w.get("complete")))
    return closed, {"W1": w1, "W2": w2, "W3": w3, "W4": w4, "reasons": reasons,
                    "callerClosedFlag": caller_flag,
                    "callerFlagMatchesDerived": None if caller_flag is None else bool(caller_flag) == closed,
                    "selectedCount": len(selected)}


# --------------------------------------------------------------------------------------
# CORR3 — alternative direction DERIVED per (record, treeTargetId) through the engine
# --------------------------------------------------------------------------------------

def _s6_declared_selection(record, ctx, registry):
    """Accepted §10 S6 / CORR1 T-1: Sel_other declarations, not W closure.
    Closure is tested only for DIRECTIONAL SUPPORTS_LEAF at the S7 handoff.
    Registry-domain filtering does not certify malformed witnesses.
    """
    selected = set()
    for fact in (record.get("factIds") or []):
        witness = (ctx.get("witness") or {}).get(fact)
        entries = witness.get("entries") if isinstance(witness, dict) else None
        for entry in entries if isinstance(entries, list) else []:
            if (isinstance(entry, dict) and entry.get("disposition") == "SELECTED"
                    and entry.get("mechanismPropositionId") in registry["m"]):
                selected.add(entry["mechanismPropositionId"])
    return selected

def _direction_status_at(record, tt, registry, ctx, registry_sha):
    """S0–S6 status for ONE (record, treeTargetId) of an ALTERNATIVE (successor §5
    SEP-U alternative-status unit; CORR2-IV1-02). Returns DIRECTIONAL | INDETERMINATE |
    HELD | NON_DIRECTIONAL."""
    if record.get("relevanceState") != "ANALYTICAL_MAPPED" or tt not in (record.get("treeTargetIds") or []):
        return "NON_DIRECTIONAL"
    m_ids = record.get("mechanismPropositionIds") or []
    m_id = m_ids[0] if m_ids else None
    m_row = registry["m"].get(m_id) if m_id else None
    if m_row is None:
        return "HELD"
    ok, _hold, _reasons = admit(record, m_row, registry["nacr"], registry_sha)
    if not ok:
        return "HELD"
    part = component_partition(record, m_row, registry["nacr"])
    if ev_gates(record, m_row, part, registry, tt):
        return "INDETERMINATE"
    if b1a_cap_fires(record) or b1b_cap_fires(record):
        return "NON_DIRECTIONAL"
    relation = record.get("relation")
    if relation == "NEGATES_LEAF":
        return "DIRECTIONAL" if record.get("absenceEvidenceState") == "COMPETENT_AFFIRMATIVE_ABSENCE" else "NON_DIRECTIONAL"
    if relation == "COUNTER_M":
        if not countered_leaves(record, registry["tt"].get(tt, {}), registry):
            return "NON_DIRECTIONAL"
        tr = (ctx.get("traces") or {}).get((record.get("edgeId"), tt))
        if not isinstance(tr, dict):
            return "HELD"
        selection = _s6_declared_selection(record, ctx, registry)
        exp = expected_universe(m_id, selection, registry)
        verdict, _cv, _errs = trace_closure(tr, _supplies_of(record, m_id), exp, record, tt,
                                            registry, registry_sha, ctx)
        if verdict == "DIRECTIONAL":
            return "DIRECTIONAL"
        if verdict == "NON_DIRECTIONAL":
            return "NON_DIRECTIONAL"
        return "HELD"
    tr = (ctx.get("traces") or {}).get((record.get("edgeId"), tt))
    if not isinstance(tr, dict):
        return "HELD"
    selection = _s6_declared_selection(record, ctx, registry)
    exp = expected_universe(m_id, selection, registry)
    verdict, _cv, _errs = trace_closure(tr, _supplies_of(record, m_id), exp, record, tt,
                                        registry, registry_sha, ctx)
    if verdict == "DIRECTIONAL":
        return "DIRECTIONAL"
    if verdict == "NON_DIRECTIONAL":
        return "NON_DIRECTIONAL"
    return "HELD"


def evaluate_for_direction(record, registry, ctx, registry_sha=None, tree_target_id=None):
    """S0–S6 of one record as the SUBJECT (SEP-AV-4 rule: any (edgeId, TT) without a
    complete lawful T(r) holds the record). Stops before S7 (no uniqueness recursion).
    Returns the partial outcome dict."""
    m_ids = record.get("mechanismPropositionIds") or []
    m_id = m_ids[0] if m_ids else None
    out = {"record": record.get("edgeId"), "M": m_id, "ev0Applicable": True,
           "admission": None, "holdCode": None, "holdReasons": [], "partition": None,
           "failingGates": [], "bearingEvaluability": None, "bearingIndeterminacyReasons": None,
           "supportBearing": None, "capFired": None, "b3RecordVerdict": None,
           "b3PerTT": [], "b3ComponentVerdicts": {}}
    if record.get("relevanceState") != "ANALYTICAL_MAPPED" or not (record.get("treeTargetIds") or []) or m_id is None:
        out["ev0Applicable"] = False
        return out
    m_row = registry["m"].get(m_id)
    if m_row is None:
        out["admission"] = "HELD"
        out["holdCode"] = "HOLD-T"
        out["holdReasons"] = ["M not in bound registry (B3-6)"]
        return out
    ok, hold, reasons = admit(record, m_row, registry["nacr"], registry_sha)
    out["admission"] = "ADMITTED" if ok else "HELD"
    out["holdCode"] = hold
    out["holdReasons"] = reasons
    part = component_partition(record, m_row, registry["nacr"])
    out["partition"] = part
    if not ok:
        return out
    failing = ev_gates(record, m_row, part, registry, tree_target_id)
    out["failingGates"] = failing
    if failing:
        out["bearingEvaluability"] = "INDETERMINATE"
        out["bearingIndeterminacyReasons"] = failing
        return out
    out["bearingEvaluability"] = "EVALUABLE"
    if b1a_cap_fires(record):
        out["supportBearing"] = "NON_DISCRIMINATING"
        out["capFired"] = "B-1a (SEP-DE4)"
        return out
    if b1b_cap_fires(record):
        out["supportBearing"] = "NON_DISCRIMINATING"
        out["capFired"] = "B-1b"
        return out
    relation = record.get("relation")
    supplies = _supplies_of(record, m_id)
    if relation in ("NEGATES_LEAF", "COUNTER_M"):
        lawful = False
        if relation == "NEGATES_LEAF" and record.get("absenceEvidenceState") == "COMPETENT_AFFIRMATIVE_ABSENCE":
            lawful = True
        if relation == "COUNTER_M":
            if not countered_leaves(record, registry["tt"].get(tree_target_id, {}), registry):
                out.update(supportBearing="NON_DISCRIMINATING", capFired="B-2(ii) no registry counter binding")
                return out
            selected = _s6_declared_selection(record, ctx, registry)
            exp = expected_universe(m_id, selected, registry)
            status, outcomes = _subject_trace_outcomes(record, supplies, exp, registry, registry_sha, ctx, tree_target_id)
            out["b3PerTT"] = outcomes
            out["b3ComponentVerdicts"] = _merge_component_verdicts(outcomes)
            out["b3RecordVerdict"] = {"HELD": "INCOMPLETE"}.get(status, status)
            if status == "HELD":
                errs = [e for o in outcomes for e in o.get("errors", [])]
                out["admission"] = "HELD"
                out["holdCode"] = "HOLD-T"
                out["holdReasons"] = ["SEP-AV-4: COUNTER_M needs SEP-B-3 and T(r) is absent or incomplete: %s"
                                      % "; ".join(errs[:3])]
                return out
            lawful = status == "DIRECTIONAL" and bool(countered_leaves(record, registry["tt"].get(tree_target_id, {}), registry))
        out["supportBearing"] = "DIRECT_CONTRADICTION" if lawful else "NON_DISCRIMINATING"
        out["capFired"] = "B-2"
        return out
    # Accepted §10 / CORR1 §12: S6 T(r) failure precedes S7 W failure.
    # A broken W is never a bearing basis. Its declared selections are used only
    # to diagnose T's comparator census before returning the required hold.
    witness_error = None
    try:
        selected = _witness_selected(record, ctx, registry_sha, registry)
    except ValueError as error:
        witness_error = error
        selected = set()
        for f in (record.get("factIds") or []):
            w = (ctx.get("witness") or {}).get(f)
            entries = w.get("entries") if isinstance(w, dict) else None
            for e in entries if isinstance(entries, list) else []:
                if (isinstance(e, dict) and e.get("disposition") == "SELECTED"
                        and e.get("mechanismPropositionId") in registry["m"]):
                    selected.add(e["mechanismPropositionId"])
    exp = expected_universe(m_id, selected, registry)
    status, outcomes = _subject_trace_outcomes(record, supplies, exp, registry, registry_sha, ctx, tree_target_id)
    if status == "HELD":
        out["b3PerTT"] = outcomes
        out["b3ComponentVerdicts"] = _merge_component_verdicts(outcomes)
        out["b3RecordVerdict"] = "INCOMPLETE"
        errs = [e for o in outcomes for e in o.get("errors", [])]
        out["admission"] = "HELD"
        out["holdCode"] = "HOLD-T"
        out["holdReasons"] = ["SEP-AV-4: directionality trace incomplete (T-closure): %s" % "; ".join(errs[:3])]
        return out
    if status == "DIRECTIONAL" and witness_error is not None:
        # S7 handoff only: AV-5/SEP-U-X is inapplicable to S6 NON_DIRECTIONAL.
        out.update(admission="HELD", holdCode="HOLD-U", holdReasons=[str(witness_error)])
        return out
    out["b3PerTT"] = outcomes
    out["b3ComponentVerdicts"] = _merge_component_verdicts(outcomes)
    out["b3RecordVerdict"] = status

    if status == "NON_DIRECTIONAL":
        out["supportBearing"] = "NON_DISCRIMINATING"
        out["capFired"] = "B-3 NON_DIRECTIONAL"
    return out  # DIRECTIONAL: supportBearing stays None until S7 decides


def b1a_cap_fires(record):
    """SEP-B-1a (Owner Decision 3): the cap fires for DE-4 while the C34 §6 constitutive
    exception is NOT AVAILABLE. Availability comes from bound authority only
    (constitutive_exception_available); no caller value can lift the cap (CORR2-IV1-06)."""
    return record.get("evidenceForm") == "DE-4" and not constitutive_exception_available()


def b1b_cap_fires(record):
    return bool(record.get("prOnlyBasis"))


class WitnessConsistencyError(ValueError):
    """Known W-4 inconsistency; SEP-U-X HOLD-U, never a bearing."""


def _witness_selected(record, ctx, registry_sha, registry):
    """T-1 only consumes selections of CLOSED W(f), for every fact in r."""
    selected = set()
    facts = record.get("factIds")
    if not isinstance(facts, list) or not facts:
        raise ValueError("T-1: required fact basis absent")
    for fact in facts:
        fact_records = records_of(fact, ctx.get("coderOutput"))
        witness = (ctx.get("witness") or {}).get(fact)
        closed, details = witness_closure(witness, fact, registry, registry_sha,
                                          fact_records, _fact_traces(ctx, fact_records), record)
        if not closed:
            error_type = WitnessConsistencyError if not details["W4"] else ValueError
            raise error_type("T-1: W(%s) is not CLOSED: %s" % (fact, "; ".join(details["reasons"])))
        selected.update(e["mechanismPropositionId"] for e in witness["entries"] if e["disposition"] == "SELECTED")
    return selected


def record_fact_id(record):
    """Compatibility diagnostic: deterministic fact locator; never an evaluation basis."""
    facts = record.get("factIds") or []
    return min(facts) if facts else None


def alternative_direction_status(m2, fact_id, registry, ctx, registry_sha):
    """Derive the alternative's status from ITS OWN records through the engine, over
    EVERY tree target of EVERY SUPPORTS_LEAF record of the fact in the supplied coder
    output (CORR2-IV1-02 + CORR2-IV1-03). No caller flag is read. Aggregation follows
    the successor §5 priority: DIRECTIONAL > INDETERMINATE > HELD > NON_DIRECTIONAL."""
    recs = [r for r in records_of(fact_id, (ctx or {}).get("coderOutput"))
            if isinstance(r, dict) and r.get("relation") == "SUPPORTS_LEAF"
            and m2 in (r.get("mechanismPropositionIds") or [])]
    if not recs:
        return "HELD"  # SELECTED alternative with zero materialized records: fail closed
    statuses = []
    for r in recs:
        for tt in (r.get("treeTargetIds") or []):
            statuses.append(_direction_status_at(r, tt, registry, ctx, registry_sha))
    for s in ("DIRECTIONAL", "INDETERMINATE", "HELD"):
        if s in statuses:
            return s
    return "NON_DIRECTIONAL"


# --------------------------------------------------------------------------------------
# S7 uniqueness — over EVERY fact of the record and EVERY record of each fact
# --------------------------------------------------------------------------------------

def uniqueness(m_id, record, registry, ctx, out, registry_sha):
    """SEP-U over every fact f of the record (CORR2-IV1-03: not factIds[0]) and every
    record of f in the supplied coder output regardless of caller grouping."""
    env = registry["envOfM"].get(m_id)
    facts = record.get("factIds") or []
    all_status = {}
    closures = {}
    for fact in facts:
        witness = (ctx.get("witness") or {}).get(fact)
        if not isinstance(witness, dict) or not witness.get("entries"):
            out["admission"] = "HELD"
            out["holdCode"] = "HOLD-U"
            out["uniquenessBasis"] = "INCOMPLETE_ENUMERATION"
            out["holdReasons"] = ["SEP-U-X / SEP-AV-5: no selectionCensusWitness W(%s) exists for the fact" % fact]
            return out
        fact_records = records_of(fact, (ctx or {}).get("coderOutput"))
        closed, wdetails = witness_closure(witness, fact, registry, registry_sha,
                                           fact_records, _fact_traces(ctx, fact_records), record)
        closures[fact] = wdetails
        if not closed:
            out["witnessClosures"] = closures
            out["witnessClosure"] = wdetails
            out["admission"] = "HELD"
            out["holdCode"] = "HOLD-U"
            out["uniquenessBasis"] = "INCOMPLETE_ENUMERATION"
            out["holdReasons"] = ["SEP-U-X / SEP-AV-5: W(%s) closure not established: %s"
                                  % (fact, "; ".join(wdetails["reasons"][:3]))]
            return out
        selected = {e.get("mechanismPropositionId") for e in witness["entries"]
                    if isinstance(e, dict) and e.get("disposition") == "SELECTED"}
        alt_ids = sorted(m2 for m2 in selected
                         if m2 != m_id and registry["envOfM"].get(m2) not in (None, env))
        for m2 in alt_ids:
            all_status[(fact, m2)] = alternative_direction_status(m2, fact, registry, ctx, registry_sha)
    out["witnessClosures"] = closures
    out["witnessClosure"] = closures.get(record_fact_id(record))
    out["alternatives"] = [{"fact": f, "M": m2, "status": st,
                            "basis": "engine per-(record, treeTargetId) S0–S6 evaluation of the alternative's own records"}
                           for (f, m2), st in sorted(all_status.items())]
    if any(st == "HELD" for st in all_status.values()):
        out["admission"] = "HELD"
        out["holdCode"] = "HOLD-U"
        out["uniquenessBasis"] = "INCOMPLETE_ENUMERATION"
        out["holdReasons"] = ["SEP-U-X: an alternative is HELD"]
        return out
    if any(st == "DIRECTIONAL" for st in all_status.values()):
        out["supportBearing"] = "SHARED_NON_UNIQUE"
        out["uniquenessBasis"] = "U-2 PROVEN_DIRECTIONAL_ALTERNATIVE"
        return out
    unresolved = sorted({m2 for (_f, m2), st in all_status.items() if st == "INDETERMINATE"})
    if unresolved:
        out["supportBearing"] = None
        out["pipelineState"] = "UNIQUENESS_UNRESOLVED"
        out["uniquenessBasis"] = "U-3 UNIQUENESS_UNRESOLVED"
        out["unresolvedAlternatives"] = unresolved
        return out
    if not all_status:
        out["supportBearing"] = "DIRECT_SUPPORT"
        out["uniquenessBasis"] = "U-0 ZERO_ALTERNATIVES"
        return out
    out["supportBearing"] = "DIRECT_SUPPORT"
    out["uniquenessBasis"] = "U-1 SOLE_DIRECTIONAL_TARGET"
    return out


# --------------------------------------------------------------------------------------
# Full S0–S8 evaluation of one record
# --------------------------------------------------------------------------------------

def _evaluate_at(record, registry, ctx, registry_sha=None, tree_target_id=None):
    m_ids = record.get("mechanismPropositionIds") or []
    m_id = m_ids[0] if m_ids else None
    out = {
        "record": record.get("edgeId"),
        "M": m_id,
        "ev0Applicable": True,
        "admission": None, "holdCode": None, "holdReasons": [],
        "partition": None, "failingGates": [],
        "bearingEvaluability": None, "bearingIndeterminacyReasons": None,
        "supportBearing": None, "pipelineState": None, "uniquenessBasis": None,
        "alternatives": [], "unresolvedAlternatives": [],
        "capFired": None, "b3RecordVerdict": None,
        "b3PerTT": [], "b3ComponentVerdicts": {},
    }
    if record.get("relevanceState") not in SEMANTIC_DOMAINS["relevanceState"]:
        out.update(admission="HELD", holdCode="HOLD-NA", holdReasons=["exact relevanceState required"])
        return out
    if record.get("relevanceState") != "ANALYTICAL_MAPPED":
        _kind, errors = classify_row(record)
        if errors:
            out.update(admission="HELD", holdCode="HOLD-NA", holdReasons=errors)
            return out
        out["ev0Applicable"] = False
        return out
    tts = record.get("treeTargetIds") or []
    if not tts or m_id is None:
        out["ev0Applicable"] = False
        return out
    enumeration_errors = _coder_output_errors(ctx.get("coderOutput"))
    if enumeration_errors:
        out.update(admission="HELD", holdCode="HOLD-U", holdReasons=enumeration_errors)
        return out
    m_row = registry["m"].get(m_id)
    if m_row is None:
        out["admission"] = "HELD"
        out["holdCode"] = "HOLD-T"
        out["holdReasons"] = ["M not in bound registry (B3-6)"]
        return out
    ok, hold, reasons = admit(record, m_row, registry["nacr"], registry_sha)
    out["admission"] = "ADMITTED" if ok else "HELD"
    out["holdCode"] = hold
    out["holdReasons"] = reasons
    part = component_partition(record, m_row, registry["nacr"])
    out["partition"] = part
    if not ok:
        return out
    failing = ev_gates(record, m_row, part, registry, tree_target_id)
    out["failingGates"] = failing
    if failing:
        out["bearingEvaluability"] = "INDETERMINATE"
        out["bearingIndeterminacyReasons"] = failing
        return out
    out["bearingEvaluability"] = "EVALUABLE"
    if b1a_cap_fires(record):
        out["supportBearing"] = "NON_DISCRIMINATING"
        out["capFired"] = "B-1a (SEP-DE4)"
        return out
    if b1b_cap_fires(record):
        out["supportBearing"] = "NON_DISCRIMINATING"
        out["capFired"] = "B-1b"
        return out
    relation = record.get("relation")
    partial = evaluate_for_direction(record, registry, ctx, registry_sha, tree_target_id)
    out["b3PerTT"] = partial.get("b3PerTT") or []
    out["b3ComponentVerdicts"] = partial.get("b3ComponentVerdicts") or {}
    out["b3RecordVerdict"] = partial.get("b3RecordVerdict")
    if partial.get("admission") == "HELD":
        out["admission"] = "HELD"
        out["holdCode"] = partial.get("holdCode")
        out["holdReasons"] = partial.get("holdReasons")
        return out
    if partial.get("supportBearing") is not None:
        out["supportBearing"] = partial.get("supportBearing")
        out["capFired"] = partial.get("capFired")
        return out
    out = uniqueness(m_id, record, registry, ctx, out, registry_sha)
    directionality_traces = {}
    for o in out.get("b3PerTT") or []:
        tr = (ctx.get("traces") or {}).get((record.get("edgeId"), o.get("treeTargetId")))
        if isinstance(tr, dict):
            directionality_traces[o.get("treeTargetId")] = copy.deepcopy(tr)
    if len(directionality_traces) == 1:
        the_trace = next(iter(directionality_traces.values()))
        the_trace["uniqueness"] = {
            "basis": {"U-0 ZERO_ALTERNATIVES": "U-0", "U-1 SOLE_DIRECTIONAL_TARGET": "U-1",
                      "U-2 PROVEN_DIRECTIONAL_ALTERNATIVE": "U-2",
                      "U-3 UNIQUENESS_UNRESOLVED": "U-3",
                      "INCOMPLETE_ENUMERATION": "U-X"}.get(out["uniquenessBasis"]),
            "alternatives": copy.deepcopy(out["alternatives"])}
        out["directionalityTrace"] = the_trace
    else:
        for tt, tr in directionality_traces.items():
            tr["uniqueness"] = {
                "basis": {"U-0 ZERO_ALTERNATIVES": "U-0", "U-1 SOLE_DIRECTIONAL_TARGET": "U-1",
                          "U-2 PROVEN_DIRECTIONAL_ALTERNATIVE": "U-2",
                          "U-3 UNIQUENESS_UNRESOLVED": "U-3",
                          "INCOMPLETE_ENUMERATION": "U-X"}.get(out["uniquenessBasis"]),
                "alternatives": copy.deepcopy(out["alternatives"])}
        out["directionalityTraces"] = directionality_traces
    return out


# --------------------------------------------------------------------------------------
# Migration classification (SEP-MIG-1..8; unchanged semantics)
# --------------------------------------------------------------------------------------

def evaluate_per_tt(record, registry, ctx, registry_sha=None):
    """Canonical relation (edge, consuming TT) → outcome. No record bearing fold."""
    tts = record.get("treeTargetIds")
    if not isinstance(tts, list) or any(not isinstance(t, str) for t in tts):
        raise ValueError("treeTargetIds must be an enumerable list of exact TT IDs")
    return {tt: _evaluate_at(record, registry, ctx, registry_sha, tt) for tt in sorted(set(tts))}


def evaluate(record, registry, ctx, registry_sha=None):
    outcomes = evaluate_per_tt(record, registry, ctx, registry_sha)
    if len(outcomes) == 1:
        return next(iter(outcomes.values()))
    if not outcomes:
        return _evaluate_at(record, registry, ctx, registry_sha)
    # This is a relation container, not a new record-level aggregation rule.
    return {"record": record.get("edgeId"), "pipelineState": "PER_TT_OUTCOMES",
            "bearingEvaluability": None, "bearingIndeterminacyReasons": None,
            "supportBearing": None, "perTTOutcomes": outcomes}


def migration_classify(record, outcome, registry):
    legacy = record.get("supportClass")
    entry = {
        "edgeId": record.get("edgeId"),
        "legacySupportClass": legacy,
        "migrationRuleId": None,
        "projectionClass": None,
        "successorTriple": [None, None, None],
        "holdCode": outcome.get("holdCode"),
        "notes": [],
    }
    if not outcome["ev0Applicable"]:
        entry["migrationRuleId"] = "SEP-MIG-1"
        entry["projectionClass"] = "MECHANICAL_PRESERVATION"
        return entry
    if outcome.get("admission") == "HELD" and outcome.get("holdCode") in ("HOLD-ND", "HOLD-AMB", "HOLD-NA"):
        entry["migrationRuleId"] = "SEP-MIG-2"
        entry["projectionClass"] = "RECOMPUTE"
        entry["notes"].append("admission defect; hold code in ledger")
        return entry
    if outcome.get("bearingEvaluability") == "INDETERMINATE":
        rule = "SEP-MIG-3" if legacy == "NOT_DETERMINABLE" else "SEP-MIG-7"
        entry["migrationRuleId"] = rule
        entry["projectionClass"] = "MECHANICAL_VALUE_CHANGE" if rule == "SEP-MIG-3" else "MECHANICAL_PRESERVATION"
        entry["successorTriple"] = ["INDETERMINATE", outcome["bearingIndeterminacyReasons"], None]
        return entry
    capped = outcome.get("supportBearing") == "NON_DISCRIMINATING" and outcome.get("capFired") in (
        "B-1a (SEP-DE4)", "B-1b")
    if legacy in ("NOT_DETERMINABLE", "NON_DISCRIMINATING"):
        if capped:
            entry["migrationRuleId"] = "SEP-MIG-5A"
            entry["projectionClass"] = "MECHANICAL_PRESERVATION" if legacy == "NON_DISCRIMINATING" else "MECHANICAL_VALUE_CHANGE"
            entry["successorTriple"] = ["EVALUABLE", None, "NON_DISCRIMINATING"]
            return entry
        if outcome.get("capFired") in ("B-3 NON_DIRECTIONAL", "B-2"):
            entry["migrationRuleId"] = "SEP-MIG-5B"
            entry["projectionClass"] = "MECHANICAL_PRESERVATION"
            entry["successorTriple"] = ["EVALUABLE", None, "NON_DISCRIMINATING"]
            return entry
        entry["migrationRuleId"] = "SEP-MIG-5C" if legacy == "NON_DISCRIMINATING" else "SEP-MIG-4"
        entry["projectionClass"] = "RE_ADJUDICATION"
        entry["notes"].append("label agreement insufficient; field-local re-adjudication")
        return entry
    if legacy in ("DIRECT_SUPPORT", "SHARED_NON_UNIQUE", "DIRECT_CONTRADICTION"):
        if capped:
            entry["migrationRuleId"] = "SEP-MIG-6a"
            entry["projectionClass"] = "MECHANICAL_VALUE_CHANGE"
            entry["successorTriple"] = ["EVALUABLE", None, "NON_DISCRIMINATING"]
            return entry
        entry["migrationRuleId"] = "SEP-MIG-6c"
        entry["projectionClass"] = "RE_ADJUDICATION"
        entry["notes"].append("needs T(r) and W(f); neither exists on the frozen tree")
        if outcome.get("holdCode") in ("HOLD-T", "HOLD-U"):
            entry["notes"].append("S6/S7 hold %s retained in the ledger" % outcome["holdCode"])
        m_row = registry["m"].get(outcome.get("M") or "")
        if m_row:
            sup = supplied_component_ids(record)
            missing = set(record.get("missingComponents") or [])
            required = set(m_row["requiredComponents"])
            if (sup | missing) != required or (sup & missing):
                entry["notes"].append(
                    "establishment-side inconsistency retained: componentSupply/missingComponents "
                    "do not partition the required components; outside EV (§6.2); re-adjudication input")
        return entry
    entry["migrationRuleId"] = "SEP-MIG-5C"
    entry["projectionClass"] = "RE_ADJUDICATION"
    return entry


# --------------------------------------------------------------------------------------
# Successor view construction (IV1-F06: real per-TT split)
# --------------------------------------------------------------------------------------

def load_effective_view(path):
    records = []
    with open(path, "r", encoding="utf-8") as f:
        for line in f:
            line = line.strip()
            if line:
                records.append(json.loads(line))
    return records


def build_successor_view(view_records, registry, migration_contract, registry_sha):
    """Deterministic construction of the successor projection ledger.
    IV1-F06: a multi-TT legacy row is SPLIT into one migration copy per consuming TT
    (common provenance preserved, each copy bound to exactly one TT) and every copy is
    evaluated through SEP-MIG-1..7. No placeholder is ever emitted."""
    si = [r for r in view_records if r.get("recordType") == "SECTION_I_RECORD"]
    cells = [r for r in view_records if r.get("recordType") != "SECTION_I_RECORD"]
    ctx = {"traces": {}, "witness": {}, "coderOutput": {}}
    ledger = []
    for rec in si:
        tts = rec.get("treeTargetIds") or []
        if len(tts) > 1:
            for tt in tts:
                cp = copy.deepcopy(rec)
                cp["treeTargetIds"] = [tt]
                cp["edgeId"] = "%s@%s" % (rec.get("edgeId"), tt)
                cp["_sepMig8"] = {"splitVia": "SEP-MIG-8", "sourceEdgeId": rec.get("edgeId"),
                                  "boundTreeTargetId": tt}
                outcome = evaluate(cp, registry, ctx, registry_sha=registry_sha)
                entry = migration_classify(cp, outcome, registry)
                entry["splitVia"] = "SEP-MIG-8"
                entry["sourceEdgeId"] = rec.get("edgeId")
                entry["boundTreeTargetId"] = tt
                entry["successorOutcome"] = {
                    k: outcome.get(k) for k in (
                        "ev0Applicable", "admission", "holdCode", "partition", "failingGates",
                        "bearingEvaluability", "bearingIndeterminacyReasons", "supportBearing",
                        "pipelineState", "uniquenessBasis", "capFired")}
                entry["inputsRead"] = ["predecessor effective view a1fcae68…", "registry cb08b51e…"]
                entry["registryIdentity"] = registry_sha
                entry["contractIdentity"] = migration_contract.get("artifact")
                ledger.append(entry)
            continue
        outcome = evaluate(rec, registry, ctx, registry_sha=registry_sha)
        entry = migration_classify(rec, outcome, registry)
        entry["successorOutcome"] = {
            k: outcome.get(k) for k in (
                "ev0Applicable", "admission", "holdCode", "partition", "failingGates",
                "bearingEvaluability", "bearingIndeterminacyReasons", "supportBearing",
                "pipelineState", "uniquenessBasis", "capFired")}
        entry["inputsRead"] = ["predecessor effective view a1fcae68…", "registry cb08b51e…"]
        entry["registryIdentity"] = registry_sha
        entry["contractIdentity"] = migration_contract.get("artifact")
        ledger.append(entry)
    counts = {
        "sectionIRecords": len(si),
        "executionCells": len(cells),
        "mechanicalProjections": sum(1 for e in ledger if (e.get("projectionClass") or "").startswith("MECHANICAL")),
        "readjudication": sum(1 for e in ledger if e.get("projectionClass") == "RE_ADJUDICATION"),
        "valueChanges": sum(
            1 for e in ledger
            if e.get("projectionClass") == "MECHANICAL_VALUE_CHANGE"
            and e.get("legacySupportClass") != e["successorTriple"][2]),
        "sepMig8SplitCopies": sum(1 for e in ledger if e.get("splitVia") == "SEP-MIG-8"),
    }
    return {"ledger": ledger, "counts": counts}


# --------------------------------------------------------------------------------------
# main — explicit inputs; scratch-only output; deterministic
# --------------------------------------------------------------------------------------

def _is_inside(path, root):
    p = os.path.realpath(path)
    r = os.path.realpath(root)
    return p == r or p.startswith(r + os.sep)


def main(argv=None):
    ap = argparse.ArgumentParser(description="Deterministic successor-view construction machinery (scratch output only)")
    ap.add_argument("--methodology", required=True)
    ap.add_argument("--effective-view", required=True)
    ap.add_argument("--migration-contract", required=True)
    ap.add_argument("--schema", required=True)
    ap.add_argument("--output-dir", default=None)
    ap.add_argument("--repository-root", required=True)
    args = ap.parse_args(argv)

    here = os.path.dirname(os.path.realpath(__file__))
    repo_root = str(Path(args.repository_root).resolve())

    out_dir = args.output_dir
    if out_dir is None:
        out_dir = tempfile.mkdtemp(prefix="mv_sep_corr6_build.", dir="/private/tmp")
    out_dir = os.path.realpath(out_dir)
    if not Path(out_dir).is_relative_to(Path("/private/tmp")) or _is_inside(out_dir, repo_root):
        sys.stderr.write(
            "REFUSED: output dir %s is inside the repository root %s. This act must not "
            "persist a final effective-view dataset (or any successor view artifact) in "
            "the repository; use an external /private/tmp scratch directory.\n" % (out_dir, repo_root))
        return 2

    with open(args.methodology, "rb") as f:
        meth_bytes = f.read()
    reg_sha = hashlib.sha256(meth_bytes).hexdigest()
    registry = parse_registry(meth_bytes.decode("utf-8"))
    view_records = load_effective_view(args.effective_view)
    with open(args.migration_contract, "r", encoding="utf-8") as f:
        contract = json.load(f)
    with open(args.schema, "r", encoding="utf-8") as f:
        schema = json.load(f)

    result = build_successor_view(view_records, registry, contract, reg_sha)
    result["registryIdentity"] = reg_sha
    result["registryCounts"] = {"mechanisms": len(registry["m"]), "treeTargets": len(registry["tt"])}
    result["schemaIdentity"] = schema.get("artifact")
    result["status"] = (
        "TEMPORARY SCRATCH PROJECTION — NOT THE FINAL ACCEPTED EFFECTIVE VIEW. "
        "Final effective-view assembly is a separate, later Owner-authorized act."
    )
    banned = assert_environment_safe(result)
    if banned:
        sys.stderr.write("ENVIRONMENT SAFETY VIOLATION: %s\n" % banned)
        return 3
    result["environmentSafetyCheck"] = "PASS (normalized recursive scan: no forbidden output key present)"

    os.makedirs(out_dir, exist_ok=True)
    out_path = os.path.join(out_dir, "successor_view_projection_ledger.json")
    with open(out_path, "w", encoding="utf-8") as f:
        json.dump(result, f, indent=1, sort_keys=True, ensure_ascii=False)
        f.write("\n")

    post = {
        "methodology": hashlib.sha256(open(args.methodology, "rb").read()).hexdigest(),
        "effectiveView": hashlib.sha256(open(args.effective_view, "rb").read()).hexdigest(),
    }
    preserved = post["methodology"] == reg_sha and post["effectiveView"] == \
        "a1fcae68939decd0a3c4a39c0a0bc48e8d285bd9cd7ce1928b0d025056244047"
    print(json.dumps({
        "output": out_path,
        "counts": result["counts"],
        "registryIdentity": reg_sha,
        "inputBytesPreserved": preserved,
    }, indent=1, sort_keys=True))
    return 0


if __name__ == "__main__":
    sys.exit(main())
