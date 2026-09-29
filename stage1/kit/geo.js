/* N1K.geo — 절차적 지오메트리 생성기. 모서리를 둥글게, 이음매를 매끈하게. */
(function (root) {
  "use strict";
  var T = root.THREE, K = root.N1K, G = K.geo = {};
  var PI = Math.PI;

  /* ── 위치가 같은 정점끼리 법선을 평균낸다 (분리된 그리드의 이음매를 매끈하게) ── */
  G.weldNormals = function (g, eps) {
    var inv = 1 / (eps || 1e-4), pos = g.attributes.position, nor = g.attributes.normal, map = new Map(), i, k, a;
    for (i = 0; i < pos.count; i++) {
      k = Math.round(pos.getX(i) * inv) + "," + Math.round(pos.getY(i) * inv) + "," + Math.round(pos.getZ(i) * inv);
      a = map.get(k);
      if (!a) map.set(k, a = [0, 0, 0]);
      a[0] += nor.getX(i); a[1] += nor.getY(i); a[2] += nor.getZ(i);
    }
    for (i = 0; i < pos.count; i++) {
      k = Math.round(pos.getX(i) * inv) + "," + Math.round(pos.getY(i) * inv) + "," + Math.round(pos.getZ(i) * inv);
      a = map.get(k);
      var l = Math.sqrt(a[0] * a[0] + a[1] * a[1] + a[2] * a[2]) || 1;
      nor.setXYZ(i, a[0] / l, a[1] / l, a[2] / l);
    }
    nor.needsUpdate = true;
    return g;
  };

  /* ── 둥근 상자: 모서리가 반경 r 로 깎인다. UV 는 월드 크기 기준 평면 투영. ── */
  G.rbox = function (w, h, d, r, segs, uvs) {
    segs = segs || 2;
    r = Math.max(0.0004, Math.min(r, w / 2 - 1e-4, h / 2 - 1e-4, d / 2 - 1e-4));
    var n = segs * 2 + 1;
    var g = new T.BoxGeometry(1, 1, 1, n, n, n);
    var pos = g.attributes.position, nor = g.attributes.normal, uv = g.attributes.uv;
    var half = 0.5 / n, bx = w / 2 - r, by = h / 2 - r, bz = d / 2 - r, us = uvs == null ? 1 : uvs;
    for (var i = 0; i < pos.count; i++) {
      var x = pos.getX(i), y = pos.getY(i), z = pos.getZ(i), fx = nor.getX(i), fy = nor.getY(i);
      var sx = Math.sign(x), sy = Math.sign(y), sz = Math.sign(z);
      var nx = x - sx * half, ny = y - sy * half, nz = z - sz * half;
      var l = Math.sqrt(nx * nx + ny * ny + nz * nz) || 1;
      nx /= l; ny /= l; nz /= l;
      var px = bx * sx + nx * r, py = by * sy + ny * r, pz = bz * sz + nz * r;
      pos.setXYZ(i, px, py, pz); nor.setXYZ(i, nx, ny, nz);
      if (Math.abs(fy) > 0.5) uv.setXY(i, px * us, pz * us);
      else if (Math.abs(fx) > 0.5) uv.setXY(i, pz * us, py * us);
      else uv.setXY(i, px * us, py * us);
    }
    return g;
  };

  /* ── 둥근 판: xz 평면, 두께 t (위 +t/2 · 아래 -t/2), 모서리 반경 cr,
        가장자리 둥글림 edge, bend(v) 로 곡면화. 상판·좌판·선반·책 표지에 쓴다. ── */
  G.plate = function (w, d, cr, t, o) {
    o = o || {};
    var edge = Math.min(o.edge == null ? t * 0.45 : o.edge, t / 2 - 1e-4), E = o.edgeSegs || 3, R = o.rings || 8;
    var us = o.uv == null ? 1 : o.uv, bend = o.bend, hx = w / 2, hz = d / 2;
    cr = Math.max(0.002, Math.min(cr, hx - 1e-3, hz - 1e-3));
    var cx = hx - cr, cz = hz - cr, ac = o.cornerSegs || 6, step = o.step || 0.06;
    /* 1) 외곽선 (반시계, 각도가 +x 에서 +z 로 증가) */
    var P = [];   /* {x,z,nx,nz} */
    function arc(ccx, ccz, a0) {
      for (var i = 0; i <= ac; i++) {
        var a = a0 + (PI / 2) * (i / ac), c = Math.cos(a), s = Math.sin(a);
        P.push({ x: ccx + cr * c, z: ccz + cr * s, nx: c, nz: s });
      }
    }
    function line(x0, z0, x1, z1, nx, nz) {
      var len = Math.hypot(x1 - x0, z1 - z0), k = Math.max(1, Math.round(len / step));
      for (var i = 1; i < k; i++) { var f = i / k; P.push({ x: x0 + (x1 - x0) * f, z: z0 + (z1 - z0) * f, nx: nx, nz: nz }); }
    }
    arc(cx, cz, 0);          line(cx, hz, -cx, hz, 0, 1);
    arc(-cx, cz, PI / 2);    line(-hx, cz, -hx, -cz, -1, 0);
    arc(-cx, -cz, PI);       line(-cx, -hz, cx, -hz, 0, -1);
    arc(cx, -cz, PI * 1.5);  line(hx, -cz, hx, cz, 1, 0);
    var M = P.length, i, j, k;
    var arcLen = [0];
    for (j = 1; j <= M; j++) { var a = P[j - 1], b = P[j % M]; arcLen.push(arcLen[j - 1] + Math.hypot(b.x - a.x, b.z - a.z)); }
    /* 2) 그리드 조립 */
    var pos = [], uvs = [], idx = [];
    function addV(x, y, z, u, v) { pos.push(x, y, z); uvs.push(u, v); return pos.length / 3 - 1; }
    /* 링 = (외곽선 - 법선*edge) 를 sc 배 축소한 뒤 법선 방향으로 offset 만큼 민 것.
       윗면·아랫면 링은 offset=0(축소만), 가장자리 행은 sc=1 이고 offset=edge*sinθ → θ=90° 에서 외곽선에 닿는다. */
    function ringVerts(offset, y, sc, uvMode, vdev) {
      var start = pos.length / 3;
      for (var j = 0; j < M; j++) {
        var p = P[j];
        var x = (p.x - p.nx * edge) * sc + p.nx * offset, z = (p.z - p.nz * edge) * sc + p.nz * offset;
        if (uvMode === "planar") addV(x, y, z, x * us, z * us);
        else addV(x, y, z, arcLen[j] * us, vdev * us);
      }
      return start;
    }
    /* 링 a, b 사이 띠를 만든다. want=[x,y,z] 는 이 띠가 향해야 할 대략의 바깥 방향.
       첫 삼각형의 기하 법선이 want 와 반대면 이 띠 전체를 뒤집는다(띠마다 따로 판정). */
    function faceDir(t0, want) {
      var A = t0[0] * 3, B = t0[1] * 3, C = t0[2] * 3;
      var ux = pos[B] - pos[A], uy = pos[B + 1] - pos[A + 1], uz = pos[B + 2] - pos[A + 2];
      var vx = pos[C] - pos[A], vy = pos[C + 1] - pos[A + 1], vz = pos[C + 2] - pos[A + 2];
      var nx = uy * vz - uz * vy, ny = uz * vx - ux * vz, nz = ux * vy - uy * vx;
      return nx * want[0] + ny * want[1] + nz * want[2] >= 0;
    }
    function emit(tris, want) {
      var flip = !faceDir(tris[0], want);
      tris.forEach(function (tr) { if (flip) idx.push(tr[0], tr[2], tr[1]); else idx.push(tr[0], tr[1], tr[2]); });
    }
    function strip(a, b, want) {
      var tris = [];
      for (var j = 0; j < M; j++) { var j2 = (j + 1) % M; tris.push([a + j, b + j, a + j2], [a + j2, b + j, b + j2]); }
      emit(tris, want);
    }
    function fan(center, ring, want) {
      var tris = [];
      for (var j = 0; j < M; j++) tris.push([center, ring + (j + 1) % M, ring + j]);
      emit(tris, want);
    }
    var UP = [0, 1, 0], DOWN = [0, -1, 0];
    var topN = t / 2, botN = -t / 2;
    /* 위 면 */
    var topCenter = addV(0, topN, 0, 0, 0), rings = [];
    for (k = 1; k <= R; k++) rings.push(ringVerts(0, topN, k / R, "planar"));
    fan(topCenter, rings[0], UP);
    for (k = 0; k < R - 1; k++) strip(rings[k], rings[k + 1], UP);
    /* 가장자리: 위 사분원 → 아래 사분원 */
    var rows = [], dev = 0, prevOff = null, prevY = null, rowTheta = [];
    function edgeRow(off, y, th, sgn) {
      if (prevOff !== null) dev += Math.hypot(off - prevOff, y - prevY);
      prevOff = off; prevY = y;
      rows.push(ringVerts(off, y, 1, "side", dev)); rowTheta.push([th, sgn]);
    }
    for (i = 0; i <= E; i++) { var th = (i / E) * PI / 2; edgeRow(edge * Math.sin(th), topN - edge * (1 - Math.cos(th)), th, 1); }
    for (i = E; i >= 0; i--) { var th2 = (i / E) * PI / 2; edgeRow(edge * Math.sin(th2), botN + edge * (1 - Math.cos(th2)), th2, -1); }
    /* 위 면 마지막 링(s=1)과 가장자리 첫 행은 같은 위치의 별개 정점 → 이음매는 weldNormals 로 처리 */
    for (k = 0; k < rows.length - 1; k++) {
      var ta = rowTheta[k], tb = rowTheta[k + 1], wy;
      if (ta[1] !== tb[1]) wy = 0; else wy = ta[1] * Math.cos((ta[0] + tb[0]) / 2);
      strip(rows[k], rows[k + 1], [P[0].nx, wy, P[0].nz]);
    }
    /* 아래 면 */
    var botRings = [];
    for (k = R; k >= 1; k--) botRings.push(ringVerts(0, botN, k / R, "planar"));
    var botCenter = addV(0, botN, 0, 0, 0);
    for (k = 0; k < R - 1; k++) strip(botRings[k], botRings[k + 1], DOWN);
    fan(botCenter, botRings[R - 1], DOWN);
    var g = new T.BufferGeometry();
    /* 4) 곡면 변형 */
    if (bend) {
      var v = new T.Vector3();
      for (i = 0; i < pos.length; i += 3) { v.set(pos[i], pos[i + 1], pos[i + 2]); bend(v); pos[i] = v.x; pos[i + 1] = v.y; pos[i + 2] = v.z; }
    }
    g.setAttribute("position", new T.Float32BufferAttribute(pos, 3));
    g.setAttribute("uv", new T.Float32BufferAttribute(uvs, 2));
    g.setIndex(idx);
    g.computeVertexNormals();
    G.weldNormals(g);
    return g;
  };

  /* ── 2D 도형 ────────────────────────────────────────────────────────── */
  G.roundRectShape = function (w, h, r) {
    r = Math.max(0.0005, Math.min(r, w / 2 - 1e-4, h / 2 - 1e-4));
    var s = new T.Shape(), x = -w / 2, y = -h / 2;
    s.moveTo(x + r, y); s.lineTo(x + w - r, y);
    s.absarc(x + w - r, y + r, r, -PI / 2, 0, false); s.lineTo(x + w, y + h - r);
    s.absarc(x + w - r, y + h - r, r, 0, PI / 2, false); s.lineTo(x + r, y + h);
    s.absarc(x + r, y + h - r, r, PI / 2, PI, false); s.lineTo(x, y + r);
    s.absarc(x + r, y + r, r, PI, PI * 1.5, false);
    return s;
  };
  /* 압출 (z 방향 두께 depth 를 중심에 맞춘다). bevel: {size, thick, segs} */
  G.extrude = function (shape, depth, bevel, curveSegs) {
    var b = bevel || null;
    var g = new T.ExtrudeGeometry(shape, {
      depth: Math.max(0.0001, depth - (b ? 2 * b.thick : 0)), bevelEnabled: !!b,
      bevelThickness: b ? b.thick : 0, bevelSize: b ? b.size : 0, bevelSegments: b ? (b.segs || 2) : 0,
      curveSegments: curveSegs || 10, steps: 1
    });
    g.translate(0, 0, -(depth - (b ? 2 * b.thick : 0)) / 2);
    return g;
  };
  /* 몰딩: 2D 단면([x,y]…)을 z 방향으로 length 만큼 밀어낸다 */
  G.molding = function (profile, length) {
    var s = new T.Shape();
    profile.forEach(function (p, i) { if (i) s.lineTo(p[0], p[1]); else s.moveTo(p[0], p[1]); });
    var g = new T.ExtrudeGeometry(s, { depth: length, bevelEnabled: false, steps: 1 });
    g.translate(0, 0, -length / 2);
    return g;
  };

  /* ── 파이프: 꺾이는 곳을 필렛으로 둥글게 한 굽은 관 (철제 다리·손잡이) ── */
  G.pipePath = function (pts, bend, step) {
    step = step || 0.03;
    var V = pts.map(function (p) { return new T.Vector3(p[0], p[1], p[2]); }), out = [V[0].clone()];
    function straight(a, b) {
      var n = Math.max(1, Math.round(a.distanceTo(b) / step));
      for (var i = 1; i <= n; i++) out.push(a.clone().lerp(b, i / n));
    }
    var cur = V[0].clone();
    for (var i = 1; i < V.length - 1; i++) {
      var a = V[i - 1], b = V[i], c = V[i + 1];
      var u = a.clone().sub(b), v = c.clone().sub(b), lu = u.length(), lv = v.length();
      u.normalize(); v.normalize();
      var ang = Math.acos(K.clamp(u.dot(v), -1, 1));
      var tdist = Math.min(bend / Math.tan(Math.max(ang, 0.05) / 2), lu * 0.5, lv * 0.5);
      var p1 = b.clone().addScaledVector(u, tdist), p2 = b.clone().addScaledVector(v, tdist);
      straight(cur, p1);
      var arcN = 8;
      for (var s = 1; s <= arcN; s++) {
        var f = s / arcN, q = new T.Vector3()
          .addScaledVector(p1, (1 - f) * (1 - f)).addScaledVector(b, 2 * (1 - f) * f).addScaledVector(p2, f * f);
        out.push(q);
      }
      cur = p2;
    }
    straight(cur, V[V.length - 1]);
    return out;
  };
  G.pipe = function (pts, radius, o) {
    o = o || {};
    var path = G.pipePath(pts, o.bend == null ? radius * 3 : o.bend, o.step);
    var curve = new T.CatmullRomCurve3(path, false, "centripetal");
    var segs = Math.max(6, path.length * 2);
    var g = new T.TubeGeometry(curve, segs, radius, o.radial || 10, false);
    return g;
  };

  /* ── 회전체: profile [[반경, 높이], …] 는 아래에서 위로 ── */
  G.lathe = function (profile, seg, o) {
    o = o || {};
    var pts = profile.map(function (p) { return new T.Vector2(p[0], p[1]); });
    return new T.LatheGeometry(pts, seg || 32, o.start || 0, o.len == null ? PI * 2 : o.len);
  };
  G.cyl = function (rt, rb, h, seg, open) { return new T.CylinderGeometry(rt, rb, h, seg || 20, 1, !!open); };
  G.sphere = function (r, ws, hs) { return new T.SphereGeometry(r, ws || 24, hs || 16); };
  G.torus = function (R, r, rs, ts, arc) { return new T.TorusGeometry(R, r, rs || 10, ts || 32, arc == null ? PI * 2 : arc); };
  G.box = function (w, h, d) { return new T.BoxGeometry(w, h, d); };
  G.plane = function (w, h, ws, hs) { return new T.PlaneGeometry(w, h, ws || 1, hs || 1); };
  /* 캡슐 (반경 r, 몸통 길이 len) — 회전체로 만들어 이음매가 매끈하다 */
  G.capsule = function (r, len, seg) {
    var pr = [], n = 8, i;
    for (i = 0; i <= n; i++) { var a = -PI / 2 + (PI / 2) * (i / n); pr.push([Math.max(0.0001, r * Math.cos(a)), -len / 2 + r * Math.sin(a)]); }
    for (i = 0; i <= n; i++) { var b = (PI / 2) * (i / n); pr.push([Math.max(0.0001, r * Math.cos(b)), len / 2 + r * Math.sin(b)]); }
    return G.lathe(pr, seg || 20);
  };
  /* 테이퍼 팔다리: 위 반경 r1, 아래 반경 r2, 길이 len, 양끝 둥글게 */
  G.limb = function (r1, r2, len, seg) {
    var pr = [], n = 6, i;
    for (i = 0; i <= n; i++) { var a = -PI / 2 + (PI / 2) * (i / n); pr.push([Math.max(0.0001, r2 * Math.cos(a)), -len / 2 + r2 * Math.sin(a)]); }
    for (i = 0; i <= n; i++) { var b = (PI / 2) * (i / n); pr.push([Math.max(0.0001, r1 * Math.cos(b)), len / 2 + r1 * Math.sin(b)]); }
    return G.lathe(pr, seg || 16);
  };

  /* ── 정점 색으로 부위별 색·마모를 넣는다 (fn(x,y,z,nx,ny,nz) → [r,g,b] 0..1 sRGB) ── */
  G.paint = function (g, fn) {
    var pos = g.attributes.position, nor = g.attributes.normal, n = pos.count, col = new Float32Array(n * 3), c = new T.Color();
    for (var i = 0; i < n; i++) {
      var r = fn(pos.getX(i), pos.getY(i), pos.getZ(i), nor.getX(i), nor.getY(i), nor.getZ(i)) || [1, 1, 1];
      c.setRGB(r[0], r[1], r[2]).convertSRGBToLinear();
      col[i * 3] = c.r; col[i * 3 + 1] = c.g; col[i * 3 + 2] = c.b;
    }
    g.setAttribute("color", new T.BufferAttribute(col, 3));
    return g;
  };

  /* ── 빌더 확장: 자주 쓰는 형태를 한 줄로 ── */
  var baseBuilder = K.builder;
  K.builder = function () {
    var b = baseBuilder();
    b.rbox = function (w, h, d, r, mat, o) { return b.add(G.rbox(w, h, d, r, (o && o.segs) || 2, o && o.uv), mat, o); };
    b.box = function (w, h, d, mat, o) { return b.add(G.box(w, h, d), mat, o); };
    b.cyl = function (rt, rb, h, mat, o) { return b.add(G.cyl(rt, rb, h, (o && o.seg) || 20, o && o.open), mat, o); };
    b.sphere = function (r, mat, o) { return b.add(G.sphere(r, (o && o.ws) || 24, (o && o.hs) || 16), mat, o); };
    b.torus = function (R, r, mat, o) { return b.add(G.torus(R, r, (o && o.rs) || 10, (o && o.ts) || 32, o && o.arc), mat, o); };
    b.lathe = function (profile, mat, o) { return b.add(G.lathe(profile, (o && o.seg) || 32, o), mat, o); };
    b.pipe = function (pts, radius, mat, o) { return b.add(G.pipe(pts, radius, o), mat, o); };
    b.plate = function (w, d, cr, t, mat, o) { return b.add(G.plate(w, d, cr, t, o), mat, o); };
    b.capsule = function (r, len, mat, o) { return b.add(G.capsule(r, len, o && o.seg), mat, o); };
    b.limb = function (r1, r2, len, mat, o) { return b.add(G.limb(r1, r2, len, o && o.seg), mat, o); };
    return b;
  };
})(window);
