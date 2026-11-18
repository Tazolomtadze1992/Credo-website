/* A canvas that redraws a scene from a timeline clock.
   play() restarts the timeline at 0 and keeps drawing every frame;
   rest() stops the loop and draws the finished frame (t = Infinity). */
export function createCanvasStage(canvas, draw) {
  const ctx = canvas.getContext('2d');
  let width = 0, height = 0, dpr = 1, frame = 0, start = 0, live = false;

  const render = now => {
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, width, height);
    if (width && height) draw(ctx, { t: live ? now - start : Infinity, now: live ? now : 0, live, width, height });
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
    play() { live = true; start = performance.now(); cancelAnimationFrame(frame); frame = requestAnimationFrame(tick); },
    rest() { live = false; cancelAnimationFrame(frame); frame = 0; render(0); },
    /* redraw the resting frame, e.g. once async data has arrived */
    refresh() { if (!live) render(0); },
    destroy() { cancelAnimationFrame(frame); observer.disconnect(); },
  };
}

export const clamp01 = v => v < 0 ? 0 : v > 1 ? 1 : v;
export const progress = (t, from, duration) => clamp01((t - from) / duration);
export const easeOut = p => 1 - (1 - p) ** 3;
export const easeInOut = p => p < .5 ? 4 * p ** 3 : 1 - (-2 * p + 2) ** 3 / 2;
export const easeBack = p => { const c = 1.6; return 1 + (c + 1) * (p - 1) ** 3 + c * (p - 1) ** 2; };
export const lerp = (a, b, p) => a + (b - a) * p;

/* Deterministic pseudo-random numbers, so every replay looks the same. */
export function seeded(seed) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let x = Math.imul(a ^ (a >>> 15), 1 | a);
    x ^= x + Math.imul(x ^ (x >>> 7), 61 | x);
    return ((x ^ (x >>> 14)) >>> 0) / 4294967296;
  };
}

export const FONT = '"Georgian", system-ui, -apple-system, "Segoe UI", sans-serif';
export const COLORS = Object.freeze({ ink: '#223946', sub: '#71808a', blue: '#1e6e91', coral: '#fc6250', mist: '#b8d2e1', soft: '#7fafc9' });

const images = new Map();
/* Cached image; draw it only once `complete` (scenes redraw every frame anyway). */
export function loadImage(src) {
  if (!images.has(src)) { const image = new Image(); image.src = src; images.set(src, image); }
  return images.get(src);
}
export const FLAGS = { gr: '/assets/emigrants/flag-gr.svg', ge: '/assets/globe/flags/ge.svg' };

export function roundRect(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y); ctx.arcTo(x + w, y, x + w, y + h, r); ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r); ctx.arcTo(x, y, x + w, y, r); ctx.closePath();
}

/* A white label pill centred on (x, y): optional flag, then text. */
export function pill(ctx, x, y, text, { alpha = 1, flag, color = COLORS.ink, size = 12, weight = 500, scale = 1 } = {}) {
  if (alpha <= 0) return;
  ctx.save();
  ctx.globalAlpha = alpha;
  ctx.font = `${weight} ${size}px ${FONT}`;
  const image = flag && loadImage(flag), flagW = image ? 16 : 0, gap = image ? 6 : 0;
  const w = ctx.measureText(text).width + flagW + gap + 22, h = size + 14;
  ctx.translate(x, y); ctx.scale(scale, scale);
  ctx.shadowColor = 'rgba(27,58,74,.18)'; ctx.shadowBlur = 16; ctx.shadowOffsetY = 6;
  ctx.fillStyle = '#fff'; roundRect(ctx, -w / 2, -h / 2, w, h, h / 2); ctx.fill();
  ctx.shadowColor = 'transparent';
  ctx.strokeStyle = 'rgba(0,0,0,.05)'; ctx.lineWidth = 1; ctx.stroke();
  let left = -w / 2 + 11;
  if (image?.complete && image.naturalWidth) { ctx.drawImage(image, left, -5.5, 16, 11); }
  left += flagW + gap;
  ctx.fillStyle = color; ctx.textAlign = 'left'; ctx.textBaseline = 'middle';
  ctx.fillText(text, left, 1);
  ctx.restore();
}
