/* ============================================================================
   이름 없는 교실 — 진행 저장 (순수 모듈, DOM 무관)
   · 저장은 본 슬롯 + 임시 슬롯 + 직전 백업 + 예전 v1 키까지 겹겹이 남긴다.
   · 읽을 때는 체크섬과 의미 검사를 통과한 것만 쓰고, 망가졌으면 되살릴 수 있는 만큼 되살린다.
   · 저장 형식은 옛 버전과 같다 (이미 플레이 중인 사람의 진행이 이어진다).
   ========================================================================== */
(function (root, factory) {
  var api = factory();
  if (typeof module === "object" && module.exports) module.exports = api;
  else root.N1Storage = api;
})(typeof globalThis !== "undefined" ? globalThis : this, function () {
  "use strict";

  var LEGACY_KEY = "nameless-classroom-v1";
  var STORE_KEY = "nameless-classroom-v2";
  var BACKUP_KEY = STORE_KEY + ".backup";
  var TEMP_KEY = STORE_KEY + ".temp";
  var ROT_KEYS = ["apple", "compass", "sqrt", "sun", "pi", "einstein"];
  var FLAG_KEYS = ["started", "tookD1", "exitReady", "done"];

  function fresh() {
    return {
      started: false, ch: 1, phase: "read", pieces: [],
      rot: { apple: 0, compass: 0, sqrt: 0, sun: 0, pi: 0, einstein: 0 },
      stack: null, revealed: 0, tookD1: false, exitReady: false, done: false
    };
  }
  function clone(v) { return v == null ? v : JSON.parse(JSON.stringify(v)); }
  function checksum(text) {
    var h = 2166136261;
    for (var i = 0; i < text.length; i += 1) { h ^= text.charCodeAt(i); h = Math.imul(h, 16777619); }
    return (h >>> 0).toString(16).padStart(8, "0");
  }

  function isValidStack(stack) {
    if (!Array.isArray(stack) || stack.length !== 8) return false;
    if (stack.some(function (n) { return !Number.isInteger(n) || n < 1 || n > 8; })) return false;
    return new Set(stack).size === 8;
  }
  function isValidState(v) {
    if (!v || typeof v !== "object") return false;
    if (!Number.isInteger(v.ch) || v.ch < 1 || v.ch > 9) return false;
    if (v.phase !== "read" && v.phase !== "search") return false;
    if (!Array.isArray(v.pieces)) return false;
    if (v.pieces.some(function (n) { return !Number.isInteger(n) || n < 1 || n > 8; })) return false;
    if (new Set(v.pieces).size !== v.pieces.length) return false;
    if (!Number.isInteger(v.revealed) || v.revealed < 0 || v.revealed > 8) return false;
    if (!v.rot || typeof v.rot !== "object") return false;
    if (ROT_KEYS.some(function (k) { return !Number.isInteger(v.rot[k]) || v.rot[k] < 0 || v.rot[k] > 3; })) return false;
    if (v.stack !== null && !isValidStack(v.stack)) return false;
    if (FLAG_KEYS.some(function (k) { return typeof v[k] !== "boolean"; })) return false;
    return true;
  }
  /* 손상된 값을 통째로 버리는 대신 되살릴 수 있는 것은 되살린다 */
  function repair(state) {
    if (!state || typeof state !== "object") return state;
    if (!state.rot || typeof state.rot !== "object") state.rot = {};
    ROT_KEYS.forEach(function (k) { var v = state.rot[k]; state.rot[k] = Number.isInteger(v) ? ((v % 4) + 4) % 4 : 0; });
    Object.keys(state.rot).forEach(function (k) { if (ROT_KEYS.indexOf(k) < 0) delete state.rot[k]; });
    if (state.stack !== null && !isValidStack(state.stack)) state.stack = null;
    FLAG_KEYS.forEach(function (k) { state[k] = !!state[k]; });
    if (Array.isArray(state.pieces)) {
      var seen = {};
      state.pieces = state.pieces.filter(function (n) {
        if (!Number.isInteger(n) || n < 1 || n > 8 || seen[n]) return false;
        seen[n] = true; return true;
      });
    }
    return state;
  }
  function normalizeState(value) {
    if (!value || typeof value !== "object") return null;
    var normalized = repair(Object.assign(fresh(), value));
    return isValidState(normalized) ? normalized : null;
  }

  /* env: { localStorage, emit(name, detail) } — 테스트에서는 가짜를 넣는다 */
  function createStore(env) {
    var ls = env && env.localStorage, emit = (env && env.emit) || function () {}, memory = null;
    function readRaw(key) { try { return ls.getItem(key); } catch (_) { return null; } }
    function decodeEntry(raw) {
      if (!raw) return null;
      try {
        var record = JSON.parse(raw);
        if (!record || typeof record.payload !== "string" || typeof record.checksum !== "string") return null;
        if (checksum(record.payload) !== record.checksum) return null;
        var state = normalizeState(JSON.parse(record.payload));
        return state ? { state: state, writtenAt: Number(record.writtenAt) || 0 } : null;
      } catch (_) { return null; }
    }
    function decodeLegacy(raw) { if (!raw) return null; try { return normalizeState(JSON.parse(raw)); } catch (_) { return null; } }

    return {
      /* 가장 믿을 만한 저장본. 없으면 null */
      get: function () {
        var primary = decodeEntry(readRaw(STORE_KEY));
        var pending = decodeEntry(readRaw(TEMP_KEY));   /* 임시 슬롯이 남았다면 승격 직전에 끊긴 쓰기 */
        if (pending && (!primary || pending.writtenAt >= primary.writtenAt)) { emit("nameless:save-recovered", { source: "pending" }); return clone(pending.state); }
        if (primary) return clone(primary.state);
        var backup = decodeEntry(readRaw(BACKUP_KEY));
        if (backup) { emit("nameless:save-recovered", { source: "backup" }); return clone(backup.state); }
        var legacy = decodeLegacy(readRaw(LEGACY_KEY));
        if (legacy) return clone(legacy);
        return clone(memory);
      },
      /* 저장. 영속 저장에 성공했을 때만 true (메모리에는 항상 남긴다) */
      set: function (value) {
        var state = normalizeState(clone(value));
        if (!state) { emit("nameless:save-rejected", { reason: "invalid-state" }); return false; }
        memory = state;
        var payload = JSON.stringify(state);
        var record = JSON.stringify({ version: 2, payload: payload, checksum: checksum(payload), writtenAt: Date.now() });
        try {
          var previous = ls.getItem(STORE_KEY);
          ls.setItem(TEMP_KEY, record);
          if (previous) ls.setItem(BACKUP_KEY, previous);
          ls.setItem(STORE_KEY, record);
          ls.setItem(LEGACY_KEY, payload);
          ls.removeItem(TEMP_KEY);
          return true;
        } catch (error) { emit("nameless:save-memory-only", { error: String(error) }); return false; }
      },
      clr: function () {
        memory = null;
        try { [STORE_KEY, BACKUP_KEY, TEMP_KEY, LEGACY_KEY].forEach(function (k) { ls.removeItem(k); }); } catch (_) {}
      }
    };
  }

  return { KEYS: { LEGACY: LEGACY_KEY, STORE: STORE_KEY, BACKUP: BACKUP_KEY, TEMP: TEMP_KEY },
    fresh: fresh, isValidState: isValidState, isValidStack: isValidStack, repair: repair, normalizeState: normalizeState, createStore: createStore };
});
