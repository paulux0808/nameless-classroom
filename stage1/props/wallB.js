/* N1P — 벽 소품 B: 커튼(주름·개폐·흔들림), 창틀, 출입문, 작은 벽 물건들 */
(function (root) {
  "use strict";
  var T = root.THREE, K = root.N1K, G = K.geo, X = K.tex, P = root.N1P, PI = Math.PI, M = P.M;

  M.paintCream = function () {
    return K.mat("shell.paintCream", function () {
      var t = X.plaster({ base: 0xddd7c6, tone: 0xcdc6b2, stain: 0.5, size: 256, rough: 0.5 });
      t.map.repeat.set(1, 1);
      return K.std(0xffffff, 0.55, 0, { map: t.map, bump: t.bump, bumpScale: 0.0012 });
    });
  };

  /* ── 커튼: 천 격자를 매 프레임 다시 계산한다. closed 0=한쪽으로 모임, 1=활짝 펼침 ── */
  P.curtain = function (o) {
    o = o || {};
    var W = o.width || 1.5, L = o.length || 1.5, nx = 110, ny = 22, side = o.gatherSide || 1;
    var geo = new T.PlaneGeometry(1, 1, nx, ny);
    var mat = K.mat("curtain.cloth", function () {
      var f = X.fabric({ base: 0x7b2c30, dark: 0x481418, thread: 56, size: 256 });
      f.map.repeat.set(1, 1); f.bump.repeat.set(1, 1);
      var m = K.std(0xffffff, 0.94, 0, { map: f.map, bump: f.bump, bumpScale: 0.0007, side: T.DoubleSide });
      return m;
    });
    var mesh = new T.Mesh(geo, mat); mesh.castShadow = true; mesh.receiveShadow = true; mesh.frustumCulled = false;
    var st = { closed: 1, t: 0, dirty: true };
    function fill(t) {
      var pos = geo.attributes.position, uv = geo.attributes.uv, c = st.closed, gw = 0.26, width = K.lerp(gw, W, c);
      var off = (1 - c) * side * (W - gw) / 2, folds = K.lerp(9, 12, c), amp0 = K.lerp(0.06, 0.036, c);
      for (var j = 0; j <= ny; j++) for (var i = 0; i <= nx; i++) {
        var u = i / nx, v = j / ny, id = j * (nx + 1) + i;
        var x = off + (u - 0.5) * width;
        var fold = Math.sin(u * folds * PI * 2 + 0.7 * Math.sin(v * 2.4) + 0.3);
        var amp = amp0 * (1 - 0.3 * v) * (0.85 + 0.15 * Math.sin(u * 5.3));
        var z = amp * fold + 0.010 * Math.sin(u * 27 + v * 4) * v * v;
        z += 0.007 * Math.sin(t * 0.9 + u * 5.2 + v * 2.0) * v * v;
        pos.setXYZ(id, x, -v * L, z);
        uv.setXY(id, x * 3.5, -v * L * 3.5);
      }
      pos.needsUpdate = true; uv.needsUpdate = true; geo.computeVertexNormals(); geo.computeBoundingSphere();
    }
    fill(0);
    var g = new T.Group(); g.add(mesh);
    /* 봉: 황동 막대 + 양끝 장식 + 브래킷 (커튼 윗단 위) */
    var rb = K.builder(), br = M.brass();
    rb.cyl(0.013, 0.013, W + 0.32, br, { p: [0, 0.03, 0.0], r: [0, 0, PI / 2], seg: 14 });
    [-1, 1].forEach(function (s) {
      rb.sphere(0.024, br, { p: [s * (W / 2 + 0.17), 0.03, 0], ws: 16, hs: 12 });
      rb.cyl(0.005, 0.005, 0.1, br, { p: [s * (W / 2 + 0.07), 0.03, -0.05], r: [PI / 2, 0, 0], seg: 8 });
      rb.rbox(0.03, 0.05, 0.012, 0.004, br, { p: [s * (W / 2 + 0.07), 0.03, -0.1] });
    });
    g.add(rb.build({ name: "curtainRod" }));
    g.userData.length = L; g.userData.width = W;
    g.userData.setClosed = function (c) { st.closed = K.clamp(c, 0, 1); st.dirty = true; g.userData.closed = st.closed; fill(st.t); st.dirty = false; };
    g.userData.closed = 1;
    g.userData.update = function (dt, t, moving) { st.t = t; if (moving || (st.closed > 0.5)) fill(t); };
    /* 천 표면 위 한 점 (u:0..1 가로, v:0..1 위→아래) — 편지를 붙이는 용도 */
    g.userData.surface = function (u, v) {
      var pos = geo.attributes.position, i = Math.round(u * nx), j = Math.round(v * ny), id = j * (nx + 1) + i;
      return new T.Vector3(pos.getX(id), pos.getY(id), pos.getZ(id));
    };
    return g;
  };

  /* ── 창틀: 국소 원점 = 개구부 중심(벽 안쪽 면), +Z 가 실내. 개구부 w × h ──────────── */
  P.windowUnit = function (w, h) {
    w = w || 1.3; h = h || 1.5;
    var b = K.builder(), paint = M.paintCream(), br = M.brass(), zs = -0.12;
    /* 외곽 사시(문틀) + 중간 세로 살 + 가로 살 */
    var FB = 0.05, FD = 0.05;
    b.rbox(w, FB, FD, 0.006, paint, { p: [0, h / 2 - FB / 2, zs], uv: 1.5 });
    b.rbox(w, FB, FD, 0.006, paint, { p: [0, -h / 2 + FB / 2, zs], uv: 1.5 });
    b.rbox(FB, h, FD, 0.006, paint, { p: [-w / 2 + FB / 2, 0, zs], uv: 1.5 });
    b.rbox(FB, h, FD, 0.006, paint, { p: [w / 2 - FB / 2, 0, zs], uv: 1.5 });
    b.rbox(0.045, h - 0.06, 0.042, 0.006, paint, { p: [0, 0, zs], uv: 1.5 });
    [h / 6, -h / 6].forEach(function (y) {
      [-1, 1].forEach(function (s) { b.rbox(w / 2 - 0.05, 0.03, 0.03, 0.004, paint, { p: [s * (w / 4 - 0.0125), y, zs], uv: 1.5 }); });
    });
    /* 안쪽 라이닝(개구부 옆면) */
    b.rbox(w, 0.014, 0.24, 0.003, paint, { p: [0, h / 2 - 0.007, -0.12], uv: 1.5 });
    b.rbox(0.014, h, 0.24, 0.003, paint, { p: [-w / 2 + 0.007, 0, -0.12], uv: 1.5 });
    b.rbox(0.014, h, 0.24, 0.003, paint, { p: [w / 2 - 0.007, 0, -0.12], uv: 1.5 });
    /* 케이싱 (실내 쪽 액자틀) */
    b.rbox(w + 0.17, 0.08, 0.024, 0.006, paint, { p: [0, h / 2 + 0.04, 0.012], uv: 1.5 });
    b.rbox(0.08, h + 0.08, 0.024, 0.006, paint, { p: [-w / 2 - 0.04, 0, 0.012], uv: 1.5 });
    b.rbox(0.08, h + 0.08, 0.024, 0.006, paint, { p: [w / 2 + 0.04, 0, 0.012], uv: 1.5 });
    /* 창턱 + 받침 */
    b.rbox(w + 0.2, 0.04, 0.115, 0.012, paint, { p: [0, -h / 2 - 0.018, 0.05], uv: 1.5 });
    b.rbox(w + 0.06, 0.07, 0.02, 0.005, paint, { p: [0, -h / 2 - 0.075, 0.012], uv: 1.5 });
    /* 크레센트 잠금쇠와 경첩 */
    b.rbox(0.03, 0.07, 0.01, 0.003, br, { p: [0, -0.05, zs + 0.03] });
    b.torus(0.026, 0.0045, br, { p: [0.03, -0.05, zs + 0.04], arc: PI * 1.15, ts: 14, r: [0, 0, 0.2] });
    [0.45, -0.45].forEach(function (y) { b.rbox(0.014, 0.06, 0.008, 0.002, br, { p: [-w / 2 + 0.006, y, zs + 0.028] }); });
    var g = b.build({ name: "windowUnit" });
    var glass = new T.Mesh(new T.PlaneGeometry(w - 0.06, h - 0.06), K.mat("shell.glass2", function () { var m = K.std(0xdfeaf0, 0.05, 0, { opacity: 0.12, env: 1.4 }); m.depthWrite = false; return m; }));
    glass.position.z = zs; glass.renderOrder = 6; g.add(glass);
    g.userData.size = [w, h];
    return g;
  };

  /* ── 출입문: 힌지가 오른쪽(원점). 잎사귀는 -x 로 뻗는다. +π/2 회전하면 바깥(+z)으로 열린다 ── */
  P.exitDoor = function () {
    var frame = new T.Group(), pivot = new T.Group(); frame.add(pivot);
    var wood = P.wood("door", 0x74482a, 0.5, "coarse", 0.0011), br = M.brass();
    var b = K.builder(), LW = 0.95, LH = 2.08, TH = 0.048;
    function cx(x) { return -LW / 2 + x; }
    b.rbox(0.11, LH, TH, 0.008, wood, { p: [-0.055, LH / 2, 0], uv: 1.2 });
    b.rbox(0.11, LH, TH, 0.008, wood, { p: [-LW + 0.055, LH / 2, 0], uv: 1.2 });
    b.rbox(LW - 0.2, 0.12, TH, 0.008, wood, { p: [-LW / 2, LH - 0.06, 0], uv: 1.2 });
    b.rbox(LW - 0.2, 0.1, TH, 0.008, wood, { p: [-LW / 2, 1.12, 0], uv: 1.2 });
    b.rbox(LW - 0.2, 0.22, TH, 0.008, wood, { p: [-LW / 2, 0.11, 0], uv: 1.2 });
    /* 아래 솟은 패널 */
    b.rbox(LW - 0.28, 0.66, 0.02, 0.01, wood, { p: [-LW / 2, 0.62, 0.0], uv: 1.6, tint: 0xb59a86 });
    [-1, 1].forEach(function (s) { b.rbox(LW - 0.34, 0.6, 0.008, 0.008, wood, { p: [-LW / 2, 0.62, s * 0.014], uv: 1.6, tint: 0xc6ac96 }); });
    /* 위 유리창 창살 */
    b.rbox(0.06, 0.66, TH, 0.006, wood, { p: [-LW / 2, 1.58, 0], uv: 1.2 });
    b.rbox(LW - 0.2, 0.05, TH, 0.006, wood, { p: [-LW / 2, 1.58, 0], uv: 1.2 });
    /* 황동 레버 손잡이 (양면) + 킥플레이트 */
    [-1, 1].forEach(function (s) {
      b.rbox(0.05, 0.17, 0.008, 0.004, br, { p: [-LW + 0.055, 1.04, s * (TH / 2 + 0.004)] });
      b.cyl(0.009, 0.009, 0.03, br, { p: [-LW + 0.055, 1.05, s * (TH / 2 + 0.02)], r: [PI / 2, 0, 0], seg: 12 });
      b.cyl(0.0075, 0.0065, 0.11, br, { p: [-LW + 0.11, 1.05, s * (TH / 2 + 0.035)], r: [0, 0, PI / 2], seg: 12 });
      b.rbox(LW - 0.24, 0.18, 0.004, 0.002, br, { p: [-LW / 2, 0.11, s * (TH / 2 + 0.002)], tint: 0xd8c08a });
    });
    var leaf = b.build({ name: "doorLeaf" }); pivot.add(leaf);
    /* 망입 유리 */
    var wire = K.mat("door.wireglass", function () {
      var c = P.canvas(128, 256, function (g, w, h) {
        g.fillStyle = "#e4efe9"; g.fillRect(0, 0, w, h); g.strokeStyle = "rgba(70,90,80,.55)"; g.lineWidth = 2;
        for (var k = 0; k < w + h; k += 16) { g.beginPath(); g.moveTo(k, 0); g.lineTo(k - h, h); g.stroke(); g.beginPath(); g.moveTo(k - h, 0); g.lineTo(k, h); g.stroke(); }
      });
      var t = new T.CanvasTexture(c); t.encoding = T.sRGBEncoding; t.anisotropy = 8;
      var m = K.std(0xffffff, 0.3, 0.1, { map: t, opacity: 0.86, env: 1.2 }); return m;
    });
    [-1, 1].forEach(function (s) { var gp = new T.Mesh(new T.PlaneGeometry(0.3, 0.6), wire); gp.position.set(-LW / 2 - 0.0, 1.58, s * 0.006); gp.rotation.y = s > 0 ? 0 : PI; pivot.add(gp); });
    /* 문틀: 개구부 둘레 (원점 기준: 개구부 x∈[-LW,0]) */
    var fb = K.builder(), fw = P.wood("doorframe", 0x5e3b23, 0.5, "coarse", 0.001);
    fb.rbox(LW + 0.22, 0.09, 0.03, 0.006, fw, { p: [-LW / 2, LH + 0.045, -0.02], uv: 1.2 });
    fb.rbox(0.09, LH + 0.09, 0.03, 0.006, fw, { p: [-LW - 0.045, (LH + 0.09) / 2, -0.02], uv: 1.2 });
    fb.rbox(0.09, LH + 0.09, 0.03, 0.006, fw, { p: [0.045, (LH + 0.09) / 2, -0.02], uv: 1.2 });
    fb.rbox(LW, 0.03, 0.24, 0.005, fw, { p: [-LW / 2, LH - 0.015, 0.1], uv: 1.2 });
    fb.rbox(0.03, LH, 0.24, 0.005, fw, { p: [-LW + 0.015, LH / 2, 0.1], uv: 1.2 });
    fb.rbox(0.03, LH, 0.24, 0.005, fw, { p: [-0.015, LH / 2, 0.1], uv: 1.2 });
    fb.rbox(LW, 0.03, 0.26, 0.006, K.mat("door.sill", function () { return K.std(0x8a8378, 0.7, 0.1); }), { p: [-LW / 2, 0.015, 0.1] });
    /* 경첩 3개 */
    [0.25, 1.05, 1.85].forEach(function (y) { fb.rbox(0.03, 0.1, 0.012, 0.003, K.mat("door.hinge", function () { return K.std(0x33302b, 0.5, 0.6); }), { p: [0.0, y, -0.03] }); });
    frame.add(fb.build({ name: "doorFrame" }));
    frame.userData.pivot = pivot; frame.userData.leafWidth = LW; frame.userData.leafHeight = LH;
    return frame;
  };

  /* ── 작은 벽 물건들 ─────────────────────────────────────────────────── */
  function paperPlane(w, h, canvas, o) {
    var t = new T.CanvasTexture(canvas); t.encoding = T.sRGBEncoding; t.anisotropy = 8; t.generateMipmaps = true; t.minFilter = T.LinearMipmapLinearFilter;
    var m = new T.Mesh(new T.PlaneGeometry(w, h), K.std(0xffffff, (o && o.rough) || 0.85, 0, { map: t, side: T.DoubleSide }));
    m.castShadow = true; m.receiveShadow = true; return m;
  }
  P.mottoFrame = function () {
    var g = new T.Group(), wood = P.wood("motto", 0x3f2a1c, 0.5, "coarse"), b = K.builder();
    var W = 0.86, H = 0.3;
    b.rbox(W, 0.035, 0.03, 0.008, wood, { p: [0, H / 2 - 0.0175, 0.015], uv: 1.4 }); b.rbox(W, 0.035, 0.03, 0.008, wood, { p: [0, -H / 2 + 0.0175, 0.015], uv: 1.4 });
    b.rbox(0.035, H, 0.03, 0.008, wood, { p: [-W / 2 + 0.0175, 0, 0.015], uv: 1.4 }); b.rbox(0.035, H, 0.03, 0.008, wood, { p: [W / 2 - 0.0175, 0, 0.015], uv: 1.4 });
    g.add(b.build({ name: "mottoFrame" }));
    var c = P.canvas(1024, 352, function (x, w, h) {
      x.fillStyle = "#efe6cf"; x.fillRect(0, 0, w, h);
      x.fillStyle = "#17130f"; x.textAlign = "center"; x.textBaseline = "middle"; x.font = "700 122px 'Noto Serif KR','Batang','Gowun Batang',serif"; x.fillText("스스로 생각하라", w / 2, h / 2 + 6);
      x.fillStyle = "#a12f25"; x.fillRect(w - 150, h - 84, 60, 60);
    });
    var p = paperPlane(W - 0.07, H - 0.07, c); p.position.z = 0.01; g.add(p);
    g.userData.size = [W, H]; return g;
  };
  P.timetable = function () {
    var g = new T.Group(), c = P.canvas(640, 900, function (x, w, h) {
      x.fillStyle = "#e9e2cc"; x.fillRect(0, 0, w, h); x.fillStyle = "#2a241a"; x.textAlign = "center"; x.textBaseline = "middle";
      x.font = "700 54px 'Noto Sans KR','Malgun Gothic',sans-serif"; x.fillText("시 간 표", w / 2, 60);
      x.font = "600 26px 'Noto Sans KR',sans-serif"; x.fillText("마지막 학기", w / 2, 106);
      var days = ["월", "화", "수", "목", "금"], cw = 100, ch = 88, x0 = 70, y0 = 150;
      x.strokeStyle = "#5a4e38"; x.lineWidth = 2; x.font = "600 28px 'Noto Sans KR',sans-serif";
      for (var i = 0; i < 5; i++) x.fillText(days[i], x0 + cw * (i + 0.5) + 30, y0 + 24);
      for (var r = 0; r < 7; r++) for (var c2 = 0; c2 < 6; c2++) x.strokeRect(x0 + (c2 - 1 + 1) * cw - cw + 30 + (c2 > 0 ? 0 : 0), y0 + 44 + r * ch * 0.86, cw, ch * 0.86);
      x.font = "500 22px 'Noto Sans KR',sans-serif"; x.fillStyle = "#6c6046";
      var subj = ["국어", "수학", "영어", "과학", "체육", "음악", "미술"];
      for (r = 0; r < 7; r++) { x.fillText(String(r + 1), x0 + 15 + 30, y0 + 44 + r * ch * 0.86 + ch * 0.43); for (c2 = 0; c2 < 5; c2++) x.fillText(subj[(r * 3 + c2 * 2) % 7], x0 + cw * (c2 + 0.5) + 30 + 0, y0 + 44 + r * ch * 0.86 + ch * 0.43); }
      x.fillStyle = "#8a2b22"; x.font = "600 24px sans-serif"; x.fillText("담당 교사", w / 2, h - 46);
    });
    var p = paperPlane(0.5, 0.7, c); g.add(p);
    var pb = K.builder(); [[-0.22, 0.32], [0.22, 0.32]].forEach(function (q) { pb.sphere(0.008, K.mat("pin.gold", function () { return K.std(0xd9b24a, 0.3, 0.8); }), { p: [q[0], q[1], 0.008], ws: 10, hs: 8 }); });
    g.add(pb.build()); g.userData.size = [0.5, 0.7]; return g;
  };
  P.switchPlate = function () {
    var b = K.builder(), pl = K.mat("switch.plate", function () { return K.std(0xe6dfcb, 0.45, 0, { env: 0.8 }); }), rk = K.mat("switch.rocker", function () { return K.std(0xf1ecdc, 0.5, 0, { env: 0.8 }); });
    b.rbox(0.085, 0.115, 0.01, 0.004, pl, { p: [0, 0, 0.005] });
    [-0.02, 0.02].forEach(function (x, i) { b.rbox(0.026, 0.05, 0.012, 0.005, rk, { p: [x, 0, 0.012], r: [i ? 0.12 : -0.12, 0, 0] }); });
    [[-0.03, 0.05], [0.03, -0.05]].forEach(function (c) { b.cyl(0.003, 0.003, 0.002, M.steelLight(), { p: [c[0], c[1], 0.01], r: [PI / 2, 0, 0], seg: 8 }); });
    return b.build({ name: "switchPlate" });
  };
  P.outlet = function () {
    var b = K.builder(), pl = K.mat("switch.plate", function () { return K.std(0xe6dfcb, 0.45, 0, { env: 0.8 }); });
    b.rbox(0.075, 0.115, 0.01, 0.004, pl, { p: [0, 0, 0.005] });
    [[0, 0.03], [0, -0.03]].forEach(function (c) { b.cyl(0.018, 0.018, 0.004, K.mat("outlet.face", function () { return K.std(0xd8d0b8, 0.5, 0); }), { p: [c[0], c[1], 0.011], r: [PI / 2, 0, 0], seg: 20 }); [-0.007, 0.007].forEach(function (dx) { b.box(0.003, 0.01, 0.002, K.mat("outlet.hole", function () { return K.std(0x151515, 1, 0); }), { p: [c[0] + dx, c[1], 0.0135] }); }); });
    return b.build({ name: "outlet" });
  };
  P.speaker = function () {
    var b = K.builder(), body = K.mat("speaker.body", function () { return K.std(0xd6d0bf, 0.55, 0.1, { env: 0.8 }); });
    b.rbox(0.3, 0.24, 0.1, 0.02, body, { p: [0, 0, 0.05], segs: 3 });
    var grille = K.mat("speaker.grille", function () {
      var c = P.canvas(128, 128, function (g, w, h) { g.fillStyle = "#b9b4a4"; g.fillRect(0, 0, w, h); g.fillStyle = "#2a2926"; for (var y = 6; y < h; y += 10) for (var x = (y / 10 % 2 ? 5 : 0) + 6; x < w; x += 10) { g.beginPath(); g.arc(x, y, 2.6, 0, 6.283); g.fill(); } });
      var t = new T.CanvasTexture(c); t.encoding = T.sRGBEncoding; t.anisotropy = 8; t.wrapS = t.wrapT = T.RepeatWrapping; t.repeat.set(2, 1.6);
      return K.std(0xffffff, 0.6, 0.2, { map: t });
    });
    var gm = new T.Mesh(new T.PlaneGeometry(0.25, 0.19), grille); gm.position.z = 0.1015; var g = b.build({ name: "speaker" }); g.add(gm);
    return g;
  };
  P.thermometer = function () {
    var b = K.builder(), body = K.mat("thermo.body", function () { return K.std(0x5a4a34, 0.5, 0.1, { env: 0.8 }); });
    b.rbox(0.13, 0.19, 0.02, 0.01, body, { p: [0, 0, 0.01], segs: 3 });
    var face = P.canvas(256, 384, function (g, w, h) {
      g.fillStyle = "#eee8d6"; g.fillRect(0, 0, w, h); g.strokeStyle = "#2a241a"; g.fillStyle = "#2a241a"; g.textAlign = "center"; g.lineWidth = 3;
      function dial(cy, label, a0) { g.beginPath(); g.arc(w / 2, cy, 92, 0, 6.283); g.stroke(); for (var i = 0; i < 24; i++) { var a = i * 0.26; g.beginPath(); g.moveTo(w / 2 + Math.cos(a) * 80, cy + Math.sin(a) * 80); g.lineTo(w / 2 + Math.cos(a) * 90, cy + Math.sin(a) * 90); g.stroke(); } g.font = "700 26px sans-serif"; g.fillText(label, w / 2, cy + 40); g.beginPath(); g.moveTo(w / 2, cy); g.lineTo(w / 2 + Math.cos(a0) * 70, cy + Math.sin(a0) * 70); g.lineWidth = 5; g.stroke(); g.lineWidth = 3; }
      dial(104, "°C", -2.0); dial(280, "%RH", -1.0);
    });
    var f = new T.Mesh(new T.PlaneGeometry(0.11, 0.165), P.canvasMat(face, { rough: 0.5 })); f.position.z = 0.0205; var g = b.build({ name: "thermometer" }); g.add(f);
    return g;
  };
  P.noticeSheet = function () {
    var c = P.canvas(384, 540, function (x, w, h) {
      x.fillStyle = "#e6dfc9"; x.fillRect(0, 0, w, h);
      var grad = x.createLinearGradient(0, 0, w, h); grad.addColorStop(0, "rgba(255,255,255,.45)"); grad.addColorStop(1, "rgba(160,140,90,.35)"); x.fillStyle = grad; x.fillRect(0, 0, w, h);
      x.fillStyle = "rgba(90,78,52,.35)"; x.fillRect(40, 44, w - 80, 26);
      for (var i = 0; i < 13; i++) x.fillRect(40, 110 + i * 30, w - 80 - (i % 4 === 3 ? 90 : 0), 9);
    });
    var g = new T.Group(); g.add(paperPlane(0.3, 0.42, c));
    var pb = K.builder(); [[-0.13, 0.19], [0.13, 0.19]].forEach(function (q) { pb.sphere(0.007, K.mat("pin.blue", function () { return K.std(0x3a72b8, 0.35, 0.2); }), { p: [q[0], q[1], 0.007], ws: 10, hs: 8 }); });
    g.add(pb.build()); return g;
  };
})(window);
