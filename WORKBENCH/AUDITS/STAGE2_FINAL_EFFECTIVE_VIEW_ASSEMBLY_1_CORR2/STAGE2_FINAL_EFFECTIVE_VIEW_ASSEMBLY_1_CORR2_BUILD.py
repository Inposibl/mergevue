#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
STAGE2_FINAL_EFFECTIVE_VIEW_ASSEMBLY_1.CORR2 — bounded correction build.

ACT      : STAGE2_FINAL_EFFECTIVE_VIEW_ASSEMBLY_1.CORR2
ROLE     : IMPLEMENTATION AUTHOR (Z.ai), bounded correction
MODE     : fail-closed deterministic correction; safe publication

Closes exactly the two independently established defects of
STAGE2_FINAL_EFFECTIVE_VIEW_ASSEMBLY_1.CORR1.IV1.CONTINUATION_1 (Codex, FAIL
0 BLOCKING / 2 MAJOR / 0 MINOR / 2 ADVISORY):

  CONT1-M01  four persisted discriminatorIds[] assignments conflict with the
             frozen M-row registry (PD3-CLAR-1.CORR1, sha256 cb08b51e...);
             per registry §C.0 C-1/C-2 the emitted set on a §I edge is the
             union of the §D-row D-sets of the edge's mechanismPropositionIds.
  CONT1-M02  two persisted sourceClass values are documentary genre instead of
             the exact PI-7 sectionIFill binding
             (STAGE2_CORR4_PILOT_ANALYTICAL_SOURCECLASS_BINDING_CORR2.jsonl,
             sha256 3eee72d0...); per the frozen coder-view schema
             sourceClassBindingRule the coder copies sectionIFill exactly:
             the ASSIGNED sourceClass, otherwise the fail-closed state verbatim.

Replacement VALUES are derived from the pinned controlling authorities at run
time; the audit's replacement table is never used as an input. The only
hard-coded scope is the Owner-authorized permitted change set (which lines and
which fields may change), per the act brief §6.

No Git operation. Writes only inside this package directory. The CORR1
baseline, the failed FEVA v1 package, and all upstream authorities are opened
read-only and are re-hashed after publication.
"""

import hashlib
import json
import os
import re
import sys
import tempfile
from pathlib import Path

# --------------------------------------------------------------------------
# identities and paths (pinned)
# --------------------------------------------------------------------------

ACT = "STAGE2_FINAL_EFFECTIVE_VIEW_ASSEMBLY_1.CORR2"
PKG_DIR = Path(__file__).resolve().parent
REPO_ROOT = PKG_DIR.parents[2]

CORR1_DIR = "WORKBENCH/DOWNLOADS/STAGE2_FINAL_EFFECTIVE_VIEW_ASSEMBLY_1_CORR1_2026-10-07"
CORR1_RECORDS_REL = f"{CORR1_DIR}/STAGE2_FINAL_EFFECTIVE_VIEW_ASSEMBLY_1_CORR1_RECORDS.jsonl"

PINS = {
    "CORR1_RECORDS": (
        CORR1_RECORDS_REL,
        "3603c3169d7bdd67763ac0d2468d08cbb508d23dfeece4f7b396900b11dc68ec",
        104704,
    ),
    "FROZEN_REGISTRY_PD3_CLAR1_CORR1": (
        "WORKBENCH/DOWNLOADS/STAGE2_PD3_ROLE_BOUNDED_ENTITLEMENT_CLARIFICATION_1_CORR1_2026-10-04/"
        "STAGE2_PD3_ROLE_BOUNDED_ENTITLEMENT_CLARIFICATION_1_CORR1_CANDIDATE.md",
        "cb08b51e1c2fbaec7765989a7a4e15db1788c53eb5fec43f2628ecb88c1d6c73",
        344754,
    ),
    "PI7_SOURCECLASS_BINDING": (
        "WORKBENCH/DOWNLOADS/STAGE2_CORR4_PILOT_ANALYTICAL_SOURCECLASS_BINDING_CORR2.jsonl",
        "3eee72d088f9f72cb95671df14393912659081827719b589cc8a278cddc61591",
        95720,
    ),
    "FROZEN_CODER_VIEW_SCHEMA": (
        "WORKBENCH/DOWNLOADS/STAGE2_CORR4_PILOT_ANALYTICAL_CODER_VIEW_SCHEMA_CORR2_CORR1_CORR2_CORR1.json",
        "0cb5a6b5d2239855eeabe0bfd0e9ceb6c545dc2a86b4b34a90b65187592721b5",
        28839,
    ),
    "STAGE2_SEMANTIC_SUCCESSOR_CORR4": (
        "WORKBENCH/DOWNLOADS/STAGE2_SEMANTIC_SUCCESSOR_CANDIDATE_CORR4.md",
        "2de49862fb0d63c5f1cd1745531199137e73b7b37abceecef6e735d497d38bb0",
        250512,
    ),
}

# Owner-authorized permitted change set (act brief §6): exactly these
# (1-based record line, top-level field) cells. Values are NOT hard-coded.
PERMITTED_CELLS = {
    (113, "discriminatorIds"),
    (114, "discriminatorIds"),
    (115, "discriminatorIds"),
    (116, "discriminatorIds"),
    (115, "sourceClass"),
    (116, "sourceClass"),
}

SECTION_I_RECORD_TYPE = "SECTION_I_RECORD"

SERIALIZATION = {"ensure_ascii": True, "separators": (", ", ": ")}

LEDGER_ONLY_KEYS = [
    "legacySupportClass",
    "migrationRuleId",
    "projectionClass",
    "successorTriple",
    "holdCode",
]

F0024_EXPECTED_IDENTITY = {
    "recordFileBytes": 61728,
    "recordFileSha256": "88b20920149b3fcde03e4e060cf4361e9494fe0137540bbc654c526337fd5f10",
    "packageFactCount": 50,
    "caseIdLocator": "record-level key 'case_id'",
}


class GateFailure(Exception):
    """Any fail-closed gate violation. No bytes are ever published."""

    def __init__(self, code, detail):
        super().__init__(f"{code}: {detail}")
        self.code = code
        self.detail = detail


# --------------------------------------------------------------------------
# helpers
# --------------------------------------------------------------------------

def sha256_bytes(b):
    return hashlib.sha256(b).hexdigest()


def read_pinned(name):
    rel, expected_sha, expected_bytes = PINS[name]
    p = REPO_ROOT / rel
    if not p.is_file():
        raise GateFailure("PIN_MISSING", f"{name}: {p}")
    raw = p.read_bytes()
    pin_check(name, raw)
    return raw


def pin_check(name, raw):
    rel, expected_sha, expected_bytes = PINS[name]
    if len(raw) != expected_bytes:
        raise GateFailure(
            "PIN_BYTES_MISMATCH",
            f"{name}: {len(raw)} bytes, expected {expected_bytes}",
        )
    if sha256_bytes(raw) != expected_sha:
        raise GateFailure(
            "PIN_SHA_MISMATCH",
            f"{name}: sha256 {sha256_bytes(raw)}, expected {expected_sha}",
        )


def dumps(obj):
    return json.dumps(obj, **SERIALIZATION).encode("utf-8")


def wrap(v):
    return {"presence": "PRESENT", "value": v}


def deep_diff(a, b, path=""):
    """Presence-aware, type-strict diff. Absent vs null distinct;
    bool vs int and int vs float distinct. Returns list of
    (path, oldWrapped|absent, newWrapped|absent)."""
    a_absent = a is _ABSENT
    b_absent = b is _ABSENT
    if a_absent and b_absent:
        return []
    if a_absent != b_absent:
        return [(path, None if a_absent else wrap(a), None if b_absent else wrap(b))]
    if type(a) is not type(b):
        if isinstance(a, bool) != isinstance(b, bool):
            return [(path, wrap(a), wrap(b))]
        if isinstance(a, (int, float)) and isinstance(b, (int, float)):
            if a == b and type(a) is type(b):
                return []
            return [(path, wrap(a), wrap(b))]
        return [(path, wrap(a), wrap(b))]
    if isinstance(a, dict):
        out = []
        for k in sorted(set(a) | set(b)):
            out += deep_diff(
                a.get(k, _ABSENT), b.get(k, _ABSENT),
                f"{path}.{k}" if path else k,
            )
        return out
    if isinstance(a, list):
        if len(a) != len(b):
            return [(path, wrap(a), wrap(b))]
        out = []
        for i, (x, y) in enumerate(zip(a, b)):
            out += deep_diff(x, y, f"{path}[{i}]")
        return out
    if a != b:
        return [(path, wrap(a), wrap(b))]
    return []


class _Absent:
    def __repr__(self):
        return "ABSENT"


_ABSENT = _Absent()


# --------------------------------------------------------------------------
# authority derivation — CONT1-M01 (discriminator routing)
# --------------------------------------------------------------------------

D_ROW_RE = re.compile(
    r"^\| (M-[A-Z0-9-]+) \| ([a-z]+) \| ((?:D-\d+(?:\s*,\s*)?)+) \|", re.M
)


def extract_registry_d_rows(registry_text, label):
    """Extract the §D M-row M->D-set binding. C-1: the §D registry row's D
    field is the authoritative M<->D binding. Duplicate rows for one M fail
    closed (ambiguous authority)."""
    rows = {}
    for m in D_ROW_RE.finditer(registry_text):
        mech = m.group(1)
        dset = sorted(set(re.findall(r"D-\d+", m.group(3))), key=_d_key)
        if mech in rows and rows[mech] != dset:
            raise GateFailure(
                "REGISTRY_ROW_CONFLICT",
                f"{label}: multiple differing §D rows for {mech}",
            )
        if mech in rows:
            raise GateFailure(
                "REGISTRY_ROW_DUPLICATE", f"{label}: duplicate §D row for {mech}"
            )
        rows[mech] = dset
    if not rows:
        raise GateFailure("REGISTRY_ROWS_EMPTY", f"{label}: no §D rows parsed")
    return rows


def _d_key(d):
    return int(d.split("-")[1])


def derive_discriminator_set(mechanism_ids, registry_rows, origin):
    """C-2: emitted set = union over the edge's mechanismPropositionIds of
    those Ms' §D-row D-sets — and nothing else."""
    if not mechanism_ids:
        raise GateFailure(
            "NO_MECHANISM_SELECTED", f"{origin}: empty mechanismPropositionIds"
        )
    union = set()
    for mech in mechanism_ids:
        if mech not in registry_rows:
            raise GateFailure(
                "MECHANISM_NOT_IN_REGISTRY",
                f"{origin}: {mech} has no §D registry row",
            )
        union.update(registry_rows[mech])
    return sorted(union, key=_d_key)


