/* N1P.memoryTower — 기억의 탑. 교탁 옆 받침대 위에 조각 여덟 개가 같은 규격의 나무 블록으로 쌓인다.
   · 블록마다 종이 라벨(기억 그림 + 연도). 조각을 얻을 때마다 맨 위에 올라온다.
   · 순서를 바꿔 볼 수 있다(setOrder). 틀린 ‘완성’은 탑이 무너지고(collapse) 다시 쌓인다.
   · 맞추면 라벨이 이름의 뼈대를 새긴 나무 결로 바뀌고 따뜻하게 빛난다(setSolved).
   앞면 +Z, 원점은 받침대 바닥 중앙. */
(function (root) {
  "use strict";
  var T = root.THREE, K = root.N1K, P = root.N1P, I = root.N1Icons, PI = Math.PI, A = K.anim;

  var BW = 0.4, BH = 0.1, BD = 0.26, LABEL_W = 0.34, LABEL_H = 0.072, BASE = 0.19, GAP = 0.003;
  var CARVE_W = 0.376, CARVE_H = 0.088;            /* 완성되면 라벨이 블록 앞면을 거의 가득 덮는 새김판이 된다(블록끼리 글자가 이어진다) */
  var CARVE_PX = [512, 120];
  var WOODS = [0xc48d54, 0xb98448, 0xc99259, 0xb07a44, 0xc08a50, 0xb5804a, 0xc7905a, 0xbb864c];

  /* 블록 라벨: 크림색 종이에 기억 그림과 연도. year 는 문자열 */
  function labelCanvas(n, year) {
    return P.canvas(512, 108, function (g, w, h) {
      g.fillStyle = "#f2efe0"; g.fillRect(0, 0, w, h);
      g.fillStyle = "#c2382b"; g.fillRect(0, 0, w, 6);
      g.strokeStyle = "rgba(27,38,64,.18)"; g.lineWidth = 2; g.strokeRect(5, 9, w - 10, h - 14);
      I.draw(g, n, 62, 58, 70, "#1b2640");
      g.fillStyle = "#1b2640"; g.font = "800 62px ui-monospace,Consolas,'Courier New',monospace"; g.textBaseline = "middle"; g.textAlign = "left";
      g.fillText(year, 140, 60);
      g.fillStyle = "rgba(27,38,64,.35)"; g.font = "700 22px ui-monospace,Consolas,monospace"; g.textAlign = "right"; g.fillText(String(n), w - 22, 36);
    });
  }
  P.memoryTower = function () {
    var g = new T.Group(); g.name = "memoryTower";
    /* 받침대: 학교 진열대 같은 어두운 나무 + 놋쇠 명패 */
    var pb = K.builder(), dark = P.wood("towerPlinth", 0x6a4326, 0.55, "coarse"), top = P.wood("towerTop", 0x7c522b, 0.5, "fine");
    pb.rbox(0.56, 0.15, 0.4, 0.015, dark, { p: [0, 0.075, 0], segs: 2, uv: 1.4 });
    pb.rbox(0.62, 0.035, 0.46, 0.01, top, { p: [0, 0.1675, 0], segs: 2, uv: 1.4 });
    pb.rbox(0.2, 0.045, 0.004, 0.002, P.M.brass(), { p: [0, 0.085, 0.202], segs: 1 });
    g.add(pb.build({ name: "plinth" }));

    var blocks = {}, order = [], solved = false, years = {}, skeleton = null, baseImg = null, plinthSets = null;
    var woodTex = K.tex.grain("fine");
    function makeBlock(n) {
      var b = new T.Group(); b.name = "block" + n; b.userData.n = n;
      var mat = K.std(WOODS[(n - 1) % WOODS.length], 0.6, 0, { map: woodTex.map, bump: woodTex.bump, bumpScale: 0.001 });
      var bb = K.builder(); bb.rbox(BW, BH, BD, 0.012, mat, { segs: 2, uv: 1.2 });
      var body = bb.build({ name: "slab" }); b.add(body);
      var lab = new T.Mesh(new T.PlaneGeometry(LABEL_W, LABEL_H), P.canvasMat(labelCanvas(n, years[n] || ""), { rough: 0.85 }));
      lab.position.set(0, 0, BD / 2 + 0.0012); lab.userData.noHull = true; b.add(lab);
      b.userData.mat = mat; b.userData.label = lab; b.userData.body = body;
      body.traverse(function (o) { if (o.isMesh) { o.castShadow = true; o.receiveShadow = true; } });
      return b;
    }
    function relabel(n) {
      var b = blocks[n]; if (!b) return;
      var m = b.userData.label.material; if (m.map) m.map.dispose(); m.dispose();
      var cv, lab = b.userData.label;
      if (solved && baseImg) { cv = I.slice(baseImg, order.indexOf(n), 8, CARVE_PX[0], CARVE_PX[1]); lab.scale.set(CARVE_W / LABEL_W, CARVE_H / LABEL_H, 1); }
      else { cv = labelCanvas(n, years[n] || ""); lab.scale.set(1, 1, 1); }
      lab.material = P.canvasMat(cv, { rough: solved ? 0.6 : 0.85 });
    }
    /* 윤곽선 껍질: 받침대(밖에서 붙인 것)와 블록들의 껍질을 하나로 묶어, 탑 어디를 가리켜도 전체가 강조된다 */
    function syncHulls() {
      if (!plinthSets) { if (!g.userData.hullSets) return; plinthSets = g.userData.hullSets.slice(); }
      var sets = plinthSets.slice();
      Object.keys(blocks).forEach(function (k) { var hs = blocks[k].userData.hullSets; if (hs) sets = sets.concat(hs); });
      g.userData.hullSets = sets; g.userData.hulls = sets.map(function (e) { return e.ink; });
    }
    g.userData.syncHulls = syncHulls;
    /* order 는 위에서 아래로(0 번이 맨 위). 아래에서 몇 번째 칸인지로 높이를 정한다 */
    function slotOf(i) { return order.length - 1 - i; }
    function yOfSlot(k) { return BASE + BH * (k + 0.5) + k * GAP; }
    function stack(animate) {
      order.forEach(function (n, i) {
        var b = blocks[n]; if (!b) return;
        var y = yOfSlot(slotOf(i));
        if (animate) {
          var y0 = b.position.y, tw = b.userData.tw; if (tw) tw.cancel();
          b.userData.tw = A.tween({ dur: 0.38, ease: A.ease.outBack, update: function (k) { b.position.set(0, K.lerp(y0, y, k), 0); b.rotation.set(K.lerp(b.rotation.x, 0, k), K.lerp(b.rotation.y, 0, k), K.lerp(b.rotation.z, 0, k)); } });
        } else { b.position.set(0, y, 0); b.rotation.set(0, 0, 0); }
      });
    }

    /* 연도 표: { n: "1954", … } — 라벨을 다시 그린다 */
    g.userData.setYears = function (ys) { years = ys || {}; order.forEach(relabel); };
    /* 블록 집합과 순서를 맞춘다. 새로 생긴 블록은 위에서 내려앉는다(animate). onNew(n) 은 내려앉는 순간 */
    g.userData.setOrder = function (ord, animate) {
      var added = [];
      ord.forEach(function (n) { if (!blocks[n]) { blocks[n] = makeBlock(n); blocks[n].position.set(0, yOfSlot(ord.length) + 0.5, 0); g.add(blocks[n]); added.push(n); } });
      var removed = false;
      Object.keys(blocks).forEach(function (k) { if (ord.indexOf(+k) < 0) { var b = blocks[k]; g.remove(b); delete blocks[k]; removed = true; } });
      if (removed) syncHulls();
      order = ord.slice();
      if (K.outline && K.outline.mat) { added.forEach(function (n) { K.outline.attach(blocks[n], { mode: "parent" }); }); syncHulls(); }
      if (solved) order.forEach(relabel);
      added.forEach(function (n) {
        var b = blocks[n], y = yOfSlot(slotOf(order.indexOf(n)));
        if (animate) { b.visible = true; b.scale.setScalar(0.01); b.position.y = y + 0.35; A.tween({ dur: 0.7, ease: A.ease.outBounce, update: function (k) { b.scale.setScalar(Math.max(0.01, Math.min(1, k * 1.6))); b.position.y = K.lerp(y + 0.35, y, k); } }); }
        else { b.position.set(0, y, 0); }
      });
      stack(animate && !added.length);
      return added;
    };
    g.userData.height = function () { return BASE + order.length * (BH + GAP); };
    g.userData.count = function () { return order.length; };
    g.userData.blockPos = function (n) { var b = blocks[n]; return b ? b.position.clone() : null; };

    /* 이름의 뼈대를 새기고 따뜻하게 빛난다 */
    g.userData.setSolved = function (on, lines, animate) {
      solved = !!on;
      if (solved) { skeleton = lines || skeleton; baseImg = I.engrave(skeleton || [""], CARVE_PX[0], CARVE_PX[1] * 8); }
      order.forEach(relabel);
      order.forEach(function (n, i) {
        var m = blocks[n].userData.mat;
        if (!m.emissive) return;
        var target = solved ? 0.22 : 0;
        if (animate) A.tween({ dur: 0.9, delay: i * 0.07, update: function (k) { m.emissive = K.srgb(0xffb35c); m.emissiveIntensity = target * k; } });
        else { m.emissive = K.srgb(0xffb35c); m.emissiveIntensity = target; }
      });
    };
    /* 틀린 ‘완성’: 블록이 흩어져 떨어지고, 잠시 뒤 지금 순서대로 다시 쌓인다 */
    g.userData.collapse = function (done) {
      var rr = K.rng(Date.now() & 0xffff);
      order.forEach(function (n, i) {
        var b = blocks[n]; if (b.userData.tw) b.userData.tw.cancel();
        var x0 = b.position.x, y0 = b.position.y, z0 = b.position.z, rx = (rr.next() - 0.5) * 1.4, rz = (rr.next() - 0.5) * 1.4, tx = (rr.next() - 0.5) * 0.9, tz = 0.15 + rr.next() * 0.55;
        var y1 = 0.045 + (i % 3) * 0.004;
        b.userData.tw = A.tween({ dur: 0.85, delay: (order.length - 1 - i) * 0.05, ease: A.ease.inQuad, update: function (k) {
          b.position.set(K.lerp(x0, tx, k), K.lerp(y0, y1, k), K.lerp(z0, tz, k)); b.rotation.set(rx * k, k * (tx > 0 ? 0.8 : -0.8), rz * k);
        } });
      });
      A.tween({ dur: 0.01, delay: 2.1, update: function () {}, done: function () { stack(true); if (done) setTimeout(done, 450); } });
      return 2.5;
    };
    g.userData.size = [0.62, 1.1, 0.46];
    return g;
  };
})(window);
