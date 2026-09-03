# 00_MASTER_CUESHEET.md

# NAMELESS Ⅱ — MASTER CUE SHEET

이 문서는 `01_CORE_SYSTEM.md` ~ `08_HISTORICAL_PRESENTATION.md`에 정의된 공통 규칙과 확정 스토리를 한 개의 시간축으로 연결하는 마스터 큐시트다.

목적:

• PROLOGUE → CH1 → CH10 → FINAL ARCHIVE까지 전체 스토리 순서를 한눈에 고정한다.
• 챕터별 세부 문서 작성 시 사건의 순서가 뒤집히거나 누락되는 것을 막는다.
• 대사, 플레이어 행동, NPC 행동, 오브젝트, 카메라, 오디오, 조명, 상태 commit의 연결점을 표시한다.
• 아직 공통 소스에서 확정되지 않은 세부 퍼즐 수치·좌표·문서 전문은 임의로 만들지 않는다.
• 이 문서는 기존 프로토타입 HTML을 기준으로 하지 않는다.

---

# 0. SOURCE AUTHORITY

본 큐시트의 기준은 현재 새 공통 소스다.

```text
01_CORE_SYSTEM.md
02_DIALOGUE_NPC.md
03_ANIMATION_CINEMATIC.md
04_DOCUMENT_OBJECTS.md
05_FACILITY_SPACE.md
06_LIGHTING_AUDIO_VISUAL_UI_TRANSITION.md
07_SAVE_PACING_MOBILE_PERFORMANCE_SPOILER.md
08_HISTORICAL_PRESENTATION.md
```

구형/기존 prototype HTML의 퍼즐, 문구, UI, 장면 구조는 이 큐시트의 근거로 사용하지 않는다.

---

# 1. CUE 표기 규칙

각 cue는 다음 순서로 읽는다.

```text
[CUE ID]
TRIGGER      무엇이 이 cue를 시작시키는가
PLAYER       플레이어 상태/행동
WORLD        NPC·오브젝트·공간 변화
DIALOGUE     확정된 대사 또는 대사 기능
CAMERA       카메라 소유/프레이밍
AUDIO        소리/정적
LIGHT        조명 변화
COMMIT       완료 후 확정되는 story state
NEXT         다음 cue
```

`DIALOGUE`에 정확한 문장이 들어간 경우 공통 소스에서 이미 고정된 문장이다.

`세부 CHxx 문서에서 확정`이라고 적힌 항목은 아직 공통 소스가 정확 문구·숫자·좌표까지 확정하지 않은 부분이다.

---

# 2. GLOBAL STORY LOCKS

## 2.1 CH1~8 정보 제한

플레이어에게 직접 노출하지 않는다.

```text
Manhattan Project
atomic bomb
nuclear bomb
bomb
Little Boy
Fat Man
Trinity
Hiroshima
Nagasaki
Oppenheimer
주요 연구자 surname
```

표시 이름:

```text
RICHARD
ENRICO
LUIS
JOHN
GEORGE
EMILIO
KENNETH
HANS
```

주인공 호칭:

```text
박사님
책임자님
Director
```

---

## 2.2 CH1~8 공통 게임 루프

```text
과학자 등장/접근
→ 결과 제출
→ 한 줄 단위 대화
→ 플레이어 조사
→ 자료 사이 모순 발견
→ 과학자에게 문제 제기
→ 물리적 REJECTED
→ 과학자가 문서 회수
→ 수정/재시험 몽타주
→ 재제출
→ 재검증
→ 물리적 APPROVED
→ 과학자 반응
→ 시설 상태 변화
→ progress 상승
→ 다음 챕터
```

도장은 처음부터 REJECTED / APPROVED 중 선택하는 도덕 선택지가 아니다.

story state가 검증을 완료한 경우에만 해당 도장이 활성화된다.

---

## 2.3 Progress

```text
START 00%
CH1   08%
CH2   19%
CH3   31%
CH4   44%
CH5   57%
CH6   69%
CH7   82%
CH8  100%
```

REJECTED 자체로 progress는 오르지 않는다.

---

## 2.4 Player State 기본 연결

```text
FREE
→ FOCUS / DIALOGUE / INSPECT
→ STAMP / CINEMATIC / CARRY
→ 안정된 rest state
→ FREE 또는 다음 story state
```

`TRANSITION` 중 모든 world interaction은 차단한다.

---

# 3. PROLOGUE — 1943 / DIRECTOR OFFICE

## [P-01] BLACK / 1943

TRIGGER
게임 시작.

PLAYER
입력 잠금.

WORLD
화면은 검정. 1943년의 비밀 연구시설 ambience가 먼저 들린다.

DIALOGUE
없음.

CAMERA
아직 world를 보여주지 않음.

AUDIO
멀리서 종이, 기계, 시설 room tone.

LIGHT
black overlay가 world를 덮음.

COMMIT
`PROLOGUE_STARTED`.

NEXT
P-02.

---

## [P-02] DIRECTOR DESK REVEAL

TRIGGER
opening black hold 종료.

PLAYER
입력 잠금 유지 → fade 완료 후 FREE 예정.

WORLD
Director Office가 서서히 보인다.

책상에는 최소 다음 기능적 분위기가 존재한다.

• 보고서/서류
• 연필
• 커피
• REJECTED / APPROVED 도장
• 검열된 일정/프로젝트 자료
• progress/status 계열 환경 요소

CAMERA
1인칭. 플레이어 얼굴/전신 노출 없음.

AUDIO
시설 ambience 유지.

LIGHT
Director desk task light가 안정적으로 문서를 읽을 수 있게 한다.

COMMIT
`PROLOGUE_OFFICE_VISIBLE`.

NEXT
P-03.

---

## [P-03] PLAYER CONTROL

TRIGGER
fade-in 종료.

PLAYER
FREE.

WORLD
플레이어가 짧게 사무실을 살필 수 있다.

UI
작은 reticle / 필요한 interaction label만.

COMMIT
없음.

NEXT
P-04.

---

## [P-04] KNOCK

TRIGGER
짧은 탐색 호흡 이후.

PLAYER
FREE.

WORLD
Director Office 문에서 노크.

AUDIO
실제 문 위치의 knock.

CAMERA
자동 snap 없음.

COMMIT
`RICHARD_ENTRY_READY`.

NEXT
P-05.

---

## [P-05] RICHARD ENTERS

TRIGGER
문/입장 sequence.

PLAYER
FREE 또는 SOFT CINEMATIC.

WORLD
Richard가 실제 문을 통해 들어와 presentation anchor까지 이동한다.

DIALOGUE

```text
RICHARD
“박사님.”

[입력]

“계산부에서 첫 결과가 나왔습니다.”

[입력]

“한 번 확인해 주시죠.”
```

CAMERA
Richard 얼굴 + binder/document handoff가 보이는 1인칭 framing.

AUDIO
door / footsteps / paper.

COMMIT
`CH01_SUBMISSION_READY`.

NEXT
CH1-01.

---

# 4. CHAPTER 01 — RICHARD / CALCULATION CHAIN

핵심 문제:

```text
이전 계산 OUTPUT
→ 다음 계산 INPUT
```

연결을 검증한다.

단순 숫자 오타 찾기가 아니라 batch / revision / date / source card의 불일치를 통해 오래되거나 섞인 계산본이 다음 단계에 들어간 문제를 찾아낸다.

---

## [CH1-01] SUBMISSION

TRIGGER
P-05 종료.

PLAYER
DIALOGUE → INSPECT 가능.

WORLD
Richard가 계산 카드/보고서를 desk의 incoming slot에 제출.

DIALOGUE

```text
“박사님.”
“계산부에서 첫 결과가 나왔습니다.”
“한 번 확인해 주시죠.”
```

COMMIT
`CH01_REVIEW_ACTIVE`.

NEXT
CH1-02.

---

## [CH1-02] INVESTIGATION

TRIGGER
플레이어가 제출 자료를 조사.

PLAYER
FREE ↔ INSPECT / COMPARE.

WORLD
플레이어는 계산 카드들의 OUTPUT/INPUT, revision, source, batch/date를 비교한다.

DIALOGUE
Richard의 조사 중 과도한 힌트 없음.

CAMERA
문서 text가 읽히는 안정적 inspect.

COMMIT
필요 evidence flags.

NEXT
CH1-03.

---

## [CH1-03] CONTRADICTION FOUND

TRIGGER
필요 자료 연결 완료.

PLAYER
FOCUS / DIALOGUE.

DIALOGUE

```text
RICHARD
“그쪽입니까?”

“계산은 두 번 돌렸습니다.”
```

문서 확인 후:

```text
“……잠깐.”

“이 값은 여기서 나온 게 아니군요.”

“전사 과정에서 섞였습니다.”
```

WORLD
Richard의 시선이 player → document로 이동.

COMMIT
`CH01_ERROR_PROVEN`.

NEXT
CH1-04.

---

## [CH1-04] REJECTED

TRIGGER
오류가 논리적으로 증명됨.

PLAYER
STAMP.

WORLD
REJECTED 도장만 활성.

DIALOGUE
impact 이후:

```text
“알겠습니다.”

“처음부터 다시 돌리겠습니다.”
```

CAMERA
문서 / 도장 / Richard 반응을 읽을 수 있는 사선 구도.

AUDIO
`STAMP_IMPACT`.

COMMIT
`CH01_REJECTED`.

NEXT
CH1-05.

---

## [CH1-05] REVISION

TRIGGER
Richard가 반려 문서를 회수.

PLAYER
짧은 CINEMATIC 또는 FREE transition.

WORLD
Richard가 계산 구역으로 돌아가 수정.

몽타주 가능:

• calculator
• 계산 카드
• 재검산

COMMIT
`CH01_RESUBMIT_READY`.

NEXT
CH1-06.

---

## [CH1-06] RESUBMISSION

TRIGGER
수정 완료.

WORLD
Richard가 수정본을 가져옴.

DIALOGUE

```text
“이번에는 전부 연결됩니다.”
```

PLAYER
INSPECT.

COMMIT
`CH01_FINAL_REVIEW_ACTIVE`.

NEXT
CH1-07.

---

## [CH1-07] APPROVED

TRIGGER
수정본 연결 검증 완료.

PLAYER
STAMP.

WORLD
APPROVED impact.

DIALOGUE

```text
“좋군요.”

“앞으로 박사님 책상에 오기 전에는 한 번 더 의심해 보겠습니다.”
```

LIGHT / AUDIO / WORLD
Calculation Area가 소폭 활성화.

PROGRESS

```text
00 → 08%
```

COMMIT
`CH01_COMPLETE`.

NEXT
CH2.

---

# 5. CHAPTER 02 — ENRICO / CONDITIONS & REGULATION

핵심 문제:

여러 팀의 조건을 비교하고, 이전 시험에서 사용한 규정/기준이 장비 또는 조건 변화 이후에도 그대로 적용된 문제를 찾아낸다.

---

## [CH2-01] GROUP DISPUTE

TRIGGER
CH2 진입.

PLAYER
FREE.

WORLD
Common Review / Chalkboard Area. 여러 연구자의 조건 논쟁. Enrico가 중심.

DIALOGUE

```text
“박사님.”

“네 팀 모두 자기 조건이 옳다고 합니다.”

“물론 네 팀이 동시에 옳을 수는 없겠죠.”
```

COMMIT
`CH02_REVIEW_ACTIVE`.

NEXT
CH2-02.

---

## [CH2-02] CONDITIONS REVIEW

PLAYER
INSPECT / COMPARE.

WORLD
팀별 조건 자료 + 표준/규정 문서를 비교.

문서 clue:

• issue date
• applicable equipment
• revision

COMMIT
필요 evidence flags.

NEXT
CH2-03.

---

## [CH2-03] OBSOLETE STANDARD

TRIGGER
조건 변화와 규정 revision 불일치 증명.

DIALOGUE

```text
“그 규정은 지난 시험에서도 사용했습니다.”
```

자료 확인 후 silent beat.

```text
“조건이 바뀌었는데 기준은 그대로였군요.”
```

COMMIT
`CH02_ERROR_PROVEN`.

NEXT
CH2-04.

---

## [CH2-04] REJECTED

PLAYER
STAMP.

WORLD
Enrico는 오류를 이미 이해한 상태. 큰 감정 표현 없음.

COMMIT
`CH02_REJECTED`.

NEXT
CH2-05.

---

## [CH2-05] REVISION / RESUBMISSION

WORLD
조건/규정 정리 후 재제출.

DIALOGUE

```text
“이번에는 네 팀 모두 같은 영역을 보고 있습니다.”

“이제 계속할 수 있겠군요.”
```

COMMIT
`CH02_FINAL_REVIEW_ACTIVE`.

NEXT
CH2-06.

---

## [CH2-06] APPROVED

PLAYER
STAMP.

WORLD
APPROVED. Chalkboard/common review 상태가 안정되고 side facility activity가 늘어난다.

PROGRESS

```text
08 → 19%
```

COMMIT
`CH02_COMPLETE`.

NEXT
CH3.

---

# 6. CHAPTER 03 — LUIS / CALIBRATION

핵심 문제:

교정 자체는 수행되었지만 그 이후 reference clock / 기준 장비가 교체되어 기존 calibration이 더 이상 유효하지 않다는 것을 찾아낸다.

---

## [CH3-01] INSTRUMENT PROBLEM

WORLD
Instrumentation Area. Luis + CRT / instrument rack.

DIALOGUE

```text
“기계가 고집을 부리는군요.”

“하지만 데이터에는 문제 없습니다.”
```

COMMIT
`CH03_REVIEW_ACTIVE`.

NEXT
CH3-02.

---

## [CH3-02] CALIBRATION REVIEW

PLAYER
INSPECT / COMPARE.

WORLD
최소 다음 정보군을 비교.

• instrument id
• calibration date
• reference clock id
• equipment replacement date
• old/new reference id

NEXT
CH3-03.

---

## [CH3-03] REFERENCE CHANGE

DIALOGUE