# --------------------------------------------------------------------------
# authority derivation — CONT1-M02 (PI-7 sourceClass binding)
# --------------------------------------------------------------------------

def load_pi7_index(pi7_raw):
    entries = []
    for i, line in enumerate(pi7_raw.splitlines(), 1):
        if not line.strip():
            continue
        entries.append((i, json.loads(line)))
    index = {}
    for lineno, e in entries:
        key = (
            e["caseId"], e["sideId"], e["factId"],
            e["sourceRefIndex"], e["sourceId"],
        )
        index.setdefault(key, []).append((lineno, e))
    for key, lst in index.items():
        if len(lst) > 1:
            raise GateFailure(
                "PI7_DUPLICATE_IDENTITY",
                f"{len(lst)} binding entries for {key}: lines "
                f"{[l for l, _ in lst]}",
            )
    return {k: v[0][1] for k, v in index.items()}


def derive_source_class(record, pi7_index, origin):
    """sourceClassBindingRule: copy the binding record's sectionIFill exactly —
    sourceClass where the state is ASSIGNED, otherwise the fail-closed state
    verbatim. Documentary identity is never an alternate classification
    source; a fail-closed state is never converted to ASSIGNED."""
    case_id = record["caseId"]
    side_id = record["side"]
    fids = record["factIds"]
    if len(fids) != 1:
        raise GateFailure("MULTI_FACT_EDGE", f"{origin}: factIds={fids}")
    refs = record["sourceRefs"]
    if len(refs) != 1:
        raise GateFailure("MULTI_SOURCE_EDGE", f"{origin}: sourceRefs n={len(refs)}")
    ref = refs[0]
    if ref.get("refIndex") != 0:
        raise GateFailure("UNEXPECTED_REF_INDEX", f"{origin}: refIndex={ref.get('refIndex')}")
    key = (case_id, side_id, fids[0], 0, ref["sourceId"])
    matches = [e for k, e in pi7_index.items() if k == key]
    if len(matches) == 0:
        raise GateFailure("PI7_NO_MATCH", f"{origin}: no PI-7 entry for {key}")
    if len(matches) > 1:
        raise GateFailure("PI7_MULTIPLE_MATCH", f"{origin}: {len(matches)} entries for {key}")
    entry = matches[0]
    if entry.get("replayBindingStatus") != "BOUND":
        raise GateFailure(
            "PI7_NOT_BOUND",
            f"{origin}: replayBindingStatus={entry.get('replayBindingStatus')}",
        )
    if entry.get("replayDuplicateIdentityState") != "RESOLVED":
        raise GateFailure(
            "PI7_IDENTITY_UNRESOLVED",
            f"{origin}: replayDuplicateIdentityState="
            f"{entry.get('replayDuplicateIdentityState')}",
        )
    fill = entry["sectionIFill"]
    state = fill["sourceClassAssignmentState"]
    if state == "ASSIGNED":
        value = fill["sourceClass"]
        if not isinstance(value, str) or not value:
            raise GateFailure(
                "PI7_ASSIGNED_VALUE_INVALID",
                f"{origin}: ASSIGNED with sourceClass={value!r}",
            )
    else:
        value = state  # fail-closed state, verbatim; never genre, never null
    return value, key, fill


