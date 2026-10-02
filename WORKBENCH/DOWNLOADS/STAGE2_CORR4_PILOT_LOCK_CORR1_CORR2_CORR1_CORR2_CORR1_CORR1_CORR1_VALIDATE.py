#!/usr/bin/env python3
# STAGE2_CORR4_PILOT_LOCK_CORR1_CORR2_CORR1_CORR2_CORR1_CORR1_CORR1_VALIDATE.py
# Act: POST-10-CALIBRATION-STAGE2-TREE-BOUND-DISCRIMINATOR-AND-MECHANISM-MEASUREMENT-CONTRACT-1.
#      PILOT-VERSION-LOCK-1.CORR1.CORR2.CORR1.CORR2.CORR1.CORR1.CORR1
#      — PHYSICAL CODER-VIEW CENSUS CORRECTION (closes IV1-F1/F2/F3, validator-only)
# VALIDATOR-ONLY correction. The controlling view (0cb5a6b5...) is NOT reopened and is NOT
# modified. Successor of 4c4839fb...: preserves A-G, N1-N4, P1-P4, X1-X6, sourceClass
# non-regression and all 17 prior forced failures, and adds:
#   E1  CLOSED executionViewControl SCHEMA (exact key set + exact pinned values + canonical SHA)
#   E2  exact pinned futureCoderRule verification (never mere key existence)
#   E3  PHYSICAL DELIVERABLE-VIEW resolution: DELIVERABLE_CODER_VIEW_COUNT/PATHS,
#       CONTROLLING_CODER_VIEW_SHA256, PI6_CODER_VIEW_SHA256, MANIFEST_CODER_VIEW_IDENTITIES,
#       COMPETING_DELIVERABLE_CODER_VIEW_IDENTITY_COUNT (physical identity, not inventory equality)
# Resolver now scans structural coder-view references from BOTH permittedInput AND
# executionViewControl. Authentication by the manifest is NOT delivery.
# Exit 0 = PASS, 1 = FAIL. --write-report writes the sibling VALIDATION_REPORT.txt.

import hashlib
import json
import pathlib
import re
import shutil
import subprocess
import sys
import tempfile
from collections import Counter

HERE = pathlib.Path(__file__).resolve().parent
ROOT = HERE.parent.parent

EXPECTED_HEAD = "31fd56e7e8df29ab5f7ff854be75453686f37758"

VIEW = "STAGE2_CORR4_PILOT_ANALYTICAL_CODER_VIEW_SCHEMA_CORR2_CORR1_CORR2_CORR1.json"
VIEW_SHA = "0cb5a6b5d2239855eeabe0bfd0e9ceb6c545dc2a86b4b34a90b65187592721b5"
NEW_MANIFEST = "STAGE2_CORR4_PILOT_LOCK_CORR1_CORR2_CORR1_CORR2_CORR1_CORR1_CORR1_MANIFEST.sha256"
VIEW_PATH = "WORKBENCH/DOWNLOADS/" + VIEW

# parent candidate identities (must remain byte-identical)
CORR4 = "STAGE2_SEMANTIC_SUCCESSOR_CANDIDATE_CORR4.md"
CORR4_SHA = "2de49862fb0d63c5f1cd1745531199137e73b7b37abceecef6e735d497d38bb0"
BIND = "STAGE2_CORR4_PILOT_ANALYTICAL_SOURCECLASS_BINDING_CORR2.jsonl"
BIND_SHA = "3eee72d088f9f72cb95671df14393912659081827719b589cc8a278cddc61591"
MATRIX2 = "STAGE2_CORR4_PILOT_ANALYTICAL_FIELD_SOURCE_MATRIX_CORR2.json"
MATRIX2_SHA = "1fb84aed8aadeb2b4c2fc85eb6e01cd2ea3849fae5be28a39e0b65ca4e4e2cdd"
PARENT_VIEW = "STAGE2_CORR4_PILOT_ANALYTICAL_CODER_VIEW_SCHEMA_CORR2_CORR1_CORR2.json"
PARENT_VIEW_SHA = "f5f096a3bc7909de0a90e809cef5a141bef7c5eef17b2e260541f5372caa6d11"
PARENT_VALIDATE = "STAGE2_CORR4_PILOT_LOCK_CORR1_CORR2_CORR1_CORR2_CORR1_CORR1_VALIDATE.py"
PARENT_VALIDATE_SHA = "893cbe26fe0004b66101d3e84d784f4dc7efd22948b933a7681140034d659e01"
PARENT_REPORT = "STAGE2_CORR4_PILOT_LOCK_CORR1_CORR2_CORR1_CORR2_CORR1_CORR1_VALIDATION_REPORT.txt"
PARENT_REPORT_SHA = "fbe5419e5ede714b02c4f51e8839828d915bb18558d92aec74e02b399b51e3ce"
PARENT_AUTHOR = "STAGE2_CORR4_PILOT_LOCK_CORR1_CORR2_CORR1_CORR2_CORR1_CORR1_AUTHOR_REPORT.md"
PARENT_AUTHOR_SHA = "093da451c4e65c018e46d88952991e8583daf0e76d20b19a472cba9c5db9bc68"
PARENT_MANIFEST = "STAGE2_CORR4_PILOT_LOCK_CORR1_CORR2_CORR1_CORR2_CORR1_CORR1_MANIFEST.sha256"
PARENT_MANIFEST_SHA = "2473a4173a66b7d1ec0138fe9741849a7624bc0dabe2fd6fe6ec2b441121ed91"
PARENT_IV1 = "STAGE2_CORR4_PILOT_LOCK_CORR1_CORR2_CORR1_CORR2_CORR1_CORR1_IV1_REPORT.md"
PARENT_IV1_SHA = "f2f56b5364b5c64a66f7dbc95e9c4b3db8d93dd8bce1a7036e4dbefdb7ac4270"
VIEW1 = "STAGE2_CORR4_PILOT_ANALYTICAL_CODER_VIEW_SCHEMA_CORR1.json"

OBSOLETE_MATRIX1 = "STAGE2_CORR4_PILOT_ANALYTICAL_FIELD_SOURCE_MATRIX_CORR1.json"
OBSOLETE_MANIFEST = "STAGE2_CORR4_PILOT_LOCK_CORR1_MANIFEST.sha256"
MATRIX2_NAME = "STAGE2_CORR4_PILOT_ANALYTICAL_FIELD_SOURCE_MATRIX_CORR2.json"
GRANDPARENT_VIEW = "STAGE2_CORR4_PILOT_ANALYTICAL_CODER_VIEW_SCHEMA_CORR2_CORR1.json"
GRANDPARENT_PATH = "WORKBENCH/DOWNLOADS/" + GRANDPARENT_VIEW
PARENT_VIEW_PATH = "WORKBENCH/DOWNLOADS/" + PARENT_VIEW
PREDECESSOR_MANIFESTS = [
    "STAGE2_CORR4_PILOT_LOCK_CORR1_MANIFEST.sha256",
    "STAGE2_CORR4_PILOT_LOCK_CORR1_CORR2_MANIFEST.sha256",
    "STAGE2_CORR4_PILOT_LOCK_CORR1_CORR2_CORR1_MANIFEST.sha256",
    "STAGE2_CORR4_PILOT_LOCK_CORR1_CORR2_CORR1_CORR1_MANIFEST.sha256",
    "STAGE2_CORR4_PILOT_LOCK_CORR1_CORR2_CORR1_CORR2_MANIFEST.sha256",
]
# The view is FROZEN in this validator-only act: PI-6 legitimately names the parent act's
# manifest; that name is the current PI-6 SELF mechanism and is NOT a predecessor.
FROZEN_PI6_MANIFEST = "STAGE2_CORR4_PILOT_LOCK_CORR1_CORR2_CORR1_CORR2_CORR1_MANIFEST.sha256"

# Every coder-view artifact name in the lineage (for reference-containment scanning).
ALL_CODER_VIEW_BASENAMES = [
    "STAGE2_CORR4_PILOT_ANALYTICAL_CODER_VIEW_SCHEMA.json",
    "STAGE2_CORR4_PILOT_ANALYTICAL_CODER_VIEW_SCHEMA_CORR1.json",
    "STAGE2_CORR4_PILOT_ANALYTICAL_CODER_VIEW_SCHEMA_CORR2.json",
    "STAGE2_CORR4_PILOT_ANALYTICAL_CODER_VIEW_SCHEMA_CORR2_CORR1.json",
    "STAGE2_CORR4_PILOT_ANALYTICAL_CODER_VIEW_SCHEMA_CORR2_CORR1_CORR2.json",
    VIEW,
]

FROZEN = {
    "STAGE2_SEMANTIC_SUCCESSOR_CANDIDATE_CORR4.md":
        "2de49862fb0d63c5f1cd1745531199137e73b7b37abceecef6e735d497d38bb0",
    "STAGE2_CORR4_PILOT_ANALYTICAL_CODER_INPUT.jsonl":
        "a87409c3f4c1d7d097443233284bceee1cbed49c59e57a8aeb9eed651ff0c883",
    "STAGE2_CORR4_PILOT_SELECTED_SAMPLE.json":
        "ce9a2bd1d44103c2a527be767af3300e3d14d516518be774b15262e19ca5f702",
    "STAGE2_CORR4_PILOT_STAGE1_SOURCE_MAP.json":
        "665aac81c2e0127d08f0406186891959255391cb99ec34611a972209565f4a7f",
    "STAGE2_CORR4_PILOT_ANALYTICAL_PROVENANCE_SIDECAR_CORR1.jsonl":
        "84ab83d23209eae9f775844502676d462490ca8954f8d7a135d28acf5234d6af",
    "STAGE2_CORR4_PILOT_CASE34_BOUNDED_AUTHORITY_CORR1.md":
        "f756a802f6842c203c14142ecb8dc8a49ce6edfb9eec9fea85565b3f1c80b1fd",
    "STAGE2_CORR4_PILOT_RESULT_SCHEMA.json":
        "816f26cc616af20d9f9f54640acb426cbddd7698c1cf1a08c494e5e11674c12c",
    "STAGE2_CORR4_PILOT_ANALYTICAL_CODER_VIEW_SCHEMA_CORR1.json":
        "6f6f188a57ded4ffac43fc88d5b855c47d7bc40e235cba6341dd27f98f558bf1",
    "STAGE2_CORR4_PILOT_ANALYTICAL_FIELD_SOURCE_MATRIX_CORR1.json":
        "1cf26fc30e9f49c3a936afb7b64fa01396ffa20ffa80e596f1041768019b86a1",
}

