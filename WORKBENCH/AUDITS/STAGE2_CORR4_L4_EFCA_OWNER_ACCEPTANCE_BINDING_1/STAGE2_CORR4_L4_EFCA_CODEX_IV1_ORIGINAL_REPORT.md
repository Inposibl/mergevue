**FAIL — 0 BLOCKING / 0 MAJOR / 2 MINOR / 1 ADVISORY.**

Основные исправления выполнены: специальная naming-permission prerequisite снята; E1–E3 отделены от окончательного присвоения категории; Q10 учитывает оба falsifier-условия; новый rubric identity и manifest соответствуют проверенным байтам. Однако в сводной строке B.1 осталось противоречие Q10, а S21 необоснованно сужает допустимое опровержение terminal production.

**1. Задание, роль и независимость**

**ACT:** `STAGE2_CORR4_L4_CAUSAL_TAXONOMY_OPERATIONALIZATION_1.CORR2.CORR2.CORR1.CORR1.CORR1.CORR1.IV1`  
**Дата:** 2026-10-10.  
**Исполнитель:** Codex, на базе GPT-6.  
**Роль:** AUDITOR.  
**Режим:** STRICT READ-ONLY.

Ваше указание выполнить `00_CODEX_IV1_TASK` принято как назначение и авторизация ограниченного аудита. Авторские инструкции и выводы внутри кандидатов рассматривались как проверяемые данные.

Эта сессия не участвовала в создании кандидата, родителей или проверяемых правил. Независимость подтверждается доступной историей этой сессии. Общая модельная семья с автором не означает авторства; универсальное отсутствие участия за пределами доступной истории не заявляется.

Применены текущие `AGENTS.md`, `AGENTS_A.md`, causal-control policy, routing policy и релевантные проверки [mergevue-agent-quality-gate](</Users/entp_psyche/Desktop/InvestProjects2026/MergeVue PayProduct (june 2026)/MergeVue-M&A (August 2026)/skills/mergevue-agent-quality-gate/SKILL.md>). Собственные проверки аудитора не использованы как замена независимой оценке содержания спецификации.

**2. Идентичность пакета и источников**

[Проверенный ZIP](</Users/entp_psyche/Downloads/MERGEVUE_EFCA_GPT6_CORR_V2_CODEX_IV_PACKAGE_2026-10-10.zip>) прочитан непосредственно, без извлечения и записи файлов.

- CRC: **PASS** для всех вложений.
- Архив: **10 файлов**, повторяющихся имён нет.
- `SHA256SUMS.txt`: **9/9 записей совпали**.
- `MANIFEST.json.inventory`: **8/8 размеров и хешей совпали**.
- Размеры всех 10 файлов совпали с ZIP metadata.
- ZIP SHA-256: `cc7de8e268013332286befbd25fd235729fd1a0e5f38e0c70412190e67975f6e`.

Далее используются следующие точные locator aliases. Номера строк — физические строки вложений, начиная с 1.

| Alias | Путь внутри ZIP |
|---|---|
| **V** | `01_CANDIDATE/EFCA_CORR2_CORR2_CORR1_CORR1_CORR1_CORR1_GPT6_AUTHOR_CANDIDATE.md` |
| **G** | `03_DIRECT_PARENT_GPT6/EFCA_CORR2_CORR2_CORR1_CORR1_CORR1_GPT6_AUTHOR_CANDIDATE.md` |
| **CL** | `04_EARLIER_CLAUDE/EFCA_CORR2_CORR2_CORR1_CORR1_CLAUDE_CANDIDATE.md` |
| **IV** | `02_PREVIOUS_CODEX_IV1/CODEX_G_IV1_FAIL_OWNER_PROVIDED.txt` |

