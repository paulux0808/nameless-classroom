from pathlib import Path

p=Path('index.html')
s=p.read_text(encoding='utf-8')


def replace_once(old,new,label):
    global s
    n=s.count(old)
    if n!=1:
        raise SystemExit(f'{label}: expected 1, got {n}')
    s=s.replace(old,new,1)


def replace_js_function(src,name,replacement):
    needle=f'function {name}('
    start=src.find(needle)
    if start<0:
        raise SystemExit(f'function not found: {name}')
    brace=src.find('{',start)
    if brace<0:
        raise SystemExit(f'opening brace not found: {name}')
    i=brace+1; depth=1; quote=None; esc=False; line=False; block=False
    while i<len(src):
        c=src[i]; n=src[i+1] if i+1<len(src) else ''
        if line:
            if c=='\n': line=False
            i+=1; continue
        if block:
            if c=='*' and n=='/': block=False; i+=2; continue
            i+=1; continue
        if quote:
            if esc: esc=False
            elif c=='\\': esc=True
            elif c==quote: quote=None
            i+=1; continue
        if c in ('\"',"'",'`'):
            quote=c; i+=1; continue
        if c=='/' and n=='/': line=True; i+=2; continue
        if c=='/' and n=='*': block=True; i+=2; continue
        if c=='{': depth+=1
        elif c=='}':
            depth-=1
            if depth==0:
                return src[:start]+replacement+src[i+1:]
        i+=1
    raise SystemExit(f'unclosed function: {name}')

# 1) final-name solve unlocks the exit, but the rear-door code performs the actual stage clear.
replace_once('stack:null,revealed:0,tookD1:false,done:false',
             'stack:null,revealed:0,tookD1:false,exitReady:false,done:false',
             'fresh state')
replace_once('var S=Object.assign(fresh(),store.get()||{});\nS.rot=S.rot||{};',
             'var S=Object.assign(fresh(),store.get()||{});\nif(typeof S.exitReady!=="boolean")S.exitReady=!!S.done;\nS.rot=S.rot||{};',
             'state compatibility')
replace_once('S.done=true;save();closeModal();renderHUD();setTimeout(beginExitSequence,180);',
             'S.exitReady=true;save();closeModal();renderHUD();setTimeout(showEnding,180);',
             'final solve transition')

# 2) make the actual rear door interactive.
replace_once('doorPivot.add(box(0.95,2.1,0.08,0x6b4c30,-0.475,1.05,0));',
             'var exitDoor=box(0.95,2.1,0.08,0x6b4c30,-0.475,1.05,0);doorPivot.add(hot(exitDoor,"exitdoor","뒷문"));',
             'door hotspot')
replace_once('function interact(id){\n  if(S.done){ if(id==="computer")showEnding(); return; }',
             'function interact(id){\n  if(id==="exitdoor"){showExitDoor();return;}\n  if(S.done){ if(id==="computer")showEnding(); return; }',
             'door interaction route')

# 3) final HUD state before the door code.
old_hud='''  if(S.done){
    $("#hud-ch").textContent="COMPLETE";$("#hud-title").textContent="이름을 되찾다";
    $("#objective").innerHTML='<b>'+finalName()+'</b>';
    return;
  }
  if(S.ch>8){'''
new_hud='''  if(S.done){
    $("#hud-ch").textContent="COMPLETE";$("#hud-title").textContent="스테이지 완료";
    $("#objective").innerHTML='<b>'+finalName()+'</b> · 스티븐 호킹 스테이지 완료';
    return;
  }
  if(S.exitReady){
    $("#hud-ch").textContent="FINAL EXIT";$("#hud-title").textContent="마지막 문";
    $("#objective").innerHTML='<b>뒷문을 조사하세요.</b><span class="hint">코드를 입력하시면 나갈 수 있습니다.</span>';
    return;
  }
  if(S.ch>8){'''
replace_once(old_hud,new_hud,'exit HUD')

