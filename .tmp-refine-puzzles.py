from pathlib import Path
import re

p=Path('index.html')
s=p.read_text(encoding='utf-8')

# 1) Sports: replace the giveaway weight field with distinct rules.
sports='''var SPORTS=[
 {id:"soccer",name:"축구",en:"soccer, 蹴球",players:11,
  rule:"필드 플레이어는 손과 팔로 공을 다룰 수 없으며, 상대 골문 안으로 공을 보내 득점한다.",
  roles:["골키퍼(goalkeeper)","센터백(centre-back)","스위퍼(sweeper)","풀백(full-back)","윙백(wing-back)","중앙 미드필더(central midfielder)","수비형 미드필더(defensive midfielder)","공격형 미드필더(attacking midfielder)","윙어(winger)","중앙 공격수(centre forward)","세컨드 스트라이커(second striker)"]},
 {id:"basketball",name:"농구",en:"basketball, 籠球",players:5,
  rule:"공을 들고 이동할 때는 드리블해야 하며, 슛 위치와 상황에 따라 1·2·3점을 얻는다.",
  roles:["포인트 가드(point guard)","슈팅 가드(shooting guard)","스몰 포워드(small forward)","파워 포워드(power forward)","센터(center)"]},
 {id:"baseball",name:"야구",en:"baseball, 野球",players:9,
  rule:"공격과 수비를 번갈아 진행하며, 타자가 베이스를 돌아 홈에 들어오면 득점한다.",
  roles:["투수(pitcher)","포수(catcher)","1루수(first baseman)","2루수(second baseman)","3루수(third baseman)","유격수(shortstop)","좌익수(left fielder)","중견수(center fielder)","우익수(right fielder)","지명타자(designated hitter)"]},
 {id:"rowing",name:"조정",en:"rowing, 漕艇",players:9,
  rule:"에이트에서는 8명의 조수가 노를 젓고, 타수(coxswain)가 보트의 방향과 선수들의 호흡·리듬을 지시한다.",
  roles:["스트로크(stroke)","7번(seven)","6번(six)","5번(five)","4번(four)","3번(three)","2번(two)","바우(bow)","타수(coxswain)"]}
];'''
s,n=re.subn(r'var SPORTS=\[.*?\n\];(?=\n\nvar CIPHER=)',sports,s,count=1,flags=re.S)
if n!=1:
    raise SystemExit(f'SPORTS block replace count={n}')
old="<dt>체중 규정</dt><dd>'+s.weight+'</dd>"
new="<dt>주요 규칙</dt><dd>'+s.rule+'</dd>"
if s.count(old)!=1:
    raise SystemExit(f'sports weight render count={s.count(old)}')
s=s.replace(old,new,1)

# 2) Chapter 4 hand-drawn concept sketch.
if '.cosmo-sketch{' not in s:
    marker='.list{display:grid;gap:8px}'
    if marker not in s:
        raise SystemExit('CSS insertion marker missing')
    css='''/* 4장 — 특이점과 시간 역전을 비교하는 손그림 메모 */
.cosmo-sketch{margin:22px auto 26px;padding:12px 10px 8px;border:1px solid rgba(96,72,42,.34);border-radius:2px;background:rgba(255,255,255,.28);transform:rotate(-.35deg);max-width:680px}
.cosmo-sketch svg{display:block;width:100%;height:auto;overflow:visible;color:#3c3023}
.cosmo-sketch .ink{fill:none;stroke:currentColor;stroke-width:3;stroke-linecap:round;stroke-linejoin:round}
.cosmo-sketch .fine{fill:none;stroke:currentColor;stroke-width:2;stroke-linecap:round;stroke-dasharray:6 7;opacity:.72}
.cosmo-sketch .dot{fill:#2a2118}.cosmo-sketch text{fill:#453628;font-family:var(--font-hand);font-size:20px}
.cosmo-sketch .small{font-size:15px;opacity:.78}.cosmo-sketch .redink{fill:var(--pen);font-weight:700}
'''
    s=s.replace(marker,css+marker,1)

if 'class="cosmo-sketch"' not in s:
    anchor=" '<p>그러나 나는 다른 곳에 더 관심이 있다.</p>'+\n"
    if s.count(anchor)!=1:
        raise SystemExit(f'diary4 sketch anchor count={s.count(anchor)}')
    sketch=''' '<p>그러나 나는 다른 곳에 더 관심이 있다.</p>'+\n '<div class="cosmo-sketch" aria-label="별의 붕괴와 시간을 거꾸로 돌린 모습을 비교한 메모">'+\n '<svg viewBox="0 0 720 220" role="img" aria-label="별이 한 점으로 붕괴하는 모습과 한 점에서 바깥으로 퍼져 나가는 모습을 나란히 그린 그림">'+\n '<text x="82" y="30">별의 붕괴</text><text x="565" y="30">반대 방향</text>'+\n '<circle class="ink" cx="105" cy="112" r="47"/><path class="ink" d="M48 70l31 25M45 112h38M50 154l29-24M162 70l-31 25M165 112h-38M160 154l-29-24"/>'+\n '<path class="ink" d="M175 112h70"/><path class="ink" d="M228 100l17 12-17 12"/><circle class="dot" cx="275" cy="112" r="8"/><text class="small" x="249" y="145">특이점</text>'+\n '<path class="fine" d="M317 70c25-42 61-42 86 0"/><path class="ink" d="M397 57l7 13-15 1"/><text class="redink" x="307" y="108">시간을 거꾸로</text>'+\n '<circle class="dot" cx="455" cy="112" r="8"/><path class="ink" d="M485 112h75M544 100l17 12-17 12"/>'+\n '<circle class="ink" cx="626" cy="112" r="47"/><path class="ink" d="M590 81l-25-20M586 112h-38M590 143l-25 20M662 81l25-20M666 112h38M662 143l25 20"/>'+\n '<text class="small" x="533" y="191">한 점에서 바깥으로 퍼져 나간다면?</text>'+\n '</svg></div>'+\n'''
    s=s.replace(anchor,sketch,1)

