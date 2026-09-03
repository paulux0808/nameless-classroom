<!-- MERGED SOURCE START: 20_LIGHTING.md -->

# 20_LIGHTING.md

# LIGHTING SPECIFICATION

이 문서는 CH1~CH10 전체의 조명 구조, 시설 진행에 따른 활성화, 상호작용 가독성, 시네마틱 조명, CH9 전광판 섬광/전원 차단, CH10 자택의 따뜻한 대비, 모바일/성능 조건을 정의한다.

범위:

• 시설 기본 조명
• 방별 task light
• 장비 emissive
• 진행률별 lighting state
• NPC 얼굴/손/문서 가독성
• CH8 최종 성공
• CH9 board dim / white flash / power-down
• CH10 home
• inspect/stamp/phone/postcard
• 그림자
• light leak
• 모바일
• 성능
• focus loss / reload 복원
• QA

---

# 1. 기본 철학

조명은 정답을 가리키는 UI가 아니다.

역할은 다음이다.

```text
공간 기능을 설명
+
사람과 물체를 읽게 함
+
진행 상태를 보여줌
+
시간과 분위기를 형성
+
중요한 장면의 시선을 정리
```

정답 오브젝트에만 spotlight를 켜는 방식은 금지한다.

---

# 2. 시대적 방향

1940년대 실내 조명 인상:

• 백열등
• 작업등
• 산업용 천장등
• 벽등
• 장비 표시등
• CRT/emissive

현대적 RGB light strip, LED panel, cyberpunk glow 금지.

---

# 3. 광원 계층

권장 계층:

```text
AMBIENT / SKY CONTRIBUTION
ROOM GENERAL LIGHT
TASK LIGHT
EQUIPMENT EMISSIVE
STORY LIGHT CUE
CINEMATIC OVERRIDE
```

모든 광원을 동일 중요도로 쓰지 않는다.

---

# 4. Ambient

완전 검은 shadow를 피할 최소 ambient.

시설은 밝고 안전한 연구 작업 공간이어야 한다.

CH6 야간과 CH9 power-down만 예외적으로 더 낮아질 수 있다.

---

# 5. Room General Light

방 전체의 기본 밝기.

다음 목표:

• player navigation 가능
• 벽/가구 silhouette 명확
• NPC 위치 확인
• 문/통로 식별

---

# 6. Task Light

책상, CRT, counting table, report table 등 작업면에 집중.

task light는 실제 램프/fixture 위치와 연결한다.

보이지 않는 floating light를 과도하게 사용하지 않는다.

---

# 7. Equipment Emissive

CRT, indicator, board, gauge lamp.

emissive 자체만으로 방 전체를 밝히지 않는다.

필요하면 작은 보조 light와 결합.

---

# 8. 색온도

시설 기본:

```text
neutral ~ slightly warm
```

장비/산업 공간은 조금 차갑거나 중립.

CH10 home은 시설보다 명확히 warm.

---

# 9. 색상 과장 금지

REJECTED = red room,
APPROVED = green room

같은 도식적 색상 변화 금지.

도장/문서 text로 의미를 전달한다.

---

# 10. 문서 가독성

문서 inspect/stamp 영역은:

• glare 없음
• 지나친 shadow 없음
• text contrast 유지

paper는 diffuse 중심.

---

# 11. NPC 얼굴 가독성

대화 시 얼굴 전체를 cinematic key light로 따로 비추지 않아도 됨.

하지만 눈, 입, 표정이 읽혀야 한다.

---

# 12. NPC 손 가독성

document handoff / gesture / stamp 반응에서 손이 완전 shadow에 묻히지 않게 한다.

---

# 13. Player Hands

camera 가까운 player hands에 dynamic shadow가 과장되지 않게.

필요 시 shadow cast 제한.

---

# 14. Director Office

기본:

• ceiling/general light
• desk task lamp
• 약한 corridor spill

desk 문서 영역이 안정적으로 읽혀야 한다.

---

# 15. Director Office progression

CH1:
정돈되고 제한적.

후반:
추가 side room light/복도 spill 증가 가능.

그러나 desk 자체 노출은 일관적.

---

# 16. Calculation Area

밝은 작업 환경.

• desk lamps
• general overhead
• mechanical calculator shadow

지나친 어둠 금지.

---

# 17. Chalkboard Area

board 전체가 읽혀야 함.

chalkboard에 강한 specular hotspot 금지.

---

# 18. Instrumentation Area

ambient를 조금 낮추고:

• CRT
• indicator
• task lamp

가 상대적으로 보이게 할 수 있다.

그래도 player path는 명확.

---

# 19. Recording Area

rack/recording surface가 읽히는 중립 조명.

실제 weapon-specific silhouette를 shadow로 만들지 않는다.

---

# 20. Material Test Area

넓은 공간.

• broad overhead
• control side task light
• test zone 별도

impact 순간 flash가 있다면 실제 test event 범위에서만.

---

# 21. CH5 retest

시간 경과를 표현하기 위해:

• light state
• 일부 lamp
• outside spill

변화 가능.

하지만 정확성 요구를 “어두워짐”으로 도덕화하지 않는다.

---

# 22. Counting Area

CH6 야간.

구성:

• 낮은 room ambient
• desk lamp
• counter indicators
• corridor lamp

완전 공포게임 암전 금지.

---

# 23. CH6 navigation

벽/door edge가 보일 만큼 ambient 유지.

sound만으로 이동해야 하는 구조 금지.

---

# 24. Control / Incident Area

CH7 alarm 시 warning light 가능.

하지만 화면 전체 red wash 금지.

---

# 25. CH7 alarm light

짧은 pulse 또는 rotating beacon 느낌 가능.

목표:

• 사건 위치
• 긴급 상태

표현.

puzzle 정답을 표시하지 않음.

---

# 26. Alarm 종료

승인/정리 후 warning state 종료.

normal operational light로 복귀.

---

# 27. Final Review Room

CH8 기본:

• 전체 group 얼굴
• report table
• archive
• progress board

모두 읽힐 balanced lighting.

---

# 28. CH8 REJECTED

빛을 어둡게 하지 않는다.

room silence와 NPC 반응이 감정을 만든다.

---

# 29. CH8 APPROVED

성공 후 기존 practical light가 단계적으로 활성.

예:

```text
side equipment
→ work banks
→ central status
→ full room
```

---

# 30. CH8 성공 톤

금지:

• ominous shadow
• 갑작스러운 cold shift
• red cue
• flicker
• glitch light

진짜 성공처럼.

---

# 31. Progress lighting

CH1→CH8:

“시설 전체 밝기 증가”가 아니라

```text
활성화된 작업 구역 수 증가
```

로 표현.

---

# 32. Light Group

예:

```text
LIGHT_CALC
LIGHT_REVIEW
LIGHT_INSTRUMENT
LIGHT_RECORD
LIGHT_TEST
LIGHT_COUNT
LIGHT_CONTROL
LIGHT_FINAL
```

---

# 33. Progress dependency

각 light group은 approved milestone에 연결.

reload 시 canonical state 재구성.

---

# 34. 중복 생성 금지

progress event 재호출로 light가 두 개 생기지 않게 idempotent.

---

# 35. CH9 시작

CH8 100% lighting state 유지.

처음부터 어둡고 불길한 상태 금지.

---

# 36. VIEW RESULTS

sequence:

```text
player board interaction
→ camera settle
→ unnecessary task lights dim
→ board emphasis
```

---

# 37. Board dim

room 전체를 0으로 만들지 않는다.

NPC silhouette, 얼굴 일부, 공간 경계가 남음.

---

# 38. Board luminance

board text와 footage가 읽히되 과도한 bloom 금지.

---

# 39. First mission white flash

board white frame과 room light response 동기화.

가능:

```text
FLASH marker
→ board white
→ room bounce light
→ short exposure recovery
```

---

# 40. Flash exposure

화면이 완전 white로 몇 초간 남아 player가 불편하지 않게 한다.

짧고 강한 인상.

---

# 41. NPC silhouette

flash에서 사람들의 silhouette가 잠깐 보일 수 있음.

반응은 flash 직후.

---

# 42. Second flash

첫 번째와 copy-paste 느낌을 피함.

조금 다른 exposure/hold 가능.

---

# 43. SUCCESS

board 중심.

room light는 여전히 낮음.

---

# 44. SUCCESS?

glitch lighting 금지.

board text 변화가 중심.

---

# 45. Power-down

순차:

```text
rear equipment lights
→ side work lights
→ indicators
→ general room lights
→ board
→ black
```

---

# 46. Power-down decay

기계가 꺼질 때 fan/CRT light가 짧게 decay 가능.

모든 light를 한 frame에 visibility=false 금지.

---

# 47. Full blackout

transition overlay와 실제 scene darkness를 구분.

마지막 board off 후 black overlay가 takeover할 수 있음.

---

# 48. CH10 home

시설과 대비되는 warm domestic lighting.

• window/natural spill
• table lamp
• radio area
• phone area
• books/fabric/wood

---

# 49. Home의 따뜻함

“행복한” 필터가 아니라 생활 공간의 자연스러운 warmth.

과도한 orange filter 금지.

---

# 50. Radio area

radio dial/speaker가 읽힘.

radio만 spotlight로 강조하지 않는다.

---

# 51. Phone area

ring 시 light가 깜빡이거나 phone에 glow를 추가하지 않는다.

소리와 공간 배치가 발견을 유도.

---

