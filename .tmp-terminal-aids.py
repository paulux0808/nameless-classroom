from pathlib import Path
import re

p=Path('index.html')
s=p.read_text(encoding='utf-8')

# Replace the one-size-fits-all left companion CSS with a flexible chapter workspace.
css_pat=r'''#terminal-companion\{position:fixed;z-index:59;.*?@media\(max-width:760px\)\{#terminal-companion\{width:40vw\}#terminal-companion \.paper\{font-size:11px;padding:12px\}\}\n'''
css_new='''#terminal-companion{position:fixed;z-index:59;left:calc(var(--sa-l) + 10px);right:calc(min(470px,46vw) + var(--sa-r) + 10px);top:calc(var(--sa-t) + 10px);bottom:calc(var(--sa-b) + 10px);overflow:hidden;border-radius:4px;pointer-events:auto}
.terminal-aid-grid{height:100%;display:grid;grid-template-columns:minmax(0,var(--aid-diary,46%)) minmax(0,1fr);gap:9px;align-items:stretch}
.terminal-aid-grid.single{grid-template-columns:minmax(0,1fr);max-width:720px}
.terminal-aid-pane{min-width:0;min-height:0;display:flex;flex-direction:column;overflow:hidden;border:1px solid rgba(214,186,136,.23);border-radius:4px;background:rgba(25,18,10,.94);box-shadow:0 16px 42px rgba(0,0,0,.44)}
.terminal-aid-head{flex:none;padding:8px 12px;background:#21180e;color:#d8bd88;border-bottom:1px solid rgba(214,186,136,.22);font-size:10.5px;font-weight:800;letter-spacing:.11em}
.terminal-aid-scroll{min-height:0;overflow:auto;overscroll-behavior:contain}
.terminal-aid-pane .paper{min-height:100%;padding:17px 20px;font-size:12.5px;line-height:1.68;box-shadow:none;border:0;border-radius:0}
.terminal-aid-pane .paper p{margin:0 0 10px}
.terminal-aid-ref{padding:10px;background:linear-gradient(165deg,rgba(40,31,20,.96),rgba(22,16,9,.96));color:var(--text)}
.terminal-aid-ref .list{gap:6px}.terminal-aid-ref .item>summary{padding:8px 10px;font-size:11.5px}.terminal-aid-ref .item .in{padding:9px 10px;font-size:11px;line-height:1.55}
.terminal-aid-ref dl{grid-template-columns:74px 1fr;font-size:11px}.terminal-aid-ref video{width:100%;max-height:34vh;object-fit:contain;background:#050403}
.terminal-aid-ref .mapwrap{margin:0 auto}.terminal-aid-ref .maproutes{font-size:11px;line-height:1.65;padding-left:19px}
.terminal-aid-ref .symbol-sheet{transform-origin:top center}
body.touch #terminal-companion{left:calc(var(--sa-l) + 7px);right:calc(min(430px,54vw) + var(--sa-r) + 7px);top:calc(var(--sa-t) + 7px);bottom:calc(var(--sa-b) + 7px)}
body.touch .terminal-aid-grid{gap:6px}body.touch .terminal-aid-pane .paper{padding:12px 14px;font-size:10.8px;line-height:1.5}body.touch .terminal-aid-ref{padding:7px}
@media(max-width:900px){.terminal-aid-head{padding:6px 9px;font-size:9.5px}.terminal-aid-pane .paper{font-size:10.5px;padding:11px 12px}.terminal-aid-ref .item .in{font-size:10px}}
'''
s,n=re.subn(css_pat,css_new,s,count=1,flags=re.S)
if n!=1:
    raise SystemExit(f'companion CSS replace count={n}')