CLOSURE_TAG = "SOURCECLASS_SENTENCE_BOUNDARY_EVIDENCE_INTEGRITY_CLOSURE_1_CORR1"
CLOSURE_FILES = [
    "MERGEVUE_SOURCECLASS_ASSIGNMENT_ADVERSARIAL_FIXTURES_v1.0_%s.json" % CLOSURE_TAG,
    "MERGEVUE_SOURCECLASS_ASSIGNMENT_CONTRACT_v1.0_%s_CANDIDATE.md" % CLOSURE_TAG,
    "MERGEVUE_SOURCECLASS_ASSIGNMENT_PILOT_DRYRUN_v1.0_%s.json" % CLOSURE_TAG,
    "MERGEVUE_SOURCECLASS_ASSIGNMENT_RULES_v1.0_%s_CANDIDATE.json" % CLOSURE_TAG,
    "MERGEVUE_SOURCECLASS_ASSIGNMENT_SCHEMA_v1.0_%s_CANDIDATE.json" % CLOSURE_TAG,
    "MERGEVUE_SOURCECLASS_ASSIGNMENT_%s_AUTHOR_REPORT.md" % CLOSURE_TAG,
    "MERGEVUE_SOURCECLASS_ASSIGNMENT_%s_CSI_PROOF.json" % CLOSURE_TAG,
    "MERGEVUE_SOURCECLASS_ASSIGNMENT_%s_EVIDENCE_BINDING_LEDGER.json" % CLOSURE_TAG,
    "MERGEVUE_SOURCECLASS_ASSIGNMENT_%s_MANIFEST.sha256" % CLOSURE_TAG,
    "MERGEVUE_SOURCECLASS_ASSIGNMENT_%s_PRESERVATION_PROOF.json" % CLOSURE_TAG,
    "MERGEVUE_SOURCECLASS_ASSIGNMENT_%s_SEMANTIC_DELTA_LEDGER.json" % CLOSURE_TAG,
    "MERGEVUE_SOURCECLASS_ASSIGNMENT_VALIDATE_v1.0_%s.py" % CLOSURE_TAG,
    "SOURCECLASS-SENTENCE-BOUNDARY-EVIDENCE-INTEGRITY-CLOSURE-1.CORR1.IV1_REPORT.md",
]
MANIFEST_SHA = "68a2af9ae32472d9e1229b339a0f1658f800d11fa550a7cf43ca0eaf59001e10"
IV_REPORT_SHA = "8daad06750499162a22493ebecc0d205dfb937c7e19fef9e5228f4b3e5df34de"
BOUNDARY_MODEL_SHA = "9c8011f743a76ca8b1bf94b699b54567d7f510bfb0e678a35f8f690f82a0c501"
PREREG_SHA = "8f66961799bddc8957b8f55f7376f9106af62ea775e55986b03c0e7c51cb15e6"

STATES = {
    "ASSIGNED",
    "OUTSIDE_FROZEN_VOCABULARY",
    "MULTIPLE_CLASS_PREDICATES_SATISFIED",
    "NOT_DETERMINABLE",
    "DUPLICATE_IDENTITY_UNRESOLVED",
}
BIND_KEYS = {
    "artifact", "act", "recordType", "bindingGrain",
    "caseId", "sideId", "factId", "sourceRefIndex", "sourceId",
    "bindingAuthority", "replayRecordId", "replayBindingStatus",
    "replayDuplicateIdentityState", "segmentAssignments", "sectionIFill",
}
SEG_KEYS = {
    "segmentId", "sourceClassAssignmentState", "sourceClass",
    "assignmentRuleId", "satisfiedClassIds", "occurrenceCorrespondence",
    "canonicalSegmentIdentity", "underlyingDocumentIdentity",
}

D_SINGLE_PREFIX = "SINGLE_ASSIGNED_SUPPORT:"
D_MIXED_PREFIX = "SEPARABLE_CLASS_BEARING_SUPPORT:"
D_OUT_PREFIX = "NO_ASSIGNED_SEGMENT: every segment of this supplying record is OUTSIDE_FROZEN_VOCABULARY"
D_DUP_PREFIX = "NO_ASSIGNED_SEGMENT: every segment of this supplying record is DUPLICATE_IDENTITY_UNRESOLVED"

PERMITTED_INPUT_TOP_KEYS = {"fields", "identityRule", "note"}
SLOT_IDS = ["PI-1", "PI-2", "PI-3", "PI-4", "PI-5", "PI-6", "PI-7"]
SLOT_SCHEMAS = {
    "PI-1": {"slotId", "name", "value", "path", "sha256", "authority", "note"},
    "PI-2": {"slotId", "name", "path", "sha256", "grain", "recordCount", "fields", "authority", "note"},
    "PI-3": {"slotId", "name", "path", "sha256", "grain", "recordCount", "supplies",
             "doesNotSupply", "authority", "note"},
    "PI-4": {"slotId", "name", "path", "sha256", "scope", "sourceAuthority", "supplies",
             "doesNotSupply", "supersessionRule", "authority"},
    "PI-5": {"slotId", "name", "path", "sha256", "note", "authority"},
    "PI-6": {"slotId", "name", "path", "sha256", "note", "authority"},
    "PI-7": {"slotId", "name", "path", "sha256", "grain", "supplies", "doesNotSupply",
             "authority", "note"},
}
EXPECTED_VISITED_KEYS = {
    "slotId", "name", "value", "path", "sha256", "authority", "note", "grain",
    "recordCount", "fields", "supplies", "doesNotSupply", "scope", "sourceAuthority",
    "supersessionRule", "identityRule", "transform",
}
PERMITTED_INPUT_CANONICAL_SHA256 = \
    "b9f4d6a91d73f240403fa978a3da7706fbf4f1877224c256bb71030905355f27"

FORBIDDEN_KEYS = {
    "environment", "environmentassignment", "environmentcode", "outcome",
    "realizedoutcome", "prediction", "predictionaccuracy", "ecs", "success",
    "failure", "peercoderresult", "stratificationmark", "stratumlabel",
    "sampledlabel", "selectionclass", "canonicalhash", "agreementrate",
    "disagreecount", "predictionseal",
}

PRES_TARGET = "TT-NFNT-PH-PR"
SI_LINE_INDEX = 1004
PL_GROUP_NAME = "presentation-lane execution control"
PL_MECHANICAL_RULE = "YES iff treeTargetIds[] contains TT-NFNT-PH-PR; otherwise NO"
PL_AUTHORITY = "CORR4 §F.3 PRES-LANE NON-CONSUMABILITY; §I"

# ---- CLOSED executionViewControl CONTRACT (E1/E2) ----
# Exact clean object, derived ONCE from the pinned view during authorship and hard-coded here.
# Never learned dynamically from the candidate being validated.
EVC_KEYS = {"controllingViewPath", "pi6MustResolveToControllingView", "deliveryCardinality",
            "supersededCoderViews", "futureCoderRule"}
EVC_CONTROLLING_VIEW_PATH = VIEW_PATH
EVC_PI6_MUST_RESOLVE = True
EVC_DELIVERY_CARDINALITY = "EXACTLY_ONE_CONTROLLING_CODER_VIEW"
EVC_SUPERSEDED_POLICY = "HISTORICAL_ONLY_NOT_DELIVERABLE"
EVC_FUTURE_CODER_RULE = ("ANALYTICAL_CODER_A and ANALYTICAL_CODER_B must receive this artifact as "
                         "the sole controlling analytical coder-view instruction. No superseded "
                         "coder-view artifact may be separately supplied as semantic or "
                         "instructional input.")
EVC_CANONICAL_SHA256 = "48289290b6ac0da480add8e34abe725beca3c4c7120750788dbd31106cd31f68"


def evc_canonical_sha(evc):
    return hashlib.sha256(json.dumps(evc, sort_keys=True, separators=(",", ":"),
                                     ensure_ascii=False).encode("utf-8")).hexdigest()


def normalize_field(token):
    t = token.strip()
    t = t.split(" where each entry")[0]
    t = t.split(" (")[0]
    t = t.split("{")[0]
    return t.strip().rstrip(".")


def extract_corr4_si_fields():
    line = (HERE / CORR4).read_text(encoding="utf-8").splitlines()[SI_LINE_INDEX]
    return [normalize_field(t) for t in (x.strip() for x in line.split("·"))]


def presentation_lane_rule(row):
    return "YES" if PRES_TARGET in row.get("treeTargetIds", []) else "NO"


def normalize_key(k):
    return re.sub(r"[^a-z0-9]", "", str(k).casefold())


def walk_forbidden_keys(node, path, findings):
    if isinstance(node, dict):
        for k, v in node.items():
            if normalize_key(k) in FORBIDDEN_KEYS:
                findings.append((path + "/" + str(k), str(k)))
            walk_forbidden_keys(v, path + "/" + str(k), findings)
    elif isinstance(node, list):
        for i, item in enumerate(node):
            walk_forbidden_keys(item, path + "[%d]" % i, findings)


RESULTS = []


def check(cid, name, ok, detail=""):
    RESULTS.append((cid, name, bool(ok), detail))
    return bool(ok)


def sha256_file(p):
    return hashlib.sha256(pathlib.Path(p).read_bytes()).hexdigest()


def git(args):
    return subprocess.run(["git", "-C", str(ROOT)] + args, capture_output=True, text=True).stdout


def load_jsonl(p):
    return [json.loads(l) for l in pathlib.Path(p).read_text(encoding="utf-8").splitlines() if l.strip()]


def canonical_permitted_input_sha(view_path):
    v = json.loads(pathlib.Path(view_path).read_text(encoding="utf-8"))
    canon = json.dumps(v["permittedInput"], sort_keys=True, separators=(",", ":"), ensure_ascii=False)
    return hashlib.sha256(canon.encode("utf-8")).hexdigest()


def read_manifest_members(manifest_path):
    members = {}
    mf = pathlib.Path(manifest_path)
    if mf.exists():
        for line in mf.read_text().splitlines():
            line = line.strip()
            if not line or line.startswith("#"):
                continue
            h, _, name = line.partition("  ")
            members[name] = h
    return members


def collect_strings(obj, acc):
    if isinstance(obj, dict):
        for v in obj.values():
            collect_strings(v, acc)
    elif isinstance(obj, list):
        for it in obj:
            collect_strings(it, acc)
    elif isinstance(obj, str):
        acc.add(obj)
    return acc


def canonical_physical_path(ref):
    """F1/F3: ONE canonical physical representation for ALL resolver set operations —
    the normalized absolute filesystem path. Repo-relative rendering is used only for
    human-readable report output; every comparison happens in this representation."""
    p = pathlib.Path(str(ref).strip())
    if not p.is_absolute():
        p = ROOT / p
    try:
        return p.resolve()
    except OSError:
        return p


def render_path(cp):
    """Human-readable rendering only; identity never uses this."""
    try:
        return str(pathlib.Path(cp).relative_to(ROOT))
    except ValueError:
        return str(cp)


# Every candidate .json reference inside a delivery-surface string, arbitrary names allowed,
# ALL matches enumerated (no stop at first match). .jsonl is excluded via the lookahead.
# Delimiters terminate a candidate: whitespace and JSON/punctuation brackets. Documented
# limitation: repo-absolute paths containing whitespace or parentheses cannot be extracted
# from an embedded string; relative and whitespace-free absolute references are covered.
JSON_REF_RE = re.compile("[^\\s\"',;:{}\\[\\]<>|]+\\.json(?![a-zA-Z0-9_])")


def extract_json_references(text):
    return JSON_REF_RE.findall(text)


def resolve_coder_view_reference(ref):
    """Resolve one candidate reference to an existing physical file (canonical path) or None."""
    cp = canonical_physical_path(ref)
    if cp.exists():
        return cp
    alt = canonical_physical_path("WORKBENCH/DOWNLOADS/" + pathlib.Path(str(ref).strip()).name)
    if alt.exists():
        return alt
    return None


def is_coder_view_file(p):
    """F2: content-based classification, independent of filename — a parsed analytical coder
    view carries both permittedInput and requiredCodingFields."""
    try:
        r = json.loads(pathlib.Path(p).read_text(encoding="utf-8"))
    except Exception:
        return False
    return isinstance(r, dict) and "permittedInput" in r and "requiredCodingFields" in r