# 3) Terminal companion letter on the left.
if '#terminal-companion{' not in s:
    marker='#modal .card{width:100%;max-height:calc(100dvh - 24px - var(--sa-t) - var(--sa-b));pointer-events:auto;'
    if marker not in s:
        raise SystemExit('modal CSS marker missing')
    css='''#terminal-companion{position:fixed;z-index:59;left:calc(var(--sa-l) + 12px);top:calc(var(--sa-t) + 12px);width:min(43vw,650px);max-height:calc(100dvh - var(--sa-t) - var(--sa-b) - 24px);overflow:auto;padding:0;border-radius:4px;box-shadow:0 18px 48px rgba(0,0,0,.48);overscroll-behavior:contain}
#terminal-companion .terminal-companion-head{position:sticky;top:0;z-index:2;padding:9px 14px;background:#21180e;color:#d8bd88;border:1px solid rgba(214,186,136,.22);font-size:11px;font-weight:800;letter-spacing:.12em}
#terminal-companion .paper{padding:18px 22px;font-size:13px;line-height:1.72;box-shadow:none}
#terminal-companion .paper p{margin:0 0 10px}
body.touch #terminal-companion{left:calc(var(--sa-l) + 8px);top:calc(var(--sa-t) + 8px);width:42vw;max-height:calc(100dvh - var(--sa-t) - var(--sa-b) - 16px)}
body.touch #terminal-companion .paper{padding:13px 16px;font-size:11.5px;line-height:1.58}
@media(max-width:760px){#terminal-companion{width:40vw}#terminal-companion .paper{font-size:11px;padding:12px}}
'''
    s=s.replace(marker,css+marker,1)

old='''var modalAfterClose=null;
function openModal(title,sub,build,afterClose,closeText){
  $("#m-title").textContent=title;$("#m-sub").textContent=sub||"";'''
new='''var modalAfterClose=null;
function clearTerminalCompanion(){
  var old=document.getElementById("terminal-companion");
  if(old)old.remove();
}
function showTerminalCompanion(c){
  clearTerminalCompanion();
  if(!c||!c.diary)return;
  var host=el("aside","terminal-companion");host.id="terminal-companion";
  host.appendChild(el("div","terminal-companion-head","CHAPTER "+c.n+" · 편지"));
  host.appendChild(el("article","paper",DIARY_HTML[c.diary]));
  document.body.appendChild(host);
}
function openModal(title,sub,build,afterClose,closeText){
  clearTerminalCompanion();
  $("#m-title").textContent=title;$("#m-sub").textContent=sub||"";'''
if 'function showTerminalCompanion(c){' not in s:
    if s.count(old)!=1:
        raise SystemExit(f'openModal insertion count={s.count(old)}')
    s=s.replace(old,new,1)

old='''function closeModal(){
  $$("#m-body video").forEach(function(v){v.pause();});'''
new='''function closeModal(){
  clearTerminalCompanion();
  $$("#m-body video").forEach(function(v){v.pause();});'''
if 'function closeModal(){\n  clearTerminalCompanion();' not in s:
    if s.count(old)!=1:
        raise SystemExit(f'closeModal insertion count={s.count(old)}')
    s=s.replace(old,new,1)

old='''    if(S.phase==="search"){
      b.innerHTML='<div class="term"><div class="l">ACCEPTED</div>'+ 
        '<div class="cue">'+c.cue+'</div></div>';
      return;
    }
    var t=el("div","term");'''
# Current source has no space after + on the ACCEPTED line; use a regex for this small block.
if '    showTerminalCompanion(c);\n    var t=el("div","term");' not in s:
    pat=r'(    if\(S\.phase==="search"\)\{\n      b\.innerHTML=\'<div class="term"><div class="l">ACCEPTED</div>\'\+\n        \'<div class="cue">\'\+c\.cue\+\'</div></div>\';\n      return;\n    \}\n)(    var t=el\("div","term"\);)'
    s,n=re.subn(pat,r'\1    showTerminalCompanion(c);\n\2',s,count=1)
    if n!=1:
        raise SystemExit(f'terminal companion insertion count={n}')

p.write_text(s,encoding='utf-8')

out=p.read_text(encoding='utf-8')
required=[
    '<dt>주요 규칙</dt><dd>\'+s.rule+\'</dd>',
    '타수(coxswain)가 보트의 방향과 선수들의 호흡·리듬을 지시한다.',
    'class="cosmo-sketch"',
    'function showTerminalCompanion(c){',
    'showTerminalCompanion(c);',
    '#terminal-companion{'
]
for q in required:
    if q not in out:
        raise SystemExit('missing '+q)
if '<dt>체중 규정</dt>' in out or 'weight:"' in out:
    raise SystemExit('old sports weight clue remains')
print('puzzle reference patch validation ok')
