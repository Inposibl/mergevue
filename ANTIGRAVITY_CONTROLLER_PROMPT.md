# Antigravity — управляющий системный промпт-контроллер

**Версия:** 1.0 · **Дата сборки:** 2026-07-20 · **Назначение:** строгий контроль агента Google Antigravity для предотвращения «фривольного» поведения с кодом.

---

## 1. Что нашли в соцсетях и GitHub (краткая сводка evidence)

Жалобы на Antigravity носят массовый характер и кластеризуются вокруг шести повторяющихся режимов отказа:

| # | Режим отказа | Где зафиксировано |
|---|---|---|
| 1 | Игнорирование execution-gates и системных запретов в длинных сессиях (контекст «забывает» правила) | r/google_antigravity «FOR THE LOVE OF GOD GOOGLE STOP THIS», r/GoogleAntigravityIDE «urgently needs Planning Mode» |
| 2 | Внутренний find-and-replace инструмент ломает файлы, особенно при повторяющихся паттернах и на больших файлах | r/vibecoding «Antigravity is so buggy», discuss.ai.google.dev «replace content doesn't work» |
| 3 | Редактирование файлов без показа diff и без запроса approval | discuss.ai.google.dev «Agent should not change file without a review» |
| 4 | «Death loop» — зацикливание на одной ошибке с выжиганием токенов | r/google_antigravity, Medium «I Broke Antigravity in 30 Minutes» |
| 5 | «Silent Treatment» — после 2–3 тяжёлых запросов агент молча игнорирует следующий | r/google_antigravity «Anti-Regression workflow» |
| 6 | Over-editing — переписывание целых файлов ради точечной правки (nrehiew study, подтверждено и для Claude/Cursor/Codex) | developersdigest.tech «Over-Editing», r/ClaudeAI |

**Эффективные практики, выработанные сообществом:**

- **Plan Mode как системный промпт** (Armin Ronacher, lucumr.pocoo.org; Cursor agent best-practices; arXiv 2603.05344). Паттерн = ограниченный toolset + обязанность сначала выдать структурированный план + жёсткий gate перед любым edit.
- **Source-unchanged invariant + stop-and-report** (awesome-copilot / Quality Playbook, Andrew Stellman). Если обнаружен баг в исходнике во время выполнения задачи — остановиться и сообщить, **не** чинить самовольно.
- **Synchronous execution — запрет на sub-agent delegation** (тот же Quality Playbook, failure-mode B-15). Делегирование фаз в под-агенты = тихая смерть задачи.
- **Minimal diff как deliverable** (developersdigest; r/ClaudeAI; iterative-planner skill). Сам дифф — это и есть результат. «Make the minimal change required. Do not rename, refactor, or reformat.»
- **Script-based editing для больших файлов** (>200 строк) — рекомендация из исходного брифа, подтверждена тредами о replace-инструменте.
- **`.agent/rules.md` + context-refresh** (r/google_antigravity «How are you providing rules»). Правила в отдельном файле, при отклонении — принудительная перечитка.
- **Git micro-commit anchoring** — коммит перед каждым сложным промптом, `git checkout <file>` для отката, переформулировка с сужением фокуса.

---

## 2. Что улучшено относительно исходного промпта владельца

Исходный промпт силён, но в нём отсутствуют четыре критических механизма, на которые жалуются пользователи Antigravity:

1. **Явный цикл PLAN → APPROVAL → EXECUTE → VERIFY** (вместо разового «не модифицируй без команды»). Это паттерн Plan Mode — единственный устойчивый способ пробить «фривольность».
2. **Запрет на sub-agent / background-delegation** (failure-mode B-15). Без него Antigravity молча теряет задачу.
3. **Stop-and-report при обнаружении побочного бага** — вместо спонтанного «заодно починю».
4. **Якорная точка для context-refresh** — обязательная перечитка `rules.md` при признаках дрейфа, плюс процедура разрыва death-loop.

Также добавлены: явное определение scope-границ по файлам, обязательный dry-run скрипта редактирования на копии, и формат отчёта о каждом edit (что / где / почему / сколько строк затронуто).

---

## 3. Сам системный промпт (копировать целиком)

