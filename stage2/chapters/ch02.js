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
    escape: { cabinetCode: '1110', note: '규정함: 장비가 바뀐 날로 맞춰 둠. 월 두 자리, 일 두 자리. — 시설부' },
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
      { id: 'a', name: 'A팀', role: '운전 담당', equipment: 'K-2', date: '11-12', filed: '11월 12일', rule: 'A', wait: 10, repeats: 3, source: 'change',
        quote: '지난번과 같은 절차로 끝냈습니다. 장비가 바뀌었어도 비교하려면 같은 조건이어야 하지 않습니까?',
        note: 'K-2 / 11월 12일 09:00 시작. 09:10부터 세 차례 기록. 표지에 S-12 개정 A를 기입했다.', pos: [-2.25, 0, -.2], color: 0x6b7c89 },
      { id: 'b', name: 'B팀', role: '관찰 담당', equipment: 'K-2', date: '11-12', filed: '11월 12일', rule: 'B', wait: 10, repeats: 5, source: 'change',
        quote: '새 규정은 받았습니다. 다섯 번 모두 기록했고요. 시작 전 대기 시간은 늘 하던 대로 잡았습니다.',
        note: 'K-2 / 11월 12일 10:00 시작. 10:10부터 다섯 차례 기록. 표지에 S-12 개정 B를 기입했다.', pos: [-2.25, 0, -1.9], color: 0x8a7662 },
      { id: 'c', name: 'C팀', role: '기록 담당', equipment: 'K-1', date: '11-07', filed: '11월 12일', rule: 'A', wait: 10, repeats: 3, source: 'archive',
        quote: '봉투 날짜를 보고 다시 쓰라고 하더군요. 하지만 그날은 기록실에서 이 방으로 옮긴 날입니다.',
        note: '원기록: 11월 7일 14:00 시작. K-1. 14:10부터 세 차례 기록. S-12 개정 A. 봉투 접수: 11월 12일.', pos: [2.25, 0, -1.9], color: 0x788271 },
      { id: 'd', name: 'D팀', role: '시험 담당', equipment: 'K-2', date: '11-12', filed: '11월 12일', rule: 'B', wait: 20, repeats: 3, source: 'change',
        quote: '새 장비는 충분히 기다렸습니다. 값도 차분했죠. 세 번째 기록까지 같아서 거기서 끝냈습니다.',
        note: 'K-2 / 11월 12일 11:00 시작. 11:20부터 세 차례 기록. 표지에 S-12 개정 B를 기입했다.', pos: [2.25, 0, -.2], color: 0x8b716e }
    ],
    lines: {
      submission: [
        { who: 'A팀', text: '지난번과 같은 조건이어야 비교할 수 있습니다.' },
        { who: 'B팀', text: '하지만 이번에는 새 규정이 내려왔잖습니까.' },
        { who: 'C팀', text: '제 봉투는 오늘 시험한 것이 아닙니다.' },
        { who: 'D팀', text: '그러니까, 어디까지 다시 하라는 겁니까?' },
        '박사님. 네 팀 모두 자기 조건이 옳다고 합니다.',
        '여기 네 장의 작업카드가 있습니다. 각 팀에게 직접 받아 보십시오.',
        '새 시험대에 옛 조건이 남아 있는 것 같습니다. 기준판과 손잡이는 규정함에 넣어 뒀는데, 걸쇠가 잠겨 있군요.',
        '작업대에는 시설부가 남긴 메모가 있습니다. 저는 이쪽 기록을 보고 있겠습니다.'
      ],
      probing: ['메모와 명판을 함께 보십시오. 카드의 앞면과 뒷면도 다르고요.'],
      conceded: ['그 규정은 지난 시험에서도 사용했습니다.', '……교체 날짜가 여기 있군요. 조건이 바뀌었는데 기준은 그대로였군요.', 'C팀의 과거 기록은 그대로 남기고, 나머지는 새 조건으로 다시 시험하겠습니다.'],
      rejected: ['반려, 접수했습니다. C팀 원본은 보관하고 세 팀을 다시 돌리겠습니다.', '이제 시험대의 조절기를 바꿀 수 있습니다. 규정함에서 챙긴 손잡이와 기준판을 장착해 주십시오.'],
      revised: ['시험대에 기준판과 손잡이를 장착하고 조절기를 맞춰 주십시오. 손잡이를 돌리면 새 기록이 나옵니다.'],
      revisedAgain: ['출력지에 찍힌 첫 기록 시각과 횟수를 확인하십시오. 충분히 기다렸는지도요.'],
      approved: [
        { who: 'A팀', text: '다음번에는 장비 번호부터 확인하겠습니다.' },
        { who: 'C팀', text: '옛 기록도 남길 자리가 있군요.' },
        '이제 같은 조건으로 얻은 결과끼리 비교할 수 있습니다.',
        '수고하셨습니다, 박사님. 시험대의 열쇠 서랍도 열렸습니다. 출입문에 쓰시면 됩니다.'
      ],
      done: ['기준서는 시험대 옆에 두겠습니다. 필요할 때 바로 볼 수 있도록요.']
    },
    room: { W: 7, D: 8, H: 3.1 },
    door: { pos: [0, 0, -4], width: 1.1, height: 2.2 },
    npcPath: { doorway: [0, 0, -3.55], stand: [0, 0, -2.35], aside: [1.15, 0, -2.55] },
    models: [
      { id: 'desk', path: 'metal_office_desk/metal_office_desk.gltf', pos: [0, 0, .3], rot: [0, Math.PI, 0], fitHeight: .76, solid: true },
      { id: 'board', path: 'standing_chalkboard_01/standing_chalkboard_01.gltf', pos: [-2.7, 0, -3.1], rot: [0, .55, 0], fitHeight: 1.8, solid: true },
      { id: 'shelf', path: 'wooden_bookshelf_worn/wooden_bookshelf_worn.gltf', pos: [2.65, 0, -3.2], fitHeight: 1.8, solid: true },
      { id: 'lamp', path: 'desk_lamp_arm_01/desk_lamp_arm_01.gltf', pos: [.55, 0, .03], fitHeight: .4, restOn: 'desk' },
      { id: 'cabinet', path: 'metal_tool_chest/metal_tool_chest.gltf', pos: [-2.85, 0, 2.3], rot: [0, 1.57, 0], fitHeight: .9, solid: true },
      { id: 'radio', path: 'vintage_radio_transceiver/vintage_radio_transceiver.gltf', pos: [2.65, 0, -3.2], fitWidth: .4, restOn: 'shelf' },
      { id: 'books', path: 'books/book_encyclopedia_set_01.gltf', pos: [0, 0, 0], fitWidth: .5, shelfOf: 'shelf', shelf: 1 }
    ],
    npcModel: { path: 'teacher/teacher.glb', scale: 1, align: 'none', clips: { idle: 'Rig|idle', talk: 'Rig|cycle_talking', walk: 'Rig|walk' } },
    anchors: { reportSlot: [.3, .775, .2], stampPad: [-.62, .775, .25] }
  };
});
