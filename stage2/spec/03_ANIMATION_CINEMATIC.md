<!-- MERGED SOURCE START: 10_ANIMATION_CORE.md -->

# 10_ANIMATION_CORE.md

# ANIMATION CORE SPECIFICATION

이 문서는 게임 전체에서 사용하는 공통 애니메이션 실행 구조를 정의한다.

범위:

• tween
• easing
• sequence
• wait
• 직렬/병렬 실행
• async/await
• animation ownership
• player/NPC/object/camera lock
• 시작 상태와 종료 상태
• state commit
• interruption
• rollback
• focus loss 복구
• frame hitch 대응
• 카메라/NPC/오브젝트/조명/사운드 동기화
• 안전 checkpoint
• animation failure 처리
• debug/QA

이 문서는 “어떤 장면에서 어떤 물체가 어떻게 움직이는가”를 직접 정의하지 않는다.

구체적인 물체 동작은 `11_OBJECT_ANIMATION.md`,
시네마틱 구성은 `12_CINEMATIC_SEQUENCE.md`,
챕터별 세부 연출은 각 CHAPTER의 `ANIMATION.md`가 담당한다.

---

# 1. 기본 원칙

애니메이션 시스템은 단순한 `setTimeout` 묶음이 아니다.

모든 중요한 연출은 다음 질문에 답할 수 있어야 한다.

```text
누가 제어권을 가지고 있는가
언제 시작할 수 있는가
무엇을 잠그는가
어떤 상태에서 시작하는가
어떤 상태로 끝나는가
중간에 실패하면 어떻게 복구하는가
완료 시 무엇을 commit하는가
다른 animation과 동시에 실행 가능한가
```

---

# 2. Animation은 상태 변화의 표현

논리 상태와 애니메이션 상태를 구분한다.

예:

문이 열림.

잘못된 구조:

```text
state = OPEN
→ 문 회전 시작
```

권장:

```text
state = CLOSED
→ state = OPENING
→ animation
→ animation 완료 검증
→ state = OPEN
```

애니메이션 시작 순간 최종 결과를 확정하지 않는다.

---

# 3. 기본 실행 단계

중요 animation은 다음 구조를 사용한다.

```text
VALIDATE
→ RESERVE
→ LOCK
→ PREPARE
→ PLAY
→ VERIFY
→ COMMIT
→ RELEASE
```

실패 시:

```text
ROLLBACK
→ RELEASE
```

---

# 4. VALIDATE

시작 전 검사.

예:

• 필요한 object 존재
• 필요한 anchor 존재
• playerState 적합
• NPC state 적합
• destination slot 사용 가능
• camera safe pose 가능
• path clearance 확보
• 동일 sequence 이미 실행 중 아님
• story state 적합

validation 실패 시 animation 자체를 시작하지 않는다.

---

# 5. RESERVE

animation 중 사용할 자원을 예약한다.

예:

• document placement slot
• NPC destination anchor
• camera ownership
• door traversal
• parcel table slot

예약 없이 시작했다가 중간에 다른 sequence와 충돌하지 않게 한다.

---

# 6. LOCK

필요한 범위만 잠근다.

가능한 lock:

```text
PLAYER_INPUT
WORLD_INTERACTION
CAMERA
NPC
OBJECT
DOOR
DIALOGUE_ADVANCE
TRANSITION
```

모든 animation마다 게임 전체를 LOCKED로 만들지 않는다.

---

# 7. PREPARE

본 동작 전 작은 정렬 단계.

예:

• NPC가 대상 쪽으로 몸을 돌림
• player movement vector 0
• camera pending delta 제거
• object parent 확인
• 손 grip anchor 준비
• audio emitter 준비

PREPARE를 생략해 첫 프레임부터 물체가 튀는 문제를 막는다.

---

# 8. PLAY

실제 tween/clip/sequence 실행.

PLAY 중 논리 state는 보통 transitional state를 유지한다.

예:

```text
OPENING
PICKING_UP
ANSWERING
THROWING
MOVING
```

---

# 9. VERIFY

animation 완료 후 실제 상태를 검사한다.

예:

• object가 목표 transform에 도달
• parent가 올바름
• destination slot occupant 일치
• NPC가 target anchor에 있음
• door rotation 정상
• camera가 safe pose
• object가 벽/바닥 안에 없음

완료 callback이 호출됐다는 이유만으로 성공으로 간주하지 않는다.

---

# 10. COMMIT

VERIFY 통과 후 최종 story/world state를 확정한다.

예:

```text
door = OPEN
documentOwner = PLAYER
photoInspected = true
chapterPhase = REJECTED
```

---

# 11. RELEASE

animation이 소유했던 lock/reservation을 해제한다.

다음 state가 FREE가 아닐 수 있다.

예:

```text
INSPECT
→ STAMP
```

이라면 STAMP가 camera/input ownership을 이어받는다.

중간에 FREE로 한 프레임 풀려 다른 입력이 들어오지 않게 한다.

---

# 12. Animation Job

권장 공통 단위:

```js
{
  id,
  owner,
  targetIds,
  priority,

  validate,
  prepare,
  play,
  verify,
  commit,
  rollback,
  cleanup
}
```

---

# 13. Sequence ID

모든 story-critical sequence는 명확한 id를 가진다.

예:

```text
CH01_RICHARD_HANDOFF
CH01_REJECT_STAMP
CH05_GEORGE_RECLAIM
CH08_FINAL_APPROVAL
CH09_RESULTS_START
CH10_PHONE_ANSWER
CH10_HANDSET_THROW
CH10_POSTCARD_REVEAL
```

`anim1`, `sequence2` 같은 이름 금지.

---

# 14. Animation Ownership

같은 대상은 한 시점에 하나의 주요 owner만 가진다.

예:

Richard를:

• idle system
• dialogue system
• movement system
• chapter cinematic

이 동시에 transform하지 않는다.

---

# 15. Owner 우선순위

공통 권장 우선순위:

```text
TRANSITION
> CHAPTER_CINEMATIC
> STORY_SEQUENCE
> STAMP / INSPECT
> DIALOGUE
> INTERACTION
> TASK
> IDLE
```

상위 owner가 제어 중이면 하위 시스템은 대기하거나 정지.

---

# 16. Target Lock

각 animated target은 owner를 기록할 수 있다.

```text
animationOwner[targetId]
```

이미 다른 owner가 점유한 target을 강제로 뺏지 않는다.

필요하면 명시적인 takeover 절차 사용.

---

# 17. Takeover

예:

NPC idle
→ dialogue.

가능한 takeover:

```text
IDLE
→ fade/transition 0.1~0.25s
→ DIALOGUE
```

중간 pose를 자연스럽게 blend.

---

# 18. Tween 기본 API

권장:

```js
tweenValue(...)
tweenPosition(...)
tweenRotation(...)
tweenScale(...)
tweenOpacity(...)
tweenColor(...)
tweenCamera(...)
tweenLight(...)
```

각 함수는 Promise를 반환.

---

# 19. Promise 기반 실행

예:

```js
await tweenPosition(object, target, 0.5);
await wait(0.2);
await tweenRotation(object, rotation, 0.35);
```

callback 중첩 구조를 피한다.

---

# 20. Sequence Helper

권장:

```js
await sequence(
  stepA,
  stepB,
  stepC
);
```

또는 명시적인 async 함수.

읽었을 때 장면 순서를 이해할 수 있어야 한다.

---

# 21. Parallel Helper

동시에 실행해야 하는 경우:

```js
await parallel(
  cameraMove,
  npcTurn,
  documentLift
);
```

병렬 실행은 의도적으로 지정한다.

Promise를 저장하지 않고 fire-and-forget하는 방식을 story-critical animation에 사용하지 않는다.

---

# 22. Race 금지

story-critical sequence에서:

```js
Promise.race(...)
```

는 기본적으로 사용하지 않는다.

어떤 동작이 먼저 끝나느냐에 따라 결과가 달라지면 재현성이 떨어진다.

---

# 23. Wait

`wait(seconds)`는 허용.

하지만 긴 sequence를 수십 개의 임의 setTimeout으로 조립하지 않는다.

wait은 감정적/연출적 pause에 사용.

---

# 24. 시간 단위

프로젝트 전체 animation API는 초 단위 또는 밀리초 단위 중 하나로 통일한다.

권장:

```text
seconds
```

예:

```js
wait(0.8)
tweenPosition(..., 0.45)
```

`500`, `0.5`가 혼재하지 않게 한다.

---

# 25. Easing

기본 easing:

```text
linear
easeInQuad
easeOutQuad
easeInOutQuad
easeOutCubic
easeInOutCubic
smoothstep
```

필요 이상의 easing 종류를 만들지 않는다.

---

# 26. 기본 Easing 정책

사람/카메라:
`easeInOutCubic` 또는 자연스러운 smooth easing.

가벼운 오브젝트:
`easeOutCubic`.

묵직한 물체:
초반 가속 + 명확한 감속.

기계 레버:
짧고 단단한 easing.

---

# 27. 금지 Easing

기본 톤에서 금지:

• bounce
• elastic
• cartoon overshoot
• 과도한 spring

문서, 전화, 메달, 사람 움직임에 특히 금지.

---

# 28. Rotation 보간

Euler angle 직접 선형 보간으로 350°→10°가 340° 돌아가는 문제를 피한다.

필요하면 quaternion 또는 shortest-path rotation 사용.

---

# 29. 단위 통일

rotation API가 degree/radian을 혼용하지 않게 한다.

내부는 radian,
문서/설계 데이터는 degree 허용 가능.

변환 지점을 하나로 제한.

---

# 30. Transform Source of Truth

animated object transform의 source of truth를 명확히 한다.

예:

world transform을 tween하는 동안 physics나 idle system이 같은 transform을 덮어쓰지 않는다.

---

# 31. Parent 변경

문서 handoff 등 parent가 바뀌는 경우:

```text
NPC hand
→ PLAYER hand
→ inspect anchor
→ desk slot
```

parent 변경 순간 world transform을 보존.

갑자기 위치가 튀지 않게 한다.

---

# 32. Attachment Handoff

권장:

1. 기존 parent에서 world matrix 확보
2. 새 parent에 attach
3. local transform 재계산
4. 짧은 settle tween

Three.js의 `attach()` 또는 동등한 world-preserving 방식 고려.

---

# 33. Camera Animation

camera는 `03_CAMERA.md`의 pose/owner 규칙을 따른다.

장면 코드가 camera.position을 직접 수정하지 않는다.

camera animation도 Promise 기반.

---

# 34. Camera + Object 동기화

예:

문서 조사 시작:

```text
camera focus
+
document lift
+
player hand appearance
```

모두 완전히 동시에 시작할 필요는 없다.

권장:

```text
document lift 0.0s
camera move +0.05s
hand settle +0.10s
```

처럼 약간의 자연스러운 offset 가능.

---

# 35. NPC Movement 연동

NPC 이동은 `07_NPC_MOVEMENT.md`의 경로를 사용.

Animation Core가 raw 직선 tween으로 NPC root를 움직이지 않는다.

movement subsystem이 Promise를 반환하게 한다.

```js
await moveNpcTo("npc_richard", "ch01_desk");
```

---

# 36. NPC Gesture 연동

Gesture system도 Promise 또는 duration-aware handle 제공.

예:

```js
await gesture("npc_hans", "CLOSE_REPORT");
```

또는 병렬:

```js
await parallel(
  gesture(...),
  wait(...)
);
```

---

# 37. Dialogue 연동

Dialogue line 자체가 모든 animation을 소유하지 않는다.

대화는 cue 발생.

Sequence coordinator가:

• dialogue
• camera
• gesture
• object

를 묶는다.

---

# 38. Audio 연동

효과음은 tween 완료가 아니라 실제 물리적 순간에 맞춘다.

예:

도장:
impact frame.

전화 수화기:
table edge collision frame.

문:
latch release frame.

---

# 39. Animation Marker

중요 animation에는 marker를 둘 수 있다.

예:

```text
HAND_CONTACT
OBJECT_RELEASE
STAMP_IMPACT
DOOR_LATCH
FOOT_PLANT
PHONE_IMPACT
CORD_TENSION
```

Audio/state cue가 marker와 연결.

---

# 40. Marker는 Story Commit과 다름

예:

STAMP_IMPACT에서 사운드와 ink effect 시작.

하지만 최종 chapter result commit은 animation VERIFY 후.

---

# 41. Light Animation

조명 tween도 같은 core를 사용.

가능:

• intensity
• color temperature에 해당하는 색
• emissive intensity

갑자기 0→1 변화가 의도된 스위치가 아니라면 보간.

---

# 42. Screen/CRT Animation

CRT flicker처럼 반복되는 ambient animation은 story sequence와 분리.

story sequence가 화면 콘텐츠를 takeover하면 ambient flicker가 text/영상 재생을 방해하지 않게 한다.

---

# 43. Ambient Animation

예:

• CRT flicker
• fan rotation
• indicator pulse
• 아주 작은 NPC idle

이들은 background layer.

story-critical owner가 target을 가져가면 일시 정지 가능.

---

# 44. Loop Animation

loop는 명시적인 lifecycle을 가진다.

```text
startLoop()
stopLoop()
disposeLoop()
```

페이지 전환 후 살아남지 않는다.

---

# 45. Loop 누적 방지

scene 재초기화 시 동일 loop 두 번 등록 금지.

