#!/usr/bin/env python3
"""Validate the current status JSON; render its complete Markdown projection.

Read-only by default. --render writes only the canonical Markdown file.
No scientific code, provider calls, or governance status transitions are executed.
"""

import argparse
from collections import Counter
import hashlib
import json
from pathlib import Path
import re
import sys

ROOT = Path(__file__).resolve().parents[1]
JSON_PATH = ROOT / "docs/governance/MERGEVUE_CONTROL_TREE_CURRENT.json"
MD_PATH = JSON_PATH.with_suffix(".md")
LABELS = {
    "COMPLETE": "✅ COMPLETE",
    "PARTIAL": "◐ PARTIAL",
    "ACCEPTED_DEFINITION_ONLY": "☑️ ACCEPTED_DEFINITION_ONLY",
    "OPEN_OR_CANDIDATE": "🟠 OPEN_OR_CANDIDATE",
    "NOT_STARTED": "⬜ NOT_STARTED",
    "BLOCKED_OR_REJECTED": "⛔ BLOCKED_OR_REJECTED",
}
ACCEPTED = {
    "OWNER_ACCEPTED", "OWNER_ACCEPTED_RESIDUALS",
    "ACCEPTED_BY_OWNER_DESIGNATED_USE", "OWNER_ACCEPTED_ARCHITECTURE_ONLY",
    "OWNER_ACCEPTED_SEMANTICS_ONLY",
}
FORBIDDEN = re.compile(r"sales[\s_\-]*product|investor[\s_\-]*(?:demo|demonstration|access)|fundraising|инвесторск\w*\s+(?:демонстрац|доступ)|продукт\w*\s+для\s+инвестор", re.I)
LEGACY_TREE = re.compile(r"MERGEVUE_CONTROL_TREE_(?!CURRENT\.(?:json|md))|Control[ _-]+Tree\s+v\d|прежни\w*\s+Control\s+Tree", re.I)


def validate_text(text):
    if FORBIDDEN.search(text):
        raise ValueError("forbidden project content")
    if LEGACY_TREE.search(text):
        raise ValueError("legacy tree reference")


