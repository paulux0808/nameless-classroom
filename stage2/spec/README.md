# NAMELESS Ⅱ — 설계 스펙

이 디렉터리가 **story / reveal 순서 / 챕터 내용 / 역사 표현 / 연출 페이싱의 유일한 권위**다.
코드가 스펙과 어긋나면 코드를 고친다.

`00_MASTER_CUESHEET-1.md` 가 CH1~10 전체 큐 시퀀스를 고정한다. 나머지는 영역별 규정이다.

| 파일 | 내용 |
|---|---|
| `00_MASTER_CUESHEET-1.md` | CH1~10 매크로 큐 시퀀스, reveal 순서 |
| `01_CORE_SYSTEM.md` | PLAYER / CONTROL / CAMERA / INTERACTION |
| `02_DIALOGUE_NPC.md` | DIALOGUE / NPC CORE / MOVEMENT / GESTURE / BLOCKING |
| `03_ANIMATION_CINEMATIC.md` | ANIMATION CORE / OBJECT ANIMATION / CINEMATIC |
| `04_DOCUMENT_OBJECTS.md` | DOCUMENT / STAMP / OBJECTS |
| `05_FACILITY_SPACE.md` | FACILITY / SPATIAL LAYOUT / COLLISION / PROGRESS |
| `06_LIGHTING_AUDIO_VISUAL_UI_TRANSITION.md` | LIGHTING / AUDIO / VISUAL / UI / TRANSITION |
| `07_SAVE_PACING_MOBILE_PERFORMANCE_SPOILER.md` | SAVE / PACING / MOBILE / PERF / SPOILER |
| `08_HISTORICAL_PRESENTATION.md` | 실제 역사와 창작의 구분 규정 |

참고 문서:

- `MASTER_CONTRACT.md` — 폐기된 1세대 런타임의 스펙↔모듈 매핑. 불변식 목록은 지금도 유효하다.
- `SOURCE_RESEARCH.md`, `THIRD_PARTY.md`, `OFFLINE_BUILD.md` — 1세대 런타임의 의존성/빌드 결정 기록.

> 이 스펙들은 원래 `stage2/source.zip` 안에만 있었다. 유일본이라 평문으로 꺼내 버전관리에 올렸다.
> 1세대 런타임 구현체는 `backup/stage2_20260903/source.zip` 에 그대로 남아 있다.