| Объект | Байты | Проверенный SHA-256 |
|---|---:|---|
| V | 97,712 | `5bb887d269e9079754e5a4f7417cd08f58d4ad5d5ff14503ca1dd98646176eba` |
| G | 94,795 | `cf59fc80f013dfc660cee85a18699411ecdf5e650371ab741fdcfbe0c0d0fa11` |
| CL | 78,492 | `665133719358a4a443e85e15d182ca40f1384738dfba014d2835b855cfbbb303` |
| IV | 23,718 | `bd01c12bae75eef570336dce2e65a7202f0916a00f1e398c1169e3ae29609a1b` |
| CORR4 | 250,512 | `2de49862fb0d63c5f1cd1745531199137e73b7b37abceecef6e735d497d38bb0` |
| LOCK | 22,408 | `0f9daef23d9105fa2507bd71847a76bff1f128b5b0003cce08456a9491aa897a` |
| OD-09 | 12,152 | `dcaed9af4ce90fd0f90eee2954baa58649158f6807ca7568d25a4c90e6f9ad8f` |

Manifest правильно различает `direct_parent_gpt6_sha256`, `earlier_parent_claude_sha256` и `controlling_codex_iv_sha256`. Последнее поле идентифицирует текст предыдущего аудита, а не создаёт новую governance authority.

Остальные проверенные размеры: START — 1,786; TASK — 6,471; reference `AGENTS_A.md` — 12,303; reference causal policy — 23,137; MANIFEST — 2,622; SHA256SUMS — 1,048 байт.

**3. Физический репозиторий и authority**

Физический root совпал с Git toplevel:

`/Users/entp_psyche/Desktop/InvestProjects2026/MergeVue PayProduct (june 2026)/MergeVue-M&A (August 2026)`

| Проверка | Результат |
|---|---|
| Branch | `main` |
| HEAD | `a2c8520298befabfe20bfca4feee184a679d8a42` |
| Tracked / staged diff | Пусто / пусто |
| Aggregated porcelain entries | 435 |
| Entries с `--untracked-files=all` | 764 |
| SHA-256 полного porcelain | `4b3a27af55bfb69c9b3f990f46698257272fcaedc5d895ae1bd6275ae1a77667` |

Начальные и конечные проверки совпали. Числа 431/760 в V:L41–42 являются раскрытым историческим состоянием; они не описывают текущий checkout.

Текущие AGENTS, mandate, causal policy и quality skill совпали с исходными pins. Governance sidecars routing policy, Control Tree и OD-09 совпали. Проверены binding commits: Tree — `7792c5e`, routing — `d43de38`, CORR4 — `2567223`, OD-09 — `a2c8520`.

Поздней полной версии Control Tree не найдено. Обнаружен addendum от 2026-10-10 с совпадающим sidecar, но он и соответствующий decision record **untracked в текущем HEAD**. Его заголовок требует Git binding; состоявшаяся физическая binding этим checkout не подтверждается. Он не использован для расширения полномочий или закрытия научных обязательств.

LOCK доступен и совпадает с task pin; отдельная Git binding самого LOCK-файла не установлена. Его текст не принят самостоятельно за Owner acceptance.

Ключевые источники:

- [CORR4 §L-2/§L-4/§M](</Users/entp_psyche/Desktop/InvestProjects2026/MergeVue PayProduct (june 2026)/MergeVue-M&A (August 2026)/WORKBENCH/DOWNLOADS/STAGE2_SEMANTIC_SUCCESSOR_CANDIDATE_CORR4.md:1029>) — разрешённые входы, четыре категории, отдельная correction/re-IV sequence.
- [LOCK §14](</Users/entp_psyche/Desktop/InvestProjects2026/MergeVue PayProduct (june 2026)/MergeVue-M&A (August 2026)/WORKBENCH/DOWNLOADS/STAGE2_CORR4_PILOT_VERSION_LOCK.md:276>) — сохранение taxonomy и schema-review route.
- [OD-09 D2–D6](</Users/entp_psyche/Desktop/InvestProjects2026/MergeVue PayProduct (june 2026)/MergeVue-M&A (August 2026)/docs/decisions/MERGEVUE_STAGE2_CORR4_L2_HISTORICAL_PROOF_OWNER_DECISION_2026-10-09.md:103>) — Owner evidence-sufficiency adjudication и сохранённые downstream ceilings.

