import { CARPET } from '../ExpMark';
import { loadImage } from '../../emigrants/steps/canvas-stage.mjs';
import { BLUE, CORAL, FONT, INK, clamp01, createScene, easeBack, easeInOut, easeOut, lerp, progress, rgba, roundRect } from './canvas.mjs';

/* D — the card is engraved while the call goes on, like security printing:
   1 the blank — outline, braided border and a guilloché field draw in;
   2 your details — number and name etched by a laser line;
   3 verification — a rosette seal, the chip and a holographic pass;
   4 the account — colour floods out of the seal and the card lifts. */

const LINES = 26, SEGS = 150;
const reveal = (step, k, t, dur, delay = 0) => step > k ? 1 : step === k ? progress(t, delay, dur) : 0;

function rosette(ctx, x, y, r, amount) {
  // hypotrochoid: R = 25, r = 9, d = 7 (scaled) — 25 fine lobes, closes after 9 turns
  const R = 25, rr = 9, d = 7, scale = r / (R - rr + d), turns = Math.PI * 2 * 9, steps = 2700;
  const end = Math.floor(steps * amount);
  ctx.beginPath();
  for (let k = 0; k <= end; k++) {
    const t = k / steps * turns;
    const px = (R - rr) * Math.cos(t) + d * Math.cos((R - rr) / rr * t), py = (R - rr) * Math.sin(t) - d * Math.sin((R - rr) / rr * t);
    if (k === 0) ctx.moveTo(x + px * scale, y + py * scale); else ctx.lineTo(x + px * scale, y + py * scale);
  }
  ctx.stroke();
}

function border(ctx, x0, y0, w, h, inset, amount, phase) {
  const pts = [], per = 2 * (w + h - 4 * inset), n = 520, end = Math.floor(n * amount);
  for (let k = 0; k <= end; k++) {
    let u = k / n * per, px, py, nx, ny;
    const W = w - 2 * inset, H = h - 2 * inset;
    if (u < W) { px = u; py = 0; nx = 0; ny = 1; } else if ((u -= W) < H) { px = W; py = u; nx = -1; ny = 0; }
    else if ((u -= H) < W) { px = W - u; py = H; nx = 0; ny = -1; } else { u -= W; px = 0; py = H - u; nx = 1; ny = 0; }
    const off = 3.2 * Math.sin(k / n * Math.PI * 2 * 90 + phase);
    pts.push([x0 + inset + px + nx * off, y0 + inset + py + ny * off]);
  }
  if (pts.length < 2) return;
  ctx.beginPath(); ctx.moveTo(...pts[0]); for (const p of pts) ctx.lineTo(...p); ctx.stroke();
}

