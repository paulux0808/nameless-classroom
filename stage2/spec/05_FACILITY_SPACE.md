<!-- MERGED SOURCE START: 16_FACILITY_ARCHITECTURE.md -->

# 16_FACILITY_ARCHITECTURE.md

# FACILITY ARCHITECTURE SPECIFICATION

이 문서는 CH1~CH9의 비밀 연구시설이 어떤 공간들로 구성되고, 각 공간이 어떻게 연결되며, 플레이어·NPC·문서·장비·카메라·이동·진행 연출을 수용해야 하는지를 정의한다.

범위:

• 시설 전체 구조
• Director Office
• 계산 공간
• 칠판/조건 검토 공간
• 계측실
• 기록/동기화 공간
• 재료 시험 구역
• 야간 계수/시료 공간
• 사고/통제 공간
• 최종 검토 공간
• CH9 결과 전광판 공간
• 복도
• 출입문
• 작업실 간 연결
• 공간 위계
• 동선
• chapter progression에 따른 공간 확장감
• 시설 재구성 원칙
• architectural spoiler control
• 공간 성능/재사용 원칙

정확한 좌표·거리·통로 폭은 `17_SPATIAL_LAYOUT.md`,
collision/clearance 최종값은 `18_COLLISION_AND_CLEARANCE.md`,
진행에 따른 변화는 `19_FACILITY_PROGRESS.md`가 담당한다.

---

# 1. 시설의 기본 인상

시설은 “비밀 연구기지”를 과장한 영화 세트가 아니다.

기본 인상:

• 실용적
• 기능 중심
• 임시 증축의 흔적
• 문서와 장비가 많음
• 군사 시설과 대학 연구실의 중간
• 보안 때문에 표식이 절제됨
• 공간마다 일하는 사람의 흔적이 있음
• 시간이 갈수록 밀도가 증가

---

# 2. 건축적 톤

허용:

• 목재/철제 책상
• 석고/콘크리트/도장 벽
• 금속 배관
• 케이블 트레이
• 형광등이 아닌 시대 적합 조명기구
• 작업용 벽등/천장등
• 장비 rack
• chalkboard
• 파일 캐비닛
• 실용적인 문과 복도

금지:

• 현대 SF bunker
• 거대한 LED wall
• 자동문
• 현대 data center
• 지나친 산업 폐허
• 모든 벽에 경고문/군사 마크

---

# 3. 시설 구조 철학

전체 시설을 하나의 거대한 seamless map으로 만들 필요는 없다.

프로젝트 구조는:

```text
챕터별 HTML
+
챕터별 canonical facility state
```

를 기본으로 한다.

따라서 각 챕터는 필요한 공간만 정확하게 구현해도 된다.

---

# 4. 공간 연속성

챕터마다 완전히 다른 건물처럼 보이면 안 된다.

공통 architectural anchors 유지:

• Director Office
• 주 복도
• 공용 작업 구역
• 주요 출입 방향
• 일부 반복 가구/벽/문 스타일
• 프로젝트 진행판 위치 또는 유사 위치

---

# 5. Canonical Facility Skeleton

권장 전체 관계:

```text
                  [CALCULATION]
                       |
                       |
[INSTRUMENTATION] -- [MAIN CORRIDOR] -- [DIRECTOR OFFICE]
       |                   |
       |                   |
[RECORDING]          [COMMON REVIEW]
       |
       |
[MATERIAL TEST] -- [CONTROL / INCIDENT]
       |
       |
[SAMPLE / COUNTING]

                  [FINAL REVIEW / BOARD]
```

정확한 물리 배치는 챕터별 단순화 가능.

---

# 6. Director Office

시설의 가장 중요한 공통 공간.

역할:

• 플레이어의 기준점
• 문서 제출
• 검토
• 도장
• 주요 NPC와 대화
• 일부 챕터 시작/종료
• progress 확인
• 프로젝트의 “책임자 위치” 체감

---

# 7. Director Office의 위치

시설 전체에서 너무 외진 독립실이 아니어야 한다.

권장:

• 주 복도와 직접 연결
• 여러 부서 접근이 쉬움
• 중앙부 또는 반중앙부

연구자들이 결과를 들고 찾아오기 자연스러워야 한다.

---

# 8. Director Office 문

한 개의 주 출입문.

기본:

• 복도 연결
• 책상과 직접 충돌하지 않음
• 문이 열려도 player path 유지
• NPC 입장/퇴장 framing 가능

---

# 9. Director Office 내부 zoning

최소:

```text
ENTRY ZONE
DESK ZONE
NPC PRESENTATION ZONE
PLAYER WORK ZONE
ARCHIVE / FILE ZONE
SIDE PROP ZONE
PROGRESS VIEW
```

---

# 10. Director Desk 위치

벽 정면에 붙이지 않는다.

player가 책상 뒤 또는 앞에서 물리적으로 일할 수 있는 공간 필요.

기본적으로 player는 desk의 한쪽에 고정된 “chair camera”가 아니라 실제로 서서 움직일 수 있다.

---

# 11. Desk 뒤 공간

카메라 clipping과 player 후퇴를 위해 충분한 공간.

책상 뒤가 바로 벽이면:

• inspect
• stamp
• camera focus

가 어렵다.

---

# 12. Desk 앞 공간

NPC 제출 zone.

한 명의 NPC가 서고,
player가 시야 확보하며,
문서 handoff가 가능한 깊이.

---

# 13. Desk 측면

cup/lamp/file 등의 생활감.

하지만:

• stamp
• compare
• handoff
• player path

와 충돌하지 않음.

---

# 14. Director Office의 시대감

장식:

• 파일
• 연필
• 커피
• 일정표
• 붉은/검열 문서
• 벽시계
• 전화기 가능
• 작은 책장

그러나 CH10 home처럼 개인적이지 않다.

---

# 15. Director Office의 비밀성

벽에 대놓고:

```text
MANHATTAN PROJECT
ATOMIC PROGRAM
```

표시 금지.

가능:

```text
PROJECT ███████
DIRECTOR
CALCULATION
INSTRUMENTATION
```

정도.

---

# 16. Main Corridor

시설의 공간적 spine.

역할:

• 챕터 간 이동감
• NPC 재등장/퇴장
• 진행에 따른 활성화
• 서로 다른 작업 구역 연결

---

# 17. Main Corridor 폭

정확한 수치는 다음 문서에서 확정.

공통 요구:

• player + NPC 교차 가능
• 일부 장비 cart가 있어도 지나갈 수 있음
• 문 열림과 충돌하지 않음
• 일반 NPC가 잠깐 있어도 critical path 유지

---

# 18. Corridor Shape

완전 긴 직선 하나보다:

• 짧은 코너
• T자 연결
• 측면 출입문

이 있으면 공간 규모가 느껴진다.

그러나 미로처럼 복잡하게 만들지 않는다.

---

# 19. Wayfinding

HUD 화살표보다 건축으로 유도.

방법:

• 조명
• 열린 문
• 소리
• NPC movement
• 벽 표지
• 장비 glow
• 시야 끝 landmark

---

# 20. Door Hierarchy

문은 기능에 따라 구분 가능.

예:

```text
OFFICE DOOR
LAB DOOR
EQUIPMENT ROOM DOOR
CONTROL ROOM DOOR
```

형태 variation은 작게.

---

# 21. 보안문 과장 금지

두꺼운 vault door를 모든 구역에 사용하지 않는다.

시설의 비밀성은:

• 통제된 접근
• 검열된 표지
• 제한된 동선

으로 표현.

---

# 22. Calculation Area

CH1 Richard와 연결.

공간 성격:

• desk rows
• 계산기
• 카드 tray
• paper stacks
• 밝은 작업등
• 집중된 소음

---

# 23. Calculation Area 규모

player가 전체 사무실을 깊게 탐험할 필요는 없다.

필요한 부분:

• Richard work anchor
• correction montage
• 접근 동선
• 일부 background calculators

---

# 24. Calculation Area 동선

Director Office와 너무 멀지 않게.

Richard가 결과를 가지고 오고 다시 돌아가는 것이 자연스러워야 한다.

---

# 25. CH1 Facility Activation

APPROVED 후 Calculation Area 일부가 더 활발해질 수 있음.

예:

• 계산기 소리
• 추가 lamp
• NPC 작업

progress를 실제 공간으로 보여줌.

---

# 26. Conditions / Chalkboard Area

CH2 Enrico.

공간 성격:

• 큰 chalkboard
• 회의/논쟁 가능한 open work zone
• 여러 연구자
• 종이/그래프

---

# 27. Chalkboard Area 구조

칠판 앞에:

• 최소 4~5명
• player
• Enrico

가 동시에 있어도 혼잡하지 않은 폭 필요.

---

# 28. Chalkboard Area 접근

복도에서 들어오면:

• 사람들의 논쟁
• 칠판
• Enrico

가 자연스럽게 보임.

player가 가장 먼저 뒤통수/벽만 보지 않게 한다.

---

# 29. Instrumentation Area

CH3 Luis.

공간 성격:

• CRT
• rack
• cable
• instrument table
• calibration records
• low mechanical hum

---

# 30. Instrumentation Area의 밀도

장비가 많아야 하지만 player corridor 확보.

장비를 벽 양쪽에 빽빽하게 붙여 60cm 통로만 남기는 구조 금지.

---

# 31. Instrumentation Sightline

player가 들어오면 핵심 CRT와 Luis를 찾을 수 있어야 한다.

장비 rack이 완전히 시야를 차단하지 않게 한다.

---

# 32. Reference Clock 위치

CH3 핵심 evidence.

• 별도 wall/bench 위치
• calibration sheet와 물리적으로 다른 곳
• 비교할 가치가 생김

하지만 찾기 어렵게 숨기지 않는다.

---

# 33. Recording / Timing Area

CH4 John 관련.

공간 성격:

• 신호 기록 장비
• timing sheets
• cable routing
• rack
• work desk

실제 무기 신호 체계를 직접 재현하지 않는다.

---

# 34. CH4 공간의 일반화

사용 가능한 표식:

```text
MULTI-CHANNEL RECORDING
CHANNEL A/B/C
AMPLIFIER UNIT
TIMING RECORD
```

금지:

실제 무기 회로/폭발계통이 명확히 드러나는 구조.

---

# 35. Material Test Area

CH5 George.

공간 성격:

• 더 넓고 산업적
• 큰 test equipment
• report station
• 통제선
• 먼 쪽 test chamber
• dust/impact aftermath 가능

---

# 36. Material Test Area 분리

player가 test chamber 내부 위험 구역까지 자유롭게 들어가지 않게 한다.

구조:

```text
OBSERVATION / CONTROL SIDE
|
BARRIER / WINDOW / DISTANCE
|
TEST ZONE
```

---

# 37. CH5 Test Impact

충격/먼지는 test zone에서 발생.

player safe side까지 particle가 과도하게 날아오지 않는다.

---

# 38. George 등장 동선

test zone 측면/통제 구역에서 player 쪽으로 접근.

출입문과 collision 없이.

---

# 39. Retest Work Area

REJECTED 후 George가 수정하는 공간.

플레이어가 나중에 찾아갈 수 있음.

같은 material test zone 안에 canonical work position.

---

# 40. Night Sample / Counting Area

CH6 Emilio.

공간 성격:

• 작고 집중적
• 어두운 ambient
• counter clicks
• sample table
• detector
• 기록지

---

# 41. CH6 공간의 정적

시설 전체가 완전히 꺼진 abandoned building처럼 보이면 안 된다.

일부:

• desk lamp
• instrument light
• corridor lamp

유지.

---

# 42. CH6 공간 유도

counter click과 작은 indicator가 player를 guide.

거대한 objective marker 없음.

---

# 43. Sample Area 구조

player가:

• sample A/B
• detector
• background record
• Emilio

를 자연스럽게 오갈 수 있어야 한다.

---

# 44. Control / Incident Area

CH7 Kenneth.

공간 성격:

• alarm
• control console
• recorder
• incident logs
• witness/record table
• access to test area

---

# 45. CH7 출입

경보 직후 일반 NPC와 player 동선이 충돌하지 않게 corridor/door width 필요.

---

# 46. CH7 시야

player가 들어오면 Kenneth가:

• control console
또는
• evidence table

근처에서 자연스럽게 보임.

---

# 47. Incident Evidence Zone

여러 기록을 비교할 수 있는 별도 surface.

Director desk까지 다시 돌아가야만 puzzle을 풀 수 있게 하지 않는다.

---

# 48. CH7 Architectural Tension

공간 자체가 약간 더 긴장감 있게 보일 수 있음.

방법:

• 경보등
• 열린 패널
• 흩어진 작업 기록

하지만 horror scene처럼 파괴하지 않는다.

---

# 49. Final Review Area

CH8.

시설 내 가장 큰 공용 검토 공간.

역할:

• 8명 주요 NPC
• Hans
• final report
• approved archive
• stamp
• progress
• group blocking
• 성공 장면

---

# 50. Final Review Area 위치

Director Office와 완전히 다른 먼 건물보다
시설 중심부의 큰 공용 공간을 권장.

CH1~7에서 간접적으로 봤던 공간이 열리는 느낌도 가능.

---

# 51. Final Review Area 크기

8명 + player + furniture + camera가 동시에 들어가야 함.

다만 대형 강당처럼 과도하게 넓지 않음.

연구시설 회의/검토 공간.

---

# 52. Final Review Area 구성

필수:

```text
REPORT TABLE
PLAYER REVIEW POSITION
HANS POSITION
7 NPC POSITIONS
STAMP AREA
APPROVED ARCHIVE
PROGRESS / STATUS DISPLAY
EXIT / CORRIDOR
```

---

# 53. Final Review Table

일반 Director desk보다 넓을 수 있음.

final report와 archive를 동시에 다룰 수 있는 surface.

---

# 54. Archive 위치

player가 CH8 final audit 중 빠르게 접근 가능.

