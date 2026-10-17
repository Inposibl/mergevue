# MergeVue — текущее дерево проекта

**Статус документа: OWNER_ACCEPTED.** Owner acceptance: GRANTED; независимая verification нового дерева: NOT_PERFORMED. Фактическое remote binding устанавливается проверкой ветки и коммита в Git, а не статичной записью в метаданных.

Срез: **2026-10-17**, America/Asuncion. Репозиторий `Inposibl/mergevue`, ветка `main`, HEAD `167d05d1079319a39652850dddb09eeed55597ee`.

Это снимок прочитанных источников на указанном HEAD. Более позднее решение Owner может действовать до синхронизации дерева; автоматическая актуальность не заявляется.

Источник статусов: [MERGEVUE_CONTROL_TREE_CURRENT.json](MERGEVUE_CONTROL_TREE_CURRENT.json). Этот файл полностью генерируется; отдельно его статусы не редактируются.

**Узлов: 81; прямых зависимостей: 83.**

Состояние | Узлов
--- | ---
✅ COMPLETE | 23
◐ PARTIAL | 14
☑️ ACCEPTED_DEFINITION_ONLY | 4
🟠 OPEN_OR_CANDIDATE | 8
⬜ NOT_STARTED | 24
⛔ BLOCKED_OR_REJECTED | 8

COMPLETE относится к предмету узла. Детальные Owner/IV/Git/implementation/runtime состояния, все блокеры и доказательства находятся в JSON. Принятие контракта не означает завершение production implementation.

## Критический путь

**Допуск к научной оценке P-S**

