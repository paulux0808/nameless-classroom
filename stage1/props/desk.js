/* N1P — 책상 위 소품: CRT 컴퓨터, 키보드, 지구본, 탁상달력, 책, 종이류, 곰인형, 화분, 필통 */
(function (root) {
  "use strict";
  var T = root.THREE, K = root.N1K, G = K.geo, X = K.tex, P = root.N1P, PI = Math.PI, M = P.M;

  /* ── CRT 컴퓨터: 본체 + 모니터(화면은 캔버스, 상호작용 대상) + 키보드. 앞면 +Z ─────────── */
  P.crt = function () {
    var g = new T.Group(), b = K.builder();
    var beige = K.mat("crt.beige", function () { return K.std(0xcfc7b0, 0.55, 0.05, { env: 0.8 }); });
    var dark = K.mat("crt.dark", function () { return K.std(0x1e2022, 0.5, 0.2, { env: 0.8 }); });
    /* 모니터 케이스: 앞은 각지고 뒤는 좁아지는 깔때기 */
    b.rbox(0.44, 0.38, 0.1, 0.03, beige, { p: [0, 0.3, 0.13], segs: 3 });
    b.add(G.cyl(0.13, 0.19, 0.3, 4), beige, { p: [0, 0.3, -0.06], r: [PI / 2, PI / 4, 0], s: [1.35, 1, 1.1] });
    b.rbox(0.36, 0.3, 0.02, 0.02, dark, { p: [0, 0.3, 0.185] });
    /* 받침(틸트 스탠드) */
    b.lathe([[0.0, 0], [0.11, 0], [0.125, 0.008], [0.11, 0.02], [0.06, 0.03], [0.04, 0.05]], beige, { p: [0, 0.0, 0.03], seg: 28 });
    b.rbox(0.09, 0.05, 0.08, 0.012, beige, { p: [0, 0.075, 0.03] });
    /* 앞 버튼과 전원 LED */
    [0.12, 0.15, 0.18].forEach(function (x, i) { b.rbox(0.02, 0.012, 0.01, 0.003, dark, { p: [x, 0.125, 0.19 + 0.0] }); });
    b.sphere(0.005, K.mat("crt.led", function () { return K.std(0x39d27a, 0.3, 0, { emissive: 0x39d27a, ei: 1.4 }); }), { p: [0.075, 0.125, 0.196], ws: 8, hs: 6 });
    g.add(b.build({ name: "crtBody" }));
    /* 화면: 유리 곡면 + 터미널 화면 */
    var scr = P.canvas(512, 384, function (x, w, h) { draw(x, w, h, 0); });
    function draw(x, w, h, cur) {
      x.fillStyle = "#061512"; x.fillRect(0, 0, w, h);
      x.fillStyle = "#1e6f5f"; x.font = "600 24px ui-monospace,Consolas,monospace";
      x.fillText("ENTER PASSWORD", 34, 62); x.fillText("──────────────", 34, 84);
      x.fillStyle = "#69e6c7"; x.font = "700 30px ui-monospace,Consolas,monospace";
      x.fillText("> " + "*****".slice(0, 0) + (cur ? "_" : " "), 34, 138);
      x.fillStyle = "#1e6f5f"; x.font = "500 18px ui-monospace,Consolas,monospace"; x.fillText("SCHOLARSHIP TERMINAL v1.0", 34, h - 30);
    }
    var tex = new T.CanvasTexture(scr); tex.encoding = T.sRGBEncoding; tex.anisotropy = 4;
    var sg = new T.PlaneGeometry(0.34, 0.255, 8, 6), sp = sg.attributes.position;
    for (var i = 0; i < sp.count; i++) { var xx = sp.getX(i) / 0.17, yy = sp.getY(i) / 0.1275; sp.setZ(i, 0.012 * (1 - 0.5 * (xx * xx + yy * yy))); }
    sg.computeVertexNormals();
    var screen = new T.Mesh(sg, K.isToon() ? new T.MeshBasicMaterial({ map: tex, toneMapped: false })
      : new T.MeshStandardMaterial({ map: tex, emissiveMap: tex, emissive: new T.Color(1, 1, 1), emissiveIntensity: 0.9, roughness: 0.18, metalness: 0 }));
    screen.position.set(0, 0.3, 0.197); screen.name = "crtScreen"; g.add(screen);
    var sheen = new T.Mesh(sg.clone(), K.std(0xffffff, 0.03, 0, { opacity: 0.08, env: 1.6 })); sheen.material.depthWrite = false; sheen.position.set(0, 0.3, 0.2); g.add(sheen);
    /* 키보드 + 본체 케이스(플로피 슬롯) */
    var kb = K.builder(), key = K.mat("crt.key", function () { return K.std(0xb9b19a, 0.6, 0, { env: 0.6 }); });
    kb.rbox(0.44, 0.024, 0.16, 0.008, beige, { p: [0, 0.012, 0.35], segs: 2 });
    for (var r = 0; r < 4; r++) for (var c = 0; c < 15; c++) kb.rbox(0.0235, 0.011, 0.0235, 0.004, key, { p: [-0.1725 + c * 0.0246 + (r % 2 ? 0.006 : 0), 0.029, 0.31 + r * 0.0265], segs: 1 });
    kb.rbox(0.19, 0.011, 0.0235, 0.004, key, { p: [0, 0.029, 0.416], segs: 1 });
    g.add(kb.build({ name: "crtKeyboard" }));
    g.userData = { screen: screen, texture: tex, redraw: function (cur, text) { draw(scr.getContext("2d"), 512, 384, cur); tex.needsUpdate = true; }, size: [0.44, 0.5, 0.5] };
    var blink = 0;
    g.userData.update = function (t) {
      var on = (Math.floor(t * 1.6) % 2) === 0;
      if (on !== blink) { blink = on; g.userData.redraw(on); }
    };
    return g;
  };

  /* ── 지구본: 원목 받침 + 황동 자오선 고리 + 대륙 그림 지구 ─────────────────── */
  function earthTexture() {
    return P.canvas(1024, 512, function (g, w, h) {
      var ocean = g.createLinearGradient(0, 0, 0, h); ocean.addColorStop(0, "#3e6d8f"); ocean.addColorStop(0.5, "#4a7fa6"); ocean.addColorStop(1, "#3e6d8f"); g.fillStyle = ocean; g.fillRect(0, 0, w, h);
      function land(pts, col) { g.beginPath(); pts.forEach(function (p, i) { var x = (p[0] + 180) / 360 * w, y = (90 - p[1]) / 180 * h; if (i) g.lineTo(x, y); else g.moveTo(x, y); }); g.closePath(); g.fillStyle = col; g.fill(); g.strokeStyle = "rgba(60,45,20,.5)"; g.lineWidth = 1.5; g.stroke(); }
      var green = "#8fa66a", tan = "#c3ab74", snow = "#e9ecef";
      land([[-168, 66], [-140, 70], [-95, 72], [-70, 68], [-55, 52], [-66, 45], [-80, 32], [-97, 26], [-117, 32], [-125, 48], [-150, 60], [-168, 66]], green);       /* 북미 */
      land([[-97, 26], [-84, 21], [-79, 9], [-84, 8], [-97, 17], [-97, 26]], tan);                                                                                 /* 중미 */
      land([[-79, 9], [-60, 10], [-35, -6], [-40, -22], [-58, -38], [-68, -54], [-74, -45], [-70, -18], [-80, -3], [-79, 9]], green);                                /* 남미 */
      land([[-10, 36], [-9, 44], [-2, 51], [10, 58], [28, 70], [40, 66], [30, 46], [22, 36], [10, 38], [-10, 36]], "#a9b57c");                                     /* 유럽 */
      land([[-17, 21], [-5, 35], [10, 37], [32, 31], [43, 12], [51, 11], [40, -15], [34, -26], [20, -35], [12, -18], [9, 4], [-9, 5], [-17, 14], [-17, 21]], tan);      /* 아프리카 */
      land([[28, 70], [70, 74], [110, 76], [150, 70], [178, 66], [140, 46], [122, 30], [108, 20], [98, 8], [78, 8], [68, 24], [50, 30], [40, 46], [28, 70]], green);   /* 아시아 */
      land([[113, -22], [130, -12], [146, -19], [153, -28], [146, -39], [131, -32], [115, -34], [113, -22]], "#c9a86a");                                             /* 호주 */
      land([[-180, -70], [180, -70], [180, -90], [-180, -90]], snow); land([[-60, 84], [-20, 84], [-30, 70], [-55, 62], [-60, 84]], snow);
      g.strokeStyle = "rgba(230,240,250,.28)"; g.lineWidth = 1;
      for (var lo = 0; lo < 360; lo += 30) { var x = lo / 360 * w; g.beginPath(); g.moveTo(x, 0); g.lineTo(x, h); g.stroke(); }
      for (var la = 30; la < 180; la += 30) { var y = la / 180 * h; g.beginPath(); g.moveTo(0, y); g.lineTo(w, y); g.stroke(); }
    });
  }
  P.globe = function () {
    var g = new T.Group(), b = K.builder(), br = M.brass(), wd = P.wood("globe", 0x5f3a20, 0.4, "fine");
    b.lathe([[0.0, 0], [0.085, 0], [0.09, 0.008], [0.085, 0.016], [0.06, 0.024], [0.05, 0.03], [0.055, 0.04], [0.03, 0.048], [0.026, 0.07], [0.02, 0.09]], wd, { seg: 32 });
    b.torus(0.088, 0.0045, br, { p: [0, 0.012, 0], r: [PI / 2, 0, 0], ts: 32 });
    g.add(b.build({ name: "globeStand" }));
    var pivot = new T.Group(); pivot.position.set(0, 0.2, 0); pivot.rotation.z = 0.41; g.add(pivot);
    var sph = new T.Mesh(new T.SphereGeometry(0.115, 48, 32), K.std(0xffffff, 0.45, 0.02, { map: (function () { var t = new T.CanvasTexture(earthTexture()); t.encoding = T.sRGBEncoding; t.anisotropy = 8; return t; })(), env: 1.1 }));
    sph.castShadow = true; sph.receiveShadow = true; pivot.add(sph);
    var mb = K.builder();
    mb.torus(0.126, 0.0042, br, { r: [0, PI / 2, 0], ts: 48 });
    mb.cyl(0.0055, 0.0055, 0.28, br, { seg: 12 });
    mb.sphere(0.01, br, { p: [0, 0.148, 0], ws: 12, hs: 8 }); mb.sphere(0.01, br, { p: [0, -0.148, 0], ws: 12, hs: 8 });
    var mer = mb.build({ name: "meridian" }); mer.position.set(0, 0.2, 0); mer.rotation.z = 0.41; g.add(mer);
    /* 받침대와 자오선 연결 */
    var sb = K.builder(); sb.cyl(0.006, 0.006, 0.11, br, { p: [0.0, 0.11, 0], seg: 10 }); g.add(sb.build());
    g.userData.earth = sph; g.userData.size = [0.26, 0.36, 0.26];
    g.userData.spin = 0.0;
    g.userData.update = function (dt) { sph.rotation.y += (g.userData.spin + 0.05) * dt; g.userData.spin *= Math.pow(0.35, dt); };
    return g;
  };

  /* ── 탁상 달력 ─────────────────────────────────────────────────────── */
  P.deskCalendar = function () {
    var b = K.builder(), card = K.mat("cal.card", function () { return K.std(0xf1ede0, 0.85, 0); }), red = K.mat("cal.red", function () { return K.std(0xb32a22, 0.7, 0); });
    b.rbox(0.16, 0.012, 0.075, 0.004, K.mat("cal.base", function () { return K.std(0x3a3f45, 0.5, 0.3, { env: 0.8 }); }), { p: [0, 0.006, 0] });
    var page = P.canvas(320, 220, function (x, w, h) {
      x.fillStyle = "#f4f0e2"; x.fillRect(0, 0, w, h); x.fillStyle = "#b32a22"; x.fillRect(0, 0, w, 44);
      x.fillStyle = "#fff"; x.font = "700 26px sans-serif"; x.textAlign = "left"; x.fillText("CALENDAR", 14, 32);
      x.fillStyle = "#2a2620"; x.font = "500 17px sans-serif"; x.textAlign = "center";
      for (var d = 0; d < 7; d++) x.fillText(["S", "M", "T", "W", "T", "F", "S"][d], 24 + d * 44, 68);
      for (var i = 0; i < 35; i++) { var col = i % 7, row = Math.floor(i / 7); x.fillStyle = col === 0 ? "#b32a22" : "#3a352d"; x.fillText(String((i % 31) + 1), 24 + col * 44, 96 + row * 26); }
    });
    var pm = P.canvasMat(page, { rough: 0.85, side: T.DoubleSide });
    var pg = new T.Mesh(new T.PlaneGeometry(0.155, 0.107), pm); pg.position.set(0, 0.078, 0.005); pg.rotation.x = -0.24; pg.castShadow = true; pg.name = "calPage";
    var g = b.build({ name: "deskCalendar" });
    g.add(pg);
    for (var i = 0; i < 8; i++) { var rg = new T.Mesh(new T.TorusGeometry(0.008, 0.0016, 6, 12), M.steelLight()); rg.position.set(-0.058 + i * 0.0166, 0.128, 0.0); rg.rotation.y = PI / 2; rg.rotation.z = 0.0; g.add(rg); }
    var back = K.builder(); back.rbox(0.15, 0.1, 0.006, 0.002, card, { p: [0, 0.062, -0.026], r: [0.35, 0, 0] }); g.add(back.build());
    g.userData.size = [0.16, 0.14, 0.09];
    return g;
  };

  /* ── 수학책 / 일반 책 ────────────────────────────────────────────── */
  P.mathBook = function () {
    var b = K.builder(); var w = 0.26, h = 0.035, d = 0.19;
    var cover = P.canvas(384, 256, function (x, cw, ch) {
      x.fillStyle = "#2f5f8a"; x.fillRect(0, 0, cw, ch);
      x.fillStyle = "#eaf2f8"; x.font = "700 44px sans-serif"; x.fillText("MATHEMATICS", 24, 80);
      x.font = "500 30px sans-serif"; x.globalAlpha = 0.8; x.fillText("수학 I", 24, 130); x.globalAlpha = 0.35; x.strokeStyle = "#eaf2f8"; x.lineWidth = 3; x.strokeRect(16, 16, cw - 32, ch - 32);
    });
    var coverMat = P.canvasMat(cover, { rough: 0.6 });
    P.addBook(b, w, h, d, 0x2f5f8a, { p: [0, 0, 0] });
    var g = b.build({ name: "mathBook" });
    var top = new T.Mesh(new T.PlaneGeometry(w - 0.006, d - 0.004), coverMat); top.rotation.x = -PI / 2; top.position.y = h / 2 + 0.0004; top.receiveShadow = true; g.add(top);
    g.userData.size = [w, h, d];
    return g;
  };
  P.plainBook = function (hex, w, h, d) {
    var b = K.builder(); P.addBook(b, w || 0.26, h || 0.035, d || 0.19, hex || 0x7a4a3a, {});
    return b.build({ name: "book" });
  };

  /* ── 종이류: 일기 종이, 포스트잇, 편지 ───────────────────────────────── */
  P.diaryPaper = function () {
    var c = P.canvas(300, 280, function (g, w, h) {
      g.fillStyle = "#f5eeda"; g.fillRect(0, 0, w, h); g.strokeStyle = "rgba(90,78,55,.45)"; g.lineWidth = 3;
      for (var i = 0; i < 9; i++) { g.beginPath(); g.moveTo(26, 34 + i * 26); g.lineTo(w - 26 - (i % 3 === 2 ? 70 : 0), 34 + i * 26); g.stroke(); }
      g.strokeStyle = "rgba(160,53,40,.75)"; g.lineWidth = 4; g.beginPath(); g.moveTo(26, 20); g.lineTo(150, 20); g.stroke();
    });
    var m = new T.Mesh(G.plate(0.24, 0.2, 0.004, 0.003, { edge: 0.001, uv: 1, rings: 3, edgeSegs: 1, cornerSegs: 2, bend: function (v) { v.y += 0.002 * Math.pow(v.x / 0.12, 4); } }), P.canvasMat(c, { rough: 0.9 }));
    var uv = m.geometry.attributes.uv, pos = m.geometry.attributes.position;
    for (var i = 0; i < uv.count; i++) uv.setXY(i, pos.getX(i) / 0.24 + 0.5, 0.5 - pos.getZ(i) / 0.2);
    m.castShadow = true; m.receiveShadow = true; var g = new T.Group(); g.add(m); g.userData.size = [0.24, 0.006, 0.2]; return g;
  };
  P.stickyNote = function () {
    var c = P.canvas(160, 140, function (g, w, h) {
      g.fillStyle = "#f2e56a"; g.fillRect(0, 0, w, h); g.strokeStyle = "rgba(120,110,30,.5)"; g.lineWidth = 3; g.strokeRect(2, 2, w - 4, h - 4);
      g.strokeStyle = "rgba(60,55,20,.55)"; g.lineWidth = 4;
      for (var i = 0; i < 4; i++) { g.beginPath(); g.moveTo(18, 34 + i * 26); g.lineTo(w - 18 - (i === 3 ? 40 : 0), 34 + i * 26); g.stroke(); }
    });
    var m = new T.Mesh(G.plate(0.18, 0.15, 0.003, 0.0012, { edge: 0.0004, uv: 1, rings: 2, edgeSegs: 1, cornerSegs: 2, bend: function (v) { v.y += 0.004 * Math.pow((v.z + 0.075) / 0.15, 2); } }), P.canvasMat(c, { rough: 0.8, side: T.DoubleSide }));
    var uv = m.geometry.attributes.uv, pos = m.geometry.attributes.position;
    for (var i = 0; i < uv.count; i++) uv.setXY(i, pos.getX(i) / 0.18 + 0.5, 0.5 - pos.getZ(i) / 0.15);
    m.castShadow = true; var g = new T.Group(); g.add(m); return g;
  };
  /* 챕터 보상 편지: 봉투 느낌 종이 + 붉은 띠 + 제목 */
  P.letter = function (title, era) {
    var c = P.canvas(260, 190, function (g, w, h) {
      g.fillStyle = "#fbf7ec"; g.fillRect(0, 0, w, h); g.strokeStyle = "#b89a6b"; g.lineWidth = 4; g.strokeRect(4, 4, w - 8, h - 8);
      g.fillStyle = "#a03528"; g.fillRect(8, 8, w - 16, 14);
      g.fillStyle = "#2b2419"; g.textAlign = "center"; g.textBaseline = "middle"; g.font = "700 30px 'Noto Sans KR','Malgun Gothic',sans-serif"; g.fillText(title, w / 2, h * 0.4);
      if (era) { g.font = "500 22px 'Noto Sans KR',sans-serif"; g.fillStyle = "#7a6c55"; g.fillText(era, w / 2, h * 0.66); }
      g.strokeStyle = "rgba(90,78,55,.25)"; g.lineWidth = 2; for (var i = 0; i < 3; i++) { g.beginPath(); g.moveTo(24, h * 0.8 + i * 13); g.lineTo(w - 24, h * 0.8 + i * 13); g.stroke(); }
    });
    var mat = P.canvasMat(c, { rough: 0.5, side: T.DoubleSide, emissive: 0x1c1712, ei: 0.35 });
    var m = new T.Mesh(G.plate(0.34, 0.25, 0.005, 0.0015, { edge: 0.0005, uv: 1, rings: 3, edgeSegs: 1, cornerSegs: 2, bend: function (v) { v.y += 0.003 * Math.pow(v.x / 0.17, 4) + 0.002 * Math.pow(v.z / 0.125, 4); } }), mat);
    var uv = m.geometry.attributes.uv, pos = m.geometry.attributes.position;
    for (var i = 0; i < uv.count; i++) uv.setXY(i, pos.getX(i) / 0.34 + 0.5, 0.5 - pos.getZ(i) / 0.25);
    m.castShadow = true; m.receiveShadow = true; var g = new T.Group(); g.add(m); g.userData.size = [0.34, 0.006, 0.25]; return g;
  };

  /* ── 곰인형: 앉은 자세, 몸통·머리·귀·팔다리·주둥이·눈코. 털결은 노이즈 텍스처 ── */
  P.teddy = function () {
    var fur = K.mat("teddy.fur", function () {
      var t = X.gen(128, 128, function (u, v) { var n = K.fbm(u * 12, v * 12, 3, 12, 12), f = K.noise2(u * 60, v * 60, 60, 60); var s = 1 + n * 0.16 + f * 0.1; return [182 * s, 132 * s, 82 * s, 128 + f * 60 + n * 40]; }, {});
      t.map.repeat.set(3, 3); t.bump.repeat.set(3, 3);
      return K.std(0xffffff, 0.98, 0, { map: t.map, bump: t.bump, bumpScale: 0.0022, env: 0.5, vc: true });
    });
    var pad = K.mat("teddy.pad", function () { return K.std(0xd9b287, 0.95, 0, { env: 0.4 }); });
    var dark = K.mat("teddy.dark", function () { return K.std(0x1a1310, 0.4, 0.1, { env: 1 }); });
    var b = K.builder();
    b.sphere(0.115, fur, { p: [0, 0.135, 0], s: [1, 1.1, 0.92], ws: 32, hs: 24 });                       /* 몸통 */
    b.sphere(0.075, pad, { p: [0, 0.125, 0.084], s: [1, 1.15, 0.5], ws: 20, hs: 14 });                    /* 배 */
    b.sphere(0.095, fur, { p: [0, 0.295, 0.005], ws: 32, hs: 24 });                                        /* 머리 */
    b.sphere(0.04, pad, { p: [0, 0.278, 0.085], s: [1.15, 0.85, 0.9], ws: 20, hs: 14 });                  /* 주둥이 */
    b.sphere(0.011, dark, { p: [0, 0.29, 0.122], s: [1.3, 0.9, 1], ws: 10, hs: 8 });                       /* 코 */
    [-1, 1].forEach(function (s) {
      b.sphere(0.034, fur, { p: [s * 0.068, 0.372, -0.005], s: [1, 1, 0.55], ws: 18, hs: 12 });          /* 귀 */
      b.sphere(0.02, pad, { p: [s * 0.068, 0.37, 0.012], s: [1, 1, 0.4], ws: 14, hs: 10 });
      b.sphere(0.011, dark, { p: [s * 0.037, 0.318, 0.088], ws: 10, hs: 8 });                             /* 눈 */
      b.sphere(0.0035, K.mat("teddy.glint", function () { return K.std(0xffffff, 0.2, 0, { emissive: 0xffffff, ei: 0.6 }); }), { p: [s * 0.034, 0.322, 0.097], ws: 6, hs: 4 });
      b.limb(0.04, 0.035, 0.11, fur, { p: [s * 0.135, 0.15, 0.03], r: [0.5, 0, s * -0.45] });              /* 팔 */
      b.limb(0.048, 0.043, 0.12, fur, { p: [s * 0.075, 0.035, 0.09], r: [PI / 2 - 0.15, 0, s * 0.18] });   /* 다리 */
      b.sphere(0.03, pad, { p: [s * 0.075, 0.032, 0.155], s: [1, 0.8, 0.5], ws: 14, hs: 10 });
    });
    b.sphere(0.03, fur, { p: [0, 0.05, -0.1], ws: 14, hs: 10 });                                            /* 꼬리 */
    b.torus(0.05, 0.012, K.mat("teddy.bow", function () { return K.std(0xa5322a, 0.6, 0, { env: 0.6 }); }), { p: [0, 0.215, 0.005], r: [PI / 2, 0, 0], ts: 24, rs: 8 }); /* 리본 */
    b.sphere(0.018, K.mat("teddy.bow", function () { return K.std(0xa5322a, 0.6, 0, { env: 0.6 }); }), { p: [0, 0.212, 0.06], s: [2, 1, 1], ws: 12, hs: 8 });
    var g = b.build({ name: "teddy" });
    g.userData.size = [0.3, 0.4, 0.25];
    return g;
  };

  /* ── 화분: 토분 + 흙 + 여러 겹 잎 ──────────────────────────────────── */
  P.plant = function () {
    var b = K.builder(), rr = K.rng(9), clay = K.mat("pot.clay", function () {
      var t = X.gen(128, 128, function (u, v) { var n = K.fbm(u * 6, v * 6, 3, 6, 6), f = K.noise2(u * 40, v * 40, 40, 40); var s = 1 + n * 0.15 + f * 0.06; return [176 * s, 100 * s, 64 * s, 128 + f * 20]; }, {});
      return K.std(0xffffff, 0.85, 0, { map: t.map, bump: t.bump, bumpScale: 0.0009, env: 0.6 });
    });
    b.lathe([[0.0, 0], [0.068, 0], [0.075, 0.01], [0.105, 0.14], [0.112, 0.145], [0.112, 0.165], [0.104, 0.17], [0.098, 0.16], [0.0, 0.15]], clay, { seg: 28 });
    b.cyl(0.098, 0.098, 0.006, K.mat("pot.soil", function () { return K.std(0x2a1d14, 1, 0); }), { p: [0, 0.153, 0], seg: 24 });
    var leafMat = K.mat("plant.leaf", function () {
      var t = X.gen(64, 128, function (u, v) { var vein = Math.abs(u - 0.5) < 0.012 ? 0.75 : 1 - Math.abs(Math.sin((v * 7 + Math.abs(u - 0.5) * 4) * PI)) * 0.06; var n = K.noise2(u * 8, v * 8, 8, 8); return [58 * vein * (1 + n * 0.1), 118 * vein * (1 + n * 0.1), 62 * vein, 128 + (vein < 0.9 ? -30 : 0)]; }, {});
      return K.std(0xffffff, 0.55, 0, { map: t.map, bump: t.bump, bumpScale: 0.0006, side: T.DoubleSide, env: 0.8, vc: true });
    });
    function leaf(len, wid, bendv) {
      var g = new T.PlaneGeometry(wid, len, 4, 8), pos = g.attributes.position;
      for (var i = 0; i < pos.count; i++) {
        var y = K.clamp(pos.getY(i) / len + 0.5, 0, 1), x = pos.getX(i) / wid; var prof = Math.sin(Math.PI * Math.pow(y, 0.7)) * (1 - 0.15 * y);
        pos.setX(i, x * wid * Math.max(0.03, prof)); pos.setZ(i, bendv * y * y - 0.12 * wid * Math.abs(x) * (1 - y) * 0);
        pos.setY(i, pos.getY(i) + len / 2);
      }
      g.computeVertexNormals(); return g;
    }
    for (var i = 0; i < 26; i++) {
      var a = i * 2.399963 + rr.range(-0.2, 0.2), tilt = rr.range(0.35, 1.15), len = rr.range(0.12, 0.2), wid = rr.range(0.06, 0.1);
      var tint = rr.pick([0xffffff, 0xd8f0d8, 0xb8dcb0, 0xe8ffe0]);
      var lg = leaf(len, wid, rr.range(0.02, 0.06));
      b.add(lg, leafMat, { p: [Math.cos(a) * 0.012, 0.16, Math.sin(a) * 0.012], r: [-tilt, -a + PI / 2, 0], order: "YXZ", tint: tint });
    }
    for (var s = 0; s < 6; s++) {   /* 줄기 */
      var sa = s * 1.05 + 0.3; b.cyl(0.004, 0.005, 0.12, K.mat("plant.stem", function () { return K.std(0x4c7a3c, 0.7, 0); }), { p: [Math.cos(sa) * 0.03, 0.22, Math.sin(sa) * 0.03], r: [Math.sin(sa) * 0.35, 0, Math.cos(sa) * -0.35], seg: 6 });
    }
    var g = b.build({ name: "plant" });
    g.userData.size = [0.34, 0.42, 0.34];
    return g;
  };

  /* ── 필통·펜·빨간 펜 ─────────────────────────────────────────────── */
  P.pencilCup = function () {
    var b = K.builder(), rr = K.rng(4), cup = K.mat("cup.tin", function () { return K.std(0x6d7a86, 0.45, 0.6, { env: 1.1 }); });
    b.lathe([[0, 0], [0.04, 0], [0.043, 0.01], [0.045, 0.1], [0.048, 0.104], [0.043, 0.102], [0.041, 0.09], [0.0, 0.01]], cup, { seg: 24 });
    [0xc0392b, 0xe8c547, 0x2b5b8a, 0x1e1e1e, 0x2e7d4b].forEach(function (c, i) {
      var m = K.mat("pencil." + c, function () { return K.std(c, 0.6, 0.05); });
      var a = i * 1.26, r = 0.014, len = 0.15 + rr.next() * 0.03;
      b.cyl(0.0032, 0.0032, len, m, { p: [Math.cos(a) * r, 0.08 + len / 2 - 0.02, Math.sin(a) * r], r: [Math.sin(a) * 0.17, 0, -Math.cos(a) * 0.17], seg: 6 });
    });
    return b.build({ name: "pencilCup" });
  };
})(window);