def resolve_execution_view(view_path, manifest_path):
    """Independent mechanical resolver over structural declarations from BOTH permittedInput AND
    executionViewControl. PHYSICAL_CODER_VIEW_IDENTITY = (canonical_physical_path, sha256):
    different physical paths are different identities even when bytes are identical (F1).
    Every candidate .json reference in every delivery-surface string is enumerated (F2).
    Historical delivery is the intersection of canonical physical path sets (F3).
    Manifest authentication is reported separately and is NOT delivery."""
    v = json.loads(pathlib.Path(view_path).read_text(encoding="utf-8"))
    slots = {s["slotId"]: s for s in v["permittedInput"]["fields"]}
    evc = v.get("executionViewControl", {})
    pi6_path = slots["PI-6"].get("path")
    declared = evc.get("controllingViewPath")
    members = read_manifest_members(manifest_path)
    # declared controlling identities (canonical)
    declared_canon = set()
    for d in (declared, pi6_path):
        if d:
            declared_canon.add(str(canonical_physical_path(d)))
    controlling_count = len(declared_canon)
    controlling_file = None
    if controlling_count == 1:
        controlling_file = resolve_coder_view_reference(list(declared_canon)[0])
    pi6_ok = (controlling_count == 1 and controlling_file is not None
              and str(canonical_physical_path(pi6_path)) == str(canonical_physical_path(declared))
              and is_coder_view_file(controlling_file))
    manifest_ok = False
    if controlling_file is not None:
        manifest_ok = members.get(controlling_file.name) == sha256_file(controlling_file)
    # ---- F2 census: enumerate ALL .json references in ALL strings of BOTH delivery surfaces ----
    refs = set()
    collect_strings(v.get("permittedInput", {}), refs)
    collect_strings(evc, refs)
    census = {}
    for s in refs:
        for token in extract_json_references(s):
            f = resolve_coder_view_reference(token)
            if f is None or not is_coder_view_file(f):
                continue
            cp = canonical_physical_path(str(f))
            census[str(cp)] = cp
    identities = sorted((str(cp), sha256_file(cp)) for cp in census.values())
    inventories = set()
    for cp in census.values():
        r = json.loads(cp.read_text(encoding="utf-8"))
        inventories.add(json.dumps(r.get("requiredCodingFields", {}),
                                   sort_keys=True, separators=(",", ":"), ensure_ascii=False))
    # ---- F3: superseded delivery census in ONE canonical representation ----
    history = []
    cur = v.get("supersedes", {})
    seen = set()
    while cur and cur.get("artifact") and cur["artifact"] not in seen:
        seen.add(cur["artifact"])
        history.append(cur["artifact"])
        f = resolve_coder_view_reference(cur["artifact"])
        if f is None:
            break
        nxt = json.loads(f.read_text(encoding="utf-8")).get("supersedes", {})
        cur = nxt
    historical_physical_paths = set()
    for h in history:
        f = resolve_coder_view_reference(h)
        if f is not None:
            historical_physical_paths.add(str(canonical_physical_path(str(f))))
    deliverable_physical_paths = set(census.keys())
    superseded_delivered = sorted(
        render_path(cp) for cp in (deliverable_physical_paths & historical_physical_paths))
    manifest_view_identities = []
    for n, h in sorted(members.items()):
        if n.endswith(".json"):
            mf = HERE / n
            if mf.exists() and is_coder_view_file(mf):
                manifest_view_identities.append("%s %s" % (render_path(canonical_physical_path(str(mf))), h))
    ctrl_sha = sha256_file(controlling_file) if controlling_file is not None else None
    pi6_file = resolve_coder_view_reference(pi6_path) if pi6_path else None
    return {
        "CONTROLLING_EXECUTION_VIEW_COUNT": controlling_count,
        "CONTROLLING_EXECUTION_VIEW_PATH": declared,
        "PI6_RESOLVES_TO_CONTROLLING_VIEW": "YES" if pi6_ok else "NO",
        "CURRENT_MANIFEST_AUTHENTICATES_CONTROLLING_VIEW": "YES" if manifest_ok else "NO",
        "DELIVERABLE_CODER_VIEW_COUNT": len(census),
        "DELIVERABLE_CODER_VIEW_PATHS": sorted(render_path(cp) for cp in census.values()),
        "DELIVERABLE_CODER_VIEW_IDENTITIES": [(render_path(cp), sha) for cp, sha in identities],
        "DISTINCT_DELIVERABLE_VIEW_SHA_COUNT": len({sha for _, sha in identities}),
        "CONTROLLING_CODER_VIEW_SHA256": ctrl_sha,
        "PI6_CODER_VIEW_SHA256": sha256_file(pi6_file) if pi6_file is not None else None,
        "COMPETING_DELIVERABLE_CODER_VIEW_IDENTITY_COUNT": max(0, len(identities) - 1),
        "COMPETING_REQUIRED_CODING_INVENTORY_COUNT": max(0, len(inventories) - 1),
        "SUPERSEDED_VIEW_DELIVERABLE_COUNT": len(superseded_delivered),
        "SUPERSEDED_VIEW_DELIVERABLE_PATHS": superseded_delivered,
        "MANIFEST_CODER_VIEW_IDENTITIES": manifest_view_identities,
        "HISTORY": history,
    }


# ---------------------------------------------------------------- baseline + frozen + parents

def check_baseline():
    ok = (ROOT / ".git").exists() and (ROOT / "package.json").exists() \
        and (ROOT / "src").exists() and (ROOT / "api").exists() and (ROOT / "docs").exists()
    check("C01", "repository root resolved (git/package.json/src/api/docs present)", ok, str(ROOT))
    branch = git(["rev-parse", "--abbrev-ref", "HEAD"]).strip()
    head = git(["rev-parse", "HEAD"]).strip()
    check("C02", "branch main and HEAD %s" % EXPECTED_HEAD[:8],
          branch == "main" and head == EXPECTED_HEAD)
    check("C03", "no staged content", git(["diff", "--cached", "--name-only"]).strip() == "")


def check_frozen_and_parents():
    bad = []
    for name, exp in FROZEN.items():
        if sha256_file(HERE / name) != exp:
            bad.append(name)
    check("C04", "frozen pilot artifacts 9/9 SHA-256 exact", not bad, "; ".join(bad) or "all exact")
    deps = {VIEW: VIEW_SHA, BIND: BIND_SHA, MATRIX2: MATRIX2_SHA, CORR4: CORR4_SHA,
            PARENT_VIEW: PARENT_VIEW_SHA, PARENT_VALIDATE: PARENT_VALIDATE_SHA,
            PARENT_REPORT: PARENT_REPORT_SHA, PARENT_AUTHOR: PARENT_AUTHOR_SHA,
            PARENT_MANIFEST: PARENT_MANIFEST_SHA, PARENT_IV1: PARENT_IV1_SHA}
    bad = ["%s got=%s" % (n, sha256_file(HERE / n)[:8]) for n, e in deps.items()
           if sha256_file(HERE / n) != e]
    check("C05", "unchanged controlling view + all parent identities byte-identical", not bad,
          "; ".join(bad) or "10/10 exact")
    members, bad = [], []
    for line in (HERE / PARENT_MANIFEST).read_text().splitlines():
        line = line.strip()
        if not line or line.startswith("#"):
            continue
        h, _, name = line.partition("  ")
        members.append(name)
        if sha256_file(HERE / name) != h:
            bad.append(name)
    check("C06", "parent manifest members 4/4 SHA-exact (parent manifest unmutated)",
          len(members) == 4 and not bad)
    iv1 = (HERE / PARENT_IV1).read_text()
    check("C07", "parent IV1 identity: FAIL 0/3/0 (IV1-F1/F2/F3 physical-census findings)",
          "PILOT_LOCK_CORR1_CORR2_CORR1_CORR2_CORR1_CORR1_IV1_FAIL" in iv1
          and "BLOCKING = 0" in iv1 and "MAJOR = 3" in iv1 and "MINOR = 0" in iv1
          and "IV1-F1" in iv1 and "IV1-F2" in iv1 and "IV1-F3" in iv1)
    recs = load_jsonl(HERE / "STAGE2_CORR4_PILOT_ANALYTICAL_CODER_INPUT.jsonl")
    keys_ok = all(set(r.keys()) == {"factId", "caseId", "sideId", "factText"} for r in recs)
    ids = [(r["caseId"], r["sideId"], r["factId"]) for r in recs]
    check("C08", "coder input 30 records, exact key set, 30 unique identities",
          len(recs) == 30 and keys_ok and len(set(ids)) == 30)
    return recs, ids


def check_sidecar(ids):
    side = load_jsonl(HERE / "STAGE2_CORR4_PILOT_ANALYTICAL_PROVENANCE_SIDECAR_CORR1.jsonl")
    sids = [(s["caseId"], s["sideId"], s["factId"]) for s in side]
    check("C09a", "sidecar 30 records, exact bijection with coder input identities",
          len(side) == 30 and set(sids) == set(ids))
    tuples = []
    for s in side:
        for ref in s["sourceRefs"]:
            tuples.append((s["caseId"], s["sideId"], s["factId"], ref["refIndex"], ref["sourceId"]))
    check("C09b", "sidecar sourceRef universe = 32 tuple-unique sourceRefs",
          len(tuples) == 32 and len(set(tuples)) == 32)
    return side, tuples


def check_closure_package():
    tracked = set(git(["ls-files", "WORKBENCH/DOWNLOADS/"]).splitlines())
    missing = [f for f in CLOSURE_FILES if "WORKBENCH/DOWNLOADS/" + f not in tracked]
    check("C10", "final sourceClass package: 13/13 files Git-tracked", not missing)
    man = HERE / CLOSURE_FILES[8]
    check("C11a", "closure manifest SHA-256 exact", sha256_file(man) == MANIFEST_SHA)
    members, bad = [], []
    for line in man.read_text().splitlines():
        line = line.strip()
        if not line or line.startswith("#"):
            continue
        h, _, name = line.partition("  ")
        members.append(name)
        if sha256_file(HERE / name) != h:
            bad.append(name)
    check("C11b", "closure manifest members 11/11 SHA-exact", len(members) == 11 and not bad)
    check("C11c", "sourceClass IV1 report SHA-256 exact",
          sha256_file(HERE / CLOSURE_FILES[12]) == IV_REPORT_SHA)
    rules = json.loads((HERE / CLOSURE_FILES[3]).read_text())
    canon = json.dumps(rules["boundaryModel"], sort_keys=True, separators=(",", ":"), ensure_ascii=False)
    check("C12", "boundaryModel canonical SHA-256 exact",
          hashlib.sha256(canon.encode("utf-8")).hexdigest() == BOUNDARY_MODEL_SHA)
    dry = json.loads((HERE / CLOSURE_FILES[2]).read_text())
    check("C13", "dry-run pinned identities",
          dry["boundaryModelSha256"] == BOUNDARY_MODEL_SHA
          and dry["normativePreRegistration"]["preRegistrationSha256"] == PREREG_SHA)
    iv = (HERE / CLOSURE_FILES[12]).read_text()
    check("C14", "sourceClass IV1 verdict PASS / 0 / 1 ACCEPTED_RESIDUAL / 0 / pilot delta 0",
          "IV1 = PASS" in iv and "BLOCKING = 0" in iv and "MAJOR = 1" in iv
          and "ACCEPTED_RESIDUAL" in iv and "MINOR = 0" in iv and "Pilot delta = 0" in iv)
    t = dry["totals"]
    check("C15", "dry-run totals pinned (32 records / 61 segments / 8-4-49 / 30 facts)",
          t["records"] == 32 and t["segmentRecords"] == 61
          and t["byState"] == {"ASSIGNED": 8, "DUPLICATE_IDENTITY_UNRESOLVED": 4,
                               "OUTSIDE_FROZEN_VOCABULARY": 49}
          and t["byClass"] == {"access-rights/role matrices": 6, "compensation plans": 2}
          and t["distinctFactIds"] == 30 and t["rowsWithAnAssignedSegment"] == 8
          and t["rowsBound"] == 32)
    return dry


