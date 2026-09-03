<!-- MERGED SOURCE START: 05_DIALOGUE.md -->

# 05_DIALOGUE.md

# DIALOGUE SPECIFICATION

이 문서는 게임 전체의 대화 표현, 문장 단위 진행, 화자 표시, pause, 자동/수동 진행, NPC gesture cue, camera cue, object cue, player state 전환, 입력 잠금, 자막 가독성, 대화 종료 후 복귀, 특수 전화 대화와 CH8/CH9/CH10의 예외를 정의한다.

---

# 0. 누적 상충 검토

참조 문서:

• `00_INDEX.md`
• `01_PLAYER.md`
• `02_CONTROL.md`
• `03_CAMERA.md`
• `04_INTERACTION.md`

---

## 0.1 00_INDEX.md와의 상충 검토

00_INDEX.md는 `05_DIALOGUE.md`의 책임 범위를 다음과 같이 정의한다.

• 한 입력당 한 문장
• speaker 표시
• 자막 위치
• pause
• NPC gesture 연동
• camera cue
• object cue
• 대화 중 이동 제한
• 자동 대사와 수동 대사의 구분

본 문서는 위 범위를 그대로 구체화한다.

다음 항목은 다른 문서가 최종 책임을 가진다.

• 입력 장치/키/터치 → `02_CONTROL.md`
• 카메라 FOV/pose/look cone → `03_CAMERA.md`
• NPC 선택/대화 시작 interaction → `04_INTERACTION.md`
• NPC 상태 구조 → `06_NPC_CORE.md`
• NPC 이동 → `07_NPC_MOVEMENT.md`
• 표정/손짓/시선 애니메이션 → `08_NPC_GESTURE.md`
• animation 실행 구조 → `10_ANIMATION_CORE.md`
• UI의 최종 시각 디자인 → `23_UI.md`
• 타이밍의 프로젝트 전체 기준 → `26_TIMING_AND_PACING.md`
• 모바일 UI 치수 → `27_MOBILE.md`

00_INDEX.md와 상충 없음.

---

## 0.2 01_PLAYER.md와의 상충 검토

01_PLAYER.md는 다음을 확정했다.

• 플레이어는 무성에 가까운 주인공
• 긴 플레이어 독백 금지
• 플레이어의 감정은 행동으로 표현
• NPC는 주인공을 `박사님`, `책임자`, `Director` 등으로 호칭
• CH10 엽서 이전에 주인공 이름 노출 금지
• DIALOGUE 중 위치 이동 차단
• 대화 종료 후 제어 복원
• CH10 전화 통화는 한 줄씩 진행
• 감정적 판단을 플레이어 독백으로 설명하지 않음

본 문서는 이 원칙을 그대로 유지한다.

플레이어 선택지 중심의 대화 시스템을 만들지 않는다.

상충 없음.

---

## 0.3 02_CONTROL.md와의 상충 검토

02_CONTROL.md는 다음을 확정했다.

• DIALOGUE에서는 위치 이동 차단
• 일반 world interaction 차단
• `ADVANCE_DIALOGUE`만 허용
• 한 입력당 한 문장
• edge-trigger 방식
• 연타로 문장 건너뛰기 금지
• 문장 표시가 완료되기 전 다음 입력 gate 잠금
• DIALOGUE 중 월드 클릭으로 이벤트 누수 금지
• 대화 종료 후 기존 control 복구
• 상태 전환 시 이동 vector와 pending look delta 초기화

본 문서는 위 입력 계약을 유지한다.

상충 없음.

---

## 0.4 03_CAMERA.md와의 상충 검토

03_CAMERA.md는 DIALOGUE 카메라에 대해 다음을 확정했다.

• NPC 얼굴만 확대하는 인터뷰 화면 금지
• 얼굴/손/핵심 오브젝트를 함께 고려
• 위치 이동 금지
• 제한적 look 자유도
• dialogLookTarget과 look cone 사용
• NPC 움직임을 lock-on처럼 1:1 추적하지 않음
• 큰 이동이 필요하면 DIALOGUE에서 FOCUS/CINEMATIC으로 상태 전환
• 대화 종료 시 FOV/offset/look 제한 복원

본 문서는 대화 cue가 카메라를 직접 임의 좌표로 이동시키지 않고 camera pose 요청만 하도록 한다.

상충 없음.

---

## 0.5 04_INTERACTION.md와의 상충 검토

04_INTERACTION.md는 다음을 확정했다.

• NPC가 designated conversation spot에 도착한 뒤 대화 가능
• 접근 중 NPC interaction 잠금
• 대화 종료 후 같은 대화 즉시 재진입 방지
• 대화 중 world interaction 금지
• 한 입력이 대화와 월드 interaction에 동시에 전달되지 않음
• DIALOGUE state에는 명시적 exit route 필요
• CH9 결과 재생 후 NPC interaction 금지
• CH10 전화는 RINGING에서만 story call 진입

본 문서는 NPC interaction 성공 이후의 dialogue sequence만 담당하며 이를 유지한다.

상충 없음.

---

# 1. 대화의 기본 철학

이 게임의 대화는 설명문을 읽는 인터페이스가 아니다.

대화는 다음을 해야 한다.

• 인물이 실제 사람처럼 느껴지게 한다.
• 지금 무슨 일이 벌어지는지 행동과 함께 전달한다.
• 퍼즐의 정답을 직접 말하지 않는다.
• 연구자의 태도와 플레이어와의 관계 변화를 보여준다.
• 플레이어가 장면에 참여하고 있다는 감각을 유지한다.
• 중요한 문장은 충분한 정적을 가진다.

대화가 게임 진행 상황을 모두 대신 설명하면 실패다.

환경, 문서, 행동, 애니메이션이 먼저 말하고 대사는 필요한 만큼만 사용한다.

---

# 2. 핵심 규칙: 한 입력당 한 문장

기본 대화 진행:

```text
문장 표시
↓
읽을 시간
↓
ADVANCE_DIALOGUE 허용
↓
플레이어 입력
↓
다음 문장
```

한 번의 클릭/터치/키 입력으로 한 문장만 진행한다.

더블클릭, 키 repeat, 빠른 연타로 두 줄 이상 넘어가지 않는다.

---

# 3. 문장 단위

대사는 긴 문단으로 표시하지 않는다.

좋은 예:

```text
RICHARD
“박사님.”

[입력]

“계산부에서 첫 결과가 나왔습니다.”

[입력]

“한 번 확인해 주시죠.”
```

나쁜 예:

```text
RICHARD
“박사님. 계산부에서 첫 결과가 나왔습니다. 한 번 확인해 주시죠. 여러 팀이 밤새 계산했고 이번에는 문제가 없을 겁니다.”
```

한 문장 또는 짧은 의미 단위가 화면 하나를 담당한다.

---

# 4. 대사 길이

한 자막 블록은 기본적으로 1~2줄 안에 들어오게 한다.

한국어 기준 권장:

• 짧은 문장 8~22자
• 일반 문장 15~35자
• 특별히 필요한 문장만 더 길게

한 문장이 모바일에서 4줄 이상 꺾이면 재작성 우선.

글자를 작게 줄여 해결하지 않는다.

---

# 5. 화자 표시

화자는 First Name 또는 역할명으로 표시한다.

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

다른 일반 연구자:

```text
RESEARCHER
TECHNICIAN
OPERATOR
```

필요한 경우 한국어 역할명도 가능.

플레이어 이름은 표시하지 않는다.

---

# 6. 연구자의 성 금지

CH1~8 user-facing speaker label에 다음을 표시하지 않는다.

• FEYNMAN
• FERMI
• ALVAREZ
• VON NEUMANN
• KISTIAKOWSKY
• SEGRÈ
• BAINBRIDGE
• BETHE

Final Archive 전까지 First Name만 사용.

이름 노출 규칙은 `29_SPOILER_RULES.md`가 추가 검증한다.

---

# 7. 플레이어 발화

플레이어의 직접 대사는 원칙적으로 화면에 쓰지 않는다.

필요한 반응은 다음으로 표현한다.

• 침묵
• 시선
• 문서 지적
• 도장 선택
• 물건을 내려놓음
• 수화기 투척

정말 문장 선택이 필요하다면 챕터별 명시적 예외가 필요하다.

기본 UI에 player dialogue box를 만들지 않는다.

---

# 8. 플레이어의 질문 표현

플레이어가 오류를 지적해야 하는 경우 선택지를 문장으로 말하게 하기보다 증거를 직접 선택하게 한다.

예:

문서 A의 특정 기록 선택
→ Richard가 반응.

즉:

`“이 값이 틀렸습니다.”`

라는 플레이어 대사를 띄우지 않는다.

행동이 질문과 지적을 대신한다.

---

# 9. Dialogue data 기본 구조

권장:

```js
{
  id: "ch01_intro",
  speaker: "RICHARD",
  lines: [
    {
      text: "박사님.",
      mode: "MANUAL",
      minHold: 0.45
    },
    {
      text: "계산부에서 첫 결과가 나왔습니다.",
      mode: "MANUAL"
    },
    {
      text: "한 번 확인해 주시죠.",
      mode: "MANUAL"
    }
  ]
}
```

각 line은 필요시 cue를 가진다.

---

# 10. line 데이터 필드

권장 필드:

```text
id
speaker
text

mode

minHold
autoDelay

gestureCue
cameraCue
objectCue
audioCue

before
after

allowLook

onComplete
```

모든 필드를 항상 넣지 않는다.

필요할 때만 사용.

---

# 11. MANUAL 대사

기본 모드.

플레이어 입력이 있어야 다음 문장 진행.

사용:

• 대부분의 NPC 대화
• 반려 전후
• 수정본 제출
• 전화 통화
• 이름 공개 전후의 중요한 텍스트

---

# 12. AUTO 대사

플레이어 입력 없이 다음으로 넘어가는 대사.

사용을 제한한다.

적합:

• 멀리서 들리는 연구자 말
• 짧은 ambient dialogue
• 전화기 바닥에서 흐릿하게 계속되는 목소리
• CH9 결과 재생 중 작은 외부 음성

부적합:

• 핵심 정보
• 퍼즐에 필요한 단서
• 감정적으로 중요한 문장

---

# 13. AUTO 대사 시간

AUTO line은 텍스트 길이와 음성 길이에 맞춰 충분히 유지.

고정 1초로 모든 문장을 넘기지 않는다.

권장 최소:

```text
짧은 한마디: 1.2~1.8s
일반 문장: 2.0~3.5s
```

실제 voice가 있다면 voice duration 우선.

정확한 전체 pacing은 `26_TIMING_AND_PACING.md`.

---

# 14. FORCED PAUSE

일부 대사는 다음 입력을 즉시 받지 않는다.

예:

```text
“……”
```

또는 중요 문장 후 정적.

FORCED PAUSE 중:

• 자막 유지 가능
• ADVANCE_DIALOGUE gate 잠금
• NPC gesture 진행
• ambient는 유지

pause가 끝나야 다음 입력 허용.

---

# 15. 침묵도 대화다

`……`를 지나치게 텍스트로 남발하지 않는다.

가능하면 실제 침묵:

• NPC가 문서를 본다.
• 시선을 내린다.
• 숨을 고른다.
• 손을 멈춘다.

를 사용.

자막 없는 pause도 line sequence의 일부가 될 수 있다.

---

# 16. SILENT BEAT 데이터

예:

```js
{
  type: "BEAT",
  duration: 1.2,
  gestureCue: "look_down"
}
```

이 동안 speaker label/자막은 숨길 수 있다.

감정적 순간에 `……` 자막을 계속 띄우는 것보다 자연스럽다.

---

# 17. 대화 시작

NPC interaction 성공 후:

1. interaction lock
2. NPC 준비 여부 확인
3. playerState → DIALOGUE 또는 FOCUS
4. camera framing
5. 필요 gesture
6. dialogue line 시작

카메라가 아직 NPC를 못 보고 있는데 자막부터 뜨지 않는다.

---

# 18. 대화 시작 지연

NPC가 플레이어를 바라보거나 문서를 내미는 짧은 준비 동작이 필요할 수 있다.

이때:

FOCUS
→ 준비
→ DIALOGUE

사용 가능.

DIALOGUE state 안에서 2초 동안 아무 텍스트도 없이 기다리게 하지 않는다.

---

# 19. 대화 종료

마지막 line 이후 즉시 FREE로 전환하지 않을 수 있다.

가능한 흐름:

```text
DIALOGUE
→ object animation
→ FOCUS
→ FREE
```

또는:

```text
DIALOGUE
→ STAMP
```

또는:

```text
DIALOGUE
→ CINEMATIC
```

대화 시스템은 다음 state를 명시적으로 반환한다.

---

# 20. dialogue exit contract

각 dialogue sequence는 종료 시 다음 중 하나를 지정한다.

```text
FREE
FOCUS
INSPECT
STAMP
CINEMATIC
TRANSITION
```

종료 state가 없으면 기본 FREE로 가는 식의 암묵 규칙을 최소화한다.

스토리 핵심 장면에서 state가 잘못 복원되는 것을 방지한다.

---

# 21. Camera Cue

line은 camera cue를 요청할 수 있다.

예:

```text
cameraCue: "RICHARD_DOCUMENT"
```

대화 데이터가 camera.position 숫자를 직접 갖지 않는다.

pose 정의는 `03_CAMERA.md`와 챕터 CAMERA 문서가 담당.

---

# 22. Camera Cue 남용 금지

문장마다 카메라가 움직이면 산만하다.

기본적으로 한 대화 블록에서 1~3회의 의미 있는 시점 변화만 사용.

예:

얼굴
→ 문서
→ 다시 얼굴

충분.

매 line마다 zoom 금지.

---

# 23. Gesture Cue

대사와 NPC 행동을 연결한다.

예:

```text
gestureCue: "offer_document"
gestureCue: "look_at_report"
gestureCue: "cross_arms"
gestureCue: "small_nod"
```

실제 gesture 정의는 `08_NPC_GESTURE.md`.

---

# 24. gesture 타이밍

gesture가 대사보다 항상 먼저 끝나거나 항상 동시에 시작할 필요 없다.

예:

Richard:

“……잠깐.”

말하면서 문서를 내려다봄.

그 뒤:

“이 값은 여기서 나온 게 아니군요.”

말하기 직전 손가락이 해당 행에 멈춤.

즉 cue는 line start / mid / end를 지정할 수 있다.

---

# 25. Object Cue

대화 중 world object가 움직일 수 있다.

예:

• 문서 내밀기
• 보고서 펼치기
• 종이 회수
• 전화 수화기 들기

대화 데이터는 object animation id를 요청.

실제 경로는 `11_OBJECT_ANIMATION.md`.

---

# 26. Object Cue와 텍스트 순서

행동이 먼저 보여야 이해되는 문장은 행동 완료 후 표시.

예:

George가 보고서를 책상 위에 놓는다.
→ 종이가 멈춘다.
→ “……보고서를 보시겠습니까?”

반대로 대사와 함께 동작해야 자연스러운 경우 병렬 실행 가능.

---

# 27. Audio Cue

대화 시작/종료 또는 line에 작은 사운드 cue 가능.

예:

• 종이 넘김
• 의자 소리
• 전화 static

화자의 모든 자막마다 UI beep를 넣지 않는다.

---

# 28. 음성 연기

실제 음성 파일이 없어도 대화 시스템은 성립해야 한다.

voice가 없는 경우:

• 자막
• 표정/gesture
• 환경음
• pause

로 전달.

기계적인 타자기 효과를 모든 대사에 적용하지 않는다.

---

# 29. Text Reveal

자막은 한 글자씩 너무 느리게 타이핑하지 않는다.

선택지:

A. 짧은 fade-in
B. 빠른 reveal

타자기 게임처럼 읽기 속도를 강제로 제한하지 않는다.

문장 표시 완료 시 ADVANCE gate 활성.

---

# 30. 텍스트 reveal 중 입력

02_CONTROL.md에 따라 reveal이 끝나기 전 다음 line 진행은 기본적으로 막는다.

다만 사용자가 읽기 속도를 높일 수 있게:

첫 입력:
현재 line reveal 즉시 완료.

두 번째 별도 입력:
다음 line.

방식을 고려할 수 있다.

단 한 번의 더블탭으로 reveal 완료 + 다음 line까지 넘어가지는 않게 gate 분리.

---

# 31. 자막 위치

기본 dialogue subtitle은 화면 하단 중앙.

하지만 다음을 가리지 않는다.

• NPC 손
• 제출 문서
• 전화기
• 상자 내부
• 엽서 이름

필요하면 장면별로 약간 위/아래 조정.

정확한 UI margin은 `23_UI.md`.

---

# 32. 자막 safe area

모바일:

• 하단 OS gesture 영역과 겹치지 않음
• joystick/action 버튼과 겹치지 않음
• 가로/세로 화면 모두 고려

PC:

• 화면 끝에 너무 붙지 않음

---

# 33. speaker label 시각 위계

speaker는 본문보다 작거나 비슷한 수준.

이름 자체가 너무 강조되어 역사 인물 맞히기 게임처럼 보이지 않게 한다.

First Name은 명확히 읽히되 과도한 장식 금지.

---

# 34. Dialogue UI의 존재감

대화창이 화면 절반을 덮는 비주얼노벨 형태를 피한다.

게임 공간과 NPC 행동을 계속 볼 수 있어야 한다.

배경 panel은 최소.

가독성에 필요한 contrast만 확보.

---

# 35. 대화 중 세계 유지

DIALOGUE라고 world simulation 전체를 멈추지 않는다.

가능:

• CRT 깜빡임
• 먼 장비 움직임
• 다른 NPC의 작은 idle
• 환경음

중단:

• 현재 대화를 방해할 큰 NPC 이동
• 새 story event
• 중복 경보
• 다른 대화 시작

---

# 36. NPC idle과 대화

대화 중 현재 speaker는 generic idle을 그대로 반복하지 않는다.

예:

중요 대사를 하는데 계속 같은 손 흔들기 loop 금지.

line cue가 없더라도 대화 전용 subtle idle 사용.

---

# 37. 대화 중 시선

speaker는 항상 카메라만 뚫어지게 보지 않는다.

가능:

• 플레이어
• 문서
• 장비
• 다른 NPC

로 자연스럽게 시선 이동.

특히 연구 오류를 발견하는 순간:

플레이어보다 문서를 보는 시간이 중요할 수 있다.

---

# 38. 대화와 퍼즐 정보

대사는 퍼즐 해결에 필요한 정보를 제공할 수 있다.

그러나 정답 자체를 말하지 않는다.

좋은 예:

“지난주에 교정했습니다.”

이후 로그에서 reference clock 교체 시점 확인.

나쁜 예:

“지난주에 교정했지만 그 뒤 기준 시계가 바뀌었으니 이 교정은 무효입니다.”

후자는 퍼즐을 없앤다.

---

# 39. 핵심 정보 이중화

퍼즐에 필수인 정보가 대사 한 번에만 존재하지 않게 한다.

필요한 정보는:

• 문서
• 로그
• 환경 기록

등으로 다시 확인 가능해야 한다.

플레이어가 대사 한 줄을 놓쳤다고 진행 불가능해지지 않는다.

---

# 40. 연구자별 말투 차이

8명의 과학자가 모두 같은 문체로 말하면 안 된다.

공통 규칙:

Richard
• 빠르고 직설적
• 약간 가벼운 리듬
• 오류를 인정하면 빠르게 다음 행동

Enrico
• 차분
• 조건/논리를 정리하는 말투
• 감정 표현 절제

Luis
• 장비와 데이터에 친숙
• 약간 실용적이고 빠른 반응

John
• 짧고 정밀
• 계산과 구조 중심
• 군더더기 적음

George
• 직선적
• 일정 압박에서 감정이 드러남
• 반려 장면에서 가장 강한 충돌

Emilio
• 관찰 중심
• 의심을 솔직히 공유
• CH6에서는 플레이어와 협력적

Kenneth
• 현장 책임자의 무게
• 보고/책임 표현이 강함
• 사고 기록 장면에서 압박감

Hans
• 종합/정리
• 침착
• CH8에서 전체 연구를 한데 묶는 역할

세부 문체는 각 챕터 DIALOGUE.md에서 확정.

---

# 41. 캐릭터성을 과장하지 않기

실제 역사 인물을 만화 캐릭터처럼 과장하지 않는다.

예:

Richard를 매 문장 농담하는 캐릭터로 만들지 않는다.

John을 로봇처럼 말하게 만들지 않는다.

George를 악당처럼 만들지 않는다.

캐릭터 차이는 리듬과 태도에서 드러낸다.

---

# 42. 일반 NPC 대사

주요 8명 외 연구자 대사는 짧고 기능적.

환경 서사를 보완.

예:

“기록지 새 걸로 바꿔.”

“전압 다시 확인해.”

“그 표는 계산실로 보내.”

이런 ambient dialogue는 AUTO 가능.

---

# 43. ambient dialogue 거리

플레이어가 멀어지면 자막을 계속 띄우지 않는다.

중요하지 않은 ambient 대사는 spatial audio만 들릴 수 있음.

필수 정보는 ambient dialogue에만 넣지 않는다.

---

# 44. 중복 ambient 금지

같은 NPC가 10초마다 같은 한마디 반복 금지.

ambient line pool과 cooldown 사용.

하지만 대화 시스템이 거대한 잡담 생성기로 변하지 않게 제한.

---

# 45. CH1 Richard 대화 구조

기본 흐름:

```text
입장
→ 제출
→ 조사 전
→ 오류 지적
→ 오류 인식
→ REJECTED 후
→ 수정본 제출
→ APPROVED 후
```

핵심 대사:

```text
“박사님.”

“계산부에서 첫 결과가 나왔습니다.”

“한 번 확인해 주시죠.”
```

오류 지적 후:

```text
“그쪽입니까?”

“계산은 두 번 돌렸습니다.”
```

문서 확인:

```text
“……잠깐.”

“이 값은 여기서 나온 게 아니군요.”

“전사 과정에서 섞였습니다.”
```

REJECTED 후:

```text
“알겠습니다.”

“처음부터 다시 돌리겠습니다.”
```

수정본:

```text
“이번에는 전부 연결됩니다.”
```

APPROVED 후:

```text
“좋군요.”

“앞으로 박사님 책상에 오기 전에는 한 번 더 의심해 보겠습니다.”
```

세부 cue는 CH01 DIALOGUE 문서에서 확정.

---

# 46. CH2 Enrico 대화 구조

