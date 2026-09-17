# MERGEVUE M&A — 42Q, ИНДИВИДУАЛЬНЫЕ ДАННЫЕ И NAMED-LEADER BEHAVIOR FORECAST

**Файл:** `31_MERGEVUE_42Q_INDIVIDUAL_DATA_AND_NAMED_LEADER_FORECAST_CONTRACT.md`  
**Версия:** 2.1 — adjudication 16 Owner / methodology / legal decisions  
**Дата:** 2026-09-16  
**Язык документа:** русский  
**Язык клиентского UI:** American English  
**Статус:** **OWNER-ACCEPTED / CONTROLLING DESIGN CONTRACT; НЕ ЗАЯВЛЯЕТ ТЕКУЩУЮ PRODUCTION-РЕАЛИЗАЦИЮ**  
**Owner acceptance:** **2026-09-16**  
**Заменяет:** предыдущую версию файла `31` целиком  
**Superseded version:** `31 v2.0` — **HISTORICAL-ONLY**  
**Не изменяет:** `30_MERGEVUE_EXECUTION_EVIDENCE_PACK_CONTRACT.md`

---

## 0. Решение в одном абзаце

42Q в MergeVue не является самостоятельным personality product и не добавляется в обязательный organizational diagnostic. Это отдельный, добровольный и строго ограниченный person-level lane для редких M&A-ситуаций, когда уже доказана зависимость результата сделки от конкретной critical role/person и клиент законно запросил прогноз поведения именно этого человека в определённом deal condition.

Полная методологическая цепочка состоит не из одного опросника, а из двух последовательных инструментов:

`42Q general screener`
→ `candidate direction / ambiguity gate`
→ `один или два conditional type-specific confirmation instruments`
→ `practitioner adjudication`
→ `restricted internal type/function state`
→ `environment + pressure + authority + deal-condition binding`
→ `bounded named-leader behavior forecast`
→ `review / lock / seal / release`
→ `later outcome verification`.

Sandbox реализует только добровольное прохождение первого 42Q в памяти браузера. В текущем `main` нет ни этого runtime-flow, ни production storage, ни подтверждающих инструментов, ни принятого person-level mapping engine, ни клиентского named-leader forecast. Поэтому настоящий контракт описывает точную целевую систему и её fail-closed gates, но не выдаёт её за существующую capability.

> **42Q exists to support one narrow M&A question that organizational evidence cannot answer: how a specific decision-critical person may behave under a defined deal condition. It is not a product for labeling the person.**

---

## 1. Граница authority

### 1.1. Порядок источников

При конфликте применяется следующий порядок:

1. текущая явная Owner-инструкция;
2. `AGENTS.md` и controlling project policies текущего `main`;
3. Owner-accepted Control Tree и Commercial North Star;
4. current mechanical truth в `main`;
5. NewLogic/reporting lineage, где Step 6 описывает person-level typology layer;
6. рабочая схема из `MergeVue PayProduct - z.ai work sandbox` как implementation reference;
7. исходные XLSX из launch corpus как методологические source artifacts;
8. настоящая спецификация как target product contract.

Sandbox и launch corpus не получают production authority только потому, что в них есть код, формулы или таблицы. Их материал должен быть отдельно принят, перенесён в canonical source pack, версионирован и причинно подключён к `main`.

### 1.2. Аудитные якоря

Аудит выполнен относительно:

- `main`: commit `92c2e0df199d017082b653e72b5a6bfbf5bf6a31`;
- sandbox React repo: commit `3719e723c2841e940239be8f99a5b71cb731c415`;
- canonical data model: SHA-256 `c457a53d34de5637243477b90c92087dbdd63b78a5aceed8b407140137f1fa3d`;
- current screen registry: SHA-256 `2bb8c82c64be91fab9c2d59a988be2232ed77b78aba7993869`;
- current prediction ledger implementation: SHA-256 `387278057b46db187373241ddb0f3410a93110a8afa333788fb542d8ae50166f`.

Эти идентификаторы фиксируют основание аудита, а не утверждают принятие новой функциональности.

---

## 2. Что реально существует сейчас

| Область | Текущий `main` | Sandbox | Вывод для `31` |
|---|---|---|---|
| Person-level route | Нет зарегистрированного 42Q/person route | Использует существующие respondent routes `/r/:code` и `/r/:code/modules/:moduleSlug` | Новый публичный route не придумывать; будущая интеграция должна использовать authorized invitation/workspace architecture |
| General 42Q content | Физического canonical instrument pack нет | 42 вопроса `Q42_01…Q42_42` извлечены в JSON и runtime data | Контент можно переносить только с source manifest и hash gate |
| 42Q UI | Нет | Consent → один вопрос за раз → YES/NO → local completion | Interaction pattern пригоден как reference, но не как production data architecture |
| Persistence | Нет | Ответы живут только в React state и исчезают при refresh; roster/status частично хранится в `localStorage` | Для production неприемлемо; нужен restricted server-side store |
| Confirmation stage | Нет | Нет | Обязательно достроить все 16 conditional instruments и ambiguity routing |
| Scoring | Нет | UI не считает тип; adapter не включён в runtime | Scoring только server-side после полной submit |
| Typology connector | Нет | Валидирует closed domain, затем intentionally fails closed | Сохранить fail-closed; не подменять отсутствующие accepted maps догадками |
| Named-leader forecast | Нет | Нет | Это отдельный downstream product object, а не экран результата 42Q |
| Report projection | Нет | Нет | Только bounded behavior forecast; raw answers/type labels запрещены |
| Verification | Общая prediction/verification foundation существует, но требует hardening по `26`–`27` | Нет end-to-end | Person forecast подключается только к hardened lock/seal/verification chain |

### 2.1. Что именно доказано в sandbox

Sandbox даёт полезную рабочую схему:

- consent предшествует первому вопросу;
- участие можно отклонить;
- показывается один вопрос за раз;
- сохранены exact IDs, order, text и `yes_no` response type;
- в UI не выводятся scoring poles;
- completion/decline отделены от Track 1;
- malformed 42Q objects валидатором закрываются;
- connector не создаёт type/person label и не проецирует данные в report;
- verifier даёт `23/23 PASS`, но сам явно называет результат `GATE_GREEN_WITH_KNOWN_GAPS`, а не acceptance или production readiness.

### 2.2. Что sandbox не доказывает

Sandbox не доказывает:

- законность хранения person-level data;
- production consent/notice;
- durable storage;
- authorized scoring;
- source acceptance;
- completion 16 confirmation instruments;
- correct type adjudication;
- accepted type → dominant-function map;
- accepted environment-pressure mapping;
- empirical validity of transition rates;
- named-leader forecast;
- report release authority;
- lock/seal integrity;
- production end-to-end causality.

---

## 3. Product purpose и non-purpose

### 3.1. Допустимая цель

Допустима только такая цель:

> установить, достаточно ли individual evidence, чтобы сформировать ограниченный прогноз наблюдаемого поведения конкретного decision-critical leader в заранее указанном M&A-контексте и временном окне.

### 3.2. 42Q не является

42Q не является:

- обязательной частью organizational forecast;
- generic personality test;
- employee assessment platform;
- leadership ranking;
- психиатрической или клинической диагностикой;
- инструментом определения «качества человека»;
- заменой behavioral evidence;
- заменой role/authority analysis;
- основанием для автоматического найма, увольнения, повышения, понижения, compensation или retention decision;
- публичным profile card;
- типологическим feedback product для респондента;
- источником person ECS;
- основанием для red/amber/green executive badge;
- основанием для скрытого proxy-typing по LinkedIn, биографии, фото, речи, видео или публичным интервью.

### 3.3. Организационный прогноз независим

`Organizational forecast does not require 42Q.`

Отказ, отсутствие или незавершённость 42Q:

- не блокирует организационный diagnostic;
- не считается negative evidence;
- не снижает score компании;
- не создаёт reliability flag человеку;
- не разрешает proxy inference;
- не может быть раскрыта как «нежелание сотрудничать» в report.

---

## 4. Activation gate: когда lane вообще может открыться

Высокий organizational risk сам по себе не запускает 42Q. До приглашения человека должны быть выполнены все условия:

1. существует active Deal;
2. organizational diagnostic уже выявил конкретную decision dependency;
3. dependency выражена цепочкой:
   `deal objective → required capability → decision process / operating routine → critical role → person dependency → execution consequence`;
4. конкретный человек действительно занимает или ожидаемо займёт эту роль;
5. зафиксирован named decision question, который нельзя разумно разрешить только organizational evidence;
6. клиент явно запросил person-specific forecast;
7. зафиксированы purpose, intended recipients и allowed use;
8. определены lawful basis, notice/consent requirements и data controller/processor boundaries;
9. участие может быть предложено без автоматического adverse consequence;
10. authorized analyst подтвердил proportionality и minimum necessity;
11. нет конфликтующего rights restriction;
12. instrument/version/legal copy готовы к использованию.

