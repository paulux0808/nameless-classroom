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

    /* 제출된 자료 — 플레이어가 책상에서 열어보는 것들 */
    docs: {
      cardA: {
        title: "계산 카드 A",
        kind: "calculation",
        fields: {
          batch: "C-114", run: "1", transcribedOn: "1943-11-02",
          source: "계산부 원본",
          input: "0.0000", output: "1.4820"
        }
      },
      cardB: {
        title: "계산 카드 B",
        kind: "calculation",
        fields: {
          batch: "C-114", run: "2", transcribedOn: "1943-11-02",
          source: "계산부 원본",
          input: "1.4820", output: "2.9107"
        }
      },
      cardC: {
        /* 여기가 섞인 카드. batch가 다르고 input이 B의 output과 이어지지 않는다. */
        title: "계산 카드 C",
        kind: "calculation",
        fields: {
          batch: "C-109", run: "3", transcribedOn: "1943-11-02",
          source: "수정본(출처 미상)",
          input: "2.9331", output: "5.6042"
        }
      },
      summary: {
        title: "제출 요약서",
        kind: "report",
        fields: {
          batch: "C-114", finalValue: "5.6042",
          submittedOn: "1943-11-03", by: "RICHARD"
        }
      }
    },

    /* 모순 규칙 — 플레이어가 발견해야 하는 것 */
    rules: [
      { id: "chain_bc", kind: "chain",
        from: "cardB.fields.output", to: "cardC.fields.input",
        label: "카드 B의 OUTPUT과 카드 C의 INPUT이 이어지지 않는다",
        detail: "2.9107 로 끝난 계산이 2.9331 에서 다시 시작한다." },
      { id: "batch_c", kind: "mismatch",
        left: "summary.fields.batch", right: "cardC.fields.batch",
        label: "카드 C의 batch가 요약서와 다르다",
        detail: "요약서는 C-114 인데 카드 C만 C-109 다." },
      { id: "source_c", kind: "mismatch",
        left: "cardA.fields.source", right: "cardC.fields.source",
        label: "카드 C의 출처가 나머지와 다르다",
        detail: "다른 카드는 계산부 원본, 카드 C만 출처 미상의 수정본이다." }
    ],
    required: ["chain_bc", "batch_c", "source_c"],

    /* Richard가 다시 돌려온 수정본 — 모든 모순이 해소돼야 한다 */
    revisedDocs: {
      cardC: {
        title: "계산 카드 C (재계산)",
        kind: "calculation",
        fields: {
          batch: "C-114", run: "3", transcribedOn: "1943-11-05",
          source: "계산부 원본",
          input: "2.9107", output: "5.5619"
        }
      },
      summary: {
        title: "제출 요약서 (수정)",
        kind: "report",
        fields: {
          batch: "C-114", finalValue: "5.5619",
          submittedOn: "1943-11-05", by: "RICHARD"
        }
      }
    },

    /* 대사 — 큐시트 §4 그대로 */
    lines: {
      submission: ["박사님.", "계산부에서 첫 결과가 나왔습니다.", "한 번 확인해 주시죠."],
      probing:    ["그쪽입니까?", "계산은 두 번 돌렸습니다."],
      conceded:   ["……잠깐.", "이 값은 여기서 나온 게 아니군요.", "전사 과정에서 섞였습니다."],
      rejected:   ["알겠습니다.", "처음부터 다시 돌리겠습니다."],
      revised:    ["다시 돌렸습니다.", "이번에는 전부 연결됩니다."],
      approved:   ["감사합니다, 박사님.",
                   "앞으로 박사님 책상에 오기 전에는 한 번 더 의심해 보겠습니다."]
    },

    /* 씬 배치 — 실제 모델을 쓴다. 도형으로 만들지 않는다. */
    models: [
      { id: "desk",  path: "metal_office_desk/metal_office_desk.gltf",
        pos: [0, 0, 0.5],       rot: [0, Math.PI, 0],        scale: 1.15 },
      { id: "chair", path: "WoodenChair_01/WoodenChair_01.gltf",
        pos: [0, 0, -0.2],      rot: [0, 0, 0],              scale: 1.1 },
      { id: "lamp",  path: "desk_lamp_arm_01/desk_lamp_arm_01.gltf",
        pos: [-0.65, 0.86, 0.45], rot: [0, Math.PI * 0.4, 0], scale: 1.0 },
      { id: "board", path: "standing_chalkboard_01/standing_chalkboard_01.gltf",
        pos: [-2.8, 0, -1.8],   rot: [0, Math.PI * 0.28, 0], scale: 1.0 },
      { id: "shelf", path: "wooden_bookshelf_worn/wooden_bookshelf_worn.gltf",
        pos: [-2.6, 0, 4.2],    rot: [0, Math.PI, 0],        scale: 1.0 },
      { id: "radio", path: "vintage_radio_transceiver/vintage_radio_transceiver.gltf",
        pos: [3.2, 0.85, 2.0],  rot: [0, -Math.PI * 0.35, 0], scale: 1.0 }
    ],

    /* 책상 위 상호작용 지점 */
    anchors: {
      incomingSlot: [0.42, 0.78, 0.02],
      stampPad:     [-0.34, 0.78, 0.10],
      npcStand:     [0.0, 0, -1.15]
    },

    nextChapter: "ch02"
  };
});
