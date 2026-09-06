/* ============================================================================
   CH01 — RICHARD / 계산 사슬

   큐시트 §4 [CH1-01]~[CH1-07].

   RICHARD 가 같은 계산을 세 번 돌린 시험 보고서를 들고 온다. 세 번 다 같은
   값이 나왔으니 문제가 없다는 것이 그의 주장이다. 그러나 원기록을 대조하면
   여섯 종류의 어긋남이 세 장에 나뉘어 있다. 전사 과정에서 계산본이 섞였다.

   설계 원칙(04_DOCUMENT_OBJECTS §11 정답 색칠 금지, §34 False Lead):
   문단은 셋 다 표현이 다르다. 착수 시각도, 정전 시각도, 서명 형식도 다르다.
   그러나 그것들은 회차가 다르니 당연히 다른 것이다. 뜻이 갈리는 곳은
   sets 의 agree/odd 로 정한 여섯 자리이며, 나머지는 표현만 다른 기록이다.
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

    "lines": {
        "knock": [
            "똑, 똑."
        ],
        "submission": [
            {
                "text": "박사님. 잠깐 괜찮으십니까?",
                "pose": "listen",
                "look": "player",
                "stage": "리처드가 문 안쪽에서 걸음을 멈춘다.",
                "pause": 350
            },
            {
                "text": "계산부 첫 결과입니다. 세 번 돌렸는데, 끝자리까지 똑같이 나왔습니다.",
                "pose": "confident",
                "look": "desk"
            },
            {
                "text": "세 번 다?",
                "pose": "listen",
                "look": "player",
                "who": "당신"
            },
            {
                "text": "네. 이번에는 자신 있습니다.",
                "pose": "nod",
                "look": "player"
            },
            {
                "text": "그럼 결과 앞에 있는 것부터 보지.",
                "pose": "listen",
                "look": "player",
                "who": "당신"
            },
            {
                "text": "얼마든지요. 원기록도 같이 가져왔습니다.",
                "pose": "inspect",
                "look": "desk"
            }
        ],
        "probing": [
            {
                "text": "서두르실 것 없습니다. 저는 여기 있겠습니다.",
                "pose": "listen",
                "look": "player"
            }
        ],
        "notYet": [
            {
                "text": "제가 놓친 게 또 있겠군요. 다른 장도 함께 보겠습니다.",
                "pose": "inspect",
                "look": "desk",
                "stage": "그가 다시 서류로 시선을 내린다."
            }
        ],
        "pushback": [
            {
                "text": "잠깐만요. 이 부분은 제가 설명드리겠습니다.",
                "pose": "listen",
                "look": "desk"
            }
        ],
        "pushbackTail": [
            {
                "text": "표현을 제각각 적어서 헷갈리게 했군요.",
                "pose": "nod",
                "look": "player"
            }
        ],
        "conceded": [
            {
                "text": "숫자만 보고 같은 계산이라고 말씀드렸군요.",
                "pose": "inspect",
                "look": "desk",
                "stage": "리처드는 한동안 서류에서 눈을 떼지 못한다.",
                "pause": 650
            },
            {
                "text": "이 묶음에 서명할 수 있겠나?",
                "pose": "listen",
                "look": "player",
                "who": "당신"
            },
            {
                "text": "…아니요. 처음부터 다시 돌리겠습니다.",
                "pose": "shake",
                "look": "player",
                "pause": 500
            },
            {
                "text": "수정한 기록은 따로 올리게.",
                "pose": "listen",
                "look": "player",
                "who": "당신"
            },
            {
                "text": "네. 이번에는 섞이지 않게 하겠습니다.",
                "pose": "nod",
                "look": "desk"
            }
        ],
        "rejected": [
            {
                "text": "받아 가겠습니다.",
                "pose": "nod",
                "look": "player",
                "stage": "리처드가 짧게 고개를 끄덕인다.",
                "pause": 400
            }
        ],
        "revised": [
            {
                "text": "박사님. 다시 가져왔습니다.",
                "pose": "listen",
                "look": "player"
            },
            {
                "text": "이번에는 묶는 사람과 읽는 사람도 따로 두었습니다.",
                "pose": "inspect",
                "look": "desk"
            },
            {
                "text": "먼저 놓아 보게.",
                "pose": "listen",
                "look": "player",
                "who": "당신"
            },
            {
                "text": "올리기 전에 세 장을 나란히 확인했습니다.",
                "pose": "nod",
                "look": "desk"
            }
        ],
        "revisedAgain": [
            {
                "text": "천천히 보십시오. 기다리겠습니다.",
                "pose": "listen",
                "look": "player"
            }
        ],
        "approved": [
            {
                "text": "이제 보내도 되겠습니까?",
                "pose": "inspect",
                "look": "desk",
                "stage": "그가 서류에서 도장 쪽으로 시선을 옮긴다."
            },
            {
                "text": "그래. 수고했네.",
                "pose": "listen",
                "look": "player",
                "who": "당신"
            },
            {
                "text": "다음에는 박사님 책상에 놓기 전에, 제가 한 번 더 의심해 보겠습니다.",
                "pose": "nod",
                "look": "player",
                "pause": 450
            }
        ],
        "done": [
            {
                "text": "계산부에서 기다리겠습니다.",
                "pose": "listen",
                "look": "player"
            }
        ]
    },
    "reactions": {
        "zero": [
            {
                "text": "첫날은 전날 맞춘 눈금을 그대로 썼군요. 시작 조건부터 달랐습니다.",
                "pose": "inspect",
                "look": "desk",
                "stage": "그가 첫 기록 위에서 시선을 멈춘다.",
                "pause": 450
            }
        ],
        "std": [
            {
                "text": "B 표요? 제가 배부한 건 A인데… 이 장은 어디서 넘어왔죠?",
                "pose": "inspect",
                "look": "desk",
                "pause": 450
            }
        ],
        "deck": [
            {
                "text": "117번은 다른 계산 묶음입니다. 전사할 때 책상 위에서 섞였나 봅니다.",
                "pose": "shake",
                "look": "desk"
            }
        ],
        "redo": [
            {
                "text": "여기만 이어서 돌렸군요. 저는 전부 처음부터 다시 한 줄 알았습니다.",
                "pose": "inspect",
                "look": "desk"
            }
        ],
        "witness": [
            {
                "text": "혼자 읽은 기록이 끼었네요. 맞춰 봤다는 말부터 정정해야겠습니다.",
                "pose": "listen",
                "look": "player"
            }
        ],
        "ratio": [
            {
                "text": "잠깐. 1.2에서 2.6인데… 줄었다고 적었네요. 이건 제 잘못입니다.",
                "pose": "inspect",
                "look": "desk",
                "pause": 500
            }
        ]
    },
    "room": {
        "kind": "calculation-office",
        "W": 7.8,
        "D": 8.2,
        "H": 3.3
    },
    "spawn": {
        "pos": [
            0,
            1.62,
            2.45
        ],
        "yaw": 3.141592653589793,
        "pitch": -0.22
    },
    "door": {
        "pos": [
            -0.75,
            0,
            -4.1
        ],
        "width": 1.12,
        "height": 2.25
    },
    "npcPath": {
        "doorway": [
            -0.75,
            0,
            -3.65
        ],
        "stand": [
            0.05,
            0,
            -0.55
        ]
    },
    "lookPoints": {
        "desk": [
            0.08,
            0.83,
            0.38
        ]
    },
    "models": [
        {
            "id": "desk",
            "path": "stage2/rooms/wooden_table_02.glb",
            "pos": [
                0,
                0,
                0.35
            ],
            "fitHeight": 0.82,
            "solid": true
        },
        {
            "id": "lamp",
            "path": "stage2/rooms/industrial_pipe_lamp.glb",
            "pos": [
                0.4,
                0,
                0.11
            ],
            "fitHeight": 0.32,
            "restOn": "desk"
        },
        {
            "id": "files",
            "path": "stage2/rooms/vintage_wooden_drawer_01.glb",
            "pos": [
                -2.1,
                0,
                -2.7
            ],
            "fitWidth": 1.4,
            "solid": true
        },
        {
            "id": "files-upper",
            "path": "stage2/rooms/vintage_wooden_drawer_01.glb",
            "pos": [
                -2.1,
                0,
                -2.7
            ],
            "fitWidth": 1.32,
            "restOn": "files"
        },
        {
            "id": "shelf",
            "path": "wooden_bookshelf_worn/wooden_bookshelf_worn.gltf",
            "pos": [
                1.7,
                0,
                -3.55
            ],
            "fitHeight": 2.3,
            "solid": true
        },
        {
            "id": "shelf-left",
            "path": "wooden_bookshelf_worn/wooden_bookshelf_worn.gltf",
            "pos": [
                -3.4,
                0,
                -0.5
            ],
            "rot": [
                0,
                1.5707963267948966,
                0
            ],
            "fitHeight": 2.3,
            "solid": true
        },
        {
            "id": "books-a",
            "path": "books/book_encyclopedia_set_01.gltf",
            "pos": [
                0,
                0,
                0
            ],
            "fitWidth": 0.95,
            "shelfOf": "shelf",
            "shelf": 1
        },
        {
            "id": "books-b",
            "path": "books/book_encyclopedia_set_01.gltf",
            "pos": [
                0,
                0,
                0
            ],
            "fitWidth": 0.8,
            "shelfOf": "shelf",
            "shelf": 2
        },
        {
            "id": "books-c",
            "path": "books/book_encyclopedia_set_01.gltf",
            "pos": [
                0,
                0,
                0
            ],
            "rot": [
                0,
                1.5707963267948966,
                0
            ],
            "fitWidth": 0.65,
            "shelfOf": "shelf-left",
            "shelf": 1
        },
        {
            "id": "clock",
            "path": "mantel_clock_01/mantel_clock_01.gltf",
            "pos": [
                1.7,
                0,
                -3.55
            ],
            "fitHeight": 0.27,
            "restOn": "shelf"
        }
    ],
    "npcModel": {
        "path": "stage2/cast/richard.glb",
        "scale": 0.98,
        "align": "none",
        "center": false,
        "hitHeight": 1.78,
        "hitWidth": 0.64,
        "clips": {
            "idle": "CharacterArmature|Idle_Neutral",
            "talk": "CharacterArmature|Idle_Neutral",
            "walk": "CharacterArmature|Walk"
        }
    },
    "anchors": {
        "reportSlot": [
            0.08,
            0.83,
            0.38
        ],
        "stampPad": [
            -0.44,
            0.83,
            0.48
        ]
    }
  };
});
