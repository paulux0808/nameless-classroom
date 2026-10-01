import test from "node:test";
import assert from "node:assert/strict";
import vm from "node:vm";
import { readFileSync } from "node:fs";
import { createRequire } from "node:module";
import { answerOf } from "./answers.mjs";

const require = createRequire(import.meta.url);
const Lg = require("../logic.js");
const St = require("../storage.js");
const Model = require("../model.js");
const Ln = require("../lines.js");
const read = (p) => readFileSync(new URL(p, import.meta.url), "utf8");
function loadData() {
  const ctx = { console, U: Lg.U, sealCode: Lg.sealCode }; ctx.globalThis = ctx; ctx.window = ctx;
  vm.createContext(ctx); vm.runInContext(read("../data.js"), ctx, { filename: "data.js" });
  return ctx.N1Data;
}
const D = loadData();
function memStore() {
  const map = new Map();
  return St.createStore({ localStorage: { getItem: (k) => (map.has(k) ? map.get(k) : null), setItem: (k, v) => map.set(k, String(v)), removeItem: (k) => map.delete(k) }, emit() {} });
}
const game = () => { const M = Model.create({ data: D, logic: Lg, storage: St, store: memStore(), lines: Ln }); M.startNew(); M.takeDiary1(); return M; };
/* 챕터 n 까지 조각을 모은 상태로 만든다(n 조각). 순서는 모은 순서 */
function collect(M, n) { for (let i = 1; i <= n; i++) { M.S.ch = i; M.S.phase = "search"; M.S.revealed = i; assert.equal(M.finishReward(i), true); } }

test("탑: 조각을 얻을 때마다 맨 위(0 번)에 쌓이고, 얻은 조각만 있다", () => {
  const M = game(); assert.deepEqual(M.tower(), []);
  collect(M, 3); assert.deepEqual(M.tower(), [3, 2, 1]);
  collect(M, 8); assert.deepEqual(M.tower(), [8, 7, 6, 5, 4, 3, 2, 1]);
});

test("탑: 중간에도 순서를 바꿔 볼 수 있고, 새 조각은 그 위에 올라온다", () => {
  const M = game(); collect(M, 3);
  assert.equal(M.towerMove(0, 2), true); assert.deepEqual(M.tower(), [2, 1, 3]);
  M.S.ch = 4; M.S.phase = "search"; M.S.revealed = 4; M.finishReward(4);
  assert.deepEqual(M.tower(), [4, 2, 1, 3], "배열은 그대로, 새 조각만 위에");
  assert.equal(M.towerMove(2, 2), false); assert.equal(M.towerMove(-1, 1), false); assert.equal(M.towerMove(0, 4), false);
});

test("탑: 여덟 개가 모이기 전에는 ‘완성’할 수 없다", () => {
  const M = game(); collect(M, 7);
  assert.deepEqual(M.towerSubmit(), { ok: false, reason: "incomplete" }); assert.equal(M.stackSolved(), false);
});

test("탑: 틀린 순서는 ‘wrong’ 한 가지로만 알려 준다(어디가 틀렸는지 말하지 않는다)", () => {
  const M = game(); collect(M, 8);
  const order = Lg.stackOrder(), wrong = order.slice().reverse();   /* 목록과 같은 방향(위에서 아래로)이 정답 */
  M.S.tower = wrong.slice();
  const r = M.towerSubmit(); assert.deepEqual(r, { ok: false, reason: "wrong" }); assert.deepEqual(M.tower(), wrong, "배열은 그대로 남는다"); assert.equal(M.stackSolved(), false);
  const seen = []; M.on((k, d) => seen.push([k, d && d.wrong])); M.towerSubmit(); assert.ok(seen.some((e) => e[0] === "tower" && e[1] === true), "무너짐 연출을 위한 알림");
});

test("탑: 맞는 순서면 통과하고 stackSolved 가 참이 되며 그 뒤에는 움직이지 않는다", () => {
  const M = game(); collect(M, 8);
  M.S.tower = Lg.stackOrder().slice();
  assert.deepEqual(M.towerSubmit(), { ok: true }); assert.equal(M.stackSolved(), true);
  assert.deepEqual(M.towerSubmit(), { ok: true, already: true });
  assert.equal(M.towerMove(0, 1), false, "완성된 탑은 고정");
});

test("탑: 옛 조립 화면의 배열(S.stack)이 있으면 그대로 이어받는다", () => {
  const M = game(); M.S.pieces = [1, 2, 3, 4, 5, 6, 7, 8]; M.S.ch = 9; M.S.stack = [8, 7, 6, 5, 4, 3, 2, 1]; M.S.tower = [];
  assert.deepEqual(M.tower(), [8, 7, 6, 5, 4, 3, 2, 1]);
});

test("저장: 탑은 저장·복원되고 망가진 값은 비운다", () => {
  const store = memStore(), M = Model.create({ data: D, logic: Lg, storage: St, store, lines: Ln }); M.startNew(); M.takeDiary1(); collect(M, 4); M.towerMove(0, 3);
  const M2 = Model.create({ data: D, logic: Lg, storage: St, store, lines: Ln }); assert.equal(M2.continueSaved(), true);
  assert.deepEqual(M2.tower(), [3, 2, 1, 4]);
  assert.deepEqual(St.normalizeState({ ...St.fresh(), started: true, tower: [3, 3, "x", 9, 2] }).tower, [3, 2], "중복·범위 밖·문자는 버린다");
  assert.deepEqual(St.normalizeState({ ...St.fresh(), started: true, tower: "nope" }).tower, []);
  assert.deepEqual(St.normalizeState({ started: true, ch: 1, phase: "read", pieces: [], rot: { apple: 0, compass: 0, sqrt: 0, sun: 0, pi: 0, einstein: 0 }, stack: null, revealed: 0, tookD1: false, exitReady: false, done: false }).tower, [], "tower 필드가 없던 옛 저장");
});

test("이름: 전체 이름·이름+성·성만 받고, 모음을 뺀 뼈대를 준다", () => {
  const acc = Lg.finalAccepts(), full = Lg.norm(Lg.finalName()), w = Lg.finalName().split(" ");
  assert.equal(acc.length, 3);
  assert.ok(acc.includes(full) && acc.includes(Lg.norm(w[0] + w[2])) && acc.includes(Lg.norm(w[2])));
  const M = game(); M.S.ch = 9; M.S.pieces = [1, 2, 3, 4, 5, 6, 7, 8];
  for (const v of acc) assert.equal(M.submitFinal(v).ok, true, v);
  const M2 = game(); assert.equal(M2.submitFinal("STEPHEN").ok, false); assert.equal(M2.submitFinal("EINSTEIN").ok, false);
  const sk = Lg.finalSkeleton(); assert.ok(!/[AEIOU]/i.test(sk) && sk.length < Lg.finalName().length && /\s/.test(sk));
});

test("연도: 일기 날짜에서 읽고, 1장은 도장으로 맞힌 날짜에서 읽는다", () => {
  const M = game();
  assert.equal(M.pieceYear(1), "19??", "맞히기 전에는 모른다");
  const years = [2, 3, 4, 5, 6, 7, 8].map((n) => M.pieceYear(n));
  assert.deepEqual(years.map(Number), years.map(Number).slice().sort((a, b) => a - b), "연도는 장 순서대로 늘어난다");
  assert.ok(years.every((y) => /^\d{4}$/.test(y)));
  M.answer(answerOf(1)); assert.match(M.pieceYear(1), /^1\d{3}$/);
});