핵심:

```text
“박사님.”

“네 팀 모두 자기 조건이 옳다고 합니다.”

“물론 네 팀이 동시에 옳을 수는 없겠죠.”
```

오류 전:

```text
“그 규정은 지난 시험에서도 사용했습니다.”
```

오류 확인 후:

실제 침묵 beat.

그 뒤:

```text
“조건이 바뀌었는데 기준은 그대로였군요.”
```

수정 후:

```text
“이번에는 네 팀 모두 같은 영역을 보고 있습니다.”

“이제 계속할 수 있겠군요.”
```

---

# 47. CH3 Luis 대화 구조

```text
“기계가 고집을 부리는군요.”

“하지만 데이터에는 문제 없습니다.”
```

지적:

```text
“B?”

“지난주에 교정했습니다.”
```

로그 확인 후:

```text
“……”
```

가능하면 silent beat로 대체.

그 뒤:

```text
“그럼 교정 자체가 무효군요.”
```

수정 후:

```text
“잡았습니다.”

“정확하군요.”
```

---

# 48. CH4 John 대화 구조

```text
“두 기록이 동시에 발생해야 합니다.”

“현재는 그렇지 않습니다.”

“원인을 찾았습니다.”
```

오류 확인:

```text
“계산은 맞습니다.”
```

replacement log 확인.

그 뒤:

```text
“증폭기 교체 기록.”

“제가 이전 모델의 지연값을 사용했군요.”
```

REJECTED 후:

```text
“옳은 결정입니다.”
```

수정 후:

```text
“이제 동시입니다.”
```

---

# 49. CH5 George 대화 구조

George는 가장 긴장감이 높다.

초기:

```text
“괜찮습니다.”

“허용 범위였습니다.”
```

플레이어 재접근:

```text
“……보고서를 보시겠습니까?”
```

이상 지적 후:

```text
“오차입니다.”

“이 정도 편차 때문에 전체 시험을 다시 할 수는 없습니다.”

“일정이 이미 늦었습니다.”
```

플레이어가 도장을 들기 전/중간 pause.

그 뒤:

```text
“진심입니까?”
```

REJECTED 후:

```text
“좋습니다.”

“완벽한 걸 원하신다면 그렇게 하죠.”
```

수정 후:

```text
“이게 원하셨던 겁니까?”
```

APPROVED 후:

```text
“……이쪽이 낫군요.”
```

George를 악당처럼 보이게 하는 추가 공격적 대사 금지.

---

# 50. CH6 Emilio 대화 구조

초기:

```text
“박사님.”

“이상한 게 있습니다.”
```

플레이어와 데이터 확인.

초기 결론:

```text
“저도 그렇게 생각합니다.”
```

draft를 보여주며:

```text
“오늘 아침까지만 해도 이대로 올릴 생각이었습니다.”

“하지만 지금은 확신할 수 없습니다.”
```

REJECTED 후:

```text
“좋습니다.”

“더 측정하겠습니다.”
```

수정본:

```text
“같은 물질이 아닙니다.”

“이 차이를 무시하면 이후 계산은 전부 틀립니다.”
```

---

# 51. CH7 Kenneth 대화 구조

경보 후:

```text
“시험은 중단됐습니다.”

“사람은 다치지 않았습니다.”

“공식 기록에는 장비 결함으로 적겠습니다.”
```

플레이어가 보고서/기록을 본 뒤 Kenneth:

```text
“……문제가 있습니까?”
```

사건 재구성 후:

```text
“이렇게 적으면 시험 전체가 다시 검토됩니다.”

“몇 주가 날아갑니다.”

“상부에서는 좋아하지 않을 겁니다.”
```

REJECTED 후:

```text
“알겠습니다.”

“사고가 난 방식 그대로 쓰겠습니다.”
```

APPROVED 후 떠나다 멈춰:

```text
“박사님.”

“마지막 시험 때도 이렇게 하십시오.”
```

---

# 52. CH8 Hans 대화 구조

처음으로 8명 모두 등장.

Hans:

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

각 이름을 언급할 때 해당 NPC에 짧은 gaze/camera cue 가능.

---

# 53. CH8 오류 반복 반응

첫 오류:

```text
“확인하겠습니다.”
```

두 번째:

```text
“또 있군요.”
```

마지막:

Hans가 보고서를 닫음.

silent beat.

그 뒤:

```text
“전체를 다시 정리하겠습니다.”
```

같은 반응을 네 번 반복하지 않는다.

---

# 54. CH8 수정본

Hans:

```text
“이번에는 원본과 같습니다.”
```

최종 승인 후:

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

중요:

이 장면에는 불길한 대사 추가 금지.

---

# 55. CH8 성공 대화의 정서

이 장면은 플레이어가 성공을 진심으로 느끼게 해야 한다.

따라서 금지:

• “우리가 무슨 일을 한 거죠?”
• “이게 옳은 일일까요?”
• “곧 세상이 바뀌겠군요.”
• 의미심장한 침묵 과다
• 폭발을 암시하는 은유

CH9 전까지 성공의 감정에 균열을 넣지 않는다.

---

# 56. CH9 결과 전 대화

CH8 성공 직후의 가벼운 분위기 유지.

Richard:

```text
“이제 며칠은 숫자를 안 보고 싶군요.”
```

George:

```text
“다음에는 제 첫 보고서도 좀 믿어주십시오.”
```

Enrico:

```text
“그랬다면 여기까지 못 왔겠죠.”
```

이 대화는 플레이어가 CH8의 성취감을 이어받도록 한다.

---

# 57. CH9 결과 도착

Hans:

```text
“결과 보고가 도착했습니다.”
```

이 문장 이상으로 의미를 설명하지 않는다.

`무기`, `폭탄`, `도시` 등을 Hans가 먼저 말하지 않는다.

플레이어가 전광판에서 직접 본다.

---

# 58. CH9 영상 중 NPC 대사

첫/두 번째 mission 결과 영상 중 주요 NPC는 기본적으로 말하지 않는다.

정적과 몸짓이 핵심.

대사로 감정을 설명하지 않는다.

금지:

```text
“맙소사.”
“우리가 한 일이 저거였군요.”
“끔찍하군요.”
```

이런 직접적 해설 금지.

---

# 59. CH9 결과 후

`SUCCESS?`까지 주요 대사 없음.

Hans가 플레이어를 잠깐 바라보는 행동만 가능.

침묵이 대사를 대신한다.

---

# 60. CH10 라디오

라디오 방송은 NPC dialogue UI가 아니다.

자막을 제공한다면 broadcast style로 구분.

내용:

```text
“…일본 정부가 항복 의사를…”

“…전쟁은 사실상 종결되었습니다…”
```

필요 이상으로 역사 설명을 길게 하지 않는다.

---

# 61. CH10 전화 대화

전화는 일반 NPC 대화와 동일하게 한 입력당 한 문장.

VOICE:

```text
“박사님.”
```

입력.

```text
“끝났습니다.”
```

입력.

```text
“보고는 워싱턴에도 전달됐습니다.”
```

입력.

```text
“결과는 성공적이었다고 합니다.”
```

FORCED PAUSE.

입력.

```text
“대통령께서도—”
```

입력.

```text
“박사님의 공헌을—”
```

입력.

```text
“국가는 잊지 않을 것입니다.”
```

pause.

```text
“박사님?”
```

입력.

```text
“듣고 계십니까?”
```

---

# 62. 전화 화자 표시

전화 상대의 이름은 표시하지 않는다.

speaker:

```text
VOICE
```

또는:

```text
CALLER
```

정도로 표시.

실제 인물/직책을 추가하지 않는다.

---

# 63. 전화 대화의 끊김

다음 표현은 의도된 interruption.

```text
“대통령께서도—”
```

```text
“박사님의 공헌을—”
```

문장이 미완성인 이유는 플레이어가 듣기 힘들어하는 정서를 만들기 위함.

하지만 플레이어가 직접 통화를 끊지는 않는다.

그 뒤 실제 수화기 투척 sequence.

---

# 64. 수화기 투척 후 음성

수화기가 바닥에 떨어진 뒤:

AUTO / spatial voice.

```text
“…박사님?”
```

static.

```text
“…작은 물건을 하나 보내드렸습니다…”
```

이때 일반 dialogue UI를 계속 크게 띄우지 않는다.

필요하면 아주 작은 subtitle.

공간 안 바닥 전화기에서 들리는 느낌이 중요.

---

# 65. CH10 노크 이후

노크는 dialogue line이 아니다.

환경 cue.

플레이어가 직접 현관으로 이동한다.

`누군가 문을 두드렸다` 같은 narration 금지.

---

# 66. 상자 내 PHOTO 설명

사진을 조사했을 때 짧은 설명 가능.

정보:

```text
HIROSHIMA
AUGUST 1945
```

설명은 역사적 사실을 장황하게 설명하지 않는다.

플레이어가 이미 CH9에서 본 결과와 연결할 정도면 충분.

---

# 67. MEDAL 설명

메달/토큰은 게임 속 기념품으로 처리.

표면:

```text
FOR DISTINGUISHED SERVICE
```

설명은 실제 특정 Medal for Merit를 즉시 1945에 받았다고 단정하지 않는다.

CH10 세부 문서에서 표현 최종 확정.

---

# 68. POSTCARD reveal

엽서 이름은 일반 dialogue가 아니다.

화자 없음.

텍스트 reveal sequence:

```text
TO.
```

pause.

```text
J. ROBERT
```

pause.

```text
OPPENHEIMER
```

최종:

```text
TO. J. ROBERT OPPENHEIMER
```

이 동안 일반 dialogue box를 사용하지 않는다.

---

# 69. Oppenheimer profile

정체 공개 후 profile은 dialogue가 아니라 archive/profile text.

짧게 유지.

예:

```text
J. ROBERT OPPENHEIMER
SCIENTIFIC DIRECTOR
LOS ALAMOS LABORATORY
MANHATTAN PROJECT
```

한국어 짧은 소개.

대사 시스템이 아니라 Final Archive UI가 담당.

---

# 70. Final Archive 텍스트

각 인물:

챕터 당시 censored label.

예:

```text
CHAPTER 01
RICHARD ███████
```

flashback.

그 뒤:

```text
RICHARD P. FEYNMAN
```

짧은 profile.

일반 dialogue box 금지.

---

# 71. 대화와 역사 정보 분리

CH1~8 대사는 “현재 연구 현장”의 언어.

Final Archive는 “역사적 설명”의 언어.

둘을 섞지 않는다.

예:

CH1 Richard가 자기 역사적 업적을 설명하지 않는다.

---

# 72. 대화 중 spoiler 금지

CH1~8에서 player-facing dialogue에 직접 사용 금지:

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
```

역사적 이름/프로젝트명도 시점에 맞게 제한.

세부는 `29_SPOILER_RULES.md`.

---

# 73. 애매한 은유도 주의

직접 단어만 피하고 폭탄을 너무 명백하게 암시하는 대사를 쓰지 않는다.

예:

금지에 가까움:

“모든 방향에서 정확히 동시에 압축되어야 합니다.”

“투하 후 작동 시간은…”

“폭발 에너지가…”

기술적 의미가 바로 핵무기 구조로 이어지는 표현을 피한다.

---

# 74. 대화의 전문성

연구자들은 전문가처럼 말해야 하지만 플레이어가 전문 지식 없이는 이해 불가한 jargon 대화가 되면 안 된다.

방법:

• 짧은 전문 용어
• 바로 주변 문서/장비로 의미 확인
• 수식 설명은 문서로

대사로 긴 강의하지 않는다.

---

# 75. exposition 금지

나쁜 예:

```text
“이 시설은 1943년에 설립됐고 우리는 여러 부서가 함께 비밀 프로젝트를 진행하고 있습니다.”
```

좋은 방식:

• 날짜 문서
• 시설 layout
• 여러 부서 NPC
• 검열된 프로젝트 표식

대사는 지금 필요한 말만.

---

# 76. 감정 설명 금지

나쁜 예:

```text
GEORGE
“저는 지금 매우 화가 났습니다.”
```

좋은 방식:

• 문서를 빠르게 집음
• 어깨 긴장
• 짧은 대사

```text
“좋습니다.”
“완벽한 걸 원하신다면 그렇게 하죠.”
```

---

# 77. 동일 반응 반복 금지

모든 연구자가 REJECTED 후:

```text
“알겠습니다.”
“수정하겠습니다.”
```

만 말하면 안 된다.

각 인물/챕터의 갈등 정도에 맞게 다르게 반응.

---

# 78. 관계 변화

CH1~8을 거치며 연구자들이 플레이어를 대하는 방식이 조금씩 변한다.

초반:

• 검토 요청
• 자기 결과에 대한 자신감

중반:

• 플레이어 판단을 예상
• 반려 가능성을 의식

후반:

• 불확실한 데이터를 먼저 공유
• 최종 검토를 플레이어에게 맡김

직접:

“이제 당신을 신뢰합니다.”

라고 말하기보다 행동/대사 구조로 보여준다.

---

# 79. 대화 중 이름 호출

CH8에서 Hans가 다른 과학자를 First Name으로 부르는 것은 허용.

예:

```text
“Richard의 계산.”
```

성은 여전히 금지.

---

# 80. 대화 interruption

대화 중 경보/사건이 발생해 중단해야 할 경우:

• 현재 line을 중간에 무작위로 잘라내지 않음
• 명시적 interrupt point 사용
• dialogue state 종료
• event state 진입

CH7 경보는 대화 전에 시작되는 구조가 기본이므로 문제 없음.

---

# 81. 대화 재개

중단된 대화를 이어야 한다면:

• 마지막 완료 line 이후에서 재개
• 이미 표시한 line 반복 최소화

세부 저장은 `25_SAVE_AND_RESUME.md`.

---

# 82. 새로고침 복구

DIALOGUE 도중 새로고침 시 정확한 음절 위치를 저장하지 않는다.

safe checkpoint 정책에 따라:

• 대화 시작 전
또는
• 완료된 의미 단위 이후

복구.

대사를 중간 문장부터 시작하지 않는다.

---

# 83. dialogue sequence id

모든 story dialogue는 고유 id.

예:

```text
CH01_INTRO_RICHARD
CH01_ERROR_FOUND
CH01_REJECTED
CH01_RESUBMISSION
CH01_APPROVED
```

`dialog1`, `dialog2` 같은 이름 금지.

---

# 84. line id

필요한 핵심 line은 고유 id 가능.

예:

```text
CH05_GEORGE_GENUINE_QUESTION
```

QA/animation cue 동기화에 유용.

모든 짧은 line에 과도한 id 부여는 불필요.

---

# 85. 대화 중 callback 남용 금지

텍스트 line 안에 게임 상태 변경 로직을 마구 넣지 않는다.

예:

나쁜 구조:

```js
line.onStart = () => {
  GAME.chapter = 5;
  door.open();
  save();
  npc.walk();
  ...
}
```

대화 sequence는 cue/event를 발생시키고 chapter state manager가 처리.

결합도를 낮춘다.

---

# 86. dialogue event

권장:

```text
DIALOGUE_STARTED
LINE_STARTED
LINE_REVEALED
LINE_ADVANCED
LINE_COMPLETED
DIALOGUE_COMPLETED
```

animation/audio/camera가 필요한 event에 연결.

---

# 87. 대화와 state commit

중요 story state는 대사 표시 시작 순간보다 의미 단위 완료 후 commit.

예:

Hans의 “결과 보고가 도착했습니다.”가 시작됐다고 바로 VIEW RESULTS 활성화하지 않음.

대화 완료
→ board interaction 활성.

---

# 88. 대화 중 interaction 활성화 금지

다음 target을 미리 활성화해 플레이어가 자막을 넘기면서 동시에 클릭하게 하지 않는다.

대화 종료
→ state 전환 완료
→ interaction 활성

순서 유지.

---

# 89. 대화 중 object ownership

NPC가 서류를 들고 대사할 경우 ownership은 실제 animation 상태와 맞아야 한다.

예:

“한 번 확인해 주시죠.”
까지 Richard가 들고 있음.

그 뒤 handoff animation.

대사가 시작됐다는 이유만으로 document owner를 PLAYER로 바꾸지 않는다.

---

# 90. subtitle와 object visibility

핵심 object가 하단에 있는 장면에서는 subtitle이 가리지 않도록 조정.

대표:

• 도장
• 전화기
• 상자 내부
• 사진
• 메달
• 엽서

UI 문서에서 safe zones 정의.

---

# 91. 모바일 대화 진행

모바일:

화면 아무 곳 터치로 NEXT를 허용할 경우 위험:

• look pointer
• joystick
• UI gesture

와 충돌.

권장:

대화 중 별도 넓은 NEXT action zone.

또는 joystick/look 비활성 후 화면 탭.

최종 방식은 `27_MOBILE.md`.

한 터치 한 line 원칙은 동일.

---

# 92. 모바일 자막 길이

모바일에서 3줄 이상이 자주 발생하면 대사를 다시 나눈다.

폰트만 줄이지 않는다.

예:

기존:

“이 정도 편차 때문에 전체 시험을 다시 할 수는 없습니다.”

필요하면 의미를 유지하며 한 줄 sequence 두 개로 나눌 수 있다.

단, 말의 리듬이 부자연스러워지지 않게 챕터별 검토.

---

# 93. 대화 접근성

음성이 있다면 자막 제공.

자막이 있다면 speaker 구분.

색상만으로 speaker 구분하지 않는다.

긴 자동 대사는 충분한 표시 시간.

필수 정보는 음성만으로 전달하지 않는다.

---

# 94. 자막 옵션 가능성

향후:

• 글자 크기
• 자막 배경
• 음성 자막

옵션을 지원할 수 있다.

다만 공통 게임 UI가 복잡해지지 않도록 기본값만으로도 읽을 수 있어야 한다.

---

# 95. 말줄임표

`……` 사용은 제한.

한 챕터에서 모든 감정 순간마다 사용하지 않는다.

가능하면 silent beat.

텍스트 말줄임표는 실제 말의 망설임을 표현해야 할 때만.

---

# 96. 대시

`—`는 말이 끊기는 경우 사용.

CH10:

```text
“대통령께서도—”
```

처럼.

장식적으로 남발하지 않는다.

---

# 97. 문장 부호

과도한 느낌표 금지.

과학자 대화는 절제.

`!`는 경보/실제 급박한 상황에만 제한적으로.

---

# 98. 존칭

연구자들은 플레이어에게 기본적으로 존중하는 호칭 사용.

한국어 번역에서는:

• 박사님
• 책임자님

가능.

그러나 동일 문장 안에 존칭을 계속 반복하지 않는다.

---

# 99. Director 사용

영문 표기 `Director`는 시설 분위기에서 제한적으로 사용 가능.

한국어 dialogue에서는 “박사님”이 자연스러운 경우 우선.

문서/표식에서 Director 사용 가능.

---

# 100. 대화 언어 통일

한 line 안에서 불필요하게 한국어/영어 혼용하지 않는다.

기술 용어/문서명은 영어 가능.

NPC 말투는 자연스러운 한국어 중심.

---

# 101. 대화 테스트: 텍스트 없이도 이해되는가

각 scene에서 대사를 임시로 숨겨도:

• 누가 왔는지
• 무엇을 제출했는지
• 반려했는지
• 수정했는지
• 승인했는지

대략 알 수 있어야 한다.

그렇지 않다면 대화가 너무 많은 정보를 대신하고 있는 것.

---

# 102. 대화 테스트: 행동 없이도 과도하게 설명되는가

반대로 자막만 읽어도 모든 퍼즐 정답과 감정이 완전히 설명된다면 실패.

대사는 행동/환경과 상호보완.

---

# 103. 대화 테스트: 인물 교환

Richard 대사를 George에게 붙여도 어색하지 않다면 캐릭터성이 약함.

주요 대사는 인물별 리듬이 있어야 한다.

---

# 104. 대화 테스트: 반복

CH1~8에서 다음 문장을 검색해 반복 여부 검사:

```text
알겠습니다
수정하겠습니다
다시 해보겠습니다
문제가 있습니까
확인하겠습니다
```

의도적 반복이 아니라면 줄인다.

---

# 105. 대화 QA 실패 사례

• 더블탭으로 두 문장 건너뜀
• line reveal 중 입력이 다음 line까지 소비
• 대화 끝났는데 movement lock 유지
• dialogue 중 world object 클릭
• camera가 아직 이동 중인데 자막 시작
• speaker label과 실제 화자 불일치
• NPC mouth/gesture와 line timing 심각한 불일치
• line이 모바일에서 5줄
• subtitle이 문서/엽서 가림
• CH1~8에서 성 조기 노출
• 핵무기 직접 단어 조기 노출
• 중요한 퍼즐 정보를 대사 한 번에만 제공
• CH8 성공 직후 불길한 foreshadowing
• CH9 결과 중 NPC가 감정을 직접 설명
• CH10 전화 대사가 자동으로 너무 빨리 넘어감
• 수화기 투척 후 일반 dialogue box가 계속 화면 점유
• Final Archive가 dialogue UI로 표시

---

# 106. 금지사항

• 긴 비주얼노벨식 대화창
• 플레이어의 긴 독백
• 플레이어 이름 조기 표시
• 연구자 성 조기 표시
• 핵무기 정답을 대사로 설명
• 모든 문장 자동 진행
• 모든 문장 카메라 이동
• 모든 문장 gesture 강제
• 대사마다 UI beep
• 모든 감정에 `……`
• 모든 연구자 동일 말투
• George를 악당화
• CH8에 불길한 대사 추가
• CH9에 도덕 해설
• 전화 상대 정체 불필요하게 설명
• 엽서 reveal을 일반 자막창으로 처리
• 대화 중 state commit 남발
• dialogue callback에 chapter 로직 집중
• 대화 종료 후 control 복원 누락

---

# 107. 후속 문서와의 계약

## 06_NPC_CORE.md

NPC는 dialogue 상태, current speaker 여부, gaze target, held object 상태를 제공해야 한다.

---

## 07_NPC_MOVEMENT.md

NPC가 conversation spot에 도착한 뒤에만 dialogue start가 가능해야 한다.

---

## 08_NPC_GESTURE.md

본 문서의 gesture cue를 실제 animation으로 정의한다.

인물별 차이를 유지한다.

---

## 09_NPC_BLOCKING.md

대화 거리와 얼굴/손/오브젝트가 함께 보이는 공간을 확보한다.

---

## 10_ANIMATION_CORE.md

dialogue line cue와 object/camera/gesture sequence를 안정적으로 동기화해야 한다.

---

## 11_OBJECT_ANIMATION.md

dialogue object cue와 ownership 전환 시점을 일치시킨다.

---

## 21_AUDIO.md

voice/static/ambient가 subtitle과 충돌하지 않게 한다.

---

## 23_UI.md

speaker/subtitle/next indicator를 본 문서 규칙에 맞게 시각화한다.

---

## 26_TIMING_AND_PACING.md

manual line의 최소 hold, silent beat, forced pause, CH9/CH10 정적의 최종 시간을 확정한다.

---

## 27_MOBILE.md

NEXT 입력 영역과 subtitle safe area를 확정한다.

---

## 29_SPOILER_RULES.md

대사 전체의 이름/프로젝트/무기 관련 문자열을 별도로 감사한다.

---

# 108. 누적 검증 결과

05_DIALOGUE.md 작성 완료 시점 기준:

00_INDEX.md와 상충:
없음.

01_PLAYER.md와 상충:
없음.

02_CONTROL.md와 상충:
없음.

03_CAMERA.md와 상충:
없음.

04_INTERACTION.md와 상충:
없음.

현재까지 확정된 구조:

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
   ↓
05_DIALOGUE
```

