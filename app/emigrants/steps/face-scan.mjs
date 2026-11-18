import { clamp01, createCanvasStage, easeBack, easeOut, progress, seeded } from './canvas-stage.mjs';

/* Step 2 — a dot-cloud head in the globe's colours: it gathers from loose
   points, a coral band scans it top to bottom, then a check confirms it.
   The dots sit on horizontal contour lines traced over a real head scan
   (softened: smaller nose, gentler brow and chin, slimmer jaw and neck),
   "Infinite, 3D Head Scan" by Lee Perry-Smith (Infinite Realities),
   CC BY 3.0 — baked by scripts/bake-head-scan.mjs. */

const BLUE = [30, 110, 145], MIST = [127, 175, 201], CORAL = [252, 98, 80];
const T = { gather: 1500, frame: 500, scanFrom: 1450, scan: 2000, check: 3500 };
const TOP = 1.07, BOTTOM = -1.12;

let points = null, loading = null;
function loadHead() {
  if (loading) return loading;
  loading = fetch('/assets/emigrants/head-scan.bin')
    .then(response => response.ok ? response.arrayBuffer() : Promise.reject(response.status))
    .then(buffer => {
      const raw = new Int16Array(buffer), random = seeded(7), list = [];
      for (let i = 0; i < raw.length; i += 6) {
        const y = raw[i + 1] / 20000;
        const u = random() * Math.PI * 2, v = Math.acos(2 * random() - 1), spread = .35 + random() * .7;
        list.push({
          x: raw[i] / 20000, y, z: raw[i + 2] / 20000,
          nx: raw[i + 3] / 32767, ny: raw[i + 4] / 32767, nz: raw[i + 5] / 32767,
          ox: Math.sin(v) * Math.cos(u) * spread, oy: Math.cos(v) * spread * .7, oz: Math.sin(v) * Math.sin(u) * spread,
          delay: random() * 900 + (1 - (y - BOTTOM) / (TOP - BOTTOM)) * 250,
          fade: clamp01((y - BOTTOM) / .42),
        });
      }
      points = list;
    })
    .catch(() => { loading = null; });
  return loading;
}

const BUCKETS = 12;
const rgba = (c, a) => `rgba(${c[0]},${c[1]},${c[2]},${a})`;
const mix = (a, b, p) => [a[0] + (b[0] - a[0]) * p, a[1] + (b[1] - a[1]) * p, a[2] + (b[2] - a[2]) * p].map(Math.round);

function corner(ctx, x, y, sx, sy, len, r) {
  ctx.moveTo(x, y + sy * len);
  ctx.lineTo(x, y + sy * r);
  ctx.quadraticCurveTo(x, y, x + sx * r, y);
  ctx.lineTo(x + sx * len, y);
}

