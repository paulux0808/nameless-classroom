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
  const req = ch01.required;
  assert.equal(L.nextPhase(PHASE.SUBMITTED, req, []), PHASE.SUBMITTED);
  assert.equal(L.nextPhase(PHASE.SUBMITTED, req, ["chain_bc"]), PHASE.INSPECTING);
  assert.equal(L.nextPhase(PHASE.INSPECTING, req, ["chain_bc", "batch_c"]), PHASE.INSPECTING);
  assert.equal(L.nextPhase(PHASE.INSPECTING, req, req), PHASE.CONTRADICTION);
  assert.ok(!L.canStamp(PHASE.INSPECTING, "REJECTED"));
  assert.ok(L.canStamp(L.nextPhase(PHASE.INSPECTING, req, req), "REJECTED"));
});

test("재검증을 통과해야 APPROVED가 열린다", () => {
  const { PHASE } = L;
  const req = ch01.required;
  assert.equal(L.nextPhase(PHASE.REVISED, req, []), PHASE.REVISED);
  assert.equal(L.nextPhase(PHASE.REVISED, req, req), PHASE.VERIFIED);
  assert.ok(L.canStamp(PHASE.VERIFIED, "APPROVED"));
  assert.ok(!L.canStamp(PHASE.VERIFIED, "REJECTED"), "검증된 문서에 반려는 열리지 않는다");
});