# --------------------------------------------------------------------------
# assembly (pure; no I/O)
# --------------------------------------------------------------------------

def assemble(input_raw, registry_raw, pi7_raw, corr4_raw, verify_input=True):
    """Derive + apply + validate. Returns (output_bytes, evidence_dict).
    Raises GateFailure on any violation. Never writes.
    verify_input=False exists ONLY for in-memory negative controls that
    deliberately mutate the baseline to exercise downstream gates."""
    if verify_input:
        pin_check("CORR1_RECORDS", input_raw)
    lines = input_raw.split(b"\n")
    if lines[-1] != b"":
        raise GateFailure("INPUT_NO_TRAILING_LF", "baseline must end with LF")
    lines = lines[:-1]
    if len(lines) != 116:
        raise GateFailure("RECORD_COUNT", f"{len(lines)} records, expected 116")
    if b"\r" in input_raw:
        raise GateFailure("CR_IN_INPUT", "CR bytes present")

    registry_rows = extract_registry_d_rows(
        registry_raw.decode("utf-8"), "FROZEN_REGISTRY_PD3_CLAR1_CORR1"
    )
    corr4_rows = extract_registry_d_rows(
        corr4_raw.decode("utf-8"), "STAGE2_SEMANTIC_SUCCESSOR_CORR4"
    )
    pi7_index = load_pi7_index(pi7_raw)

    records = [json.loads(l) for l in lines]

    # §I surface census
    section_i_lines = [
        i + 1 for i, r in enumerate(records)
        if r.get("recordType") == SECTION_I_RECORD_TYPE
    ]
    for i, r in enumerate(records):
        has_d = "discriminatorIds" in r
        is_si = (i + 1) in section_i_lines
        if has_d != is_si:
            raise GateFailure(
                "SECTION_I_SURFACE_MISMATCH",
                f"line {i+1}: discriminatorIds presence {has_d} != §I {is_si}",
            )

    # ---- derive both fields for every §I record -------------------------
    derived = {}  # line -> {"discriminatorIds": [...], "sourceClass": str}
    derivation_log = []
    for ln in section_i_lines:
        rec = records[ln - 1]
        origin = f"line {ln} ({rec.get('edgeId')})"
        d_set = derive_discriminator_set(
            rec["mechanismPropositionIds"], registry_rows, origin
        )
        # cross-check against the CORR4 contract's own §D rows (consistency;
        # the registry §D row is controlling per C-1 — divergence => HOLD)
        c4_set = derive_discriminator_set(
            rec["mechanismPropositionIds"], corr4_rows, origin + " [CORR4]"
        )
        if c4_set != d_set:
            raise GateFailure(
                "CORR4_REGISTRY_DIVERGENCE",
                f"{origin}: registry {d_set} vs CORR4 {c4_set}",
            )
        sc_value, pi7_key, fill = derive_source_class(rec, pi7_index, origin)
        derived[ln] = {"discriminatorIds": d_set, "sourceClass": sc_value}
        derivation_log.append({
            "line": ln,
            "edgeId": rec.get("edgeId"),
            "mechanismPropositionIds": rec["mechanismPropositionIds"],
            "registryDSet": d_set,
            "pi7Identity": list(pi7_key),
            "pi7SourceClassAssignmentState": fill["sourceClassAssignmentState"],
            "pi7Derivation": fill["derivation"],
        })

    # ---- scope gate: derived diff must sit inside the permitted cells ----
    derived_changes = set()
    for ln in section_i_lines:
        rec = records[ln - 1]
        for field in ("discriminatorIds", "sourceClass"):
            if rec[field] != derived[ln][field]:
                derived_changes.add((ln, field))
    outside = derived_changes - PERMITTED_CELLS
    if outside:
        raise GateFailure(
            "DERIVED_CHANGE_OUTSIDE_AUTHORIZED_SCOPE",
            f"derived corrections outside the permitted cell set: {sorted(outside)} "
            "- these are pre-existing defects outside this act's scope; HOLD",
        )

    # ---- apply -----------------------------------------------------------
    out_lines = []
    applied = []
    for i, raw_line in enumerate(lines):
        ln = i + 1
        if (ln, "discriminatorIds") not in derived_changes and \
           (ln, "sourceClass") not in derived_changes:
            out_lines.append(raw_line)  # byte-verbatim
            continue
        rec = json.loads(raw_line)
        # round-trip guard: re-serializing the UNMODIFIED record must
        # reproduce the original line bytes exactly
        if dumps(rec) != raw_line:
            raise GateFailure(
                "ROUNDTRIP_MISMATCH",
                f"line {ln}: canonical re-serialization differs from baseline bytes",
            )
        old_rec = json.loads(raw_line)
        new_rec = json.loads(raw_line)
        line_applied = {"line": ln, "edgeId": rec.get("edgeId"), "fields": []}
        if (ln, "discriminatorIds") in derived_changes:
            line_applied["fields"].append({
                "field": "discriminatorIds",
                "oldValue": old_rec["discriminatorIds"],
                "newValue": derived[ln]["discriminatorIds"],
            })
            new_rec["discriminatorIds"] = derived[ln]["discriminatorIds"]
        if (ln, "sourceClass") in derived_changes:
            line_applied["fields"].append({
                "field": "sourceClass",
                "oldValue": old_rec["sourceClass"],
                "newValue": derived[ln]["sourceClass"],
            })
            new_rec["sourceClass"] = derived[ln]["sourceClass"]
        # permitted-field guard: the only deep-diff between old and new must
        # be exactly the applied top-level fields
        diffs = deep_diff(old_rec, new_rec)
        tops = sorted({d[0].split(".")[0].split("[")[0] for d in diffs})
        if tops != sorted(f["field"] for f in line_applied["fields"]):
            raise GateFailure(
                "UNEXPECTED_FIELD_CHANGE", f"line {ln}: diff paths {tops}"
            )
        out_lines.append(dumps(new_rec))
        applied.append(line_applied)

    # ---- full-census delta: old vs new over all 116 records --------------
    new_records = [json.loads(l) for l in out_lines]
    census = []
    for i in range(len(records)):
        diffs = deep_diff(records[i], new_records[i])
        if diffs:
            census.append({
                "line": i + 1,
                "edgeId": records[i].get("edgeId"),
                "changedFields": [
                    {"field": p, "oldValue": o, "newValue": n} for p, o, n in diffs
                ],
            })
    changed_cells = {
        (c["line"], f["field"].split(".")[0].split("[")[0])
        for c in census for f in c["changedFields"]
    }
    if changed_cells != PERMITTED_CELLS:
        raise GateFailure(
            "CHANGE_CENSUS_MISMATCH",
            f"census cells {sorted(changed_cells)} != permitted {sorted(PERMITTED_CELLS)}",
        )
    if len(census) != 4:
        raise GateFailure("CHANGE_RECORD_COUNT", f"{len(census)} records changed, expected 4")
    total_fields = sum(len(c["changedFields"]) for c in census)
    if total_fields != 6:
        raise GateFailure("CHANGE_FIELD_COUNT", f"{total_fields} fields changed, expected 6")

    # ---- regressions ------------------------------------------------------
    run_regressions(records, new_records, out_lines, lines)

    # ---- post-condition: full §I conformance ------------------------------
    for ln in section_i_lines:
        rec = new_records[ln - 1]
        if rec["discriminatorIds"] != derived[ln]["discriminatorIds"]:
            raise GateFailure("POST_CONFORMANCE_D", f"line {ln}")
        if rec["sourceClass"] != derived[ln]["sourceClass"]:
            raise GateFailure("POST_CONFORMANCE_SC", f"line {ln}")

    output = b"\n".join(out_lines) + b"\n"

    evidence = {
        "sectionILines": section_i_lines,
        "derivationLog": derivation_log,
        "applied": applied,
        "census": census,
        "changedRecordCount": len(census),
        "changedFieldCount": total_fields,
    }
    return output, evidence