# ---------------------------------------------------------------- binding gates (inherited)

def binding_gates(bind_path, tuples, dry):
    bind = load_jsonl(bind_path)
    btuples = [(b["caseId"], b["sideId"], b["factId"], b["sourceRefIndex"], b["sourceId"]) for b in bind]
    r = {}
    r["count32"] = len(bind) == 32
    r["bijection"] = set(btuples) == set(tuples) and len(btuples) == len(set(btuples))
    r["keyset"] = all(set(b.keys()) == BIND_KEYS for b in bind)
    exp_auth = {
        "sourceClassClosure": "SOURCECLASS-SENTENCE-BOUNDARY-EVIDENCE-INTEGRITY-CLOSURE-1.CORR1",
        "boundaryModelSha256": BOUNDARY_MODEL_SHA,
        "normativePreRegistrationSha256": PREREG_SHA,
        "assignmentSurfaceArtifact": CLOSURE_FILES[2],
        "assignmentSurfaceSha256": sha256_file(HERE / CLOSURE_FILES[2]),
        "iv1Report": CLOSURE_FILES[12],
        "iv1ReportSha256": IV_REPORT_SHA,
        "iv1Verdict": "PASS", "iv1Blocking": 0, "iv1MajorAcceptedResidual": 1, "iv1Minor": 0,
        "gitTrackedAtHead": EXPECTED_HEAD,
        "contractIdentity": dry["records"][0]["contractIdentity"],
        "vocabularyVersion": dry["records"][0]["vocabularyVersion"],
    }
    r["authority"] = all(b["bindingAuthority"] == exp_auth for b in bind)
    by_tuple = {(x["caseId"], x["sideId"], x["factId"], x["sourceRefIndex"], x["sourceId"]): x
                for x in dry["records"]}
    eq, vocab, fill_ok = True, True, True
    for b in bind:
        x = by_tuple.get((b["caseId"], b["sideId"], b["factId"], b["sourceRefIndex"], b["sourceId"]))
        if x is None or b["replayRecordId"] != x["recordId"] \
                or b["replayBindingStatus"] != x["bindingStatus"] \
                or b["replayDuplicateIdentityState"] != x["computed"]["duplicateIdentityState"]["result"]:
            eq = False
            continue
        segs = x["computed"]["segments"]
        if len(segs) != len(b["segmentAssignments"]):
            eq = False
            continue
        for s, so in zip(segs, b["segmentAssignments"]):
            if set(so.keys()) != SEG_KEYS or any(so[k] != s[k] for k in SEG_KEYS):
                eq = False
            if so["sourceClassAssignmentState"] not in STATES \
                    or (so["sourceClass"] is None) == (so["sourceClassAssignmentState"] == "ASSIGNED"):
                vocab = False
        assigned = [s for s in b["segmentAssignments"] if s["sourceClassAssignmentState"] == "ASSIGNED"]
        classes = sorted({s["sourceClass"] for s in assigned})
        nona = [s for s in b["segmentAssignments"] if s["sourceClassAssignmentState"] != "ASSIGNED"]
        fill = b["sectionIFill"]
        if len(classes) == 1 and not nona:
            exp = ("ASSIGNED", classes[0], D_SINGLE_PREFIX)
        elif len(classes) == 1 and nona:
            exp = ("ASSIGNED", classes[0], D_MIXED_PREFIX)
        elif len(classes) == 0 and all(s["sourceClassAssignmentState"] == "OUTSIDE_FROZEN_VOCABULARY"
                                       for s in b["segmentAssignments"]):
            exp = ("OUTSIDE_FROZEN_VOCABULARY", None, D_OUT_PREFIX)
        elif len(classes) == 0 and all(s["sourceClassAssignmentState"] == "DUPLICATE_IDENTITY_UNRESOLVED"
                                       for s in b["segmentAssignments"]):
            exp = ("DUPLICATE_IDENTITY_UNRESOLVED", None, D_DUP_PREFIX)
        else:
            exp = None
        if exp is None or (fill["sourceClassAssignmentState"], fill["sourceClass"]) != (exp[0], exp[1]) \
                or not fill["derivation"].startswith(exp[2]):
            fill_ok = False
    r["replay-equality"] = eq
    r["state-vocabulary"] = vocab
    r["fill-consistency"] = fill_ok
    seg_states = Counter(s["sourceClassAssignmentState"] for b in bind for s in b["segmentAssignments"])
    fill_states = Counter(b["sectionIFill"]["sourceClassAssignmentState"] for b in bind)
    cls_counts = Counter(s["sourceClass"] for b in bind for s in b["segmentAssignments"]
                         if s["sourceClassAssignmentState"] == "ASSIGNED")
    r["aggregates"] = (seg_states == Counter({"OUTSIDE_FROZEN_VOCABULARY": 49, "ASSIGNED": 8,
                                              "DUPLICATE_IDENTITY_UNRESOLVED": 4})
                       and fill_states == Counter({"OUTSIDE_FROZEN_VOCABULARY": 20, "ASSIGNED": 8,
                                                   "DUPLICATE_IDENTITY_UNRESOLVED": 4})
                       and cls_counts == Counter({"access-rights/role matrices": 6,
                                                  "compensation plans": 2}))
    blob = pathlib.Path(bind_path).read_text(encoding="utf-8")
    r["leakage"] = not (any(cr["factText"] in blob for cr in load_jsonl(
        HERE / "STAGE2_CORR4_PILOT_ANALYTICAL_CODER_INPUT.jsonl"))
        or '"selectionClass"' in blob or '"environmentAssignment"' in blob
        or any(t in blob for t in ["NF/NT", "NT/STJ", "NT/STP", "NF/SFJ", "NF/SFP",
                                   "SFJ/SFP", "SFP/SFJ", "STJ/STP", "STP/STJ"]))
    return r, bind


def check_binding(tuples, dry):
    r, bind = binding_gates(HERE / BIND, tuples, dry)
    check("C16", "binding: 32 records, sourceRef bijection both directions (inherited)",
          r["count32"] and r["bijection"])
    check("C17", "binding: record key set exact (inherited)", r["keyset"])
    check("C18", "binding: bindingAuthority constants exact (inherited)", r["authority"])
    check("C19", "binding: 61/61 segments byte-equal to pinned surface (inherited)", r["replay-equality"])
    check("C20", "binding: five-state vocabulary and null-class rule (inherited)", r["state-vocabulary"])
    check("C21", "binding: 32/32 sectionIFill mechanically consistent (inherited)", r["fill-consistency"])
    check("C22", "binding: aggregates equal pinned totals (inherited)", r["aggregates"])
    check("C23", "binding: leakage census clean (inherited)", r["leakage"])


# ---------------------------------------------------------------- view gates

