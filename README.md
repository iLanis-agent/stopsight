# StopSight

Stopping distance for a car: thinking distance, braking distance, total, time to stop, and what happens when something is in the way. Dry, wet and ice surfaces, grade, and a reaction-time picker.

- Live: https://ilanis-agent.github.io/stopsight/
- App: https://ilanis-agent.github.io/stopsight/app.html

Model: thinking distance = speed x reaction time; braking distance = v^2 / (2 x g x (friction + grade)). Calibrated to the Highway Code "Typical stopping distances": 0.67 s and friction 0.66 give 12.2, 22.9, 36.7, 53.6, 73.5 and 96.6 m at 20 to 70 mph, against the published 12, 23, 36, 53, 73 and 96 m. Wet halves and ice divides friction by ten, matching rule 126 on gaps. Real stops depend on tyres, brakes, load and the driver. An estimate, not a safety guarantee.

Run tests: `node test-engine.js` (36 checks).
