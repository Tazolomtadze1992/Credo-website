import { pill } from '../../emigrants/steps/canvas-stage.mjs';
import { BLUE, CORAL, MIST, clamp01, createScene, easeBack, easeInOut, easeOut, lerp, mix, progress, rgba, seeded } from './canvas.mjs';

/* C — one cloud of points that becomes each step in turn:
   a land-dot globe with a Berlin → Tbilisi call arc, the passport data page,
   the customer's face being scanned, and finally the card.
   Every point keeps its index, so changing step is a flight, not a cut. */

const N = 3600, RAD = Math.PI / 180;
const rand = seeded(11);
const SEEDS = Array.from({ length: N }, () => ({ s: rand(), a: rand() * Math.PI * 2, r: rand() - .5 }));
const shuffle = list => { const r = seeded(list.length); for (let i = list.length - 1; i > 0; i--) { const j = Math.floor(r() * (i + 1)); [list[i], list[j]] = [list[j], list[i]]; } return list; };

/* A shape is N targets: position (x, y down, z), alpha, tone (1 = coral),
   size, and an arrival delay in ms. */
function blank() {
  return { x: new Float32Array(N), y: new Float32Array(N), z: new Float32Array(N), a: new Float32Array(N), c: new Float32Array(N), s: new Float32Array(N).fill(1), d: new Float32Array(N) };
}
/* Fill a shape from a list of point specs, padding with the last group. */
function fromList(list) {
  const shape = blank(), order = shuffle([...Array(N).keys()]);
  for (let k = 0; k < N; k++) {
    const p = list[k % list.length], i = order[k];
    shape.x[i] = p.x; shape.y[i] = p.y; shape.z[i] = p.z || 0; shape.a[i] = k < list.length ? p.a : p.a * .5;
    shape.c[i] = p.c || 0; shape.s[i] = p.s || 1; shape.d[i] = p.d || 0;
  }
  return shape;
}
const line = (out, x0, y0, x1, y1, gap, spec) => {
  const len = Math.hypot(x1 - x0, y1 - y0), n = Math.max(1, Math.round(len / gap));
  for (let k = 0; k <= n; k++) out.push({ x: lerp(x0, x1, k / n), y: lerp(y0, y1, k / n), ...spec(lerp(x0, x1, k / n), k / n) });
};
function roundedRect(out, w, h, r, gap, spec) {
  const segs = [];
  const arc = (cx, cy, from) => { for (let k = 0; k <= 6; k++) { const a = (from + k * 15) * RAD; segs.push([cx + Math.cos(a) * r, cy + Math.sin(a) * r]); } };
  const L = -w / 2, R = w / 2, T = -h / 2, B = h / 2;
  arc(R - r, T + r, -90); arc(R - r, B - r, 0); arc(L + r, B - r, 90); arc(L + r, T + r, 180); segs.push(segs[0]);
  let along = 0; const total = 2 * (w + h);
  for (let k = 0; k < segs.length - 1; k++) {
    const [x0, y0] = segs[k], [x1, y1] = segs[k + 1], len = Math.hypot(x1 - x0, y1 - y0), n = Math.max(1, Math.round(len / gap));
    for (let j = 0; j < n; j++) { const f = j / n; out.push({ x: lerp(x0, x1, f), y: lerp(y0, y1, f), ...spec((along + len * f) / total) }); }
    along += len;
  }
}

/* ── shapes ───────────────────────────────────────────── */

const scatter = (() => {
  const shape = blank();
  for (let i = 0; i < N; i++) {
    const u = SEEDS[i].a, v = Math.acos(2 * SEEDS[i].s - 1), r = .5 + Math.abs(SEEDS[i].r) * 1.6;
    shape.x[i] = Math.sin(v) * Math.cos(u) * r * 1.4; shape.y[i] = Math.cos(v) * r * .8; shape.z[i] = Math.sin(v) * Math.sin(u) * r;
    shape.a[i] = 0; shape.s[i] = .8;
  }
  return shape;
})();

