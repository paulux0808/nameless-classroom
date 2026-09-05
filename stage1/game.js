
"use strict";
/* ======================= [6] 데이터 ======================= */
var A = window.ASSETS || {};
var preferences = {sensitivity:1, brightness:1, motion:!matchMedia("(prefers-reduced-motion: reduce)").matches};
try {
  var pref = JSON.parse(localStorage.getItem("nameless-stage1-preferences") || "null");
  if(pref) {
    if(Number.isFinite(pref.sensitivity))preferences.sensitivity=Math.max(.5,Math.min(1.8,pref.sensitivity));
    if(Number.isFinite(pref.brightness))preferences.brightness=Math.max(.8,Math.min(1.3,pref.brightness));
    if(typeof pref.motion === "boolean")preferences.motion=pref.motion;
  }
} catch (_) {}
function savePreferences(){
  try {localStorage.setItem("nameless-stage1-preferences",JSON.stringify(preferences));} catch (_) {}
  if(renderer)renderer.toneMappingExposure=preferences.brightness;
}
var activeAnswerPad=null;


var SCI = [
  {id:"newton",sym:"apple",name:"아이작 뉴턴",en:"Isaac Newton",born:"1643. 1. 4.",died:"1727. 3. 31.",
   key:"만유인력의 기본 바탕 · 떨어지는 사과",
   body:"잉글랜드의 물리학자·수학자. 1687년 《자연철학의 수학적 원리》에서 만유인력과 세 가지 운동 법칙을 세웠다. 케플러의 행성 운동 법칙과 자신의 중력 이론이 이어짐을 보여 태양중심설의 마지막 의문을 걷어냈다. 반사망원경을 만들고 프리즘으로 빛의 스펙트럼을 관찰했으며, 라이프니츠와 함께 미적분학을 열었다."},
  {id:"archimedes",sym:"pi",name:"아르키메데스",en:"Archimedes",born:"약 B.C. 287",died:"약 B.C. 212",
   key:"원주율(π)을 계산",
   body:"고대 그리스 시라쿠사 출신의 철학자·수학자·천문학자·물리학자·공학자. 욕조에서 부력을 깨닫고 뛰쳐나가 “찾았다(εὕρηκα)”를 외친 일화로 유명하다. 나선양수기와 투석기를 만들었고 지레의 원리를 밝혔다. 원에 내접·외접하는 다각형을 비교해 원주율을 계산했다."},
  {id:"abel",sym:"sqrt",name:"닐스 헨리크 아벨",en:"Niels Henrik Abel",born:"1802. 8. 5.",died:"1829. 4. 6.",
   key:"제곱근 연산 √",fix:"원본 인쇄물에는 생몰년이 뉴턴의 것으로 잘못 적혀 있어 바로잡았습니다.",
   body:"노르웨이의 수학자. 5차 이상의 대수방정식에는 근호와 사칙연산만으로 쓸 수 있는 일반적인 근의 공식이 없다는 아벨–루피니 정리를 처음으로 정확히 증명했다. 아벨 군, 아벨 적분 등 그의 이름을 딴 용어가 많다. 2002년 아벨상이 창설되었다."},
  {id:"einstein",sym:null,name:"알베르트 아인슈타인",en:"Albert Einstein",born:"1879. 3. 14.",died:"1955. 4. 18.",
   key:"질량-에너지 등가 E=mc²",
   body:"독일 태생으로 스위스와 미국에서 활동한 이론물리학자. 일반 상대성이론으로 현대 물리학을 뒤바꿨고 1921년 광전효과로 노벨 물리학상을 받았다. 특수 상대성이론에서 질량-에너지 등가를 E=mc²라는 관계식으로 설명했다."},
  {id:"galilei",sym:"sun",name:"갈릴레오 갈릴레이",en:"Galileo Galilei",born:"1564. 2. 15.",died:"1642. 1. 8.",
   key:"태양계의 중심은 지구가 아니라 태양",
   body:"이탈리아의 철학자·과학자·물리학자·천문학자. 코페르니쿠스의 이론을 옹호하여 태양계의 중심이 지구가 아니라 태양임을 믿었다. 종교재판에 회부되어 지동설 포기를 명령받았고 말년을 가택 구류로 보냈다. ‘근대 과학의 아버지’라 불린다."},
  {id:"gauss",sym:"compass",name:"카를 프리드리히 가우스",en:"Carl Friedrich Gauss",born:"1777. 4. 30.",died:"1855. 2. 23.",
   key:"눈금없는 자와 컴퍼스만으로 작도",
   body:"독일의 수학자이자 과학자. 정수론·통계학·해석학·미분기하학·측지학·천문학 등에 크게 기여했다. 변의 개수가 페르마 소수인 정다각형은 눈금없는 자와 컴퍼스만으로 작도가 가능하다는 것을 보였다. 왜행성 세레스의 궤도를 예측해 유명해졌다."}
];

var SPORTS=[
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
  rule:"에이트에서는 8명의 조수가 노를 젓고, 타수(coxswain)가 보트의 방향과 선수들의 호흡·리듬을 지시한다. 대한조정협회 규칙에는 타수의 체중을 50kg 이상으로 하고, 미달하면 좌석 밑에 최대 10kg의 중량물을 둘 수 있다고 되어 있다.",
  roles:["스트로크(stroke)","7번(seven)","6번(six)","5번(five)","4번(four)","3번(three)","2번(two)","바우(bow)","타수(coxswain)"]}
];

/* 5장 — A~Z 6열 격자 */
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

var CIPHER="BHCISKTAOCRUYOPFBTIAMCEP";

var SYMBOL_SVG={
 apple:'<svg viewBox="0 0 64 64"><path fill="#111" d="M32 16c-3-6-10-9-16-8 1 5 5 9 10 10-8 1-13 8-13 17 0 11 8 21 15 21 3 0 4-1 4-1s2 1 4 1c7 0 15-10 15-21 0-9-6-16-14-17 5-1 9-5 10-10-6-1-12 2-15 8z"/><path fill="#111" d="M33 12c1-5 5-8 9-9 0 5-3 9-7 11z"/></svg>',
 sun:'<svg viewBox="0 0 64 64"><circle cx="32" cy="32" r="12" fill="#111"/><g stroke="#111" stroke-width="4" stroke-linecap="round"><line x1="32" y1="4" x2="32" y2="14"/><line x1="32" y1="50" x2="32" y2="60"/><line x1="4" y1="32" x2="14" y2="32"/><line x1="50" y1="32" x2="60" y2="32"/><line x1="12" y1="12" x2="19" y2="19"/><line x1="45" y1="45" x2="52" y2="52"/><line x1="52" y1="12" x2="45" y2="19"/><line x1="19" y1="45" x2="12" y2="52"/></g></svg>',
 sqrt:'<svg viewBox="0 0 64 64"><path fill="none" stroke="#111" stroke-width="5" d="M6 36 L16 36 L25 56 L38 10 L60 10"/></svg>',
 compass:'<svg viewBox="0 0 64 64"><circle cx="32" cy="10" r="6" fill="none" stroke="#111" stroke-width="3"/><circle cx="32" cy="10" r="2" fill="#111"/><path fill="none" stroke="#111" stroke-width="3" stroke-linecap="round" d="M30 16 L16 58 M34 16 L48 58"/><path fill="none" stroke="#111" stroke-width="3" stroke-linecap="round" d="M20 46 L44 46"/></svg>',
 pi:'<svg viewBox="0 0 64 64"><path fill="#111" d="M8 16h48v9H45v33h-10V25H24c0 14-2 23-6 30l-9-4c4-7 6-15 6-26H8z"/></svg>'};
/* 퍼즐지: 심볼이 그려진 방향이 곧 액자를 돌려야 할 방향이다 */
var SHEET=[
 {dir:"v",a:["apple",180],  b:["compass",180]},
 {dir:"v",a:["sun",180],    b:["pi",0]},
 {dir:"h",a:["sqrt",270],   b:["apple",270]},
 {dir:"v",a:["sqrt",270],   b:["compass",180]},
 {dir:"v",a:["apple",0],    b:["compass",180]}
];
function symbolSheetHTML(){
  return '<div class="sgrid scrolls fade-x">'+SHEET.map(function(t){
    function cell(x){return '<div class="scell"><span style="transform:rotate('+x[1]+'deg)"><i class="mk"></i>'+SYMBOL_SVG[x[0]]+'</span></div>';}
    return '<div class="stile '+t.dir+'">'+cell(t.a)+cell(t.b)+'</div>';
  }).join("")+'</div>';
}
function showSheet(){
  openModal("종이 한 장","기호가 그려진 종이",function(b){ b.innerHTML=symbolSheetHTML(); });
}

/* pi 는 위·아래가 모두 굵어 그 자체로 "=" 로 읽혔다. 종이의 태양+π 타일에서
   위 칸(태양)이 180° 로 뒤집히면 그 칸의 위쪽 표시가 아래로 내려와 π 칸의
   위쪽 표시와 나란히 서는데, 거기에 π 액자까지 "=" 모양이라 지시 두 개가
   기호 하나로 뭉쳐 읽혔다. π 는 아랫면만 굵게 둔다. */
var FRAME_SIG={apple:[1,1,1,0],compass:[1,1,0,0],sqrt:[1,1,0,0],sun:[1,0,0,0],pi:[0,0,1,0]};
var SYM_OF={newton:"apple",gauss:"compass",abel:"sqrt",galilei:"sun",archimedes:"pi"};
var SYM_KO={apple:"사과",compass:"컴퍼스",sqrt:"제곱근 √",sun:"태양",pi:"파이 π"};


var CH=[
 {n:1,title:"별이 된 지 300년",diary:"diary1",puzzle:"date300",h:["1pzyxt4","1q37tsi"],
  cue:U([49578,51490,54556,109,45306,50979,84,50969,174,44715,50461,54765,51026,225],38),spot:"jf22j7",
  piece:"사랑받는 아들로 태어난 날"},
 {n:2,title:"친구들이 붙인 별명",diary:"diary2",puzzle:"frames",h:["om8cts"],
  cue:U([50579,47492,50437,51002,50715,72,44140,51138,175,49792,49841,54750,237],39),spot:"x48pwz",
  piece:"친구들에게 좋은 별명을 얻은 날"},
 {n:3,title:"대학의 스포츠팀",diary:"diary3",puzzle:"position",h:["1b0xosa","es1u4x"],
  cue:U([46436,47189,98,45281,50972,73,51174,49595,47308,189,49554,49270,51072,241,48330,46999,48140,51093,60],40),spot:"sop6b1",
  piece:"병에 걸린 사실을 알아낸 날"},
 {n:4,title:"한 점에 대한 연구",diary:"diary4",puzzle:"cones",h:["8rbjcr"],
  cue:U([49805,49807,50951,112,48034,44170,87,46112,47597,190,46491,47564,51029,252],41),spot:"1ljmtw0",
  piece:"우주의 시작에 대한 비밀을 알아낸 날"},
 {n:5,title:"낯선 지도",diary:"diary5",puzzle:"map",h:["1qsqw43"],
  cue:U([54599,49398,100,51029,54662,50619,88,45957,48854,54727,47056,151],42),spot:"sberz",
  piece:"교황청에 방문한 날"},
 {n:6,title:"새로운 책의 제목",diary:"diary6",puzzle:"cipher",h:["2xzdvc","1cvuz06"],
  cue:U([49911,44092,50945,114,51143,76,51641,53282,50947,142],43),spot:"1tavec2",
  piece:"모두가 볼 수 있는 책을 펴낸 날"},
 {n:7,title:"더 넓은 세계로",diary:"diary7",puzzle:"dict",h:["1wzv278"],
  cue:U([97,88,50,59,5,0,27,243,253,194,221,149],44),spot:"1wldqkb",
  piece:"한국이라는 나라에 방문한 날"},
 {n:8,title:"미소로 그리는 대화",diary:"diary8",puzzle:"typing",h:["vkp2jm"],
  cue:U([50585,46170,103,49625,50609,49522,46015,168,44089,45870,45083,44684,47541,248],45),spot:"5v1dhi",
  piece:"죽을 고비를 맞아 의사에게 연락한 날"}
];
var BOARD_PAPERS={
  2:{id:"sheet",name:"종이 한 장",label:"인쇄물"},
  3:{id:"sport",name:"운동경기 자료",label:"인쇄물"},
  5:{id:"map",name:"신부가 건넨 지도",label:"인쇄물"},
  6:{id:"video",name:"의문의 영상",label:"자료"},
  8:{id:"keyb",name:"키보드 사용법",label:"인쇄물"}
};
var BANDS=8, BAND_H=18, ENGRAVE_W=1600, _engrave=null;
function engraveURL(){
  if(_engrave)return _engrave;
  var H=BANDS*BAND_H, cv=document.createElement("canvas");
  cv.width=ENGRAVE_W;cv.height=H;
  var g=cv.getContext("2d");
  g.textAlign="center";g.textBaseline="middle";
  g.font="900 200px 'Gothic A1',Arial,sans-serif";
  var m=g.measureText(finalName());
  var asc=m.actualBoundingBoxAscent||150, desc=m.actualBoundingBoxDescent||10;
  var sy=(H-4)/(asc+desc), sx=(ENGRAVE_W-60)/m.width;
  g.save();
  g.translate(ENGRAVE_W/2, 2+asc*sy);
  g.scale(sx,sy);
  g.fillStyle="rgba(255,236,200,.32)";g.fillText(finalName(),0,-3/sy);
  g.fillStyle="rgba(24,13,4,.92)";g.fillText(finalName(),0,0);
  g.restore();
  _engrave=cv.toDataURL("image/png");return _engrave;
}

var DIARY_HTML={};
DIARY_HTML.diary1=
 '<p class="date">1<span class="blank">?</span><span class="blank">?</span><span class="blank">?</span>년 <span class="blank">?</span>월 <span class="blank">?</span>일</p>'+
 '<p>오, 하나님. 이 기분을 어떻게 표현할 수 있을까요?<br>아내의 오랜 진통 끝에, 천사 같은 우리 아들이 태어났다.<br>내 사랑, 나의 사랑스러운 이사벨… 우리가 드디어 부모가 된 거야.<br>너무 고생 많았어.</p>'+
 '<p>눈에 넣어도 아프지 않을 이 아들을 우리는 어떻게 키워야 할까?<br>오늘은 마침, <span class="em">위대한 한 사람이 별이 된 지 정확히 300년이 되는 날</span>이다.</p>'+
 '<p class="em">모두가 아니라고 말할 때에도, 자신이 옳다고 믿는 것을 굳건히 지켜나간 사람.<br>우리가 세상의 중심이라는 오만함을 버리고, 우주의 일부임을 인정한 사람.</p>'+
 '<p>우리 아들, 이 아이는 이 사람처럼 큰일을 할 거야.</p>'+
 '<p>이사벨, 우리, 이 아이의 이름을 <span class="redacted"></span>라고 짓자.</p>';
DIARY_HTML.diary2=
 '<p class="date">1954년 3월 10일</p>'+
 '<p>새 학기가 시작되었어요.<br>새로운 친구들도 많이 만났구요.<br>그 중에서 마음에 맞는 친구들과 함께 다니는 것이 재미있어요.</p>'+
 '<p>선생님! 친구들은 저를 <span class="redacted"></span> 이라고 불러요.<br>저도 이 이름을 어디선가 본 적이 있어요.<br>위인전에서, 알 수 없는 내용들과 함께요.<br>그래도 이 분이 정말 대단한 사람이란 건 알고 있어서,<br>친구들이 날 그렇게 부를 때 약간 부끄러워요.</p>'+
 '<p>선생님은 이 일기장을 검사하실 테니까, 문제를 한 번 내볼래요.<br>위인전에 나와 있는 것들로 푸실 수 있으실 거예요.<br><span class="em">벽에 붙어있던 과학자들의 액자를 더 자세히 보세요!</span><br>제 별명을 아실 수 있게, 여러 가지 단서를 준비해두었어요 ;)</p>';
DIARY_HTML.diary3=
 '<p class="date">1962년 4월 5일</p>'+
 '<p>그 날, 나는 가장 유명한 대학 중 하나에 입학한 것보다 훨씬 큰 기쁨을 느꼈다.<br>입학 그 자체로도 큰 성취였지만, 나 같은 허약한 사람이 할 수 있는 스포츠를 찾았다는 것은 내게는 더 큰 발견이었다.<br>학교에서는 가장 유명한 스포츠클럽에 들어갈 수 있었다. 더욱 놀라운 사실은, 그 중에서도 가장 중요한 포지션을 내게 맡겨줬다는 것이었다.</p>'+
 '<p>우리는 열심히 훈련하며 다가오는 다음 달의 전국 대회에서 승리를 향해 달려갈 준비를 하고 있었다.</p>'+
 '<p>그러나, 운명은 때로는 비극을 가져온다.<br>중동 지방을 여행 중 갑작스럽게 이상한 증상이 나타났다.<br>내 손가락이 움직이지 않았다.</p>'+
 '<p>이런 상황에서도 나는 어리석게도 나 자신의 건강보다도 우리 팀을 더 걱정하고 있었다.<br>나와 같은 <span class="em">평균 이하의 체중</span>을 가진 사람들만이 할 수 있는 특별한 역할을 맡고 있었기 때문이었다.</p>'+
 '<p>우리 팀의 완성을 위해서는 <span class="em">대니얼, 존, 드레이먼트, 케빈, 제임스, 크리스, 하워드, 앤써니, 그리고 나</span>까지 모두가 함께해야 했다.</p>'+
 '<p>내가 맡은 <span class="red">역할</span>을 완수하고 싶었다. 그러나 운명은 가혹하게도 비극을 가져왔다.<br>그럼에도 불구하고, 내 마지막까지 포기하지 않고, 나는 최선을 다하고 싶었다.</p>';
DIARY_HTML.diary4=
 '<p class="date">1967년 6월 1일</p>'+
 '<p>교수님의 연구에 매료되었다. 특이점에 대해 탐구한 것이었다.</p>'+
 '<p>교수님은 그 특이점이 무한한 중력을 지니고 있음을 언급하셨다.<br>그곳에서는 모든 시간과 공간이 소멸한다.<br>그렇기에 그 점은 우주의 끝과도 같은 곳이다.<br>펜로즈 교수님은 별이 붕괴되면 그런 점이 형성된다는 것을 입증하셨다.</p>'+
 '<p>그러나 나는 다른 곳에 더 관심이 있다.</p>'+
 '<p class="em" style="text-align:center">중요한 것은 시작이다. 끝이 아니라 시작.<br>정말로 큰 질문은, 시작이 있었느냐 없었느냐 하는 것이다.</p>'+
 '<p>만약.. 만약에…<br>저기서 시간만 거꾸로 돌린 것이 우주의 시작이라면?</p>'+
 '<p>그렇다면 우주는 한 점에서 출발한다는 말이야…!!!<br>우주의 끝이 별의 붕괴일 때,<br>그 반대인 별의 폭발이 우주의 시작이라는 거야!!</p>'+
 '<p>바로 <span class="redacted"></span> 말이야!!!<br>어서 펜로즈 교수님을 찾아가야해. 서두르자!</p>'+
'<div class="cosmo-sketch" aria-label="별의 붕괴와 시간을 거꾸로 돌린 모습을 비교한 메모">'+
 '<svg viewBox="0 0 720 220" role="img" aria-label="별이 한 점으로 붕괴하는 모습과 한 점에서 바깥으로 퍼져 나가는 모습을 나란히 그린 그림">'+
 '<text x="82" y="30">별의 붕괴</text><text x="565" y="30">반대 방향</text>'+
 '<circle class="ink" cx="105" cy="112" r="47"/><path class="ink" d="M48 70l31 25M45 112h38M50 154l29-24M162 70l-31 25M165 112h-38M160 154l-29-24"/>'+
 '<path class="ink" d="M175 112h70"/><path class="ink" d="M228 100l17 12-17 12"/><circle class="dot" cx="275" cy="112" r="8"/><text class="small" x="249" y="145">특이점</text>'+
 '<path class="fine" d="M317 70c25-42 61-42 86 0"/><path class="ink" d="M397 57l7 13-15 1"/><text class="redink" x="307" y="108">시간을 거꾸로</text>'+
 '<circle class="dot" cx="455" cy="112" r="8"/><path class="ink" d="M485 112h75M544 100l17 12-17 12"/>'+
 '<circle class="ink" cx="626" cy="112" r="47"/><path class="ink" d="M590 81l-25-20M586 112h-38M590 143l-25 20M662 81l25-20M666 112h38M662 143l25 20"/>'+
 '<text class="small" x="533" y="191">한 점에서 바깥으로 퍼져 나간다면?</text>'+
 '</svg></div>';
DIARY_HTML.diary5=
 '<p class="date">1981년 2월 1일</p>'+
 '<p>로마 교황의 초대를 받았다.<br>이는 흔히 찾아오지 않는 경험이었고, 정말 특별한 기회였다.</p>'+
 '<p>몸을 제대로 움직이기 어려운 상태였지만 무작정 이탈리아로 향했다.<br>그때도 교황을 만나뵈러 왔었는데 벌써 6년이나 지난 일이었다.</p>'+
 '<p>알고 있는 것은 이곳이 로마 안쪽의 아주 작은 장소라는 것 뿐이었다.<br>막연한 상황에서 신부로 보이는 한 사람에게 길을 물었다.<br>그 신부는 이상한 지도를 하나 건네주고는 사라져버렸다.</p>'+
 '<p class="em">어느 장소에서 시작해야 하는지,<br>목적지가 어디인지 알기 위해서는 지도에 나와있는 일곱 장소를 순서대로 모두 들러야 한다고 되어 있었다.</p>'+
 '<p>이게 대체 무슨 뜻인지 이해하기 어려웠다.<br>과연 어떤 목적지가 나를 기다리고 있는 걸까?</p>'+
 '';
DIARY_HTML.diary6=
 '<p class="date">1988년 9월 15일</p>'+
 '<p>갈릴레오 갈릴레이, 아이작 뉴턴, 알베르트 아인슈타인.<br>모두 저 하늘을 바라보며 호기심을 가졌던 사람들이다.</p>'+
 '<p>나도 그렇다. 이 우주를 더 알아보고 싶다.<br>하지만 이제는 두 손가락만 움직여 글을 쓰는 것도 슬슬 힘들어지고 있다.</p>'+
 '<p>하지만, 내가 하고 싶은 일이 하나 더 있다.<br>바로, 우주를 공부하는 사람들, 우주를 좋아하는 사람들을 만드는 것.</p>'+
 '<p>이 책은 그런 목적으로 쓰였다.<br>내 연구 결과가 얼마나 쉽겠냐마는, 그래도 더 많은 사람들이 우주를 보길 원한다.</p>'+
 '<p>자, 책 이름은 무엇으로 할까……<br>시간, 그리고 공간… 물질, 그리고 공허함…<br><span class="em">우주의 시작… 그리고 끝.</span></p>'+
 '<p style="font-size:36px"><em>A Brief</em> <span class="red">'+CIPHER+'</span></p>'+
 '<p>[다른 자료와 섞여서 제대로 보이지 않는다..]<br>혹시 영상을 보면 단서를 찾을 수 있을지도..?</p>';
DIARY_HTML.diary7=
 '<p class="date">1990년 9월 8일</p>'+
 '<p>내일은 초청을 받아 외국으로 3박 4일 방문을 간다.<br>환영 만찬회에도 가고, ‘우주의 기원’을 주제로 강연도 할 계획이다.</p>'+
 '<p>처음 방문하기에, <span class="em">어떤 나라</span>인지 알고 싶었다.<br>한국인 통역사에게 물었더니 이 쪽지를 주었다.</p>'+
 '<div class="note">'+
 '<span class="red">급진적인</span> 사람들이 많은 나라입니다.<br>동시에 아주 뜨겁고 <span class="red">열광적인</span> 나라이기도 하고요.<br>'+
 '걱정이 많아 가끔은 <span class="red">수심 어린</span> 목소리를 내기도 하지만<br>막상 일이 닥치면 또 <span class="red">동요하지 않는</span> 모습을 보여줍니다.<br>'+
 '<span class="red">자애로운</span> 미소를 띠며 <span class="red">웃음</span>이 많기도 합니다.<br>'+
 '<span class="red">개인</span>의 일에도 힘쓰지만 서로 <span class="red">협력하는</span> 모습도 보여줍니다.<br><br>'+
 '<span class="red">낙관적인</span> 사람들이라 별로 <span class="red">두려움</span>이 없어 보입니다.<br><br>'+
 '<span class="red">친절하며</span>, <span class="red">말을 잘 듣는</span> 사람들입니다.<br>'+
 '옳지 않은 일에는 <span class="red">가차없는</span> 모습을 보이지만,<br>대부분의 일에 <span class="red">절충적인</span> 모습을 보이기도 합니다.<br>'+
 '아 <span class="red">산술(계산)</span>도 아주 잘해요!</div>'+
 '<p>뭐 이리 긴 거야?<br>그리고 왜 다 한글이야..? 나는 한글 모른다고!!<br><span class="em">쪽지의 강조된 단어를 어휘표에서 찾아, 영어 단어의 첫 글자를 차례대로 읽어보자…</span></p>';
DIARY_HTML.diary8=
 '<p class="date">2014년 5월 3일</p>'+
 '<p>오늘도 숨이 가빠왔다<br>온몸을 움직이지 못해서<br>근섬유 한 가닥으로<br>도움을 청했다</p>'+
 '<p style="text-align:center;font-size:42px;font-style:italic">help.</p>'+
 '<p>그 한 가닥조차<br><span class="em">한 번 움직이는 데에는 2초</span></p>'+
 '<p>다음에도 이런 일이 생기면<br><span class="em">마지막 마침표 뒤 5초 대기까지, 모두 몇 초가 걸릴지</span></p>';
DIARY_HTML.diary9=
 '<p class="date">2018년 3월 14일</p>'+
 '<p>이것은 내 마지막 일기이다.<br>다른 사람들은 힘을 내라고 말하지만 나는 알고 있다.<br>오늘은 내 마지막 날이다.<br>죽기 전에 내 삶을 여덟 조각으로 나누어 숨겨놓았고<br>이걸 보고 있다는 것은 자네가 내 삶을 따라왔다는 말이겠지.</p>'+
 '<p>참 많은 일들이 있었다.<br><span class="red">시간 순서대로가 아니라, 지금 생각나는대로 기억을 쌓아보자..</span></p>'+
 '<p class="em">친구들에게 좋은 별명을 얻은 날<br>우주의 시작에 대한 비밀을 알아낸 날<br>병에 걸린 사실을 알아낸 날<br>사랑받는 아들로 태어난 날<br>모두가 볼 수 있는 책을 펴낸 날<br>죽을 고비를 맞아 의사에게 연락한 날<br>교황청에 방문한 날<br>한국이라는 나라에 방문한 날</p>'+
 '<p class="red">이 여덟 가지 일을 모두 쌓아놓은 게 지금까지의 나를 말해주고 있다…</p>'+
 '<p>내 생애 가장 기뻤던 순간을 나누고 싶다.<br>하필 오늘은 내 어릴 적 별명이었던 그가 태어난 날이군..</p>';

/* ======================= 유틸 ======================= */
var $=function(s,r){return (r||document).querySelector(s);};
var $$=function(s,r){return [].slice.call((r||document).querySelectorAll(s));};
function el(t,c,h){var d=document.createElement(t);if(c)d.className=c;if(h!=null)d.innerHTML=h;return d;}
/* norm / answerCode / sealCode / U / stackOrder / bandOf / finalName / rotSig 는
   logic.js 가 전역으로 제공한다 (테스트 대상). */
