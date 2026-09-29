import test from "node:test";
import assert from "node:assert/strict";
import vm from "node:vm";
import { readFileSync } from "node:fs";

const read = (p) => readFileSync(new URL(p, import.meta.url), "utf8");

/* 카툰 재료(toon.js)와 잉크 윤곽선(outline.js)은 화면 없이도 돌아가는 부분(수학·구조)만 확인한다.
   실제 그려진 모습은 tools/stage1-e2e.mjs 와 스크린샷이 맡는다. */
function load({ search = "", stored = null } = {}) {
  const ctx = { console, Math, URLSearchParams, location: { search }, localStorage: { getItem: (k) => (k === "n1-style" ? stored : null), setItem() {} } };
  ctx.window = ctx; ctx.globalThis = ctx; ctx.self = ctx;
  vm.createContext(ctx);
  vm.runInContext(read("../../assets/vendor/three.min.js"), ctx);
  for (const f of ["kit/core.js", "kit/toon.js", "kit/outline.js"]) vm.runInContext(read("../" + f), ctx, { filename: f });
  return ctx;
}
const ctx = load(), T = ctx.THREE, K = ctx.N1K, TN = K.toon, O = K.outline;
const box = (w = 1, h = 1, d = 1, mat) => new T.Mesh(new T.BoxGeometry(w, h, d), mat || new T.MeshToonMaterial());
const tris = (g) => (g.index ? g.index.count : g.attributes.position.count) / 3;

test("화면 스타일: 기본은 카툰, ?style=real 이 사실적, 잘못된 값은 카툰, 주소가 저장값보다 앞선다", () => {
  assert.equal(load().N1K.style, "toon");
  assert.equal(load({ search: "?style=real" }).N1K.style, "real");
  assert.equal(load({ search: "?style=toon" }).N1K.style, "toon");
  assert.equal(load({ search: "?style=nope" }).N1K.style, "toon");
  assert.equal(load({ stored: "real" }).N1K.style, "real");
  assert.equal(load({ search: "?style=toon", stored: "real" }).N1K.style, "toon");
  assert.equal(load({ stored: "garbage" }).N1K.style, "toon");
  assert.equal(load({ search: "?style=real" }).N1K.isToon(), false);
});

test("K.std: 카툰이면 툰 재질, 사실적이면 표준 재질", () => {
  assert.equal(K.std(0x886644, 0.6, 0).isMeshToonMaterial, true);
  const real = load({ search: "?style=real" });
  assert.equal(real.N1K.std(0x886644, 0.6, 0).isMeshStandardMaterial, true);
});

test("램프: 16칸, 등진 쪽 절반은 0, 위로 갈수록 줄지 않고 끝은 1, 최근접 필터", () => {
  const r = TN.RAMP3;
  assert.equal(r.length, 16);
  assert.ok(r.slice(0, 8).every((v) => v === 0), "등진 쪽은 어둡다");
  for (let i = 1; i < r.length; i++) assert.ok(r[i] >= r[i - 1], `줄어들면 안 된다 @${i}`);
  assert.equal(r[15], 1);
  assert.equal(new Set(r).size, 4, "0 · 그늘 가장자리 · 중간 · 밝음 = 네 값(세 단 명암)");
  const t = TN.ramp(r);
  assert.equal(t.magFilter, T.NearestFilter); assert.equal(t.minFilter, T.NearestFilter);
  assert.equal(t.image.width, 16); assert.equal(t.image.data.length, 64);
  assert.equal(t.image.data[15 * 4], 255); assert.equal(t.image.data[3], 255, "알파는 항상 불투명");
});

test("램프 교체: 칸 수가 같을 때만 제자리에서 바꾼다", () => {
  const shared = TN.sharedRamp();
  assert.equal(TN.sharedRamp(), shared, "공유 램프는 하나");
  const before = Array.from(shared.image.data);
  assert.equal(TN.setRamp([0, 1]), false);
  assert.deepEqual(Array.from(shared.image.data), before, "길이가 다르면 손대지 않는다");
  const alt = Array(16).fill(0.5);
  assert.equal(TN.setRamp(alt), true);
  assert.equal(shared.image.data[0], 128);
  TN.setRamp(TN.RAMP3);
  assert.deepEqual(Array.from(shared.image.data), before, "되돌리면 원래대로");
});

