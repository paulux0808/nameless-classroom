<!-- MERGED SOURCE START: 00_INDEX.md -->

# 00_INDEX.md

# PROJECT SOURCE INDEX

이 문서는 프로젝트 전체 소스의 목차다.

각 문서는 자신의 범위만 담당한다.  
공통 규칙과 챕터별 규칙이 충돌할 경우, 해당 챕터의 명시적 예외가 우선한다.

---

# 1. COMMON

전체 챕터에 공통으로 적용되는 설계 문서.

```text
COMMON/

01_PLAYER.md
02_CONTROL.md
03_CAMERA.md
04_INTERACTION.md

05_DIALOGUE.md

06_NPC_CORE.md
07_NPC_MOVEMENT.md
08_NPC_GESTURE.md
09_NPC_BLOCKING.md

10_ANIMATION_CORE.md
11_OBJECT_ANIMATION.md
12_CINEMATIC_SEQUENCE.md

13_DOCUMENT.md
14_STAMP.md
15_OBJECTS.md

16_FACILITY_ARCHITECTURE.md
17_SPATIAL_LAYOUT.md
18_COLLISION_AND_CLEARANCE.md
19_FACILITY_PROGRESS.md

20_LIGHTING.md
21_AUDIO.md
22_VISUAL_STYLE.md
23_UI.md

24_TRANSITION.md
25_SAVE_AND_RESUME.md
26_TIMING_AND_PACING.md
27_MOBILE.md
28_PERFORMANCE.md

29_SPOILER_RULES.md
30_HISTORICAL_PRESENTATION.md

31_FAILURE_PREVENTION.md
32_COMMON_QA.md
```

---

# 2. COMMON 문서 역할

## 01_PLAYER.md

플레이어의 존재와 행동 규칙.

• 1인칭 표현  
• 플레이어가 말하는 방식  
• 손 표현  
• 오브젝트 조사  
• 물건 들기  
• 도장 사용  
• 이동 중 상태  
• cinematic 상태  
• 플레이어의 신원 비공개 규칙

---

## 02_CONTROL.md

PC와 모바일 조작 체계.

• 이동  
• 시점  
• 상호작용  
• 대화 진행  
• 조사  
• 취소  
• 입력 잠금  
• 연타 방지  
• 입력 복원

---

## 03_CAMERA.md

카메라 동작 전체.

• 자유 시점  
• 대화 soft-lock  
• 오브젝트 조사  
• 문서 비교  
• 도장  
• NPC 연출  
• cinematic  
• 전광판  
• 전화  
• 현관  
• 상자  
• 엽서  
• 카메라 clipping 방지  
• tween 기준

---

## 04_INTERACTION.md

플레이어와 세계의 상호작용 규칙.

• Raycast  
• 상호작용 거리  
• 선택 우선순위  
• hover/focus  
• 집기  
• 놓기  
• 뒤집기  
• 열기  
• 누르기  
• 레버  
• 문  
• 중복 상호작용 방지  
• 상태에 따른 활성/비활성

---

## 05_DIALOGUE.md

대화 시스템.

• 한 입력당 한 문장  
• speaker 표시  
• 자막 위치  
• pause  
• NPC gesture 연동  
• camera cue  
• object cue  
• 대화 중 이동 제한  
• 자동 대사와 수동 대사의 구분

---

## 06_NPC_CORE.md

NPC 공통 구조.

• NPC 데이터  
• 이름  
• 현재 위치  
• 현재 행동  
• 감정  
• 들고 있는 오브젝트  
• 바라보는 대상  
• 챕터 상태  
• interaction 가능 여부

---

## 07_NPC_MOVEMENT.md

NPC의 실제 이동.

• 걷기  
• 접근  
• 퇴장  
• 재등장  
• 앉기  
• 일어서기  
• 작업 위치 이동  
• 그룹 이동  
• 목적지 도착 처리  
• 경로 보정

---

## 08_NPC_GESTURE.md

NPC의 몸짓과 자세.

• 고개  
• 상체  
• 팔  
• 손  
• 시선  
• 종이 전달  
• 종이 회수  
• 불만  
• 생각  
• 안도  
• 놀람  
• 미소  
• 침묵

---

## 09_NPC_BLOCKING.md

NPC와 플레이어의 공간 배치.

• 대화 거리  
• NPC 정지 위치  
• 서로 몸이 겹치지 않는 배치  
• 책상 주변 위치  
• 출입문 주변 여유  
• CH8/CH9 다인원 배치  
• 플레이어 동선 확보  
• 카메라에서 인물이 가려지는 문제 방지

---

## 10_ANIMATION_CORE.md

모든 애니메이션의 기술적 공통 규칙.

• tween  
• easing  
• sequence  
• wait  
• async 흐름  
• 시작/종료 상태  
• animation lock  
• interruption 방지  
• callback  
• 실패 시 복구

---

## 11_OBJECT_ANIMATION.md

물체 움직임.

• 종이  
• 카드  
• 도장  
• CRT control  
• 레버  
• 문  
• 전화기  
• 수화기  
• 전화선  
• 상자  
• 끈  
• 뚜껑  
• 사진  
• 메달  
• 엽서

---

## 12_CINEMATIC_SEQUENCE.md

플레이가 cinematic으로 전환될 때의 공통 규칙.

• player lock  
• camera takeover  
• UI 제거  
• sequence 진행  
• audio cue  
• skip 정책  
• 완료 후 제어권 복원  
• 페이지 전환 전 처리

---

## 13_DOCUMENT.md

게임 내 연구자료의 공통 디자인과 조작.

• 종이  
• 타자기 글자  
• 날짜  
• 번호  
• 수정 흔적  
• 연필 표시  
• 도장  
• 검열선  
• 앞뒤 면  
• 비교  
• archive

---

## 14_STAMP.md

REJECTED / APPROVED 시스템.

• 도장 오브젝트  
• 손에 들기  
• 위치 맞추기  
• 타격  
• 종이 반응  
• 잉크 표시  
• 효과음  
• 챕터별 감정적 변주  
• 엔딩 도장음 회수

---

## 15_OBJECTS.md

공통 오브젝트 라이브러리.

각 오브젝트마다:

• 목적  
• 실제 크기  
• collision 여부  
• interaction 여부  
• 배치 여유  
• animation 가능 여부  
• 상태 변화

를 정의한다.

---

## 16_FACILITY_ARCHITECTURE.md

연구시설 전체 공간 구조.

• Director 공간  
• 중앙홀  
• 계산구역  
• 이론구역  
• 계측구역  
• 고속기록구역  
• 재료시험구역  
• 시료측정구역  
• 시험통제실  
• 최종검토실  
• 중앙 전광판

---

## 17_SPATIAL_LAYOUT.md

실제 배치 원칙.

• 사람 기준 스케일  
• 방 크기  
• 복도 폭  
• 가구 크기  
• 가구 사이 여유  
• 문 크기  
• 천장 높이  
• 카메라 확보 공간  
• 플레이어 회전 공간  
• 인터랙션 접근 공간

---

## 18_COLLISION_AND_CLEARANCE.md

관통과 겹침 방지 전용 문서.

• 벽 collision  
• 바닥 접지  
• 문 회전 반경  
• NPC collision  
• 책상/의자 collision  
• 오브젝트 간 clearance  
• 들고 있는 물체의 통과 공간  
• 카메라 near clipping  
• spawn 검사  
• animation path collision  
• z-fighting 방지

모든 챕터 공간 설계 시 반드시 참조한다.

---

## 19_FACILITY_PROGRESS.md

CH1~8을 거치며 시설이 어떻게 변하는지 정의.

• 프로젝트 진행률  
• 활성화되는 장비  
• 조명  
• NPC 활동  
• 서류량  
• 작업 흔적  
• 시간의 흐름  
• 소음  
• 공간 밀도

---

## 20_LIGHTING.md

조명 시스템.

• 기본 시설  
• 작업등  
• 야간  
• 경보  
• CH8 성공  
• CH9 전광판  
• 백색 섬광  
• power-down  
• 자택  
• 엽서 공개

---

## 21_AUDIO.md

전체 사운드 문법.

• ambient  
• 공간음  
• NPC 발걸음  
• 종이  
• 도장  
• 기계  
• 경보  
• 비행  
• 폭발  
• 라디오  
• 전화  
• 문  
• 상자  
• 정적

---

## 22_VISUAL_STYLE.md

전체 시각 방향.

• 1940년대 연구시설  
• 금속  
• 황동  
• CRT  
• 진공관  
• 종이  
• 목재  
• 먼지  
• 기록필름  
• 자택의 따뜻한 대비

---

## 23_UI.md

UI 규칙.

• HUD  
• Objective  
• Chapter 표시  
• Dialogue  
• Document viewer  
• Interaction hint  
• Progress  
• CH9 이후 HUD 제거

---

## 24_TRANSITION.md

챕터 HTML 사이의 전환.

• 종료 연출  
• 안전한 저장  
• fade-out  
• 다음 페이지 이동  
• preload  
• fade-in  
• 페이지 전환이 보이지 않도록 하는 방식

---

## 25_SAVE_AND_RESUME.md

공통 저장과 복구.

• 현재 챕터  
• 완료 챕터  
• 중요 연구 결과  
• 프로젝트 진행률  
• 안전 checkpoint  
• CH8 archive  
• CH9 완료  
• CH10 진행  
• Final Archive 진행  
• 손상된 저장 복구

---

## 26_TIMING_AND_PACING.md

시간 연출.

• 대화 간격  
• NPC 반응 시간  
• 문서 전달 속도  
• 도장 전후 pause  
• 수정 몽타주  
• CH9 폭발 전 정적  
• SUCCESS 정지  
• 전화 대화  
• 이름 공개  
• Final Archive

---

## 27_MOBILE.md

모바일 전용.

• joystick  
• camera touch  
• interaction target 크기  
• 자막 배치  
• 문서 가독성  
• cinematic UI  
• orientation  
• 성능

---

## 28_PERFORMANCE.md

성능 기준.

• geometry 수  
• shadow  
• light  
• particle  
• Canvas texture  
• NPC 8명  
• scene cleanup  
• event listener cleanup  
• 메모리 누수  
• 모바일 프레임

---

## 29_SPOILER_RULES.md

정보 공개 순서.

• 플레이어 신원  
• 연구자 성  
• 프로젝트 목적  
• 무기 관련 직접 단어  
• CH9 최초 공개  
• CH10 이름 공개  
• Final Archive 실명 공개

---

## 30_HISTORICAL_PRESENTATION.md

역사적 인물을 게임 연출과 구분하여 보여주는 방식.

• dramatization과 실제 프로필의 분리  
• Final Archive 문체  
• 실제 인물 이름  
• 실제 역할 표시  
• 과도한 역사 설명 방지

---

## 31_FAILURE_PREVENTION.md

구현 전에 예상해야 할 실패 사례.

공간뿐 아니라:

• 상태 꼬임  
• 중복 animation  
• 카메라 침투  
• NPC 경로 문제  
• 물체 겹침  
• 오브젝트 순간이동  
• 잘못된 save  
• 대사 중복  
• interaction deadlock  
• 순서 건너뛰기  
• 모바일 조작 충돌  
• 스포일러 문자열 노출  
• 성능 저하

등을 다룬다.

각 챕터의 FAILURE_CASES 문서는 이 문서를 기반으로 더 구체화한다.

---

## 32_COMMON_QA.md

전체 공통 완료 기준.

코딩이 “작동한다”는 것뿐 아니라:

• 자연스러운가  
• 공간적으로 가능한가  
• 잘 보이는가  
• 플레이어가 이해 가능한가  
• 반복적이지 않은가  
• 스포일러가 없는가  
• 상태가 안정적인가  
• 모바일에서도 가능한가

까지 검사한다.

---

# 3. CHAPTERS

```text
CHAPTERS/

CH01_RICHARD/
CH02_ENRICO/
CH03_LUIS/
CH04_JOHN/
CH05_GEORGE/
CH06_EMILIO/
CH07_KENNETH/
CH08_HANS/
CH09_RESULTS/
CH10_HOME/
```

---

# 4. CHAPTER 01~08 기본 문서 구조

각 챕터는 다음 파일을 가진다.

```text
00_OVERVIEW.md
01_SCENARIO.md
02_DIALOGUE.md
03_PUZZLE.md

04_SPATIAL_LAYOUT.md
05_NPC_BLOCKING.md
06_OBJECT_PLACEMENT.md

07_ANIMATION.md
08_CAMERA.md
09_INTERACTION_FLOW.md

10_AUDIO.md
11_LIGHTING.md
12_UI.md

13_STATE.md
14_FAILURE_CASES.md
15_MOBILE.md
16_QA.md
```

---

# 5. 각 CHAPTER 파일의 역할

## 00_OVERVIEW.md

• 챕터의 목적  
• 담당 인물  
• 장소  
• 시작 상황  
• 시작 진행률  
• 종료 진행률  
• 감정 변화  
• 필수 사건  
• 이전/다음 챕터 연결

---

## 01_SCENARIO.md

챕터 처음부터 끝까지의 순수 장면 진행.

대사의 세부 구현이나 기술 설명은 넣지 않는다.

---

## 02_DIALOGUE.md

모든 대사의 정확한 순서.

• speaker  
• 문장  
• 터치 진행  
• pause  
• 표정/gesture cue

---

## 03_PUZZLE.md

퍼즐 전용.

• 문제 상황  
• 제공 자료  
• 핵심 모순  
• 플레이어 행동  
• 정답 논리  
• 오답 논리  
• 피드백  
• 완료 조건

---

## 04_SPATIAL_LAYOUT.md

챕터 전용 공간.

• 방 크기  
• 출입구  
• 가구 배치  
• 플레이어 시작 위치  
• NPC 시작 위치  
• 조사 위치  
• 최소 통행 폭  
• 카메라 확보 공간  
• 문 회전 반경

---

## 05_NPC_BLOCKING.md

장면별 NPC의 정확한 위치와 이동.

누가 어디에 서고 어디를 바라보는지 명시한다.

---

## 06_OBJECT_PLACEMENT.md

모든 중요 오브젝트의:

• 위치  
• 크기  
• 높이  
• 방향  
• collision  
• interaction  
• 주변 clearance

를 정의한다.

---

## 07_ANIMATION.md

챕터 전용 애니메이션 큐.

장면 단위 sequence와 시작/종료 상태를 정의한다.

---

## 08_CAMERA.md

챕터 전용 카메라 큐.

• 위치  
• look target  
• duration  
• FOV 변화  
• player control 상태

---

## 09_INTERACTION_FLOW.md

플레이어가 실제로 무엇을 어떤 순서로 만지는지 정의한다.

가능하지 않은 순서도 함께 정의한다.

---

## 10_AUDIO.md

챕터별 사운드와 정적의 위치.

---

## 11_LIGHTING.md

챕터 내 조명과 시간대 변화.

---

## 12_UI.md

챕터에서 필요한 최소 UI.

---

## 13_STATE.md

챕터 내부 state machine.

예:

```text
INTRO
PRESENTATION
INVESTIGATION
CONFRONTATION
REJECTED
REVISION
RESUBMISSION
APPROVAL
COMPLETE
```

---

## 14_FAILURE_CASES.md

해당 챕터에서 구현 시 생길 수 있는 문제를 사전에 정리한다.

단순 버그뿐 아니라:

• 어색한 동선  
• 정보 누락  
• 잘못된 카메라 각도  
• 퍼즐 soft-lock  
• 오브젝트 관통  
• NPC 겹침  
• 애니메이션 중 입력  
• 저장 복구 문제

까지 포함한다.

---

## 15_MOBILE.md

해당 챕터 특유의 모바일 문제.

---

## 16_QA.md

해당 챕터가 완성됐다고 판단할 최종 검증표.

---

# 6. CHAPTER 09 전용 구조

```text
CH09_RESULTS/

00_OVERVIEW.md
01_SCENARIO.md
02_PRE_RESULT_DIALOGUE.md

03_BOARD_SYSTEM.md

04_FIRST_MISSION.md
05_FIRST_MISSION_ANIMATION.md
06_FIRST_REACTIONS.md

07_SECOND_MISSION.md
08_SECOND_MISSION_ANIMATION.md
09_SECOND_REACTIONS.md

10_SUCCESS_SEQUENCE.md
11_NPC_BLOCKING.md

12_CAMERA.md
13_AUDIO.md
14_LIGHTING.md
15_PARTICLES_AND_SCREEN_FX.md

16_STATE.md
17_FAILURE_CASES.md
18_MOBILE.md
19_QA.md
```

---

# 7. CHAPTER 10 전용 구조

```text
CH10_HOME/

00_OVERVIEW.md

01_HOME_LAYOUT.md
02_HOME_OBJECTS.md
03_HOME_AMBIENCE.md

04_RADIO.md

05_PHONE_DIALOGUE.md
06_PHONE_ANIMATION.md
07_HANDSET_THROW.md

08_KNOCK.md
09_FRONT_DOOR.md

10_PARCEL.md
11_BOX_OPENING.md

12_PHOTO.md
13_MEDAL.md
14_POSTCARD.md

15_OPPENHEIMER_REVEAL.md
16_OPPENHEIMER_PROFILE.md

17_FINAL_ARCHIVE.md

18_ARCHIVE_RICHARD.md
19_ARCHIVE_ENRICO.md
20_ARCHIVE_LUIS.md
21_ARCHIVE_JOHN.md
22_ARCHIVE_GEORGE.md
23_ARCHIVE_EMILIO.md
24_ARCHIVE_KENNETH.md
25_ARCHIVE_HANS.md

26_LAST_MEMORY.md
27_ENDING_CODE.md

28_CAMERA.md
29_AUDIO.md
30_LIGHTING.md
31_STATE.md
32_FAILURE_CASES.md
33_MOBILE.md
34_QA.md
```

---

# 8. 제작 시 참조 원칙

챕터 하나를 제작할 때는 최소 다음을 함께 참조한다.

```text
COMMON/*
+
해당 CHAPTER/*
```

단, 관련 없는 다른 챕터의 세부 구현을 무조건 참조하지 않는다.

---

# 9. 문서 작성 원칙

모든 문서는 추상적인 희망사항보다 실제 구현 가능한 조건을 우선한다.

예:

나쁜 표현:

`NPC가 자연스럽게 움직인다.`

좋은 표현:

`NPC는 플레이어 1.4~1.8m 앞에서 정지한다. 정지 전 마지막 0.25초 동안 이동속도를 감속하고, 정지 후 몸통을 먼저 회전시킨 뒤 0.15초 후 머리가 플레이어를 바라본다.`

나쁜 표현:

`상자를 자연스럽게 연다.`

좋은 표현:

`뚜껑의 hinge pivot은 후면 가장자리 중앙에 둔다. 열린 상태는 약 105°. 뚜껑 뒤쪽에는 최소 18cm 상당의 clearance를 확보하여 벽이나 다른 오브젝트를 관통하지 않게 한다.`

설계 단계에서 발견 가능한 문제를 구현 이후 QA로 미루지 않는다.

---

# 10. 핵심 제작 원칙

각 문서는 단순히 요구받은 항목만 기록하지 않는다.

해당 시스템이 실제 게임에서 다른 시스템과 만났을 때 생길 수 있는 문제까지 고려한다.

항상 다음 관점으로 검토한다.

• 공간적으로 가능한가  
• 사람이 실제로 그렇게 움직일 수 있는가  
• 카메라에서 보이는가  
• 플레이어가 접근할 수 있는가  
• 모바일에서도 누를 수 있는가  
• 다른 오브젝트와 충돌하지 않는가  
• 애니메이션 전후 상태가 이어지는가  
• 저장 후 복원 가능한가  
• 플레이어가 순서를 깨뜨릴 수 없는가  
• 연출이 반복적으로 느껴지지 않는가  
• 필요한 정보가 실제로 제공되는가  
• 너무 많은 정보가 미리 노출되지 않는가  
• 성능상 감당 가능한가  

이 원칙을 COMMON과 모든 CHAPTER 문서에 적용한다.

<!-- MERGED SOURCE END: 00_INDEX.md -->


================================================================================
ORIGINAL SOURCE: 01_PLAYER.md
================================================================================

# 01_PLAYER.md

# PLAYER SPECIFICATION

이 문서는 플레이어 캐릭터의 존재 방식, 1인칭 표현, 물리적 행동, 손과 오브젝트의 관계, 상태 전환, 신원 은폐 원칙을 정의한다.

---

# 0. 상위 문서 검토

참조:

`00_INDEX.md`

## 0.1 상충 검토 결과

00_INDEX.md는 01_PLAYER.md의 책임 범위를 다음과 같이 정의한다.

• 1인칭 표현  
• 플레이어가 말하는 방식  
• 손 표현  
• 오브젝트 조사  
• 물건 들기  
• 도장 사용  
• 이동 중 상태  
• cinematic 상태  
• 플레이어의 신원 비공개 규칙

본 문서는 위 범위를 그대로 유지한다.

00_INDEX.md의 다른 공통 문서가 담당하도록 지정된 아래 세부 사항은 여기서 최종 구현값으로 고정하지 않는다.

• 구체적 키 배치는 `02_CONTROL.md`
• 카메라 수치와 tween은 `03_CAMERA.md`
• Raycast 및 상호작용 판정은 `04_INTERACTION.md`
• 대화 진행 로직은 `05_DIALOGUE.md`
• 도장 자체의 세부 물리/애니메이션은 `14_STAMP.md`
• 충돌 수치와 clearance는 `18_COLLISION_AND_CLEARANCE.md`
• 저장 포맷은 `25_SAVE_AND_RESUME.md`

단, 플레이어 관점에서 반드시 필요한 요구조건은 본 문서에 정의하고 후속 문서가 이를 위반하지 못하도록 한다.

현재 확인된 상충 사항은 없다.

---

# 1. 플레이어의 기본 존재

## 1.1 시점

플레이어는 기본적으로 1인칭이다.

플레이어의 몸 전체를 상시 화면에 표시하지 않는다.

목표는 플레이어가 화면 속 캐릭터를 구경하는 것이 아니라 직접 연구 책임자의 위치에 서 있다고 느끼게 하는 것이다.

따라서 다음 원칙을 유지한다.

• 평상시 플레이에서는 머리나 몸통을 카메라 앞에 표시하지 않는다.
• 손이나 팔은 실제 행동에 필요한 순간에만 나타난다.
• 컷신을 위해 갑자기 3인칭으로 전환하지 않는다.
• 플레이어의 얼굴은 게임 전체에서 직접 보여주지 않는다.
• 거울이나 반사면을 통해 얼굴을 우회적으로 노출하지 않는다.
• 최종 정체 공개 전에는 실루엣이나 그림자도 특정 인물을 알아볼 정도로 상세하게 만들지 않는다.

---

# 2. 플레이어의 신원

## 2.1 비공개 상태

CHAPTER 10의 엽서 공개 이전까지 플레이어의 이름은 user-facing 정보로 절대 표시하지 않는다.

금지 대상은 명백한 자막뿐 아니라 다음을 포함한다.

• 책상 명패
• 문패
• 서명
• 봉투 수신인
• 파일명처럼 보이는 화면 텍스트
• 플레이어 개인 문서
• 전화 상대의 호명
• HUD
• 저장 슬롯 이름
• 디버그 정보가 그대로 UI에 노출되는 경우
• interaction label
• 우편물
• 가족사진 캡션
• 소지품 각인
• 연구시설 내 인사명부