report table에서 너무 멀지 않게.

---

# 55. CH8 Group Blocking

구체 배치는 `09_NPC_BLOCKING.md`.

architecture는:

• 반원형 배치 가능
• 중앙 통로
• side clearance
• rear camera space

를 제공.

---

# 56. CH8 Success Activation

공간의 장비/조명이 단계적으로 켜져도
갑자기 새 벽이나 방이 나타나지 않는다.

기존 공간의 기능이 살아나는 방식.

---

# 57. CH9 Board Area

CH8 Final Review Area와 같은 방을 활용하거나 직접 연결된 공간을 권장.

이유:

• 성취감이 곧 결과 목격으로 이어짐
• “같은 사람들이 같은 시설에서 자신들이 만든 결과를 본다”는 감정 유지

---

# 58. CH9 Board Wall

한쪽 벽에 대형 board/display.

CH8까지는:

• progress/status
• generic project data

정도만 보이거나 비활성.

CH9에서 `VIEW RESULTS`.

---

# 59. Board Placement

player 시야 정면.

조건:

• 8 NPC가 주변에 있어도 가리지 않음
• white flash가 room에 반사될 수 있음
• camera가 지나치게 가까이 갈 필요 없음
• screen aspect ratio가 archival sequence에 적합

---

# 60. Board Viewing Distance

정확한 값은 다음 문서.

원칙:

• 전체 화면 읽힘
• text 가독성
• 주변 NPC reaction peripheral view 가능

---

# 61. Board Side Space

NPC 반응용 측면 영역 충분히 확보.

Luis step-back,
George turn-away,
Hans glance 등을 수용.

---

# 62. CH9 Power-down Architecture

순차적으로 꺼질 수 있는 구역/장비가 room 안에 있어야 한다.

예:

```text
rear equipment
side work lamps
central lights
board
```

---

# 63. CH9 Blackout

완전 어둠 직전에도 player/NPC collision이 없어야 한다.

blackout을 이용해 다음 페이지 전환.

---

# 64. Facility Section Reuse

공간을 재사용해도 좋다.

예:

Director Office:
CH1/CH4/일부 chapter.

Main Corridor:
여러 chapter.

Final Review:
CH8/CH9.

재사용 시 시간의 흐름이 느껴지도록 상태 변화.

---

# 65. 같은 공간 복제감 방지

챕터별 HTML이라도 Director Office 구조가 매번 미묘하게 다른 위치로 바뀌면 continuity가 깨진다.

고정:

• 벽 방향
• 문 위치
• desk 위치
• 주요 landmark

변화:

• 서류
• 조명
• 사람
• 장비 활성
• 소품

---

# 66. Architectural Landmark

시설 내 기억할 수 있는 landmark 3~5개.

예:

• Director Office door
• long chalkboard
• instrument rack row
• progress board
• final review board

HUD 없이 방향 인식에 도움.

---

# 67. 공간 깊이

모든 room을 직사각형 box 하나로만 만들지 않는다.

가능:

• alcove
• side room
• partial wall
• equipment bay
• open doorway

단, 불필요한 복잡성은 피한다.

---

# 68. Ceiling Height

권장:

```text
2.7~3.2m
```

일반 office/lab.

Material Test 같은 일부 구역은 더 높을 수 있음.

---

# 69. Material Test Ceiling

필요 시:

```text
3.5~4.5m
```

큰 equipment/ventilation 느낌.

---

# 70. Door Height

일반:

```text
약 2.0~2.1m
```

15_OBJECTS 규칙 유지.

---

# 71. Window

시설 내 외부 window 사용은 제한.

비밀 시설의 위치/환경을 과도하게 노출하지 않는다.

작은 high window 또는 blinds 가능.

---

# 72. Observation Window

CH5 test zone 등에 내부 observation glass 사용 가능.

player가 위험 구역과 분리된 느낌.

---

# 73. Glass Visibility

투명 glass가 없어 보여 player가 벽에 부딪히는 문제를 피한다.

frame/reflection/roughness로 존재감 표현.

---

# 74. Floor

기본:

• wood
• sealed concrete
• utilitarian tile

공간 기능에 따라.

모든 room을 같은 재질로 복제하지 않는다.

---

# 75. Wall

office:
painted plaster/wood trim 가능.

lab:
painted concrete/plaster.

test:
더 산업적.

---

# 76. Ceiling

배관/전선 일부 노출 가능.

하지만 현대 산업 loft처럼 과장하지 않는다.

---

# 77. Electrical Conduit

시대감 있는 surface conduit.

장식 역할.

player route에 튀어나오지 않음.

---

# 78. Heating / Ventilation

radiator/vent 가능.

큰 fan/duct는 일부 room.

ambient audio와 연결 가능.

---

# 79. Architecture와 Audio

방마다 음향 특성이 조금 달라야 한다.

office:
dry/quiet.

calculation:
paper/mechanical clicks.

instrument:
hum.

test:
larger/reverberant.

sample:
quiet.

final review:
중간 규모.

세부는 `21_AUDIO.md`.

---

# 80. Architecture와 Lighting

공간마다 조명 목적이 다름.

office:
task + warm-neutral.

instrument:
lower ambient + instrument emissive.

test:
broad industrial.

sample:
night localized.

final review:
balanced.

세부는 `20_LIGHTING.md`.

---

# 81. Architecture와 NPC Density

작은 공간에 NPC를 억지로 많이 넣지 않는다.

CH8을 위해 별도 충분한 review area 확보.

---

# 82. Architecture와 Camera

중요 interaction 앞에 wall이 너무 가까우면 camera focus가 불가능.

각 주요 station 뒤/옆에 camera working volume 확보.

---

# 83. Camera Working Volume

대표:

• Director desk
• chalkboard
• CRT
• report table
• board

카메라가 20~30cm 보정만으로 안전한 framing 가능해야 함.

---

# 84. Architecture와 Door

문 위치는:

• 책상 모서리
• NPC anchor
• parcel
• chair

와 충돌하지 않게 한다.

---

# 85. Door Swing Direction

모든 문이 같은 방향으로 열릴 필요 없음.

공간 안전과 동선을 기준으로 chapter layout에서 결정.

---

# 86. 좁은 문 연출 금지

실제 realism을 이유로 player/NPC가 자주 걸리는 폭으로 만들지 않는다.

interaction game에서 navigation frustration이 story보다 앞서면 실패.

---

# 87. Architecture와 Player Collider

벽/가구 collision은 단순하고 안정적이어야 한다.

decorative trim/몰딩 때문에 player가 걸리지 않음.

---

# 88. Architecture와 Carry

CH10은 별도 home architecture지만 공통 원칙:

큰 object carry route는 문과 가구보다 먼저 확보.

시설에서는 큰 carry puzzle을 기본적으로 요구하지 않는다.

---

# 89. Architecture와 Furniture

가구는 room 기능을 설명.

예:

calculation:
desk rows.

instrument:
rack.

test:
control station.

sample:
small bench.

아무 room에나 generic desk 5개 배치하지 않는다.

---

# 90. Furniture Density

벽을 모두 가구로 채우지 않는다.

사용 공간과 통로가 실제로 남아 있어야 한다.

---

# 91. Architectural Clutter

시대감은:

• papers
• boxes
• cable
• tools
• coats

로 보조.

구조적 통로를 가리는 clutter 금지.

---

# 92. Signage

실제 공간명 표지 가능.

예:

```text
CALCULATION
INSTRUMENTATION
TEST CONTROL
RECORDS
```

---

# 93. Signage Spoiler

금지:

```text
BOMB ASSEMBLY
DETONATION
NUCLEAR
ATOMIC
```

CH1~8.

---

# 94. Room Naming

player-facing room 이름은 일반화.

내부 개발 id는 더 구체적이어도 production UI에 직접 출력하지 않는다.

---

# 95. Restricted Area

보여주면 spoiler가 되거나 구현할 필요 없는 공간은:

• 닫힌 문
• 통제된 access
• 짧은 corridor termination

으로 처리.

“보이지 않는 벽”보다 실제 건축 요소 사용.

---

# 96. Locked Door

열 필요 없는 문은 interaction target이 아닐 수 있다.

“LOCKED” UI를 계속 띄우지 않는다.

---

# 97. Fake Doors 남발 금지

복도 양쪽에 클릭 불가능한 문을 수십 개 배치해 player 기대를 계속 배반하지 않는다.

보이는 문 수 자체를 절제.

---

# 98. 탐험 범위

player는 필요한 공간을 직접 걸어갈 수 있음.

하지만 open-world 시설 투어가 목표가 아니다.

동선은 명확하고 밀도 있게.

---

# 99. Chapter Focus

각 chapter마다 주 공간 하나가 중심.

예:

```text
CH1 Calculation / Director
CH2 Chalkboard
CH3 Instrumentation
CH4 Recording
CH5 Material Test
CH6 Counting
CH7 Control
CH8 Final Review
CH9 Board
```

---

# 100. Director Office 반복 사용

매 chapter Director Office를 반드시 거치게 하지 않는다.

반복감 방지.

---

# 101. 공간적 progression

CH1:
작은 범위.

CH2:
공용 discussion 공간.

CH3:
기술 lab.

CH4:
기록/동기화.

CH5:
더 큰 test area.

CH6:
야간 깊은 공간.

CH7:
통제/사고.

CH8:
대형 final review.

CH9:
같은 시설의 결과 reveal.

플레이어가 시설이 커지고 프로젝트가 완성되는 느낌을 받는다.

---

# 102. Progress와 실제 거리

챕터가 진행된다고 이동 거리를 무조건 늘리지 않는다.

시설 규모 체감은:

• 새로운 공간
• 더 많은 사람
• 활성 장비
• 연결된 부서

로 만든다.

긴 복도 걷기로 만들지 않는다.

---

# 103. Backtracking

필요한 경우만.

예:

CH8 archive와 final report 사이 짧은 반복.

CH5 George 재방문.

그 외 불필요한 왕복 최소화.

---

# 104. CH5 재방문

플레이어가 George를 찾아가는 장면은 중요.

이때:

• 이전에 봤던 route
• 바뀐 test state
• 밤/시간 경과 가능

등으로 재방문 의미를 만든다.

---

# 105. CH6 Night Transition

같은 시설이라도 조명과 사람 밀도로 공간 인상이 크게 변할 수 있음.

건축을 새로 만들지 않고 시간/상태로 변화.

---

# 106. CH7 Alarm Route

alarm event 중 player가 어디로 가야 할지 architecture가 자연스럽게 유도.

예:

• 붉은 light direction
• 열린 control room door
• NPC movement
• alarm source

---

# 107. CH8 접근

final review room 입장 시:

• 8명 그룹
• report table
• Hans

가 한 번에 완전히 겹쳐 보이지 않는 시야 구조.

---

# 108. CH8 Doorway Reveal

player가 문을 통과하면서 room 전체를 단계적으로 보는 구조 가능.

문턱에서 camera가 사람 내부에 들어가지 않게.

---

# 109. CH9 Board Reveal

CH8까지 board가 존재했더라도 결과 화면 콘텐츠는 숨김.

CH9 board activation 자체가 의미 있는 변화.

---

# 110. CH9 화면을 방 전체가 봄

board는 player만 보는 개인 모니터가 아니다.

8명의 NPC가 함께 볼 수 있는 위치.

---

# 111. CH9 방 안의 침묵

건축적으로도 넓은 빈 공간보다
사람과 장비가 가까이 있는 방에서 침묵이 더 강할 수 있음.

너무 거대한 auditorium 금지.

---

# 112. Architecture와 Final Archive

Final Archive는 물리 시설에서 이어질 필요 없음.

CH10 후반 2D/black cinematic layer.

시설 architecture는 CH9 blackout으로 종료.

---

# 113. Home 분리

CH10 자택은 시설 architecture와 다른 문서/챕터 설계가 담당.

다만 common scale과 collision 원칙은 동일.

---

# 114. Facility State Reconstruction

챕터별 HTML에서 facility를 재생성할 때:

고정:

```text
architecture skeleton
major landmarks
room dimensions
door positions
```

변화:

```text
props
NPC
documents
equipment state
lighting
progress
```

---

# 115. Geometry Reuse

공통 wall/door/floor modules 재사용 가능.

단 동일 타일 반복이 너무 눈에 띄지 않게 variation.

---

# 116. Modular Architecture

권장 module:

```text
WALL_1M
WALL_2M
DOOR_SECTION
CORNER
WINDOW_SECTION
LAB_PARTITION
FLOOR_TILE
CEILING_SECTION
```

---

# 117. Module Grid

건축 module은 일정 grid를 사용하면 alignment/collision이 안정적.

예:

```text
0.5m 또는 1m grid
```

하지만 모든 가구를 grid에 딱 맞춰 인공적으로 배치할 필요 없음.

---

# 118. Wall Thickness

시각/충돌상 존재감 있는 두께 필요.

권장 시작:

```text
0.12~0.20m
```

정확한 값은 layout/collision 문서.

---

# 119. Interior Partition

얇은 lab partition은 더 얇을 수 있음.

그래도 camera가 반대편 texture를 뚫고 보는 문제 방지.

---

# 120. Geometry Overlap

wall module끼리 겹쳐 z-fighting 만들지 않는다.

코너는 전용 module 또는 적절한 overlap 처리.

---

# 121. Floor Seam

module 경계가 지나치게 반복되어 grid가 드러나지 않게 texture/UV 조정.

---

# 122. Ceiling Seam

카메라가 올려다봐도 틈/skybox 노출 없음.

---

# 123. Exterior Void

시설 밖 공간을 구현하지 않을 경우 문/창문 너머 검은 void가 보이지 않게 한다.

복도/벽/occluder 사용.

---

# 124. Occlusion

보이지 않는 room까지 전부 render할 필요 없음.

chapter 단위로 필요한 공간만.

필요하면 simple occlusion/culling.