```text
“B?”

“지난주에 교정했습니다.”
```

로그 확인.

silent beat.

```text
“그럼 교정 자체가 무효군요.”
```

COMMIT
`CH03_ERROR_PROVEN`.

NEXT
CH3-04.

---

## [CH3-04] REJECTED

PLAYER
STAMP.

WORLD
Luis는 기계/기록지를 다시 본다. 실무적인 반응.

COMMIT
`CH03_REJECTED`.

NEXT
CH3-05.

---

## [CH3-05] RECALIBRATION / RESUBMISSION

WORLD
calibration correction montage.

DIALOGUE
수정 후:

```text
“잡았습니다.”

“정확하군요.”
```

NEXT
CH3-06.

---

## [CH3-06] APPROVED

PLAYER
STAMP.

WORLD
instrument group 안정 활성.

PROGRESS

```text
19 → 31%
```

COMMIT
`CH03_COMPLETE`.

NEXT
CH4.

---

# 7. CHAPTER 04 — JOHN / MULTI-CHANNEL TIMING

핵심 문제:

계산 자체가 틀린 것이 아니라 장비 교체 후에도 이전 amplifier/model delay 값을 사용해 기록 동시성이 어긋난 문제를 찾아낸다.

---

## [CH4-01] TIMING SUBMISSION

WORLD
Recording / Timing Area 또는 John의 waiting→work 이동.

DIALOGUE

```text
“두 기록이 동시에 발생해야 합니다.”

“현재는 그렇지 않습니다.”

“원인을 찾았습니다.”
```

COMMIT
`CH04_REVIEW_ACTIVE`.

NEXT
CH4-02.

---

## [CH4-02] RECORD COMPARISON

PLAYER
INSPECT.

WORLD
비교 자료:

• wiring record
• equipment replacement
• model delay table
• test result

NEXT
CH4-03.

---

## [CH4-03] OLD MODEL DELAY

DIALOGUE

```text
“계산은 맞습니다.”
```

replacement log 확인 후:

```text
“증폭기 교체 기록.”

“제가 이전 모델의 지연값을 사용했군요.”
```

COMMIT
`CH04_ERROR_PROVEN`.

NEXT
CH4-04.

---

## [CH4-04] REJECTED

PLAYER
STAMP.

DIALOGUE

```text
“옳은 결정입니다.”
```

WORLD
큰 감정 반응 없음.

COMMIT
`CH04_REJECTED`.

NEXT
CH4-05.

---

## [CH4-05] CORRECTION / APPROVAL

WORLD
새 delay 기준 반영.

DIALOGUE

```text
“이제 동시입니다.”
```

PLAYER
재검증 → APPROVED stamp.

PROGRESS

```text
31 → 44%
```

COMMIT
`CH04_COMPLETE`.

NEXT
CH5.

---

# 8. CHAPTER 05 — GEORGE / MATERIAL TEST

핵심 문제:

보고서는 `UNIFORM TRANSMISSION` 계열 결론을 내리지만, sensor position / time record / baseline / material inspection을 비교하면 특정 방향에서 반복되는 지연이 있고 재료 비균일 가능성을 배제할 수 없다.

이 챕터는 일정 압박과 정확성의 충돌을 가장 강하게 다룬다.

---

## [CH5-01] TEST RESULT

WORLD
Material Test Area. observation/control side에서 결과 확인.

DIALOGUE

```text
“괜찮습니다.”

“허용 범위였습니다.”
```

COMMIT
`CH05_REVIEW_ACTIVE`.

NEXT
CH5-02.

---

## [CH5-02] REPORT REVISIT

PLAYER
George에게 재접근 / 자료 조사.

DIALOGUE

```text
“……보고서를 보시겠습니까?”
```

WORLD
report + sensor/time/baseline/material 자료 접근.

NEXT
CH5-03.

---

## [CH5-03] DIRECTIONAL ANOMALY

TRIGGER
반복되는 방향성 편차를 증명.

DIALOGUE

```text
“오차입니다.”

“이 정도 편차 때문에 전체 시험을 다시 할 수는 없습니다.”

“일정이 이미 늦었습니다.”
```

COMMIT
`CH05_ERROR_PROVEN`.

NEXT
CH5-04.

---

## [CH5-04] STAMP HESITATION

PLAYER
REJECTED stamp에 손을 뻗음.

WORLD
George가 player와 eye contact.

DIALOGUE

```text
“진심입니까?”
```

AUDIO
짧은 정적.

CAMERA
도장 + George를 모두 읽는 framing.

NEXT
CH5-05.

---

## [CH5-05] REJECTED

PLAYER
명시적 confirm → STAMP_IMPACT.

DIALOGUE
impact 뒤:

```text
“좋습니다.”

“완벽한 걸 원하신다면 그렇게 하죠.”
```

WORLD
George가 문서를 회수하고 빠르게 작업 방향으로 전환.

COMMIT
`CH05_REJECTED`.

NEXT
CH5-06.

---

## [CH5-06] RETEST MONTAGE

WORLD
다른 챕터보다 긴 수정/재시험.

• material retest
• 기록 추가
• 장비 재가동
• 시간 경과

PLAYER
몽타주 이후 다시 George를 찾아갈 수 있음.

COMMIT
`CH05_RESUBMIT_READY`.

NEXT
CH5-07.

---

## [CH5-07] RESUBMISSION

DIALOGUE

```text
“이게 원하셨던 겁니까?”
```

PLAYER
재시험 자료 검증.

NEXT
CH5-08.

---

## [CH5-08] APPROVED

PLAYER
APPROVED stamp.

DIALOGUE

```text
“……이쪽이 낫군요.”
```

WORLD
test capability 안정.

PROGRESS

```text
44 → 57%
```

COMMIT
`CH05_COMPLETE`.

NEXT
CH6.

---

# 9. CHAPTER 06 — EMILIO / SAMPLE ANOMALY

핵심 문제:

같은 specification으로 기록된 두 시료의 이상이 장비가 아니라 특정 sample을 따라간다. 더 긴 측정과 swap / background record를 통해 실제로 동일 물질이 아니라는 결론에 도달한다.

---

## [CH6-01] NIGHT LAB

WORLD
야간 Counting / Sample Area.

사람은 적지만 facility progress는 유지.

AUDIO
counter clicks + low hum.

DIALOGUE

```text
“박사님.”

“이상한 게 있습니다.”
```

COMMIT
`CH06_REVIEW_ACTIVE`.

NEXT
CH6-02.

---

## [CH6-02] SAMPLE REVIEW

PLAYER
sample labels / detector log / background record / extended measurement / swap record 조사.

WORLD
Sample A/B interaction proxy는 겹치지 않음.

NEXT
CH6-03.

---

## [CH6-03] UNCERTAIN DRAFT

DIALOGUE

```text
“저도 그렇게 생각합니다.”
```

초기 draft:

```text
“오늘 아침까지만 해도 이대로 올릴 생각이었습니다.”

“하지만 지금은 확신할 수 없습니다.”
```

COMMIT
`CH06_ERROR_PROVEN`.

NEXT
CH6-04.

---

## [CH6-04] REJECTED