function field(ctx, x0, y0, cw, ch, amountFor, color) {
  ctx.strokeStyle = color; ctx.lineWidth = .7;
  for (let j = 0; j < LINES; j++) {
    const amount = amountFor(j);
    if (amount <= 0) continue;
    const base = y0 + ch * (.1 + j * .8 / (LINES - 1)), end = Math.floor(SEGS * amount);
    ctx.beginPath();
    for (let k = 0; k <= end; k++) {
      const u = k / SEGS, x = x0 + cw * (.04 + u * .92);
      const env = Math.sin(u * Math.PI);
      const y = base + (Math.sin(u * 11 + j * .55) * 5 + Math.sin(u * 23 - j * .3) * 2.2) * env;
      if (k === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
    }
    ctx.stroke();
  }
}

export function createEngraving(canvas) {
  const carpet = loadImage(CARPET);
  return createScene(canvas, (ctx, { t, now, live, width, height, step }) => {
    const cw = Math.min(width * .8, 520, height * .62 * 1.586), ch = cw / 1.586;
    const lift = reveal(step, 3, t, 900, 1300);
    const bob = live && step === 3 ? Math.sin(now / 1000 * 1.2) * 3 * lift : 0;
    const cx = width / 2, cy = height * .47 - easeOut(lift) * 8 + bob;
    const x0 = cx - cw / 2, y0 = cy - ch / 2, radius = cw * .05;
    const sx = x0 + cw * .74, sy = y0 + ch * .42, sr = ch * .3;

    // 1 · the blank
    const outline = easeInOut(reveal(step, 0, t, 1100));
    const flood = easeInOut(reveal(step, 3, t, 1300));
    if (flood > 0) {
      ctx.save();
      ctx.shadowColor = `rgba(2,48,66,${.35 * lift})`; ctx.shadowBlur = 50 * lift; ctx.shadowOffsetY = 26 * lift;
      roundRect(ctx, x0, y0, cw, ch, radius); ctx.clip();
      ctx.beginPath(); ctx.arc(sx, sy, Math.hypot(cw, ch) * 1.05 * flood, 0, Math.PI * 2);
      const g = ctx.createRadialGradient(sx, sy, 0, sx, sy, Math.hypot(cw, ch));
      g.addColorStop(0, '#0a7fb5'); g.addColorStop(.45, '#006393'); g.addColorStop(1, '#023b55');
      ctx.fillStyle = g; ctx.fill();
      ctx.restore();
      if (lift > 0) { // drop shadow under the finished card
        ctx.save(); ctx.globalCompositeOperation = 'destination-over';
        ctx.shadowColor = `rgba(2,48,66,${.3 * lift})`; ctx.shadowBlur = 44; ctx.shadowOffsetY = 24;
        ctx.fillStyle = '#023b55'; roundRect(ctx, x0 + 10, y0 + 12, cw - 20, ch - 14, radius); ctx.fill(); ctx.restore();
      }
    } else {
      ctx.fillStyle = rgba([255, 255, 255], outline); roundRect(ctx, x0, y0, cw, ch, radius); ctx.fill();
    }

    ctx.save();
    roundRect(ctx, x0, y0, cw, ch, radius); ctx.clip();
    const ink = a => flood >= 1 ? `rgba(255,255,255,${a * .55})` : rgba(BLUE, a);
    field(ctx, x0, y0, cw, ch, j => easeInOut(reveal(step, 0, t, 1500, 250 + j * 30)), ink(.26));
    ctx.lineWidth = .8; ctx.strokeStyle = ink(.4);
    border(ctx, x0, y0, cw, ch, 9, easeInOut(reveal(step, 0, t, 1600, 200)), 0);
    ctx.strokeStyle = ink(.25);
    border(ctx, x0, y0, cw, ch, 9, easeInOut(reveal(step, 0, t, 1600, 300)), Math.PI);
    if (flood > 0 && flood < 1) { // the field turns white inside the spreading colour
      ctx.save(); ctx.beginPath(); ctx.arc(sx, sy, Math.hypot(cw, ch) * 1.05 * flood, 0, Math.PI * 2); ctx.clip();
      field(ctx, x0, y0, cw, ch, () => 1, 'rgba(255,255,255,.16)');
      ctx.restore();
    }
    ctx.restore();

    // outline and the engraver's head travelling round it
    ctx.lineWidth = 1.2; ctx.strokeStyle = flood >= 1 ? 'rgba(255,255,255,.18)' : rgba(INK, .5);
    if (outline > 0) {
      ctx.save(); ctx.setLineDash([outline * 2 * (cw + ch) * 1.02, 4 * (cw + ch)]);
      roundRect(ctx, x0, y0, cw, ch, radius); ctx.stroke(); ctx.restore();
      if (outline < 1) {
        let u = outline * 2 * (cw + ch), hx, hy;
        if (u < cw) { hx = x0 + u; hy = y0; } else if ((u -= cw) < ch) { hx = x0 + cw; hy = y0 + u; } else if ((u -= ch) < cw) { hx = x0 + cw - u; hy = y0 + ch; } else { hx = x0; hy = y0 + ch - (u - cw); }
        ctx.fillStyle = rgba(CORAL, .25); ctx.beginPath(); ctx.arc(hx, hy, 9, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = rgba(CORAL, 1); ctx.beginPath(); ctx.arc(hx, hy, 3, 0, Math.PI * 2); ctx.fill();
      }
    }

    // 2 · details, etched left to right
    const txt = flood > .6 ? '#fff' : rgba(INK, .88), sub = flood > .6 ? 'rgba(255,255,255,.7)' : rgba(INK, .5);
    const etch = (text, x, y, size, weight, color, p, spacing = 0) => {
      if (p <= 0) return;
      ctx.save();
      ctx.font = `${weight} ${size}px ${FONT}`; ctx.letterSpacing = `${spacing}px`;
      const w = ctx.measureText(text).width, edge = x + w * p;
      ctx.beginPath(); ctx.rect(x - 2, y - size, w * p + 2, size * 1.6); ctx.clip();
      ctx.fillStyle = color; ctx.textBaseline = 'alphabetic'; ctx.fillText(text, x, y);
      ctx.restore();
      if (p < 1) {
        const grad = ctx.createLinearGradient(edge - 26, 0, edge, 0);
        grad.addColorStop(0, rgba(CORAL, 0)); grad.addColorStop(1, rgba(CORAL, .45));
        ctx.fillStyle = grad; ctx.fillRect(edge - 26, y - size, 26, size * 1.4);
        ctx.fillStyle = rgba(CORAL, 1); ctx.fillRect(edge - 1, y - size - 3, 2, size * 1.4 + 6);
      }
    };
    const fs = cw / 520;
    etch('Credo Bank', x0 + cw * .07, y0 + ch * .17, 19 * fs, 600, txt, easeOut(reveal(step, 1, t, 700, 150)));
    etch('4821  0360  1123  2026', x0 + cw * .07, y0 + ch * .66, 22 * fs, 500, txt, easeInOut(reveal(step, 1, t, 1200, 700)), 1.5 * fs);
    etch('Card holder', x0 + cw * .07, y0 + ch * .8, 10 * fs, 500, sub, easeOut(reveal(step, 1, t, 400, 1700)));
    etch('Sam Taylor', x0 + cw * .07, y0 + ch * .89, 16 * fs, 500, txt, easeInOut(reveal(step, 1, t, 800, 1900)));
    etch('Valid thru', x0 + cw * .52, y0 + ch * .8, 10 * fs, 500, sub, easeOut(reveal(step, 1, t, 400, 2300)));
    etch('11 / 30', x0 + cw * .52, y0 + ch * .89, 16 * fs, 500, txt, easeInOut(reveal(step, 1, t, 600, 2500)));

    // 3 · verification: rosette seal, chip, holographic pass
    const ros = easeInOut(reveal(step, 2, t, 1900, 200));
    if (ros > 0) {
      ctx.lineWidth = .8; ctx.strokeStyle = flood > .3 ? 'rgba(255,255,255,.55)' : rgba(CORAL, .75);
      rosette(ctx, sx, sy, sr, ros);
      ctx.strokeStyle = flood > .3 ? 'rgba(255,255,255,.3)' : rgba(CORAL, .35);
      rosette(ctx, sx, sy, sr * .62, ros);
    }
    const chip = easeBack(reveal(step, 2, t, 500, 1500));
    if (chip > 0) {
      const w = cw * .11, h = w * .78, x = x0 + cw * .07, y = y0 + ch * .3;
      ctx.save(); ctx.translate(x + w / 2, y + h / 2); ctx.scale(chip, chip); ctx.translate(-w / 2, -h / 2);
      const cg = ctx.createLinearGradient(0, 0, w, h); cg.addColorStop(0, '#ecdcae'); cg.addColorStop(.5, '#b99a5b'); cg.addColorStop(1, '#e7cf95');
      ctx.fillStyle = cg; roundRect(ctx, 0, 0, w, h, w * .18); ctx.fill();
      ctx.strokeStyle = 'rgba(0,0,0,.18)'; ctx.lineWidth = .8;
      ctx.beginPath(); ctx.moveTo(w * .33, 0); ctx.lineTo(w * .33, h); ctx.moveTo(w * .67, 0); ctx.lineTo(w * .67, h); ctx.moveTo(0, h / 2); ctx.lineTo(w * .33, h / 2); ctx.moveTo(w * .67, h / 2); ctx.lineTo(w, h / 2); ctx.stroke();
      ctx.restore();
    }
    const holo = reveal(step, 2, t, 1100, 2500);
    if (holo > 0 && holo < 1) {
      ctx.save(); roundRect(ctx, x0, y0, cw, ch, radius); ctx.clip();
      const hx = lerp(x0 - cw * .4, x0 + cw * 1.4, easeInOut(holo));
      const hg = ctx.createLinearGradient(hx - cw * .22, y0, hx + cw * .22, y0 + ch * .5);
      hg.addColorStop(0, 'rgba(252,98,80,0)'); hg.addColorStop(.35, 'rgba(252,98,80,.16)'); hg.addColorStop(.5, 'rgba(255,255,255,.5)'); hg.addColorStop(.65, 'rgba(30,110,145,.16)'); hg.addColorStop(1, 'rgba(30,110,145,0)');
      ctx.fillStyle = hg; ctx.fillRect(x0, y0, cw, ch);
      ctx.restore();
    }
    const tick = reveal(step, 2, t, 450, 3400);
    if (tick > 0 && flood < .3) {
      const s = sr * .42, a0 = [sx - s * .45, sy + s * .02], a1 = [sx - s * .1, sy + s * .36], a2 = [sx + s * .5, sy - s * .34];
      const l1 = Math.hypot(a1[0] - a0[0], a1[1] - a0[1]), l2 = Math.hypot(a2[0] - a1[0], a2[1] - a1[1]), d = easeOut(tick) * (l1 + l2);
      ctx.save(); ctx.globalAlpha = 1 - clamp01(flood / .3);
      ctx.lineCap = 'round'; ctx.lineJoin = 'round'; ctx.beginPath(); ctx.moveTo(...a0);
      if (d <= l1) ctx.lineTo(lerp(a0[0], a1[0], d / l1), lerp(a0[1], a1[1], d / l1)); else { ctx.lineTo(...a1); ctx.lineTo(lerp(a1[0], a2[0], (d - l1) / l2), lerp(a1[1], a2[1], (d - l1) / l2)); }
      ctx.strokeStyle = '#fff'; ctx.lineWidth = 8; ctx.stroke(); ctx.strokeStyle = rgba(CORAL, 1); ctx.lineWidth = 4; ctx.stroke();
      ctx.restore();
    }

    // 4 · the brand medallion settles into the seal
    const medal = easeBack(reveal(step, 3, t, 700, 900));
    if (medal > 0 && carpet.complete && carpet.naturalWidth) {
      const r = sr * .5 * medal;
      ctx.save();
      ctx.beginPath(); ctx.arc(sx, sy, r + 3, 0, Math.PI * 2); ctx.fillStyle = 'rgba(255,255,255,.95)'; ctx.fill();
      ctx.beginPath(); ctx.arc(sx, sy, r, 0, Math.PI * 2); ctx.clip();
      ctx.drawImage(carpet, sx - r, sy - r, r * 2, r * 2);
      ctx.restore();
    }
  });
}
