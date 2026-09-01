from pathlib import Path
import re

p=Path('index.html')
s=p.read_text(encoding='utf-8')

helpers='''function sealCode(s,k){\n  s=norm(s);\n  var h=(2166136261^Math.imul(k,2654435761))>>>0;\n  for(var i=0;i<s.length;i++){\n    h^=(s.charCodeAt(i)+(k+i)*17)>>>0;\n    h=Math.imul(h,16777619)>>>0;\n    h^=h>>>13;\n  }\n  return (h>>>0).toString(36);\n}\nfunction U(a,k){var o='';for(var i=0;i<a.length;i++)o+=String.fromCharCode(a[i]^((k+i*13)&255));return o;}\n'''

ch='''var CH=[\n {n:1,title:"별이 된 지 300년",diary:"diary1",puzzle:"date300",h:["1pzyxt4"],\n  cue:U([49578,51490,54556,109,45306,50979,84,50969,174,44715,50461,54765,51026,225],38),spot:"jf22j7",\n  piece:"사랑받는 아들로 태어난 날"},\n {n:2,title:"친구들이 붙인 별명",diary:"diary2",puzzle:"frames",h:["om8cts"],\n  cue:U([50579,47492,50437,51002,50715,72,44140,51138,175,49792,49841,54750,237],39),spot:"x48pwz",\n  piece:"친구들에게 좋은 별명을 얻은 날"},\n {n:3,title:"대학의 스포츠팀",diary:"diary3",puzzle:"position",h:["1b0xosa","es1u4x"],\n  cue:U([46436,47189,98,45281,50972,73,51174,49595,47308,189,49554,49270,51072,241,48330,46999,48140,51093,60],40),spot:"sop6b1",\n  piece:"병에 걸린 사실을 알아낸 날"},\n {n:4,title:"별의 붕괴를 거꾸로",diary:"diary4",puzzle:"cones",h:["8rbjcr"],\n  cue:U([49805,49807,50951,112,48034,44170,87,46112,47597,190,46491,47564,51029,252],41),spot:"1ljmtw0",\n  piece:"우주의 시작에 대한 비밀을 알아낸 날"},\n {n:5,title:"로마 안쪽의 작은 장소",diary:"diary5",puzzle:"map",h:["1qsqw43"],\n  cue:U([54599,49398,100,51029,54662,50619,88,45957,48854,54727,47056,151],42),spot:"sberz",\n  piece:"교황청에 방문한 날"},\n {n:6,title:"새로운 책의 제목",diary:"diary6",puzzle:"cipher",h:["2xzdvc","1cvuz06"],\n  cue:U([49911,44092,50945,114,51143,76,51641,53282,50947,142],43),spot:"1tavec2",\n  piece:"모두가 볼 수 있는 책을 펴낸 날"},\n {n:7,title:"더 넓은 세계로",diary:"diary7",puzzle:"dict",h:["1wzv278"],\n  cue:U([97,88,50,59,5,0,27,243,253,194,221,149],44),spot:"1wldqkb",\n  piece:"한국이라는 나라에 방문한 날"},\n {n:8,title:"미소로 그리는 대화",diary:"diary8",puzzle:"typing",h:["vkp2jm"],\n  cue:U([50585,46170,103,49625,50609,49522,46015,168,44089,45870,45083,44684,47541,248],45),spot:"5v1dhi",\n  piece:"죽을 고비를 맞아 의사에게 연락한 날"}\n];'''

pat=r'var CH=\[.*?\n\];\nvar BOARD_PAPERS='
m=re.search(pat,s,re.S)
if not m: raise SystemExit('CH block not found')
s=s[:m.start()]+helpers+'\n'+ch+'\nvar BOARD_PAPERS='+s[m.end():]

old='var STACK_ORDER=[2,4,3,1,6,8,5,7];\nvar FINAL_NAME="STEPHEN WILLIAM HAWKING";\n/* 이름을 한 판에 새긴 뒤 가로로 여덟 줄로 잘라 조각 옆면에 나눠 넣는다.\n   조각 하나만 보면 의미 없는 획이고, 순서대로 쌓아야 획이 이어진다. */'
new='''var _SO=[89,132,166,203,233,28,60,89];\nfunction stackOrder(){return _SO.map(function(v,i){return v^((91+i*37)&255);});}\nvar _FN=[254,158,162,84,105,123,21,88,194,251,131,160,64,103,14,64,53,219,224,159,184,64,108];\nfunction finalName(){var o="";for(var i=0;i<_FN.length;i++)o+=String.fromCharCode(_FN[i]^((173+i*29)&255));return o;}'''
if old not in s: raise SystemExit('stack/name block not found')
s=s.replace(old,new,1)
s=s.replace('STACK_ORDER','stackOrder()')
s=s.replace('FINAL_NAME','finalName()')
s=s.replace('function bandOf(n){return stackOrder().indexOf(n);}','function bandOf(n){return stackOrder().indexOf(n);}')

s=s.replace('if(c.ans.some(function(a){return norm(a)===v;})){','if(c.h.some(function(a){return a===sealCode(v,c.n);})){')
s=s.replace('o.userData.hot.id===c.spot','sealCode(o.userData.hot.id,c.n+20)===c.spot')
s=s.replace('if(id===c.spot){','if(sealCode(id,c.n+20)===c.spot){')
s=s.replace('$("#hud-title").textContent=c.era+" · "+c.title;','$("#hud-title").textContent=c.title;')
s=s.replace('$("#objective").innerHTML=\'<b>STEPHEN WILLIAM HAWKING</b>\';','$("#objective").innerHTML=\'<b>\'+finalName()+\'</b>\';')
s=s.replace("'<p class=\"sb\">1942년 1월 8일 — 갈릴레이가 세상을 떠난 지 정확히 300년 되는 날에 태어나<br>'+","'<p class=\"sb\">'+(1642+300)+'년 1월 8일 — 갈릴레이가 세상을 떠난 지 정확히 300년 되는 날에 태어나<br>'+",1)

# Remove comments that spell out puzzle internals.
s=re.sub(r'/\* 액자 서명 \[상,우,하,좌\] 1=굵음 \*/\n','',s)
s=re.sub(r'/\* 이름을 한 판에 새긴 뒤.*?\*/\n','',s,flags=re.S)

for bad in ['era:"1942"','ans:["94218"]','ans:["einstein"]','ans:["coxswain"','ans:["bigbang"]','ans:["vatican"]','ans:["historyoftime"','ans:["republicofkorea"]','ans:["163"]','var STACK_ORDER','var FINAL_NAME','STEPHEN WILLIAM HAWKING','1942년 1월 8일']:
    if bad in s: raise SystemExit('still exposed: '+bad)
if 'c.era+' in s: raise SystemExit('HUD still renders era')
if 'c.ans' in s: raise SystemExit('old answer validation remains')

p.write_text(s,encoding='utf-8')
print('index hardened',p.stat().st_size)
