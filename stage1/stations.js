/* ============================================================================
   N1Stations — 교실 곳곳의 "퍼즐 자리" 화면. 물건을 눌러 가까이 들여다보는 패널이다.
   · 1장 교탁의 날짜 도장 : 일기 빈칸과 같은 모양의 바퀴 다섯 개를 맞춰 찍는다
   · 2장 액자 표식 붙이기 : 표식 카드를 알맞은 액자에 붙이고, 남는 액자를 고른다
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

    return ST;
  }
  root.N1Stations = { create: create };
})(window);
