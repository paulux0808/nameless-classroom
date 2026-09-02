import test from "node:test";
import assert from "node:assert/strict";
import vm from "node:vm";
import { readFileSync } from "node:fs";

const source = readFileSync(new URL("../runtime-hardening.js", import.meta.url), "utf8");

function state(overrides = {}) {
  return {
    started: true,
    ch: 1,
    phase: "read",
    pieces: [],
    rot: {},
    stack: null,
    revealed: 0,
    tookD1: false,
    exitReady: false,
    done: false,
    ...overrides
  };
}

function fixture(initial = {}) {
  const storage = new Map(Object.entries(initial));
  const listeners = new Map();
  const nodes = {
    intro: { classList: { contains: name => name === "hidden" } },
    modal: { classList: { contains: name => name === "hidden" } },
    "ending-scene": { classList: { contains: name => name === "hidden" } }
  };
  let moved = 0;
  let picked = 0;
  let transitions = 0;

  const context = {
    console,
    Math,
    JSON,
    Date,
    Number,
    Set,
    Object,
    String,
    CustomEvent: class CustomEvent { constructor(type, options) { this.type = type; this.detail = options?.detail; } },
    localStorage: {
      getItem: key => storage.has(key) ? storage.get(key) : null,
      setItem: (key, value) => storage.set(key, String(value)),
      removeItem: key => storage.delete(key)
    },
    document: {
      hidden: false,
      getElementById: id => nodes[id] ?? null,
      addEventListener: (type, fn) => listeners.set(`document:${type}`, fn)
    },
    addEventListener: (type, fn) => listeners.set(`window:${type}`, fn),
    dispatchEvent() {},
    devicePixelRatio: 2,
    IS_TOUCH: false,
    keys: {},
    joy: { x: 0, z: 0 },
    lastT: 1,
    S: state(),
    fresh: () => state({ started: false }),
    save() { this.store.set(this.S); },
    moveStep() { moved += 1; },
    pick() { picked += 1; },
    resize() {},
    loop() {},
    goToNextStage() { transitions += 1; }
  };
  context.window = context;
  vm.runInNewContext(source, context, { filename: "runtime-hardening.js" });
  return { context, storage, listeners, nodes, moved: () => moved, picked: () => picked, transitions: () => transitions };
}

test("legacy save is normalized and migrated without losing progress", () => {
  const legacy = { started: true, ch: 3, phase: "search", pieces: [1, 2], rot: {} };
  const f = fixture({ "nameless-classroom-v1": JSON.stringify(legacy) });
  const loaded = f.context.store.get();
  assert.equal(loaded.ch, 3);
  assert.equal(loaded.revealed, 0);
  assert.equal(f.context.store.set(loaded), true);
  assert.ok(f.storage.has("nameless-classroom-v2"));
  assert.equal(JSON.parse(f.storage.get("nameless-classroom-v1")).ch, 3);
});

test("corrupt primary save falls back to the previous valid backup", () => {
  const f = fixture();
  f.context.store.set(state({ ch: 2, pieces: [1] }));
  f.context.store.set(state({ ch: 3, pieces: [1, 2] }));
  f.storage.set("nameless-classroom-v2", "corrupt");
  assert.equal(f.context.store.get().ch, 2);
});

test("modal state blocks movement and object picking", () => {
  const f = fixture();
  f.nodes.modal.classList.contains = () => false;
  f.context.moveStep(0.016);
  f.context.pick(10, 10);
  assert.equal(f.moved(), 0);
  assert.equal(f.picked(), 0);

  f.nodes.modal.classList.contains = name => name === "hidden";
  f.context.moveStep(0.016);
  f.context.pick(10, 10);
  assert.equal(f.moved(), 1);
  assert.equal(f.picked(), 1);
});

test("next-stage transition is single-shot", () => {
  const f = fixture();
  assert.equal(f.context.goToNextStage(), true);
  assert.equal(f.context.goToNextStage(), false);
  assert.equal(f.transitions(), 1);
  assert.ok(f.storage.has("nameless-classroom-v2"));
});

test("visibility loss clears movement and resets frame timing", () => {
  const f = fixture();
  f.context.keys = { w: true };
  f.context.joy = { x: 1, z: 1 };
  f.context.document.hidden = true;
  f.listeners.get("document:visibilitychange")();
  assert.equal(Object.keys(f.context.keys).length, 0);
  assert.equal(f.context.joy.x, 0);
  assert.equal(f.context.joy.z, 0);
  assert.equal(f.context.lastT, 0);
});