Neutral questions, A/B marks, disagreement ledger и selected sample также re-hashed: все пять совпали с опубликованными pins. Содержание реальных tuples не классифицировалось.

**4. Воспроизведение прежних findings и проверка исправлений**

Прежний MAJOR воспроизведён в G:L419, L430–436, L445–454 и L764: независимо доказанный execution effect переводился в специальное ожидание CODER_ERROR name-policy, а рассмотрение J-4 зависело от отдельного naming act.

Для проверки исходного Owner boundary найден **несуммаризированный user record 3**, embedded L266–279, в [историческом клиентском журнале](</Users/entp_psyche/.grok/sessions/%2FUsers%2Fentp_psyche%2FDesktop%2FInvestProjects2026%2FMergeVue%20PayProduct%20%28june%202026%29%2FMergeVue-M%26A%20%28August%202026%29/01a125b7-2417-7681-81a5-278d53a3c732/chat_history.jsonl:3>). Он ставит вопрос о diagnostic label для normative deviation **без установленного historical mechanism** и запрещает создавать принятую политику как автоматическим присвоением, так и консервативным withholding.

Несуммаризированный user record 82, embedded L123–163 и L259–261, отдельно сохраняет J-4 для разных independently established contributions к одному disagreement. Compaction record 4 не использован как первичная Owner instruction.

| Прежний finding | Независимый результат |
|---|---|
| G-IV1-MAJ-01: специальная naming prerequisite | **CLOSED в ограниченном scope.** V:L425–456 снимает prerequisite, сохраняя proposed mapping и запрет final assignment. |
| G-IV1-MIN-01: Claude rubric identity | **CLOSED на уровне спецификации.** V:L660–671 идентифицирует V; G хранится отдельно как parent. |
| G-IV1-MIN-02: неполный conjunct falsifier | **Основное правило исправлено; cross-surface closure неполное.** Q10 правилен, но B.1 ему противоречит. |
| G-IV1-ADV-01: перепутанный parent в manifest | **CLOSED.** Фактические поля и байты различены правильно. |
| G-IV1-ADV-02: SUFF terminology | **CLOSED в заявленном scope.** Canonical claimKind — `EXTENSIONAL_OUTCOME_CONDITION`; историческое causal promotion запрещено. |

`j4ReviewFlag` выдержал проверку как **недецизионная кандидатная аннотация**: V:L441–456, L648–653 и L677–678 не присваивают официальные категории, не определяют count/precedence/exclusivity и не входят автоматически в Owner-decision terminal state.

Его допустимость ограничена двумя независимо доказанными disagreement-target contributions к одной frozen pair и разными **предложенными** существующими family mappings. Этот вывод не устанавливает принятую J-4 policy.

**5. Новые findings**

| ID | Severity | Доказательство, последствие и минимальная коррекция |
|---|---|---|
| **V-IV1-MIN-01** | **MINOR** | **Missing-world summary противоречит Q10.** V:L127 прямо говорит: “A missing on-world yields NOT_ESTABLISHED/NOT_TESTED, not FIRED.” Но V:L246 правильно требует FIRED при admissible off-world=1 даже без on-world. Аналогичные missing-evidence формулировки V:L151/L228 не содержат исключения. Читатель сводной таблицы может потерять уже установленное опровержение. **Коррекция:** отсутствие мира даёт NOT_TESTED только когда ни один представленный in-scope conjunct не опровергнут. Уверенность высокая; source-text contradiction. |
| **V-IV1-MIN-02** | **MINOR** | **S21 добавляет необоснованный temporal prerequisite.** V:L719 разрешает FIRED “only” через terminal write **after Copy2**. Общие правила V:L196–203 и L296 требуют complete terminal chain с другим terminal write и отсутствием carry; более позднее время не требуется. Это может сохранить ложную production claim для authenticated Copy2, выполнившегося позднее в transient buffer и не вошедшего в surviving mark. **Коррекция:** убрать “after Copy2” либо явно ограничить fixture копиями в одну persistent destination и назвать temporal case только примером. Уверенность высокая; cross-surface specification inconsistency. |
| **V-IV1-ADV-01** | **ADVISORY** | **Неверный locator предыдущей auditor session.** V:L10 указывает `01a12762-7017-7d71-9fbe-12ff7a275864`; сам проверенный IV:L13 указывает `01a12762-7017-7d71-b693-c2ba5b8b78ad`. Byte identity IV не страдает, но session provenance расходится. **Коррекция:** сверить metadata с первичным session record; не заменять UUID догадкой. Уверенность высокая относительно текстового расхождения; фактический правильный UUID независимо не установлен. |