예:

CRT flicker가 새로고침/복구 후 두 배 속도로 재생되는 문제 방지.

---

# 46. requestAnimationFrame 관리

전역 render loop는 하나.

각 subsystem이 별도 영구 RAF loop를 만들지 않는다.

Animation Core는 중앙 update loop에 등록.

---

# 47. Delta Time

animation은 실제 delta time 기반.

그러나 browser tab 복귀 후 큰 delta가 들어올 수 있다.

최대 delta clamp 사용.

예:

```text
maxFrameDelta ≈ 0.05~0.1s
```

정확한 값은 구현 테스트 후 조정.

---

# 48. Frame Hitch

한 frame이 300ms 걸렸다고 NPC가 벽을 지나 목적지를 크게 overshoot하지 않게 한다.

tween progress는 clamp.

collision-sensitive movement는 segment 검사.

---

# 49. Focus Loss

`visibilitychange`, `blur` 발생 시:

• input held state reset
• animation clock 정책 적용

ambient animation:
복귀 후 자연스럽게 현재 시간으로 이어갈 수 있음.

story-critical animation:
중간 위험 pose에서 멈추지 않도록 별도 정책.

---

# 50. Story Animation Focus Loss 정책

짧은 비가역 animation:

예:
문서 내려놓기.

복귀 시 최종 safe pose로 완료시킬 수 있음.

긴 cinematic:

예:
CH9 결과.

checkpoint 기반 재개 또는 해당 의미 단위의 시작부터 복구.

---

# 51. Exact Mid-Frame Resume 금지

새로고침/페이지 재진입 시:

```text
animationProgress = 0.4732
```

같은 값을 복원하지 않는다.

safe checkpoint 사용.

---

# 52. Safe Checkpoint

예:

```text
BEFORE_REJECT
AFTER_REJECT
REVISION_COMPLETE
BEFORE_APPROVAL
AFTER_APPROVAL
```

CH10:

```text
PHONE_BEFORE_CALL
PHONE_AFTER_THROW
PARCEL_PLACED
PHOTO_COMPLETE
MEDAL_COMPLETE
POSTCARD_READY
IDENTITY_REVEALED
```

---

# 53. Cancellation

모든 animation이 취소 가능할 필요는 없다.

구분:

```text
CANCELLABLE
NON_CANCELLABLE
CHECKPOINT_RECOVERABLE
```

---

# 54. Cancellable

일반 inspect focus 같은 작은 동작.

취소 시 원래 safe pose로 복귀.

---

# 55. Non-Cancellable

예:

• stamp impact 시작 후
• 전화 수화기 throw 시작 후
• CH10 postcard name reveal
• CH9 mission cinematic

사용자 입력으로 중단하지 않는다.

---

# 56. Checkpoint-Recoverable

길고 중요한 cinematic.

브라우저 문제 발생 시 의미 단위 checkpoint에서 재개.

---

# 57. Cancellation Token

장시간 sequence는 token 사용 가능.

```js
sequenceToken.cancelled
```

단, cancellation 후 cleanup을 반드시 수행.

---

# 58. AbortController

DOM/audio/network 등과 함께 제어해야 한다면 `AbortController` 사용 가능.

animation cancellation과 브라우저 fetch cancellation을 혼동하지 않는다.

---

# 59. Rollback

Rollback은 무조건 시작 transform으로 되돌린다는 의미가 아니다.

가장 가까운 논리적 safe state로 복구.

예:

문서 handoff 실패:
NPC 손 또는 desk incoming slot 중 하나로.

---

# 60. Rollback 우선순위

1. story continuity
2. collision-free
3. object ownership 일치
4. camera/player control 복구
5. 시각적 완벽함

---

# 61. Animation Failure

Promise reject를 무시하지 않는다.

story-critical sequence는 try/catch/finally.

예:

```js
try {
  ...
} catch (err) {
  await rollbackSequence(...);
} finally {
  releaseLocks(...);
}
```

---

# 62. Finally

lock 해제에 `finally`를 적극 활용.

예외가 발생해도 player가 영구 잠기지 않게 한다.

---

# 63. Lock Ownership

lock은 owner id와 함께 저장.

```text
PLAYER_INPUT → CH10_PHONE_THROW
CAMERA → CH10_PHONE_THROW
PHONE → CH10_PHONE_THROW
```

다른 sequence가 임의 해제 금지.

---

# 64. Lock Reference

필요하면 reference count보다 owner set을 사용.

한 시스템이 두 번 lock하고 한 번 unlock해서 풀리는 문제를 줄인다.

---

# 65. Deadlock 방지

두 sequence가 서로 자원을 기다리는 구조 금지.

권장 자원 획득 순서:

```text
PLAYER
→ CAMERA
→ NPC
→ OBJECT
→ SLOT/ANCHOR
```

프로젝트 전체에서 일관되게 유지.

---

# 66. Sequence 중첩

예:

DIALOGUE 안에서 document handoff.

완전히 별도 sequence가 서로 lock 싸움하지 않게 parent-child 관계 허용.

```text
CH01_PRESENTATION
└─ RICHARD_HANDOFF
```

child는 parent ownership 범위 안에서 실행.

---

# 67. Parent Sequence

parent가 취소되면 child도 cleanup.

child가 끝났다고 parent lock을 해제하지 않는다.

---

# 68. Parallel Resource Conflict

parallel 실행 전 두 step이 같은 target transform을 조작하는지 검사.

예:

`NPC_TURN`과 `GESTURE_LOOK_PLAYER`가 head/torso를 동시에 조작할 수 있음.

레이어 정의 필요.

---

# 69. Animation Layers

NPC 권장 layer:

```text
ROOT_MOVEMENT
POSTURE
TORSO
HEAD_GAZE
ARM_GESTURE
HAND_OBJECT
FACE
```

같은 layer의 두 owner 동시 실행 금지.

---

# 70. Camera Layer

camera는 대부분 단일 owner.

head bob은 FREE 상태 background layer.

FOCUS/CINEMATIC 진입 시 bob 제거 또는 강도 감소.

---

# 71. Object Layer

일반적으로 object transform owner 하나.

재질/opacity/texture animation은 transform과 병렬 가능.

예:

CRT screen content + monitor world transform.

---

# 72. Sequence Timing은 데이터보다 의미 우선

모든 연출을 exact timestamp 테이블로만 만들지 않는다.

권장:

```text
행동 완료
→ 0.3s pause
→ 대사
```

처럼 dependency 기반.

프레임 드롭이 있어도 순서 유지.

---

# 73. 절대 시간 기반 연출

음악/영상과 완벽 동기화가 필요한 경우에만 timeline timecode 사용.

CH9 전광판 영상 내부가 대표적.

---

# 74. Story Sequence와 Board Film 분리

CH9:

3D 시설 sequence:
Animation Core.

전광판 내부 archival film:
별도 timeline.

두 시스템은 cue marker로 연결.

---

# 75. Animation Duration 원칙

속도는 물체와 행동의 질량/목적에 맞춘다.

종이:
빠르고 가벼움.

도장:
올리는 동작보다 타격이 빠름.

문:
묵직한 속도.

상자:
느림.

엽서:
의도적으로 느림.

---

# 76. 사람 Animation Duration

NPC turn:
각도에 따라.

document offer:
약 0.5~1.0s 범위.

reaction pause:
인물/상황별.

모든 사람 animation에 동일 duration preset 금지.

---

# 77. Snap 허용 범위

아주 작은 오차 correction은 가능.

예:

• 2~5cm 위치
• 수 도의 rotation

플레이어가 눈치챌 큰 snap 금지.

---

# 78. Snap을 숨기는 방법

필요한 canonical reset은:

• fade
• door occlusion
• camera cut inside board film
• full blackout

같은 시각적 차폐 뒤에서 수행.

---

# 79. Collision-Aware Animation

벽/가구 가까이 움직이는 object는 시작/끝만 검사하지 않는다.

필요하면 path sample 검사.

특히:

• door
• parcel
• phone handset
• NPC handoff
• camera close-up

---

# 80. Swept Path Check

큰 object:

시작 AABB/OBB
→ 경로 중간
→ 끝

여러 sample 또는 swept volume 검사.

---

# 81. Door Animation

문은 hinge pivot 기준.

애니메이션 중:

• player
• NPC
• parcel

sweep 영역에 없는지 확인.

충돌하면 시작 자체를 지연하거나 제한.

---

# 82. Handset Throw

CH10 수화기는 실제 무작위 rigidbody physics만 믿지 않는다.

predetermined animation path를 기본.

세부 단계:

```text
cradle approach
→ hesitation
→ side acceleration
→ table edge impact
→ fall
→ cord tension
→ final settle
```

---

# 83. Handset Impact

impact marker에서:

• collision sound
• 작은 handset rotation change
• camera micro reaction

동기화.

---

# 84. Cord Animation

전화선은 완전한 cloth simulation 필수 아님.

가능:

• segmented curve
• spring-like controlled deformation

하지만 handset이 이동하는 동안 테이블을 직선으로 관통하지 않게 한다.

---

# 85. Parcel String

끈은 한 프레임 visibility false 금지.

가능:

• knot release
• slack 증가
• side displacement

복잡한 실제 rope simulation은 필요 없음.

---

# 86. Stamp

도장 sequence는 marker 중심.

```text
lift
→ align
→ short hold
→ downward acceleration
→ IMPACT
→ compression/settle
→ lift
```

impact 때:

• sound
• paper response
• ink appear

---

# 87. Stamp Ink

잉크가 도장보다 먼저 나타나면 안 된다.

impact marker 이후.

약간의 번짐/opacity settle 가능.

---

# 88. Document Reaction

stamp impact 시 종이가 아주 작게 눌리거나 흔들릴 수 있다.

종이가 책상에서 날아갈 정도 금지.

---

# 89. Document Handoff

NPC hand와 player hand가 같은 document를 잠깐 공유하는 구간 가능.

하지만 transform owner는 명확.

handoff marker에서 parent 변경.

---

# 90. Object Placement

물체가 table slot에 내려올 때:

• surface 접촉 직전 감속
• contact marker
• 작은 settle

바닥/책상 안으로 들어갔다 튀어나오는 animation 금지.

---

# 91. Photo / Medal Placement

CH10:

photo와 medal의 final slots가 다름.

둘의 placement sequence가 같은 경로/회전을 복제하지 않게 한다.

---

# 92. Postcard Reveal

엽서 flip은 카메라가 아니라 object 회전.

회전 완료 marker 이후 이름 reveal.

이름 reveal 중 추가 object motion 최소.

---

# 93. Name Reveal

```text
TO.
→ pause
→ J. ROBERT
→ pause
→ OPPENHEIMER
```

text opacity/clip reveal 정도만.

카메라 zoom/shake 금지.

---

# 94. NPC Revision Montage

각 인물의 work animation은 실제 task에 맞는 loop/shot.

몽타주 내부에서 8명의 같은 손동작 복제 금지.

---

# 95. CH8 Final Approval Sequence

sequence 예:

```text
player reaches stamp
→ hand grip
→ camera settle
→ NPCs quiet
→ stamp down
→ IMPACT
→ APPROVED ink
→ short silence
→ Hans reaction
→ surrounding reactions
→ progress animation
→ facility activation
```

다음 단계가 이전 단계 완료 전에 겹치지 않게 한다.

---

# 96. Facility Activation

CH8 progress 상승과 장비 활성은 병렬/단계적 조합 가능.

예:

```text
82 → 91
light bank A

91 → 97
CRT / relay activity

97 → 100
central system
```

과도한 놀이공원식 점등 금지.

---

# 97. CH9 Start Sequence

`VIEW RESULTS` interaction 후:

```text
lock
→ camera board framing
→ NPC board gaze
→ room light dim
→ board activate
→ first film
```

player가 board를 누른 즉시 full-screen 영상으로 튀지 않는다.

---

# 98. CH9 Mission Silence

release 후 4~5초 정적 등은 timeline의 핵심 beat.

frame hitch가 있어도 의미상 최소 silence를 유지.

---

# 99. CH9 White Flash

board film marker:

`FLASH`

3D scene:

• board emissive
• room light response
• optional exposure overlay

동기화.

---

# 100. CH9 SUCCESS?

순서:

```text
SUCCESS
→ hold
→ system degradation
→ SUCCESS_
→ cursor
→ SUCCESS?
```

불필요한 camera animation 없음.

---

# 101. CH9 Power Down

각 light/machine shutdown은 순서가 있어야 한다.

동시에 모든 light opacity 0 금지.

예:

```text
rear machines
→ side lamps
→ workstations
→ central board
→ black
```

---

# 102. CH10 Phone Sequence

전화 수화기 pickup:

```text
camera focus
→ hand approach
→ grip
→ handset release from cradle
→ cord response
→ handset to call pose
→ dialogue
```

---

# 103. CH10 Throw Sequence

대화 마지막 이후:

```text
dialogue gate lock
→ handset moves toward cradle
→ slows
→ stops
→ pause
→ sudden side motion
→ edge impact
→ fall
→ cord pull
→ settle
→ faint caller continues
→ player control eventually restored
```

---

# 104. CH10 Door Sequence

```text
hand reach
→ handle rotate
→ latch marker
→ door starts
→ outdoor light grows
→ door reaches safe open angle
→ hand release
```

문과 outdoor light 변화가 완전히 따로 놀지 않게 한다.

