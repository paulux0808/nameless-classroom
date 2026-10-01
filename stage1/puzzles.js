/* ============================================================================
   N1Puz — 현장 퍼즐의 순수 논리 (화면·three.js 무관, 테스트 대상)
   각 퍼즐은 "무엇을 정규화된 답 문자열로 바꿔 M.answer() 에 넘기는가"만 정한다.
   · 1장 날짜 도장 : 다섯 바퀴의 숫자 → 일기 빈칸과 같은 자리 수의 답
   · 2장 액자 뒷면 : 종이의 기호 순서대로 주인 액자의 뒷면 글자를 이어 읽는다
   · 3장 명단      : 팀 명단(아홉 이름). 종목은 포지션을 세어 스스로 가린다
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

  /* ── 2장: 액자 뒷면 ───────────────────────────────────────────────────
     아이는 "액자를 더 자세히 보세요" 라고 했다. 액자를 들여다보면 뒷판에 글자 쪽지가 붙어 있다.
     종이 한 장에는 기호 다섯 개가 순서대로 적혀 있다. 각 기호의 주인(설명판 본문에서 찾는다) 액자의 뒷면 글자를
     종이의 순서대로 이어 읽으면 낱말이 된다. 기호가 없는 여섯째 액자의 쪽지는 이어 읽는 글에 들어가지 않는다.
     낱말은 봉인한다. 테스트가 설명판 본문에서 주인이 하나로 정해지는지, 이어 읽기가 정답과 같은지 지킨다. */
  var BACK_WORD = U([2, 29, 47, 61, 47, 205, 220, 236], 71);
  var BACK_SPLIT = [2, 1, 2, 2, 1];                  /* 종이의 기호 순서대로 뒷면 쪽지의 글자 수 */
  var BACK_DECOY = U([80, 105], 29);                 /* 기호 없는 액자의 쪽지(이어 읽지 않는다) */
  /* 종이에서 기호가 처음 나오는 순서(위에서 아래로, 타일 안에서는 왼쪽·위부터) */
  function sheetOrder(data) {
    var seen = {}, out = [];
    ((data && data.SHEET) || []).forEach(function (t) { [t.a, t.b].forEach(function (c) { if (c && !seen[c[0]]) { seen[c[0]] = 1; out.push(c[0]); } }); });
    return out;
  }
  /* 액자 뒷면의 쪽지 글자 */
  function frameBack(data, frameId) {
    var sym = data && data.SYM_OF && data.SYM_OF[frameId], order = sheetOrder(data), i = order.indexOf(sym);
    if (!sym || i < 0) return BACK_DECOY;
    var from = 0; for (var k = 0; k < i; k++) from += BACK_SPLIT[k];
    return BACK_WORD.substr(from, BACK_SPLIT[i]);
  }
  /* 종이의 순서대로 주인 액자의 뒷면을 이어 읽은 글(풀이 검증용). 주인은 SYM_OF 로 정해져 있다 */
  function backReading(data) {
    var owner = {}; Object.keys(data.SYM_OF).forEach(function (id) { owner[data.SYM_OF[id]] = id; });
    return sheetOrder(data).map(function (sym) { return frameBack(data, owner[sym]); }).join("");
  }
  /* 설명판 본문에서 기호의 주인을 찾는 열쇠말(풀이 검증용 — 화면은 쓰지 않는다) */
  var SYM_WORDS = { apple: ["사과"], sun: ["태양"], sqrt: ["제곱근"], compass: ["컴퍼스"], pi: ["원주율", "π"] };

  /* ── 3장: 명단 ────────────────────────────────────────────────────── */
  /* 일기 3편에 적힌 팀 명단(순서 그대로). tests/puzzles.test.mjs 가 일기 본문과 같은지 지킨다.
     클립보드는 명단을 보여 줄 뿐이다. 어느 종목인지는 종목 자료의 포지션을 세어 스스로 가린다(자리에 앉혀 주지 않는다). */
  var ROSTER = ["대니얼", "존", "드레이먼트", "케빈", "제임스", "크리스", "하워드", "앤써니", "나"];

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
     1장은 날짜 도장(찍는 것이 곧 제출)이다. 2~8장은 현장에서 단서를 모아 답을 컴퓨터에 넣는다(액자·명단·테이프는 읽고 적을 뿐이다). 탐색·편지 단계에는 필요 없다.
     여덟 조각을 모으면 탑을 쌓는다(컴퓨터는 꺼져 있다). 탑이 맞게 완성되면 이름 입력에 켜지고,
     이름을 맞힌 뒤에는 엔딩을 다시 보는 화면("done")이 된다. ctx.stackSolved: 탑이 완성되었는가 */
  var AT_COMPUTER = { 2: 1, 3: 1, 4: 1, 5: 1, 6: 1, 7: 1, 8: 1 };
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
    BACK_SPLIT: BACK_SPLIT, sheetOrder: sheetOrder, frameBack: frameBack, backReading: backReading, SYM_WORDS: SYM_WORDS,
    ROSTER: ROSTER,
    computerState: computerState, tvOn: tvOn,
    TAPE_WORD: TAPE_WORD, TAPE_BREAK: TAPE_BREAK, TAPE_POINT: TAPE_POINT, TAPE_UNIT: TAPE_UNIT, MORSE: MORSE, morseOf: morseOf, morseDecode: morseDecode,
    tapeSignal: signal, tapeLength: tapeLength, tapeLamp: tapeLamp, tapePointSize: tapePointSize, observe: observe
  };
});
