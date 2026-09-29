/* N1P.teacher — 감독교사. 관절 계층(골반·척추·목·팔·다리)으로 리깅한 인물.
   · 앉은 자세·선 자세를 오가며(일어나 비켜서기), 숨쉬기·눈 깜빡임·시선 따라가기를 한다.
   · 전신을 코드로 모델링: 정장(라펠·셔츠·넥타이), 손가락, 안경, 머리카락, 얼굴 요철.
   앞면 +Z, 원점은 발이 놓인 바닥 중앙. 앉은 자세의 골반 높이 0.5(안락의자 좌면). */
(function (root) {
  "use strict";
  var T = root.THREE, K = root.N1K, G = K.geo, X = K.tex, P = root.N1P, PI = Math.PI;

  function S(t) { return t * t * (3 - 2 * t); }
  function sm(t) { return S(K.clamp(t, 0, 1)); }

  function mats() {
    return {
      skin: K.mat("person.skin", function () {
        var t = X.gen(256, 256, function (u, v) {
          var n = K.fbm(u * 8, v * 8, 3, 8, 8), f = K.noise2(u * 90, v * 90, 90, 90);
          var cheek = Math.exp(-Math.pow((u - 0.25) / 0.05, 2) - Math.pow((v - 0.56) / 0.07, 2)) + Math.exp(-Math.pow((u - 0.25 - 0.13) / 0.05, 2) - Math.pow((v - 0.56) / 0.07, 2)) * 0;
          var k = 1 + n * 0.05 + f * 0.025;
          return [216 * k + cheek * 8, (166 - cheek * 10) * k, (132 - cheek * 12) * k, 128 + f * 10];
        }, {});
        return K.std(0xffffff, 0.6, 0, { map: t.map, bump: t.bump, bumpScale: 0.0004, env: 0.45 });
      }),
      suit: K.mat("person.suit", function () {
        var t = X.gen(128, 128, function (u, v) {
          var h = ((Math.floor(u * 32) + Math.floor(v * 64)) & 1) * 7, n = K.fbm(u * 6, v * 6, 3, 6, 6), f = K.noise2(u * 70, v * 70, 70, 70);
          var k = 1 + n * 0.08 + f * 0.04; return [(64 + h) * k, (67 + h) * k, (73 + h) * k, 128 + h * 3 + f * 20];
        }, {});
        t.map.repeat.set(3, 3); t.bump.repeat.set(3, 3);
        return K.std(0xffffff, 0.9, 0, { map: t.map, bump: t.bump, bumpScale: 0.0006, env: 0.35 });
      }),
      lapel: K.mat("person.lapel", function () { return K.std(0x2b2d31, 0.5, 0.05, { env: 0.6 }); }),
      shirt: K.mat("person.shirt", function () { return K.std(0xece9e1, 0.7, 0, { env: 0.4 }); }),
      tie: K.mat("person.tie", function () {
        var c = P.canvas(64, 256, function (g, w, h) { g.fillStyle = "#6a1f2c"; g.fillRect(0, 0, w, h); g.strokeStyle = "rgba(226,190,120,.55)"; g.lineWidth = 5; for (var i = -h; i < h; i += 26) { g.beginPath(); g.moveTo(0, i + 40); g.lineTo(w, i); g.stroke(); } });
        var t = new T.CanvasTexture(c); t.encoding = T.sRGBEncoding; return K.std(0xffffff, 0.5, 0, { map: t, env: 0.6 });
      }),
      shoe: K.mat("person.shoe", function () { return K.std(0x14120f, 0.33, 0.1, { env: 1.1 }); }),
      hair: K.mat("person.hair", function () {
        var t = X.gen(256, 128, function (u, v) { var s = K.noise2(u * 180, v * 14, 180, 14), n = K.fbm(u * 6, v * 4, 3, 6, 4); var k = 0.8 + s * 0.16 + n * 0.1; return [128 * k, 126 * k, 121 * k, 128 + s * 50]; }, {});
        return K.std(0xffffff, 0.78, 0.05, { map: t.map, bump: t.bump, bumpScale: 0.0007, env: 0.5 });
      }),
      white: K.mat("person.eyewhite", function () { return K.std(0xf1efe8, 0.35, 0, { env: 0.8 }); }),
      iris: K.mat("person.iris", function () { return K.std(0x3a2a1c, 0.25, 0.1, { env: 1.2 }); }),
      lip: K.mat("person.lip", function () { return K.std(0xb27a72, 0.5, 0, { env: 0.5 }); }),
      brow: K.mat("person.brow", function () { return K.std(0x6e6c68, 0.85, 0, { env: 0.3 }); }),
      frame: K.mat("person.glasses", function () { return K.std(0x1d1c1a, 0.35, 0.6, { env: 1.2 }); }),
      lens: K.mat("person.lens", function () { var m = K.std(0xffffff, 0.04, 0, { opacity: 0.1, env: 1.5 }); m.depthWrite = false; return m; })
    };
  }

  /* 머리: 구를 깎아 이마·눈두덩·볼·턱선을 만든다 */
  function headGeometry() {
    var rx = 0.078, ry = 0.105, rz = 0.094, g = new T.SphereGeometry(1, 56, 44), pos = g.attributes.position;
    for (var i = 0; i < pos.count; i++) {
      var nx = pos.getX(i), ny = pos.getY(i), nz = pos.getZ(i);
      var x = nx * rx, y = ny * ry, z = nz * rz;
      var low = sm((-ny - 0.02) / 0.98);                          /* 아래로 갈수록 턱 */
      x *= 1 - 0.34 * low; z *= 1 - 0.06 * low;
      if (nz > 0) z += 0.012 * low * nz * (ny < -0.6 ? 1.2 : 0.7); /* 턱이 앞으로 */
      if (ny < -0.78) y *= 1.04;
      var front = sm((nz - 0.1) / 0.9);
      z += 0.0075 * Math.exp(-Math.pow((ny - 0.2) / 0.09, 2)) * front;                      /* 눈썹뼈 */
      var ex = Math.abs(nx) - 0.44;
      z -= 0.0062 * Math.exp(-(ex * ex / 0.03 + Math.pow((ny - 0.08) / 0.1, 2))) * front;    /* 눈두덩 */
      x += Math.sign(nx) * 0.004 * Math.exp(-(Math.pow((ny + 0.28) / 0.16, 2))) * (Math.abs(nx) > 0.5 ? 1 : 0);  /* 광대 */
      x *= 1 - 0.05 * Math.exp(-Math.pow((ny - 0.04) / 0.2, 2)) * (Math.abs(nx) > 0.85 ? 1 : 0);          /* 관자놀이 */
      pos.setXYZ(i, x, y, z);
    }
    g.computeVertexNormals();
    return g;
  }

  P.teacher = function (opts) {
    opts = opts || {};
    var m = mats(), root = new T.Group(); root.name = "teacher";
    var J = {};
    function joint(name, parent, x, y, z) { var g = new T.Group(); g.name = name; g.position.set(x, y, z); parent.add(g); J[name] = g; return g; }
    function add(parent, obj) { obj.traverse(function (o) { if (o.isMesh) { o.castShadow = true; o.receiveShadow = true; } }); parent.add(obj); return obj; }

    /* ── 골격 ── */
    var hips = joint("hips", root, 0, 0.5, -0.1);
    var spine = joint("spine", hips, 0, 0.04, 0);
    var chest = joint("chest", spine, 0, 0.2, 0);
    var neck = joint("neck", chest, 0, 0.27, 0.005);
    var head = joint("head", neck, 0, 0.034, 0.008);
    var sh = { L: joint("shL", chest, -0.195, 0.17, 0), R: joint("shR", chest, 0.195, 0.17, 0) };
    sh.L.rotation.order = "YXZ"; sh.R.rotation.order = "YXZ";
    var el = { L: joint("elL", sh.L, 0, -0.29, 0), R: joint("elR", sh.R, 0, -0.29, 0) };
    var wr = { L: joint("wrL", el.L, 0, -0.26, 0), R: joint("wrR", el.R, 0, -0.26, 0) };
    var hip = { L: joint("hipL", hips, -0.092, -0.03, 0), R: joint("hipR", hips, 0.092, -0.03, 0) };
    var kn = { L: joint("knL", hip.L, 0, -0.44, 0), R: joint("knR", hip.R, 0, -0.44, 0) };
    var an = { L: joint("anL", kn.L, 0, -0.44, 0), R: joint("anR", kn.R, 0, -0.44, 0) };

    /* ── 골반·치마단 (바지+재킷 단) ── */
    var pb = K.builder();
    pb.rbox(0.36, 0.2, 0.27, 0.09, m.suit, { p: [0, -0.02, 0.0], segs: 3, uv: 2 });
    pb.lathe([[0.18, 0.05], [0.2, -0.05], [0.215, -0.14], [0.21, -0.17], [0.17, -0.17], [0.17, 0.0]], m.suit, { s: [1, 1, 0.82], p: [0, 0.02, 0.01], seg: 32 });
    add(hips, pb.build({ name: "pelvis" }));

    /* ── 몸통: 타원 단면 회전체 + 재킷 디테일 ── */
    var tb = K.builder();
    var tprof = [[0.13, 0.0], [0.148, 0.05], [0.166, 0.12], [0.18, 0.22], [0.19, 0.31], [0.186, 0.38], [0.168, 0.425], [0.13, 0.455], [0.085, 0.478], [0.062, 0.495], [0.0, 0.5]];
    var TZ = 0.63;
    function tz(y) {           /* spine 기준 높이 y 에서 몸통 앞면의 z */
      var yy = y + 0.02, k = 0; for (; k < tprof.length - 2 && tprof[k + 1][1] < yy; k++);
      var a0 = tprof[k], b0 = tprof[k + 1], f = K.clamp((yy - a0[1]) / ((b0[1] - a0[1]) || 1), 0, 1);
      return (a0[0] + (b0[0] - a0[0]) * f) * TZ;
    }
    tb.lathe(tprof, m.suit, { p: [0, -0.02, 0], s: [1, 1, TZ], seg: 40 });
    /* 어깨선: 납작한 패드로 각을 살린다 */
    [-1, 1].forEach(function (sx) { tb.sphere(0.066, m.suit, { p: [sx * 0.19, 0.385, -0.002], s: [1.2, 0.62, 1.0], ws: 22, hs: 12 }); });
    add(spine, tb.build({ name: "torso" }));
    /* 앞면 디테일: 셔츠 V, 칼라, 넥타이, 라펠(띠), 단추, 행커치프 */
    var fb = K.builder(), Z0 = 0.004;
    var vshirt = new T.Shape(); vshirt.moveTo(-0.06, 0.41); vshirt.lineTo(0.06, 0.41); vshirt.lineTo(0.011, 0.14); vshirt.lineTo(-0.011, 0.14); vshirt.lineTo(-0.06, 0.41);
    fb.add(G.extrude(vshirt, 0.004, null), m.shirt, { p: [0, 0, tz(0.3) + 0.0005] });
    [-1, 1].forEach(function (s) {
      var lap = new T.Shape(); lap.moveTo(s * 0.011, 0.14); lap.lineTo(s * 0.062, 0.418); lap.lineTo(s * 0.108, 0.395); lap.lineTo(s * 0.098, 0.36); lap.lineTo(s * 0.122, 0.33); lap.lineTo(s * 0.062, 0.2); lap.lineTo(s * 0.052, 0.14); lap.lineTo(s * 0.011, 0.14);
      fb.add(G.extrude(lap, 0.014, { size: 0.0025, thick: 0.0025, segs: 1 }), m.suit, { p: [0, 0, tz(0.3) + 0.0035] });
      fb.add(G.extrude(lap, 0.003, null), m.lapel, { p: [0, 0, tz(0.3) + 0.0125], s: [0.93, 0.95, 1] });
      var col = new T.Shape(); col.moveTo(0, 0); col.lineTo(s * 0.062, 0.03); col.lineTo(s * 0.04, -0.05); col.lineTo(0, -0.032); col.lineTo(0, 0);
      fb.add(G.extrude(col, 0.007, { size: 0.001, thick: 0.001, segs: 1 }), m.shirt, { p: [0, 0.452, tz(0.44) - 0.004], r: [0.35, 0, 0] });
    });
    var tie = new T.Shape(); tie.moveTo(-0.013, 0); tie.lineTo(0.013, 0); tie.lineTo(0.021, -0.19); tie.lineTo(0.0, -0.225); tie.lineTo(-0.021, -0.19); tie.lineTo(-0.013, 0);
    fb.add(G.extrude(tie, 0.006, { size: 0.0015, thick: 0.0015, segs: 1 }), m.tie, { p: [0, 0.4, tz(0.3) + 0.0065] });
    fb.rbox(0.032, 0.03, 0.016, 0.006, m.tie, { p: [0, 0.398, tz(0.4) + 0.01] });
    [0.15, 0.06].forEach(function (y) { fb.sphere(0.0065, m.lapel, { p: [0, y, tz(y) + 0.008], ws: 10, hs: 8 }); });
    fb.rbox(0.002, 0.16, 0.003, 0.001, m.lapel, { p: [0, 0.05, tz(0.05) + 0.004] });
    fb.rbox(0.055, 0.013, 0.008, 0.003, m.suit, { p: [0.095, 0.2, tz(0.2) + 0.005], r: [0, 0, 0.1] });
    var hk = new T.Shape(); hk.moveTo(0, 0); hk.lineTo(0.026, 0); hk.lineTo(0.018, 0.021); hk.lineTo(0.009, 0.013); hk.lineTo(0, 0.023); hk.lineTo(0, 0);
    fb.add(G.extrude(hk, 0.004, null), m.shirt, { p: [-0.112, 0.226, tz(0.23) + 0.004], r: [0, 0, 0.1] });
    add(spine, fb.build({ name: "torsoFront" }));

    /* ── 목·칼라 ── */
    var nb = K.builder();
    nb.cyl(0.058, 0.064, 0.085, m.skin, { p: [0, 0.03, 0.0], seg: 22 });
    nb.torus(0.064, 0.012, m.shirt, { p: [0, -0.004, 0.0], r: [PI / 2 - 0.12, 0, 0], ts: 26, rs: 8 });
    add(neck, nb.build({ name: "neck" }));

    /* ── 머리 ── */
    var hg = headGeometry(), hm = new T.Mesh(hg, m.skin); hm.position.set(0, 0.117, 0.01); hm.castShadow = true; hm.receiveShadow = true; head.add(hm);
    hm.updateMatrixWorld(true);
    var ray = new T.Raycaster();
    function surfZ(x, y) {           /* 머리 표면의 z (머리 그룹 좌표) */
      ray.set(new T.Vector3(x, y, 0.5), new T.Vector3(0, 0, -1)); var hit = ray.intersectObject(hm, false)[0];
      return hit ? hit.point.z : 0.09;
    }
    var hb = K.builder(), lensB = K.builder(), ey = 0.145;
    /* 눈 */
    var eyeZ = surfZ(0.033, ey) - 0.006;
    var eyes = [];
    [-1, 1].forEach(function (s) {
      var eg = new T.Group(); eg.position.set(s * 0.034, ey, eyeZ); head.add(eg);
      var white = new T.Mesh(new T.SphereGeometry(0.0108, 20, 14), m.white); eg.add(white);
      var iris = new T.Mesh(new T.CircleGeometry(0.0054, 20), m.iris); iris.position.z = 0.0106; eg.add(iris);
      var pup = new T.Mesh(new T.CircleGeometry(0.0024, 14), K.mat("person.pupil", function () { return K.std(0x050505, 0.2, 0, { env: 1.4 }); })); pup.position.z = 0.0108; eg.add(pup);
      var lid = new T.Mesh(new T.SphereGeometry(0.0117, 20, 10, 0, PI * 2, 0, PI * 0.5), m.skin); lid.rotation.x = -0.26; eg.add(lid);
      var lidL = new T.Mesh(new T.SphereGeometry(0.0117, 20, 10, 0, PI * 2, PI * 0.5, PI * 0.5), m.skin); lidL.rotation.x = 0.85; eg.add(lidL);
      eg.traverse(function (o) { if (o.isMesh) { o.castShadow = false; o.receiveShadow = true; } });
      eyes.push({ g: eg, lid: lid, iris: iris, pup: pup });
    });
    /* 코 */
    var nz0 = surfZ(0, 0.117 - 0.02);
    hb.sphere(0.0122, m.skin, { p: [0, 0.087, nz0 + 0.0005], s: [0.95, 0.95, 1.1], ws: 16, hs: 12 });
    hb.limb(0.0055, 0.0082, 0.032, m.skin, { p: [0, 0.117, surfZ(0, 0.117) + 0.0015], r: [0.2, 0, 0], seg: 12 });
    [-1, 1].forEach(function (s) { hb.sphere(0.0072, m.skin, { p: [s * 0.0105, 0.084, nz0 - 0.002], s: [1, 0.8, 0.95], ws: 12, hs: 8 }); });
    /* 입술과 입선 */
    var mz = surfZ(0, 0.06);
    hb.torus(0.0165, 0.0027, m.lip, { p: [0, 0.0625, mz + 0.0006], r: [0, 0, PI * 1.02], arc: PI * 0.98, ts: 20, rs: 8, s: [1.3, 0.5, 0.8] });
    hb.torus(0.0155, 0.0033, m.lip, { p: [0, 0.0535, mz - 0.0006], r: [0, 0, 0], arc: PI * 0.98, ts: 20, rs: 8, s: [1.25, 0.55, 0.8] });
    hb.cyl(0.0012, 0.0012, 0.034, K.mat("person.mouth", function () { return K.std(0x3a1a17, 0.6, 0); }), { p: [0, 0.0575, mz + 0.0005], r: [0, 0, PI / 2], seg: 6 });
    /* 귀 */
    [-1, 1].forEach(function (s) {
      hb.sphere(0.024, m.skin, { p: [s * 0.0765, 0.112, 0.006], s: [0.32, 1.1, 0.72], ws: 16, hs: 12 });
      hb.torus(0.014, 0.0028, m.skin, { p: [s * 0.081, 0.114, 0.0055], r: [0, PI / 2, 0], arc: PI * 1.6, ts: 14, rs: 6, s: [1, 1.5, 1] });
    });
    /* 눈썹 */
    [-1, 1].forEach(function (s) {
      hb.limb(0.0062, 0.0046, 0.052, m.brow, { p: [s * 0.036, ey + 0.026, surfZ(s * 0.036, ey + 0.026) + 0.0022], r: [0.0, 0, PI / 2 + s * 0.12], s: [1, 1, 0.75], seg: 8 });
    });
    add(head, hb.build({ name: "headParts" }));
    /* 안경 */
    var gb = K.builder(), gz = eyeZ + 0.024;
    [-1, 1].forEach(function (s) {
      gb.torus(0.0215, 0.0016, m.frame, { p: [s * 0.034, ey, gz], ts: 32, rs: 6 });
      var ln = new T.Mesh(new T.CircleGeometry(0.0212, 28), m.lens); ln.position.set(s * 0.034, ey, gz); ln.renderOrder = 6; head.add(ln);
      gb.pipe([[s * 0.0555, ey, gz], [s * 0.076, ey - 0.002, gz - 0.006], [s * 0.084, ey - 0.006, gz - 0.06], [s * 0.081, ey - 0.02, gz - 0.098]], 0.0012, m.frame, { bend: 0.01, radial: 5 });
    });
    gb.torus(0.011, 0.0014, m.frame, { p: [0, ey + 0.008, gz], arc: PI, ts: 12, rs: 5 });
    add(head, gb.build({ name: "glasses" }));
    /* 머리카락: 두피를 덮는 껍질 + 옆머리 */
    var hairG = new T.SphereGeometry(1, 48, 24, 0, PI * 2, 0, PI * 0.56);
    var hp = hairG.attributes.position;
    for (var i = 0; i < hp.count; i++) {
      var nx = hp.getX(i), ny = hp.getY(i), nzv = hp.getZ(i), n = K.noise2(nx * 6 + 3, nzv * 6 + ny * 4, 64, 64) * 0.012;
      hp.setXYZ(i, nx * (0.0845 + n), ny * (0.1125 + n), nzv * (0.1025 + n));
    }
    hairG.computeVertexNormals();
    var hair = new T.Mesh(hairG, m.hair); hair.position.set(0, 0.117 + 0.004, 0.002); hair.rotation.x = -0.2; head.add(hair); hair.castShadow = true;
    var hs = K.builder();
    [-1, 1].forEach(function (s) {
      hs.sphere(0.03, m.hair, { p: [s * 0.068, 0.145, -0.012], s: [0.42, 1.5, 1.4], ws: 14, hs: 10 });
      hs.sphere(0.03, m.hair, { p: [s * 0.058, 0.098, -0.032], s: [0.5, 1.2, 1.1], ws: 14, hs: 10 });
    });
    add(head, hs.build({ name: "hairSides" }));

    /* ── 팔 ── */
    var handG = {};
    function buildArm(side) {
      var s = side === "L" ? -1 : 1;
      var ab = K.builder();
      ab.sphere(0.056, m.suit, { ws: 20, hs: 14 });
      ab.limb(0.052, 0.045, 0.3, m.suit, { p: [0, -0.15, 0], seg: 18 });
      add(sh[side], ab.build({ name: "upperArm" + side }));
      var fbd = K.builder();
      fbd.sphere(0.045, m.suit, { ws: 18, hs: 12 });
      fbd.limb(0.046, 0.036, 0.265, m.suit, { p: [0, -0.135, 0], seg: 18 });
      fbd.cyl(0.0385, 0.0385, 0.028, m.shirt, { p: [0, -0.262, 0], seg: 16 });
      add(el[side], fbd.build({ name: "forearm" + side }));
      /* 손: 손바닥 + 손가락 4 + 엄지 */
      var hb2 = K.builder();
      hb2.rbox(0.078, 0.095, 0.032, 0.014, m.skin, { p: [0, -0.06, 0], segs: 2 });
      hb2.sphere(0.02, m.skin, { p: [0, -0.005, 0], s: [1.6, 0.9, 1], ws: 12, hs: 8 });
      [[-0.028, 0.072], [-0.009, 0.08], [0.01, 0.077], [0.028, 0.066]].forEach(function (f) {
        hb2.limb(0.0088, 0.0078, f[1], m.skin, { p: [f[0], -0.105 - f[1] / 2 + 0.006, 0.002], r: [0.28, 0, 0], seg: 8 });
        hb2.limb(0.0078, 0.0068, f[1] * 0.6, m.skin, { p: [f[0], -0.105 - f[1] * 0.98, 0.022], r: [0.9, 0, 0], seg: 8 });
      });
      hb2.limb(0.0105, 0.009, 0.06, m.skin, { p: [s * -0.042, -0.05, 0.016], r: [0.3, 0, s * -0.7], seg: 8 });
      var hand = hb2.build({ name: "hand" + side }); handG[side] = hand; add(wr[side], hand);
    }
    buildArm("L"); buildArm("R");

    /* ── 다리와 구두 ── */
    function buildLeg(side) {
      var tb2 = K.builder(); tb2.sphere(0.086, m.suit, { ws: 20, hs: 14 }); tb2.limb(0.087, 0.063, 0.44, m.suit, { p: [0, -0.22, 0], seg: 20 });
      add(hip[side], tb2.build({ name: "thigh" + side }));
      var sb = K.builder(); sb.sphere(0.063, m.suit, { ws: 18, hs: 12 }); sb.limb(0.063, 0.048, 0.44, m.suit, { p: [0, -0.22, 0], seg: 18 });
      sb.cyl(0.05, 0.052, 0.03, m.suit, { p: [0, -0.425, 0.0], seg: 16 });
      add(kn[side], sb.build({ name: "shin" + side }));
      var fb2 = K.builder();
      fb2.lathe([[0.0, 0], [0.043, 0.0], [0.05, 0.02], [0.046, 0.05], [0.038, 0.075], [0.0, 0.08]], m.shoe, { p: [0, -0.06, -0.02], r: [0, 0, 0], seg: 18, s: [1.0, 1, 1.0] });
      fb2.rbox(0.088, 0.055, 0.2, 0.024, m.shoe, { p: [0, -0.045, 0.075], segs: 3 });
      fb2.sphere(0.046, m.shoe, { p: [0, -0.052, 0.155], s: [1, 0.72, 1.05], ws: 18, hs: 12 });
      fb2.rbox(0.092, 0.014, 0.245, 0.006, K.mat("person.sole", function () { return K.std(0x0a0908, 0.6, 0); }), { p: [0, -0.076, 0.085] });
      add(an[side], fb2.build({ name: "shoe" + side }));
    }
    buildLeg("L"); buildLeg("R");

    /* ── 자세 ── */
    var POSE = {
      sit: {
        hipsY: 0.553, hipsZ: -0.1, hipsRX: 0, spine: 0.03, chest: 0, neck: 0.02, head: 0,
        hipL: -1.5708, hipR: -1.5708, hipZ: 0.05, kneeL: 1.5708, kneeR: 1.5708, ankleL: 0, ankleR: 0,
        shL: -0.55, shR: -0.55, shZL: 0.1, shZR: -0.1, elL: -0.8, elR: -0.8, wrL: 0.15, wrR: 0.15, rollL: PI, rollR: PI, shYL: 0, shYR: 0
      },
      stand: {
        hipsY: 0.993, hipsZ: 0.0, hipsRX: 0, spine: 0.0, chest: 0, neck: 0, head: 0,
        hipL: 0, hipR: 0, hipZ: 0.03, kneeL: 0, kneeR: 0, ankleL: 0, ankleR: 0,
        shL: -0.05, shR: -0.05, shZL: 0.07, shZR: -0.07, elL: -0.3, elR: -0.3, wrL: 0, wrR: 0, rollL: PI / 2, rollR: -PI / 2, shYL: 0, shYR: 0
      }
    };
    var cur = {}; Object.keys(POSE.sit).forEach(function (k) { cur[k] = POSE.sit[k]; });
    function apply(p) {
      hips.position.y = p.hipsY; hips.position.z = p.hipsZ; hips.rotation.x = p.hipsRX;
      spine.rotation.x = p.spine; chest.rotation.x = p.chest; neck.rotation.x = p.neck; head.rotation.x = p.head;
      hip.L.rotation.x = p.hipL; hip.R.rotation.x = p.hipR; hip.L.rotation.z = p.hipZ; hip.R.rotation.z = -p.hipZ;
      kn.L.rotation.x = p.kneeL; kn.R.rotation.x = p.kneeR;
      an.L.rotation.x = p.ankleL; an.R.rotation.x = p.ankleR;
      sh.L.rotation.x = p.shL; sh.R.rotation.x = p.shR; sh.L.rotation.z = p.shZL; sh.R.rotation.z = p.shZR; sh.L.rotation.y = p.shYL; sh.R.rotation.y = p.shYR;
      el.L.rotation.x = p.elL; el.R.rotation.x = p.elR; wr.L.rotation.x = p.wrL; wr.R.rotation.x = p.wrR;
      handG.L.rotation.y = p.rollL; handG.R.rotation.y = p.rollR;
    }
    function blend(a, b, k) { var o = {}; Object.keys(a).forEach(function (n) { o[n] = a[n] + (b[n] - a[n]) * k; }); return o; }
    apply(cur);

    /* ── 상태: sit | stand | rising | walking ── */
    var st = { mode: opts.stand ? "stand" : "sit", t: 0, blink: 2.5, blinkT: -1, look: new T.Vector3(), lookYaw: 0, lookPitch: 0, breath: 0, walkPhase: 0, seq: null, moveA: null, moveB: null, faceA: 0, faceB: 0 };
    if (opts.stand) { Object.keys(POSE.stand).forEach(function (k) { cur[k] = POSE.stand[k]; }); apply(cur); }

    /* 일어나 (dx,dz)로 이동한 뒤 정면(플레이어)을 본다. done 은 도착 시 호출 */
    root.userData.standAndMove = function (to, faceYaw, done) {
      var from = root.position.clone(), yaw0 = root.rotation.y;
      var dist = Math.hypot(to.x - from.x, to.z - from.z), walkDur = Math.max(0.8, dist / 0.85);
      var TOT = 1.55 + walkDur + 0.6, headingYaw = Math.atan2(to.x - from.x, to.z - from.z);
      st.mode = "moving";
      var stepPh = 0;
      K.anim.tween({ dur: TOT, ease: K.anim.ease.linear, update: function (k) {
        var t = k * TOT, p;
        if (t < 1.55) {                              /* 일어서기: 몸을 숙이며 → 골반을 밀어 올림 */
          var a = t / 1.55, lean = sm(a / 0.35) * (1 - sm((a - 0.6) / 0.4)), up = sm((a - 0.28) / 0.72);
          p = blend(POSE.sit, POSE.stand, up);
          p.spine = POSE.sit.spine + lean * 0.42; p.chest = lean * 0.1; p.hipsZ = K.lerp(POSE.sit.hipsZ, 0.12, up) + lean * 0.05; p.head = -lean * 0.35;
          p.shL = -0.55 - lean * 0.25; p.shR = -0.55 - lean * 0.25;
          p.hipL = K.lerp(POSE.sit.hipL, POSE.stand.hipL, up) - lean * 0.15; p.hipR = p.hipL;
          root.rotation.y = yaw0 + (headingYaw - yaw0) * sm((a - 0.75) / 0.25);
        } else if (t < 1.55 + walkDur) {             /* 걷기 */
          var w = (t - 1.55) / walkDur, ease = sm(w * 1.3) * (1 - 0.0);
          root.position.set(K.lerp(from.x, to.x, w), root.position.y, K.lerp(from.z, to.z, w));
          stepPh += 0.09; var sw = Math.sin(stepPh * 5.2), amp = 0.5 * Math.min(1, w * 6) * Math.min(1, (1 - w) * 6);
          p = blend(POSE.stand, POSE.stand, 0); p.hipL = sw * amp; p.hipR = -sw * amp; p.kneeL = Math.max(0, -sw) * amp * 1.2; p.kneeR = Math.max(0, sw) * amp * 1.2;
          p.shL = -0.05 - sw * amp * 0.5; p.shR = -0.05 + sw * amp * 0.5; p.hipsY = 0.993 - 0.012 * Math.abs(Math.cos(stepPh * 5.2)) * amp * 2; p.ankleL = -p.hipL * 0.3; p.ankleR = -p.hipR * 0.3;
          root.rotation.y = headingYaw;
        } else {                                     /* 멈추고 몸을 돌려 손을 모은다 */
          var f = (t - 1.55 - walkDur) / 0.6, q = sm(f);
          p = blend(POSE.stand, POSE.stand, 0); p.elL = K.lerp(-0.3, -1.05, q); p.elR = p.elL; p.shL = K.lerp(-0.05, -0.32, q); p.shR = p.shL; p.wrL = 0.2 * q; p.wrR = 0.2 * q; p.shYL = 0.55 * q; p.shYR = -0.55 * q; p.rollL = K.lerp(PI / 2, 1.2, q); p.rollR = -p.rollL;
          root.rotation.y = K.lerp(headingYaw, faceYaw, q);
        }
        Object.keys(p).forEach(function (n) { cur[n] = p[n]; }); apply(cur);
      }, done: function () { root.position.copy(to); root.rotation.y = faceYaw; st.mode = "stand"; Object.keys(POSE.stand).forEach(function (n) { cur[n] = POSE.stand[n]; }); cur.elL = -1.05; cur.elR = -1.05; cur.shL = -0.32; cur.shR = -0.32; cur.wrL = 0.2; cur.wrR = 0.2; cur.rollL = 1.2; cur.rollR = -1.2; cur.shYL = 0.55; cur.shYR = -0.55; apply(cur); if (done) done(); } });
    };
    root.userData.setStanding = function (pos, yaw) { root.position.copy(pos); root.rotation.y = yaw; st.mode = "stand"; Object.keys(POSE.stand).forEach(function (n) { cur[n] = POSE.stand[n]; }); cur.elL = -1.05; cur.elR = -1.05; cur.shL = -0.32; cur.shR = -0.32; cur.wrL = 0.2; cur.wrR = 0.2; cur.rollL = 1.2; cur.rollR = -1.2; cur.shYL = 0.55; cur.shYR = -0.55; apply(cur); };
    root.userData.setSeated = function (pos, yaw) { root.position.copy(pos); root.rotation.y = yaw; st.mode = "sit"; Object.keys(POSE.sit).forEach(function (n) { cur[n] = POSE.sit[n]; }); apply(cur); };

    /* 매 프레임: 숨쉬기·깜빡임·시선. camPos 는 월드 좌표의 플레이어 눈 */
    var _v = new T.Vector3(), _q = new T.Quaternion();
    root.userData.update = function (dt, t, camPos) {
      st.t = t;
      /* 숨쉬기 */
      var br = Math.sin(t * 1.55) * 0.5 + 0.5;
      spine.scale.set(1 + br * 0.006, 1 + br * 0.008, 1 + br * 0.018);
      if (st.mode === "sit" || st.mode === "stand") {
        var sway = Math.sin(t * 0.5) * 0.008;
        spine.rotation.x = cur.spine + sway * 0.6; chest.rotation.x = cur.chest + br * 0.012;
        sh.L.rotation.x = cur.shL - br * 0.01; sh.R.rotation.x = cur.shR - br * 0.01;
      }
      /* 깜빡임 */
      st.blink -= dt;
      if (st.blink <= 0 && st.blinkT < 0) { st.blinkT = 0; st.blink = 2.2 + Math.random() * 3.6; }
      var lidK = 0;
      if (st.blinkT >= 0) { st.blinkT += dt; var bk = st.blinkT / 0.16; lidK = bk < 0.5 ? bk * 2 : Math.max(0, 2 - bk * 2); if (bk >= 1) st.blinkT = -1; }
      eyes.forEach(function (e) { e.lid.rotation.x = K.lerp(-0.26, 1.25, sm(lidK)); });
      /* 시선: 몸의 정면 기준 yaw/pitch 를 제한해 머리·목이 따라간다 */
      if (camPos) {
        head.getWorldPosition(_v); root.getWorldQuaternion(_q);
        var dx = camPos.x - _v.x, dy = camPos.y - _v.y, dz = camPos.z - _v.z;
        var wy = Math.atan2(dx, dz), ry = new T.Euler().setFromQuaternion(_q, "YXZ").y;
        var yaw = ((wy - ry + PI * 3) % (PI * 2)) - PI, pitch = Math.atan2(dy, Math.hypot(dx, dz));
        var dist = Math.hypot(dx, dz), engage = dist < 6.5 ? 1 : 0;
        var ty = K.clamp(yaw, -0.95, 0.95) * engage, tp = K.clamp(-pitch, -0.35, 0.35) * engage;
        st.lookYaw += (ty - st.lookYaw) * K.damp(3.2, dt); st.lookPitch += (tp - st.lookPitch) * K.damp(3.2, dt);
        neck.rotation.y = st.lookYaw * 0.4; head.rotation.y = st.lookYaw * 0.6; head.rotation.x = cur.head + st.lookPitch * 0.7; neck.rotation.x = cur.neck + st.lookPitch * 0.3;
        var eyeYaw = K.clamp(yaw - st.lookYaw, -0.25, 0.25) * engage;
        eyes.forEach(function (e) { e.iris.position.x = eyeYaw * 0.0108; e.pup.position.x = eyeYaw * 0.0108; });
      }
    };
    root.userData.joints = J; root.userData.mode = function () { return st.mode; };
    root.userData.size = [0.5, 1.32, 0.6];
    return root;
  };
})(window);