---

# 125. Portal-like Room Activation

문 너머 공간을 필요 시 활성화할 수 있음.

하지만 문 열 때 pop-in이 보이지 않도록 미리 준비.

---

# 126. Lighting Leak

얇은 벽 때문에 다른 room light가 새지 않게 한다.

shadow/light range 관리.

---

# 127. Audio Leak

room 간 ambience도 완전히 동일하게 들리지 않게.

door/거리 기반 attenuation.

---

# 128. Performance

시설 architecture는 large unique mesh 하나보다 적절한 module grouping.

draw call 과다도 피함.

---

# 129. Static Batching

벽/바닥/천장 등 static geometry는 가능한 범위에서 merge.

interaction/door는 별도.

---

# 130. Shadow Casting

모든 벽/가구가 high-quality dynamic shadow를 만들 필요 없음.

주요 공간/광원 중심.

---

# 131. Collider Geometry

render detail과 분리.

벽:
simple boxes.

desk:
simplified boxes.

door:
panel collider.

---

# 132. Navigation Clearance

architecture가 먼저 통로를 확보하고
collision system이 억지로 보정하지 않게 한다.

---

# 133. Architecture Validation Scene

각 room은 개발 모드에서 다음을 표시 가능.

• wall bounds
• door swing
• player path
• NPC path
• interaction zones
• camera zones
• reserved no-prop zones

---

# 134. Room QA

각 room마다 검사:

• player spawn
• exit
• critical object
• NPC anchor
• camera safe pose
• door sweep
• wall clipping
• mobile FOV
• no dead end trap

---

# 135. Corridor QA

검사:

• player/NPC 교차
• door opening
• NPC yield
• prop 추가 후 clearance
• camera wall clipping
• no fake dead end confusion

---

# 136. CH1 QA

• Richard 입장 자연스러움
• desk interaction
• calculation room 연결
• progress activation
• 퇴장/재등장 route

---

# 137. CH2 QA

• 여러 연구자 + player 수용
• chalkboard 전체 보임
• Enrico 접근
• NPC 겹침 없음
• discussion space 충분

---

# 138. CH3 QA

• Luis/CRT 시야
• instrument inspect
• reference clock 접근
• 장비 사이 통로
• cable clutter 비방해

---

# 139. CH4 QA

• John waiting
• recording/timing room generic
• weapon-specific silhouette 없음
• document/equipment comparison 공간

---

# 140. CH5 QA

• test impact safe
• George entry
• report review
• retest revisit
• observation/test separation
• 큰 공간이 비어 보이지 않음

---

# 141. CH6 QA

• dark but navigable
• counter sound source 위치
• Emilio 찾기 가능
• sample/detector path
• player/NPC blocking 없음

---

# 142. CH7 QA

• alarm route
• Kenneth visible
• evidence table
• 일반 NPC 이동과 player 충돌 없음
• control room 과밀 아님

---

# 143. CH8 QA

• 8명 + player
• final report
• archive
• stamp
• progress
• central path
• gesture clearance
• camera framing
• approval 후 movement

---

# 144. CH9 QA

• board 충분히 큼
• 8명 view
• player board zone
• NPC reactions
• light flash
• power-down
• no NPC screen occlusion
• blackout transition

---

# 145. Spoiler QA

CH1~8 architecture/signage에서 검사:

• Manhattan Project
• atomic
• nuclear
• bomb
• detonation
• implosion
• Trinity
• Hiroshima
• Nagasaki
• Little Boy
• Fat Man

노출 없음.

---

# 146. Architectural Foreshadowing 제한

원형 폭발 렌즈처럼 보이는 벽 장식,
폭탄 실루엣,
투하 지도 등
의도치 않은 visual spoiler 금지.

---

# 147. 시대 QA

검사:

• 현대 문/손잡이
• LED
• 현대 office furniture
• 현대 flat panel
• 현대 emergency signage

혼입 여부.

---

# 148. Scale QA

player eye height 기준:

• ceiling
• door
• desk
• chalkboard
• rack
• corridor

비례 확인.

---

# 149. Camera QA

모든 important room에서:

• near wall clipping
• low ceiling feeling
• NPC head collision
• closeup path

검사.

---

# 150. Mobile QA

모바일 landscape에서:

• 좁은 corridor가 너무 답답하지 않음
• board text 읽힘
• chalkboard 전체 구성 이해
• camera turn으로 벽이 과도하게 가까이 보이지 않음

---

# 151. 금지사항

• 하나의 거대한 facility map을 먼저 만들고 chapter를 끼워 넣기
• 챕터마다 architecture landmark 변경
• 긴 복도 걷기로 규모 표현
• room마다 generic desk 복제
• door threshold에 NPC/가구 배치
• camera working volume 무시
• player critical path를 clutter로 채움
• 모든 문 click 불가 fake door
• sci-fi bunker
• modern equipment architecture
• weapon-specific signage/geometry
• CH8을 작은 Director Office에 8명 억지 배치
• CH9 board를 personal monitor 수준으로 작게 제작
• CH9를 거대한 auditorium로 만들기
• wall thickness 0에 가까워 light/camera leak
• chapter별 HTML이라고 시설 구조를 매번 임의 변경
• 장식 우선 후 동선 확보
• collision system으로 잘못된 architecture를 억지 보정

---

# 152. 후속 문서와의 연결

`17_SPATIAL_LAYOUT.md`
• 각 room의 실제 치수, 좌표, 통로 폭, 가구 배치 확정

`18_COLLISION_AND_CLEARANCE.md`
• wall/door/furniture/player/NPC 실제 collider 및 clearance 확정

`19_FACILITY_PROGRESS.md`
• CH1→CH8 공간별 활성화, 사람/문서/장비 밀도 변화 정의

`20_LIGHTING.md`
• room별 lighting 구조와 CH8/CH9 변화 상세화

`21_AUDIO.md`
• room별 ambience와 acoustic zone 정의

`22_VISUAL_STYLE.md`
• architecture material, wear, 시대 시각 언어 확정

`28_PERFORMANCE.md`
• static batching, culling, shadow budget 최종화

각 CHAPTER `SPATIAL_LAYOUT.md`
• 해당 챕터가 사용하는 canonical room subset과 실제 배치를 구체화

<!-- MERGED SOURCE END: 16_FACILITY_ARCHITECTURE.md -->

================================================================================
ORIGINAL SOURCE: 17_SPATIAL_LAYOUT.md
================================================================================

# 17_SPATIAL_LAYOUT.md

# SPATIAL LAYOUT SPECIFICATION

이 문서는 CH1~CH9 시설에서 플레이어, NPC, 가구, 장비, 문, 상호작용 지점, 카메라, 작업대, 이동 경로가 실제 공간 안에서 충돌 없이 공존하도록 하는 배치 규칙을 정의한다.

이 문서는 공간을 “보기 좋게” 배치하는 문서가 아니다.

목표:

• 실제 사람이 움직일 수 있음
• 플레이어가 갇히지 않음
• NPC가 벽/가구를 통과하지 않음
• 문이 사람/가구를 치지 않음
• 카메라가 벽을 뚫지 않음
• 손과 물체가 실제로 닿을 수 있음
• carry object가 문을 통과할 수 있음
• 다인원 장면에서 서로 겹치지 않음
• interaction distance가 자연스러움
• 모바일 FOV에서도 공간이 읽힘
• 챕터별 연출이 실제 좌표에서 성립함

실제 collider 수치와 허용 오차는 `18_COLLISION_AND_CLEARANCE.md`가 최종 확정한다.

---

# 1. 기본 단위

Three.js world 기준:

```text
1 unit = 1 meter
```

모든 room, object, player, NPC, camera는 동일 기준을 사용한다.

---

# 2. 공간 배치 우선순위

항상 다음 순서로 배치한다.

```text
1. PLAYER CRITICAL PATH
2. PLAYER INTERACTION ZONE
3. NPC ROUTE
4. NPC ANCHOR
5. CAMERA WORKING VOLUME
6. DOOR SWEEP
7. OBJECT ANIMATION SWEEP
8. LARGE FURNITURE
9. SMALL PROP
10. DECORATION
```

장식을 먼저 놓고 남는 공간에 gameplay를 끼워 넣지 않는다.

---

# 3. 공간 데이터의 두 층

공간은 두 종류 좌표로 관리한다.

```text
ARCHITECTURAL COORDINATE
GAMEPLAY ANCHOR
```

Architectural Coordinate:
벽, 바닥, 문, 가구.

Gameplay Anchor:
player spawn, NPC wait, document review, conversation, camera, carry destination 등.

---

# 4. World Origin

시설 전체를 하나의 대형 map으로 쓰더라도 world origin은 주요 playable zone 근처.

챕터별 HTML이라면 각 챕터 공간을 원점 가까이에 재구성 가능.

floating-point 정밀도를 위해 수백~수천 미터 좌표 사용 금지.

---

# 5. Floor Reference

각 room에는 명확한 floor Y.

예:

```text
floorY = 0
```

player/NPC/object grounding이 같은 기준을 사용한다.

---

# 6. Room Bounds

각 room은 gameplay용 내부 bounds를 가진다.

```js
{
  id,
  min,
  max,
  floorY,
  ceilingY,
  entrances,
  criticalZones
}
```

---

# 7. 기본 Ceiling

일반 office/lab:

```text
2.8~3.1m
```

Material Test:

```text
3.6~4.2m
```

정확한 시각 비율에 따라 조정.

---

# 8. 일반 문

권장 clear opening:

```text
width 0.86~0.94m
height 2.0~2.1m
```

render frame 두께와 실제 통과 폭을 구분.

---

# 9. 넓은 장비 출입문

필요한 경우:

```text
width 1.0~1.15m
```

CH10 parcel route와는 별도 home layout이지만 동일 원칙 적용.

---

# 10. 문 앞 금지 영역

문 threshold 양쪽에 최소한의 clear zone을 둔다.

금지:

• chair
• filing cabinet
• NPC idle anchor
• document stack
• parcel
• permanent interaction point

---

# 11. Door Sweep Zone

door hinge를 기준으로 panel이 지나가는 arc.

이 영역은 gameplay reserved zone.

문이 90° 열릴 때:

• player
• NPC
• movable story object

가 들어가지 않도록 한다.

---

# 12. 문과 책상

문을 열었을 때 책상 모서리를 치는 구조 금지.

door panel과 desk 사이 시각적으로도 충분한 여유 확보.

---

# 13. 문과 벽

문 maximum angle에서 wall과 과도한 겹침 금지.

실제 stop angle을 배치부터 결정.

---

# 14. Main Corridor

권장 clear width:

```text
1.35~1.65m
```

player + NPC가 교차 가능한 수준.

---

# 15. 넓은 공용 동선

CH8/CH9 그룹 공간 접근:

```text
1.6~2.0m
```

가능.

---

# 16. 좁은 보조 통로

player가 반드시 지나야 하지 않는 service gap:

```text
0.8~1.0m
```

가능.

critical path에는 사용하지 않는다.

---

# 17. Player Critical Path

각 chapter마다 시작 단계에서 path를 먼저 그린다.

예:

```text
SPAWN
→ SCIENTIST
→ EVIDENCE A
→ EVIDENCE B
→ REVIEW
→ STAMP
→ NEXT EVENT
```

이 path 주변에 clutter를 넣지 않는다.

---

# 18. Critical Path Width

실제 collider를 제외한 free width 기준.

권장:

```text
minimum 1.0m
preferred 1.2m+
```

NPC 교차가 있으면 더 넓게.

---

# 19. Turning Space

player가 방향을 바꾸는 코너는 capsule 중심만 통과하면 되는 크기가 아님.

camera/body를 고려해 충분한 turning square 확보.

권장 시작:

```text
약 1.2m x 1.2m 이상
```

---

# 20. Dead-End

필수 interaction area가 막다른 작은 틈 안에 있지 않게 한다.

player가 들어가 NPC가 뒤를 막으면 빠져나올 수 없는 구조 금지.

---

# 21. Player Spawn Zone

spawn 시:

• floor 위
• wall 밖
• furniture 밖
• NPC anchor 밖
• door sweep 밖
• camera forward에 최소 시야 확보

---

# 22. Spawn Clearance

player capsule 주변에 최소 이동 가능 여유.

spawn 직후 제자리에서 360° 회전해 camera가 벽 안으로 들어가지 않아야 한다.

---

# 23. Spawn Facing

chapter 시작 목표를 직접 정면 중앙에 강제할 필요는 없지만:

• 공간 landmark
• 주요 NPC
• 소리 source
• 열린 doorway

중 하나가 읽혀야 한다.

---

# 24. Player Interaction Zone

중요 interaction마다 player standing region을 따로 둔다.

예:

```text
DESK_REVIEW_PLAYER
CRT_INSPECT_PLAYER
BOARD_VIEW_PLAYER
PHONE_PLAYER
PARCEL_TABLE_PLAYER
```

---

# 25. Interaction Zone은 점이 아니다

player가 정확히 한 좌표에 서야 작동하는 구조 금지.

영역 안에서 interaction 가능하고,
필요하면 시작 시 수십 cm pose normalization.

---

# 26. Normalization 허용

기본 보정:

```text
약 0.1~0.3m
```

범위.

1m 이상 끌어오는 teleport 금지.

---

# 27. Conversation Layout

player ↔ NPC:

권장:

```text
1.45~1.8m
```

정도.

책상 등 barrier가 있으면 실제 얼굴 간 거리와 collider 관계를 별도 확인.

---

# 28. Conversation Lateral Offset

NPC를 player 정면 중심에만 두지 않는다.

필요하면:

```text
±0.25~0.45m
```

측면 offset.

문서, 손, 얼굴을 같은 line에 겹치지 않게 한다.

---

# 29. Conversation Rear Clearance

player 뒤:

```text
약 0.7~1.0m
```

정도 free zone 권장.