function setupAnswerInput(inp){
  inp.autocomplete="off";inp.autocapitalize="none";inp.spellcheck=false;
  inp.setAttribute("pattern","[A-Za-z0-9]*");
}
/* ── 스크롤 표시 ──────────────────────────────────────────────────────
   .scrolls 영역이 실제로 넘치는지 재서, 그 위에 가장자리 오버레이를 덮는다.
   CSS 만으로는 안 된다 — 자식이 불투명 배경을 가지면 배경 그라디언트가
   가려지고, 오버레이 스크롤바는 만지기 전까지 보이지 않는다.
   오버레이는 body 에 두고 fixed 로 위치를 잡으므로 기존 레이아웃을
   건드리지 않는다. */
var _tt;
function toast(m,k){var t=$("#toast");t.textContent=m;t.className="show "+(k||"");
  clearTimeout(_tt);_tt=setTimeout(function(){t.className="";},2700);}

var KEY="nameless-classroom-v1", memo={};
var store={
 get:function(){try{return JSON.parse(localStorage.getItem(KEY));}catch(e){return memo.d||null;}},
 set:function(v){try{localStorage.setItem(KEY,JSON.stringify(v));}catch(e){memo.d=v;}},
 clr:function(){try{localStorage.removeItem(KEY);}catch(e){}memo.d=null;}};
function fresh(){return{started:false,ch:1,phase:"read",pieces:[],rot:{apple:0,compass:0,sqrt:0,sun:0,pi:0,einstein:0},
                        stack:null,revealed:0,tookD1:false,exitReady:false,done:false};}
var S=Object.assign(fresh(),store.get()||{});
/* 저장본 정합성 검사·복구는 runtime-hardening.js 의 normalizeState 한 곳에서만
   한다. 여기서 또 손보면 두 규칙이 갈라진다. */
var _saveWarned=false;
function save(){
  if(store.set(S)===false&&!_saveWarned){
    _saveWarned=true;
    toast("진행을 저장하지 못했습니다. 브라우저 저장공간을 확인해 주세요.","bad");
  }
}
function chapter(){return CH[Math.min(S.ch,8)-1];}

/* ======================= [7] 3D 교실 ======================= */
var THREE=window.THREE, renderer,scene,camera,ray,hotspots=[],frameObjs={},curtainObjs=[],
    sunLight,fillLight,ambLight,hemiLight,backLamp,screenGlow,ceilMesh,lightPools=[],lightShafts=[],dust,dustMat,groundLight,
    arrowObj,diaryObj,boardGroup,calendarObj,calendarBaseObj,postitObj,teacherGroup,extinguisherGroup,dollGroup,clockGroup,
    mathBookObj,doorPivot,rewardObjs={},clueHotObjs={},revealMovers=[],
    tChairProcedural,tMannequinProcedural,dollProcedural,extProcedural,desksProcedural,studentFurnitureG,
    trashG,trashProcedural,plantG,plantProcedural,computerG,compProcedural,mathBookG,mathBookProcedural,teacherMixer;
var yaw=0,pitch=0,SPOTS=[
 {p:[0,1.62,3.1],y:Math.PI,label:"교실 뒤"},
 {p:[0,1.62,-1.4],y:Math.PI,label:"교탁 앞"},
 {p:[-3.1,1.62,0.4],y:Math.PI*0.5,label:"창가"}];
var spotIdx=0;
/* 걸어 다니기 — 책상·교탁·사람은 통과하지 못한다 */
var keys={}, joy={x:0,z:0}, lastT=0, EYE=1.60, EYE_LOW=0.42, SPEED=3.0, crouch=false;
var IS_TOUCH=('ontouchstart' in window)||navigator.maxTouchPoints>0;
/* 충돌 박스 · 이동 판정은 logic.js (buildBlocks/canStand/collisionNormal/slideMove) */
var BLOCKS=buildBlocks();
function isTyping(){var a=document.activeElement;
  return a&&(a.tagName==="INPUT"||a.tagName==="TEXTAREA"||a.tagName==="SELECT");}
/* 인트로·모달·엔딩이 떠 있는 동안은 3D 입력 전체를 잠근다.
   runtime-hardening이 실린 뒤에는 그쪽 판정을 그대로 쓴다. */
function inputBlocked(){
  var rt=window.NAMELESS_STAGE1_RUNTIME;
  if(rt&&typeof rt.isGameplayBlocked==="function")return rt.isGameplayBlocked();
  var m=document.getElementById("modal"), i=document.getElementById("intro");
  return !!((m&&!m.classList.contains("hidden"))||(i&&!i.classList.contains("hidden")));
}
function moveStep(dt){
  if(!camera||isTyping())return;
  if(keys.lookLeft||keys.lookRight||keys.lookUp||keys.lookDown)focusTarget=null;
  yaw+=((keys.lookRight?1:0)-(keys.lookLeft?1:0))*dt*1.45*preferences.sensitivity;
  pitch+=((keys.lookUp?1:0)-(keys.lookDown?1:0))*dt*1.15*preferences.sensitivity;
  pitch=Math.max(-1.05,Math.min(1.05,pitch));
  var f=(keys.w?1:0)-(keys.s?1:0)+joy.z, r=(keys.d?1:0)-(keys.a?1:0)+joy.x;
  if(Math.abs(f)<0.02&&Math.abs(r)<0.02)return;
  var L=Math.sqrt(f*f+r*r); if(L>1){f/=L;r/=L;}
  var fx=Math.sin(yaw), fz=Math.cos(yaw);
  var rx=Math.sin(yaw-Math.PI/2), rz=Math.cos(yaw-Math.PI/2);
  var d=SPEED*dt;
  slideMove(BLOCKS,camera.position,(fx*f+rx*r)*d,(fz*f+rz*r)*d);
  camera.position.y=crouch?EYE_LOW:EYE;
}

/* 노멀/러프니스 맵은 픽셀 단위 루프라 비싸다(합계 300ms+). 부팅을 막지 않도록
   중립값으로 채운 캔버스 텍스처를 먼저 돌려주고, 실제 계산은 첫 프레임 이후
   유휴 시간에 같은 캔버스에 채워 넣은 뒤 needsUpdate만 올린다.
   머티리얼은 같은 텍스처 객체를 계속 들고 있으므로 셰이더 재컴파일이 없다. */
var _pbrJobs = [];

function blankTex(w, h, fill) {
  var c = document.createElement("canvas");
  c.width = w; c.height = h;
  var g = c.getContext("2d");
  g.fillStyle = fill; g.fillRect(0, 0, w, h);
  var t = new THREE.CanvasTexture(c);
  t.wrapS = t.wrapT = THREE.RepeatWrapping;
  t.generateMipmaps = true;
  return t;   /* CanvasTexture는 캔버스를 t.image 로 들고 있다 */
}

function fillNormalMap(tex, srcCanvas, strength) {
  var w = srcCanvas.width, h = srcCanvas.height;
  var srcData = srcCanvas.getContext("2d").getImageData(0, 0, w, h).data;
  var nCtx = tex.image.getContext("2d");
  var nImg = nCtx.createImageData(w, h);
  var dst = nImg.data;
  var s = strength === undefined ? 1.8 : strength;

  /* 휘도를 한 번만 계산하고 랩어라운드 인덱스를 미리 접어 둔다. */
  var L = new Float32Array(w * h);
  for (var i = 0, p = 0; i < w * h; i++, p += 4)
    L[i] = (srcData[p] * 0.299 + srcData[p+1] * 0.587 + srcData[p+2] * 0.114) * (1 / 255);
  var xm = new Int32Array(w), xp = new Int32Array(w);
  for (var x0 = 0; x0 < w; x0++) { xm[x0] = (x0 - 1 + w) % w; xp[x0] = (x0 + 1) % w; }

  for (var y = 0; y < h; y++) {
    var ym = ((y - 1 + h) % h) * w, y0 = y * w, yp = ((y + 1) % h) * w;
    for (var x = 0; x < w; x++) {
      var a = xm[x], c = xp[x];
      var tl = L[ym+a], t = L[ym+x], tr = L[ym+c];
      var l  = L[y0+a],              r  = L[y0+c];
      var bl = L[yp+a], b = L[yp+x], br = L[yp+c];
      var dx = ((tr + 2 * r + br) - (tl + 2 * l + bl)) * s;
      var dy = ((bl + 2 * b + br) - (tl + 2 * t + tr)) * s;
      var invLen = 1.0 / Math.sqrt(dx * dx + dy * dy + 1);
      var o = (y0 + x) * 4;
      dst[o]     = (-dx * invLen * 0.5 + 0.5) * 255;
      dst[o + 1] = (-dy * invLen * 0.5 + 0.5) * 255;
      dst[o + 2] = (invLen * 0.5 + 0.5) * 255;
      dst[o + 3] = 255;
    }
  }
  nCtx.putImageData(nImg, 0, 0);
  tex.needsUpdate = true;
}

function fillRoughnessMap(tex, srcCanvas, baseRough, variance) {
  var w = srcCanvas.width, h = srcCanvas.height;
  var srcData = srcCanvas.getContext("2d").getImageData(0, 0, w, h).data;
  var rCtx = tex.image.getContext("2d");
  var rImg = rCtx.createImageData(w, h);
  var dst = rImg.data;
  var bR = baseRough === undefined ? 0.6 : baseRough;
  var v = variance === undefined ? 0.3 : variance;

  for (var i = 0; i < srcData.length; i += 4) {
    var l = (srcData[i] * 0.299 + srcData[i+1] * 0.587 + srcData[i+2] * 0.114) / 255.0;
    var val = Math.max(0, Math.min(255, Math.floor((bR + (0.5 - l) * v) * 255)));
    dst[i] = dst[i+1] = dst[i+2] = val;
    dst[i+3] = 255;
  }
  rCtx.putImageData(rImg, 0, 0);
  tex.needsUpdate = true;
}

/* 큐에 쌓인 맵 생성을 유휴 시간에 흘려보낸다. 작은 맵은 한 번에 여러 건
   처리하고(예산 8ms), 큰 맵은 어차피 예산을 넘기므로 한 건씩 돈다. */
function runPbrJobs() {
  var budgetEnd = performance.now() + 8;
  do {
    var job = _pbrJobs.shift();
    if (!job) return;
    try { job(); } catch (err) { console.warn("PBR map job failed:", err); }
  } while (_pbrJobs.length && performance.now() < budgetEnd);
  if (!_pbrJobs.length) return;
  var next = function () { runPbrJobs(); };
  if (window.requestIdleCallback) requestIdleCallback(next, { timeout: 120 });
  else setTimeout(next, 16);
}

function pbrTex(draw, w, h, normStrength, baseRough, roughVar) {
  /* 0을 유효한 값으로 받기 위해 || 대신 undefined 검사를 쓴다. */
  if(normStrength === undefined) normStrength = 2.0;
  if(baseRough === undefined) baseRough = 0.6;
  if(roughVar === undefined) roughVar = 0.3;
  var c = document.createElement("canvas"); c.width = w || 512; c.height = h || 512;
  draw(c.getContext("2d"), c.width, c.height);
  var diff = new THREE.CanvasTexture(c);
  diff.anisotropy = Math.min(8, (renderer && renderer.capabilities.getMaxAnisotropy()) || 8);
  diff.encoding = THREE.sRGBEncoding; diff.generateMipmaps = true;
  diff.minFilter = THREE.LinearMipmapLinearFilter;
  diff.wrapS = diff.wrapT = THREE.RepeatWrapping;

  /* 중립 노멀(평면) / 중립 러프니스로 시작한다 — 첫 프레임은 이 값으로도 자연스럽다. */
  var norm = blankTex(c.width, c.height, "#8080ff");
  norm.anisotropy = diff.anisotropy;
  var rgb = Math.max(0, Math.min(255, Math.round(baseRough * 255)));
  var rough = blankTex(c.width, c.height, "rgb(" + rgb + "," + rgb + "," + rgb + ")");
  rough.anisotropy = diff.anisotropy;

  _pbrJobs.push(function () { fillNormalMap(norm, c, normStrength); });
  _pbrJobs.push(function () { fillRoughnessMap(rough, c, baseRough, roughVar); });

  return { map: diff, normalMap: norm, roughnessMap: rough, canvas: c };
}

function tex(draw,w,h){
  var c=document.createElement("canvas");c.width=w||512;c.height=h||512;
  draw(c.getContext("2d"),c.width,c.height);
  var t=new THREE.CanvasTexture(c);
  t.anisotropy=Math.min(8,(renderer&&renderer.capabilities.getMaxAnisotropy())||8);
  t.encoding=THREE.sRGBEncoding;t.generateMipmaps=true;
  t.minFilter=THREE.LinearMipmapLinearFilter;return t;
}
function imgTex(dataurl){var t=new THREE.TextureLoader().load(dataurl);
  t.anisotropy=Math.min(8,(renderer&&renderer.capabilities.getMaxAnisotropy())||8);
  t.encoding=THREE.sRGBEncoding;return t;}
var _geoCache={};
function geo(kind,args,make){
  var k=kind+":"+args.join(",");
  return _geoCache[k]||(_geoCache[k]=make());
}
function boxGeo(w,h,d){return geo("box",[w,h,d],function(){return new THREE.BoxGeometry(w,h,d);});}
function planeGeo(w,h){return geo("plane",[w,h],function(){return new THREE.PlaneGeometry(w,h);});}

function box(w,h,d,color,x,y,z){
  var m=new THREE.Mesh(boxGeo(w,h,d),
    new THREE.MeshStandardMaterial({color:color}));
  m.position.set(x,y,z);return m;
}
function plane(w,h,mat,x,y,z){
  var m=new THREE.Mesh(planeGeo(w,h),mat);m.position.set(x,y,z);return m;
}
function hot(mesh,id,name){mesh.userData.hot={id:id,name:name};hotspots.push(mesh);return mesh;}
/* 상자를 이어붙이는 대신 원통+구로 — 사람과 소품이 훨씬 그럴듯해진다 */
function limb(r1,r2,len,color,rough){
  var g=new THREE.Group();
  var m=new THREE.MeshStandardMaterial({color:color,roughness:rough===undefined?0.8:rough});
  g.add(new THREE.Mesh(new THREE.CylinderGeometry(r1,r2,len,16),m));
  var a=new THREE.Mesh(new THREE.SphereGeometry(r1,14,10),m);a.position.y= len/2;g.add(a);
  var b=new THREE.Mesh(new THREE.SphereGeometry(r2,14,10),m);b.position.y=-len/2;g.add(b);
  return g;
}
function put(o,x,y,z,rx,ry,rz){o.position.set(x,y,z);
  if(rx!==undefined)o.rotation.x=rx; if(ry!==undefined)o.rotation.y=ry; if(rz!==undefined)o.rotation.z=rz;
  return o;}
function cyl(r1,r2,h,color,x,y,z,seg,rough,rx,ry,rz){
  var sg=seg||18;
  var m=new THREE.Mesh(geo("cyl",[r1,r2,h,sg],function(){return new THREE.CylinderGeometry(r1,r2,h,sg);}),
    new THREE.MeshStandardMaterial({color:color,roughness:rough===undefined?0.8:rough}));
  m.position.set(x,y,z);
  if(rx)m.rotation.x=rx; if(ry)m.rotation.y=ry; if(rz)m.rotation.z=rz; return m;
}
function ball(r,color,x,y,z,rough){
  var m=new THREE.Mesh(geo("ball",[r],function(){return new THREE.SphereGeometry(r,18,14);}),
    new THREE.MeshStandardMaterial({color:color,roughness:rough===undefined?0.8:rough}));
  m.position.set(x,y,z);return m;
}