---

# 105. CH10 Parcel Sequence

```text
pickup
→ carry
→ table approach
→ placement
→ hands release
→ camera settle
```

placement 완료 전 parcel state를 PLACED로 commit하지 않는다.

---

# 106. CH10 Box Opening

```text
string
→ slack
→ move aside
→ lid hand contact
→ lid rotate
→ contents reveal
```

뚜껑이 열린 뒤에야 내부 interaction registry 활성.

---

# 107. Animation과 Interaction Registry

animation 시작:

target busy.

animation 완료:

필요한 다음 target만 활성.

예:

box OPENING 중 photo interaction 활성 금지.

OPEN commit 후 활성.

---

# 108. Animation과 Player State

state 변경은 sequence 단계로 명시.

예:

```text
FREE
→ FOCUS
→ INSPECT
```

함수 내부 숨은 side effect로 playerState를 바꾸지 않는다.

---

# 109. Animation과 NPC State

NPC movement/gesture 완료 후 core state commit.

예:

LEAVING sequence가 끝나기 전 OFFSCREEN으로 바꾸지 않는다.

---

# 110. Animation과 Camera Restore

모든 camera-owning sequence는 종료 경로를 가진다.

• 정상 완료
• 실패
• cancellation
• focus loss recovery

어느 경우에도 FOV/offset lock이 남지 않게 한다.

---

# 111. Animation과 Audio 실패

오디오 재생 실패가 story animation 전체를 실패시키지는 않는다.

audio는 보조.

반대로 animation 실패를 사운드만 재생하고 무시하지 않는다.

---

# 112. Animation과 Reduced Motion

접근성 옵션이 생길 경우:

줄일 수 있는 것:

• camera sway
• nonessential motion
• long decorative tween

줄이면 안 되는 것:

• object state를 이해하는 데 필요한 핵심 동작
• 문 열림
• 문서 전달
• 전화 투척의 사건 자체

필요하면 duration 축소.

---

# 113. 애니메이션 속도 배율

개발 debug에서:

```text
0.25x
0.5x
1x
2x
```

지원 가능.

collision/ownership 문제를 느린 속도로 확인.

배포 UI에는 노출하지 않음.

---

# 114. Step Debug

개발용으로 sequence step별 일시정지 기능이 유용.

예:

```text
STEP 04 / 11
NPC_DOCUMENT_RELEASE
```

복잡한 CH10에서 특히 유용.

---

# 115. Timeline Logging

debug log:

```text
16:32:10.220 CH10_PHONE_THROW START
16:32:10.521 CRADLE_APPROACH COMPLETE
16:32:11.004 HESITATION
16:32:11.632 PHONE_IMPACT
...
```

문제 재현에 사용.

---

# 116. Animation Inspector

개발 모드:

• active sequences
• owner
• locked resources
• current step
• elapsed
• target transforms
• reserved slots
• pending commit

표시 가능.

---

# 117. Orphan Lock 검사

매 frame이 아니라 state change 시:

owner가 존재하지 않는데 lock이 남아 있는지 검사.

예:

```text
CAMERA locked by CH05_X
but CH05_X inactive
```

warning + 개발 모드 복구.

---

# 118. Orphan Reservation

slot/anchor RESERVED인데 owner sequence 없음.

warning.

안전하면 release.

---

# 119. Concurrent Animation 검사

같은 transform layer에 owner 2개면 개발 error.

예:

```text
npc_george ROOT
owned by MOVE_EXIT
and REJECT_REACTION
```

이런 충돌을 조용히 마지막 write wins로 처리하지 않는다.

---

# 120. Sequence Dependency

장면별 sequence는 필요한 선행 state를 명시.

예:

```text
CH10_BOX_OPEN
requires:
PARCEL_PLACED
STRING_REMOVED
```

---

# 121. Sequence Idempotency

story-critical sequence가 실수로 두 번 호출되어도 두 번째는 실행하지 않는다.

예:

```text
if completed/active return
```

---

# 122. Commit Flag

중요 sequence:

```text
NOT_STARTED
ACTIVE
COMMITTED
```

정도로 추적 가능.

ACTIVE 상태가 저장 파일에 영구적으로 남지 않도록 checkpoint 정책 사용.

---

# 123. Animation Data와 Code

단순 tween 값은 데이터화 가능.

복잡한 story logic을 거대한 JSON timeline으로 만들지 않는다.

읽기 쉬운 async function과 작은 pose 데이터 조합을 우선.

---

# 124. 범용 엔진 과설계 금지

`UniversalCinematicGraphEngine` 같은 거대한 범용 시스템을 만들지 않는다.

필요한 공통 기능:

• tween
• wait
• parallel
• sequence
• ownership
• lock
• marker
• cleanup

정도만 안정적으로 제공.

챕터 고유 연출은 custom code 허용.

---

# 125. Performance

tween마다 새 RAF 생성 금지.

중앙 animator 사용.

많은 ambient tween이 있어도 object allocation 최소화.

CH8/CH9 기준으로 테스트.

---

# 126. GC Spike 방지

매 frame:

• 새 Vector3
• 새 Quaternion
• 새 array

대량 생성 최소화.

특히 모바일.

---

# 127. Animation Object Pool

particle/temporary UI 등 반복 생성 대상은 필요 시 pool 사용.

하지만 단순 문서 tween까지 과도하게 pool화하지 않는다.

---

# 128. Determinism

story sequence는 가능한 한 같은 시작 state에서 같은 결과를 만든다.

무작위 physics/랜덤 duration이 핵심 사건 결과를 바꾸지 않게 한다.

---

# 129. Random Variation

허용:

• ambient idle timing
• 작은 gaze delay

금지:

• phone throw final position 랜덤
• document stamp 위치 랜덤
• NPC final conversation position 랜덤
• box contents 위치 랜덤

---

# 130. Physical Plausibility

실제 physics simulation 여부보다 눈에 보이는 인과가 중요.

예:

전화선:
완벽한 rope physics보다
수화기 움직임에 맞춰 당겨지고 흔들리는 것이 중요.

---

# 131. Contact Events

물체가 표면에 닿는 장면에는 접촉 시점이 명확해야 한다.

• paper on desk
• stamp on paper
• handset on edge/floor
• parcel on table
• medal on table

접촉 전 소리가 나지 않는다.

---

# 132. Rest Pose

모든 movable object는 story step 사이에 안정된 rest pose를 가진다.

공중에 떠 있는 중간 상태로 player control을 반환하지 않는다.

---

# 133. Player Control 반환 조건

다음이 모두 만족된 뒤 반환.

• story-critical target rest pose
• camera safe pose
• required interaction registry updated
• temporary locks released
• player collider safe
• next action 가능

---

# 134. NPC Control 반환 조건

NPC task/idle 시스템으로 반환하기 전:

• root stationary
• final facing
• held object 안정
• gesture layer 정리
• anchor occupied

---

# 135. Camera Control 반환 조건

• tween 없음
• local offset 정상
• FOV 정상 또는 새 기본
• look cone 해제
• pending mouse/touch delta 제거

---

# 136. CHAPTER 전환

마지막 animation:

```text
complete story commit
→ save checkpoint
→ fade
→ TRANSITION
```

fade 시작 전에 다음 페이지를 먼저 로드해 현재 scene이 끊기는 문제 금지.

---

# 137. Fade

fade는 camera transform이 아니라 screen overlay.

완전 black이 된 뒤 canonical reset/page 이동 가능.

---

# 138. Fade 중 Animation

transition 목적이 아닌 world animation은 중지 또는 완료 처리.

black 뒤에서 불필요하게 NPC walking 계산을 계속하지 않는다.

---

# 139. Scene Dispose

페이지/scene 종료:

• active ambient loops stop
• animation registry clear
• event subscription cleanup
• temporary object dispose
• owner/lock registry clear

---

# 140. Error Fallback

story-critical animation을 완전히 실행하지 못해도 플레이어가 영구 진행 불가가 되지 않아야 한다.

예:

문서 handoff visual 실패.

가능하면:
document를 valid desk slot에 놓고 다음 checkpoint로.

단, 개발 환경에서는 error를 숨기지 않는다.

---

# 141. Visual Fallback과 Story Fallback 구분

Visual fallback:
동작 일부 생략.

Story fallback:
논리 상태를 안전한 완료 지점으로 이동.

둘을 명확히 구분.

---

# 142. QA 필수 테스트

각 중요한 sequence에서:

• 정상 1회
• 빠른 연타
• 다른 대상 클릭
• focus loss
• 저프레임
• 2배속 debug
• 0.25배속 debug
• sequence 두 번 호출
• target object missing
• anchor occupied
• camera pose invalid
• audio 실패
• page reload 직후

테스트.

---

# 143. 공간 QA

animation path가:

• 벽
• 문
• 책상
• NPC
• player
• 카메라

와 겹치지 않는지 실제 scene에서 확인.

---

# 144. CH8 Stress Test

동시에:

• 8 NPC
• gesture
• progress display
• lighting activation
• audio
• stamp

실행될 수 있음.

frame과 ownership 검사.

---

# 145. CH9 Stress Test

• board timeline
• NPC reaction
• scene light
• screen FX
• audio
• camera

동기화 검사.

---

# 146. CH10 Stress Test

연속 상태:

```text
radio
phone
throw
knock
door
parcel
box
photo
medal
postcard
archive
```

중간 임시 lock이 다음 장면에 남지 않는지 검사.

---

# 147. 금지사항

• story-critical animation에 무분별한 setTimeout 중첩
• 애니메이션 시작과 동시에 최종 state commit
• 하나의 `isAnimating` boolean으로 전체 관리
• 같은 transform을 여러 시스템이 동시에 수정
• animation마다 별도 RAF
• callback hell
• 중간 frame save
• focus loss 후 delta 폭주
• lock 해제 누락
• slot reservation 누락
• 무작위 physics에 핵심 결과 의존
• camera close-up 때문에 player collider 벽 관통
• object placement가 surface 내부에서 시작
• animation 중 일반 interaction queue
• 실패를 catch하지 않고 player 영구 lock
• 모든 장면을 거대한 범용 timeline 엔진으로 추상화

---

# 148. 후속 문서와의 연결

`11_OBJECT_ANIMATION.md`
• 물체별 실제 경로, grip, hinge, contact marker를 정의

`12_CINEMATIC_SEQUENCE.md`
• 긴 시네마틱의 sequence ownership, skip/recovery, cue를 정의

`14_STAMP.md`
• STAMP_IMPACT를 중심으로 상세 sequence 정의

`18_COLLISION_AND_CLEARANCE.md`
• swept path와 안전 거리의 최종 수치 제공

`21_AUDIO.md`
• marker와 효과음 동기화

`25_SAVE_AND_RESUME.md`
• safe checkpoint와 sequence commit 저장

`26_TIMING_AND_PACING.md`
• pause/hold/duration 최종 조정

`28_PERFORMANCE.md`
• animator update budget 및 다인원 stress 기준

<!-- MERGED SOURCE END: 10_ANIMATION_CORE.md -->


================================================================================
ORIGINAL SOURCE: 11_OBJECT_ANIMATION.md
================================================================================

# 11_OBJECT_ANIMATION.md

# OBJECT ANIMATION SPECIFICATION

이 문서는 게임 전체의 상호작용 오브젝트가 실제 공간에서 어떻게 움직이고, 무엇에 붙고, 무엇과 접촉하며, 어떤 상태로 놓이고, 어떤 상황에서 움직임을 중단하거나 복구해야 하는지를 정의한다.

대상:

• 연구 문서
• 계산 카드
• 클립보드 / 바인더
• 도장
• 버튼 / 스위치
• 노브
• 레버
• 문
• 전화기 본체
• 수화기
• 전화선
• 배달 상자
• 포장끈
• 상자 뚜껑
• 사진
• 메달 / 기념 토큰
• 엽서

이 문서는 모든 물체를 하나의 범용 물리 시스템으로 만들지 않는다.

각 물체는 실제 질량감, 사용 방식, 공간 제약, 서사적 중요도가 다르므로 공통 실행 원칙 위에 개별 animation profile을 가진다.

---

# 1. 기본 원칙

모든 중요한 오브젝트 애니메이션은 다음을 만족해야 한다.

```text
START POSE
→ APPROACH
→ CONTACT
→ ACTION
→ RELEASE
→ REST POSE
```

물체가 중간 공중 위치에서 멈춘 상태로 플레이어 제어가 돌아오면 안 된다.

---

# 2. 물체는 질량을 가진다

모든 물체를 같은 tween 속도로 움직이지 않는다.

질량감 기준:

```text
PAPER
가볍고 빠름

CARD
가볍지만 종이보다 단단함

STAMP
작지만 묵직함

LEVER
기계적 저항이 있음

DOOR
크고 무거움

HANDSET
중간 무게 + 전화선 제약

PARCEL
크고 무거움

PHOTO
가볍고 섬세함

MEDAL
작지만 금속 질량감

POSTCARD
가볍고 섬세함
```

---

# 3. Object State

움직이는 주요 물체는 최소한의 상태를 가진다.

예:

```text
IDLE
BUSY
MOVING
HELD
PLACED
OPENING
OPEN
CLOSING
CLOSED
DROPPED
```

물체별 필요 상태만 사용한다.

---

# 4. Transform Ownership

오브젝트 transform은 한 순간에 한 시스템만 소유한다.