test("색 보정: 밝기·채도는 줄지 않고, 범위를 넘지 않는다", () => {
  const hsl = (c) => { const o = {}; new T.Color(c.r, c.g, c.b).getHSL(o); return o; };
  for (const hex of [0x886644, 0x4a6a58, 0xb0a080, 0x202020, 0xffffff, 0x000000]) {
    const src = new T.Color(hex), out = TN.color(hex);
    for (const v of [out.r, out.g, out.b]) assert.ok(v >= 0 && v <= 1, "0..1");
    const a = {}, b = {}; src.getHSL(a); K.srgb(0).copy(out); new T.Color(out.r, out.g, out.b).convertLinearToSRGB().getHSL(b);
    assert.ok(b.l >= a.l - 1e-6, `밝기: ${hex.toString(16)}`);
  }
});

test("부드러운 법선: 같은 위치의 정점은 같은 법선, 길이 1, 상자는 모서리 방향", () => {
  const g = new T.BoxGeometry(1, 1, 1), n = O.smoothNormals(g.attributes.position.array, g.attributes.normal.array);
  const pos = g.attributes.position.array, seen = new Map();
  for (let i = 0; i < pos.length / 3; i++) {
    const l = Math.hypot(n[i * 3], n[i * 3 + 1], n[i * 3 + 2]); assert.ok(Math.abs(l - 1) < 1e-5, "단위 벡터");
    const key = [pos[i * 3], pos[i * 3 + 1], pos[i * 3 + 2]].map((v) => v.toFixed(3)).join();
    const cur = [n[i * 3], n[i * 3 + 1], n[i * 3 + 2]];
    if (seen.has(key)) assert.deepEqual(cur.map((v) => +v.toFixed(5)), seen.get(key), "같은 위치 = 같은 법선"); else seen.set(key, cur.map((v) => +v.toFixed(5)));
    for (const c of cur) assert.ok(Math.abs(Math.abs(c) - 0.57735) < 1e-4, "상자 모서리는 (±.577,±.577,±.577)");
  }
  assert.equal(seen.size, 8);
});

test("부드러운 법선: 마주 보는 얇은 판은 서로 상쇄돼도 깨지지 않는다(0 벡터를 내지 않는다)", () => {
  const pos = new Float32Array([0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 1, 0]);
  const nor = new Float32Array([0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, -1, 0, 0, -1, 0, 0, -1]);
  const out = O.smoothNormals(pos, nor);
  for (const v of out) assert.ok(Number.isFinite(v));
});

test("껍질을 붙이면 안 되는 것: 히트박스·표식·투명·기본 재질·유리", () => {
  assert.equal(O.skippable(box()), false);
  const hit = box(); hit.userData.isHit = true; assert.equal(O.skippable(hit), true);
  const hot = box(); hot.userData.hot = { id: "x" }; assert.equal(O.skippable(hot), true);
  const no = box(); no.userData.noHull = true; assert.equal(O.skippable(no), true);
  const glass = box(1, 1, 1, new T.MeshToonMaterial({ transparent: true, opacity: 0.3 })); assert.equal(O.skippable(glass), true);
  const basic = box(1, 1, 1, new T.MeshBasicMaterial()); assert.equal(O.skippable(basic), true);
  const sh = box(); sh.name = "shaft"; assert.equal(O.skippable(sh), true);
  assert.equal(O.skippable(new T.Object3D()), true);
});

test("붙박이 껍질: 사분면으로 나누고, 제외·이름·히트박스·투명은 뺀다", () => {
  const root = new T.Group(), ex = new T.Group();
  [[-1, -1], [1, -1], [-1, 1], [1, 1]].forEach(([x, z]) => { const m = box(); m.position.set(x * 2, 0.5, z * 2); root.add(m); });
  const twin = box(); twin.position.set(-2.4, 0.5, -2.2); root.add(twin);             /* 같은 사분면에 하나 더 */
  const moving = box(); moving.position.set(3, 0.5, 3); ex.add(moving); root.add(ex);
  const named = box(); named.name = "platformTop"; named.position.set(0, 0, 0); root.add(named);
  const hit = box(); hit.userData.isHit = true; root.add(hit);
  const glass = box(1, 1, 1, new T.MeshToonMaterial({ transparent: true, opacity: 0.2 })); root.add(glass);
  const info = O.buildStatic(root, { exclude: [ex], skipNames: ["platformTop"] });
  assert.equal(info.meshes, 5, "네 모서리 + 쌍둥이");
  assert.equal(info.groups, 4, "사분면 넷");
  assert.equal(info.tris, 5 * 12);
  info.list.forEach((h) => { assert.equal(h.userData.isHull, true); assert.equal(h.castShadow, false); assert.ok(h.geometry.boundingSphere, "컬링용 경계구"); assert.ok(!h.geometry.attributes.uv, "uv 는 버린다"); });
  assert.equal(root.children.filter((c) => c.name === "hullStatic").length, 4, "껍질은 root 의 자식으로 붙는다");
});

