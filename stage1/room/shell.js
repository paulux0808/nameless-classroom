/* N1R.shell — 교실 건축: 마루·벽·천장·창·문·몰딩. 전부 코드로 만든 지오메트리.
   좌표: x∈[-5,5](왼쪽 창 / 오른쪽 액자), z∈[-4,4](앞 칠판 / 뒤 문), y∈[0,3.1].
   벽은 두께 24cm 의 실제 개구부를 가진 압출체라, 햇빛 그림자가 창 모양 그대로 바닥에 떨어진다. */
(function (root) {
  "use strict";
  var T = root.THREE, K = root.N1K, G = K.geo, X = K.tex, R = root.N1R = root.N1R || {};
  var PI = Math.PI;
  var W = 10, D = 8, H = 3.1, TH = 0.24, WAIN = 1.05, PLAT = 0.12, PLAT_D = 1.5;
  R.DIM = { W: W, D: D, H: H, TH: TH, WAIN: WAIN, PLAT: PLAT, PLAT_D: PLAT_D };

  /* 개구부(월드 좌표) — 창과 문 */
  R.WINDOWS = [-2.7, -0.95, 0.8, 2.55].map(function (z) { return { z: z, w: 1.3, y0: WAIN, y1: 2.55 }; });
  R.DOOR = { x0: 2.925, x1: 3.875, h: 2.1 };     /* 힌지는 오른쪽(x1). 바깥(+z)으로 열린다 */

  function mats() {
    return {
      plaster: K.mat("shell.plaster", function () {
        var t = X.plaster({ base: 0xbfae90, tone: 0xa8977a, stain: 0.75, size: 512 });
        t.map.repeat.set(1 / 2.2, 1 / 2.2); t.bump.repeat.set(1 / 2.2, 1 / 2.2);
        return K.std(0xffffff, 0.95, 0, { map: t.map, bump: t.bump, bumpScale: 0.0018 });
      }),
      wain: K.mat("shell.wain", function () {
        var t = X.plaster({ base: 0x6b7c6d, tone: 0x5b6c5e, stain: 0.55, size: 512, rough: 0.6 });
        var g = t.canvas.getContext("2d"), gb = t.bumpCanvas.getContext("2d"), n = 16, S = 512;
        for (var i = 0; i < n; i++) {   /* 비드보드 홈 */
          var x = Math.round(i * S / n);
          g.fillStyle = "rgba(20,30,22,.34)"; g.fillRect(x, 0, 2, S);
          g.fillStyle = "rgba(230,240,225,.10)"; g.fillRect(x + 2, 0, 1, S);
          gb.fillStyle = "rgb(30,30,30)"; gb.fillRect(x, 0, 3, S);
        }
        t.map.needsUpdate = true; t.bump.needsUpdate = true;
        t.map.repeat.set(1 / 0.9, 1 / 1.05); t.bump.repeat.set(1 / 0.9, 1 / 1.05);
        return K.std(0xffffff, 0.72, 0, { map: t.map, bump: t.bump, bumpScale: 0.0022 });
      }),
      trim: K.mat("shell.trim", function () {
        var t = X.wood({ base: 0x4c3220, dark: 0x2c1b10, rings: 3, seed: 61, fiber: 0.8 });
        t.map.repeat.set(1, 1);
        return K.std(0xffffff, 0.5, 0, { map: t.map, bump: t.bump, bumpScale: 0.001, vc: true });
      }),
      paintCream: K.mat("shell.paintCream", function () {
        var t = X.plaster({ base: 0xddd7c6, tone: 0xcdc6b2, stain: 0.5, size: 256, rough: 0.5 });
        t.map.repeat.set(1, 1);
        return K.std(0xffffff, 0.55, 0, { map: t.map, bump: t.bump, bumpScale: 0.0012 });
      }),
      brass: K.mat("shell.brass", function () { return K.std(0xc9a256, 0.32, 0.9, { env: 1.2 }); }),
      steel: K.mat("shell.steel", function () { return K.std(0x777d82, 0.42, 0.85, { env: 1.1 }); }),
      glass: K.mat("shell.glass", function () {
        var m = K.std(0xdfeaf0, 0.06, 0, { opacity: 0.14, env: 1.4 });
        m.depthWrite = false; return m;
      }),
      tbar: K.mat("shell.tbar", function () { return K.std(0xcfc8b8, 0.6, 0.2); }),
      tile: K.mat("shell.tile", function () {
        var t = X.ceilingTile({ base: 0xd3ccbd, size: 256 });
        t.map.repeat.set(1 / 0.6, 1 / 0.6); t.bump.repeat.set(1 / 0.6, 1 / 0.6);
        return K.std(0xffffff, 0.92, 0, { map: t.map, bump: t.bump, bumpScale: 0.0012 });
      }),
      floor: K.mat("shell.floor", function () {
        var t = X.wood({ base: 0x775033, dark: 0x4d3121, rings: 4, seed: 23, fiber: 1.15, w: 512, h: 512 });
        return K.std(0xffffff, 0.42, 0, { map: t.map, bump: t.bump, bumpScale: 0.0009, vc: true });
      }),
      under: K.mat("shell.under", function () { return K.std(0x160e08, 1, 0); }),
      fixture: K.mat("shell.fixture", function () { return K.std(0xe3e0d6, 0.55, 0.25); }),
      tube: K.mat("shell.tube", function () { return K.std(0xf4f2ea, 0.4, 0, { emissive: 0x2a2a28, ei: 0.4 }); })
    };
  }

  /* ── 벽 한 면(가로띠)을 개구부와 함께 압출 ─────────────────────────────
     holes: [{s0,s1,y0,y1}] (벽을 따라 놓인 월드 좌표 s), 바닥(띠 아래)에 닿는 개구부는 윤곽에 파고든다. */
  var WALLS = {
    back:  { pos: [0, 0, D / 2],  rot: 0,       L0: -W / 2 - TH, L1: W / 2 + TH, sgn: 1 },
    front: { pos: [0, 0, -D / 2], rot: PI,      L0: -W / 2 - TH, L1: W / 2 + TH, sgn: -1 },
    left:  { pos: [-W / 2, 0, 0], rot: -PI / 2, L0: -D / 2,      L1: D / 2,      sgn: 1 },
    right: { pos: [W / 2, 0, 0],  rot: PI / 2,  L0: -D / 2,      L1: D / 2,      sgn: -1 }
  };
  function wallBand(name, y0, y1, holes, uvScale) {
    var w = WALLS[name], sg = w.sgn;
    var lx0 = sg > 0 ? w.L0 : -w.L1, lx1 = sg > 0 ? w.L1 : -w.L0;
    var notches = [], inner = [];
    holes.forEach(function (h) {
      var hy0 = Math.max(h.y0, y0), hy1 = Math.min(h.y1, y1);
      if (hy1 <= hy0 + 1e-6) return;
      var a = sg > 0 ? h.s0 : -h.s1, b = sg > 0 ? h.s1 : -h.s0;
      var rec = { a: a, b: b, y0: hy0, y1: hy1 };
      if (hy0 <= y0 + 1e-6) notches.push(rec); else inner.push(rec);
    });
    notches.sort(function (p, q) { return p.a - q.a; });
    var s = new T.Shape();
    s.moveTo(lx0, y0);
    notches.forEach(function (n) { s.lineTo(n.a, y0); s.lineTo(n.a, n.y1); s.lineTo(n.b, n.y1); s.lineTo(n.b, y0); });
    s.lineTo(lx1, y0); s.lineTo(lx1, y1); s.lineTo(lx0, y1); s.lineTo(lx0, y0);
    inner.forEach(function (n) {
      var p = new T.Path(); p.moveTo(n.a, n.y0); p.lineTo(n.a, n.y1); p.lineTo(n.b, n.y1); p.lineTo(n.b, n.y0); p.lineTo(n.a, n.y0);
      s.holes.push(p);
    });
    var g = new T.ExtrudeGeometry(s, { depth: TH, bevelEnabled: false, steps: 1 });
    /* 벽 안쪽 면(로컬 z=0)의 UV 를 미터 단위로 고정: 텍스처 repeat 로 크기를 정한다 */
    var pos = g.attributes.position, uv = g.attributes.uv;
    for (var i = 0; i < pos.count; i++) uv.setXY(i, pos.getX(i) * (uvScale || 1), pos.getY(i) * (uvScale || 1));
    return g;
  }
  function wallXf(name) { var w = WALLS[name]; return { p: w.pos, r: [0, w.rot, 0] }; }

  /* 로컬(벽 기준) → 월드 변환을 위해 벽 하나의 세계 행렬을 돌려준다 */
  R.wallMatrix = function (name) { return K.xf(wallXf(name)); };

  /* ── 마루: 긴 판이 앞뒤(z)로 흐르고 이음매가 어긋난다. 판마다 색·결이 다르다. ── */
  function buildFloor(M) {
    var rng = K.rng(20260929), BW = 0.096, gap = 0.0016, ch = 0.0017, su = 1 / 1.3, sv = 1 / 0.22;
    var pos = [], nor = [], uv = [], col = [], idx = [], vi = 0;
    var x0 = -W / 2 - 0.02, z0 = -D / 2 - 0.02, z1 = D / 2 + 0.02;
    var Zs = z0;
    function quad(a, b, c, d, n, tint, dark, offU, offV, bz0) {
      /* a,b,c,d: [x,y,z] 반시계(위에서 볼 때), n: 법선 */
      [a, b, c, d].forEach(function (p, k) {
        pos.push(p[0], p[1], p[2]); nor.push(n[0], n[1], n[2]);
        uv.push((p[2] - bz0) * su + offU, (p[0] - a[0]) * sv + offV + (k === 1 || k === 2 ? 0 : 0));
        var dk = dark && (k === 0 || k === 1) ? 0.32 : 1;   /* 바깥쪽(아래) 정점은 홈 그늘 */
        col.push(tint[0] * dk, tint[1] * dk, tint[2] * dk);
      });
      idx.push(vi, vi + 1, vi + 2, vi, vi + 2, vi + 3); vi += 4;
    }
    for (var x = x0; x < W / 2 + 0.03; x += BW) {
      var stagger = rng.range(0, 1.6), z = z0 - stagger;
      while (z < z1) {
        var len = rng.range(0.9, 1.9), za = Math.max(z, z0), zb = Math.min(z + len, z1);
        if (zb - za > 0.05) {
          var tone = rng.range(0.86, 1.08), warm = rng.range(-0.05, 0.05);
          var tint = [tone * (1 + warm), tone, tone * (1 - warm * 1.4)];
          var offU = rng.next(), offV = rng.next();
          var ax0 = x + gap / 2, ax1 = x + BW - gap / 2, az0 = za + gap / 2, az1 = zb - gap / 2;
          var ix0 = ax0 + ch, ix1 = ax1 - ch, iz0 = az0 + ch, iz1 = az1 - ch, y = ch;
          /* 위 면 */
          quad([ix0, y, iz1], [ix1, y, iz1], [ix1, y, iz0], [ix0, y, iz0], [0, 1, 0], tint, false, offU, offV, za);
          /* 모따기 4면: 바깥(아래)에서 안쪽(위)으로 */
          quad([ax0, 0, az1], [ax1, 0, az1], [ix1, y, iz1], [ix0, y, iz1], [0, 0.7, 0.7], tint, true, offU, offV, za);
          quad([ax1, 0, az0], [ax0, 0, az0], [ix0, y, iz0], [ix1, y, iz0], [0, 0.7, -0.7], tint, true, offU, offV, za);
          quad([ax0, 0, az0], [ax0, 0, az1], [ix0, y, iz1], [ix0, y, iz0], [-0.7, 0.7, 0], tint, true, offU, offV, za);
          quad([ax1, 0, az1], [ax1, 0, az0], [ix1, y, iz0], [ix1, y, iz1], [0.7, 0.7, 0], tint, true, offU, offV, za);
        }
        z += len;
      }
    }
    var g = new T.BufferGeometry();
    g.setAttribute("position", new T.Float32BufferAttribute(pos, 3));
    g.setAttribute("normal", new T.Float32BufferAttribute(nor, 3));
    g.setAttribute("uv", new T.Float32BufferAttribute(uv, 2));
    var c = new T.Color(), lin = new Float32Array(col.length);
    for (var i = 0; i < col.length; i += 3) { c.setRGB(col[i], col[i + 1], col[i + 2]).convertSRGBToLinear(); lin[i] = c.r; lin[i + 1] = c.g; lin[i + 2] = c.b; }
    g.setAttribute("color", new T.BufferAttribute(lin, 3));
    /* 바닥 전체 좌표로 uv2 (aoMap 용): 방 전체에 한 장 */
    var uv2 = new Float32Array(pos.length / 3 * 2);
    for (var k = 0; k < pos.length / 3; k++) { uv2[k * 2] = (pos[k * 3] + W / 2) / W; uv2[k * 2 + 1] = 1 - (pos[k * 3 + 2] + D / 2) / D; }
    g.setAttribute("uv2", new T.BufferAttribute(uv2, 2));
    g.setIndex(new T.BufferAttribute(vi > 65535 ? new Uint32Array(idx) : new Uint16Array(idx), 1));
    g.computeBoundingSphere();
    var mesh = new T.Mesh(g, M.floor);
    mesh.receiveShadow = true; mesh.castShadow = false; mesh.name = "floorBoards";
    var under = new T.Mesh(new T.PlaneGeometry(W + 0.2, D + 0.2), M.under);
    under.rotation.x = -PI / 2; under.position.y = -0.0004; under.receiveShadow = true; under.name = "floorUnder";
    var grp = new T.Group(); grp.add(under); grp.add(mesh);
    return grp;
  }

  /* ── 몰딩 조각: 벽면에 붙은 가로 레일/걸레받이 ── */
  function railSegments(wall, y, hgt, depth, holes, mat, b, tint) {
    var w = WALLS[wall], pieces = [], a0 = wall === "left" || wall === "right" ? -D / 2 : -W / 2, a1 = -a0, cur = a0;
    holes.filter(function (h) { return h.y0 < y + hgt && h.y1 > y; }).sort(function (p, q) { return p.s0 - q.s0; }).forEach(function (h) {
      if (h.s0 > cur) pieces.push([cur, h.s0]);
      cur = Math.max(cur, h.s1);
    });
    if (cur < a1) pieces.push([cur, a1]);
    pieces.forEach(function (pc) {
      var len = pc[1] - pc[0], mid = (pc[0] + pc[1]) / 2, gm = G.rbox(len, hgt, depth, Math.min(hgt, depth) * 0.3, 2, 1);
      var p, r = 0;
      if (wall === "back") { p = [mid, y + hgt / 2, D / 2 - depth / 2]; }
      else if (wall === "front") { p = [mid, y + hgt / 2, -D / 2 + depth / 2]; }
      else if (wall === "left") { p = [-W / 2 + depth / 2, y + hgt / 2, mid]; r = PI / 2; }
      else { p = [W / 2 - depth / 2, y + hgt / 2, mid]; r = PI / 2; }
      b.add(gm, mat, { p: p, r: [0, r, 0], tint: tint });
    });
  }

  R.buildShell = function (scene) {
    var M = mats(), out = { group: new T.Group(), anchors: {}, mats: M };
    out.group.name = "shell";
    var allHoles = { back: [], front: [], left: [], right: [] };
    R.WINDOWS.forEach(function (w) { allHoles.left.push({ s0: w.z - w.w / 2, s1: w.z + w.w / 2, y0: w.y0, y1: w.y1 }); });
    allHoles.back.push({ s0: R.DOOR.x0, s1: R.DOOR.x1, y0: 0, y1: R.DOOR.h });
    /* 벽 8장: 각 벽의 아랫띠(비드보드 페인트) + 윗띠(회벽) */
    ["back", "front", "left", "right"].forEach(function (name) {
      var lo = new T.Mesh(wallBand(name, 0, WAIN, allHoles[name], 1), M.wain);
      var hi = new T.Mesh(wallBand(name, WAIN, H, allHoles[name], 1), M.plaster);
      [lo, hi].forEach(function (m) {
        var xf = wallXf(name); m.position.set(xf.p[0], xf.p[1], xf.p[2]); m.rotation.y = xf.r[1];
        m.castShadow = true; m.receiveShadow = true; m.name = "wall-" + name; out.group.add(m);
      });
    });
    /* 바닥 */
    out.group.add(buildFloor(M));
    /* 천장: 텍스 + T-바 + 형광등 */
    var ceil = new T.Mesh(new T.PlaneGeometry(W + 0.5, D + 0.5), M.tile);
    ceil.rotation.x = PI / 2; ceil.position.y = H; ceil.receiveShadow = true; ceil.name = "ceilingTiles";
    out.group.add(ceil);
    var b = K.builder(), cy = H - 0.012;
    for (var x = -W / 2; x <= W / 2 + 0.001; x += 0.6) b.rbox(0.024, 0.018, D + 0.1, 0.004, M.tbar, { p: [x, cy, 0] });
    for (var z = -D / 2; z <= D / 2 + 0.001; z += 0.6) b.rbox(W + 0.1, 0.018, 0.024, 0.004, M.tbar, { p: [0, cy, z] });
    /* 형광등 2열 × 3: 1.2m 2등형 */
    var fixtures = [];
    [-2.4, 2.4].forEach(function (fx) { [-2.2, 0.2, 2.6].forEach(function (fz) { fixtures.push([fx, fz]); }); });
    fixtures.forEach(function (f) {
      b.rbox(1.24, 0.07, 0.34, 0.012, M.fixture, { p: [f[0], H - 0.045, f[1]] });
      b.rbox(1.3, 0.012, 0.4, 0.004, M.fixture, { p: [f[0], H - 0.086, f[1]] });
      [-0.075, 0.075].forEach(function (dz) { b.cyl(0.0125, 0.0125, 1.16, M.tube, { p: [f[0], H - 0.095, f[1] + dz], r: [0, 0, PI / 2], seg: 14 }); });
      [-0.6, 0.6].forEach(function (dx) { b.rbox(0.05, 0.03, 0.2, 0.006, M.fixture, { p: [f[0] + dx, H - 0.09, f[1]] }); });
    });
    /* 몰딩: 걸레받이 + 벽널 캡 레일 (개구부는 건너뛴다) */
    var trimTint = null;
    ["back", "front", "left", "right"].forEach(function (nm) {
      railSegments(nm, 0, 0.13, 0.024, allHoles[nm], M.trim, b, trimTint);
      railSegments(nm, WAIN - 0.005, 0.05, 0.034, allHoles[nm], M.trim, b, trimTint);
    });
    var shellStatic = b.build({ name: "shellTrim" });
    out.group.add(shellStatic);
    return out;
  };
})(window);