export function createFaceScan(canvas) {
  const blue = [], coral = [];
  for (let i = 0; i < BUCKETS; i++) { blue.push([]); coral.push([]); }
  const light = (() => { const l = Math.hypot(.7, .45, .75); return [.7 / l, .45 / l, .75 / l]; })();

  const stage = createCanvasStage(canvas, (ctx, { t, now, live, width, height }) => {
    const scale = Math.min(height * .29, width * .42);
    const cx = width / 2, cy = height * .45;
    const sway = live ? Math.sin(now / 1000 * .55) * .14 : 0;
    const yaw = .62 + sway, pitch = .06;
    const cyaw = Math.cos(yaw), syaw = Math.sin(yaw), cp = Math.cos(pitch), sp = Math.sin(pitch);
    const scanP = progress(t, T.scanFrom, T.scan), scanning = scanP > 0 && scanP < 1;
    const scanY = TOP + .05 - scanP * (TOP - BOTTOM + .1), band = .16;
    const base = scale * .0088;

    for (let i = 0; i < BUCKETS; i++) { blue[i].length = 0; coral[i].length = 0; }
    for (const p of points || []) {
      const g = easeOut(progress(t, p.delay, T.gather));
      if (g <= 0) continue;
      // scan band: points lift slightly along their normal and turn coral
      const inBand = scanning ? clamp01(1 - Math.abs(p.y - scanY) / band) : 0;
      const lift = inBand * .035, loose = 1 - g;
      const mx = p.x + p.ox * loose + p.nx * lift, my = p.y + p.oy * loose + p.ny * lift, mz = p.z + p.oz * loose + p.nz * lift;
      // yaw, then a slight pitch
      const rx = mx * cyaw + mz * syaw, rz0 = -mx * syaw + mz * cyaw;
      const ry = my * cp - rz0 * sp, rz = my * sp + rz0 * cp;
      const nx = p.nx * cyaw + p.nz * syaw, nz0 = -p.nx * syaw + p.nz * cyaw;
      const ny = p.ny * cp - nz0 * sp, nz = p.ny * sp + nz0 * cp;
      const facing = nz;
      if (facing < -.1 && inBand === 0) continue;
      const lit = Math.max(0, nx * light[0] + ny * light[1] + nz * light[2]);
      const visible = clamp01((facing + .1) / .45);
      const scanned = scanP >= 1 || (scanning && p.y > scanY) ? 1 : scanning ? .7 : .85;
      let alpha = visible * (.18 + .82 * lit) * p.fade * g * scanned;
      if (inBand) alpha = Math.max(alpha, (.35 + .65 * inBand) * p.fade * clamp01(visible + .3));
      if (alpha < .03) continue;
      const f = 1 / (1 - rz * .1);
      const sx = cx + (rx - .1) * scale * f, sy = cy - (ry - .1) * scale * f;
      const radius = base * (.55 + .75 * lit + inBand * .8) * f;
      const bucket = Math.min(BUCKETS - 1, Math.round(alpha * (BUCKETS - 1)));
      (inBand > .25 ? coral : blue)[bucket].push(sx, sy, radius);
    }
    for (const [list, color] of [[blue, null], [coral, CORAL]]) {
      for (let b = 1; b < BUCKETS; b++) {
        const items = list[b];
        if (!items.length) continue;
        const a = b / (BUCKETS - 1);
        ctx.fillStyle = color ? rgba(color, a) : rgba(mix(MIST, BLUE, Math.min(1, a * 1.25)), Math.min(1, a * 1.1));
        ctx.beginPath();
        for (let i = 0; i < items.length; i += 3) { ctx.moveTo(items[i] + items[i + 2], items[i + 1]); ctx.arc(items[i], items[i + 1], items[i + 2], 0, Math.PI * 2); }
        ctx.fill();
      }
    }

    // corner brackets around the face
    const fp = easeOut(progress(t, T.frame, 600));
    if (fp > 0) {
      const done = progress(t, T.check, 300);
      const w = scale * 1.75 * (1.08 - .08 * fp), h = scale * 2.1 * (1.08 - .08 * fp);
      const fx = cx + scale * .06 - w / 2, fy = cy - scale * .02 - h / 2, len = Math.min(28, w * .12), r = 8;
      ctx.lineWidth = 2; ctx.lineCap = 'round';
      ctx.strokeStyle = rgba(mix([34, 57, 70], CORAL, done), .85 * fp);
      ctx.beginPath();
      corner(ctx, fx, fy, 1, 1, len, r); corner(ctx, fx + w, fy, -1, 1, len, r);
      corner(ctx, fx, fy + h, 1, -1, len, r); corner(ctx, fx + w, fy + h, -1, -1, len, r);
      ctx.stroke();
    }

    // check mark draws itself over the face
    const cp2 = progress(t, T.check, 450);
    if (cp2 > 0) {
      const size = scale * .34, x0 = cx - size * .35, y0 = cy - scale * .02;
      const pts = [[x0, y0], [x0 + size * .32, y0 + size * .3], [x0 + size, y0 - size * .38]];
      const l1 = Math.hypot(pts[1][0] - pts[0][0], pts[1][1] - pts[0][1]), l2 = Math.hypot(pts[2][0] - pts[1][0], pts[2][1] - pts[1][1]);
      const drawn = easeOut(cp2) * (l1 + l2), pop = easeBack(progress(t, T.check, 500));
      ctx.save();
      ctx.translate(cx, cy); ctx.scale(.85 + .15 * pop, .85 + .15 * pop); ctx.translate(-cx, -cy);
      ctx.lineCap = 'round'; ctx.lineJoin = 'round';
      ctx.beginPath();
      ctx.moveTo(pts[0][0], pts[0][1]);
      if (drawn <= l1) ctx.lineTo(pts[0][0] + (pts[1][0] - pts[0][0]) * drawn / l1, pts[0][1] + (pts[1][1] - pts[0][1]) * drawn / l1);
      else { ctx.lineTo(pts[1][0], pts[1][1]); const f = (drawn - l1) / l2; ctx.lineTo(pts[1][0] + (pts[2][0] - pts[1][0]) * f, pts[1][1] + (pts[2][1] - pts[1][1]) * f); }
      ctx.strokeStyle = 'rgba(255,255,255,.9)'; ctx.lineWidth = 9; ctx.stroke();
      ctx.strokeStyle = rgba(CORAL, 1); ctx.lineWidth = 4.5; ctx.stroke();
      ctx.restore();
    }
  });
  loadHead().then(() => stage.refresh());
  return stage;
}