가능 owner:

```text
WORLD
NPC_HAND
PLAYER_HAND
INSPECT_ANCHOR
PLACEMENT_SLOT
STORY_SEQUENCE
```

부모 전환 중 두 owner가 동시에 transform을 덮어쓰지 않는다.

---

# 5. Parent 변경

문서나 사진을 손에서 손으로 넘길 때 world transform을 유지한 채 parent를 변경한다.

흐름:

```text
현재 parent world transform 확보
→ 새 parent에 attach
→ local transform 계산
→ 짧은 settle
```

parent가 바뀌는 순간 object가 튀지 않는다.

---

# 6. Contact Marker

접촉이 중요한 물체는 marker를 가진다.

예:

```text
PAPER_CONTACT
STAMP_IMPACT
BUTTON_BOTTOM
LEVER_DETENT
DOOR_LATCH
HANDSET_GRIP
HANDSET_IMPACT
PARCEL_CONTACT
LID_OPEN_STOP
MEDAL_CONTACT
```

효과음과 상태 변화는 실제 contact marker에 맞춘다.

---

# 7. Rest Pose

모든 story-critical object는 안정된 rest pose를 가진다.

예:

문서:
desk slot.

도장:
stamp stand.

수화기:
cradle 또는 floor rest.

상자:
porch 또는 table.

사진:
box 또는 photo placement slot.

---

# 8. Safe Placement

물체를 놓기 전:

• surface 존재
• slot empty
• bounding volume 충돌 없음
• surface 밖으로 튀어나오지 않음
• 카메라/손 animation path 확보
• 다음 interaction에 필요한 clearance 확보

를 확인한다.

---

# 9. Invisible Placement Slot

정밀한 배치가 필요한 곳은 invisible slot 사용.

대표:

```text
DESK_INCOMING
DESK_COMPARE_LEFT
DESK_COMPARE_RIGHT
DESK_STAMP
DESK_APPROVED
HOME_PARCEL
HOME_PHOTO
HOME_MEDAL
```

---

# 10. Placement Slot은 한 점이 아니다

slot은 최소한 다음 정보를 가진다.

```text
position
rotation
footprint
height
occupancy
clearance
```

물체 중심점만 맞고 모서리가 다른 물체를 뚫는 문제를 막는다.

---

# 11. Surface Contact

물체는 표면에 닿을 때 살짝 감속한다.

금지:

• 책상 안에서 시작해 위로 튀어나옴
• 접촉 전에 소리
• 표면 2cm 위에서 떠 있음
• 바닥 아래로 반쯤 잠김

---

# 12. Z-Fighting

문서 위 잉크, 라벨, 사진, 메달 각인 등 얇은 레이어는 z-fighting 방지.

애니메이션으로 카메라를 지나치게 가까이 가져가 해결하지 않는다.

---

# 13. Collision-Aware Path

큰 물체 또는 긴 경로:

• door
• handset
• parcel
• lid

는 시작/끝뿐 아니라 이동 경로도 검사한다.

직선 tween이 벽이나 가구를 통과하면 waypoint path 사용.

---

# 14. Predictable Animation

핵심 스토리 오브젝트는 무작위 rigidbody physics에 결과를 맡기지 않는다.

필요하면 물리적으로 보이는 authored animation 사용.

특히:

• 전화 수화기 투척
• 포장끈
• 문서 handoff
• 메달 내려놓기

---

# 15. Player Hand와 Object

플레이어 손이 등장하는 경우:

• 실제 grip point 사용
• 손이 물체 중심을 관통하지 않음
• 물체가 손보다 먼저 움직이지 않음
• release 이후 손이 자연스럽게 빠짐

---

# 16. NPC Hand와 Object

NPC 손도 동일.

NPC가 들고 있는 문서:

• hand anchor
• grip offset
• object orientation

을 인물/물체별로 정의.

---

# 17. Grip Point

오브젝트별 grip point를 둘 수 있다.

예:

```text
grip_left
grip_right
grip_center
grip_handle
```

한 물체를 모든 상황에서 중심점으로 잡지 않는다.

---

# 18. Paper 기본 동작

종이는 가볍고 얇다.

허용:

• 작은 pitch/roll
• 짧은 settle
• 손에서 약간의 미세 움직임

금지:

• 큰 bounce
• 지나친 펄럭임
• cloth simulation으로 통제 불가능한 변형

---

# 19. Paper Lift

책상에서 문서를 집을 때:

```text
손 접근
→ 모서리/하단 grip
→ 앞쪽 edge가 약간 먼저 올라옴
→ 전체 문서 lift
→ inspect pose
```

책상에서 수직으로 순간 상승하지 않는다.

---

# 20. Paper Place

문서 놓기:

```text
surface 접근
→ 앞/한쪽 edge contact
→ 나머지 면 내려옴
→ PAPER_CONTACT
→ 작은 settle
```

실제 종이처럼 완벽한 변형은 필요 없지만 접촉 인과는 보이게 한다.

---

# 21. Paper Handoff

NPC → Player:

```text
NPC hold
→ NPC arm extend
→ player hand approach
→ shared hold 순간
→ HANDOFF marker
→ parent PLAYER_HAND
→ NPC release
→ inspect 또는 desk
```

---

# 22. Paper Reclaim

REJECTED 후 NPC가 문서를 회수.

기본:

```text
stamp 확인
→ hand approach
→ grip
→ 문서 lift
→ body 쪽으로 pull
→ player/desk ownership 해제
```

인물별 속도는 다르게.

---

# 23. Paper Stack

의도된 문서 stack은 각 문서에 작은 Y offset을 둔다.

모든 문서를 정확히 같은 plane에 겹치지 않는다.

문서가 10장인데 10cm 높이로 쌓이는 과장도 피한다.

---

# 24. Paper Rotation

책상 문서는 완벽한 수평 정렬만 반복하지 않는다.

소량의 authored rotation variation 가능.

하지만 puzzle 문서는 읽기 어려워질 정도로 기울이지 않는다.

---

# 25. Calculation Card

카드는 종이보다 작고 단단한 느낌.

집을 때 휘지 않음.

여러 장 비교:

• 각 카드의 slot 고정
• 서로 겹치지 않음
• 순서 변경 animation 명확

---

# 26. Card Spread

CH1 계산 카드 등:

```text
stack
→ one by one spread
```

가능.

한 번에 모든 카드가 같은 중심에서 폭발하듯 펼쳐지지 않는다.

---

# 27. Card Reorder

플레이어가 카드 관계를 비교할 때 필요한 경우:

• 카드 A 이동
• 카드 B 옆에 배치

이동 path가 다른 카드를 관통하지 않게 z 또는 옆 경로를 사용.

---

# 28. Binder

binder는 종이보다 무거움.

NPC가 들고 이동할 때 몸 가까이.

책상에 놓을 때 명확한 contact sound.

---

# 29. Binder Open

필요하면 hinge/cover 회전.

page animation을 수십 장 실제로 만들 필요 없음.

중요 페이지만 보여준다.

---

# 30. Stamp 기본 구성

도장:

```text
handle
body
rubber/base
```

pivot은 손 grip과 타격면을 구분.

도장이 손에서 거꾸로 잡히지 않게 한다.

---

# 31. Stamp Rest Pose

도장대 또는 desk 지정 위치.

REJECTED와 APPROVED를 별도 물체로 둘 경우 각각 고정 slot.

비활성 도장은 story state가 아니면 집을 수 없음.

---

# 32. Stamp Pickup

```text
손 접근
→ handle grip
→ 약간 들어올림
→ 손목 정렬
→ stamp pose
```

도장 전체가 camera를 가리지 않음.

---

# 33. Stamp Align

타격 전:

• stamp face가 문서와 평행에 가깝게
• 타격 영역 위
• 주변 오브젝트 없음

완벽한 자동 중심 정렬보다 약간 사람 손 같은 offset 허용.

---

# 34. Stamp Impact

```text
짧은 hold
→ 빠른 downward motion
→ STAMP_IMPACT
→ 아주 작은 compression
→ stop
```

impact 순간:

• sound
• paper response
• ink
• camera micro impulse

---

# 35. Stamp Lift

impact 후 0프레임으로 위로 사라지지 않는다.

짧게 눌린 상태 유지 후 들어 올림.

잉크가 보이는 순간을 플레이어가 볼 수 있어야 한다.

---

# 36. Stamp Return

sequence 끝에 도장을 원래 stand 또는 지정 rest slot로 돌려놓는다.

손에서 갑자기 사라지지 않는다.

---

# 37. Button

버튼 이동:

```text
rest
→ press
→ BUTTON_BOTTOM
→ 짧은 hold
→ release
```

물리 travel은 작아도 시각적으로 인식 가능.

---

# 38. Toggle Switch

상태:

```text
UP
MOVING
DOWN
```

짧고 단단하게 회전.

한 클릭에 왕복 금지.

---

# 39. Knob

노브를 사용하는 경우:

• 실제 회전축 중심
• stop angle 존재
• tooltip 숫자 맞추기 반복 퍼즐 금지

drag 기반이면 회전량과 finger movement가 자연스럽게 대응.

---

# 40. Lever

lever는 base pivot을 정확히 사용.

상태:

```text
A
MOVING
B
```

또는 필요한 detent만.

---

# 41. Lever Pull

```text
손 접근
→ grip
→ 작은 preload
→ 회전
→ LEVER_DETENT
→ hand release
```

레버가 손보다 먼저 움직이지 않는다.

---

# 42. Lever Resistance

기계적 느낌을 위해:

• 초반 약간 느림
• 중간 이동
• detent 직전 감속 또는 짧은 snap

가능.

cartoon bounce 금지.

---

# 43. Lever Collision

lever arc가 panel, 손, 다른 control을 관통하지 않게 한다.

장비 표면과 충분히 떨어진 pivot 사용.

---

# 44. Door 기본 구조

문:

```text
frame
panel
hinge pivot
handle
latch
```

door panel pivot은 실제 경첩 축.

panel 중심 pivot 금지.

---

# 45. Door State

```text
CLOSED
OPENING
OPEN
CLOSING
LOCKED
```

OPENING/CLOSING 중 추가 interaction 차단.

---

# 46. Door Handle

문손잡이는 door panel과 별도 pivot.

문 열기:

```text
hand reach
→ handle rotate
→ latch release
→ handle partially return
→ panel open
```

---

# 47. Door Latch

door panel이 움직이기 전에 latch marker.

문손잡이도 안 움직였는데 문이 먼저 열리는 문제 금지.

---

# 48. Door Open

door panel은 무게감 있게 회전.

권장:

• 초반 천천히
• 중간 자연스럽게
• 끝 감속

문을 180°까지 벽 속으로 돌리지 않는다.

---

# 49. Door Open Angle

각 문은 공간에 맞는 최대 open angle을 가짐.

예:

```text
90°~115°
```

실제 값은 clearance 문서/장면별 layout에서 확정.

---

# 50. Door Stop

최대각에서 작은 물리적 stop 느낌 가능.

bounce는 매우 약하게 또는 없음.

---

# 51. Door Collision Response

player/NPC/parcel이 sweep zone 안에 있으면:

• animation 시작 지연
• open angle 제한
• 작은 player normalization

중 하나.

문이 body를 통과해서 계속 회전하지 않는다.

---

# 52. CH10 Front Door

현관문은 핵심 장면.

sequence:

```text
hand approach
→ handle turn
→ latch
→ door begins opening
→ exterior light grows
→ parcel revealed
→ open rest pose
```

parcel을 문이 밀지 않게 porch placement를 sweep 밖에 둔다.

---

# 53. Telephone Base

전화기 본체는 기본적으로 고정.

수화기 animation 때문에 base가 움직이지 않는다.

수화기 throw 충격이 매우 크더라도 base 이동은 기본적으로 없음.

---

# 54. Handset State

```text
ON_CRADLE
ANSWERING
IN_HAND
LOWERING
THROWING
DROPPED
```

---

# 55. Handset Pickup

```text
player hand approach
→ grip
→ HANDSET_GRIP
→ cradle contact release
→ lift
→ cord slack response
→ call pose
```

수화기가 cradle에서 직선으로 위로 순간이동하지 않는다.

---

# 56. Handset Call Pose

화면 한쪽에 수화기 일부가 보임.

카메라 중앙/자막을 가리지 않음.

손과 수화기 mesh가 겹치지 않게 grip offset.

---

# 57. Handset Lowering

통화 끝에서 처음에는 정상적으로 내려놓으려는 동작.

```text
call pose
→ cradle direction
→ 속도 감소
→ almost place
→ stop
```

이 hesitation이 투척의 전제다.

---

# 58. Handset Throw

throw는 완전 물리 simulation이 아니라 authored path 우선.

```text
hesitation
→ sudden lateral acceleration
→ rotation
→ table edge path
→ impact
→ fall
→ cord tension
→ rest
```

---

# 59. Throw Direction

camera나 wall 방향에 따라 random하게 결정하지 않는다.

CH10 layout에서 안전한 고정 방향 사용.

목표:

• wall 관통 없음
• player collider 통과 없음
• table geometry와 충돌 위치 예측 가능
• cord path 관리 가능

---

# 60. Handset Edge Impact

수화기가 테이블 모서리 또는 지정 hard surface에 실제로 닿는 시점.

marker:

`HANDSET_IMPACT`

이때:

• impact sound
• angular velocity 변화
• camera 작은 반응

---

# 61. Handset Fall

impact 후 바닥 또는 낮은 safe rest point로 이동.

바닥 깊숙이 들어가지 않음.

낙하 후 1~2회 작은 settle rotation 가능.

---

# 62. Handset Final Rest

최종 pose는 story authored.

마이크/수화 부분이 완전히 바닥에 파묻히지 않게.

전화선이 자연스럽게 연결 가능.

---

# 63. Telephone Cord

전화선은 완전 cloth physics 필수 아님.

권장:

• curve / segmented rope
• 여러 control point
• handset position에 따라 업데이트

---

# 64. Cord Anchors

최소:

```text
BASE_ANCHOR
MID_CONTROL_1
MID_CONTROL_2
HANDSET_ANCHOR
```

필요하면 더 추가.

---

# 65. Cord Slack

수화기 pickup 시:

• 처음 slack
• 이동하며 일부 펴짐

throw 후:

• 빠르게 당겨짐
• 약간 흔들림

---

# 66. Cord Collision

전화선이:

• 테이블 중앙을 직선 관통
• 전화기 base 내부 통과
• 벽 통과

하지 않게 control point를 authored path로 유도.

완벽한 cable collision은 필수 아님.

---

# 67. Cord Tension

수화기 final rest가 cord 최대 길이보다 멀면 안 된다.

실제 줄 길이를 먼저 정하고 throw path를 그 안에서 설계.

---

# 68. Cord Swing

impact 이후 작은 감쇠 진동.

무한 spring loop 금지.

몇 초 안에 안정.

---

# 69. Parcel 기본 상태

```text
OUTSIDE
PICKING_UP
CARRIED
PLACING
PLACED
UNTYING
READY_TO_OPEN
OPENING
OPEN
```

---

# 70. Parcel 크기

player가 양손으로 들 수 있는 크기.

시야 중앙을 완전히 가리지 않음.

door passage 가능.

실제 크기는 CH10 layout에서 확정.

---

# 71. Parcel Pickup

```text
hands approach
→ 양쪽/하단 grip
→ parcel tilt 최소
→ lift
→ body/carry anchor
```

상자를 한 손으로 가볍게 집는 느낌 금지.

---

# 72. Parcel Carry Pose

상자 상단이 camera 하단에 보임.

label이 pickup 직후 자연스럽게 보일 수 있음.

하지만 내부는 보이지 않음.

---

# 73. Parcel Carry Motion

walking bob보다 더 안정적.

상자가 player camera와 독립적으로 크게 흔들리지 않음.

벽 가까이에서 clipping 검사.

---

# 74. Parcel Place

```text
table approach
→ hands lower
→ bottom surface contact
→ PARCEL_CONTACT
→ hands release
→ small settle
```

상자 바닥이 테이블에 닿기 전에 손이 사라지지 않는다.

---

# 75. Parcel Table Slot

상자 placement slot에는:

• lid opening rear clearance
• player front inspect space
• photo/medal side slots

까지 미리 확보.

---

# 76. Package Label

상자 바깥 라벨은 fixed surface에 붙어 있음.

animation 중 떼어지거나 floating decal처럼 보이지 않게 한다.

---

# 77. String 기본 구조

끈은 상자를 가로지르는 최소 2방향 strap 또는 단순 매듭 구조.

시각적으로 실제 포장끈처럼 보이되 복잡한 knot simulation은 불필요.

---

# 78. String State

```text
TIED
LOOSENING
LOOSE
REMOVED
```

---

# 79. Untie Sequence

```text
hand approaches knot
→ small pull
→ knot releases
→ tension disappears
→ string slack
→ one side pulled away
→ REMOVED / side rest
```

한 클릭에 visibility false 금지.

---

# 80. String Slack

끈이 풀린 순간 box 표면에 딱 붙어 있던 선이 느슨해져야 한다.

가능:

• curve control point Y 변화
• side displacement

---

# 81. String Rest

완전히 제거 후:

• 상자 옆 table
• box side

중 하나에 놓임.

공중에서 사라지지 않음.

성능상 mesh를 이후 숨겨야 한다면 camera 밖 settle 후 처리 가능.

---

# 82. Lid 기본 구조

box rear hinge.

pivot은 뚜껑 뒤쪽 edge.

뚜껑 중심 회전 금지.

---

# 83. Lid State

```text
CLOSED
OPENING
OPEN
```

닫기 interaction은 기본적으로 필요 없음.

---

# 84. Lid Open

```text
hand reaches front edge
→ small lift
→ hinge rotation
→ contents gradually visible
→ LID_OPEN_STOP
→ hand release
```

---

# 85. Lid Angle

권장:

```text
약 100°~110°
```

실제 layout에 따라 조정.

뒤 벽/램프/오브젝트와 충돌하지 않아야 한다.

---

# 86. Lid Clearance

상자 뒤에 최소 뚜껑 sweep volume을 예약.

상자를 벽에 붙여 놓고 뚜껑이 벽을 통과하는 문제 금지.

---

# 87. Box Contents Interaction Timing

lid가 거의 다 열렸다고 사진 interaction을 미리 켜지 않는다.

`OPEN` commit 후 활성.

---

# 88. Contents Stability

상자가 운반되는 동안 photo/medal/postcard가 내부에서 독립 physics로 튀지 않는다.

내부 content anchor에 고정.

---

# 89. Photo 기본 상태

```text
IN_BOX
PICKING_UP
INSPECT_FRONT
FLIPPING
INSPECT_BACK
PLACING
PLACED
```

---

# 90. Photo Pickup

사진 edge를 손이 잡음.

중앙 이미지를 가리지 않는다.

box 내부 다른 물체를 관통하지 않게 위로 조금 든 뒤 camera 쪽 이동.

---

# 91. Photo Inspect

카메라 고정.

사진이 inspect anchor에 안정.

작은 paper sway만 허용.

---

# 92. Photo Flip

사진 자체가 vertical axis 또는 자연스러운 hand flip 축으로 180° 회전.

rotation 중 손 grip 유지.

---

# 93. Photo Back

`HIROSHIMA / AUGUST 1945`가 읽히는 안정된 pose.

glare/손가락 가림 없음.

---

# 94. Photo Placement

조사 후 HOME_PHOTO slot로.

상자 안으로 다시 넣지 않는다.

후속 엽서 reveal의 물리적 인과를 만든다.

---

# 95. Medal 기본 상태

```text
IN_BOX
PICKING_UP
INSPECT_FRONT
ROTATING
INSPECT_BACK
PLACING
PLACED
```

---

# 96. Medal Pickup

작고 무거운 금속.

손가락/손 가장자리 grip.

사진보다 느린 lift.

---

# 97. Medal Rotation

카메라가 아니라 메달 자체를 천천히 회전.

금속 반사 때문에 특정 각도에서 글자가 완전히 날아가지 않도록 lighting과 연동.

---

# 98. Medal Back

`FOR DISTINGUISHED SERVICE` 등 지정 문구가 읽히는 pose에서 잠깐 정지.

---

# 99. Medal Placement

HOME_MEDAL slot에 놓을 때 작은 금속 contact sound.

사진과 겹치지 않음.

---

# 100. Medal Bounce

금속이라도 테이블에서 튀는 rigidbody bounce는 기본적으로 넣지 않는다.

아주 작은 settle만.

---

# 101. Postcard 기본 상태

```text
HIDDEN
REVEALED
PICKING_UP
FRONT
FLIPPING
BACK_REVEAL
UNFOLDING
ARCHIVE_TRANSITION
```

---

# 102. Postcard Physical Hide

처음에는 photo/medal 아래에 실제로 가려짐.

카메라 각도에서 이름 영역이 미리 보이지 않게 한다.

---

# 103. Postcard Reveal

photo와 medal이 모두 제거되면:

• 카드가 자동 튀어나오지 않음
• 그 자리에 조용히 남음

플레이어가 발견.

---

# 104. Postcard Pickup

```text
hand approaches clean edge
→ grip
→ lift above box
→ move to inspect anchor
→ background dim
```

이름 영역을 손이 가리지 않는다.

---

# 105. Postcard Front

처음 보이는 면에는 정체를 노출하지 않음.

필요한 무해한 디자인/표면.

---

# 106. Postcard Flip

느리게.

```text
FRONT
→ side profile visible
→ BACK
```

회전 중 text reveal 금지.

---

# 107. Postcard Name Reveal

flip 완료 후:

```text
TO.
→ J. ROBERT
→ OPPENHEIMER
```

텍스트 자체가 순차 등장.

카드는 거의 움직이지 않음.

---

# 108. Postcard Unfold

정체 공개 후 다음 입력에서:

• postcard를 펼치거나
• 내부 카드 구조가 있다면 unfold

가능.

그 뒤 Oppenheimer profile로 전환.

---

# 109. Postcard Transition

profile 전환 시:

• 카드가 천천히 아래/뒤로 물러남
또는
• 배경 black이 카드 주변을 덮음

갑자기 visibility false 금지.

---

# 110. CRT Control

CRT 자체 화면 animation은 별도 screen system.

물리 control:

• switch
• knob
• button

만 이 문서 적용.

화면 콘텐츠가 control보다 먼저 반응하지 않게 marker 동기화.

---

# 111. Indicator Light

button/lever action 후 indicator light가 켜질 수 있음.

가능하면:

```text
mechanical action
→ electrical delay 0.05~0.2s
→ light
```

정도 작은 인과를 준다.

---

# 112. Mechanical Delay

1940년대 장비 느낌을 위해 모든 장치가 스마트폰처럼 즉시 반응할 필요 없음.

릴레이 click
→ indicator
→ CRT response

같은 짧은 단계 가능.

---

# 113. Object Animation Profile

오브젝트별 profile 데이터 가능.

```js
{
  massClass: "LIGHT",
  defaultEase: "easeOutCubic",
  contactSound: "paper_contact",
  collisionProfile: "THIN_OBJECT"
}
```

하지만 모든 장면을 데이터만으로 처리하지 않는다.

---

# 114. Animation Path Data

복잡한 물체는 named pose 사용.

예:

```text
PHONE_CALL_POSE
PHONE_HESITATION_POSE
PHONE_EDGE_IMPACT
PHONE_FLOOR_REST
```

raw 좌표를 sequence 코드 곳곳에 흩어놓지 않는다.

---

# 115. Object Pose Validation

named pose는 실제 scene geometry를 기준으로 검증.

방 구조가 바뀌면 pose도 다시 검증.

---

# 116. Scene-Specific Override

공통 profile이 있어도 챕터별 공간에 따라 override 가능.

예:

CH5 큰 report binder.

CH8 final report.

같은 DOCUMENT type이어도 크기와 동작 다름.

---

# 117. Object-to-Object Clearance

책상:

• cup
• pencil
• documents
• stamp

서로 움직임 경로를 침범하지 않음.

특히 stamp path 아래 소품 금지.

---

# 118. Hidden Collision Volume

애니메이션 경로 검증용 invisible volume 사용 가능.

예:

```text
DOOR_SWEEP
LID_SWEEP
STAMP_SWEEP
HANDSET_THROW_CORRIDOR
```

---

# 119. Sweep Reservation

animation 시작 전 sweep zone 예약.

다른 NPC/object가 sequence 중 진입하지 않게 한다.

---

# 120. Player Collision

player가 물체 animation path 안에 있으면:

• interaction 시작 불가
• 작은 pose normalization
• 또는 player lock 전에 안전 위치 확보

물체가 player 몸을 통과하는 연출 금지.

---

# 121. NPC Collision

NPC도 마찬가지.

문/상자 뚜껑/전화 수화기 경로에 NPC가 있으면 sequence 시작 전 blocking 조정.

---

# 122. Camera Collision

카메라가 안전하더라도 움직이는 물체가 camera를 통과할 수 있다.

inspect/phone/stamp pose에서 object sweep와 camera near volume 검사.

---

# 123. Low Frame Rate

프레임 드롭 때 object가 contact point를 건너뛰지 않게 marker를 normalized progress 기반으로 처리.

예:

0.45 → 0.62로 넘어가도 0.5 impact marker를 한 번 실행.

---

# 124. Marker One-Shot

marker는 한 animation 실행당 한 번만.

frame oscillation/seek 때문에 중복 sound/commit 금지.

---

# 125. Focus Loss

짧은 object animation 중 탭이 background로 가면:

복귀 시 safe rest 또는 완료 pose.

중간 공중 상태에서 player control 반환 금지.

---

# 126. Reload

중간 animation pose 저장 금지.

safe checkpoint에서 canonical rest state로 재구성.

---

# 127. Object State Reconstruction

예:

PHOTO_COMPLETE checkpoint:

• photo HOME_PHOTO slot
• medal 상태 이전 값
• postcard 물리 노출 여부 논리적으로 재구성

---

# 128. Missing Object

story-critical object가 없으면 sequence 시작하지 않는다.

개발 환경에서는 즉시 error.

배포 fallback이 있다면 known safe object 생성.

---

# 129. Duplicate Object

같은 story object가 두 개 생성되지 않게 id uniqueness 검사.

예:

전화 수화기 두 개,
Richard binder 두 개,
postcard 두 개

금지.

---

# 130. Disposal

chapter 전환 시 temporary object/animation helper cleanup.

하지만 현재 scene에서 필요한 story object를 animation 끝났다고 dispose하지 않는다.

