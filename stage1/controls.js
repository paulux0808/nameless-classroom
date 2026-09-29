/* ============================================================================
   N1C — 1인칭 컨트롤러 (PC 키보드·마우스 + 모바일 터치)
   · 가속·감속이 있는 이동, 웅크리기 전환, 걸음 흔들림, 부드러운 시선 이동(focusOn)
   · 시선 드래그는 포인터 하나만 따라간다(손바닥·두 번째 손가락이 끊지 못하게).
   · 모달·인트로·전환 중에는 모든 입력을 잠근다(blocked()).
   충돌·미끄러짐은 logic.js (buildBlocks/slideMove) 를 그대로 쓴다.
   ========================================================================== */
(function (root) {
  "use strict";
  var K = root.N1K, Lg = root.N1Logic || root;
  var EYE = 1.6, EYE_LOW = 0.42, SPEED = 2.9, REACH = 3.0;

  var KEYMAP = { w: "w", a: "a", s: "s", d: "d", W: "w", A: "a", S: "s", D: "d",
    ArrowUp: "w", ArrowLeft: "a", ArrowDown: "s", ArrowRight: "d",
    "ㅈ": "w", "ㅁ": "a", "ㄴ": "s", "ㅇ": "d" };

  function create(o) {
    var cv = o.canvas, cam = o.camera, blocks = Lg.buildBlocks();
    var C = { yaw: Math.PI, pitch: -0.13, crouch: false, keys: {}, joy: { x: 0, z: 0 }, hover: null, hoverDist: 0,
      sensitivity: 1, focus: null, vel: { x: 0, z: 0 }, bob: 0, speed01: 0, eye: EYE, EYE: EYE, REACH: REACH, blocks: blocks, lock: 0 };
    var IS_TOUCH = ("ontouchstart" in root) || (navigator.maxTouchPoints > 0);
    C.isTouch = IS_TOUCH;
    var ray = new root.THREE.Raycaster(), ndc = new root.THREE.Vector2(), hits = [];
    C.hotspots = o.hotspots;   /* 메시 배열 (userData.hot) — 호출 측이 바꿀 수 있다 */

    function blocked() { return C.lock > 0 || (o.blocked && o.blocked()); }
    C.blocked = blocked;

    /* ── 레이캐스트 ── */
    function castAt(x, y) {
      var r = cv.getBoundingClientRect();
      ndc.set(((x - r.left) / r.width) * 2 - 1, -((y - r.top) / r.height) * 2 + 1);
      ray.setFromCamera(ndc, cam);
      hits.length = 0;
      ray.intersectObjects(C.hotspots, false, hits);
      for (var i = 0; i < hits.length; i++) if (hits[i].object.visible !== false && hits[i].object.userData.hot) { C.hoverDist = hits[i].distance; return hits[i].object; }
      return null;
    }
    C.castAt = castAt;
    var lastHoverAt = 0;
    function hover(x, y) {
      var t = castAt(x, y), far = !!t && C.hoverDist > REACH;
      if (t !== C.hover || far !== C.hoverFar) { C.hover = t; C.hoverFar = far; if (o.onHover) o.onHover(t, far, x, y); }
      else if (t && o.onHoverMove) o.onHoverMove(x, y);
    }
    function hoverThrottled(x, y) { var n = performance.now(); if (n - lastHoverAt < 33) return; lastHoverAt = n; hover(x, y); }
    function pick(x, y) {
      if (blocked()) return;
      var t = castAt(x, y);
      if (!t) return;
      if (C.hoverDist > REACH) { if (o.onTooFar) o.onTooFar(t); return; }
      C.focusOn(t); if (o.onPick) o.onPick(t);
    }
    C.pick = pick;
    C.pickCenter = function () { var r = cv.getBoundingClientRect(); pick(r.left + r.width / 2, r.top + r.height / 2); };

    /* ── 시선 이동 ── */
    var _p = new root.THREE.Vector3();
    C.focusOn = function (obj) {
      if (!obj) return;
      obj.getWorldPosition(_p);
      var dx = _p.x - cam.position.x, dy = _p.y - cam.position.y, dz = _p.z - cam.position.z, len = Math.hypot(dx, dy, dz) || 1;
      C.focus = { yaw: Math.atan2(dx, dz), pitch: Math.asin(K.clamp(dy / len, -1, 1)), t: 0 };
    };
    C.lookAtPoint = function (x, y, z) { C.focusOn({ getWorldPosition: function (v) { v.set(x, y, z); return v; } }); };
    C.setView = function (x, z, yaw, pitch) { cam.position.x = x; cam.position.z = z; C.yaw = yaw; C.pitch = pitch == null ? -0.1 : pitch; C.vel.x = C.vel.z = 0; C.focus = null; };
    C.toggleCrouch = function () {
      C.crouch = !C.crouch; if (C.crouch && C.pitch < 0.08) C.pitch = 0.22;
      if (o.onCrouch) o.onCrouch(C.crouch);
    };
    C.clearInput = function () { C.keys = {}; C.joy.x = C.joy.z = 0; C.vel.x = C.vel.z = 0; endDrag(); };

    /* ── 시선 드래그 ── */
    var pid = null, lx = 0, ly = 0, moved = 0;
    function pt(e) { return { x: e.clientX, y: e.clientY }; }
    function endDrag() { pid = null; cv.classList.remove("dragging"); }
    cv.addEventListener("pointerdown", function (e) {
      if (blocked() || pid !== null) return;
      if (e.pointerType === "mouse" && e.button !== 0) return;
      pid = e.pointerId; moved = 0; lx = e.clientX; ly = e.clientY; C.focus = null;
      cv.classList.add("dragging");
      try { cv.setPointerCapture && cv.setPointerCapture(e.pointerId); } catch (_) {}
      if (o.onPointerDown) o.onPointerDown(e);
    });
    cv.addEventListener("pointermove", function (e) {
      if (blocked()) { endDrag(); return; }
      if (e.pointerId === pid) {
        var dx = e.clientX - lx, dy = e.clientY - ly; lx = e.clientX; ly = e.clientY; moved += Math.abs(dx) + Math.abs(dy);
        var s = 0.0034 * C.sensitivity;
        C.yaw += dx * s; C.pitch = K.clamp(C.pitch + dy * 0.003 * C.sensitivity, -1.05, 1.05);
      } else if (pid !== null) return;
      if (!IS_TOUCH) hoverThrottled(e.clientX, e.clientY);
    });
    cv.addEventListener("pointerup", function (e) {
      if (e.pointerId !== pid) return;
      var wasTap = moved < 7; endDrag();
      if (wasTap) pick(lx, ly);
    });
    cv.addEventListener("pointercancel", function (e) { if (e.pointerId === pid) endDrag(); });
    cv.addEventListener("contextmenu", function (e) { e.preventDefault(); });

    /* ── 키보드 ── */
    function typing() { var a = document.activeElement; return a && (a.tagName === "INPUT" || a.tagName === "TEXTAREA" || a.tagName === "SELECT"); }
    root.addEventListener("keydown", function (e) {
      if (typing() || e.ctrlKey || e.metaKey || e.altKey) return;
      var k = KEYMAP[e.key];
      if (k) { if (!blocked()) { C.keys[k] = true; if (e.key.indexOf("Arrow") === 0) e.preventDefault(); } return; }
      if (blocked()) return;
      if (e.key === "c" || e.key === "C" || e.key === "ㅊ") C.toggleCrouch();
      else if (e.key === "e" || e.key === "E" || e.key === "ㄷ" || e.key === " " || e.key === "Enter") { e.preventDefault(); C.pickCenter(); }
      else if (e.key === "f" || e.key === "F" || e.key === "ㄹ") { if (o.onFullscreen) o.onFullscreen(); }
    });
    root.addEventListener("keyup", function (e) { var k = KEYMAP[e.key]; if (k) C.keys[k] = false; });
    root.addEventListener("blur", C.clearInput);

    /* ── 조이스틱(터치) ── */
    if (o.joy) {
      var joyEl = o.joy, knob = o.joyKnob, jid = null, R = 44;
      var setKnob = function (dx, dy) { if (knob) knob.style.transform = "translate(" + dx + "px," + dy + "px)"; };
      var jm = function (e) {
        var b = joyEl.getBoundingClientRect(), dx = e.clientX - (b.left + b.width / 2), dy = e.clientY - (b.top + b.height / 2), d = Math.hypot(dx, dy);
        if (d > R) { dx = dx / d * R; dy = dy / d * R; d = R; }
        setKnob(dx, dy); C.joy.x = dx / R; C.joy.z = -dy / R;
      };
      joyEl.addEventListener("pointerdown", function (e) { if (blocked()) return; jid = e.pointerId; try { joyEl.setPointerCapture(e.pointerId); } catch (_) {} jm(e); e.preventDefault(); });
      joyEl.addEventListener("pointermove", function (e) { if (e.pointerId === jid) jm(e); });
      var je = function (e) { if (e.pointerId !== jid) return; jid = null; C.joy.x = C.joy.z = 0; setKnob(0, 0); };
      joyEl.addEventListener("pointerup", je); joyEl.addEventListener("pointercancel", je);
    }

    /* ── 프레임 갱신 ── */
    var _dir = new root.THREE.Vector3(), t = 0;
    C.update = function (dt, time) {
      t = time;
      var can = !blocked();
      var f = (C.keys.w ? 1 : 0) - (C.keys.s ? 1 : 0) + C.joy.z, r = (C.keys.d ? 1 : 0) - (C.keys.a ? 1 : 0) + C.joy.x;
      if (!can) { f = 0; r = 0; }
      var L = Math.sqrt(f * f + r * r); if (L > 1) { f /= L; r /= L; }
      var sp = SPEED * (C.crouch ? 0.5 : 1);
      var fx = Math.sin(C.yaw), fz = Math.cos(C.yaw), rx = Math.sin(C.yaw - Math.PI / 2), rz = Math.cos(C.yaw - Math.PI / 2);
      var tvx = (fx * f + rx * r) * sp, tvz = (fz * f + rz * r) * sp;
      var a = K.damp(f || r ? 9 : 13, dt);
      C.vel.x += (tvx - C.vel.x) * a; C.vel.z += (tvz - C.vel.z) * a;
      var spd = Math.hypot(C.vel.x, C.vel.z);
      if (spd > 0.01) Lg.slideMove(blocks, cam.position, C.vel.x * dt, C.vel.z * dt);
      C.speed01 = K.clamp(spd / SPEED, 0, 1);
      /* 눈높이: 웅크림/서기 + 걸음 흔들림 */
      var ty = C.crouch ? EYE_LOW : EYE;
      C.eye += (ty - C.eye) * K.damp(C.crouch ? 9 : 7, dt);
      C.bob += dt * (3.2 + spd * 2.4);
      var bobAmp = C.speed01 * 0.022 * (C.crouch ? 0.6 : 1), bobY = Math.sin(C.bob * 2) * bobAmp + Math.sin(t * 1.3) * 0.0016;
      cam.position.y = C.eye + bobY;
      /* 시선 이동 */
      if (C.focus) {
        var fo = C.focus; fo.t = Math.min(1, fo.t + dt * 2.6);
        var e = 1 - Math.pow(1 - fo.t, 3), dyaw = ((fo.yaw - C.yaw + Math.PI * 3) % (Math.PI * 2)) - Math.PI, k = K.damp(9, dt);
        C.yaw += dyaw * k; C.pitch += (fo.pitch - C.pitch) * k;
        if (fo.t >= 1 && Math.abs(dyaw) < 0.01) C.focus = null;
      }
      _dir.set(Math.sin(C.yaw) * Math.cos(C.pitch), Math.sin(C.pitch), Math.cos(C.yaw) * Math.cos(C.pitch));
      cam.lookAt(cam.position.x + _dir.x, cam.position.y + _dir.y, cam.position.z + _dir.z);
      cam.rotation.z += Math.sin(C.bob) * bobAmp * 0.06;
      /* 핫스팟이 꺼졌으면(치워진 물건 등) 남아 있는 호버 표시를 지운다 */
      if (C.hover && C.hotspots.indexOf(C.hover) < 0) { C.hover = null; C.hoverFar = false; if (o.onHover) o.onHover(null, false, 0, 0); }
      /* 터치: 화면 중앙 조준으로 호버 */
      if (IS_TOUCH && can) { var rr = cv.getBoundingClientRect(); hoverThrottled(rr.left + rr.width / 2, rr.top + rr.height / 2); }
    };
    return C;
  }
  root.N1C = { create: create, EYE: EYE, EYE_LOW: EYE_LOW, REACH: REACH };
})(window);
