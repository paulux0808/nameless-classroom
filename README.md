# NAMELESS

브라우저에서 실행되는 내러티브 퍼즐 게임입니다.

## Play

- Stage 1: `stage1/index.html`
- Stage 2 Chapter 1: `stage2/index.html`
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
stage2/index.html           Stage 2 — Chapter 01 standalone build
stage2/source.zip           Stage 2 reusable runtime and chapter source
assets/vendor/              three.js r128 코어 및 애드온 로컬 사본
backup/                     index.html 시점별 스냅샷 (실행 안 함)
```

Stage 1의 three.js 애드온(GLTFLoader·포스트프로세싱)은 CDN이 아니라
`assets/vendor/`의 로컬 사본에서 불러옵니다. 인라인된 코어와 같은 리비전입니다.

Stage 2 source is bundled into a standalone offline HTML file with:

```sh
unzip source.zip -d source
cd source
npm install
npm test
npm run check
npm run audit:ch01
npm run build:ch01
npm run check:offline
```