def validate(data):
    nodes = data["nodes"]
    ids = [n["id"] for n in nodes]
    if len(ids) != len(set(ids)):
        raise ValueError("duplicate node IDs")
    by_id = {n["id"]: n for n in nodes}
    if "B5.4" in by_id or "B5.6" in by_id:
        raise ValueError("archival/correction-only nodes must not be restored")
    groups = {g["id"] for g in data["branches"]}
    if len(groups) != len(data["branches"]) or len(groups) != 12:
        raise ValueError("expected 12 unique presentation branches")
    visiting, visited = set(), set()

    def visit(node_id):
        if node_id in visiting:
            raise ValueError("dependency cycle at " + node_id)
        if node_id in visited:
            return
        visiting.add(node_id)
        for dep in by_id[node_id]["dependencies"]:
            if dep not in by_id:
                raise ValueError("dangling dependency: " + dep)
            visit(dep)
        visiting.remove(node_id)
        visited.add(node_id)

    for node in nodes:
        if node["branch"] not in groups or node["overallDisposition"] not in LABELS:
            raise ValueError("invalid branch/disposition: " + node["id"])
        for field, vocabulary in data["dimensionVocabulary"].items():
            if node[field] not in vocabulary:
                raise ValueError("invalid dimension: " + node["id"] + "/" + field)
        if len(node["dependencies"]) != len(set(node["dependencies"])):
            raise ValueError("duplicate dependency: " + node["id"])
        if not set(node.get("dependencyConditions", {})).issubset(node["dependencies"]):
            raise ValueError("condition without dependency: " + node["id"])
        if not node["completionCondition"] or not node["evidence"]:
            raise ValueError("missing completion condition/evidence: " + node["id"])
        for ref in node["evidence"]:
            if ref not in data["sources"]:
                raise ValueError("unknown evidence: " + ref)
        if not node["nextAction"]["authorization"] or not node["nextAction"]["action"]:
            raise ValueError("missing next-action state: " + node["id"])
        if node["overallDisposition"] == "COMPLETE":
            if node["governance"] not in ACCEPTED or node["independentVerification"] != "PASS":
                raise ValueError("completion without acceptance and verification: " + node["id"])
            if node["blockers"] or node["gitBinding"] not in ("BOUND", "NOT_APPLICABLE"):
                raise ValueError("completion with unresolved closure requirements: " + node["id"])
            if node["implementation"] not in ("COMPLETE", "NOT_APPLICABLE"):
                raise ValueError("completion with unfinished implementation: " + node["id"])
        visit(node["id"])

    # These are preserved scientific gates, never a scientific sufficiency oracle.
    for downstream, upstream in data["protectedDependencies"]:
        if upstream not in by_id[downstream]["dependencies"]:
            raise ValueError("missing required scientific dependency: " + downstream + " <- " + upstream)
    for node_id in data["unclosedScientificNodes"]:
        if by_id[node_id]["overallDisposition"] == "COMPLETE":
            raise ValueError("scientific promotion requires an authorized validator update: " + node_id)
    if by_id["SI-0"]["independentVerification"] != "FAIL":
        raise ValueError("historical protocol verdict must remain FAIL")
    if not any("RES-03" in b for b in by_id["SI0-READINESS"]["blockers"]):
        raise ValueError("RES-03 must remain visible")
    if len(data["activeCorpus"]) != 9 or "disney-pixar" in data["activeCorpus"]:
        raise ValueError("invalid active corpus")
    if len(set(data["activeCorpus"])) != 9:
        raise ValueError("duplicate active case")
    for lane in data["criticalPaths"]:
        if [n for step in lane["steps"] for n in step] != lane["nodes"]:
            raise ValueError("critical-path projection differs from its nodes")
        for node_id in lane["nodes"]:
            if node_id not in by_id:
                raise ValueError("unknown critical-path node: " + node_id)

    for key, source in data["sources"].items():
        path = (ROOT / source["path"]).resolve()
        if not path.is_relative_to(ROOT):
            raise ValueError("outside-root source: " + key)
        availability = source["availability"]
        if availability == "LOCAL_ONLY_UNAVAILABLE_IN_BASELINE":
            consumers = [n for n in nodes if key in n["evidence"]]
            if (source["availableInBaselineGit"] is not False
                    or source["evidenceClass"] != "UNACCEPTED_LOCAL_CANDIDATE"
                    or not re.fullmatch(r"[0-9a-f]{64}", source["observedLocalSha256"])
                    or not consumers
                    or {n["id"] for n in consumers} != set(source["candidateNodes"])
                    or any(n["governance"] != "CANDIDATE"
                           or n["overallDisposition"] != "OPEN_OR_CANDIDATE"
                           or n["independentVerification"] != "NOT_ESTABLISHED"
                           or n["gitBinding"] != "UNTRACKED" for n in consumers)):
                raise ValueError("local-only evidence used outside unaccepted candidate scope: " + key)
            # Record prior local identity; do not consume optional local bytes.
            continue
        if availability != "REQUIRED_TRACKED" or source["availableInBaselineGit"] is not True:
            raise ValueError("invalid source availability: " + key)
        if not path.is_file():
            raise ValueError("missing/outside-root source: " + key)
        if hashlib.sha256(path.read_bytes()).hexdigest() != source["sha256"]:
            raise ValueError("source changed; authorized status reconciliation needed: " + key)

    serialized = json.dumps(data, ensure_ascii=False)
    # Check the entire payload, including evidence locators and metadata.
    validate_text(serialized)
    prose = " ".join(n["title"] + " " + n["summary"] for n in nodes)
    if re.search(r"HOLD-\d|IV\d[- ]|CORR\d.*(?:→|->).*CORR\d|10-case|ten-case", prose, re.I):
        raise ValueError("historical chronology in current presentation")
    routing = (ROOT / "AGENTS.md").read_text()
    if str(JSON_PATH.relative_to(ROOT)) not in routing or str(MD_PATH.relative_to(ROOT)) not in routing:
        raise ValueError("canonical source is not routed from AGENTS.md")
    return by_id


