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
const WHEELS = () => [...answerOf(1)].map(Number);                          /* 정답 숫자는 봉인 문자열에서 꺼낸다(평문으로 두지 않는다) */
test("1장: 바퀴 다섯 개의 숫자가 곧 정답 문자열이다(터미널 입력과 같은 답)", () => {
  const w = WHEELS(), good = Puz.stampAnswer(w);
  assert.equal(good, answerOf(1));
  const M = game(); assert.equal(M.answer(good).ok, true);
  const off = w.slice(); off[4] = (off[4] + 1) % 10;
  const M2 = game(); assert.equal(M2.answer(Puz.stampAnswer(off)).ok, false, "하루만 틀려도 통과하지 못한다");
});

test("1장: 바퀴 수·범위가 틀리면 null", () => {
  const w = WHEELS(), head = w.slice(0, 4);
  assert.equal(Puz.stampAnswer(head), null); assert.equal(Puz.stampAnswer(w.concat(0)), null);
  assert.equal(Puz.stampAnswer(head.concat(10)), null); assert.equal(Puz.stampAnswer(head.concat(-1)), null);
  assert.equal(Puz.stampAnswer(head.concat(1.5)), null); assert.equal(Puz.stampAnswer(answerOf(1)), null); assert.equal(Puz.stampAnswer(null), null);
});

test("1장: 도장 바퀴 모양이 일기 1편의 빈칸 모양과 같다(빈칸 3+1+1, 앞의 1 은 인쇄)", () => {
  const first = D.DIARY_HTML.diary1.split("</p>")[0];
  assert.equal((first.match(/class="blank"/g) || []).length, Puz.STAMP.wheels, "빈칸 수 = 바퀴 수");
  assert.ok(plain(first).startsWith(Puz.STAMP.prefix + "???년 ?월 ?일"), plain(first));
});