# 4) dedicated cinematic ending scene.
css_anchor='.fin .sb{color:var(--dim);font-size:13px;line-height:1.8}\n#rotate b{color:var(--brass)}'
ending_css=r'''.fin .sb{color:var(--dim);font-size:13px;line-height:1.8}

/* 스티븐 호킹 스테이지 엔딩 — 왼쪽 크레딧 / 오른쪽 영화 */
#ending-scene{position:fixed;inset:0;z-index:170;display:grid;grid-template-columns:minmax(300px,38vw) minmax(0,1fr);background:#050403;color:#eee6d6;overflow:hidden}
#ending-scene::after{content:"";position:absolute;inset:0;pointer-events:none;box-shadow:inset 0 0 110px rgba(0,0,0,.64)}
.ending-credits{position:relative;z-index:2;min-width:0;height:100%;overflow:auto;padding:clamp(34px,6vh,72px) clamp(24px,4vw,58px) 48px;background:linear-gradient(90deg,rgba(8,6,3,.99),rgba(16,12,7,.97) 72%,rgba(16,12,7,.82));border-right:1px solid rgba(214,186,136,.18);scrollbar-width:thin}
.ending-credit-inner{max-width:560px;margin:0 auto;text-align:center;animation:endingCreditsIn 1.2s ease both}
@keyframes endingCreditsIn{from{opacity:0;transform:translateY(28px)}to{opacity:1;transform:none}}
.ending-kicker{font-size:10px;letter-spacing:.28em;color:#a9916c;margin-bottom:13px}.ending-name{font-family:var(--font-hand);font-size:clamp(31px,4vw,55px);font-weight:700;letter-spacing:.08em;margin:0 0 7px}.ending-years{font-size:12px;letter-spacing:.2em;color:#8f806a;margin-bottom:clamp(34px,7vh,72px)}
.ending-credit-section{margin:0 auto clamp(34px,6vh,64px);max-width:470px}.ending-credit-label{font-size:9.5px;letter-spacing:.3em;color:#b89d70;margin-bottom:13px}.ending-credit-section p{margin:0;font-family:var(--font-hand);font-size:clamp(13px,1.25vw,17px);line-height:1.95;color:#d8cfbd;text-wrap:pretty}.ending-congrats{font-size:clamp(18px,1.8vw,25px)!important;color:#f2e5c8!important;line-height:1.75!important}
.ending-exit-card{margin:10px auto 26px;padding:22px 18px;border-top:1px solid rgba(210,164,76,.55);border-bottom:1px solid rgba(210,164,76,.55);background:rgba(210,164,76,.06)}.ending-exit-card strong{display:block;font-size:10px;letter-spacing:.3em;color:#d2a44c;margin-bottom:14px}.ending-exit-card p{font-size:clamp(14px,1.4vw,19px);line-height:1.85}.ending-code{display:inline-block;margin-top:12px;font-family:ui-monospace,SFMono-Regular,Consolas,monospace;font-size:clamp(26px,3vw,40px);font-weight:800;letter-spacing:.28em;color:#f4dfac}
.ending-foot{font-size:10px;line-height:1.8;letter-spacing:.08em;color:#827562}.ending-film{position:relative;display:grid;place-items:center;min-width:0;background:radial-gradient(circle at 50% 45%,#18130d,#030302 74%);padding:clamp(14px,2.2vw,34px)}.ending-film video{display:block;width:100%;height:100%;max-height:calc(100vh - 40px);object-fit:contain;background:#000;box-shadow:0 24px 70px rgba(0,0,0,.65)}
.ending-close{position:absolute;z-index:4;right:18px;top:18px;min-height:38px;padding:0 13px;border:1px solid rgba(235,219,185,.36);border-radius:2px;background:rgba(10,8,5,.72);color:#e8dcc4;font:700 11px var(--font-ui);letter-spacing:.08em;backdrop-filter:blur(7px)}.ending-close:hover{background:rgba(38,29,17,.9)}
.stage-clear-copy{text-align:center;padding:8px 4px 16px}.stage-clear-copy .stamp{display:inline-block;margin-bottom:14px;padding:6px 10px;border:1px solid #a4713a;color:#7f4d21;font-size:10px;font-weight:900;letter-spacing:.2em;transform:rotate(-1deg)}.stage-clear-copy h3{margin:0 0 8px;color:var(--ink-1);font-family:var(--font-hand);font-size:24px}.stage-clear-copy p{margin:0;color:#594b38;line-height:1.75}
@media(max-width:860px){#ending-scene{grid-template-columns:minmax(250px,42vw) minmax(0,1fr)}.ending-credits{padding:28px 20px 36px}.ending-years{margin-bottom:32px}.ending-credit-section{margin-bottom:32px}.ending-film{padding:10px}.ending-close{right:10px;top:10px}}

#rotate b{color:var(--brass)}'''
replace_once(css_anchor,ending_css,'ending CSS')

