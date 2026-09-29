/* ============================================================================
   N1Screens — 화면 내용: 일기, 자료, 단말기, 기억 조립, 뒷문, 엔딩, 메뉴.
   ui.js 의 종이 패널 위에 올라간다. 규칙은 모델(M)에 묻고, 결과만 보여 준다.
   ========================================================================== */
(function (root) {
  "use strict";
  var doc = root.document, el = root.N1UI.el;
  var FONT = "'Noto Sans KR','Malgun Gothic','Apple SD Gothic Neo',system-ui,sans-serif";

  function create(o) {
    var UI = o.ui, M = o.model, D = o.data, hooks = o.hooks || {}, A = o.assets || {}, S = M.S;
    var SC = {};

    /* ───────── 일기 ───────── */
    function diaryArticle(key, n) {
      var a = el("article", "diary", D.DIARY_HTML[key]);
      if (n === 7) {
        var link = el("a", "dict-link", "네이버 영어사전에서 단어 찾기 ↗");
        link.href = "https://en.dict.naver.com/#/main"; link.target = "_blank"; link.rel = "noopener noreferrer"; a.appendChild(link);
      }
      return a;
    }
    SC.showDiary = function (n, opt) {
      opt = opt || {};
      var c = n === 9 ? { title: "마지막 일기" } : D.CH[n - 1];
      UI.openSheet({ title: c.title, sub: "기록 · 일기", closeText: opt.closeText, onClose: opt.afterClose,
        build: function (b) { b.appendChild(diaryArticle("diary" + n, n)); } });
    };

    /* ───────── 자료(인쇄물) ───────── */
    function enLabel(name, en) { return name + ' <span class="en">' + en + "</span>"; }
    function detail(list, title, html) {
      var d = el("details", "item"); d.innerHTML = "<summary>" + title + "</summary>"; d.appendChild(el("div", "in", html)); list.appendChild(d);
    }
    function sciHTML(s) {
      return "<dl><dt>생몰</dt><dd>" + s.born + " ~ " + s.died + "</dd><dt>핵심</dt><dd>" + s.key + "</dd></dl><p>" + s.body + "</p>" +
        (s.fix ? '<p class="fixnote">※ ' + s.fix + "</p>" : "");
    }
    function sportHTML(s) {
      return "<dl><dt>한 팀 인원</dt><dd>" + s.players + "명</dd><dt>주요 규칙</dt><dd>" + s.rule + "</dd><dt>포지션</dt><dd>" + s.roles.join(", ") + "</dd></dl>";
    }
    function mapGrid() {
      var mw = el("div", "mapwrap"), mg = el("div", "mapgrid");
      for (var r = 1; r <= D.MAP_ROWS; r++) for (var c = 1; c <= D.MAP_COLS; c++) {
        var nm = D.MAP_PRINTED[r + "," + c];
        if (r === 5 && c > 2) { mg.appendChild(el("div", "mc void")); continue; }
        mg.appendChild(el("div", "mc" + (nm ? "" : " blank"), nm || ""));
      }
      mw.appendChild(mg); return mw;
    }
    function symbolSheet() {
      var g = el("div", "sgrid");
      g.innerHTML = D.SHEET.map(function (t) {
        function cell(x) { return '<div class="scell"><span style="transform:rotate(' + x[1] + 'deg)"><i class="mk"></i>' + D.SYMBOL_SVG[x[0]] + "</span></div>"; }
        return '<div class="stile ' + t.dir + '">' + cell(t.a) + cell(t.b) + "</div>";
      }).join("");
      return g;
    }
    /* kind: sci | sport | map | video | keyb | frames — 터미널 옆 탭과 자료 패널이 같은 함수를 쓴다 */
    function renderResource(kind, host) {
      var list = el("div", "list");
      if (kind === "frames") { host.appendChild(symbolSheet()); return; }
      if (kind === "sci") { D.SCI.forEach(function (s) { detail(list, enLabel(s.name, s.en), sciHTML(s)); }); host.appendChild(list); return; }
      if (kind === "sport") { D.SPORTS.forEach(function (s) { detail(list, enLabel(s.name, s.en), sportHTML(s)); }); host.appendChild(list); return; }
      if (kind === "map") {
        host.appendChild(mapGrid());
        var ol = el("ol", "maproutes"); ol.innerHTML = D.MAP_ROUTES.map(function (v) { return "<li>" + v.t + "</li>"; }).join(""); host.appendChild(ol); return;
      }
      if (kind === "video") {
        var v = el("video"); v.controls = true; v.preload = "metadata"; v.playsInline = true; v.setAttribute("playsinline", ""); v.src = A.videoMystery;
        host.appendChild(v); host.appendChild(el("p", "mini", D.VIDEO_NOTE)); return;
      }
      if (kind === "keyb") { detail(list, "근섬유 전기신호키보드 사용법", D.KEYB_HTML); host.appendChild(list); return; }
      host.appendChild(el("p", "mini", "이 장에는 별도의 인쇄 자료가 없습니다. 일기를 다시 읽어 보세요."));
    }
    SC.showRefs = function (kind) {
      var p = kind || D.PUZZLE_REF[M.chapter().puzzle];
      UI.openSheet({ title: D.REF_TITLE[p] || "자료", sub: "교실에 비치된 인쇄물", build: function (b) { renderResource(p, b); } });
    };
    SC.showSheet = function () { UI.openSheet({ title: "종이 한 장", sub: "기호가 그려진 종이", build: function (b) { renderResource("frames", b); } }); };
    SC.showSciNote = function (sc) {
      UI.openSheet({ title: sc.name, sub: sc.en, build: function (b) { b.innerHTML = '<div class="item"><div class="in" style="border:0;padding:14px">' + sciHTML(sc) + "</div></div>"; var i = b.querySelector(".item"); i.style.background = "#fff"; } });
    };

    /* ───────── 단말기(CRT) ───────── */
    var activeCRT = null;
    /* cfg: {label, rule, mode:"alpha"|"number", empty, submitText, max, onSubmit(raw)→true 면 값 유지 안 함} */
    function makeCRT(cfg) {
      var state = "", max = cfg.max || 40, number = cfg.mode === "number", used = false;
      var root_ = el("div", "crt"), screen = el("div", "crt-screen"), lab = el("p", "crt-l", cfg.label), val = el("div", "crt-value empty");
      val.setAttribute("aria-live", "polite"); screen.appendChild(lab); screen.appendChild(val); root_.appendChild(screen);
      if (cfg.rule) root_.appendChild(el("p", "crt-rule", cfg.rule));
      var keys = el("div", "keys " + (number ? "number" : "alpha")), keyEls = {};
      (number ? "1234567890" : "ABCDEFGHIJKLMNOPQRSTUVWXYZ").split("").forEach(function (ch) {
        var b = el("button", "key", ch); b.type = "button"; b.onclick = function () { add(ch); }; keys.appendChild(b); keyEls[ch] = b;
      });
      root_.appendChild(keys);
      var tools = el("div", "keytools");
      var back = el("button", "key tool", "⌫ 한 글자"), clr = el("button", "key tool", "전체 지우기"), ent = el("button", "key tool enter", cfg.submitText || "확인");
      [back, clr, ent].forEach(function (b) { b.type = "button"; tools.appendChild(b); });
      root_.appendChild(tools);
      function paint() {
        if (!state) { val.className = "crt-value empty"; val.textContent = cfg.empty || "버튼이나 키보드로 입력하세요"; }
        else { val.className = "crt-value"; val.textContent = state; var c = el("span", "caret"); val.appendChild(c); }
      }
      function add(ch) { if (state.length < max) { state += ch; paint(); } }
      function press(ch) { var b = keyEls[ch]; if (b) { b.classList.add("hit"); setTimeout(function () { b.classList.remove("hit"); }, 90); } }
      function shake() { screen.classList.remove("shake"); void screen.offsetWidth; screen.classList.add("shake"); }
      var api = {
        el: root_, value: function () { return state; },
        clear: function () { state = ""; paint(); }, shake: shake,
        submit: function () { var done = cfg.onSubmit(state); if (done === false) { shake(); state = ""; paint(); } }
      };
      back.onclick = function () { state = state.slice(0, -1); paint(); };
      clr.onclick = function () { state = ""; paint(); };
      ent.onclick = function () { api.submit(); };
      /* 물리 키보드: 자판 배열·한글 입력기와 무관하게 e.code 로 읽는다. 버튼에 초점이 있어도 Enter 는 제출로 간다. */
      function onKey(e) {
        if (activeCRT !== api || e.ctrlKey || e.metaKey || e.altKey) return;
        var ch = null, m;
        if (e.code && (m = /^Key([A-Z])$/.exec(e.code))) ch = number ? null : m[1];
        else if (e.code && (m = /^(?:Digit|Numpad)([0-9])$/.exec(e.code))) ch = m[1];
        if (ch) { e.preventDefault(); e.stopPropagation(); add(ch); press(ch); return; }
        if (e.key === "Backspace") { e.preventDefault(); state = state.slice(0, -1); paint(); }
        else if (e.key === "Enter") { e.preventDefault(); e.stopPropagation(); api.submit(); }
      }
      api.attach = function (sheetApi) {
        activeCRT = api; doc.addEventListener("keydown", onKey, true);
        sheetApi.cleanup(function () { doc.removeEventListener("keydown", onKey, true); if (activeCRT === api) activeCRT = null; });
      };
      paint();
      return api;
    }

    function acceptedPanel(c) {
      var crt = el("div", "crt");
      crt.innerHTML = '<div class="crt-screen"><p class="crt-l">ACCEPTED</p><div class="crt-value" style="font-size:20px;letter-spacing:.08em">암호 해제</div>' +
        '<div class="crt-cue">' + c.cue + "</div></div>" +
        '<p class="crt-rule">단서가 가리키는 곳을 교실에서 찾아 눌러 보세요.</p>';
      return crt;
    }

    SC.showComputer = function () {
      if (S.done) { SC.showEnding(); return; }
      if (S.ch > 8) { SC.showAssembly(); return; }
      var c = M.chapter(), spec = D.TERMINAL_AID[c.n] || { kind: null };
      var head = { title: "장학금 단말기", sub: "CHAPTER " + c.n + " · " + c.title };
      if (S.phase === "search") {
        UI.openSheet({ title: head.title, sub: head.sub, build: function (b) { b.appendChild(acceptedPanel(c)); } });
        return;
      }
      UI.openSheet({ title: head.title, sub: head.sub, mode: "wide", cls: "terminal", build: function (b, foot, api) {
        var layout = el("div", "term-layout"), left = el("div", "term-left"), right = el("div", "term-right");
        var tabs = el("div", "tabs"), panes = [];
        function addTab(name, build) {
          var pane = el("div", "tabpane"); build(pane); panes.push(pane);
          var t = el("button", "tab", name); t.type = "button"; t.setAttribute("role", "tab");
          t.onclick = function () { panes.forEach(function (p, i) { p.hidden = p !== pane; tabs.children[i].setAttribute("aria-selected", p === pane ? "true" : "false"); }); api.refresh(); };
          tabs.appendChild(t); return t;
        }
        addTab("일기", function (p) { p.appendChild(diaryArticle("diary" + c.n, c.n)); });
        if (spec.kind) addTab(spec.title || "자료", function (p) { renderResource(spec.kind, p); });
        panes.forEach(function (p, i) { p.hidden = i !== 0; tabs.children[i].setAttribute("aria-selected", i === 0 ? "true" : "false"); });
        if (panes.length > 1) left.appendChild(tabs); else panes[0].style.borderTop = "0";
        panes.forEach(function (p) { left.appendChild(p); });
        var crt = makeCRT({ label: "SCHOLARSHIP TERMINAL — CHAPTER " + c.n, rule: "숫자 또는 영어 · 대소문자 무관 · 띄어쓰기 없음", mode: (c.n === 1 || c.n === 8) ? "number" : "alpha",
          empty: "정답을 입력하세요", submitText: "확인",
          onSubmit: function (raw) {
            var r = M.answer(raw);
            if (r.ok) {
              UI.toast("암호 해제 — 단서: “" + r.cue + "”", "good");
              right.innerHTML = ""; right.appendChild(acceptedPanel(c));
              var eb = el("button", "btn primary", "교실을 조사하러 간다"); eb.style.marginTop = "12px"; eb.onclick = function () { UI.closeSheet(); }; right.appendChild(eb);
              try { eb.focus({ preventScroll: true }); } catch (e) {}
              hooks.onAnswered && hooks.onAnswered(c.n);
              return true;
            }
            UI.toast(r.reason === "empty" ? "정답을 입력하세요." : "암호가 맞지 않습니다.", "bad");
            return false;
          } });
        right.appendChild(crt.el); layout.appendChild(left); layout.appendChild(right); b.appendChild(layout);
        crt.attach(api);
      } });
    };

    /* ───────── 기억 조립 ───────── */
    var BANDS = 8, BAND_H = 18, ENGRAVE_W = 1600, engrave = null;
    function engraveURL() {
      if (engrave) return engrave;
      var H = BANDS * BAND_H, cv = doc.createElement("canvas"); cv.width = ENGRAVE_W; cv.height = H;
      var g = cv.getContext("2d"), name = root.finalName();
      g.textAlign = "center"; g.textBaseline = "middle"; g.font = "900 200px " + FONT;
      var m = g.measureText(name), asc = m.actualBoundingBoxAscent || 150, desc = m.actualBoundingBoxDescent || 10;
      var sy = (H - 4) / (asc + desc), sx = (ENGRAVE_W - 60) / m.width;
      g.save(); g.translate(ENGRAVE_W / 2, 2 + asc * sy); g.scale(sx, sy);
      g.fillStyle = "rgba(255,236,200,.32)"; g.fillText(name, 0, -3 / sy);
      g.fillStyle = "rgba(24,13,4,.92)"; g.fillText(name, 0, 0); g.restore();
      engrave = cv.toDataURL("image/png"); return engrave;
    }
    function buildStack(order, opt) {
      var url = engraveURL(), wrap = el("div", "stack");
      order.forEach(function (n, i) {
        var row = el("div", "srow"), bar = el("div", "bar");
        bar.style.marginLeft = (opt.spread === false ? 0 : (i * 13)) + "px";
        bar.appendChild(el("div", "face", '<span class="n">' + n + "</span><span>" + D.CH[n - 1].title + "</span>"));
        var band = el("div", "band");
        band.style.backgroundImage = "url(" + url + ")"; band.style.backgroundSize = "100% " + (BANDS * BAND_H) + "px";
        band.style.backgroundPosition = "0 -" + (root.bandOf(n) * BAND_H) + "px";
        bar.appendChild(band); row.appendChild(bar);
        var mv = el("div", "mv");
        if (opt.move) {
          var u = el("button", null, "▲"), d = el("button", null, "▼"); u.type = d.type = "button";
          u.setAttribute("aria-label", n + "번 조각을 위로"); d.setAttribute("aria-label", n + "번 조각을 아래로");
          u.disabled = i === 0; d.disabled = i === order.length - 1;
          u.onclick = function () { opt.move(i, i - 1); }; d.onclick = function () { opt.move(i, i + 1); };
          mv.appendChild(u); mv.appendChild(d);
        }
        row.appendChild(mv); wrap.appendChild(row);
      });
      return wrap;
    }
    SC.showAssembly = function () {
      M.ensureStack();
      UI.openSheet({ title: "기억을 쌓다", sub: "마지막 일기를 보며 기억 조각을 맞추세요", mode: "center", cls: "assembly-sheet", build: function (b, foot, api) {
        var layout = el("div", "assembly"), diaryCol = el("div", "a-diary"), work = el("div"), host = el("div", "stackview"), term = el("div", "a-final");
        diaryCol.appendChild(diaryArticle("diary9", 9)); work.appendChild(host); work.appendChild(term);
        layout.appendChild(diaryCol); layout.appendChild(work); b.appendChild(layout);
        function paint() {
          var ok = M.stackSolved();
          host.innerHTML = ""; var st = buildStack(S.stack, { move: ok ? null : function (a, c) { M.swapStack(a, c); paint(); }, spread: !ok });
          if (ok) st.classList.add("locked"); host.appendChild(st);
          term.innerHTML = "";
          if (ok && !term.dataset.done) {
            var crt = makeCRT({ label: "FINAL", rule: "숫자 또는 영어 · 대소문자 무관 · 띄어쓰기 없음", mode: "alpha", empty: "그의 이름을 입력하세요", submitText: "제출",
              onSubmit: function (raw) {
                var r = M.submitFinal(raw);
                if (r.ok) { term.dataset.done = "1"; UI.closeSheet(true); hooks.onFinalOk && hooks.onFinalOk(); return true; }
                UI.toast(r.reason === "empty" ? "이름을 입력하세요." : "다시 읽어 보세요.", "bad"); return false;
              } });
            term.appendChild(crt.el); crt.attach(api);
            UI.toast("조각이 맞춰졌습니다. 이제 이름을 적으세요.", "good");
          }
          api.refresh();
        }
        paint();
      } });
    };

    /* ───────── 뒷문 · 스테이지 완료 ───────── */
    SC.showExit = function () {
      if (S.done) { SC.showClear(); return; }
      UI.openSheet({ title: "뒷문", sub: "코드를 입력하시면 나갈 수 있습니다.", build: function (b, foot, api) {
        b.appendChild(el("p", "mini", "문에 네 자리 숫자 자물쇠가 달려 있습니다."));
        var crt = makeCRT({ label: "EXIT LOCK", rule: "숫자만 입력", mode: "number", empty: "코드를 입력하세요", submitText: "문 열기",
          onSubmit: function (raw) {
            var r = M.submitExitCode(raw);
            if (r.ok) { UI.closeSheet(true); hooks.onExitOpened && hooks.onExitOpened(); return true; }
            UI.toast("코드가 맞지 않습니다.", "bad"); return false;
          } });
        crt.el.style.marginTop = "12px"; b.appendChild(crt.el); crt.attach(api);
      } });
    };
    SC.showClear = function () {
      UI.openSheet({ title: "스테이지 완료", sub: "STEPHEN HAWKING · CLEAR", build: function (b, foot) {
        b.innerHTML = '<div class="clear-copy"><div class="stamp">STAGE CLEAR</div><h3>스티븐 호킹</h3><p>이 교실의 모든 기록을 확인하고 마지막 문까지 열었습니다.<br>영상을 다시 보거나 다음 스테이지로 이동할 수 있습니다.</p></div>' +
          '<p class="mini" style="text-align:center">스테이지 2 · 챕터 1로 이동합니다.</p>';
        var stay = el("button", "btn", "교실에 남기"), rep = el("button", "btn", "영상 다시보기"), next = el("button", "btn primary", "다음 스테이지");
        [stay, rep, next].forEach(function (x) { x.type = "button"; foot.appendChild(x); });
        stay.onclick = function () { UI.closeSheet(); };
        rep.onclick = function () { UI.closeSheet(true); setTimeout(SC.showEnding, 80); };
        next.onclick = function () { UI.closeSheet(true); hooks.goNextStage && hooks.goNextStage(); };
      } });
    };

    /* ───────── 엔딩 ───────── */
    SC.closeEnding = function () {
      var x = doc.getElementById("ending"); if (!x) return;
      var v = x.querySelector("video"); if (v) { try { v.pause(); } catch (e) {} }
      x.remove(); UI.flags.ending = false; hooks.onEndingClosed && hooks.onEndingClosed();
    };
    SC.showEnding = function () {
      SC.closeEnding(); UI.closeSheet(true); UI.flags.ending = true;
      var x = el("section"); x.id = "ending"; x.setAttribute("role", "dialog"); x.setAttribute("aria-label", "엔딩");
      x.innerHTML = '<div class="ending-credits"><div class="ending-inner">' +
        '<div class="ending-kicker">STEPHEN HAWKING · FINAL MEMORY</div><h2 class="ending-name">스티븐 호킹</h2><div class="ending-years">1942 — 2018</div>' +
        '<section class="ending-sec"><div class="ending-label">ABOUT HIM</div><p>이론물리학자이자 우주론자. 블랙홀과 우주의 기원, 시간과 공간에 관한 질문을 끝까지 붙들었고, 어려운 과학을 더 많은 사람에게 전하려 했습니다.</p></section>' +
        '<section class="ending-sec"><div class="ending-label">WHY THIS ROOM EXISTS</div><p>이 방탈출은 정답 하나를 맞히는 것보다, 한 사람의 삶을 따라가며 흩어진 기록과 과학의 단서를 직접 연결해 보도록 만들었습니다. 호기심이 또 다른 질문으로 이어지는 경험이 되길 바랐습니다.</p></section>' +
        '<section class="ending-sec"><div class="ending-label">TO THE PLAYER</div><p>여기까지 모든 기억의 조각을 찾아낸 것을 축하합니다.<br>스티븐 호킹의 교실을 끝까지 완주했습니다.</p></section>' +
        '<section class="ending-sec ending-exit"><strong>ONE LAST EXIT</strong><p style="font:400 16px/1.8 ' + FONT + ';color:#dbe5d8">교실을 나가기 위한 마지막 절차가 남았습니다.<br><b>다시 한 번 [시작]을 누르고 코드 0808을 입력하세요.</b></p><span class="ending-code">0808</span></section>' +
        '<div style="padding:8px 0 40px;font:400 14px/1.9 ' + FONT + ';color:#93a598;text-align:center">1942년 1월 8일 — 갈릴레이가 세상을 떠난 지 300년 되는 날에 태어나<br>2018년 3월 14일 — 아인슈타인이 태어난 날에 눈을 감다.</div>' +
        '</div></div><div class="ending-film"><video controls autoplay playsinline src="' + A.videoFinale + '"></video></div>' +
        '<button type="button" class="ending-close">교실로 돌아가기</button>';
      doc.body.appendChild(x);
      var cb = x.querySelector(".ending-close"); cb.onclick = SC.closeEnding; try { cb.focus({ preventScroll: true }); } catch (e) {}
      var vid = x.querySelector("video"); if (vid && vid.play) { var pr = vid.play(); if (pr && pr.catch) pr.catch(function () {}); }
      doc.addEventListener("keydown", function esc(e) { if (!doc.getElementById("ending")) { doc.removeEventListener("keydown", esc, true); return; } if (e.key === "Escape") { SC.closeEnding(); doc.removeEventListener("keydown", esc, true); } }, true);
    };

    /* ───────── 메뉴 ───────── */
    SC.showMenu = function () {
      UI.openSheet({ title: "메뉴", sub: "NAMELESS CLASSROOM", build: function (b, foot) {
        var touch = UI.isTouch;
        var guide = el("div", "list");
        function row(k, v) { return "<dt>" + k + "</dt><dd>" + v + "</dd>"; }
        guide.innerHTML = '<div class="item"><div class="in" style="border:0;padding:12px 14px"><dl style="margin:0;grid-template-columns:' + (touch ? "104px" : "150px") + ' 1fr">' +
          (touch
            ? row("왼쪽 스틱", "걸어 다니기") + row("화면 끌기", "둘러보기") + row("물건 누르기", "조사하기") + row("노란 버튼", "가리킨 물건 조사") + row("숙이기", "책상 아래를 볼 때")
            : row("W A S D / 방향키", "걸어 다니기") + row("화면 끌기", "둘러보기") + row("클릭 · E · Space", "조사하기") + row("C", "숙이기 (책상 아래)") + row("F", "전체 화면") + row("Esc", "이 메뉴 · 창 닫기")) +
          "</dl></div></div>";
        b.appendChild(guide);
        b.appendChild(el("p", "mini", "암호는 교탁 위 컴퓨터에 입력합니다. 정답은 숫자 또는 영어만 쓰고, 대소문자와 띄어쓰기는 구분하지 않습니다."));
        var sens = el("div", "item"); sens.style.marginTop = "12px";
        sens.innerHTML = '<div class="in" style="border:0;padding:12px 14px"><label style="display:flex;gap:12px;align-items:center;font:700 14px ' + FONT + '">시선 감도<input type="range" min="0.5" max="2" step="0.1" style="flex:1;accent-color:#c2382b" value="' + UI.sensitivity + '" aria-label="시선 감도"><output style="min-width:2.4em;text-align:right;font:600 13px ui-monospace,monospace"></output></label></div>';
        var rng = sens.querySelector("input"), out = sens.querySelector("output"); out.textContent = "×" + (+rng.value).toFixed(1);
        rng.oninput = function () { out.textContent = "×" + (+rng.value).toFixed(1); UI.setSensitivity(+rng.value); };
        b.appendChild(sens);
        var close = el("button", "btn primary", "이어서 하기"), rs = el("button", "btn", "처음부터 다시");
        [close, rs].forEach(function (x) { x.type = "button"; foot.appendChild(x); });
        close.onclick = function () { UI.closeSheet(); };
        var armed = 0, t;
        rs.onclick = function () {
          if (!armed) { armed = 1; rs.textContent = "정말 지울까요? 한 번 더 누르세요"; rs.style.borderColor = "#c2382b"; rs.style.color = "#c2382b"; t = setTimeout(function () { armed = 0; rs.textContent = "처음부터 다시"; rs.style.borderColor = rs.style.color = ""; }, 4200); return; }
          clearTimeout(t); UI.closeSheet(true); hooks.restart && hooks.restart();
        };
        if (UI.fullscreenSupported) {
          var fs = el("button", "btn", "전체 화면"); fs.type = "button"; fs.onclick = function () { UI.toggleFullscreen(); }; foot.insertBefore(fs, rs);
        }
      } });
    };

    /* ───────── 인트로 ───────── */
    SC.bindIntro = function () {
      var cont = doc.getElementById("go-cont"), neu = doc.getElementById("go-new");
      cont.disabled = !M.hasSave();
      neu.onclick = function () { hooks.begin && hooks.begin(true); };
      cont.onclick = function () { hooks.begin && hooks.begin(false); };
    };
    SC.showIntro = function () { UI.flags.intro = true; doc.getElementById("intro").classList.remove("hidden"); SC.bindIntro(); UI.showHud(false); };
    SC.hideIntro = function () { UI.flags.intro = false; doc.getElementById("intro").classList.add("hidden"); };

    return SC;
  }
  root.N1Screens = { create: create };
})(window);