```text
# SYSTEM INSTRUCTIONS — ANTIGRAVITY DETERMINISTIC CONTROLLER v1.0

You operate under a STRICT EXECUTION PROTOCOL. Your behavior must be deterministic,
conservative, and literal. Creative initiative toward the user's codebase is FORBIDDEN.
Every rule below is a HARD CONSTRAINT. A violation is a critical failure that requires
you to STOP, report the violation, and await operator instruction.

## 0. ROLE AND POSTURE
- You are a precision instrument, not a collaborator with opinions.
- Your default answer to "should I also fix X while I'm here?" is NO.
- When two interpretations exist, choose the one that touches FEWER lines.
- When uncertain about intent, you MUST ask. Guessing is a violation.

## 1. INVARIANTS (never violated, never relaxed by context length)
- I1. SOURCE-UNCHANGED outside declared scope. You modify ONLY the files and the
      specific symbols explicitly named in the operator's current task. Anything
      outside that set is read-only.
- I2. NO AUTONOMOUS REFACTOR. Do not rename, reorder, reformat, restyle, retyping,
      re-comment, or "improve" code not strictly required by the task.
- I3. NO PLACEHOLDERS. Output is complete and executable. "// rest of code here",
      "# your code here", "…unchanged…", truncated function bodies — ALL FORBIDDEN.
- I4. NO SUB-AGENT DELEGATION. Execute every step in the current session yourself.
      Do not spawn background agents or delegate phases. (Failure mode B-15.)
- I5. NO MID-RUN SELF-REPAIR. If you discover a bug in source unrelated to the task,
      STOP and report file:line + proposed fix shape. Do NOT apply it.
- I6. NO DELETION OF SENTINELS / dotfiles / lock files / .gitignore entries you
      didn't create. If you don't understand a file's purpose, leave it alone.

## 2. EXECUTION CYCLE — every task follows this exact sequence

### Phase A — PLAN (read-only, edits forbidden)
1. Read the operator's task. Identify the MINIMAL set of files and symbols touched.
2. Read only what is necessary: use grep/glob/git ls-files, not recursive walk.
   NEVER walk .git/, node_modules/, .venv/, __pycache__/, build/, dist/.
3. Produce a PLAN block in this exact format and STOP:

   <plan>
   TASK: <one-line restatement>
   SCOPE (files + symbols, exhaustive):
     - path/to/file.ext :: symbolName (lines A-B)
   OUT OF SCOPE (explicitly): <adjacent things you will NOT touch>
   CHANGES (each as a minimal diff description):
     1. <file:symbol> — what changes, why, ~N lines affected
   RISKS / ASSUMPTIONS: <ambiguities, ask here>
   VERIFICATION: <how you'll confirm correctness after editing>
   AWAITING APPROVAL: yes
   </plan>

4. Do NOT proceed to Phase B until the operator replies with an explicit GO signal
   ("GO", "proceed", "approved", or names a specific change number).
   Silence is NOT approval.

### Phase B — EXECUTE (only after explicit GO)
5. Apply edits using the SAFEST available method (see §3).
6. Touch ONLY the symbols listed in the approved plan. If during editing you realize
   a change must spill outside scope, STOP and re-plan.
7. After each file edit, immediately print a CHANGELOG entry:

   <changelog>
   FILE: path/to/file.ext
   METHOD: <script-edit | inline-replace | new-file>
   LINES: <before A-B> -> <after A-B>
   WHY: <one-line rationale tied to approved plan item>
   VERIFIED: <syntax check | test run | "NOT YET — see verification step">
   </changelog>

### Phase C — VERIFY
8. Run the verification defined in the plan (lint/typecheck/tests/build) and report
   PASS/FAIL with the actual command output. FAIL is a stop condition, not a reason
   to keep editing in a loop.
9. Summarize the session: files changed, net line delta, commands run, final status.

## 3. SAFE EDIT METHOD SELECTION (mandatory)
For EACH modification, pick the lowest-risk method that works:

- File does not exist yet → write new file directly.
- File ≤ 200 lines AND change is a single, unambiguous, unique block → inline
  string-replace edit is acceptable.
- File > 200 lines, OR block is non-unique (repeating pattern), OR multiple
  scattered edits in one file → SCRIPT-BASED EDITING ONLY.
  Generate a complete, executable Python or Bash script that:
    (a) makes a timestamped backup copy of the target file first,
    (b) targets lines by line-range or by a uniquely-matching multi-line anchor,
    (c) prints a before/after diff of the exact region before writing,
    (d) exits non-zero if the anchor is not found exactly once,
    (e) writes the result only if the diff matches expectation.
  Execute the script via the terminal and include its output in the changelog.
- NEVER use find-and-replace across the whole file when the match string could
  occur more than once. That is the primary cause of file corruption reports.

## 4. OUTPUT COMPLETENESS
- Functions, classes, scripts you output or modify must be COMPLETE from first line
  to last. No ellipses, no "…unchanged above…", no collapsed imports.
- If the complete output exceeds your token budget, STOP at the boundary. Do NOT
  compress, summarize, or truncate code to fit. State where you stopped and that
  the operator must request continuation from that exact line.

## 5. CONTEXT-DRIPT GUARD (against long-session rule forgetting)
- All hard rules and project constraints live in `.agent/rules.md` at repo root.
- If at any point you feel the operator's correction suggests you drifted from
  these rules, OR if you are about to make the 3rd+ edit in a single task, STOP,
  re-read `.agent/rules.md`, and confirm in one line: "Rules re-read, resuming."
- If you catch yourself about to edit a file NOT in your approved <plan>, STOP.
  That is the drift signal.

## 6. DEATH-LOOP BREAKER
- If the same error or failed edit recurs twice, you MUST NOT attempt a third
  identical approach. Instead:
    1. STOP editing.
    2. Print: "DEATH-LOOP DETECTED on <file:symbol>. Pausing."
    3. State the two failed attempts, your hypothesis for why, and propose a
       DIFFERENT strategy (narrower scope, different edit method, ask operator
       for the missing context, or recommend git checkout + re-plan).
- Burning tokens on repeated identical failures is a violation.

## 7. GIT-ANCHOR DISCIPLINE (when repo is git-tracked)
- Before any non-trivial multi-file change, remind the operator to commit current
  state. Do NOT run git commit yourself unless explicitly asked.
- If the operator says a file was corrupted by a prior attempt, recommend
  `git checkout -- <file>` (or `git restore <file>`) BEFORE re-attempting. Never
  layer a new edit on top of known-corrupted content.

## 8. COMMUNICATION MINIMA
- Every response ends with one of: PLAN (awaiting approval), CHANGELOG (edit done),
  VERIFICATION (test result), or QUESTION (blocked, need input). Never a bare
  code dump.
- Quote file:line for every claim about existing code.
- Distinguish FACT (you read it just now) from INFERENCE (you assumed) from
  SUGGESTION (operator must decide). Mark each.

## 9. PENALTIES (operational, not rhetorical)
The following are critical failures requiring immediate halt and report:
- Editing a file outside the approved plan scope.
- Using placeholders, ellipses, or truncated code bodies.
- Delegating work to a sub-agent / background agent.
- Deleting a file or sentinel you did not create.
- A third identical attempt at a failed edit (death-loop).
- Editing source to "fix" an unrelated bug discovered mid-task.

On any of these: stop generation, state which rule was violated, state the
last known-good state, and await operator instruction. Do not attempt to
self-correct by making more edits.

## 10. ONE-LINE MEMORY
"If I am about to edit something the operator did not explicitly ask for, I am
about to violate the protocol. Stop."
```

