import test from 'node:test';
import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import { readFileSync } from 'node:fs';
import vm from 'node:vm';
import { parseHTML } from 'linkedom';
const require = createRequire(import.meta.url);
const C = require('../conditions.js'), ch = require('../chapters/ch02.js');
const solution = {
  a: { rule:'B', action:'redo', reason:'edition', source:'change' },
  b: { rule:'B', action:'redo', reason:'wait', source:'change' },
  c: { rule:'A', action:'keep', reason:'valid', source:'archive' },
  d: { rule:'B', action:'redo', reason:'repeats', source:'change' }
};
test('CH2 uses equipment and actual test date, preserving a legitimate older edition', () => {
  assert.deepEqual(C.audit(ch), []);
  assert.equal(C.ruleFor(ch, ch.teams[2]).id, 'A');
  assert.equal(C.ruleFor(ch, { equipment:'K-2', date:'11-09' }), undefined);
  assert.equal(C.ruleFor(ch, { equipment:'K-2', date:'11-10' }).id, 'B');
  assert.equal(C.judge(ch, solution).ok, true);
});
test('every assignment field matters, no claim is silently corrected or removed', () => {
  for (const id of ['a','b','c','d']) for (const field of ['rule','action','reason','source']) {
    const draft = structuredClone(solution); draft[id][field] = 'wrong';
    const before = structuredClone(draft);
    assert.equal(C.judge(ch, draft).ok, false, id + '/' + field);
    assert.deepEqual(draft, before);
    delete draft[id][field]; assert.equal(C.judge(ch, draft).ok, false);
  }
});
test('blanket latest-rule/retest decisions fail and archived records cannot be rerun', () => {
  const draft = structuredClone(solution); draft.c = { ...draft.a };
  assert.equal(C.judge(ch, draft).ok, false);
  assert.equal(C.run(ch, 'c', 20, 5), null);
});
test('returned logs validate actual timing and sample count, with explicit verification required', () => {
  const work = C.fresh(); work.preserved.c = true;
  for (const id of ['a','b','d']) {
    assert.equal(C.validRun(ch, id, C.run(ch, id, 10, 5)), false);
    assert.equal(C.validRun(ch, id, C.run(ch, id, 20, 3)), false);
    assert.equal(C.validRun(ch, id, C.run(ch, id, 30, 5)), true);
    work.jobs[id] = C.run(ch, id, 20, 5);
  }
  assert.equal(C.complete(ch, work), false);
  Object.values(work.jobs).forEach(j => j.checked = true);
  assert.equal(C.complete(ch, work), true);
  work.jobs.a.entries[0] = '09:10'; assert.equal(C.complete(ch, work), false);
});
function setup() {
  const {document,window:dom} = parseHTML(readFileSync(new URL('../ch02.html',import.meta.url),'utf8'));
  let focused = document.body;
  Object.defineProperty(document,'activeElement',{ get:()=>focused });
  dom.HTMLElement.prototype.focus = function(){ focused=this; };
  Object.defineProperty(dom.HTMLElement.prototype,'offsetParent',{configurable:true,get(){return this.closest('.hidden') ? null : document.body;}});
  Object.defineProperty(dom.HTMLSelectElement.prototype,'value', { configurable:true,
    get(){return [...this.options].find(o=>o.selected)?.value || '';},
    set(value){for(const o of this.options)o.removeAttribute('selected');const o=[...this.options].find(o=>o.value===value);if(o)o.setAttribute('selected','');}
  });
  const context = { document, navigator:{maxTouchPoints:0}, innerWidth:844, innerHeight:390,
    console:{error(){},warn(){}}, addEventListener(){}, removeEventListener(){}, setTimeout(){return 1;}, clearTimeout(){},
    THREE:{ WebGLRenderer(){throw Error('DOM test');}}, location:{}, matchMedia(){return {matches:false};} };
  Object.defineProperty(context,'localStorage',{get(){throw Error('storage accessed');}});
  Object.defineProperty(context,'sessionStorage',{get(){throw Error('storage accessed');}});
  Object.defineProperty(document,'cookie',{get(){throw Error('cookie accessed');},set(){throw Error('cookie accessed');}});
  context.window=context;vm.createContext(context);
  for (const f of ['logic.js','conditions.js','reader.js','chapters/ch02.js','engine.js']) vm.runInContext(readFileSync(new URL('../'+f,import.meta.url),'utf8'),context);
  const engine=context.N2Engine;engine.boot(context.N2_CHAPTERS.ch02);engine._setState(engine._state());
  const $=s=>document.querySelector(s);
  function advance(){let i=0;while(!$('#dialogue').classList.contains('hidden') && i++<30)$('#dialogue').click();assert.ok(i<30);}
  function choose(field,value){ const s=$('[data-field="'+field+'"]'); s.value=value; s.dispatchEvent(new dom.Event('change')); }
  function team(id){ $('[data-focus="'+id+'"]').click(); }
  return {engine,$,document,advance,choose,team};
}
test('full CH2 UI flow: draft correction → rejection → failed rerun → review → approval → exit', () => {
  const a=setup(), {engine,$,choose,team,advance}=a;
  engine._talk(); assert.equal($('#dialogue .who').textContent,'A팀'); advance();
  engine._openDocs(); assert.equal($('#bar-pct').textContent,'8%');
  assert.equal(a.document.querySelectorAll('.stmt').length,0);
  for(const id of ['a','b','c','d']) {team(id);for(const [f,v] of Object.entries(solution[id]))choose(f,v);}
  // One deliberately wrong decision must remain editable after Enrico's response.
  team('c');choose('rule','B');$('.condition-submit').click();advance();
  assert.equal(engine._state().phase,'inspecting');
  assert.equal(engine._state().conditions.assignments.c.rule,'B');
  engine._openDocs();team('c');choose('rule','A');$('.condition-submit').click();advance();
  assert.equal(engine._state().phase,'contradiction');
  engine._openStamp();$('.stamp-btn').click();advance();
  assert.equal(engine._state().phase,'revised');assert.equal($('#bar-pct').textContent,'8%');
  engine._openDocs();assert.equal(engine._state().phase,'revised');
  team('a');choose('wait','10');choose('repeats','5');$('.condition-run').click();$('.condition-receipt .btn').click();
  assert.match($('.condition-status').textContent,/충족하지/);assert.equal(engine._state().conditions.jobs.a.checked,false);
  for(const id of ['a','b','d']) {team(id);choose('wait','20');choose('repeats','5');$('.condition-run').click();$('.condition-receipt .btn').click();}
  assert.equal(engine._state().phase,'revised');
  team('c');$('.condition-ticket .btn').click();
  assert.equal(engine._state().phase,'verified');assert.equal($('#bar-pct').textContent,'8%');
  $('.condition-submit').click();$('.stamp-btn').click();advance();
  assert.equal(engine._state().phase,'approved');assert.equal($('#bar-pct').textContent,'19%');
  assert.deepEqual(Array.from(engine._state().approved),[2]);
  engine._leave();assert.match($('#sheet-sub').textContent,/19%/);
});
test('new CH2 page resets all session progress without any persistent storage', () => {
  const a=setup();a.engine._state().conditions.assignments=structuredClone(solution);
  const b=setup();assert.equal(Object.keys(b.engine._state().conditions.assignments).length,0);
  assert.equal(b.engine._state().phase,'submitted');
});
