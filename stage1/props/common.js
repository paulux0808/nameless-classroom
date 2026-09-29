/* N1P 공용: 템플릿 캐시와 자주 쓰는 재질. 소품 파일들이 같은 재질 객체를 공유해야 병합 결과가 작아진다. */
(function (root) {
  "use strict";
  var T = root.THREE, K = root.N1K, P = root.N1P = root.N1P || {};

  /* 템플릿을 한 번만 만들고 clone (지오메트리·재질 공유) */
  P.tpl = function (name, make) {
    P._t = P._t || {};
    if (!P._t[name]) P._t[name] = make();
    return P._t[name].clone();
  };

  /* 중립 결 텍스처에 색을 입힌 나무 재질 */
  P.wood = function (key, hex, rough, kind, bumpScale) {
    return K.mat("wood." + key, function () {
      var g = K.tex.grain(kind || "fine");
      return K.std(hex, rough == null ? 0.55 : rough, 0, { map: g.map, bump: g.bump, bumpScale: bumpScale == null ? 0.0011 : bumpScale, vc: true });
    });
  };
  P.M = {
    woodDark: function () { return P.wood("dark", 0x7a4d2c, 0.5, "fine"); },
    woodMid: function () { return P.wood("mid", 0xa06a3f, 0.52, "fine"); },
    woodPale: function () { return P.wood("pale", 0xcfa06a, 0.55, "coarse"); },
    brass: function () { return K.mat("brass", function () { return K.std(0xc9a256, 0.32, 0.9, { env: 1.2 }); }); },
    steelDark: function () { return K.mat("steelDark", function () { return K.std(0x2a2e33, 0.4, 0.75, { env: 1.1 }); }); },
    steelLight: function () { return K.mat("steelLight", function () { return K.std(0x9aa0a4, 0.36, 0.85, { env: 1.1 }); }); },
    rubber: function () { return K.mat("rubber", function () { return K.std(0x15161a, 0.92, 0); }); },
    ivory: function () { return K.mat("ivory", function () { return K.std(0xd9d3c1, 0.42, 0.18, { env: 1 }); }); }
  };

  /* 캔버스에 그린 그림을 얹는 평면 재질 (라벨·종이·포스터) */
  P.canvasMat = function (canvas, o) {
    o = o || {};
    var t = new T.CanvasTexture(canvas); t.encoding = T.sRGBEncoding; t.anisotropy = 8; t.generateMipmaps = true; t.minFilter = T.LinearMipmapLinearFilter;
    var m = K.std(0xffffff, o.rough == null ? 0.8 : o.rough, 0, { map: t });
    if (o.side) m.side = o.side;
    if (o.emissive != null) { m.emissive = K.srgb(o.emissive); m.emissiveMap = t; m.emissiveIntensity = o.ei == null ? 0.5 : o.ei; }
    return m;
  };
  P.canvas = function (w, h, draw) {
    var c = document.createElement("canvas"); c.width = w; c.height = h;
    draw(c.getContext("2d"), w, h);
    return c;
  };

  /* 하드커버 책: 표지 판 두 장 + 등 + 종이 뭉치. 눕힌 책 기준 w(등→앞마구리) × h(두께) × d(위아래). */
  var _pageMat = null;
  P.addBook = function (b, w, h, d, coverHex, o) {
    o = o || {};
    var cover = K.mat("book." + coverHex.toString(16), function () { return K.std(coverHex, 0.72, 0, { env: 0.6 }); });
    _pageMat = _pageMat || K.mat("book.pages", function () { return K.std(0xe9e0c6, 0.9, 0); });
    var t = 0.0035, xf = { p: o.p || [0, 0, 0], r: o.r || [0, 0, 0] };
    var g = new T.Group();
    var parts = [
      [w, t, d, 0.0015, cover, [0, h / 2 - t / 2, 0]], [w, t, d, 0.0015, cover, [0, -h / 2 + t / 2, 0]],
      [t * 1.6, h, d, 0.003, cover, [-w / 2 + t * 0.8, 0, 0]], [w - 0.012, h - 2 * t + 0.002, d - 0.01, 0.001, _pageMat, [0.004, 0, 0]]
    ];
    var m = K.xf(xf);
    parts.forEach(function (q) {
      var mm = new T.Matrix4().multiplyMatrices(m, K.xf({ p: q[5] }));
      b.parts.push({ geo: K.geo.rbox(q[0], q[1], q[2], q[3], 1, 1), mat: q[4], matrix: mm, tint: o.tint });
    });
    return b;
  };
  /* 구겨진 종이 뭉치 지오메트리 */
  P.crumple = function (r, seed) {
    var g = new T.IcosahedronGeometry(r, 2), pos = g.attributes.position, rr = K.rng(seed || 3);
    var map = new Map();
    for (var i = 0; i < pos.count; i++) {
      var key = pos.getX(i).toFixed(3) + "," + pos.getY(i).toFixed(3) + "," + pos.getZ(i).toFixed(3), k = map.get(key);
      if (k === undefined) { k = 0.72 + rr.next() * 0.5; map.set(key, k); }
      pos.setXYZ(i, pos.getX(i) * k, pos.getY(i) * k, pos.getZ(i) * k);
    }
    g.computeVertexNormals();
    return g;
  };
})(window);
