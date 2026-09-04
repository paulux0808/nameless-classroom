import test from "node:test";
import assert from "node:assert/strict";
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
const L = require("../logic.js");
const ch01 = require("../chapters/ch01.js");

test("진행도는 큐시트 §2.3 표를 그대로 따른다", () => {
  assert.deepEqual([0,1,2,3,4,5,6,7,8].map(L.progressFor), [0,8,19,31,44,57,69,82,100]);
  assert.equal(L.progressFor(-3), 0, "음수는 0으로");
  assert.equal(L.progressFor(99), 100, "8을 넘겨도 100을 넘지 않는다");
});

test("도장은 도덕 선택지가 아니다 — 검증이 끝난 국면에서만 활성", () => {
  const { PHASE } = L;
  assert.equal(L.activeStamp(PHASE.SUBMITTED), null);
  assert.equal(L.activeStamp(PHASE.INSPECTING), null);
  assert.equal(L.activeStamp(PHASE.CONTRADICTION), "REJECTED");
  assert.equal(L.activeStamp(PHASE.REJECTED), null, "반려 직후에는 아무 도장도 못 찍는다");
  assert.equal(L.activeStamp(PHASE.REVISED), null, "재제출만으로는 승인할 수 없다");
  assert.equal(L.activeStamp(PHASE.VERIFIED), "APPROVED");
  assert.equal(L.activeStamp(PHASE.APPROVED), null);
});

test("모순을 다 찾기 전에는 REJECTED를 찍을 수 없다", () => {
  const { PHASE } = L;
  const req = L.requiredClaims(ch01);
  assert.equal(L.nextPhase(PHASE.SUBMITTED, req, []), PHASE.SUBMITTED);
  assert.equal(L.nextPhase(PHASE.SUBMITTED, req, [req[0]]), PHASE.INSPECTING);
  assert.equal(L.nextPhase(PHASE.INSPECTING, req, req.slice(0, 2)), PHASE.INSPECTING);
  assert.equal(L.nextPhase(PHASE.INSPECTING, req, req), PHASE.CONTRADICTION);
  assert.ok(!L.canStamp(PHASE.INSPECTING, "REJECTED"));
  assert.ok(L.canStamp(L.nextPhase(PHASE.INSPECTING, req, req), "REJECTED"));
});

test("재검증을 통과해야 APPROVED가 열린다", () => {
  const { PHASE } = L;
  const req = L.requiredClaims(ch01);
  assert.equal(L.nextPhase(PHASE.REVISED, req, []), PHASE.REVISED);
  assert.equal(L.nextPhase(PHASE.REVISED, req, req), PHASE.VERIFIED);
  assert.ok(L.canStamp(PHASE.VERIFIED, "APPROVED"));
  assert.ok(!L.canStamp(PHASE.VERIFIED, "REJECTED"), "검증된 문서에 반려는 열리지 않는다");
});

test("국면은 되돌아가지 않는다", () => {
  const { PHASE } = L;
  const req = L.requiredClaims(ch01);
  assert.equal(L.nextPhase(PHASE.APPROVED, req, []), PHASE.APPROVED);
  assert.equal(L.nextPhase(PHASE.REJECTED, req, []), PHASE.REJECTED);
});

test("CH1~8 동안 잠긴 표현은 어떤 경로로도 새지 않는다", () => {
  const { SPOILER } = L;
  for (const t of ["Oppenheimer", "Hiroshima", "Little Boy", "Manhattan Project", "Trinity"]) {
    assert.ok(!L.termAllowed(t, SPOILER.CHAPTERS), `${t}가 CH1~8에서 노출된다`);
  }
  assert.ok(L.termAllowed("RICHARD", SPOILER.CHAPTERS), "표시 이름은 허용");
  assert.ok(L.termAllowed("박사님", SPOILER.CHAPTERS));
});

test("스포일러 레벨이 오르면 정해진 표현만 풀린다", () => {
  const { SPOILER } = L;
  assert.ok(L.termAllowed("Hiroshima", SPOILER.RESULTS), "CH9에서 지명은 풀린다");
  assert.ok(L.termAllowed("Little Boy", SPOILER.RESULTS));
  assert.ok(!L.termAllowed("Oppenheimer", SPOILER.RESULTS), "정체는 CH10까지 잠긴다");
  assert.ok(L.termAllowed("Oppenheimer", SPOILER.IDENTITY));
});

