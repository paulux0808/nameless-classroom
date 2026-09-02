(function stageOneHardening(global) {
  "use strict";

  var VERSION = "1.1.0";
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

  function isValidState(value) {
    if (!value || typeof value !== "object") return false;
    if (!Number.isInteger(value.ch) || value.ch < 1 || value.ch > 9) return false;
    if (value.phase !== "read" && value.phase !== "search") return false;
    if (!Array.isArray(value.pieces)) return false;
    if (value.pieces.some(function (n) { return !Number.isInteger(n) || n < 1 || n > 8; })) return false;
    if (new Set(value.pieces).size !== value.pieces.length) return false;
    if (!Number.isInteger(value.revealed) || value.revealed < 0 || value.revealed > 8) return false;
    return true;
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
    var normalized = Object.assign(base, value);
    return isValidState(normalized) ? normalized : null;
  }

  function emit(name, detail) {
    try { global.dispatchEvent(new CustomEvent(name, { detail: detail })); } catch (_) {}
  }

  function readRaw(key) {
    try { return global.localStorage.getItem(key); } catch (_) { return null; }
  }

  function decodeRecord(raw) {
    if (!raw) return null;
    try {
      var record = JSON.parse(raw);
      if (!record || typeof record.payload !== "string" || typeof record.checksum !== "string") return null;
      if (checksum(record.payload) !== record.checksum) return null;
      return normalizeState(JSON.parse(record.payload));
    } catch (_) {
      return null;
    }
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
      var primary = decodeRecord(readRaw(STORE_KEY));
      if (primary) return clone(primary);

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
        emit("nameless:save-memory-only", { error: String(error) });
        return true;
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

  var runtime = {
    version: VERSION,
    transitioning: false,
    quality: "AUTO",
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
