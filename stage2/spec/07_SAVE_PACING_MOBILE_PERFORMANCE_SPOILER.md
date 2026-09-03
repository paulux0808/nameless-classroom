<!-- MERGED SOURCE START: 25_SAVE_AND_RESUME.md -->

# 25_SAVE_AND_RESUME.md

# SAVE AND RESUME SPECIFICATION

이 문서는 CH1~CH10 전체의 저장, 재개, 새로고침, 브라우저 종료, 페이지 이동, 시네마틱 복구, 문서/도장/전화/상자/엽서/Final Archive 상태 복원을 정의한다.

핵심 목표:

• exact transform이 아니라 semantic state 저장
• 완료한 행동이 reload 후 반복되지 않음
• 중간 animation frame을 복원하지 않음
• story-critical object가 canonical pose로 돌아옴
• chapter navigation과 save가 일치
• localStorage 손상 시 안전한 fallback
• CH9/CH10 긴 시퀀스에서 soft-lock 없음
• Final Archive 진행도 보존 가능
• spoiler state가 잘못 앞당겨지지 않음

---

# 1. 기본 철학

저장은 “현재 화면 그대로 복사”가 아니다.

저장해야 하는 것은:

```text
플레이어가 무엇을 완료했는가
현재 어떤 의미 단위에 있는가
어떤 문서가 승인되었는가
어떤 object가 어느 canonical state인가
어떤 cinematic beat까지 확정되었는가
```

이다.

---

# 2. 저장하지 않는 것

기본적으로 저장하지 않음:

• NPC exact transform
• player exact sub-centimeter 위치
• camera tween progress
• animation normalized time
• audio playback sample position
• particle state
• hand pose
• door가 37% 열린 값
• stamp가 공중 8cm 위치
• phone handset 중간 flight transform

---

# 3. 저장하는 것

예:

```text
chapterId
checkpointId
storyFlags
approvedMilestones
facilityProgress
documentStates
criticalObjectStates
archiveProgress
settingsVersion
saveVersion
```

---

# 4. Save Schema 예

```js
{
  saveVersion: 1,
  chapterId: "CH05",
  checkpointId: "CH05_RETEST_READY",

  progress: {
    facilityPercent: 44,
    approvedChapters: [1,2,3,4]
  },

  story: {
    flags: {}
  },

  documents: {},
  objects: {},

  archive: {
    unlocked: false,
    index: 0
  }
}
```

---

# 5. Source of Truth

save file은 scene object의 current transform이 아니라 gameplay semantic state에서 생성한다.

---

# 6. Checkpoint

checkpoint는 story 의미 단위.

예:

```text
CH01_START
CH01_REVIEW_READY
CH01_REJECTED
CH01_RESUBMIT_READY
CH01_COMPLETE
```

---

# 7. Checkpoint 수

너무 세분화하지 않는다.

매 dialogue line마다 save checkpoint를 만들지 않는다.

---

# 8. Checkpoint 선정 기준

다음 직전/직후 우선:

• 긴 조사 시작
• REJECTED commit
• 수정 완료
• APPROVED commit
• chapter transition
• CH9 mission result
• CH10 irreversible story object state
• archive profile 완료

---

# 9. Autosave

기본 자동 저장.

플레이어가 수동 save slot을 관리하게 만들 필요 없음.

---

# 10. Autosave Timing

권장:

```text
semantic COMMIT
→ save
```

animation 시작 시 저장 금지.

---

# 11. Debounce

연속 flag 업데이트마다 localStorage write하지 않는다.

critical checkpoint만 즉시.

나머지는 짧은 debounce 가능.

---

# 12. Page Transition

`24_TRANSITION.md` 규칙 유지.

```text
story commit
→ save
→ navigate
```

---

# 13. New Page Entry

다음 page는 저장된:

```text
chapterId
checkpointId
progress
```

검증 후 canonical scene 구성.

---

# 14. 현재 chapter URL과 save 불일치

예:

URL = chapter04
save = CH06

정책:

• 정상 플레이 흐름이면 save가 우선
• 개발 mode는 원하는 chapter override 가능

production에서 silently future state를 chapter04에 로드하지 않는다.

---

# 15. Save Version

schema 변경 대비:

```text
saveVersion
```

필수.

---

# 16. Migration

버전 차이가 작으면 migration 가능.

예:

```text
v1 object flag rename
→ v2 canonical object state
```

---

# 17. Migration 실패

safe fallback:

• 가장 가까운 완료 chapter
• 해당 chapter start checkpoint

로.

전체 save를 즉시 삭제하지 않는다.

---

# 18. Corrupted JSON

parse 실패 시:

• backup이 있다면 backup
• 없으면 safe new-game/last-known fallback

raw exception으로 black screen 금지.

---

# 19. Backup

localStorage에 최근 safe checkpoint 1개 backup 고려.

예:

```text
nameless2_save
nameless2_save_backup
```

---

# 20. 저장 원자성

새 save를 먼저 생성/검증한 뒤 main key 교체.

중간 문자열이 잘린 상태를 줄인다.

---

# 21. Checksum

복잡한 암호학 불필요.

간단한 schema/type validation이 더 중요.

---

# 22. Player Position 저장

일반 chapter:

exact position보다 checkpoint spawn anchor.

필요한 경우에만:

```text
safeAnchorId
```

저장.

---

# 23. Safe Anchor

save 가능한 player 위치는 predefined anchor만.

벽/문 뒤 arbitrary coordinate 저장 금지.

---

# 24. Camera 저장

대부분 저장하지 않는다.

load 후 checkpoint camera entry pose 사용.

---

# 25. Dialogue 저장

dialogue 중 reload 정책:

• 짧은 일반 대화 → dialogue 시작 전 또는 semantic line checkpoint
• 이미 story flag를 commit한 line → 반복되지 않게

---

# 26. Dialogue Line ID

필요하면:

```text
dialogueId
completedLineId
```

정도 저장 가능.

모든 subtitle animation progress 저장 불필요.

---

# 27. DIALOGUE 재개

중간 음성 40%부터 이어 재생하지 않는다.

해당 의미 단위를 처음부터 다시 보여주거나 다음 safe line.

---

# 28. REJECTED 저장

`STAMP_IMPACT` 후 result verify/commit이 완료되면 save 가능.

---

# 29. Impact 이전 reload

도장을 다시 찍어야 할 수 있음.

이는 안전한 반복.

---

# 30. Impact 이후 reload

도장 animation을 다시 재생하지 않는다.

문서 canonical stamped state + 다음 phase.

---

# 31. APPROVED 저장

APPROVED commit 후:

• document approved
• facility milestone
• progress
• archive candidate

가 모두 일치하는 save 생성.

---

# 32. Facility Progress

저장:

```text
approvedMilestones
facilityPercent
```

canonical light/audio/props는 여기서 재구성.

---

# 33. Progress 중간 animation 저장 금지

82→91→97→100 중간 display tween을 exact 저장하지 않는다.

CH8 final approval이 commit되었다면 reload 후 canonical 100%.

---

# 34. Document State

story-critical document는:

```text
logicalStatus
revision
archiveStatus
```

저장.

exact desk transform 불필요.

---

# 35. Document Side/Page

퍼즐상 의미 있을 때만.

대부분 reload 후 FRONT/page1이어도 진행에 문제 없음.

---

# 36. Archive Document

approved canonical record는 chapter completion에서 파생 가능.

중복 데이터 최소화.

---

# 37. NPC State

저장 우선:

```text
story role state
available/completed
```

exact pose/idle progress 저장 안 함.

---

# 38. NPC Canonical Reconstruction

checkpoint에 따라:

• work anchor
• conversation anchor
• offscreen
• group position

재구성.

---

# 39. Door

story-critical door만 semantic state 저장.

예:

```text
OPEN
CLOSED
```

animation progress 저장 안 함.

---

# 40. CH10 Phone State

최소:

```text
ON_CRADLE
CALL_ACTIVE
DROPPED
```

---

# 41. Phone call 중 reload

권장 safe checkpoint:

```text
PHONE_READY
PHONE_AFTER_THROW
```

긴 통화 중간 저장을 세밀하게 하지 않아도 됨.

---

# 42. Phone dialogue 시작 후 reload

안전한 정책:

통화의 의미 있는 시작 지점부터 다시.

단 throw가 이미 commit됐으면 통화 반복 금지.

---

# 43. Handset DROPPED

load:

• phone base table
• handset canonical floor pose
• cord canonical curve
• interaction disabled
• knock event eligibility 복구

---

# 44. Knock

전화 throw 이후 별도 story flag:

```text
knockReady
knockPlayed
```

필요.

---

# 45. Door CH10

door open 후 parcel pickup 이전 reload 시:

• door canonical open
• parcel outside
• interaction 가능

같이 재구성 가능.

---

# 46. Parcel State

저장:

```text
OUTSIDE
CARRIED
PLACED
OPEN
```

CARRIED 중 exact save는 피한다.

---

# 47. CARRY 중 autosave

기본적으로 critical autosave를 하지 않는다.

---

