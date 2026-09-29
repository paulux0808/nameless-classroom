/* N1K.toon — 카툰(셀 셰이딩) 렌더링의 재료.
   · 스타일: K.style = "toon"(기본) | "real"(사실적). ?style= 또는 저장된 선택(n1-style)이 정한다.
   · 툰 재질: MeshToonMaterial + 계단 램프. 빛이 3~4단으로 끊겨 만화 같은 명암이 된다.
     그림자 쪽은 램프의 첫 칸(0)이라 어둡고, 환경 반사(IBL)·거칠기·금속성은 쓰지 않는다.
   · 색: 채도를 올리고 밝기 곡선을 살짝 눌러 "그려진" 색으로 바꾼다(toonColor).
   · 텍스처: 살짝 뭉개고 색 단계를 줄여 붓으로 칠한 듯하게 한다(toonify). 범프는 쓰지 않는다.
   · 반짝임·테두리빛: 재질별로 굳은 하이라이트(spec)와 림(rim)을 셰이더에 얹는다(patch).
   외부 이미지는 하나도 없다. 램프도 코드가 만드는 4×1 데이터 텍스처다. */
(function (root) {
  "use strict";
  var T = root.THREE, K = root.N1K, TN = K.toon = {};

  /* 스타일 선택: 주소 ?style= → 저장값 → 기본(카툰) */
  (function pick() {
    var s = null;
    try { s = new URLSearchParams(root.location.search).get("style"); } catch (e) {}
    if (!s) { try { s = root.localStorage.getItem("n1-style"); } catch (e) {} }
    K.style = (s === "real" || s === "toon") ? s : "toon";
  })();
  K.isToon = function () { return K.style === "toon"; };
  K.setStyle = function (s) { try { root.localStorage.setItem("n1-style", s); } catch (e) {} };

  /* ── 계단 램프 ───────────────────────────────────────────────────────
     좌표 = dot(N,L)*0.5+0.5. 등지면(<0.5)은 어둡게, 경계 부근은 중간톤, 정면은 완전히 밝게. */
  TN.ramp = function (stops) {
    var st = stops || [0.0, 0.34, 0.74, 1.0], data = new Uint8Array(st.length * 4);
    for (var i = 0; i < st.length; i++) { var v = Math.round(K.clamp(st[i], 0, 1) * 255); data[i * 4] = data[i * 4 + 1] = data[i * 4 + 2] = v; data[i * 4 + 3] = 255; }
    var t = new T.DataTexture(data, st.length, 1, T.RGBAFormat);
    t.minFilter = t.magFilter = T.NearestFilter; t.generateMipmaps = false; t.needsUpdate = true;
    return t;
  };
  /* 텍스처 좌표 = dot(N,L)*0.5+0.5 이므로 16칸이면 한 칸이 dot 0.125. 앞 8칸이 등진 쪽(어두움),
     그 다음이 그늘 가장자리(0.42) → 중간(0.75) → 밝은 면(1.0): 세 단 명암이 또렷하게 선다. */
  TN.RAMP3 = [0, 0, 0, 0, 0, 0, 0, 0, 0.42, 0.42, 0.75, 0.75, 0.75, 1, 1, 1];
  TN.rampMain = function () { return TN.ramp(TN.RAMP3); };
  var _ramp = null;
  TN.sharedRamp = function () { return _ramp || (_ramp = TN.rampMain()); };
  /* 제자리 교체(다듬을 때 쓴다): 칸 수가 같으면 데이터만 바꾼다 */
  TN.setRamp = function (stops) {
    var t = TN.sharedRamp(), d = t.image.data;
    if (stops.length * 4 !== d.length) return false;
    for (var i = 0; i < stops.length; i++) { var v = Math.round(K.clamp(stops[i], 0, 1) * 255); d[i * 4] = d[i * 4 + 1] = d[i * 4 + 2] = v; }
    t.needsUpdate = true; return true;
  };

  /* ── 색 ──────────────────────────────────────────────────────────────
     sRGB hex → HSL 에서 채도 ×s, 밝기를 (l*a+b)로. 그림 같은 색이 되도록 살짝 진하고 맑게. */
  var _c = new T.Color(), _h = { h: 0, s: 0, l: 0 };
  TN.color = function (hex, o) {
    o = o || {};
    _c.setHex(hex); _c.getHSL(_h);
    var s = K.clamp(_h.s * (o.sat == null ? 1.2 : o.sat) + (o.sadd == null ? 0.05 : o.sadd), 0, 1), l = K.clamp(_h.l * (o.lmul == null ? 1.14 : o.lmul) + (o.ladd == null ? 0.07 : o.ladd), 0, 1);
    _c.setHSL(_h.h, s, l); var out = _c.getHex();
    return K.srgb(out);
  };

  /* ── 텍스처 단순화 ────────────────────────────────────────────────────
     canvas 를 제자리에서 바꾼다.
     ① 작은 상자 흐림(가장자리는 감아 돌아 타일링이 깨지지 않는다)
     ② 밝기 편차를 줄이고(contrast) 살짝 밝힌 뒤(gamma), 평균 밝기를 기준으로 몇 단(step)으로 끊는다
     ③ 색은 원래 색의 비율 그대로 밝기만 바꿔 색조가 틀어지지 않는다(채널별로 끊으면 베이지가 분홍이 된다)
     ④ 채도 살짝 ↑ */
  TN.toonify = function (canvas, o) {
    o = o || {};
    var w = canvas.width, h = canvas.height, ctx = canvas.getContext("2d"), img = ctx.getImageData(0, 0, w, h), d = img.data, N = w * h;
    var rad = o.blur == null ? Math.max(1, Math.round(Math.min(w, h) / 400)) : o.blur;
    var contrast = o.contrast == null ? 0.78 : o.contrast, gamma = o.gamma == null ? 0.84 : o.gamma, stepD = o.step == null ? 24 : o.step, sat = o.sat == null ? 1.14 : o.sat;
    var x, y, k, i, s0, s1, s2, n = rad * 2 + 1;
    if (rad > 0) {
      var tmp = new Uint8ClampedArray(d.length);
      for (y = 0; y < h; y++) for (x = 0; x < w; x++) {
        s0 = s1 = s2 = 0; for (k = -rad; k <= rad; k++) { i = (y * w + ((x + k + w) % w)) * 4; s0 += d[i]; s1 += d[i + 1]; s2 += d[i + 2]; }
        i = (y * w + x) * 4; tmp[i] = s0 / n; tmp[i + 1] = s1 / n; tmp[i + 2] = s2 / n; tmp[i + 3] = d[i + 3];
      }
      for (y = 0; y < h; y++) for (x = 0; x < w; x++) {
        s0 = s1 = s2 = 0; for (k = -rad; k <= rad; k++) { i = (((y + k + h) % h) * w + x) * 4; s0 += tmp[i]; s1 += tmp[i + 1]; s2 += tmp[i + 2]; }
        i = (y * w + x) * 4; d[i] = s0 / n; d[i + 1] = s1 / n; d[i + 2] = s2 / n;
      }
    }
    var mean = 0; for (i = 0; i < d.length; i += 4) mean += 0.299 * d[i] + 0.587 * d[i + 1] + 0.114 * d[i + 2]; mean /= N;
    for (i = 0; i < d.length; i += 4) {
      var r = d[i], g = d[i + 1], b = d[i + 2], lum = 0.299 * r + 0.587 * g + 0.114 * b;
      var lc = mean + (lum - mean) * contrast, lg = 255 * Math.pow(K.clamp(lc, 0, 255) / 255, gamma);
      var mg = 255 * Math.pow(K.clamp(mean, 0, 255) / 255, gamma), lq = mg + Math.round((lg - mg) / stepD) * stepD, kk = lq / Math.max(lum, 8);
      r *= kk; g *= kk; b *= kk;
      var l2 = 0.299 * r + 0.587 * g + 0.114 * b; r = l2 + (r - l2) * sat; g = l2 + (g - l2) * sat; b = l2 + (b - l2) * sat;
      d[i] = r < 0 ? 0 : r > 255 ? 255 : r; d[i + 1] = g < 0 ? 0 : g > 255 ? 255 : g; d[i + 2] = b < 0 ? 0 : b > 255 ? 255 : b;
    }
    ctx.putImageData(img, 0, 0);
    return canvas;
  };

  /* ── 셰이더 패치: 굳은 하이라이트(spec)와 림(rim) ─────────────────────
     모든 툰 재질이 같은 패치를 써서 프로그램이 하나로 공유된다. 값은 재질마다 유니폼으로 다르다.
     spec: 0..1 세기, shine: 하이라이트 크기 지수, rim: 0..1 테두리빛 세기 */
  var patched = "n1toon";
  TN.patch = function (m, p) {
    p = p || {};
    m.userData.toonSpec = p.spec || 0; m.userData.toonShine = p.shine || 36; m.userData.toonRim = p.rim == null ? 0.0 : p.rim;
    m.onBeforeCompile = function (sh) {
      sh.uniforms.uSpec = { value: m.userData.toonSpec }; sh.uniforms.uShine = { value: m.userData.toonShine }; sh.uniforms.uRim = { value: m.userData.toonRim };
      sh.uniforms.uRimCol = { value: TN.rimColor };
      sh.fragmentShader = sh.fragmentShader
        .replace("void main() {", "uniform float uSpec; uniform float uShine; uniform float uRim; uniform vec3 uRimCol;\nvoid main() {")
        .replace("vec3 outgoingLight = reflectedLight.directDiffuse + reflectedLight.indirectDiffuse + totalEmissiveRadiance;",
          "vec3 outgoingLight = reflectedLight.directDiffuse + reflectedLight.indirectDiffuse + totalEmissiveRadiance;\n" +
          "vec3 vDir = normalize(vViewPosition);\n" +
          "#if NUM_DIR_LIGHTS > 0\n" +
          "  if (uSpec > 0.001) { vec3 hv = normalize(directionalLights[0].direction + vDir); float sp = pow(max(dot(normal, hv), 0.0), uShine); outgoingLight += directionalLights[0].color * smoothstep(0.42, 0.5, sp) * uSpec * step(0.001, reflectedLight.directDiffuse.r + reflectedLight.directDiffuse.g + reflectedLight.directDiffuse.b); }\n" +
          "#endif\n" +
          "if (uRim > 0.001) { float rm = 1.0 - max(dot(normal, vDir), 0.0); outgoingLight += uRimCol * smoothstep(0.62, 0.7, rm) * uRim * (0.35 + 0.65 * dot(outgoingLight, vec3(0.333))); }");
    };
    m.customProgramCacheKey = function () { return patched; };
    return m;
  };
  TN.rimColor = new T.Color(1.0, 0.86, 0.66);   /* 따뜻한 테두리빛 (조명 프리셋이 바꿀 수 있다) */

  /* 재질 하나를 만든다. K.std 가 카툰일 때 이 함수로 온다. */
  TN.material = function (hex, rough, metal, o) {
    o = o || {};
    var m = new T.MeshToonMaterial({ color: TN.color(hex, o.toon), gradientMap: TN.sharedRamp() });
    if (o.map) m.map = o.map;
    if (o.emissive != null) { m.emissive = K.srgb(o.emissive); m.emissiveIntensity = o.ei == null ? 1 : o.ei; }
    if (o.side != null) m.side = o.side;
    if (o.opacity != null && o.opacity < 1) { m.transparent = true; m.opacity = o.opacity; }
    if (o.vc) m.vertexColors = true;
    /* 금속·니스는 굳은 하이라이트를 준다. 거칠기가 낮을수록(반들할수록) 세다. */
    var shiny = K.clamp((1 - (rough == null ? 0.7 : rough)) * 0.55 + (metal || 0) * 0.5, 0, 1);
    var spec = o.spec != null ? o.spec : (shiny > 0.22 ? shiny : 0);
    return TN.patch(m, { spec: spec, shine: o.shine || (metal > 0.5 ? 60 : 34), rim: o.rim == null ? 0.0 : o.rim });
  };
})(window);