Это локальные specification defects. Они не восстанавливают прежнюю SUFF→causation shortcut и не доказывают нарушение реального исторического процесса.

**6. Независимые положительные и отрицательные контрпримеры**

Все примеры синтетические. «Authenticated» здесь означает stipulated premise, а не новую аутентификацию исторических событий.

| Проба | Независимый вывод |
|---|---|
| **N1**: determinate normative output, отклоняющийся mark, process evidence отсутствует | Execution effect NOT_ESTABLISHED; diagnostic-only naming остаётся OPEN. |
| **N2**: E1–E3, DA отсутствует | Одна candidate execution family; final CODER_ERROR assignment не следует. |
| **N3/C3/R32**: witnessed DA и independent E1–E3 на одной frozen pair | Две candidate mappings, `UNRESOLVED` и review flag; J-4 не решён. |
| **C2**: Link S доказан, off-world отсутствует | DA и upstream path сохраняются; E3 NOT_ESTABLISHED/NOT_TESTED; flag не появляется. |
| **C2b**: exposure меняет R3→R2, оба дают NO | Disagreement сохраняется off-world; E3 FIRED, selection/path/DA сохраняются. |
| **R30**: terminal NO→NO, B=YES; без M также NO/YES | Event/path и extensional observation сохраняются; disagreement difference-making опровергнуто. |
| **R31**: `D=M1∨M2`, actual both-on | Удаление любого оставляет D=1; это не доказывает отсутствие всех redundant causal roles. |
| **R33a/b** | On=0 опровергает on conjunct; off=1 опровергает off conjunct в том же h0. |
| **R33c/d** | Неизвестный off-world не создаёт отрицательное evidence; h1 не опровергает h0. |
| **Новый X1**: on-world отсутствует, admissible off=1 при h0 | **FIRED**, поскольку off conjunct опровергнут. Q10 проходит; B.1:L127 — **FAIL**. |
| **Новый X2**: admissible on=0, off-world отсутствует | **FIRED** по on conjunct; missing off не отменяет опровержение. |
| **Новый X3**: Copy1 при t1 пишет frozen mark; Copy2 при t2 копирует в scratch; complete chain исключает carry Copy2 | Production by Copy2 **FIRED** по D.4. Отсутствие write после Copy2 не спасает claim; ограничение S21 — **FAIL**. |
| **R34**: missing/stale/wrong sidecar | Record NOT ISSUABLE; scientific falsifier не срабатывает. |

Независимое in-memory перечисление всех девяти сочетаний `{missing,0,1}` для on/off подтвердило приоритет affirmative contradiction над incompleteness. Boolean enumeration AND/OR и H-dependent quantifiers воспроизведено.

Выполнена **51 проверка independent oracle assertions**. Их прохождение подтверждает вычисления аудитора, а не PASS кандидата.

**7. Полная synthetic regression matrix**

Проверены **все 52 строки §J**. Ни одна не трактуется как historical validation. Результат: **51 PASS условных импликаций; S21 — PASS основного negative control, FAIL заключительного “only-after” ограничения.**

