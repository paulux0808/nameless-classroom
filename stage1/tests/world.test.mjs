import test from "node:test";
import assert from "node:assert/strict";
import vm from "node:vm";
import { readFileSync } from "node:fs";

const read = (p) => readFileSync(new URL(p, import.meta.url), "utf8");

/* world.js 는 화면 없이 수학만 확인한다: 필요한 전역을 최소로 채워 로드한다 */
function loadWorld() {
  const ctx = { console, Math };
  ctx.window = ctx; ctx.globalThis = ctx; ctx.self = ctx;
  vm.createContext(ctx);
  vm.runInContext(read("../../assets/vendor/three.min.js"), ctx);
  ctx.N1K = { anim: {} }; ctx.N1P = {}; ctx.N1R = { DIM: {} };
  vm.runInContext(read("../world.js"), ctx, { filename: "world.js" });
  return ctx;
}
const ctx = loadWorld(), T = ctx.THREE, W = ctx.N1W;
const near = (a, b, m) => assert.ok(a.distanceTo(new T.Vector3(...b)) < 1e-6, `${m}: ${a.toArray().map((v) => v.toFixed(3))} ≠ ${b}`);

/* 편지는 납작한 판이다: 로컬 +Y 가 표면 법선, 로컬 -Z 가 글자의 '위쪽' */
function frame(n, up, roll = 0) {
  const o = new T.Object3D(); W.orient(o, n, up, roll); o.updateMatrixWorld(true);
  const y = new T.Vector3(0, 1, 0).applyQuaternion(o.quaternion), top = new T.Vector3(0, 0, -1).applyQuaternion(o.quaternion), right = new T.Vector3(1, 0, 0).applyQuaternion(o.quaternion);
  return { y, top, right };
}

test("책상 위 편지: 법선은 위, 글자 위쪽은 칠판 쪽(-z), 오른쪽은 +x", () => {
  const f = frame([0, 1, 0], [0, 0, -1]);
  near(f.y, [0, 1, 0], "법선"); near(f.top, [0, 0, -1], "위쪽"); near(f.right, [1, 0, 0], "오른쪽");
});

test("책상 밑 편지: 법선은 아래, 위쪽은 +z(자리에 앉은 쪽에서 읽힌다)", () => {
  const f = frame([0, -1, 0], [0, 0, 1]);
  near(f.y, [0, -1, 0], "법선"); near(f.top, [0, 0, 1], "위쪽"); near(f.right, [1, 0, 0], "오른쪽");
});

test("앞벽 편지(교사 뒤·시계 뒤): 방 안쪽(+z)을 보고 글자는 바로 선다", () => {
  const f = frame([0, 0, 1], [0, 1, 0]);
  near(f.y, [0, 0, 1], "법선"); near(f.top, [0, 1, 0], "위쪽"); near(f.right, [1, 0, 0], "오른쪽");
});

test("뒷벽 편지(소화기 뒤): 방 안쪽(-z)을 보고 글자는 거꾸로 서지 않는다", () => {
  const f = frame([0, 0, -1], [0, 1, 0]);
  near(f.y, [0, 0, -1], "법선"); near(f.top, [0, 1, 0], "위쪽"); near(f.right, [-1, 0, 0], "오른쪽(밖에서 안을 볼 때 좌우가 뒤집힌다)");
});

test("커튼 위 편지(서쪽 창): +x 를 보고 바로 선다", () => {
  const f = frame([1, 0, 0], [0, 1, 0]);
  near(f.y, [1, 0, 0], "법선"); near(f.top, [0, 1, 0], "위쪽"); near(f.right, [0, 0, -1], "오른쪽");
});

test("roll 은 법선 축을 도는 살짝 삐뚤어짐이라 법선은 그대로다", () => {
  const f = frame([0, 0, 1], [0, 1, 0], 0.2);
  near(f.y, [0, 0, 1], "법선");
  assert.ok(Math.abs(f.top.angleTo(new T.Vector3(0, 1, 0)) - 0.2) < 1e-6, "위쪽이 roll 만큼 기운다");
});
