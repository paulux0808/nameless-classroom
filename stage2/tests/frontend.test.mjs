import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import vm from 'node:vm';
import { parseHTML } from 'linkedom';

// DOM integration tests, not layout/graphics tests. The renderer deliberately fails
// so the real reader and engine can be exercised without GPU/browser dependencies.
function setup(width = 1280, options = {}) {
  const html = readFileSync(new URL('../ch01.html', import.meta.url), 'utf8');
  const { document, window: dom } = parseHTML(html);
  const events = new Map(), storage = options.storage || new Map();
  const storageCalls = [];
  let reloads = 0;
  let focused = document.body;
  Object.defineProperty(document, 'activeElement', { get: () => focused });
  dom.HTMLElement.prototype.focus = function () { focused = this; };
  Object.defineProperty(dom.HTMLElement.prototype, 'offsetParent', {
    configurable: true,
    get() { return this.hidden || this.closest('.hidden, [hidden]') ? null : document.body; }
  });
  const context = {
    document, navigator: { maxTouchPoints: 0 }, innerWidth: width, innerHeight: 800,
    console: { error() {}, log() {} },

    setTimeout() { return 1; }, clearTimeout() {},
    addEventListener(type, callback) {
      if (!events.has(type)) events.set(type, new Set());
      events.get(type).add(callback);
    },
    removeEventListener(type, callback) { events.get(type)?.delete(callback); },
    matchMedia() { return { get matches() { return context.innerWidth < 640; } }; },
    THREE: { WebGLRenderer() { throw new Error('GPU unavailable in DOM test'); } },
    location: { reload() { reloads++; } }
  };
  for (const name of ['localStorage', 'sessionStorage']) {
    Object.defineProperty(context, name, { get() {
      storageCalls.push(name);
      if (options.blockStorage) throw new Error('Storage disabled');
      return { getItem: k => storage.get(k), setItem: (k, v) => storage.set(k, v) };
    }});
  }
  Object.defineProperty(document, 'cookie', {
    get() { storageCalls.push('cookie:get'); return 'oldStage2=complete'; },
    set() { storageCalls.push('cookie:set'); }
  });
  context.window = context;
  vm.createContext(context);
  for (const file of ['logic.js', 'reader.js', 'chapters/ch01.js', 'engine.js']) {
    vm.runInContext(readFileSync(new URL('../' + file, import.meta.url), 'utf8'), context, { filename: file });
  }
  context.N2Engine.boot(context.N2_CHAPTERS.ch01);
  return { document, engine: context.N2Engine, L: context.N2, context, storage, storageCalls,
    get reloads() { return reloads; },
    showPage(persisted) { events.get('pageshow')?.forEach(fn => fn({ persisted })); },
    resize(width) { context.innerWidth = width; events.get('resize')?.forEach(fn => fn()); } };
}
const $ = (app, selector) => app.document.querySelector(selector);
const click = (app, selector) => $(app, selector).click();

test('WebGL failure ends loading with a readable recovery action', () => {
  const app = setup();
  assert.match($(app, '#load-status').textContent, /열 수 없습니다/);
  assert.ok($(app, '#loading').classList.contains('failed'));
  assert.equal($(app, '#loading button').textContent, '다시 시도');
});

test('selecting and grouping real report sentences retains DOM, scroll and focus', () => {
  const app = setup();
  app.engine._openDocs();
  assert.equal(app.document.querySelectorAll('.stmt').length, 36);
  const body = $(app, '.letter-body');
  const sentence = $(app, '[data-st="r1_std"]');
  body.scrollTop = 240;
  sentence.focus(); sentence.click();
  assert.equal($(app, '.letter-body'), body);
  assert.equal($(app, '[data-st="r1_std"]'), sentence);
  assert.equal(body.scrollTop, 240);
  assert.equal(app.document.activeElement, sentence);
  assert.equal(sentence.getAttribute('aria-pressed'), 'true');
  click(app, '[data-st="r2_std"]'); click(app, '[data-st="r3_std"]');
  assert.equal(app.engine._state().claims.join(','), 'std');
  assert.equal(app.document.querySelectorAll('.stmt.claimed').length, 3);
  assert.equal(body.scrollTop, 240);
  assert.equal(app.engine._state().phase, app.L.PHASE.SUBMITTED);
});

test('closing and reopening the reader preserves reading position and presentation preferences', () => {
  const app = setup(); app.engine._openDocs();
  const body = $(app, '.letter-body'); body.scrollTop = 185;
  click(app, '.reader-size'); click(app, '.reader-mode');
  click(app, '.reader-close');
  assert.ok($(app, '#sheet').classList.contains('hidden'));
  assert.equal($(app, '#scene').inert, false);
  app.engine._openDocs();
  assert.equal($(app, '.letter-body'), body);
  assert.equal(body.scrollTop, 185);
  assert.ok($(app, '.reader').classList.contains('large-type'));
  assert.ok($(app, '.reader').classList.contains('single-page'));
  assert.equal($(app, '#scene').inert, true);
  assert.equal(app.document.activeElement, $(app, '.reader-close'));
});