NPC는 다음 호칭만 사용한다.

• 박사님
• 책임자
• Director

챕터별 대사 문서에서 다른 호칭을 사용하려면 `29_SPOILER_RULES.md`와 함께 검토해야 한다.

---

## 2.2 신원 공개 이후

CHAPTER 10에서 엽서를 뒤집고 다음 정보가 순차적으로 나타난 뒤에만 이름을 공개 상태로 전환한다.

`TO.`

→

`J. ROBERT`

→

`OPPENHEIMER`

이 시점 이전에는 코드 내부 변수나 asset 이름에 실제 이름이 존재해도 user-facing 출력으로 연결되지 않아야 한다.

정체 공개는 데이터 플래그 하나가 바뀌는 것 이상의 의미를 가진다.

공개 전/후의 화면 텍스트 생성 함수는 신원 노출 가능성을 별도로 검사할 수 있는 구조를 권장한다.

예:

`playerIdentityRevealed === false`

상태에서는 이름 출력 API가 실제 이름을 반환하지 않도록 한다.

---

# 3. 플레이어의 성격 표현 방식

## 3.1 무성에 가까운 주인공

플레이어는 긴 음성 대사를 하지 않는다.

플레이어의 성격은 선택지 문장보다 행동을 통해 드러난다.

핵심 행동:

• 서류를 받아든다.
• 데이터를 비교한다.
• 오류를 지적한다.
• 연구자를 바라본다.
• 반려 도장을 집는다.
• REJECTED를 찍는다.
• 수정본을 다시 검토한다.
• APPROVED를 찍는다.
• 전화 수화기를 든다.
• 더 듣지 못하고 수화기를 던진다.
• 현관문을 연다.
• 상자를 가져온다.
• 사진과 메달을 조사한다.
• 마지막 엽서를 집는다.

플레이어에게 감정을 설명하는 독백을 넣지 않는다.

금지 예:

`이 연구가 정말 옳은 것일까?`

`나는 죄책감을 느꼈다.`

`이것이 내가 만든 것이었나.`

이런 감정은 장면과 행동으로 전달한다.

---

# 4. 기본 신체 스케일

후속 공간 및 충돌 문서가 기준으로 사용할 플레이어의 기본 물리 스케일을 정의한다.

정확한 collider 값은 `18_COLLISION_AND_CLEARANCE.md`에서 최종 확정한다.

기본 설계 기준:

• 눈높이: 약 1.62~1.68m 범위
• 서 있는 사람 전체 키 추정: 약 1.72~1.80m
• 물리적 점유 폭: 성인 한 사람이 책상 사이를 자연스럽게 지나갈 수 있는 수준
• 카메라 원점과 충돌체 중심을 완전히 동일하게 취급하지 않는다.

중요:

카메라가 통과할 수 있다고 플레이어 몸도 통과 가능한 것으로 간주해서는 안 된다.

반대로 플레이어 collider가 벽에 닿았다고 카메라가 벽 내부로 들어가서도 안 된다.

이 관계는 후속 collision/camera 문서가 함께 해결한다.

---

# 5. 이동 중 플레이어 상태

플레이어는 최소 다음 상태를 구분한다.

```text
FREE
FOCUS
DIALOGUE
INSPECT
CARRY
STAMP
CINEMATIC
LOCKED
TRANSITION
```

---

## 5.1 FREE

일반적인 자유 이동 상태.

가능:

• 걷기
• 시점 회전
• 일반 상호작용
• NPC 접근
• 오브젝트 관찰

불가능:

• cinematic 전용 오브젝트 강제 이동
• 현재 챕터 state에서 잠긴 상호작용

---

## 5.2 FOCUS

특정 NPC나 오브젝트를 짧게 집중해서 보는 상태.

예:

• NPC가 문서를 내미는 순간
• 장비의 이상 신호를 처음 포착
• 현관문 노크 직후 문 방향으로 주의를 유도

완전한 cinematic lock과 다르다.

플레이어가 아주 제한된 범위에서 시점을 움직일 수 있게 할 수 있다.

후속 Camera 문서에서 구체화한다.

---

## 5.3 DIALOGUE

NPC와 대화 중.

기본 원칙:

• 플레이어의 위치 이동은 정지.
• 시점은 상대를 볼 수 있게 제한.
• 다른 오브젝트 interaction 차단.
• 한 문장 진행 입력은 유지.
• 대화 종료 후 기존 제어를 복원.

NPC와 대화하다가 플레이어가 뒤돌아 도망가면서 자막만 계속 재생되는 상태를 만들지 않는다.

---

## 5.4 INSPECT

문서, 카드, 사진, 메달, 엽서 등을 집중 조사하는 상태.

기본 원칙:

• 플레이어 이동 중지.
• 조사 대상은 읽을 수 있는 안정적인 위치에 있어야 한다.
• 조사 대상과 카메라 사이에 다른 geometry가 끼어들지 않는다.
• 조사 종료 후 오브젝트의 world state가 정확히 복원되어야 한다.
• 조사 전에 있던 오브젝트가 다른 물체를 관통한 상태로 돌아가지 않는다.

특히 문서 두 장을 비교하는 장면에서는 플레이어가 두 문서를 실제로 모두 볼 수 있는 화면 공간이 확보되어야 한다.

---

## 5.5 CARRY

상자처럼 큰 오브젝트를 들고 이동하는 상태.

작은 종이나 메달을 조사하는 것과 분리한다.

기본 원칙:

• 들고 있는 물체는 카메라 아래쪽의 지정 carry anchor를 따른다.
• 카메라 중앙을 가리지 않는다.
• 물체가 벽이나 문틀을 통과하지 않는다.
• 물체가 플레이어 collider를 실제보다 크게 만들 필요가 있다면 carry 상태 전용 clearance check를 수행한다.
• 통과 불가능한 좁은 구간에서는 억지로 clipping시키지 않는다.
• 내려놓을 유효한 지점이 없으면 자동 placement를 실행하지 않는다.

CHAPTER 10 상자 운반은 대표적인 CARRY 상태다.

---

## 5.6 STAMP

REJECTED 또는 APPROVED 도장을 실행하는 짧은 전용 상태.

기본 원칙:

• 다른 interaction 차단.
• 도장과 종이가 모두 카메라에 보이는 위치 확보.
• 도장 애니메이션 도중 카메라가 종이를 관통하지 않음.
• 도장이 내려오는 trajectory에 다른 컵, 연필, 서류가 없어야 함.
• 도장 완료 전 결과 플래그를 먼저 변경하지 않는다.
• 도장 충격 순간 또는 직후에 결과 상태를 확정한다.

세부 구현은 `14_STAMP.md`.

---

## 5.7 CINEMATIC

CHAPTER 9 결과 영상, CHAPTER 10 전화 투척, 엽서 reveal 등 플레이어가 연출을 방해하면 안 되는 구간.

기본 원칙:

• 이동 차단.
• 일반 interaction 차단.
• 필요할 경우 시점까지 제어.
• 연출 종료 후 제어 상태를 명시적으로 복구.
• 페이지 visibility 변화나 focus loss가 발생해도 두 번 재생되지 않도록 상태 보호.

---

## 5.8 LOCKED

짧은 기술적 잠금 상태.

예:

• scene 초기화
• 저장 복구
• chapter transition 직전
• 다른 state로 전환되는 한두 프레임

LOCKED는 플레이어가 체감할 정도로 오래 유지하지 않는다.

오래 유지해야 한다면 CINEMATIC 또는 TRANSITION처럼 의미 있는 상태를 사용한다.

---

## 5.9 TRANSITION

챕터 HTML 이동 직전/직후.

• 자유 입력 차단
• fade 처리
• save 완료 확인
• 다음 페이지로 이동

이 상태에서 사용자가 연타하여 두 번 페이지 이동하는 문제가 발생하지 않게 한다.

---

# 6. 상태 전환 규칙

아무 state에서 아무 state로 직접 이동하지 않는다.

대표적인 정상 흐름:

```text
FREE
→ DIALOGUE
→ FREE

FREE
→ INSPECT
→ FREE

FREE
→ CARRY
→ FREE

INSPECT
→ STAMP
→ DIALOGUE
→ FREE

FREE
→ CINEMATIC
→ FREE

FREE
→ TRANSITION
→ next chapter
```

잘못된 예:

```text
STAMP → CARRY
CINEMATIC → INSPECT
TRANSITION → DIALOGUE
```

특수한 챕터 연출이 필요하면 챕터 STATE 문서에서 명시적으로 예외를 정의한다.

---

# 7. 플레이어 손 표현

## 7.1 사용 원칙

손은 항상 화면에 떠 있는 FPS 게임의 무기 손처럼 유지하지 않는다.

필요할 때만 등장한다.

사용 장면:

• 서류 받기
• 서류 내려놓기
• 도장 들기
• 레버/스위치 조작
• 전화 수화기 들기
• 전화 수화기 던지기
• 문손잡이 돌리기
• 상자 들기
• 포장끈 풀기
• 사진 집기
• 메달 집기
• 엽서 집기/뒤집기

---

## 7.2 손의 역할

손은 사실적인 인체 시뮬레이션보다 행동의 물리성을 전달하는 도구다.

따라서:

• 손가락 개별 IK가 없더라도 괜찮다.
• 하지만 손과 오브젝트 사이에 명백한 틈이 생기면 안 된다.
• 오브젝트가 손보다 먼저 움직여 공중에 뜨지 않는다.
• 손이 오브젝트 내부를 깊게 관통하지 않는다.
• 물건의 크기에 따라 잡는 위치가 달라져야 한다.

종이와 상자를 같은 grip animation으로 처리하지 않는다.

---

## 7.3 손의 화면 침범

손이 화면을 과도하게 가리지 않도록 한다.

특히:

• 문서의 중요한 문구
• 사진의 핵심 이미지
• 메달 각인
• 엽서의 이름

을 손가락이나 손바닥이 가리면 안 된다.

오브젝트 디자인 단계에서 손이 잡을 여백을 미리 확보한다.

---

# 8. 문서 받기

NPC가 문서를 제출할 때:

1. NPC가 문서를 들고 접근.
2. 지정 정지 지점에서 멈춤.
3. 플레이어와 짧은 대화.
4. NPC 손이 플레이어 쪽으로 문서를 내밈.
5. 문서가 충분히 플레이어 reach 영역에 들어옴.
6. 플레이어 입력.
7. 플레이어 손 등장.
8. 문서 ownership이 NPC anchor에서 player anchor로 전환.
9. NPC 손이 자연스럽게 원위치.
10. 문서가 조사 위치로 이동.

ownership을 중간에 애매하게 두지 않는다.

한 프레임 동안 두 손이 동시에 문서를 잡는 것은 가능하지만, 그 구간이 길어져 문서가 떨리거나 두 transform parent의 영향을 동시에 받으면 안 된다.

---

# 9. 문서 놓기

문서를 책상에 놓을 때 실제 placement surface를 사용한다.

단순히 월드 좌표를 하드코딩하고 끝내지 않는다.

배치 전에 확인:

• surface가 존재하는가
• surface 높이가 맞는가
• 해당 위치에 다른 문서가 있는가
• 컵/연필/도장과 겹치지 않는가
• 책상 가장자리 밖으로 튀어나오지 않는가
• 카메라에서 읽을 수 있는 방향인가

필요하면 책상에 invisible placement slots를 만든다.

예:

```text
review_slot_left
review_slot_center
review_slot_right
stamp_slot
incoming_document_slot
```

이렇게 하면 챕터별 문서가 무작위로 겹치는 문제를 줄일 수 있다.

---

# 10. 조사 행동

조사 대상은 단순 확대 UI가 아니라 가능한 한 실제 세계의 물체와 연결한다.

예:

문서를 집는다.
→ 카메라 가까이.
→ 앞면 확인.
→ 뒤집기.
→ 다시 책상에 둔다.

조사 종료 시 위치 복원은 원래 transform을 그대로 되돌리는 방식보다, 지정된 valid placement slot에 다시 놓는 것을 우선한다.

이유:

다른 animation 때문에 원래 위치가 이미 점유됐을 수 있기 때문이다.

---

# 11. 비교 행동

두 개 이상의 자료를 비교해야 할 경우 플레이어가 머릿속으로 모든 정보를 외우게 하지 않는다.

가능한 표현:

• 책상 위 좌/우 두 자료 배치
• 문서 viewer에서 split comparison
• 핵심 행에 player marker
• 이전 승인 archive를 옆에 열기

단, 자동으로 모순을 색칠해 정답을 알려주지 않는다.

플레이어가 비교할 수 있는 환경만 제공한다.

---

# 12. 큰 오브젝트 들기

대표 사례:

CHAPTER 10 배달 상자.

큰 오브젝트를 들 때:

• 양손 또는 양손을 암시하는 grip.
• 이동 속도를 약간 낮출 수 있음.
• 상자 때문에 시야 중앙이 가려지지 않음.
• 문을 직접 조작해야 한다면 상자를 든 상태에서 문 조작을 요구하지 않는다.

권장 흐름:

현관문을 먼저 충분히 연다.
→ 상자를 든다.
→ 이미 열린 문을 통해 들어온다.
→ 테이블에 둔다.

상자를 든 상태에서 손잡이를 다시 잡아 문을 여는 복합 애니메이션은 필요하지 않다.

---

# 13. 플레이어와 가구의 관계

플레이어는 테이블, 캐비닛, 장비를 밀어내지 않는다.

환경은 기본적으로 고정.

중요:

카메라가 책상 위를 보기 위해 앞으로 이동할 때 플레이어 collider가 책상을 뚫어서는 안 된다.

따라서 조사 장면에서는:

• 플레이어 physical body를 억지로 앞으로 이동시키기보다
• 필요시 카메라 전용 focus offset을 사용한다.

카메라와 플레이어 물리 위치를 항상 완전히 일치시켜야 한다는 가정을 피한다.

---

# 14. 플레이어와 NPC의 관계

플레이어가 NPC를 통과할 수 있게 만들지 않는다.

그러나 NPC가 좁은 복도에서 영구 장애물이 되어서도 안 된다.

세부 collision 처리는 후속 문서에서 정하지만 플레이어 관점의 원칙은 다음과 같다.

• 대화 중 NPC와 최소한의 개인 공간 유지.
• NPC가 출입문 한가운데 멈추지 않음.
• NPC가 플레이어 spawn 위치를 점유하지 않음.
• 플레이어가 NPC 뒤에 갇힐 수 있는 dead-end 배치를 만들지 않음.
• 다인원 CH8/CH9에서도 중앙 통로를 유지.

NPC가 플레이어 앞으로 접근할 때 최종 정지 위치는 플레이어의 현재 위치를 그대로 기준 삼지 말고 주변 장애물을 확인한 valid conversation spot을 사용한다.

---

# 15. 플레이어 spawn

각 챕터의 spawn은 실제 사람이 서 있을 수 있는 지점이어야 한다.

필수 검사:

• 바닥 위
• 벽과 겹치지 않음
• 가구 내부 아님
• NPC 내부 아님
• 문 회전 영역 아님
• 뒤로 한 걸음 물러날 공간 존재
• 처음 보는 핵심 장면이 카메라 바로 뒤에 있지 않음

spawn 직후 카메라가 벽을 바라보고 시작하는 문제를 허용하지 않는다.

각 챕터의 `SPATIAL_LAYOUT.md`와 `CAMERA.md`에서 spawn 위치와 시작 시선을 함께 정의한다.

---

# 16. 플레이어와 문

문을 열고 닫는 것은 실제 회전 영역을 고려한다.

플레이어가 문 회전 궤도 안에 서 있으면 문이 몸을 관통해서 열리지 않아야 한다.

가능한 처리:

• 상호작용 전에 player clearance 검사
• 플레이어가 너무 가까우면 작은 자동 후퇴
• 문 열림 각도 제한
• 문이 플레이어 반대 방향으로 열리도록 공간 설계

자동 후퇴를 사용할 경우 플레이어를 갑자기 순간이동시키지 않는다.

---

# 17. 플레이어와 카메라

카메라 문제를 플레이어 문제와 별개로 보지 않는다.

플레이어가 정상적인 공간에 있는데 camera near plane 때문에:

• 종이가 잘림
• NPC 얼굴 내부가 보임
• 벽 뒷면이 보임
• 손이 사라짐

같은 문제가 생기면 플레이 경험상 플레이어의 물리 문제가 된다.

따라서 후속 Camera 문서는 플레이어 상태별 near-space 안전거리를 고려해야 한다.

---

# 18. 플레이어 행동의 질량감

모든 물체를 같은 속도로 움직이지 않는다.

예:

종이:
• 가볍다.
• 빠르게 들 수 있다.
• 약간의 작은 회전 가능.

도장:
• 작지만 묵직.
• 들기는 비교적 빠르나 내려찍기는 명확한 가속과 충격 필요.

전화 수화기:
• 중간 무게.
• 코드에 연결되어 있기 때문에 자유 비행 물체처럼 움직이지 않는다.

상자:
• 느리게 든다.
• 내려놓을 때 작은 camera response 가능.
• 던지지 않는다.

메달:
• 작고 무거운 금속.
• 회전 속도 느림.

엽서:
• 가볍고 섬세함.
• 이름 공개 장면에서는 매우 느린 rotation.

---

# 19. 행동의 시작과 종료 상태

모든 플레이어 행동은 다음을 명시해야 한다.

• 시작 가능한 상태
• 필요한 대상
• animation 시작 transform
• animation 종료 transform
• player state 변경
• interaction lock
• 완료 flag
• 실패/중단 시 복원 위치

예:

`pickUpDocument()`

시작:
FREE 또는 DIALOGUE 종료 직후.

완료:
INSPECT.

실패:
document anchor가 없으면 원상태 유지.

이 원칙은 10_ANIMATION_CORE.md에서 기술적으로 일반화한다.

---

# 20. 중복 입력에 대한 플레이어 보호

사용자는 빠르게 여러 번 클릭할 수 있다고 가정한다.

다음 문제가 발생하면 안 된다.

• 종이가 두 장 생성
• 도장을 두 번 찍음
• 문이 두 번 열려 200° 회전
• 전화 수화기가 두 개 생김
• 상자를 두 번 집음
• 대사가 두 줄씩 건너뜀
• 다음 챕터 이동이 두 번 실행

플레이어 행동 state가 전환되는 즉시 해당 action의 재진입을 막는다.

UI 버튼 비활성화만 믿지 않는다.

game state 수준에서도 방지한다.

---

# 21. 플레이어 행동 중 focus loss

브라우저 탭 이동, 알림, 화면 잠금 등으로 animation 중 focus를 잃을 수 있다.

복귀 시:

• 같은 행동이 처음부터 중복 재생되지 않음.
• 물건이 중간 공중 위치에서 영구 정지하지 않음.
• interaction lock이 영구적으로 남지 않음.

짧은 일반 animation은 완료 상태로 snap하는 방법을 고려.

중요 cinematic은 저장된 sequence checkpoint를 기준으로 복구.

구체적 구현은 후속 Animation/Save 문서에서 결정한다.

---

# 22. 플레이어 실패 표현

플레이어가 잘못된 연구 판단을 했을 때 캐릭터가 “틀렸다”고 말하지 않는다.

플레이어의 판단 행위와 퍼즐 피드백은 구분한다.

예:

잘못된 문서를 지목하면:

• 해당 자료가 comparison position으로 이동.
• 관련 자료를 다시 확인할 수 있게 함.
• 모순이 없음을 확인할 단서 제공.

즉, 주인공이 무능한 선택지를 대사로 말하는 형태보다 검증 과정에서 판단을 수정하도록 한다.

---

# 23. 플레이어가 느껴야 하는 권한

플레이어는 시설에서 단순 심부름꾼처럼 보여서는 안 된다.

이를 위해:

• 연구자들이 플레이어에게 결과를 가져온다.
• 최종 승인 권한은 플레이어에게 있다.
• 중요한 문서를 다른 NPC가 임의로 승인하지 않는다.
• 연구자가 플레이어의 판단을 기다리는 순간이 존재한다.
• CH8에서 모든 부서의 결과가 플레이어 책상/회의로 모인다.

하지만 플레이어가 독재자처럼 보이면 안 된다.

권한의 근거는 지위 자체보다 반복적으로 보여주는 검증 능력이다.

---

# 24. 플레이어의 감정 곡선과 행동

플레이어의 감정은 UI 수치로 표시하지 않는다.

행동과 주변 반응으로 만든다.

CH1~4:
• 익숙하게 문서를 검토.
• 도장 행동이 점차 자연스러워짐.
• 연구자들이 판단을 인정.

CH5:
• George와 실제 마찰.
• 그래도 반려.

CH6:
• Emilio가 먼저 의심을 공유.
• 플레이어와 협력적 검증.

CH7:
• 일정 손해를 감수하고 사고 기록 반려.

CH8:
• 모든 사람이 플레이어의 마지막 결정을 기다림.
• 최종 승인.

CH9:
• 플레이어가 어떠한 선택 UI도 하지 않음.
• 결과를 보기만 한다.

CH10:
• 긴 말 대신 수화기를 던지는 물리 행동.
• 마지막 엽서를 직접 뒤집음.

---

# 25. CHAPTER 9 플레이어 규칙

CH9에서 플레이어에게 새로운 퍼즐을 주지 않는다.

전광판 결과 영상 전까지:

• 자유 이동 가능.
• NPC와 제한적인 마지막 대화 가능.

`VIEW RESULTS` 실행 이후:

• CINEMATIC 상태.
• 이동 잠금.
• 화면과 NPC 반응을 볼 수 있게 카메라 설계.
• 도덕적 선택 버튼 없음.
• “승인/거부” 없음.

플레이어는 이미 CH8에서 프로젝트를 승인했다.

CH9에서 다시 폭탄을 승인시키면 이야기 구조가 깨진다.

---

# 26. CHAPTER 10 플레이어 규칙

CH10은 별도의 objective UI 없이 환경음을 따라 행동한다.

행동 순서:

```text
집에서 깨어남/등장
→ 라디오
→ 전화벨
→ 전화기로 이동
→ 수화기 들기
→ 한 줄씩 통화
→ 수화기 투척
→ 정적
→ 노크
→ 현관 이동
→ 문 열기
→ 상자 확인
→ 상자 운반
→ 상자 열기
→ 사진/메달 조사
→ 두 물건 치움
→ 엽서 발견
→ 엽서 집기
→ 엽서 뒤집기
→ 신원 공개
```

플레이어가 노크 전에 현관을 열어도 되는지 등 세부 순서 제어는 CH10 `STATE.md`에서 확정한다.

하지만 플레이어 관점에서는 시스템에 끌려다니는 느낌보다 자연스럽게 소리와 공간이 행동을 유도해야 한다.

---

# 27. 수화기 투척

이 장면은 CH10에서 플레이어가 가장 강한 물리적 감정을 드러내는 행동이다.

원칙:

