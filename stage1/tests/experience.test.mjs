import test from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import {readFileSync,existsSync} from 'node:fs';
import {parseHTML} from 'linkedom';

// State, DOM events and Three.js scene graph; this is not a browser/GPU test.
const read = path => readFileSync(new URL('../'+path,import.meta.url),'utf8');
function setup({width=1280,storage=new Map(),scene=false}={}) {
  const {document,window:dom}=parseHTML(read('index.html'));
  const timers=new Map();let serial=0,focused=document.body;
  Object.defineProperty(document,'activeElement',{get:()=>focused});
  dom.HTMLElement.prototype.focus=function(){focused=this;};
  dom.HTMLElement.prototype.pause=function(){};
  dom.HTMLElement.prototype.getClientRects=function(){
    if(this.closest('.hidden'))return [];
    if(width>1000&&this.closest('.terminal-tabs'))return [];
    if(width<=1000&&this.closest('.terminal-panel:not(.active)'))return [];
    return [{}];
  };
  const g={document,navigator:{maxTouchPoints:width<640?1:0},innerWidth:width,innerHeight:800,
    devicePixelRatio:2,console,performance:{now:()=>1000},matchMedia:()=>({matches:false}),
    localStorage:{getItem:k=>storage.get(k)??null,setItem:(k,v)=>storage.set(k,v),removeItem:k=>storage.delete(k)},
    sessionStorage:{setItem:(k,v)=>storage.set(k,v)},location:{href:'',reload(){}},
    addEventListener(){},dispatchEvent(){},CustomEvent:dom.CustomEvent,
    setTimeout(fn){timers.set(++serial,fn);return serial;},clearTimeout(id){timers.delete(id);},
    requestAnimationFrame(){},getComputedStyle:n=>({display:n.getClientRects().length?'block':'none'}),confirm:()=>false};
  g.window=g;vm.createContext(g);
  if(scene){
    const noop=()=>{},gradient={addColorStop:noop};
    const ctx=new Proxy({measureText:t=>({width:String(t).length*14,actualBoundingBoxAscent:20,actualBoundingBoxDescent:4}),
      createLinearGradient:()=>gradient,createRadialGradient:()=>gradient,
      createImageData:(w,h)=>({data:new Uint8ClampedArray(w*h*4)}),getImageData:(x,y,w,h)=>({data:new Uint8ClampedArray(w*h*4)})},
      {get:(o,k)=>k in o?o[k]:noop});
    dom.HTMLCanvasElement.prototype.getContext=()=>ctx;
    dom.HTMLCanvasElement.prototype.toDataURL=()=> 'data:image/png;base64,';
    vm.runInContext(read('../assets/vendor/three.min.js'),g);
  }
  for(const file of ['logic.js','game.js','runtime-hardening.js'])vm.runInContext(read(file),g,{filename:file});
  document.getElementById('intro').classList.add('hidden');g.S.started=true;g.bindUI();
  return {g,document,storage,
    flush(){const queue=[...timers.values()];timers.clear();queue.forEach(fn=>fn());},
    key(key){const e=new dom.Event('keydown',{bubbles:true,cancelable:true});e.key=key;document.dispatchEvent(e);},
    click(selector){const node=document.querySelector(selector);assert.ok(node,selector);node.onclick();}};
}
const enter=(app,text)=>{for(const ch of text)app.key(ch);};
const answers=['19420108','einstein','coxswain','bigbang','vatican','historyoftime','republicofkorea','163'];
const spots=['calendar','doll','postit','teacher','extinguisher','clock','mathbook','curtain'];

