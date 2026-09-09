# INSTRUMENT AMENDMENTS · D1 · D3 · DRAFT

**Автор кандидатных решений:** Николай Петяев; сформулированы и подтверждены автором в exploratory-сессии 04.09.2026, но **не приняты Владельцем как финальные методологические решения для реализации**
**Транскрипция черновиков опций:** Claude (Anthropic)
**Статус:** `OWNER-AUTHORED DRAFT / CANDIDATE CLAIMS / NOT OWNER-ACCEPTED FOR IMPLEMENTATION / NOT IMPLEMENTED / NOT INDEPENDENTLY VERIFIED`

> **Решение Владельца в v1.7.** Ни D1, ни D3 не реализуются. Ось 7 не создаётся, скоринг по ней не вводится, корпус `questionnaires.json` не изменяется. Классификация TED Q17, Q9, Q12, Q14 возвращена в `UNRESOLVED` и передана в Dependency Impact Audit. Содержание черновиков сохранено как кандидатное, но статусы понижены.
**Целевой корпус:** `questionnaires.json` SHA-256 `b8b36cc2…24713` (текущий, до правки)

> Реализация поправок изменит хэш корпуса и потребует переустановления посылки
> `KNOWN CONSTITUTIVE CURRENT-ANCHOR INSTANCES = NONE` по CASE-3.4 v1.3 §6.

---

# D1 · РЕСУРСНЫЕ ЯКОРЯ ОСИ 5

Проектировано по T10: *действие ← Феномен, мишень ← Сущность*. Регистр существующих опций сохранён.

Существующие опции Оси 5 **не отменяются**. Разделённый сигнал (напр. Q5-D между STP/STJ и NF/SFJ) остаётся честным исходом: если респондент выбрал именно его, различения действительно нет. Новые опции дают возможность различить тем, кто различает.

---

## NF/NT · «Генерирование идей» / Вера, Знание и Власть

**Ключ различения от NT/STP:** NT/STP тестирует, чтобы решить. NF/NT исследует, чтобы знать. Разница в инструментальности исследования. Существующая Q9-A («competitive investment: talent, R&D, market positioning») — NT/STJ+NT/STP: ресурс идёт в позицию. У NF/NT ресурс идёт в понимание, а авторитет достаётся тому, кто оказался прав.

**EDv2 Q9 (излишек) — новая опция F:**
> Absorbed into open-ended inquiry whose output is understanding rather than a product or a market position. The work is justified by what became known, not by what it returned.

**EDv2 Q10 (повышение: 2 года высокий результат vs 15 лет низкий) — новая опция F:**
> Neither is decided by tenure or by output volume. Resourcing follows whoever has been demonstrably right on the questions that mattered, as judged by those competent to assess the work.

**AEM/TSAM Q5 (дискреционная ёмкость) — новая опция F:**
> To the questions the firm does not yet know the answer to. Senior attention goes where understanding is thinnest, not where return is clearest.

**TED Q3 — новая опция F:**
> Toward open-ended investigation of questions the company treated as important to understand, justified by knowledge gained rather than by return or traction.

---

## NF/SFJ · «Священная война за ресурсы» / Вера людей

**Ключ различения от NF/SFP:** NF/SFP тратит на выражение, NF/SFJ тратит на границу. Ресурс идёт на защиту доктрины и на тех, кто её подтверждает, и изымается у сомневающихся. Мишень — вера людей, значит ресурс производит и охраняет веру.

**EDv2 Q9 — новая опция G:**
> Directed toward defending and propagating the organisation's stated purpose against those who question it. Allocation follows the boundary between those who affirm the mission and those who do not.

**AEM/TSAM Q5 — новая опция G:**
> To the initiatives and people who most visibly affirm the firm's stated purpose. Allocation is itself an act of alignment — support for what is doctrinally sound, withdrawal from what is not.

**TED Q3 — новая опция G:**
> Toward initiatives that demonstrated or defended the company's stated mission, with allocation tracking alignment rather than measured contribution.

---

## STP/STJ · «Вовлечение людей в перераспределение» / Адаптирующиеся люди

