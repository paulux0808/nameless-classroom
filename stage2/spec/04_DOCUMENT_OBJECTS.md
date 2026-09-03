<!-- MERGED SOURCE START: 13_DOCUMENT.md -->

# 13_DOCUMENT.md

# DOCUMENT SPECIFICATION

이 문서는 게임 전체에서 사용되는 연구 문서, 계산 카드, 기록지, 로그, 보고서, 일정표, 검열 문서, 승인 기록, 최종 보고서, 사진 뒷면 기록, 엽서 등 “읽을 수 있는 물리 정보 매체”의 공통 설계 규칙을 정의한다.

범위:

• 종이 크기와 비율
• 문서 계층
• 타자기 텍스트
• 손글씨/연필 표시
• 날짜
• 문서 번호
• 배치 번호
• 버전
• 수정 흔적
• 검열선
• 앞면/뒷면
• 비교
• 승인/반려 흔적
• archive 편입
• 재제출본과 이전본 구분
• 정보 가독성
• 퍼즐 단서 배치
• 스포일러 차단
• 모바일 가독성
• 문서 상태 관리

실제 문서 집기/놓기/뒤집기 애니메이션은 `11_OBJECT_ANIMATION.md`,
상호작용은 `04_INTERACTION.md`,
도장은 `14_STAMP.md`,
UI 표현은 `23_UI.md`가 담당한다.

---

# 1. 기본 원칙

문서는 “텍스트가 적힌 UI 패널”이 아니라 게임 세계의 물리적 증거다.

플레이어는 문서의 내용을 읽는 것뿐 아니라 다음도 본다.

• 언제 작성되었는가
• 어떤 장비와 연결되는가
• 어떤 배치에서 나온 값인가
• 이전 버전인가
• 누가 고쳤는가
• 무엇이 지워졌는가
• 어떤 줄이 덧붙었는가
• 어떤 문서와 모순되는가
• 어떤 기록이 승인되었는가
• 어떤 기록이 반려되었는가

퍼즐의 핵심은 문서의 “내용”과 “맥락”을 함께 읽는 것이다.

---

# 2. 문서 유형

공통 유형:

```text
REPORT
CALCULATION_SHEET
CALCULATION_CARD
LOG
EQUIPMENT_RECORD
CALIBRATION_SHEET
TEST_RECORD
INCIDENT_REPORT
SCHEDULE
MEMO
CHART
GRAPH
MAP
PHOTO
POSTCARD
ARCHIVE_RECORD
```

챕터별 특수 문서는 가능하지만 공통 분류 안에서 의미가 드러나게 한다.

---

# 3. 문서의 시각 계층

문서 한 장에 모든 정보를 같은 크기로 배치하지 않는다.

권장 계층:

```text
HEADER
IDENTIFIER
DATE / VERSION
MAIN CONTENT
ANNOTATION
FOOTER / SIGNATURE / STAMP AREA
```

플레이어가 먼저 무엇을 읽어야 하는지 자연스럽게 구분된다.

---

# 4. Header

Header에는 문서의 기능을 나타내는 짧은 제목.

예:

```text
CALCULATION RECORD
CALIBRATION LOG
EQUIPMENT REPLACEMENT
TEST SUMMARY
INCIDENT RECORD
FINAL REVIEW COPY
```

금지:

퍼즐 답을 직접 제목으로 쓰기.

예:

```text
WRONG VALUE REPORT
OUTDATED STANDARD
INVALID CALIBRATION
```

---

# 5. Document Identifier

문서에는 필요한 경우 고유 식별자를 둔다.

예:

```text
CR-17
LOG-B4
CAL-03
TEST-R2
IR-07
```

이 식별자가 puzzle clue가 될 수 있다.

하지만 무의미한 번호를 너무 많이 만들어 정보 소음을 만들지 않는다.

---

# 6. 날짜

날짜는 중요한 단서가 될 수 있다.

표현은 프로젝트 전체에서 일관되게.

권장:

```text
12 MAR 1943
05 AUG 1944
```

또는 챕터별 문서 양식에 맞춘 고정 형식.

한 챕터에서:

`03/12/43`
`12 March 1943`
`1943-03-12`

를 무작위 혼용하지 않는다.

---

# 7. 시간

CH7 incident 등 필요할 때만 시간 표기.

예:

```text
14:32:08
```

또는 장비 기록 양식에 맞는 형식.

시간 퍼즐에서 시계 offset이 핵심이라면 원본 기록의 시간 형식을 그대로 유지하고, 플레이어가 비교할 수 있게 한다.

---

# 8. Version

버전 정보는 CH1, CH4, CH8 등에서 중요한 단서가 될 수 있다.

예:

```text
REV. A
REV. B
COPY 2
SUPERSEDED
REVISED
```

버전 위치는 문서마다 완전히 랜덤하지 않게 한다.

---

# 9. Batch / Sample / Unit Identifier

실험/시료/계산 연결에 필요한 경우:

```text
BATCH 17-A
SAMPLE B
UNIT 03
CHANNEL C
```

같은 식별자 사용.

플레이어가 서로 다른 문서의 연결 관계를 비교할 수 있어야 한다.

---

# 10. 문서 단서의 원칙

단서는 한 문서의 빨간 표시 하나로 끝나지 않는다.

좋은 구조:

```text
문서 A의 날짜
+
문서 B의 장비 교체 기록
+
문서 C의 교정 시점
```

을 비교해야 결론이 나옴.

---

# 11. 정답 색칠 금지

금지:

• 오류 숫자만 빨간색
• 정답 행에 glow
• 잘못된 문서만 찢어져 있음
• 오답 문서는 흐리게
• 핵심 단서에 화살표

문서는 객관적 자료처럼 보여야 한다.

---

# 12. 시각적 차이는 정보 종류를 표현

색/굵기/표식은 “정답 여부”가 아니라 정보 출처를 표현.

예:

• 타자기 본문
• 연필 메모
• 도장
• 수정선
• 검열선
• 표준 양식 인쇄

---

# 13. 타자기 텍스트

1940년대 문서 느낌.

특징:

• 약간 불균일한 문자 압력
• 완벽한 디지털 정렬을 피함
• 고정폭 또는 타자기 계열 인상
• line spacing 충분

하지만 실제 가독성을 희생하지 않는다.

---

# 14. 타자기 효과 과장 금지

모든 글자를 랜덤하게 기울이거나 번지게 만들지 않는다.

퍼즐 텍스트는 명확히 읽혀야 한다.

---

# 15. 손글씨

손글씨/연필 메모는 다음 용도.

• 빠른 수정
• 계산 메모
• 체크 표시
• 참조 번호
• 의문 표시
• 날짜 정정

문서 본문 전체를 손글씨로 만들어 읽기 어렵게 하지 않는다.

---

# 16. 연필 표시

연필은 잉크보다 약한 contrast.

하지만 모바일에서도 읽을 수 있어야 한다.

핵심 단서라면 너무 옅게 하지 않는다.

---

# 17. 수정선

기존 값을 취소할 때:

• 한 줄 또는 두 줄
• 원본이 어느 정도 보임

완전히 검게 지워 정보 비교를 불가능하게 하지 않는다.

단, 의도된 검열은 별도.

---

# 18. 덧쓰기

수정된 값은:

• 옆
• 위
• margin

에 기록 가능.

수정 흔적이 실제 사람이 고친 느낌을 주되 퍼즐 정보가 엉키지 않게 한다.

---

# 19. 검열선

CH1~8의 surname, project identity 등에는 검열 표현 가능.

기본:

```text
RICHARD ███████
PROJECT ███████
```

검열선은 실제 텍스트 위에 시각적으로 덮는 방식.

---

# 20. 검열선 아래 텍스트 노출 방지

단순 검은 plane 뒤에 실제 텍스트가 렌더되어 camera angle, transparency, antialiasing 때문에 보이는 방식 금지.

안전한 방식:

• censored texture 자체에 surname을 넣지 않음
• 또는 별도 text layer를 비활성

Final Archive 때만 실제 이름 texture/텍스트를 생성.

---

# 21. 개발용 내부 이름과 표시 문자열 분리

내부 id:

```text
npc_richard_feynman
```

가능.

그러나 문서 렌더 함수가 id를 직접 표시하지 않는다.

반드시 public label 사용.

---

# 22. 프로젝트명

CH1~8:

```text
PROJECT ███████
```

또는 프로젝트명을 아예 생략.

`MANHATTAN PROJECT`는 정체 공개 시점까지 player-facing 문서에서 사용하지 않는다.

---

# 23. 무기 관련 직접 표현

CH1~8 문서에서 직접 노출 금지:

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

필요한 연구는 일반화된 실험/계측/기록 언어로 표현.

---

# 24. 문서 표현의 역사성

시대감은:

• 종이 재질
• 타자기
• 스탬프
• 레이아웃
• 수정 흔적

등으로 전달.

거대한 `1943` 장식 문구를 문서마다 넣지 않는다.

---

# 25. 앞면/뒷면

모든 문서가 뒤집을 필요는 없다.

뒤집기가 의미 있는 경우만.

예:

• 사진 뒷면
• 엽서
• 일부 기록 카드
• 뒷면 메모가 단서인 문서

---

# 26. Flip 여부

문서 metadata:

```text
flippable: true/false
```

뒤집을 이유가 없는 문서에 불필요한 flip interaction을 만들지 않는다.

---

# 27. 뒷면 단서

뒷면을 사용한다면 플레이어가 뒤집을 이유를 어느 정도 느낄 수 있어야 한다.

예:

• 앞면 margin의 작은 연필 화살표
• 종이 가장자리에서 뒷면 메모가 살짝 보임
• 다른 문서가 “reverse note”를 참조

그러나 정답을 노골적으로 알려주지 않는다.

---

# 28. 문서 비교

비교는 실제 물리 문서 또는 inspect comparison UI로 가능.

공통 원칙:

• 최소 두 자료 동시 확인 가능
• 같은 단위/항목 정렬에 도움
• 핵심 차이를 자동 강조하지 않음

---

# 29. Compare Left / Right

대표:

```text
LEFT
이전 기록

RIGHT
현재 기록
```

또는:

```text
LEFT
장비 교체 로그

RIGHT
교정 기록
```

양쪽 텍스트가 모두 읽히는 크기.

---

# 30. 비교 중 확대

모바일/작은 화면에서 둘을 동시에 읽기 어려우면:

• 좌/우 focus 전환
• 확대

가능.

확대 후 원래 비교 위치로 복귀.

---

# 31. 문서 배열

여러 카드/문서를 동시에 보여줄 때:

• 겹침 최소
• 읽기 순서 명확
• 실제 책상 크기 고려

한 번에 10장을 작은 글씨로 펼치지 않는다.

필요하면 여러 묶음으로 나눈다.

---

# 32. 문서의 정보 밀도

한 장에 퍼즐에 필요한 정보 1~3개 핵심 정도.

장식 데이터가 너무 많아 중요한 비교가 묻히지 않게 한다.

---

# 33. 장식 데이터

실제 문서처럼 보이게 하는 무해한 filler 가능.

예:

• 부서 코드
• 작성자 initials
• 페이지 번호
• 장비 번호

하지만 filler가 puzzle clue처럼 보여 플레이어를 불필요하게 오도하지 않게 한다.

---

# 34. False Lead

퍼즐에 일부 false lead는 가능.

조건:

• 논리적으로 배제 가능
• 완전 무의미한 랜덤 숫자가 아님
• 플레이어가 잘못 판단해도 다시 검증 가능

---

# 35. 문서 단위

수치가 등장하면 단위를 명확히.

서로 다른 단위를 섞어 전문 지식 변환을 강요하지 않는다.

필요하면 같은 문서 안에 conversion 정보 제공.

---

# 36. 전문지식 요구 제한

문서만 보고 해결할 수 있어야 한다.

플레이어가 실제 핵물리/공학 전문 지식을 알아야만 풀리는 구조 금지.

---

# 37. CH1 계산 카드

핵심:

이전 계산의 OUTPUT
→ 다음 계산의 INPUT

연결 검증.

하지만 단순 숫자 한 자리 차이만 찾는 퍼즐로 만들지 않는다.

추가 정보:

• batch
• revision
• date
• source card id

를 활용.

---

# 38. CH1 카드 구조 예

```text
CALCULATION BATCH
CARD 04

SOURCE: CR-17
REV: B

INPUT: ...
PROCESS: ...
OUTPUT: ...
```

다음 카드:

```text
CARD 05
SOURCE: CR-17
REV: A
INPUT: ...
```

처럼 version mismatch를 발견할 수 있음.

구체 값은 챕터 PUZZLE 문서에서 확정.

---

# 39. CH2 규정 문서

여러 팀 조건과 별도 표준/규정 문서.

규정에는:

• issue date
• applicable equipment
• revision

같은 정보.

오래된 기준이라는 결론이 자동 표시되지 않는다.

---

# 40. CH3 Calibration Sheet

필수 정보 후보:

• instrument id
• calibration date
• reference clock id
• technician initials
• validity note

Equipment Replacement Log에는:

• replacement date
• old/new reference id

비교 가능.

---

# 41. CH4 Timing Sheet

일반화된 multi-channel recording.

문서 후보:

• wiring record
• equipment replacement
• model delay table
• test result

구체 무기 설계로 이어질 실제 최적화 정보를 제공하지 않는다.

---

# 42. CH5 Material Test Report

보고서에는:

```text
UNIFORM TRANSMISSION
```

같은 결론이 있을 수 있음.

다른 자료:

• sensor position map
• time record
• baseline
• material inspection

을 비교해 반복 방향성/재료 문제 추론.

---

# 43. CH6 Sample Record

두 시료가 같은 specification으로 기록되었지만 실제 측정 결과가 다름.

문서:

• sample labels
• detector log
• background record
• extended measurement
• swap record

시료 차이라는 결론을 문서 제목에 적지 않는다.

---

# 44. CH7 Incident Record

다중 시간 기록.

문서:

• automatic recorder
• witness statement
• manual log
• alarm log
• frame record

각 기록은 서로 다른 clock offset을 가질 수 있음.

---

# 45. CH7 Incident Report Draft

초기 공식 결론:

```text
EQUIPMENT FAILURE
```

플레이어가 시간축을 재구성한 뒤 다중 원인으로 수정.

수정본은 원문을 완전히 지우기보다 취소 흔적을 남길 수 있음.

---

# 46. CH8 Final Report

CH1~7 승인 자료를 합친 consolidated report.

오래된 값/표현이 다시 섞여 있을 수 있음.

예:

