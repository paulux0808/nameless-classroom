# NAMELESS2 MASTER SOURCE CONTRACT

This runtime is derived from the uploaded project specification set. The specification remains authoritative for story, reveal order, chapter content, historical presentation, and authored pacing. The master runtime only turns repeated rules into reusable code.

## Authority

1. `00_MASTER_CUESHEET-1.md` fixes story/reveal order and the CH1-10 macro cue sequence.
2. `01_CORE_SYSTEM.md` contains the index plus PLAYER / CONTROL / CAMERA / INTERACTION.
3. `02_DIALOGUE_NPC.md` contains DIALOGUE / NPC CORE / NPC MOVEMENT / NPC GESTURE / NPC BLOCKING.
4. `03_ANIMATION_CINEMATIC.md` contains ANIMATION CORE / OBJECT ANIMATION / CINEMATIC SEQUENCE.
5. `04_DOCUMENT_OBJECTS.md` contains DOCUMENT / STAMP / OBJECTS.
6. `05_FACILITY_SPACE.md` contains FACILITY ARCHITECTURE / SPATIAL LAYOUT / COLLISION & CLEARANCE / FACILITY PROGRESS.
7. `06_LIGHTING_AUDIO_VISUAL_UI_TRANSITION.md` contains LIGHTING / AUDIO / VISUAL STYLE / UI / TRANSITION.
8. `07_SAVE_PACING_MOBILE_PERFORMANCE_SPOILER.md` contains SAVE & RESUME / TIMING & PACING / MOBILE / PERFORMANCE / SPOILER RULES.
9. `08_HISTORICAL_PRESENTATION.md` contains HISTORICAL PRESENTATION.

The source index names `31_FAILURE_PREVENTION.md` and `32_COMMON_QA.md`, but their bodies were not present in the uploaded nine-file set. This master source therefore does not invent rules that would belong uniquely to those missing documents.

## Runtime mapping

| Specification | Master implementation |
| --- | --- |
| 01 PLAYER | `src/player/PlayerController.js`, `src/constants.js` |
| 02 CONTROL | `src/input/InputRouter.js`, desktop/mobile adapters |
| 03 CAMERA | `src/camera/CameraRig.js` |
| 04 INTERACTION | `src/interaction/InteractionSystem.js`, ownership/reservation/lock core |
| 05 DIALOGUE | `src/dialogue/DialogueSystem.js` |
| 06 NPC CORE | `src/npc/NPCSystem.js` |
| 07 NPC MOVEMENT | `NPCSystem.moveToAnchor`, `AnchorRegistry`, ownership |
| 08 NPC GESTURE | chapter-authored animation hooks; master ownership/tween services |
| 09 NPC BLOCKING | `AnchorRegistry`, `FacilitySystem`, `CollisionSystem` |
| 10 ANIMATION CORE | `SequenceRunner`, `TweenService`, `RuntimeClock`, `MarkerLedger` |
| 11 OBJECT ANIMATION | `ObjectRegistry`, `SequenceRunner`, chapter-authored hooks |
| 12 CINEMATIC SEQUENCE | `CinematicSystem` |
| 13 DOCUMENT | `DocumentSystem` |
| 14 STAMP | `StampSystem` |
| 15 OBJECTS | `ObjectRegistry`, `AssetManager` |
| 16 FACILITY ARCHITECTURE | `FacilitySystem` |
| 17 SPATIAL LAYOUT | `AnchorRegistry`, facility chapter data |
| 18 COLLISION & CLEARANCE | `CollisionSystem`, reservation/sweep IDs |
| 19 FACILITY PROGRESS | `FacilityProgress` |
| 20 LIGHTING | `LightingSystem` |
| 21 AUDIO | `AudioSystem` |
| 22 VISUAL STYLE | `VisualConfig`, renderer defaults, chapter art data |
| 23 UI | `UISystem` |
| 24 TRANSITION | `TransitionManager` |
| 25 SAVE & RESUME | `SaveManager`, `ChapterRuntime.reconstruct` contract |
| 26 TIMING & PACING | `RuntimeClock`, wall-clock tweens/waits, chapter cue data |
| 27 MOBILE | `MobileControls`, shared `InputRouter` |
| 28 PERFORMANCE | `PerformanceManager`, BVH interaction acceleration, chapter asset scoping |
| 29 SPOILER RULES | `SpoilerGuard` plus build/manual spoiler audits |
| 30 HISTORICAL PRESENTATION | `HistoricalRegistry` |

## Non-negotiable runtime invariants

- Semantic state is authoritative. Exact transient transform/animation time is not saved as story truth.
- Story-critical actions use validate/reserve/ownership/lock/play/verify/commit/release semantics.
- Animation marker and story commit are separate events.
- `STAMP_IMPACT` may create the physical/document mark; chapter progression commits only after verification.
- A raw activation maps to exactly one state-specific gameplay action.
- Player identity and higher spoiler data are accessed only through the active spoiler level.
- Production chapter/save mismatch never silently injects a future save into an earlier chapter HTML.
- Reload reconstructs a canonical endpoint from semantic state/checkpoint.
- The renderer owns one animation loop. Subsystems do not create permanent RAF loops.
- Performance degradation must remove rendering cost before story-critical readability or interaction semantics.
- Chapter content owns puzzle values, dialogue copy, exact coordinates, scene blocking, timings, and historical facts that are not fixed by the common specification.

## Master versus chapter responsibilities

Master source owns reusable behavior and safety contracts. A chapter owns its scene, content records, anchors, documents, NPC authored states, dialogue lines, puzzle proof logic, cinematic beats, reconstruction table, and transition target.

A chapter must not fork or redefine a master subsystem. Fix master source and rebuild chapter HTML instead.
