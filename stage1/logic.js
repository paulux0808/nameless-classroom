/* ============================================================================
   이름 없는 교실 — 순수 로직
   DOM·three.js에 의존하지 않는 부분만 모아 둔다. 브라우저에서는 전역으로,
   테스트에서는 모듈로 같은 코드를 쓴다.
   ========================================================================== */
(function (root, factory) {
  var api = factory();
  if (typeof module === "object" && module.exports) module.exports = api;
  /* 브라우저: 기존 코드가 쓰던 전역 이름을 그대로 노출한다. */
  if (root) Object.keys(api).forEach(function (k) { root[k] = api[k]; });
})(typeof globalThis !== "undefined" ? globalThis : this, function () {
  "use strict";

  /* 정답 비교용 정규화 — 영숫자만 남기고 소문자로 */
  function norm(s) {
    return String(s == null ? "" : s).toLowerCase().replace(/[^a-z0-9]/g, "");
  }

  /* 입력이 영숫자로만 이루어졌을 때만 통과시킨다. 아니면 null */
  function answerCode(s) {
    var raw = String(s == null ? "" : s).trim();
    return /^[a-z0-9]+$/i.test(raw) ? raw.toLowerCase() : null;
  }

  /* 정답을 평문으로 두지 않기 위한 해시. 챕터 번호를 키로 섞는다. */
  function sealCode(s, k) {
    s = norm(s);
    var h = (2166136261 ^ Math.imul(k, 2654435761)) >>> 0;
    for (var i = 0; i < s.length; i++) {
      h ^= (s.charCodeAt(i) + (k + i) * 17) >>> 0;
      h = Math.imul(h, 16777619) >>> 0;
      h ^= h >>> 13;
    }
    return (h >>> 0).toString(36);
  }

  /* 바이트 배열 난독화 해제 (단서 문구·최종 이름 보관용) */
  function U(a, k) {
    var o = "";
    for (var i = 0; i < a.length; i++) o += String.fromCharCode(a[i] ^ ((k + i * 13) & 255));
    return o;
  }

  var _SO = [89, 132, 166, 203, 233, 28, 60, 89];
  function stackOrder() {
    return _SO.map(function (v, i) { return v ^ ((91 + i * 37) & 255); });
  }
  function bandOf(n) { return stackOrder().indexOf(n); }

  var _FN = [254, 158, 162, 84, 105, 123, 21, 88, 194, 251, 131, 160, 64, 103, 14, 64, 53, 219, 224, 159, 184, 64, 108];
  function finalName() {
    var o = "";
    for (var i = 0; i < _FN.length; i++) o += String.fromCharCode(_FN[i] ^ ((173 + i * 29) & 255));
    return o;
  }

  /* 액자 기호 신호를 시계방향으로 n번 회전 */
  function rotSig(sig, n) {
    var s = sig.slice();
    for (var i = 0; i < ((n % 4) + 4) % 4; i++) s = [s[3], s[0], s[1], s[2]];
    return s;
  }

  /* ── 이동/충돌 ─────────────────────────────────────────────────────── */
  var ROOM = { minX: -4.4, maxX: 4.4, minZ: -2.2, maxZ: 3.5 };
  var BLOCK_PAD = 0.18;

  /* Rendering and collision use the same desk coordinates. The middle front
     desk is removed and the reading desk is offset to open the central aisle. */
  function deskAt(row, column) {
    return {x: column === 1 ? 1 : (column - 1) * 2.3, z: -0.5 + row * 1.85};
  }
  function hasAllPieces(state) {
    return !!state && Array.isArray(state.pieces) && state.pieces.length === 8 &&
      new Set(state.pieces).size === 8 && state.pieces.every(function(n) {
        return Number.isInteger(n) && n >= 1 && n <= 8;
      });
  }
  function canExit(state) {
    return hasAllPieces(state) && state.ch === 9 && state.exitReady === true &&
      Array.isArray(state.stack) && state.stack.join(",") === stackOrder().join(",");
  }
  function buildBlocks() {
    var b = [
      { x: 0, z: -2.90, hx: 0.95, hz: 0.50 },
      { x: 3.1, z: -3.30, hx: 0.55, hz: 0.65 },
      { x: -2.6, z: 3.75, hx: 1.30, hz: 0.35 },
      { x: 4.45, z: 3.40, hx: 0.25, hz: 0.25 }
    ];
    for (var r = 0; r < 2; r++) for (var c = 0; c < 3; c++) {
      if (r === 0 && c === 1) continue;
      var p = deskAt(r, c);
      b.push({ x: p.x, z: p.z, hx: 0.42, hz: 0.28 });
      b.push({ x: p.x, z: p.z + 0.42, hx: 0.25, hz: 0.25 });
    }
    return b;
  }

  function canStand(blocks, x, z) {
    if (x < ROOM.minX || x > ROOM.maxX || z < ROOM.minZ || z > ROOM.maxZ) return false;
    for (var i = 0; i < blocks.length; i++) {
      var b = blocks[i];
      if (Math.abs(x - b.x) < b.hx + BLOCK_PAD && Math.abs(z - b.z) < b.hz + BLOCK_PAD) return false;
    }
    return true;
  }

  /* 충돌 지점에서 가장 가까운 면의 바깥쪽 법선 */
  function collisionNormal(blocks, x, z) {
    if (x < ROOM.minX) return { x: 1, z: 0 };
    if (x > ROOM.maxX) return { x: -1, z: 0 };
    if (z < ROOM.minZ) return { x: 0, z: 1 };
    if (z > ROOM.maxZ) return { x: 0, z: -1 };
    for (var i = 0; i < blocks.length; i++) {
      var b = blocks[i], ex = b.hx + BLOCK_PAD, ez = b.hz + BLOCK_PAD;
      if (Math.abs(x - b.x) >= ex || Math.abs(z - b.z) >= ez) continue;
      var dl = x - (b.x - ex), dr = (b.x + ex) - x;
      var db = z - (b.z - ez), dt = (b.z + ez) - z;
      var m = Math.min(dl, dr, db, dt);
      if (m === dl) return { x: -1, z: 0 };
      if (m === dr) return { x: 1, z: 0 };
      if (m === db) return { x: 0, z: -1 };
      return { x: 0, z: 1 };
    }
    return null;
  }

  /* 벽에 닿으면 파고드는 성분만 버리고 접선 방향으로 미끄러진다.
     pos를 제자리에서 갱신하고 그대로 돌려준다. */
  function slideMove(blocks, pos, dx, dz) {
    var dist = Math.hypot(dx, dz), steps = Math.max(1, Math.ceil(dist / 0.055));
    var sx = dx / steps, sz = dz / steps;
    for (var i = 0; i < steps; i++) {
      var vx = sx, vz = sz;
      for (var pass = 0; pass < 3; pass++) {
        var tx = pos.x + vx, tz = pos.z + vz;
        if (canStand(blocks, tx, tz)) { pos.x = tx; pos.z = tz; break; }
        var n = collisionNormal(blocks, tx, tz);
        if (!n) break;
        var inward = vx * n.x + vz * n.z;
        if (inward >= -0.000001) break;
        vx -= n.x * inward; vz -= n.z * inward;
        if (Math.hypot(vx, vz) < 0.00001) break;
      }
    }
    return pos;
  }

  /* 프레임률에 독립적인 감쇠 계수.
     k는 60fps 기준 계수, dt는 초 단위 프레임 시간. */
  function damp(k, dt) {
    if (!(dt > 0)) return k;
    return 1 - Math.pow(1 - k, dt * 60);
  }

  return {
    norm: norm,
    answerCode: answerCode,
    sealCode: sealCode,
    U: U,
    stackOrder: stackOrder,
    bandOf: bandOf,
    finalName: finalName,
    rotSig: rotSig,
    ROOM: ROOM,
    deskAt: deskAt,
    hasAllPieces: hasAllPieces,
    canExit: canExit,
    buildBlocks: buildBlocks,
    canStand: canStand,
    collisionNormal: collisionNormal,
    slideMove: slideMove,
    damp: damp
  };
});