대화 흐름:

```text
NPC interaction 성공
→ conversation spot 확인
→ playerState DIALOGUE
→ camera framing 완료
→ line 표시
→ 입력 gate
→ 한 입력당 한 line
→ gesture / object / camera cue
→ dialogue 완료
→ world state 또는 다음 playerState
→ control 명시적 복원
```

후속 `06_NPC_CORE.md`는 `00~05` 전체와 누적 상충 검토한다.

<!-- MERGED SOURCE END: 05_DIALOGUE.md -->


================================================================================
ORIGINAL SOURCE: 06_NPC_CORE.md
================================================================================

# 06_NPC_CORE.md

# NPC CORE SPECIFICATION

이 문서는 주요 NPC와 일반 연구자 NPC의 공통 데이터 구조, 정체성, 상태, 소유 오브젝트, 시선, 감정, 작업 상태, 대화 가능 여부, 챕터 참여 여부, 독립적 상태 관리, 등장/퇴장, 그룹 상태, 저장 가능한 핵심 상태를 정의한다.

이 문서는 NPC가 "어떻게 걷는가"보다 "NPC가 무엇인 상태인가"를 담당한다.

실제 이동은 `07_NPC_MOVEMENT.md`,
몸짓과 시선 애니메이션은 `08_NPC_GESTURE.md`,
공간 배치는 `09_NPC_BLOCKING.md`가 담당한다.

---

# 0. 누적 상충 검토

참조 문서:

• `00_INDEX.md`
• `01_PLAYER.md`
• `02_CONTROL.md`
• `03_CAMERA.md`
• `04_INTERACTION.md`
• `05_DIALOGUE.md`

---

## 0.1 00_INDEX.md와의 상충 검토

00_INDEX.md는 `06_NPC_CORE.md`의 책임 범위를 다음과 같이 정의한다.

• NPC 데이터
• 이름
• 현재 위치
• 현재 행동
• 감정
• 들고 있는 오브젝트
• 바라보는 대상
• 챕터 상태
• interaction 가능 여부

본 문서는 위 범위를 그대로 구체화한다.

다음 항목은 다른 문서가 최종 책임을 가진다.

• 실제 보행/경로/도착 → `07_NPC_MOVEMENT.md`
• gesture/표정/시선 보간 → `08_NPC_GESTURE.md`
• NPC와 플레이어 및 NPC 상호 간 배치 → `09_NPC_BLOCKING.md`
• 카메라 framing → `03_CAMERA.md`
• interaction candidate/거리 → `04_INTERACTION.md`
• 대사 내용 → `05_DIALOGUE.md`
• 애니메이션 실행 코어 → `10_ANIMATION_CORE.md`
• 시설 내 NPC 작업 위치 → `16_FACILITY_ARCHITECTURE.md`, `17_SPATIAL_LAYOUT.md`
• 저장 형식 → `25_SAVE_AND_RESUME.md`

상충 없음.

---

## 0.2 01_PLAYER.md와의 상충 검토

01_PLAYER.md는 다음을 요구한다.

• NPC는 플레이어를 통과하지 않음
• 대화 시 개인 공간 유지
• NPC가 출입문을 막지 않음
• NPC가 플레이어 spawn을 점유하지 않음
• CH8/CH9 다인원에서도 중앙 통로 유지
• NPC가 플레이어에게 문서를 제출하고 회수
• 연구자들이 플레이어의 판단을 기다리는 구조
• CH1~8 관계가 점차 변화
• CH9는 결과를 함께 목격
• CH10에는 연구시설 주요 NPC가 등장하지 않음

본 문서는 NPC core state가 위 요구를 지원하도록 정의한다.

상충 없음.

---

## 0.3 02_CONTROL.md와의 상충 검토

02_CONTROL.md는 다음을 요구한다.

• NPC 접근 중 interaction 무분별 실행 금지
• DIALOGUE 중 일반 interaction 차단
• 상태 전환 시 입력 누수 금지
• CH8 다인원에서도 interaction 대상 혼선 방지
• CH9 결과 재생 중 NPC interaction 금지

본 문서는 NPC별 `interactionState`와 `dialogueState`를 분리해 이를 지원한다.

상충 없음.

---

## 0.4 03_CAMERA.md와의 상충 검토

03_CAMERA.md는 다음을 요구한다.

• NPC가 대화 거리보다 너무 가까이 접근하지 않음
• NPC 얼굴/손/핵심 오브젝트를 함께 볼 수 있어야 함
• NPC head tracking이 camera를 기계적으로 1:1 추적하지 않음
• CH8에서 8명을 한 프레임에 억지로 우겨넣지 않음
• CH9에서 NPC 반응은 전광판 주변 시야에서 자연스럽게 보임
• camera safe radius 안으로 NPC root가 들어오지 않음

본 문서는 NPC core가 `lookTarget`, `conversationAnchor`, `occupiedZone`, `cameraRespect` 정보를 제공하도록 정의한다.

상충 없음.

---

## 0.5 04_INTERACTION.md와의 상충 검토

04_INTERACTION.md는 다음을 요구한다.

• NPC는 designated conversation spot 도착 후 interaction 활성
• NPC 접근 중 interaction 잠금
• 대화 종료 직후 반복 대화 재진입 방지
• NPC interaction은 line-of-sight와 거리 검사 통과
• CH8에서 Hans 중심 interaction
• CH9 결과 시작 후 NPC interaction 비활성
• interaction owner가 하나로 명확해야 함

본 문서는 이를 `interactionState`, `canTalk`, `busyReason`, `storyGate`로 지원한다.

상충 없음.

---

## 0.6 05_DIALOGUE.md와의 상충 검토

05_DIALOGUE.md는 다음을 요구한다.

• 8명의 주요 과학자는 First Name만 사용
• 플레이어는 `박사님`, `책임자`, `Director` 등으로 불림
• 주요 8명은 서로 다른 말투와 태도를 가짐
• 대화 시작 전 NPC가 준비된 상태여야 함
• speaker는 generic idle이 아니라 대화 전용 상태 사용
• dialogue line cue가 gesture/object/camera와 연동
• CH8에서 Hans가 다른 7명을 First Name으로 부를 수 있음
• CH9 결과 영상 중 주요 NPC 대사 없음
• 실제 역사 인물을 만화 캐릭터처럼 과장하지 않음

본 문서는 각 NPC에 독립 personality profile과 관계 상태를 정의해 이를 지원한다.

상충 없음.

---

# 1. NPC 설계의 기본 철학

NPC는 "챕터를 시작하는 클릭 가능한 사람"이 아니다.

주요 NPC는 실제로 시설 안에서:

• 기다린다.
• 걷는다.
• 서류를 든다.
• 장비를 본다.
• 플레이어를 본다.
• 자신의 작업으로 돌아간다.
• 반려 후 수정한다.
• 재제출한다.
• 다른 연구자와 같은 공간에 존재한다.
• 성공 장면과 결과 장면을 함께 겪는다.

따라서 각 NPC는 독립된 상태를 가진다.

금지:

```text
전체 NPC를 하나의 global state로 동시에 변경
```

예:

`allNPCs = "alarmed"`

같은 방식으로 모든 NPC가 똑같이 행동하지 않는다.

---

# 2. 주요 NPC 목록

고정 주요 인물:

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

Final Archive 이전 user-facing 표기:

```text
Richard
Enrico
Luis
John
George
Emilio
Kenneth
Hans
```

실제 성은 NPC core 내부 데이터에 저장할 수 있으나 일반 UI/API가 직접 반환하지 않는다.

---

# 3. 내부 identity와 공개 identity 분리

권장 구조:

```js
identity: {
  publicFirstName: "Richard",
  archiveFullName: "Richard P. Feynman",
  archiveUnlocked: false
}
```

user-facing 이름을 가져올 때:

```js
getDisplayName(npc)
```

를 사용.

CH1~8에서는 항상 `publicFirstName`.

Final Archive에서만 `archiveFullName`.

---

# 4. NPC 기본 데이터 구조

권장:

```js
{
  id: "npc_richard",

  identity: {
    publicFirstName: "Richard",
    archiveFullName: "Richard P. Feynman",
    archiveUnlocked: false
  },

  role: "MAJOR_SCIENTIST",

  chapterOwner: 1,

  transform: {
    position,
    rotation
  },

  locationId: "DIRECTOR_OFFICE",

  npcState: "IDLE",

  movementState: "STATIONARY",

  taskState: "WAITING",

  dialogueState: "NONE",

  interactionState: "DISABLED",

  emotionState: "NEUTRAL",

  gazeState: "AMBIENT",

  lookTarget: null,

  heldObjectId: null,

  occupiedAnchorId: null,

  destinationAnchorId: null,

  busyReason: null,

  currentSequenceId: null,

  storyFlags: {},

  relationship: {
    respect: 0,
    familiarity: 0
  },

  visualVariant: {},
  audioVariant: {}
}
```

모든 필드를 반드시 실시간 serialize할 필요는 없다.

core state와 transient state를 구분한다.

---

# 5. NPC 상태 계층

NPC 상태를 boolean 여러 개로 뒤섞지 않는다.

권장 계층:

```text
NPC STATE
MOVEMENT STATE
TASK STATE
DIALOGUE STATE
INTERACTION STATE
EMOTION STATE
GAZE STATE
```

각 계층은 서로 다른 의미를 가진다.

---

# 6. NPC STATE

가장 상위 상태.

권장:

```text
INACTIVE
SPAWNING
ACTIVE
BUSY
CINEMATIC
LEAVING
OFFSCREEN
```

---

## 6.1 INACTIVE

현재 chapter scene에 존재하지 않음.

mesh 자체를 생성하지 않을 수도 있다.

---

## 6.2 SPAWNING

scene에 등장 준비 중.

player가 보는 위치에서 갑자기 생성되지 않게 한다.

spawn point 또는 문 밖 hidden zone에서 생성 후 등장.

---

## 6.3 ACTIVE

일반적인 world NPC.

이 안에서 이동, 작업, 대화 가능.

---

## 6.4 BUSY

특정 story action 수행 중.

예:

• 문서 제출
• 문서 회수
• 장비 조작
• 의자에서 일어남
• 수정 작업

busy 중 일반 interaction 제한.

---

## 6.5 CINEMATIC

CH8 최종 성공,
CH9 결과 관람 등
sequence가 NPC를 직접 제어.

일반 autonomous behavior 중지.

---

## 6.6 LEAVING

scene 퇴장 중.

대화 interaction 비활성.

목적지까지 이동 후 OFFSCREEN.

---

## 6.7 OFFSCREEN

현재 chapter에는 논리적으로 존재하지만 화면 밖.

예:

Richard가 반려 후 계산실로 돌아가 수정 중.

mesh를 계속 유지할지 unload할지는 장면별 선택.

---

# 7. Movement State

이동 상태:

```text
STATIONARY
TURNING
WALKING
APPROACHING_PLAYER
MOVING_TO_TASK
MOVING_TO_EXIT
SEATED
TRANSITIONING_POSTURE
```

실제 보행 규칙은 `07_NPC_MOVEMENT.md`.

NPC core는 현재 의미만 보유.

---

# 8. Task State

현재 무엇을 하고 있는지.

공통:

```text
NONE
WAITING
WORKING
PRESENTING
REVIEW_WAIT
REVISING
RESUBMITTING
OBSERVING
RESTING
GROUP_MEETING
WATCHING_BOARD
```

챕터별 custom task는 허용.

예:

```text
CH06_MEASURING_SAMPLE
CH07_REVIEWING_INCIDENT_LOG
```

단, 모든 세부 animation을 task 이름으로 만들지 않는다.

---

# 9. Dialogue State

권장:

```text
NONE
AVAILABLE
STARTING
SPEAKING
WAITING_FOR_PLAYER
ENDING
COMPLETED
COOLDOWN
```

NPC core가 어떤 dialogue id를 현재 사용할 수 있는지도 보유.

예:

```js
activeDialogueId: "CH01_INTRO_RICHARD"
```

---

# 10. Interaction State

권장:

```text
DISABLED
AVAILABLE
FOCUSED
BUSY
LOCKED_BY_STORY
```

`AVAILABLE`일 때만 04_INTERACTION registry에 활성 target로 등록.

---

# 11. Emotion State

NPC의 감정을 숫자 하나로 통합하지 않는다.

공통 범주:

```text
NEUTRAL
FOCUSED
CONFIDENT
CURIOUS
DOUBTFUL
FRUSTRATED
DEFENSIVE
SURPRISED
CONCERNED
RELIEVED
TIRED
SATISFIED
CELEBRATORY
STUNNED
WITHDRAWN
```

이 state는 `08_NPC_GESTURE.md`가 gesture/pose를 선택하는 참고값.

---

# 12. Emotion State는 연기 지시이지 UI가 아니다

플레이어 화면에:

```text
GEORGE: FRUSTRATED
```

같이 표시하지 않는다.

개발/디버그에서만 가능.

---

# 13. Gaze State

권장:

```text
AMBIENT
PLAYER
OBJECT
NPC
WORK_SURFACE
BOARD
DOWN
AWAY
```

lookTarget은 실제 object/anchor.

---

# 14. 시선 우선순위

기본:

```text
CINEMATIC CUE
> DIALOGUE CUE
> TASK OBJECT
> PLAYER INTERACTION
> AMBIENT
```

같은 frame에 여러 시스템이 머리 방향을 서로 덮어쓰지 않게 한다.

---

# 15. NPC personality profile

주요 NPC마다 공통 구조 안에서 고유 차이를 정의한다.

예:

```js
personality: {
  gestureScale: 0.8,
  eyeContactFrequency: 0.7,
  idleMotionScale: 0.6,
  responseTempo: 0.9,
  personalSpace: 1.55
}
```

숫자는 최종 animation tuning 시 확정.

중요한 것은 모두 같은 preset을 쓰지 않는 것.

---

# 16. Richard 기본 성격

핵심:

• 반응이 빠름
• 손과 문서를 적극적으로 사용
• 오류 인식 후 방어보다 즉시 계산 문제로 전환
• 수정 후 약간 가벼운 안도
• player eye contact 비교적 높음

금지:

• 항상 농담
• 과도한 장난기
• ADHD처럼 산만한 움직임

---

# 17. Enrico 기본 성격

핵심:

• 차분
• 움직임 적음
• 칠판/자료와 플레이어를 번갈아 봄
• 실수를 인정할 때 감정 폭이 작지만 명확함
• 안정적 자세

---

# 18. Luis 기본 성격

핵심:

• 장비 쪽 시선 비중 높음
• 데이터/기계를 직접 만지는 행동 자연스러움
• 문제를 발견했을 때 빠르게 실무 행동
• player와 협력적 리듬

---

# 19. John 기본 성격

핵심:

• 몸짓 적음
• 시선 정확
• 문서나 시간 기록을 가리키는 작은 손 동작
• 말/행동 템포 짧고 정밀
• idle motion 가장 절제

---

# 20. George 기본 성격

핵심:

• 움직임이 크고 직접적
• 일정 압박 시 몸이 굳음
• 문서 회수 동작이 다른 NPC보다 빠르고 강함
• 수정 후 피로가 visible
• APPROVED 후 긴장 완화

금지:

• 위협
• 플레이어에게 공격적 접근
• 과도한 분노 animation
• 악당처럼 삿대질

---

# 21. Emilio 기본 성격

핵심:

• 관찰적
• 시료/계수기 쪽 시선 많음
• 미세한 불확실성을 이미 의식하고 있음
• REJECTED를 받아도 안도에 가까움
• player와 공동 확인하는 느낌

---

# 22. Kenneth 기본 성격

핵심:

• 현장 책임자다운 무게
• 자세가 단단함
• 사고 후 피로/압박감
• 보고서 지적 때 방어적이지만 감정 폭발 없음
• 최종 경고성 조언은 정면 eye contact

---

# 23. Hans 기본 성격

핵심:

• 종합자
• 침착
• 다른 연구자들을 자연스럽게 바라봄
• 그룹 공간에서 중심축
• CH8 오류가 누적될수록 말보다 작은 정지와 report closing이 중요
• CH9에서 플레이어를 한번 보는 행동이 강한 의미

---

# 24. 주요 NPC 외 일반 연구자

일반 연구자는 이름 없는 시설 인력을 표현.

역할:

• 공간이 실제로 일하는 곳처럼 보이게 함
• 작업량/진행 변화 표현
• CH2 논쟁
• CH7 경보 이동
• CH8 성공 분위기 보조

일반 연구자는 주요 8명보다 interaction priority가 낮다.

---

# 25. 일반 연구자 복제감 방지

동일 body mesh를 재사용해도 다음을 일부 변주.

• 키
• 어깨 폭
• 머리 형태
• 머리 색/스타일
• 셔츠/가운
• 안경
• 소매
• 들고 있는 물건
• idle pose

같은 모델을 위치만 바꿔 6명 복제한 느낌을 피한다.

---

# 26. NPC 독립성

각 NPC는 독립 상태를 가진다.

예:

```text
Richard = REVISING
Enrico = WORKING
Luis = OBSERVING
George = OFFSCREEN
```

가능해야 한다.

한 챕터 state 변경이 모든 NPC의 `emotionState`를 동일하게 바꾸지 않는다.

---

# 27. 그룹 event

여러 NPC가 같은 사건을 공유할 때도 각자 reaction profile 사용.

예:

CH9 첫 결과:

```text
Richard → STUNNED
Enrico → STUNNED
Luis → CONCERNED
John → STUNNED
George → WITHDRAWN
Emilio → STUNNED
Kenneth → WITHDRAWN
Hans → STUNNED
```

같은 상위 감정이어도 gesture가 다름.

---

# 28. NPC 소유 오브젝트

NPC는 `heldObjectId`를 최대 하나의 기본 hand-held object로 관리할 수 있다.

예:

• report
• binder
• clipboard
• chalk
• sample case

양손 상호작용이 필요한 경우 attachment set 확장 가능.

---

# 29. Object Ownership 규칙

04_INTERACTION.md와 동일.

한 오브젝트의 owner는 한 시점에 하나.

예:

Richard 계산철:

```text
RICHARD
→ HANDOFF
→ PLAYER
→ DESK
→ RICHARD
```

NPC core의 heldObjectId와 document ownership이 불일치하면 안 된다.

---

# 30. held object 검증

NPC가 문서를 들고 있다고 state에 기록됐는데 손에 mesh가 없거나,
반대로 손에 mesh가 있는데 owner가 DESK인 상태 금지.

animation 완료 후 consistency check 가능.

---

# 31. NPC occupied anchor

NPC가 현재 점유한 공간 anchor.

예:

```text
CH01_RICHARD_ENTRY
CH01_RICHARD_DESK
CH02_ENRICO_BOARD
CH08_HANS_CENTER
```

anchor는 NPC blocking/이동 시스템과 공유.

---

# 32. anchor reservation

NPC가 이동 목적지를 정하면 destination anchor를 RESERVED 처리.

두 NPC가 같은 anchor로 동시에 이동하지 않게 한다.

도착 후:

```text
RESERVED
→ OCCUPIED
```

떠날 때 해제.

---

# 33. conversation anchor

대화 시 NPC와 플레이어가 안전하게 설 수 있는 상대 배치점.

NPC core는:

```text
conversationAnchorId
```

를 참조할 수 있다.

실제 거리/좌표는 `09_NPC_BLOCKING.md`.

---

# 34. NPC가 플레이어를 막는 문제

주요 NPC가 플레이어 앞에 서야 하는 장면에서도:

• 출입문 정중앙 금지
• 좁은 복도 중앙 장기 정지 금지
• 책상과 벽 사이 유일한 통로 점유 금지

NPC core에:

```text
blockingCriticalPath: false
```

같은 validation metadata를 둘 수 있다.

---

# 35. NPC spawn 원칙

NPC는 다음 위치에서 생성하지 않는다.

• 플레이어 바로 앞
• 카메라가 직접 보고 있는 빈 공간
• 문 안쪽 절반
• 책상 내부
• 다른 NPC 내부
• interaction zone 위

가능:

• 문 밖 hidden point
• 코너 뒤
• 이미 방 안에 자연스럽게 서 있는 chapter start state

---

# 36. NPC despawn 원칙

NPC가 플레이어 시야 안에서 갑자기 사라지지 않는다.

퇴장:

• 문 밖
• 코너 뒤
• 충분한 occlusion 뒤

에서 OFFSCREEN 처리.

---

# 37. 반려 후 NPC 퇴장

CH1~7 기본 구조:

REJECTED
→ NPC 반응
→ 문서 회수
→ LEAVING
→ OFFSCREEN 또는 작업 공간으로 이동
→ REVISING

모든 NPC가 같은 문으로 같은 속도로 퇴장할 필요 없음.

---

# 38. 재제출 상태

수정 완료 후:

```text
REVISING
→ RESUBMITTING
```

그 뒤 장면별 방식.

CH1:
Richard가 다시 찾아옴.

CH5:
George는 플레이어에게 오지 않음.
플레이어가 그를 찾아감.

이 차이를 NPC core가 허용해야 한다.

---

# 39. 수정 몽타주 중 NPC

몽타주 중 npcState는 `CINEMATIC` 또는 `BUSY`.

taskState는 `REVISING`.

