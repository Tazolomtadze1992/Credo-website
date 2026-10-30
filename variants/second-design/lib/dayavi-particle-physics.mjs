// Independent recreation of the observed Linear /next interaction:
// a local radial displacement field with a cubic falloff and a damped return.
export const DAYAVI_MOTION = Object.freeze({ radius: .16, force: .95, stiffness: 260, damping: 30 });

export function createParticleState(homes) {
  return { homes, positions: new Float32Array(homes), velocities: new Float32Array(homes.length) };
}

export function resetParticles(state) {
  state.positions.set(state.homes);
  state.velocities.fill(0);
}

export function stepParticles(state, pointer, elapsed, radius, force, motion = DAYAVI_MOTION) {
  const { homes, positions, velocities } = state;
  const dt = Math.min(Math.max(elapsed, 0), 1 / 30);
  const steps = Math.max(1, Math.ceil(dt * 120));
  const h = dt / steps;
  let maxDisplacement = 0, maxSpeed = 0, maxTargetError = 0;
  for (let i = 0; i < homes.length; i += 2) {
    let tx = homes[i], ty = homes[i + 1];
    if (pointer.active) {
      const dx = tx - pointer.x, dy = ty - pointer.y;
      const distance = Math.hypot(dx, dy);
      if (distance < radius) {
        const falloff = (1 - distance / radius) ** 3;
        // Deterministic direction for the rare point exactly under the pointer.
        const nx = distance > .001 ? dx / distance : Math.cos(i * 2.399963);
        const ny = distance > .001 ? dy / distance : Math.sin(i * 2.399963);
        tx += nx * force * falloff;
        ty += ny * force * falloff;
      }
    }
    for (let step = 0; step < steps; step++) {
      velocities[i] += ((tx - positions[i]) * motion.stiffness - velocities[i] * motion.damping) * h;
      velocities[i + 1] += ((ty - positions[i + 1]) * motion.stiffness - velocities[i + 1] * motion.damping) * h;
      positions[i] += velocities[i] * h;
      positions[i + 1] += velocities[i + 1] * h;
    }
    maxDisplacement = Math.max(maxDisplacement, Math.abs(positions[i] - homes[i]), Math.abs(positions[i + 1] - homes[i + 1]));
    maxSpeed = Math.max(maxSpeed, Math.abs(velocities[i]), Math.abs(velocities[i + 1]));
    maxTargetError = Math.max(maxTargetError, Math.abs(positions[i] - tx), Math.abs(positions[i + 1] - ty));
  }
  return { maxDisplacement, maxSpeed, settled: maxDisplacement < .035 && maxSpeed < .12, equilibrium: maxTargetError < .035 && maxSpeed < .12 };
}