test('mobile report navigation and resizing preserve evidence selections and each paper scroll', () => {
  const app = setup(390); app.engine._openDocs();
  const papers = [...app.document.querySelectorAll('.letter')];
  const body = papers[0].querySelector('.letter-body'); body.scrollTop = 130;
  click(app, '[data-st="r1_deck"]');
  const before = JSON.stringify(app.engine._state());
  app.document.querySelectorAll('.reader-page')[1].click();
  assert.equal(papers[0].hidden, true); assert.equal(papers[1].hidden, false);
  assert.equal($(app, '.reader-mode').hidden, true);
  app.document.querySelectorAll('.reader-page')[0].click();
  assert.equal(body.scrollTop, 130);
  click(app, '.reader-size');
  app.resize(1280); click(app, '.reader-mode');
  assert.equal(papers.filter(p => !p.hidden).length, 3);
  assert.equal(JSON.stringify(app.engine._state()), before);
});

test('revision and stamp transitions retain the original verification rules and clean up reader listeners', () => {
  const app = setup(); app.engine._openDocs();
  app.engine._setState({ ...app.engine._state(), phase: app.L.PHASE.REVISED });
  app.engine._openDocs();
  assert.equal(app.engine._state().phase, app.L.PHASE.VERIFIED);
  assert.equal(app.document.querySelectorAll('.stmt.ok').length, 18);
  assert.equal(app.document.querySelectorAll('.stmt[role="button"]').length, 0);
  click(app, '.reader-close'); app.engine._openStamp();
  assert.equal($(app, '.reader'), null);
  assert.equal($(app, '.stamp-btn').textContent, 'APPROVED');
  assert.equal($(app, '#sheet').getAttribute('aria-labelledby'), 'sheet-title');
});

test('the same selected sentence can be toggled with the keyboard without advancing the puzzle', () => {
  const app = setup(); app.engine._openDocs();
  const sentence = $(app, '[data-st="r1_zero"]');
  let prevented = 0;
  sentence.onkeydown({ key: 'Enter', preventDefault() { prevented++; } });
  assert.equal(sentence.getAttribute('aria-pressed'), 'true');
  sentence.onkeydown({ key: ' ', preventDefault() { prevented++; } });
  assert.equal(sentence.getAttribute('aria-pressed'), 'false');
  assert.equal(app.engine._state().sel.length, 0);
  assert.equal(prevented, 2);
});


test('old progress is ignored without reading, overwriting or deleting browser storage', () => {
  const oldSave = JSON.stringify({ started: true, chapter: 1, phase: 'approved',
    greeted: true, sel: [], claims: ['std'], verified: ['std'], approved: [1],
    spoiler: 0, seenResults: false, done: false });
  const storage = new Map([['nameless2-v1', oldSave], ['stage1-user-progress', 'keep']]);
  const app = setup(1280, { storage });
  assert.equal(app.engine._state().phase, app.L.PHASE.SUBMITTED);
  assert.equal(app.engine._state().greeted, false);
  assert.equal(app.engine._state().approved.length, 0);
  app.engine._openDocs();
  click(app, '[data-st="r1_std"]'); click(app, '[data-st="r2_std"]'); click(app, '[data-st="r3_std"]');
  assert.equal(app.engine._state().claims.join(','), 'std', 'current page still advances');
  assert.deepEqual(app.storageCalls, []);
  assert.equal(storage.get('nameless2-v1'), oldSave);
  assert.equal(storage.get('stage1-user-progress'), 'keep');
  const reopened = setup(1280, { storage });
  assert.equal(reopened.engine._state().claims.length, 0);
  assert.equal(reopened.engine._state().greeted, false);
});

test('Stage 2 runs with storage access disabled and refreshes restored page-cache entries', () => {
  const app = setup(1280, { blockStorage: true });
  app.engine._openDocs();
  click(app, '[data-st="r1_zero"]');
  assert.equal(app.engine._state().sel[0], 'r1_zero');
  assert.deepEqual(app.storageCalls, []);
  app.showPage(false); assert.equal(app.reloads, 0);
  app.showPage(true); assert.equal(app.reloads, 1);
});

test('the chapter hub does not access browser storage or show old approval progress', () => {
  const html = readFileSync(new URL('../index.html', import.meta.url), 'utf8');
  const { document } = parseHTML(html);
  const accesses = [];
  const context = { document, location: { href: '' } };
  for (const name of ['localStorage', 'sessionStorage']) {
    Object.defineProperty(context, name, { get() { accesses.push(name); throw new Error('Blocked'); } });
  }
  Object.defineProperty(document, 'cookie', { get() { accesses.push('cookie'); return ''; } });
  vm.createContext(context);
  for (const script of document.querySelectorAll('script:not([src])')) {
    vm.runInContext(script.textContent, context);
  }
  assert.deepEqual(accesses, []);
  assert.equal(document.querySelectorAll('#chapters button').length, 10);
  const ready = document.querySelector('#chapters button');
  assert.equal(ready.disabled, false);
  ready.click(); assert.equal(context.location.href, 'ch01.html');
  assert.equal(document.querySelector('#gate'), null);
});