• Richard 이전 input
• George 재시험 전 결과
• Emilio sample identical
• Kenneth equipment failure

---

# 47. CH8 Archive 참조

플레이어가 과거 승인 결과를 다시 확인 가능해야 한다.

순수 기억력 시험 금지.

Archive는 승인된 canonical version을 제공.

---

# 48. Approved Archive

CH1~7 완료 후 핵심 승인 문서는 archive에 편입.

Archive entry는:

• chapter
• scientist first name
• approved version
• approval date/marker

정도.

surname은 여전히 검열.

---

# 49. Archive는 원본 전체 보관소가 아니다

모든 잡문서를 수십 장 보관하지 않는다.

최종 검증에 필요한 approved canonical record 중심.

---

# 50. Rejected Version

필요하면 이전 반려본도 기록 가능.

하지만 CH8 puzzle에서는 무엇이 canonical인지 명확해야 한다.

표시:

```text
REJECTED
SUPERSEDED
```

등.

---

# 51. Approved Version

승인본:

```text
APPROVED
```

도장 및 version.

최종 archive에서 canonical.

---

# 52. 동일 문서의 버전

예:

```text
REPORT_A
REPORT_B
REPORT_C
```

파일 내부 id와 player-facing revision label을 분리.

---

# 53. 재제출본 시각 차이

수정본은 완전히 새 깨끗한 문서만 고집하지 않는다.

가능:

• 새 typed copy
• 수정된 sheet
• 첨부 페이지 교체

챕터 분위기에 따라.

---

# 54. 수정 흔적의 감정

CH5처럼 장기간 재시험한 경우:

• 새 기록지
• 얼룩
• 추가 페이지
• 재작성 흔적

등으로 노력의 무게를 보여줄 수 있다.

---

# 55. 너무 극적인 훼손 금지

모든 반려본이 찢어지고 구겨지는 연출 금지.

연구 문서는 공식 기록물.

일반적으로 관리된다.

---

# 56. Coffee Stain

시대감/생활감용 얼룩 가능.

단:

• 핵심 텍스트 위 금지
• 모든 문서에 반복 금지

---

# 57. 접힌 자국

사용 가능.

하지만 실제 geometry를 너무 많이 분할해 성능 낭비할 필요 없음.

texture/normal 정도로 충분.

---

# 58. 종이 색

완전 순백색보다 약간 warm/off-white.

그러나 노란 세피아 필터처럼 과장 금지.

---

# 59. 종이 두께

3D에서 완전히 0 두께 plane만 쓰면 옆면/flip 때 부자연스러울 수 있다.

중요 inspect object는 아주 얇은 두께를 줄 수 있음.

---

# 60. 문서 그림자

책상 위에서 약한 contact shadow.

공중에 떠 보이지 않게.

---

# 61. 문서와 조명

텍스트 가독성을 위해 지나친 specular 금지.

종이는 대체로 diffuse.

---

# 62. Graph

그래프는 읽기 가능한 축과 범례를 가짐.

하지만 UI 그래프처럼 현대적인 디자인 금지.

---

# 63. Graph Color

색만으로 series 구분하지 않는다.

1940년대 문서 느낌에 맞게:

• 선 형태
• 점
• 라벨
• 기호

사용.

---

# 64. Graph Scale

퍼즐 답을 축 범위로 과장하지 않는다.

차이가 작다면 실제로 작은 차이로 보이되 비교 가능한 정보 제공.

---

# 65. Table

표는 열/행이 명확.

너무 많은 칸 금지.

핵심 비교 항목이 한 화면에 들어오게.

---

# 66. Map / Diagram

도식은 실제 무기 설계 세부를 전달하지 않는다.

일반 시설/센서 위치/신호 흐름/작업 배치 수준.

---

# 67. Weapon Geometry 차단

CH1~8에서 명백한 핵무기 형상/폭발 렌즈/폭발계통을 연상시키는 diagram 금지.

퍼즐 목적은 자료 검증이지 실제 무기 구조 이해가 아니다.

---

# 68. 사진

CH10 PHOTO는 일반 문서와 다르게 실제 이미지 중심.

앞면:
사진.

뒤:
타자/필기:

```text
HIROSHIMA
AUGUST 1945
```

---

# 69. 사진 뒷면

문구는 짧고 명확.

추가 장황한 설명은 inspect 설명/UI에서 별도.

---

# 70. 메달/토큰

문서는 아니지만 기록 텍스트 원칙 적용.

각인:

```text
FOR DISTINGUISHED SERVICE
```

실제 특정 훈장 수여 시점을 오인시키는 직접 역사 문구는 피한다.

---

# 71. 엽서 앞면

정체 공개 전 면.

player name 없음.

무해한 시각/짧은 문구 가능.

---

# 72. 엽서 뒷면

identity reveal 전 텍스트는 렌더되지 않거나 완전 숨김.

flip 완료 이후에만:

```text
TO.
J. ROBERT
OPPENHEIMER
```

순차 공개.

---

# 73. 엽서 조기 노출 방지

다음 경로 모두 검사.

• 상자 열린 상태의 높은 camera angle
• photo/medal 사이 틈
• postcard edge
• texture mip bleed
• interaction label
• inspect thumbnail
• asset filename을 UI에 출력하는 경우

---

# 74. Final Archive 카드

초기:

```text
CHAPTER 01
RICHARD ███████
```

검열 제거 후:

```text
RICHARD P. FEYNMAN
```

이 변화는 archive cinematic에서만.

---

# 75. Historical Profile Layout

짧은 구조:

```text
FULL NAME
ROLE / PROJECT
짧은 한국어 설명
```

백과사전식 장문 금지.

---

# 76. 실제 인물 이름 철자

Final Archive에서 정확한 표기 사용.

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

# 77. 이름 검열 제거

검열선이 사라질 때 원래 surname texture가 이미 밑에 있어 비쳐 보이는 방식보다:

• censored label
→ animation
→ full label

로 안전하게 교체.

---

# 78. 페이지 번호

여러 페이지 문서:

```text
PAGE 1 OF 3
```

가능.

퍼즐상 필요한 페이지 수만.

10페이지 보고서를 실제로 모두 읽게 하지 않는다.

---

# 79. Page Navigation

페이지 넘김이 필요하면:

• 이전/다음
• 물리 page flip 또는 단순 document stack

가능.

중요 정보가 몇 페이지 뒤에 무작위로 숨겨져 있지 않게 한다.

---

# 80. 문서 읽기 순서

읽기 순서를 완전히 강제하지 않는다.

그러나 layout과 제목으로 자연스럽게 유도.

---

# 81. 문서 상태

권장 상태:

```text
WORLD
HELD_BY_NPC
HELD_BY_PLAYER
INSPECTING
ON_DESK
IN_COMPARE
REJECTED
APPROVED
ARCHIVED
SUPERSEDED
```

---

# 82. Logical Status와 Physical Location 분리

예:

`APPROVED`이면서 `ARCHIVED`.

또는 `REJECTED`이면서 `HELD_BY_NPC`.

하나의 enum으로 모든 의미를 억지로 합치지 않는다.

---

# 83. Document Metadata

권장:

```js
{
  id,
  type,
  title,
  publicAuthor,
  date,
  revision,
  batch,
  pages,
  flippable,

  logicalStatus,
  ownerId,
  locationSlotId,

  spoilerLevel,
  archiveEligible
}
```

---

# 84. Public Author

CH1~8:

```text
RICHARD ███████
```

또는 first name / initials.

실제 surname 노출 금지.

---

# 85. Signature

실제 인물 서명을 정교하게 재현할 필요 없음.

surname이 노출되는 서명 금지.

필요하면 initials 또는 검열.

---

# 86. Initials 주의

실제 surname을 쉽게 유추할 수 있는 initials가 스포일러가 될 수 있다면 사용하지 않는다.

---

# 87. Document Spoiler Level

내부 등급 가능:

```text
SAFE_CH1_8
SAFE_CH9
IDENTITY_REVEALED
FINAL_ARCHIVE
```

문서 렌더 시 현재 story state보다 높은 등급 정보 출력 금지.

---

# 88. Runtime Text Audit

개발 빌드에서 현재 chapter 화면에 렌더된 문서 문자열을 수집해 금지어 검사 가능.

대표 금지어 목록은 `29_SPOILER_RULES.md`.

---

# 89. Texture Spoiler Audit

텍스트뿐 아니라 texture 자체에도 실제 surname/weapon term이 숨어 있지 않은지 검사.

---

# 90. Asset Reuse 주의

Final Archive용 full-name texture를 CH1~8 문서 material에 실수로 연결하지 않는다.

---

# 91. CanvasTexture

문서 텍스트를 CanvasTexture로 생성할 경우 매 frame 업데이트 금지.

문서 생성/상태 변경 때만 render.

---

# 92. Texture Resolution

inspect 상태에서 읽을 수 있어야 한다.

낮은 해상도를 카메라를 과도하게 가까이 가져가 보완하지 않는다.

---

# 93. Mipmapping

작은 거리에서 text blur가 심하면 texture 설정 조정.

하지만 멀리 있는 문서 글자가 전부 읽혀야 할 필요는 없다.

---

# 94. Desktop 가독성

inspect pose에서:

• 헤더 즉시 읽힘
• 핵심 본문 적절한 크기
• 작은 annotation도 확대 없이 너무 작지 않음

---

# 95. Mobile 가독성

모바일은 같은 physical document라도 화면이 작다.

해결 우선순위:

1. 문서 layout 단순화
2. inspect 시 화면 점유 확대
3. 필요하면 zoom
4. 마지막에만 font 조정

---

# 96. Mobile 최소 글자

정확한 px은 `27_MOBILE.md`에서 확정.

공통 요구:

일반적인 스마트폰 가로 화면에서 핵심 문구가 확대 없이 읽히거나 한 단계 확대만으로 읽혀야 한다.

---

# 97. 문서 UI 중복 금지

3D 문서를 띄워놓고 같은 내용을 화면 오른쪽 거대한 텍스트 패널에 그대로 복제하지 않는다.

필요한 접근성 확대/번역 기능과는 구분.

---

# 98. 번역

게임 표시 언어가 한국어여도 문서의 시대감 때문에 Header/Label은 영어일 수 있다.

핵심 퍼즐 정보는 플레이어가 이해할 수 있어야 함.

방식:

• 영어 원문 + 짧은 한국어 보조
• 또는 선택 언어별 문서 texture

최종 UI/Localization 정책에서 확정.

---

# 99. 언어 혼용

문서 한 장 안에서 무작위로 한글/영문을 섞지 않는다.

영어 양식 + 한국어 게임 보조가 있다면 시각 계층 분리.

---

# 100. 문서 설명문

inspect 시 짧은 game-readable 설명을 붙일 수 있음.

예:

```text
장비 교체 기록이다.
교체 날짜가 적혀 있다.
```

하지만:

```text
이 기록을 교정표와 비교하면 기준 시계가 나중에 교체되었음을 알 수 있다.
```

처럼 정답을 설명하지 않는다.

---

# 101. Description 과용 금지

모든 문서에 해설 문단을 붙이지 않는다.

가능하면 문서 자체로 이해.

---

# 102. 발견한 단서 기록

필요하면 player가 핵심 정보를 발견했는지 내부 flag 저장.

하지만 문서 위에 “CLUE FOUND” 표시 금지.

---

# 103. 재열람

이미 읽은 문서는 다시 볼 수 있어야 하는 경우가 많다.

특히:

• CH8 approved archive
• 복잡한 비교 퍼즐

재열람이 story sequence를 다시 실행하지 않게 한다.

---

# 104. 완료 문서의 interaction

완료 후:

• 간단 inspect 가능
또는
• archive로 이동

챕터별 결정.

같은 설명/대사를 매번 반복하지 않음.

---

# 105. Document Archive UX

Archive는 메뉴형 백과사전보다 실제 approved file drawer / binder / desk stack 느낌을 우선.

정확한 구현은 CH8 및 UI 문서에서 결정.

---

# 106. Archive 접근성

CH8 final audit 중 player가 과거 승인 정보를 쉽게 재확인할 수 있어야 함.

찾기 위해 시설 전체를 다시 돌아다니게 하지 않는다.

---

# 107. CH8 Archive Index

예:

```text
RICHARD ███████
ENRICO ███████
LUIS ███████
JOHN ███████
GEORGE ███████
EMILIO ███████
KENNETH ███████
```

선택 후 해당 approved record.

surname은 검열.

---

# 108. Archive에서 정답 표시 금지

CH8 final report와 archive를 비교할 때 mismatch를 자동 표시하지 않는다.

플레이어가 직접 확인.

---

# 109. Stamp Area

문서 하단 또는 빈 영역에 stamp가 찍힐 공간을 미리 설계.

중요 본문 위에 도장이 겹쳐 읽을 수 없게 하지 않는다.

---

# 110. REJECTED Ink 영역

반려 도장이 핵심 퍼즐 정보/서명을 완전히 가리지 않게 한다.

---

# 111. APPROVED Ink 영역

승인 도장도 동일.

CH8 Final Report는 마지막 승인 도장이 충분히 읽히는 영역 필요.

---

# 112. Stamp 누적

같은 물리 문서에 REJECTED와 APPROVED를 둘 다 덮어찍을지 여부는 챕터별.

기본적으로 재제출본은 별도 revision이므로 서로 다른 physical document일 수 있다.

---

# 113. Rejected Copy 보존

스토리상 필요하면 이전본을 archive/superseded stack에 보관.

하지만 player desk를 계속 채워 clutter 만들지 않는다.

---

# 114. 물리 서류량

진행이 올라갈수록 서류가 늘어날 수 있음.

그러나 핵심 interaction slot을 침범하지 않는다.

---

# 115. Facility Progress 표현

CH1:
정돈된 적은 서류.

CH5:
재시험 관련 문서 증가.

CH8:
많은 compiled records.

실제 clutter는 `19_FACILITY_PROGRESS.md`에서 확정.

---

# 116. 문서가 바닥에 떨어지는 연출

기본적으로 사용하지 않는다.

공식 연구시설에서 중요한 문서를 매번 바닥에 흩뿌리는 연출은 과장.

필요한 사건에만.

---

# 117. Incident Documentation

CH7에서는 사고로 급히 작성된 일부 기록이 조금 거칠 수 있음.

그래도 핵심 시간 정보는 읽을 수 있어야 한다.

---

# 118. 문서 손상

찢김/물/화재 같은 극단적 손상은 현재 기본 기획에 불필요.

퍼즐 난이도를 시각 노이즈로 만들지 않는다.

---

# 119. Document Animation과 Data

