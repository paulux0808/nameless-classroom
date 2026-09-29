/* N1R.layout — 소품을 교실에 놓는다. 옛 배치 좌표를 그대로 승계해 퍼즐 위치가 어긋나지 않는다.
   · 리빌 대상(달력·인형·쪽지·교사·소화기·시계·수학책·커튼)은 이름 붙은 그룹으로 돌려준다.
   · 편지가 놓일 자리는 소품 기하에서 계산한 표면 위 좌표(anchors)로 정한다 — 좌표를 손으로 복제하지 않는다.
   · hotspots: 상호작용 대상 메시 목록 (userData.hot = {id, name}). 보이지 않는 히트박스는 넉넉하게. */
(function (root) {
  "use strict";
  var T = root.THREE, K = root.N1K, R = root.N1R, P = root.N1P, PI = Math.PI;
  var D = R.DIM, PLAT = D.PLAT;

  R.layout = function (scene, opts) {
    opts = opts || {};
    var L = { group: new T.Group(), hotspots: [], anchors: {}, obj: {}, frames: {}, curtains: [], updaters: [] };
    L.group.name = "layout";
    var g = L.group;

    function place(obj, x, y, z, ry) { obj.position.set(x, y, z); if (ry) obj.rotation.y = ry; g.add(obj); return obj; }
    /* 보이지 않는 히트박스: 레이캐스트 전용. 레이어 대신 visible=true, opacity 0, depthWrite=false */
    var hitMat = new T.MeshBasicMaterial({ transparent: true, opacity: 0, depthWrite: false, colorWrite: false });
    function hot(id, name, w, h, d, x, y, z, ry, parent) {
      var m = new T.Mesh(new T.BoxGeometry(w, h, d), hitMat); m.position.set(x, y, z); if (ry) m.rotation.y = ry;
      m.userData.hot = { id: id, name: name }; m.userData.isHit = true; m.renderOrder = -1;
      (parent || g).add(m); L.hotspots.push(m); return m;
    }

    /* ── 교단(앞쪽 단) ── */
    var pb = K.builder(), trim = P.wood("plat", 0x6a4326, 0.5, "coarse");
    pb.rbox(D.W, PLAT, D.PLAT_D, 0.006, K.mat("plat.top", function () { var t = K.tex.grain("coarse"); return K.std(0x8a5e38, 0.5, 0, { map: t.map, bump: t.bump, bumpScale: 0.001, vc: true }); }), { p: [0, PLAT / 2 - 0.0005, -D.D / 2 + D.PLAT_D / 2], uv: 1.2 });
    pb.rbox(D.W, 0.045, 0.03, 0.01, trim, { p: [0, PLAT - 0.022, -D.D / 2 + D.PLAT_D + 0.004], uv: 1.2 });
    g.add(pb.build({ name: "platform" }));
    var deskZ = -2.9;

    /* ── 칠판 ── */
    var board = P.chalkboard(); place(board, 0, 1.6, -3.95); L.obj.board = board;
    /* 칠판 위: 시계·급훈 */
    var clock = P.wallClock(); clock.position.set(0, 2.72, -3.975); g.add(clock); L.obj.clock = clock;
    L.updaters.push(function (dt, t) { clock.userData.update(t); });
    var motto = P.mottoFrame(); place(motto, -1.75, 2.74, -3.97); L.obj.motto = motto;
    /* 상호작용: 지우개·분필갑 (세계 좌표는 칠판 기준) */
    hot("decoy:chalk", "분필함", 0.16, 0.08, 0.1, 0.82, 0.86, -3.87);
    hot("decoy:eraser", "칠판지우개", 0.22, 0.07, 0.1, -0.95, 0.85, -3.87);
    hot("clock", "벽시계", 0.5, 0.5, 0.14, 0, 2.72, -3.94);

    /* ── 교탁 + 위 물건들 ── */
    var lectern = P.lectern(); place(lectern, 0, PLAT, deskZ); L.obj.lectern = lectern;
    var TOP = PLAT + 0.8;
    var crt = P.crt(); place(crt, 0.02, TOP, deskZ - 0.13); crt.rotation.y = 0.0; L.obj.crt = crt;
    L.updaters.push(function (dt, t) { crt.userData.update(t); });
    hot("computer", "컴퓨터", 0.5, 0.42, 0.42, 0.02, TOP + 0.3, deskZ + 0.0);
    var globe = P.globe(); place(globe, -0.62, TOP, deskZ - 0.02); L.obj.globe = globe;
    L.updaters.push(function (dt) { globe.userData.update(dt); });
    hot("decoy:globe", "지구본", 0.3, 0.4, 0.3, -0.62, TOP + 0.2, deskZ - 0.02);
    var cal = P.deskCalendar(); place(cal, 0.62, TOP, deskZ - 0.06, -0.15); L.obj.calendar = cal;
    var pcup = P.pencilCup(); place(pcup, 0.42, TOP, deskZ + 0.13); L.obj.pencilCup = pcup;
    var deskBook = P.plainBook(0x6a2b2b, 0.22, 0.03, 0.16); place(deskBook, -0.2, TOP + 0.015, deskZ + 0.12, 0.3); L.obj.deskBook = deskBook;
    /* 리빌 1: 달력 아래 편지 자리 — 교탁 상판 위 */
    L.anchors[1] = { p: [0.62, TOP + 0.0035, deskZ - 0.06], r: [0, 0, 0] };
    hot("calendar", "탁상달력", 0.2, 0.18, 0.14, 0.62, TOP + 0.09, deskZ - 0.06);

    /* ── 교사 + 안락의자 (앞 오른쪽 모서리) ── */
    var armchair = P.armchair(); place(armchair, 3.1, PLAT, -3.42); L.obj.armchair = armchair;
    var teacher = P.teacher(); teacher.position.set(3.1, PLAT, -3.42 + 0.0); g.add(teacher); L.obj.teacher = teacher;
    teacher.userData.home = new T.Vector3(3.1, PLAT, -3.42); teacher.userData.away = new T.Vector3(2.05, PLAT, -3.0);
    L.hotTeacher = hot("teacher", "감독교사", 0.75, 1.4, 0.8, 3.1, PLAT + 0.7, -3.35);
    L.hotTeacher.userData.follow = teacher;
    /* 리빌 4: 교사 뒤 벽 (의자 등받이 위) */
    L.anchors[4] = { p: [3.1, 1.36, -3.985], r: [0, 0, 0] };

    /* ── 쓰레기통 ── */
    var bin = P.trashCan(); place(bin, 1.6, PLAT, -3.5); L.obj.bin = bin;
    hot("decoy:bin", "쓰레기통", 0.36, 0.34, 0.36, 1.6, PLAT + 0.17, -3.5);

    /* ── 학생 책걸상 6세트 + 위의 물건 ── */
    var rng = K.rng(99), desks = [];
    [[-0.5, 0], [1.35, 1]].forEach(function (rowz) {
      [-2.3, 0, 2.3].forEach(function (x, ci) {
        var z = rowz[0], d = P.schoolDesk(); place(d, x, 0, z);
        var c = P.schoolChair(); place(c, x + rng.range(-0.03, 0.03), 0, z + 0.4 + rng.range(-0.05, 0.05), rng.range(-0.08, 0.08)); c.rotation.y += PI * 0;
        desks.push({ desk: d, chair: c, x: x, z: z, row: rowz[1], col: ci });
      });
    });
    L.obj.desks = desks;
    var DTOP = 0.72;
    /* 앞줄 왼쪽/오른쪽 책상 위 책 (분위기용) */
    g.add(place(P.plainBook(0x7a4a3a, 0.26, 0.035, 0.19), -2.3, DTOP + 0.0175, -0.5, 0.14));
    g.add(place(P.plainBook(0x46704f, 0.26, 0.035, 0.19), 2.3, DTOP + 0.0175, -0.5, -0.1));
    /* 첫 일기: 둘째 줄 가운데 책상 */
    var diary = P.diaryPaper(); place(diary, 0, DTOP + 0.004, 1.35, 0.16); L.obj.diary1 = diary;
    hot("diary1obj", "일기", 0.34, 0.14, 0.3, 0, DTOP + 0.05, 1.35, 0.16);
    /* 리빌 7: 수학책 (같은 책상) + 아래 편지 */
    var math = P.mathBook(); place(math, 0.22, DTOP + 0.0175, 1.35, 0.18); L.obj.math = math;
    hot("mathbook", "책", 0.34, 0.14, 0.26, 0.22, DTOP + 0.06, 1.35, 0.18);
    L.anchors[7] = { p: [0.22, DTOP + 0.0035, 1.35], r: [0, 0.18, 0] };
    /* 리빌 3: 둘째 줄 왼쪽 책상 밑면의 포스트잇 + 편지(밑면) */
    var post = P.stickyNote(); post.position.set(-2.3, DTOP - 0.03 - 0.0012, 1.35); post.rotation.x = PI; post.rotation.y = 0.15; g.add(post); L.obj.postit = post;
    hot("postit", "쪽지", 0.24, 0.1, 0.2, -2.3, DTOP - 0.045, 1.35);
    L.anchors[3] = { p: [-2.3, DTOP - 0.03 - 0.0017, 1.35], r: [PI, 0, 0], under: true };

    /* ── 뒤 벽: 사물함 + 위 물건들 + 게시판 ── */
    var cab = P.cabinet(); place(cab, -2.6, 0, 3.74, PI); L.obj.cabinet = cab;
    var CT = cab.userData.topY;
    var doll = P.teddy(); place(doll, -2.6, CT, 3.68, PI + 0.25); L.obj.doll = doll;
    hot("doll", "인형", 0.42, 0.44, 0.34, -2.6, CT + 0.22, 3.68);
    L.anchors[2] = { p: [-2.6, CT + 0.0035, 3.68], r: [0, 0, 0] };
    var plant = P.plant(); place(plant, -1.55, CT, 3.7); L.obj.plant = plant;
    hot("decoy:plant", "화분", 0.34, 0.5, 0.34, -1.55, CT + 0.25, 3.7);
    var enc = new T.Group(); var eb = K.builder();
    [[0.055, 0.25, 0x4a3320], [0.05, 0.25, 0x5a3a2a], [0.05, 0.25, 0x33291f], [0.055, 0.25, 0x4a3a2a], [0.05, 0.25, 0x28323a]].forEach(function (b, i) { P.addBook(eb, b[1], b[0], 0.17, b[2], { p: [0, b[0] / 2 + i * 0.0 , 0] }); });
    /* 사물함 위 왼쪽: 백과사전 세트(옆으로 세운 책) */
    var encSet = new T.Group();
    var ex = -0.16; [0x4a3320, 0x5a3a2a, 0x33291f, 0x4a3a2a, 0x28323a, 0x5a3a2a].forEach(function (c, i) {
      var b2 = K.builder(); P.addBook(b2, 0.24, 0.05, 0.17, c, { p: [0, 0, 0], r: [0, 0, PI / 2] }); var bk = b2.build(); bk.position.set(ex + i * 0.052, 0.12, 0); encSet.add(bk);
    });
    place(encSet, -3.42, CT, 3.7, PI); L.obj.encyclopedias = encSet;
    hot("decoy:books", "책 무더기", 0.4, 0.3, 0.22, -3.42, CT + 0.14, 3.7);
    var cork = P.corkboard(); place(cork, -2.6, 1.82, 3.985, PI); L.obj.cork = cork;
    hot("decoy:notice2", "게시판", 1.5, 0.95, 0.06, -2.6, 1.82, 3.96);
    hot("decoy:locker", "사물함", 3.14, 1.0, 0.3, -2.6, 0.55, 3.62);
    /* 뒤 벽 오른쪽: 소화기 + 우산꽂이 + 청소도구는 왼쪽 구석 */
    var ext = P.extinguisher(); place(ext, 4.45, 0.02, 3.72, PI); L.obj.extinguisher = ext;
    L.hotExt = hot("extinguisher", "소화기", 0.32, 0.7, 0.32, 4.45, 0.4, 3.66); L.hotExt.userData.follow = ext;
    L.anchors[5] = { p: [4.45, 0.66, 3.995], r: [0, PI, 0] };
    var umb = P.umbrellaStand(); place(umb, 4.15, 0, 3.55); L.obj.umbrella = umb;
    hot("decoy:umb", "우산꽂이", 0.3, 1.0, 0.3, 4.15, 0.5, 3.55);
    var clean = P.cleaningSet(); place(clean, -4.5, 0, 3.55, PI * 0.5); L.obj.cleaning = clean;
    hot("decoy:mop", "대걸레·빗자루", 0.6, 1.3, 0.5, -4.5, 0.65, 3.55);
    var chairs = P.stackedChairs(); place(chairs, 4.3, 0, -3.35, -0.4); chairs.position.y = PLAT; L.obj.stacked = chairs;
    hot("decoy:chairs", "쌓아 둔 의자", 0.7, 0.85, 0.7, 4.3, PLAT + 0.43, -3.35);
    /* 뒤 벽: 스위치·콘센트 (문 옆) */
    var sw = P.switchPlate(); place(sw, 2.62, 1.28, 3.985, PI); var ol = P.outlet(); place(ol, 2.62, 0.4, 3.985, PI);
    hot("decoy:switches", "조명 스위치", 0.14, 0.16, 0.06, 2.62, 1.28, 3.95); hot("decoy:outlet", "콘센트", 0.12, 0.16, 0.06, 2.62, 0.4, 3.95);
    /* 앞 벽 왼쪽: 트로피 선반 */
    var shelf = P.trophyShelf(); place(shelf, -3.75, 1.45, -3.87); L.obj.trophy = shelf;
    hot("decoy:trophy", "트로피", 0.4, 0.36, 0.3, -3.55, 1.6, -3.85); hot("decoy:books", "책 무더기", 0.5, 0.2, 0.3, -4.05, 1.5, -3.85);

    /* ── 문 ── */
    var door = P.exitDoor(); door.position.set(R.DOOR.x1, 0, D.D / 2 - 0.0); door.position.z = 3.99; g.add(door); L.obj.door = door;
    var doorHit = hot("exitdoor", "뒷문", 0.95, 2.05, 0.12, R.DOOR.x1 - 0.475, 1.04, 4.08); L.hotDoor = doorHit; door.userData.pivot.add(doorHit); doorHit.position.set(-0.475, 1.04, 0.1);

    /* ── 오른쪽 벽: 액자 6 + 인쇄물 + 시간표·스피커·온습도계 ── */
    var order = ["newton", "archimedes", "abel", "einstein", "galilei", "gauss"];
    L.frameOrder = order;
    order.forEach(function (id, f) {
      var zz = -2.5 + f * 1.0, tex = opts.portraits && opts.portraits[id];
      var fr = P.sciFrame(tex || null); fr.position.set(D.W / 2 - 0.05, 1.72, zz); fr.rotation.y = -PI / 2; g.add(fr); L.frames[id] = fr;
      hot("frame:" + id, "액자", 0.74, 0.84, 0.1, D.W / 2 - 0.09, 1.72, zz, -PI / 2);
      if (opts.sciences) {
        var sc = opts.sciences.filter(function (s) { return s.id === id; })[0];
        if (sc) { var np = P.notePaper(sc); np.position.set(D.W / 2 - 0.012, 1.1, zz); np.rotation.y = -PI / 2; g.add(np); hot("note:" + id, "인쇄물", 0.62, 0.52, 0.06, D.W / 2 - 0.05, 1.1, zz, -PI / 2); }
      }
    });
    var tt = P.timetable(); place(tt, D.W / 2 - 0.012, 1.55, -3.45, -PI / 2); hot("decoy:timetable", "시간표", 0.5, 0.7, 0.06, D.W / 2 - 0.05, 1.55, -3.45, -PI / 2);
    var spk = P.speaker(); place(spk, D.W / 2 - 0.0, 2.62, -3.3, -PI / 2); hot("decoy:speaker", "방송 스피커", 0.3, 0.25, 0.12, D.W / 2 - 0.06, 2.62, -3.3, -PI / 2);
    var th = P.thermometer(); place(th, D.W / 2 - 0.0, 1.55, 3.2, -PI / 2); hot("decoy:thermo", "온습도계", 0.16, 0.22, 0.06, D.W / 2 - 0.04, 1.55, 3.2, -PI / 2);
    var ns = P.noticeSheet(); place(ns, -D.W / 2 + 0.012, 1.7, -1.825, PI / 2); hot("decoy:notice", "안내문", 0.32, 0.44, 0.06, -D.W / 2 + 0.05, 1.7, -1.825, PI / 2);

    /* ── 창(4) + 커튼(4) + 라디에이터 ── */
    R.WINDOWS.forEach(function (w, i) {
      var wu = P.windowUnit(w.w, w.y1 - w.y0); wu.position.set(-D.W / 2, (w.y0 + w.y1) / 2, w.z); wu.rotation.y = PI / 2; g.add(wu);
      var cu = P.curtain({ width: 1.5, length: 1.5, gatherSide: (i % 2 ? 1 : -1) });
      cu.position.set(-D.W / 2 + 0.14, w.y1 + 0.02, w.z); cu.rotation.y = PI / 2; g.add(cu); L.curtains.push(cu);
      cu.userData.setClosed(0);
      L.updaters.push(function (dt, t) { cu.userData.update(dt, t, false); });
    });
    hot("curtain", "커튼", 1.5, 1.5, 0.3, -D.W / 2 + 0.16, 1.8, R.WINDOWS[3].z);
    var rad = P.radiator(); place(rad, -D.W / 2 + 0.09, 0, 0.85, PI / 2); L.obj.radiator = rad;
    hot("decoy:radiator", "라디에이터", 0.24, 0.8, 1.05, -D.W / 2 + 0.12, 0.42, 0.85);
    /* 8장 편지: 커튼 위 (표면 위 한 점) */
    L.anchors[8] = { curtain: 3, u: 0.5, v: 0.32 };

    L.hotspots.forEach(function (h) { h.matrixAutoUpdate = true; });
    return L;
  };
})(window);
