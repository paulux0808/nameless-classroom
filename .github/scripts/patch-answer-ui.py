from pathlib import Path

p=Path('index.html')
s=p.read_text(encoding='utf-8')

def one(old,new,label):
    global s
    n=s.count(old)
    if n!=1:
        raise SystemExit(f'{label} count={n}')
    s=s.replace(old,new,1)

# 1) All portrait frames: preserve puzzle thickness, unify visible frame tone.
one(
'''    drawFrameBars(id);
  }

  /* 벽시계 */''',
'''    drawFrameBars(id);
  }
  /* 액자 두께 규칙은 유지하고, 색은 아인슈타인 액자의 진한 갈색 톤으로 통일 */
  Object.keys(frameObjs).forEach(function(fid){
    var bars=frameObjs[fid]&&frameObjs[fid].userData.bars;
    if(!bars)return;
    bars.traverse(function(o){
      if(!o.isMesh||!o.material||!o.material.color)return;
      o.material.color.setHex(0x986b43);
      if('roughness' in o.material)o.material.roughness=0.58;
    });
  });

  /* 벽시계 */''',
'frame tone')

# 2) UI keypad styling: no native text input required.
one(
'''.term input:focus{border-color:#e8b962;box-shadow:0 0 0 3px rgba(232,168,62,.14)}
.term .done{font-family:var(--font-ui);color:#e6d2a6;font-size:14px;line-height:1.8}''',
'''.term input:focus{border-color:#e8b962;box-shadow:0 0 0 3px rgba(232,168,62,.14)}
.answer-ui{margin-top:12px;display:grid;gap:9px}
.answer-display{min-height:48px;padding:12px 14px;border-radius:3px;border:1px solid rgba(226,178,98,.32);
  background:#0a0602;color:#f2cf88;font-family:ui-monospace,monospace;font-size:16px;letter-spacing:.16em;
  display:flex;align-items:center;overflow-wrap:anywhere;word-break:break-all;text-shadow:0 0 8px rgba(232,168,62,.4)}
.answer-display.empty{color:#785d2f;letter-spacing:.04em;font-size:12px}
.answer-keys{display:grid;grid-template-columns:repeat(6,minmax(0,1fr));gap:6px}
.answer-keys.number{grid-template-columns:repeat(5,minmax(0,1fr))}
.answer-key,.answer-tool{min-height:38px;border:1px solid rgba(226,178,98,.28);border-radius:3px;
  background:rgba(226,178,98,.08);color:#e8c77f;font-family:ui-monospace,monospace;font-weight:800;font-size:13px}
.answer-key:active,.answer-tool:active{background:rgba(226,178,98,.22);transform:translateY(1px)}
.answer-tools{display:grid;grid-template-columns:1fr 1fr;gap:6px}
body.touch .answer-key,body.touch .answer-tool{min-height:42px}
.term .done{font-family:var(--font-ui);color:#e6d2a6;font-size:14px;line-height:1.8}''',
'keypad css')

# 3) Reusable button-only answer pad.
one(
'''/* 컴퓨터 터미널 */
function showComputer(){''',
'''/* 버튼형 정답 키보드 — 실제 input/contenteditable을 쓰지 않아 모바일 시스템 키보드가 뜨지 않는다 */
function makeAnswerPad(mode){
  var state='',root=el('div','answer-ui'),display=el('div','answer-display empty');
  display.setAttribute('aria-live','polite');
  var keys=el('div','answer-keys '+(mode==='number'?'number':'alpha'));
  var chars=(mode==='number'?'1234567890':'ABCDEFGHIJKLMNOPQRSTUVWXYZ').split('');
  function paint(){
    display.textContent=state||'버튼으로 정답을 입력하세요';
    display.classList.toggle('empty',!state);
  }
  chars.forEach(function(ch){
    var b=el('button','answer-key',ch);b.type='button';
    b.onclick=function(){if(state.length<40){state+=ch;paint();}};
    keys.appendChild(b);
  });
  var tools=el('div','answer-tools');
  var back=el('button','answer-tool','⌫ 한 글자');back.type='button';
  back.onclick=function(){state=state.slice(0,-1);paint();};
  var clear=el('button','answer-tool','전체 지우기');clear.type='button';
  clear.onclick=function(){state='';paint();};
  tools.appendChild(back);tools.appendChild(clear);
  root.appendChild(display);root.appendChild(keys);root.appendChild(tools);paint();
  return {el:root,value:function(){return state;},clear:function(){state='';paint();}};
}

/* 컴퓨터 터미널 */
function showComputer(){''',
'answer pad helper')