test("findLeaks는 단어 경계를 지킨다", () => {
  assert.deepEqual(L.findLeaks("계산 결과를 확인해 주십시오.", 0), []);
  assert.ok(L.findLeaks("Report to Oppenheimer", 0).includes("oppenheimer"));
  assert.deepEqual(L.findLeaks("bombardment chamber", 0), [],
    "bombardment 안의 bomb를 오탐하지 않는다");
  assert.ok(L.findLeaks("the bomb casing", 0).includes("bomb"));
});

test("CH01 대사와 보고서에 스포일러 누출이 없다", () => {
  const blob = JSON.stringify(ch01);
  assert.deepEqual(L.findLeaks(blob, L.SPOILER.CHAPTERS), [],
    "CH01 데이터에 CH1~8에서 금지된 표현이 들어 있다");
});

test("저장 상태 검증 — 손상된 값은 복구하고 못 고치면 폐기", () => {
  const ok = L.normalizeState({ started: true, chapter: 3, phase: "revised",
    claims: ["a"], approved: [1, 2], spoiler: 0, seenResults: false, done: false });
  assert.equal(ok.chapter, 3);

  const repaired = L.normalizeState({ started: 1, chapter: 99, phase: "말도안됨",
    claims: ["a", 5, "b"], approved: [1, 1, 2, 77], spoiler: 9 });
  assert.equal(repaired.chapter, 10, "범위 밖 챕터는 잘린다");
  assert.equal(repaired.phase, L.PHASE.SUBMITTED, "모르는 국면은 초기화");
  assert.deepEqual(repaired.claims, ["a", "b"], "문자열이 아닌 주장 제거");
  assert.deepEqual(repaired.approved, [1, 2], "중복·범위 밖 제거");
  assert.equal(repaired.started, true, "불리언으로 강제");

  assert.equal(L.normalizeState(null), null);
  assert.equal(L.normalizeState("문자열"), null);
});

test("스포일러 레벨은 저장본이 앞서 나가도 진행에서 되돌린다", () => {
  const forged = L.normalizeState({ started: true, chapter: 2, phase: "submitted",
    claims: [], approved: [1], spoiler: 2, seenResults: false, done: false });
  assert.equal(forged.spoiler, L.SPOILER.CHAPTERS,
    "저장본을 고쳐도 CH2에서 정체가 풀리면 안 된다");

  const earned = L.normalizeState({ started: true, chapter: 10, phase: "approved",
    claims: [], approved: [1,2,3,4,5,6,7,8], spoiler: 2, seenResults: true, done: true });
  assert.equal(earned.spoiler, L.SPOILER.IDENTITY);
});

test("damp는 프레임 시간에 독립이다", () => {
  let a = 1, b = 1;
  a *= 1 - L.damp(0.2, 1 / 60);
  b *= 1 - L.damp(0.2, 1 / 120);
  b *= 1 - L.damp(0.2, 1 / 120);
  assert.ok(Math.abs(a - b) < 1e-12);
});

/* ── 보고서 모델 ─────────────────────────────────────────────────────── */
/* ── 세트 모델 ───────────────────────────────────────────────────────── */

test("CH01 감사 — 퍼즐이 실제로 성립한다", () => {
  assert.deepEqual(L.auditChapter(ch01), []);
});

test("맞는 세트와 어긋난 세트가 둘 다 있다 — 함정 없이는 짝만 맞추면 풀린다", () => {
  const agree = ch01.sets.filter(x => x.agree);
  const broken = L.brokenSets(ch01);
  assert.ok(agree.length >= 6, `일치 세트가 ${agree.length} 개뿐이다`);
  assert.ok(broken.length >= 6, `어긋난 세트가 ${broken.length} 개뿐이다`);
});

test("세트마다 장에 하나씩만 있다", () => {
  for (const set of ch01.sets) {
    const ms = L.setMembers(ch01.reports, set.id);
    assert.equal(ms.length, ch01.reports.length, `${set.id} 의 문장 수가 다르다`);
    const sheets = new Set(ms.map(m => m.report.id));
    assert.equal(sheets.size, ch01.reports.length, `${set.id} 가 한 장에 둘 있다`);
  }
});

test("어긋남은 한 장에 몰려 있지 않다", () => {
  const where = new Set(L.brokenSets(ch01).map(id => L.setById(ch01, id).odd));
  assert.ok(where.size >= 2, `어긋남이 ${[...where]} 한 장에 몰려 있다`);
});

test("세 문장을 다 골라야 판정된다 — 둘까지는 아무것도 알 수 없다", () => {
  const ms = L.setMembers(ch01.reports, "std").map(m => m.st.id);
  assert.equal(L.judgeSelection(ch01, ch01.reports, []).reason, "short");
  assert.equal(L.judgeSelection(ch01, ch01.reports, [ms[0]]).reason, "short");
  assert.equal(L.judgeSelection(ch01, ch01.reports, [ms[0], ms[1]]).reason, "short");
  const done = L.judgeSelection(ch01, ch01.reports, ms);
  assert.ok(done.ok);
  assert.equal(done.set.id, "std");
});

