/* ============================================================================
   N1K — 스테이지 1 절차적 모델링 키트 (에셋 0, three.js r128)
   ----------------------------------------------------------------------------
   · 외부 모델·텍스처 파일을 쓰지 않는다. 모양은 전부 코드로 만든다.
   · 정적 지오메트리는 builder 로 모아 재질별 한 덩어리로 합친다.
     디테일(볼트·모서리 둥글림·이음매)을 늘려도 드로우콜이 늘지 않는다.
   · r128 은 재질·조명 색을 선형으로 바꿔 주지 않는다. K.srgb 한 곳에서만 변환한다.
   ========================================================================== */
(function (root) {
  "use strict";
  var T = root.THREE;
  var K = root.N1K = root.N1K || {};

  /* ── 색 ──────────────────────────────────────────────────────────────── */
  K.srgb = function (hex) { var c = new T.Color(hex); c.convertSRGBToLinear(); return c; };
  K.mix = function (a, b, t) {   /* sRGB hex 두 개를 섞어 hex 로 */
    var ca = new T.Color(a), cb = new T.Color(b);
    return ca.lerp(cb, t).getHex();
  };

  /* ── 결정적 난수 (같은 시드 = 같은 교실) ─────────────────────────────── */
  K.rng = function (seed) {
    var s = (seed >>> 0) || 1;
    function next() {
      s = (s + 0x6D2B79F5) >>> 0;
      var t = s;
      t = Math.imul(t ^ (t >>> 15), t | 1);
      t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    }
    return {
      next: next,
      range: function (a, b) { return a + (b - a) * next(); },
      int: function (a, b) { return Math.floor(a + (b - a + 1) * next()); },
      pick: function (arr) { return arr[Math.floor(next() * arr.length)]; },
      gauss: function () {
        var u = 0, v = 0;
        while (u === 0) u = next();
        while (v === 0) v = next();
        return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v);
      }
    };
  };

  /* ── 타일링되는 그라디언트 노이즈 (텍스처 생성용) ───────────────────── */
  var _perm = null, _gx = null, _gy = null;
  function initNoise() {
    if (_perm) return;
    var r = K.rng(1337), i, j, t;
    _perm = new Uint8Array(512); _gx = new Float32Array(256); _gy = new Float32Array(256);
    var p = new Uint8Array(256);
    for (i = 0; i < 256; i++) { p[i] = i; var a = r.next() * 6.283185307; _gx[i] = Math.cos(a); _gy[i] = Math.sin(a); }
    for (i = 255; i > 0; i--) { j = Math.floor(r.next() * (i + 1)); t = p[i]; p[i] = p[j]; p[j] = t; }
    for (i = 0; i < 512; i++) _perm[i] = p[i & 255];
  }
  function fade(t) { return t * t * t * (t * (t * 6 - 15) + 10); }
  /* px,py: 격자 주기 (정수). 이 주기로 정확히 타일링된다. */
  K.noise2 = function (x, y, px, py) {
    initNoise();
    var xi = Math.floor(x), yi = Math.floor(y), xf = x - xi, yf = y - yi;
    var x0 = ((xi % px) + px) % px, y0 = ((yi % py) + py) % py, x1 = (x0 + 1) % px, y1 = (y0 + 1) % py;
    /* 격자 좌표가 256 을 넘는 큰 주기(섬유선 등)도 해시가 표 밖으로 나가지 않게 & 255 로 접는다 */
    var h00 = _perm[(_perm[x0 & 255] + (y0 & 255)) & 255], h10 = _perm[(_perm[x1 & 255] + (y0 & 255)) & 255];
    var h01 = _perm[(_perm[x0 & 255] + (y1 & 255)) & 255], h11 = _perm[(_perm[x1 & 255] + (y1 & 255)) & 255];
    var d00 = _gx[h00] * xf + _gy[h00] * yf;
    var d10 = _gx[h10] * (xf - 1) + _gy[h10] * yf;
    var d01 = _gx[h01] * xf + _gy[h01] * (yf - 1);
    var d11 = _gx[h11] * (xf - 1) + _gy[h11] * (yf - 1);
    var u = fade(xf), v = fade(yf);
    return (d00 + (d10 - d00) * u) + ((d01 + (d11 - d01) * u) - (d00 + (d10 - d00) * u)) * v;   /* -1..1 근방 */
  };
  K.fbm = function (x, y, oct, px, py) {
    var s = 0, a = 0.5, f = 1, n = 0;
    for (var i = 0; i < oct; i++) { s += a * K.noise2(x * f, y * f, px * f, py * f); n += a; a *= 0.5; f *= 2; }
    return s / n;
  };

  /* ── 수학 ────────────────────────────────────────────────────────────── */
  K.detail = 1;   /* 곡면 분할 배율. 기기 성능에 맞춰 부팅 때 정한다(원형 단면 수 등) */
  K.clamp = function (v, a, b) { return v < a ? a : v > b ? b : v; };
  K.lerp = function (a, b, t) { return a + (b - a) * t; };
  K.smooth = function (t) { t = K.clamp(t, 0, 1); return t * t * (3 - 2 * t); };
  K.damp = function (lambda, dt) { return 1 - Math.exp(-lambda * dt); };   /* 프레임률 독립 보간 계수 */

  /* ── 재질 ────────────────────────────────────────────────────────────── */
  K.std = function (hex, rough, metal, o) {
    o = o || {};
    var m = new T.MeshStandardMaterial({
      color: K.srgb(hex), roughness: rough == null ? 0.7 : rough, metalness: metal || 0
    });
    if (o.map) m.map = o.map;
    if (o.bump) { m.bumpMap = o.bump; m.bumpScale = o.bumpScale == null ? 1 : o.bumpScale; }
    if (o.rmap) m.roughnessMap = o.rmap;
    if (o.emissive != null) { m.emissive = K.srgb(o.emissive); m.emissiveIntensity = o.ei == null ? 1 : o.ei; }
    if (o.side != null) m.side = o.side;
    if (o.opacity != null && o.opacity < 1) { m.transparent = true; m.opacity = o.opacity; }
    if (o.vc) m.vertexColors = true;
    if (o.env != null) m.envMapIntensity = o.env;
    if (o.flat) m.flatShading = true;
    return m;
  };
  var _matCache = {};
  /* 이름으로 캐시. 같은 재질을 여러 소품이 공유해야 병합 결과가 최소가 된다. */
  K.mat = function (name, make) { return _matCache[name] || (_matCache[name] = make()); };

  /* ── 지오메트리 병합 ─────────────────────────────────────────────────── */
  /* parts: [{geo, mat, matrix, tint}] → [{geometry, material}] (재질별 하나) */
  K.mergeParts = function (parts) {
    var groups = new Map();
    parts.forEach(function (p) {
      var g = groups.get(p.mat);
      if (!g) groups.set(p.mat, g = []);
      g.push(p);
    });
    var out = [];
    groups.forEach(function (list, mat) {
      var vcount = 0, icount = 0, tinted = false;
      list.forEach(function (p) {
        var g = p.geo;
        vcount += g.attributes.position.count;
        icount += g.index ? g.index.count : g.attributes.position.count;
        if (p.tint != null || g.attributes.color) tinted = true;
      });
      if (mat.vertexColors) tinted = true;   /* vertexColors 재질은 color 속성이 항상 있어야 한다(없으면 검정) */
      var pos = new Float32Array(vcount * 3), nor = new Float32Array(vcount * 3), uv = new Float32Array(vcount * 2);
      var col = tinted ? new Float32Array(vcount * 3) : null;
      if (col) col.fill(1);
      var idx = vcount > 65535 ? new Uint32Array(icount) : new Uint16Array(icount);
      var vo = 0, io = 0, v = new T.Vector3(), n = new T.Vector3(), nm = new T.Matrix3(), tc = new T.Color();
      list.forEach(function (p) {
        var g = p.geo, m = p.matrix, pa = g.attributes.position, na = g.attributes.normal, ua = g.attributes.uv, ca = g.attributes.color;
        var flip = m.determinant() < 0, i;
        nm.getNormalMatrix(m);
        var hasTint = p.tint != null;
        if (hasTint) tc.set(p.tint).convertSRGBToLinear();
        for (i = 0; i < pa.count; i++) {
          v.fromBufferAttribute(pa, i).applyMatrix4(m);
          pos[(vo + i) * 3] = v.x; pos[(vo + i) * 3 + 1] = v.y; pos[(vo + i) * 3 + 2] = v.z;
          if (na) {
            n.fromBufferAttribute(na, i).applyMatrix3(nm).normalize();
            nor[(vo + i) * 3] = n.x; nor[(vo + i) * 3 + 1] = n.y; nor[(vo + i) * 3 + 2] = n.z;
          }
          if (ua) { uv[(vo + i) * 2] = ua.getX(i); uv[(vo + i) * 2 + 1] = ua.getY(i); }
          if (col) {
            var r = 1, gg = 1, b = 1;
            if (ca) { r = ca.getX(i); gg = ca.getY(i); b = ca.getZ(i); }
            if (hasTint) { r *= tc.r; gg *= tc.g; b *= tc.b; }
            col[(vo + i) * 3] = r; col[(vo + i) * 3 + 1] = gg; col[(vo + i) * 3 + 2] = b;
          }
        }
        var ic = g.index ? g.index.count : pa.count;
        for (i = 0; i < ic; i += 3) {
          var a = g.index ? g.index.getX(i) : i, b2 = g.index ? g.index.getX(i + 1) : i + 1, c = g.index ? g.index.getX(i + 2) : i + 2;
          if (flip) { var t = b2; b2 = c; c = t; }
          idx[io + i] = a + vo; idx[io + i + 1] = b2 + vo; idx[io + i + 2] = c + vo;
        }
        vo += pa.count; io += ic;
      });
      var geo = new T.BufferGeometry();
      geo.setAttribute("position", new T.BufferAttribute(pos, 3));
      geo.setAttribute("normal", new T.BufferAttribute(nor, 3));
      geo.setAttribute("uv", new T.BufferAttribute(uv, 2));
      if (col) geo.setAttribute("color", new T.BufferAttribute(col, 3));
      geo.setIndex(new T.BufferAttribute(idx, 1));
      geo.computeBoundingSphere(); geo.computeBoundingBox();
      if (col && !mat.vertexColors) { mat.vertexColors = true; mat.needsUpdate = true; }
      out.push({ geometry: geo, material: mat });
    });
    return out;
  };

  /* ── 빌더: 부품을 모아 한 번에 Group(재질별 Mesh)으로 만든다 ─────────── */
  var _e = new T.Euler(), _q = new T.Quaternion(), _p = new T.Vector3(), _s = new T.Vector3();
  K.xf = function (o) {   /* {p:[x,y,z], r:[rx,ry,rz], s:number|[..], order} → Matrix4 */
    o = o || {};
    var p = o.p || [0, 0, 0], r = o.r || [0, 0, 0];
    var s = o.s == null ? [1, 1, 1] : (typeof o.s === "number" ? [o.s, o.s, o.s] : o.s);
    _e.set(r[0], r[1], r[2], o.order || "XYZ"); _q.setFromEuler(_e);
    return new T.Matrix4().compose(_p.set(p[0], p[1], p[2]), _q, _s.set(s[0], s[1], s[2]));
  };

  K.builder = function () {
    var parts = [];
    var api = {
      parts: parts,
      /* 임의 지오메트리 추가. o: {p, r, s, tint, order} */
      add: function (geo, mat, o) { parts.push({ geo: geo, mat: mat, matrix: K.xf(o), tint: o && o.tint }); return api; },
      /* 다른 빌더의 부품을 변환해서 가져온다 (반복 모듈용) */
      addBuilder: function (other, o) {
        var m = K.xf(o);
        other.parts.forEach(function (q) { parts.push({ geo: q.geo, mat: q.mat, matrix: new T.Matrix4().multiplyMatrices(m, q.matrix), tint: q.tint }); });
        return api;
      },
      /* Group 으로 확정. opts.shadow(기본 true) / opts.name */
      build: function (opts) {
        opts = opts || {};
        var g = new T.Group();
        if (opts.name) g.name = opts.name;
        K.mergeParts(parts).forEach(function (mm) {
          var mesh = new T.Mesh(mm.geometry, mm.material);
          mesh.castShadow = opts.cast !== false; mesh.receiveShadow = opts.receive !== false;
          g.add(mesh);
        });
        return g;
      }
    };
    return api;
  };

  /* ── 정적 병합: 움직이지 않는 메시를 (재질·그림자 옵션·앞/뒤 절반)별로 한 덩어리로 합친다 ──────
     소품을 하나씩 만들어 배치한 뒤 한 번만 부르면 드로콜이 3분의 1 이하로 줄어든다.
     o.exclude: 건드리지 않을 Object3D 들(하위 전부 포함 — 움직이거나 상호작용하는 것)
     o.half(worldZ): 절반 나누기 기준 — 시야 밖 절반은 그리지 않는다. 히트박스·스키닝·uv2 메시는 원래대로 둔다. */
  K.bakeStatic = function (root, o) {
    o = o || {};
    root.updateMatrixWorld(true);
    var skip = new Set(), buckets = new Map(), inv = new T.Matrix4().copy(root.matrixWorld).invert(), c = new T.Vector3();
    (o.exclude || []).forEach(function (ex) { if (ex) ex.traverse(function (x) { skip.add(x); }); });
    root.traverse(function (m) {
      if (!m.isMesh || skip.has(m) || m.userData.hot || m.userData.isHit || m.isSkinnedMesh || Array.isArray(m.material) || m.geometry.attributes.uv2) return;
      for (var v = m; v && v !== root; v = v.parent) if (v.visible === false) return;
      var g = m.geometry; if (!g.boundingSphere) g.computeBoundingSphere();
      c.copy(g.boundingSphere.center).applyMatrix4(m.matrixWorld);
      var half = o.half ? o.half(c.z) : 0;
      var key = m.material.uuid + "|" + (m.castShadow ? 1 : 0) + (m.receiveShadow ? 1 : 0) + "|" + m.renderOrder + "|" + half;
      var b = buckets.get(key); if (!b) buckets.set(key, b = { mat: m.material, cast: m.castShadow, recv: m.receiveShadow, ro: m.renderOrder, meshes: [], parts: [] });
      b.meshes.push(m); b.parts.push({ geo: g, mat: m.material, matrix: new T.Matrix4().multiplyMatrices(inv, m.matrixWorld) });
    });
    var before = 0, after = 0;
    buckets.forEach(function (b) {
      before += b.meshes.length;
      if (b.meshes.length < 2) { after += 1; return; }             /* 하나뿐이면 합칠 이유가 없다 */
      var merged = K.mergeParts(b.parts)[0], mesh = new T.Mesh(merged.geometry, merged.material);
      mesh.castShadow = b.cast; mesh.receiveShadow = b.recv; mesh.renderOrder = b.ro; mesh.name = "baked";
      root.add(mesh); after += 1;
      b.meshes.forEach(function (m) { if (m.parent) m.parent.remove(m); });
    });
    return { before: before, after: after };
  };

  /* ── 통계 (예산 점검용) ──────────────────────────────────────────────── */
  K.stats = function (obj) {
    var meshes = 0, tris = 0, verts = 0;
    obj.traverse(function (o) {
      if (!o.isMesh) return;
      meshes++;
      var g = o.geometry, c = g.index ? g.index.count : g.attributes.position.count;
      tris += c / 3; verts += g.attributes.position.count;
    });
    return { meshes: meshes, tris: Math.round(tris), verts: verts };
  };


  /* r128 에는 scene.environmentIntensity 가 없다. 재질별 envMapIntensity 를 원본 대비 배율로 조절한다. */
  K.setEnvIntensity = function (scene, k) {
    var seen = new Set();
    scene.traverse(function (o) {
      var ms = o.material ? (Array.isArray(o.material) ? o.material : [o.material]) : [];
      ms.forEach(function (m) {
        if (!m || seen.has(m) || m.envMapIntensity === undefined) return;
        seen.add(m);
        if (m.userData.envBase === undefined) m.userData.envBase = m.envMapIntensity;
        m.envMapIntensity = m.userData.envBase * k;
      });
    });
  };

  K.disposeTree = function (obj) {
    obj.traverse(function (o) {
      if (o.geometry) o.geometry.dispose();
    });
  };
})(window);