function buildRoom(){
  scene=new THREE.Scene();
  scene.background=new THREE.Color(0x121722);
  scene.fog=new THREE.Fog(0x284448,14,38);

  /* 자연스러운 인간 눈높이 및 원근 화각 (50° 기준) */
  camera=new THREE.PerspectiveCamera(50,innerWidth/innerHeight,0.05,80);

  /* 물리적 방향성을 지닌 조명 체계 */
  ambLight=new THREE.AmbientLight(0xc6d8dd,0.34);scene.add(ambLight);
  hemiLight=new THREE.HemisphereLight(0xd7edf0,0x887a60,0.48);scene.add(hemiLight);

  /* 창문에서 비쳐드는 주 오후 직사광 */
  sunLight=new THREE.DirectionalLight(0xffe9c9,1.25);
  sunLight.position.set(-8.5,5.8,1.2);
  sunLight.target.position.set(0.5,0.7,0.2);scene.add(sunLight.target);
  sunLight.castShadow=true;
  sunLight.shadow.mapSize.set(IS_TOUCH?1024:2048,IS_TOUCH?1024:2048);
  sunLight.shadow.bias=-0.0004;
  sunLight.shadow.normalBias=0.030;
  (function(c){c.left=-8.5;c.right=8.5;c.top=6.5;c.bottom=-6.5;c.near=0.5;c.far=30;
    c.updateProjectionMatrix();})(sunLight.shadow.camera);
  scene.add(sunLight);

  /* 교실 전체를 포근하게 채우는 앰비언트 바운스 광원 */
  groundLight=new THREE.DirectionalLight(0xdce4f0,0.25);
  groundLight.position.set(0.8,8.5,1.5);
  groundLight.target.position.set(0,0,0.5);scene.add(groundLight.target);
  scene.add(groundLight);

  fillLight=new THREE.PointLight(0xffecd0,0.28,16);
  fillLight.position.set(0,2.8,-0.5);scene.add(fillLight);
  backLamp=new THREE.PointLight(0xffecd0,0.22,14);
  backLamp.position.set(0,2.8,2.2);scene.add(backLamp);

  /* 칠판 반사광 */
  var boardBounce=new THREE.PointLight(0xc2d6cb,0.15,8);
  boardBounce.position.set(0,1.8,-2.5);scene.add(boardBounce);

  /* 교실 건축 기본 치수 (폭 10m, 깊이 8m, 천장 높이 3.1m) */
  var W=10, D=8, H=3.1;

  /* 실제 한국 학교 전통 쪽마루 바닥 (PBR 헤링본/바스켓위브 모자이크 파켓 텍스처) */
  var floorPbr=pbrTex(function(g,w,h){
    /* 바탕 깊은 원목 베이스 */
    g.fillStyle="#3e2716";g.fillRect(0,0,w,h);
    var BSIZE=128; /* 각 타일 블록 (128x128) */
    var STRIPS=4;  /* 블록당 4장의 쪽나무 (폭 32px) */
    var SW=BSIZE/STRIPS;

    for(var by=0;by<h;by+=BSIZE){
      for(var bx=0;bx<w;bx+=BSIZE){
        var isH=((bx/BSIZE)+(by/BSIZE))%2===0;
        for(var s=0;s<STRIPS;s++){
          var sx=isH?bx:bx+s*SW;
          var sy=isH?by+s*SW:by;
          var sw=isH?BSIZE:SW;
          var sh=isH?SW:BSIZE;

          /* 쪽나무마다 다른 자연스러운 오크/티크 톤 */
          var seed=Math.sin((sx*17.1+sy*31.7))*43758.5453;
          var rand=Math.abs(Math.sin(seed));
          var r=110+Math.floor(rand*22);
          var gCol=83+Math.floor(rand*16);
          var b=52+Math.floor(rand*12);
          g.fillStyle="rgb("+r+","+gCol+","+b+")";
          g.fillRect(sx+1,sy+1,sw-2,sh-2);

          /* 섬세한 나뭇결 무늬 */
          g.fillStyle="rgba(255,235,200,0.06)";
          if(isH){
            for(var gy=sy+3;gy<sy+sh-3;gy+=3){
              if(Math.sin(gy*0.4+seed)>0.2)g.fillRect(sx+2,gy,sw-4,1.2);
            }
          }else{
            for(var gx=sx+3;gx<sx+sw-3;gx+=3){
              if(Math.sin(gx*0.4+seed)>0.2)g.fillRect(gx,sy+2,1.2,sh-4);
            }
          }

          /* 홈 사이의 깊은 V-Groove 음영 */
          g.fillStyle="rgba(10,5,2,0.72)";
          if(isH){
            g.fillRect(sx,sy+sh-1,sw,1);
          }else{
            g.fillRect(sx+sw-1,sy,1,sh);
          }
        }
        /* 블록 외곽 굵은 조인트 */
        g.fillStyle="rgba(8,3,1,0.85)";
        g.strokeRect(bx+0.5,by+0.5,BSIZE,BSIZE);
      }
    }
    /* 반질반질한 학교 왁스 청소 윤택 스펙큘러 얼룩 */
    g.globalAlpha=0.07;
    for(var p=0;p<32;p++){
      var px=Math.random()*w,py=Math.random()*h,pr=70+Math.random()*160;
      var rg=g.createRadialGradient(px,py,0,px,py,pr);
      rg.addColorStop(0,"rgba(255,248,220,1)");rg.addColorStop(1,"rgba(255,248,220,0)");
      g.fillStyle=rg;g.beginPath();g.arc(px,py,pr,0,7);g.fill();
    }
    g.globalAlpha=1;
  },1024,1024, 1.6, 0.64, 0.18);
  floorPbr.map.repeat.set(4,3.2);
  floorPbr.normalMap.repeat.set(4,3.2);
  floorPbr.roughnessMap.repeat.set(4,3.2);

  var matFloor=new THREE.MeshStandardMaterial({
    map:floorPbr.map,
    normalMap:floorPbr.normalMap,
    roughnessMap:floorPbr.roughnessMap,
    roughness:0.48,
    metalness:0.03
  });

  var floor=new THREE.Mesh(new THREE.PlaneGeometry(W,D),matFloor);
  floor.rotation.x=-Math.PI/2;scene.add(floor);

  /* 천장 PBR 텍스처 */
  var ceilPbr=pbrTex(function(g,w,h){
    g.fillStyle="#d8d1c6";g.fillRect(0,0,w,h);
    g.strokeStyle="rgba(60,55,45,0.25)";g.lineWidth=3;
    for(var i=0;i<=w;i+=128){g.beginPath();g.moveTo(i,0);g.lineTo(i,h);g.stroke();}
    for(var j=0;j<=h;j+=128){g.beginPath();g.moveTo(0,j);g.lineTo(w,j);g.stroke();}
  },512,512, 1.4, 0.92, 0.12);
  ceilPbr.map.repeat.set(4,3);
  ceilPbr.normalMap.repeat.set(4,3);
  ceilPbr.roughnessMap.repeat.set(4,3);

  var matCeil=new THREE.MeshStandardMaterial({
    color:0xffffff,
    map:ceilPbr.map,
    normalMap:ceilPbr.normalMap,
    roughnessMap:ceilPbr.roughnessMap,
    roughness:0.92,
    metalness:0.0
  });
  var ceil=new THREE.Mesh(new THREE.PlaneGeometry(W,D),matCeil);
  ceil.rotation.x=Math.PI/2;ceil.position.y=H;scene.add(ceil);ceilMesh=ceil;

  /* 벽면 PBR (상단 크림 회벽 + 하단 차분한 올리브그린 도색 + 원목 걸레받이) */
  var wallPbr=pbrTex(function(g,w,h){
    var gr=g.createLinearGradient(0,0,0,h);
    gr.addColorStop(0,"#d9ddd2");gr.addColorStop(0.35,"#e7e6d9");
    gr.addColorStop(0.60,"#d9ddd1");gr.addColorStop(1,"#c0cabe");
    g.fillStyle=gr;g.fillRect(0,0,w,h);

    /* 미세 회벽 치장 요철 (Plaster stipple) */
    g.fillStyle="rgba(0,0,0,0.035)";
    for(var st=0;st<1600;st++){
      g.fillRect(Math.random()*w,Math.random()*h,Math.random()*3+1,Math.random()*2+1);
    }

    /* 하단 페인트 */
    var wy=Math.round(h*0.62);
    g.fillStyle="#476d69";g.fillRect(0,wy,w,h-wy);
    /* 몰딩 라인 */
    g.fillStyle="rgba(255,255,255,0.3)";g.fillRect(0,wy,w,3);
    g.fillStyle="rgba(20,25,20,0.45)";g.fillRect(0,wy+3,w,3);
    /* 하단 걸레받이 */
    g.fillStyle="#46301e";g.fillRect(0,h-24,w,24);
    g.fillStyle="rgba(0,0,0,0.45)";g.fillRect(0,h-4,w,4);
  },512,512, 1.8, 0.88, 0.18);
  wallPbr.map.repeat.set(3,1);
  wallPbr.normalMap.repeat.set(3,1);
  wallPbr.roughnessMap.repeat.set(3,1);

  var matWall=new THREE.MeshStandardMaterial({
    side:THREE.DoubleSide,
    map:wallPbr.map,
    normalMap:wallPbr.normalMap,
    roughnessMap:wallPbr.roughnessMap,
    roughness:0.88,
    metalness:0.0
  });

  function wall(w,h,x,y,z,ry){
    var m=new THREE.Mesh(new THREE.PlaneGeometry(w,h),matWall);
    m.position.set(x,y,z);if(ry)m.rotation.y=ry;scene.add(m);return m;
  }
  wall(W,H,0,H/2,-D/2,0);
  wall(W,H,0,H/2,D/2,Math.PI);
  wall(D,H,-W/2,H/2,0,Math.PI/2);
  wall(D,H,W/2,H/2,0,-Math.PI/2);

  /* --- 칠판 (흑록색 슬레이트 무광 법랑 칠판면 & 부드러운 분필 지우개 자국 & 정갈한 분필 글씨) --- */
  var boardPbr=pbrTex(function(g,w,h){
    // Deep authentic classroom chalkboard dark green
    g.fillStyle="#162920";g.fillRect(0,0,w,h);

    // Subtle natural chalk eraser haze & cloudy wipes (자연스러운 지우개 분말 구름 자국)
    for(var a=0;a<20;a++){
      var ax=Math.random()*w,ay=h*(0.15+Math.random()*0.7),ar=100+Math.random()*220;
      var radG=g.createRadialGradient(ax,ay,20,ax,ay,ar);
      radG.addColorStop(0,"rgba(225,238,230,0.045)");
      radG.addColorStop(0.5,"rgba(215,230,222,0.02)");
      radG.addColorStop(1,"rgba(215,230,222,0)");
      g.fillStyle=radG;g.beginPath();g.arc(ax,ay,ar,0,Math.PI*2);g.fill();
    }

    // Soft broad vertical eraser passes (세로로 쓸어내린 미세 분필 흔적)
    for(var vi=0;vi<8;vi++){
      var vx=Math.random()*w,vw=60+Math.random()*120;
      var vGrad=g.createLinearGradient(vx,0,vx+vw,0);
      vGrad.addColorStop(0,"rgba(220,235,225,0)");
      vGrad.addColorStop(0.5,"rgba(220,235,225,0.015)");
      vGrad.addColorStop(1,"rgba(220,235,225,0)");
      g.fillStyle=vGrad;g.fillRect(vx,0,vw,h);
    }

    // Microscopic chalk powder dust (미세 분필 가루 입자)
    g.fillStyle="rgba(240,250,245,0.025)";
    for(var pi=0;pi<3500;pi++){
      g.fillRect(Math.random()*w,Math.random()*h,1.5,1.5);
    }

    // Authentic Chalk Calligraphy (선명하고 정갈한 백색 분필 손글씨)
    g.fillStyle="#f2f8f4";
    g.font="600 44px 'Batang', 'Gowun Batang', serif";
    g.fillText("이 교실을 그대로 두어라.",70,120);
    g.font="500 31px 'Batang', 'Gowun Batang', serif";
    g.fillStyle="rgba(242,248,244,0.92)";
    g.fillText("내가 누구였는지 알아내는 사람에게",70,195);
    g.fillText("내 이름으로 만든 장학금 전부를 주겠다.",70,255);
  },1024,384, 0.04, 0.85, 0.08);

  var bb=plane(5.2,1.45,new THREE.MeshStandardMaterial({
    map:boardPbr.map,
    normalMap:boardPbr.normalMap,
    roughnessMap:boardPbr.roughnessMap,
    roughness:0.86,
    metalness:0.01
  }),0,1.60,-3.96);
  scene.add(bb);

  /* 정밀 헤어라인 알루미늄 외곽 프레임 */
  var alumMat=new THREE.MeshStandardMaterial({color:0xb0b6ba,roughness:0.32,metalness:0.82});
  scene.add(put(new THREE.Mesh(new THREE.BoxGeometry(5.36,0.06,0.06),alumMat),0,2.355,-3.93));
  scene.add(put(new THREE.Mesh(new THREE.BoxGeometry(5.36,0.06,0.06),alumMat),0,0.845,-3.93));
  scene.add(put(new THREE.Mesh(new THREE.BoxGeometry(0.06,1.52,0.06),alumMat),-2.65,1.60,-3.93));
  scene.add(put(new THREE.Mesh(new THREE.BoxGeometry(0.06,1.52,0.06),alumMat), 2.65,1.60,-3.93));

  /* 입체 분필 받침대 (Chalk Tray Trough) */
  var tray=new THREE.Mesh(new THREE.BoxGeometry(5.36,0.028,0.14),alumMat);
  tray.position.set(0,0.83,-3.89);scene.add(tray);
  var trayLip=new THREE.Mesh(new THREE.BoxGeometry(5.36,0.040,0.016),alumMat);
  trayLip.position.set(0,0.85,-3.82);scene.add(trayLip);

  /* 칠판 트레이 위 3D 소품: 칠판 지우개 & 분필갑 & 흩어진 분필들 */
  var eraserG=new THREE.Group();eraserG.position.set(-0.95,0.86,-3.88);
  eraserG.add(box(0.18,0.026,0.07,0xb28352,0,0.024,0)); /* 원목 손잡이 */
  eraserG.add(box(0.18,0.012,0.07,0xe0c842,0,0.005,0)); /* 노란 스펀지층 */
  eraserG.add(box(0.18,0.010,0.07,0x282c2b,0,-0.006,0));/* 흑회색 양모 펠트 */
  eraserG.rotation.y=0.22;scene.add(eraserG);

  /* 분필갑 (파란색 학교 분필 케이스 - 클릭 시 분필함 데코이) */
  var chalkBox=box(0.11,0.042,0.07,0x29649c,0.82,0.865,-3.88);
  chalkBox.rotation.y=-0.16;scene.add(chalkBox);scene.add(hot(chalkBox,"decoy:chalk","분필함"));

  var eraserH=box(0.22,0.06,0.10,0xffffff,-0.95,0.86,-3.88);
  eraserH.material.transparent=true;eraserH.material.opacity=0;scene.add(hot(eraserH,"decoy:eraser","칠판지우개"));

  /* 흩어진 3D 원통형 분필들 (백색, 노란색, 분홍색) */
  var cW=new THREE.MeshStandardMaterial({color:0xfcfcfc,roughness:0.95});
  var cY=new THREE.MeshStandardMaterial({color:0xf5e662,roughness:0.95});
  var cP=new THREE.MeshStandardMaterial({color:0xeb7898,roughness:0.95});
  [[-0.42,cW,0.1],[-0.32,cY,-0.25],[-0.24,cW,0.05],[0.55,cP,0.3],[0.64,cW,-0.12]].forEach(function(cp){
    var chk=new THREE.Mesh(new THREE.CylinderGeometry(0.006,0.006,0.07,8),cp[1]);
    chk.rotation.z=Math.PI/2;chk.rotation.y=cp[2];
    chk.position.set(cp[0],0.852,-3.88);scene.add(chk);
  });

  /* 접촉 그림자(Contact Shadow) 생성기 */
  var shadowTex=tex(function(g,w,h){
    var rg=g.createRadialGradient(w/2,h/2,0,w/2,h/2,w/2);
    rg.addColorStop(0,"rgba(0,0,0,0.76)");
    rg.addColorStop(0.48,"rgba(0,0,0,0.36)");
    rg.addColorStop(1,"rgba(0,0,0,0)");
    g.fillStyle=rg;g.fillRect(0,0,w,h);
  },128,128);
  function shadowDecal(w,d,op,x,z){
    var m=new THREE.Mesh(new THREE.PlaneGeometry(w,d),new THREE.MeshBasicMaterial({
      map:shadowTex,transparent:true,opacity:op||0.42,depthWrite:false
    }));
    m.rotation.x=-Math.PI/2;m.position.set(x,0.002,z);return m;
  }

  /* --- 중후한 원목 교탁 (10° 완만한 경사 상판, 필기구 턱, 전면 3분할 음각 몰딩, 교사용 수납공간) --- */
  scene.add(shadowDecal(2.2,1.1,0.48,0,-2.9));
  var podWood=0x5c3d24, podDark=0x3e2716, podLid=0x744d2d;
  var podiumG=new THREE.Group();podiumG.position.set(0,0,-2.9);

  podiumG.add(box(1.64,0.06,0.67,podDark,0,0.03,0)); /* 하부 기단 */
  podiumG.add(box(1.58,0.70,0.63,podWood,0,0.41,0)); /* 본체 기둥 */
  var pLid=box(1.68,0.04,0.68,podLid,0,0.785,0);     /* 상판 */
  pLid.rotation.x=0.08;podiumG.add(pLid);
  var pLip=box(1.68,0.032,0.030,0x382212,0,0.825,0.32); /* 상판 턱 */
  pLip.rotation.x=0.08;podiumG.add(pLip);

  /* 전면 3분할 음각 몰딩 패널 */
  [-0.48,0,0.48].forEach(function(px){
    podiumG.add(box(0.36,0.50,0.02,podDark,px,0.42,0.322));
    podiumG.add(box(0.32,0.46,0.015,podWood,px,0.42,0.328));
  });
  /* 측면 장식 몰딩 */
  [-1,1].forEach(function(sd){
    var sFrame=box(0.38,0.50,0.02,podDark,sd*0.795,0.42,0);
    sFrame.rotation.y=Math.PI/2;podiumG.add(sFrame);
  });
  scene.add(podiumG);

  /* 90년대 CRT 컴퓨터 (스위블 받침대 + 브라운관 하우징 + 기계식 키보드) */
  computerG=new THREE.Group();computerG.position.set(0,1.18,-2.96);scene.add(computerG);window.computerG=computerG;

  // Swivel Pedestal Base and Neck
  computerG.add(box(0.38,0.024,0.34,0x242830,0,0.795-1.18,0.01));
  computerG.add(cyl(0.075,0.085,0.05,0x2d323b,0,0.83-1.18,0.01,16,0.5));

  // CRT Main Housing & Cathode Funnel
  computerG.add(box(0.86,0.58,0.22,0x292e38,0,0,-0.11)); /* 모니터 본체 섀시 */
  computerG.add(box(0.66,0.44,0.22,0x1f232b,0,0,-0.31)); /* 브라운관 후면 튜브 테이퍼 */
  /* 측면/상단 환기 루버 슬릿 */
  for(var vi=0;vi<5;vi++){
    computerG.add(box(0.40,0.006,0.18,0x14161a,0,0.29-0.005,-0.12+vi*0.035));
  }

  /* 전면 베젤 (0.78 x 0.48 스크린을 감싸는 입체 프레임) */
  computerG.add(box(0.86,0.055,0.06,0x2e3540,0,0.265,0.01)); /* 상단 베젤 */
  computerG.add(box(0.86,0.085,0.06,0x2e3540,0,-0.245,0.01)); /* 하단 턱 */
  computerG.add(box(0.05,0.48,0.06,0x2e3540,-0.405,0.01,0.01)); /* 좌측 베젤 */
  computerG.add(box(0.05,0.48,0.06,0x2e3540, 0.405,0.01,0.01)); /* 우측 베젤 */
  computerG.add(box(0.82,0.52,0.02,0x121418,0,0.01,-0.01)); /* 화면 백플레이트 */

  /* 하단 조작부 (플로피 슬롯, 전원 스위치, 조절 다이얼, 전원 LED) */
  computerG.add(box(0.14,0.008,0.01,0x101216,-0.24,-0.24,0.045)); /* 3.5인치 FDD 슬롯 */
  computerG.add(box(0.016,0.012,0.01,0x3e4552,-0.15,-0.24,0.045)); /* FDD 사출 버튼 */
  computerG.add(cyl(0.011,0.011,0.012,0x444b58,0.18,-0.24,0.045,10,0.5)); /* 밝기 다이얼 */
  computerG.add(cyl(0.011,0.011,0.012,0x444b58,0.23,-0.24,0.045,10,0.5)); /* 대비 다이얼 */
  computerG.add(box(0.024,0.020,0.014,0x8b2b24,0.32,-0.24,0.045)); /* 적색 전원 로커 스위치 */
  computerG.add(ball(0.007,0x3de874,0.365,-0.24,0.052,0.2)); /* 녹색 전원 LED */

  /* 정밀 104키 기계식 키보드 & 마우스 */
  var kbPbr=pbrTex(function(g,w,h){
    g.fillStyle="#252930";g.fillRect(0,0,w,h);
    g.strokeStyle="#1a1d22";g.lineWidth=2;g.strokeRect(3,3,w-6,h-6);
    function k(kx,ky,kw,kh,label,col,tcol){
      g.fillStyle=col||"#3a414d";g.fillRect(kx,ky,kw,kh);
      g.strokeStyle="#1c2026";g.lineWidth=1;g.strokeRect(kx,ky,kw,kh);
      g.fillStyle="rgba(255,255,255,0.14)";g.fillRect(kx+1,ky+1,kw-2,2);
      if(label){g.fillStyle=tcol||"#c8ced8";g.font="bold 8px sans-serif";g.fillText(label,kx+2.5,ky+kh-3);}
    }
    k(6,6,12,9,"Esc","#4a3232");
    for(var f=0;f<12;f++){k(24+f*13+Math.floor(f/4)*5,6,11,9,"F"+(f+1));}
    var r1=["`","1","2","3","4","5","6","7","8","9","0","-","=","←"];
    var rx=6;for(var i=0;i<r1.length;i++){var kw=(i===13)?22:11;k(rx,18,kw,10,r1[i]);rx+=kw+1.5;}
    var r2=["Tab","Q","W","E","R","T","Y","U","I","O","P","[","]","\\"];
    rx=6;for(var i=0;i<r2.length;i++){var kw=(i===0||i===13)?16:11;k(rx,30,kw,10,r2[i]);rx+=kw+1.5;}
    var r3=["Caps","A","S","D","F","G","H","J","K","L",";","'","↵"];
    rx=6;for(var i=0;i<r3.length;i++){var kw=(i===0)?19:(i===12)?22:11;k(rx,42,kw,10,r3[i],i===12?"#344458":null);rx+=kw+1.5;}
    var r4=["⇧","Z","X","C","V","B","N","M",",",".","/","⇧"];
    rx=6;for(var i=0;i<r4.length;i++){var kw=(i===0||i===11)?24:11;k(rx,54,kw,10,r4[i]);rx+=kw+1.5;}
    k(6,66,16,11,"Ctrl");k(24,66,13,11,"Alt");k(39,66,76,11,"","#2f3540");k(117,66,13,11,"Alt");k(132,66,16,11,"Ctrl");
    for(var nr=0;nr<4;nr++)for(var nc=0;nc<3;nc++){k(162+nc*11,18+nr*12,9.5,10);}
    g.fillStyle="#2ecc71";g.fillRect(163,8,3,3);g.fillRect(174,8,3,3);g.fillRect(185,8,3,3);
  },200,80,1.2,0.45,0.15);

  var kbMat=new THREE.MeshStandardMaterial({map:kbPbr.map,normalMap:kbPbr.normalMap,roughnessMap:kbPbr.roughnessMap,roughness:0.55,metalness:0.1});
  var kbBody=box(0.50,0.024,0.17,0x22262d,0,0.805-1.18,0.25);
  kbBody.rotation.x=-0.09;
  var kbFace=plane(0.48,0.155,kbMat,0,0.013,0);
  kbFace.rotation.x=-Math.PI/2;
  kbBody.add(kbFace);
  computerG.add(kbBody);

  /* 마우스패드 & 투버튼 볼마우스 */
  var mPad=box(0.20,0.003,0.20,0x191c22,0.36,0.796-1.18,0.24);computerG.add(mPad);
  var mouse=box(0.065,0.028,0.10,0x353b45,0.36,0.812-1.18,0.24);computerG.add(mouse);
  computerG.add(box(0.002,0.008,0.045,0x1c1f26,0.36,0.826-1.18,0.265));

  /* 컴퓨터 모니터 화면 (단말기 단일 스크린 - 베젤에 완벽 밀착) */
  var screenMat=new THREE.MeshBasicMaterial({map:tex(function(g,w,h){
      g.fillStyle="#06131a";g.fillRect(0,0,w,h);
      g.strokeStyle="#63c3b2";g.lineWidth=3;g.strokeRect(20,20,w-40,h-40);
      g.fillStyle="#63c3b2";g.font="700 32px monospace";g.fillText("ENTER PASSWORD",48,96);
      g.fillStyle="#0d2b34";g.fillRect(48,135,w-96,68);
      g.fillStyle="#8fe6d6";g.font="600 36px monospace";g.fillText("_ _ _ _ _",72,185);
      g.fillStyle="#3d6d78";g.font="500 22px monospace";g.fillText("scholarship terminal",48,270);
    },640,384)});
  var screen=plane(0.78,0.48,screenMat,0,0.01,0.02);
  computerG.add(hot(screen,"computer","컴퓨터"));
  screenGlow=new THREE.PointLight(0x63c3b2,0.55,3.4);screenGlow.position.set(0,1.2,-2.6);scene.add(screenGlow);

  /* 탁상달력 (Chapter 1 Clue) */
  var calMat=new THREE.MeshStandardMaterial({map:tex(function(g,w,h){
      g.fillStyle="#f4ecd9";g.fillRect(0,0,w,h);
      g.fillStyle="#a03528";g.fillRect(0,0,w,48);
      g.fillStyle="#fff";g.font="700 26px sans-serif";g.fillText("CALENDAR",16,34);
      g.strokeStyle="#8b806d";g.lineWidth=2;
      for(var rr=0;rr<4;rr++)for(var cc=0;cc<7;cc++){
        g.strokeRect(16+cc*31,64+rr*26,25,20);
      }
    },256,192)});
  var cal=new THREE.Mesh(new THREE.BoxGeometry(0.28,0.20,0.02),calMat);
  cal.rotation.x=-0.24; /* 위치는 REVEAL_ANCHORS가 정한다 */
  calendarObj=cal;scene.add(hot(cal,"calendar","탁상달력"));
  calendarBaseObj=box(0.30,0.02,0.14,0xb08a5c,0,0,0);scene.add(calendarBaseObj);

  /* 지구본 (교탁 위 소품) */
  /* --- 지구본 (정밀 세계지도 텍스처 & 앤티크 황동 자오선 아크 & 원목 스탠드) --- */
  var globeG=new THREE.Group();globeG.position.set(-0.62,0.80,-2.88);
  var GR=0.098;

  // 1. World Map Texture (1024 x 512)
  var earthMapTex=tex(function(g,w,h){
    // Deep ocean blue with turquoise coastal tint
    var oceanGrad=g.createRadialGradient(w*0.5,h*0.5,50,w*0.5,h*0.5,w*0.6);
    oceanGrad.addColorStop(0,"#1c4a70");
    oceanGrad.addColorStop(1,"#143552");
    g.fillStyle=oceanGrad;g.fillRect(0,0,w,h);

    // Graticule (위도 / 경도 보조선)
    g.strokeStyle="rgba(255,255,255,0.08)";g.lineWidth=1;
    for(var lat=1;lat<6;lat++){
      var ly=h*lat/6;
      g.beginPath();g.moveTo(0,ly);g.lineTo(w,ly);g.stroke();
    }
    for(var lon=0;lon<12;lon++){
      var lx=w*lon/12;
      g.beginPath();g.moveTo(lx,0);g.lineTo(lx,h);g.stroke();
    }
    // Equator (적도 - 골드 라인)
    g.strokeStyle="rgba(225,188,90,0.35)";g.lineWidth=1.8;
    g.beginPath();g.moveTo(0,h*0.5);g.lineTo(w,h*0.5);g.stroke();
    // Tropics (회귀선 - 점선)
    g.setLineDash([4,4]);
    g.strokeStyle="rgba(225,188,90,0.22)";
    g.beginPath();g.moveTo(0,h*(0.5-0.13));g.lineTo(w,h*(0.5-0.13));g.stroke();
    g.beginPath();g.moveTo(0,h*(0.5+0.13));g.lineTo(w,h*(0.5+0.13));g.stroke();
    g.setLineDash([]);

    function drawLand(pts, fillCol, coastCol){
      g.strokeStyle=coastCol||"rgba(56,150,195,0.35)";g.lineWidth=6;g.lineJoin="round";
      g.beginPath();
      for(var i=0;i<pts.length;i++){
        var p=pts[i];
        if(i===0)g.moveTo(p[0]*w,p[1]*h);else g.lineTo(p[0]*w,p[1]*h);
      }
      g.closePath();g.stroke();
      g.fillStyle=fillCol||"#437748";g.fill();
    }

    // 1) Eurasia
    drawLand([
      [0.47,0.28],[0.49,0.21],[0.53,0.18],[0.58,0.15],[0.63,0.14],[0.70,0.14],[0.78,0.13],
      [0.86,0.13],[0.94,0.14],[0.98,0.17],[0.97,0.26],[0.93,0.32],[0.87,0.36],[0.83,0.44],
      [0.81,0.52],[0.77,0.56],[0.74,0.47],[0.72,0.58],[0.69,0.44],[0.63,0.40],[0.58,0.37],
      [0.55,0.43],[0.51,0.38],[0.48,0.41],[0.46,0.36],[0.47,0.28]
    ],"#447545");
    drawLand([[0.57,0.38],[0.64,0.39],[0.67,0.46],[0.62,0.49],[0.58,0.45]],"#c2974a"); // Middle East
    drawLand([[0.72,0.26],[0.82,0.25],[0.85,0.32],[0.75,0.33]],"#bfa052"); // Gobi
    drawLand([[0.85,0.34],[0.865,0.35],[0.86,0.40],[0.845,0.37]],"#39683d"); // Korea
    drawLand([[0.88,0.33],[0.91,0.37],[0.90,0.42],[0.87,0.39]],"#3b6c40"); // Japan

    // 2) Africa
    drawLand([
      [0.46,0.39],[0.56,0.39],[0.62,0.44],[0.65,0.48],[0.62,0.58],[0.59,0.68],[0.56,0.73],
      [0.53,0.73],[0.50,0.65],[0.49,0.55],[0.44,0.50],[0.45,0.43],[0.46,0.39]
    ],"#3d683f");
    drawLand([[0.46,0.40],[0.58,0.40],[0.61,0.46],[0.50,0.50],[0.45,0.46]],"#c99a4e"); // Sahara

    // 3) North America
    drawLand([
      [0.05,0.18],[0.14,0.17],[0.22,0.15],[0.31,0.14],[0.34,0.22],[0.31,0.31],[0.27,0.38],
      [0.24,0.48],[0.21,0.46],[0.18,0.39],[0.14,0.38],[0.10,0.28],[0.04,0.25],[0.05,0.18]
    ],"#4a784c");
    drawLand([[0.36,0.08],[0.43,0.08],[0.44,0.18],[0.38,0.22],[0.34,0.16]],"#dcebf2","#a8cde0"); // Greenland

    // 4) South America
    drawLand([
      [0.26,0.45],[0.34,0.46],[0.41,0.54],[0.39,0.68],[0.34,0.80],[0.31,0.82],[0.29,0.75],
      [0.27,0.58],[0.26,0.45]
    ],"#326336");

    // 5) Australia & Oceania
    drawLand([
      [0.82,0.64],[0.89,0.60],[0.94,0.63],[0.93,0.74],[0.85,0.73],[0.82,0.64]
    ],"#ba7438");
    drawLand([[0.95,0.75],[0.97,0.76],[0.96,0.82],[0.94,0.80]],"#3f6e43"); // New Zealand

    // 6) Antarctica
    drawLand([
      [0.0,0.88],[0.2,0.86],[0.4,0.89],[0.6,0.87],[0.8,0.88],[1.0,0.86],
      [1.0,1.0],[0.0,1.0]
    ],"#e4f0f7","#bed9eb");

    // Title cartouche in South Pacific
    g.fillStyle="rgba(242,234,214,0.85)";
    g.fillRect(100,320,130,46);
    g.strokeStyle="#b8934a";g.lineWidth=2;
    g.strokeRect(102,322,126,42);
    g.fillStyle="#3d2c16";g.font="bold 12px serif";g.textAlign="center";
    g.fillText("TERRESTRIAL GLOBE",165,340);
    g.font="italic 10px serif";
    g.fillText("1:40,000,000",165,355);
  }, 1024, 512);

  // 2. Hardware: Turned Mahogany Wood & Polished Brass
  var baseWood=new THREE.MeshStandardMaterial({color:0x462714,roughness:0.55,metalness:0.1});
  var brassMat=new THREE.MeshStandardMaterial({color:0xdfb552,roughness:0.25,metalness:0.85});

  // Base tiered plinth
  var baseFoot=new THREE.Mesh(new THREE.CylinderGeometry(0.092,0.096,0.016,28),baseWood);baseFoot.position.y=0.008;globeG.add(baseFoot);
  var baseT2=new THREE.Mesh(new THREE.CylinderGeometry(0.076,0.086,0.018,28),baseWood);baseT2.position.y=0.024;globeG.add(baseT2);
  var collar=new THREE.Mesh(new THREE.CylinderGeometry(0.026,0.038,0.012,20),brassMat);collar.position.y=0.038;globeG.add(collar);

  // Turned Center Spindle
  var stem=new THREE.Mesh(new THREE.CylinderGeometry(0.012,0.016,0.055,16),brassMat);stem.position.y=0.068;globeG.add(stem);
  var stemBall=new THREE.Mesh(new THREE.SphereGeometry(0.017,16,12),brassMat);stemBall.position.y=0.100;globeG.add(stemBall);

  // 3. Brass Semi-Meridian Arm (자오선 환)
  var meridianG=new THREE.Group();meridianG.position.set(0,0.11,0);
  var merGeom=new THREE.TorusGeometry(GR+0.014,0.005,12,48,Math.PI*1.08);
  var merRing=new THREE.Mesh(merGeom,brassMat);
  merRing.rotation.y=Math.PI/2;merRing.rotation.z=-0.41;merRing.position.y=-0.005;
  meridianG.add(merRing);

  // North & South Pole Pins
  var polePinN=new THREE.Mesh(new THREE.CylinderGeometry(0.0035,0.0035,0.03,8),brassMat);
  polePinN.position.set(-Math.sin(0.41)*(GR+0.008),Math.cos(0.41)*(GR+0.008),0);
  polePinN.rotation.z=-0.41;meridianG.add(polePinN);
  var finialN=new THREE.Mesh(new THREE.SphereGeometry(0.008,12,10),brassMat);
  finialN.position.set(-Math.sin(0.41)*(GR+0.022),Math.cos(0.41)*(GR+0.022),0);
  meridianG.add(finialN);

  globeG.add(meridianG);

  // 4. Earth Sphere with 23.5° Axial Tilt & Spin
  var earthPivot=new THREE.Group();earthPivot.position.set(0,0.11,0);
  earthPivot.rotation.z=-0.41; // 23.5도 지구 자전축 기울기

  var earthMat=new THREE.MeshStandardMaterial({
    map:earthMapTex,
    roughness:0.42,
    metalness:0.04
  });
  var earthMesh=new THREE.Mesh(new THREE.SphereGeometry(GR,36,28),earthMat);
  earthPivot.add(earthMesh);
  globeG.add(earthPivot);

  window.earthMesh=earthMesh;
  window.globeSpinVel=0.003;

  scene.add(globeG);
  var gH=box(0.28,0.34,0.28,0xffffff,-0.62,0.92,-2.88);
  gH.material.transparent=true;gH.material.opacity=0;scene.add(hot(gH,"decoy:globe","지구본"));

  /* --- 감독교사 (안정적인 인체 비율 & 앤티크 암체어) --- */
  var tG=new THREE.Group();teacherGroup=tG;window.teacherGroup=tG;
  tG.add(put(shadowDecal(0.85,0.85,0.42,0,0),0,0.002,0.06));

  /* 앤티크 원목 의자 (3D 에셋 로드 시 대체 가능한 그룹) */
  tChairProcedural=new THREE.Group();tG.add(tChairProcedural);window.tChairProcedural=tChairProcedural;
  var woodCh=0x5c422c, padCol=0x261e18;
  tChairProcedural.add(box(0.52,0.05,0.50,woodCh,0,0.42,0.06));
  tChairProcedural.add(box(0.48,0.04,0.46,padCol,0,0.46,0.06));
  tChairProcedural.add(box(0.44,0.48,0.04,padCol,0,0.72,-0.15));
  tChairProcedural.add(box(0.52,0.05,0.05,woodCh,0,0.96,-0.15));
  tChairProcedural.add(cyl(0.016,0.016,0.54,woodCh,-0.22,0.70,-0.15,12,0.5));
  tChairProcedural.add(cyl(0.016,0.016,0.54,woodCh, 0.22,0.70,-0.15,12,0.5));
  [-0.12,0,0.12].forEach(function(spx){
    tChairProcedural.add(cyl(0.010,0.010,0.44,woodCh,spx,0.70,-0.15,8,0.5));
  });
  [-1,1].forEach(function(sd){
    tChairProcedural.add(cyl(0.014,0.014,0.20,woodCh,sd*0.24,0.53,0.18,10,0.5));
    tChairProcedural.add(box(0.05,0.026,0.38,woodCh,sd*0.24,0.63,0.04));
  });
  [[-0.20,-0.15],[0.20,-0.15],[-0.20,0.22],[0.20,0.22]].forEach(function(o){
    tChairProcedural.add(cyl(0.018,0.014,0.41,woodCh,o[0],0.205,0.06+o[1],10,0.5));
  });
  [-1,1].forEach(function(sd){
    var sb=cyl(0.010,0.010,0.36,woodCh,sd*0.20,0.14,0.08,8,0.5);
    sb.rotation.x=Math.PI/2;tChairProcedural.add(sb);
  });
  var fb=cyl(0.010,0.010,0.40,woodCh,0,0.14,0.27,8,0.5);
  fb.rotation.z=Math.PI/2;tChairProcedural.add(fb);

  /* 인체: 묵직한 네이비 수트 & 단정한 감독교사 착석 자세 (3D 에셋 로드 시 대체 가능한 그룹) */
  tMannequinProcedural=new THREE.Group();tG.add(tMannequinProcedural);window.tMannequinProcedural=tMannequinProcedural;
  var coat=0x2c3542, skin=0xdcbb9d, trous=0x222832, shoe=0x18181a, hairCol=0x383028;
  var pelvis=ball(0.145,trous,0,0.53,0.10);pelvis.scale.set(1.3,0.82,1.0);tMannequinProcedural.add(pelvis);
  var torso=cyl(0.165,0.20,0.44,coat,0,0.79,0.055,20,0.82);torso.rotation.x=-0.09;tMannequinProcedural.add(torso);
  var chest=ball(0.185,coat,0,0.98,0.035);chest.scale.set(1.28,0.86,0.92);tMannequinProcedural.add(chest);
  tMannequinProcedural.add(cyl(0.052,0.062,0.10,skin,0,1.09,0.02,14,0.72));
  var head=ball(0.126,skin,0,1.235,0.022,0.72);head.scale.set(1,1.15,1.04);tMannequinProcedural.add(head);
  var hair=ball(0.133,hairCol,0,1.265,0.006,0.86);hair.scale.set(1.02,1.0,1.04);tMannequinProcedural.add(hair);
  var nape=ball(0.108,hairCol,0,1.20,-0.045,0.86);nape.scale.set(1,0.86,0.8);tMannequinProcedural.add(nape);

  /* 화이트 셔츠 깃 & 와인색 타이 */
  tMannequinProcedural.add(box(0.08,0.20,0.01,0xf5f3ed,0,0.95,0.155));
  tMannequinProcedural.add(box(0.028,0.20,0.015,0x82242a,0,0.93,0.162));
  tMannequinProcedural.add(box(0.034,0.034,0.02,0x82242a,0,1.04,0.164));
  [-1,1].forEach(function(sd){
    var lap=box(0.048,0.20,0.016,coat,sd*0.062,0.94,0.160);
    lap.rotation.z=sd*0.14;tMannequinProcedural.add(lap);
  });

  /* 금테 안경 */
  var glassMat=new THREE.MeshStandardMaterial({color:0xd4aa4a,roughness:0.35,metalness:0.75});
  [-1,1].forEach(function(sd){
    var rim=new THREE.Mesh(new THREE.TorusGeometry(0.022,0.0026,8,20),glassMat);
    rim.position.set(sd*0.044,1.235,0.145);tMannequinProcedural.add(rim);
    tMannequinProcedural.add(box(0.003,0.003,0.11,0xd4aa4a,sd*0.068,1.235,0.08));
  });
  tMannequinProcedural.add(box(0.022,0.003,0.003,0xd4aa4a,0,1.235,0.145));

  /* 양팔 (어깨 -> 팔꿈치 -> 무릎 위로 자연스럽게 얹은 손) */
  [-1,1].forEach(function(sd){
    tMannequinProcedural.add(put(limb(0.062,0.052,0.29,coat), sd*0.222,0.875,0.015, -0.26));
    tMannequinProcedural.add(put(limb(0.052,0.046,0.27,coat), sd*0.208,0.700,0.215, -1.24));
    var hand=ball(0.052,skin,sd*0.198,0.665,0.345,0.7);
    hand.scale.set(1,0.8,1.25);tMannequinProcedural.add(hand);
    tMannequinProcedural.add(put(limb(0.098,0.086,0.34,trous), sd*0.118,0.525,0.295, Math.PI/2));
    tMannequinProcedural.add(put(limb(0.078,0.062,0.40,trous), sd*0.118,0.265,0.470, 0.06));
    tMannequinProcedural.add(box(0.115,0.075,0.25,shoe,sd*0.118,0.042,0.520));
    tMannequinProcedural.add(ball(0.058,shoe,sd*0.118,0.052,0.615,0.5));
  });

  /* "감독교사" 명찰 핀 */
  var tagMat=new THREE.MeshStandardMaterial({map:tex(function(g,w,h){
    g.fillStyle="#f8f6f0";g.fillRect(0,0,w,h);
    g.fillStyle="#1c4438";g.fillRect(0,0,w,14);
    g.strokeStyle="#b8a788";g.lineWidth=2;g.strokeRect(1,1,w-2,h-2);
    g.fillStyle="#2b2419";g.textAlign="center";g.textBaseline="middle";
    g.font="900 32px 'Gothic A1',sans-serif";g.fillText("감독교사",w/2,h/2+5);
  },240,90)});
  var tag=plane(0.12,0.045,tagMat,0.11,0.93,0.175);tMannequinProcedural.add(tag);
  scene.add(tG);

  /* 감독교사 인터랙션 히트박스 */
  var tBack=box(0.85,1.35,0.70,0x36414f,3.1,0.9,-3.42);
  tBack.material.transparent=true;tBack.material.opacity=0;
  scene.add(hot(tBack,"teacher","감독교사"));

  /* --- 학생 책상 & 의자 (KS G 2603 학교 표준 규격: 책상 68cm x 46cm, 높이 72cm) --- */
  var deskTops=[];
  var deskPbr=pbrTex(function(g,w,h){
    var gr=g.createLinearGradient(0,0,w,0);
    gr.addColorStop(0,"#a88258");gr.addColorStop(0.3,"#bd966b");gr.addColorStop(0.7,"#c9a376");gr.addColorStop(1,"#a57e53");
    g.fillStyle=gr;g.fillRect(0,0,w,h);
    /* 고운 자작나무 섬유결 */
    g.fillStyle="rgba(255,245,225,0.08)";
    for(var gi=0;gi<h;gi+=3){
      if(Math.sin(gi*0.28)>0.12)g.fillRect(0,gi,w,1.5);
    }
    /* 학생들의 볼펜/연필 낙서 및 세월의 미세 마모 흔적 */
    g.fillStyle="rgba(45,30,15,0.14)";
    for(var s=0;s<45;s++){
      g.fillRect(Math.random()*w,Math.random()*h,Math.random()*36+6,1.2);
    }
    /* 테두리 부드러운 라운딩 음영 */
    g.strokeStyle="rgba(60,40,20,0.3)";g.lineWidth=4;
    g.strokeRect(4,4,w-8,h-8);
  },512,512, 2.0, 0.42, 0.28);

  var deskMat=new THREE.MeshStandardMaterial({
    map:deskPbr.map,
    normalMap:deskPbr.normalMap,
    roughnessMap:deskPbr.roughnessMap,
    roughness:0.45,
    metalness:0.02
  });

  var chWoodMat=new THREE.MeshStandardMaterial({
    map:deskPbr.map,
    normalMap:deskPbr.normalMap,
    roughnessMap:deskPbr.roughnessMap,
    roughness:0.52,
    metalness:0.02
  });

  var rivetMat=new THREE.MeshStandardMaterial({color:0xb0b5b8,roughness:0.35,metalness:0.85});
  var legCol=0x2e3532, rubCol=0x151618, trayCol=0x262b29;

  desksProcedural=new THREE.Group();scene.add(desksProcedural);window.desksProcedural=desksProcedural;
  studentFurnitureG=new THREE.Group();scene.add(studentFurnitureG);window.studentFurnitureG=studentFurnitureG;

  for(var r=0;r<2;r++)for(var c=0;c<3;c++){
    if(r===0&&c===1)continue;
    var deskPosition=deskAt(r,c),x=deskPosition.x,z=deskPosition.z;
    /* 바닥 접촉 그림자 (책상 및 의자) */
    desksProcedural.add(shadowDecal(1.10,0.80,0.40,x,z));
    desksProcedural.add(shadowDecal(0.65,0.65,0.32,x,z+0.38));

    /* 원목 상판 (인체공학적 코너 라운딩, 펜 홈) */
    var top=new THREE.Mesh(new THREE.BoxGeometry(0.68,0.035,0.46),deskMat);
    top.position.set(x,0.72,z);desksProcedural.add(top);deskTops.push(top);
    desksProcedural.add(box(0.70,0.016,0.48,0x72502e,x,0.702,z)); /* 하단 오크 엣지 밴딩 */
    desksProcedural.add(box(0.48,0.007,0.026,0x52361b,x,0.739,z-0.16)); /* 상판 펜 굴림 홈 */

    /* 스틸 튜브 다리 & 고무 발 */
    [[-0.30,-0.18],[0.30,-0.18],[-0.30,0.18],[0.30,0.18]].forEach(function(o){
      desksProcedural.add(cyl(0.015,0.015,0.69,legCol,x+o[0],0.355,z+o[1],12,0.45));
      desksProcedural.add(cyl(0.019,0.019,0.032,rubCol,x+o[0],0.016,z+o[1],12,0.85));
    });
    /* 책상 좌우 하부 수평 파이프 보강 */
    var cp1=cyl(0.011,0.011,0.36,legCol,x-0.30,0.22,z,8,0.45);cp1.rotation.x=Math.PI/2;desksProcedural.add(cp1);
    var cp2=cyl(0.011,0.011,0.36,legCol,x+0.30,0.22,z,8,0.45);cp2.rotation.x=Math.PI/2;desksProcedural.add(cp2);

    /* 책상 측면 가방걸이 고리 (Bag Hooks - 좌우 각 1개) */
    [-1,1].forEach(function(sd){
      var hook=new THREE.Mesh(new THREE.TorusGeometry(0.018,0.0035,6,12,Math.PI),
        new THREE.MeshStandardMaterial({color:0xb0b5b8,roughness:0.35,metalness:0.8}));
      hook.position.set(x+sd*0.31,0.64,z-0.08);hook.rotation.z=sd*Math.PI/2;desksProcedural.add(hook);
    });

    /* 책상 밑 철제 타공 책 보관 바구니 (Book storage tray basket) */
    desksProcedural.add(box(0.58,0.012,0.34,trayCol,x,0.58,z));       /* 바닥판 */
    desksProcedural.add(box(0.58,0.080,0.010,trayCol,x,0.62,z-0.165)); /* 후면 차단판 */
    desksProcedural.add(box(0.010,0.080,0.34,trayCol,x-0.285,0.62,z)); /* 좌측 측판 */
    desksProcedural.add(box(0.010,0.080,0.34,trayCol,x+0.285,0.62,z)); /* 우측 측판 */

    /* 학생 의자 (인체공학적 곡면 성형 합판 + 리벳 헤드) */
    var seat=new THREE.Mesh(new THREE.BoxGeometry(0.40,0.028,0.38),chWoodMat);
    seat.position.set(x,0.43,z+0.38);desksProcedural.add(seat);
    var backrest=new THREE.Mesh(new THREE.BoxGeometry(0.38,0.18,0.024),chWoodMat);
    backrest.position.set(x,0.76,z+0.52);desksProcedural.add(backrest);
    /* 의자 프레임 고정 리벳 (Silver Dome Rivets) */
    [[-0.14,-0.12],[0.14,-0.12],[-0.14,0.12],[0.14,0.12]].forEach(function(ro){
      var rvt=new THREE.Mesh(new THREE.SphereGeometry(0.005,8,6),rivetMat);
      rvt.position.set(x+ro[0],0.446,z+0.38+ro[1]);desksProcedural.add(rvt);
    });
    [[-0.14,0.04],[0.14,0.04],[-0.14,-0.04],[0.14,-0.04]].forEach(function(rbo){
      var rvtB=new THREE.Mesh(new THREE.SphereGeometry(0.005,8,6),rivetMat);
      rvtB.position.set(x+rbo[0],0.76+rbo[1],z+0.534);desksProcedural.add(rvtB);
    });

    /* 의자 다리 프레임 & 고무 패드 */
    [[-0.16,-0.14],[0.16,-0.14],[-0.16,0.14],[0.16,0.14]].forEach(function(o){
      desksProcedural.add(cyl(0.013,0.013,0.42,legCol,x+o[0],0.21,z+0.38+o[1],8,0.45));
      desksProcedural.add(cyl(0.016,0.016,0.022,rubCol,x+o[0],0.011,z+0.38+o[1],8,0.85));
    });
    desksProcedural.add(cyl(0.011,0.011,0.36,legCol,x-0.14,0.60,z+0.51,8,0.45));
    desksProcedural.add(cyl(0.011,0.011,0.36,legCol,x+0.14,0.60,z+0.51,8,0.45));
  }
  /* 앞줄 왼쪽 책상 밑면에 붙은 포스트잇 — 숙여야 보인다 */
  var postMat=new THREE.MeshStandardMaterial({map:tex(function(g,w,h){
      g.fillStyle="#f2e56a";g.fillRect(0,0,w,h);
      g.strokeStyle="rgba(120,110,30,.5)";g.lineWidth=3;g.strokeRect(2,2,w-4,h-4);
      g.strokeStyle="rgba(60,55,20,.55)";g.lineWidth=4;
      for(var i=0;i<4;i++){g.beginPath();g.moveTo(18,34+i*26);
        g.lineTo(w-18-(i===3?40:0),34+i*26);g.stroke();}
    },160,140), side: THREE.DoubleSide});
  var post=new THREE.Mesh(new THREE.PlaneGeometry(0.25,0.20),postMat);
  post.rotation.x=-Math.PI/2;postitObj=post;
  scene.add(hot(post,"postit","쪽지"));

  /* 첫 일기 — 입구 앞 책상 위 */
  var d1Mat=new THREE.MeshStandardMaterial({map:tex(function(g,w,h){
      g.fillStyle="#f5eeda";g.fillRect(0,0,w,h);
      g.strokeStyle="rgba(90,78,55,.45)";g.lineWidth=3;
      for(var i=0;i<9;i++){g.beginPath();g.moveTo(26,34+i*26);
        g.lineTo(w-26-(i%3===2?70:0),34+i*26);g.stroke();}
      g.strokeStyle="rgba(160,53,40,.75)";g.lineWidth=4;
      g.beginPath();g.moveTo(26,20);g.lineTo(150,20);g.stroke();
    },300,280)});
  diaryObj=new THREE.Mesh(new THREE.BoxGeometry(0.24,0.006,0.20),d1Mat);
  diaryObj.position.set(0.90,0.738,1.35);diaryObj.rotation.y=0.16;
  scene.add(hot(diaryObj,"diary1obj","일기"));
  arrowObj=new THREE.Group();
  var acone=new THREE.Mesh(new THREE.ConeGeometry(0.065,0.14,4),
    new THREE.MeshBasicMaterial({color:0xffd06a}));
  acone.rotation.x=Math.PI;acone.rotation.y=Math.PI/4;arrowObj.add(acone);
  var astem=new THREE.Mesh(new THREE.BoxGeometry(0.03,0.11,0.03),
    new THREE.MeshBasicMaterial({color:0xffd06a}));
  astem.position.y=0.12;arrowObj.add(astem);
  arrowObj.position.set(0.90,1.08,1.35);
  scene.add(arrowObj);

  /* 수학책 (앞줄 가운데 책상 위) */
  var bookMat=new THREE.MeshStandardMaterial({map:tex(function(g,w,h){
      g.fillStyle="#2f5f8a";g.fillRect(0,0,w,h);
      g.fillStyle="#eaf2f8";g.font="700 44px sans-serif";g.fillText("MATHEMATICS",24,80);
      g.font="500 30px sans-serif";g.globalAlpha=.8;g.fillText("수학 I",24,130);
      g.globalAlpha=.35;g.strokeStyle="#eaf2f8";g.lineWidth=3;g.strokeRect(16,16,w-32,h-32);
    },384,256)});
  mathBookG=new THREE.Group();scene.add(mathBookG);window.mathBookG=mathBookG;
  mathBookProcedural=new THREE.Group();mathBookG.add(mathBookProcedural);window.mathBookProcedural=mathBookProcedural;
  var mb=new THREE.Mesh(new THREE.BoxGeometry(0.26,0.035,0.19),bookMat);
  mb.rotation.y=0.18;mathBookProcedural.add(mb);
  /* hot()은 hotspots 등록만 한다. scene.add()로 다시 붙이면 그룹에서 떨어져 나온다. */
  hot(mb,"mathbook","책");
  mathBookObj=mathBookG;
  scene.add(box(0.26,0.035,0.19,0x7a4a3a,-2.30,0.745,-0.50));
  scene.add(box(0.26,0.035,0.19,0x46704f, 2.30,0.745,-0.50));

  /* --- 창문 + 커튼 (좌측 벽) --- */
  var winMat=new THREE.MeshBasicMaterial({map:tex(function(g,w,h){
      var gr=g.createLinearGradient(0,0,0,h);
      gr.addColorStop(0,"#ffe8c2");gr.addColorStop(.55,"#ffd5a0");gr.addColorStop(1,"#e9bc86");
      g.fillStyle=gr;g.fillRect(0,0,w,h);
      g.fillStyle="rgba(120,90,60,.25)";g.fillRect(0,h*0.62,w,4);
    },256,384)});
  var CURTAIN_TEX=tex(function(g,w,h){
      g.fillStyle="#6e3330";g.fillRect(0,0,w,h);
      for(var i=0;i<w;i+=24){
        var t=(i/24)%2;
        g.fillStyle=t?"rgba(255,190,170,.10)":"rgba(0,0,0,.20)";
        g.fillRect(i,0,12,h);
      }
      g.fillStyle="rgba(0,0,0,.22)";g.fillRect(0,0,w,16);
    },256,256);
  var zs=[-2.5,-0.85,0.85,2.5];
  for(var i=0;i<4;i++){
    var wz=zs[i];
    var win=plane(1.35,1.75,winMat,-4.97,1.76,wz);win.rotation.y=Math.PI/2;scene.add(win);
    scene.add(box(0.05,1.85,0.06,0x6b5a44,-4.95,1.76,wz-0.7));
    scene.add(box(0.05,1.85,0.06,0x6b5a44,-4.95,1.76,wz+0.7));
    scene.add(box(0.05,0.06,1.46,0x6b5a44,-4.95,2.69,wz));
    scene.add(box(0.05,0.06,1.46,0x6b5a44,-4.95,0.85,wz));
    scene.add(box(0.06,0.05,1.60,0x5c4a36,-4.90,2.76,wz)); /* 커튼봉 */
    var cur=new THREE.Mesh(new THREE.BoxGeometry(0.09,1.88,1.46),
      new THREE.MeshStandardMaterial({map:CURTAIN_TEX}));
    cur.position.set(-4.86,1.78,wz);
    cur.userData.closed=true;scene.add(cur);curtainObjs.push(cur);
  }
  openCurtain(3,true);
  syncPools();
  var cHot=box(0.20,1.90,1.60,0xffffff,-4.86,1.78,zs[3]);
  cHot.material.transparent=true;cHot.material.opacity=0;
  scene.add(hot(cHot,"curtain","커튼"));

  /* 창빛 웅덩이 & 빛기둥 */
  lightPools=[];
  var poolTex=tex(function(g,w,h){
    var rg=g.createRadialGradient(w/2,h/2,0,w/2,h/2,w/2);
    rg.addColorStop(0,"rgba(255,236,200,1)");rg.addColorStop(.55,"rgba(255,226,178,.62)");
    rg.addColorStop(1,"rgba(255,220,170,0)");
    g.fillStyle=rg;g.fillRect(0,0,w,h);},256,256);
  var poolMat=new THREE.MeshBasicMaterial({map:poolTex,color:0xffe0ae,transparent:true,opacity:0.20,
    blending:THREE.AdditiveBlending,depthWrite:false});
  for(var q=0;q<4;q++){
    var pool=new THREE.Mesh(new THREE.PlaneGeometry(3.2,1.8),poolMat.clone());
    pool.rotation.x=-Math.PI/2;pool.rotation.z=0.06;
    pool.position.set(-3.25,0.014,zs[q]+0.45);
    scene.add(pool);lightPools.push(pool);
  }
  lightShafts=[];
  var shaftTex=tex(function(g,w,h){
    var lg=g.createLinearGradient(0,0,w,0);
    lg.addColorStop(0,"rgba(255,238,204,.95)");lg.addColorStop(.45,"rgba(255,230,190,.42)");
    lg.addColorStop(1,"rgba(255,224,178,0)");
    g.fillStyle=lg;g.fillRect(0,0,w,h);
    var eg=g.createLinearGradient(0,0,0,h);
    eg.addColorStop(0,"rgba(0,0,0,1)");eg.addColorStop(.16,"rgba(0,0,0,0)");
    eg.addColorStop(.84,"rgba(0,0,0,0)");eg.addColorStop(1,"rgba(0,0,0,1)");
    g.globalCompositeOperation="destination-out";
    g.fillStyle=eg;g.fillRect(0,0,w,h);
    g.globalCompositeOperation="source-over";},256,128);
  var SDIR=new THREE.Vector3(0.76,-0.65,0).normalize(), SLEN=3.9;
  (function(){
    var yAx=new THREE.Vector3(0,0,1);
    var zAx=new THREE.Vector3().crossVectors(SDIR,yAx).normalize();
    var basis=new THREE.Matrix4().makeBasis(SDIR,yAx,zAx);
    var shaftMat=new THREE.MeshBasicMaterial({map:shaftTex,transparent:true,opacity:0.16,
      side:THREE.DoubleSide,blending:THREE.AdditiveBlending,depthWrite:false});
    for(var q=0;q<4;q++){
      var sh=new THREE.Mesh(new THREE.PlaneGeometry(SLEN,1.55),shaftMat.clone());
      sh.quaternion.setFromRotationMatrix(basis);
      var o=new THREE.Vector3(-4.78,2.50,zs[q]);
      sh.position.copy(o).add(SDIR.clone().multiplyScalar(SLEN*0.5));
      sh.renderOrder=3;
      scene.add(sh);lightShafts.push(sh);
    }
  })();
  /* 부유 먼지 입자 */
  var dustGeo=new THREE.BufferGeometry(),dp=[];
  for(var q=0;q<300;q++)dp.push(-4.8+Math.random()*3.2, 0.30+Math.random()*2.45, -3.5+Math.random()*7.0);
  dustGeo.setAttribute("position",new THREE.Float32BufferAttribute(dp,3));
  var dotTex=tex(function(g,w,h){
      var gr=g.createRadialGradient(w/2,h/2,0,w/2,h/2,w/2);
      gr.addColorStop(0,"rgba(255,240,214,1)");gr.addColorStop(.45,"rgba(255,236,205,.5)");
      gr.addColorStop(1,"rgba(255,236,205,0)");
      g.fillStyle=gr;g.fillRect(0,0,w,h);},32,32);
  dustMat=new THREE.PointsMaterial({map:dotTex,color:0xffeccd,size:0.013,transparent:true,opacity:0.26,
    blending:THREE.AdditiveBlending,depthWrite:false,sizeAttenuation:true});
  dust=new THREE.Points(dustGeo,dustMat);scene.add(dust);

  /* --- 우측 벽: 과학자 액자 6개 --- */
  var order=["newton","archimedes","abel","einstein","galilei","gauss"];
  for(var f=0;f<6;f++){
    var id=order[f], zz=-2.5+f*1.0;
    var g3=new THREE.Group();g3.position.set(4.90,1.72,zz);g3.rotation.y=-Math.PI/2;
    var spin=new THREE.Group();g3.add(spin);
    var por=plane(0.50,0.60,new THREE.MeshStandardMaterial({map:imgTex(A["portrait_"+id])}),0,0,0.012);
    por.renderOrder=7;spin.add(por);
    var bars=new THREE.Group();spin.add(bars);
    g3.userData.bars=bars;g3.userData.spin=spin;g3.userData.sci=id;g3.userData.tz=0;
    scene.add(g3);frameObjs[id]=g3;
    var frameHit=plane(0.64,0.74,new THREE.MeshBasicMaterial({transparent:true,opacity:0}),4.86,1.72,zz);
    frameHit.rotation.y=-Math.PI/2;
    var sci=SCI.filter(function(s){return s.id===id;})[0];
    scene.add(hot(frameHit,"frame:"+id,"액자"));
    (function(sc,zz2){
      var pm=new THREE.MeshStandardMaterial({map:tex(function(g,w,h){
        g.fillStyle="#f2ecdb";g.fillRect(0,0,w,h);
        g.fillStyle="#d9cfb4";g.fillRect(0,0,w,6);
        g.fillStyle="#2b2419";g.textAlign="center";g.textBaseline="top";
        g.font="700 38px 'Gothic A1',sans-serif";g.fillText(sc.name,w/2,20);
        g.font="500 24px Arial,sans-serif";g.fillStyle="#7a6c55";
        g.fillText(sc.born+" ~ "+sc.died,w/2,70);
        g.fillStyle="#a03528";g.font="700 24px 'Gothic A1',sans-serif";
        g.fillText(sc.key,w/2,110);
        g.textAlign="left";g.fillStyle="#3a332a";g.font="400 22px 'Gothic A1',sans-serif";
        var words=sc.body.split(" "),line="",y=155,max=w-52;
        for(var wi=0;wi<words.length;wi++){
          var t=line+words[wi]+" ";
          if(g.measureText(t).width>max){g.fillText(line,26,y);line=words[wi]+" ";y+=28;
            if(y>h-32){g.fillText(line+"…",26,y);line="";break;}}
          else line=t;
        }
        if(line)g.fillText(line,26,y);
      },560,460)});
      var pl=plane(0.56,0.46,pm,4.90,1.10,zz2);pl.rotation.y=-Math.PI/2;scene.add(pl);
      var ph=plane(0.62,0.52,new THREE.MeshBasicMaterial({transparent:true,opacity:0}),4.86,1.10,zz2);
      ph.rotation.y=-Math.PI/2;scene.add(hot(ph,"note:"+sc.id,"인쇄물"));
    })(sci,zz);
    drawFrameBars(id);
  }

  /* 벽시계 (Chapter 6 Clue - 정통 한국 학교 벽시계: 1~12 숫자, 베젤, 회전 무브먼트) */
  var clockG=new THREE.Group();clockGroup=clockG;
  var CR=0.20;

  /* 다크 메탈 원형 케이싱 */
  var ccase=cyl(CR+0.024,CR+0.024,0.048,0x24282c,0,0,0,48,0.4);
  ccase.rotation.x=Math.PI/2;clockG.add(ccase);

  /* 헤어라인 브러시드 알루미늄 외곽 림 (Bezel) */
  var bez=new THREE.Mesh(new THREE.TorusGeometry(CR+0.012,0.014,12,48),
    new THREE.MeshStandardMaterial({color:0xb0b6ba,roughness:0.32,metalness:0.85}));
  bez.position.z=0.025;clockG.add(bez);

  /* 시계 다이얼 텍스처 (1~12 전 숫자 + 60분 눈금선) */
  var clockPbr=pbrTex(function(g,w,h){
    var R=w/2;
    /* 은은한 아이보리 화이트 다이얼 */
    var rgf=g.createRadialGradient(R,R*0.8,0,R,R,R);
    rgf.addColorStop(0,"#ffffff");rgf.addColorStop(0.85,"#f6f3eb");rgf.addColorStop(1,"#ebe3d3");
    g.fillStyle=rgf;g.beginPath();g.arc(R,R,R-6,0,Math.PI*2);g.fill();

    /* 60분 눈금선 */
    g.strokeStyle="#1a1815";
    for(var i=0;i<60;i++){
      var a=i/60*Math.PI*2-Math.PI/2;
      var isMajor=i%5===0;
      g.lineWidth=isMajor?(i%15===0?6:4):1.8;
      var tickLen=isMajor?(i%15===0?28:22):12;
      g.beginPath();
      g.moveTo(R+Math.cos(a)*(R-16),R+Math.sin(a)*(R-16));
      g.lineTo(R+Math.cos(a)*(R-16-tickLen),R+Math.sin(a)*(R-16-tickLen));
      g.stroke();
    }

    /* 1부터 12까지의 명확한 아라비아 숫자 */
    g.fillStyle="#151311";g.textAlign="center";g.textBaseline="middle";
    g.font="900 36px 'Gothic A1',sans-serif";
    for(var num=1;num<=12;num++){
      var ang=(num/12)*Math.PI*2 - Math.PI/2;
      var nx=R + Math.cos(ang)*(R-64);
      var ny=R + Math.sin(ang)*(R-64)+3;
      g.fillText(num,nx,ny);
    }

    /* 학교 시계 브랜드 인쇄 */
    g.font="700 13px 'Gothic A1',sans-serif";g.fillStyle="#6c6458";
    g.fillText("STANDARD",R,R-46);
    g.font="600 11px sans-serif";g.fillText("QUARTZ",R,R+50);
  },512,512, 1.2, 0.40, 0.15);

  /* 원형 다이얼 페이스 (CircleGeometry 사용으로 사각 모서리 돌출 방지) */
  var faceMat=new THREE.MeshStandardMaterial({
    map:clockPbr.map,
    normalMap:clockPbr.normalMap,
    roughnessMap:clockPbr.roughnessMap,
    roughness:0.38,
    metalness:0.02
  });
  var faceMesh=new THREE.Mesh(new THREE.CircleGeometry(CR,48),faceMat);
  faceMesh.position.z=0.026;clockG.add(faceMesh);

  /* 3D 시침 (피벗 회전 축: 시계 중앙) */
  var hourPivot=new THREE.Group();hourPivot.position.set(0,0,0.029);
  var hourBlade=box(0.013,CR*0.56,0.003,0x141210,0,CR*0.25,0);
  hourPivot.add(hourBlade);
  hourPivot.rotation.z=Math.PI*0.35; /* 10시 방향 */
  clockG.add(hourPivot);

  /* 3D 분침 (피벗 회전 축: 시계 중앙) */
  var minPivot=new THREE.Group();minPivot.position.set(0,0,0.031);
  var minBlade=box(0.009,CR*0.78,0.003,0x141210,0,CR*0.36,0);
  minPivot.add(minBlade);
  minPivot.rotation.z=-Math.PI*0.34; /* 2시 방향 */
  clockG.add(minPivot);

  /* 3D 초침 (실시간 초침 무브먼트: 시계 중앙 피벗) */
  var secPivot=new THREE.Group();secPivot.position.set(0,0,0.033);
  var secBlade=box(0.0035,CR*0.86,0.002,0xd4241c,0,CR*0.38,0);
  var secCounter=box(0.0055,CR*0.22,0.002,0xd4241c,0,-CR*0.09,0);
  secPivot.add(secBlade);secPivot.add(secCounter);
  secPivot.add(ball(0.008,0xd4a84e,0,0,0.002,0.3)); /* 중앙 황동 고정 핀 */
  clockG.add(secPivot);
  window.clockSecondHand=secPivot;

  /* 볼록 보호 유리 렌즈 (원형 투명 커버) */
  var clockGlass=new THREE.Mesh(new THREE.CircleGeometry(CR*0.98,48),
    new THREE.MeshStandardMaterial({color:0xffffff,roughness:0.06,metalness:0.08,transparent:true,opacity:0.25,depthWrite:false}));
  clockGlass.position.z=0.036;clockG.add(clockGlass);
  scene.add(clockG);

  var cph=plane(0.48,0.48,new THREE.MeshBasicMaterial({transparent:true,opacity:0}),0,2.68,-3.85);
  scene.add(hot(cph,"clock","벽시계"));

  /* 소화기 (Chapter 5 Clue - PBR 광택 도장 & 압력게이지 & 경고 라벨) */
  extinguisherGroup=new THREE.Group();window.extinguisherGroup=extinguisherGroup;
  extProcedural=new THREE.Group();extinguisherGroup.add(extProcedural);window.extProcedural=extProcedural;
  var ext=extinguisherGroup;
  
  var extLabelPbr=pbrTex(function(g,w,h){
    g.fillStyle="#b81d13";g.fillRect(0,0,w,h);
    /* 전면 백색 경고 라벨 밴드 */
    var lw=Math.floor(w*0.75), lx=Math.floor((w-lw)/2);
    g.fillStyle="#f8f6f0";g.fillRect(lx,60,lw,h-120);
    g.strokeStyle="#b81d13";g.lineWidth=4;g.strokeRect(lx+8,68,lw-16,h-136);
    /* 화재 등급 심볼 A B C */
    g.fillStyle="#b81d13";g.textAlign="center";
    g.font="900 36px 'Gothic A1',sans-serif";g.fillText("소 화 기",w/2,110);
    g.font="700 20px 'Gothic A1',sans-serif";g.fillText("FIRE EXTINGUISHER",w/2,145);
    g.fillStyle="#1a4c8a";g.beginPath();g.arc(w/2-60,210,24,0,7);g.fill();
    g.fillStyle="#fff";g.font="900 24px sans-serif";g.fillText("A",w/2-60,218);
    g.fillStyle="#b81d13";g.beginPath();g.arc(w/2,210,24,0,7);g.fill();
    g.fillStyle="#fff";g.fillText("B",w/2,218);
    g.fillStyle="#1c7c42";g.beginPath();g.arc(w/2+60,210,24,0,7);g.fill();
    g.fillStyle="#fff";g.fillText("C",w/2,218);
    /* 사용 순서 안내선 */
    g.fillStyle="#333";g.font="600 16px 'Gothic A1',sans-serif";
    g.fillText("1.안전핀을 뽑는다  2.노즐을 향한다",w/2,280);
    g.fillText("3.손잡이를 힘껏 움켜쥔다",w/2,310);
  },512,512, 1.5, 0.22, 0.15);

  var extMat=new THREE.MeshStandardMaterial({
    map:extLabelPbr.map,
    normalMap:extLabelPbr.normalMap,
    roughnessMap:extLabelPbr.roughnessMap,
    roughness:0.20,
    metalness:0.25
  });
  var body=new THREE.Mesh(new THREE.CylinderGeometry(0.10,0.10,0.44,24),extMat);
  body.position.y=0.24;body.rotation.y=-Math.PI*0.75;extProcedural.add(body);
  var dome=new THREE.Mesh(new THREE.SphereGeometry(0.10,20,12,0,Math.PI*2,0,Math.PI/2),
    new THREE.MeshStandardMaterial({color:0xb81d13,roughness:0.20,metalness:0.25}));
  dome.position.y=0.46;extProcedural.add(dome);

  /* 하부 고무 베이스 & 상부 브라스 넥 */
  extProcedural.add(cyl(0.104,0.104,0.040,0x161718,0,0.020,0,20,0.85));
  extProcedural.add(cyl(0.035,0.035,0.040,0xd8a848,0,0.51,0,12,0.3,0,0,0));
  extProcedural.add(box(0.035,0.11,0.032,0x222428,0,0.57,-0.02));

  /* 손잡이 레버 & 안전핀 */
  var leverT=box(0.026,0.014,0.15,0x1e2023,0,0.62,0.035);leverT.rotation.x=-0.22;extProcedural.add(leverT);
  var leverB=box(0.026,0.014,0.14,0x1e2023,0,0.57,0.04);extProcedural.add(leverB);
  /* 황동 안전핀 링 */
  var pinRing=new THREE.Mesh(new THREE.TorusGeometry(0.018,0.003,8,16),
    new THREE.MeshStandardMaterial({color:0xd8a848,roughness:0.3,metalness:0.8}));
  pinRing.position.set(-0.028,0.60,0.01);extProcedural.add(pinRing);

  /* 압력 게이지 (원형 인디케이터 페이스: 정상(초록)/비정상(빨강)) */
  var gaugeHousing=cyl(0.022,0.022,0.014,0xd8a848,0,0.54,0.034,16,0.25);
  gaugeHousing.rotation.x=Math.PI/2;extProcedural.add(gaugeHousing);
  var gaugeFaceMat=new THREE.MeshBasicMaterial({map:tex(function(g,w,h){
    var R=w/2;
    g.fillStyle="#f8f8f8";g.beginPath();g.arc(R,R,R,0,7);g.fill();
    /* 압력 범위 아크: 빨강 - 초록 - 빨강 */
    g.lineWidth=14;
    g.strokeStyle="#c8281e";g.beginPath();g.arc(R,R,R-10,-Math.PI*0.8,-Math.PI*0.3);g.stroke();
    g.strokeStyle="#2e9b48";g.beginPath();g.arc(R,R,R-10,-Math.PI*0.3,-Math.PI*0.1);g.stroke();
    g.strokeStyle="#c8281e";g.beginPath();g.arc(R,R,R-10,-Math.PI*0.1,Math.PI*0.1);g.stroke();
    /* 검정 지침 (녹색 구역을 가리킴) */
    g.strokeStyle="#1a1a1a";g.lineWidth=4;g.beginPath();g.moveTo(R,R);
    g.lineTo(R+Math.cos(-Math.PI*0.2)*(R-14),R+Math.sin(-Math.PI*0.2)*(R-14));g.stroke();
    g.fillStyle="#1a1a1a";g.beginPath();g.arc(R,R,5,0,7);g.fill();
  },128,128)});
  var gaugeFace=plane(0.036,0.036,gaugeFaceMat,0,0.54,0.042);
  extProcedural.add(gaugeFace);

  /* 고무 분사 호스 및 황동 노즐 */
  var hose=new THREE.Mesh(new THREE.TorusGeometry(0.11,0.014,8,20,Math.PI*0.88),
    new THREE.MeshStandardMaterial({color:0x1b1c1e,roughness:0.85}));
  hose.position.set(-0.05,0.36,0);hose.rotation.y=Math.PI/2;hose.rotation.z=-0.2;extProcedural.add(hose);
  extProcedural.add(cyl(0.018,0.012,0.11,0x18191a,-0.10,0.21,0.04,10,0.7));
  var nozzle=cyl(0.014,0.010,0.03,0xd8a848,-0.10,0.14,0.04,10,0.35);extProcedural.add(nozzle);
  scene.add(ext);

  var eh=new THREE.Mesh(new THREE.CylinderGeometry(0.20,0.20,0.80,10),
          new THREE.MeshBasicMaterial({transparent:true,opacity:0}));
  eh.position.set(4.45,0.40,3.40);scene.add(hot(eh,"extinguisher","소화기"));

  /* 15칸 후면 학생 사물함 (3단 x 5열: 환기 루버 슬릿, 황동 명찰 홀더, 매립형 손잡이) */
  scene.add(shadowDecal(3.4,0.72,0.46,-2.2,3.75));
  var lockerWood=0x6e4b2d, lockerTrim=0x4c321c, doorBase=0x5a3c22;
  var lockerUnit=new THREE.Group();lockerUnit.position.set(-2.2,0,3.75);lockerUnit.rotation.y=Math.PI;

  /* 사물함 메인 프레임 (폭 3.14m x 높이 1.02m x 깊이 0.44m) */
  lockerUnit.add(box(3.14,1.02,0.44,lockerWood,0,0.52,0));
  lockerUnit.add(box(3.20,0.05,0.48,lockerTrim,0,1.04,0)); /* 상판 캡 몰딩 */
  lockerUnit.add(box(3.18,0.05,0.46,0x2b1c0e,0,0.025,0)); /* 하단 걸레받이 베이스 */

  /* 3행 x 5열 (총 15개 도어) */
  var COLS=5, ROWS=3;
  var dw=0.58, dh=0.30;
  for(var ri=0;ri<ROWS;ri++){
    for(var ci=0;ci<COLS;ci++){
      var dx=-1.16+ci*0.58;
      var dy=0.20+ri*0.31;
      /* 도어 패널 */
      lockerUnit.add(box(dw-0.02,dh-0.02,0.02,doorBase,dx,dy,0.222));
      /* 도어 테두리 음영 */
      lockerUnit.add(box(dw,0.008,0.025,lockerTrim,dx,dy-dh/2,0.224));
      /* 상단 환기 루버 슬릿 3줄 */
      for(var li=0;li<3;li++){
        lockerUnit.add(box(0.18,0.006,0.008,0x1f140b,dx,dy+0.07-li*0.018,0.233));
      }
      /* 황동 명찰 홀더 (Nameplate Slot) */
      lockerUnit.add(box(0.12,0.038,0.008,0xd4a84e,dx,dy,0.233));
      lockerUnit.add(box(0.10,0.026,0.009,0xf8f5ed,dx,dy,0.234));
      /* 매립형 크롬 손잡이 (Chrome Latch Handle) */
      lockerUnit.add(box(0.016,0.065,0.012,0xb0b6ba,dx+dw*0.38,dy-0.02,0.233));
      lockerUnit.add(ball(0.004,0x181a1b,dx+dw*0.38,dy-0.02,0.239,0.5)); /* 열쇠 구멍 */
    }
  }
  scene.add(lockerUnit);

  /* 클래식 테디베어 인형 (PBR 플러시 펠트 퍼 텍스처 & 앰버 글래스 버튼 눈, 교실 전방을 향해 180도 착석) */
  dollGroup=new THREE.Group();dollGroup.rotation.y=Math.PI - 0.15;window.dollGroup=dollGroup;
  var doll=dollGroup;
  doll.add(put(shadowDecal(0.40,0.36,0.48,0,0),0,0.005,0));

  var plushPbr=pbrTex(function(g,w,h){
    g.fillStyle="#9e6634";g.fillRect(0,0,w,h);
    /* 미세 펠트 털 요철 */
    g.fillStyle="rgba(255,240,210,0.08)";
    for(var i=0;i<1800;i++){
      g.fillRect(Math.random()*w,Math.random()*h,Math.random()*3+1,Math.random()*2+1);
    }
    g.fillStyle="rgba(40,20,5,0.08)";
    for(var j=0;j<1800;j++){
      g.fillRect(Math.random()*w,Math.random()*h,Math.random()*3+1,Math.random()*2+1);
    }
  },256,256, 3.5, 0.94, 0.15);

  var bellyPbr=pbrTex(function(g,w,h){
    g.fillStyle="#e2c49b";g.fillRect(0,0,w,h);
    g.fillStyle="rgba(255,255,255,0.1)";
    for(var i=0;i<1200;i++){
      g.fillRect(Math.random()*w,Math.random()*h,Math.random()*2+1,Math.random()*2+1);
    }
  },256,256, 2.5, 0.95, 0.12);

  var furMat=new THREE.MeshStandardMaterial({
    map:plushPbr.map,
    normalMap:plushPbr.normalMap,
    roughnessMap:plushPbr.roughnessMap,
    roughness:0.92,
    metalness:0.0
  });

  var bellyMat=new THREE.MeshStandardMaterial({
    map:bellyPbr.map,
    normalMap:bellyPbr.normalMap,
    roughnessMap:bellyPbr.roughnessMap,
    roughness:0.94,
    metalness:0.0
  });

  dollProcedural=new THREE.Group();dollGroup.add(dollProcedural);window.dollProcedural=dollProcedural;

  var db=new THREE.Mesh(new THREE.SphereGeometry(0.12,20,16),furMat);
  db.position.y=0.12;db.scale.set(1.08,1.20,1.02);dollProcedural.add(db);
  var belly=plane(0.14,0.17,bellyMat,0,0.12,0.122);
  belly.scale.set(1,1.15,1);dollProcedural.add(belly);

  var dh=new THREE.Mesh(new THREE.SphereGeometry(0.105,20,16),furMat);
  dh.position.set(0,0.31,0.015);dh.scale.set(1.12,1.0,1.05);dollProcedural.add(dh);
  var snout=new THREE.Mesh(new THREE.SphereGeometry(0.052,16,12),bellyMat);
  snout.position.set(0,0.29,0.105);snout.scale.set(1.1,0.85,0.9);dollProcedural.add(snout);

  /* 손바느질 자수 코 & 미소 입선 */
  var noseCol=0x26140b;
  dollProcedural.add(box(0.026,0.018,0.01,noseCol,0,0.316,0.151));
  dollProcedural.add(box(0.005,0.022,0.01,noseCol,0,0.298,0.151));
  var mouthL=box(0.014,0.004,0.008,noseCol,-0.008,0.288,0.150);mouthL.rotation.z=-0.25;dollProcedural.add(mouthL);
  var mouthR=box(0.014,0.004,0.008,noseCol, 0.008,0.288,0.150);mouthR.rotation.z= 0.25;dollProcedural.add(mouthR);

  /* 호박색 글래스 버튼 눈 (Amber Glass Eyes) */
  [-1,1].forEach(function(sd){
    var eyeGlass=ball(0.014,0xb46414,sd*0.042,0.335,0.098,0.15);dollProcedural.add(eyeGlass);
    dollProcedural.add(ball(0.008,0x111214,sd*0.042,0.335,0.105,0.1)); /* 동공 */
    dollProcedural.add(ball(0.003,0xffffff,sd*0.042+0.003,0.339,0.110,0.05)); /* 반사 하이라이트 */
  });

  /* 둥근 곰 귀 */
  [-1,1].forEach(function(sd){
    var ear=ball(0.038,0x9e6634,sd*0.088,0.395,0.01,0.92);
    ear.scale.set(0.9,1.1,0.6);dollProcedural.add(ear);
    var earIn=ball(0.024,0xe2c49b,sd*0.088,0.395,0.025,0.95);
    earIn.scale.set(0.8,1.0,0.5);dollProcedural.add(earIn);
  });

  /* 팔과 다리, 발바닥 스웨이드 패드 */
  [-1,1].forEach(function(sd){
    var arm=new THREE.Mesh(new THREE.CylinderGeometry(0.036,0.030,0.14,14),furMat);
    arm.position.set(sd*0.115,0.155,0.04);arm.rotation.set(0.4,0,sd*0.45);dollProcedural.add(arm);
    var leg=new THREE.Mesh(new THREE.CylinderGeometry(0.042,0.036,0.13,14),furMat);
    leg.position.set(sd*0.075,0.045,0.09);leg.rotation.set(Math.PI/2,0,sd*0.18);dollProcedural.add(leg);
    var pad=plane(0.052,0.065,bellyMat,sd*0.075,0.045,0.156);
    pad.rotation.y=sd*-0.18;dollProcedural.add(pad);
  });

  /* 새틴 와인 레드 리본 나비넥타이 */
  var tieG=new THREE.Group();tieG.position.set(0,0.22,0.112);
  var tieMat=new THREE.MeshStandardMaterial({color:0x8e1b24,roughness:0.35,metalness:0.15});
  tieG.add(new THREE.Mesh(new THREE.BoxGeometry(0.024,0.024,0.02),tieMat));
  var wingL=new THREE.Mesh(new THREE.BoxGeometry(0.054,0.038,0.012),tieMat);wingL.position.x=-0.032;wingL.rotation.z=0.2;tieG.add(wingL);
  var wingR=new THREE.Mesh(new THREE.BoxGeometry(0.054,0.038,0.012),tieMat);wingR.position.x= 0.032;wingR.rotation.z=-0.2;tieG.add(wingR);
  dollProcedural.add(tieG);
  scene.add(doll);
  var dHot=new THREE.Mesh(new THREE.SphereGeometry(0.28,12,10),
            new THREE.MeshBasicMaterial({transparent:true,opacity:0}));
  dHot.position.set(-2.6,1.25,3.70);scene.add(hot(dHot,"doll","인형"));

  /* 게시판 (뒤쪽 벽) */
  var boardMat=new THREE.MeshStandardMaterial({map:tex(function(g,w,h){
      g.fillStyle="#8a7b5e";g.fillRect(0,0,w,h);
      g.fillStyle="#6d6047";g.fillRect(0,0,w,16);g.fillRect(0,h-16,w,16);
      var cols=["#f4efe0","#e8edf4","#f6e9dd","#eaf2e6"];
      for(var i=0;i<7;i++){g.save();
        var x=40+ (i%4)*150, y=45+Math.floor(i/4)*145;
        g.translate(x,y);g.rotate((Math.random()-.5)*0.10);
        g.fillStyle=cols[i%4];g.fillRect(0,0,114,114);
        g.fillStyle="rgba(60,50,35,.32)";
        for(var k=0;k<5;k++)g.fillRect(12,18+k*16,78-k*8,5);
        g.restore();}
    },640,360)});
  var bboard=plane(2.50,1.40,boardMat,-1.2,1.85,3.95);bboard.rotation.y=Math.PI;
  scene.add(bboard);
  scene.add(box(2.60,0.06,0.05,0x6b4c30,-1.2,1.15,3.93));
  boardGroup=new THREE.Group();scene.add(boardGroup);

  /* 미끼 오브제 (화분, 쓰레기통, 분필함, 우산꽂이, 라디에이터 등) */
  /* 화분: 사물함 상단 우측 안착 (-1.15, 1.045, 3.72) */
  plantG=new THREE.Group();plantG.position.set(-1.15,1.045,3.72);window.plantG=plantG;
  plantG.add(put(shadowDecal(0.36,0.36,0.40,0,0),0,0.003,0));
  plantProcedural=new THREE.Group();plantG.add(plantProcedural);window.plantProcedural=plantProcedural;
  var pot=plantG;
  plantProcedural.add(cyl(0.18,0.16,0.035,0x8b4c2c,0,0.018,0,20,0.85));
  plantProcedural.add(cyl(0.165,0.12,0.28,0xa25b36,0,0.16,0,20,0.82));
  plantProcedural.add(cyl(0.178,0.178,0.035,0xb0653d,0,0.29,0,20,0.8));
  plantProcedural.add(cyl(0.155,0.155,0.02,0x322416,0,0.288,0,16,0.98));
  [[0,0.34,0,0,0],[0.12,0.29,0.06,0.45,0.25],[-0.11,0.30,-0.07,-0.40,-0.20],
   [0.05,0.27,-0.12,0.22,-0.45],[-0.07,0.26,0.12,-0.25,0.45]].forEach(function(L,i){
    var lfMat=new THREE.MeshStandardMaterial({color:i%2?0x2f603c:0x3b7248,roughness:0.62});
    var lf=new THREE.Mesh(new THREE.SphereGeometry(0.085,12,10),lfMat);
    lf.position.set(L[0],0.30+L[1],L[2]);
    lf.scale.set(0.65,2.4,0.18);lf.rotation.set(L[4],0,L[3]);plantProcedural.add(lf);
  });
  scene.add(pot);
  var potH=box(0.40,0.70,0.40,0xffffff,-1.15,1.40,3.72);
  potH.material.transparent=true;potH.material.opacity=0;
  scene.add(hot(potH,"decoy:plant","화분"));

  scene.add(shadowDecal(0.48,0.48,0.32,1.6,-3.5));
  trashG=new THREE.Group();trashG.position.set(1.6,0,-3.5);window.trashG=trashG;
  trashProcedural=new THREE.Group();trashG.add(trashProcedural);window.trashProcedural=trashProcedural;
  var binG=trashG;
  trashProcedural.add(cyl(0.17,0.13,0.40,0x404852,0,0.20,0,20,0.5));
  var binRim=new THREE.Mesh(new THREE.TorusGeometry(0.172,0.011,8,24),
    new THREE.MeshStandardMaterial({color:0x636e7c,roughness:0.4,metalness:0.5}));
  binRim.rotation.x=Math.PI/2;binRim.position.y=0.40;trashProcedural.add(binRim);
  trashProcedural.add(ball(0.036,0xf4efe4,0.03,0.36,0.02,0.9));
  trashProcedural.add(ball(0.030,0xe8e2d2,-0.04,0.35,-0.03,0.92));
  scene.add(binG);
  var binH=cyl(0.20,0.20,0.46,0xffffff,1.6,0.23,-3.5,10);
  binH.material.transparent=true;binH.material.opacity=0;
  scene.add(hot(binH,"decoy:bin","쓰레기통"));

  var umbG=new THREE.Group();umbG.position.set(4.15,0,3.62);
  umbG.add(cyl(0.14,0.14,0.032,0x39414a,0,0.02,0,20,0.5));
  [0.10,0.42].forEach(function(yy){
    var ring=new THREE.Mesh(new THREE.TorusGeometry(0.135,0.010,7,20),
      new THREE.MeshStandardMaterial({color:0x59636d,roughness:0.42,metalness:0.42}));
    ring.rotation.x=Math.PI/2;ring.position.y=yy;umbG.add(ring);
  });
  function addUmbrella(x,z,fabric,leanZ,leanX){
    var ug=new THREE.Group();ug.position.set(x,0,z);ug.rotation.z=leanZ;ug.rotation.x=leanX;
    ug.add(cyl(0.008,0.008,0.95,0x3e342a,0,0.52,0,8,0.55));
    var cloth=new THREE.Mesh(new THREE.ConeGeometry(0.060,0.60,10),
      new THREE.MeshStandardMaterial({color:fabric,roughness:0.88}));
    cloth.position.y=0.41;cloth.rotation.x=Math.PI;ug.add(cloth);
    umbG.add(ug);
  }
  addUmbrella(0.035,0.015,0x2f3b52,0.08,-0.03);
  addUmbrella(-0.040,-0.030,0x583848,-0.07,0.04);
  scene.add(umbG);
  var umbH=cyl(0.22,0.22,1.05,0xffffff,4.15,0.52,3.62,10);
  umbH.material.transparent=true;umbH.material.opacity=0;
  scene.add(hot(umbH,"decoy:umb","우산꽂이"));

  function plaque(w,h,x,y,z,ry,id,label,draw,tw,th){
    var m=plane(w,h,new THREE.MeshStandardMaterial({roughness:0.86,
      map:tex(draw,tw||512,th||256)}),x,y,z);
    if(ry)m.rotation.y=ry;
    scene.add(m);
    var nx=ry===Math.PI?0:(ry===-Math.PI/2?-0.05:(ry===Math.PI/2?0.05:0));
    var nz=ry===Math.PI?-0.05:(ry?0:(z<0?0.06:-0.06));
    var hx=plane(w+0.08,h+0.08,new THREE.MeshBasicMaterial({transparent:true,opacity:0}),
      x+nx,y,z+nz);
    if(ry)hx.rotation.y=ry;
    scene.add(hot(hx,"decoy:"+id,label));
    return m;
  }
  function paperBase(g,w,h,bg,edge){
    g.fillStyle=bg;g.fillRect(0,0,w,h);
    g.globalAlpha=.05;
    for(var i=0;i<w*h/240;i++){g.fillStyle=Math.random()>.5?"#000":"#fff";
      g.fillRect(Math.random()*w,Math.random()*h,2,2);}
    g.globalAlpha=1;
  }

  /* --- 정통 클래식 주철 스팀 라디에이터 (창문 아래 -4.82, 0, 0.85) --- */
  var radG=new THREE.Group();radG.position.set(-4.82,0,0.85);

  // Materials: Aged ivory cast iron enamel & vintage polished brass
  var radMat=new THREE.MeshStandardMaterial({color:0xd9d3c1,roughness:0.42,metalness:0.22});
  var radPipeMat=new THREE.MeshStandardMaterial({color:0x9da3a8,roughness:0.35,metalness:0.65});
  var radBrassMat=new THREE.MeshStandardMaterial({color:0xd4a84e,roughness:0.30,metalness:0.80});
  var radKnobMat=new THREE.MeshStandardMaterial({color:0x221c18,roughness:0.65,metalness:0.10});

  // Contact shadow under radiator
  scene.add(shadowDecal(0.26,1.26,0.38,-4.82,0.85));

  // 14 Cast Iron Loop Sections (주철 핀 컬럼 루프)
  var nSec=14, secPitch=0.076;
  var halfSpan=(nSec-1)*secPitch*0.5;

  for(var si=0;si<nSec;si++){
    var sz=-halfSpan+si*secPitch;

    // Front & Rear vertical radiator tubes
    var tubeF=new THREE.Mesh(new THREE.CylinderGeometry(0.021,0.021,0.50,14),radMat);
    tubeF.position.set(0.040,0.35,sz);radG.add(tubeF);
    var tubeB=new THREE.Mesh(new THREE.CylinderGeometry(0.021,0.021,0.50,14),radMat);
    tubeB.position.set(-0.040,0.35,sz);radG.add(tubeB);

    // Top rounded arch connector
    var archT=new THREE.Mesh(new THREE.BoxGeometry(0.11,0.042,0.042),radMat);
    archT.position.set(0,0.61,sz);radG.add(archT);
    var capT=new THREE.Mesh(new THREE.SphereGeometry(0.022,12,10),radMat);
    capT.position.set(0.040,0.61,sz);radG.add(capT);
    var capTB=new THREE.Mesh(new THREE.SphereGeometry(0.022,12,10),radMat);
    capTB.position.set(-0.040,0.61,sz);radG.add(capTB);

    // Bottom rounded arch connector
    var archB=new THREE.Mesh(new THREE.BoxGeometry(0.11,0.042,0.042),radMat);
    archB.position.set(0,0.09,sz);radG.add(archB);

    // Cast iron ornate support feet on first and last sections (바닥 지지 다리)
    if(si===0 || si===nSec-1){
      var footF=new THREE.Mesh(new THREE.CylinderGeometry(0.014,0.022,0.09,10),radMat);
      footF.position.set(0.044,0.045,sz);radG.add(footF);
      var footB=new THREE.Mesh(new THREE.CylinderGeometry(0.014,0.022,0.09,10),radMat);
      footB.position.set(-0.044,0.045,sz);radG.add(footB);
    }
  }

  // Upper and Lower Steam Manifold Pipes (상/하단 증기 순환 연결관)
  var totalManifoldLen=nSec*secPitch+0.04;
  var topManifold=new THREE.Mesh(new THREE.CylinderGeometry(0.016,0.016,totalManifoldLen,14),radMat);
  topManifold.rotation.x=Math.PI/2;topManifold.position.set(0,0.61,0);radG.add(topManifold);
  var btmManifold=new THREE.Mesh(new THREE.CylinderGeometry(0.016,0.016,totalManifoldLen,14),radMat);
  btmManifold.rotation.x=Math.PI/2;btmManifold.position.set(0,0.09,0);radG.add(btmManifold);

  // Wall Standoff Mounts (벽체 고정 브래킷 2개)
  [-0.32, 0.32].forEach(function(bz){
    var brk=new THREE.Mesh(new THREE.BoxGeometry(0.14,0.024,0.024),radPipeMat);
    brk.position.set(-0.09,0.61,bz);radG.add(brk);
    var wallFlange=new THREE.Mesh(new THREE.BoxGeometry(0.012,0.06,0.06),radPipeMat);
    wallFlange.position.set(-0.16,0.61,bz);radG.add(wallFlange);
  });

  // Steam Inlet Pipe with Floor Flange, Brass Angle Valve & Fluted Turn Knob (+Z side)
  var valveZ=halfSpan+0.055;
  var flange1=new THREE.Mesh(new THREE.CylinderGeometry(0.038,0.042,0.010,18),radBrassMat);
  flange1.position.set(0.040,0.005,valveZ+0.06);radG.add(flange1);
  var riser=new THREE.Mesh(new THREE.CylinderGeometry(0.013,0.013,0.58,12),radPipeMat);
  riser.position.set(0.040,0.29,valveZ+0.06);radG.add(riser);
  var elbow=new THREE.Mesh(new THREE.SphereGeometry(0.020,12,10),radBrassMat);
  elbow.position.set(0.040,0.61,valveZ+0.06);radG.add(elbow);
  var hConn=new THREE.Mesh(new THREE.CylinderGeometry(0.013,0.013,0.06,12),radBrassMat);
  hConn.rotation.x=Math.PI/2;hConn.position.set(0.040,0.61,valveZ+0.03);radG.add(hConn);
  var vBody=new THREE.Mesh(new THREE.CylinderGeometry(0.020,0.018,0.045,12),radBrassMat);
  vBody.position.set(0.040,0.645,valveZ+0.06);radG.add(vBody);
  var vKnob=new THREE.Mesh(new THREE.CylinderGeometry(0.028,0.025,0.022,16),radKnobMat);
  vKnob.position.set(0.040,0.678,valveZ+0.06);radG.add(vKnob);

  // Steam Condensate Return Pipe & Brass Bleeder Valve (-Z side)
  var returnZ=-halfSpan-0.055;
  var flange2=new THREE.Mesh(new THREE.CylinderGeometry(0.034,0.038,0.010,16),radBrassMat);
  flange2.position.set(0.040,0.005,returnZ-0.04);radG.add(flange2);
  var retPipe=new THREE.Mesh(new THREE.CylinderGeometry(0.011,0.011,0.09,12),radPipeMat);
  retPipe.position.set(0.040,0.045,returnZ-0.04);radG.add(retPipe);
  var retElbow=new THREE.Mesh(new THREE.SphereGeometry(0.016,10,8),radBrassMat);
  retElbow.position.set(0.040,0.09,returnZ-0.04);radG.add(retElbow);
  var retConn=new THREE.Mesh(new THREE.CylinderGeometry(0.011,0.011,0.04,10),radPipeMat);
  retConn.rotation.x=Math.PI/2;retConn.position.set(0.040,0.09,returnZ-0.02);radG.add(retConn);

  // Top Brass Air Bleeder Petcock (-Z top corner)
  var bleeder=new THREE.Mesh(new THREE.CylinderGeometry(0.007,0.007,0.026,10),radBrassMat);
  bleeder.rotation.x=Math.PI/2;bleeder.position.set(0,0.61,returnZ-0.02);radG.add(bleeder);
  var bleedCap=new THREE.Mesh(new THREE.BoxGeometry(0.014,0.008,0.014),radBrassMat);
  bleedCap.position.set(0,0.61,returnZ-0.035);radG.add(bleedCap);

  scene.add(radG);

  // Clickable interaction hitbox
  var radH=box(0.24,0.72,1.36,0xffffff,-4.82,0.36,0.85);
  radH.material.transparent=true;radH.material.opacity=0;
  scene.add(hot(radH,"decoy:radiator","라디에이터"));

  /* 문 (마지막 출구 문 - 엔딩 관문) */
  var portal=plane(0.95,2.08,new THREE.MeshBasicMaterial({color:0xf7fbff,side:THREE.DoubleSide}),3.40,1.05,3.955);
  scene.add(portal);
  var dFrameCol=0x442f1f;
  scene.add(box(0.10,2.20,0.13,dFrameCol,2.88,1.10,3.91));
  scene.add(box(0.10,2.20,0.13,dFrameCol,3.92,1.10,3.91));
  scene.add(box(1.14,0.10,0.13,dFrameCol,3.40,2.15,3.91));

  doorPivot=new THREE.Group();doorPivot.position.set(3.875,0,3.96);
  var exitDoor=box(0.95,2.08,0.070,0x5f4128,-0.475,1.04,0);
  doorPivot.add(hot(exitDoor,"exitdoor","뒷문"));

  /* 망입 철망 유리창 */
  var wireGlassMat=new THREE.MeshStandardMaterial({map:tex(function(g,w,h){
    g.fillStyle="#eef5fa";g.fillRect(0,0,w,h);
    g.strokeStyle="rgba(80,100,120,.35)";g.lineWidth=2;
    for(var k=0;k<w;k+=16){g.beginPath();g.moveTo(k,0);g.lineTo(k,h);g.stroke();}
    for(var k=0;k<h;k+=16){g.beginPath();g.moveTo(0,k);g.lineTo(w,k);g.stroke();}
  },128,192),roughness:0.3,metalness:0.1});
  var doorWin=plane(0.30,0.48,wireGlassMat,-0.475,1.52,0.038);doorPivot.add(doorWin);
  var doorWinB=plane(0.30,0.48,wireGlassMat,-0.475,1.52,-0.038);doorWinB.rotation.y=Math.PI;doorPivot.add(doorWinB);

  /* 클래식 황동 레버 손잡이 */
  var brassCol=0xd4a54c;
  [-1,1].forEach(function(sd){
    doorPivot.add(box(0.045,0.16,0.008,brassCol,-0.84,1.04,sd*0.040));
    var hLever=cyl(0.008,0.007,0.10,brassCol,-0.79,1.06,sd*0.065,8,0.3);
    hLever.rotation.z=Math.PI/2;doorPivot.add(hLever);
  });
  scene.add(doorPivot);

  CH.forEach(function(c){
    clueHotObjs[c.n]=hotspots.filter(function(o){return o.userData.hot&&sealCode(o.userData.hot.id,c.n+20)===c.spot;});
  });
  buildRewardLetters();
  placeAnchorHomes();   /* 리빌 대상의 최초 배치를 앵커 테이블에서 확정 */

  camera.position.set(SPOTS[0].p[0],SPOTS[0].p[1],SPOTS[0].p[2]);
  yaw=SPOTS[0].y;pitch=-0.13;
}