test("한 장에서 둘을 고르면 세트가 되지 않는다", () => {
  const r1 = L.statementsOf(ch01.reports[0]).map(s => s.id);
  const r2 = L.statementsOf(ch01.reports[1])[0].id;
  const r = L.judgeSelection(ch01, ch01.reports, [r1[0], r1[1], r2]);
  assert.ok(!r.ok);
  assert.equal(r.reason, "sameSheet");
});

test("서로 다른 것을 말하는 셋은 세트가 아니다", () => {
  const a = L.setMembers(ch01.reports, "std");
  const b = L.setMembers(ch01.reports, "deck");
  const r = L.judgeSelection(ch01, ch01.reports,
    [a[0].st.id, a[1].st.id, b[2].st.id]);
  assert.ok(!r.ok);
  assert.equal(r.reason, "notASet");
});

test("맞는 세트를 짚어도 그 자리에서는 아무 판정도 나오지 않는다", () => {
  /* 짝을 맞추는 것과 어긋났다고 주장하는 것은 다르다 —
     여기서 바로 알려 주면 12세트를 다 눌러 보는 것으로 풀린다. */
  const ms = L.setMembers(ch01.reports, "dur").map(m => m.st.id);
  const r = L.judgeSelection(ch01, ch01.reports, ms);
  assert.ok(r.ok, "짝은 맞다");
  assert.equal(r.set.id, "dur");
  assert.ok(!("correct" in r), "옳은지 그른지를 여기서 알려 주면 안 된다");
});

test("판정은 과학자가 한다 — 한 번에 알려 주는 것은 많아야 하나", () => {
  const broken = L.brokenSets(ch01);

  assert.equal(L.judgeClaims(ch01, []).verdict, "none");
  assert.equal(L.judgeClaims(ch01, broken.slice(0, 2)).verdict, "short",
    "덜 짚었으면 남았다고만 한다");

  /* 맞는 세트를 어긋났다고 주장하면 그 하나만 물린다 */
  const withTrap = broken.concat(["dur"]);
  const bad = L.judgeClaims(ch01, withTrap);
  assert.equal(bad.verdict, "wrong");
  assert.equal(bad.set.id, "dur");
  assert.deepEqual(L.dropClaim(withTrap, "dur").sort(), broken.slice().sort());

  assert.equal(L.judgeClaims(ch01, broken).verdict, "settled");
});

test("함정을 여럿 짚어도 한 번에 하나씩만 물린다", () => {
  const claims = ["dur", "digits", ...L.brokenSets(ch01)];
  let list = claims, rounds = 0;
  while (L.judgeClaims(ch01, list).verdict === "wrong") {
    list = L.dropClaim(list, L.judgeClaims(ch01, list).set.id);
    rounds++;
    assert.ok(rounds < 10, "무한 반복");
  }
  assert.equal(rounds, 2, "함정 두 개면 두 번 되돌려 보내야 한다");
  assert.equal(L.judgeClaims(ch01, list).verdict, "settled");
});

test("어긋난 세트를 다 짚기 전에는 REJECTED 가 열리지 않는다", () => {
  const { PHASE } = L;
  const req = L.requiredClaims(ch01);
  assert.equal(L.nextPhase(PHASE.SUBMITTED, req, []), PHASE.SUBMITTED);
  assert.equal(L.nextPhase(PHASE.INSPECTING, req, req.slice(0, 3)), PHASE.INSPECTING);
  assert.equal(L.nextPhase(PHASE.INSPECTING, req, req), PHASE.CONTRADICTION);
  assert.ok(L.canStamp(PHASE.CONTRADICTION, "REJECTED"));
});

test("같은 것을 저마다 다르게 말한다 — 표현이 같으면 세트가 눈에 띈다", () => {
  /* 판정은 값이 아니라 선언(agree/odd)이 한다. 텍스트는 위장이므로
     한 세트 안에서 문장이 그대로 겹치면 짝이 거저 보인다. */
  let varied = 0;
  for (const set of ch01.sets) {
    const texts = L.setMembers(ch01.reports, set.id).map(m => m.st.t);
    if (new Set(texts).size === texts.length) varied++;
  }
  assert.ok(varied >= ch01.sets.length - 1,
    `${ch01.sets.length - varied} 개 세트에서 문장이 그대로 겹친다`);
});