**Ключ различения от STJ/STP:** у STJ/STP ресурс просто течёт вверх, низ не видит доли. У STP/STJ ресурс **специально тратится на промежуточный слой** — ровно столько, чтобы участие оставалось выгоднее выхода. Плата за вербовку. `ENV_NS_SCHEMA` называет это «recruitment-into-complicity… binding them by rational incentive (protection + cut)».

**EDv2 Q9 — новая опция H:**
> A visible share is routed to the middle layer that delivers upward — enough that continued participation remains worth more than exit. The remainder passes above them; those below them see little.

**AEM/TSAM Q5 — новая опция H:**
> To the people who reliably bring others in and keep them producing. Allocation buys their continued participation, and their own standing depends on the flow continuing.

**TED Q3 — новая опция H:**
> Toward retaining and rewarding the intermediary layer that delivered results upward, with allocation concentrated where participation needed to be secured.

---

# D3 · ОСЬ 7 И РАЗМЕТКА TED

> **РЕШЕНИЕ ВЛАДЕЛЬЦА В v1.7 — D3 НЕ РЕАЛИЗУЕТСЯ.**
>
> Ось 7 не создаётся. Скоринг по Оси 7 не вводится. Корпус `questionnaires.json` не изменяется. Классификация части вопросов **возвращена в неразрешённое состояние** и передаётся в Dependency Impact Audit.
>
> Владелец принимает вывод независимого аудита v1.6: предложенная в v1.3–v1.6 раскладка была сформулирована увереннее, чем позволяет содержание вопросов.

## Классификация 19 вопросов TED — ЧАСТИЧНО НЕ РЕШЕНА

| Ось | Вопросы | Статус |
|---|---|---|
| **1 · Authority Mechanism** | TED Q1, Q2, Q5, Q13 | кандидатная разметка |
| **2 · Accountability Symmetry** | TED Q6, Q10 | кандидатная разметка |
| **3 · Response to Dissent** | TED Q4, Q16 | кандидатная разметка |
| **4 · Relationship to Innovation** | TED Q8, Q11, Q15, Q19 | кандидатная разметка |
| **5 · Resource Flow Direction** | TED Q3 | кандидатная разметка |
| **6 · Retention Mechanism** | TED Q7 | кандидатная разметка |
| **7 · Phenomenon/Essence Divergence** | **TED Q18** | кандидатная разметка; наиболее ясное наблюдение расхождения |
| **UNRESOLVED / OVERLAPPING** | **TED Q17, Q9, Q12, Q14** | **классификация не решена** |

### Что именно возвращено в неразрешённое состояние

**TED Q17 — снят с Оси 7.** В v1.3–v1.6 Q17 стоял на Оси 7 вместе с Q18. Q17 измеряет **доминирующий лидерский нарратив**; самостоятельно он расхождения не наблюдает. Наблюдаемое расхождение требует сопоставления нарратива с поведением, а Q17 даёт только первую половину пары. Отнесение Q17 к Оси 7 — интерпретация, а не механически установленный факт.

**TED Q9, Q12, Q14 — сняты с `DEAL-PROCESS`.** В v1.3–v1.6 они были объявлены диагностичными, но не осевыми. Все три несут сигналы среды и пересекаются с несколькими смысловыми функциями одновременно — реакция на изменения, раскрытие и подотчётность, идентичность и удержание. Исключительное отнесение к `DEAL-PROCESS` на текущем свидетельстве не обосновано.

**TED Q18 — сохраняется как наиболее ясный случай.** Собственные формулировки автора в опциях Q18 прямо называют характер разрыва: «**aspirational** gap» для восходящего `NF/SFJ` и «narrative **designed** to manage acquirer perception» для нисходящего `STP/STJ`. Это наблюдение расхождения идентичности и поведения, а не нарратива в отдельности.

> **Статус разметки.** `CANDIDATE CLASSIFICATION / NOT OWNER-ACCEPTED / NOT IMPLEMENTED`. Финальная классификация Q17, Q9, Q12, Q14 **не принимается в этом пакете** и относится к Dependency Impact Audit.