# 4) Chapter 1-8 terminal: replace native input with keypad.
one(
'''    var inp=el("input");inp.type="text";inp.placeholder="정답 입력";setupAnswerInput(inp);
    t.appendChild(inp);
    b.appendChild(t);
    var row=el("div","row");row.style.marginTop="12px";
    var sub=el("button","btn btn-p","확인");
    row.appendChild(sub);b.appendChild(row);
    function go(){
      var v=answerCode(inp.value);
      if(!v){toast("숫자 또는 영어만, 띄어쓰기 없이 입력하세요.","bad");inp.focus();inp.select();return;}
      if(c.h.some(function(a){return a===sealCode(v,c.n);})){
        S.phase="search";S.revealed=0;save();
        closeModal();renderHUD();
        toast("암호 해제 — 단서: “"+c.cue+"”","good");
        setTimeout(showComputer,420);
      }else{toast("암호가 맞지 않습니다.","bad");inp.select();}
    }
    sub.onclick=go;
    inp.addEventListener("keydown",function(e){if(e.key==="Enter")go();});
    setTimeout(function(){inp.focus();},80);''',
'''    var pad=makeAnswerPad((c.n===1||c.n===8)?"number":"alpha");
    t.appendChild(pad.el);
    b.appendChild(t);
    var row=el("div","row");row.style.marginTop="12px";
    var sub=el("button","btn btn-p","확인");
    row.appendChild(sub);b.appendChild(row);
    function go(){
      var v=answerCode(pad.value());
      if(!v){toast("버튼으로 정답을 입력하세요.","bad");return;}
      if(c.h.some(function(a){return a===sealCode(v,c.n);})){
        S.phase="search";S.revealed=0;save();
        closeModal();renderHUD();
        toast("암호 해제 — 단서: “"+c.cue+"”","good");
        setTimeout(showComputer,420);
      }else{toast("암호가 맞지 않습니다.","bad");pad.clear();}
    }
    sub.onclick=go;''',
'chapter answer UI')

# 5) Final name: button-only alphabet keypad too.
one(
'''        var inp=el("input");inp.type="text";inp.placeholder="이름 입력";setupAnswerInput(inp);
        t.appendChild(inp);term.appendChild(t);
        var sub=el("button","btn btn-p","제출");sub.style.marginTop="12px";term.appendChild(sub);
        function go(){
          var v=answerCode(inp.value);
          if(!v){toast("영어만, 띄어쓰기 없이 입력하세요.","bad");inp.focus();inp.select();return;}
          if(v!==norm(finalName())){toast("다시 읽어 보세요.","bad");return;}
          S.done=true;save();closeModal();renderHUD();setTimeout(beginExitSequence,180);
        }
        sub.onclick=go;
        inp.addEventListener("keydown",function(e){if(e.key==="Enter")go();});
        if(!wasLocked){wasLocked=true;setTimeout(function(){inp.focus();},420);}''',
'''        var pad=makeAnswerPad("alpha");
        t.appendChild(pad.el);term.appendChild(t);
        var sub=el("button","btn btn-p","제출");sub.style.marginTop="12px";term.appendChild(sub);
        function go(){
          var v=answerCode(pad.value());
          if(!v){toast("버튼으로 이름을 입력하세요.","bad");return;}
          if(v!==norm(finalName())){toast("다시 읽어 보세요.","bad");pad.clear();return;}
          S.done=true;save();closeModal();renderHUD();setTimeout(beginExitSequence,180);
        }
        sub.onclick=go;
        if(!wasLocked)wasLocked=true;''',
'final answer UI')

p.write_text(s,encoding='utf-8')

# Static checks
out=p.read_text(encoding='utf-8')
for q in [
    'function makeAnswerPad(mode)',
    'makeAnswerPad((c.n===1||c.n===8)?"number":"alpha")',
    'makeAnswerPad("alpha")',
    'o.material.color.setHex(0x986b43)',
    'answer-keys.number'
]:
    if q not in out: raise SystemExit('missing '+q)

comp=out[out.index('function showComputer(){'):out.index('/* 최종 조립 */')]
if 'el("input")' in comp or 'setupAnswerInput' in comp or '.focus()' in comp:
    raise SystemExit('native chapter input still present')
asm=out[out.index('function showAssembly(){'):out.index('function showEnding(){')]
if 'el("input")' in asm or 'setupAnswerInput' in asm or '.focus()' in asm:
    raise SystemExit('native final input still present')
print('answer UI patch validation ok')
