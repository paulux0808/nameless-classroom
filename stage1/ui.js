/* ============================================================================
   N1UI — 화면 뼈대: HUD, 알림, 종이 패널(sheet), 인트로·메뉴, 조준 표시, 터치 버튼.
   각 화면의 내용(일기·단말기·조립·문·엔딩)은 screens.js 가 이 패널 위에 올린다.
   모델(M)의 상태를 읽어 그리기만 하고, 규칙은 모른다.
   ========================================================================== */
(function (root) {
  "use strict";
  var doc = root.document;
  function $(s, r) { return (r || doc).querySelector(s); }
  function el(tag, cls, html) { var d = doc.createElement(tag); if (cls) d.className = cls; if (html != null) d.innerHTML = html; return d; }
  function store(k, v) { try { if (v === undefined) return root.localStorage.getItem(k); root.localStorage.setItem(k, v); } catch (e) { return null; } }

  var FOCUSABLE = "button:not([disabled]), a[href], input:not([disabled]), summary, [tabindex]:not([tabindex='-1'])";

  function create(o) {
    var M = o.model, D = o.data, hooks = o.hooks || {};
    var UI = { el: el, $: $, isTouch: !!o.isTouch, flags: { intro: true, loading: true, ending: false, exiting: false } };
    var prevPieces = null;

    /* ── 알림 ── */
    var toastEl = $("#toast"), toastT = 0;
    UI.toast = function (msg, kind) {
      toastEl.textContent = msg; toastEl.className = "show " + (kind || "");
      clearTimeout(toastT); toastT = setTimeout(function () { toastEl.classList.remove("show"); }, kind === "good" ? 3600 : 2800);
    };

    /* ── HUD ── */
    var hud = $("#hud"), hudCh = $("#hud-ch"), hudTitle = $("#hud-title"), slatsEl = $("#slats"), noteEl = $("#note");
    for (var i = 1; i <= 8; i++) slatsEl.appendChild(el("i", "slat", "" + i));
    UI.renderHUD = function () {
      var h = M.hud(), S = M.S, slats = slatsEl.children;
      hudCh.textContent = h.kicker; hudTitle.textContent = h.title;
      for (var k = 0; k < 8; k++) {
        var on = h.pieces[k], had = prevPieces && prevPieces[k];
        slats[k].classList.toggle("on", on);
        if (on && prevPieces && !had) { slats[k].classList.remove("pop"); void slats[k].offsetWidth; slats[k].classList.add("pop"); }
      }
      prevPieces = h.pieces.slice();
      var html = "";
      if (h.objective && h.objective.main) html += "<b>" + h.objective.main + "</b>";
      if (h.objective && h.objective.hint) html += '<span class="hint">' + h.objective.hint + "</span>";
      /* 옛 화면에는 없던 안내: 다음에 할 일이 비어 있을 때만 한 줄 */
      if (!html && !S.done) {
        if (h.kicker === "FINAL") html = '<span class="hint">교탁의 컴퓨터에서 기억 조각을 맞추세요.</span>';
        else if (S.phase === "read" && S.tookD1) html = '<span class="hint">교탁의 컴퓨터에 암호를 입력하세요.</span>';
        else if (!S.tookD1) html = '<span class="hint">책상 위의 일기를 눌러 읽어 보세요.</span>';
      }
      if (noteEl.innerHTML !== html) { noteEl.innerHTML = html; if (html) { noteEl.style.animation = "none"; void noteEl.offsetWidth; noteEl.style.animation = ""; } }
    };
    UI.resetPieces = function () { prevPieces = null; };

    /* ── 종이 패널 ── */
    var sheet = $("#sheet"), card = $(".sheet-card", sheet), body = $("#sh-body"), foot = $("#sh-foot"), titleEl = $("#sh-title"), subEl = $("#sh-sub"), veil = $("#veil");
    var cur = null;
    UI.sheetOpen = function () { return !!cur; };
    UI.sheetBody = function () { return body; };
    function refreshScroll() {
      var can = body.scrollHeight > body.clientHeight + 6 && body.scrollTop + body.clientHeight < body.scrollHeight - 8;
      card.classList.toggle("can-scroll", can);
    }
    body.addEventListener("scroll", refreshScroll, { passive: true });
    root.addEventListener("resize", function () { if (cur) refreshScroll(); });
    /* o: {title, sub, mode:"side"|"wide"|"center", build(body, foot, api), onClose, closeText, flush} */
    UI.openSheet = function (s) {
      if (cur) UI.closeSheet(true);
      var active = doc.activeElement;
      cur = { onClose: s.onClose || null, cleanup: [], back: (active && active !== doc.body) ? active : null, dismiss: s.dismiss !== false };
      titleEl.textContent = s.title || ""; subEl.textContent = s.sub || "";
      sheet.className = (s.mode === "wide" ? "wide" : s.mode === "center" ? "center" : "") + (s.cls ? " " + s.cls : "");
      body.innerHTML = ""; foot.innerHTML = ""; body.scrollTop = 0;
      body.style.overflow = s.flush ? "hidden" : ""; body.style.padding = s.flush ? "0" : "";
      var api = { cleanup: function (fn) { cur.cleanup.push(fn); }, refresh: refreshScroll, close: function () { UI.closeSheet(); } };
      if (s.build) s.build(body, foot, api);
      var xb = $("[data-x]", card); xb.textContent = "×"; xb.setAttribute("aria-label", s.closeText || "닫기"); xb.title = s.closeText || "닫기";
      if (s.closeText && s.closeText !== "닫기") { var cb = el("button", "btn primary", s.closeText); cb.onclick = function () { UI.closeSheet(); }; foot.appendChild(cb); }
      sheet.classList.remove("hidden", "closing"); veil.classList.add("on"); doc.body.classList.add("sheet-open");
      doc.body.classList.toggle("sheet-wide", s.mode === "wide" || s.mode === "center");
      hooks.onSheet && hooks.onSheet(true);
      var first = $(s.focus || ".sheet-foot .btn, .sheet-body button, .sheet-body a[href], .sheet-body input", card) || xb;
      try { first.focus({ preventScroll: true }); } catch (e) {}
      setTimeout(refreshScroll, 60);
      return api;
    };
    UI.closeSheet = function (silent) {
      if (!cur) return;
      var c = cur; cur = null;
      c.cleanup.forEach(function (fn) { try { fn(); } catch (e) {} });
      body.querySelectorAll("video").forEach(function (v) { try { v.pause(); } catch (e) {} });
      veil.classList.remove("on"); doc.body.classList.remove("sheet-open", "sheet-wide");
      if (silent) sheet.classList.add("hidden");
      else { sheet.classList.add("closing"); setTimeout(function () { if (!cur) sheet.classList.add("hidden"); sheet.classList.remove("closing"); }, 190); }
      if (c.back && doc.contains(c.back)) { try { c.back.focus({ preventScroll: true }); } catch (e) {} }
      hooks.onSheet && hooks.onSheet(false);
      if (c.onClose && !silent) setTimeout(c.onClose, 0);
    };
    doc.addEventListener("click", function (e) { if (e.target.closest && e.target.closest("[data-x]")) UI.closeSheet(); });
    veil.addEventListener("pointerdown", function () { if (cur && cur.dismiss) UI.closeSheet(); });
    doc.addEventListener("keydown", function (e) {
      if (!cur) return;
      if (e.key === "Escape") { if (cur.dismiss) { e.preventDefault(); e.stopPropagation(); UI.closeSheet(); } return; }   /* 같은 키가 메뉴까지 열지 않게 멈춘다 */
      if (e.key === "Tab") {                                   /* 패널 안에서만 초점이 돈다 */
        var f = [].slice.call(card.querySelectorAll(FOCUSABLE)).filter(function (n) { return n.offsetParent !== null; });
        if (!f.length) return;
        var a = doc.activeElement, i = f.indexOf(a);
        if (e.shiftKey && (i <= 0)) { e.preventDefault(); f[f.length - 1].focus(); }
        else if (!e.shiftKey && (i === f.length - 1 || i < 0)) { e.preventDefault(); f[0].focus(); }
      }
    }, true);

    /* ── 조준점·이름표·조사 버튼 ── */
    var reticle = $("#reticle"), label = $("#label"), act = $("#act");
    UI.setHover = function (t, far, x, y) {
      if (!t) { reticle.classList.remove("hot", "far"); label.classList.remove("show"); act.classList.remove("ready"); return; }
      var h = t.userData.hot;
      reticle.classList.toggle("hot", !far); reticle.classList.toggle("far", !!far);
      label.innerHTML = h.name + (far ? "<i>더 가까이 가세요</i>" : "");
      label.style.left = x + "px"; label.style.top = y + "px"; label.classList.add("show");
      act.innerHTML = "조사" + '<small>' + h.name + "</small>"; act.classList.toggle("ready", !far);
    };
    UI.moveLabel = function (x, y) { label.style.left = x + "px"; label.style.top = y + "px"; };
    UI.clearHover = function () { UI.setHover(null); };

    /* ── 화면 흐름 표시 ── */
    UI.blocked = function () { return !!cur || UI.flags.intro || UI.flags.loading || UI.flags.ending || UI.flags.exiting; };
    UI.showHud = function (v) { hud.classList.toggle("hidden", !v); $("#keyhint").classList.toggle("hidden", !v || UI.isTouch); };
    UI.setLoading = function (p, text) {
      var slats = $("#loading .load-slats").children, n = Math.round(K01(p) * slats.length);
      for (var i = 0; i < slats.length; i++) slats[i].classList.toggle("on", i < n);
      if (text) $("#load-status").textContent = text;
    };
    function K01(v) { return v < 0 ? 0 : v > 1 ? 1 : v; }
    UI.hideLoading = function () { UI.flags.loading = false; $("#loading").classList.add("hidden"); };
    UI.failLoading = function (msg) { $("#load-status").textContent = msg; $("#loading .load-slats").style.display = "none"; };

    /* ── 전체 화면 ── */
    UI.fullscreenSupported = !!(doc.documentElement.requestFullscreen || doc.documentElement.webkitRequestFullscreen);
    UI.toggleFullscreen = function () {
      var d = doc, e = d.documentElement, on = d.fullscreenElement || d.webkitFullscreenElement;
      try {
        var pr = on ? (d.exitFullscreen || d.webkitExitFullscreen).call(d) : (e.requestFullscreen || e.webkitRequestFullscreen).call(e);
        if (pr && pr.catch) pr.catch(function () {});
        if (!on && UI.isTouch) UI.lockLandscape();
      } catch (err) { UI.toast("이 기기에서는 전체 화면을 지원하지 않습니다.", "bad"); }
    };
    UI.enterFullscreen = function () {
      var d = doc, e = d.documentElement;
      if (d.fullscreenElement || d.webkitFullscreenElement) return;
      try { var pr = (e.requestFullscreen || e.webkitRequestFullscreen).call(e); if (pr && pr.catch) pr.catch(function () {}); } catch (err) {}
    };
    UI.lockLandscape = function () { try { var so = root.screen.orientation; if (so && so.lock) so.lock("landscape").catch(function () {}); } catch (e) {} };
    var fsBtn = $("#t-full"); if (!UI.fullscreenSupported) fsBtn.classList.add("hidden");
    fsBtn.onclick = UI.toggleFullscreen;

    /* ── 세로 화면 안내 ── */
    UI.checkOrient = function () { if (UI.isTouch) doc.body.classList.toggle("portrait", root.innerHeight > root.innerWidth); };
    root.addEventListener("resize", UI.checkOrient); root.addEventListener("orientationchange", UI.checkOrient);

    /* ── 시선 감도 (기기마다 손맛이 달라 저장한다) ── */
    UI.sensitivity = parseFloat(store("n1-sens")) || 1;
    UI.setSensitivity = function (v) { UI.sensitivity = v; store("n1-sens", "" + v); hooks.onSensitivity && hooks.onSensitivity(v); };

    /* ── 첫 안내 표시(PC) 은 잠시 뒤 사라진다 ── */
    UI.hintFade = function () { setTimeout(function () { $("#keyhint").classList.add("gone"); }, 16000); };

    return UI;
  }
  root.N1UI = { create: create, el: el, $: $, store: store };
})(window);