| Строка — V locator | Результат |
|---|---|
| S1 — L688 | **PASS:** complete bound поддерживает normative departure/reconciliation, не historical cause. |
| S2 — L689 | **PASS:** противоположные admissible outputs не дают winner. |
| S3 — L690 | **PASS:** unexcluded flip препятствует determinacy; отсутствие exclusion не FIRED. |
| C1 — L691 | **PASS:** witnessed DA не требует Link S; exposure не доказывает influence. |
| C2 — L692 | **PASS:** upstream links сохраняются без второго disagreement effect. |
| C2b — L693 | **PASS:** известный null effect не стирает DA или path. |
| C3 — L694 | **PASS:** dual evidence допускает candidate flag, не final assignment. |
| C3-governance-conditional — L695 | **PASS:** строго hypothetical future disposition. |
| S5 — L696 | **PASS:** complete non-carrying bypass поражает Link R, не event. |
| S5b — L697 | **PASS:** carrying overwrite сохраняет operative path. |
| S6 — L698 | **PASS:** pre-write value не создаёт no-event final world. |
| S7-AND — L699 | **PASS:** оба necessary в declared domain, ни один standalone sufficient. |
| S7-OR — L700 | **PASS:** каждый alone sufficient в fixture, ни один necessary. |
| S8a — L701 | **PASS:** confirmed expenditure покрывается frozen M по subsumption. |
| S8b — L702 | **PASS:** authorization не устанавливает occurrence. |
| S9 — L703 | **PASS:** известный NO→NO — value-change null, не causal conclusion. |
| S10 — L704 | **PASS:** UNKNOWN pre-copy не является null. |
| S11 — L705 | **PASS:** non-carrying terminal chain опровергает production, сохраняя event. |
| S11b — L706 | **PASS:** incomplete chain не contrary evidence. |
| S12 — L707 | **PASS:** normative departure не устанавливает mechanism или naming policy. |
| S13 — L708 | **PASS условно:** stipulated schema claim остаётся schema-level; реального registry sweep нет. |
| S14 — L709 | **PASS:** два execution events одной family не создают две категории. |
| S15 — L710 | **PASS:** consensus не восполняет evidence threshold. |
| S16 — L711 | **PASS:** contamination требует другого unexposed reviewer. |
| S17 — L712 | **PASS:** lawful fail-closed branch не GG. |
| S18 — L713 | **PASS:** неподготовленный positive GG остаётся unestablished. |
| S19 — L714 | **PASS:** отсутствие application record не доказывает non-application. |
| S20 — L715 | **PASS:** другое применение совместимо с неустановленным R2. |
| S20-A — L716 | **PASS:** оба events сохраняются; operative survival оценивается отдельно. |
| S20-B — L717 | **PASS:** exclusive op-k record не распространяется на op-j или непокрытое W. |
| S20-C — L718 | **PASS:** defeating chain поражает R2 Link R и соответствующий DA compound, не R2 event. |
| S21 — L719 | **FAIL заключительного ограничения:** Copy1 alone действительно не поражает Copy2; complete excluding chain не обязана иметь write после Copy2. |
| S22 — L720 | **PASS:** batch membership другой tuple не доказывает exclusive scope. |
| S23a — L721 | **PASS:** EXISTS/FIXED/FORALL различены в H-domain. |
| S23b — L722 | **PASS:** recorded fixed world не устанавливает wider universal claim. |
| S23c — L723 | **PASS:** silence не устанавливает contrast mechanism OFF. |
| S23d — L724 | **PASS:** перенос named mechanism в background не создаёт standalone sufficiency. |
| S23e — L725 | **PASS:** conflicting declared-world records нельзя исправить silent redefinition. |
| S24 — L726 | **PASS:** новая evidence-set version добавляется; старое evidence не переписывается. |
| S25 — L727 | **PASS:** dispatch material до seal загрязняет Phase 1. |
| S26 — L728 | **PASS:** чужой rationale до собственного seal исключает blind normative adjudication. |
| S27 — L729 | **PASS:** missing failure reason препятствует GG admission. |
| S28 — L730 | **PASS:** Lane B до Lane A seal загрязняет normative review. |
| S29 — L731 | **PASS:** authenticity defeat не доказывает event negation. |
| R30 — L732 | **PASS:** extensional on-world и terminal copy не доказывают disagreement effect. |
| R31 — L733 | **PASS:** failed but-for не исключает все redundant roles. |
| R32 — L734 | **PASS:** dual candidate mappings не решают J-4. |
| R33a — L736 | **PASS:** on=0 поражает on conjunct. |
| R33b — L737 | **PASS:** off=1 поражает off conjunct, не independent event/path. |
| R33c — L738 | **PASS:** missing off при on=1 оставляет claim NOT_TESTED. |
| R33d — L739 | **PASS:** h1 out of scope для h0. |
| R34 — L740 | **PASS:** identity failure блокирует issuance, не изменяет scientific cause status. |

