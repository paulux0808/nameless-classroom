(function (root, factory) {
  var api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api;
  if (root) root.N2Conditions = api;
})(typeof globalThis !== 'undefined' ? globalThis : this, function () {
  'use strict';
  function ruleFor(ch, team) {
    return ch.rules.filter(function (r) { return r.equipment === team.equipment && r.effective <= team.date; })
      .sort(function (a, b) { return b.effective.localeCompare(a.effective); })[0];
  }
  function issue(ch, team) {
    var r = ruleFor(ch, team);
    if (team.rule !== r.id) return 'edition';
    if (team.wait < r.wait) return 'wait';
    if (team.repeats < r.repeats) return 'repeats';
    return 'valid';
  }
  function judge(ch, assignments) {
    for (var i = 0; i < ch.teams.length; i++) {
      var t = ch.teams[i], a = (assignments || {})[t.id], r = ruleFor(ch, t);
      if (!a || !a.rule || !a.action || !a.reason || !a.source)
        return { ok: false, team: t.id, message: t.name + ' 배정표에 빈칸이 있습니다. 규정, 처리, 판단 이유, 근거 기록을 모두 남겨 주십시오.' };
      if (a.source !== t.source)
        return { ok: false, team: t.id, message: t.name + '이 실제로 언제, 어떤 장비를 썼는지 이 근거만으로 확인할 수 있습니까?' };
      if (a.rule !== r.id)
        return { ok: false, team: t.id, message: t.name + '에 붙인 규정의 적용 장비와 시행일을 다시 보십시오. 접수일과 시험일은 다를 수 있습니다.' };
      var expected = issue(ch, t);
      if (a.action !== (expected === 'valid' ? 'keep' : 'redo') || a.reason !== expected)
        return { ok: false, team: t.id, message: t.name + '의 처리와 이유가 원기록에 맞지 않습니다. 규정 표지뿐 아니라 실제로 수행한 조건을 대조해 주십시오.' };
    }
    return { ok: true };
  }
  function run(ch, id, wait, repeats) {
    var t = ch.teams.find(function (team) { return team.id === id; });
    if (!t || issue(ch, t) === 'valid' || [10, 20, 30].indexOf(wait) < 0 || [3, 5].indexOf(repeats) < 0) return null;
    return { equipment: t.equipment, date: '11-13', wait: wait, repeats: repeats,
      entries: Array.from({ length: repeats }, function (_, i) { return '09:' + String(wait + i).padStart(2, '0'); }), checked: false };
  }
  function validRun(ch, id, job) {
    var t = ch.teams.find(function (team) { return team.id === id; });
    if (!t || !job || issue(ch, t) === 'valid') return false;
    var r = ruleFor(ch, { equipment: job.equipment, date: job.date });
    return !!r && job.equipment === t.equipment && job.date === '11-13' && job.wait >= r.wait && job.repeats >= r.repeats &&
      Array.isArray(job.entries) && job.entries.length === job.repeats && job.entries.every(function (time, i) {
        return time === '09:' + String(job.wait + i).padStart(2, '0');
      });
  }
  function complete(ch, work) {
    return ch.teams.every(function (t) {
      return issue(ch, t) === 'valid' ? !!work.preserved[t.id] : validRun(ch, t.id, work.jobs[t.id]) && work.jobs[t.id].checked;
    });
  }
  function fresh() { return { assignments: {}, jobs: {}, preserved: {}, tab: 'a', source: 'A', settings: {} }; }
  function audit(ch) {
    var errors = [], ids = new Set();
    if (!ch.teams || ch.teams.length !== 4) return ['공동 검토실에는 네 팀이 필요합니다.'];
    ch.teams.forEach(function (t) {
      if (ids.has(t.id)) errors.push('팀 id 중복');
      ids.add(t.id);
      if (!ruleFor(ch, t)) errors.push('적용 가능한 규정 없음: ' + t.id);
      if (!ch.sources.some(function (s) { return s.id === t.source; })) errors.push('근거 기록 없음: ' + t.id);
    });
    return errors;
  }
  function create(options) {
    var host = options.host, ch = options.chapter, state, work, root, tabs, stage, reference, status;
    function node(tag, cls, text) {
      var n = document.createElement(tag); if (cls) n.className = cls;
      if (text != null) n.textContent = options.safeText ? options.safeText(text) : text;
      return n;
    }
    function button(text, cls, fn) { var b = node('button', cls, text); b.type = 'button'; b.setAttribute('data-focus', text); b.onclick = fn; return b; }
    function changed() { options.onChange(); }
    function announce(text) { status.textContent = text; }
    function select(label, choices, value, change, key, disabled) {
      var wrap = node('label', 'condition-field'), s = node('select');
      wrap.append(node('span', '', label)); s.setAttribute('data-field', key);
      var blank = node('option', '', '선택하세요'); blank.value = ''; s.append(blank);
      choices.forEach(function (item) { var o = node('option', '', item.label); o.value = item.id; s.append(o); });
      s.value = value || ''; s.disabled = !!disabled;
      s.onchange = function () { change(s.value); changed(); announce('배정표에 기록했습니다. 검토를 요청하기 전까지 수정할 수 있습니다.'); };
      wrap.append(s); return wrap;
    }
    function drawReference() {
      reference.replaceChildren(); reference.append(node('div', 'condition-eyebrow', 'REFERENCE / 규정함'));
      var nav = node('div', 'condition-source-tabs');
      ch.rules.concat(ch.sources).forEach(function (s) {
        var b = button(s.title, 'condition-source', function () { work.source = s.id; drawReference(); reference.querySelector('[aria-pressed="true"]').focus(); });
        b.setAttribute('aria-pressed', String(work.source === s.id)); nav.append(b);
      });
      reference.append(nav);
      var source = ch.rules.concat(ch.sources).find(function (s) { return s.id === work.source; }) || ch.rules[0];
      reference.append(node('h3', '', source.title), node('p', 'condition-meta', source.tag || '발행 ' + source.issued + ' · 적용 장비 ' + source.equipment));
      if (source.equipment) {
        var metrics = node('dl', 'condition-metrics');
        [['안정화', source.wait + '분 이상'], ['기록', source.repeats + '회 이상']].forEach(function (pair) { metrics.append(node('dt', '', pair[0]), node('dd', '', pair[1])); });
        reference.append(metrics);
      }
      reference.append(node('p', 'condition-source-text', source.text));
      reference.append(node('p', 'condition-footnote', '문서의 발행일 · 시행일 · 실제 시험일을 구분한다.'));
    }
    function draw() {
      var active = host.contains(document.activeElement) ? document.activeElement.getAttribute('data-focus') : null;
      root.replaceChildren();
      var head = node('header', 'condition-head'), title = node('div');
      title.append(node('div', 'condition-eyebrow', 'CHAPTER 02 / COMMON REVIEW'), node('h2', '', '네 개의 봉투, 하나의 기준'));
      title.querySelector('h2').id = 'reader-title';
      head.append(title, button('검토실로 돌아가기', 'btn reader-close', options.onClose)); root.append(head);
      var revised = ['revised', 'verified', 'approved'].indexOf(state.phase) >= 0;
      var intro = node('div', 'condition-intro');
      intro.append(node('b', '', revised ? '02 / 재시험과 원기록 보존' : '01 / 조건 배정'), node('p', '', revised ? '반려한 팀에 시험 조건을 지시하고, 돌아온 시간 기록을 검토한다. 보존할 원본도 직접 확인한다.' : '각 봉투에 규정과 처리 지시를 붙인다. 판단의 근거가 되는 대장도 지정한 뒤 Enrico에게 검토를 요청한다.'));
      root.append(intro);
      tabs = node('nav', 'condition-tabs'); tabs.setAttribute('aria-label', '팀별 기록');
      ch.teams.forEach(function (t) {
        var a = work.assignments[t.id], done = revised ? (work.preserved[t.id] || work.jobs[t.id] && work.jobs[t.id].checked) : a && a.rule && a.action && a.reason && a.source;
        var b = button(t.name + ' / ' + t.role + (done ? ' · 기록됨' : ''), 'condition-tab', function () { work.tab = t.id; draw(); tabs.querySelector('[aria-pressed="true"]').focus(); });
        b.setAttribute('aria-pressed', String(t.id === work.tab)); b.setAttribute('data-focus', t.id); tabs.append(b);
      });
      root.append(tabs);
      var grid = node('div', 'condition-grid'); stage = node('section', 'condition-ticket'); reference = node('aside', 'condition-reference'); grid.append(stage, reference); root.append(grid);
      var t = ch.teams.find(function (team) { return team.id === work.tab; }) || ch.teams[0];
      stage.append(node('div', 'condition-eyebrow', t.name + ' / 접수 ' + t.filed), node('h3', '', t.role + '의 시험 기록'), node('blockquote', '', '“' + t.quote + '”'), node('p', 'condition-original', t.note));
      if (revised) drawJob(t); else drawAssignment(t);
      drawReference();
      var footer = node('footer', 'condition-footer');
      status = node('p', 'condition-status', revised ? '새 기록을 열기만 해서는 승인이 완료되지 않습니다.' : '아직 제출하지 않은 배정은 정답 표시 없이 기록됩니다.'); status.setAttribute('role', 'status'); status.tabIndex = -1;
      footer.append(status);
      if (!revised && ['submitted', 'inspecting'].indexOf(state.phase) >= 0) footer.append(button('Enrico에게 검토 요청 →', 'btn condition-submit', options.onSubmit));
      if (state.phase === 'contradiction' || state.phase === 'verified') footer.append(button(state.phase === 'contradiction' ? '반려 도장으로 →' : '승인 도장으로 →', 'btn condition-submit', options.onStamp));
      root.append(footer);
      if (active) { var focus = root.querySelector('[data-focus="' + active + '"]'); if (focus) focus.focus(); else status.focus(); }
    }
    function drawAssignment(t) {
      var a = work.assignments[t.id] || (work.assignments[t.id] = {}), fields = node('div', 'condition-fields');
      var locked = ['submitted', 'inspecting'].indexOf(state.phase) < 0;
      [
        ['적용할 규정', ch.rules.map(function (r) { return { id: r.id, label: r.title }; }), 'rule'],
        ['처리 지시', [{ id: 'keep', label: '원기록 보존' }, { id: 'redo', label: '재시험' }], 'action'],
        ['판단 이유', ch.reasons, 'reason'],
        ['장비·시험일의 근거', ch.sources.map(function (s) { return { id: s.id, label: s.title }; }), 'source']
      ].forEach(function (f) { fields.append(select(f[0], f[1], a[f[2]], function (value) { a[f[2]] = value; }, f[2], locked)); });
      stage.append(fields);
    }
    function drawJob(t) {
      var locked = state.phase !== 'revised';
      if (issue(ch, t) === 'valid') {
        stage.append(node('p', 'condition-preserve', '원본 보존 대상 · 새 날짜와 새 조건으로 덮어쓰지 않는다.'));
        var preserve = button(work.preserved[t.id] ? '원기록 보존 확인됨' : '원기록과 보관함 인수표 대조 완료', 'btn', function () {
          work.preserved[t.id] = true; changed(); draw();
        });
        preserve.disabled = locked || !!work.preserved[t.id]; stage.append(preserve); return;
      }
      var setting = work.settings[t.id] || (work.settings[t.id] = {}), fields = node('div', 'condition-fields');
      fields.append(select('새 시험의 안정화 시간', [10, 20, 30].map(function (v) { return { id: String(v), label: v + '분' }; }), setting.wait, function (v) { setting.wait = v; }, 'wait', locked),
        select('새 시험의 기록 횟수', [3, 5].map(function (v) { return { id: String(v), label: v + '회' }; }), setting.repeats, function (v) { setting.repeats = v; }, 'repeats', locked));
      stage.append(fields);
      var execute = button('시험 지시서 보내기', 'btn condition-run', function () {
        var result = run(ch, t.id, Number(setting.wait), Number(setting.repeats));
        if (!result) { announce('안정화 시간과 기록 횟수를 먼저 정해 주십시오.'); return; }
        work.jobs[t.id] = result; changed(); draw(); announce(t.name + '의 11월 13일 재시험 기록이 도착했습니다. 시간과 횟수를 대조해 주십시오.');
      });
      execute.disabled = locked; stage.append(execute, node('p', 'condition-meta', '지시 후 다음 날의 기록으로 이동합니다. 실제 대기 시간은 없습니다.'));
      var job = work.jobs[t.id];
      if (!job) return;
      var receipt = node('div', 'condition-receipt');
      receipt.append(node('div', 'condition-eyebrow', 'RETURNED / 11월 13일 · ' + job.equipment), node('h4', '', '09:00 시작 → ' + job.entries[0] + ' 첫 기록'));
      var strip = node('ol', 'condition-times'); job.entries.forEach(function (entry, i) { strip.append(node('li', '', (i + 1) + '차 ' + entry)); }); receipt.append(strip);
      var check = button(job.checked ? '기준 충족 확인됨' : '기준 충족으로 검토 완료', 'btn', function () {
        if (!validRun(ch, t.id, job)) { announce('반환된 기록이 기준을 충족하지 않습니다. 첫 기록 시각과 전체 기록 수를 확인하고 지시서를 다시 보내 주십시오.'); return; }
        job.checked = true; changed(); draw();
      });
      check.disabled = locked || job.checked; receipt.append(check); stage.append(receipt);
    }
    return {
      render: function (s) { state = s; work = s.conditions || (s.conditions = fresh()); if (!root) { root = node('div', 'conditions'); host.append(root); } draw(); },
      focus: function () { root.querySelector('.reader-close').focus(); },
      destroy: function () { if (root) root.remove(); }
    };
  }
  return { ruleFor: ruleFor, issue: issue, judge: judge, run: run, validRun: validRun, complete: complete, fresh: fresh, audit: audit, create: create };
});