Если хотя бы одно условие не выполнено, итоговый статус — `INELIGIBLE_OR_NOT_AUTHORIZED`; приглашение не создаётся.

### 4.1. Обязательные поля request record

Внутренний request должен содержать:

- `deal_id`;
- `critical_role_dependency_id`;
- person/role reference;
- exact decision question;
- named deal condition;
- observation window candidate;
- expected business consequence;
- requestor identity and authority;
- declared purpose;
- declared recipient set;
- allowed-use code;
- legal/rights review state;
- analyst eligibility decision;
- reason if rejected.

CTA на клиентской поверхности — **`Submit for eligibility review`**, а не `Send assessment`.

---

## 5. Полный lifecycle

```text
NOT REQUESTED
  → ELIGIBILITY REVIEW
      → INELIGIBLE / RIGHTS BLOCKED / NOT NECESSARY
      → APPROVED TO INVITE
          → INVITED
              → DECLINED / EXPIRED / WITHDRAWN BEFORE SUBMIT
              → NOTICE ACKNOWLEDGED + PARTICIPATION AUTHORIZED
                  → GENERAL 42Q IN PROGRESS
                      → INCOMPLETE / EXPIRED
                      → GENERAL 42Q SUBMITTED
                          → SCREENER INVALID
                          → SCREENER AMBIGUOUS
                          → CONFIRMATION ASSIGNMENT
                              → TYPE-SPECIFIC 42Q IN PROGRESS
                                  → INCOMPLETE / EXPIRED
                                  → CONFIRMATION SUBMITTED
                                      → NOT CONFIRMED
                                      → PRACTITIONER REVIEW REQUIRED
                                      → SOURCE-RULE CONFIRMED
                                          → CONTEXT BINDING
                                              → CONTEXT INCOMPLETE
                                              → FORECAST CANDIDATE
                                                  → ANALYST REVIEW
                                                      → REJECTED / CANNOT DETERMINE
                                                      → APPROVED
                                                          → LOCKED
                                                              → SEALED
                                                                  → RELEASED
                                                                      → LATER VERIFIED
```

Ни `questionnaire completed`, ни `source-rule confirmed`, ни `analyst reviewed` не равны `forecast released`.

---

## 6. Canonical instrument pack

### 6.1. Stage 1 — General Type Screener

Источник: `ST_General_Type_Screener_42Q_v2.xlsx`, sheet `ST_General_Screener`.

Нормативные свойства:

- ровно 42 вопроса;
- IDs `Q42_01`…`Q42_42`;
- порядок 1…42;
- ответ только `YES` или `NO`;
- вопрос, ID, порядок и response type неизменяемы;
- никаких randomization, adaptive wording или LLM paraphrase;
- `axis`, `focus`, pole mapping и rationale — internal metadata;
- browser/client получает только нужный question text, ordinal progress и `Yes/No` options;
- scoring metadata не должен поставляться в public JavaScript bundle.

Структура:

| Вопросы | Source axis | Назначение |
|---|---|---|
| Q1–Q6 | S/N | directional evidence |
| Q7–Q12 | T/F | directional evidence |
| Q13–Q18 | J/P | directional evidence |
| Q19–Q24 | E/I | directional evidence |
| Q25–Q30 | SFP/SFJ; workbook summary labels SP/SJ | temperament cross-check |
| Q31–Q36 | NT/NF | temperament cross-check |
| Q37–Q42 | Stack | dominant-function clues; отдельное accepted aggregation rule отсутствует |

### 6.2. Stage 2 — Type-specific confirmation

Screener не завершает type determination. Он выбирает candidate direction для одного из 16 conditional workbooks.

Каждый type-specific workbook содержит 42 вопроса:

- Layer 1 — Full Type: 15;
- Layer 2 — Function Stack: 10;
- Layer 3 — Temperament: 9;
- Layer 4 — E/I Validation: 8.

Итого nominal path без ambiguity — **84 answers**: 42 general + 42 confirmation. При one-axis ambiguity может потребоваться второй confirmation instrument. Production v1 не допускает больше двух type-specific confirmation instruments в рамках одного assessment act; unresolved case после второго instrument завершается без type determination.

Все 16 workbook question texts, order, response types и practitioner rationales считаются source-bound. Practitioner rationale никогда не показывается participant/client.

В проверенных type-specific workbooks scoring cells не содержат готового вычислительного runtime: source задаёт вопросы, четыре слоя, thresholds и differential guidance. Поэтому production engine должен воспроизводить принятые правила детерминированно и проверяться на fixtures; он не может ссылаться на «автоматический расчёт в XLSX», которого в этих файлах нет.

### 6.3. Source manifest

До runtime integration должен появиться один versioned manifest, содержащий:

- logical instrument ID;
- source filename;
- source sheet;
- SHA-256;
- item count;
- stable item IDs;
- item order;
- response domain;
- scoring-rule version;
- authority status;
- accepted-at / accepted-by reference;
- supersedes/superseded-by;
- legal-copy compatibility version.

Hash mismatch, missing source, duplicate ID или altered order блокируют instrument load.

---

## 7. General 42Q scoring contract

### 7.1. Completeness gate

Scoring разрешён только если:

- присутствуют все 42 unique IDs;
- domain точно `Q42_01…Q42_42`;
- каждый ответ точно `YES` или `NO`;
- instrument version совпадает с manifest;
- consent/notice version действовала на момент submit;
- server принял idempotent final submit;
- session не withdrawn, expired или rights-blocked.

Любая ошибка даёт `SCREENER_INVALID`; partial estimate запрещён.

### 7.2. Directional counts

Для первых шести блоков используется source pole mapping: каждый `YES/NO` добавляет один балл ровно одному полюсу. В каждом блоке шесть ответов.

`axis_difference = abs(left_pole_score - right_pole_score)`

Source confidence vocabulary:

- `Strong`: difference ≥ 4;
- `Moderate`: difference ≥ 2;
- `Borderline`: difference < 2;
- `Incomplete`: не score, а blocked state.

Эта confidence относится только к directional separation внутри screener. Она не является confidence поведения, прогнозной точности или качества человека.

### 7.3. Candidate type

Candidate four-letter direction строится только из E/I, S/N, T/F и J/P. SP/SJ и NT/NF используются как cross-check; Stack — как internal clue.

Исходная Excel-формула в row 67 использует `>=` и при tie неявно выбирает E/S/T/J. Production implementation не имеет права воспроизводить этот silent tie bias.

Нормативное правило:

- любой tie/borderline по четырём основным axes → `SCREENER_AMBIGUOUS`;
- single candidate type не присваивается;
- type-specific route не выбирается silent default;
- **0 ambiguous axes:** назначается ровно один confirmation instrument для единственного candidate type;
- **1 ambiguous axis:** назначаются ровно два adjacent candidate confirmation instruments, различающиеся только по этой axis;
- **2–4 ambiguous axes:** автоматический Cartesian routing (`2^k` questionnaires) запрещён; состояние сразу → `PRACTITIONER_REVIEW_REQUIRED`;
- practitioner может сузить multi-axis ambiguity только до **одной adjacent candidate pair** на основании screener cross-checks, Stack clues и source-defined differential guidance; решение и rationale сохраняются;
- если practitioner не может законно сузить ambiguity до одной adjacent pair, результат → `TYPE_NOT_DETERMINABLE`;
- production v1 cap — **не более двух type-specific confirmation instruments всего на один assessment act**;
- третья и последующие confirmation questionnaires не разрешены ordinary practitioner discretion и требуют отдельного methodology act.

### 7.4. Stack gap

Вопросы Q37–Q42 содержат pole metadata, но General Screener не содержит принятой полной deterministic aggregation formula для dominant function. Sandbox connector правильно блокирует derivation.

Следовательно:

- нельзя выводить dominant function напрямую из Q37–Q42;
- нельзя подставлять mapping из памяти модели;
- нельзя считать row 67 display string достаточным computational authority;
- dominant function появляется только после confirmed type и accepted `TYPE_FUNCTION_INDEX`.

---

## 8. Type-specific confirmation contract

### 8.1. Source thresholds

| Layer | Max | Pass | Explicit fail/reconsider | Неопределённая зона |
|---|---:|---:|---:|---:|
| Full Type | 15 | ≥12 | ≤7 | 8–11 |
| Function Stack | 10 | ≥8 | ≤5 | 6–7 |
| Temperament | 9 | ≥7 | ≤4 | 5–6 |
| E/I Validation | 8 | ≥6 | ≤4 | 5 |

Source workbook формулирует `all four layers pass → type confirmed with high confidence`. В продукте это хранится как `SOURCE_RULE_CONFIRMED`, а не как доказанная psychometric или predictive validity.

### 8.2. Adjudication

Для одного confirmation instrument:

- все четыре layers pass → `SOURCE_RULE_CONFIRMED`;
- хотя бы один layer в неопределённой зоне → `PRACTITIONER_REVIEW_REQUIRED`;
- explicit fail → `TYPE_NOT_CONFIRMED` и только source-defined differential candidates;
- contradictory temperament/stack evidence → `PRACTITIONER_REVIEW_REQUIRED`;
- analyst/practitioner не имеет права менять thresholds в конкретной сделке.

Для двух confirmation instruments:

- **ровно один** имеет `SOURCE_RULE_CONFIRMED`, второй имеет explicit `TYPE_NOT_CONFIRMED`, и нет unresolved contradiction → practitioner может зафиксировать `TYPE_CONFIRMED_AFTER_DIFFERENTIAL_REVIEW` с обязательным rationale;
- один confirmed + второй `PRACTITIONER_REVIEW_REQUIRED` → final type не присваивается; если ambiguity нельзя разрешить без нового instrument, результат → `TYPE_NOT_DETERMINABLE`;
- оба `SOURCE_RULE_CONFIRMED` → `MULTI_CONFIRMATION_CONFLICT`; final type не присваивается;
- оба `TYPE_NOT_CONFIRMED` → `TYPE_NOT_DETERMINABLE`;
- любое противоречие между Full Type / Function Stack / Temperament / E/I Validation, которое не разрешается source rule, сохраняется как contradiction и блокирует downstream forecast;
- averaging, majority vote и выбор «более подходящего» результата запрещены;
- третья confirmation questionnaire в production v1 запрещена; unresolved case завершается fail-closed.

### 8.3. Internal type record

После подтверждения создаётся restricted record:

- internal type code;
- source-rule status;
- four layer scores;
- screener directional scores;
- instrument versions/hashes;
- scoring algorithm version;
- practitioner decision and rationale;
- contradictions/ambiguities;
- timestamp;
- rights state;
- allowed downstream uses.

Этот record:

- не является client deliverable;
- не показывается participant;
- не входит в обычный report payload;
- не доступен account owner по умолчанию;
- не индексируется общим search/RAG;
- не используется вне Deal без отдельного права.

---

## 9. Consent, notice и participant safety

### 9.1. Обязательные свойства

До первого вопроса participant должен получить точное уведомление:

- кто запросил assessment;
- к какой сделке/роли он относится;
- зачем собираются ответы;
- добровольно ли участие и каковы последствия отказа;
- кто увидит raw answers;
- что увидит client;
- будет ли результат влиять на employment decisions;
- где и как данные хранятся;
- применимый retention/deletion rule;
- как остановиться, отозвать участие или задать вопрос;
- что automated adverse decision не создаётся;
- что type/personality label не выводится.

### 9.2. Нельзя переносить sandbox promise

Sandbox говорит: answers live only in browser, are erased on refresh, not saved or shared. После добавления server persistence эта фраза становится ложной и должна быть удалена. Production copy обязана описывать реальный storage path.

### 9.3. Draft participant copy — American English

Следующий текст — product copy baseline, но legal/DPO sign-off остаётся release gate:

> **Optional leadership behavior assessment**
>
> You are being invited to complete two short sets of yes-or-no questions about how you tend to make decisions and respond to work conditions. The first set identifies a possible direction. A second set may be required before any assessment can be reviewed.
>
> Participation is optional. Choosing not to participate does not create a negative assessment and does not affect the organizational diagnostic.
>
> MergeVue does not show you or the client a personality type. Your item-level answers are available only to authorized reviewers and are not included in the client report. Any client-facing output is limited to a human-reviewed forecast of observable behavior under a defined deal condition.
>
> No automated employment decision is made from your answers. This assessment must not be used by itself to make hiring, termination, promotion, compensation, or retention decisions.
>
> Your invitation identifies the assessment purpose, authorized recipients, data-use terms, and the coordinator you can contact with questions or a withdrawal request.

Buttons:

- `I have read this and agree to continue`
- `Not now`

### 9.4. Decline and withdrawal

Decline creates only a minimal audit event: invitation resolved as declined. Оно не создаёт type, score или negative inference.

Withdrawal после submit должен:

- немедленно блокировать новое scoring/forecast use;
- открыть rights review;
- пометить derived artifacts affected;
- не удалять audit evidence молча;
- применить outcome, предписанный утверждённой legal/retention policy.

Поскольку binding retention/deletion periods в текущем `main` не установлены, этот контракт не придумывает количество дней. Без принятой policy production release заблокирован.

### 9.5. Legal-basis gate

Методология 42Q не содержит универсального legal basis и не должна его придумывать. До создания invitation server должен иметь действующий `LegalBasisDecision` / эквивалентный authority record для конкретного deployment context.

Минимально record должен связывать:

- jurisdiction;
- relationship context человека с Deal/organization;
- purpose индивидуальной оценки;
- controller / processor roles;
- approved legal basis или договорную authority reference;
- notice/privacy-policy version;
- permitted recipients / downstream use;
- approving legal/DPO/counsel authority;
- effective date / expiry, если применимо.

Если такой record отсутствует, устарел или не покрывает конкретный relationship context:

> `LEGAL_BASIS_NOT_ESTABLISHED` → invitation и первый вопрос блокируются.

Exact legal basis не является Owner/model default. Для production first release разрешены только те jurisdiction × relationship contexts, которые заранее покрыты утверждённой legal matrix.

### 9.6. Retention, deletion, withdrawal и legal hold

Retention определяется **по data class и purpose**, а не одним универсальным сроком. До production должна существовать утверждённая policy matrix как минимум для:

- identity mapping;
- raw 42Q responses;
- screener/confirmation derivations;
- internal type/function state;
- released forecast;
- audit events;
- seal/verification records;
- backups/derived indexes.

Этот контракт не назначает количество дней.

Нормативно уже фиксируется:

- withdrawal немедленно блокирует новое scoring, mapping и forecast use;
- invite/session access отзывается;
- affected derived artifacts получают rights-review state;
- audit history не удаляется молча;
- deletion выполняется только по утверждённой policy;
- legal hold может приостановить ordinary deletion только через отдельную авторизованную legal process;
- отсутствие retention/deletion policy → `PRODUCTION_RELEASE_BLOCKED`.

---

## 10. UX contract

### 10.1. Client request surface

Title: `Request a named-leader forecast`

Explanatory copy:

> Use this request only when a specific leader's decision behavior is material to the deal and the organizational assessment cannot answer the question on its own. Submission starts an eligibility review; it does not send an assessment automatically.

Required fields:

- `Why is this role decision-critical?`
- `What deal decision or execution outcome depends on this person?`
- `Under what specific condition should behavior be forecast?`
- `What observation window matters?`
- `Who may receive the resulting forecast?`
- `What decision will the forecast inform?`

CTA: `Submit for eligibility review`.

### 10.1.1. Requester authority gate

Free-text заявления `I am authorized` недостаточно.

Request может перейти в individual-assessment eligibility только если:

- requester authenticated;
- requester имеет server-authoritative Deal permission на запрос person-level assessment;
- permission выдана через engagement / organization authority, а не self-asserted в форме;
- Deal и named role/person находятся в scope этой authority;
- указаны purpose, intended recipients и decision use;
- jurisdiction × relationship context проходит §9.5 legal-basis gate;
- participant authorization остаётся отдельным gate и не заменяется requester authority.

Conceptual permission label:

`REQUEST_NAMED_LEADER_ASSESSMENT`

— это target permission semantic, а не утверждение о существующем RBAC enum в `main`.

Если server permission или legal-basis coverage отсутствуют:

> `REQUESTER_AUTHORITY_NOT_ESTABLISHED` → invitation не создаётся.

Product не требует загружать отдельный «документ-доказательство полномочий», если approved engagement/access policy уже является достаточным authority source; дополнительное доказательство запрашивается только если это требует утверждённая legal/enterprise policy.

### 10.2. Participant flow

- page title: `Leadership behavior assessment`;
- progress: `Question {n} of 42`;
- options: `Yes` / `No`;
- neutral validation: `Select Yes or No to continue.`;
- no axis, pole, score, type or “correct answer”;
- no result preview;
- no comparison with peers;
- no social sharing;
- no persuasive copy after decline.

Перед Stage 2:

> **Additional questions are needed**
>
> The first set does not produce a final result. Please complete one additional set so an authorized reviewer can determine whether the assessment is sufficiently clear to use.

Completion:

> **Your assessment was submitted**
>
> Thank you. No result is displayed here. An authorized reviewer will assess the responses in the context of the stated deal question. You may now close this window.

Decline:

> **You chose not to continue**
>
> No individual assessment result was created. You may now close this window.

Incomplete/expired:

> **This assessment is not complete**
>
> No result has been created. Contact the coordinator named in your invitation if you need a new access link.

### 10.3. Analyst statuses

Safe labels:

- `Eligibility review`
- `Invitation pending`
- `Participant declined`
- `Assessment in progress`
- `Additional confirmation required`
- `Practitioner review required`
- `Insufficient individual evidence`
- `Context evidence incomplete`
- `Forecast candidate ready for review`
- `Forecast locked`
- `Released`
- `Cannot determine`