# 48. CARRY 중 reload

이전 safe checkpoint로.

예:

parcel outside 또는 placed.

---

# 49. String

parcel placed 후:

```text
TIED
REMOVED
```

semantic.

중간 slack amount 저장 없음.

---

# 50. Lid

```text
CLOSED
OPEN
```

---

# 51. Photo

저장:

```text
inspected: true/false
placed: true/false
```

둘을 별도로 둘 필요가 없다면 `COMPLETE`.

---

# 52. Medal

동일.

---

# 53. Photo/Medal 순서

어느 순서로 완료했든 정확히 저장.

---

# 54. Postcard readiness

파생:

```text
photoComplete && medalComplete
```

이면 postcard ready.

flag를 별도 저장하더라도 validate.

---

# 55. Postcard identity

states:

```text
HIDDEN
READY
IDENTITY_REVEALED
```

중간 flip 72° 저장 없음.

---

# 56. Identity revealed 후 reload

다시 이름 reveal을 요구하지 않는 것을 기본으로 한다.

profile 또는 reveal 완료 safe state.

---

# 57. Final Archive

저장 가능:

```text
archiveUnlocked
archiveIndex
archiveCompletedProfiles
```

---

# 58. Archive profile 중 reload

현재 profile 시작부터 또는 직전 완료 profile 다음.

중간 redaction animation frame 저장 안 함.

---

# 59. Final memory

CH1~7 stamp sound sequence 중간 저장 불필요.

짧은 non-skippable ending sequence.

focus loss 시 safe restart/complete 정책.

---

# 60. Ending complete

```text
endingReached = true
```

저장 가능.

---

# 61. Ending 재접속

ENDING CODE 이후 상태 또는 main menu/replay 정책으로.

강제로 Final Archive 전체 재실행하지 않는다.

---

# 62. CH9 Checkpoints

권장:

```text
CH09_PRE_RESULTS
CH09_RESULTS_STARTED
CH09_AFTER_FIRST
CH09_AFTER_SECOND
CH09_SUCCESS_READY
CH09_COMPLETE
```

---

# 63. CH9 results_started

VIEW RESULTS를 눌렀다고 바로 save할 필요는 없음.

첫 mission 완료까지 reload 시 PRE_RESULTS로 돌아갈 수 있음.

---

# 64. First mission 완료

MISSION RESULT / SUCCESS 확정 후:

```text
CH09_AFTER_FIRST
```

---

# 65. Second 완료

```text
CH09_AFTER_SECOND
```

---

# 66. SUCCESS? 전

필요하면 `CH09_SUCCESS_READY`.

---

# 67. CH9 focus loss

mission footage 중 background로 가면:

• 현재 long beat restart
또는
• 직전 checkpoint

정책.

중간 explosion frame 복원 금지.

---

# 68. CH9 reload abuse

player가 first mission을 본 직후 reload해서 완전히 건너뛸 수 있는 것이 문제가 아니라,
second mission 진입 상태가 꼬이지 않는 것이 우선.

---

# 69. Save write failure

story progression을 무조건 중단하지 않는다.

가능:

• retry
• backup
• memory
• warning

---

# 70. Storage unavailable

privacy mode/storage disabled.

게임은 session 동안 진행 가능.

다만 재개 불가 안내 가능.

---

# 71. Storage quota

save data는 매우 작아야 한다.

texture/base64 저장 금지.

---

# 72. Settings와 Story Save 분리

가능:

```text
nameless2_story
nameless2_settings
```

---

# 73. Settings

• volume
• sensitivity
• subtitle
• reduced motion
• reduced flash

story reset과 별개 유지 가능.

---

# 74. New Game

story save 초기화.

settings는 유지 가능.

---

# 75. Reset Confirmation

실제 데이터 삭제이므로 명확한 확인 UI 가능.

---

# 76. Dev Jump

개발에서는 chapter/checkpoint jump 기능 가능.

production 제거.

---

# 77. Save Inspector

개발:

```text
chapter
checkpoint
progress
flags
documents
objects
archive
saveVersion
```

---

# 78. Validate on Load

모든 id가 현재 build에 존재하는지 검사.

---

# 79. Invalid flag combination

예:

```text
postcardIdentityRevealed = true
photoComplete = false
```

같은 상태를 그대로 믿지 않는다.

---

# 80. Repair Rules

의존성이 명확하면 상위 상태 기준으로 canonical repair.

identity revealed이면 photo/medal complete로 보정 가능.

---

# 81. 보수적 repair

미래 chapter를 잘못 unlock하는 방향보다 이전 safe state로 되돌리는 방향 우선.

---

# 82. Spoiler safety

corrupted save 때문에 Final Archive/full names가 CH1에 로드되지 않게 chapter gating 재검증.

---

# 83. Save data public text

save JSON을 UI에 그대로 표시하지 않음.

---

# 84. Production debug

save에 full historical names가 내부 데이터로 존재할 수 있어도 production error UI로 노출되지 않게.

---

# 85. Transition race

save 완료 전 navigation을 여러 번 호출하지 않는다.

---

# 86. Async Save

localStorage는 sync지만 wrapper를 사용하더라도 sequence 순서 명확.

---

# 87. Cross-tab

두 탭에서 동시에 플레이할 가능성.

복잡한 sync는 필수 아님.

마지막 저장 우선 정책.

---

# 88. Timestamp

diagnostic용 timestamp 가능.

story 판단은 timestamp에 의존하지 않는다.

---

# 89. Resume UI

게임 재접속 시:

```text
CONTINUE
NEW GAME
```

정도 가능.

---

# 90. Continue label

현재 chapter 이름/스포일러를 과도하게 노출하지 않는다.

예:
“계속하기” 우선.

---

# 91. CH10 title spoiler

저장 메뉴에서 `J. ROBERT OPPENHEIMER`를 identity reveal 전에 표시 금지.

---

# 92. Resume blackout

scene canonical build 전 black overlay.

---

# 93. Pointer lock

resume fade 후 user gesture로 다시 획득.

---

# 94. Mobile resume

touch pointer state reset.

---

# 95. QA: refresh

각 checkpoint 직전/직후 새로고침.

---

# 96. QA: browser close

페이지 재접속.

---

# 97. QA: corrupted save

• invalid JSON
• missing field
• future version
• invalid checkpoint
• inconsistent flags

---

# 98. QA: stamp

impact 전/후.

---

# 99. QA: CH8

REJECTED, revision, final APPROVED, 100%.

---

# 100. QA: CH9

first result/second result/power-down.

---

# 101. QA: CH10

phone, door, parcel, photo, medal, postcard, archive.

---

# 102. QA: duplicate

load 후:
• NPC duplicate
• object duplicate
• audio loop duplicate
• light duplicate
없음.

---

# 103. QA: soft-lock

복원한 scene에서 next required interaction 실제 가능.

---

# 104. 금지사항

• exact animation frame 저장
• NPC raw transform 전체 저장
• camera tween progress 저장
• CARRY 중간 pose 저장
• stamp impact 후 재실행
• phone throw 재실행
• duplicate loops/lights/NPC
• corrupted save로 future spoiler unlock
• save 실패로 permanent black
• texture/base64를 localStorage 저장
• unload에만 저장 의존
• save schema version 없음

---

# 105. 후속 문서와 연결

`26_TIMING_AND_PACING.md`
• checkpoint 전후 호흡

`27_MOBILE.md`
• mobile resume/focus

`31_FAILURE_PREVENTION.md`
• corrupted state / soft-lock 복구

`32_COMMON_QA.md`
• 모든 checkpoint reload 전수 검사

각 CHAPTER `STATE.md`
• 실제 checkpoint와 canonical reconstruction 정의

<!-- MERGED SOURCE END: 25_SAVE_AND_RESUME.md -->

================================================================================
ORIGINAL SOURCE: 26_TIMING_AND_PACING.md
================================================================================

# 26_TIMING_AND_PACING.md

# TIMING AND PACING SPECIFICATION

이 문서는 게임 전체의 행동 속도, 대사 간격, 카메라 보간, 도장 타격, NPC 이동, 수정 몽타주, 시설 활성화, CH9 결과 영상의 정적, CH10 전화/엽서 reveal, Final Archive의 호흡을 정의한다.

핵심 목표:

• 모든 행동을 느리게 해서 “영화적”으로 만들지 않음
• 중요한 순간만 느려짐
• 반복 행동은 리듬을 변주
• 플레이어 입력 응답성 유지
• physical motion의 질량감 유지
• silence가 실제 의미를 가짐
• CH9/CH10의 후반 연출이 과속하지 않음

---

# 1. 기본 철학

좋은 pacing은 duration을 길게 만드는 것이 아니다.

구조:

```text
정보
→ 행동
→ 반응
→ 짧은 호흡
→ 다음 정보
```

을 명확히 하는 것이다.

---

# 2. 시간 단위

animation 시스템 공통:

```text
seconds
```

---

# 3. 글로벌 원칙

일반 interaction:
빠르고 즉각적.

story-critical physical action:
조금 더 명확.