function passportShape() {
  const out = [], W = 1.56, H = 1.06, L = -W / 2 + .1, wr = x => (x + .8) / 1.6 * 900;
  roundedRect(out, W, H, .05, .018, f => ({ a: .75, d: f * 700 }));
  line(out, L, -.41, L + .5, -.41, .02, x => ({ a: .55, d: wr(x) }));
  const px0 = L, px1 = L + .42, py0 = -.31, py1 = .25;
  const frame = [];
  roundedRect(frame, .42, .56, .02, .022, () => ({ a: .5, d: 200 }));
  for (const p of frame) out.push({ ...p, x: p.x + (px0 + px1) / 2, y: p.y + (py0 + py1) / 2 });
  for (let gx = px0 + .03; gx < px1 - .02; gx += .024) for (let gy = py0 + .03; gy < py1 - .01; gy += .024) {
    const head = Math.hypot(gx - (px0 + .21), (gy - (py0 + .2)) / 1.15) < .1;
    const body = gy > py0 + .36 && Math.hypot((gx - (px0 + .21)) / 1.5, gy - (py1 + .02)) < .2;
    if (head || body) out.push({ x: gx, y: gy, a: .85, d: 350 + (gy - py0) * 600 });
  }
  const fx = L + .54;
  for (let k = 0; k < 5; k++) {
    const y = -.28 + k * .12, len = [.48, .36, .52, .3, .42][k];
    line(out, fx, y - .035, fx + .16, y - .035, .02, x => ({ a: .32, s: .8, d: wr(x) }));
    line(out, fx, y + .01, fx + len, y + .01, .015, x => ({ a: .9, s: 1.1, d: wr(x) + 120 }));
  }
  for (const y of [.36, .44]) line(out, L, y, -L, y, .0135, x => ({ a: .75, s: .9, d: 700 + wr(x) * .6 }));
  for (let k = 0; out.length < N; k++) {
    const row = k % 14, y = -.47 + row * .072, x = -.76 + (Math.floor(k / 14) % 110) * .0139;
    out.push({ x, y: y + Math.sin(x * 9 + row) * .018, a: .1, s: .7, d: wr(x) * .5 });
  }
  return fromList(out);
}

function cardShape() {
  const out = [], W = 1.62, H = 1.02, L = -W / 2 + .1, T = -H / 2;
  const rad = (x, y) => Math.hypot(x, y) * 700;
  roundedRect(out, W, H, .07, .016, f => ({ a: .85, d: 100 + f * 500 }));
  line(out, L, T + .14, L + .36, T + .14, .016, x => ({ a: 1, s: 1.15, d: rad(x, T) }));
  line(out, L + .4, T + .14, L + .5, T + .14, .016, x => ({ a: 1, c: 1, s: 1.15, d: rad(x, T) }));
  for (let gx = 0; gx < 10; gx++) for (let gy = 0; gy < 8; gy++) out.push({ x: L + gx * .022, y: -.16 + gy * .021, a: gx === 0 || gx === 9 || gy === 0 || gy === 7 || gy === 4 ? .9 : .35, d: 300 });
  for (let k = 0; k < 3; k++) for (let j = 0; j <= 10; j++) { const a = (-50 + j * 10) * RAD, r = .04 + k * .028; out.push({ x: L + .3 + Math.cos(a) * r, y: -.08 + Math.sin(a) * r, a: .6, d: 320 }); }
  for (let g = 0; g < 4; g++) line(out, L + g * .26, .2, L + g * .26 + .2, .2, .0145, x => ({ a: 1, s: 1.2, d: 300 + rad(x, .2) }));
  line(out, L, .34, L + .38, .34, .016, x => ({ a: .7, d: 400 + rad(x, .34) }));
  const mx = .47, my = .2;
  for (const [r, n, a] of [[.21, 80, .95], [.165, 64, .7]]) for (let k = 0; k < n; k++) { const t = k / n * Math.PI * 2; out.push({ x: mx + Math.cos(t) * r, y: my + Math.sin(t) * r, a, c: 1, d: 500 + k * 4 }); }
  for (let k = 0; k < 200; k++) { const t = k / 200 * Math.PI * 2, r = .03 + .1 * Math.abs(Math.cos(4 * t)); out.push({ x: mx + Math.cos(t) * r, y: my + Math.sin(t) * r, a: .85, c: 1, s: .9, d: 600 + k * 2 }); }
  for (let k = 0; out.length < N; k++) {
    const row = k % 18, col = Math.floor(k / 18) % 150, x = -.78 + col * .0105, y0 = -.44 + row * .052;
    const env = Math.sin((x + .8) / 1.6 * Math.PI);
    const y = y0 + Math.sin(x * 7 + row * .6) * .025 * env;
    if (Math.hypot(x - mx, y - my) < .23) continue;
    out.push({ x, y, a: .14 + (row / 18) * .22, s: .75, d: rad(x, y) });
  }
  return fromList(out);
}

