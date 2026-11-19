/* A canvas scene driven by the section's step. draw() gets the time since
   the current step started (Infinity when still: reduced motion or off
   screen, so scenes show their finished frame), the previous step, and a
   free-running clock for idle drift. */
export function createScene(canvas, draw) {
  const ctx = canvas.getContext('2d');
  let width = 0, height = 0, dpr = 1, frame = 0, running = false, instant = false;
  const state = { step: 0, prev: 0, at: 0 };

  const render = now => {
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, width, height);
    if (!width || !height) return;
    const t = running && !instant ? now - state.at : Infinity;
    draw(ctx, { t, now: running ? now : 0, live: running, width, height, step: state.step, prev: state.prev });
  };
  const tick = now => { render(now); frame = requestAnimationFrame(tick); };
  const resize = () => {
    const rect = canvas.getBoundingClientRect();
    dpr = Math.min(2, window.devicePixelRatio || 1);
    width = rect.width; height = rect.height;
    canvas.width = Math.round(width * dpr); canvas.height = Math.round(height * dpr);
    render(performance.now());
  };
  const observer = new ResizeObserver(resize);
  observer.observe(canvas);

  return {
    setStep(step, still = false) {
      if (step !== state.step) { state.prev = state.step; state.step = step; }
      state.at = performance.now(); instant = still;
      if (!running) render(performance.now());
    },
    start() { if (running) return; running = true; state.at = performance.now(); frame = requestAnimationFrame(tick); },
    stop() { running = false; cancelAnimationFrame(frame); render(performance.now()); },
    refresh() { render(performance.now()); },
    destroy() { cancelAnimationFrame(frame); observer.disconnect(); },
  };
}

export { clamp01, easeBack, easeInOut, easeOut, lerp, progress, roundRect, seeded } from '../../emigrants/steps/canvas-stage.mjs';
export const INK = [34, 57, 70], BLUE = [30, 110, 145], MIST = [127, 175, 201], CORAL = [252, 98, 80];
export const rgba = (c, a) => `rgba(${c[0]},${c[1]},${c[2]},${a})`;
export const mix = (a, b, p) => [a[0] + (b[0] - a[0]) * p, a[1] + (b[1] - a[1]) * p, a[2] + (b[2] - a[2]) * p].map(Math.round);
export const FONT = 'Georgian, "Helvetica Neue", Arial, sans-serif';
