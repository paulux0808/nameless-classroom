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

  /* 학생 책걸상 6세트 */
  var rng = K.rng(99), sets = 0;
  [-0.5, 1.35].forEach(function (z) {
    [-2.3, 0, 2.3].forEach(function (x) {
      var d = P.schoolDesk(); d.position.set(x, 0, z); scene.add(d);
      var c = P.schoolChair(); c.position.set(x + rng.range(-0.03, 0.03), 0, z + 0.4 + rng.range(-0.04, 0.05)); c.rotation.y = rng.range(-0.08, 0.08); scene.add(c);
      sets++;
    });
  });
  window.__build = Math.round(performance.now() - t0);

  /* 카메라: 게임과 같은 화각 규칙 */
  var aspect = W / H, fov;
  if (aspect < 0.75) fov = 84; else if (aspect < 1.25) fov = 70;
  else { var hf = 86 * Math.PI / 180; fov = K.clamp((2 * Math.atan(Math.tan(hf / 2) / aspect)) * 180 / Math.PI, 46, 60); }
  var cam = new T.PerspectiveCamera(fov, aspect, 0.05, 80);
  cam.position.set(view[0], view[1], view[2]);
  var yaw = view[3], pitch = view[4];
  cam.lookAt(cam.position.x + Math.sin(yaw) * Math.cos(pitch), cam.position.y + Math.sin(pitch), cam.position.z + Math.cos(yaw) * Math.cos(pitch));

  var st = K.stats(scene);
  var calls = 0;
  renderer.render(scene, cam); renderer.render(scene, cam);
  calls = renderer.info.render.calls;
  window.__stats = { build_ms: window.__build, meshes: st.meshes, tris: st.tris, drawcalls: calls, sets: sets };
  window.__done = true;
  console.log("room stats " + JSON.stringify(window.__stats));
})();
