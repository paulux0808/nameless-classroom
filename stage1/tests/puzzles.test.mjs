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
const Puz = require("../puzzles.js");

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
const plain = (html) => html.replace(/<[^>]+>/g, "");

/* ── 1장 날짜 도장 ── */
test("1장: 바퀴 다섯 개의 숫자가 곧 정답 문자열이다(터미널 입력과 같은 답)", () => {
  const good = Puz.stampAnswer([9, 4, 2, 1, 8]);
  assert.equal(good, answerOf(1));
  const M = game(); assert.equal(M.answer(good).ok, true);
  const M2 = game(); assert.equal(M2.answer(Puz.stampAnswer([9, 4, 2, 1, 9])).ok, false, "하루만 틀려도 통과하지 못한다");
});

test("1장: 바퀴 수·범위가 틀리면 null", () => {
  assert.equal(Puz.stampAnswer([9, 4, 2, 1]), null); assert.equal(Puz.stampAnswer([9, 4, 2, 1, 8, 0]), null);
  assert.equal(Puz.stampAnswer([9, 4, 2, 1, 10]), null); assert.equal(Puz.stampAnswer([9, 4, 2, 1, -1]), null);
  assert.equal(Puz.stampAnswer([9, 4, 2, 1, 1.5]), null); assert.equal(Puz.stampAnswer("94218"), null); assert.equal(Puz.stampAnswer(null), null);
});

test("1장: 도장 바퀴 모양이 일기 1편의 빈칸 모양과 같다(빈칸 3+1+1, 앞의 1 은 인쇄)", () => {
  const first = D.DIARY_HTML.diary1.split("</p>")[0];
  assert.equal((first.match(/class="blank"/g) || []).length, Puz.STAMP.wheels, "빈칸 수 = 바퀴 수");
  assert.ok(plain(first).startsWith(Puz.STAMP.prefix + "???년 ?월 ?일"), plain(first));
});

test("1장: dateParts 는 복원된 날짜를 글자 그대로 잇는다", () => {
  const parts = Puz.dateParts(answerOf(1));
  assert.equal(parts.map((p) => p.text).join(""), "1942년 1월 8일");
  assert.equal(parts.filter((p) => p.blank).length, Puz.STAMP.wheels);
  assert.equal(Puz.dateParts("").map((p) => p.text).join(""), "1년 월 일", "빈 답이면 빈칸이 비어 있다");
});

/* ── 2장 표식 카드 ── */
test("2장: 표식 다섯 개는 정확히 다섯 액자에 맞고, 한 액자(표식 없음)가 남는다", () => {
  assert.equal(Puz.SYMBOLS.length, 5);
  const fits = Puz.SYMBOLS.map((sym) => D.SCI.filter((s) => Puz.stickerFits(D, s.id, sym)).map((s) => s.id));
  fits.forEach((f, i) => assert.equal(f.length, 1, `${Puz.SYMBOLS[i]} 는 한 사람에게만 맞는다: ${f}`));
  assert.equal(new Set(fits.flat()).size, 5, "서로 다른 다섯 사람");
  const st = Puz.stickerState(D, {}); assert.equal(st.spare, "einstein"); assert.equal(st.done, false);
});

test("2장: 붙이기 규칙 — 맞으면 붙고, 틀림·중복·이미 있음·없는 카드는 거절", () => {
  let placed = {};
  const tryPlace = (sym, id) => Puz.stickerPlace(D, placed, sym, id);
  assert.deepEqual([tryPlace("apple", "gauss").ok, tryPlace("apple", "gauss").reason], [false, "wrong"]);
  assert.deepEqual([tryPlace("nope", "gauss").ok, tryPlace("nope", "gauss").reason], [false, "no-such-card"]);
  const r = tryPlace("apple", "newton"); assert.equal(r.ok, true); placed = r.placed;
  assert.deepEqual(placed, { apple: "newton" });
  assert.equal(tryPlace("apple", "newton").reason, "already");
  assert.equal(tryPlace("sun", "newton").reason, "occupied");
  assert.equal(Puz.stickerState(D, placed).correct, 1);
});

test("2장: 다섯 장을 모두 맞게 붙이면 끝나고, 남는 액자의 이름이 곧 정답이다", () => {
  let placed = {};
  for (const [sym, id] of [["apple", "newton"], ["pi", "archimedes"], ["sqrt", "abel"], ["sun", "galilei"], ["compass", "gauss"]]) {
    const r = Puz.stickerPlace(D, placed, sym, id); assert.equal(r.ok, true, `${sym}→${id}`); placed = r.placed;
  }
  const st = Puz.stickerState(D, placed);
  assert.equal(st.done, true); assert.equal(st.correct, 5); assert.equal(st.spare, answerOf(2));
  const M = game(); M.S.ch = 2; assert.equal(M.answer(st.spare).ok, true, "남는 액자 이름이 2장 정답");
  assert.ok(!st.usedFrames.includes(st.spare), "남는 액자에는 카드가 붙지 않는다");
});

/* ── 3장 명단 ── */
test("3장: 명단은 일기 3편에 적힌 순서 그대로다", () => {
  const text = plain(D.DIARY_HTML.diary3), at = Puz.ROSTER.slice(0, -1).map((n) => text.indexOf(n));
  assert.ok(at.every((i) => i > 0) && at.every((v, i) => i === 0 || v > at[i - 1]), "이름이 본문에 차례로 나온다");
  assert.ok(text.indexOf("그리고 나", at[at.length - 1]) > 0); assert.equal(Puz.ROSTER.at(-1), "나"); assert.equal(Puz.ROSTER.length, 9);
});