---

# 131. Audio Contact Mapping

대표:

```text
PAPER_CONTACT → soft paper
BINDER_CONTACT → paper + dull thump
STAMP_IMPACT → heavy stamp
BUTTON_BOTTOM → click
LEVER_DETENT → mechanical clack
DOOR_LATCH → latch
HANDSET_IMPACT → bakelite impact
PARCEL_CONTACT → cardboard thud
MEDAL_CONTACT → small metal
```

세부 사운드는 `21_AUDIO.md`.

---

# 132. Lighting Interaction

메달/CRT/전광판처럼 조명 영향이 큰 물체는 animation pose와 light angle을 함께 검토.

하지만 물체를 잘 보이게 하려고 갑자기 별도 spotlight가 따라다니는 연출은 피한다.

---

# 133. Shadow

움직이는 hand/object shadow가 이상하게 크게 보이면 shadow casting을 제한할 수 있다.

특히 camera 가까운 player hands.

---

# 134. Mobile

작은 화면에서도 물체 동작이 읽혀야 한다.

문서 flip:
충분한 화면 점유.

medal:
너무 작지 않게.

postcard:
이름 가독성 최우선.

---

# 135. Mobile Drag

knob/rotate 같은 drag interaction을 쓸 경우:

• camera look gesture와 충돌하지 않음
• object interaction zone에서만 drag capture
• pointercancel 처리

---

# 136. Reduced Motion

접근성 옵션이 있다면:

• decorative sway 감소
• settle animation 단축

가능.

하지만 물체 상태 변화를 이해하는 핵심 motion은 유지.

---

# 137. Performance

복잡한 rope/cloth/rigidbody simulation을 story-critical object에 남발하지 않는다.

안정적인 authored animation이 우선.

---

# 138. QA: 문서

검사:

• 손이 텍스트 가리지 않음
• 책상 관통 없음
• 다른 문서 겹침 없음
• handoff 순간 튐 없음
• 놓은 뒤 떠 있지 않음
• 비교 slot 충돌 없음

---

# 139. QA: 도장

검사:

• handle grip 정상
• face 방향 정상
• stamp path clear
• impact marker 1회
• 잉크 impact 후 등장
• paper reaction 과하지 않음
• 도장 복귀 정상

---

# 140. QA: 문

검사:

• hinge 위치
• handle/latch 순서
• player/NPC sweep 없음
• 문 panel 벽 관통 없음
• max angle 정상
• parcel과 충돌 없음

---

# 141. QA: 전화

검사:

• cradle에서 자연스럽게 분리
• grip 정상
• cord slack
• throw path
• table edge impact
• floor rest
• cord 최대 길이
• 벽/테이블 관통 없음
• caller spatial audio 위치 일치

---

# 142. QA: 상자

검사:

• porch placement
• door sweep 밖
• carry 시 문틀 통과
• table slot
• lid rear clearance
• string 실제로 풀림
• 내용물 조기 노출 없음

---

# 143. QA: 사진/메달

검사:

• 어느 순서든 가능
• inspect 후 실제 상자에서 제거
• placement slot 분리
• 손 가림 없음
• 메달 반사 가독성
• contact sound 시점

---

# 144. QA: 엽서

검사:

• photo/medal 전 이름 미노출
• 논리 gate + physical occlusion
• pickup grip이 이름 영역 안 가림
• flip 완료 전 text 없음
• 이름 reveal 중 motion 최소
• 연타로 건너뛰기 없음

---

# 145. QA: Frame Hitch

각 contact marker를 저프레임에서 테스트.

중복/누락 없음.

---

# 146. QA: Collision

모든 움직임을 느린 debug 속도로 확인.

• 0.25x
• 0.5x

에서 손/벽/가구 관통 확인.

---

# 147. QA: State

animation 종료 후:

• object state
• owner
• parent
• placement slot
• busy flag
• interaction state

가 실제 모습과 일치하는지 검사.

---

# 148. QA: Failure Recovery

일부러:

• slot occupied
• object missing
• camera invalid
• focus loss
• sequence 중 reload

상황을 테스트.

영구 soft-lock 금지.

---

# 149. 금지사항

• 모든 물체 동일 tween
• 물체 순간이동
• 손보다 먼저 물체 이동
• 접촉 전 sound
• table/wall 관통
• final rest pose 없이 player control 반환
• story-critical random physics
• door center pivot
• string visibility false로 제거
• handset wall 관통
• cord 무한 진동
• parcel 한 손 pickup
• lid wall 관통
• photo/medal 조사 후 box 안에 그대로 남음
• postcard 자동 pop-up
• postcard flip 전에 이름 표시
• marker 중복 실행
• animation 실패 후 busy 영구 유지

---

# 150. 후속 문서와의 연결

`12_CINEMATIC_SEQUENCE.md`
• object animation을 긴 장면 sequence와 동기화

`13_DOCUMENT.md`
• 문서 크기, texture, layout, archive 상태와 paper animation 연결

`14_STAMP.md`
• REJECTED / APPROVED 도장 세부 물리와 타이밍 확정

`15_OBJECTS.md`
• 각 공통 오브젝트의 실제 치수/재질/interaction 여부 확정

`17_SPATIAL_LAYOUT.md`
• door, parcel, desk, phone, box의 실제 이동 여유 확보

`18_COLLISION_AND_CLEARANCE.md`
• sweep volume, 접촉 epsilon, carry clearance 최종 수치 확정

`21_AUDIO.md`
• contact marker와 효과음 매핑

`26_TIMING_AND_PACING.md`
• object별 최종 duration과 pause 조정

각 챕터 `ANIMATION.md`
• 해당 장면에서 이 공통 규칙을 실제 sequence로 구체화

<!-- MERGED SOURCE END: 11_OBJECT_ANIMATION.md -->


================================================================================
ORIGINAL SOURCE: 12_CINEMATIC_SEQUENCE.md
================================================================================

# 12_CINEMATIC_SEQUENCE.md

# CINEMATIC SEQUENCE SPECIFICATION

이 문서는 게임 전체의 시네마틱 연출이 언제 시작되고, 무엇을 잠그며, 어떤 시스템을 동시에 제어하고, 어떻게 종료·복구되는지를 정의한다.

대상:

• 챕터 도입 연출
• NPC 등장
• 문서 제출
• REJECTED / APPROVED 전후 연출
• 수정 몽타주
• 시설 활성화
• CH8 최종 승인
• CH9 결과 영상
• CH9 SUCCESS?
• CH9 power-down
• CH10 전화 수화기 투척
• 현관문 개방
• 상자 개봉
• 엽서 정체 reveal
• Oppenheimer profile
• Final Archive
• chapter transition

이 문서는 개별 물체의 움직임 자체를 정의하지 않는다.

• 공통 animation 실행 → `10_ANIMATION_CORE.md`
• 물체 animation → `11_OBJECT_ANIMATION.md`
• 카메라 → `03_CAMERA.md`
• 대화 → `05_DIALOGUE.md`
• NPC → `06_NPC_CORE.md` ~ `09_NPC_BLOCKING.md`

---

# 1. 시네마틱의 기본 철학

시네마틱은 플레이어를 게임 밖으로 밀어내는 영화가 아니다.

핵심은:

```text
내가 그 자리에 있었다.
내가 이 장면을 직접 목격했다.
내 행동의 결과가 지금 일어나고 있다.
```

라는 감각을 유지하는 것이다.

따라서 기본적으로 1인칭 시점을 유지한다.

---

# 2. 시네마틱 사용 조건

시네마틱은 다음 경우에만 사용한다.

• 플레이어 입력이 장면을 깨뜨릴 수 있을 때
• 중요한 행동의 물리적 결과를 보여줘야 할 때
• 여러 NPC/오브젝트/조명/오디오를 정확히 동기화해야 할 때
• 감정적으로 정지와 호흡이 필요한 순간
• chapter transition 전후
• 스토리 정보를 순서대로 통제해야 할 때

일반 상호작용까지 모두 시네마틱으로 만들지 않는다.

---

# 3. Cinematic State

기본 진입:

```text
FREE / DIALOGUE / INSPECT
→ CINEMATIC
```

CINEMATIC 중:

• 이동 차단
• 일반 interaction 차단
• camera owner는 cinematic
• story-critical NPC owner는 cinematic
• 필요한 object owner는 cinematic
• dialogue는 지정 방식만
• UI는 장면별 최소화

---

# 4. 시네마틱 진입 전 Validation

시작 전 확인:

• player safe 위치
• camera safe pose
• 필수 NPC 존재
• 필수 object 존재
• 필요한 anchor 비어 있음
• door / object path clearance
• 현재 chapter state 적합
• 동일 cinematic 이미 실행 중 아님
• interaction lock 충돌 없음

하나라도 실패하면 장면을 억지로 시작하지 않는다.

---

# 5. 시네마틱 Lock

가능한 lock:

```text
PLAYER_MOVEMENT
PLAYER_LOOK
WORLD_INTERACTION
NPC_AUTONOMY
CAMERA
DIALOGUE_ADVANCE
CHAPTER_TRANSITION
```

장면별 필요한 것만 잠근다.

---

# 6. 완전 잠금과 부분 잠금

두 종류를 구분한다.

## FULL CINEMATIC

• 이동 금지
• 시점 금지
• 일반 입력 금지

예:

CH9 결과 영상
CH10 엽서 reveal

## SOFT CINEMATIC

• 이동 금지
• 제한적 시점 허용
• 지정 입력만 가능

예:

NPC가 문서를 내미는 순간
전화 대화 일부
CH8 회의 일부

---

# 7. Player Look 허용 여부

시네마틱이라고 항상 camera를 완전 고정하지 않는다.

장면별:

```text
LOCKED
LIMITED
FREE_LOOK_IN_PLACE
```

중 하나.

---

# 8. Camera Ownership

CINEMATIC 동안 camera는 하나의 owner만 가진다.

일반 mouse look, head bob, focus system이 동시에 camera를 조작하지 않는다.

---

# 9. Camera Takeover

진입 순서:

```text
pending look delta 제거
→ 현재 yaw/pitch 저장
→ head bob 감소/정지
→ camera owner 변경
→ cinematic pose로 보간
```

갑자기 snap하지 않는다.

---

# 10. Camera Release

종료:

```text
final safe pose
→ camera offset 복원
→ FOV 복원
→ look cone 해제
→ pending input 제거
→ player control 반환
```

원래 시점으로 반드시 되돌리는 것이 아니라 자연스러운 release orientation 사용.

---

# 11. 3인칭 금지

기본 게임 시네마틱에서:

• 플레이어 몸 전체
• 플레이어 얼굴
• 외부 관찰자 시점

을 보여주지 않는다.

특히 정체 reveal 전에는 절대 금지.

---

# 12. 예외: 전광판 내부 영상

CH9의 archival mission footage는 실제 세계 카메라가 아니라 전광판 콘텐츠다.

따라서:

• 항공기
• 구름
• 지도
• 투하
• 섬광
• mushroom cloud

등 자유로운 영상 framing 가능.

플레이어의 3D camera는 여전히 시설 안 전광판을 보고 있음.

---

# 13. Cinematic Sequence 구조

권장:

```text
VALIDATE
→ LOCK
→ PREPARE
→ SETUP
→ PLAY BEATS
→ HOLD
→ COMMIT
→ RELEASE / TRANSITION
```

---

# 14. Beat 단위

긴 시네마틱은 beat로 나눈다.

예:

```text
BEAT_01
BEAT_02
BEAT_03
...
```

각 beat는 의미 있는 사건 하나.

---

# 15. Beat의 역할

예:

CH10 전화 투척:

```text
BEAT 1  수화기를 내려놓으려 함
BEAT 2  멈춤
BEAT 3  옆으로 던짐
BEAT 4  테이블 충돌
BEAT 5  바닥 낙하
BEAT 6  전화선 당김
BEAT 7  바닥에서 목소리
```

한 거대한 tween으로 만들지 않는다.

---

# 16. Beat Dependency

beat는 이전 beat 완료 후 진행.

필요한 경우 일부만 병렬.

예:

```text
door opening
+
outdoor light 증가
```

---

# 17. Beat 간 Pause

감정적 시네마틱은 action 사이 정지 시간이 중요하다.

무조건 빠르게 연속 실행하지 않는다.

---

# 18. Silent Beat

대사 없는 beat를 적극 사용.

예:

• Hans가 report를 닫음
• George가 도장을 바라봄
• CH9 첫 섬광 전 정적
• Oppenheimer 이름 reveal 후 정지

---

# 19. Dialogue in Cinematic

대사가 필요한 경우:

• `05_DIALOGUE.md` 한 문장 규칙 유지
• 일반 world interaction은 차단
• 필요한 line만 수동 진행
• 중요 pause는 강제 gate

---

# 20. Auto Dialogue

시네마틱 중 자동 대사는 제한.

적합:

• 멀리서 들리는 음성
• 바닥 수화기
• 라디오
• archival recording

핵심 감정 line은 manual 또는 명시적 timing.

---

# 21. NPC Autonomy

CINEMATIC 시작 시 관련 NPC의:

• idle
• random gaze
• task loop
• ambient dialogue

를 중지.

story sequence가 직접 제어.

---

# 22. NPC Ownership

중요 NPC마다 cinematic owner 지정.

예:

```text
CH09_RESULTS
owns:
Richard
Enrico
Luis
John
George
Emilio
Kenneth
Hans
```

일반 NPC가 같은 animation layer를 덮어쓰지 않는다.

---

# 23. NPC Reaction는 개별

그룹 시네마틱에서 모두 같은 animation cue 금지.

각 NPC는 자신의 reaction profile을 사용.

---

# 24. Object Ownership

시네마틱 중 움직이는 object도 owner를 명확히 한다.

예:

```text
CH10_PHONE_THROW
owns:
handset
cord
camera
playerHand
```

---

# 25. Lighting Ownership

시네마틱이 조명을 제어할 수 있다.

하지만 전체 scene lighting system을 영구 덮어쓰지 않는다.

종료 후:

• 원래 state
또는
• 새 story state

로 commit.

---

# 26. Audio Ownership

시네마틱 시작 시:

• ambient volume 조정
• 중요 audio 우선
• 필요하면 특정 loop ducking

가능.

장면 끝난 뒤 mix 복원.

---

# 27. UI Ownership

시네마틱에서 필요 없는 HUD는 숨길 수 있다.

하지만 gameplay HUD를 fade out한 뒤 복원 여부를 명확히 한다.

CH9/CH10 후반은 HUD 자체가 없는 상태 유지 가능.

---

# 28. Cinematic HUD 최소화

시네마틱 중 화면에 다음이 동시에 쌓이지 않게 한다.

• objective
• interaction hint
• subtitles
• progress
• chapter label
• system message

필요한 것만.

---

# 29. Skip 정책

모든 시네마틱에 skip을 기본 제공하지 않는다.

장면 유형에 따라 구분.

---

# 30. NON-SKIPPABLE

스토리 핵심:

• CH9 첫/두 번째 mission reveal
• CH9 SUCCESS?
• CH10 수화기 투척
• 엽서 identity reveal
• 최초 Oppenheimer profile

기본적으로 skip 불가.

---

# 31. LIMITED SKIP

반복 가능성이 높은 수정 몽타주 등은 추후 접근성/재플레이 편의를 위해 skip 가능성을 고려할 수 있다.

단:

• 첫 플레이에서는 기본 노출
• skip해도 final state 정확히 commit

---

# 32. Skip 입력

skip을 제공한다면 길게 hold하지 않는다.

별도 명확한 버튼 또는 지정 key.

일반 click과 충돌하지 않게 한다.

---

# 33. Skip 결과

skip은 animation을 “중단”하는 것이 아니다.

해당 cinematic의 final safe state로 정상적으로 commit한다.

---

# 34. Skip State Reconstruction

예:

수정 몽타주 skip:

• NPC canonical work 결과
• corrected document
• next dialogue state
• camera
• lighting
• interaction

모두 정상화.

---

# 35. 반복 시네마틱

REJECTED/APPROVED가 여러 챕터에 반복되지만 같은 camera/timing/gesture를 복제하지 않는다.

공통 문법만 유지.

---

# 36. CH1~8 REJECTED 구조

공통 skeleton:

```text
오류 증명
→ researcher reaction
→ stamp 준비
→ REJECTED
→ impact
→ 짧은 silence
→ researcher 반응
→ document 회수
→ researcher 퇴장/작업 이동
```

챕터별 차이 필수.

---

# 37. CH1 REJECTED

Richard:

• 빠르게 오류 인정
• 도장 후 짧은 reaction
• 문서 회수
• 즉시 계산실로

리듬 빠름.

---

# 38. CH2 REJECTED

Enrico:

• 오류를 이미 이해한 상태
• 도장보다 논리 정리가 중심
• 반응 절제

---

# 39. CH3 REJECTED

Luis:

• calibration 문제 인식
• 기계/기록지 쪽 시선
• 짧고 실무적

---

# 40. CH4 REJECTED

John:

• 매우 절제
• “옳은 결정입니다.”
• 큰 reaction 없음

---

# 41. CH5 REJECTED

가장 긴장감이 큼.

```text
George 대사
→ player stamp reach
→ George eye contact
→ “진심입니까?”
→ short pause
→ stamp
→ silence
→ George document reclaim
→ 빠른 turn
```

다른 챕터보다 반려 행동 전후 pause가 길다.

---

# 42. CH6 REJECTED

Emilio:

• 반려가 안도처럼 느껴짐
• 긴장 완화
• 조용한 장면

---

# 43. CH7 REJECTED

Kenneth:

• 사고 기록의 무게
• 도장 뒤 긴 침묵
• 강한 감정 표현 없이 수용

---

# 44. CH8 REJECTED

가장 무거운 반려.

```text
마지막 오류 확인
→ Hans report close
→ silent beat
→ 전체 room silence
→ stamp
→ impact
→ 주변 작은 반응
→ Hans: “전체를 다시 정리하겠습니다.”
```

---

# 45. APPROVED 구조

공통:

```text
수정본 검증
→ 승인 준비
→ stamp
→ impact
→ result state commit
→ researcher reaction
→ facility state change
```

---

# 46. APPROVED 반복감 방지

CH1~7마다:

• camera angle
• researcher 위치
• stamp 이전 pause
• reaction
• facility activation

을 다르게.

---

# 47. Revision Montage

수정 작업 전체를 실시간으로 기다리게 하지 않는다.

몽타주는 시간 경과와 실제 작업을 보여주는 압축 연출.

---

# 48. Revision Montage 기본 구조

```text
fade / camera transition
→ work shot A
→ shot B
→ optional shot C
→ time passage cue
→ canonical resubmission state
```

---

# 49. Montage Shot 길이

권장:

```text
약 0.8~2.0초
```

인물/작업에 따라.

너무 빠른 뮤직비디오식 컷 금지.

---

# 50. Montage Camera

1인칭 현실감을 완전히 유지해야 하는 장면과,
시간 압축을 위해 관찰형 짧은 shot이 필요한 장면을 구분.

기본적으로 플레이어가 실제로 보는 위치를 우선.

필요하면 fade 뒤 동일 공간의 다른 시점 사용 가능.

플레이어 신체는 노출하지 않는다.

---

# 51. Montage Canonical Reset

몽타주 shot 사이 exact world continuity는 요구하지 않는다.

fade/cut를 사용해 canonical work pose로 전환 가능.

---

# 52. CH8 Revision Montage

8명의 작업을 모두 보여주되 너무 길지 않게.

예:

```text
Richard calculator
Enrico chalkboard
Luis CRT
John timing sheet
George material retest
Emilio counter
Kenneth report
Hans compilation
```

각 shot 0.7~1.4초 정도로 조정 가능.

---

# 53. CH8 Final Approval

핵심 sequence:

```text
corrected report 확인
→ Hans “이번에는 원본과 같습니다.”
→ player stamp
→ APPROVED impact
→ silence
→ NPC reactions
→ progress 82→91
→ facility response
→ progress 91→97
→ facility response
→ progress 97→100
→ full facility alive
→ short celebration
```

---

# 54. CH8 성공의 톤

시네마틱은 진짜 성공처럼 연출.

금지:

• 불길한 음악
• 조명 glitch
• 갑작스러운 불안한 카메라
• 의미심장한 shadow
• NPC 공포 표정

CH9 전까지 균열을 넣지 않는다.

---

# 55. CH8 celebration

짧고 현실적.

• 악수
• 미소
• 자세 이완
• 짧은 대사

플레이어를 중심으로 원형 포위 금지.

---

# 56. CH9 Intro

CH8 성공의 연속.

처음엔 FREE 또는 SOFT CINEMATIC.

NPC casual lines 가능.

Hans:

`“결과 보고가 도착했습니다.”`

그 후 board interaction 활성.

---

# 57. VIEW RESULTS Transition

player가 직접 board를 활성화.

sequence:

```text
INTERACT
→ board busy
→ player CINEMATIC
→ camera align
→ HUD 제거
→ NPC gaze board
→ room light dim
→ board activate
```

즉시 영상 overlay로 점프하지 않는다.

---

# 58. CH9 First Mission Beat

```text
FIELD RECORD / 06 AUG 1945
→ B-29 silhouette
→ ground crew
→ taxi
→ takeoff
→ clouds
→ map / route
→ release
→ falling object
→ silence
→ white flash
→ impact
→ shockwave / mushroom cloud
→ freeze
→ LITTLE BOY
→ MISSION RESULT / SUCCESS
```

---

# 59. CH9 First Silence

release 후 핵심 정적:

약 4~5초 수준을 목표로 할 수 있다.

정확한 시간은 후속 timing 문서에서 확정.

중요:

• 음악 제거 또는 거의 없음
• engine/air sound도 줄어듦
• 관객이 기다리게 함

---

# 60. First Flash

섬광 marker:

• board white
• room light 반응
• NPC silhouette
• audio impact는 섬광 직후 약간 지연 가능

빛과 소리가 완전히 동시에 오지 않아도 된다.

---

# 61. First Result NPC Reaction

MISSION RESULT / SUCCESS 이후:

• Richard smile gone
• Luis step back
• George away
• Kenneth seat 등

반응은 대사 없이.

---

# 62. First-to-Second Transition

첫 결과를 본 뒤 충분한 hold.

바로 09 AUG로 넘어가지 않는다.

NPC reaction을 읽을 시간 필요.

---

# 63. CH9 Second Mission

첫 번째보다 setup 짧음.

```text
09 AUG 1945
→ aircraft / clouds / city
→ release
→ longer silence
→ flash
→ explosion
→ FAT MAN
→ MISSION RESULT / SUCCESS
```

첫 장면 copy-paste 금지.

---

# 64. Second Silence

첫 번째와 같지 않게.

두 번째는 관객이 무엇이 올지 이미 알기 때문에 더 길거나 더 무거운 정적 가능.

---

# 65. Second NPC Reaction

큰 startled reaction 없음.

첫 결과 이후의 상태가 더 굳어지는 식.

---

# 66. SUCCESS Sequence

두 mission 이후:

```text
PROJECT ███████
FINAL STATUS
SUCCESS
```

hold.

기계음/ambient 점차 줄어듦.

---

# 67. SUCCESS_ Transition

시스템 이상처럼 아주 작게.

```text
SUCCESS
→ cursor-like anomaly
→ SUCCESS_
```

도덕적 UI가 직접 “의문”을 던지는 느낌을 피한다.

---

# 68. SUCCESS?

최종:

```text
SUCCESS?
```

카메라 거의 움직이지 않음.

음악 없음 또는 매우 최소.

---

# 69. Hans Glance

SUCCESS? 전후:

Hans:

```text
BOARD
→ PLAYER
→ BOARD
```

대사 없음.

---

# 70. Power-down

시설이 순차적으로 꺼진다.

권장:

```text
background machines
→ side work lights
→ local equipment
→ room lights
→ board
→ black
```

---

# 71. Power-down Audio

각 장비가 꺼지며:

• relay click
• fan coast-down
• hum 감소

가능.

한 번에 ambience volume 0 금지.

---

# 72. Full Black

완전 blackout 후 최소 짧은 정적.

그 뒤 chapter transition.

---

# 73. CH9→CH10 Transition

```text
black
→ save
→ location change
→ CH10 starts black
→ fade in home
```

페이지 이동 흔적을 보이지 않는다.

---

# 74. CH10 Start

black에서 따뜻한 자택.

연구시설과 강한 대비.

camera는 안정적.

HUD 없음.

---

# 75. Radio

라디오 자체는 일반 interaction 또는 soft sequence.

방송이 진행되는 동안 player 이동 가능.

전화가 울리면 audio mix만 조정.

---

# 76. Phone Ring

첫 ring은 player가 직접 발견.

camera 강제 snap 금지.

전화 interaction 후 CINEMATIC/DIALOGUE sequence.

---

# 77. Phone Pickup Sequence

```text
player near phone
→ interact
→ movement lock
→ camera focus
→ hand reach
→ handset grip
→ cradle release
→ call pose
→ dialogue
```

---

# 78. Phone Dialogue Sequence

한 입력당 한 line.

중간 forced pause.

다른 world interaction 없음.

---

# 79. Throw Trigger

마지막:

`“듣고 계십니까?”`

이후 player input 또는 sequence timing으로 throw 단계 진입.

추가 dialogue advance를 연타해서 throw를 skip하지 못하게 한다.

---

# 80. Handset Throw Cinematic

```text
handset lowers toward cradle
→ nearly reaches cradle
→ stops
→ forced silence
→ lateral throw
→ edge impact
→ fall
→ cord tension
→ settle
```

---

# 81. Throw Camera

1인칭.

수화기를 끝까지 과도하게 추적하지 않는다.

impact 후 약간 아래를 바라봄.

---

# 82. Throw Audio

impact 이후 잠시:

• caller voice
• static
• clock/radio ambience

만 남도록 mix 정리 가능.

---

# 83. Floor Caller

바닥 수화기에서:

`“…박사님?”`

static.

`“…작은 물건을 하나 보내드렸습니다…”`

AUTO.

큰 dialogue UI 없음.

---

# 84. Post-Throw Release

수화기 final rest 확인 후 player control 복구.

단, 전화기를 다시 집는 interaction은 비활성.

---

# 85. Knock

player control이 돌아온 뒤 적절한 정적 후 knock.

노크 즉시 카메라 이동 금지.

---

# 86. Door Cinematic

player가 현관문 interaction.

```text
movement lock
→ handle
→ latch
→ door
→ outdoor light
→ parcel reveal
→ release
```

