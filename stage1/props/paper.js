/* N1P.boardPaper — 칠판에 붙는 종이 한 장. 일기(줄 공책)와 자료(복사물) 두 종류.
   서 있는 방향 기준: 정면이 +Z, 위가 +Y. 얇은 판이라 그림자가 칠판에 얹힌다. */
(function (root) {
  "use strict";
  var T = root.THREE, K = root.N1K, G = K.geo, P = root.N1P = root.N1P || {}, PI = Math.PI;
  var FONT = "'Noto Sans KR','Malgun Gothic','Apple SD Gothic Neo',sans-serif";
  var SERIF = "'Noto Serif KR','Batang','AppleMyungjo',serif";
  var W = 0.42, H = 0.31;

  function icon(g, kind, cx, cy, ink) {
    g.save(); g.translate(cx, cy); g.strokeStyle = ink; g.fillStyle = ink; g.lineWidth = 5; g.lineJoin = "round"; g.lineCap = "round";
    if (kind === "sheet") {                        /* 기호 종이: 두 개의 타일과 회전 표식 */
      [-1, 1].forEach(function (s) {
        g.strokeRect(s * 56 - 38, -38, 76, 76); g.fillRect(s * 56 - 9, -38, 18, 8);
        g.beginPath(); g.moveTo(s * 56 - 24, 4); g.lineTo(s * 56 + 24, 4); g.moveTo(s * 56, -16); g.lineTo(s * 56, 26); g.stroke();
      });
    } else if (kind === "sport") {                 /* 공과 선수 배치 */
      g.beginPath(); g.arc(0, 0, 40, 0, PI * 2); g.stroke();
      g.beginPath(); g.moveTo(0, -14); g.lineTo(14, -4); g.lineTo(9, 12); g.lineTo(-9, 12); g.lineTo(-14, -4); g.closePath(); g.stroke();
      [[0, -14, 0, -40], [14, -4, 38, -12], [9, 12, 24, 32], [-9, 12, -24, 32], [-14, -4, -38, -12]].forEach(function (l) { g.beginPath(); g.moveTo(l[0], l[1]); g.lineTo(l[2], l[3]); g.stroke(); });
    } else if (kind === "map") {                   /* 접힌 지도와 경로 */
      g.strokeRect(-70, -38, 140, 76);
      g.beginPath(); g.moveTo(-23, -38); g.lineTo(-23, 38); g.moveTo(23, -38); g.lineTo(23, 38); g.stroke();
      g.setLineDash([9, 8]); g.beginPath(); g.moveTo(-58, 22); g.lineTo(-26, -8); g.lineTo(6, 14); g.lineTo(40, -18); g.lineTo(58, -6); g.stroke(); g.setLineDash([]);
      g.beginPath(); g.arc(58, -6, 5, 0, PI * 2); g.fill();
    } else if (kind === "video") {                 /* 재생 화면 */
      g.strokeRect(-64, -38, 128, 76);
      g.beginPath(); g.moveTo(-14, -20); g.lineTo(-14, 20); g.lineTo(22, 0); g.closePath(); g.fill();
      g.beginPath(); g.moveTo(-64, 26); g.lineTo(-36, 26); g.stroke();
    } else {                                       /* 키보드: 자판 세 줄 */
      for (var r = 0; r < 3; r++) for (var c = 0; c < 8 - (r === 2 ? 3 : 0); c++) {
        var x0 = -74 + c * 19 + (r === 1 ? 8 : 0) + (r === 2 ? 30 : 0);
        g.strokeRect(x0, -34 + r * 26, 15, 20);
      }
    }
    g.restore();
  }

  function draw(o) {
    var S = 1, cw = 512 * S, ch = 378 * S;
    return P.canvas(cw, ch, function (g, w, h) {
      if (o.kind === "diary") {
        g.fillStyle = "#f8f2e1"; g.fillRect(0, 0, w, h);
        /* 공책 줄 + 붉은 여백선 */
        g.strokeStyle = "rgba(64,102,158,.30)"; g.lineWidth = 2;
        for (var y = 128; y < h - 8; y += 31) { g.beginPath(); g.moveTo(0, y); g.lineTo(w, y); g.stroke(); }
        g.strokeStyle = "rgba(190,58,46,.62)"; g.lineWidth = 3; g.beginPath(); g.moveTo(66, 0); g.lineTo(66, h); g.stroke();
        /* 구멍 세 개 */
        g.fillStyle = "rgba(60,52,40,.28)"; [64, 190, 316].forEach(function (yy) { g.beginPath(); g.arc(28, yy, 9, 0, PI * 2); g.fill(); });
        g.textAlign = "left"; g.textBaseline = "alphabetic";
        g.fillStyle = "#2b2419"; g.font = "700 50px " + SERIF; g.fillText(o.title, 92, 70);
        g.strokeStyle = o.accent || "#a03528"; g.lineWidth = 5; g.lineCap = "round";
        g.beginPath(); g.moveTo(92, 86); g.bezierCurveTo(170, 94, 250, 80, 330, 90); g.stroke();
        if (o.sub) { g.fillStyle = "#6f6450"; g.font = "500 27px " + FONT; g.fillText(o.sub, 92, 122); }
        /* 흘려 쓴 글씨 줄 */
        g.strokeStyle = "rgba(43,36,25,.32)"; g.lineWidth = 4; g.lineCap = "round";
        for (var i = 0; i < 3; i++) { var yy2 = 168 + i * 31, len = [300, 340, 190][i]; g.beginPath(); g.moveTo(92, yy2); for (var x = 92; x < 92 + len; x += 14) g.lineTo(x + 7, yy2 + (((x / 14) | 0) % 2 ? -4 : 3)); g.stroke(); }
      } else {
        g.fillStyle = "#edefea"; g.fillRect(0, 0, w, h);
        /* 복사 얼룩 */
        var rr = K.rng(o.seed || 7);
        for (var k = 0; k < 90; k++) { g.fillStyle = "rgba(60,64,60," + (0.02 + rr.next() * 0.03) + ")"; g.fillRect(rr.next() * w, rr.next() * h, rr.range(1, 6), rr.range(1, 3)); }
        g.fillStyle = o.accent || "#2f5f8a"; g.fillRect(0, 0, w, 64);
        g.fillStyle = "#fff"; g.font = "700 26px " + FONT; g.textAlign = "left"; g.textBaseline = "middle";
        var lab = o.label || "자료"; g.fillText(lab.split("").join(" "), 26, 34);
        g.textAlign = "center"; g.fillStyle = "#1e2a3c"; g.font = "800 46px " + FONT; g.textBaseline = "alphabetic";
        var t = o.title, fs = 46; while (g.measureText(t).width > w - 56 && fs > 26) { fs -= 2; g.font = "800 " + fs + "px " + FONT; }
        g.fillText(t, w / 2, 152);
        g.strokeStyle = "rgba(30,42,60,.22)"; g.lineWidth = 3; g.beginPath(); g.moveTo(44, 176); g.lineTo(w - 44, 176); g.stroke();
        icon(g, o.icon || "sheet", w / 2, 264, "#26344a");
        g.strokeStyle = "rgba(30,42,60,.18)"; g.lineWidth = 2; for (var q = 0; q < 2; q++) { g.beginPath(); g.moveTo(44, 334 + q * 16); g.lineTo(w - 44 - (q ? 120 : 0), 334 + q * 16); g.stroke(); }
      }
    });
  }

  /* o: {kind:"diary"|"ref", title, sub, label, accent, icon, seed} */
  P.boardPaper = function (o) {
    var mat = P.canvasMat(draw(o), { rough: 0.86, side: T.DoubleSide });
    var plate = new T.Mesh(G.plate(W, H, 0.0032, 0.002, { edge: 0.0006, uv: 1, rings: 3, edgeSegs: 1, cornerSegs: 2,
      bend: function (v) { var b = Math.max(0, v.z / (H / 2)); v.y += 0.0075 * b * b * b + 0.0008 * Math.pow(v.x / (W / 2), 4) * b; } }), mat);
    var uv = plate.geometry.attributes.uv, pos = plate.geometry.attributes.position;
    for (var i = 0; i < uv.count; i++) uv.setXY(i, pos.getX(i) / W + 0.5, 0.5 - pos.getZ(i) / H);
    plate.rotation.x = PI / 2; plate.castShadow = true; plate.receiveShadow = true;
    var g = new T.Group(); g.add(plate);
    var pb = K.builder();
    var red = K.mat("pin.red", function () { return K.std(0xc0372b, 0.35, 0.2, { env: 1 }); });
    var tape = K.mat("boardPaper.tape", function () { return K.std(0xe6dbb2, 0.55, 0, { opacity: 0.74, transparent: true }); });
    if (o.kind === "diary") {
      pb.sphere(0.0085, red, { p: [0, H / 2 - 0.028, 0.0085], ws: 14, hs: 10 });
      pb.cyl(0.0032, 0.0032, 0.006, M().steelLight(), { p: [0, H / 2 - 0.028, 0.004], r: [PI / 2, 0, 0], seg: 8 });
    } else {
      [-1, 1].forEach(function (s) { pb.rbox(0.062, 0.017, 0.0014, 0.0005, tape, { p: [s * (W / 2 - 0.02), H / 2 - 0.006, 0.0032], r: [0, 0, -s * 0.5] }); });
    }
    g.add(pb.build({ name: "paperPins" }));
    g.userData.size = [W, H, 0.01];
    return g;
  };
  function M() { return P.M; }
  P.BOARD_PAPER = { W: W, H: H };
})(window);
