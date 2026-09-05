import test from "node:test";
import assert from "node:assert/strict";
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
const L = require("../logic.js");

test("norm은 영숫자만 남기고 소문자로 접는다", () => {
  assert.equal(L.norm(" A b-1 "), "ab1");
  assert.equal(L.norm("E=mc²"), "emc");
  assert.equal(L.norm(null), "");
  assert.equal(L.norm(undefined), "");
});

test("answerCode는 영숫자 입력만 통과시킨다", () => {
  assert.equal(L.answerCode("Ab1"), "ab1");
  assert.equal(L.answerCode("  HAWKING "), "hawking");
  assert.equal(L.answerCode("a b"), null);
  assert.equal(L.answerCode("한글"), null);
  assert.equal(L.answerCode(""), null);
  assert.equal(L.answerCode(null), null);
});

test("sealCode는 안정적이고 키에 따라 갈라진다", () => {
  assert.equal(L.sealCode("mathbook", 27), "1wldqkb");
  assert.equal(L.sealCode("mathbook", 27), L.sealCode("MATH BOOK", 27));
  assert.notEqual(L.sealCode("mathbook", 27), L.sealCode("mathbook", 28));
});

test("챕터별 탐색 지점 해시가 데이터와 일치한다", () => {
  const spots = {
    1: ["calendar", "jf22j7"], 2: ["doll", "x48pwz"], 3: ["postit", "sop6b1"],
    4: ["teacher", "1ljmtw0"], 5: ["extinguisher", "sberz"], 6: ["clock", "1tavec2"],
    7: ["mathbook", "1wldqkb"], 8: ["curtain", "5v1dhi"]
  };
  for (const [n, [id, expected]] of Object.entries(spots)) {
    assert.equal(L.sealCode(id, Number(n) + 20), expected, `chapter ${n} (${id})`);
  }
});

test("stackOrder와 finalName이 기대값을 복원한다", () => {
  assert.deepEqual(L.stackOrder(), [2, 4, 3, 1, 6, 8, 5, 7]);
  assert.equal(new Set(L.stackOrder()).size, 8);
  assert.equal(L.finalName(), "STEPHEN WILLIAM HAWKING");
  assert.equal(L.norm(L.finalName()), "stephenwilliamhawking");
});

test("bandOf는 stackOrder 상의 위치를 돌려준다", () => {
  assert.equal(L.bandOf(2), 0);
  assert.equal(L.bandOf(7), 7);
  assert.equal(L.bandOf(99), -1);
});

test("rotSig는 4번 돌면 제자리로 온다", () => {
  const sig = [1, 1, 1, 0];
  assert.deepEqual(L.rotSig(sig, 0), sig);
  assert.deepEqual(L.rotSig(sig, 1), [0, 1, 1, 1]);
  assert.deepEqual(L.rotSig(sig, 4), sig);
  assert.deepEqual(L.rotSig(sig, -1), L.rotSig(sig, 3));
  assert.deepEqual(sig, [1, 1, 1, 0], "원본을 건드리지 않는다");
});

test("canStand는 방 경계와 가구를 막는다", () => {
  const B = L.buildBlocks();
  assert.ok(L.canStand(B, 0, 2.5));
  assert.ok(!L.canStand(B, 0, -2.21), "앞벽 바깥");
  assert.ok(!L.canStand(B, -4.41, 0), "왼쪽 벽 바깥");
  assert.ok(!L.canStand(B, 0, -0.5), "책상 안");
  assert.ok(!L.canStand(B, 0, -2.9), "교탁 안");
});

test("collisionNormal의 경계가 canStand와 어긋나지 않는다", () => {
  const B = L.buildBlocks();
  // canStand가 막는 지점에는 반드시 법선이 있어야 미끄러질 수 있다
  for (const [x, z] of [[0, -2.25], [0, 3.55], [-4.45, 0], [4.45, 0]]) {
    assert.ok(!L.canStand(B, x, z), `(${x},${z})는 막혀야 한다`);
    assert.ok(L.collisionNormal(B, x, z), `(${x},${z})에 법선이 없어 미끄러지지 못한다`);
  }
});

test("slideMove는 벽을 뚫지 않고 접선으로 미끄러진다", () => {
  const B = L.buildBlocks();
  const p = { x: 0, z: -2.0 };
  for (let i = 0; i < 40; i++) L.slideMove(B, p, 0.06, -0.06);
  assert.ok(L.canStand(B, p.x, p.z), "이동 결과가 항상 서 있을 수 있는 지점이어야 한다");
  assert.ok(p.x > 0.5, "앞벽을 따라 옆으로 미끄러져야 한다");
});

test("slideMove는 어떤 방향으로 밀어도 방을 벗어나지 않는다", () => {
  const B = L.buildBlocks();
  for (let a = 0; a < 32; a++) {
    const th = (a / 32) * Math.PI * 2;
    const p = { x: 0, z: 2.5 };
    for (let i = 0; i < 60; i++) L.slideMove(B, p, Math.cos(th) * 0.09, Math.sin(th) * 0.09);
    assert.ok(L.canStand(B, p.x, p.z), `각도 ${a}에서 벽을 벗어났다: ${p.x},${p.z}`);
  }
});

test("damp는 프레임 시간에 관계없이 같은 속도를 낸다", () => {
  // 60fps 한 프레임 = 120fps 두 프레임과 같은 진행이어야 한다
  const k = 0.22;
  let a = 1, b = 1;
  a *= 1 - L.damp(k, 1 / 60);
  b *= 1 - L.damp(k, 1 / 120);
  b *= 1 - L.damp(k, 1 / 120);
  assert.ok(Math.abs(a - b) < 1e-12, `${a} vs ${b}`);
  assert.equal(L.damp(k, 0), k, "dt가 없으면 기존 계수를 그대로 쓴다");
});