# 52. Phone dialogue

handset/손/phone base가 읽히는 밝기.

camera가 움직여도 hand가 black silhouette가 되지 않게.

---

# 53. Handset throw

impact path의 table edge/floor가 최소한 읽혀야 함.

어두워서 수화기가 사라지는 문제 금지.

---

# 54. Knock / Door

door open 시 exterior light가 자연스럽게 들어옴.

parcel reveal을 돕지만 parcel에만 별도 spotlight 금지.

---

# 55. Exterior exposure

door open 시 실내가 갑자기 검어지거나 바깥이 pure white로 날아가지 않게 exposure 관리.

---

# 56. Box table

string/lid/photo/medal/postcard가 읽히는 task light 확보.

---

# 57. Medal

금속 반사 때문에 각인이 날아가지 않게 roughness/light angle 조정.

---

# 58. Photo

front/back 모두 glare 없이.

---

# 59. Postcard reveal

주변 light를 약간 낮출 수 있음.

하지만 이름 text 자체가 발광하거나 spotlight를 받는 연출 금지.

---

# 60. Identity reveal

카드와 text가 안정적으로 읽히는 최소한의 contrast.

dramatic flash 없음.

---

# 61. Final Archive

2D/black layer 중심.

물리 light system 필요 없음.

필요한 flashback은 해당 chapter canonical lighting memory 사용.

---

# 62. Shadow 품질

우선순위:

```text
PLAYER/NPC
MAJOR FURNITURE
STORY OBJECT CONTACT
```

작은 prop 모든 shadow 금지.

---

# 63. Dynamic shadow light 수

동시에 shadow-casting dynamic light를 제한.

특히 CH8/CH9.

---

# 64. Baked 느낌

정적 공간은 ambient occlusion/lightmap-like 접근 가능.

실제 구현은 Three.js 환경에 맞춰 간소화.

---

# 65. Contact shadow

문서/메달/photo 등의 떠 보이는 문제를 해결.

---

# 66. Light leak

벽/문 너머 광원이 새면:

• wall thickness
• light range
• shadow bias
• fixture position

검토.

---

# 67. Shadow acne / peter-panning

bias를 과도하게 올려 물체가 떠 보이지 않게 한다.

---

# 68. Emissive와 실제 light

indicator 하나마다 PointLight 생성 금지.

대부분 emissive만.

---

# 69. Bloom

필요 최소.

CRT/board에 subtle.

document text/white paper bloom 금지.

---

# 70. Exposure

scene별 exposure를 급변시키지 않는다.

CH9 flash 외에는 안정적.

---

# 71. Tone mapping

시대감 목적으로 contrast를 과도하게 crush하지 않는다.

shadow 속 interaction이 보여야 함.

---

# 72. Color grading

시설/자택의 톤 차이는 가능.

하지만 puzzle 정보 색을 왜곡하지 않는다.

---

# 73. UI와 lighting

subtitle/UI는 scene 밝기와 무관하게 읽히되,
화면을 흰 panel로 덮지 않는다.

---

# 74. Mobile

모바일에서는:

• shadow 수 감소
• light count 감소
• emissive 활용
• board/photo/document 가독성 유지

---

# 75. Mobile fallback

저사양:

```text
shadow resolution ↓
secondary dynamic lights off
ambient ↑ small
```

가능.

gameplay 정보는 보존.

---

# 76. Reduced effects

flash sensitivity 옵션이 있다면 CH9 white flash 강도/지속을 줄일 수 있음.

결과 정보와 timing은 유지.

---

# 77. Focus loss

복귀 시 cinematic light state를 canonical beat로 복원.

중간 exposure 값이 영구 남지 않게 한다.

---

# 78. Reload

progress milestone / chapter state에서 lighting group 재구성.

exact tween progress 저장 금지.

---

# 79. Lighting State

권장:

```js
{
  roomProfile,
  activeGroups,
  cinematicOverride,
  exposureProfile
}
```

---

# 80. Ownership

우선순위:

```text
TRANSITION
> CINEMATIC
> STORY EVENT
> CHAPTER STATE
> AMBIENT
```

---

# 81. Cinematic release

시네마틱 끝에 새 story lighting state가 맞으면 그 상태로 commit.

무조건 이전 상태로 rollback하지 않는다.

---

# 82. Audio sync

relay/light activation은 audio marker와 연결 가능.

정확한 소리는 21.

---

# 83. QA: 문서

• text readable
• stamp mark readable
• glare 없음
• 손 shadow 과하지 않음

---

# 84. QA: NPC

• 모든 skin tone/face readable
• eye/gaze visible
• silhouette만 필요한 CH9는 예외

---

# 85. QA: CH6

• dark but navigable
• sample labels readable
• Emilio visible
• counter indicator 과도한 glow 없음

---

# 86. QA: CH8

• 8 NPC 얼굴
• report/stamp
• progress
• success activation
• no ominous cue

---

# 87. QA: CH9

• board readable
• flash recovery
• NPC silhouette
• SUCCESS?
• sequential power-down
• blackout

---

# 88. QA: CH10

• warm but not orange
• phone visible
• throw path visible
• door exposure
• parcel contents
• medal engraving
• postcard identity

---

# 89. Performance QA

CH8/CH9 worst-case:

• 8 NPC
• multiple lights
• board
• shadows
• emissive

동시에 안정.

---

# 90. 금지사항

• 정답 object spotlight
• REJECTED red wash / APPROVED green wash
• CH8 ominous flicker
• CH9 시작부터 horror lighting
• indicator마다 PointLight
• 모든 prop dynamic shadow
• paper specular glare
• CH6 pitch black
• CH9 flash 장시간 whiteout
• CH10 과도한 orange filter
• phone ring에 glow
• postcard name 발광
• focus loss 후 cinematic exposure 고착
• progress event light duplicate

---

# 91. 후속 문서와 연결

`21_AUDIO.md`
• 조명 marker와 relay/기계음 동기화

`22_VISUAL_STYLE.md`
• 색온도, material, contrast 최종 시각 언어

`23_UI.md`
• scene brightness에 독립적인 subtitle/hint 가독성

`24_TRANSITION.md`
• blackout/fade ownership

`27_MOBILE.md`
• light/shadow fallback

`28_PERFORMANCE.md`
• light/shadow budget 최종값

각 CHAPTER `LIGHTING.md`
• 장면별 정확한 light group, position, intensity, state 정의

<!-- MERGED SOURCE END: 20_LIGHTING.md -->

================================================================================
ORIGINAL SOURCE: 21_AUDIO.md
================================================================================

# 21_AUDIO.md

# AUDIO SPECIFICATION

이 문서는 CH1~CH10의 환경음, 대사, 효과음, 장비음, 도장, 문, 전화, 라디오, CH9 전광판 영상, 정적, CH9 power-down, Final Archive 기억 사운드의 공통 규칙을 정의한다.

범위:

• ambience
• spatial audio
• dialogue
• foley
• interaction
• machine loops
• progress layers
• CH6 counting
• CH7 alarm
• CH8 success
• CH9 board/mission/silence/power-down
• CH10 radio/phone/knock/parcel
• stamp leitmotif
• focus loss
• mobile
• performance
• QA

---

# 1. 기본 철학

소리는 화면 밖 공간까지 존재하게 한다.

목표:

```text
방의 기능을 느끼게 함
+
NPC/오브젝트 위치를 전달
+
물리 접촉을 설득
+
시네마틱 호흡을 만든다
+
정적의 의미를 만든다
```

항상 음악으로 감정을 설명하지 않는다.

---

# 2. Audio Layer

권장:

```text
MASTER
AMBIENCE
MACHINE
FOLEY
INTERACTION
DIALOGUE
RADIO / RECORDING
CINEMATIC
UI
```

---

# 3. Dialogue 우선순위

대사 중 다른 layer를 완전히 끄지 않는다.

필요하면:

• ambience duck
• machine duck

정도.

---

# 4. UI beep 최소화

line advance마다 beep 금지.

interaction hint 등장/사라짐에도 반복 beep 금지.

---

# 5. Spatial Audio

world sound는 실제 source 위치에서.

예:

• radio speaker
• phone handset
• alarm
• machine rack
• knock door
• calculator

---

# 6. 거리 감쇠

작은 방에서 source가 2m만 떨어져도 거의 안 들리는 과도한 attenuation 금지.

room 규모와 기능에 맞춘다.

---

# 7. Occlusion

벽/문 뒤 sound는:

• volume 감소
• high-frequency 감소

정도 가능.

full acoustic simulation 필수 아님.

---

# 8. Door state

문 열림/닫힘에 따라 corridor ambience가 달라질 수 있음.

---

# 9. Room ambience

Director Office:
• quiet room tone
• distant paper
• corridor muffled

Calculation:
• mechanical calculator
• paper
• chair
• low conversation

Instrumentation:
• hum
• relay
• CRT

Material Test:
• ventilation
• distant mechanical
• larger space reverb

Counting:
• sparse clicks

Control:
• recorder/hum/alarm

---

# 10. Audio soup 금지

한 room에 10개 loop를 같은 음량으로 재생하지 않는다.

dominant 1~3 layer.

---

# 11. Loop variation

기계 loop가 완전히 똑같은 2초 반복으로 들리지 않게 한다.

길이/variation/one-shot 섞기.

---

# 12. Progress audio

CH1→CH8에 따라 activity layer 증가.

하지만 volume만 증가시키지 않는다.

---

# 13. CH1

