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

  /* 발견한 finding 집합이 요구 집합을 덮는가 */
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

  /* ── 보고서 대조 ───────────────────────────────────────────────────────
     04_DOCUMENT_OBJECTS §11(정답 색칠 금지) / §34(False Lead).

     한 챕터는 같은 시험을 여러 번 돌린 보고서를 여러 장 받는다. 각 장은
     문단(paragraph)으로 이루어지고, 몇몇 문단에는 claim 이 붙어 있다.
     같은 claim 을 단 문단끼리는 같은 값을 말해야 한다 — 한 장만 다른 값을
     말하면 그것이 어긋난 장이다.

       reports        원본 (어긋난 장이 섞여 있다)
       revisedReports 수정본 (모든 claim 이 같은 값을 말한다)
       claims         짚어야 할 진술. id 는 문단의 claim 과 같다
       oddReport      어긋난 장의 id (감사에서 실제 데이터와 대조한다)

     문단 텍스트는 셋 다 표현이 다르다. 표현이 다른 것과 뜻이 다른 것을
     가르는 게 이 퍼즐이다 — 값(value)만이 뜻이고 텍스트는 위장이다. */

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

  /* 문단 id 로 { report, para } 를 찾는다 */
  function paraById(reports, paraId) {
    for (var i = 0; i < (reports || []).length; i++) {
      var body = reports[i].body || [];
      for (var j = 0; j < body.length; j++)
        if (body[j].id === paraId) return { report: reports[i], para: body[j] };
    }
    return null;
  }

  /* 같은 claim 을 단 문단들을 장 순서대로 */
  function claimParas(reports, claimId) {
    var out = [];
    (reports || []).forEach(function (r) {
      (r.body || []).forEach(function (p) {
        if (p.claim === claimId) out.push({ report: r, para: p });
      });
    });
    return out;
  }

  /* 그 문단들이 실제로 말하는 값. 텍스트가 아니라 이것으로 판정한다. */
  function claimValues(reports, claimId) {
    return claimParas(reports, claimId).map(function (x) {
      return { report: x.report.id, para: x.para.id, value: String(x.para.value) };
    });
  }

  /* 값이 갈리면 어긋난 것이다 */
  function claimBroken(reports, claimId) {
    var vals = claimValues(reports, claimId);
    if (vals.length < 2) return false;
    for (var i = 1; i < vals.length; i++)
      if (vals[i].value !== vals[0].value) return true;
    return false;
  }

  /* 다수와 다른 값을 말하는 한 장. 소수가 하나가 아니면 null. */
  function oddOf(reports, claimId) {
    var vals = claimValues(reports, claimId);
    var count = {};
    vals.forEach(function (v) { count[v.value] = (count[v.value] || 0) + 1; });
    var minority = Object.keys(count).filter(function (k) { return count[k] === 1; });
    var majority = Object.keys(count).filter(function (k) { return count[k] > 1; });
    if (minority.length !== 1 || majority.length !== 1) return null;
    for (var i = 0; i < vals.length; i++)
      if (vals[i].value === minority[0]) return vals[i].report;
    return null;
  }

  /* 모든 어긋난 claim 이 같은 한 장을 가리키는가 — 그 장의 id */
  function oddReportFrom(chapter, reports) {
    var ids = requiredClaims(chapter), odd = null;
    for (var i = 0; i < ids.length; i++) {
      var o = oddOf(reports, ids[i]);
      if (!o) return null;
      if (odd === null) odd = o;
      else if (odd !== o) return null;
    }
    return odd;
  }

  function requiredClaims(chapter) {
    if (chapter.required && chapter.required.length) return chapter.required.slice();
    return (chapter.claims || []).map(function (c) { return c.id; });
  }

  function claimById(chapter, id) {
    var cs = chapter.claims || [];
    for (var i = 0; i < cs.length; i++) if (cs[i].id === id) return cs[i];
    return null;
  }

  /* 어긋난 장을 옳게 골랐는가 */
  function checkOdd(chapter, reportId) {
    return !!reportId && reportId === chapter.oddReport;
  }

  /* ── 근거 찍기 ─────────────────────────────────────────────────────────
     리처드가 세 장을 나란히 펼친 뒤, 플레이어는 어긋난 진술을 세 장 모두에서
     짚는다. 한 claim 의 문단을 전부 짚어야 그 claim 이 드러난 것으로 센다 —
     한 장만 짚고 "저 장이 이상하다" 라고 하는 건 근거가 아니다.

     { marks, found, claim, isNew, complete, offClaim } */
  function applyMark(chapter, marks, found, paraId, reports) {
    var list = (marks || []).slice(), got = (found || []).slice();
    var hit = paraById(reports, paraId);
    var claim = hit && hit.para.claim ? claimById(chapter, hit.para.claim) : null;
    if (!claim) return { marks: list, found: got, claim: null, isNew: false,
                         complete: false, offClaim: true };
    if (list.indexOf(paraId) >= 0)
      return { marks: list, found: got, claim: claim, isNew: false,
               complete: got.indexOf(claim.id) >= 0, offClaim: false };
    list.push(paraId);

    var need = claimParas(reports, claim.id).map(function (x) { return x.para.id; });
    var full = need.every(function (id) { return list.indexOf(id) >= 0; });
    if (full && got.indexOf(claim.id) < 0) got.push(claim.id);
    return { marks: list, found: got, claim: claim, isNew: true,
             complete: full, offClaim: false };
  }

  /* 한 claim 에서 아직 짚지 않은 문단 수 */
  function marksLeft(reports, claimId, marks) {
    var need = claimParas(reports, claimId).map(function (x) { return x.para.id; });
    return need.filter(function (id) { return (marks || []).indexOf(id) < 0; }).length;
  }

  /* ── 재검증 ────────────────────────────────────────────────────────────
     반려한 자리가 수정본에서 실제로 같아졌는지 확인한다. 조사와 같은 대상,
     반대의 판정 — 갈려 있으면 아직 못 넘긴다. */
  function applyClaimVerify(chapter, verified, claimId, reports) {
    var list = (verified || []).slice();
    var claim = claimById(chapter, claimId);
    if (!claim) return { verified: list, claim: null, isNew: false, stillBroken: false };
    if (claimBroken(reports, claimId))
      return { verified: list, claim: claim, isNew: false, stillBroken: true };
    if (list.indexOf(claimId) >= 0)
      return { verified: list, claim: claim, isNew: false, stillBroken: false };
    list.push(claimId);
    return { verified: list, claim: claim, isNew: true, stillBroken: false };
  }

  /* ── 챕터 데이터 감사 ──────────────────────────────────────────────────
     퍼즐이 실제로 성립하는지 켜지기 전에 검사한다. 데이터가 어긋나 있으면
     플레이어에게는 "풀 수 없는 퍼즐"로만 보이므로 부팅을 막는다. */
  function auditChapter(chapter) {
    var problems = [];
    var reports = chapter.reports || [];
    var claims = chapter.claims || [];
    var need = requiredClaims(chapter);

    if (reports.length < 2) problems.push("보고서가 2장 미만이다");

    /* 문단 id 는 챕터 전체에서 유일해야 한다 — 찍기가 id 로 오간다 */
    var seen = {};
    reports.forEach(function (r) {
      (r.body || []).forEach(function (p) {
        if (seen[p.id]) problems.push("문단 id 중복: " + p.id);
        seen[p.id] = true;
      });
    });

    var claimIds = {};
    claims.forEach(function (c) {
      if (claimIds[c.id]) problems.push("claim id 중복: " + c.id);
      claimIds[c.id] = true;
    });
    need.forEach(function (id) {
      if (!claimIds[id]) problems.push("required 가 없는 claim 을 가리킴: " + id);
    });

    /* 각 claim 은 모든 장에 정확히 한 문단씩 있어야 나란히 비교된다 */
    claims.forEach(function (c) {
      var ps = claimParas(reports, c.id);
      if (ps.length !== reports.length)
        problems.push("claim '" + c.id + "' 의 문단이 " + ps.length + "개다 (장 수 " +
                      reports.length + ")");
      ps.forEach(function (x) {
        if (x.para.value === undefined)
          problems.push("문단 " + x.para.id + " 에 value 가 없다");
      });
    });

    /* 원본에서는 required claim 이 전부 갈려 있어야 한다 */
    need.forEach(function (id) {
      if (!claimBroken(reports, id)) problems.push("원본에서 갈리지 않는 claim: " + id);
    });

    /* 어긋난 장은 하나여야 하고, 선언한 것과 같아야 한다 */
    var derived = oddReportFrom(chapter, reports);
    if (!derived) problems.push("어긋난 장이 하나로 모이지 않는다");
    else if (chapter.oddReport && derived !== chapter.oddReport)
      problems.push("oddReport 가 데이터와 다르다: 선언 " + chapter.oddReport +
                    " / 실제 " + derived);

    /* 수정본이 있으면 같은 문단 구성으로 모든 claim 이 붙어야 한다 */
    var fixed = chapter.revisedReports || [];
    if (fixed.length) {
      if (fixed.length !== reports.length) problems.push("수정본 장 수가 다르다");
      reports.forEach(function (r) {
        var f = reportById(fixed, r.id);
        if (!f) { problems.push("수정본에 없는 장: " + r.id); return; }
        (r.body || []).forEach(function (p) {
          var q = (f.body || []).filter(function (x) { return x.id === p.id; })[0];
          if (!q) problems.push("수정본에 없는 문단: " + p.id);
          else if (q.claim !== p.claim)
            problems.push("수정본에서 claim 이 바뀐 문단: " + p.id);
        });
      });
      need.forEach(function (id) {
        if (claimBroken(fixed, id)) problems.push("수정본에서도 갈리는 claim: " + id);
      });
    }

    /* 비교 짝이 실재하는 장을 가리키는가 */
    (chapter.comparePairs || []).forEach(function (pair) {
      if (!Array.isArray(pair) || pair.length !== 2) {
        problems.push("비교 짝의 형식이 잘못됐다"); return;
      }
      pair.forEach(function (id) {
        if (!reportById(reports, id)) problems.push("비교 짝이 없는 장을 가리킴: " + id);
      });
    });

    /* 스포일러 — CH1~8 의 어떤 텍스트도 잠긴 표현을 담지 않는다 */
    if (chapter.number <= 8) {
      var texts = [];
      [reports, fixed].forEach(function (set) {
        set.forEach(function (r) {
          texts.push(r.title, r.head);
          (r.body || []).forEach(function (p) { texts.push(p.text); });
        });
      });
      claims.forEach(function (c) { texts.push(c.question, c.wrong, c.ok, c.label); });
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
      odd: null,        /* 어긋난 장으로 지목한 보고서 id */
      confronted: false,/* 세 장을 나란히 펼치는 대화를 지났는가 */
      marks: [],        /* 찍어 둔 문단 id */
      found: [],        /* 세 장 모두에서 근거를 찍은 claim */
      verified: [],     /* 수정본에서 같아졌음을 확인한 claim */
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
    if (!Array.isArray(s.verified) || !Array.isArray(s.marks)) return false;
    if (s.found.some(function (f) { return typeof f !== "string"; })) return false;
    if (s.verified.some(function (f) { return typeof f !== "string"; })) return false;
    if (s.marks.some(function (f) { return typeof f !== "string"; })) return false;
    if (s.odd !== null && typeof s.odd !== "string") return false;
    if (typeof s.confronted !== "boolean") return false;
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
    if (!Array.isArray(s.verified)) s.verified = [];
    s.verified = s.verified.filter(function (f) { return typeof f === "string"; });
    if (!Array.isArray(s.marks)) s.marks = [];
    s.marks = s.marks.filter(function (f) { return typeof f === "string"; });
    if (typeof s.odd !== "string") s.odd = null;
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
    ["started", "done", "seenResults", "confronted"].forEach(function (k) { s[k] = !!s[k]; });
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
    reportsFor: reportsFor, reportById: reportById, paraById: paraById,
    claimParas: claimParas, claimValues: claimValues, claimBroken: claimBroken,
    oddOf: oddOf, oddReportFrom: oddReportFrom,
    requiredClaims: requiredClaims, claimById: claimById, checkOdd: checkOdd,
    applyMark: applyMark, marksLeft: marksLeft, applyClaimVerify: applyClaimVerify,
    freshState: freshState, isValidState: isValidState,
    repairState: repairState, normalizeState: normalizeState,
    damp: damp
  };
});
