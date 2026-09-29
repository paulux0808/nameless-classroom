/* N1R.lighting — 분위기의 핵심. "빛이 멈춘 교실": 왼쪽 창에서 비스듬히 들어오는 오후 햇빛,
   서늘한 그늘, 공중에 떠 있는 먼지. 챕터가 진행될수록 해가 기울고 색이 식는다(setProgress). */
(function (root) {
  "use strict";
  var T = root.THREE, K = root.N1K, X = K.tex, R = root.N1R = root.N1R || {};
  var PI = Math.PI;

  function softDot() {
    var c = document.createElement("canvas"); c.width = c.height = 64;
    var g = c.getContext("2d"), gr = g.createRadialGradient(32, 32, 0, 32, 32, 32);
    gr.addColorStop(0, "rgba(255,255,255,1)"); gr.addColorStop(0.35, "rgba(255,255,255,.45)"); gr.addColorStop(1, "rgba(255,255,255,0)");
    g.fillStyle = gr; g.fillRect(0, 0, 64, 64);
    var t = new T.CanvasTexture(c); t.encoding = T.sRGBEncoding; return t;
  }

  /* 창밖: 하늘 그라디언트 + 먼 나무·건물 실루엣. 눈높이(1.6m)에 지평선이 오도록 배치한다. */
  function skyTexture() {
    var W = 2048, H = 512, c = document.createElement("canvas"); c.width = W; c.height = H;
    var g = c.getContext("2d"), hz = H * 0.56;
    var sky = g.createLinearGradient(0, 0, 0, hz);
    sky.addColorStop(0, "#8fb1dc"); sky.addColorStop(0.55, "#bcd3ea"); sky.addColorStop(1, "#f6ecd2");
    g.fillStyle = sky; g.fillRect(0, 0, W, hz);
    /* 옅은 구름 */
    var rr = K.rng(77);
    for (var i = 0; i < 26; i++) {
      var x = rr.next() * W, y = rr.range(0.06, 0.5) * hz, rx = rr.range(70, 220), ry = rr.range(10, 26);
      var gr = g.createRadialGradient(x, y, 0, x, y, rx);
      gr.addColorStop(0, "rgba(255,250,240,.32)"); gr.addColorStop(1, "rgba(255,250,240,0)");
      g.save(); g.translate(x, y); g.scale(1, ry / rx); g.translate(-x, -y); g.fillStyle = gr; g.beginPath(); g.arc(x, y, rx, 0, 6.283); g.fill(); g.restore();
    }
    /* 먼 산·건물 (안개 낀 두 겹) */
    function ridge(color, base, amp, seed, blocky) {
      var r2 = K.rng(seed); g.fillStyle = color; g.beginPath(); g.moveTo(0, hz + 4);
      var x2 = 0;
      while (x2 < W) {
        var w = blocky ? r2.range(30, 110) : r2.range(8, 24), h = base + (blocky ? r2.range(0, amp) : (Math.sin(x2 * 0.013 + seed) + Math.sin(x2 * 0.037) * 0.5) * amp);
        g.lineTo(x2, hz - h); g.lineTo(x2 + w, hz - h); x2 += w;
      }
      g.lineTo(W, hz + 4); g.closePath(); g.fill();
    }
    ridge("rgba(150,172,190,.85)", 10, 28, 3, false);
    ridge("rgba(122,142,150,.9)", 6, 34, 9, true);
    /* 가까운 나무 덩어리 */
    var tr = K.rng(12);
    for (var t = 0; t < 40; t++) {
      var tx = tr.next() * W, tw = tr.range(40, 120), th = tr.range(18, 60);
      var tg = g.createRadialGradient(tx, hz - th * 0.4, 0, tx, hz - th * 0.4, tw);
      tg.addColorStop(0, "rgba(70,92,66,.95)"); tg.addColorStop(1, "rgba(70,92,66,0)");
      g.fillStyle = tg; g.beginPath(); g.ellipse(tx, hz - th * 0.35, tw, th, 0, 0, 6.283); g.fill();
    }
    /* 운동장 */
    var gd = g.createLinearGradient(0, hz, 0, H);
    gd.addColorStop(0, "#9aa27f"); gd.addColorStop(1, "#c6b48c");
    g.fillStyle = gd; g.fillRect(0, hz, W, H - hz);
    var tex = new T.CanvasTexture(c); tex.encoding = T.sRGBEncoding; tex.wrapS = T.ClampToEdgeWrapping;
    tex.anisotropy = 4;
    return tex;
  }

  /* 창 하나의 빛기둥: 창 사각형을 태양 방향으로 바닥까지 늘린 뿔대. 꼭짓점 색이 곧 (가산 혼합) 투명도. */
  function shaft(win, dir, color) {
    var x = -R.DIM.W / 2 + 0.13, y0 = win.y0 + 0.04, y1 = win.y1 - 0.04, z0 = win.z - win.w / 2 + 0.05, z1 = win.z + win.w / 2 - 0.05;
    var c = [[x, y0, z0], [x, y0, z1], [x, y1, z1], [x, y1, z0]];   /* 창 모서리 (아래-앞, 아래-뒤, 위-뒤, 위-앞) */
    var far = c.map(function (p) { var t = p[1] / -dir.y; return [p[0] + dir.x * t, 0.0, p[2] + dir.z * t]; });
    var pos = [], col = [], idx = [], vi = 0;
    function face(a, b, ca, cb) {   /* a,b: 창 쪽 두 점, ca,cb: 바닥 쪽 대응점 */
      [a, b, cb, ca].forEach(function (p, k) { pos.push(p[0], p[1], p[2]); var f = k < 2 ? 1.0 : 0.0; col.push(color.r * f, color.g * f, color.b * f); });
      idx.push(vi, vi + 1, vi + 2, vi, vi + 2, vi + 3); vi += 4;
    }
    /* 위(가장 긴 빔)만 살려도 충분하다: 4개 측면 */
    face(c[0], c[1], far[0], far[1]); face(c[1], c[2], far[1], far[2]); face(c[2], c[3], far[2], far[3]); face(c[3], c[0], far[3], far[0]);
    var g = new T.BufferGeometry();
    g.setAttribute("position", new T.Float32BufferAttribute(pos, 3)); g.setAttribute("color", new T.Float32BufferAttribute(col, 3));
    g.setIndex(idx);
    var m = new T.MeshBasicMaterial({ vertexColors: true, blending: T.AdditiveBlending, transparent: true, depthWrite: false, side: T.DoubleSide, fog: false });
    var mesh = new T.Mesh(g, m); mesh.renderOrder = 4; mesh.frustumCulled = false; mesh.name = "shaft";
    return mesh;
  }

  R.buildLighting = function (scene, renderer, o) {
    o = o || {};
    var L = { group: new T.Group(), progress: 0 };
    L.group.name = "lighting";
    scene.environment = K.makeEnv(renderer, "room");
    scene.background = K.srgb(0x0d0f14);
    scene.fog = new T.FogExp2(K.srgb(0x2c2419), 0.022);

    L.hemi = new T.HemisphereLight(K.srgb(0xb3c6e4), K.srgb(0x4f3a28), 0.28);
    L.ambient = new T.AmbientLight(K.srgb(0x9fa8bf), 0.05);
    L.sun = new T.DirectionalLight(K.srgb(0xffd6a0), 2.15);
    L.sun.position.set(-13, 8.6, 6.2);
    L.sun.target.position.set(0.5, 0.4, 0.2);
    L.sun.castShadow = o.shadows !== false;
    var ss = o.shadowSize || 2048;
    L.sun.shadow.mapSize.set(ss, ss); L.sun.shadow.bias = -0.0005; L.sun.shadow.normalBias = 0.035; L.sun.shadow.radius = 2.4;
    var sc = L.sun.shadow.camera; sc.left = -8.2; sc.right = 8.2; sc.top = 6.2; sc.bottom = -6.2; sc.near = 4; sc.far = 34; sc.updateProjectionMatrix();
    /* 햇빛이 닿은 바닥에서 되튀는 따뜻한 빛 (라디오시티 흉내) */
    L.bounce = new T.PointLight(K.srgb(0xffc48a), 0.7, 7.5, 2);
    L.bounce.position.set(-2.2, 0.55, 0.1);
    /* 그늘 쪽을 살짝 채우는 서늘한 빛 */
    L.fill = new T.PointLight(K.srgb(0xa9bde0), 0.8, 11, 2);
    L.fill.position.set(2.8, 2.3, 0.4);
    /* 컴퓨터 화면 빛 (밤 모드에서 강해진다) */
    L.screen = new T.PointLight(K.srgb(0x6ad2bd), 0.55, 3.6, 2);
    L.screen.position.set(0, 1.2, -2.55);
    [L.hemi, L.ambient, L.sun, L.sun.target, L.bounce, L.fill, L.screen].forEach(function (x) { L.group.add(x); });

    /* 창밖 배경 */
    var sky = new T.Mesh(new T.PlaneGeometry(60, 15), new T.MeshBasicMaterial({ map: skyTexture(), color: new T.Color(1.9, 1.85, 1.75), fog: false }));
    sky.position.set(-17, 4.6, 0); sky.rotation.y = PI / 2; sky.name = "skyBackdrop";
    L.group.add(sky); L.sky = sky;

    /* 빛줄기 + 먼지 */
    L.dir = new T.Vector3().copy(L.sun.target.position).sub(L.sun.position).normalize();
    L.shafts = R.WINDOWS.map(function (w) { var s = shaft(w, L.dir, new T.Color(0.024, 0.020, 0.013)); L.group.add(s); return s; });
    var N = o.dust || 220, dp = new Float32Array(N * 3), dseed = K.rng(5), dvel = new Float32Array(N * 3);
    for (var i = 0; i < N; i++) {
      var w = R.WINDOWS[i % 4], t = dseed.next() * 0.9 + 0.05;
      var wx = -R.DIM.W / 2 + 0.13, wy = dseed.range(w.y0, w.y1), wz = dseed.range(w.z - w.w / 2, w.z + w.w / 2);
      var tt = (wy / -L.dir.y) * t;
      dp[i * 3] = wx + L.dir.x * tt; dp[i * 3 + 1] = wy + L.dir.y * tt; dp[i * 3 + 2] = wz + L.dir.z * tt;
      dvel[i * 3] = dseed.range(-0.02, 0.02); dvel[i * 3 + 1] = dseed.range(-0.012, 0.01); dvel[i * 3 + 2] = dseed.range(-0.02, 0.02);
    }
    var dg = new T.BufferGeometry(); dg.setAttribute("position", new T.BufferAttribute(dp, 3));
    var dm = new T.PointsMaterial({ map: softDot(), size: 0.035, sizeAttenuation: true, transparent: true, opacity: 0.55, depthWrite: false, blending: T.AdditiveBlending, color: K.srgb(0xffe9c0), fog: false });
    L.dust = new T.Points(dg, dm); L.dust.frustumCulled = false; L.dust.renderOrder = 5; L.dust.name = "dust";
    L.group.add(L.dust);
    L.dustVel = dvel;
    L.update = function (dt, t) {
      var p = L.dust.geometry.attributes.position, v = L.dustVel, a = p.array, n = a.length / 3;
      for (var i = 0; i < n; i++) {
        var k = i * 3, s = Math.sin(t * 0.3 + i * 1.7) * 0.5;
        a[k] += (v[k] + s * 0.01) * dt; a[k + 1] += (v[k + 1] + Math.cos(t * 0.23 + i) * 0.006) * dt; a[k + 2] += (v[k + 2] - s * 0.01) * dt;
        if (a[k + 1] < 0.05) a[k + 1] = 2.4; if (a[k + 1] > 2.6) a[k + 1] = 0.1;
      }
      p.needsUpdate = true;
      L.shafts.forEach(function (s, i) { s.material.opacity = 0.9 + Math.sin(t * 0.35 + i) * 0.1; });
    };

    /* 진행도 0..1 → 오후에서 저녁으로: 해가 낮아지고 붉어지며 그늘이 푸르러진다 */
    var SUN0 = new T.Color(K.srgb(0xffdcae)), SUN1 = new T.Color(K.srgb(0xff9f5e));
    L.setProgress = function (k) {
      L.progress = k = K.clamp(k, 0, 1);
      L.sun.color.copy(SUN0).lerp(SUN1, k);
      L.sun.intensity = 2.15 - 0.7 * k;
      L.sun.position.set(-13, 8.6 - 4.4 * k, 6.2 - 4.0 * k);
      L.dir.copy(L.sun.target.position).sub(L.sun.position).normalize();
      L.hemi.intensity = 0.28 - 0.05 * k;
    };
    /* 8장: 커튼을 닫으면 방이 어두워진다 */
    L.baseExposure = renderer.toneMappingExposure || 1; L.baseEnv = 0.8;
    var NIGHT_SKY = new T.Color(0.06, 0.085, 0.14), DAY_SKY = new T.Color(1.9, 1.85, 1.75), FOG_DAY = K.srgb(0x2c2419), FOG_NIGHT = K.srgb(0x0a0d14);
    L.setDark = function (d) {   /* d: 0..1 */
      L.sun.intensity = (2.15 - 0.7 * L.progress) * (1 - d) + 0.03 * d;
      L.hemi.intensity = (0.28 - 0.05 * L.progress) * (1 - d) + 0.03 * d;
      L.bounce.intensity = 0.7 * (1 - d);
      L.fill.intensity = 0.8 * (1 - d) + 0.06 * d;
      L.screen.intensity = 0.55 + 0.8 * d; L.screen.distance = 3.6 + 2.2 * d;
      L.shafts.forEach(function (s) { s.visible = d < 0.5; });
      L.dust.material.opacity = 0.55 * (1 - d) + 0.1 * d;
      K.setEnvIntensity(scene, L.baseEnv * (1 - 0.85 * d));
      renderer.toneMappingExposure = L.baseExposure * (1 + 0.3 * d);
      L.sky.material.color.copy(DAY_SKY).lerp(NIGHT_SKY, d);
      scene.fog.color.copy(FOG_DAY).lerp(FOG_NIGHT, d);
    };
    return L;
  };
})(window);