문서를 flip/rotate해도 텍스트의 logical side와 실제 visible side가 일치해야 한다.

---

# 120. Side State

예:

```text
visibleSide = FRONT
```

flip 완료 후:

```text
visibleSide = BACK
```

중간 rotation에서 state를 미리 BACK으로 commit하지 않는다.

---

# 121. Page State

여러 페이지:

```text
currentPage
```

page flip 완료 후 commit.

---

# 122. Focus Loss

문서 inspect 중 focus loss:

• 문서가 inspect anchor에 안정적으로 유지
• held input reset

animation 중이었다면 safe side/page로 완료.

---

# 123. Reload

중간 flip angle 저장 금지.

safe checkpoint에서 FRONT/BACK 같은 logical side만 복구 가능.

---

# 124. Missing Texture

핵심 문서 texture 누락 시 blank paper로 진행시키지 않는다.

개발:
error.

배포:
fallback readable text surface 필요.

---

# 125. Font Failure

커스텀 font 로딩 실패해도 텍스트가 사라지지 않게 fallback font.

시대감보다 가독성이 우선.

---

# 126. Text Overflow

문서 생성 시 텍스트가 영역 밖으로 나가면 자동으로 무조건 font를 줄이지 않는다.

개발 단계에서 overflow warning.

문장을 재작성/레이아웃 수정.

---

# 127. Localization Overflow

언어 변경 시 길이가 달라짐.

문서 양식별 max line/box 검증.

---

# 128. 개발용 Document Inspector

표시 가능:

```text
documentId
type
owner
logicalStatus
revision
currentSide
currentPage
slot
spoilerLevel
archiveEligible
```

---

# 129. 문자열 감사

개발 모드에서 현재 loaded document strings 검색.

CH1~8에서 금지 surname/weapon term 존재 시 error 또는 warning.

---

# 130. 퍼즐 QA

각 퍼즐 문서 세트에서 검사:

• 필요한 모든 단서 실제 존재
• 단서끼리 논리 연결 가능
• 정답 색칠 없음
• 오답도 합리적으로 검토 가능
• 전문 외부지식 불필요
• 문서 날짜/버전 모순이 의도치 않게 추가되지 않음
• font/scale readable
• mobile에서 동일 논리 가능

---

# 131. 서사 QA

문서가 인물 대사와 모순되지 않는지 검사.

예:

Luis가 “지난주에 교정했습니다.”라고 말했는데 calibration sheet 날짜가 3개월 전이면 의도 여부 확인.

---

# 132. 연속성 QA

CH8 archive에 들어간 승인값은 해당 chapter 최종 승인본과 정확히 일치해야 한다.

CH8 final report의 오류는 의도된 old-value reintroduction만.

---

# 133. 상태 QA

REJECTED 문서가 APPROVED archive에 들어가지 않음.

SUPERSEDED 문서가 current canonical로 표시되지 않음.

---

# 134. 스포일러 QA

CH1~8 모든 문서에서:

• 실명 surname
• Manhattan Project
• 핵무기 직접 단어
• Hiroshima/Nagasaki
• Little Boy/Fat Man
• Trinity

노출 여부 검사.

---

# 135. CH9 전환 QA

CH9 전광판에서 처음 직접 의미가 공개되므로 CH8 마지막 문서까지 스포일러가 없어야 한다.

---

# 136. CH10 identity QA

Oppenheimer 이름은 postcard 전에는:

• 라디오
• 신문
• 전화
• 상자 라벨
• 사진
• 메달
• 집 문서

어디에도 나오지 않는다.

---

# 137. Final Archive QA

검열 제거 순서와 full name 정확성 검사.

각 인물 profile이 게임 속 dramatization과 역사 사실을 혼동하지 않게 한다.

---

# 138. 금지사항

• 문서를 단순 UI 창으로만 처리
• 정답 숫자 빨간색
• 핵심 오류 행 glow
• 퍼즐 답이 제목에 적힘
• 실제 surname 조기 노출
• Manhattan Project 조기 노출
• 무기 설계가 명백한 diagram
• 외부 전문지식 필요
• 글자 너무 작음
• 모바일에서 읽기 불가
• 모든 문서 뒤집기 가능
• 불필요한 10페이지 보고서
• 같은 plane에 문서 겹쳐 z-fighting
• 검열선 밑 실제 surname 비침
• asset id를 UI에 그대로 출력
• Final Archive full-name texture 재사용으로 조기 노출
• 문서 애니메이션과 logical side 불일치
• REJECTED/APPROVED 상태 혼동
• CH8 archive와 원본 승인값 불일치

---

# 139. 후속 문서와의 연결

`14_STAMP.md`
• 문서 내 도장 영역, 잉크 표시, 상태 전환을 구체화

`15_OBJECTS.md`
• 종이/바인더/카드/사진/엽서의 실제 치수와 재질 확정

`17_SPATIAL_LAYOUT.md`
• 문서 비교와 desk interaction에 필요한 공간 확보

`18_COLLISION_AND_CLEARANCE.md`
• 종이 두께, placement epsilon, 겹침 방지 기준 확정

`22_VISUAL_STYLE.md`
• 종이, 타자기, 잉크, 검열선의 최종 시각 스타일 정의

`23_UI.md`
• inspect/compare/archive의 보조 UI 정의

`25_SAVE_AND_RESUME.md`
• document logical status와 archive 상태 저장

`27_MOBILE.md`
• 작은 화면 문서 확대/가독성 확정

`29_SPOILER_RULES.md`
• 문서 문자열/texture의 금지 정보 감사 기준 확정

각 CHAPTER의 `PUZZLE.md`, `OBJECT_PLACEMENT.md`, `INTERACTION_FLOW.md`
• 실제 문서 세트와 단서 배치를 구체화

<!-- MERGED SOURCE END: 13_DOCUMENT.md -->


================================================================================
ORIGINAL SOURCE: 14_STAMP.md
================================================================================

# 14_STAMP.md

# STAMP SPECIFICATION

이 문서는 CH1~8의 핵심 물리 행위인 `REJECTED` / `APPROVED` 도장 시스템을 정의한다.

범위:

• 도장 오브젝트 구조
• REJECTED / APPROVED 구분
• 도장 활성 조건
• 집기
• grip
• camera pose
• 문서 stamp area
• 정렬
• 타격
• `STAMP_IMPACT`
• 잉크 생성
• 종이 반응
• 사운드
• 결과 상태 확정
• 도장 복귀
• NPC 반응 연결
• 연타/중복 실행 방지
• 실패 복구
• 모바일
• 반복 연출 변주
• CH8 최종 승인
• QA

---

# 1. 도장의 역할

도장은 단순한 “정답 제출 버튼”이 아니다.

플레이어가 조사한 결과를 최종적으로 책임지는 물리적 행동이다.

CH1~8에서 도장은 다음 의미를 가진다.

```text
REJECTED
이 결과로는 진행할 수 없다.
다시 검증하고 수정해야 한다.

APPROVED
이 결과는 현재 기준에서 충분히 검증되었다.
다음 단계로 진행한다.
```

플레이어의 권위는 대사 선택지가 아니라 이 행위를 통해 드러난다.

---

# 2. 도장은 퍼즐 선택지가 아니다

플레이어가 처음부터:

```text
REJECTED
APPROVED
```

중 하나를 자유롭게 고르는 구조로 만들지 않는다.

챕터 상태가 충분한 검증을 완료한 뒤 현재 가능한 도장만 활성화한다.

예:

```text
조사 전
REJECTED 비활성
APPROVED 비활성

오류 증명 완료
REJECTED 활성

수정본 검증 완료
APPROVED 활성
```

---

# 3. 물리 오브젝트

기본적으로 두 개의 별도 물리 도장을 권장한다.

```text
REJECTED STAMP
APPROVED STAMP
```

이유:

• 실제 책상 위 물건처럼 느껴짐
• 타격 전부터 현재 판단의 의미가 보임
• 동일 물체의 texture/text를 순간 교체하는 느낌 감소
• CH8 최종 APPROVED의 물리적 존재감 강화

---

# 4. 단일 도장 방식

성능/자산 사정상 하나의 도장으로 구현할 수도 있다.

단:

• player-facing label을 순간적으로 마법처럼 변경하지 않음
• story state에 맞는 face plate/ink plate 전환이 물리적으로 납득 가능해야 함

현재 기본 설계는 별도 두 개를 우선한다.

---

# 5. 도장 외형 구분

REJECTED와 APPROVED는 형태가 완전히 다른 장난감처럼 보이지 않는다.

같은 시설의 행정 도구라는 통일감 유지.

구분 가능 요소:

• handle 상단 표식
• stamp face text
• ink pad 색 또는 작은 band
• 책상 위치

색상 하나에만 의존하지 않는다.

---

# 6. 도장 크기

한 손으로 자연스럽게 잡을 수 있는 크기.

권장 시작 범위:

```text
handle height
약 9~12cm

stamp face width
약 5~7cm
```

정확한 값은 `15_OBJECTS.md`에서 확정.

---

# 7. 도장 무게감

실제 질량이 작더라도 화면에서는 묵직해야 한다.

표현 수단:

• pickup acceleration
• 손목 정렬
• 타격 직전 정지
• 빠른 하강
• impact sound
• 종이의 작은 반응
• 짧은 눌림

화면 shake로 무게를 만들지 않는다.

---

# 8. 도장 Rest Slot

각 도장은 책상 위 지정 위치를 가진다.

예:

```text
STAMP_REJECTED_HOME
STAMP_APPROVED_HOME
```

도장이 문서 비교 영역이나 컵/연필과 겹치지 않게 한다.

---

# 9. Stamp Area

문서에는 도장이 찍힐 물리적 영역이 있다.

예:

```text
STAMP_AREA_REVIEW
```

문서의 핵심 데이터, 서명, 날짜, 버전 정보를 가리지 않는 위치.

---

# 10. Stamp Area Metadata

권장:

```js
{
  id: "stamp_area_main",
  center,
  size,
  surfaceNormal,
  allowedStampTypes: ["REJECTED", "APPROVED"]
}
```

---

# 11. 문서별 Stamp Area

모든 문서에 같은 좌표를 사용하지 않는다.

문서 양식별로 stamp area 위치를 정의한다.

다만 플레이어가 매번 어디 찍어야 하는지 찾는 퍼즐은 만들지 않는다.

---

# 12. 자동 정렬의 범위

플레이어는 도장을 “정확한 픽셀 위치에 직접 조준”하지 않는다.

도장 interaction 시작 후 시스템이 유효 stamp area에 자연스럽게 정렬한다.

즉 플레이어의 판단은:

```text
찍을 것인가
```

이지

```text
2cm 왼쪽에 정확히 맞출 것인가
```

가 아니다.

---

# 13. STAMP 진입 조건

최소 조건:

• playerState가 허용 상태
• 현재 문서가 stampable
• 필요한 검증 완료
• 현재 stamp type이 story state와 일치
• stamp object 존재
• document 존재
• stamp area 유효
• camera safe pose 가능
• stamp sweep clear
• sequence inactive
• transition inactive

---

# 14. STAMP 진입

권장 흐름:

```text
INSPECT / FOCUS
→ 현재 판단 완료
→ stamp interaction 활성
→ player INTERACT
→ STAMP
```

도장 사용 직전에 일반 world interaction을 차단한다.

---

# 15. STAMP 상태

STAMP 중 기본 허용:

• 지정된 stamp 진행 입력
• 필요하면 타격 전 cancel

차단:

• 이동
• 자유 look
• 다른 문서 interaction
• NPC interaction
• 문
• 장비
• chapter transition

---

# 16. 두 단계 입력

권장 사용자 흐름:

```text
1. 도장 선택
2. 확인 입력으로 타격
```

장점:

• 플레이어가 실제로 도장을 들었다는 감각
• 타격 전 짧은 긴장감
• 실수 click로 즉시 결과 확정 방지

---

# 17. 한 단계 입력 예외

반복감이나 pacing 때문에 일부 APPROVED 장면에서:

```text
도장 interaction
→ 자동 정렬
→ 짧은 hold
→ 자동 impact
```

를 사용할 수 있다.

단, CH5/CH8 같은 중요 장면은 명시적 확인 입력을 우선한다.

---

# 18. Hold 입력 금지

도장을 찍기 위해 버튼을 2~3초 누르고 있게 하지 않는다.

타격은 click/tap 기반.

모바일에서도 동일.

---

# 19. 도장 Pickup

기본 sequence:

```text
player hand 등장
→ handle 접근
→ grip
→ stamp lift
→ wrist alignment
```

도장이 손보다 먼저 움직이면 안 된다.

---

# 20. Grip Point

도장 handle에 전용 grip anchor.

예:

```text
STAMP_GRIP
```

손가락이 handle 내부 깊숙이 들어가지 않게 한다.

---

# 21. Grip Orientation

도장 face는 기본적으로 아래 방향.

pickup 중 180° 뒤집히거나 옆으로 누운 상태 금지.

---

# 22. Player Hand

FPS 손은 도장 동작 동안만 등장.

평상시 화면에 영구 유지하지 않는다.

---

# 23. 손 위치

손이:

• 도장 label
• 문서 핵심 텍스트
• stamp area

를 가리지 않게 한다.

---

# 24. Camera Pose

STAMP camera는 `03_CAMERA.md`의 safe pose를 따른다.

기본:

• 1인칭 사선 책상 시점
• 문서의 핵심 부분과 stamp area 보임
• 도장과 손 보임
• NPC의 일부 반응이 필요하면 주변부에 남김

---

# 25. Top-Down UI 금지

완전 수직 top-down으로 바뀌어 문서가 UI 패널처럼 보이는 연출을 기본으로 하지 않는다.

실제 책상 앞에 서서 도장을 찍는 느낌 유지.

---

# 26. Camera 이동

STAMP 진입 시 camera 이동 권장:

```text
약 0.35~0.65s
```

정확한 시간은 `26_TIMING_AND_PACING.md`.

---

# 27. Camera Settle

타격 전 camera tween이 완전히 끝나야 한다.

camera가 움직이는 중 도장이 내려오지 않는다.

---

# 28. Stamp Sweep

도장 타격 경로에는 다른 오브젝트가 없어야 한다.

검사:

• 컵
• 연필
• 다른 문서
• NPC 손
• player hand의 다른 부분
• desk geometry

---

# 29. Sweep Volume

도장 face보다 약간 큰 cylinder/box 형태의 invisible sweep volume 사용 가능.

타격 시작 전 clear 확인.

---

# 30. 문서 표면

stamp area의 surface normal을 기준으로 도장 face를 정렬한다.