# Replace companion functions with chapter-specific workspace builders.
fn_pat=r'''function clearTerminalCompanion\(\)\{.*?\n\}\nfunction showTerminalCompanion\(c\)\{.*?\n\}\nfunction openModal'''
fn_new=r'''var TERMINAL_AID={
  1:{kind:"sci",title:"과학자·수학자 자료",diary:43},
  2:{kind:"frames",title:"기호 종이 · 과학자 자료",diary:40},
  3:{kind:"sport",title:"운동경기 자료",diary:36},
  4:{kind:null,title:"",diary:100},
  5:{kind:"map",title:"신부가 건넨 지도",diary:38},
  6:{kind:"video",title:"의문의 영상",diary:48},
  7:{kind:null,title:"",diary:100},
  8:{kind:"keyb",title:"근섬유 키보드 사용법",diary:52}
};
function clearTerminalCompanion(){
  var old=document.getElementById("terminal-companion");
  if(old){old.querySelectorAll("video").forEach(function(v){v.pause();});old.remove();}
}
function terminalAidPane(title,cls){
  var pane=el("section","terminal-aid-pane "+(cls||""));
  pane.appendChild(el("div","terminal-aid-head",title));
  var scroll=el("div","terminal-aid-scroll");pane.appendChild(scroll);
  return {pane:pane,scroll:scroll};
}
function terminalAidDiary(c){
  var x=terminalAidPane("CHAPTER "+c.n+" · 편지","terminal-aid-diary");
  var article=el("article","paper",DIARY_HTML[c.diary]);
  if(c.n===7){
    var link=el("a","dict-link","네이버 영어사전에서 단어 찾기 ↗");
    link.href="https://en.dict.naver.com/#/main";link.target="_blank";link.rel="noopener noreferrer";
    article.appendChild(link);
  }
  x.scroll.appendChild(article);return x.pane;
}
function terminalAidDetails(list,title,html){
  var d=el("details","item");d.innerHTML='<summary>'+title+'</summary>';
  d.appendChild(el("div","in",html));list.appendChild(d);
}
function terminalAidResource(spec){
  var x=terminalAidPane(spec.title,"terminal-aid-material");
  var b=el("div","terminal-aid-ref");x.scroll.appendChild(b);
  var list=el("div","list");
  if(spec.kind==="sci"){
    SCI.forEach(function(s){terminalAidDetails(list,s.name+' <span style="color:var(--dim);font-weight:400">'+s.en+'</span>',
      '<dl><dt>생몰</dt><dd>'+s.born+' ~ '+s.died+'</dd><dt>핵심</dt><dd>'+s.key+'</dd></dl><p style="margin:8px 0 0">'+s.body+'</p>');});
    b.appendChild(list);
  }else if(spec.kind==="frames"){
    var sheet=el("div","symbol-sheet",symbolSheetHTML());b.appendChild(sheet);
    SCI.forEach(function(s){terminalAidDetails(list,s.name+' <span style="color:var(--dim);font-weight:400">'+s.en+'</span>',
      '<dl><dt>생몰</dt><dd>'+s.born+' ~ '+s.died+'</dd><dt>핵심</dt><dd>'+s.key+'</dd></dl>');});
    b.appendChild(list);
  }else if(spec.kind==="sport"){
    SPORTS.forEach(function(s){terminalAidDetails(list,s.name+' <span style="color:var(--dim);font-weight:400">'+s.en+'</span>',
      '<dl><dt>한 팀 인원</dt><dd>'+s.players+'명</dd><dt>주요 규칙</dt><dd>'+s.rule+'</dd><dt>포지션</dt><dd>'+s.roles.join(", ")+'</dd></dl>');});
    b.appendChild(list);
  }else if(spec.kind==="map"){
    var mw=el("div","mapwrap"),mg=el("div","mapgrid");
    for(var r=1;r<=MAP_ROWS;r++)for(var c=1;c<=MAP_COLS;c++){
      var nm=MAP_PRINTED[r+","+c];
      if(r===5&&c>2){mg.appendChild(el("div","mc void"));continue;}
      mg.appendChild(el("div","mc"+(nm?"":" blank"),nm||""));
    }
    mw.appendChild(mg);b.appendChild(mw);
    var ol=el("ol","maproutes");ol.innerHTML=MAP_ROUTES.map(function(v){return '<li>'+v.t+'</li>';}).join("");b.appendChild(ol);
  }else if(spec.kind==="video"){
    var v=el("video");v.controls=true;v.preload="metadata";v.playsInline=true;v.src=A.videoMystery;b.appendChild(v);
    b.appendChild(el("p","mini","화면이 크게 손상되어 있습니다. 자막을 끝까지 읽어 보세요."));
  }else if(spec.kind==="keyb"){
    b.innerHTML='<div class="item"><div class="in"><ol style="margin:2px 0;padding-left:19px;line-height:1.8"><li>알파벳을 입력할 때에는 알파벳의 순서만큼 근육을 움직인 뒤 5초간 대기합니다. (예: c는 세 번)</li><li>마침표는 근육을 28번 움직인 후 5초 대기합니다.</li></ol></div></div>';
  }
  return x.pane;
}
function showTerminalCompanion(c){
  clearTerminalCompanion();
  if(!c||!c.diary)return;
  var spec=TERMINAL_AID[c.n]||{kind:null,diary:100};
  var host=el("aside");host.id="terminal-companion";
  host.style.setProperty("--aid-diary",(spec.diary||46)+"%");
  var grid=el("div","terminal-aid-grid"+(spec.kind?"":" single"));
  grid.appendChild(terminalAidDiary(c));
  if(spec.kind)grid.appendChild(terminalAidResource(spec));
  host.appendChild(grid);document.body.appendChild(host);
}
function openModal'''
s,n=re.subn(fn_pat,fn_new,s,count=1,flags=re.S)
if n!=1:
    raise SystemExit(f'companion function replace count={n}')

p.write_text(s,encoding='utf-8')

out=p.read_text(encoding='utf-8')
checks=[
 '1:{kind:"sci",title:"과학자·수학자 자료",diary:43}',
 '2:{kind:"frames",title:"기호 종이 · 과학자 자료",diary:40}',
 '3:{kind:"sport",title:"운동경기 자료",diary:36}',
 '4:{kind:null,title:"",diary:100}',
 '5:{kind:"map",title:"신부가 건넨 지도",diary:38}',
 '6:{kind:"video",title:"의문의 영상",diary:48}',
 '7:{kind:null,title:"",diary:100}',
 '8:{kind:"keyb",title:"근섬유 키보드 사용법",diary:52}',
 'symbolSheetHTML()', 'v.src=A.videoMystery', 's.rule', 'showTerminalCompanion(c);'
]
for q in checks:
    if q not in out: raise SystemExit('missing '+q)
if '#terminal-companion{position:fixed;z-index:59;left:calc(var(--sa-l) + 12px)' in out:
    raise SystemExit('old fixed companion CSS remains')
print('chapter terminal aids patch validation ok')