def view_gate_results(view_path, manifest_path, dry):
    v1 = json.loads((HERE / VIEW1).read_text())
    pv = json.loads((HERE / PARENT_VIEW).read_text())
    v = json.loads(pathlib.Path(view_path).read_text(encoding="utf-8"))
    slots = {s["slotId"]: s for s in v["permittedInput"]["fields"]}
    g = {}
    g["identity"] = (v["artifact"] == VIEW
                     and v["act"].endswith("PILOT-VERSION-LOCK-1.CORR1.CORR2.CORR1.CORR2.CORR1")
                     and v["supersedes"]["artifact"] == PARENT_VIEW
                     and v["supersedes"]["sha256"] == PARENT_VIEW_SHA
                     and "sourceClassBindingRule" in v and "sourceClassAssignmentRule" not in v)
    g["slots"] = (slots["PI-1"]["sha256"] == FROZEN["STAGE2_SEMANTIC_SUCCESSOR_CANDIDATE_CORR4.md"]
                  and slots["PI-2"]["sha256"] == FROZEN["STAGE2_CORR4_PILOT_ANALYTICAL_CODER_INPUT.jsonl"]
                  and slots["PI-3"]["sha256"] == FROZEN["STAGE2_CORR4_PILOT_ANALYTICAL_PROVENANCE_SIDECAR_CORR1.jsonl"]
                  and slots["PI-4"]["sha256"] == FROZEN["STAGE2_CORR4_PILOT_CASE34_BOUNDED_AUTHORITY_CORR1.md"]
                  and slots["PI-5"]["sha256"] == FROZEN["STAGE2_CORR4_PILOT_RESULT_SCHEMA.json"]
                  and slots["PI-7"]["sha256"] == BIND_SHA)
    g["seven-slots"] = len(slots) == 7 and "seven" in v["permittedInput"]["identityRule"]
    br = v["sourceClassBindingRule"]
    g["binding-rule"] = all(k in br for k in ("statement", "multiSourceRefRule",
                                              "precedenceOverSidecarNote", "authority")) \
        and "FORBIDDEN" in br["statement"] and "R-EDGE" in br["multiSourceRefRule"] \
        and "PI-7 controls the value" in br["precedenceOverSidecarNote"]
    g["required-fields-outputs"] = (v["requiredCodingFields"]["forbiddenOutputFields"]
                                    == v1["requiredCodingFields"]["forbiddenOutputFields"]
                                    and v["forbiddenInput"] == pv["forbiddenInput"])
    fa = v["firewallAssertions"]
    new_false = ["SOURCECLASS_RECLASSIFICATION_PERMITTED", "SOURCECLASS_FAIL_CLOSED_STATE_CONVERTED",
                 "SOURCECLASS_VOCABULARY_EXTENDED", "FACT_LEVEL_SOURCECLASS_FLATTENING_PERMITTED",
                 "SOURCECLASS_BINDING_MUTATED"]
    g["firewall"] = all(fa.get(k) is False for k in new_false) \
        and all(fa.get(k) == val for k, val in pv["firewallAssertions"].items())
    supplied_blob = json.dumps(v["permittedInput"])
    g["view-leakage"] = not any('"%s"' % k in supplied_blob
                                for k in ["selectionClass", "sampleDLabel", "stratumLabel",
                                          "environmentAssignment", "agreementRate"])
    m = json.loads((HERE / MATRIX2).read_text())
    rows = {f["FIELD"]: f for f in m["fields"]}
    sc = rows["sourceClass"]
    g["matrix"] = (m["artifact"] == MATRIX2 and m["act"].endswith("PILOT-VERSION-LOCK-1.CORR1.CORR2")
                   and sc["ASSIGNMENT_TYPE"] == "MECHANICAL"
                   and sc["SOURCE_SURFACE"] == ["sourceclass_binding", "exact_CORR4"]
                   and all(f.get("EXECUTABLE") == "YES" for f in m["fields"])
                   and len(m["fields"]) == 47)
    # inherited reference-integrity gates
    g["A-pi6-self-path"] = slots["PI-6"].get("path") == VIEW_PATH
    g["B-pi6-current-manifest"] = FROZEN_PI6_MANIFEST in str(slots["PI-6"].get("sha256", ""))
    view_sha = sha256_file(view_path)
    members = read_manifest_members(manifest_path)
    g["C-manifest-contains-view"] = members.get(VIEW) == view_sha
    g["D-resolvedby-exact"] = v["requiredCodingFields"].get("resolvedBy") == MATRIX2_NAME
    g["E-matrix-sha"] = sha256_file(HERE / MATRIX2) == MATRIX2_SHA
    g["F-resolvedby-not-obsolete"] = v["requiredCodingFields"].get("resolvedBy") != OBSOLETE_MATRIX1 \
        and OBSOLETE_MATRIX1 not in json.dumps(v["requiredCodingFields"])
    g["G-pi6-not-obsolete-manifest"] = OBSOLETE_MANIFEST not in json.dumps(slots["PI-6"])
    # inherited leakage protections N1-N4
    pi = v["permittedInput"]
    slot_list = pi["fields"]
    slot_ids = [s.get("slotId") for s in slot_list]
    n1 = set(pi.keys()) == PERMITTED_INPUT_TOP_KEYS and slot_ids == SLOT_IDS
    for s in slot_list:
        n1 = n1 and set(s.keys()) == SLOT_SCHEMAS.get(s.get("slotId"), set())
    visited = set()

    def visit(o):
        if isinstance(o, dict):
            for k, val in o.items():
                visited.add(k)
                visit(val)
        elif isinstance(o, list):
            for it in o:
                visit(it)
    visit(pi)
    g["N1-schema-detail"] = n1
    g["N1-key-universe"] = visited == EXPECTED_VISITED_KEYS
    g["N2-canonical-sha"] = canonical_permitted_input_sha(view_path) == PERMITTED_INPUT_CANONICAL_SHA256
    g["N2-computed"] = canonical_permitted_input_sha(view_path)
    findings = []
    walk_forbidden_keys(pi, "permittedInput", findings)
    g["N3-findings"] = findings
    fi_blob = json.dumps(v.get("forbiddenInput", {}))
    pi_blob = json.dumps(pi)
    g["N4-prose-present-but-not-flagged"] = (
        "environment" in fi_blob.lower() and "outcome" in fi_blob.lower()
        and "environment" in pi_blob.lower() and "outcome" in pi_blob.lower()
        and len(findings) == 0)
    # inherited presentation-lane gates P1-P4
    si_fields = extract_corr4_si_fields()
    g["SI_FIELDS"] = si_fields
    g["P1-si-count"] = len(si_fields) == 46 and len(set(si_fields)) == 46 \
        and "presentationLaneOnly" in si_fields
    rcf = v["requiredCodingFields"]
    grouped = []
    for grp in rcf["groups"]:
        for f in grp.get("fields", []):
            grouped.append((f, normalize_field(f), grp.get("group", "?")))
    norm_names = [n for _, n, _ in grouped]
    counts = Counter(norm_names)
    g["P1-coverage"] = (set(counts) == set(si_fields) | {"abstention"}
                        and all(c == 1 for c in counts.values())
                        and counts["presentationLaneOnly"] == 1 and counts["abstention"] == 1)
    g["P1-counts-meta"] = (rcf.get("sectionIFieldCount") == 46
                           and rcf.get("viewSchemaOnlyFieldCount") == 1
                           and rcf.get("fieldCount") == 47 and len(grouped) == 47)
    mrows = json.loads((HERE / MATRIX2).read_text())["fields"]
    m_si = {normalize_field(r["FIELD"]) for r in mrows if r.get("SECTION_I_FIELD") is True}
    m_non = [normalize_field(r["FIELD"]) for r in mrows if r.get("SECTION_I_FIELD") is not True]
    mm = json.loads((HERE / MATRIX2).read_text())
    g["P2-matrix-alignment"] = (m_si == set(si_fields) and m_non == ["abstention"]
                                and all(r.get("EXECUTABLE") == "YES" for r in mrows)
                                and mm["sectionIFieldCount"] == 46
                                and mm["viewSchemaOnlyFieldCount"] == 1 and mm["fieldCount"] == 47)
    pl_groups = [grp for grp in rcf["groups"] if grp.get("group") == PL_GROUP_NAME]
    g["P3-group-exists-once"] = len(pl_groups) == 1
    g["P3-group-shape"] = bool(pl_groups) and (
        pl_groups[0].get("fields") == ["presentationLaneOnly"]
        and pl_groups[0].get("allowedValues") == {"presentationLaneOnly": ["YES", "NO"]}
        and pl_groups[0].get("assignmentType") == "MECHANICAL"
        and pl_groups[0].get("mechanicalRule") == PL_MECHANICAL_RULE
        and pl_groups[0].get("authority") == PL_AUTHORITY)
    row_a = {"treeTargetIds": [PRES_TARGET], "presentationLaneOnly": "YES"}
    row_b = {"treeTargetIds": ["TT-SFPSFJ-DOC"], "presentationLaneOnly": "NO"}
    row_c = {"treeTargetIds": [PRES_TARGET], "presentationLaneOnly": "NO"}
    row_d = {"treeTargetIds": ["TT-SFPSFJ-DOC"], "presentationLaneOnly": "YES"}
    g["FIX-A"] = presentation_lane_rule(row_a) == "YES" == row_a["presentationLaneOnly"]
    g["FIX-B"] = presentation_lane_rule(row_b) == "NO" == row_b["presentationLaneOnly"]
    g["FIX-C-violation-detected"] = presentation_lane_rule(row_c) != row_c["presentationLaneOnly"]
    g["FIX-D-violation-detected"] = presentation_lane_rule(row_d) != row_d["presentationLaneOnly"]
    prcf = pv["requiredCodingFields"]
    g["P4-rcf-deep-equal"] = (rcf == prcf)
    g["P4-forbiddenOutputs-equal"] = rcf["forbiddenOutputFields"] == prcf["forbiddenOutputFields"]
    g["P4-parent-groups-preserved"] = (rcf["groups"] == prcf["groups"])
    # inherited single-view gates X1-X6
    evc = v.get("executionViewControl", {})
    res = resolve_execution_view(view_path, manifest_path)
    g["RESOLVER"] = res
    g["X1-outer-pi6-path-identity"] = VIEW_PATH == slots["PI-6"].get("path")
    g["X2-manifest-authenticates-view"] = members.get(VIEW) == sha256_file(view_path)
    g["X3-pi6-self-manifest-only"] = (FROZEN_PI6_MANIFEST in str(slots["PI-6"].get("sha256", ""))
                                      and not any(pm in json.dumps(slots["PI-6"])
                                                  for pm in PREDECESSOR_MANIFESTS))
    g["X4-single-controlling-view"] = (
        evc.get("controllingViewPath") == VIEW_PATH
        and slots["PI-6"].get("path") == VIEW_PATH
        and evc.get("pi6MustResolveToControllingView") is True
        and evc.get("deliveryCardinality") == EVC_DELIVERY_CARDINALITY
        and pathlib.Path(evc.get("controllingViewPath", "x")).name in members)
    g["X5-superseded-non-delivery"] = (
        evc.get("supersededCoderViews") == EVC_SUPERSEDED_POLICY
        and res["SUPERSEDED_VIEW_DELIVERABLE_COUNT"] == 0
        and res["DELIVERABLE_CODER_VIEW_COUNT"] == 1)
    g["X6-no-competing-inventory"] = (
        res["COMPETING_DELIVERABLE_CODER_VIEW_IDENTITY_COUNT"] == 0
        and res["COMPETING_REQUIRED_CODING_INVENTORY_COUNT"] == 0
        and res["CONTROLLING_EXECUTION_VIEW_COUNT"] == 1
        and res["PI6_RESOLVES_TO_CONTROLLING_VIEW"] == "YES")
    # ---- NEW E gates: closed EVC contract + physical identity resolution ----
    g["E1-evc-closed-schema"] = (set(evc.keys()) == EVC_KEYS
                                 and evc.get("controllingViewPath") == EVC_CONTROLLING_VIEW_PATH
                                 and evc.get("pi6MustResolveToControllingView") is EVC_PI6_MUST_RESOLVE
                                 and evc.get("deliveryCardinality") == EVC_DELIVERY_CARDINALITY
                                 and evc.get("supersededCoderViews") == EVC_SUPERSEDED_POLICY
                                 and evc_canonical_sha(evc) == EVC_CANONICAL_SHA256)
    g["E2-futurecoder-rule-exact"] = evc.get("futureCoderRule") == EVC_FUTURE_CODER_RULE
    g["E3-physical-identity"] = (
        res["DELIVERABLE_CODER_VIEW_COUNT"] == 1
        and res["DELIVERABLE_CODER_VIEW_PATHS"] == [VIEW_PATH]
        and res["CONTROLLING_CODER_VIEW_SHA256"] == view_sha
        and res["PI6_CODER_VIEW_SHA256"] == view_sha
        and res["COMPETING_DELIVERABLE_CODER_VIEW_IDENTITY_COUNT"] == 0
        and res["DISTINCT_DELIVERABLE_VIEW_SHA_COUNT"] == 1)
    return g, view_sha