• 자동 cinematic이지만 플레이어의 1인칭 행동처럼 보여야 한다.
• 카메라를 외부 3인칭으로 빼지 않는다.
• 수화기를 내려놓으려는 움직임이 먼저 있어야 한다.
• 중간에 멈춘다.
• 그 후 짧고 급한 옆 방향 움직임.
• 수화기가 테이블 모서리 또는 지정된 충돌점에 부딪힌다.
• 바닥 또는 낮은 위치로 떨어진다.
• 전화선이 당겨진다.
• 목소리가 바닥 수화기에서 계속 작게 들린다.

물리엔진이 없더라도 predetermined animation path로 안정적으로 구현할 수 있다.

무작위 physics 때문에 수화기가 벽을 뚫거나 방 밖으로 날아가는 것을 허용하지 않는다.

---

# 28. 상자 운반

상자는 문 밖에서 발견한다.

플레이어가 집 안으로 옮긴다.

여기서 반드시 사전에 확인할 공간 요소:

• 현관문이 충분히 열려 있음
• 상자 폭보다 문 유효 폭이 큼
• 문틀을 통과하는 carry path
• 현관에서 테이블까지 최소 이동 폭
• 테이블에 상자 placement area 확보
• 의자/러그/전화선이 이동을 방해하지 않음

CH10의 HOME_LAYOUT과 OBJECT_PLACEMENT는 이 요구를 반영해야 한다.

---

# 29. 사진과 메달

두 물건은 조사 후 실제로 상자에서 제거되어야 한다.

단순 visibility false만으로 끝내도 시각적 결과는 가능하지만, 플레이어가 “치웠다”는 감각을 위해 테이블의 지정 위치에 내려놓는 것을 우선한다.

사진용 slot과 메달용 slot은 서로 겹치지 않는다.

두 물건을 모두 조사하기 전까지 엽서의 핵심 이름 영역은 시각적으로 가려져 있어야 한다.

카메라가 높은 각도에서 우연히 상자 안쪽을 볼 수 있는 경우도 고려한다.

---

# 30. 엽서

엽서는 주인공 신원의 최초 공개 지점이다.

따라서 플레이어의 손, 카메라, 조명 모두 이름 가독성을 최우선한다.

금지:

• 손가락이 이름 가림
• glare가 글자를 날림
• 낮은 texture 해상도
• 카메라 흔들림
• 이름이 너무 빨리 나타남
• interaction label에 미리 이름 표시

엽서 뒤집기는 단순 180° 즉시 flip이 아니다.

회전 도중 잠시 종이 두께가 보일 정도로 충분한 시간을 둔다.

이름은 회전 완료 후 순차적으로 등장한다.

---

# 31. 플레이어 그림자와 반사

플레이어 신원 보호를 위해:

• 얼굴 형태가 드러나는 반사 금지.
• 거울을 배치하더라도 플레이어 반사는 생략하거나 흐리게 처리.
• 그림자는 일반적인 인체 실루엣 수준만 허용.
• 특정 헤어스타일/얼굴 윤곽을 재현하지 않는다.

CH10에서도 엽서 reveal 전까지 동일하다.

---

# 32. 플레이어 음성

플레이어 본인의 full voice acting은 기본적으로 사용하지 않는다.

이유:

• 정체를 특정하는 성별/연령/인물 연상을 줄이기 위함.
• 플레이어가 직접 책임자의 자리에 들어가는 감각 유지.
• 중요한 감정은 행동으로 전달.

필요하다면:

• 숨
• 아주 작은 호흡
• 힘을 줄 때의 비언어적 소리

정도는 가능하지만 과도하지 않게 한다.

---

# 33. 접근성 측면

플레이어의 핵심 행동이 사운드 하나에만 의존하지 않도록 한다.

예:

전화벨:
• 전화기 진동/indicator 같은 시각적 보조 가능.

노크:
• 문 쪽 작은 환경 반응 또는 subtitle 가능.

하지만 HUD 화살표로 모든 행동을 강제 안내하지 않는다.

청각/시각 보조의 구체적 정책은 UI 및 Audio 문서에서 확정한다.

---

# 34. 플레이어가 장면을 망가뜨릴 수 있는 경우

후속 챕터 문서는 다음 상황을 항상 검사한다.

• NPC가 접근 중일 때 플레이어가 그 경로에 서기
• 문 앞을 막기
• 제출 책상 위에 먼저 올라붙기
• 조사 대상에 지나치게 가까이 서기
• 대화 직전 다른 물체 연타
• animation 시작 직전 이동 입력 유지
• carry 상태로 좁은 틈 진입
• 챕터 완료 직전에 상호작용 연타

이런 행동을 “사용자가 그렇게 하지 않겠지”라고 가정하지 않는다.

시스템 또는 공간 설계로 안정적으로 처리한다.

---

# 35. 플레이어 기준 공간 설계 요구

후속 `17_SPATIAL_LAYOUT.md`와 모든 챕터별 공간 문서는 플레이어 행동을 기준으로 다음을 반드시 확보한다.

• 사람이 서서 회전할 공간
• NPC와 대화할 공간
• NPC가 문서를 내밀 공간
• 문서 조사 camera 공간
• 도장을 찍을 책상 여유
• NPC가 돌아서 퇴장할 공간
• 문 열림 영역
• carry path
• CH8/CH9 다인원 상태에서도 통로
• CH10 상자 운반 동선

오브젝트를 보기 좋게 채운 뒤 남는 공간에 플레이어를 끼워 넣는 방식으로 설계하지 않는다.

먼저 행동 공간을 확보하고 그 다음 장식을 배치한다.

---

# 36. 플레이어 기준 오브젝트 높이

세부 수치는 Objects/Spatial 문서에서 확정하되 다음 원칙을 사용한다.

• 주요 책상 표면은 서 있는 플레이어가 내려다보기 편한 높이.
• 중요한 장비 controls는 지나치게 낮거나 높지 않음.
• 문서의 텍스트는 camera를 벽에 밀착하지 않고도 읽을 수 있음.
• 작은 오브젝트는 모바일에서도 선택 가능할 만큼 physical interaction area를 확보.

실제 mesh 크기를 비현실적으로 키워야 하는 경우에는 invisible interaction proxy를 사용할 수 있다.

---

# 37. 플레이어의 물리와 연출 분리

시네마틱을 위해 플레이어 collider를 임의로 벽 안으로 이동시키지 않는다.

필요한 close-up이 있다면:

• camera offset
• temporary focus camera
• object를 inspection anchor로 이동

등을 사용한다.

게임이 끝난 뒤 플레이어의 physical transform은 안전한 위치에 남아 있어야 한다.

---

# 38. 플레이어 제어 복원

모든 제한 상태에는 명확한 exit가 있어야 한다.

대화가 끝났는데 이동이 안 되는 버그,
문서 닫았는데 카메라가 고정되는 버그,
도장 후 클릭이 안 되는 버그를 막기 위해 상태 해제는 각 애니메이션의 부수 효과가 아니라 명시적 단계로 처리한다.

예:

```text
finishStamp()
→ commitResult()
→ restoreDocumentState()
→ setPlayerState(DIALOGUE)
```

또는

```text
finishDialogue()
→ setPlayerState(FREE)
```

---

# 39. 플레이어 상태 디버깅

개발 모드에서는 현재 player state를 확인할 수 있는 디버그 표시를 제공하는 것을 권장한다.

예:

`PLAYER: INSPECT`

단, 배포 버전에서는 제거하거나 숨긴다.

디버그 문자열 때문에 Oppenheimer 이름이나 숨겨진 정보가 user-facing 화면에 노출되지 않게 한다.

---

# 40. 플레이어 관련 금지사항

• 상시 화면에 FPS 스타일 손/팔 고정
• 벽을 뚫는 카메라
• NPC 몸 통과
• 오브젝트를 든 채 벽 통과
• 자동 애니메이션이 플레이어를 가구 내부에 배치
• 대화 중 자유롭게 도망가며 대사만 재생
• cinematic 종료 후 입력 미복구
• 클릭 연타로 같은 행동 두 번 실행
• 플레이어 이름 조기 노출
• 플레이어 얼굴 조기 노출
• 감정을 설명하는 긴 독백
• 퍼즐 실패를 플레이어 캐릭터의 바보 같은 대사로 표현
• CH9에서 결과를 본 뒤 다시 승인 여부를 선택시키기
• CH10에서 이름을 엽서보다 먼저 공개하기

---

# 41. 후속 문서에 넘기는 결정

아래 항목은 플레이어 요구조건을 본 문서에서 정의했지만 최종 수치/구현은 후속 문서가 확정한다.

`02_CONTROL.md`
• 키와 터치 입력
• 입력 우선순위
• debounce 시간

`03_CAMERA.md`
• 각 상태의 FOV
• soft-lock 각도
• camera tween
• near/far plane 관련 기준

`04_INTERACTION.md`
• Raycast 거리
• interaction proxy
• target priority

`10_ANIMATION_CORE.md`
• sequence 실행 구조
• interruption/focus 복구

`17_SPATIAL_LAYOUT.md`
• 실제 통행 폭
• 책상 간 거리
• 플레이어 행동 공간 치수

`18_COLLISION_AND_CLEARANCE.md`
• player collider
• camera clearance
• carry clearance
• door collision

`25_SAVE_AND_RESUME.md`
• player state의 checkpoint 저장 방식

이 후속 문서들은 본 문서의 요구사항을 축소하거나 무시할 수 없다.

새로운 충돌이 발견되면 해당 문서에서 `누적 상충 검토` 항목으로 명시한다.

<!-- MERGED SOURCE END: 01_PLAYER.md -->


================================================================================
ORIGINAL SOURCE: 02_CONTROL.md
================================================================================

# 02_CONTROL.md

# CONTROL SPECIFICATION

이 문서는 PC·모바일 입력 체계, 입력 우선순위, 입력 잠금, 중복 입력 방지, 상태별 허용 입력, 포커스 손실 복구, 챕터 전환 중 입력 보호를 정의한다.

---

# 0. 누적 상충 검토

참조 문서:

• `00_INDEX.md`
• `01_PLAYER.md`

## 0.1 00_INDEX.md와의 상충 검토

00_INDEX.md에서 `02_CONTROL.md`의 책임 범위는 다음과 같이 정의되어 있다.

• 이동
• 시점
• 상호작용
• 대화 진행
• 조사
• 취소
• 입력 잠금
• 연타 방지
• 입력 복원

본 문서는 위 범위만 구체화한다.

다음 항목은 다른 문서가 최종 책임을 가진다.

• 카메라의 위치/FOV/tween 세부값 → `03_CAMERA.md`
• Raycast 거리/상호작용 우선순위 → `04_INTERACTION.md`
• 대화 데이터/문장 진행 구조 → `05_DIALOGUE.md`
• 애니메이션 실행 구조 → `10_ANIMATION_CORE.md`
• 모바일 화면 배치와 사이즈 → `27_MOBILE.md`
• 저장/복구 데이터 구조 → `25_SAVE_AND_RESUME.md`

00_INDEX.md와 직접 상충되는 사항은 없다.

---

## 0.2 01_PLAYER.md와의 상충 검토

01_PLAYER.md는 플레이어 상태를 다음과 같이 정의한다.

```text
FREE
FOCUS
DIALOGUE
INSPECT
CARRY
STAMP
CINEMATIC
LOCKED
TRANSITION
```

본 문서는 위 상태명을 그대로 사용한다.

01_PLAYER.md의 핵심 요구와 본 문서의 대응은 다음과 같다.

• `FREE`에서만 일반 이동 허용
• `DIALOGUE`에서 위치 이동 차단
• `INSPECT`에서 위치 이동 차단
• `STAMP`에서 일반 상호작용 차단
• `CINEMATIC`에서 일반 입력 차단
• `TRANSITION`에서 페이지 중복 이동 차단
• 입력 제한이 끝나면 반드시 명시적으로 복원
• 연타로 동일 행동이 중복 실행되지 않게 state 수준에서 차단
• 상자를 든 `CARRY` 상태에서 복합 조작을 억지로 요구하지 않음
• 포커스 손실 후 입력이 영구 잠기지 않도록 복구 경로를 가짐

직접 상충되는 사항은 없다.

단, 01_PLAYER.md는 `FOCUS`에서 제한된 시점 이동을 허용할 수 있다고 열어두었다.
따라서 본 문서에서는 `FOCUS`를 완전 잠금으로 정의하지 않고, 카메라 제한 범위는 `03_CAMERA.md`가 확정하도록 남긴다.

---

# 1. 입력 시스템의 기본 원칙

입력 체계는 `장치 종류`보다 `플레이어 상태`가 우선이다.

즉 PC든 모바일이든 같은 상태에서는 같은 행동 가능/불가능 규칙을 적용한다.

예:

`DIALOGUE`라면
• PC WASD 차단
• 모바일 조이스틱 차단
• 일반 상호작용 차단
• 다음 대사 입력만 허용

`CINEMATIC`이라면
• PC 이동 차단
• 모바일 이동 차단
• 일반 클릭 차단
• 필요할 경우 지정된 continue 입력만 허용

입력 장치별 분기 때문에 게임 규칙이 달라지면 안 된다.

---

# 2. 입력 계층

입력은 아래 우선순위로 처리한다.

```text
1. SYSTEM LOCK
2. CINEMATIC / TRANSITION
3. DIALOGUE
4. INSPECT / STAMP / CARRY
5. FOCUS
6. FREE
```

상위 계층이 활성화되면 하위 입력은 먹지 않는다.

예:

DIALOGUE 중 마우스 클릭이 들어오면
→ 먼저 대화 진행 입력인지 검사
→ 일반 interaction으로 전달하지 않음

STAMP 중 터치가 들어오면
→ stamp sequence 전용 입력인지 검사
→ 일반 오브젝트 선택으로 내려가지 않음

이 구조를 이벤트 리스너별 if문으로 흩어놓지 않고 중앙 입력 라우터에서 처리하는 것을 권장한다.

---

# 3. 중앙 입력 라우터

권장 구조:

```js
handleInput(action, payload)
```

예:

```text
MOVE_FORWARD
MOVE_BACK
MOVE_LEFT
MOVE_RIGHT

LOOK_DELTA

INTERACT
CONFIRM
CANCEL
ADVANCE_DIALOGUE

INSPECT_ROTATE
INSPECT_FLIP

CARRY_DROP

PAUSE
FULLSCREEN
```

브라우저 이벤트는 바로 게임 로직을 호출하지 않는다.

예:

잘못된 방식:

```js
document.addEventListener("click", pickObject);
```

권장:

```js
document.addEventListener("click", e => {
  inputRouter.dispatch("INTERACT", e);
});
```

이유:

• 상태별 입력 제한을 한곳에서 관리 가능
• PC/모바일 규칙 통일
• 중복 클릭 방지
• cinematic 중 입력 누수 방지
• 디버깅 쉬움

---

# 4. PC 기본 조작

기본 권장값:

```text
W        전진
S        후진
A        좌이동
D        우이동

Mouse    시점 이동

Left Click
또는
E        상호작용

Space / Left Click
          대화 다음 문장

Esc      조사 종료 / 취소 가능한 UI 닫기

F        전체화면 토글은 선택적
```

정확한 키 바인딩은 변경 가능하지만 다음 원칙은 유지한다.

• 핵심 상호작용은 마우스 클릭만 강제하지 않는다.
• 키보드 상호작용 대체키를 제공한다.
• 대화 진행 키와 일반 상호작용 키가 같아도 state router가 구분한다.
• 중요한 동작을 동시에 두 키를 누르게 만들지 않는다.

---

# 5. PC 마우스 시점

`FREE` 상태에서 mouse look 허용.

Pointer Lock 사용 가능.

그러나 다음 상태에서는 제한한다.

`DIALOGUE`
• 자유 회전 금지
• 필요한 경우 제한된 look 범위만 허용

`INSPECT`
• 카메라 회전 대신 조사 오브젝트 회전으로 입력을 재해석할 수 있음

`STAMP`
• 자유 회전 차단

`CINEMATIC`
• 기본 차단

`TRANSITION`
• 차단

구체적 허용 각도와 보간은 `03_CAMERA.md`.

---

# 6. 모바일 기본 조작

모바일의 기본 입력 영역은 세 종류로 나눈다.

```text
LEFT ZONE
이동 조이스틱

RIGHT ZONE
시점 드래그

ACTION ZONE
상호작용 / 대화 진행 / 확인
```

중요:

• 이동 조이스틱과 카메라 드래그가 같은 포인터를 잡지 않는다.
• 두 손가락 입력을 동시에 지원할 수 있어야 한다.
• ACTION 버튼이 대화 중에는 `NEXT`, 조사 중에는 `확인/뒤집기`, 평상시에는 `INTERACT` 역할로 바뀔 수 있다.
• 행동에 따라 버튼 역할이 바뀌더라도 시각적 위치는 가능한 한 일관되게 유지한다.

---

# 7. 모바일 멀티터치

멀티터치는 pointerId 단위로 분리한다.

최소 추적:

```text
movePointerId
lookPointerId
actionPointerId
```

한 손가락이 이동 조이스틱을 잡고 있는 상태에서 다른 손가락으로 시점을 돌릴 수 있어야 한다.

다음 오류를 금지한다.

• 조이스틱 손가락을 떼었는데 이동이 계속됨
• 화면 밖으로 pointer가 나가면 이동이 고착됨
• action 버튼을 누르다가 look camera가 튐
• 대화 진행 터치가 뒤쪽 3D 오브젝트 interaction까지 전달됨

`pointercancel`, `visibilitychange`, `blur`에서 모든 활성 pointer 상태를 정리한다.

---

# 8. FREE 상태 입력

허용:

• 이동
• 시점 회전
• 일반 상호작용
• NPC interaction
• 문/장비 접근
• 전체화면 등 비게임 시스템 기능

조건부 허용:

• crouch 등의 추가 이동 기능은 실제 게임 필요성이 확정될 때만
• sprint는 기본적으로 권장하지 않음

금지:

• 아직 state상 활성화되지 않은 챕터 행동
• 잠긴 문서/이벤트 강제 실행

FREE 상태는 플레이어가 가장 많은 입력을 사용할 수 있지만, 모든 오브젝트가 항상 상호작용 가능하다는 뜻은 아니다.

---

# 9. FOCUS 상태 입력

FOCUS는 짧은 주의 유도 상태다.

예:

• NPC가 서류를 내밀 때
• 장비 이상을 처음 보여줄 때
• 노크 직후 현관 쪽으로 시선을 유도할 때

허용:

• 제한된 시점 이동 가능
• 필요시 INTERACT / CONFIRM

금지:

• 위치 이동은 기본적으로 차단
• 다른 오브젝트 상호작용
• 빠른 180° 회전으로 핵심 연출 회피

단, 완전한 camera lock 범위는 `03_CAMERA.md`.

FOCUS가 1초 이상 지속되는데 아무 입력도 안 먹는다면 플레이어는 버그로 느낄 수 있으므로, 시각적/연출적 이유가 명확해야 한다.

---

# 10. DIALOGUE 상태 입력

허용:

• `ADVANCE_DIALOGUE`
• 대화 선택지가 실제 기획상 필요한 경우에만 제한적 선택

금지:

• 위치 이동
• 일반 상호작용
• NPC 변경
• 오브젝트 조사
• 문 열기
• 도장
• 챕터 전환

대화 한 문장을 진행하는 입력은 edge-trigger 방식으로 처리한다.

즉:

`pointerdown`

한 번에 한 문장.

버튼을 누르고 있는 동안 여러 문장이 지나가면 안 된다.

---

# 11. 대화 연타 방지

대사 진행에는 최소 입력 gate를 둔다.

권장 개념:

```text
dialogueAdvanceAllowed = false
```

문장 표시 완료 후:

```text
dialogueAdvanceAllowed = true
```

다음 문장으로 전환되는 순간 다시 false.

이렇게 해서 한 번의 더블탭/더블클릭이 두 문장을 건너뛰지 않게 한다.

정확한 debounce 시간은 구현 시 조정하되, 대사가 아직 fade-in 중이면 다음 입력을 받지 않는 방식이 우선이다.

---

# 12. INSPECT 상태 입력

허용:

• 조사 대상 회전
• 뒤집기
• 비교 대상 전환
• 문서 페이지 전환
• 조사 종료

금지:

• 위치 이동
• 일반 월드 interaction
• NPC interaction
• 다른 챕터 이벤트 시작

조사 중 click/touch가 조사 오브젝트 뒤쪽 월드에 전달되지 않도록 event consumption을 확실히 한다.

---

# 13. 조사 종료

`CANCEL` 또는 지정된 닫기 입력으로 종료 가능.

단, 다음 상황에서는 취소 불가할 수 있다.

• REJECTED 도장 직전 필수 비교가 진행되는 연출
• CH10 엽서 정체 reveal
• Final Archive 핵심 reveal

취소 불가 장면은 UI적으로도 명확해야 한다.

아무 반응 없이 ESC가 먹지 않는 상태를 만들지 않는다.

---

# 14. STAMP 상태 입력

STAMP 상태에서는 기본적으로 sequence를 진행하는 입력만 허용한다.

예:

• 도장 집기
• 도장 위치 확정
• 실제 타격

다만 사용자에게 매 프레임 직접 drag시키는 방식은 권장하지 않는다.

모바일과 PC에서 모두 안정적으로 연출해야 하기 때문이다.

권장:

1. 플레이어가 도장 오브젝트를 클릭
2. 카메라/손 위치 정렬
3. 확인 입력
4. 실제 stamp animation

도장 타격 중에는 추가 입력 차단.

결과 commit 전 중복 input 금지.

---

# 15. CARRY 상태 입력

대표:

CH10 상자 운반.

허용:

• 이동
• 제한된 시점 회전
• 지정된 내려놓기
• 필요한 경우 cancel/drop

금지:

• 일반 작은 오브젝트 상호작용
• NPC 대화 시작
• 도장
• 복잡한 문 조작
• 상자와 무관한 조사

CARRY 상태에서 플레이어가 좁은 곳으로 억지로 들어가려고 하면:

• 이동 자체를 collision으로 막는다.
• 들고 있는 상자를 벽 너머로 clipping하지 않는다.

---

# 16. CINEMATIC 상태 입력

기본:

모든 gameplay 입력 차단.

예외:

• 명시적으로 continue를 요구하는 장면
• Final Archive 다음 인물 이동
• 접근성 목적의 skip이 향후 허용된 경우

CH9의 폭격 결과 연출은 임의 skip을 기본 제공하지 않는다.

CH10의 이름 reveal도 자동 스킵하지 않는다.

cinematic 도중 사용자의 mouse/touch 입력이 카메라 방향을 바꾸거나 다음 월드 interaction을 예약해두면 안 된다.

---

# 17. LOCKED 상태 입력

모든 게임 입력 차단.

단:

• 브라우저 기본 스크롤 방지 여부
• 전체화면 해제
• 접근성상 필요한 브라우저 시스템 기능

까지 억지로 막지 않는다.

LOCKED는 짧은 시스템 상태다.

로딩이 길다면 별도 loading UI를 제공해야지 LOCKED 상태만 오래 유지하지 않는다.

---

# 18. TRANSITION 상태 입력

모든 gameplay 입력 차단.

특히 다음 방지:

• 다음 챕터 링크 두 번 실행
• save 함수 두 번 동시 실행
• fade 중 interaction
• history navigation과 자체 navigation 충돌

한 번 transition을 시작하면:

```text
transitionCommitted = true
```

로 두 번째 호출을 즉시 무시한다.

---

