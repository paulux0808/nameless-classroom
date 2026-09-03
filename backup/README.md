# 백업

Stage 1 `index.html`의 시점별 스냅샷입니다. 실행에는 쓰이지 않습니다.

| 파일 | 시점 | 내용 |
|---|---|---|
| `index_stage1_20260901.html` | 2026-09-01 | 확장팩 이전 단일 게임 시절 빌드 (구 `stage1/index1.html`) |
| `index_stage1_20260903.html` | 2026-09-03 | 코드/UI 전면 수정 직전 상태 |

현재 실행본은 `stage1/index.html` 입니다.

## 제거된 것

`stage2_20260903/` (구 stage2 배포본 `ch01.html`·`ch02.html`·`index.html` 과
1세대 런타임 `source.zip`) 은 삭제했다. 이유는 두 가지다.

1. **스포일러가 새어 있었다.** NPC 상호작용 라벨과 목표 문구에 연구자의
   실명(성 포함)이 그대로 들어 있었다. CH1~8 동안 그 이름들은 어떤 경로로도
   노출하면 안 된다 (`stage2/spec/00_MASTER_CUESHEET-1.md` §2.1).
   `backup/` 은 GitHub Pages 에서 URL 로 접근 가능하므로 살려 둘 이유가 없다.
   무엇이 걸렸는지는 `npm run audit:spoiler` 로 언제든 다시 확인할 수 있다.
2. 설계 스펙은 이미 `stage2/spec/` 에 평문으로 꺼내 두었다. zip 안에만
   있던 유일본 문제는 해소됐다.

필요하면 git 이력에서 되살릴 수 있다 (`git log -- backup/stage2_20260903`).
