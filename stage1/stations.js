/* ============================================================================
   N1Stations — 교실 곳곳의 "퍼즐 자리" 화면. 물건을 눌러 가까이 들여다보는 패널이다.
   · 1장 교탁의 날짜 도장 : 일기 빈칸과 같은 모양의 바퀴 다섯 개를 맞춰 찍는다
   · 2장 액자 뒷면       : 액자를 들어 뒷판의 글자 쪽지를 읽는다(어느 액자를 어떤 순서로 읽는지는 스스로 가린다)
   · 3장 명단 클립보드   : 팀 명단을 읽는다(종목은 포지션을 세어 스스로 가린다)
   · 4장 AV 카트(VCR)     : 별의 깜빡임(모스 부호)을 보며 되감고 기록장에 적는다. 답은 교탁의 컴퓨터에 입력한다
   규칙(무엇이 정답인지)은 puzzles.js 와 모델(M.answer)이 정한다. 여기는 다루는 방식과 피드백만 있다.
   ========================================================================== */
(function (root) {
  "use strict";
  var doc = root.document, el = root.N1UI.el, Puz = root.N1Puz;

  function create(o) {
    var UI = o.ui, M = o.model, D = o.data, hooks = o.hooks || {}, SC = o.screens, A = o.assets || {}, S = M.S;
    var ST = {};

    /* 정답을 맞힌 뒤 패널 아래에 놓는 "교실을 조사하러 간다" 단추 */
    function goButton(foot) {
      foot.innerHTML = "";
      var b = el("button", "btn primary", "교실을 조사하러 간다"); b.type = "button"; b.onclick = function () { UI.closeSheet(); };
      foot.appendChild(b); try { b.focus({ preventScroll: true }); } catch (e) {}
    }
    /* 일기 다시 읽기: 패널 안에서 접었다 펼친다(단서를 확인하러 교실을 왕복하지 않게) */
    function diaryFold(n) {
      var d = el("details", "item fold"); d.innerHTML = "<summary>일기 다시 읽기</summary>";
      var inner = el("div", "in"); inner.appendChild(SC.kit.diaryArticle("diary" + n, n)); d.appendChild(inner); return d;
    }

    /* ───────── 1장: 날짜 도장 ───────── */
    ST.showStamp = function () {
      var solved = M.isSolved(1), digits = [0, 0, 0, 0, 0], locked = solved;
      var prev = M.solvedAnswer(1); if (prev) digits = prev.split("").map(Number);
      UI.openSheet({ title: "날짜 도장", sub: "CHAPTER 1 · 별이 된 지 300년", mode: "center", cls: "stamp-sheet", closeText: solved ? "닫기" : undefined, build: function (b, foot, api) {
        var paper = el("div", "stamp-paper"), line = el("div", "stamp-line"), mark = el("div", "stamp-mark", "확인"), msg = el("p", "stamp-msg"), prints = el("div", "stamp-prints");
        var wheels = [];
        function fixed(t) { return el("span", "fixed", t); }
        function wheel(idx, label) {
          var w = el("div", "wheel"); w.setAttribute("role", "spinbutton"); w.tabIndex = 0;
          w.setAttribute("aria-label", label); w.setAttribute("aria-valuemin", "0"); w.setAttribute("aria-valuemax", "9");
          var up = el("button", "w-up", "▲"), dn = el("button", "w-dn", "▼"), d = el("b", "w-d", "" + digits[idx]);
          up.type = dn.type = "button"; up.setAttribute("aria-label", label + " 올리기"); dn.setAttribute("aria-label", label + " 내리기"); up.tabIndex = dn.tabIndex = -1;
          function set(v, quiet) {
            if (locked) return; digits[idx] = ((v % 10) + 10) % 10; d.textContent = "" + digits[idx]; w.setAttribute("aria-valuenow", "" + digits[idx]);
            d.classList.remove("tick"); void d.offsetWidth; d.classList.add("tick");
          }
          up.onclick = function () { set(digits[idx] + 1); w.focus(); }; dn.onclick = function () { set(digits[idx] - 1); w.focus(); };
          w.addEventListener("keydown", function (e) {
            if (locked || e.ctrlKey || e.metaKey || e.altKey) return;
            var k = e.key;
            if (k === "ArrowUp" || k === "PageUp") { set(digits[idx] + 1); e.preventDefault(); }
            else if (k === "ArrowDown" || k === "PageDown") { set(digits[idx] - 1); e.preventDefault(); }
            else if (/^[0-9]$/.test(k)) { set(+k); e.preventDefault(); e.stopPropagation(); if (wheels[idx + 1]) wheels[idx + 1].focus(); }
            else if (k === "Backspace") { set(0); e.preventDefault(); if (wheels[idx - 1]) wheels[idx - 1].focus(); }
            else if (k === "ArrowLeft" && wheels[idx - 1]) { wheels[idx - 1].focus(); e.preventDefault(); }
            else if (k === "ArrowRight" && wheels[idx + 1]) { wheels[idx + 1].focus(); e.preventDefault(); }
          });
          w.addEventListener("wheel", function (e) { if (locked) return; e.preventDefault(); set(digits[idx] + (e.deltaY < 0 ? 1 : -1)); }, { passive: false });
          w.appendChild(up); w.appendChild(d); w.appendChild(dn); w.setAttribute("aria-valuenow", "" + digits[idx]); wheels.push(w); return w;
        }
        line.appendChild(fixed(Puz.STAMP.prefix));
        ["연도 백의 자리", "연도 십의 자리", "연도 일의 자리"].forEach(function (l, i) { line.appendChild(wheel(i, l)); });
        line.appendChild(fixed("년")); line.appendChild(wheel(3, "월")); line.appendChild(fixed("월")); line.appendChild(wheel(4, "일")); line.appendChild(fixed("일"));
        paper.appendChild(line); paper.appendChild(mark); b.appendChild(paper);
        msg.textContent = solved ? "잉크가 잘 스몄다. 일기의 지워진 날짜가 돌아왔다." : "일기의 빈칸 다섯 칸에 들어갈 숫자를 맞춰 바퀴를 돌리세요.";
        b.appendChild(msg); b.appendChild(prints);
        b.appendChild(diaryFold(1));

        var stamp = el("button", "stamp-btn", solved ? "찍혔다" : "찍기"); stamp.type = "button"; stamp.disabled = solved;
        foot.appendChild(stamp);
        if (solved) { mark.classList.add("slam", "static"); wheels.forEach(function (w) { w.classList.add("locked"); }); goButton(foot); return; }

        var tries = 0;
        stamp.onclick = function () {
          if (locked) return;
          var raw = Puz.stampAnswer(digits), r = M.answer(raw);
          if (r.ok) {
            locked = true; stamp.disabled = true; stamp.textContent = "찍혔다";
            wheels.forEach(function (w) { w.classList.add("locked"); });
            mark.classList.add("slam"); msg.textContent = "쾅. 잉크가 잘 스몄다. 일기의 지워진 날짜가 돌아왔다.";
            UI.toast("암호 해제 — 단서: “" + r.cue + "”", "good");
            hooks.onAnswered && hooks.onAnswered(1);
            setTimeout(function () { goButton(foot); api.refresh(); }, 900);
          } else {
            tries++;
            var when = "1" + digits.slice(0, 3).join("") + "년 " + digits[3] + "월 " + digits[4] + "일";
            var p = el("span", "print", when); p.style.transform = "rotate(" + ((tries * 37 % 9) - 4) + "deg)"; prints.insertBefore(p, prints.firstChild);
            while (prints.children.length > 3) prints.removeChild(prints.lastChild);
            paper.classList.remove("shake"); void paper.offsetWidth; paper.classList.add("shake");
            msg.textContent = "찍힌 날짜는 " + when + ". 이 날은 아닌 것 같다.";
            hooks.onWrong && hooks.onWrong(1);
          }
        };
        setTimeout(function () { try { wheels[0].focus({ preventScroll: true }); } catch (e) {} }, 60);
      } });
    };

    /* ───────── 2장: 액자 뒷면 ─────────
       "액자를 더 자세히 보세요" — 액자를 눌러 벽에서 살짝 들면 뒷판에 글자 쪽지가 붙어 있다.
       쪽지는 읽을 뿐이다. 어느 액자의 글자를 어떤 순서로 이어 읽는지는 종이 한 장과 설명판에서 스스로 가린다. */
    ST.showFrameBack = function (id) {
      var sci = D.SCI.filter(function (x) { return x.id === id; })[0]; if (!sci) return;
      var chunk = Puz.frameBack(D, id);
      hooks.onFrameLift && hooks.onFrameLift(id, true);
      UI.openSheet({ title: "액자 뒷면", sub: sci.name + " · " + sci.en, mode: "center", cls: "frameback-sheet", build: function (b, foot, api) {
        var back = el("div", "fb-back"), note = el("div", "fb-note"), tape = el("i", "fb-tape");
        back.appendChild(el("i", "fb-wire")); back.appendChild(el("i", "fb-nail l")); back.appendChild(el("i", "fb-nail r"));
        note.appendChild(tape); note.appendChild(el("b", "fb-chunk", chunk));
        note.setAttribute("role", "img"); note.setAttribute("aria-label", "뒷판에 붙은 쪽지에 적힌 글자: " + chunk.split("").join(" "));
        back.appendChild(note); b.appendChild(back);
        b.appendChild(el("p", "mini", "액자를 벽에서 살짝 들어 뒷판을 보았다. 마스킹테이프로 쪽지가 붙어 있고, 굵은 글씨로 글자가 적혀 있다. 글씨는 아이의 것 같다."));
        var det = el("details", "item fold"); det.innerHTML = "<summary>이 액자의 설명판 보기</summary>";
        det.appendChild(el("div", "in", SC.kit.sciHTML(sci))); b.appendChild(det);
        var sheetBtn = el("button", "btn", "종이 한 장 보기"); sheetBtn.type = "button"; sheetBtn.style.marginTop = "10px";
        sheetBtn.onclick = function () { UI.closeSheet(true); setTimeout(SC.showSheet, 60); };
        b.appendChild(sheetBtn); b.appendChild(diaryFold(2));
        api.cleanup(function () { hooks.onFrameLift && hooks.onFrameLift(id, false); });
        api.refresh();
      } });
    };

    /* ───────── 3장: 명단 클립보드 ─────────
       일기 속 팀의 명단을 보여 줄 뿐이다. 이름을 자리에 앉혀 주지 않는다 — 어느 종목의 팀인지는 종목 자료의 포지션을 세어 스스로 가린다. */
    ST.showRoster = function () {
      UI.openSheet({ title: "명단 클립보드", sub: "CHAPTER 3 · 대학의 스포츠팀", mode: "center", cls: "roster-sheet", build: function (b, foot, api) {
        var paper = el("div", "roster-paper");
        paper.innerHTML = "<h4>우리 팀</h4><ol>" + Puz.ROSTER.map(function (n, i) { return "<li" + (i === Puz.ROSTER.length - 1 ? ' class="me"' : "") + ">" + n + "</li>"; }).join("") + "</ol>";
        b.appendChild(paper);
        b.appendChild(el("p", "mini", "일기 속 팀의 이름을 적은 명단이다. 한 팀이 몇 명인지, 마지막 이름이 누구인지 살펴보자. 어느 종목의 팀인지는 운동경기 자료에서 찾는다. 답은 교탁의 컴퓨터에 입력한다."));
        var det = el("details", "item fold"); det.innerHTML = "<summary>운동경기 자료 보기</summary>";
        var list = el("div", "in"); D.SPORTS.forEach(function (sp) { var d = el("details", "item"); d.innerHTML = "<summary>" + sp.name + ' <span class="en">' + sp.en + "</span></summary>"; d.appendChild(el("div", "in", SC.kit.sportHTML(sp))); list.appendChild(d); });
        det.appendChild(list); b.appendChild(det); b.appendChild(diaryFold(3));
        api.refresh();
      } });
    };

    /* ───────── 4장: VHS 신호 ─────────
       4번 테이프에는 한 점으로 무너지는 별의 깜빡임이 녹화돼 있다. 깜빡임을 눈과 귀로 읽어 기록장에 적는다.
       기록장은 적어 줄 뿐 풀이는 하지 않는다 — 부호를 글자로 읽는 표는 카트 옆 벽(해독표)에 있고, 답은 교탁의 컴퓨터에 넣는다.
       화면을 보며 되감으면(◀◀) 신호가 바른 차례로 흐르고, 재생(▶)하면 시간이 거꾸로 흐른다. */
    var TW = 640, TH = 360, STRIP = { x0: 24, x1: 616, y: 262, h: 62 }, PXS = 26 / Puz.TAPE_UNIT;     /* 기록 띠: 점 한 칸이 26px */
    var STARS = (function () { var a = [], r = 7; function rnd() { r = (r * 16807) % 2147483647; return r / 2147483647; } for (var i = 0; i < 70; i++) a.push([rnd(), rnd(), 0.5 + rnd() * 1.5]); return a; })();
    var PARTS = (function () { var a = []; for (var j = 0; j < 90; j++) a.push({ th: j * 2.399963, sp: 0.25 + ((j * 0.618) % 1) * 0.75, sz: 1 + (j % 3) * 0.6 }); return a; })();
    function tapeTime(e) { var sec = Math.round((1 - e) * 3599), m = Math.floor(sec / 60), s = sec % 60; return (m < 10 ? "0" : "") + m + ":" + (s < 10 ? "0" : "") + s; }
    /* v: { e 위치(0=끝 … 1=처음), mode stop|rew|play, tick, glow 별빛 0~1, pulses[나이], runs[{on,d0,d1}], dist 지나온 신호 길이(초) } */
    function drawTape(g, v) {
      var w = TW, h = TH, e = v.e, PT = Puz.TAPE_POINT, px = PT[0] * w, py = PT[1] * h, i;
      var bg = g.createLinearGradient(0, 0, 0, h); bg.addColorStop(0, "#03050c"); bg.addColorStop(1, "#0d1230"); g.fillStyle = bg; g.fillRect(0, 0, w, h);
      STARS.forEach(function (st) { g.fillStyle = "rgba(210,225,255," + (0.22 + st[2] * 0.18) + ")"; g.fillRect(st[0] * w, st[1] * h * 0.78, st[2], st[2]); });
      if (e > 0.003) {                                                         /* 되감을수록 한 점에서 바깥으로 퍼진다 */
        var rad = e * w * 0.7; g.strokeStyle = "rgba(255,214,150," + (0.12 + 0.4 * (1 - e)) + ")"; g.lineWidth = 2 + (1 - e) * 4;
        g.beginPath(); g.ellipse(px, py, rad, rad * 0.62, 0, 0, 6.2832); g.stroke();
        g.strokeStyle = "rgba(160,190,255," + (0.06 + 0.16 * (1 - e)) + ")"; g.lineWidth = 1.5; g.beginPath(); g.ellipse(px, py, rad * 0.62, rad * 0.62 * 0.62, 0, 0, 6.2832); g.stroke();
      }
      PARTS.forEach(function (p) {
        var r = e * p.sp * w * 0.66, x = px + Math.cos(p.th) * r, y = py + Math.sin(p.th) * r * 0.62;
        g.fillStyle = "rgba(255,236,200," + (0.7 * (1 - e * 0.55)) + ")"; g.fillRect(x, y, p.sz, p.sz);
      });
      /* 별: 깜빡임(glow)에 따라 환해진다. 켜질 때마다 고리가 번져 나간다 */
      v.pulses.forEach(function (age) { var k = age / 0.9; g.strokeStyle = "rgba(255,226,160," + (0.55 * (1 - k)) + ")"; g.lineWidth = 3 * (1 - k) + 1; g.beginPath(); g.arc(px, py, 16 + k * 120, 0, 6.2832); g.stroke(); });
      var ps = Puz.tapePointSize(e), rr = 7 + ps * 20, k2 = v.glow, gr = g.createRadialGradient(px, py, 0, px, py, rr * (1.6 + 1.6 * k2));
      gr.addColorStop(0, "rgba(255,255,255," + (0.35 + 0.65 * k2) + ")"); gr.addColorStop(0.3, "rgba(255,226,160," + (0.25 + 0.65 * k2) + ")"); gr.addColorStop(1, "rgba(255,180,90,0)");
      g.fillStyle = gr; g.beginPath(); g.arc(px, py, rr * (1.6 + 1.6 * k2), 0, 6.2832); g.fill();
      /* 기록 띠: 지금까지 본 깜빡임이 오른쪽에서 왼쪽으로 흘러간다(지나온 신호 길이 기준이라 속도와 상관없이 폭이 같다) */
      g.fillStyle = "rgba(4,12,8,.78)"; g.fillRect(STRIP.x0, STRIP.y, STRIP.x1 - STRIP.x0, STRIP.h);
      g.strokeStyle = "rgba(124,245,156,.4)"; g.lineWidth = 1; g.strokeRect(STRIP.x0 + 0.5, STRIP.y + 0.5, STRIP.x1 - STRIP.x0 - 1, STRIP.h - 1);
      var base = STRIP.y + STRIP.h - 12;
      g.strokeStyle = "rgba(124,245,156,.3)"; g.beginPath(); g.moveTo(STRIP.x0 + 4, base); g.lineTo(STRIP.x1 - 4, base); g.stroke();
      g.save(); g.beginPath(); g.rect(STRIP.x0 + 2, STRIP.y + 2, STRIP.x1 - STRIP.x0 - 4, STRIP.h - 4); g.clip();
      var off = (v.dist * PXS) % 26; g.strokeStyle = "rgba(124,245,156,.12)";
      for (i = 0; i < 26; i++) { var gx = STRIP.x1 - off - i * 26; g.beginPath(); g.moveTo(gx, STRIP.y + 6); g.lineTo(gx, base); g.stroke(); }
      g.fillStyle = "#ffd98a"; g.shadowColor = "rgba(255,200,110,.85)"; g.shadowBlur = 8;
      v.runs.forEach(function (r) { if (!r.on) return; var x0 = STRIP.x1 - (v.dist - r.d0) * PXS, x1 = STRIP.x1 - (v.dist - r.d1) * PXS; if (x1 - x0 < 1) x1 = x0 + 1; g.fillRect(x0, base - 22, x1 - x0, 20); });
      g.shadowBlur = 0; g.restore();
      g.fillStyle = "#7cf59c"; g.beginPath(); g.moveTo(STRIP.x1 - 2, STRIP.y - 7); g.lineTo(STRIP.x1 + 6, STRIP.y - 7); g.lineTo(STRIP.x1 + 2, STRIP.y - 1); g.fill();
      /* VHS 화면 효과 */
      g.fillStyle = "rgba(0,0,0,.16)"; for (i = 0; i < h; i += 3) g.fillRect(0, i, w, 1);
      if (v.mode !== "stop") { var ty = (v.tick * 230) % h; g.fillStyle = "rgba(255,255,255,.07)"; g.fillRect(0, ty, w, 12); g.fillStyle = "rgba(255,255,255,.04)"; g.fillRect(0, (ty + 140) % h, w, 5); }
      g.font = "700 20px ui-monospace,Consolas,monospace"; g.textBaseline = "top"; g.textAlign = "left"; g.fillStyle = "#7cf59c"; g.shadowColor = "rgba(124,245,156,.8)"; g.shadowBlur = 6;
      g.fillText(v.mode === "rew" ? "◀◀ REW" : v.mode === "play" ? "▶ PLAY" : "■ STOP", 18, 14); g.textAlign = "right"; g.fillText(tapeTime(e), w - 18, 14);
      g.textAlign = "left"; g.fillText("SP  TAPE 4", 18, h - 28);
      if (v.mode === "stop" && (e < 0.004 || e > 0.996)) { g.textAlign = "right"; g.fillStyle = (Math.floor(v.tick * 2) % 2) ? "#7cf59c" : "rgba(124,245,156,.35)"; g.fillText(e < 0.004 ? "테이프 끝" : "테이프 처음", w - 18, h - 28); }
      g.shadowBlur = 0;
    }
    /* 삑 소리: 별빛이 켜져 있는 동안 울린다. 브라우저가 막거나 없으면 조용히 건너뛴다 */
    function beeper() {
      var ac = null, gn = null;
      return {
        ensure: function () {
          if (ac) { if (ac.state === "suspended") { try { ac.resume(); } catch (e) {} } return true; }
          var AC = root.AudioContext || root.webkitAudioContext; if (!AC) return false;
          try { ac = new AC(); gn = ac.createGain(); gn.gain.value = 0; gn.connect(ac.destination); var os = ac.createOscillator(); os.type = "sine"; os.frequency.value = 640; os.connect(gn); os.start(); } catch (e) { ac = null; return false; }
          return true;
        },
        set: function (on) { if (ac && gn) { try { gn.gain.setTargetAtTime(on ? 0.06 : 0, ac.currentTime, 0.006); } catch (e) {} } },
        close: function () { try { if (ac) ac.close(); } catch (e) {} ac = null; gn = null; }
      };
    }
    function loadMute() { try { return root.localStorage.getItem("n1-mute") === "1"; } catch (e) { return false; } }
    function saveMute(v) { try { root.localStorage.setItem("n1-mute", v ? "1" : "0"); } catch (e) {} }

    ST.showTape = function () {
      var c = D.CH[3], solved = M.isSolved(4), saved = M.pz("c4") || {}, e = typeof saved.e === "number" ? saved.e : 0, mode = "stop", rate = 1, LEN = Puz.tapeLength();
      var pad = String(saved.pad || "").split("").filter(function (ch) { return ch === "." || ch === "-" || ch === "/"; });
      UI.openSheet({ title: "AV 카트 · VCR", sub: "CHAPTER 4 · 한 점에 대한 연구", mode: "wide", cls: "terminal tape-sheet", build: function (b, foot, api) {
        var layout = el("div", "term-layout"), left = el("div", "term-left"), right = el("div", "term-right morse-right");
        var tv = el("div", "tv"), cv = el("canvas"); cv.width = TW; cv.height = TH; tv.appendChild(cv);
        cv.setAttribute("role", "img"); cv.setAttribute("aria-label", "테이프 화면: 한 점의 별이 깜빡이고, 아래 띠에 지나온 깜빡임이 기록된다");
        var g = cv.getContext("2d"), ctl = el("div", "vcr"), jog = el("input", "jog");
        var bRew = el("button", "vb", "◀◀ 되감기"), bPlay = el("button", "vb", "▶ 재생"), bStop = el("button", "vb", "■ 정지"), bSpd = el("button", "vb ghost", "속도 ×1"), bSnd = el("button", "vb ghost", "소리 켬");
        [bRew, bPlay, bStop, bSpd, bSnd].forEach(function (x) { x.type = "button"; ctl.appendChild(x); });
        jog.type = "range"; jog.min = 0; jog.max = 1000; jog.value = Math.round(e * 1000); jog.setAttribute("aria-label", "테이프 위치 (왼쪽=끝, 오른쪽=처음)");
        var jl = el("label", "jogl"); jl.appendChild(el("span", null, "끝")); jl.appendChild(jog); jl.appendChild(el("span", null, "처음")); ctl.appendChild(jl);
        left.appendChild(tv); left.appendChild(ctl);
        left.appendChild(el("p", "mini", "테이프는 끝까지 감겨 있다. 일기 속 스케치를 떠올리고, 화면의 별을 차분히 지켜보자. 아래 띠에는 지나온 깜빡임이 남는다."));
        left.appendChild(diaryFold(4));

        /* 기록장: 본 것을 점·선·쉼으로 그대로 적는다. 맞는지는 알려 주지 않는다 */
        var padBox = el("div", "morse-pad"), padOut = el("div", "pad-out"), keys = el("div", "pad-keys");
        padBox.appendChild(el("h4", null, "기록장"));
        padBox.appendChild(padOut); padBox.appendChild(keys);
        function renderPad() { padOut.innerHTML = ""; padOut.classList.toggle("empty", !pad.length); if (pad.length) padOut.appendChild(SC.kit.padView(pad.join(""))); else padOut.textContent = "아직 적은 것이 없다"; savePad(); }
        function add(ch) { if (pad.length < 120) { pad.push(ch); renderPad(); } }
        var kDot = el("button", "key pk", "● 짧게"), kDash = el("button", "key pk", "▬ 길게"), kGap = el("button", "key pk", "｜ 쉼"), kBack = el("button", "key tool", "⌫ 지우기"), kClr = el("button", "key tool", "전체 지우기");
        [kDot, kDash, kGap, kBack, kClr].forEach(function (x) { x.type = "button"; keys.appendChild(x); });
        kDot.setAttribute("aria-label", "짧은 깜빡임(점)"); kDash.setAttribute("aria-label", "긴 깜빡임(선)"); kGap.setAttribute("aria-label", "쉼: 한 번은 글자 사이, 두 번은 낱말 사이");
        kDot.onclick = function () { add("."); }; kDash.onclick = function () { add("-"); }; kGap.onclick = function () { add("/"); };
        kBack.onclick = function () { pad.pop(); renderPad(); }; var clrArmed = 0;
        kClr.onclick = function () {
          if (pad.length > 3 && !clrArmed) { clrArmed = setTimeout(function () { clrArmed = 0; kClr.textContent = "전체 지우기"; }, 2600); kClr.textContent = "한 번 더 누르면 지움"; return; }
          clearTimeout(clrArmed); clrArmed = 0; kClr.textContent = "전체 지우기"; pad = []; renderPad();
        };
        right.appendChild(padBox);
        right.appendChild(el("p", "mini", "깜빡임을 본 대로 적는다. 글자가 끝나면 ｜ 를 한 번, 낱말이 끝나면 두 번 누른다. 부호를 글자로 읽는 표는 카트 옆 벽에 붙어 있다. 풀이한 답은 교탁의 컴퓨터에 입력한다."));
        if (solved) { right.appendChild(SC.kit.acceptedPanel(c)); goButton(foot); }
        layout.appendChild(left); layout.appendChild(right); b.appendChild(layout);
        /* 물리 키보드로도 적는다: . · - · / · Backspace */
        function onKey(ev) {
          if (ev.ctrlKey || ev.metaKey || ev.altKey) return;
          var k = ev.key, t = ev.target && ev.target.tagName;
          if (t === "INPUT" && ev.target.type !== "range") return;
          var hit = k === "." || k === "," ? "." : k === "-" || k === "_" ? "-" : k === "/" || k === "|" ? "/" : null;
          if (hit) { ev.preventDefault(); ev.stopPropagation(); add(hit); }
          else if (k === "Backspace" && t !== "INPUT") { ev.preventDefault(); ev.stopPropagation(); pad.pop(); renderPad(); }
        }
        doc.addEventListener("keydown", onKey, true);

        var bp = beeper(), mute = loadMute();
        function paintSound() { bSnd.textContent = mute ? "소리 끔" : "소리 켬"; bSnd.classList.toggle("on", !mute); bSnd.setAttribute("aria-pressed", mute ? "false" : "true"); }
        bSnd.onclick = function () { mute = !mute; saveMute(mute); if (!mute) bp.ensure(); else bp.set(false); paintSound(); };
        function setMode(m) { mode = mode === m ? "stop" : m; if (mode !== "stop" && !mute) bp.ensure(); paintBtns(); }
        function paintBtns() { bRew.classList.toggle("on", mode === "rew"); bPlay.classList.toggle("on", mode === "play"); bStop.classList.toggle("on", mode === "stop"); bSpd.textContent = "속도 ×" + (rate === 0.5 ? "½" : rate); }
        bRew.onclick = function () { setMode("rew"); }; bPlay.onclick = function () { setMode("play"); }; bStop.onclick = function () { mode = "stop"; paintBtns(); };
        bSpd.onclick = function () { rate = rate === 1 ? 0.5 : rate === 0.5 ? 2 : 1; paintBtns(); };
        var runs = [], dist = 0, pulses = [], glow = 0, lamp = false;
        jog.oninput = function () { e = clamp01(jog.value / 1000); mode = "stop"; runs = []; paintBtns(); };
        function clamp01(v) { return v < 0 ? 0 : v > 1 ? 1 : v; }
        function savePad() { M.pzSet("c4", { e: e, pad: pad.join("") }); }
        paintSound(); renderPad(); paintBtns();
        var raf = 0, last = 0, tick = 0;
        function frame(ts) {
          raf = requestAnimationFrame(frame);
          var dt = last ? Math.min((ts - last) / 1000, 0.1) : 0; last = ts; tick += dt;
          if (mode !== "stop") {
            var e0 = e, de = (mode === "rew" ? 1 : -1) * rate * dt / LEN;
            e = clamp01(e + de);
            if ((e >= 1 && mode === "rew") || (e <= 0 && mode === "play")) { mode = "stop"; paintBtns(); }
            jog.value = Math.round(e * 1000);
            var moved = Math.abs(e - e0) * LEN, on = Puz.tapeLamp(e), cur = runs[runs.length - 1];
            if (!cur || cur.on !== on) { cur = { on: on, d0: dist, d1: dist }; runs.push(cur); }
            dist += moved; cur.d1 = dist;
            while (runs.length && runs[0].d1 < dist - (STRIP.x1 - STRIP.x0) / PXS - 1) runs.shift();
          }
          var lampNow = Puz.tapeLamp(e);
          if (lampNow && !lamp && mode !== "stop") pulses.push(0);
          lamp = lampNow;
          glow += ((lamp ? 1 : 0) - glow) * Math.min(1, dt * 22);
          for (var i = pulses.length - 1; i >= 0; i--) { pulses[i] += dt; if (pulses[i] > 0.9) pulses.splice(i, 1); }
          bp.set(lamp && mode !== "stop" && !mute);
          if (!solved && M.isSolved(4)) solved = true;
          drawTape(g, { e: e, mode: mode, tick: tick, glow: glow, pulses: pulses, runs: runs, dist: dist });
        }
        raf = requestAnimationFrame(frame);
        api.cleanup(function () { cancelAnimationFrame(raf); doc.removeEventListener("keydown", onKey, true); bp.set(false); bp.close(); savePad(); });
      } });
    };

    return ST;
  }
  root.N1Stations = { create: create };
})(window);
