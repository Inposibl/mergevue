#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
STAGE2_FINAL_EFFECTIVE_VIEW_ASSEMBLY_1.CORR2 — author-side verification.

Separate from BUILD.py and separately labelled: this is AUTHOR-SIDE evidence
only, not independent verification. It re-derives both corrections with its
own parsing code, re-censuses the full delta, re-runs the negative controls,
re-runs the build in a fresh subprocess for determinism, and censuses
upstream immutability and Git state. Writes only TEST_RESULTS.json inside
this package directory.
"""

import hashlib
import importlib.util
import json
import subprocess
import sys
from pathlib import Path

PKG = Path(__file__).resolve().parent
REPO = PKG.parents[2]
B = PKG / "STAGE2_FINAL_EFFECTIVE_VIEW_ASSEMBLY_1_CORR2_BUILD.py"
T = PKG / "STAGE2_FINAL_EFFECTIVE_VIEW_ASSEMBLY_1_CORR2_TESTS.py"
RECORDS = PKG / "STAGE2_FINAL_EFFECTIVE_VIEW_ASSEMBLY_1_CORR2_RECORDS.jsonl"
DELTA = PKG / "STAGE2_FINAL_EFFECTIVE_VIEW_ASSEMBLY_1_CORR2_DELTA_PROVENANCE.json"
REPORT = PKG / "STAGE2_FINAL_EFFECTIVE_VIEW_ASSEMBLY_1_CORR2_REPORT.md"
MANIFEST = PKG / "STAGE2_FINAL_EFFECTIVE_VIEW_ASSEMBLY_1_CORR2_MANIFEST.json"
RESULTS = PKG / "STAGE2_FINAL_EFFECTIVE_VIEW_ASSEMBLY_1_CORR2_TEST_RESULTS.json"

CORR1 = REPO / "WORKBENCH/DOWNLOADS/STAGE2_FINAL_EFFECTIVE_VIEW_ASSEMBLY_1_CORR1_2026-10-07"
FEVA_V1 = REPO / "WORKBENCH/DOWNLOADS/STAGE2_FINAL_EFFECTIVE_VIEW_ASSEMBLY_1_2026-10-07"
CONT_DIR = REPO / "WORKBENCH/AUDITS/STAGE2_FINAL_EFFECTIVE_VIEW_ASSEMBLY_1_CORR1_IV1_CONTINUATION_1"

PERMITTED_CELLS = {
    (113, "discriminatorIds"), (114, "discriminatorIds"),
    (115, "discriminatorIds"), (116, "discriminatorIds"),
    (115, "sourceClass"), (116, "sourceClass"),
}
EXPECTED_NC_CODES = {
    "NCA_staleSourceIdentityRejected": "PI7_NO_MATCH",
    "NCB_duplicatePi7IdentityRejected": "PI7_DUPLICATE_IDENTITY",
    "NCC_missingPi7EntryRejected": "PI7_NO_MATCH",
    "NCD_registryRowLossRejected": "MECHANISM_NOT_IN_REGISTRY",
    "NCE_conflictingRegistryRowRejected": "REGISTRY_ROW_CONFLICT",
    "NCF_outOfScopeDerivedChangeRejected": "DERIVED_CHANGE_OUTSIDE_AUTHORIZED_SCOPE",
    "NCG_unexpectedFieldChangeRejected": "CHANGE_CENSUS_MISMATCH",
    "NCH_recordLossRejected": "RECORD_COUNT",
    "NCI_recordReorderRejected": "PIN_",
    "NCJ_staleBaselineRejected": "PIN_",
    "NCK_dualSupportReintroductionRejected": "F01_DUAL_SUPPORT",
    "NCL_ledgerKeyOnRecordRejected": "F02_LEDGER_KEY_ON_RECORD",
}
UPSTREAM_PINS = {
    str(CORR1 / "STAGE2_FINAL_EFFECTIVE_VIEW_ASSEMBLY_1_CORR1_RECORDS.jsonl"):
        "3603c3169d7bdd67763ac0d2468d08cbb508d23dfeece4f7b396900b11dc68ec",
    str(CORR1 / "STAGE2_FINAL_EFFECTIVE_VIEW_ASSEMBLY_1_CORR1_BUILD.py"):
        "c3b31e1ed76b7047314bdba75799d2601b45f43e81a03de0f464857a68c8eb98",
    str(CORR1 / "STAGE2_FINAL_EFFECTIVE_VIEW_ASSEMBLY_1_CORR1_MANIFEST.json"):
        "8aee45913bfe6cc720fbad89f7759392edde0d3040f7fa6970d935c1742f6810",
    str(FEVA_V1 / "STAGE2_FINAL_EFFECTIVE_VIEW_ASSEMBLY_1_RECORDS.jsonl"):
        "ea0de2f072f0b13f15d36ff053ef047128de15b529d31cefeb1a3337462f6f0a",
    str(CONT_DIR / "REPORT.md"): None,
    str(CONT_DIR / "IDENTITY_CHECKS.json"): None,
    str(CONT_DIR / "REPRODUCTION_RESULTS.json"): None,
}

results = {"pass": True}


def check(name, ok, detail=""):
    results[name] = {"result": "PASS" if ok else "FAIL", "detail": detail}
    if not ok:
        results["pass"] = False
    return ok


def sha(p):
    return hashlib.sha256(Path(p).read_bytes()).hexdigest()


def wrap(v):
    return {"presence": "PRESENT", "value": v}


class A:
    def __repr__(self):
        return "ABSENT"


ABSENT = A()


def diff(a, b, path=""):
    """Independent presence-aware, type-strict differ (fresh implementation)."""
    if a is ABSENT or b is ABSENT:
        if a is ABSENT and b is ABSENT:
            return []
        return [(path, None if a is ABSENT else wrap(a), None if b is ABSENT else wrap(b))]
    if type(a) is not type(b):
        return [(path, wrap(a), wrap(b))]
    if isinstance(a, dict):
        out = []
        for k in sorted(set(a) | set(b)):
            out += diff(a.get(k, ABSENT), b.get(k, ABSENT), f"{path}.{k}" if path else k)
        return out
    if isinstance(a, list):
        if len(a) != len(b):
            return [(path, wrap(a), wrap(b))]
        out = []
        for i, (x, y) in enumerate(zip(a, b)):
            out += diff(x, y, f"{path}[{i}]")
        return out
    return [] if a == b else [(path, wrap(a), wrap(b))]


def main():
    spec = importlib.util.spec_from_file_location("corr2_build", B)
    build = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(build)

    # ---- 0. upstream immutability pins (before anything else) -------------
    for rel, expected in UPSTREAM_PINS.items():
        p = REPO / rel
        if not check(f"upstream_present:{Path(rel).name}", p.is_file(), rel):
            continue
        h = sha(p)
        if expected is not None:
            check(f"upstream_sha:{Path(rel).name}", h == expected, h)

    # ---- 1. manifest pin verification -------------------------------------
    manifest = json.loads(MANIFEST.read_bytes())
    for name, pin in manifest["outputs"].items():
        p = PKG / name
        ok = p.is_file()
        data = p.read_bytes() if ok else b""
        check(f"manifest_pin:{name}",
              ok and len(data) == pin["bytes"] and hashlib.sha256(data).hexdigest() == pin["sha256"],
              f"{pin['sha256'][:16]}…/{pin['bytes']}B")
    for inp in manifest["inputs"]:
        p = REPO / inp["path"]
        data = p.read_bytes() if p.is_file() else b""
        check(f"input_pin:{Path(inp['path']).name}",
              len(data) == inp["bytes"] and hashlib.sha256(data).hexdigest() == inp["sha256"],
              inp["role"])

    # ---- 2. records shape --------------------------------------------------
    raw2 = RECORDS.read_bytes()
    check("records_ascii", all(b < 128 for b in raw2), "")
    check("records_lf_terminated", raw2.endswith(b"\n") and b"\r" not in raw2, "")
    lines1 = (CORR1 / "STAGE2_FINAL_EFFECTIVE_VIEW_ASSEMBLY_1_CORR1_RECORDS.jsonl").read_bytes().split(b"\n")[:-1]
    lines2 = raw2.split(b"\n")[:-1]
    check("record_count_116", len(lines2) == 116, str(len(lines2)))

    recs1 = [json.loads(l) for l in lines1]
    recs2 = [json.loads(l) for l in lines2]

    # ---- 3. independent full-corpus census ---------------------------------
    census = []
    for i in range(116):
        for p, o, n in diff(recs1[i], recs2[i]):
            census.append((i + 1, p, o, n))
    cells = {(ln, p.split(".")[0].split("[")[0]) for ln, p, _, _ in census}
    check("census_cells_equal_permitted", cells == PERMITTED_CELLS, str(sorted(cells)))
    check("census_records_4", len({ln for ln, *_ in census}) == 4,
          str(sorted({ln for ln, *_ in census})))
    check("census_fields_6", len(census) == 6, str(len(census)))
    check("untouched_lines_verbatim",
          all(lines2[i] == lines1[i] for i in range(116)
              if (i + 1) not in {113, 114, 115, 116}),
          "all lines outside {113,114,115,116} byte-identical")

    # ---- 4. independent re-derivation (own parsers) ------------------------
    reg_text = (REPO / "WORKBENCH/DOWNLOADS/STAGE2_PD3_ROLE_BOUNDED_ENTITLEMENT_CLARIFICATION_1_CORR1_2026-10-04"
                / "STAGE2_PD3_ROLE_BOUNDED_ENTITLEMENT_CLARIFICATION_1_CORR1_CANDIDATE.md").read_text("utf-8")
    d_rows = {}
    for line in reg_text.splitlines():
        if not (line.startswith("| M-") and "| D-" in line):
            continue
        cells_ = [c.strip() for c in line.split("|")]
        # cells_: ['', 'M-...', '<domain>', 'D-xx', ...]
        if len(cells_) > 3 and cells_[3].startswith("D-") and cells_[2].islower():
            mech, dcell = cells_[1], cells_[3]
            dset = {tok.strip() for tok in dcell.split(",")}
            check(f"registry_row_unique:{mech}", mech not in d_rows, "duplicate §D row")
            d_rows[mech] = dset
    pi7 = {}
    for line in (REPO / "WORKBENCH/DOWNLOADS/STAGE2_CORR4_PILOT_ANALYTICAL_SOURCECLASS_BINDING_CORR2.jsonl").read_bytes().splitlines():
        e = json.loads(line)
        key = (e["caseId"], e["sideId"], e["factId"], e["sourceRefIndex"], e["sourceId"])
        check(f"pi7_unique:{key}", key not in pi7, "duplicate PI-7 identity")
        pi7[key] = e

    si_lines = [i + 1 for i, r in enumerate(recs2) if r.get("recordType") == "SECTION_I_RECORD"]
    check("section_i_surface", si_lines == [111, 112, 113, 114, 115, 116], str(si_lines))
    for ln in si_lines:
        r = recs2[ln - 1]
        mechs = r["mechanismPropositionIds"]
        dset = set()
        for m in mechs:
            check(f"mech_known:{m}", m in d_rows, f"line {ln}")
            dset |= d_rows.get(m, set())
        check(f"conform_D_line{ln}", set(r["discriminatorIds"]) == dset,
              f"persisted {r['discriminatorIds']} vs derived {sorted(dset)}")
        key = (r["caseId"], r["side"], r["factIds"][0],
               r["sourceRefs"][0]["refIndex"], r["sourceRefs"][0]["sourceId"])
        e = pi7.get(key)
        check(f"pi7_exactly_one_line{ln}", e is not None, str(key))
        if e:
            fill = e["sectionIFill"]
            want = fill["sourceClass"] if fill["sourceClassAssignmentState"] == "ASSIGNED" \
                else fill["sourceClassAssignmentState"]
            check(f"conform_sourceClass_line{ln}", r["sourceClass"] == want,
                  f"persisted {r['sourceClass']!r} vs PI-7 {want!r}")

    # ---- 5. expected-value cross-check of the census -----------------------
    expected_changes = {
        (113, "discriminatorIds", 0): ("D-01", "D-04"),
        (114, "discriminatorIds", 0): ("D-01", "D-04"),
        (115, "discriminatorIds", 0): ("D-02", "D-06"),
        (116, "discriminatorIds", 0): ("D-06", "D-07"),
        (115, "sourceClass", None): ("PERIODICAL_PRINT_ARCHIVE", "OUTSIDE_FROZEN_VOCABULARY"),
        (116, "sourceClass", None): ("FORM_10K", "OUTSIDE_FROZEN_VOCABULARY"),
    }
    for ln, p, o, n in census:
        top = p.split(".")[0].split("[")[0]
        idx = int(p.split("[")[1].split("]")[0]) if "[" in p else None
        got = (o["value"], n["value"])
        check(f"census_value_line{ln}.{top}", expected_changes.get((ln, top, idx)) == got,
              f"{got}")

    # ---- 6. regressions -----------------------------------------------------
    dual = [i + 1 for i, r in enumerate(recs2)
            if "supportClass" in r and "supportBearing" in r]
    check("F01_no_dual_support", dual == [], str(dual))
    l115 = recs2[114]
    check("F02_no_ledger_keys",
          not any(k in l115 for k in ("legacySupportClass", "migrationRuleId",
                                      "projectionClass", "successorTriple", "holdCode")), "")
    check("AE001_bearing_preserved",
          l115["supportBearing"] == "NON_DISCRIMINATING"
          and l115["bearingEvaluability"] == "EVALUABLE"
          and l115["scopeBridgeState"] == "UNRESOLVED_FAIL_CLOSED", "")
    fpi = recs2[111]["factualPackageIdentity"]
    check("F0024_preserved",
          fpi["recordFileBytes"] == 61728
          and fpi["recordFileSha256"] == "88b20920149b3fcde03e4e060cf4361e9494fe0137540bbc654c526337fd5f10"
          and fpi["packageFactCount"] == 50
          and fpi["caseIdLocator"] == "record-level key 'case_id'", "")

    # ---- 7. delta provenance & report consistency --------------------------
    delta = json.loads(DELTA.read_bytes())
    check("delta_pred_sha",
          delta["predecessorSha256"] == manifest["inputs"][0]["sha256"], "")
    check("delta_succ_sha", delta["successorSha256"] == hashlib.sha256(raw2).hexdigest(), "")
    check("delta_counts",
          delta["changedRecordCount"] == 4 and delta["changedFieldCount"] == 6, "")
    check("report_embeds_records_sha",
          hashlib.sha256(raw2).hexdigest() in REPORT.read_text("utf-8"), "")

    # ---- 8. determinism: fresh-subprocess rebuild --------------------------
    pre = {p.name: sha(p) for p in PKG.iterdir() if p.is_file() and p.suffix != ".py"}
    run = subprocess.run([sys.executable, str(B)], capture_output=True, text=True)
    check("subprocess_build_exit0", run.returncode == 0, run.stderr[-400:])
    post = {p.name: sha(p) for p in PKG.iterdir() if p.is_file() and p.suffix != ".py"}
    check("deterministic_rebuild", pre == post,
          str({k for k in set(pre) | set(post) if pre.get(k) != post.get(k)}))

    # ---- 9. negative controls (expected gate codes) -------------------------
    ok, nc = build.run_negative_controls(
        (CORR1 / "STAGE2_FINAL_EFFECTIVE_VIEW_ASSEMBLY_1_CORR1_RECORDS.jsonl").read_bytes(),
        (REPO / "WORKBENCH/DOWNLOADS/STAGE2_PD3_ROLE_BOUNDED_ENTITLEMENT_CLARIFICATION_1_CORR1_2026-10-04"
         / "STAGE2_PD3_ROLE_BOUNDED_ENTITLEMENT_CLARIFICATION_1_CORR1_CANDIDATE.md").read_bytes(),
        (REPO / "WORKBENCH/DOWNLOADS/STAGE2_CORR4_PILOT_ANALYTICAL_SOURCECLASS_BINDING_CORR2.jsonl").read_bytes(),
        (REPO / "WORKBENCH/DOWNLOADS/STAGE2_SEMANTIC_SUCCESSOR_CANDIDATE_CORR4.md").read_bytes(),
    )
    for label, expected_code in EXPECTED_NC_CODES.items():
        got = nc.get(label, "MISSING")
        ok = got.startswith("REJECTED") and (
            got.startswith(f"REJECTED (PIN_") if expected_code == "PIN_"
            else expected_code in got
        )
        check(f"nc:{label}", ok, got)
    check("manifest_nc_consistent",
          manifest["negativeControls"] == nc, "")

    # ---- 10. git safety (read-only) ----------------------------------------
    head = subprocess.run(["git", "-C", str(REPO), "rev-parse", "HEAD"],
                          capture_output=True, text=True).stdout.strip()
    check("git_head_unchanged", head == "9b57f0cb567d5a36e4ebcf3292cdbd18439f4faa", head)
    tracked = subprocess.run(
        ["git", "-C", str(REPO), "status", "--porcelain=v1", "--untracked-files=no"],
        capture_output=True, text=True).stdout.strip()
    check("git_tracked_clean", tracked == "", tracked[:200])

    # ---- write results ------------------------------------------------------
    results["observedIdentities"] = {
        "corr2RecordsSha256": hashlib.sha256(raw2).hexdigest(),
        "corr2RecordsBytes": len(raw2),
        "testsPySha256": hashlib.sha256(T.read_bytes()).hexdigest(),
        "gitHead": head,
    }
    results["scope"] = ("author-side verification only; not independent verification; "
                        "not Owner acceptance; no Git mutation performed")
    RESULTS.write_bytes(json.dumps(results, indent=1, ensure_ascii=True).encode("utf-8") + b"\n")

    failed = [k for k, v in results.items()
              if isinstance(v, dict) and v.get("result") == "FAIL"]
    print(f"TESTS pass={results['pass']} failed={len(failed)}")
    for k in failed[:20]:
        print(f"  FAIL {k}: {results[k]['detail'][:200]}")
    return 0 if results["pass"] else 1


if __name__ == "__main__":
    sys.exit(main())
