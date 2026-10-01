import test from "node:test";
import assert from "node:assert/strict";
import vm from "node:vm";
import { readFileSync } from "node:fs";
import { createRequire } from "node:module";
import crypto from "node:crypto";
import { answerOf, EXIT_CODE } from "./answers.mjs";

const require = createRequire(import.meta.url);
const Lg = require("../logic.js");
const St = require("../storage.js");
const Model = require("../model.js");

function loadData() {
  const ctx = { console, U: Lg.U, sealCode: Lg.sealCode }; ctx.globalThis = ctx; ctx.window = ctx;
  vm.createContext(ctx);
  vm.runInContext(readFileSync(new URL("../data.js", import.meta.url), "utf8"), ctx, { filename: "data.js" });
  return ctx.N1Data;
}
const D = loadData();

function memStore() {
  const map = new Map();
  const ls = { getItem: k => (map.has(k) ? map.get(k) : null), setItem: (k, v) => map.set(k, String(v)), removeItem: k => map.delete(k) };
  return St.createStore({ localStorage: ls, emit() {} });
}
function newGame(store = memStore()) {
  const M = Model.create({ data: D, logic: Lg, storage: St, store });
  M.startNew();
  return { M, store };
}

test("퍼즐 내용(data.js)은 잠겨 있다 — 실수로 고치면 여기서 실패한다", () => {
  const sha = crypto.createHash("sha256").update(JSON.stringify(D)).digest("hex");
  assert.equal(sha, "295544cf663c5d2d4e3513a48177588fde8dd96105e4a912b0ce925784d9100f",
    "일부러 내용을 고쳤다면 이 해시를 새 값으로 바꾼다(2장: 뉴턴 설명판에 사과 일화 한 문장을 더했다)");
  assert.equal(D.CH.length, 8);
  assert.equal(Object.keys(D.DIARY_HTML).length, 9);
});

test("탐색 지점 해시가 리빌 대상 이름과 일치한다", () => {
  const spots = ["calendar", "doll", "postit", "teacher", "extinguisher", "clock", "mathbook", "curtain"];
  spots.forEach((id, i) => {
    const { M } = newGame(); M.S.ch = i + 1;
    assert.equal(M.isSpot(id), true, `chapter ${i + 1} → ${id}`);
    assert.equal(M.isSpot("computer"), false);
  });
});

test("8개 챕터를 처음부터 끝까지 완주한다", () => {
  const { M } = newGame();
  const hud0 = M.hud();
  assert.equal(hud0.kicker, "CHAPTER 1"); assert.equal(hud0.objective, null);
  M.takeDiary1(); assert.equal(M.S.tookD1, true);
  const spots = ["calendar", "doll", "postit", "teacher", "extinguisher", "clock", "mathbook", "curtain"];
  for (let n = 1; n <= 8; n++) {
    assert.equal(M.S.ch, n);
    assert.equal(M.answer("wrong-answer!").ok, false, "형식이 틀린 입력");
    assert.equal(M.answer("zzzz").reason, "wrong");
    const r = M.answer(answerOf(n));
    assert.equal(r.ok, true, `chapter ${n} 정답`);
    assert.equal(M.S.phase, "search");
    assert.ok(M.hud().objective.hint.includes(D.CH[n - 1].cue));
    assert.equal(M.answer(answerOf(n)).ok, false, "탐색 중에는 정답을 다시 받지 않는다");
    assert.equal(M.canSearch(), true);
    assert.equal(M.isSpot(spots[n - 1]), true);
    assert.equal(M.reveal(), n);
    assert.equal(M.reveal(), null, "이미 공개됨");
    assert.equal(M.hud().objective.hint, "드러난 편지를 눌러 읽으세요.");
    assert.equal(M.finishReward(n + 1), false, "엉뚱한 편지는 못 붙인다");
    assert.equal(M.finishReward(n), true);
    assert.deepEqual(M.S.pieces.slice().sort(), Array.from({ length: n }, (_, i) => i + 1));
  }
  assert.equal(M.S.ch, 9);
  assert.equal(M.hud().kicker, "FINAL");
});