## Ось 7 · Phenomenon/Essence Divergence — КАНДИДАТНОЕ ПОНЯТИЕ, НЕ РЕАЛИЗУЕТСЯ

**Определение.** Наблюдаемое расхождение между заявленной организационной идентичностью и действующим механизмом.

**Почему существует только в инструментах внешнего наблюдения.**

> Разрыв между Феноменом и Сущностью структурно недоступен самоотчёту. Субъект внутри среды сообщает Феномен как реальность — он не лжёт, он так видит. Увидеть разрыв может только наблюдатель извне.

Следствия:
- TSAM (самооценка цели) не может иметь Ось 7 по определению
- AEM не может иметь её о себе
- TED и документарное свидетельство — могут

**Ретроспективный кейс есть в точности позиция TED: наблюдение третьей стороны по следам. Ось 7 — естественный дом документарного свидетельства.**

Асимметрия инструментов перестаёт быть дефектом и становится объявленным свойством: у самоотчёта шесть осей, у наблюдения — семь.

> **Архитектурное последствие, зафиксированное в v1.7 как причина не реализовывать.** Сам по себе ярлык оси нового измерения не создаёт. Но **добавление скорируемого вопроса создаёт новую возможность набора сигнала**, а значит:
>
> 1. изменяются знаменатели подсчёта;
> 2. может измениться `evidenceSupportedShare`;
> 3. могут измениться полосы `confidenceBand`;
> 4. TED получает дополнительный вес внутри наблюдения цели, которое далее входит в слияние по цели с наблюдаемой долей против доли самооценки.
>
> Архитектурно возможен и вариант **нескорируемых** наблюдательных метаданных о противоречии. Выбор между скорируемым и нескорируемым вариантом **не сделан** и относится к Dependency Impact Audit.

## Существующие опции TED Q18

| Опция | Среда | Δ | Текст |
|---|---|---|---|
| A | NF/NT | 1 | Strong alignment — the company operated consistently with how it described itself; no meaningful gap |
| B | NF/SFJ | 2 | **Aspirational** gap — described a more sophisticated or evolved culture than it actually demonstrated |
| C | STP/STJ | 1↓ | **Strategic** gap — narrative appeared **designed** to manage acquirer perception; observable behavior followed a different logic |
| D | SFP/SFJ | 1↓ | **Compliance** gap — maintained compliance with external standards while operating internally under a different logic |

## Пять недостающих типов разрыва

### NT/STJ · Δ=1 · Ф=NT(3) / С=STJ(2)
> **Execution gap** — the company's narrative emphasised innovation and technical leadership, while observable operation was disciplined delivery against defined metrics and review cycles. The two were not in conflict; the claim simply ran ahead of the mechanism.

### NT/STP · Δ=2 · Ф=NT(3) / С=STP(1)
> **Control gap** — the company described rigorous process and technical discipline, but observable practice showed decisions taken opportunistically and controls that existed on paper without operating. Documentation described a system that behaviour did not follow.

### STJ/STP · Δ=1 · Ф=STJ(2) / С=STP(1)
> **Authority gap** — the company presented formal rules and clear procedure, but observable outcomes tracked who held leverage at the moment rather than what the rules specified. The procedure was real, and it was applied to those who could not avoid it.

*Последняя фраза отделяет его от Compliance gap: там правило применяется единообразно вниз, здесь избирательно по силе.*

### SFJ/SFP · Δ=1 · Ф=SFJ(2) / С=SFP(1)
> **Continuity gap** — the company described itself through community, care, and shared history, and the description was sincerely held. Observable allocation nonetheless tracked the comfort and standing of long-established insiders rather than the stated commitments.

### NF/SFP · Δ=3 · Ф=NF(4) / С=SFP(1)
> **Meaning gap** — the company articulated purpose and values at the highest register, while observable spending and attention followed what was immediately gratifying to those deciding, with justification supplied afterwards. The distance between stated purpose and operative motive was the widest observed.

## Проверка монотонности шкалы

