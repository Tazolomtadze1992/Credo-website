import { videoSteps } from '../expats-data.mjs';
import { CORAL, FONT, INK, clamp01, createScene, easeInOut, lerp, progress, rgba } from './canvas.mjs';

/* E — "an account in 15 minutes" as a chronograph. The dial is the call;
   four arcs are the steps, a needle sweeps through them and the elapsed
   time reads in the middle. Proportions are illustrative. */

export const SEGMENTS = [[0, 1.5], [1.5, 4.5], [4.5, 11.5], [11.5, 15]];
export const SWEEP = [1700, 2500, 3300, 1900];
const LABELS = ['Call', 'Details', 'Verify', 'Account'];
const ang = m => (-90 + m / 15 * 360) * Math.PI / 180;
const GAP = .045;

export function createDial(canvas) {
  return createScene(canvas, (ctx, { t, now, live, width, height, step }) => {
    const R = Math.min(width, height) * .41, cx = width / 2, cy = height / 2;
    const [m0, m1] = SEGMENTS[step];
    const minute = lerp(m0, m1, easeInOut(progress(t, 250, SWEEP[step])));
    const finished = step === 3 ? progress(t, 250 + SWEEP[3], 500) : 0;

    // bezel and ticks
    ctx.lineCap = 'round';
    ctx.strokeStyle = rgba(INK, .1); ctx.lineWidth = 1;
    ctx.beginPath(); ctx.arc(cx, cy, R, 0, Math.PI * 2); ctx.stroke();
    for (let k = 0; k < 90; k++) {
      const m = k / 6, major = k % 6 === 0, a = ang(m), passed = m <= minute;
      const r0 = R * (major ? .875 : .905), r1 = R * .95;
      ctx.strokeStyle = rgba(INK, major ? (passed ? .75 : .38) : (passed ? .38 : .16)); ctx.lineWidth = major ? 1.6 : 1;
      ctx.beginPath(); ctx.moveTo(cx + Math.cos(a) * r0, cy + Math.sin(a) * r0); ctx.lineTo(cx + Math.cos(a) * r1, cy + Math.sin(a) * r1); ctx.stroke();
    }
    ctx.font = `500 ${Math.max(10, R * .045)}px ${FONT}`; ctx.fillStyle = rgba(INK, .5); ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    for (const m of [0, 5, 10]) { const a = ang(m), r = R * 1.06; ctx.fillText(m === 0 ? '15' : String(m), cx + Math.cos(a) * r, cy + Math.sin(a) * r); }

    // the four step arcs: base, then filled up to the needle
    const tr = R * .79, tw = Math.max(5, R * .028);
    ctx.lineWidth = tw;
    SEGMENTS.forEach(([a0, a1], i) => {
      const s0 = ang(a0) + GAP, s1 = ang(a1) - GAP;
      ctx.strokeStyle = i === step ? 'rgba(34,57,70,.12)' : 'rgba(34,57,70,.07)';
      ctx.beginPath(); ctx.arc(cx, cy, tr, s0, s1); ctx.stroke();
      const fillTo = Math.min(s1, ang(minute));
      if (fillTo > s0) { ctx.strokeStyle = rgba(CORAL, i < step ? .55 : 1); ctx.beginPath(); ctx.arc(cx, cy, tr, s0, fillTo); ctx.stroke(); }
      const mid = ang((a0 + a1) / 2), lr = tr - R * .1;
      ctx.font = `${i === step ? 600 : 500} ${Math.max(10, R * .042)}px ${FONT}`;
      ctx.fillStyle = rgba(INK, i === step ? .9 : .4);
      ctx.fillText(LABELS[i], cx + Math.cos(mid) * lr, cy + Math.sin(mid) * lr);
    });
    if (finished > 0) { // the full ring glows once the call is done
      ctx.strokeStyle = rgba(CORAL, .18 * (1 - finished)); ctx.lineWidth = tw + 18 * finished;
      ctx.beginPath(); ctx.arc(cx, cy, tr, 0, Math.PI * 2); ctx.stroke();
    }

    // needle: mounted on the ring, leaving the centre for the read-out
    const a = ang(minute), ca = Math.cos(a), sa = Math.sin(a);
    ctx.strokeStyle = rgba(INK, .85); ctx.lineWidth = 1.6;
    ctx.beginPath(); ctx.moveTo(cx + ca * R * .5, cy + sa * R * .5); ctx.lineTo(cx + ca * R * .97, cy + sa * R * .97); ctx.stroke();
    const glow = live ? .5 + .5 * Math.sin(now / 1000 * 4) : .5;
    ctx.fillStyle = rgba(CORAL, .18 + .12 * glow); ctx.beginPath(); ctx.arc(cx + ca * tr, cy + sa * tr, tw * 1.9, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#fff'; ctx.beginPath(); ctx.arc(cx + ca * tr, cy + sa * tr, tw * .95, 0, Math.PI * 2); ctx.fill();
    ctx.strokeStyle = rgba(CORAL, 1); ctx.lineWidth = 2; ctx.stroke();

    // read-out, fading out when the card takes the centre
    const readout = 1 - clamp01((step === 3 ? progress(t, 250 + SWEEP[3] - 200, 400) : 0));
    if (readout > 0) {
      ctx.globalAlpha = readout;
      const secs = Math.round(minute * 60), mm = String(Math.floor(secs / 60)).padStart(2, '0'), ss = String(secs % 60).padStart(2, '0');
      ctx.fillStyle = rgba(CORAL, 1); ctx.font = `500 ${Math.max(12, R * .055)}px ${FONT}`;
      ctx.fillText(videoSteps[step].title, cx, cy - R * .2);
      ctx.fillStyle = rgba(INK, 1); ctx.font = `600 ${R * .24}px ${FONT}`;
      if ('fontVariantNumeric' in ctx) ctx.fontVariantNumeric = 'tabular-nums';
      ctx.fillText(`${mm}:${ss}`, cx, cy + R * .02);
      ctx.fillStyle = rgba(INK, .5); ctx.font = `500 ${Math.max(11, R * .048)}px ${FONT}`;
      ctx.fillText('of about 15 minutes', cx, cy + R * .2);
      ctx.globalAlpha = 1;
    }
  });
}