조용한 시작.

승인 후:
Calculation activity 조금 증가.

---

# 14. CH2

discussion murmur / chalk.

승인 후 side activity.

---

# 15. CH3

instrument hum / CRT / relay.

---

# 16. CH4

paper recorder / timing equipment.

---

# 17. CH5

test zone mechanical ambience.

impact/retest event는 room-scale.

---

# 18. CH6

야간.

핵심:

```text
silence
+
counter clicks
+
low room hum
```

---

# 19. Counter click

너무 게임 UI click처럼 규칙적이지 않게.

measurement state에 따라 rate 변화 가능.

---

# 20. CH7 Alarm

명확하지만 귀를 찢는 loudness 금지.

목표는 긴급 상태.

---

# 21. Alarm 지속

player가 evidence를 읽는 동안 계속 큰 alarm을 울리지 않는다.

초기 event 후 낮추거나 종료.

---

# 22. Incident ambience

alarm 이후 room tone / recorder / voices가 남음.

---

# 23. CH8

여러 subsystem의 누적 ambience.

성공 후 fuller but not triumphant soundtrack.

---

# 24. CH8 music

음악을 쓴다면 제한적.

성공을 진짜 성공으로 느끼게 하지만 과장된 heroic fanfare 금지.

환경음만으로도 충분할 수 있다.

---

# 25. Stamp core sound

CH1~CH8 반복되는 핵심 기억.

구성:

```text
hand/body movement
+
rubber/paper contact
+
desk/body thump
```

---

# 26. STAMP_IMPACT

정확히 physical marker와 sync.

impact 전 재생 금지.

---

# 27. REJECTED/APPROVED

같은 물리 family.

완전히 다른 “negative/positive UI sound”로 만들지 않는다.

---

# 28. Stamp variation

room/reverb/pressure에 따라 미세한 variation.

핵심 timbre 유지.

---

# 29. Document foley

• paper lift
• paper contact
• binder thump
• page flip
• document reclaim

과도한 Foley exaggeration 금지.

---

# 30. Door

sequence:

```text
handle
→ latch
→ hinge/wood
→ stop
```

physical marker와 sync.

---

# 31. Door squeak

모든 문이 공포영화처럼 삐걱거리지 않는다.

필요한 오래된 문 일부만.

---

# 32. Button / Lever

• button click
• lever detent
• relay response

시대 기계감.

---

# 33. Equipment response

control action 후:

```text
mechanical action
→ relay
→ hum / indicator
```

작은 delay 가능.

---

# 34. NPC footsteps

공간 재질에 맞춰.

random footstep spam 금지.

---

# 35. NPC clothing

gesture마다 옷 rustle을 크게 넣지 않는다.

중요 movement에 subtle.

---

# 36. Voice style

대사는 가까운 실제 공간 voice.

과도한 radio compression 금지.

---

# 37. Subtitle와 Audio

subtitle timing은 음성 의미 단위와 일치.

음성 끝났는데 subtitle가 한참 남지 않게.

---

# 38. No voice fallback

실제 voice asset이 없더라도 subtitle/dialogue 흐름은 정상 작동.

---

# 39. CH9 board activation

sound:

• control
• relay
• CRT/board startup
• room ambience duck

---

# 40. Archival footage sound

board에서 나는 기록 영상처럼.

가능:

• engine
• wind
• recording noise
• film/static

---

# 41. Archival 스타일

무조건 심한 vinyl crackle/film noise를 깔지 않는다.

핵심 영상/정적을 방해하지 않는 수준.

---

# 42. First mission release

release 이후 engine/ambient를 의도적으로 줄인다.

---

# 43. First silence

약 4~5초 수준 후보.

“완전 디지털 mute”가 아니라 필요하면 아주 낮은 air/noise만.

---

# 44. Flash와 Sound Delay

섬광 직후 아주 짧은 지연 후 impact 가능.

시각과 소리의 물리적 거리감을 보조.

---

# 45. Explosion

graphic gore 없이도 규모를 느끼는 저역/원거리 충격.

게임 폭발 효과음처럼 짧고 날카롭게만 하지 않는다.

---

# 46. Mushroom cloud hold

폭발 뒤 과도한 음악 진입 금지.

영상 자체와 room silence를 유지.

---

# 47. MISSION RESULT / SUCCESS

UI ding 없음.

텍스트 등장 자체가 차갑게 보이게.

---

# 48. First result room

NPC 대사 없음.

작은 movement foley만 가능.

---

# 49. Second mission

첫 번째보다 setup sound 짧게.

silence는 더 무겁게.

---

# 50. Second explosion

첫 번째와 정확히 같은 sample 재사용 금지.

규모 family는 유지.

---

# 51. SUCCESS

facility ambience를 조금씩 줄일 준비.

---

# 52. SUCCESS?

별도 horror sting 금지.

text transition에 UI glitch sound를 남발하지 않는다.

---

# 53. Hans glance

sound cue 없음.

---

# 54. Power-down audio

순차:

```text
relay
→ fan coast
→ hum layer off
→ side equipment off
→ board discharge/off
```

---

# 55. Power-down 의미

CH1~8에서 쌓인 familiar sound를 역으로 제거.

---

# 56. Full black

마지막 기계음이 사라진 뒤 intentional silence.

---

# 57. CH10 home ambience

시설과 대비:

• room tone
• clock
• distant outside
• radio
• subtle household sounds

---

# 58. Home silence

시설의 constant machinery가 없음.

그래서 telephone ring이 더 강하게 느껴짐.

---

# 59. Radio

speaker source에서 spatial.

방송:

• surrender
• war ending
• official tone

직접 player identity 말하지 않음.

---

# 60. Radio intelligibility

critical story context가 라디오에만 의존하지 않게.

---

# 61. Phone ring

명확한 1940s telephone ring.

source는 phone base.

---

# 62. Ring repetition

player가 바로 안 받으면 일정 간격으로 반복 가능.

무한 초고속 반복 금지.

---

# 63. Phone answer

cradle release/contact sound.

call audio source가 handset 쪽으로 이동/전환.

---

# 64. Caller voice

전화 line filtering.

다만 이해하기 어려울 정도로 심한 distortion 금지.

---

# 65. Phone dialogue exact lines

기존 05_DIALOGUE 규칙의 정확한 문장을 사용.

audio는 line-by-line 진행과 동기화.

---

# 66. Forced pause

“대통령께서도—” 이전/주요 지점에서 silence를 실제로 확보.

---

# 67. Handset lowering

작은 cord/body foley.

---

# 68. Handset throw

주요 marker:

```text
HANDSET_RELEASE
HANDSET_IMPACT
CORD_TENSION
FLOOR_SETTLE
```

---

# 69. Bakelite impact

가벼운 플라스틱 click이 아니라 단단하고 무게감 있는 충돌.

---

# 70. Impact layering

table edge + handset body.

필요하면 floor second impact.

---

# 71. Cord tension

짧은 snap/tension sound.

과도한 whip sound 금지.

---

# 72. Floor caller

바닥 수화기 위치에서 공간적으로 들림.

```text
“…박사님?”
“…작은 물건을 하나 보내드렸습니다…”
```

---

# 73. Floor caller UI

대형 dialogue box 불필요.

subtitle 최소.

---

# 74. Knock

실제 front door 위치.

2~3회의 자연스러운 knock pattern.

게임 objective sound처럼 반복하지 않는다.

---

# 75. Door open

handle/latch/hinge + exterior ambience 증가.

---

# 76. Parcel

• cardboard contact
• string friction
• knot
• lid
• paper/photo
• medal metal contact

---

# 77. String

visibility false 순간에 sound만 넣는 방식 금지.

실제 slack animation과 sync.

---

# 78. Lid

hinge/box cardboard or wood sound.

---

# 79. Photo

가벼운 paper/card.

---

# 80. Medal

작은 금속 contact.

테이블에 떨어뜨리는 큰 coin bounce 금지.

---

# 81. Postcard

paper/card flip.

identity reveal에 별도 choir/sting 금지.

---

# 82. Identity reveal

거의 silence.

text reveal sound가 필요해도 매우 절제.

무음도 가능.

---

# 83. Oppenheimer profile

배경 music 필수 아님.

정보와 memory 분위기 중심.

---

# 84. Final Archive

각 인물 flashback에 해당 chapter의 짧은 audio memory를 회수 가능.

---

# 85. Archive sound density

각 profile마다 full chapter ambience를 재생하지 않는다.

1~2개의 기억 cue.

---

# 86. Last Memory

Hans 이후 black.

CH1~7 REJECTED stamp sounds 순차.

---

# 87. Final APPROVED

CH8 APPROVED impact.

그 뒤 silence.

---

# 88. Ending silence

ENDING CODE 전후 충분한 정적.

자동 title music 폭발 금지.

---

# 89. Audio ownership

우선순위:

```text
TRANSITION
> CINEMATIC
> DIALOGUE
> STORY INTERACTION
> AMBIENCE
```

---

# 90. Ducking

dialogue/cinematic에서 duck.

완전히 mute할 필요 없음.

---

# 91. Music

게임 전체에 constant soundtrack를 깔지 않는 것을 권장.

음악이 들어가더라도 핵심 silence를 침범하지 않는다.

---

# 92. Reverb

room별 차이는 subtle.

작은 office에 cathedral reverb 금지.

---

# 93. Audio checkpoint

exact playback sample position보다 semantic state 우선.

---

# 94. Focus loss