new_ending=r'''function closeEndingScene(){
  var x=$("#ending-scene");
  if(x){var v=x.querySelector("video");if(v){try{v.pause();}catch(e){}}x.remove();}
  document.body.classList.remove("ending");
}
function showEnding(){
  closeEndingScene();clearTerminalCompanion();document.body.classList.add("ending");
  var x=el("section");x.id="ending-scene";
  x.innerHTML='<div class="ending-credits"><div class="ending-credit-inner">'+
    '<div class="ending-kicker">STEPHEN HAWKING · FINAL MEMORY</div>'+
    '<h2 class="ending-name">스티븐 호킹</h2><div class="ending-years">1942 — 2018</div>'+
    '<section class="ending-credit-section"><div class="ending-credit-label">ABOUT HIM</div>'+
    '<p>이론물리학자이자 우주론자. 블랙홀과 우주의 기원, 시간과 공간에 관한 질문을 끝까지 붙들었고, 어려운 과학을 더 많은 사람에게 전하려 했습니다.</p></section>'+
    '<section class="ending-credit-section"><div class="ending-credit-label">WHY THIS ROOM EXISTS</div>'+
    '<p>이 방탈출은 정답 하나를 맞히는 것보다, 한 사람의 삶을 따라가며 흩어진 기록과 과학의 단서를 직접 연결해 보도록 만들었습니다. 호기심이 또 다른 질문으로 이어지는 경험이 되길 바랐습니다.</p></section>'+
    '<section class="ending-credit-section"><div class="ending-credit-label">TO THE PLAYER</div>'+
    '<p class="ending-congrats">여기까지 모든 기억의 조각을 찾아낸 것을 축하합니다.<br>스티븐 호킹의 교실을 끝까지 완주했습니다.</p></section>'+
    '<section class="ending-credit-section ending-exit-card"><strong>ONE LAST EXIT</strong>'+
    '<p>교실을 나가기 위한 마지막 절차가 남았습니다.<br><b>다시 한 번 [시작]을 누르고 코드 0808을 입력하세요.</b></p>'+
    '<span class="ending-code">0808</span></section>'+
    '<div class="ending-foot">1942년 1월 8일 — 갈릴레이가 세상을 떠난 지 300년 되는 날에 태어나<br>2018년 3월 14일 — 아인슈타인이 태어난 날에 눈을 감다.</div>'+
    '</div></div>'+
    '<div class="ending-film"><video controls autoplay playsinline src="'+A.videoFinale+'"></video></div>'+
    '<button type="button" class="ending-close" data-ending-close>교실로 돌아가기</button>';
  document.body.appendChild(x);
  x.querySelector("[data-ending-close]").onclick=closeEndingScene;
}
function showStageClear(){
  closeEndingScene();
  openModal("스테이지 완료","STEPHEN HAWKING · CLEAR",function(b){
    var intro=el("div","stage-clear-copy");
    intro.innerHTML='<div class="stamp">STAGE CLEAR</div><h3>스티븐 호킹</h3><p>이 교실의 모든 기록을 확인하고 마지막 문까지 열었습니다.<br>영상을 다시 보거나 다음 스테이지로 이동할 수 있습니다.</p>';
    b.appendChild(intro);
    var r=el("div","row");
    var replay=el("button","btn","영상 다시보기");
    replay.onclick=function(){closeModal();setTimeout(showEnding,80);};
    var next=el("button","btn btn-p","다음 스테이지 · 아인슈타인");
    next.onclick=function(){location.href="einstein.html";};
    r.appendChild(replay);r.appendChild(next);b.appendChild(r);
    b.appendChild(el("p","mini","아인슈타인 스테이지는 현재 준비중입니다."));
  },null,"교실에 남기");
}
function showExitDoor(){
  if(S.done){showStageClear();return;}
  if(!S.exitReady){toast("아직 나갈 수 없다.");return;}
  openModal("뒷문","코드를 입력하시면 나갈 수 있습니다.",function(b){
    b.appendChild(el("p","mini","코드를 입력하시면 나갈 수 있습니다."));
    var pad=makeAnswerPad("number");b.appendChild(pad.el);
    var submit=el("button","btn btn-p","문 열기");submit.style.marginTop="12px";b.appendChild(submit);
    submit.onclick=function(){
      if(pad.value()!=="0808"){toast("코드가 맞지 않습니다.","bad");pad.clear();return;}
      S.done=true;save();if(doorPivot)doorPivot.rotation.y=Math.PI/2;closeModal();renderHUD();
      setTimeout(showStageClear,220);
    };
  });
}'''
s=replace_js_function(s,'showEnding',new_ending)