/* 칠판에 붙는 종이 한 장 */
function paperTex(title,sub,accent){
  return new THREE.MeshStandardMaterial({
    side:THREE.DoubleSide,
    roughness:0.45,
    metalness:0.05,
    emissive:0x1c1712, /* 은은한 자체 발광으로 음영 속에서도 퀘스트 편지가 선명하게 노출 */
    map:tex(function(g,w,h){
      g.fillStyle="#fbf7ec";g.fillRect(0,0,w,h);
      g.strokeStyle="#b89a6b";g.lineWidth=4;g.strokeRect(4,4,w-8,h-8);
      g.fillStyle=accent||"#a03528";g.fillRect(8,8,w-16,14);
      g.fillStyle="#2b2419";g.textAlign="center";g.textBaseline="middle";
      g.font="700 30px 'Gothic A1',sans-serif";g.fillText(title,w/2,h*0.40);
      if(sub){g.font="500 22px 'Gothic A1',sans-serif";g.fillStyle="#7a6c55";
        g.fillText(sub,w/2,h*0.66);}
      g.strokeStyle="rgba(90,78,55,.25)";g.lineWidth=2;
      for(var i=0;i<3;i++){g.beginPath();g.moveTo(24,h*0.80+i*13);g.lineTo(w-24,h*0.80+i*13);g.stroke();}
    },260,190)
  });
}
function buildRewardLetters(){
  function add(n,x,y,z,rx,ry,rz){
    var next=n+1, meta=next===9?{era:"2018",title:"마지막 일기"}:CH[next-1];
    var mat=paperTex(meta.title,meta.era,"#a03528");
    mat.polygonOffset=true;
    mat.polygonOffsetFactor=-2;
    mat.polygonOffsetUnits=-2;
    var m=plane(0.34,0.25,mat,x,y,z);
    m.rotation.set(rx||0,ry||0,rz||0);
    m.renderOrder=3;
    m.userData.hot={id:"reward:"+n,name:"편지"};
    m.visible=false;scene.add(m);rewardObjs[n]=m;
  }
  add(1, 0.62,0.805,-2.89,-Math.PI/2,0,0);
  add(2,-2.60,1.072, 3.70,-Math.PI/2,0,0); /* 사물함 상단(1.065m) 표면 위에 정확히 안착 */
  add(3,-2.30,0.668, 1.35, Math.PI/2,0,0); /* 학생 책상 하단(0.670m) 밑면 — 아래에서 올려다보므로 앞면이 -Y를 향해야 한다 */
  add(4, 3.10,1.000,-3.89,0,0,0);
  add(5, 4.45,0.720, 3.89,0,Math.PI,0);
  add(6, 0.00,2.680,-3.89,0,0,0);
  add(7, 1.22,0.730, 1.35,-Math.PI/2,0,0);
  add(8,-4.75,1.760, 2.50,0,Math.PI/2,0);
}
function setRewardVisible(n,visible){
  var m=rewardObjs[n];if(!m)return;
  m.visible=visible;
  var i=hotspots.indexOf(m);
  if(visible&&i<0)hotspots.push(m);
  if(!visible&&i>=0)hotspots.splice(i,1);
}
function setClueHotEnabled(n,enabled){
  (clueHotObjs[n]||[]).forEach(function(m){
    var i=hotspots.indexOf(m);
    if(enabled&&i<0)hotspots.push(m);
    if(!enabled&&i>=0)hotspots.splice(i,1);
  });
}
function setDiaryOneOnDesk(visible){
  if(!diaryObj)return;
  diaryObj.visible=visible;
  var i=hotspots.indexOf(diaryObj);
  if(visible&&i<0)hotspots.push(diaryObj);
  if(!visible&&i>=0)hotspots.splice(i,1);
}
function moveTo(obj,x,y,z,instant){
  if(!obj)return;
  if(instant||!preferences.motion){obj.position.set(x,y,z);delete obj.userData.moveTarget;return;}
  obj.userData.moveTarget=new THREE.Vector3(x,y,z);
  if(revealMovers.indexOf(obj)<0)revealMovers.push(obj);
}
/* 리빌 앵커 — 최초 배치(home)와 리빌 후 위치(away)의 유일한 출처.
   이전에는 buildRoom / applyRevealState / resetRevealState 세 곳에 같은 좌표가
   복제돼 있었고, 실제로 어긋난 적이 있다(쪽지 y: 0.67 vs 0.695).
   객체는 buildRoom이 끝나야 존재하므로 게터로 지연 참조한다. */