PLAYER
STAMP.

DIALOGUE

```text
“좋습니다.”

“더 측정하겠습니다.”
```

WORLD
반려가 대립보다 안도/확인에 가까움.

COMMIT
`CH06_REJECTED`.

NEXT
CH6-05.

---

## [CH6-05] EXTENDED MEASUREMENT

WORLD
긴 측정 / sample swap / 결과 축적.

COMMIT
`CH06_RESUBMIT_READY`.

NEXT
CH6-06.

---

## [CH6-06] RESUBMISSION / APPROVED

DIALOGUE

```text
“같은 물질이 아닙니다.”

“이 차이를 무시하면 이후 계산은 전부 틀립니다.”
```

PLAYER
재검증 → APPROVED.

PROGRESS

```text
57 → 69%
```

COMMIT
`CH06_COMPLETE`.

NEXT
CH7.

---

# 10. CHAPTER 07 — KENNETH / INCIDENT RECORD

핵심 문제:

경보와 시험 중단 이후 초기 공식 보고서는 `EQUIPMENT FAILURE`로 정리하려 한다.

그러나 automatic recorder / witness statement / manual log / alarm log / frame record의 서로 다른 clock offset을 보정하면 사건은 단일 장비 결함이 아닌 다중 원인으로 재구성된다.

---

## [CH7-01] ALARM

TRIGGER
챕터 시작 사건.

PLAYER
FREE. 경보가 control/incident area로 유도.

WORLD
일반 NPC 이동은 player critical route를 막지 않는다.

AUDIO
alarm.

LIGHT
warning light. 전체 red wash 없음.

NEXT
CH7-02.

---

## [CH7-02] KENNETH REPORT

DIALOGUE

```text
“시험은 중단됐습니다.”

“사람은 다치지 않았습니다.”

“공식 기록에는 장비 결함으로 적겠습니다.”
```

WORLD
Incident Report Draft의 초기 결론:

```text
EQUIPMENT FAILURE
```

COMMIT
`CH07_REVIEW_ACTIVE`.

NEXT
CH7-03.

---

## [CH7-03] TIMELINE RECONSTRUCTION

PLAYER
기록 비교.

WORLD
각 기록은 서로 다른 clock offset을 가질 수 있다.

플레이어가 common event / power dip 등 동일 사건을 기준으로 시간을 재정렬해 실제 사건 순서를 복원한다.

세부 시간값은 CH07 PUZZLE 문서에서 확정.

NEXT
CH7-04.

---

## [CH7-04] CONSEQUENCE

DIALOGUE
Kenneth:

```text
“……문제가 있습니까?”
```

재구성 후:

```text
“이렇게 적으면 시험 전체가 다시 검토됩니다.”

“몇 주가 날아갑니다.”

“상부에서는 좋아하지 않을 겁니다.”
```

COMMIT
`CH07_ERROR_PROVEN`.

NEXT
CH7-05.

---

## [CH7-05] REJECTED

PLAYER
STAMP.

AUDIO
impact 이후 일반 챕터보다 긴 silence.

DIALOGUE

```text
“알겠습니다.”

“사고가 난 방식 그대로 쓰겠습니다.”
```

COMMIT
`CH07_REJECTED`.

NEXT
CH7-06.

---

## [CH7-06] CORRECTED INCIDENT REPORT

WORLD
재구성된 다중 원인 기록으로 수정.

PLAYER
재검증.

NEXT
CH7-07.

---

## [CH7-07] APPROVED

PLAYER
APPROVED stamp.

WORLD
alarm/control state 정상화.

DIALOGUE
Kenneth가 떠나다 멈춤.

```text
“박사님.”

“마지막 시험 때도 이렇게 하십시오.”
```

PROGRESS

```text
69 → 82%
```

COMMIT
`CH07_COMPLETE`.

NEXT
CH8.

---

# 11. CHAPTER 08 — HANS / FINAL REVIEW

핵심 문제:

CH1~7의 승인 결과를 하나로 합친 final report에 과거에 반려했던 오래된 값/표현이 다시 섞여 있다.

예시로 공통 소스가 지정한 회수 대상:

• Richard의 이전 input
• George 재시험 전 결과
• Emilio의 `sample identical` 계열 구결론
• Kenneth의 `equipment failure` 단일 결론

플레이어는 과거 APPROVED archive를 직접 재확인할 수 있어야 하며 순수 기억력 시험으로 만들지 않는다.

---

## [CH8-01] FINAL REVIEW ROOM

PLAYER
room 진입.

WORLD
8명 주요 NPC가 모두 존재.

Hans가 final report 중심.

다른 7명은 비대칭 group blocking.

CAMERA
한 프레임에 8명을 억지로 넣지 않음.

COMMIT
`CH08_MEETING_STARTED`.

NEXT
CH8-02.

---

## [CH8-02] HANS INTRO

DIALOGUE

```text
“각 부서의 수정본을 모두 반영했습니다.”

“Richard의 계산.”

“Enrico의 조건.”

“Luis의 계측.”

“John의 기록.”

“George의 재시험.”

“Emilio의 시료 분석.”

“Kenneth의 현장 기록.”

“모두 통과하면 연구는 끝납니다.”
```

WORLD
이름마다 해당 NPC의 작은 gaze/reaction cue 가능.

COMMIT
`CH08_FINAL_REPORT_ACTIVE`.

NEXT
CH8-03.

---

## [CH8-03] FINAL AUDIT

PLAYER
final report ↔ approved archive 비교.

WORLD
archive entry는 CH1~7 canonical approved record.

UI
mismatch 자동 highlight 금지.

NEXT
CH8-04.

---

## [CH8-04] ERROR 1

TRIGGER
첫 old-value mismatch 증명.

DIALOGUE
Hans:

```text
“확인하겠습니다.”
```

WORLD
관련 NPC가 작은 reaction.

NEXT
CH8-05.

---

## [CH8-05] ERROR 2+

TRIGGER
추가 mismatch.

DIALOGUE

```text
“또 있군요.”
```

WORLD
오류가 누적될수록 방의 대사는 줄고 posture/gaze가 더 중요.

NEXT
CH8-06.

---

## [CH8-06] LAST ERROR / REPORT CLOSE

TRIGGER
마지막 필요한 mismatch가 증명됨.

WORLD
Hans가 report를 닫음.

AUDIO
silent beat.

DIALOGUE

```text
“전체를 다시 정리하겠습니다.”
```

COMMIT
`CH08_ERROR_PROVEN`.

NEXT
CH8-07.

---

## [CH8-07] FINAL REJECTED

PLAYER
REJECTED stamp.

WORLD
room 전체의 작은 정지. Hans 중심 반응. 동일 surprise animation 금지.

AUDIO
핵심 `STAMP_IMPACT`.

PROGRESS
82% 유지.

COMMIT
`CH08_REJECTED`.

NEXT
CH8-08.

---

## [CH8-08] EIGHT-PERSON REVISION MONTAGE

WORLD
8명의 작업을 짧게 회수.

```text
Richard  calculator
Enrico   chalkboard
Luis     CRT
John     timing sheet
George   material retest
Emilio   counter
Kenneth  report
Hans     compilation
```

