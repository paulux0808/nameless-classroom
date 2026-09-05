# NAMELESS

브라우저에서 실행되는 내러티브 퍼즐 게임입니다.

## Play

- Stage 1: `stage1/index.html`
- Stage 2: `stage2/index.html` (챕터 선택)
- Stage selector: `index.html`

Stage 2는 현재 `stage2/index.html`에서 준비된 챕터를 코드 입력 없이 시작합니다.
브라우저 저장소를 읽거나 쓰지 않으며, 이전 진행 기록이 있어도 매번 새로 시작합니다.
진행 상태는 현재 페이지에서만 유지되어 새로고침·재진입 시 초기화됩니다.
클리어 코드 기반 진행 연동은 추후 추가합니다.

## Test

```sh
npm install     # 개발용 DOM 테스트 의존성
npm test        # stage1/stage2 로직·프론트엔드 테스트 + 스포일러 감사
```

## Structure

```text
index.html                  NAMELESS stage selector
stage1/index.html           Stage 1 — 이름 없는 교실 (three.js r128 인라인)
stage1/logic.js             정답·해시·충돌 등 순수 로직 (테스트 대상)
stage1/runtime-hardening.js 저장 복구·입력 잠금·적응형 해상도
stage1/tests/               node:test 단위 테스트
stage2/index.html           Stage 2 — 챕터 선택 허브
stage2/logic.js             순수 로직 (진행도·스포일러·검증 상태기계)
stage2/engine.js            공용 런타임 (씬·입력·문서·도장·대사)
stage2/reader.js            문서 표시 (나란히/확대·글자 크기·선택 표시)
stage2/chapters/            챕터별 데이터 (씬 배치·모순 규칙·대사)
stage2/spec/                설계 스펙 — story/연출의 권위
stage2/tests/               node:test 단위 테스트
docs/ASSETS.md              에셋 준비 목록
assets/vendor/              three.js r128 코어 및 애드온 로컬 사본
backup/                     index.html 시점별 스냅샷 (실행 안 함)
```

UI만 확인할 때는 로컬 서버에서 `stage2/tests/ui-preview.html`을 엽니다.
화면 크기를 바꿔 보고서·대화·도장·로딩·수정본을 확인할 수 있습니다.
미리보기는 실제 `reader.js`와 `chapter.css`를 사용하며 게임 저장에는 쓰지 않습니다.
DOM 회귀 테스트는 선택 시 스크롤·초점 유지와 엔진 연동을 검증합니다.
3D 렌더링과 실제 화면 배치는 WebGL을 지원하는 브라우저에서 별도 확인합니다.

Stage 1의 three.js 애드온(GLTFLoader·포스트프로세싱)은 CDN이 아니라
`assets/vendor/`의 로컬 사본에서 불러옵니다. 인라인된 코어와 같은 리비전입니다.

## Stage 2 구조

챕터 HTML은 껍데기다. 공용 동작은 `engine.js` / `logic.js` 에 있고, 챕터는
자기 씬·문서·모순 규칙·대사만 갖는다. 엔진을 고쳐야 하면 엔진을 고치고
모든 챕터가 같이 받는다 — 챕터에서 포크하지 않는다.

모델 배치는 배율이 아니라 **실치수(m)** 로 적는다. 엔진이 바운딩박스를 재서
맞추므로 에셋을 바꿔 끼워도 배치가 무너지지 않는다.

```js
{ id:"desk", path:"1943_steel_desk/desk.gltf",
  pos:[0,0,0.5], rot:[0,Math.PI,0], fitHeight:0.76 }
```

브라우저 콘솔에서 `N2Engine._measure()` 로 실제 앉은 크기를 확인할 수 있다.