var REVEAL_ANCHORS=[
  {ch:1,get:function(){return calendarObj;},      home:[ 0.62,0.920,-2.92], away:[ 1.02,0.920,-2.92]},
  {ch:1,get:function(){return calendarBaseObj;},  home:[ 0.62,0.820,-2.88], away:[ 1.02,0.820,-2.88]},
  {ch:2,get:function(){return dollGroup;},        home:[-2.60,1.050, 3.70], away:[-2.00,1.050, 3.70]},
  {ch:3,get:function(){return postitObj;},        home:[-2.30,0.670, 1.35], away:[-1.95,0.670, 1.35]},
  {ch:4,get:function(){return teacherGroup;},     home:[ 3.10,0.000,-3.42], away:[ 2.42,0.000,-3.42]},
  {ch:5,get:function(){return extinguisherGroup;},home:[ 4.45,0.000, 3.40], away:[ 4.05,0.000, 3.40]},
  {ch:6,get:function(){return clockGroup;},       home:[ 0.00,2.680,-3.91], away:[ 0.78,2.680,-3.91]},
  {ch:7,get:function(){return mathBookG;},        home:[ 1.22,0.745, 1.35], away:[ 1.60,0.745, 1.35]}
];
/* buildRoom 끝에서 호출 — 앵커 대상의 최초 배치를 테이블에서 확정한다. */
function placeAnchorHomes(){
  REVEAL_ANCHORS.forEach(function(a){
    var o=a.get();if(o)o.position.set(a.home[0],a.home[1],a.home[2]);
  });
}
function applyRevealState(n,instant){
  REVEAL_ANCHORS.forEach(function(a){
    if(a.ch!==n)return;
    var o=a.get();if(o)moveTo(o,a.away[0],a.away[1],a.away[2],instant);
  });
  if(n===8){openCurtain(3,false);setDark(true);}
}
function resetRevealState(){
  revealMovers.length=0;
  REVEAL_ANCHORS.forEach(function(a){
    var o=a.get();if(o)moveTo(o,a.home[0],a.home[1],a.home[2],true);
  });
  for(var n=1;n<=8;n++){setRewardVisible(n,false);setClueHotEnabled(n,true);}
  setDiaryOneOnDesk(true);
  openCurtain(3,true);setDark(false);
  if(doorPivot)doorPivot.rotation.y=0;
  document.body.classList.remove("ending");$("#whiteout").classList.remove("on");
}
var REVEAL_TEXT={
  1:"달력을 치우자 편지가 나타났다.",
  2:"인형을 옆으로 치우자 아래에서 편지가 나타났다.",
  3:"쪽지를 옆으로 젖히자 편지가 나타났다.",
  4:"감독교사가 비켜서자 뒤에서 편지가 나타났다.",
  5:"소화기를 옮기자 뒤에서 편지가 나타났다.",
  6:"시계를 옮기자 뒤에서 편지가 나타났다.",
  7:"수학책을 치우자 아래에서 편지가 나타났다.",
  8:"커튼을 닫자 그 위에 붙은 편지가 보였다."
};
function revealReward(n){
  if(S.revealed===n){toast("드러난 편지를 눌러 읽으세요.");return;}
  S.revealed=n;setClueHotEnabled(n,false);applyRevealState(n,false);setRewardVisible(n,true);save();renderHUD();
  toast(REVEAL_TEXT[n],"good");
}
function refreshBoard(){
  if(!boardGroup)return;
  while(boardGroup.children.length){
    var ch0=boardGroup.children[0];
    var hi=hotspots.indexOf(ch0); if(hi>=0)hotspots.splice(hi,1);
    boardGroup.remove(ch0);
    /* 지오메트리는 _geoCache가 공유하므로 여기서 해제하면 안 된다.
       매번 새로 만드는 것은 머티리얼과 캔버스 텍스처뿐이다. */
    if(ch0.material){if(ch0.material.map)ch0.material.map.dispose();ch0.material.dispose();}
  }
  var maxD=Math.min(S.ch,9);
  var x0=-2.36,dx=0.59,yDiary=2.18,yPaper=1.34;
  function addPaper(it,x,y,tilt){
    var m=plane(0.42,0.31,paperTex(it.t,it.s,it.c),x,y,-3.93);
    m.rotation.z=tilt;boardGroup.add(m);
    var hh=plane(0.50,0.39,new THREE.MeshBasicMaterial({transparent:true,opacity:0}),x,y,-3.90);
    boardGroup.add(hot(hh,it.id,it.label));
  }
  for(var n=1;n<=maxD;n++){
    if(n===1&&!S.tookD1)continue;
    var meta=(n===9)?{era:"2018",title:"마지막"}:CH[n-1];
    var x=x0+(n-1)*dx,diaryTitle=n===9?"마지막 일기":n+"번째 일기";
    addPaper({id:"diaryP:"+n,t:diaryTitle,s:meta.era,c:"#a03528",label:"일기"},x,yDiary,(((n*37)%9)-4)*0.008);
    var p=BOARD_PAPERS[n];
    if(p)addPaper({id:p.id==="sheet"?"sheet":"refP:"+p.id,t:p.name,s:"",c:"#2f5f8a",label:p.label},x,yPaper,-(((n*29)%7)-3)*0.008);
  }
}
function portraitFrameMat(){
  var m=new THREE.MeshBasicMaterial({color:0x8a6134});
  m.color.convertSRGBToLinear();
  m.userData=m.userData||{};
  m.userData.colorAlreadyLinear=true;
  return m;
}
function drawFrameBars(id){
  var g3=frameObjs[id];if(!g3)return;
  var bars=g3.userData.bars;
  while(bars.children.length)bars.remove(bars.children[0]);
  var sym=SYM_OF[id], rotKey=sym||id;
  var sig=sym?FRAME_SIG[sym]:[1,1,1,1];
  g3.userData.tz=-(S.rot[rotKey]||0)*Math.PI/2;
  var PW=0.52,PH=0.62,TK=0.070,TN=0.007;
  var tt=sig[0]?TK:TN, tr=sig[1]?TK:TN, tb=sig[2]?TK:TN, tl=sig[3]?TK:TN;
  function bar(w,h,x,y,thick){
    var mat=portraitFrameMat();
    var m=new THREE.Mesh(new THREE.BoxGeometry(w,h,thick?0.042:0.030),mat);
    m.position.set(x,y,thick?0.024:0.018);
    m.renderOrder=8;
    bars.add(m);
  }
  /* The portrait edge is the inner edge of every bar.
     This keeps the quiz thickness visible without exposing wall color. */
  bar(PW+tl+tr,tt,(tr-tl)/2, PH/2+tt/2,sig[0]);
  bar(tr,PH, PW/2+tr/2,0,sig[1]);
  bar(PW+tl+tr,tb,(tr-tl)/2,-PH/2-tb/2,sig[2]);
  bar(tl,PH,-PW/2-tl/2,0,sig[3]);
}
function openCurtain(i,open){
  var c=curtainObjs[i];if(!c)return;
  c.userData.closed=!open;
  c.scale.z=open?0.22:1;
  setTimeout(syncPools,0);
  if(open){c.position.z=[-2.7,-0.95,0.8,2.55][i]+0.58;}
  else{c.position.z=[-2.7,-0.95,0.8,2.55][i];}
}
function syncPools(){
  if(!lightPools.length)return;
  curtainObjs.forEach(function(c,i){
    if(lightPools[i])lightPools[i].visible=!c.userData.closed;
    if(lightShafts[i])lightShafts[i].visible=!c.userData.closed;
  });
}
function setDark(dark){
  if(!sunLight)return;
  sunLight.intensity=dark?.08:1.25;fillLight.intensity=dark?.16:.32;
  ambLight.intensity=dark?.16:.34;hemiLight.intensity=dark?.20:.48;
  groundLight.intensity=dark?.08:.34;backLamp.intensity=dark?.10:.28;
  screenGlow.intensity=dark?1.1:.45;screenGlow.distance=dark?7.5:3.4;
  scene.background.setHex(dark?0x10282e:0x284448);scene.fog.color.copy(scene.background);
  if(ceilMesh)ceilMesh.material.color.setHex(dark?0xa2b7ba:0xffffff).convertSRGBToLinear();
  lightPools.forEach(function(p){p.material.opacity=dark?0:.14;});
  lightShafts.forEach(function(p){p.material.opacity=dark?0:.065;});
  if(dustMat)dustMat.opacity=dark?.04:.12;
}

