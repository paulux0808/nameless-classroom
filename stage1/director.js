/* ============================================================================
   N1Director — 감독교사가 언제 무슨 말을 할지 정한다.
   모델(M)의 상태와 lines.js 의 문구를 보고 UI.say 로 내보낼 뿐, 규칙은 모른다.
   · 진행의 마디(입장·오답·정답·편지·조각 붙임·조립·이름)마다 한 마디씩.
   · 같은 말이 연달아 나오지 않게 고른다. 한 번만 할 말은 저장한다(M.sayOnce).
   · 오래 진전이 없으면 한 번 말을 걸고 힌트 단추를 깜빡인다.
   ========================================================================== */
(function (root) {
  "use strict";

  function create(o) {
    var M = o.model, Ln = o.lines, UI = o.ui, rnd = o.random || Math.random;
    var last = {}, wrongN = {}, nudged = {}, idle = 0, D = {};
    var NUDGE_AFTER = 150;                                 /* 초. 이만큼 진전이 없으면 말을 건다 */

    function one(pool, key) { var t = Ln.pick(pool, last[key], rnd); last[key] = t; return t; }
    /* 기분(mood): calm 담담 · glad 흐뭇 · puzzled 갸웃 · grave 진지 — 얼굴 표정으로 나타난다 */
    function speak(lines, opt) { UI.say(lines, opt); }

    D.begin = function (isNew) { idle = 0; speak(isNew ? Ln.SAY.enter : Ln.SAY.resume, { replace: true, mood: "calm" }); };
    D.diary1 = function () { if (M.sayOnce("diary1")) speak(Ln.SAY.diary1, { mood: "calm" }); };

    D.wrong = function (n) {
      wrongN[n] = (wrongN[n] || 0) + 1;
      if (wrongN[n] % 3 === 0) { speak(Ln.SAY.wrongMany, { replace: true, mood: "puzzled" }); UI.nudgeHint(true); }
      else speak([one(Ln.SAY.wrong, "wrong")], { replace: true, mood: "puzzled" });
    };
    D.solved = function (n, cue) {
      wrongN[n] = 0; idle = 0; UI.nudgeHint(false);
      speak([].concat(Ln.SAY.solved[n] || [], Ln.fmt(Ln.SAY.cue, { cue: cue })), { replace: true, mood: "glad" });
    };
    D.letter = function () { idle = 0; speak([one(Ln.SAY.letter, "letter")], { replace: true, mood: "grave" }); };
    D.attach = function (n) { idle = 0; speak([].concat(Ln.SAY.attach[n] || [], Ln.SAY.start[n + 1] || []), { replace: true, mood: n >= 8 ? "grave" : "glad" }); };
    /* 기억의 탑: 처음 열 때(조각이 다 모였으면 쌓는 법, 아니면 탑이 무엇인지), 틀린 ‘완성’, 완성 */
    D.towerOpen = function (n) {
      if (n >= 8 && !M.stackSolved()) { if (M.sayOnce("asm")) speak(Ln.SAY.asm, { mood: "calm" }); }
      else if (n < 8 && M.sayOnce("towerFirst")) speak(Ln.SAY.towerFirst, { mood: "calm" });
    };
    var towerWrongN = 0;
    D.towerWrong = function () {
      towerWrongN++; idle = 0;
      if (towerWrongN % 3 === 0) { speak(Ln.SAY.wrongMany, { replace: true, mood: "puzzled" }); UI.nudgeHint(true); }
      else speak([one(Ln.SAY.towerWrong, "towerWrong")], { replace: true, mood: "puzzled" });
    };
    D.nameAsk = function () { if (M.sayOnce("nameAsk")) speak(Ln.SAY.nameAsk, { replace: true, mood: "grave" }); };
    D.exitReady = function () { idle = 0; speak(Ln.SAY.exitReady, { replace: true, mood: "glad" }); };
    D.done = function () { speak(Ln.SAY.done, { replace: true, mood: "glad" }); };

    /* 꺼진 컴퓨터를 눌렀을 때: 왜 꺼져 있는지와 지금 할 일을 말해 준다. 말하는 중이면 조용히 있는다 */
    D.computerOff = function () {
      if (UI.saying()) return;
      var g = Ln.goal(M.S, { stackSolved: M.stackSolved() }), out = [one(Ln.SAY.computerOff, "pc")];
      if (g && g.main) out.push(Ln.fmt(Ln.SAY.computerOffGoal, { goal: g.main }));
      speak(out, { replace: true, mood: "calm" });
    };

    /* 힌트 단추: 다음 단계를 말해 준다 */
    D.hint = function () {
      var r = M.hint();
      if (r.ok) {
        var out = []; if (r.first) out = out.concat(Ln.SAY.hintFirst);
        out.push(Ln.SAY.hintLead[r.tier]); out.push(r.text);
        idle = 0; UI.nudgeHint(false); speak(out, { replace: true, mood: "calm" });
      } else speak(r.reason === "max" ? Ln.SAY.hintNone : Ln.SAY.hintNow, { replace: true, mood: "calm" });
      if (UI.renderHint) UI.renderHint();
      return r;
    };

    /* 프레임 루프에서 부른다. blocked: 화면이 막혀 있는지(패널·인트로·엔딩…) */
    D.tick = function (dt, blocked) {
      if (blocked || UI.saying()) return;
      var scope = M.hintScope();
      if (!scope) { idle = 0; return; }
      idle += dt;
      if (idle > NUDGE_AFTER && !nudged[scope] && M.hintTier(scope) === 0) { nudged[scope] = true; speak(Ln.SAY.idle, { mood: "calm" }); UI.nudgeHint(true); }
    };
    D.progress = function () { idle = 0; };

    return D;
  }
  root.N1Director = { create: create };
})(window);