종이가 책상 위에 거의 평평한 상황이 기본.

---

# 31. 정렬

도장이 문서 위로 이동.

```text
lift
→ translate
→ rotate
→ hover pose
```

한 번에 대각선으로 빠르게 날아가지 않는다.

---

# 32. Hover Height

타격 전 도장 face가 종이 위 몇 cm 정도 떠 있는 상태.

권장 시작 범위:

```text
약 6~10cm
```

실제 scale에 맞춰 조정.

---

# 33. Human Offset

완벽한 기계 중심 정렬보다 아주 작은 authored offset 허용.

예:

• 몇 mm
• 1~2° rotation

단, 도장 글자가 stamp area 밖으로 나갈 정도 금지.

---

# 34. 타격 전 Pause

도장의 의미가 큰 장면에는 짧은 pause.

기본:

```text
0.15~0.45s
```

CH5/CH8은 더 길 수 있음.

---

# 35. Confirm Gate

명시적 타격 입력을 사용하는 경우:

도장이 hover pose에 도착하고 camera가 settle한 뒤에만 confirm 가능.

도장 선택 click이 타격 confirm으로 동시에 소비되지 않게 한다.

---

# 36. 연타 방지

다음 raw 입력 하나가:

```text
도장 선택
+
타격
```

두 행동을 동시에 수행하지 않는다.

`consumeUntilRelease` 또는 별도 input generation 사용.

---

# 37. Impact 시작

confirm 후:

```text
stampImpactStarted = true
```

추가 입력 차단.

이 시점부터 cancel 불가.

---

# 38. 하강

타격은 lift보다 빠름.

권장 motion:

• 짧은 acceleration
• 거의 직선 downward
• 마지막 순간까지 명확한 속도

과도한 ease-out로 종이에 천천히 내려앉지 않는다.

---

# 39. STAMP_IMPACT

도장 face가 문서 surface에 실제로 닿는 순간.

이 marker가 가장 중요하다.

---

# 40. Impact Marker에서 실행

`STAMP_IMPACT`에서:

• impact sound
• paper micro-response
• ink/decal 생성 시작
• 아주 작은 camera impulse
• 필요하면 NPC reaction trigger 예약

---

# 41. 결과 확정 시점

결과는 도장이 종이에 닿기 전에 확정하면 안 된다.

권장 2단계:

```text
STAMP_IMPACT
→ document stamp result 기록
→ short verify
→ chapter result commit
```

즉 문서에는 impact 순간 `REJECTED` / `APPROVED` 결과가 생기고,
챕터 진행 상태는 impact 직후의 검증 단계에서 확정한다.

시각적 결과와 논리적 결과가 멀리 떨어지지 않는다.

---

# 42. Document Stamp Commit

impact가 유효하면 즉시:

```text
document.stampType = REJECTED
```

또는:

```text
document.stampType = APPROVED
```

를 기록할 수 있다.

단, duplicate marker 실행 방지.

---

# 43. Chapter Commit

도장이 실제로 접촉했고 document state가 정상인지 VERIFY한 직후:

```text
chapterPhase = REJECTED
```

또는 승인 phase로 이동.

도장 lift가 완전히 끝날 때까지 story result를 미룰 필요는 없다.

---

# 44. Ink Appearance

잉크는 impact 이전에 보이면 안 된다.

impact 순간:

• 빠른 opacity appearance
• 아주 작은 ink spread

가능.

---

# 45. Ink 형태

완벽한 디지털 글자보다 아주 미세한 불균일 허용.

하지만 읽기 어려운 distressed effect 금지.

---

# 46. REJECTED Mark

명확하게:

```text
REJECTED
```

또는 프로젝트 전체에서 확정한 영문 stamp.

문서의 다른 정보와 구분.

---

# 47. APPROVED Mark

명확하게:

```text
APPROVED
```

CH8 최종 승인에서도 동일 문법.

---

# 48. Stamp Rotation

잉크 mark는 약간의 고정된 variation을 가질 수 있다.

예:

```text
-2° ~ +2°
```

단, 매번 완전 random 결과 금지.

챕터별 authored variation 권장.

---

# 49. 잉크 위치

stamp face와 실제 mark 위치가 일치해야 한다.

도장이 문서 우측을 찍었는데 mark는 중앙에 뜨는 문제 금지.

---

# 50. 잉크 z-fighting

paper surface 바로 위 decal/plane를 사용할 경우 안정적인 offset/polygonOffset 사용.

camera를 과도하게 가까이 하지 않는다.

---

# 51. Paper Response

impact에서 종이가 아주 작게 눌리거나 움직일 수 있다.

가능:

• 1~3mm 수준 Y compression 느낌
• 아주 작은 rotation/settle

과도한 bounce 금지.

---

# 52. Desk Response

책상 전체가 흔들릴 필요 없음.

필요하면 아주 작은 object-level sound/visual vibration.

---

# 53. Camera Impulse

impact 때 아주 작게.

목표:

충격감을 보조.

금지:

• FPS 총기 recoil 수준
• 큰 화면 shake
• CH1~8마다 동일 강도

---

# 54. Audio

도장 사운드는 반복되는 핵심 leitmotif.

필수 요소:

• handle/body weight
• rubber/ink contact
• desk/paper contact

하나의 얇은 click으로 끝내지 않는다.

---

# 55. REJECTED / APPROVED 사운드

완전히 다른 효과음일 필요는 없다.

같은 물리 도장 계열의 소리 유지.

다만 도장/책상/장면 공간에 따라 작은 variation 가능.

---

# 56. Final Archive Stamp Memory

Final Archive 마지막에는 실제 도장 애니메이션 없이 stamp sound만 재사용.

따라서 CH1~8 도장 사운드는 플레이어 기억에 남을 정도로 일관된 핵심 질감을 가져야 한다.

---

# 57. Impact Hold

도장이 종이에 닿은 상태를 짧게 유지.

권장:

```text
약 0.08~0.20s
```

너무 오래 눌러 인위적이지 않게.

---

# 58. Lift

impact 후 도장을 들어 올림.

잉크가 완전히 보인다.

player가 결과를 읽을 수 있는 시간 확보.

---

# 59. Lift 속도

하강보다 느리거나 비슷.

도장 결과를 확인하는 호흡을 만든다.

---

# 60. Stamp Return

도장을 home slot으로 돌려놓는다.

흐름:

```text
lift
→ hand retract
→ home slot 접근
→ contact
→ hand release
```

---

# 61. Home Contact

도장대/책상에 놓이는 작은 contact sound 가능.

impact sound보다 작아야 한다.

---

# 62. 도장 손 해제

도장이 rest pose에 안정된 뒤 손이 빠진다.

손과 도장이 동시에 갑자기 사라지지 않는다.

---

# 63. STAMP 종료

정상 종료 조건:

• stamp rest pose
• document mark visible
• chapter result committed
• camera next pose known
• NPC reaction state 준비
• interaction registry 갱신
• temporary locks 정리

---

# 64. STAMP 이후 상태

챕터별:

REJECTED:

```text
STAMP
→ DIALOGUE / CINEMATIC
→ NPC document reclaim
```

APPROVED:

```text
STAMP
→ DIALOGUE / CINEMATIC
→ facility activation
→ FREE / TRANSITION
```

항상 FREE로 바로 복귀하지 않는다.

---

# 65. NPC Reaction Trigger

NPC가 impact 전에 결과를 미리 반응하지 않는다.

반응 시작 기준:

`STAMP_IMPACT` 또는 mark가 보인 직후.

---

# 66. NPC 시선

타격 직전:

• 도장
• 문서
• 플레이어

중 장면별 타깃.

impact 후:
대부분 먼저 도장/문서를 봄.

---

# 67. REJECTED 후 문서 회수

NPC가 문서를 회수하기 전에 player stamp hand/도장이 충분히 빠져야 한다.

NPC 손과 player 손이 충돌하지 않는다.

---

# 68. APPROVED 후 문서

승인본은:

• 잠깐 책상에 남음
• NPC가 가져감
• archive로 이동

중 챕터별 결정.

logical status는 APPROVED 유지.

---

# 69. CH1 REJECTED

리듬:

```text
Richard 오류 인정
→ stamp
→ 짧은 impact hold
→ Richard small nod
→ document reclaim
→ 빠른 퇴장
```

도장 자체를 지나치게 길게 끌지 않는다.

---

# 70. CH1 APPROVED

첫 승인.

플레이어가 시스템의 의미를 학습해야 한다.

다른 챕터보다:

• stamp animation 명확
• APPROVED mark hold 약간 길게
• facility progress 변화 인식 가능

---

# 71. CH2 REJECTED

논리적 오류를 이미 이해한 뒤 찍는다.

도장 직전 감정 pause 짧음.

Enrico 반응 절제.

---

# 72. CH2 APPROVED

조건이 정리된 뒤.

board/장비 안정과 자연스럽게 연결.

---

# 73. CH3 REJECTED

calibration 무효를 확인한 뒤.

Luis 시선이 기록→도장으로 이동.

짧고 실무적.

---

# 74. CH3 APPROVED

CRT/계측 안정과 연결.

도장 뒤 기계 반응이 즉시 너무 크게 일어나지 않게 한다.

---

# 75. CH4 REJECTED

John:

`“옳은 결정입니다.”`

같은 절제된 반응.

도장 camera도 과장하지 않는다.

---

# 76. CH4 APPROVED

alignment/timing 결과가 안정된 상태.

승인 후 기술적 성공감.

---

# 77. CH5 REJECTED

가장 중요한 변주 중 하나.

흐름:

```text
George:
“이 정도 편차 때문에…”
“일정이 이미 늦었습니다.”

player가 stamp에 손을 뻗음

George:
“진심입니까?”

forced pause

도장 pickup
→ hover
→ impact
→ silence
```

impact 전에 George가 말을 더 하지 않는다.

---

# 78. CH5 Impact 이후

```text
George가 mark를 봄
→ player eye contact
→ document reclaim
→ “좋습니다.”
→ “완벽한 걸 원하신다면 그렇게 하죠.”
```

정확한 대사 순서는 챕터 DIALOGUE에서 조정 가능하지만
도장과 감정의 순서를 보존한다.

---

# 79. CH5 APPROVED

장시간 수정 뒤.

George:
`“이게 원하셨던 겁니까?”`

검증 후 APPROVED.

impact 뒤:

짧은 hold.

`“……이쪽이 낫군요.”`

도장이 George를 “굴복시켰다”가 아니라 검증 결과가 실제로 개선되었음을 보여준다.

---

# 80. CH6 REJECTED

조용하고 협력적.

Emilio는 반려를 예상하거나 원함.

impact 강도는 같더라도 scene silence가 다르게 느껴지게 한다.

---

# 81. CH6 APPROVED

긴 측정 이후 확신.

도장보다 Emilio의 결과 문장과 계수기 안정이 중요.

---

# 82. CH7 REJECTED

사고 기록의 무게.

impact 후 일반 챕터보다 silence 길게 가능.

Kenneth의 반응은 매우 절제.

---

# 83. CH7 APPROVED

수정된 incident report를 승인.

도장이 “사고를 없애는” 것이 아니라 제대로 기록된 문서를 승인한다는 의미가 분명해야 한다.

---

# 84. CH8 REJECTED

최종 보고서 반려.

이 장면에서는 REJECTED 도장이 가장 무겁게 느껴져야 한다.

흐름:

```text
마지막 오류 확인
→ Hans report close
→ silent beat
→ report 다시 stamp area에 위치
→ player reaches REJECTED
→ hover
→ impact
→ room silence
→ Hans response
```

---

# 85. CH8 REJECTED Camera

가능하면:

• document
• stamp
• Hans
• 주변 NPC 일부

가 같은 장면에 존재.

8명 모두 얼굴을 넣으려 하지 않는다.

---

# 86. CH8 REJECTED Group Reaction

impact 직후:

• 일부 posture 정지
• 일부 시선 변화
• Hans 중심

동일 surprise animation 금지.

---

# 87. CH8 APPROVED

게임 전체 CH1~8 도장 시스템의 정점.

최종 report 검증 완료 후:

```text
APPROVED 도장 활성
→ player pickup
→ camera settle
→ room quiet
→ impact
→ APPROVED mark
→ short silence
→ NPC 반응
→ progress 100%
→ facility activation
```

---

# 88. CH8 APPROVED Impact

사운드는 가장 또렷하게 들릴 수 있음.

하지만 별도 초현실적 bass hit나 폭발음처럼 만들지 않는다.

실제 도장 소리의 강화된 믹스.

---

# 89. CH8 Final Mark

APPROVED 글자가 명확히 읽혀야 한다.

문서의 핵심 텍스트를 가리지 않음.

Final Archive의 마지막 stamp sound가 이 순간을 기억으로 호출하게 된다.

---

# 90. CH8 이후

CH9에는 일반 승인/반려 도장 gameplay를 새로 추가하지 않는다.

CH9는 결과 목격.

---

# 91. CH10

CH10에는 도장 interaction 없음.

Final Archive에서 stamp sound만 기억으로 사용.

---

# 92. 반복감 방지 원칙

공통 요소는 유지:

```text
hand
stamp
impact
ink
```

변주 요소:

• camera angle
• NPC 위치
• 타격 전 pause
• 타격 후 silence
• document orientation
• hand approach side
• NPC reaction timing
• ambient audio
• 다음 scene 연결

---

# 93. 도장 위치 변주

같은 Director desk를 쓰더라도 document slot/angle을 약간 변화 가능.

그러나 stamp area 자체가 매번 숨겨져 있어 찾기 어렵게 하지 않는다.

---

# 94. Hand Approach 변주

기본 오른손 사용을 권장.

모든 장면에서 hand path를 완전히 동일하게 복제하지 않는다.

단, 플레이어 손잡이 방향이 챕터마다 바뀌는 이상한 continuity 금지.

---

# 95. 플레이어 주손

기본 주손을 하나 정한다.

권장:

```text
RIGHT
```

문서 집기/도장/전화 등에서 가능한 한 일관되게.

양손이 필요한 상자는 예외.

---

# 96. Ink Color

시대감에 맞는 진한 도장 잉크.

REJECTED와 APPROVED를 서로 다른 색으로 구분할 수 있지만 색상만으로 의미를 전달하지 않는다.

정확한 palette는 `22_VISUAL_STYLE.md`.

---

# 97. 색각 접근성

글자 자체가:

```text
REJECTED
APPROVED
```

로 명확히 다르므로 색상 의존을 피한다.

---

# 98. Ink Pad