# 19. 이동 입력 해제

이동 입력은 키가 올라왔을 때만 해제한다고 가정하지 않는다.

다음 상황에서도 강제로 zero 처리한다.

• 상태가 FREE에서 DIALOGUE로 변경
• 상태가 FREE에서 INSPECT로 변경
• cinematic 시작
• window blur
• visibility hidden
• pointercancel
• chapter transition

예:

W를 누른 채 대화를 시작했는데 대화 종료 후 캐릭터가 자동으로 전진하는 문제를 막는다.

상태 변경 시 이동 vector를 0으로 초기화한다.

---

# 20. 시점 입력 해제

모바일 look pointer 또는 PC mouse delta도 상태 전환 시 남지 않게 한다.

예:

빠르게 화면을 드래그하다 DIALOGUE 시작
→ 이전 delta가 다음 frame에 적용되어 NPC 얼굴을 지나쳐버리는 문제 금지.

상태 잠금 시 pending look delta를 폐기한다.

---

# 21. 상호작용 입력 우선순위

동일 위치에 여러 대상이 겹쳐 보일 경우 사용자에게 예측 가능한 결과가 나와야 한다.

구체적 Raycast priority는 `04_INTERACTION.md`가 정의하지만 CONTROL 관점의 기본 우선순위는:

```text
현재 진행에 필수인 active interaction
→ 현재 inspect/dialogue 대상
→ 명시적 chapter object
→ NPC
→ 일반 environment interaction
→ decorative object
```

입력 하나가 두 대상에 동시에 전달되지 않는다.

---

# 22. HOLD와 TAP 구분

기본 게임은 `tap/click` 중심.

hold를 요구하는 행동은 최소화한다.

hold 사용 후보:

• 모바일 카메라 drag
• 조이스틱
• 조사 대상 회전 drag

금지에 가까운 것:

• 3초간 버튼을 눌러 도장 찍기
• 문을 열기 위해 계속 hold
• 대화 진행을 위해 hold

플레이어가 연출을 기다리는 것과 버튼을 계속 누르는 것을 혼동하지 않는다.

---

# 23. DOUBLE CLICK / DOUBLE TAP

더블클릭 전용 기능을 만들지 않는다.

이유:

• PC/모바일 차이
• 대화 연타 문제
• 오브젝트 중복 실행 위험
• 접근성 저하

모든 핵심 행동은 single activation으로 가능하게 한다.

---

# 24. 취소 입력 원칙

`CANCEL`은 아무 상태에서나 모든 연출을 깨뜨리는 비상탈출 버튼이 아니다.

상태별:

FREE
• 특별한 취소 동작 없음

FOCUS
• 상황에 따라 focus 해제 가능

DIALOGUE
• 기본적으로 대화 전체 취소 금지

INSPECT
• 일반 조사에서는 종료 가능

STAMP
• 타격 시작 전까지만 취소 가능 여부 검토
• 타격 시작 후 취소 금지

CARRY
• valid drop 가능

CINEMATIC
• 기본 취소 금지

TRANSITION
• 취소 금지

---

# 25. 포인터 캡처

모바일 joystick이나 drag interaction은 `setPointerCapture()`를 사용할 수 있다.

그러나 반드시 해제 경로를 둔다.

• pointerup
• pointercancel
• 상태 변경
• element 제거
• scene transition

오브젝트가 DOM에서 사라졌는데 pointer capture가 남는 문제를 피한다.

---

# 26. 스크롤/브라우저 제스처

모바일 게임 영역에서는 필요한 경우:

```css
touch-action: none;
```

을 사용할 수 있다.

단, 전체 페이지를 무조건 막는 방식은 브라우저 접근성을 해칠 수 있으므로 실제 game canvas/input layer에 제한한다.

브라우저 뒤로가기, 홈 제스처 등 OS 수준 제스처를 억지로 막지 않는다.

---

# 27. 키 반복

keydown의 `event.repeat`를 구분한다.

이동키:
• repeat 여부와 무관하게 held state 유지

INTERACT / CONFIRM / ADVANCE:
• repeat 입력 무시

예:

E를 오래 눌렀다고 NPC 대사가 여러 줄 넘어가면 안 된다.

---

# 28. 입력 debounce

전역적으로 임의의 `300ms` debounce 하나를 적용하지 않는다.

행동 종류마다 필요성이 다르다.

예:

대화:
• 현재 문장 전환 완료까지 잠금

문 열기:
• door animation 완료까지 재진입 금지

도장:
• sequence 완료까지 잠금

일반 decorative inspect:
• 아주 짧은 debounce 가능

즉 시간 기반 debounce보다 `action state` 기반 차단을 우선한다.

---

# 29. 인터랙션 예약 금지

사용자가 animation 중 다음 오브젝트를 클릭했다고 해서 입력을 queue에 쌓아두지 않는다.

예:

도장 애니메이션 중 문을 클릭
→ stamp 완료 후 갑자기 문이 열리는 문제 금지.

잠긴 상태에서 들어온 일반 gameplay 입력은 폐기한다.

예외적으로 dialogue advance처럼 의도된 입력만 해당 시스템이 직접 관리한다.

---

# 30. 입력 상태와 애니메이션 상태 분리

`isAnimating === true` 하나로 모든 입력을 제어하지 않는다.

왜냐하면 일부 animation 중에는 입력이 필요하다.

예:

• dialogue text fade 중 다음 입력 잠금
• NPC idle animation 중 자유 이동 가능
• CRT loop animation 중 interaction 가능

따라서:

```text
playerState
interactionLock
dialogueGate
cinematicLock
transitionCommitted
```

등 의미가 다른 상태를 분리한다.

---

# 31. 상태 전환 함수

권장:

```js
setPlayerState(nextState, options)
```

직접:

```js
GAME.playerState = "DIALOGUE";
```

를 코드 곳곳에서 하지 않는다.

상태 전환 함수는 최소 다음을 수행한다.

• 이전 상태 exit 처리
• 이동 vector 초기화 필요 여부
• look delta 초기화
• pointer release
• UI control visibility 갱신
• 새 상태 enter 처리
• debug log

이렇게 해야 입력 잠금 해제 누락을 줄일 수 있다.

---

# 32. 입력 컨텍스트

상태 외에 현재 interaction context를 둘 수 있다.

예:

```text
context = WORLD
context = DIALOGUE
context = DOCUMENT
context = PHONE
context = PARCEL
context = ARCHIVE
```

단, `playerState`와 중복되는 별도 상태 머신을 만들지 않는다.

context는 같은 상태 안에서 입력 의미를 구분하는 보조값이다.

예:

INSPECT + DOCUMENT
→ 문서 flip

INSPECT + MEDAL
→ 메달 rotate

INSPECT + POSTCARD
→ postcard reveal

---

# 33. 대화와 월드 클릭 충돌 방지

대화 UI가 화면에 떠 있는 동안 사용자가 자막 아래 월드 오브젝트를 클릭해도:

• 대화 한 줄 진행만 발생
• 뒤의 오브젝트 interaction은 발생하지 않음

DOM UI가 `pointer-events`를 적절히 소비하고, 게임 canvas 측에서도 DIALOGUE 상태를 재검사한다.

한쪽만 믿지 않는다.

---

# 34. 문서 UI와 월드 입력 충돌 방지

문서 viewer가 열려 있으면:

• 배경 raycast 중지
• joystick 입력 중지
• look drag를 문서 조작으로 재해석하거나 중지
• ESC/닫기 버튼만 월드 복귀에 사용

문서를 스크롤하다 뒤에 있는 NPC를 클릭하는 문제 금지.

---

# 35. 모바일 Action 버튼 상태

Action 버튼은 현재 state에 따라 역할이 바뀔 수 있다.

예:

```text
FREE       INTERACT
DIALOGUE   NEXT
INSPECT    FLIP / CLOSE
CARRY      PLACE
```

그러나 버튼 label은 현재 의미와 맞아야 한다.

항상 `ACT` 같은 추상적 글자만 유지해 사용자가 추측하게 만들지 않는다.

UI 세부 표현은 `23_UI.md`, 모바일 배치는 `27_MOBILE.md`.

---

# 36. 입력 힌트

핵심 조작을 처음 사용할 때만 짧은 힌트를 제공할 수 있다.

예:

첫 문서:
`터치하여 뒤집기`

첫 대화:
`터치하여 계속`

이후 매번 반복하지 않는다.

하지만 모바일에서 interaction 방식이 달라지는 특수 장면은 필요한 만큼 다시 안내할 수 있다.

---

# 37. 오디오와 입력 피드백

입력 성공 여부를 시각적 변화만으로 전달하지 않는다.

가능한 작은 피드백:

• 종이 집는 소리
• 버튼 click
• door latch
• 도장 들어올리는 소리
• 전화 수화기 pickup

그러나 같은 generic click음을 모든 interaction에 붙이지 않는다.

세부 사운드는 `21_AUDIO.md`.

---

# 38. 잘못된 입력 피드백

현재 사용할 수 없는 오브젝트를 눌렀다고 매번 오류 toast를 띄우지 않는다.

가능한 처리:

• 아무 반응 없음
• 아주 작은 비활성 피드백
• 상황상 필요한 경우 짧은 텍스트

예:

CH10 전화 오기 전에 상자를 찾는 행동 자체가 구조상 불가능하도록 공간/상태를 설계하는 것이 가장 좋다.

시스템 금지문을 계속 띄우는 방식은 마지막 수단이다.

---

# 39. 플레이어가 순서를 깨려는 경우

각 챕터는 사용자가 예상 순서를 따르지 않을 수 있다고 가정한다.

예:

• NPC가 다가오기 전에 책상 쪽으로 달려감
• 제출 문서보다 다른 소품 먼저 클릭
• 경보가 울리자 반대 방향으로 이동
• CH10 노크 전에 현관으로 이동
• 상자를 놓기 전에 다른 오브젝트 클릭

CONTROL은 이런 행동을 모두 막는 역할을 하지 않는다.

우선:

1. 공간 설계
2. interaction state
3. NPC blocking
4. chapter state

순으로 자연스럽게 해결한다.

입력 자체를 무조건 잠그는 것은 마지막 수단이다.

---

# 40. CH1~8 입력 반복감 방지

공통 조작은 일관되게 유지한다.

하지만 각 챕터가 똑같이:

`NPC 클릭 → 문서 클릭 → 정답 클릭 → 도장 클릭`

만 반복되지 않도록 챕터 퍼즐이 입력 패턴을 변주할 수 있다.

예:

CH1
• 카드 비교

CH2
• 그래프/규정 자료 비교

CH3
• 기록 재생 및 calibration 자료 비교

CH4
• 신호 경로 자료 비교

CH5
• 센서 위치와 시험 기록 연결

CH6
• 실제 실험 순서 수행

CH7
• 사건 시간축 재구성

CH8
• 과거 승인 archive 검증

단, 기본 interaction 문법은 유지한다.

새 챕터마다 완전히 다른 조작법을 학습시키지 않는다.

---

# 41. CH9 입력 규칙

CH9 초반:

`FREE`

• 연구시설 이동
• 제한된 NPC 마지막 대화
• 중앙 전광판 접근

전광판 실행:

`INTERACT`

즉시:

`CINEMATIC`

그 뒤 일반 입력 차단.

첫/두 번째 결과 영상 사이에도 자유 이동 복구하지 않는다.

최종 `SUCCESS?`와 power-down 종료까지 CINEMATIC 유지.

CH10 페이지 전환 시 TRANSITION.

---

# 42. CH10 라디오 입력

라디오가 플레이어 직접 ON 방식으로 구현되는 경우:

`FREE → INTERACT`

한 번만 활성.

반복 클릭으로 방송이 처음부터 계속 재생되지 않는다.

방송이 시작된 뒤 라디오 버튼을 연타해도 story sequence가 reset되지 않는다.

방송 중 플레이어 이동은 허용 가능.

전화벨이 시작되면 라디오를 강제 끄지 않고 음량 조정만 할 수 있다.

---

# 43. CH10 전화 입력

전화벨 중:

FREE.

플레이어가 전화기를 INTERACT.

즉시 전화 answering sequence로 진입.

권장 상태 흐름:

```text
FREE
→ FOCUS
→ DIALOGUE
→ CINEMATIC
→ FREE
```

전화 대화 중:

• 이동 차단
• NEXT만 허용

마지막 대화 후:

• NEXT 잠금
• handset throw cinematic
• throw 완료 후 FREE 복구

전화기를 받는 순간 여러 번 클릭해 수화기가 중복 이동하지 않게 한다.

---

# 44. CH10 현관 입력

노크 발생 후 문 interaction 활성.

문을 열 때:

```text
FREE
→ FOCUS
→ door animation
→ FREE
```

문 animation이 진행되는 동안 추가 INTERACT 무시.

문 각도 변경 중 또 입력해서 닫히거나 뒤집히는 문제 금지.

---

# 45. CH10 상자 입력

상자:

현관 앞에서 INTERACT.

상자 pickup 완료 후 CARRY.

테이블의 valid placement zone에 접근하면 ACTION 역할을 `PLACE`로 변경.

placement 완료 후 FREE.

상자를 든 상태에서:

• 전화기
• 책
• 라디오
• 다른 작은 오브젝트

상호작용 차단.

---

# 46. CH10 상자 개봉 입력

상자 테이블 배치 후:

첫 interaction:
• 포장끈

다음:
• 뚜껑

그 뒤:
• PHOTO
• MEDAL

PHOTO와 MEDAL은 어느 순서든 가능.

POSTCARD는 두 물건 모두 처리 전까지 interaction 비활성 또는 실제 geometry로 가려 접근 불가.

단순 state lock과 실제 시각 차폐를 함께 사용한다.

---

# 47. CH10 엽서 입력

엽서 집기:

FREE
→ INSPECT

이후 다른 월드 입력 완전 차단.

첫 확인:
• flip animation

이름 등장 중:
• 추가 입력 차단

이름 전체 공개 후 일정 pause가 지나야 다음 입력 허용.

다음 입력:
• Oppenheimer profile 진입

연타로 이름 reveal을 건너뛰지 못하게 한다.

---

# 48. Final Archive 입력

각 인물:

프로필 reveal 중 입력 잠금.

읽을 수 있는 최소 시간이 지난 뒤:

`CONTINUE`

허용.

사용자가 빠르게 터치해도:

Richard → Enrico → Luis

가 한 번에 넘어가지 않는다.

각 profile 전환은 transition gate를 가진다.

---

# 49. 브라우저 focus loss

다음 이벤트 처리:

```text
window.blur
document.visibilitychange
pointercancel
```

발생 시:

• 이동 입력 zero
• joystick reset
• look pointer release
• held interaction release
• pending 일반 입력 폐기

게임 재진입 시 자동으로 FREE로 돌려버리지 않는다.

현재 playerState를 유지하되, 해당 state의 safe resume 로직을 사용한다.

예:

DIALOGUE
→ 현재 문장 유지

INSPECT
→ 조사 화면 유지

CINEMATIC
→ animation system 정책에 따라 checkpoint 복구

---

# 50. 키보드 focus와 UI

문서 viewer나 메뉴에서 텍스트 입력 필드가 생기는 경우:

WASD가 동시에 플레이어 이동으로 처리되지 않아야 한다.

`input`, `textarea`, `select`, editable element가 focus인 경우 gameplay keyboard input을 막는다.

현재 게임 기획에서는 텍스트 입력 퍼즐을 기본적으로 사용하지 않지만, 엔딩 코드 표시 후 입력 기능이 추가될 가능성을 고려한다.

---

# 51. 페이지 전환과 입력

다음 챕터 이동 함수는 user input handler 안에서 직접 여러 번 실행될 수 없게 한다.

권장:

```js
async function goToChapter(url) {
  if (transitionCommitted) return;
  transitionCommitted = true;

  setPlayerState("TRANSITION");
  clearAllHeldInputs();

  await saveSafeCheckpoint();
  await playFadeOut();

  location.href = url;
}
```

save나 fade 실패 시 처리 정책은 후속 문서에서 정의한다.

---

# 52. 뒤로가기 / 새로고침

브라우저 뒤로가기를 강제로 막는 것에 의존하지 않는다.

대신 현재 chapter state가 localStorage에 안전하게 존재해야 한다.

새로고침 시 중간 행동을 정확한 중간 프레임으로 복원하려 하지 않고 안전 checkpoint로 복구한다는 01_PLAYER 원칙을 따른다.

CONTROL은 복원 직후 모든 held input을 false로 초기화한다.

---

# 53. 전체화면

전체화면 토글은 스토리 interaction보다 우선하지 않는다.

CINEMATIC 중 전체화면 버튼을 누르는 것을 허용할지는 플랫폼 테스트 후 결정할 수 있다.

다만 fullscreen change가 playerState를 변경하거나 cinematic을 재시작해서는 안 된다.

---

# 54. 화면 방향 변경

모바일 orientation change 시:

• joystick active state reset
• look pointer reset
• layout 재계산
• playerState는 유지
• 현재 interaction이 중복 재실행되지 않음

INSPECT 중 방향 전환 후 문서가 화면 밖으로 사라지지 않아야 한다.

세부 레이아웃은 `27_MOBILE.md`.

---

# 55. 입력 에러 복구

예상하지 못한 예외로 특정 action이 실패한 경우:

• playerState를 영구 잠금 상태에 두지 않는다.
• 가능한 경우 안전 상태로 rollback.
• 디버그 로그 기록.

예:

문서 pickup 중 anchor 누락.

잘못:
→ INSPECT state로 들어갔지만 문서는 안 보이고 입력도 안 됨.

권장:
→ pickup 취소
→ document 원래/valid slot 복귀
→ FREE
→ error log

---

# 56. 디버그 입력

개발 중 다음 기능을 별도 debug mode에 둘 수 있다.

• 현재 playerState 표시
• 현재 input context
• lock reason
• active pointerId
• movement vector
• current interaction target

배포본에서는 숨긴다.

스토리 skip 키는 개발 중 사용할 수 있지만 배포본에는 남기지 않는다.

---

# 57. 입력 로깅

QA 시 재현을 위해 debug mode에서 최근 입력 로그를 제한적으로 유지할 수 있다.

예:

```text
14:02:11 INTERACT npc_richard
14:02:14 ADVANCE_DIALOGUE
14:02:16 ADVANCE_DIALOGUE
14:02:19 INTERACT document_batch
```

무한히 쌓지 말고 최근 N개만 유지.

개인정보나 사용자 키 입력 텍스트를 저장하는 용도가 아니다.

---

# 58. 성능과 입력 지연

입력 처리는 프레임당 불필요한 DOM query를 반복하지 않는다.

특히 모바일에서:

• touchmove마다 큰 layout 계산 금지
• getBoundingClientRect 반복 최소화
• raycast는 필요한 순간에만
• joystick DOM 업데이트 최소화

시각적 animation이 30~60fps 사이로 떨어져도 입력 반응은 지연되지 않게 한다.

---

# 59. 접근성 관련 기본 방향

후속 UI 문서에서 구체화하지만 CONTROL 수준에서는:

• 핵심 기능에 키보드 대체 입력 존재
• 터치 타겟이 지나치게 작지 않음
• 오디오만으로만 진행되는 필수 입력 없음
• interaction hint를 완전히 색상 하나에 의존하지 않음
• 긴 hold, double tap을 핵심 조작으로 사용하지 않음

을 유지한다.

---

# 60. CONTROL에서 금지할 구현

• DOM click listener가 직접 chapter 로직 실행
• state 검사 없이 raycast 실행
• isModal 하나로 전체 입력 상태 관리
• 더블클릭 전용 핵심 기능
• 연타로 대사 여러 줄 건너뛰기
• pointercancel 미처리
• window blur 후 이동 계속
• W를 누른 채 dialogue 진입 후 dialogue 종료 시 자동 전진
• cinematic 중 입력 queue 저장
• transition 중 location 이동 중복
• 모바일 joystick과 look pointer 혼선
• 문서 UI 뒤 월드 클릭
• 전화 대화 중 전화기를 또 집기
• 상자를 든 채 모든 월드 interaction 허용
• 엽서 이름 reveal 중 continue 연타
• Final Archive 여러 인물 스킵
• input lock 해제 누락
• 오류 발생 시 playerState 영구 LOCKED

---

# 61. 후속 문서와의 계약

## 03_CAMERA.md

반드시 본 문서의 상태별 시점 허용 규칙을 따른다.

특히:

• DIALOGUE
• FOCUS
• INSPECT
• CARRY
• CINEMATIC

의 camera freedom 범위를 구체화한다.

---

## 04_INTERACTION.md

본 문서의 중앙 입력 라우터 이후 단계에서 실제 target 판정을 수행한다.

입력 하나가 두 interaction에 전달되지 않아야 한다.

---

## 05_DIALOGUE.md

`ADVANCE_DIALOGUE` gate와 한 입력당 한 문장 원칙을 유지한다.

---

## 10_ANIMATION_CORE.md

animation 시작/완료 시 playerState와 interactionLock을 일관되게 변경해야 한다.

---

## 25_SAVE_AND_RESUME.md

복구 직후 held input을 항상 초기화하는 정책을 유지한다.

---

## 27_MOBILE.md

이 문서의 멀티터치 분리와 action semantics를 축소하지 않는다.

---

# 62. 누적 검증 체크

02_CONTROL.md 작성 완료 시점 기준:

00_INDEX.md와 상충:
없음.

01_PLAYER.md와 상충:
없음.

확정된 연결:

```text
PLAYER STATE
01_PLAYER.md
        ↓
CONTROL INPUT ROUTING
02_CONTROL.md
        ↓
CAMERA
03_CAMERA.md

INTERACTION TARGETING
04_INTERACTION.md

DIALOGUE
05_DIALOGUE.md

ANIMATION
10_ANIMATION_CORE.md
```

후속 문서는 위 흐름을 뒤집지 않는다.

<!-- MERGED SOURCE END: 02_CONTROL.md -->


================================================================================
ORIGINAL SOURCE: 03_CAMERA.md
================================================================================

# 03_CAMERA.md

# CAMERA SPECIFICATION

이 문서는 1인칭 카메라의 기본 동작, 플레이어 상태별 시점 자유도, 카메라 보간, 대화/조사/도장/시네마틱/전화/현관/상자/엽서 장면의 카메라 규칙, 벽·NPC·오브젝트 관통 방지, 모바일 시점 안정성, 시네마틱 종료 후 시점 복원 방식을 정의한다.

---

# 0. 누적 상충 검토

참조 문서:

• `00_INDEX.md`
• `01_PLAYER.md`
• `02_CONTROL.md`

---

## 0.1 00_INDEX.md와의 상충 검토

00_INDEX.md에서 `03_CAMERA.md`의 책임 범위는 다음과 같이 정의되어 있다.

• 자유 시점
• 대화 soft-lock
• 오브젝트 조사
• 문서 비교
• 도장
• NPC 연출
• cinematic
• 전광판
• 전화
• 현관
• 상자
• 엽서
• 카메라 clipping 방지
• tween 기준

본 문서는 위 범위를 구체화한다.

다음 항목은 다른 문서가 최종 책임을 가진다.

