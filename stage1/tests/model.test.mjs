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
  assert.equal(sha, "1223c07d50ecc6d3aa90e2c59f34194e15b08d0cef14bdd3ab908e8572c67052",
    "일부러 내용을 고쳤다면 이 해시를 새 값으로 바꾼다");
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
  assert.deepEqual(M.ensureStack(), [1, 2, 3, 4, 5, 6, 7, 8]);
  assert.equal(M.stackSolved(), false);
  // 정답 순서로 만든다
  const target = Lg.stackOrder();
  for (let i = 0; i < 8; i++) { const j = M.S.stack.indexOf(target[i]); if (j !== i) assert.equal(M.swapStack(i, j), true); }
  assert.equal(M.stackSolved(), true);
  assert.equal(M.swapStack(0, 1), false, "완성되면 더는 못 바꾼다");
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
