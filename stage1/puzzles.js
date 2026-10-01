/* ============================================================================
   N1Puz — 현장 퍼즐의 순수 논리 (화면·three.js 무관, 테스트 대상)
   각 퍼즐은 "무엇을 정규화된 답 문자열로 바꿔 M.answer() 에 넘기는가"만 정한다.
   · 1장 날짜 도장 : 다섯 바퀴의 숫자 → 일기 빈칸과 같은 자리 수의 답
   · 2장 표식 붙이기: 표식 카드를 액자에 붙이는 규칙, 남는 액자
   · 3장 명단      : 종목별 자리에 아홉 이름을 순서대로 앉혀 보는 규칙
   · 4장 테이프    : 별의 깜빡임(모스 부호). 되감으면 바른 차례로, 재생하면 거꾸로 흐른다
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

  /* ── 4장: 신호 테이프 ─────────────────────────────────────────────────
     4번 테이프에는 한 점으로 무너지는 별의 깜빡임이 녹화돼 있다. 깜빡임은 모스 부호다.
     화면을 보며 되감으면(위치 e 가 0→1) 신호가 바른 차례로 흐르고, 그냥 재생하면(e 가 1→0) 시간이 거꾸로 흘러 뜻 없는 글자가 된다.
     · 신호 시간 τ = e × 길이. 그 순간 별빛이 켜져 있으면 true (tapeLamp).
     · 기록장은 점·선·쉼만 적어 줄 뿐 풀이는 하지 않는다. 부호를 글자로 읽는 표는 교실 벽(해독표)에 있다.
     · 낱말은 봉인한다. 테스트가 이상적인 관찰자(observe)로 풀어 보아 한 가지 길로만 풀림을 지킨다. */
  var TAPE_WORD = U([35, 39, 60, 202, 212, 236, 232], 97);
  var TAPE_BREAK = 3;                                /* 낱말 사이 쉼: 처음 세 글자 다음 */
  var TAPE_POINT = [0.5, 0.4];                       /* 별 (화면 비율 좌표) */
  var TAPE_UNIT = 0.34;                              /* 점 한 칸(초). 점 1 · 선 3 · 글자 안 쉼 1 · 글자 사이 3 · 낱말 사이 7 */
  var TAPE_LEAD = 3, TAPE_TAIL = 3;                  /* 앞뒤 어둠(칸) */
  var MORSE = { A: ".-", B: "-...", C: "-.-.", D: "-..", E: ".", F: "..-.", G: "--.", H: "....", I: "..", J: ".---", K: "-.-", L: ".-..", M: "--",
    N: "-.", O: "---", P: ".--.", Q: "--.-", R: ".-.", S: "...", T: "-", U: "..-", V: "...-", W: ".--", X: "-..-", Y: "-.--", Z: "--.." };
  var MORSE_BACK = (function () { var o = {}; Object.keys(MORSE).forEach(function (k) { o[MORSE[k]] = k; }); return o; })();
  function morseOf(ch) { return MORSE[String(ch).toUpperCase()] || null; }
  /* 부호 문자열("-.. / .- // …": 글자 사이 "/", 낱말 사이 "//") → 글자. 모르는 부호는 "?" */
  function morseDecode(pad) {
    return String(pad || "").trim().split(/\s*\/\/\s*/).map(function (w) {
      return w.split(/\s*\/\s*|\s+/).filter(Boolean).map(function (c) { return MORSE_BACK[c] || "?"; }).join("");
    }).join(" ");
  }
  /* 신호 구간: [{ a, b, mark, letter }] (초) 와 전체 길이 len */
  var SIGNAL = null;
  function signal() {
    if (SIGNAL) return SIGNAL;
    var segs = [], t = TAPE_LEAD * TAPE_UNIT;
    TAPE_WORD.split("").forEach(function (ch, i) {
      if (i > 0) t += (i === TAPE_BREAK ? 7 : 3) * TAPE_UNIT;
      MORSE[ch].split("").forEach(function (m, k) {
        if (k > 0) t += TAPE_UNIT;
        var d = (m === "-" ? 3 : 1) * TAPE_UNIT; segs.push({ a: t, b: t + d, mark: m, letter: i }); t += d;
      });
    });
    return (SIGNAL = { segs: segs, len: t + TAPE_TAIL * TAPE_UNIT });
  }
  function tapeLength() { return signal().len; }
  /* 위치 e(0=테이프 끝 … 1=처음)에서 별빛이 켜져 있는가 */
  function tapeLamp(e) {
    var sg = signal(), tau = clamp(e, 0, 1) * sg.len;
    for (var i = 0; i < sg.segs.length; i++) if (tau >= sg.segs[i].a && tau < sg.segs[i].b) return true;
    return false;
  }
  /* 점의 크기(1=처음에 붕괴하지 않은 별 … 0.15=끝의 한 점) */
  function tapePointSize(e) { return 1 - clamp(e, 0, 1) * 0.85; }
  /* 이상적인 관찰자: dir "rewind"(0→1, 화면을 보며 되감기) 또는 "play"(1→0)로 끝까지 보고 적은 부호. 풀이 검증용 */
  function observe(dir) {
    var sg = signal(), step = TAPE_UNIT / 8, n = Math.round(sg.len / step), runs = [], cur = null, i;
    for (i = 0; i <= n; i++) {
      var on = tapeLamp((dir === "play" ? n - i : i) / n);
      if (!cur || cur.on !== on) { cur = { on: on, n: 0 }; runs.push(cur); }
      cur.n++;
    }
    var words = [[]], letter = "";
    runs.forEach(function (r) {
      var u = r.n * step / TAPE_UNIT;
      if (r.on) letter += u >= 2 ? "-" : ".";
      else if (letter && u >= 2) { words[words.length - 1].push(letter); letter = ""; if (u >= 5) words.push([]); }
    });
    if (letter) words[words.length - 1].push(letter);
    return words.filter(function (w) { return w.length; }).map(function (w) { return w.join(" / "); }).join(" // ");
  }

  /* ── 장치 전원: 교탁 컴퓨터와 AV 카트 TV 는 쓸 때에만 켜진다 ─────────────────
     1~3장은 현장(도장·표식·명단)에서 푼다. 4~8장은 답을 컴퓨터에 넣는다(4장의 테이프는 신호를 적을 뿐이다). 탐색·편지 단계에는 필요 없다.
     여덟 조각을 모으면 탑을 쌓는다(컴퓨터는 꺼져 있다). 탑이 맞게 완성되면 이름 입력에 켜지고,
     이름을 맞힌 뒤에는 엔딩을 다시 보는 화면("done")이 된다. ctx.stackSolved: 탑이 완성되었는가 */
  var AT_COMPUTER = { 4: 1, 5: 1, 6: 1, 7: 1, 8: 1 };
  /* "off" 꺼짐(조사해도 반응이 없다) · "input" 답을 넣는 화면 · "done" 마친 뒤(엔딩 다시 보기) */
  function computerState(S, ctx) {
    if (!S) return "off";
    if (S.done || S.exitReady) return "done";
    if (S.ch > 8) return ctx && ctx.stackSolved ? "input" : "off";
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
    TAPE_WORD: TAPE_WORD, TAPE_BREAK: TAPE_BREAK, TAPE_POINT: TAPE_POINT, TAPE_UNIT: TAPE_UNIT, MORSE: MORSE, morseOf: morseOf, morseDecode: morseDecode,
    tapeSignal: signal, tapeLength: tapeLength, tapeLamp: tapeLamp, tapePointSize: tapePointSize, observe: observe
  };
});