브라우저가 audio context suspend.

복귀 시:

• loop duplicate 없음
• cinematic marker sync
• dialogue state 안전

---

# 95. Visibility change

background에서 story-critical audio만 진행하고 화면이 멈추는 문제 방지.

필요하면 sequence clock과 함께 pause/recover.

---

# 96. Mobile

작은 speaker에서도:

• dialogue
• stamp
• phone ring
• critical impact

가 들려야 한다.

저역에만 의존하지 않는다.

---

# 97. Headphones

spatial localization은 보조.

headphones 없다고 puzzle 불가 금지.

---

# 98. Accessibility

subtitle/caption으로 critical audio 정보 보조.

예:

```text
[전화벨]
[노크]
[계수기 소리]
```

단 puzzle answer 직접 설명 금지.

---

# 99. Volume controls

최소:

```text
MASTER
DIALOGUE
EFFECTS
```

가능.

music이 있으면 MUSIC.

---

# 100. Mute safety

audio muted 상태에서도 진행 가능.

critical event는 시각 cue도 존재.

---

# 101. Performance

loop 수 제한.

audio node 정리.

chapter transition에서 이전 room loop 정지.

---

# 102. Duplicate loop 방지

progress reload로 동일 hum/fan 두 번 재생 금지.

---

# 103. Preload

critical:

• stamp
• phone ring
• caller
• CH9 board
• explosion
• final archive stamp

미리 로드.

---

# 104. Missing audio

논리 진행은 계속.

개발 환경에서 warning/error.

---

# 105. QA: 공간

source 위치와 화면 object 일치.

---

# 106. QA: dialogue

한 줄 advance와 audio 중복/skip 없음.

---

# 107. QA: stamp

impact marker 정확.

Final Archive 기억과 timbre 연속.

---

# 108. QA: CH6

counter가 너무 시끄럽지 않음.
어둠 속 유도 가능.

---

# 109. QA: CH7

alarm이 evidence reading을 방해하지 않음.

---

# 110. QA: CH8

activity 풍부하지만 soup 아님.
성공 tone genuine.

---

# 111. QA: CH9

• release silence
• flash delay
• explosions distinct
• no NPC moral dialogue
• SUCCESS? no horror sting
• power-down layers

---

# 112. QA: CH10

• radio
• ring
• caller
• throw
• floor voice
• knock
• parcel
• identity silence

---

# 113. Low FPS / focus QA

visual marker와 audio marker drift 없음.

---

# 114. 금지사항

• constant loud soundtrack
• line advance beep
• 모든 interaction click
• 모든 문 squeak
• audio-only critical clue
• CH9 result UI ding
• SUCCESS? horror sting
• CH10 identity choir
• stamp impact before contact
• phone throw random impact sound timing
• duplicate machine loops
• focus loss 후 audio만 계속
• mute 상태 soft-lock

---

# 115. 후속 문서와 연결

`22_VISUAL_STYLE.md`
• 화면 질감과 audio tone의 시대감 일치

`23_UI.md`
• captions/subtitles

`24_TRANSITION.md`
• chapter audio fade/cleanup

`25_SAVE_AND_RESUME.md`
• dialogue/cinematic semantic recovery

`27_MOBILE.md`
• speaker/earphone 환경

`28_PERFORMANCE.md`
• audio node/streaming budget

각 CHAPTER `AUDIO.md`
• 장면별 source, cue, timing, mix를 구체화

<!-- MERGED SOURCE END: 21_AUDIO.md -->

================================================================================
ORIGINAL SOURCE: 22_VISUAL_STYLE.md
================================================================================

# 22_VISUAL_STYLE.md

# VISUAL STYLE SPECIFICATION

이 문서는 게임 전체의 시각 언어를 정의한다.

범위:

• 1940년대 시설/자택의 재질과 색
• 현실적이되 과도하게 사실주의적이지 않은 표현
• Three.js 환경에 맞는 형태 단순화
• 종이/금속/목재/바켈라이트/유리
• NPC 가독성
• 문서와 UI의 관계
• CH1~8 시설 누적 변화
• CH9 archival board
• CH10 home
• Final Archive
• 후처리
• 스포일러를 만드는 시각적 암시 방지
• 모바일/성능
• QA

---

# 1. 핵심 방향

목표는:

```text
절제된 역사적 현실감
+
읽기 쉬운 게임 공간
+
물리 오브젝트 중심 상호작용
+
과장되지 않은 영화적 연출
```

이다.

완전한 포토리얼보다 일관된 공간/인물/오브젝트 비례와 조명, 재질이 우선이다.

---

# 2. 시각적 금지 방향

금지:

• SF bunker
• steampunk
• cyberpunk
• sepia filter 전체 적용
• horror grime
• 과도한 film grain
• 모든 물체가 갈색
• 지나친 vignette
• 현대 UI가 공간 위에 떠다님
• “핵무기 프로젝트”를 암시하는 뻔한 실루엣

---

# 3. 형태 언어

시설:

• 직선
• 실용적 가구
• 장비 box/rack
• 배관/케이블
• 서류/칠판
• 산업용 fixture

CH10 home:

• 더 부드러운 가구
• fabric
• 책
• 작은 생활 오브젝트
• warm wood

---

# 4. 모델 복잡도

실루엣과 손이 닿는 부분을 우선.

고 detail 우선:

• 손에 드는 story object
• stamp
• phone handset
• photo
• medal
• postcard
• 주요 문서
• NPC 얼굴/손

낮은 detail:

• 먼 배관
• crate
• ceiling detail
• background rack

---

# 5. 재질 철학

재질은 시대와 사용 용도를 표현한다.

다음 family를 기본으로 한다.

```text
PAINTED_METAL
RAW / DARK METAL
WOOD
PAPER
CARDBOARD
BAKELITE
GLASS
RUBBER
FABRIC
BRASS / STEEL DETAIL
CHALKBOARD
```

---

# 6. Painted Metal

연구 장비:

• 낮거나 중간 roughness
• 지나친 반사 없음
• 작은 edge wear
• 관리된 상태

---

# 7. Rust

일부 오래된 설비에 미세하게 가능.

모든 장비에 녹을 넣지 않는다.

시설은 폐허가 아니다.

---

# 8. Wood

Director desk / home furniture.

facility:
중립~어두운 wood.

home:
조금 warmer.

과도한 glossy varnish 금지.

---

# 9. Paper

off-white.

texture:

• 미세 섬유
• 작은 얼룩/접힘
• 낮은 specular

핵심 text를 방해하지 않음.

---

# 10. Cardboard

CH10 parcel.

종이보다 두껍고 거친 fiber 느낌.

너무 현대적인 shipping box 인쇄 금지.

---

# 11. Bakelite

phone/radio 일부.

특징:

• dark
• hard
• moderate gloss
• heavy visual feel

현대 플라스틱처럼 가볍게 보이지 않게.

---

# 12. Glass

CRT/관찰창/안경.

투명도는 존재감을 유지.

완전 invisible glass 금지.

---

# 13. Metal Small Object

medal, control, fastener.

반사보다 shape/engraving 가독성이 우선.

---

# 14. Cloth/Fabric

CH10 rug/chair/curtain.

노멀/roughness만으로 충분.

heavy cloth simulation 불필요.

---

# 15. 손때와 마모

마모는 기능적 접촉점 중심:

• door handle
• desk edge
• lever
• phone
• drawer

random dirt mask처럼 전체 적용하지 않는다.

---

# 16. 시설 색 팔레트

기본:

• muted neutral
• warm gray
• faded green/blue-gray 일부
• dark wood
• black/brown bakelite
• off-white paper

---

# 17. 색 포인트

indicator, stamp ink, alarm 등.

색 포인트는 적게 사용해야 의미가 남는다.

---

# 18. REJECTED/APPROVED

색이 달라도 text가 주 의미.

red/green만 보고 판단하지 않게.

---

# 19. CH1 상태

정돈.

• 깨끗한 desk
• 적은 paper
• inactive dark equipment
• sparse lights

---

# 20. CH2~4

활동 증가.

• chalk
• paper
• cables
• active instrument

---

# 21. CH5~7

사용감 증가.

• retest records
• tools
• more files
• alarm/control evidence

하지만 debris가 아님.

---

# 22. CH8

밀도 높음.

• compiled documents
• active lamps
• occupied workspaces
• final report

공간의 구조는 여전히 읽혀야 한다.

---

# 23. CH8 성공

visual tone은 실제 성공.

NPC 표정/자세와 시설 activation.

red vignette/ominous grading 금지.

---

# 24. CH9 시작

CH8 visual state를 그대로 이어받음.

진실 reveal 전부터 색을 빼거나 화면을 어둡게 하지 않는다.

---

# 25. Board 스타일

대형 현대 LCD가 아님.

가능:

• projection/CRT-like display
• electromechanical/early display framing
• large archival screen

게임 설정과 구현 난이도에 맞는 허구의 facility display 가능.

---

# 26. Board housing

1940s 시설의 장비처럼:

• thick frame
• vents
• controls
• cables
• indicator

---

# 27. Board content

정보 그래픽은 기능적.

```text
FIELD RECORD
06 AUG 1945
MISSION RESULT
SUCCESS
```

현대 motion graphics처럼 만들지 않는다.

---

# 28. Archival footage

특징:

• 낮은 contrast variation
• monochrome/limited color 가능
• grain subtle
• gate weave subtle
• slight exposure imperfection

---

# 29. Film grain