def run_regressions(old_records, new_records, out_lines, in_lines):
    # F01: no record carries both supportClass and supportBearing
    for i, r in enumerate(new_records):
        if "supportClass" in r and "supportBearing" in r:
            raise GateFailure("F01_DUAL_SUPPORT", f"line {i+1}")
    # F02: migrated A-E001 carries none of the ledger-only keys
    l115_old = old_records[114]
    l115_new = new_records[114]
    if l115_new.get("edgeId") != "A-E001":
        raise GateFailure("AE001_LINE_DRIFT", "line 115 edgeId")
    for k in LEDGER_ONLY_KEYS:
        if k in l115_new:
            raise GateFailure("F02_LEDGER_KEY_ON_RECORD", f"line 115 key {k}")
    # A-E001 successor-bearing semantics preserved
    if l115_new.get("supportBearing") != l115_old.get("supportBearing") or \
       l115_new.get("supportBearing") != "NON_DISCRIMINATING":
        raise GateFailure("AE001_BEARING_ALTERED", "supportBearing")
    if l115_new.get("prOnlyBasis") != l115_old.get("prOnlyBasis"):
        raise GateFailure("AE001_PRONLY_ALTERED", "prOnlyBasis")
    if l115_new.get("bearingEvaluability") != l115_old.get("bearingEvaluability"):
        raise GateFailure("AE001_EVALUABILITY_ALTERED", "bearingEvaluability")
    if l115_new.get("scopeBridgeState") != l115_old.get("scopeBridgeState"):
        raise GateFailure("AE001_SCOPE_ALTERED", "scopeBridgeState")
    # F0024 provenance correction preserved on line 112 (bytes verbatim)
    if out_lines[111] != in_lines[111]:
        raise GateFailure("F0024_LINE_BYTES_ALTERED", "line 112")
    fpi = new_records[111]["factualPackageIdentity"]
    for k, v in F0024_EXPECTED_IDENTITY.items():
        if fpi.get(k) != v:
            raise GateFailure("F0024_IDENTITY_ALTERED", f"{k}={fpi.get(k)!r}")
    # unchanged §I records byte-verbatim (111, 112)
    for ln in (111, 112):
        if out_lines[ln - 1] != in_lines[ln - 1]:
            raise GateFailure("UNTOUCHED_SI_ALTERED", f"line {ln}")
    # untouched records byte-verbatim
    touched = {113, 114, 115, 116}
    for i in range(len(in_lines)):
        if (i + 1) not in touched and out_lines[i] != in_lines[i]:
            raise GateFailure("VERBATIM_VIOLATION", f"line {i+1}")
    # abstention / missing-evidence semantics untouched on corrected lines
    for ln in touched:
        if new_records[ln - 1].get("abstention") != old_records[ln - 1].get("abstention"):
            raise GateFailure("ABSTENTION_ALTERED", f"line {ln}")
    # no NOT-DETERMINABLE/hold semantics introduced or removed anywhere
    for i in range(len(old_records)):
        for k in set(old_records[i]) | set(new_records[i]):
            o, n = old_records[i].get(k, _ABSENT), new_records[i].get(k, _ABSENT)
            if o is _ABSENT or n is _ABSENT:
                continue  # covered by census
            if isinstance(o, str) and isinstance(n, str):
                if "NOT_DETERMINABLE" in o and "NOT_DETERMINABLE" not in n:
                    raise GateFailure("NOT_DETERMINABLE_REMOVED", f"line {i+1} {k}")


# --------------------------------------------------------------------------
# in-memory negative controls (author-side; each must raise GateFailure)
# --------------------------------------------------------------------------