• 입력 키/터치 처리 → `02_CONTROL.md`
• 상호작용 대상 선택/Raycast → `04_INTERACTION.md`
• 대화 문장/순서 → `05_DIALOGUE.md`
• 애니메이션 실행 구조 → `10_ANIMATION_CORE.md`
• 공간 실측/통행 폭 → `17_SPATIAL_LAYOUT.md`
• 카메라와 벽/가구의 충돌 clearance 최종값 → `18_COLLISION_AND_CLEARANCE.md`
• 모바일 UI 배치 → `27_MOBILE.md`

00_INDEX.md와 직접 상충되는 사항은 없다.

---

## 0.2 01_PLAYER.md와의 상충 검토

01_PLAYER.md는 기본 1인칭을 유지하고, 다음을 요구한다.

• 평상시 3인칭 전환 금지
• 플레이어 얼굴 조기 노출 금지
• 손은 필요할 때만 등장
• FOCUS는 제한된 시점 이동 가능
• DIALOGUE는 위치 이동 차단
• INSPECT는 조사 대상 중심
• CARRY는 제한된 시점 이동
• STAMP는 종이/도장 중심
• CINEMATIC은 카메라 제어 가능
• TRANSITION은 입력 차단
• 플레이어 물리 위치와 카메라 위치를 항상 동일시하지 않음
• 가까운 장면은 물리 body를 벽 안으로 밀기보다 camera offset/focus camera 사용

본 문서는 위 원칙을 그대로 유지한다.

특히 본 문서는 close-up을 위해 플레이어 collider 자체를 벽/책상 안으로 옮기는 방식을 금지한다.

상충 없음.

---

## 0.3 02_CONTROL.md와의 상충 검토

02_CONTROL.md는 상태별 시점 입력을 다음처럼 요구한다.

`FREE`
• 자유 mouse/touch look

`FOCUS`
• 제한적 시점 이동 가능

`DIALOGUE`
• 자유 회전 금지
• 제한된 look 가능

`INSPECT`
• 카메라 회전 대신 조사 오브젝트 회전으로 재해석 가능

`STAMP`
• 자유 회전 차단

`CINEMATIC`
• 기본 차단

`CARRY`
• 제한된 시점 회전

본 문서는 이 구조를 유지한다.

또한 02_CONTROL.md는 상태 전환 시 pending look delta 폐기를 요구한다.
카메라 문서에서도 이를 전제로 한다.

상충 없음.

---

# 1. 카메라의 기본 철학

카메라는 연출을 보여주기 위한 독립된 영화 카메라가 아니라 플레이어의 시선이다.

따라서 기본 원칙은 다음과 같다.

• 1인칭 시점을 유지한다.
• 갑작스러운 3인칭 cut 금지.
• 중요한 장면에서도 플레이어가 그 자리에 서 있다는 감각을 유지한다.
• 시네마틱이 끝나면 플레이어가 원래 공간에 실제로 존재해야 한다.
• 카메라만 다른 방으로 날아갔다가 순간 복귀하는 연출을 남발하지 않는다.
• close-up은 짧고 목적이 명확해야 한다.
• 카메라 움직임은 정보 전달과 감정 호흡을 위해 사용한다.
• 카메라 자체가 연출의 주인공이 되지 않는다.

---

# 2. 기본 카메라 구조

권장 구조:

```text
playerRoot
└─ cameraRig
   └─ camera
```

필요한 경우:

```text
cameraRig
├─ yawPivot
│  └─ pitchPivot
│     └─ camera
```

플레이어의 world position과 camera local offset을 분리한다.

이 구조를 사용하면:

• 평상시 눈높이 유지
• focus 시 작은 전진/후퇴
• 도장/문서 close-up
• 전화기 근접
• CARRY 시 camera bob 조절
• cinematic 후 원위치 복구

를 플레이어 collider를 이동시키지 않고 처리할 수 있다.

---

# 3. 기본 눈높이

01_PLAYER.md 기준:

• 설계 눈높이 약 1.62~1.68m

카메라 기본 local Y는 이 범위에서 정한다.

정확한 최종값은 공간 스케일과 NPC 키가 확정된 뒤 `17_SPATIAL_LAYOUT.md`와 함께 조정한다.

원칙:

• 모든 책상/장비가 너무 낮게 느껴지지 않아야 함
• NPC와 눈높이가 비정상적으로 어긋나지 않아야 함
• 문서 조사 시 과도하게 고개를 숙이지 않아도 됨
• CH10 자택 가구가 왜소하거나 거대해 보이지 않아야 함

---

# 4. 기본 FOV

기본 1인칭 FOV는 과도하게 넓지 않게 한다.

권장 시작 범위:

```text
Desktop: 65°~72°
Mobile landscape: 68°~76°
```

정확한 값은 테스트 후 조정한다.

금지:

• 90° 이상 광각을 기본값으로 사용해 공간 왜곡
• NPC 얼굴을 가까이 볼 때 코/머리가 과장되어 보이는 FOV
• CH10 집이 실제보다 지나치게 넓어 보이는 설정

FOCUS/INSPECT/CINEMATIC에서는 FOV를 약간 좁힐 수 있다.

FOV 변화는 순간적으로 바꾸지 않고 짧게 보간한다.

---

# 5. 카메라 보간

카메라 이동은 기본적으로 tween을 사용한다.

권장 범위:

짧은 focus:
`0.25~0.45s`

대화 framing:
`0.35~0.65s`

문서/도장 close-up:
`0.35~0.75s`

현관/전화:
`0.4~0.8s`

시네마틱 큰 이동:
`0.7~1.5s`

중요:

같은 장면에서 위치, 회전, FOV를 서로 다른 종료시점으로 무작정 움직이지 않는다.

연출 목적에 맞춰 동기화한다.

예:

카메라 이동 0.5s
FOV 변화 0.5s
look target 회전 0.5s

---

# 6. easing 원칙

카메라는 기계 부품처럼 linear하게 움직이지 않는다.

권장:

• easeOutCubic
• easeInOutCubic
• smoothstep 계열

빠르게 목표를 잡고 부드럽게 멈추는 움직임을 기본으로 한다.

금지:

• 강한 bounce
• elastic
• overshoot
• 장난스러운 spring

예외:

CH9 폭발 충격 시 아주 짧은 camera impulse 가능.

---

# 7. 카메라 흔들림

평상시 과도한 head bob 금지.

이 게임은 FPS 액션이 아니다.

걷기 시:

• 아주 작은 수직 움직임
• 아주 작은 횡방향 sway

정도만 허용.

목표:

움직이고 있다는 감각은 주되 문서를 읽거나 NPC를 볼 때 멀미를 유발하지 않는다.

FOCUS/DIALOGUE/INSPECT/CARRY에서는 bob 강도를 낮추거나 제거한다.

---

# 8. FREE 상태 카메라

허용:

• yaw 자유 회전
• pitch 제한 내 자유 회전
• 일반적인 걷기 bob

pitch 권장 범위:

```text
약 -75° ~ +75°
```

완전 수직 90°까지 허용하면 천장/발밑에서 geometry clipping이 더 자주 발생할 수 있다.

정확한 제한은 테스트 후 조정.

---

# 9. FREE 상태에서 벽 접근

플레이어 collider가 벽에 닿아도 camera near plane이 벽을 뚫지 않아야 한다.

필요한 방식:

• player collider radius 확보
• camera forward offset 제한
• near plane 최소화만으로 해결하려 하지 않음

벽에 얼굴을 붙였을 때 반대편 방이 보이는 문제를 절대 허용하지 않는다.

---

# 10. FOCUS 상태 카메라

FOCUS는 강제 시네마틱보다 약한 시선 유도다.

예:

• Richard가 처음 서류를 내밀 때
• 계측기의 이상 파형을 처음 보여줄 때
• CH10 노크 후 문 방향 유도

FOCUS 진입:

1. 현재 yaw/pitch 저장
2. 목표 방향으로 부드럽게 회전
3. 필요하면 FOV 약간 축소
4. 제한된 look freedom 허용

FOCUS 중 플레이어가 완전히 다른 방향으로 돌아서 핵심 장면을 놓치지 않게 한다.

권장 look cone:

```text
horizontal ±15°~25°
vertical ±10°~18°
```

구체 수치는 장면별 override 가능.

---

# 11. FOCUS 종료

FOCUS가 끝났다고 카메라를 무조건 이전 yaw/pitch로 되돌리지 않는다.

왜냐하면 플레이어가 focus 중 약간 시점을 움직였을 수 있기 때문이다.

권장:

• 종료 시 현재 look을 새 기준으로 사용
• 단, focus 때문에 camera local offset/FOV가 바뀌었다면 기본값으로 부드럽게 복귀

즉 orientation은 자연스럽게 유지하고 rig offset만 원복.

---

# 12. DIALOGUE 상태 카메라

대화는 NPC 얼굴만 확대하는 인터뷰 화면이 아니다.

기본 구도는 다음 세 요소를 가능한 한 함께 본다.

• NPC 얼굴/상체
• 손
• 현재 대화의 핵심 오브젝트

예:

Richard가 계산철을 내미는 장면:

화면 중앙 상단:
Richard 얼굴

중앙 하단:
계산철

옆:
책상 일부

이렇게 해야 “대사 + 행동”이 함께 보인다.

---

# 13. 대화 거리

NPC가 너무 가까워 얼굴 mesh 내부가 보이지 않게 한다.

권장 대화 거리 기준:

약 1.4~1.8m.

정확한 값은 NPC 스케일과 FOV에 따라 `09_NPC_BLOCKING.md`와 함께 확정.

1m 이하에 계속 서 있는 대화는 피한다.

---

# 14. 대화 중 카메라 자유도

DIALOGUE에서는 완전 고정과 완전 자유 사이.

기본:

• yaw 약간 허용
• pitch 약간 허용
• 위치 이동 금지

플레이어가 NPC 얼굴에서 손/서류로 약간 시선을 옮길 수 있어야 한다.

하지만 180° 뒤돌기 금지.

장면별로:

`dialogueLookTarget`
`dialogueLookCone`

을 정의한다.

---

# 15. 대화 중 NPC 이동

NPC가 말하면서 약간 위치를 바꾸는 경우 카메라가 강제로 순간 추적하지 않는다.

가능한 방식:

• target object를 따라 부드럽게 갱신
• 작은 움직임은 플레이어가 직접 시선으로 따라갈 수 있게 둠
• 큰 이동이 필요한 경우 DIALOGUE → FOCUS/CINEMATIC 전환

카메라가 NPC를 lock-on 게임처럼 정확히 추적하는 느낌을 피한다.

---

# 16. INSPECT 상태 카메라

문서/사진/메달/엽서 조사 시 카메라는 안정적이어야 한다.

권장:

• player physical body는 그대로
• camera rig local offset으로 조사 anchor 근접
• 대상은 inspect anchor로 이동
• FOV 소폭 축소
• head bob 제거
• camera shake 제거

핵심:

카메라와 오브젝트 사이에 다른 geometry가 끼지 않게 한다.

---

# 17. INSPECT anchor

각 조사 대상은 카메라에 직접 붙이는 것이 아니라 안정적인 inspect anchor를 사용한다.

예:

```text
camera
└─ inspectAnchor
```

또는 world-space inspection rig.

오브젝트가 카메라 near plane을 침범하지 않게 충분한 거리 확보.

문서 크기에 따라 anchor 거리를 조정한다.

---

# 18. 문서 조사 거리

문서 텍스트를 읽기 위해 카메라를 지나치게 가까이 가져오지 않는다.

우선:

• 텍스처 해상도 확보
• 적절한 문서 크기
• 적절한 FOV

를 사용한다.

카메라가 종이에 거의 붙어서 픽셀/geometry clipping이 발생하는 방식 금지.

---

# 19. 문서 앞뒤 뒤집기

문서를 뒤집을 때 카메라는 고정하고 문서만 회전하는 것을 기본으로 한다.

이유:

• 멀미 감소
• 텍스트 집중
• 모바일 안정성

뒤집기 중 camera orbit 금지.

---

# 20. 문서 두 장 비교

두 자료를 비교할 때 카메라는 중앙에 고정.

좌/우에 문서를 배치.

권장 화면 점유:

```text
LEFT DOCUMENT     RIGHT DOCUMENT
```

둘 다 한 화면에 주요 정보가 보이게.

글자가 너무 작아질 경우:

• 문서 크기 조정
• 핵심 영역 확대 모드
• 플레이어가 좌/우 focus 전환

가능.

단, 자동으로 모순 부분에 카메라가 zoom해서 정답을 알려주지 않는다.

---

# 21. STAMP 카메라

STAMP는 반복되는 핵심 의식이다.

기본 구도:

• 종이 전체의 핵심 영역
• 도장
• 플레이어 손
• 필요하면 NPC의 손/몸 일부

카메라가 종이 정중앙 위에서 수직으로만 내려다보는 UI 같은 구도보다 약간의 1인칭 사선 시점을 권장한다.

예:

pitch 약 -35°~-50° 범위의 자연스러운 책상 시점.

정확한 값은 `14_STAMP.md`와 장면별 문서에서 확정.

---

# 22. 도장 타격 순간

도장이 내려찍히는 순간 카메라를 크게 흔들지 않는다.

가능:

• 아주 작은 1~2px 상당 impulse
• 미세한 FOV/position recoil

핵심 충격감은:

• 도장 속도
• 종이 반응
• 사운드

로 만든다.

과도한 화면 shake는 금지.

---

# 23. CARRY 카메라

상자 같은 큰 물체를 들면 카메라가 물체 위에 붙지 않는다.

상자는 화면 하단 25~35% 정도를 차지하는 수준을 권장.

핵심 시야 중앙과 문틀이 보여야 한다.

CARRY 중:

• FOV 기본 유지 또는 아주 소폭 확대
• head bob 약화
• pitch 하향 제한을 조금 줄일 수 있음

상자를 든 채 바닥만 보고 걷는 불편을 방지한다.

---

# 24. CARRY 시 카메라와 상자 충돌

camera는 벽을 통과하지 않더라도 상자가 벽을 관통할 수 있다.

따라서 carry object의 예상 world bounds도 함께 고려해야 한다.

카메라 문서의 요구:

• 카메라 방향이 급격히 벽 쪽으로 돌아갈 때 carry object가 벽을 뚫지 않도록 yaw 제한 또는 carry offset 조정 필요
• 좁은 문 통과 시 상자가 자동으로 몸 중앙에 정렬될 수 있음

최종 collision 처리는 `18_COLLISION_AND_CLEARANCE.md`.

---

# 25. CINEMATIC 카메라

CINEMATIC에서도 기본적으로 플레이어의 위치감을 유지한다.

사용 가능한 방식:

A. 카메라 rig만 짧게 이동
B. 플레이어 자리에서 자동 회전
C. close-up 후 원위치
D. 같은 공간 내 predetermined path

금지에 가까운 방식:

• 플레이어와 무관한 공중 드론샷
• 천장 위에서 내려다보는 3인칭 샷
• NPC만 따로 따라가는 외부 카메라
• 갑자기 다른 방으로 컷

예외적으로 CH9 전광판 내부 영상은 “플레이어 카메라”가 아니라 전광판 콘텐츠이므로 자유로운 영상 연출 가능.

---

# 26. 시네마틱 시작 전 저장값

CINEMATIC 진입 시 최소 저장:

```text
baseWorldPosition
baseYaw
basePitch
baseFov
baseCameraOffset
```

연출 종료 후 무조건 정확히 이 값으로 snap할 필요는 없다.

하지만 복원 가능한 기준점이 있어야 한다.

---

# 27. 시네마틱 종료 후 복원

우선순위:

1. 현재 플레이어 world 위치 안전성
2. 자연스러운 시야
3. 원래 시점 연속성

예:

NPC가 연출 중 플레이어 앞을 지나갔다면 원래 yaw를 그대로 복원했을 때 NPC 등 뒤를 바로 보게 될 수 있다.

이 경우 연출 종료 위치에 맞는 natural release orientation을 사용한다.

단, 갑자기 90° 다른 방향으로 튀는 느낌은 금지.

---

# 28. CH1~8 수정 몽타주 카메라

수정 작업 몽타주는 각 챕터마다 변주한다.

카메라 원칙:

• 너무 많은 컷 금지
• 2~5개의 짧은 shot
• shot당 약 0.8~2.0초
• 해당 연구자의 작업 방식이 보이게
• 시설 변화가 느껴지게

예:

CH1 Richard:
계산기 → 카드 → 밤샘 작업

CH5 George:
재료 운반 → 시험 장비 → George 피로 → 재시험

몽타주가 끝나면 플레이어가 다시 공간 안에 서 있는 상태로 복귀.

---

# 29. CH8 다인원 카메라

8명의 NPC가 모이는 장면에서 모두를 한 화면에 우겨넣지 않는다.

기본:

• Hans 중심
• 주변 인물은 peripheral composition
• Hans가 각 이름을 언급할 때 해당 NPC 쪽으로 작은 시선 이동 가능
• 플레이어의 이동은 제한하되 사람들 사이를 관통하지 않음

최종 APPROVED 순간에는:

• 보고서/도장
• 전방의 Hans
• 주변 인물 일부

가 함께 느껴지는 구도를 우선.

8명 모두 얼굴을 한 프레임에 보여주는 것은 필수가 아니다.

---

# 30. CH9 전광판 접근

CH9에서 플레이어는 직접 전광판 앞으로 걸어간다.

`VIEW RESULTS`를 실행할 수 있는 standing zone을 미리 확보한다.

전광판 실행 시:

1. 플레이어 이동 잠금
2. 카메라가 화면 중심으로 약간 정렬
3. FOV 소폭 축소
4. 전광판이 충분히 크게 보이도록 rig offset 조정
5. NPC들이 주변 시야에 일부 남게 함

전광판을 full-screen overlay로 바꿔 시설이 완전히 사라지는 방식은 피한다.

가능하면 플레이어가 “시설 안에서 전광판을 보고 있다”는 감각을 유지한다.

---

# 31. CH9 전광판 화면 비율

전광판 cinematic 내용은 카메라 화면 전체가 아니라 실제 3D 전광판 안에서 재생되는 것이 우선.

따라서:

• 화면이 너무 작아 내용을 못 읽지 않게
• 플레이어 standing zone과 display 크기를 충분히 확보
• mobile에서도 전광판이 가독 가능하도록 카메라 위치 자동 보정

필요한 경우 CH9에 한해서 전광판 영역을 카메라 프레임의 65~80% 수준까지 차지하게 할 수 있다.

---

# 32. CH9 백색 섬광

폭발 섬광 시:

• 전광판 emissive 증가
• scene exposure/light 증가
• camera bloom 또는 overlay white

가능.

카메라 위치 자체를 크게 흔들지 않는다.

섬광 후 잠시 시야가 회복되는 느낌을 줄 수 있다.

중요:

플래시가 끝난 뒤 exposure가 원래 값으로 정확히 복원되어야 한다.

---

# 33. CH9 NPC 반응 관찰

첫 번째 결과 후 카메라를 자동으로 각 NPC 얼굴에 하나씩 돌리는 방식은 피한다.

대신 전광판 중심 구도 안에서 주변 반응이 보이게 blocking한다.

필요하다면 첫 결과와 두 번째 결과 사이 짧게:

• George가 시선을 돌리는 움직임
• Luis가 뒤로 한 걸음
• Kenneth가 앉는 움직임

이 자연스럽게 주변부에서 보이게 한다.

Hans가 플레이어를 보는 순간만 짧은 시선 유도 가능.

---

# 34. CH9 SUCCESS?

최종 `SUCCESS?` 장면에서 카메라는 거의 움직이지 않는다.

정적이 중요하다.

전광판:
`SUCCESS`
→ glitch
→ `SUCCESS_`
→ `SUCCESS?`

그 사이 camera push-in을 넣지 않는다.

시스템 자체의 변화로 보이게 한다.

---

# 35. CH9 power-down

조명이 꺼질 때 카메라가 어두운 공간에서 방황하지 않게 한다.

CINEMATIC 유지.

전광판과 주변 조명이 순차적으로 사라진다.

마지막에는 완전 black.

blackout 후 바로 player control을 돌려주지 않는다.

TRANSITION으로 CH10 이동.

---

# 36. CH10 시작 카메라

CH10은 따뜻한 자택.

첫 fade-in에서 카메라는 편안한 인간 눈높이.

연구시설보다 FOV를 과도하게 바꾸지 않는다.

공간이 따뜻하게 느껴져야지 광각으로 넓어 보이게 하지 않는다.

시작 시:

• 라디오
• 책장
• 거실 일부

가 자연스럽게 시야에 들어오도록 배치.

하지만 전화기/현관/상자의 존재를 한 화면에 모두 노출시키지 않는다.

---

# 37. CH10 라디오

라디오 방송 중 카메라 자유 이동 허용.

라디오를 켤 때만 짧은 FOCUS 가능.

방송이 시작된 뒤 카메라를 라디오에 고정하지 않는다.

플레이어가 집을 둘러보게 한다.

---

# 38. CH10 전화벨

전화벨이 울릴 때 카메라를 자동으로 전화기로 snap하지 않는다.

가능:

• 아주 약한 FOCUS cue
• 전화기 indicator
• 소리 방향

플레이어가 직접 전화기를 찾게 한다.

첫 벨:
자유.

두 번째 벨:
필요하면 아주 작은 시선 유도.

---

# 39. 전화 받기 카메라

전화기 interaction:

1. 카메라가 전화기 쪽으로 약간 이동
2. 전화기 base와 handset이 모두 보이는 구도
3. 손이 들어옴
4. handset pickup
5. DIALOGUE 상태

수화기를 귀 바로 옆에 붙이는 실사 연출보다, 화면 한쪽에 수화기가 보이고 전화기 base도 일부 보이는 구도를 권장.

이유:

• 플레이어 행동을 보여줄 수 있음
• throw 연출로 자연스럽게 연결 가능

---

# 40. 전화 대화 중 카메라

전화 대화 동안 카메라를 완전히 고정하지 않는다.

아주 작은 look freedom 허용 가능.

그러나:

• 전화기를 화면에서 완전히 놓치지 않음
• 집 안 다른 오브젝트를 조사할 수 없음
• 현관으로 돌아볼 수 없음

대화의 정적을 위해 camera bob/shake 제거.

---

# 41. 수화기 투척 카메라

수화기 투척은 1인칭 유지.

카메라 동작:

1. 수화기를 base 쪽으로 내려가는 움직임을 따라 약간 하향
2. 멈춤
3. 수화기가 옆으로 움직일 때 카메라는 완전히 따라가지 않음
4. 충돌 순간 작은 시선 반응 가능
5. 수화기가 바닥/낮은 위치에 떨어진 후 그 위치를 잠깐 바라봄

카메라가 수화기를 끝까지 추적해 바닥을 정면으로 보는 과장된 액션 연출은 피한다.

---

# 42. 수화기 투척 후

바닥 수화기에서 목소리가 이어질 때 카메라는 약간 아래를 보고 있는 상태.

몇 초 후 control 복구.

플레이어가 직접 시선을 들 수 있다.

노크는 이후 발생.

---

# 43. CH10 현관 접근

노크 발생 시 카메라 자동 이동 금지.

플레이어 직접 이동.

문 interaction 시:

FOCUS.

구도:

• 손잡이
• 문 일부
• 바닥/문틀
• 열릴 공간

이 보이게.

문 바로 앞에 카메라가 붙어 door panel을 뚫지 않게 한다.

