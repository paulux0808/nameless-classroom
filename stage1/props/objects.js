/* N1P — 벽·바닥 소품: 게시판, 우산꽂이, 쓰레기통, 청소도구, 쌓아 둔 의자, 트로피 선반. */
(function (root) {
  "use strict";
  var T = root.THREE, K = root.N1K, G = K.geo, P = root.N1P, PI = Math.PI, M = P.M;

  /* ── 게시판: 공지는 모두 떼였고 압정 구멍과 몇 개 남은 압정, 찢긴 종이 귀퉁이만 있다 ── */
  function buildCorkboard() {
    var b = K.builder(), fr = P.wood("frame", 0x7a4a29, 0.5, "coarse");
    var W = 1.5, H = 0.95, FT = 0.05;
    var cork = K.mat("cork", function () {
      var t = K.tex.cork({ size: 512 }); t.map.repeat.set(1.5, 1); t.bump.repeat.set(1.5, 1);
      return K.std(0xffffff, 0.95, 0, { map: t.map, bump: t.bump, bumpScale: 0.0016 });
    });
    b.box(W - 0.02, H - 0.02, 0.012, cork, { p: [0, 0, 0.006] });
    b.rbox(W, FT, 0.034, 0.008, fr, { p: [0, H / 2 - FT / 2, 0.017], uv: 1.4 });
    b.rbox(W, FT, 0.034, 0.008, fr, { p: [0, -H / 2 + FT / 2, 0.017], uv: 1.4 });
    b.rbox(FT, H - 2 * FT + 0.01, 0.034, 0.008, fr, { p: [-W / 2 + FT / 2, 0, 0.017], uv: 1.4 });
    b.rbox(FT, H - 2 * FT + 0.01, 0.034, 0.008, fr, { p: [W / 2 - FT / 2, 0, 0.017], uv: 1.4 });
    /* 남은 압정 */
    var pinCols = [0xc94a3a, 0x3a72b8, 0xe0c23a, 0x4aa06a, 0xd8d8d8];
    [[-0.52, 0.22], [0.31, 0.3], [0.05, -0.12], [0.55, -0.28], [-0.3, -0.31], [0.4, 0.05]].forEach(function (pp, i) {
      var pm = K.mat("pin." + pinCols[i % 5], function () { return K.std(pinCols[i % 5], 0.35, 0.2, { env: 1 }); });
      b.cyl(0.0075, 0.0075, 0.004, pm, { p: [pp[0], pp[1], 0.014], r: [PI / 2, 0, 0], seg: 12 });
      b.sphere(0.0062, pm, { p: [pp[0], pp[1], 0.0175], ws: 12, hs: 8 });
    });
    /* 찢긴 종이 귀퉁이 */
    var sc = new T.Shape(); sc.moveTo(0, 0); sc.lineTo(0.09, 0.012); sc.lineTo(0.075, 0.05); sc.lineTo(0.05, 0.062); sc.lineTo(0.03, 0.09); sc.lineTo(0.004, 0.07); sc.lineTo(0, 0);
    var pap = K.mat("scrap", function () { return K.std(0xe8dfc6, 0.9, 0); });
    b.add(new T.ExtrudeGeometry(sc, { depth: 0.0008, bevelEnabled: false }), pap, { p: [-0.44, 0.02, 0.0135], r: [0, 0, 0.2] });
    var g = b.build({ name: "corkboard" });
    g.userData.size = [W, H, 0.04];
    return g;
  }
  P.corkboard = function () { return P.tpl("corkboard", buildCorkboard); };

  /* ── 우산꽂이 + 우산 두 자루 ───────────────────────────────────────── */
  function buildUmbrellaStand() {
    var b = K.builder(), st = K.mat("umb.stand", function () { return K.std(0x3a3f45, 0.45, 0.7, { env: 1.1 }); }), br = M.brass();
    var prof = [[0.0, 0.0], [0.105, 0.0], [0.11, 0.01], [0.108, 0.5], [0.116, 0.512], [0.116, 0.525], [0.108, 0.53], [0.1, 0.5], [0.098, 0.02], [0.0, 0.02]];
    b.lathe(prof, st, { seg: 28 });
    b.torus(0.112, 0.006, st, { p: [0, 0.03, 0], r: [PI / 2, 0, 0], ts: 28 });
    b.torus(0.112, 0.006, st, { p: [0, 0.25, 0], r: [PI / 2, 0, 0], ts: 28 });
    b.cyl(0.098, 0.098, 0.004, K.mat("umb.tray", function () { return K.std(0x0e0f10, 0.9, 0); }), { p: [0, 0.4, 0], seg: 24 });
    [[0.035, 0.015, 0x2f3b52, 0.08, -0.03], [-0.04, -0.03, 0x583848, -0.07, 0.04]].forEach(function (u) {
      var col = K.mat("umb.c." + u[2], function () { return K.std(u[2], 0.78, 0, { env: 0.7 }); });
      var lz = u[3], lx = u[4], cx = u[0], cz = u[1], len = 0.78;
      var m = K.xf({ p: [cx, 0.35, cz], r: [lx, 0, lz] });
      function add(geo, mat, o) { b.parts.push({ geo: geo, mat: mat, matrix: new T.Matrix4().multiplyMatrices(m, K.xf(o)), tint: null }); }
      add(G.cyl(0.006, 0.006, len, 10), st, { p: [0, len / 2 - 0.02, 0] });
      add(G.cyl(0.032, 0.006, 0.46, 8), col, { p: [0, 0.5, 0] });
      add(G.cyl(0.034, 0.03, 0.03, 8), col, { p: [0, 0.29, 0] });
      add(G.torus(0.033, 0.004, 8, 14), col, { p: [0, 0.4, 0], r: [PI / 2, 0, 0] });
      add(G.cone ? G.cone : new T.ConeGeometry(0.008, 0.06, 8), br, { p: [0, 0.76, 0] });
      /* J 손잡이 */
      var hp = G.pipePath([[0, -0.02, 0], [0, -0.14, 0], [0.06, -0.19, 0], [0.11, -0.16, 0]], 0.05, 0.02);
      var curve = new T.CatmullRomCurve3(hp, false, "centripetal");
      add(new T.TubeGeometry(curve, 24, 0.011, 8, false), K.mat("umb.handle", function () { return K.std(0x2c1a10, 0.4, 0.1); }), { p: [0, 0.02, 0] });
    });
    return b.build({ name: "umbrellaStand" });
  }
  P.umbrellaStand = function () { return P.tpl("umbrellaStand", buildUmbrellaStand); };

  /* ── 쓰레기통: 천공 철제통 + 구겨진 종이 ────────────────────────────── */
  function buildTrashCan() {
    var b = K.builder();
    var can = K.mat("trash.metal", function () {
      var c = P.canvas(256, 128, function (g, w, h) {
        g.fillStyle = "#6c7176"; g.fillRect(0, 0, w, h);
        g.fillStyle = "#1c1e20";
        for (var y = 6; y < h; y += 12) for (var x = (y / 12 % 2 ? 6 : 0) + 6; x < w; x += 12) { g.beginPath(); g.arc(x, y, 2.4, 0, 6.283); g.fill(); }
      });
      var t = new T.CanvasTexture(c); t.encoding = T.sRGBEncoding; t.wrapS = t.wrapT = T.RepeatWrapping; t.anisotropy = 8; t.repeat.set(4, 1);
      return K.std(0xffffff, 0.5, 0.65, { map: t, env: 1 });
    });
    var rim = K.mat("trash.rim", function () { return K.std(0x8a8f94, 0.4, 0.8, { env: 1.1 }); });
    var prof = [[0.0, 0.0], [0.115, 0.0], [0.135, 0.02], [0.155, 0.3], [0.158, 0.3]];
    b.lathe(prof, can, { seg: 30 });
    b.torus(0.157, 0.0085, rim, { p: [0, 0.302, 0], r: [PI / 2, 0, 0], ts: 30 });
    b.torus(0.122, 0.006, rim, { p: [0, 0.012, 0], r: [PI / 2, 0, 0], ts: 24 });
    var pm = K.mat("trash.paper", function () { return K.std(0xe6e1d3, 0.95, 0); }), rr = K.rng(4);
    for (var i = 0; i < 5; i++) b.add(P.crumple(0.05 + rr.next() * 0.02, 10 + i), pm, { p: [rr.range(-0.06, 0.06), 0.3 + rr.range(-0.02, 0.05), rr.range(-0.06, 0.06)], tint: rr.pick([0xffffff, 0xeee8d8, 0xd9d4c4]) });
    var g = b.build({ name: "trashCan" });
    return g;
  }
  P.trashCan = function () { return P.tpl("trashCan", buildTrashCan); };

  /* ── 청소도구: 양동이 + 대걸레 + 빗자루 ────────────────────────────── */
  function buildCleaning() {
    var b = K.builder(), rr = K.rng(13);
    var plastic = K.mat("bucket.plastic", function () { return K.std(0x3b6ea5, 0.5, 0, { env: 0.8 }); });
    var wood = P.wood("handle", 0xb58a55, 0.55, "fine");
    var steel = M.steelLight();
    b.lathe([[0.0, 0.0], [0.11, 0.0], [0.125, 0.015], [0.15, 0.28], [0.155, 0.285], [0.15, 0.29], [0.143, 0.28], [0.118, 0.03], [0.0, 0.02]], plastic, { seg: 28 });
    b.torus(0.15, 0.006, plastic, { p: [0, 0.287, 0], r: [PI / 2, 0, 0], ts: 28 });
    b.torus(0.15, 0.0035, steel, { p: [0, 0.29, 0], r: [0, 0, 0], arc: PI, ts: 24 });
    b.rbox(0.22, 0.04, 0.03, 0.01, plastic, { p: [0, 0.26, -0.15] });
    /* 대걸레: 자루 + 술 (양동이 밖에 기대 세움) */
    var mopBase = K.xf({ p: [-0.36, 0, 0.02], r: [0.1, 0, 0.16] });
    function add(geo, mat, o) { b.parts.push({ geo: geo, mat: mat, matrix: new T.Matrix4().multiplyMatrices(mopBase, K.xf(o)), tint: o.tint }); }
    add(G.cyl(0.0125, 0.0125, 1.28, 12), wood, { p: [0, 0.68, 0] });
    add(G.cyl(0.02, 0.02, 0.03, 12), steel, { p: [0, 0.08, 0] });
    add(G.rbox(0.13, 0.03, 0.04, 0.01, 1), steel, { p: [0, 0.055, 0] });
    var strand = K.mat("mop.strand", function () { return K.std(0xd8d3c6, 0.95, 0); });
    for (var i = 0; i < 26; i++) {
      var a = rr.next() * 6.283, rad = rr.range(0.015, 0.06), len = rr.range(0.16, 0.24);
      add(G.limb(0.006, 0.0045, len, 6), strand, { p: [Math.cos(a) * rad, 0.03 - len / 2 + 0.03, Math.sin(a) * rad], r: [rr.range(-0.2, 0.2), 0, rr.range(-0.2, 0.2)], tint: rr.pick([0xffffff, 0xe6e0d0, 0xcdc6b4]) });
    }
    /* 빗자루 */
    var bb = K.xf({ p: [-0.5, 0, 0.0], r: [-0.06, 0, -0.09] });
    function addB(geo, mat, o) { b.parts.push({ geo: geo, mat: mat, matrix: new T.Matrix4().multiplyMatrices(bb, K.xf(o)), tint: o.tint }); }
    addB(G.cyl(0.011, 0.011, 1.2, 10), wood, { p: [0, 0.68, 0] });
    var bristle = K.mat("broom.bristle", function () { return K.std(0xb99a4a, 0.9, 0); });
    for (var j = 0; j < 40; j++) {
      var bx = rr.range(-0.13, 0.13), bz = rr.range(-0.02, 0.02);
      addB(G.cyl(0.0035, 0.002, rr.range(0.2, 0.27), 5), bristle, { p: [bx, 0.11, bz], r: [0, 0, bx * 1.4], tint: rr.pick([0xffffff, 0xe0c880, 0xc7a75c]) });
    }
    addB(G.rbox(0.3, 0.05, 0.05, 0.012, 1), P.wood("broomhead", 0x8a5a34, 0.55, "fine"), { p: [0, 0.255, 0] });
    addB(G.torus(0.022, 0.003, 6, 12), steel, { p: [0, 0.255, 0], r: [PI / 2, 0, 0] });
    return b.build({ name: "cleaningSet" });
  }
  P.cleaningSet = function () { return P.tpl("cleaningSet", buildCleaning); };

  /* ── 쌓아 둔 의자: 먼지가 두껍다 ─────────────────────────────────────── */
  P.stackedChairs = function () {
    var g = new T.Group(); g.name = "stackedChairs";
    var rr = K.rng(21);
    for (var i = 0; i < 4; i++) {
      var c = P.schoolChair(); c.position.set(rr.range(-0.012, 0.012), i * 0.138, -i * 0.045); c.rotation.set(-0.03 * i, rr.range(-0.05, 0.05), 0); g.add(c);
    }
    g.userData.size = [0.5, 1.4, 0.6];
    return g;
  };

  /* ── 트로피 + 책 무더기 선반 ───────────────────────────────────────── */
  function buildTrophyShelf() {
    var b = K.builder(), wm = P.wood("shelf", 0x855431, 0.5, "coarse"), gold = K.mat("trophy.gold", function () { return K.std(0xd9b24a, 0.28, 1, { env: 1.3 }); });
    var W = 1.1;
    b.rbox(W, 0.035, 0.24, 0.01, wm, { p: [0, 0, 0.12], uv: 1.4 });
    [-0.4, 0.4].forEach(function (x) {
      var s = new T.Shape(); s.moveTo(0, 0); s.lineTo(0.2, 0); s.lineTo(0, -0.18); s.lineTo(0, 0);
      b.add(G.extrude(s, 0.03, { size: 0.004, thick: 0.004, segs: 1 }), M.steelDark(), { p: [x, -0.0175, 0.02], r: [0, -PI / 2, 0] });
    });
    /* 트로피 */
    b.rbox(0.1, 0.03, 0.1, 0.006, K.mat("trophy.base", function () { return K.std(0x1b1a1c, 0.35, 0.2, { env: 1 }); }), { p: [0.18, 0.0325, 0.12] });
    b.rbox(0.07, 0.006, 0.006, 0.002, gold, { p: [0.18, 0.033, 0.173] });
    var tp = [[0.028, 0], [0.028, 0.014], [0.012, 0.028], [0.012, 0.06], [0.026, 0.074], [0.03, 0.085], [0.01, 0.092], [0.012, 0.096], [0.04, 0.12], [0.055, 0.165], [0.052, 0.195], [0.046, 0.2], [0.02, 0.19]];
    b.lathe(tp, gold, { p: [0.18, 0.048, 0.12], seg: 28 });
    [-1, 1].forEach(function (sx) { b.torus(0.03, 0.005, gold, { p: [0.18 + sx * 0.06, 0.16, 0.12], r: [0, 0, sx > 0 ? -1.2 : PI + 1.2 - 0.0], arc: PI * 1.1, ts: 16 }); });
    b.cyl(0.024, 0.015, 0.014, gold, { p: [0.18, 0.256, 0.12], seg: 20 });
    b.sphere(0.014, gold, { p: [0.18, 0.272, 0.12], ws: 14, hs: 10 });
    /* 책 무더기 */
    var books = [[0.24, 0.045, 0.17, 0x6a2b2b, [-0.22, 0.036 + 0.0225, 0.12], 0.08], [0.22, 0.04, 0.16, 0x233b5f, [-0.22, 0.036 + 0.045 + 0.02, 0.12], -0.12], [0.2, 0.035, 0.15, 0x3c5a3a, [-0.22, 0.036 + 0.085 + 0.0175, 0.12], 0.2],
      [0.25, 0.05, 0.18, 0x7a5a2a, [-0.42, 0.036 + 0.025, 0.11], -0.05]];
    books.forEach(function (bk) { P.addBook(b, bk[0], bk[1], bk[2], bk[3], { p: bk[4], r: [0, bk[5], 0] }); });
    var g = b.build({ name: "trophyShelf" });
    g.userData.size = [W, 0.3, 0.24];
    return g;
  }
  P.trophyShelf = function () { return P.tpl("trophyShelf", buildTrophyShelf); };
})(window);
