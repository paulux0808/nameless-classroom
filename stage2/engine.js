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
  var SAVE_KEY = "nameless2-v1";

  /* ── 상태 ──────────────────────────────────────────────────────────── */
  var chapter = null, S = null;
  var renderer, scene, camera, ray, clock;
  var hotspots = [], models = {};
  var yaw = 0, pitch = 0, keys = {}, joy = { x: 0, z: 0 };
  var EYE = 1.62, SPEED = 2.6, lastT = 0;
  var BLOCKS = [];
  var npc = null, npcMixer = null, npcClips = {}, npcAction = null;
  var deskProps = {};
  /* 반려하고 나간 뒤 돌아오기까지 */
  var RETURN_DELAY = 3000;
  var _dir = null, _look = null;
  var _hoverAt = 0;
  var IS_TOUCH = ("ontouchstart" in global) || navigator.maxTouchPoints > 0;

  /* ── 저장 ──────────────────────────────────────────────────────────── */
  var memoryOnly = null;
  function loadState() {
    var raw = null;
    try { raw = localStorage.getItem(SAVE_KEY); } catch (e) {}
    var parsed = null;
    try { parsed = raw ? JSON.parse(raw) : null; } catch (e) {}
    return L.normalizeState(parsed) || memoryOnly || L.freshState();
  }
  function save() {
    var clean = L.normalizeState(JSON.parse(JSON.stringify(S)));
    if (!clean) { toast("진행을 저장하지 못했습니다.", "bad"); return false; }
    memoryOnly = clean;
    try { localStorage.setItem(SAVE_KEY, JSON.stringify(clean)); return true; }
    catch (e) { return false; }
  }

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
    if (d) d.textContent = "오브젝트 배치 중 (" + _loadDone + "/" + _loadTotal + ")";
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

    /* 무엇 위에 올릴지 지정했으면 그 윗면을 바닥으로 삼는다 */
    var baseY = p[1];
    if (item.restOn) {
      var host = models[item.restOn];
      if (host) {
        var hb = new THREE.Box3().setFromObject(host);
        baseY = hb.max.y;
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
      /* 히트박스는 인물을 따라다닌다. 걸어 다니므로 고정할 수 없다. */
      var box = new THREE.Box3().setFromObject(npc);
      var h = box.max.y - box.min.y;
      npcHit = invisibleHit(0.8, h, 0.8, [npc.position.x, h / 2, npc.position.z]);
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

  /* ── 보고서 열람 ──────────────────────────────────────────────────────
     보기 방식은 셋이다.
       one    한 장을 크게 — 문장으로 읽는 게 이 챕터의 일이다
       pair   두 장을 화면 반반으로 맞대어
       three  세 장을 나란히 — 리처드가 펼쳐 준 뒤에만 열린다
     찍기는 three 에서만 한다. 한 장만 보고 찍는 건 근거가 아니기 때문이다. */
  var view = { mode: "one", a: "r1", b: "r2" };

  function reportsNow() { return L.reportsFor(chapter, S.phase); }
  function isVerifyPhase() {
    return S.phase === L.PHASE.REVISED || S.phase === L.PHASE.VERIFIED;
  }
  /* 근거를 찍는 국면인가 — 어긋난 장을 짚었고 리처드가 세 장을 펼친 뒤 */
  function isMarkPhase() {
    return !!S.confronted && (S.phase === L.PHASE.INSPECTING ||
                              S.phase === L.PHASE.SUBMITTED);
  }

  function openDocs() {
    if (S.confronted && view.mode !== "three") view.mode = "three";
    if (isVerifyPhase()) view.mode = "three";
    renderReader();
  }

  function renderReader() {
    var reps = reportsNow();
    var sub = chapter.npc + " · " + chapter.title +
              (isVerifyPhase() ? " · 수정본" : "");
    openSheet("제출 자료 — 보고서 " + reps.length + "장", sub, function (body) {
      body.appendChild(readerHint());
      body.appendChild(viewBar(reps));
      body.appendChild(readerPages(reps));
      body.appendChild(claimPanel(reps));
    });
    alignRows();
  }

  function readerHint() {
    if (S.phase === L.PHASE.APPROVED) {
      return el("p", "hint", "승인한 자료입니다. 세 장이 같은 말을 합니다.");
    }
    if (S.phase === L.PHASE.CONTRADICTION) {
      return el("p", "hint",
        "찍은 자리가 " + (S.marks || []).length + "곳입니다. 같은 시험이라고 적어 놓고 " +
        "같은 시험이 아니었습니다. 책상의 <b>도장</b>을 쓰십시오.");
    }
    if (S.phase === L.PHASE.REJECTED) {
      return el("p", "hint", "반려했습니다. 수정본을 기다리십시오.");
    }
    if (isVerifyPhase()) {
      return el("p", "hint",
        "반려한 두 자리가 <b>이제 세 장에서 같은 말을 하는지</b> 확인하십시오. " +
        "아래 <b>맞대어 확인</b> 을 자리마다 한 번씩 누르면 됩니다.");
    }
    if (isMarkPhase()) {
      return el("p", "hint",
        "세 장이 나란히 놓였습니다. 어긋난 진술을 <b>세 장 모두에서</b> 짚으십시오. " +
        "문단을 누르면 표시가 남습니다. 한 장만 짚어서는 근거가 되지 않습니다.");
    }
    if (S.odd) {
      return el("p", "hint",
        "어긋난 장은 짚었습니다. <b>" + chapter.npc + "</b> 에게 말을 거십시오.");
    }
    return el("p", "hint",
      "회차마다 한 장씩입니다. 착수 시각도, 정전 시각도, 서명 형식도 다릅니다 — " +
      "<b>회차가 다르니 그건 달라도 됩니다.</b> " +
      "달라서는 안 되는 것이 무엇인지 찾아, 어긋난 한 장을 짚으십시오.");
  }

  function viewBar(reps) {
    var bar = el("nav", "viewbar");
    function tab(label, on, fn, dis) {
      var b = el("button", "vtab" + (on ? " on" : ""), label);
      b.type = "button";
      if (dis) { b.disabled = true; b.title = "아직 열리지 않았습니다"; }
      else b.onclick = fn;
      bar.appendChild(b);
    }
    var locked = S.confronted || isVerifyPhase();

    bar.appendChild(el("span", "vlabel", "한 장씩"));
    reps.forEach(function (r) {
      tab(r.no, view.mode === "one" && view.a === r.id, function () {
        view.mode = "one"; view.a = r.id; renderReader();
      }, locked);
    });

    bar.appendChild(el("span", "vlabel", "맞대어"));
    (chapter.comparePairs || []).forEach(function (pr) {
      var A = L.reportById(reps, pr[0]), B = L.reportById(reps, pr[1]);
      if (!A || !B) return;
      tab(A.no + " · " + B.no,
          view.mode === "pair" && view.a === pr[0] && view.b === pr[1],
          function () {
            view.mode = "pair"; view.a = pr[0]; view.b = pr[1]; renderReader();
          }, locked);
    });

    bar.appendChild(el("span", "vlabel", "세 장"));
    tab("나란히", view.mode === "three", function () {
      view.mode = "three"; renderReader();
    }, !locked);
    return bar;
  }

  function readerPages(reps) {
    var wrap = el("div", "pages " + view.mode);
    var show = view.mode === "three" ? reps.map(function (r) { return r.id; })
             : view.mode === "pair"  ? [view.a, view.b]
             : [view.a];
    show.forEach(function (id) {
      var r = L.reportById(reps, id);
      if (r) wrap.appendChild(reportPage(r, reps));
    });
    _rows = wrap;
    return wrap;
  }

  /* 맞대어 읽기의 핵심은 같은 자리가 같은 높이에 있는 것이다. 문장 길이가
     장마다 달라 줄이 어긋나면 "세 장을 나란히 놓았다" 는 말이 무색해진다.
     칸끼리 같은 순번의 문단 높이를 맞춰 준다. */
  var _rows = null;
  function alignRows() {
    if (!_rows || !_rows.isConnected) return;
    var pages = [].slice.call(_rows.querySelectorAll(".page"));
    if (pages.length < 2) return;

    var groups = [];
    function collect(sel) {
      var row = [];
      pages.forEach(function (p) {
        var list = p.querySelectorAll(sel);
        for (var i = 0; i < list.length; i++) {
          list[i].style.minHeight = "";
          (row[i] = row[i] || []).push(list[i]);
        }
      });
      row.forEach(function (r) { if (r.length === pages.length) groups.push(r); });
    }
    collect(".page-head");
    collect(".para");

    /* 초기화한 높이가 반영된 뒤에 잰다 */
    requestAnimationFrame(function () {
      groups.forEach(function (row) {
        var h = 0;
        row.forEach(function (n) { h = Math.max(h, n.offsetHeight); });
        row.forEach(function (n) { n.style.minHeight = h + "px"; });
      });
      markScrollables();
    });
  }

  function reportPage(r, reps) {
    /* 지목 표시는 원본에서만 의미가 있다. 수정본까지 빨간 테두리를 달고
       있으면 고친 장을 계속 의심하라는 말이 된다. */
    var flagged = S.odd === r.id && !isVerifyPhase() && S.phase !== L.PHASE.APPROVED;
    var page = el("article", "page" + (flagged ? " flagged" : ""));
    var head = el("header", "page-head");
    head.appendChild(el("span", "page-no", r.no));
    head.appendChild(el("h3", null, safeText(r.title)));
    head.appendChild(el("p", "page-meta", safeText(r.head)));
    page.appendChild(head);

    (r.body || []).forEach(function (para) {
      var pel = el("p", "para", safeText(para.text));
      pel.dataset.para = para.id;
      if ((S.marks || []).indexOf(para.id) >= 0) pel.classList.add("marked");
      if (isMarkPhase()) {
        pel.classList.add("markable");
        pel.setAttribute("role", "button");
        pel.tabIndex = 0;
        pel.onclick = function () { markPara(para.id); };
        pel.onkeydown = function (e) {
          if (e.key === "Enter" || e.key === " ") { e.preventDefault(); markPara(para.id); }
        };
      }
      page.appendChild(pel);
    });

    /* 어긋난 장 지목 — 아직 짚지 않았고, 원본을 보는 동안만 */
    if (!S.odd && !isVerifyPhase()) {
      var b = el("button", "flag-btn", "이 장이 어긋났다 — " + r.no + " 지목");
      b.type = "button";
      b.onclick = function () { flagReport(r.id); };
      page.appendChild(b);
    } else if (flagged) {
      page.appendChild(el("p", "flag-note", "이 장을 어긋난 장으로 지목했습니다."));
    }
    return page;
  }

  /* 어긋난 한 장을 지목한다. 틀려도 벌은 없다 — 다시 읽으면 된다. */
  function flagReport(id) {
    if (S.odd) return;
    if (!L.checkOdd(chapter, id)) {
      toast("세 장이 같은 말을 하는지 더 맞대어 보십시오.", "bad");
      return;
    }
    S.odd = id;
    setPhase(L.PHASE.INSPECTING);
    save();
    toast("어긋난 장을 짚었습니다. " + chapter.npc + " 에게 말하십시오.", "good");
    renderReader();
  }

  /* 근거 찍기 — 같은 자리를 세 장 모두에서 짚어야 한 가지로 센다 */
  function markPara(paraId) {
    var reps = reportsNow();
    var res = L.applyMark(chapter, S.marks, S.found, paraId, reps);
    if (res.offClaim) { toast("이 문단은 세 장이 다른 말을 하지 않습니다."); return; }
    if (!res.isNew) { toast("이미 짚은 자리입니다."); return; }

    S.marks = res.marks;
    var wasFound = S.found.length;
    S.found = res.found;
    advancePhase();
    save();

    if (res.complete && S.found.length > wasFound) {
      toast(safeText(res.claim.label) + " — 세 장 모두 짚었습니다.", "good");
    } else {
      var left = L.marksLeft(reps, res.claim.id, S.marks);
      toast(safeText(res.claim.label) + " — " + left + "장 남았습니다.");
    }
    renderReader();
  }

  /* 수정본 재검증 — 자리마다 한 번씩 세 장을 맞댄다 */
  function verifyClaim(claimId) {
    var res = L.applyClaimVerify(chapter, S.verified, claimId, reportsNow());
    if (!res.claim) return;
    if (res.stillBroken) {
      toast("아직 세 장이 갈립니다: " + safeText(res.claim.label), "bad");
      return;
    }
    if (!res.isNew) { toast("이미 확인했습니다."); return; }
    S.verified = res.verified;
    advancePhase();
    save();
    toast("확인됨 — " + safeText(res.claim.ok || res.claim.label), "good");
    renderReader();
  }

  /* 무엇을 찾았는지 / 무엇을 확인해야 하는지 */
  function claimPanel(reps) {
    var verifying = isVerifyPhase();
    var need = L.requiredClaims(chapter);
    var done = verifying ? (S.verified || []) : (S.found || []);
    var box = el("section", "findings");
    box.appendChild(el("h4", null,
      (verifying ? "맞대어 확인할 자리" : "찾아낸 어긋남") +
      " (" + done.length + " / " + need.length + ")"));

    var ul = el("ul");
    need.forEach(function (id) {
      var c = L.claimById(chapter, id);
      var got = done.indexOf(id) >= 0;
      var li = el("li", got ? "got" : "pending");
      if (verifying) {
        li.appendChild(el("b", null, safeText(c.label)));
        li.appendChild(el("span", null, got ? safeText(c.ok) : safeText(c.question)));
        if (!got) {
          var vb = el("button", "verify-btn", "세 장 맞대어 확인");
          vb.type = "button";
          vb.onclick = function () { verifyClaim(id); };
          li.appendChild(vb);
        }
      } else if (got) {
        li.appendChild(el("b", null, safeText(c.label)));
        li.appendChild(el("span", null, safeText(c.wrong)));
      } else if (isMarkPhase()) {
        var left = L.marksLeft(reps, id, S.marks);
        li.appendChild(el("b", null,
          left < reps.length ? safeText(c.label) : "아직 짚지 않은 자리가 있습니다"));
        if (left < reps.length)
          li.appendChild(el("span", null, left + "장 남았습니다."));
      } else {
        li.appendChild(el("b", null, "아직 짚지 않은 자리가 있습니다"));
      }
      ul.appendChild(li);
    });
    box.appendChild(ul);

    var stamp = L.activeStamp(S.phase);
    if (stamp) {
      box.appendChild(el("p", "ready",
        stamp === "REJECTED"
          ? "어긋남이 전부 드러났습니다. 책상의 <b>도장</b>을 쓰십시오."
          : "수정본이 세 장 모두 같은 말을 합니다. 책상의 <b>도장</b>을 쓰십시오."));
    }
    return box;
  }

  function refreshSheet() {
    if ($("#sheet").classList.contains("hidden")) return;
    renderReader();
  }

  /* 국면 변경은 반드시 여기를 지난다. HUD 갱신을 빠뜨리지 않기 위해서다. */
  function setPhase(next) {
    if (next === S.phase) return;
    S.phase = next;
    renderHUD();
  }

  function advancePhase() {
    /* 재검증 국면에서는 플레이어가 실제로 확인한 것만 센다.
       엔진이 알아서 세어 버리면 확인하는 행위 자체가 사라진다. */
    var done = isVerifyPhase() ? (S.verified || []) : S.found;
    setPhase(L.nextPhase(S.phase, L.requiredClaims(chapter), done));
  }

  /* ── 도장 ──────────────────────────────────────────────────────────── */
  function openStamp() {
    var kind = L.activeStamp(S.phase);
    if (!kind) {
      /* 스펙: 도장은 도덕 선택지가 아니다. 검증 전에는 열리지 않는다. */
      toast(S.phase === L.PHASE.REVISED
        ? "수정본을 먼저 다시 확인하십시오."
        : "아직 판단할 근거가 부족합니다.", "bad");
      return;
    }
    openSheet("도장", kind === "REJECTED" ? "반려" : "승인", function (body) {
      body.appendChild(el("p", "hint", kind === "REJECTED"
        ? "이 결과는 다음 단계로 넘어갈 수 없습니다."
        : "이 결과는 다음 단계로 넘어가도 됩니다."));
      var b = el("button", "stamp-btn " + kind.toLowerCase(), kind);
      b.type = "button";
      b.onclick = function () { applyStamp(kind); };
      body.appendChild(b);
    });
  }

  function applyStamp(kind) {
    if (!L.canStamp(S.phase, kind)) { toast("지금은 찍을 수 없습니다.", "bad"); return; }
    closeSheet();

    if (kind === "REJECTED") {
      setPhase(L.PHASE.REJECTED);
      save();
      /* 반려 → 걸어 나간다 → 3초 → 다시 걸어 들어온다 → 수정본 */
      say(chapter.lines.rejected, function () {
        npcExit(false, function () {
          setTimeout(function () {
            S.verified = [];
            S.marks = [];
            setPhase(L.PHASE.REVISED);
            save();
            npcEnter(function () {
              say(chapter.lines.revised, function () {
                toast("수정본이 책상에 놓였습니다. 다시 확인하십시오.");
              });
            });
          }, RETURN_DELAY);
        });
      });
      return;
    }

    /* APPROVED — 사과하고 나간다. 문은 열어 둔다: 플레이어가 나갈 차례다. */
    setPhase(L.PHASE.APPROVED);
    if (S.approved.indexOf(chapter.number) < 0) S.approved.push(chapter.number);
    save();
    say(chapter.lines.approved, function () {
      renderHUD();
      toast("진행도 " + L.progressFor(S.approved.length) + "%", "good");
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
    openSheet("CHAPTER 01 — 종료", chapter.title, function (body) {
      body.appendChild(el("p", "hint",
        "첫 번째 자료를 승인했습니다. 진행도 " +
        L.progressFor(S.approved.length) + "%."));
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
        if (done) done();
        return;
      }
      box.innerHTML = "";
      box.appendChild(el("div", "who", chapter.npc));
      box.appendChild(el("p", "line", safeText(lines[i])));
      box.appendChild(el("div", "more", "계속 ▸"));
      i++;
    }
    box.onclick = step;
    step();
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
  function openSheet(title, sub, build) {
    $("#sheet-title").textContent = title;
    $("#sheet-sub").textContent = sub || "";
    var b = $("#sheet-body");
    b.innerHTML = "";
    build(b);
    $("#sheet").classList.remove("hidden");
    refreshScrollHints();
    var first = b.querySelector("button") || $("#sheet-close");
    if (first) try { first.focus({ preventScroll: true }); } catch (e) { first.focus(); }
  }
  function closeSheet() {
    $("#sheet").classList.add("hidden");
    hideAllEdges();
    _rows = null;
  }

  /* ── HUD ───────────────────────────────────────────────────────────── */
  function renderHUD() {
    $("#hud-ch").textContent = "CHAPTER " + String(chapter.number).padStart(2, "0");
    $("#hud-title").textContent = chapter.title;
    $("#hud-npc").textContent = chapter.npc;
    var pct = L.progressFor(S.approved.length);
    $("#bar-fill").style.width = pct + "%";
    $("#bar-pct").textContent = pct + "%";

    /* 지금 무엇을 해야 하는지 한 줄로. 국면만으로는 부족하다 —
       같은 INSPECTING 안에서도 할 일이 세 번 바뀐다. */
    var g;
    if (S.phase === L.PHASE.SUBMITTED || S.phase === L.PHASE.INSPECTING) {
      if (!S.odd) g = "보고서 세 장을 맞대어 읽고 <b>어긋난 한 장</b>을 짚으십시오.";
      else if (!S.confronted) g = "<b>" + chapter.npc + "</b> 에게 말을 거십시오.";
      else g = "어긋난 진술을 <b>세 장 모두에서</b> 짚으십시오. (" +
               (S.marks || []).length + " / " +
               L.requiredClaims(chapter).length * (chapter.reports || []).length + ")";
    } else if (S.phase === L.PHASE.CONTRADICTION) {
      g = "어긋남이 드러났습니다. <b>도장</b>을 쓰십시오.";
    } else if (S.phase === L.PHASE.REJECTED) {
      g = "수정본을 기다립니다.";
    } else if (S.phase === L.PHASE.REVISED) {
      g = "수정본에서 두 자리가 <b>세 장 모두 같은 말</b>을 하는지 확인하십시오.";
    } else if (S.phase === L.PHASE.VERIFIED) {
      g = "세 장이 같은 말을 합니다. <b>도장</b>을 쓰십시오.";
    } else {
      g = "승인했습니다. <b>문</b>으로 나가십시오.";
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
      var k = MAP[e.key];
      if (!k || inputBlocked()) return;
      keys[k] = true;
      if (e.key.indexOf("Arrow") === 0) e.preventDefault();
    });
    addEventListener("keyup", function (e) { var k = MAP[e.key]; if (k) keys[k] = false; });
    addEventListener("blur", function () { keys = {}; joy.x = joy.z = 0; });
    addEventListener("resize", resize);
    addEventListener("resize", refreshScrollHints);
    addEventListener("resize", alignRows);

    document.addEventListener("click", function (e) {
      if (e.target && e.target.closest && e.target.closest("[data-close]")) closeSheet();
    });

    if (IS_TOUCH) document.body.classList.add("touch");
    initJoystick();
    var act = $("#act");
    if (act) act.addEventListener("click", function () { pick(innerWidth / 2, innerHeight / 2); });
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
    });
    pad.addEventListener("pointermove", function (e) { if (e.pointerId === id) move(e); });
    function end(e) {
      if (e.pointerId !== id) return;
      id = null; joy.x = joy.z = 0;
      knob.style.transform = "translate(0,0)";
    }
    pad.addEventListener("pointerup", end);
    pad.addEventListener("pointercancel", end);
  }

  /* ── 조준 / 선택 ───────────────────────────────────────────────────── */
  var lastDist = 0, REACH = 2.6;
  function castAt(x, y) {
    ray.setFromCamera(
      new THREE.Vector2((x / innerWidth) * 2 - 1, -(y / innerHeight) * 2 + 1), camera);
    var hits = ray.intersectObjects(hotspots, false);
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
      var far = lastDist > REACH;
      r.classList.toggle("hot", !far);
      r.classList.toggle("far", far);
      lb.textContent = o.userData.hot.name + (far ? " — 더 가까이" : "");
      lb.style.left = x + "px"; lb.style.top = y + "px";
      lb.classList.add("show");
    } else {
      r.classList.remove("hot", "far");
      lb.classList.remove("show");
    }
  }
  function pick(x, y) {
    var o = castAt(x, y);
    if (!o || !o.userData.hot) return;
    if (lastDist > REACH) { toast("더 가까이 가십시오."); return; }
    interact(o.userData.hot.id);
  }

  function interact(id) {
    if (id === "docs") { openDocs(); return; }
    if (id === "stamp") { openStamp(); return; }
    if (id === "door") { leaveRoom(); return; }
    if (id === "npc") { talkToNPC(); return; }
  }

  /* 인물과의 대화는 국면과 진행에 따라 갈린다.
     어긋난 장을 짚은 뒤 처음 말을 걸면 세 장을 나란히 펼쳐 준다 —
     찍기는 그 뒤에만 열린다. */
  function talkToNPC() {
    var l = chapter.lines;
    if (S.phase === L.PHASE.APPROVED) { say(l.done || l.approved); return; }
    if (S.phase === L.PHASE.CONTRADICTION) { say(l.conceded); return; }
    if (S.phase === L.PHASE.REJECTED) { say(l.rejected); return; }
    if (isVerifyPhase()) { say(l.revised); return; }

    if (S.odd && !S.confronted) {
      say(l.confront, function () {
        S.confronted = true;
        view.mode = "three";
        setPhase(L.PHASE.INSPECTING);
        save();
        renderHUD();
        openDocs();
      });
      return;
    }
    if (S.odd) { say(l.picked || l.probing); return; }
    if (S.phase === L.PHASE.SUBMITTED) { say(l.submission); return; }
    say(l.probing);
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
    var problems = L.auditChapter(chapter);
    if (problems.length) {
      console.error("[CHAPTER AUDIT] " + chapter.id, problems);
      $("#loading").textContent = "챕터 데이터에 문제가 있습니다. 콘솔을 확인하십시오.";
      return;
    }

    if (chapter.room) ROOM = chapter.room;

    S = loadState();
    if (S.chapter !== chapter.number) {
      /* 저장본이 다른 챕터를 가리키면 이 챕터를 새로 시작한다. */
      S = L.freshState();
      S.chapter = chapter.number;
    }
    S.started = true;
    save();

    _loadDone = 0;
    _loadTotal = (chapter.models || []).length + (chapter.npcModel ? 1 : 0);

    buildScene();
    initInput();
    renderHUD();
    loop();

    /* 소품은 가구를 실측해 앉히므로 모델이 다 온 뒤에 세운다 */
    loadModels(function () {
      buildDeskProps();
      loadNPC(function () {
        $("#loading").classList.add("hidden");
        refreshScrollHints();
        resumeScene();
      });
    });
  }

  /* 저장본에서 이어 시작할 때 인물과 문을 그 국면에 맞게 놓는다.
     처음이면 문을 열고 걸어 들어오는 것부터 보여준다. */
  function resumeScene() {
    var stand = pathPoint("stand");
    if (S.phase === L.PHASE.APPROVED) {
      showNPC(false);
      setDoor(true);
      return;
    }
    if (S.phase === L.PHASE.REJECTED) {
      /* 나가 있는 도중에 새로고침한 경우 — 수정본을 들고 돌아온다 */
      showNPC(false);
      S.verified = []; S.marks = [];
      setPhase(L.PHASE.REVISED);
      save();
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
    npcEnter(function () { say(chapter.lines.submission); });
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
