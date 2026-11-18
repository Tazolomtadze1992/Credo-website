import { COLORS, FLAGS, FONT, createCanvasStage, easeBack, easeInOut, easeOut, lerp, loadImage, progress, roundRect, seeded } from './canvas-stage.mjs';

/* Step 1 · C — a week grid that builds itself out of dots, the same way the
   card does in step 3. A coral ring hops across free slots, settles on
   Thursday 14:00, and that slot lifts out as the booking card. */

const DAYS = [['ორშ', 23], ['სამ', 24], ['ოთხ', 25], ['ხუთ', 26], ['პარ', 27]];
const HOURS = ['10:00', '12:00', '14:00', '16:00'];
const PICK = { row: 2, col: 3 };
const HOPS = [{ row: 1, col: 1, at: 1450 }, { row: 3, col: 2, at: 1850 }, { row: 2, col: 3, at: 2250 }];
const T = { labels: 450, busy: 1050, fill: 2600, lift: 2850, liftFor: 650, content: 3250 };
const busy = (row, col) => (row + col) % 3 === 0 && !(row === PICK.row && col === PICK.col);

const rand = seeded(5);
const SLOTS = [];
for (let row = 0; row < HOURS.length; row++) for (let col = 0; col < DAYS.length; col++) {
  SLOTS.push({ row, col, busy: busy(row, col), delay: col * 90 + row * 70 + rand() * 160, seed: Array.from({ length: 64 }, () => [rand() - .5, rand() - .5]) });
}

function layout(width, height) {
  const gridW = Math.min(width * .82, 470), labelW = 44, gap = Math.max(5, Math.min(8, gridW * .018));
  const slotW = (gridW - labelW - gap * 4) / 5, slotH = Math.min(40, slotW * .62, height * .085), headH = 30;
  const gridH = headH + slotH * 4 + gap * 3;
  const x0 = (width - gridW) / 2 + labelW, y0 = height * .44 - gridH / 2 + headH;
  const rect = (row, col) => ({ x: x0 + col * (slotW + gap), y: y0 + row * (slotH + gap), w: slotW, h: slotH });
  return { gridW, labelW, slotW, slotH, gap, x0, y0, rect };
}

/* points spaced evenly along a rounded slot outline */
function outline(r, radius, spacing) {
  const pts = [], straightW = r.w - radius * 2, straightH = r.h - radius * 2;
  const total = 2 * (straightW + straightH) + Math.PI * 2 * radius;
  const n = Math.max(8, Math.round(total / spacing));
  for (let i = 0; i < n; i++) {
    let d = i / n * total;
    const segs = [
      [straightW, s => [r.x + radius + s, r.y]],
      [Math.PI * radius / 2, s => { const a = -Math.PI / 2 + s / radius; return [r.x + r.w - radius + Math.cos(a) * radius, r.y + radius + Math.sin(a) * radius]; }],
      [straightH, s => [r.x + r.w, r.y + radius + s]],
      [Math.PI * radius / 2, s => { const a = s / radius; return [r.x + r.w - radius + Math.cos(a) * radius, r.y + r.h - radius + Math.sin(a) * radius]; }],
      [straightW, s => [r.x + r.w - radius - s, r.y + r.h]],
      [Math.PI * radius / 2, s => { const a = Math.PI / 2 + s / radius; return [r.x + radius + Math.cos(a) * radius, r.y + r.h - radius + Math.sin(a) * radius]; }],
      [straightH, s => [r.x, r.y + r.h - radius - s]],
      [Math.PI * radius / 2, s => { const a = Math.PI + s / radius; return [r.x + radius + Math.cos(a) * radius, r.y + radius + Math.sin(a) * radius]; }],
    ];
    for (const [len, at] of segs) { if (d <= len) { pts.push(at(d)); break; } d -= len; }
  }
  return pts;
}

