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
  var docsNow = {};              /* 현재 유효한 문서(원본 또는 수정본) */
  var npc = null, npcMixer = null, npcClips = {}, npcAction = null;
  var deskProps = {};
  var picked = null;             /* 대조를 위해 먼저 짚은 필드 */
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
       단색 한 장이면 눈이 붙잡을 데가 없어 더 휑해 보인다. */
    function wall(w, x, z, ry) {
      var g = new THREE.Group();
      g.position.set(x, 0, z); g.rotation.y = ry;

      var upper = new THREE.Mesh(new THREE.PlaneGeometry(w, H - WAINSCOT), upperMat);
      upper.position.y = WAINSCOT + (H - WAINSCOT) / 2;
      upper.receiveShadow = true; g.add(upper);

      var lower = new THREE.Mesh(new THREE.PlaneGeometry(w, WAINSCOT), lowerMat);
      lower.position.y = WAINSCOT / 2;
      lower.receiveShadow = true; g.add(lower);

      var cap = new THREE.Mesh(new THREE.BoxGeometry(w, 0.05, 0.035), trimMat);
      cap.position.set(0, WAINSCOT, 0.02);
      cap.castShadow = true; g.add(cap);

      var base = new THREE.Mesh(new THREE.BoxGeometry(w, 0.11, 0.045), trimMat);
      base.position.set(0, 0.055, 0.025);
      base.castShadow = true; g.add(base);

      scene.add(g);
    }
    wall(W, 0, -D / 2, 0);
    wall(W, 0,  D / 2, Math.PI);
    wall(D, -W / 2, 0, Math.PI / 2);
    wall(D,  W / 2, 0, -Math.PI / 2);

    /* 천장 보 — 위쪽이 비어 보이는 걸 막는다 */
    for (var i = -1; i <= 1; i++) {
      var beam = new THREE.Mesh(new THREE.BoxGeometry(W, 0.16, 0.18), trimMat);
      beam.position.set(0, H - 0.08, i * 1.9);
      beam.castShadow = true; beam.receiveShadow = true;
      scene.add(beam);
    }

    /* 방 경계와 책상을 통과하지 못하게 한다 */
    BLOCKS = [{ x: 0, z: 0.5, hx: 1.0, hz: 0.5 }];
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

    list.forEach(function (item) {
      loader.load(MODEL_BASE + item.path, function (gltf) {
        scene.add(placeModel(gltf.scene, item));
        step();
      }, undefined, function () {
        console.warn("모델 로드 실패:", item.path);
        step();
      });
    });
  }

  /* 내려받은 모델은 저마다 단위와 원점이 다르다. 매니페스트에 실제 치수를
     적어 두면 엔진이 맞춘다 — 그래야 에셋을 바꿔 끼워도 배치가 안 깨진다.

       fitHeight  이 높이(m)가 되도록 균일 배율을 잡는다
       fitWidth   폭 기준으로 맞춘다 (fitHeight 와 함께 쓰면 작은 쪽 채택)
       scale      배수를 직접 줄 때
       align      "floor"(기본) 바닥에 앉힌다 | "center" | "none"
       center     true 면 x/z 를 원점에 맞춘 뒤 pos 로 옮긴다 */
  function placeModel(obj, item) {
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
    if (align === "floor")      obj.position.y += p[1] - box.min.y;
    else if (align === "center") obj.position.y += p[1] - c.y;
    else                         obj.position.y = p[1];

    obj.traverse(function (n) {
      if (n.isMesh) { n.castShadow = true; n.receiveShadow = true; }
    });
    models[item.id] = obj;

    if (item.debug) {
      console.log("[MODEL] " + item.id, "원본 " + size.y.toFixed(2) + "m",
                  "→ 배율 " + s.toFixed(3));
    }
    return obj;
  }

  /* ── NPC ──────────────────────────────────────────────────────────────
     챕터가 npcModel 로 모델과 클립 이름을 준다. 엔진은 서 있기/말하기만
     구분한다 — 스펙(02_DIALOGUE_NPC)의 제스처 계층은 이후에 얹는다. */
  function loadNPC(done) {
    var spec = chapter.npcModel;
    if (!spec || !THREE.GLTFLoader) { done(); return; }
    var d = $("#load-detail");
    if (d) d.textContent = "인물을 부르는 중… (" + (_loadDone + 1) + "/" + _loadTotal + ")";
    new THREE.GLTFLoader().load(MODEL_BASE + spec.path, function (gltf) {
      npc = placeModel(gltf.scene, {
        id: "npc", pos: spec.pos, rot: spec.rot,
        fitHeight: spec.fitHeight, scale: spec.scale,
        align: spec.align || "floor", center: spec.center
      });
      scene.add(npc);

      if (gltf.animations && gltf.animations.length) {
        npcMixer = new THREE.AnimationMixer(npc);
        Object.keys(spec.clips || {}).forEach(function (role) {
          var clip = THREE.AnimationClip.findByName(gltf.animations, spec.clips[role]);
          if (clip) npcClips[role] = npcMixer.clipAction(clip);
        });
        playNPC("idle");
      }
      /* 히트박스를 모델 위치로 옮긴다 */
      var box = new THREE.Box3().setFromObject(npc);
      var c = box.getCenter(new THREE.Vector3());
      var hit = invisibleHit(0.8, box.max.y - box.min.y, 0.8, [c.x, c.y, c.z]);
      scene.add(hot(hit, "npc", chapter.npc));
      loadStep();
      done();
    }, undefined, function () {
      console.warn("NPC 모델 로드 실패:", spec.path);
      loadStep();
      done();
    });
  }

  function playNPC(role) {
    var next = npcClips[role] || npcClips.idle;
    if (!next || next === npcAction) return;
    next.reset().fadeIn(0.25).play();
    if (npcAction) npcAction.fadeOut(0.25);
    npcAction = next;
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

  /* 앵커에 소품을 놓고 히트박스를 씌운다 */
  function buildDeskProps() {
    var a = chapter.anchors || {};
    if (a.incomingSlot) {
      var docs = paperStack(9, 0.21, 0.29);
      docs.position.set(a.incomingSlot[0], a.incomingSlot[1], a.incomingSlot[2]);
      docs.rotation.y = -0.14;
      scene.add(docs);
      deskProps.docs = docs;
    }
    if (a.stampPad) {
      var st = stampProp();
      st.position.set(a.stampPad[0], a.stampPad[1], a.stampPad[2]);
      st.rotation.y = 0.22;
      scene.add(st);
      deskProps.stamp = st;
    }
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

  function buildHotspots() {
    var a = chapter.anchors || {};
    if (a.incomingSlot) {
      scene.add(hot(invisibleHit(0.30, 0.16, 0.38,
        [a.incomingSlot[0], a.incomingSlot[1] + 0.05, a.incomingSlot[2]]), "docs", "제출 자료"));
    }
    if (a.stampPad) {
      scene.add(hot(invisibleHit(0.26, 0.18, 0.20,
        [a.stampPad[0] + 0.04, a.stampPad[1] + 0.06, a.stampPad[2]]), "stamp", "도장"));
    }
    /* NPC 히트박스는 모델을 올린 뒤 loadNPC() 가 실제 위치에 만든다.
       모델이 없는 챕터만 앵커 자리에 임시로 둔다. */
    if (a.npcStand && !chapter.npcModel) {
      var p = [a.npcStand[0], 1.0, a.npcStand[2]];
      scene.add(hot(invisibleHit(0.7, 1.9, 0.7, p), "npc", chapter.npc));
    }
  }

  /* ── 문서 열람 & 대조 ──────────────────────────────────────────────── */
  function openDocs() {
    picked = null;
    openSheet("제출 자료", chapter.npc + " · " + chapter.title, function (body) {
      body.appendChild(el("p", "hint", isVerifyPhase()
        ? "반려한 자리들이 <b>이제 이어지는지</b> 하나씩 맞대어 확인하세요. " +
          "아래 목록의 항목마다 같은 두 자리를 다시 눌러 보면 됩니다."
        : "두 자료의 값을 하나씩 눌러 <b>맞대어 보세요.</b> " +
          "이어지지 않는 곳이 있으면 그때 드러납니다."));

      var grid = el("div", "doc-grid");
      Object.keys(docsNow).forEach(function (docId) {
        var doc = docsNow[docId];
        var card = el("article", "doc");
        card.appendChild(el("h3", null, doc.title));
        var dl = el("dl");
        Object.keys(doc.fields).forEach(function (key) {
          var ref = docId + ".fields." + key;
          var dt = el("dt", null, (chapter.labels && chapter.labels[key]) || key);
          var dd = el("dd");
          var btn = el("button", "field", String(doc.fields[key]));
          btn.type = "button";
          btn.dataset.ref = ref;
          btn.onclick = function () { pickField(ref, btn); };
          if (picked === ref) btn.classList.add("picked");
          dd.appendChild(btn);
          dl.appendChild(dt);
          dl.appendChild(dd);
        });
        card.appendChild(dl);
        grid.appendChild(card);
      });
      body.appendChild(grid);
      body.appendChild(findingsPanel());
    });
  }

  function clearPicked() {
    picked = null;
    document.querySelectorAll(".field.picked").forEach(function (b) {
      b.classList.remove("picked");
    });
  }

  function isVerifyPhase() {
    return S.phase === L.PHASE.REVISED || S.phase === L.PHASE.VERIFIED;
  }

  function pickField(ref, btn) {
    if (!picked) {
      clearPicked();
      picked = ref;
      btn.classList.add("picked");
      return;
    }
    if (picked === ref) {   /* 같은 것을 두 번 누르면 선택 해제 */
      clearPicked();
      return;
    }
    var a = picked;
    clearPicked();

    /* 조사(모순 찾기)와 재검증(이어졌는지 확인)은 같은 동작이지만
       국면에 따라 의미가 반대다. */
    if (isVerifyPhase()) return verifyField(a, ref);

    var res = L.applyCompare(chapter, S.found, a, ref, docsNow);
    if (!res.rule) { toast("두 값 사이에 문제는 없습니다."); return; }
    if (!res.isNew) { toast("이미 확인한 부분입니다."); return; }

    S.found = res.found;
    advancePhase();
    save();
    toast(safeText(res.rule.label), "good");
    refreshSheet();
  }

  function verifyField(a, b) {
    var res = L.applyVerify(chapter, S.verified || [], a, b, docsNow);
    if (!res.rule) { toast("이 둘은 확인할 자리가 아닙니다."); return; }
    if (res.stillBroken) {
      toast("아직 이어지지 않습니다: " + safeText(res.rule.label), "bad");
      return;
    }
    if (!res.isNew) { toast("이미 확인했습니다."); return; }

    S.verified = res.verified;
    advancePhase();
    save();
    toast("확인됨 — " + safeText(okLabel(res.rule)), "good");
    refreshSheet();
  }

  function findingsPanel() {
    var verifying = isVerifyPhase();
    var done = verifying ? (S.verified || []) : S.found;
    var box = el("section", "findings");
    box.appendChild(el("h4", null, (verifying ? "다시 확인할 자리" : "확인한 것") +
      " (" + done.length + " / " + chapter.required.length + ")"));
    var ul = el("ul");
    chapter.required.forEach(function (id) {
      var rule = chapter.rules.filter(function (r) { return r.id === id; })[0];
      var got = done.indexOf(id) >= 0;
      var li;
      if (verifying) {
        /* 무엇을 확인해야 하는지 명시한다. 반려한 것은 플레이어 자신이므로
           숨길 이유가 없다 — 숨기면 무엇을 눌러야 할지 알 수 없다. */
        var pair = L.rulePair(rule).map(fieldLabel).join("  ↔  ");
        li = el("li", got ? "got" : "pending",
          got ? "<b>확인됨 — " + safeText(okLabel(rule)) + "</b>"
              : "<b>" + safeText(rule.label) + "</b><span>" + pair + "</span>");
      } else {
        li = el("li", got ? "got" : "pending",
          got ? "<b>" + safeText(rule.label) + "</b><span>" + safeText(rule.detail) + "</span>"
              : "아직 확인하지 못한 부분이 있습니다.");
      }
      ul.appendChild(li);
    });
    box.appendChild(ul);

    var stamp = L.activeStamp(S.phase);
    if (stamp) {
      box.appendChild(el("p", "ready",
        stamp === "REJECTED"
          ? "모순이 전부 드러났습니다. 책상의 <b>도장</b>을 쓰십시오."
          : "수정본이 전부 이어집니다. 책상의 <b>도장</b>을 쓰십시오."));
    }
    return box;
  }

  /* 재검증이 끝났을 때 보여줄 문구. 챕터가 ok 를 주면 그것을 쓴다 —
     라벨을 정규식으로 주무르면 규칙마다 문장이 어색해진다. */
  function okLabel(rule) {
    return rule.ok || (rule.label + " — 해소됨");
  }

  /* "card02.fields.output" → "계산 카드 02 · OUTPUT" */
  function fieldLabel(ref) {
    var parts = String(ref).split(".");
    var doc = docsNow[parts[0]];
    var key = parts[parts.length - 1];
    var name = (chapter.labels && chapter.labels[key]) || key;
    return (doc ? doc.title : parts[0]) + " · " + name;
  }

  function refreshSheet() {
    if ($("#sheet").classList.contains("hidden")) return;
    openDocs();
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
    setPhase(L.nextPhase(S.phase, chapter.required, done));
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
      say(chapter.lines.rejected, function () {
        /* 수정/재시험 몽타주 후 재제출 */
        docsNow = Object.assign({}, chapter.docs, chapter.revisedDocs || {});
        S.verified = [];
        setPhase(L.PHASE.REVISED);
        save();
        say(chapter.lines.revised, function () {
          toast("수정본이 도착했습니다. 다시 확인하십시오.");
        });
      });
      return;
    }

    /* APPROVED */
    setPhase(L.PHASE.APPROVED);
    if (S.approved.indexOf(chapter.number) < 0) S.approved.push(chapter.number);
    save();
    say(chapter.lines.approved, function () {
      renderHUD();
      toast("진행도 " + L.progressFor(S.approved.length) + "%", "good");
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
    picked = null;
  }

  /* ── HUD ───────────────────────────────────────────────────────────── */
  function renderHUD() {
    $("#hud-ch").textContent = "CHAPTER " + String(chapter.number).padStart(2, "0");
    $("#hud-title").textContent = chapter.title;
    $("#hud-npc").textContent = chapter.npc;
    var pct = L.progressFor(S.approved.length);
    $("#bar-fill").style.width = pct + "%";
    $("#bar-pct").textContent = pct + "%";

    var goal = {};
    goal[L.PHASE.SUBMITTED]   = "제출된 자료를 확인하십시오.";
    goal[L.PHASE.INSPECTING]  = "아직 맞지 않는 곳이 남아 있습니다.";
    goal[L.PHASE.CONTRADICTION] = "모순이 드러났습니다. 도장을 쓰십시오.";
    goal[L.PHASE.REJECTED]    = "수정본을 기다립니다.";
    goal[L.PHASE.REVISED]     = "수정본에서 반려한 자리가 <b>이어지는지</b> 확인하십시오.";
    goal[L.PHASE.VERIFIED]    = "전부 이어집니다. 도장을 쓰십시오.";
    goal[L.PHASE.APPROVED]    = "이 챕터는 끝났습니다.";
    $("#objective").innerHTML = goal[S.phase] || "";
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
    if (id === "npc") {
      var lines = S.phase === L.PHASE.CONTRADICTION ? chapter.lines.conceded
                : S.phase === L.PHASE.SUBMITTED     ? chapter.lines.submission
                : chapter.lines.probing;
      say(lines);
      return;
    }
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

    S = loadState();
    if (S.chapter !== chapter.number) {
      /* 저장본이 다른 챕터를 가리키면 이 챕터를 새로 시작한다. */
      S = L.freshState();
      S.chapter = chapter.number;
    }
    S.started = true;
    docsNow = (S.phase === L.PHASE.REVISED || S.phase === L.PHASE.VERIFIED ||
               S.phase === L.PHASE.APPROVED)
      ? Object.assign({}, chapter.docs, chapter.revisedDocs || {})
      : chapter.docs;
    save();

    _loadDone = 0;
    _loadTotal = (chapter.models || []).length + (chapter.npcModel ? 1 : 0);

    buildScene();
    buildDeskProps();
    buildHotspots();
    initInput();
    renderHUD();
    loop();

    loadModels(function () {
      loadNPC(function () {
        $("#loading").classList.add("hidden");
        refreshScrollHints();
        if (S.phase === L.PHASE.SUBMITTED) say(chapter.lines.submission);
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
