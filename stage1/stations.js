/* ============================================================================
   N1Stations — 교실 곳곳의 "퍼즐 자리" 화면. 물건을 눌러 가까이 들여다보는 패널이다.
   · 1장 교탁의 날짜 도장 : 일기 빈칸과 같은 모양의 바퀴 다섯 개를 맞춰 찍는다
   · 2장 액자 표식 붙이기 : 표식 카드를 알맞은 액자에 붙이고, 남는 액자를 고른다
   · 3장 명단 클립보드   : 종목별 자리에 아홉 이름을 앉혀 보고, 정답은 그 자리에서 입력한다
   · 4장 AV 카트(VCR)     : 별의 붕괴 테이프를 되감아 본다. 정답은 그 자리에서 입력한다
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

    /* ───────── 2장: 액자 표식 붙이기 ───────── */
    var FRAME_ORDER = ["newton", "archimedes", "abel", "einstein", "galilei", "gauss"];
    ST.showStickers = function () {
      var solved = M.isSolved(2), saved = M.pz("c2"), placed = (saved && saved.placed) || {}, sel = null;
      function frameSci(id) { return D.SCI.filter(function (s) { return s.id === id; })[0]; }
      UI.openSheet({ title: "액자에 표식 붙이기", sub: "CHAPTER 2 · 친구들이 붙인 별명", mode: "wide", cls: "sticker-sheet", build: function (b, foot, api) {
        var root_ = el("div", "stk"), tray = el("div", "stk-tray"), grid = el("div", "stk-frames"), msg = el("p", "stk-msg");
        var cards = {}, slots = {};
        var side = el("div", "stk-side"); side.appendChild(el("p", "mini", "표식 카드를 고른 뒤, 그 표식이 어울리는 액자를 누르세요.")); side.appendChild(tray);
        Puz.SYMBOLS.forEach(function (sym) {
          var c = el("button", "card", D.SYMBOL_SVG[sym]); c.type = "button"; c.setAttribute("aria-label", "표식 카드");
          c.onclick = function () { if (solved) return; sel = sel === sym ? null : sym; paint(); }; tray.appendChild(c); cards[sym] = c;
        });
        FRAME_ORDER.forEach(function (id) {
          var sci = frameSci(id), f = el("button", "fr"); f.type = "button"; f.setAttribute("aria-label", sci.name + " 액자");
          f.innerHTML = '<span class="pic"><img alt="" src="' + (A["portrait_" + id] || "") + '"></span><span class="nm">' + sci.name + '</span><span class="badge"></span>';
          f.onclick = function () { pick(id); }; grid.appendChild(f); slots[id] = f;
        });
        root_.appendChild(side); root_.appendChild(grid); b.appendChild(root_); b.appendChild(msg);
        var det = el("details", "item fold"); det.innerHTML = "<summary>액자 설명판 보기</summary>";
        var list = el("div", "in"); D.SCI.forEach(function (s) { var d = el("details", "item"); d.innerHTML = "<summary>" + s.name + ' <span class="en">' + s.en + "</span></summary>"; d.appendChild(el("div", "in", SC.kit.sciHTML(s))); list.appendChild(d); });
        det.appendChild(list); b.appendChild(det); b.appendChild(diaryFold(2));

        function stateNow() { return Puz.stickerState(D, placed); }
        function paint() {
          var st = stateNow();
          Puz.SYMBOLS.forEach(function (sym) { var c = cards[sym]; c.classList.toggle("sel", sel === sym); c.classList.toggle("used", !!placed[sym]); c.disabled = !!placed[sym] || solved; });
          FRAME_ORDER.forEach(function (id) {
            var f = slots[id], sym = Object.keys(placed).filter(function (k) { return placed[k] === id; })[0];
            f.classList.toggle("ok", !!sym); f.classList.toggle("spare", st.done && id === st.spare && !solved); f.classList.toggle("won", solved && id === st.spare);
            f.querySelector(".badge").innerHTML = sym ? D.SYMBOL_SVG[sym] : (solved && id === st.spare ? "★" : "");
            f.disabled = solved || (!!sym) || (st.done ? id !== st.spare : false);
          });
          if (solved) msg.textContent = "남은 한 사람이 아이의 별명이었다. 지워졌던 이름이 일기에 돌아왔다.";
          else if (st.done) msg.textContent = "표식이 없는 액자가 하나 남았다. 이 아이가 부끄러워하던 이름은 누구의 것일까?";
          else msg.textContent = sel ? "이 표식은 누구에게 어울릴까?" : st.correct + " / " + st.total + " 장 붙였다.";
          api.refresh();
        }
        function pick(id) {
          var st = stateNow();
          if (solved) return;
          if (st.done) {                                                   /* 마지막 선택: 남은 액자가 별명의 주인 */
            if (id !== st.spare) return;
            var r = M.answer(id);
            if (r.ok) {
              solved = true; paint(); UI.toast("암호 해제 — 단서: “" + r.cue + "”", "good");
              hooks.onAnswered && hooks.onAnswered(2); goButton(foot);
            } else { hooks.onWrong && hooks.onWrong(2); shake(slots[id]); }
            return;
          }
          if (!sel) { msg.textContent = "먼저 붙일 표식 카드를 고르세요."; shake(msg); return; }
          var res = Puz.stickerPlace(D, placed, sel, id);
          if (res.ok) {
            placed = res.placed; M.pzSet("c2", { placed: placed }); hooks.onSticker && hooks.onSticker(id, sel); sel = null;
            slots[id].classList.add("stuck"); setTimeout(function () { slots[id].classList.remove("stuck"); }, 500);
          } else {
            shake(slots[id]); UI.toast(res.reason === "occupied" ? "이 액자에는 이미 붙어 있습니다." : "붙지 않는다. 이 표식은 다른 사람의 것 같다.", "bad");
            hooks.onMiss && hooks.onMiss(2);
          }
          paint();
        }
        function shake(node) { node.classList.remove("shake"); void node.offsetWidth; node.classList.add("shake"); }
        paint(); if (solved) goButton(foot);
      } });
    };

    /* 작은 탭 묶음 */
    function tabs(items, onPick) {
      var bar = el("div", "tabs"), btns = [];
      items.forEach(function (it, i) {
        var t = el("button", "tab", it.label); t.type = "button"; t.setAttribute("role", "tab");
        t.onclick = function () { pick(i); }; bar.appendChild(t); btns.push(t);
      });
      function pick(i) { btns.forEach(function (t, k) { t.setAttribute("aria-selected", k === i ? "true" : "false"); }); onPick(items[i], i); }
      return { el: bar, pick: pick };
    }

    /* ───────── 3장: 명단 클립보드 ───────── */
    ST.showRoster = function () {
      var c = D.CH[2], solved = M.isSolved(3);
      UI.openSheet({ title: "명단 클립보드", sub: "CHAPTER 3 · 대학의 스포츠팀", mode: "wide", cls: "terminal roster-sheet", build: function (b, foot, api) {
        var layout = el("div", "term-layout"), left = el("div", "term-left"), right = el("div", "term-right");
        var paper = el("div", "roster-paper"); paper.innerHTML = "<h4>우리 팀</h4><ol>" + Puz.ROSTER.map(function (n, i) { return "<li" + (i === Puz.ROSTER.length - 1 ? ' class="me"' : "") + ">" + n + "</li>"; }).join("") + "</ol>";
        var intro = el("p", "mini", "일기 속 팀의 이름을 적은 명단이다. 종목을 골라 이름을 차례로 자리에 앉혀 보세요."), pane = el("div", "seatpane");
        function paint(sp) {
          var fit = Puz.rosterFit(sp.roles), html = '<p class="rule"><b>' + sp.name + '</b> <span class="en">' + sp.en + "</span> · 한 팀 " + sp.players + "명<br>" + sp.rule + "</p>";
          if (fit.extra.length) html += '<p class="verdict bad">자리가 없어 앉지 못한 사람: ' + fit.extra.join(", ") + " (" + fit.extra.length + "명)</p>";
          else if (fit.empty) html += '<p class="verdict bad">자리가 ' + fit.empty + "개 남는다 — 아홉 명으로는 이 종목의 팀이 되지 않는다.</p>";
          else html += '<p class="verdict good">자리가 딱 맞는다. 마지막 이름 ‘나’가 앉은 자리는 「' + fit.me.role + "」이다.</p>";
          html += '<ol class="seats">';
          fit.slots.forEach(function (st, i) { html += '<li class="' + (st.name ? "fill" : "empty") + (fit.exact && i === fit.slots.length - 1 ? " me" : "") + '"><span class="rl">' + st.role + '</span><span class="nm">' + (st.name || "빈 자리") + "</span></li>"; });
          html += "</ol>";
          pane.innerHTML = html; api.refresh();
        }
        var tb = tabs(D.SPORTS.map(function (sp) { return { label: sp.name, sp: sp }; }), function (it) { paint(it.sp); });
        left.appendChild(paper); left.appendChild(intro); left.appendChild(tb.el); left.appendChild(pane);
        var fold = diaryFold(3); left.appendChild(fold);
        var crt = solved ? null : SC.kit.answerCRT(c, right, api);
        if (solved) { right.appendChild(SC.kit.acceptedPanel(c)); goButton(foot); } else right.appendChild(crt.el);
        layout.appendChild(left); layout.appendChild(right); b.appendChild(layout);
        tb.pick(0); if (crt) crt.attach(api);
      } });
    };

    /* ───────── 4장: VHS 되감기 ───────── */
    var TW = 640, TH = 360;
    var STARS = (function () { var a = [], r = 7; function rnd() { r = (r * 16807) % 2147483647; return r / 2147483647; } for (var i = 0; i < 70; i++) a.push([rnd(), rnd(), 0.5 + rnd() * 1.5]); return a; })();
    var PARTS = (function () { var a = []; for (var j = 0; j < 90; j++) a.push({ th: j * 2.399963, sp: 0.25 + ((j * 0.618) % 1) * 0.75, sz: 1 + (j % 3) * 0.6 }); return a; })();
    function tapeTime(e) { var sec = Math.round((1 - e) * 3599), m = Math.floor(sec / 60), s = sec % 60; return (m < 10 ? "0" : "") + m + ":" + (s < 10 ? "0" : "") + s; }
    function easeK(k) { return k * k * (3 - 2 * k); }
    /* e: 되감기 진행(0=끝의 한 점 … 1=처음), mode: stop|rew|play, sortK: 풀린 뒤 글자가 낱말 자리로 정렬되는 정도 */
    function drawTape(g, e, mode, tick, sortK) {
      var w = TW, h = TH, PT = Puz.TAPE_POINT, px = PT[0] * w, py = PT[1] * h, i;
      var bg = g.createLinearGradient(0, 0, 0, h); bg.addColorStop(0, "#03050c"); bg.addColorStop(1, "#0d1230"); g.fillStyle = bg; g.fillRect(0, 0, w, h);
      STARS.forEach(function (st) { g.fillStyle = "rgba(210,225,255," + (0.22 + st[2] * 0.18) + ")"; g.fillRect(st[0] * w, st[1] * h, st[2], st[2]); });
      if (e > 0.003) {
        var rad = e * w * 0.78; g.strokeStyle = "rgba(255,214,150," + (0.15 + 0.5 * (1 - e)) + ")"; g.lineWidth = 2 + (1 - e) * 5;
        g.beginPath(); g.ellipse(px, py, rad, rad * 0.7, 0, 0, 6.2832); g.stroke();
        g.strokeStyle = "rgba(160,190,255," + (0.08 + 0.2 * (1 - e)) + ")"; g.lineWidth = 1.5; g.beginPath(); g.ellipse(px, py, rad * 0.62, rad * 0.62 * 0.7, 0, 0, 6.2832); g.stroke();
      }
      PARTS.forEach(function (p) {
        var r = e * p.sp * w * 0.72, x = px + Math.cos(p.th) * r, y = py + Math.sin(p.th) * r * 0.7;
        g.fillStyle = "rgba(255,236,200," + (0.85 * (1 - e * 0.55)) + ")"; g.fillRect(x, y, p.sz, p.sz);
      });
      var ps = Puz.tapePointSize(e), rr = 8 + ps * 26, gr = g.createRadialGradient(px, py, 0, px, py, rr * 2.4);
      gr.addColorStop(0, "rgba(255,255,255,1)"); gr.addColorStop(0.25, "rgba(255,226,160,.9)"); gr.addColorStop(1, "rgba(255,180,90,0)");
      g.fillStyle = gr; g.beginPath(); g.arc(px, py, rr * 2.4, 0, 6.2832); g.fill();
      /* 글자 */
      var fr = Puz.tapeFrame(e), lastLanded = -1; fr.forEach(function (l) { if (l.phase === "landed") lastLanded = l.i; });
      g.textAlign = "center"; g.textBaseline = "middle"; g.font = "800 46px 'Noto Sans KR','Malgun Gothic',sans-serif";
      fr.forEach(function (l) {
        if (l.phase === "hidden") return;
        var x = l.x, y = l.y;
        if (sortK > 0) { var wx = 0.2 + l.i * (0.6 / 6) + (l.i > 2 ? 0.03 : 0) - 0.015, k = easeK(sortK); x = x + (wx - x) * k; y = y + (0.8 - y) * k; }
        var hot = l.phase === "flying" || l.i === lastLanded || sortK > 0;
        g.shadowColor = hot ? "rgba(255,200,110,.95)" : "rgba(0,0,0,0)"; g.shadowBlur = hot ? 18 : 0;
        g.fillStyle = l.phase === "flying" ? "#ffd98a" : "#f4f1e4"; g.fillText(l.ch, x * w, y * h);
        g.shadowBlur = 0;
        if (l.phase === "landed") { g.fillStyle = "rgba(244,241,228,.5)"; g.fillRect(x * w - 15, y * h + 30, 30, 3); }
      });
      /* VHS 화면 효과 */
      g.fillStyle = "rgba(0,0,0,.16)"; for (i = 0; i < h; i += 3) g.fillRect(0, i, w, 1);
      if (mode === "rew" || mode === "play") { var ty = (tick * 230) % h; g.fillStyle = "rgba(255,255,255,.07)"; g.fillRect(0, ty, w, 12); g.fillStyle = "rgba(255,255,255,.04)"; g.fillRect(0, (ty + 140) % h, w, 5); }
      g.font = "700 20px ui-monospace,Consolas,monospace"; g.textBaseline = "top"; g.textAlign = "left"; g.fillStyle = "#7cf59c"; g.shadowColor = "rgba(124,245,156,.8)"; g.shadowBlur = 6;
      g.fillText(mode === "rew" ? "◀◀ REW" : mode === "play" ? "▶ PLAY" : "■ STOP", 18, 14); g.textAlign = "right"; g.fillText(tapeTime(e), w - 18, 14);
      g.textAlign = "left"; g.fillText("SP  TAPE 4", 18, h - 34);
      if (e < 0.004 && mode !== "rew") { g.textAlign = "center"; g.fillStyle = (Math.floor(tick * 2) % 2) ? "#7cf59c" : "rgba(124,245,156,.35)"; g.fillText("테이프 끝  —  되감으세요", w / 2, h - 34); }
      g.shadowBlur = 0;
    }
    ST.showTape = function () {
      var c = D.CH[3], solved = M.isSolved(4), saved = M.pz("c4"), e = solved ? 1 : (saved && typeof saved.e === "number" ? saved.e : 0), mode = "stop", sortK = solved ? 1 : 0;
      UI.openSheet({ title: "AV 카트 · VCR", sub: "CHAPTER 4 · 한 점에 대한 연구", mode: "wide", cls: "terminal tape-sheet", build: function (b, foot, api) {
        var layout = el("div", "term-layout"), left = el("div", "term-left"), right = el("div", "term-right");
        var tv = el("div", "tv"), cv = el("canvas"); cv.width = TW; cv.height = TH; tv.appendChild(cv);
        var g = cv.getContext("2d"), ctl = el("div", "vcr"), jog = el("input", "jog");
        var bRew = el("button", "vb", "◀◀ 되감기"), bPlay = el("button", "vb", "▶ 재생"), bStop = el("button", "vb", "■ 정지");
        [bRew, bPlay, bStop].forEach(function (x) { x.type = "button"; ctl.appendChild(x); });
        jog.type = "range"; jog.min = 0; jog.max = 1000; jog.value = Math.round(e * 1000); jog.setAttribute("aria-label", "테이프 위치 (왼쪽=끝, 오른쪽=처음)");
        var jl = el("label", "jogl"); jl.appendChild(el("span", null, "끝")); jl.appendChild(jog); jl.appendChild(el("span", null, "처음")); ctl.appendChild(jl);
        left.appendChild(tv); left.appendChild(ctl);
        left.appendChild(el("p", "mini", "일기 속 스케치를 떠올려 보세요. 테이프는 끝까지 감겨 있습니다. 화면에서 일어나는 일을 차분히 지켜보세요."));
        left.appendChild(diaryFold(4));
        function setMode(m) { mode = mode === m ? "stop" : m; paintBtns(); }
        function paintBtns() { bRew.classList.toggle("on", mode === "rew"); bPlay.classList.toggle("on", mode === "play"); bStop.classList.toggle("on", mode === "stop"); }
        bRew.onclick = function () { if (solved) return; setMode("rew"); }; bPlay.onclick = function () { setMode("play"); }; bStop.onclick = function () { mode = "stop"; paintBtns(); };
        jog.oninput = function () { e = clamp01(jog.value / 1000); mode = "stop"; paintBtns(); };
        function clamp01(v) { return v < 0 ? 0 : v > 1 ? 1 : v; }
        var crt = solved ? null : SC.kit.answerCRT(c, right, api);
        if (solved) { right.appendChild(SC.kit.acceptedPanel(c)); goButton(foot); } else right.appendChild(crt.el);
        layout.appendChild(left); layout.appendChild(right); b.appendChild(layout);
        if (crt) crt.attach(api);
        var raf = 0, last = 0, tick = 0;
        function frame(ts) {
          raf = requestAnimationFrame(frame);
          var dt = last ? Math.min((ts - last) / 1000, 0.1) : 0; last = ts; tick += dt;
          if (mode === "rew") e += 0.075 * dt; else if (mode === "play") e -= 0.075 * dt;
          if (e >= 1) { e = 1; if (mode === "rew") { mode = "stop"; paintBtns(); } }
          if (e <= 0) { e = 0; if (mode === "play") { mode = "stop"; paintBtns(); } }
          if (mode !== "stop") jog.value = Math.round(e * 1000);
          if (!solved && M.isSolved(4)) solved = true;
          if (solved && sortK < 1) sortK = Math.min(1, sortK + dt * 0.9);
          drawTape(g, e, mode, tick, sortK);
        }
        raf = requestAnimationFrame(frame); paintBtns();
        api.cleanup(function () { cancelAnimationFrame(raf); if (!M.isSolved(4)) M.pzSet("c4", { e: e }); });
      } });
    };

    return ST;
  }
  root.N1Stations = { create: create };
})(window);
