import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import vm from 'node:vm';
import { parseHTML } from 'linkedom';

// DOM integration tests, not layout/graphics tests. The renderer deliberately fails
// so the real reader and engine can be exercised without GPU/browser dependencies.
function setup(width = 1280) {
  const html = readFileSync(new URL('../ch01.html', import.meta.url), 'utf8');
  const { document, window: dom } = parseHTML(html);
  const events = new Map(), storage = new Map();
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
    localStorage: { getItem: k => storage.get(k), setItem: (k, v) => storage.set(k, v) },
    setTimeout() { return 1; }, clearTimeout() {},
    addEventListener(type, callback) {
      if (!events.has(type)) events.set(type, new Set());
      events.get(type).add(callback);
    },
    removeEventListener(type, callback) { events.get(type)?.delete(callback); },
    matchMedia() { return { get matches() { return context.innerWidth < 640; } }; },
    THREE: { WebGLRenderer() { throw new Error('GPU unavailable in DOM test'); } },
    location: { reload() {} }
  };
  context.window = context;
  vm.createContext(context);
  for (const file of ['logic.js', 'reader.js', 'chapters/ch01.js', 'engine.js']) {
    vm.runInContext(readFileSync(new URL('../' + file, import.meta.url), 'utf8'), context, { filename: file });
  }
  context.N2Engine.boot(context.N2_CHAPTERS.ch01);
  return { document, engine: context.N2Engine, L: context.N2, context,
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
