(function (root) {
  'use strict';
  var G = 9.80665, MPH = 0.44704, KMH = 1 / 3.6, FT = 0.3048, CAR = 4;
  // Calibrated to the Highway Code "Typical stopping distances": 0.67 s thinking time and friction 0.66 on a dry road
  // give 12.2, 22.9, 36.7, 53.6, 73.5 and 96.6 m at 20 to 70 mph against the published 12, 23, 36, 53, 73 and 96 m.
  var SURFACES = { dry: 0.66, wet: 0.33, ice: 0.066 }; // Highway Code rule 126: double the gap on wet roads, up to ten times on ice
  function toMs(speed, unit) { speed = +speed; if (!(speed > 0)) return null; return unit === 'kmh' ? speed * KMH : speed * MPH; }
  function stop(speed, unit, reaction, mu, gradePct) {
    var v = toMs(speed, unit); reaction = +reaction; mu = +mu; var gr = (+gradePct || 0) / 100;
    if (v === null || !(reaction >= 0) || !(mu > 0) || !(gr > -0.5 && gr < 0.5)) return null;
    var a = G * (mu + gr); // gr > 0 uphill helps, gr < 0 downhill hurts
    if (!(a > 0)) return null;
    var think = v * reaction, brake = v * v / (2 * a);
    return { v: v, a: a, think: think, brake: brake, total: think + brake, cars: (think + brake) / CAR, totalFt: (think + brake) / FT, timeToStop: reaction + v / a };
  }
  // speed (m/s) at which you reach an obstacle `dist` metres ahead, 0 if you stop in time
  function impact(speed, unit, reaction, mu, gradePct, dist) {
    var s = stop(speed, unit, reaction, mu, gradePct); dist = +dist; if (!s || !(dist >= 0)) return null;
    if (dist >= s.total) return { v: 0, hit: false, margin: dist - s.total };
    var left = dist - s.think; // distance left when the brakes go on
    if (left <= 0) return { v: s.v, hit: true, margin: dist - s.total };
    return { v: Math.sqrt(Math.max(0, s.v * s.v - 2 * s.a * left)), hit: true, margin: dist - s.total };
  }
  function fromMs(v, unit) { return unit === 'kmh' ? v / KMH : v / MPH; }
  var api = { stop: stop, impact: impact, fromMs: fromMs, toMs: toMs, SURFACES: SURFACES, G: G };
  if (typeof module !== 'undefined' && module.exports) module.exports = api; else root.StopSight = api;
})(typeof window !== 'undefined' ? window : this);