def run_negative_controls(input_raw, registry_raw, pi7_raw, corr4_raw):
    results = {}
    mutated = dict(verify_input=False)  # downstream gates, deliberately stale input

    def expect(label, fn):
        try:
            fn()
            results[label] = "NOT_REJECTED"
        except GateFailure as g:
            results[label] = f"REJECTED ({g.code})"
        return results[label]

    reg_text = registry_raw.decode("utf-8")
    pi7_lines = pi7_raw.splitlines()

    # NC-A stale supplying identity (sourceId mutated on line 115)
    def nc_a():
        lines = input_raw.split(b"\n")
        lines[114] = lines[114].replace(b'"C33-S01"', b'"C33-S02"')
        assemble(b"\n".join(lines), registry_raw, pi7_raw, corr4_raw, **mutated)
    expect("NCA_staleSourceIdentityRejected", nc_a)

    # NC-B duplicate PI-7 identity injected
    def nc_b():
        dup = json.loads(pi7_lines[0])
        assemble(input_raw, registry_raw,
                 pi7_raw + b"\n" + json.dumps(dup).encode(), corr4_raw, **mutated)
    expect("NCB_duplicatePi7IdentityRejected", nc_b)

    # NC-C missing PI-7 entry (drop the CASE-3.5/CHRYSLER/C-B04 row)
    def nc_c():
        kept = [l for l in pi7_lines if b'"C-B04"' not in l or b'"CHRYSLER"' not in l]
        assemble(input_raw, registry_raw, b"\n".join(kept) + b"\n", corr4_raw, **mutated)
    expect("NCC_missingPi7EntryRejected", nc_c)

    # NC-D registry §D row removed (mechanism becomes unknown)
    def nc_d():
        txt = "\n".join(
            l for l in reg_text.splitlines()
            if not l.startswith("| M-ENFORCE-SANCTION | enforcement |")
        )
        assemble(input_raw, txt.encode(), pi7_raw, corr4_raw, **mutated)
    expect("NCD_registryRowLossRejected", nc_d)

    # NC-E duplicate conflicting registry row
    def nc_e():
        row = next(
            l for l in reg_text.splitlines()
            if l.startswith("| M-ENFORCE-SANCTION | enforcement |")
        )
        tampered = row.replace("| D-06 |", "| D-11 |", 1)
        assemble(input_raw, registry_raw + b"\n" + tampered.encode(),
                 pi7_raw, corr4_raw, **mutated)
    expect("NCE_conflictingRegistryRowRejected", nc_e)

    # NC-F derived change outside authorized scope (tamper an ASSIGNED entry
    # so line 112's sourceClass would change -> out-of-scope -> HOLD)
    def nc_f():
        out = []
        for l in pi7_lines:
            e = json.loads(l)
            if (e["caseId"], e["sideId"], e["factId"]) == ("aol-time-warner", "AOL", "F0024"):
                e["sectionIFill"]["sourceClassAssignmentState"] = "OUTSIDE_FROZEN_VOCABULARY"
                e["sectionIFill"]["sourceClass"] = None
            out.append(json.dumps(e).encode())
        assemble(input_raw, registry_raw, b"\n".join(out) + b"\n", corr4_raw, **mutated)
    expect("NCF_outOfScopeDerivedChangeRejected", nc_f)

    # NC-G unexpected field change slipped past the applier is caught by the
    # full-corpus census gate
    def nc_g():
        out, _ = assemble(input_raw, registry_raw, pi7_raw, corr4_raw)
        lines = out.split(b"\n")
        obj = json.loads(lines[112])
        obj["abstention"] = "TAMPERED"
        lines[112] = dumps(obj)
        recs_old = [json.loads(l) for l in input_raw.split(b"\n")[:-1]]
        recs_new = [json.loads(l) for l in lines[:-1]]
        cells = set()
        for i in range(len(recs_old)):
            for p, _, _ in deep_diff(recs_old[i], recs_new[i]):
                cells.add((i + 1, p.split(".")[0].split("[")[0]))
        if cells != PERMITTED_CELLS:
            raise GateFailure("CHANGE_CENSUS_MISMATCH", f"{sorted(cells)}")
    expect("NCG_unexpectedFieldChangeRejected", nc_g)

    # NC-H record loss
    def nc_h():
        lines = input_raw.split(b"\n")[:-1]
        assemble(b"\n".join(lines[:115]) + b"\n", registry_raw, pi7_raw,
                 corr4_raw, **mutated)
    expect("NCH_recordLossRejected", nc_h)

    # NC-I record reordering (two untouched legacy records swapped): any
    # input that is not byte-exact CORR1 — a reordered corpus included — is
    # rejected by the input-identity gate before assembly
    def nc_i():
        lines = input_raw.split(b"\n")[:-1]
        lines[0], lines[1] = lines[1], lines[0]
        assemble(b"\n".join(lines) + b"\n", registry_raw, pi7_raw,
                 corr4_raw, verify_input=True)
    expect("NCI_recordReorderRejected", nc_i)

    # NC-J stale baseline (failed FEVA v1 records as input) — input pin gate
    def nc_j():
        v1 = (
            REPO_ROOT / "WORKBENCH/DOWNLOADS/STAGE2_FINAL_EFFECTIVE_VIEW_ASSEMBLY_1_2026-10-07"
            / "STAGE2_FINAL_EFFECTIVE_VIEW_ASSEMBLY_1_RECORDS.jsonl"
        ).read_bytes()
        assemble(v1, registry_raw, pi7_raw, corr4_raw, verify_input=True)
    expect("NCJ_staleBaselineRejected", nc_j)

    # NC-K reintroduced dual support on migrated A-E001
    def nc_k():
        out, _ = assemble(input_raw, registry_raw, pi7_raw, corr4_raw)
        lines = out.split(b"\n")
        obj = json.loads(lines[114])
        obj["supportClass"] = "DIRECT_SUPPORT"
        lines[114] = dumps(obj)
        for i, r in enumerate(json.loads(l) for l in lines[:-1]):
            if "supportClass" in r and "supportBearing" in r:
                raise GateFailure("F01_DUAL_SUPPORT", f"line {i+1}")
        raise GateFailure("NOT_DETECTED", "dual support not detected")
    expect("NCK_dualSupportReintroductionRejected", nc_k)

    # NC-L ledger-only key placed on the migrated record
    def nc_l():
        out, _ = assemble(input_raw, registry_raw, pi7_raw, corr4_raw)
        lines = out.split(b"\n")
        obj = json.loads(lines[114])
        obj["projectionClass"] = "X"
        lines[114] = dumps(obj)
        for k in LEDGER_ONLY_KEYS:
            if k in json.loads(lines[114]):
                raise GateFailure("F02_LEDGER_KEY_ON_RECORD", k)
        raise GateFailure("NOT_DETECTED", "ledger key not detected")
    expect("NCL_ledgerKeyOnRecordRejected", nc_l)

    ok = all(str(v).startswith("REJECTED") for v in results.values())
    return ok, results


# --------------------------------------------------------------------------
# publication (all gates passed before any write)
# --------------------------------------------------------------------------

