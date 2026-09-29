/* N1P — 학생 책상·의자. 규격(KS G 2603 계열): 상판 68×46cm, 높이 72cm, 좌면 높이 44cm.
   로컬 좌표: 바닥 y=0, 사용자는 -Z 방향(칠판)을 본다 → 책상은 학생이 +Z 쪽, 의자는 등받이가 +Z 쪽. */
(function (root) {
  "use strict";
  var T = root.THREE, K = root.N1K, G = K.geo, P = root.N1P = root.N1P || {};
  var PI = Math.PI;

  function mats() {
    return {
      laminate: K.mat("desk.laminate", function () {
        var t = K.tex.wood({ base: 0xc4a06d, dark: 0x9d7546, rings: 2, seed: 5, fiber: 0.7 });
        return K.std(0xffffff, 0.46, 0, { map: t.map, bump: t.bump, bumpScale: 0.0012, vc: true });
      }),
      plywood: K.mat("chair.plywood", function () {
        var t = K.tex.wood({ base: 0xc99c62, dark: 0x8b6036, rings: 5, seed: 9, fiber: 1 });
        return K.std(0xffffff, 0.58, 0, { map: t.map, bump: t.bump, bumpScale: 0.0016, vc: true });
      }),
      steel: K.mat("school.steel", function () { return K.std(0x2a2e33, 0.4, 0.75, { env: 1.1 }); }),
      zinc: K.mat("school.zinc", function () { return K.std(0xa6a9ab, 0.38, 0.9, { env: 1.1 }); }),
      rubber: K.mat("school.rubber", function () { return K.std(0x15161a, 0.92, 0); })
    };
  }

  /* ── 책상 ─────────────────────────────────────────────────────────── */
  function buildDesk() {
    var m = mats(), b = K.builder(), TOP = 0.72, TT = 0.028, HX = 0.34, HZ = 0.23;
    /* 상판: 둥근 모서리·둥근 가장자리. 모서리 띠는 어둡게, 손이 닿는 가장자리는 살짝 진하게 */
    var top = G.paint(G.plate(0.68, 0.46, 0.05, TT, { edge: 0.011, uv: 1 / 0.6, rings: 5, edgeSegs: 3, cornerSegs: 7 }),
      function (x, y, z, nx, ny, nz) {
        if (ny < -0.75) return [0.56, 0.48, 0.4];
        if (ny < 0.75) return [0.8, 0.66, 0.5];
        var e = Math.min(1 - Math.abs(x) / HX, 1 - Math.abs(z) / HZ), k = K.clamp(e / 0.09, 0, 1);
        return [0.86 + 0.14 * k, 0.83 + 0.17 * k, 0.78 + 0.22 * k];
      });
    b.add(top, m.laminate, { p: [0, TOP - TT / 2, 0] });
    /* 상판 아래 고정 앵글 + 나사 */
    var railY = TOP - TT - 0.007;
    [-1, 1].forEach(function (sx) {
      b.rbox(0.03, 0.012, 0.36, 0.004, m.steel, { p: [sx * 0.29, railY, 0] });
      [-0.15, 0.15].forEach(function (z) { b.cyl(0.0042, 0.0042, 0.004, m.zinc, { p: [sx * 0.29, railY - 0.008, z], seg: 10 }); });
    });
    /* 다리: 위는 앞·뒤 벌어진 사다리꼴, 바닥은 러너로 이어진 굽은 관 */
    var R = 0.0105, RY = 0.0125;
    [-1, 1].forEach(function (sx) {
      var x = sx * 0.29;
      b.pipe([[x, railY - 0.004, 0.165], [x, RY, 0.225], [x, RY, -0.225], [x, railY - 0.004, -0.165]], R, m.steel, { bend: 0.055, radial: 12 });
      [[0.165, railY - 0.004], [-0.165, railY - 0.004]].forEach(function (c) { b.sphere(R, m.steel, { p: [x, c[1], c[0]], ws: 12, hs: 8 }); });
      /* 러너 아래 고무 받침 */
      [0.155, -0.155].forEach(function (z) { b.rbox(0.03, 0.007, 0.075, 0.0025, m.rubber, { p: [x, 0.0035, z] }); });
    });
    /* 가로 보강대 (앞·뒤) */
    [[0.196, 0.34], [-0.196, 0.34]].forEach(function (c) { b.cyl(0.0088, 0.0088, 0.58, m.steel, { p: [0, c[1], c[0]], r: [0, 0, PI / 2], seg: 12 }); });
    /* 책 선반: 합판 + 앞뒤 보강대에 걸침 */
    var shelf = G.paint(G.plate(0.57, 0.37, 0.02, 0.012, { edge: 0.004, uv: 1 / 0.6, rings: 3, edgeSegs: 2, cornerSegs: 4 }),
      function (x, y, z, nx, ny) { return ny > 0.75 ? [0.95, 0.92, 0.88] : [0.7, 0.6, 0.5]; });
    b.add(shelf, m.plywood, { p: [0, 0.3585, 0] });
    /* 선반 고정 브래킷 */
    [-1, 1].forEach(function (sx) { b.rbox(0.028, 0.014, 0.028, 0.003, m.steel, { p: [sx * 0.29, 0.345, 0.196] }); });
    return b.build({ name: "schoolDesk" });
  }
  P.schoolDesk = function () { var g = P.tpl("schoolDesk", buildDesk); g.userData.topY = 0.72; g.userData.size = [0.68, 0.72, 0.46]; return g; };

  /* ── 의자 ─────────────────────────────────────────────────────────── */
  function buildChair() {
    var m = mats(), b = K.builder(), R = 0.0095, SEAT = 0.44, ST = 0.018;
    /* 좌판: 살짝 오목, 앞쪽이 내려간 폭포형 */
    var seat = G.paint(G.plate(0.41, 0.395, 0.07, ST, {
      edge: 0.0075, uv: 1 / 0.5, rings: 9, edgeSegs: 3, cornerSegs: 8,
      bend: function (v) {
        var u = v.x / 0.205, w = v.z / 0.1975;
        v.y += -0.007 * (1 - u * u) * (1 - w * w) + 0.018 * Math.max(0, -w) * Math.max(0, -w) * -1;
      }
    }), function (x, y, z, nx, ny) { return ny < -0.75 ? [0.6, 0.5, 0.42] : ny < 0.75 ? [0.8, 0.66, 0.5] : [1, 1, 1]; });
    b.add(seat, m.plywood, { p: [0, SEAT - ST / 2, 0.005] });
    /* 등판: 사람 쪽으로 오목하게 굽은 합판, 뒤로 8° 기울임 */
    var back = G.paint(G.plate(0.385, 0.185, 0.05, 0.016, {
      edge: 0.0065, uv: 1 / 0.5, rings: 8, edgeSegs: 3, cornerSegs: 8,
      bend: function (v) { var u = v.x / 0.1925, w = v.z / 0.0925; v.y += 0.024 * u * u - 0.005 * (1 - w * w); }
    }), function (x, y, z, nx, ny) { return ny < -0.75 ? [0.6, 0.5, 0.42] : ny < 0.75 ? [0.8, 0.66, 0.5] : [1, 1, 1]; });
    b.add(back, m.plywood, { p: [0, 0.762, 0.222], r: [-PI / 2 + 0.14, 0, 0] });
    /* 프레임: 앞다리 / 뒷다리+등받이 지지대 / 옆 보강 */
    [-1, 1].forEach(function (sx) {
      var x = sx * 0.192;
      b.pipe([[x, 0.014, -0.212], [x, SEAT - ST - 0.008, -0.17]], R, m.steel, { radial: 12 });
      b.pipe([[x, 0.014, 0.245], [x, SEAT - ST - 0.008, 0.196], [sx * 0.185, 0.86, 0.222]], R, m.steel, { bend: 0.09, radial: 12 });
      b.pipe([[x, 0.225, -0.189], [x, 0.225, 0.216]], R * 0.9, m.steel, { radial: 10 });
      b.sphere(R, m.steel, { p: [x, SEAT - ST - 0.008, -0.17], ws: 12, hs: 8 });
      b.sphere(R, m.steel, { p: [sx * 0.185, 0.86, 0.222], ws: 12, hs: 8 });
      /* 발 캡 */
      b.cyl(0.0125, 0.0115, 0.016, m.rubber, { p: [x, 0.008, -0.213], seg: 12 });
      b.cyl(0.0125, 0.0115, 0.016, m.rubber, { p: [x, 0.008, 0.246], seg: 12 });
      /* 좌판 아래 지지판 + 나사 */
      b.rbox(0.032, 0.006, 0.3, 0.002, m.steel, { p: [x, SEAT - ST - 0.003, 0.02] });
      [-0.09, 0.13].forEach(function (z) { b.cyl(0.0055, 0.0055, 0.003, m.zinc, { p: [sx * 0.192, SEAT - ST - 0.0075, z], seg: 10 }); });
      /* 등판 고정 브래킷 + 볼트 */
      b.rbox(0.03, 0.09, 0.008, 0.002, m.steel, { p: [sx * 0.182, 0.745, 0.228], r: [0.14, 0, 0] });
      [0.72, 0.78].forEach(function (y) { b.cyl(0.005, 0.005, 0.004, m.zinc, { p: [sx * 0.182, y, 0.2315], r: [PI / 2 + 0.14, 0, 0], seg: 10 }); });
    });
    /* 가로 보강대 */
    b.cyl(R * 0.85, R * 0.85, 0.384, m.steel, { p: [0, 0.225, -0.189], r: [0, 0, PI / 2], seg: 10 });
    b.cyl(R * 0.85, R * 0.85, 0.37, m.steel, { p: [0, 0.225, 0.2155], r: [0, 0, PI / 2], seg: 10 });
    /* 좌판 위 나사머리 */
    [[-0.13, -0.11], [0.13, -0.11], [-0.13, 0.13], [0.13, 0.13]].forEach(function (c) {
      b.cyl(0.0058, 0.0058, 0.0016, m.zinc, { p: [c[0], SEAT + 0.0005, c[1]], seg: 10 });
    });
    return b.build({ name: "schoolChair" });
  }
  P.schoolChair = function () { var g = P.tpl("schoolChair", buildChair); g.userData.seatY = 0.44; g.userData.size = [0.41, 0.9, 0.5]; return g; };
})(window);
