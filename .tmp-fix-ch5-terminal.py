from pathlib import Path

p=Path('index.html')
s=p.read_text(encoding='utf-8')

# Restore the original Chapter 5 map data that disappeared during later refactors.
if 'var MAP_ROWS=5, MAP_COLS=6;' not in s:
    marker='var CIPHER="BHCISKTAOCRUYOPFBTIAMCEP";'
    if s.count(marker)!=1:
        raise SystemExit(f'CIPHER insertion marker count={s.count(marker)}')
    map_block='''/* 5장 — A~Z 6열 격자 */
/* 신부의 지도 — 원본대로 여섯 칸만 적혀 있다. 나머지는 스스로 알아내야 한다 */
var MAP_ROWS=5, MAP_COLS=6;
var MAP_PRINTED={"1,1":"APPLE","2,2":"H&M","2,6":"LOUIS VUITTON",
                 "3,2":"NIKE","3,5":"QUIZNOS","4,4":"VERSACE"};
var MAP_ROUTES=[
 {t:"유니클로(UNIQLO)에서 오른쪽으로 한 블록 가면 나오는 곳.",s:"U",mv:[[0,1]]},
 {t:"이니스프리(INNISFREE)에서 왼쪽으로 두 블록, 위로 한 블록 가면 나오는 곳.",s:"I",mv:[[0,-1],[0,-1],[-1,0]]},
 {t:"H&M에서 밑으로 두 블록 아래로 가면 나오는 곳.",s:"H",mv:[[1,0],[1,0]]},
 {t:"던킨도넛(DUNKIN DONUTS)에서 아래로 한 블록, 왼쪽으로 한 블록 가면 나오는 곳.",s:"D",mv:[[1,0],[0,-1]]},
 {t:"페이스북(FACEBOOK) 본사에서 왼쪽으로 세 블록 가면 나오는 곳.",s:"F",mv:[[0,-1],[0,-1],[0,-1]]},
 {t:"예일대(YALE UNIV.)에서 위로 네 블록 가면 나오는 곳.",s:"Y",mv:[[-1,0],[-1,0],[-1,0],[-1,0]]},
 {t:"스쿨푸드(SCHOOL FOOD)에서 위로 한 블록, 오른쪽으로 한 블록 가면 나오는 곳.",s:"S",mv:[[-1,0],[0,1]]}
];

'''
    s=s.replace(marker,map_block+marker,1)

# Revert the computer hotspot to the original visible screen only.
expanded='''  var screen=plane(0.86,0.52,screenMat,0,1.24,-3.015);
  scene.add(screen);
  /* 필수 진행 오브젝트: 화면 자체보다 넓은 투명 판정 영역을 둔다. */
  var computerHit=plane(1.58,1.02,new THREE.MeshBasicMaterial({transparent:true,opacity:0,depthWrite:false}),0,1.24,-3.005);
  scene.add(hot(computerHit,"computer","컴퓨터"));
  screenGlow=new THREE.PointLight(0x63c3b2,0.55,3.4);screenGlow.position.set(0,1.3,-2.7);scene.add(screenGlow);'''
original='''  var screen=plane(0.86,0.52,screenMat,0,1.24,-3.015);
  scene.add(hot(screen,"computer","컴퓨터"));
  screenGlow=new THREE.PointLight(0x63c3b2,0.55,3.4);screenGlow.position.set(0,1.3,-2.7);scene.add(screenGlow);'''
if s.count(expanded)!=1:
    raise SystemExit(f'expanded computer hotspot count={s.count(expanded)}')
s=s.replace(expanded,original,1)

# Revert the special computer reach rule completely to the original global REACH behavior.
reach='''var lastHover=null, lastDist=0, REACH=3.0, hoverFar=false;
function reachFor(o){
  /* 컴퓨터는 각 장 진행에 필수이므로 조준만 되면 조사 가능하게 한다. */
  return o&&o.userData&&o.userData.hot&&o.userData.hot.id==="computer"?Infinity:REACH;
}
function hover(x,y){'''
reach_original='''var lastHover=null, lastDist=0, REACH=3.0, hoverFar=false;
function hover(x,y){'''
if s.count(reach)!=1:
    raise SystemExit(f'special reach block count={s.count(reach)}')
s=s.replace(reach,reach_original,1)
if s.count('hoverFar=lastDist>reachFor(o);')!=1:
    raise SystemExit('special hover reach use missing')
s=s.replace('hoverFar=lastDist>reachFor(o);','hoverFar=lastDist>REACH;',1)
if s.count('if(lastDist>reachFor(o)){toast("더 가까이 가세요.");return;}')!=1:
    raise SystemExit('special pick reach use missing')
s=s.replace('if(lastDist>reachFor(o)){toast("더 가까이 가세요.");return;}',
            'if(lastDist>REACH){toast("더 가까이 가세요.");return;}',1)

p.write_text(s,encoding='utf-8')
out=p.read_text(encoding='utf-8')

# Runtime dependency checks for Chapter 5 terminal map.
checks=[
    'var MAP_ROWS=5, MAP_COLS=6;',
    'var MAP_PRINTED={"1,1":"APPLE"',
    'var MAP_ROUTES=[',
    '예일대(YALE UNIV.)에서 위로 네 블록',
    '5:{kind:"map",title:"신부가 건넨 지도",diary:38}',
    'for(var r=1;r<=MAP_ROWS;r++)for(var c=1;c<=MAP_COLS;c++){',
    'scene.add(hot(screen,"computer","컴퓨터"));',
    'hoverFar=lastDist>REACH;',
    'if(lastDist>REACH){toast("더 가까이 가세요.");return;}'
]
for q in checks:
    if q not in out:
        raise SystemExit('missing '+q)
for forbidden in ['var computerHit=plane(', 'function reachFor(o){', 'Infinity:REACH']:
    if forbidden in out:
        raise SystemExit('range workaround still present: '+forbidden)
if out.count('var MAP_ROWS=5, MAP_COLS=6;')!=1:
    raise SystemExit('map data block duplicated')
if out.count('var MAP_ROUTES=[')!=1:
    raise SystemExit('MAP_ROUTES definition count is not 1')
print('Chapter 5 map data restored and computer interaction fully reverted')
