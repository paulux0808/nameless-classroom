/* N1K.outline — 카툰 잉크 윤곽선(뒤집은 껍질, inverted hull).
   물체를 한 번 더 그리되 ① 뒷면만 ② 정점을 법선 방향으로 화면상 몇 픽셀 부풀려서 그린다.
   앞면은 물체 자신이 가리므로 부푼 만큼만 테두리로 보인다.
   · 두께는 화면 픽셀 기준(가까우면 굵고 멀면 가늘게, 최소·최대 제한) — 해상도와 무관하게 같은 인상.
   · 법선은 겹친 위치끼리 평균낸 "부드러운 법선"이다. 각진 조각(원기둥 뚜껑 등)에서 선이 끊기지 않는다.
   · 움직이지 않는 소품은 하나로 합쳐 그리기 호출 1번, 움직이는 소품(교사·달력·인형…)은 메시마다 껍질을 자식으로 붙인다.
   · 조사할 수 있는 물건은 마우스를 올리면 껍질 재질을 노란색·굵은 것으로 바꿔 강조한다. */
(function (root) {
  "use strict";
  var T = root.THREE, K = root.N1K, O = K.outline = {};

  var U = { uWorld: { value: 0.011 }, uMinPx: { value: 1.1 }, uMaxPx: { value: 3.6 }, uView: { value: new T.Vector2(1280, 720) }, uColor: { value: new T.Color(0x17110d) } };
  var VS = "uniform float uWorld; uniform float uMinPx; uniform float uMaxPx; uniform vec2 uView; uniform float uBoost;\n" +
    "void main() {\n" +
    "  vec4 clip = projectionMatrix * modelViewMatrix * vec4(position, 1.0);\n" +
    "  vec3 nv = normalize(normalMatrix * normal);\n" +
    "  vec2 dp = (projectionMatrix * vec4(nv, 0.0)).xy * uView;\n" +
    "  float l = length(dp); dp = l > 1e-4 ? dp / l : vec2(0.0);\n" +
    "  float px = clamp(uWorld * (uView.y * 0.5 * projectionMatrix[1][1]) / max(clip.w, 0.001), uMinPx, uMaxPx) * uBoost;\n" +
    "  clip.xy += dp * px * 2.0 / uView * clip.w;\n" +
    "  gl_Position = clip;\n" +
    "}";
  var FS = "uniform vec3 uColor;\nvoid main() { gl_FragColor = vec4(uColor, 1.0);\n#include <encodings_fragment>\n}";

  function mk(color, boost) {
    var u = { uWorld: U.uWorld, uMinPx: U.uMinPx, uMaxPx: U.uMaxPx, uView: U.uView, uColor: { value: new T.Color(color) }, uBoost: { value: boost || 1 } };
    var m = new T.ShaderMaterial({ uniforms: u, vertexShader: VS, fragmentShader: FS, side: T.BackSide, polygonOffset: true, polygonOffsetFactor: -1, polygonOffsetUnits: -2 });
    m.userData.isHull = true; return m;
  }
  /* 잉크 재질(어둡고 따뜻한 갈색빛 검정)과 강조 재질(연필 노랑, 더 굵게) */
  O.mat = null; O.hoverMat = null;
  O.init = function () {
    if (O.mat) return;
    O.mat = mk(K.srgb(0x1a130f), 1);
    O.hoverMat = mk(K.srgb(0xffd23f), 2.7);
  };
  /* 화면 크기가 바뀌면 부르는 함수: 장치 픽셀 단위로 두께를 맞춘다 */
  O.setSize = function (w, h, pixelRatio) {
    var pr = pixelRatio || 1;
    U.uView.value.set(Math.max(1, w * pr), Math.max(1, h * pr));
    U.uMinPx.value = 1.05 * pr; U.uMaxPx.value = 3.4 * pr;
  };
  O.setInk = function (hex) { O.init(); O.mat.uniforms.uColor.value.copy(K.srgb(hex)); };

  /* ── 부드러운 법선: 같은 위치(0.1mm 격자)의 정점 법선을 평균한다 ── */
  O.smoothNormals = function (pos, nor) {
    var n = pos.length / 3, map = new Map(), out = new Float32Array(n * 3), sum = [], keyOf = new Int32Array(n), i, k, c;
    for (i = 0; i < n; i++) {
      var x = Math.round(pos[i * 3] * 10000), y = Math.round(pos[i * 3 + 1] * 10000), z = Math.round(pos[i * 3 + 2] * 10000);
      var key = x + "," + y + "," + z; c = map.get(key);
      if (c === undefined) { c = sum.length / 3; map.set(key, c); sum.push(0, 0, 0); }
      keyOf[i] = c; sum[c * 3] += nor[i * 3]; sum[c * 3 + 1] += nor[i * 3 + 1]; sum[c * 3 + 2] += nor[i * 3 + 2];
    }
    for (i = 0; i < n; i++) {
      k = keyOf[i] * 3; var sx = sum[k], sy = sum[k + 1], sz = sum[k + 2], l = Math.sqrt(sx * sx + sy * sy + sz * sz) || 1;
      out[i * 3] = sx / l; out[i * 3 + 1] = sy / l; out[i * 3 + 2] = sz / l;
    }
    return out;
  };
  /* 껍질용 지오메트리: 위치·인덱스는 그대로 두고 법선만 부드럽게. uv·색은 버린다. 원본마다 한 번만 만든다. */
  O.hullGeometry = function (geo) {
    if (geo.userData && geo.userData.hull) return geo.userData.hull;
    var pos = geo.attributes.position, nor = geo.attributes.normal;
    if (!nor) { geo = geo.clone(); geo.computeVertexNormals(); nor = geo.attributes.normal; }
    var h = new T.BufferGeometry();
    h.setAttribute("position", pos);
    h.setAttribute("normal", new T.BufferAttribute(O.smoothNormals(pos.array, nor.array), 3));
    if (geo.index) h.setIndex(geo.index);
    h.boundingSphere = geo.boundingSphere; h.boundingBox = geo.boundingBox;
    if (!h.boundingSphere) h.computeBoundingSphere();
    geo.userData = geo.userData || {}; geo.userData.hull = h;
    return h;
  };

  /* 위치·법선·인덱스만 남긴 가벼운 지오메트리(병합용). 원본은 건드리지 않는다. */
  function lite(g) {
    var l = new T.BufferGeometry();
    l.setAttribute("position", g.attributes.position);
    if (g.attributes.normal) l.setAttribute("normal", g.attributes.normal);
    else { var c = g.clone(); c.computeVertexNormals(); l.setAttribute("normal", c.attributes.normal); }
    if (g.index) l.setIndex(g.index);
    return l;
  }
  function visibleChain(m, top) { for (var v = m; v && v !== top; v = v.parent) if (v.visible === false) return false; return true; }

  /* 껍질을 붙이면 안 되는 메시: 히트박스, 투명(유리·빛줄기), 자체 발광 기본 재질(화면), 표식 */
  function skippable(m) {
    if (!m.isMesh || m.userData.isHit || m.userData.hot || m.userData.noHull || m.userData.isHull) return true;
    var mat = m.material; if (!mat || Array.isArray(mat) || mat.userData.isHull) return true;
    if (mat.transparent && mat.opacity < 0.98) return true;
    if (mat.isMeshBasicMaterial || mat.isShaderMaterial) return true;
    if (m.name === "shaft" || m.name === "skyBackdrop" || m.name === "crtScreen") return true;
    return false;
  }
  O.skippable = skippable;

  /* 움직이는 물체: 안의 모든 메시에 껍질을 자식으로 붙인다(같은 지오메트리를 공유) */
  O.attach = function (obj) {
    O.init(); var list = [];
    obj.traverse(function (m) { if (!skippable(m)) list.push(m); });
    list.forEach(function (m) {
      if (m.userData.hullMesh) return;
      var h = new T.Mesh(O.hullGeometry(m.geometry), O.mat); h.name = "hull"; h.castShadow = false; h.receiveShadow = false; h.userData.isHull = true; h.renderOrder = 2;
      m.add(h); m.userData.hullMesh = h;
    });
    obj.userData.hulls = list.map(function (m) { return m.userData.hullMesh; });
    obj.userData.hullSrc = list;
    return obj;
  };
  /* 강조: 잉크 바깥에 노란 테두리(후광)를 더 굵게 얹는다. 처음 켤 때 메시마다 하나씩 만들어 두고 이후엔 보이기만 바꾼다. */
  O.highlight = function (obj, on) {
    if (!obj || !obj.userData.hullSrc) return;
    obj.userData.hullSrc.forEach(function (m) {
      var hl = m.userData.hullHalo;
      if (!hl) {
        if (!on) return;
        hl = new T.Mesh(O.hullGeometry(m.geometry), O.hoverMat); hl.name = "halo"; hl.castShadow = false; hl.receiveShadow = false;
        hl.userData.isHull = true; hl.renderOrder = 1; m.add(hl); m.userData.hullHalo = hl;
      }
      hl.visible = !!on;
    });
  };

  /* 움직이지 않는 소품 전부를 하나의 껍질로 합친다. skipNames: 이름이 걸리면 뺀다(마루판 등 각진 대면적) */
  O.buildStatic = function (root_, o) {
    o = o || {}; O.init();
    root_.updateMatrixWorld(true);
    var skip = new Set(), parts = [], inv = new T.Matrix4().copy(root_.matrixWorld).invert(), dummy = { isHullMerge: true, vertexColors: false };
    (o.exclude || []).forEach(function (ex) { if (ex) ex.traverse(function (x) { skip.add(x); }); });
    var names = o.skipNames || [], count = 0;
    root_.traverse(function (m) {
      if (skip.has(m) || skippable(m) || names.indexOf(m.name) >= 0) return;
      if (!visibleChain(m, root_)) return;
      parts.push({ geo: lite(m.geometry), mat: dummy, matrix: new T.Matrix4().multiplyMatrices(inv, m.matrixWorld) }); count++;
    });
    if (!parts.length) return null;
    var merged = K.mergeParts(parts)[0].geometry;
    merged.deleteAttribute("uv"); if (merged.attributes.color) merged.deleteAttribute("color");
    merged.setAttribute("normal", new T.BufferAttribute(O.smoothNormals(merged.attributes.position.array, merged.attributes.normal.array), 3));
    merged.computeBoundingSphere();
    var mesh = new T.Mesh(merged, O.mat); mesh.name = "hullStatic"; mesh.castShadow = false; mesh.receiveShadow = false; mesh.userData.isHull = true; mesh.frustumCulled = false; mesh.renderOrder = 2;
    root_.add(mesh);
    return { mesh: mesh, meshes: count, tris: merged.index ? merged.index.count / 3 : 0 };
  };

  /* ══ 조사 강조 ═══════════════════════════════════════════════════════════
     마우스를 올린(가까이 간) 물건의 테두리가 잉크색에서 노란색·굵게 바뀐다.
     · 움직이는 물체: 붙여 둔 껍질의 재질만 바꾼다.
     · 붙박이 물체: 합치기 전에 그 물체를 이루는 메시를 히트박스별로 모아 두었다가, 처음 가리킬 때 껍질 하나로 만든다.
     히트박스와 물체의 짝은 위치로 정한다(물체 중심이 히트박스 안에 들어오면 짝). */
  var hoverMesh = null, hoverObj = null, hoverRoot = null;
  function boxOf(h) { h.updateWorldMatrix(true, false); var b = new T.Box3().setFromObject(h); return b; }
  /* dynList: attach 로 껍질을 붙인 물체들. 붙박이 후보는 collect 가 모은다. 합치기(bakeStatic) 전에 부른다. */
  O.bind = function (root_, hotspots, dynList, o) {
    o = o || {}; O.init(); hoverRoot = root_;
    root_.updateMatrixWorld(true);
    var dyn = (dynList || []).filter(Boolean), c = new T.Vector3(), skip = new Set();
    dyn.forEach(function (d) { d.traverse(function (x) { skip.add(x); }); });
    var inv = new T.Matrix4().copy(root_.matrixWorld).invert(), boxes = [];
    hotspots.forEach(function (h) {
      if (h.userData.hlOwner || h.userData.hlParts) return;
      var b = boxOf(h).expandByScalar(0.05), best = null, bd = 1e9;
      dyn.forEach(function (d) {                                        /* ① 움직이는 물체: 중심이 가장 가까운 것 */
        var db = new T.Box3().setFromObject(d); if (db.isEmpty()) return; db.getCenter(c);
        if (b.containsPoint(c)) { var dist = c.distanceToSquared(b.getCenter(new T.Vector3())); if (dist < bd) { bd = dist; best = d; } }
      });
      if (best) h.userData.hlOwner = best;
      else boxes.push({ h: h, b: b, parts: [], vol: b.getSize(new T.Vector3()).toArray().reduce(function (a, v) { return a * v; }, 1) });
    });
    if (!boxes.length) return;
    root_.traverse(function (m) {                                         /* ② 붙박이 물체: 중심이 들어온 가장 작은 상자에 넣는다 */
      if (skip.has(m) || skippable(m) || !visibleChain(m, root_)) return;
      var g = m.geometry; if (!g.boundingSphere) g.computeBoundingSphere();
      c.copy(g.boundingSphere.center).applyMatrix4(m.matrixWorld);
      var best = null;
      boxes.forEach(function (e) { if (e.b.containsPoint(c) && (!best || e.vol < best.vol)) best = e; });
      if (best) best.parts.push({ geo: lite(g), mat: { isHullMerge: true, vertexColors: false }, matrix: new T.Matrix4().multiplyMatrices(inv, m.matrixWorld) });
    });
    boxes.forEach(function (e) { if (e.parts.length) e.h.userData.hlParts = e.parts; });
  };
  function staticHover(h) {
    if (h.userData.hlMesh) return h.userData.hlMesh;
    var merged = K.mergeParts(h.userData.hlParts)[0].geometry;
    merged.deleteAttribute("uv"); if (merged.attributes.color) merged.deleteAttribute("color");
    merged.setAttribute("normal", new T.BufferAttribute(O.smoothNormals(merged.attributes.position.array, merged.attributes.normal.array), 3));
    merged.computeBoundingSphere();
    var mesh = new T.Mesh(merged, O.hoverMat); mesh.name = "hullHover"; mesh.castShadow = false; mesh.receiveShadow = false;
    mesh.userData.isHull = true; mesh.frustumCulled = false; mesh.renderOrder = 1; mesh.visible = false;
    hoverRoot.add(mesh); h.userData.hlMesh = mesh; h.userData.hlParts = null; return mesh;
  }
  /* t: 가리키는 히트박스(없으면 null). 가까이 있을 때만 켠다. */
  O.hover = function (t) {
    if (!O.mat) return;
    if (hoverObj) { O.highlight(hoverObj, false); hoverObj = null; }
    if (hoverMesh) { hoverMesh.visible = false; hoverMesh = null; }
    if (!t) return;
    var ow = t.userData.hlOwner;
    for (var p = t.parent; !ow && p && p !== hoverRoot; p = p.parent) if (p.userData && p.userData.hulls) ow = p;    /* 문·편지처럼 히트박스가 물체의 자식인 경우 */
    if (ow && ow.userData.hulls && ow.userData.hulls.length) { O.highlight(ow, true); hoverObj = ow; return; }
    if (t.userData.hlParts || t.userData.hlMesh) { hoverMesh = staticHover(t); hoverMesh.visible = true; }
  };
  /* 강조 굵기가 숨 쉬듯 살짝 변한다 */
  O.tick = function (time) { if (O.hoverMat) O.hoverMat.uniforms.uBoost.value = 2.6 + Math.sin(time * 5.5) * 0.3; };
})(window);
