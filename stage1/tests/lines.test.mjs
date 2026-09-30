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
const game = (withLines = true) => { const M = Model.create({ data: D, logic: Lg, storage: St, store: memStore(), lines: withLines ? Ln : undefined }); M.startNew(); return M; };

/* ── 문구 데이터 ── */
test("힌트: 장 1~8 풀이·탐색, 조립, 이름 모두 3단계가 채워져 있다", () => {
  const scopes = [1, 2, 3, 4, 5, 6, 7, 8].flatMap((n) => [`c${n}`, `s${n}`]).concat(["asm", "name"]);
  for (const sc of scopes) for (const t of [1, 2, 3]) {
    const text = Ln.hintText(sc, t);
    assert.ok(typeof text === "string" && text.length >= 5, `${sc} 단계 ${t}`);
  }
  assert.equal(Ln.hintText("c1", 4), null); assert.equal(Ln.hintText("c1", 0), null); assert.equal(Ln.hintText("zz", 1), null);
});

test("힌트는 단계가 오를수록 구체적이다(3단계가 1단계보다 길거나 같다) — 봉인이 풀려 읽힌다", () => {
  for (const n of [1, 2, 3, 4, 5, 6, 7, 8]) {
    assert.ok(Ln.hintText("c" + n, 3).length >= Ln.hintText("c" + n, 1).length * 0.5, `c${n}`);
    assert.ok(!/U\(\[/.test(Ln.hintText("c" + n, 3)), "봉인 문자열이 풀린 채로 나온다");
  }
});

test("정답 새지 않음: lines.js 원문(봉인 제외)에 정답·최종 이름이 평문으로 없다", () => {
  const src = read("../lines.js").replace(/U\(\[[0-9, ]+\],\s*\d+\)/g, "");
  const flat = src.toLowerCase().replace(/[^a-z0-9가-힣]/g, "");
  for (let n = 1; n <= 8; n++) {
    const a = answerOf(n);
    if (/^\d+$/.test(a)) assert.ok(!new RegExp(`(^|[^0-9])${a}([^0-9]|$)`).test(src), `장 ${n} 숫자 정답 ${a} 이(가) 평문에 있다`);
    else assert.ok(!flat.includes(a.toLowerCase()), `장 ${n} 정답 ${a} 이(가) 평문에 있다`);
  }
  for (const w of ["stephen", "hawking", "호킹", "스티븐", "0808"]) assert.ok(!flat.includes(w), `${w} 이(가) 평문에 있다`);
});

test("봉인 문장은 U()로 풀리고 모두 한글 문장이다", () => {
  const src = read("../lines.js"), sealed = [...src.matchAll(/U\(\[([0-9, ]+)\],\s*(\d+)\)/g)];
  assert.equal(sealed.length, 18, "풀이 8+조립+이름, 탐색 8의 3단계");
  for (const m of sealed) {
    const text = Lg.U(m[1].split(",").map((s) => Number(s.trim())), Number(m[2]));
    assert.ok(/[가-힣]/.test(text) && text.length > 6, `풀린 문장: ${text}`);
  }
});

test("fmt·pick: 자리표시자를 채우고, 같은 말을 연달아 고르지 않는다", () => {
  assert.equal(Ln.fmt("단서 “{cue}” 끝", { cue: "달력" }), "단서 “달력” 끝");
  assert.equal(Ln.fmt("{x}{y}", { x: "a" }), "a");
  const pool = ["a", "b", "c"];
  for (let i = 0; i < 30; i++) { const last = pool[i % 3]; assert.notEqual(Ln.pick(pool, last, () => (i % 3) / 3), last); }
  assert.equal(Ln.pick(["only"], "only"), "only"); assert.equal(Ln.pick([], null), null);
});

test("SAY: 장마다 정답·조각·시작 말이 있고, 조각을 붙이는 말은 1~8장 전부", () => {
  for (let n = 1; n <= 8; n++) { assert.ok(Ln.SAY.solved[n].length >= 1, `solved ${n}`); assert.ok(Ln.SAY.attach[n].length >= 1, `attach ${n}`); }
  for (let n = 2; n <= 8; n++) assert.ok(Ln.SAY.start[n].length >= 1, `start ${n}`);
  assert.ok(Ln.SAY.cue.includes("{cue}"));
  assert.ok(Ln.SAY.wrong.length >= 3 && Ln.SAY.letter.length >= 3);
  Object.values(Ln.SAY.hintLead).forEach((t) => assert.ok(t));
});

/* ── 힌트 범위·목표 ── */
test("hintScope: 시작 전·일기 전·완료 뒤에는 없고, 단계에 맞는 범위를 준다", () => {
  const st = (o) => Object.assign({ started: true, ch: 1, phase: "read", tookD1: true, exitReady: false, done: false }, o);
  assert.equal(Ln.hintScope(st({ started: false })), null);
  assert.equal(Ln.hintScope(st({ tookD1: false })), null, "첫 일기를 집기 전엔 줄 힌트가 없다");
  assert.equal(Ln.hintScope(st({})), "c1");
  assert.equal(Ln.hintScope(st({ ch: 5, phase: "search" })), "s5");
  assert.equal(Ln.hintScope(st({ ch: 9 }), { stackSolved: false }), "asm");
  assert.equal(Ln.hintScope(st({ ch: 9 }), { stackSolved: true }), "name");
  assert.equal(Ln.hintScope(st({ ch: 9, exitReady: true })), null);
  assert.equal(Ln.hintScope(st({ ch: 9, done: true })), null);
  assert.equal(Ln.hintScope(st({ ch: 3, tookD1: false })), "c3", "첫 일기는 1장에서만 문턱이다");
});

test("goal: 읽기·탐색·편지·조립·이름 단계마다 문구를 준다", () => {
  const st = (o) => Object.assign({ started: true, ch: 1, phase: "read", tookD1: true, revealed: 0, exitReady: false, done: false }, o);
  assert.equal(Ln.goal(st({ tookD1: false })), null);
  for (let n = 1; n <= 8; n++) { const g = Ln.goal(st({ ch: n })); assert.ok(g && g.main && g.hint, `읽기 ${n}`); }
  assert.ok(Ln.goal(st({ phase: "search" })).main.includes("단서"));
  assert.ok(Ln.goal(st({ phase: "search", revealed: 1 })).hint.includes("편지"));
  assert.ok(Ln.goal(st({ ch: 9 }), { stackSolved: false }).main.includes("쌓"));
  assert.ok(Ln.goal(st({ ch: 9 }), { stackSolved: true }).main.includes("이름"));
  assert.equal(Ln.goal(st({ done: true })), null);
});

/* ── 모델의 힌트 ── */
test("M.hint: 1→2→3단계로 오르고 저장되며, 3단계 뒤에는 max", () => {
  const M = game(); M.takeDiary1();
  assert.equal(M.hintScope(), "c1"); assert.equal(M.hintTier("c1"), 0);
  const r1 = M.hint(), r2 = M.hint(), r3 = M.hint(), r4 = M.hint();
  assert.deepEqual([r1.tier, r2.tier, r3.tier], [1, 2, 3]);
  assert.equal(r1.first, true); assert.equal(r2.first, false);
  assert.equal(r1.text, Ln.hintText("c1", 1)); assert.equal(r3.text, Ln.hintText("c1", 3));
  assert.deepEqual([r4.none, r4.reason], [true, "max"]);
  assert.equal(M.hintsUsed(), 3);
  assert.equal(M.S.hints.c1, 3);
});

test("M.hint: 범위가 바뀌면(탐색 단계) 새로 시작하고, 장마다 따로 센다", () => {
  const M = game(); M.takeDiary1(); M.hint();
  assert.equal(M.answer(answerOf(1)).ok, true);
  assert.equal(M.hintScope(), "s1");
  assert.equal(M.hint().tier, 1, "탐색 단계는 1단계부터");
  assert.equal(M.S.hints.c1, 1); assert.equal(M.S.hints.s1, 1);
  assert.equal(M.hintsUsed(), 2);
});

test("M.hint: 첫 일기 전·시작 전에는 줄 게 없다, lines 없이 만든 모델은 힌트가 없다", () => {
  const M = game();
  assert.deepEqual([M.hint().none, M.hint().reason], [true, "not-now"]);
  const bare = game(false); bare.takeDiary1();
  assert.equal(bare.hintScope(), null); assert.equal(bare.hint().reason, "no-lines");
});

test("힌트 기록은 저장·복원된다", () => {
  const store = memStore();
  const M = Model.create({ data: D, logic: Lg, storage: St, store, lines: Ln }); M.startNew(); M.takeDiary1(); M.hint(); M.hint();
  const M2 = Model.create({ data: D, logic: Lg, storage: St, store, lines: Ln }); assert.equal(M2.continueSaved(), true);
  assert.equal(M2.S.hints.c1, 2); assert.equal(M2.hint().tier, 3);
});

test("M.sayOnce: 처음에만 true, 저장된다", () => {
  const store = memStore();
  const M = Model.create({ data: D, logic: Lg, storage: St, store, lines: Ln }); M.startNew();
  assert.equal(M.sayOnce("diary1"), true); assert.equal(M.sayOnce("diary1"), false);
  const M2 = Model.create({ data: D, logic: Lg, storage: St, store, lines: Ln }); M2.continueSaved();
  assert.equal(M2.sayOnce("diary1"), false, "다시 불러와도 한 번만");
});

test("HUD: lines 가 있으면 읽기 단계 목표가 구체적이고, 없으면 예전과 같다", () => {
  const M = game(); M.takeDiary1();
  assert.ok(M.hud().objective.main.includes("컴퓨터"), "1장 읽기 목표");
  M.answer(answerOf(1));
  assert.ok(M.hud().objective.main.includes("단서") && M.hud().objective.hint.startsWith("“"), "탐색: 단서를 그대로 보여 준다");
  M.reveal(); assert.ok(M.hud().objective.hint.includes("편지"));
  const bare = game(false); bare.takeDiary1(); assert.equal(bare.hud().objective, null, "옛 동작");
});

/* ── 저장 호환 ── */
test("옛 저장(hints·pz·said 없음)도 그대로 읽힌다, 망가진 값은 비운다", () => {
  const legacy = { started: true, ch: 3, phase: "read", pieces: [1, 2], rot: { apple: 0, compass: 0, sqrt: 0, sun: 0, pi: 0, einstein: 0 }, stack: null, revealed: 0, tookD1: true, exitReady: false, done: false };
  const ok = St.normalizeState ? St.normalizeState(legacy) : null;
  if (ok) { assert.deepEqual(ok.hints, {}); assert.deepEqual(ok.pz, {}); assert.deepEqual(ok.said, {}); assert.equal(ok.ch, 3); }
  const bad = St.normalizeState ? St.normalizeState(Object.assign({}, legacy, { hints: { c1: 9, zz: 1, s2: 2, asm: "x" }, pz: [], said: 5 })) : null;
  if (bad) { assert.deepEqual(bad.hints, { s2: 2 }); assert.deepEqual(bad.pz, {}); assert.deepEqual(bad.said, {}); }
  assert.ok(St.fresh().hints && St.fresh().pz && St.fresh().said);
});
