/* CH02: physical objects, collected clues and a mechanical test bench. */
(function (root, factory) {
  var api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api;
  if (root) root.N2Conditions = api;
})(typeof globalThis !== 'undefined' ? globalThis : this, function () {
  'use strict';
  function fresh() {
    return { cards: [], routes: {}, selected: null, flipped: {}, plate: false, note: false,
      wheels: [0,0,0,0], cabinet: false, rule: false, crank: false, installed: false,
      wait: 10, repeats: 3, run: null, receipt: false, key: false, view: 'desk' };
  }
  function teamBy(ch, id) { return ch.teams.find(function (t) { return t.id === id; }); }
  function ruleFor(ch, team) { return ch.rules.find(function (r) { return r.equipment === team.equipment && r.effective <= team.date; }); }
  function judge(ch, w) {
    if (w.cards.length !== ch.teams.length) return {ok:false,kind:'papers',message:'책상에 아직 펼치지 않은 봉투가 있습니다.'};
    if (!w.rule) return {ok:false,kind:'rule',message:'현재 장비의 기준판이 없습니다. 잠긴 규정함부터 확인해 주십시오.'};
    for (var i=0;i<ch.teams.length;i++) {
      var t=ch.teams[i], route=w.routes[t.id];
      if (!route) return {ok:false,kind:'loose',message:'받침대 밖에 남은 카드가 있습니다. 새 시험과 보관할 원본을 나눠 주십시오.'};
      if (route !== (t.equipment === 'K-1' ? 'archive' : 'bench')) return {ok:false,kind:'mixed',message:'시험 흐름에 서로 다른 장비의 기록이 섞여 있습니다. 카드 뒷면의 장비 번호와 시험일을 보십시오.'};
    }
    return {ok:true};
  }
  function validRun(ch,w) {
    var rule=ch.rules.find(function(r){return r.id==='B';}), r=w.run;
    return !!r && w.installed && judge(ch,w).ok && r.wait>=rule.wait && r.repeats>=rule.repeats &&
      r.entries.length===r.repeats && r.entries.every(function(n,i){return n===r.wait+i;});
  }
  function complete(ch,w) { return w.receipt && validRun(ch,w); }
  function act(ch,s,a) {
    var w=s.conditions, t=a.id && teamBy(ch,a.id), editable=['submitted','inspecting'].indexOf(s.phase)>=0;
    function no(m){return {ok:false,message:m};} function yes(m){return {ok:true,message:m};}
    switch(a.type) {
      case 'bundle':
        if(editable && !w.cards.length){w.cards=ch.teams.map(function(t){return t.id;});w.note=true;w.selected='a';}
        return yes('네 팀의 봉투를 펼쳤다.');
      case 'note': w.note=true; return yes('책상 메모를 수첩에 옮겼다.');
      case 'plate': w.plate=true; return yes('명판 뒤에서 교체 날짜를 발견했다.');
      case 'flip': if(!t)return no('없는 카드입니다.'); w.flipped[t.id]=!w.flipped[t.id]; return yes('카드를 뒤집었다.');
      case 'take': if(!t)return no('없는 카드입니다.'); if(w.cards.indexOf(t.id)<0)w.cards.push(t.id); return yes(t.name+' 작업카드를 챙겼다.');
      case 'wheel': if(!Number.isInteger(a.index)||a.index<0||a.index>3||![1,-1].includes(a.delta)||w.cabinet)return no('움직이지 않는다.'); w.wheels[a.index]=(w.wheels[a.index]+a.delta+10)%10;return yes('숫자 휠이 한 칸 움직였다.');
      case 'unlock': if(w.wheels.join('')!==ch.escape.cabinetCode)return no('걸쇠가 움직이지 않는다.');w.cabinet=true;return yes('딸깍. 규정함의 걸쇠가 풀렸다.');
      case 'rule': if(!w.cabinet)return no('규정함이 잠겨 있다.');w.rule=true;return yes('K-2 기준판을 챙겼다. 시험대에 꽂을 수 있다.');
      case 'crank': if(!w.cabinet)return no('규정함이 잠겨 있다.');w.crank=true;return yes('황동 손잡이를 챙겼다.');
      case 'select': if(!editable||w.cards.indexOf(a.id)<0)return no('지금은 옮길 수 없다.');w.selected=a.id;return yes(t.name+' 카드 선택. 아래 받침대에 꽂는다.');
      case 'dock': if(!editable||!w.selected||!['bench','archive','loose'].includes(a.target))return no('먼저 옮길 카드를 고른다.');w.routes[w.selected]=a.target==='loose'?null:a.target;w.selected=ch.teams.find(function(t){return !w.routes[t.id];})?.id || null;return yes('카드를 꽂았다.');
      case 'install': if(s.phase!=='revised')return no('Enrico와 기존 기록을 반려한 뒤 시험대를 가동한다.');if(!w.crank||!w.rule)return no('기준판과 손잡이가 필요하다.');w.installed=true;return yes('기준판을 꽂고 손잡이를 축에 걸었다.');
      case 'wait': case 'repeats':
        if(s.phase!=='revised'||!w.installed)return no('시험대를 아직 조작할 수 없다.');
        var values=a.type==='wait'?[10,20,30]:[3,5]; w[a.type]=values[(values.indexOf(w[a.type])+1)%values.length];
        w.run=null;w.receipt=false;return yes('조절기를 돌렸다. 이전 출력지는 폐기했다.');
      case 'run':
        if(s.phase!=='revised'||!w.installed||!judge(ch,w).ok)return no('기준판과 손잡이를 장착하고 카드의 흐름을 확인한다.');
        w.run={wait:w.wait,repeats:w.repeats,entries:Array.from({length:w.repeats},function(_,i){return w.wait+i;})};w.receipt=false;
        return yes('손잡이를 돌렸다. 시험 경과를 압축해 출력한다.');
      case 'receipt': if(!validRun(ch,w))return no('출력지의 첫 기록 시각이나 기록 수가 기준에 못 미친다. 조절기를 다시 맞춘다.');w.receipt=true;return yes('세 팀의 새 기록을 떼어냈다. 이제 승인 도장을 찍을 수 있다.');
      case 'key': if(s.phase!=='approved')return no('출입 열쇠의 봉인이 아직 풀리지 않았다.');w.key=true;return yes('출입 열쇠를 챙겼다. 문에서 사용할 수 있다.');
      default:return no('반응이 없다.');
    }
  }
  function audit(ch) {
    if(!ch.escape||!/^\d{4}$/.test(ch.escape.cabinetCode))return ['규정함의 잠금 설정이 없습니다.'];
    if(!ch.teams||ch.teams.length!==4||new Set(ch.teams.map(function(t){return t.id;})).size!==4)return ['네 팀의 카드가 필요합니다.'];
    if(ch.teams.some(function(t){return !ruleFor(ch,t);}))return ['적용 기준이 없는 카드입니다.'];
    return [];
  }
  function create(o) {
    var host=o.host,ch=o.chapter,s,w,root,body,status,current='desk',message='';
    function n(tag,cls,text){var e=document.createElement(tag);if(cls)e.className=cls;if(text!=null)e.textContent=o.safeText?o.safeText(text):text;return e;}
    function button(label,key,fn,cls){var b=n('button',cls||'escape-btn',label);b.type='button';b.dataset.focus=key;b.onclick=fn;return b;}
    function action(label,key,a,cls){return button(label,key,function(){var r=act(ch,s,a);message=r.message;if(r.ok)o.onChange();draw(key);},cls);}
    function paragraph(text,cls){body.append(n('p',cls||'escape-copy',text));}
    function found(){return '작업카드 '+w.cards.length+'/4'+(w.rule?' · 기준판':'')+(w.crank?' · 손잡이':'')+(w.key?' · 출입 열쇠':'');}
    function card(t,reverse){
      var c=n('div','escape-paper'+(reverse?' reverse':''));
      c.append(n('small','',reverse?'원기록 / 뒷면':'공동 검토실 / 접수 11월 12일'),n('strong','',t.name+' · '+t.role));
      if(reverse)c.append(n('p','',t.note)); else {
        c.append(n('p','escape-record',t.equipment+' · S-12 '+t.rule+' · 대기 '+t.wait+'분 · '+t.repeats+'회'),n('p','escape-quote',t.brief || t.quote));
      }
      return c;
    }
    function draw(focus) {
      if(!root){root=n('section','escape-object');host.append(root);}root.replaceChildren();
      var titles={desk:'네 팀의 봉투',plate:'장비 명판',cabinet:'규정함',bench:'시험대',notebook:'모아 둔 기록'};
      var t=current.indexOf('team:')===0?teamBy(ch,current.slice(5)):null;
      var head=n('header','escape-head');var h=n('h2','',t?t.name+' / 작업카드':titles[current]);h.id='reader-title';
      head.append(h,button('닫기 ×','close',o.onClose,'escape-close'));root.append(head);
      body=n('div','escape-body');root.append(body);
      if(t) {
        body.classList.add('escape-team');body.append(card(t,w.flipped[t.id]));var tools=n('div','escape-tools');
        tools.append(action('뒤집기 ↶','flip',{type:'flip',id:t.id}),action(w.cards.includes(t.id)?'챙긴 카드':'카드 받기','take',{type:'take',id:t.id}));body.append(tools);
      } else if(current==='plate') {
        var plate=n('div','escape-plate');plate.append(n('small','','COMMON TEST BENCH'),n('strong','','K–2'),n('p','',w.plate?'인계 완료 · 11월 10일\n이전 장비 K-1 철거':'명판 가장자리에 작은 경첩이 있다.'));
        body.append(plate,action(w.plate?'명판 뒷면 확인됨':'명판을 젖힌다','plate',{type:'plate'}));
      } else if(current==='cabinet') drawCabinet();
      else if(current==='bench') drawBench();
      else if(current==='notebook') drawNotes();
      else drawDesk();
      var foot=n('footer','escape-foot');status=n('p','escape-status',message||found());status.setAttribute('role','status');status.tabIndex=-1;foot.append(status);
      if(current!=='notebook')foot.append(button('수첩','notes',function(){current='notebook';message='';draw('back');}));
      else foot.append(button('물건으로 돌아가기','back',function(){current=w.view||'desk';message='';draw('notes');}));
      root.append(foot);
      if(focus){var target=Array.from(root.querySelectorAll('[data-focus]')).find(function(e){return e.dataset.focus===focus;});(target||status).focus({preventScroll:true});}
    }
    function drawCabinet(){
      if(w.cabinet){
        var tray=n('div','escape-loot');
        var rule=action(w.rule?'기준판 챙김':'기준판 꺼내기','rule',{type:'rule'},'escape-loot-item');rule.disabled=w.rule;
        var crank=action(w.crank?'손잡이 챙김':'손잡이 꺼내기','crank',{type:'crank'},'escape-loot-item');crank.disabled=w.crank;
        tray.append(rule,crank);body.append(tray);if(w.rule)paragraph(ch.rules[1].text);return;
      }
      paragraph('MM · DD','escape-lock-label');
      var wheels=n('div','escape-lock');w.wheels.forEach(function(v,i){var col=n('div','escape-wheel');col.append(action('＋','wheel-'+i,{type:'wheel',index:i,delta:1}),n('output','',String(v)),action('−','wheel-down-'+i,{type:'wheel',index:i,delta:-1}));col.querySelector('output').setAttribute('aria-label',(i+1)+'번째 숫자');col.querySelector('button').setAttribute('aria-label',(i+1)+'번째 숫자 올리기');col.querySelectorAll('button')[1].setAttribute('aria-label',(i+1)+'번째 숫자 내리기');wheels.append(col);});
      body.append(wheels,action('걸쇠 당기기','unlock',{type:'unlock'},'escape-btn primary'));
    }
    function drawDesk(){
      var tabs=n('div','escape-cards');ch.teams.forEach(function(t){
        var b=action(t.name,'card-'+t.id,{type:'select',id:t.id},'escape-card');
        b.disabled=!['submitted','inspecting'].includes(s.phase);b.setAttribute('aria-pressed',String(w.selected===t.id));
        b.append(n('small','',w.routes[t.id]==='archive'?'보관':w.routes[t.id]==='bench'?'재시험':t.role));tabs.append(b);
      });body.append(tabs);
      if(w.selected){
        var t=teamBy(ch,w.selected),flip=action('','flip-selected',{type:'flip',id:t.id},'escape-turn-card');
        flip.setAttribute('aria-label',t.name+' 작업카드 뒤집기');flip.append(card(t,w.flipped[t.id]),n('span','escape-fold','↶ 뒤집기'));body.append(flip);
        var docks=n('div','escape-docks');[['bench','재시험에 꽂기'],['archive','원본 보관에 꽂기']].forEach(function(pair){docks.append(action(pair[1],'dock-'+pair[0],{type:'dock',target:pair[0]},'escape-dock'));});body.append(docks);
      }
      if(w.note)body.append(n('p','escape-scribble',ch.escape.note));
      var tools=n('div','escape-toolbar');
      if(['submitted','inspecting'].includes(s.phase)){
        var request=button('Enrico에게 건넨다','submit',o.onSubmit,'escape-btn primary');
        request.disabled=ch.teams.some(function(t){return !w.routes[t.id];});tools.append(request);
      }
      if(s.phase==='contradiction'||s.phase==='verified')tools.append(button(s.phase==='contradiction'?'반려 도장':'승인 도장','stamp',o.onStamp,'escape-btn primary'));
      body.append(tools);
    }
    function drawBench(){
      if(s.phase==='approved'){paragraph('승인된 출력지 아래의 작은 서랍이 열렸다. 안에 출입 열쇠가 있다.');body.append(action(w.key?'열쇠를 챙겼다':'출입 열쇠 꺼내기','key',{type:'key'},'escape-btn primary'));return;}
      if(!w.installed){
        var empty=n('div','escape-machine empty');empty.append(n('strong','','K–2'),n('p','','비어 있는 슬롯과 손잡이 축'));
        body.append(empty,button('K-2 · 느슨한 명판 ↶','inspect-plate',function(){current='plate';w.view='plate';draw();}));
        if(w.crank&&w.rule){var install=action('빈 자리에 부품 끼우기','install',{type:'install'},'escape-btn primary');install.disabled=s.phase!=='revised';body.append(install);}
        return;
      }
      var machine=n('div','escape-machine');var legend=n('div','escape-legend');legend.append(n('b','','S-12 / B'),n('span','','K-2 · 안정화 20분 이상 · 기록 5회 이상'));machine.append(legend);
      var dials=n('div','escape-dials');[['wait','안정화',w.wait+' min'],['repeats','기록 수',w.repeats+' 회']].forEach(function(v){var dial=action('↻ '+v[2],'dial-'+v[0],{type:v[0]},'escape-dial');dial.setAttribute('aria-label',v[1]+' 조절: '+v[2]);var col=n('div');col.append(n('small','',v[1]),dial);dials.append(col);});
      var crank=action('⤾ 손잡이 돌리기','run',{type:'run'},'escape-crank');crank.disabled=s.phase!=='revised';dials.append(crank);machine.append(dials);body.append(machine);
      if(w.run){var receipt=n('div','escape-output');receipt.append(n('b','','A · B · D / 재시험 출력'),n('span','','시작 09:00 → '+w.run.entries.map(function(v){return '09:'+String(v).padStart(2,'0');}).join(' · ')));
        var take=action(w.receipt?'출력지 확인됨':'출력지 떼어내기','receipt',{type:'receipt'},'escape-btn');take.disabled=w.receipt;receipt.append(take);body.append(receipt);}

    }
    function drawNotes(){
      var list=n('div','escape-notes');
      if(w.note)list.append(n('p','',ch.escape.note));if(w.plate)list.append(n('p','','명판 뒷면 · K-1 → K-2 / 11월 10일'));
      if(w.rule)list.append(n('p','',ch.rules[1].text));if(!list.children.length)list.append(n('p','','아직 옮겨 적은 단서가 없다.'));
      ch.teams.filter(function(t){return w.cards.includes(t.id);}).forEach(function(t){var row=n('div');row.append(card(t,w.flipped[t.id]),action('뒤집기 ↶','note-flip-'+t.id,{type:'flip',id:t.id}));list.append(row);});body.append(list);
    }
    return {
      render:function(state,view){s=state;w=s.conditions||(s.conditions=fresh());if(view){current=view;w.view=view;}message='';draw();},
      focus:function(){root.querySelector('.escape-close').focus();},
      destroy:function(){if(root)root.remove();}
    };
  }
  return {fresh:fresh,ruleFor:ruleFor,judge:judge,act:act,validRun:validRun,complete:complete,audit:audit,create:create};
});