test("국면은 되돌아가지 않는다", () => {
  const { PHASE } = L;
  assert.equal(L.nextPhase(PHASE.APPROVED, ch01.required, []), PHASE.APPROVED);
  assert.equal(L.nextPhase(PHASE.REJECTED, ch01.required, []), PHASE.REJECTED);
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

test("CH01 대사와 문서에 스포일러 누출이 없다", () => {
  const blob = JSON.stringify(ch01);
  assert.deepEqual(L.findLeaks(blob, L.SPOILER.CHAPTERS), [],
    "CH01 데이터에 CH1~8에서 금지된 표현이 들어 있다");
});

test("CH01의 요구 모순이 실제로 성립하고, 수정본에서 해소된다", () => {
  assert.deepEqual(L.auditChapter(ch01), []);
  for (const r of ch01.rules) {
    assert.ok(L.ruleHolds(r, ch01.docs), `${r.id} 가 원본에서 성립하지 않는다`);
  }
  const merged = { ...ch01.docs, ...ch01.revisedDocs };
  for (const r of ch01.rules) {
    assert.ok(!L.ruleHolds(r, merged), `${r.id} 가 수정본에서도 남아 있다`);
  }
});

test("auditChapter는 잘못된 챕터 데이터를 잡아낸다", () => {
  const broken = {
    docs: { a: { fields: { v: "1" } }, b: { fields: { v: "1" } } },
    rules: [{ id: "x", kind: "mismatch", left: "a.fields.v", right: "b.fields.v" }],
    required: ["x", "없는규칙"]
  };
  const problems = L.auditChapter(broken);
  assert.ok(problems.some(p => p.includes("모순이 성립하지 않는")), "같은 값인데 mismatch를 요구");
  assert.ok(problems.some(p => p.includes("없는 규칙")), "존재하지 않는 규칙 참조");
});

test("ruleHolds — 날짜 기반 규칙", () => {
  const docs = {
    cal: { fields: { doneOn: "1944-03-01" } },
    ref: { fields: { replacedOn: "1944-03-20" } },
    std: { fields: { revisedOn: "1944-02-01" } }
  };
  assert.ok(L.ruleHolds({ kind: "superseded", usedAt: "cal.fields.doneOn",
    replacedAt: "ref.fields.replacedOn" }, docs), "교정 후 기준기가 교체되면 무효");
  assert.ok(!L.ruleHolds({ kind: "stale", appliedAt: "cal.fields.doneOn",
    revisedAt: "std.fields.revisedOn" }, docs), "개정이 적용보다 앞서면 문제 없음");
});

test("저장 상태 검증 — 손상된 값은 복구하고 못 고치면 폐기", () => {
  const ok = L.normalizeState({ started: true, chapter: 3, phase: "revised",
    found: ["a"], approved: [1, 2], spoiler: 0, seenResults: false, done: false });
  assert.equal(ok.chapter, 3);

  const repaired = L.normalizeState({ started: 1, chapter: 99, phase: "말도안됨",
    found: ["a", 5, "b"], approved: [1, 1, 2, 77], spoiler: 9 });
  assert.equal(repaired.chapter, 10, "범위 밖 챕터는 잘린다");
  assert.equal(repaired.phase, L.PHASE.SUBMITTED, "모르는 국면은 초기화");
  assert.deepEqual(repaired.found, ["a", "b"], "문자열이 아닌 finding 제거");
  assert.deepEqual(repaired.approved, [1, 2], "중복·범위 밖 제거");
  assert.equal(repaired.started, true, "불리언으로 강제");

  assert.equal(L.normalizeState(null), null);
  assert.equal(L.normalizeState("문자열"), null);
});

test("스포일러 레벨은 저장본이 앞서 나가도 진행에서 되돌린다", () => {
  const forged = L.normalizeState({ started: true, chapter: 2, phase: "submitted",
    found: [], approved: [1], spoiler: 2, seenResults: false, done: false });
  assert.equal(forged.spoiler, L.SPOILER.CHAPTERS,
    "저장본을 고쳐도 CH2에서 정체가 풀리면 안 된다");

  const earned = L.normalizeState({ started: true, chapter: 10, phase: "approved",
    found: [], approved: [1,2,3,4,5,6,7,8], spoiler: 2, seenResults: true, done: true });
  assert.equal(earned.spoiler, L.SPOILER.IDENTITY);
});

test("damp는 프레임 시간에 독립이다", () => {
  let a = 1, b = 1;
  a *= 1 - L.damp(0.2, 1 / 60);
  b *= 1 - L.damp(0.2, 1 / 120);
  b *= 1 - L.damp(0.2, 1 / 120);
  assert.ok(Math.abs(a - b) < 1e-12);
});

test("두 필드를 대조하면 해당 모순이 드러난다", () => {
  const r = L.applyCompare(ch01, [], "cardB.fields.output", "cardC.fields.input");
  assert.equal(r.rule.id, "chain_bc");
  assert.ok(r.isNew);
  assert.deepEqual(r.found, ["chain_bc"]);
});

test("대조 순서는 상관없다", () => {
  const a = L.matchRule(ch01.rules, "cardB.fields.output", "cardC.fields.input", ch01.docs);
  const b = L.matchRule(ch01.rules, "cardC.fields.input", "cardB.fields.output", ch01.docs);
  assert.equal(a.id, b.id);
});

test("무관한 두 필드를 짚으면 아무것도 드러나지 않는다", () => {
  const r = L.applyCompare(ch01, [], "cardA.fields.batch", "cardB.fields.batch");
  assert.equal(r.rule, null);
  assert.deepEqual(r.found, []);
});

test("같은 모순을 두 번 찾아도 한 번만 센다", () => {
  let s = L.applyCompare(ch01, [], "cardB.fields.output", "cardC.fields.input");
  assert.ok(s.isNew);
  s = L.applyCompare(ch01, s.found, "cardC.fields.input", "cardB.fields.output");
  assert.ok(!s.isNew, "중복 발견");
  assert.deepEqual(s.found, ["chain_bc"]);
});

test("수정본에서는 같은 대조가 모순을 드러내지 않는다", () => {
  const merged = { ...ch01.docs, ...ch01.revisedDocs };
  const r = L.applyCompare(ch01, [], "cardB.fields.output", "cardC.fields.input", merged);
  assert.equal(r.rule, null, "수정본에서도 모순이 잡히면 재검증이 무의미하다");
});

test("CH01 전체 플레이 경로 — 제출부터 승인까지", () => {
  const { PHASE } = L;
  let phase = PHASE.SUBMITTED, found = [];
  assert.equal(L.activeStamp(phase), null);

  for (const [a, b] of [
    ["cardB.fields.output", "cardC.fields.input"],
    ["summary.fields.batch", "cardC.fields.batch"],
    ["cardA.fields.source", "cardC.fields.source"]
  ]) {
    found = L.applyCompare(ch01, found, a, b).found;
    phase = L.nextPhase(phase, ch01.required, found);
  }
  assert.equal(phase, PHASE.CONTRADICTION);
  assert.equal(L.activeStamp(phase), "REJECTED");

  phase = PHASE.REJECTED;
  assert.equal(L.activeStamp(phase), null);

  // 수정본 재제출 → 재검증
  phase = PHASE.REVISED;
  const merged = { ...ch01.docs, ...ch01.revisedDocs };
  let recheck = [];
  for (const r of ch01.rules) {
    if (!L.ruleHolds(r, merged)) recheck.push(r.id);   // 해소 확인
  }
  assert.deepEqual(recheck.sort(), ch01.required.slice().sort());
  phase = L.nextPhase(phase, ch01.required, recheck);
  assert.equal(phase, PHASE.VERIFIED);
  assert.equal(L.activeStamp(phase), "APPROVED");

  assert.equal(L.progressFor(1), 8, "CH1 승인 후 진행도 8%");
});