emotional reveal:
충분한 hold.

---

# 4. 입력 반응

INTERACT 입력 후 visual response는 가능한 한 즉시 시작.

validation 때문에 0.5초 아무 반응 없는 느낌 금지.

---

# 5. Camera Focus

일반:

```text
0.25~0.45s
```

---

# 6. Dialogue Camera

```text
0.35~0.65s
```

---

# 7. Inspect Camera

```text
0.35~0.75s
```

---

# 8. Door / Phone Camera

```text
0.4~0.8s
```

---

# 9. Long Cinematic Reframe

```text
0.7~1.5s
```

필요 시.

---

# 10. 카메라 속도 반복 금지

모든 focus를 정확히 0.5초로 만들지 않는다.

거리/각도에 따라.

---

# 11. Snap 금지

0.1초 이하의 큰 camera rotation 금지.

---

# 12. 일반 문서 pickup

```text
0.3~0.6s
```

정도 시작값.

---

# 13. 문서 place

```text
0.25~0.5s
```

---

# 14. Document flip

```text
0.35~0.7s
```

---

# 15. Photo flip

일반 문서보다 약간 느리게 가능.

```text
0.5~0.9s
```

---

# 16. Postcard flip

정체 reveal 전 핵심.

```text
0.8~1.4s
```

후보.

---

# 17. Button

```text
0.08~0.18s press
0.08~0.2s release
```

---

# 18. Lever

```text
0.3~0.7s
```

크기/저항에 따라.

---

# 19. Door handle

```text
0.15~0.35s
```

---

# 20. Door open

일반:

```text
0.7~1.3s
```

---

# 21. CH10 Front Door

조금 더 관찰 가능:

```text
1.0~1.6s
```

정도.

---

# 22. NPC turn

작은 방향:

```text
0.2~0.5s
```

큰 방향:
movement system으로 full-body turn.

---

# 23. NPC walk speed

기존:

```text
normal 1.0~1.2 m/s
urgent 1.3~1.6
CH7 1.4~1.8
tired 0.8~1.0
```

---

# 24. NPC acceleration

```text
0.15~0.30s
```

---

# 25. NPC deceleration

마지막:

```text
0.25~0.45m
```

거리 기반.

---

# 26. Gesture

small nod:

```text
0.3~0.7s
```

look-away:
0.5~1.0s.

큰 gesture는 line 의미에 맞춤.

---

# 27. Gesture 반복

같은 nod duration를 모든 NPC에 복제하지 않는다.

---

# 28. Dialogue minimum hold

짧은 line도 player가 읽기 전에 advance cue가 즉시 뜨지 않게 최소 hold.

예:

```text
0.15~0.35s
```

---

# 29. Voice가 있을 경우

advance 가능 시점은 음성 길이와 별도 정책.

player가 원하면 voice 끝 전 skip을 허용할 수 있으나 one-line 원칙 유지.

---

# 30. Forced Pause

일반 emotional beat:

```text
0.5~1.5s
```

---

# 31. 긴 침묵

정말 중요한 장면에만:

```text
2~5s+
```

---

# 32. 도장 pickup

```text
0.35~0.65s
```

---

# 33. 도장 align

```text
0.25~0.5s
```

---

# 34. 도장 hover

일반:

```text
0.15~0.45s
```

---

# 35. CH5 hover

George “진심입니까?” 이후 더 길게.

```text
0.5~1.2s
```

후보.

---

# 36. CH8 REJECTED hover

room silence 포함:

```text
0.7~1.5s
```

후보.

---

# 37. Stamp downward

빠르게:

```text
0.08~0.16s
```

---

# 38. Impact hold

```text
0.08~0.20s
```

---

# 39. Stamp lift

```text
0.25~0.5s
```

---

# 40. Mark visibility hold

NPC reaction으로 camera가 이동하기 전:

```text
0.3~0.8s
```

---

# 41. Stamp return

```text
0.4~0.8s
```

---

# 42. CH1 REJECTED

빠른 리듬.

Richard의 수용이 빠름.

---

# 43. CH2

논리적/절제.

pause 짧음.

---

# 44. CH3

실무적.

기계 확인 rhythm.

---

# 45. CH4

정밀하고 짧음.

---

# 46. CH5

가장 긴 긴장.

REJECTED 전후 pause 명확.

---

# 47. CH6

조용한 relief.

침묵은 긴장보다 안도.

---

# 48. CH7

사고 기록 때문에 impact 후 silence 길게.

---

# 49. CH8

최종 반려/승인 모두 충분한 room reaction time.

---

# 50. Revision Montage

일반 shot:

```text
0.8~2.0s
```

---

# 51. CH8 montage

8명:

```text
0.7~1.4s each
```

모두 1.0초 고정 금지.

---

# 52. Montage 전체 길이

CH8:

대략 8~13초 범위에서 검토.

너무 길어 8명 소개 영상처럼 만들지 않는다.

---

# 53. Facility activation

한 group:

```text
0.3~0.8s
```

여러 group stagger:

```text
0.15~0.5s 간격
```

---

# 54. Progress board

숫자 변화:

```text
0.4~1.2s
```

기계 방식에 따라.

---

# 55. CH1~7 approval 후 hold

facility 변화를 읽을:

```text
1.5~3.5s
```

정도 후보.

---

# 56. CH8 100%

더 길게:

```text
3~6s
```

가능.

player가 success를 실제로 느껴야 함.

---

# 57. CH8→CH9

완성감 뒤 바로 0.5초 만에 결과 reveal 금지.

chapter break가 필요.

---

# 58. CH9 pre-results

casual dialogue는 평범한 pacing.

처음부터 모두 느려지면 reveal을 예고.

---

# 59. VIEW RESULTS

interaction → board active:

```text
1.5~3s
```

범위.

NPC gaze/light dim 포함.

---

# 60. First title card

`FIELD RECORD / 06 AUG 1945`

읽을:

```text
1.5~2.5s
```

---

# 61. Aircraft setup

너무 길지 않게.

전체 첫 mission setup 약:

```text
15~30s
```

후보.

정확한 footage design에서 결정.

---

# 62. Release

release 순간은 명확.

---

# 63. First silence

핵심:

```text
4~5s
```

목표 범위.

---

# 64. Flash

매우 짧음.

visual exposure recovery 포함:

```text
0.2~0.8s
```

---

# 65. Explosion hold

규모를 읽을 시간.

```text
3~6s
```

후보.

---

# 66. LITTLE BOY

텍스트 read:

```text
1.5~3s
```

---

# 67. SUCCESS first

```text
2~4s
```

후보.

NPC reaction time 포함.

---

# 68. First-to-second gap

최소:

```text
3~6s
```

정도의 room hold 가능.

---

# 69. Second setup

첫 번째보다 짧게.

---

# 70. Second silence

첫 번째보다 같거나 더 길 수 있음.

```text
5~7s
```

후보.

이미 무엇이 오는지 아는 시간을 활용.

---

# 71. FAT MAN / SUCCESS

첫 mission보다 연출 반복을 줄이되 읽을 시간 유지.

---

# 72. Final SUCCESS

```text
3~5s
```

---

# 73. SUCCESS_

아주 짧은 anomaly.

```text
0.3~0.8s
```

---

# 74. SUCCESS?

등장 후:

```text
3~6s
```

정적.

---

# 75. Hans glance

```text
0.6~1.2s
```

기존 범위 유지.

---

# 76. Power-down

한 번에 꺼지지 않음.

전체:

```text
4~8s
```

후보.

---

# 77. Black hold

CH9 끝:

```text
2~5s
```

가능.

---

# 78. CH10 fade in

home을 급하게 보여주지 않는다.

---

# 79. Radio

player가 자유롭게 듣게.

방송 전체를 듣지 않아도 다음 event 가능하게 할지 chapter에서 결정.

---

# 80. Phone ring delay

home entry 직후 즉시 0.2초에 울리면 공간을 볼 시간이 없음.

초기 탐색 호흡 후.

---

# 81. Ring interval

자연스러운 전화벨 cadence.

exact interval은 audio asset과 맞춤.

---

# 82. Phone pickup

```text
0.6~1.2s
```

---

# 83. Phone lines

한 줄마다 manual.

---

# 84. Phone forced pause

“대통령께서도—” 이전/후 등:

```text
0.8~2.0s
```

장면별.

---

# 85. “듣고 계십니까?”

이후 즉시 throw하지 않는다.

짧은 정지.

---

# 86. Handset lowering

```text
0.6~1.0s
```

---

# 87. Hesitation

```text
0.5~1.5s
```

---

# 88. Throw

release→impact:

```text
0.25~0.6s
```

---

# 89. Impact→floor settle

```text
0.5~1.2s
```

---

# 90. Floor caller

impact 후 너무 즉시 말하지 않는다.

```text
0.8~2s
```

정적 후.

---

# 91. Knock delay

player control 복귀 후 즉시 노크 금지.

짧게 room silence를 경험.

---

# 92. Door opening

앞서 정의한 1.0~1.6s.

---

# 93. Parcel pickup/place

질량감:

pickup:
0.7~1.2s.

place:
0.6~1.0s.

---

# 94. String

너무 퍼즐처럼 오래 끌지 않는다.

전체:

```text
1.5~3s
```

---

# 95. Lid

```text
0.8~1.4s
```

---

# 96. Photo inspect

player-driven.

자동 hold 강제 최소.

back text는 읽을 최소 시간.

---

# 97. Medal

동일.

---

# 98. Postcard pickup

```text
0.6~1.0s
```

---

# 99. Postcard flip

```text
0.8~1.4s
```

---

# 100. TO.

```text
0.8~1.5s
```

hold 후보.

---

# 101. J. ROBERT

```text
1.0~2.0s
```

---

# 102. OPPENHEIMER

```text
2~4s
```

최종 이름이 읽히고 의미가 도착할 시간.

---

# 103. Identity 후 input gate

전체 이름이 나온 뒤 최소:

```text
1.0~2.5s
```

---

# 104. Profile

player가 직접 continue.

최소 read gate:

```text
2~4s
```

---

# 105. Final Archive profile

각 인물:

```text
card 1~2s
flashback 0.8~1.5s
full profile manual hold
```

---

# 106. Archive 전체

너무 긴 credit sequence가 되지 않게.

manual continue 덕분에 player pace 허용.

---

# 107. Last Memory stamps

CH1~7:

각 sound 사이:

```text
0.5~1.2s
```

정도.

---

# 108. CH8 APPROVED sound

이전 sounds보다 분리.

---

# 109. Final silence

최소:

```text
2~5s
```

후 ENDING CODE.

---

# 110. Repeat interaction pacing

already-read document 다시 inspect:
첫 진입 camera를 더 짧게 할 수 있음.

---

# 111. Wrong attempt feedback

긴 failure animation 금지.

빠르게 돌아와 다시 생각할 수 있게.

---

# 112. Exploration

걷는 거리로 pacing 늘리지 않는다.

---

# 113. Long corridor

의도된 5초 이동은 가능.

20초 빈 복도는 피한다.

---

# 114. Input lock 체감

필요 이상으로 lock을 길게 유지하지 않는다.

animation rest pose가 끝나면 바로 반환.

---

# 115. Mobile pacing

touch interaction은 PC보다 약간 더 generous한 debounce 가능.

story duration 자체는 동일.

---

# 116. Reduced Motion

camera tween 짧게.

story pause는 유지.

---

# 117. Reduced Flash

CH9 flash duration/brightness 감소.

silence/timeline 유지.

---

# 118. Performance hitch

low FPS라고 animation wall-clock duration이 2배 길어지지 않게.

---

# 119. Background tab

elapsed time을 그대로 따라가 중요한 장면을 건너뛰지 않음.

checkpoint recovery.

---

# 120. Pacing Debug

개발:

```text
sequence
beat
duration
actual elapsed
input wait
forced hold
```

---

# 121. Telemetry 없이도 QA

직접 전체 플레이 영상의 타임라인을 기록해 반복/지연 구간 검토.

---

# 122. CH1~8 반복 QA

같은:

• stamp
• dialogue
• montage
• progress

리듬이 8번 복제되지 않는지.

---

# 123. CH9 QA

silence를 실제 stopwatch로 확인.

---

# 124. CH10 QA

전화→노크→상자→엽서가 계속 이벤트 폭격처럼 이어지지 않는지.

---

# 125. 금지사항

• 모든 animation 느리게
• 모든 camera 0.5s
• 모든 NPC 같은 walk/turn timing
• 도장 ritual 완전 동일
• CH8 100% 즉시 transition
• CH9 silence 축소
• CH9 두 mission copy timing
• SUCCESS? 0.5초만 보여주기
• CH10 phone 뒤 즉시 knock
• postcard 이름 한 프레임에 전체 공개
• Final Archive 자동 초고속 진행
• input lock 불필요하게 지속

---

# 126. 후속 문서와 연결

`27_MOBILE.md`
• touch debounce/readability에 따른 pacing 보정

`28_PERFORMANCE.md`
• frame hitch에도 wall-clock pacing 유지

`31_FAILURE_PREVENTION.md`
• timer/race/lock failure 대응

각 CHAPTER `ANIMATION.md`, `DIALOGUE.md`, `STATE.md`
• 최종 beat duration 확정

<!-- MERGED SOURCE END: 26_TIMING_AND_PACING.md -->

================================================================================
ORIGINAL SOURCE: 27_MOBILE.md
================================================================================

# 27_MOBILE.md

# MOBILE SPECIFICATION

이 문서는 모바일 브라우저에서 NAMELESS Ⅱ의 1인칭 탐색, 시점 조작, 상호작용, 대화, 문서 조사, 도장, carry, CH9 board, CH10 전화/상자/엽서가 안정적으로 작동하도록 하는 공통 규칙을 정의한다.

핵심 목표:

• PC와 동일한 논리/퍼즐
• 작은 화면에서도 문서/오브젝트 가독성 유지
• 좌 joystick / 우 look / action 입력 충돌 없음
• pointerId 분리
• pointercancel/focus loss 안전
• 화면 과밀 UI 방지
• 모바일만 별도의 쉬운 답 제공 금지
• 저사양에서도 story-critical 품질 유지
• orientation 변화로 state가 깨지지 않음

---

# 1. 기본 방향

모바일은 PC 버전을 축소한 것이 아니다.

입력 방식과 화면 비율이 다르므로:

```text
같은 게임 논리
+
다른 입력 표면
+
다른 framing 보정
```

을 사용한다.

---

# 2. 기본 Orientation

권장:

```text
LANDSCAPE
```

1인칭 view, 문서 비교, board framing에 유리.

---

# 3. Portrait

portrait에서는:

• landscape 권장 안내
• 즉시 reload하지 않음
• 현재 state 보존

가능.

---

# 4. Orientation Lock

브라우저 API가 항상 허용된다고 가정하지 않는다.

orientation lock 실패해도 게임이 망가지지 않게.

---

# 5. Safe Area

notch / gesture bar 고려.

CSS:

```text
env(safe-area-inset-*)
```

활용 가능.

---

# 6. Touch Zones

기본:

```text
LEFT
MOVEMENT

RIGHT
LOOK

ACTION
CONTEXT
```

---

# 7. PointerId

왼쪽 joystick과 오른쪽 look은 서로 다른 pointerId를 추적.

한 손가락이 다른 시스템으로 넘어가지 않음.

---

# 8. Multi-touch

최소 2 pointer 안정 지원.

문서 pinch zoom을 추가하면 state별 별도 gesture ownership.

---

# 9. Pointer Capture

필요한 control은 pointer capture 활용 가능.

하지만 `pointercancel` 대응 필수.

---

# 10. pointercancel

발생 시:

• joystick center
• movement vector 0
• look delta clear
• held action clear

---

# 11. visibilitychange / blur

동일.

화면 복귀 후 이전 손가락이 눌린 것으로 남지 않음.

---

# 12. Left Joystick

고정 또는 floating 방식 가능.

권장:
floating origin within left control region.

---

# 13. Deadzone

작은 손 떨림으로 이동하지 않게.

예 시작값:

```text
0.10~0.18 normalized
```

실제 QA로.

---

# 14. Max Radius

손가락이 너무 멀어져도 UI가 따라 화면 끝까지 가지 않게 제한.

---

# 15. Movement speed

PC와 gameplay 기준 동일.

모바일이라고 world speed를 크게 낮추지 않는다.

---

# 16. Analog movement

joystick magnitude로 속도 조절 가능.

기본 걷기 중심.

---

# 17. Right Look

오른쪽 빈 영역 drag.

touch delta → yaw/pitch.

---

# 18. Look Sensitivity

PC mouse와 별도 setting.

---

# 19. Look Acceleration

과도한 acceleration 금지.

일관된 손가락 이동 대응이 중요.

---

# 20. Vertical Sensitivity

작은 landscape 세로 영역 때문에 horizontal보다 약간 낮출 수 있음.

---

# 21. Pitch Clamp

PC와 동일 camera policy.

---

# 22. Interaction Action

작은 world mesh를 직접 탭하게 강요하지 않는다.

방식:

```text
center reticle target
+
ACTION button
```

을 기본 권장.

---

# 23. Direct Tap

보조로 direct touch interaction을 지원할 수 있음.

같은 interaction registry/validation 사용.

---

# 24. 두 방식 충돌

direct tap과 center action이 같은 frame에 두 번 호출되지 않게 one-shot guard.

---

# 25. Action Button

오른쪽 아래.

thumb reach 안.

look zone과 충분히 분리.

---

# 26. Action Label

상태별:

```text
확인
읽기
대화
열기
집기
놓기
찍기
```

짧게.

---

# 27. Dynamic Control Visibility

FREE:
joystick/look/action.

DIALOGUE:
movement 숨김 또는 disabled.

INSPECT:
movement 숨김, inspect controls.

STAMP:
action만.

CINEMATIC:
모두 숨김.

---

# 28. UI disappearance