---

# 44. 문 열기 카메라

문손잡이 조작:

• 약간 하향
• 손 등장

문 열림:

• 카메라가 아주 조금 뒤로 물러날 수 있음
• 문 회전 궤도를 피함
• 외부 빛이 자연스럽게 들어옴

문이 열리는 동안 카메라가 문과 함께 회전하지 않는다.

플레이어는 제자리에서 문이 열리는 것을 본다.

---

# 45. 상자 최초 노출

문이 충분히 열린 후에야 상자가 시야에 들어오게 한다.

상자가 문 뒤나 경첩에 가려지지 않음.

상자 외부의 라벨은 읽을 수 있지만 Oppenheimer 이름은 없음.

카메라가 상자보다 너무 높은 각도여서 내부가 보이는 문제 없음.

---

# 46. 상자 운반 카메라

상자 pickup 시:

• 카메라가 살짝 하향
• 양손/상자 등장
• 상자가 하단에 안정적으로 위치

이후 CARRY.

집 안으로 들어오며 camera clipping 검사.

문틀과 상자 둘 다 보이도록 FOV/offset 조정.

---

# 47. 상자 테이블 배치

테이블에 놓을 때:

• 카메라가 아래쪽으로 약간 이동
• placement slot을 자연스럽게 바라봄
• 상자가 내려감
• 작은 camera settle

상자가 놓인 후 camera는 기본 눈높이로 즉시 튀지 않고 0.3~0.5s 정도로 복귀.

---

# 48. 상자 개봉 카메라

상자 개봉은 INSPECT에 가까운 FOCUS/INSPECT 상태.

구도:

• 상자 전체
• 뚜껑 hinge
• 포장끈
• 내부 물건

첫 단계:
끈.

두 번째:
뚜껑.

뚜껑이 열릴 때 camera가 뚜껑 rotation path 안에 있으면 안 된다.

---

# 49. 상자 내부 가시성

상자 안 물건은 플레이어가 자연스럽게 내려다봤을 때 보인다.

그러나 엽서의 이름 부분은 사진/메달 아래에 가려져야 한다.

카메라가 너무 높은 top-down view가 되면 아래 엽서가 미리 보일 수 있으므로 금지.

권장:
사선 35°~50° 정도의 자연스러운 테이블 시점.

---

# 50. 사진 조사 카메라

사진 pickup:

• 사진이 inspect anchor로 이동
• background dim
• camera 고정
• 사진 앞면 확인

flip:
사진만 회전.

뒤:
`HIROSHIMA`
`AUGUST 1945`

다시 터치:
사진이 테이블 지정 slot로 내려감.

카메라가 내려놓는 위치를 짧게 따라볼 수 있지만 과도하게 이동하지 않는다.

---

# 51. 메달 조사 카메라

메달은 작으므로 사진보다 약간 가까운 inspect 거리.

하지만 near plane을 침범하지 않음.

메달 rotation은 카메라 고정.

광원 반사가 글자를 날리지 않도록 camera/light angle 고려.

뒤집은 뒤 `FOR DISTINGUISHED SERVICE`가 읽혀야 한다.

---

# 52. 엽서 발견 카메라

사진과 메달 제거 후 카메라가 자동 zoom하지 않는다.

플레이어가 상자 안에서 엽서를 스스로 발견해야 한다.

단, 현재 시선이 너무 벗어나 있다면 아주 약한 focus cue 가능.

`NEW ITEM`식 zoom-in 금지.

---

# 53. 엽서 pickup

엽서 interaction:

FREE 또는 INSPECT-ready
→ INSPECT

카메라가 배경에서 서서히 분리.

집 조명 dim.

엽서가 inspect anchor로 이동.

손이 카드 가장자리만 잡는다.

이름이 나올 영역을 손이 가리지 않는다.

---

# 54. 엽서 flip

엽서 뒤집기:

• 카메라 고정
• 엽서 자체 rotation
• 속도 느림
• 종이 옆면이 잠시 보임

회전 완료 전 이름 등장 금지.

회전 완료 후:

`TO.`

→

`J. ROBERT`

→

`OPPENHEIMER`

순차 등장.

---

# 55. 이름 공개 카메라

이름 reveal 동안:

• camera shake 없음
• FOV 변화 없음
• 추가 zoom 없음
• 배경 motion 없음

이름 자체가 중심이 되게 한다.

과한 연출을 줄인다.

---

# 56. Oppenheimer profile 전환

플레이어 continue 후:

• 엽서가 아주 천천히 아래 또는 뒤로 이동
• 배경이 완전 black
• 2D profile layer 등장 가능

이 시점부터 3D world 카메라가 실질적으로 보이지 않아도 된다.

단, player state는 CINEMATIC/ARCHIVE 흐름 안에서 명확히 유지.

---

# 57. Final Archive 카메라

Final Archive는 2D cinematic layer 중심.

각 인물 profile 사이에 1초 flashback이 들어간다면:

• 과거 scene을 다시 1인칭 또는 stylized freeze frame으로 보여줌
• 3인칭 플레이어 모습은 사용하지 않음

flashback 후 다시 profile card.

---

# 58. 카메라 clipping 방지 원칙

카메라 clipping은 단순 near plane 설정 문제로 보지 않는다.

검사 대상:

• 벽
• 문
• NPC 머리
• 책상
• 상자 뚜껑
• 문서
• 손
• carry object

카메라 이동 전에 target pose가 유효한지 검사한다.

유효하지 않으면:

• offset 축소
• FOV 조정
• target point 변경

을 사용한다.

벽 안으로 그대로 tween 금지.

---

# 59. 카메라 safe pose

모든 주요 연출은 `cameraSafePose`를 가진다.

예:

```text
dialogue_pose_richard
stamp_pose_desk
phone_pose
frontdoor_pose
parcel_pose
postcard_pose
```

각 pose는:

• position offset
• look target
• FOV
• clearance
• allowed look cone

을 포함할 수 있다.

장면마다 임의 좌표를 코드에 흩어놓지 않는다.

---

# 60. 카메라 경로 검사

큰 카메라 이동은 시작점과 끝점만 안전하면 충분하지 않다.

중간 경로가 벽을 통과할 수 있다.

따라서:

• 직선 tween이 벽을 통과하는지 확인
• 필요하면 2~3 segment path 사용

예:

책상 옆에서 전화 close-up:

직선 이동이 램프를 통과한다면

현재 위치
→ 약간 뒤
→ 전화기 focus

순으로.

---

# 61. NPC 머리 관통 방지

대화 중 NPC가 예상보다 앞으로 움직여 camera와 겹치지 않게 한다.

NPC blocking과 camera 모두 방어.

• NPC 최소 conversation distance
• camera forward offset 제한
• NPC root가 player camera safe radius 안으로 진입 금지

최종 수치는 `09_NPC_BLOCKING.md`와 `18_COLLISION_AND_CLEARANCE.md`.

---

# 62. 손 관통 방지

손이 카메라 near plane을 통과하면 손목/손바닥이 잘릴 수 있다.

따라서 손 animation의 camera-local Z 범위를 제한한다.

오브젝트를 보여주기 위해 손을 너무 가까이 가져오기보다:

• 손은 적당한 거리
• 오브젝트 scale/inspect anchor 조정

사용.

---

# 63. z-fighting과 카메라

문서 위 도장 잉크나 카드 레이어는 카메라가 가까울수록 z-fighting이 심해질 수 있다.

camera near plane을 극단적으로 줄여 해결하지 않는다.

오브젝트 geometry offset/material polygonOffset 등은 후속 Object/Document 문서에서 처리.

카메라는 정상적인 관찰 거리 유지.

---

# 64. 카메라와 문 회전

문 열기 전:

• camera가 문 panel 앞에 너무 가까이 있지 않음
• door sweep path 밖

문 열림 중:

• camera 자동 회전 최소
• 문이 camera를 통과하지 않음
• player가 문 뒤에 끼이지 않음

이 문제는 `18_COLLISION_AND_CLEARANCE.md`와 함께 검증.

---

# 65. 카메라와 조명

close-up에서 조명이 갑자기 과노출/암전되지 않게 한다.

특히:

• CRT 근접
• 메달
• 엽서
• 전광판 white flash

카메라가 emissive object에 가까워졌다고 전체 scene exposure가 자동으로 무너지는 효과는 피한다.

auto exposure를 쓰지 않거나 통제한다.

---

# 66. 모바일 카메라 기본 원칙

모바일에서는 손가락 드래그가 카메라 회전.

문제:

• 작은 화면
• 높은 DPI
• 터치 미세 떨림
• 빠른 yaw

따라서:

• 감도 별도 조정
• 작은 dead zone
• acceleration 최소화
• look delta smoothing

가능.

정확한 값은 `27_MOBILE.md`.

---

# 67. 모바일 FOCUS/DIALOGUE

모바일에서도 PC와 동일한 look cone 원칙.

다만 화면이 좁아 NPC 얼굴과 서류를 동시에 넣기 어려울 수 있다.

해결 순서:

1. camera distance 조금 증가
2. FOV 약간 확대
3. framing 재배치

NPC와 문서를 화면에 넣기 위해 카메라를 벽 뒤로 이동시키는 방식 금지.

---

# 68. 모바일 INSPECT

문서 읽기 시 텍스트가 너무 작다면 카메라를 과도하게 가까이 하는 대신:

• 문서 UI scaling
• 확대 mode
• pinch zoom을 선택적으로 제공

가능.

pinch zoom이 도입되면 `02_CONTROL.md`와 `27_MOBILE.md`에서 추가 검토 필요.

현재는 필수 기능으로 확정하지 않는다.

---

# 69. 모바일 orientation change

orientation 변경 후:

• projection matrix 갱신
• aspect 갱신
• 현재 FOV 정책 재적용
• inspect anchor 재배치
• dialog framing 재계산

카메라가 이전 화면 비율 기준 위치에 남아 UI나 오브젝트가 잘리는 문제 금지.

---

# 70. 카메라와 성능

매 frame 모든 벽에 대해 복잡한 camera collision raycast를 수행하지 않는다.

가능한 방식:

• player collider로 1차 방어
• focus/cinematic 이동 전 path 검사
• 특정 좁은 구역에서만 추가 camera clearance

과도한 연산으로 모바일 frame을 희생하지 않는다.

---

# 71. 카메라 상태 데이터

권장 데이터:

```text
mode
baseFov
currentFov
targetFov

yaw
pitch

localOffset

lookTarget
lookCone

isTweening
activePoseId

savedFreeView
```

카메라 모드를 playerState와 완전히 별개의 상태 머신으로 만들지 않는다.

playerState가 상위 의미를 갖고 camera mode는 그 안의 표현을 담당한다.

---

# 72. 카메라 제어 API

권장 함수:

```js
setCameraMode(mode)

focusCamera(poseId)
releaseCameraFocus()

tweenCameraTo(pose, duration)

setLookTarget(target)
setLookCone(horizontal, vertical)

restoreFreeCamera()

shakeCamera(profile)
```

장면별 코드에서 camera.position을 직접 마구 수정하지 않는다.

---

# 73. 카메라 pose 데이터 구조

예:

```js
CAMERA_POSES.phone = {
  offset: { x: 0.12, y: -0.08, z: -0.32 },
  fov: 60,
  lookTarget: "phone_base",
  cone: { yaw: 14, pitch: 10 },
  clearanceRadius: 0.18
};
```

숫자는 예시.

실제 수치는 공간 문서와 장면별 테스트 후 확정.

---

# 74. 상태별 카메라 요약

```text
FREE
자유 이동/시점

FOCUS
위치 고정, 제한 시점

DIALOGUE
위치 고정, NPC 중심 제한 시점

INSPECT
위치 고정, 카메라 안정, 오브젝트 조작 중심

CARRY
이동 가능, 시점 제한 완화, carry object 고려

STAMP
카메라 고정/soft focus

CINEMATIC
자동 제어

LOCKED
입력 없음, 카메라 기본 유지

TRANSITION
fade 상태, 카메라 입력 없음
```

---

# 75. 카메라 복구 실패 방지

다음 버그를 예상한다.

• 대화 끝났는데 FOV가 좁은 채 유지
• 문서 조사 후 camera offset이 남음
• 도장 후 pitch가 책상 쪽으로 고정
• 전화 투척 후 바닥만 봄
• 문 열기 후 카메라가 focus lock 상태
• CH9 flash 후 exposure/FOV 미복구
• orientation change 후 camera crop
• focus loss 후 camera tween 중단

모든 camera sequence는 종료 시 명시적인 release 단계를 가진다.

---

# 76. 카메라 tween 중 focus loss

브라우저 focus loss 시 tween이 시간 기반으로 계속 진행될 수 있다.

복귀 시 이미 끝난 경우:

• 최종 pose로 snap 가능

진행 중인 경우:

• delta time 폭주 방지
• 남은 시간을 정상화

카메라가 중간 벽 안 위치에서 멈추지 않게 한다.

---

# 77. 카메라 tween 중 오브젝트 이동

look target이 움직이는 NPC라면:

• world target을 매 frame 갱신 가능

하지만 camera position path는 매 frame 재계산해서 흔들리지 않게 한다.

NPC가 갑자기 경로를 바꾸면 camera가 급회전하지 않게 target smoothing 사용.

---

# 78. 프레이밍 우선순위

장면에서 동시에 모든 것을 보여주려 하지 않는다.

우선순위:

1. 현재 행동의 원인
2. NPC 반응
3. 핵심 오브젝트
4. 배경 정보

예:

George 반려:

• 도장/문서
• George 손/몸 반응
• 얼굴

순으로 필요한 순간마다 focus 이동.

처음부터 세 요소를 모두 억지로 한 프레임에 넣지 않는다.

---

# 79. 카메라와 반복 연출

REJECTED가 8번 있다고 매번 동일한 camera path를 사용하지 않는다.

공통 문법은 유지하되 변주.

예:

CH1
책상 close-up 중심.

CH5
George의 반응을 더 오래 보여줌.

CH6
조용하고 짧음.

CH7
Kenneth가 한숨 쉬는 공간을 포함.

CH8
다인원 긴장 속 최종 반려.

세부는 각 챕터 CAMERA.md.

---

# 80. 카메라로 스포일러 방지

카메라가 우연히 비공개 정보를 보여주지 않도록 한다.

예:

• CH10 상자 내부 엽서를 문 열기 전에 볼 수 있는 각도 금지
• 상자 운반 중 뒤집혀 이름 면 노출 금지
• Final Archive 전 실제 성이 적힌 문서 texture를 close-up하지 않음
• CH1~8에서 무기 도면이 화면 배경에 들어오지 않음

카메라 설계도 spoiler control의 일부다.

---

# 81. 카메라로 퍼즐 정답을 알려주지 않기

카메라가 핵심 오류 위치를 자동 zoom하면 사실상 정답 힌트가 된다.

따라서:

• 조사 시작 시 문서 전체를 보여줌
• 사용자가 비교하도록 함
• 오류를 찾은 뒤 지적 장면에서만 해당 부분 focus 가능

즉 발견 전과 발견 후 카메라 역할을 구분한다.

---

# 82. 카메라와 환경 서사

자유 이동 시 카메라 높이/시야 때문에 중요한 환경 서사가 항상 놓치지 않게 공간 설계와 함께 본다.

예:

• 벽 일정표는 너무 높지 않게
• 책상 위 개인 물건은 플레이어 시야에서 자연스럽게 보임
• CH8 시설 변화는 주요 동선에서 보임

카메라가 일부러 모든 소품을 보여주러 돌아다니지는 않는다.

환경이 플레이어의 자연 시야에 들어오게 설계한다.

---

# 83. 카메라와 NPC 시선

NPC가 플레이어를 바라본다는 것은 camera 자체를 따라본다는 의미로 구현 가능.

하지만 NPC head tracking이 camera 움직임을 1:1 즉시 따라가면 기계적으로 보인다.

NPC gaze smoothing은 `08_NPC_GESTURE.md`.

카메라 문서에서는 NPC가 바라볼 기준점을 player camera 또는 chest/head anchor로 일관되게 제공해야 한다.

---

# 84. 카메라와 그림자

1인칭에서 플레이어 손이나 camera rig가 이상한 shadow를 만들지 않게 한다.

손 mesh가 카메라 근처에서 거대한 그림자를 벽에 드리우는 문제를 테스트한다.

필요하면 1인칭 손은 shadow casting을 제한.

세부는 Visual/Lighting 문서.

---

# 85. 카메라에서의 오브젝트 scale 검증

실제 world scale이 맞아도 카메라에서는 왜곡되어 보일 수 있다.

각 중요 오브젝트:

• 종이
• 도장
• 전화
• 상자
• 사진
• 메달
• 엽서

는 실제 interaction pose에서 크기를 검증한다.

월드 전체 샷만 보고 크기를 확정하지 않는다.

---

# 86. 카메라 QA 시뮬레이션

각 장면에서 최소 다음을 테스트한다.

• 플레이어가 목표보다 30cm 왼쪽에 서 있음
• 30cm 오른쪽
• 약간 뒤
• 최대 허용 pitch로 위/아래를 봄
• 모바일 좁은 화면
• NPC가 animation 끝 위치에 있음
• 다른 오브젝트가 주변에 있음

카메라 연출이 특정 완벽한 시작 위치에서만 작동하면 실패다.

FOCUS 진입 전에 필요하면 player pose normalization을 아주 작게 수행할 수 있다.

---

# 87. player pose normalization

중요 연출 시작 시 플레이어가 너무 비정상적인 위치/방향이라면:

• 10~30cm 수준의 작은 보정
• 짧은 yaw 정렬

가능.

단:

• 순간이동 금지
• 1m 이상 자동 이동 금지
• 벽을 가로질러 보정 금지

큰 위치 조정이 필요하다면 애초에 interaction zone 설계가 잘못된 것이다.

---

# 88. 카메라와 interaction zone

중요 오브젝트는 `보기 좋은 위치`가 아니라 `연출 시작하기 좋은 interaction zone`을 함께 가진다.

예:

전화:
전화기 바로 앞 40cm가 아니라 약 0.8~1.0m 거리에서 interaction 가능.

상자:
너무 가까이 붙어 camera가 상자 내부를 뚫지 않게.

도장:
책상에 지나치게 밀착하지 않아도 interaction 가능.

정확한 거리 값은 `04_INTERACTION.md`.

---

# 89. 카메라와 오디오 방향성

카메라 yaw는 spatial audio listener 방향에도 영향을 줄 수 있다.

CH10 전화/노크/라디오에서 카메라가 강제로 엉뚱한 방향을 보는 경우 소리 위치가 부자연스러울 수 있다.

따라서 camera cue와 audio cue를 함께 검토.

세부는 `21_AUDIO.md`.

---

# 90. 카메라와 CH6 야간

CH6는 어두운 계측실.

카메라가 너무 어두워 퍼즐 정보가 안 보이면 실패.

시야 방향에 따라 중요한 자료가 완전히 black이 되지 않게 local task lighting을 사용.

플레이어 flashlight를 새로 추가하는 방식은 기본적으로 피한다.

---

# 91. 카메라와 CH7 경보

경보 중 카메라 shake를 넣지 않는다.

긴박감은:

• 조명
• NPC 이동
• 사운드

로 만든다.

플레이어 시점이 흔들리면 이동/관찰이 불편해진다.

---

# 92. 카메라와 CH8 성공

CH8 100% 성공 장면은 공포 연출이 아니다.

카메라:

• 안정적
• 약간 넓게
• 사람들과 살아난 시설이 함께 보임

glitch, Dutch angle, 불안정 shake 금지.

---

# 93. 카메라와 CH10 정적

CH10은 카메라 움직임을 줄인다.

연구시설보다:

• bob 감소
• 자동 focus 감소
• 긴 정지 허용

플레이어가 집의 조용함을 느끼게 한다.

---

# 94. 카메라와 Final Archive flashback

각 인물 flashback은 과거 챕터 장면을 그대로 1초 재현할 수 있다.

조건:

• 당시 1인칭 시점 유지
• 해당 인물의 핵심 행동만
• HUD 없음
• 빠른 fade-in/out
• 다른 성 이름 노출 없음

---

# 95. 카메라 중첩 호출 방지

한 camera tween이 끝나기 전에 다른 tween이 시작되어 서로 싸우지 않게 한다.

권장:

```text
cameraSequenceId
cameraLockOwner
```

카메라 제어권을 소유하는 시스템을 명확히 한다.

예:

DIALOGUE가 camera owner일 때
일반 interaction이 camera tween을 시작할 수 없음.

---

# 96. 카메라 owner 우선순위

권장:

```text
TRANSITION
> CINEMATIC
> STAMP
> INSPECT
> DIALOGUE
> FOCUS
> FREE
```

02_CONTROL의 입력 우선순위와 논리적으로 같은 방향을 유지한다.

---

# 97. 카메라 제어권 해제

owner가 끝날 때:

• 자신이 변경한 offset/FOV/look cone만 복원
• 다른 상위 owner가 있다면 FREE로 바로 복귀하지 않음

예:

INSPECT → STAMP

STAMP 종료 후:
FREE가 아니라 필요한 경우 DIALOGUE.

즉 camera owner도 playerState 전환과 함께 관리.

---

# 98. 디버그 카메라 도구

개발 모드에서 선택적으로:

• current FOV
• yaw/pitch
• camera local offset
• active pose
• camera owner
• clearance warning
• clipping test ray

표시 가능.

배포본에서는 숨긴다.

---

# 99. 카메라 관련 실패 사례

반드시 사전 검토:

• 벽 관통
• NPC 얼굴 내부 진입
• 문 열릴 때 door panel 관통
• 상자 lid 관통
• 손 near-plane 절단
• 문서 글자 unreadable
• 모바일에서 NPC/문서 화면 밖
• FOV 복구 누락
• look cone 영구 유지
• cinematic 종료 후 바닥 바라봄
• CH9 flash 후 exposure 불복구
• 엽서 이름이 손에 가림
• Final Archive flashback에서 실제 성 조기 노출
• focus loss 후 camera tween 정지
• orientation 변경 후 inspect 대상 화면 밖
• 두 camera tween 동시 실행

---

# 100. 카메라 금지사항

• 갑작스러운 3인칭 전환
• 플레이어 얼굴 노출
• 벽을 통과하는 close-up
• 화면을 과도하게 흔드는 연출
• 모든 대화에서 NPC 얼굴만 정면 close-up
• 모든 REJECTED에서 동일 camera path
• 퍼즐 정답을 자동 zoom으로 알려주기
• CH9 결과를 full-screen overlay만으로 처리해 시설 감각 제거
• CH9 `SUCCESS?`에 과도한 push-in
• CH10 전화벨 때 자동으로 전화기로 강제 snap
• 상자 엽서를 자동 zoom으로 발견시켜주기
• 엽서 이름 reveal 중 zoom/shake
• camera tween을 직접 position 수정으로 여러 시스템이 동시에 제어
• 카메라 복원 누락

---

# 101. 후속 문서와의 계약

## 04_INTERACTION.md

카메라 safe interaction zone을 고려해 Raycast 거리/target priority를 설계한다.

카메라가 오브젝트에 지나치게 가까워야만 상호작용 가능한 구조를 만들지 않는다.

---

## 05_DIALOGUE.md