def check_view(view_path, manifest_path, dry):
    g, view_sha = view_gate_results(view_path, manifest_path, dry)
    check("C24", "successor view identity: supersedes the CORR2_CORR1_CORR2 parent; binding rule "
                 "retained (inherited)", g["identity"])
    check("C25", "view slots PI-1..PI-5 frozen SHAs; PI-7 binding SHA exact (inherited)", g["slots"])
    check("C26", "view identityRule: seven byte-identical slots (inherited)", g["seven-slots"])
    check("C27", "view sourceClassBindingRule intact (inherited)", g["binding-rule"])
    check("C28", "view forbiddenOutputFields/forbiddenInput unchanged from parents (inherited)",
          g["required-fields-outputs"])
    check("C29", "view firewall assertions preserved + 5 sourceClass assertions false (inherited)",
          g["firewall"])
    check("C30", "view permitted inputs pass the inherited blacklist scan (inherited)", g["view-leakage"])
    check("C31", "matrix CORR2 dependency gates intact (inherited)", g["matrix"])
    check("A", "PI-6.path self-resolves to the successor view path (inherited)", g["A-pi6-self-path"])
    check("B", "PI-6 SHA mechanism names the current act-local manifest (inherited)",
          g["B-pi6-current-manifest"])
    check("C", "current manifest physically contains the actual SHA-256 of the controlling view "
                "(%s)" % view_sha[:12], g["C-manifest-contains-view"],
          "manifest entry: %s  %s" % (view_sha[:16], VIEW))
    check("D", "requiredCodingFields.resolvedBy equals exactly %s (inherited)" % MATRIX2_NAME,
          g["D-resolvedby-exact"])
    check("E", "SHA-256 of that matrix equals %s (inherited)" % MATRIX2_SHA[:12], g["E-matrix-sha"])
    check("F", "obsolete CORR1 matrix not in requiredCodingFields.resolvedBy (inherited)",
          g["F-resolvedby-not-obsolete"])
    check("G", "obsolete CORR1 lock manifest not in PI-6 (inherited)", g["G-pi6-not-obsolete-manifest"])
    check("N1", "CLOSED PERMITTED-INPUT STRUCTURE (inherited): literal frozen slot schemas, "
                "top-level keys, 17-key visited universe",
          g["N1-schema-detail"] and g["N1-key-universe"])
    check("N2", "CANONICAL PERMITTED-INPUT IDENTITY (inherited): equals the hard-pinned %s"
          % PERMITTED_INPUT_CANONICAL_SHA256[:12],
          g["N2-canonical-sha"], "computed=%s" % g["N2-computed"][:16])
    check("N3", "STRUCTURAL FORBIDDEN-PAYLOAD KEY GATE (inherited): zero forbidden supplied keys",
          not g["N3-findings"],
          "; ".join("%s at %s" % (k, p) for p, k in g["N3-findings"][:6]) or "no findings")
    check("N4", "PROSE PROTECTION (inherited): prohibition prose yields zero findings",
          g["N4-prose-present-but-not-flagged"])
    check("P1", "INVENTORY PROOF (inherited): CORR4 §I = 46 incl. presentationLaneOnly; grouped "
                "inventory 46 + abstention once; counts 46/1/47",
          g["P1-si-count"] and g["P1-coverage"] and g["P1-counts-meta"])
    check("P2", "MATRIX ALIGNMENT (inherited): 46/46 §I rows, abstention only extra, 47/47 "
                "executable, counts equal", g["P2-matrix-alignment"])
    check("P3", "PRESENTATION-LANE MECHANICAL RULE (inherited): group once, frozen rule, fixtures "
                "A/B consistent and C/D violations detected",
          g["P3-group-exists-once"] and g["P3-group-shape"] and g["FIX-A"] and g["FIX-B"]
          and g["FIX-C-violation-detected"] and g["FIX-D-violation-detected"])
    check("P4", "NO requiredCodingFields DELTA vs parent (inherited, deep-equal)",
          g["P4-rcf-deep-equal"] and g["P4-forbiddenOutputs-equal"] and g["P4-parent-groups-preserved"])
    res = g["RESOLVER"]
    check("X1", "OUTER/PI-6 PATH IDENTITY (inherited)", g["X1-outer-pi6-path-identity"])
    check("X2", "CURRENT MANIFEST IDENTITY (inherited)", g["X2-manifest-authenticates-view"])
    check("X3", "PI-6 SELF MANIFEST ONLY (inherited)", g["X3-pi6-self-manifest-only"])
    check("X4", "SINGLE CONTROLLING VIEW (inherited)", g["X4-single-controlling-view"])
    check("X5", "SUPERSEDED VIEW NON-DELIVERY (inherited, resolver-backed)",
          g["X5-superseded-non-delivery"])
    check("X6", "NO COMPETING INVENTORY OR IDENTITY (inherited, resolver-backed)",
          g["X6-no-competing-inventory"])
    check("E1", "CLOSED executionViewControl SCHEMA: exact key set %s, exact pinned values, "
                "canonical SHA %s; unknown keys and any value mutation FAIL"
          % (sorted(EVC_KEYS), EVC_CANONICAL_SHA256[:12]), g["E1-evc-closed-schema"])
    check("E2", "EXACT FUTURE-CODER-RULE: equals the pinned clean string (never mere key "
                "existence)", g["E2-futurecoder-rule-exact"])
    check("E3", "PHYSICAL DELIVERABLE-VIEW RESOLUTION: exactly one deliverable coder view "
                "(%s); controlling/PI-6 physical SHAs equal the view; "
                "COMPETING_DELIVERABLE_CODER_VIEW_IDENTITY_COUNT = 0" % VIEW,
          g["E3-physical-identity"])
    return view_sha, res


def check_git_after():
    out = git(["status", "--porcelain"])
    mutated = [l for l in out.splitlines() if l and not l.startswith("??")]
    check("C32", "no tracked file modified/staged; only new untracked act artifacts", not mutated)


# ---------------------------------------------------------------- full gate pipeline

def run_all_gates(view_path, manifest_path, tuples, dry, coder_recs):
    global RESULTS
    saved = RESULTS
    RESULTS = []
    try:
        check_baseline()
        _, ids = check_frozen_and_parents()
        check_sidecar(ids)
        r, _ = binding_gates(HERE / BIND, tuples, dry)
        for cid, name, ok in [
                ("C16", "binding bijection", r["count32"] and r["bijection"]),
                ("C17", "binding keyset", r["keyset"]),
                ("C18", "binding authority", r["authority"]),
                ("C19", "binding replay-equality", r["replay-equality"]),
                ("C20", "binding state-vocabulary", r["state-vocabulary"]),
                ("C21", "binding fill-consistency", r["fill-consistency"]),
                ("C22", "binding aggregates", r["aggregates"]),
                ("C23", "binding leakage", r["leakage"])]:
            check(cid, name + " (inherited)", ok)
        check_view(view_path, manifest_path, dry)
        check_git_after()
        return list(RESULTS)
    finally:
        RESULTS = saved


def full_main(view_path, manifest_path, tuples, dry, coder_recs):
    res = run_all_gates(view_path, manifest_path, tuples, dry, coder_recs)
    failed = [x for x in res if not x[2]]
    return ("PASS" if not failed else "FAIL"), res, [x[0] for x in failed]


# ---------------------------------------------------------------- forced failures