Client не видит type code, function stack, layer scores, individual answers или analyst rationale.

---

## 11. Storage и security architecture

### 11.1. Отдельная data lane

42Q не должен переиспользовать обычный `Answer` бездумно. Текущий `Answer` предназначен для organizational evidence и содержит direct-observation/evidence-calibration semantics, которые не соответствуют self-report typology items.

Нужна отдельная restricted lane, связанная с Deal только через controlled references:

| Logical object | Содержание | Чувствительность |
|---|---|---|
| `IndividualAssessmentRequest` | purpose, role dependency, requester, eligibility | confidential |
| `AssessmentParticipant` | pseudonymous participant ID; identity mapping отдельно | highly restricted |
| `AssessmentInvitation` | token hash, expiry, delivery/audit state | restricted |
| `ParticipationAuthorization` | notice version, choice, timestamp, rights state | highly restricted |
| `InstrumentSession` | instrument/version, state, started/submitted time | highly restricted |
| `IndividualItemResponse` | item ID + YES/NO | most restricted |
| `ScreenerDerivation` | axis counts, ambiguity, candidate set | most restricted |
| `ConfirmationDerivation` | four layer counts and source-rule state | most restricted |
| `InternalTypeDetermination` | restricted type/function state | most restricted |
| `BehaviorForecastCandidate` | bounded client-safe draft | confidential |
| `AssessmentAuditEvent` | IDs, state transitions, hashes; no raw answers | restricted |

### 11.2. Storage rules

- durable server-side store;
- encryption in transit and at rest;
- raw responses and identity mapping logically separated;
- access by explicit role/purpose, not account membership alone;
- invitation tokens stored hashed;
- short-lived sessions and revocable access;
- idempotent submit;
- immutable submitted response version;
- corrected response requires new version and reason, not overwrite;
- no raw answers in logs, traces, analytics, error messages or support exports;
- no localStorage/sessionStorage authority;
- no client-supplied score/type/function authority;
- server recomputes all derivations from canonical responses;
- report renderer receives only approved client-safe projection;
- backups, exports and deletion follow the same rights policy;
- no silent cross-client RAG, training or benchmark use.

### 11.3. Access matrix

| Actor | Invite status | Raw answers | Internal type | Forecast draft | Released forecast |
|---|---:|---:|---:|---:|---:|
| Participant | own status | own input during allowed edit window only | no | no | only if a separately approved participant-output policy exists |
| Client account owner | bounded status | no | no | no | yes, if named recipient |
| Analyst | yes | yes, purpose-bound | yes | yes | yes |
| Practitioner reviewer | yes | yes when escalated | yes | yes | yes |
| Support | operational only | no | no | no | no by default |
| Engineer/operator | metadata only | no routine access | no | no | no |
| Benchmark/R&D | no direct identity | no by default | no by default | no | only separately rights-eligible de-identified record |

### 11.4. Controlling raw-answer access rule

Raw answers доступны только ролям, которым они нужны для конкретного case adjudication:

- assigned analyst — purpose-bound;
- practitioner reviewer — только при назначенной/escalated review;
- participant — только собственные ответы в разрешённом edit/review window до immutable submit, если instrument flow это допускает.

По умолчанию raw answers **не доступны**:

- client account owner;
- ordinary Deal collaborator;
- support;
- engineer/operator;
- marketing/sales;
- Benchmark/R&D;
- другому Deal analyst без assignment.

Account membership, admin UI и технический доступ к инфраструктуре сами по себе не создают permission читать raw answers. Любой emergency/break-glass access, если он будет нужен, требует отдельной security policy и audit; настоящий контракт его не авторизует.

---

## 12. Internal mapping: type is not yet a forecast

### 12.1. Required context graph

Даже source-rule confirmed type не создаёт named-leader forecast. Нужны:

`confirmed individual result`
→ `accepted type-to-function index`
→ `confirmed role and authority`
→ `organizational environment state`
→ `relevant pressure vector [AL, EF, CB, SD, ORA]`
→ `specific deal condition`
→ `observable decision behavior hypothesis`
→ `execution consequence`
→ `falsifier and observation window`.

### 12.2. Source assets

Launch corpus содержит:

- `Most_important_file__MBTI_Dynamic_Hierarchy_v2.xlsx`;
- `ST_Dominant_Function_Pressure_Map_v1.xlsx`;
- `ST_Environment_Pressure_Profile_v1.xlsx`;
- `ST_Transition_Rate_Engine_v1.xlsx`;
- `ST_Master_Resource_Database_v2.xlsx`;
- 16 resource profiles и дополнительные matrices.

Но текущий `main` не содержит accepted canonical runtime pack этих файлов. Generated NewLogic manifest называет их present/required; это lineage evidence, а не физическая production authority.

### 12.3. Известные gaps

1. Sandbox connector не находит accepted `FUNCTION_MAP`, `Base_Rate` и vulnerability weights в canonical application tree и потому правильно fails closed.
2. Launch-corpus pressure map содержит такие таблицы, но объявляет weights theory-derived и calibration pending.
3. Transition engine base rates имеют `N=0` для всех восьми dominant functions и прямо называются theory-derived priors.
4. Transition engine предлагает сужать confidence band после N≥10; это source protocol, не доказанная calibration policy.
5. Pressure map ссылается на `ST_Signal_Coding_Library.xlsx`, но в проверенных main/sandbox corpus paths этот файл не найден.
6. Dynamic hierarchy использует legacy language `Persona`, `Shadow`, `NEUROSIS`; transition engine использует `TOXIC`. Эти термины не разрешены в client output и требуют отдельного methodology/legal review даже для internal use.
7. `ST_Master_Resource_Database_v2.xlsx` требует отдельной extraction/authority verification; наличие файла не доказывает usable runtime semantics.

До закрытия этих gaps pipeline останавливается на `SOURCE_RULE_CONFIRMED`; клиентский forecast не создаётся.

### 12.4. Promotion gate

Чтобы подключить mapping к `main`, необходимо:

- физически внести source pack в controlled main path;
- создать hash/version manifest;
- принять точный `TYPE_FUNCTION_INDEX`;
- принять exact pressure parameters и weights;
- принять environment-state vocabulary и удалить/изолировать medicalized labels;
- восстановить missing signal authority либо удалить зависимость;
- принять base-rate policy;
- реализовать deterministic server engine без silent fallbacks;
- сравнить outputs с XLSX fixtures;
- подтвердить causal reachability до forecast eligibility;
- пройти independent verification.

### 12.5. `TYPE_FUNCTION_INDEX` — disposition

`TYPE_FUNCTION_INDEX` из `ST_Dominant_Function_Pressure_Map_v1.xlsx` **не принимается автоматически и не принимается «без изменений» только на основании наличия таблицы в source workbook**.

Controlling disposition:

- source table остаётся `CANDIDATE_MAPPING`;
- до runtime use нужен отдельный row-by-row extraction + parity audit;
- mapping должен быть сопоставлен с accepted Dynamic Hierarchy/type definitions;
- любые duplicate/missing/conflicting type rows блокируют acceptance;
- после проверки mapping получает собственный version/hash/authority record;
- до этого `acceptedTypeFunctionIndex = null` и downstream person forecast blocked.

Таким образом решение по вопросу «принимается ли без изменений» — **NO**. Допускается последующее принятие exact extracted mapping только отдельным methodology/source act.

### 12.6. Missing `ST_Signal_Coding_Library.xlsx` — disposition

Missing source **не реконструируется по памяти, naming conventions, neighboring spreadsheets или LLM inference**.

Production v1 rule:

- dependency state = `MISSING_SIGNAL_AUTHORITY`;
- 42Q capture, screener и source-rule type confirmation могут существовать независимо, если им этот файл не нужен;
- любой downstream mapping/forecast path, causal reachability которого зависит от signal coding library, блокируется;
- восстановление возможно только через физически найденный source artifact с identity/provenance либо через отдельный Owner/methodology act, который **явно удаляет зависимость или принимает новый replacement authority**;
- replacement не может называться «восстановлением» старого файла без доказанной parity.

### 12.7. Legacy terminology — disposition

`NEUROSIS`, `TOXIC`, `Persona`, `Shadow`:

- запрещены в participant-facing и client-facing output;
- запрещены как новые active business/runtime states;
- могут сохраняться только в immutable source snapshots, parity fixtures и namespaced compatibility metadata, где literal legacy token нужен для воспроизводимости source;
- наличие legacy token не разрешает медицинскую, клиническую, моральную или personality-label интерпретацию;
- до Phase 4 acceptance active runtime должен использовать отдельно принятую neutral state vocabulary или fail closed, если neutral one-to-one mapping отсутствует.

Иными словами, internal use разрешён только как **source-preservation token**, не как operating semantic.

---

## 13. Named-leader behavior forecast contract

### 13.1. Допустимая форма

