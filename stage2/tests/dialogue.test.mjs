import test from 'node:test';
import assert from 'node:assert/strict';
import {createRequire} from 'node:module';
import {parseHTML} from 'linkedom';
const require=createRequire(import.meta.url),Dialogue=require('../dialogue.js');

test('stage beats keep pauses, speaker changes and cues intact through mouse and keyboard input',()=>{
 const {document}=parseHTML('<div id="dialogue" class="hidden"></div>');
 const box=document.querySelector('div'),cues=[];let now=0,closed=0,completed=0;
 const player=Dialogue.create({box,speaker:'RICHARD',safeText:s=>String(s).replace('secret','…'),now:()=>now,onCue:cue=>cues.push(cue),onClose:()=>closed++});
 player.run([{text:'첫 결과입니다.',stage:'secret',pose:'confident',pause:500},{who:'당신',text:'세 번 다?',pose:'listen'},'네.'],()=>completed++);
 assert.equal(box.querySelector('.who').textContent,'리처드');
 assert.equal(box.querySelector('.stage-direction').textContent,'…');
 box.click();now=499;box.click();assert.equal(cues.length,1);
 now=500;box.click();assert.equal(box.querySelector('.who').textContent,'당신');
 assert.equal(cues[1].who,'당신');assert.equal(box.querySelector('.stage-direction'),null);
 now=750;box.onclick({detail:2});assert.equal(cues.length,2,'double click cannot skip a beat');
 const key=(repeat=false)=>({key:'Enter',repeat,preventDefault(){}});
 box.onkeydown(key(true));assert.equal(cues.length,2,'held key cannot skip a beat');
 box.onkeydown(key());assert.equal(box.querySelector('.line').textContent,'네.');
 assert.equal(box.querySelector('.who').textContent,'리처드');
 now=1000;box.click();box.click();assert.equal(completed,1);assert.equal(closed,1);
 assert.equal(box.classList.contains('hidden'),true);assert.equal(box.onclick,null);
 assert.deepEqual(cues.at(-1),{pose:'listen',look:'player'});
 player.run([],()=>completed++);assert.equal(completed,2);assert.equal(closed,2);
});