도장 패드를 실제로 보여줄지 여부는 장면 단순화를 위해 선택.

매번 도장을 패드에 찍고 문서에 찍는 2단계는 pacing을 늘릴 수 있으므로 기본 요구가 아니다.

---

# 99. Ink Pad 연출 사용 시

특별히 물리성을 강화하고 싶다면:

```text
stamp pad contact
→ document impact
```

가능.

하지만 CH1~8 매번 반복하지 않는다.

현재 기본 공통 시스템은 pad 과정을 생략 가능.

---

# 100. 도장 인쇄 방향

stamp face text가 카메라에서 읽히는 방향과 종이에 찍힌 mark 방향이 일치하도록 model orientation 검증.

거꾸로 찍힌 REJECTED 금지.

---

# 101. Stamp Face

도장 밑면 text geometry를 굳이 정밀하게 만들 필요 없음.

잉크 결과는 decal/texture로 생성 가능.

물리 face 방향만 맞으면 됨.

---

# 102. Shadow

도장과 손이 종이에 자연스러운 contact shadow를 만들면 좋음.

하지만 camera 가까운 hand shadow가 거대하게 튀면 조정.

---

# 103. Lighting

stamp area가 너무 어두워 mark가 안 보이지 않게 한다.

장면마다 별도 spotlight가 생기는 느낌은 금지.

desk task lighting으로 해결.

---

# 104. Mobile Input

모바일에서도:

```text
도장 선택
→ 안정된 stamp pose
→ ACTION / tap
→ impact
```

구조 유지.

---

# 105. Mobile Target

도장 actual mesh가 작더라도 interaction proxy를 충분히 제공.

하지만 REJECTED/APPROVED 두 도장이 모두 활성인 구조 자체를 피하므로 오선택 가능성을 근본적으로 줄인다.

---

# 106. Mobile Camera

작은 화면에서:

• stamp
• mark area
• 손

이 모두 보여야 한다.

NPC 반응까지 억지로 한 화면에 넣어 document가 작아지지 않게 한다.

---

# 107. Mobile Haptic

플랫폼이 지원하고 프로젝트 정책상 허용된다면 impact 순간 매우 짧은 haptic을 고려할 수 있다.

필수 아님.

소리/시각 없이 haptic만으로 정보 전달 금지.

---

# 108. Keyboard / Mouse

PC:

• 도장 선택은 공통 INTERACT
• 타격 confirm도 공통 primary action 사용 가능

새로운 전용 `STAMP KEY`를 만들지 않는다.

---

# 109. ESC / Cancel

impact 전:

장면에 따라 cancel 가능.

impact 시작 후:

cancel 불가.

브라우저 pointer lock 해제와 gameplay cancel을 혼동하지 않는다.

---

# 110. Stamp Lock Owner

권장 owner id:

```text
CHXX_REJECT_STAMP
CHXX_APPROVE_STAMP
```

lock 대상:

• player input 일부
• camera
• stamp object
• target document
• stamp slot/sweep

---

# 111. 중복 호출 방지

상태:

```text
NOT_STARTED
ACTIVE
IMPACTED
COMMITTED
COMPLETE
```

같은 sequence를 두 번 실행하지 않는다.

---

# 112. Double Click

impact confirm에서 double click이 들어와도 `STAMP_IMPACT`는 한 번만.

ink 두 장 생성 금지.

사운드 두 번 금지.

progress 두 번 증가 금지.

---

# 113. Marker One-Shot

저프레임에서 animation progress가 impact 구간을 건너뛰어도 marker를 정확히 한 번 실행.

---

# 114. Result Idempotency

이미:

```text
document.stampType = APPROVED
```

인 문서에 동일 story approval sequence가 재실행되어 progress가 또 증가하지 않게 한다.

---

# 115. 문서 Version 검증

APPROVED를 찍기 전 현재 문서가 올바른 revision인지 확인.

CH8에서 old version을 잘못 승인하는 state bug 방지.

---

# 116. Target Document Ownership

STAMP 시작 시 target document는 안정된 desk stamp slot에 있어야 한다.

NPC 손에 든 채 도장 찍지 않는다.

---

# 117. Target Document Busy

document busy lock 획득.

stamp 중 compare/flip/page action 금지.

---

# 118. Object Collision

stamp face path가 종이 아닌 desk surface에 먼저 닿지 않게 한다.

stamp area가 desk edge에 너무 가까우면 layout 실패.

---

# 119. Surface Height

문서의 실제 Y와 stamp target Y가 일치.

여러 장 stack이면 stack top height 반영.

---

# 120. Paper Stack Stamp

여러 장 묶음 위에 도장을 찍는 경우 top document surface 기준.

아래 문서를 관통하지 않는다.

---

# 121. Stamp Impression Scope

도장 mark는 현재 target document에만 생성.

아래 desk나 다른 문서에 동시에 찍히지 않는다.

---

# 122. REJECTED 문서 상태

impact/verify 후:

```text
logicalStatus = REJECTED
```

그 뒤 NPC가 회수해도 status 유지.

---

# 123. APPROVED 문서 상태

impact/verify 후:

```text
logicalStatus = APPROVED
```

archive로 이동해도 유지.

---

# 124. Superseded 처리

새 수정본 APPROVED 이후 이전 REJECTED copy가 current canonical로 남지 않게 한다.

`SUPERSEDED`는 필요 시 별도 metadata.

---

# 125. Save Checkpoint

중요한 저장은 적어도 도장 결과 commit 이후.

예:

```text
AFTER_REJECT
AFTER_APPROVAL
```

---

# 126. Impact 직전 Reload

reload 시 애매한 중간 상태를 복원하지 않는다.

직전 safe checkpoint로.

다시 stamp를 해야 할 수 있음.

---

# 127. Impact 이후 Reload

result가 commit된 checkpoint라면 stamp animation을 다시 요구하지 않는다.

canonical stamped document와 다음 story state로 복원.

---

# 128. Focus Loss

impact 이전 focus loss:

• 안전 hover 또는 시작 전 상태로 복구 가능.

impact 이후:

• mark/result를 유지
• remaining lift/return을 safe endpoint로 완료
• 중복 impact 금지

---

# 129. Stamp Missing

필수 stamp object가 없으면 sequence 시작 금지.

개발 환경:
error.

배포 fallback:
canonical stamp 생성 가능.

---

# 130. Document Missing

target document 누락 시 stamp sequence 시작 금지.

빈 책상에 도장을 찍고 진행하는 fallback 금지.

---

# 131. Stamp Area Missing

개발 error.

배포에서는 문서 template의 known fallback area를 사용할 수 있지만,
본문 위를 덮지 않는지 검증.

---

# 132. Sweep Blocked

다른 object가 stamp area를 침범하면:

• slot 정리
• blocking object를 valid slot로 이동
• 또는 interaction 비활성

도장이 컵을 뚫고 내려가게 하지 않는다.

---

# 133. Animation Failure

타격 전 실패:
rollback to stamp home / document state unchanged.

impact 후 실패:
result 유지, stamp를 safe rest pose로 snap/settle, camera/control 복구.

impact 후 결과를 없애고 다시 찍게 하는 것은 중복 위험이 더 큼.

---

# 134. Audio Failure

도장 소리가 재생되지 않아도 logical result는 정상 진행.

사운드 실패 때문에 story soft-lock 금지.

---

# 135. Ink Render Failure

잉크 visual 생성 실패가 감지되면:

• fallback text/decal 생성 시도
• logical result는 이미 impact 후 유지 가능

그러나 개발 빌드에서는 명확한 error.

---

# 136. Visual Verification

impact 후 camera가 최소한 mark를 확인할 수 있는 구도를 잠깐 유지.

즉시 NPC 얼굴로 camera가 튀지 않는다.

---

# 137. Reaction Timing

mark가 보인 뒤:

```text
약 0.15~0.6s
```

범위의 pause 후 NPC reaction 가능.

중요 장면은 더 길게.

최종 수치는 timing 문서.

---

# 138. Progress Timing

APPROVED impact와 동시에 progress 숫자가 바로 튀지 않는 것을 권장.

흐름:

```text
impact
→ mark 확인
→ NPC 반응 일부
→ facility/progress 변화
```

행위와 결과의 인과는 유지하되 도장 UI처럼 보이지 않게 한다.

---

# 139. REJECTED 후 Progress

반려 자체로 progress 숫자가 올라갈 필요는 없다.

수정/재검토/APPROVED 후 progress 증가가 기본.

---

# 140. CH8 Progress

최종 APPROVED 이후:

```text
82
→ 91
→ 97
→ 100
```

시설 활성화와 동기화.

APPROVED impact 전에 100이 되면 안 된다.

---

# 141. Stamp Sound Memory

CH1부터 CH8까지 핵심 impact sound의 음색 계열을 유지.

장면마다 완전히 다른 도장 소리를 쓰지 않는다.

Final Archive에서 동일 기억을 회수할 수 있어야 한다.

---

# 142. CH1~7 Final Memory Mapping

Final Archive ending에서:

CH1~7 REJECTED impact sound를 순차 재생.

필요하면 공간/톤을 아주 미세하게 달리해 각 기억의 차이를 남길 수 있다.

---

# 143. CH8 Final Memory Mapping

마지막 CH8 APPROVED sound는 가장 명확.

그 뒤 silence.

---

# 144. Debug Inspector

개발 모드:

```text
stampType
stampState
sequenceOwner
targetDocument
stampArea
sweepClear
impactTriggered
documentStampCommitted
chapterCommitted
homeSlot
```

---

# 145. Debug Slow Motion

0.25x에서 검사:

• hand grip
• alignment
• face orientation
• impact position
• paper contact
• ink position
• lift
• home return

---

# 146. QA: 입력

검사:

• 한 번 클릭
• 더블 클릭
• 연타
• key repeat
• touch double tap
• impact 직전 cancel
• impact 후 cancel
• pointer loss

---

# 147. QA: 상태

검사:

• 잘못된 도장 비활성
• correct stamp만 활성
• impact 전 result 없음
• impact 후 document mark
• chapter commit 1회
• progress 1회
• STAMP 종료 후 next state 정상

---

# 148. QA: 공간

검사:

• 컵/연필 충돌
• 문서 edge
• desk edge
• NPC 손
• camera near plane
• 다른 paper stack
• stamp stand

---

# 149. QA: 시각

검사:

• stamp face 거꾸로 아님
• mark orientation 정상
• 글자 읽힘
• 핵심 문서 정보 안 가림
• z-fighting 없음
• hand shadow 과하지 않음

---

# 150. QA: 오디오

검사:

• contact 전 소리 없음
• impact marker와 정확히 동기화
• duplicate sound 없음
• scene ambience에 묻히지 않음
• CH8 impact 과장된 폭발음 아님

---

# 151. QA: 복구

검사:

• focus loss before impact
• focus loss after impact
• reload before impact
• reload after commit
• stamp missing
• document missing
• ink render failure
• audio failure

영구 lock 금지.

---

# 152. QA: 반복감

CH1~8 전체를 연속으로 보고 확인:

• camera 동일 반복 여부
• 같은 pause 길이
• 같은 NPC reaction
• 같은 hand timing
• 같은 shot composition
• 같은 후속 facility transition

공통 ritual은 유지하되 장면 감정은 달라야 한다.

---

# 153. 금지사항

• 도장을 단순 UI 버튼으로 처리
• 처음부터 REJECTED/APPROVED 자유 선택
• 결과가 impact 전에 확정
• 도장 선택 click이 같은 event로 impact까지 실행
• hold-to-stamp
• random stamp 위치
• 문서 본문 위에 mark 덮기
• stamp face와 ink 위치 불일치
• 종이 위가 아닌 desk를 관통
• impact 전 sound
• impact 전 ink
• 과도한 screen shake
• 도장마다 다른 핵심 사운드
• CH1~8 동일 camera path
• impact 직후 mark를 보여주지 않고 바로 컷
• NPC가 impact 전에 반응
• progress가 APPROVED보다 먼저 증가
• STAMP 후 무조건 FREE 복귀
• impact marker 중복
• reload 후 도장 두 번
• Final Archive에서 실제 도장 애니메이션을 억지로 다시 재생

---

# 154. 후속 문서와의 연결

`15_OBJECTS.md`
• REJECTED / APPROVED 도장의 실제 치수, 재질, grip point, home slot 모델 규격 확정

`17_SPATIAL_LAYOUT.md`
• Director desk에 stamp sweep, document slot, player standing zone 공간 확보

`18_COLLISION_AND_CLEARANCE.md`
• stamp face, sweep volume, document surface epsilon, hand/camera clearance 최종 수치 확정

`20_LIGHTING.md`
• stamp area task lighting과 mark 가독성 확보

`21_AUDIO.md`
• stamp impact, home contact, Final Archive memory stamp 사운드 상세화

`22_VISUAL_STYLE.md`
• handle, wood/metal/rubber, ink, REJECTED/APPROVED 시각 스타일 확정

`25_SAVE_AND_RESUME.md`
• impact 전/후 checkpoint와 idempotent result 복구 정의

`26_TIMING_AND_PACING.md`
• pickup, hover, impact hold, mark reveal, reaction pause 최종 시간 확정

`27_MOBILE.md`
• 모바일 action target, camera framing, optional haptic 세부값 확정

각 CHAPTER `ANIMATION.md`, `CAMERA.md`, `STATE.md`
• 해당 챕터의 REJECTED / APPROVED 변주를 실제 sequence로 구체화

<!-- MERGED SOURCE END: 14_STAMP.md -->


================================================================================
ORIGINAL SOURCE: 15_OBJECTS.md
================================================================================

# 15_OBJECTS.md

# OBJECT LIBRARY SPECIFICATION

이 문서는 게임 전체에서 반복 사용되는 공통 3D 오브젝트의 라이브러리 규격을 정의한다.

각 오브젝트에 대해 다음을 정한다.

• 목적
• 실제 크기 기준
• pivot
• 재질
• collision 여부
• interaction 여부
• interaction proxy
• grip point
• 배치 여유
• animation 가능 여부
• 상태 변화
• story-critical 여부
• LOD/재사용 정책
• 챕터별 변형 허용 범위

이 문서는 세부 animation timing을 정의하지 않는다.

• animation → `11_OBJECT_ANIMATION.md`
• document 내용 → `13_DOCUMENT.md`
• stamp 동작 → `14_STAMP.md`
• 실제 공간 배치 → `17_SPATIAL_LAYOUT.md`
• collision 최종 수치 → `18_COLLISION_AND_CLEARANCE.md`
• 시각 스타일 → `22_VISUAL_STYLE.md`

---

