import test from "node:test";
import assert from "node:assert/strict";
import vm from "node:vm";
import { readFileSync } from "node:fs";

/* 1인칭 컨트롤러를 가짜 DOM(캔버스·창) 위에서 돌려 본다. three.js 는 실제 벡터·레이캐스터를 쓴다. */
const read = (p) => readFileSync(new URL(p, import.meta.url), "utf8");

function makeEnv() {
  const winL = {}, cvL = {};
  const cv = {
    classList: { add() {}, remove() {} },
    getBoundingClientRect: () => ({ left: 0, top: 0, width: 800, height: 600 }),
    addEventListener: (t, f) => { (cvL[t] = cvL[t] || []).push(f); }, setPointerCapture() {}
  };
  const ctx = { console, Math, performance: { now: () => 0 }, navigator: { maxTouchPoints: 0 }, document: { activeElement: null } };
  ctx.window = ctx; ctx.globalThis = ctx; ctx.self = ctx;
  ctx.addEventListener = (t, f) => { (winL[t] = winL[t] || []).push(f); };
  vm.createContext(ctx);
  for (const f of ["../../assets/vendor/three.min.js", "../logic.js", "../kit/core.js", "../input.js", "../controls.js"]) vm.runInContext(read(f), ctx, { filename: f });
  const T = ctx.THREE;
  const cam = new T.PerspectiveCamera(60, 800 / 600, 0.05, 80); cam.position.set(0, 1.6, 0);
  const log = { picks: [], far: [], crouch: [], hover: [] };
  const hs = [];
  const C = ctx.N1C.create({ canvas: cv, camera: cam, hotspots: hs, blocked: () => log.blocked === true,
    onPick: (t) => log.picks.push(t.userData.hot.id), onTooFar: (t) => log.far.push(t.userData.hot.id), onCrouch: (on) => log.crouch.push(on),
    onHover: (t, far) => log.hover.push([t && t.userData.hot.id, far]) });
  const fire = (t, e) => (winL[t] || []).forEach((f) => f(Object.assign({ preventDefault() {}, stopPropagation() {} }, e)));
  const hot = (id, x, y, z) => { const m = new T.Mesh(new T.BoxGeometry(0.4, 0.4, 0.4)); m.position.set(x, y, z); m.userData.hot = { id, name: id }; m.layers.set(1); hs.push(m); m.updateMatrixWorld(true); return m; };
  const fireCv = (t, e) => (cvL[t] || []).forEach((f) => f(Object.assign({ preventDefault() {}, stopPropagation() {}, pointerType: "touch", button: 0 }, e)));
  return { ctx, T, cam, C, log, fire, fireCv, hot, hs, cvL, winL };
}

test("W 를 누르면 시선 방향으로 걷고, 떼면 감속해서 멈춘다", () => {
  const { C, cam, fire } = makeEnv();
  C.setView(1.15, 3.0, Math.PI, 0);                  /* 책상 사이 통로에서 시작, yaw π = -z 쪽 */
  fire("keydown", { key: "w", code: "KeyW" });
  for (let i = 0; i < 20; i++) C.update(0.05, i * 0.05);
  assert.ok(cam.position.z < 1.0, "앞(-z)으로 이동: " + cam.position.z);
  assert.ok(Math.abs(cam.position.x - 1.15) < 0.05, "옆으로 새지 않는다: " + cam.position.x);
  fire("keyup", { key: "w", code: "KeyW" });
  for (let i = 0; i < 40; i++) C.update(0.05, 1 + i * 0.05);
  const z = cam.position.z; C.update(0.05, 3); assert.ok(Math.abs(cam.position.z - z) < 1e-3, "멈춘다");
});

test("한글 입력기(ㅈ)와 방향키도 같은 이동으로 읽는다", () => {
  const { C, cam, fire } = makeEnv();
  C.setView(1.15, 3.0, Math.PI, 0);
  fire("keydown", { key: "ㅈ", code: "KeyW" }); for (let i = 0; i < 10; i++) C.update(0.05, i); fire("keyup", { key: "ㅈ", code: "KeyW" });
  assert.ok(cam.position.z < 2.8);
  const z1 = cam.position.z; C.clearInput();
  fire("keydown", { key: "ArrowDown", code: "ArrowDown" }); for (let i = 0; i < 10; i++) C.update(0.05, i); fire("keyup", { key: "ArrowDown", code: "ArrowDown" });
  assert.ok(cam.position.z > z1, "뒤로 물러난다: " + z1 + " → " + cam.position.z);
});

test("잠기면(패널·인트로·엔딩) 이동과 조사가 모두 멈춘다", () => {
  const { C, cam, fire, log, hot } = makeEnv();
  hot("calendar", 1.15, 1.6, 1.5);
  C.setView(1.15, 3.0, Math.PI, 0);
  log.blocked = true;
  fire("keydown", { key: "w", code: "KeyW" }); for (let i = 0; i < 20; i++) C.update(0.05, i);
  assert.equal(cam.position.z, 3.0, "잠긴 동안은 움직이지 않는다");
  fire("keydown", { key: "e", code: "KeyE" });
  assert.deepEqual(log.picks, []);
  log.blocked = false;
  fire("keydown", { key: "e", code: "KeyE" });
  assert.deepEqual(log.picks, ["calendar"], "풀리면 화면 가운데 물건을 조사한다");
});