test('all eight puzzles advance only after finding and reading each letter',()=>{
  const app=setup(),g=app.g;g.interact('diary1obj');g.closeModal();
  answers.forEach((answer,i)=>{
    g.showComputer();enter(app,answer);g.activeAnswerPad.submit();assert.equal(g.S.phase,'search');
    assert.equal(g.S.pieces.length,i);g.closeModal();g.interact(spots[i]);assert.equal(g.S.revealed,i+1);
    g.interact('reward:'+(i+1));g.closeModal();app.flush();assert.equal(g.S.ch,i+2);assert.equal(g.S.pieces.length,i+1);
  });
  assert.equal(g.hasAllPieces(g.S),true);assert.equal(g.canExit(g.S),false);
});
test('mobile tabs preserve the answer and expose local chapter seven references',()=>{
  const app=setup({width:390}),g=app.g;g.S.ch=7;g.showComputer();
  assert.ok(app.document.querySelector('#panel-diary.active'));app.click('#tab-answer');enter(app,'republic');
  app.click('#tab-materials');assert.equal(app.document.querySelectorAll('.vocab-table tbody tr').length,15);
  app.key('z');assert.equal(g.activeAnswerPad.value(),'REPUBLIC');app.click('#tab-answer');enter(app,'ofkorea');
  g.activeAnswerPad.submit();assert.equal(g.S.phase,'search');
});
test('an incorrect answer remains editable and Enter submits the corrected word',()=>{
  const app=setup(),g=app.g;g.S.ch=2;g.showComputer();enter(app,'einsteim');app.key('Enter');
  assert.equal(g.activeAnswerPad.value(),'EINSTEIM');assert.match(app.document.querySelector('.answer-feedback').textContent,/아직/);
  app.key('Backspace');app.key('n');app.key('Enter');assert.equal(g.S.phase,'search');
});
test('map, cipher, vocabulary and timing clues produce accepted answers',()=>{
  const {g}=setup();
  const terms=['급진적인','열광적인','수심 어린','동요하지 않는','자애로운','웃음','개인','협력하는','낙관적인','두려움','친절한','말을 잘 듣는','가차없는','절충적인','산술(계산)'];
  const result=terms.map(t=>g.VOCABULARY.find(v=>v[1]===t)[0][0]).join('');assert.equal(result,'republicofkorea');
  assert.ok(g.CH[6].h.includes(g.sealCode(result,7)));
  const destination=g.MAP_ROUTES.map(route=>{const start=route.s.charCodeAt(0)-65;let r=Math.floor(start/6),c=start%6;for(const [dr,dc] of route.mv){r+=dr;c+=dc;}return String.fromCharCode(65+r*6+c);}).join('');
  assert.equal(destination,'VATICAN');assert.equal(g.CIPHER.replace(/[BACKUP]/g,''),'HISTORYOFTIME');
  assert.ok(g.CH[7].h.includes(g.sealCode(String((8+5+12+16+28)*2+5*5),8)));
});
test('exit rejects a fresh game and a collection without the final name',()=>{
  const app=setup(),g=app.g;g.interact('exitdoor');assert.equal(g.S.done,false);assert.equal(g.goToNextStage(),false);
  Object.assign(g.S,{ch:9,pieces:[1,2,3,4,5,6,7,8]});g.interact('exitdoor');assert.equal(g.S.done,false);
  g.S.stack=g.stackOrder();g.S.exitReady=true;g.interact('exitdoor');enter(app,'0808');g.activeAnswerPad.submit();assert.equal(g.S.done,true);
});
test('reload preserves a mid-puzzle save and repairs old bypassed completion',()=>{
  const app=setup(),g=app.g;Object.assign(g.S,{ch:5,pieces:[1,2,3,4],phase:'search'});g.save();
  const restored=setup({storage:app.storage});assert.equal(restored.g.S.ch,5);assert.equal(restored.g.S.phase,'search');
  const legacy=new Map([['nameless-classroom-v1',JSON.stringify({...g.fresh(),started:true,done:true})]]);
  assert.equal(setup({storage:legacy}).g.S.done,false);
});
test('closing the modal restores focus and stops answer input',()=>{
  const app=setup(),g=app.g;app.document.getElementById('t-journal').focus();g.showComputer();
  assert.ok(app.document.getElementById('scene').hasAttribute('inert'));g.closeModal();
  assert.equal(app.document.getElementById('scene').hasAttribute('inert'),false);assert.equal(app.document.activeElement.id,'t-journal');
  app.key('a');assert.equal(g.activeAnswerPad,null);
});
test('the central aisle is clear while the relocated desk and chair block movement',()=>{
  const {g}=setup(),pos={x:0,z:3.1};for(let i=0;i<90;i++)g.slideMove(g.BLOCKS,pos,0,-.055);
  assert.ok(pos.z< -1.5);assert.equal(pos.x,0);assert.equal(g.canStand(g.BLOCKS,1,1.35),false);
  assert.equal(g.canStand(g.BLOCKS,1,1.77),false);assert.equal(g.canStand(g.BLOCKS,0,-.5),true);
});
test('real scene graph builds with relocated diary, book and reward anchors',()=>{
  const {g}=setup({scene:true});g.buildRoom();g.polishScene();g.setDark(false);
  assert.equal(g.diaryObj.position.x,.9);assert.equal(g.mathBookG.position.x,1.22);assert.equal(g.rewardObjs[7].position.x,1.22);
  assert.ok(g.sunLight.intensity>1);assert.equal(g.BLOCKS.filter(b=>b.hx===.42).length,5);
});
test('entrypoint references existing local files and every script parses',()=>{
  const {document}=parseHTML(read('index.html'));
  for(const node of document.querySelectorAll('script[src],link[rel=stylesheet]')){
    const path=node.getAttribute('src')||node.getAttribute('href');assert.ok(existsSync(new URL('../'+path,import.meta.url)),path);
    if(path.endsWith('.js'))new vm.Script(read(path),{filename:path});
  }
});
test('final assembly requires the full name and completion survives reload',()=>{
  const app=setup({scene:true}),g=app.g;Object.assign(g.S,{ch:9,pieces:[1,2,3,4,5,6,7,8],stack:[1,2,3,4,5,6,7,8]});
  g.showAssembly();assert.equal(g.activeAnswerPad,null);g.S.stack=g.stackOrder();g.showAssembly();
  enter(app,'hawking');g.activeAnswerPad.submit();assert.equal(g.S.exitReady,false);g.activeAnswerPad.clear();
  enter(app,'stephenwilliamhawking');g.activeAnswerPad.submit();assert.equal(g.canExit(g.S),true);
  app.flush();g.closeEndingScene();g.showExitDoor();enter(app,'0808');g.activeAnswerPad.submit();
  const restored=setup({storage:app.storage});assert.equal(restored.g.S.done,true);assert.equal(restored.g.canExit(restored.g.S),true);
});
test('arrow keys look in the named direction and modals block movement',()=>{
  const app=setup({scene:true}),g=app.g;g.camera=new g.THREE.PerspectiveCamera();g.camera.position.set(0,1.6,2.5);
  g.keys={lookUp:true};g.moveStep(.1);assert.ok(g.pitch>0);g.keys={lookDown:true};g.moveStep(.2);assert.ok(g.pitch<0);
  const before=g.pitch;g.showDiary(1);g.keys={w:true,lookUp:true};g.moveStep(.1);assert.equal(g.pitch,before);assert.equal(g.camera.position.z,2.5);
});