control을 opacity만 0으로 하고 touch area가 남지 않게 pointer-events 상태도 변경.

---

# 29. Dialogue Advance

화면 하단/넓은 safe tap area.

action button으로도 가능.

---

# 30. One tap = one line

double tap/rapid pointerdown으로 두 줄 진행 금지.

---

# 31. Dialogue Look

allowLook=true이면 오른쪽 look zone 유지.

---

# 32. INSPECT

기본:

• object stable center
• drag rotate 필요 시
• flip button
• zoom
• close

---

# 33. Inspect Rotate

문서처럼 rotation이 필요 없는 object에 free 3D spin 남발 금지.

---

# 34. Document

읽는 것이 우선.

finger가 text 위를 가리지 않도록 controls는 외곽.

---

# 35. Pinch Zoom

지원 시:

• two-pointer inspect owner
• world look 차단
• min/max zoom clamp

---

# 36. Zoom Button fallback

pinch가 불편하면 + / - 또는 tap zoom.

---

# 37. Compare

작은 화면에서 두 문서 전체를 동시에 작게 보여주는 것보다:

```text
LEFT focus
RIGHT focus
```

빠른 전환을 제공.

---

# 38. Compare memory burden

좌/우 전환이 너무 느리면 안 됨.

0.15~0.3s 정도 짧은 pan/focus 후보.

---

# 39. Stamp

모바일에서 도장 위치를 drag해서 정확히 맞추게 하지 않는다.

story-approved stamp area에 자동 정렬.

---

# 40. Stamp Flow

```text
도장 선택
→ pose settle
→ ACTION
→ impact
```

---

# 41. Stamp double tap

impact 1회.

---

# 42. Haptic

가능하면 매우 짧은 impact haptic.

optional.

---

# 43. Carry

joystick + look.

ACTION = valid placement.

---

# 44. Carry look range

상자 clipping을 줄이기 위해 free look보다 약간 제한 가능.

---

# 45. Carry Door

door operation 금지.

기존 규칙 유지.

---

# 46. Door

ACTION으로 handle sequence.

작은 handle 직접 tap 불필요.

---

# 47. Phone

ringing phone reticle target + ACTION.

---

# 48. Phone Dialogue

handset이 screen 일부 차지.

subtitle와 action area가 겹치지 않음.

---

# 49. Handset Throw

시네마틱.

touch controls 제거.

---

# 50. Knock / Door

player가 자유 look으로 발견.

objective arrow 없음.

---

# 51. Parcel

CARRY button state 명확.

---

# 52. Photo/Medal

작은 world object이므로 interaction proxy 확대.

---

# 53. Postcard

interaction proxy는 reveal 후에만.

---

# 54. Postcard Reveal

controls 최소.

flip/continue cue가 이름을 가리지 않음.

---

# 55. CH9 Board

landscape에서 board 전체와 NPC 일부가 보이게.

---

# 56. Board Viewing Zone

PC보다 필요 시 camera position/FOV를 조금 조정할 수 있음.

논리적 위치는 동일.

---

# 57. Board Text

작은 화면에서도:

• date
• LITTLE BOY
• FAT MAN
• SUCCESS?

명확히 읽힘.

---

# 58. Fullscreen Board 금지

모바일이라고 board를 완전 fullscreen video로 대체하지 않는다.

room 감각 유지.

---

# 59. Subtitle + Board

board 중요 text와 subtitle가 겹치지 않음.

CH9에는 NPC 대사가 거의 없어 유리.

---

# 60. White Flash

reduced flash 설정 지원 고려.

---

# 61. Mobile Performance Profile

자동 또는 설정 기반:

```text
HIGH
BALANCED
LOW
```

가능.

---

# 62. LOW에서도 유지

• major NPC
• document readability
• board
• story object
• interaction
• audio
• state

---

# 63. 줄일 수 있는 것

• shadow resolution
• background NPC animation frequency
• small prop count
• particles
• secondary lights
• normal map detail
• reflection

---

# 64. DPR

무조건 devicePixelRatio 그대로 사용 금지.

cap 권장.

예:

```text
1.25~2.0
```

기기 성능에 따라.

---

# 65. Dynamic Resolution

필요하면 일정 frame drop 시 DPR를 낮출 수 있음.

story-critical inspect 중 갑작스러운 해상도 변화는 피함.

---

# 66. Touch Latency

ACTION은 pointerup까지 오래 기다릴 필요가 없는 경우 pointerdown 기반 가능.

단 drag gesture와 충돌하지 않게.

---

# 67. Scroll Prevention

game canvas gesture가 browser scroll/zoom으로 먹히지 않게 적절한 CSS touch-action.

---

# 68. Browser Navigation Gesture

화면 edge swipe가 OS/browser back과 충돌할 수 있음.

중요 control을 edge에 붙이지 않는다.

---

# 69. Address Bar

모바일 browser UI가 viewport height를 바꿀 수 있음.

`visualViewport` 또는 resize 대응.

---

# 70. Resize

camera aspect, renderer size, UI layout 갱신.

game state는 유지.

---

# 71. Orientation Change 중 CINEMATIC

중단하지 않는다.

필요하면 black/safe pause 후 layout 재계산.

---

# 72. Orientation Change 중 INSPECT

object anchor 재계산.

문서가 화면 밖으로 나가지 않음.

---

# 73. Keyboard accessory

모바일에서 text input이 없으므로 virtual keyboard를 띄우는 UI 금지.

---

# 74. Hover 없음

hover-only interaction 정보 금지.

---

# 75. Long Press

핵심 interaction에 long press 요구 금지.

---

# 76. Small Text

최소 실사용 viewport에서 테스트.

CSS px 하나로 고정하지 않고 clamp 사용 가능.

---

# 77. Subtitle

기본 2~3줄 이내.

긴 문장은 dialogue 설계에서 분리.

---

# 78. Interaction Label

한 줄.

---

# 79. Touch Target

권장 최소 hit area:

```text
44~48 CSS px 이상
```

실제 accessibility 기준 수준.

---

# 80. Control Opacity

world visibility를 방해하지 않도록 낮지만 위치 인지 가능.

---

# 81. Left/Right Handed

필요하면 joystick/action 좌우 swap 옵션 고려.

필수는 아님.

---

# 82. Sensitivity

모바일 setting:

```text
LOOK SENSITIVITY
INVERT Y optional
```

---

# 83. Reduced Motion

head bob 감소/제거.

camera tween 단축.

---

# 84. Motion Sickness

급격한 FOV 변화, camera shake 최소.

---

# 85. Head Bob

모바일 기본 강도를 desktop보다 낮게 시작 가능.

---

# 86. Camera Shake

stamp/impact 모두 매우 작게.

---

# 87. Audio

mobile speaker에서도 dialogue/stamp/phone ring intelligible.

---

# 88. Silent Mode

browser/platform 정책 때문에 audio autoplay 불가.

첫 user gesture 후 AudioContext resume.

---

# 89. Start Gate

게임 시작 user gesture로:

• audio
• fullscreen optional
• controls

준비.

---

# 90. Chapter Page Entry

새 page에서 audio context가 다시 user gesture를 요구할 수 있음.

pointer lock과 마찬가지로 browser 정책 검증.

---

# 91. Resume

background에서 돌아오면:

• pointers reset
• audio resume
• dt reset
• current state rebuild if needed

---

# 92. Save

orientation/focus 변화마다 저장하지 않는다.

semantic checkpoint 동일.

---

# 93. Thermal Throttling

긴 CH8/CH9 session에서 성능 저하 가능.

quality degradation가 story를 깨지 않게.

---

# 94. Battery

continuous high-cost effects 최소.

---

# 95. Device Test Matrix

최소:

• mid-range Android
• recent Android flagship
• iPhone Safari
• tablet class optional

---

# 96. Browser Test

• Chrome Android
• Samsung Internet 가능
• Safari iOS

---

# 97. Touch QA

• one finger
• two fingers
• pointercancel
• edge swipe
• rapid tap
• orientation
• background/return

---

# 98. Puzzle QA

PC와 모바일 정답/정보량 동일.

---

# 99. Document QA

모든 핵심 text 읽힘.

---

# 100. CH8 QA

8 NPC + UI + final report 안정.

---

# 101. CH9 QA

board/flash/power-down frame pacing.

---

# 102. CH10 QA

phone, parcel, photo, medal, postcard.

---

# 103. 금지사항

• PC UI 축소 복붙
• 작은 mesh 직접 tap 강요
• hover-only
• long press 핵심 interaction
• joystick/look pointer 혼선
• pointercancel 미처리
• mobile에서 puzzle 답 강조
• board fullscreen 대체
• 문서 text 너무 작음
• controls가 subtitle/text 가림
• devicePixelRatio 무제한
• 저사양에서 story object 품질 제거
• orientation change reload
• background return 후 movement stuck

---

# 104. 후속 문서와 연결

`28_PERFORMANCE.md`
• 모바일 GPU/CPU budget

`31_FAILURE_PREVENTION.md`
• touch/focus/orientation failure

`32_COMMON_QA.md`
• device/browser matrix