test("액자 회전, 기억 조립, 최종 이름, 뒷문 코드", () => {
  const { M } = newGame();
  assert.equal(M.rotateFrame("newton"), 1);
  assert.equal(M.rotKey("newton"), "apple");
  M.rotateFrame("newton"); M.rotateFrame("newton"); assert.equal(M.rotateFrame("newton"), 0);
  assert.equal(M.rotateFrame("einstein"), 1);
  assert.deepEqual(M.frameSignature("einstein"), [1, 1, 1, 1]);
  assert.deepEqual(M.frameSignature("gauss"), D.FRAME_SIG.compass);

  M.S.ch = 9; M.S.pieces = [1, 2, 3, 4, 5, 6, 7, 8];
  assert.equal(M.stackSolved(), false);
  // 정답 순서로 만든다(탑에서 옮겨 쌓는다). 완성은 ‘완성’을 눌러야 알려 준다
  const target = Lg.stackOrder();
  for (let i = 0; i < 8; i++) { const j = M.tower().indexOf(target[i]); if (j !== i) assert.equal(M.towerMove(j, i), true); }
  assert.equal(M.stackSolved(), false, "순서가 맞아도 완성을 누르기 전에는 확정되지 않는다");
  assert.equal(M.towerSubmit().ok, true);
  assert.equal(M.stackSolved(), true);
  assert.equal(M.towerMove(0, 1), false, "완성되면 더는 못 바꾼다");
  assert.equal(M.submitFinal("").reason, "empty");
  assert.equal(M.submitFinal("someone").reason, "wrong");
  assert.equal(M.submitFinal("Stephen William Hawking".replace(/ /g, "")).ok, true);
  assert.equal(M.S.exitReady, true);
  assert.equal(M.hud().kicker, "FINAL EXIT");
  assert.equal(M.submitExitCode("1234").ok, false);
  assert.equal(M.submitExitCode(EXIT_CODE).ok, true);
  assert.equal(M.S.done, true);
  assert.equal(M.hud().kicker, "COMPLETE");
});

test("저장하고 다시 열면 이어서 할 수 있다", () => {
  const store = memStore();
  const a = newGame(store).M;
  a.takeDiary1(); a.answer(answerOf(1)); a.reveal(); a.finishReward(1);
  const b = Model.create({ data: D, logic: Lg, storage: St, store });
  assert.equal(b.hasSave(), true);
  assert.equal(b.S.ch, 2); assert.deepEqual(b.S.pieces, [1]);
  a.startNew();
  assert.equal(b.continueSaved(), true, "b 는 a 의 새 게임(started) 저장본을 읽는다");
  assert.equal(b.S.ch, 1);
});

test("저장본이 없으면 이어하기는 실패한다", () => {
  const M = Model.create({ data: D, logic: Lg, storage: St, store: memStore() });
  assert.equal(M.hasSave(), false); assert.equal(M.continueSaved(), false);
});

test("기록: 장별 걸린 시간을 초 단위로 세고(쉬는 동안은 세지 않고), 저장·복원되며, 힌트 횟수와 함께 보여 준다", () => {
  const store = memStore(), { M } = newGame(store);
  M.tick(0.4); assert.deepEqual({ ...M.S.log.t }, {}, "1초 단위로 모아서 센다(작은 틱은 모은다)");
  for (let i = 0; i < 12; i++) M.tick(0.5); assert.equal(M.S.log.t[1], 6, "1장 6초(0.4 + 6.0 = 6.4초)");
  M.S.ch = 3; M.tick(2.4); M.tick(0.7); assert.equal(M.S.log.t[3], 3);
  M.S.ch = 9; M.tick(4); assert.equal(M.S.log.t.f, 4, "탑·이름 단계는 f");
  M.S.hints = { c1: 2, s1: 1, c3: 3, asm: 1, name: 2 };
  const rec = M.record();
  assert.equal(rec.rows.length, 9); assert.deepEqual(rec.rows[0], { n: 1, title: D.CH[0].title, sec: 6, hints: 3 });
  assert.deepEqual(rec.rows[8], { n: 9, title: "기억의 탑과 이름", sec: 4, hints: 3 });
  assert.equal(rec.total.sec, 6 + 3 + 4); assert.equal(rec.total.hints, 3 + 3 + 3);
  M.S.exitReady = true; const before = M.S.log.t.f; M.tick(10); assert.equal(M.S.log.t.f, before, "이름을 맞힌 뒤에는 세지 않는다");
  M.S.exitReady = false; M.S.done = true; M.tick(10); assert.equal(M.S.log.t.f, before, "끝난 뒤에는 세지 않는다");
  M.S.done = false; M.save();
  const { M: M2 } = (() => { const m = Model.create({ data: D, logic: Lg, storage: St, store }); assert.ok(m.continueSaved()); return { M: m }; })();
  assert.equal(M2.S.log.t[1], 6); assert.equal(M2.S.log.t.f, 4);
  M2.S.log = { t: { 1: "x", 2: -3, 9: 5, f: 7.9, 4: Infinity } };
  const fixed = St.normalizeState(JSON.parse(JSON.stringify({ ...M2.S, log: { t: { 1: "x", 2: -3, 9: 5, f: 7.9, 4: null } } })));
  assert.deepEqual({ ...fixed.log.t }, { f: 7 }, "모양이 틀린 값은 버린다");
  const old = St.normalizeState({ started: true, ch: 2, phase: "read", pieces: [1], rot: {}, stack: null, revealed: 0, tookD1: true, exitReady: false, done: false });
  assert.deepEqual({ ...old.log.t }, {}, "옛 저장에는 기록이 없다");
});