movement/gesture를 일반 autonomous system이 덮어쓰지 않게 한다.

---

# 40. NPC autonomous behavior

주요 story NPC에 복잡한 AI는 필요 없다.

기본 autonomous behavior:

• idle
• 작은 gaze 변화
• 작업 loop
• 지정 영역 내 제한적 task motion

스토리 sequence가 시작되면 즉시 제어권을 sequence에 넘김.

---

# 41. 무작위 wandering 금지

주요 NPC가 시설을 목적 없이 랜덤 배회하지 않는다.

이유:

• blocking 예측 불가
• 대화 위치 꼬임
• 문서 handoff 불안정
• 플레이어가 찾기 어려움
• 캐릭터성이 약해짐

모든 이동에는 목적지가 있다.

---

# 42. 일반 연구자 제한적 roaming

일반 연구자는 짧은 작업 동선 가능.

예:

책상 → 캐비닛
계측기 → 기록대

그러나 navmesh 랜덤 목적지 방식의 끝없는 배회는 피한다.

---

# 43. NPC busy reason

BUSY일 때 이유를 기록.

예:

```text
HANDING_DOCUMENT
RECLAIMING_DOCUMENT
OPERATING_MACHINE
REVISING
WATCHING_CINEMATIC
```

interaction reject debug에 활용.

---

# 44. NPC current sequence owner

여러 시스템이 같은 NPC를 동시에 움직이지 않게:

```text
currentSequenceId
```

사용.

예:

`CH05_REJECT_SEQUENCE`

활성 중 generic idle/task system은 해당 NPC transform을 직접 변경하지 않는다.

---

# 45. sequence ownership 우선순위

권장:

```text
CHAPTER CINEMATIC
> DIALOGUE SEQUENCE
> INTERACTION SEQUENCE
> TASK
> IDLE
```

상위 owner가 끝나야 하위 behavior 복구.

---

# 46. NPC state commit

animation 시작 순간 최종 상태로 바꾸지 않는다.

예:

걷기 시작:

```text
movementState = WALKING
```

도착 후:

```text
movementState = STATIONARY
occupiedAnchorId = destination
```

---

# 47. NPC 상태 실패 복구

이동/animation 실패 시:

• destination reservation 해제
• busy reason 정리
• nearest safe anchor로 복귀
• story sequence가 필요한 경우 safe checkpoint 사용

NPC가 벽 안 중간 위치에서 멈춰 interaction을 막지 않게 한다.

---

# 48. dialogue availability

대화 가능 조건은 최소:

```text
npcState === ACTIVE
movementState === STATIONARY
interactionState === AVAILABLE
dialogueState === AVAILABLE
busyReason === null
```

챕터별 gate 추가.

---

# 49. 대화 준비 자세

dialogue 시작 직전:

• current task 중지
• 손에 든 물건 상태 확인
• conversation anchor 정렬
• gaze target 설정
• dialogue-specific idle로 전환

그 뒤 DIALOGUE start.

---

# 50. dialogue 종료 후 NPC

대화 끝난 뒤 NPC가 무조건 freeze되지 않는다.

다음 task 명시.

예:

• wait for player inspect
• return to board
• take report
• leave room
• operate machine

---

# 51. NPC와 플레이어 관계값

필요하면 내부적으로:

```text
respect
familiarity
```

를 둘 수 있다.

그러나 RPG 수치처럼 player-facing 표시하지 않는다.

목적:

• gesture 강도
• eye contact
• 반응 tempo

변화를 약간 조정.

---

# 52. 관계값의 범용 시스템화 금지

CH1~8 전체를 호감도 게임으로 만들지 않는다.

플레이어 선택에 따라 연구자 관계가 크게 분기하지 않는다.

서사는 기본적으로 고정.

relationship 값은 연출 보조용.

---

# 53. CH1 Richard core arc

초기:

```text
emotion: CONFIDENT
task: PRESENTING
```

오류 지적:

```text
DOUBTFUL
→ FOCUSED
```

REJECTED:

```text
ACCEPTING / FOCUSED
```

수정:

```text
REVISING
```

재제출:

```text
CONFIDENT but more cautious
```

승인:

```text
SATISFIED
```

---

# 54. CH2 Enrico core arc

초기:

```text
FOCUSED
```

오래된 기준 지적:

```text
DOUBTFUL
→ CONCERNED
```

수정:

```text
WORKING
```

승인:

```text
RELIEVED / SATISFIED
```

---

# 55. CH3 Luis core arc

초기:

```text
CONFIDENT in data
```

reference clock 확인:

```text
SURPRISED
→ FOCUSED
```

수정:

```text
WORKING
```

승인:

```text
SATISFIED
```

---

# 56. CH4 John core arc

초기:

```text
FOCUSED
CONFIDENT
```

replacement log 확인:

```text
DOUBTFUL
→ ACCEPTING
```

수정/승인:

```text
FOCUSED
→ SATISFIED
```

큰 감정 animation 불필요.

---

# 57. CH5 George core arc

시험 직후:

```text
DEFENSIVE
```

편차 지적:

```text
FRUSTRATED
```

REJECTED:

```text
FRUSTRATED
→ WITHDRAWN
```

장시간 수정:

```text
TIRED
FOCUSED
```

재검토:

```text
DEFENSIVE but controlled
```

APPROVED:

```text
RELIEVED
SATISFIED
```

---

# 58. CH6 Emilio core arc

초기:

```text
CONCERNED
DOUBTFUL
```

반려:

```text
RELIEVED
```

수정:

```text
FOCUSED
```

승인:

```text
SATISFIED
```

---

# 59. CH7 Kenneth core arc

사고 직후:

```text
TIRED
CONCERNED
```

보고서 지적:

```text
DEFENSIVE
```

REJECTED:

```text
WITHDRAWN
→ FOCUSED
```

재작성 후:

```text
ACCEPTING
```

승인:

```text
SERIOUS / RESPECTFUL
```

---

# 60. CH8 Hans core arc

초기:

```text
FOCUSED
CONFIDENT
```

첫 오류:

```text
FOCUSED
```

두 번째:

```text
CONCERNED
```

마지막:

```text
TIRED
FOCUSED
```

재정리:

```text
REVISING
```

최종 승인:

```text
SATISFIED
```

CH8 성공 순간:

```text
CELEBRATORY
```

하지만 과장된 만세 animation 금지.

---

# 61. CH8 주요 NPC 전체 상태

최종 회의 시작 전:

```text
Richard   GROUP_MEETING
Enrico    GROUP_MEETING
Luis      GROUP_MEETING
John      GROUP_MEETING
George    GROUP_MEETING
Emilio    GROUP_MEETING
Kenneth   GROUP_MEETING
Hans      PRESENTING
```

interaction 중심은 Hans.

다른 7명은 story reaction target.

---

# 62. CH8 이름 호출 반응

Hans가:

`Richard의 계산.`

이라고 말하면 Richard가:

• 아주 작은 gaze
• 혹은 몸의 미세한 반응

정도.

각 이름마다 큰 제스처 금지.

---

# 63. CH8 수정 몽타주

8명 모두 독립 task.

예:

```text
Richard → calculator
Enrico → chalkboard
Luis → CRT
John → timing sheet
George → material specimen
Emilio → counter
Kenneth → incident report
Hans → compilation
```

한 animation preset을 복제하지 않는다.

---

# 64. CH8 성공

APPROVED 후:

• 일부 악수
• 작은 웃음
• 어깨 이완
• 서로 보는 시선

가능.

모든 NPC가 동시에 플레이어를 바라보며 박수치는 장면 금지.

---

# 65. CH9 시작 상태

CH8 성공의 여운.

NPC들은 소규모로 흩어져 있음.

예:

• Richard와 Enrico 짧은 대화
• George 의자나 테이블 근처
• Hans 중앙 전광판과 가까운 위치
• 나머지 연구자들은 주변

하지만 board view path를 막지 않음.

---

# 66. CH9 결과 실행 후

모든 주요 NPC:

```text
npcState = CINEMATIC
taskState = WATCHING_BOARD
interactionState = DISABLED
```

각자 board look target.

---

# 67. CH9 첫 번째 결과 반응

권장 개별 반응:

Richard:
• 웃음 사라짐
• 거의 정지

Enrico:
• board 응시
• 자세 변화 작음

Luis:
• 반 걸음 뒤
• 손 멈춤

John:
• 거의 움직임 없음

George:
• 시선 돌림
• 상체 약간 away

Emilio:
• 작은 fidget 중지

Kenneth:
• 앉거나 무게 중심 낮춤

Hans:
• board 응시 유지

---

# 68. CH9 두 번째 결과 반응

첫 번째보다 과한 새 animation을 추가하지 않는다.

이미 의미를 이해한 상태.

반응이 누적됨.

---

# 69. CH9 Hans 플레이어 시선

최종 구간:

Hans만 잠깐 player/camera를 봄.

조건:

• 길지 않음
• 고개를 극적으로 돌리지 않음
• 대사 없음

그 뒤 다시 board.

이 행동은 NPC core의 gaze state change로 명시.

---

# 70. CH9 blackout

조명이 꺼져도 NPC transform을 갑자기 삭제하지 않는다.

완전 black 뒤 page transition.

그 전에 mesh despawn이 보이지 않게 한다.

---

# 71. CH10에서 주요 NPC

CH10 HOME에는 주요 연구시설 NPC mesh를 등장시키지 않는다.

전화 상대도 8명 중 하나로 확정하지 않는다.

Final Archive에서만 프로필/과거 flashback으로 다시 등장.

---

# 72. NPC visual identity

8명은 First Name만 공개되어도 서로 쉽게 구별되어야 한다.

필수 차이:

• 얼굴 실루엣
• 머리
• 안경 여부
• 체형
• 키
• 옷 variation
• posture
• gesture tempo

색상만 바꾼 동일 인물처럼 보이지 않게 한다.

---

# 73. 실제 인물 likeness

최종 구현에서 실제 역사 인물을 어느 정도 닮게 할지 `22_VISUAL_STYLE.md`와 archive 이미지 정책이 결정.

공통 NPC core에서는:

• caricature 금지
• 과도한 사실적 얼굴 때문에 uncanny valley가 심하면 단순화 가능
• 8명의 구분 가능성이 우선

---

# 74. NPC 이름표

시설 내 물리 명찰을 사용할 경우 First Name 또는 검열된 형태.

예:

```text
RICHARD ███████
```

실제 surname texture 조기 노출 금지.

---

# 75. NPC interaction label

04_INTERACTION 규칙 준수.

예:

```text
Richard
```

또는:

```text
대화
```

금지:

```text
Richard Feynman과 대화
```

---

# 76. NPC voice identity

실제 voice acting이 있다면 8명 모두 같은 TTS voice를 쓰지 않는다.

차이는:

• 속도
• 톤
• 호흡
• 억양

하지만 과장된 캐릭터 성우 연기는 피한다.

세부는 `21_AUDIO.md`.

---

# 77. NPC idle system

idle은 상태별.

예:

WORKING:
작업 object 중심.

WAITING:
작은 posture shift.

DIALOGUE:
speaker-specific subtle idle.

WATCHING_BOARD:
거의 움직임 없음.

모든 상태에서 같은 breathing/arm loop 금지.

---

# 78. NPC idle randomization

같은 idle을 완벽히 같은 주기로 반복하지 않게 약간의 variation 가능.

하지만 story cue 직전 random gesture가 들어와 sequence를 방해하지 않게 한다.

story sequence 시작 시 idle 즉시 clean transition.

---

# 79. NPC physical bounds

NPC는 최소:

• body collision volume
• interaction proxy
• camera-safe head volume

개념을 구분.

실제 수치는 `18_COLLISION_AND_CLEARANCE.md`.

---

# 80. NPC가 의자에 앉는 상태

`SEATED`는 단순 Y좌표를 낮추는 것이 아니다.

필요:

• 지정 seat anchor
• 의자 orientation
• knee/table clearance
• 손 위치
• 일어날 때 앞쪽 공간

세부는 movement/blocking.

---

# 81. NPC와 책상

책상에서 작업할 때:

• torso가 desk edge를 관통하지 않음
• 손이 work surface에 닿을 수 있음
• 서류와 손이 깊게 겹치지 않음
• 의자 seated pose면 다리가 desk 내부로 들어가지 않음

NPC core는 work anchor를 제공.

---

# 82. NPC와 문

NPC 이동 target이 문을 통과할 경우:

• door state 확인
• door traversal owner 확인
• 한 번에 여러 NPC가 문 좁은 곳에 겹치지 않음

문을 자동으로 통과하는 ghost behavior 금지.

실제 규칙은 `07_NPC_MOVEMENT.md`.

---

# 83. NPC와 player blocking conflict

player가 NPC destination을 점유할 수 있다.

이 경우:

• NPC가 player 내부까지 이동하지 않음
• near-safe waiting point 사용
• player가 비키면 진행
• story-critical이면 작은 blocking cue 사용

NPC가 player를 밀어내는 physics는 기본적으로 사용하지 않는다.

---

# 84. NPC끼리 destination conflict

두 NPC가 같은 destination/door에 접근.

해결:

• anchor reservation
• priority
• wait position

한 NPC가 다른 NPC 내부를 통과하지 않는다.

---

# 85. story-critical NPC priority

중요 sequence 중 main NPC가 우선.

예:

CH2 Enrico가 칠판으로 이동할 때 일반 연구자가 길을 막으면 일반 NPC가 양보.

CH8 Hans가 final report를 가져올 때 중앙 path 확보.

---

# 86. 일반 NPC 자동 양보

일반 NPC는 story-critical path를 감지하면:

• 가까운 side anchor
• work anchor

로 이동 가능.

플레이어 눈앞에서 순간이동 금지.

---

# 87. NPC life continuity

한 챕터의 주요 NPC는 자신 차례가 끝났다고 완전히 사라지는 느낌을 줄이지 않는다.

가능하면 다음 챕터에서도:

• 먼 배경
• 작업실
• 회의

에 제한적으로 보일 수 있다.

단, 챕터별 HTML 구조이므로 각 페이지에서 논리적으로 재구성.

---

# 88. chapter HTML 간 NPC 재구성

NPC의 정확한 직전 world transform을 저장할 필요 없음.

다음 chapter 시작 시:

• chapter 기준 canonical position
• 관계/스토리 핵심 flag
• 승인 완료 상태

를 반영해 재생성.

페이지 전환이 자연스럽게 보이도록 blackout/fade 사용.

---

# 89. 저장할 NPC 상태

기본 저장 후보:

```text
chapter-specific completion
approved/rejected milestone
relationship milestone
archive identity unlocked
special story flag
```

저장하지 않는 transient:

• 현재 걷기 frame
• head rotation
• exact idle phase
• current foot position
• current gesture progress

---

# 90. NPC state versioning

save 구조 변경 가능성을 고려해 NPC 전체 객체를 그대로 JSON dump하지 않는다.

필요한 milestone만 저장.

세부는 `25_SAVE_AND_RESUME.md`.

---

# 91. NPC debug 정보

개발 모드:

```text
NPC: Richard
npcState: ACTIVE
movement: STATIONARY
task: REVIEW_WAIT
dialogue: AVAILABLE
interaction: AVAILABLE
emotion: CONFIDENT
gaze: PLAYER
held: ch01_calc_binder
anchor: ch01_richard_desk
sequence: none
```

확인 가능.

---

# 92. NPC state validator

개발 중 다음 모순 검사.

예:

```text
OFFSCREEN + interaction AVAILABLE
LEAVING + dialogue SPEAKING
heldObjectId 존재 + owner가 다른 NPC
SEATED + movement WALKING
CINEMATIC + autonomous task movement
```

발견 시 warning.

---

# 93. NPC object validator

문서를 든 상태:

• object exists
• object parent/anchor 일치
• ownership 일치

문서 회수 완료:

• player/desk interaction disable
• heldObjectId NPC로 전환

---

# 94. NPC anchor validator

anchor 점유 시:

• 다른 NPC occupant 없음
• geometry 내부 아님
• door sweep zone 아님
• player spawn 아님
• camera safe zone 침범하지 않음

---

# 95. NPC story gate

각 NPC interaction은 chapter phase 기반.

예:

Richard:

```text
CH01_INTRO
→ dialogue available

CH01_INVESTIGATION
→ interaction limited

CH01_REJECT_READY
→ reaction available

CH01_REVISING
→ offscreen

CH01_RESUBMISSION
→ available
```

NPC 자체가 chapter 전체 흐름을 결정하지 않는다.

chapter state가 상위.

---

# 96. NPC core와 chapter state 관계

우선순위:

```text
CHAPTER STATE
↓
NPC CORE STATE
↓
MOVEMENT / GESTURE / DIALOGUE / INTERACTION
```

NPC가 독립 상태를 가지지만 chapter narrative를 역전시키지 않는다.

---

# 97. NPC가 스스로 스토리를 진행하지 않기

idle timer가 끝났다고 자동으로 다음 story phase로 넘어가지 않는다.

스토리 전환은:

• player action
• dialogue completion
• chapter event
• explicit cinematic cue

중 하나.

---

# 98. NPC interaction 범위 남발 금지

주요 NPC라고 모든 chapter에서 항상 클릭 가능한 것은 아니다.

의미 있는 대화가 없으면:

• interaction disabled
• 또는 아주 짧은 ambient response

로 제한.

동일 dialogue 반복 금지.

---

# 99. NPC ambient dialogue 상태

일반/주요 NPC ambient line은 별도.

```text
ambientDialogueEnabled
ambientCooldown
```

story dialogue와 충돌하면 story dialogue 우선.

---

# 100. NPC가 플레이어를 항상 쳐다보지 않기

플레이어가 방에 있다고 모든 NPC가 camera를 추적하면 비현실적.

기본:

• 자기 작업
• 주변 동료
• 장비

를 봄.

플레이어가 가까이 접근하거나 story cue가 있을 때만 gaze PLAYER.

---

# 101. NPC notice radius

필요시 player proximity에 따른 notice 가능.

하지만 stealth AI가 아니다.

예:

플레이어가 2m 내 접근
→ NPC가 잠깐 glance.

그 이상 복잡한 perception system 불필요.

---

# 102. NPC personal space

주요 NPC마다 slight variation 가능.

George:
조금 넓음.

Richard:
조금 좁음.

John:
정확한 정지 거리.

하지만 극단 차이 금지.

최종 수치는 blocking 문서.

---

# 103. NPC 반응 지연

NPC가 player interaction 즉시 0프레임으로 고개를 돌리지 않는다.

작은 reaction delay 가능.

인물별 tempo 차이.

세부는 gesture/timing.

---

# 104. CH5 George 재제출 예외

George는 수정 후 플레이어에게 직접 찾아오지 않는다.

따라서 NPC core:

```text
taskState = WORKING
interactionState = AVAILABLE
locationId = MATERIAL_TEST_ROOM
```

플레이어가 찾아가야 함.

이것은 CH1~4의 `RESUBMITTING → approach player` 공통 패턴의 명시적 변주다.

---

# 105. CH6 Emilio 야간 상태

CH6에서는 다른 주요 NPC 대부분:

• OFFSCREEN
• 또는 먼 work area에서 비활성

Emilio가 중심.

시설이 비어 보이지만 완전히 텅 빈 게임맵처럼 보이지 않게 소수 일반 연구자 가능.

---

# 106. CH7 경보 상태

일반 NPC:

• alarm reaction
• 지정 evacuation/work positions로 이동

Kenneth:

• test control room에 유지
• player interaction 준비

모두 같은 방향으로 달리는 군중 animation 금지.

---

# 107. CH8 그룹 meeting

8명 모두 명확한 occupied anchor.

서로 최소 거리 확보.

중앙 report/table 주변.

player route 확보.

NPC core는 그룹 id를 가질 수 있다.

```text
groupId = "CH08_FINAL_REVIEW"
```

---

# 108. CH9 group watch

```text
groupId = "CH09_BOARD_WATCH"
```

하지만 한 줄로 균등 배치하지 않는다.

깊이와 시야를 가진 여러 anchor 사용.

---

# 109. NPC celebration 제한

CH8 최종 성공:

허용:

• small handshake
• shoulder release
• smile
• quiet conversation
• brief laugh

금지:

• 점프
• 환호 군중
• 박수 loop
• 주인공을 둘러싸고 찬양

전체 톤 유지.

---

# 110. CH9 감정 반응 제한

CH9에서 과도한 오열/무릎 꿇기 등 금지.

감정은 절제된 신체 반응.

플레이어가 해석하도록 둔다.

---

# 111. NPC 상태와 음향

NPC가 들고 있는 물건/작업에 따라 sound emitter 변경 가능.

예:

Luis near CRT
Emilio counter
George test room

하지만 NPC 자체에 ambient machine sound를 parent하지 않는다.

실제 장비가 sound source.

---

# 112. NPC physical sound

NPC 행동 소리:

• 발걸음
• 의자
• 종이
• 옷 움직임

인물별 약간의 차이 가능.

세부는 `21_AUDIO.md`.

---

# 113. NPC performance budget

8명 주요 NPC가 동시에 등장하는 CH8/CH9가 최악 조건.

따라서 NPC core는 LOD/animation update 정책과 호환되어야 한다.

예:

• 멀리 있는 일반 NPC head tracking 저빈도
• offscreen NPC animation update 축소
• 주요 8명은 유지

세부는 `28_PERFORMANCE.md`.

---

# 114. NPC animation rig 요구

공통적으로 최소:

• root
• torso
• head
• upper arms
• forearms/hands
• legs

정도의 분리가 있으면 gesture 다양성 확보.

완전한 고급 humanoid rig는 필수 아님.

---

# 115. NPC hand anchors

최소:

```text
leftHandAnchor
rightHandAnchor
```

문서/도구 attachment용.

held object가 손에서 붕 뜨지 않게 chapter별 grip offset 제공.

---

# 116. NPC head target anchor

NPC가 플레이어를 바라볼 기준은 camera center보다 약간 낮은 player head/chest target을 사용할 수 있다.

정확한 방식은 gesture 문서.

목표:

눈이 camera lens를 기계적으로 추적하는 느낌 감소.

---

# 117. NPC work anchors

장비 작업용:

```text
workAnchor
leftHandWorkAnchor
rightHandWorkAnchor
lookWorkTarget
```

가능.

예:

Luis CRT,
Emilio counter,
Richard calculator.

---

# 118. NPC posture continuity

서서 대화 후 갑자기 앉은 상태로 snap 금지.

상태 전환:

```text
STATIONARY
→ TRANSITIONING_POSTURE
→ SEATED
```

반대도 동일.

---

# 119. NPC emotion continuity

감정도 0프레임 전환 금지.

예:

CONFIDENT
→ 오류 발견
→ SATISFIED

직접 점프하지 않고:

CONFIDENT
→ DOUBTFUL
→ FOCUSED

같은 의미 흐름.

실제 보간은 gesture system.

---

# 120. NPC gaze continuity

BOARD를 보다가 PLAYER를 볼 때:

• torso/head 자연스러운 시간차
• 즉시 120° snap 금지

core는 target change event만 제공.

---

# 121. NPC replay 안정성

scene을 safe checkpoint에서 다시 시작해도 NPC canonical state가 재구성 가능해야 한다.

예:

CH1 resubmission checkpoint:

Richard:
• ACTIVE
• RESUBMITTING
• corrected binder held
• designated entry anchor

이렇게 명시적 상태로 spawn.

---

# 122. NPC가 중간 animation 상태로 저장되지 않기

금지 save 예:

```text
Richard walking 47%
hand rotation 31°
```

페이지 reload 시 이런 값을 복원하지 않는다.

---

# 123. NPC source of truth

위치/상태에 대해 여러 시스템이 각각 별도 값을 갖지 않는다.

예:

`npc.userData.state`
`GAME.richardState`
`dialogue.richardBusy`
`movement.richardMode`

가 서로 독립적으로 진실을 갖는 구조 금지.

NPC core object가 source of truth.

---

# 124. NPC state event

권장 이벤트:

```text
NPC_STATE_CHANGED
NPC_TASK_CHANGED
NPC_DIALOGUE_AVAILABLE
NPC_INTERACTION_CHANGED
NPC_OBJECT_ATTACHED
NPC_OBJECT_RELEASED
NPC_ANCHOR_CHANGED
NPC_EMOTION_CHANGED
NPC_GAZE_CHANGED
```

후속 시스템이 필요 시 구독.

---

# 125. event 순환 호출 방지

예:

NPC emotion change
→ gesture
→ gesture completion
→ emotion change
→ gesture...

같은 무한 loop 금지.

core state와 presentation layer 분리.

---

# 126. NPC 초기화 순서

권장:

```text
1. identity/config
2. mesh/rig
3. transform
4. chapter canonical state
5. object attachments
6. anchor registration
7. interaction state
8. idle/task presentation
```

interaction을 mesh 준비 전 활성화하지 않는다.

---

# 127. NPC 제거 순서

```text
1. interaction disable
2. dialogue cancel/complete
3. sequence owner release
4. object ownership 정리
5. anchor release
6. event listener cleanup
7. mesh dispose/unload
```

페이지/scene 전환 시 메모리 누수 방지.

---

# 128. NPC 생성 실패

특정 NPC asset 생성 실패 시 story-critical chapter가 진행 불가능할 수 있다.

개발 환경에서는 즉시 error.

배포 환경에서 무음으로 NPC 없이 계속 진행하지 않는다.

가능한 fallback mesh를 제공하는 것이 안전.

---

# 129. NPC object missing fallback

문서 mesh가 누락됐는데 NPC가 빈손으로 `offer_document`하는 장면 금지.

sequence 시작 전 dependency validation.

missing이면 story action을 시작하지 않고 복구.

---

# 130. NPC와 spoiler 검사

NPC 내부 archiveFullName이 user-facing으로 새지 않게 다음 경로 검사.

• interaction label
• debug overlay production build
• DOM id visible text
• canvas label
• nameplate texture
• subtitles
• save slot UI

---

# 131. NPC core 금지사항

• 8명 주요 NPC를 하나의 generic researcher prefab state로만 처리
• 모든 NPC가 chapter마다 같은 감정 상태
• random roaming
• player/NPC 관통
• door 중앙 장기 점유
• player spawn 점유
• interaction 중 NPC 계속 걷기
• dialogue 중 generic work loop
• 모든 NPC가 항상 player 응시
• 문서를 실제 ownership 없이 손에 붙였다 떼기
• 같은 anchor에 두 NPC 배치
• 시야 안에서 갑자기 spawn/despawn
• CH8 8명 일렬 배치
• CH9 8명 동일 reaction
• George 악당화
• 실제 surname 조기 표시
• exact animation frame 저장
• 여러 시스템이 NPC state를 따로 관리

---

# 132. 후속 문서와의 계약

## 07_NPC_MOVEMENT.md

본 문서의:

• movementState
• occupiedAnchorId
• destinationAnchorId
• anchor reservation
• LEAVING/OFFSCREEN
• player/NPC conflict
• door traversal

을 실제 이동 규칙으로 구현한다.

---

## 08_NPC_GESTURE.md

본 문서의:

• emotionState
• gazeState
• personality
• held object
• dialogue cue

를 실제 자세/gesture로 변환한다.

---

## 09_NPC_BLOCKING.md

본 문서의:

• conversation anchor
• work anchor
• group id
• personal space
• critical path

를 실제 공간 좌표와 배치 규칙으로 확정한다.

---

## 10_ANIMATION_CORE.md

NPC sequence owner와 animation transaction을 안전하게 관리해야 한다.

---

## 11_OBJECT_ANIMATION.md

heldObjectId와 ownership 전환 시점이 NPC 손 animation과 일치해야 한다.

---

## 16_FACILITY_ARCHITECTURE.md

각 NPC의 논리적 작업 공간과 이동 연결을 제공한다.

---

## 18_COLLISION_AND_CLEARANCE.md

NPC body bounds, head safe volume, anchor clearance의 최종값을 확정한다.

---

## 25_SAVE_AND_RESUME.md

transient animation state가 아닌 milestone 기반 NPC 상태만 저장한다.

---

## 28_PERFORMANCE.md

CH8/CH9 8명 동시 등장과 일반 연구자까지 고려한 update budget을 정한다.

---

# 133. 누적 검증 결과

06_NPC_CORE.md 작성 완료 시점 기준:

00_INDEX.md와 상충:
없음.

01_PLAYER.md와 상충:
없음.

02_CONTROL.md와 상충:
없음.

03_CAMERA.md와 상충:
없음.

04_INTERACTION.md와 상충:
없음.

05_DIALOGUE.md와 상충:
없음.

현재까지 확정된 구조:

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
   ↓
05_DIALOGUE
   ↓
