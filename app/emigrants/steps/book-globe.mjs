import { COLORS, FLAGS, createCanvasStage, easeBack, easeInOut, easeOut, lerp, pill, progress, seeded } from './canvas-stage.mjs';

/* Step 1 · B — the hero globe, continued. A land-dot globe turns and zooms
   from Western Europe to the Athens → Tbilisi corridor; a coral route draws
   between them and the booked slot rides along it, switching to Tbilisi time. */

const T = { turn: 1700, athens: 1250, routeFrom: 1500, route: 1100, tbilisi: 2550, rideFrom: 1550 };
const ATHENS = { lat: 37.98, lon: 23.73 }, TBILISI = { lat: 41.72, lon: 44.83 };
const VIEW_FROM = { lat: 28, lon: -8, zoom: .5 }, VIEW_TO = { lat: 40.5, lon: 34.5, zoom: 1.45 };
const RAD = Math.PI / 180;

let land = null, loading = null;
/* Land dots sampled on a Fibonacci sphere from the hero globe's land mask
   (equirectangular, longitude 0 at the left edge). */
function loadLand() {
  if (loading) return loading;
  loading = new Promise(resolve => {
    const image = new Image();
    image.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = image.width; canvas.height = image.height;
      const ctx = canvas.getContext('2d', { willReadFrequently: true });
      ctx.drawImage(image, 0, 0);
      const { data } = ctx.getImageData(0, 0, image.width, image.height);
      const count = 140000, points = [], rand = seeded(41);
      for (let i = 0; i < count; i++) {
        const y = 1 - (i + .5) / count * 2, lat = Math.asin(y), lon = (i * 2.399963229728653) % (Math.PI * 2);
        const u = lon / (Math.PI * 2), v = .5 - lat / Math.PI;
        const px = Math.min(image.width - 1, Math.floor(u * image.width)), py = Math.min(image.height - 1, Math.floor(v * image.height));
        if (data[(py * image.width + px) * 4 + 3] === 0) continue;
        points.push({ cl: Math.cos(lat), sl: Math.sin(lat), lon, tone: rand(), seed: rand() });
      }
      land = points; resolve(points);
    };
    image.onerror = () => { loading = null; resolve(null); };
    image.src = '/assets/globe/land-mask.png';
  });
  return loading;
}

function vector({ lat, lon }) {
  const a = lat * RAD, b = lon * RAD;
  return [Math.cos(a) * Math.sin(b), Math.sin(a), Math.cos(a) * Math.cos(b)];
}
function slerp(a, b, s) {
  const dot = a[0] * b[0] + a[1] * b[1] + a[2] * b[2], omega = Math.acos(Math.min(1, dot)), so = Math.sin(omega);
  const k0 = Math.sin((1 - s) * omega) / so, k1 = Math.sin(s * omega) / so;
  return [a[0] * k0 + b[0] * k1, a[1] * k0 + b[1] * k1, a[2] * k0 + b[2] * k1];
}

