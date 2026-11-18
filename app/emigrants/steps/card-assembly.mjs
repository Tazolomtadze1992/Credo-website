import { clamp01, createCanvasStage, easeBack, easeInOut, easeOut, lerp, progress, seeded } from './canvas-stage.mjs';

/* Step 3 — the emigrant card builds itself. Georgian letters orbit an empty
   card outline; the card's tiles fly in and lock into place, and the letters
   leave the orbit to land in their slots on the finished card. */

const ALPHABET = 'აბგდევზთიკლმნოპჟრსტუფქღყშჩცძწჭხჯჰ';
// The card's 8 × 6 letter grid; * marks the white letters.
const GRID = [
  'ჯ ლ* ო* ჟ კ* ფ ყ ვ',
  'ლ ძ ხ რ* ბ ჩ გ ლ',
  'უ წ შ ც ჭ ე* ჰ წ',
  'ყ ქ ფ გ პ ზ რ ა',
  'ს ნ მ ლ* ქ ჯ შ ჭ',
  'ვ თ ი ზ ტ ო* ნ ვ',
].map(row => row.split(' ').map(cell => ({ glyph: cell[0], white: cell.endsWith('*') })));
const COLS = 8, ROWS = 6, TILE_COLS = 4, TILE_ROWS = 2;
const TILE_ORDER = [0, 5, 2, 7, 1, 6, 3, 4];
const T = { outline: 0, tilesFrom: 650, tileGap: 165, flight: 620, trace: 260, fill: 320, cardMarks: 3150, sheen: 3350, chip: 3900 };
const INK = 'rgba(34,57,70,', PEACH = [255, 222, 211], FONT = '"Georgian", system-ui, sans-serif';

const rand = seeded(26);
const tiles = TILE_ORDER.map((slot, order) => {
  const col = slot % TILE_COLS, row = Math.floor(slot / TILE_COLS);
  const land = T.tilesFrom + order * T.tileGap + T.flight;
  const angle = Math.atan2(row - .5, col - 1.5) + (rand() - .5) * .9;
  return { col, row, land, angle, distance: .55 + rand() * .45, spin: (rand() - .5) * 1.6, flip: (.7 + rand() * .6) * (rand() < .5 ? -1 : 1) };
});
const tileAt = (col, row) => tiles.find(tile => tile.col === Math.floor(col / 2) && tile.row === Math.floor(row / 3));

const ORBITERS = 150;
const orbiters = Array.from({ length: ORBITERS }, (_, i) => ({
  angle: i / ORBITERS * Math.PI * 2 + rand() * .3,
  radius: .82 + rand() * .55,
  speed: .2 + rand() * .1,
  wobble: rand() * Math.PI * 2,
  size: .8 + rand() * .4,
  dot: i % 5 > 1,
  glyph: Math.floor(rand() * ALPHABET.length),
  tone: rand() < .16 ? 'coral' : 'ink',
}));
// 48 orbiters (never the plain dots) become the card's letters.
const letters = [];
{
  const pool = orbiters.map((o, i) => i).filter(i => !orbiters[i].dot);
  for (let row = 0; row < ROWS; row++) for (let col = 0; col < COLS; col++) {
    const tile = tileAt(col, row);
    const pick = pool.splice(Math.floor(rand() * pool.length), 1)[0];
    orbiters[pick].letter = letters.length;
    letters.push({ col, row, ...GRID[row][col], orbiter: pick, leave: tile.land - 520 + rand() * 260, flight: 680 + rand() * 160 });
  }
}

function roundRect(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y); ctx.arcTo(x + w, y, x + w, y + h, r); ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r); ctx.arcTo(x, y, x + w, y, r); ctx.closePath();
}

function perimeter(ctx, x, y, w, h, amount) {
  // a stroke that travels around the tile, starting top-left
  const total = 2 * (w + h); let left = amount * total;
  ctx.beginPath(); ctx.moveTo(x, y);
  for (const [dx, dy, len] of [[1, 0, w], [0, 1, h], [-1, 0, w], [0, -1, h]]) {
    const step = Math.min(left, len); left -= step;
    x += dx * step; y += dy * step; ctx.lineTo(x, y);
    if (left <= 0) break;
  }
  ctx.stroke();
}