06_NPC_CORE
```

핵심 NPC 계약:

```text
CHAPTER STATE
↓
NPC CORE STATE
↓
MOVEMENT / TASK / DIALOGUE / INTERACTION / EMOTION / GAZE
↓
MOVEMENT · GESTURE · BLOCKING · ANIMATION 시스템
```

8명의 주요 NPC는 공통 시스템을 공유하되
각자의 상태, 성격, 작업, 반응, 오브젝트, 위치를 독립적으로 가진다.

후속 `07_NPC_MOVEMENT.md`는 `00~06` 전체와 누적 상충 검토한다.

<!-- MERGED SOURCE END: 06_NPC_CORE.md -->


================================================================================
ORIGINAL SOURCE: 07_NPC_MOVEMENT.md
================================================================================

# 07_NPC_MOVEMENT.md

# NPC MOVEMENT SPECIFICATION

이 문서는 주요 NPC와 일반 연구자 NPC의 실제 이동, 회전, 접근, 정지, 퇴장, 재등장, 작업 위치 이동, 착석/기립 전후 이동, 문 통과, anchor reservation, 플레이어 및 다른 NPC와의 충돌 회피, story-critical path 우선순위, 다인원 이동, 이동 실패 복구를 정의한다.

이 문서는 `06_NPC_CORE.md`의 movementState와 anchor state를 실제 공간 움직임으로 구현하기 위한 규칙이다.

---

# 0. 누적 상충 검토

참조 문서:

• `00_INDEX.md`
• `01_PLAYER.md`
• `02_CONTROL.md`
• `03_CAMERA.md`
• `04_INTERACTION.md`
• `05_DIALOGUE.md`
• `06_NPC_CORE.md`

---

## 0.1 00_INDEX.md와의 상충 검토

00_INDEX.md는 `07_NPC_MOVEMENT.md`의 책임 범위를 다음과 같이 정의한다.

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

본 문서는 위 범위를 그대로 구체화한다.

다음 항목은 다른 문서가 최종 책임을 가진다.

• NPC의 상위 상태/감정/소유물 → `06_NPC_CORE.md`
• 실제 손짓/시선/자세 연기 → `08_NPC_GESTURE.md`
• 공간별 정확한 standing anchor와 사람 간 간격 → `09_NPC_BLOCKING.md`
• player collider와 실제 clearance 최종 수치 → `18_COLLISION_AND_CLEARANCE.md`
• 시설의 실제 방/복도 구조 → `16_FACILITY_ARCHITECTURE.md`, `17_SPATIAL_LAYOUT.md`
• 문 오브젝트의 실제 회전/충돌 → `11_OBJECT_ANIMATION.md`, `18_COLLISION_AND_CLEARANCE.md`
• animation tween 실행 코어 → `10_ANIMATION_CORE.md`

상충 없음.

---

## 0.2 01_PLAYER.md와의 상충 검토

01_PLAYER.md는 다음을 요구한다.

• NPC와 플레이어는 서로 통과하지 않음
• NPC가 출입문을 장기 점유하지 않음
• player spawn을 점유하지 않음
• CH8/CH9 다인원에서도 중앙 통로 유지
• NPC가 플레이어에게 접근할 때 valid conversation spot 사용
• 플레이어가 NPC 뒤에 갇히는 dead-end 배치 금지
• story 장면을 위해 플레이어를 밀어내는 physics를 기본 사용하지 않음

본 문서는 NPC 이동이 위 요구를 만족하도록 정의한다.

상충 없음.

---

## 0.3 02_CONTROL.md와의 상충 검토

02_CONTROL.md는 NPC가 접근 중일 때 interaction을 성급히 시작하지 않도록 요구한다.

본 문서는:

`APPROACHING_PLAYER`
→ 목적지 도착
→ `STATIONARY`
→ interaction 활성

순서를 고정한다.

이동 중 player input 자체는 story 상황에 따라 유지할 수 있지만,
대화 시작 전에는 NPC가 안정된 위치에 있어야 한다.

상충 없음.

---

## 0.4 03_CAMERA.md와의 상충 검토

03_CAMERA.md는 다음을 요구한다.

• NPC가 camera safe radius 안으로 들어오지 않음
• 대화 거리 약 1.4~1.8m 권장
• 이동 중 NPC를 camera가 lock-on처럼 과도하게 추적하지 않음
• CH8/CH9 다인원에서도 프레이밍 가능한 배치
• 카메라 close-up path와 NPC 이동 path가 충돌하지 않음

본 문서는 NPC의 도착 anchor와 이동 경로가 camera-safe 조건을 만족하도록 한다.

상충 없음.

---

## 0.5 04_INTERACTION.md와의 상충 검토

04_INTERACTION.md는 다음을 요구한다.

• designated conversation spot 도착 후 interaction 활성
• 접근 중 interaction 잠금
• 문 traversal 중 door state/clearance 확인
• player가 story-critical destination을 막고 있을 때 NPC가 player 내부로 이동하지 않음
• anchor reservation 사용
• interaction zone을 NPC가 장기 점유하지 않음

본 문서는 이를 실제 이동 규칙으로 구현한다.

상충 없음.

---

## 0.6 05_DIALOGUE.md와의 상충 검토

05_DIALOGUE.md는 다음을 요구한다.

• 대화 시작 전에 NPC가 준비된 위치/자세에 있어야 함
• 대화 중 큰 이동은 FOCUS/CINEMATIC 전환으로 처리
• 대화 종료 후 다음 task를 명시
• NPC가 걸으면서 generic dialogue를 계속하지 않음
• CH8/CH9 인물들의 위치 변화가 대사와 맞아야 함

본 문서는 대화 중 보행을 기본적으로 금지하고,
필요한 이동은 dialogue block 사이의 movement cue로 분리한다.

상충 없음.

---

## 0.7 06_NPC_CORE.md와의 상충 검토

06_NPC_CORE.md는 movementState를 다음과 같이 정의했다.

```text
STATIONARY
TURNING
WALKING
APPROACHING_PLAYER
MOVING_TO_TASK
MOVING_TO_EXIT
SEATED
TRANSITIONING_POSTURE
```

본 문서는 위 state 이름을 그대로 사용한다.

또한 다음을 유지한다.

• occupiedAnchorId
• destinationAnchorId
• anchor reservation
• LEAVING / OFFSCREEN
• random roaming 금지
• 일반 연구자도 목적 있는 짧은 이동만
• story-critical NPC priority
• player destination conflict 처리
• NPC끼리 destination conflict 처리
• 이동 frame 저장 금지

상충 없음.

---

# 1. NPC 이동의 기본 철학

NPC 이동은 “빈 공간에서 목적지까지 직선 tween”이 아니다.

모든 이동은 실제 사람이 공간 안에서 수행한다고 가정한다.

반드시 고려:

• 출발 자세
• 회전 방향
• 첫 발
• 가속
• 보행 속도
• 장애물
• 다른 사람
• 문
• 가구
• 목적지 접근 각도
• 감속
• 정지
• 최종 몸 방향
• 다음 행동

NPC는 이동 시작과 끝만 맞으면 되는 물체가 아니다.

---

# 2. 이동은 목적 기반

NPC 이동은 항상 목적을 가진다.

예:

```text
APPROACH_PLAYER
GO_TO_WORKSTATION
GO_TO_BOARD
LEAVE_ROOM
RETURN_WITH_DOCUMENT
MOVE_TO_MEETING_POSITION
MOVE_TO_BOARD_WATCH_POSITION
```

금지:

• random destination
• 방 안 무작위 배회
• 일정 시간마다 임의 방향 전환

---

# 3. 이동 요청 구조

권장:

```js
requestNpcMove(npcId, {
  destinationAnchorId,
  movementIntent,
  faceOnArrival,
  speedProfile,
  routeProfile,
  priority,
  sequenceOwner
});
```

destination은 raw world 좌표보다 anchor를 우선한다.

---

# 4. movement intent

권장:

```text
APPROACH_PLAYER
TASK
EXIT
RETURN
MEETING
BOARD_WATCH
YIELD
EMERGENCY
```

같은 걷기라도 intent에 따라 속도와 posture가 달라질 수 있다.

---

# 5. 이동 state 흐름

일반 이동:

```text
STATIONARY
→ TURNING
→ WALKING
→ STATIONARY
```

플레이어 접근:

```text
STATIONARY
→ TURNING
→ APPROACHING_PLAYER
→ STATIONARY
```

작업 이동:

```text
STATIONARY
→ TURNING
→ MOVING_TO_TASK
→ STATIONARY
```

퇴장:

```text
STATIONARY
→ TURNING
→ MOVING_TO_EXIT
→ OFFSCREEN
```

---

# 6. 걷기 시작 전 회전

NPC가 목적지와 반대 방향을 보고 있을 때 바로 옆으로 미끄러지며 걷지 않는다.

먼저 몸을 목적 방향으로 돌린다.

권장:

• 25° 이하: 걷기와 동시에 작은 회전 가능
• 25°~90°: 짧은 turn-in-place 후 이동
• 90° 이상: 명확한 turn animation 후 이동

정확한 각도는 rig와 animation 품질에 따라 조정 가능.

---

# 7. 급격한 180° 회전 금지

NPC가 즉시 180° snap하지 않는다.

최소한:

• 몸통 회전
• 발 방향 변화
• 머리/시선 후행

이 있어야 한다.

실제 gesture 세부는 `08_NPC_GESTURE.md`.

---

# 8. 보행 속도

기본 연구시설 보행:

```text
약 1.05 ~ 1.35 m/s
```

상황별:

일반 업무:
`1.0~1.2 m/s`

급한 이동:
`1.3~1.6 m/s`

CH7 경보:
`1.4~1.8 m/s`

느린 피로 상태:
`0.8~1.0 m/s`

정확한 값은 scene scale 검증 후 조정.

NPC마다 완전히 같은 속도를 사용하지 않는다.

---

# 9. 가속/감속

0→full speed instant 금지.

보행 시작:

약 `0.15~0.30s` 가속.

도착 전:

마지막 약 `0.25~0.45m`에서 감속.

목표:

발이 멈췄는데 root가 미끄러지는 느낌을 줄임.

---

# 10. root motion과 procedural movement

실제 root-motion clip을 사용하든 procedural 이동을 사용하든 결과는 동일해야 한다.

필수:

• 발이 바닥에서 과도하게 미끄러지지 않음
• 보행 속도와 animation cycle 일치
• 도착점 overshoot 없음

기술 방식은 구현 선택.

---

# 11. 보행 중 회전

큰 회전을 한 프레임에 처리하지 않는다.

곡선 경로에서는 진행 방향에 맞춰 점진적으로 회전.

회전 속도 권장 범위:

```text
120°~220° / sec
```

상황에 따라 조정.

George와 Kenneth처럼 무게감 있는 인물은 조금 느릴 수 있음.

---

# 12. 경로 표현

NPC 이동은 최소 waypoint path를 사용할 수 있다.

예:

```text
START
→ DOOR_APPROACH
→ DOOR_CROSS
→ HALL_CORNER
→ DESTINATION
```

가구가 있는 방에서 시작→끝 직선 tween 금지.

---

# 13. 복잡한 navmesh 필요성

전체 자유 AI navigation이 필요한 게임은 아니다.

따라서 모든 챕터에 대형 navmesh 시스템을 반드시 도입할 필요 없음.

권장:

• authored anchor
• authored waypoint
• 간단한 local avoidance
• clearance validation

스토리 중심 이동에는 이 방식이 더 안정적.

---

# 14. 이동 anchor 종류

권장:

```text
SPAWN
WAIT
WORK
CONVERSATION
DOOR_APPROACH
DOOR_CROSS
EXIT
MEETING
BOARD_WATCH
YIELD
SEAT
```

각 anchor는 용도가 명확해야 한다.

---

# 15. anchor 데이터

권장:

```js
{
  id: "ch01_richard_desk",
  position,
  facing,
  type: "CONVERSATION",
  radius: 0.35,
  occupancy: "EMPTY",
  allowedNpcIds: ["npc_richard"]
}
```

---

# 16. anchor reservation

NPC가 이동 시작하기 전 destination을 예약.

```text
EMPTY
→ RESERVED
→ OCCUPIED
```

도착 실패:

```text
RESERVED
→ EMPTY
```

떠날 때:

```text
OCCUPIED
→ EMPTY
```

---

# 17. waypoint reservation

좁은 문/복도 waypoint는 필요하면 일시 reservation.

한 번에 두 NPC가 같은 좁은 문을 통과하려고 몸을 겹치는 문제 방지.

---

# 18. 출발 anchor 해제

NPC가 출발한다고 즉시 기존 anchor를 EMPTY로 만들지 않을 수 있다.

NPC가 실제로 anchor radius를 벗어난 시점에 release.

이렇게 해야 다른 NPC가 즉시 같은 공간으로 들어와 겹치는 문제를 줄일 수 있다.

---

# 19. 목적지 접근 방향

NPC는 목적지 좌표만 맞추지 않고 접근 방향을 정의한다.

예:

책상 앞:

정면 접근.

칠판:

옆에서 접근 후 board 쪽 facing.

전화기 옆:

필요 없음.

회의 위치:

player와 report table이 보이는 방향.

---

# 20. faceOnArrival

도착 후 바라볼 방향을 명시.

예:

```text
PLAYER
WORK_SURFACE
BOARD
DOOR
NPC_HANS
```

도착 후 제자리에서 추가 회전할 수 있음.

---

# 21. conversation 접근

플레이어에게 접근할 때 player world position 자체를 destination으로 사용하지 않는다.

반드시:

`conversationAnchor`

또는 player 주변에서 검증된 valid approach point.

NPC가 player collider까지 걸어와 몸을 겹치는 문제 금지.

---

# 22. dynamic conversation anchor

플레이어 위치가 고정되지 않은 경우:

1. player 주변 candidate point 생성
2. 벽/가구/문 sweep 제외
3. camera-safe 거리 검사
4. 주요 통로 제외
5. 가장 자연스러운 점 선택

가능.

단, 스토리 핵심 장면은 authored conversation spot이 더 안정적.

---

# 23. 대화 거리

03_CAMERA와 06_NPC_CORE의 기준을 유지.

권장:

`1.4~1.8m`

NPC chest/head가 camera safe radius 안으로 들어오지 않게 한다.

---

# 24. player가 conversation spot을 점유할 때

NPC가 그 spot에 강제로 들어가지 않는다.

처리 순서:

A. alternative conversation anchor
B. 짧은 wait
C. player가 약간 비킬 때까지 gaze cue
D. story-critical이면 작은 player pose normalization

NPC가 player를 밀어내는 physics는 기본 금지.

---

# 25. player pose normalization과 NPC 이동

player를 자동 보정해야 한다면 이동 시작 전에 처리.

NPC가 거의 다 도착한 뒤 player를 갑자기 50cm 밀어내지 않는다.

---

# 26. player가 이동 경로를 가로막는 경우

일반 상황:

NPC가 잠시 멈춤.

가능:

• 0.3~1.0초 wait
• 작은 side-step
• 다른 waypoint

스토리 핵심 이동:

• 가까운 yield point 사용
• player가 길을 막았다고 NPC가 벽을 통과하지 않음

---

# 27. side-step

local avoidance용 side-step은 짧게.

권장:

`0.25~0.55m`

이동 후 원래 path로 복귀.

너무 큰 우회로가 필요하면 authored route 자체를 수정.

---

# 28. player 뒤에 갇힘 방지

NPC가 player와 벽 사이 좁은 공간에 들어와 서로 못 움직이는 구조 금지.

conversation anchor 주변에 최소 탈출 방향 1개 이상 확보.

세부 폭은 blocking/collision 문서.

---

# 29. NPC끼리 접근

NPC A와 B가 정면으로 마주오면:

• priority 낮은 쪽이 yield
• 좁은 길이면 한쪽이 wait anchor 사용

서로 몸을 관통하지 않는다.

---

# 30. NPC movement priority

권장:

```text
STORY_CRITICAL
> ACTIVE_DIALOGUE_PREP
> TASK
> GENERAL_WORKER
> AMBIENT
```

CH2 Enrico가 칠판에 가는 중 일반 연구자가 길을 막으면 일반 연구자가 양보.

---

# 31. 동일 priority 충돌

같은 priority면:

• 먼저 route reservation한 NPC 우선
• 다른 NPC wait

동시에 서로 양보하며 좌우로 떨리는 문제를 막는다.

---

# 32. yield anchor

좁은 공간에는 미리 side anchor를 둘 수 있다.

예:

```text
HALL_YIELD_A
HALL_YIELD_B
```

일반 연구자가 story NPC를 비켜줄 때 사용.

---

# 33. 문 통과

문은 특별한 이동 구간으로 취급.

경로:

```text
DOOR_APPROACH
→ door clearance 확인
→ door open
→ DOOR_CROSS
→ door release
```

NPC가 닫힌 문을 그대로 통과하지 않는다.

---

# 34. door owner

한 시점에 문 통과 sequence owner를 명확히 한다.

여러 NPC가 동시에 door OPEN/CLOSE를 호출하지 않게 한다.

---

# 35. 열린 문 유지

여러 NPC가 연속 통과할 경우:

첫 NPC가 문을 열고
마지막 NPC가 지나갈 때까지 유지 가능.

매 NPC마다 열고 닫아 병목을 만들지 않는다.

---

# 36. 문 회전 반경

NPC가 door sweep 안에 있으면 문이 body를 관통할 수 있다.

door open 전:

• NPC approach anchor가 sweep 밖인지 확인
• player도 sweep 밖인지 확인

세부 clearance는 18 문서.

---

# 37. 문 닫힘

NPC가 아직 threshold 안에 있으면 문 닫지 않는다.

story상 필요 없으면 자동 닫힘 최소화.

---

# 38. 문턱에서 멈추기 금지

NPC의 final destination을 door threshold에 두지 않는다.

문은 통과 구간이지 장기 standing spot이 아니다.

---

# 39. 코너 이동

NPC가 복도 코너를 돌 때 벽을 clipping하지 않게 waypoint를 코너에서 충분히 띄운다.

root center만 통과하고 팔/어깨가 벽을 뚫는 문제도 고려.

---

# 40. 어깨 clearance

NPC route width는 root collider만 간신히 통과하는 폭으로 잡지 않는다.

팔 swing과 어깨 폭을 고려.

실제 값은 collision 문서.

---

# 41. 계단

현재 게임에 계단이 필수로 필요하지 않으면 사용하지 않는 것을 권장.

이유:

• 이동/카메라/충돌 복잡성 증가
• story상 실익 적음

필요한 경우 별도 movement rule 추가.

---

# 42. 문서 들고 이동

문서를 들고 걷는 NPC는:

• held object가 몸을 통과하지 않음
• 손 위치 안정
• 빠른 팔 swing 감소
• 문서가 벽/문틀을 clipping하지 않음

큰 binder는 몸 중앙 쪽에 가까이 든다.

---

# 43. 큰 오브젝트 들고 이동

NPC가 큰 장비/상자를 운반하는 장면은 기본적으로 제한.

필요하면 두 손 carry 전용 route와 clearance를 별도 설계.

일반 walking clip 재사용 금지.

---

# 44. 작업 위치 이동

workstation으로 이동:

```text
MOVING_TO_TASK
```

도착 후:

• 정확한 work anchor
• facing 정렬
• hand reach 가능한 거리
• 다음 task state

확인.

---

# 45. 작업대에 너무 가까이 접근 금지

NPC torso가 desk/table을 뚫지 않게 stop distance 확보.

work anchor가 table edge를 침범하지 않는지 layout 단계에서 검증.

---

# 46. 앉기

SEAT anchor로 먼저 이동.

흐름:

```text
WALKING
→ STATIONARY
→ TURNING
→ TRANSITIONING_POSTURE
→ SEATED
```

의자에서 1m 떨어진 위치에서 갑자기 앉은 pose로 snap 금지.

---

# 47. 앉기 전 의자 alignment

NPC pelvis/seat 위치와 chair orientation 확인.

무릎이 책상 내부로 들어가지 않는지 검사.

---

# 48. 일어서기

흐름:

```text
SEATED
→ TRANSITIONING_POSTURE
→ STATIONARY
```

일어서기 전:

• 앞쪽 clearance
• player/NPC 없음

확인.

---

# 49. 의자 밀기

의자 자체를 물리적으로 이동시킬지 여부는 장면별.

필수는 아님.

하지만 NPC가 앉아 있는데 chair가 전혀 위치와 맞지 않는 문제는 금지.

---

# 50. 퇴장

퇴장 sequence:

1. interaction disable
2. held object 확인
3. turn
4. exit route
5. door traversal
6. occlusion 뒤 이동
7. OFFSCREEN

시야 안에서 despawn 금지.

---

# 51. offscreen 처리 지점

가능:

• 닫힌 문 뒤
• 코너 뒤
• 충분히 먼 dark corridor

player가 바로 따라가서 despawn 장면을 볼 수 있는 위치는 피한다.

---

# 52. player가 퇴장 NPC를 따라갈 때

스토리상 따라가면 안 되는 경우 공간/문 state로 자연스럽게 분리.

NPC가 player보다 조금 앞서 갔다고 공중에서 사라지는 방식 금지.

---

# 53. 재등장

OFFSCREEN NPC 재등장:

1. hidden spawn/entry point
2. required object attachment
3. canonical posture
4. route reservation
5. 등장
6. target anchor 도착
7. interaction 활성

player 시야 한가운데서 pop-in 금지.

---

# 54. 재등장 타이밍

player가 entry door를 정면으로 보고 있을 때 NPC가 문 안에서 갑자기 생성되지 않게 한다.

가능:

• 문 밖 preload
• door open sound
• 그림자/발소리
• 실제 입장

---

# 55. 수정본 재제출 접근

CH1~4 등:

NPC가 player에게 직접 접근.

흐름:

```text
OFFSCREEN/WORKING
→ RETURN
→ entry route
→ conversation anchor
→ document presentation
```

---

# 56. CH5 George 재제출 예외

George는 player에게 오지 않는다.

수정 완료 후:

```text
WORKING / STATIONARY
```

material test room에 있음.

플레이어가 찾아옴.

따라서 movement system이 무조건 모든 chapter에서 `RETURN_TO_PLAYER`를 호출하면 안 된다.

---

# 57. CH6 Emilio

야간.

Emilio 이동은 짧고 조용.

counter/sample station 사이 purposeful route.

불필요한 빠른 이동 금지.

---

# 58. CH7 경보 이동

일반 연구자들은 panic random running이 아니라 지정된 emergency routes 사용.

가능:

• 장비에서 물러남
• 통로 확보
• control room 쪽 이동
• 외부 대기 지점

Kenneth는 주요 위치 유지.

---

# 59. CH7 속도

경보 중 일반보다 빠름.

하지만 sprint animation을 과도하게 사용해 코미디처럼 보이지 않게 한다.

서류/도구를 떨어뜨리는 연출은 명시적으로 필요할 때만.

---

# 60. CH8 회의 입장

8명이 한 번에 같은 문으로 들어오는 긴 행렬은 피한다.

권장:

• chapter 시작 시 일부는 이미 자리에 있음
• 1~2명이 마지막에 들어옴
• Hans가 최종 report와 함께 중심으로 이동

이렇게 자연스럽게 구성.

---

# 61. CH8 그룹 배치 이동

회의 중 각 NPC는 기본 anchor 유지.

Hans가 다른 이름을 부른다고 그 NPC가 매번 앞으로 걸어나오지 않는다.

작은 gaze/gesture만.

---

# 62. CH8 수정 몽타주 이동

각자 work anchor로 이동하거나 이미 작업 중인 상태에서 컷.

실시간으로 8명이 모두 회의실에서 각 작업실까지 걸어가는 장면은 보여주지 않아도 됨.

몽타주 shot 시작 시 canonical work position 사용 가능.

---

# 63. CH8 성공 후 이동

작은 그룹 movement 가능.

예:

• Richard가 Luis 쪽으로 한두 걸음
• Enrico가 Hans와 handshake
• George가 테이블에서 한 걸음 물러남

중앙 player path는 유지.

---

# 64. CH9 시작 이동

NPC들이 성공 후 느슨하게 흩어진 상태.

전광판 결과 도착 후:

• 필요한 NPC만 board watch anchor로 짧게 이동
• 일부는 이미 좋은 위치에 있음

8명이 동시에 한 줄로 marching 금지.

---

# 65. CH9 board watch 이동

board sequence 시작 전 모든 NPC가 완전히 정렬될 때까지 플레이어를 오래 기다리게 하지 않는다.

대부분의 위치를 미리 준비.

필요한 1~3명만 짧게 reposition.

---

# 66. CH9 결과 중 이동

결과 영상 중 큰 보행 없음.

허용:

• Luis 반 걸음 뒤
• George 몸 돌림
• Kenneth 앉음

이런 reaction movement만.

---

# 67. 그룹 이동 path collision

8명 동시에 움직이는 순간을 최소화.

필요하면 stagger.

예:

```text
NPC A start
+0.25s NPC B
+0.40s NPC C
```

동시에 같은 doorway를 향해 출발하지 않는다.

---

# 68. NPC spacing

걷는 NPC끼리 최소 간격을 유지.

권장 시작값:

```text
0.75~1.0m center-to-center
```

정확한 값은 body width와 blocking 문서에서 조정.

---

# 69. follow behavior 금지

NPC가 앞 NPC를 게임 AI처럼 정확히 따라가는 convoy behavior는 기본적으로 필요 없음.

staggered authored path가 더 자연스러움.

---

# 70. 정지 위치 오차

NPC는 anchor 중심에서 작은 자연 편차를 허용할 수 있다.

그러나 story-critical:

• document handoff
• dialogue
• handshake
• machine operation

은 정확한 pose 필요.

---

# 71. 목적지 snap

도착 마지막 5~10cm를 작은 pose correction으로 snap할 수 있다.

player가 알아차릴 정도의 20~30cm 순간이동 금지.

---

# 72. final rotation

도착 후 final facing이 필요한 경우 짧은 turn.

이때 발이 제자리 회전과 맞지 않으면 미끄러져 보일 수 있으므로 turn animation과 root rotation 동기화.

---

# 73. idle 복귀

도착 후 바로 generic idle을 재생하지 않는다.

task intent에 맞는 idle로.

예:

BOARD_WATCH
→ board watch idle

PRESENTING
→ document hold idle

---

# 74. 이동 중 gaze

걷는 동안:

기본:
진행 방향.

상황에 따라:
• player glance
• destination
• held document

하지만 머리가 90° 옆을 계속 보며 걷지 않음.

---

# 75. player 접근 중 gaze

APPROACHING_PLAYER:

멀리서는 destination.

가까워지면:
player/head anchor로 gaze 이동.

마지막 1~2m에서 eye contact 증가.

---

# 76. 문 통과 중 gaze

문을 통과할 때 player를 계속 보지 않는다.

진행 방향/문 threshold 우선.

---

# 77. movement와 gesture 우선순위

걷기 중 상체 gesture는 제한.

큰 팔 제스처는 정지 후.

작은 문서 hold/가벼운 gaze만 허용.

---

# 78. 이동 중 대사

일반 원칙:
story 핵심 대사는 정지 후.

예외:
짧은 한마디를 걸으면서 할 수 있음.

하지만 camera/dialogue 시스템과 명시적으로 설계된 경우만.

---

# 79. 경로와 가구

모든 authored route는 다음을 검증.

• desk edge
• chair
• cabinet
• cable
• cart
• door
• wall
• active machine
• player zone

장식 오브젝트를 나중에 추가해 route를 막지 않게 placement 문서와 연동.

---

# 80. 바닥 소품

바닥에 케이블/상자/종이가 있어도 NPC가 시각적으로 밟고 지나가도 되는지 명시.

발목 높이 장애물을 collider로 전부 만들면 path가 과도하게 깨질 수 있음.

중요 물체만 movement obstacle.

---

# 81. 케이블

장식 케이블을 NPC foot collision obstacle로 만드는 것은 기본적으로 피한다.

대신 시각적으로 주요 동선 바깥에 배치.

---

# 82. 카트/의자

이동 가능한 가구가 path를 가로막는 상태가 생기지 않도록 chapter canonical layout 유지.

플레이어가 가구를 밀 수 없는 게임이므로 route 안정성이 높아야 한다.

---

# 83. collision resolution

NPC끼리 물리 엔진으로 강하게 밀어내는 방식은 피한다.

권장:

• reservation
• local stop
• side-step
• route priority

밀기 physics는 떨림과 겹침을 유발하기 쉬움.

---

# 84. overlap emergency correction

예상치 못하게 NPC collider가 겹친 경우:

• 즉시 서로 반대 방향 teleport 금지
• 더 낮은 priority NPC를 nearest safe point로 천천히 이동
• 심각하면 debug warning

story-critical camera 밖에서는 작은 correction 가능.

---

# 85. 벽 내부 감지

NPC root 또는 body bounds가 wall volume과 겹치면:

개발:
warning/error.

런타임:
nearest valid nav point/anchor로 correction.

벽 안에서 animation 계속하지 않음.

---

# 86. 바닥 접지

NPC foot/root Y는 floor height 기준.

경사면이 거의 없는 시설이라면 층별 floor Y 고정 가능.

발이 바닥에서 뜨거나 묻히는 문제를 허용하지 않는다.

---

# 87. 발 미끄러짐 검증

걷기 animation cycle와 이동속도가 안 맞으면 발이 미끄러짐.

인물별 speed variation이 있더라도 animation playback rate를 소폭 조정 가능.

---

# 88. 발걸음 사운드

footstep event는 실제 foot plant에 맞춰 발생.

movement code가 일정 시간마다 소리를 내는 방식보다 animation marker를 우선.

세부는 Audio 문서.

---

# 89. 이동 실패 이유

권장 debug reason:

```text
DESTINATION_OCCUPIED
PATH_BLOCKED_BY_PLAYER
PATH_BLOCKED_BY_NPC
DOOR_CLOSED
DOOR_BUSY
NO_CLEARANCE
ANCHOR_INVALID
SEQUENCE_CONFLICT
```

---

# 90. 이동 timeout

NPC가 경로 문제로 무한 wait하지 않게 story-critical movement에는 timeout 검사 가능.

timeout 후:

• alternate route
• safe anchor
• sequence rollback

사용.

플레이어 눈앞에서 teleport로 해결하는 것은 최후 수단.

---

# 91. 이동 중 focus loss

브라우저 focus loss 시 movement delta time 폭주 금지.

복귀 후 NPC가 목적지를 지나쳐 벽으로 들어가지 않게 한다.

긴 gap은 clamp.

---

# 92. 이동 중 새로고침

정확한 중간 위치 저장 안 함.

safe checkpoint에서 canonical state로 재생성.

06_NPC_CORE와 동일.

---

# 93. chapter transition

TRANSITION 시작:

• NPC 신규 이동 요청 차단
• 현재 중요 sequence 완료 여부 확인
• 필요 없는 ambient movement 중지 가능

fade 후 페이지 이동.

---

# 94. offscreen movement 최적화

OFFSCREEN NPC의 실제 보행을 매 frame 계산할 필요 없음.

스토리상 일정 시간이 지난 뒤 canonical destination state로 전환 가능.

단, player가 볼 수 있는 공간에 다시 들어올 때만 실제 movement.

---

# 95. 멀리 있는 일반 NPC

LOD/저빈도 movement update 가능.

하지만 visible path가 끊기거나 순간이동처럼 보이지 않게 한다.

---

# 96. CH1 Richard 이동

입장:

```text
hall_hidden_spawn
→ office_door_approach
→ office_door_cross
→ richard_desk_conversation
```

반려 후:

```text
desk
→ office_exit
→ hall
→ calculation_area
```

재등장:

같은 경로를 그대로 역재생하지 않아도 됨.

예:
다른 쪽 calculation corridor에서 접근 가능.

---

# 97. CH2 Enrico 이동

기본적으로 칠판 근처에 이미 존재.

player 접근 시:

• 논쟁하던 위치
→ board center
→ player conversation anchor

짧은 이동.

---

# 98. CH3 Luis 이동

instrumentation room 안.

CRT와 기록대 사이 짧은 task route.

장비 사이 좁은 통로에서 clipping 주의.

---

# 99. CH4 John 이동

chapter 시작 시 player office에 이미 기다리고 있음.

따라서 입장 animation 불필요.

플레이어가 돌아왔을 때:

• chair/desk 옆 waiting anchor
• player 접근 후 작은 reposition

---

# 100. CH5 George 이동

시험 직후:

test chamber side
→ player visible zone

빠르게 나옴.

REJECTED 후:
문서를 빠르게 회수하고 test room 쪽으로 퇴장.

수정 후에는 player에게 오지 않음.

---

# 101. CH6 Emilio 이동

어두운 공간에서 counter 소리가 guide.

Emilio는 측정 station에 이미 있음.

필요시 sample table ↔ detector station 이동.

동선은 짧고 조용.

---

# 102. CH7 Kenneth 이동

경보 시 Kenneth는 control room의 주요 anchor에 있음.

player 접근 후 conversation.

incident reconstruction 중 큰 이동보다 table/board 주변 작은 이동.

---

# 103. CH8 Hans 이동

Hans가 final report를 들고 중심 anchor로 이동.

나머지 7명은 대부분 이미 자리.

Hans movement path가 player route를 가로막지 않게 한다.

---

# 104. CH8 성공 후 자유화

최종 승인 후 일부 NPC가 anchor를 떠날 수 있음.

하지만 다음 CH9 transition 전 과도한 이동 없음.

성공 분위기만 표현.

---

# 105. CH9 Hans 이동

`FINAL REPORT RECEIVED` 직전/후 Hans가 board 쪽으로 아주 짧게 이동 가능.

대사:

“결과 보고가 도착했습니다.”

그 뒤 player가 board로 접근.

Hans가 board interaction zone을 점유하지 않음.

---

# 106. CH9 Kenneth 앉기

첫 결과 후 Kenneth가 앉는 반응을 사용할 경우:

• 가까운 chair/bench가 사전에 존재
• seat anchor 확보
• 갑자기 바닥에 주저앉지 않음
• camera 시야에서 자연스럽게 보일 위치

실제 여부는 CH9 blocking에서 확정.

---

# 107. 일반 연구자 CH8 성공 이동

배경 일반 NPC도 일부 작업을 멈추고 서로 보는 반응 가능.

하지만 주요 8명 사이로 끼어들지 않는다.

---

# 108. 일반 연구자 CH9

결과 관람 장면에서 주요 8명 외 인원이 너무 많으면 시선 분산.

필요 최소 인원만.

---

# 109. 이동과 챕터 진행률

시설이 점점 활성화되며 일반 연구자의 작업 동선도 늘어날 수 있다.

CH1:
조용하고 적음.

CH8:
활동 밀도 증가.

하지만 busy한 느낌을 위해 무작위 wandering 수를 늘리는 방식 금지.

---

# 110. movement debug visualization

개발 모드에서 표시 가능:

• current anchor
• destination anchor
• reserved anchors
• waypoint path
• body collider
• personal space radius
• door sweep
• current movementState
• priority
• sequence owner
• blocked reason

---

# 111. path QA

모든 story-critical path는 최소 다음 조건으로 테스트.

• player가 path 중앙에 있음
• player가 destination 앞에 있음
• 다른 NPC가 door 근처에 있음
• door closed
• door open
• mobile 낮은 framerate
• browser focus loss 후 복귀
• camera가 다른 방향을 보고 있음
• NPC가 held document 상태

---

# 112. blocker QA

다음 배치에서 NPC가 벽/가구를 통과하지 않는지 검사.

• 책상 모서리
• 열린 문
• 닫힌 문
• 의자
• 좁은 복도
• 두 NPC 교차
• player/NPC 정면 충돌
• 8명 회의실
• CH9 board 전방

---

# 113. 도착 QA

목적지 도착 후:

• 발이 바닥에 있음
• 몸이 anchor 중심에 과도하게 벗어나지 않음
• facing 정확
• 다른 NPC와 겹치지 않음
• interaction distance 유효
• camera framing 가능
• held object 위치 정상
• movementState STATIONARY

---

# 114. 이동 관련 금지사항

• 직선 tween으로 벽/책상 통과
• random roaming
• player collider 통과
• NPC끼리 통과
• 닫힌 문 통과
• 문 회전 중 몸 관통
• door threshold에 멈춤
• 걷기 시작 즉시 full speed
• 도착 후 root sliding
• 180° snap
• 시야 안 pop-in/pop-out
• story-critical NPC가 일반 NPC 때문에 영구 정지
• player를 physics로 강하게 밀기
• 동일 anchor 두 NPC 점유
• CH8 8명 동시 같은 문 입장
• CH9 8명 동시 marching
• 퇴장 NPC가 문 앞에서 사라짐
• 이동 중 exact animation frame save

---

# 115. 후속 문서와의 계약

## 08_NPC_GESTURE.md

이동 상태에 맞는:

• head turn
• body turn
• arm swing
• held-object posture
• arrival reaction

을 정의한다.

---

## 09_NPC_BLOCKING.md

본 문서가 사용하는:

• conversation anchor
• work anchor
• seat anchor
• meeting anchor
• yield anchor
• board watch anchor
• door approach/cross anchor

의 실제 배치와 최소 간격을 확정한다.

---

## 10_ANIMATION_CORE.md

movement sequence가:

• turn
• walk
• stop
• posture transition

을 안정적으로 이어서 실행할 수 있어야 한다.

---

## 11_OBJECT_ANIMATION.md

held document/box/tool이 NPC 이동 중 안정적인 attachment를 유지하도록 한다.

---

## 16_FACILITY_ARCHITECTURE.md

실제 방과 복도의 연결 관계가 authored route를 가능하게 해야 한다.

---

## 17_SPATIAL_LAYOUT.md

NPC 이동에 필요한:

• 복도 폭
• 문 폭
• desk spacing
• turning space

를 확보한다.

---

## 18_COLLISION_AND_CLEARANCE.md

NPC body bounds, shoulder clearance, door clearance, player/NPC separation 수치를 최종 확정한다.

---

## 21_AUDIO.md

발걸음과 door interaction sound를 movement marker와 연결한다.

---

## 28_PERFORMANCE.md

다인원 movement update 빈도와 LOD 정책을 확정한다.

---

# 116. 누적 검증 결과

07_NPC_MOVEMENT.md 작성 완료 시점 기준:

00_INDEX.md와 상충:
없음.

01_PLAYER.md와 상충:
없음.

02_CONTROL.md와 상충:
없음.

03_CAMERA.md와 상충:
없음.

04_INTERACTION.md와 상충:
없음.

05_DIALOGUE.md와 상충:
없음.

06_NPC_CORE.md와 상충:
없음.

현재까지 확정된 구조:

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
   ↓
05_DIALOGUE
   ↓
06_NPC_CORE
   ↓
07_NPC_MOVEMENT
```