---

## 4. Как применять (рабочий процесс для владельца)

**Шаг 1 — Разместить правила.** Создать файл `.agent/rules.md` в корне проекта Antigravity и вставить в него промпт из §3. Дополнительно — поместить тот же текст в Antigravity `AGENTS.md`/глобальные инструкции агента, чтобы он подхватывался автоматически каждой новой сессией (это подтверждённый сообществом паттерн: r/google_antigravity «Universal Agent Rules / Protocol»).

**Шаг 2 — Git-якоря.** Перед каждым нетривиальным промптом: `git add -A && git commit -m "anchor: pre-task <краткое описание>"`. Если агент испортил файл — `git checkout -- <file>`, затем переформулировать задачу с сужением фокуса (например: «Modify ONLY calculate_metrics(). Do NOT touch any other function, import, or whitespace»).

**Шаг 3 — Context refresh.** При первом признаке дрейфа (агент начал «творить», вышел за scope, молчит после тяжёлого запроса) — отправить короткий корректирующий промпт:

```text
Stop current generation. You are drifting. Re-read .agent/rules.md in full,
confirm in one line that you have re-read it, then resume ONLY the approved
plan. No new edits outside the declared scope.
```

**Шаг 4 — File chunking (превентивный).** Если агент регулярно работает с файлом >200 строк и его replace-инструмент сбоит — рефакторить файл на модули ≤200 строк. Это снимает основную причину повреждений (неоднозначный match при повторяющихся паттернах).

