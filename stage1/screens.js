/* ============================================================================
   N1Screens — 화면 내용: 일기, 자료, 단말기, 기억 조립, 뒷문, 엔딩, 메뉴.
   ui.js 의 종이 패널 위에 올라간다. 규칙은 모델(M)에 묻고, 결과만 보여 준다.
   ========================================================================== */
(function (root) {
  "use strict";
  var doc = root.document, el = root.N1UI.el;
  var FONT = "'Noto Sans KR','Malgun Gothic','Apple SD Gothic Neo',system-ui,sans-serif";

  function create(o) {
    var UI = o.ui, M = o.model, D = o.data, hooks = o.hooks || {}, A = o.assets || {}, S = M.S, TL = o.tools || {};
    var SC = {};

    /* ───────── 일기 ───────── */
    /* 기억 복원: 맞힌 장의 일기에서 비워졌던 곳을 잉크로 되살린다 (1장은 빈칸 숫자, 2·4장은 검게 지워진 낱말) */
    function restore(a, n) {
      var ans = M.solvedAnswer && M.solvedAnswer(n); if (!ans) return;
      if (n === 1) {
        var bl = a.querySelectorAll(".blank");
        for (var i = 0; i < bl.length && i < ans.length; i++) { bl[i].textContent = ans.charAt(i); bl[i].classList.add("filled"); }
      } else if (root.N1Puz && root.N1Puz.RESTORE[n]) {
        var rd = a.querySelector(".redacted"); if (rd) { rd.textContent = root.N1Puz.RESTORE[n]; rd.classList.add("restored"); }
      }
    }
    function diaryArticle(key, n) {
      var a = el("article", "diary", D.DIARY_HTML[key]); restore(a, n);
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
      if (TL[kind] && kind !== "padView") { TL[kind](host); return; }   /* 4~8장 도구·자료(tools.js) */
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
    var REF_LOCAL = { morseChart: "모스 부호 해독표" };                    /* data.js 에 없는 새 자료의 이름 */
    SC.showRefs = function (kind) {
      var p = kind || D.PUZZLE_REF[M.chapter().puzzle];
      UI.openSheet({ title: REF_LOCAL[p] || D.REF_TITLE[p] || "자료", sub: "교실에 비치된 인쇄물", build: function (b) { renderResource(p, b); } });
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
        var k = root.N1Input.crt(e, number);
        if (!k) return;
        e.preventDefault(); e.stopPropagation();
        if (k.kind === "char") { add(k.ch); press(k.ch); }
        else if (k.kind === "back") { state = state.slice(0, -1); paint(); }
        else if (k.kind === "enter") api.submit();
      }
      api.detach = function () { doc.removeEventListener("keydown", onKey, true); if (activeCRT === api) activeCRT = null; };
      api.attach = function (sheetApi) { activeCRT = api; doc.addEventListener("keydown", onKey, true); sheetApi.cleanup(api.detach); };
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

    /* 정답 입력 단말: 교탁의 컴퓨터와 퍼즐 자리(명단·테이프)가 같은 것을 쓴다.
       right: 통과하면 이 칸이 '암호 해제' 패널로 바뀐다. sheetApi: 패널 정리용 */
    function answerCRT(c, right, sheetApi) {
      var crt = makeCRT({ label: "SCHOLARSHIP TERMINAL — CHAPTER " + c.n, rule: "숫자 또는 영어 · 대소문자 무관 · 띄어쓰기 없음", mode: (c.n === 1 || c.n === 8) ? "number" : "alpha",
        empty: "정답을 입력하세요", submitText: "확인",
        onSubmit: function (raw) {
          var r = M.answer(raw);
          if (r.ok) {
            UI.toast("암호 해제 — 단서: “" + r.cue + "”", "good");
            crt.detach();                                  /* 통과했으니 Enter 는 이제 '조사하러 간다' 버튼의 것이다 */
            right.innerHTML = ""; right.appendChild(acceptedPanel(c));
            var eb = el("button", "btn primary", "교실을 조사하러 간다"); eb.style.marginTop = "12px"; eb.onclick = function () { UI.closeSheet(); }; right.appendChild(eb);
            try { eb.focus({ preventScroll: true }); } catch (e) {}
            hooks.onAnswered && hooks.onAnswered(c.n);
            return true;
          }
          UI.toast(r.reason === "empty" ? "정답을 입력하세요." : "암호가 맞지 않습니다.", "bad");
          if (r.reason === "wrong") hooks.onWrong && hooks.onWrong(c.n);
          return false;
        } });
      return crt;
    }
    /* 단말기 옆 탭의 자료: 2장은 옛 기호 종이 대신 과학자 자료를 보여 준다(퍼즐은 액자 앞에서 푼다) */
    var AID = { 2: { kind: "sci", title: "수학자·과학자 자료" }, 4: { kind: "morseLog", title: "신호 기록" }, 7: { kind: "words", title: "쪽지 메모" } };
    SC.showComputer = function () {
      if (S.done) { SC.showEnding(); return; }
      if (S.ch > 8) { SC.showName(); return; }
      var c = M.chapter(), spec = AID[c.n] || D.TERMINAL_AID[c.n] || { kind: null };
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
        var crt = answerCRT(c, right, api);
        right.appendChild(crt.el); layout.appendChild(left); layout.appendChild(right); b.appendChild(layout);
        crt.attach(api);
      } });
    };

    /* ───────── 이름 말하기 ─────────
       탑이 완성되면 블록에 이름의 뼈대(모음이 지워진 글자)가 새겨진다. 그 글자를 읽고, 그 사람의 이름을 스스로 입력한다.
       성+이름, 성만 쳐도 받는다(model.submitFinal → finalAccepts). */
    SC.showName = function () {
      UI.openSheet({ title: "그의 이름", sub: "탑에 새겨진 글자를 읽고 이름을 입력하세요", mode: "center", cls: "name-sheet", build: function (b, foot, api) {
        var layout = el("div", "name-layout"), plate = el("div", "name-plate"), term = el("div", "a-final");
        var cv = root.N1Icons.engrave(root.finalSkeleton().split(" "), 720, 300); cv.className = "name-engrave";
        cv.setAttribute("role", "img"); cv.setAttribute("aria-label", "탑에 새겨진 글자: " + root.finalSkeleton());
        plate.appendChild(cv);
        plate.appendChild(el("p", "mini", "탑의 블록에 새겨진 글자다. 이름에서 모음이 지워져 있다. 여덟 조각이 가리키는 사람의 이름을 영어로 대 보자. 성만 쳐도, 이름 전체를 쳐도 된다."));
        var crt = makeCRT({ label: "FINAL", rule: "영어 · 대소문자 무관 · 띄어쓰기 없음", mode: "alpha", empty: "그의 이름을 입력하세요", submitText: "제출",
          onSubmit: function (raw) {
            var r = M.submitFinal(raw);
            if (r.ok) { UI.closeSheet(true); hooks.onFinalOk && hooks.onFinalOk(); return true; }
            UI.toast(r.reason === "empty" ? "이름을 입력하세요." : "다시 읽어 보세요.", "bad");
            if (r.reason === "wrong") hooks.onWrong && hooks.onWrong(10);
            return false;
          } });
        term.appendChild(crt.el); layout.appendChild(plate); layout.appendChild(term); b.appendChild(layout); crt.attach(api);
        api.refresh();
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
        b.appendChild(el("p", "mini", "교탁의 컴퓨터는 답을 넣어야 할 때에만 켜집니다. 정답은 숫자 또는 영어만 쓰고, 대소문자와 띄어쓰기는 구분하지 않습니다."));
        var sens = el("div", "item"); sens.style.marginTop = "12px";
        sens.innerHTML = '<div class="in" style="border:0;padding:12px 14px"><label style="display:flex;gap:12px;align-items:center;font:700 14px ' + FONT + '">시선 감도<input type="range" min="0.5" max="2" step="0.1" style="flex:1;accent-color:#c2382b" value="' + UI.sensitivity + '" aria-label="시선 감도"><output style="min-width:2.4em;text-align:right;font:600 13px ui-monospace,monospace"></output></label></div>';
        var rng = sens.querySelector("input"), out = sens.querySelector("output"); out.textContent = "×" + (+rng.value).toFixed(1);
        rng.oninput = function () { out.textContent = "×" + (+rng.value).toFixed(1); UI.setSensitivity(+rng.value); };
        b.appendChild(sens);
        /* 화면 스타일: 재질이 통째로 달라서 바꾸면 다시 불러온다(진행은 저장되고, 돌아오면 곧장 이어진다) */
        var style = el("div", "item"); style.style.marginTop = "12px";
        var now = (root.N1K && root.N1K.style) === "real" ? "real" : "toon";
        style.innerHTML = '<div class="in" style="border:0;padding:12px 14px"><div style="display:flex;gap:12px;align-items:center;flex-wrap:wrap;font:700 14px ' + FONT + '">화면 스타일' +
          '<span class="seg" role="group" aria-label="화면 스타일"><button type="button" data-s="toon" aria-pressed="' + (now === "toon") + '">카툰</button><button type="button" data-s="real" aria-pressed="' + (now === "real") + '">사실적</button></span></div>' +
          '<p class="mini" style="margin:8px 0 0">바꾸면 화면을 다시 불러옵니다. 진행은 저장됩니다.</p></div>';
        [].forEach.call(style.querySelectorAll("button[data-s]"), function (bt) {
          bt.onclick = function () { if (bt.getAttribute("data-s") !== now) hooks.setStyle && hooks.setStyle(bt.getAttribute("data-s")); };
        });
        b.appendChild(style);
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

    SC.kit = { padView: TL.padView, makeCRT: makeCRT, answerCRT: answerCRT, acceptedPanel: acceptedPanel, diaryArticle: diaryArticle, renderResource: renderResource, sciHTML: sciHTML, sportHTML: sportHTML, FONT: FONT };
    return SC;
  }
  root.N1Screens = { create: create };
})(window);
