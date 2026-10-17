import { createParticleState, resetParticles, stepParticles, DAYAVI_MOTION } from './dayavi-particle-physics.mjs';

let dataPromise;
function loadDots() {
  if (!dataPromise) dataPromise = fetch('/assets/dayavi/dayavi-dither-v2.json')
    .then(response => { if (!response.ok) throw new Error('Logo coordinates unavailable'); return response.json(); })
    .catch(error => { dataPromise = null; throw error; });
  return dataPromise;
}
const DEFAULTS = Object.freeze({ zoom: 1, dotScale: .83, radius: DAYAVI_MOTION.radius, force: DAYAVI_MOTION.force, opacity: .95 });
const clamp = (value, min, max) => Math.min(max, Math.max(min, value));

/** Source-derived dot geometry with a local cursor field.
 * One canvas bitmap avoids thousands of animated DOM nodes. Frames sleep
 * at equilibrium, offscreen and in hidden tabs. No ambient motion.
 */
export function createDayaviParticles({ root, canvas, forceStatic = false }) {
  const card = root.closest('.product-split');
  const finePointer = window.matchMedia('(hover:hover) and (pointer:fine)');
  const context = forceStatic ? null : canvas.getContext('2d', { alpha: true });
  let disposed = false, visible = false, ready = false, data, state, ranges;
  let width = 0, height = 0, pixelRatio = 1, bounds, logoWidth = 0, logoHeight = 0, left = 0, top = 0;
  let frame = 0, previous = 0, moving = false, frames = 0, diagnosticAt = 0;
  let paintTotal = 0, paintCount = 0, config = { ...DEFAULTS };
  const pointer = { x: -1000, y: -1000, active: false };
  if (!context) {
    root.dataset.particlesRenderer = 'svg'; root.dataset.particlesState = 'static';
    return { update() {}, dispose() {} };
  }
  root.dataset.particlesRenderer = 'canvas2d';

  function paint() {
    if (!ready || disposed || !width || !height) return;
    context.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);
    context.clearRect(0, 0, width, height);
    context.globalAlpha = config.opacity;
    const size = logoWidth / data.width * config.dotScale, half = size / 2;
    // Batch the two source colors; fillStyle never changes per dot.
    for (const range of ranges) {
      context.fillStyle = range.color;
      for (let i = range.start; i < range.end; i += 2) {
        context.fillRect(state.positions[i] - half, state.positions[i + 1] - half, size, size);
      }
    }
    root.dataset.particlesReady = 'true';
  }
  const canPlay = () => ready && !disposed && visible && document.visibilityState !== 'hidden';
  function wake() {
    if (canPlay() && !frame) { previous = 0; frame = requestAnimationFrame(tick); }
  }
  function tick(now) {
    frame = 0;
    if (!canPlay()) { previous = 0; return; }
    const delta = previous ? (now - previous) / 1000 : 1 / 60;
    previous = now;
    const started = performance.now(), radius = logoWidth * config.radius;
    const metrics = stepParticles(state, pointer, delta, radius, radius * config.force);
    moving = !metrics.equilibrium;
    if (metrics.settled && !pointer.active) resetParticles(state);
    paint(); frames++;
    paintTotal += performance.now() - started; paintCount++;
    if (now - diagnosticAt > 200 || metrics.equilibrium) {
      root.dataset.particlesFrames = String(frames);
      root.dataset.particlesDisplacement = metrics.maxDisplacement.toFixed(2);
      root.dataset.particlesFrameMs = (paintTotal / paintCount).toFixed(2);
      root.dataset.particlesState = pointer.active ? 'interacting' : moving ? 'returning' : 'rest';
      diagnosticAt = now;
    }
    if (moving) frame = requestAnimationFrame(tick);
    else previous = 0;
  }
  function resize() {
    if (disposed) return;
    bounds = root.getBoundingClientRect(); width = bounds.width; height = bounds.height;
    if (!width || !height) return;
    pixelRatio = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = Math.round(width * pixelRatio); canvas.height = Math.round(height * pixelRatio);
    if (!ready) return;
    const heading = card?.querySelector('.product-heading')?.getBoundingClientRect();
    const clearTop = heading ? heading.bottom - bounds.top + 44 : 112;
    const ratio = data.width / data.height;
    logoWidth = Math.min(width * .74, 455, Math.max(100, height - clearTop - 60) * ratio) * config.zoom;
    logoHeight = logoWidth / ratio; left = (width - logoWidth) / 2;
    top = clearTop + (height - clearTop) / 2 - logoHeight / 2 - 4;
    const homes = new Float32Array(data.groups.reduce((total, group) => total + group.length, 0));
    ranges = []; let index = 0;
    data.groups.forEach((group, role) => {
      const start = index;
      for (let i = 0; i < group.length; i += 2) {
        homes[index++] = left + (group[i] + .5) / data.width * logoWidth;
        homes[index++] = top + (group[i + 1] + .5) / data.height * logoHeight;
      }
      ranges.push({ start, end: index, color: data.colors[role] });
    });
    state = createParticleState(homes); moving = false;
    root.style.setProperty('--dayavi-logo-width', `${logoWidth}px`);
    root.style.setProperty('--dayavi-logo-top', `${top}px`);
    root.dataset.particlesCount = String(homes.length / 2);
    root.dataset.particlesLogoWidth = logoWidth.toFixed(1);
    root.dataset.particlesRadius = (logoWidth * config.radius).toFixed(1);
    root.dataset.particlesState = 'rest'; paint(); if (pointer.active) wake();
  }
  function move(event) {
    if (!ready || event.pointerType === 'touch' || !finePointer.matches) return;
    pointer.x = event.clientX - bounds.left; pointer.y = event.clientY - bounds.top;
    const radius = logoWidth * config.radius, wasActive = pointer.active;
    pointer.active = pointer.x > left - radius && pointer.x < left + logoWidth + radius
      && pointer.y > top - radius && pointer.y < top + logoHeight + radius;
    root.dataset.particlesPointer = pointer.active ? 'active' : 'idle';
    if (pointer.active || wasActive || moving) wake();
  }
  function enter(event) { bounds = root.getBoundingClientRect(); move(event); }
  function leave() {
    const wasActive = pointer.active;
    pointer.active = false; root.dataset.particlesPointer = 'idle';
    if (wasActive || moving) wake();
  }
  const refreshBounds = () => { if (visible) bounds = root.getBoundingClientRect(); };
  function reconcile() {
    if (!canPlay()) {
      cancelAnimationFrame(frame); frame = 0; previous = 0; pointer.active = false; moving = false;
      if (state) { resetParticles(state); paint(); }
      if (ready) root.dataset.particlesState = 'paused';
    } else { root.dataset.particlesState = 'rest'; paint(); }
  }
  const resized = new ResizeObserver(resize); resized.observe(root);
  const intersection = new IntersectionObserver(([entry]) => { visible = entry.isIntersecting; reconcile(); }, { threshold: .01 });
  intersection.observe(root);
  card?.addEventListener('pointerenter', enter); card?.addEventListener('pointermove', move, { passive: true }); card?.addEventListener('pointerleave', leave);
  finePointer.addEventListener('change', leave); window.addEventListener('scroll', refreshBounds, { passive: true }); document.addEventListener('visibilitychange', reconcile);
  const contextLost = event => {
    event.preventDefault(); cancelAnimationFrame(frame); frame = 0; ready = false;
    root.dataset.particlesReady = 'false'; root.dataset.particlesRenderer = 'svg'; root.dataset.particlesState = 'static';
  };
  const contextRestored = () => { if (data && !disposed) { ready = true; root.dataset.particlesRenderer = 'canvas2d'; resize(); reconcile(); } };
  canvas.addEventListener('contextlost', contextLost); canvas.addEventListener('contextrestored', contextRestored);
  root.dataset.particlesPointer = 'idle'; resize();
  loadDots().then(loaded => {
    if (disposed) return;
    data = loaded; ready = true; resize(); reconcile();
  }).catch(() => { if (!disposed) { root.dataset.particlesRenderer = 'svg'; root.dataset.particlesState = 'static'; } });
  return {
    update(values) {
      config = { zoom: clamp(values.zoom ?? config.zoom, .6, 1.25), dotScale: clamp(values.dotScale ?? config.dotScale, .4, 1.1),
        radius: clamp(values.radius ?? config.radius, .12, .4), force: clamp(values.force ?? config.force, .2, 1.5), opacity: clamp(values.opacity ?? config.opacity, .4, 1) };
      resize();
    },
    dispose() {
      disposed = true; cancelAnimationFrame(frame); resized.disconnect(); intersection.disconnect();
      card?.removeEventListener('pointerenter', enter); card?.removeEventListener('pointermove', move); card?.removeEventListener('pointerleave', leave);
      finePointer.removeEventListener('change', leave); window.removeEventListener('scroll', refreshBounds); document.removeEventListener('visibilitychange', reconcile);
      canvas.removeEventListener('contextlost', contextLost); canvas.removeEventListener('contextrestored', contextRestored);
    },
  };
}