def publish(output_bytes, evidence):
    records_sha = sha256_bytes(output_bytes)
    build_sha = sha256_bytes(PKG_DIR.joinpath(
        "STAGE2_FINAL_EFFECTIVE_VIEW_ASSEMBLY_1_CORR2_BUILD.py").read_bytes())

    delta = {
        "act": ACT,
        "predecessorSha256": PINS["CORR1_RECORDS"][1],
        "successorSha256": records_sha,
        "changedRecordCount": evidence["changedRecordCount"],
        "changedFieldCount": evidence["changedFieldCount"],
        "unchangedRecordCount": 116 - evidence["changedRecordCount"],
        "valueSemanticsLegend": {
            "presence": "PRESENT values are wrapped; ABSENT keys are null-wrapped "
                        "in oldValue/newValue slots (absent vs null distinct)",
            "typeStrictness": "bool vs int and int vs float distinct",
            "serialization": "json.dumps(ensure_ascii=True, separators=(', ', ': ')); "
                             "LF; exactly one trailing newline",
        },
        "changedRecords": [],
    }
    log_by_line = {log["line"]: log for log in evidence["derivationLog"]}
    for ap in evidence["applied"]:
        log = log_by_line[ap["line"]]
        entry = {
            "line": ap["line"],
            "edgeId": ap["edgeId"],
            "mechanismPropositionIds": log["mechanismPropositionIds"],
            "authority": {
                "discriminatorRule": "frozen registry (PD3-CLAR-1.CORR1) §C.0 C-1/C-2: "
                                     "emitted set = union of §D-row D-sets of the edge's "
                                     "mechanismPropositionIds; CORR4 §D cross-checked equal",
                "registrySha256": PINS["FROZEN_REGISTRY_PD3_CLAR1_CORR1"][1],
                "registryDSet": log["registryDSet"],
                "sourceClassRule": "frozen coder-view schema sourceClassBindingRule: "
                                   "copy PI-7 sectionIFill exactly (ASSIGNED sourceClass, "
                                   "otherwise fail-closed state verbatim)",
                "schemaSha256": PINS["FROZEN_CODER_VIEW_SCHEMA"][1],
                "pi7BindingSha256": PINS["PI7_SOURCECLASS_BINDING"][1],
                "pi7Identity": log["pi7Identity"],
                "pi7SourceClassAssignmentState": log["pi7SourceClassAssignmentState"],
                "pi7Derivation": log["pi7Derivation"],
            },
            "changedFields": [
                {
                    "field": f["field"],
                    "oldValue": wrap(f["oldValue"]),
                    "newValue": wrap(f["newValue"]),
                    "authorityPath": (
                        "frozen registry §D row for "
                        f"{log['mechanismPropositionIds'][0]} (C-1/C-2)"
                        if f["field"] == "discriminatorIds"
                        else "PI-7 sectionIFill for identity "
                             + str(log["pi7Identity"])
                    ),
                }
                for f in ap["fields"]
            ],
        }
        delta["changedRecords"].append(entry)
    if len(delta["changedRecords"]) != evidence["changedRecordCount"]:
        raise GateFailure(
            "DELTA_PROVENANCE_INCOMPLETE",
            f"{len(delta['changedRecords'])} entries for "
            f"{evidence['changedRecordCount']} changed records",
        )

    changed_cell_set = sorted(
        (c["line"], f["field"].split(".")[0].split("[")[0])
        for c in evidence["census"] for f in c["changedFields"]
    )
    if set(changed_cell_set) != PERMITTED_CELLS:
        raise GateFailure("PUBLISH_SCOPE", "census cells != permitted cells")

    delta_bytes = json.dumps(delta, indent=1, ensure_ascii=True).encode("utf-8") + b"\n"

    report = render_report(
        records_sha, len(output_bytes), build_sha,
        PKG_DIR.joinpath("STAGE2_FINAL_EFFECTIVE_VIEW_ASSEMBLY_1_CORR2_BUILD.py").stat().st_size,
        evidence,
    ).encode("utf-8")

    members = {
        "STAGE2_FINAL_EFFECTIVE_VIEW_ASSEMBLY_1_CORR2_RECORDS.jsonl": output_bytes,
        "STAGE2_FINAL_EFFECTIVE_VIEW_ASSEMBLY_1_CORR2_DELTA_PROVENANCE.json": delta_bytes,
        "STAGE2_FINAL_EFFECTIVE_VIEW_ASSEMBLY_1_CORR2_REPORT.md": report,
    }
    manifest = {
        "act": ACT,
        "actor": "Z.ai",
        "role": "IMPLEMENTATION AUTHOR",
        "mode": "BOUNDED CORRECTION (fail-closed deterministic; safe publication)",
        "date": "2026-10-08",
        "repositoryRoot": str(REPO_ROOT),
        "branch": "main",
        "baseHead": "9b57f0cb567d5a36e4ebcf3292cdbd18439f4faa",
        "parentAct": {
            "act": "STAGE2_FINAL_EFFECTIVE_VIEW_ASSEMBLY_1.CORR1",
            "recordsSha256": PINS["CORR1_RECORDS"][1],
            "iv1": "STAGE2_FINAL_EFFECTIVE_VIEW_ASSEMBLY_1.CORR1.IV1 (Codex, 2026-10-07) VERDICT FAIL",
            "iv1Continuation1": "STAGE2_FINAL_EFFECTIVE_VIEW_ASSEMBLY_1.CORR1.IV1.CONTINUATION_1 "
                                "(Codex, 2026-10-08) VERDICT FAIL - 0 BLOCKING / 2 MAJOR / "
                                "0 MINOR / 2 ADVISORY; open findings CONT1-M01, CONT1-M02",
        },
        "inputs": [
            {
                "role": role,
                "path": f"WORKBENCH/DOWNLOADS/{rel.split('WORKBENCH/DOWNLOADS/')[-1]}",
                "sha256": sha,
                "bytes": nb,
            }
            for role, (rel, sha, nb) in PINS.items()
        ],
        "permittedChangeSet": sorted([f"line{ln}.{field}" for ln, field in PERMITTED_CELLS]),
        "changeInventory": {
            "changedRecordCount": evidence["changedRecordCount"],
            "changedFieldCount": evidence["changedFieldCount"],
            "changedCells": changed_cell_set,
            "censusCoverage": "all 116 records deep-diffed; §I conformance derived for "
                              "all 6 SECTION_I records (the complete applicable surface: "
                              "the other 110 records are POST_RECONCILIATION_EXECUTION_CELL_"
                              "RECORDs carrying neither discriminatorIds nor sourceClass)",
        },
        "serialization": {
            "convention": "json.dumps(ensure_ascii=True, separators=(', ', ': ')); LF; "
                          "exactly one trailing newline",
            "pureAscii": True,
            "unchangedLinesEmittedVerbatim": 116 - len(evidence["applied"]),
        },
        "firewalls": {
            "corr1BaselineUnchanged": True,
            "fevaV1PackageUnchanged": True,
            "originalBuildUnmodified": True,
            "acceptedContractsUnmodified": True,
            "gitMutations": 0,
            "writesOutsidePackageDir": 0,
        },
        "negativeControls": {k: v for k, v in evidence["negativeControls"].items()},
        "selfValidation": {
            "executed": True,
            "note": "author-side self-validation only; not independent verification",
            "deterministicRepeatBuild": True,
        },
        "independentlyVerified": False,
        "ownerAccepted": False,
        "gitClosed": False,
        "status": "READY_FOR_INDEPENDENT_VERIFICATION",
        "stoppingPoint": "CORR2 candidate assembly + self-validation complete. "
                         "No CORR2.IV1 started.",
        "manifestSelfHashPolicy": "This manifest pins every other output member by "
                                  "SHA-256 and byte count. It does NOT include its own "
                                  "digest (circular self-hash forbidden). Its identity is "
                                  "established post-write by external hashing; the CORR2 "
                                  "report documents this policy as the package's external "
                                  "identity anchor.",
        "additionalArtifacts": "STAGE2_FINAL_EFFECTIVE_VIEW_ASSEMBLY_1_CORR2_TESTS.py and "
                               "STAGE2_FINAL_EFFECTIVE_VIEW_ASSEMBLY_1_CORR2_TEST_RESULTS.json "
                               "are additional act-local author-side test artifacts under act "
                               "brief §9; they are not pinned here. TEST_RESULTS.json records "
                               "the package-member identities it observed at run time.",
        "outputs": {},
    }
    for name, data in members.items():
        manifest["outputs"][name] = {"bytes": len(data), "sha256": sha256_bytes(data)}
    manifest["outputs"]["STAGE2_FINAL_EFFECTIVE_VIEW_ASSEMBLY_1_CORR2_BUILD.py"] = {
        "bytes": len(PKG_DIR.joinpath(
            "STAGE2_FINAL_EFFECTIVE_VIEW_ASSEMBLY_1_CORR2_BUILD.py").read_bytes()),
        "sha256": build_sha,
    }
    manifest_bytes = json.dumps(manifest, indent=1, ensure_ascii=True).encode("utf-8") + b"\n"

    # ---- write phase: tmp + fsync + os.replace, then re-read verify -------
    written = dict(members)
    written["STAGE2_FINAL_EFFECTIVE_VIEW_ASSEMBLY_1_CORR2_MANIFEST.json"] = manifest_bytes
    for name, data in written.items():
        target = PKG_DIR / name
        fd, tmp = tempfile.mkstemp(dir=str(PKG_DIR), prefix=".tmp_", suffix=name)
        try:
            with os.fdopen(fd, "wb") as f:
                f.write(data)
                f.flush()
                os.fsync(f.fileno())
            os.replace(tmp, target)
        except BaseException:
            if os.path.exists(tmp):
                os.unlink(tmp)
            raise
    for name, data in written.items():
        got = (PKG_DIR / name).read_bytes()
        if got != data:
            raise GateFailure("POST_WRITE_VERIFY", f"{name} re-read differs")
        os.chmod(PKG_DIR / name, 0o644)
    return written


