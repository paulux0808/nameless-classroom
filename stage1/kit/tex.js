/* N1K.tex — 코드로 그리는 텍스처. 이미지 파일을 쓰지 않는다.
   · 나무결·회벽·페인트 같은 표면은 타일링되는 노이즈로 만든다.
   · 요철은 bumpMap(높이 캔버스)로 준다. 노말맵을 픽셀 루프로 굽지 않는다. */
(function (root) {
  "use strict";
  var T = root.THREE, K = root.N1K, X = K.tex = {};
  var aniso = 8;
  X.setAnisotropy = function (n) { aniso = Math.max(1, n | 0); };

  function canvas(w, h) { var c = document.createElement("canvas"); c.width = w; c.height = h; return c; }
  function hex3(hex) { return [(hex >> 16) & 255, (hex >> 8) & 255, hex & 255]; }
  function mix3(a, b, t) { return [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t, a[2] + (b[2] - a[2]) * t]; }

  /* CanvasTexture 마무리: sRGB(색) / linear(높이) 구분 */
  X.finish = function (c, o) {
    o = o || {};
    var t = new T.CanvasTexture(c);
    t.wrapS = t.wrapT = o.clamp ? T.ClampToEdgeWrapping : T.RepeatWrapping;
    t.anisotropy = aniso;
    t.generateMipmaps = true; t.minFilter = T.LinearMipmapLinearFilter; t.magFilter = T.LinearFilter;
    if (o.color !== false) t.encoding = T.sRGBEncoding;
    if (o.repeat) t.repeat.set(o.repeat[0], o.repeat[1]);
    return t;
  };

  /* 픽셀 단위 생성기: fn(u,v,i) → [r,g,b(0..255), h(0..255)] . u,v 는 0..1 */
  X.gen = function (w, h, fn, o) {
    o = o || {};
    var cc = canvas(w, h), cb = canvas(w, h), gc = cc.getContext("2d"), gb = cb.getContext("2d");
    var ic = gc.createImageData(w, h), ib = gb.createImageData(w, h), dc = ic.data, db = ib.data;
    var i = 0;
    for (var y = 0; y < h; y++) for (var x = 0; x < w; x++, i += 4) {
      var r = fn(x / w, y / h, x, y);
      dc[i] = r[0]; dc[i + 1] = r[1]; dc[i + 2] = r[2]; dc[i + 3] = 255;
      var hh = r[3] == null ? 128 : r[3];
      db[i] = db[i + 1] = db[i + 2] = hh; db[i + 3] = 255;
    }
    gc.putImageData(ic, 0, 0); gb.putImageData(ib, 0, 0);
    return { map: X.finish(cc, o), bump: X.finish(cb, { color: false, repeat: o.repeat }), canvas: cc, bumpCanvas: cb };
  };

  /* ── 나무 ────────────────────────────────────────────────────────────
     결이 x 방향으로 흐른다. rings 는 정수(타일링). o: {base, dark, rings, fiber, warp, seed, w,h}
     bumpMap 높이는 미터 단위로 해석된다 → 재질의 bumpScale 은 0.001 안팎으로 쓴다. */
  X.wood = function (o) {
    o = o || {};
    var w = o.w || 512, h = o.h || 512, seed = o.seed || 7;
    var base = hex3(o.base || 0xb98a55), dark = hex3(o.dark || 0x7d5432);
    var R = Math.max(1, Math.round(o.rings || 5)), fiber = o.fiber == null ? 1 : o.fiber, warp = o.warp == null ? 0.55 : o.warp;
    var rr = K.rng(seed), ox = Math.floor(rr.range(0, 30)), oy = Math.floor(rr.range(0, 30));
    return X.gen(w, h, function (u, v) {
      var wv = K.fbm(u * 2 + ox, v * 2 + oy, 3, 2, 2);
      var t = v * R + wv * warp * 2.4, f = t - Math.floor(t);
      var band = Math.sin(f * 6.2831853) * 0.5 + 0.5;
      var late = Math.pow(1 - Math.abs(f * 2 - 1), 3);
      var fib = K.noise2(u * 3 + oy, v * 180, 3, 180), fib2 = K.noise2(u * 9, v * 420, 9, 420), pore = K.noise2(u * 60, v * 300, 60, 300);
      var k = K.clamp(0.2 + late * 0.42 + band * 0.08 + (fib * 0.14 + fib2 * 0.06) * fiber, 0, 1);
      var c = mix3(base, dark, k), sh = 1 + pore * 0.035 * fiber;
      return [c[0] * sh, c[1] * sh, c[2] * sh, 128 + (fib * 26 + fib2 * 14) * fiber + pore * 10 - late * 22];
    }, o);
  };

  /* 중립(회색조) 나무결 — 재질 color 로 색을 입혀 여러 소품이 텍스처를 공유한다 */
  var _grain = {};
  X.grain = function (kind) {
    kind = kind || "fine";
    if (_grain[kind]) return _grain[kind];
    var o = kind === "coarse"
      ? { base: 0xe6e6e6, dark: 0x8f8f8f, rings: 6, seed: 33, fiber: 1.3, warp: 0.9, w: 512, h: 512 }
      : { base: 0xeaeaea, dark: 0xa2a2a2, rings: 3, seed: 17, fiber: 0.9, warp: 0.55, w: 512, h: 512 };
    return (_grain[kind] = X.wood(o));
  };

  /* ── 목재 마루(쪽마루): 판 하나하나의 색이 다르고 이음선이 어둡다 ──────────
     plankW/plankL: 텍스처 안 판 크기(픽셀). herringbone: 헤링본 무늬. */
  X.parquet = function (o) {
    o = o || {};
    var S = o.size || 512, cols = o.cols || 4, rows = o.rows || 8, seed = o.seed || 11;
    var rr = K.rng(seed), base = hex3(o.base || 0x8a5e37), dark = hex3(o.dark || 0x5a3a20);
    var pw = S / cols, ph = S / rows;
    /* 판마다 색조·결 방향 오프셋을 먼저 정한다 */
    var plank = [];
    for (var j = 0; j < rows; j++) for (var i = 0; i < cols; i++) plank.push({ t: rr.range(0.05, 0.85), off: rr.range(0, 30), wear: rr.range(0.3, 1) });
    return X.gen(S, S, function (u, v, x, y) {
      var px = Math.floor(x / pw), py = Math.floor(y / ph);
      var stagger = (py % 2) * pw * 0.5;                    /* 이어붙이기 어긋남 */
      var sx = (x + stagger) % S, ppx = Math.floor(sx / pw);
      var P = plank[py * cols + ppx];
      var lx = (sx % pw) / pw, ly = (y % ph) / ph;
      var n = K.fbm((sx / S) * 6 + P.off, (y / S) * 40 + P.off, 3, 6, 40);
      var fiber = K.noise2((sx / S) * 8 + P.off, (y / S) * 260, 8, 260);
      var ring = 0.5 + 0.5 * Math.sin(((y / S) * 34 + n * 3.2 + P.off) * 6.2831853 * 0.6);
      var k = K.clamp(P.t + ring * 0.26 + fiber * 0.16, 0, 1);
      var c = mix3(base, dark, k);
      /* 판 사이 홈 */
      var gx = Math.min(lx, 1 - lx) * pw, gy = Math.min(ly, 1 - ly) * ph;
      var groove = Math.min(gx / 1.6, gy / 1.6, 1);
      var g2 = 0.55 + 0.45 * groove;
      var wear = 1 - P.wear * 0.08 * (0.5 + 0.5 * K.noise2(u * 5, v * 5, 5, 5));
      return [c[0] * g2 * wear, c[1] * g2 * wear, c[2] * g2 * wear, 90 * groove + 40 + fiber * 24 + n * 20];
    }, o);
  };

  /* ── 회벽/페인트: 은은한 얼룩 + 미세 요철 ─────────────────────────────── */
  X.plaster = function (o) {
    o = o || {};
    var S = o.size || 512, c0 = hex3(o.base || 0xcdbfa6), c1 = hex3(o.tone || 0xb9a98d);
    var stain = o.stain == null ? 0.5 : o.stain, rough = o.rough == null ? 1 : o.rough;
    return X.gen(S, S, function (u, v) {
      var big = K.fbm(u * 3, v * 3, 4, 3, 3), fine = K.noise2(u * 96, v * 96, 96, 96), fine2 = K.noise2(u * 200, v * 200, 200, 200);
      var k = K.clamp(0.5 + big * 0.9 * stain, 0, 1);
      var c = mix3(c0, c1, k), s = 1 + fine * 0.035 + fine2 * 0.02;
      return [c[0] * s, c[1] * s, c[2] * s, 128 + (fine * 34 + fine2 * 18) * rough + big * 20];
    }, o);
  };

  /* ── 천장 텍스(구멍 뚫린 흡음판) 한 장 ─────────────────────────────────── */
  X.ceilingTile = function (o) {
    o = o || {};
    var S = o.size || 256, base = hex3(o.base || 0xd9d2c3), rr = K.rng(o.seed || 5);
    var holes = [];
    for (var i = 0; i < 260; i++) holes.push([rr.next(), rr.next(), rr.range(0.004, 0.011), rr.range(0.55, 1)]);
    var res = X.gen(S, S, function (u, v) {
      var n = K.fbm(u * 8, v * 8, 3, 8, 8), fine = K.noise2(u * 80, v * 80, 80, 80);
      var s = 1 + n * 0.06 + fine * 0.03;
      return [base[0] * s, base[1] * s, base[2] * s, 128 + fine * 30];
    }, o);
    var g = res.canvas.getContext("2d"), gb = res.bumpCanvas.getContext("2d");
    holes.forEach(function (hq) {
      var x = hq[0] * S, y = hq[1] * S, r = hq[2] * S;
      g.fillStyle = "rgba(90,82,68," + (0.16 * hq[3]) + ")"; g.beginPath(); g.arc(x, y, r, 0, 6.283); g.fill();
      gb.fillStyle = "rgba(0,0,0," + (0.7 * hq[3]) + ")"; gb.beginPath(); gb.arc(x, y, r, 0, 6.283); gb.fill();
    });
    res.map.needsUpdate = true; res.bump.needsUpdate = true;
    return res;
  };

  /* ── 도장 금속/무광 페인트 (문·칠판 프레임 등): 미세한 스크래치 ─────────── */
  X.paintedMetal = function (o) {
    o = o || {};
    var S = o.size || 256, base = hex3(o.base || 0x3a4048), rr = K.rng(o.seed || 21);
    var res = X.gen(S, S, function (u, v) {
      var n = K.fbm(u * 6, v * 6, 3, 6, 6), f = K.noise2(u * 60, v * 60, 60, 60);
      var s = 1 + n * 0.10 + f * 0.04;
      return [base[0] * s, base[1] * s, base[2] * s, 128 + f * 24];
    }, o);
    var g = res.canvas.getContext("2d");
    g.strokeStyle = "rgba(190,190,180,.10)"; g.lineWidth = 1;
    for (var i = 0; i < (o.scratches || 40); i++) {
      var x = rr.next() * S, y = rr.next() * S, a = rr.range(-0.6, 0.6), l = rr.range(8, 44);
      g.beginPath(); g.moveTo(x, y); g.lineTo(x + Math.cos(a) * l, y + Math.sin(a) * l); g.stroke();
    }
    res.map.needsUpdate = true;
    return res;
  };

  /* ── 천(커튼·소파): 씨실·날실 ────────────────────────────────────────── */
  X.fabric = function (o) {
    o = o || {};
    var S = o.size || 256, base = hex3(o.base || 0x7a2a2e), dark = hex3(o.dark || 0x4c1519), th = o.thread || 64;
    return X.gen(S, S, function (u, v, x, y) {
      var a = 0.5 + 0.5 * Math.sin(u * th * 6.2831853), b = 0.5 + 0.5 * Math.sin(v * th * 6.2831853);
      var over = ((Math.floor(u * th) + Math.floor(v * th)) & 1) ? a : b;
      var n = K.noise2(u * 30, v * 30, 30, 30);
      var c = mix3(dark, base, 0.55 + over * 0.35 + n * 0.1);
      return [c[0], c[1], c[2], 128 + over * 60 + n * 20];
    }, o);
  };

  /* ── 석판/칠판: 분필 가루와 지운 자국. 글씨는 X.chalkText 로 얹는다 ───── */
  X.chalkboard = function (o) {
    o = o || {};
    var W = o.w || 1024, H = o.h || 512, base = hex3(o.base || 0x1c2e26), rr = K.rng(o.seed || 31);
    var res = X.gen(W, H, function (u, v) {
      var n = K.fbm(u * 5, v * 3, 4, 5, 3), f = K.noise2(u * 140, v * 140, 140, 140);
      var s = 1 + n * 0.16 + f * 0.05;
      return [base[0] * s, base[1] * s, base[2] * s, 128 + f * 20];
    }, { clamp: true });
    var g = res.canvas.getContext("2d");
    /* 지우개 자국: 넓고 옅은 흰 구름 */
    for (var i = 0; i < 26; i++) {
      var x = rr.next() * W, y = rr.next() * H, rx = rr.range(80, 260), ry = rr.range(14, 46);
      var gr = g.createRadialGradient(x, y, 0, x, y, rx);
      gr.addColorStop(0, "rgba(220,232,224," + rr.range(0.03, 0.08) + ")"); gr.addColorStop(1, "rgba(220,232,224,0)");
      g.save(); g.translate(x, y); g.scale(1, ry / rx); g.translate(-x, -y); g.fillStyle = gr; g.beginPath(); g.arc(x, y, rx, 0, 6.283); g.fill(); g.restore();
    }
    res.map.needsUpdate = true;
    return res;
  };

  /* 분필 글씨 (필기체 흉내: 약간의 흔들림과 번짐) */
  X.chalkText = function (canvas, lines, o) {
    o = o || {};
    var g = canvas.getContext("2d"), rr = K.rng(o.seed || 3);
    g.save();
    g.textBaseline = "alphabetic"; g.textAlign = o.align || "left";
    lines.forEach(function (ln) {
      g.font = ln.font || (o.font || "600 44px 'Noto Sans KR','Malgun Gothic','Apple SD Gothic Neo',sans-serif");
      var x = ln.x, y = ln.y;
      /* 번짐 → 본선 */
      g.globalAlpha = 0.22; g.fillStyle = "#eef3ea"; g.filter = "blur(2.2px)"; g.fillText(ln.t, x + rr.range(-0.6, 0.6), y + 1);
      g.filter = "none"; g.globalAlpha = 0.9; g.fillStyle = ln.color || "#f2f5ee"; g.fillText(ln.t, x, y);
      /* 분필 결: 글자 위에 성긴 지우개 점 */
      g.globalCompositeOperation = "destination-out"; g.globalAlpha = 0.16;
    });
    g.restore();
  };

  /* ── 코르크: 알갱이 얼룩 + 압정 구멍 ─────────────────────────────────── */
  X.cork = function (o) {
    o = o || {};
    var S = o.size || 512, base = hex3(o.base || 0xb98a58), dark = hex3(o.dark || 0x84582f), light = hex3(o.light || 0xdcb886), rr = K.rng(o.seed || 51);
    var res = X.gen(S, S, function (u, v) {
      var n = K.fbm(u * 10, v * 10, 4, 10, 10), f = K.noise2(u * 90, v * 90, 90, 90), g = K.noise2(u * 40, v * 40, 40, 40);
      var k = K.clamp(0.5 + n * 0.9 + g * 0.35, 0, 1), c = k > 0.5 ? mix3(base, light, (k - 0.5) * 1.6) : mix3(base, dark, (0.5 - k) * 1.8);
      var s = 1 + f * 0.09;
      return [c[0] * s, c[1] * s, c[2] * s, 128 + g * 40 + f * 30];
    }, o);
    var g2 = res.canvas.getContext("2d"), gb = res.bumpCanvas.getContext("2d");
    for (var i = 0; i < (o.holes == null ? 340 : o.holes); i++) {   /* 빼곡한 압정 구멍 */
      var x = rr.next() * S, y = rr.next() * S, r = rr.range(0.7, 1.7);
      g2.fillStyle = "rgba(48,30,14,.72)"; g2.beginPath(); g2.arc(x, y, r, 0, 6.283); g2.fill();
      gb.fillStyle = "rgb(20,20,20)"; gb.beginPath(); gb.arc(x, y, r + 0.5, 0, 6.283); gb.fill();
    }
    res.map.needsUpdate = true; res.bump.needsUpdate = true;
    return res;
  };

  /* ── 종이 ────────────────────────────────────────────────────────────── */
  X.paper = function (o) {
    o = o || {};
    var S = o.size || 256, base = hex3(o.base || 0xf1e9d5), rr = K.rng(o.seed || 41);
    return X.gen(S, S, function (u, v) {
      var n = K.fbm(u * 6, v * 6, 3, 6, 6), f = K.noise2(u * 120, v * 120, 120, 120);
      var s = 1 + n * 0.05 + f * 0.025;
      return [base[0] * s, base[1] * s, base[2] * s, 128 + f * 18];
    }, o);
  };
})(window);
