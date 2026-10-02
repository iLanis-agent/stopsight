var E = require('./engine.js'), n = 0, bad = 0;
function near(a, b, tol, m) { n++; if (!(Math.abs(a - b) <= tol)) { bad++; console.log('FAIL', m, a, b); } }
function is(a, b, m) { n++; if (a !== b) { bad++; console.log('FAIL', m, a, b); } }
// Highway Code "Typical stopping distances" (gov.uk): 20 mph 12 m, 30 mph 23 m (14 m braking), 50 mph 53 m, 60 mph 73 m, 70 mph 96 m
[[20, 12], [30, 23], [40, 36], [50, 53], [60, 73], [70, 96]].forEach(function (x) { near(E.stop(x[0], 'mph', 0.67, E.SURFACES.dry, 0).total, x[1], 1, 'HC total ' + x[0]); });
near(E.stop(30, 'mph', 0.67, 0.66, 0).brake, 14, 0.5, 'HC 30 mph braking 14 m'); near(E.stop(30, 'mph', 0.67, 0.66, 0).think, 9, 0.1, 'HC 30 mph thinking 9 m');
near(E.stop(70, 'mph', 0.67, 0.66, 0).think, 21, 0.1, 'HC 70 thinking 21 m');
// unit conversion: 1 mph = 0.44704 m/s exactly; 36 km/h = 10 m/s
near(E.toMs(1, 'mph'), 0.44704, 1e-12, 'mph'); near(E.toMs(36, 'kmh'), 10, 1e-12, 'kmh'); near(E.fromMs(10, 'kmh'), 36, 1e-12, 'back kmh'); near(E.fromMs(0.44704, 'mph'), 1, 1e-12, 'back mph');
// physics: braking = v^2 / (2 mu g): 10 m/s, mu 0.5 -> 100 / (2 * 0.5 * 9.80665) = 10.197 m; thinking 1.5 s -> 15 m
var s = E.stop(36, 'kmh', 1.5, 0.5, 0); near(s.brake, 100 / (2 * 0.5 * 9.80665), 1e-9, 'brake'); near(s.think, 15, 1e-9, 'think'); near(s.total, s.think + s.brake, 1e-12, 'total'); near(s.cars, s.total / 4, 1e-12, 'cars'); near(s.totalFt, s.total / 0.3048, 1e-9, 'feet');
near(s.timeToStop, 1.5 + 10 / (0.5 * 9.80665), 1e-9, 'time');
// braking distance grows with the square of speed: double speed = 4x braking, 2x thinking
near(E.stop(60, 'mph', 1, 0.66, 0).brake / E.stop(30, 'mph', 1, 0.66, 0).brake, 4, 1e-9, 'square'); near(E.stop(60, 'mph', 1, 0.66, 0).think / E.stop(30, 'mph', 1, 0.66, 0).think, 2, 1e-9, 'linear');
// surfaces: Highway Code rule 126 says double on wet, up to ten times on ice (braking portion)
near(E.stop(30, 'mph', 0, 0.33, 0).brake / E.stop(30, 'mph', 0, 0.66, 0).brake, 2, 1e-9, 'wet 2x'); near(E.stop(30, 'mph', 0, 0.066, 0).brake / E.stop(30, 'mph', 0, 0.66, 0).brake, 10, 1e-9, 'ice 10x');
// grade: 10% downhill (mu 0.66 -> 0.56) is longer than flat; uphill shorter; too steep downhill for friction returns null
is(E.stop(30, 'mph', 0, 0.66, -10).brake > E.stop(30, 'mph', 0, 0.66, 0).brake, true, 'downhill'); is(E.stop(30, 'mph', 0, 0.66, 10).brake < E.stop(30, 'mph', 0, 0.66, 0).brake, true, 'uphill'); is(E.stop(30, 'mph', 0, 0.066, -10), null, 'slides forever');
// impact: stop in time -> no hit; 30 mph with 23 m clear is a stop; at 40 mph with 23 m clear you hit at a lower speed than 40
is(E.impact(30, 'mph', 0.67, 0.66, 0, 30).hit, false, 'safe'); near(E.impact(30, 'mph', 0.67, 0.66, 0, 30).margin, 30 - E.stop(30, 'mph', 0.67, 0.66, 0).total, 1e-9, 'margin');
var h = E.impact(40, 'mph', 0.67, 0.66, 0, 23); is(h.hit, true, '40 hit'); near(h.v, Math.sqrt(Math.pow(E.toMs(40, 'mph'), 2) - 2 * E.stop(40, 'mph', 0.67, 0.66, 0).a * (23 - E.stop(40, 'mph', 0.67, 0.66, 0).think)), 1e-9, 'impact formula');
is(E.fromMs(h.v, 'mph') < 40 && E.fromMs(h.v, 'mph') > 20, true, 'impact between');
// obstacle inside thinking distance: hit at full speed
near(E.impact(30, 'mph', 1.5, 0.66, 0, 10).v, E.toMs(30, 'mph'), 1e-12, 'full speed');
// invalid
is(E.stop(0, 'mph', 1, 0.66, 0), null, 'zero speed'); is(E.stop(30, 'mph', -1, 0.66, 0), null, 'neg reaction'); is(E.stop(30, 'mph', 1, 0, 0), null, 'zero mu'); is(E.impact(30, 'mph', 1, 0.66, 0, -1), null, 'neg dist');
console.log((n - bad) + '/' + n + ' passed'); process.exit(bad ? 1 : 0);
