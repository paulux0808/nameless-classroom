/* ============================================================================
   NAMELESS Ⅱ — 공용 런타임

   챕터 HTML은 이 파일과 logic.js, 그리고 자기 챕터 데이터만 싣고
   N2Engine.boot(chapter) 를 부른다. 챕터는 이 파일을 고쳐 쓰지 않는다.
   엔진을 고쳐야 하면 엔진을 고치고 모든 챕터가 같이 받는다.
   ========================================================================== */
(function (global) {
  "use strict";

  var L = global.N2;
  var THREE = global.THREE;

  var MODEL_BASE = "../assets/models/";

  /* ── 상태 ──────────────────────────────────────────────────────────── */
  var chapter = null, S = null;
  var renderer, scene, camera, ray, clock;
  var hotspots = [], models = {};
  var yaw = 0, pitch = 0, keys = {}, joy = { x: 0, z: 0 };
  var EYE = 1.62, SPEED = 2.6, lastT = 0;
  var BLOCKS = [];
  var npc = null, npcMixer = null, npcClips = {}, npcAction = null;
  var deskProps = {};
  var conditionRoom = null;
  function isConditions() { return chapter && chapter.puzzleType === "conditions"; }
  function chapterProgress() { return chapter.progress ? (S.phase === L.PHASE.APPROVED ? chapter.progress.exit : chapter.progress.entry) : L.progressFor(S.approved.length); }
  /* 반려하고 나간 뒤 돌아오기까지 */
  var RETURN_DELAY = 3000;
  var _dir = null, _look = null;
  var _hoverAt = 0;
  var IS_TOUCH = ("ontouchstart" in global) || navigator.maxTouchPoints > 0;

  /* ── 현재 페이지의 진행 상태 ─────────────────────────────────────────
     브라우저 저장소에는 접근하지 않는다. 클리어 코드 연동 전까지는
     챕터를 열 때마다 새로 시작하고, 진행 중의 상태만 S에 유지한다. */
  function checkpoint() {
    var clean = L.normalizeState(JSON.parse(JSON.stringify(S)));
    if (!clean) { toast("진행 상태를 확인하지 못했습니다.", "bad"); return false; }
    return true;
  }

  /* 뒤로/앞으로 가기의 페이지 캐시도 이전 플레이 상태를 복원하지 않는다. */
  addEventListener("pageshow", function (event) {
    if (event.persisted) location.reload();
  });

  /* ── DOM 도우미 ────────────────────────────────────────────────────── */
  function $(s) { return document.querySelector(s); }
  function el(t, c, h) {
    var d = document.createElement(t);
    if (c) d.className = c;
    if (h != null) d.innerHTML = h;
    return d;
  }
  var _toastTimer;
  function toast(msg, kind) {
    var t = $("#toast");
    if (!t) return;
    t.textContent = msg;
    t.className = "show " + (kind || "");
    clearTimeout(_toastTimer);
    _toastTimer = setTimeout(function () { t.className = ""; }, 2800);
  }

  /* 모달/대화가 떠 있으면 3D 입력 전체를 잠근다. */
  function inputBlocked() {
    var m = $("#sheet"), d = $("#dialogue");
    return !!((m && !m.classList.contains("hidden")) ||
              (d && d.classList.contains("blocking")));
  }

  /* ── 스포일러 가드 ─────────────────────────────────────────────────────
     화면에 나가는 모든 텍스트는 이 관문을 지난다. 개발 중 실수로
     잠긴 표현을 쓰면 콘솔에서 바로 드러난다. */
  function safeText(text) {
    var leaks = L.findLeaks(text, S ? S.spoiler : 0);
    if (leaks.length) {
      console.error("[SPOILER] 레벨 " + (S ? S.spoiler : 0) + "에서 금지된 표현:", leaks, text);
      return "[검열됨]";
    }
    return text;
  }

  /* ── 씬 ────────────────────────────────────────────────────────────── */
  function buildScene() {
    var canvas = $("#scene");
    renderer = new THREE.WebGLRenderer({ canvas: canvas, antialias: true });
    renderer.outputEncoding = THREE.sRGBEncoding;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.0;
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    scene = new THREE.Scene();
    scene.background = new THREE.Color(0x0d0f12);
    scene.fog = new THREE.Fog(0x0d0f12, 8, 26);

    camera = new THREE.PerspectiveCamera(62, innerWidth / innerHeight, 0.05, 80);
    camera.position.set(0, EYE, 2.35);
    yaw = Math.PI;      /* 책상(-z)을 마주본다 */
    pitch = -0.16;      /* 책상 상판이 화면에 들어오도록 약간 내린다 */
    ray = new THREE.Raycaster();
    clock = { last: 0 };

    buildRoom();
    buildLights();
    resize();
  }

  /* 1943년 연구시설의 책임자 사무실.
     구조(바닥·벽·천장·걸레받이·판벽)만 절차적이고 물건은 실제 모델을 쓴다.
     7x9m 는 물건 대여섯 개로는 채울 수 없어 휑했다. 집무실 규모로 줄인다. */
  var ROOM = { W: 5.4, D: 6.6, H: 2.9 };

  var doorLeaf = null, doorOpen = false, doorSpec = null;

  function buildRoom() {
    var W = ROOM.W, D = ROOM.D, H = ROOM.H;
    var WAINSCOT = 1.02;   /* 허리 높이 판벽 */

    var floorMat = new THREE.MeshStandardMaterial({ color: 0x6b5537, roughness: 0.88 });
    var upperMat = new THREE.MeshStandardMaterial({ color: 0x9a9384, roughness: 0.96 });
    var lowerMat = new THREE.MeshStandardMaterial({ color: 0x4f5347, roughness: 0.9 });
    var trimMat  = new THREE.MeshStandardMaterial({ color: 0x3a3228, roughness: 0.7 });
    var ceilMat  = new THREE.MeshStandardMaterial({ color: 0xb4ada0, roughness: 1 });

    var floor = new THREE.Mesh(new THREE.PlaneGeometry(W, D), floorMat);
    floor.rotation.x = -Math.PI / 2;
    floor.receiveShadow = true;
    scene.add(floor);

    var ceil = new THREE.Mesh(new THREE.PlaneGeometry(W, D), ceilMat);
    ceil.rotation.x = Math.PI / 2;
    ceil.position.y = H;
    scene.add(ceil);

    /* 벽 한 면 = 위쪽 회벽 + 아래쪽 판벽 + 경계 몰딩 + 걸레받이.
       단색 한 장이면 눈이 붙잡을 데가 없어 더 휑해 보인다.
       hole 을 주면 그 폭만큼 비워 두고 좌우와 상인방만 세운다 — 문 자리다. */
    function wall(w, x, z, ry, hole) {
      var g = new THREE.Group();
      g.position.set(x, 0, z); g.rotation.y = ry;

      /* 바닥부터 천장까지 꽉 찬 한 조각 */
      function slab(sw, cx) {
        if (sw <= 0.001) return;
        var upper = new THREE.Mesh(new THREE.PlaneGeometry(sw, H - WAINSCOT), upperMat);
        upper.position.set(cx, WAINSCOT + (H - WAINSCOT) / 2, 0);
        upper.receiveShadow = true; g.add(upper);

        var lower = new THREE.Mesh(new THREE.PlaneGeometry(sw, WAINSCOT), lowerMat);
        lower.position.set(cx, WAINSCOT / 2, 0);
        lower.receiveShadow = true; g.add(lower);

        var cap = new THREE.Mesh(new THREE.BoxGeometry(sw, 0.05, 0.035), trimMat);
        cap.position.set(cx, WAINSCOT, 0.02);
        cap.castShadow = true; g.add(cap);

        var base = new THREE.Mesh(new THREE.BoxGeometry(sw, 0.11, 0.045), trimMat);
        base.position.set(cx, 0.055, 0.025);
        base.castShadow = true; g.add(base);
      }

      if (!hole) {
        slab(w, 0);
      } else {
        var l = hole.lx - hole.width / 2, r = hole.lx + hole.width / 2;
        slab(l + w / 2, (-w / 2 + l) / 2);
        slab(w / 2 - r, (r + w / 2) / 2);
        /* 문 위쪽 상인방 벽 */
        var head = new THREE.Mesh(
          new THREE.PlaneGeometry(hole.width, H - hole.height), upperMat);
        head.position.set(hole.lx, hole.height + (H - hole.height) / 2, 0);
        head.receiveShadow = true; g.add(head);
      }
      scene.add(g);
      return g;
    }

    /* 문이 뚫린 벽을 먼저 계산한다. door.pos 는 월드 좌표라 벽의 국소 x 로
       옮겨야 한다 — +z 벽은 180도 돌아 있어 좌우가 뒤집힌다. */
    var dz = chapter.door;
    doorSpec = null;
    var holeFar = null, holeNear = null;
    if (dz) {
      var dw = dz.width || 1.0, dh = dz.height || 2.1;
      if (dz.pos[2] > 0) holeNear = { lx: -dz.pos[0], width: dw, height: dh };
      else               holeFar  = { lx:  dz.pos[0], width: dw, height: dh };
      doorSpec = { x: dz.pos[0], z: dz.pos[2], w: dw, h: dh, near: dz.pos[2] > 0 };
    }

    wall(W, 0, -D / 2, 0, holeFar);
    wall(W, 0,  D / 2, Math.PI, holeNear);
    wall(D, -W / 2, 0, Math.PI / 2);
    wall(D,  W / 2, 0, -Math.PI / 2);

    if (doorSpec) buildDoor(trimMat);

    /* 천장 보 — 위쪽이 비어 보이는 걸 막는다 */
    for (var i = -1; i <= 1; i++) {
      var beam = new THREE.Mesh(new THREE.BoxGeometry(W, 0.16, 0.18), trimMat);
      beam.position.set(0, H - 0.08, i * 1.9);
      beam.castShadow = true; beam.receiveShadow = true;
      scene.add(beam);
    }

    /* 통과 금지 구역. 가구는 모델을 올릴 때 solid 로 등록한다. */
    BLOCKS = [];
  }

  /* 문틀 + 여닫이 문짝 + 문 너머 복도.
     복도가 없으면 문을 열었을 때 안개 낀 허공이 보인다. */
  function buildDoor(trimMat) {
    var d = doorSpec, sign = d.near ? 1 : -1;
    var JAMB = 0.075, DEPTH = 0.22;

    var frame = new THREE.Group();
    frame.position.set(d.x, 0, d.z);
    var side = new THREE.BoxGeometry(JAMB, d.h + JAMB, DEPTH);
    var jl = new THREE.Mesh(side, trimMat);
    jl.position.set(-(d.w / 2 + JAMB / 2), (d.h + JAMB) / 2, 0);
    var jr = new THREE.Mesh(side, trimMat);
    jr.position.set(d.w / 2 + JAMB / 2, (d.h + JAMB) / 2, 0);
    var lintel = new THREE.Mesh(
      new THREE.BoxGeometry(d.w + JAMB * 2, JAMB, DEPTH), trimMat);
    lintel.position.set(0, d.h + JAMB / 2, 0);
    [jl, jr, lintel].forEach(function (m) {
      m.castShadow = true; m.receiveShadow = true; frame.add(m);
    });
    scene.add(frame);

    /* 문 너머 — 짧은 복도 상자. 안쪽 면만 보이면 되므로 BackSide. */
    var hall = new THREE.Mesh(
      new THREE.BoxGeometry(d.w + 0.5, d.h + 0.4, 2.2),
      new THREE.MeshStandardMaterial({
        color: 0x2a2b2c, roughness: 1, side: THREE.BackSide
      }));
    hall.position.set(d.x, (d.h + 0.4) / 2 - 0.02, d.z + sign * 1.2);
    scene.add(hall);
    var hallLight = new THREE.PointLight(0x94a6bd, 0.3, 3.0, 2);
    hallLight.position.set(d.x, d.h * 0.8, d.z + sign * 0.85);
    scene.add(hallLight);

    /* 문짝은 경첩 쪽에 피벗을 둔 그룹을 돌린다 */
    doorLeaf = new THREE.Group();
    doorLeaf.position.set(d.x - d.w / 2, 0, d.z);
    var leaf = new THREE.Mesh(
      new THREE.BoxGeometry(d.w - 0.02, d.h - 0.02, 0.045),
      new THREE.MeshStandardMaterial({ color: 0x50412c, roughness: 0.72 }));
    leaf.position.set(d.w / 2, d.h / 2, 0);
    leaf.castShadow = true; leaf.receiveShadow = true;
    doorLeaf.add(leaf);
    var knob = new THREE.Mesh(new THREE.SphereGeometry(0.032, 14, 12),
      new THREE.MeshStandardMaterial({ color: 0xb8933f, roughness: 0.35, metalness: 0.8 }));
    knob.position.set(d.w - 0.11, 1.02, sign * 0.04);
    doorLeaf.add(knob);
    scene.add(doorLeaf);
    doorLeaf.rotation.y = 0;

    /* 나갈 수 있게 되면 켜지는 히트박스 */
    var hit = invisibleHit(d.w, d.h, 0.3, [d.x, d.h / 2, d.z]);
    scene.add(hot(hit, "door", "문"));
  }

  /* 문 여닫기 — 열림 각도를 목표로 두고 루프에서 따라간다 */
  var doorTarget = 0;
  function setDoor(open) {
    doorOpen = !!open;
    doorTarget = open ? (doorSpec && doorSpec.near ? -1.35 : 1.35) : 0;
  }
  function stepDoor(dt) {
    if (!doorLeaf) return;
    var k = L.damp(0.16, dt);
    doorLeaf.rotation.y += (doorTarget - doorLeaf.rotation.y) * k;
  }

  function buildLights() {
    scene.add(new THREE.AmbientLight(0x5a6472, 0.5));
    var hemi = new THREE.HemisphereLight(0x9fb0c4, 0x3a3226, 0.45);
    scene.add(hemi);

    var key = new THREE.DirectionalLight(0xffe7c4, 1.05);
    key.position.set(2.6, 3.0, 1.8);
    key.castShadow = true;
    key.shadow.mapSize.set(1024, 1024);
    key.shadow.camera.near = 0.5;
    key.shadow.camera.far = 18;
    scene.add(key);

    var deskLamp = new THREE.PointLight(0xffd9a0, 1.1, 5.5, 2);
    deskLamp.position.set(-0.6, 1.35, 0.45);
    scene.add(deskLamp);
  }

  /* ── 모델 로드 ───────────────────────────────────────────────────────
     NPC 모델은 수 MB라 소품보다 오래 걸린다. 같은 카운터에 넣지 않으면
     "6/6" 에서 멈춘 것처럼 보인다. 총량에 NPC 를 포함해 센다. */
  var _loadDone = 0, _loadTotal = 0;
  function loadStep() {
    _loadDone++;
    var d = $("#load-detail");
    if (d) d.textContent = "준비 중 · " + _loadDone + " / " + _loadTotal;
  }

  function loadModels(done) {
    var list = chapter.models || [];
    if (!list.length || !THREE.GLTFLoader) { done(); return; }
    var loader = new THREE.GLTFLoader();
    var settled = 0;

    function step() {
      settled++;
      loadStep();
      if (settled === list.length) done();
    }

    /* restOn 은 받침이 먼저 놓여 있어야 계산된다. 병렬로 받되 배치는
       매니페스트 순서대로 한다. */
    var loaded = new Array(list.length), got = 0, placedUpTo = 0;
    function drain() {
      while (placedUpTo < list.length && loaded[placedUpTo] !== undefined) {
        var g = loaded[placedUpTo], it = list[placedUpTo];
        if (g) scene.add(placeModel(g, it));
        placedUpTo++;
      }
    }
    list.forEach(function (item, idx) {
      loader.load(MODEL_BASE + item.path, function (gltf) {
        loaded[idx] = gltf.scene; got++; drain(); step();
      }, undefined, function () {
        console.warn("모델 로드 실패:", item.path);
        loaded[idx] = null; got++; drain(); step();
      });
    });
  }

  /* 내려받은 모델은 저마다 단위와 원점이 다르다. 매니페스트에 실제 치수를
     적어 두면 엔진이 맞춘다 — 그래야 에셋을 바꿔 끼워도 배치가 안 깨진다.

       fitHeight  이 높이(m)가 되도록 균일 배율을 잡는다
       fitWidth   폭 기준으로 맞춘다 (fitHeight 와 함께 쓰면 작은 쪽 채택)
       scale      배수를 직접 줄 때
       align      "floor"(기본) 바닥면을 pos.y 에 맞춘다 | "center" | "none"
       center     true 면 x/z 를 원점에 맞춘 뒤 pos 로 옮긴다
       hide       이름에 이 문자열이 든 메시를 걷어낸다 (한 파일에 변형이
                  여러 개 들어 있는 에셋을 쓸 때)
       solid      플레이어가 통과하지 못하게 한다
       shelfOf/shelf  받침을 실측해 칸을 나누고 그 칸 위에 앉힌다
       restOn     다른 모델 id. 그 물건의 윗면 위에 올린다 — 높이를 손으로
                  적으면 모델을 바꿀 때마다 떠 있거나 잠긴다 */
  /* 선반 판의 윗면 높이를 위에서부터 찾는다. 지정한 (x,z) 로 수직 광선을
     내려 쏘고 위를 향한 면만 골라낸다 — 어떤 선반 에셋을 끼워도 통한다. */
  var _down = null, _rc = null;
  function shelfTops(rack, rb, x, z) {
    if (!_rc) { _rc = new THREE.Raycaster(); _down = new THREE.Vector3(0, -1, 0); }
    _rc.set(new THREE.Vector3(x, rb.max.y + 0.05, z), _down);
    _rc.far = (rb.max.y - rb.min.y) + 0.2;
    var hits = _rc.intersectObject(rack, true), tops = [], n = new THREE.Vector3();
    hits.forEach(function (h) {
      if (!h.face) return;
      n.copy(h.face.normal).transformDirection(h.object.matrixWorld);
      if (n.y < 0.6) return;                       /* 옆면·아랫면은 버린다 */
      var y = h.point.y;
      for (var i = 0; i < tops.length; i++) if (Math.abs(tops[i] - y) < 0.02) return;
      tops.push(y);
    });
    tops.sort(function (a, b) { return b - a; });   /* 위에서부터 */
    return tops;
  }

  function placeModel(obj, item) {
    /* 내려받은 gltf 한 파일에 변형이 여러 개 나란히 들어 있는 경우가 있다
       (예: 쓰레기통 gltf 는 멀쩡한 것과 녹슨 것을 나란히 담고 있어 폭이
       두 배가 된다). 재기 전에 쓰지 않을 메시를 걷어낸다. */
    if (item.hide && item.hide.length) {
      var drop = [];
      obj.traverse(function (n) {
        if (!n.isMesh) return;
        for (var i = 0; i < item.hide.length; i++)
          if (n.name.indexOf(item.hide[i]) >= 0) { drop.push(n); return; }
      });
      drop.forEach(function (n) { if (n.parent) n.parent.remove(n); });
    }

    obj.updateMatrixWorld(true);
    var box = new THREE.Box3().setFromObject(obj);
    var size = box.getSize(new THREE.Vector3());

    var s = item.scale === undefined ? 1 : item.scale;
    /* 리깅된 캐릭터는 바인드 포즈 기준 바운딩박스가 실제 실루엣과 다르다
       (팔을 벌린 자세라 폭이 키보다 크게 잡힌다). fitHeight 를 쓰면 몇 배로
       부푼다. 종횡비로 넘겨짚으면 책상 같은 가구를 오판하므로
       SkinnedMesh 가 있는지로 정확히 가른다. */
    var rigged = false;
    obj.traverse(function (n) { if (n.isSkinnedMesh) rigged = true; });
    if (item.fitHeight && size.y > 1e-6 && !rigged) s = item.fitHeight / size.y;
    else if (item.fitHeight && rigged)
      console.warn("[MODEL] " + item.id + ": 리깅 모델은 fitHeight 대신 scale 을 쓴다.");
    if (item.fitWidth && size.x > 1e-6) {
      var sw = item.fitWidth / size.x;
      s = item.fitHeight ? Math.min(s, sw) : sw;
    }
    obj.scale.set(s, s, s);
    if (item.rot) obj.rotation.set(item.rot[0], item.rot[1], item.rot[2]);

    /* 배율·회전을 적용한 뒤 다시 재서 정확한 위치를 잡는다 */
    obj.updateMatrixWorld(true);
    box = new THREE.Box3().setFromObject(obj);
    var c = box.getCenter(new THREE.Vector3());
    var p = item.pos || [0, 0, 0];
    var align = item.align || "floor";

    obj.position.x += p[0] - (item.center === false ? obj.position.x : c.x);
    obj.position.z += p[2] - (item.center === false ? obj.position.z : c.z);

    /* 무엇 위에 올릴지 지정했으면 그 윗면을 바닥으로 삼는다.
       바운딩박스의 꼭대기를 쓰면 안 된다 — 뚜껑이 열린 공구함은 열린
       뚜껑 끝이 꼭대기라, 그 위에 얹으면 구급함이 허공에 뜬다.
       놓을 자리로 광선을 내려 쏘아 진짜 얹히는 면을 찾는다. */
    var baseY = p[1];
    if (item.restOn) {
      var host = models[item.restOn];
      if (host) {
        var hb = new THREE.Box3().setFromObject(host);
        var tops = shelfTops(host, hb, p[0], p[2]);
        baseY = tops.length ? tops[0] : hb.max.y;
        if (!tops.length)
          console.warn("[MODEL] " + item.id + ": 얹을 면을 찾지 못해 바운딩박스 꼭대기에 올린다");
      } else {
        console.warn("[MODEL] " + item.id + ": restOn 대상 '" + item.restOn + "' 이 아직 없다");
      }
    } else if (item.shelfOf) {
      /* 선반 칸 — 받침을 실측한다. 칸 높이를 숫자로 적으면 선반 모델을
         바꾸는 순간 책이 공중에 뜨거나 판을 뚫는다. pos 는 받침 중심에서의
         상대 좌표로 읽는다. */
      var rack = models[item.shelfOf];
      if (rack) {
        var rb = new THREE.Box3().setFromObject(rack);
        var rc = rb.getCenter(new THREE.Vector3());
        obj.position.x += rc.x;
        obj.position.z += rc.z;
        var tops = shelfTops(rack, rb, rc.x + p[0], rc.z + (p[2] || 0));
        var idx = Math.max(0, item.shelf || 0);
        if (tops.length) baseY = tops[Math.min(idx, tops.length - 1)];
        else {
          /* 판을 못 찾았으면 균등 분할로 물러선다 */
          var bays = item.bays || 4;
          baseY = rb.min.y + (rb.max.y - rb.min.y) * 0.94 / bays *
                  (bays - 1 - Math.min(idx, bays - 1)) + 0.02;
          console.warn("[MODEL] " + item.id + ": 선반 판을 찾지 못해 균등 분할로 앉힌다");
        }
      } else {
        console.warn("[MODEL] " + item.id + ": shelfOf 대상 '" + item.shelfOf + "' 이 아직 없다");
      }
    }
    if (align === "floor")       obj.position.y += baseY - box.min.y;
    else if (align === "center") obj.position.y += baseY - c.y;
    else                         obj.position.y = baseY;

    obj.traverse(function (n) {
      if (n.isMesh) { n.castShadow = true; n.receiveShadow = true; }
    });
    models[item.id] = obj;

    /* 통과 금지 — 실제로 앉은 크기로 막는다 */
    if (item.solid) {
      obj.updateMatrixWorld(true);
      var sb = new THREE.Box3().setFromObject(obj);
      var sc = sb.getCenter(new THREE.Vector3());
      BLOCKS.push({ x: sc.x, z: sc.z,
                    hx: (sb.max.x - sb.min.x) / 2, hz: (sb.max.z - sb.min.z) / 2 });
    }

    if (item.debug) {
      console.log("[MODEL] " + item.id, "원본 " + size.y.toFixed(2) + "m",
                  "→ 배율 " + s.toFixed(3));
    }
    return obj;
  }

  /* ── NPC ──────────────────────────────────────────────────────────────
     챕터가 npcModel 로 모델과 클립 이름을, npcPath 로 문 안쪽과 설 자리를
     준다. 인물은 처음부터 책상 앞에 서 있지 않다 — 문을 열고 걸어 들어온다.
     스펙(02_DIALOGUE_NPC)의 제스처 계층은 이후에 얹는다. */
  var npcHit = null, npcWalk = null, npcFaceOff = 0;

  function pathPoint(name, fallback) {
    var pp = chapter.npcPath || {};
    return pp[name] || fallback || [0, 0, 0];
  }

  function loadNPC(done) {
    var spec = chapter.npcModel;
    if (!spec || !THREE.GLTFLoader) { done(); return; }
    npcFaceOff = spec.faceOffset || 0;
    var d = $("#load-detail");
    if (d) d.textContent = "인물을 부르는 중… (" + (_loadDone + 1) + "/" + _loadTotal + ")";
    var start = pathPoint("doorway", (chapter.anchors || {}).npcStand);
    new THREE.GLTFLoader().load(MODEL_BASE + spec.path, function (gltf) {
      npc = placeModel(gltf.scene, {
        id: "npc", pos: start, rot: spec.rot,
        fitHeight: spec.fitHeight, scale: spec.scale,
        align: spec.align || "floor", center: spec.center
      });
      scene.add(npc);

      if (gltf.animations && gltf.animations.length) {
        npcMixer = new THREE.AnimationMixer(npc);
        Object.keys(spec.clips || {}).forEach(function (role) {
          var clip = THREE.AnimationClip.findByName(gltf.animations, spec.clips[role]);
          if (!clip) { console.warn("[NPC] 클립을 찾지 못함:", spec.clips[role]); return; }
          npcClips[role] = npcMixer.clipAction(clip);
          npcFull = Math.max(npcFull, clip.tracks ? clip.tracks.length : 0);
        });
        playNPC("idle");
      }
      /* 히트박스는 인물을 따라다닌다. 걸어 다니므로 고정할 수 없다.
         크기를 바운딩박스에서 가져오면 안 된다 — 리깅 모델의 바인드 포즈
         박스는 실루엣과 무관하다(이 배우는 높이가 0.41m 로 잡힌다).
         그대로 쓰면 발치에만 판정이 생겨 사람을 눌러도 반응이 없다.
         서 있는 사람 크기로 잡고, 필요하면 챕터가 바꾼다. */
      var rigged = false;
      npc.traverse(function (n) { if (n.isSkinnedMesh) rigged = true; });
      var box = new THREE.Box3().setFromObject(npc);
      var h = spec.hitHeight || (rigged ? 1.78 : box.max.y - box.min.y);
      var w = spec.hitWidth || 0.8;
      npcHit = invisibleHit(w, h, w, [npc.position.x, h / 2, npc.position.z]);
      npcHit.userData.h = h;
      scene.add(hot(npcHit, "npc", chapter.npc));
      loadStep();
      done();
    }, undefined, function () {
      console.warn("NPC 모델 로드 실패:", spec.path);
      loadStep();
      done();
    });
  }

  /* 클립마다 담고 있는 뼈 수가 다르다. 이 배우의 말하기 클립은 트랙이
     11개뿐이라(머리·팔만) 그것만 틀면 나머지 뼈가 바인드 포즈로 남아
     사람이 T 자로 굳는다. 몸 전체를 잡는 클립을 바닥에 깔고, 성긴 클립은
     그 위에 겹쳐 재생한다. */
  var npcBase = null, npcOverlay = null, npcFull = 0;

  function trackCount(action) {
    var c = action.getClip();
    return c && c.tracks ? c.tracks.length : 0;
  }

  function setNPCBase(a) {
    if (!a || a === npcBase) return;
    a.reset().fadeIn(0.25).play();
    if (npcBase) npcBase.fadeOut(0.25);
    npcBase = a;
    npcAction = a;
  }

  function playNPC(role) {
    var next = npcClips[role] || npcClips.idle;
    if (!next) return;
    if (npcFull && trackCount(next) < npcFull * 0.5) {
      if (npcOverlay === next) return;
      if (npcOverlay) npcOverlay.fadeOut(0.2);
      npcOverlay = next;
      next.reset().fadeIn(0.2).play();
      if (!npcBase) setNPCBase(npcClips.idle);
      return;
    }
    if (npcOverlay) { npcOverlay.fadeOut(0.2); npcOverlay = null; }
    setNPCBase(next);
  }

  function faceNPC(x, z) {
    if (!npc) return;
    var dx = x - npc.position.x, dz = z - npc.position.z;
    if (Math.abs(dx) + Math.abs(dz) < 1e-4) return;
    npc.rotation.y = Math.atan2(dx, dz) + npcFaceOff;
  }

  /* 목표 지점까지 걸어간다. 도착하면 onDone.
     진행은 프레임 dt 가 아니라 실제 경과 시간으로 잰다 — 루프의 dt 는
     탭 전환 대비로 0.14초에서 잘리므로, 프레임이 느린 기기에서는 걸음이
     몇 배로 늘어져 "왜 안 오지" 가 된다. */
  var WALK_SPEED = 1.3;
  function walkNPC(to, onDone) {
    if (!npc) { if (onDone) onDone(); return; }
    var from = npc.position.clone();
    var target = new THREE.Vector3(to[0], npc.position.y, to[2]);
    var dist = from.distanceTo(target);
    if (dist < 0.03) { faceNPC(to[0], to[2]); if (onDone) onDone(); return; }
    faceNPC(to[0], to[2]);
    npcWalk = { from: from, to: target, at: performance.now(),
                dur: Math.max(400, dist / WALK_SPEED * 1000), done: onDone };
    playNPC("walk");
  }

  function stepNPC() {
    if (npc && npcHit) {
      npcHit.position.set(npc.position.x, npcHit.userData.h / 2, npc.position.z);
    }
    if (!npcWalk) return;
    var k = Math.min(1, (performance.now() - npcWalk.at) / npcWalk.dur);
    npc.position.lerpVectors(npcWalk.from, npcWalk.to, k);
    if (k < 1) return;
    var cb = npcWalk.done;
    npcWalk = null;
    playNPC("idle");
    if (cb) cb();
  }

  function showNPC(on) {
    if (npc) npc.visible = !!on;
    if (npcHit) npcHit.visible = !!on;
    if (!on && hoveredHotspot === npcHit) clearHover();
  }

  /* 노크 — 말이 아니라 소리다. 한 줄씩 늘어나며 문 쪽으로 눈이 가게 한다. */
  function knock(onDone) {
    var beats = (chapter.lines && chapter.lines.knock) || [];
    if (!beats.length) { if (onDone) onDone(); return; }
    var box = $("#dialogue"), i = 0;
    box.classList.add("blocking");
    box.classList.remove("hidden");
    box.onclick = null; box.onkeydown = null;
    box.removeAttribute("role"); box.removeAttribute("tabindex");
    box.removeAttribute("aria-label");
    pauseWorldInput();
    (function step() {
      if (i >= beats.length) {
        setTimeout(function () {
          box.classList.add("hidden");
          box.classList.remove("blocking");
          if (onDone) onDone();
        }, 620);
        return;
      }
      box.innerHTML = "";
      box.appendChild(el("p", "knock", safeText(beats[i])));
      i++;
      setTimeout(step, 520);
    })();
  }

  /* 문을 열고 들어와 책상 앞까지. 들어온 뒤 문은 닫는다. */
  function npcEnter(onDone) {
    var doorway = pathPoint("doorway"), stand = pathPoint("stand");
    setDoor(true);
    if (npc) npc.position.set(doorway[0], npc.position.y, doorway[2]);
    showNPC(true);
    setTimeout(function () {
      walkNPC(stand, function () {
        setDoor(false);
        faceNPC(camera.position.x, camera.position.z);
        if (onDone) onDone();
      });
    }, 620);
  }

  /* 문으로 걸어 나간다. keepOpen 이면 문을 열어 둔 채로 둔다. */
  function npcExit(keepOpen, onDone) {
    var doorway = pathPoint("doorway");
    setDoor(true);
    setTimeout(function () {
      walkNPC(doorway, function () {
        showNPC(false);
        if (!keepOpen) setDoor(false);
        if (onDone) onDone();
      });
    }, 480);
  }

  /* ── 책상 위 소품 ─────────────────────────────────────────────────────
     조사 대상이 눈에 보여야 한다. 지금까지 문서와 도장은 투명 히트박스라
     "제출된 자료를 확인하십시오" 라고 해놓고 볼 것이 없었다.
     실제 모델을 구하기 전까지 쓰는 절차적 소품이다. */
  function paperTex(lines) {
    var c = document.createElement("canvas");
    c.width = 256; c.height = 340;
    var g = c.getContext("2d");
    g.fillStyle = "#efe7d2"; g.fillRect(0, 0, 256, 340);
    g.fillStyle = "#cfc4a8"; g.fillRect(0, 0, 256, 6);
    g.strokeStyle = "rgba(60,50,34,.28)";
    g.lineWidth = 2;
    for (var i = 0; i < (lines || 14); i++) {
      var y = 44 + i * 19;
      g.beginPath(); g.moveTo(22, y); g.lineTo(210 - (i % 3) * 26, y); g.stroke();
    }
    g.strokeStyle = "rgba(60,50,34,.5)";
    g.strokeRect(2, 2, 252, 336);
    var t = new THREE.CanvasTexture(c);
    t.encoding = THREE.sRGBEncoding;
    return t;
  }

  /* 종이 여러 장을 살짝 어긋나게 쌓는다 */
  function paperStack(count, w, h) {
    var g = new THREE.Group();
    var mat = new THREE.MeshStandardMaterial({
      map: paperTex(14), roughness: 0.92, metalness: 0, side: THREE.DoubleSide
    });
    for (var i = 0; i < count; i++) {
      var sheet = new THREE.Mesh(new THREE.BoxGeometry(w, 0.0016, h), mat);
      sheet.position.set((Math.random() - 0.5) * 0.012, i * 0.0018,
                         (Math.random() - 0.5) * 0.012);
      sheet.rotation.y = (Math.random() - 0.5) * 0.07;
      sheet.castShadow = true; sheet.receiveShadow = true;
      g.add(sheet);
    }
    return g;
  }

  /* 손잡이 달린 나무 도장 + 잉크 패드 */
  function stampProp() {
    var g = new THREE.Group();
    var wood = new THREE.MeshStandardMaterial({ color: 0x5a3a22, roughness: 0.55 });
    var base = new THREE.Mesh(new THREE.CylinderGeometry(0.032, 0.036, 0.022, 20), wood);
    base.position.y = 0.011; g.add(base);
    var neck = new THREE.Mesh(new THREE.CylinderGeometry(0.010, 0.013, 0.036, 14), wood);
    neck.position.y = 0.040; g.add(neck);
    var knob = new THREE.Mesh(new THREE.SphereGeometry(0.021, 18, 14), wood);
    knob.position.y = 0.068; g.add(knob);

    var pad = new THREE.Group();
    var tin = new THREE.Mesh(new THREE.BoxGeometry(0.10, 0.016, 0.075),
      new THREE.MeshStandardMaterial({ color: 0x2b2f33, roughness: 0.42, metalness: 0.6 }));
    tin.position.y = 0.008; pad.add(tin);
    var ink = new THREE.Mesh(new THREE.BoxGeometry(0.086, 0.006, 0.062),
      new THREE.MeshStandardMaterial({ color: 0x7d1f18, roughness: 0.85 }));
    ink.position.y = 0.017; pad.add(ink);
    pad.position.set(0.085, 0, 0.02);
    g.add(pad);

    g.traverse(function (n) { if (n.isMesh) { n.castShadow = true; n.receiveShadow = true; } });
    return g;
  }

  /* 낱장 한 장 — 바닥이나 책상에 눕혀 둔다 */
  function sheetProp(w, h, lines) {
    var m = new THREE.Mesh(new THREE.BoxGeometry(w, 0.0022, h),
      new THREE.MeshStandardMaterial({
        map: paperTex(lines || 13), roughness: 0.93, metalness: 0
      }));
    m.castShadow = true; m.receiveShadow = true;
    return m;
  }

  /* 책상 상판 높이를 실측한다. 앵커에 적힌 y 는 모델을 바꾸면 바로 틀어진다. */
  function deskTopY(fallback) {
    var d = models.desk;
    if (!d) return fallback;
    return new THREE.Box3().setFromObject(d).max.y;
  }

  /* 앵커에 소품을 놓고 히트박스를 씌운다. 모델이 다 앉은 뒤에 부른다. */
  function buildDeskProps() {
    var a = chapter.anchors || {};

    if (a.reportSlot) {
      var top = deskTopY(a.reportSlot[1]);
      var g = new THREE.Group();
      /* 회차마다 한 장씩, 살짝 부채꼴로 어긋나게 겹친다 */
      var n = (chapter.reports || []).length || 3;
      for (var i = 0; i < n; i++) {
        var sh = sheetProp(0.215, 0.297, 13);
        sh.position.set(i * 0.026 - 0.026, i * 0.0026, i * 0.014 - 0.014);
        sh.rotation.y = (i - 1) * 0.085;
        g.add(sh);
      }
      g.position.set(a.reportSlot[0], top + 0.002, a.reportSlot[2]);
      g.rotation.y = -0.12;
      scene.add(g);
      deskProps.reports = g;

      scene.add(hot(invisibleHit(0.34, 0.20, 0.40,
        [a.reportSlot[0], top + 0.09, a.reportSlot[2]]), "docs", "제출 자료"));
    }

    if (a.stampPad) {
      var ty = deskTopY(a.stampPad[1]);
      var st = stampProp();
      st.position.set(a.stampPad[0], ty + 0.002, a.stampPad[2]);
      st.rotation.y = 0.22;
      scene.add(st);
      deskProps.stamp = st;

      scene.add(hot(invisibleHit(0.28, 0.20, 0.22,
        [a.stampPad[0] + 0.04, ty + 0.08, a.stampPad[2]]), "stamp", "도장"));
    }

    /* 책상에서 밀려난 낱장들 — 방이 쓰이고 있다는 흔적 */
    (chapter.floorReports || []).forEach(function (f, i) {
      var sh = sheetProp(0.215, 0.297, 11);
      sh.position.set(f.pos[0], (f.pos[1] || 0) + 0.0016 + i * 0.0006, f.pos[2]);
      sh.rotation.y = f.rot || 0;
      scene.add(sh);
    });
  }

  /* ── 상호작용 지점 ─────────────────────────────────────────────────── */
  function hot(mesh, id, name) {
    mesh.userData.hot = { id: id, name: name };
    hotspots.push(mesh);
    return mesh;
  }
  function invisibleHit(w, h, d, pos) {
    var m = new THREE.Mesh(
      new THREE.BoxGeometry(w, h, d),
      new THREE.MeshBasicMaterial({ transparent: true, opacity: 0, depthWrite: false })
    );
    m.position.set(pos[0], pos[1], pos[2]);
    return m;
  }

  /* ── 편지 세 장 ───────────────────────────────────────────────────────
     화면에는 종이 세 장뿐이다. 탭도, 안내문도, 셈 줄도 없다.

     보고서는 줄글이고 그 안의 문장만 누를 수 있다. 장마다 하나씩 세 문장을
     고르면 "이 셋은 같은 것을 말하는데 하나가 어긋난다" 는 주장이 된다.
     누르는 것만으로는 옳은지 알 수 없다 — 짝만 맞추면 저절로 풀리는
     문제라면 판단할 이유가 없어지기 때문이다. 판정은 RICHARD 가 한다. */

  function reportsNow() { return L.reportsFor(chapter, S.phase); }
  function isVerifyPhase() {
    return S.phase === L.PHASE.REVISED || S.phase === L.PHASE.VERIFIED;
  }
  function isClaimPhase() {
    return S.phase === L.PHASE.SUBMITTED || S.phase === L.PHASE.INSPECTING;
  }
  function canPick() { return isClaimPhase(); }

  function openDocs() { renderReader(); }

  var documentReader = null, sheetReturnFocus = null;
  function pauseWorldInput() {
    keys = {}; joy.x = joy.z = 0;
    var knob = $("#joyk");
    if (knob) knob.style.transform = "";
  }
  function setSheetOpen(reading) {
    var sheet = $("#sheet"), wasHidden = sheet.classList.contains("hidden");
    if (wasHidden) sheetReturnFocus = document.activeElement;
    pauseWorldInput();
    document.body.classList.add("sheet-open");
    document.body.classList.toggle("reader-open", reading);
    ["#scene", "#hud", "#joy", "#act", "#dialogue"].forEach(function (selector) {
      var item = $(selector);
      if (item) item.inert = true;
    });
    sheet.classList.remove("hidden");
    return wasHidden;
  }
  function renderReader() {
    if (isConditions()) { renderConditions(); return; }
    var reps = reportsNow();
    if (S.phase === L.PHASE.REVISED) {
      S.verified = L.requiredClaims(chapter).slice();
      advancePhase(); checkpoint(); renderHUD();
    }
    var sheet = $("#sheet");
    sheet.classList.add("bare");
    sheet.setAttribute("aria-labelledby", "reader-title");
    if (!documentReader) {
      clearScrollEdges();
      $("#sheet-body").replaceChildren();
      documentReader = global.N2Reader.create({
        host: $("#sheet-body"), title: chapter.title,
        subtitle: chapter.npc + " / CHAPTER " + String(chapter.number).padStart(2, "0"),
        safeText: safeText, onSelect: toggleStatement, onClose: closeSheet
      });
    }
    var opening = setSheetOpen(true);
    documentReader.render(reps, {
      canPick: canPick(), selection: S.sel || [], mark: stateOf
    });
    if (opening) documentReader.focus();
  }

  function renderConditions() {
    if (S.phase === L.PHASE.REJECTED) { toast("재시험 지시서를 준비하고 있습니다."); return; }
    var sheet = $("#sheet"); sheet.classList.add("bare");
    sheet.setAttribute("aria-labelledby", "reader-title");
    if (!documentReader) {
      clearScrollEdges(); $("#sheet-body").replaceChildren();
      documentReader = global.N2Conditions.create({
        host: $("#sheet-body"), chapter: chapter, safeText: safeText, onClose: closeSheet,
        onChange: function () {
          if (isClaimPhase()) setPhase(L.PHASE.INSPECTING);
          if (S.phase === L.PHASE.REVISED && global.N2Conditions.complete(chapter, S.conditions)) {
            setPhase(L.PHASE.VERIFIED); toast("모든 기록의 검토가 끝났습니다. 승인 도장을 찍으십시오.", "good");
          }
          checkpoint(); renderHUD();
        },
        onSubmit: function () { closeSheet(); talkToNPC(); },
        onStamp: openStamp
      });
    }
    var opening = setSheetOpen(true); documentReader.render(S);
    if (opening) documentReader.focus();
  }

  /* 이 문장이 이미 결론난 세트에 속하는가.
     null 이면 아직 손댈 수 있는 문장이다 — 수정본에서 반려한 자리를 다시
     짚어야 하므로, 원본에서 주장했다는 이유로 굳어 있으면 안 된다. */
  function stateOf(st) {
    if ((S.verified || []).indexOf(st.set) >= 0) return "ok";
    var claimed = (S.claims || []).indexOf(st.set) >= 0;
    if (!claimed) return null;
    if (isClaimPhase()) return "claimed";
    /* 어긋남을 전부 짚어 낸 순간, 어느 장이 어긋났는지 드러난다 */
    if (S.phase === L.PHASE.CONTRADICTION) {
      var set = L.setById(chapter, st.set);
      if (set && !set.agree) return set.odd === stReport(st.id) ? "bad" : "ok";
    }
    return null;
  }
  function stReport(id) {
    var hit = L.stById(reportsNow(), id);
    return hit ? hit.report.id : null;
  }

  /* 문장을 골랐다 뺐다 한다. 한 장에서는 하나만 — 다음 것을 고르면 앞의
     것이 빠진다. 세 장이 다 차면 그때 판정한다. */
  function toggleStatement(id) {
    var reps = reportsNow();
    var sel = (S.sel || []).slice();
    var at = sel.indexOf(id);
    if (at >= 0) { sel.splice(at, 1); S.sel = sel; checkpoint(); renderReader(); return; }

    var mine = L.stById(reps, id);
    if (!mine) return;
    sel = sel.filter(function (other) {
      var o = L.stById(reps, other);
      return !o || o.report.id !== mine.report.id;
    });
    sel.push(id);
    S.sel = sel;

    if (sel.length < reps.length) { checkpoint(); renderReader(); return; }

    var res = L.judgeSelection(chapter, reps, sel);
    if (!res.ok) {
      S.sel = [];
      checkpoint(); renderReader();
      toast("이 셋은 같은 자리가 아닙니다.");
      return;
    }
    S.sel = [];
    var add = L.applyClaim(chapter, S.claims, res.set.id);
    if (!add.isNew) { checkpoint(); renderReader(); toast("이미 고른 자리입니다."); return; }
    S.claims = add.claims;
    checkpoint();
    renderReader();
    renderHUD();
    /* 옳은지는 말하지 않는다. 표시만 남는다. */
    toast("골라 뒀습니다.");
  }

  function refreshSheet() {
    if ($("#sheet").classList.contains("hidden")) return;
    renderReader();
  }

  /* 국면 변경은 반드시 여기를 지난다. HUD 갱신을 빠뜨리지 않기 위해서다. */
  function setPhase(next) {
    if (next === S.phase) return;
    S.phase = next;
    if (conditionRoom) conditionRoom.phase(next);
    renderHUD();
  }

  function advancePhase() {
    /* 현재 국면에 해당하는 완료 목록을 공용 상태기계에 넘긴다. */
    var done = isVerifyPhase() ? (S.verified || []) : (S.claims || []);
    setPhase(L.nextPhase(S.phase, L.requiredClaims(chapter), done));
  }

  /* ── 도장 ──────────────────────────────────────────────────────────── */
  function openStamp() {
    var kind = L.activeStamp(S.phase);
    if (!kind) {
      /* 스펙: 도장은 도덕 선택지가 아니다. 검증 전에는 열리지 않는다. */
      toast(S.phase === L.PHASE.REVISED
        ? "다시 해 온 걸 먼저 봐야 합니다."
        : "아직 판단할 게 남았습니다.", "bad");
      return;
    }
    openSheet("도장", kind === "REJECTED" ? "반려" : "승인", function (body) {
      body.appendChild(el("p", "hint", kind === "REJECTED"
        ? "이대로는 넘길 수 없습니다."
        : "이대로 넘겨도 됩니다."));
      var b = el("button", "stamp-btn " + kind.toLowerCase(), kind);
      b.type = "button";
      b.onclick = function () { applyStamp(kind); };
      body.appendChild(b);
    });
  }

  function applyStamp(kind) {
    if (!L.canStamp(S.phase, kind)) { toast("지금은 찍을 수 없습니다.", "bad"); return; }
    closeSheet();

    if (isConditions() && kind === "REJECTED") {
      setPhase(L.PHASE.REJECTED); checkpoint();
      say(chapter.lines.rejected, function () {
        S.conditions.jobs = {}; S.conditions.preserved = {};
        setPhase(L.PHASE.REVISED); checkpoint();
        toast("작업대에서 재시험 조건을 지시하십시오.");
      });
      return;
    }
    if (kind === "REJECTED") {
      setPhase(L.PHASE.REJECTED);
      checkpoint();
      /* 반려 → 걸어 나간다 → 3초 → 다시 걸어 들어온다 → 수정본 */
      say(chapter.lines.rejected, function () {
        npcExit(false, function () {
          setTimeout(function () {
            S.verified = [];
            S.sel = [];
            setPhase(L.PHASE.REVISED);
            checkpoint();
            knock(function () {
              npcEnter(function () { say(chapter.lines.revised); });
            });
          }, RETURN_DELAY);
        });
      });
      return;
    }

    /* APPROVED — 사과하고 나간다. 문은 열어 둔다: 플레이어가 나갈 차례다. */
    setPhase(L.PHASE.APPROVED);
    if (S.approved.indexOf(chapter.number) < 0) S.approved.push(chapter.number);
    checkpoint();
    say(chapter.lines.approved, function () {
      renderHUD();
      toast("진행도 " + chapterProgress() + "%", "good");
      npcExit(true, function () {
        toast("문이 열려 있습니다. 나가십시오.", "good");
        renderHUD();
      });
    });
  }

  /* 챕터를 마치고 문으로 나간다 */
  function leaveRoom() {
    if (S.phase !== L.PHASE.APPROVED) {
      toast("아직 나갈 때가 아닙니다.", "bad");
      return;
    }
    openSheet("CHAPTER " + String(chapter.number).padStart(2, "0") + " 종료",
      "진행도 " + chapterProgress() + "%", function (body) {
      var b = el("button", "stamp-btn approved", "복도로 나간다");
      b.type = "button";
      b.onclick = function () { location.href = "index.html"; };
      body.appendChild(b);
    });
  }

  /* ── 대사 ──────────────────────────────────────────────────────────── */
  function say(lines, done) {
    var box = $("#dialogue");
    var i = 0;
    box.classList.add("blocking");
    box.classList.remove("hidden");
    playNPC("talk");

    function step() {
      if (i >= lines.length) {
        box.classList.add("hidden");
        box.classList.remove("blocking");
        playNPC("idle");
        $("#scene").focus({ preventScroll: true });
        if (done) done();
        return;
      }
      box.innerHTML = "";
      var line = lines[i], speaker = typeof line === "object" ? line.who : chapter.npc;
      box.appendChild(el("div", "who", safeText(speaker)));
      box.appendChild(el("p", "line", safeText(typeof line === "object" ? line.text : line)));
      box.appendChild(el("div", "more", "계속 ▸"));
      i++;
    }
    pauseWorldInput();
    box.setAttribute("role", "button");
    box.setAttribute("aria-label", chapter.npc + " 대화, 다음 대사");
    box.tabIndex = 0;
    box.onclick = step;
    box.onkeydown = function (event) {
      if (event.key === "Enter" || event.key === " ") { event.preventDefault(); step(); }
    };
    step();
    box.focus({ preventScroll: true });
  }

  /* ── 스크롤 표시 ─────────────────────────────────────────────────────
     .scrolls 영역이 실제로 넘치는지 재서 가장자리 오버레이를 덮는다.
     CSS 만으로는 안 된다 — 자식이 불투명 배경을 가지면 그라디언트가
     가려지고, 오버레이 스크롤바는 만지기 전까지 보이지 않는다. */
  var _edges = {}, _edgeSeq = 0;
  function edgeEl(key, side) {
    var k = key + ":" + side;
    if (!_edges[k]) {
      var d = el("div", "scroll-edge " + side);
      document.body.appendChild(d);
      _edges[k] = d;
    }
    return _edges[k];
  }
  function placeEdge(host, side, on, r, thick) {
    var d = edgeEl(host._edgeKey, side);
    if (side === "top" || side === "bottom") {
      d.style.left = r.left + "px"; d.style.width = r.width + "px";
      d.style.height = thick + "px";
      d.style.top = (side === "top" ? r.top : r.bottom - thick) + "px";
    } else {
      d.style.top = r.top + "px"; d.style.height = r.height + "px";
      d.style.width = thick + "px";
      d.style.left = (side === "left" ? r.left : r.right - thick) + "px";
    }
    d.classList.toggle("on", !!on);
  }
  function markScrollables() {
    [].slice.call(document.querySelectorAll(".scrolls")).forEach(function (host) {
      if (!host._edgeKey) host._edgeKey = "s" + (++_edgeSeq);
      if (!host._scrollBound) {
        host._scrollBound = true;
        host.addEventListener("scroll", function () { markScrollables(); }, { passive: true });
      }
      var visible = host.offsetParent !== null;
      var oy = host.scrollHeight - host.clientHeight;
      var ox = host.scrollWidth - host.clientWidth;
      var canY = visible && oy > 2, canX = visible && ox > 2;
      host.classList.toggle("can-y", canY);
      host.classList.toggle("can-x", canX);
      var r = host.getBoundingClientRect();
      placeEdge(host, "top",    canY && host.scrollTop > 1,       r, 34);
      placeEdge(host, "bottom", canY && host.scrollTop < oy - 1,  r, 34);
      placeEdge(host, "left",   canX && host.scrollLeft > 1,      r, 30);
      placeEdge(host, "right",  canX && host.scrollLeft < ox - 1, r, 30);
    });
  }
  function refreshScrollHints() {
    markScrollables();
    setTimeout(markScrollables, 60);
    setTimeout(markScrollables, 340);
  }
  function hideAllEdges() {
    Object.keys(_edges).forEach(function (k) { _edges[k].classList.remove("on"); });
  }

  /* ── 시트(모달) ────────────────────────────────────────────────────── */
  function clearScrollEdges() {
    Object.keys(_edges).forEach(function (key) { _edges[key].remove(); });
    _edges = {};
  }
  function openSheet(title, sub, build) {
    if (documentReader) { documentReader.destroy(); documentReader = null; }
    clearScrollEdges();
    var sheet = $("#sheet");
    sheet.classList.remove("bare");
    sheet.setAttribute("aria-labelledby", "sheet-title");
    $("#sheet-title").textContent = title;
    $("#sheet-sub").textContent = sub || "";
    var b = $("#sheet-body");
    b.replaceChildren(); build(b);
    setSheetOpen(false);
    refreshScrollHints();
    var first = b.querySelector("button") || $("#sheet-close");
    if (first) first.focus({ preventScroll: true });
  }
  function closeSheet() {
    var sheet = $("#sheet");
    if (sheet.classList.contains("hidden")) return;
    sheet.classList.add("hidden");
    document.body.classList.remove("sheet-open", "reader-open");
    ["#scene", "#hud", "#joy", "#act", "#dialogue"].forEach(function (selector) {
      var item = $(selector);
      if (item) item.inert = false;
    });
    pauseWorldInput(); hideAllEdges();
    if (sheetReturnFocus && sheetReturnFocus.isConnected && sheetReturnFocus.offsetParent !== null) {
      sheetReturnFocus.focus({ preventScroll: true });
    } else {
      $("#scene").focus({ preventScroll: true });
    }
  }

  /* ── HUD ───────────────────────────────────────────────────────────── */
  function renderHUD() {
    $("#hud-ch").textContent = "CHAPTER " + String(chapter.number).padStart(2, "0");
    $("#hud-title").textContent = chapter.title;
    $("#hud-npc").textContent = chapter.npc;
    var pct = chapterProgress();
    $("#bar-fill").style.width = pct + "%";
    $("#bar-pct").textContent = pct + "%";

    /* 몇 군데인지는 알려주지 않는다 — 개수를 적어 두면 그것부터 세게 된다.
       한 일만 짧게 적고, 남은 것은 RICHARD 에게 물어야 안다. */
    var g, n;
    if (openingPending()) {
      g = "책상을 살펴본다";
    } else if (openingRunning) {
      g = "";
    } else if (S.phase === L.PHASE.SUBMITTED || S.phase === L.PHASE.INSPECTING) {
      n = (S.claims || []).length;
      g = n ? "골라 둔 자리 <b>" + n + "</b>" : "";
    } else if (S.phase === L.PHASE.CONTRADICTION) {
      g = "<b>도장</b>";
    } else if (S.phase === L.PHASE.REJECTED) {
      g = "다시 해 오기를 기다린다";
    } else if (S.phase === L.PHASE.REVISED) {
      n = (S.verified || []).length;
      g = n ? "확인한 자리 <b>" + n + "</b>" : "";
    } else if (S.phase === L.PHASE.VERIFIED) {
      g = "<b>도장</b>";
    } else {
      g = "<b>문</b>으로 나간다";
    }
    if (isConditions()) {
      if (openingPending()) g = "공동 검토실을 살펴본다";
      else if (isClaimPhase()) g = "<b>작업대</b>에서 네 팀의 조건을 배정한다 · 규정함에서 근거 확인";
      else if (S.phase === L.PHASE.REVISED) g = "<b>작업대</b>에서 재시험 지시와 반환 기록 검토";
    }
    $("#objective").innerHTML = g;
  }

  /* ── 입력 ──────────────────────────────────────────────────────────── */
  function initInput() {
    var cv = $("#scene"), down = false, lx = 0, ly = 0, moved = 0;
    function pt(e) { var t = e.touches ? e.touches[0] : e; return { x: t.clientX, y: t.clientY }; }
    function endDrag() { down = false; cv.classList.remove("dragging"); }

    cv.addEventListener("pointerdown", function (e) {
      if (inputBlocked()) return;
      down = true; moved = 0;
      var p = pt(e); lx = p.x; ly = p.y;
      cv.classList.add("dragging");
      if (cv.setPointerCapture) cv.setPointerCapture(e.pointerId);
    });
    cv.addEventListener("pointermove", function (e) {
      if (inputBlocked()) { endDrag(); return; }
      var p = pt(e);
      if (down) {
        var dx = p.x - lx, dy = p.y - ly;
        lx = p.x; ly = p.y;
        moved += Math.abs(dx) + Math.abs(dy);
        yaw += dx * 0.0034;
        pitch = Math.max(-1.05, Math.min(1.05, pitch + dy * 0.003));
      }
      hoverThrottled(p.x, p.y);
    });
    cv.addEventListener("pointerup", function () {
      if (!down) return;
      endDrag();
      if (moved < 7) pick(lx, ly);
    });
    cv.addEventListener("pointercancel", endDrag);

    var MAP = { w: "w", a: "a", s: "s", d: "d", W: "w", A: "a", S: "s", D: "d",
                ArrowUp: "w", ArrowLeft: "a", ArrowDown: "s", ArrowRight: "d",
                "ㅗ": "w", "ㄴ": "s", "ㅁ": "a", "ㅇ": "d" };
    addEventListener("keydown", function (e) {
      if (e.key === "Escape") { closeSheet(); return; }
      if (e.key === "Tab" && !$("#sheet").classList.contains("hidden")) {
        var focusable = [].slice.call($("#sheet").querySelectorAll("button, [tabindex='0']"))
          .filter(function (n) { return !n.disabled && n.offsetParent !== null; });
        var first = focusable[0], last = focusable[focusable.length - 1];
        if (!first) { e.preventDefault(); return; }
        if (e.shiftKey && (document.activeElement === first || !$("#sheet").contains(document.activeElement))) {
          e.preventDefault(); last.focus();
        } else if (!e.shiftKey && (document.activeElement === last || !$("#sheet").contains(document.activeElement))) {
          e.preventDefault(); first.focus();
        }
        return;
      }
      if (e.key === "f" || e.key === "F" || e.key === "ㄹ") {
        if (!inputBlocked()) { toggleFullscreen(); return; }
      }
      var k = MAP[e.key];
      if (!k || inputBlocked()) return;
      keys[k] = true;
      if (e.key.indexOf("Arrow") === 0) e.preventDefault();
    });
    addEventListener("keyup", function (e) { var k = MAP[e.key]; if (k) keys[k] = false; });
    addEventListener("blur", function () { keys = {}; joy.x = joy.z = 0; });
    addEventListener("resize", resize);
    addEventListener("resize", refreshScrollHints);

    document.addEventListener("click", function (e) {
      if (!e.target || !e.target.closest) return;
      if (e.target.closest("[data-close]")) { closeSheet(); return; }
      /* 일반 패널 바깥을 눌러 닫는다. 보고서는 전용 닫기 버튼을 쓴다. */
      if (e.target.id === "sheet" || e.target.id === "sheet-body") closeSheet();
    });

    if (IS_TOUCH) document.body.classList.add("touch");
    initJoystick();
    initFullscreen();
    var act = $("#act");
    if (act) act.addEventListener("click", function () {
      if (!inputBlocked()) pick(innerWidth / 2, innerHeight / 2);
    });
  }

  /* ── 전체 화면 ────────────────────────────────────────────────────────
     주소창과 탭 줄이 세로를 20% 넘게 먹는다. 특히 가로로 돌린 폰에서는
     그만큼이 그대로 읽을 자리다. 지원하지 않는 기기(아이폰 사파리)에서는
     버튼을 숨긴다 — 눌러도 아무 일 없는 버튼은 없느니만 못하다. */
  function fsElement() {
    return document.fullscreenElement || document.webkitFullscreenElement || null;
  }
  function toggleFullscreen() {
    var d = document, e = d.documentElement;
    var enter = e.requestFullscreen || e.webkitRequestFullscreen;
    var exit = d.exitFullscreen || d.webkitExitFullscreen;
    try {
      var pr = fsElement() ? exit.call(d) : enter.call(e);
      if (pr && pr.catch) pr.catch(function () {
        toast("전체 화면으로 바꾸지 못했습니다.", "bad");
      });
    } catch (err) {
      toast("이 기기에서는 전체 화면을 지원하지 않습니다.", "bad");
    }
  }
  function initFullscreen() {
    var btn = $("#fs");
    if (!btn) return;
    var e = document.documentElement;
    if (!(e.requestFullscreen || e.webkitRequestFullscreen)) {
      btn.classList.add("hidden");
      return;
    }
    btn.addEventListener("click", toggleFullscreen);
    function sync() {
      var on = !!fsElement();
      btn.classList.toggle("on", on);
      btn.textContent = on ? "⤡" : "⛶";
      btn.setAttribute("aria-label", on ? "전체 화면 끄기" : "전체 화면");
      /* 전체 화면에 들어가고 나오면 뷰포트가 바뀐다 */
      resize(); refreshScrollHints();
    }
    document.addEventListener("fullscreenchange", sync);
    document.addEventListener("webkitfullscreenchange", sync);
  }

  function initJoystick() {
    var pad = $("#joy"), knob = $("#joyk"), id = null, R = 46;
    if (!pad) return;
    function move(e) {
      var b = pad.getBoundingClientRect();
      var dx = e.clientX - (b.left + b.width / 2), dy = e.clientY - (b.top + b.height / 2);
      var d = Math.hypot(dx, dy);
      if (d > R) { dx = dx / d * R; dy = dy / d * R; }
      knob.style.transform = "translate(" + dx + "px," + dy + "px)";
      joy.x = dx / R; joy.z = -dy / R;
    }
    pad.addEventListener("pointerdown", function (e) {
      if (inputBlocked()) return;
      id = e.pointerId; pad.setPointerCapture(e.pointerId); move(e); e.preventDefault();
      pad.classList.add("hot");
    });
    pad.addEventListener("pointermove", function (e) { if (e.pointerId === id) move(e); });
    function end(e) {
      if (e.pointerId !== id) return;
      id = null; joy.x = joy.z = 0;
      knob.style.transform = "translate(0,0)";
      pad.classList.remove("hot");
    }
    pad.addEventListener("pointerup", end);
    pad.addEventListener("pointercancel", end);
  }

  /* ── 조준 / 선택 ───────────────────────────────────────────────────── */
  var lastDist = 0, REACH = 2.6, hoveredHotspot = null;
  function castAt(x, y) {
    ray.setFromCamera(
      new THREE.Vector2((x / innerWidth) * 2 - 1, -(y / innerHeight) * 2 + 1), camera);
    /* r128의 Raycaster는 Object3D.visible을 검사하지 않는다.
       투명한 판정용 재질은 유지하되 퇴장 등으로 숨긴 영역은 제외한다. */
    var active = hotspots.filter(function (object) { return object.visible; });
    var hits = ray.intersectObjects(active, false);
    if (!hits.length) return null;
    lastDist = hits[0].distance;
    return hits[0].object;
  }
  function hoverThrottled(x, y) {
    var now = performance.now();
    if (now - _hoverAt < 33) return;
    _hoverAt = now;
    hover(x, y);
  }
  function hover(x, y) {
    var o = castAt(x, y), r = $("#reticle"), lb = $("#label");
    if (o && o.userData.hot) {
      hoveredHotspot = o;
      var far = lastDist > REACH;
      r.classList.toggle("hot", !far);
      r.classList.toggle("far", far);
      lb.textContent = o.userData.hot.name + (far ? " — 더 가까이" : "");
      lb.style.left = x + "px"; lb.style.top = y + "px";
      lb.classList.add("show");
    } else {
      clearHover();
    }
  }
  function clearHover() {
    hoveredHotspot = null;
    $("#reticle").classList.remove("hot", "far");
    $("#label").classList.remove("show");
    $("#label").textContent = "";
  }
  function pick(x, y) {
    /* 처음 한 번은 무엇을 눌렀든 시작 연출부터다 */
    if (openingPending()) { playOpening(); return; }
    var o = castAt(x, y);
    if (!o || !o.userData.hot) return;
    if (lastDist > REACH) { toast("더 가까이 가십시오."); return; }
    interact(o.userData.hot.id);
  }

  function interact(id) {
    if (isConditions() && id === "references") {
      S.conditions = S.conditions || global.N2Conditions.fresh(); S.conditions.source = "change"; openDocs(); return;
    }
    if (isConditions() && id.indexOf("team:") === 0) {
      var team = chapter.teams.find(function (t) { return t.id === id.slice(5); });
      if (team) say([{ who: team.name, text: S.phase === L.PHASE.APPROVED ? "확인된 조건을 다음 시험에도 함께 남기겠습니다." : team.quote }]);
      return;
    }
    if (id === "docs") { openDocs(); return; }
    if (id === "stamp") { openStamp(); return; }
    if (id === "door") { leaveRoom(); return; }
    if (id === "npc") { talkToNPC(); return; }
  }

  /* 인물과의 대화는 국면과 진행에 따라 갈린다.
     어긋난 장을 짚은 뒤 처음 말을 걸면 세 장을 나란히 펼쳐 준다 —
     찍기는 그 뒤에만 열린다. */
  /* 말을 거는 것이 판정이다. 문장을 눌러 두는 것만으로는 옳은지 알 수 없고,
     여기서 한 번에 알려 주는 것도 많아야 하나다 — 잘못 짚은 것 하나. */
  function talkToNPC() {
    var l = chapter.lines;
    if (S.phase === L.PHASE.APPROVED) { say(l.done || l.approved); return; }
    if (S.phase === L.PHASE.CONTRADICTION) { say(l.conceded); return; }
    if (S.phase === L.PHASE.REJECTED) { say(l.rejected); return; }
    if (isVerifyPhase()) { say(sayOnce(l.revised, l.revisedAgain)); return; }

    if (!S.greeted) {
      say(l.submission, function () { S.greeted = true; checkpoint(); });
      return;
    }

    if (isConditions()) {
      S.conditions = S.conditions || global.N2Conditions.fresh();
      var review = global.N2Conditions.judge(chapter, S.conditions.assignments);
      if (!review.ok) { say([review.message]); return; }
      say(l.conceded, function () { setPhase(L.PHASE.CONTRADICTION); checkpoint(); });
      return;
    }
    var res = L.judgeClaims(chapter, S.claims);
    if (res.verdict === "none") { say(l.probing); return; }

    if (res.verdict === "wrong") {
      /* 잘못 짚은 것 하나만 물린다. 어느 것이 더 틀렸는지는 말하지 않는다. */
      var lines = (l.pushback || []).concat([safeText(res.set.same)],
                                            l.pushbackTail || []);
      S.claims = L.dropClaim(S.claims, res.set.id);
      checkpoint();
      say(lines, function () { renderHUD(); refreshSheet(); });
      return;
    }

    if (res.verdict === "short") { say(l.notYet); return; }

    /* 어긋난 자리를 전부, 그것만 짚었다 */
    say(l.conceded, function () {
      setPhase(L.PHASE.CONTRADICTION);
      checkpoint();
      renderHUD();
    });
  }

  /* 두 번째부터는 짧게 — 같은 설명을 되풀이하면 대사가 안내문이 된다.
     ※ 이름은 pick 이 아니어야 한다. 조준 판정 pick(x, y) 와 겹치면
        함수 선언이 그것을 덮어써서 클릭이 통째로 죽는다. */
  function sayOnce(first, again) {
    if (!again) return first;
    if (S._said) return again;
    S._said = true;
    return first;
  }

  /* ── 이동 ──────────────────────────────────────────────────────────── */
  function canStand(x, z) {
    var mx = ROOM.W / 2 - 0.45, mz = ROOM.D / 2 - 0.45;
    if (x < -mx || x > mx || z < -mz || z > mz) return false;
    for (var i = 0; i < BLOCKS.length; i++) {
      var b = BLOCKS[i];
      if (Math.abs(x - b.x) < b.hx + 0.3 && Math.abs(z - b.z) < b.hz + 0.3) return false;
    }
    return true;
  }
  function moveStep(dt) {
    if (!camera || inputBlocked()) return;
    var f = (keys.w ? 1 : 0) - (keys.s ? 1 : 0) + joy.z;
    var r = (keys.d ? 1 : 0) - (keys.a ? 1 : 0) + joy.x;
    if (Math.abs(f) < 0.02 && Math.abs(r) < 0.02) return;
    var len = Math.hypot(f, r);
    if (len > 1) { f /= len; r /= len; }
    var d = SPEED * dt;
    var fx = Math.sin(yaw), fz = Math.cos(yaw);
    var rx = Math.sin(yaw - Math.PI / 2), rz = Math.cos(yaw - Math.PI / 2);
    var nx = camera.position.x + (fx * f + rx * r) * d;
    var nz = camera.position.z + (fz * f + rz * r) * d;
    if (canStand(nx, camera.position.z)) camera.position.x = nx;
    if (canStand(camera.position.x, nz)) camera.position.z = nz;
  }

  function resize() {
    if (!renderer) return;
    renderer.setPixelRatio(Math.min(devicePixelRatio, IS_TOUCH ? 1.5 : 2));
    renderer.setSize(innerWidth, innerHeight);
    camera.aspect = innerWidth / innerHeight;
    camera.updateProjectionMatrix();
  }

  /* ── 루프 ──────────────────────────────────────────────────────────── */
  function loop() {
    requestAnimationFrame(loop);
    if (!_dir) { _dir = new THREE.Vector3(); _look = new THREE.Vector3(); }
    var now = performance.now() / 1000;
    var dt = lastT ? Math.min(now - lastT, 0.14) : 0;
    lastT = now;

    moveStep(dt);
    stepDoor(dt);
    stepNPC();
    if (npcMixer) npcMixer.update(dt);
    if (conditionRoom) conditionRoom.update(dt, camera);
    if (IS_TOUCH && !inputBlocked()) hoverThrottled(innerWidth / 2, innerHeight / 2);

    _dir.set(Math.sin(yaw) * Math.cos(pitch), Math.sin(pitch), Math.cos(yaw) * Math.cos(pitch));
    _look.copy(camera.position).add(_dir);
    camera.lookAt(_look);
    camera.position.y = EYE;

    renderer.render(scene, camera);
  }

  /* ── 부트 ──────────────────────────────────────────────────────────── */
  function boot(ch) {
    chapter = ch;
    if (!global.THREE) {
      $("#loading").textContent = "3D 엔진을 불러오지 못했습니다.";
      return;
    }
    THREE = global.THREE;

    /* 챕터 데이터가 스펙을 어기면 켜지기 전에 멈춘다. */
    var problems = isConditions() ? (global.N2Conditions ? global.N2Conditions.audit(chapter) : ["조건 검토 모듈 없음"]) : L.auditChapter(chapter);
    if (isConditions()) problems = problems.concat(L.findLeaks(JSON.stringify(chapter), 0));
    if (problems.length) {
      console.error("[CHAPTER AUDIT] " + chapter.id, problems);
      $("#loading").textContent = "챕터 데이터에 문제가 있습니다. 콘솔을 확인하십시오.";
      return;
    }

    if (chapter.room) ROOM = chapter.room;

    S = L.freshState();
    S.chapter = chapter.number;
    S.started = true;
    if (isConditions()) S.conditions = global.N2Conditions.fresh();
    checkpoint();

    _loadDone = 0;
    _loadTotal = (chapter.models || []).length + (chapter.npcModel ? 1 : 0);

    try { buildScene(); }
    catch (error) {
      console.error("[SCENE]", error);
      var loading = $("#loading");
      loading.classList.add("failed");
      $("#load-status").textContent = "연구실 화면을 열 수 없습니다.";
      $("#load-detail").textContent = "브라우저의 그래픽 가속을 확인한 뒤 다시 시도해 주세요.";
      var retry = el("button", "btn", "다시 시도");
      retry.type = "button";
      retry.onclick = function () { location.reload(); };
      loading.appendChild(retry);
      return;
    }
    initInput();
    renderHUD();
    loop();

    /* 소품은 가구를 실측해 앉히므로 모델이 다 온 뒤에 세운다 */
    loadModels(function () {
      buildDeskProps();
      loadNPC(function () {
        function ready() {
          $("#loading").classList.add("hidden"); refreshScrollHints(); resumeScene();
        }
        if (isConditions() && global.N2ConditionRoom) {
          conditionRoom = global.N2ConditionRoom.create({
            chapter: chapter, scene: scene,
            hotspot: function (pos, size, id, label) { var hit = hot(invisibleHit(size[0], size[1], size[2], pos), id, label); scene.add(hit); return hit; },
            block: function (x, z, radius) { BLOCKS.push({ x: x, z: z, hx: radius, hz: radius }); }
          }, ready);
        } else ready();
      });
    });
  }

  /* 저장본에서 이어 시작할 때 인물과 문을 그 국면에 맞게 놓는다.
     처음이면 문을 열고 걸어 들어오는 것부터 보여준다. */
  function resumeScene() {
    var stand = pathPoint("stand");
    if (chapter.opening === "meeting" && S.phase === L.PHASE.SUBMITTED) {
      if (npc) npc.position.set(stand[0], npc.position.y, stand[2]);
      faceNPC(camera.position.x, camera.position.z); showNPC(true); setDoor(false); return;
    }
    if (S.phase === L.PHASE.APPROVED) {
      showNPC(false);
      setDoor(true);
      return;
    }
    if (S.phase === L.PHASE.REJECTED) {
      /* 나가 있는 도중에 새로고침한 경우 — 수정본을 들고 돌아온다 */
      showNPC(false);
      S.verified = []; S.sel = [];
      setPhase(L.PHASE.REVISED);
      checkpoint();
      npcEnter(function () { say(chapter.lines.revised); });
      return;
    }
    if (S.phase !== L.PHASE.SUBMITTED) {
      if (npc) npc.position.set(stand[0], npc.position.y, stand[2]);
      faceNPC(camera.position.x, camera.position.z);
      showNPC(true);
      setDoor(false);
      return;
    }
    /* 처음 시작 — 아직 아무 일도 일어나지 않는다.
       폰은 세로로 켰다가 가로로 돌린다. 켜자마자 연출이 돌아 버리면
       돌려서 볼 때쯤엔 이미 지나가 있고, 시작한 줄도 모른다.
       플레이어가 처음 무언가를 살펴볼 때 그때 문 밖에서 노크가 난다. */
    showNPC(false);
    setDoor(false);
  }

  /* 아직 시작 연출을 보지 않았는가 */
  var openingRunning = false;
  function openingPending() {
    return !openingRunning && !S.greeted && S.phase === L.PHASE.SUBMITTED;
  }

  /* 똑똑똑 → 문이 열리고 → 걸어 들어와서 → 말한다 */
  function playOpening() {
    if (openingRunning) return;
    openingRunning = true;
    renderHUD();
    if (chapter.opening === "meeting") {
      say(chapter.lines.submission, function () { S.greeted = true; openingRunning = false; checkpoint(); renderHUD(); });
      return;
    }
    knock(function () {
      npcEnter(function () {
        say(chapter.lines.submission, function () {
          S.greeted = true;
          openingRunning = false;
          checkpoint();
          renderHUD();
        });
      });
    });
  }

  global.N2Engine = {
    boot: boot,

    /* 테스트·챕터 저작용. 씬 내부는 전역으로 새지 않으므로 여기로만 연다. */
    _state: function () { return S; },
    _setState: function (s) { S = s; renderHUD(); },
    /* 특정 지점으로 옮겨 특정 방향을 보게 한다. 앵커 배치를 잡을 때 쓴다. */
    _teleport: function (x, z, y, p) {
      camera.position.set(x, EYE, z);
      if (y !== undefined) yaw = y;
      if (p !== undefined) pitch = p;
    },
    /* 화면 중앙에서 조사 — 마우스 좌표에 의존하지 않는 상호작용 경로 */
    _act: function () { pick(innerWidth / 2, innerHeight / 2); },
    /* 조준을 거치지 않고 각 상호작용을 직접 부른다. 검증용. */
    _openDocs: openDocs, _openStamp: openStamp,
    _talk: talkToNPC, _leave: leaveRoom,
    _npcAt: function () {
      return npc ? { x: +npc.position.x.toFixed(2), z: +npc.position.z.toFixed(2),
                     visible: npc.visible, walking: !!npcWalk } : null;
    },
    /* 화면 한가운데가 지금 무엇을 조준하고 있는가 — 라벨은 프레임이 느리면
       한 박자 늦게 갱신되므로 검증에는 이쪽을 쓴다. */
    _aim: function () {
      var o = castAt(innerWidth / 2, innerHeight / 2);
      if (!o || !o.userData.hot) return null;
      return { id: o.userData.hot.id, name: o.userData.hot.name,
               dist: +lastDist.toFixed(2), reach: lastDist <= REACH };
    },
    _npcAnim: function () {
      var out = { clips: Object.keys(npcClips), playing: null, overlay: null };
      Object.keys(npcClips).forEach(function (k) {
        if (npcClips[k] === npcBase) out.playing = k;
        if (npcClips[k] === npcOverlay) out.overlay = k;
        out[k] = { w: +npcClips[k].getEffectiveWeight().toFixed(2),
                   run: npcClips[k].isRunning() };
      });
      return out;
    },
    _setDoor: setDoor,
    _door: function () {
      return doorLeaf ? { open: doorOpen, angle: +doorLeaf.rotation.y.toFixed(2) } : null;
    },
    _hotspots: function () {
      return hotspots.map(function (h) { return h.userData.hot.id; });
    },
    /* 모델이 실제로 어떤 크기로 앉았는지 — 에셋 교체 시 확인용 */
    _measure: function () {
      var out = {};
      Object.keys(models).forEach(function (k) {
        var box = new THREE.Box3().setFromObject(models[k]);
        var s = box.getSize(new THREE.Vector3());
        out[k] = { w: +s.x.toFixed(3), h: +s.y.toFixed(3), d: +s.z.toFixed(3),
                   floor: +box.min.y.toFixed(3) };
      });
      return out;
    }
  };
})(window);
