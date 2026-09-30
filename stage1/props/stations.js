/* N1P — 퍼즐 자리 소품: AV 카트(TV+VCR+테이프), 명단 클립보드, 노, 페넌트
   3장(스포츠 코너)과 4장(되감기 테이프)의 무대. 정답을 알려 주는 글자는 넣지 않는다. */
(function (root) {
  "use strict";
  var T = root.THREE, K = root.N1K, G = K.geo, P = root.N1P, PI = Math.PI;

  /* 노이즈 화면: 작은 캔버스를 조금씩 다시 그린다 */
  function noiseScreen(w, h) {
    var cv = document.createElement("canvas"); cv.width = w; cv.height = h; var x = cv.getContext("2d"), img = x.createImageData(w, h);
    var tex = new T.CanvasTexture(cv); tex.encoding = T.sRGBEncoding; tex.minFilter = tex.magFilter = T.LinearFilter; tex.generateMipmaps = false;
    var seed = 1, roll = 0;
    function rnd() { seed = (seed * 1664525 + 1013904223) >>> 0; return seed / 4294967296; }
    function draw(t, lit) {
      var d = img.data, i, y, xx, rb = ((t * 0.35) % 1) * h;
      for (y = 0; y < h; y++) {
        var band = Math.abs(y - rb) < 5 ? 55 : 0, row = (y & 1) ? 0.82 : 1;
        for (xx = 0; xx < w; xx++) {
          var v = (14 + rnd() * (lit ? 70 : 46) + band) * row; i = (y * w + xx) * 4;
          d[i] = v * 0.86; d[i + 1] = v * 0.98; d[i + 2] = v; d[i + 3] = 255;
        }
      }
      x.putImageData(img, 0, 0); tex.needsUpdate = true;
    }
    draw(0, false);
    return { canvas: cv, tex: tex, draw: draw };
  }

  /* ── AV 카트: 학교 시청각실의 바퀴 달린 카트. 위에 TV, 아래에 VCR. 앞면 +Z ── */
  P.avCart = function () {
    var b = K.builder();
    var steel = K.mat("cart.steel", function () { return K.std(0x596a78, 0.5, 0.45, { env: 0.9 }); });
    var shelf = K.mat("cart.shelf", function () { return K.std(0x6b7a86, 0.55, 0.25, { env: 0.8 }); });
    var black = K.mat("cart.black", function () { return K.std(0x1e2022, 0.6, 0.15, { env: 0.6 }); });
    var cream = K.mat("cart.cream", function () { return K.std(0xcfc7b0, 0.55, 0.05, { env: 0.8 }); });
    var vcr = K.mat("cart.vcr", function () { return K.std(0x34373b, 0.45, 0.35, { env: 0.9 }); });
    var led = K.mat("cart.led", function () { return K.std(0xe0392b, 0.3, 0, { emissive: 0xe0392b, ei: 1.3 }); });
    var SH0 = 0.52, SH1 = 0.98;
    [[-0.29, -0.2], [0.29, -0.2], [-0.29, 0.2], [0.29, 0.2]].forEach(function (p) {
      b.cyl(0.012, 0.012, SH1 - 0.07, steel, { p: [p[0], 0.07 + (SH1 - 0.07) / 2, p[1]], seg: 8 });
      b.cyl(0.026, 0.026, 0.03, black, { p: [p[0], 0.045, p[1]], seg: 10 });
      b.cyl(0.007, 0.007, 0.03, steel, { p: [p[0], 0.075, p[1]], seg: 6 });
    });
    b.rbox(0.66, 0.026, 0.52, 0.008, shelf, { p: [0, SH0, 0], segs: 2 });
    b.rbox(0.66, 0.03, 0.52, 0.008, shelf, { p: [0, SH1, 0], segs: 2 });
    b.rbox(0.66, 0.05, 0.012, 0.004, steel, { p: [0, SH1 - 0.035, 0.256], segs: 1 });                   /* 앞 띠 */
    /* VCR */
    b.rbox(0.44, 0.09, 0.32, 0.008, vcr, { p: [0, SH0 + 0.013 + 0.045, 0.02], segs: 2 });
    b.rbox(0.30, 0.03, 0.012, 0.004, black, { p: [-0.04, SH0 + 0.013 + 0.05, 0.184], segs: 1 });          /* 테이프 투입구 */
    b.sphere(0.0055, led, { p: [0.15, SH0 + 0.013 + 0.075, 0.183], ws: 8, hs: 6 });
    [0.09, 0.115, 0.14, 0.165].forEach(function (x, i) { b.rbox(0.018, 0.009, 0.008, 0.002, black, { p: [x - 0.09, SH0 + 0.013 + 0.02, 0.183], segs: 1 }); });
    /* TV */
    var ty = SH1 + 0.015;
    b.rbox(0.5, 0.4, 0.14, 0.03, cream, { p: [0, ty + 0.2, 0.11], segs: 3 });
    b.add(G.cyl(0.13, 0.2, 0.26, 4), cream, { p: [0, ty + 0.2, -0.08], r: [PI / 2, PI / 4, 0], s: [1.25, 1, 1.0] });
    b.rbox(0.42, 0.32, 0.02, 0.02, black, { p: [0, ty + 0.21, 0.183] });
    [0.15, 0.19].forEach(function (x) { b.cyl(0.011, 0.011, 0.012, black, { p: [x + 0.03, ty + 0.055, 0.183], r: [PI / 2, 0, 0], seg: 10 }); });
    b.rbox(0.36, 0.03, 0.2, 0.01, cream, { p: [0, ty + 0.015, 0.0], segs: 1 });
    var g = b.build({ name: "avCart" });
    /* 화면: 노이즈. 카툰에서는 조명을 받지 않는 기본 재질 */
    var ns = noiseScreen(96, 72);
    var sg = new T.PlaneGeometry(0.36, 0.27, 6, 5), sp = sg.attributes.position;
    for (var i = 0; i < sp.count; i++) { var xx = sp.getX(i) / 0.18, yy = sp.getY(i) / 0.135; sp.setZ(i, 0.01 * (1 - 0.5 * (xx * xx + yy * yy))); }
    sg.computeVertexNormals();
    var screen = new T.Mesh(sg, K.isToon() ? new T.MeshBasicMaterial({ map: ns.tex, toneMapped: false }) : new T.MeshStandardMaterial({ map: ns.tex, emissiveMap: ns.tex, emissive: new T.Color(1, 1, 1), emissiveIntensity: 0.8, roughness: 0.2 }));
    screen.position.set(0, ty + 0.21, 0.194); screen.name = "tvScreen"; g.add(screen);
    /* 테이프: VCR 위에 놓인 VHS */
    var tb = K.builder(), tcase = K.mat("tape.case", function () { return K.std(0x18191b, 0.6, 0.1, { env: 0.6 }); });
    tb.rbox(0.19, 0.026, 0.104, 0.004, tcase, { p: [0, 0, 0], segs: 1 });
    var tape = tb.build({ name: "vhsTape" });
    var lab = P.canvas(190, 60, function (x, w, h) {
      x.fillStyle = "#f2efe4"; x.fillRect(0, 0, w, h); x.fillStyle = "#b32a22"; x.fillRect(0, 0, w, 14);
      x.fillStyle = "#1b2640"; x.font = "800 24px 'Noto Sans KR',sans-serif"; x.textAlign = "center"; x.fillText("4번 테이프", w / 2, 44);
    });
    var lm = new T.Mesh(new T.PlaneGeometry(0.11, 0.035), P.canvasMat(lab, { rough: 0.7 })); lm.rotation.x = -PI / 2; lm.position.set(0.02, 0.0135, 0); tape.add(lm);
    tape.position.set(-0.03, SH0 + 0.013 + 0.09 + 0.014, 0.03); tape.rotation.y = 0.32; g.add(tape);
    g.userData = { screen: screen, noise: ns, tape: tape, size: [0.66, 1.3, 0.52], lit: false };
    var acc = 0;
    g.userData.update = function (dt, t, on) {
      acc += dt; if (acc < 0.09) return; acc = 0;
      ns.draw(t, !!g.userData.lit);
    };
    return g;
  };

  /* ── 명단 클립보드: 3장. 종이에 팀 명단이 적혀 있다 ── */
  P.rosterBoard = function (names) {
    var b = K.builder();
    var wood = K.mat("clip.wood", function () { return K.std(0x9a6a3a, 0.6, 0.05, { env: 0.6 }); });
    var steel = K.mat("clip.steel", function () { return K.std(0xb9bdc2, 0.35, 0.85, { env: 1.2 }); });
    b.rbox(0.25, 0.33, 0.012, 0.004, wood, { p: [0, 0, 0], segs: 1 });
    b.rbox(0.09, 0.03, 0.02, 0.004, steel, { p: [0, 0.155, 0.012], segs: 1 });
    b.cyl(0.006, 0.006, 0.03, steel, { p: [0, 0.18, 0.012], r: [0, 0, PI / 2], seg: 8 });
    var g = b.build({ name: "rosterBoard" });
    var cv = P.canvas(420, 520, function (x, w, h) {
      x.fillStyle = "#f5f1e3"; x.fillRect(0, 0, w, h);
      x.fillStyle = "#c9d3e0"; for (var y = 96; y < h; y += 34) x.fillRect(16, y, w - 32, 2);
      x.fillStyle = "#1b2640"; x.font = "800 34px 'Noto Sans KR','Malgun Gothic',sans-serif"; x.textAlign = "center"; x.fillText("우리 팀", w / 2, 58);
      x.textAlign = "left"; x.font = "600 25px 'Noto Sans KR','Malgun Gothic',sans-serif";
      (names || []).forEach(function (n, i) { x.fillStyle = "#8a93a6"; x.fillText(String(i + 1), 30, 132 + i * 34 - 6); x.fillStyle = i === names.length - 1 ? "#a03528" : "#1b2640"; x.fillText(n, 74, 132 + i * 34 - 6); });
    });
    var paper = new T.Mesh(new T.PlaneGeometry(0.215, 0.27), P.canvasMat(cv, { rough: 0.85 })); paper.position.set(0, -0.012, 0.0072); paper.receiveShadow = true; g.add(paper);
    g.userData.size = [0.25, 0.36, 0.03];
    return g;
  };

  /* ── 노(조정): 나무 자루 + 파란 줄무늬 날. 원점은 손잡이 끝(아래), +y 로 자란다 ── */
  P.oar = function () {
    var b = K.builder(), wood = K.mat("oar.wood", function () { return K.std(0xc99a5a, 0.55, 0.05, { env: 0.7 }); });
    var blade = K.mat("oar.blade", function () { return K.std(0xf2efe4, 0.5, 0.05, { env: 0.7 }); });
    var navy = K.mat("oar.navy", function () { return K.std(0x1f3a6a, 0.5, 0.05, { env: 0.7 }); });
    b.cyl(0.017, 0.02, 1.7, wood, { p: [0, 0.85, 0], seg: 10 });
    b.cyl(0.026, 0.026, 0.16, wood, { p: [0, 0.08, 0], seg: 10 });
    b.rbox(0.19, 0.55, 0.014, 0.006, blade, { p: [0, 1.95, 0], segs: 2 });
    b.rbox(0.19, 0.08, 0.016, 0.004, navy, { p: [0, 2.1, 0], segs: 1 }); b.rbox(0.19, 0.03, 0.016, 0.004, navy, { p: [0, 1.98, 0], segs: 1 });
    var g = b.build({ name: "oar" }); g.userData.size = [0.2, 2.25, 0.05]; return g;
  };

  /* ── 페넌트 줄: 삼각 깃발이 늘어진 줄에 매달렸다. 글자 없이 색만 ── */
  P.pennants = function (n, span) {
    n = n || 6; span = span || 1.9;
    var b = K.builder(), cols = [0x1f3a6a, 0xb32a22, 0xf2efe4, 0x2f6a4a, 0xd8a72e, 0x1f3a6a], string = K.mat("pen.string", function () { return K.std(0x3a3020, 0.9, 0); });
    var pts = [];
    for (var i = 0; i <= 12; i++) { var u = i / 12; pts.push([(u - 0.5) * span, -Math.sin(u * PI) * 0.16, 0]); }
    b.pipe(pts, 0.004, string, {});
    for (var k = 0; k < n; k++) {
      var u2 = (k + 0.5) / n, x = (u2 - 0.5) * span, y = -Math.sin(u2 * PI) * 0.16, w = span / n * 0.86;
      var geo = new T.BufferGeometry();
      geo.setAttribute("position", new T.Float32BufferAttribute([-w / 2, 0, 0, w / 2, 0, 0, 0, -w * 1.15, 0], 3));
      geo.setAttribute("normal", new T.Float32BufferAttribute([0, 0, 1, 0, 0, 1, 0, 0, 1], 3)); geo.setAttribute("uv", new T.Float32BufferAttribute([0, 1, 1, 1, 0.5, 0], 2)); geo.setIndex([0, 2, 1]);
      var m = K.mat("pen." + k % cols.length, (function (c) { return function () { return K.std(c, 0.7, 0, { side: T.DoubleSide }); }; })(cols[k % cols.length]));
      b.add(geo, m, { p: [x, y - 0.004, 0.004], r: [0, 0, (u2 - 0.5) * -0.4] });
    }
    return b.build({ name: "pennants", cast: false });
  };
})(window);