---

# 87. Parcel Reveal

문이 충분히 열린 후 상자가 보임.

상자가 자동으로 강조/zoom되지 않음.

---

# 88. Parcel Pickup

일반 CARRY sequence.

큰 시네마틱처럼 오래 끌지 않는다.

---

# 89. Box Placement

table slot에 놓으면 상자 개봉 phase 시작 가능.

---

# 90. String Sequence

끈을 풀 때:

• hand
• knot
• slack
• remove

가 보이게.

---

# 91. Lid Sequence

뚜껑이 열린 뒤 내부 물건 활성.

---

# 92. Photo / Medal

둘은 완전 시네마틱이라기보다 INSPECT sequence.

하지만 각각:

• pickup
• inspect
• flip/rotate
• short explanation
• placement

흐름 유지.

---

# 93. Postcard Readiness

photo + medal 둘 다 완료 후:

• postcard physically visible
• interaction enabled

카메라 자동 zoom 없음.

---

# 94. Postcard Cinematic Entry

엽서 클릭:

```text
world interaction lock
→ player movement lock
→ camera settle
→ postcard pickup
→ background dim
→ INSPECT/CINEMATIC takeover
```

---

# 95. Postcard Flip

player 입력 후:

```text
flip
→ side profile
→ back
→ hold
```

그 전까지 이름 없음.

---

# 96. Identity Reveal

순서:

```text
TO.
```

hold.

```text
J. ROBERT
```

hold.

```text
OPPENHEIMER
```

hold.

최종:

```text
TO. J. ROBERT OPPENHEIMER
```

---

# 97. Identity Reveal Tone

금지:

• 음악 폭발
• dramatic zoom
• camera shake
• UI flash
• “YOU ARE...” 문구

조용한 reveal.

---

# 98. Reveal Input Gate

이름이 전부 공개되기 전 다음 입력 잠금.

연타로 건너뛰기 금지.

---

# 99. Postcard Continue

충분한 hold 후 CONTINUE.

엽서 unfold 또는 background black.

---

# 100. Oppenheimer Profile

full black 또는 거의 black.

```text
J. ROBERT OPPENHEIMER
SCIENTIFIC DIRECTOR
LOS ALAMOS LABORATORY
MANHATTAN PROJECT
```

짧은 한국어 설명.

---

# 101. Profile Hold

플레이어가 읽을 최소 시간 보장.

바로 Final Archive로 자동 넘어가지 않는다.

---

# 102. Final Archive Entry

CONTINUE 후 full black.

archive sequence 시작.

world interaction 완전 비활성.

---

# 103. Final Archive 기본 Beat

각 인물:

```text
redacted chapter card
→ short hold
→ flashback
→ card return
→ redaction removal
→ full name
→ portrait/profile
→ hold
→ fade
```

---

# 104. Final Archive Order

고정:

```text
Richard P. Feynman
Enrico Fermi
Luis W. Alvarez
John von Neumann
George B. Kistiakowsky
Emilio Segrè
Kenneth Bainbridge
Hans Bethe
```

---

# 105. Flashback

약 1초 전후의 짧은 기억.

예:

Richard:
calculator/binder.

Enrico:
chalkboard.

Luis:
CRT.

John:
timing sheet.

George:
REJECTED/test.

Emilio:
night counter.

Kenneth:
incident report.

Hans:
final report.

---

# 106. Flashback Perspective

가능하면 해당 chapter의 1인칭 기억 시점.

플레이어 몸/얼굴 없음.

---

# 107. Redaction Removal

검열선이:

• scratch
• peel
• wipe

등으로 제거될 수 있음.

하지만 장난스러운 UI animation 금지.

---

# 108. Archive Profile

각 프로필은 짧음.

게임 흐름을 멈추는 백과사전 금지.

---

# 109. Archive Continue

각 인물 profile은 최소 읽기 시간 후 continue.

연타로 여러 인물 스킵 금지.

---

# 110. Last Memory

Hans 이후:

black.

CH1~7의 REJECTED stamp sound가 한 번씩.

각각 너무 빠르게 겹치지 않음.

---

# 111. Final Stamp Sound

마지막:

CH8 APPROVED

`쾅.`

그 뒤 silence.

화면에 도장 애니메이션을 다시 보여줄 필요 없음.

소리가 기억을 소환하는 방식.

---

# 112. ENDING CODE

silence 후 `ENDING CODE`.

이후 별도 title card `NAMELESS Ⅱ — 반증`은 자동 추가하지 않는다.

---

# 113. Cinematic Recovery

브라우저 focus loss 또는 reload 시 exact frame 복구 금지.

의미 단위 checkpoint 사용.

---

# 114. CH9 Recovery 후보

```text
BEFORE_RESULTS
AFTER_FIRST_MISSION
AFTER_SECOND_MISSION
BEFORE_SUCCESS_QUESTION
CH09_COMPLETE
```

정확한 저장 정책은 `25_SAVE_AND_RESUME.md`.

---

# 115. CH10 Recovery 후보

```text
HOME_START
PHONE_ACTIVE
PHONE_AFTER_THROW
DOOR_EVENT_READY
PARCEL_PLACED
BOX_OPEN
PHOTO_COMPLETE
MEDAL_COMPLETE
POSTCARD_READY
IDENTITY_REVEALED
ARCHIVE_INDEX_n
ENDING_READY
```

---

# 116. Focus Loss 중 NON-SKIPPABLE Cinematic

짧은 장면:
복귀 시 safe endpoint.

긴 장면:
현재 semantic beat 또는 직전 checkpoint에서 재개.

---

# 117. Audio Focus Loss

브라우저가 audio context를 suspend할 수 있음.

복귀 시:

• 영상만 진행되고 오디오가 사라진 상태를 방치하지 않음
• 필요하면 beat 재동기화

---

# 118. Cinematic Time Source

긴 영상/오디오 동기화는 공통 clock 사용.

각 subsystem이 별도 Date.now 기준으로 drift하지 않게 한다.

---

# 119. Timeline Marker

중요 marker:

```text
BOARD_ON
RELEASE
FLASH_1
IMPACT_1
FIRST_RESULT
FLASH_2
SECOND_RESULT
SUCCESS
SUCCESS_QUESTION
POWER_DOWN
BLACK
PHONE_IMPACT
POSTCARD_FLIPPED
IDENTITY_FULL
ARCHIVE_NEXT
FINAL_STAMP
```

---

# 120. Marker One-Shot

focus loss, seek, frame hitch가 있어도 한 번만 실행.

---

# 121. Cinematic State Commit

story state는 시각적 beat와 분리.

예:

CH9 first mission 영상이 시작됐다고 firstMissionSeen=true 하지 않는다.

MISSION RESULT가 완료되고 verify 후 commit.

---

# 122. Cinematic Idempotency

동일 cinematic trigger를 두 번 눌러도 두 번째 시작 안 됨.

특히:

• VIEW RESULTS
• 전화 answer
• door
• postcard
• archive continue

---

# 123. Resource Reservation

시네마틱 시작 전:

• camera
• NPC anchors
• object sweep
• placement slot
• board

등 필요한 자원 예약.

---

# 124. Cinematic 중 일반 AI

관련 없는 background NPC의 작은 idle은 유지 가능.

하지만 주요 camera cone을 지나가는 movement는 중지.

---

# 125. Cinematic Occlusion Zone

카메라 프레임 앞에 일반 NPC가 지나지 않게 temporary reserved corridor 사용 가능.

---

# 126. Cinematic Lighting

조명 변화는 장면의 의미를 보조.

조명 자체가 스토리를 대신 설명하지 않는다.

---

# 127. CH8 Lighting

밝아짐 = 성공.

불길한 contrast 금지.

---

# 128. CH9 Lighting

전광판에 집중.

white flash가 시설 전체에 잠깐 반영.

마지막 power-down.

---

# 129. CH10 Lighting

warm / domestic.

전화 이후도 갑자기 공포영화처럼 차갑게 변하지 않는다.

엽서 reveal 때 주변을 조용히 낮출 수 있음.

---

# 130. Particle

CH9 전광판 영상 내부:

• smoke
• cloud
• film grain

가능.

3D room 자체에 폭발 particle를 뿌리지 않는다.

---

# 131. Screen FX

허용:

• black fade
• archival grain
• white flash
• mild vignette
• controlled CRT effect

금지:

• glitch 남발
• chromatic aberration 과다
• horror distortion

---

# 132. SUCCESS? Glitch

아주 작고 시스템적인 수준.

화면 전체 glitch storm 금지.

---

# 133. Cinematic Audio Mix

중요 beat의 전후로 ambience를 duck할 수 있다.

예:

stamp
전화
mission release
SUCCESS?

그러나 모든 장면마다 ambience가 완전히 사라지지 않는다.

---

# 134. Intentional Silence

정적은 실제로 조용해야 한다.

음악, UI beep, 과도한 ambient가 남지 않게 한다.

---

# 135. Silence의 남용 금지

모든 scene에서 긴 silence를 쓰면 효과가 약해진다.

핵심 구간에 집중.

---

# 136. Cinematic Performance

CH8/CH9에서:

• 8 NPC
• light
• board
• audio
• camera

동시에 동작.

성능을 위해 불필요한 background update를 줄일 수 있다.

---

# 137. Preload

시네마틱 직전 필요한 asset은 미리 준비.

중요 beat 중 texture/audio lazy-load로 정지하지 않게 한다.

---

# 138. Asset Failure

필수 cinematic asset이 누락되면:

개발:
명확한 error.

배포:
가능한 fallback 사용.

black screen에서 아무 일도 안 일어나는 상태 금지.

---

# 139. Cinematic Debug Mode

개발 표시:

```text
cinematicId
currentBeat
elapsed
cameraOwner
lockedResources
activeNpcOwners
activeObjects
nextMarker
checkpoint
```

---

# 140. Beat Step Mode

복잡한 CH9/CH10은 개발 중 beat 단위 pause/advance 가능.

실제 배포에는 제거.

---

# 141. Replay Mode

QA용으로 특정 cinematic만 반복 실행 가능.

시작 전 canonical state 재구성.

이전 실행의 object/lock이 남지 않게 한다.

---

# 142. Cinematic QA

모든 주요 sequence:

• 정상 실행
• 더블 클릭
• 빠른 연타
• focus loss
• reload
• 저프레임
• mobile
• orientation change
• audio suspend
• missing object
• occupied anchor
• camera invalid

테스트.

---

# 143. CH9 QA

필수:

• VIEW RESULTS 한 번만
• HUD 정상 제거
• NPC 8명 reaction 분리
• first/second mission copy-paste 느낌 없음
• silence 실제로 유지
• white flash exposure 복구
• SUCCESS? 과장 없음
• power-down 순차적
• blackout 후 transition 안정

---

# 144. CH10 QA

필수:

• 전화 dialogue 연타 방지
• throw skip 불가
• handset/cord 최종 pose 정상
• knock timing 정상
• door/parcel 충돌 없음
• photo/medal 순서 자유
• postcard 이름 조기 노출 없음
• identity reveal 연타 방지
• archive 순서 고정
• final stamp 후 silence 유지

---

# 145. Cinematic 종료 조건

player control 반환 전:

• camera safe
• player safe
• NPC stable
• object rest pose
• required story state commit
• interaction registry 정상
• temporary UI 정리
• audio mix 정상
• lock 정리

모두 확인.

---

# 146. Transition 종료 조건

다음 페이지 이동 전:

• save checkpoint 완료
• black overlay 완료
• current sequence committed
• double navigation lock

확인.

---

# 147. 금지사항

• 시네마틱마다 3인칭 전환
• player 얼굴 노출
• camera가 벽/사람을 통과
• 모든 장면 완전 input lock
• 한 giant timeline으로 전체 게임 관리
• sequence 중 일반 interaction queue
• skip 시 final state 미정리
• focus loss 후 중간 pose 고정
• CH8 성공에 불길한 연출
• CH9 NPC 도덕 대사
• CH9 full-screen overlay만 사용해 시설 감각 제거
• SUCCESS? 과도한 glitch
• CH10 전화 투척 random physics
• 엽서 reveal에 과한 음악/zoom
• Final Archive를 8명 리스트로 한 번에 표시
• archive 연타 스킵
• ending 직전 title card 임의 추가
• black transition 전에 location 이동
• lock 해제 누락

---

# 148. 후속 문서와의 연결

`13_DOCUMENT.md`
• 문서/검열/Archive 시각 정보와 cinematic 연결

`14_STAMP.md`
• REJECTED/APPROVED cinematic의 핵심 impact 정의

`20_LIGHTING.md`
• CH8, CH9, CH10 lighting sequence 상세화

`21_AUDIO.md`
• silence, impact, phone, board, final stamp mix 정의

`24_TRANSITION.md`
• chapter blackout/page navigation 상세화

`25_SAVE_AND_RESUME.md`
• cinematic semantic checkpoint 및 복구 정책 정의

`26_TIMING_AND_PACING.md`
• 각 beat의 최종 시간 확정

`28_PERFORMANCE.md`
• CH8/CH9 stress 기준

각 CHAPTER `ANIMATION.md`, `CAMERA.md`, `STATE.md`
• 본 공통 규칙을 실제 장면 단위로 구체화

<!-- MERGED SOURCE END: 12_CINEMATIC_SEQUENCE.md -->
