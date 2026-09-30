/* N1P — 벽 소품 A: 칠판, 벽시계, 과학자 액자(퍼즐), 인쇄물, 소화기 */
(function (root) {
  "use strict";
  var T = root.THREE, K = root.N1K, G = K.geo, X = K.tex, P = root.N1P, PI = Math.PI, M = P.M;

  /* 분필 글씨: 투명 레이어에 쓰고 지우개 가루로 성글게 깎은 뒤 칠판 위에 얹는다 */
  function chalkLayer(w, h, lines, seed) {
    var c = document.createElement("canvas"); c.width = w; c.height = h;
    var g = c.getContext("2d"), rr = K.rng(seed || 3);
    g.textBaseline = "alphabetic";
    lines.forEach(function (ln) {
      g.font = ln.font; g.fillStyle = ln.color || "#f4f7f0";
      g.globalAlpha = 0.16; g.fillText(ln.t, ln.x + 1.2, ln.y + 1.2);
      g.globalAlpha = 0.92; g.fillText(ln.t, ln.x, ln.y);
    });
    g.globalAlpha = 1; g.globalCompositeOperation = "destination-out";
    for (var i = 0; i < w * h / 500; i++) { g.fillStyle = "rgba(0,0,0," + rr.range(0.15, 0.6) + ")"; g.fillRect(rr.next() * w, rr.next() * h, rr.range(1, 2.6), rr.range(1, 2.2)); }
    return c;
  }

  /* ── 칠판: 알루미늄 틀 5.36×1.52, 분필받이, 지우개·분필갑·분필 ──────────────── */
  P.chalkboard = function () {
    var b = K.builder(), W = 5.36, H = 1.52, al = K.mat("board.alum", function () { return K.std(0xb4babe, 0.34, 0.85, { env: 1.2 }); });
    var SW = 2048, SH = 580;
    var res = X.chalkboard({ w: SW, h: SH, seed: 31 });
    var layer = chalkLayer(SW, SH, [
      { t: "이 교실을 그대로 두어라.", x: 150, y: 190, font: "600 92px 'Batang','Gowun Batang','Noto Serif KR',serif" },
      { t: "내가 누구였는지 알아내는 사람에게", x: 150, y: 290, font: "500 62px 'Batang','Gowun Batang','Noto Serif KR',serif", color: "#eef2ea" },
      { t: "내 이름으로 만든 장학금 전부를 주겠다.", x: 150, y: 372, font: "500 62px 'Batang','Gowun Batang','Noto Serif KR',serif", color: "#eef2ea" }
    ], 5);
    res.canvas.getContext("2d").drawImage(layer, 0, 0);
    res.map.needsUpdate = true;
    var slate = K.mat("board.slate", function () { return K.std(0xffffff, 0.88, 0.02, { map: res.map, bump: res.bump, bumpScale: 0.0006 }); });
    b.box(W - 0.12, H - 0.12, 0.012, slate, { p: [0, 0, 0.006] });
    [1, -1].forEach(function (s) {
      b.rbox(W, 0.06, 0.05, 0.012, al, { p: [0, s * (H / 2 - 0.03), 0.025] });
      b.rbox(0.06, H - 0.12, 0.05, 0.012, al, { p: [s * (W / 2 - 0.03), 0, 0.025] });
    });
    /* 분필받이 */
    b.rbox(W, 0.026, 0.13, 0.008, al, { p: [0, -H / 2 - 0.013, 0.085] });
    b.rbox(W, 0.038, 0.014, 0.005, al, { p: [0, -H / 2 + 0.007, 0.146] });
    b.rbox(W, 0.05, 0.02, 0.006, al, { p: [0, -H / 2 - 0.005, 0.03] });
    [-2.2, 0, 2.2].forEach(function (x) { b.rbox(0.05, 0.04, 0.05, 0.006, M.steelDark(), { p: [x, -H / 2 - 0.045, 0.05] }); });
    /* 흩어진 분필 */
    [[-0.42, 0xfcfcfa, 0.1], [-0.32, 0xf3e468, -0.25], [-0.24, 0xfcfcfa, 0.05], [0.55, 0xec86a4, 0.3], [0.64, 0xfcfcfa, -0.12], [1.5, 0xfcfcfa, 0.2]].forEach(function (c) {
      var m = K.mat("chalk." + c[1].toString(16), function () { return K.std(c[1], 0.98, 0); });
      b.cyl(0.0065, 0.0065, c[0] > 1 ? 0.03 : 0.07, m, { p: [c[0], -H / 2 + 0.006, 0.09], r: [0, c[2], PI / 2], seg: 8 });
    });
    var g = b.build({ name: "chalkboard" });
    g.userData.size = [W, H, 0.08]; g.userData.tray = { y: -H / 2 + 0.0, z: 0.09 };
    /* 지우개와 분필갑은 상호작용 대상이라 따로 만든다 */
    var eb = K.builder();
    eb.rbox(0.18, 0.03, 0.07, 0.008, P.wood("eraser", 0xb8905e, 0.6, "fine"), { p: [0, 0.03, 0] });
    eb.rbox(0.18, 0.016, 0.07, 0.004, K.mat("eraser.sponge", function () { return K.std(0xdfc744, 0.95, 0); }), { p: [0, 0.008, 0] });
    eb.rbox(0.18, 0.012, 0.07, 0.004, K.mat("eraser.felt", function () { return K.std(0x2a2e2d, 1, 0); }), { p: [0, -0.005, 0] });
    var eraser = eb.build({ name: "eraser" }); eraser.position.set(-0.95, -H / 2 + 0.027, 0.09); eraser.rotation.y = 0.22; g.add(eraser);
    var cb = K.builder();
    cb.rbox(0.11, 0.042, 0.07, 0.004, K.mat("chalkbox", function () { return K.std(0x2d66a0, 0.7, 0, { env: 0.6 }); }), { p: [0, 0, 0] });
    cb.rbox(0.09, 0.006, 0.05, 0.002, K.mat("chalkbox.lbl", function () { return K.std(0xf1efe6, 0.8, 0); }), { p: [0, 0.022, 0] });
    for (var i = 0; i < 5; i++) cb.cyl(0.005, 0.005, 0.085, K.mat("chalk.w", function () { return K.std(0xfcfcfa, 0.98, 0); }), { p: [0, 0.026, -0.018 + i * 0.009], r: [0, 0, PI / 2], seg: 7 });
    var box = cb.build({ name: "chalkBox" }); box.position.set(0.82, -H / 2 + 0.032, 0.09); box.rotation.y = -0.16; g.add(box);
    g.userData.eraser = eraser; g.userData.chalkBox = box;
    return g;
  };

  /* ── 벽시계: 지름 0.40. 10시 10분, 초침은 째깍 ─────────────────────────── */
  P.wallClock = function () {
    var b = K.builder(), R = 0.2;
    var dark = K.mat("clock.case", function () { return K.std(0x24272b, 0.38, 0.75, { env: 1.1 }); });
    var brass = M.brass();
    b.lathe([[R + 0.022, 0], [R + 0.026, 0.01], [R + 0.024, 0.036], [R + 0.012, 0.046], [R - 0.006, 0.042], [R - 0.008, 0.03], [R - 0.004, 0.012]], dark, { r: [PI / 2, 0, 0], seg: 48 });
    b.cyl(R - 0.002, R - 0.002, 0.006, K.mat("clock.back", function () { return K.std(0x1a1c1f, 0.6, 0.3); }), { p: [0, 0, 0.006], r: [PI / 2, 0, 0], seg: 48 });
    b.torus(R - 0.004, 0.0035, brass, { p: [0, 0, 0.04], ts: 48 });
    var dial = P.canvas(768, 768, function (g, w, h) {
      var c = w / 2, gr = g.createRadialGradient(c, c, 0, c, c, c); gr.addColorStop(0, "#f6f1e4"); gr.addColorStop(1, "#e7dfcc");
      g.fillStyle = gr; g.fillRect(0, 0, w, h);
      g.strokeStyle = "#1c1a17"; g.fillStyle = "#1c1a17"; g.textAlign = "center"; g.textBaseline = "middle";
      for (var i = 0; i < 60; i++) { var a = i * PI / 30, big = i % 5 === 0, r0 = c * (big ? 0.84 : 0.9), r1 = c * 0.95; g.lineWidth = big ? 7 : 3; g.beginPath(); g.moveTo(c + Math.sin(a) * r0, c - Math.cos(a) * r0); g.lineTo(c + Math.sin(a) * r1, c - Math.cos(a) * r1); g.stroke(); }
      g.font = "700 86px 'Times New Roman','Noto Serif KR',serif";
      for (var n = 1; n <= 12; n++) { var an = n * PI / 6; g.fillText(String(n), c + Math.sin(an) * c * 0.68, c - Math.cos(an) * c * 0.68 + 4); }
      g.font = "600 30px sans-serif"; g.fillStyle = "#3a352d"; g.fillText("QUARTZ", c, c * 0.5);
    });
    var dialMat = P.canvasMat(dial, { rough: 0.55 });
    var dg = new T.CircleGeometry(R - 0.008, 64);
    var dm = new T.Mesh(dg, dialMat); dm.position.z = 0.0125; dm.receiveShadow = true;
    var glass = new T.Mesh(new T.SphereGeometry(R + 0.06, 40, 12, 0, PI * 2, 0, 0.36), K.std(0xffffff, 0.04, 0, { opacity: 0.1, env: 1.3 }));
    glass.material.depthWrite = false; glass.position.z = 0.03 - (R + 0.06) * (1 - Math.cos(0.36)) + 0.0; glass.rotation.x = PI / 2; glass.position.set(0, 0, 0.04 - 0.0);
    var g = b.build({ name: "wallClock" });
    g.add(dm); g.add(glass);
    function hand(len, w, z, color, tail) {
      var s = new T.Shape(); s.moveTo(-w / 2, -tail); s.lineTo(w / 2, -tail); s.lineTo(w * 0.35, len * 0.85); s.lineTo(0, len); s.lineTo(-w * 0.35, len * 0.85); s.lineTo(-w / 2, -tail);
      var m = new T.Mesh(new T.ExtrudeGeometry(s, { depth: 0.002, bevelEnabled: false }), K.std(color, 0.4, 0.3, { env: 1 }));
      m.position.z = z; m.castShadow = true; return m;
    }
    var hp = new T.Group(), mp = new T.Group(), sp = new T.Group();
    hp.add(hand(R * 0.5, 0.017, 0.0, 0x151515, 0.03)); mp.add(hand(R * 0.75, 0.011, 0.0035, 0x151515, 0.035)); sp.add(hand(R * 0.83, 0.004, 0.007, 0xb3261e, 0.055));
    hp.position.z = 0.0155; mp.position.z = 0.0155; sp.position.z = 0.0155;
    hp.rotation.z = PI * 0.35; mp.rotation.z = -PI * 0.34;
    g.add(hp); g.add(mp); g.add(sp);
    var cap = new T.Mesh(new T.CylinderGeometry(0.011, 0.011, 0.016, 16), brass); cap.rotation.x = PI / 2; cap.position.z = 0.0245; g.add(cap);
    g.userData.sec = sp; g.userData.radius = R + 0.026;
    /* 초침: 1초에 한 번 튕기듯 이동(quartz tick) */
    g.userData.update = function (t) {
      var s = Math.floor(t), f = t - s, k = f < 0.12 ? (1 - Math.pow(1 - f / 0.12, 3)) * 1.06 - 0.06 * (f / 0.12) : 1;
      sp.rotation.z = -((s + Math.min(1, k)) * PI / 30);
    };
    return g;
  };

  /* ── 과학자 액자 (퍼즐): 네 변의 굵기(굵음=1/가늘음=0)가 신호, 액자 전체가 90°씩 돈다 ── */
  var PW = 0.52, PH = 0.62, TK = 0.070, TN = 0.007;
  P.sciFrame = function (portraitTex) {
    var g = new T.Group(), spin = new T.Group(); g.add(spin);
    var wood = P.wood("sciframe", 0xa9773f, 0.48, "coarse", 0.0012);
    var por = new T.Mesh(new T.PlaneGeometry(0.50, 0.60), K.std(0xffffff, 0.85, 0, { map: portraitTex }));
    por.position.z = 0.012; por.renderOrder = 7; spin.add(por);
    /* 사진 뒷판과 유리 반사 */
    var back = new T.Mesh(new T.PlaneGeometry(0.62, 0.72), K.mat("frame.back", function () { return K.std(0x181410, 1, 0); }));
    back.position.z = 0.004; spin.add(back);
    var glass = new T.Mesh(new T.PlaneGeometry(0.5, 0.6), K.std(0xffffff, 0.05, 0, { opacity: 0.07, env: 1.2 }));
    glass.material.depthWrite = false; glass.position.z = 0.02; spin.add(glass);
    var bars = new T.Group(); spin.add(bars);
    g.userData.spin = spin; g.userData.bars = bars; g.userData.tz = 0;
    g.userData.setSignature = function (sig) {
      while (bars.children.length) { var o = bars.children.pop(); if (o.geometry) o.geometry.dispose(); }
      var tt = sig[0] ? TK : TN, tr = sig[1] ? TK : TN, tb = sig[2] ? TK : TN, tl = sig[3] ? TK : TN, bb = K.builder();
      function bar(w, h, x, y, thick) {
        var depth = thick ? 0.042 : 0.030, z = thick ? 0.024 : 0.018;
        bb.rbox(w, h, depth, Math.min(0.006, w * 0.4, h * 0.4), wood, { p: [x, y, z], uv: 1.6, segs: 1 });
        if (thick) bb.rbox(w - 0.014, h - 0.014, 0.004, 0.002, wood, { p: [x, y, z + depth / 2 + 0.001], uv: 1.6, segs: 1, tint: 0xd4b088 });
      }
      bar(PW + tl + tr, tt, (tr - tl) / 2, PH / 2 + tt / 2, sig[0]);
      bar(tr, PH, PW / 2 + tr / 2, 0, sig[1]);
      bar(PW + tl + tr, tb, (tr - tl) / 2, -PH / 2 - tb / 2, sig[2]);
      bar(tl, PH, -PW / 2 - tl / 2, 0, sig[3]);
      bars.add(bb.build({ name: "frameBars" }));
    };
    g.userData.setSignature([1, 1, 1, 1]);
    /* 2장 표식 카드: 붙이면 액자 왼쪽 아래에 스티커가 생긴다(액자와 함께 돈다). svg 는 표식 그림 문자열, null 이면 뗀다 */
    var sticker = null;
    g.userData.setSticker = function (svg) {
      if (sticker) { spin.remove(sticker); if (sticker.material.map) sticker.material.map.dispose(); sticker.material.dispose(); sticker.geometry.dispose(); sticker = null; }
      if (!svg) return null;
      var cv = document.createElement("canvas"); cv.width = cv.height = 128; var cx = cv.getContext("2d");
      var tex = new T.CanvasTexture(cv); tex.encoding = T.sRGBEncoding; tex.anisotropy = 4;
      function paint(img) {
        cx.clearRect(0, 0, 128, 128); cx.fillStyle = "#fbfaf3"; cx.fillRect(0, 0, 128, 128); cx.strokeStyle = "#1b2640"; cx.lineWidth = 7; cx.strokeRect(4, 4, 120, 120);
        if (img) cx.drawImage(img, 24, 24, 80, 80); tex.needsUpdate = true;
      }
      paint(null);
      var img = new Image(); img.onload = function () { paint(img); };
      img.src = "data:image/svg+xml;charset=utf-8," + encodeURIComponent(svg.replace("<svg ", '<svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" '));
      sticker = new T.Mesh(new T.PlaneGeometry(0.11, 0.11), K.std(0xffffff, 0.8, 0, { map: tex }));
      sticker.position.set(-0.17, -0.245, 0.034); sticker.rotation.z = -0.14; sticker.renderOrder = 8; spin.add(sticker);
      return sticker;
    };
    return g;
  };

  /* ── 인쇄물(과학자 소개): 종이 + 압정. 글줄바꿈은 원본 규칙 그대로 ───────── */
  P.notePaper = function (sc) {
    var S = 2, cw = 560 * S, ch = 460 * S;
    var canvas = P.canvas(cw, ch, function (g, w, h) {
      g.fillStyle = "#f2ecdb"; g.fillRect(0, 0, w, h);
      g.fillStyle = "#d9cfb4"; g.fillRect(0, 0, w, 6 * S);
      g.fillStyle = "#2b2419"; g.textAlign = "center"; g.textBaseline = "top";
      g.font = "700 " + 38 * S + "px 'Noto Sans KR','Malgun Gothic','Apple SD Gothic Neo',sans-serif"; g.fillText(sc.name, w / 2, 20 * S);
      g.font = "500 " + 24 * S + "px Arial,sans-serif"; g.fillStyle = "#7a6c55"; g.fillText(sc.born + " ~ " + sc.died, w / 2, 70 * S);
      g.fillStyle = "#a03528"; g.font = "700 " + 24 * S + "px 'Noto Sans KR','Malgun Gothic',sans-serif"; g.fillText(sc.key, w / 2, 110 * S);
      g.textAlign = "left"; g.fillStyle = "#3a332a"; g.font = "400 " + 22 * S + "px 'Noto Sans KR','Malgun Gothic',sans-serif";
      var words = sc.body.split(" "), line = "", y = 155 * S, max = w - 52 * S;
      for (var wi = 0; wi < words.length; wi++) {
        var t = line + words[wi] + " ";
        if (g.measureText(t).width > max) { g.fillText(line, 26 * S, y); line = words[wi] + " "; y += 28 * S; if (y > h - 32 * S) { g.fillText(line + "…", 26 * S, y); line = ""; break; } } else line = t;
      }
      if (line) g.fillText(line, 26 * S, y);
    });
    var t = new T.CanvasTexture(canvas); t.encoding = T.sRGBEncoding; t.anisotropy = 8; t.generateMipmaps = true; t.minFilter = T.LinearMipmapLinearFilter;
    var paper = new T.Mesh(G.plate(0.56, 0.46, 0.004, 0.0012, { edge: 0.0004, uv: 1, rings: 3, edgeSegs: 1, cornerSegs: 2,
      bend: function (v) { v.y += 0.0016 * Math.pow(v.x / 0.28, 4) + 0.0012 * Math.pow(v.z / 0.23, 4); } }), K.std(0xffffff, 0.85, 0, { map: t }));
    /* 평면 UV 를 0..1 로 (판의 uv 는 미터 단위) */
    var uv = paper.geometry.attributes.uv, pos = paper.geometry.attributes.position;
    for (var i = 0; i < uv.count; i++) uv.setXY(i, pos.getX(i) / 0.56 + 0.5, 0.5 - pos.getZ(i) / 0.46);
    paper.rotation.x = PI / 2; paper.castShadow = true; paper.receiveShadow = true;
    var g = new T.Group(); g.add(paper);
    var pb = K.builder();
    [-0.25, 0.25].forEach(function (x) {
      pb.sphere(0.0075, K.mat("pin.red", function () { return K.std(0xc0372b, 0.35, 0.2, { env: 1 }); }), { p: [x, 0.2, 0.008], ws: 12, hs: 8 });
      pb.cyl(0.0035, 0.0035, 0.006, M.steelLight(), { p: [x, 0.2, 0.003], r: [PI / 2, 0, 0], seg: 8 });
    });
    g.add(pb.build({ name: "pins" }));
    return g;
  };

  /* ── 소화기: 도장 광택 몸통·황동 밸브·압력계·호스·벽 브래킷 ─────────────── */
  P.extinguisher = function () {
    var b = K.builder(), red = K.mat("ext.red", function () { return K.std(0xb51f14, 0.28, 0.35, { env: 1.2 }); });
    var br = M.brass(), blk = K.mat("ext.black", function () { return K.std(0x151516, 0.55, 0.3); });
    var prof = [[0.0, 0.0], [0.05, 0.0], [0.072, 0.012], [0.078, 0.05], [0.078, 0.36], [0.07, 0.4], [0.05, 0.43], [0.028, 0.445], [0.026, 0.46]];
    b.lathe(prof, red, { seg: 36 });
    b.cyl(0.03, 0.03, 0.03, br, { p: [0, 0.475, 0], seg: 16 });
    b.rbox(0.05, 0.05, 0.07, 0.01, br, { p: [0, 0.505, 0.02] });
    b.cyl(0.011, 0.011, 0.06, br, { p: [0.05, 0.505, 0.035], r: [0, 0, PI / 2], seg: 12 });
    /* 안전핀 손잡이 */
    var lever = new T.Shape(); lever.moveTo(0, 0); lever.lineTo(0.13, 0.012); lever.lineTo(0.13, 0.03); lever.lineTo(0, 0.02); lever.lineTo(0, 0);
    b.add(G.extrude(lever, 0.024, { size: 0.003, thick: 0.003, segs: 1 }), blk, { p: [-0.07, 0.53, 0.0] });
    b.add(G.extrude(lever, 0.024, { size: 0.003, thick: 0.003, segs: 1 }), blk, { p: [-0.02, 0.51, 0.0], r: [0, 0, -0.55] });
    b.torus(0.014, 0.0018, M.steelLight(), { p: [0.02, 0.545, 0.035], r: [0, PI / 2, 0], ts: 14 });
    /* 압력계 */
    b.cyl(0.02, 0.02, 0.014, br, { p: [0, 0.505, 0.062], r: [PI / 2, 0, 0], seg: 20 });
    var gauge = P.canvas(128, 128, function (g, w, h) {
      g.fillStyle = "#f4f1e6"; g.fillRect(0, 0, w, h); g.fillStyle = "#3b9a4b"; g.beginPath(); g.moveTo(64, 64); g.arc(64, 64, 52, -0.5 * PI - 0.4, -0.5 * PI + 0.7); g.fill();
      g.strokeStyle = "#1a1a1a"; g.lineWidth = 5; g.beginPath(); g.moveTo(64, 64); g.lineTo(64 + 34 * Math.cos(-1.2), 64 + 34 * Math.sin(-1.2)); g.stroke();
    });
    var gm = new T.Mesh(new T.CircleGeometry(0.0175, 24), P.canvasMat(gauge, { rough: 0.4 })); gm.position.set(0, 0.505, 0.0698);
    /* 호스 */
    var hp = G.pipePath([[0.05, 0.5, 0.0], [0.11, 0.49, 0.03], [0.14, 0.37, 0.07], [0.13, 0.27, 0.085], [0.09, 0.2, 0.09]], 0.04, 0.02);
    b.add(new T.TubeGeometry(new T.CatmullRomCurve3(hp, false, "centripetal"), 36, 0.0085, 8, false), blk);
    b.cyl(0.013, 0.01, 0.06, blk, { p: [0.085, 0.175, 0.09], r: [0.0, 0, 0.4], seg: 10 });
    var g = b.build({ name: "extinguisher" });
    /* 라벨: 몸통 앞을 감싸는 곡면 띠 */
    var label = P.canvas(384, 256, function (g2, w, h) {
      g2.fillStyle = "#f7f4ea"; g2.fillRect(0, 0, w, h); g2.strokeStyle = "#b51f14"; g2.lineWidth = 5; g2.strokeRect(8, 8, w - 16, h - 16);
      g2.fillStyle = "#b51f14"; g2.textAlign = "center"; g2.textBaseline = "middle";
      g2.font = "900 54px 'Noto Sans KR','Malgun Gothic',sans-serif"; g2.fillText("소 화 기", w / 2, 60);
      g2.font = "700 24px sans-serif"; g2.fillText("FIRE EXTINGUISHER", w / 2, 108);
      [["A", "#1a4c8a", -74], ["B", "#b51f14", 0], ["C", "#1c7c42", 74]].forEach(function (c) { g2.fillStyle = c[1]; g2.beginPath(); g2.arc(w / 2 + c[2], 172, 30, 0, 7); g2.fill(); g2.fillStyle = "#fff"; g2.font = "900 32px sans-serif"; g2.fillText(c[0], w / 2 + c[2], 174); });
    });
    var lab = new T.Mesh(new T.CylinderGeometry(0.0795, 0.0795, 0.2, 32, 1, true, -0.62, 1.24), P.canvasMat(label, { rough: 0.5 }));
    lab.position.y = 0.2; lab.rotation.y = 0; g.add(lab); g.add(gm);
    /* 벽 브래킷 (뒤쪽 -z 가 벽) */
    var bb = K.builder();
    bb.rbox(0.05, 0.03, 0.05, 0.006, M.steelDark(), { p: [0, 0.3, -0.09] });
    bb.rbox(0.18, 0.03, 0.006, 0.004, M.steelDark(), { p: [0, 0.3, -0.115] });
    bb.rbox(0.032, 0.03, 0.17, 0.004, M.steelDark(), { p: [0, 0.3, -0.03], r: [0, 0, 0] });
    g.add(bb.build({ name: "extBracket" }));
    g.userData.size = [0.18, 0.56, 0.2];
    return g;
  };
})(window);
