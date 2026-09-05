/* CH02 — a condition-routing puzzle. All equipment and test rules are fictional. */
(function (root, factory) {
  var chapter = factory();
  if (typeof module === 'object' && module.exports) module.exports = chapter;
  if (root) { root.N2_CHAPTERS = root.N2_CHAPTERS || {}; root.N2_CHAPTERS.ch02 = chapter; }
})(typeof globalThis !== 'undefined' ? globalThis : this, function () {
  'use strict';
  return {
    id: 'ch02', number: 2, npc: 'ENRICO', title: '모두가 맞을 수는 없다',
    subtitle: '공동 검토실', puzzleType: 'conditions', opening: 'meeting',
    progress: { entry: 8, exit: 19 },
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
    reasons: [
      { id: 'edition', label: '적용 규정이 다르다' },
      { id: 'wait', label: '안정화 시간이 부족하다' },
      { id: 'repeats', label: '기록 횟수가 부족하다' },
      { id: 'valid', label: '당시 조건을 충족한다' }
    ],
    teams: [
      { id: 'a', name: 'A팀', role: '운전 담당', equipment: 'K-2', date: '11-12', filed: '11월 12일', rule: 'A', wait: 10, repeats: 3, source: 'change',
        quote: '지난번과 같은 절차로 끝냈습니다. 장비가 바뀌었어도 비교하려면 같은 조건이어야 하지 않습니까?',
        note: '11월 12일 09:00 시작. 09:10부터 세 차례 기록. 표지에 S-12 개정 A를 기입했다.', pos: [-2.25, 0, -.2], color: 0x6b7c89 },
      { id: 'b', name: 'B팀', role: '관찰 담당', equipment: 'K-2', date: '11-12', filed: '11월 12일', rule: 'B', wait: 10, repeats: 5, source: 'change',
        quote: '새 규정은 받았습니다. 다섯 번 모두 기록했고요. 시작 전 대기 시간은 늘 하던 대로 잡았습니다.',
        note: '11월 12일 10:00 시작. 10:10부터 다섯 차례 기록. 표지에 S-12 개정 B를 기입했다.', pos: [-2.25, 0, -1.9], color: 0x8a7662 },
      { id: 'c', name: 'C팀', role: '기록 담당', equipment: 'K-1', date: '11-07', filed: '11월 12일', rule: 'A', wait: 10, repeats: 3, source: 'archive',
        quote: '봉투 날짜를 보고 다시 쓰라고 하더군요. 하지만 그날은 기록실에서 이 방으로 옮긴 날입니다.',
        note: '원기록: 11월 7일 14:00 시작. K-1. 14:10부터 세 차례 기록. S-12 개정 A. 봉투 접수: 11월 12일.', pos: [2.25, 0, -1.9], color: 0x788271 },
      { id: 'd', name: 'D팀', role: '시험 담당', equipment: 'K-2', date: '11-12', filed: '11월 12일', rule: 'B', wait: 20, repeats: 3, source: 'change',
        quote: '새 장비는 충분히 기다렸습니다. 값도 차분했죠. 세 번째 기록까지 같아서 거기서 끝냈습니다.',
        note: '11월 12일 11:00 시작. 11:20부터 세 차례 기록. 표지에 S-12 개정 B를 기입했다.', pos: [2.25, 0, -.2], color: 0x8b716e }
    ],
    lines: {
      submission: [
        { who: 'A팀', text: '지난번과 같은 조건이어야 비교할 수 있습니다.' },
        { who: 'B팀', text: '하지만 이번에는 새 규정이 내려왔잖습니까.' },
        { who: 'C팀', text: '제 봉투는 오늘 시험한 것이 아닙니다.' },
        { who: 'D팀', text: '그러니까, 어디까지 다시 하라는 겁니까?' },
        '박사님. 네 팀 모두 자기 조건이 옳다고 합니다.',
        '같은 방에서 시험했다고 같은 기준을 붙일 수 있을까요? 작업대의 배정표를 맡아 주십시오.',
        '규정과 실제 시험 날짜를 확인하고, 각 기록을 보존할지 재시험할지 정해 주시면 됩니다.'
      ],
      probing: ['표지의 날짜와 실제 시험 날짜가 같다고 단정하지 마십시오. 규정함에 원기록과 인계 대장이 있습니다.'],
      conceded: ['그 규정은 지난 시험에서도 사용했습니다.', '……교체 날짜가 여기 있군요. 조건이 바뀌었는데 기준은 그대로였군요.', 'C팀의 과거 기록은 그대로 남기고, 나머지는 새 조건으로 다시 시험하겠습니다.'],
      rejected: ['반려, 접수했습니다. 이번에는 시작 전에 조건부터 맞춥시다.', '작업대에 재시험 지시서를 펼쳐 두겠습니다. 대기 시간과 기록 횟수를 정해 주십시오.'],
      revised: ['재시험 조건은 박사님이 지시해 주십시오. 각 팀의 새 기록이 돌아오면 직접 대조해 주시고요.'],
      revisedAgain: ['실행했다는 사실만으로 통과는 아닙니다. 반환된 기록이 기준을 충족하는지 확인해 주십시오.'],
      approved: [
        { who: 'A팀', text: '다음번에는 장비 번호부터 확인하겠습니다.' },
        { who: 'C팀', text: '옛 기록도 남길 자리가 있군요.' },
        '이제 같은 조건으로 얻은 결과끼리 비교할 수 있습니다.',
        '수고하셨습니다, 박사님. 옆 구역에서도 작업을 시작하겠군요.'
      ],
      done: ['기준서는 시험대 옆에 두겠습니다. 필요할 때 바로 볼 수 있도록요.']
    },
    room: { W: 7, D: 8, H: 3.1 },
    door: { pos: [0, 0, -4], width: 1.1, height: 2.2 },
    npcPath: { doorway: [0, 0, -3.55], stand: [0, 0, -2.35] },
    models: [
      { id: 'desk', path: 'metal_office_desk/metal_office_desk.gltf', pos: [0, 0, .3], rot: [0, Math.PI, 0], fitHeight: .76, solid: true },
      { id: 'board', path: 'standing_chalkboard_01/standing_chalkboard_01.gltf', pos: [-2.7, 0, -3.1], rot: [0, .55, 0], fitHeight: 1.8, solid: true },
      { id: 'shelf', path: 'wooden_bookshelf_worn/wooden_bookshelf_worn.gltf', pos: [2.65, 0, -3.2], fitHeight: 1.8, solid: true },
      { id: 'lamp', path: 'desk_lamp_arm_01/desk_lamp_arm_01.gltf', pos: [.55, 0, .03], fitHeight: .4, restOn: 'desk' },
      { id: 'cabinet', path: 'metal_tool_chest/metal_tool_chest.gltf', pos: [-2.85, 0, 2.3], rot: [0, 1.57, 0], fitHeight: .9, solid: true },
      { id: 'radio', path: 'vintage_radio_transceiver/vintage_radio_transceiver.gltf', pos: [-2.85, 0, 2.3], fitWidth: .4, restOn: 'cabinet' },
      { id: 'books', path: 'books/book_encyclopedia_set_01.gltf', pos: [0, 0, 0], fitWidth: .5, shelfOf: 'shelf', shelf: 1 }
    ],
    npcModel: { path: 'teacher/teacher.glb', scale: 1, align: 'none', clips: { idle: 'Rig|idle', talk: 'Rig|cycle_talking', walk: 'Rig|walk' } },
    anchors: { reportSlot: [.3, .775, .2], stampPad: [-.62, .775, .25] }
  };
});
