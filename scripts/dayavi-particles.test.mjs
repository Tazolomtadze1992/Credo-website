import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { createParticleState, stepParticles } from '../lib/dayavi-particle-physics.mjs';

const cursor = { x: 0, y: 0, active: true };
function advance(state, pointer, seconds = 2, fps = 60) {
  let metrics;
  for (let i = 0; i < Math.round(seconds * fps); i++) metrics = stepParticles(state, pointer, 1 / fps, 100, 85);
  return metrics;
}

test('the cursor field fades locally and leaves distant artwork untouched', () => {
  const state = createParticleState(new Float32Array([20, 0, 50, 0, 80, 0, 120, 0]));
  const result = advance(state, cursor);
  assert.ok(result.equilibrium, 'a stationary pointer must let the frame loop sleep');
  const offsets = [0, 2, 4].map(i => state.positions[i] - state.homes[i]);
  assert.ok(offsets[0] > offsets[1] && offsets[1] > offsets[2] && offsets[2] > 0);
  assert.equal(state.positions[6], 120);
  assert.equal(state.velocities[6], 0);
});

test('a dot exactly under the pointer never produces NaN or infinity', () => {
  const state = createParticleState(new Float32Array([0, 0]));
  advance(state, cursor);
  assert.ok([...state.positions, ...state.velocities].every(Number.isFinite));
  assert.ok(state.positions[0] > 80);
});

test('release restores the source geometry and reaches a sleeping state', () => {
  const state = createParticleState(new Float32Array([0, 0, 20, 10, 80, 0, 120, 0]));
  advance(state, cursor);
  const result = advance(state, { ...cursor, active: false });
  assert.ok(result.settled && result.equilibrium);
  state.positions.forEach((value, i) => assert.ok(Math.abs(value - state.homes[i]) < .035));
});

test('reversing the cursor continues from the live position and velocity', () => {
  const state = createParticleState(new Float32Array([20, 0]));
  advance(state, cursor, .2);
  const before = state.positions[0];
  assert.ok(before > 50);
  stepParticles(state, { x: 60, y: 0, active: true }, 1 / 120, 100, 85);
  assert.ok(Math.abs(state.positions[0] - before) < 3, 'interrupting must not reset to the source or new target');
  advance(state, { x: 60, y: 0, active: true });
  assert.ok(state.positions[0] < state.homes[0], 'the new direction must take effect');
});

test('30, 60 and 120Hz use equivalent substeps; a long resumed frame stays finite', () => {
  const states = [30, 60, 120].map(fps => {
    const state = createParticleState(new Float32Array([20, 10, 50, 0]));
    advance(state, cursor, .5, fps);
    return state;
  });
  states[0].positions.forEach((value, i) => {
    assert.ok(Math.abs(value - states[1].positions[i]) < .001);
    assert.ok(Math.abs(value - states[2].positions[i]) < .001);
  });
  stepParticles(states[0], { ...cursor, active: false }, 60, 100, 85);
  assert.ok([...states[0].positions, ...states[0].velocities].every(Number.isFinite));
});

test('saved coordinates belong to the supplied image and preserve all three source tiles', () => {
  const base = new URL('../public/assets/dayavi/', import.meta.url);
  const source = readFileSync(new URL('source-logo.png', base));
  const dots = JSON.parse(readFileSync(new URL('dayavi-dither-v2.json', base)));
  assert.equal(dots.sourceSHA256, createHash('sha256').update(source).digest('hex'));
  assert.deepEqual(dots.sourceCrop, [9, 9, 439, 148]);
  assert.ok(dots.sourceCrop[3] < dots.sourceSize[1], 'the lower bank lockup must be excluded');
  const unique = new Set(), thirds = [0, 0, 0];
  for (const group of dots.groups) {
    assert.equal(group.length % 2, 0);
    for (let i = 0; i < group.length; i += 2) {
      const x = group[i], y = group[i + 1], key = `${x}:${y}`;
      assert.ok(x >= 0 && x < dots.width && y >= 0 && y < dots.height);
      assert.ok(!unique.has(key), 'each sample is drawn once');
      unique.add(key); thirds[Math.floor(x / (dots.width / 3))]++;
    }
  }
  assert.equal(unique.size, 12279);
  thirds.forEach(count => assert.ok(count > 3000, 'every tile remains represented'));
});
