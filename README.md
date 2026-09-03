# NAMELESS

브라우저에서 실행되는 내러티브 퍼즐 게임입니다.

## Play

- Stage 1: `stage1/index.html`
- Stage 2: `stage2/index.html` (챕터 선택)
- Stage selector: `index.html`

GitHub Pages에서는 루트 스테이지 선택 화면에서 각 스테이지로 진입합니다. Stage 2를 직접 시작할 때는 Stage 1 마지막 문에서 확인한 인계 코드가 필요합니다.

## Test

```sh
npm test        # stage1 단위 테스트 (의존성 없음, node:test)
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
stage2/chapters/            챕터별 데이터 (씬 배치·모순 규칙·대사)
stage2/spec/                설계 스펙 — story/연출의 권위
stage2/tests/               node:test 단위 테스트
docs/ASSETS.md              에셋 준비 목록
assets/vendor/              three.js r128 코어 및 애드온 로컬 사본
backup/                     index.html 시점별 스냅샷 (실행 안 함)
```

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