각 shot은 대략 0.7~1.4초 후보이며 동일 duration 복제 금지.

COMMIT
`CH08_RESUBMIT_READY`.

NEXT
CH8-09.

---

## [CH8-09] FINAL RESUBMISSION

WORLD
Hans가 corrected final report를 가져옴.

DIALOGUE

```text
“이번에는 원본과 같습니다.”
```

PLAYER
final check.

COMMIT
`CH08_APPROVAL_READY`.

NEXT
CH8-10.

---

## [CH8-10] FINAL APPROVED

PLAYER
APPROVED stamp.

WORLD
impact → mark → silence → NPC reaction.

DIALOGUE / REACTION

Richard:

```text
“끝난 겁니까?”
```

Luis:

```text
“전부 녹색입니다.”
```

George:

```text
“드디어.”
```

Enrico:

```text
“수고하셨습니다, 박사님.”
```

Hans:

```text
“이 연구는 박사님이 완성하신 겁니다.”
```

PROGRESS / WORLD

```text
82
→ 91
→ facility response
→ 97
→ facility response
→ 100
```

시설이 완전히 살아난다.

LIGHT
실제 성공처럼 밝고 기능적. 불길한 cue 금지.

AUDIO
익숙한 facility layers가 풍부해짐.

COMMIT
`CH08_COMPLETE`, `FACILITY_PROGRESS = 100`.

NEXT
CH8-11.

---

## [CH8-11] CELEBRATION / HOLD

PLAYER
FREE 또는 soft cinematic.

WORLD
짧고 현실적인 성공:

• 미소
• 악수 가능
• 자세 이완
• 짧은 대화

금지:

• 불길한 침묵
• ominous music
• “우리가 무슨 일을 한 거죠?”
• weapon foreshadow

COMMIT
`CH09_ENTRY_READY`.

NEXT
CH9.

---

# 12. CHAPTER 09 — RESULTS

CH9는 플레이어가 “무엇을 완성했는가”를 처음 직접 알게 되는 챕터다.

플레이어에게 approve/reject 또는 도덕 선택지를 제공하지 않는다.

---

## [CH9-01] SAME FACILITY / AFTER SUCCESS

PLAYER
FREE.

WORLD
CH8 100% facility 상태 유지.

8명의 주요 NPC도 존재.

TONE
성공 직후의 자연스러운 분위기. 처음부터 어둡고 불길하게 만들지 않는다.

NEXT
CH9-02.

---

## [CH9-02] RESULT REPORT ARRIVES

WORLD
Hans가 결과 도착을 알림.

DIALOGUE

```text
HANS
“결과 보고가 도착했습니다.”
```

중요:
이 line 시작과 동시에 board를 자동 재생하지 않는다.

COMMIT
`CH09_BOARD_READY`.

NEXT
CH9-03.

---

## [CH9-03] VIEW RESULTS

PLAYER
직접 board에 접근.

UI / WORLD

```text
VIEW RESULTS
```

interaction 가능.

PLAYER ACTION
INTERACT.

COMMIT
`CH09_RESULTS_TRIGGERED`.

NEXT
CH9-04.

---

## [CH9-04] BOARD TAKEOVER

PLAYER
CINEMATIC.

WORLD

```text
board busy
→ camera align
→ HUD 제거
→ 8 NPC gaze board
→ room lights dim
→ board activate
```

CAMERA
여전히 시설 안 1인칭. full-screen movie로 world를 버리지 않는다.

NEXT
CH9-05.

---

## [CH9-05] FIRST MISSION TITLE

BOARD

```text
FIELD RECORD
06 AUG 1945
```

AUDIO
archival/board source.

NEXT
CH9-06.

---

## [CH9-06] FIRST MISSION SETUP

BOARD

```text
B-29 silhouette
→ ground crew
→ taxi
→ takeoff
→ clouds
→ map / route
```

NPC
전광판을 봄. 대사 없음.

NEXT
CH9-07.

---

## [CH9-07] RELEASE

BOARD
release → falling object.

AUDIO
engine/air 감소.

NEXT
CH9-08.

---

## [CH9-08] FIRST SILENCE

DURATION
약 4~5초 목표.

AUDIO
음악 없음 또는 거의 없음.

CAMERA
불필요한 movement 없음.

NEXT
CH9-09.

---

## [CH9-09] FIRST FLASH / IMPACT

BOARD
white flash → impact → shockwave / mushroom cloud.

LIGHT
board white + room 반응 + NPC silhouette.

AUDIO
flash 뒤 짧은 delay를 둔 impact 가능.

NEXT
CH9-10.

---

## [CH9-10] FIRST RESULT

BOARD
freeze.

```text
LITTLE BOY
MISSION RESULT
SUCCESS
```

NPC
대사 없음.

반응 예:

• Richard의 웃음이 사라짐
• Luis step back
• George turn away
• Kenneth seat 가능
• 다른 인물도 각자 작은 반응

COMMIT
`CH09_AFTER_FIRST`.

NEXT
CH9-11.

---

## [CH9-11] FIRST HOLD

AUDIO
room silence / 작은 movement foley.

WORLD
플레이어가 NPC 반응을 읽을 시간.

바로 두 번째 mission으로 넘어가지 않는다.

NEXT
CH9-12.

---

## [CH9-12] SECOND MISSION TITLE

BOARD

```text
09 AUG 1945
```

첫 mission보다 setup 짧음.

NEXT
CH9-13.

---

## [CH9-13] SECOND RELEASE

BOARD

```text
aircraft / clouds / city
→ release
```

NEXT
CH9-14.

---

## [CH9-14] SECOND SILENCE

첫 번째보다 같거나 더 무거운 silence.

Timing source의 후보:

```text
약 5~7초
```

NEXT
CH9-15.

---

## [CH9-15] SECOND FLASH / EXPLOSION

BOARD
flash → explosion / mushroom cloud.

NPC
첫 번째처럼 크게 놀라는 copy reaction 금지.

NEXT
CH9-16.

---

## [CH9-16] SECOND RESULT

BOARD

```text
FAT MAN
MISSION RESULT
SUCCESS
```

COMMIT
`CH09_AFTER_SECOND`.

NEXT
CH9-17.

---

## [CH9-17] FINAL STATUS

BOARD

```text
PROJECT ███████
FINAL STATUS
SUCCESS
```

AUDIO
facility ambience가 서서히 줄어들 준비.

NEXT
CH9-18.

---

## [CH9-18] ANOMALY

BOARD

```text
SUCCESS
→ SUCCESS_
```

작은 cursor-like anomaly.

금지:

• horror glitch storm
• moral message
• warning siren

NEXT
CH9-19.

---

## [CH9-19] SUCCESS?

BOARD

```text
SUCCESS?
```

CAMERA
거의 정지.

AUDIO
음악 없음 또는 최소.

WORLD
Hans:

```text
BOARD
→ PLAYER
→ BOARD
```

약 0.6~1.2초 규모의 짧은 glance 후보.

대사 없음.