test("3장: 아홉 자리가 정확히 맞는 종목은 하나뿐이고, 마지막 자리가 정답이다", () => {
  const fits = D.SPORTS.map((s) => [s.id, Puz.rosterFit(s.roles)]);
  const exact = fits.filter(([, f]) => f.exact);
  assert.equal(exact.length, 1); assert.equal(exact[0][0], "rowing");
  assert.ok(exact[0][1].me.role.toLowerCase().includes(answerOf(3)), exact[0][1].me.role);
  assert.equal(exact[0][1].me.name, "나");
  const by = Object.fromEntries(fits);
  assert.equal(by.soccer.empty, 2); assert.equal(by.baseball.empty, 1, "야구는 지명타자까지 열 자리라 하나 남는다");
  assert.equal(by.basketball.extra.length, 4); assert.equal(by.basketball.me, null);
  assert.equal(by.soccer.slots.filter((s) => s.name).length, 9);
});

/* ── 4장 테이프 ── */
test("4장: 테이프 글자는 정답과 같고 글자 순서대로 하나씩 튀어나온다", () => {
  assert.equal(Puz.TAPE_WORD.toLowerCase(), answerOf(4));
  assert.deepEqual(Puz.tapeFrame(0).map((l) => l.phase), Array(7).fill("hidden"), "끝의 한 점: 아무 글자도 안 보인다");
  assert.deepEqual(Puz.tapeFrame(1).map((l) => l.phase), Array(7).fill("landed"));
  const firstSeen = Puz.TAPE_WORD.split("").map((_, i) => { for (let e = 0; e <= 1; e += 0.005) if (Puz.tapeFrame(e)[i].phase !== "hidden") return e; return 2; });
  firstSeen.forEach((e, i) => { if (i) assert.ok(e > firstSeen[i - 1], `글자 ${i} 가 앞 글자보다 늦게 나온다`); });
  const seenWord = firstSeen.map((e, i) => [e, Puz.TAPE_WORD[i]]).sort((a, b) => a[0] - b[0]).map((x) => x[1]).join("");
  assert.equal(seenWord, Puz.TAPE_WORD, "나온 차례대로 읽으면 낱말");
});

test("4장: 칸(왼쪽→오른쪽)으로 읽으면 뒤섞이지만 같은 글자들이다", () => {
  assert.deepEqual([...Puz.TAPE_SLOT].sort(), [0, 1, 2, 3, 4, 5, 6]);
  const row = Puz.tapeFrame(1).slice().sort((a, b) => a.slot - b.slot).map((l) => l.ch).join("");
  assert.notEqual(row, Puz.TAPE_WORD); assert.notEqual(row, Puz.TAPE_WORD.split("").reverse().join(""));
  assert.equal([...row].sort().join(""), [...Puz.TAPE_WORD].sort().join(""));
  Puz.tapeFrame(1).forEach((l) => { const s = Puz.tapeSlotXY(l.slot); assert.ok(Math.abs(l.x - s[0]) < 1e-9 && Math.abs(l.y - s[1]) < 1e-9, "내려앉은 자리"); });
});

test("4장: 시간표는 매끄럽고(점프 없음) 되감기 진행이 늘 때 내려앉은 글자가 줄지 않는다", () => {
  let prev = Puz.tapeFrame(0), landed = 0;
  for (let e = 0.005; e <= 1.0001; e += 0.005) {
    const cur = Puz.tapeFrame(e), n = cur.filter((l) => l.phase === "landed").length;
    assert.ok(n >= landed, "내려앉은 수가 줄지 않는다"); landed = n;
    cur.forEach((l, i) => assert.ok(Math.hypot(l.x - prev[i].x, l.y - prev[i].y) < 0.12, `글자 ${i} 이 e=${e.toFixed(3)} 에서 튄다`));
    prev = cur;
  }
  assert.ok(Puz.tapePointSize(0) > Puz.tapePointSize(1) && Puz.tapePointSize(1) > 0);
  assert.equal(Puz.tapeOrderFallen(), Puz.TAPE_WORD.split("").reverse().join(""), "재생하면 거꾸로 떨어진다");
});

test("기억 복원: 지워진 낱말은 일기의 검은 칸 수와 맞고, 정답과 같은 뜻의 한글이다", () => {
  assert.equal((D.DIARY_HTML.diary2.match(/class="redacted"/g) || []).length, 1);
  assert.equal((D.DIARY_HTML.diary4.match(/class="redacted"/g) || []).length, 1);
  assert.equal(Puz.RESTORE[2], "아인슈타인"); assert.equal(Puz.RESTORE[4], "빅뱅");
  assert.equal(Object.keys(Puz.RESTORE).length, 2, "1장은 빈칸 숫자로 복원한다");
});

test("정답 새지 않음: puzzles.js 원문(봉인 제외)에 정답이 평문으로 없다", () => {
  const src = read("../puzzles.js").replace(/U\(\[[0-9, ]+\],\s*\d+\)/g, "");
  const flat = src.toLowerCase().replace(/[^a-z0-9]/g, "");
  for (let n = 1; n <= 8; n++) {
    const a = answerOf(n);
    if (/^\d+$/.test(a)) assert.ok(!new RegExp(`(^|[^0-9])${a}([^0-9]|$)`).test(src), `장 ${n}`);
    else assert.ok(!flat.includes(a.toLowerCase()), `장 ${n} 정답 ${a} 이(가) 평문에 있다`);
  }
});
