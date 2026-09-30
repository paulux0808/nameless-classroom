import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync, readdirSync, existsSync } from "node:fs";
import { createRequire } from "node:module";
import vm from "node:vm";

const root = new URL("../", import.meta.url);
const read = (p) => readFileSync(new URL(p, root), "utf8");
const require = createRequire(import.meta.url);

test("index.html 이 싣는 스크립트는 모두 존재하고, 게임 파일은 빠짐없이 한 번씩만 실린다", () => {
  const html = read("index.html");
  const srcs = [...html.matchAll(/<script src="([^"]+)"/g)].map((m) => m[1]);
  srcs.forEach((s) => assert.ok(existsSync(new URL(s.replace(/\?.*$/, ""), root)), `없는 파일: ${s}`));
  assert.equal(new Set(srcs).size, srcs.length, "같은 스크립트를 두 번 싣지 않는다");
  const game = [];
  for (const dir of ["", "kit/", "props/", "room/"]) for (const f of readdirSync(new URL(dir, root))) if (f.endsWith(".js") && !/^(main)\.js$/.test(f) || f === "main.js") if (dir || !f.startsWith("dev")) game.push(dir + f);
  game.forEach((f) => assert.ok(srcs.includes(f), `index.html 에 빠진 파일: ${f}`));
  /* 의존 순서 */
  const at = (f) => srcs.indexOf(f);
  const before = (a, b) => assert.ok(at(a) >= 0 && at(a) < at(b), `${a} 는 ${b} 보다 먼저`);
  before("../assets/vendor/three.min.js", "kit/core.js"); before("logic.js", "data.js"); before("data.js", "model.js");
  before("kit/core.js", "kit/geo.js"); before("kit/geo.js", "props/common.js"); before("props/common.js", "props/desk.js");
  before("room/shell.js", "room/layout.js"); before("room/layout.js", "world.js"); before("input.js", "controls.js"); before("ui.js", "screens.js"); before("screens.js", "main.js");
});

test("외부 에셋을 쓰지 않는다: 게임 코드에 모델 로더·이미지·CDN 참조가 없다", () => {
  const files = [];
  for (const dir of ["", "kit/", "props/", "room/"]) for (const f of readdirSync(new URL(dir, root))) if (f.endsWith(".js") && f !== "portraits.js") files.push(dir + f);
  files.push("index.html", "style.css");
  for (const f of files) {
    const src = read(f);
    assert.ok(!/GLTFLoader|\.glb|\.gltf|FBXLoader|OBJLoader|TextureLoader/.test(src), `${f}: 모델/텍스처 로더 참조`);
    assert.ok(!/https?:\/\/(?!en\.dict\.naver\.com)[^\s"']*\.(png|jpe?g|glb|gltf|hdr|exr|woff2?)/i.test(src), `${f}: 외부 파일 URL`);
    assert.ok(!/@import|fonts\.googleapis|cdn\./.test(src), `${f}: 외부 CDN`);
  }
});

test("레이아웃의 모든 핫스팟이 상호작용 처리를 갖는다", () => {
  const layout = read("room/layout.js");
  const ids = [...layout.matchAll(/hot\(\s*"([^"]+)"/g)].map((m) => m[1]);
  assert.ok(ids.length > 28, "핫스팟을 읽지 못함: " + ids.length);
  const ctx = { console, U: require("../logic.js").U, sealCode: require("../logic.js").sealCode };
  ctx.globalThis = ctx; ctx.window = ctx; vm.createContext(ctx);
  vm.runInContext(read("data.js"), ctx);
  const D = ctx.N1Data, inter = read("interact.js");
  const special = new Set(["computer", "diary1obj", "exitdoor", "calendar", "doll", "postit", "teacher", "extinguisher", "clock", "mathbook", "curtain"]);
  const stations = ["stamp", "roster", "tv"];                         /* 퍼즐 자리: interact.js 가 stations 로 넘긴다 */
  for (const id of new Set(ids)) {
    if (id.startsWith("decoy:")) assert.ok(D.DECOY[id.slice(6)] || inter.includes(`DECOY.${id.slice(6)} =`), `말이 없는 소품: ${id}`);
    else if (stations.includes(id)) assert.ok(inter.includes(`id === "${id}"`), `퍼즐 자리 처리 없음: ${id}`);
    else assert.ok(special.has(id) || id.startsWith("frame:") || id.startsWith("note:"), `처리 없는 핫스팟: ${id}`);
  }
  for (const s of ["calendar", "doll", "postit", "teacher", "extinguisher", "clock", "mathbook", "curtain"]) assert.ok(ids.includes(s), `탐색 지점이 배치에 없다: ${s}`);
});

test("게임 코드는 옛 전역(index.html 안의 함수)에 기대지 않는다", () => {
  for (const f of ["ui.js", "screens.js", "interact.js", "world.js", "controls.js", "main.js"]) {
    const src = read(f);
    assert.ok(!/\bshowModal\b|\bopenModal\(|\bhotspots\.push\b/.test(src), `${f}: 옛 모달/핫스팟 API`);
  }
});