/* Head points baked at the scan's pose, like the emigrants scan. */
function headShape(raw) {
  const yaw = .62, pitch = .06, cyaw = Math.cos(yaw), syaw = Math.sin(yaw), cp = Math.cos(pitch), sp = Math.sin(pitch);
  const l = Math.hypot(.7, .45, .75), light = [.7 / l, .45 / l, .75 / l];
  const out = [], r = seeded(5);
  for (let i = 0; i < raw.length; i += 6) {
    const x = raw[i] / 20000, y = raw[i + 1] / 20000, z = raw[i + 2] / 20000, nx0 = raw[i + 3] / 32767, ny0 = raw[i + 4] / 32767, nz0 = raw[i + 5] / 32767;
    const rx = x * cyaw + z * syaw, rz0 = -x * syaw + z * cyaw, ry = y * cp - rz0 * sp, rz = y * sp + rz0 * cp;
    const nx = nx0 * cyaw + nz0 * syaw, nzz = -nx0 * syaw + nz0 * cyaw, ny = ny0 * cp - nzz * sp, nz = ny0 * sp + nzz * cp;
    if (nz < -.05) continue;
    const lit = Math.max(0, nx * light[0] + ny * light[1] + nz * light[2]), fade = clamp01((y + 1.12) / .42);
    const a = clamp01((nz + .1) / .45) * (.18 + .82 * lit) * fade;
    if (a < .06) continue;
    out.push({ x: (rx - .1) * .92, y: -(ry - .1) * .92, z: rz, a, s: .55 + .75 * lit, d: (1 - (y + 1.12) / 2.2) * 300 + r() * 700, oy: y });
  }
  const pick = shuffle(out).slice(0, N).sort((p, q) => p.oy - q.oy);
  return fromList(pick);
}

let land = null, head = null;
function loadAssets(onReady) {
  if (!head) fetch('/assets/emigrants/head-scan.bin').then(r => r.ok ? r.arrayBuffer() : null).then(b => { if (b) { head = headShape(new Int16Array(b)); onReady(); } }).catch(() => {});
  if (!land) {
    const image = new Image();
    image.onload = () => {
      const c = document.createElement('canvas'); c.width = image.width; c.height = image.height;
      const g = c.getContext('2d', { willReadFrequently: true }); g.drawImage(image, 0, 0);
      const { data } = g.getImageData(0, 0, c.width, c.height), list = [], count = 60000;
      for (let i = 0; i < count; i++) {
        const y = 1 - (i + .5) / count * 2, lat = Math.asin(y), lon = (i * 2.399963229728653) % (Math.PI * 2);
        const px = Math.min(c.width - 1, Math.floor(lon / (Math.PI * 2) * c.width)), py = Math.min(c.height - 1, Math.floor((.5 - lat / Math.PI) * c.height));
        if (data[(py * c.width + px) * 4 + 3]) list.push([lat, lon > Math.PI ? lon - Math.PI * 2 : lon]);
      }
      land = list; onReady();
    };
    image.src = '/assets/globe/land-mask.png';
  }
}

