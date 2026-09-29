/* ============================================================================
   이름 없는 교실 · 스테이지 1 — 부팅과 프레임 루프
   순서: 저장·모델 → 화면 뼈대 → (단계별로 끊어) 렌더러·방·빛·월드 → 조작 → 인트로
   3D 자산 파일은 하나도 없다. 방은 전부 코드로 만든다(kit/·props/·room/).
   ========================================================================== */
(function () {
  "use strict";
  var T = THREE, K = N1K, A = K.anim, R = N1R, D = N1Data, ASSETS = window.ASSETS || {};
  var doc = document, $ = N1UI.$;
  var q = new URLSearchParams(location.search);
  var IS_TOUCH = ("ontouchstart" in window) || (navigator.maxTouchPoints > 0);
  doc.body.classList.toggle("touch", IS_TOUCH);

  /* ── 화질: 기기에 맞춰 시작하고, 프레임이 모자라면 해상도부터 내린다 ── */
  var QNAME = q.get("q") || (IS_TOUCH ? "mobile" : "desktop");
  var Q = { desktop: { dprMax: 2, shadow: 2048, dust: 220, aniso: 8, fps: 55 }, mobile: { dprMax: 1.5, shadow: 1024, dust: 120, aniso: 4, fps: 30 },
    low: { dprMax: 1, shadow: 1024, dust: 60, aniso: 2, fps: 30 } }[QNAME] || { dprMax: 2, shadow: 2048, dust: 220, aniso: 8, fps: 55 };
  var dprMax = Math.min(window.devicePixelRatio || 1, Q.dprMax), dprMin = 0.75, dpr = dprMax;

  /* ── 저장소: 접근이 막혀 있어도 게임은 돌아간다(메모리에만 남는다) ── */
  function safeStorage() {
    try { var s = window.localStorage; s.getItem("n1-probe"); return s; }
    catch (e) { return { getItem: function () { return null; }, setItem: function () { throw new Error("storage blocked"); }, removeItem: function () {} }; }
  }
  var store = N1Storage.createStore({ localStorage: safeStorage(), emit: function (name, detail) { window.dispatchEvent(new CustomEvent(name, { detail: detail })); } });
  var M = N1Model.create({ data: D, logic: window, storage: N1Storage, store: store });
  window.addEventListener("nameless:save-memory-only", function () { if (!window.__warnedSave) { window.__warnedSave = 1; UI.toast("이 브라우저는 진행을 저장하지 못합니다. 창을 닫으면 처음부터 시작합니다.", "bad"); } });
  window.addEventListener("nameless:save-recovered", function () { UI.toast("손상된 저장을 복구했습니다.", "good"); });

  /* ── 화면 뼈대 ── */
  var OPEN = { x: 0, z: 3.1, yaw: Math.PI, pitch: -0.13 };
  var World, Ctl, Inter, renderer, scene, camera, Lay, Light;
  var transitioning = false;
  var hooks = {
    onSheet: function (open) { if (Ctl) Ctl.clearInput(); if (open) UI.clearHover(); },
    onSensitivity: function (v) { if (Ctl) Ctl.sensitivity = v; },
    begin: function (isNew) {
      if (isNew) M.startNew(); else if (!M.continueSaved()) { UI.toast("저장된 진행이 없습니다.", "bad"); return; }
      UI.resetPieces(); World.applyState(M.S, true);
      SC.hideIntro(); UI.showHud(true); UI.renderHUD(); UI.hintFade();
      Ctl.setView(OPEN.x, OPEN.z, OPEN.yaw, OPEN.pitch); Ctl.crouch = false; Ctl.clearInput();
      if (IS_TOUCH) { UI.enterFullscreen(); UI.lockLandscape(); }
    },
    restart: function () {
      M.startNew(); UI.resetPieces(); World.applyState(M.S, true); UI.renderHUD();
      Ctl.setView(OPEN.x, OPEN.z, OPEN.yaw, OPEN.pitch); SC.showIntro();
    },
    onFinalOk: function () { setTimeout(SC.showEnding, 180); },
    onExitOpened: function () {
      UI.flags.exiting = true; UI.clearHover();
      World.playExit(camera, Ctl, function () { UI.flags.exiting = false; SC.showClear(); });
    },
    onEndingClosed: function () { Ctl.clearInput(); },
    goNextStage: function () {
      if (transitioning) return; transitioning = true; Ctl.clearInput();
      try { M.save(); } catch (e) {}
      UI.closeSheet(true); SC.closeEnding();
      var fade = doc.getElementById("stage-transition"); if (fade) fade.remove();
      fade = N1UI.el("div"); fade.id = "stage-transition"; doc.body.appendChild(fade);
      requestAnimationFrame(function () { requestAnimationFrame(function () { fade.classList.add("on"); }); });
      try { sessionStorage.setItem("nameless-stage2-access", "0808"); } catch (e) {}
      setTimeout(function () { location.href = "../stage2/"; }, 1250);
    }
  };
  var UI = N1UI.create({ model: M, data: D, isTouch: IS_TOUCH, hooks: hooks });
  var SC = N1Screens.create({ ui: UI, model: M, data: D, assets: ASSETS, hooks: hooks });
  UI.checkOrient(); UI.setLoading(0.04, "교실을 여는 중…");
  $("#t-menu").onclick = function () { SC.showMenu(); };
  M.on(function (kind) { if (kind === "change") UI.renderHUD(); });

  /* ── 해상도·화각 ── */
  function fovFor(aspect) {
    if (aspect < 0.75) return 84;
    if (aspect < 1.25) return 70;
    var hf = 86 * Math.PI / 180;                                     /* 가로 화각을 86° 로 고정 — 좌우 가장자리 왜곡을 막는다 */
    return K.clamp((2 * Math.atan(Math.tan(hf / 2) / aspect)) * 180 / Math.PI, 46, 60);
  }
  var resizeQueued = false;
  function resize() {
    if (!renderer) return;
    var w = window.innerWidth, h = window.innerHeight;
    renderer.setPixelRatio(dpr); renderer.setSize(w, h, false);
    camera.aspect = w / h; camera.fov = fovFor(camera.aspect); camera.updateProjectionMatrix();
  }
  window.addEventListener("resize", function () { if (resizeQueued) return; resizeQueued = true; requestAnimationFrame(function () { resizeQueued = false; resize(); }); });

  /* ── 초상화: 디코딩까지 끝낸 뒤 방에 건다 ── */
  function loadPortraits() {
    var ids = ["newton", "archimedes", "abel", "einstein", "galilei", "gauss"], out = {};
    return Promise.all(ids.map(function (id) {
      return new Promise(function (ok) {
        var img = new Image();
        img.onload = img.onerror = function () { var t = new T.Texture(img); t.encoding = T.sRGBEncoding; t.anisotropy = Q.aniso; t.needsUpdate = true; out[id] = t; ok(); };
        img.src = ASSETS["portrait_" + id];
      });
    })).then(function () { return out; });
  }
  function tick() { return new Promise(function (ok) { requestAnimationFrame(function () { setTimeout(ok, 0); }); }); }

  /* ── 부팅 ── */
  async function boot() {
    if (!window.WebGLRenderingContext) throw new Error("WebGL 미지원");
    var cv = $("#scene");
    renderer = new T.WebGLRenderer({ canvas: cv, antialias: true, powerPreference: "high-performance" });
    renderer.outputEncoding = T.sRGBEncoding; renderer.toneMapping = T.ACESFilmicToneMapping; renderer.toneMappingExposure = 0.95;
    renderer.shadowMap.enabled = true; renderer.shadowMap.type = QNAME === "desktop" ? T.PCFSoftShadowMap : T.PCFShadowMap;
    renderer.shadowMap.autoUpdate = false; renderer.shadowMap.needsUpdate = true;      /* 움직임이 있을 때만 그림자를 다시 그린다 */
    K.tex.setAnisotropy(Math.min(Q.aniso, renderer.capabilities.getMaxAnisotropy()));
    cv.addEventListener("webglcontextlost", function (e) { e.preventDefault(); try { M.save(); } catch (_) {} UI.toast("화면 연결이 끊겼습니다. 다시 불러옵니다…", "bad"); setTimeout(function () { location.reload(); }, 1600); });
    scene = new T.Scene(); camera = new T.PerspectiveCamera(60, 1, 0.05, 80); camera.rotation.order = "YXZ";
    camera.position.set(OPEN.x, N1C.EYE, OPEN.z); scene.add(camera);
    resize();
    UI.setLoading(0.12, "벽과 바닥");
    await tick();
    var shell = R.buildShell(scene); scene.add(shell.group);
    UI.setLoading(0.3, "빛");
    await tick();
    Light = R.buildLighting(scene, renderer, { shadowSize: Q.shadow, dust: Q.dust }); scene.add(Light.group);
    UI.setLoading(0.42, "초상화");
    var portraits = await loadPortraits();
    UI.setLoading(0.55, "책상과 소품");
    await tick();
    Lay = R.layout(scene, { portraits: portraits, sciences: D.SCI }); scene.add(Lay.group);
    UI.setLoading(0.8, "마무리");
    await tick();
    K.setEnvIntensity(scene, Light.baseEnv);
    World = N1W.create({ scene: scene, layout: Lay, light: Light, data: D, model: M, renderer: renderer });
    Ctl = N1C.create({
      canvas: cv, camera: camera, hotspots: World.active, joy: $("#joy"), joyKnob: $("#joyk"),
      blocked: function () { return UI.blocked(); },
      onHover: function (t, far, x, y) { UI.setHover(t, far, x, y); },
      onHoverMove: function (x, y) { UI.moveLabel(x, y); },
      onPick: function (t) { Inter.interact(t.userData.hot.id); },
      onTooFar: function () { UI.toast("더 가까이 가세요."); },
      onCrouch: function (on) { $("#crouch").classList.toggle("on", on); },
      onFullscreen: function () { UI.toggleFullscreen(); }
    });
    Ctl.sensitivity = UI.sensitivity;
    Inter = N1I.create({ model: M, data: D, ui: UI, screens: SC, world: World, controls: Ctl });
    $("#crouch").onclick = function () { Ctl.toggleCrouch(); };
    $("#act").onclick = function () { Ctl.pickCenter(); };
    Ctl.setView(OPEN.x, OPEN.z, OPEN.yaw, OPEN.pitch);
    World.applyState(M.S, true);
    UI.setLoading(0.95, "셰이더");
    await tick();
    try { renderer.compile(scene, camera); } catch (e) {}
    renderer.render(scene, camera);
    UI.setLoading(1, "");
    SC.bindIntro();
    UI.hideLoading();
    if (q.get("debug")) window.__n1 = { M: M, W: World, C: Ctl, UI: UI, SC: SC, I: Inter, R: renderer, scene: scene, camera: camera, L: Lay, light: Light, begin: hooks.begin, K: K };
    window.__ready = true;
    requestAnimationFrame(loop);
  }

  /* ── 프레임 루프 ── */
  var last = 0, frame = 0, ema = 0.016, sinceAdjust = 0;
  function loop(ts) {
    requestAnimationFrame(loop);
    var now = ts / 1000, dt = last ? Math.min(now - last, 0.1) : 0; last = now;
    if (doc.hidden) return;
    frame++;
    if (UI.flags.intro) { Ctl.yaw = OPEN.yaw + Math.sin(now * 0.11) * 0.06; Ctl.pitch = OPEN.pitch + Math.sin(now * 0.08) * 0.012; }
    Ctl.update(dt, now);
    World.update(dt, now, camera.position);
    var wideSheet = UI.sheetOpen() && (doc.getElementById("sheet").classList.contains("wide") || doc.getElementById("sheet").classList.contains("center"));
    if (UI.flags.ending) return;                                    /* 엔딩이 화면을 덮는 동안 3D 는 쉰다 */
    if (wideSheet ? (frame & 3) : (UI.sheetOpen() && (frame & 1))) return;
    /* 그림자는 움직임이 있을 때 매 프레임, 그렇지 않으면 가끔(커튼·지구본·숨쉬기 정도) */
    if (A.busy() || Ctl.focus || (frame % 10) === 0) renderer.shadowMap.needsUpdate = true;
    renderer.render(scene, camera);
    /* 프레임이 모자라면 해상도를 조금 내리고, 넉넉하면 조금 올린다 */
    if (dt > 0) ema = ema * 0.94 + dt * 0.06;
    sinceAdjust += dt;
    if (sinceAdjust > 3 && frame > 120) {
      sinceAdjust = 0; var fps = 1 / ema;
      if (fps < Q.fps * 0.82 && dpr > dprMin) { dpr = Math.max(dprMin, dpr - 0.2); resize(); ema = 1 / Q.fps; }
      else if (fps > Q.fps * 1.02 && dpr < dprMax) { dpr = Math.min(dprMax, dpr + 0.1); resize(); ema = 1 / Q.fps; }
    }
  }

  /* ── 창·입력 상태 ── */
  window.addEventListener("pagehide", function () { if (Ctl) Ctl.clearInput(); try { M.save(); } catch (e) {} });
  doc.addEventListener("visibilitychange", function () { if (doc.hidden) { if (Ctl) Ctl.clearInput(); try { M.save(); } catch (e) {} } else { last = 0; } });
  window.addEventListener("keydown", function (e) {
    if (e.key === "Escape" && !UI.sheetOpen() && !UI.flags.intro && !UI.flags.loading && !UI.flags.ending && !UI.flags.exiting) { e.preventDefault(); SC.showMenu(); }
  });
  $("#keyhint").innerHTML = "<kbd>W</kbd><kbd>A</kbd><kbd>S</kbd><kbd>D</kbd> 이동 · 화면 끌기 시선 · 클릭 조사 · <kbd>C</kbd> 숙이기 · <kbd>Esc</kbd> 메뉴";

  boot().catch(function (err) {
    console.error(err);
    UI.failLoading("3D 화면을 열지 못했습니다: " + (err && err.message ? err.message : err));
  });
})();
