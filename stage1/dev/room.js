/* 개발용 방 미리보기: ?view=open|front|window|frames|back &w=&h= &progress=0..1 &dark=0..1 */
(function () {
  "use strict";
  var T = THREE, K = N1K, R = N1R, P = N1P;
  var q = new URLSearchParams(location.search);
  var W = +q.get("w") || innerWidth, H = +q.get("h") || innerHeight;
  var VIEWS = {
    open:   [0, 1.62, 3.1, Math.PI, -0.13],
    front:  [0, 1.62, -1.4, Math.PI, -0.1],
    window: [-3.1, 1.62, 0.4, Math.PI * 0.5, -0.05],
    frames: [3.4, 1.62, 0.6, -Math.PI * 0.5, -0.05],
    back:   [2.4, 1.62, -1.6, 0, -0.05],
    cross:  [-3.6, 1.55, 2.2, -0.35, -0.12],
    low:    [0.6, 0.55, 2.6, Math.PI, 0.05]
  };
  var view = VIEWS[q.get("view") || "open"] || VIEWS.open;
  if (q.get("cam")) view = q.get("cam").split(",").map(Number);

  var cv = document.getElementById("c");
  var renderer = new T.WebGLRenderer({ canvas: cv, antialias: true, preserveDrawingBuffer: true });
  renderer.setPixelRatio(1); renderer.setSize(W, H, false);
  cv.style.width = W + "px"; cv.style.height = H + "px";
  renderer.outputEncoding = T.sRGBEncoding; renderer.toneMapping = T.ACESFilmicToneMapping; renderer.toneMappingExposure = +q.get("exp") || 1.0;
  renderer.shadowMap.enabled = true; renderer.shadowMap.type = T.PCFSoftShadowMap;
  K.tex.setAnisotropy(Math.min(8, renderer.capabilities.getMaxAnisotropy()));

  var scene = new T.Scene();
  var t0 = performance.now();
  var shell = R.buildShell(scene); scene.add(shell.group);
  var light = R.buildLighting(scene, renderer, {}); scene.add(light.group);
  light.setProgress(+q.get("progress") || 0);
  if (+q.get("dark")) light.setDark(+q.get("dark"));

  /* 자리표시 초상화·자료 (실제 게임은 data.js 의 내용을 쓴다) */
  function portraitTex(hex) { var c = document.createElement("canvas"); c.width = 200; c.height = 240; var x = c.getContext("2d"); x.fillStyle = "#" + hex; x.fillRect(0, 0, 200, 240); x.fillStyle = "rgba(20,15,10,.55)"; x.beginPath(); x.arc(100, 96, 44, 0, 7); x.fill(); x.fillRect(48, 150, 104, 90); var t = new T.CanvasTexture(c); t.encoding = T.sRGBEncoding; return t; }
  var ids = ["newton", "archimedes", "abel", "einstein", "galilei", "gauss"], cols = ["b39b78", "a99a7a", "8f9a86", "a6a29c", "96805f", "8d8c7c"], portraits = {}, sciences = [];
  ids.forEach(function (id, i) { portraits[id] = portraitTex(cols[i]); sciences.push({ id: id, name: id.toUpperCase(), born: "1643. 1. 4.", died: "1727. 3. 31.", key: "핵심 업적 한 줄", body: "잉글랜드의 물리학자·수학자. 자리표시 본문입니다. 실제 게임에서는 자료 데이터가 들어갑니다. 이 문장은 인쇄물 레이아웃을 확인하기 위한 것입니다." }); });
  var L = R.layout(scene, { portraits: portraits, sciences: sciences }); scene.add(L.group);
  var sets = 6;
  window.__build = Math.round(performance.now() - t0);

  /* 카메라: 게임과 같은 화각 규칙 */
  var aspect = W / H, fov;
  if (aspect < 0.75) fov = 84; else if (aspect < 1.25) fov = 70;
  else { var hf = 86 * Math.PI / 180; fov = K.clamp((2 * Math.atan(Math.tan(hf / 2) / aspect)) * 180 / Math.PI, 46, 60); }
  var cam = new T.PerspectiveCamera(fov, aspect, 0.05, 80);
  cam.position.set(view[0], view[1], view[2]);
  var yaw = view[3], pitch = view[4];
  cam.lookAt(cam.position.x + Math.sin(yaw) * Math.cos(pitch), cam.position.y + Math.sin(pitch), cam.position.z + Math.cos(yaw) * Math.cos(pitch));

  window.__nan = [];
  scene.traverse(function (o) { if (o.isMesh && o.geometry) { var a = o.geometry.attributes.position.array; for (var i = 0; i < a.length; i++) if (a[i] !== a[i]) { var n = o, path = []; while (n) { path.push(n.name || n.type); n = n.parent; } window.__nan.push(path.join("<")); break; } } });
  if (window.__nan.length) console.log("NaN meshes: " + window.__nan.join(" | "));
  K.setEnvIntensity(scene, +q.get("env") || 0.8);
  var st = K.stats(scene);
  var calls = 0;
  renderer.render(scene, cam); renderer.render(scene, cam);
  calls = renderer.info.render.calls;
  window.__stats = { build_ms: window.__build, meshes: st.meshes, tris: st.tris, drawcalls: calls, sets: sets };
  window.__done = true;
  console.log("room stats " + JSON.stringify(window.__stats));
})();