/* Globe targets move (it turns), so they're computed per frame. */
const BERLIN = [52.52 * RAD, 13.4 * RAD], TBILISI = [41.72 * RAD, 44.83 * RAD];
const ARC = 220;
const globeSpec = (() => {
  const toV = ([la, lo]) => [Math.cos(la) * Math.sin(lo), Math.sin(la), Math.cos(la) * Math.cos(lo)];
  const A = toV(BERLIN), B = toV(TBILISI), dot = A[0] * B[0] + A[1] * B[1] + A[2] * B[2], om = Math.acos(dot), so = Math.sin(om);
  const arc = [];
  for (let k = 0; k < ARC; k++) {
    const s = k / (ARC - 1), k0 = Math.sin((1 - s) * om) / so, k1 = Math.sin(s * om) / so;
    const v = [A[0] * k0 + B[0] * k1, A[1] * k0 + B[1] * k1, A[2] * k0 + B[2] * k1];
    arc.push({ lat: Math.asin(v[1]), lon: Math.atan2(v[0], v[2]), alt: Math.sin(s * Math.PI) * .16, s });
  }
  return { arc, order: shuffle([...Array(N).keys()]) };
})();
const globe = blank();
function evalGlobe(now, t) {
  const lat0 = 34 * RAD, lon0 = (26 + Math.sin(now / 1000 * .12) * 7) * RAD, sl0 = Math.sin(lat0), cl0 = Math.cos(lat0);
  const reveal = easeInOut(progress(t, 1300, 1300));
  const project = (lat, lon, r) => {
    const cl = Math.cos(lat), dl = lon - lon0;
    return [cl * Math.sin(dl) * r, -(cl0 * Math.sin(lat) - sl0 * cl * Math.cos(dl)) * r, sl0 * Math.sin(lat) + cl0 * cl * Math.cos(dl)];
  };
  for (let k = 0; k < N; k++) {
    const i = globeSpec.order[k];
    let lat, lon, r = 1, a, c = 0, s = 1;
    if (k < ARC) {
      const p = globeSpec.arc[k]; lat = p.lat; lon = p.lon; r = 1 + p.alt; c = 1; s = 1.15;
      a = p.s <= reveal ? 1 : 0;
    } else if (land) {
      [lat, lon] = land[(k * 7919) % land.length]; a = 1;
    } else {
      lat = Math.asin(2 * SEEDS[i].s - 1); lon = SEEDS[i].a; a = .4;
    }
    const [x, y, z] = project(lat, lon, r * .98);
    globe.x[i] = x; globe.y[i] = y; globe.z[i] = z;
    if (k >= ARC) { const f = z < 0 ? .07 : .25 + .75 * z; a *= f; s = .7 + .4 * Math.max(0, z); }
    globe.a[i] = a; globe.c[i] = c; globe.s[i] = s;
    globe.d[i] = k < ARC ? 0 : (1 - z) * 250 + SEEDS[i].s * 500;
  }
  return { project, lon0 };
}

const passport = passportShape(), card = cardShape();

/* ── draw ─────────────────────────────────────────────── */

const BUCKETS = 14;
const blue = Array.from({ length: BUCKETS }, () => []), coral = Array.from({ length: BUCKETS }, () => []);
function corner(ctx, x, y, sx, sy, len, r) { ctx.moveTo(x, y + sy * len); ctx.lineTo(x, y + sy * r); ctx.quadraticCurveTo(x, y, x + sx * r, y); ctx.lineTo(x + sx * len, y); }