test("1장: dateParts 는 복원된 날짜를 글자 그대로 잇는다", () => {
  const parts = Puz.dateParts(answerOf(1));
  const a = answerOf(1);
  assert.equal(parts.map((p) => p.text).join(""), "1" + a.slice(0, 3) + "년 " + a[3] + "월 " + a[4] + "일");
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

/* ── 4장 신호 테이프(모스 부호) ── */
test("4장: 테이프 낱말은 정답과 같고, 모스 표는 글자마다 다른 부호를 가진다", () => {
  assert.equal(Puz.TAPE_WORD.toLowerCase(), answerOf(4));
  const codes = Object.values(Puz.MORSE); assert.equal(codes.length, 26); assert.equal(new Set(codes).size, 26, "부호가 겹치지 않는다");
  for (const ch of Puz.TAPE_WORD) assert.ok(Puz.morseOf(ch), ch + " 의 부호");
  assert.equal(Puz.morseDecode("... --- ..."), "SOS", "표 자체 확인(공개된 국제 모스 부호)");
  assert.equal(Puz.morseDecode(".-  /  -...  //  ..."), "AB S", "공백이 달라도 읽는다");
  assert.equal(Puz.morseDecode("........"), "?", "모르는 부호는 물음표");
});

test("4장: 별빛은 점 1칸·선 3칸·글자 안 1칸·글자 사이 3칸·낱말 사이 7칸으로 깜빡이고 앞뒤는 어둡다", () => {
  const sg = Puz.tapeSignal(), U = Puz.TAPE_UNIT;
  assert.equal(sg.segs.length, [...Puz.TAPE_WORD].reduce((n, ch) => n + Puz.morseOf(ch).length, 0), "깜빡임 수 = 부호 길이의 합");
  sg.segs.forEach((x, i) => {
    assert.ok(Math.abs((x.b - x.a) / U - (x.mark === "-" ? 3 : 1)) < 1e-9, `${i} 번째 길이`);
    if (i) {
      const gap = (x.a - sg.segs[i - 1].b) / U, same = x.letter === sg.segs[i - 1].letter;
      assert.ok(Math.abs(gap - (same ? 1 : x.letter === Puz.TAPE_BREAK ? 7 : 3)) < 1e-9, `${i} 번째 앞 쉼 ${gap}`);
    }
  });
  assert.equal(Puz.tapeLamp(0), false); assert.equal(Puz.tapeLamp(1), false);
  assert.ok(Puz.tapeLength() > 15 && Puz.tapeLength() < 45, "전체 길이(초) " + Puz.tapeLength());
  /* e 를 훑으며 켜진 구간을 세면 깜빡임 수와 같다 */
  let on = 0, prev = false; for (let i = 0; i <= 4000; i++) { const l = Puz.tapeLamp(i / 4000); if (l && !prev) on++; prev = l; }
  assert.equal(on, sg.segs.length);
});

test("4장: 화면을 보며 되감으면 낱말이 읽히고, 그냥 재생하면 시간이 거꾸로 흘러 뜻 없는 글자가 된다", () => {
  const rew = Puz.morseDecode(Puz.observe("rewind")), play = Puz.morseDecode(Puz.observe("play"));
  assert.equal(rew.replace(/ /g, "").toLowerCase(), answerOf(4));
  assert.deepEqual(rew.split(" ").map((w) => w.length), [3, 4], "두 낱말(3+4)");
  assert.ok(!play.includes("?"), "거꾸로 읽어도 부호는 모두 글자가 된다(그래서 더 그럴듯하다)");
  assert.notEqual(play.replace(/ /g, "").toLowerCase(), answerOf(4));
  /* 지름길 없음: 재생 결과를 통째로 뒤집거나 낱말 순서만 바꿔도 낱말이 되지 않는다 */
  const flat = (t) => t.replace(/ /g, "").toLowerCase();
  assert.notEqual(flat([...play].reverse().join("")), answerOf(4));
  assert.notEqual(flat(play.split(" ").reverse().join(" ")), answerOf(4));
  assert.notEqual(flat(play.split(" ").map((w) => [...w].reverse().join("")).join(" ")), answerOf(4));
});

test("4장: 사람이 적는 부호 표기는 관찰자와 같은 규칙(점·선·글자 사이·낱말 사이)으로 쓴다", () => {
  const pad = Puz.observe("rewind");
  assert.ok(/^[-./ ]+$/.test(pad), pad);
  assert.equal(pad.split(" // ").length, 2);
  assert.equal(pad.split(/ \/\/ | \/ /).length, 7, "글자 일곱");
});

test("4장: 점 크기는 끝에서 처음으로 갈수록 작아진다(한 점으로 모인다)", () => {
  assert.ok(Puz.tapePointSize(0) > Puz.tapePointSize(1) && Puz.tapePointSize(1) > 0);
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

test("컴퓨터 전원: 1~3장은 꺼져 있고 4~8장은 답을 넣는 동안만 켜진다", () => {
  const st = (ch, phase, extra = {}) => Object.assign({ ch, phase, exitReady: false, done: false }, extra);
  for (const ch of [1, 2, 3]) for (const phase of ["read", "search"]) assert.equal(Puz.computerState(st(ch, phase)), "off", `${ch}장 ${phase}`);
  for (const ch of [4, 5, 6, 7, 8]) {
    assert.equal(Puz.computerState(st(ch, "read")), "input", `${ch}장 읽기`);
    assert.equal(Puz.computerState(st(ch, "search")), "off", `${ch}장 탐색(답을 낸 뒤에는 다시 꺼진다)`);
  }
});

test("컴퓨터 전원: 탑이 완성되면 이름 입력에 켜지고, 이름을 맞힌 뒤에는 ‘마침’ 화면", () => {
  assert.equal(Puz.computerState({ ch: 9, phase: "read", exitReady: false, done: false }), "off", "탑을 완성하기 전에는 꺼져 있다");
  assert.equal(Puz.computerState({ ch: 9, phase: "read", exitReady: false, done: false }, { stackSolved: false }), "off");
  assert.equal(Puz.computerState({ ch: 9, phase: "read", exitReady: false, done: false }, { stackSolved: true }), "input", "탑이 완성되면 이름 입력에 켜진다");
  assert.equal(Puz.computerState({ ch: 9, phase: "read", exitReady: true, done: false }), "done");
  assert.equal(Puz.computerState({ ch: 9, phase: "read", exitReady: true, done: true }), "done");
  assert.equal(Puz.computerState(null), "off"); assert.equal(Puz.computerState(undefined), "off");
});

test("TV 전원: 4장(테이프)과 6장(영상)의 읽기 단계에서만 켜진다", () => {
  const on = [];
  for (let ch = 1; ch <= 9; ch++) for (const phase of ["read", "search"]) if (Puz.tvOn({ ch, phase, exitReady: false, done: false })) on.push(`${ch}${phase}`);
  assert.deepEqual(on, ["4read", "6read"]);
  assert.equal(Puz.tvOn({ ch: 4, phase: "read", exitReady: true, done: false }), false);
  assert.equal(Puz.tvOn(null), false);
});

