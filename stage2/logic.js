/* ============================================================================
   NAMELESS Ⅱ — 순수 로직

   DOM·three.js에 의존하지 않는 부분만 모은다. 브라우저에서는 전역으로,
   테스트에서는 모듈로 같은 코드를 쓴다.

   권위는 stage2/spec/ 이다. 특히:
   - 00_MASTER_CUESHEET §2.1  CH1~8 정보 제한
   - 00_MASTER_CUESHEET §2.2  공통 게임 루프
   - 00_MASTER_CUESHEET §2.3  progress 표
   - 07_SAVE_PACING...        저장/재구성 계약
   ========================================================================== */
(function (root, factory) {
  var api = factory();
  if (typeof module === "object" && module.exports) module.exports = api;
  if (root) root.N2 = api;
})(typeof globalThis !== "undefined" ? globalThis : this, function () {
  "use strict";

  /* ── 진행도 ────────────────────────────────────────────────────────────
     큐시트 §2.3. REJECTED 자체로는 오르지 않는다. */
  var PROGRESS = [0, 8, 19, 31, 44, 57, 69, 82, 100];

  function progressFor(approvedChapters) {
    var n = Math.max(0, Math.min(8, approvedChapters | 0));
    return PROGRESS[n];
  }

  /* ── 스포일러 게이트 ───────────────────────────────────────────────────
     큐시트 §2.1. CH1~8 동안 아래 표현은 어떤 경로로도 노출하지 않는다.
     레벨 0 = CH1~8, 1 = CH9(RESULTS), 2 = CH10(정체 공개). */
  var SPOILER = { CHAPTERS: 0, RESULTS: 1, IDENTITY: 2 };

  var LOCKED_TERMS = [
    "manhattan project", "manhattan",
    "atomic bomb", "nuclear bomb", "atomic", "nuclear", "bomb",
    "little boy", "fat man", "trinity",
    "hiroshima", "nagasaki",
    "oppenheimer", "feynman", "fermi", "alvarez",
    "von neumann", "neumann", "kistiakowsky", "segre", "segrè",
    "bainbridge", "bethe"
  ];

  /* 레벨별로 풀리는 표현. 그 외에는 계속 잠긴다. */
  var UNLOCKED_AT = {
    1: ["little boy", "fat man", "hiroshima", "nagasaki"],
    2: ["manhattan project", "manhattan", "atomic bomb", "nuclear bomb",
        "atomic", "nuclear", "bomb", "trinity", "oppenheimer",
        "feynman", "fermi", "alvarez", "von neumann", "neumann",
        "kistiakowsky", "segre", "segrè", "bainbridge", "bethe"]
  };

  function unlockedTerms(level) {
    var out = [];
    for (var l = 1; l <= (level | 0); l++) {
      if (UNLOCKED_AT[l]) out = out.concat(UNLOCKED_AT[l]);
    }
    return out;
  }

  /* 이 레벨에서 노출해도 되는 표현인가 */
  function termAllowed(term, level) {
    var t = String(term == null ? "" : term).toLowerCase().trim();
    if (LOCKED_TERMS.indexOf(t) < 0) return true;
    return unlockedTerms(level).indexOf(t) >= 0;
  }

  /* 임의의 텍스트에 이 레벨에서 새면 안 되는 표현이 들어 있는지 검사한다.
     빌드 시 감사(audit)와 런타임 assert 양쪽에서 쓴다. */
  function findLeaks(text, level) {
    var lower = String(text == null ? "" : text).toLowerCase();
    var allowed = unlockedTerms(level);
    var hits = [];
    LOCKED_TERMS.forEach(function (term) {
      if (allowed.indexOf(term) >= 0) return;
      /* 단어 경계 기준. 'bomb'가 'bombardment' 안에서 걸리지 않게 한다. */
      var re = new RegExp("(^|[^a-z])" + term.replace(/[.*+?^${}()|[\]\\]/g, "\\$&") + "([^a-z]|$)", "i");
      if (re.test(lower) && hits.indexOf(term) < 0) hits.push(term);
    });
    return hits;
  }

  /* ── 검증 상태기계 ─────────────────────────────────────────────────────
     큐시트 §2.2 공통 루프. 도장은 도덕 선택지가 아니다.
     story state가 검증을 완료한 경우에만 해당 도장이 활성화된다. */
  var PHASE = {
    SUBMITTED: "submitted",      /* 제출됨. 아직 조사 전 */
    INSPECTING: "inspecting",    /* 자료를 열어보는 중 */
    CONTRADICTION: "contradiction", /* 모순을 전부 찾음 → REJECTED 가능 */
    REJECTED: "rejected",        /* 반려함. 과학자가 회수 */
    REVISED: "revised",          /* 수정본 재제출 → 재검증 필요 */
    VERIFIED: "verified",        /* 재검증 통과 → APPROVED 가능 */
    APPROVED: "approved"         /* 승인 완료 */
  };

  var PHASE_ORDER = [PHASE.SUBMITTED, PHASE.INSPECTING, PHASE.CONTRADICTION,
                     PHASE.REJECTED, PHASE.REVISED, PHASE.VERIFIED, PHASE.APPROVED];

  /* 이 국면에서 활성화되는 도장. null이면 어느 도장도 찍을 수 없다. */
  function activeStamp(phase) {
    if (phase === PHASE.CONTRADICTION) return "REJECTED";
    if (phase === PHASE.VERIFIED) return "APPROVED";
    return null;
  }

  function canStamp(phase, kind) {
    return activeStamp(phase) === kind;
  }

  /* 발견한 finding 집합이 요구 집합을 덮는가 */
  function allFound(required, found) {
    var have = {};
    (found || []).forEach(function (f) { have[f] = true; });
    return (required || []).every(function (r) { return !!have[r]; });
  }

  /* 조사 결과로부터 다음 국면을 계산한다. 국면은 되돌아가지 않는다. */
  function nextPhase(phase, required, found) {
    var done = allFound(required, found);
    if (phase === PHASE.SUBMITTED || phase === PHASE.INSPECTING) {
      if (done) return PHASE.CONTRADICTION;
      return (found && found.length) ? PHASE.INSPECTING : PHASE.SUBMITTED;
    }
    if (phase === PHASE.REVISED) return done ? PHASE.VERIFIED : PHASE.REVISED;
    return phase;
  }

  function phaseIndex(phase) { return PHASE_ORDER.indexOf(phase); }

  /* ── 문서 대조 ─────────────────────────────────────────────────────────
     챕터가 문서와 모순 규칙을 데이터로 준다. 엔진은 규칙을 해석만 한다.

     규칙 종류:
       chain      a.output 과 b.input 이 이어지지 않는다
       stale      기준 문서의 개정일이 적용 시점보다 늦다
       mismatch   두 문서의 같은 필드 값이 다르다
       superseded 참조 대상이 이후 교체되어 무효가 되었다 */
  function docField(docs, ref) {
    var parts = String(ref).split(".");
    var v = docs;
    for (var i = 0; i < parts.length; i++) {
      if (v == null) return undefined;
      v = v[parts[i]];
    }
    /* 'cardB.output' 처럼 fields를 생략한 참조도 받아준다. */
    if (v === undefined && parts.length === 2) {
      var doc = docs[parts[0]];
      if (doc && doc.fields) return doc.fields[parts[1]];
    }
    return v;
  }

  /* 규칙이 실제로 성립하는지(= 모순이 존재하는지) 판정한다.
     챕터 데이터가 잘못돼 모순이 없는 규칙을 요구하면 테스트가 잡는다. */
  function ruleHolds(rule, docs) {
    var a, b;
    switch (rule.kind) {
      case "chain":
        a = docField(docs, rule.from);
        b = docField(docs, rule.to);
        return a !== undefined && b !== undefined && String(a) !== String(b);
      case "mismatch":
        a = docField(docs, rule.left);
        b = docField(docs, rule.right);
        return a !== undefined && b !== undefined && String(a) !== String(b);
      case "stale":
        a = Date.parse(docField(docs, rule.appliedAt));
        b = Date.parse(docField(docs, rule.revisedAt));
        return isFinite(a) && isFinite(b) && b > a;
      case "superseded":
        a = Date.parse(docField(docs, rule.usedAt));
        b = Date.parse(docField(docs, rule.replacedAt));
        return isFinite(a) && isFinite(b) && b > a;
      default:
        return false;
    }
  }

  /* 챕터 데이터 정합성 — 요구된 finding이 실제 모순으로 성립하는가 */
  function auditChapter(chapter) {
    var problems = [];
    var docs = chapter.docs || {};
    var rules = chapter.rules || [];
    var byId = {};
    rules.forEach(function (r) {
      if (byId[r.id]) problems.push("중복 규칙 id: " + r.id);
      byId[r.id] = r;
    });
    (chapter.required || []).forEach(function (id) {
      if (!byId[id]) { problems.push("required가 없는 규칙을 가리킴: " + id); return; }
      if (!ruleHolds(byId[id], docs)) problems.push("모순이 성립하지 않는 규칙: " + id);
    });
    /* 수정본에서는 모든 요구 모순이 해소돼야 한다 */
    var fixed = chapter.revisedDocs || {};
    if (Object.keys(fixed).length) {
      var merged = Object.assign({}, docs, fixed);
      (chapter.required || []).forEach(function (id) {
        if (byId[id] && ruleHolds(byId[id], merged))
          problems.push("수정본에서도 모순이 남음: " + id);
      });
    }
    return problems;
  }

  /* ── 저장 상태 ─────────────────────────────────────────────────────────
     stage1에서 검증된 방식: 정규화 → 복구 → 검증. 실패하면 폐기. */
  var CHAPTER_MIN = 1, CHAPTER_MAX = 10;

  function freshState() {
    return {
      started: false,
      chapter: 1,
      phase: PHASE.SUBMITTED,
      found: [],
      approved: [],
      spoiler: SPOILER.CHAPTERS,
      seenResults: false,
      done: false
    };
  }

  function isValidState(s) {
    if (!s || typeof s !== "object") return false;
    if (!Number.isInteger(s.chapter) || s.chapter < CHAPTER_MIN || s.chapter > CHAPTER_MAX) return false;
    if (PHASE_ORDER.indexOf(s.phase) < 0) return false;
    if (!Array.isArray(s.found) || !Array.isArray(s.approved)) return false;
    if (s.found.some(function (f) { return typeof f !== "string"; })) return false;
    if (s.approved.some(function (n) { return !Number.isInteger(n) || n < 1 || n > 8; })) return false;
    if (new Set(s.approved).size !== s.approved.length) return false;
    if (!Number.isInteger(s.spoiler) || s.spoiler < 0 || s.spoiler > 2) return false;
    if (typeof s.started !== "boolean" || typeof s.done !== "boolean") return false;
    if (typeof s.seenResults !== "boolean") return false;
    return true;
  }

  function repairState(s) {
    if (!s || typeof s !== "object") return s;
    if (!Number.isInteger(s.chapter)) s.chapter = 1;
    s.chapter = Math.max(CHAPTER_MIN, Math.min(CHAPTER_MAX, s.chapter));
    if (PHASE_ORDER.indexOf(s.phase) < 0) s.phase = PHASE.SUBMITTED;
    if (!Array.isArray(s.found)) s.found = [];
    s.found = s.found.filter(function (f) { return typeof f === "string"; });
    if (!Array.isArray(s.approved)) s.approved = [];
    var seen = {};
    s.approved = s.approved.filter(function (n) {
      if (!Number.isInteger(n) || n < 1 || n > 8 || seen[n]) return false;
      seen[n] = true; return true;
    });
    if (!Number.isInteger(s.spoiler) || s.spoiler < 0 || s.spoiler > 2) s.spoiler = SPOILER.CHAPTERS;
    /* 스포일러 레벨은 진행에서 유도한다. 저장본이 앞서 나가면 되돌린다. */
    var earned = s.done ? SPOILER.IDENTITY : (s.seenResults ? SPOILER.RESULTS : SPOILER.CHAPTERS);
    if (s.spoiler > earned) s.spoiler = earned;
    ["started", "done", "seenResults"].forEach(function (k) { s[k] = !!s[k]; });
    return s;
  }

  function normalizeState(value, base) {
    if (!value || typeof value !== "object") return null;
    var s = repairState(Object.assign(base || freshState(), value));
    return isValidState(s) ? s : null;
  }

  /* ── 프레임률 독립 감쇠 (stage1과 동일 계약) ──────────────────────────── */
  function damp(k, dt) {
    if (!(dt > 0)) return k;
    return 1 - Math.pow(1 - k, dt * 60);
  }

  return {
    PROGRESS: PROGRESS, progressFor: progressFor,
    SPOILER: SPOILER, LOCKED_TERMS: LOCKED_TERMS,
    termAllowed: termAllowed, findLeaks: findLeaks, unlockedTerms: unlockedTerms,
    PHASE: PHASE, PHASE_ORDER: PHASE_ORDER, phaseIndex: phaseIndex,
    activeStamp: activeStamp, canStamp: canStamp,
    allFound: allFound, nextPhase: nextPhase,
    docField: docField, ruleHolds: ruleHolds, auditChapter: auditChapter,
    freshState: freshState, isValidState: isValidState,
    repairState: repairState, normalizeState: normalizeState,
    damp: damp
  };
});
