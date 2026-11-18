import { COLORS, FLAGS, FONT, createCanvasStage, easeBack, easeInOut, easeOut, loadImage, pill, progress, seeded } from './canvas-stage.mjs';

/* Step 1 · A — two dot-drawn clocks. Both spin forward together and stop at
   12:00 in Athens and 14:00 in Tbilisi; a coral arc then links them: the
   time difference is handled for you. */

const T = { gather: 0, spinFrom: 850, spin: 1500, arc: 2450, arcDraw: 650, badge: 3000 };
const SPIN_MINUTES = 140; // both clocks start 2h20m earlier and spin forward

const rand = seeded(12);
// Dial texture: a dot grid clipped to the face, in unit coordinates.
const FACE = [];
for (let y = -1; y <= 1.0001; y += .1) for (let x = -1; x <= 1.0001; x += .1) {
  const d = Math.hypot(x, y);
  if (d < .9) FACE.push({ x, y, d, delay: rand() * 500, ox: (rand() - .5) * .8, oy: (rand() - .5) * .8 });
}
const RING = Array.from({ length: 60 }, (_, i) => ({ i, a: i / 60 * Math.PI * 2, delay: 150 + rand() * 450 }));

const pad = n => String(n).padStart(2, '0');
const label = minutes => { const m = ((Math.round(minutes) % 1440) + 1440) % 1440; return `${pad(Math.floor(m / 60))}:${pad(m % 60)}`; };

function dottedHand(ctx, cx, cy, angle, length, radius, step) {
  const dx = Math.sin(angle), dy = -Math.cos(angle);
  for (let s = step; s <= length; s += step) { ctx.moveTo(cx + dx * s + radius, cy + dy * s); ctx.arc(cx + dx * s, cy + dy * s, radius, 0, Math.PI * 2); }
}

function dial(ctx, { cx, cy, R, t, minutes, hand, city, flag }) {
  // face texture gathers in
  ctx.fillStyle = COLORS.soft;
  for (const dot of FACE) {
    const g = easeOut(progress(t, T.gather + dot.delay, 700));
    if (g <= 0) continue;
    ctx.globalAlpha = g * (.1 + (1 - dot.d) * .14);
    const x = cx + (dot.x + dot.ox * (1 - g)) * R, y = cy + (dot.y + dot.oy * (1 - g)) * R;
    ctx.fillRect(x - 1, y - 1, 2, 2);
  }
  // minute ring, hour dots heavier
  for (const dot of RING) {
    const g = easeOut(progress(t, T.gather + dot.delay, 600));
    if (g <= 0) continue;
    const hour = dot.i % 5 === 0, quarter = dot.i % 15 === 0;
    ctx.globalAlpha = g * (quarter ? .9 : hour ? .6 : .28);
    ctx.fillStyle = hour ? COLORS.ink : COLORS.soft;
    const r = R * (1.02 + (1 - g) * .15), x = cx + Math.sin(dot.a) * r, y = cy - Math.cos(dot.a) * r;
    ctx.beginPath(); ctx.arc(x, y, quarter ? 2.6 : hour ? 2 : 1.2, 0, Math.PI * 2); ctx.fill();
  }
  // hands as dot chains
  const handsIn = easeOut(progress(t, 500, 500));
  ctx.globalAlpha = handsIn;
  ctx.fillStyle = hand;
  const minuteAngle = (minutes % 60) / 60 * Math.PI * 2, hourAngle = (minutes % 720) / 720 * Math.PI * 2;
  ctx.beginPath();
  dottedHand(ctx, cx, cy, hourAngle, R * .48, 2.6, 6.5);
  dottedHand(ctx, cx, cy, minuteAngle, R * .76, 1.9, 6);
  ctx.fill();
  ctx.beginPath(); ctx.arc(cx, cy, 4.5, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = '#fff'; ctx.beginPath(); ctx.arc(cx, cy, 1.8, 0, Math.PI * 2); ctx.fill();

  // city and time underneath
  const text = easeOut(progress(t, 350, 600));
  ctx.globalAlpha = text;
  const image = loadImage(flag);
  ctx.font = `500 13px ${FONT}`; ctx.textAlign = 'left'; ctx.textBaseline = 'middle';
  const cityW = ctx.measureText(city).width, rowW = 22 + cityW, ly = cy + R + 30;
  if (image.complete && image.naturalWidth) ctx.drawImage(image, cx - rowW / 2, ly - 5.5, 16, 11);
  ctx.fillStyle = COLORS.sub; ctx.fillText(city, cx - rowW / 2 + 22, ly + 1);
  ctx.textAlign = 'center';
  ctx.font = `600 ${Math.round(Math.min(30, R * .3))}px system-ui, -apple-system, "Segoe UI", sans-serif`;
  ctx.fillStyle = hand === COLORS.coral ? COLORS.coral : COLORS.ink;
  ctx.fillText(label(minutes), cx, ly + 30);
  ctx.globalAlpha = 1;
}

export function createClocksScene(canvas) {
  return createCanvasStage(canvas, (ctx, { t, width, height }) => {
    const R = Math.min(width * .17, height * .2, 108);
    const gapX = Math.max(R * 1.35, Math.min(width * .24, R * 1.9)), cy = height * .4;
    const left = width / 2 - gapX, right = width / 2 + gapX;
    const spin = easeInOut(progress(t, T.spinFrom, T.spin));
    const athens = 12 * 60 - SPIN_MINUTES * (1 - spin);

    dial(ctx, { cx: left, cy, R, t, minutes: athens, hand: COLORS.ink, city: 'ათენი', flag: FLAGS.gr });
    dial(ctx, { cx: right, cy, R, t, minutes: athens + 120, hand: COLORS.coral, city: 'თბილისი', flag: FLAGS.ge });

    // coral arc of dots from one clock to the other
    const draw = easeOut(progress(t, T.arc, T.arcDraw));
    if (draw > 0) {
      const x0 = left + R * .55, y0 = cy - R * .92, x1 = right - R * .55, y1 = y0;
      const cxp = width / 2, cyp = cy - R * 1.75;
      ctx.fillStyle = COLORS.coral;
      ctx.beginPath();
      const steps = 44;
      for (let i = 0; i <= steps * draw; i++) {
        const s = i / steps, a = (1 - s) ** 2, b = 2 * (1 - s) * s, c = s * s;
        const x = a * x0 + b * cxp + c * x1, y = a * y0 + b * cyp + c * y1;
        const r = 1.1 + Math.sin(s * Math.PI) * 1.1;
        ctx.moveTo(x + r, y); ctx.arc(x, y, r, 0, Math.PI * 2);
      }
      ctx.fill();
      const badge = easeBack(progress(t, T.badge, 450));
      if (badge > 0) pill(ctx, cxp, (y0 + cyp) / 2 - 2, '+2 საათი', { alpha: Math.min(1, badge), scale: .8 + .2 * badge, color: COLORS.coral, weight: 600 });
    }
  });
}