test("자리와 어긋남을 섞어 부르지 않는다", () => {
  /* C-114 / C-117 / C-114 는 같은 자리를 두고 적은 것이되 어긋나 있다.
     그걸 "같은 얘기를 하는 자리" 라고 부르면 말이 꼬인다. */
  const blob = JSON.stringify(ch01);
  for (const mixed of ["수치", "같은 값", "값이 같", "동일", "같은 얘기"]) {
    assert.ok(!blob.includes(mixed), `"${mixed}" 이 섞여 있다`);
  }
});

test("리처드는 규칙을 읊지 않는다 — 세 장이 같다고 믿고 들어온다", () => {
  const first = ch01.lines.submission;
  const joined = first.join(" ");
  assert.ok(first.length <= 7, `첫 대사가 ${first.length} 줄이다. 설명이 길다`);
  assert.ok(joined.length < 220, `첫 대사가 ${joined.length} 자다. 설명이 길다`);
  for (const meta of ["보시는 법", "예를 들어", "고르시면 됩니다", "골라 주십시오"]) {
    assert.ok(!joined.includes(meta), `게임 설명이 남아 있다: "${meta}"`);
  }
  assert.ok(/같은 기록|같을 겁니다|똑같/.test(joined),
    "세 장이 같다는 주장이 없다 — 그게 뒤집을 대상이다");
});

test("틀린 걸 짚어 주면 사과부터 한다", () => {
  /* 자기 실수를 지적당한 사람의 말이어야 한다.
     "여기까지는 맞습니다" 는 퀴즈 진행자의 말이지 이 사람의 말이 아니다. */
  const notYet = ch01.lines.notYet.join(" ");
  assert.ok(/죄송|잘못|틀린/.test(notYet), `사과가 없다: "${notYet}"`);
  assert.ok(!/맞습니다|정답|맞았/.test(notYet), `채점하는 말이 남아 있다: "${notYet}"`);
});

test("두 번째부터는 짧게 말한다", () => {
  const first = ch01.lines.submission.join(" ").length;
  for (const key of ["probing", "notYet", "revisedAgain", "rejected"]) {
    const later = ch01.lines[key].join(" ").length;
    assert.ok(later < first / 2,
      `${key} 가 첫 대사만큼 길다 (${later} vs ${first})`);
  }
});

test("줄글이다 — 문장 사이에 잇는 말이 있다", () => {
  let glue = 0;
  for (const r of ch01.reports)
    for (const para of r.body)
      for (const c of para) if (typeof c === "string") glue++;
  assert.ok(glue >= 8, `잇는 말이 ${glue} 군데뿐이면 줄글이 아니라 표다`);
});

test("세 장의 생김새가 서로 다르다", () => {
  const shapes = ch01.reports.map(r => r.body.length);
  assert.ok(new Set(shapes).size > 1, `문단 수가 ${shapes} 로 다 같다`);
  for (const set of ch01.sets) {
    const at = ch01.reports.map(r => L.statementsOf(r).findIndex(s => s.set === set.id));
    assert.ok(new Set(at).size > 1, `${set.id} 가 세 장 모두 ${at[0] + 1}번째다`);
  }
});

test("텍스트만 보고는 못 푼다 — 어느 문장도 스스로 답을 알려주지 않는다", () => {
  const blob = JSON.stringify(ch01.reports);
  for (const giveaway of ["미상", "불명", "오류", "잘못", "틀림", "이상하", "확인 필요"]) {
    assert.ok(!blob.includes(giveaway), `자료에 "${giveaway}" 가 있으면 답이 보인다`);
  }
});

test("수정본에는 반려한 자리만 실린다 — 다시 읽는 것으로 확인이 끝난다", () => {
  const rev = L.reportsFor(ch01, L.PHASE.REVISED);
  assert.equal(rev, ch01.revisedReports);
  for (const id of ch01.revisedSets) {
    const ms = L.setMembers(rev, id);
    assert.equal(ms.length, rev.length, `${id} 가 수정본에 다 없다`);
  }
  for (const r of rev)
    for (const st of L.statementsOf(r))
      assert.ok(ch01.revisedSets.includes(st.set), `수정본에 ${st.set} 이 있다`);
  /* 맞는 자리를 한 번 더 짚게 하지 않는다 — 확인 절차는 읽는 것뿐이다 */
  assert.equal(typeof L.applyVerifySet, "undefined",
    "재검증 클릭이 되살아났다. 절차만 늘어난다");
});

