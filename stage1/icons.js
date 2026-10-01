/* ============================================================================
   N1Icons — 기억 조각 여덟 개의 그림(별 모빌·낙서·지팡이·고리·메달·책·깃발·스탠드).
   캔버스 2D 로 그린다. 탑의 3D 블록 라벨과 패널의 블록이 같은 그림을 쓴다. 화면 구조와 THREE 를 모른다.
   draw(g, n, cx, cy, size, ink): 중심 (cx,cy), 한 변 size 의 정사각형 안에 잉크색 선으로 그린다.
   ========================================================================== */
(function (root) {
  "use strict";

  /* 각 그림은 -1..1 좌표에서 그린다(g 는 이미 이동·확대되어 있다). 선 굵기는 draw 가 정한다. */
  var ICON = {
    1: function (g) {                                   /* 태어난 날: 별 모빌 */
      g.beginPath(); g.moveTo(0, -1); g.lineTo(0, -0.7); g.stroke();
      g.beginPath();
      for (var i = 0; i < 10; i++) { var a = -Math.PI / 2 + i * Math.PI / 5, r = i % 2 ? 0.3 : 0.74; g[i ? "lineTo" : "moveTo"](Math.cos(a) * r, 0.12 + Math.sin(a) * r); }
      g.closePath(); g.fill();
    },
    2: function (g) {                                   /* 별명: 머리카락이 뻗친 낙서 얼굴 */
      g.beginPath(); g.arc(0, 0.12, 0.5, 0, Math.PI * 2); g.stroke();
      for (var i = 0; i < 7; i++) { var a = Math.PI + (i + 0.5) * Math.PI / 7; g.beginPath(); g.moveTo(Math.cos(a) * 0.55, 0.12 + Math.sin(a) * 0.55); g.lineTo(Math.cos(a) * 0.92, 0.12 + Math.sin(a) * 0.92); g.stroke(); }
      g.beginPath(); g.arc(-0.18, 0.05, 0.05, 0, 7); g.arc(0.18, 0.05, 0.05, 0, 7); g.fill();
      g.beginPath(); g.moveTo(-0.2, 0.36); g.quadraticCurveTo(0, 0.5, 0.2, 0.36); g.stroke();
    },
    3: function (g) {                                   /* 병: 지팡이 */
      g.beginPath(); g.moveTo(-0.15, 0.95); g.lineTo(-0.15, -0.35); g.arc(0.23, -0.35, 0.38, Math.PI, 0); g.lineTo(0.61, -0.12); g.stroke();
    },
    4: function (g) {                                   /* 우주의 시작: 한 점에서 퍼지는 고리 */
      g.beginPath(); g.arc(0, 0, 0.12, 0, 7); g.fill();
      [0.42, 0.72].forEach(function (r) { g.beginPath(); g.arc(0, 0, r, 0, 7); g.stroke(); });
      for (var i = 0; i < 8; i++) { var a = i * Math.PI / 4 + 0.39; g.beginPath(); g.moveTo(Math.cos(a) * 0.82, Math.sin(a) * 0.82); g.lineTo(Math.cos(a) * 1.0, Math.sin(a) * 1.0); g.stroke(); }
    },
    5: function (g) {                                   /* 교황청: 십자가가 새겨진 메달 */
      g.beginPath(); g.moveTo(-0.28, -0.95); g.lineTo(-0.12, -0.28); g.moveTo(0.28, -0.95); g.lineTo(0.12, -0.28); g.stroke();
      g.beginPath(); g.arc(0, 0.34, 0.58, 0, 7); g.stroke();
      g.beginPath(); g.moveTo(0, 0.04); g.lineTo(0, 0.64); g.moveTo(-0.3, 0.26); g.lineTo(0.3, 0.26); g.stroke();
    },
    6: function (g) {                                   /* 책: 표지에 은하 */
      g.beginPath(); g.rect(-0.62, -0.85, 1.14, 1.7); g.stroke();
      g.beginPath(); g.moveTo(-0.42, -0.85); g.lineTo(-0.42, 0.85); g.stroke();
      g.beginPath(); g.arc(0.08, -0.05, 0.2, 0, 4.6); g.stroke(); g.beginPath(); g.arc(0.08, -0.05, 0.07, 0, 7); g.fill();
      g.beginPath(); g.moveTo(-0.1, 0.55); g.lineTo(0.3, 0.55); g.stroke();
    },
    7: function (g) {                                   /* 한국: 작은 깃발 */
      g.beginPath(); g.rect(-0.85, -0.55, 1.7, 1.1); g.stroke();
      g.beginPath(); g.arc(0, 0, 0.26, Math.PI, 0); g.fill(); g.beginPath(); g.arc(0, 0, 0.26, 0, Math.PI); g.stroke();
      [[-1, -1], [1, -1], [-1, 1], [1, 1]].forEach(function (c) { for (var k = -1; k <= 1; k++) { g.beginPath(); g.moveTo(c[0] * 0.58 + k * 0.07 * c[1], c[1] * 0.3); g.lineTo(c[0] * 0.58 + k * 0.07 * c[1] + c[0] * 0.01, c[1] * 0.42); g.stroke(); } });
    },
    8: function (g) {                                   /* 도움: 스탠드 */
      g.beginPath(); g.ellipse(-0.1, 0.85, 0.5, 0.1, 0, 0, 7); g.stroke();
      g.beginPath(); g.moveTo(-0.1, 0.8); g.lineTo(-0.35, 0.05); g.lineTo(0.2, -0.45); g.stroke();
      g.beginPath(); g.moveTo(0.02, -0.55); g.lineTo(0.5, -0.8); g.lineTo(0.78, -0.3); g.lineTo(0.3, -0.12); g.closePath(); g.fill();
      for (var i = 0; i < 3; i++) { g.beginPath(); g.moveTo(0.42 + i * 0.12, 0.02 + i * 0.07); g.lineTo(0.5 + i * 0.12, 0.26 + i * 0.07); g.stroke(); }
    }
  };

  function draw(g, n, cx, cy, size, ink) {
    var f = ICON[n]; if (!f) return;
    g.save(); g.translate(cx, cy); g.scale(size / 2, size / 2);
    g.strokeStyle = g.fillStyle = ink || "#1b2640"; g.lineWidth = 0.15; g.lineCap = "round"; g.lineJoin = "round";
    f(g); g.restore();
  }
  /* 탑에 새기는 이름의 뼈대: 줄(lines)을 나무색 바탕에 크게 새긴 W×H 그림, 그리고 그 가로줄 조각(i/count) */
  function canvas(w, h) { var c = root.document.createElement("canvas"); c.width = w; c.height = h; return c; }
  function engrave(lines, W, H) {
    var c = canvas(W, H), g = c.getContext("2d"), n = lines.length, lh = H / n;
    g.fillStyle = "#b07a44"; g.fillRect(0, 0, W, H); g.textAlign = "center"; g.textBaseline = "middle";
    lines.forEach(function (t, i) {
      var size = lh * 0.82; g.font = "900 " + size + "px 'Noto Sans KR','Malgun Gothic',sans-serif";
      var m = g.measureText(t), sx = Math.min(1, (W - 40) / (m.width || 1));
      if (sx < 0.62) { size *= sx / 0.62; sx = 0.62; g.font = "900 " + size + "px 'Noto Sans KR','Malgun Gothic',sans-serif"; }   /* 너무 가늘게 눌리지 않게 글자를 줄인다 */
      g.save(); g.translate(W / 2, lh * (i + 0.5)); g.scale(sx, 1);
      g.fillStyle = "rgba(255,236,200,.35)"; g.fillText(t, 0, 3); g.fillStyle = "rgba(34,18,6,.92)"; g.fillText(t, 0, 0); g.restore();
    });
    return c;
  }
  function slice(base, i, count, w, h) {
    var c = canvas(w, h), sh = base.height / count;
    c.getContext("2d").drawImage(base, 0, i * sh, base.width, sh, 0, 0, w, h);
    return c;
  }
  root.N1Icons = { draw: draw, engrave: engrave, slice: slice };
})(window);