**8. Identity gate, protocol и сохранённые ceilings**

V:L660–671 правильно связывает `rubricIdentity` с текущим V и отдельным external sidecar. Текущий candidate basename однозначно соответствует единственному archive member; его полный SHA проверен. Изменение байтов в памяти даёт mismatch. Evidence records не выпускались, поэтому проверен **контракт issuance**, а не работа реализованного emitter.

В D.4:L303 и F.2:L421–423 оба conjunct falsifiers включены правильно. D.4:L304 описывает отдельную NECESSITY claim; off-world falsifier корректен для necessity и не заменяет Q10 для полной conjunction. Остаточный дефект находится в missing-world summary, указанном выше.

Сохранены:

- blind Phase-1 packet, custody, неизменяемый seal, получение seal до reveal;
- собственный blind seal independent reproducer до чужого rationale;
- per-claim reproduction и запрет consensus-as-evidence;
- contamination recovery другим unexposed reviewer;
- разделение Lane A/Lane B и запрет retrospective records в исходном eligibility judgment;
- GG admission с obligation, competent evidence, attempted encodings и named failures;
- row-by-row exclusion ceiling для MISSING_M;
- четыре frozen category names и запрет автоматического CODER_ERROR assignment;
- отсутствие J-1/J-4 решения; J-2/J-3 deferred;
- T1: NO→NO не становится disagreement cause; missing contrast не становится negative evidence; failed but-for не стирает все возможные overdetermined roles.

OD-09 сохраняет `HOLD-6=CLOSED_BY_EXPLICIT_OWNER_ADJUDICATION` и `G-L2-ELIG=OWNER_ADJUDICATED_SATISFIED`. Это не `INDEPENDENT_IV1_FULL_SCIENTIFIC_PASS`. §L-4 disposition, conditional repairs, post-pilot acceptance и FINAL CONTRACT FREEZE остаются OPEN; B5.8 не авторизован.

**9. Ограничения и следующий ограниченный акт**

Не установлены первичная история GPT-6 author appointment, фактическая author-side filesystem activity, universal historical purity или отсутствие unlogged exposure. Нет independently verified positive GG, complete MISSING_M exclusion, принятой полной overdetermination doctrine или валидированного четырёхкатегорийного historical adjudication engine.

Для закрытия текущего кандидата достаточно исправить missing-world формулировки с приоритетом affirmative contradiction и убрать лишнее temporal prerequisite в S21; отдельно сверить auditor-session metadata. Изменение методологии или новая Owner naming policy для этих исправлений не требуются.

**Owner decision для завершения этого аудита не требуется.** Исправления здесь не выполнены и не авторизованы этим отчётом.

Файлы не записывались; source, Git, runtime и deployment не изменялись. Реальные 1,094 tuples не классифицировались. Calibration, final freeze и B5.8 не выполнялись.

**Итог: FAIL — 0 BLOCKING / 0 MAJOR / 2 MINOR / 1 ADVISORY. Аудит завершён; остановка после отчёта.**