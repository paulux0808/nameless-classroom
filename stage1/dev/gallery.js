/* 개발용 소품 갤러리: ?props=a,b&views=3q,side,top&cols=2&w=1280&h=960
   한 캔버스에 여러 소품·시점을 타일로 그려, 확대 렌더로 형태·디테일을 검수한다. */
(function () {
  "use strict";
  var T = THREE, K = N1K, P = N1P;
  var q = new URLSearchParams(location.search);
  var names = (q.get("props") || "schoolDesk,schoolChair").split(",");
  var viewNames = (q.get("views") || "3q,side").split(",");
  var W = +q.get("w") || innerWidth, H = +q.get("h") || innerHeight;
  var VIEWS = {
    "3q": { az: 35, el: 20, k: 1.0 }, "3q2": { az: -40, el: 18, k: 1.0 },
    front: { az: 0, el: 6, k: 1.0 }, side: { az: 90, el: 6, k: 1.0 }, back: { az: 180, el: 14, k: 1.0 },
    top: { az: 0, el: 82, k: 1.0 }, under: { az: 30, el: -28, k: 1.0 },
    close: { az: 28, el: 16, k: 0.52 }, close2: { az: -32, el: 12, k: 0.5 },
    face: { az: 14, el: 3, k: 0.24, dy: 0.34 }, face2: { az: -30, el: 4, k: 0.24, dy: 0.34 }
  };


  /* 인자가 필요한 소품용 갤러리 어댑터 */
  P.__galleryShims = true;
  (function () {
    function tex(hex) { var c = document.createElement("canvas"); c.width = 128; c.height = 154; var x = c.getContext("2d"); x.fillStyle = "#" + hex; x.fillRect(0, 0, 128, 154); x.fillStyle = "rgba(0,0,0,.35)"; x.beginPath(); x.arc(64, 60, 30, 0, 7); x.fill(); x.fillRect(30, 96, 68, 60); var t = new THREE.CanvasTexture(c); t.encoding = THREE.sRGBEncoding; return t; }
    P.g_sciFrame = function () { var f = P.sciFrame(tex("b9a888")); f.userData.setSignature([1, 0, 1, 0]); return f; };
    P.g_sciFrame2 = function () { var f = P.sciFrame(tex("9fb0a8")); f.userData.setSignature([1, 1, 0, 0]); return f; };
    P.g_curtainClosed = function () { var c = P.curtain({ width: 1.5, length: 1.5 }); c.userData.setClosed(1); return c; };
    P.g_curtainOpen = function () { var c = P.curtain({ width: 1.5, length: 1.5, gatherSide: 1 }); c.userData.setClosed(0); return c; };
    P.g_doorOpen = function () { var d = P.exitDoor(); d.userData.pivot.rotation.y = 1.0; return d; };
    P.g_windowUnit = function () { var w = P.windowUnit(1.3, 1.5); return w; };
    P.g_letter = function () { return P.letter("두 번째 일기", "1954"); };
    P.g_teacherSeat = function () { var gp = new THREE.Group(); var a = P.armchair(); gp.add(a); var t = P.teacher(); t.position.set(0, 0, 0.0); gp.add(t); t.userData.update(0, 0, new THREE.Vector3(0.6, 1.3, 2.2)); return gp; };
    P.g_teacherStand = function () { var t = P.teacher({ stand: true }); t.userData.setStanding(new THREE.Vector3(0, 0, 0), 0); t.userData.update(0, 0, new THREE.Vector3(1.2, 1.5, 2.5)); return t; };
    P.g_notePaper = function () { return P.notePaper({ name: "아이작 뉴턴", born: "1643. 1. 4.", died: "1727. 3. 31.", key: "만유인력의 기본 바탕 · 떨어지는 사과", body: "잉글랜드의 물리학자·수학자. 1687년 《자연철학의 수학적 원리》에서 만유인력과 세 가지 운동 법칙을 세웠다. 케플러의 행성 운동 법칙과 자신의 중력 이론이 이어짐을 보여 태양중심설의 이론적 바탕을 마련했다." }); };
  })();

  var cv = document.getElementById("c");
  var renderer = new T.WebGLRenderer({ canvas: cv, antialias: true, preserveDrawingBuffer: true });
  renderer.setPixelRatio(1); renderer.setSize(W, H, false);
  cv.style.width = W + "px"; cv.style.height = H + "px";
  renderer.outputEncoding = T.sRGBEncoding; renderer.toneMapping = T.ACESFilmicToneMapping; renderer.toneMappingExposure = 1.05;
  renderer.shadowMap.enabled = true; renderer.shadowMap.type = T.PCFSoftShadowMap;
  K.tex.setAnisotropy(Math.min(8, renderer.capabilities.getMaxAnisotropy()));

  var scene = new T.Scene();
  scene.environment = K.makeEnv(renderer, "studio");
  scene.add(new T.HemisphereLight(K.srgb(0xdfe8ff), K.srgb(0x3a3026), 0.35));
  var sun = new T.DirectionalLight(K.srgb(0xfff0d8), 1.6);
  sun.castShadow = true; sun.shadow.mapSize.set(2048, 2048); sun.shadow.bias = -0.0004; sun.shadow.normalBias = 0.02;
  var sc = sun.shadow.camera; sc.left = -2.2; sc.right = 2.2; sc.top = 2.2; sc.bottom = -2.2; sc.near = 0.5; sc.far = 14;
  scene.add(sun); scene.add(sun.target);
  var ground = new T.Mesh(new T.CircleGeometry(6, 48), new T.MeshStandardMaterial({ color: K.srgb(0x5a554d), roughness: 0.95 }));
  ground.rotation.x = -Math.PI / 2; ground.receiveShadow = true; scene.add(ground);
  scene.background = K.srgb(0x2a2824);

  var cols = +q.get("cols") || Math.ceil(Math.sqrt(names.length * viewNames.length));
  var tiles = [];
  names.forEach(function (n) { viewNames.forEach(function (v) { tiles.push({ n: n, v: v }); }); });
  var rows = Math.ceil(tiles.length / cols), tw = Math.floor(W / cols), th = Math.floor(H / rows);
  var stats = {};

  renderer.setScissorTest(true);
  tiles.forEach(function (tl, idx) {
    var col = idx % cols, row = Math.floor(idx / cols), x = col * tw, y = H - (row + 1) * th;
    var made = P[tl.n];
    if (!made) { document.getElementById("err").textContent += "소품 없음: " + tl.n + "\n"; return; }
    var obj = made();
    scene.add(obj);
    obj.updateMatrixWorld(true);
    var box = new T.Box3().setFromObject(obj), ctr = box.getCenter(new T.Vector3()), size = box.getSize(new T.Vector3());
    var rad = Math.max(size.x, size.y, size.z) * 0.62;
    stats[tl.n] = K.stats(obj);
    ground.position.y = box.min.y - 0.0005;
    var vw = VIEWS[tl.v] || VIEWS["3q"], fov = 34, cam = new T.PerspectiveCamera(fov, tw / th, 0.02, 60);
    var dist = rad / Math.sin((fov * Math.PI / 180) / 2) * 1.02 * vw.k;
    var az = vw.az * Math.PI / 180, el = vw.el * Math.PI / 180;
    cam.position.set(ctr.x + Math.sin(az) * Math.cos(el) * dist, ctr.y + Math.sin(el) * dist, ctr.z + Math.cos(az) * Math.cos(el) * dist);
    if (vw.dy) { ctr.y += size.y * vw.dy; cam.position.y += size.y * vw.dy; } cam.lookAt(ctr);
    sun.position.set(ctr.x - 2.6, ctr.y + 3.6, ctr.z + 2.2); sun.target.position.copy(ctr);
    renderer.setViewport(x, y, tw, th); renderer.setScissor(x, y, tw, th);
    renderer.render(scene, cam);
    scene.remove(obj);
    var cap = document.createElement("div");
    cap.className = "cap"; cap.style.left = (x + 6) + "px"; cap.style.top = (row * th + 6) + "px";
    cap.textContent = tl.n + " · " + tl.v + " · " + stats[tl.n].tris + " tris";
    document.body.appendChild(cap);
  });
  window.__stats = stats; window.__done = true;
  console.log("gallery stats " + JSON.stringify(stats));
})();