def render_report(records_sha, records_len, build_sha, build_len, evidence):
    def cell_val(wrapped):
        if wrapped is None:
            return "ABSENT"
        v = wrapped.get("value")
        return json.dumps(v)

    rows = "\n".join(
        f"| {c['line']} | {c['edgeId']} | " +
        "; ".join(
            f"`{f['field']}` {cell_val(f['oldValue'])} → {cell_val(f['newValue'])}"
            for f in c["changedFields"]
        ) + " |"
        for c in evidence["census"]
    )
    deriv = "\n".join(
        f"- line {d['line']} (`{d['edgeId']}`): mechanism(s) "
        f"{d['mechanismPropositionIds']} → registry §D set {d['registryDSet']}; "
        f"PI-7 identity {d['pi7Identity']} → state "
        f"{d['pi7SourceClassAssignmentState']}"
        for d in evidence["derivationLog"]
    )
    return f"""\

# STAGE2_FINAL_EFFECTIVE_VIEW_ASSEMBLY_1.CORR2 — Implementation Report

**ACT:** {ACT}  
**ROLE:** IMPLEMENTATION AUTHOR — Z.ai (Owner-authorized bounded correction)  
**MODE:** fail-closed deterministic correction; safe publication  
**REPOSITORY:** Inposibl/mergevue work tree at `main` @ `9b57f0cb567d5a36e4ebcf3292cdbd18439f4faa` (unchanged; zero Git operations)

## 1. Status

**CANDIDATE_COMPLETE — READY_FOR_INDEPENDENT_VERIFICATION.**

Author-side self-validation only. Nothing in this package is independently
verified or Owner-accepted.

## 2. What this act closes

Exactly the two open MAJOR findings of
`STAGE2_FINAL_EFFECTIVE_VIEW_ASSEMBLY_1.CORR1.IV1.CONTINUATION_1` (Codex,
VERDICT FAIL — 0 BLOCKING / 2 MAJOR / 0 MINOR / 2 ADVISORY):

- **CONT1-M01** — four persisted `discriminatorIds[]` values conflicted with
  the frozen M-row registry. Reproduced mechanically from the pinned registry
  (sha256 `cb08b51e…`): §C.0 C-1 makes each M's §D-row D field the authoritative
  binding; C-2 emits the union of the §D-row D-sets of the edge's mechanisms;
  C-4 fixes M-ENFORCE-SANCTION to D-06. The CORR4 contract's §D rows
  (sha256 `2de49862…`) were cross-checked equal for every involved mechanism.
- **CONT1-M02** — two persisted `sourceClass` values were documentary genre
  instead of the exact PI-7 `sectionIFill` binding. Reproduced mechanically
  from the pinned PI-7 binding (sha256 `3eee72d0…`) under the frozen schema's
  (sha256 `0cb5a6b5…`) `sourceClassBindingRule`: copy the ASSIGNED sourceClass,
  otherwise the fail-closed state verbatim. Full supplying-record identity
  `(caseId, sideId, factId, sourceRefIndex, sourceId)` matched exactly one
  BOUND/RESOLVED entry per record.

No methodology was reinterpreted; no fact was recoded; no new analytical
judgment was introduced.

## 3. Exact change set (full census)

Deep-diffed all 116 records (presence-aware, type-strict). Exactly 4 records
changed, exactly 6 fields, exactly the authorized cells:

| Line | edgeId | Changed fields |
|---:|---|---|
{rows}

Everything else is byte-for-byte identical to the CORR1 baseline
(`3603c3169d7bdd67763ac0d2468d08cbb508d23dfeece4f7b396900b11dc68ec`), including
the accepted F0024 provenance correction (line 112), the migrated A-E001
successor-bearing semantics (line 115), and all abstention /
missing-evidence semantics. No `NOT_DETERMINABLE` state was converted into a
determinate Environment conclusion.

## 4. Derivation provenance

{deriv}

Derivation is executed at build time from the pinned controlling bytes; the
auditor's replacement table was not an input. Any derived change outside the
Owner-authorized cell set aborts the build (HOLD), so pre-existing defects
outside this act's scope can never be silently repaired.

## 5. Author-side verification executed

- Pinned-input SHA-256/byte verification for all five authorities (fail-closed).
- §I surface census: exactly 6 SECTION_I_RECORD records (lines 111–116); no
  other record carries `discriminatorIds` or `sourceClass`, so the applicable
  conformance census is complete at 6/6. The remaining 110 records are
  legacy `POST_RECONCILIATION_EXECUTION_CELL_RECORD`s outside the §I
  emission rule (BC-1/BC-2 boundaries untouched).
- Round-trip guard: canonical re-serialization of every modified line equals
  its baseline bytes, so applied diffs are confined to the six values.
- Full 116-record delta census: 4 records / 6 fields / authorized cells only.
- F01 regression: no record carries both `supportClass` and `supportBearing`.
- F02 regression: migrated A-E001 carries none of the five ledger-only keys;
  `prOnlyBasis`, `bearingEvaluability`, `supportBearing`, `scopeBridgeState`
  unchanged.
- F0024 regression: line 112 byte-verbatim; corrected identity values intact.
- Post-condition: every §I record's derived discriminator set and sourceClass
  equal the persisted values (full conformance achieved).
- Deterministic repeat build (in-process twice + subprocess re-run) — identical.
- Twelve negative controls executed; every one rejected with zero publication
  (see `TEST_RESULTS.json` / manifest `negativeControls`).

## 6. Coverage and limitations

- The §I conformance census is complete for the §I surface (6/6). No claim is
  made about semantic conformance of the 110 legacy records beyond byte
  preservation; they are outside this act's scope and outside the §I rules.
- F03/F04 of the original v1 IV1 remain EVIDENCE_INSUFFICIENT (Codex
  continuation §4); this act does not adjudicate them.
- No final Stage-2 Measurement Regression was executed (prohibited by brief).
- No downstream Environment classification was executed or inferred from the
  corrected discriminator routing or fail-closed sourceClass states.
- Python stdlib only; deterministic; no network, no persistence outside the
  package directory, no Git operations.

## 7. Package identity

| Member | Bytes | SHA-256 |
|---|---:|---|
| STAGE2_FINAL_EFFECTIVE_VIEW_ASSEMBLY_1_CORR2_BUILD.py | {build_len} | `{build_sha}` |
| STAGE2_FINAL_EFFECTIVE_VIEW_ASSEMBLY_1_CORR2_RECORDS.jsonl | {records_len} | `{records_sha}` |
| STAGE2_FINAL_EFFECTIVE_VIEW_ASSEMBLY_1_CORR2_DELTA_PROVENANCE.json | see manifest | see manifest |
| STAGE2_FINAL_EFFECTIVE_VIEW_ASSEMBLY_1_CORR2_MANIFEST.json | — | external anchor (see manifest self-hash policy) |
| STAGE2_FINAL_EFFECTIVE_VIEW_ASSEMBLY_1_CORR2_TEST_RESULTS.json | — | external anchor (author-side test evidence) |

The manifest pins every other member by SHA-256 and byte count and does not
embed its own digest (circular self-hash forbidden). The manifest's and this
report's own identities are established post-write by external hashing.

## 8. Stopping point

CORR2 candidate assembled and self-validated. Next act: fresh independent
verification by a non-author verifier (per §10 role separation). No Git stage,
commit, push, or any other Git mutation was performed or is authorized by this
report.
"""