test("auditChapter는 함정 없는 데이터를 잡아낸다", () => {
  const noTrap = JSON.parse(JSON.stringify(ch01));
  noTrap.sets = noTrap.sets.filter(x => !x.agree);
  const keep = new Set(noTrap.sets.map(x => x.id));
  for (const r of noTrap.reports)
    r.body = r.body.map(p => p.filter(c => typeof c === "string" || keep.has(c.set)));
  assert.ok(L.auditChapter(noTrap).some(p => p.includes("함정")),
    L.auditChapter(noTrap).join(" / "));
});

test("auditChapter는 어긋남이 한 장에 몰린 것을 잡아낸다", () => {
  const piled = JSON.parse(JSON.stringify(ch01));
  piled.sets.forEach(x => { if (!x.agree) x.odd = "r2"; });
  assert.ok(L.auditChapter(piled).some(p => p.includes("한 장에 몰려")));
});

test("auditChapter는 세트가 한 장에 둘 있는 것을 잡아낸다", () => {
  const dup = JSON.parse(JSON.stringify(ch01));
  const r1 = dup.reports[0];
  r1.body[0].push({ id: "r1_dup", set: "std", t: "기준표는 개정 A 다." });
  assert.ok(L.auditChapter(dup).some(p => p.includes("문장이")),
    L.auditChapter(dup).join(" / "));
});

test("auditChapter는 스포일러 누출을 부팅 전에 잡는다", () => {
  const leaky = JSON.parse(JSON.stringify(ch01));
  leaky.lines.probing = ["오펜하이머 박사님께 올리겠습니다."];
  assert.ok(L.auditChapter(leaky).some(p => p.includes("잠긴 표현")));
});

test("CH01 전 구간 — 조사에서 승인까지 국면이 끊기지 않는다", () => {
  const { PHASE } = L;
  const req = L.requiredClaims(ch01);
  let phase = PHASE.SUBMITTED, claims = [], verified = [];

  // 1. 어긋난 세트를 문장 셋으로 짚는다
  const reps = L.reportsFor(ch01, phase);
  for (const id of req) {
    const ids = L.setMembers(reps, id).map(m => m.st.id);
    const j = L.judgeSelection(ch01, reps, ids);
    assert.ok(j.ok && j.set.id === id, `${id} 를 세트로 짚을 수 없다`);
    claims = L.applyClaim(ch01, claims, id).claims;
    phase = L.nextPhase(phase, req, claims);
  }
  assert.equal(L.judgeClaims(ch01, claims).verdict, "settled");
  assert.equal(phase, PHASE.CONTRADICTION);
  assert.equal(L.activeStamp(phase), "REJECTED");

  // 2. 반려 → 나갔다 돌아옴 → 수정본
  phase = PHASE.REJECTED;
  assert.equal(L.activeStamp(phase), null);
  phase = PHASE.REVISED;
  const rev = L.reportsFor(ch01, phase);

  // 3. 다시 해 온 것은 읽으면 확인이 끝난다
  for (const id of ch01.revisedSets) assert.ok(L.setMembers(rev, id).length === rev.length);
  verified = req.slice();
  phase = L.nextPhase(phase, req, verified);
  assert.equal(phase, PHASE.VERIFIED);
  assert.equal(L.activeStamp(phase), "APPROVED");
  assert.equal(L.progressFor(1), 8);
});

test("저장 상태는 고르던 문장과 주장을 실어 나른다", () => {
  const s = L.normalizeState({
    started: true, chapter: 1, phase: "inspecting", greeted: true,
    sel: ["r1_std"], claims: ["std", "deck"], verified: [],
    approved: [], spoiler: 0, seenResults: false, done: false
  });
  assert.ok(s, "정상 저장본이 폐기됐다");
  assert.equal(s.greeted, true);
  assert.deepEqual(s.sel, ["r1_std"]);
  assert.deepEqual(s.claims, ["std", "deck"]);

  const junk = L.repairState({ greeted: "yes", sel: ["a", 3], claims: [null, "b"] });
  assert.equal(junk.greeted, true, "불리언으로 강제");
  assert.deepEqual(junk.sel, ["a"]);
  assert.deepEqual(junk.claims, ["b"]);

  /* 예전 저장본이 쓰던 것들은 버린다 */
  const old = L.normalizeState({ started: true, chapter: 1, phase: "inspecting",
    odd: "r2", marks: ["x"], found: ["y"], confronted: true,
    sel: [], claims: [], verified: [], approved: [], spoiler: 0,
    seenResults: false, done: false, greeted: false });
  assert.ok(old, "예전 저장본이 폐기됐다");
  assert.equal(old.odd, undefined);
  assert.equal(old.marks, undefined);
});
