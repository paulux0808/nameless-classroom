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

/* 게임은 한국어로 쓴다. 누출이 실제로 날 언어를 검사하지 않으면
     차단 목록이 있으나 마나다. 한글 표기를 함께 막는다. */
  var LOCKED_TERMS = [
    /* 사건·계획 */
    "manhattan project", "manhattan", "맨해튼", "맨하탄", "맨해탄",
    "atomic bomb", "nuclear bomb", "atomic", "nuclear", "bomb",
    "원자폭탄", "핵폭탄", "원자탄", "원폭", "핵무기",
    "little boy", "fat man", "trinity",
    "리틀보이", "리틀 보이", "팻맨", "팻 맨", "트리니티",
    "hiroshima", "nagasaki", "히로시마", "나가사키",
    /* 인물 성(姓) — CH1~8 동안 이름만 쓴다 */
    "oppenheimer", "오펜하이머",
    "feynman", "파인만",
    "fermi", "페르미",
    "alvarez", "알바레즈", "알바레스",
    "von neumann", "neumann", "노이만",
    "kistiakowsky", "키스티아코프스키",
    "segre", "segrè", "세그레",
    "bainbridge", "베인브리지",
    "bethe", "베테"
  ];

  /* 레벨별로 풀리는 표현. 그 외에는 계속 잠긴다. */
  var UNLOCKED_AT = {
    /* CH9 RESULTS — 결과가 드러난다. 지명과 무기명까지만 */
    1: ["little boy", "fat man", "hiroshima", "nagasaki",
        "리틀보이", "리틀 보이", "팻맨", "팻 맨", "히로시마", "나가사키"],
    /* CH10 HOME — 정체가 드러난다. 나머지 전부 */
    2: ["manhattan project", "manhattan", "맨해튼", "맨하탄", "맨해탄",
        "atomic bomb", "nuclear bomb", "atomic", "nuclear", "bomb",
        "원자폭탄", "핵폭탄", "원자탄", "원폭", "핵무기",
        "trinity", "트리니티",
        "oppenheimer", "오펜하이머", "feynman", "파인만", "fermi", "페르미",
        "alvarez", "알바레즈", "알바레스",
        "von neumann", "neumann", "노이만",
        "kistiakowsky", "키스티아코프스키", "segre", "segrè", "세그레",
        "bainbridge", "베인브리지", "bethe", "베테"]
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
      var hit;
      if (/[\uac00-\ud7a3]/.test(term)) {
        /* 한글은 대소문자도 어미 변화도 없고 표기가 고유하다.
           '파인만이', '페르미와' 처럼 조사가 붙으므로 부분 일치로 본다. */
        hit = lower.indexOf(term) >= 0;
      } else {
        /* 로마자는 단어 경계로. 'bomb'가 'bombardment' 안에서 걸리지 않게. */
        var re = new RegExp("(^|[^a-z])" + term.replace(/[.*+?^${}()|[\]\\]/g, "\\$&") + "([^a-z]|$)", "i");
        hit = re.test(lower);
      }
      if (hit && hits.indexOf(term) < 0) hits.push(term);
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

  /* 주장한 집합이 요구 집합을 덮는가 */
  function allFound(required, found) {
    var have = {};
    (found || []).forEach(function (f) { have[f] = true; });
    return (required || []).every(function (r) { return !!have[r]; });
  }

  /* 조사 결과로부터 다음 국면을 계산한다. 국면은 되돌아가지 않는다.
     조사는 어긋난 장을 고르는 것으로도 시작되므로(근거는 아직 0개),
     이미 INSPECTING 이면 found 가 비어 있어도 내려가지 않는다. */
  function nextPhase(phase, required, found) {
    var done = allFound(required, found);
    if (phase === PHASE.SUBMITTED || phase === PHASE.INSPECTING) {
      if (done) return PHASE.CONTRADICTION;
      if (phase === PHASE.INSPECTING) return PHASE.INSPECTING;
      return (found && found.length) ? PHASE.INSPECTING : PHASE.SUBMITTED;
    }
    if (phase === PHASE.REVISED) return done ? PHASE.VERIFIED : PHASE.REVISED;
    return phase;
  }

  function phaseIndex(phase) { return PHASE_ORDER.indexOf(phase); }

  /* ── 보고서 대조 ────────────────────────────────────────────────────────
     04_DOCUMENT_OBJECTS §11(정답 색칠 금지) / §34(False Lead).

     한 챕터는 같은 시험을 세 번 돌린 보고서를 받는다. 각 장은 줄글이고,
     그 안에 문장이 박혀 있다. 같은 것을 말하는 문장 셋(장마다 하나씩)이
     한 세트다.

       sets     짚어야 할 대상. agree=true 면 셋이 같은 말을 하고(함정),
                false 면 한 장만 다른 말을 한다(odd 가 그 장)
       reports  줄글. 문단은 문자열과 문장 객체가 섞인 배열이다

     플레이어는 문장 셋을 눌러 "이 셋은 같은 것을 말하는데 하나가 어긋난다"
     고 주장한다. 누르는 것만으로는 아무것도 알 수 없다 — 짝을 다 맞추면
     저절로 풀리는 문제라면 맞고 틀리고를 판단할 이유가 없어진다.
     판정은 과학자에게 가져가야 나온다.

     문장은 같은 것을 저마다 다르게 말한다(1시간 45분 / 105분 / 두 시간이
     채 안 됨). 어떤 세트는 두 문장을 조합해야 나머지 하나가 틀렸음이
     드러난다 — 셋 중 둘만 참일 수 있다. */

  /* 이 국면에서 책상에 놓여 있는 보고서 묶음 */
  function reportsFor(chapter, phase) {
    var revised = phase === PHASE.REJECTED || phase === PHASE.REVISED ||
                  phase === PHASE.VERIFIED || phase === PHASE.APPROVED;
    var fixed = chapter.revisedReports;
    return (revised && fixed && fixed.length) ? fixed : (chapter.reports || []);
  }

  function reportById(reports, id) {
    for (var i = 0; i < (reports || []).length; i++)
      if (reports[i].id === id) return reports[i];
    return null;
  }

  /* 줄글에서 문장만 뽑는다. 문단은 문자열(잇는 말)과 문장 객체가 섞여 있다. */
  function statementsOf(report) {
    var out = [];
    (report.body || []).forEach(function (para) {
      (para || []).forEach(function (chunk) {
        if (chunk && typeof chunk === "object" && chunk.id) out.push(chunk);
      });
    });
    return out;
  }

  /* 문장 id 로 { report, st } 를 찾는다 */
  function stById(reports, id) {
    for (var i = 0; i < (reports || []).length; i++) {
      var list = statementsOf(reports[i]);
      for (var j = 0; j < list.length; j++)
        if (list[j].id === id) return { report: reports[i], st: list[j] };
    }
    return null;
  }

  /* 한 세트에 속한 문장들을 장 순서대로 */
  function setMembers(reports, setId) {
    var out = [];
    (reports || []).forEach(function (r) {
      statementsOf(r).forEach(function (st) {
        if (st.set === setId) out.push({ report: r, st: st });
      });
    });
    return out;
  }

  function setById(chapter, id) {
    var list = chapter.sets || [];
    for (var i = 0; i < list.length; i++) if (list[i].id === id) return list[i];
    return null;
  }

  /* 짚어야 할 것 — 어긋난 세트만 세면 된다. 맞는 세트는 함정이다. */
  function brokenSets(chapter) {
    return (chapter.sets || []).filter(function (x) { return !x.agree; })
      .map(function (x) { return x.id; });
  }
  function requiredClaims(chapter) { return brokenSets(chapter); }

  /* ── 주장 ──────────────────────────────────────────────────────────────
     문장 셋을 눌러 하나의 주장을 만든다.

     { ok, reason, set }
       reason "short"      아직 세 장을 다 고르지 않았다
              "sameSheet"  한 장에서 둘을 골랐다
              "notASet"    같은 것을 말하는 셋이 아니다
              "already"    이미 주장한 세트다
     ok 여도 그 주장이 옳은지는 알려주지 않는다 — 그건 과학자가 판정한다. */
  function judgeSelection(chapter, reports, ids) {
    var picked = (ids || []).slice();
    if (picked.length !== (reports || []).length)
      return { ok: false, reason: "short", set: null };

    var seen = {}, sets = {};
    for (var i = 0; i < picked.length; i++) {
      var hit = stById(reports, picked[i]);
      if (!hit) return { ok: false, reason: "notASet", set: null };
      if (seen[hit.report.id]) return { ok: false, reason: "sameSheet", set: null };
      seen[hit.report.id] = true;
      sets[hit.st.set] = true;
    }
    var keys = Object.keys(sets);
    if (keys.length !== 1) return { ok: false, reason: "notASet", set: null };
    return { ok: true, reason: null, set: setById(chapter, keys[0]) };
  }

  /* 주장 하나를 기록한다. 옳은지 그른지는 여기서 판정하지 않는다. */
  function applyClaim(chapter, claims, setId) {
    var list = (claims || []).slice();
    if (list.indexOf(setId) >= 0)
      return { claims: list, isNew: false, reason: "already" };
    list.push(setId);
    return { claims: list, isNew: true, reason: null };
  }

  /* ── 과학자의 판정 ─────────────────────────────────────────────────────
     주장 묶음을 통째로 본다. 한 번에 알려 주는 것은 많아야 하나다.

     { verdict, set }
       "none"     아직 아무것도 주장하지 않았다
       "wrong"    맞는 세트를 어긋났다고 주장했다 — set 이 그 하나.
                  어느 것이 더 틀렸는지는 말하지 않는다
       "short"    주장한 것은 다 옳지만 아직 남았다
       "settled"  어긋난 세트를 전부, 그리고 그것만 주장했다 */
  function judgeClaims(chapter, claims) {
    var list = (claims || []).slice();
    if (!list.length) return { verdict: "none", set: null };

    var broken = brokenSets(chapter);
    for (var i = 0; i < list.length; i++) {
      if (broken.indexOf(list[i]) < 0)
        return { verdict: "wrong", set: setById(chapter, list[i]) };
    }
    var missing = broken.filter(function (id) { return list.indexOf(id) < 0; });
    if (missing.length) return { verdict: "short", set: null };
    return { verdict: "settled", set: null };
  }

  /* 과학자가 잘못된 주장 하나를 물린다 */
  function dropClaim(claims, setId) {
    return (claims || []).filter(function (id) { return id !== setId; });
  }

  /* ── 재검증 ────────────────────────────────────────────────────────────
     수정본에서는 반려한 자리가 이제 같은 말을 하는지 본다. 같은 동작으로
     문장 셋을 누르되, 이번에는 누르는 즉시 판정된다 — 무엇을 확인해야
     하는지 이미 알고 있기 때문이다. */
  function applyVerifySet(chapter, verified, setId, reports) {
    var list = (verified || []).slice();
    var set = setById(chapter, setId);
    if (!set) return { verified: list, set: null, isNew: false, stillBroken: false };
    /* agree 는 원본에 대한 선언이다. 수정본은 스스로 수정본이라고 말한다 —
       그렇지 않으면 반려한 자리를 영영 확인할 수 없다. */
    var onRevised = !!((reports || [])[0] && reports[0].revised);
    if (!set.agree && !onRevised)
      return { verified: list, set: set, isNew: false, stillBroken: true };
    if (list.indexOf(setId) >= 0)
      return { verified: list, set: set, isNew: false, stillBroken: false };
    list.push(setId);
    return { verified: list, set: set, isNew: true, stillBroken: false };
  }

  /* ── 챕터 데이터 감사 ──────────────────────────────────────────────────
     퍼즐이 실제로 성립하는지 켜지기 전에 검사한다. */
  function auditChapter(chapter) {
    var problems = [];
    var reports = chapter.reports || [];
    var sets = chapter.sets || [];

    if (reports.length < 2) problems.push("보고서가 2장 미만이다");
    if (!sets.length) problems.push("세트가 없다");

    function checkSet(set, list, label) {
      var ms = setMembers(list, set.id);
      if (ms.length !== list.length) {
        problems.push(label + " 세트 '" + set.id + "' 의 문장이 " + ms.length +
                      "개다 (장 수 " + list.length + ")");
        return;
      }
      var sheets = {};
      ms.forEach(function (m) { sheets[m.report.id] = (sheets[m.report.id] || 0) + 1; });
      Object.keys(sheets).forEach(function (k) {
        if (sheets[k] > 1) problems.push(label + " 세트 '" + set.id + "' 가 " + k + " 에 둘 있다");
      });
    }

    /* 문장 id 는 한 묶음 안에서 유일해야 한다 */
    function uniqueIds(list, label) {
      var seen = {};
      list.forEach(function (r) {
        statementsOf(r).forEach(function (st) {
          if (seen[st.id]) problems.push(label + " 문장 id 중복: " + st.id);
          seen[st.id] = true;
          if (!st.set) problems.push(label + " 문장 " + st.id + " 에 set 이 없다");
          if (!st.t) problems.push(label + " 문장 " + st.id + " 에 본문이 없다");
        });
      });
    }
    uniqueIds(reports, "원본");

    var ids = {};
    sets.forEach(function (x) {
      if (ids[x.id]) problems.push("세트 id 중복: " + x.id);
      ids[x.id] = true;
      checkSet(x, reports, "원본");
      if (x.agree && x.odd) problems.push("일치 세트에 odd 가 있다: " + x.id);
      if (!x.agree) {
        if (!x.odd) problems.push("어긋난 세트에 odd 가 없다: " + x.id);
        else if (!reportById(reports, x.odd))
          problems.push("odd 가 없는 장을 가리킨다: " + x.id + " → " + x.odd);
      }
    });

    /* 모든 문장은 선언된 세트에 속해야 한다 */
    reports.forEach(function (r) {
      statementsOf(r).forEach(function (st) {
        if (st.set && !ids[st.set]) problems.push("없는 세트를 가리킴: " + st.id + " → " + st.set);
      });
    });

    var broken = brokenSets(chapter);
    if (!broken.length) problems.push("어긋난 세트가 하나도 없다");

    /* 어긋남이 한 장에 몰려 있으면 그 장만 읽고 끝난다 */
    var where = {};
    broken.forEach(function (id) { where[setById(chapter, id).odd] = true; });
    if (broken.length > 1 && Object.keys(where).length < 2)
      problems.push("어긋남이 한 장에 몰려 있다: " + Object.keys(where).join(","));

    /* 함정이 없으면 세트를 짝짓기만 하면 풀린다 */
    var agree = sets.filter(function (x) { return x.agree; });
    if (!agree.length) problems.push("일치 세트(함정)가 하나도 없다 — 짝만 맞추면 풀린다");

    /* 수정본: 반려한 세트만 다시 싣되 이제 전부 일치해야 한다 */
    var fixed = chapter.revisedReports || [];
    if (fixed.length) {
      uniqueIds(fixed, "수정본");
      if (fixed.length !== reports.length) problems.push("수정본 장 수가 다르다");
      fixed.forEach(function (r) {
        if (!r.revised) problems.push("수정본에 revised 표시가 없다: " + r.id);
      });
      var revSets = chapter.revisedSets || broken;
      revSets.forEach(function (id) {
        var set = setById(chapter, id);
        if (!set) { problems.push("수정본이 없는 세트를 가리킴: " + id); return; }
        checkSet(set, fixed, "수정본");
      });
      fixed.forEach(function (r) {
        statementsOf(r).forEach(function (st) {
          if (revSets.indexOf(st.set) < 0)
            problems.push("수정본에 반려하지 않은 세트가 있다: " + st.id + " → " + st.set);
        });
      });
    }

    /* 스포일러 — CH1~8 의 어떤 텍스트도 잠긴 표현을 담지 않는다 */
    if (chapter.number <= 8) {
      var texts = [];
      [reports, fixed].forEach(function (list) {
        list.forEach(function (r) {
          texts.push(r.title, r.head);
          (r.body || []).forEach(function (para) {
            (para || []).forEach(function (c) {
              texts.push(typeof c === "string" ? c : c.t);
            });
          });
        });
      });
      sets.forEach(function (x) { texts.push(x.label, x.wrong, x.ok, x.same); });
      Object.keys(chapter.lines || {}).forEach(function (k) {
        (chapter.lines[k] || []).forEach(function (t) { texts.push(t); });
      });
      texts.forEach(function (t) {
        findLeaks(t, SPOILER.CHAPTERS).forEach(function (term) {
          problems.push("잠긴 표현 노출: " + term);
        });
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
      greeted: false,   /* 첫 설명을 들었는가 — 두 번째부터는 짧게 말한다 */
      sel: [],          /* 지금 고르고 있는 문장 id */
      claims: [],       /* 어긋났다고 주장한 세트 */
      verified: [],     /* 수정본에서 같아졌음을 확인한 세트 */
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
    if (!Array.isArray(s.claims) || !Array.isArray(s.approved)) return false;
    if (!Array.isArray(s.verified) || !Array.isArray(s.sel)) return false;
    if (s.claims.some(function (f) { return typeof f !== "string"; })) return false;
    if (s.verified.some(function (f) { return typeof f !== "string"; })) return false;
    if (s.sel.some(function (f) { return typeof f !== "string"; })) return false;
    if (typeof s.greeted !== "boolean") return false;
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
    if (!Array.isArray(s.claims)) s.claims = [];
    s.claims = s.claims.filter(function (f) { return typeof f === "string"; });
    if (!Array.isArray(s.verified)) s.verified = [];
    s.verified = s.verified.filter(function (f) { return typeof f === "string"; });
    if (!Array.isArray(s.sel)) s.sel = [];
    s.sel = s.sel.filter(function (f) { return typeof f === "string"; });
    /* 예전 저장본이 쓰던 것들 — 더 쓰지 않는다 */
    delete s.odd; delete s.marks; delete s.found; delete s.confronted;
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
    ["started", "done", "seenResults", "greeted"].forEach(function (k) { s[k] = !!s[k]; });
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
    auditChapter: auditChapter,
    reportsFor: reportsFor, reportById: reportById,
    statementsOf: statementsOf, stById: stById,
    setMembers: setMembers, setById: setById,
    brokenSets: brokenSets, requiredClaims: requiredClaims,
    judgeSelection: judgeSelection, applyClaim: applyClaim,
    judgeClaims: judgeClaims, dropClaim: dropClaim,
    applyVerifySet: applyVerifySet,
    freshState: freshState, isValidState: isValidState,
    repairState: repairState, normalizeState: normalizeState,
    damp: damp
  };
});