정보를 가릴 정도 금지.

특히 text/title frame.

---

# 30. Scanline/CRT

쓰면 매우 미세하게.

화면 전체를 줄무늬로 덮지 않는다.

---

# 31. White flash

pure white frame 가능.

bloom/glow가 몇 초 남지 않게.

---

# 32. Mushroom cloud

비그래픽.

거리/규모/충격을 중심.

사람의 신체 피해 직접 묘사 없음.

---

# 33. SUCCESS card

차갑고 행정적인 visual.

fanfare graphic 없음.

---

# 34. SUCCESS?

작은 cursor/anomaly.

화면 전체 glitch/filter 변화 금지.

---

# 35. CH10 visual contrast

시설:

```text
institutional
functional
dense
```

home:

```text
personal
warm
quiet
lived-in
```

---

# 36. Home realism

집을 박물관처럼 만들지 않는다.

• 책이 완벽히 정렬되지 않음
• 컵/안경/신문
• coat
• rug
• mail

---

# 37. Identity spoiler

home personal props가 실제 Oppenheimer 신원을 postcard 전에 직접 말하면 안 된다.

---

# 38. Family photo

실제 얼굴 likeness로 정체를 알아차릴 정도의 명확한 역사 사진은 postcard 전 피한다.

---

# 39. Newspaper

headline은 종전/전쟁 맥락.

player 이름 없음.

---

# 40. Parcel

외부 라벨은 일반 official/personal.

과도한 red wax/top-secret trope 금지.

---

# 41. Photo

이미지 자체의 역사적 맥락을 전달.

graphic victim imagery 금지.

---

# 42. Photo back

`HIROSHIMA / AUGUST 1945`

가독성 최우선.

---

# 43. Medal

게임 특정 token.

실제 1945 훈장 수여를 역사 사실처럼 오인시키지 않는 visual design.

---

# 44. Postcard

가장 평범해 보이는 작은 personal object.

정체 reveal 전부터 “최종 반전 아이템”처럼 빛나지 않는다.

---

# 45. Identity reveal

text가 중심.

```text
TO.
J. ROBERT
OPPENHEIMER
```

zoom/shake/flash 없음.

---

# 46. Final Archive

black background 또는 매우 절제된 archival card.

각 인물:

• redacted card
• flashback image
• full name
• portrait
• role

---

# 47. Archive portrait

역사적 portrait를 사용할 경우 source/license 문제는 구현 단계에서 별도 확인.

placeholder/stylized portrait도 가능.

---

# 48. Redaction visual

두껍고 명확.

검열선 아래 surname이 비치지 않음.

---

# 49. Redaction removal

절제된 wipe/scratch/peel.

게임 achievement unlock처럼 flashy하지 않음.

---

# 50. NPC 스타일

실존 인물을 구분할 수 있는 얼굴/헤어/체형 차이는 필요.

완전 caricature 금지.

---

# 51. NPC likeness

정확한 photogrammetry보다:

• silhouette
• hair
• age
• glasses
• posture
• clothing

의 조합으로 구분 가능.

---

# 52. Clothing

1940s 연구시설에 맞는:

• shirts
• ties
• slacks
• lab/work coat 일부
• jackets

모두 동일 lab coat 금지.

---

# 53. Clothing variation

인물 personality와 역할을 보조.

과도한 색상 coding 금지.

---

# 54. Player body

상시 body 없음.

손만 action 때.

---

# 55. Player hands

특정 identity를 스포일러하는 반지/이니셜/특이 표식 금지.

---

# 56. Object outline

기본적으로 glowing outline 없음.

상호작용 발견은 reticle/label/조명/배치로.

---

# 57. Hover highlight

필요하면 매우 subtle material response.

물체 전체 neon outline 금지.

---

# 58. Interaction label

짧고 기능적.

visual style는 23_UI.

---

# 59. Depth of Field

게임play 중 강한 DOF 금지.

inspect/cinematic에서 미세한 background separation 가능.

문서 text blur 금지.

---

# 60. Motion blur

기본 최소 또는 없음.

CH9/phone throw에도 과도한 blur 금지.

---

# 61. Vignette

subtle.

항상 강한 검은 테두리 금지.

---

# 62. Chromatic aberration

기본 사용하지 않는다.

SUCCESS?에서도 사용하지 않는 것을 권장.

---

# 63. Film grain 전체 화면

시설 본편에는 거의 없음.

archival board content에만 제한.

---

# 64. Color grading

챕터 감정에 따라 극단 변화 금지.

시간대/장소 차이 중심.

---

# 65. Outline of critical route

바닥 선/색칠로 길 안내 금지.

---

# 66. Signage

실제 물리 signage.

font/type는 시대에 맞고 가독성 있음.

---

# 67. Fonts

문서:
typewriter/monospace 계열 인상.

signage:
industrial sans/serif.

UI:
가독성 높은 현대적 시스템 font도 가능하나 공간 text와 구분.

---

# 68. Font fetish 금지

역사적 느낌 때문에 읽기 힘든 display font를 본문에 사용하지 않는다.

---

# 69. Texture resolution

story-critical readable texture 우선.

background texture는 낮춰도 됨.

---

# 70. Texel density

같은 공간의 wall/desk에서 극단적으로 차이나지 않게.

---

# 71. Repetition

벽 tile/wood grain이 똑같이 반복되지 않게 UV variation.

---

# 72. Z-fighting

paper/decals/signage/board text에서 금지.

---

# 73. LOD

NPC/background props는 거리 기반 LOD.

story object inspect는 LOD0.

---

# 74. Shadow style

soft enough.

noir처럼 얼굴 반쪽이 항상 검지 않게.

---

# 75. AO

contact를 돕는 정도.

corner가 검은 테두리처럼 보이는 과도한 AO 금지.

---

# 76. Particle

허용:

• dust subtle
• test smoke
• board footage internal smoke

facility 공기 전체에 떠다니는 수천 particle 금지.

---

# 77. CH7 alarm FX

light 중심.

screen vignette/red overlay 금지.

---

# 78. CH9 FX

board footage 안에 집중.

room 자체에 explosion shockwave distortion 금지.

---

# 79. UI와 world 구분

world document는 실제 물체.

subtitle/hint만 screen UI.

---

# 80. Inspect

object를 깨끗하게 보이게 하되 배경 world가 완전히 사라지는 fullscreen inventory UI를 기본으로 하지 않는다.

---

# 81. Board

fullscreen overlay 대신 실제 room board를 보는 감각 유지.

---

# 82. Mobile

작은 화면에서:

• object silhouette
• text
• NPC face
• interaction target

읽히도록 detail hierarchy.

---

# 83. Mobile graphics fallback

줄여도 되는 것:

• shadow resolution
• normal detail
• background props
• particles
• reflection

유지:

• document texture
• postcard text
• board
• NPC major face
• story object

---

# 84. Low-end material

복잡한 transmission/clearcoat 남발 금지.

---

# 85. Performance visual budget

CH8/CH9를 기준.

8 NPC + board + room props.

---

# 86. Spoiler visual audit

CH1~8:

• bomb silhouette
• implosion diagram
• mushroom icon
• atomic symbol
• Hiroshima map
• aircraft nose art
• warhead crate

같은 암시도 점검.

---

# 87. Atomic symbol

시대/맥락상 과학 시설에 있을 수 있더라도,
player에게 프로젝트 의미를 지나치게 직접 암시한다면 피한다.

---

# 88. “비밀 프로젝트” trope

모든 문서에 TOP SECRET 빨간 도장 남발 금지.

보안은 검열/접근 제한으로 절제.

---

# 89. Visual continuity

같은 Director Office:

• desk
• door
• wall
• progress board

형태/위치 일관.

---

# 90. Chapter HTML 재구축

같은 asset family와 canonical material/placement를 사용해 continuity 유지.

---

# 91. QA: 시대

현대 물건 혼입 없음.

---

# 92. QA: 가독성

dark material끼리 merge되지 않음.

---

# 93. QA: 문서

type/readability/redaction.

---

# 94. QA: CH8

success genuine.

---

# 95. QA: CH9

archival visual이 의미를 명확히 전달.
glitch 과장 없음.

---

# 96. QA: CH10

home warm but grounded.
identity leak 없음.

---

# 97. QA: mobile

small screen에서 핵심 object/detail 보존.

---

# 98. 금지사항

• 전체 sepia
• 전체 film grain
• neon outline
• cyberpunk CRT
• CH8 ominous grading
• CH9 room explosion FX
• CH10 postcard glow
• unreadable historical font
• 모든 object dirty/rusty
• modern LED/monitor
• 실제 신원 조기 암시 personal prop
• excessive bloom/DOF/motion blur
• spoiler silhouette/diagram

---

# 99. 후속 문서와 연결

`23_UI.md`
• screen-space visual hierarchy

`24_TRANSITION.md`
• fade/black visual ownership

`27_MOBILE.md`
• mobile readability/fallback

`28_PERFORMANCE.md`
• material/texture/LOD budget

`29_SPOILER_RULES.md`
• visual spoiler audit

`30_HISTORICAL_PRESENTATION.md`
• 시대 요소와 실제 역사 표현 경계

각 CHAPTER 시각 문서
• material variants / FX / readability 구체화

<!-- MERGED SOURCE END: 22_VISUAL_STYLE.md -->

================================================================================
ORIGINAL SOURCE: 23_UI.md
================================================================================

# 23_UI.md

# UI SPECIFICATION