| Δ | Среда | Характер разрыва |
|---|---|---|
| 1 | NF/NT | нет разрыва |
| 1 | NT/STJ | Execution — узкий, риторический |
| 1 | STJ/STP | Authority — избирательное применение реального правила |
| 1 | SFJ/SFP | Continuity — искренний, неотрефлексированный |
| 1 ↓ | STP/STJ | Strategic — спроектирован под наблюдателя |
| 1 ↓ | SFP/SFJ | Compliance — спроектирован под внешний стандарт |
| 2 | NF/SFJ | Aspirational — заявлена более развитая культура |
| 2 | NT/STP | Control — описанная система не исполняется |
| 3 | NF/SFP | Meaning — максимальная дистанция |

Монотонно: Δ=1 даёт узкие и частные расхождения, Δ=2 — расхождение целого контура, Δ=3 — расхождение мотива.

## Форма: разбиение Q18

Девять опций плюс «не могу ответить» тяжелы для одного вопроса. Остальные оси разбиты по образцу `AXIS N` / `AXIS N (cont.)`. Тот же приём:

**TED Q18 · AXIS 7** — характер расхождения. Семейство унаследованных:
NF/NT · NT/STJ · STJ/STP · SFJ/SFP · NF/SFJ

**TED Q18-cont · AXIS 7 (cont.)** — «когда нарратив и поведение расходились, что расхождение защищало?»:
NT/STP · NF/SFP · STP/STJ · SFP/SFJ

Второй вопрос берёт на себя различение спроектированного разрыва от унаследованного, не спрашивая респондента прямо о намерении — которое он всё равно не мог бы наблюдать.

---

# ПОСЛЕДСТВИЯ РЕАЛИЗАЦИИ

1. Меняется `questionnaires.json` → новый SHA-256
2. По CASE-3.4 v1.3 §6 посылка о пустоте конституирующих якорей становится несвежей и **должна быть переустановлена перечислением**, не предположением. Ожидание: все новые опции поведенческие (ресурсные потоки, наблюдаемое расхождение), пустота должна устоять — но проверить обязательно
3. `ST_ENVIRONMENT_RESOURCE_FORMULAS v0.1` §4 (трассировка) привязан к старому хэшу и требует пересборки
4. По §13.1 мэппинг-пакет фиксирует `questionnaireAuthoritySha256` как неизменяемый вход — **правка инструмента обязана предшествовать печати базы**

---

# ВОПРОСЫ К DEPENDENCY IMPACT AUDIT · добавлено в v1.4

Позиции, выявленные при уточнении оракула подсчёта. К поправкам D1/D3 не относятся, реализации не требуют, но должны быть заданы на шаге 2 плана возврата.

**1. Пространство сред на стороне приобретателя.**
Если некоторые среды занимают роль приобретателя редко или не занимают вовсе, пространство сред на стороне приобретателя меньше девяти. Это меняет пространство пар.

Задать: учитывает ли `candidatePairSelector` различие ролей, и не порождает ли он пары, структурно недостижимые на стороне приобретателя.

**2. Хрупкие ячейки.**
`NF/SFP` как приобретатель имеет **один** уникальный якорь при редкой, но реальной роли — единственная точка отказа (D2 категория **c** в файле `03`).

Задать: существуют ли иные пары «среда × роль» с покрытием, недостаточным для распознавания роли при её наступлении; относится ли это к `AMEND` или к `REVERIFY ONLY`.

**3. Асимметрия инструментов по субъектам.**
Среда приобретателя измеряется 81 уникальным якорем, среда цели — 157. Инструмент приобретателя вдвое тоньше.

Задать: намеренная ли это асимметрия и затрагивает ли она `layeredEvidenceScoring` — в частности знаменатели `evidenceSupportedShare` и полосы `confidenceBand`, которые считаются одинаково для обеих сторон.

**4. Некалибруемые ячейки.**
Перечень пар «среда × роль», которые корпус из десяти кейсов заведомо не покроет, надлежит зафиксировать **до** калибровки.

Задать: где этот перечень хранится и как он попадает в отчёт о калибровке, чтобы молчание корпуса не было принято за подтверждение.