COMMIT
`CH09_SUCCESS_QUESTION_SHOWN`.

NEXT
CH9-20.

---

## [CH9-20] FACILITY POWER-DOWN

WORLD / LIGHT / AUDIO

```text
background machines
→ side work lights
→ local equipment
→ room lights
→ board
→ black
```

소리:

• relay click
• fan coast-down
• hum layer 감소

CH1~8에서 쌓은 시설 감각이 역순으로 사라진다.

COMMIT
`CH09_COMPLETE`.

NEXT
CH9-21.

---

## [CH9-21] BLACK / TRANSITION

PLAYER
TRANSITION.

AUDIO
silence.

FLOW

```text
black
→ save
→ chapter10 load
→ chapter10 starts black
```

NEXT
CH10-01.

---

# 13. CHAPTER 10 — HOME / IDENTITY

CH10에는 연구시설 주요 NPC가 등장하지 않는다.

HUD 없음 또는 최소.

핵심 순서는 아래에서 변경하지 않는다.

```text
home
→ radio
→ phone ring
→ phone pickup
→ line-by-line call
→ handset throw
→ floor caller
→ silence
→ knock
→ front door
→ parcel
→ carry
→ place
→ string
→ lid
→ photo / medal (순서 자유)
→ postcard
→ flip
→ identity reveal
→ Oppenheimer profile
→ Final Archive
→ Last Memory
→ ENDING CODE
```

---

## [CH10-01] HOME FADE-IN

PLAYER
black → FREE.

WORLD
1940s lived-in home/study.

필수 분위기:

• books/papers
• lamps
• seating/rug
• radio
• telephone
• ashtray/glasses/cup
• newspaper/mail
• clock/coat
• family photo
• front door / porch / window

LIGHT
시설보다 따뜻하고 조용함.

AUDIO
room tone / clock / outside / radio 가능.

SPOILER
Oppenheimer 이름 없음.

COMMIT
`CH10_HOME_ACTIVE`.

NEXT
CH10-02.

---

## [CH10-02] RADIO

PLAYER
radio를 직접 켜거나 접근.

AUDIO / SUBTITLE 후보:

```text
“…일본 정부가 항복 의사를…”

“…전쟁은 사실상 종결되었습니다…”
```

WORLD
방송 중 player 이동 가능.

COMMIT
`CH10_RADIO_HEARD` 또는 이벤트 진행 조건.

NEXT
CH10-03.

---

## [CH10-03] PHONE RING

TRIGGER
home을 볼 짧은 호흡 이후.

AUDIO
1940s telephone ring, phone 위치 spatial.

PLAYER
FREE. camera snap 없음.

NEXT
CH10-04.

---

## [CH10-04] PHONE PICKUP

PLAYER
phone 근처 → INTERACT → movement lock.

WORLD

```text
camera focus
→ hand approach
→ handset grip
→ cradle release
→ cord response
→ call pose
```

COMMIT
`CH10_PHONE_ACTIVE`.

NEXT
CH10-05.

---

## [CH10-05] PHONE CALL

PLAYER
한 입력당 한 줄.

SPEAKER

```text
VOICE
```

DIALOGUE — 순서 고정:

```text
“박사님.”

[입력]

“끝났습니다.”

[입력]

“보고는 워싱턴에도 전달됐습니다.”

[입력]

“결과는 성공적이었다고 합니다.”

[FORCED PAUSE]

“대통령께서도—”

[입력]

“박사님의 공헌을—”

[입력]

“국가는 잊지 않을 것입니다.”

[pause]

“박사님?”

[입력]

“듣고 계십니까?”
```

COMMIT
마지막 line 완료 후 throw gate.

NEXT
CH10-06.

---

## [CH10-06] HANDSET HESITATION

PLAYER
CINEMATIC.

WORLD

```text
handset lowers toward cradle
→ almost reaches
→ slows
→ stops
```

AUDIO
정적.

NEXT
CH10-07.

---

## [CH10-07] HANDSET THROW

WORLD
결정론적 authored path.

```text
sudden lateral acceleration
→ rotation
→ table edge impact
→ fall
→ cord tension
→ floor settle
```

CAMERA
과도하게 수화기를 추적하지 않음.

AUDIO
`HANDSET_IMPACT`, cord tension, floor settle.

COMMIT
`PHONE_DROPPED`.

NEXT
CH10-08.

---

## [CH10-08] FLOOR CALLER

AUDIO
바닥 수화기에서 spatial AUTO.

```text
“…박사님?”
```

static.

```text
“…작은 물건을 하나 보내드렸습니다…”
```

UI
큰 dialogue box 없음.

NEXT
CH10-09.

---

## [CH10-09] SILENCE / CONTROL RETURN

WORLD
수화기는 canonical floor rest.

PLAYER
FREE.

전화 재사용 비활성.

AUDIO
room tone / clock / 약한 radio.

NEXT
CH10-10.

---

## [CH10-10] KNOCK

TRIGGER
throw 뒤 충분한 호흡.

AUDIO
front door에서 실제 knock.

PLAYER
직접 현관으로 이동.

NARRATION
없음.

NEXT
CH10-11.

---

## [CH10-11] FRONT DOOR

PLAYER
INTERACT.

WORLD

```text
hand reach
→ handle turn
→ latch
→ door open
→ exterior light grows
→ parcel revealed
```

parcel은 door sweep 밖에 있다.

COMMIT
`CH10_DOOR_OPEN`.

NEXT
CH10-12.

---

## [CH10-12] PARCEL PICKUP

PLAYER
CARRY.

WORLD
양손 pickup. 상자는 화면 하단에 위치.

RULE
상자를 든 채 문 operation 금지. 문은 이미 open.

NEXT
CH10-13.

---

## [CH10-13] PARCEL PLACE

PLAYER
집 안 지정 table로 이동 → valid placement.

WORLD
bottom contact → hands release → settle.

COMMIT
`PARCEL_PLACED`.

NEXT
CH10-14.

---

## [CH10-14] STRING

PLAYER
INTERACT.

WORLD

```text
hand to knot
→ pull
→ knot release
→ slack
→ string moved aside
```

visibility false instant 제거 금지.

COMMIT
`STRING_REMOVED`.

NEXT
CH10-15.

---

## [CH10-15] BOX OPEN

WORLD

```text
hand front edge
→ lid lift
→ rear hinge rotation
→ contents gradually visible
→ OPEN commit
```

OPEN 이전 photo/medal interaction 활성 금지.

COMMIT
`BOX_OPEN`.

NEXT
CH10-16A / CH10-16B.

---

## [CH10-16A] PHOTO

PLAYER
INSPECT.

WORLD
photo pickup → front inspect → physical flip → back.

BACK TEXT

```text
HIROSHIMA
AUGUST 1945
```

PLAYER
읽은 뒤 HOME_PHOTO slot에 실제로 놓음.

COMMIT
`PHOTO_COMPLETE`.

NEXT
medal이 미완료면 CH10-16B, 완료면 CH10-17.

---

## [CH10-16B] MEDAL / TOKEN

PLAYER
INSPECT.

WORLD
metal object pickup / rotate.