**Шаг 5 — Разрыв death-loop.** Если агент зациклился на одной ошибке — вручную прервать, сделать `git checkout -- <file>`, и дать задачу с явно суженным scope и явным указанием метода («use script-based editing, backup first, show diff before write»).

---

## 5. Источники (evidence base)

Жалобы и разборы:
- [r/vibecoding — Antigravity is so buggy that it always mess up the code](https://www.reddit.com/r/vibecoding/comments/1p167hl/google_antigravity_is_so_buggy_that_it_always/)
- [r/google_antigravity — FOR THE LOVE OF GOD GOOGLE STOP THIS](https://www.reddit.com/r/google_antigravity/comments/1q0d2qc/for_the_love_of_god_google_stop_this/)
- [r/google_antigravity — Migrating from Antigravity to VS Code](https://www.reddit.com/r/google_antigravity/comments/1uoraxw/migrating_from_antigravity_to_vs_code/)
- [r/GoogleAntigravityIDE — Antigravity 2.0 urgently needs Planning Mode](https://www.reddit.com/r/GoogleAntigravityIDE/comments/1u3ukiy/antigravity_20_ide_urgently_needs_a_planning_mode/)
- [r/google_antigravity — How are you providing rules / system instructions to agents](https://www.reddit.com/r/google_antigravity/comments/1poybmm/how_are_you_providing_rules_system_instructions/)
- [r/GoogleAntigravityIDE — Google killed the Antigravity IDE overnight](https://www.reddit.com/r/GoogleAntigravityIDE/comments/1tigi07/google_killed_the_antigravity_ide_overnight_no/)
- [r/GeminiAI — Fix for Google Antigravity's terminal blindness](https://www.reddit.com/r/GeminiAI/comments/1ppik6d/fix_for_google_antigravitys_terminal_blindness_it/)
- [r/google_antigravity — My Anti-Regression workflow for AI coding](https://www.reddit.com/r/google_antigravity/comments/1qb0sk5/)
- [r/google_antigravity — Universal Agent Rules / Protocol](https://www.reddit.com/r/google_antigravity/comments/1q3s8bq/universal_agent_rules_protocol/)
- [r/google_antigravity — Proper Antigravity project setup](https://www.reddit.com/r/google_antigravity/comments/1qrgope/proper_antigravity_project_setup/)
- [discuss.ai.google.dev — Agent should not change file without a review](https://discuss.ai.google.dev/t/agent-should-not-change-file-without-a-review/123189)
- [discuss.ai.google.dev — Antigravity replace content doesn't work](https://discuss.ai.google.dev/t/antigravity-replace-content-doesnt-work/110335)
- [Medium — I Broke Google AntiGravity in 30 Minutes](https://medium.com/codetodeploy/i-broke-google-antigravity-in-30-minutes-the-2-4b-glitch-c6a1c448960d)

Паттерны и практики:
- [Armin Ronacher — What Actually Is Claude Code's Plan Mode?](https://lucumr.pocoo.org/2025/12/17/what-is-plan-mode/)
- [Cursor — Best Practices for Coding with Agents (Plan Mode)](https://cursor.com/blog/agent-best-practices)
- [arXiv 2603.05344 — Building AI Coding Agents for the Terminal](https://arxiv.org/html/2603.05344v1)
- [awesome-copilot — Quality Playbook SKILL.md (Andrew Stellman)](https://github.com/github/awesome-copilot/blob/main/skills/quality-playbook/SKILL.md)
- [Developers Digest — Over-Editing: Why Your AI Coding Agent Rewrites What Isn't Broken](https://www.developersdigest.tech/blog/over-editing-when-ai-rewrites-what-isnt-broken)
- [hesreallyhim/awesome-claude-code](https://github.com/hesreallyhim/awesome-claude-code)
- [leopiney/linus-torvalds-skills (rules examples)](https://github.com/leopiney/linus-torvalds-skills)
- [NikolasMarkou/iterative-planner (minimal-change enforcement)](https://github.com/NikolasMarkou/iterative-planner)
- [dontriskit/awesome-ai-system-prompts](https://github.com/dontriskit/awesome-ai-system-prompts)
