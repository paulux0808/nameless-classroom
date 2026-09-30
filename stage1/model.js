/* ============================================================================
   이름 없는 교실 — 게임 모델 (상태와 규칙만. DOM·three.js 무관)
   화면은 이 모델의 결과를 그린다. 옛 index.html 의 진행 엔진과 같은 규칙:
     읽기(read) → 단말기 정답 → 탐색(search) → 지점 조사 → 편지 공개(revealed) → 읽고 붙이기 → 다음 챕터
     8장 이후: 기억 조립 → 이름 → 뒷문 코드 → 완료
   ========================================================================== */
(function (root, factory) {
  var api = factory();
  if (typeof module === "object" && module.exports) module.exports = api;
  else root.N1Model = api;
})(typeof globalThis !== "undefined" ? globalThis : this, function () {
  "use strict";

  /* opts: { data, logic:{sealCode,answerCode,norm,stackOrder,finalName}, storage:{fresh}, store:{get,set,clr}, lines? }
     lines(선택): 감독교사 문구 모듈(lines.js). 있으면 HUD 목표와 힌트를 그쪽 문구로 낸다. */
  function create(opts) {
    var D = opts.data, Lg = opts.logic, St = opts.storage, store = opts.store, Ln = opts.lines || null;
    var S = Object.assign(St.fresh(), store.get() || {});
    var listeners = [];
    var M = { S: S, data: D };

    function emit(kind, detail) { listeners.slice().forEach(function (fn) { fn(kind, detail); }); }
    M.on = function (fn) { listeners.push(fn); return function () { var i = listeners.indexOf(fn); if (i >= 0) listeners.splice(i, 1); }; };
    function save() { var ok = store.set(S); emit("save", { ok: ok }); return ok; }
    M.save = save;

    M.chapter = function () { return D.CH[Math.min(S.ch, 8) - 1]; };
    M.inFinal = function () { return S.ch > 8; };
    M.hasSave = function () { var p = store.get(); return !!(p && p.started); };

    /* ── 수명 주기 ── */
    M.startNew = function () {
      store.clr();
      var f = St.fresh(); Object.keys(S).forEach(function (k) { delete S[k]; }); Object.assign(S, f);
      S.started = true; save(); emit("reset");
    };
    M.continueSaved = function () {
      var p = store.get();
      if (!p || !p.started) return false;
      Object.keys(S).forEach(function (k) { delete S[k]; }); Object.assign(S, St.fresh(), p);
      emit("reset"); return true;
    };

    /* ── 진행 ── */
    M.takeDiary1 = function () { S.tookD1 = true; save(); emit("change"); };

    /* 단말기: 읽기 단계에서만 정답을 받는다. 입력은 영숫자만. */
    M.answer = function (raw) {
      if (S.done || S.ch > 8) return { ok: false, reason: "not-now" };
      if (S.phase !== "read") return { ok: false, reason: "not-now" };
      var v = Lg.answerCode(raw);
      if (!v) return { ok: false, reason: "empty" };
      var c = M.chapter();
      if (c.h.some(function (h) { return h === Lg.sealCode(v, c.n); })) {
        S.phase = "search"; S.revealed = 0;
        if (!S.pz) S.pz = {}; S.pz["ok" + c.n] = v;             /* 맞힌 답을 남겨 두면 일기의 지워진 부분을 되살려 보여 줄 수 있다 */
        save(); emit("change"); return { ok: true, cue: c.cue };
      }
      return { ok: false, reason: "wrong" };
    };

    /* 탐색: 지금 챕터의 봉인된 지점인가 */
    M.isSpot = function (id) { var c = M.chapter(); return Lg.sealCode(id, c.n + 20) === c.spot; };
    M.canSearch = function () { return S.phase === "search" && S.ch <= 8 && !S.done; };
    M.reveal = function () {
      var n = S.ch; if (S.phase !== "search" || S.revealed === n) return null;
      S.revealed = n; save(); emit("change"); return n;
    };
    /* 공개된 편지를 읽고 칠판에 붙인다 → 조각을 얻고 다음 챕터 */
    M.finishReward = function (n) {
      if (S.revealed !== n) return false;
      if (S.pieces.indexOf(n) < 0) S.pieces.push(n);
      S.ch = n + 1; S.phase = "read"; S.revealed = 0; save(); emit("change"); return true;
    };
    /* 액자를 90° 돌린다: 신호 키는 기호 이름(없으면 과학자 id) */
    M.rotKey = function (id) { return D.SYM_OF[id] || id; };
    M.rotateFrame = function (id) {
      var key = M.rotKey(id); S.rot[key] = ((S.rot[key] || 0) + 1) % 4; save(); emit("change"); return S.rot[key];
    };
    M.frameRot = function (id) { return S.rot[M.rotKey(id)] || 0; };
    M.frameSignature = function (id) { var sym = D.SYM_OF[id]; return sym ? D.FRAME_SIG[sym] : [1, 1, 1, 1]; };

    /* 최종 조립 */
    M.ensureStack = function () { if (!S.stack) S.stack = [1, 2, 3, 4, 5, 6, 7, 8]; return S.stack; };
    M.swapStack = function (a, b) {
      var st = M.ensureStack(); if (a < 0 || b < 0 || a > 7 || b > 7 || M.stackSolved()) return false;
      var t = st[a]; st[a] = st[b]; st[b] = t; save(); emit("change"); return true;
    };
    M.stackSolved = function () { return !!S.stack && S.stack.join(",") === Lg.stackOrder().join(","); };
    M.submitFinal = function (raw) {
      var v = Lg.answerCode(raw); if (!v) return { ok: false, reason: "empty" };
      if (v !== Lg.norm(Lg.finalName())) return { ok: false, reason: "wrong" };
      S.exitReady = true; save(); emit("change"); return { ok: true };
    };
    M.submitExitCode = function (raw) {
      if (String(raw) !== "0808") return { ok: false, reason: "wrong" };
      S.done = true; save(); emit("change"); return { ok: true };
    };

    /* ── 퍼즐 진행(현장 상호작용의 중간 상태)과 맞힌 답 ── */
    M.pz = function (key) { return (S.pz && S.pz[key]) || null; };
    M.pzSet = function (key, val) { if (!S.pz) S.pz = {}; S.pz[key] = val; save(); emit("pz", { key: key }); };
    M.solvedAnswer = function (n) { return (S.pz && S.pz["ok" + n]) || null; };
    M.isSolved = function (n) { return S.ch > n || (S.ch === n && (S.phase === "search")); };

    /* ── 힌트: 범위마다 1→2→3단계. 저장된다 ── */
    M.hintScope = function () { return Ln ? Ln.hintScope(S, { stackSolved: M.stackSolved() }) : null; };
    M.hintTier = function (scope) { return (S.hints && S.hints[scope]) || 0; };
    /* 다음 단계 힌트를 준다. 없으면 { none:true, reason } */
    M.hint = function () {
      if (!Ln) return { none: true, reason: "no-lines" };
      var scope = M.hintScope();
      if (!scope) return { none: true, reason: "not-now" };
      var used = M.hintTier(scope);
      if (used >= 3) return { none: true, reason: "max", scope: scope };
      var tier = used + 1, text = Ln.hintText(scope, tier);
      if (!text) return { none: true, reason: "missing", scope: scope };
      if (!S.hints) S.hints = {};
      var first = !Object.keys(S.hints).length;
      S.hints[scope] = tier; save(); emit("hint", { scope: scope, tier: tier });
      return { ok: true, scope: scope, tier: tier, text: text, first: first };
    };
    M.hintsUsed = function () { var n = 0; Object.keys(S.hints || {}).forEach(function (k) { n += S.hints[k]; }); return n; };
    /* 한 번만 하는 말: 이미 했으면 false, 처음이면 기록하고 true */
    M.sayOnce = function (key) { if (!S.said) S.said = {}; if (S.said[key]) return false; S.said[key] = 1; save(); return true; };

    /* ── HUD 문구: 옛 renderHUD 와 같은 내용 ── */
    M.hud = function () {
      var pieces = []; for (var i = 1; i <= 8; i++) pieces.push(S.pieces.indexOf(i) >= 0);
      var o = { pieces: pieces };
      if (S.done) { o.kicker = "COMPLETE"; o.title = "스테이지 완료"; o.objective = { main: Lg.finalName() + " · 스티븐 호킹 스테이지 완료" }; return o; }
      if (S.exitReady) { o.kicker = "FINAL EXIT"; o.title = "마지막 문"; o.objective = { main: "뒷문을 조사하세요.", hint: "코드를 입력하시면 나갈 수 있습니다." }; return o; }
      if (S.ch > 8) { o.kicker = "FINAL"; o.title = "기억을 쌓다"; o.objective = Ln ? Ln.goal(S, { stackSolved: M.stackSolved() }) : null; return o; }
      var c = M.chapter();
      o.kicker = "CHAPTER " + c.n; o.title = c.title;
      if (S.revealed === c.n) o.objective = { hint: "드러난 편지를 눌러 읽으세요." };
      else if (S.phase === "search") o.objective = { hint: "“" + c.cue + "”" };
      else o.objective = null;
      /* 감독교사 문구가 있으면 목표를 더 구체적으로 낸다(탐색 단계는 단서를 그대로 보여 준다) */
      if (Ln && S.phase === "read") { var g = Ln.goal(S, { stackSolved: M.stackSolved() }); if (g) o.objective = g; }
      else if (Ln && S.phase === "search" && S.revealed !== c.n) { var g2 = Ln.goal(S, {}); if (g2) o.objective = { main: g2.main, hint: "“" + c.cue + "”" }; }
      return o;
    };
    return M;
  }
  return { create: create };
});
