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

/* ── 2장 액자 뒷면 ── */
const owners = () => Object.fromEntries(Object.entries(D.SYM_OF).map(([id, sym]) => [sym, id]));
test("2장: 종이의 기호 순서는 위에서 아래로 처음 나오는 순서이고 다섯 기호가 모두 나온다", () => {
  const order = Puz.sheetOrder(D);
  assert.deepEqual(order, ["apple", "compass", "sun", "pi", "sqrt"]);
  assert.equal(new Set(order).size, 5);
  assert.deepEqual(Object.keys(owners()).sort(), [...order].sort(), "기호마다 주인 액자가 하나씩 있다");
  assert.equal(Puz.BACK_SPLIT.length, order.length);
});

test("2장: 설명판 본문만으로 기호의 주인이 하나로 정해진다(여섯째는 남는다) — 머리말(핵심 줄)을 지워도", () => {
  const bodies = Object.fromEntries(D.SCI.map((s) => [s.id, s.body]));
  /* 열쇠말이 본문에 나오는 사람들 */
  const cands = Object.fromEntries(Object.entries(Puz.SYM_WORDS).map(([sym, words]) => [sym, D.SCI.filter((s) => words.some((w) => bodies[s.id].includes(w))).map((s) => s.id)]));
  Object.entries(cands).forEach(([sym, ids]) => assert.ok(ids.length >= 1, `${sym} 의 후보가 본문에 있다`));
  /* 기호 → 사람으로 가는 완전 짝짓기를 모두 센다: 정확히 하나이고, 그것이 SYM_OF 와 같다 */
  const syms = Object.keys(cands), found = [];
  (function walk(i, used, pick) {
    if (i === syms.length) { found.push({ ...pick }); return; }
    for (const id of cands[syms[i]]) if (!used.has(id)) { used.add(id); pick[syms[i]] = id; walk(i + 1, used, pick); used.delete(id); delete pick[syms[i]]; }
  })(0, new Set(), {});
  assert.equal(found.length, 1, "짝짓기 경우의 수: " + found.length + " " + JSON.stringify(cands));
  assert.deepEqual(found[0], owners());
  const spare = [...D.SCI.map((s) => s.id)].filter((id) => !Object.values(found[0]).includes(id));
  assert.deepEqual([...spare], ["einstein"]);
  /* 화면은 머리말 줄(핵심)을 보여 주지 않는다 */
  assert.ok(!/s\.key\b/.test(readFileSync(new URL("../screens.js", import.meta.url), "utf8")), "설명판에 ‘핵심’ 줄을 싣지 않는다");
});

test("2장: 종이의 순서대로 주인 액자의 뒷면 글자를 이어 읽으면 정답이다", () => {
  assert.equal(Puz.backReading(D).toLowerCase(), answerOf(2));
  const chunks = Puz.sheetOrder(D).map((sym) => Puz.frameBack(D, owners()[sym]));
  assert.deepEqual(chunks.map((c) => c.length), Puz.BACK_SPLIT);
  /* 한 액자의 쪽지만 보아서는 정답이 아니다 */
  D.SCI.forEach((s) => assert.notEqual(Puz.frameBack(D, s.id).toLowerCase(), answerOf(2)));
});

test("2장: 풀이에 지름길이 없다 — 뒷면을 다른 차례로 읽거나 기호 없는 액자를 끼우면 정답이 되지 않는다", () => {
  const order = Puz.sheetOrder(D), own = owners(), ok = answerOf(2);
  const read = (ids) => ids.map((id) => Puz.frameBack(D, id)).join("").toLowerCase();
  const right = order.map((sym) => own[sym]);
  assert.equal(read(right), ok);
  /* 모든 차례(5! = 120)에서 정답이 되는 것은 종이의 순서 하나뿐(글자 조각 둘이 같아서 겹치는 차례는 같은 글이다) */
  const perms = []; (function p(a, rest) { if (!rest.length) perms.push(a); rest.forEach((x, i) => p([...a, x], rest.filter((_, k) => k !== i))); })([], right);
  const same = perms.filter((ids) => read(ids) === ok);
  assert.ok(same.length >= 1 && same.length <= 4, "정답이 되는 차례: " + same.length);
  const spareId = D.SCI.map((s) => s.id).find((id) => !D.SYM_OF[id]);
  assert.notEqual(read([...right.slice(0, 4), spareId]), ok, "기호 없는 액자 쪽지를 끼우면 낱말이 되지 않는다");
  assert.notEqual(Puz.frameBack(D, spareId), "", "기호 없는 액자에도 쪽지가 있다(비어 있어서 들통나지 않게)");
  /* 뒷면 글자는 저장소에 평문 낱말로 없다 */
  assert.ok(!readFileSync(new URL("../puzzles.js", import.meta.url), "utf8").toLowerCase().includes(ok), "정답 낱말이 평문으로 없다");
});

/* ── 3장 명단 ── */
test("3장: 명단은 일기 3편에 적힌 순서 그대로다", () => {
  const text = plain(D.DIARY_HTML.diary3), at = Puz.ROSTER.slice(0, -1).map((n) => text.indexOf(n));
  assert.ok(at.every((i) => i > 0) && at.every((v, i) => i === 0 || v > at[i - 1]), "이름이 본문에 차례로 나온다");
  assert.ok(text.indexOf("그리고 나", at[at.length - 1]) > 0); assert.equal(Puz.ROSTER.at(-1), "나"); assert.equal(Puz.ROSTER.length, 9);
});

test("3장: 포지션을 세어 아홉 개인 종목은 하나뿐이고, 아홉 번째 포지션이 정답이다 — ‘한 팀 인원’만 믿으면 틀린다", () => {
  const nine = D.SPORTS.filter((s) => s.roles.length === Puz.ROSTER.length);
  assert.equal(nine.length, 1); assert.equal(nine[0].id, "rowing");
  assert.ok(nine[0].roles[Puz.ROSTER.length - 1].toLowerCase().includes(answerOf(3)), nine[0].roles.at(-1));
  /* 함정: 인원 표기가 아홉인 종목이 둘이다(야구는 지명타자 때문에 포지션이 열 개) */
  const byPlayers = [...D.SPORTS.filter((s) => s.players === Puz.ROSTER.length).map((s) => s.id)].sort();
  assert.deepEqual(byPlayers, ["baseball", "rowing"]);
  const wrongPick = D.SPORTS.find((s) => s.id === "baseball");
  assert.ok(!wrongPick.roles[Puz.ROSTER.length - 1].toLowerCase().includes(answerOf(3)), "야구의 아홉 번째 포지션은 정답이 아니다");
  /* 몸무게 단서: 조정 설명에 타수의 체중 규정이 있다 */
  assert.ok(/체중/.test(nine[0].rule));
  /* 화면은 이름을 자리에 앉혀 주지 않는다 */
  assert.ok(!/rosterFit|\bseats?\b|verdict/.test(readFileSync(new URL("../stations.js", import.meta.url), "utf8")), "자동 앉히기·판정이 없다");
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

test("컴퓨터 전원: 1장은 꺼져 있고(날짜 도장이 제출) 2~8장은 답을 넣는 동안만 켜진다", () => {
  const st = (ch, phase, extra = {}) => Object.assign({ ch, phase, exitReady: false, done: false }, extra);
  for (const phase of ["read", "search"]) assert.equal(Puz.computerState(st(1, phase)), "off", `1장 ${phase}`);
  for (const ch of [2, 3, 4, 5, 6, 7, 8]) {
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