([SI-0](#si-0) + [SI0-AMENDMENT](#si0-amendment)) → [SI0-READINESS](#si0-readiness) → [SI-1](#si-1) → ([SI-2](#si-2) + [SI-3](#si-3)) → [SI-4](#si-4) → [SI-5](#si-5) → [SI-6](#si-6)

SI-2 и SI-3 — параллельные требования после SI-1; перечисление не разрешает исполнение. RES-03, identity/storage V и совместимый execution path блокируют E0.

**Закрытие Stage-2 до механического кодирования**

([SI-6](#si-6) + [PA-DISPOSITION](#pa-disposition) + [J-1](#j-1) + [J-4](#j-4) + [J-2](#j-2) + [J-3](#j-3)) → [POST-PILOT](#post-pilot) → [FINAL-CONTRACT-FREEZE](#final-contract-freeze) → [B5.8](#b5-8)

Первый блок показывает сходящиеся требования. J-гейты применяются только по установленной applicability и lawful disposition §8E(5); порядок panels здесь не задаётся. SI-6 sufficient снимает blanket P-S duty только решением Owner. Полный measurement regression — отдельный отложенный lane, не выдуманный prerequisite semantic freeze.

**Историческая научная и программная цепочка**

[B5.8](#b5-8) → [B5.9](#b5-9) → [B5.10](#b5-10) → [B5.15](#b5-15) → [B5.16](#b5-16) → [B5.11](#b5-11) → [B5.17](#b5-17) → [B5.18](#b5-18) → [B7.1](#b7-1) → [B5.12](#b5-12) → [B5.19](#b5-19) → ([B5.13](#b5-13) + [B5.14](#b5-14)) → [B16.3](#b16-3)

B5.13 дополнительно требует независимо проверенных B6.4 и B9.1 после Method Freeze. Publication content требует verified final replay. PRODUCT READY — параллельный release gate, и сам public release требует отдельного Owner решения.

**Рекомендуемый следующий научный шаг:** Отдельный ограниченный акт предисполнительской готовности принятого V: прежде E0 требуется явное Owner disposition RES-03; затем в разрешённом объёме — хранение точного V, проверенный совместимый путь исполнения и подтверждённые IDs/isolation/custody. Научные наблюдения до отдельной авторизации запрещены.

Это рекомендация; следующий акт этим деревом не авторизуется.

## Полное дерево

Каждая строка — текущий узел. Все прямые зависимости перечислены; `*` означает условную применимость по accepted §8E(5), с обязательным lawful disposition. Показан первый блокер; остальные явно посчитаны и доступны в JSON по ID узла.

### 1. Принятые научные и дефиниционные основы

Узел | Статус | Зависимости | Текущий блокер
--- | --- | --- | ---
<a id="b1-1"></a>`B1.1` Root Definitional Authority v1.7 | ✅ COMPLETE | — | —
<a id="b1-2"></a>`B1.2` Пространство девяти Environment | ✅ COMPLETE | [B1.1](#b1-1) | —
<a id="b1-3"></a>`B1.3` Семантическая authority E9 | ✅ COMPLETE | [B1.1](#b1-1) | —
<a id="b1-5"></a>`B1.5` Source fidelity дефиниционной основы | 🟠 OPEN_OR_CANDIDATE | — | Тип семантической связи 13-edge topology не разрешён (+1 в JSON)
<a id="b2-1"></a>`B2.1` Epistemic safety и causal proof | ◐ PARTIAL | — | Production enforcement всех epistemic boundaries не доказан

### 2. Документальные доказательства и provenance

Узел | Статус | Зависимости | Текущий блокер
--- | --- | --- | ---
<a id="b1-4"></a>`B1.4` Документальный контракт CASE-3.4 | ✅ COMPLETE | — | —
<a id="b4-1"></a>`B4.1` Documentary evidence certification | ✅ COMPLETE | — | —
<a id="b4-2"></a>`B4.2` Level-1 Mode-D factual research slice | ✅ COMPLETE | [B1.4](#b1-4) | —
<a id="b4-3"></a>`B4.3` Historical documentary ingress | ◐ PARTIAL | — | Автоматизированный внешний archive collector отсутствует (+1 в JSON)
<a id="b17-6"></a>`B17.6` sourceClass assignment | ✅ COMPLETE | — | —
<a id="b17-7"></a>`B17.7` Незавершённые documentary eligibility candidates | 🟠 OPEN_OR_CANDIDATE | — | Local-only evidence отсутствует в baseline Git; bytes недоступны в clean checkout (+1 в JSON)
<a id="acquisition"></a>`ACQUISITION` Value-ranked evidence acquisition | ☑️ ACCEPTED_DEFINITION_ONLY | — | Полная production implementation и execution-ready active ladders не завершены

### 3. Анкеты и прямое определение Environment

Узел | Статус | Зависимости | Текущий блокер
--- | --- | --- | ---
<a id="b3-1"></a>`B3.1` Анкетная NewLogic основа | ✅ COMPLETE | — | —
<a id="b3-2"></a>`B3.2` Evidence scoring, contradictions и dual respondents | ✅ COMPLETE | [B3.1](#b3-1) | —
<a id="b3-3"></a>`B3.3` Candidate-pair determination | ◐ PARTIAL | [B3.2](#b3-2) | Dynamic pair determination не operational

### 4. Исторический корпус девяти кейсов

Узел | Статус | Зависимости | Текущий блокер
--- | --- | --- | ---
<a id="b5-1"></a>`B5.1` Активный корпус: 9 кейсов / 18 сторон | ◐ PARTIAL | — | Candidate-specific IV governance bytes membership addendum NOT_ESTABLISHED
<a id="b5-2"></a>`B5.2` Девять case-level blind cycles | ✅ COMPLETE | [B5.1](#b5-1) | —
<a id="b5-3"></a>`B5.3` Исторические Prediction Seals | ✅ COMPLETE | [B5.2](#b5-2) | —
<a id="b5-5"></a>`B5.5` Принятый historical input freeze | ✅ COMPLETE | [B5.2](#b5-2) | —
<a id="b5-7"></a>`B5.7` Принятая factual authority корпуса | ✅ COMPLETE | [B5.1](#b5-1) | —

### 5. Stage-2: научная целостность и post-pilot obligations

Узел | Статус | Зависимости | Текущий блокер
--- | --- | --- | ---
<a id="b17-1"></a>`B17.1` Stage-2 semantic contract и frozen pilot design | ✅ COMPLETE | — | —
<a id="b17-4"></a>`B17.4` Post-pilot semantic correction substrate | ◐ PARTIAL | [B17.1](#b17-1) | Отдельные exact Owner acceptance records corrections NOT_ESTABLISHED
<a id="b17-5"></a>`B17.5` Принятый Final Effective View | ✅ COMPLETE | [B17.4](#b17-4) | —
<a id="ps-pa-framework"></a>`PS-PA-FRAMEWORK` P-S/P-A scientific-integrity framework | ✅ COMPLETE | [B17.1](#b17-1) | —
<a id="efca-spec"></a>`EFCA-SPEC` Evidence-first causal adjudication specification | ✅ COMPLETE | [B17.1](#b17-1) | —
<a id="efca-offline"></a>`EFCA-OFFLINE` Offline synthetic EFCA enforcement | ✅ COMPLETE | [EFCA-SPEC](#efca-spec) | —
<a id="si-0"></a>`SI-0` Принятый протокол SI-0 B | ◐ PARTIAL | [PS-PA-FRAMEWORK](#ps-pa-framework) | RES-03: соответствие framework требованию independently verified после процедурного FAIL не определено Owner
<a id="si0-amendment"></a>`SI0-AMENDMENT` Принятая eligibility amendment и composite V | ✅ COMPLETE | [SI-0](#si-0) | —
<a id="si0-readiness"></a>`SI0-READINESS` Предисполнительская готовность V | ⛔ BLOCKED_OR_REJECTED | [SI-0](#si-0), [SI0-AMENDMENT](#si0-amendment) | RES-03 открыт: P1 для V не установлен (+4 в JSON)
<a id="si-1"></a>`SI-1` Неизменность и temporal eligibility входов | ⬜ NOT_STARTED | [SI0-READINESS](#si0-readiness) | Эмпирическое выполнение не авторизовано; результат NOT_ESTABLISHED
<a id="si-2"></a>`SI-2` Охват четырёх strata | ⬜ NOT_STARTED | [SI-1](#si-1) | Эмпирическое выполнение не авторизовано; результат NOT_ESTABLISHED
<a id="si-3"></a>`SI-3` Независимый procedural reference | ⬜ NOT_STARTED | [SI-1](#si-1) | Эмпирическое выполнение не авторизовано; результат NOT_ESTABLISHED
<a id="si-4"></a>`SI-4` Предпринятое правило существенности | ⬜ NOT_STARTED | [SI-2](#si-2), [SI-3](#si-3) | Эмпирическое выполнение не авторизовано; результат NOT_ESTABLISHED
<a id="si-5"></a>`SI-5` Фальсификаторы F-PS-01…F-PS-07 | ⬜ NOT_STARTED | [SI-4](#si-4) | Эмпирическое выполнение не авторизовано; результат NOT_ESTABLISHED
<a id="si-6"></a>`SI-6` Scientific sufficiency verdict | ⬜ NOT_STARTED | [SI-5](#si-5) | Эмпирическое выполнение не авторизовано; результат NOT_ESTABLISHED
<a id="pa-disposition"></a>`PA-DISPOSITION` P-A disagreement closure и conditional repairs | 🟠 OPEN_OR_CANDIDATE | [B17.5](#b17-5), [EFCA-SPEC](#efca-spec) | 17 P-A disagreements не закрыты (+1 в JSON)
<a id="j-1"></a>`J-1` EFCA J-1 policy adjudication | 🟠 OPEN_OR_CANDIDATE | [EFCA-SPEC](#efca-spec) | Policy decision не принято
<a id="j-4"></a>`J-4` EFCA J-4 precedence/exclusivity adjudication | 🟠 OPEN_OR_CANDIDATE | [EFCA-SPEC](#efca-spec) | Policy decision не принято
<a id="j-2"></a>`J-2` EFCA J-2 blind Phase-1 panel | ⬜ NOT_STARTED | [EFCA-SPEC](#efca-spec) | Научное исполнение не авторизовано
<a id="j-3"></a>`J-3` EFCA J-3 Lane-B adjudication | ⬜ NOT_STARTED | [EFCA-SPEC](#efca-spec) | Научное исполнение не авторизовано
<a id="s2-regression"></a>`S2-REGRESSION` Полный Stage-2 measurement regression | ◐ PARTIAL | [B17.5](#b17-5) | Whole-Stage-2 measurement regression не выполнен (+1 в JSON)
<a id="post-pilot"></a>`POST-PILOT` Post-pilot semantic contract acceptance | ⛔ BLOCKED_OR_REJECTED | [SI-6](#si-6), [PA-DISPOSITION](#pa-disposition), [J-1](#j-1)*, [J-4](#j-4)*, [J-2](#j-2)*, [J-3](#j-3)* | Scientific integrity и P-A не закрыты (+2 в JSON)
<a id="final-contract-freeze"></a>`FINAL-CONTRACT-FREEZE` Stage-2 FINAL CONTRACT FREEZE | ⛔ BLOCKED_OR_REJECTED | [POST-PILOT](#post-pilot) | Post-pilot contract acceptance отсутствует (+1 в JSON)

### 6. Метод исторического определения Environment

Узел | Статус | Зависимости | Текущий блокер
--- | --- | --- | ---
<a id="b5-8"></a>`B5.8` Outcome-hidden mechanism normalization | ⛔ BLOCKED_OR_REJECTED | [B5.7](#b5-7), [B5.5](#b5-5), [B17.5](#b17-5), [FINAL-CONTRACT-FREEZE](#final-contract-freeze) | FINAL CONTRACT FREEZE не установлен (+2 в JSON)
<a id="b5-9"></a>`B5.9` Independent dual coding и candidate HEDC | ⬜ NOT_STARTED | [B5.8](#b5-8) | B5.8 не допущен к исполнению
<a id="b5-10"></a>`B5.10` Физический HEDC determination-rule freeze | ⬜ NOT_STARTED | [B5.9](#b5-9) | Candidate HEDC не принят для rule freeze
<a id="b6-1"></a>`B6.1` OD-MS-9 historical route design | 🟠 OPEN_OR_CANDIDATE | — | Полный independent OD-MS-9 methodology audit не выполнен
<a id="b6-2"></a>`B6.2` MD-2 offline structural kernel | ✅ COMPLETE | [B6.1](#b6-1) | —
<a id="b6-3"></a>`B6.3` Historical inference operator candidate | 🟠 OPEN_OR_CANDIDATE | — | Local-only evidence отсутствует в baseline Git; bytes недоступны в clean checkout (+2 в JSON)

### 7. Калибровка, фальсификация и Method Freeze

Узел | Статус | Зависимости | Текущий блокер
--- | --- | --- | ---
<a id="b5-15"></a>`B5.15` Frozen blind replay candidate rules | ⬜ NOT_STARTED | [B5.10](#b5-10) | Научные predecessors не завершены; отдельное исполнение не авторизовано
<a id="b5-16"></a>`B5.16` Независимое воспроизведение blind replay | ⬜ NOT_STARTED | [B5.15](#b5-15) | Научные predecessors не завершены; отдельное исполнение не авторизовано
<a id="b5-11"></a>`B5.11` Behavioral и program falsification | ⬜ NOT_STARTED | [B5.16](#b5-16) | Научные predecessors не завершены; отдельное исполнение не авторизовано
<a id="b5-17"></a>`B5.17` Leave-one-case-out stability | ⬜ NOT_STARTED | [B5.11](#b5-11) | Научные predecessors не завершены; отдельное исполнение не авторизовано
<a id="b5-18"></a>`B5.18` Realized coverage и отдельные T10/MD verdicts | ⬜ NOT_STARTED | [B5.17](#b5-17) | Научные predecessors не завершены; отдельное исполнение не авторизовано
<a id="b7-1"></a>`B7.1` Owner Method Freeze decision | ⬜ NOT_STARTED | [B5.18](#b5-18) | Научные predecessors не завершены; отдельное исполнение не авторизовано
<a id="b5-12"></a>`B5.12` Финальный calibrated replay девяти кейсов | ⬜ NOT_STARTED | [B7.1](#b7-1) | Научные predecessors не завершены; отдельное исполнение не авторизовано
<a id="b5-19"></a>`B5.19` Независимая full-corpus verification final replay | ⬜ NOT_STARTED | [B5.12](#b5-12) | Научные predecessors не завершены; отдельное исполнение не авторизовано

### 8. Математический аппарат и детерминированный Core

Узел | Статус | Зависимости | Текущий блокер
--- | --- | --- | ---
<a id="b8-1"></a>`B8.1` Существующий ECS foundation | ✅ COMPLETE | [B3.3](#b3-3) | —
<a id="b8-2"></a>`B8.2` Существующий friction foundation | ✅ COMPLETE | [B8.1](#b8-1) | —
<a id="b8-3"></a>`B8.3` Product prediction-seal component | ◐ PARTIAL | — | Prediction texts и falsificationCondition вне текущего hash preimage (+1 в JSON)
<a id="b6-4"></a>`B6.4` Детерминированный HEDC classifier | ⬜ NOT_STARTED | [B7.1](#b7-1), [B6.1](#b6-1) | Method Freeze отсутствует (+1 в JSON)
<a id="b9-1"></a>`B9.1` Evidence-native deterministic analytical Core | ⬜ NOT_STARTED | [B7.1](#b7-1) | Method Freeze отсутствует (+1 в JSON)
<a id="pair-evaluation"></a>`PAIR-EVALUATION` Historical pair-collision evaluation specification | ☑️ ACCEPTED_DEFINITION_ONLY | — | Predicate/template registry и lawful historical adapter не установлены (+1 в JSON)
<a id="math-foundation"></a>`MATH-FOUNDATION` Predictive mathematical foundation candidate | 🟠 OPEN_OR_CANDIDATE | — | Independent acceptance/verification mathematical candidate NOT_ESTABLISHED (+1 в JSON)

### 9. Исторические алгоритмические отчёты и публикация

Узел | Статус | Зависимости | Текущий блокер
--- | --- | --- | ---
<a id="b5-13"></a>`B5.13` Девять algorithm-generated historical reports | ⬜ NOT_STARTED | [B5.19](#b5-19), [B6.4](#b6-4), [B9.1](#b9-1) | Final replay IV, HEDC implementation и Core не завершены
<a id="b5-14"></a>`B5.14` Publication-ready case studies | ⬜ NOT_STARTED | [B5.19](#b5-19) | Verified Final Calibrated Replay отсутствует
<a id="b15-2"></a>`B15.2` Существующие case-study routes и renderers | ◐ PARTIAL | — | Содержание не связано с verified calibrated nine-case proof

### 10. Отчётная и runtime архитектура MergeVue

Узел | Статус | Зависимости | Текущий блокер
--- | --- | --- | ---
<a id="b10-1"></a>`B10.1` FREE registry и bounded Mode-D projection | ✅ COMPLETE | [B4.2](#b4-2) | —
<a id="b10-2"></a>`B10.2` Public flow и API wiring | ◐ PARTIAL | [B10.1](#b10-1) | Независимая verification assembled flow NOT_ESTABLISHED (+1 в JSON)
<a id="b10-4"></a>`B10.4` Report delivery и persistence | ◐ PARTIAL | [B10.2](#b10-2) | Deployed PDF/email success и production persistence evidence не установлены (+1 в JSON)
<a id="b12-1"></a>`B12.1` Anonymous и Expanded FREE | ◐ PARTIAL | [B10.1](#b10-1) | Registered Expanded FREE deepening не завершён (+1 в JSON)
<a id="b13-1"></a>`B13.1` Report-product и FREE/PAID epistemic controls | ◐ PARTIAL | [B10.1](#b10-1) | RP-5 entitlement ceiling enforcement NOT_ESTABLISHED (+3 в JSON)
<a id="b15-1"></a>`B15.1` Публичный web слой | ◐ PARTIAL | — | Post-calibration adaptation и deployed release proof не установлены

### 11. Продуктовые и коммерческие функции roadmap

Узел | Статус | Зависимости | Текущий блокер
--- | --- | --- | ---
<a id="b11-1"></a>`B11.1` Paid diagnostic и 19-block report | ☑️ ACCEPTED_DEFINITION_ONLY | [B9.1](#b9-1) | Paid diagnostic pipeline и 19-block builder отсутствуют
<a id="b14-1"></a>`B14.1` Integration Monitor | ⬜ NOT_STARTED | [B11.1](#b11-1) | Paid sealed analytical package и monitor implementation отсутствуют
<a id="b16-1"></a>`B16.1` Коммерческая лестница MergeVue | ☑️ ACCEPTED_DEFINITION_ONLY | [B11.1](#b11-1), [B16.4](#b16-4) | Реализация и коммерческий release не завершены
<a id="perf-0"></a>`PERF-0` Отложенная engineering optimization | ⬜ NOT_STARTED | [B16.4](#b16-4) | FREE release trigger не наступил

### 12. Гейты готовности и публичного выпуска

Узел | Статус | Зависимости | Текущий блокер
--- | --- | --- | ---
<a id="b10-3"></a>`B10.3` FREE Product-Ready residual scope | ⛔ BLOCKED_OR_REJECTED | [B10.2](#b10-2), [B12.1](#b12-1), [B13.1](#b13-1), [B10.4](#b10-4) | Release alignment и проверки не завершены (+1 в JSON)
<a id="b16-2"></a>`B16.2` PRODUCT READY | ⛔ BLOCKED_OR_REJECTED | [B10.3](#b10-3) | B10.3 не завершён
<a id="b16-3"></a>`B16.3` PUBLIC PROOF READY | ⛔ BLOCKED_OR_REJECTED | [B5.14](#b5-14), [B5.19](#b5-19), [B5.13](#b5-13) | Final replay, algorithm-generated reports и publication-ready content отсутствуют
<a id="b16-4"></a>`B16.4` Owner public-release authorization | ⛔ BLOCKED_OR_REJECTED | [B16.2](#b16-2), [B16.3](#b16-3) | PRODUCT READY не закрыт (+2 в JSON)

## Обновление

Изменять статусы можно только в JSON под отдельной авторизацией. Затем: `python3 scripts/mergevue_control_tree.py --render` и `python3 scripts/mergevue_control_tree.py`. Owner acceptance, независимая verification и Git closure остаются отдельными действиями.

Активный корпус: `daimler-chrysler`, `deutsche-bankers-trust`, `pfizer-megamergers`, `aol-time-warner`, `aecom-urs`, `exxon-mobil`, `jpmorgan-bank-one`, `google-android`, `amazon-whole-foods`.