Клиентский объект содержит только:

- subject name/role, если раскрытие authorized;
- `as_of` date;
- exact deal condition;
- expected observable behavior;
- first observable signs;
- observation context;
- observation window;
- likely execution consequence;
- recommended control;
- falsification condition;
- evidence-basis summary;
- confidence and limitations;
- forecast ID/version;
- lock/seal state.

Структура утверждения:

> **Under [defined deal condition], [named leader/role] is expected to [observable decision behavior] within [window]. Watch for [observable signs] in [context]. This forecast would be weakened or falsified if [condition].**

### 13.2. Запрещённые формулировки

Запрещено:

- `is an INTJ/ENFJ/...`;
- `has Persona/Shadow ...`;
- `is toxic/neurotic`;
- `is a retention risk` без condition/evidence;
- `will leave`;
- `cannot lead`;
- `culture fit` score;
- probability/accuracy percentage без calibrated eligible corpus;
- moral, clinical или identity claim;
- скрытая рекомендация уволить/заменить человека.

### 13.3. Evidence minimum

Forecast candidate блокируется, если отсутствует хотя бы одно:

- source-rule confirmed individual result;
- accepted mapping version;
- verified critical-role/person dependency;
- role/authority evidence;
- organizational environment state;
- relevant pressure/context input;
- exact condition and time window;
- observable signs;
- falsifier;
- analyst approval;
- rights permission for named disclosure.

Type alone не является достаточным evidence basis.

### 13.4. Confidence

Нужно разделять:

- `instrument separation strength`;
- `source-rule confirmation status`;
- `context evidence quality`;
- `forecast confidence`;
- `later verification outcome`.

Один показатель не может подменять другой. Пока type-to-pressure/time mappings остаются theory-derived и uncalibrated, они не поддерживают high-confidence client claim. Product может хранить их как internal hypothesis only; release зависит от отдельно принятой methodology gate.

### 13.5. Pilot-only internal hypothesis до calibration

**Разрешается**, но только как отдельный R&D/pilot state:

`INTERNAL_UNCALIBRATED_PERSON_HYPOTHESIS`

Условия:

- source-rule confirmed individual result;
- accepted source/mapping dependencies либо явно ограниченный synthetic fixture scope;
- lawful research/pilot rights, если используются реальные person-level data;
- Deal/context binding выполняется;
- output виден только authorized R&D/reviewer;
- не входит в client report;
- не показывается participant;
- не влияет на employment decision;
- не называется forecast release;
- не lock/seal как production forecast;
- не входит в official track-record denominator;
- не повышает confidence production model;
- все результаты маркируются theory-derived / uncalibrated.

Pilot разрешён, чтобы собирать evidence для будущей calibration; он не является обходом calibration gate.

### 13.6. Calibration promotion gate

Exact numeric calibration thresholds **не задаются design-документом без empirical corpus**.

До отдельного Owner-accepted empirical calibration act:

> named-leader client forecast = `NOT_RELEASE_ELIGIBLE_DUE_TO_UNCALIBRATED_MAPPING`.

Будущий calibration act обязан заранее зафиксировать как минимум:

- target outcome / estimand;
- unit of observation;
- eligible prospective / blind-held-out corpus;
- dependence/cluster treatment;
- confidence classes;
- observation windows;
- handling `Not determinable`;
- performance/calibration metrics;
- uncertainty method;
- baseline/comparator where relevant;
- minimum evidence/corpus sufficiency rule **до просмотра результата**;
- no post-hoc retuning;
- independent verification;
- non-regression against frozen fixtures;
- explicit Owner acceptance.

Source suggestion `N≥10` для сужения confidence band остаётся theory protocol и **не принимается как production calibration gate**.

Только после отдельного accepted calibration act разрешается определить, какие evidence states поддерживают `Low / Medium / High` client forecast confidence. Source-rule type confirmation сама по себе confidence не повышает.

---

## 14. Analyst и practitioner control

Engine может:

- проверить completeness/domain;
- воспроизвести принятые counts/thresholds;
- определить ambiguity;
- предложить candidate confirmation instrument;
- сформировать structured mapping candidate;
- обнаружить contradictions;
- блокировать downstream use.

Engine не может:

- принять participation за человека;
- заменить practitioner в differential adjudication;
- подобрать тип при tie;
- изменить questions/thresholds;
- снять rights block;
- выдать type клиенту;
- автоматически выпустить forecast;
- создать adverse employment decision;
- повысить confidence из-за отсутствия counterevidence.

Analyst review сохраняет:

- original engine output immutable;
- separate decision;
- rationale;
- supporting evidence;
- contradictions;
- confidence cap;
- release eligibility;
- reviewer identity/time.

Override не переписывает raw answers или source score.

---

## 15. Lock, seal, release и verification

Person forecast использует contracts `26` и `27` и не создаёт параллельный ledger.

Перед release должны быть frozen:

- exact subject;
- exact claim;
- condition;
- observation window;
- signs;
- falsifier;
- evidence cutoff;
- Deal/report/forecast IDs;
- instrument/mapping/methodology versions;
- analyst decision;
- rights snapshot;
- client-safe text.

Текущий ledger `main` недостаточен для сильного слова `sealed`, потому что существующий hash не покрывает полный forecast payload, а storage живёт в process memory. Поэтому person forecast не может называться sealed до hardening из `26`.

Поздняя проверка использует только vocabulary:

- `Confirmed`;
- `Partially confirmed`;
- `Not determinable`;
- `Missed`;
- `Falsified`.

Raw 42Q не требуется раскрывать verifier/client. Verification сравнивает observed outcome с exact locked behavior claim, а не заново «оценивает личность».

---

## 16. Report, Monitor и Execution Evidence Pack

### 16.1. Deal report

По умолчанию report может содержать только approved behavior forecast. Он не содержит:

- raw answers;
- item IDs/text;
- axis scores;
- four-letter type;
- function stack;
- layer scores;
- Persona/Shadow;
- practitioner rationale;
- consent record;
- internal storage references.

### 16.2. Monitor

Monitoring наблюдает forecast signs и conditions. Он не запускает повторный 42Q автоматически. Longitudinal reassessment индивидуального человека настоящим контрактом не авторизован.

### 16.3. Execution Evidence Pack

Person forecast может попасть в Pack из `30` **только если одновременно выполнены все условия**:

- существует released named-leader forecast со stable ID/version;
- forecast был создан через authorized individual-data chain, а не pilot/R&D hypothesis;
- recipient и purpose определены;
- `29` data-rights gate разрешает named-person disclosure именно этому recipient/purpose;
- requester имеет Pack disclosure authority;
- raw 42Q, item-level answers, layer scores, internal type/function state, practitioner rationale и consent records исключены;
- Pack показывает только approved client-safe behavior claim, limitations и evidence-scope summary;
- если verification завершена, включается exact outcome из fixed vocabulary `Confirmed / Partially confirmed / Not determinable / Missed / Falsified`;
- если verification не завершена, Pack явно показывает `Not yet verified` / applicable bounded state и не подразумевает подтверждение;
- restricted named-person forecast может быть полностью omitted, если disclosure rights отсутствуют.

Включение в Pack не создаёт новых reuse/publication rights и не превращает person-level evidence в benchmark data.

### 16.4. Secondary use

Deal-specific collection не создаёт права на:

- model training;
- benchmark;
- cross-client retrieval;
- public case study;
- marketing accuracy claim;
- future buyer disclosure;
- employee database.

Каждая цель проходит отдельный gate из `29`.

---

## 17. Logical operations, не выдуманные endpoints

Настоящий документ не назначает URL/API routes. Он определяет обязательные операции:

1. create assessment request;
2. review eligibility;
3. create/revoke invitation;
4. record notice/participation choice;
5. start/resume instrument session;
6. save answer securely;
7. submit instrument idempotently;
8. derive screener state server-side;
9. assign confirmation instrument;
10. derive confirmation state;
11. practitioner adjudicate;
12. bind Deal context;
13. create forecast candidate;
14. analyst approve/reject;
15. lock/seal/release through existing authoritative report architecture;
16. record withdrawal/rights restriction;
17. later verify forecast.

Route names и component names выбираются только после аудита current main flow и отдельной implementation authorization. Предпочтение — расширить существующую invite/respondent workspace architecture, а не создавать публичный `/42q`.

---

## 18. Failure model

| Failure | Required result |
|---|---|
| No critical-person dependency | No invitation |
| No declared purpose/recipient | Rights blocked |
| Participant declines | No result; organizational flow continues |
| Consent/notice missing or stale | No question display |
| Partial 42Q | No scoring |
| Duplicate/unknown item | Invalid submit |
| Tie/borderline | No single candidate type |
| Confirmation incomplete | No type determination |
| Any layer ambiguous | Practitioner review; no forecast |
| Type not confirmed | No forecast |
| Mapping source absent/unaccepted | Fail closed |
| Missing pressure/context | No forecast |
| Missing signal authority | No first-signal claim |
| Theory prior presented as calibrated | Release blocked |
| Raw answers requested by client | Deny by default; rights escalation |
| Type label enters report payload | Release blocked |
| Rights withdrawn/restricted | Block downstream use and review affected artifacts |
| Seal payload incomplete | Cannot call output sealed |
| Outcome unobservable | `Not determinable`, not success/failure by assumption |