p.write_text(s,encoding='utf-8')

# 5) Einstein gets its own new HTML now; only a deliberate placeholder for the next build.
einstein='''<!doctype html>
<html lang="ko">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover">
<title>아인슈타인 스테이지 — 준비중</title>
<style>
:root{color-scheme:dark;--paper:#eadfc6;--ink:#1f180f;--brass:#c79b52}
*{box-sizing:border-box}html,body{margin:0;min-height:100%;background:#080604}body{min-height:100vh;display:grid;place-items:center;padding:24px;font-family:"Gothic A1","Malgun Gothic","Apple SD Gothic Neo",system-ui,sans-serif;color:#efe5d1;overflow:hidden}
body:before{content:"";position:fixed;inset:0;pointer-events:none;background:radial-gradient(circle at 50% 35%,rgba(121,91,48,.18),transparent 34%),radial-gradient(circle at 50% 50%,transparent 32%,rgba(0,0,0,.75) 100%)}
.card{position:relative;width:min(760px,92vw);padding:clamp(34px,7vw,76px);text-align:center;border:1px solid rgba(205,174,119,.25);background:linear-gradient(160deg,rgba(37,28,17,.92),rgba(13,10,6,.96));box-shadow:0 32px 90px rgba(0,0,0,.58)}
.kicker{font-size:10px;letter-spacing:.34em;color:#aa9169;margin-bottom:22px}.stage{font-size:clamp(12px,2vw,16px);letter-spacing:.24em;color:var(--brass);margin-bottom:12px}.name{margin:0;font-family:Georgia,"Times New Roman",serif;font-size:clamp(42px,8vw,86px);font-weight:400;letter-spacing:.05em}.rule{width:64px;height:1px;margin:28px auto;background:rgba(199,155,82,.72)}.soon{font-size:clamp(22px,4vw,36px);font-weight:800;letter-spacing:.18em;margin:0 0 15px}.desc{margin:0 auto 34px;max-width:480px;color:#ad9e86;font-size:14px;line-height:1.8}.back{display:inline-flex;align-items:center;justify-content:center;min-height:44px;padding:0 18px;border:1px solid rgba(205,174,119,.32);color:#e9ddc5;text-decoration:none;font-size:12px;letter-spacing:.06em;background:rgba(255,255,255,.025)}.back:hover{background:rgba(199,155,82,.1)}
</style>
</head>
<body>
<main class="card">
  <div class="kicker">NAMELESS CLASSROOM</div>
  <div class="stage">STAGE 02</div>
  <h1 class="name">ALBERT EINSTEIN</h1>
  <div class="rule"></div>
  <p class="soon">준비중</p>
  <p class="desc">완전히 새로운 교실을 준비하고 있습니다.<br>아인슈타인 스테이지는 다음 업데이트에서 시작됩니다.</p>
  <a class="back" href="index.html">스티븐 호킹 스테이지로 돌아가기</a>
</main>
</body>
</html>
'''
Path('einstein.html').write_text(einstein,encoding='utf-8')

# Assertions: all requested flows and no accidental old transition.
out=p.read_text(encoding='utf-8')
checks=[
    'exitReady:false',
    'S.exitReady=true;save();closeModal();renderHUD();setTimeout(showEnding,180);',
    'hot(exitDoor,"exitdoor","뒷문")',
    'if(id==="exitdoor"){showExitDoor();return;}',
    '코드를 입력하시면 나갈 수 있습니다.',
    'pad.value()!=="0808"',
    '다시 한 번 [시작]을 누르고 코드 0808을 입력하세요.',
    'location.href="einstein.html"',
    'grid-template-columns:minmax(300px,38vw) minmax(0,1fr)',
    '스티븐 호킹의 교실을 끝까지 완주했습니다.'
]
for q in checks:
    if q not in out: raise SystemExit('missing '+q)
if 'S.done=true;save();closeModal();renderHUD();setTimeout(beginExitSequence,180);' in out:
    raise SystemExit('old immediate-complete transition still present')
if not Path('einstein.html').exists(): raise SystemExit('einstein.html missing')
print('Hawking ending, coded rear exit, stage clear handoff, and Einstein placeholder ready')