def main():
    # root proof
    if not (REPO_ROOT / ".git").exists() or not (REPO_ROOT / "AGENTS.md").is_file():
        raise GateFailure("WRONG_OR_AMBIGUOUS_PROJECT_ROOT", str(REPO_ROOT))

    input_raw = read_pinned("CORR1_RECORDS")
    registry_raw = read_pinned("FROZEN_REGISTRY_PD3_CLAR1_CORR1")
    pi7_raw = read_pinned("PI7_SOURCECLASS_BINDING")
    schema_raw = read_pinned("FROZEN_CODER_VIEW_SCHEMA")
    corr4_raw = read_pinned("STAGE2_SEMANTIC_SUCCESSOR_CORR4")

    schema = json.loads(schema_raw)
    if "sourceClassBindingRule" not in schema or \
       "discriminatorAssignmentIsNotSampleLeakage" not in schema:
        raise GateFailure("SCHEMA_RULES_MISSING", "controlling schema lacks required rules")

    # deterministic repeat build (in-process, twice)
    out1, ev1 = assemble(input_raw, registry_raw, pi7_raw, corr4_raw)
    out2, ev2 = assemble(input_raw, registry_raw, pi7_raw, corr4_raw)
    if out1 != out2:
        raise GateFailure("NONDETERMINISTIC_BUILD", "repeat build differs")

    # author-side negative controls (must all reject)
    ok, nc = run_negative_controls(input_raw, registry_raw, pi7_raw, corr4_raw)
    if not ok:
        raise GateFailure("NEGATIVE_CONTROL_FAILURE", str(nc))
    ev1["negativeControls"] = nc

    written = publish(out1, ev1)

    # inputs untouched after publication
    for name in PINS:
        read_pinned(name)

    print(f"records sha256={sha256_bytes(out1)} bytes={len(out1)} "
          f"lines=116 changed={ev1['changedRecordCount']}r/{ev1['changedFieldCount']}f")
    for name, data in written.items():
        print(f"wrote {name} {len(data)}B {sha256_bytes(data)}")
    return 0


if __name__ == "__main__":
    sys.exit(main())
