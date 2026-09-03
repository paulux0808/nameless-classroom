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

test("CH01 대사와 보고서에 스포일러 누출이 없다", () => {
  const blob = JSON.stringify(ch01);
  assert.deepEqual(L.findLeaks(blob, L.SPOILER.CHAPTERS), [],
    "CH01 데이터에 CH1~8에서 금지된 표현이 들어 있다");
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

/* ── 보고서 모델 ─────────────────────────────────────────────────────── */

test("CH01 감사 — 퍼즐이 실제로 성립한다", () => {
  assert.deepEqual(L.auditChapter(ch01), []);
});

test("짚을 곳은 다섯이고, 원본에서만 갈린다", () => {
  const req = L.requiredClaims(ch01);
  assert.ok(req.length >= 5, `짚을 곳이 ${req.length} 곳뿐이다`);
  for (const id of req) {
    assert.ok(L.claimBroken(ch01.reports, id), `${id} 가 원본에서 갈리지 않는다`);
    assert.ok(!L.claimBroken(ch01.revisedReports, id), `${id} 가 수정본에서도 갈린다`);
  }
});

test("한 진술에서 두 장은 같은 말을, 한 장만 다른 말을 한다", () => {
  for (const id of L.requiredClaims(ch01)) {
    const vals = L.claimValues(ch01.reports, id).map(v => v.value);
    const count = {};
    vals.forEach(v => { count[v] = (count[v] || 0) + 1; });
    assert.deepEqual(Object.values(count).sort(), [1, 2],
      `${id}: ${vals.join(" / ")} — 2 대 1 이 아니다`);
  }
});

test("어긋남은 한 장에 몰려 있지 않다 — 장마다 흩어져 있다", () => {
  const odd = L.oddMap(ch01, ch01.reports);
  const ids = L.requiredClaims(ch01);
  for (const id of ids) assert.ok(odd[id], `${id} 의 혼자 다른 장이 정해지지 않는다`);
  const sheets = new Set(ids.map(id => odd[id]));
  assert.ok(sheets.size >= 2,
    `어긋남이 ${[...sheets]} 한 장에 몰려 있다 — 그러면 한 장만 읽고 끝난다`);
});

test("세 장의 생김새가 서로 다르다 — 같은 사람이 사흘에 걸쳐 쓴 일지다", () => {
  const shapes = ch01.reports.map(r => r.body.length);
  assert.ok(new Set(shapes).size > 1, `문단 수가 ${shapes} 로 다 같다`);
  /* 진술이 장마다 같은 순번에 있으면 읽지 않고 줄만 훑게 된다 */
  for (const id of L.requiredClaims(ch01)) {
    const at = ch01.reports.map(r => r.body.findIndex(p => p.claim === id));
    assert.ok(new Set(at).size > 1, `${id} 가 세 장 모두 ${at[0] + 1}번째에 있다`);
  }
});

test("혼자 다른 말을 하는 문장을 누르면 짚힌다", () => {
  const odd = L.oddMap(ch01, ch01.reports);
  let marks = [], found = [];
  for (const id of L.requiredClaims(ch01)) {
    const target = L.claimParas(ch01.reports, id)
      .find(x => x.report.id === odd[id]).para.id;
    const r = L.applyMark(ch01, marks, found, target, ch01.reports);
    assert.ok(r.ok, `${target} 을 짚을 수 없다`);
    assert.ok(r.isNew);
    marks = r.marks; found = r.found;
  }
  assert.equal(found.length, L.requiredClaims(ch01).length);
  assert.equal(L.marksLeft(ch01, found), 0);
});

test("다수 쪽 문장은 답이 아니다 — 세 장을 다 눌러 맞출 수 없다", () => {
  const odd = L.oddMap(ch01, ch01.reports);
  for (const id of L.requiredClaims(ch01)) {
    for (const { report, para } of L.claimParas(ch01.reports, id)) {
      if (report.id === odd[id]) continue;
      const r = L.applyMark(ch01, [], [], para.id, ch01.reports);
      assert.ok(!r.ok, `${para.id}(다수 쪽)이 짚힌다`);
      assert.equal(r.reason, "majority");
      assert.deepEqual(r.found, []);
    }
  }
});

test("표현이 다른 것과 뜻이 다른 것은 다르다 — 나머지 문단은 문제가 아니다", () => {
  /* 착수 시각도 정전 시각도 서명 형식도 셋 다 다르다. 회차가 다르니
     그건 달라도 된다. 그런 문단을 짚으면 세지 않아야 한다. */
  let decoys = 0;
  for (const r of ch01.reports) {
    for (const p of r.body) {
      if (p.claim) continue;
      decoys++;
      const res = L.applyMark(ch01, [], [], p.id, ch01.reports);
      assert.ok(!res.ok, `${p.id} 를 짚으면 세어진다`);
      assert.equal(res.reason, "notClaim");
    }
  }
  assert.ok(decoys >= 6, `오답 유도 문단이 ${decoys} 개뿐이다`);
});

test("수정본에서는 아무 문장도 짚히지 않는다", () => {
  for (const r of ch01.revisedReports) {
    for (const p of r.body) {
      const res = L.applyMark(ch01, [], [], p.id, ch01.revisedReports);
      assert.ok(!res.ok, `수정본의 ${p.id} 가 어긋남으로 짚힌다`);
    }
  }
});

test("같은 문장을 두 번 눌러도 한 번만 센다", () => {
  const odd = L.oddMap(ch01, ch01.reports);
  const id = L.requiredClaims(ch01)[0];
  const target = L.claimParas(ch01.reports, id).find(x => x.report.id === odd[id]).para.id;
  let r = L.applyMark(ch01, [], [], target, ch01.reports);
  assert.ok(r.isNew);
  r = L.applyMark(ch01, r.marks, r.found, target, ch01.reports);
  assert.ok(!r.isNew);
  assert.equal(r.marks.length, 1);
  assert.deepEqual(r.found, [id]);
});

test("텍스트만 보고는 못 푼다 — 어느 문단도 스스로 답을 알려주지 않는다", () => {
  const blob = JSON.stringify(ch01.reports);
  for (const giveaway of ["미상", "불명", "오류", "잘못", "틀림", "이상하", "확인 필요"]) {
    assert.ok(!blob.includes(giveaway), `자료에 "${giveaway}" 가 있으면 답이 보인다`);
  }
});

test("재검증 — 수정본에서만 확인이 통과한다", () => {
  const id = L.requiredClaims(ch01)[0];
  const bad = L.applyClaimVerify(ch01, [], id, ch01.reports);
  assert.ok(bad.stillBroken, "원본에서 확인이 통과하면 재검증이 무의미하다");
  assert.deepEqual(bad.verified, []);

  const ok = L.applyClaimVerify(ch01, [], id, ch01.revisedReports);
  assert.ok(!ok.stillBroken);
  assert.ok(ok.isNew);
  assert.deepEqual(ok.verified, [id]);
});

test("재검증 — 없는 자리는 확인 대상이 아니다", () => {
  const r = L.applyClaimVerify(ch01, [], "없는claim", ch01.revisedReports);
  assert.equal(r.claim, null);
  assert.deepEqual(r.verified, []);
});

test("국면에 따라 책상에 놓인 묶음이 바뀐다", () => {
  const { PHASE } = L;
  assert.equal(L.reportsFor(ch01, PHASE.SUBMITTED), ch01.reports);
  assert.equal(L.reportsFor(ch01, PHASE.INSPECTING), ch01.reports);
  assert.equal(L.reportsFor(ch01, PHASE.CONTRADICTION), ch01.reports);
  assert.equal(L.reportsFor(ch01, PHASE.REVISED), ch01.revisedReports);
  assert.equal(L.reportsFor(ch01, PHASE.VERIFIED), ch01.revisedReports);
  assert.equal(L.reportsFor(ch01, PHASE.APPROVED), ch01.revisedReports);
});

test("비교 짝은 모든 조합을 덮는다", () => {
  const ids = ch01.reports.map(r => r.id);
  const seen = new Set(ch01.comparePairs.map(p => [...p].sort().join("-")));
  for (let i = 0; i < ids.length; i++)
    for (let j = i + 1; j < ids.length; j++)
      assert.ok(seen.has([ids[i], ids[j]].sort().join("-")),
        `${ids[i]}·${ids[j]} 를 맞대어 볼 수 없다`);
});

test("auditChapter는 잘못된 챕터 데이터를 잡아낸다", () => {
  const broken = {
    number: 1,
    reports: [
      { id: "a", body: [{ id: "a1", claim: "c", value: "1", text: "같다" }] },
      { id: "b", body: [{ id: "b1", claim: "c", value: "1", text: "같다" }] }
    ],
    claims: [{ id: "c", label: "값" }],
    required: ["c", "없는claim"],
    comparePairs: [["a", "없는장"]]
  };
  const problems = L.auditChapter(broken);
  assert.ok(problems.some(p => p.includes("갈리지 않는 claim")), "같은 값인데 갈린다고 요구");
  assert.ok(problems.some(p => p.includes("없는 claim")), "존재하지 않는 claim 참조");
  assert.ok(problems.some(p => p.includes("비교 짝")), "없는 장을 비교 짝으로");
});

test("auditChapter는 어긋남이 한 장에 몰린 것을 잡아낸다", () => {
  const piled = JSON.parse(JSON.stringify(ch01));
  const odd = L.oddMap(ch01, ch01.reports);
  /* 모든 어긋남을 2차 한 장으로 몰아 놓는다 */
  for (const id of piled.required) {
    if (odd[id] === "r2") continue;
    const ps = L.claimParas(piled.reports, id);
    const lone = ps.find(x => x.report.id === odd[id]);
    const r2 = ps.find(x => x.report.id === "r2");
    const tmp = lone.para.value;
    lone.para.value = r2.para.value;
    r2.para.value = tmp;
  }
  const problems = L.auditChapter(piled);
  assert.ok(problems.some(p => p.includes("한 장에 몰려")), problems.join(" / "));
});

test("auditChapter는 수정본에 남은 어긋남을 잡아낸다", () => {
  const still = JSON.parse(JSON.stringify(ch01));
  const r2 = still.revisedReports.find(r => r.id === "r2");
  r2.body.find(p => p.claim === "std").value = "개정 B";
  assert.ok(L.auditChapter(still).some(p => p.includes("수정본에서도 갈리는")));
});

test("auditChapter는 스포일러 누출을 부팅 전에 잡는다", () => {
  const leaky = JSON.parse(JSON.stringify(ch01));
  leaky.lines.probing = ["오펜하이머 박사님께 올리겠습니다."];
  assert.ok(L.auditChapter(leaky).some(p => p.includes("잠긴 표현")));
});

test("CH01 전 구간 — 조사에서 승인까지 국면이 끊기지 않는다", () => {
  const { PHASE } = L;
  const req = L.requiredClaims(ch01);
  const odd = L.oddMap(ch01, ch01.reports);
  let phase = PHASE.SUBMITTED, marks = [], found = [], verified = [];

  // 1. 혼자 다른 말을 하는 문장을 다섯 곳에서 짚는다
  const reps = L.reportsFor(ch01, phase);
  for (const id of req) {
    const target = L.claimParas(reps, id).find(x => x.report.id === odd[id]).para.id;
    const r = L.applyMark(ch01, marks, found, target, reps);
    assert.ok(r.isNew, `${target} 을 짚을 수 없다`);
    marks = r.marks; found = r.found;
    phase = L.nextPhase(phase, req, found);
  }
  assert.equal(marks.length, req.length);
  assert.equal(phase, PHASE.CONTRADICTION);
  assert.equal(L.activeStamp(phase), "REJECTED");

  // 2. 반려 → 나갔다 돌아옴 → 수정본
  phase = PHASE.REJECTED;
  assert.equal(L.activeStamp(phase), null, "반려 직후에는 아무 도장도 못 찍는다");
  phase = PHASE.REVISED;
  const rev = L.reportsFor(ch01, phase);
  assert.equal(rev, ch01.revisedReports);

  // 3. 자리마다 세 장을 맞대어 확인
  for (const id of req) {
    const r = L.applyClaimVerify(ch01, verified, id, rev);
    assert.ok(r.isNew, `${id} 를 재검증할 수 없다 — 여기서 막힌다`);
    verified = r.verified;
    phase = L.nextPhase(phase, req, verified);
  }
  assert.equal(phase, PHASE.VERIFIED, "재검증을 마쳐도 VERIFIED 로 가지 못한다");
  assert.equal(L.activeStamp(phase), "APPROVED");
  assert.equal(L.progressFor(1), 8);
});

test("저장 상태는 짚은 문장과 대면 여부를 함께 실어 나른다", () => {
  const s = L.normalizeState({
    started: true, chapter: 1, phase: "inspecting",
    confronted: true, marks: ["r1_zero", "r2_std"],
    found: ["zero", "std"], verified: [], approved: [], spoiler: 0,
    seenResults: false, done: false
  });
  assert.ok(s, "정상 저장본이 폐기됐다");
  assert.equal(s.confronted, true);
  assert.deepEqual(s.marks, ["r1_zero", "r2_std"]);

  const junk = L.repairState({ confronted: "yes", marks: ["a", 3, null] });
  assert.equal(junk.confronted, true, "불리언으로 강제");
  assert.deepEqual(junk.marks, ["a"], "문자열이 아닌 표시 제거");

  /* 예전 저장본의 "어긋난 장 지목" 은 더 쓰지 않는다 */
  const old = L.normalizeState({ started: true, chapter: 1, phase: "inspecting",
    odd: "r2", confronted: false, marks: [], found: [], verified: [],
    approved: [], spoiler: 0, seenResults: false, done: false });
  assert.ok(old, "예전 저장본이 폐기됐다");
  assert.equal(old.odd, undefined);
});