test("붙박이 껍질: 작은 물건 컷(minRadius)과 삼각형 통계", () => {
  const root = new T.Group();
  const big = box(1, 1, 1), tiny = new T.Mesh(new T.SphereGeometry(0.005, 8, 6), new T.MeshToonMaterial());
  big.position.set(1, 0, 1); tiny.position.set(-1, 0, 1); root.add(big, tiny);
  const keep = O.buildStatic(root, {}), cut = O.buildStatic(root, { minRadius: 0.02 });
  assert.equal(keep.meshes, 2); assert.equal(cut.meshes, 1); assert.equal(cut.dropped, 1);
  assert.ok(keep.hist.r1 > 0 && keep.hist.big > 0);
});

test("움직이는 물체 껍질: mesh · rigid · parent 방식의 개수", () => {
  const mk = () => {
    const obj = new T.Group(), armA = new T.Group(), armB = new T.Group();
    [armA, armB].forEach((g, i) => { g.position.x = i; obj.add(g); });
    const parts = [box(), box(), box()]; parts[0].position.y = 0; parts[1].position.y = 1; armA.add(parts[0], parts[1]); armB.add(parts[2]);
    const lid = box(); lid.userData.animated = true; armB.add(lid);
    return { obj, parts, lid };
  };
  const a = mk(); O.attach(a.obj);
  assert.equal(a.obj.userData.hullSets.length, 4, "mesh: 메시마다");
  const b = mk(); O.attach(b.obj, { mode: "rigid" });
  assert.equal(b.obj.userData.hullSets.length, 1, "rigid: 통째로 하나");
  assert.equal(b.obj.children.length, 3, "hull 이 obj 의 자식으로 붙는다(관절 2 + hull 1)");
  const c = mk(); O.attach(c.obj, { mode: "parent" });
  assert.equal(c.obj.userData.hullSets.length, 3, "parent: (armA 두 개 → 1) + (armB 하나 → 1) + animated 따로 1");
  const merged = c.obj.userData.hullSets.find((s) => s.parent === c.obj.children[0]);
  assert.equal(tris(merged.geo), 24, "armA 의 상자 둘이 한 지오메트리로");
  assert.ok(c.lid.children.some((h) => h.userData.isHull), "깜빡이는 눈꺼풀은 자기 껍질을 가진다");
});

test("움직이는 물체 껍질: 병합 위치가 부모 기준이라 물체를 움직이면 껍질도 따라간다", () => {
  const obj = new T.Group(); obj.position.set(5, 0, 5);
  const a = box(), b = box(); a.position.set(0, 0, 0); b.position.set(0, 2, 0); obj.add(a, b);
  obj.updateMatrixWorld(true);
  O.attach(obj, { mode: "rigid" });
  const geo = obj.userData.hullSets[0].geo; geo.computeBoundingBox();
  assert.ok(Math.abs(geo.boundingBox.min.y + 0.5) < 1e-6 && Math.abs(geo.boundingBox.max.y - 2.5) < 1e-6, "obj 좌표계 기준");
  assert.ok(Math.abs(geo.boundingBox.min.x + 0.5) < 1e-6, "obj 의 월드 위치(5,0,5)가 섞이지 않는다");
});

test("강조: 처음 켤 때 후광을 만들고, 끄면 숨긴다. 후광은 잉크보다 먼저 그려진다", () => {
  const obj = new T.Group(); obj.add(box(), box()); O.attach(obj);
  assert.ok(obj.userData.hullSets.every((s) => !s.halo), "처음엔 후광 없음(메모리 절약)");
  O.highlight(obj, false); assert.ok(obj.userData.hullSets.every((s) => !s.halo), "끄기만 해서는 만들지 않는다");
  O.highlight(obj, true);
  obj.userData.hullSets.forEach((s) => { assert.ok(s.halo && s.halo.visible); assert.equal(s.halo.material, O.hoverMat); assert.ok(s.halo.renderOrder < s.ink.renderOrder, "후광이 먼저"); assert.equal(s.halo.geometry, s.ink.geometry, "지오메트리 공유"); });
  O.highlight(obj, false); assert.ok(obj.userData.hullSets.every((s) => !s.halo.visible));
});

