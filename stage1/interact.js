/* ============================================================================
   N1I — 상호작용 분배: 핫스팟 id 하나를 받아 무엇이 일어날지 정한다.
   옛 게임의 interact() 와 같은 규칙·같은 문구. 달라진 점만 표시했다.
     · 뒷문은 최종 이름을 맞춘 뒤(exitReady)에만 열린다 (예전엔 코드만 알면 처음부터 열렸다)
     · 일기·자료 종이와 액자는 마지막 단계와 클리어 뒤에도 만질 수 있다
   ========================================================================== */
(function (root) {
  "use strict";

  function create(o) {
    var M = o.model, D = o.data, UI = o.ui, SC = o.screens, ST = o.stations, W = o.world, C = o.controls, S = M.S, Dir = o.director;
    var DECOY = {}; Object.keys(D.DECOY).forEach(function (k) { DECOY[k] = D.DECOY[k]; });
    if (!DECOY.eraser) DECOY.eraser = "칠판지우개다. 하얀 분필 가루가 잔뜩 묻어 있다.";
    /* 기억 소품: 조각을 붙일 때마다 생기는 물건들 */
    DECOY.mem1 = "금빛 별 모빌이 천천히 돈다. 아기 침대 위에 달려 있던 것 같다.";
    DECOY.mem2 = "칠판 구석에 누군가 그린 낙서다. 머리카락이 사방으로 뻗친 얼굴 옆에 ‘천재?!’라고 적혀 있다.";
    DECOY.mem3 = "교탁 옆에 기대어 놓은 지팡이다. 손잡이가 오래 쥔 손을 따라 닳았다.";
    DECOY.mem4 = "한 점에서 퍼져 나가는 고리를 그린 포스터다. ‘시간을 거꾸로 돌리면’이라고 적혀 있다.";
    DECOY.mem5 = "벽에 걸린 금메달이다. 가운데에 십자가가 새겨져 있다.";
    DECOY.mem6 = "같은 책이 세 권 쌓여 있다. 표지에는 은하가 그려져 있다.";
    DECOY.mem7 = "작은 태극기가 꽂혀 있다. 바람이 없는데도 천이 살짝 흔들린다.";
    DECOY.mem8 = "초록 갓 스탠드다. 어둠이 내려도 이 불빛만은 꺼지지 않을 것 같다.";
    var toast = UI.toast;
    var Puz = root.N1Puz;

    function revealReward(n) {
      if (S.revealed === n) { toast("드러난 편지를 눌러 읽으세요."); return; }
      if (M.reveal() == null) return;
      W.reveal(n);
      toast(D.REVEAL_TEXT[n], "good");
      if (Dir) Dir.letter(n);
    }
    function openRewardDiary(n) {
      if (S.revealed !== n) { toast("아직 읽을 수 있는 편지가 아닙니다.", "bad"); return; }
      SC.showDiary(n + 1, { closeText: "읽고 칠판에 붙이기", afterClose: function () { finishReward(n); } });
    }
    function finishReward(n) {
      if (S.revealed !== n || !M.finishReward(n)) return;
      W.setProgress(S.pieces.length / 8);
      W.stickToBoard(n, S);
      var slot = W.boardSlot(n + 1); C.lookAtPoint(slot.x, slot.y, slot.z);
      toast("편지를 읽고 칠판으로 옮겨 붙였다. " + n + "번째 조각을 얻었다.", "good");
      if (Dir) Dir.attach(n);
    }

    function interact(id) {
      if (id === "exitdoor") {
        if (!S.exitReady && !S.done) { toast("문이 잠겨 있다. 아직 이 방을 나갈 수 없다.", "bad"); return; }
        SC.showExit(); return;
      }
      if (id.indexOf("decoy") === 0) {
        var k = id.split(":")[1];
        if (k === "globe") W.spinGlobe();
        W.nudge(id);
        toast(DECOY[k] || "특별한 것이 없다."); return;
      }
      if (id.indexOf("reward:") === 0) { openRewardDiary(+id.split(":")[1]); return; }
      /* 읽기 전용 자료: 언제든 */
      if (id.indexOf("diaryP:") === 0) { SC.showDiary(+id.split(":")[1]); return; }
      if (id.indexOf("refP:") === 0) { SC.showRefs(id.split(":")[1]); return; }
      if (id === "sheet") { ST.showStickers(); return; }
      if (id === "roster") { ST.showRoster(); return; }
      if (id === "tv") {
        if (S.ch === 4) { ST.showTape(); return; }
        if (S.ch === 6 && S.phase === "read") { SC.showRefs("video"); return; }
        if (S.ch > 4 && M.isSolved(4)) { ST.showTape(); return; }
        toast(S.ch < 4 ? "TV가 꺼져 있다. 아직 넣을 테이프가 없다." : "TV는 지금 아무것도 비추지 않는다."); return;
      }
      if (id === "stamp") {
        if (!S.tookD1 && S.ch === 1) { toast("먼저 책상 위의 일기를 읽어 보세요."); return; }
        if (S.ch === 1 && S.phase === "read") W.guide(null);
        ST.showStamp(); return;
      }
      if (id.indexOf("note:") === 0) {
        var sc = D.SCI.filter(function (x) { return x.id === id.split(":")[1]; })[0];
        if (!sc) { toast("자료를 찾을 수 없습니다.", "bad"); return; }
        SC.showSciNote(sc); return;
      }
      if (id.indexOf("frame:") === 0) {
        var sci = id.split(":")[1], rot = M.rotateFrame(sci);
        W.setFrameRot(sci, rot);
        toast("액자 — " + (rot * 90) + "°"); return;
      }
      /* 교탁 컴퓨터는 답을 넣을 때에만 켜져 있다(규칙은 puzzles.js computerState) */
      if (id === "computer") {
        var cs = Puz.computerState(S);
        if (cs === "off") { toast("컴퓨터 화면이 꺼져 있다. 지금은 쓸 일이 없다."); if (Dir) Dir.computerOff(); return; }
        if (cs === "done") { SC.showEnding(); return; }
      }
      if (S.done) { if (id === "computer") SC.showEnding(); else toast("특별한 것이 없다."); return; }
      if (S.ch > 8) { if (id === "computer") SC.showAssembly(); else toast("마지막 조각을 교탁에서 맞추세요."); return; }
      if (id === "computer") { SC.showComputer(); return; }
      if (id === "diary1obj") {
        M.takeDiary1(); W.setDiaryOnDesk(false);
        SC.showDiary(1, { afterClose: function () { W.refreshBoard(S, 1); if (Dir) Dir.diary1(); } }); return;
      }
      /* 챕터별 탐색 지점 */
      if (M.isSpot(id)) {
        if (S.phase !== "search") { toast("아직 여기를 조사할 이유가 없습니다.", "bad"); return; }
        revealReward(M.chapter().n); return;
      }
      if (id === "calendar" && S.ch > 1) { toast("이미 조사한 곳입니다."); return; }
      toast("특별한 것이 없다.");
    }
    return { interact: interact, revealReward: revealReward, finishReward: finishReward };
  }
  root.N1I = { create: create };
})(window);
