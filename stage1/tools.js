/* ============================================================================
   N1Tools — 5~8장 자료에 붙는 "연필 도구". 퍼즐 논리는 그대로이고, 손으로 적어 가며 풀 수 있게 돕는다.
   · 4장 신호   : 별빛 깜빡임을 점·선·쉼으로 적는 기록장, 그리고 해독표
   · 5장 지도   : 빈 칸에 알파벳을 적고, 연필로 칸에 표시한다(안내 문장을 따라가는 것은 스스로 한다)
   · 6장 영상   : 낡은 TV 화면에서 영상을 틀고, 암호 글자를 눌러 지우거나 글자를 적어 한꺼번에 지운다
   · 7장 쪽지   : 붉은 낱말마다 사전(교탁 위 한영사전)에서 찾은 영어 첫 뜻을 적어 둔다
   · 8장 설명서 : 알파벳별 근육 움직임 횟수 표
   답을 대신 내 주지는 않는다. 적은 것은 저장된다(M.pz).
   ========================================================================== */
(function (root) {
  "use strict";
  var doc = root.document, el = root.N1UI.el;

  function create(o) {
    var M = o.model, D = o.data, A = o.assets || {};
    var T = {};

    function saved(key) { return M.pz(key) || {}; }
    function debounce(fn, ms) { var t = 0; return function () { var a = arguments; clearTimeout(t); t = setTimeout(function () { fn.apply(null, a); }, ms); }; }

    /* ───────── 4장: 신호 기록장과 해독표 ─────────
       기록장은 본 깜빡임을 점·선·쉼으로 적어 둘 뿐이다(풀이하지 않는다). 해독표는 교실 벽에 붙은 것과 같다. */
    /* pad: ".-/" 로 이뤄진 문자열 → 점(●)·선(▬)·쉼(｜) 조각들 */
    T.padView = function (pad) {
      var out = el("div", "pad-seq");
      String(pad || "").split("").forEach(function (ch) {
        if (ch === ".") out.appendChild(el("i", "mz dot")); else if (ch === "-") out.appendChild(el("i", "mz dash")); else if (ch === "/") out.appendChild(el("i", "mz gap"));
      });
      return out;
    };
    T.morseChart = function (host) {
      var Pz = root.N1Puz, grid = el("div", "morse-chart");
      Object.keys(Pz.MORSE).forEach(function (L) {
        var cell = el("div", "mc-cell"), code = el("span", "mc-code");
        Pz.MORSE[L].split("").forEach(function (m) { code.appendChild(el("i", "mz " + (m === "-" ? "dash" : "dot"))); });
        cell.appendChild(el("b", null, L)); cell.appendChild(code); grid.appendChild(cell);
      });
      host.appendChild(grid);
      host.appendChild(el("p", "mini", "점(●)은 짧은 깜빡임, 선(▬)은 그 세 배 긴 깜빡임이다. 한 글자 안에서는 짧게 쉬고, 글자와 글자 사이는 더 길게, 낱말과 낱말 사이는 그보다 더 길게 쉰다."));
    };
    T.morseLog = function (host) {
      var st = saved("c4"), pad = String(st.pad || "");
      host.appendChild(el("h4", null, "기록장에 적어 둔 신호"));
      if (!pad) { host.appendChild(el("p", "mini", "아직 적은 것이 없다. 왼쪽 창가 AV 카트의 테이프를 돌려 보자.")); return; }
      var box = el("div", "pad-out"); box.appendChild(T.padView(pad)); host.appendChild(box);
      host.appendChild(el("p", "mini", "카트 옆 벽의 해독표로 글자를 읽어, 답을 오른쪽에 입력한다."));
    };

    /* ───────── 5장: 지도 메모 ─────────
       칸에 알파벳을 적고, 연필로 칸에 표시를 한다. 안내 문장을 따라 걷는 것도, 출발 칸을 찾는 것도 스스로 한다(도구는 기록만 한다). */
    T.map = function (host) {
      var st = saved("c5"), cells = st.cells || {}, marks = st.marks || {}, mw = el("div", "mapwrap"), mg = el("div", "mapgrid"), inputs = {}, nodes = {}, marking = false;
      var save = debounce(function () { M.pzSet("c5", { cells: cells, marks: marks }); }, 400);
      var bar = el("div", "mapbar"), bWrite = el("button", "btn small on", "✎ 글자 적기"), bMark = el("button", "btn small", "● 칸에 표시"), bClear = el("button", "btn small ghost", "표시 지우기");
      [bWrite, bMark, bClear].forEach(function (b) { b.type = "button"; bar.appendChild(b); });
      function setMode(m) { marking = m; mw.classList.toggle("marking", m); bWrite.classList.toggle("on", !m); bMark.classList.toggle("on", m); bWrite.setAttribute("aria-pressed", m ? "false" : "true"); bMark.setAttribute("aria-pressed", m ? "true" : "false"); }
      bWrite.onclick = function () { setMode(false); }; bMark.onclick = function () { setMode(true); };
      bClear.onclick = function () { Object.keys(marks).forEach(function (k) { delete marks[k]; if (nodes[k]) nodes[k].classList.remove("pen"); }); save(); };
      for (var r = 1; r <= D.MAP_ROWS; r++) for (var c = 1; c <= D.MAP_COLS; c++) (function (r, c) {
        var key = r + "," + c, nm = D.MAP_PRINTED[key];
        if (r === 5 && c > 2) { mg.appendChild(el("div", "mc void")); return; }
        var cell = el("div", "mc" + (nm ? "" : " blank") + (marks[key] ? " pen" : ""), nm ? nm : ""); nodes[key] = cell;
        if (!nm) {
          var inp = el("input", "mnote"); inp.type = "text"; inp.maxLength = 1; inp.setAttribute("aria-label", r + "행 " + c + "열 메모"); inp.autocomplete = "off"; inp.spellcheck = false;
          inp.value = cells[key] || "";
          inp.oninput = function () { var v = (inp.value || "").replace(/[^A-Za-z]/g, "").toUpperCase(); inp.value = v; if (v) cells[key] = v; else delete cells[key]; save(); };
          cell.appendChild(inp); inputs[key] = inp;
        }
        cell.addEventListener("click", function () { if (!marking) return; if (marks[key]) { delete marks[key]; cell.classList.remove("pen"); } else { marks[key] = 1; cell.classList.add("pen"); } save(); });
        mg.appendChild(cell);
      })(r, c);
      mw.appendChild(mg); host.appendChild(bar); host.appendChild(mw);
      host.appendChild(el("p", "mini", "인쇄된 상표 이름의 머리글자를 보고 빈 칸에 알파벳을 적어 보세요. ‘칸에 표시’로 바꾸면 칸을 눌러 연필로 표시할 수 있습니다. 적은 것은 저장됩니다."));
      var ol = el("ol", "maproutes");
      D.MAP_ROUTES.forEach(function (rt) { ol.appendChild(el("li", null, rt.t)); });
      host.appendChild(ol);
    };

    /* ───────── 6장: TV 화면의 영상 + 암호 글자 지우기 ───────── */
    T.video = function (host) {
      var tv = el("div", "tv"), v = el("video"); v.controls = true; v.preload = "metadata"; v.playsInline = true; v.setAttribute("playsinline", ""); v.src = A.videoMystery;
      tv.appendChild(v); host.appendChild(tv); host.appendChild(el("p", "mini", D.VIDEO_NOTE));
      var st = saved("c6"), struck = {}, box = el("div", "cipherbox"), tiles = el("div", "ctiles"), field = el("input", "cfield"), out = el("p", "cout");
      box.appendChild(el("h4", null, "암호 글자")); box.appendChild(el("p", "mini", "일기 끝의 알파벳 열입니다. 글자를 눌러 지우거나, 아래 칸에 글자를 적어 한꺼번에 지워 보세요."));
      var btns = [];
      D.CIPHER.split("").forEach(function (ch, i) {
        var b = el("button", "ct", ch); b.type = "button"; b.setAttribute("aria-pressed", "false");
        b.onclick = function () { struck[i] = !struck[i]; paint(); }; tiles.appendChild(b); btns.push(b);
      });
      field.type = "text"; field.placeholder = "지울 글자들 (예: XYZ)"; field.autocomplete = "off"; field.spellcheck = false; field.value = st.f || "";
      var fsave = debounce(function () { M.pzSet("c6", { f: field.value }); }, 400);
      field.oninput = function () { field.value = field.value.replace(/[^A-Za-z]/g, "").toUpperCase(); fsave(); paint(); };
      function paint() {
        var set = {}; field.value.split("").forEach(function (c) { set[c] = 1; });
        var rest = "";
        btns.forEach(function (b, i) {
          var gone = !!struck[i] || !!set[D.CIPHER[i]]; b.classList.toggle("struck", gone); b.setAttribute("aria-pressed", gone ? "true" : "false"); if (!gone) rest += D.CIPHER[i];
        });
        out.innerHTML = "남은 글자: <b>" + (rest || "—") + "</b>";
      }
      box.appendChild(tiles); box.appendChild(field); box.appendChild(out); host.appendChild(box); paint();
    };

    /* ───────── 7장: 쪽지 낱말 메모 ─────────
       붉은 낱말마다 사전(교탁 위 한영사전)에서 찾은 영어 뜻을 적어 둔다. 머리글자를 모으는 것은 스스로 한다. */
    T.words = function (host) {
      var probe = el("div", null, D.DIARY_HTML.diary7), words = [].map.call(probe.querySelectorAll(".note .red"), function (n) { return n.textContent.trim(); });
      var st = saved("c7"), vals = st.w || [], list = el("ol", "wordlist");
      var save = debounce(function () { M.pzSet("c7", { w: vals }); }, 400);
      host.appendChild(el("p", "mini", "쪽지의 붉은 낱말을 교탁 위의 한영사전에서 찾아, 영어 뜻 중 제일 처음 나오는 단어를 적으세요. 적은 것은 저장됩니다."));
      words.forEach(function (w, i) {
        var li = el("li"), kr = el("span", "kr", w), inp = el("input", "wnote");
        inp.type = "text"; inp.maxLength = 30; inp.autocomplete = "off"; inp.spellcheck = false; inp.setAttribute("aria-label", w + " 영어 뜻"); inp.value = vals[i] || "";
        inp.oninput = function () { vals[i] = inp.value; save(); };
        li.appendChild(el("i", "no", "" + (i + 1))); li.appendChild(kr); li.appendChild(inp); list.appendChild(li);
      });
      host.appendChild(list);
    };

    /* ───────── 8장: 알파벳별 근육 움직임 횟수 ───────── */
    T.keyb = function (host) {
      var d = el("details", "item"); d.open = true; d.innerHTML = "<summary>근섬유 전기신호키보드 사용법</summary>"; d.appendChild(el("div", "in", D.KEYB_HTML)); host.appendChild(d);
      var chart = el("div", "keychart"); chart.appendChild(el("p", "mini", "규칙에 따른 글자별 근육 움직임 횟수(대기 시간은 따로 셉니다)."));
      var grid = el("div", "kc");
      "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("").forEach(function (ch, i) { grid.appendChild(el("span", "k", "<b>" + ch + "</b><i>" + (i + 1) + "</i>")); });
      grid.appendChild(el("span", "k dot", "<b>.</b><i>28</i>"));
      chart.appendChild(grid); host.appendChild(chart);
    };

    return T;
  }
  root.N1Tools = { create: create };
})(window);