test("히트박스 짝짓기: 움직이는 물체는 위치로, 붙박이는 위치로 모아 두었다가 처음 가리킬 때 껍질을 만든다", () => {
  const root = new T.Group(), dyn = new T.Group(), hotMat = new T.MeshBasicMaterial();
  const dynMesh = box(0.4, 0.4, 0.4); dyn.add(dynMesh); dyn.position.set(2, 1, 0); root.add(dyn);
  const stat = box(0.6, 0.6, 0.6); stat.position.set(-2, 1, 0); root.add(stat);
  const far = box(0.5, 0.5, 0.5); far.position.set(-2, 1, 3); root.add(far);           /* 어느 히트박스에도 안 들어간다 */
  const hotDyn = new T.Mesh(new T.BoxGeometry(1, 1, 1), hotMat); hotDyn.position.set(2, 1, 0); hotDyn.userData.hot = { id: "d" }; hotDyn.userData.isHit = true; root.add(hotDyn);
  const hotStat = new T.Mesh(new T.BoxGeometry(1, 1, 1), hotMat); hotStat.position.set(-2, 1, 0); hotStat.userData.hot = { id: "s" }; hotStat.userData.isHit = true; root.add(hotStat);
  const hotNone = new T.Mesh(new T.BoxGeometry(1, 1, 1), hotMat); hotNone.position.set(9, 1, 9); hotNone.userData.hot = { id: "n" }; hotNone.userData.isHit = true; root.add(hotNone);
  O.attach(dyn, { mode: "rigid" });
  O.bind(root, [hotDyn, hotStat, hotNone], [dyn]);
  assert.equal(hotDyn.userData.hlOwner, dyn, "움직이는 물체와 짝");
  assert.ok(hotStat.userData.hlParts && hotStat.userData.hlParts.length === 1, "붙박이 메시 하나를 모아 둔다");
  assert.ok(!hotNone.userData.hlOwner && !hotNone.userData.hlParts, "짝이 없으면 아무것도 안 한다");

  O.hover(hotDyn);
  assert.ok(dyn.userData.hullSets[0].halo.visible, "움직이는 물체 후광 켜짐");
  O.hover(hotStat);
  assert.ok(!dyn.userData.hullSets[0].halo.visible, "다른 것을 가리키면 이전 것은 꺼진다");
  const hv = root.children.find((c) => c.name === "hullHover");
  assert.ok(hv && hv.visible && hv.material === O.hoverMat, "붙박이는 처음 가리킬 때 껍질이 생긴다");
  O.hover(hotStat); assert.equal(root.children.filter((c) => c.name === "hullHover").length, 1, "다시 가리켜도 새로 만들지 않는다");
  O.hover(null); assert.ok(!hv.visible, "가리키지 않으면 꺼진다");
  O.hover(hotNone); assert.ok(!hv.visible && !dyn.userData.hullSets[0].halo.visible, "짝 없는 히트박스는 켜지지 않는다");
});

test("히트박스가 물체의 자식인 경우(문·편지): 부모 사슬에서 껍질을 찾는다", () => {
  const root = new T.Group(), holder = new T.Group(), hit = new T.Mesh(new T.BoxGeometry(1, 1, 1), new T.MeshBasicMaterial());
  hit.userData.hot = { id: "reward:1" }; hit.userData.isHit = true; holder.add(box(), hit); root.add(holder);
  O.attach(holder, { mode: "rigid" }); O.bind(root, [], []);
  O.hover(hit);
  assert.ok(holder.userData.hullSets[0].halo && holder.userData.hullSets[0].halo.visible);
  O.hover(null);
});

test("두께 유니폼: 화면 크기와 배율(DPR)로 정해지고, 최소는 1픽셀보다 굵다", () => {
  O.init();
  O.setSize(1280, 720, 2);
  const u = O.mat.uniforms;
  assert.equal(u.uView.value.x, 2560); assert.equal(u.uView.value.y, 1440);
  assert.ok(u.uMinPx.value >= 2 && u.uMaxPx.value > u.uMinPx.value, "DPR 2 에서는 장치 픽셀로 두 배");
  O.setSize(0, 0, 0); assert.ok(u.uView.value.x >= 1 && u.uView.value.y >= 1, "0 크기에도 0 으로 나누지 않는다");
  assert.ok(O.hoverMat.uniforms.uBoost.value > O.mat.uniforms.uBoost.value, "강조는 잉크보다 굵다");
  assert.equal(O.mat.side, T.BackSide);
});
