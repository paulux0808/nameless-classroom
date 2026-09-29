/* N1K.makeEnv — 이미지 파일 없이 코드로 만드는 환경 반사(IBL).
   작은 "방"을 그려 PMREM 으로 굽는다. 금속·유리·니스칠이 주변을 비추게 하는 용도.
   mode: "studio"(갤러리 검수용, 중립) | "room"(교실: 왼쪽 창이 밝고 나머지는 어두운 회벽) */
(function (root) {
  "use strict";
  var T = root.THREE, K = root.N1K;

  function hdr(hex, mul) { return K.srgb(hex).multiplyScalar(mul); }
  function quad(w, h, color, pos, rot) {
    var m = new T.Mesh(new T.PlaneGeometry(w, h), new T.MeshBasicMaterial({ color: color, side: T.DoubleSide }));
    m.position.set(pos[0], pos[1], pos[2]); m.rotation.set(rot[0], rot[1], rot[2]);
    return m;
  }
  function gradientDome(r, stops) {   /* stops: [[y(-1..1), hex, mul], …] 위→아래 보간 */
    var g = new T.SphereGeometry(r, 32, 20), pos = g.attributes.position, col = new Float32Array(pos.count * 3), c = new T.Color();
    for (var i = 0; i < pos.count; i++) {
      var y = pos.getY(i) / r, k = 0;
      while (k < stops.length - 2 && y < stops[k + 1][0]) k++;
      var a = stops[k], b = stops[k + 1], t = K.clamp((y - a[0]) / (b[0] - a[0] || 1), 0, 1);
      var ca = hdr(a[1], a[2]), cb = hdr(b[1], b[2]);
      c.copy(ca).lerp(cb, t);
      col[i * 3] = c.r; col[i * 3 + 1] = c.g; col[i * 3 + 2] = c.b;
    }
    g.setAttribute("color", new T.BufferAttribute(col, 3));
    return new T.Mesh(g, new T.MeshBasicMaterial({ vertexColors: true, side: T.BackSide }));
  }

  K.makeEnv = function (renderer, mode) {
    var s = new T.Scene();
    if (mode === "studio") {
      s.add(gradientDome(30, [[1, 0xe6ecf5, 0.9], [0.2, 0xc9c4ba, 0.75], [-0.05, 0x8d867b, 0.5], [-1, 0x3a352d, 0.35]]));
      s.add(quad(7, 5, hdr(0xfff4e2, 7), [-9, 6, 8], [0, Math.PI * 0.72, 0]));      /* 키 라이트 소프트박스 */
      s.add(quad(6, 4, hdr(0xdde8ff, 3.2), [10, 4, 6], [0, -Math.PI * 0.68, 0]));   /* 필 */
      s.add(quad(9, 9, hdr(0xffffff, 2.2), [0, 14, 0], [Math.PI / 2, 0, 0]));       /* 천장 */
    } else {
      /* 교실: 10×3.1×8. 왼쪽(-x) 벽에 네 개의 창, 천장에 꺼진 형광등 */
      var wall = hdr(0xb7a688, 0.55), floor = hdr(0x4d3524, 0.28), ceil = hdr(0xa39c8c, 0.42);
      var room = new T.Group();
      room.add(quad(10, 8, ceil, [0, 3.1, 0], [Math.PI / 2, 0, 0]));
      room.add(quad(10, 8, floor, [0, 0, 0], [-Math.PI / 2, 0, 0]));
      room.add(quad(10, 3.1, wall, [0, 1.55, -4], [0, 0, 0]));
      room.add(quad(10, 3.1, wall, [0, 1.55, 4], [0, Math.PI, 0]));
      room.add(quad(8, 3.1, wall, [5, 1.55, 0], [0, -Math.PI / 2, 0]));
      room.add(quad(8, 3.1, wall, [-5, 1.55, 0], [0, Math.PI / 2, 0]));
      [-2.7, -0.95, 0.8, 2.55].forEach(function (z) {
        room.add(quad(1.25, 1.55, hdr(0xdfeaff, 9), [-4.97, 1.75, z], [0, Math.PI / 2, 0]));
      });
      room.add(quad(3.0, 1.2, hdr(0xffe7bd, 3.0), [-4.96, 0.35, 0.1], [0, Math.PI / 2, 0]));   /* 바닥에 떨어진 햇빛 반사광 */
      room.position.set(0, -1.55, 0);
      s.add(room);
    }
    var pm = new T.PMREMGenerator(renderer);
    var rt = pm.fromScene(s, 0.03);
    pm.dispose();
    s.traverse(function (o) { if (o.geometry) o.geometry.dispose(); if (o.material) o.material.dispose(); });
    return rt.texture;
  };
})(window);
