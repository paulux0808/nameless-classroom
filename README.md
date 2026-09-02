# NAMELESS

브라우저에서 실행되는 내러티브 퍼즐 게임입니다.

## Play

- Stage 1: `stage1/index.html`
- Stage 2 Chapter 1: `stage2/index.html`
- Stage selector: `index.html`

GitHub Pages에서는 루트 스테이지 선택 화면에서 각 스테이지로 진입합니다. Stage 2를 직접 시작할 때는 Stage 1 마지막 문에서 확인한 인계 코드가 필요합니다.

## Structure

```text
index.html             NAMELESS stage selector
stage1/                Stage 1 — 이름 없는 교실
stage2/index.html      Stage 2 — Chapter 01 standalone build
stage2/source.zip      Stage 2 reusable runtime and chapter source
```

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