camera restore/turn 시 벽 clipping 방지.

---

# 30. NPC Standing Footprint

일반 standing NPC는 단순 point가 아니라 공간을 점유.

초기 planning footprint:

```text
약 0.65~0.8m diameter
```

정확 collider는 다음 문서에서 확정.

---

# 31. NPC Pair Spacing

정적 NPC:

```text
center-to-center 0.85~1.1m 이상
```

권장.

gesture가 크면 더 넓게.

---

# 32. Group Spacing

CH8/CH9:

```text
약 0.95~1.4m
```

범위에서 비대칭.

---

# 33. NPC Route Corridor

NPC authored route에는 보이는 waypoint line뿐 아니라 body width를 고려한 corridor가 필요.

route center가 벽에서 충분히 떨어져야 함.

---

# 34. Route와 Furniture

가구 corner와 NPC root path 사이 최소 여유 확보.

팔 swing/held binder도 고려.

---

# 35. Route Crossing

player critical path와 NPC route가 교차하는 것은 가능.

단:

• 넓은 위치
• 잠깐
• local wait/yield 가능

좁은 door threshold에서 반복 교차 금지.

---

# 36. Door Crossing Route

NPC:

```text
APPROACH
→ THRESHOLD
→ CLEAR
```

세 단계 anchor.

도착 anchor를 threshold에 두지 않는다.

---

# 37. Camera Working Volume

중요 interaction마다 카메라가 움직일 수 있는 3D 공간을 예약.

예:

• 문서 inspect
• stamp
• NPC focus
• phone
• board

---

# 38. Camera와 Wall

camera pose와 벽 사이 최소 여유를 확보.

camera near plane만 안 닿으면 된다는 기준 금지.

작은 head movement도 가능해야 한다.

---

# 39. Camera와 Ceiling

player가 pitch up했을 때 ceiling 내부로 들어가지 않게 한다.

너무 낮은 ceiling 아래 camera cinematic offset 금지.

---

# 40. Camera와 NPC

dialogue camera safe volume 안에 NPC가 들어오지 않게 blocking.

NPC 팔 gesture도 고려.

---

# 41. Desk Layout

Director Desk는 여러 gameplay zone을 수용.

권장 예:

```text
LEFT REAR:
lamp / archive

LEFT FRONT:
compare A

CENTER:
active document

RIGHT FRONT:
compare B

RIGHT REAR:
stamp home

SIDE:
cup / pencil
```

실제 handedness에 맞춰 mirror 가능.

---

# 42. Desk Player Position

player가 desk edge와 너무 붙지 않는다.

눈높이에서 문서가 자연스러운 하향 시야 안에 들어오도록.

---

# 43. Desk NPC Position

NPC는 반대편 또는 대각선.

문서 handoff에서 팔 길이가 현실적이어야 한다.

---

# 44. Desk Depth

`15_OBJECTS.md`의:

```text
0.72~0.88m
```

범위를 기본.

너무 깊으면 handoff가 불가능.

너무 얕으면 player/NPC가 너무 가까움.

---

# 45. Stamp Zone

stamp home과 target document 사이 손 경로 확보.

cup/lamp가 sweep를 침범하지 않는다.

---

# 46. Compare Zone

두 문서를 펼쳐도:

• edge overlap 없음
• desk 밖으로 나가지 않음
• stamp 영역과 충돌하지 않음

---

# 47. Desk Wall Distance

책상 뒤/옆에서 camera working volume 확보.

최소:

```text
0.8~1.2m
```

정도 여유를 우선 검토.

---

# 48. Work Desk

NPC 작업대는 벽에 붙어도 됨.

단, NPC work anchor와 chair/standing posture 공간 확보.

---

# 49. Standing Workstation

desk edge 앞 NPC center:

```text
약 0.45~0.65m
```

offset starting point.

torso/arm reach에 따라 조정.

---

# 50. Seated Workstation

chair seat anchor,
stand anchor,
approach anchor를 모두 따로 둔다.

---

# 51. Chair Rear Clearance

NPC가 의자에서 일어나거나 들어갈 경우:

```text
약 0.5~0.75m
```

여유.

---

# 52. Chair와 Critical Path

고정 chair가 corridor를 0.8m 이하로 줄이지 않게 한다.

---

# 53. Filing Cabinet

drawer를 실제 열지 않는다면 front clearance를 gameplay로 크게 잡을 필요 없음.

열어야 하면 drawer sweep 공간 예약.

---

# 54. Chalkboard Area

board 앞 clear depth:

```text
약 2.0~2.6m
```

권장.

NPC 그룹 + player movement.

---

# 55. Chalkboard Side Clearance

Enrico/연구자들이 side로 움직일 공간.

board 양 끝을 cabinet으로 꽉 막지 않는다.

---

# 56. CH2 Group Layout

칠판 앞의 people zone과 player approach lane을 분리.

player가 NPC 사이를 비집고 들어가지 않게 한다.

---

# 57. Instrument Rack Spacing

장비 rack 전면:

```text
약 0.8~1.0m
```

이상 작업/inspect aisle 권장.

---

# 58. Opposed Rack

양쪽 벽에 rack이 있다면 aisle:

```text
1.2m+
```

권장.

---

# 59. CRT Inspect

Luis와 player가 동시에 CRT를 볼 수 있게:

• player zone
• Luis work zone
• screen line of sight

를 겹치지 않게 구성.

---

# 60. Small Control Proxy

버튼/노브는 mesh를 키우지 않고 proxy 사용.

따라서 장비 사이 공간을 interaction 때문에 비현실적으로 늘릴 필요 없음.

---

# 61. CH4 Recording Area

rack/desk 사이:

• John route
• player evidence path
• timing sheet inspect

확보.

weapon-specific large apparatus를 배치하지 않는다.

---

# 62. Material Test Observation Side

player zone은 위험 test zone과 분리.

권장 observation/control zone depth:

```text
2.5~4m
```

장면 규모에 따라.

---

# 63. Test Chamber Separation

barrier/window/거리.

player가 test object 바로 옆까지 가서 technician처럼 조작하지 않게 한다.

---

# 64. George Route

test side → review 위치로 이동 시:

• door
• rail
• control desk

회피.

---

# 65. CH5 Review Zone

George와 player의 긴장 장면은 좁은 corner가 아니라 충분한 정면 공간.

물리 위협처럼 보이지 않게 대화 거리 유지.

---

# 66. CH5 Revisit

George 수정 중 work anchor까지 player가 갈 수 있는 route.

retest props가 이전 critical path를 막지 않는다.

---

# 67. CH6 Counting Area

작은 공간이지만:

• player
• Emilio
• sample table
• detector

사이에 최소 loop 동선 확보.

---

# 68. CH6 Dark Route

조명이 어두워도 실제 collision/통로가 복잡하지 않게.

어둠 + 좁은 미로를 동시에 사용하지 않는다.

---

# 69. Sample Table

A/B sample이 별도 slot.

proxy overlap 금지.

---

# 70. Detector Position

player가 sample과 detector 기록을 번갈아 볼 때 짧은 1~3m 이동 범위 내.

불필요한 왕복을 줄인다.

---

# 71. CH7 Control Room

입구부터 Kenneth/evidence까지 직선 또는 완만한 route.

alarm 중 background NPC가 이 route를 역으로 달려오지 않게 blocking.

---

# 72. Control Console

player가 직접 모든 control을 누르지 않는다.

evidence inspect point와 NPC work point를 분리.

---

# 73. Incident Evidence Table

여러 기록을 펼칠 수 있는 surface.

권장:

```text
width 1.2~1.6m
depth 0.7~0.9m
```

---

# 74. Evidence Compare

시간 기록 3~4개를 한 번에 비교할 경우 table width를 먼저 확보.

문서를 겹쳐놓고 UI로만 해결하지 않는다.

---

# 75. CH8 Final Review Room

권장 내부 usable area 시작 범위:

```text
width  6.5~8.5m
depth  5.5~7.5m
```

천장:

```text
3.0~3.4m
```

실제 chapter asset에 따라 조정.

---

# 76. CH8 Report Table

권장:

```text
width 1.6~2.2m
depth 0.8~1.0m
```

final report + archive reference + stamp를 수용.

---

# 77. CH8 Player Zone

report table 기준 player side에:

```text
약 1.2~1.8m depth
```

free area.

stamp camera와 이동 복구에 사용.

---

# 78. CH8 Hans Zone

Hans는 table 반대편/대각.

player ↔ Hans:

```text
약 1.6~2.2m
```

상황에 따라.

---

# 79. CH8 Other Seven

Hans 주변 비대칭 반원.

table과 wall 사이에 끼우지 않는다.

---

# 80. CH8 Critical Aisle

player가 archive ↔ final report를 오갈 수 있는 clear aisle.

NPC group이 이를 막지 않는다.

---

# 81. CH8 Archive Distance

report table에서 archive까지:

```text
약 2~4m
```

정도 권장.

너무 가까우면 모든 정보가 한 spot에 몰림.

너무 멀면 반복 backtracking.

---

# 82. CH8 Progress Board

report table에서 고개를 들면 볼 수 있는 위치.

stamp 문서를 가리지 않음.

---

# 83. CH8 Success Movement

승인 후 NPC가 작은 이동을 해도 서로 겹치지 않게 side clearance 사전 확보.

---

# 84. CH9 Board Wall

board active area 권장:

```text
width 2.2~3.0m
height 1.25~1.7m
```

actual room에 따라.

---

# 85. Board Bottom Height

player/NPC 뒤에서 볼 수 있게:

```text
약 0.75~1.0m
```

바닥 위.

---

# 86. Board Center Height

대략 player eye level 근처 또는 조금 높게.

모두가 함께 보는 공용 display 느낌.

---

# 87. CH9 Player View Zone

board에서:

```text
약 3.2~4.8m
```

정도 시작 범위.

FOV와 board size를 함께 검증.

---

# 88. Board Frame Occupancy

player view pose에서 board가:

desktop:
화면 높이 약 65~80%

mobile landscape:
과도하게 잘리지 않는 수준

이 되도록 조정.

정확 수치는 camera/mobile 문서와 실제 QA 우선.

---

# 89. CH9 NPC Side Zones

NPC는 board 중심 line을 비운다.

좌/우/앞뒤로 distributed.

---

# 90. Hans Position

player 기준 측면 전방.

player가 board를 보면서 peripheral vision으로 Hans를 인식 가능.

---

# 91. Richard / Enrico

board 앞 측면.

화면을 가리지 않는 angle.

---

# 92. Luis Step-Back Zone

Luis 뒤에:

```text
0.4~0.6m
```

반응 이동 여유.

---

# 93. George Turn Zone

George side clearance:

```text
약 0.5~0.8m
```

상체/몸 회전.

---

# 94. Kenneth Seat Candidate

사용 시:

• chair
• seat approach
• stand clearance

모두 이미 공간에 존재.

반응 때문에 갑자기 의자를 생성하지 않는다.

---

# 95. Board Screen Occlusion

어느 주요 NPC 머리/몸도 board 핵심 text:

```text
LITTLE BOY
FAT MAN
SUCCESS
SUCCESS?
```

를 장시간 가리지 않음.

---

# 96. White Flash Visibility

NPC silhouette가 보일 정도지만 board 영상 자체를 가리지 않는 거리.

---

# 97. Power-Down Layout

room 안의 light/equipment bank가 공간적으로 분리되어 있어 순차 shutdown이 눈에 읽힘.

---

# 98. Progression 공간 변화

CH1→CH8에서 같은 room에 object가 추가될 수 있다.

항상 reserved gameplay zone을 우선 보존.

---

# 99. No-Prop Zone

개발 시 명시적으로 표시:

```text
PLAYER_PATH
NPC_PATH
CAMERA_VOLUME
DOOR_SWEEP
STAMP_SWEEP
GROUP_SPACE
```

여기에는 장식을 두지 않는다.

---

# 100. Prop Density

가장자리/벽/unused corner에서 density를 만든다.

중앙 critical path는 비교적 깨끗.

---

# 101. Visual Clutter와 Physical Clutter

시각적으로 케이블/종이가 많아 보여도 collider는 제한.

모든 작은 물체가 navigation obstacle이면 실패.

---

# 102. Cable Placement

바닥 케이블은:

• 벽 쪽
• 장비 뒤
• path를 가로질러도 시각적으로 낮음

가능.

player/NPC collider obstacle로 기본 처리하지 않음.

---

# 103. Crate Placement

큰 crate는 path outside.

door 옆에 쌓아 문 폭을 줄이지 않는다.

---

# 104. Tool Cart

NPC route와 겹치지 않는 side bay.

CH7 alarm 때 특히 주의.

---

# 105. Wall-Mounted Object

칠판/시계/signage/배관은 player capsule이 걸릴 정도로 과도하게 돌출하지 않는다.

---

# 106. Interaction Proxy Collision

proxy는 interaction ray에만 사용.

player/NPC physical collision을 만들지 않는다.

---

# 107. Inspect Object 공간

문서/메달/사진 등 pickup 전 world 주변에 hand approach path 확보.

벽 바로 밑 5cm 틈에 story object 배치 금지.

---

# 108. Object Placement Slot

slot 주변 clearance를 실제 bounding size보다 약간 크게.

다른 소품이 visually touching하더라도 animation path가 겹치지 않게 한다.

---

# 109. Door + Parcel

CH10 home 문서는 별도 layout이지만 공통 적용.

parcel은 현관문 sweep 밖.

player가 문을 열고 parcel 사이에 갇히지 않음.

---

# 110. Parcel Carry Route

door clear opening과 interior turn space가 parcel expanded footprint를 수용.

정확 clearance는 18.

---

# 111. Box Table

상자 뒤 lid sweep.

앞 player zone.

좌/우 photo/medal slots.

한 테이블 위에서 모두 성립해야 한다.

---

# 112. Phone Table

전화기 주변:

• handset pickup
• cradle lowering
• throw corridor
• edge impact
• cord
• floor rest

공간 사전 확보.

---

# 113. Handset Throw Corridor

다른 가구/벽/NPC/player를 통과하지 않는 3D corridor.

authored path 기준으로 reserved.

---

# 114. Handset Floor Rest

player 이동 path 한가운데 떨어져 player collider를 막지 않음.

작은 object이므로 navigation collision은 기본 없음.

---

# 115. Camera Safe Pose와 Spatial Layout

카메라 보정을 위해 공간이 부족하다면 camera code 문제가 아니라 layout 문제로 먼저 본다.

---

# 116. Small Room 제한

작은 room 안에:

• player
• NPC 3명
• desk
• cabinet
• cinematic camera

를 억지로 넣지 않는다.

필요한 장면 규모에 맞게 architecture 수정.

---

# 117. Layout Authoring 방식

각 room은 최소 다음 layer로 설계.

```text
ARCHITECTURE
FURNITURE
GAMEPLAY ZONES
NPC ANCHORS
ROUTES
CAMERA VOLUMES
PROPS
```

---

# 118. 좌표 표기

챕터 detailed layout에서는 anchor 좌표를 명시.

예:

```text
PLAYER_START     (0.0, 0, 2.2)
DESK_CENTER      (0.0, 0, 0.0)
NPC_RICHARD      (0.4, 0, -1.3)
DOOR             (-2.3, 0, -0.5)
```

---

# 119. 좌표보다 관계 우선

초기 common doc에서는 absolute 좌표보다:

• 거리
• 방향
• clearance

를 우선.

챕터 detailed design에서 final coordinate 고정.

---

# 120. Anchor Naming

예:

```text
CH01_PLAYER_START
CH01_RICHARD_ENTRY
CH01_RICHARD_PRESENT
CH01_DESK_REVIEW
CH05_GEORGE_WORK
CH08_HANS_REPORT
CH09_PLAYER_BOARD
```

---

# 121. Duplicate Anchor 금지

한 anchor id가 여러 위치에 존재하면 개발 error.

---

# 122. Anchor Occupancy

NPC가 점유하는 anchor는 runtime occupancy 관리.

player interaction zone은 일반적으로 occupancy lock과 별개.

---

# 123. Fallback Anchor

story-critical NPC route에는 필요 시 fallback anchor.

단 fallback도 사전 검증된 실제 위치.

---

# 124. Nearest Safe Point

runtime emergency correction은 arbitrary nearest empty point가 아니라
미리 정의된 safe point 집합에서 선택하는 것을 우선.

---

# 125. Teleport 금지

player가 보고 있는 곳에서 NPC/object를 큰 거리 snap하지 않는다.

필요한 canonical reset은 occlusion/fade 뒤.

---

# 126. Camera Occlusion Test

각 camera pose에서 screen-space로:

• NPC head overlap
• board text occlusion
• object visibility
• foreground prop

검사.

---

# 127. Sightline Test

중요 evidence는 player zone에서 실제 LOS가 존재.

wall/monitor/다른 NPC가 가리지 않음.

---

# 128. Discoverability Sightline

핵심 interaction이 처음부터 완전 노출일 필요는 없지만:

• 접근 시 보임
• sound/light cue
• NPC gaze

중 하나로 찾을 수 있어야 함.

---

# 129. Hidden Clue 금지

작은 물체를 table 아래/캐비닛 뒤 2cm 틈에 숨겨 difficulty 만들지 않는다.

---

# 130. Mobile FOV

모바일 landscape는 화면 세로가 좁다.

따라서 좁은 corridor/낮은 천장이 desktop보다 더 답답할 수 있음.

실제 mobile viewport에서 확인.

---

# 131. Mobile Interaction Distance

모바일이라고 object와의 물리 거리 자체를 크게 바꾸지 않는다.

proxy/reticle 도움으로 해결.

---

# 132. Low-End Performance와 Layout

room을 한 번에 너무 많이 보여주지 않으면 culling에 유리.

코너/문/partition으로 자연스러운 occlusion 가능.

---

# 133. Long Sightline 제한

시설 한쪽 끝에서 모든 room이 다 보이는 구조를 피한다.

성능과 공간감 모두 개선.

---

# 134. Lighting Zone

room 경계와 lighting zone이 대체로 일치.

문 하나 넘어가며 색온도가 극단적으로 바뀌는 게임식 zone 느낌은 피한다.

---

# 135. Audio Zone

door/corridor가 ambience attenuation 기준점.

공간 구조와 sound source를 맞춘다.

---

# 136. CH1 권장 공간 관계

```text
MAIN CORRIDOR
→ DIRECTOR OFFICE
→ CALCULATION SIDE
```

Richard의 이동이 짧고 납득 가능.

---

# 137. CH2 권장 공간 관계

```text
DIRECTOR / CORRIDOR
→ COMMON REVIEW / CHALKBOARD
```

discussion sound가 접근 전부터 약하게 들림.

---

# 138. CH3 권장 공간 관계

```text
MAIN CORRIDOR
→ INSTRUMENTATION
→ REFERENCE / RECORD SIDE
```

---

# 139. CH4 권장 공간 관계

```text
OFFICE WAITING
→ RECORDING / TIMING
```

John이 먼저 office에서 player를 기다리는 연출 가능.

---

# 140. CH5 권장 공간 관계

```text
CORRIDOR
→ TEST CONTROL
→ OBSERVATION
→ RETEST WORK SIDE
```

---

# 141. CH6 권장 공간 관계

```text
QUIET CORRIDOR
→ COUNTING / SAMPLE
```

야간 lighting과 audio로 guide.

---

# 142. CH7 권장 공간 관계

```text
ALARM CORRIDOR
→ CONTROL
→ INCIDENT EVIDENCE
```

---

# 143. CH8 권장 공간 관계

```text
MAIN CORRIDOR
→ FINAL REVIEW
↔ APPROVED ARCHIVE
```

---

# 144. CH9 권장 공간 관계

CH8 room 그대로 또는 매우 가까운 연결.

```text
FINAL REVIEW
→ BOARD VIEW
```

실질적으로 같은 large review space 권장.

---

# 145. Layout Version 관리

room layout이 수정되면:

• anchor
• camera pose
• route
• object placement
• collision

도 같이 재검증.

---

# 146. Decorative Patch 금지

충돌이 생겼다고 prop만 조금 옮기고 관련 camera/NPC route를 확인하지 않는 방식 금지.

---

# 147. Layout Dependency Map

각 critical zone이 어떤 시스템에 쓰이는지 기록 가능.

예:

```text
CH08_REPORT_TABLE
used by:
DOCUMENT
STAMP
HANS
PLAYER
CAMERA
ARCHIVE
```

---

# 148. Debug Overlay

개발 모드에서 색 없이도 선/label로 표시 가능:

```text
PLAYER PATH
NPC PATH
ANCHOR
DOOR SWEEP
CAMERA VOLUME
INTERACTION ZONE
NO-PROP ZONE
```

---

# 149. Top-Down Debug

각 room을 top-down으로 보는 개발 camera 유용.

실제 게임 camera와 분리.

---

# 150. Height Debug

side elevation view로:

• camera eye
• desk
• board
• handle
• NPC head
• ceiling

비례 확인.

---

# 151. Collision-Free 배치 검증

layout 저장/scene 시작 시 static overlap 검사 가능.

예:

• furniture vs wall
• door vs desk
• NPC anchor vs furniture
• player spawn vs collider

---

# 152. Dynamic Sweep 검증

story sequence 전:

• door
• stamp
• lid
• handset
• NPC route

sweep clear 확인.

---

# 153. CH8 Stress Layout Test

8 NPC를 실제 collider footprint로 배치한 상태에서:

• player archive 이동
• stamp
• camera
• Hans report
• celebration movement

모두 실행.

---

# 154. CH9 Stress Layout Test

8 NPC + board + camera + reaction motion.

각 NPC reaction space를 실제로 사용해 검사.

---

# 155. CH10 Common Spatial Stress

향후 home layout에서도:

• phone throw
• door
• parcel carry
• box lid
• photo/medal/postcard

경로를 동시에 예약 후 충돌 여부 확인.

---

# 156. 공간 실패 사례

반드시 잡아야 할 문제:

• 책상과 벽 사이 player가 낌
• 문이 desk/NPC를 침
• NPC가 player spawn에 있음
• NPC route가 wall corner 통과
• handoff reach 불가
• camera close-up이 wall 통과
• stamp path에 cup
• CH8 NPC끼리 어깨 겹침
• CH8 archive route blocked
• CH9 NPC가 board text 가림
• Luis step-back 뒤 wall
• George turn이 NPC 관통
• Kenneth chair 기립 공간 없음
• phone throw가 lamp를 통과
• parcel이 door보다 넓음
• box lid가 wall/램프 충돌

---

# 157. 금지사항

• aesthetic first, gameplay later
• 실제 단위 무시
• player critical path 0.8m 이하
• door threshold standing
• NPC point-placement만 하고 body footprint 무시
• camera를 위해 1m teleport
• furniture를 wall 안에 반쯤 넣음
• static mesh intersection 방치
• door sweep 무시
• handoff 거리 무시
• CH8 8명을 작은 방에 밀어 넣기
• CH9 board 앞에 NPC 배치
• 장식 cable/crate로 route 막기
• 모바일 viewport 미검증
• runtime collision correction으로 bad layout을 해결하려 하기
• exact coordinate만 쓰고 clearance 관계를 문서화하지 않기

---

# 158. 후속 문서와의 연결

`18_COLLISION_AND_CLEARANCE.md`
• 본 문서의 free width, footprint, sweep, camera volume을 실제 collider 수치로 확정

`19_FACILITY_PROGRESS.md`
• 진행 중 props/NPC가 추가되어도 reserved zone을 침범하지 않게 함

`20_LIGHTING.md`
• interaction zone/room geometry를 기준으로 실제 광원 배치

`21_AUDIO.md`
• room/door/corridor 구조를 기준으로 attenuation 구성

`27_MOBILE.md`
• mobile viewport에서 layout readability 검증

`28_PERFORMANCE.md`
• room occlusion/culling과 geometry budget 확정

각 CHAPTER `SPATIAL_LAYOUT.md`
• 이 규칙을 기준으로 최종 room dimensions, anchor coordinates, routes를 명시

================================================================================
ORIGINAL SOURCE: 18_COLLISION_AND_CLEARANCE.md
================================================================================

# 18_COLLISION_AND_CLEARANCE.md

# COLLISION AND CLEARANCE SPECIFICATION

이 문서는 플레이어, NPC, 벽, 문, 가구, 장비, 상호작용 오브젝트, carry object, 카메라, 손, 도장, 상자 뚜껑, 전화 수화기 등 모든 핵심 요소가 실제 공간에서 서로 관통하거나 끼이지 않도록 하는 충돌 및 여유 공간 규칙을 정의한다.

목표:

• 플레이어가 벽/가구를 통과하지 않음
• NPC가 플레이어/NPC/가구를 통과하지 않음
• 문이 사람이나 물체를 치지 않음
• 카메라가 벽을 뚫지 않음
• 문서/도장/전화/상자 animation이 geometry를 관통하지 않음
• carry object가 문과 복도를 실제로 통과 가능
• 상호작용 위치가 너무 가깝거나 멀지 않음
• small object collider 때문에 navigation이 깨지지 않음
• soft-lock이 생기지 않음
• CH8/CH9 다인원 장면이 실제 footprint로 성립함

---

# 1. 기본 철학

충돌은 “벽 통과만 막으면 끝”이 아니다.

실제 게임에서 더 자주 발생하는 문제:

• 문을 열었는데 player가 문 뒤에 갇힘
• NPC가 문틀을 어깨로 통과
• 대화 시작 시 카메라가 NPC 머리 안으로 들어감
• 도장을 찍을 때 손이 컵을 통과
• 전화 수화기가 테이블을 뚫음
• 상자 뚜껑이 벽을 관통
• CH8에서 NPC 팔이 서로 겹침
• CH9에서 반응 animation이 옆 사람 몸을 통과

따라서 충돌은 “body collider + clearance volume + animation sweep”의 세 층으로 본다.

---

# 2. Collision Layer

권장 layer:

```text
WORLD_STATIC
PLAYER
NPC
DOOR
LARGE_OBJECT
INTERACTION_PROXY
ANIMATION_SWEEP
CAMERA_SAFE
```

작은 decorative object는 navigation collision에서 제외 가능.

---

# 3. Player Collider

1인칭 플레이어는 capsule 또는 cylinder 계열 권장.

시작값 예:

```text
radius 0.28~0.34m
height 1.65~1.78m
```

camera eye height와 collider top을 동일하게 두지 않는다.

---

# 4. Player Eye Height

기존 규칙 유지:

```text
1.62~1.68m
```

collider body와 camera rig를 분리.

---

# 5. Player Head Clearance

ceiling/beam과 충돌 시 camera만 위로 통과하지 않게 head clearance 포함.

---

# 6. Player Step Height

시설 바닥은 대부분 평평하므로 복잡한 step solver가 필요하지 않다.

문턱/작은 단차는:

```text
0.05~0.12m
```

이내에서 자연스럽게 처리.

큰 단차는 별도 ramp/step geometry.

---

# 7. Player Skin Width

벽에 정확히 붙었을 때 jitter를 줄이기 위한 작은 skin/epsilon 사용 가능.

예:

```text
0.01~0.03m
```

과도하게 크게 잡아 보이지 않는 벽이 생기지 않게 한다.

---

# 8. Player와 작은 Prop

다음은 player navigation collider로 기본 처리하지 않는다.

• 연필
• 종이
• 컵
• 메달
• 사진
• 작은 도구

이들 때문에 플레이어가 걸리면 안 된다.

---

# 9. Player와 Furniture

다음은 navigation collision 있음.

