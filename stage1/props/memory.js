/* N1P — 기억 소품 여덟 개: 조각을 칠판에 붙일 때마다 교실에 하나씩 생긴다. (이름 없는 교실이 이름을 되찾는다)
   1 별 모빌 · 2 분필 낙서 · 3 지팡이 · 4 별자리 포스터 · 5 메달 · 6 책 더미 · 7 작은 태극기 · 8 스탠드
   각 함수는 원점 기준의 Group 을 돌려준다. 자리는 room/layout.js 가 정한다. 정답 낱말은 글자로 새기지 않는다. */
(function (root) {
  "use strict";
  var T = root.THREE, K = root.N1K, G = K.geo, P = root.N1P, PI = Math.PI;

  function tex(cv) { var t = new T.CanvasTexture(cv); t.encoding = T.sRGBEncoding; t.anisotropy = 4; return t; }
  function canvas(w, h, draw) { var c = document.createElement("canvas"); c.width = w; c.height = h; draw(c.getContext("2d"), w, h); return c; }

  /* 1 · 별 모빌 (태어난 날): 천장에 매달려 천천히 돈다. 원점 = 천장에 닿는 점, 아래(-y)로 늘어진다 */
  P.memStars = function () {
    var g = new T.Group(), gold = K.mat("mem.gold", function () { return K.std(0xe8b93c, 0.4, 0.5, { emissive: 0x6a4a08, ei: 0.5, env: 1 }); });
    var thread = K.mat("mem.thread", function () { return K.std(0x8a8270, 0.9, 0); });
    var arm = new T.Group(); g.add(arm);
    function starShape(R, r) { var s = new T.Shape(); for (var i = 0; i < 10; i++) { var a = -PI / 2 + i * PI / 5, rr = i % 2 ? r : R, x = Math.cos(a) * rr, y = Math.sin(a) * rr; if (i) s.lineTo(x, y); else s.moveTo(x, y); } s.closePath(); return s; }
    var b = K.builder(), rod = K.mat("mem.rod", function () { return K.std(0x6b5a3a, 0.7, 0.1); });
    b.cyl(0.004, 0.004, 0.62, rod, { p: [0, -0.16, 0], r: [0, 0, PI / 2], seg: 6 });
    b.cyl(0.003, 0.003, 0.16, thread, { p: [0, -0.08, 0], seg: 5 });
    [[-0.27, 0.16, 0.05], [0.0, 0.3, 0.07], [0.27, 0.2, 0.055]].forEach(function (s) {
      b.cyl(0.0018, 0.0018, s[1], thread, { p: [s[0], -0.16 - s[1] / 2, 0], seg: 4 });
      var geo = new T.ExtrudeGeometry(starShape(s[2], s[2] * 0.42), { depth: 0.012, bevelEnabled: true, bevelThickness: 0.003, bevelSize: 0.003, bevelSegments: 1 });
      geo.translate(0, 0, -0.006); b.add(geo, gold, { p: [s[0], -0.16 - s[1] - s[2] * 0.4, 0] });
    });
    arm.add(b.build({ name: "starMobile" }));
    g.userData.update = function (dt, t) { arm.rotation.y += dt * 0.35; arm.rotation.z = Math.sin(t * 0.7) * 0.03; };
    g.userData.size = [0.62, 0.7, 0.1]; return g;
  };

  /* 2 · 분필 낙서 (별명): 칠판 구석에 그려진 부스스한 머리 얼굴. 앞면 +Z, 투명 배경 */
  P.memDoodle = function () {
    var cv = canvas(512, 420, function (x, w, h) {
      x.lineCap = "round"; x.lineJoin = "round"; x.strokeStyle = "rgba(244,244,236,.92)"; x.lineWidth = 6;
      x.beginPath(); x.ellipse(256, 236, 100, 118, 0, 0, 6.283); x.stroke();                                   /* 얼굴 */
      var rr = 7; function rnd() { rr = (rr * 16807) % 2147483647; return rr / 2147483647; }
      for (var i = 0; i < 26; i++) { var a = -PI + i * (PI / 25), r0 = 108, r1 = 150 + rnd() * 60, cx = 256 + Math.cos(a) * 96, cy = 224 + Math.sin(a) * 112; x.lineWidth = 4 + rnd() * 2; x.beginPath(); x.moveTo(cx, cy); x.quadraticCurveTo(cx + Math.cos(a) * r1 * 0.6 + (rnd() - 0.5) * 30, cy + Math.sin(a) * r1 * 0.6, 256 + Math.cos(a) * (r0 + r1 - 100), 224 + Math.sin(a) * (r0 + r1 - 100) * 1.05); x.stroke(); }
      x.lineWidth = 6; x.beginPath(); x.arc(216, 224, 12, 0, 6.283); x.moveTo(316, 224); x.arc(300, 224, 12, 0, 6.283); x.stroke();     /* 눈 */
      x.beginPath(); x.moveTo(196, 205); x.lineTo(236, 196); x.moveTo(280, 196); x.lineTo(322, 205); x.stroke();                                  /* 눈썹 */
      x.lineWidth = 9; x.beginPath(); x.moveTo(206, 282); x.quadraticCurveTo(256, 262, 308, 282); x.quadraticCurveTo(256, 300, 206, 282); x.stroke();  /* 콧수염 */
      x.lineWidth = 5; x.beginPath(); x.arc(256, 306, 34, 0.15 * PI, 0.85 * PI); x.stroke();
      x.font = "800 40px 'Noto Sans KR','Malgun Gothic',sans-serif"; x.fillStyle = "rgba(244,244,236,.85)"; x.textAlign = "left"; x.fillText("천재?!", 350, 96);
    });
    var m = new T.Mesh(new T.PlaneGeometry(0.62, 0.51), new T.MeshBasicMaterial({ map: tex(cv), transparent: true, depthWrite: false, opacity: 0.94, toneMapped: false }));
    m.renderOrder = 6; var g = new T.Group(); g.add(m); g.userData.size = [0.62, 0.51, 0.01]; return g;
  };

  /* 3 · 지팡이 (병): 원점 = 바닥에 닿는 끝, 위로 자란다. 손잡이는 +x 쪽으로 휜다 */
  P.memCane = function () {
    var b = K.builder(), wood = K.mat("mem.cane", function () { return K.std(0x5a3a1e, 0.55, 0.05, { env: 0.7 }); }), brass = K.mat("mem.caneBrass", function () { return K.std(0xc9a24a, 0.35, 0.8, { env: 1.1 }); });
    b.cyl(0.011, 0.014, 0.8, wood, { p: [0, 0.4, 0], seg: 10 });
    b.cyl(0.015, 0.015, 0.02, brass, { p: [0, 0.01, 0], seg: 10 });
    b.add(new T.TorusGeometry(0.055, 0.0115, 8, 18, PI), wood, { p: [0.055, 0.8, 0] });
    b.cyl(0.0125, 0.0125, 0.016, brass, { p: [0.11, 0.8, 0], seg: 8 });
    var g = b.build({ name: "cane" }); g.userData.size = [0.14, 0.86, 0.03]; return g;
  };

  /* 4 · 별자리 포스터 (우주의 시작): 한 점에서 퍼져 나가는 고리. 앞면 +Z */
  P.memPoster = function () {
    var cv = canvas(384, 528, function (x, w, h) {
      var bg = x.createLinearGradient(0, 0, 0, h); bg.addColorStop(0, "#0a1030"); bg.addColorStop(1, "#1b1450"); x.fillStyle = bg; x.fillRect(0, 0, w, h);
      var rr = 3; function rnd() { rr = (rr * 16807) % 2147483647; return rr / 2147483647; }
      for (var i = 0; i < 90; i++) { x.fillStyle = "rgba(230,236,255," + (0.3 + rnd() * 0.6) + ")"; x.fillRect(rnd() * w, rnd() * h, 1 + rnd() * 2, 1 + rnd() * 2); }
      for (var k = 1; k <= 6; k++) { x.strokeStyle = "rgba(255," + (200 - k * 12) + "," + (140 - k * 10) + "," + (0.9 - k * 0.12) + ")"; x.lineWidth = 6 - k * 0.6; x.beginPath(); x.ellipse(192, 230, k * 28, k * 22, 0, 0, 6.283); x.stroke(); }
      var gr = x.createRadialGradient(192, 230, 0, 192, 230, 46); gr.addColorStop(0, "#fff"); gr.addColorStop(0.4, "rgba(255,226,160,.9)"); gr.addColorStop(1, "rgba(255,200,120,0)"); x.fillStyle = gr; x.beginPath(); x.arc(192, 230, 46, 0, 6.283); x.fill();
      x.fillStyle = "rgba(255,240,210,.92)"; x.font = "800 34px 'Noto Sans KR','Malgun Gothic',sans-serif"; x.textAlign = "center"; x.fillText("한 점에서", 192, 440); x.font = "500 20px 'Noto Sans KR',sans-serif"; x.fillStyle = "rgba(200,210,255,.85)"; x.fillText("시간을 거꾸로 돌리면", 192, 478);
    });
    var b = K.builder(), wood = K.mat("mem.frameWood", function () { return K.std(0x7a4b26, 0.6, 0.05, { env: 0.6 }); });
    b.rbox(0.66, 0.9, 0.018, 0.005, wood, { p: [0, 0, 0], segs: 1 });
    var g = b.build({ name: "posterFrame" });
    var face = new T.Mesh(new T.PlaneGeometry(0.6, 0.83), K.std(0xffffff, 0.8, 0, { map: tex(cv) })); face.position.z = 0.0105; g.add(face);
    g.userData.size = [0.66, 0.9, 0.03]; return g;
  };

  /* 5 · 메달 (교황청 방문): 벽 고리에 걸린 금메달. 앞면 +Z, 원점 = 고리 */
  P.memMedal = function () {
    var b = K.builder(), gold = K.mat("mem.medal", function () { return K.std(0xe0b64a, 0.32, 0.85, { env: 1.2 }); }), red = K.mat("mem.ribR", function () { return K.std(0xb32a22, 0.7, 0, { side: T.DoubleSide }); }), white = K.mat("mem.ribW", function () { return K.std(0xf2efe4, 0.7, 0, { side: T.DoubleSide }); });
    b.sphere(0.008, gold, { p: [0, 0, 0.006], ws: 8, hs: 6 });
    function rib(mat, sx, ang) { var geo = new T.PlaneGeometry(0.03, 0.12); b.add(geo, mat, { p: [sx, -0.06, 0.004], r: [0, 0, ang] }); }
    rib(red, -0.02, 0.28); rib(white, 0.02, -0.28);
    b.cyl(0.05, 0.05, 0.008, gold, { p: [0, -0.17, 0.008], r: [PI / 2, 0, 0], seg: 28 });
    b.cyl(0.036, 0.036, 0.01, gold, { p: [0, -0.17, 0.011], r: [PI / 2, 0, 0], seg: 24 });
    var g = b.build({ name: "medal" });
    var face = new T.Mesh(new T.CircleGeometry(0.03, 24), new T.MeshBasicMaterial({ map: tex(canvas(96, 96, function (x, w, h) { x.fillStyle = "#c99a2c"; x.fillRect(0, 0, w, h); x.strokeStyle = "#7a5716"; x.lineWidth = 5; x.beginPath(); x.moveTo(48, 14); x.lineTo(48, 82); x.moveTo(30, 34); x.lineTo(66, 34); x.stroke(); })), toneMapped: false }));
    face.position.set(0, -0.17, 0.0165); g.add(face);
    g.userData.size = [0.12, 0.24, 0.03]; return g;
  };

  /* 6 · 책 더미 (모두가 볼 수 있는 책): 세 권. 맨 위 책 표지에 제목이 있다 */
  P.memBooks = function () {
    var g = new T.Group();
    var navy = P.plainBook(0x1d3557, 0.27, 0.036, 0.2), green = P.plainBook(0x2f6a4a, 0.25, 0.032, 0.19);
    navy.position.set(0, 0.018, 0); green.position.set(0.006, 0.036 + 0.016, 0.004); green.rotation.y = 0.12;
    g.add(navy); g.add(green);
    var top = P.plainBook(0x152a4a, 0.26, 0.034, 0.19); top.position.set(-0.004, 0.036 + 0.032 + 0.017, -0.003); top.rotation.y = -0.16; g.add(top);
    var cover = canvas(390, 280, function (x, w, h) {
      x.fillStyle = "#152a4a"; x.fillRect(0, 0, w, h);
      var gr = x.createRadialGradient(280, 170, 4, 280, 170, 150); gr.addColorStop(0, "rgba(255,226,160,.9)"); gr.addColorStop(0.3, "rgba(120,140,255,.45)"); gr.addColorStop(1, "rgba(20,30,80,0)"); x.fillStyle = gr; x.fillRect(0, 0, w, h);
      x.strokeStyle = "rgba(255,240,200,.7)"; x.lineWidth = 2; for (var i = 1; i < 5; i++) { x.beginPath(); x.ellipse(280, 170, i * 30, i * 12, -0.4, 0, 6.283); x.stroke(); }
      x.fillStyle = "#f5f0dd"; x.font = "italic 700 30px Georgia,'Noto Serif KR',serif"; x.textAlign = "left"; x.fillText("A Brief", 26, 60); x.font = "700 40px Georgia,'Noto Serif KR',serif"; x.fillText("History", 26, 104); x.fillText("of Time", 26, 148);
    });
    var lid = new T.Mesh(new T.PlaneGeometry(0.254, 0.186), K.std(0xffffff, 0.6, 0, { map: tex(cover) })); lid.rotation.x = -PI / 2; lid.position.set(0, 0.0172, 0); top.add(lid);
    g.userData.size = [0.28, 0.1, 0.21]; return g;
  };

  /* 7 · 작은 태극기 (한국 방문): 받침 + 깃대 + 천. 앞면 +Z */
  P.memFlag = function () {
    var b = K.builder(), wood = K.mat("mem.flagPole", function () { return K.std(0xb08a55, 0.55, 0.05); }), base = K.mat("mem.flagBase", function () { return K.std(0x2b2d31, 0.5, 0.3); });
    b.cyl(0.03, 0.034, 0.012, base, { p: [0, 0.006, 0], seg: 16 }); b.cyl(0.0035, 0.0035, 0.3, wood, { p: [0, 0.16, 0], seg: 6 }); b.sphere(0.006, wood, { p: [0, 0.312, 0], ws: 8, hs: 6 });
    var g = b.build({ name: "flagStand" });
    var cv = canvas(300, 200, function (x, w, h) {
      x.fillStyle = "#f6f4ee"; x.fillRect(0, 0, w, h);
      x.fillStyle = "#c8323c"; x.beginPath(); x.arc(150, 100, 36, PI, 0); x.fill(); x.fillStyle = "#1f4e9a"; x.beginPath(); x.arc(150, 100, 36, 0, PI); x.fill();
      x.fillStyle = "#c8323c"; x.beginPath(); x.arc(132, 100, 18, PI, 0); x.fill(); x.fillStyle = "#1f4e9a"; x.beginPath(); x.arc(168, 100, 18, 0, PI); x.fill();
      function bars(cx, cy, ang, pat) { x.save(); x.translate(cx, cy); x.rotate(ang); x.fillStyle = "#15171b"; pat.forEach(function (solid, i) { var y = (i - 1) * 12; if (solid) x.fillRect(-19, y - 4, 38, 8); else { x.fillRect(-19, y - 4, 16, 8); x.fillRect(3, y - 4, 16, 8); } }); x.restore(); }
      bars(46, 32, -0.6, [1, 1, 1]); bars(254, 32, 0.6, [0, 1, 0]); bars(46, 168, 0.6, [1, 0, 1]); bars(254, 168, -0.6, [0, 0, 0]);
    });
    var cloth = new T.Mesh(new T.PlaneGeometry(0.11, 0.073, 6, 3), K.std(0xffffff, 0.9, 0, { map: tex(cv), side: T.DoubleSide })); cloth.position.set(0.058, 0.27, 0.0); g.add(cloth);
    g.userData.cloth = cloth;
    g.userData.update = function (dt, t) { var p = cloth.geometry.attributes.position; for (var i = 0; i < p.count; i++) { var x = p.getX(i) / 0.055 + 1; p.setZ(i, Math.sin(t * 3 + x * 2.2) * 0.0035 * x); } p.needsUpdate = true; };
    g.userData.size = [0.17, 0.32, 0.07]; return g;
  };

  /* 8 · 스탠드 (어둠 속에서 견딤): 초록 갓 은행가 램프. 켜지면 갓 속이 따뜻하게 빛난다 */
  P.memLamp = function () {
    var b = K.builder(), brass = K.mat("mem.lampBrass", function () { return K.std(0xc9a24a, 0.35, 0.8, { env: 1.1 }); }), green = K.mat("mem.lampGreen", function () { return K.std(0x1f6a4a, 0.4, 0.2, { env: 0.9, side: T.DoubleSide }); });
    b.rbox(0.13, 0.014, 0.085, 0.005, brass, { p: [0, 0.007, 0], segs: 1 }); b.cyl(0.007, 0.007, 0.15, brass, { p: [-0.02, 0.09, 0], seg: 8 });
    b.add(new T.CylinderGeometry(0.048, 0.048, 0.15, 20, 1, true, PI / 2, PI), green, { p: [0.005, 0.17, 0], r: [0, 0, PI / 2] });
    var g = b.build({ name: "lamp" });
    var glow = K.mat("mem.lampGlow", function () { return new T.MeshBasicMaterial({ color: 0xffdf9a, toneMapped: false }); });
    var bulb = new T.Mesh(new T.SphereGeometry(0.014, 10, 8), glow); bulb.position.set(0.005, 0.15, 0.0); g.add(bulb);
    g.userData.bulb = bulb; g.userData.size = [0.13, 0.22, 0.09]; return g;
  };
})(window);