/* 컨트롤 */
function initControls(){
  /* 시선 드래그는 반드시 포인터 하나만 따라간다. pid 를 두지 않으면
     끌던 중 손가락이 하나 더 닿거나(손바닥·엄지) 오른버튼이 눌리는 순간
     시작점이 그쪽으로 덮어써지고, 그 포인터가 떨어질 때 드래그 전체가
     끝나 버린다. "가다가 중간에 끊긴다"의 원인이다. */
  var cv=$("#scene"),pid=null,lx=0,ly=0,moved=0;
  function pt(e){var t=e.touches?e.touches[0]:e;return{x:t.clientX,y:t.clientY};}
  function endDrag(){pid=null;cv.classList.remove("dragging");}
  cv.addEventListener("pointerdown",function(e){
    if(inputBlocked())return;
    if(pid!==null)return;                       /* 이미 끌고 있으면 두 번째 포인터는 무시 */
    if(e.pointerType==="mouse"&&e.button!==0)return;
    pid=e.pointerId;moved=0;var p=pt(e);lx=p.x;ly=p.y;
    cv.classList.add("dragging");
    try{cv.setPointerCapture&&cv.setPointerCapture(e.pointerId);}catch(_){}});
  cv.addEventListener("pointermove",function(e){
    if(inputBlocked()){endDrag();return;}
    var p=pt(e);
    if(e.pointerId===pid){var dx=p.x-lx,dy=p.y-ly;lx=p.x;ly=p.y;moved+=Math.abs(dx)+Math.abs(dy);
      yaw+=dx*0.0034*preferences.sensitivity;pitch-=dy*0.0030*preferences.sensitivity;focusTarget=null;
      pitch=Math.max(-1.05,Math.min(1.05,pitch));}
    else if(pid!==null)return;                  /* 끌던 중 다른 포인터는 호버 판정도 건드리지 않는다 */
    hoverThrottled(p.x,p.y);
  });
  function up(e){if(e.pointerId!==pid)return;endDrag();
    if(moved<7){pick(lx,ly);} }
  cv.addEventListener("pointerup",up);
  cv.addEventListener("pointercancel",function(e){if(e.pointerId===pid)endDrag();});
  addEventListener("resize",resize);
  var MAPK={w:"w",a:"a",s:"s",d:"d",W:"w",A:"a",S:"s",D:"d",
    ArrowUp:"lookUp",ArrowLeft:"lookLeft",ArrowDown:"lookDown",ArrowRight:"lookRight",
    "\u3148":"w","\u3141":"a","\u3134":"s","\u3147":"d"};
  addEventListener("keydown",function(e){
    var k=MAPK[e.key];if(!k||isTyping()||inputBlocked())return;
    keys[k]=true;if(e.key.indexOf("Arrow")===0)e.preventDefault();});
  addEventListener("keyup",function(e){var k=MAPK[e.key];if(k)keys[k]=false;});
  addEventListener("keydown",function(e){
    if(isTyping()||inputBlocked()||e.repeat)return;
    if(e.key.toLowerCase()==="e"){e.preventDefault();e.stopImmediatePropagation();pick(innerWidth/2,innerHeight/2);}
    if(e.key.toLowerCase()==="j"){e.preventDefault();e.stopImmediatePropagation();showJournal();}
    if(e.key==="c"||e.key==="C"||e.key==="ㅊ"||e.key==="Control")toggleCrouch();});
  addEventListener("blur",function(){keys={};joy.x=joy.z=0;});

  if(IS_TOUCH)document.body.classList.add("touch");
  var joyEl=$("#joy"), knob=$("#joyk"), jid=null, R=46;
  function setKnob(dx,dy){knob.style.transform="translate("+dx+"px,"+dy+"px)";}
  function joyMove(e){
    var b=joyEl.getBoundingClientRect();
    var dx=e.clientX-(b.left+b.width/2), dy=e.clientY-(b.top+b.height/2);
    var d=Math.hypot(dx,dy); if(d>R){dx=dx/d*R;dy=dy/d*R;d=R;}
    setKnob(dx,dy); joy.x=dx/R; joy.z=-dy/R;
  }
  joyEl.addEventListener("pointerdown",function(e){
    if(inputBlocked()||jid!==null)return;
    jid=e.pointerId;joyEl.setPointerCapture(e.pointerId);joyMove(e);e.preventDefault();});
  joyEl.addEventListener("pointermove",function(e){if(e.pointerId===jid&&!inputBlocked())joyMove(e);});
  function joyEnd(e){if(e.pointerId!==jid)return;jid=null;joy.x=joy.z=0;setKnob(0,0);}
  joyEl.addEventListener("pointerup",joyEnd);
  joyEl.addEventListener("pointercancel",joyEnd);
  joyEl.addEventListener("lostpointercapture",joyEnd);
  function releaseInput(){endDrag();jid=null;joy.x=joy.z=0;keys={};setKnob(0,0);}
  addEventListener("blur",releaseInput);document.addEventListener("visibilitychange",releaseInput);
  cv.addEventListener("lostpointercapture",function(e){if(e.pointerId===pid)endDrag();});

  $("#act").addEventListener("click",function(){ pick(innerWidth/2,innerHeight/2); });
  $("#crouch").addEventListener("click",toggleCrouch);
  $("#fs").addEventListener("click",function(){toggleFS();});
  addEventListener("orientationchange",function(){setTimeout(function(){resize();},250);});
}
function checkOrient(){
  if(!IS_TOUCH)return;
  document.body.classList.toggle("portrait", innerHeight>innerWidth);
}

