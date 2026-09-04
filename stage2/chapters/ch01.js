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

    /* ── 세트 ──────────────────────────────────────────────────────────
       한 세트는 세 장이 같은 자리를 두고 적은 문장 셋이다(장마다 하나씩).
       "어느 표를 봤나" 는 한 자리다. C-114 / C-117 / C-114 도 같은
       자리다 — 같은 것을 두고 적었으되 한 장이 어긋나 있을 뿐이다.

       agree=true  세 장이 어긋나지 않는다. 말만 다르게 썼다. 함정이다.
       agree=false 두 장은 맞고 한 장이 어긋난다. odd 가 그 장이다.

       ※ "같은 얘기" 라고 부르지 말 것. 어긋난 자리도 같은 것을 두고
          적은 것이라 말이 꼬인다. 자리 / 어긋난다 로 쓴다. */
    sets: [
      /* ── 어긋나지 않는 자리(함정) 여섯 ────────────────────────────── */
      { id: "machine", label: "쓴 기계", agree: true,
        same: "3호기, 3호기, 세 번째 기계. 다 같은 겁니다." },
      { id: "input", label: "시작한 값", agree: true,
        same: "셋 다 0 에서 시작했습니다." },
      { id: "steps", label: "나눈 횟수", agree: true,
        same: "세 번에 나눠서, 세 단계, 셋. 같은 말입니다." },
      { id: "result", label: "나온 답", agree: true,
        same: "셋 다 2.9107 입니다." },
      { id: "dur", label: "붙잡고 있던 시간", agree: true,
        same: "한 시간 사십오 분이면 105분입니다. 두 시간이 안 걸린 것도 맞고요." },
      { id: "digits", label: "소수점 자리", agree: true,
        same: "네 자리까지 적는 거나, 0.0001 자리까지 적는 거나, 다섯째를 " +
              "버리는 거나 다 같은 말입니다." },

      /* ── 어긋난 자리 여섯 ────────────────────────────────────────── */
      { id: "zero", label: "눈금 맞추기", agree: false, odd: "r1",
        wrong: "1차만 어제 맞춰 둔 걸 그대로 썼다." },
      { id: "std", label: "본 표", agree: false, odd: "r2",
        wrong: "2차만 B 표를 봤다." },
      { id: "deck", label: "카드 뭉치", agree: false, odd: "r3",
        wrong: "3차만 117번 뭉치를 썼다." },
      { id: "redo", label: "전기 나간 뒤", agree: false, odd: "r3",
        wrong: "3차만 끊긴 데부터 이어서 했다." },
      { id: "witness", label: "옆에 있던 사람", agree: false, odd: "r2",
        wrong: "2차만 혼자 하고 혼자 읽었다." },
      /* 두 문장을 붙여 봐야 나머지 하나가 안 맞는다는 게 드러난다.
         1.2 에서 2.6 이면 커진 것이므로 1차와 2차는 맞고, 줄었다고 적은
         3차만 성립할 수 없다. 셋 중 둘만 맞을 수 있다. */
      { id: "ratio", label: "커졌나 줄었나", agree: false, odd: "r3",
        wrong: "1.2 에서 2.6 이면 커진 것이다. 3차만 거꾸로 적었다." }
    ],

    /* 반려 뒤 다시 싣는 것 — 딴소리였던 여섯 자리만 */
    revisedSets: ["zero", "std", "deck", "redo", "witness", "ratio"],

    /* ── 원본 보고서 ─────────────────────────────────────────────────────
       계산 돌리는 사람이 그날그날 적은 작업일지다. 보고서 양식이 아니라
       사람 말투로 쓴다 — 어려운 말을 골라 쓸 이유가 없다.
       문단은 잇는 말(문자열)과 문장(객체)이 섞여 있고, 문장만 누를 수 있다. */
    reports: [
      {
        id: "r1", no: "1차",
        title: "첫 번째",
        head: "1943년 11월 2일 · 계산부",
        body: [
          [ "어제 오후에 같은 계산을 세 번 돌려 보라는 말을 들었다. 이건 첫 번째다.",
            { id: "r1_machine", set: "machine", t: "3호기로 돌렸다." },
            { id: "r1_zero", set: "zero", t: "눈금은 어제 저녁에 맞춰 둔 걸 그대로 썼다." },
            "밤새 아무도 안 건드렸으니 다시 맞출 것 없다고 봤다." ],

          [ { id: "r1_deck", set: "deck", t: "카드는 114번 뭉치에서 꺼냈다." },
            "뭉치 겉에 계산부 도장이 찍혀 있었다.",
            { id: "r1_input", set: "input", t: "0 에서 시작했다." },
            { id: "r1_steps", set: "steps", t: "세 번에 나눠서 계산했다." },
            { id: "r1_ratio", set: "ratio", t: "첫 번째에서 두 번째로 넘어갈 때 값이 두 배쯤 커졌다." },
            { id: "r1_result", set: "result", t: "끝에 2.9107 이 나왔다." },
            { id: "r1_digits", set: "digits", t: "소수점 네 자리까지만 적었다." } ],

          [ { id: "r1_std", set: "std", t: "표는 계산부에서 나눠 준 A 를 보고 했다." },
            "11월 1일에 나온 거고, 접으면 네 면이다." ],

          [ "아홉 시 이십 분에 시작해서 열한 시 오 분에 끝냈다.",
            { id: "r1_dur", set: "dur", t: "기계를 붙잡고 있던 건 한 시간 사십오 분이다." },
            "하다가 전기가 한 번 나갔다. 열 시 십이 분이었고, 삼 분쯤 있다가 들어왔다고 들었다.",
            { id: "r1_redo", set: "redo", t: "중간에 나온 값을 믿을 수가 없어서 처음부터 다시 했다." },
            "그래서 끝나는 게 그만큼 늦었다." ],

          [ { id: "r1_witness", set: "witness", t: "옆자리 사람이 처음부터 끝까지 같이 있었고, 읽는 건 둘이 맞춰 봤다." },
            "이상한 데는 없었다. 계산부 RICHARD." ]
        ]
      },
      {
        id: "r2", no: "2차",
        title: "두 번째 — 급히 적음",
        head: "11월 3일 · 계산부",
        body: [
          [ "어제랑 똑같이 한 번 더 돌렸다.",
            { id: "r2_machine", set: "machine", t: "기계는 3호기." },
            { id: "r2_input", set: "input", t: "시작은 0." },
            { id: "r2_steps", set: "steps", t: "세 단계." },
            { id: "r2_result", set: "result", t: "답은 2.9107." },
            { id: "r2_digits", set: "digits", t: "0.0001 자리까지 적었다." } ],

          [ { id: "r2_deck", set: "deck", t: "카드는 어제랑 같은 114번 뭉치." },
            { id: "r2_witness", set: "witness", t: "이번엔 옆에 사람이 없어서 혼자 돌리고 혼자 읽었다." },
            { id: "r2_std", set: "std", t: "표는 B 를 보고 했다." },
            "네 면짜리." ],

          [ "아홉 시 사십 분에 시작, 열한 시 이십오 분에 끝.",
            { id: "r2_dur", set: "dur", t: "기계에 붙어 있던 건 105분이다." },
            "열 시 삼십일 분에 전기가 나갔고 삼 분쯤 걸렸다.",
            { id: "r2_redo", set: "redo", t: "중간 값을 못 믿겠어서 처음부터 다시 했다." } ],

          [ { id: "r2_ratio", set: "ratio", t: "첫 단계는 1.2, 두 번째는 2.6 이었다." },
            "적는 걸 잊을 뻔했는데,",
            { id: "r2_zero", set: "zero", t: "눈금은 아침에 새로 맞추고 시작했다." },
            "별일 없었음. RICHARD" ]
        ]
      },
      {
        id: "r3", no: "3차",
        title: "세 번째, 그리고 정리",
        head: "11월 4일에 하고 5일에 정리",
        body: [
          [ "표부터 적어 둔다.",
            { id: "r3_std", set: "std", t: "계산부에서 나눠 준 A 를 보고 했다." },
            "11월 1일에 나온 거고 네 면짜리다.",
            { id: "r3_zero", set: "zero", t: "눈금은 그날 아침에 다시 맞췄다." },
            "앞이랑 같게 했다." ],

          [ { id: "r3_machine", set: "machine", t: "세 번째 기계를 썼다." },
            { id: "r3_input", set: "input", t: "처음에 넣은 값은 0." },
            { id: "r3_steps", set: "steps", t: "단계는 셋." },
            { id: "r3_ratio", set: "ratio", t: "첫 번째에서 두 번째로 가면서 값이 절반으로 줄었다." },
            { id: "r3_result", set: "result", t: "마지막은 2.9107." },
            { id: "r3_digits", set: "digits", t: "다섯째 자리는 버렸다." } ],

          [ { id: "r3_deck", set: "deck", t: "카드는 117번 뭉치에서 꺼내 썼다." },
            "겉에 계산부 도장이 있었다.",
            { id: "r3_witness", set: "witness", t: "옆에서 한 사람이 계속 봤고, 읽는 건 둘이 같이 했다." } ],

          [ "한 시 십 분에 시작해서 두 시 오십오 분에 끝냈다.",
            { id: "r3_dur", set: "dur", t: "두 시간은 안 걸렸다." },
            "두 시 이 분에 전기가 한 번 나갔다.",
            { id: "r3_redo", set: "redo", t: "끊긴 데 값이 종이에 남아 있길래 거기서부터 이어서 했다." } ],

          [ "이상한 데는 없었다. RICHARD. 덧붙임 — 세 번 것을 한 묶음으로 올린다." ]
        ]
      }
    ],

    /* ── 수정본 ──────────────────────────────────────────────────────────
       반려한 여섯 자리만 다시 해서 적었다. 이제 어긋나는 자리가 없다. */
    revisedReports: [
      {
        id: "r1", no: "1차", revised: true,
        title: "다시 한 첫 번째",
        head: "11월 6일 · 계산부",
        body: [
          [ "짚어 주신 데만 다시 해서 적는다.",
            { id: "rr1_zero", set: "zero", t: "눈금은 그날 아침에 새로 맞추고 시작했다." },
            { id: "rr1_deck", set: "deck", t: "카드는 114번 뭉치에서 꺼냈다." },
            { id: "rr1_std", set: "std", t: "표는 A 를 보고 했다." } ],
          [ { id: "rr1_ratio", set: "ratio", t: "첫 번째에서 두 번째로 넘어갈 때 값이 두 배쯤 커졌다." },
            "이번엔 전기가 안 나갔다.",
            { id: "rr1_redo", set: "redo", t: "처음부터 끝까지 한 번에 했고, 중간 값을 이어 쓴 데는 없다." },
            { id: "rr1_witness", set: "witness", t: "옆자리 사람이 끝까지 같이 있었고 읽는 건 둘이 맞춰 봤다." },
            "이상한 데는 없었다. 계산부 RICHARD." ]
        ]
      },
      {
        id: "r2", no: "2차", revised: true,
        title: "다시 한 두 번째",
        head: "11월 6일 · 계산부",
        body: [
          [ "지난번에 어긋났던 데를 하나씩 나눠 적는다.",
            { id: "rr2_zero", set: "zero", t: "눈금 — 그날 아침에 새로 맞췄다. 전날 것은 안 썼다." },
            { id: "rr2_std", set: "std", t: "표 — A. B 는 이번에 안 봤다." },
            { id: "rr2_deck", set: "deck", t: "카드 뭉치 — 114번." } ],
          [ "열한 시 십사 분에 전기가 한 번 나갔고 삼 분쯤 걸렸다.",
            { id: "rr2_redo", set: "redo", t: "전기 나간 뒤 — 중간 값은 버리고 처음부터 다시 했다." },
            { id: "rr2_witness", set: "witness", t: "옆 사람 — 둘이서 봤다. 혼자 한 회차는 없다." },
            { id: "rr2_ratio", set: "ratio", t: "단계 사이 — 1.2 에서 2.6 으로, 두 배쯤 커졌다." },
            "이상한 데는 없었다. RICHARD" ]
        ]
      },
      {
        id: "r3", no: "3차", revised: true,
        title: "다시 한 세 번째",
        head: "11월 7일 · 계산부",
        body: [
          [ { id: "rr3_std", set: "std", t: "표는 A. 앞의 두 번이랑 같은 거다." },
            { id: "rr3_zero", set: "zero", t: "눈금은 아침에 새로 맞췄다." },
            { id: "rr3_deck", set: "deck", t: "카드는 114번 뭉치. 지난번 117번은 다른 계산 거였다." } ],
          [ { id: "rr3_ratio", set: "ratio", t: "첫 번째에서 두 번째로 가면서 값이 두 배 남짓 커졌다." },
            "이번에도 전기는 안 나갔다.",
            { id: "rr3_redo", set: "redo", t: "처음부터 끝까지 한 번에 했다." },
            { id: "rr3_witness", set: "witness", t: "읽는 건 둘이 같이 했다." },
            "별일 없었음. RICHARD. 덧붙임 — 올리기 전에 세 장을 나란히 놓고 견줘 봤다." ]
        ]
      }
    ],

    /* 둘씩 맞대어 볼 수 있는 짝 */
    comparePairs: [["r1", "r2"], ["r2", "r3"], ["r1", "r3"]],

    /* ── 대사 ───────────────────────────────────────────────────────────
       그는 세 장이 똑같다고 믿고 들어온다. 아니라는 걸 보이는 것이
       플레이어의 몫이다. 규칙을 읊어 주는 대사는 두지 않는다 — 설명이
       길어지는 만큼 이 사람이 사람이 아니게 된다. */
    lines: {
      knock: ["똑.", "똑. 똑.", "똑. 똑. 똑."],

      /* 들어와서. 자랑이지 설명이 아니다. */
      submission: [
        "박사님. 계산부 RICHARD 입니다.",
        "적분 검산, 세 번 돌린 겁니다.",
        "기계도 같고 넣은 값도 같고, 하는 방법도 같게 했습니다.",
        "세 번 다 2.9107. 소수점 자리까지 똑같이 나왔습니다.",
        "세 장 다 같은 기록입니다. 어느 자리를 견주셔도 그럴 겁니다.",
        "올려도 되겠습니까."
      ],

      /* 아직 아무것도 안 짚었을 때 */
      probing: [
        "어느 자리든 견줘 보십시오.",
        "세 장이 같을 겁니다."
      ],

      /* 어긋난 자리를 옳게 짚었지만 아직 남았을 때.
         자기 실수를 지적당한 사람의 말이어야 한다. */
      notYet: [
        "……어.",
        "죄송합니다. 틀린 게 있네요.",
        "더 있는지 봐 주시겠습니까."
      ],

      /* 어긋나지 않은 자리를 어긋났다고 짚었을 때. 뒤에 그 세트의 same 이 붙는다. */
      pushback: [
        "그건 같은 말입니다, 박사님."
      ],
      pushbackTail: [
        "다시 봐 주십시오."
      ],

      /* 여섯 자리를 다 짚었을 때 */
      conceded: [
        "……잠깐만요.",
        "표도, 눈금도, 카드 뭉치도.",
        "전기 나간 뒤에 어떻게 했는지도. 옆에 사람이 있었는지도.",
        "커졌다고 적은 데가 있고, 줄었다고 적은 데가 있고.",
        "같은 걸 세 번 했다고 말씀드렸는데.",
        "세 번 다 다른 걸 한 거였습니다.",
        "……다시 하고 오겠습니다."
      ],

      rejected: [
        "반려. 알겠습니다."
      ],

      /* 돌아와서 */
      revised: [
        "다시 했습니다.",
        "짚어 주신 자리, 세 번 다 같게 맞췄습니다.",
        "보십시오."
      ],
      revisedAgain: [
        "보셨습니까."
      ],

      approved: [
        "죄송합니다, 박사님.",
        "답만 맞으면 되는 줄 알았습니다.",
        "세 번 했다는 말이랑 세 번 똑같이 했다는 말이, 다른 말이었습니다.",
        "……가 보겠습니다."
      ],

      done: [
        "고생하셨습니다."
      ]
    },

    /* ── 씬 ───────────────────────────────────────────────────────────── */
    room: { W: 5.4, D: 6.6, H: 2.9 },

    /* 문 — RICHARD 가 드나드는 곳이자 플레이어가 나가는 곳.
       플레이어는 책상 이쪽(+z)에서 -z 를 보고 시작한다. 문은 그 시선 끝,
       RICHARD 가 서는 자리 뒤에 있어야 한다 — 노크 소리가 나고 문이 열리고
       걸어 들어오는 것이 처음부터 끝까지 보여야 하기 때문이다. */
    door: { pos: [-0.75, 0, -3.3], width: 1.05, height: 2.12 },

    /* NPC 이동 경로. 문 안쪽에서 책상 건너편까지. */
    npcPath: {
      doorway: [-0.75, 0, -2.90],
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
        pos: [2.30, 0, -1.15], rot: [0, -Math.PI * 0.42, 0], fitWidth: 0.46,
        solid: true },
      /* 램프는 책상 오른쪽 안쪽. 상판은 z 0.05~0.95 안에서만 물건을 받는다 —
         그 밖에 두면 허공에 뜬다. 도장 자리(왼쪽 앞)와도 떨어뜨린다. */
      { id: "lamp",   path: "desk_lamp_arm_01/desk_lamp_arm_01.gltf",
        pos: [0.58, 0, 0.22],   rot: [0, -Math.PI * 0.32, 0], fitHeight: 0.44,
        restOn: "desk" },
      /* 문 자리(x -1.28 ~ -0.23)를 비켜 세운다 */
      { id: "board",  path: "standing_chalkboard_01/standing_chalkboard_01.gltf",
        pos: [-2.05, 0, -2.30], rot: [0, Math.PI * 0.30, 0], fitHeight: 1.62,
        solid: true },
      { id: "shelf",  path: "wooden_bookshelf_worn/wooden_bookshelf_worn.gltf",
        pos: [1.75, 0, -2.55],  rot: [0, 0, 0],              fitHeight: 1.82,
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
        pos: [1.75, 0, -2.55],  rot: [0, 0, 0],              fitHeight: 0.24,
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