# 1. 오브젝트 라이브러리의 기본 철학

공통 오브젝트는 “같은 mesh를 여러 장면에서 복붙하는 것”이 아니다.

공통 라이브러리는 다음을 제공한다.

```text
실제 크기 기준
+
pivot / anchor 규칙
+
collision profile
+
interaction profile
+
material family
+
animation capability
+
상태 구조
```

챕터는 이 규격 안에서 variant를 만든다.

---

# 2. 실물 스케일 우선

모든 오브젝트는 사람과 공간의 실제 크기를 기준으로 제작한다.

게임 플레이 편의를 위해 object를 2배 크게 만들고 camera로 숨기는 방식 금지.

작은 interaction target은 mesh 크기가 아니라 interaction proxy로 해결한다.

---

# 3. 기본 단위

Three.js world unit 기준:

```text
1 unit = 1 meter
```

모든 모델/배치/animation에서 동일 기준을 사용한다.

---

# 4. 오브젝트 분류

공통 분류:

```text
DOCUMENT
DESK_OBJECT
FURNITURE
MACHINE
CONTROL
DOOR
PHONE
PARCEL
PERSONAL_OBJECT
ENVIRONMENT_PROP
STORY_OBJECT
```

---

# 5. Object Descriptor

권장 구조:

```js
{
  id,
  family,
  variant,

  dimensions,
  pivotProfile,

  collisionProfile,
  interactionProfile,

  gripPoints,
  anchors,

  movable,
  animatable,

  storyCritical,
  spoilerLevel,

  defaultMaterialSet,
  lodProfile
}
```

---

# 6. Mesh와 Gameplay Data 분리

mesh name 자체에 게임 로직을 의존하지 않는다.

예:

```text
mesh: stamp_handle_mesh
object id: stamp_rejected
family: STAMP
```

mesh 구조가 바뀌어도 gameplay id는 유지.

---

# 7. Pivot 원칙

pivot은 animation 의미에 맞게 둔다.

예:

• 문 → 경첩
• 뚜껑 → hinge
• 레버 → 회전축
• 버튼 → travel axis 기준
• 문서 → center 또는 grip-dependent
• 사진/엽서 → inspect rotation center

모든 모델 pivot을 geometry center에 두지 않는다.

---

# 8. Anchor 종류

오브젝트 내부 anchor:

```text
GRIP
CONTACT
HINGE
HANDLE
LABEL
INSPECT
AUDIO
LIGHT
CORD
PLACEMENT
```

필요한 것만.

---

# 9. Collision Profile

공통 후보:

```text
NONE
STATIC_SOLID
STATIC_THIN
DYNAMIC_SMALL
DYNAMIC_LARGE
DOOR_PANEL
INTERACTION_ONLY
```

최종 실제 collider 크기는 `18_COLLISION_AND_CLEARANCE.md`.

---

# 10. Render Mesh와 Collider 분리

복잡한 mesh를 triangle collision로 그대로 사용하지 않는다.

기본:

• box
• capsule
• cylinder
• simplified convex volume

사용.

---

# 11. Interaction Proxy

interaction mesh도 render mesh와 분리 가능.

작은 손잡이/메달/버튼은 실제보다 약간 큰 proxy 사용.

proxy는 보이지 않는다.

---

# 12. Story-Critical Object

다음 오브젝트는 story-critical 취급.

• 주요 제출 문서
• REJECTED/APPROVED 도장
• 챕터 핵심 장비 control
• CH9 board
• CH10 radio
• 전화기/수화기
• 현관문
• parcel
• box
• photo
• medal
• postcard

이 오브젝트는 asset missing 시 조용히 무시하지 않는다.

---

# 13. Decorative Object

장식은 world credibility를 높이지만 gameplay dependency가 없어야 한다.

예:

• 컵
• 연필
• 책
• 재떨이
• 파일 상자
• 작은 공구

장식품이 critical route나 interaction slot을 침범하지 않는다.

---

# 14. Movable 분류

```text
FIXED
ANIMATED_FIXED
PICKUP_SMALL
CARRY_LARGE
STORY_MOVED
```

---

# 15. FIXED

플레이어/NPC가 이동시키지 않는 물체.

예:

• 책상
• 장비 본체
• 벽 캐비닛

collision 있음.

---

# 16. ANIMATED_FIXED

world position은 고정이지만 일부 부품 움직임.

예:

• 문
• lever panel
• drawer
• machine switch

---

# 17. PICKUP_SMALL

손으로 조사 가능.

예:

• 문서
• 사진
• 메달
• 엽서

---

# 18. CARRY_LARGE

player CARRY state 필요.

대표:

• CH10 parcel

---

# 19. STORY_MOVED

플레이어가 자유롭게 들 수는 없지만 sequence에서 이동.

예:

• NPC 제출 binder
• 일부 장비 부품
• chair cinematic reposition

---

# 20. Furniture Scale Family

1940년대 사무/연구시설 기준 시작 범위.

정확한 final 값은 layout에서 조정.

---

# 21. Director Desk

목적:

• 문서 수령
• 비교
• stamp
• approval/rejection ritual
• player 중심 작업 공간

권장 크기:

```text
width  1.45~1.75m
depth  0.72~0.88m
height 0.74~0.78m
```

---

# 22. Director Desk Collision

`STATIC_SOLID`.

단순 box보다 다리 아래 빈 공간을 어느 정도 표현할 수 있음.

player는 desk를 통과하지 못함.

---

# 23. Director Desk Interaction

책상 전체가 interaction target이 아니다.

책상 위 개별 object/slot이 target.

---

# 24. Desk Clear Zones

반드시 확보:

```text
incoming document
compare left
compare right
stamp
coffee/decor
approved stack
```

---

# 25. Work Desk

연구자 작업용.

권장:

```text
width  1.2~1.6m
depth  0.65~0.8m
height 0.74~0.78m
```

---

# 26. Table

CH10 parcel 등.

권장:

```text
width  1.0~1.4m
depth  0.55~0.75m
height 0.72~0.78m
```

parcel + photo + medal slot을 동시에 수용.

---

# 27. Chair

권장 footprint:

```text
약 0.45~0.55m x 0.45~0.55m
```

seat height:

```text
약 0.43~0.48m
```

---

# 28. Chair Collision

player가 밀 수 없는 기본 가구.

`STATIC_SOLID`.

NPC seat anchor와 별도.

---

# 29. Chair Interaction

기본적으로 player interaction 없음.

NPC animation 용도.

CH10 자택 의자도 굳이 앉기 기능 추가하지 않는다.

---

# 30. Filing Cabinet

권장:

```text
width  0.45~0.6m
depth  0.5~0.65m
height 1.2~1.5m
```

기본 collision 있음.

drawer interaction은 챕터상 필요할 때만.

---

# 31. Bookshelf

깊이:

```text
0.25~0.35m
```

높이:

```text
1.5~2.0m
```

player path를 좁히지 않게 벽 쪽.

---

# 32. Chalkboard

목적:

• CH2
• ambient research
• group discussion

권장 visible area:

```text
width  2.2~3.2m
height 1.1~1.5m
```

하단 높이는 사람이 자연스럽게 쓰는 위치.

---

# 33. Chalkboard Collision

벽에 붙은 `STATIC_THIN`.

player가 board plane 안으로 들어가지 않게 작은 collision thickness.

---

# 34. Chalk

작은 장식/gesture object.

실제 player interaction 불필요.

NPC hand anchor attachment 가능.

---

# 35. Document Sheet

일반 letter-like 연구 문서.

권장:

```text
width  0.21~0.23m
height 0.28~0.30m
thickness 0.0005~0.002m visual
```

실제 collision은 더 단순화 가능.

---

# 36. Document Collision

world placement 상태에서는 작은 thin collision 또는 interaction-only.

player movement를 종이 한 장이 막으면 안 된다.

---

# 37. Document Interaction

가능:

```text
INSPECT
PICKUP
FLIP
COMPARE
STAMP
```

문서 상태에 따라 제한.

---

# 38. Document Grip

기본 grip:

```text
lower_left
lower_right
side
```

핵심 텍스트를 가리지 않는 위치.

---

# 39. Document Material

• diffuse paper
• low specular
• subtle normal
• front/back texture 가능

---

# 40. Calculation Card

권장 크기:

```text
width  0.10~0.14m
height 0.07~0.10m
```

종이보다 단단한 카드.

---

# 41. Index / Data Card

CH1 등에서 여러 장 사용할 때 4~8장 정도 화면에서 구분 가능한 크기.

너무 작은 실제 index card scale 때문에 모바일에서 못 읽으면 inspect pose에서 확대.

world scale 자체를 비정상적으로 키우지 않는다.

---

# 42. Clipboard

권장:

```text
width  0.23~0.26m
height 0.31~0.35m
thickness 0.008~0.015m
```

NPC hand object에 적합.

---

# 43. Binder

권장:

```text
width  0.24~0.28m
height 0.31~0.36m
thickness 0.025~0.05m
```

문서보다 묵직한 object.

---

# 44. Binder Collision

held 상태에서는 gameplay collision 최소화.

world table 상태에서는 thin box.

---

# 45. Pencil

권장:

```text
length 0.16~0.19m
diameter 약 0.006~0.008m
```

기본 decorative.

핵심 interaction target으로 사용하지 않는다.

---

# 46. Pen

시대 적합한 fountain pen/desk pen variant 가능.

기본 decorative.

---

# 47. Coffee Cup / Mug

권장:

```text
diameter 0.075~0.095m
height   0.08~0.105m
```

---

# 48. Cup Collision

작은 desk prop.

player movement collider에는 영향 없음.

object animation sweep에는 장애물로 취급 가능.

---

# 49. Cup Interaction

기본 없음.

“커피 마시기” 기능을 불필요하게 추가하지 않는다.

---

# 50. Ashtray

CH10 자택/일부 사무 공간.

권장:

```text
diameter 0.10~0.16m
height 0.02~0.04m
```

기본 decorative.

---

# 51. Glasses

CH10 personal prop 또는 desk detail.

interaction은 스토리상 의미 있을 때만.

플레이어 신원 leak가 될 수 있는 engraving 금지.

---

# 52. REJECTED Stamp

권장:

```text
handle height 0.09~0.12m
face width    0.05~0.07m
face depth    0.02~0.035m
```

상세 동작은 `14_STAMP.md`.

---

# 53. APPROVED Stamp

REJECTED와 동일 family.

크기 차이는 최소.

실루엣으로는 같은 행정 도구.

---

# 54. Stamp Pivot

기본 object origin:

stamp face 중심 또는 grip과 animation을 편하게 분리할 수 있는 root.

필수 anchor:

```text
GRIP
FACE_CONTACT
```

---

# 55. Stamp Collision

world rest 상태:
작은 solid 또는 interaction-only.

STAMP sequence:
sweep collision 별도.

player movement를 막지 않음.

---

# 56. Stamp Material

• wood 또는 bakelite-like handle
• rubber/metal lower body
• 지나치게 새 제품처럼 glossy 금지

---

# 57. Stamp Home Stand

도장 받침이 있다면:

```text
width/depth 약 0.08~0.12m
```

도장과 별도 static prop.

---

# 58. Desk Lamp

목적:

• task lighting
• 공간 분위기

권장 높이:

```text
0.35~0.55m
```

---

# 59. Desk Lamp Collision

작은 desk obstacle.

stamp/document zone 밖에 배치.

interaction은 기본 없음.

---

# 60. Wall Clock

CH7 시간 기록 또는 ambience.

직경:

```text
0.22~0.35m
```

실제 시간이 puzzle clue가 되는 경우 chapter state와 동기화된 display.

---

# 61. Clock Interaction

기본 없음.

필요하면 inspect 가능.

시계를 클릭해서 시간을 맞추는 퍼즐로 만들지 않는다.

---

# 62. Equipment Cabinet / Rack

권장:

```text
width  0.55~1.0m
depth  0.45~0.7m
height 1.4~1.8m
```

static solid.

---

# 63. CRT Monitor / Oscilloscope-like Unit

CH3 등.

권장:

```text
width  0.35~0.55m
depth  0.35~0.55m
height 0.30~0.45m
```

---

# 64. CRT Screen

별도 emissive surface.

화면 plane과 housing을 분리.

screen content를 매 frame CanvasTexture로 재생성하지 않는다.

---

# 65. CRT Interaction

housing 전체가 target이 아니라 필요한 control/inspect surface만.

---

# 66. Gauge

직경:

```text
0.07~0.14m
```

작은 기계 계기.

필요시 inspect proxy 확대.

---

# 67. Gauge Needle

pivot은 dial center.

needle animation 가능.

player가 바늘을 직접 드래그하지 않음.

---

# 68. Indicator Lamp

크기:

```text
diameter 0.015~0.035m
```

interaction 없음.

system state 표시.

---

# 69. Push Button

권장:

```text
diameter 0.025~0.05m
travel 0.004~0.012m
```

---

# 70. Button Collision

작은 interaction proxy.

실제 world collider는 없어도 됨.

---

# 71. Toggle Switch

lever length:

```text
0.025~0.06m
```

손가락 조작 가능한 크기.

---

# 72. Large Lever

장비 조작용.

handle length:

```text
0.12~0.25m
```

pivot/arc 공간 필요.

---

# 73. Knob

직경:

```text
0.03~0.07m
```

보조 control.

반복 target-number puzzle 금지.

---

# 74. Machine Controls Spacing

control 간 최소 시각/interaction 구분 필요.

작은 버튼 6개를 2cm 간격으로 몰아놓고 모바일에서 누르게 하지 않는다.

실제 모델에 많은 control이 있어도 gameplay control은 일부만 active.

---

# 75. Counter / Detector Unit

CH6.

본체:

```text
width  0.30~0.55m
depth  0.30~0.50m
height 0.25~0.45m
```

counter display/indicator 별도.

---

# 76. Sample Tray

권장:

```text
width  0.12~0.20m
depth  0.08~0.15m
```

sample swap animation에 충분한 공간.

---

# 77. Sample

너무 작아 interaction 불가능한 실제 microscopic object를 그대로 쓰지 않는다.

sample holder/carrier를 interaction object로 사용.

---

# 78. Sample Holder

권장:

```text
0.04~0.08m scale
```

작은 tray/canister/holder.

label 읽기 가능.

---

# 79. Recorder

CH7 automatic recorder.

종이 tape 또는 dial/display.

story evidence는 읽기 가능한 media에 표시.

---

# 80. Alarm Light

벽/장비에 부착.

interaction 없음.

CH7 event에서 light/audio emitter 역할.

---