export function createCardAssembly(canvas) {
  return createCanvasStage(canvas, (ctx, { t, now, live, width, height }) => {
    const cw = Math.min(width * .6, 410, height * .56 * 1.586), ch = cw / 1.586;
    const cx = width / 2, cy = height * .46 + (live ? Math.sin(Math.max(0, t - 4000) / 1000 * 1.3) * 3 * clamp01((t - 4000) / 600) : 0);
    const x0 = cx - cw / 2, y0 = cy - ch / 2, radius = cw * .045, tw = cw / TILE_COLS, th = ch / TILE_ROWS;
    const orbitTime = (live ? t : 4200) / 1000;
    const rx = Math.min(cw * .92, width * .47), ry = ch * 1.05, tilt = -.2, ct = Math.cos(tilt), st = Math.sin(tilt);
    const finished = progress(t, tiles[tiles.length - 1].land + T.trace + T.fill, 400);

    const orbitAt = (o, time) => {
      const a = o.angle + time * o.speed, r = o.radius + Math.sin(time * .8 + o.wobble) * .05;
      const ex = Math.cos(a) * rx * r, ey = Math.sin(a) * ry * r * .55;
      return { x: cx + ex * ct - ey * st, y: cy + ex * st + ey * ct, depth: Math.sin(a) };
    };
    const glyphAt = (o, time) => ALPHABET[(o.glyph + Math.floor(time * 7 + o.wobble * 3)) % ALPHABET.length];

    const drawOrbiter = (o, front) => {
      if (o.letter !== undefined && t >= letters[o.letter].leave) return;
      const p = orbitAt(o, orbitTime);
      if ((p.depth >= 0) !== front) return;
      const near = (p.depth + 1) / 2, alpha = (.26 + .6 * near) * (1 - finished * .3);
      const intro = easeOut(progress(t, 0, 700));
      ctx.globalAlpha = alpha * intro;
      if (o.dot) {
        const size = (1.4 + near * 1.6) * o.size;
        ctx.fillStyle = o.tone === 'coral' ? '#fc6250' : '#223946';
        ctx.fillRect(p.x - size / 2, p.y - size / 2, size, size);
      } else {
        ctx.fillStyle = o.tone === 'coral' ? '#fc6250' : '#223946';
        ctx.font = `500 ${(10 + near * 6) * o.size}px ${FONT}`;
        ctx.fillText(glyphAt(o, orbitTime), p.x, p.y);
      }
      ctx.globalAlpha = 1;
    };

    ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    for (const o of orbiters) drawOrbiter(o, false);

    // skeleton: dashed card outline and slot dots, until the tiles cover it
    const outline = easeOut(progress(t, T.outline, 500)) * (1 - finished);
    if (outline > 0) {
      ctx.setLineDash([5, 5]); ctx.lineWidth = 1.2; ctx.strokeStyle = `${INK}${.35 * outline})`;
      roundRect(ctx, x0, y0, cw, ch, radius); ctx.stroke(); ctx.setLineDash([]);
      ctx.fillStyle = `${INK}${.14 * outline})`;
      for (const l of letters) {
        if (t >= tileAt(l.col, l.row).land) continue;
        ctx.beginPath(); ctx.arc(x0 + (0.096 + l.col * .1155) * cw, y0 + (.12 + l.row * .153) * ch, 1.8, 0, Math.PI * 2); ctx.fill();
      }
    }

    // tiles: dashed frames fly and flip in, a coral edge traces them, then they fill
    const fillGradient = ctx.createLinearGradient(x0, y0, x0 + cw * .35, y0 + ch);
    fillGradient.addColorStop(0, '#e25a43'); fillGradient.addColorStop(.55, '#dc4838'); fillGradient.addColorStop(1, '#d43a2f');
    for (const tile of tiles) {
      const tx = x0 + tile.col * tw, ty = y0 + tile.row * th;
      const fly = easeOut(progress(t, tile.land - T.flight, T.flight));
      if (fly <= 0) continue;
      const fill = easeOut(progress(t, tile.land + T.trace * .6, T.fill));
      if (fly < 1) {
        const off = (1 - fly) * tile.distance * cw;
        ctx.save();
        ctx.translate(tx + tw / 2 + Math.cos(tile.angle) * off, ty + th / 2 + Math.sin(tile.angle) * off);
        ctx.rotate(tile.spin * (1 - fly));
        ctx.scale(Math.max(.08, Math.abs(Math.cos(tile.flip * (1 - fly) * 1.4))), 1);
        ctx.fillStyle = `rgba(252,98,80,${.05 + .07 * fly})`; ctx.fillRect(-tw / 2, -th / 2, tw, th);
        ctx.setLineDash([4, 4]); ctx.lineWidth = 1; ctx.strokeStyle = `${INK}${.3 + .35 * fly})`;
        ctx.strokeRect(-tw / 2, -th / 2, tw, th); ctx.setLineDash([]);
        ctx.restore();
        continue;
      }
      if (fill > 0) {
        ctx.save();
        roundRect(ctx, x0, y0, cw, ch, radius); ctx.clip();
        ctx.globalAlpha = fill; ctx.fillStyle = fillGradient;
        ctx.fillRect(tx - .5, ty - .5, tw + 1, th + 1);
        ctx.restore();
      }
      const trace = progress(t, tile.land, T.trace), fade = 1 - progress(t, tile.land + T.trace, 380);
      if (fade > 0) {
        ctx.lineWidth = 1.4; ctx.strokeStyle = `rgba(252,98,80,${.9 * fade})`;
        if (fill < 1) { ctx.setLineDash([4, 4]); ctx.strokeStyle = `${INK}${.35 * fade})`; ctx.strokeRect(tx, ty, tw, th); ctx.setLineDash([]); ctx.strokeStyle = `rgba(252,98,80,${.9 * fade})`; }
        perimeter(ctx, tx, ty, tw, th, easeInOut(trace));
      }
    }

    // a soft depth shadow once the card exists
    if (finished > 0) {
      ctx.save();
      ctx.globalCompositeOperation = 'destination-over';
      ctx.shadowColor = `rgba(122,36,24,${.28 * finished})`; ctx.shadowBlur = 40; ctx.shadowOffsetY = 18;
      ctx.fillStyle = '#dc4838'; roundRect(ctx, x0 + 6, y0 + 8, cw - 12, ch - 10, radius); ctx.fill();
      ctx.restore();
    }

    // letters leave the orbit and land in their slots
    for (const l of letters) {
      const o = orbiters[l.orbiter];
      const fp = progress(t, l.leave, l.flight);
      if (fp <= 0) continue;
      const tx = x0 + (0.096 + l.col * .1155) * cw, ty = y0 + (.12 + l.row * .153) * ch;
      const from = orbitAt(o, (live ? l.leave : 4200) / 1000);
      const e = easeInOut(fp), landed = fp >= 1;
      const x = lerp(from.x, tx, e), y = lerp(from.y, ty, e) - Math.sin(e * Math.PI) * 18;
      const size = lerp((10 + (from.depth + 1) * 3) * o.size, cw * .055, e);
      const glow = landed ? 1 - progress(t, l.leave + l.flight, 500) : 0;
      ctx.font = `500 ${size}px ${FONT}`;
      if (landed) ctx.fillStyle = l.white ? '#fff' : `rgba(${PEACH[0]},${PEACH[1]},${PEACH[2]},${.62 + glow * .38})`;
      else ctx.fillStyle = e < .6 ? `rgba(34,57,70,${.7})` : `rgba(255,255,255,${.75 + e * .25})`;
      ctx.fillText(landed ? l.glyph : glyphAt(o, (l.leave + fp * l.flight) / 1000 * 1.6), x, y);
    }

    // card network mark, then a sheen across the finished card
    const marks = easeBack(progress(t, T.cardMarks, 520));
    if (marks > 0) {
      const mr = cw * .042, my = y0 + ch * .8, mx = x0 + cw * .835;
      ctx.save();
      ctx.translate(mx, my); ctx.scale(marks, marks);
      ctx.fillStyle = 'rgba(255,255,255,.62)'; ctx.beginPath(); ctx.arc(mr * 1.2, 0, mr, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = 'rgba(255,255,255,.96)'; ctx.beginPath(); ctx.arc(0, 0, mr, 0, Math.PI * 2); ctx.fill();
      ctx.restore();
    }
    const sheen = progress(t, T.sheen, 900);
    if (sheen > 0 && sheen < 1) {
      ctx.save();
      roundRect(ctx, x0, y0, cw, ch, radius); ctx.clip();
      const sx = lerp(x0 - cw * .5, x0 + cw * 1.3, easeInOut(sheen));
      const g = ctx.createLinearGradient(sx - cw * .25, y0, sx + cw * .25, y0 + ch * .4);
      g.addColorStop(0, 'rgba(255,255,255,0)'); g.addColorStop(.5, 'rgba(255,255,255,.26)'); g.addColorStop(1, 'rgba(255,255,255,0)');
      ctx.fillStyle = g; ctx.fillRect(x0, y0, cw, ch);
      ctx.restore();
    }

    for (const o of orbiters) drawOrbiter(o, true);
  });
}