핵심 이동 계약:

```text
CHAPTER STATE
→ NPC CORE가 이동 의도 결정
→ destination anchor 예약
→ route/door/player/NPC clearance 검증
→ TURN
→ WALK
→ 감속
→ ARRIVE
→ final facing
→ occupied anchor 확정
→ 다음 TASK / DIALOGUE / INTERACTION 상태
```

이동은 단순 좌표 tween이 아니라
공간·사람·문·카메라·오브젝트·스토리 상태를 모두 고려한 authored movement로 처리한다.

후속 `08_NPC_GESTURE.md`는 `00~07` 전체와 누적 상충 검토한다.

<!-- MERGED SOURCE END: 07_NPC_MOVEMENT.md -->


================================================================================
ORIGINAL SOURCE: 08_NPC_GESTURE.md
================================================================================

# 08_NPC_GESTURE.md

# NPC GESTURE SPECIFICATION

이 문서는 주요 NPC와 일반 연구자 NPC의 시선, 고개, 상체, 팔, 손, 자세, 감정 반응, 문서 전달/회수, 대화 중 몸짓, 이동 중 몸짓 제한, CH8 집단 반응, CH9 무언 반응을 정의한다.

---

# 1. 기본 원칙

NPC의 제스처는 “대사에 맞춰 손을 흔드는 장식”이 아니다.

제스처는 다음을 전달해야 한다.

• 지금 무엇을 보고 있는가
• 무엇을 생각하고 있는가
• 플레이어의 판단을 어떻게 받아들이는가
• 자신의 결과를 얼마나 확신하는가
• 반려 후 어떤 감정 변화를 겪는가
• 수정 후 어떤 태도로 돌아오는가

모든 제스처는 현재 NPC 상태와 실제 공간을 기준으로 한다.

---

# 2. 제스처 계층

제스처는 다음 계층으로 나눈다.

```text
BASE POSTURE
GAZE
HEAD
TORSO
ARM
HAND
OBJECT HANDLING
REACTION
```

한 제스처가 모든 관절을 동시에 과장되게 움직이지 않는다.

---

# 3. Base Posture

기본 자세는 NPC별로 다르게 설정한다.

공통 후보:

```text
RELAXED_STAND
FORMAL_STAND
WORK_STAND
LEAN_LIGHT
SEATED_WORK
SEATED_REST
BOARD_STAND
REPORT_HOLD
```

NPC마다 선호 posture가 다르다.

---

# 4. 자세의 안정성

NPC는 idle 중 계속 좌우로 흔들리지 않는다.

허용:

• 작은 체중 이동
• 어깨 미세 변화
• 손 위치 재조정
• 가벼운 호흡

금지:

• 2초마다 같은 몸 흔들기
• 상체가 끊임없이 좌우 반복
• 손이 이유 없이 계속 움직임

---

# 5. 시선 시스템

시선 상태:

```text
AMBIENT
PLAYER
OBJECT
NPC
WORK_SURFACE
BOARD
DOWN
AWAY
```

실제 look target은 NPC Core의 gazeState와 lookTarget을 따른다.

---

# 6. 시선 전환

시선은 즉시 snap하지 않는다.

기본 흐름:

```text
eyes/head
→ head
→ 필요하면 torso
```

작은 각도는 고개만.

큰 각도는 상체까지 동반.

---

# 7. 시선 반응 시간

NPC마다 시선 반응 템포를 다르게 한다.

Richard:
빠름.

Enrico:
조금 느림.

Luis:
장비와 플레이어 사이 전환 빠름.

John:
짧고 정확.

George:
반응은 빠르나 오래 고정될 수 있음.

Emilio:
관찰 후 플레이어를 봄.

Kenneth:
느리고 무게감 있음.

Hans:
가장 안정적.

---

# 8. Eye Contact

NPC가 항상 플레이어를 뚫어져라 바라보지 않는다.

대화 중에도:

• 문서
• 장비
• 칠판
• 다른 연구자

로 자연스럽게 시선이 이동한다.

플레이어를 바라보는 순간이 의미를 가져야 한다.

---

# 9. 고개 움직임

공통:

• 작은 nod
• 작은 shake
• slight tilt
• look down
• look away
• return to player

금지:

• 과도한 끄덕임 반복
• 대사마다 nod
• 즉시 90° head turn

---

# 10. 몸통 회전

30° 이내는 고개/어깨만으로 처리 가능.

30° 이상이면 torso rotation 동반.

60° 이상이면 발/몸 전체 turn이 필요할 수 있다.

movement system과 충돌하지 않게 한다.

---

# 11. 팔 제스처

팔 동작은 의미 있는 경우만.

예:

• 문서 내밀기
• 특정 행 가리키기
• 칠판 가리키기
• 손을 거두기
• 팔짱
• 책상 짚기
• 손 내려놓기

모든 대사에 팔 동작을 붙이지 않는다.

---

# 12. 손 제스처

손가락 정밀 IK가 없더라도 다음은 구분한다.

• open hand
• point
• hold document
• grip tool
• release
• rest on table

손이 오브젝트를 관통하지 않게 grip offset을 별도로 둔다.

---

# 13. 문서 들기

문서를 들 때:

• 손이 문서 모서리 또는 하단을 잡음
• 텍스트를 과도하게 가리지 않음
• 문서가 손에서 떠 있지 않음
• 이동 중 흔들림 최소

큰 binder는 양손 또는 몸 가까이.

---

# 14. 문서 전달

기본 sequence:

```text
NPC가 문서를 확인
→ 플레이어를 봄
→ 팔을 뻗음
→ 문서가 reach 영역에 들어옴
→ 플레이어 handoff
→ NPC 손이 천천히 빠짐
```

문서가 NPC 손에서 갑자기 player anchor로 순간이동하지 않는다.

---

# 15. 문서 회수

REJECTED 후:

```text
NPC가 도장을 봄
→ 짧은 반응
→ 문서를 봄
→ 손을 뻗음
→ 문서 회수
→ 몸 쪽으로 당김
```

각 인물별 속도와 감정이 다르다.

---

# 16. Richard 제스처

특징:

• 손 사용 비교적 많음
• 빠른 시선 전환
• 계산 문서를 직접 가리킴
• 오류를 발견하면 즉시 문서 쪽 집중

반려 후:

• 짧은 고개 끄덕임
• 문서 회수
• 곧바로 다음 행동

과도한 농담성 몸짓 금지.

---

# 17. Enrico 제스처

특징:

• 동작 작음
• 칠판/그래프 쪽 시선 비중 높음
• 한 손을 가볍게 모으거나 뒷짐
• 오류 발견 후 긴 정지

반려 후:

• 짧은 nod
• 자료 정리
• 감정 표출 최소

---

# 18. Luis 제스처

특징:

• 장비/CRT를 자주 봄
• 손으로 장비 또는 기록지 가리킴
• 빠른 실무적 동작

오류 발견:

• 기록지에서 장비로 시선 이동
• 다시 플레이어
• 짧은 멈춤

---

# 19. John 제스처

특징:

• 가장 절제
• 손동작 작음
• 특정 기록 행이나 숫자 위치만 짚음
• 자세 흐트러짐 적음

오류 인정:

• 문서를 다시 확인
• 짧은 고개 움직임
• 불필요한 표정 변화 없음

---

# 20. George 제스처

특징:

• 동작 크기 조금 큼
• 긴장 시 어깨와 팔이 굳음
• 문서 회수 빠름
• 책상에 손을 짚을 수 있음

반려 전:

• 플레이어를 정면으로 봄
• 팔/문서 자세가 단단해짐

REJECTED 후:

• 도장을 잠시 봄
• 문서를 빠르게 잡음
• 몸을 조금 먼저 돌린 뒤 퇴장

위협적 삿대질, 플레이어에게 다가붙기 금지.

---

# 21. Emilio 제스처

특징:

• 시료/계수기 쪽 시선 많음
• 손으로 작은 기록을 확인
• 불확실할 때 고개를 약간 기울임

REJECTED 후:

• 긴장 해소
• 어깨 약간 내려감
• 짧은 nod

---

# 22. Kenneth 제스처

특징:

• 자세 단단함
• 손동작 적음
• 보고서를 쥔 손에 힘이 들어갈 수 있음
• 사고 기록 지적 때 시선이 오래 머묾

마지막 승인 후:

• 떠나다 멈춤
• 몸 전체를 다 돌리기보다 상체와 고개 먼저
• 플레이어와 eye contact

---

# 23. Hans 제스처

특징:

• 가장 안정적
• 보고서를 정리하고 펼치는 동작 중요
• 다른 연구자를 자연스럽게 시선으로 연결
• 그룹 장면에서 중심축

CH8 오류 누적:

• 첫 오류: 기록 확인
• 두 번째: 짧은 정지
• 마지막: 보고서를 닫음

---

# 24. 감정 상태별 기본 표현

NEUTRAL:
• 안정적 posture
• 작은 ambient gaze

FOCUSED:
• 움직임 감소
• 대상 고정

CONFIDENT:
• 어깨 안정
• 문서/장비를 주저 없이 제시

DOUBTFUL:
• 시선 재확인
• 작은 head tilt

FRUSTRATED:
• 어깨/손 긴장
• 동작 약간 빨라짐

DEFENSIVE:
• 문서를 몸 쪽으로 조금 당김
• eye contact 증가

SURPRISED:
• 짧은 멈춤
• 고개/눈 반응

CONCERNED:
• 움직임 감소
• 시선 오래 유지

RELIEVED:
• 어깨 내려감
• 손 힘 풀림

TIRED:
• 자세 조금 낮음
• 동작 느림

SATISFIED:
• 작은 nod
• 미세한 smile

STUNNED:
• 거의 움직이지 않음

WITHDRAWN:
• player/board에서 시선 일부 회피

---

# 25. 감정 전환

감정 state가 바뀌어도 모든 관절이 동시에 즉시 바뀌지 않는다.

예:

CONFIDENT
→ 오류 확인
→ DOUBTFUL

먼저:

시선
→ 고개
→ 손
→ 자세

순으로 변화 가능.

---

# 26. 대화 cue와 제스처

Dialogue cue는 다음 형식으로 호출 가능.

```text
LOOK_PLAYER
LOOK_DOCUMENT
POINT_DOCUMENT
OFFER_DOCUMENT
RECLAIM_DOCUMENT
SMALL_NOD
LOOK_AWAY
CROSS_ARMS
CLOSE_REPORT
```

Dialogue 문서가 관절 수치를 직접 정의하지 않는다.

---

# 27. 대화 중 과잉 제스처 금지

한 line에 기본적으로 큰 gesture 하나 이하.

예:

`“그쪽입니까?”`
→ 문서의 해당 부분을 봄.

그 다음 line:
`“계산은 두 번 돌렸습니다.”`
→ player glance.

한 문장 안에 고개/팔/몸/문서 모두 크게 움직이지 않는다.

---

# 28. 이동 중 제스처 제한

WALKING/APPROACHING_PLAYER 중:

허용:
• gaze
• held-object adjustment
• 작은 head motion

금지:
• 큰 pointing
• arms crossing
• report flipping
• 긴 hand gesture

큰 gesture는 정지 후.

---

# 29. 착석 상태 제스처

SEATED에서는:

• 손을 책상에 놓기
• 보고서 보기
• 작은 상체 lean
• 고개 움직임

가능.

앉은 채 상체가 책상 안으로 들어가지 않게 한다.

---

# 30. 작업 상태 제스처

Richard:
calculator/card handling.

Enrico:
chalkboard/notes.

Luis:
CRT/control.

John:
timing sheet.

George:
material specimen/report.

Emilio:
sample/counter.

Kenneth:
incident report/log.

Hans:
compilation/report.

각 task loop는 서로 달라야 한다.

---

# 31. 작업 loop 길이

짧은 2초 loop 반복 금지.

가능하면:

• 6~15초 단위
• 중간 idle variation
• 작은 랜덤 delay

로 복제감 감소.

---

# 32. 작업 중 player 접근

player가 가까이 왔다고 즉시 모든 NPC가 작업을 중지하지 않는다.

주요 interaction target만:

• 작업 마무리
• 손 멈춤
• player glance
• conversation 준비

---

# 33. Ambient NPC 제스처

일반 연구자는:

• 문서 전달
• 장비 확인
• 칠판 쓰기
• 카트 정리
• 기록지 넘김

같은 작은 행동.

과도한 대화/몸짓으로 주요 NPC를 가리지 않는다.

---

# 34. 두 NPC 간 상호작용

CH2 논쟁 등:

• 서로 바라봄
• 한 명이 칠판을 가리킴
• 다른 사람이 문서 확인
• 짧은 반응

서로 동시에 큰 제스처를 하지 않는다.

---

# 35. 악수

CH8 성공 후 악수 가능.

조건:

• 두 NPC anchor 고정
• hand target 맞춤
• 팔 길이 고려
• 1~2회 작은 shake
• 오래 유지하지 않음

손이 서로 통과하는 경우 악수 연출을 제거하는 편이 낫다.

---

# 36. 박수

기본적으로 사용하지 않는다.

CH8 성공은 작은 안도와 악수 정도.

군중 박수는 톤과 맞지 않는다.

---

# 37. 웃음

큰 웃음 animation 금지.

CH8 성공:

• 미세한 smile
• 짧은 숨/작은 웃음

정도.

CH9 시작 전 성취감은 유지하지만 과장하지 않는다.

---

# 38. CH8 이름 호명

Hans가 각 이름을 말할 때:

Richard:
작은 glance.

Enrico:
아주 작은 nod.

Luis:
시선 이동.

John:
거의 반응 없음.

George:
팔/자세 작은 변화.

Emilio:
Hans 쪽 glance.

Kenneth:
짧은 eye contact.

각각 차이를 둔다.

---

# 39. CH8 오류 발견 반응

첫 오류:
주변 NPC 일부만 조용히 반응.

두 번째:
분위기 더 정적.

마지막:
Hans report close가 중심.

8명이 동시에 놀라는 animation 금지.

---

# 40. CH8 수정 몽타주

각자 고유 작업 gesture 사용.

동일 hand loop 복제 금지.

작업자는 카메라를 보지 않는다.

---

# 41. CH8 최종 승인

APPROVED 순간:

• Hans report/도장 확인
• 주변 인물 일부 posture release
• Richard/Enrico/Luis 등 작은 반응

모두 동시에 player를 보는 장면 금지.

---

# 42. CH9 첫 결과 전

성공 분위기.

• 작은 대화
• relaxed posture
• 일부 smile

board 신호가 오면 점차 시선 이동.

---

# 43. CH9 전광판 시선

결과 재생 시:

모든 주요 NPC는 BOARD를 기본 gaze target으로.

하지만 머리 각도가 모두 똑같으면 안 된다.

standing position에 따라 시선 방향 차이.

---

# 44. CH9 첫 번째 섬광 반응

과장 금지.

가능:

Richard:
미소 사라짐.

Enrico:
고개가 아주 미세하게 굳음.

Luis:
반 걸음 뒤 + 손 멈춤.

John:
거의 정지.

George:
시선 돌림.

Emilio:
손의 작은 습관 중지.

Kenneth:
앉거나 몸을 낮춤.

Hans:
board 유지.

---

# 45. CH9 두 번째 결과

첫 번째보다 “새로운 충격”이 아니라 의미가 확정되는 구간.

따라서 두 번째 폭발 때:

• 큰 startled reaction 없음
• 이미 굳은 자세 유지
• 일부 더 시선 회피

---

# 46. Hans의 플레이어 시선

최종 구간에서:

BOARD
→ PLAYER
→ BOARD

짧게.

약 0.6~1.2초 정도의 의미 있는 eye contact.

대사 없음.

---

# 47. SUCCESS? 구간

NPC 대부분 정지.

idle breathing도 최소화.

시스템 이상처럼 보이는 전광판 변화가 중심.

---

# 48. power-down

조명이 꺼질 때 NPC들이 공포 연기를 하지 않는다.

움직임 거의 없음.

어둠이 사람들을 삼키는 느낌.

---

# 49. 시선 target 누락

lookTarget object가 사라지면:

• 현재 head rotation에 잠깐 유지
• AMBIENT 또는 지정 fallback으로 전환

갑자기 정면 snap 금지.

---

# 50. animation ownership

gesture는 현재 sequence owner보다 높은 우선순위를 가져서는 안 된다.

우선순위:

```text
CINEMATIC
> DIALOGUE
> OBJECT HANDLING
> TASK
> AMBIENT
```

---

# 51. gesture interruption

상위 sequence가 시작되면 현재 idle gesture를 끊을 수 있다.

단:

• 팔이 공중에서 snap하지 않음
• 0.1~0.3초 정도 transition

가능.

---

# 52. gesture blending

가능하면 pose 간 보간 사용.

특히:

• arms crossed → document hold
• seated → stand
• looking away → player

에서 중요.

---

# 53. 손과 물체 attachment

object ownership 전환 직전까지 hand anchor에 유지.

attachment 해제 시점을 animation과 맞춘다.

한 프레임 먼저 손이 빠져 물체가 공중에 뜨지 않게 한다.

---

# 54. gesture와 collision

팔/손 제스처도 공간을 차지한다.

벽/책상 가까이에서 큰 팔 gesture 금지.

특히:

• 칠판 옆
• 좁은 복도
• 책상 사이
• 8명 회의

에서 gesture amplitude 제한.

---

# 55. camera-safe gesture

대화 중 손이 camera 가까이 지나가며 화면 전체를 가리지 않게 한다.

NPC가 player 방향으로 팔을 뻗을 때 camera safe radius 유지.

---

# 56. gesture와 문서 가독성

NPC가 문서를 가리킬 때 손가락이 핵심 단서 위를 완전히 가리지 않는다.

필요하면 손이 행 옆이나 아래를 짚는다.

---

# 57. 동일 gesture 반복 방지

NPC마다 최근 사용 gesture history를 짧게 유지할 수 있다.

같은 `SMALL_NOD`가 연속 3번 나오지 않게 한다.

---

# 58. 감정 표현 강도

gesture intensity를 0~1 내부값으로 둘 수 있다.

예:

George FRUSTRATED:
0.75

John SURPRISED:
0.25

같은 emotion label이어도 인물별 강도 다르게.

UI에 표시하지 않는다.

---

# 59. 표정

low-poly/간단 rig라면 표정은 최소.

가능:

• 눈썹
• 눈
• 입꼬리

정도.

얼굴 표정이 부족하면 몸짓과 pause로 보완.

---

# 60. 눈 깜빡임

blink는 자연스럽게.

완전 random이면 중요한 eye contact 순간에 눈 감을 수 있음.

스토리 cue 중 일부는 blink 억제 가능.

---

# 61. CH5 George 반려

핵심 연기 sequence:

```text
REJECTED stamp
→ George가 도장을 봄
→ player를 봄
→ 짧은 정지
→ 문서를 잡음
→ 빠르게 몸 쪽으로 당김
→ 어깨 굳음
→ 퇴장 준비
```

공격적 삿대질 금지.

---

# 62. CH6 Emilio 반려

핵심:

```text
도장 확인
→ 긴장 완화
→ 작은 숨
→ “좋습니다.”
→ 문서 정리
```

반려가 안도처럼 느껴져야 한다.

---

# 63. CH7 Kenneth 반려

핵심:

```text
보고서
→ 도장
→ player eye contact
→ 잠깐 정지
→ 고개 아주 작게 끄덕임
```

현장 책임자로서 무게감.

---

# 64. CH8 Hans 마지막 오류

핵심:

```text
문서 확인
→ 손 멈춤
→ report close
→ 손을 report 위에 둠
→ 고개 약간 숙임
→ silent beat
→ player look
```

이 연출은 과장하지 않는다.

---

# 65. gesture 실패 검증

반드시 검사:

• 손이 문서 안으로 들어감
• 팔이 책상 통과
• head가 torso 범위를 넘어 비틀림
• 앉은 상태에서 다리/책상 겹침
• NPC끼리 악수 실패
• board를 보는데 목이 120° 꺾임
• player에 너무 가까이 팔 뻗음
• 동일 gesture가 반복
• walking 중 큰 손동작
• CH9 모두 같은 reaction

---

# 66. 디버그

개발 모드 표시 가능:

```text
emotionState
gazeState
lookTarget
gestureLayer
currentGesture
gestureOwner
heldObject
gestureIntensity
```

---

# 67. 금지사항

• 모든 대사에 손동작
• 모든 대사에 nod
• 항상 player eye contact
• 180° head snap
• 벽/책상 관통
• 문서 가독성 가림
• 8명 동일 reaction
• George 과도한 분노
• CH9 오열/절규
• CH8 박수/환호 군중
• walking 중 큰 제스처
• idle loop 2초 반복
• object ownership과 손 위치 불일치
• gesture가 story sequence를 덮어쓰기

---

# 68. 후속 문서와의 연결

`09_NPC_BLOCKING.md`
• 제스처가 가능한 공간과 사람 간 거리 확보

`10_ANIMATION_CORE.md`
• gesture layer, sequence ownership, blending 지원

`11_OBJECT_ANIMATION.md`
• 문서 전달/회수와 attachment timing 일치

`17_SPATIAL_LAYOUT.md`
• 책상/칠판/작업대 주변 팔 움직임 여유 확보

`18_COLLISION_AND_CLEARANCE.md`
• 팔/손/머리 safe volume 최종 검증

`21_AUDIO.md`
• 종이, 의자, 옷, 손 동작 소리 연결

`26_TIMING_AND_PACING.md`
• silent beat, eye contact, reaction hold 시간 확정

<!-- MERGED SOURCE END: 08_NPC_GESTURE.md -->


================================================================================
ORIGINAL SOURCE: 09_NPC_BLOCKING.md
================================================================================

# 09_NPC_BLOCKING.md

# NPC BLOCKING SPECIFICATION

이 문서는 NPC와 플레이어, NPC 상호 간 실제 공간 배치, 대화 위치, 정지 위치, 작업 위치, 출입문 주변 여유, 카메라 확보 공간, 그룹 장면, CH8 최종 회의, CH9 전광판 관람 배치, 이동 통로, 제스처 공간을 정의한다.