test("손이 닿는 거리(3m)를 넘으면 '더 가까이'로 처리한다", () => {
  const { C, fire, log, hot } = makeEnv();
  hot("near", 1.15, 1.6, 1.0); hot("far", 1.15, 1.6, -2.5);
  C.setView(1.15, 3.0, Math.PI, 0); C.update(0.016, 0);
  C.pickCenter(); assert.deepEqual(log.picks, ["near"]);
  C.hotspots.shift();                                /* near 를 치우면 뒤의 far 가 걸린다 */
  C.pickCenter(); assert.deepEqual(log.far, ["far"]);
});

test("C 는 숙이기를 토글하고 눈높이가 부드럽게 내려간다", () => {
  const { C, cam, fire, log } = makeEnv();
  C.setView(1.15, 3.0, Math.PI, 0);
  fire("keydown", { key: "c", code: "KeyC" });
  assert.equal(C.crouch, true); assert.deepEqual(log.crouch, [true]);
  for (let i = 0; i < 60; i++) C.update(0.05, i);
  assert.ok(cam.position.y < 0.6, "웅크린 눈높이: " + cam.position.y);
  fire("keydown", { key: "c", code: "KeyC" });
  for (let i = 0; i < 60; i++) C.update(0.05, i);
  assert.ok(cam.position.y > 1.5);
});

test("창이 초점을 잃으면 눌려 있던 키가 풀린다", () => {
  const { C, cam, fire } = makeEnv();
  C.setView(1.15, 3.0, Math.PI, 0);
  fire("keydown", { key: "w", code: "KeyW" });
  fire("blur", {});
  for (let i = 0; i < 20; i++) C.update(0.05, i);
  assert.ok(Math.abs(cam.position.z - 3.0) < 1e-6, "blur 뒤에는 계속 걷지 않는다");
});

test("핫스팟이 꺼지면 남은 호버 표시가 지워진다", () => {
  const { C, log, hot } = makeEnv();
  const m = hot("calendar", 1.15, 1.6, 1.5);
  C.setView(1.15, 3.0, Math.PI, 0); C.update(0.016, 0);
  C.castAt(400, 300); C.hover = m;                    /* 호버 상태를 만든다 */
  C.hotspots.length = 0; C.update(0.016, 0.1);
  assert.equal(C.hover, null);
});

test("화면을 끌면 시선이 돌고, 끌던 중 다른 손가락이 닿아도 드래그가 끊기지 않는다", () => {
  const { C, fireCv } = makeEnv();
  const yaw0 = C.yaw, pitch0 = C.pitch;
  fireCv("pointerdown", { pointerId: 1, clientX: 400, clientY: 300 });
  fireCv("pointermove", { pointerId: 1, clientX: 460, clientY: 330 });
  assert.ok(C.yaw > yaw0 && C.pitch > pitch0, "끄는 방향으로 시선이 돈다");
  const yaw1 = C.yaw;
  fireCv("pointerdown", { pointerId: 2, clientX: 100, clientY: 100 });      /* 손바닥·두 번째 손가락 */
  fireCv("pointermove", { pointerId: 2, clientX: 900, clientY: 500 });
  assert.equal(C.yaw, yaw1, "두 번째 포인터는 시선을 바꾸지 못한다");
  fireCv("pointerup", { pointerId: 2, clientX: 900, clientY: 500 });
  fireCv("pointermove", { pointerId: 1, clientX: 500, clientY: 330 });
  assert.ok(C.yaw > yaw1, "첫 손가락은 계속 시선을 돌린다");
});

test("가볍게 눌렀다 떼면(거의 안 움직이면) 그 자리의 물건을 조사한다", () => {
  const { C, cam, fireCv, log, hot } = makeEnv();
  hot("calendar", 1.15, 1.6, 1.0);
  C.setView(1.15, 3.0, Math.PI, 0); C.update(0.016, 0);
  fireCv("pointerdown", { pointerId: 1, clientX: 400, clientY: 300 });
  fireCv("pointerup", { pointerId: 1, clientX: 401, clientY: 300 });
  assert.deepEqual(log.picks, ["calendar"]);
  fireCv("pointerdown", { pointerId: 1, clientX: 400, clientY: 300 });
  fireCv("pointermove", { pointerId: 1, clientX: 470, clientY: 300 });
  fireCv("pointerup", { pointerId: 1, clientX: 470, clientY: 300 });
  assert.deepEqual(log.picks, ["calendar"], "많이 끌었으면 조사가 아니라 둘러보기다");
});

test("잠긴 동안 시작한 드래그는 무시된다", () => {
  const { C, fireCv, log } = makeEnv();
  log.blocked = true; const yaw0 = C.yaw;
  fireCv("pointerdown", { pointerId: 1, clientX: 400, clientY: 300 });
  fireCv("pointermove", { pointerId: 1, clientX: 480, clientY: 300 });
  assert.equal(C.yaw, yaw0);
});
