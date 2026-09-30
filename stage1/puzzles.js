/* ============================================================================
   N1Puz — 현장 퍼즐의 순수 논리 (화면·three.js 무관, 테스트 대상)
   각 퍼즐은 "무엇을 정규화된 답 문자열로 바꿔 M.answer() 에 넘기는가"만 정한다.
   · 1장 날짜 도장 : 다섯 바퀴의 숫자 → 일기 빈칸과 같은 자리 수의 답
   · 2장 표식 붙이기: 표식 카드를 액자에 붙이는 규칙, 남는 액자
   · 3장 명단      : 종목별 자리에 아홉 이름을 순서대로 앉혀 보는 규칙
   · 4장 테이프    : 되감을 때 글자가 한 점에서 튀어나오는 시간표
   정답 낱말은 평문으로 두지 않는다(U 봉인). data.js 의 내용은 여기서 바꾸지 않는다.
   ========================================================================== */
(function (root, factory) {
  var U = (root && root.U) || (typeof require === "function" ? require("./logic.js").U : null);
  var api = factory(U);
  if (typeof module === "object" && module.exports) module.exports = api;
  else root.N1Puz = api;
})(typeof globalThis !== "undefined" ? globalThis : this, function (U) {
  "use strict";
  function clamp(v, a, b) { return v < a ? a : v > b ? b : v; }

  /* ── 1장: 날짜 도장 ──────────────────────────────────────────────────
     일기 첫 줄은 "1 ? ? ? 년 ? 월 ? 일" 이다. 앞의 '1' 은 인쇄돼 있으니 빈칸은 다섯 칸(년 3 + 월 1 + 일 1). */
  var STAMP = { prefix: "1", year: 3, month: 1, day: 1, wheels: 5 };
  function stampAnswer(digits) {
    if (!Array.isArray(digits) || digits.length !== STAMP.wheels) return null;
    for (var i = 0; i < digits.length; i++) if (!Number.isInteger(digits[i]) || digits[i] < 0 || digits[i] > 9) return null;
    return digits.join("");
  }
  /* 일기 첫 줄의 빈칸을 answer(문자열)로 채운 표시용 조각들: [{blank:bool, text}] — 복원된 날짜를 그릴 때 쓴다 */
  function dateParts(answer) {
    var a = String(answer || ""), i = 0, out = [];
    out.push({ blank: false, text: STAMP.prefix });
    for (var k = 0; k < STAMP.year; k++) out.push({ blank: true, text: a.charAt(i++) });
    out.push({ blank: false, text: "년 " }); out.push({ blank: true, text: a.charAt(i++) });
    out.push({ blank: false, text: "월 " }); out.push({ blank: true, text: a.charAt(i++) });
    out.push({ blank: false, text: "일" });
    return out;
  }

  /* ── 2장: 표식 카드 ↔ 액자 ────────────────────────────────────────── */
  var SYMBOLS = ["apple", "sun", "sqrt", "compass", "pi"];
  /* 이 액자에 이 표식이 맞는가. data: N1Data */
  function stickerFits(data, frameId, sym) { return !!(data && data.SYM_OF && data.SYM_OF[frameId] === sym); }
  /* placed: { 표식: 액자 id } (맞게 붙은 것만 저장한다) → 진행 요약 */
  function stickerState(data, placed) {
    placed = placed || {};
    var correct = 0;
    SYMBOLS.forEach(function (sym) { if (placed[sym] && stickerFits(data, placed[sym], sym)) correct++; });
    var spare = null;
    (data.SCI || []).forEach(function (s) { if (!s.sym) spare = s.id; });
    var used = {}; Object.keys(placed).forEach(function (sym) { used[placed[sym]] = 1; });
    return { correct: correct, total: SYMBOLS.length, done: correct === SYMBOLS.length, spare: spare, usedFrames: Object.keys(used) };
  }
  /* 카드를 액자에 붙여 본다. 맞으면 placed 를 새로 만들어 돌려준다 */
  function stickerPlace(data, placed, sym, frameId) {
    if (SYMBOLS.indexOf(sym) < 0) return { ok: false, reason: "no-such-card", placed: placed };
    if (placed && placed[sym]) return { ok: false, reason: "already", placed: placed };
    if (placed) for (var k in placed) if (placed[k] === frameId) return { ok: false, reason: "occupied", placed: placed };
    if (!stickerFits(data, frameId, sym)) return { ok: false, reason: "wrong", placed: placed };
    var next = {}; Object.keys(placed || {}).forEach(function (k) { next[k] = placed[k]; }); next[sym] = frameId;
    return { ok: true, placed: next };
  }

  /* ── 3장: 명단 ────────────────────────────────────────────────────── */
  /* 일기 3편에 적힌 팀 명단(순서 그대로). tests/puzzles.test.mjs 가 일기 본문과 같은지 지킨다 */
  var ROSTER = ["대니얼", "존", "드레이먼트", "케빈", "제임스", "크리스", "하워드", "앤써니", "나"];
  /* roles: 종목의 자리 이름들, roster: 앉힐 이름들. 이름을 자리 순서대로 앉힌다 */
  function rosterFit(roles, roster) {
    roster = roster || ROSTER;
    var slots = roles.map(function (role, i) { return { role: role, name: i < roster.length ? roster[i] : null }; });
    var empty = Math.max(0, roles.length - roster.length), extra = roster.slice(roles.length), exact = empty === 0 && extra.length === 0;
    return { slots: slots, empty: empty, extra: extra, exact: exact, me: exact ? slots[slots.length - 1] : null };
  }

  /* ── 4장: 테이프 ──────────────────────────────────────────────────── */
  var TAPE_WORD = U([35, 39, 60, 202, 212, 236, 232], 97);
  /* i 번째로 튀어나오는 글자가 내려앉는 칸(왼쪽부터 0). 칸 순서로 읽으면 뒤섞인다 */
  var TAPE_SLOT = [3, 6, 1, 4, 0, 5, 2];
  var TAPE_POINT = [0.5, 0.4];                       /* 한 점 (화면 비율 좌표) */
  function tapeSlotXY(slot) { return [0.1 + slot * (0.8 / 6), 0.8]; }
  var TAPE_FIRST = 0.07, TAPE_STEP = 0.115, TAPE_FLIGHT = 0.2;
  function ease(k) { return k * k * (3 - 2 * k); }
  /* 되감기 진행 e(0=끝의 한 점, 1=처음). 글자마다 상태를 돌려준다 */
  function tapeFrame(e) {
    e = clamp(e, 0, 1);
    var out = [];
    for (var i = 0; i < TAPE_WORD.length; i++) {
      var start = TAPE_FIRST + i * TAPE_STEP, raw = clamp((e - start) / TAPE_FLIGHT, 0, 1), k = ease(raw);
      var s = tapeSlotXY(TAPE_SLOT[i]), p = TAPE_POINT, c = [(p[0] + s[0]) / 2 + (s[0] - p[0]) * 0.1, 0.1];
      var x = (1 - k) * (1 - k) * p[0] + 2 * (1 - k) * k * c[0] + k * k * s[0], y = (1 - k) * (1 - k) * p[1] + 2 * (1 - k) * k * c[1] + k * k * s[1];
      out.push({ i: i, ch: TAPE_WORD.charAt(i), slot: TAPE_SLOT[i], k: k, phase: raw <= 0 ? "hidden" : raw >= 1 ? "landed" : "flying", x: x, y: y });
    }
    return out;
  }
  /* 점의 크기(1=처음에 붕괴하지 않은 별 … 0.15=끝의 한 점) */
  function tapePointSize(e) { return 1 - clamp(e, 0, 1) * 0.85; }
  /* 재생(→) 방향은 같은 시간표를 거꾸로 돈다: e 를 줄이면 글자가 슬롯에서 한 점으로 떨어진다 */
  function tapeOrderFallen() { var o = []; for (var i = TAPE_WORD.length - 1; i >= 0; i--) o.push(TAPE_WORD.charAt(i)); return o.join(""); }

  /* ── 장치 전원: 교탁 컴퓨터와 AV 카트 TV 는 쓸 때에만 켜진다 ─────────────────
     1~4장은 현장(도장·표식·명단·테이프)에서 푼다. 5~8장은 답을 컴퓨터에 넣는다. 탐색·편지 단계에는 필요 없다.
     여덟 조각을 모으면 조립·이름 입력에 다시 켜지고, 이름을 맞힌 뒤에는 엔딩을 다시 보는 화면("done")이 된다. */
  var AT_COMPUTER = { 5: 1, 6: 1, 7: 1, 8: 1 };
  /* "off" 꺼짐(조사해도 반응이 없다) · "input" 답을 넣는 화면 · "done" 마친 뒤(엔딩 다시 보기) */
  function computerState(S) {
    if (!S) return "off";
    if (S.done || S.exitReady) return "done";
    if (S.ch > 8) return "input";
    return S.phase === "read" && AT_COMPUTER[S.ch] ? "input" : "off";
  }
  /* TV: 4장(테이프)과 6장(영상)을 풀 때만 켜진다 */
  function tvOn(S) {
    return !!S && !S.done && !S.exitReady && S.ch <= 8 && S.phase === "read" && (S.ch === 4 || S.ch === 6);
  }

  /* ── 기억 복원: 맞힌 장의 일기에서 검게 지워졌던 낱말(봉인) ── */
  var RESTORE = { 2: U([50485,50950,49667,53336,51165],113), 4: U([48698,48329],127) };

  return {
    RESTORE: RESTORE,
    STAMP: STAMP, stampAnswer: stampAnswer, dateParts: dateParts,
    SYMBOLS: SYMBOLS, stickerFits: stickerFits, stickerState: stickerState, stickerPlace: stickerPlace,
    ROSTER: ROSTER, rosterFit: rosterFit,
    computerState: computerState, tvOn: tvOn,
    TAPE_WORD: TAPE_WORD, TAPE_SLOT: TAPE_SLOT, TAPE_POINT: TAPE_POINT, tapeFrame: tapeFrame, tapeSlotXY: tapeSlotXY, tapePointSize: tapePointSize, tapeOrderFallen: tapeOrderFallen
  };
});