대화 cue는 camera pose/target을 요청할 수 있지만 `03_CAMERA.md`의 safe pose와 look cone 규칙을 따른다.

---

## 09_NPC_BLOCKING.md

NPC 정지 위치는 conversation camera distance와 clipping 방지 요구를 만족해야 한다.

---

## 10_ANIMATION_CORE.md

camera tween을 다른 object tween과 같은 sequence 안에서 안전하게 실행할 수 있어야 한다.

---

## 17_SPATIAL_LAYOUT.md

카메라 close-up을 위해 실제 행동 공간과 clearance를 확보한다.

---

## 18_COLLISION_AND_CLEARANCE.md

player collider뿐 아니라 camera safe volume과 cinematic path clearance를 정의해야 한다.

---

## 20_LIGHTING.md

close-up과 CH9 flash에서 카메라 노출이 깨지지 않게 설계한다.

---

## 27_MOBILE.md

좁은 화면에서 FOV/pose 재조정을 허용하되 장면 의미를 바꾸지 않는다.

---

# 102. 누적 검증 결과

03_CAMERA.md 작성 완료 시점 기준:

00_INDEX.md와 상충:
없음.

01_PLAYER.md와 상충:
없음.

02_CONTROL.md와 상충:
없음.

확정된 구조:

```text
00_INDEX
   ↓
01_PLAYER
   ↓
02_CONTROL
   ↓
03_CAMERA
```

현재까지 고정된 핵심:

• 1인칭 유지
• playerState가 상위 상태
• 입력 라우터가 상태별 입력을 통제
• camera는 playerState에 맞춰 자유도/owner를 변경
• close-up을 위해 player collider를 벽 안으로 이동시키지 않음
• 카메라 연출은 safe pose와 clearance를 전제로 함
• 상태 종료 시 FOV/offset/look 제한을 명시적으로 복원
• CH9/CH10 핵심 연출에서도 1인칭 경험을 유지
• 스포일러 방지 역시 카메라 설계에 포함

후속 04_INTERACTION.md는 00~03 전체와 다시 누적 상충 검토해야 한다.

<!-- MERGED SOURCE END: 03_CAMERA.md -->


================================================================================
ORIGINAL SOURCE: 04_INTERACTION.md
================================================================================

# 04_INTERACTION.md

# INTERACTION SPECIFICATION

이 문서는 플레이어가 세계의 NPC·문서·장비·문·레버·전화·상자·사진·메달·엽서 등과 상호작용하는 공통 규칙을 정의한다.

핵심 범위:

• Raycast
• 상호작용 거리
• 대상 판정
• 대상 우선순위
• focus
• hover/focus feedback
• 집기
• 놓기
• 뒤집기
• 열기
• 누르기
• 레버
• 문
• NPC interaction
• 상태별 활성/비활성
• 중복 실행 방지
• interaction proxy
• 모바일 터치 보정
• soft-lock 방지
• animation 중 interaction 차단
• interaction 완료 후 world state 확정

---

# 0. 누적 상충 검토

참조 문서:

• `00_INDEX.md`
• `01_PLAYER.md`
• `02_CONTROL.md`
• `03_CAMERA.md`

---

## 0.1 00_INDEX.md와의 상충 검토

00_INDEX.md는 `04_INTERACTION.md`의 책임을 다음과 같이 지정한다.

• Raycast
• 상호작용 거리
• 선택 우선순위
• hover/focus
• 집기
• 놓기
• 뒤집기
• 열기
• 누르기
• 레버
• 문
• 중복 상호작용 방지
• 상태에 따른 활성/비활성

본 문서는 위 범위를 그대로 구체화한다.

다음 항목은 다른 문서가 최종 책임을 가진다.

• 입력 장치와 입력 라우팅 → `02_CONTROL.md`
• 카메라 pose/look cone/FOV → `03_CAMERA.md`
• 대화 데이터와 한 줄 진행 → `05_DIALOGUE.md`
• object animation 세부 경로 → `11_OBJECT_ANIMATION.md`
• 문서 시각 규칙 → `13_DOCUMENT.md`
• 도장 세부 동작 → `14_STAMP.md`
• 물체 기본 라이브러리 → `15_OBJECTS.md`
• 공간 치수 → `17_SPATIAL_LAYOUT.md`
• 물리 충돌/clearance 최종값 → `18_COLLISION_AND_CLEARANCE.md`
• UI 시각 표현 → `23_UI.md`
• 모바일 레이아웃 → `27_MOBILE.md`

00_INDEX.md와 상충 없음.

---

## 0.2 01_PLAYER.md와의 상충 검토

01_PLAYER.md는 다음을 요구한다.

• 플레이어 상태:
  FREE / FOCUS / DIALOGUE / INSPECT / CARRY / STAMP / CINEMATIC / LOCKED / TRANSITION
• 상호작용은 상태에 맞게 허용/차단
• 문서를 실제 placement slot에 놓는 방식 우선
• 상자 등 큰 물체는 CARRY로 분리
• NPC를 통과하지 않음
• 문 회전 반경 고려
• 중복 클릭으로 행동 중복 실행 금지
• 행동 시작/완료/실패 상태 명시
• CH10 사진/메달 제거 후 엽서 접근
• 엽서 reveal 전 다른 interaction 차단
• 행동 공간이 없는 곳에서 interaction을 억지로 시작하지 않음

본 문서는 위 요구를 그대로 유지한다.

특히 interaction은 `클릭되었다`는 이유만으로 즉시 실행하지 않고,
상태·거리·접근성·clearance·chapter state를 모두 통과한 뒤 실행하도록 정의한다.

상충 없음.

---

## 0.3 02_CONTROL.md와의 상충 검토

02_CONTROL.md는 다음 구조를 확정했다.

• 브라우저 이벤트가 바로 게임 로직을 호출하지 않음
• 중앙 입력 라우터 이후 interaction 판정
• 입력 우선순위:
  SYSTEM LOCK
  > CINEMATIC / TRANSITION
  > DIALOGUE
  > INSPECT / STAMP / CARRY
  > FOCUS
  > FREE
• 한 입력이 두 대상에 동시에 전달되지 않음
• 잠금 중 일반 입력 queue 금지
• action state 기반 재진입 차단
• 모바일 pointerId 분리
• dialogue/document UI 뒤 월드 클릭 차단

본 문서는 interaction layer가 `02_CONTROL.md`의 입력 라우터 이후에만 실행된다고 정의한다.

상충 없음.

---

## 0.4 03_CAMERA.md와의 상충 검토

03_CAMERA.md는 interaction 관점에서 다음을 요구한다.

• 중요 오브젝트마다 safe interaction zone 필요
• 카메라가 물체에 과도하게 가까워야만 상호작용 가능한 구조 금지
• close-up은 safe pose와 clearance 전제
• interaction 시작 전 player pose normalization은 작은 범위에서만 허용
• 카메라/오브젝트 사이 geometry 침범 금지
• 퍼즐 정답을 camera auto-zoom으로 알려주지 않음
• CH10 전화/현관/상자/엽서에 각각 safe pose 필요

본 문서는 interaction 가능 판정에 `interaction zone`과 `camera-safe entry condition`을 포함한다.

상충 없음.

---

# 1. 상호작용의 기본 철학

상호작용은 게임 세계의 물체를 “클릭 가능한 UI 버튼”으로 바꾸는 것이 아니다.

플레이어는 실제 공간 안에서:

• 사람에게 다가간다.
• 종이를 받는다.
• 책상 위 자료를 집는다.
• 문을 연다.
• 장비를 조작한다.
• 수화기를 든다.
• 상자를 옮긴다.
• 사진을 뒤집는다.
• 엽서를 꺼낸다.

따라서 상호작용은 항상 다음 네 요소를 동시에 만족해야 한다.

```text
STATE
DISTANCE
VISIBILITY
CONTEXT
```

즉:

`현재 상태에서 가능한가`
+
`실제로 닿을 수 있는가`
+
`플레이어가 보고 있는가`
+
`현재 챕터 진행상 활성인가`

를 모두 통과해야 한다.

---

# 2. interaction 처리 흐름

권장 흐름:

```text
INPUT
↓
02_CONTROL input router
↓
현재 playerState 확인
↓
interaction 가능 상태인지 확인
↓
candidate 수집
↓
거리 검사
↓
시야/가림 검사
↓
chapter state 검사
↓
priority 정렬
↓
최종 target 하나 선택
↓
precondition 검사
↓
interaction lock 획득
↓
행동 실행
↓
world state commit
↓
lock 해제 또는 다음 state로 전환
```

한 단계라도 실패하면 행동을 실행하지 않는다.

---

# 3. interaction component

모든 상호작용 가능 대상은 공통 metadata를 가진다.

권장 예:

```js
{
  id: "ch01_batch_card_03",
  type: "DOCUMENT",
  action: "INSPECT",

  enabled: true,

  requiredPlayerStates: ["FREE"],

  maxDistance: 1.6,

  priority: 60,

  lineOfSight: true,

  interactionProxy: proxyMesh,

  chapterGate: "CH01_INVESTIGATION",

  lockKey: "batch_card_03",

  onInteract: fn
}
```

장면별 코드에서 mesh 이름을 비교하는 방식으로 interaction을 구현하지 않는다.

잘못된 예:

```js
if (hit.object.name === "box") ...
```

권장:

hit object 또는 부모에서 interaction component를 찾는다.

---

# 4. interaction 대상 종류

최소 공통 type:

```text
NPC
DOCUMENT
SMALL_OBJECT
LARGE_OBJECT
CONTROL
BUTTON
LEVER
DOOR
PHONE
PARCEL
ARCHIVE
DECORATIVE
```

type은 입력 의미와 feedback을 구분하는 용도다.

챕터 퍼즐을 type 하나로 억지로 일반화하지 않는다.

---

# 5. 상호작용 거리 기본값

정확한 최종값은 공간/오브젝트 검증 후 조정 가능하다.

기본 권장 범위:

```text
NPC conversation        1.4 ~ 2.2 m
desk document           0.7 ~ 1.5 m
small object            0.5 ~ 1.3 m
wall control            0.6 ~ 1.4 m
door handle             0.7 ~ 1.5 m
phone                    0.6 ~ 1.4 m
parcel pickup            0.6 ~ 1.3 m
large machine control    0.8 ~ 1.8 m
```

중요:

상호작용 거리보다 `실제 행동이 자연스러운 거리`가 우선이다.

---

# 6. 너무 먼 interaction 금지

멀리 있는 물체를 화면 중앙에 보인다는 이유만으로 클릭할 수 있게 하지 않는다.

예:

• 방 반대편 전화기
• 4m 떨어진 문손잡이
• 다른 책상 위 문서

이런 대상은 hover feedback 자체를 약하게 하거나 표시하지 않는다.

플레이어가 다가가도록 유도한다.

---

# 7. 너무 가까운 interaction 방지

플레이어가 대상에 지나치게 가까이 붙으면 camera clipping이나 animation 충돌이 생길 수 있다.

중요 interaction에는 최소 거리도 둘 수 있다.

예:

```text
phone:
minDistance 0.55m
maxDistance 1.4m
```

플레이어가 전화기 위에 몸을 붙인 상태라면:

• interaction을 바로 실행하지 않고
• 아주 작은 pose normalization을 수행하거나
• 한 걸음 정도 뒤로 갈 수 있는 공간을 요구한다.

큰 자동 순간이동은 금지.

---

# 8. 시선 판정

interaction은 화면 중앙 또는 의도한 focus 영역을 기준으로 한다.

기본:

• camera forward ray
• 또는 작은 screen-space cone

모바일에서는 손가락 위치가 아닌 화면 중앙 crosshair 방식과 직접 touch 방식 중 챕터 UI에 맞게 선택 가능.

공통 목표:

플레이어가 무엇을 선택하는지 예측 가능해야 한다.

---

# 9. Raycast 기본 구조

Raycast는 모든 scene mesh를 무차별 검사하지 않는다.

별도 interaction layer 또는 candidate collection을 사용한다.

권장:

```text
INTERACTION_LAYER
```

대상만 raycast에 포함.

이유:

• 성능
• 장식 mesh 오선택 방지
• 복잡한 model 내부 mesh 선택 문제 감소

---

# 10. proxy collider

작거나 복잡한 물체에는 invisible interaction proxy를 허용한다.

예:

• 연필
• 작은 스위치
• 메달
• 전화기 손잡이
• 문손잡이

proxy는 실제 mesh보다 약간 크게 만들 수 있다.

단:

• 옆 물체의 영역까지 침범하지 않음
• 다른 대상과 proxy가 겹치지 않음
• mobile에서만 극단적으로 커지는 방식 금지

---

# 11. interaction proxy 부모 관계

복잡한 모델의 자식 mesh가 raycast되어도 최종 interaction owner는 하나여야 한다.

예:

```text
telephone
├─ base
├─ dial
├─ handset
└─ cord
```

전화 받기 단계에서는 handset proxy만 활성화 가능.

라디오처럼 여러 control이 있는 장비는 control별 owner 분리 가능.

---

# 12. line-of-sight 검사

대상이 interaction 가능 거리여도 벽/가구 뒤라면 선택되지 않아야 한다.

예:

전화기가 벽 너머 1m에 있다고 raycast proxy가 잡혀서는 안 된다.

방법:

• interaction ray의 첫 유효 surface 확인
• occluder layer 검사

유리처럼 시각적으로 투과되지만 손이 닿지 않는 물체도 interaction을 막을 수 있다.

---

# 13. 대상 우선순위

기본 우선순위:

```text
1. 현재 진행에 필수인 active chapter target
2. 현재 sequence가 지정한 target
3. inspect/interaction 상태의 직접 대상
4. 중요한 문서/장비
5. NPC
6. 일반 environment interaction
7. decorative inspect
```

그러나 `필수 target`이라는 이유로 화면 반대편 물체가 선택되어서는 안 된다.

거리/시야 조건을 먼저 통과한 candidate 안에서만 priority를 사용한다.

---

# 14. 동일 위치의 대상

예:

책상 위:

• 문서
• 도장
• 연필
• 커피

가 가까이 있을 수 있다.

이 경우 interaction proxy가 겹치지 않도록 placement 단계에서 먼저 해결한다.

그래도 겹치면:

• 화면 중앙과의 각도
• ray hit distance
• priority

순으로 최종 target 선택.

항상 도장이 모든 문서를 덮어쓰는 식의 고정 priority 금지.

---

# 15. hover/focus feedback

대상이 선택 가능한 상태라면 최소한의 feedback을 제공한다.

가능:

• 아주 작은 outline
• 밝기 변화
• 작은 interaction dot
• 짧은 label

금지:

• 모든 클릭 가능 물체에 거대한 네온 outline
• 퍼즐 핵심 자료만 유독 빨간색
• 정답 오브젝트만 특별한 glow
• world immersion을 깨는 큰 버튼

---

# 16. inactive feedback

현재 상호작용할 수 없는 물체는 기본적으로 아무 강조도 하지 않는다.

필요하면:

• 아주 약한 비활성 feedback

사용 가능.

예:

CH10 엽서는 사진/메달 제거 전에는 interaction feedback 없음.

“LOCKED ITEM” 텍스트를 띄우지 않는다.

---

# 17. interaction label

label은 동작을 설명한다.

좋은 예:

```text
조사
받기
열기
수화기 들기
놓기
뒤집기
```

나쁜 예:

```text
정답 확인
중요 단서
새 아이템
다음 단계
```

label이 퍼즐 답이나 서사를 설명하지 않는다.

---

# 18. NPC interaction

NPC interaction 조건:

• conversation 가능 state
• 대화 거리
• line-of-sight
• NPC가 현재 대화 가능한 state
• NPC가 다른 animation 중이 아님
• interaction spot 확보

NPC를 등 뒤에서 클릭해도 즉시 180° snap하지 않는다.

필요하면 NPC가 먼저 돌아보는 짧은 gesture 후 대화 시작.

---

# 19. NPC 접근 중 interaction

NPC가 플레이어에게 걸어오는 중에는 기본 interaction 잠금.

이유:

• 걷기 animation과 대화 pose 충돌
• NPC가 중간 위치에서 갑자기 멈춤
• 문서 전달 animation path 깨짐

NPC가 designated conversation spot에 도착한 뒤 활성화.

예외는 챕터별 명시 필요.

---

# 20. NPC 대화 종료 후

대화 종료 직후 같은 NPC를 연타해 같은 대화를 즉시 재시작하지 않게 cooldown 또는 state gate 사용.

시간 기반 cooldown보다:

`npcDialogueState = COMPLETE`

같은 명시 state를 우선.

---

# 21. 문서 interaction

문서 행동:

```text
INSPECT
PICK_UP
PLACE
FLIP
COMPARE
MARK
ARCHIVE
```

실제 행동 가능 여부는 문서 state에 따라 다름.

예:

제출 전:
NPC가 소유.

제출 후:
incoming slot.

조사 중:
inspect anchor.

반려 후:
NPC 회수.

승인 후:
approved archive.

---

# 22. 문서 ownership

문서에는 현재 owner를 둔다.

예:

```text
NPC_RICHARD
PLAYER
DESK
ARCHIVE
```

ownership이 두 개 동시에 활성되지 않게 한다.

한 animation에서 parent를 바꿀 때:

• transition 순간을 명시
• 이전 anchor 해제
• 새 anchor 등록

---

# 23. 문서 집기

집기 전 검사:

• playerState 허용
• distance
• line-of-sight
• document state
• inspect anchor 사용 가능
• camera safe pose 가능

성공:

FREE
→ FOCUS 또는 INSPECT

실패:

world state 변화 없음.

---

# 24. 문서 놓기

놓기에는 valid placement slot 필요.

슬롯이 이미 차 있으면:

• 다른 valid slot 탐색
• 아니면 현재 interaction을 시작하지 않음

문서를 다른 문서 위에 단순 겹쳐 쌓지 않는다.

의도된 stack은 별도 stack layout으로 정의.

---

# 25. 문서 뒤집기

INSPECT 상태에서만.

입력:

FLIP.

조건:

• 현재 문서가 flippable
• flip animation 중 아님

flip 도중 재입력 무시.

완료 후:

`side = FRONT/BACK`

state commit.

---

# 26. 문서 비교

두 자료를 비교할 경우:

• compare 대상 수 제한
• 좌/우 slot 확보
• 둘 다 readable
• 다른 world interaction 차단

비교를 종료하면:

• 각 문서를 valid slot으로 반환
• 기존 ownership 유지
• 겹침 검사

---

# 27. SMALL_OBJECT interaction

예:

• 메달
• 사진
• 연필
• 작은 부품
• 카드

작은 물체는 실제 mesh보다 interaction proxy를 크게 잡을 수 있다.

그러나 pickup animation은 실제 mesh 기준.

proxy 자체가 camera에 보이면 안 된다.

---

# 28. LARGE_OBJECT interaction

예:

• CH10 parcel
• 이동 가능한 큰 자료함

큰 오브젝트는 pickup 전:

• carry path
• doorway clearance
• destination slot

을 최소한 검사한다.

interaction 순간에는 들어 올릴 수 있지만 이후 이동 경로가 물리적으로 막혀 영구 soft-lock이 되지 않게 한다.

---

# 29. BUTTON interaction

버튼은 짧은 one-shot input.

규칙:

• 누르는 순간 lock
• button travel animation
• system response
• release animation
• lock 해제

누르고 있는 동안 계속 이벤트가 발생하는 구조 금지.

---

# 30. LEVER interaction

레버는 명확한 state를 가진다.

예:

```text
UP
DOWN
MOVING
```

MOVING 중 추가 interaction 무시.

레버가 0→1→0으로 한 클릭에 왕복하지 않음.

퍼즐상 여러 위치가 필요하면:

```text
A
B
C
MOVING
```

처럼 명시.

---

# 31. KNOB interaction

공통 상호작용 문서에서는 knob를 범용 핵심 퍼즐로 권장하지 않는다.

사용 시:

• 장비 느낌을 주는 보조 control
• 실제로 의미가 있는 경우만

금지:

`목표 숫자까지 돌리기`를 반복 퍼즐로 사용.

knob 입력은 mobile에서 drag gesture와 충돌할 수 있으므로 챕터별 필요성을 먼저 검토.

---

# 32. DOOR interaction

문 상태:

```text
CLOSED
OPENING
OPEN
CLOSING
LOCKED
```

최소한 이 정도로 분리.

interaction 전 검사:

• player clearance
• door sweep clearance
• NPC가 궤도 안에 없는가
• 들고 있는 큰 오브젝트가 있는가
• chapter state상 열 수 있는가

---

# 33. 문 중복 입력

OPENING/CLOSING 중 interaction 무시.

문 animation을 reverse하는 기능은 기본적으로 만들지 않는다.

필요한 경우에만 별도 설계.

이유:

• player/NPC collision 복잡도 증가
• 문 관통
• animation state 꼬임

---

# 34. 문 자동 닫힘

스토리 진행에 필요하지 않으면 자동 닫힘 최소화.

플레이어 뒤에서 문이 자동으로 닫혀 동선을 막는 문제를 피한다.

CH10 현관문은 상자를 옮기기 전까지 열린 상태를 유지하는 것이 기본.

---

# 35. 문 interaction zone

문손잡이 자체의 작은 mesh만 정확히 눌러야 하지 않게 한다.

손잡이 주변 proxy 사용.

하지만 문 전체를 어디든 클릭하면 열리는 방식도 피한다.

플레이어가 “손잡이를 조작한다”는 감각 유지.

---

# 36. PHONE interaction

전화기 state 예:

```text
IDLE
RINGING
ANSWERING
IN_CALL
THROWING
DROPPED
```

전화 수화기 interaction은 `RINGING`에서만 활성.

`IDLE` 상태에서 눌러도 필요 없는 story sequence를 시작하지 않는다.

---

# 37. 전화 받기

조건:

• RINGING
• playerState FREE
• 거리 충족
• phone safe pose 가능

실행:

FREE
→ FOCUS
→ DIALOGUE

ANSWERING 중 재입력 무시.

---

# 38. 떨어진 수화기

THROWING 완료 후:

`DROPPED`

상태.

그 시점에서는 플레이어가 즉시 다시 집어 통화를 이어가는 interaction을 기본 제공하지 않는다.

이 장면은 감정적 연출이므로 story state가 우선.

---

# 39. PARCEL interaction

상자 state 예:

```text
OUTSIDE
PICKING_UP
CARRIED
PLACED
UNTYING
OPENING
OPEN
```

각 state에서 가능한 interaction은 하나로 제한.

예:

OUTSIDE:
PICK_UP

CARRIED:
PLACE

PLACED:
UNTIE

UNTYING 완료:
OPEN

---

# 40. 상자 placement

테이블의 parcel slot은 미리 확보.

조건:

• slot empty
• lid open clearance 확보
• camera inspect pose 확보
• 주변 사진/컵/책 겹침 없음

상자를 놓고 나서 주변 오브젝트가 자동으로 밀려나는 방식 금지.

---

# 41. 포장끈 interaction

끈을 “클릭하면 사라지는 mesh”로만 처리하지 않는다.

최소한:

• 손이 접근
• 매듭 풀기 또는 끈 풀림
• 끈이 옆으로 이동

의 물리적 결과를 보여준다.

세부 animation은 `11_OBJECT_ANIMATION.md`.