이 문서는 게임 전체의 screen-space UI를 정의한다.

범위:

• reticle
• interaction label
• dialogue subtitle
• chapter label
• progress 정보
• inspect 보조
• compare 보조
• document zoom
• mobile action controls
• accessibility caption
• board interaction prompt
• transition overlay
• Final Archive UI
• error/fallback 표시
• 스포일러 차단
• QA

핵심 원칙은 “UI가 물리 상호작용을 대신하지 않는다”이다.

---

# 1. UI 철학

게임의 핵심 정보는 가능한 한 world 안에 존재한다.

UI는 다음만 보조한다.

```text
현재 무엇과 상호작용 가능한가
대사가 무엇인가
작은 화면에서 어떻게 조작하는가
읽기 어려운 정보를 어떻게 보조하는가
```

---

# 2. 금지 UI

• quest tracker 상시 표시
• minimap
• compass objective arrow
• inventory grid
• morality meter
• clue solved checklist
• giant “CORRECT”
• wrong answer red flash
• glowing tutorial arrow

---

# 3. 기본 HUD

FREE 상태에서 가능한 기본:

```text
작은 reticle
필요 시 짧은 interaction label
```

그 외는 없음.

---

# 4. Reticle

화면 중심의 작고 단순한 표시.

• 낮은 opacity
• interaction 가능 시 미세한 변화

neon crosshair 금지.

---

# 5. Reticle state

예:

```text
IDLE
VALID_TARGET
BUSY
```

---

# 6. Interaction Label

target이 유효할 때만.

예:

```text
확인
읽기
대화
열기
집기
보기
```

---

# 7. Label에 답 금지

금지:

```text
잘못된 교정표 확인
오류가 있는 보고서
히로시마 사진
오펜하이머 엽서
```

---

# 8. Public Label

story state에 따라 spoiler-safe label.

예:

before reveal:

```text
엽서
사진
작은 메달
```

---

# 9. Interaction key 표시

PC:

```text
E
클릭
```

모바일:
action button/icon.

항상 둘 다 동시에 보여주지 않는다.

---

# 10. UI 위치

interaction label은 reticle 근처 또는 하단 중앙.

문서/손/자막과 겹치지 않게.

---

# 11. Dialogue Subtitle

기본 하단 중앙.

한 번에 한 문장/의미 단위.

---

# 12. Speaker label

CH1~8:

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

surname 금지.

---

# 13. Player speech

플레이어는 대부분 말하지 않으므로 player subtitle box 상시 구조 불필요.

---

# 14. Subtitle background

필요하면 작은 translucent background/gradient.

화면 하단 전체 검은 bar 금지.

---

# 15. Subtitle size

desktop/mobile 모두 얼굴/문서 가리지 않는 범위에서 충분한 크기.

정확 px은 27_MOBILE에서 확정.

---

# 16. Dialogue advance cue

아주 작은:

```text
›
```

또는 subtle cue.

깜빡이는 큰 “CLICK TO CONTINUE” 금지.

---

# 17. Forced pause

advance cue를 숨기거나 비활성.

player가 입력해도 다음 줄로 가지 않음.

---

# 18. Auto dialogue

AUTO line은 advance cue 없음.

---

# 19. Caption

critical non-speech sound:

```text
[전화벨]
[노크]
[경보]
```

접근성 옵션으로 표시 가능.

---

# 20. Caption 위치

subtitle와 충돌하지 않게.

동시에 여러 sound caption 쌓지 않는다.

---

# 21. Chapter Label

챕터 도입:

```text
CHAPTER 01
RICHARD ███████
```

작고 절제.

---

# 22. Chapter Label duration

읽을 만큼.

gameplay를 오래 막지 않는다.

---

# 23. Chapter Label 위치

화면 corner/상단.

NPC 얼굴/핵심 action을 가리지 않음.

---

# 24. Progress

상시 HUD progress bar 없음.

실제 facility board 우선.

---

# 25. 필요 시 progress UI

transition/확인 장면에서 아주 짧은 숫자 보조 가능하지만,
world board와 중복 남발하지 않는다.

---

# 26. Inspect UI

기본 world object 중심.

화면에는:

• close/cancel
• flip 가능하면 flip cue
• page 가능하면 next/prev
• zoom 가능하면 zoom

최소한만.

---

# 27. Inspect label

object title 정도.

정답 해설 금지.

---

# 28. Document zoom

읽기 접근성을 위한 zoom.

zoom 배율 자체가 puzzle mechanic이 아님.

---

# 29. Zoom controls

PC:
wheel/지정 input.

mobile:
pinch 또는 zoom button.

camera look와 충돌하지 않음.

---

# 30. Compare UI

두 문서 비교 시:

• LEFT/RIGHT focus
• 확대
• close

정도.

mismatch highlight 없음.

---

# 31. Compare orientation

world/inspect 문서가 주.

UI panel이 문서를 완전히 대체하지 않음.

---

# 32. Document translation aid

영어 문서에 한국어 보조가 필요하면 작은 toggle/tooltip 가능.

원문과 보조가 시각적으로 구분.

---

# 33. Translation가 답을 설명하지 않기

직역/의미 전달만.

추론 결과까지 번역에 추가 금지.

---

# 34. Stamp UI

STAMP 상태에서:

• 현재 도장 물리 object
• 필요하면 작은 “찍기” action cue

도장 선택 menu 없음.

---

# 35. REJECTED/APPROVED 선택 메뉴 금지

story gate로 physical stamp가 활성화.

---

# 36. Stamp confirm

hover pose 도착 뒤 action cue 활성.

선택 click이 impact까지 이어지지 않게.

---

# 37. CH8 Archive UI

실제 binder/drawer shell을 world에서 interaction.

내부 record selection은 간결한 list/card 형태를 사용할 수 있음.

---

# 38. Archive index

CH8:

```text
RICHARD ███████
ENRICO ███████
...
```

---

# 39. Archive UI는 답을 표시하지 않음

approved canonical document를 보여줄 뿐.

final report mismatch 자동 비교 금지.

---

# 40. CH9 Board Prompt

player가 board zone에 도착하고 story state가 준비되면:

```text
VIEW RESULTS
```

---

# 41. VIEW RESULTS

행동 의미를 정확히 표현.

“진실 보기”, “결과의 의미 확인” 같은 해석적 문구 금지.

---

# 42. CH9 Cinematic UI

VIEW RESULTS 이후:

• reticle 제거
• interaction hint 제거
• 일반 HUD 제거
• 필요한 archival board text만 world screen

---

# 43. Board film UI

화면 안 콘텐츠는 diegetic.

screen-space HUD로 mission result를 복제하지 않는다.

---

# 44. SUCCESS?

board 자체 text.

UI overlay 아님.

---

# 45. CH10 기본 UI

HUD 없음 또는 reticle 최소.

home은 조용한 탐색.

---

# 46. Radio

상호작용 시 작은:

```text
라디오
```

정도.

broadcast transcript를 항상 화면 가득 표시하지 않는다.

caption/subtitle 옵션 가능.

---

# 47. Phone ring

objective arrow 금지.

phone source + normal interaction label.

---

# 48. Phone dialogue

caller label:

```text
VOICE
```

또는 `CALLER`.

신원 추정 label 금지.

---

# 49. Handset throw

시네마틱 중 UI 제거.

---

# 50. Knock

필요 시 caption.

door에 큰 highlight 금지.

---

# 51. Parcel

label:

```text
상자
소포
```

정도.

---

# 52. Photo

interaction label:

```text
사진
```

뒷면 보기 후 실제 내용.

---

# 53. Medal

```text
기념 메달
```

또는 무해한 generic label.

---

# 54. Postcard

```text
엽서
```

identity reveal 전 그 이상 없음.

---

# 55. Postcard cinematic UI

flip/continue cue만.

이름 reveal은 카드 자체 text.

---

# 56. Identity reveal

화면에 별도:

```text
YOU ARE J. ROBERT OPPENHEIMER
```

금지.

---

# 57. Profile

postcard reveal 이후에는 2D profile card 사용 가능.

```text
J. ROBERT OPPENHEIMER
SCIENTIFIC DIRECTOR
LOS ALAMOS LABORATORY
MANHATTAN PROJECT
```

---

# 58. Final Archive UI

물리 world UI와 구분된 archive cinematic layer.

---

# 59. Archive card

각 인물:

• chapter
• redacted name
• flashback
• full name
• role
• short note

---

# 60. Continue

최소 읽기 시간 후.

한 input으로 여러 카드 skip 금지.

---

# 61. Ending Code

최종 silence 후 단독 표시.

추가 mandatory title 없음.

---

# 62. Transition Overlay

black fade layer.

이 overlay가 transition 중 모든 click을 소비.

---

# 63. Loading indicator

챕터 페이지가 충분히 작고 preload가 안정적이면 기본적으로 노출하지 않음.

필요할 때만 subtle.

---

# 64. Browser pointer lock

PC에서 Esc로 pointer lock이 풀릴 수 있음.

UI는 pointer lock 상태를 감지.

필요하면:

```text
화면을 클릭하여 계속
```

정도의 복귀 안내.

---

# 65. Pointer lock 안내

게임play cancel과 혼동하지 않게.

Esc를 눌렀다고 puzzle modal이 이상하게 닫히지 않음.

---

# 66. Fullscreen

선택 기능.

UI 핵심 구조가 fullscreen에 의존하지 않음.

---

# 67. Mobile HUD

