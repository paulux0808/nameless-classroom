/* ============================================================================
   N1Voice — 글자에서 "입 모양"을 뽑는다(소리는 없다). 감독교사가 말할 때 입을 움직이는 데 쓴다.
   · 한글 음절 하나 = 모음(벌림·너비) + 초성·종성의 입술소리(ㅁㅂㅍ)는 그 끝에서 입을 다문다.
   · 공백·쉼표·마침표는 짧은 쉼. 그 밖의 글자는 무시한다.
   THREE 도 화면도 모르는 순수한 계산이라 노드에서 그대로 시험한다.
   ========================================================================== */
(function (root, factory) {
  if (typeof module === "object" && module.exports) module.exports = factory();
  else root.N1Voice = factory();
})(typeof window !== "undefined" ? window : globalThis, function () {
  "use strict";

  /* 한글 모음 21개 [벌림 0..1, 너비 -1(오므림)..1(옆으로)] — ㅏㅐㅑㅒㅓㅔㅕㅖㅗㅘㅙㅚㅛㅜㅝㅞㅟㅠㅡㅢㅣ */
  var VOW = [[1, 0], [0.72, 0.25], [1, 0], [0.72, 0.25], [0.82, -0.1], [0.6, 0.35], [0.82, -0.1], [0.6, 0.35], [0.55, -0.6], [0.85, -0.3], [0.7, -0.1],
    [0.5, -0.3], [0.55, -0.6], [0.4, -0.7], [0.62, -0.4], [0.55, -0.2], [0.4, -0.4], [0.4, -0.7], [0.3, 0.55], [0.3, 0.3], [0.28, 0.7]];
  var SYL = 0.105;                                             /* 한 음절 길이(초). 말풍선이 떠 있는 시간과 비슷하게 맞춘다 */
  var LATIN = 0.5;                                             /* 영문·숫자 한 글자의 벌림 */

  function smooth(t) { t = t < 0 ? 0 : t > 1 ? 1 : t; return t * t * (3 - 2 * t); }
  /* 초성 ㅁ(6)ㅂ(7)ㅃ(8)ㅍ(17), 종성 ㅁ(16)ㅂ(17)ㅄ(18)ㅍ(26)은 입술을 다무는 소리 */
  function lipStart(cho) { return cho === 6 || cho === 7 || cho === 8 || cho === 17; }
  function lipEnd(jong) { return jong === 16 || jong === 17 || jong === 18 || jong === 26; }

  /* 글 → { seq: [{ t0, t1, a, w, b0, b1 }], end }. rnd 는 0..1 난수(시험에서 고정할 수 있게) */
  function parse(text, rnd) {
    rnd = rnd || Math.random;
    var seq = [], t = 0;
    Array.from(String(text == null ? "" : text)).forEach(function (ch) {
      var c = ch.charCodeAt(0);
      if (c >= 0xac00 && c <= 0xd7a3) {
        var idx = c - 0xac00, jong = idx % 28, jung = Math.floor((idx % 588) / 28), cho = Math.floor(idx / 588), v = VOW[jung], b1 = lipEnd(jong);
        var dur = SYL * (jong ? 1.12 : 1);
        seq.push({ t0: t, t1: t + dur, a: v[0] * (jong && !b1 ? 0.88 : 1) * (0.85 + rnd() * 0.3), w: v[1], b0: lipStart(cho), b1: b1 });
        t += dur;
      } else if (/[A-Za-z0-9]/.test(ch)) { seq.push({ t0: t, t1: t + SYL, a: LATIN, w: 0, b0: false, b1: false }); t += SYL; }
      else if (ch === " ") t += 0.03;
      else if (ch === "," || ch === ";" || ch === "·") t += 0.16;
      else if (ch === "." || ch === "?" || ch === "!" || ch === "…" || ch === "—") t += 0.28;
    });
    return { seq: seq, end: t };
  }

  /* u 초 시점의 입: 음절 하나를 [올라오기 → 유지 → 내려오기]로 그린다. 입술소리의 끝은 0 까지 다문다.
     from 은 지난번 결과의 i(앞 음절부터 다시 훑지 않게). 끝나면 done. */
  function sample(seq, u, from) {
    var i = from || 0;
    while (i < seq.length && u >= seq[i].t1) i++;
    if (i >= seq.length) return { a: 0, w: 0, i: i, over: true };
    var g = seq[i];
    if (u < g.t0) return { a: 0, w: 0, i: i, over: false };
    var k = (u - g.t0) / (g.t1 - g.t0), lo0 = g.b0 ? 0 : 0.38, lo1 = g.b1 ? 0 : 0.38;
    var rise = lo0 + (1 - lo0) * smooth(k / 0.3), fall = lo1 + (1 - lo1) * smooth((1 - k) / 0.3);
    return { a: g.a * rise * fall, w: g.w, i: i, over: false };
  }

  return { VOW: VOW, SYL: SYL, parse: parse, sample: sample };
});