export function createParticles(canvas) {
  let scene;
  scene = createScene(canvas, (ctx, { t, now, live, width, height, step, prev }) => {
    const U = Math.min(width * .3, height * .36), cx = width / 2, cy = height * .47;
    const g = step === 0 || prev === 0 ? evalGlobe(now, step === 0 ? t : Infinity) : null;
    const SHAPES = [globe, passport, head || scatter, card];
    const to = SHAPES[step], from = prev === step ? scatter : SHAPES[prev];
    const sway = live ? Math.sin(now / 1000 * .5) * .16 : 0;
    const yaw = step === 0 ? 0 : sway + (step === 2 ? 0 : -.12), pitch = step === 1 || step === 3 ? .1 : 0;
    const cyw = Math.cos(yaw), syw = Math.sin(yaw), cpt = Math.cos(pitch), spt = Math.sin(pitch);
    const scanP = step === 2 ? progress(t, 2000, 1900) : 0, scanY = -1.15 + scanP * 2.3;
    const sheen = step === 3 ? progress(t, 2500, 1300) : 0;
    const base = U * .0085;

    for (let b = 0; b < BUCKETS; b++) { blue[b].length = 0; coral[b].length = 0; }
    for (let i = 0; i < N; i++) {
      const sd = SEEDS[i];
      const p = easeInOut(progress(t, to.d[i] + sd.s * 220, 1250));
      const q = 1 - p, arcLift = Math.sin(p * Math.PI);
      let x = from.x[i] * q + to.x[i] * p + Math.cos(sd.a) * arcLift * .22 * sd.r * 2;
      let y = from.y[i] * q + to.y[i] * p + Math.sin(sd.a) * arcLift * .22 * sd.r * 2;
      let z = from.z[i] * q + to.z[i] * p;
      let a = from.a[i] * q + to.a[i] * p, c = from.c[i] * q + to.c[i] * p, s = from.s[i] * q + to.s[i] * p;
      if (scanP > 0 && scanP < 1 && p >= 1) {
        const band = clamp01(1 - Math.abs(y - scanY) / .14);
        if (band > 0) { c = Math.max(c, band); a = Math.max(a, .4 + .6 * band); s += band * .7; x += band * .03; }
      }
      if (sheen > 0 && sheen < 1) { const d = Math.abs(x + y * .6 - lerp(-1.6, 1.6, easeInOut(sheen))); if (d < .16) a = Math.min(1, a + (1 - d / .16) * .5); }
      if (step !== 0 || p < 1) {
        const rx = x * cyw + z * syw, rz = -x * syw + z * cyw, ry = y * cpt - rz * spt, rz2 = y * spt + rz * cpt;
        const f = 1 / (1 + rz2 * .14); x = rx * f; y = ry * f; s *= f;
      }
      if (a < .025) continue;
      const bucket = Math.min(BUCKETS - 1, Math.round(a * (BUCKETS - 1)));
      (c > .5 ? coral : blue)[bucket].push(cx + x * U, cy + y * U, base * s);
    }
    for (const [list, tone] of [[blue, 0], [coral, 1]]) for (let b = 1; b < BUCKETS; b++) {
      const items = list[b]; if (!items.length) continue;
      const a = b / (BUCKETS - 1);
      ctx.fillStyle = tone ? rgba(CORAL, a) : rgba(mix(MIST, BLUE, Math.min(1, a * 1.3)), Math.min(1, a * 1.1));
      ctx.beginPath();
      for (let k = 0; k < items.length; k += 3) { ctx.moveTo(items[k] + items[k + 2], items[k + 1]); ctx.arc(items[k], items[k + 1], items[k + 2], 0, Math.PI * 2); }
      ctx.fill();
    }

    // overlays
    if (step === 0 && g) {
      const at = ([la, lo]) => { const [x, y] = g.project(la, lo, .98); return [cx + x * U, cy + y * U]; };
      const [bx, by] = at(BERLIN), [tx, ty] = at(TBILISI);
      const land1 = progress(t, 1100, 400), land2 = progress(t, 2600, 500);
      for (const [x, y, p] of [[bx, by, land1], [tx, ty, land2]]) {
        if (p <= 0) continue;
        const pulse = live ? (now / 1400) % 1 : .5;
        ctx.strokeStyle = rgba(CORAL, .5 * (1 - pulse) * p); ctx.lineWidth = 1.2;
        ctx.beginPath(); ctx.arc(x, y, 4 + pulse * 14, 0, Math.PI * 2); ctx.stroke();
        ctx.fillStyle = rgba(CORAL, p); ctx.beginPath(); ctx.arc(x, y, 3.5, 0, Math.PI * 2); ctx.fill();
      }
      pill(ctx, bx - 4, by - 30, 'You · Berlin', { alpha: easeOut(land1), scale: .9 + .1 * easeBack(land1) });
      pill(ctx, tx + 6, ty + 30, 'Credo · Tbilisi', { alpha: easeOut(land2), scale: .9 + .1 * easeBack(land2) });
    }
    if (step === 1) {
      const front = progress(t, 450, 1500);
      if (front > 0 && front < 1) {
        const x = cx + lerp(-.8, .8, easeInOut(front)) * U;
        const grad = ctx.createLinearGradient(x - 40, 0, x, 0);
        grad.addColorStop(0, rgba(CORAL, 0)); grad.addColorStop(1, rgba(CORAL, .5));
        ctx.fillStyle = grad; ctx.fillRect(x - 40, cy - .56 * U, 40, 1.12 * U);
        ctx.fillStyle = rgba(CORAL, .9); ctx.fillRect(x - 1, cy - .56 * U, 2, 1.12 * U);
      }
    }
    if (step === 2) {
      const fp = easeOut(progress(t, 1500, 600)), done = progress(t, 3900, 300);
      if (fp > 0) {
        const w = U * 1.55 * (1.08 - .08 * fp), h = U * 2 * (1.08 - .08 * fp), fx = cx + U * .02 - w / 2, fy = cy - U * .02 - h / 2, len = Math.min(30, w * .12);
        ctx.lineWidth = 2; ctx.lineCap = 'round'; ctx.strokeStyle = rgba(mix([34, 57, 70], CORAL, done), .85 * fp);
        ctx.beginPath(); corner(ctx, fx, fy, 1, 1, len, 8); corner(ctx, fx + w, fy, -1, 1, len, 8); corner(ctx, fx, fy + h, 1, -1, len, 8); corner(ctx, fx + w, fy + h, -1, -1, len, 8); ctx.stroke();
      }
      const cp = progress(t, 3900, 450);
      if (cp > 0) {
        const size = U * .3, x0 = cx - size * .35, y0 = cy + U * .02;
        const pts = [[x0, y0], [x0 + size * .32, y0 + size * .3], [x0 + size, y0 - size * .38]];
        const l1 = Math.hypot(pts[1][0] - pts[0][0], pts[1][1] - pts[0][1]), l2 = Math.hypot(pts[2][0] - pts[1][0], pts[2][1] - pts[1][1]), drawn = easeOut(cp) * (l1 + l2);
        ctx.lineCap = 'round'; ctx.lineJoin = 'round'; ctx.beginPath(); ctx.moveTo(...pts[0]);
        if (drawn <= l1) ctx.lineTo(lerp(pts[0][0], pts[1][0], drawn / l1), lerp(pts[0][1], pts[1][1], drawn / l1));
        else { ctx.lineTo(...pts[1]); const f = (drawn - l1) / l2; ctx.lineTo(lerp(pts[1][0], pts[2][0], f), lerp(pts[1][1], pts[2][1], f)); }
        ctx.strokeStyle = 'rgba(255,255,255,.9)'; ctx.lineWidth = 9; ctx.stroke();
        ctx.strokeStyle = rgba(CORAL, 1); ctx.lineWidth = 4.5; ctx.stroke();
      }
    }
  });
  loadAssets(() => scene.refresh());
  return scene;
}