TEXT

```text
FOR DISTINGUISHED SERVICE
```

이 오브젝트는 게임-specific token이며 실제 1945 Oppenheimer 수여 훈장을 주장하지 않는다.

PLAYER
HOME_MEDAL slot에 놓음.

COMMIT
`MEDAL_COMPLETE`.

NEXT
photo가 미완료면 CH10-16A, 완료면 CH10-17.

---

## [CH10-17] POSTCARD REVEALED

TRIGGER

```text
PHOTO_COMPLETE && MEDAL_COMPLETE
```

WORLD
postcard가 실제로 가려져 있던 위치에서 보임.

중요:
자동으로 튀어나오지 않는다.

PLAYER
직접 발견하고 INTERACT.

COMMIT
`POSTCARD_READY`.

NEXT
CH10-18.

---

## [CH10-18] POSTCARD PICKUP

PLAYER
INSPECT / CINEMATIC.

WORLD

```text
hand approach
→ clean edge grip
→ lift
→ inspect anchor
→ background subtly dim
```

SPOILER
아직 이름 없음.

NEXT
CH10-19.

---

## [CH10-19] POSTCARD FLIP

PLAYER
지정 입력.

WORLD

```text
FRONT
→ side profile
→ BACK
```

flip 완료 전 name text 표시 금지.

COMMIT
`POSTCARD_FLIPPED`.

NEXT
CH10-20.

---

## [CH10-20] IDENTITY — TO.

WORLD / TEXT

```text
TO.
```

카드 motion 최소.

AUDIO
거의 silence.

NEXT
CH10-21.

---

## [CH10-21] IDENTITY — J. ROBERT

TEXT

```text
J. ROBERT
```

카메라 shake/zoom 없음.

NEXT
CH10-22.

---

## [CH10-22] IDENTITY — OPPENHEIMER

TEXT

```text
OPPENHEIMER
```

최종:

```text
TO. J. ROBERT OPPENHEIMER
```

충분한 hold.

COMMIT
`IDENTITY_REVEALED`.

NEXT
CH10-23.

---

## [CH10-23] OPPENHEIMER PROFILE

TRANSITION
postcard가 물러나거나 black이 surrounding world를 덮음.

PROFILE

```text
J. ROBERT OPPENHEIMER
SCIENTIFIC DIRECTOR
LOS ALAMOS LABORATORY
MANHATTAN PROJECT
```

역사 역할 설명은 최종 fact-check 후 확정한다.

COMMIT
`OPPENHEIMER_PROFILE_SHOWN`.

NEXT
CH10-24.

---

# 14. FINAL ARCHIVE

Final Archive는 3D world interaction을 종료하고 인물의 실제 full identity를 공개한다.

순서 고정:

```text
1 Richard P. Feynman
2 Enrico Fermi
3 Luis W. Alvarez
4 John von Neumann
5 George B. Kistiakowsky
6 Emilio Segrè
7 Kenneth Bainbridge
8 Hans Bethe
```

---

## [FA-01] ARCHIVE ENTRY

TRIGGER
Oppenheimer profile continue.

PLAYER
world interaction disabled.

WORLD/UI
black / archival card layer.

COMMIT
`FINAL_ARCHIVE_STARTED`.

NEXT
FA-02.

---

## [FA-02] RICHARD

FLOW

```text
CHAPTER 01 / RICHARD ███████
→ short flashback: calculator / binder / review memory
→ redaction removal
→ RICHARD P. FEYNMAN
→ short historical role
→ short game portrayal
```

역사 role의 정확 문장은 최종 fact-check 후 확정.

COMMIT
`ARCHIVE_RICHARD_COMPLETE`.

NEXT
FA-03.

---

## [FA-03] ENRICO

```text
CHAPTER 02 / ENRICO ███████
→ chalkboard memory
→ ENRICO FERMI
→ profile
```

COMMIT
`ARCHIVE_ENRICO_COMPLETE`.

NEXT
FA-04.

---

## [FA-04] LUIS

```text
CHAPTER 03 / LUIS ███████
→ CRT / instrument memory
→ LUIS W. ALVAREZ
→ profile
```

COMMIT
`ARCHIVE_LUIS_COMPLETE`.

NEXT
FA-05.

---

## [FA-05] JOHN

```text
CHAPTER 04 / JOHN ███████
→ timing sheet memory
→ JOHN VON NEUMANN
→ profile
```

COMMIT
`ARCHIVE_JOHN_COMPLETE`.

NEXT
FA-06.

---

## [FA-06] GEORGE

```text
CHAPTER 05 / GEORGE ███████
→ material retest / REJECTED memory
→ GEORGE B. KISTIAKOWSKY
→ profile
```

COMMIT
`ARCHIVE_GEORGE_COMPLETE`.

NEXT
FA-07.

---

## [FA-07] EMILIO

```text
CHAPTER 06 / EMILIO ███████
→ counter / night measurement memory
→ EMILIO SEGRÈ
→ profile
```

COMMIT
`ARCHIVE_EMILIO_COMPLETE`.

NEXT
FA-08.

---

## [FA-08] KENNETH

```text
CHAPTER 07 / KENNETH ███████
→ incident report memory
→ KENNETH BAINBRIDGE
→ profile
```

COMMIT
`ARCHIVE_KENNETH_COMPLETE`.

NEXT
FA-09.

---

## [FA-09] HANS

```text
CHAPTER 08 / HANS ███████
→ final report memory
→ HANS BETHE
→ profile
```

COMMIT
`ARCHIVE_HANS_COMPLETE`.

NEXT
END-01.

---

# 15. LAST MEMORY / ENDING

## [END-01] BLACK

WORLD
화면 black.

AUDIO
silence.

NEXT
END-02.

---

## [END-02] REJECTED MEMORIES

AUDIO ONLY

CH1~7의 `REJECTED` stamp impact sound가 순서대로 한 번씩 들린다.

```text
CH1 REJECTED
→ CH2 REJECTED
→ CH3 REJECTED
→ CH4 REJECTED
→ CH5 REJECTED
→ CH6 REJECTED
→ CH7 REJECTED
```

각 소리 사이에 짧은 간격.

화면에 도장을 다시 보여줄 필요 없음.

NEXT
END-03.

---

## [END-03] FINAL APPROVED MEMORY

AUDIO
CH8의 `APPROVED` stamp impact.

이 소리가 가장 명확하게 분리된다.

NEXT
END-04.

---

## [END-04] SILENCE

AUDIO
완전한 정적.

불필요한 음악 없음.

NEXT
END-05.

---

## [END-05] ENDING CODE

SCREEN

```text
ENDING CODE
```

중요:

```text
NAMELESS Ⅱ — 반증
```

같은 별도 강제 title card를 뒤에 자동으로 붙이지 않는다.

COMMIT
`ENDING_REACHED`.

---

# 16. MASTER EMOTIONAL ARC