기본:

```text
left joystick
right look zone
action button
```

상태에 따라 필요한 요소만.

---

# 68. Mobile Dialogue

joystick 숨김/비활성 가능.

화면 탭 또는 별도 next area.

---

# 69. Mobile Inspect

movement UI 숨김.

rotate/flip/close control.

---

# 70. Mobile Carry

joystick + 제한 look + place action.

door interaction 없음.

---

# 71. Mobile Stamp

movement UI 제거.

action 하나.

---

# 72. Mobile Cinematic

controls 숨김.

---

# 73. Touch targets

작은 텍스트 icon만 눌러야 하는 구조 금지.

충분한 hit area.

---

# 74. Safe area

notch/navigation bar 고려.

---

# 75. Orientation

기본 landscape 권장.

portrait에서는 안내 후 landscape 전환을 권장할 수 있음.

강제 reload 금지.

---

# 76. UI scale

화면 크기와 DPR에 따라.

문서 texture 해상도와 별개.

---

# 77. Accessibility

가능 옵션:

• subtitle size
• caption
• reduced flash
• reduced motion
• audio volume
• look sensitivity

---

# 78. Color accessibility

색만으로 상태 전달 금지.

---

# 79. Text contrast

배경과 최소한의 대비 확보.

밝은 board/flash에서도 subtitle 읽힘.

필요하면 outline/shadow.

---

# 80. Error UI

story-critical asset 실패를 raw JS error로 player에게 노출하지 않는다.

가능한 fallback.

---

# 81. Debug UI

production과 완전 분리.

debug label에 spoiler full name이 production으로 새지 않게.

---

# 82. Save indicator

자동 저장 시 작은 subtle cue 가능.

필수 아님.

---

# 83. Save cue 남발 금지

도장마다 큰 “SAVED” toast 금지.

---

# 84. Interaction rejection

거리/상태 때문에 불가하면 매번 error toast를 띄우지 않는다.

필요한 경우 짧은 context feedback.

---

# 85. Wrong puzzle action

정답/오답 팝업 대신 논리적 world/dialogue feedback.

---

# 86. UI ownership

우선순위:

```text
TRANSITION
> CINEMATIC
> DIALOGUE
> INSPECT/STAMP
> CARRY
> FREE
```

---

# 87. State change

상태 변경 때 이전 UI element 정리.

dialogue subtitle가 FREE로 돌아와 남아 있지 않게.

---

# 88. Input consumption

UI를 눌렀을 때 world interaction도 동시에 실행되지 않음.

---

# 89. Rapid input

button one-shot guard.

archive continue/phone/dialogue/transition 중복 없음.

---

# 90. Focus loss

활성 touch pointer/UI pressed state clear.

---

# 91. Reload

UI는 game semantic state에서 재구성.

중간 animation UI 저장 안 함.

---

# 92. Localization

UI 한국어 기본 가능.

역사 문서/board는 영어 사용 가능.

---

# 93. String length

버튼/label이 번역으로 overflow하지 않게.

---

# 94. Spoiler audit

CH1~8 UI에서:

• surname
• Manhattan
• bomb
• Hiroshima/Nagasaki
• Little Boy/Fat Man

금지.

---

# 95. CH10 spoiler audit

postcard 전:

• Oppenheimer
• J. Robert

UI/debug/public label 모두 금지.

---

# 96. QA Desktop

• reticle
• dialogue
• inspect
• archive
• pointer lock
• fullscreen
• transition

---

# 97. QA Mobile

• joystick/look/action separation
• touch target
• safe area
• subtitle
• orientation
• document zoom

---

# 98. QA Cinematic

UI가 사라져야 할 때 모두 정리.

---

# 99. QA Spoiler

production build string scan.

---

# 100. 금지사항

• modal-heavy puzzle UI
• choice menu로 stamp 결정
• clue checklist
• minimap
• quest arrow
• answer highlight
• neon outline
• giant tutorial
• “YOU ARE OPPENHEIMER”
• CH9 결과 HUD 복제
• mobile에서 버튼 과밀
• UI click과 world click 동시 실행
• raw debug spoiler 노출

---

# 101. 후속 문서와 연결

`24_TRANSITION.md`
• fade/black overlay와 navigation lock

`25_SAVE_AND_RESUME.md`
• save cue / UI reconstruction

`27_MOBILE.md`
• touch layout 최종 수치

`29_SPOILER_RULES.md`
• production string audit

`31_FAILURE_PREVENTION.md`
• UI lock/input duplication failure 대응

각 CHAPTER `UI.md`
• 해당 장면에서 실제 노출되는 UI를 구체화

<!-- MERGED SOURCE END: 23_UI.md -->

================================================================================
ORIGINAL SOURCE: 24_TRANSITION.md
================================================================================

# 24_TRANSITION.md

# TRANSITION SPECIFICATION

이 문서는 챕터 시작/종료, 페이지 이동, black fade, 시설→자택 전환, CH9→CH10, Final Archive 진입, 브라우저 페이지 전환에서 발생하는 입력·카메라·오디오·저장·상태 handoff를 정의한다.

프로젝트는 기본적으로:

```text
chapter01.html
...
chapter10.html
```

형태의 챕터별 페이지를 사용할 수 있다.

따라서 transition은 단순 fade가 아니라 “현재 챕터를 안전하게 끝내고 다음 페이지를 정확한 상태로 시작시키는 시스템”이다.

---

# 1. 기본 흐름

표준:

```text
FINAL STORY COMMIT
→ TRANSITION REQUEST
→ transitionCommitted
→ INPUT LOCK
→ INTERACTION OFF
→ AUDIO FADE / FINAL CUE
→ VISUAL FADE TO BLACK
→ SAVE
→ PAGE NAVIGATION
→ NEXT PAGE BLACK
→ LOAD / RECONSTRUCT
→ READY
→ FADE IN
→ INPUT RELEASE
```

---

# 2. TRANSITION State

기존 player state:

```text
TRANSITION
```

사용.

우선순위 최상위권.

---

# 3. Transition 중 차단

• movement
• look
• interaction
• dialogue
• inspect
• stamp
• carry actions
• NPC interaction
• 재전환 요청

---

# 4. transitionCommitted

한 번 true가 되면 같은 장면에서 두 번째 navigation 실행 금지.

---

# 5. Transition Request 조건

• story milestone 완료
• 현재 irreversible action commit 완료
• save 가능한 semantic state
• 필수 cinematic marker 완료
• next chapter route 존재

---

# 6. 애니메이션 중 전환 금지

도장 impact 전,
door 중간,
phone throw 중간,
postcard flip 중간

에 page navigation하지 않는다.

---

# 7. Safe Endpoint

전환 직전 world는 가능한 한 canonical endpoint.

정확한 transient transform을 다음 페이지로 넘기지 않는다.

---

# 8. Fade to Black

black overlay를 screen-space 최상단에 사용.

geometry 앞에 검은 plane를 놓는 방식보다 안정적.

---

# 9. Fade duration

장면별 조정 가능.

기본:

```text
약 0.4~1.0s
```

감정적 black hold는 별도.

정확 값은 26.

---

# 10. Black Hold

필요한 장면:

• CH9 power-down
• CH10 identity/archive
• ending

fade duration과 silence hold를 구분.

---

# 11. Fade ownership

TRANSITION이 overlay owner.

다른 cinematic이 동시에 opacity를 덮어쓰지 않는다.

---

# 12. Fade 중 클릭

모든 pointer event를 overlay가 소비.

뒤 world target 재실행 금지.

---

# 13. Audio transition

일반 chapter:

• room ambience fade
• 필요한 final one-shot 유지
• 다음 page에서 새 ambience

---

# 14. Audio hard cut 금지

특별히 의도된 black silence 외에는 click처럼 abrupt stop 금지.

---

# 15. CH9 power-down

audio fade를 transition이 먼저 해버리지 않는다.

power-down cinematic 자체가 기계음을 제거.

그 뒤 black transition은 silence 유지.

---

# 16. CH9→CH10

특별 흐름:

```text
SUCCESS?
→ power-down
→ board off
→ full room black
→ silence
→ transition lock
→ save CH09_COMPLETE
→ navigate chapter10
→ chapter10 starts black
→ home ambience ready
→ fade in home
```

---

# 17. CH10 home start

page가 잠깐 white/unstyled 화면을 보이지 않게.

초기 body background도 black.

---

# 18. First Paint 보호

CSS/renderer 준비 전 black 유지.

---

# 19. Asset Load

핵심 asset 준비 전 fade in하지 않는다.

---

# 20. Loading Timeout

무한 black screen 방지.

critical asset 실패 시 fallback/오류 복구.

---

# 21. Page Navigation

가능:

```js
location.href = "chapter02.html"
```

단 navigation call은 한 곳에서만.

---

# 22. History

뒤로가기로 completed chapter를 임의 transient state로 되돌릴 수 있음.

정책 필요.

기본은 load 시 저장된 canonical progress를 따름.

---

# 23. Browser Back

이전 page로 돌아오더라도 완료된 cinematic을 자동 재실행하지 않게 save/state gate.

---

# 24. Refresh

현재 chapter safe checkpoint로.

transition 중 refresh해도 corrupted half-state가 저장되지 않게.

---

# 25. Save timing

기본:

```text
STORY COMMIT
→ SAVE
→ NAVIGATE
```

---

# 26. save 실패

localStorage write 실패 가능.

게임이 영구 black에 갇히지 않게.