---

## 19. Implementation sequence for `main`

### Phase 0 — Authority and legal gates

- accept product purpose and eligibility rule;
- approve source pack owner;
- resolve legal basis, controller/processor roles, notice, retention, deletion and withdrawal;
- decide allowed participant/client outputs;
- decide legacy terminology treatment.

**Exit:** no unresolved release-blocking rights issue.

### Phase 1 — Canonical instrument pack

Target source-authority location in `main`:

- `docs/reference/typology-42q-v1/source/` — immutable accepted XLSX/source artifacts;
- `docs/reference/typology-42q-v1/manifest.json` — hashes, logical IDs, authority/version metadata;
- `src/generated/typology42q/` — generated runtime projections only, never source authority.

Required actions:

- copy accepted source artifacts into the controlled reference pack;
- create manifest and hashes;
- extract General 42Q and 16 confirmation instruments;
- preserve exact text/order;
- create deterministic fixtures;
- remove scoring metadata from client bundle;
- generation must be reproducible from manifest-bound sources.

**Exit:** source parity independently verified; runtime projection can be regenerated byte-stably from the accepted pack.

### Phase 2 — Restricted storage and invitation flow

- create separate person-level data lane;
- reuse authorized respondent/invite infrastructure where semantically compatible;
- implement hashed tokens, expiry, revoke, server persistence and audit events;
- implement exact notice and decline/withdrawal paths.

**Exit:** partial/declined/expired paths cannot create a result.

### Phase 3 — Screener and confirmation engine

- implement server-side validation/scoring;
- block source tie bias;
- implement 0-axis / 1-axis / multi-axis routing from §§7.3 and 8.2;
- enforce max two confirmation instruments per assessment act;
- implement multi-confirmation conflict matrix;
- implement four-layer thresholds and ambiguity zones;
- add practitioner review state;
- prove no client-side authority.

**Exit:** closed-domain, parity, forced-failure, multi-axis, dual-confirmation-conflict and bypass tests pass.

### Phase 4 — Mapping pack

- promote accepted hierarchy/function/pressure/resource assets;
- run dedicated row-by-row acceptance act for `TYPE_FUNCTION_INDEX`;
- keep `TYPE_FUNCTION_INDEX` null until that act passes;
- do not synthesize `ST_Signal_Coding_Library.xlsx`; recover physical authority, remove dependency by explicit act, or remain blocked;
- freeze exact schemas/formulas;
- separate theory priors from calibrated values;
- quarantine `NEUROSIS` / `TOXIC` / `Persona` / `Shadow` as source-only legacy tokens;
- accept neutral runtime state vocabulary before active computation;
- validate against spreadsheet fixtures.

**Exit:** no missing load-bearing source, no silent fallback, no active medicalized/personality legacy state.

### Phase 5 — Analyst forecast workbench

- bind role, authority, environment, pressure, condition and window;
- generate bounded candidate, not final text authority;
- add contradiction and `Cannot determine` paths;
- add client-safe projection allowlist.

**Exit:** type/raw data cannot reach report renderer.

### Phase 6 — Lock/seal/report integration

- complete hardening from `26`;
- connect to existing report authority;
- full payload hashing and durable ledger;
- released version immutable.

**Exit:** forced failure prevents release and changes downstream result.

### Phase 7 — Verification and calibration

- reuse `27` outcome vocabulary;
- preserve failed cases;
- separate verification from calibration;
- keep pre-calibration person outputs internal-only;
- execute a separately predeclared calibration act satisfying §13.6;
- no confidence promotion from source-rule confirmation alone;
- no public accuracy percentage before corpus sufficiency gate.

**Exit:** eligible outcomes enter denominator under predeclared rules; client forecast confidence classes become available only after explicit accepted calibration authority.

---

## 20. Acceptance criteria

### Source and canon

- **AC-01:** General source hash matches manifest.
- **AC-02:** Exactly 42 General items exist.
- **AC-03:** IDs are contiguous `Q42_01…Q42_42`.
- **AC-04:** Text, order and response type match source byte-for-byte after normalized extraction.
- **AC-05:** All 16 confirmation workbooks are present and hashed.
- **AC-06:** Every confirmation workbook has 15/10/9/8 questions.
- **AC-07:** Practitioner rationale is never sent to participant browser.
- **AC-08:** Scoring poles are absent from public bundle/API payload.
- **AC-09:** Any source mismatch fails closed.

### Eligibility and rights

- **AC-10:** No request without Deal and critical-role dependency.
- **AC-11:** No automatic invite from high organizational risk.
- **AC-12:** Purpose, recipients and use are mandatory.
- **AC-13:** Decline creates no score/type.
- **AC-14:** Refusal creates no negative finding.
- **AC-15:** No first question before valid notice/authorization.
- **AC-16:** Notice version is recorded.
- **AC-17:** Withdrawal blocks new downstream processing.
- **AC-18:** Retention/deletion policy is explicit before production.
- **AC-19:** Cross-client reuse is denied by default.

### Capture and persistence

- **AC-20:** Only YES/NO accepted.
- **AC-21:** Submit requires 42 unique answers.
- **AC-22:** Refresh/resume behavior matches disclosed persistence.
- **AC-23:** Server is authority for response state.
- **AC-24:** Submit is idempotent.
- **AC-25:** Submitted response set is immutable/versioned.
- **AC-26:** Raw answers never enter logs/analytics.
- **AC-27:** Invitation token is revocable and stored hashed.
- **AC-28:** Expired link cannot submit.
- **AC-29:** Participant/client cannot forge derived result.

### Scoring and confirmation

- **AC-30:** Partial screener produces no direction.
- **AC-31:** Tie does not default to E/S/T/J.
- **AC-32:** Ambiguity produces review/candidate set, not type.
- **AC-33:** Stage 2 is mandatory before source-rule confirmation.
- **AC-34:** Four layer thresholds match source.
- **AC-35:** Intermediate zones remain ambiguous.
- **AC-36:** Failed layer cannot be silently ignored.
- **AC-37:** Thresholds cannot be changed per Deal.
- **AC-38:** Dominant function requires accepted type-function map.
- **AC-39:** Missing mapping dependency blocks output.

### Forecast

- **AC-40:** Type alone cannot create forecast.
- **AC-41:** Condition and observation window are mandatory.
- **AC-42:** Forecast uses observable behavior, not identity/trait language.
- **AC-43:** Observable signs and falsifier are mandatory.
- **AC-44:** Role/authority evidence is mandatory.
- **AC-45:** Theory prior cannot be labeled calibrated.
- **AC-46:** `Cannot determine` is allowed.
- **AC-47:** No automated adverse employment decision.
- **AC-48:** No type/function/layer score in client projection.
- **AC-49:** Named disclosure requires recipient/purpose rights.

### Release and verification

- **AC-50:** Analyst/practitioner approval is server-authoritative.
- **AC-51:** Rights block cannot be bypassed by UI or direct API call.
- **AC-52:** Full client-safe payload is locked before release.
- **AC-53:** `Sealed` is used only after full-payload durable seal.
- **AC-54:** Released forecast is immutable.
- **AC-55:** Revised forecast gets new version and reason.
- **AC-56:** Verification compares exact locked claim.
- **AC-57:** `Missed` and `Falsified` remain visible.
- **AC-58:** `Not determinable` is not removed from records.
- **AC-59:** Raw 42Q is absent from Execution Evidence Pack by default.
- **AC-60:** No public accuracy claim without eligible calibrated corpus.

### Causal proof

- **AC-61:** Real production entrypoint is traced.
- **AC-62:** Mandatory authority chain is traced downward.
- **AC-63:** Forecast eligibility is traced upward to report release.
- **AC-64:** Forced scoring failure prevents forecast.
- **AC-65:** Forced rights failure prevents report projection.
- **AC-66:** Direct-route/deep-link bypasses fail.
- **AC-67:** Client-supplied type/score is ignored.
- **AC-68:** Alternate renderer/export cannot expose restricted fields.
- **AC-69:** Independent verifier reproduces critical source and runtime claims.
- **AC-70:** Owner acceptance v2.1 is recorded as of `2026-09-16`; implementation alone is not acceptance of any later source/legal/calibration/production act.

### Решения §23

