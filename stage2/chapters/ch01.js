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

    /* ── 짚어야 할 진술 ────────────────────────────────────────────────
       다섯 곳에서 두 장이 같은 말을, 한 장이 다른 말을 한다.
       혼자 다른 장은 진술마다 바뀐다 — 한 장만 의심하면 못 푼다. */
    claims: [
      { id: "zero",
        label: "시작 전 영점",
        question: "영점을 언제 맞췄는가",
        wrong: "1차만 전날 맞춘 값을 그대로 썼다. 2차와 3차는 그날 새로 맞췄다.",
        ok:    "세 번 다 그날 아침 새로 맞췄다고 한다." },
      { id: "std",
        label: "기준표 개정",
        question: "어느 기준표를 놓고 돌렸는가",
        wrong: "2차만 개정 B 로 돌렸다고 한다. 1차와 3차는 개정 A 다.",
        ok:    "세 번 다 개정 A 를 놓고 돌렸다고 한다." },
      { id: "deck",
        label: "투입 카드 묶음",
        question: "어느 묶음의 카드를 넣었는가",
        wrong: "3차만 C-117 묶음을 넣었다고 한다. 1차와 2차는 C-114 다.",
        ok:    "세 번 다 C-114 묶음을 넣었다고 한다." },
      { id: "redo",
        label: "정전 뒤 처리",
        question: "전원이 끊긴 뒤 어디서부터 이었는가",
        wrong: "3차만 끊긴 자리에서 이어 돌렸다고 한다. 1차와 2차는 처음부터 다시 돌렸다.",
        ok:    "세 번 다 처음부터 다시 돌렸다고 한다." },
      { id: "witness",
        label: "입회",
        question: "곁에서 함께 본 사람이 있었는가",
        wrong: "2차만 혼자 돌렸다고 한다. 1차와 3차는 둘이서 확인했다.",
        ok:    "세 번 다 둘이서 확인했다고 한다." }
    ],
    required: ["zero", "std", "deck", "redo", "witness"],

    /* ── 원본 보고서 ─────────────────────────────────────────────────────
       한 사람이 사흘에 걸쳐 쓴 작업일지다. 셋의 생김새가 같을 리 없다.
       1차는 처음이라 항목을 나눠 꼼꼼히 적었고, 2차는 급해서 여러 내용을
       한 문단에 몰아 약식으로 썼고, 3차는 나중에 정리하며 기준표부터 적고
       시각을 뒤로 돌렸다. 문단 수도 순서도 말투도 다르다.

       value 가 붙은 문단만이 뜻을 갖는다. 착수 시각도 정전 시각도 서명
       형식도 셋 다 다르지만 회차가 다르니 다른 것이 맞다. */
    reports: [
      {
        id: "r1", no: "1차",
        title: "적분 검산 시험 · 1차 기록",
        head: "1943년 11월 2일 · 계산부 3호기",
        body: [
          { id: "r1_zero", claim: "zero", value: "전날 값",
            text: "시작 전 영점은 전날 저녁에 맞춰 둔 값을 그대로 썼다. " +
                  "밤새 건드린 사람이 없어 다시 맞출 이유가 없다고 보았다." },
          { id: "r1_deck", claim: "deck", value: "C-114",
            text: "투입 카드는 C-114 묶음에서 꺼냈다. 묶음 표지에 계산부 도장이 " +
                  "찍혀 있었다." },
          { id: "r1_scope",
            text: "계산부 3호기를 썼다. 투입값은 0.0000 이고, 세 단계를 거쳐 최종 " +
                  "2.9107 을 얻었다. 자릿수는 소수 넷째 자리까지 남겼다." },
          { id: "r1_std", claim: "std", value: "개정 A",
            text: "기준표는 계산부가 배포한 개정 A 를 놓고 돌렸다. 배포일은 11월 1일, " +
                  "판형은 접지 4면짜리였다." },
          { id: "r1_time",
            text: "09시 20분에 착수해 11시 05분에 끝냈다. 기계를 붙잡고 있던 시간은 " +
                  "1시간 45분이다." },
          { id: "r1_power",
            text: "도중에 배전 계통이 한 번 끊겼다. 10시 12분이었고, 복구까지 3분쯤 " +
                  "걸렸다고 들었다." },
          { id: "r1_redo", claim: "redo", value: "처음부터",
            text: "끊긴 동안의 중간값을 믿을 수 없어 처음부터 다시 돌렸다. 그래서 " +
                  "종료가 그만큼 늦어졌다." },
          { id: "r1_witness", claim: "witness", value: "2인",
            text: "옆 자리 인원이 처음부터 끝까지 같이 있었다. 판독은 둘이서 " +
                  "맞대어 확인했다." },
          { id: "r1_sign",
            text: "검산 결과에 이상은 없었다. 계산부 RICHARD." }
        ]
      },
      {
        id: "r2", no: "2차",
        title: "적분 검산 2차 (약식)",
        head: "11.3 / 3호기",
        body: [
          { id: "r2_head",
            text: "1차와 같은 조건으로 3호기에서 한 번 더. 0.0000 에서 출발해 3단을 " +
                  "지나 2.9107. 넷째 자리까지 적었다. 09시 40분 착수, 11시 25분 종료, " +
                  "1시간 45분으로 1차와 같다." },
          { id: "r2_deck", claim: "deck", value: "C-114",
            text: "카드는 어제와 같은 C-114 묶음." },
          { id: "r2_std", claim: "std", value: "개정 B",
            text: "기준표는 개정 B. 배포일 11월 1일, 접지 4면." },
          { id: "r2_power",
            text: "10시 31분에 배전이 끊겼다. 3분 남짓." },
          { id: "r2_redo", claim: "redo", value: "처음부터",
            text: "중간값을 믿을 수 없어 처음부터 다시. 그만큼 늦어졌다." },
          { id: "r2_zero", claim: "zero", value: "새로 맞춤",
            text: "적는 걸 잊을 뻔했는데, 영점은 아침에 새로 맞추고 시작했다." },
          { id: "r2_witness", claim: "witness", value: "단독",
            text: "이번엔 사람이 없어 혼자 돌리고 혼자 읽었다." },
          { id: "r2_sign",
            text: "이상 없음. RICHARD (계산부)" }
        ]
      },
      {
        id: "r3", no: "3차",
        title: "적분 검산 시험 3차 및 정리",
        head: "시험 1943년 11월 4일 · 정리 11월 5일 · 3호기",
        body: [
          { id: "r3_std", claim: "std", value: "개정 A",
            text: "먼저 기준표부터 밝혀 둔다. 계산부 배포본 개정 A 를 놓고 돌렸다. " +
                  "11월 1일자, 접지 네 면짜리다." },
          { id: "r3_zero", claim: "zero", value: "새로 맞춤",
            text: "영점은 그날 아침에 새로 맞췄다. 앞 회차와 같은 절차다." },
          { id: "r3_scope",
            text: "조건을 바꾸지 않고 3호기로 한 번 더 했다. 투입값 0.0000, 세 단계, " +
                  "최종 2.9107. 13시 10분 착수, 14시 55분 종료, 105분이 걸렸다." },
          { id: "r3_deck", claim: "deck", value: "C-117",
            text: "투입 카드는 C-117 묶음에서 꺼내 썼다. 표지에 계산부 도장이 있었다." },
          { id: "r3_redo", claim: "redo", value: "이어서",
            text: "14시 02분에 배전이 한 번 끊겼다. 중단된 자리의 중간값이 종이에 " +
                  "남아 있어 거기서부터 이어 돌렸다." },
          { id: "r3_witness", claim: "witness", value: "2인",
            text: "옆에서 한 사람이 계속 지켜봤고, 판독은 둘이 함께 했다." },
          { id: "r3_sign",
            text: "검산 결과에 이상은 없었다. 서명 RICHARD (계산부). " +
                  "추기 — 세 회차를 한 묶음으로 올린다." }
        ]
      }
    ],

    /* ── 수정본 ──────────────────────────────────────────────────────────
       다시 돌리고 다시 썼다. 이번에도 세 장의 생김새는 서로 다르다.
       달라진 것은 다섯 자리뿐이고, 이제 그 다섯은 세 장이 같은 말을 한다. */
    revisedReports: [
      {
        id: "r1", no: "1차",
        title: "적분 검산 재시험 · 1차",
        head: "재시험 1943년 11월 6일 · 계산부 3호기",
        body: [
          { id: "rr1_scope",
            text: "3호기로 다시 돌렸다. 투입값 0.0000, 세 단계, 최종 2.9107. " +
                  "08시 05분 착수, 09시 50분 종료. 1시간 45분." },
          { id: "rr1_zero", claim: "zero", value: "새로 맞춤",
            text: "영점은 그날 아침에 새로 맞추고 시작했다." },
          { id: "rr1_deck", claim: "deck", value: "C-114",
            text: "투입 카드는 C-114 묶음에서 꺼냈다." },
          { id: "rr1_std", claim: "std", value: "개정 A",
            text: "기준표는 개정 A. 세 회차 모두 같은 표를 놓고 돌렸다." },
          { id: "rr1_redo", claim: "redo", value: "처음부터",
            text: "이 회차에서는 배전이 끊기지 않았다. 처음부터 끝까지 한 번에 " +
                  "돌렸고, 중간값을 이어 쓴 구간은 없다." },
          { id: "rr1_witness", claim: "witness", value: "2인",
            text: "옆 자리 인원이 끝까지 같이 있었고 판독은 둘이 맞댔다." },
          { id: "rr1_sign",
            text: "재시험 결과에 이상은 없었다. 계산부 RICHARD." }
        ]
      },
      {
        id: "r2", no: "2차",
        title: "적분 검산 재시험 · 2차 기록",
        head: "재시험 1943년 11월 6일 · 계산부 3호기",
        body: [
          { id: "rr2_open",
            text: "반려 사항을 그대로 반영해 다시 돌렸다. 무엇을 어떻게 했는지 " +
                  "항목으로 나누어 적는다." },
          { id: "rr2_zero", claim: "zero", value: "새로 맞춤",
            text: "영점 — 그날 아침에 새로 맞췄다. 전날 값은 쓰지 않았다." },
          { id: "rr2_deck", claim: "deck", value: "C-114",
            text: "카드 묶음 — C-114." },
          { id: "rr2_std", claim: "std", value: "개정 A",
            text: "기준표 — 개정 A. 지난번에 쓴 개정 B 는 이번에 쓰지 않았다." },
          { id: "rr2_time",
            text: "시각 — 10시 20분 착수, 12시 05분 종료. 1시간 45분. 11시 14분에 " +
                  "배전이 한 번 끊겼고 복구에 3분 남짓 걸렸다." },
          { id: "rr2_redo", claim: "redo", value: "처음부터",
            text: "정전 뒤 — 중간값은 버리고 처음부터 다시 돌렸다. 이어 쓴 구간은 없다." },
          { id: "rr2_witness", claim: "witness", value: "2인",
            text: "입회 — 둘이서 확인했다. 혼자 돌린 회차는 없다." },
          { id: "rr2_sign",
            text: "재시험 결과에 이상은 없었다. RICHARD (계산부)" }
        ]
      },
      {
        id: "r3", no: "3차",
        title: "적분 검산 재시험 3차",
        head: "재시험 11.7 / 3호기",
        body: [
          { id: "rr3_all",
            text: "조건 그대로 한 번 더. 0.0000 → 세 단계 → 2.9107, 넷째 자리까지. " +
                  "09시 00분 착수, 10시 45분 종료, 105분." },
          { id: "rr3_zero", claim: "zero", value: "새로 맞춤",
            text: "영점은 아침에 새로 맞췄다." },
          { id: "rr3_std", claim: "std", value: "개정 A",
            text: "기준표 개정 A. 앞의 두 회차와 같은 판형이다." },
          { id: "rr3_deck", claim: "deck", value: "C-114",
            text: "카드는 C-114 묶음. 지난번 C-117 은 다른 시험 것이었다." },
          { id: "rr3_redo", claim: "redo", value: "처음부터",
            text: "이번에도 배전은 끊기지 않았다. 처음부터 끝까지 한 번에 돌렸다." },
          { id: "rr3_witness", claim: "witness", value: "2인",
            text: "판독은 둘이 함께 했다." },
          { id: "rr3_sign",
            text: "이상 없음. 서명 RICHARD. 추기 — 올리기 전에 세 장이 같은 말을 " +
                  "하는지 먼저 봤다." }
        ]
      }
    ],

    /* 둘씩 맞대어 볼 수 있는 짝 */
    comparePairs: [["r1", "r2"], ["r2", "r3"], ["r1", "r3"]],

    /* ── 대사 ───────────────────────────────────────────────────────────
       편지 화면에는 안내문이 없다. 무엇을 해야 하는지는 여기서 말한다. */
    lines: {
      /* 문을 열고 들어와 책상 앞까지 걸어온 뒤 */
      submission: [
        "박사님. 계산부 RICHARD 입니다.",
        "적분 검산 결과가 나왔습니다. 같은 계산을 세 번 돌렸습니다.",
        "같은 기계, 같은 투입값, 같은 절차로요.",
        "세 번 다 2.9107 이 나왔습니다. 자릿수까지 똑같습니다.",
        "회차마다 한 장씩, 세 장을 책상에 올려 두었습니다.",
        "세 장을 나란히 놓고 읽어 보시면 됩니다.",
        "세 장이 같은 말을 하는지만 보시면 되고, 아니다 싶은 문장이 있으면 " +
        "그 문장을 짚어 주십시오."
      ],
      /* 아직 아무것도 못 짚었을 때 */
      probing: [
        "세 번 다 같은 값이 나왔습니다.",
        "장마다 시각이 다른 건 회차가 다르니 그런 겁니다.",
        "두 장이 같은 말을 하는데 한 장만 딴소리를 한다면, 그 딴소리를 " +
        "짚어 주십시오."
      ],
      /* 어긋남을 하나 짚어 온 뒤 */
      confront: [
        "……그 문장 말입니까.",
        "숫자는 셋 다 같은데 말입니다.",
        "다른 데도 그런 자리가 있는지 마저 보시겠습니까.",
        "저는 세 번 다 같은 조건으로 돌렸다고 알고 썼습니다."
      ],
      /* 아직 다 못 짚었을 때 */
      picked: [
        "……아직 더 있습니까.",
        "세 장을 다시 맞대어 봐 주십시오."
      ],
      /* 다섯 곳을 다 짚은 뒤 */
      conceded: [
        "……잠깐.",
        "기준표도, 영점도, 카드 묶음도 다릅니다.",
        "정전 뒤 처리도, 옆에 사람이 있었는지도 회차마다 다르게 적었군요.",
        "같은 시험이라고 적어 놓고 같은 시험이 아니었습니다.",
        "값이 같게 나온 건 우연이었을 수도 있다는 뜻이군요.",
        "다시 돌리고 오겠습니다."
      ],
      /* 반려 도장을 찍은 직후, 나가기 전에 */
      rejected: [
        "반려. 알겠습니다.",
        "다섯 자리를 맞춰서 처음부터 다시 돌리겠습니다."
      ],
      /* 문 밖으로 나갔다가 돌아와서 */
      revised: [
        "다시 돌렸습니다, 박사님.",
        "세 장을 다시 올려 두었습니다.",
        "반려하신 다섯 자리를 하나씩 짚어 보시면, 이번에는 세 장이 같은 말을 " +
        "하는 걸 보실 겁니다."
      ],
      approved: [
        "죄송합니다, 박사님.",
        "숫자가 맞으면 된 줄 알았습니다.",
        "세 번 돌렸다는 말과 세 번 같은 조건으로 돌렸다는 말이 다르다는 걸 " +
        "생각하지 못했습니다.",
        "앞으로는 올리기 전에 세 장이 같은 말을 하는지 먼저 보겠습니다.",
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
