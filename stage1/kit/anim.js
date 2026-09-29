/* N1K.anim — 이징·트윈·스프링. 렌더 루프 하나에서만 갱신한다(RAF 를 따로 만들지 않는다). */
(function (root) {
  "use strict";
  var K = root.N1K, A = K.anim = {};
  var PI = Math.PI;

  A.ease = {
    linear: function (t) { return t; },
    inQuad: function (t) { return t * t; },
    outQuad: function (t) { return t * (2 - t); },
    inOutQuad: function (t) { return t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t; },
    inCubic: function (t) { return t * t * t; },
    outCubic: function (t) { var u = 1 - t; return 1 - u * u * u; },
    inOutCubic: function (t) { return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2; },
    inOutSine: function (t) { return -(Math.cos(PI * t) - 1) / 2; },
    outBack: function (t) { var c1 = 1.70158, c3 = c1 + 1; return 1 + c3 * Math.pow(t - 1, 3) + c1 * Math.pow(t - 1, 2); },
    outElastic: function (t) {
      if (t === 0 || t === 1) return t;
      return Math.pow(2, -9 * t) * Math.sin((t * 10 - 0.75) * (2 * PI / 3)) + 1;
    },
    outBounce: function (t) {
      var n1 = 7.5625, d1 = 2.75;
      if (t < 1 / d1) return n1 * t * t;
      if (t < 2 / d1) return n1 * (t -= 1.5 / d1) * t + 0.75;
      if (t < 2.5 / d1) return n1 * (t -= 2.25 / d1) * t + 0.9375;
      return n1 * (t -= 2.625 / d1) * t + 0.984375;
    }
  };

  var tweens = [], updaters = [];

  /* tween({dur, delay, ease, update(k 0..1 eased), done()}) → {cancel()} */
  A.tween = function (o) {
    var tw = { t: -(o.delay || 0), dur: Math.max(0.0001, o.dur || 0.5), ease: o.ease || A.ease.inOutCubic, update: o.update, done: o.done, dead: false };
    tweens.push(tw);
    return { cancel: function () { tw.dead = true; } };
  };
  /* 매 프레임 호출되는 상시 갱신기: fn(dt, time) — 반환값 없음. 해제 함수를 돌려준다. */
  A.every = function (fn) {
    updaters.push(fn);
    return function () { var i = updaters.indexOf(fn); if (i >= 0) updaters.splice(i, 1); };
  };
  A.time = 0;
  A.update = function (dt) {
    A.time += dt;
    var i;
    for (i = tweens.length - 1; i >= 0; i--) {
      var tw = tweens[i];
      if (tw.dead) { tweens.splice(i, 1); continue; }
      tw.t += dt;
      if (tw.t < 0) continue;
      var k = Math.min(1, tw.t / tw.dur);
      if (tw.update) tw.update(tw.ease(k), k);
      if (k >= 1) { tweens.splice(i, 1); if (tw.done) tw.done(); }
    }
    for (i = 0; i < updaters.length; i++) updaters[i](dt, A.time);
  };
  A.busy = function () { return tweens.length > 0; };
  A.clear = function () { tweens.length = 0; updaters.length = 0; };

  /* 임계감쇠 스프링(값 하나). s.target 을 바꾸면 부드럽게 따라간다. */
  A.spring = function (value, k, d) {
    var s = { v: value, x: value, target: value, k: k == null ? 90 : k, d: d == null ? 2 * Math.sqrt(k == null ? 90 : k) * 0.8 : d };
    s.step = function (dt) {
      dt = Math.min(dt, 0.05);
      var a = s.k * (s.target - s.x) - s.d * s.v;
      s.v += a * dt; s.x += s.v * dt;
      return s.x;
    };
    return s;
  };
  /* 두 값을 t(0..1)로 섞고 이징을 곁들이는 보조 */
  A.mix = function (a, b, t) { return a + (b - a) * t; };
})(window);