# 81. Alarm Bell / Buzzer Housing

시대에 맞는 장비.

visual prop + audio source.

player가 꺼야 하는 퍼즐로 만들지 않는다.

---

# 82. Door Frame

문과 별도 static object.

frame collision은 벽과 통합 가능.

---

# 83. Interior Door

권장:

```text
width  0.82~0.95m
height 1.95~2.10m
thickness 0.035~0.05m
```

---

# 84. Wider Equipment Door

큰 장비/박스 운반 동선은 필요 시 더 넓게.

```text
0.95~1.15m
```

---

# 85. Door Panel Collider

`DOOR_PANEL`.

panel shape를 단순 box로.

hinge pivot 정확.

---

# 86. Door Handle

높이:

```text
약 0.90~1.05m
```

player/NPC hand reach 자연스럽게.

---

# 87. Door Handle Interaction Proxy

실제 handle보다 크게.

door panel 전체 click은 기본 금지.

---

# 88. Door Stop / Wall Clearance

문 최대 open angle을 실제 벽/가구 기준으로 제한.

---

# 89. CH10 Front Door

자택 현관.

권장:

```text
width 0.85~0.95m
height 2.0~2.1m
```

parcel carry가 자연스럽게 통과.

---

# 90. Door Peephole / Mail Slot

시대/건물 스타일에 맞는 경우만.

불필요한 interaction 없음.

---

# 91. Radio

CH10 핵심 ambient/story object.

권장 tabletop radio:

```text
width  0.35~0.50m
depth  0.18~0.28m
height 0.22~0.32m
```

---

# 92. Radio Collision

table prop.

player movement에는 영향 없음.

---

# 93. Radio Interaction

기본 story activation 1회.

불필요한 주파수 맞추기 puzzle 없음.

---

# 94. Radio Controls

knob 1~2개 visible.

gameplay 필요 없으면 decorative.

---

# 95. Radio Speaker

audio emitter 위치는 speaker grille 중심.

---

# 96. Telephone Base

1940s desk telephone.

권장:

```text
width  0.20~0.26m
depth  0.18~0.24m
height 0.13~0.18m
```

---

# 97. Telephone Base Collision

table fixed.

handset animation 동안 base는 움직이지 않음.

---

# 98. Handset

길이:

```text
0.20~0.25m
```

그립 가능한 중앙 손잡이.

---

# 99. Handset Anchors

필수:

```text
GRIP
EAR_END
MOUTH_END
CORD_ATTACH
CRADLE_LEFT
CRADLE_RIGHT
```

필요 수준에 맞게 단순화 가능.

---

# 100. Handset Collider

story animation용 simplified capsule/box.

world player collider와 직접 강하게 반응시키지 않음.

---

# 101. Handset Material

bakelite-like dark material.

적당한 gloss.

너무 현대 플라스틱처럼 보이지 않게.

---

# 102. Telephone Cord

실제 rigid mesh 한 줄보다 curve/segmented geometry.

기본 길이:

```text
약 0.8~1.3m
```

CH10 throw path를 만족하도록 최종 조정.

---

# 103. Cord Collision

full collision simulation 없음.

주요 surface 관통 방지용 authored control points.

---

# 104. Newspaper

CH10 ambient story prop.

권장 펼친 폭:

```text
0.35~0.55m
```

필요한 headline만 readable.

---

# 105. Newspaper Spoiler

Oppenheimer 이름이 postcard 전에 headline/body에 나오지 않게 한다.

전쟁 종결 정보만.

---

# 106. Mail / Envelope

CH10 ambience.

실제 player name 또는 surname 표시 금지.

장식 interaction 기본 없음.

---

# 107. Family Photo Frame

CH10 생활감.

플레이어 얼굴/정체를 유추할 수 있는 명백한 실제 Oppenheimer family likeness는 postcard 전에 주의.

가능하면 흐릿하거나 generic composition.

---

# 108. Family Photo Interaction

기본 없음 또는 짧은 inspect.

정체 reveal clue로 쓰지 않는다.

---

# 109. Coat Rack / Coat

자택 분위기.

player silhouette/체형을 특정 역사 인물로 추론하게 하는 과도한 개인 표식 금지.

---

# 110. Parcel

CH10 CARRY 핵심.

권장:

```text
width  0.38~0.50m
depth  0.28~0.38m
height 0.20~0.30m
```

양손 carry에 적합.

---

# 111. Parcel Weight Class

`HEAVY_SMALL / MEDIUM_LARGE`

종이처럼 빠르게 움직이지 않음.

---

# 112. Parcel Collider

`DYNAMIC_LARGE`.

carry 중:

• doorway clearance
• table clearance
• camera clipping

검사.

---

# 113. Parcel Interaction Proxy

상자 전체보다 약간 확장된 top/front volume.

현관문 너머로 닫힌 상태에서 잡히지 않음.

---

# 114. Parcel Grip

양손 기준:

```text
GRIP_LEFT_SIDE
GRIP_RIGHT_SIDE
```

또는 하단 양쪽.

---

# 115. Parcel Label

가능:

```text
OFFICIAL
PERSONAL DELIVERY
WAR DEPARTMENT
```

단:

`OPPENHEIMER`

금지.

---

# 116. Parcel String

직경:

```text
약 0.003~0.006m
```

시각적으로 읽히게 필요하면 약간 과장 가능.

---

# 117. String Collider

실제 collision 없음.

interaction은 knot proxy.

---

# 118. Knot Interaction Proxy

실제 매듭보다 조금 크게.

player가 정확한 끈 한 가닥을 눌러야 하지 않게 한다.

---

# 119. Box Lid

parcel top panel 또는 별도 lid.

rear hinge anchor.

---

# 120. Lid Collider

opening animation 중 simplified box/sweep.

---

# 121. Lid Handle

별도 손잡이가 없다면 front edge grip anchor 사용.

---

# 122. Internal Content Anchors

상자 내부:

```text
PHOTO_SLOT
MEDAL_SLOT
POSTCARD_SLOT
```

각각 고정.

---

# 123. Box Interior Depth

사진/메달이 자연스럽게 겹치며 postcard를 물리적으로 가릴 정도.

하지만 너무 깊어 camera가 내용물을 못 봐서는 안 됨.

---

# 124. Photo

권장:

```text
width  0.11~0.15m
height 0.08~0.11m
thickness 0.0005~0.0015m
```

---

# 125. Photo Material

front:
photo print.

back:
matte paper.

gloss 과도 금지.

---

# 126. Photo Interaction Proxy

actual photo보다 약간 확장.

photo/medal proxy가 과도하게 겹치지 않음.

---

# 127. Photo Grip

corner/edge.

이미지 중앙 가림 금지.

---

# 128. Medal / Token

권장:

```text
diameter 0.045~0.065m
thickness 0.003~0.008m
```

---

# 129. Medal Material

metallic.

반사 강도는 글자 가독성을 해치지 않게.

---

# 130. Medal Collider

작은 cylinder.

world movement에는 영향 없음.

inspect/placement에만.

---

# 131. Medal Interaction Proxy

실제보다 1.5~2배 정도 screen selection 여유를 줄 수 있음.

정확한 proxy scale은 모바일 QA로 조정.

---

# 132. Medal Grip

edge grip.

각인 영역을 손이 덮지 않는다.

---

# 133. Postcard

권장:

```text
width  0.14~0.16m
height 0.09~0.11m
thickness 0.0008~0.002m
```

실제 엽서 비율 유지.

---

# 134. Postcard Material

photo postcard보다 matte/warm card stock.

front/back distinct texture.

---

# 135. Postcard Interaction Proxy

photo/medal 제거 전 disabled.

실제 이름 부분이 보이지 않더라도 proxy만 잡히는 문제 방지.

---

# 136. Postcard Grip

이름 reveal 영역 반대 edge.

손이 `J. ROBERT OPPENHEIMER`를 가리지 않음.

---

# 137. Postcard Spoiler Level

기본:

```text
IDENTITY_REVEAL
```

현재 story state가 허용하기 전 back text material/texture 자체를 활성화하지 않는다.

---

# 138. CH9 Board

시설 내 대형 display/board.

물리 housing과 screen surface 분리.

권장 화면:

```text
width  1.8~3.0m
height 1.0~1.8m
```

room 크기에 따라.

---

# 139. Board Collision

벽 부착 `STATIC_THIN`.

player가 screen 내부로 들어가지 않음.

---

# 140. Board Interaction

`VIEW RESULTS` phase에만.

interaction proxy는 화면 일부가 아니라 board 전면 전체를 적절히 커버 가능.

---

# 141. Board Screen

emissive display surface.

screen content는 screen plane 내부에 렌더.

NPC silhouette와 대비 검토.

---

# 142. Board Controls

실제 버튼을 둘 경우 하나의 명확한 physical control 또는 screen interaction.

여러 menu/button UI 금지.

---

# 143. Board Speaker

필요한 archival sound가 board에서 나오는 느낌이면 audio emitter 위치를 screen 주변에 둘 수 있음.

---

# 144. Calculator / Mechanical Calculator

Richard 작업용.

권장 desk machine:

```text
width  0.25~0.35m
depth  0.30~0.40m
height 0.18~0.28m
```

---

# 145. Calculator Interaction

player 퍼즐 core control로 만들지 않는 것을 기본.

NPC task/몽타주 object.

---

# 146. Calculator Animation

keys/lever 일부 움직임 가능.

복잡한 실제 계산 simulation 불필요.

---

# 147. Card Tray

Richard 계산 카드 보관.

권장:

```text
width 0.15~0.25m
depth 0.20~0.35m
```

---

# 148. Reference Clock

CH3 evidence.

벽 시계 또는 bench instrument 형태.

실제 time reference object.

---

# 149. Reference Clock Replacement Variant

OLD / NEW 외형을 아주 극단적으로 다르게 만들어 정답을 즉시 알리지 않는다.

model number/record가 핵심.

---

# 150. Amplifier / Recording Unit

CH4 generic equipment.

weapon-specific geometry 금지.

rack-mounted rectangular equipment 중심.

---

# 151. Material Specimen

CH5.

generic material block/sample.

실제 폭발물처럼 보이는 형태 금지.

---

# 152. Material Specimen Size

손/테이블 작업 가능한 수준.

예:

```text
0.08~0.20m
```

구체 puzzle에 따라.

---

# 153. Sensor

CH5.

작은 측정 sensor.

위치 map과 연결 가능.

player가 sensor를 실제로 설치하는 technician puzzle은 기본 금지.

---

# 154. Sample Canister

CH6 generic.

라벨:

```text
SAMPLE A
SAMPLE B
```

등.

---

# 155. Incident Recorder

CH7.

물리 reel/tape/chart recorder 느낌 가능.

플레이어가 내부 기계를 분해하지 않는다.

---

# 156. Incident Camera Frame / Film Record

카메라 사진 또는 small frame cards.

실제 graphic accident image보다 시간/장비 상태 중심.

---

# 157. Final Report

CH8.

일반 binder보다 조금 두껍고 공식적인 variant.

권장:

```text
width 0.25~0.29m
height 0.33~0.37m
thickness 0.035~0.06m
```

---

# 158. Final Report Interaction

• inspect
• compare
• stamp

핵심.

8명 앞에서 physical presence가 충분히 보일 크기.

---

# 159. Archive Binder / Drawer

CH8 approved archive 접근용.

선택:

• binder
• filing drawer
• organized stack

중 하나.

UI 메뉴처럼 보이지 않게.

---

# 160. Archive Interaction

archive shell 하나를 interaction하고,
내부 approved record를 선택.

실제 서랍 수십 개를 하나씩 열게 하지 않는다.

---

# 161. Facility Progress Board

CH1~8 progress 표시.

예:

```text
PROJECT ███████
PROGRESS 00%
```

---

# 162. Progress Board Size

room에서 읽을 수 있는 정도.

너무 큰 HUD형 wall UI 금지.

---

# 163. Progress Board Interaction

기본 없음.

story state를 표시하는 환경 object.

---

# 164. Progress Board Update

승인 후 animation 가능.

screen/flip/indicator 방식은 visual style에 맞춤.

---

# 165. Relay / Indicator Panel

facility activation을 보여주는 ambient equipment.

interaction 없음 또는 제한.

---

# 166. Work Lamp

chapter progress에 따라 켜지는 지역 조명.

object family는 같되 위치별 variant.

---

# 167. Vent / Fan

환경 ambience.

회전 animation 가능.

story-critical interaction 없음.

---

# 168. Pipe / Conduit

환경 mesh.

collision은 큰 배관만.

작은 벽 conduit는 collision 없음.

---

# 169. Cable

바닥/벽 ambience.

player/NPC movement를 막지 않는 시각 object.

critical path 바깥 배치.

---

# 170. Crate

facility storage.

권장:

```text
0.35~0.65m
```

공간 filling prop.

player가 밀 수 없음.

---

# 171. Crate Collision

큰 crate는 static solid.

작은 장식 상자는 critical path 밖.

---

# 172. Tool Cart

연구실 분위기.

권장:

```text
width 0.55~0.8m
depth 0.35~0.55m
height 0.75~0.95m
```

---

# 173. Tool Cart Collision

static.

NPC route와 겹치지 않음.

player가 밀 수 없음.

---

# 174. Fire Extinguisher / Safety Prop

시대 고증에 맞는 variant만.

불필요한 interaction 없음.

---

# 175. Wall Sign

부서명/안전 표지.

스포일러 금지어 audit 필요.

---

# 176. Department Sign

가능:

```text
CALCULATION
INSTRUMENTATION
MATERIAL TEST
CONTROL
```

구체 무기명 없음.

---

# 177. Room Number

공간 navigation 보조.

과도한 HUD 대신 실제 signage 사용 가능.

---

# 178. Object Naming Rule

내부:

```text
family_variant_chapter_optional
```

예:

```text
desk_director_main
stamp_rejected
phone_home_01
parcel_home_official
```

---

# 179. Spoiler-Safe Public Label

internal id와 public interaction label 분리.

예:

```text
internal: postcard_oppenheimer
public before reveal: 엽서
```

---

# 180. Asset Filename Spoiler

빌드 asset path 자체는 일반 플레이어 UI에 보이지 않지만,
debug/error가 production UI에 노출되는 경우를 고려.

가능하면:

```text
postcard_identity_final
```

처럼 노골적 이름도 production-visible error에 나오지 않게 한다.

---

# 181. Material Family

공통 family:

```text
WOOD_DARK
WOOD_LIGHT
PAINTED_METAL
BAKELITE
PAPER
CARD
GLASS
RUBBER
FABRIC
BRASS
STEEL
CARDBOARD
```

