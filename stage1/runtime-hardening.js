(function stageOneHardening(global) {
  "use strict";

  var VERSION = "1.2.0";
  var LEGACY_KEY = "nameless-classroom-v1";
  var STORE_KEY = "nameless-classroom-v2";
  var BACKUP_KEY = STORE_KEY + ".backup";
  var TEMP_KEY = STORE_KEY + ".temp";
  var memorySave = null;

  function clone(value) {
    return value == null ? value : JSON.parse(JSON.stringify(value));
  }

  function checksum(text) {
    var hash = 2166136261;
    for (var i = 0; i < text.length; i += 1) {
      hash ^= text.charCodeAt(i);
      hash = Math.imul(hash, 16777619);
    }
    return (hash >>> 0).toString(16).padStart(8, "0");
  }

  var ROT_KEYS = ["apple", "compass", "sqrt", "sun", "pi", "einstein"];
  var FLAG_KEYS = ["started", "tookD1", "exitReady", "done"];

  function isValidState(value) {
    if (!value || typeof value !== "object") return false;
    if (!Number.isInteger(value.ch) || value.ch < 1 || value.ch > 9) return false;
    if (value.phase !== "read" && value.phase !== "search") return false;
    if (!Array.isArray(value.pieces)) return false;
    if (value.pieces.some(function (n) { return !Number.isInteger(n) || n < 1 || n > 8; })) return false;
    if (new Set(value.pieces).size !== value.pieces.length) return false;
    if (!Number.isInteger(value.revealed) || value.revealed < 0 || value.revealed > 8) return false;
    if (!value.rot || typeof value.rot !== "object") return false;
    if (ROT_KEYS.some(function (k) { return !Number.isInteger(value.rot[k]) || value.rot[k] < 0 || value.rot[k] > 3; })) return false;
    if (value.stack !== null && !isValidStack(value.stack)) return false;
    if (FLAG_KEYS.some(function (k) { return typeof value[k] !== "boolean"; })) return false;
    return true;
  }

  function isValidStack(stack) {
    if (!Array.isArray(stack) || stack.length !== 8) return false;
    if (stack.some(function (n) { return !Number.isInteger(n) || n < 1 || n > 8; })) return false;
    return new Set(stack).size === 8;
  }

  /* 손상된 값을 통째로 버리는 대신 되살릴 수 있는 것은 되살린다.
     이 정리를 거친 뒤에도 isValidState를 통과하지 못하면 그때 폐기한다. */
  function repair(state) {
    if (!state || typeof state !== "object") return state;
    if (!state.rot || typeof state.rot !== "object") state.rot = {};
    ROT_KEYS.forEach(function (k) {
      var v = state.rot[k];
      state.rot[k] = Number.isInteger(v) ? ((v % 4) + 4) % 4 : 0;
    });
    Object.keys(state.rot).forEach(function (k) {
      if (ROT_KEYS.indexOf(k) < 0) delete state.rot[k];
    });
    if (state.stack !== null && !isValidStack(state.stack)) state.stack = null;
    FLAG_KEYS.forEach(function (k) { state[k] = !!state[k]; });
    if (Array.isArray(state.pieces)) {
      var seen = {};
      state.pieces = state.pieces.filter(function (n) {
        if (!Number.isInteger(n) || n < 1 || n > 8 || seen[n]) return false;
        seen[n] = true; return true;
      });
    }
    if (typeof global.hasAllPieces === "function" && !global.hasAllPieces(state)) {
      state.exitReady = false; state.done = false;
    }
    if (typeof global.canExit === "function" && !global.canExit(state)) state.done = false;
    return state;
  }

  function normalizeState(value) {
    if (!value || typeof value !== "object") return null;
    var base = typeof global.fresh === "function" ? global.fresh() : {
      started: false,
      ch: 1,
      phase: "read",
      pieces: [],
      rot: {},
      stack: null,
      revealed: 0,
      tookD1: false,
      exitReady: false,
      done: false
    };
    var normalized = repair(Object.assign(base, value));
    return isValidState(normalized) ? normalized : null;
  }

  function emit(name, detail) {
    try { global.dispatchEvent(new CustomEvent(name, { detail: detail })); } catch (_) {}
  }

  function readRaw(key) {
    try { return global.localStorage.getItem(key); } catch (_) { return null; }
  }

  /* { state, writtenAt } 을 돌려준다. 어느 슬롯이 더 최신인지 판단해야 하므로
     타임스탬프를 버리지 않는다. */
  function decodeEntry(raw) {
    if (!raw) return null;
    try {
      var record = JSON.parse(raw);
      if (!record || typeof record.payload !== "string" || typeof record.checksum !== "string") return null;
      if (checksum(record.payload) !== record.checksum) return null;
      var state = normalizeState(JSON.parse(record.payload));
      if (!state) return null;
      return { state: state, writtenAt: Number(record.writtenAt) || 0 };
    } catch (_) {
      return null;
    }
  }

  function decodeRecord(raw) {
    var entry = decodeEntry(raw);
    return entry ? entry.state : null;
  }

  function decodeLegacy(raw) {
    if (!raw) return null;
    try {
      return normalizeState(JSON.parse(raw));
    } catch (_) {
      return null;
    }
  }

  var resilientStore = {
    get: function () {
      var primary = decodeEntry(readRaw(STORE_KEY));
      /* 임시 슬롯이 남아 있다면 본 슬롯 승격 직전에 중단된 쓰기다.
         본 슬롯보다 최신일 때만 채택한다. */
      var pending = decodeEntry(readRaw(TEMP_KEY));
      if (pending && (!primary || pending.writtenAt >= primary.writtenAt)) {
        emit("nameless:save-recovered", { source: "pending" });
        return clone(pending.state);
      }
      if (primary) return clone(primary.state);

      var backup = decodeRecord(readRaw(BACKUP_KEY));
      if (backup) {
        emit("nameless:save-recovered", { source: "backup" });
        return clone(backup);
      }

      var legacy = decodeLegacy(readRaw(LEGACY_KEY));
      if (legacy) return clone(legacy);
      return clone(memorySave);
    },

    set: function (value) {
      var state = normalizeState(clone(value));
      if (!state) {
        emit("nameless:save-rejected", { reason: "invalid-state" });
        return false;
      }

      memorySave = state;
      var payload = JSON.stringify(state);
      var record = JSON.stringify({
        version: 2,
        payload: payload,
        checksum: checksum(payload),
        writtenAt: Date.now()
      });

      try {
        var previous = global.localStorage.getItem(STORE_KEY);
        global.localStorage.setItem(TEMP_KEY, record);
        if (previous) global.localStorage.setItem(BACKUP_KEY, previous);
        global.localStorage.setItem(STORE_KEY, record);
        global.localStorage.setItem(LEGACY_KEY, payload);
        global.localStorage.removeItem(TEMP_KEY);
        return true;
      } catch (error) {
        /* 메모리에는 남지만 영속화는 실패했다. 호출자가 알 수 있어야 한다. */
        emit("nameless:save-memory-only", { error: String(error) });
        return false;
      }
    },

    clr: function () {
      memorySave = null;
      try {
        [STORE_KEY, BACKUP_KEY, TEMP_KEY, LEGACY_KEY].forEach(function (key) {
          global.localStorage.removeItem(key);
        });
      } catch (_) {}
    }
  };

  global.store = resilientStore;
  var recoveredState = resilientStore.get();
  if (recoveredState) {
    global.S = Object.assign(typeof global.fresh === "function" ? global.fresh() : {}, recoveredState);
  }

  var runtime = {
    version: VERSION,
    transitioning: false,
    saveKey: STORE_KEY
  };

  function isVisible(id) {
    var node = global.document.getElementById(id);
    return !!node && !node.classList.contains("hidden");
  }

  function gameplayBlocked() {
    return runtime.transitioning || isVisible("intro") || isVisible("modal") || isVisible("ending-scene");
  }

  function clearMotion() {
    global.keys = {};
    if (global.joy) global.joy.x = global.joy.z = 0;
  }

  function resetTransient() {
    clearMotion();
    global.lastT = 0;
  }

  var originalMoveStep = global.moveStep;
  if (typeof originalMoveStep === "function") {
    global.moveStep = function hardenedMoveStep(dt) {
      if (gameplayBlocked()) {
        clearMotion();
        return;
      }
      return originalMoveStep(dt);
    };
  }

  var originalPick = global.pick;
  if (typeof originalPick === "function") {
    global.pick = function hardenedPick(x, y) {
      if (gameplayBlocked()) return;
      return originalPick(x, y);
    };
  }

  global.addEventListener("blur", resetTransient);
  global.addEventListener("pagehide", function () {
    resetTransient();
    try { if (global.S && typeof global.save === "function") global.save(); } catch (_) {}
  });
  global.document.addEventListener("visibilitychange", function () {
    if (global.document.hidden) resetTransient();
    else global.lastT = 0;
  });

  var performanceState = {
    dpr: Math.min(global.devicePixelRatio || 1, global.IS_TOUCH ? 1.5 : 2),
    minDpr: 0.75,
    maxDpr: Math.min(global.devicePixelRatio || 1, global.IS_TOUCH ? 1.5 : 2),
    targetFps: global.IS_TOUCH ? 30 : 55,
    frames: 0,
    elapsed: 0,
    lastTime: 0,
    lastAdjust: 0
  };

  function applyDpr(next) {
    var value = Math.max(performanceState.minDpr, Math.min(performanceState.maxDpr, next));
    if (Math.abs(value - performanceState.dpr) < 0.05) return;
    performanceState.dpr = value;
    if (global.renderer) global.renderer.setPixelRatio(value);
    /* EffectComposer는 생성 시점의 픽셀비를 캐시하므로 같이 갱신해야
       블룸 렌더타깃이 캔버스 해상도와 어긋나지 않는다. */
    if (global.composer && typeof global.composer.setPixelRatio === "function") {
      global.composer.setPixelRatio(value);
    }
    runtime.pixelRatio = Number(value.toFixed(2));
  }

  function samplePerformance(time) {
    if (!Number.isFinite(time)) return;
    if (!performanceState.lastTime) {
      performanceState.lastTime = time;
      return;
    }

    var delta = time - performanceState.lastTime;
    performanceState.lastTime = time;
    if (delta <= 0 || delta > 250) return;
    performanceState.frames += 1;
    performanceState.elapsed += delta;
    if (performanceState.frames < 120 || time - performanceState.lastAdjust < 3000) return;

    var fps = performanceState.frames * 1000 / performanceState.elapsed;
    performanceState.frames = 0;
    performanceState.elapsed = 0;
    performanceState.lastAdjust = time;
    runtime.fps = Math.round(fps);

    if (fps < performanceState.targetFps * 0.82) applyDpr(performanceState.dpr - 0.2);
    else if (fps > performanceState.targetFps * 0.98) applyDpr(performanceState.dpr + 0.1);
  }

  var originalResize = global.resize;
  if (typeof originalResize === "function") {
    global.resize = function hardenedResize() {
      originalResize();
      if (global.renderer) global.renderer.setPixelRatio(performanceState.dpr);
    };
  }

  var originalLoop = global.loop;
  if (typeof originalLoop === "function") {
    global.loop = function hardenedLoop(time) {
      samplePerformance(time);
      return originalLoop(time);
    };
  }

  var originalNextStage = global.goToNextStage;
  if (typeof originalNextStage === "function") {
    global.goToNextStage = function hardenedNextStage() {
      if (runtime.transitioning) return false;
      if (typeof global.canExit === "function" && (!global.canExit(global.S) || !global.S.done)) return false;
      runtime.transitioning = true;
      resetTransient();
      try {
        if (global.S && typeof global.save === "function") global.save();
        originalNextStage();
        return true;
      } catch (error) {
        runtime.transitioning = false;
        emit("nameless:transition-error", { error: String(error) });
        throw error;
      }
    };
  }

  runtime.pixelRatio = Number(performanceState.dpr.toFixed(2));
  runtime.resetInput = resetTransient;
  runtime.isGameplayBlocked = gameplayBlocked;
  global.NAMELESS_STAGE1_RUNTIME = runtime;
})(window);