• desk
• cabinet
• rack
• large crate
• wall
• closed/open door panel
• 큰 장비

---

# 10. Desk Collider

render mesh 전체가 아니라 단순 box 조합.

예:

• tabletop
• side body
• 큰 drawer block

다리 사이 작은 빈 공간을 굳이 player가 들어갈 수 있게 만들 필요 없음.

---

# 11. Wall Collider

벽은 단순한 연속 box 또는 room bounds 기반.

몰딩/배관 등 작은 돌출물은 collider에서 제외.

---

# 12. Door Collider

문 panel collider는 실제 hinge rotation과 동기화.

CLOSED:
통과 불가.

OPENING/CLOSING:
sweep volume 포함.

OPEN:
panel 위치에 collider 유지.

---

# 13. Door Threshold

문틀의 실제 clear opening을 기준으로 player capsule 통과 가능 여부 검사.

render frame이 0.9m여도 collider가 0.75m로 잘못 좁아지지 않게 한다.

---

# 14. Door Sweep

문 panel의 회전 경로 전체를 swept volume으로 본다.

시작 전 검사:

• player
• NPC
• parcel
• movable story object

---

# 15. Door Sweep 반응

sweep가 막히면:

A. animation 시작 지연
B. small safe normalization
C. open angle 제한

순으로.

문이 collider를 강제로 밀어내며 계속 회전하는 방식은 기본 금지.

---

# 16. Door 뒤 Trap

player가 열린 문과 벽 사이에 들어가 갇힐 수 있는 dead pocket 금지.

layout 자체에서 제거하거나 player collider가 그 pocket으로 진입하지 못하게 한다.

---

# 17. NPC Collider

NPC body는 capsule 권장.

시작값:

```text
radius 0.26~0.33m
height 1.62~1.85m
```

인물 체형/키에 따라.

---

# 18. NPC Collider와 Gesture

body collider는 팔 gesture 전체를 포함하지 않는다.

대신 큰 gesture는 별도 clearance 검증.

---

# 19. NPC Personal Clearance

standing NPC끼리:

```text
body collider edge + 0.1~0.2m
```

정도 최소 여유 권장.

---

# 20. NPC Conversation Clearance

player와 NPC 사이 center distance는 기존 규칙:

```text
약 1.45~1.8m
```

카메라/gesture에 따라 확장.

---

# 21. NPC와 Player 충돌

서로 통과 금지.

강한 physics push도 금지.

처리:

• movement stop
• side-step
• yield
• route retry

---

# 22. NPC vs NPC

동일.

한 frame에서 서로 밀어내는 iterative physics보다 route/priority 기반 해결을 우선.

---

# 23. NPC Shoulder Clearance

route center가 wall에서 최소:

```text
body radius + 약 0.15~0.25m
```

이상 떨어지게 설계.

held binder 등 있으면 더 넓게.

---

# 24. NPC Turn Clearance

turn-in-place 시 body/arm이 wall/desk를 관통하지 않게 anchor 주변:

```text
약 0.45~0.6m radius
```

이상 free zone을 시작 기준으로 검토.

---

# 25. NPC Seat Clearance

착석:

• pelvis/seat alignment
• knee/table
• back/chair
• stand-up front zone

검사.

---

# 26. Chair Front Clearance

NPC가 일어설 때:

```text
약 0.55~0.75m
```

free area 권장.

---

# 27. Interaction Distance

공통 시작값:

```text
NPC           1.4~2.2m
DESK DOC      0.7~1.5m
SMALL OBJECT  0.5~1.3m
WALL CONTROL  0.6~1.4m
DOOR          0.7~1.5m
PHONE         0.6~1.4m
PARCEL        0.6~1.3m
MACHINE       0.8~1.8m
```

정확 값은 object 규모/scene별 조정.

---

# 28. Min Distance

너무 가까우면 camera/object clipping이 생기는 대상은 최소 거리도 둔다.

예:

NPC,
큰 장비,
board.

---

# 29. Raycast와 Physical Collider 분리

interaction ray는 interaction proxy를 사용.

physical collider와 동일할 필요 없음.

---

# 30. Interaction Proxy Overlap

인접 target proxy가 겹치면:

• proxy 축소/형태 수정
• 우선순위
• screen angle

로 해결.

---

# 31. Camera Near Collision

camera는 player capsule 중심에 있다고 가정하지 않는다.

벽 가까이 pitch/yaw했을 때 near plane이 벽 안으로 들어가지 않게 한다.

---

# 32. Camera Safe Radius

camera around-head safety volume 권장 시작:

```text
약 0.12~0.20m
```

실제 near plane/FOV와 함께 조정.

---

# 33. Camera Focus Path

FREE → FOCUS/INSPECT/CINEMATIC tween path도 벽을 통과하면 안 된다.

start/end만 safe라고 충분하지 않음.

---

# 34. Camera Path Sampling

중요 tween은 경로 중간 sample 검사.

특히:

• desk
• phone
• board
• door
• postcard

---

# 35. Camera Pose Fallback

requested pose가 invalid하면:

• nearest safe pose
• reduced offset
• reduced rotation

사용.

벽 반대편 목표 pose로 강제 이동 금지.

---

# 36. Camera와 NPC Head

대화 camera는 NPC head bounding volume 안으로 들어가지 않음.

NPC가 gesture로 앞으로 숙이는 동작까지 고려.

---

# 37. Hand Clearance

player hand animation은 물리 collider로 world를 밀지 않는다.

대신 authored sweep 검사.

---

# 38. Hand Sweep

중요:

• document pickup
• stamp
• phone
• door handle
• parcel
• box
• photo
• medal
• postcard

---

# 39. Hand vs Desk

손목/팔이 table edge 안으로 들어가지 않게 한다.

필요하면 approach path를 약간 위/옆으로.

---

# 40. Hand vs Camera

손 mesh가 camera near plane을 통과해 잘리는 문제 금지.

---

# 41. Stamp Sweep

도장 face 폭보다 약간 큰 cylinder/box.

예:

```text
face width + 0.015~0.025m margin
```

---

# 42. Stamp Surface Epsilon

잉크/decal과 문서 surface 사이:

```text
0.0005~0.002m
```

수준 작은 offset을 시작 기준으로 사용 가능.

z-fighting 없는 최소값 우선.

---

# 43. Stamp Impact Depth

도장 face가 paper surface 아래로 깊게 관통하지 않는다.

아주 작은 visual compression만.

---

# 44. Paper Collision

종이 한 장은 navigation collision 없음.

placement/animation에는 thin bounds 사용.

---

# 45. Document Stack Clearance

문서 stack 사이 작은 vertical offset.

겹친 plane z-fighting 금지.

---

# 46. Paper Pickup Path

앞 edge lift가 다른 prop/문서와 충돌하지 않게 한다.

---

# 47. Binder Collision

held binder는 NPC/player body 가까이 붙임.

doorway 통과 시 body footprint에 약간 추가.

---

# 48. Carry Parcel Expanded Footprint

CARRY 중 player navigation footprint를 확장.

예 시작값:

```text
forward extension 0.25~0.40m
side extension 0.10~0.18m
```

실제 box size 기반으로 계산하는 것이 우선.

---

# 49. Parcel Door Clearance

문 clear width가 parcel width + player hand/side margin을 수용.

단순히 player capsule만 통과한다고 충분하지 않음.

---

# 50. Parcel Corner Turning

상자를 들고 90° 코너를 돌 때 box corner가 wall을 치지 않게 한다.

필요하면 wider turning zone.

---

# 51. Carry Camera

box가 camera near plane에 들어오지 않음.

기존 규칙대로 화면 하단 약 25~35% 수준 시작 기준.

---

# 52. Carry Door Interaction

01/02/04 규칙 유지:

box를 든 채 복잡한 door operation 기본 금지.

흐름:

```text
door open
→ parcel pickup
→ carry through
```

---

# 53. Box Placement Clearance

table slot은 box footprint + 최소:

```text
0.05~0.10m
```

주변 margin 권장.

---

# 54. Lid Sweep

뚜껑 rear hinge 기준 arc.

뒤쪽 벽/램프/소품과 충돌 없음.

---

# 55. Lid Rear Clearance

box depth와 lid angle 기준 실제 swept bounds 계산.

대략:

```text
0.20~0.35m+
```

후방 여유가 필요할 수 있음.

실제 모델로 검증.

---

# 56. Lid Player Clearance

player가 상자에 너무 가까이 서서 뚜껑이 camera/손을 통과하지 않게 한다.

---

# 57. Photo Clearance

box에서 lift할 때 medal/lid/string과 겹치지 않음.

---

# 58. Medal Clearance

작은 proxy가 photo proxy와 겹치지 않게.

실제 메달 mesh는 작아도 interaction target은 분리.

---

# 59. Postcard Clearance

photo/medal 제거 후 실제 pickup path가 확보.

상자 corner/lid를 통과하지 않음.

---

# 60. Phone Base Clearance

전화기 주변에 handset pickup과 lowering 공간.

벽에 너무 붙이지 않는다.

---

# 61. Handset Throw Sweep

authored path 전체를 3D swept capsule/box로 검사.

대상:

• lamp
• wall
• table object
• player camera
• floor edge

---

# 62. Handset Impact

impact point는 table geometry 표면과 일치.

surface 안으로 깊게 관통하지 않음.

---

# 63. Handset Fall

impact 후 floor까지 path clear.

table drawer/leg를 관통하지 않게 한다.

---

# 64. Cord Clearance

전화선은 full collision이 아니어도:

• table top
• table edge
• base
• wall

을 시각적으로 직선 관통하지 않게 control points.

---

# 65. Cord Length

final handset rest 위치까지 실제 curve length가 충분.

줄이 늘어나며 2배 길어지는 문제 금지.

---

# 66. Door + Parcel CH10

현관문 sweep와 parcel placement는 반드시 분리.

parcel은 문 바깥 sweep zone 밖.

---

# 67. NPC Door Crossing

NPC가 door panel과 동시에 threshold를 통과하지 않음.

문이 충분히 열린 뒤 crossing.

---

# 68. NPC Queue at Door

좁은 문은 한 번에 한 NPC 중심.

CH8/CH9에서 여러 명 동시 통과 최소화.

---

# 69. Group Collision CH8

8명 각각 실제 body footprint로 배치.

render mesh만 겹치지 않는 수준이 아니라:

• arm gesture
• report
• player path

까지 고려.

---

# 70. CH8 Hans Clearance

Hans 주변:

• report handoff
• report close
• stamp visibility

공간 확보.

---

# 71. CH8 Archive Path

player capsule 기준으로 NPC body clearance 후에도 최소 1m급 free path 유지.

---

# 72. CH8 Celebration

악수/작은 이동 전 pair clearance 검사.

악수가 collider를 강제로 겹치게 만들지 않는다.

---

# 73. CH9 Board Clearance

player view zone 앞쪽을 NPC body가 침범하지 않게.

---

# 74. CH9 Reaction Clearance

Luis:
step-back.

George:
turn-away.

Kenneth:
seat.

각 reaction에 별도 clearance.

---

# 75. CH9 White Flash

충돌과 직접 관계는 없지만 NPC reaction이 flash frame에 sudden pose snap하지 않도록 animation state 안정.

---

# 76. Static Overlap

scene load 시 검사:

• furniture vs wall
• equipment vs wall
• desk vs door sweep
• chair vs desk
• board vs wall
• NPC anchor vs furniture

---

# 77. Dynamic Overlap

runtime 검사:

• player vs NPC
• NPC vs NPC
• door sweep
• carry object
• story object sweep

---

# 78. Overlap 허용 예외

시각적으로 의도된 접촉:

• document on desk
• medal on table
• stamp on paper
• chair on floor

이런 contact는 collision penetration과 구분.

---

# 79. Ground Contact Epsilon

object가 floor/table 위에서 떠 보이지 않게 작은 contact epsilon 사용.

너무 깊이 넣어 geometry가 묻히지 않음.

---

# 80. AABB vs OBB

단순 static furniture:
AABB 가능.

회전된 door/parcel/긴 object:
OBB 또는 transformed bounds 고려.

---

# 81. Continuous Collision

빠른 stamp/handset throw는 frame 간 이동이 커질 수 있음.

marker/swept test로 tunneling 방지.

---

# 82. Frame Hitch 대응

delta time clamp.

collision-sensitive motion은 한 frame displacement가 너무 크면 substep 또는 path sampling.

---

# 83. Substep

모든 world physics에 substep이 필요한 것은 아님.

빠른 story-critical object에만 제한적으로.

---

# 84. Collision Response 우선순위

story-critical animation에서 충돌 발견 시:

```text
PREVENT
> DELAY
> SMALL CORRECTION
> ALTERNATE PATH
> ROLLBACK
```

teleport는 최후.

---

# 85. Player Soft Correction

허용:

```text
0.1~0.3m
```

수준.

더 큰 correction이 필요하면 interaction 시작 위치 자체를 수정.

---

# 86. NPC Soft Correction

작은 final alignment:

```text
0.05~0.15m
```

정도.

player가 보는 앞에서 큰 snap 금지.

---

# 87. Object Soft Correction

table contact 등 작은 오차:

```text
수 cm 이하
```

가능.

---

# 88. Clearance Metadata

anchor/slot에 clearance 정보 포함 가능.

```js
{
  radius,
  forward,
  rear,
  side,
  height
}
```

---

# 89. No-Occupancy Zone

door sweep/camera path 등은 occupancy 불가 zone.

runtime anchor reservation과 별개로 static rule.

---

# 90. Camera-Only Zone

camera는 들어갈 수 있지만 player body는 들어가지 않는 공간을 기본적으로 만들지 않는다.

INSPECT rig offset처럼 제한적 예외만.

---

# 91. Player Body와 Camera Separation

INSPECT camera가 desk 위로 약간 이동해도 player collider가 desk를 통과하지 않는다.

카메라만 안전하게 offset.