- **AC-71:** Canonical 42Q source authority resides in `docs/reference/typology-42q-v1/`; runtime projection is generated separately.
- **AC-72:** Methodology-changing edits require Owner/founder authority or an explicitly delegated methodology authority.
- **AC-73:** Multi-axis ambiguity never creates automatic Cartesian questionnaire expansion.
- **AC-74:** Production v1 administers at most two type-specific confirmation instruments per assessment act.
- **AC-75:** Two confirmed candidate instruments create conflict, not a winner.
- **AC-76:** One confirmed + one ambiguous instrument does not auto-confirm a type.
- **AC-77:** `TYPE_FUNCTION_INDEX` is unusable until a dedicated accepted mapping act passes.
- **AC-78:** Missing `ST_Signal_Coding_Library.xlsx` is never reconstructed by inference.
- **AC-79:** Legacy `NEUROSIS` / `TOXIC` / `Persona` / `Shadow` tokens cannot become active client/runtime semantics.
- **AC-80:** No invitation is created without a context-specific approved legal-basis record.
- **AC-81:** No production release occurs before exact retention/deletion/withdrawal/legal-hold policy exists.
- **AC-82:** Participant receives no score, type, forecast or report under v2.1.
- **AC-83:** Raw answers are limited to assigned purpose-bound reviewers; client/support/engineering/R&D have no default access.
- **AC-84:** Requester authority is server-derived from Deal/engagement permissions, not self-attested free text.
- **AC-85:** Pilot-only uncalibrated hypotheses remain internal and cannot become client forecasts or track-record entries.
- **AC-86:** No client forecast confidence class is enabled before a separately accepted empirical calibration act.
- **AC-87:** `N≥10` source language is not treated as accepted calibration authority.
- **AC-88:** Execution Evidence Pack includes only released, rights-eligible client-safe behavior forecasts.
- **AC-89:** Raw 42Q/internal type never enter Execution Evidence Pack.
- **AC-90:** Any remaining source/legal/empirical uncertainty has an explicit fail-closed state rather than an agent-generated default.

---

## 21. Уровень доверия

### 21.1. Доверие к source inventory

**Высокое** для следующих узких фактов:

- General Screener содержит 42 questions;
- sandbox extraction сохраняет 42 IDs/order/text/yes-no domain;
- существует 16 type-specific workbooks по 42 questions;
- каждый type-specific workbook использует структуру 15/10/9/8;
- sandbox runtime собирает только первый 42Q;
- sandbox connector fail-closed из-за отсутствия accepted maps;
- main не имеет 42Q route/runtime.

### 21.2. Доверие к source scoring mechanics

**Среднее**: формулы и thresholds доступны и воспроизводимы, но source assets ещё не приняты как production canon в `main`; tie handling содержит явный bias; некоторые downstream dependencies отсутствуют.

### 21.3. Доверие к predictive validity

**Низкое / theory prior**: pressure weights и transition base rates сами объявлены theory-derived; Base Rate `N=0`; empirical calibration pending. Это не поддерживает сильную точность, causal certainty или high-confidence client claim.

### 21.4. Доверие к production readiness

**Отсутствует** до реализации и проверки Phases 0–6. Ни sandbox UI, ни spreadsheet formulas, ни passing verifier сами по себе не доказывают production integration.

### 21.5. Trust rule для клиента

Клиент не должен видеть более сильную формулировку, чем поддерживает самый слабый обязательный dependency. Если individual result confirmed, но context или mapping weak, итог — `Cannot determine` или restricted internal hypothesis, а не уверенный forecast.

---

## 22. Что мы сознательно не меняем

- Organizational diagnostic остаётся самостоятельным.
- Canonical organizational questionnaires не переписываются.
- 42Q не добавляется в FREE path.
- Current report renderer не получает raw person data.
- Existing evidence model не превращается в personality schema.
- Analyst не получает право менять source questions/thresholds.
- Current routes не переименовываются и не объявляются расширенными.
- `26`–`30` сохраняют свои границы.
- No hidden surveillance, public-source typing или automated HR decisions.
- No longitudinal repeat assessment без отдельного contract.

---

## 23. Adjudication 16 Owner / methodology / legal decisions

Этот раздел заменяет прежний список открытых вопросов. Он не утверждает, что external legal/source/empirical work уже выполнен. Он фиксирует **disposition и fail-closed behavior**, чтобы implementation не заполнял пробелы случайными defaults.

Owner **явно принял v2.1 2026-09-16**. Решения ниже являются controlling design/method governance для этого контракта, если более высокий authority source позднее не supersede их.

| # | Вопрос | Disposition v2.1 | Статус после adjudication |
|---:|---|---|---|
| 1 | Где canonical instrument pack в `main` | Source authority: `docs/reference/typology-42q-v1/source/` + `manifest.json`; runtime projection: `src/generated/typology42q/` | **РЕШЕНО КАК TARGET ARCHITECTURE** |
| 2 | Кто methodology owner | Owner/founder — controlling methodology authority; practitioner adjudicates cases but не меняет instrument/threshold/routing/mapping. Делегирование только отдельным Owner act | **РЕШЕНО** |
| 3 | Multi-axis borderline routing | 0 ambiguous → 1 candidate; 1 ambiguous → adjacent pair; 2–4 ambiguous → practitioner review, no Cartesian expansion; practitioner может сузить только до одной adjacent pair, иначе `TYPE_NOT_DETERMINABLE` | **РЕШЕНО** |
| 4 | Maximum differential questionnaires | Production v1 cap: **2 type-specific confirmation instruments total per assessment act**; third instrument requires separate methodology act | **РЕШЕНО** |
| 5 | Conflict/failure между confirmation instruments | Exactly one confirmed + other fail → practitioner may confirm with rationale; confirmed+ambiguous → unresolved; both confirmed → `MULTI_CONFIRMATION_CONFLICT`; both fail → `TYPE_NOT_DETERMINABLE`; no averaging/vote | **РЕШЕНО** |
| 6 | `TYPE_FUNCTION_INDEX` as-is | **Не принимается автоматически.** Candidate only until row-by-row extraction/parity/authority act | **РЕШЕНО КАК SOURCE BLOCK** |
| 7 | Missing `ST_Signal_Coding_Library.xlsx` | Не реконструировать. Recover physical source, explicitly remove dependency, or accept a new replacement authority; dependent paths remain blocked | **РЕШЕНО КАК SOURCE BLOCK** |
| 8 | `NEUROSIS`, `TOXIC`, `Persona`, `Shadow` internally | Только immutable source/parity/compatibility tokens. Не active runtime/business semantics; никогда не client/participant labels | **РЕШЕНО** |
| 9 | Legal basis | Не hard-code. Перед invite обязателен approved jurisdiction × relationship legal-basis record; exact basis определяется legal/DPO/counsel matrix | **ВНЕШНИЙ RELEASE GATE С FAIL-CLOSED RULE** |
| 10 | Retention/deletion/withdrawal/legal hold | Policy matrix по data class/purpose обязательна до production; сроки не придумываются; withdrawal немедленно блокирует new downstream use; legal hold — только authorized process | **ВНЕШНИЙ RELEASE GATE С FAIL-CLOSED RULE** |
| 11 | Participant result | **Нет.** Только workflow/completion status; no score/type/forecast/report. Любая future result policy требует нового Owner+methodology+legal act | **РЕШЕНО** |
| 12 | Raw-answer access | Assigned analyst + escalated practitioner, purpose-bound; participant — own editable input pre-submit where allowed. Client/support/engineer/R&D — no default raw access | **РЕШЕНО** |
| 13 | Requester authority | Server-authoritative Deal/engagement permission + declared purpose/recipient/use + §9.5 legal coverage. Self-attested checkbox недостаточен; participant authorization separate | **РЕШЕНО КАК PRODUCT/SECURITY RULE; LEGAL COVERAGE EXTERNAL** |
| 14 | Pilot-only internal hypothesis | **Разрешён** как `INTERNAL_UNCALIBRATED_PERSON_HYPOTHESIS` в R&D/pilot scope; never client/participant, employment, production seal or official track record | **РЕШЕНО** |
| 15 | Calibration gates | Numeric thresholds сейчас не устанавливаются. До отдельного Owner-accepted empirical calibration act named-leader client forecast не release-eligible; `N≥10` source suggestion не authority | **РЕШЕНО КАК EMPIRICAL PROMOTION GATE** |
| 16 | Execution Evidence Pack | Только released, versioned, recipient/purpose-rights-eligible client-safe behavior forecast; raw 42Q/type/rationale excluded; verification outcome only if authoritative | **РЕШЕНО** |

### 23.1. Что после этого действительно остаётся блокером

После adjudication отсутствуют design-пробелы, которые разработчик может заполнить «разумным default». Остаются только доказуемые external gates:

1. **Source acceptance gate:** `TYPE_FUNCTION_INDEX` и load-bearing mapping assets должны пройти отдельное acceptance/IV.
2. **Missing-source gate:** `ST_Signal_Coding_Library.xlsx` должен быть физически восстановлен, либо dependency должна быть явно удалена/заменена отдельным methodology act.
3. **Legal/privacy gate:** approved legal-basis + retention/deletion/withdrawal/legal-hold matrix.
4. **Empirical calibration gate:** accepted corpus/method должен разрешить client forecast release/confidence classes.

