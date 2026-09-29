import test from "node:test";
import assert from "node:assert/strict";
import { createRequire } from "node:module";
const require = createRequire(import.meta.url);
const St = require("../storage.js");

function env(initial = {}) {
  const map = new Map(Object.entries(initial));
  const events = [];
  return {
    map, events,
    localStorage: {
      getItem: k => (map.has(k) ? map.get(k) : null),
      setItem: (k, v) => map.set(k, String(v)),
      removeItem: k => map.delete(k)
    },
    emit: (name, detail) => events.push([name, detail])
  };
}
const state = (o = {}) => ({ ...St.fresh(), started: true, ...o });

test("옛 v1 저장은 정리되어 이어지고, 저장하면 v2 와 v1 이 함께 남는다", () => {
  const legacy = { started: true, ch: 3, phase: "search", pieces: [1, 2], rot: {} };
  const e = env({ "nameless-classroom-v1": JSON.stringify(legacy) });
  const store = St.createStore(e);
  const loaded = store.get();
  assert.equal(loaded.ch, 3);
  assert.equal(loaded.revealed, 0);
  assert.equal(store.set(loaded), true);
  assert.ok(e.map.has("nameless-classroom-v2"));
  assert.equal(JSON.parse(e.map.get("nameless-classroom-v1")).ch, 3);
});

test("본 슬롯이 손상되면 직전 백업으로 되돌린다", () => {
  const e = env(), store = St.createStore(e);
  store.set(state({ ch: 2, pieces: [1] }));
  store.set(state({ ch: 3, pieces: [1, 2] }));
  e.map.set("nameless-classroom-v2", "corrupt");
  assert.equal(store.get().ch, 2);
  assert.ok(e.events.some(([n, d]) => n === "nameless:save-recovered" && d.source === "backup"));
});

test("임시 슬롯이 더 최신이면(쓰기 도중 중단) 그것을 채택한다", () => {
  const e = env(), store = St.createStore(e);
  store.set(state({ ch: 2, pieces: [1] }));
  const primary = JSON.parse(e.map.get("nameless-classroom-v2"));
  const payload = JSON.stringify(state({ ch: 4, pieces: [1, 2, 3] }));
  // 체크섬은 저장소가 계산한 것과 같아야 하므로, 정상 저장으로 만든 레코드를 임시 슬롯에 옮긴다
  const store2 = St.createStore(env());
  store2.set(state({ ch: 4, pieces: [1, 2, 3] }));
  const rec = JSON.parse(JSON.stringify(primary)); rec.payload = payload; rec.writtenAt = primary.writtenAt + 5;
  // checksum 재계산: storage 내부 함수와 동일한 FNV-1a
  let h = 2166136261; for (let i = 0; i < payload.length; i++) { h ^= payload.charCodeAt(i); h = Math.imul(h, 16777619); }
  rec.checksum = (h >>> 0).toString(16).padStart(8, "0");
  e.map.set("nameless-classroom-v2.temp", JSON.stringify(rec));
  assert.equal(store.get().ch, 4);
});

test("체크섬이 틀린 레코드는 버려진다", () => {
  const e = env(), store = St.createStore(e);
  store.set(state({ ch: 5, pieces: [1, 2, 3, 4] }));
  const rec = JSON.parse(e.map.get("nameless-classroom-v2")); rec.checksum = "00000000";
  e.map.set("nameless-classroom-v2", JSON.stringify(rec));
  e.map.delete("nameless-classroom-v2.backup");
  const got = store.get();
  assert.equal(got.ch, 5, "v1 미러(정상)로 복구되어야 한다");
});

test("잘못된 상태는 저장을 거부하고 알린다", () => {
  const e = env(), store = St.createStore(e);
  assert.equal(store.set({ ch: 99 }), false);
  assert.ok(e.events.some(([n]) => n === "nameless:save-rejected"));
});

test("저장소가 막혀도 메모리에는 남는다", () => {
  const e = env();
  e.localStorage.setItem = () => { throw new Error("quota"); };
  const store = St.createStore(e);
  assert.equal(store.set(state({ ch: 4, pieces: [1, 2, 3] })), false);
  assert.equal(store.get().ch, 4);
  assert.ok(e.events.some(([n]) => n === "nameless:save-memory-only"));
});

test("clr 는 모든 슬롯과 메모리를 지운다", () => {
  const e = env(), store = St.createStore(e);
  store.set(state({ ch: 2, pieces: [1] })); store.clr();
  assert.equal(store.get(), null);
  assert.equal([...e.map.keys()].length, 0);
});

test("repair 는 되살릴 수 있는 손상만 고친다", () => {
  const bad = state({ rot: { apple: 5, compass: -1, zzz: 2 }, pieces: [1, 1, 9, 2], stack: [1, 1, 1] });
  const fixed = St.normalizeState(bad);
  assert.equal(fixed.rot.apple, 1);
  assert.equal(fixed.rot.compass, 3);
  assert.equal("zzz" in fixed.rot, false);
  assert.deepEqual(fixed.pieces, [1, 2]);
  assert.equal(fixed.stack, null);
  assert.equal(St.normalizeState({ ch: "x" }), null);
});
