/* ============================================================================
   N1Tower — 기억의 탑 패널. 모은 조각을 같은 규격의 나무 블록으로 쌓아 보는 곳.
   · 블록을 눌러 고르고 ▲▼ 로 옮긴다(끌어서 옮겨도 된다). 중간에도 언제든 열 수 있다.
   · 맞고 틀림은 ‘완성’을 눌렀을 때 한 번만 알려 준다. 어디가 틀렸는지는 말하지 않는다.
   · 완성하면 블록에 이름의 뼈대가 새겨진다(모음이 빠져 있다). 이름은 컴퓨터에서 스스로 말한다.
   ========================================================================== */
(function (root) {
  "use strict";
  var doc = root.document, el = root.N1UI.el;
  var SLOTS = 8;

  function create(o) {
    var UI = o.ui, M = o.model, D = o.data, SC = o.screens, hooks = o.hooks || {};
    var TW = {};

    function icon(n, px) {
      var c = doc.createElement("canvas"), r = Math.min(2, root.devicePixelRatio || 1); c.width = c.height = Math.round(px * r); c.style.width = c.style.height = px + "px";
      var g = c.getContext("2d"); g.scale(r, r); root.N1Icons.draw(g, n, px / 2, px / 2, px * 0.86, "#1b2640");
      return c;
    }
    function skeletonLines() { return root.finalSkeleton().split(" "); }

    TW.show = function () {
      var piecesNow = M.S.pieces.length;
      hooks.onTowerOpen && hooks.onTowerOpen(piecesNow);
      UI.openSheet({ title: "기억의 탑", sub: M.stackSolved() ? "탑이 완성되었습니다" : piecesNow >= 8 ? "조각 8/8 · 순서를 맞춰 쌓으세요" : "조각 " + piecesNow + "/8 · 모일 때마다 위에 쌓입니다", mode: "center", cls: "tower-sheet", build: function (b, foot, api) {
        var layout = el("div", "tw-layout"), note = el("div", "tw-note"), col = el("div", "tw-col"), stackEl = el("div", "tw-stack"), msg = el("p", "tw-msg"), sel = -1, base = null, drag = null;
        layout.appendChild(note); layout.appendChild(col); b.appendChild(layout);
        col.appendChild(stackEl);
        var go = el("button", "btn primary tw-go", "완성"); go.type = "button";
        var actions = el("div", "tw-actions"); actions.appendChild(go); col.appendChild(actions); col.appendChild(msg);

        /* 왼쪽: 마지막 일기(읽을 수 있을 때) 또는 모은 기억 목록 */
        function paintNote() {
          note.innerHTML = "";
          if (M.S.ch > 8) { note.appendChild(SC.kit.diaryArticle("diary9", 9)); return; }
          var h = el("p", "tw-note-h", "모은 기억"); note.appendChild(h);
          var ul = el("ul", "tw-legend");
          M.S.pieces.slice().sort(function (a, c) { return a - c; }).forEach(function (n) {
            var li = el("li"); li.appendChild(icon(n, 22)); li.appendChild(el("b", null, M.pieceYear(n))); li.appendChild(el("span", null, D.CH[n - 1].title)); ul.appendChild(li);
          });
          if (!M.S.pieces.length) ul.appendChild(el("li", "tw-none", "아직 얻은 조각이 없다."));
          note.appendChild(ul);
          note.appendChild(el("p", "mini", "마지막 일기는 여덟 조각을 모두 모아야 읽을 수 있다. 일기가 쌓는 순서를 말해 줄 것이다. 시간순이 아닐 수도 있다."));
        }

        function paint() {
          var t = M.tower(), solved = M.stackSolved(), empties = SLOTS - t.length;
          stackEl.innerHTML = ""; stackEl.classList.toggle("solved", solved);
          if (solved && !base) base = root.N1Icons.engrave(skeletonLines(), 600, 104 * SLOTS);
          for (var e = 0; e < empties; e++) stackEl.appendChild(el("div", "tw-slot empty", ""));
          t.forEach(function (n, i) {
            var row = el("div", "tw-block" + (i === sel && !solved ? " sel" : "") + (solved ? " engraved" : "")); row.dataset.n = n; row.dataset.i = i;
            row.setAttribute("role", "button"); row.tabIndex = 0;
            row.setAttribute("aria-label", n + "번 조각, " + M.pieceYear(n) + "년, 위에서 " + (i + 1) + "번째" + (i === sel ? ", 선택됨" : ""));
            if (solved) {
              row.style.backgroundImage = "url(" + root.N1Icons.slice(base, i, SLOTS, 300, 52).toDataURL("image/png") + ")";
            } else {
              var lab = el("span", "tw-label"); lab.appendChild(icon(n, 30)); lab.appendChild(el("span", "tw-title", D.CH[n - 1].title)); lab.appendChild(el("b", "tw-year", M.pieceYear(n))); row.appendChild(lab);
              var mv = el("span", "tw-mv"), up = el("button", null, "▲"), dn = el("button", null, "▼"); up.type = dn.type = "button";
              up.setAttribute("aria-label", n + "번 조각을 위로"); dn.setAttribute("aria-label", n + "번 조각을 아래로");
              up.disabled = i === 0; dn.disabled = i === t.length - 1;
              up.onclick = function (ev) { ev.stopPropagation(); move(i, i - 1); }; dn.onclick = function (ev) { ev.stopPropagation(); move(i, i + 1); };
              mv.appendChild(up); mv.appendChild(dn); row.appendChild(mv);
              row.onclick = function () { sel = sel === i ? -1 : i; paint(); };
              row.onkeydown = function (ev) {
                if (ev.key === "Enter" || ev.key === " ") { ev.preventDefault(); sel = sel === i ? -1 : i; paint(); focusRow(i); }
                else if (ev.key === "ArrowUp" && sel === i) { ev.preventDefault(); move(i, i - 1); focusRow(i - 1); }
                else if (ev.key === "ArrowDown" && sel === i) { ev.preventDefault(); move(i, i + 1); focusRow(i + 1); }
              };
              row.addEventListener("pointerdown", function (ev) { startDrag(ev, row, i); });
            }
            stackEl.appendChild(row);
          });
          go.disabled = solved || t.length < SLOTS; go.hidden = solved;
          msg.textContent = solved ? "탑이 완성되었다. 새겨진 글자를 보고 그의 이름을 컴퓨터에 입력하세요."
            : t.length < SLOTS ? "조각이 모두 모이면 ‘완성’을 눌러 맞는지 확인할 수 있다."
            : "블록을 눌러 고르고 ▲▼로 옮기세요. ‘완성’을 눌러야 맞는지 알 수 있습니다.";
          paintNote(); api.refresh();
        }
        function focusRow(i) { var r = stackEl.querySelector('.tw-block[data-i="' + i + '"]'); if (r) try { r.focus({ preventScroll: true }); } catch (e) {} }
        function move(from, to) {
          if (!M.towerMove(from, to)) return;
          sel = to; paint(); focusRow(to);
          hooks.onTowerChange && hooks.onTowerChange();
        }

        /* 끌어서 옮기기: 포인터로 줄 위치를 따라간다. 놓을 때 한 번만 옮긴다 */
        function startDrag(ev, row, from) {
          if (ev.button != null && ev.button !== 0) return;
          if (ev.target.closest && ev.target.closest("button")) return;
          var y0 = ev.clientY, moved = false, rows = [].slice.call(stackEl.querySelectorAll(".tw-block")), rects = rows.map(function (r) { return r.getBoundingClientRect(); }), to = from;
          function onMove(e) {
            var dy = e.clientY - y0;
            if (!moved && Math.abs(dy) < 8) return;
            if (!moved) { moved = true; row.classList.add("dragging"); try { row.setPointerCapture(ev.pointerId); } catch (x) {} }
            row.style.transform = "translateY(" + dy + "px)";
            var cy = rects[from].top + rects[from].height / 2 + dy, best = from, bd = 1e9;
            rects.forEach(function (r, k) { var d = Math.abs(cy - (r.top + r.height / 2)); if (d < bd) { bd = d; best = k; } });
            if (best !== to) {
              to = best;
              rows.forEach(function (r, k) { if (k === from) return; var shift = 0; if (from < to && k > from && k <= to) shift = -rects[from].height - 8; else if (from > to && k < from && k >= to) shift = rects[from].height + 8; r.style.transform = shift ? "translateY(" + shift + "px)" : ""; });
            }
          }
          function onUp() {
            row.removeEventListener("pointermove", onMove); row.removeEventListener("pointerup", onUp); row.removeEventListener("pointercancel", onUp);
            if (moved) { var i0 = from, i1 = to; sel = i1; if (i0 !== i1) M.towerMove(i0, i1); paint(); focusRow(i1); if (i0 !== i1) hooks.onTowerChange && hooks.onTowerChange(); }
          }
          row.addEventListener("pointermove", onMove); row.addEventListener("pointerup", onUp); row.addEventListener("pointercancel", onUp);
        }

        go.onclick = function () {
          var r = M.towerSubmit();
          if (r.ok) { UI.closeSheet(true); hooks.onTowerSolved && hooks.onTowerSolved(); return; }
          if (r.reason === "incomplete") { UI.toast("조각이 아직 다 모이지 않았다.", "bad"); return; }
          stackEl.classList.remove("fall"); void stackEl.offsetWidth; stackEl.classList.add("fall");        /* 패널 안에서도 우르르 흔들린다 */
          setTimeout(function () { UI.closeSheet(true); hooks.onTowerWrong && hooks.onTowerWrong(); }, 520);
        };
        paint();
      } });
    };
    return TW;
  }
  root.N1Tower = { create: create };
})(window);