def render(data):
    counts = Counter(n["overallDisposition"] for n in data["nodes"])
    edge_count = sum(len(n["dependencies"]) for n in data["nodes"])
    lines = [
        "# MergeVue — текущее дерево проекта", "",
        f"**Статус документа: {data['documentStatus']}.** {data['authorityBoundary']}", "",
        f"Срез: **{data['statusAsOf']}**, {data['timezone']}. Репозиторий `{data['repository']}`, ветка `{data['branch']}`, HEAD `{data['baselineHead']}`.", "",
        "Это снимок прочитанных источников на указанном HEAD. Более позднее решение Owner может действовать до синхронизации дерева; автоматическая актуальность не заявляется.", "",
        "Источник статусов: [MERGEVUE_CONTROL_TREE_CURRENT.json](MERGEVUE_CONTROL_TREE_CURRENT.json). Этот файл полностью генерируется; отдельно его статусы не редактируются.", "",
        f"**Узлов: {len(data['nodes'])}; прямых зависимостей: {edge_count}.**", "",
        " | ".join(["Состояние", "Узлов"]), "--- | ---",
    ]
    lines.extend(f"{label} | {counts[state]}" for state, label in LABELS.items())
    lines += ["", "COMPLETE относится к предмету узла. Детальные Owner/IV/Git/implementation/runtime состояния, все блокеры и доказательства находятся в JSON. Принятие контракта не означает завершение production implementation.", "", "## Критический путь", ""]
    for lane in data["criticalPaths"]:
        steps = [" + ".join(f"[{n}](#{n.lower().replace('.', '-')})" for n in step) for step in lane["steps"]]
        lines += [f"**{lane['title']}**", "", " → ".join("(" + step + ")" if len(ids) > 1 else step for step, ids in zip(steps, lane["steps"])), "", lane["constraint"], ""]
    lines += ["**Рекомендуемый следующий научный шаг:** " + data["recommendedNextAction"], "", "Это рекомендация; следующий акт этим деревом не авторизуется.", ""]
    lines += ["## Полное дерево", "", "Каждая строка — текущий узел. Все прямые зависимости перечислены; `*` означает условную применимость по accepted §8E(5), с обязательным lawful disposition. Показан первый блокер; остальные явно посчитаны и доступны в JSON по ID узла.", ""]

    def cell(value):
        return value.replace("|", "\\|").replace("\n", " ")

    for branch in data["branches"]:
        lines += [f"### {branch['title']}", "", "Узел | Статус | Зависимости | Текущий блокер", "--- | --- | --- | ---"]
        for n in data["nodes"]:
            if n["branch"] != branch["id"]:
                continue
            deps = ", ".join(f"[{dep}](#{dep.lower().replace('.', '-')})" + ("*" if dep in n.get("dependencyConditions", {}) else "") for dep in n["dependencies"]) or "—"
            blocker = n["blockers"][0] if n["blockers"] else "—"
            if len(n["blockers"]) > 1:
                blocker += f" (+{len(n['blockers']) - 1} в JSON)"
            lines.append(f"<a id=\"{n['id'].lower().replace('.', '-')}\"></a>`{n['id']}` {cell(n['title'])} | {LABELS[n['overallDisposition']]} | {deps} | {cell(blocker)}")
        lines.append("")
    lines += ["## Обновление", "", "Изменять статусы можно только в JSON под отдельной авторизацией. Затем: `python3 scripts/mergevue_control_tree.py --render` и `python3 scripts/mergevue_control_tree.py`. Owner acceptance, независимая verification и Git closure остаются отдельными действиями.", "", "Активный корпус: " + ", ".join(f"`{case}`" for case in data["activeCorpus"]) + ".", ""]
    return "\n".join(lines).rstrip() + "\n"


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--render", action="store_true")
    args = parser.parse_args()
    data = json.loads(JSON_PATH.read_text())
    validate(data)
    expected = render(data)
    validate_text(expected)
    if args.render:
        if not MD_PATH.resolve().is_relative_to(ROOT):
            raise ValueError("Markdown destination outside repository")
        MD_PATH.write_text(expected)
    elif not MD_PATH.exists() or MD_PATH.read_bytes() != expected.encode("utf-8"):
        raise ValueError("Markdown diverges; regenerate under authorized scope with --render")
    counts = Counter(n["overallDisposition"] for n in data["nodes"])
    print(json.dumps({"result": "PASS", "nodes": len(data["nodes"]),
                      "dependencies": sum(len(n["dependencies"]) for n in data["nodes"]),
                      "dispositions": dict(counts), "sources": len(data["sources"]),
                      "required_sources": sum(s["availability"] == "REQUIRED_TRACKED" for s in data["sources"].values()),
                      "unavailable_local_candidate_evidence": [k for k, s in data["sources"].items() if s["availability"] == "LOCAL_ONLY_UNAVAILABLE_IN_BASELINE"],
                      "protected_dependencies": len(data["protectedDependencies"]),
                      "forbidden_references": 0, "legacy_tree_references": 0,
                      "projection": "RENDERED" if args.render else "BYTE_IDENTICAL",
                      "scientific_execution": "NOT_RUN", "independent_verification": "NOT_CLAIMED"}, ensure_ascii=False))


if __name__ == "__main__":
    try:
        main()
    except (ValueError, KeyError, OSError, TypeError) as exc:
        print("FAIL: " + str(exc), file=sys.stderr)
        sys.exit(1)
