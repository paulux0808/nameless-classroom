/* ============================================================================
   이름 없는 교실 — 퍼즐 내용 데이터 (스토리·일기·퍼즐·정답 해시)
   원본 stage1/index.html 에서 글자 그대로 옮겼다. 내용은 바꾸지 않는다.
   (data.test.mjs 가 전체 해시를 잠가 두어, 실수로 고치면 테스트가 실패한다.)
   화면과 무관한 순수 데이터만 있다. U()/sealCode() 는 logic.js 가 전역으로 제공한다.
   ========================================================================== */
(function (root) {
"use strict";
var SCI = [
  {id:"newton",sym:"apple",name:"아이작 뉴턴",en:"Isaac Newton",born:"1643. 1. 4.",died:"1727. 3. 31.",
   key:"만유인력의 기본 바탕 · 떨어지는 사과",
   body:"잉글랜드의 물리학자·수학자. 1687년 《자연철학의 수학적 원리》에서 만유인력과 세 가지 운동 법칙을 세웠다. 나무에서 사과가 떨어지는 것을 보다가 만유인력을 떠올렸다는 일화로도 유명하다. 케플러의 행성 운동 법칙과 자신의 중력 이론이 이어짐을 보여 태양중심설의 마지막 의문을 걷어냈다. 반사망원경을 만들고 프리즘으로 빛의 스펙트럼을 관찰했으며, 라이프니츠와 함께 미적분학을 열었다."},
  {id:"archimedes",sym:"pi",name:"아르키메데스",en:"Archimedes",born:"약 B.C. 287",died:"약 B.C. 212",
   key:"원주율(π)을 계산",
   body:"고대 그리스 시라쿠사 출신의 철학자·수학자·천문학자·물리학자·공학자. 욕조에서 부력을 깨닫고 뛰쳐나가 “찾았다(εὕρηκα)”를 외친 일화로 유명하다. 나선양수기와 투석기를 만들었고 지레의 원리를 밝혔다. 원에 내접·외접하는 다각형을 비교해 원주율을 계산했다."},
  {id:"abel",sym:"sqrt",name:"닐스 헨리크 아벨",en:"Niels Henrik Abel",born:"1802. 8. 5.",died:"1829. 4. 6.",
   key:"제곱근 연산 √",fix:"원본 인쇄물에는 생몰년이 뉴턴의 것으로 잘못 적혀 있어 바로잡았습니다.",
   body:"노르웨이의 수학자. 5차 이상의 대수방정식에는 제곱근 연산 √과 사칙연산만으로 쓸 수 있는 일반적인 근의 공식이 없다는 아벨–루피니 정리를 처음으로 정확히 증명했다. 아벨 군, 아벨 적분 등 그의 이름을 딴 용어가 많다. 2002년 아벨상이 창설되었다."},
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

var FRAME_SIG={apple:[1,1,1,0],compass:[1,1,0,0],sqrt:[1,1,0,0],sun:[1,0,0,0],pi:[0,0,1,0]};
var SYM_OF={newton:"apple",gauss:"compass",abel:"sqrt",galilei:"sun",archimedes:"pi"};
var SYM_KO={apple:"사과",compass:"컴퍼스",sqrt:"제곱근 √",sun:"태양",pi:"파이 π"};

var CH=[
 {n:1,title:"별이 된 지 300년",diary:"diary1",puzzle:"date300",h:["1pzyxt4"],
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
 '<p>뭐 이리 긴 거야?<br>그리고 왜 다 한글이야..? 나는 한글 모른다고!!<br><span class="em">제일 처음 나오는 단어가 맞겠지 뭐…</span></p>';
DIARY_HTML.diary8=
 '<p class="date">2014년 5월 3일</p>'+
 '<p>오늘도 숨이 가빠왔다<br>온몸을 움직이지 못해서<br>근섬유 한 가닥으로<br>도움을 청했다</p>'+
 '<p style="text-align:center;font-size:42px;font-style:italic">help.</p>'+
 '<p>그 한 가닥조차<br><span class="em">한 번 움직이는데에는 2초</span></p>'+
 '<p>다음에도 이런 일이 생기면<br><span class="em">얼마나 시간이 걸릴지</span></p>';
DIARY_HTML.diary9=
 '<p class="date">2018년 3월 14일</p>'+
 '<p>이것은 내 마지막 일기이다.<br>다른 사람들은 힘을 내라고 말하지만 나는 알고 있다.<br>오늘은 내 마지막 날이다.<br>죽기 전에 내 삶을 여덟 조각으로 나누어 숨겨놓았고<br>이걸 보고 있다는 것은 자네가 내 삶을 따라왔다는 말이겠지.</p>'+
 '<p>참 많은 일들이 있었다.<br><span class="red">시간 순서대로가 아니라, 지금 생각나는대로 기억을 쌓아보자..</span></p>'+
 '<p class="em">친구들에게 좋은 별명을 얻은 날<br>우주의 시작에 대한 비밀을 알아낸 날<br>병에 걸린 사실을 알아낸 날<br>사랑받는 아들로 태어난 날<br>모두가 볼 수 있는 책을 펴낸 날<br>죽을 고비를 맞아 의사에게 연락한 날<br>교황청에 방문한 날<br>한국이라는 나라에 방문한 날</p>'+
 '<p class="red">이 여덟 가지 일을 모두 쌓아놓은 게 지금까지의 나를 말해주고 있다…</p>'+
 '<p>내 생애 가장 기뻤던 순간을 나누고 싶다.<br>하필 오늘은 내 어릴 적 별명이었던 그가 태어난 날이군..</p>';


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

var TERMINAL_AID={
  1:{kind:null,title:"",diary:100},
  2:{kind:"frames",title:"기호 종이",diary:40},
  3:{kind:"sport",title:"운동경기 자료",diary:36},
  4:{kind:null,title:"",diary:100},
  5:{kind:"map",title:"신부가 건넨 지도",diary:38},
  6:{kind:"video",title:"의문의 영상",diary:48},
  7:{kind:null,title:"",diary:100},
  8:{kind:"keyb",title:"근섬유 키보드 사용법",diary:52}
};

var KEYB_HTML='<ol style="margin:6px 0 0;padding-left:19px;line-height:1.8">'+
  '<li>알파벳을 입력할 때에는 알파벳의 순서만큼 근육을 움직인 뒤 5초간 대기합니다. (예: c는 세 번)</li>'+
  '<li>마침표는 근육을 28번 움직인 후 5초 대기합니다.</li></ol>';
var VIDEO_NOTE="화면이 크게 손상되어 있습니다. 자막을 끝까지 읽어 보세요.";

var REF_TITLE={sci:"수학자·과학자 자료",sport:"운동경기 자료",map:"신부가 건넨 지도",
               video:"의문의 영상",keyb:"근섬유 키보드 사용법",frames:"기호 종이"};
var PUZZLE_REF={date300:"sci",frames:"sci",position:"sport",map:"map",cipher:"video",typing:"keyb"};

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

  root.N1Data = {
    SCI: SCI, SPORTS: SPORTS, MAP_ROWS: MAP_ROWS, MAP_COLS: MAP_COLS, MAP_PRINTED: MAP_PRINTED, MAP_ROUTES: MAP_ROUTES,
    CIPHER: CIPHER, SYMBOL_SVG: SYMBOL_SVG, SHEET: SHEET, FRAME_SIG: FRAME_SIG, SYM_OF: SYM_OF, SYM_KO: SYM_KO,
    CH: CH, BOARD_PAPERS: BOARD_PAPERS, DIARY_HTML: DIARY_HTML, REVEAL_TEXT: REVEAL_TEXT, TERMINAL_AID: TERMINAL_AID,
    KEYB_HTML: KEYB_HTML, VIDEO_NOTE: VIDEO_NOTE, REF_TITLE: REF_TITLE, PUZZLE_REF: PUZZLE_REF, DECOY: DECOY
  };
  if (typeof module === "object" && module.exports) module.exports = root.N1Data;
})(typeof globalThis !== "undefined" ? globalThis : this);