export function createGlobeScene(canvas) {
  loadLand();
  const A = vector(ATHENS), B = vector(TBILISI);
  return createCanvasStage(canvas, (ctx, { t, now, live, width, height }) => {
    const turn = easeInOut(progress(t, 0, T.turn));
    const drift = live ? Math.sin(now / 1000 * .3) * .6 : 0;
    const lat0 = lerp(VIEW_FROM.lat, VIEW_TO.lat, turn) * RAD, lon0 = (lerp(VIEW_FROM.lon, VIEW_TO.lon, turn) + drift * turn) * RAD;
    const R = Math.min(width, height) * lerp(VIEW_FROM.zoom, VIEW_TO.zoom, turn);
    const cx = width / 2, cy = height * .52;
    const cla = Math.cos(lat0), sla = Math.sin(lat0);
    // project a unit vector (x east, y north, z towards lon 0) into the view
    const project = (x, y, z) => {
      const cl0 = Math.cos(lon0), sl0 = Math.sin(lon0);
      const x1 = x * cl0 - z * sl0, z1 = x * sl0 + z * cl0;
      const y2 = y * cla - z1 * sla, z2 = y * sla + z1 * cla;
      return [cx + x1 * R, cy - y2 * R, z2];
    };

    // globe body: a faint disc so the zoomed-out globe reads as a sphere
    const intro = easeOut(progress(t, 0, 600));
    ctx.globalAlpha = intro * (1 - turn) * .6;
    ctx.fillStyle = '#eaf2f6'; ctx.beginPath(); ctx.arc(cx, cy, R, 0, Math.PI * 2); ctx.fill();
    ctx.globalAlpha = 1;

    if (land) {
      const dot = Math.max(1.3, Math.min(2.4, R * .0036)), cl0 = Math.cos(lon0), sl0 = Math.sin(lon0);
      const tones = [[], [], []];
      for (const p of land) {
        const x = p.cl * Math.sin(p.lon), z = p.cl * Math.cos(p.lon);
        const x1 = x * cl0 - z * sl0, z1 = x * sl0 + z * cl0;
        const y2 = p.sl * cla - z1 * sla, z2 = p.sl * sla + z1 * cla;
        if (z2 <= .02) continue;
        const sx = cx + x1 * R, sy = cy - y2 * R;
        if (sx < -4 || sx > width + 4 || sy < -4 || sy > height + 4) continue;
        tones[p.tone < .72 ? 0 : p.tone < .93 ? 1 : 2].push(sx, sy, Math.min(1, z2 * 2.4) * (.6 + p.seed * .4));
      }
      const colors = ['#9eb1bc', '#6fa3bf', '#f19a8b'];
      for (let k = 0; k < 3; k++) {
        ctx.fillStyle = colors[k];
        const list = tones[k];
        for (let i = 0; i < list.length; i += 3) { ctx.globalAlpha = list[i + 2] * intro; ctx.fillRect(list[i] - dot / 2, list[i + 1] - dot / 2, dot, dot); }
      }
      ctx.globalAlpha = 1;
    }

    // the route, lifted off the surface in an arc
    const route = easeInOut(progress(t, T.routeFrom, T.route));
    // great-circle path, bowed upwards on screen so it reads as a flight arc
    const pa = project(...A), pb = project(...B);
    const bow = Math.hypot(pb[0] - pa[0], pb[1] - pa[1]) * .28;
    const nx = (pa[1] - pb[1]), ny = (pb[0] - pa[0]), nl = Math.hypot(nx, ny) || 1, up = ny / nl < 0 ? 1 : -1;
    const along = s => { const v = slerp(A, B, s), [x, y] = project(...v), k = Math.sin(s * Math.PI) * bow * up; return [x + nx / nl * k, y + ny / nl * k]; };
    if (route > 0) {
      ctx.lineCap = 'round';
      const grad = ctx.createLinearGradient(...along(0).slice(0, 2), ...along(1).slice(0, 2));
      grad.addColorStop(0, COLORS.coral); grad.addColorStop(1, '#f58b6f');
      ctx.strokeStyle = grad; ctx.lineWidth = 2.4;
      ctx.beginPath();
      const steps = 80;
      for (let i = 0; i <= steps; i++) { const [x, y] = along(route * i / steps); i ? ctx.lineTo(x, y) : ctx.moveTo(x, y); }
      ctx.stroke();
      ctx.setLineDash([2, 6]); ctx.lineWidth = 1.2; ctx.strokeStyle = 'rgba(252,98,80,.35)';
      ctx.beginPath();
      for (let i = 0; i <= steps; i++) { const [x, y] = along(i / steps); i ? ctx.lineTo(x, y) : ctx.moveTo(x, y); }
      ctx.globalAlpha = 1 - route; ctx.stroke(); ctx.globalAlpha = 1; ctx.setLineDash([]);
    }

    // city pins
    const pin = (v, at, color, labelText, flag, side) => {
      const p = easeBack(progress(t, at, 450));
      if (p <= 0) return;
      const [x, y] = project(...v);
      const halo = live ? (now / 1400 + (side > 0 ? .5 : 0)) % 1 : .6;
      ctx.fillStyle = color;
      ctx.globalAlpha = (1 - halo) * .35 * Math.min(1, p); ctx.beginPath(); ctx.arc(x, y, 6 + halo * 16, 0, Math.PI * 2); ctx.fill();
      ctx.globalAlpha = Math.min(1, p);
      ctx.fillStyle = '#fff'; ctx.beginPath(); ctx.arc(x, y, 7 * p, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = color; ctx.beginPath(); ctx.arc(x, y, 4.2 * p, 0, Math.PI * 2); ctx.fill();
      ctx.globalAlpha = 1;
      pill(ctx, x + side * 8, y + 30, labelText, { alpha: Math.min(1, p), flag, scale: .85 + .15 * Math.min(1, p) });
    };
    pin(A, T.athens, COLORS.blue, 'ათენი 12:00', FLAGS.gr, -1);
    pin(B, T.tbilisi, COLORS.coral, 'თბილისი 14:00', FLAGS.ge, 1);

    // the booked slot rides the route
    const ride = progress(t, T.rideFrom, T.route * .95);
    if (ride > 0 && ride < 1) {
      const e = easeInOut(ride), [x, y] = along(e);
      const fade = Math.min(1, ride * 6, (1 - ride) * 6);
      pill(ctx, x, y - 24, `ხუთ 26 · ${e < .5 ? '12:00' : '14:00'}`, { alpha: fade, color: COLORS.ink, weight: 600 });
    }
  });
}
