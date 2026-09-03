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
      batch: "묶음", run: "회차", transcribedOn: "전사일", source: "출처",
      input: "INPUT", output: "OUTPUT",
      finalValue: "최종값", submittedOn: "제출일", by: "제출자"
    },

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
    /* 배율이 아니라 실치수(m)를 적는다. 엔진이 바운딩박스를 재서 맞추므로
       에셋을 다른 모델로 바꿔 끼워도 배치가 무너지지 않는다.
       ※ 아래는 stage1의 교실 소품을 임시로 돌려 쓰는 중이다.
          1943년 연구시설 에셋으로 교체 예정 — docs/ASSETS.md 참고. */
    models: [
      { id: "desk",  path: "metal_office_desk/metal_office_desk.gltf",
        pos: [0, 0, 0.5],      rot: [0, Math.PI, 0],         fitHeight: 0.76 },
      { id: "chair", path: "WoodenChair_01/WoodenChair_01.gltf",
        pos: [0, 0, -0.45],    rot: [0, 0, 0],               fitHeight: 0.95 },
      { id: "lamp",  path: "desk_lamp_arm_01/desk_lamp_arm_01.gltf",
        pos: [-0.62, 0.76, 0.42], rot: [0, Math.PI * 0.4, 0], fitHeight: 0.44 },
      { id: "board", path: "standing_chalkboard_01/standing_chalkboard_01.gltf",
        pos: [-2.6, 0, -1.9],  rot: [0, Math.PI * 0.28, 0],  fitHeight: 1.65 },
      { id: "shelf", path: "wooden_bookshelf_worn/wooden_bookshelf_worn.gltf",
        pos: [-2.7, 0, 3.6],   rot: [0, Math.PI, 0],         fitHeight: 1.85 },
      { id: "radio", path: "vintage_radio_transceiver/vintage_radio_transceiver.gltf",
        pos: [2.9, 0.76, 1.6], rot: [0, -Math.PI * 0.35, 0], fitHeight: 0.30 }
    ],

    /* 책상 위 상호작용 지점 */
    anchors: {
      incomingSlot: [0.40, 0.80, 0.28],
      stampPad:     [-0.34, 0.80, 0.30],
      npcStand:     [0.0, 0, -0.9]
    },

    nextChapter: "ch02"
  };
});
