/* ============================================================================
   CH01 — RICHARD / 계산 사슬

   큐시트 §4 [CH1-01]~[CH1-07].

   RICHARD 가 같은 계산을 세 번 돌린 시험 보고서를 들고 온다. 세 번 다 같은
   값이 나왔으니 문제가 없다는 것이 그의 주장이다. 그러나 세 장 중 한 장만
   두 군데에서 다른 말을 한다 — 같은 시험이라고 적어 놓고 같은 시험이 아니다.

   설계 원칙(04_DOCUMENT_OBJECTS §11 정답 색칠 금지, §34 False Lead):
   문단은 셋 다 표현이 다르다. 착수 시각도, 정전 시각도, 서명 형식도 다르다.
   그러나 그것들은 회차가 다르니 당연히 다른 것이다. 뜻이 갈리는 곳은
   value 로 못 박은 두 곳뿐이고, 그 둘만이 문제다.
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

    /* ── 짚어야 할 진술 ────────────────────────────────────────────────── */
    claims: [
      { id: "std",
        label: "기준표 개정",
        question: "어느 기준표를 놓고 돌렸는가",
        wrong: "2차만 개정 B 로 돌렸다고 한다. 1차와 3차는 개정 A 다.",
        ok:    "세 장 모두 개정 A 를 놓고 돌렸다고 한다." },
      { id: "redo",
        label: "정전 뒤 처리",
        question: "전원이 끊긴 뒤 어디서부터 이었는가",
        wrong: "2차만 끊긴 자리에서 이어 돌렸다고 한다. 1차와 3차는 처음부터 다시 돌렸다.",
        ok:    "세 장 모두 처음부터 다시 돌렸다고 한다." }
    ],
    required: ["std", "redo"],

    /* 어긋난 장. 감사에서 실제 value 와 대조한다 — 손으로 적은 답이 아니라
       데이터가 실제로 그렇게 되어 있는지 켜지기 전에 확인한다. */
    oddReport: "r2",

    /* ── 원본 보고서 ─────────────────────────────────────────────────────
       value 가 붙은 문단만이 뜻을 갖는다. 나머지는 표현과 숫자가 다르되
       회차가 다르니 다른 것이 맞다. */
    reports: [
      {
        id: "r1", no: "1차",
        title: "적분 검산 시험 · 1차",
        head: "묶음 C-114 · 1943년 11월 2일 · 계산부 3호기",
        body: [
          { id: "r1_scope",
            text: "계산부 3호기로 적분 검산을 돌렸다. 투입값은 0.0000 이고, " +
                  "세 단계를 거쳐 최종 2.9107 을 얻었다. 자릿수는 소수 넷째 자리까지 " +
                  "남겼다." },
          { id: "r1_time",
            text: "09시 20분에 착수해 11시 05분에 끝냈다. 기계를 붙잡고 있던 시간은 " +
                  "1시간 45분이다." },
          { id: "r1_std", claim: "std", value: "개정 A",
            text: "기준표는 계산부가 배포한 개정 A 를 놓고 돌렸다. 배포일은 11월 1일, " +
                  "판형은 접지 4면짜리였다." },
          { id: "r1_power",
            text: "10시 12분에 배전 계통이 한 번 끊겼다. 복구까지 3분쯤 걸렸다고 들었다." },
          { id: "r1_redo", claim: "redo", value: "처음부터",
            text: "끊긴 동안의 중간값을 믿을 수 없어 처음부터 다시 돌렸다. 그래서 " +
                  "종료가 그만큼 늦어졌다." },
          { id: "r1_sign",
            text: "검산 결과에 이상은 없었다. 계산부 RICHARD." }
        ]
      },
      {
        id: "r2", no: "2차",
        title: "적분 검산 시험 · 2차",
        head: "묶음 C-114 · 1943년 11월 3일 · 계산부 3호기",
        body: [
          { id: "r2_scope",
            text: "1차와 같은 조건으로 3호기에서 적분 검산을 되풀이했다. 0.0000 에서 " +
                  "출발해 3단을 지나 2.9107 이 나왔다. 넷째 자리까지 적었다." },
          { id: "r2_time",
            text: "착수는 09시 40분, 종료는 11시 25분이었다. 기계에 매달린 시간은 " +
                  "1시간 45분으로 1차와 같다." },
          { id: "r2_std", claim: "std", value: "개정 B",
            text: "기준표는 계산부가 배포한 개정 B 를 놓고 돌렸다. 배포일은 11월 1일, " +
                  "접지 4면짜리 판형이다." },
          { id: "r2_power",
            text: "10시 31분에 배전 계통이 한 번 끊겼다. 복구에 3분 남짓 걸렸다." },
          { id: "r2_redo", claim: "redo", value: "이어서",
            text: "끊긴 자리의 중간값이 종이에 남아 있어 거기서부터 이어 돌렸다. " +
                  "덕분에 시간을 아꼈다." },
          { id: "r2_sign",
            text: "검산 결과에 이상은 없었다. RICHARD, 계산부." }
        ]
      },
      {
        id: "r3", no: "3차",
        title: "적분 검산 시험 · 3차",
        head: "묶음 C-114 · 1943년 11월 4일 · 계산부 3호기",
        body: [
          { id: "r3_scope",
            text: "조건을 바꾸지 않고 3호기로 적분 검산을 한 번 더 했다. 투입값 0.0000, " +
                  "세 단계, 최종 2.9107. 소수 넷째 자리까지 남겼다." },
          { id: "r3_time",
            text: "13시 10분 착수, 14시 55분 종료. 계산 자체에 든 시간은 105분이었다." },
          { id: "r3_std", claim: "std", value: "개정 A",
            text: "기준표는 계산부 배포본 개정 A 를 놓고 돌렸다. 11월 1일자, " +
                  "접지 네 면짜리다." },
          { id: "r3_power",
            text: "14시 02분에 배전 계통이 한 번 끊겼다. 복구까지 3분이 걸렸다." },
          { id: "r3_redo", claim: "redo", value: "처음부터",
            text: "끊긴 동안의 중간값을 신뢰할 수 없어 처음부터 다시 돌렸다. " +
                  "그만큼 종료가 밀렸다." },
          { id: "r3_sign",
            text: "검산 결과에 이상은 없었다. 서명 RICHARD (계산부)." }
        ]
      }
    ],

    /* ── 수정본 ──────────────────────────────────────────────────────────
       세 번을 같은 조건으로 다시 돌렸다. 이제 두 자리가 같은 말을 한다.
       나머지 문단은 여전히 회차마다 다르다 — 그게 정상이기 때문이다. */
    revisedReports: [
      {
        id: "r1", no: "1차",
        title: "적분 검산 시험 · 1차 (재시험)",
        head: "묶음 C-114R · 1943년 11월 6일 · 계산부 3호기",
        body: [
          { id: "r1_scope",
            text: "계산부 3호기로 적분 검산을 다시 돌렸다. 투입값 0.0000, 세 단계, " +
                  "최종 2.9107. 소수 넷째 자리까지 남겼다." },
          { id: "r1_time",
            text: "08시 05분 착수, 09시 50분 종료. 기계를 붙잡고 있던 시간은 " +
                  "1시간 45분이다." },
          { id: "r1_std", claim: "std", value: "개정 A",
            text: "기준표는 개정 A 를 놓고 돌렸다. 세 회차 모두 같은 표를 썼다." },
          { id: "r1_power",
            text: "이번 회차에서는 배전이 끊기지 않았다." },
          { id: "r1_redo", claim: "redo", value: "처음부터",
            text: "중단이 없었으므로 처음부터 끝까지 한 번에 돌렸다. 중간값을 이어 쓴 " +
                  "구간은 없다." },
          { id: "r1_sign",
            text: "재시험 결과에 이상은 없었다. 계산부 RICHARD." }
        ]
      },
      {
        id: "r2", no: "2차",
        title: "적분 검산 시험 · 2차 (재시험)",
        head: "묶음 C-114R · 1943년 11월 6일 · 계산부 3호기",
        body: [
          { id: "r2_scope",
            text: "같은 조건으로 3호기에서 되풀이했다. 0.0000 에서 출발해 3단을 지나 " +
                  "2.9107 이 나왔다. 넷째 자리까지 적었다." },
          { id: "r2_time",
            text: "착수 10시 20분, 종료 12시 05분. 기계에 매달린 시간은 1시간 45분이다." },
          { id: "r2_std", claim: "std", value: "개정 A",
            text: "기준표는 개정 A 를 놓고 돌렸다. 개정 B 는 이번에 쓰지 않았다." },
          { id: "r2_power",
            text: "11시 14분에 배전이 한 번 끊겼다. 복구에 3분 남짓 걸렸다." },
          { id: "r2_redo", claim: "redo", value: "처음부터",
            text: "끊긴 동안의 중간값은 버리고 처음부터 다시 돌렸다. 이어 쓴 구간은 없다." },
          { id: "r2_sign",
            text: "재시험 결과에 이상은 없었다. RICHARD, 계산부." }
        ]
      },
      {
        id: "r3", no: "3차",
        title: "적분 검산 시험 · 3차 (재시험)",
        head: "묶음 C-114R · 1943년 11월 7일 · 계산부 3호기",
        body: [
          { id: "r3_scope",
            text: "조건을 바꾸지 않고 한 번 더 했다. 투입값 0.0000, 세 단계, " +
                  "최종 2.9107. 소수 넷째 자리까지." },
          { id: "r3_time",
            text: "09시 00분 착수, 10시 45분 종료. 계산 자체에 든 시간은 105분이었다." },
          { id: "r3_std", claim: "std", value: "개정 A",
            text: "기준표는 계산부 배포본 개정 A 다. 앞의 두 회차와 같은 판형이다." },
          { id: "r3_power",
            text: "이번 회차에서는 배전이 끊기지 않았다." },
          { id: "r3_redo", claim: "redo", value: "처음부터",
            text: "중단이 없었으므로 처음부터 끝까지 한 번에 돌렸다." },
          { id: "r3_sign",
            text: "재시험 결과에 이상은 없었다. 서명 RICHARD (계산부)." }
        ]
      }
    ],

    /* 둘씩 맞대어 볼 수 있는 짝 */
    comparePairs: [["r1", "r2"], ["r2", "r3"], ["r1", "r3"]],

    /* ── 대사 ─────────────────────────────────────────────────────────── */
    lines: {
      /* 문을 열고 들어와 책상 앞까지 걸어온 뒤 */
      submission: [
        "박사님. 계산부 RICHARD 입니다.",
        "적분 검산 결과가 나왔습니다. 올려도 되겠습니까.",
        "같은 계산을 세 번 돌렸습니다. 같은 기계, 같은 투입값, 같은 절차로요.",
        "1차는 이틀 전 오전에, 2차는 그 다음 날 오전에, 3차는 어제 오후에 돌렸습니다.",
        "세 번 다 2.9107 이 나왔습니다. 자릿수까지 똑같습니다.",
        "그러니 이 값은 믿어도 됩니다. 그래서 올립니다.",
        "보고서는 회차마다 한 장씩, 세 장입니다.",
        "책상에 올려 두었습니다. 확인해 주시죠."
      ],
      /* 조사 중에 말을 걸면 */
      probing: [
        "그쪽 말씀입니까?",
        "세 번 다 같은 값이 나왔습니다. 숫자는 제가 두 번 확인했습니다.",
        "장마다 시각이 다른 건 회차가 다르니 그런 겁니다."
      ],
      /* 어긋난 한 장을 짚었지만 아직 리처드에게 말을 걸지 않았을 때 */
      picked: [
        "2차 말입니까.",
        "……어디가 문제라는 말씀인지 짚어 주시면 보겠습니다."
      ],
      /* 어긋난 한 장을 짚은 뒤 말을 걸면 — 세 장을 동시에 펼친다 */
      confront: [
        "……2차를 짚으셨군요.",
        "숫자는 셋 다 같은데 말입니다.",
        "좋습니다. 세 장을 나란히 놓겠습니다.",
        "1차, 2차, 3차. 어디가 어긋났는지 짚어 주십시오.",
        "한 장만 짚어서는 안 됩니다. 세 장 모두에서 같은 자리를 짚어 주셔야 " +
        "제가 무슨 말인지 압니다."
      ],
      /* 근거 여섯 곳을 다 찍은 뒤 */
      conceded: [
        "……잠깐.",
        "기준표가 다릅니다. 2차만 개정 B 입니다.",
        "그리고 정전 뒤 처리도 저 혼자 다르게 적었군요.",
        "같은 시험이라고 적어 놓고 같은 시험이 아니었습니다.",
        "값이 같게 나온 건 우연이었을 수도 있다는 뜻이군요.",
        "다시 돌리고 오겠습니다."
      ],
      /* 반려 도장을 찍은 직후, 나가기 전에 */
      rejected: [
        "반려. 알겠습니다.",
        "세 번 다 개정 A 로, 정전이 나면 처음부터. 그렇게 다시 돌리겠습니다.",
        "금방 다녀오겠습니다."
      ],
      /* 문 밖으로 나갔다가 돌아와서 */
      revised: [
        "다시 돌렸습니다, 박사님.",
        "세 번 다 개정 A 로, 정전 뒤에는 처음부터 다시 돌렸습니다.",
        "이번에는 세 장이 같은 말을 합니다.",
        "두 자리를 세 장에 맞대어 확인해 주십시오."
      ],
      approved: [
        "죄송합니다, 박사님.",
        "숫자가 맞으면 된 줄 알았습니다.",
        "세 번 돌렸다는 말과 세 번 같은 조건으로 돌렸다는 말이 다르다는 걸 " +
        "생각하지 못했습니다.",
        "앞으로는 박사님 책상에 오기 전에 세 장이 같은 말을 하는지 먼저 보겠습니다.",
        "가 보겠습니다. 문은 열어 두겠습니다."
      ],
      /* 챕터가 끝난 뒤 다시 말을 걸면 */
      done: [
        "고생하셨습니다, 박사님.",
        "문은 열어 두었습니다."
      ]
    },

    /* ── 씬 ───────────────────────────────────────────────────────────── */
    room: { W: 5.4, D: 6.6, H: 2.9 },

    /* 문 — RICHARD 가 드나드는 곳이자 플레이어가 나가는 곳.
       pos 는 벽에 뚫린 자리(문틀 중심), z 는 +z 벽 안쪽이다. */
    door: { pos: [-1.5, 0, 3.3], width: 1.05, height: 2.12 },

    /* NPC 이동 경로. 문 안쪽에서 책상 건너편까지. */
    npcPath: {
      doorway: [-1.5, 0, 3.05],
      stand:   [0.12, 0, -0.62]
    },

    /* 배율이 아니라 실치수(m). 표면 위 물건은 restOn 으로 올린다 —
       높이를 손으로 적으면 모델을 바꿀 때마다 뜨거나 잠긴다.
       shelfOf 는 선반 안쪽 칸 — 엔진이 받침 모델을 실측해 칸을 나눈다.
       solid 는 통과 금지. ※ 아직 stage1 의 소품을 돌려 쓰는 중이다. */
    models: [
      { id: "desk",   path: "metal_office_desk/metal_office_desk.gltf",
        pos: [0, 0, 0.5],       rot: [0, Math.PI, 0],        fitHeight: 0.76,
        solid: true },
      /* 원본 의자는 등받이가 유난히 길고(0.69 x 2.27) 장식이 많다. 전체 높이로
         맞추면 앉는 자리가 30cm 로 쪼그라들고, 책상 앞에 두면 등받이가 상판을
         통째로 가린다. 폭으로 맞춰 뒤쪽 구석에 세워 둔다.
         ※ 사무용 의자를 구하면 책상 앞으로 되돌린다 — docs/ASSETS.md 참고. */
      { id: "chair",  path: "WoodenChair_01/WoodenChair_01.gltf",
        pos: [-2.02, 0, -2.28], rot: [0, Math.PI * 0.72, 0], fitWidth: 0.46,
        solid: true },
      /* 램프는 책상 오른쪽 안쪽. 상판은 z 0.05~0.95 안에서만 물건을 받는다 —
         그 밖에 두면 허공에 뜬다. 도장 자리(왼쪽 앞)와도 떨어뜨린다. */
      { id: "lamp",   path: "desk_lamp_arm_01/desk_lamp_arm_01.gltf",
        pos: [0.58, 0, 0.22],   rot: [0, -Math.PI * 0.32, 0], fitHeight: 0.44,
        restOn: "desk" },
      { id: "board",  path: "standing_chalkboard_01/standing_chalkboard_01.gltf",
        pos: [-0.95, 0, -2.45], rot: [0, Math.PI * 0.13, 0], fitHeight: 1.62,
        solid: true },
      { id: "shelf",  path: "wooden_bookshelf_worn/wooden_bookshelf_worn.gltf",
        pos: [1.95, 0, -2.55],  rot: [0, 0, 0],              fitHeight: 1.82,
        solid: true },
      { id: "cabinet", path: "metal_tool_chest/metal_tool_chest.gltf",
        pos: [-2.28, 0, -0.60], rot: [0, Math.PI * 0.5, 0],  fitHeight: 0.92,
        solid: true },
      /* 납작한 손가방형 케이스. 높이로 맞추면 1m 짜리가 된다 */
      { id: "medkit", path: "medical_box/medical_box.gltf",
        pos: [-2.28, 0, -0.60], rot: [0, Math.PI * 0.5, 0],  fitWidth: 0.42,
        restOn: "cabinet" },
      /* 원본 궤짝은 납작하다(0.83 x 0.35 x 0.41). 높이로 맞추면 폭이 1.2m 를
         넘어 방을 가로막는다 — 폭 기준으로 맞춘다. */
      { id: "crateA", path: "wooden_crate_01/wooden_crate_01.gltf",
        pos: [2.02, 0, 2.30],   rot: [0, 0.35, 0],           fitWidth: 0.78,
        solid: true },
      { id: "crateB", path: "wooden_crate_01/wooden_crate_01.gltf",
        pos: [1.98, 0, 2.26],   rot: [0, -0.22, 0],          fitWidth: 0.62,
        restOn: "crateA" },
      { id: "radio",  path: "vintage_radio_transceiver/vintage_radio_transceiver.gltf",
        pos: [1.98, 0, 2.26],   rot: [0, -Math.PI * 0.62, 0], fitWidth: 0.42,
        restOn: "crateB" },
      /* 이 gltf 는 멀쩡한 통과 녹슨 통을 나란히 담고 있다. 녹슨 쪽을
         걷어내지 않으면 폭이 두 배가 되어 의자를 파고든다. */
      { id: "bin",    path: "trashcan/metal_trash_can.gltf",
        pos: [-2.10, 0, 1.62],  rot: [0, 0.6, 0],            fitHeight: 0.62,
        hide: ["_rust"] },
      /* 책은 선반 칸 위에 앉힌다. 칸 번호는 위에서부터 0. 엔진이 받침을
         실측해 나누므로 선반 모델을 바꿔도 책이 뜨지 않는다. */
      { id: "books1", path: "books/book_encyclopedia_set_01.gltf",
        pos: [-0.20, 0, -0.02], rot: [0, 0, 0],    fitWidth: 0.42, shelfOf: "shelf", shelf: 1 },
      { id: "books2", path: "books/book_encyclopedia_set_01.gltf",
        pos: [0.22, 0, -0.02],  rot: [0, 0.10, 0], fitWidth: 0.34, shelfOf: "shelf", shelf: 1 },
      { id: "books3", path: "books/book_encyclopedia_set_01.gltf",
        pos: [-0.17, 0, -0.02], rot: [0, -0.07, 0], fitWidth: 0.44, shelfOf: "shelf", shelf: 2 },
      { id: "books4", path: "books/book_encyclopedia_set_01.gltf",
        pos: [0.24, 0, -0.02],  rot: [0, 0.16, 0], fitWidth: 0.32, shelfOf: "shelf", shelf: 3 },
      { id: "clock",  path: "mantel_clock_01/mantel_clock_01.gltf",
        pos: [1.95, 0, -2.55],  rot: [0, 0, 0],              fitHeight: 0.24,
        restOn: "shelf" },
      { id: "sconceL", path: "industrial_wall_lamp/industrial_wall_lamp.gltf",
        pos: [-2.66, 2.05, -0.6], rot: [0, Math.PI * 0.5, 0], fitHeight: 0.30, align: "none" },
      { id: "sconceR", path: "industrial_wall_lamp/industrial_wall_lamp.gltf",
        pos: [2.66, 2.05, 0.4],   rot: [0, -Math.PI * 0.5, 0], fitHeight: 0.30, align: "none" }
    ],

    npcModel: {
      path: "teacher/teacher.glb",
      /* 리깅 모델이라 fitHeight 가 아니라 배율을 직접 준다.
         ※ teacher.glb 는 stage1 에서 가져온 임시 배우다 — docs/ASSETS.md 참고. */
      scale: 1.0, align: "none",
      clips: { idle: "Rig|idle", talk: "Rig|cycle_talking", walk: "Rig|walk" }
    },

    /* 책상 위 자리. y 는 엔진이 책상 상판을 실측해 덮어쓴다. */
    anchors: {
      /* 보고서 세 장이 놓이는 자리 — 책상 오른쪽 앞 */
      reportSlot: [0.30, 0.775, 0.32],
      /* 도장과 잉크패드 — 책상 왼쪽 앞 */
      stampPad:   [-0.62, 0.775, 0.38]
    },

    /* 바닥에도 세 장을 깔아 둔다 — 책상에서 밀려난 것들 */
    floorReports: [
      { pos: [-0.62, 0, 1.05], rot: 0.22 },
      { pos: [-0.24, 0, 1.24], rot: -0.34 },
      { pos: [ 0.20, 0, 1.12], rot: 0.11 }
    ],

    nextChapter: "ch02"
  };
});
