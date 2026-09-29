/* ============================================================================
   N1Input — 키 입력 해석 (DOM 무관, 테스트 가능)
   · 물리 키 위치(e.code)를 먼저 본다: 한글 입력기·AZERTY 자판에서도 WASD 가 같은 자리에서 먹는다.
   · e.code 가 없는 환경을 위해 e.key(영문·한글 자모)로 한 번 더 본다.
   ========================================================================== */
(function (root, factory) {
  var api = factory();
  if (typeof module === "object" && module.exports) module.exports = api;
  else root.N1Input = api;
})(typeof globalThis !== "undefined" ? globalThis : this, function () {
  "use strict";
  var MOVE_CODE = { KeyW: "w", KeyA: "a", KeyS: "s", KeyD: "d", ArrowUp: "w", ArrowLeft: "a", ArrowDown: "s", ArrowRight: "d" };
  var MOVE_KEY = { w: "w", a: "a", s: "s", d: "d", W: "w", A: "a", S: "s", D: "d", ArrowUp: "w", ArrowLeft: "a", ArrowDown: "s", ArrowRight: "d",
    "ㅈ": "w", "ㅁ": "a", "ㄴ": "s", "ㅇ": "d" };
  var ACT_CODE = { KeyC: "crouch", KeyE: "act", Space: "act", Enter: "act", NumpadEnter: "act", KeyF: "full" };
  var ACT_KEY = { c: "crouch", C: "crouch", "ㅊ": "crouch", e: "act", E: "act", "ㄷ": "act", " ": "act", Enter: "act", f: "full", F: "full", "ㄹ": "full" };

  /* 이동 키 → "w"|"a"|"s"|"d"|null */
  function move(e) { return (e.code && MOVE_CODE[e.code]) || MOVE_KEY[e.key] || null; }
  /* 동작 키 → "crouch"|"act"|"full"|null */
  function action(e) { return (e.code && ACT_CODE[e.code]) || ACT_KEY[e.key] || null; }
  /* 단말기 입력: {kind:"char", ch:"A"}|{kind:"back"}|{kind:"enter"}|null. number 모드는 숫자만. */
  function crt(e, number) {
    var m;
    if (e.code && (m = /^Key([A-Z])$/.exec(e.code))) return number ? null : { kind: "char", ch: m[1] };
    if (e.code && (m = /^(?:Digit|Numpad)([0-9])$/.exec(e.code))) return { kind: "char", ch: m[1] };
    if (e.key === "Backspace") return { kind: "back" };
    if (e.key === "Enter" || e.code === "NumpadEnter") return { kind: "enter" };
    return null;
  }
  return { move: move, action: action, crt: crt };
});