До закрытия соответствующего gate система знает, **как именно остановиться**; она не знает права продолжить.

### 23.2. Owner acceptance boundary

**Owner acceptance состоялся 2026-09-16.**

С этого момента `31 v2.1` является controlling design contract для 42Q / individual data / named-leader behavior forecast. Предыдущая `31 v2.0` — **SUPERSEDED / HISTORICAL-ONLY**.

Owner acceptance v2.1 означает принятие dispositions выше как target product/method governance. Оно **не** означает:

- acceptance source mappings, которые ещё не прошли source act;
- физическое восстановление либо замену missing `ST_Signal_Coding_Library.xlsx`;
- legal/privacy sign-off;
- calibration success;
- production implementation authorization;
- permission выпускать named-leader forecast сегодня.

Следовательно, после принятия файла остаются ровно четыре внешних gate:

1. **Source acceptance gate** для `TYPE_FUNCTION_INDEX` и иных load-bearing mapping assets.
2. **Missing-source gate** для `ST_Signal_Coding_Library.xlsx` либо отдельного authority act, который удаляет/заменяет зависимость.
3. **Legal/privacy gate** для legal basis, retention, deletion, withdrawal и legal-hold policy.
4. **Empirical calibration gate** для client forecast release и confidence classes.

Implementation authorization остаётся отдельным актом после выполнения Phase 0–7 exit gates и закрытия всех применимых внешних gate.

---

## 24. Source identity appendix

### 24.1. General и mapping assets

| Source | SHA-256 |
|---|---|
| `ST_General_Type_Screener_42Q_v2.xlsx` | `45266b17943f26366ebe78e3f3c44283ca48da0f1eda0063f72575a1db3db0a7` |
| extracted `42Q-screener-content-draft (08.07.2026).json` | `627f50fcff5be9260f28ef7af2c6c012bf4808e7ae4730b34f6b1009cf552107` |
| `Most_important_file__MBTI_Dynamic_Hierarchy_v2.xlsx` | `61ed87b710a45bc07bfcc76e2b41d5cfb23c15d58eef2e2bdb93f8526958cc4e` |
| `ST_Dominant_Function_Pressure_Map_v1.xlsx` | `bf45451b493459f091f7d555888c5379dea2dc1ecf809b724e08a16a1863fac6` |
| `ST_Environment_Pressure_Profile_v1.xlsx` | `0669bb97bf70a9a55b6701400a2e1f0b0ab755bd4965843613a693a58c6fd271` |
| `ST_Transition_Rate_Engine_v1.xlsx` | `a57155bccbee300aabfd38733a79798c44023c22635216d333c6a8563e2deb85` |
| `ST_Master_Resource_Database_v2.xlsx` | `5fa5b22a94529d99d96a7f42c1cc51d9abec61e5ab883a0138ebd3045c9f5f6d` |

### 24.2. Confirmation instruments

| Candidate | Source | SHA-256 |
|---|---|---|
| ENFJ | `ST_ENFJ_Type_Determination_Questionnaire.xlsx` | `ca2a6352ef782507480fce30a2d05a6b75bd3a2e1166462531bdea8012426951` |
| ENFP | `ST_ENFP_Type_Determination_Questionnaire.xlsx` | `4ab9915be8ac9dd0c0b903e9ce2dd89d7eba8b54e6fbfb5b36b025bc1984d75d` |
| ENTJ | `ST_ENTJ_Type_Determination_Questionnaire.xlsx` | `3f177c8b37b673431cca8bd30cbe7869894b7032121540b08c47019347bde701` |
| ENTP | `ST_ENTP_Type_Determination_Questionnaire.xlsx` | `4cbd0625284954997b49c274e7ec6a43b9b5b6bd5fb5c3bf7d43a96f4928ff37` |
| ESFJ | `ST_ESFJ_Type_Determination_Questionnaire.xlsx` | `4178427f74db0067ffc159a1b1882d0a23cd6d8971af63ce031037c01b4775ea` |
| ESFP | `ST_ESFP_Type_Determination_Questionnaire.xlsx` | `10368463fa6e0764ff2b37aaa37f7ad133c0d169db8578eff6ba88ab316ac9a6` |
| ESTJ | `ST_ESTJ_Type_Determination_Questionnaire.xlsx` | `4f30fc52205f85da86b9d5a825cf9a160909f06f44ca1395059b153e87e2c627` |
| ESTP | `ST_ESTP_Type_Determination_Questionnaire_REVISED.xlsx` | `2b00b1e1b00a90c1102a198aefd6dedcdc3b873910b69bb6ed9d0c9c6f425df3` |
| INFJ | `ST_INFJ_Type_Determination_Questionnaire.xlsx` | `6c242a9f9c6a3fe3e6e0297fff7c17236910b25123b1fc137fec9b8088e7aa63` |
| INFP | `ST_INFP_Type_Determination_Questionnaire.xlsx` | `394e148153a41c714cf39ec469950fe926fb0c4380eebb550a9019c4a8f39866` |
| INTJ | `ST_INTJ_Type_Determination_Questionnaire.xlsx` | `85180d63099c33309e84cce2e986a2405570d88a69475395cedc398084975279` |
| INTP | `ST_INTP_Type_Determination_Questionnaire.xlsx` | `b75bfcaa74625362e248a5d12b131cdd1ccd9bd7a9d4b5a3e777a164a86743e3` |
| ISFJ | `ST_ISFJ_Type_Determination_Questionnaire.xlsx` | `db9182ca172a70deab4724b2cf19366b5e41ed33ea71bf0cafad684843e1c14c` |
| ISFP | `ST_ISFP_Type_Determination_Questionnaire.xlsx` | `679ec19ea217922816609a57c718f07587e3f1835b9f179de770483995859bc7` |
| ISTJ | `ST_ISTJ_Type_Determination_Questionnaire.xlsx` | `5b9d49a7585e79adc23fd3196402966e89d9a6af9092d19c8c6fa429c84568f7` |
| ISTP | `ST_ISTP_Type_Determination_Questionnaire.xlsx` | `8bfe0ac88411ac3a8b9c805e9c005c28c7ffb162fc16791440d87f6a91f7ff13` |

Эти hashes являются audit anchors проверенной копии, а не вечными IDs. После controlled promotion в `main` manifest должен вычисляться заново и пройти acceptance.

### 24.3. Sandbox implementation references

| Reference | Роль | SHA-256 |
|---|---|---|
| `src/account/lop42qGuidedData.js` | 42Q runtime data + draft consent inventory | `88f7d5f1815b2cec9f6c2f468ce3670146c37edea7e9979362b3b2c1b5900b56` |
| `src/account/LopGuidedModule.jsx` | consent/invitation/question renderer reference | `e16cbdfe70ffe0e4f1a8ab9bdf5df96397cd7856e4c64ff8578266421fb0a8c1` |
| `src/account/typology42qAdapter.js` | non-runtime normalization/validation reference | `be5fd00ddd98ea43a7551faf79497ecd2541ef0e1ee3f917933ba1c056901443` |
| `src/account/internalTypologyConnectionEngine.js` | internal fail-closed connector reference | `9ae2c942d91b36735993c69ba2e2e0e244f04bd69c6d0ac089a2d72636ec5da5` |
| `scripts/verify-n5-s5-typology-internal-connection.mjs` | deterministic known-gaps verifier | `9696c21a1d4170150c7160ea1db8fbb4814c834582a41b1b173071d50194b9ec` |
| `docs/lop-track-2-phase-a2-consent-42q-source-and-implementation-map-v1.md` | source-freeze/reference map | `d15741c837b70d87399cf208c281cf2476ab9de4c707d6d3269e4c2a117093f1` |
| `docs/question-answer-canon/typology-42q-integration-contract-draft-v1.md` | historical draft prohibition contract | `7695fae7e93d694688e87ae83f3293e5bdb38988608d3c6dda91e177af37b965` |

Эти файлы используются только как проверенная implementation reference. В частности, historical draft contract имеет status `DRAFT_NOT_ACCEPTED`, а metadata runtime data ошибочно утверждает, что модуль не импортирован, хотя текущий renderer его импортирует. Эта governance drift не переносится в `main`: source status, runtime reachability и authority должны доказываться независимо.

---

## 25. Финальная формула

> **The general 42Q is a screener, not a result. The type-specific questionnaire is a source confirmation step, not a client label. The internal type is a restricted hypothesis input, not a forecast. A named-leader forecast exists only after the confirmed individual signal is bound to the person's real authority, the deal environment, a defined pressure condition, observable behavior, a falsifier, rights, and human review.**

Иными словами:

`42 answers ≠ type`  
`screener direction ≠ confirmed type`  
`confirmed type ≠ behavior forecast`  
`behavior forecast ≠ employment decision`  
`locked forecast ≠ true forecast`  
`verified forecast ≠ public accuracy claim`.