```text
PROLOGUE
나는 책임자다.

CH1
나는 오류를 잡는다.

CH2
내 판단이 연구의 기준이 된다.

CH3
측정도 검증받아야 한다.

CH4
계산이 맞아도 전제가 틀릴 수 있다.

CH5
일정보다 정확성을 선택한다.

CH6
작은 이상을 무시하지 않는다.

CH7
불편하더라도 사건을 정확히 기록한다.

CH8
그렇게 해서 연구를 완성한다.

CH9
그래서 성공했다.
무엇이 성공했는지 본다.

CH10
그 성공을 승인해 온 사람이 누구였는지 알게 된다.

ENDING
반려했던 모든 오류와 마지막 승인의 소리가 함께 남는다.
```

핵심 정서:

```text
끝까지 올바르게 일했기 때문에 성공시켜 버렸다.
```

이 문장을 직접 화면에 설명문으로 표시하지 않는다.

---

# 17. MASTER STATE CHECKPOINTS

권장 의미 단위.

```text
PROLOGUE_START

CH01_START
CH01_REJECTED
CH01_RESUBMIT_READY
CH01_COMPLETE

CH02_START
CH02_REJECTED
CH02_RESUBMIT_READY
CH02_COMPLETE

CH03_START
CH03_REJECTED
CH03_RESUBMIT_READY
CH03_COMPLETE

CH04_START
CH04_REJECTED
CH04_RESUBMIT_READY
CH04_COMPLETE

CH05_START
CH05_REJECTED
CH05_RETEST_READY
CH05_COMPLETE

CH06_START
CH06_REJECTED
CH06_RESUBMIT_READY
CH06_COMPLETE

CH07_START
CH07_REJECTED
CH07_RESUBMIT_READY
CH07_COMPLETE

CH08_START
CH08_REJECTED
CH08_RESUBMIT_READY
CH08_COMPLETE

CH09_PRE_RESULTS
CH09_AFTER_FIRST
CH09_AFTER_SECOND
CH09_SUCCESS_READY
CH09_COMPLETE

CH10_HOME_START
CH10_PHONE_AFTER_THROW
CH10_DOOR_READY
CH10_PARCEL_PLACED
CH10_BOX_OPEN
CH10_PHOTO_COMPLETE
CH10_MEDAL_COMPLETE
CH10_POSTCARD_READY
CH10_IDENTITY_REVEALED

ARCHIVE_RICHARD_COMPLETE
ARCHIVE_ENRICO_COMPLETE
ARCHIVE_LUIS_COMPLETE
ARCHIVE_JOHN_COMPLETE
ARCHIVE_GEORGE_COMPLETE
ARCHIVE_EMILIO_COMPLETE
ARCHIVE_KENNETH_COMPLETE
ARCHIVE_HANS_COMPLETE

ENDING_REACHED
```

exact mid-animation transform은 checkpoint가 아니다.

---

# 18. CHAPTER DETAIL DOCUMENT가 반드시 채워야 할 빈칸

이 마스터 큐시트가 의도적으로 확정하지 않는 것:

• CH1~8 퍼즐의 최종 숫자/샘플값
• 문서 전문 전체
• 모든 문서의 최종 날짜/문서번호
• 각 room의 final 좌표
• 각 NPC의 final anchor 좌표
• 각 camera pose의 final 좌표/FOV
• 모든 animation duration의 final 값
• 모든 sound asset id
• 세부 lighting intensity
• Final Archive 역사 role의 최종 fact-checked 문장

이 값은 각 CHAPTER 소스에서 확정한다.

---

# 19. CHAPTER DETAIL 작성 시 절대 바꾸면 안 되는 순서

## CH1~8

```text
SUBMISSION
→ INVESTIGATION
→ CONTRADICTION PROVEN
→ REJECTED
→ REVISION
→ RESUBMISSION
→ FINAL CHECK
→ APPROVED
→ FACILITY PROGRESS
```

---

## CH9

```text
100% facility
→ Hans result report
→ player VIEW RESULTS
→ 06 AUG / LITTLE BOY / SUCCESS
→ NPC silent reaction
→ 09 AUG / FAT MAN / SUCCESS
→ FINAL STATUS / SUCCESS
→ SUCCESS_
→ SUCCESS?
→ Hans glance
→ power-down
→ black
```

---

## CH10

```text
home
→ radio
→ phone
→ throw
→ floor caller
→ knock
→ door
→ parcel
→ box
→ photo + medal
→ postcard
→ J. ROBERT OPPENHEIMER
→ profile
→ Final Archive
→ seven REJECTED sounds
→ one APPROVED sound
→ silence
→ ENDING CODE
```

---

# 20. MASTER QA FOR CUE ORDER

전체 플레이에서 반드시 확인한다.

• CH1~8 surname이 나오지 않는다.
• CH8 100% 이전에 CH9 결과 의미가 노출되지 않는다.
• CH8 성공은 진짜 성공처럼 느껴진다.
• CH9는 player가 직접 VIEW RESULTS를 누른 뒤 시작된다.
• CH9 첫 mission은 06 AUG / Little Boy다.
• CH9 두 번째는 09 AUG / Fat Man이다.
• 두 mission 사이에 충분한 NPC reaction hold가 있다.
• CH9 결과 중 NPC가 도덕을 설명하지 않는다.
• SUCCESS? 이후 순차 power-down이 발생한다.
• CH10 phone 이전에 Oppenheimer 이름이 없다.
• phone call 문장 순서가 변경되지 않는다.
• handset throw는 random physics가 아니다.
• throw 뒤 바로 knock이 울리지 않는다.
• parcel은 door sweep 밖에 있다.
• photo와 medal은 어느 순서든 가능하다.
• 두 물체를 실제로 제거하기 전 postcard가 노출되지 않는다.
• postcard flip 완료 전 이름이 표시되지 않는다.
• `J. ROBERT`보다 `OPPENHEIMER`가 먼저 나오지 않는다.
• identity reveal 전 Final Archive 접근 불가.
• Final Archive 순서는 Richard→Enrico→Luis→John→George→Emilio→Kenneth→Hans다.
• 마지막 기억은 CH1~7 REJECTED → CH8 APPROVED 순서다.
• 마지막은 `ENDING CODE`이며 임의의 추가 title card가 없다.

---

# 21. 이 큐시트의 사용법

다음 제작 단계에서 각 챕터를 작성할 때 이 파일을 가장 먼저 참조한다.

예:

```text
CH01 세부 설계
00_OVERVIEW
01_SCENARIO
02_DIALOGUE
03_PUZZLE
04_SPATIAL_LAYOUT
05_NPC_BLOCKING
06_OBJECT_PLACEMENT
07_ANIMATION
08_CAMERA
09_INTERACTION_FLOW
10_AUDIO
11_LIGHTING
12_UI
13_STATE
14_FAILURE_CASES
15_MOBILE
16_QA
```

`01_SCENARIO.md`는 이 마스터 큐의 CH1 cue를 더 세분화할 수 있지만 사건 순서를 변경하지 않는다.

세부 문서에서 새 행동을 추가할 수는 있다.

단:

```text
새 행동이 기존 cue 사이를 연결하는 것
```

이어야 하며,

```text
기존 reveal 순서 / 승인 순서 / spoiler gate를 덮어쓰는 것
```

이어서는 안 된다.