---

# 92. Line of Sight

interaction 후보는 collider clearance와 별개로 LOS 검증.

벽 너머 클릭 금지.

---

# 93. Thin Wall LOS

벽 collider가 thin해도 ray가 통과하지 않게 interaction occluder layer 일치.

---

# 94. Glass

관찰창은 보이지만 player 통과 불가.

interaction ray를 통과시킬지 여부는 대상별.

CH5 위험 zone control을 glass 너머 클릭하게 하지 않는 것을 기본.

---

# 95. Transparent Object

glass material transparency가 collider absence를 의미하지 않는다.

---

# 96. Debug Collider View

개발 모드:

• player capsule
• NPC capsules
• static colliders
• door sweep
• carry bounds
• camera safe volume
• interaction proxies

표시.

---

# 97. Penetration Debug

overlap 발생 시:

```text
object ids
penetration depth
frame
sequence id
```

로그.

---

# 98. Clearance Audit

scene 시작 시 story-critical anchor마다:

• player fits
• NPC fits
• camera safe
• door sweep clear
• route clear

검사 가능.

---

# 99. Slow Motion Test

0.25x에서:

• stamp
• handoff
• door
• phone
• lid
• NPC movement

관통 확인.

---

# 100. Low FPS Test

15~20fps 수준에서:

• tunneling
• marker skip
• door overlap
• handset path
• NPC overshoot

검사.

---

# 101. CH1 QA

• Richard entry door
• desk handoff
• stamp
• exit route

---

# 102. CH2 QA

• 그룹 spacing
• chalkboard
• player approach
• Enrico route

---

# 103. CH3 QA

• 장비 aisle
• Luis/CRT
• reference clock
• cable visual overlap

---

# 104. CH4 QA

• office waiting
• rack clearance
• timing sheet inspect

---

# 105. CH5 QA

• George 빠른 접근
• test barrier
• report zone
• revisit
• 큰 gesture

---

# 106. CH6 QA

• dark room path
• Emilio/sample
• detector/table

---

# 107. CH7 QA

• alarm NPC routes
• player entry
• Kenneth
• evidence table

---

# 108. CH8 QA

• 8 body colliders
• Hans report
• archive path
• stamp
• celebration

---

# 109. CH9 QA

• board view
• NPC reaction motion
• seat
• step-back
• turn-away

---

# 110. CH10 공통 QA

• phone
• cord
• door
• parcel
• box lid
• photo
• medal
• postcard

---

# 111. Soft-Lock 정의

공간적 soft-lock:

• player가 빠져나올 수 없음
• NPC가 critical destination에 영구 도착 못함
• object가 다른 object에 끼어 interaction 불가
• door가 막혀 다음 공간 진입 불가
• carry object 때문에 turn 불가

---

# 112. Soft-Lock 예방

모든 critical sequence에:

• safe start
• safe end
• fallback

정의.

---

# 113. Soft-Lock 복구

가능:

• nearest predefined safe player anchor
• NPC fallback anchor
• object canonical pose
• door forced safe OPEN/CLOSED state

단, 개발 중에는 원인을 수정하는 것이 우선.

---

# 114. Collision 성능

모든 decorative mesh끼리 collision 검사하지 않는다.

충돌 대상 수를 제한.

---

# 115. Broad Phase

room/zone 기준으로 관련 collider만 검사.

---

# 116. Static Collider Merge

벽/큰 가구는 가능하면 단순화.

---

# 117. Dynamic Collider 수

주요 dynamic:

• player
• visible NPC
• door
• carry parcel
• 특정 story object

정도로 제한.

---

# 118. Interaction Proxy와 Physics 분리

proxy가 많아도 physical solver에 넣지 않는다.

---

# 119. Collision Layer Mask

raycast와 physics의 layer mask를 명확히 분리.

---

# 120. 금지사항

• render mesh 전체 triangle collision
• small prop navigation collider 남발
• player/NPC 서로 통과
• door가 player를 밀며 회전
• camera clipping을 near plane만 줄여 해결
• carry box가 벽을 관통
• phone throw random rigidbody
• lid wall 관통
• CH8 NPC collider 무시
• runtime teleport로 bad layout 덮기
• 너무 큰 skin width
• interaction proxy를 physics collider로 사용
• 정확한 contact를 penetration으로 처리
• low FPS에서 collision 미검증
• soft-lock fallback 없음

---

# 121. 후속 문서와의 연결

`19_FACILITY_PROGRESS.md`
• 진행 중 오브젝트/NPC 증가가 collision zone을 침범하지 않게 함

`20_LIGHTING.md`
• collision-safe geometry를 기준으로 광원 배치

`24_TRANSITION.md`
• transition 시 safe state 복구

`25_SAVE_AND_RESUME.md`
• canonical safe pose와 soft-lock recovery 저장

`27_MOBILE.md`
• mobile control에서 collision correction 체감 검증

`28_PERFORMANCE.md`
• collision update budget 최종화

`31_FAILURE_PREVENTION.md`
• 모든 collision/soft-lock 실패 대응 통합

각 CHAPTER `SPATIAL_LAYOUT.md`, `FAILURE_CASES.md`, `QA.md`
• 실제 scene collider/clearance 테스트

================================================================================
ORIGINAL SOURCE: 19_FACILITY_PROGRESS.md
================================================================================

# 19_FACILITY_PROGRESS.md

# FACILITY PROGRESS SPECIFICATION

이 문서는 CH1~CH8 동안 연구시설이 어떻게 점진적으로 활성화되고, 사람·장비·문서·조명·소리·공간의 밀도가 변화하며, 플레이어의 승인과 프로젝트 진척이 실제 환경 변화로 연결되는지를 정의한다.

진행률:

```text
CH1  08%
CH2  19%
CH3  31%
CH4  44%
CH5  57%
CH6  69%
CH7  82%
CH8 100%
```

이 수치는 단순 HUD 수치가 아니라 시설 상태 변화와 연결된다.

---

# 1. 기본 철학

플레이어는 매 챕터를 끝낼 때:

```text
내 판단이 프로젝트를 실제로 앞으로 밀었다.
```

고 느껴야 한다.

하지만 CH9 이전까지:

```text
무엇을 완성하고 있는가
```

는 직접 알 수 없어야 한다.

---

# 2. Progress의 표현 층

진행은 다음 층에서 동시에 표현 가능.

```text
PROGRESS BOARD
LIGHTING
EQUIPMENT
NPC DENSITY
WORK ACTIVITY
DOCUMENT DENSITY
AMBIENCE
ACCESSIBLE SPACE
```

한 요소에만 의존하지 않는다.

---

# 3. 진행률 Board

환경 오브젝트:

```text
PROJECT ███████
PROGRESS 00%
```

챕터 진행 후 수치 변경.

---

# 4. Board는 HUD가 아니다

화면 corner에 상시 progress bar를 띄우지 않는다.

실제 시설 안 board/display로 표현.

필요한 장면에서만 보임.

---

# 5. Progress Update Timing

APPROVED 이전에는 해당 챕터 진척이 증가하지 않는다.

기본:

```text
APPROVED
→ NPC reaction
→ facility response
→ progress update
```

---

# 6. REJECTED와 Progress

REJECTED 자체는 진척률 증가가 아니다.

반려 후 수정이 완료되고 APPROVED되어야 진행.

---

# 7. 숫자 점프

기본 진행률은 고정:

```text
0
→ 8
→ 19
→ 31
→ 44
→ 57
→ 69
→ 82
→ 100
```

중간 값은 애니메이션 표현에서 잠시 지나갈 수 있음.

---

# 8. CH8 82→100

최종 승인에서는:

```text
82
→ 91
→ 97
→ 100
```

단계적 활성화 가능.

이는 최종 승인 후 여러 subsystem이 살아나는 표현.

---

# 9. CH1 초기 상태

시설 인상:

• 조용함
• 사람 적음
• 일부 장비만 사용
• 문서량 적음
• 먼 공간은 어둡거나 비활성
• 프로젝트 board 00%

---

# 10. CH1 시작 공간

Director Office가 가장 정돈된 기준점.

Calculation Area 일부만 활발.

---

# 11. CH1 APPROVED 후

Progress:

```text
08%
```

변화 예:

• Calculation Area 추가 lamp
• mechanical calculator activity 증가
• 1~2명 연구자 작업 시작
• 카드/서류 stack 증가
• corridor 한 구역 light 활성

---

# 12. CH1 변화 강도

작게.

첫 승인만으로 시설 전체가 갑자기 깨어나지 않는다.

---

# 13. CH2 시작

CH1 변화 유지.

추가:

• Common Review / Chalkboard area 활성
• 연구자 논쟁
• graph/document 증가

---

# 14. CH2 APPROVED 후

Progress:

```text
19%
```

변화:

• Chalkboard area 정리/새 기록
• side lab light
• 사람 이동 증가
• 일부 장비 hum 추가

---

# 15. CH3 시작

Instrumentation Area가 새 중심.

이전 구역은 배경에서 여전히 살아 있음.

---

# 16. CH3 APPROVED 후

Progress:

```text
31%
```

변화:

• CRT/계측 rack 안정 작동
• indicator 증가
• corridor cable/work props 증가
• 기술 인력 밀도 약간 증가

---

# 17. CH4 시작

Recording / Timing Area 활성.

시설이 이제 여러 부서가 동시에 움직이는 느낌.

---

# 18. CH4 APPROVED 후

Progress:

```text
44%
```

변화:

• recording rack
• paper recorder
• synchronised activity
• corridor traffic 증가

---

# 19. CH5 시작

Material Test Area.

공간 규모가 커짐.

시설 진행이 실제 실험 단계로 들어간 느낌.

---

# 20. CH5 APPROVED 후

Progress:

```text
57%
```

변화:

• test equipment 정상화
• work lights 추가
• 재시험 기록 증가
• 직원 피로/작업 밀도 증가
• facility hum 조금 더 풍부

---

# 21. CH5의 감정

진행률이 늘어도 축하 분위기가 아님.

정확성을 위해 늦춘 뒤 다시 앞으로 나간 결과.

---

# 22. CH6 시작

야간.

진행률 57% 시설이 처음으로 “시간이 쌓인 프로젝트”처럼 느껴짐.

---

# 23. CH6 Night State

사람 수는 낮을 수 있음.

하지만 equipment/background activity는 누적된 상태.

---

# 24. CH6 APPROVED 후

Progress:

```text
69%
```

변화:

• sample/counting area 안정
• 일부 야간 lamp
• 기록 파일 증가
• 다음 구역 readiness

---

# 25. CH7 시작

사고/경보.

시설이 가장 복잡하게 운영되는 시점 중 하나.

---

# 26. CH7 Alarm은 Progress 감소 아님

사고가 발생했다고 progress 숫자를 내려가지 않는다.

문제는 기록의 정확성.

---

# 27. CH7 APPROVED 후

Progress:

```text
82%
```

변화:

• alarm 종료
• control system 안정
• incident record 정리
• 일부 장비 재가동
• facility가 다시 work rhythm으로 돌아감

---

# 28. CH8 시작

82%.

시설은 거의 완성 단계.

표현:

• 많은 연구자
• 많은 문서
• 여러 장비 동시 활동
• final review 공간
• 8명의 주요 인물

---

# 29. CH8 Progress의 의미

플레이어는 지금까지의 승인들이 한 최종 보고서로 합쳐졌음을 느낌.

하지만 weapon 결과는 아직 모름.

---

# 30. CH8 REJECTED 후

Progress는 82% 유지.

오히려:

• 활동 잠시 멈춤
• 일부 장비 그대로
• 사람들이 수정 작업으로 분산

진행률을 줄이지 않는다.

---

# 31. CH8 Revision Montage

시설 각 구역이 다시 사용됨.

이 장면은 CH1~7 공간을 회수하는 기능도 함.

---

# 32. CH8 APPROVED

최종 progress sequence 시작.

---

# 33. 82→91

첫 단계.

가능:

• calculation/instrument lights
• archive/report system
• side relays

---

# 34. 91→97

두 번째.

가능:

• recording/test control activity
• additional work banks
• central status lights

---

# 35. 97→100

최종.

가능:

• board
• final room light
• remaining indicator
• facility-wide hum 완성

---

# 36. 100% 화면

```text
PROJECT ███████
PROGRESS 100%
```

명확히 보임.

---

# 37. 100%의 감정

진짜 성취.

금지:

• glitch
• 불길한 red light
• ominous music
• sudden silence
• NPC 표정 급변

---

# 38. CH8 Success NPC

• 미소
• 악수
• 안도
• 피로가 풀림
• 자부심

실제 성공처럼.

---

# 39. CH9 시작

CH8 100% 상태를 유지.

시설은 완성된 프로젝트의 결과 보고를 기다림.

---

# 40. CH9 Board

새로운 progress 증가 없음.

대신:

```text
FINAL REPORT RECEIVED
VIEW RESULTS
```

같은 결과 단계.

---

# 41. CH9의 반전

시설이 실패한 것이 아니다.

시설과 연구는 성공했다.

문제는 그 성공의 의미.

따라서 CH9 이전의 progress 연출을 거짓/불길하게 만들면 안 된다.

---

# 42. 시설 활성화 방식

진행률 증가 때 사용할 수 있는 요소:

• lamp on
• CRT on
• relay
• machine hum
• worker enters
• papers arrive
• room opens
• status indicator

---

# 43. Room Unlock

일부 새 구역 접근 가능.

하지만 게임식:

```text
NEW AREA UNLOCKED
```

UI 금지.

실제로:

• 문이 열림
• corridor light
• NPC가 이동
• 작업음

으로 표현.

---

# 44. 물리적으로 새 방 생성 금지

진행률이 오를 때 벽이 움직여 새 lab이 생기지 않는다.

기존 facility의 접근/활성 상태가 바뀜.

---

# 45. NPC Density

진행에 따라 전체 사람 수가 늘어날 수 있음.