<!-- MERGED SOURCE END: 27_MOBILE.md -->

================================================================================
ORIGINAL SOURCE: 28_PERFORMANCE.md
================================================================================

# 28_PERFORMANCE.md

# PERFORMANCE SPECIFICATION

이 문서는 Three.js 기반 NAMELESS Ⅱ의 프레임 안정성, 메모리, draw call, texture, NPC, shadow, audio, animation, DOM/UI, chapter asset loading, 모바일 품질 저하 정책을 정의한다.

최악 조건은 CH8/CH9를 기준으로 한다.

핵심 목표:

• story-critical animation이 frame drop으로 깨지지 않음
• CH8 8 NPC 장면 안정
• CH9 board + 8 NPC + lighting 안정
• CH10 고해상도 문서/오브젝트 집중 장면 안정
• 모바일에서 가독성 유지
• 챕터별 필요한 asset만 로드
• memory leak 없이 페이지/장면 전환
• CanvasTexture 등 매-frame 재생성 금지

---

# 1. 기본 철학

성능 최적화는 마지막에 모델을 무작정 낮추는 작업이 아니다.

처음부터:

```text
챕터 범위 제한
+
공통 asset 재사용
+
story-critical 우선순위
+
background 비용 제한
```

으로 설계한다.

---

# 2. 목표 FPS

권장 목표:

desktop:
```text
60 fps 우선
```

mobile:
```text
30 fps 안정 최소
60 fps 가능하면
```

story timing은 frame count가 아니라 wall-clock 기반.

---

# 3. Worst Case

CH8:

• 8 major NPC
• final room
• report/archive
• multiple equipment groups
• lighting/shadows
• gestures

CH9:

• 8 NPC
• board animated content
• white flash
• audio
• power-down

---

# 4. Chapter Asset Scope

chapter01.html은 CH10 home asset을 로드하지 않는다.

각 페이지는 필요한 asset subset만.

---

# 5. Shared Core

공유:

• common JS
• common CSS
• common material/primitive asset 일부

chapter-specific:
• room
• puzzle docs
• unique animations
• unique audio

---

# 6. Preload

현재 chapter critical assets.

다음 chapter 전부를 미리 로드할 필요 없음.

---

# 7. Asset Priority

```text
CRITICAL
IMPORTANT
DECORATIVE
```

---

# 8. CRITICAL

• player/camera core
• major NPC
• story document
• stamp
• board
• phone
• postcard
• dialogue/audio critical

로드 완료 전 gameplay 진입 금지.

---

# 9. DECORATIVE

누락 시 생략 가능.

---

# 10. Geometry

story object close-up:
상대적 detail 높음.

background:
단순.

---

# 11. NPC Geometry

8명의 major NPC는 얼굴/손 silhouette를 유지.

body 아래 보이지 않는 detail을 과도하게 늘리지 않는다.

---

# 12. NPC LOD

거리별:

```text
LOD0 dialogue/close
LOD1 room
LOD2 distant
```

---

# 13. Facial Animation

멀리 있는 NPC는 update frequency 감소 가능.

---

# 14. Skeleton Update

offscreen/background NPC animation update throttling 고려.

story-critical cue는 full-rate.

---

# 15. Idle Animation

모든 NPC가 복잡한 idle layer를 매 frame 계산하지 않게.

---

# 16. CH8 Group

major reactions이 없는 동안 일부 background gesture frequency 감소.

---

# 17. CH9

board cinematic 중 NPC root movement 거의 없음.

gesture/reaction만 필요한 시점에 활성.

---

# 18. Draw Calls

material reuse/mesh merge 적극 활용.

정확한 절대 budget은 실제 target device profiling 후 확정.

---

# 19. Static Merge

• wall
• floor
• ceiling
• non-interactive props

적절히 merge.

---

# 20. Merge 주의

interaction/door/animated object는 merge하지 않는다.

---

# 21. Instancing

반복 chair/crate/lamp 등 가능.

---

# 22. Texture

고해상도 우선:

• document
• board
• photo
• postcard
• major face

---

# 23. Background Texture

압축/낮은 해상도 가능.

---

# 24. Texture Atlas

small labels/props.

---

# 25. CanvasTexture

문서/board가 필요하면 상태 변화 때만 redraw.

매 RAF redraw 금지.

---

# 26. Board Content

가능한 구현:

• pre-rendered video
• texture sequence
• canvas timeline

중 성능/동기화 최적 선택.

---

# 27. Board Video

브라우저 autoplay/codec/seek 정책 검증.

semantic marker 동기화가 필요하면 video time만 맹신하지 않음.

---

# 28. Texture Memory

CH10 high-res photo/postcard + archive portraits가 동시에 모두 GPU에 올라가지 않게 lifecycle 관리 가능.

---

# 29. Mipmaps

읽는 texture는 적절히.

UI canvas와 world texture 구분.

---

# 30. Shadows

가장 큰 비용 중 하나.

---

# 31. Shadow Casters

우선:

• major NPC
• door
• major furniture
• player-visible story object 일부

---

# 32. Shadow 제외

• pencil
• tiny paper
• cable
• indicator
• distant prop

---

# 33. Shadow Lights

동시 수 제한.

한 방 여러 task lamp가 있어도 모두 dynamic shadow light일 필요 없음.

---

# 34. Mobile Shadows

LOW:
major light 1개 또는 최소.

---

# 35. Emissive

indicator/board를 실제 light 대신 활용.

---

# 36. Particles

CH5 dust/CH9 board footage 외 제한.

---

# 37. Particle Count

화면 밖/종료 후 즉시 cleanup.

---

# 38. Transparent Materials

glass/CRT/FX 최소.

sorting 비용/문제 주의.

---

# 39. Post Processing

기본 최소.

• tone mapping
• subtle effects

복수 full-screen passes 남발 금지.

---

# 40. Bloom

필요한 scene에서만.

모바일 LOW에서는 off 가능.

---

# 41. DOF / Motion Blur

기본 off 또는 매우 제한.

성능과 가독성 모두.

---

# 42. Animation Loop

하나의 global RAF.

subsystem별 RAF 금지.

---

# 43. Animator

active animation만 update.

완료 tween list에서 제거.

---

# 44. Object Idle

정적인 object를 매 frame update하지 않는다.

---

# 45. Look/Raycast

interaction raycast를 모든 scene mesh에 수행 금지.

interaction layer만.

---

# 46. Raycast Frequency

매 frame 가능하더라도 target 수 제한.

mobile에서는 필요 시 throttling.

---

# 47. Spatial Partition

room/zone 기준 interaction registry 활성 subset.

---

# 48. Collision

triangle physics 없음.

simple collider.

---

# 49. Collision Broad Phase

nearby NPC/door/large object 중심.

---

# 50. NPC Avoidance

복잡한 continuous crowd solver 금지.

authored route/reservation.

---

# 51. Audio

simultaneous node/loop 제한.

---

# 52. Audio Cleanup

chapter transition/page unload.

---

# 53. DOM UI

subtitle/hints 몇 개.

매 frame DOM style/layout 재계산 최소.

---

# 54. Resize

실제 viewport 변화 때만 renderer size 조정.

---

# 55. DevicePixelRatio

cap.

desktop high-DPI도 무제한 4x 렌더 금지.

---

# 56. Dynamic Quality

평균 frame time 악화 시:

1. DPR 감소
2. shadow quality 감소
3. secondary particles off
4. background NPC update 낮춤

순.

---

# 57. Story Quality 보호

마지막까지 유지:

• main NPC animation
• document readability
• board text
• phone/postcard
• interaction timing

---

# 58. Frame Hitch

animation dt clamp:

```text
약 0.05~0.1s
```

기존 원칙.

---

# 59. Hitch에서 Story Timing

긴 wall-clock skip을 그대로 적용해 cinematic marker를 여러 개 한 frame에 폭발시키지 않음.

---

# 60. Marker Catch-up

필요 marker는 순서대로 한 번씩.

---

# 61. Background Tab

RAF pause 후 복귀.

dt reset/recovery.

---

# 62. Garbage Collection

animation 중 대량 object allocation 금지.

---

# 63. Vector Reuse

hot path에서 Vector3/Quaternion 새 객체 남발 최소.

---

# 64. Event Listener

chapter setup/cleanup 명확.

---

# 65. Memory Leak

반복 reload/replay test에서 heap 증가 확인.

---

# 66. Three.js Dispose

같은 page 내부에서 asset 교체 시:

• geometry
• material
• texture

ref 관리.

페이지 navigation이면 브라우저 cleanup을 활용.

---

# 67. Shared Resource

한 object가 shared material을 dispose해 다른 mesh가 깨지지 않게.

---

# 68. Document Texture Cache

같은 approved record를 다시 열 때 재생성하지 않아도 됨.

---

# 69. Archive

Final Archive portrait는 필요 시 순차 로딩/해제 가능.

---

# 70. CH1~7

비교적 가벼움.

초반 performance가 좋다고 전체가 충분하다고 판단 금지.

---

# 71. CH8 Stress Profile