---

# 182. Material Reuse

동일 family의 material을 공유해 draw call/메모리 줄이기.

단, 모든 책상/장비가 똑같은 표면으로 보이지 않게 texture variation 허용.

---

# 183. Texture Atlas

작은 장식품/라벨은 atlas 고려.

중요 문서/엽서/board는 독립 readable texture 우선.

---

# 184. Unique Texture

story-critical readable object:

• document
• final report
• photo
• postcard
• board

는 충분한 해상도의 고유 texture 허용.

---

# 185. Normal Map

필요한 곳에만.

종이/나무/금속 표면에 subtle.

모바일에서 비용 대비 효과 검토.

---

# 186. Roughness

시대감과 가독성을 위해 지나친 gloss 금지.

특히:

• paper
• desk
• equipment paint

---

# 187. Metal

메달/장비 control 등.

환경 reflection이 지나치게 강해 글자가 날아가지 않게 한다.

---

# 188. Glass

CRT cover/창문.

투명 재질은 sorting 문제 최소화.

interaction proxy와 별도.

---

# 189. Object LOD

세 단계까지 필요하면:

```text
LOD0 close inspect
LOD1 room
LOD2 distant/background
```

하지만 작은 prop에 과도한 LOD 시스템 불필요.

---

# 190. Story Object LOD

inspect 가능한 object는 가까이서 충분한 detail 유지.

LOD 전환 중 형태가 튀지 않게.

---

# 191. Background Object

멀리 있는 crate/tool 등은 단순 mesh/material.

---

# 192. Shadow 정책

shadow casting 우선:

• player-relevant furniture
• NPC
• major objects

작은 pencil/card 전부 dynamic shadow 필요 없음.

---

# 193. Story Object Shadow

photo/medal/document처럼 surface contact가 중요한 물체는 contact shadow 또는 적절한 scene shadow로 떠 보이지 않게 한다.

---

# 194. Object Pooling

반복 생성/삭제되는 particle/effect는 pool 가능.

실제 story object는 id 기반 고유 instance.

---

# 195. Duplicate Prevention

story-critical id는 scene 내 uniqueness 검사.

예:

```text
postcard_identity: 1
phone_handset: 1
final_report: 1
```

---

# 196. Object Lifecycle

```text
REGISTER
→ ACTIVE/INACTIVE
→ ANIMATED/HELD/PLACED
→ STORY COMPLETE
→ DISPOSE AT SCENE END
```

---

# 197. Hidden Object

story상 아직 보이면 안 되는 object는 단순 interaction disable만으로 부족할 수 있음.

예:

postcard.

필요하면 geometry도 실제 가림/숨김.

---

# 198. Disabled Object

보이지만 interaction만 불가한 object.

예:

노크 전 현관문 handle.

시각적으로 “게임 잠금” glow를 띄우지 않는다.

---

# 199. Canonical Pose

각 story object는 checkpoint 복원을 위한 canonical pose가 있어야 한다.

예:

```text
PHONE_ON_CRADLE
PHONE_DROPPED
PARCEL_OUTSIDE
PARCEL_TABLE
BOX_OPEN
PHOTO_TABLE
MEDAL_TABLE
POSTCARD_INSPECT
```

---

# 200. Canonical Pose Data

raw position만이 아니라:

```text
parent
position
rotation
scale
state
slot
```

을 포함할 수 있다.

---

# 201. Dynamic Physics 사용 범위

실시간 rigidbody physics는 기본 공통 요구가 아니다.

사용 시:

• decorative
• 비결정적 결과가 story에 영향 없음

인 경우 우선.

---

# 202. Story Object는 Authored

핵심 물체는 predictable authored animation 우선.

---

# 203. Object Collision과 Animation 분리

animating object의 visual mesh와 gameplay collider를 필요에 따라 별도 업데이트.

door는 panel collider도 회전.

문서는 player collision 없음.

---

# 204. Small Object Player Collision

작은 desk prop 때문에 player root가 걸리는 문제 금지.

작은 object collider는 interaction/animation용이지 navigation blocking용이 아님.

---

# 205. Large Object Player Collision

책상/캐비닛/장비/문/큰 crate는 navigation collision 있음.

---

# 206. Carry Object Collision

parcel은 CARRY 중 player footprint를 확장하는 개념 필요.

최종 값은 `18_COLLISION_AND_CLEARANCE.md`.

---

# 207. Camera Near Plane 고려

작은 object inspect에서 카메라 바로 앞 1cm에 놓지 않는다.

inspect anchor가 안정된 depth 유지.

---

# 208. Interaction Distance 고려

object scale이 작다고 maxDistance를 늘려 방 건너편에서 클릭하게 하지 않는다.

proxy + close approach로 해결.

---

# 209. Object Sound Anchor

기계/전화/라디오/도어 등은 audio anchor를 가질 수 있음.

실제 음원 위치와 시각 object가 일치.

---

# 210. Object Light Anchor

lamp/indicator/board는 light/emissive anchor.

lighting system과 연결.

---

# 211. Particle Anchor

필요한 경우:

• dust
• CRT effect
• smoke inside board film

등.

실물 object마다 particle emitter를 붙이지 않는다.

---

# 212. Historical Plausibility

오브젝트는 1940년대 분위기에 맞아야 한다.

금지:

• 현대 LED panel
• 현대 사무 의자
• 플라스틱 PC 키보드
• 디지털 flat screen
• 현대 cordless phone

---

# 213. 시대감을 과장하지 않기

모든 물건을 낡고 녹슬게 만들지 않는다.

비밀 연구시설은 실제로 운영되는 전문 작업 공간.

기능 장비는 관리된 상태.

---

# 214. 사용감

적절한:

• 손때
• 긁힘
• 종이 얼룩
• 페인트 마모

가능.

critical text/interaction surface는 명확.

---

# 215. CH1~8 시설 변화

같은 family object라도 chapter 진행에 따라:

• 문서량
• 켜진 장비
• 소품 위치
• 사용감

변화 가능.

하지만 object scale/identity는 일관.

---

# 216. CH10 Visual Family

자택 object는 facility와 다른 material family 비중.

• warmer wood
• fabric
• domestic lamp
• radio
• telephone
• books

하지만 완전히 다른 게임처럼 과장하지 않는다.

---

# 217. Reuse 정책

재사용 적극 권장:

• desk family
• chairs
• cabinets
• generic equipment casing
• lamps
• papers
• switches

---

# 218. Unique 제작 대상

고유성이 중요한 것:

• CH9 board
• CH10 phone/throw setup
• parcel/box contents
• postcard
• final report
• 일부 chapter puzzle instrument

---

# 219. Over-Modeling 금지

보이지 않는 내부 나사/기계부품까지 정교하게 만들지 않는다.

플레이어가 볼 거리와 interaction에 필요한 detail만.

---

# 220. Geometry Budget

큰 가구:
단순.

손에 드는 story object:
상대적으로 detail.

멀리 배경 object:
최소.

---

# 221. Label Geometry

문서/장비 label은 geometry text보다 texture/canvas 기반이 효율적일 수 있음.

단 readable.

---

# 222. Text Mesh 사용

큰 board/sign 등 일부만.

작은 문서 text를 수천 개 3D glyph로 만들지 않는다.

---

# 223. UV 방향

문서/label texture가 거꾸로 나오지 않도록 front orientation 표준화.

---

# 224. Front Axis 규칙

가능하면 object library에 공통 orientation convention.

예:

```text
+Y up
+Z front
```

또는 프로젝트가 선택한 기준.

모델마다 forward axis가 제각각이면 animation 복잡도 증가.

---

# 225. Scale Bake

imported model scale을 scene에서 0.0137 등으로 남발하지 않는다.

가능하면 asset 자체를 meter scale로 정규화.

---

# 226. Rotation Bake

모델 import 후 모든 object가 `rotation.x = Math.PI/2`를 기본으로 요구하지 않게 asset orientation 정리.

---

# 227. Origin Validation

pivot/origin이 잘못된 asset은 library 등록 전에 수정.

---

# 228. Bounding Box Validation

각 asset 등록 시 actual dimensions를 자동 출력/검사 가능.

설계값과 20% 이상 다르면 warning.

---

# 229. Story Object Metadata Validation

storyCritical object는 필수 metadata 확인.

예:

```text
id
dimensions
interactionProfile
canonicalPose
spoilerLevel
```

---

# 230. Collider Validation

render bounds보다 지나치게 큰 collider 금지.

player가 보이지 않는 벽에 걸리는 문제 방지.

---

# 231. Proxy Validation

interaction proxy가 인접 object 영역을 침범하면 warning.

특히:

• photo/medal/postcard
• desk stamps
• machine buttons

---

# 232. Grip Validation

player/NPC hand preview에서:

• gap
• clipping
• wrong orientation

검사.

---

# 233. Placement Validation

모든 placement slot에서:

• table bounds
• neighbor object
• camera visibility
• next animation path

검사.

---

# 234. Object Library Debug View

개발 모드:

```text
id
family
dimensions
pivot
collider
proxy
grips
state
owner
storyCritical
spoilerLevel
LOD
```

표시 가능.

---

# 235. Object Preview Scene

공통 asset을 검증하는 별도 개발 scene 권장.

한 공간에서:

• 1m reference
• player height
• desk
• hand
• lighting

과 함께 오브젝트 scale 확인.

---

# 236. Preview 기능

가능:

• rotate
• collider 표시
• proxy 표시
• pivot 표시
• grip anchor 표시
• LOD 전환
• material variant

---

# 237. Mobile Preview

작은 오브젝트:

• interaction target 크기
• inspect readability
• GPU cost

를 실제 모바일 viewport에서 검사.

---

# 238. CH8 Stress

한 scene에:

• 8 NPC
• final report
• many papers
• desks
• equipment

있어도 성능 유지.

장식 object 수 때문에 story animation이 끊기지 않게 한다.

---

# 239. CH10 Stress

작은 자택 안에:

• books
• radio
• phone
• cord
• parcel
• box
• photo
• medal
• postcard

가 집중.

투명/그림자/고해상도 texture 비용 검토.

---

# 240. Object Save

정확한 world transform 전체를 저장하지 않는다.

story-critical object는 semantic state 기반 canonical pose 복원.

---

# 241. Save 예

```text
phoneState = DROPPED
parcelState = PLACED
photoInspected = true
medalInspected = false
```

로드 시 library pose를 이용해 배치.

---

# 242. Invalid Save Fallback

존재하지 않는 object variant/state가 저장돼 있으면 가장 가까운 canonical state 사용.

영구 진행 불가 금지.

---

# 243. Asset Versioning

모델을 바꿔도 save가 깨지지 않게 save는 mesh filename보다 logical object id를 사용.

---

# 244. Object IDs

한 번 story/save에 사용한 logical id는 가능하면 유지.

---

# 245. Disposal

chapter page 종료 시:

• geometry/material/texture ref 관리
• unique scene object cleanup
• event listener cleanup
• audio node cleanup

---

# 246. Shared Asset Disposal

공유 asset을 한 instance가 dispose해서 다른 object가 깨지는 문제 주의.

reference 관리 또는 page 단위 lifecycle.

---

# 247. Missing Asset Fallback

story-critical:
fallback simple mesh + readable label 가능.

decorative:
생략 가능.

---

# 248. Fallback도 Scale 유지

placeholder cube가 실제 object보다 4배 커서 collision을 막는 문제 금지.

fallback dimensions도 descriptor 기준.

---

# 249. QA: Scale

모든 핵심 object를 player/NPC와 비교.

• 문손잡이 높이
• desk 높이
• 전화 크기
• 상자 크기
• 메달 크기
• 문서 크기

사람 비례가 자연스러운지 검사.

---

# 250. QA: Interaction

• proxy 충분
• adjacent target 오선택 없음
• mobile
• distance
• LOS

검사.

---

# 251. QA: Animation

• pivot 정확
• grip 정확
• hinge 정확
• path clearance
• canonical pose

검사.

---

# 252. QA: Collision

• 작은 prop이 navigation을 막지 않음
• 큰 가구 통과 불가
• 문 panel collider 동기화
• carry box doorway 통과

검사.

---

# 253. QA: Spoiler

CH1~8/CH10 reveal 전:

• object label
• texture
• engraving
• nameplate
• family photo
• parcel label

검사.

---

# 254. QA: Reuse

같은 asset이 너무 반복되어 모든 방이 복제처럼 보이지 않는지 확인.

material/prop arrangement variant 사용.

---

# 255. QA: Performance

• draw calls
• shadow casters
• transparent objects
• high-res unique textures
• scene object count

CH8/CH10 worst-case에서 확인.

---

# 256. 금지사항

• 모든 모델 임의 scale
• mesh 이름으로 gameplay 로직
• 모든 pivot geometry center
• 작은 prop이 player movement 차단
• interaction을 위해 실제 object를 비정상적으로 크게 제작
• door frame과 panel pivot 오류
• phone cord를 단순 직선으로 table 관통
• parcel이 현관문보다 큼
• lid hinge가 box center
• photo/medal/postcard proxy 겹침
• postcard 이름 material 조기 활성
• modern-looking equipment
• 모든 object 녹/세피아
• 모든 작은 prop dynamic shadow
• story-critical random physics
• unique story object duplicate
• save에 mesh filename 의존
• 불필요한 고폴리 내부 구조
• 장식품 때문에 critical route 막힘

---

# 257. 후속 문서와의 연결

`16_FACILITY_ARCHITECTURE.md`
• 어떤 object family가 어떤 공간에 존재하는지 정의

`17_SPATIAL_LAYOUT.md`
• 본 문서의 실제 dimensions를 이용해 가구/장비/통로 배치 확정

`18_COLLISION_AND_CLEARANCE.md`
• collider, player clearance, carry expansion, sweep 최종 수치 확정

`19_FACILITY_PROGRESS.md`
• 같은 object family의 chapter 진행별 밀도/상태 변화 정의

`20_LIGHTING.md`
• lamp, CRT, board, indicator의 실제 광원 역할 정의

`21_AUDIO.md`
• radio, phone, machine, door 등 object audio anchor 정의

`22_VISUAL_STYLE.md`
• material family와 wear 수준 확정

`27_MOBILE.md`
• small object proxy와 inspect scaling 최종 조정

`28_PERFORMANCE.md`
• object LOD, shadow, texture, draw-call budget 최종 확정

각 CHAPTER `OBJECT_PLACEMENT.md`
• 실제 object variant와 정확한 배치 위치를 선택

<!-- MERGED SOURCE END: 15_OBJECTS.md -->