가능하면 in-memory state로 current transition 진행.

다음 page fallback.

---

# 27. Save checksum/version

구체 정책은 25.

transition은 save success/failure 결과만 받음.

---

# 28. Next Chapter Intent

저장 데이터에:

```text
nextChapter
entryCheckpoint
```

같은 semantic target 가능.

---

# 29. Page entry

다음 page는 URL만 보고 모든 story를 추론하지 않는다.

save/checkpoint와 chapter default를 검증.

---

# 30. Invalid entry

잘못된 URL로 chapter05 직접 접근 등.

개발 모드와 production 정책 분리.

production은 가장 가까운 합리적 checkpoint 또는 new game 정책.

---

# 31. Chapter opening

black overlay 상태에서:

• scene build
• player spawn
• NPC canonical state
• facility progress
• audio prepare
• UI state

완료.

---

# 32. Fade In

READY 후.

---

# 33. Fade In 중 입력

기본적으로 fade 거의 끝날 때까지 movement 차단.

---

# 34. Fade In 후 pointer lock

PC 브라우저는 user gesture 없이 pointer lock 재획득이 불가능할 수 있다.

페이지 이동 후 자동 pointer lock을 가정하지 않는다.

---

# 35. Pointer lock 재개

fade in 후:

```text
화면 클릭하여 계속
```

같은 짧은 entry gate 가능.

---

# 36. Entry Gate

이 click은 world interaction으로 전달되지 않는다.

pointer lock 획득에만 소비.

---

# 37. Mobile entry

pointer lock 없음.

fade 완료 후 바로 touch control 활성 가능.

---

# 38. Chapter Intro Label

fade in 이후 적절한 시점에 chapter label.

black 위에 무조건 label부터 띄우지 않는다.

---

# 39. Prologue

초기 게임 시작:

```text
black
→ 1943 / ambience
→ office fade in
→ controls available
→ knock
```

정확 연출은 prologue design.

---

# 40. CH1~7 chapter end

일반:

```text
APPROVED
→ reaction
→ facility change
→ progress
→ short hold
→ transition
```

---

# 41. CH8 end

100% 성공을 충분히 보여준 뒤 transition.

바로 CH9 결과 화면으로 컷 금지.

---

# 42. CH8→CH9

같은 시설 continuity.

black transition을 짧게 쓸 수 있음.

CH9 load 후 room 상태는 CH8 100% canonical.

---

# 43. 동일 공간 transition

같은 room이라도 page navigation이 있을 수 있으므로:

• player position
• NPC group
• progress state

canonical entry로 재구성.

---

# 44. Visible pop 방지

fade가 완전히 black일 때 scene reconstruction.

---

# 45. CH10 identity→profile

이 구간은 page navigation이 아니라 동일 page cinematic transition일 가능성 높음.

그래도 TRANSITION-like overlay owner 사용 가능.

---

# 46. Postcard→Profile

```text
identity full
→ hold
→ continue
→ postcard recedes / black
→ profile
```

---

# 47. Profile→Final Archive

world 3D interaction registry off.

black/card layer로.

---

# 48. Final Archive 내부

각 인물 사이:

```text
fade/card transition
```

페이지 navigation 없음.

---

# 49. Archive 마지막→Ending

Hans
→ black
→ stamp memories
→ silence
→ ENDING CODE

---

# 50. Ending 이후

새 자동 title card 금지.

필요하면 user 선택으로 restart/credits 등 후속 UI를 추후 설계.

---

# 51. Transition Queue 금지

한 transition이 진행 중인데 다음 transition request를 queue하지 않는다.

두 번째는 reject.

---

# 52. Lock owner

예:

```text
TRANSITION_CH01_TO_CH02
```

owner 기반.

---

# 53. Lock cleanup

navigation이 실제로 시작되기 전 error가 나면 lock 정리 및 safe state 복구.

---

# 54. Navigation failure

URL missing/404를 앱 내부에서 완전히 막기는 어렵지만,
개발 QA에서 모든 target 확인.

---

# 55. Preflight

transition 전에 next file 존재 여부를 개발 빌드에서 검증 가능.

---

# 56. Double-click

chapter end button 같은 UI 자체를 가급적 만들지 않는다.

story event가 transition trigger.

동일 event double invoke 방지.

---

# 57. Dialogue advance와 transition

마지막 dialogue line을 넘긴 동일 click이 다음 chapter world interaction으로 이어지지 않는다.

---

# 58. Pointer event flush

transition 시작/끝에서 held pointer/keys clear.

---

# 59. Movement flush

W를 누른 상태로 page transition해 다음 chapter에서 자동 전진 금지.

---

# 60. Visibility change

transition 중 tab background.

복귀 시:

• navigation 이미 됐으면 next page
• 아직이면 safe transition state

중복 navigate 없음.

---

# 61. Focus loss

fade tween이 background에서 끝나고 audio만 꼬이지 않게 semantic endpoint.

---

# 62. Transition clock

공통 animation clock.

---

# 63. No Promise race

save/navigation/fade를 Promise.race로 먼저 끝난 것에 맡기지 않는다.

순서를 명확히.

---

# 64. Example API

```js
await transitionToChapter({
  next: "chapter02.html",
  checkpoint: "CH01_COMPLETE",
  fadeProfile: "STANDARD"
});
```

---

# 65. 내부 절차

```js
validate()
lock()
fadeOut()
save()
navigate()
```

페이지 진입은 별도 bootstrap.

---

# 66. Transition Profile

예:

```text
STANDARD
SHORT_CONTINUITY
LONG_BLACK
CH09_TO_HOME
ARCHIVE_INTERNAL
ENDING
```

---

# 67. STANDARD

CH1~7 일반.

---

# 68. SHORT_CONTINUITY

CH8→CH9 같은 동일 facility.

---

# 69. LONG_BLACK

CH9→CH10.

---

# 70. ARCHIVE_INTERNAL

3D page navigation 없음.

---

# 71. ENDING

black/silence 중심.

---

# 72. Visual continuity

fade 직전/후 카메라 방향이 완전히 랜덤하게 달라지지 않게.

같은 공간이면 특히.

---

# 73. Audio continuity

같은 시설이면 다음 page ambience가 너무 다른 음색으로 바뀌지 않게.

---

# 74. Facility progress continuity

save milestone 기반으로 정확한 light/equipment/prop state.

---

# 75. NPC continuity

exact transform 저장 대신 canonical blocking.

---

# 76. Document continuity

approved archive/state 저장.

---

# 77. UI continuity

이전 subtitle/hint는 next page로 carry하지 않음.

---

# 78. Transition 중 spinner

기본 금지.

필요한 느린 로드에서만.

시대 UI처럼 꾸미려 하지 않고 단순 system UI.

---

# 79. Error recovery

다음 page bootstrap 실패하면:

• black overlay
• 간단한 재시도/메뉴 fallback

raw stack trace 금지.

---

# 80. Local file hosting

브라우저 보안 정책/asset fetch 때문에 실제 배포는 HTTP hosting 전제 권장.

단순 file://에서 기능이 제한될 수 있음.

구현 단계에서 확인.

---

# 81. Transition performance

fade 중 무거운 scene update를 계속할 필요 없음.

---

# 82. Dispose

navigation 전 굳이 모든 asset을 수동 dispose하고 navigation을 지연할 필요는 없음.

SPA가 아니라 페이지 이동이면 브라우저가 정리.

단 같은 page internal transition은 cleanup 필요.

---

# 83. Audio cleanup

pagehide/beforeunload에서 duplicate loop를 방지.

---

# 84. Save on unload 의존 금지

핵심 저장을 `beforeunload`에만 맡기지 않는다.

transition 전에 명시적으로 저장.

---

# 85. Browser confirm dialog 금지

chapter 이동 때 “페이지를 떠나시겠습니까?” 같은 경고가 뜨지 않게 unsaved form 상태 없음.

---

# 86. Transition QA

• 정상
• double invoke
• W held
• mouse held
• focus loss
• refresh
• back
• save fail
• next page missing
• audio suspend
• low FPS

---

# 87. CH8→9 QA

• progress 100 유지
• same facility continuity
• NPC canonical group
• no result reveal before VIEW RESULTS

---

# 88. CH9→10 QA

• power-down 먼저
• full black
• save
• home first paint black
• no white flash between pages
• pointer lock entry safe

---

# 89. CH10 Archive QA

• 3D interaction off
• archive input one-shot
• ending transition no extra title

---

# 90. 금지사항

• animation 중 navigate
• double navigation
• fade 전에 save 없이 이동
• save를 unload에만 의존
• next page white flash
• pointer lock 자동 재획득 가정
• held W carryover
• 이전 UI 잔존
• CH8 100%를 보여주기 전에 이동
• CH9 power-down 전에 audio fade
• CH9→10 즉시 home cut
• transition queue
• raw loading/error 화면
• ending에 임의 title 추가

---

# 91. 후속 문서와 연결

`25_SAVE_AND_RESUME.md`
• save schema/checkpoint/restore

`26_TIMING_AND_PACING.md`
• fade/black hold 시간

`27_MOBILE.md`
• entry control / orientation

`31_FAILURE_PREVENTION.md`
• navigation/save failure 대응

`32_COMMON_QA.md`
• chapter transition 전수 테스트

각 CHAPTER `STATE.md`
• 실제 complete milestone과 next entry checkpoint 정의

<!-- MERGED SOURCE END: 24_TRANSITION.md -->