function resize(){
  checkOrient();
  if(!renderer)return;
  renderer.setPixelRatio(Math.min(devicePixelRatio,2));
  renderer.setSize(innerWidth,innerHeight);
  camera.aspect=innerWidth/innerHeight;
  if(camera.aspect < 0.75){
    camera.fov = 84;
  } else if(camera.aspect < 1.25){
    camera.fov = 70;
  } else {
    /* 모바일 가로(16:9 ~ 21:9): 수평 화각(HFOV)을 86°로 안정화하여 좌우 가장자리 왜곡(Fisheye) 방지 */
    var targetHFOV = 86 * Math.PI / 180;
    var vFov = (2 * Math.atan(Math.tan(targetHFOV / 2) / camera.aspect)) * 180 / Math.PI;
    camera.fov = Math.max(46, Math.min(60, vFov));
  }
  camera.updateProjectionMatrix();
}
function ndc(x,y){return new THREE.Vector2((x/innerWidth)*2-1,-(y/innerHeight)*2+1);}
function castAt(x,y){
  ray.setFromCamera(ndc(x,y),camera);
  var hits=ray.intersectObjects(hotspots,false);
  if(!hits.length)return null;
  lastDist=hits[0].distance;
  return hits[0].object;
}
var lastHover=null, lastDist=0, REACH=3.0, hoverFar=false, _hoverAt=0;
/* 포인터 이동마다 전체 hotspot 레이캐스트를 돌 이유가 없다. ~30Hz로 충분하다. */
function hoverThrottled(x,y){
  var now=performance.now();
  if(now-_hoverAt<33)return;
  _hoverAt=now;hover(x,y);
}
function hover(x,y){
  var o=castAt(x,y);
  var r=$("#reticle"),lb=$("#label");
  if(o&&o.userData.hot){
    hoverFar=lastDist>REACH;
    r.classList.toggle("hot",!hoverFar);
    r.classList.toggle("far",hoverFar);
    lb.innerHTML=o.userData.hot.name+(hoverFar?'<i>더 가까이 가세요</i>':'');
    lb.style.left=x+"px";lb.style.top=y+"px";lb.classList.add("show");
  }else{hoverFar=false;r.classList.remove("hot");r.classList.remove("far");lb.classList.remove("show");}
  var ab=$("#act"); if(ab)ab.classList.toggle("off",!o||hoverFar);
  lastHover=o;
}
function pick(x,y){
  var o=castAt(x,y);
  if(!o||!o.userData.hot)return;
  if(lastDist>REACH){toast("더 가까이 가세요.");return;}
  focusOn(o);interact(o.userData.hot.id);
}
function toggleFS(){
  var d=document, e=d.documentElement;
  var on=d.fullscreenElement||d.webkitFullscreenElement;
  try{
    var pr = on ? (d.exitFullscreen||d.webkitExitFullscreen).call(d)
                : (e.requestFullscreen||e.webkitRequestFullscreen).call(e);
    if(pr&&pr.catch)pr.catch(function(){});
  }catch(err){ toast("이 기기에서는 전체화면을 지원하지 않습니다.","bad"); }
}
function toggleCrouch(){
  if(inputBlocked())return;
  crouch=!crouch;
  $("#crouch").setAttribute("aria-pressed",String(crouch));$("#t-crouch").setAttribute("aria-pressed",String(crouch));
  $("#crouch").classList.toggle("on",crouch);
  $$("#toolbar #t-crouch").forEach(function(b){b.classList.toggle("act",crouch);});
  if(crouch && pitch < 0.08) pitch = 0.22;
}
function gotoSpot(i){
  spotIdx=i;var s=SPOTS[i];
  camera.position.set(s.p[0],s.p[1],s.p[2]);yaw=s.y;pitch=-0.13;

}
var focusTarget=null,focusT=0;
function focusOn(obj){
  if(!obj)return;
  var p=new THREE.Vector3();obj.getWorldPosition(p);
  var d=p.clone().sub(camera.position);
  var ty=Math.atan2(d.x,d.z), tp=Math.asin(Math.max(-1,Math.min(1,d.y/(d.length()||1))));
  focusTarget={y:ty,p:tp};focusT=0;
}
var _dir=null,_look=null;
function loop(t){
  requestAnimationFrame(loop);
  if(!_dir){_dir=new THREE.Vector3();_look=new THREE.Vector3();}
  /* 모든 보간이 dt를 쓰도록 프레임 시간을 맨 앞에서 구한다.
     고정 계수를 그대로 쓰면 120Hz 화면에서 연출이 두 배로 빨라진다. */
  var now=performance.now()/1000, dt=lastT?Math.min(now-lastT,0.14):0; lastT=now;
  if(camera){var ty=crouch?EYE_LOW:EYE;
    if(Math.abs(camera.position.y-ty)>0.004)camera.position.y+=(ty-camera.position.y)*damp(0.22,dt);
    else camera.position.y=ty;}
  if(camera&&!inputBlocked()&&(IS_TOUCH||keys.lookLeft||keys.lookRight||keys.lookUp||keys.lookDown))hoverThrottled(innerWidth/2,innerHeight/2);
  moveStep(dt);
  for(var mi=revealMovers.length-1;mi>=0;mi--){
    var mo=revealMovers[mi],mt=mo.userData.moveTarget;
    if(!mt){revealMovers.splice(mi,1);continue;}
    mo.position.lerp(mt,damp(0.12,dt));
    if(mo.position.distanceTo(mt)<0.004){mo.position.copy(mt);delete mo.userData.moveTarget;revealMovers.splice(mi,1);}
  }
  if(focusTarget){
    focusT=Math.min(1,focusT+(dt>0?dt*5.4:0.09));
    var e=1-Math.pow(1-focusT,3);
    var dy=((focusTarget.y-yaw+Math.PI*3)%(Math.PI*2))-Math.PI;
    var fk=damp(0.16,dt);
    yaw+=dy*fk*(1-e*0.2);
    pitch+=(focusTarget.p-pitch)*fk;
    if(focusT>=1)focusTarget=null;
  }
  if(dust&&preferences.motion){dust.rotation.y+=0.0132*dt;}
  for(var fk in frameObjs){
    var fg=frameObjs[fk];if(!fg||!fg.userData.spin)continue;
    var tz=fg.userData.tz||0, cz=fg.userData.spin.rotation.z;
    if(Math.abs(tz-cz)>0.002)fg.userData.spin.rotation.z=cz+(tz-cz)*damp(0.22,dt);
    else fg.userData.spin.rotation.z=tz;
  }
  if(arrowObj&&arrowObj.visible){
    arrowObj.position.y=1.12+(preferences.motion?Math.sin(performance.now()/380)*0.035:0);
    if(preferences.motion)arrowObj.rotation.y+=1.2*dt;}
  if(window.clockSecondHand){
    clockSecondHand.rotation.z=-now*(Math.PI/30);
  }
  if(window.earthMesh&&preferences.motion){
    if(window.globeSpinVel && window.globeSpinVel > 0.003) window.globeSpinVel *= Math.pow(0.96,dt*60);
    window.earthMesh.rotation.y += (window.globeSpinVel || 0.002)*dt*60;
  }
  var tMixer = teacherMixer || window.teacherMixer;
  if(tMixer&&preferences.motion){
    tMixer.update(dt);
  }
  _dir.set(Math.sin(yaw)*Math.cos(pitch),Math.sin(pitch),Math.cos(yaw)*Math.cos(pitch));
  _look.copy(camera.position).add(_dir);
  camera.lookAt(_look);
  if(sceneIsIdle())return;   /* 모달 뒤 정지 화면을 매 프레임 다시 그리지 않는다 */
  renderer.render(scene,camera);
}
/* 모달·엔딩이 덮여 있고 애니메이션이 하나도 없으면 마지막 프레임 그대로 둔다.
   인트로는 3D 배경이 비쳐야 하므로 제외한다. */
function sceneIsIdle(){
  if(focusTarget||revealMovers.length||_pbrJobs.length)return false;
  var m=document.getElementById("modal"), en=document.getElementById("ending-scene");
  var covered=(m&&!m.classList.contains("hidden"))||!!en;
  if(!covered)return false;
  for(var fk in frameObjs){
    var fg=frameObjs[fk];
    if(fg&&fg.userData.spin&&Math.abs((fg.userData.tz||0)-fg.userData.spin.rotation.z)>0.002)return false;
  }
  return true;
}

/* ======================= [8] 자료·입력 UI ======================= */
var modalAfterClose=null;
function diaryArticle(key,chapterNo){
  return el("article","paper",DIARY_HTML[key]);
}

function terminalAidDetails(list,title,html){
  var d=el("details","item");d.innerHTML='<summary>'+title+'</summary>';
  d.appendChild(el("div","in",html));list.appendChild(d);
}

/* ── 인쇄물·자료의 유일한 렌더러 ──────────────────────────────────────
   터미널 옆 패널과 자료 모달이 같은 함수를 쓴다. 예전에는 두 벌이라
   한쪽만 고치면 내용이 갈라졌다. host에 그려 넣는다. */
var KEYB_HTML='<ol style="margin:6px 0 0;padding-left:19px;line-height:1.8">'+
  '<li>알파벳을 입력할 때에는 알파벳의 순서만큼 근육을 움직인 뒤 5초간 대기합니다. (예: c는 세 번)</li>'+
  '<li>마침표는 근육을 28번 움직인 후 5초 대기합니다. 이 마지막 대기도 총시간에 포함합니다.</li></ol>';
var VIDEO_NOTE="화면이 크게 손상되어 있습니다. 자막을 끝까지 읽어 보세요.";

function sciDetailHTML(s){
  return '<dl><dt>생몰</dt><dd>'+s.born+' ~ '+s.died+'</dd><dt>핵심</dt><dd>'+s.key+'</dd></dl>'+
    '<p style="margin:10px 0 0">'+s.body+'</p>'+
    (s.fix?'<p class="fixnote">※ '+s.fix+'</p>':'');
}
function sportDetailHTML(s){
  return '<dl><dt>한 팀 인원</dt><dd>'+s.players+'명</dd><dt>주요 규칙</dt><dd>'+s.rule+'</dd>'+
    '<dt>포지션</dt><dd>'+s.roles.join(", ")+'</dd></dl>';
}
function enLabel(name,en){
  return name+' <span class="en">'+en+'</span>';
}
function buildMapGrid(){
  var mw=el("div","mapwrap"),mg=el("div","mapgrid");
  for(var r=1;r<=MAP_ROWS;r++)for(var c=1;c<=MAP_COLS;c++){
    var nm=MAP_PRINTED[r+","+c];
    if(r===5&&c>2){mg.appendChild(el("div","mc void"));continue;}
    mg.appendChild(el("div","mc"+(nm?"":" blank"),nm||""));
  }
  mw.appendChild(mg);return mw;
}
function mysteryVideo(){
  var v=el("video");v.controls=true;v.preload="metadata";v.playsInline=true;v.src=A.videoMystery;return v;
}
/* kind: sci | sport | map | video | keyb | frames */
function renderResource(kind,host){
  var list=el("div","list");
  if(kind==="frames"){ host.appendChild(el("div","symbol-sheet",symbolSheetHTML())); return; }
  if(kind==="sci"){
    SCI.forEach(function(s){terminalAidDetails(list,enLabel(s.name,s.en),sciDetailHTML(s));});
    host.appendChild(list);return;
  }
  if(kind==="sport"){
    SPORTS.forEach(function(s){terminalAidDetails(list,enLabel(s.name,s.en),sportDetailHTML(s));});
    host.appendChild(list);return;
  }
  if(kind==="map"){
    host.appendChild(buildMapGrid());
    var ol=el("ol","maproutes");
    ol.innerHTML=MAP_ROUTES.map(function(v){return '<li>'+v.t+'</li>';}).join("");
    host.appendChild(ol);return;
  }
  if(kind==="video"){
    host.appendChild(mysteryVideo());
    host.appendChild(el("p","mini",VIDEO_NOTE));
    var transcript=el("details","puzzle-hint");
    transcript.appendChild(el("summary",null,"영상 없이 풀기"));
    transcript.appendChild(el("p",null,"섞인 문자열에서 BACKUP을 이루는 여섯 알파벳을 모두 지워 보세요. 남은 글자를 처음부터 읽으면 책 제목이 됩니다."));
    host.appendChild(transcript);return;
  }
  if(kind==="dict"){
    var table=el("table","vocab-table");
    table.innerHTML='<caption>쪽지에 쓰인 영어 어휘</caption><thead><tr><th scope="col">영어</th><th scope="col">뜻</th></tr></thead><tbody>'+VOCABULARY.map(function(v){return '<tr><th scope="row">'+v[0]+'</th><td>'+v[1]+'</td></tr>';}).join("")+'</tbody>';
    host.appendChild(table);return;
  }
  if(kind==="keyb"){
    terminalAidDetails(list,"근섬유 전기신호키보드 사용법",KEYB_HTML);
    host.appendChild(list);return;
  }
  host.appendChild(el("p","mini","이 장에는 별도의 인쇄 자료가 없습니다. 일기를 다시 읽어 보세요."));
}



var _modalReturnFocus=null;
function openModal(title,sub,build,afterClose,closeText){
  var previousFocus=document.activeElement;
  $("#m-title").textContent=title;$("#m-sub").textContent=sub||"";
  $$("#m-body video").forEach(function(v){v.pause();});
  activeAnswerPad=null;
  var b=$("#m-body");b.innerHTML="";build(b);
  keys={};joy.x=joy.z=0;
  document.body.classList.add("reading");
  $("#scene").setAttribute("inert","");
  $("#hud").setAttribute("inert","");
  modalAfterClose=afterClose||null;
  $("#modal [data-x]").textContent=closeText||"닫기";
  $("#modal").classList.remove("hidden");
  $("#reticle").classList.remove("hot");$("#label").classList.remove("show");
  /* 키보드 사용자가 캔버스에 갇히지 않도록 포커스를 모달로 넘긴다. */
  _modalReturnFocus=(previousFocus&&previousFocus!==document.body&&!$("#modal").contains(previousFocus))?previousFocus:$("#scene");
  var candidates=$$("#m-body [role='tab'][aria-selected='true'], #m-body .answer-display, #m-body button, #m-body a[href], #m-body input");
  var first=candidates.filter(function(node){return node.getClientRects().length;})[0]||$("#modal [data-x]");
  if(first)try{first.focus({preventScroll:true});}catch(err){first.focus();}
}
function closeModal(){
  if($("#modal").classList.contains("hidden"))return;
  $$("#m-body video").forEach(function(v){v.pause();});
  $("#modal").classList.add("hidden");
  $("#modal").classList.remove("assembly-modal","terminal-modal");
  document.body.classList.remove("reading");
  $("#scene").removeAttribute("inert");$("#hud").removeAttribute("inert");
  activeAnswerPad=null;
  $("#modal [data-x]").textContent="닫기";
  var done=modalAfterClose;modalAfterClose=null;
  var back=_modalReturnFocus;_modalReturnFocus=null;
  if(back&&document.contains(back))try{back.focus({preventScroll:true});}catch(err){}
  if(done)setTimeout(done,0);
}

function showDiary(n,afterClose,closeText){
  var key = n===9?"diary9":("diary"+n);
  var c = n===9?{era:"2018",title:"마지막 일기"}:CH[n-1];
  openModal(c.title,"기록 · 일기",function(b){
    b.appendChild(diaryArticle(key,n));
  },afterClose,closeText);
}
var VOCABULARY=[
 ["arithmetic","산술(계산)"],["benevolent","자애로운"],
 ["cooperative","협력하는"],["eclectic","절충적인"],["enthusiastic","열광적인"],["fear","두려움"],
 ["individual","개인"],["kind","친절한"],["laughter","웃음"],["obedient","말을 잘 듣는"],
 ["optimistic","낙관적인"],["pensive","수심 어린"],["radical","급진적인"],
 ["ruthless","가차없는"],["unperturbed","동요하지 않는"]
];
var PUZZLE_HINTS={
  1:"일기 속 인물이 주장한 우주관과 과학자 자료의 사망일을 함께 보세요.",
  2:"과학자와 기호를 연결한 뒤 종이의 방향대로 액자를 돌려 보세요. 굵은 테두리도 단서입니다.",
  3:"나를 포함한 팀 인원과 평균 이하의 체중이 단서입니다. 운동경기 자료에서 역할을 찾으세요.",
  4:"별이 한 점으로 모이는 그림을 반대 방향으로 읽어 보세요.",
  5:"상점 이름의 첫 글자를 알파벳 순서로 배치해 보세요. 각 경로는 명시된 상점에서 새로 시작합니다.",
  6:"영상 속 자막의 단서와 섞인 문자열을 비교하세요. 영상이 재생되지 않으면 자료의 ‘영상 없이 풀기’를 펼쳐보세요.",
  7:"빨간 단어를 위에서부터 읽고, 어휘표에서 대응하는 영어 단어의 첫 글자를 이어보세요.",
  8:"h, e, l, p, 마침표의 움직임 횟수를 더하세요. 각 입력 뒤의 대기도 다섯 번 포함됩니다."
};
var REF_TITLE={sci:"수학자·과학자 자료",sport:"운동경기 자료",map:"신부가 건넨 지도",
               video:"의문의 영상",keyb:"근섬유 키보드 사용법",frames:"기호 종이",dict:"영어 어휘표"};
var PUZZLE_REF={date300:"sci",frames:"sci",position:"sport",map:"map",cipher:"video",typing:"keyb",dict:"dict"};
function showRefs(kind){
  var p=kind||PUZZLE_REF[chapter().puzzle];
  openModal(REF_TITLE[p]||"자료","교실에 비치된 인쇄물",function(b){
    renderResource(p,b);
  });
}

/* 버튼형 정답 키보드 — 실제 input/contenteditable을 쓰지 않아 모바일 시스템 키보드가 뜨지 않는다 */
function makeAnswerPad(mode){
  var state="",root=el("div","answer-ui"),display=el("div","answer-display");
  display.tabIndex=0;display.setAttribute("role","textbox");
  display.setAttribute("aria-label",mode==="number"?"숫자 정답":"영어 정답");
  display.setAttribute("aria-readonly","true");
  display.setAttribute("data-placeholder",mode==="number"?"숫자 입력":"영어 입력");
  var keysEl=el("div","answer-keys "+(mode==="number"?"number":"alpha"));
  var chars=(mode==="number"?"1234567890":"ABCDEFGHIJKLMNOPQRSTUVWXYZ").split("");
  function paint(){display.textContent=state;}
  function add(ch){if(state.length<40){state+=ch.toUpperCase();paint();}}
  chars.forEach(function(ch){var b=el("button","answer-key",ch);b.type="button";b.onclick=function(){add(ch);};keysEl.appendChild(b);});
  var tools=el("div","answer-tools");
  var back=el("button","answer-tool","⌫ 지우기"),clear=el("button","answer-tool","전체 지우기");
  back.type=clear.type="button";back.onclick=function(){state=state.slice(0,-1);paint();};clear.onclick=function(){state="";paint();};
  tools.appendChild(back);tools.appendChild(clear);root.appendChild(display);root.appendChild(keysEl);root.appendChild(tools);
  var api={el:root,value:function(){return state;},clear:clear.onclick,submit:null,
    key:function(e){
      if(e.ctrlKey||e.metaKey||e.altKey||e.isComposing)return;
      var panel=root.closest(".terminal-panel");
      if(panel&&getComputedStyle(panel).display==="none")return;
      if((mode==="number"?/^[0-9]$/:/^[a-z]$/i).test(e.key)){e.preventDefault();add(e.key);display.focus({preventScroll:true});}
      else if(e.key==="Backspace"){e.preventDefault();back.onclick();display.focus({preventScroll:true});}
      else if(e.key==="Enter"&&document.activeElement===display){e.preventDefault();if(api.submit)api.submit();}
    }};
  activeAnswerPad=api;return api;
}

/* 컴퓨터 터미널 */
function showComputer(){
  var c=chapter();
  if(S.done){showEnding();return;} if(S.ch>8){showAssembly();return;}
  $("#modal").classList.add("terminal-modal");
  openModal("장학금 단말기","기록 "+c.n+" / 8 · "+c.title,function(b){
    var kind=PUZZLE_REF[c.puzzle];
    if(c.n===2)kind="frames";
    var tabs=el("div","terminal-tabs");tabs.setAttribute("role","tablist");tabs.setAttribute("aria-label","퍼즐 자료와 입력");
    var workspace=el("div","terminal-workspace"+(!kind?" no-materials":""));
    var names=[["diary","일기"],["materials","자료"],["answer","정답 입력"]];
    var panels={},buttons={};
    function select(name){
      Object.keys(panels).forEach(function(k){panels[k].classList.toggle("active",k===name);buttons[k].setAttribute("aria-selected",String(k===name));buttons[k].tabIndex=k===name?0:-1;});
      if(name==="answer"&&activeAnswerPad){var display=activeAnswerPad.el.querySelector(".answer-display");if(display)display.focus({preventScroll:true});}
    }
    names.forEach(function(v){
      if(v[0]==="materials"&&!kind)return;
      var button=el("button",null,v[1]);button.type="button";button.id="tab-"+v[0];button.setAttribute("role","tab");button.setAttribute("aria-controls","panel-"+v[0]);
      var panel=el("section","terminal-panel scrolls");panel.id="panel-"+v[0];panel.dataset.panel=v[0];panel.setAttribute("role","tabpanel");panel.setAttribute("aria-labelledby",button.id);panel.tabIndex=0;
      panels[v[0]]=panel;buttons[v[0]]=button;button.onclick=function(){select(v[0]);};tabs.appendChild(button);workspace.appendChild(panel);
    });
    tabs.addEventListener("keydown",function(e){
      if(!["ArrowLeft","ArrowRight","Home","End"].includes(e.key))return;
      e.preventDefault();var ids=Object.keys(buttons),i=ids.indexOf(document.activeElement.id.replace("tab-",""));
      i=e.key==="Home"?0:e.key==="End"?ids.length-1:(i+(e.key==="ArrowRight"?1:-1)+ids.length)%ids.length;
      select(ids[i]);buttons[ids[i]].focus();
    });
    panels.diary.appendChild(diaryArticle(c.diary,c.n));
    if(kind)renderResource(kind,panels.materials);
    b.appendChild(tabs);b.appendChild(workspace);
    var t=el("div","term");panels.answer.appendChild(t);
    if(S.phase==="search"){
      t.appendChild(el("div","l","암호 해제"));t.appendChild(el("div","cue",c.cue));
      var explore=el("button","btn btn-p answer-submit","교실에서 찾아보기");explore.onclick=closeModal;panels.answer.appendChild(explore);select("answer");return;
    }
    t.appendChild(el("div","l","SCHOLARSHIP TERMINAL"));
    t.appendChild(el("div","rule",c.n===1?"생년월일 8자리 · 예: 20000102":c.n===8?"총시간을 초 단위로 입력":"영어 · 대소문자 무관 · 띄어쓰기 없음"));
    var pad=makeAnswerPad(c.n===1||c.n===8?"number":"alpha");t.appendChild(pad.el);
    var feedback=el("p","answer-feedback");feedback.setAttribute("role","status");t.appendChild(feedback);
    var submit=el("button","btn btn-p answer-submit","확인");t.appendChild(submit);
    function go(){
      var v=answerCode(pad.value());if(!v){feedback.textContent="정답을 입력하세요.";return;}
      if(c.h.some(function(a){return a===sealCode(v,c.n);})){
        S.phase="search";S.revealed=0;save();closeModal();renderHUD();showComputer();
      } else {feedback.textContent="아직 맞지 않습니다. 입력을 고치거나 단서를 다시 확인하세요.";}
    }
    submit.onclick=go;pad.submit=go;
    var hint=el("details","puzzle-hint");hint.appendChild(el("summary",null,"단서가 더 필요해요"));hint.appendChild(el("p",null,PUZZLE_HINTS[c.n]));panels.answer.appendChild(hint);
    select("diary");
  });
}

/* 최종 조립 */
/* 공통: 나무조각 더미를 사선으로 그린다 */
function buildStack(order,opt){
  opt=opt||{};
  var url=engraveURL(), wrap=el("div","stack");
  order.forEach(function(n,i){
    var row=el("div","srow"), bar=el("div","bar");
    bar.style.marginLeft="0px";
    var face=el("div","face",'<span class="n">'+n+'</span><span>'+CH[n-1].title+'</span>');
    var band=el("div","band");
    band.style.backgroundImage="url("+url+")";
    band.style.backgroundSize="100% "+(BANDS*BAND_H)+"px";
    band.style.backgroundPosition="0 -"+(bandOf(n)*BAND_H)+"px";
    bar.appendChild(face);bar.appendChild(band);
    row.appendChild(bar);
    var mv=el("div","mv");
    if(opt.move){
      var u=el("button",null,"▲"), d=el("button",null,"▼");
      u.setAttribute("aria-label",n+"번 조각 위로");d.setAttribute("aria-label",n+"번 조각 아래로");
      u.disabled=(i===0); d.disabled=(i===order.length-1);
      u.onclick=function(){opt.move(i,i-1);}; d.onclick=function(){opt.move(i,i+1);};
      mv.appendChild(u);mv.appendChild(d);
    }
    row.appendChild(mv);
    wrap.appendChild(row);
  });
  return wrap;
}