측정:

• FPS
• frame time
• draw calls
• triangles
• texture memory
• active animations
• shadow passes

---

# 72. CH9 Stress Profile

board 영상 재생 중 측정.

---

# 73. CH10 Stress Profile

phone cord + parcel + high-res story objects + home props.

---

# 74. Mobile Thermal Test

10~20분 플레이 후 성능 확인.

---

# 75. Loading Time

첫 playable state까지 불필요한 asset 로드 제거.

---

# 76. Lazy Loading

decorative/late cinematic asset 가능.

단 critical beat 직전 hitch 없게 충분히 앞서.

---

# 77. Audio Decode

critical audio를 장면 직전에 decode하다 hitch 금지.

---

# 78. Shader Compile

중요 material을 첫 cinematic 순간에 처음 보여 shader hitch가 생기지 않게 warm-up 가능.

---

# 79. Board Flash

white flash에 새 shader/material 생성하지 않고 미리 준비.

---

# 80. Postcard Reveal

이름 reveal texture/material도 미리 준비하되 rendering/spoiler state는 잠금.

---

# 81. Performance Debug HUD

개발:

```text
FPS
frame ms
draw calls
triangles
textures
programs
active tweens
NPC updates
audio nodes
```

---

# 82. Profiler Build

debug overlay가 production performance에 영향 주지 않게 분리.

---

# 83. Budget Decision

절대 수치는 실제 기기 측정 후 확정.

문서에 근거 없이 “draw call 100 이하” 같은 숫자를 고정하지 않는다.

---

# 84. Regression Test

새 prop/NPC/light 추가 후 CH8/CH9 다시 profile.

---

# 85. Visual Regression

최적화 후:

• document blur
• NPC face degradation
• shadow floating
• board banding

검사.

---

# 86. Functional Regression

quality LOW에서도 interaction collider/proxy 동일.

---

# 87. Mobile LOW

답이나 clue가 사라지지 않음.

---

# 88. Audio Performance

loop가 많아 frame을 직접 낮추지는 않더라도 memory/CPU 검토.

---

# 89. Video Codec

CH9 board video 사용 시 대상 브라우저 지원 format 확인.

필요하면 fallback.

---

# 90. Asset Size

고해상도 archive/board 영상이 전체 다운로드를 과도하게 키우지 않게.

---

# 91. Caching

정적 asset cache 활용 가능.

save/version과 cache busting 구분.

---

# 92. Network Failure

게임이 이미 chapter asset을 로드한 뒤에는 story-critical mid-scene fetch 최소.

---

# 93. Offline

필수 요구는 아니지만 이미 로드한 chapter는 네트워크 끊김으로 즉시 깨지지 않는 것이 좋음.

---

# 94. QA: low FPS

CPU/GPU throttling으로 15~20fps.

story marker/locks 검사.

---

# 95. QA: high DPR

고해상도 기기.

---

# 96. QA: memory

chapter 반복/Final Archive 진행.

---

# 97. QA: page transition

이전 audio/RAF가 남지 않음.

---

# 98. QA: CH8

8 NPC gesture 동시.

---

# 99. QA: CH9

flash/video/power-down.

---

# 100. QA: CH10

phone throw/cord/box/postcard.

---

# 101. 금지사항

• 모든 asset 한 번에 로드
• subsystem별 RAF
• 매 frame CanvasTexture redraw
• 모든 mesh raycast
• triangle collision
• indicator마다 light
• 모든 prop shadow
• DPR 무제한
• low-end에서 story text 제거
• CH8 profile 없이 release
• frame hitch로 markers skip
• archive portrait 전부 상시 GPU resident
• shared material 잘못 dispose
• background tab 복귀 giant dt

---

# 102. 후속 문서와 연결

`31_FAILURE_PREVENTION.md`
• performance hitch / missing asset / lifecycle 실패 대응

`32_COMMON_QA.md`
• 성능 regression matrix

<!-- MERGED SOURCE END: 28_PERFORMANCE.md -->

================================================================================
ORIGINAL SOURCE: 29_SPOILER_RULES.md
================================================================================

# 29_SPOILER_RULES.md

# SPOILER RULES SPECIFICATION

이 문서는 NAMELESS Ⅱ의 핵심 구조인 “CH1~8에서 프로젝트의 무기적 의미와 플레이어 정체를 숨기고, CH9에서 결과의 의미를 공개하며, CH10에서 플레이어가 J. Robert Oppenheimer였음을 공개한다”는 정보 통제 규칙을 정의한다.

이 규칙은 대사뿐 아니라:

• 문서
• texture
• object
• architecture
• UI
• asset label
• debug
• save/resume
• audio
• signage
• silhouette
• filenames가 production UI에 노출되는 경로

까지 포함한다.

---

# 1. 공개 단계

정보 공개는 네 단계.

```text
LEVEL 0
CH1~8

LEVEL 1
CH9 results

LEVEL 2
CH10 pre-postcard

LEVEL 3
POSTCARD / FINAL ARCHIVE
```

---

# 2. LEVEL 0

CH1~8.

player가 알아야 하는 것:

• 비밀 연구시설
• 거대한 연구 프로그램
• 자신이 책임자
• 여러 과학자
• 정확성/검증이 중요
• progress가 상승

알면 안 되는 것:

• 핵무기 프로젝트임
• 실제 mission 결과
• Oppenheimer identity
• 주요 NPC surname

---

# 3. CH1~8 직접 금지어

player-facing:

```text
atomic bomb
nuclear bomb
bomb
detonator
detonation
implosion lens
explosive lens
Fat Man
Little Boy
Trinity
Hiroshima
Nagasaki
Manhattan Project
Oppenheimer
```

---

# 4. 의미 우회도 금지

단어만 바꿔도 명백하면 안 된다.

예:

```text
도시에 투하할 장치
핵분열 폭발 장치
폭발 렌즈 조립
항공기 탑재 폭탄
```

---

# 5. 허용 일반화

```text
particle measurement
high-speed recording
multi-channel synchronization
material test
pressure transmission
sample analysis
field test
experimental assembly
research program
```

---

# 6. 과학 정확성과 spoiler

실제 역사 프로젝트의 과학을 그대로 재현해 weapon function을 추론 가능하게 만들 필요 없음.

게임 puzzle은 자료 검증에 집중.

---

# 7. CH1 Richard

계산 chain.

실제 핵무기 핵심 계산/설계가 아니라 generic calculation validation.

---

# 8. CH2 Enrico

조건/규정 검토.

무기 성능 목표 없음.

---

# 9. CH3 Luis

instrument calibration.

---

# 10. CH4 John

generic multi-channel high-speed recording.

---

# 11. CH5 George

material transmission / directional delay.

실제 explosive lens 최적화 세부를 제공하지 않음.

---

# 12. CH6 Emilio

sample anomaly.

---

# 13. CH7 Kenneth

incident reconstruction.

---

# 14. CH8 Hans

final consolidated report.

여전히 generic project report.

---

# 15. 성명 규칙

CH1~8 speaker/display:

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

---

# 16. Surname

검열:

```text
RICHARD ███████
```

가능.

---

# 17. Full Names

Final Archive 이전 직접 표시 금지.

---

# 18. 역사 지식으로 추론 가능성

Enrico, Hans 같은 first name만으로 일부 플레이어가 추론할 수는 있다.

게임이 이를 추가로 확인해 주지 않는 것이 중요.

---

# 19. Voice Actor/Portrait

실존 인물 likeness가 지나치게 정확하면 surname 없이도 알아볼 수 있음.

역사적 recognizable quality와 mystery 사이 균형.

완전 anonymization이 목표는 아니지만 의도된 reveal을 훼손하지 않게.

---

# 20. Player Identity

CH10 postcard 이전:

• 이름 없음
• 얼굴 없음
• reflection 없음
• ID card 없음
• personal letter 없음
• signature 없음
• house mail 없음
• radio/phone에서 surname 없음

---

# 21. 호칭

허용:

```text
박사님
책임자님
Director
```

---

# 22. Player hands

특정 identity engraving/ring/initial 금지.

---

# 23. Mirror

플레이어 얼굴을 보여주는 반사 금지.

---

# 24. Shadow

특정 인물 silhouette/헤어를 명확히 보여 identity leak 금지.

일반 first-person body shadow도 필요 없다.

---

# 25. CH9 공개

이 시점에서 처음으로 weapon 결과를 직접 공개.

---

# 26. CH9 허용

```text
06 AUG 1945
LITTLE BOY
09 AUG 1945
FAT MAN
MISSION RESULT
SUCCESS
```

---

# 27. Hiroshima / Nagasaki

결과 영상/정보에 포함 가능.

storyboard에 따라 location text 직접 표시 가능.

기본 역사 맥락에서는 허용.

---

# 28. CH9에서 Player Name

여전히 금지.

player가 누구인지 CH10까지 미확정.

---

# 29. CH9 NPC Surname

여전히 Final Archive까지 숨기는 것을 기본.

weapon 의미 공개와 scientist full identity 공개를 분리.

---

