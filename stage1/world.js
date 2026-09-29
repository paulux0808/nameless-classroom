/* ============================================================================
   N1W — 게임 월드 층: 교실 배치(layout) 위에서 "게임이 움직이는 부분"을 맡는다.
   · 리빌: 달력·인형·쪽지·교사·소화기·시계·수학책·커튼이 치워지며 편지가 나타난다
   · 편지 8장, 칠판 종이, 액자 회전, 지구본, 뒷문, 조명 진행(오후→저녁)과 어두워짐
   · 화면(DOM)을 모른다. 알릴 것은 콜백으로만.
   상태 반영은 applyState(S, instant) 한 곳에서 한다 — 저장 복원과 새 게임이 같은 길을 탄다.
   ========================================================================== */
(function (root) {
  "use strict";
  var T = root.THREE, K = root.N1K, A = K.anim, P = root.N1P, R = root.N1R, PI = Math.PI;
  var D_ = R.DIM;

  /* 표면 법선 n, 글자 위쪽 up, 회전 roll 로 납작한 물체(로컬 +Y 가 법선)를 세운다 */
  var _X = new T.Vector3(), _Y = new T.Vector3(), _Z = new T.Vector3(), _M = new T.Matrix4(), _Q = new T.Quaternion(), _AX = new T.Vector3(0, 1, 0);
  function orient(obj, n, up, roll) {
    _Y.set(n[0], n[1], n[2]).normalize();
    _Z.set(up[0], up[1], up[2]).negate(); _Z.addScaledVector(_Y, -_Z.dot(_Y)).normalize();
    _X.crossVectors(_Y, _Z);
    _M.makeBasis(_X, _Y, _Z); obj.quaternion.setFromRotationMatrix(_M);
    if (roll) obj.quaternion.multiply(_Q.setFromAxisAngle(_AX, roll));
  }

  function glowTexture() {
    var c = document.createElement("canvas"); c.width = c.height = 128; var g = c.getContext("2d");
    var gr = g.createRadialGradient(64, 64, 0, 64, 64, 64);
    gr.addColorStop(0, "rgba(255,236,190,1)"); gr.addColorStop(0.3, "rgba(255,214,140,.5)"); gr.addColorStop(1, "rgba(255,200,120,0)");
    g.fillStyle = gr; g.fillRect(0, 0, 128, 128);
    var t = new T.CanvasTexture(c); t.encoding = T.sRGBEncoding; return t;
  }

  /* 치워질 때의 움직임 표: 홈에서 (dx,dy,dz)만큼, 방향 spin(rad), 포물선 arc(m) */
  var AWAY = {
    1: { get: function (L) { return L.obj.calendar; }, d: [0.08, 0, -0.19], spin: 0.55, arc: 0.07, dur: 0.85 },
    2: { get: function (L) { return L.obj.doll; }, d: [0.55, 0, 0.02], spin: -0.75, arc: 0.17, dur: 1.0 },
    3: { get: function (L) { return L.obj.postit; }, d: [0.22, 0, 0.15], spin: 0.55, arc: 0.0, dur: 0.8, peel: true },
    5: { get: function (L) { return L.obj.extinguisher; }, d: [0.33, 0.05, 0], spin: -0.35, arc: 0.09, dur: 1.0 },
    6: { get: function (L) { return L.obj.clock; }, d: [0.78, 0, 0], spin: 0, arc: 0.0, dur: 1.0, swing: true },
    7: { get: function (L) { return L.obj.math; }, d: [-0.34, 0, 0.05], spin: -0.6, arc: 0.14, dur: 0.9 }
  };

  function create(o) {
    var scene = o.scene, L = o.layout, light = o.light, D = o.data, renderer = o.renderer;
    var W = { active: [], letters: {}, papers: [], progress: 0, dark: 0 };
    var glowTex = glowTexture();

    /* ── 핫스팟 활성 목록 ── */
    function setHot(mesh, on) {
      if (!mesh) return;
      var i = W.active.indexOf(mesh);
      if (on && i < 0) W.active.push(mesh);
      if (!on && i >= 0) W.active.splice(i, 1);
    }
    L.hotspots.forEach(function (h) { W.active.push(h); });
    var CLUE_HOT = { 1: "calendar", 2: "doll", 3: "postit", 4: "teacher", 5: "extinguisher", 6: "clock", 7: "mathbook", 8: "curtain" };
    function clueHot(n, on) { setHot(L.hotById[CLUE_HOT[n]], on); }

    /* ── 홈 위치 기록 ── */
    var HOME = {};
    Object.keys(AWAY).forEach(function (n) { var ob = AWAY[n].get(L); HOME[n] = { pos: ob.position.clone(), ry: ob.rotation.y, rz: ob.rotation.z, rx: ob.rotation.x }; });
    var teacher = L.obj.teacher, seatedPos = teacher.userData.home.clone(), awayPos = teacher.userData.away.clone();

    /* ── 편지 8장 ── */
    function letterAnchorPose(n) {
      var a = L.anchors[n], holder = W.letters[n].holder, p;
      if (a.curtain != null) {
        var cu = L.curtains[a.curtain]; p = cu.userData.surface(a.u, a.v);
        /* 주름 마루에 걸치도록 주변 표본 중 가장 앞쪽 z 를 쓴다 */
        var zmax = -1e9, i, j; for (i = -3; i <= 3; i++) for (j = -2; j <= 2; j++) { var q = cu.userData.surface(K.clamp(a.u + i * 0.02, 0, 1), K.clamp(a.v + j * 0.03, 0, 1)); if (q.z > zmax) zmax = q.z; }
        p.z = zmax + 0.012; cu.updateMatrixWorld(true); p = cu.localToWorld(p);
      } else p = new T.Vector3(a.p[0], a.p[1], a.p[2]);
      holder.position.copy(p); orient(holder, a.n, a.up, a.roll || 0);
      W.letters[n].base = p.clone();
    }
    for (var n = 1; n <= 8; n++) (function (n) {
      var next = n + 1, meta = next === 9 ? { era: "2018", title: "마지막 일기" } : D.CH[next - 1];
      var holder = new T.Group(), letter = P.letter(meta.title, meta.era); holder.add(letter);
      if (K.outline && K.outline.mat) K.outline.attach(holder, { mode: "rigid" });                          /* 카툰: 편지 테두리 */
      var hit = new T.Mesh(new T.BoxGeometry(0.56, 0.09, 0.42), L.hotspots[0].material);
      hit.userData.hot = { id: "reward:" + n, name: "편지" }; hit.userData.isHit = true; hit.renderOrder = -1; hit.layers.set(1); holder.add(hit);
      var glow = new T.Sprite(new T.SpriteMaterial({ map: glowTex, color: 0xffd694, transparent: true, opacity: 0, blending: T.AdditiveBlending, depthWrite: false, fog: false }));
      glow.scale.set(0.9, 0.9, 1); glow.position.y = 0.05; holder.add(glow);
      holder.visible = false; scene.add(holder);
      W.letters[n] = { holder: holder, letter: letter, hit: hit, glow: glow, shown: false, t0: 0 };
      if (L.anchors[n].curtain == null) letterAnchorPose(n);
    })(n);

    /* ── 첫 일기 위 안내 화살표 ── */
    var arrow = (function () {
      var b = K.builder(), m = K.mat("arrow.pencil", function () { return K.std(0xf1c94a, 0.4, 0.1, { emissive: 0x6a4a08, ei: 0.7, env: 1 }); });
      b.cyl(0.0, 0.05, 0.075, m, { p: [0, 0.0375, 0], r: [PI, 0, 0], seg: 4 });
      b.cyl(0.018, 0.018, 0.07, m, { p: [0, 0.11, 0], seg: 8 });
      var g = b.build({ name: "arrow" }); g.position.set(L.arrowSpot[0], L.arrowSpot[1], L.arrowSpot[2]); g.rotation.y = 0.785; scene.add(g);
      g.traverse(function (x) { x.castShadow = false; }); return g;
    })();
    W.arrow = arrow;

    /* ── 액자 ── */
    var frameIds = L.frameOrder;
    frameIds.forEach(function (id) {
      var fr = L.frames[id]; fr.userData.turns = 0; fr.userData.spinTw = null;
      fr.userData.setSignature(o.model.frameSignature(id));
    });
    function frameTarget(fr) { return -fr.userData.turns * PI / 2; }
    W.setFrameRot = function (id, rot, instant) {
      var fr = L.frames[id]; if (!fr) return;
      var spin = fr.userData.spin;
      if (instant) { fr.userData.turns = rot; if (fr.userData.spinTw) fr.userData.spinTw.cancel(); spin.rotation.z = frameTarget(fr); return; }
      fr.userData.turns += 1;                          /* 4→0 도 늘 같은 방향으로 한 바퀴 이어 돈다 */
      var z0 = spin.rotation.z, z1 = frameTarget(fr);
      if (fr.userData.spinTw) fr.userData.spinTw.cancel();
      fr.userData.spinTw = A.tween({ dur: 0.5, ease: A.ease.outBack, update: function (k) {
        spin.rotation.z = K.lerp(z0, z1, k); fr.userData.zKick = Math.sin(Math.min(1, k * 1.6) * PI) * 0.007; spin.position.z = fr.userData.zKick;
      }, done: function () { spin.rotation.z = z1; spin.position.z = 0; fr.userData.spinTw = null; } });
    };

    /* ── 칠판 종이 ── */
    var B = L.board, boardGroup = new T.Group(); scene.add(boardGroup);
    var BOARD_Z = B.z + 0.0125 + 0.0016;
    var PAPER_ICON = { sheet: "sheet", sport: "sport", map: "map", video: "video", keyb: "keyb" };
    function slotX(k) { return -2.36 + (k - 1) * 0.59; }
    W.boardSlot = function (k) { return new T.Vector3(slotX(k), 2.13, BOARD_Z); };
    W.refreshBoard = function (S, popIndex) {
      while (boardGroup.children.length) {
        var ch0 = boardGroup.children[0]; boardGroup.remove(ch0);
        ch0.traverse(function (x) {
          if (x.userData && x.userData.hot) setHot(x, false);
          if (x.geometry) x.geometry.dispose();                                               /* 종이마다 따로 만든 지오메트리 */
          if (x.material && x.material.map) { x.material.map.dispose(); x.material.dispose(); }   /* 공유 재질(핀·테이프)은 남긴다 */
        });
      }
      W.papers.length = 0;
      var maxD = Math.min(S.ch, 9);
      for (var k = 1; k <= maxD; k++) {
        if (k === 1 && !S.tookD1) continue;
        var meta = k === 9 ? { era: "2018", title: "마지막" } : D.CH[k - 1];
        add({ kind: "diary", title: k === 9 ? "마지막 일기" : k + "번째 일기", sub: k === 9 ? meta.era : meta.title, accent: "#a03528", id: "diaryP:" + k, name: "일기", x: slotX(k), y: 2.13, tilt: (((k * 37) % 9) - 4) * 0.008, k: k });
        var bp = D.BOARD_PAPERS[k];
        if (bp) add({ kind: "ref", title: bp.name, label: bp.label, accent: "#2f5f8a", icon: PAPER_ICON[bp.id] || "sheet", seed: k * 11, id: bp.id === "sheet" ? "sheet" : "refP:" + bp.id, name: bp.label, x: slotX(k), y: 1.05, tilt: -(((k * 29) % 7) - 3) * 0.008, k: k });
      }
      function add(it) {
        var g = P.boardPaper(it); g.position.set(it.x, it.y, BOARD_Z); g.rotation.z = it.tilt; boardGroup.add(g);
        if (K.outline && K.outline.mat) { K.outline.attach(g, { mode: "rigid" }); it.owner = g; }
        var hit = new T.Mesh(new T.BoxGeometry(0.5, 0.39, 0.06), L.hotspots[0].material);
        hit.position.set(it.x, it.y, BOARD_Z + 0.02); hit.userData.hot = { id: it.id, name: it.name }; hit.userData.isHit = true; hit.renderOrder = -1; hit.layers.set(1);
        boardGroup.add(hit); setHot(hit, true); if (it.owner) hit.userData.hlOwner = it.owner;
        W.papers.push({ group: g, hit: hit, k: it.k, kind: it.kind });
        if (popIndex && it.k === popIndex && it.kind === "diary") popIn(g);
      }
    };
    function popIn(g) {
      g.scale.setScalar(0.001);
      A.tween({ dur: 0.55, ease: A.ease.outBack, update: function (k) { g.scale.setScalar(Math.max(0.001, k)); } });
    }
    W.hasBoardPaper = function (k) { return W.papers.some(function (p) { return p.k === k && p.kind === "diary"; }); };

    /* ── 편지 보이기/숨기기 ── */
    W.showLetter = function (n, animate) {
      var Lt = W.letters[n]; if (!Lt) return;
      if (L.anchors[n].curtain != null) letterAnchorPose(n);
      Lt.shown = true; Lt.holder.visible = true; setHot(Lt.hit, true);
      var h = Lt.holder, base = Lt.base.clone(), nrm = new T.Vector3(L.anchors[n].n[0], L.anchors[n].n[1], L.anchors[n].n[2]);
      if (!animate) { h.position.copy(base); h.scale.setScalar(1); Lt.glow.material.opacity = 0.5; return; }
      h.scale.setScalar(0.35);
      A.tween({ dur: 0.9, ease: A.ease.outBack, update: function (k) {
        h.scale.setScalar(K.lerp(0.35, 1, k)); h.position.copy(base).addScaledVector(nrm, (1 - k) * 0.06);
        Lt.glow.material.opacity = Math.min(1, k * 1.6) * 0.5;
      } });
    };
    W.hideLetter = function (n) {
      var Lt = W.letters[n]; if (!Lt) return;
      Lt.shown = false; Lt.holder.visible = false; setHot(Lt.hit, false); Lt.glow.material.opacity = 0;
    };

    /* ── 치워지는 물건 ── */
    function awayPose(n) {
      var a = AWAY[n], h = HOME[n];
      return { pos: h.pos.clone().add(new T.Vector3(a.d[0], a.d[1], a.d[2])), ry: h.ry + (a.spin || 0) };
    }
    function applyAway(n, instant, done) {
      if (n === 4) return applyTeacher(instant, done);
      if (n === 8) return applyCurtain(instant, done);
      var a = AWAY[n], ob = a.get(L), h = HOME[n], to = awayPose(n);
      if (instant) { ob.position.copy(to.pos); ob.rotation.y = to.ry; ob.rotation.z = h.rz; if (done) done(); return; }
      var from = ob.position.clone(), ry0 = ob.rotation.y;
      A.tween({ dur: a.dur, ease: a.swing ? A.ease.inOutCubic : A.ease.inOutCubic, update: function (k) {
        ob.position.set(K.lerp(from.x, to.pos.x, k), K.lerp(from.y, to.pos.y, k) + Math.sin(k * PI) * (a.arc || 0), K.lerp(from.z, to.pos.z, k));
        ob.rotation.y = K.lerp(ry0, to.ry, k);
        if (a.swing) ob.rotation.z = h.rz + Math.sin(k * PI) * -0.22 * (1 - k * 0.3);             /* 시계: 걸이에서 벗겨져 흔들린다 */
        else if (a.arc) ob.rotation.z = h.rz + Math.sin(k * PI * 2) * 0.1;                        /* 물건이 들리며 기우뚱 */
        if (a.peel) ob.rotation.z = h.rz + Math.sin(k * PI) * 0.35;                               /* 쪽지: 한쪽이 떨어졌다 붙는다 */
      }, done: function () { ob.position.copy(to.pos); ob.rotation.y = to.ry; ob.rotation.z = h.rz; if (done) done(); } });
    }
    function restoreAway(n) {
      if (n === 4) { teacher.userData.setSeated(seatedPos, 0); return; }
      if (n === 8) { W.setCurtain(0); return; }
      var ob = AWAY[n].get(L), h = HOME[n]; ob.position.copy(h.pos); ob.rotation.y = h.ry; ob.rotation.z = h.rz; ob.rotation.x = h.rx;
    }
    function applyTeacher(instant, done) {
      if (instant) { teacher.userData.setStanding(awayPos, 0); if (done) done(); return; }
      teacher.userData.standAndMove(awayPos, 0, function () { if (done) done(); });
    }
    /* 커튼: 0(모임)→1(활짝) 이 곧 "닫힘". 방이 어두워진다 */
    W.curtain = 0;
    W.setCurtain = function (c) { W.curtain = c; L.curtains[3].userData.setClosed(c); };
    function applyCurtain(instant, done) {
      if (instant) { W.setCurtain(1); W.setDark(1, true); if (done) done(); return; }
      A.tween({ dur: 1.9, ease: A.ease.inOutCubic, update: function (k) { W.setCurtain(k); L.curtains[3].userData.update(0, W.time, true); } });
      A.tween({ dur: 2.6, delay: 0.5, ease: A.ease.inOutSine, update: function (k) { setDarkRaw(k); }, done: function () { if (done) done(); } });
    }

    /* ── 빛: 진행에 따라 해가 기울고, 8장에서 어두워진다 ── */
    var baseExposure = renderer ? renderer.toneMappingExposure : 1;
    function setDarkRaw(d) { W.dark = d; light.setDark(d); }
    W.setDark = function (d, instant) {
      if (instant) { setDarkRaw(d); return; }
      var d0 = W.dark; A.tween({ dur: 2.2, update: function (k) { setDarkRaw(K.lerp(d0, d, k)); } });
    };
    W.setProgress = function (k, instant) {
      if (instant) { W.progress = k; light.setProgress(k); if (W.dark) light.setDark(W.dark); return; }
      var k0 = W.progress; W.progress = k;
      A.tween({ dur: 2.4, update: function (t) { light.setProgress(K.lerp(k0, k, t)); if (W.dark) light.setDark(W.dark); } });
    };

    /* ── 상태 일괄 반영 ── */
    W.applyState = function (S, instant) {
      for (var i = 1; i <= 8; i++) { restoreAway(i); W.hideLetter(i); clueHot(i, true); }
      L.curtains[3].userData.setClosed(0); W.curtain = 0; setDarkRaw(0);
      S.pieces.forEach(function (n) { clueHot(n, false); applyAway(n, true); });
      if (S.revealed) { clueHot(S.revealed, false); applyAway(S.revealed, true); W.showLetter(S.revealed, false); }
      frameIds.forEach(function (id) { W.setFrameRot(id, o.model.frameRot(id), true); });
      W.setDiaryOnDesk(!(S.tookD1 || S.ch > 1));
      W.openDoor(S.done ? 1 : 0);
      W.setProgress(S.pieces.length / 8, true);
      W.refreshBoard(S);
      W.setExitGlow(S.done ? 0.6 : 0);
    };
    W.setDiaryOnDesk = function (v) { L.obj.diary1.visible = v; setHot(L.hotById.diary1obj, v); arrow.visible = v; };

    /* ── 리빌 연출: 물건이 치워지고 편지가 나타난다 ── */
    W.reveal = function (n, done) {
      clueHot(n, false);
      var lag = { 1: 0.5, 2: 0.6, 3: 0.45, 4: 1.7, 5: 0.6, 6: 0.55, 7: 0.5, 8: 2.0 }[n] || 0.5;
      applyAway(n, false);
      A.tween({ dur: 0.01, delay: lag, update: function () {}, done: function () { W.showLetter(n, true); if (done) done(); } });
    };
    /* 읽은 편지가 칠판의 새 일기 종이 자리로 날아가 붙는다 */
    W.stickToBoard = function (n, S, done) {
      var Lt = W.letters[n], h = Lt.holder, k = n + 1, from = h.position.clone(), fq = h.quaternion.clone();
      var target = W.boardSlot(k), tq = new T.Quaternion();
      var tmp = new T.Object3D(); orient(tmp, [0, 0, 1], [0, 1, 0], 0); tq.copy(tmp.quaternion);
      setHot(Lt.hit, false); Lt.glow.material.opacity = 0;
      A.tween({ dur: 1.15, ease: A.ease.inOutCubic, update: function (t) {
        h.position.set(K.lerp(from.x, target.x, t), K.lerp(from.y, target.y, t) + Math.sin(t * PI) * 0.45, K.lerp(from.z, target.z, t) + Math.sin(t * PI) * 0.5 * (1 - t));
        h.quaternion.slerpQuaternions(fq, tq, t); h.scale.setScalar(K.lerp(1, 1.24, t));
      }, done: function () { W.hideLetter(n); h.scale.setScalar(1); W.refreshBoard(S, k); if (done) done(); } });
    };

    /* ── 소소한 반응: 지구본, 흔들림 ── */
    W.spinGlobe = function () { L.obj.globe.userData.spin = 9; };
    var NUDGE = { "decoy:bin": "bin", "decoy:plant": "plant", "decoy:umb": "umbrella", "decoy:chairs": "stacked", "decoy:mop": "cleaning", "decoy:radiator": null };
    W.nudge = function (id) {
      var key = NUDGE[id], ob = key && L.obj[key];
      if (id === "decoy:eraser") ob = L.obj.board.userData.eraser; if (id === "decoy:chalk") ob = L.obj.board.userData.chalkBox;
      if (!ob) return;
      var r0 = ob.rotation.z, x0 = ob.rotation.x;
      A.tween({ dur: 0.7, ease: A.ease.linear, update: function (k) { var dec = Math.pow(1 - k, 2); ob.rotation.z = r0 + Math.sin(k * 26) * 0.05 * dec; ob.rotation.x = x0 + Math.sin(k * 19 + 1) * 0.025 * dec; }, done: function () { ob.rotation.z = r0; ob.rotation.x = x0; } });
    };

    /* ── 뒷문 ── */
    var doorPivot = L.obj.door.userData.pivot;
    W.openDoor = function (k) { doorPivot.rotation.y = k * PI / 2; };
    /* 문밖의 빛: 열리는 만큼 밝아지는 판 + 바닥에 번지는 빛 */
    var glowMat = new T.MeshBasicMaterial({ map: (function () {
      var c = document.createElement("canvas"); c.width = 16; c.height = 256; var g = c.getContext("2d"), gr = g.createLinearGradient(0, 0, 0, 256);
      gr.addColorStop(0, "#fffaf0"); gr.addColorStop(1, "#ffe9c4"); g.fillStyle = gr; g.fillRect(0, 0, 16, 256);
      var t = new T.CanvasTexture(c); t.encoding = T.sRGBEncoding; return t; })(), fog: false, toneMapped: false, transparent: true, opacity: 0, depthWrite: false });
    var doorGlow = new T.Mesh(new T.PlaneGeometry(2.6, 2.8), glowMat); doorGlow.position.set((R.DOOR.x0 + R.DOOR.x1) / 2, 1.4, 4.75); doorGlow.rotation.y = PI; scene.add(doorGlow);
    var spill = (function () {
      var x0 = R.DOOR.x0, x1 = R.DOOR.x1, zA = 3.95, zB = 1.6, wB = 1.3;
      var pos = [x0, 0.014, zA, x1, 0.014, zA, x1 + wB, 0.014, zB, x0 - wB, 0.014, zB];
      var col = [1, 0.93, 0.78, 1, 0.93, 0.78, 0, 0, 0, 0, 0, 0];
      var g = new T.BufferGeometry(); g.setAttribute("position", new T.Float32BufferAttribute(pos, 3)); g.setAttribute("color", new T.Float32BufferAttribute(col, 3)); g.setIndex([0, 2, 1, 0, 3, 2]);
      var m = new T.MeshBasicMaterial({ vertexColors: true, blending: T.AdditiveBlending, transparent: true, depthWrite: false, fog: false, opacity: 0, side: T.DoubleSide });
      var mesh = new T.Mesh(g, m); mesh.renderOrder = 4; mesh.frustumCulled = false; scene.add(mesh); return mesh;
    })();
    /* 문 유리 너머 복도: 늘 희미하게 켜져 있어 유리가 시커멓게 보이지 않는다 */
    var hall = new T.Mesh(new T.PlaneGeometry(2.6, 2.8), new T.MeshBasicMaterial({ color: 0x3a342a, fog: false, toneMapped: false })); hall.position.set((R.DOOR.x0 + R.DOOR.x1) / 2, 1.4, 4.9); hall.rotation.y = PI; scene.add(hall); W.hall = hall;
    /* 눈부심: 열린 문 앞에서만 켜지는 큰 번짐(화면 전체에 겹쳐 그린다) */
    var bloom = new T.Sprite(new T.SpriteMaterial({ map: glowTex, color: 0xfff2d8, transparent: true, opacity: 0, blending: T.AdditiveBlending, depthTest: false, depthWrite: false, fog: false, toneMapped: false }));
    bloom.scale.set(5.5, 5.5, 1); bloom.position.set((R.DOOR.x0 + R.DOOR.x1) / 2, 1.2, 4.3); bloom.renderOrder = 20; bloom.visible = false; scene.add(bloom);
    W.setExitGlow = function (k) { k = K.clamp(k, 0, 1); glowMat.opacity = k; spill.material.opacity = 0.75 * k; doorGlow.visible = k > 0.001; spill.visible = k > 0.001; bloom.visible = k > 0.001; bloom.material.opacity = 0.55 * k * k; };
    W.setExitGlow(0);

    /* 코드가 맞은 뒤: 문이 열리고 빛이 밀려든다. 카메라가 문 쪽으로 다가간다. */
    W.playExit = function (cam, C, done) {
      C.lock++; C.focus = null; C.crouch = false;
      var from = cam.position.clone(), yaw0 = C.yaw, pit0 = C.pitch, stage = new T.Vector3(3.4, C.EYE, 2.7);
      var dy = ((0 - yaw0 + PI * 3) % (PI * 2)) - PI;
      A.tween({ dur: 1.5, ease: A.ease.inOutCubic, update: function (k) {
        cam.position.x = K.lerp(from.x, stage.x, k); cam.position.z = K.lerp(from.z, stage.z, k); C.yaw = yaw0 + dy * k; C.pitch = K.lerp(pit0, 0, k);
      }, done: function () {
        A.tween({ dur: 2.0, ease: A.ease.inOutCubic, update: function (k) { doorPivot.rotation.y = k * PI / 2; W.setExitGlow(k); } });
        A.tween({ dur: 3.0, delay: 1.0, ease: A.ease.inOutCubic, update: function (k) { cam.position.z = K.lerp(stage.z, 3.35, k); C.pitch = K.lerp(0, 0.02, k); }, done: function () { C.lock = Math.max(0, C.lock - 1); W.setExitGlow(0.6); if (done) done(); } });
      } });
    };

    /* ── 되돌리기(새 게임) ── */
    W.reset = function (S) { W.applyState(S, true); };

    /* ── 프레임 갱신 ── */
    W.time = 0; var _cp = new T.Vector3();
    W.update = function (dt, t, camPos) {
      W.time = t; A.update(dt);
      for (var i = 0; i < L.updaters.length; i++) L.updaters[i](dt, t);
      teacher.userData.update(dt, t, camPos);
      light.update(dt, t);
      if (arrow.visible) { arrow.position.y = L.arrowSpot[1] + Math.sin(t * 2.6) * 0.03; arrow.rotation.y += dt * 1.4; }
      for (var n = 1; n <= 8; n++) {
        var Lt = W.letters[n]; if (!Lt.shown) continue;
        var p = 0.5 + 0.5 * Math.sin(t * 2.1 + n);
        Lt.glow.material.opacity = 0.32 + 0.3 * p; Lt.glow.scale.setScalar(0.78 + 0.16 * p);
        Lt.letter.rotation.z = Math.sin(t * 0.8 + n) * 0.012;
      }
    };
    return W;
  }
  root.N1W = { create: create, orient: orient };
})(window);