export function createCalendarScene(canvas) {
  return createCanvasStage(canvas, (ctx, { t, width, height }) => {
    const L = layout(width, height);
    const lift = easeInOut(progress(t, T.lift, T.liftFor));
    const dim = 1 - lift * .6;

    // labels
    const labels = easeOut(progress(t, T.labels, 600)) * dim;
    ctx.globalAlpha = labels; ctx.textBaseline = 'middle';
    ctx.font = `500 11px ${FONT}`; ctx.fillStyle = COLORS.sub; ctx.textAlign = 'center';
    DAYS.forEach(([day, date], col) => {
      const r = L.rect(0, col);
      ctx.fillStyle = col === PICK.col && t >= T.fill ? COLORS.blue : COLORS.sub;
      ctx.fillText(`${day} ${date}`, r.x + r.w / 2, r.y - 16);
    });
    ctx.fillStyle = COLORS.sub; ctx.textAlign = 'right'; ctx.font = `500 11px system-ui, -apple-system, sans-serif`;
    HOURS.forEach((hour, row) => { const r = L.rect(row, 0); ctx.fillText(hour, r.x - 10, r.y + r.h / 2); });
    ctx.globalAlpha = 1;

    // slots gather out of loose dots
    const radius = Math.min(9, L.slotH * .25);
    for (const slot of SLOTS) {
      const r = L.rect(slot.row, slot.col), g = easeOut(progress(t, slot.delay, 650));
      if (g <= 0) continue;
      const pts = outline(r, radius, 5.5);
      ctx.fillStyle = '#6f9fb9'; ctx.globalAlpha = g * .85 * dim;
      ctx.beginPath();
      pts.forEach(([x, y], i) => {
        const [ox, oy] = slot.seed[i % slot.seed.length], spread = (1 - g) * 70;
        const px = x + ox * spread, py = y + oy * spread;
        ctx.moveTo(px + 1.25, py); ctx.arc(px, py, 1.25, 0, Math.PI * 2);
      });
      ctx.fill();
      if (slot.busy) {
        const b = easeOut(progress(t, T.busy + slot.delay * .4, 450));
        if (b > 0) {
          ctx.save(); roundRect(ctx, r.x + 2, r.y + 2, r.w - 4, r.h - 4, radius - 2); ctx.clip();
          ctx.globalAlpha = b * .55 * dim; ctx.fillStyle = COLORS.soft; ctx.beginPath();
          for (let y = r.y; y < r.y + r.h; y += 4.5) for (let x = r.x; x < r.x + r.w; x += 4.5) {
            if (Math.round((x - r.x + y - r.y) / 4.5) % 3 === 0) { ctx.moveTo(x + .9, y); ctx.arc(x, y, .9, 0, Math.PI * 2); }
          }
          ctx.fill(); ctx.restore();
        }
      }
    }
    ctx.globalAlpha = 1;

    // the coral ring hops across free slots
    const hopIn = easeOut(progress(t, HOPS[0].at, 300));
    if (hopIn > 0 && lift < 1) {
      let from = HOPS[0], to = HOPS[0], move = 1;
      for (let i = 1; i < HOPS.length; i++) if (t >= HOPS[i].at - 320) { from = HOPS[i - 1]; to = HOPS[i]; move = easeInOut(progress(t, HOPS[i].at - 320, 320)); }
      const a = L.rect(from.row, from.col), b = L.rect(to.row, to.col);
      const x = lerp(a.x, b.x, move), y = lerp(a.y, b.y, move);
      ctx.globalAlpha = hopIn * (1 - lift); ctx.strokeStyle = COLORS.coral; ctx.lineWidth = 2;
      roundRect(ctx, x - 3, y - 3, L.slotW + 6, L.slotH + 6, radius + 3); ctx.stroke();
      ctx.globalAlpha = 1;
    }

    // the picked slot fills, then lifts out as the booking card
    const fill = easeOut(progress(t, T.fill, 300));
    if (fill > 0) {
      const s = L.rect(PICK.row, PICK.col);
      const cardW = Math.min(310, width - 36), cardH = 118;
      const target = { x: (width - cardW) / 2, y: height * .44 - cardH / 2 };
      const pop = easeBack(progress(t, T.lift, T.liftFor));
      const x = lerp(s.x, target.x, lift), y = lerp(s.y, target.y, lift), w = lerp(s.w, cardW, lift), h = lerp(s.h, cardH, lift);
      ctx.save();
      ctx.shadowColor = `rgba(18,62,84,${.32 * lift})`; ctx.shadowBlur = 40 * lift; ctx.shadowOffsetY = 18 * lift;
      ctx.globalAlpha = fill; ctx.fillStyle = COLORS.blue;
      const k = lift > 0 ? 1 + (pop - lift) * .06 : 1;
      ctx.translate(x + w / 2, y + h / 2); ctx.scale(k, k);
      roundRect(ctx, -w / 2, -h / 2, w, h, lerp(radius, 18, lift)); ctx.fill();
      ctx.restore();

      const content = easeOut(progress(t, T.content, 450));
      if (content > 0) {
        const cx = target.x, cy = target.y;
        ctx.save(); ctx.globalAlpha = content; ctx.translate(0, (1 - content) * 6);
        ctx.textAlign = 'left'; ctx.textBaseline = 'middle';
        ctx.fillStyle = 'rgba(255,255,255,.7)'; ctx.font = `500 12px ${FONT}`;
        ctx.fillText('ვიდეოზარი ბანკირთან', cx + 20, cy + 24);
        ctx.fillStyle = '#fff'; ctx.font = `600 16px ${FONT}`;
        ctx.fillText('ხუთშაბათი, 26 ნოემბერი', cx + 20, cy + 46);
        ctx.fillStyle = 'rgba(255,255,255,.18)'; ctx.fillRect(cx + 20, cy + 66, cardW - 40, 1);
        // flag · city · time; the Tbilisi row is right-aligned to the card edge
        const row = (flag, city, time, edge, alignRight) => {
          ctx.font = `500 12px ${FONT}`; const cityW = ctx.measureText(city).width;
          ctx.font = `600 15px system-ui, -apple-system, sans-serif`; const timeW = ctx.measureText(time).width;
          const x = alignRight ? edge - (22 + cityW + 7 + timeW) : edge;
          const image = loadImage(flag);
          if (image.complete && image.naturalWidth) ctx.drawImage(image, x, cy + 84, 16, 11);
          ctx.textAlign = 'left';
          ctx.fillStyle = 'rgba(255,255,255,.75)'; ctx.font = `500 12px ${FONT}`; ctx.fillText(city, x + 22, cy + 90);
          ctx.fillStyle = '#fff'; ctx.font = `600 15px system-ui, -apple-system, sans-serif`; ctx.fillText(time, x + 22 + cityW + 7, cy + 90);
        };
        row(FLAGS.gr, 'ათენი', '12:00', cx + 20, false);
        row(FLAGS.ge, 'თბილისი', '14:00', cx + cardW - 20, true);
        ctx.restore();
      }
    }
  });
}
