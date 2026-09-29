import test from "node:test";
import assert from "node:assert/strict";
import { createRequire } from "node:module";
const require = createRequire(import.meta.url);
const I = require("../input.js");

test("이동 키: 물리 위치(code)가 우선이라 한글 입력기 상태에서도 WASD 가 먹는다", () => {
  assert.equal(I.move({ code: "KeyW", key: "ㅈ" }), "w");
  assert.equal(I.move({ code: "KeyA", key: "Process" }), "a");
  assert.equal(I.move({ code: "ArrowLeft", key: "ArrowLeft" }), "a");
  assert.equal(I.move({ key: "ㅇ" }), "d", "code 가 없으면 자모로 본다");
  assert.equal(I.move({ key: "s" }), "s");
  assert.equal(I.move({ code: "KeyQ", key: "q" }), null);
});

test("동작 키: 숙이기 C, 조사 E·Space·Enter, 전체 화면 F", () => {
  assert.equal(I.action({ code: "KeyC", key: "ㅊ" }), "crouch");
  assert.equal(I.action({ code: "Space", key: " " }), "act");
  assert.equal(I.action({ code: "Enter", key: "Enter" }), "act");
  assert.equal(I.action({ code: "KeyE", key: "e" }), "act");
  assert.equal(I.action({ key: "ㄹ" }), "full");
  assert.equal(I.action({ code: "KeyZ", key: "z" }), null);
});

test("단말기 입력: 영문 모드는 문자와 숫자, 숫자 모드는 숫자만", () => {
  assert.deepEqual(I.crt({ code: "KeyA", key: "ㅁ" }, false), { kind: "char", ch: "A" });
  assert.deepEqual(I.crt({ code: "Digit7", key: "7" }, false), { kind: "char", ch: "7" });
  assert.deepEqual(I.crt({ code: "Numpad0", key: "0" }, true), { kind: "char", ch: "0" });
  assert.equal(I.crt({ code: "KeyA", key: "a" }, true), null, "숫자 모드에서 영문은 무시");
  assert.deepEqual(I.crt({ key: "Backspace" }, false), { kind: "back" });
  assert.deepEqual(I.crt({ key: "Enter", code: "Enter" }, true), { kind: "enter" });
  assert.deepEqual(I.crt({ code: "NumpadEnter", key: "Enter" }, false), { kind: "enter" });
  assert.equal(I.crt({ key: "Tab", code: "Tab" }, false), null);
});