# 30. CH9 대사

NPC가:

“우리가 원자폭탄을 만들었군요”
“히로시마를 파괴했습니다”

같은 설명 대사 금지.

영상과 침묵이 말함.

---

# 31. CH9 Board

직접 사실을 보여주는 핵심 공간.

정보를 अस्पष्ट하게 다시 숨기지 않는다.

---

# 32. CH9 Success

핵심:

프로젝트는 기술적으로 성공.

“실패”라고 UI가 바꾸지 않는다.

---

# 33. SUCCESS?

아주 작은 시스템적 질문.

게임이 정답을 대신 말하지 않음.

---

# 34. CH10 pre-postcard

weapon 의미는 이미 알고 있음.

숨길 것은 player identity.

---

# 35. CH10 Radio

war ending/surrender.

Oppenheimer name 금지.

---

# 36. Newspaper

Oppenheimer name / Los Alamos director profile 금지.

---

# 37. Phone Caller

호칭:

```text
박사님
```

name 없음.

---

# 38. Phone Exact Lines

기존 05 dialogue를 유지.

“오펜하이머 박사”로 바꾸지 않는다.

---

# 39. Parcel Exterior

금지:

```text
J. ROBERT OPPENHEIMER
OPPENHEIMER
LOS ALAMOS DIRECTOR
```

---

# 40. Parcel Allowed

```text
OFFICIAL
PERSONAL DELIVERY
WAR DEPARTMENT
```

등.

---

# 41. Photo

front에 identity text 없음.

back:

```text
HIROSHIMA
AUGUST 1945
```

weapon context 강화는 허용.

---

# 42. Medal

identity 직접 없음.

---

# 43. Postcard Physical Gate

photo + medal이 실제로 제거되기 전 이름 영역이 안 보임.

---

# 44. Postcard Material Gate

back text material/texture도 reveal 이전 활성하지 않는 것을 권장.

---

# 45. Postcard Interaction Label

```text
엽서
```

뿐.

---

# 46. Identity Reveal

순서:

```text
TO.
J. ROBERT
OPPENHEIMER
```

---

# 47. Full identity

이 순간부터 Oppenheimer 관련 profile 정보 허용.

---

# 48. Profile

```text
J. ROBERT OPPENHEIMER
SCIENTIFIC DIRECTOR
LOS ALAMOS LABORATORY
MANHATTAN PROJECT
```

---

# 49. Final Archive

이후 8명 full names 허용.

---

# 50. Richard

```text
Richard P. Feynman
```

---

# 51. Enrico

```text
Enrico Fermi
```

---

# 52. Luis

```text
Luis W. Alvarez
```

---

# 53. John

```text
John von Neumann
```

---

# 54. George

```text
George B. Kistiakowsky
```

---

# 55. Emilio

```text
Emilio Segrè
```

---

# 56. Kenneth

```text
Kenneth Bainbridge
```

---

# 57. Hans

```text
Hans Bethe
```

---

# 58. Document Audit

CH1~8 모든 player-facing text scan.

금지어/성명 검사.

---

# 59. Texture Audit

OCR 자동화만 믿지 않는다.

source image/text layer 수동 검사.

---

# 60. CanvasTexture

runtime-generated string도 audit 대상.

---

# 61. UI String Audit

• interaction labels
• subtitles
• chapter titles
• archive
• error messages

---

# 62. Debug String

production debug disabled.

---

# 63. Error Messages

asset id가:

```text
oppenheimer_postcard_missing
```

같더라도 player toast에 그대로 출력 금지.

---

# 64. Save Data

localStorage는 개발자가 볼 수 있지만 일반 player-facing reveal 경로가 아님.

그래도 UI에 raw dump 금지.

---

# 65. Asset Filename

웹 개발자 도구로는 볼 수 있으므로 완전한 secrecy는 불가능.

게임 경험상의 player-facing spoiler 방지가 목표.

가능하면 파일명도 무해하게 하면 좋음.

---

# 66. DOM

숨김 element에 full name text를 미리 넣고 CSS display:none만 하는 방식은 피할 수 있음.

reveal 시 생성/교체.

---

# 67. Accessibility text

aria-label도 player/browser assistive tech에 노출.

spoiler-safe label 사용.

---

# 68. Alt text

동일.

---

# 69. Audio Filename

production UI에 노출되지는 않지만 naming은 가능하면 안전.

---

# 70. Subtitle Data

CH1~8 dialogue JSON에 surname/full project term 실수 없음.

---

# 71. Architecture

signage:

```text
CALCULATION
INSTRUMENTATION
TEST CONTROL
```

허용.

---

# 72. Architecture 금지

```text
BOMB ASSEMBLY
NUCLEAR LAB
TRINITY CONTROL
```

---

# 73. Visual Diagram

weapon geometry/silhouette 금지.

---

# 74. Progress Board

```text
PROJECT ███████
PROGRESS
```

---

# 75. Object Label

crate/equipment label에서 weapon identity leak 검사.

---

# 76. Map

CH1~8에서 Hiroshima/Nagasaki/target map 금지.

---

# 77. Aircraft

CH1~8 facility props/posters에 mission aircraft emphasis 금지.

---

# 78. Atomic Symbol

직접 암시가 강하면 피함.

---

# 79. CH8 Final Report

가장 강한 audit 필요.

full compilation인데도 weapon term 없음.

---

# 80. CH8 success dialogue

“장치가 준비됐습니다” 같은 직접 weapon implication도 맥락에 따라 주의.

generic:

```text
전체 검증이 끝났습니다.
최종 보고를 올리겠습니다.
```

등.

---

# 81. CH9 Reveal Integrity

반대로 CH9에서 너무 돌려 말하지 않는다.

여기서는 player가 의미를 알아야 함.

---

# 82. CH9 Chronology

정확한 순서:

```text
06 AUG 1945
Little Boy
Hiroshima

09 AUG 1945
Fat Man
Nagasaki
```

---

# 83. Trinity

필요한 직접 배경 설명이 아니라면 CH9 mission sequence에 추가하지 않는다.

핵심은 실제 mission results.

---

# 84. CH10 Medal 역사성

게임-specific token임을 자료/설계에서 명확히.

실제 1945 Oppenheimer Medal for Merit처럼 오인 금지.

---

# 85. Historical/Fiction Label

최종 역사 표현 문서에서 dramatized/compressed elements 구분.

---

# 86. Marketing/UI Outside Game

향후 게임 썸네일/소개문에서 Oppenheimer를 전면에 쓰면 mystery가 깨질 수 있음.

release 전략에서 별도 결정.

---

# 87. QA Build Scan

production bundle의 player-facing string registry를 추출해 banned word scan.

---

# 88. False Positive

내부 historical profile data는 LEVEL 3 asset에 존재할 수 있음.

“존재 자체”가 아니라 조기 렌더/노출을 검사.

---

# 89. Story State Gate

render 함수마다 current spoiler level 검증 가능.

---

# 90. Spoiler Level 예

```text
SAFE_CH1_8
RESULT_REVEALED
IDENTITY_REVEALED
FINAL_ARCHIVE
```

---

# 91. Gate Failure

높은 level text를 낮은 level에서 요청하면 개발 error.

production에서는 safe fallback label.

---

# 92. Safe Fallback

예:

```text
REDACTED
UNKNOWN
엽서
보고서
```

---

# 93. Reload Gate

save inconsistency로 future content가 조기 보이지 않게 load validation.

---

# 94. Direct URL Gate

chapter10.html 직접 열었을 때 identity reveal 전 full profile을 바로 보여주지 않음.

---

# 95. Final Archive URL/State

archive는 `identityRevealed` 요구.

---

# 96. Screenshot QA

각 chapter의 모든 major room/window/document/cinematic frame 캡처해 사람 눈으로 검사.

---

# 97. Audio QA

대사/라디오/phone에서 이름/무기 용어.

---

# 98. Mobile QA

작은 화면용 alternate label/accessible text도 동일 감사.

---

# 99. Localization

한국어/영어 양쪽 금지어 검사.

번역이 더 직접적으로 spoiler를 설명하지 않게.

---

# 100. 금지사항

• banned word만 치환하고 의미는 그대로
• surname 조기 표기
• hidden DOM full name
• aria-label spoiler
• debug toast spoiler
• object filename을 interaction label로 사용
• CH8 final report weapon term
• CH9에서도 의미를 계속 숨김
• CH10 radio/newspaper로 Oppenheimer 조기 공개
• parcel exterior identity
• postcard material 조기 활성
• corrupted save future reveal
• Final Archive identity gate 없음

---

# 101. 후속 문서와 연결

`30_HISTORICAL_PRESENTATION.md`
• 무엇을 역사 사실로 명시하고 무엇을 dramatization으로 다루는지 정의

`31_FAILURE_PREVENTION.md`
• spoiler state corruption 대응

`32_COMMON_QA.md`
• 최종 spoiler audit matrix

각 CHAPTER `QA.md`
• player-facing 모든 정보 수동 감사

<!-- MERGED SOURCE END: 29_SPOILER_RULES.md -->