function showAssembly(){
  if(!hasAllPieces(S)){toast("아직 찾지 못한 기억 조각이 있습니다.","bad");return;}
  if(!S.stack)S.stack=[1,2,3,4,5,6,7,8];
  $("#modal").classList.add("assembly-modal");
  openModal("기억을 쌓다","마지막 일기를 보며 기억 조각을 맞추세요",function(b){
    var layout=el("div","assembly-layout");
    var diaryCol=el("div","assembly-diary");
    diaryCol.appendChild(el("article","paper scrolls fade-y",DIARY_HTML.diary9));
    var work=el("div","assembly-stackview scrolls fade-x");
    var host=el("div");work.appendChild(host);
    var term=el("div");work.appendChild(term);
    layout.appendChild(diaryCol);layout.appendChild(work);b.appendChild(layout);

    function paint(){
      var ok=S.stack.join(",")===stackOrder().join(",");
      host.innerHTML="";
      var st=buildStack(S.stack,{move:ok?null:sw, spread:!ok});
      if(ok)st.classList.add("locked");
      host.appendChild(st);
      term.innerHTML="";
      if(ok){
        var t=el("div","term");t.style.marginTop="18px";
        t.innerHTML='<div class="l">FINAL</div><div class="rule">숫자 또는 영어 · 대소문자 무관 · 띄어쓰기 없음</div>';
        var pad=makeAnswerPad("alpha");
        t.appendChild(pad.el);term.appendChild(t);
        var sub=el("button","btn btn-p","제출");sub.style.marginTop="12px";term.appendChild(sub);
        function go(){
          var v=answerCode(pad.value());
          if(!v){toast("버튼으로 이름을 입력하세요.","bad");return;}
          if(v!==norm(finalName())){toast("이름 전체를 띄어쓰기 없이 입력하세요.","bad");return;}
          S.exitReady=true;save();closeModal();renderHUD();setTimeout(showEnding,180);
        }
        sub.onclick=go;pad.submit=go;
      }
    }
    function sw(a,c){var t=S.stack[a];S.stack[a]=S.stack[c];S.stack[c]=t;save();paint();
      var button=host.querySelectorAll(".srow")[c].querySelector("button:not(:disabled)");if(button)button.focus();
    }
    paint();
  });
}
function closeEndingScene(){
  var x=$("#ending-scene");
  if(x){var v=x.querySelector("video");if(v){try{v.pause();}catch(e){}}x.remove();}
  document.body.classList.remove("ending");
}
function showEnding(){
  closeEndingScene();document.body.classList.add("ending");
  var x=el("section");x.id="ending-scene";
  x.innerHTML='<div class="ending-credits scrolls fade-y"><div class="ending-credit-inner">'+
    '<div class="ending-kicker">STEPHEN HAWKING · FINAL MEMORY</div>'+
    '<h2 class="ending-name">스티븐 호킹</h2><div class="ending-years">1942 — 2018</div>'+
    '<section class="ending-credit-section"><div class="ending-credit-label">ABOUT HIM</div>'+
    '<p>이론물리학자이자 우주론자. 블랙홀과 우주의 기원, 시간과 공간에 관한 질문을 끝까지 붙들었고, 어려운 과학을 더 많은 사람에게 전하려 했습니다.</p></section>'+
    '<section class="ending-credit-section"><div class="ending-credit-label">WHY THIS ROOM EXISTS</div>'+
    '<p>이 방탈출은 정답 하나를 맞히는 것보다, 한 사람의 삶을 따라가며 흩어진 기록과 과학의 단서를 직접 연결해 보도록 만들었습니다. 호기심이 또 다른 질문으로 이어지는 경험이 되길 바랐습니다.</p></section>'+
    '<section class="ending-credit-section"><div class="ending-credit-label">TO THE PLAYER</div>'+
    '<p class="ending-congrats">여기까지 모든 기억의 조각을 찾아낸 것을 축하합니다.<br>스티븐 호킹의 교실을 끝까지 완주했습니다.</p></section>'+
    '<section class="ending-credit-section ending-exit-card"><strong>ONE LAST EXIT</strong>'+
    '<p>교실을 나가기 위한 마지막 절차가 남았습니다.<br><b>교실로 돌아가 뒷문을 조사하고 코드 0808을 입력하세요.</b></p>'+
    '<span class="ending-code">0808</span></section>'+
    '<div class="ending-foot">1942년 1월 8일 — 갈릴레이가 세상을 떠난 지 300년 되는 날에 태어나<br>2018년 3월 14일 — 아인슈타인이 태어난 날에 눈을 감다.</div>'+
    '</div></div>'+
    '<div class="ending-film"><video controls autoplay playsinline src="'+A.videoFinale+'"></video></div>'+
    '<button type="button" class="ending-close" data-ending-close>교실로 돌아가기</button>';
  document.body.appendChild(x);
  x.querySelector("[data-ending-close]").onclick=closeEndingScene;
}
function goToNextStage(){
  if(!canExit(S)||!S.done)return false;
  closeModal();closeEndingScene();
  var old=document.getElementById("stage-transition");if(old)old.remove();
  var fade=el("div");fade.id="stage-transition";document.body.appendChild(fade);
  requestAnimationFrame(function(){requestAnimationFrame(function(){fade.classList.add("on");});});
  try{sessionStorage.setItem("nameless-stage2-access","0808");}catch(e){} setTimeout(function(){location.href="../stage2/";},1250);
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
    var next=el("button","btn btn-p","다음 스테이지");
    next.onclick=function(){goToNextStage();};
    r.appendChild(replay);r.appendChild(next);b.appendChild(r);
    b.appendChild(el("p","mini","스테이지 2 · 챕터 1로 이동합니다."));
  },null,"교실에 남기");
}
function showExitDoor(){
  if(S.done&&canExit(S)){showStageClear();return;}
  if(!canExit(S)){toast("여덟 기억을 모아 이름을 밝혀야 문을 열 수 있습니다.");return;}
  openModal("뒷문","코드를 입력하시면 나갈 수 있습니다.",function(b){
    b.appendChild(el("p","mini","코드를 입력하시면 나갈 수 있습니다."));
    var pad=makeAnswerPad("number");b.appendChild(pad.el);
    var submit=el("button","btn btn-p","문 열기");submit.style.marginTop="12px";b.appendChild(submit);
    submit.onclick=function(){
      if(!canExit(S))return;
      if(pad.value()!=="0808"){toast("코드가 맞지 않습니다.","bad");pad.clear();return;}
      S.done=true;save();if(doorPivot)doorPivot.rotation.y=Math.PI/2;closeModal();renderHUD();
      setTimeout(showStageClear,220);
    };
    pad.submit=submit.onclick;
  });
}

/* ======================= [9] 진행 엔진 ======================= */
function openRewardDiary(n){
  if(S.revealed!==n){toast("아직 읽을 수 있는 편지가 아닙니다.","bad");return;}
  showDiary(n+1,function(){finishReward(n);},"읽고 칠판에 붙이기");
}
function finishReward(n){
  if(S.revealed!==n)return;
  var c=CH[n-1];setRewardVisible(n,false);
  if(S.pieces.indexOf(n)<0)S.pieces.push(n);
  S.ch=n+1;S.phase="read";S.revealed=0;save();renderHUD();refreshBoard();
  toast("편지를 읽고 칠판으로 옮겨 붙였다. "+n+"번째 조각을 얻었다.","good");
}
var DECOY={
  motto:"급훈 액자다. 「스스로 생각하라」 — 그가 직접 쓴 글씨라고 한다.",
  timetable:"낡은 시간표다. 마지막 학기의 것이고, 담당 교사 칸은 비어 있다.",
  switches:"조명 스위치다. 올려도 내려도 아무 소리가 없다.",
  thermo:"온습도계다. 바늘이 오래전에 멈춰 있다.",
  speaker:"교내 방송 스피커다. 종소리가 울린 지 오래된 듯하다.",
  mop:"대걸레와 빗자루, 양동이다. 양동이는 말라 있다.",
  notice:"벽에 붙은 안내문이다. 글씨가 바래 읽히지 않는다.",
  outlet:"콘센트다. 아무것도 꽂혀 있지 않다.",
  radiator:"클래식 주철 스팀 라디에이터다. 밸브를 돌려보아도 차갑게 식어 있다.",
  chairs:"쓰지 않는 의자를 쌓아 두었다. 먼지가 두껍다.",
  trophy:"오래된 트로피다. 이름을 새긴 자리가 긁혀 지워져 있다.",
  books:"누군가 두고 간 책 무더기다. 이름이 적힌 페이지는 찢겨 있다.",
  plant:"화분이다. 물을 준 사람이 없어 잎 끝이 말라 있다.",
  globe:"정밀하게 제작된 클래식 원목 지구본이다. 세계 각국의 대륙과 자오선이 정교하게 각인되어 있다.",
  bin:"쓰레기통이다. 비어 있다.",
  umb:"우산꽂이다. 주인 없는 우산 두 자루가 남아 있다.",
  chalk:"분필함이다. 짧은 분필 몇 개와 지우개가 놓여 있다.",
  locker:"사물함이다. 대부분 잠겨 있고, 열리는 칸은 비어 있다.",
  notice2:"게시판이다. 압정 구멍만 빼곡히 남아 있다."
};
function interact(id){
  if(id==="exitdoor"){showExitDoor();return;}
  if(S.done){ if(id==="computer")showEnding(); return; }
  if(id.indexOf("decoy")===0){
    var k=id.split(":")[1];
    if(k==="globe"){
      window.globeSpinVel = 0.28;
    }
    toast(DECOY[k]||"특별한 것이 없다.");return;
  }
  if(id.indexOf("reward:")===0){openRewardDiary(+id.split(":")[1]);return;}
  if(S.ch>8){ if(id==="computer")showAssembly(); else toast("마지막 조각을 교탁에서 맞추세요."); return; }
  var c=chapter();
  if(id==="computer"){showComputer();return;}
  if(id==="diary1obj"){ if(arrowObj)arrowObj.visible=false; S.tookD1=true; setDiaryOneOnDesk(false);save();refreshBoard();showDiary(1);return; }
  if(id.indexOf("diaryP:")===0){ showDiary(+id.split(":")[1]); return; }
  if(id.indexOf("refP:")===0){ showRefs(id.split(":")[1]); return; }
  if(id==="sheet"){showSheet();return;}
  if(id.indexOf("note:")===0){
    var sc=SCI.filter(function(x){return x.id===id.split(":")[1];})[0];
    if(!sc){toast("자료를 찾을 수 없습니다.","bad");return;}
    openModal(sc.name,sc.en,function(bb){
      bb.innerHTML='<div class="item"><div class="in" style="padding:14px">'+sciDetailHTML(sc)+'</div></div>';
    });
    return;
  }
  if(id.indexOf("frame:")===0){
    var sci=id.split(":")[1], sym=SYM_OF[sci], rotKey=sym||sci;
    S.rot[rotKey]=((S.rot[rotKey]||0)+1)%4;save();drawFrameBars(sci);
    toast("액자 — "+(S.rot[rotKey]*90)+"°");
    return;
  }
  /* 챕터별 탐색 지점 */
  if(sealCode(id,c.n+20)===c.spot){
    if(S.phase!=="search"){toast("아직 여기를 조사할 이유가 없습니다.","bad");return;}
    revealReward(c.n);return;
  }
  /* 다른 지점 */
  if(id==="calendar"&&S.ch>1){toast("이미 조사한 곳입니다.");return;}
  toast("특별한 것이 없다.");
}
function renderHUD(){
  var pw=$("#pieces");pw.innerHTML="";pw.setAttribute("aria-label","기억 조각 "+S.pieces.length+" / 8");
  for(var i=1;i<=8;i++){var b=el("i");if(S.pieces.indexOf(i)>=0)b.className="on";pw.appendChild(b);}
  if(S.done){
    $("#hud-ch").textContent="COMPLETE";$("#hud-title").textContent="스테이지 완료";
    $("#objective").innerHTML='<b>'+finalName()+'</b> · 스티븐 호킹 스테이지 완료';
    return;
  }
  if(S.exitReady){
    $("#hud-ch").textContent="FINAL EXIT";$("#hud-title").textContent="마지막 문";
    $("#objective").innerHTML='<b>뒷문을 조사하세요.</b><span class="hint">코드를 입력하시면 나갈 수 있습니다.</span>';
    return;
  }
  if(S.ch>8){
    $("#hud-ch").textContent="FINAL";$("#hud-title").textContent="기억을 쌓다";
    $("#objective").textContent="교탁의 컴퓨터에서 마지막 기억을 조립하세요.";
    return;
  }
  var c=chapter();
  $("#hud-ch").textContent="CHAPTER "+c.n;
  $("#hud-title").textContent=c.title;
  if(S.revealed===c.n){
    $("#objective").innerHTML='<span class="hint">드러난 편지를 눌러 읽으세요.</span>';
  }else if(S.phase==="search"){
    $("#objective").innerHTML='<span class="hint">“'+c.cue+'”</span>';
  }else{
    $("#objective").textContent=S.tookD1||S.ch>1?"일기와 자료를 살펴보고 교탁의 컴퓨터에 암호를 입력하세요.":"책상 위 첫 번째 일기를 조사하세요.";
  }
}

/* 툴바 */
function showJournal(){
  openModal("기록","지금까지 발견한 일기",function(b){
    var list=el("div","list");b.appendChild(list);
    var count=S.tookD1||S.ch>1?Math.min(S.ch,9):0;
    if(!count){b.appendChild(el("p",null,"책상 위 첫 번째 일기를 찾아보세요."));return;}
    for(var n=1;n<=count;n++)(function(i){
      var button=el("button","btn",i===9?"마지막 일기":i+" · "+CH[i-1].title);
      button.onclick=function(){showDiary(i);};list.appendChild(button);
    })(n);
  });
}
function bindUI(){
  $("#t-crouch").onclick=toggleCrouch;$("#t-journal").onclick=showJournal;
  $("#t-menu").onclick=function(){
    openModal("메뉴","조작과 화면",function(b){
      b.appendChild(el("p",null,IS_TOUCH?"왼쪽 조이스틱으로 이동 · 화면을 끌어 시선 이동 · 물건을 누르거나 조사 버튼으로 확인":"WASD 이동 · 화면 드래그 또는 방향키로 시선 이동 · E 조사 · C 숙이기 · J 기록"));
      [["sensitivity","시선 이동 속도",.5,1.8,.1],["brightness","밝기",.8,1.3,.05]].forEach(function(v){
        var row=el("label","setting-row");row.textContent=v[1];
        var input=el("input");input.type="range";input.min=v[2];input.max=v[3];input.step=v[4];input.value=preferences[v[0]];
        input.oninput=function(){preferences[v[0]]=Number(input.value);savePreferences();};row.appendChild(input);b.appendChild(row);
      });
      var motion=el("label","setting-row","환경 움직임");var checkbox=el("input");checkbox.type="checkbox";checkbox.checked=preferences.motion;
      checkbox.onchange=function(){preferences.motion=checkbox.checked;savePreferences();};motion.appendChild(checkbox);b.appendChild(motion);
      var row=el("div","row");var resume=el("button","btn btn-p","교실로 돌아가기");resume.onclick=closeModal;row.appendChild(resume);
      var reset=el("button","btn","처음부터 다시");reset.onclick=function(){if(confirm("저장된 진행을 지우고 처음부터 시작할까요?")){store.clr();location.reload();}};row.appendChild(reset);b.appendChild(row);
    });
  };
  document.addEventListener("click",function(e){if(e.target.matches("[data-x]"))closeModal();});
  document.addEventListener("keydown",function(e){
    if(document.getElementById("ending-scene")){if(e.key==="Escape")closeEndingScene();return;}
    if(!$("#modal").classList.contains("hidden")){
      if(e.key==="Escape"){e.preventDefault();closeModal();return;}
      if(e.key==="Tab"){
        var nodes=$$("button:not(:disabled), a[href], input, [tabindex='0']",$("#modal")).filter(function(x){return x.getClientRects().length;});
        var first=nodes[0],last=nodes[nodes.length-1];
        if(e.shiftKey&&(document.activeElement===first||!$("#modal").contains(document.activeElement))){e.preventDefault();last.focus();}
        else if(!e.shiftKey&&document.activeElement===last){e.preventDefault();first.focus();}
      }
      if(activeAnswerPad)activeAnswerPad.key(e);
    }
  });
}

/* 그림자 배정 + 재질 마감 — 씬을 다 세운 뒤 한 번 훑는다 */
function polishScene(){
  /* r128은 outputEncoding=sRGB 여도 재질·조명 색을 선형으로 바꿔주지 않는다.
     직접 변환하지 않으면 중간톤이 전부 바래 보인다. */
  var seen=(typeof Set==="function")?new Set():null;
  var seenArr=[];
  function firstTime(m){
    if(seen){ if(seen.has(m))return false; seen.add(m); return true; }
    if(seenArr.indexOf(m)>=0)return false; seenArr.push(m); return true;
  }
  scene.traverse(function(o){
    var m=o.material;
    if(m&&!Array.isArray(m)&&m.color&&firstTime(m)){
      if(!(m.userData&&m.userData.colorAlreadyLinear))m.color.convertSRGBToLinear();
    }
  });
  [sunLight,groundLight,fillLight,ambLight,backLamp,screenGlow].forEach(function(L){
    if(L&&L.color)L.color.convertSRGBToLinear();});
  if(hemiLight){hemiLight.color.convertSRGBToLinear();hemiLight.groundColor.convertSRGBToLinear();}
  scene.traverse(function(o){
    if(!o.isMesh)return;
    var m=o.material;if(!m||Array.isArray(m))return;
    /* 히트박스·빛기둥·화면처럼 비추지 않는 것은 건너뛴다 */
    if(m.transparent&&m.opacity<0.99)return;
    if(m.isMeshBasicMaterial)return;
    if(m.isMeshStandardMaterial){
      if(m.roughness===1)m.roughness=m.map?0.84:0.76;
      if(m.metalness===undefined)m.metalness=0;
    }
    var g=o.geometry,p=g&&g.parameters;
    /* 벽·바닥·천장·칠판 같은 큰 판은 받기만 한다 */
    var big=g&&g.type==="PlaneGeometry"&&p&&(p.width>=4||p.height>=3);
    o.receiveShadow=true;
    o.castShadow=!big;
  });
}



/* =========================================================================
   실제 3D 완성형 모델(GLTF/GLB) 비동기 로더 & 씬 업그레이드 파이프라인
   ========================================================================= */
/* 비동기 모델이 몇 개나 들어왔는지 추적해 로딩 문구에 반영한다. */
var _modelsPending=0, _modelsDone=0;
function noteModelQueued(){_modelsPending++;}
function noteModelSettled(){
  _modelsDone++;
  var el0=document.getElementById("loading");
  if(el0&&!el0.classList.contains("hidden"))
    el0.textContent="교실을 여는 중… ("+_modelsDone+"/"+_modelsPending+")";
}
function loadClassroom3DAssets(){
  if(!window.THREE || !THREE.GLTFLoader) return;
  var loader = new THREE.GLTFLoader();
  var candidates = ["../assets/models/", "assets/models/", "/assets/models/", "stage1/assets/models/"];

  function tryLoad(subPath, onLoad){
    var idx = 0;
    noteModelQueued();
    function attempt(){
      if(idx >= candidates.length){ noteModelSettled(); return; }
      var url = candidates[idx++] + subPath;
      loader.load(url, function(gltf){
        try{ onLoad(gltf); }catch(err){ console.warn("Asset load handler error:", subPath, err); }
        noteModelSettled();
      }, undefined, function(){
        attempt();
      });
    }
    attempt();
  }

  /* 1. 감독교사 (business_man.glb - Rig|sitting_idle 완벽 착석 애니메이션) & 앤티크 암체어 */
  var tGrp = teacherGroup || window.teacherGroup;
  if(tGrp){
    tryLoad("armchair/ArmChair_01.gltf", function(gltf){
      if(gltf && gltf.scene){
        var chair = gltf.scene;
        chair.scale.set(0.95, 0.95, 0.95);
        chair.rotation.y = 0; // 교실 정면(+Z)을 향해 착석
        chair.position.set(0, 0, 0.05);
        chair.traverse(function(node){
          if(node.isMesh){
            node.castShadow = true;
            node.receiveShadow = true;
          }
        });
        var cProc = tChairProcedural || window.tChairProcedural;
        if(cProc) cProc.visible = false;
        tGrp.add(chair);
      }
    });

    tryLoad("teacher/teacher.glb", function(gltf){
      if(gltf && gltf.scene){
        var char = gltf.scene;
        char.scale.set(0.96, 0.96, 0.96);
        char.position.set(0, 0.05, 0.30);
        char.traverse(function(node){
          if(node.isMesh){
            node.castShadow = true;
            node.receiveShadow = true;
            if(node.material && node.material.map) node.material.map.encoding = THREE.sRGBEncoding;
          }
        });
        if(gltf.animations && gltf.animations.length){
          var mixer = new THREE.AnimationMixer(char);
          var clip = THREE.AnimationClip.findByName(gltf.animations, "Rig|sitting_idle") || gltf.animations[0];
          if(clip){
            mixer.clipAction(clip).play();
            teacherMixer = mixer;
            window.teacherMixer = mixer;
          }
        }
        var mProc = tMannequinProcedural || window.tMannequinProcedural;
        if(mProc) mProc.visible = false;
        tGrp.add(char);
      }
    });
  }

  /* 2. 테디베어 곰인형 (teddy_bear.glb - 사물함 위 착석 & 정면 응시) */
  var dGrp = dollGroup || window.dollGroup;
  if(dGrp){
    tryLoad("teddy/teddy_bear.glb", function(gltf){
      if(gltf && gltf.scene){
        var bear = gltf.scene;
        var box = new THREE.Box3().setFromObject(bear);
        var center = box.getCenter(new THREE.Vector3());
        bear.position.x -= center.x;
        bear.position.z -= center.z;
        bear.position.y -= box.min.y;
        bear.scale.set(0.48, 0.48, 0.48);
        bear.rotation.y = 0;
        bear.traverse(function(node){
          if(node.isMesh){
            node.castShadow = true;
            node.receiveShadow = true;
            if(node.material && node.material.map) node.material.map.encoding = THREE.sRGBEncoding;
          }
        });
        var dProc = dollProcedural || window.dollProcedural;
        if(dProc) dProc.visible = false;
        dGrp.add(bear);
      }
    });
  }

  /* 3. 한국형 분말 소화기 (korean_fire_extinguisher_01.gltf) */
  var eGrp = extinguisherGroup || window.extinguisherGroup;
  if(eGrp){
    tryLoad("extinguisher/korean_fire_extinguisher_01.gltf", function(gltf){
      if(gltf && gltf.scene){
        var extModel = gltf.scene;
        var box = new THREE.Box3().setFromObject(extModel);
        extModel.position.y -= box.min.y;
        extModel.scale.set(0.78, 0.78, 0.78);
        extModel.traverse(function(node){
          if(node.isMesh){
            node.castShadow = true;
            node.receiveShadow = true;
          }
        });
        var eProc = extProcedural || window.extProcedural;
        if(eProc) eProc.visible = false;
        eGrp.add(extModel);
      }
    });
  }

  /* 4. 학생 책상 & 의자 6세트 (SchoolDesk_01.gltf & SchoolChair_01.gltf) */
  var sFurn = studentFurnitureG || window.studentFurnitureG;
  if(sFurn){
    tryLoad("desk/SchoolDesk_01.gltf", function(gltfDesk){
      tryLoad("chair/SchoolChair_01.gltf", function(gltfChair){
        if(gltfDesk && gltfDesk.scene && gltfChair && gltfChair.scene){
          for(var r=0; r<2; r++){
            for(var c=0; c<3; c++){
              if(r===0&&c===1)continue;
    var deskPosition=deskAt(r,c),x=deskPosition.x,z=deskPosition.z;
              var d = gltfDesk.scene.clone();
              d.scale.set(0.92, 0.82, 0.88);
              d.position.set(x, 0, z);
              d.rotation.y = Math.PI; // 칠판을 향하도록 180도 회전
              d.traverse(function(n){ if(n.isMesh){ n.castShadow = true; n.receiveShadow = true; } });
              sFurn.add(d);

              var ch = gltfChair.scene.clone();
              ch.scale.set(0.85, 0.85, 0.85);
              ch.position.set(x, 0, z + 0.42);
              ch.rotation.y = Math.PI; // 책상과 칠판을 향하도록 180도 회전
              ch.traverse(function(n){ if(n.isMesh){ n.castShadow = true; n.receiveShadow = true; } });
              sFurn.add(ch);
            }
          }
          var dProc = desksProcedural || window.desksProcedural;
          if(dProc) dProc.visible = false;
        }
      });
    });
  }

  /* 5. 사물함 위 화분 (potted_plant_01.gltf) */
  var pGrp = plantG || window.plantG;
  if(pGrp){
    tryLoad("plant/potted_plant_01.gltf", function(gltf){
      if(gltf && gltf.scene){
        var plant = gltf.scene;
        var box = new THREE.Box3().setFromObject(plant);
        var center = box.getCenter(new THREE.Vector3());
        var plantWrap = new THREE.Group();
        plant.position.set(-center.x, -box.min.y, -center.z);
        plantWrap.add(plant);
        plantWrap.scale.set(0.46, 0.46, 0.46);
        plant.traverse(function(n){ if(n.isMesh){ n.castShadow = true; n.receiveShadow = true; } });
        var pProc = plantProcedural || window.plantProcedural;
        if(pProc) pProc.visible = false;
        pGrp.add(plantWrap);
      }
    });
  }

  /* 6. 쓰레기통 (metal_trash_can.gltf - 단일 원통형 통으로 분리 및 축소) */
  var trGrp = trashG || window.trashG;
  if(trGrp){
    tryLoad("trashcan/metal_trash_can.gltf", function(gltf){
      if(gltf && gltf.scene){
        var tc = gltf.scene;
        // metal_trash_can.gltf는 clean/rust 2통이 나란히 있는 에셋이므로
        // 중복되는 clean 캔 및 부속을 제거하여 1개의 깔끔한 단일 쓰레기통만 유지
        ["metal_trash_can", "metal_trash_can_lid", "metal_trash_can_handle_left", "metal_trash_can_handle_right"].forEach(function(n){
          var obj = tc.getObjectByName(n);
          if(obj && obj.parent) obj.parent.remove(obj);
        });
        var box = new THREE.Box3().setFromObject(tc);
        var center = box.getCenter(new THREE.Vector3());
        tc.position.x -= center.x;
        tc.position.z -= center.z;
        tc.position.y -= box.min.y;
        tc.scale.set(0.48, 0.48, 0.48); // 실측 약 42cm 높이의 단정한 쓰레기통
        tc.traverse(function(n){ if(n.isMesh){ n.castShadow = true; n.receiveShadow = true; } });
        var trProc = trashProcedural || window.trashProcedural;
        if(trProc) trProc.visible = false;
        trGrp.add(tc);
      }
    });
  }

  /* 7. 사물함 위 양장본 백과사전 세트 (book_encyclopedia_set_01.gltf) - 사물함 상단 좌측, 책등이 교실 정면(-Z)을 향함 */
  tryLoad("books/book_encyclopedia_set_01.gltf", function(gltf){
    if(gltf && gltf.scene){
      var bks = gltf.scene;
      var box = new THREE.Box3().setFromObject(bks);
      var center = box.getCenter(new THREE.Vector3());
      var bksWrap = new THREE.Group();
      bks.position.set(-center.x, -box.min.y, -center.z);
      bksWrap.add(bks);
      bksWrap.scale.set(1.04, 1.04, 1.04); // 기존의 160% 크기 (0.65 -> 1.04)
      bksWrap.position.set(-3.25, 1.066, 3.72); // 사물함 상단 좌측
      bksWrap.rotation.y = Math.PI; // 반대 방향 회전
      bks.traverse(function(n){ if(n.isMesh){ n.castShadow = true; n.receiveShadow = true; } });
      scene.add(bksWrap);
    }
  });

}

/* 부팅 */
function boot(){
  document.body.classList.add("starting");
  var cv=$("#scene");
  renderer=new THREE.WebGLRenderer({canvas:cv,antialias:!IS_TOUCH,preserveDrawingBuffer:false,powerPreference:"high-performance"});
  renderer.outputEncoding=THREE.sRGBEncoding;
  renderer.toneMapping=THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure=preferences.brightness;
  renderer.shadowMap.enabled=true;
  renderer.shadowMap.type=THREE.PCFSoftShadowMap;
  ray=new THREE.Raycaster();
  buildRoom();polishScene();setDark(false);checkOrient();resize();loadClassroom3DAssets();initControls();bindUI();
  /* 저장된 상태 복원 */
  Object.keys(SYM_OF).forEach(function(id){drawFrameBars(id);});
  syncPools();
  S.pieces.forEach(function(n){setClueHotEnabled(n,false);applyRevealState(n,true);setRewardVisible(n,false);});
  if(S.revealed){setClueHotEnabled(S.revealed,false);applyRevealState(S.revealed,true);setRewardVisible(S.revealed,true);}
  if(S.done&&doorPivot)doorPivot.rotation.y=Math.PI/2;
  if(arrowObj)arrowObj.visible=!(S.tookD1||S.ch>1);
  setDiaryOneOnDesk(!(S.tookD1||S.ch>1));
  refreshBoard();
  loop();
  $("#loading").classList.add("hidden");
  /* 방이 뜬 뒤에 노멀·러프니스 맵을 채워 넣는다. */
  if(window.requestIdleCallback) requestIdleCallback(runPbrJobs,{timeout:300});
  else setTimeout(runPbrJobs,32);
  var prev=store.get();
  $("#go-cont").disabled=!(prev&&prev.started);
  $("#go-new").onclick=function(){

    store.clr();S=fresh();S.started=true;save();
    Object.keys(SYM_OF).forEach(function(id){drawFrameBars(id);});
    crouch=false;$("#crouch").classList.remove("on");$("#t-crouch").classList.remove("act");
    $("#crouch").setAttribute("aria-pressed","false");$("#t-crouch").setAttribute("aria-pressed","false");
    resetRevealState();refreshBoard();
    start();
  };
  $("#go-cont").onclick=function(){
    if(!prev||!prev.started){toast("저장된 진행이 없습니다.","bad");return;}
    S=Object.assign(fresh(),prev);start();
  };
}
function start(){
  $("#intro").classList.add("hidden");document.body.classList.remove("starting");
  $("#hud").classList.remove("hidden");
  gotoSpot(0);renderHUD();$("#scene").focus({preventScroll:true});
}