Blocking은 “사람을 보기 좋게 놓는 작업”이 아니라
사람, 카메라, 문, 가구, 상호작용, 이동, 제스처가 동시에 가능한 공간을 만드는 작업이다.

---

# 1. 기본 원칙

배치 순서는 다음을 우선한다.

```text
1. 플레이어 동선
2. interaction standing zone
3. NPC 이동 경로
4. 대화 거리
5. 카메라 시야
6. gesture clearance
7. 가구
8. 장식
```

장식을 먼저 배치한 뒤 남는 틈에 NPC를 넣지 않는다.

---

# 2. Blocking Anchor

모든 주요 위치는 anchor로 정의한다.

공통 종류:

```text
PLAYER_START
PLAYER_INTERACTION
NPC_WAIT
NPC_CONVERSATION
NPC_WORK
NPC_SEAT
NPC_EXIT
DOOR_APPROACH
DOOR_CROSS
GROUP
BOARD_WATCH
YIELD
```

---

# 3. Anchor 기본 데이터

```js
{
  id,
  type,
  position,
  facing,
  radius,
  clearanceRadius,
  allowedNpcIds,
  cameraPoseId,
  interactionZoneId,
  occupancy
}
```

---

# 4. 사람 간 기본 거리

대화:

```text
player ↔ NPC
약 1.4~1.8m
```

일반 standing NPC끼리:

```text
center-to-center
최소 약 0.8~1.0m
```

그룹 장면:

```text
약 0.9~1.4m
```

상황에 따라 조정 가능.

---

# 5. 개인 공간

NPC가 플레이어 바로 코앞까지 오지 않는다.

카메라와 NPC 얼굴 사이 최소 안전거리 확보.

대화 중 NPC chest collider가 player collider와 겹치지 않는다.

---

# 6. Player Escape Path

대화 위치는 player가 종료 후 최소 한 방향으로 자연스럽게 빠져나올 수 있어야 한다.

금지:

```text
벽
NPC
책상
player
```

사이에 player가 끼이는 배치.

---

# 7. 출입문 Blocking

문 앞은 장기 standing zone으로 사용하지 않는다.

door threshold 주변:

• NPC conversation anchor 금지
• player spawn 금지
• report table 금지
• chair 금지

문 회전 반경 + 사람 여유까지 확보.

---

# 8. Door Approach

문 양쪽에:

```text
DOOR_APPROACH_IN
DOOR_APPROACH_OUT
DOOR_CROSS
```

anchor를 둘 수 있다.

NPC가 문을 통과한 직후 멈추지 않고 최소 한 사람 깊이만큼 이동.

---

# 9. 책상 Blocking

Director desk는 핵심 공간.

필수 영역:

• player standing zone
• incoming document slot
• compare left/right
• stamp area
• NPC presentation zone
• NPC exit path
• camera close-up space

모든 영역이 겹치지 않아야 한다.

---

# 10. 책상 앞 NPC

NPC는 책상 정중앙에 너무 붙지 않는다.

권장:

• desk edge에서 약 0.45~0.7m 떨어진 위치
• player와 시선 교환 가능한 각도

정확한 값은 desk 깊이와 카메라 기준으로 조정.

---

# 11. 책상 옆 배치

문서 전달 장면에서 NPC가 player 정면 중앙만 차지하면 문서와 얼굴이 겹칠 수 있다.

약간 좌/우 offset 허용.

예:

```text
NPC x offset ±0.25~0.45m
```

---

# 12. Camera Corridor

중요 장면에는 보이지 않는 카메라 확보 공간을 둔다.

예:

• NPC 얼굴/손/문서 framing
• stamp close-up
• phone
• parcel
• postcard

그 공간에 다른 NPC나 가구를 배치하지 않는다.

---

# 13. Gesture Clearance

NPC 주변에는 팔을 뻗을 공간 필요.

특히:

• document handoff
• pointing
• chalkboard
• report close
• handshake

벽/다른 사람과 최소 여유 확보.

---

# 14. Work Anchor

작업대 NPC는:

• torso가 table을 뚫지 않음
• 팔 reach 가능
• player가 뒤를 지나갈 통로 확보
• 다른 NPC와 작업 공간 겹치지 않음

---

# 15. Chair Blocking

착석 NPC 주변:

• 의자 뒤 0.5m 이상 여유 권장
• 일어설 전방 공간
• 다리/책상 clearance
• 다른 NPC 경로와 겹치지 않음

---

# 16. 일반 연구자 배치

일반 NPC는 공간 밀도를 만들지만 핵심 동선을 막지 않는다.

우선순위가 낮은 위치:

• 벽 쪽 작업대
• 보조 기록대
• 측면 칠판
• 깊이감 있는 배경

---

# 17. 일반 NPC가 주요 NPC를 가리지 않기

대화/시네마틱 카메라 프레임에서 일반 NPC가 foreground를 지나가지 않게 한다.

story sequence 시작 시 해당 경로 비활성 또는 yield.

---

# 18. NPC 시야 차단

NPC가 서로 겹쳐 보이는 문제도 실제 겹침만큼 중요하다.

카메라 기준으로:

• 머리와 머리가 정확히 겹치지 않게
• 실루엣 분리
• 깊이 차이
• 좌우 offset

사용.

---

# 19. 계층적 배치

그룹 장면은 한 줄로 세우지 않는다.

사용:

• foreground
• midground
• background

하지만 player의 중요한 시야를 막지 않음.

---

# 20. CH1 Director Office

Richard 입장 장면 기본 구성:

```text
door
↓
entry path
↓
Richard presentation anchor
↓
desk
↓
player
```

문에서 책상까지 직선 동선은 유지하되,
책상 모서리와 chair를 피하는 waypoint 확보.

Richard가 player와 desk 사이에 너무 깊게 들어오지 않는다.

---

# 21. CH1 문서 전달 위치

Richard:
desk 반대편 또는 측면.

player:
desk 작업 위치.

문서가 두 사람 사이 reach 영역에 들어오되,
커피/도장/다른 문서와 겹치지 않는다.

---

# 22. CH2 Chalkboard

Enrico와 여러 연구자가 있는 공간.

칠판 앞 최소 폭:

```text
약 2.5~3.5m
```

여러 사람이 서도 player가 접근 가능.

연구자들은 완전한 일렬 배치 금지.

---

# 23. CH2 논쟁 배치

예:

```text
Researcher A   Enrico   Researcher B
       chalkboard
Researcher C           Researcher D
          player approach
```

실제 좌표는 chapter layout에서 확정.

player가 Enrico에게 접근할 중앙/측면 통로 확보.

---

# 24. CH3 Instrumentation Room

CRT와 장비가 많아 좁아지기 쉬움.

필수:

• player path
• Luis work anchor
• instrument inspect zone
• 기록지 비교 위치
• camera close-up 공간

케이블/카트가 통로를 가리지 않게 한다.

---

# 25. CH4 John Waiting

John은 player office에 이미 기다림.

John 위치:

• door를 막지 않음
• player spawn과 겹치지 않음
• desk interaction zone 밖
• player가 들어오자 자연스럽게 보이는 위치

의자에 앉아 있을 경우 일어설 공간 필수.

---

# 26. CH5 Material Test Room

George 장면은 큰 충격음 이후 시작.

필수:

• test chamber 출구
• George 등장 path
• player safe zone
• report review table
• retest equipment
• 재방문 시 George work anchor

George가 빠르게 나와도 player와 충돌하지 않는 entry path 필요.

---

# 27. CH5 갈등 장면

George와 player 사이 거리는 평소보다 약간 넓게 유지할 수 있다.

목표:

긴장감은 자세와 대사로 만들고
물리적 위협으로 만들지 않는다.

George가 player 방향으로 한 걸음 더 들어오는 연출은 기본적으로 사용하지 않는다.

---

# 28. CH6 Night Measurement

어두운 공간에서 Emilio가 player에게 보이는 위치 확보.

계수기 소리를 따라 왔을 때:

• 등/옆모습으로 작업 중
• player 접근 시 자연스럽게 돌아봄

좁은 장비 사이에서 player와 Emilio가 서로 길을 막지 않음.

---

# 29. CH7 Test Control

경보 중 NPC 동선과 player 진입이 겹치기 쉬움.

필수:

• player가 통제실로 들어오는 lane
• 일반 NPC 이동 lane
• Kenneth stationary zone
• incident evidence table
• camera area

일반 NPC가 player에게 정면으로 달려오지 않게 한다.

---

# 30. CH7 Kenneth 위치

Kenneth는 사고 직후:

• control console 근처
• report/evidence zone 접근 가능
• 출입문에서 충분히 떨어짐

player가 방에 들어오면 자연스럽게 보이는 위치.

---

# 31. CH8 Final Review Room

가장 중요한 blocking 장면 중 하나.

필수:

• player
• Hans
• 7명의 주요 연구자
• final report table
• approved archive
• stamp area
• central display
• player 이동 통로

8명을 전부 테이블 가장자리에 빽빽하게 붙이지 않는다.

---

# 32. CH8 기본 그룹 구조

권장 구조:

```text
      Richard      Enrico

Luis      Hans / Report      John

George                  Emilio

      Kenneth

          Player
```

실제 배치는 방 형태에 따라 조정.

핵심:

Hans가 중심.

다른 7명은 반원/비대칭.

player 앞 중앙 통로 확보.

---

# 33. CH8 Hans 위치

Hans는 report table을 기준으로 player 정면 또는 약간 비껴 있음.

player ↔ Hans 시야를 다른 NPC가 막지 않는다.

Hans 뒤에 중앙 display가 있더라도 머리와 display 핵심 텍스트가 겹치지 않게 한다.

---

# 34. CH8 다른 NPC

각자 반응이 보일 정도로 분산.

Richard와 Luis를 같은 depth에 겹쳐 놓지 않는다.

John은 조금 측면.

George는 팔짱/자세 변화를 할 공간 확보.

Kenneth는 앉을 필요는 없음.

---

# 35. CH8 이름 호명 카메라

Hans가 이름을 부를 때 작은 시선 이동만으로 해당 NPC를 볼 수 있게 배치.

카메라가 매번 90° 이상 돌아야 하는 위치 금지.

---

# 36. CH8 REJECTED 장면

player가 stamp를 찍는 순간:

• Hans가 report 가까이
• 다른 NPC 일부 peripheral view
• 아무도 stamp path를 가리지 않음

NPC 손이 도장 영역에 들어오지 않게 한다.

---

# 37. CH8 수정 몽타주

회의실 blocking을 그대로 작업실에 복제하지 않는다.

각 인물은 해당 작업공간의 canonical work anchor 사용.

---

# 38. CH8 최종 승인

APPROVED 후 small celebration.

player 주변을 NPC가 둘러싸 원형으로 막지 않는다.

player 앞/옆 통로 유지.

---

# 39. CH9 Board Room

CH8 공간과 같은 시설을 이어갈 수 있다.

전광판 view zone이 가장 중요.

player가 실제로 화면을 볼 수 있는 직선 시야 확보.

---

# 40. Board View Zone

player standing zone:

• display 중앙과 정렬
• 너무 가까워 화면 끝이 잘리지 않음
• 너무 멀어 글자가 작지 않음
• NPC reaction이 주변에 보일 여유

정확한 거리는 board 크기와 camera FOV로 확정.

---

# 41. CH9 NPC 기본 배치

NPC는 전광판 앞을 가로막지 않는다.

권장:

```text
      BOARD

Richard      Enrico

Luis           John

George        Emilio

Kenneth   Hans

      PLAYER
```

실제는 비대칭으로 조정.

Hans는 player와 board 사이 중앙에 서지 않는다.

---

# 42. CH9 깊이 배치

모든 NPC가 동일한 거리로 한 줄 서지 않는다.

예:

• Richard/Enrico 앞쪽 측면
• Luis/John 중간
• George/Emilio 뒤쪽
• Kenneth seated candidate
• Hans player 가까운 측면

---

# 43. CH9 첫 섬광

NPC 실루엣이 전광판 흰빛에서 읽히도록 위치.

너무 화면 바로 앞이면 검은 실루엣이 영상 내용을 가림.

---

# 44. CH9 Luis step-back

Luis가 반 걸음 뒤로 갈 공간을 사전에 확보.

뒤에 다른 NPC나 의자 없음.

---

# 45. CH9 George turn-away

George가 몸을 돌릴 때 옆 NPC와 팔/어깨가 겹치지 않는 공간 필요.

최소 한 사람 폭의 측면 clearance.

---

# 46. CH9 Kenneth seat

Kenneth가 앉는 연출을 사용할 경우:

• board를 볼 수 있는 chair
• seat approach
• front clearance
• 다른 NPC 시야를 가리지 않음

chair가 없으면 앉는 반응을 억지로 넣지 않는다.

---

# 47. CH9 Hans glance

Hans는 player 시야 peripheral 안에 있어야 한다.

player를 보려는 순간 카메라가 강제로 크게 돌지 않아도 인식 가능.

---

# 48. CH9 blackout

완전 어둠 전까지 player가 NPC 몸 내부에 있지 않도록 blocking 유지.

blackout 직전 NPC가 player 쪽으로 이동하지 않음.

---

# 49. Player Critical Path

각 chapter에서 player가 반드시 지나야 하는 경로를 표시.

예:

```text
spawn
→ chapter target
→ review area
→ stamp area
→ exit/next event
```

NPC anchor가 critical path 위에 오래 머물지 않는다.

---

# 50. Critical Path Width

권장 최소:

```text
1.0~1.2m
```

주요 통로.

다인원/교차 동선:

```text
1.4~1.8m
```

정확한 값은 Spatial/Collision 문서에서 확정.

---

# 51. NPC Work Lane

workstation 뒤를 player가 지나갈 필요가 없다면 좁아도 됨.

하지만 player 필수 동선은 충분히 넓게.

---

# 52. Camera Occlusion Check

각 important anchor에서 camera forward cone에:

• 벽
• 기둥
• 일반 NPC
• 큰 장비

가 들어오는지 검사.

---

# 53. Interaction Reach

대화/문서/장비 interaction zone과 NPC anchor가 서로 호환되어야 한다.

예:

NPC가 문서를 내미는데 player가 reach 밖에 있으면 blocking 실패.

---

# 54. Handoff Geometry

문서 전달:

player와 NPC 사이에 책상 edge가 있으면 손이 책상을 뚫지 않게 한다.

필요하면 NPC가 조금 측면.

---

# 55. Stamp Area

stamp 영역 주변:

• NPC 손 없음
• 커피 없음
• 연필 없음
• 다른 문서 없음
• camera line 확보

도장을 찍을 때 NPC가 너무 가까이 서서 팔이 카메라를 가리지 않음.

---

# 56. Multi-NPC Conversation

두 명 이상이 대화에 참여하는 경우:

player를 중심으로 부채꼴.

화자 전환 시 camera가 20~45° 정도만 움직여도 되는 배치 권장.

90° 이상 반복 회전 금지.

---

# 57. Three-Person Triangle

예:

```text
NPC A        NPC B

      PLAYER
```

두 NPC 사이 거리는 너무 넓지 않게.

player가 두 사람을 고개로 따라갈 수 있는 범위.

---

# 58. Group Crescent

CH8/CH9:

player 전방의 완만한 반원.

하지만 완벽한 대칭 금지.

비대칭이 더 자연스럽다.

---

# 59. NPC가 카메라 바로 뒤에 서지 않기

시네마틱 시작 시 player 뒤에 NPC가 가까이 있으면 카메라 회전 때 clipping 가능.

중요 장면에서 player rear safe zone 확보.

---

# 60. Rear Safe Zone

대화/시네마틱 중 player 뒤 약 0.6~0.9m 이내에 NPC가 장기 정지하지 않게 한다.

정확한 값은 collision 문서.

---

# 61. Player Spawn

NPC anchor는 player spawn으로부터 충분히 떨어짐.

spawn 직후 몸 안에서 시작하는 문제 금지.

---

# 62. Spawn View

chapter 시작 시 player가 최소 한 주요 인물/환경 cue를 볼 수 있게 한다.

그러나 핵심 NPC가 화면 중앙 0.5m 앞에서 서 있는 과도한 배치 금지.

---

# 63. Door Swing

door swing area에:

• NPC anchor
• player interaction zone
• parcel
• chair

배치 금지.

---

# 64. CH10과 NPC Blocking

CH10에는 주요 연구자 NPC가 없음.

전화 상대는 물리 NPC가 아님.

따라서 이 문서의 NPC blocking은 주로 CH1~9에 적용.

---

# 65. General NPC Density

CH1:
낮음.

CH2~4:
중간.

CH5~7:
기능 공간에 맞게.

CH8:
높음.

CH9:
주요 8명 중심.

일반 NPC 수를 늘려 진행률을 표현할 때도 critical path 유지.

---

# 66. NPC Layering

foreground 일반 NPC가 story NPC 얼굴을 가리는 상황 금지.

필요하면 camera event 시작 시 일반 NPC를 side anchor로 이동.

---

# 67. Occlusion Reservation

중요 cinematic 동안 camera cone을 temporary reserved area로 설정할 수 있다.

일반 NPC route가 그 영역을 통과하지 않게 한다.

---

# 68. Standing Rotation Radius

NPC가 180° 돌아설 수 있는 공간 확보.

벽/책상에 너무 붙어 있으면 turn animation이 관통.

anchor 주변 회전 radius 고려.

---

# 69. Large Gesture Radius

George, Hans 등의 큰 document/report 동작은 작은 idle보다 더 넓은 clearance 필요.

chapter blocking에서 gesture profile을 anchor metadata로 둘 수 있다.

---

# 70. Blocking Metadata

예:

```js
{
  anchorId: "ch05_george_review",
  gestureProfile: "MEDIUM",
  rearClearance: 0.6,
  sideClearance: 0.5,
  cameraClearance: 0.8
}
```

---

# 71. Seat Metadata

```js
{
  seatId,
  seatAnchor,
  standAnchor,
  approachAnchor,
  facing,
  occupied
}
```

착석과 기립을 안정적으로 연결.

---

# 72. 이동과 Blocking 연결

NPC route는 anchor 사이를 연결.

anchor는 안전하지만 route 중간이 책상/벽을 통과하면 실패.

Blocking 문서는 waypoint corridor도 함께 고려.

---

# 73. Player가 blocking을 깨는 경우

player가 NPC anchor 위에 서면:

• 대체 anchor
• wait
• small normalization

사용.

NPC가 player 내부로 들어가지 않음.

---

# 74. NPC가 서로 blocking하는 경우

destination reservation 우선.

스토리 NPC가 우선.

일반 NPC는 yield anchor.

---

# 75. 그룹 장면 진입

8명을 한 번에 자리 이동시키기보다 canonical start position을 적극 활용.

페이지 전환 구조의 장점 사용.

CH8 시작 시 이미 자연스럽게 모여 있어도 됨.

---

# 76. Blocking과 페이지 분리

각 chapter HTML은 해당 시점의 canonical layout을 새로 구성.

이전 chapter NPC exact transform을 이어받지 않는다.

스토리 continuity는 fade/시간 흐름으로 연결.

---

# 77. Blocking과 소품

소품 배치 전 critical blocking volume을 미리 예약.

예:

```text
NO_PROP_ZONE
PLAYER_PATH
NPC_PATH
CAMERA_ZONE
DOOR_SWEEP
GESTURE_ZONE
```

이 영역에는 나중에 장식품을 넣지 않는다.

---

# 78. 바닥 clutter

박스/케이블/종이로 busy한 연구실을 만들더라도 NPC/player route 밖에 둔다.

“지저분한 공간”과 “움직일 수 없는 공간”을 혼동하지 않는다.

---

# 79. 테이블 clutter

문서/컵/도구는 stamp/document interaction zone 밖.

시각적 밀도는 side/rear area에서 만든다.

---

# 80. Blocking QA View

개발 모드에서 표시:

• player path
• NPC path
• conversation anchor
• work anchor
• camera cone
• door swing
• gesture clearance
• reserved zone
• occupancy

---

# 81. CH8 QA

반드시 검사:

• 8명 서로 안 겹침
• player 중앙 통로
• Hans 시야 확보
• 이름 호명 시 해당 NPC 시야
• stamp area clear
• approval 후 작은 이동 가능
• 일반 NPC가 frame 가리지 않음

---

# 82. CH9 QA

반드시 검사:

• board 화면 안 가림
• player VIEW RESULTS zone clear
• NPC 8명 실루엣 분리
• Luis step-back 공간
• George turn-away 공간
• Kenneth seat 가능 여부
• Hans glance 인식 가능
• blackout 직전 player/NPC 겹침 없음

---

# 83. 기본 실패 사례

• NPC가 문 앞을 막음
• player가 책상과 NPC 사이에 갇힘
• 대화 카메라에서 NPC 머리가 겹침
• 문서 전달 손이 책상 통과
• George 팔이 옆 NPC 침범
• CH8 한 줄 배치
• CH9 board 가림
• chair 기립 공간 없음
• door swing에 NPC 있음
• player spawn과 NPC 겹침
• camera rear zone에 NPC 있음
• 장식품 추가 후 route 막힘

---

# 84. 금지사항

• 보기 좋은 대칭만 우선
• 한 줄 정렬
• 출입문 standing
• player critical path 점유
• camera cone 통과
• NPC끼리 shoulder overlap
• anchor만 안전하고 path는 벽 통과
• 의자/책상 clearance 무시
• stamp zone clutter
• CH8 player 포위
• CH9 전광판 앞 NPC 배치
• 장식이 blocking보다 우선

---

# 85. 후속 문서와의 연결

`10_ANIMATION_CORE.md`
• anchor 간 이동과 pose transition의 실행 구조 지원

`11_OBJECT_ANIMATION.md`
• handoff/door/seat와 blocking 위치 일치

`16_FACILITY_ARCHITECTURE.md`
• 방과 통로가 blocking 구조를 수용

`17_SPATIAL_LAYOUT.md`
• 실제 방 치수와 동선 폭 확정

`18_COLLISION_AND_CLEARANCE.md`
• player/NPC/door/gesture clearance 최종 수치 확정

`19_FACILITY_PROGRESS.md`
• 진행률 증가에 따른 NPC 밀도 변화가 critical path를 침범하지 않게 함

`28_PERFORMANCE.md`
• CH8/CH9 인원 수와 업데이트 비용 검토

<!-- MERGED SOURCE END: 09_NPC_BLOCKING.md -->