---

# 42. 상자 뚜껑 interaction

상자 lid는 hinge를 중심으로 회전.

interaction 전:

• 뒤쪽 clearance
• wall/objects collision
• camera 위치

확인.

OPENING 중 추가 입력 무시.

---

# 43. PHOTO / MEDAL interaction 순서

PHOTO와 MEDAL은 상자 개봉 후 둘 다 활성.

어느 순서든 조사 가능.

각 물체:

1. pickup
2. inspect
3. flip/rotate
4. 설명
5. 지정 table slot에 place
6. `inspected = true`

두 물체 모두 true가 되면 postcard interaction 가능.

---

# 44. 사진/메달 제거 처리

시각적으로 실제 상자에서 제거한다.

단순히 interaction만 완료하고 그대로 상자 안에 남기지 않는다.

이유:

• 엽서 노출의 물리적 인과
• 플레이어가 진행 상태를 이해

place slot은 서로 분리.

---

# 45. POSTCARD interaction gate

조건:

```text
photoInspected === true
AND
medalInspected === true
AND
postcardRevealed === true
```

또한 실제 geometry 상으로도 postcard가 보이는 상태여야 한다.

state만 풀렸는데 사진 mesh가 아직 위에 겹친 경우 interaction 금지.

---

# 46. 엽서 집기

interaction 시작 즉시:

• world interaction lock
• postcard ownership PLAYER
• 다른 오브젝트 target 비활성
• INSPECT 진입

이후 정체 reveal 종료 전까지 다른 interaction 없음.

---

# 47. CH1~8 도장 interaction

도장은 일반 world object지만 특정 story state에서만 활성.

예:

INVESTIGATION 중:
도장 비활성.

오류가 충분히 증명되고 confrontation 종료 후:
REJECTED 도장 활성.

수정본 검증 완료 후:
APPROVED 도장 활성.

플레이어가 처음부터 APPROVED를 찍는 자유 선택 구조가 아니다.

---

# 48. REJECTED / APPROVED 구분

두 도장을 물리적으로 별도 오브젝트로 둘 수 있다.

그러나 desk layout상:

• 서로 겹치지 않음
• 문서 placement와 충돌하지 않음
• 잘못된 도장이 활성되어 혼동되지 않음

필요하면 비활성 도장은 interaction feedback 없음.

---

# 49. 장비 control interaction

장비가 실제 puzzle evidence 수집에 필요할 때만 interaction.

예:

CH6:
sample swap
detector measurement
background measurement

가능.

단, 장비 모든 스위치를 클릭 가능하게 만들 필요 없다.

장식 control과 기능 control을 시각적으로 너무 극단적으로 구분하지 않되,
interaction feedback으로 알 수 있게 한다.

---

# 50. 순차 장비 interaction

여러 단계를 수행해야 할 경우:

```text
READY
RUNNING
RESULT_READY
```

처럼 state를 명확히 분리.

RUNNING 중 또 START 버튼을 눌러 측정이 두 번 실행되지 않게 한다.

---

# 51. 퍼즐 interaction과 정답 노출

퍼즐의 핵심은 자료 검증이다.

따라서 interaction feedback으로 정답을 알려주지 않는다.

금지:

• 잘못된 자료만 glow
• 정답 카드만 click 가능
• 핵심 오류 행만 hover
• “여기를 조사하세요” 화살표

필요한 모든 후보를 비슷한 interaction 문법으로 제공.

---

# 52. 오답 interaction

플레이어가 잘못된 단서를 선택해도 world state를 망가뜨리지 않는다.

예:

잘못된 카드 지적:

• 비교 가능
• 모순 없음 확인
• 다시 조사 상태로 복귀

즉 오답 때문에 문서가 사라지거나 chapter가 막히지 않는다.

---

# 53. hard fail 금지

CH1~8 퍼즐은 잘못된 클릭 때문에 게임을 처음부터 다시 하게 만들지 않는다.

실수는 검증 과정의 일부.

예외:

스토리상 사고/시간 제한 게임이 명시된 경우만.

현재 기본 기획에는 제한시간 hard fail을 두지 않는다.

---

# 54. interaction state commit

애니메이션을 시작하는 순간 결과를 commit하지 않는다.

예:

문 interaction:

잘못:
클릭
→ state OPEN
→ animation

권장:
클릭
→ state OPENING
→ animation 완료
→ state OPEN

도장도 동일.

중간 실패 시 실제 world state와 논리 state가 어긋나지 않게 한다.

---

# 55. interaction transaction

중요 행동은 일종의 transaction으로 본다.

예:

상자 placement:

```text
VALIDATE
LOCK
ANIMATE
VERIFY
COMMIT
UNLOCK
```

중간 오류 발생 시:

```text
ROLLBACK
```

가능.

---

# 56. lock ownership

상호작용 lock은 단순 boolean 하나보다 owner를 가진다.

예:

```text
interactionLockOwner = "PHONE_ANSWER"
```

이유:

잘못된 sequence가 다른 sequence의 lock을 해제하는 문제 방지.

---

# 57. lock 중 interaction

lock 상태에서 들어온 일반 interaction은 폐기.

queue하지 않는다.

02_CONTROL.md와 동일.

예:

도장 중 문 클릭
→ 무시.

도장 끝나고 문이 자동으로 열리면 안 됨.

---

# 58. 상호작용 재진입 방지

각 대상에는 필요시 busy flag.

예:

```text
door.busy
phone.busy
parcel.busy
document.busy
```

한 object의 interaction이 끝나기 전에 같은 object action 재실행 금지.

---

# 59. 전역 lock 남발 금지

모든 interaction마다 전역 player LOCKED를 걸지 않는다.

가능하면:

• 해당 대상 lock
• 해당 category lock
• playerState 전환

을 사용.

게임 전체를 불필요하게 멈추지 않는다.

---

# 60. interaction 취소

취소 가능 여부는 action 단계별로 다르다.

예:

문서 inspect:
취소 가능.

상자 carry:
valid drop 가능.

문 OPENING:
기본 취소 불가.

도장 타격 시작:
취소 불가.

전화 받기 animation:
취소 불가.

엽서 reveal:
취소 불가.

---

# 61. interaction 실패 feedback

조건을 만족하지 못하면 무엇이 문제인지 개발 중에는 알 수 있어야 한다.

debug:

```text
INTERACTION DENIED
reason: TOO_FAR
```

또는:

```text
OCCLUDED
WRONG_STATE
BUSY
NO_CLEARANCE
CHAPTER_GATE
```

배포본에서는 내부 reason을 그대로 노출하지 않는다.

---

# 62. interaction reject reason

권장 enum:

```text
NONE
TOO_FAR
TOO_CLOSE
OCCLUDED
WRONG_PLAYER_STATE
WRONG_CHAPTER_STATE
BUSY
NO_CLEARANCE
INVALID_OWNER
MISSING_DEPENDENCY
LOCKED_BY_SEQUENCE
```

QA 시 문제 추적에 유용.

---

# 63. interaction candidate 캐싱

매 frame scene 전체를 다시 순회해 interaction component를 찾지 않는다.

active candidate registry 유지.

장면 state 변경 시:

• enable/disable

만 갱신.

모바일 성능에 유리.

---

# 64. focus target 유지

플레이어 시선이 작은 흔들림 때문에 target A/B 사이에서 계속 깜빡이지 않게 hysteresis를 둘 수 있다.

예:

현재 target을 유지하는 동안 새 target이 명확히 더 우선일 때만 전환.

특히 작은 desk objects에서 중요.

---

# 65. hover 안정화

마우스/터치가 살짝 움직일 때 outline이 빠르게 깜빡이면 품질이 떨어진다.

가능:

• 50~100ms 정도의 짧은 visual stabilization
• screen-center cone

단, 실제 interaction 실행은 현재 유효 target 기준.

---

# 66. interaction과 camera focus

interaction 실행 전 camera safe pose가 필요한 대상:

• 문서
• 도장
• 전화
• 문
• 상자
• 엽서

흐름:

```text
target validation
→ camera pose validation
→ interaction lock
→ FOCUS/INSPECT
→ action
```

camera pose가 벽을 관통해야만 가능한 경우 interaction을 강행하지 않는다.

---

# 67. interaction zone

중요 오브젝트 주변에는 standing zone을 둘 수 있다.

예:

```text
PHONE_ZONE
STAMP_ZONE
PARCEL_TABLE_ZONE
BOARD_VIEW_ZONE
```

zone에 들어와야 interaction 가능.

장점:

• animation 시작 pose 안정
• camera clipping 감소
• player/NPC blocking 예측 가능

---

# 68. zone 진입 강제 금지

zone에 들어왔다고 자동으로 모든 interaction을 실행하지 않는다.

예:

전화 앞에 섰다고 자동 pickup 금지.

플레이어가 직접 INTERACT.

자동 트리거는:

• 경보
• NPC 등장
• ambient event

같은 환경 이벤트에 제한.

---

# 69. player pose normalization

03_CAMERA.md와 동일하게 아주 작은 보정만 허용.

interaction 시작 전:

• 최대 수십 cm
• 작은 yaw 정렬

가능.

1m 이상 이동이 필요하면 zone 설계 실패.

---

# 70. placement slot 시스템

공통 slot 예:

```text
DESK_INCOMING
DESK_COMPARE_LEFT
DESK_COMPARE_RIGHT
DESK_STAMP
DESK_APPROVED_ARCHIVE

HOME_PARCEL
HOME_PHOTO
HOME_MEDAL
```

각 slot:

• position
• rotation
• bounds
• occupant

를 가진다.

---

# 71. slot occupancy

slot은 점유 상태를 추적.

```text
EMPTY
RESERVED
OCCUPIED
```

animation 시작 시 RESERVED.

완료 후 OCCUPIED.

실패 시 EMPTY 복구.

두 object가 같은 slot을 동시에 예약하지 않게 한다.

---

# 72. object overlap 방지

placement 전 bounding volume 검사.

단, 런타임 collision만 믿지 않는다.

가능하면 chapter layout 단계에서 placement slot 자체가 겹치지 않도록 설계.

런타임 검사는 방어선.

---

# 73. table edge 검사

문서/사진/메달/상자를 테이블 위에 놓을 때:

• object footprint가 surface bounds 내부인지 확인
• 일부가 의도적으로 살짝 걸치는 연출은 명시적 예외

무작위 rotation 때문에 모서리가 밖으로 튀어나오지 않게 한다.

---

# 74. ground placement

바닥에 놓이는 대상:

• 전화 수화기
• 외부 parcel

은 실제 floor height에 접지.

부동 소수점 오차로 살짝 떠 있거나 바닥 안으로 들어가지 않게 한다.

세부 epsilon은 `18_COLLISION_AND_CLEARANCE.md`.

---

# 75. interaction proxy와 실제 object 분리

proxy는 선택용.

animation/collision은 actual object 기준.

proxy가 커서 선택 가능하다고 actual object가 벽을 통과해도 된다는 의미가 아니다.

---

# 76. mobile direct touch

모바일에서 직접 물체를 터치하는 방식 사용 시:

• screen touch → raycast
• UI 영역 touch 제외
• joystick/look pointer 제외
• active playerState 검사

small object는 proxy 확장.

---

# 77. 모바일 중앙 interaction 방식

대안:

화면 중앙 reticle + Action button.

장점:

• 작은 물체 선택 안정
• look gesture와 tap 충돌 감소

어느 방식을 채택할지는 `27_MOBILE.md`에서 최종 결정.

04_INTERACTION은 두 방식 모두 같은 candidate/priority 시스템을 사용하도록 한다.

---

# 78. 모바일 오선택 방지

손가락이 화면을 가리므로:

• highlight는 터치 직전이 아니라 look target 기반으로 미리 표시 가능
• action button으로 최종 확인

작은 메달/사진/문서가 서로 붙어 있을 때 direct touch만 의존하지 않는다.

---

# 79. CH8 다인원 interaction

8명이 있는 방에서 NPC proxy가 겹치지 않게 한다.

대화 대상으로 Hans가 활성인 동안 다른 NPC는:

• ambient look 가능
• 직접 interaction은 제한

필요 없는 8개 이름 label을 동시에 띄우지 않는다.

---

# 80. CH9 전광판 interaction

`VIEW RESULTS`는 한 번만 실행.

조건:

• CH8 완료
• CH9 초기 대화/준비 state 완료
• player inside board_view_zone
• board not busy

interaction 후:

• 즉시 board busy
• player CINEMATIC
• 재 interaction 불가

---

# 81. CH9 NPC interaction

결과 영상 시작 전 일부 NPC만 짧은 dialogue interaction 가능.

전광판 실행 후 모든 NPC interaction 비활성.

결과 도중 NPC 반응을 클릭해서 멈추는 기능 없음.

---

# 82. CH10 라디오 interaction

라디오 직접 ON 방식이라면:

state:

```text
OFF
STARTING
PLAYING
COMPLETE
```

OFF에서만 INTERACT.

STARTING 중 재입력 무시.

PLAYING 중 volume knob 등 불필요한 extra interaction 추가하지 않는다.

---

# 83. CH10 전화 이전 interaction

전화 이벤트 전 전화기를 조사 가능하게 할지는 CH10 scenario에서 결정.

단, 전화 받기 interaction과 장식 inspect를 같은 action으로 섞지 않는다.

RINGING이 되면 handset action이 최우선.

---

# 84. CH10 현관문 이전 interaction

노크 전에도 집의 문이 존재한다.

그러나 문을 마음대로 열어 밖으로 나가 상자를 미리 발견하면 sequence가 깨진다.

권장:

• 노크 전 door handle interaction 비활성
• 자연스럽게 잠겨 있거나 story interaction 없음
• `아직 나갈 필요가 없다` 같은 독백은 넣지 않음

노크 후 활성.

---

# 85. CH10 현관문 이후

문이 열린 뒤:

• parcel 활성
• door close interaction은 상자 운반 전 제한 가능

상자를 들고 있는데 문을 실수로 닫아 path가 막히지 않게 한다.

---

# 86. CH10 사진/메달 순서 자유

두 물건은 어느 순서든 가능.

상태:

```text
photoInspected
medalInspected
```

둘 중 하나만 완료되어도 나머지는 계속 활성.

완료한 물건은 table slot로 이동 후 반복 interaction은 선택적으로 간단 inspect만 허용하거나 비활성.

스토리 설명이 매번 재생되지는 않게 한다.

---

# 87. CH10 postcard gating 이중화

엽서 접근은 두 방식으로 동시에 보호.

A. logical gate
B. physical occlusion

둘 중 하나만 의존하지 않는다.

왜냐하면:

logical gate만:
카드는 보이는데 클릭 안 되어 이상함.

physical only:
raycast proxy가 위 물체를 뚫고 잡힐 수 있음.

---

# 88. Final Archive interaction

Final Archive는 world interaction이 아니다.

따라서 3D interaction registry를 비활성.

continue input만 archive UI/sequence가 직접 받는다.

---

# 89. decorative interaction

장식 오브젝트를 너무 많이 클릭 가능하게 만들지 않는다.

기준:

클릭했을 때 다음 중 하나가 있어야 한다.

• 시대 분위기
• 인물 성격
• 현재 연구 상황
• 공간 설명
• 감정 여운

아무 의미 없는 컵/책/볼트까지 모두 상호작용 가능하게 만들면 핵심 target이 흐려진다.

---

# 90. 환경 오브젝트 interaction 밀도

한 화면에 동시에 강한 interaction feedback이 3~5개 이상 뜨지 않게 한다.

특히 desk.

중요 자료와 장식 interaction을 분리.

---

# 91. Interaction Deadlock 방지

다음 조건이 동시에 발생하면 soft-lock 가능.

예:

• playerState INSPECT
• document missing
• close button hidden
• world interaction disabled

따라서 각 non-FREE state는 항상 명시적 exit route를 가진다.

INSPECT:
close/complete

CARRY:
place/drop

DIALOGUE:
advance/end

STAMP:
sequence complete

CINEMATIC:
sequence complete

---

# 92. Missing object 복구

interaction target이 예상치 못하게 scene에서 사라지면:

• lock 해제
• playerState safe rollback
• chapter state는 commit 전이면 유지
• debug warning

빈 inspect 화면에서 갇히지 않는다.

---

# 93. animation failure 복구

object animation promise가 reject되면:

• target busy 해제
• slot reservation 해제
• target을 가장 가까운 valid state로 복원
• playerState 복구

중요 story object는 완전히 삭제하지 않는다.

---

# 94. save/resume과 interaction

세부 저장은 `25_SAVE_AND_RESUME.md`.

04_INTERACTION에서 요구:

• 중간 click 상태를 저장하지 않음
• 안전 checkpoint에서 object state를 재구성
• held/click state는 복원하지 않음
• busy/temporary locks는 로드 후 초기화
• story-complete state는 유지

---

# 95. 챕터 전환 전 interaction registry

TRANSITION 진입 시:

• 모든 world interaction disable
• active target clear
• hover clear
• pointer interaction release

다음 페이지에서 새 registry 생성.

이전 페이지 object reference를 유지하지 않는다.

---

# 96. interaction debug view

개발 모드에서 표시 가능:

• interaction proxy
• current target
• target priority
• maxDistance
• current distance
• line-of-sight
• active zone
• reject reason
• busy state
• chapter gate

특히 벽 뒤 선택/겹치는 proxy 문제 찾기에 사용.

---

# 97. interaction QA에서 강제로 시도할 행동

각 중요 장면에서 다음을 일부러 시도한다.

• 대상 바로 옆이 아니라 비스듬히 접근
• 너무 가까이 접근
• 최대 거리에서 클릭
• 다른 오브젝트 뒤에서 클릭
• 빠르게 두 번 클릭
• 버튼 누른 채 상태 전환
• animation 중 다른 대상 클릭
• 모바일 두 손가락 동시 입력
• 문 회전 영역에 서서 문 열기
• NPC 경로 앞을 막은 상태에서 NPC interaction
• 상자를 든 채 좁은 문 진입
• 엽서가 가려진 상태에서 화면 가장자리 터치

이 테스트를 통과하지 못하면 interaction 설계 미완성.

---

# 98. interaction과 spoiler 방지

interaction label이나 debug 정보가 숨겨진 정보를 노출하지 않게 한다.

금지 예:

```text
Inspect Oppenheimer postcard
Open Hiroshima photo
Talk to Feynman
```

공개 전 user-facing label:

```text
엽서
사진
Richard
```

내부 id에는 실제 이름이 있을 수 있으나 배포 UI에 직접 출력하지 않는다.

---

# 99. interaction과 역사 정보

Final Archive 전에는 실명/역사 역할을 interaction 설명에 붙이지 않는다.

CH1~8 interaction은 게임 속 현재 상황에만 집중.

---

# 100. interaction과 퍼포먼스

모바일 기준:

• active interaction target만 registry에 유지
• decorative mesh 전부 raycast 금지
• complex model은 proxy 사용
• 매 frame allocation 최소화
• hover target 계산 빈도 조절 가능

하지만 input latency가 느껴질 정도로 검사 주기를 낮추지 않는다.

---

# 101. interaction API 권장안

예:

```js
registerInteraction(target, config)

enableInteraction(id)
disableInteraction(id)

getInteractionCandidate(pointer)

validateInteraction(target)

beginInteraction(target)

commitInteraction(target)

cancelInteraction(target)

clearCurrentInteraction()
```

---

# 102. target validation API

권장 결과:

```js
{
  valid: false,
  reason: "TOO_FAR"
}
```

또는:

```js
{
  valid: true,
  target,
  action: "INSPECT"
}
```

validation과 execution을 분리한다.

---

# 103. 상태별 interaction 요약

```text
FREE
일반 world interaction 가능

FOCUS
현재 focus 대상 또는 지정 action만

DIALOGUE
대화 진행 외 world interaction 금지

INSPECT
현재 조사 대상 action만

CARRY
place/drop 등 carry 관련 action만

STAMP
stamp sequence action만

CINEMATIC
world interaction 금지

LOCKED
전부 금지

TRANSITION
전부 금지
```

---

# 104. interaction 금지사항

• 클릭 한 번이 두 대상에 전달
• 벽 너머 물체 선택
• 4m 밖 문손잡이 조작
• 작은 실제 mesh만 정확히 눌러야 진행
• 모든 장식품에 outline
• 정답 오브젝트만 glow
• animation 중 같은 action 재실행
• 클릭 입력 queue 후 나중에 자동 실행
• 문 OPENING 중 다시 클릭
• 상자 CARRIED 중 전화/책/라디오 모두 상호작용
• 사진/메달 제거 전 엽서 interaction
• CH9 결과 도중 NPC interaction
• 노크 전 CH10 현관문 열기
• interaction 실패 시 영구 LOCK
• placement slot 무시하고 물체 겹쳐 놓기
• 카메라가 벽 안으로 들어가야만 interaction 가능한 배치
• internal object id를 그대로 UI label로 출력

---

# 105. 후속 문서와의 계약

## 05_DIALOGUE.md

NPC interaction이 DIALOGUE로 전환된 뒤 한 입력당 한 문장 규칙을 유지한다.

---

## 09_NPC_BLOCKING.md

NPC conversation spot은 interaction distance와 camera safe pose를 만족해야 한다.

---

## 10_ANIMATION_CORE.md

interaction transaction:

```text
VALIDATE
LOCK
ANIMATE
COMMIT
UNLOCK
```

구조를 안전하게 지원해야 한다.

---

## 11_OBJECT_ANIMATION.md

집기/놓기/문/레버/전화/상자 등의 실제 경로가 interaction의 시작/완료 state와 일치해야 한다.

---

## 13_DOCUMENT.md

문서 ownership과 placement slot을 시각 구조와 맞춘다.

---

## 14_STAMP.md

REJECTED/APPROVED interaction gate와 STAMP state를 유지한다.

---

## 17_SPATIAL_LAYOUT.md

중요 interaction마다 standing zone과 camera clearance를 확보한다.

---

## 18_COLLISION_AND_CLEARANCE.md

interaction 시작 전 door/carry/camera/object clearance validation에 필요한 최종 수치를 제공한다.

---

## 23_UI.md

hover/label/hint는 정답이나 spoiler를 노출하지 않는다.

---

## 27_MOBILE.md

direct touch 또는 center-reticle 방식 중 하나를 확정하되 동일 interaction registry/validation을 사용한다.

---

# 106. 누적 검증 결과

04_INTERACTION.md 작성 완료 시점 기준:

00_INDEX.md와 상충:
없음.

01_PLAYER.md와 상충:
없음.

02_CONTROL.md와 상충:
없음.

03_CAMERA.md와 상충:
없음.

현재까지 확정된 흐름:

```text
00_INDEX
   ↓
01_PLAYER
   ↓
02_CONTROL
   ↓
03_CAMERA
   ↓
04_INTERACTION
```

핵심 계약:

```text
브라우저 입력
→ CONTROL ROUTER
→ PLAYER STATE 검사
→ INTERACTION VALIDATION
→ CAMERA SAFE POSE 확인
→ ACTION LOCK
→ ANIMATION
→ WORLD STATE COMMIT
→ 다음 PLAYER STATE
```

후속 `05_DIALOGUE.md`는 `00~04` 전체와 다시 누적 상충 검토한다.

<!-- MERGED SOURCE END: 04_INTERACTION.md -->
