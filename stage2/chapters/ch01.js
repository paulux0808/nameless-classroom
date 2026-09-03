/* ============================================================================
   CH01 — RICHARD / CALCULATION CHAIN

   큐시트 §4 [CH1-01]~[CH1-07] 을 데이터로 옮긴 것.
   엔진은 이 데이터를 해석만 한다. 규칙·좌표·대사는 전부 여기 있다.

   퍼즐: 계산 카드의 OUTPUT 이 다음 카드의 INPUT 으로 이어져야 한다.
   숫자 자체는 그럴듯하지만, 전사(轉寫) 과정에서 다른 계산본이 섞였다.
   ========================================================================== */
(function (root, factory) {
  var api = factory();
  if (typeof module === "object" && module.exports) module.exports = api;
  if (root) { root.N2_CHAPTERS = root.N2_CHAPTERS || {}; root.N2_CHAPTERS.ch01 = api; }
})(typeof globalThis !== "undefined" ? globalThis : this, function () {
  "use strict";

  return {
    id: "ch01",
    number: 1,
    npc: "RICHARD",
    title: "계산 사슬",
    subtitle: "첫 번째 반려",

    /* 필드 표시 이름. 화면에는 이 이름이 나간다. */
    labels: {
      batch: "묶음", run: "회차", issuedOn: "산출일", transcribedOn: "전사일",
      input: "INPUT", output: "OUTPUT",
      finalValue: "최종값", submittedOn: "제출일", by: "제출자",
      revision: "개정", issued: "배포일"
    },

    /* 제출된 자료 — 플레이어가 책상에서 열어보는 것들.

       설계 원칙(04_DOCUMENT_OBJECTS §11 정답 색칠 금지, §34 False Lead):
       한눈에 튀는 라벨로 답을 알려주지 않는다. 이전 판은 카드 하나만
       "수정본(출처 미상)" 이라 적혀 있어 읽지 않아도 답이 보였다.
       지금은 값 자체를 따라가야 어긋난 곳이 나온다.

       심어 둔 것 세 가지. 셋 다 값을 따라가야 나온다:
       1) 전사 오류 — 2.9107 이 2.9170 으로 자릿수가 뒤바뀌었다
       2) 개정 불일치 — 요약서는 개정 B 를 근거로 했는데 기록부는 A 만 냈다
       3) 시간 역전 — 산출되기 전날 전사된 카드가 있다  */
    docs: {
      card01: {
        title: "계산 카드 01",
        kind: "calculation",
        fields: {
          batch: "C-114", run: "1",
          issuedOn: "1943-11-01", transcribedOn: "1943-11-02",
          input: "0.0000", output: "1.4820"
        }
      },
      card02: {
        title: "계산 카드 02",
        kind: "calculation",
        fields: {
          batch: "C-114", run: "2",
          issuedOn: "1943-11-02", transcribedOn: "1943-11-02",
          input: "1.4820", output: "2.9107"
        }
      },
      card04: {
        /* 전사 과정에서 2.9107 → 2.9170 으로 자리가 뒤바뀌었다.
           숫자만 보면 그럴듯하다. 앞 카드와 맞대야 드러난다.
           그리고 산출 하루 전에 전사된 것으로 적혀 있다. */
        title: "계산 카드 04",
        kind: "calculation",
        fields: {
          batch: "C-114", run: "4",
          issuedOn: "1943-11-04", transcribedOn: "1943-11-03",
          input: "2.9170", output: "5.6042"
        }
      },
      log: {
        title: "전사 기록부",
        kind: "log",
        fields: {
          batch: "C-114", revision: "A", issued: "1943-11-04",
          by: "계산부"
        }
      },
      summary: {
        /* 기록부는 개정 A 만 냈는데 요약서는 B 를 근거로 적혀 있다.
           두 문서를 맞대야 나온다. */
        title: "제출 요약서",
        kind: "report",
        fields: {
          batch: "C-114", revision: "B", finalValue: "5.6042",
          submittedOn: "1943-11-05", by: "RICHARD"
        }
      }
    },

    /* 모순 규칙 — 플레이어가 발견해야 하는 것 */
    rules: [
      { id: "chain_break", kind: "chain",
        from: "card02.fields.output", to: "card04.fields.input",
        label: "앞 카드의 OUTPUT과 다음 카드의 INPUT이 이어지지 않는다",
        detail: "2.9107 로 끝난 계산이 2.9170 에서 다시 시작한다. 자릿수가 뒤바뀌었다.",
        ok: "앞 카드의 OUTPUT에서 다음 카드의 INPUT으로 이어진다" },
      { id: "revision_gap", kind: "mismatch",
        left: "log.fields.revision", right: "summary.fields.revision",
        label: "요약서가 근거로 삼은 개정이 기록부에 없다",
        detail: "기록부가 낸 것은 개정 A 뿐인데 요약서는 개정 B 를 적었다.",
        ok: "요약서의 개정이 기록부에 있다" },
      { id: "time_reversed", kind: "superseded",
        usedAt: "card04.fields.transcribedOn", replacedAt: "card04.fields.issuedOn",
        label: "산출되기 전에 전사된 카드가 있다",
        detail: "11-03 에 전사했다는 카드의 산출일이 11-04 다. 순서가 뒤집혔다.",
        ok: "산출한 뒤에 전사한 것으로 바로잡혔다" }
    ],
    required: ["chain_break", "revision_gap", "time_reversed"],

    /* RICHARD 가 다시 돌려온 수정본 — 모든 모순이 해소돼야 한다.
       누락된 3회차가 채워지고, 사슬이 이어지고, 날짜 순서가 바로잡힌다. */
    revisedDocs: {
      card03: {
        title: "계산 카드 03 (재계산)",
        kind: "calculation",
        fields: {
          batch: "C-114", run: "3",
          issuedOn: "1943-11-06", transcribedOn: "1943-11-06",
          input: "2.9107", output: "4.1338"
        }
      },
      card04: {
        title: "계산 카드 04 (재계산)",
        kind: "calculation",
        fields: {
          batch: "C-114", run: "4",
          issuedOn: "1943-11-06", transcribedOn: "1943-11-07",
          input: "2.9107", output: "5.5619"
        }
      },
      log: {
        title: "전사 기록부 (개정)",
        kind: "log",
        fields: {
          batch: "C-114", revision: "B", issued: "1943-11-06",
          by: "계산부"
        }
      },
      summary: {
        title: "제출 요약서 (수정)",
        kind: "report",
        fields: {
          batch: "C-114", revision: "B", finalValue: "5.5619",
          submittedOn: "1943-11-07", by: "RICHARD"
        }
      }
    },

    /* 대사 — 큐시트 §4 [CH1-01]~[CH1-07] 그대로 */
    lines: {
      submission: ["박사님.", "계산부에서 첫 결과가 나왔습니다.", "한 번 확인해 주시죠."],
      probing:    ["그쪽입니까?", "계산은 두 번 돌렸습니다."],
      conceded:   ["……잠깐.", "이 값은 여기서 나온 게 아니군요.", "전사 과정에서 섞였습니다."],
      rejected:   ["알겠습니다.", "처음부터 다시 돌리겠습니다."],
      revised:    ["다시 돌렸습니다.", "빠진 회차까지 채웠습니다.", "이번에는 전부 연결됩니다."],
      approved:   ["감사합니다, 박사님.",
                   "앞으로 박사님 책상에 오기 전에는 한 번 더 의심해 보겠습니다."]
    },

    /* 방 안 소품. 배율이 아니라 실치수(m)를 적는다 — 엔진이 바운딩박스를
       재서 맞추므로 에셋을 바꿔 끼워도 배치가 무너지지 않는다.
       ※ 아직 stage1 의 교실 소품을 돌려 쓰는 중이다. 1943년 연구시설
          에셋으로 교체 예정 — docs/ASSETS.md 참고. */
    models: [
      { id: "desk",   path: "metal_office_desk/metal_office_desk.gltf",
        pos: [0, 0, 0.5],       rot: [0, Math.PI, 0],          fitHeight: 0.76 },
      { id: "chair",  path: "WoodenChair_01/WoodenChair_01.gltf",
        pos: [0.05, 0, 1.35],   rot: [0, Math.PI, 0],          fitHeight: 0.95 },
      { id: "lamp",   path: "desk_lamp_arm_01/desk_lamp_arm_01.gltf",
        pos: [-0.72, 0.76, 0.30], rot: [0, Math.PI * 0.42, 0], fitHeight: 0.42 },
      { id: "board",  path: "standing_chalkboard_01/standing_chalkboard_01.gltf",
        pos: [-1.85, 0, -1.75], rot: [0, Math.PI * 0.22, 0],   fitHeight: 1.62 },
      /* 책장은 정면이 -z 를 보고 있어 그대로 두면 뒷판이 방을 향한다 */
      { id: "shelf",  path: "wooden_bookshelf_worn/wooden_bookshelf_worn.gltf",
        pos: [1.95, 0, -2.55],  rot: [0, 0, 0],                fitHeight: 1.82 },
      { id: "cabinet", path: "metal_tool_chest/metal_tool_chest.gltf",
        pos: [-2.35, 0, 1.35],  rot: [0, Math.PI * 0.5, 0],    fitHeight: 0.92 },
      { id: "crateA", path: "wooden_crate_01/wooden_crate_01.gltf",
        pos: [2.25, 0, 2.35],   rot: [0, 0.4, 0],              fitHeight: 0.52 },
      { id: "crateB", path: "wooden_crate_01/wooden_crate_01.gltf",
        pos: [2.20, 0.52, 2.30], rot: [0, -0.25, 0],           fitHeight: 0.42, align: "none" },
      /* 무전기는 궤짝 위에 올린다. 벽에 띄우면 떠 있는 것으로 보인다 */
      { id: "radio",  path: "vintage_radio_transceiver/vintage_radio_transceiver.gltf",
        pos: [2.20, 0.94, 2.30], rot: [0, -Math.PI * 0.3, 0],  fitHeight: 0.28, align: "none" },
      { id: "clock",  path: "mantel_clock_01/mantel_clock_01.gltf",
        pos: [1.95, 1.82, -2.5], rot: [0, 0, 0],               fitHeight: 0.26, align: "none" },
      { id: "bin",    path: "trashcan/metal_trash_can.gltf",
        pos: [-1.15, 0, 1.55],  rot: [0, 0.6, 0],              fitHeight: 0.44 },
      { id: "medkit", path: "medical_box/medical_box.gltf",
        pos: [-2.30, 0.92, 1.15], rot: [0, Math.PI * 0.5, 0],  fitHeight: 0.20, align: "none" },
      /* 빈 선반은 오히려 더 허해 보인다. 칸마다 채운다. */
      { id: "books1", path: "books/book_encyclopedia_set_01.gltf",
        pos: [1.72, 1.52, -2.52], rot: [0, 0, 0],              fitWidth: 0.42, align: "none" },
      { id: "books2", path: "books/book_encyclopedia_set_01.gltf",
        pos: [2.16, 1.17, -2.52], rot: [0, 0.12, 0],           fitWidth: 0.38, align: "none" },
      { id: "books3", path: "books/book_encyclopedia_set_01.gltf",
        pos: [1.80, 0.82, -2.52], rot: [0, -0.08, 0],          fitWidth: 0.44, align: "none" },
      { id: "books4", path: "books/book_encyclopedia_set_01.gltf",
        pos: [2.10, 0.47, -2.52], rot: [0, 0.2, 0],            fitWidth: 0.36, align: "none" },
      /* 벽등 — 벽면이 통째로 비어 있으면 방이 커 보이기만 한다 */
      { id: "sconceL", path: "industrial_wall_lamp/industrial_wall_lamp.gltf",
        pos: [-2.66, 2.05, -0.6], rot: [0, Math.PI * 0.5, 0],  fitHeight: 0.30, align: "none" },
      { id: "sconceR", path: "industrial_wall_lamp/industrial_wall_lamp.gltf",
        pos: [2.66, 2.05, 0.4],   rot: [0, -Math.PI * 0.5, 0], fitHeight: 0.30, align: "none" }
    ],

    /* RICHARD — 책상 건너편에 서서 결과를 기다린다.
       ※ 임시 배우다. teacher.glb 는 현대 정장이라 1943년 복장이 아니다.
          docs/ASSETS.md 의 NPC 항목 참고. 클립 이름만 맞춰 두면
          모델을 갈아 끼워도 그대로 동작한다. */
    npcModel: {
      path: "teacher/teacher.glb",
      /* 리깅 모델이라 fitHeight 가 아니라 배율을 직접 준다.
         이 모델은 배율 1 에서 대략 사람 키다.
         ※ teacher.glb 는 stage1 에서 가져온 임시 배우다. 서 있는 idle 이
            바인드 포즈에 가까워 팔을 벌린 자세로 보인다. 1940년대 복장의
            제대로 된 캐릭터로 교체하면 해소된다 — docs/ASSETS.md 참고. */
      pos: [0.15, 0, -0.62], rot: [0, Math.PI, 0], scale: 1.0, align: "none",
      clips: { idle: "Rig|idle", talk: "Rig|cycle_talking" }
    },

    /* 책상 위 상호작용 지점 */
    anchors: {
      incomingSlot: [0.40, 0.775, 0.34],
      stampPad:     [-0.40, 0.775, 0.36],
      npcStand:     [0.15, 0, -0.62]
    },

    nextChapter: "ch02"
  };
});
