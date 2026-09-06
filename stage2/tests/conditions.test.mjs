import test from 'node:test';
import assert from 'node:assert/strict';
import {createRequire} from 'node:module';
import {readFileSync} from 'node:fs';
import vm from 'node:vm';
import {parseHTML} from 'linkedom';
const require=createRequire(import.meta.url), C=require('../conditions.js'), ch=require('../chapters/ch02.js');
const fresh=()=>({phase:'submitted',conditions:C.fresh()});
function unlock(s){for(let i=0;i<4;i++)for(let j=0;j<Number(ch.escape.cabinetCode[i]);j++)C.act(ch,s,{type:'wheel',index:i,delta:1});return C.act(ch,s,{type:'unlock'});}
function prepare(s){unlock(s);C.act(ch,s,{type:'rule'});C.act(ch,s,{type:'crank'});for(const t of ch.teams){C.act(ch,s,{type:'take',id:t.id});C.act(ch,s,{type:'select',id:t.id});C.act(ch,s,{type:'dock',target:t.id==='c'?'archive':'bench'});}}
test('clues lead to a locked physical inventory; wrong codes leave the drawer shut',()=>{
 const s=fresh();assert.deepEqual(C.audit(ch),[]);assert.equal(C.act(ch,s,{type:'unlock'}).ok,false);assert.equal(C.act(ch,s,{type:'crank'}).ok,false);
 C.act(ch,s,{type:'note'});C.act(ch,s,{type:'plate'});assert.equal(s.conditions.note,true);assert.equal(s.conditions.plate,true);
 assert.equal(unlock(s).ok,true);assert.equal(C.act(ch,s,{type:'crank'}).ok,true);assert.equal(s.conditions.crank,true);
 C.act(ch,s,{type:'take',id:'c'});C.act(ch,s,{type:'take',id:'c'});assert.deepEqual(s.conditions.cards,['c']);
});
test('all four collected cards must be routed; incorrect placements remain movable',()=>{
 const s=fresh();assert.equal(C.act(ch,s,{type:'select',id:'c'}).ok,false);prepare(s);assert.equal(C.judge(ch,s.conditions).ok,true);
 C.act(ch,s,{type:'select',id:'c'});C.act(ch,s,{type:'dock',target:'bench'});assert.equal(C.judge(ch,s.conditions).ok,false);assert.equal(s.conditions.routes.c,'bench');
 C.act(ch,s,{type:'select',id:'c'});C.act(ch,s,{type:'dock',target:'archive'});assert.equal(C.judge(ch,s.conditions).ok,true);
});
test('hardware, rejection, actual output and approval gate progress separately',()=>{
 const s=fresh();prepare(s);assert.equal(C.act(ch,s,{type:'install'}).ok,false);s.phase='revised';assert.equal(C.act(ch,s,{type:'install'}).ok,true);
 C.act(ch,s,{type:'run'});assert.equal(C.act(ch,s,{type:'receipt'}).ok,false);
 C.act(ch,s,{type:'wait'});C.act(ch,s,{type:'run'});assert.equal(C.act(ch,s,{type:'receipt'}).ok,false);
 C.act(ch,s,{type:'repeats'});C.act(ch,s,{type:'run'});assert.equal(C.validRun(ch,s.conditions),true);assert.equal(C.complete(ch,s.conditions),false);
 C.act(ch,s,{type:'receipt'});assert.equal(C.complete(ch,s.conditions),true);assert.equal(C.act(ch,s,{type:'key'}).ok,false);
 s.phase='approved';assert.equal(C.act(ch,s,{type:'key'}).ok,true);assert.equal(C.act(ch,s,{type:'wait'}).ok,false);
});
test('changing a dial invalidates previous output and accepted paper',()=>{
 const s=fresh();prepare(s);s.phase='revised';C.act(ch,s,{type:'install'});C.act(ch,s,{type:'wait'});C.act(ch,s,{type:'repeats'});C.act(ch,s,{type:'run'});C.act(ch,s,{type:'receipt'});
 C.act(ch,s,{type:'wait'});assert.equal(s.conditions.run,null);assert.equal(s.conditions.receipt,false);assert.equal(C.complete(ch,s.conditions),false);
});
function setup(){
 const {document,window:dom}=parseHTML(readFileSync(new URL('../ch02.html',import.meta.url),'utf8'));
 let focused=document.body;Object.defineProperty(document,'activeElement',{get:()=>focused});dom.HTMLElement.prototype.focus=function(){focused=this;};
 Object.defineProperty(dom.HTMLElement.prototype,'offsetParent',{configurable:true,get(){return this.closest('.hidden')?null:document.body;}});
 const context={document,navigator:{maxTouchPoints:0},innerWidth:844,innerHeight:390,console:{error(){},warn(){}},addEventListener(){},removeEventListener(){},setTimeout(){return 1;},clearTimeout(){},THREE:{WebGLRenderer(){throw Error('DOM test');}},location:{},matchMedia(){return {matches:false};}};
 for(const k of ['localStorage','sessionStorage'])Object.defineProperty(context,k,{get(){throw Error('storage accessed');}});
 Object.defineProperty(document,'cookie',{get(){throw Error('cookie accessed');},set(){throw Error('cookie accessed');}});
 context.window=context;vm.createContext(context);for(const f of ['logic.js','conditions.js','reader.js','chapters/ch02.js','engine.js'])vm.runInContext(readFileSync(new URL('../'+f,import.meta.url),'utf8'),context);
 const engine=context.N2Engine;engine.boot(context.N2_CHAPTERS.ch02);engine._setState(engine._state());const $=v=>document.querySelector(v);
 const click=k=>{const e=$('[data-focus="'+k+'"]');assert.ok(e,'missing '+k);assert.equal(e.disabled,false,'disabled '+k);e.click();};
 function advance(){let n=0;while(!$('#dialogue').classList.contains('hidden')&&n++<30)$('#dialogue').click();assert.ok(n<30);}
 return {engine,document,$,click,advance};
}
test('complete escape through actual object UI: collect, unlock, route, reject, crank, approve, use key',()=>{
 const {engine,document,$,click,advance}=setup();engine._talk();advance();
 engine._openDocs();assert.equal(document.querySelectorAll('select').length,0);assert.equal(document.querySelectorAll('.stmt').length,0);assert.equal(engine._state().conditions.cards.length,4);assert.equal(engine._state().conditions.selected,'a');assert.equal($('#objective').textContent,'');click('close');
 engine._openObject('bench');click('inspect-plate');click('plate');click('close');
 engine._openObject('cabinet');click('unlock');assert.match($('.escape-status').textContent,/움직이지/);
 click('wheel-0');click('wheel-1');click('wheel-2');click('unlock');click('rule');click('crank');click('close');
  engine._openDocs();for(const id of ['a','b','c','d']){click('card-'+id);click('dock-'+(id==='c'?'archive':'bench'));}
 click('submit');advance();assert.equal(engine._state().phase,'contradiction');engine._openStamp();$('.stamp-btn').click();advance();assert.equal(engine._state().phase,'revised');
 engine._openObject('bench');click('install');click('run');click('receipt');assert.match($('.escape-status').textContent,/못 미친다/);assert.equal(engine._state().phase,'revised');
 click('dial-wait');click('dial-repeats');click('run');assert.equal(engine._state().phase,'revised');click('receipt');assert.equal(engine._state().phase,'verified');click('close');
 engine._openStamp();$('.stamp-btn').click();advance();assert.equal(engine._state().phase,'approved');assert.equal($('#bar-pct').textContent,'19%');
 engine._leave();assert.match($('#toast').textContent,/열쇠/);assert.equal($('#sheet').classList.contains('hidden'),true);
 engine._openObject('bench');click('key');click('close');engine._leave();assert.match($('#sheet-sub').textContent,/19%/);assert.equal($('#sheet').classList.contains('escape-sheet'),false);
});
test('the notebook only shows discovered clues and returning restores the same object',()=>{
 const {engine,$,click}=setup();engine._openObject('cabinet');click('notes');assert.match($('.escape-notes').textContent,/아직/);assert.doesNotMatch($('.escape-notes').textContent,/11월 10일/);click('back');assert.match($('#reader-title').textContent,/규정함/);
 engine._openObject('plate');click('plate');click('notes');assert.match($('.escape-notes').textContent,/11월 10일/);assert.doesNotMatch($('.escape-notes').textContent,/안정화 20분/);
});
test('opening a new chapter resets locks, inventory and progress with storage disabled',()=>{
 const a=setup();prepare(a.engine._state());const b=setup();assert.equal(b.engine._state().conditions.cards.length,0);assert.equal(b.engine._state().conditions.cabinet,false);assert.equal(b.engine._state().phase,'submitted');
});