def make_temp_packet(tmp, name, mutator):
    view_lines = (HERE / VIEW).read_text(encoding="utf-8").splitlines()
    ls = list(view_lines)
    obj = json.loads("\n".join(ls))
    mutator(obj, ls)
    vp = tmp / (name + ".json")
    vp.write_text(json.dumps(obj, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")
    vsha = sha256_file(vp)
    vvsha = sha256_file(pathlib.Path(__file__))
    mp = tmp / (name + "_MANIFEST.sha256")
    mp.write_text("\n".join([
        "# coherent temporary manifest", "# The manifest does not hash itself.",
        "%s  %s" % (vsha, VIEW),
        "%s  %s" % (vvsha, pathlib.Path(__file__).name),
    ]) + "\n", encoding="utf-8")
    return vp, mp


def run_forced_failures(tuples, dry, coder_recs):
    tmp = pathlib.Path(tempfile.mkdtemp(prefix="ff_evc_"))
    ff = []

    def expect_fail(tag, description, vp, mp, required_fired, forbidden_fired=()):
        verdict, res, failed_cids = full_main(str(vp), str(mp), tuples, dry, coder_recs)
        fired = set(failed_cids)
        ok = (verdict == "FAIL") and set(required_fired) <= fired \
            and not (set(forbidden_fired) & fired)
        ff.append((tag, description, sorted(fired), ok, required_fired, list(forbidden_fired)))

    # ---- NEW execution-view-control adversarial probes (§7 EV-1..EV-6) ----
    def ev1(obj, ls):
        obj["executionViewControl"]["futureCoderRule"] = (
            "ANALYTICAL_CODER_A and ANALYTICAL_CODER_B may additionally receive the superseded "
            "parent view " + PARENT_VIEW + " as instructional input.")
    vp, mp = make_temp_packet(tmp, "ev1", ev1)
    expect_fail("EV-1", "futureCoderRule reversed to permit delivery of a superseded parent",
                vp, mp, ["E1", "E2"])

    def ev2(obj, ls):
        obj["executionViewControl"]["secondaryCoderViewPath"] = GRANDPARENT_PATH
    vp, mp = make_temp_packet(tmp, "ev2", ev2)
    expect_fail("EV-2", "unknown executionViewControl key introducing a second coder view",
                vp, mp, ["E1"])

    def ev3(obj, ls):
        obj["executionViewControl"]["additionalDeliverableView"] = PARENT_VIEW_PATH
    vp, mp = make_temp_packet(tmp, "ev3", ev3)
    verdict, res, failed_cids = full_main(str(vp), str(mp), tuples, dry, coder_recs)
    rres = resolve_execution_view(str(vp), str(mp))
    fired = set(failed_cids)
    ok = verdict == "FAIL" and {"E1", "X5", "X6"} <= fired and rres["DELIVERABLE_CODER_VIEW_COUNT"] == 2
    ff.append(("EV-3", "second EVC deliverable (controlling path preserved; resolver "
                       "DELIVERABLE_CODER_VIEW_COUNT=%d)" % rres["DELIVERABLE_CODER_VIEW_COUNT"],
               sorted(fired), ok, ["E1", "X5", "X6"], []))

    def ev4(obj, ls):
        shadow_dir = tmp / "ev4_shadow"
        shadow_dir.mkdir(exist_ok=True)
        shadow = json.loads((HERE / VIEW).read_text(encoding="utf-8"))
        shadow["artifact"] = "STAGE2_CORR4_PILOT_ANALYTICAL_CODER_VIEW_SCHEMA_CORR2_CORR1_CORR2_CORR1_SHADOW.json"
        sp = shadow_dir / shadow["artifact"]
        sp.write_text(json.dumps(shadow, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")
        obj["executionViewControl"]["secondaryDeliverableViewPath"] = str(sp)
    vp, mp = make_temp_packet(tmp, "ev4", ev4)
    verdict, res, failed_cids = full_main(str(vp), str(mp), tuples, dry, coder_recs)
    rres = resolve_execution_view(str(vp), str(mp))
    fired = set(failed_cids)
    ok = (verdict == "FAIL"
          and rres["DELIVERABLE_CODER_VIEW_COUNT"] == 2
          and rres["COMPETING_DELIVERABLE_CODER_VIEW_IDENTITY_COUNT"] >= 1
          and {"X5", "X6", "E3"} <= fired)
    ff.append(("EV-4", "identical-inventory second physical view made deliverable "
                       "(DELIVERABLE=%d, same rcf payload: inventory-competitors=%d, "
                       "identity-competitors=%d)"
               % (rres["DELIVERABLE_CODER_VIEW_COUNT"],
                  rres["COMPETING_REQUIRED_CODING_INVENTORY_COUNT"],
                  rres["COMPETING_DELIVERABLE_CODER_VIEW_IDENTITY_COUNT"]),
               sorted(fired), ok, ["X5", "X6", "E3"], []))

    def ev5(obj, ls):
        obj["executionViewControl"]["deliveryCardinality"] = "EXACTLY_TWO_CONTROLLING_CODER_VIEWS"
    vp, mp = make_temp_packet(tmp, "ev5", ev5)
    expect_fail("EV-5", "deliveryCardinality mutated away from EXACTLY_ONE_CONTROLLING_CODER_VIEW",
                vp, mp, ["E1", "X4"])

    def ev6(obj, ls):
        obj["executionViewControl"]["supersededCoderViews"] = "HISTORICAL_VIEWS_MAY_BE_DELIVERED"
    vp, mp = make_temp_packet(tmp, "ev6", ev6)
    expect_fail("EV-6", "historical-delivery policy mutated to permit delivery", vp, mp,
                ["E1", "X5"])

    # ---- retained single-view negatives (§10 A-F of the prior act) ----
    def na(obj, ls):
        for s in obj["permittedInput"]["fields"]:
            if s["slotId"] == "PI-6":
                s["path"] = PARENT_VIEW_PATH
    vp, mp = make_temp_packet(tmp, "na", na)
    expect_fail("N-A", "PI-6 path reverted to the parent view", vp, mp, ["X1", "X4", "X6"])

    def nb(obj, ls):
        for s in obj["permittedInput"]["fields"]:
            if s["slotId"] == "PI-6":
                s["sha256"] = "SELF (recorded in STAGE2_CORR4_PILOT_LOCK_CORR1_CORR2_CORR1_MANIFEST.sha256)"
    vp, mp = make_temp_packet(tmp, "nb", nb)
    expect_fail("N-B", "PI-6 SELF string reverted to the parent manifest", vp, mp, ["B", "X3"])

    def nc(obj, ls):
        obj["executionViewControl"]["controllingViewPath"] = PARENT_VIEW_PATH
    vp, mp = make_temp_packet(tmp, "nc", nc)
    expect_fail("N-C", "executionViewControl.controllingViewPath points to the parent", vp, mp,
                ["E1", "X4", "X6"])

    def nd(obj, ls):
        for s in obj["permittedInput"]["fields"]:
            if s["slotId"] == "PI-6":
                s["supplementaryCoderView"] = GRANDPARENT_PATH
    vp, mp = make_temp_packet(tmp, "nd", nd)
    expect_fail("N-D", "parent view added as a second deliverable coder-view instruction", vp, mp,
                ["X5", "X6"])

    def ne(obj, ls):
        for s in obj["permittedInput"]["fields"]:
            if s["slotId"] == "PI-6":
                s["path"] = GRANDPARENT_PATH
    vp, mp = make_temp_packet(tmp, "ne", ne)
    expect_fail("N-E", "outer successor valid but PI-6 resolves to a different (older) view",
                vp, mp, ["X1", "X4", "X6"])

    def nf(obj, ls):
        obj["requiredCodingFields"]["groups"] = [
            g2 for g2 in obj["requiredCodingFields"]["groups"]
            if g2.get("group") != PL_GROUP_NAME]
        obj["requiredCodingFields"]["fieldCount"] = 46
        obj["requiredCodingFields"]["sectionIFieldCount"] = 45
    vp, mp = make_temp_packet(tmp, "nf", nf)
    expect_fail("N-F", "requiredCodingFields regressed to remove presentationLaneOnly", vp, mp,
                ["P1", "P3", "P4"])

    # ---- retained leakage + inventory negatives ----
    def r_outcome(obj, ls):
        for s in obj["permittedInput"]["fields"]:
            if s["slotId"] == "PI-7":
                s["outcome"] = {"realizedOutcome": "POST_T0_SUCCESS"}
    vp, mp = make_temp_packet(tmp, "r_outcome", r_outcome)
    expect_fail("FF-OUTCOME", "outcome payload injected into PI-7", vp, mp, ["N1", "N2", "N3"])

    def r_env(obj, ls):
        for s in obj["permittedInput"]["fields"]:
            if s["slotId"] == "PI-7":
                s["environment"] = "NF/NT"
    vp, mp = make_temp_packet(tmp, "r_env", r_env)
    expect_fail("FF-ENVIRONMENT", "environment value injected into PI-7", vp, mp, ["N1", "N2", "N3"])

    def r_realized(obj, ls):
        for s in obj["permittedInput"]["fields"]:
            if s["slotId"] == "PI-7":
                s["realizedOutcome"] = "POST_T0_SUCCESS"
    vp, mp = make_temp_packet(tmp, "r_realized", r_realized)
    expect_fail("FF-REALIZED-OUTCOME", "realizedOutcome injected into PI-7", vp, mp,
                ["N1", "N2", "N3"])

    def r_unknown(obj, ls):
        for s in obj["permittedInput"]["fields"]:
            if s["slotId"] == "PI-7":
                s["codingHint"] = "supplementary coder guidance"
    vp, mp = make_temp_packet(tmp, "r_unknown", r_unknown)
    expect_fail("FF-UNKNOWN-SLOT-KEY", "innocuous new supplied key injected into PI-7", vp, mp,
                ["N1", "N2"], forbidden_fired=("N3",))

    def r_valmut(obj, ls):
        for s in obj["permittedInput"]["fields"]:
            if s["slotId"] == "PI-1":
                s["value"] = "the exact CORR4 bytess"
    vp, mp = make_temp_packet(tmp, "r_valmut", r_valmut)
    expect_fail("FF-EXISTING-VALUE-MUTATION", "existing permittedInput value mutated without a new "
                                               "key", vp, mp, ["N2"], forbidden_fired=("N1",))

    def r_plrule(obj, ls):
        for g2 in obj["requiredCodingFields"]["groups"]:
            if g2.get("group") == PL_GROUP_NAME:
                g2["mechanicalRule"] = "YES iff the coder judges the lane present"
    vp, mp = make_temp_packet(tmp, "r_plrule", r_plrule)
    expect_fail("FF-PL-RULE-MUTATION", "frozen presentationLaneOnly mechanical rule mutated",
                vp, mp, ["P3"])

    # ---- kept reference-integrity negatives ----
    def k_obs(obj, ls):
        for s in obj["permittedInput"]["fields"]:
            if s["slotId"] == "PI-6":
                s["sha256"] = "SELF (recorded in %s)" % OBSOLETE_MANIFEST
    vp, mp = make_temp_packet(tmp, "k_obs", k_obs)
    expect_fail("FF-OBSOLETE-MANIFEST", "PI-6 SELF string regressed to the obsolete CORR1 manifest",
                vp, mp, ["B", "X3", "G"])

    def k_resolvedby(obj, ls):
        obj["requiredCodingFields"]["resolvedBy"] = OBSOLETE_MATRIX1
    vp, mp = make_temp_packet(tmp, "k_resolvedby", k_resolvedby)
    expect_fail("FF-RESOLVEDBY", "resolvedBy regressed to the CORR1 matrix", vp, mp, ["D", "F", "P4"])

    vp, mp = make_temp_packet(tmp, "k_manhash", lambda obj, ls: None)
    ls = mp.read_text().splitlines()
    vsha = sha256_file(vp)
    for i, l in enumerate(ls):
        if l.startswith(vsha):
            ls[i] = ("0" * 64) + l[64:]
    mp.write_text("\n".join(ls) + "\n", encoding="utf-8")
    expect_fail("FF-MANIFEST-HASH", "view hash mutated inside the coherent manifest", vp, mp, ["C", "X2"])

    def k_pi7(obj, ls):
        for s in obj["permittedInput"]["fields"]:
            if s["slotId"] == "PI-7":
                s["sha256"] = "1" * 64
    vp, mp = make_temp_packet(tmp, "k_pi7", k_pi7)
    expect_fail("FF-PI7-SHA", "PI-7 sourceClass binding SHA mutated", vp, mp, ["C25"])

    def k_selclass(obj, ls):
        for s in obj["permittedInput"]["fields"]:
            if s["slotId"] == "PI-7":
                s["selectionClass"] = "D-07"
    vp, mp = make_temp_packet(tmp, "k_selclass", k_selclass)
    verdict, res, failed_cids = full_main(str(vp), str(mp), tuples, dry, coder_recs)
    ok_a = verdict == "FAIL" and "C30" in set(failed_cids)
    blines = (HERE / BIND).read_text(encoding="utf-8").splitlines()
    bp = tmp / "k_bind.jsonl"
    ls = list(blines)
    ls[0] = ls[0].replace('"recordType": "ANALYTICAL_SOURCECLASS_BINDING_CORR2",',
                          '"recordType": "ANALYTICAL_SOURCECLASS_BINDING_CORR2", '
                          '"environmentAssignment": "NF/NT",')
    bp.write_text("\n".join(ls) + "\n", encoding="utf-8")
    r, _ = binding_gates(bp, tuples, dry)
    fired_b = [k for k in ("keyset", "leakage") if not r[k]]
    ff.append(("FF-SELECTION-ENV", "selectionClass (view) / environmentAssignment (binding)",
               sorted(set(failed_cids)) + fired_b, bool(ok_a and fired_b),
               ["C30", "keyset", "leakage"], []))

    # ---- NEW physical-census fixtures (section 7 F1/F2/F3) ----
    aux_dir = tmp / "census"
    aux_dir.mkdir(exist_ok=True)

    def make_aux_view(name):
        aux = {
            "artifact": name,
            "permittedInput": {"note": "auxiliary coder-view instruction surface (fixture)"},
            "requiredCodingFields": {"note": "fixture inventory", "fieldCount": 0},
        }
        ap = aux_dir / name
        ap.write_text(json.dumps(aux, indent=2) + "\n", encoding="utf-8")
        return ap

    # F1-PROBE: exact byte copy of the controlling view at a second physical path
    def f1(obj, ls):
        copy_path = aux_dir / VIEW
        copy_path.write_bytes((HERE / VIEW).read_bytes())
        obj["executionViewControl"]["copyDeliverableViewPath"] = str(copy_path)
    vp, mp = make_temp_packet(tmp, "f1", f1)
    verdict, res, failed_cids = full_main(str(vp), str(mp), tuples, dry, coder_recs)
    rres = resolve_execution_view(str(vp), str(mp))
    fired = set(failed_cids)
    ok = (verdict == "FAIL"
          and rres["DELIVERABLE_CODER_VIEW_COUNT"] == 2
          and rres["COMPETING_DELIVERABLE_CODER_VIEW_IDENTITY_COUNT"] == 1
          and rres["COMPETING_REQUIRED_CODING_INVENTORY_COUNT"] == 0
          and rres["DISTINCT_DELIVERABLE_VIEW_SHA_COUNT"] == 1
          and {"X5", "X6", "E3"} <= fired)
    ff.append(("F1-PROBE", "same bytes at a second physical path, both deliverable "
                           "(DELIVERABLE=%d, sha-distinct=%d, identity-competitors=%d, "
                           "inventory-competitors=%d)"
               % (rres["DELIVERABLE_CODER_VIEW_COUNT"],
                  rres["DISTINCT_DELIVERABLE_VIEW_SHA_COUNT"],
                  rres["COMPETING_DELIVERABLE_CODER_VIEW_IDENTITY_COUNT"],
                  rres["COMPETING_REQUIRED_CODING_INVENTORY_COUNT"]),
               sorted(fired), ok, ["X5", "X6", "E3"], []))

    # F2-A: arbitrary-name coder view embedded inside ONE executionViewControl string
    def f2a(obj, ls):
        ap = make_aux_view("auxiliary_instruction.json")
        obj["executionViewControl"]["deliveryNote"] = (
            "auxiliary delivery surface: " + str(ap))
    vp, mp = make_temp_packet(tmp, "f2a", f2a)
    verdict, res, failed_cids = full_main(str(vp), str(mp), tuples, dry, coder_recs)
    rres = resolve_execution_view(str(vp), str(mp))
    fired = set(failed_cids)
    ok = (verdict == "FAIL" and rres["DELIVERABLE_CODER_VIEW_COUNT"] == 2
          and rres["COMPETING_DELIVERABLE_CODER_VIEW_IDENTITY_COUNT"] >= 1
          and {"X5", "X6"} <= fired)
    ff.append(("F2-A", "arbitrary-name .json coder view embedded in one executionViewControl "
                       "string (DELIVERABLE=%d)" % rres["DELIVERABLE_CODER_VIEW_COUNT"],
               sorted(fired), ok, ["X5", "X6"], []))

    # F2-B: the same arbitrary-name path embedded inside an existing permittedInput string field
    def f2b(obj, ls):
        ap = make_aux_view("auxiliary_instruction.json")
        for s in obj["permittedInput"]["fields"]:
            if s["slotId"] == "PI-6":
                s["note"] = s["note"] + " Auxiliary delivery surface: " + str(ap)
    vp, mp = make_temp_packet(tmp, "f2b", f2b)
    verdict, res, failed_cids = full_main(str(vp), str(mp), tuples, dry, coder_recs)
    rres = resolve_execution_view(str(vp), str(mp))
    fired = set(failed_cids)
    ok = (verdict == "FAIL" and rres["DELIVERABLE_CODER_VIEW_COUNT"] == 2
          and rres["COMPETING_DELIVERABLE_CODER_VIEW_IDENTITY_COUNT"] >= 1
          and {"X5", "X6"} <= fired)
    ff.append(("F2-B", "arbitrary-name .json coder view embedded in an existing permittedInput "
                       "string field (DELIVERABLE=%d)" % rres["DELIVERABLE_CODER_VIEW_COUNT"],
               sorted(fired), ok, ["X5", "X6"], []))

    # F2-C: TWO distinct .json coder-view references inside ONE delivery-surface string
    def f2c(obj, ls):
        a1 = make_aux_view("aux_one.json")
        a2 = make_aux_view("aux_two.json")
        obj["executionViewControl"]["deliveryNote"] = (
            "delivered together: " + str(a1) + " and also " + str(a2))
    vp, mp = make_temp_packet(tmp, "f2c", f2c)
    verdict, res, failed_cids = full_main(str(vp), str(mp), tuples, dry, coder_recs)
    rres = resolve_execution_view(str(vp), str(mp))
    fired = set(failed_cids)
    ok = (verdict == "FAIL" and rres["DELIVERABLE_CODER_VIEW_COUNT"] == 3
          and rres["COMPETING_DELIVERABLE_CODER_VIEW_IDENTITY_COUNT"] >= 2
          and {"X5", "X6"} <= fired)
    ff.append(("F2-C", "two distinct .json coder-view references inside ONE string, both "
                       "enumerated (DELIVERABLE=%d)" % rres["DELIVERABLE_CODER_VIEW_COUNT"],
               sorted(fired), ok, ["X5", "X6"], []))

    # F3-A: make a superseded parent view structurally deliverable
    def f3a(obj, ls):
        obj["executionViewControl"]["legacyDeliverableView"] = PARENT_VIEW_PATH
    vp, mp = make_temp_packet(tmp, "f3a", f3a)
    verdict, res, failed_cids = full_main(str(vp), str(mp), tuples, dry, coder_recs)
    rres = resolve_execution_view(str(vp), str(mp))
    fired = set(failed_cids)
    ok = (verdict == "FAIL" and rres["SUPERSEDED_VIEW_DELIVERABLE_COUNT"] >= 1
          and {"X5", "X6"} <= fired)
    ff.append(("F3-A", "superseded parent view made structurally deliverable "
                       "(SUPERSEDED_VIEW_DELIVERABLE_COUNT=%d, paths=%s)"
               % (rres["SUPERSEDED_VIEW_DELIVERABLE_COUNT"],
                  rres["SUPERSEDED_VIEW_DELIVERABLE_PATHS"]),
               sorted(fired), ok, ["X5", "X6"], []))

    # F3-B: grandparent/history view under a non-path supplied key
    def f3b(obj, ls):
        for s in obj["permittedInput"]["fields"]:
            if s["slotId"] == "PI-6":
                s["legacySurface"] = (
                    "historical instruction surface retained for audit: " + GRANDPARENT_VIEW)
    vp, mp = make_temp_packet(tmp, "f3b", f3b)
    verdict, res, failed_cids = full_main(str(vp), str(mp), tuples, dry, coder_recs)
    rres = resolve_execution_view(str(vp), str(mp))
    fired = set(failed_cids)
    ok = (verdict == "FAIL" and rres["SUPERSEDED_VIEW_DELIVERABLE_COUNT"] >= 1
          and {"X5", "X6"} <= fired)
    ff.append(("F3-B", "grandparent/history view delivered under a non-path supplied key "
                       "(SUPERSEDED_VIEW_DELIVERABLE_COUNT=%d, paths=%s)"
               % (rres["SUPERSEDED_VIEW_DELIVERABLE_COUNT"],
                  rres["SUPERSEDED_VIEW_DELIVERABLE_PATHS"]),
               sorted(fired), ok, ["X5", "X6"], []))

    shutil.rmtree(tmp, ignore_errors=True)
    return ff


# ---------------------------------------------------------------- main

def main():
    write_report = "--write-report" in sys.argv
    coder_recs, ids = check_frozen_and_parents()
    side, tuples = check_sidecar(ids)
    dry = check_closure_package()
    check_binding(tuples, dry)
    view_sha, res = check_view(HERE / VIEW, HERE / NEW_MANIFEST, dry)
    check_git_after()

    ff = run_forced_failures(tuples, dry, coder_recs)
    ff_ok = all(entry[3] for entry in ff) and len(ff) == 29

    total = len(RESULTS)
    passed = sum(1 for _, _, ok, _ in RESULTS if ok)
    failed = total - passed
    verdict = "PASS" if failed == 0 and ff_ok else "FAIL"

    lines = []
    lines.append("STAGE2_CORR4_PILOT_LOCK_CORR1_CORR2_CORR1_CORR2_CORR1_CORR1_CORR1_VALIDATION_REPORT")
    lines.append("Act: POST-10-CALIBRATION-STAGE2-TREE-BOUND-DISCRIMINATOR-AND-MECHANISM-MEASUREMENT-"
                 "CONTRACT-1.PILOT-VERSION-LOCK-1.CORR1.CORR2.CORR1.CORR2.CORR1.CORR1")
    lines.append("Scope: PHYSICAL CODER-VIEW CENSUS CORRECTION closing IV1-F1/F2/F3 (validator-only). The "
                 "controlling view %s and its canonical permittedInput SHA %s are UNCHANGED."
                 % (VIEW_SHA, PERMITTED_INPUT_CANONICAL_SHA256))
    lines.append("Role: ANALYST (author-side mechanical gate). NOT independent verification. "
                 "NOT Owner acceptance.")
    lines.append("")
    lines.append("RESULT: TOTAL %d / PASS %d / FAIL %d ; VERDICT %s" % (total, passed, failed, verdict))
    lines.append("FORCED FAILURES: %d injected on temporary copies (23 retained + 6 new census probes); "
                 "detected %d/%d -> %s"
                 % (len(ff), sum(1 for entry in ff if entry[3]), len(ff),
                    "OK" if ff_ok else "INCOMPLETE"))
    lines.append("")
    lines.append("PACKET RESOLUTION (independent structural resolver over BOTH permittedInput and "
                 "executionViewControl; physical identities; authentication != delivery):")
    for k in ("CONTROLLING_EXECUTION_VIEW_COUNT", "CONTROLLING_EXECUTION_VIEW_PATH",
              "PI6_RESOLVES_TO_CONTROLLING_VIEW", "CURRENT_MANIFEST_AUTHENTICATES_CONTROLLING_VIEW",
              "DELIVERABLE_CODER_VIEW_COUNT", "DELIVERABLE_CODER_VIEW_PATHS",
              "DELIVERABLE_CODER_VIEW_IDENTITIES", "DISTINCT_DELIVERABLE_VIEW_SHA_COUNT",
              "CONTROLLING_CODER_VIEW_SHA256", "PI6_CODER_VIEW_SHA256",
              "MANIFEST_CODER_VIEW_IDENTITIES",
              "COMPETING_DELIVERABLE_CODER_VIEW_IDENTITY_COUNT",
              "COMPETING_REQUIRED_CODING_INVENTORY_COUNT",
              "SUPERSEDED_VIEW_DELIVERABLE_COUNT", "SUPERSEDED_VIEW_DELIVERABLE_PATHS"):
        lines.append("  %s = %s" % (k, res[k]))
    lines.append("  SINGLE_CONTROLLING_EXECUTION_VIEW = %s"
                 % ("PASS" if (res["CONTROLLING_EXECUTION_VIEW_COUNT"] == 1
                               and res["DELIVERABLE_CODER_VIEW_COUNT"] == 1
                               and res["COMPETING_DELIVERABLE_CODER_VIEW_IDENTITY_COUNT"] == 0
                               and res["SUPERSEDED_VIEW_DELIVERABLE_COUNT"] == 0
                               and res["COMPETING_REQUIRED_CODING_INVENTORY_COUNT"] == 0
                               and res["PI6_RESOLVES_TO_CONTROLLING_VIEW"] == "YES") else "FAIL"))
    lines.append("")
    for cid, name, ok, detail in RESULTS:
        lines.append("[%s] %s -> %s%s" % (cid, name, "PASS" if ok else "FAIL",
                                          (" | " + detail) if detail else ""))
    lines.append("")
    lines.append("FORCED-FAILURE DETAIL (temporary copies under /private/tmp only; every view "
                 "mutation ships with a COHERENT temporary manifest):")
    for tag, what, fired, ok, req, forb in ff:
        lines.append("%s forced failure %s -> full main verdict checks fired: %s -> %s"
                     % (tag, what, fired or "NONE", "DETECTED" if ok else "NOT DETECTED"))
    lines.append("")
    lines.append("Closed executionViewControl contract constants (hard-pinned): keys=%s; "
                 "deliveryCardinality=%s; supersededCoderViews=%s; futureCoderRule pinned exact "
                 "(canonical EVC SHA %s)" % (sorted(EVC_KEYS), EVC_DELIVERY_CARDINALITY,
                                             EVC_SUPERSEDED_POLICY, EVC_CANONICAL_SHA256[:12]))
    lines.append("Unchanged controlling view SHA-256: %s  %s" % (view_sha, VIEW))
    lines.append("Unchanged canonical permittedInput SHA-256: %s"
                 % PERMITTED_INPUT_CANONICAL_SHA256)
    lines.append("Parent dependencies re-verified during this run:")
    for name in (BIND, MATRIX2, CORR4, PARENT_VIEW, PARENT_VALIDATE, PARENT_REPORT, PARENT_AUTHOR,
                 PARENT_MANIFEST, PARENT_IV1):
        lines.append("  %s  %s" % (sha256_file(HERE / name), name))
    lines.append("")
    lines.append("Frozen pilot identities re-verified during this run:")
    for name, exp in FROZEN.items():
        lines.append("  %s  %s" % (sha256_file(HERE / name), name))
    lines.append("")
    lines.append("Validator file SHA-256 (self, runtime): %s" % sha256_file(pathlib.Path(__file__)))
    lines.append("")
    lines.append("Terminal state of the author act: "
                 "PILOT_LOCK_CORR1_CORR2_CORR1_CORR2_CORR1_CORR1_CORR1_"
                 "PHYSICAL_CENSUS_READY_FOR_IV1" if verdict == "PASS" else "")
    report = "\n".join(lines) + "\n"
    print(report)
    if write_report:
        (HERE / "STAGE2_CORR4_PILOT_LOCK_CORR1_CORR2_CORR1_CORR2_CORR1_CORR1_CORR1_VALIDATION_REPORT.txt"
         ).write_text(report, encoding="utf-8")
    sys.exit(0 if verdict == "PASS" else 1)


if __name__ == "__main__":
    main()
