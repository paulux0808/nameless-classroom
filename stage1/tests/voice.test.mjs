import test from "node:test";
import assert from "node:assert/strict";
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
const V = require("../props/voice.js");
const half = () => 0.5;                                   /* 난수를 고정해 진폭을 예측 가능하게 */

test("음절마다 항목이 하나씩 생기고, 공백·쉼표·마침표는 쉼만 늘린다", () => {
  const a = V.parse("아이", half), b = V.parse("아 이", half), c = V.parse("아, 이.", half);
  assert.equal(a.seq.length, 2); assert.equal(b.seq.length, 2); assert.equal(c.seq.length, 2);
  assert.ok(b.end > a.end, "공백은 짧은 쉼");
  assert.ok(c.end > b.end, "쉼표와 마침표는 더 긴 쉼");
  assert.deepEqual(V.parse("", half).seq, []); assert.deepEqual(V.parse(null, half).seq, []);
  assert.equal(V.parse("«»()[]", half).seq.length, 0, "기호는 입을 움직이지 않는다");
});

test("모음: ㅏ 는 크게, ㅜ 는 작고 오므리고, ㅣ 는 작고 옆으로 벌어진다", () => {
  const [a] = V.parse("아", half).seq, [u] = V.parse("우", half).seq, [i] = V.parse("이", half).seq;
  assert.ok(a.a > u.a && a.a > i.a, "ㅏ 가 가장 크다");
  assert.ok(u.w < 0, "ㅜ 는 오므린다");
  assert.ok(i.w > 0, "ㅣ 는 옆으로 벌어진다");
  assert.equal(V.VOW.length, 21, "한글 모음 21개");
});

test("입술소리(ㅁㅂㅍ)는 그 끝에서 입을 다문다: 초성은 시작이, 종성은 끝이 0", () => {
  const [bam] = V.parse("밤", half).seq, [ga] = V.parse("가", half).seq, [gan] = V.parse("간", half).seq;
  assert.equal(bam.b0, true); assert.equal(bam.b1, true); assert.equal(ga.b0, false); assert.equal(gan.b1, false);
  assert.equal(V.sample([bam], bam.t0).a, 0, "시작은 다문 입");
  assert.ok(V.sample([bam], (bam.t0 + bam.t1) / 2).a > 0.3, "가운데는 열린다");
  assert.ok(V.sample([bam], bam.t1 - 1e-6).a < 0.02, "끝은 다시 다문다");
  assert.ok(V.sample([ga], ga.t0).a > 0, "ㅁㅂㅍ 이 아니면 음절 사이에서 완전히 다물지 않는다");
});

test("받침이 있으면 음절이 조금 길다", () => {
  const [ga] = V.parse("가", half).seq, [gan] = V.parse("간", half).seq;
  assert.ok(gan.t1 - gan.t0 > ga.t1 - ga.t0);
});

test("영문·숫자는 한 글자에 한 번, 알맞은 벌림", () => {
  const r = V.parse("A1", half);
  assert.equal(r.seq.length, 2); assert.ok(r.seq.every((g) => g.a > 0 && g.a <= 1));
});

test("sample: 앞으로 되감지 않는 커서(i), 끝나면 over, 시작 전에는 다문 입", () => {
  const { seq, end } = V.parse("안녕하세요", half);
  const r0 = V.sample(seq, 0); assert.equal(r0.over, false);
  const r1 = V.sample(seq, seq[2].t0 + 0.01, r0.i); assert.equal(r1.i, 2);
  const r2 = V.sample(seq, end + 1, r1.i); assert.equal(r2.over, true); assert.equal(r2.a, 0);
  const gap = V.parse("가 나", half).seq; assert.equal(V.sample(gap, gap[0].t1 + 0.01).a, 0, "띄어쓰기 사이는 다문 입");
});

test("진폭은 0..1, 난수가 달라도 벌림은 일정한 범위", () => {
  for (const rnd of [() => 0, () => 0.5, () => 0.999]) {
    const { seq } = V.parse("우리는 이 교실을 지키는 감독일세.", rnd);
    for (const g of seq) { assert.ok(g.a >= 0 && g.a <= 1.2, `a=${g.a}`); assert.ok(g.w >= -1 && g.w <= 1); }
  }
});

test("긴 대사도 길이는 글자 수에 거의 비례하고 말풍선 시간(1.5초+글자당 0.075초)을 크게 넘지 않는다", () => {
  const t = "…그 날이 맞네. 잉크가 제대로 스몄군. 다음 조각은 이 말이 가리키는 곳에 있네.";
  const { end } = V.parse(t, half), chars = Array.from(t).length;
  assert.ok(end < 1.5 + chars * 0.075 + 0.026 * chars, `end=${end} chars=${chars}`);
  assert.ok(end > chars * 0.05);
});