예:

```text
CH1  낮음
CH3  낮음~중간
CH5  중간
CH7  중간~높음
CH8  높음
```

---

# 46. NPC Density 제한

작은 room 안에 단순히 NPC를 추가해 progress를 표현하지 않는다.

공간별 cap 필요.

---

# 47. NPC Activity Density

사람 수뿐 아니라 행동 빈도도 변화.

CH1:
idle/work 조용.

CH8:
여러 구역 동시 work.

---

# 48. Random Roaming 금지

activity 증가를 random wandering으로 표현하지 않는다.

작업 목적 있는 route만.

---

# 49. Document Density

진행에 따라:

• approved files
• reports
• logs
• binder
• archive

증가.

---

# 50. Document Density와 Gameplay

늘어난 서류가:

• stamp slot
• compare slot
• player path
• handoff

를 막지 않는다.

---

# 51. Equipment State

각 장비는:

```text
OFF
STANDBY
ACTIVE
```

정도의 progress state를 가질 수 있다.

---

# 52. Equipment Activation

챕터 승인 후 story-defined equipment group만 활성.

모든 장비를 동시에 켜지 않는다.

---

# 53. Equipment Group

예:

```text
CALC_GROUP
INSTRUMENT_GROUP
RECORD_GROUP
TEST_GROUP
COUNT_GROUP
CONTROL_GROUP
FINAL_GROUP
```

---

# 54. Activation Dependency

각 group은 해당 chapter 승인 milestone 기반.

---

# 55. Ambient Light Progress

진행률에 따라 시설 전체가 단순히 더 밝아지는 것은 피한다.

공간별 사용 lamp가 늘어나는 방식.

---

# 56. Lighting Continuity

활성화된 구역은 이후 chapter에서도 canonical state로 유지 가능.

---

# 57. Audio Progress

초기:

• room tone
• distant paper
• sparse machine

후기:

• relay
• fan
• instrument hum
• more footsteps
• paper activity

---

# 58. Audio Soup 금지

진행이 늘어도 모든 sound를 동시에 키우지 않는다.

room별 dominant layer 유지.

---

# 59. Mechanical Hum

시설 progress의 심리적 backbone으로 사용할 수 있음.

CH1 작음.
CH8 풍부함.
CH9 power-down에서 하나씩 사라짐.

---

# 60. CH9 Power-down의 의미

CH1~8에서 쌓아온 모든 activity layer를 역으로 해체.

그래서 power-down이 강하게 느껴짐.

---

# 61. Progress Board 위치

가능하면 여러 chapter에서 같은 architectural landmark.

플레이어가 반복적으로 인식.

---

# 62. Board Update Animation

현대 digital UI처럼 부드러운 progress bar보다 시대에 맞는 방식.

가능:

• mechanical digit
• indicator lamps
• simple electromechanical display
• printed card replacement

visual style에서 최종 확정.

---

# 63. Board Percentage

수치는 정확히 읽혀야 함.

progress가 puzzle clue는 아니지만 player가 누적 성취를 인식.

---

# 64. Progress Sound

숫자가 바뀔 때 큰 UI ding 금지.

기계 click/relay 정도.

---

# 65. Facility Progress와 Chapter Transition

APPROVED:

```text
stamp
→ reaction
→ facility change
→ progress
→ next chapter
```

진행 변화를 player가 보기 전에 바로 page transition하지 않는다.

---

# 66. Progress Hold

적어도 주요 변화 1~2개를 인식할 시간.

정확한 길이는 timing 문서.

---

# 67. CH1 변화

작고 명확.

---

# 68. CH2 변화

discussion zone 외 다른 side room activation.

---

# 69. CH3 변화

technical instrumentation 증가.

---

# 70. CH4 변화

기록/동기화망 연결감.

---

# 71. CH5 변화

대형 test capability 안정.

---

# 72. CH6 변화

야간에도 프로젝트가 계속 움직이는 느낌.

---

# 73. CH7 변화

사고를 기록하고 시스템을 다시 안정화.

---

# 74. CH8 변화

여러 subsystem이 하나의 project system으로 합쳐짐.

---

# 75. 공간의 사용감

진행에 따라 조금씩:

• paper stack
• chalk marks
• cup
• used pencils
• cable
• moved chairs

변화 가능.

---

# 76. 사용감 누적 제한

모든 chapter마다 clutter를 추가만 하면 CH8에 공간이 난잡해짐.

일부는 정리/교체.

---

# 77. Cleanup State

작업 끝난 구역:

• 일부 문서 archive
• cup 위치 변경
• 쓰레기 제거

실제 시설이 운영되는 느낌.

---

# 78. Wear

진행에 따라 장비가 갑자기 녹슬거나 낡지 않는다.

시간 범위가 짧기 때문.

변화는 사용 흔적 수준.

---

# 79. 사람 피로

후반 NPC posture/idle에서 피로가 조금 증가 가능.

하지만 progress visual을 감정 우울로 만들지 않는다.

---

# 80. CH8 피로 + 성취

오랜 작업의 피로와 완성의 만족이 동시에.

---

# 81. 공간 상태 데이터

권장:

```js
facilityProgress = {
  percent: 44,
  activeGroups: [...],
  openZones: [...],
  ambienceLevel: ...,
  staffingProfile: ...
}
```

---

# 82. Progress는 파생 가능

가능하면 percent 하나를 source of truth로 하고,
활성 group을 chapter milestone에서 파생.

하지만 복잡한 custom state는 explicit flag 허용.

---

# 83. 저장

저장할 핵심:

```text
chapter
approvedMilestones
progressPercent
```

장식 prop exact transform 저장 불필요.

---

# 84. Reload

load 시 progress에 맞는 canonical facility state 재구성.

NPC exact idle phase나 종이 위치까지 저장하지 않는다.

---

# 85. Canonical Facility State

예:

```text
CH5_COMPLETE
```

로드:

• progress 57
• calc/instrument/record/test groups active
• expected props/NPC density
• lighting
• ambience

재구성.

---

# 86. Progress와 Spoiler

활성 장비가 늘어도 weapon meaning을 시각적으로 드러내지 않음.

---

# 87. Equipment Silhouette

후반에도:

• generic rack
• cables
• control
• sample
• measurement

중심.

폭탄 형태/assembly line처럼 보이는 silhouette 금지.

---

# 88. Signage Progress

새 room이 열려도 일반 부서명.

---

# 89. Document Progress

후반 문서가 많아져도 banned terminology 없음.

CH8 final report까지 검열 유지.

---

# 90. CH8 100% Spoiler Audit

가장 위험한 시점.

모든 것이 완성되었지만 weapon meaning은 여전히 숨겨야 함.

검사:

• board
• wall diagram
• final report
• equipment label
• archive
• NPC dialogue
• room signage

---

# 91. CH9 Reveal 전 마지막 프레임

CH8 마지막 celebratory frame에도 직접 무기 정보 없음.

---

# 92. CH9 Reveal 후

board에서 직접:

• dates
• Little Boy
• Fat Man
• mission success

공개 가능.

시설 architecture 자체는 갑자기 바뀌지 않는다.

---

# 93. CH9 이후 시설 변화

진실을 알았다고 조명이 즉시 horror red로 바뀌지 않는다.

결과 영상과 사람들의 반응이 중심.

마지막 power-down만 큰 환경 변화.

---

# 94. Performance와 Progress

진행 후 object/NPC가 늘어나도 CH8이 worst-case target.

처음부터 CH8 budget 기준으로 설계.

---

# 95. Object Density Budget

작은 prop 수를 무제한 증가시키지 않는다.

필요하면 merged static clutter mesh.

---

# 96. NPC Budget

일반 background NPC는 LOD/animation frequency 조정.

주요 8명은 품질 유지.

---

# 97. Light Budget

progress마다 real dynamic light를 하나씩 추가하면 안 된다.

일부는 emissive/material 변화로 표현.

---

# 98. Audio Budget

simultaneous loop 수 제한.

room별 믹스.

---

# 99. Progress QA

각 milestone에서 확인:

• 이전 활성 상태 유지
• 새 변화 명확
• critical path 유지
• object intersection 없음
• NPC spawn valid
• lighting performance
• audio 과밀 없음
• spoiler 없음

---

# 100. CH1 QA

08%가 과도한 변화 아님.

---

# 101. CH2 QA

19%가 CH1보다 분명히 활성.

---

# 102. CH3 QA

31%에서 instrumentation이 살아 있음.

---

# 103. CH4 QA

44%에서 facility network 느낌.

---

# 104. CH5 QA

57%에서 test capability와 피로.

---

# 105. CH6 QA

69%인데 야간이라 조용해도 progress가 후퇴한 것처럼 보이지 않음.

---

# 106. CH7 QA

82%에서 alarm이 progress failure로 오해되지 않음.

---

# 107. CH8 QA

100%에서:

• 진짜 완성감
• 모든 주요 시스템 활성
• 8명 그룹
• 불길한 foreshadow 없음
• spoiler 없음

---

# 108. CH9 QA

100% 상태에서 결과 목격.

power-down이 이전 progress layers를 하나씩 제거.

---

# 109. Progress 비교 캡처

개발 중 CH1/3/5/8 동일 corridor/office screenshot 비교 권장.

시설 진척이 시각적으로 읽히는지 확인.

---

# 110. Progress Audio 비교

CH1/4/8 동일 위치에서 ambience 녹음/측정 비교.

단순 volume 증가가 아닌 layer 변화 확인.

---

# 111. Progress Board 상태 검사

각 chapter 수치 정확성:

```text
08
19
31
44
57
69
82
100
```

오타/중복/잘못된 저장 없음.

---

# 112. Facility Activation Event

event 예:

```text
FACILITY_PROGRESS_UPDATED
FACILITY_GROUP_ACTIVATED
FACILITY_ZONE_OPENED
```

필요한 시스템이 구독.

---

# 113. Progress Event 중복 방지

reload/재실행 시 같은 group을 두 번 활성화하지 않는다.

---

# 114. Equipment Loop 중복 방지

progress event 재호출로 fan/hum loop가 중복 실행되지 않음.

---

# 115. Lighting 중복 방지

같은 light가 두 개 생성되지 않음.

---

# 116. NPC Spawn 중복 방지

progress activation 때문에 동일 일반 NPC가 두 번 spawn되지 않음.

---

# 117. Canonical Prop Set

각 milestone별 prop group을 정해 scene 재구성 안정화.

---

# 118. Progress와 Route

새로운 crate/cart/desk가 추가돼도 기존 PLAYER_PATH/NPC_PATH/no-prop zone 침범 금지.

---

# 119. Progress와 Camera

새 prop/NPC가 기존 cinematic camera cone을 가리지 않음.

---

# 120. Progress와 Interaction

새로운 background object가 interaction priority를 방해하지 않음.

---

# 121. Progress와 Archive

approved document는 진행에 따라 archive에 축적.

CH8에서 접근 가능.

---

# 122. Archive Density

7개 주요 approved record가 명확히 구분.

잡문서로 묻히지 않음.

---

# 123. Progress와 Emotional Arc

환경 변화도 감정 곡선을 보조.

```text
CH1 발견
CH2 신뢰
CH3 검토
CH4 기준
CH5 정확성
CH6 이상치
CH7 기록 책임
CH8 완성
CH9 의미
```

---

# 124. Environment가 설명하지 않기

벽에 narrative text를 추가해 감정을 설명하지 않는다.

공간의 작동 상태로 보여준다.

---

# 125. Progress가 Reward처럼 과장되지 않기

RPG 레벨업처럼:

• fireworks
• fanfare
• confetti
• giant percentage animation

금지.

---

# 126. Progress 숫자보다 세계 변화

player가 percentage를 못 봐도 시설이 살아나는 것을 느껴야 한다.

---

# 127. CH8 100% Hold

player가 최소:

• board
• NPC reaction
• 활성 facility

중 일부를 볼 시간 확보.

바로 CH9로 강제 transition 금지.

---

# 128. CH9 전환

성공 분위기를 충분히 남긴 뒤 다음 chapter.

---

# 129. 시설 소리의 기억

CH9 power-down 시 player가 이전 chapter에서 익숙해진:

• fan
• relay
• CRT
• mechanical hum

이 하나씩 사라지면 효과적.

---

# 130. Progress와 Silence

CH1~8는 활동 증가.
CH9 마지막은 activity 제거.

구조적 대비.

---

# 131. 금지사항

• progress를 HUD bar로만 표현
• REJECTED 때 percentage 상승
• CH8 APPROVED 전에 100%
• 매 chapter 모든 light 동시에 켜기
• NPC random wandering으로 활동감 표현
• clutter를 계속 추가만 하기
• CH6 야간을 progress 감소처럼 보이게 만들기
• CH7 사고로 progress 수치 감소
• CH8 성공에 ominous foreshadow
• CH8 100%에서 weapon spoiler
• progress 때문에 critical path 막기
• dynamic light 무한 증가
• loop 중복
• NPC spawn 중복
• 100% 직후 바로 결과 영상
• CH9 reveal과 동시에 시설을 horror set으로 변경

---

# 132. 후속 문서와의 연결

`20_LIGHTING.md`
• milestone별 lighting state 상세화

`21_AUDIO.md`
• progress별 ambience layer와 CH9 power-down 구성

`22_VISUAL_STYLE.md`
• 시설의 누적 사용감/장비 상태 시각화

`25_SAVE_AND_RESUME.md`
• progress milestone 저장/복원

`28_PERFORMANCE.md`
• CH8 100% worst-case budget

`29_SPOILER_RULES.md`
• progress signage/equipment/document 스포일러 감사

`31_FAILURE_PREVENTION.md`
• 중복 activation, blocked path, invalid load 방지

각 CHAPTER `LIGHTING.md`, `AUDIO.md`, `STATE.md`
• 해당 progress 단계의 실제 환경 변화를 구체화
