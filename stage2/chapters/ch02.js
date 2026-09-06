/* CH02 — a condition-routing puzzle. All equipment and test rules are fictional. */
(function (root, factory) {
  var chapter = factory();
  if (typeof module === 'object' && module.exports) module.exports = chapter;
  if (root) { root.N2_CHAPTERS = root.N2_CHAPTERS || {}; root.N2_CHAPTERS.ch02 = chapter; }
})(typeof globalThis !== 'undefined' ? globalThis : this, function () {
  'use strict';
  return {
    id: 'ch02', number: 2, npc: 'ENRICO', title: '모두가 맞을 수는 없다',
    subtitle: '닫힌 규정함', puzzleType: 'conditions', opening: 'meeting',
    progress: { entry: 8, exit: 19 },
    escape: { cabinetCode: '1110', note: '시설부 메모 — 규정함 번호는 장비 교체일. MM · DD' },
    rules: [
      { id: 'A', title: 'S-12 / 개정 A', issued: '10월 25일', equipment: 'K-1', effective: '10-25', wait: 10, repeats: 3,
        text: 'K-1의 시험에는 안정화 10분 뒤 세 차례의 기록을 남긴다. 후속 규정이 발행되더라도 이미 완료한 K-1 시험의 원기록은 이 조건으로 보존한다.' },
      { id: 'B', title: 'S-12 / 개정 B', issued: '11월 8일', equipment: 'K-2', effective: '11-10', wait: 20, repeats: 5,
        text: '11월 10일부터 K-2로 수행하는 시험에 적용한다. 안정화 20분 뒤 다섯 차례를 기록한다. K-1의 과거 시험을 소급하여 다시 작성하지 않는다.' }
    ],
    sources: [
      { id: 'change', title: '장비 교체 대장', tag: '시설부 · 11월 10일', text: '11월 10일 08:00, 공동 시험대의 K-1을 철거하고 K-2를 인계했다. 11월 12일 A·B·D팀의 작업은 모두 이 시험대에서 수행했다. 인계 후 K-1을 재사용한 기록은 없다.' },
      { id: 'archive', title: '보관함 인수표', tag: '기록실 · 11월 12일', text: 'C팀 봉투는 11월 7일 완료한 K-1 시험의 원본이다. 오늘 날짜는 검토실에 전달한 날이다. 신규 시험과 같은 묶음에 넣되, 과거 조건을 보존한다.' }
    ],
    teams: [
      { id: 'a', brief: '장비가 바뀌어도 비교 조건은 같아야 한다.', name: 'A팀', role: '운전 담당', equipment: 'K-2', date: '11-12', filed: '11월 12일', rule: 'A', wait: 10, repeats: 3, source: 'change',
        quote: '지난번과 같은 절차로 끝냈습니다. 장비가 바뀌었어도 비교하려면 같은 조건이어야 하지 않습니까?',
        note: 'K-2 / 11월 12일 09:00 시작. 09:10부터 세 차례 기록. 표지에 S-12 개정 A를 기입했다.' },
      { id: 'b', brief: '새 규정은 받았다. 대기는 평소대로 했다.', name: 'B팀', role: '관찰 담당', equipment: 'K-2', date: '11-12', filed: '11월 12일', rule: 'B', wait: 10, repeats: 5, source: 'change',
        quote: '새 규정은 받았습니다. 다섯 번 모두 기록했고요. 시작 전 대기 시간은 늘 하던 대로 잡았습니다.',
        note: 'K-2 / 11월 12일 10:00 시작. 10:10부터 다섯 차례 기록. 표지에 S-12 개정 B를 기입했다.' },
      { id: 'c', brief: '접수일과 시험일은 다르다.', name: 'C팀', role: '기록 담당', equipment: 'K-1', date: '11-07', filed: '11월 12일', rule: 'A', wait: 10, repeats: 3, source: 'archive',
        quote: '봉투 날짜를 보고 다시 쓰라고 하더군요. 하지만 그날은 기록실에서 이 방으로 옮긴 날입니다.',
        note: '원기록: 11월 7일 14:00 시작. K-1. 14:10부터 세 차례 기록. S-12 개정 A. 봉투 접수: 11월 12일.' },
      { id: 'd', brief: '세 번 같은 값이 나와 기록을 끝냈다.', name: 'D팀', role: '시험 담당', equipment: 'K-2', date: '11-12', filed: '11월 12일', rule: 'B', wait: 20, repeats: 3, source: 'change',
        quote: '새 장비는 충분히 기다렸습니다. 값도 차분했죠. 세 번째 기록까지 같아서 거기서 끝냈습니다.',
        note: 'K-2 / 11월 12일 11:00 시작. 11:20부터 세 차례 기록. 표지에 S-12 개정 B를 기입했다.' }
    ],
    "lines": {
        "submission": [
            {
                "text": "박사님, 저 칠판 좀 보십시오. 오전 내내 저 상태입니다.",
                "pose": "listen",
                "look": "board",
                "stage": "엔리코가 칠판 쪽으로 몸을 돌린다."
            },
            {
                "text": "결론이 넷이군.",
                "pose": "listen",
                "look": "player",
                "who": "당신"
            },
            {
                "text": "네. 네 팀 다 자신이 맞답니다.",
                "pose": "shake",
                "look": "player"
            },
            {
                "text": "자료는 여기 모아 두었습니다. 저는 더 보탤 말이 없군요.",
                "pose": "inspect",
                "look": "desk",
                "pause": 400
            }
        ],
        "probing": [
            {
                "text": "봉투는 오전에 도착한 그대로입니다.",
                "pose": "listen",
                "look": "desk"
            }
        ],
        "conceded": [
            {
                "text": "시험대가 바뀐 건 언제지?",
                "pose": "listen",
                "look": "player",
                "who": "당신"
            },
            {
                "text": "지난 시험 뒤입니다. 하지만 규정은…",
                "pose": "listen",
                "look": "bench"
            },
            {
                "text": "그러네요. 장비만 바꾸고 조건은 그대로 썼군요.",
                "pose": "inspect",
                "look": "desk",
                "stage": "그가 기준판 쪽을 오래 바라본다.",
                "pause": 650
            },
            {
                "text": "C팀 기록까지 고칠 필요는 없겠지.",
                "pose": "listen",
                "look": "player",
                "who": "당신"
            },
            {
                "text": "그건 옛 장비로 끝낸 시험입니다. 원본은 남겨 두겠습니다.",
                "pose": "nod",
                "look": "player"
            },
            {
                "text": "나머지 세 팀은 다시 불러야겠군요.",
                "pose": "listen",
                "look": "bench"
            }
        ],
        "rejected": [
            {
                "text": "좋습니다. 이번엔 같은 출발선에서 해 봅시다.",
                "pose": "nod",
                "look": "bench",
                "stage": "엔리코가 시험대 쪽으로 돌아선다.",
                "pause": 400
            }
        ],
        "revised": [
            {
                "text": "시험대는 준비됐습니다. 조건을 맞추고 돌려 보시죠.",
                "pose": "listen",
                "look": "bench"
            }
        ],
        "revisedAgain": [
            {
                "text": "기록이 나왔습니까? 같이 보시죠.",
                "pose": "listen",
                "look": "bench"
            }
        ],
        "approved": [
            {
                "text": "이번에는 비교가 되겠군요.",
                "pose": "inspect",
                "look": "bench",
                "stage": "엔리코가 새 기록을 내려다본다.",
                "pause": 400
            },
            {
                "text": "같은 조건이라는 말이, 이제야 맞는 말이 됐군.",
                "pose": "listen",
                "look": "player",
                "who": "당신"
            },
            {
                "text": "그러게 말입니다. 긴 오전이었습니다.",
                "pose": "nod",
                "look": "player"
            },
            {
                "text": "출입 열쇠는 시험대 서랍에 있습니다. 수고하셨습니다.",
                "pose": "listen",
                "look": "bench"
            }
        ],
        "done": [
            {
                "text": "기준서는 장비 옆에 두겠습니다. 다음 사람이 찾을 수 있게요.",
                "pose": "nod",
                "look": "bench"
            }
        ]
    },
    "reviewLines": {
        "papers": [
            {
                "text": "아직 봉투가 그대로군요. 가운데 놓아 두었습니다.",
                "pose": "listen",
                "look": "desk"
            }
        ],
        "rule": [
            {
                "text": "그런데 비교할 기준서가 없군요. 시설부가 정리한 뒤로 늘 이렇습니다.",
                "pose": "inspect",
                "look": "cabinet",
                "stage": "그가 잠긴 규정함을 돌아본다."
            }
        ],
        "loose": [
            {
                "text": "이 장도 함께 보시겠습니까?",
                "pose": "inspect",
                "look": "desk",
                "stage": "아직 분류되지 않은 기록 쪽을 바라본다."
            }
        ],
        "mixed": [
            {
                "text": "잠깐만요. 이쪽은 장비 번호가 다른데, 한데 묶어도 괜찮겠습니까?",
                "pose": "inspect",
                "look": "desk",
                "pause": 350
            }
        ]
    },
    "room": {
        "kind": "test-hall",
        "W": 10.4,
        "D": 10.2,
        "H": 4.4
    },
    "spawn": {
        "pos": [
            0,
            1.62,
            2.7
        ],
        "yaw": 3.141592653589793,
        "pitch": -0.18
    },
    "door": {
        "pos": [
            2.4,
            0,
            -5.1
        ],
        "width": 1.3,
        "height": 2.5
    },
    "npcPath": {
        "doorway": [
            2.4,
            0,
            -4.6
        ],
        "stand": [
            1.4,
            0,
            -0.55
        ],
        "work": [
            2,
            0,
            -1.65
        ],
        "aside": [
            1.65,
            0,
            -2.35
        ]
    },
    "lookPoints": {
        "desk": [
            0.12,
            0.83,
            0.72
        ],
        "board": [
            -1.6,
            1.7,
            -3.8
        ],
        "bench": [
            2.9,
            1.1,
            -0.55
        ],
        "cabinet": [
            -2.8,
            0.8,
            -0.7
        ]
    },
    "roomObjects": {
        "bench": [
            2.9,
            0,
            -0.55
        ],
        "cabinet": [
            -2.8,
            0,
            -0.7
        ],
        "benchSupport": true
    },
    "models": [
        {
            "id": "desk",
            "path": "stage2/rooms/painted_wooden_table.glb",
            "pos": [
                0,
                0,
                0.65
            ],
            "fitHeight": 0.82,
            "solid": true
        },
        {
            "id": "bench-support",
            "path": "stage2/rooms/WoodenTable_03.glb",
            "pos": [
                2.9,
                0,
                -0.55
            ],
            "fitHeight": 0.82,
            "solid": true
        },
        {
            "id": "board",
            "path": "standing_chalkboard_01/standing_chalkboard_01.gltf",
            "pos": [
                -1.6,
                0,
                -3.8
            ],
            "fitHeight": 2.55,
            "solid": true
        },
        {
            "id": "parts-rack",
            "path": "stage2/rooms/worn_metal_rack.glb",
            "pos": [
                4.25,
                0,
                -3.65
            ],
            "fitHeight": 2.05,
            "solid": true
        },
        {
            "id": "lamp-left",
            "path": "stage2/rooms/hanging_industrial_lamp.glb",
            "pos": [
                -2.8,
                3.02,
                -2.4
            ],
            "fitHeight": 1.35
        },
        {
            "id": "lamp-right",
            "path": "stage2/rooms/hanging_industrial_lamp.glb",
            "pos": [
                2.8,
                3.02,
                -2.4
            ],
            "fitHeight": 1.35
        },
        {
            "id": "stool-a",
            "path": "stage2/rooms/painted_wooden_stool.glb",
            "pos": [
                -1.5,
                0,
                0.25
            ],
            "fitHeight": 0.58,
            "solid": true
        },
        {
            "id": "stool-b",
            "path": "stage2/rooms/painted_wooden_stool.glb",
            "pos": [
                -0.9,
                0,
                -1.2
            ],
            "rot": [
                0,
                0.3,
                0
            ],
            "fitHeight": 0.58,
            "solid": true
        },
        {
            "id": "stool-c",
            "path": "stage2/rooms/painted_wooden_stool.glb",
            "pos": [
                0.35,
                0,
                -1.25
            ],
            "rot": [
                0,
                -0.3,
                0
            ],
            "fitHeight": 0.58,
            "solid": true
        },
        {
            "id": "stool-d",
            "path": "stage2/rooms/painted_wooden_stool.glb",
            "pos": [
                1.7,
                0,
                0.35
            ],
            "fitHeight": 0.58,
            "solid": true
        }
    ],
    "npcModel": {
        "path": "stage2/cast/enrico.glb",
        "scale": 0.36,
        "align": "none",
        "center": false,
        "hitHeight": 1.74,
        "hitWidth": 0.64,
        "clips": {
            "idle": "HumanArmature|Man_Idle",
            "talk": "HumanArmature|Man_Idle",
            "walk": "HumanArmature|Man_Walk"
        }
    },
    "anchors": {
        "reportSlot": [
            0.12,
            0.83,
            0.72
        ],
        "stampPad": [
            -0.7,
            0.83,
            0.8
        ]
    }
  };
});
