/* N1P — 큰 가구: 교탁, 안락의자, 사물함, 라디에이터.
   모두 앞면이 +Z. 방에 놓을 때 필요하면 돌린다. */
(function (root) {
  "use strict";
  var T = root.THREE, K = root.N1K, G = K.geo, P = root.N1P, PI = Math.PI;
  var M = P.M;

  /* ── 교탁 ──────────────────────────────────────────────────────────── */
  function buildLectern() {
    var b = K.builder(), wd = M.woodDark(), wm = M.woodMid(), br = M.brass();
    var W = 1.64, D = 0.66, FZ = (D - 0.08) / 2;
    b.rbox(W - 0.04, 0.09, D - 0.04, 0.012, wd, { p: [0, 0.045, 0], uv: 1.4 });            /* 기단 */
    b.rbox(W - 0.08, 0.67, D - 0.08, 0.008, wd, { p: [0, 0.425, 0], uv: 1.4 });            /* 몸통 */
    /* 앞면: 틀(스타일·레일)과 솟은 패널 */
    var xs = [-0.71, -0.245, 0.245, 0.71], pw = 0.395, ph = 0.5;
    xs.forEach(function (x, i) { b.rbox(i % 3 === 0 ? 0.075 : 0.055, 0.6, 0.014, 0.004, wm, { p: [x, 0.43, FZ + 0.007], uv: 1.8 }); });
    b.rbox(W - 0.14, 0.05, 0.014, 0.004, wm, { p: [0, 0.72, FZ + 0.007], uv: 1.8 });      /* 윗 레일(서랍 앞판) */
    b.rbox(W - 0.14, 0.05, 0.014, 0.004, wm, { p: [0, 0.145, FZ + 0.007], uv: 1.8 });     /* 아랫 레일 */
    [-0.475, 0, 0.475].forEach(function (x) {
      b.rbox(pw - 0.03, ph - 0.05, 0.016, 0.007, wd, { p: [x, 0.43, FZ + 0.012], uv: 2.2, tint: 0x9a8272 });
      b.rbox(pw - 0.09, ph - 0.11, 0.008, 0.005, wm, { p: [x, 0.43, FZ + 0.021], uv: 2.2, tint: 0xa88f78 });
    });
    /* 서랍 손잡이 + 도어 손잡이 */
    b.rbox(0.12, 0.014, 0.016, 0.005, br, { p: [0, 0.72, FZ + 0.03] });
    [-0.09, 0.09].forEach(function (dx) { b.cyl(0.004, 0.004, 0.02, br, { p: [dx, 0.72, FZ + 0.02], r: [PI / 2, 0, 0], seg: 8 }); });
    [-0.2, 0.2].forEach(function (x) {
      b.cyl(0.005, 0.005, 0.02, br, { p: [x, 0.5, FZ + 0.03], r: [PI / 2, 0, 0], seg: 8 });
      b.sphere(0.013, br, { p: [x, 0.5, FZ + 0.043], ws: 14, hs: 10 });
    });
    /* 옆면 패널 (앞뒤로 2칸) */
    [-1, 1].forEach(function (sx) {
      var X = sx * (W - 0.08) / 2;
      [-0.135, 0.135].forEach(function (z) {
        b.rbox(0.014, 0.5, 0.235, 0.006, wd, { p: [X + sx * 0.007, 0.43, z], uv: 2.2, tint: 0x9a8272 });
        b.rbox(0.008, 0.42, 0.16, 0.005, wm, { p: [X + sx * 0.014, 0.43, z], uv: 2.2, tint: 0xa88f78 });
      });
      b.rbox(0.014, 0.6, 0.05, 0.004, wm, { p: [X + sx * 0.007, 0.43, 0], uv: 1.8 });
    });
    /* 상판 + 뒤 턱 */
    b.rbox(W + 0.06, 0.042, D + 0.04, 0.014, wm, { p: [0, 0.779, 0], uv: 1.2, segs: 3 });
    b.rbox(W + 0.02, 0.034, 0.024, 0.008, wd, { p: [0, 0.817, -D / 2 - 0.006] });
    b.rbox(0.024, 0.03, D - 0.08, 0.008, wd, { p: [-(W + 0.02) / 2, 0.815, 0] });
    b.rbox(0.024, 0.03, D - 0.08, 0.008, wd, { p: [(W + 0.02) / 2, 0.815, 0] });
    var g = b.build({ name: "lectern" });
    g.userData.topY = 0.80; g.userData.size = [W + 0.06, 0.82, D + 0.04];
    return g;
  }
  P.lectern = function () { return P.tpl("lectern", buildLectern); };

  /* ── 안락의자: 회벽 앞 감독교사 자리. 앞면 +Z. 좌면 높이 0.47 ───────────── */
  function fabricMat() {
    return K.mat("armchair.fabric", function () {
      var f = K.tex.fabric({ base: 0x8a8e7c, dark: 0x5f6555, thread: 48, size: 256 });
      f.map.repeat.set(3, 3); f.bump.repeat.set(3, 3);
      return K.std(0xffffff, 0.92, 0, { map: f.map, bump: f.bump, bumpScale: 0.0008, vc: true });
    });
  }
  function buildArmchair() {
    var b = K.builder(), wd = P.wood("chair", 0x6b3f22, 0.42, "fine", 0.0009), fb = fabricMat(), br = M.brass();
    /* 앞다리: 돌려 깎은(lathe) 다리 */
    var leg = [[0.013, 0], [0.019, 0.02], [0.021, 0.07], [0.028, 0.10], [0.019, 0.14], [0.02, 0.18], [0.026, 0.23], [0.03, 0.28], [0.034, 0.34], [0.037, 0.43], [0.037, 0.45]];
    [-1, 1].forEach(function (sx) {
      b.lathe(leg, wd, { p: [sx * 0.29, 0, 0.27], seg: 20 });
      b.pipe([[sx * 0.29, 0, -0.33], [sx * 0.29, 0.22, -0.29], [sx * 0.29, 0.44, -0.25], [sx * 0.285, 0.76, -0.30], [sx * 0.275, 0.99, -0.315]], 0.022, wd, { bend: 0.16, radial: 12 });
      b.sphere(0.03, wd, { p: [sx * 0.275, 1.005, -0.315], ws: 14, hs: 10 });
    });
    /* 좌면 틀 */
    b.rbox(0.62, 0.075, 0.04, 0.012, wd, { p: [0, 0.395, 0.29] });
    b.rbox(0.62, 0.075, 0.04, 0.012, wd, { p: [0, 0.395, -0.27] });
    [-1, 1].forEach(function (sx) { b.rbox(0.04, 0.075, 0.56, 0.012, wd, { p: [sx * 0.29, 0.395, 0.01] }); });
    /* 좌방석: 볼록한 천 방석 */
    var seat = G.paint(G.plate(0.56, 0.54, 0.1, 0.11, {
      edge: 0.05, uv: 1, rings: 8, edgeSegs: 4, cornerSegs: 8,
      bend: function (v) { var u = v.x / 0.28, w = v.z / 0.27; v.y += 0.028 * (1 - u * u) * (1 - w * w); }
    }), function (x, y, z, nx, ny) { return ny < -0.5 ? [0.55, 0.55, 0.5] : [1, 1, 1]; });
    b.add(seat, fb, { p: [0, 0.455, 0.01] });
    /* 앞 가장자리 장식못 */
    for (var i = -8; i <= 8; i++) b.sphere(0.0065, br, { p: [i * 0.033, 0.42, 0.312], ws: 8, hs: 6 });
    /* 등받이: 나무 틀 + 볼록한 천 */
    var back = G.paint(G.plate(0.5, 0.5, 0.11, 0.1, {
      edge: 0.045, uv: 1, rings: 8, edgeSegs: 4, cornerSegs: 8,
      bend: function (v) { var u = v.x / 0.25, w = v.z / 0.25; v.y += 0.03 * (1 - u * u) * (1 - w * w); }
    }), function (x, y, z, nx, ny) { return ny < -0.5 ? [0.55, 0.55, 0.5] : [1, 1, 1]; });
    b.add(back, fb, { p: [0, 0.78, -0.27], r: [PI / 2 - 0.13, 0, 0] });
    /* 윗 가로대 (곡선 장식) */
    var railShape = new T.Shape();
    railShape.moveTo(-0.3, 0); railShape.lineTo(0.3, 0); railShape.quadraticCurveTo(0.3, 0.06, 0.16, 0.08); railShape.quadraticCurveTo(0, 0.13, -0.16, 0.08); railShape.quadraticCurveTo(-0.3, 0.06, -0.3, 0);
    b.add(G.extrude(railShape, 0.04, { size: 0.008, thick: 0.008, segs: 2 }), wd, { p: [0, 0.98, -0.315] });
    /* 팔걸이: 나무 팔 + 천 패드 + 받침 */
    [-1, 1].forEach(function (sx) {
      var X = sx * 0.31;
      b.pipe([[X, 0.44, 0.24], [X, 0.62, 0.24], [X, 0.665, 0.22]], 0.018, wd, { bend: 0.03, radial: 12 });
      b.rbox(0.052, 0.036, 0.5, 0.014, wd, { p: [X, 0.68, -0.02], r: [-0.05, 0, 0] });
      b.rbox(0.06, 0.16, 0.05, 0.012, wd, { p: [X, 0.6, -0.27] });
      var pad = G.plate(0.08, 0.34, 0.025, 0.05, { edge: 0.022, uv: 1, rings: 3, edgeSegs: 3, cornerSegs: 5, bend: function (v) { v.y += 0.008 * (1 - Math.pow(v.z / 0.17, 2)); } });
      b.add(pad, fb, { p: [X, 0.72, 0.03], r: [-0.05, 0, 0] });
    });
    /* 발 캡 */
    [[-1, 0.27], [1, 0.27], [-1, -0.33], [1, -0.33]].forEach(function (c) { b.cyl(0.015, 0.014, 0.012, br, { p: [c[0] * 0.29, 0.006, c[1]], seg: 12 }); });
    var g = b.build({ name: "armchair" });
    g.userData.seatY = 0.5; g.userData.size = [0.72, 1.02, 0.72];
    return g;
  }
  P.armchair = function () { return P.tpl("armchair", buildArmchair); };

  /* ── 사물함: 3행×5열 문. 앞면 +Z. 상판 높이 1.065 ────────────────────── */
  function lockerAtlas() {
    return K.mat("cabinet.numbers", function () {
      var c = P.canvas(320, 192, function (g, w, h) {
        g.fillStyle = "#d3b05e"; g.fillRect(0, 0, w, h);
        g.fillStyle = "#3a2a10"; g.textAlign = "center"; g.textBaseline = "middle"; g.font = "700 30px sans-serif";
        for (var i = 0; i < 15; i++) g.fillText(String(i + 1), (i % 5) * 64 + 32, Math.floor(i / 5) * 64 + 34);
        g.strokeStyle = "rgba(60,40,10,.5)"; g.lineWidth = 2;
        for (i = 0; i < 15; i++) g.strokeRect((i % 5) * 64 + 3, Math.floor(i / 5) * 64 + 8, 58, 48);
      });
      var t = new T.CanvasTexture(c); t.encoding = T.sRGBEncoding; t.anisotropy = 8;
      return K.std(0xffffff, 0.4, 0.6, { map: t, env: 1.1 });
    });
  }
  function buildCabinet() {
    var b = K.builder(), wd = M.woodDark(), wm = M.woodMid(), br = M.brass(), lab = lockerAtlas();
    var W = 3.14, H = 1.02, D = 0.44;
    b.rbox(W + 0.04, 0.09, D + 0.02, 0.01, wd, { p: [0, 0.045, 0], uv: 1.2 });
    b.rbox(W, H - 0.09, D, 0.008, wd, { p: [0, 0.09 + (H - 0.09) / 2, 0], uv: 1.2 });
    b.rbox(W + 0.06, 0.045, D + 0.05, 0.014, wm, { p: [0, H + 0.02, 0.012], uv: 1.1, segs: 3 });
    var cw = 0.58, rh = 0.293, x0 = -1.16, y0 = 0.09 + 0.02, FZ = D / 2;
    var labelGeos = [];
    for (var r = 0; r < 3; r++) for (var c = 0; c < 5; c++) {
      var cx = x0 + c * cw, cy = y0 + rh / 2 + r * (rh + 0.006);
      b.rbox(cw - 0.014, rh - 0.01, 0.022, 0.005, wm, { p: [cx, cy, FZ + 0.007], segs: 1, uv: 1.6 });
      b.rbox(cw - 0.12, rh - 0.09, 0.012, 0.006, wd, { p: [cx, cy, FZ + 0.02], segs: 1, uv: 1.6, tint: 0xb59a86 });
      b.cyl(0.004, 0.004, 0.016, br, { p: [cx + cw / 2 - 0.07, cy - 0.02, FZ + 0.03], r: [PI / 2, 0, 0], seg: 8 });
      b.sphere(0.011, br, { p: [cx + cw / 2 - 0.07, cy - 0.02, FZ + 0.041], ws: 12, hs: 8 });
      /* 번호판 — 아틀라스 셀 하나를 UV 로 골라 붙인다 */
      var idx = r * 5 + c, pg = new T.PlaneGeometry(0.06, 0.03), uv = pg.attributes.uv, col = idx % 5, row = 2 - Math.floor(idx / 5);
      for (var k = 0; k < uv.count; k++) uv.setXY(k, (col + uv.getX(k) * 0.9 + 0.05) / 5, (row + uv.getY(k) * 0.75 + 0.1) / 3);
      b.add(pg, lab, { p: [cx - cw / 2 + 0.085, cy + 0.075, FZ + 0.0195] });
    }
    var g = b.build({ name: "cabinet" });
    g.userData.topY = 1.065; g.userData.size = [W + 0.06, 1.07, D + 0.06];
    return g;
  }
  P.cabinet = function () { return P.tpl("cabinet", buildCabinet); };

  /* ── 주철 스팀 라디에이터: 앞면 +Z, 긴 방향 x. 폭 0.9 ────────────────────── */
  function buildRadiator() {
    var b = K.builder(), iv = M.ivory(), br = M.brass(), st = M.steelDark(), rr = K.rng(8);
    var N = 12, pitch = 0.075, H = 0.6, Dp = 0.11, x0 = -(N - 1) * pitch / 2;
    var colGeo = G.capsule(0.017, H - 0.1, 12);
    for (var i = 0; i < N; i++) {
      var x = x0 + i * pitch;
      [-0.026, 0.026].forEach(function (dz) { b.add(colGeo, iv, { p: [x, 0.13 + H / 2, dz], s: [1.75, 1, 1], tint: rr.pick([0xffffff, 0xf6f2e6, 0xe9e2d0]) }); });
      b.rbox(pitch - 0.012, 0.05, Dp, 0.02, iv, { p: [x, 0.13 + 0.02, 0], segs: 1 });
      b.rbox(pitch - 0.012, 0.05, Dp, 0.02, iv, { p: [x, 0.13 + H - 0.02, 0], segs: 1 });
    }
    b.cyl(0.02, 0.02, N * pitch + 0.02, iv, { p: [0, 0.13 + 0.03, 0.0], r: [0, 0, PI / 2], seg: 14 });
    b.cyl(0.02, 0.02, N * pitch + 0.02, iv, { p: [0, 0.13 + H - 0.03, 0.0], r: [0, 0, PI / 2], seg: 14 });
    [-1, 1].forEach(function (sx) {
      b.rbox(0.05, 0.06, 0.12, 0.012, iv, { p: [sx * (N * pitch / 2 - 0.02), 0.09, 0], segs: 2 });
      b.rbox(0.03, 0.05, 0.08, 0.006, st, { p: [sx * (N * pitch / 2 - 0.02), 0.03, 0] });
    });
    /* 황동 밸브와 배관, 배기 마개 */
    var valve = [[0.006, 0], [0.018, 0.005], [0.018, 0.028], [0.011, 0.034], [0.011, 0.05], [0.02, 0.058], [0.02, 0.078], [0.005, 0.084]];
    b.lathe(valve, br, { p: [N * pitch / 2 + 0.03, 0.16, 0.01], r: [0, 0, -PI / 2], seg: 16 });
    b.cyl(0.011, 0.011, 0.1, br, { p: [N * pitch / 2 + 0.06, 0.11, 0.01], seg: 12 });
    b.pipe([[N * pitch / 2 + 0.06, 0.16, 0.01], [N * pitch / 2 + 0.06, 0.04, 0.01], [N * pitch / 2 + 0.06, 0.0, -0.02]], 0.011, br, { bend: 0.03, radial: 10 });
    b.cyl(0.011, 0.014, 0.02, br, { p: [-N * pitch / 2 - 0.01, 0.13 + H - 0.035, 0.0], r: [0, 0, PI / 2], seg: 10 });
    var g = b.build({ name: "radiator" });
    g.userData.size = [N * pitch + 0.14, 0.75, 0.13];
    return g;
  }
  P.radiator = function () { return P.tpl("radiator", buildRadiator); };
})(window);
