/* Bakes public/assets/emigrants/head-scan.bin for the step 2 face scan
   (app/emigrants/steps/face-scan.mjs).

   Source: "Infinite, 3D Head Scan" by Lee Perry-Smith (Infinite Realities),
   CC BY 3.0 — LeePerrySmith.glb from the three.js repository
   (examples/models/gltf/LeePerrySmith/). The GLB itself is not checked in.

   Usage: node scripts/bake-head-scan.mjs path/to/LeePerrySmith.glb public/assets/emigrants/head-scan.bin
   Every setting below can be overridden from the environment, e.g. NOSE=.8 node scripts/bake-head-scan.mjs …

   The head is cut into horizontal slices. Each slice's outline is traced by
   casting rays out from its centre, then points are laid evenly along it, so
   the dots sit on contour lines like a 3D scanner's. Saved as Int16
   [x, y, z, nx, ny, nz] in normalised head units (position × 20000,
   normal × 32767), ordered top to bottom. */
import { readFileSync, writeFileSync } from 'node:fs';

function loadMesh(file) {
  const buf = readFileSync(file);
  const jsonLen = buf.readUInt32LE(12);
  const json = JSON.parse(buf.slice(20, 20 + jsonLen).toString());
  const binStart = 20 + jsonLen + 8;
  const view = (accIndex, Ctor, comps) => {
    const acc = json.accessors[accIndex], bv = json.bufferViews[acc.bufferView];
    const offset = binStart + (bv.byteOffset || 0) + (acc.byteOffset || 0);
    const ab = buf.buffer.slice(buf.byteOffset + offset, buf.byteOffset + offset + acc.count * comps * Ctor.BYTES_PER_ELEMENT);
    return new Ctor(ab);
  };
  const prim = json.meshes[0].primitives[0];
  return { pos: view(prim.attributes.POSITION, Float32Array, 3), nor: view(prim.attributes.NORMAL, Float32Array, 3), idx: view(prim.indices, Uint16Array, 1) };
}

const [file, out] = process.argv.slice(2);
if (!file || !out) { console.error('usage: node scripts/bake-head-scan.mjs <LeePerrySmith.glb> <out.bin>'); process.exit(1); }
// Mesh units → head units: centred on the skull, crown at about y = 1.
const ORIGIN = [-.07, 1.3, .2], SCALE = .4;
const env = (name, value) => +(process.env[name] ?? value);
const SMOOTH = env('SMOOTH', 8);              // Taubin passes: irons out creases and skin texture
const SLIM = env('SLIM', .16);                // narrows the jaw and neck by up to 16%
const NOSE = env('NOSE', .7);                 // how much of the nose's height off the face to take away
const CHIN = env('CHIN', .3);                 // how far the chin sets back, in mesh units
const FILL = env('FILL', 1.6);                // shallower eye sockets and brow, rounder cheeks, fuller lips
const NECK = env('NECK', .16);                // extra slimming for the neck

const { pos, nor, idx } = soften(loadMesh(file));

/* Softer, more delicate features: weld the scan's split vertices, relax the
   surface with Taubin smoothing (which keeps the volume), make the nose
   smaller, set the chin back, taper the jaw, then rebuild normals.
   Landmarks (mesh units, midline x ≈ -0.07): nose tip y 1.05 z 2.59,
   cheek plane z ≈ 2.15, lips y 0.3–0.6, chin y -0.15–-0.45. */
function soften({ pos, idx }) {
  const key = i => `${Math.round(pos[i * 3] * 1e4)},${Math.round(pos[i * 3 + 1] * 1e4)},${Math.round(pos[i * 3 + 2] * 1e4)}`;
  const ids = new Map(), remap = new Uint32Array(pos.length / 3), welded = [];
  for (let i = 0; i < remap.length; i++) {
    const k = key(i);
    if (!ids.has(k)) { ids.set(k, welded.length / 3); welded.push(pos[i * 3], pos[i * 3 + 1], pos[i * 3 + 2]); }
    remap[i] = ids.get(k);
  }
  const P = Float32Array.from(welded), n = P.length / 3, faces = Uint32Array.from(idx, i => remap[i]);
  const links = Array.from({ length: n }, () => new Set());
  for (let t = 0; t < faces.length; t += 3) for (let k = 0; k < 3; k++) {
    const a = faces[t + k], b = faces[t + (k + 1) % 3];
    links[a].add(b); links[b].add(a);
  }
  const relax = (factor, P) => {
    const next = new Float32Array(P);
    for (let i = 0; i < n; i++) {
      if (!links[i].size) continue;
      let x = 0, y = 0, z = 0;
      for (const j of links[i]) { x += P[j * 3]; y += P[j * 3 + 1]; z += P[j * 3 + 2]; }
      const s = links[i].size;
      next[i * 3] += (x / s - P[i * 3]) * factor; next[i * 3 + 1] += (y / s - P[i * 3 + 1]) * factor; next[i * 3 + 2] += (z / s - P[i * 3 + 2]) * factor;
    }
    P.set(next);
  };
  for (let i = 0; i < SMOOTH; i++) { relax(.5, P); relax(-.53, P); }
  const bell = (v, centre, width) => Math.exp(-(((v - centre) / width) ** 2));
  const smooth01 = v => { const f = Math.min(1, Math.max(0, v)); return f * f * (3 - 2 * f); };
  for (let i = 0; i < n; i++) {
    let x = P[i * 3], y = P[i * 3 + 1], z = P[i * 3 + 2];
    const dx = x - ORIGIN[0], front = smooth01((z - 1.2) / .6);
    // nose: lower it towards the cheeks and narrow it
    const nose = bell(dx, 0, .32) * bell(y, 1.2, .38) * front;
    z -= nose * NOSE * Math.max(0, z - 2.12);
    x = ORIGIN[0] + dx * (1 - nose * .18);
    // chin: set back so it sits behind the lips
    z -= bell(dx, 0, .55) * bell(y, -.35, .35) * front * CHIN;
    // shallower eye sockets, a flatter brow, rounder cheeks, fuller lips
    const side = Math.abs(dx);
    z += FILL * front * (
      .1 * bell(side, .5, .22) * bell(y, 1.75, .22)        // eye sockets
      - .07 * bell(side, .4, .45) * bell(y, 2.2, .14)      // brow ridge
      + .07 * bell(side, .75, .3) * bell(y, 1.05, .35)     // cheeks
      + .05 * bell(dx, 0, .32) * bell(y, .45, .14));       // lips
    // jaw and neck taper
    const neck = NECK * smooth01((-.4 - y) / .5);
    const taper = (1 - SLIM * smooth01((1.1 - y) / 1.6)) * (1 - neck);
    P[i * 3] = ORIGIN[0] + (x - ORIGIN[0]) * taper; P[i * 3 + 2] = .1 + (z - .1) * (1 - neck * .8);
  }
  const N = new Float32Array(n * 3);
  for (let t = 0; t < faces.length; t += 3) {
    const [a, b, c] = [faces[t], faces[t + 1], faces[t + 2]];
    const ux = P[b * 3] - P[a * 3], uy = P[b * 3 + 1] - P[a * 3 + 1], uz = P[b * 3 + 2] - P[a * 3 + 2];
    const vx = P[c * 3] - P[a * 3], vy = P[c * 3 + 1] - P[a * 3 + 1], vz = P[c * 3 + 2] - P[a * 3 + 2];
    const fx = uy * vz - uz * vy, fy = uz * vx - ux * vz, fz = ux * vy - uy * vx;
    for (const v of [a, b, c]) { N[v * 3] += fx; N[v * 3 + 1] += fy; N[v * 3 + 2] += fz; }
  }
  // keep the scan's outward orientation: the nose tip faces +z
  let tip = 0;
  for (let i = 1; i < n; i++) if (P[i * 3 + 2] > P[tip * 3 + 2]) tip = i;
  const flip = N[tip * 3 + 2] < 0 ? -1 : 1;
  for (let i = 0; i < n; i++) {
    const l = Math.hypot(N[i * 3], N[i * 3 + 1], N[i * 3 + 2]) || 1;
    N[i * 3] *= flip / l; N[i * 3 + 1] *= flip / l; N[i * 3 + 2] *= flip / l;
  }
  return { pos: P, nor: N, idx: faces };
}
const TOP = 3.98, BOTTOM = -1.5;          // crown to the base of the neck, in mesh units
const ROW = .032 / SCALE, SPACING = .03 / SCALE, AROUND = 720;

const data = [];
for (let y = TOP - ROW * .3; y > BOTTOM; y -= ROW) {
  // every triangle edge crossing this height gives one end of an outline segment
  const segs = [];
  for (let t = 0; t < idx.length; t += 3) {
    const ends = [];
    for (let k = 0; k < 3; k++) {
      const a = idx[t + k], b = idx[t + (k + 1) % 3], ya = pos[a * 3 + 1], yb = pos[b * 3 + 1];
      if ((ya - y) * (yb - y) >= 0) continue;
      const f = (y - ya) / (yb - ya), lerp = (arr, i) => arr[a * 3 + i] + (arr[b * 3 + i] - arr[a * 3 + i]) * f;
      ends.push({ x: lerp(pos, 0), z: lerp(pos, 2), n: [lerp(nor, 0), lerp(nor, 1), lerp(nor, 2)] });
    }
    if (ends.length === 2) segs.push(ends);
  }
  if (segs.length < 8) continue;
  let cx = 0, cz = 0, total = 0;
  for (const [p, q] of segs) { const l = Math.hypot(q.x - p.x, q.z - p.z); cx += (p.x + q.x) / 2 * l; cz += (p.z + q.z) / 2 * l; total += l; }
  cx /= total; cz /= total;

  // outermost hit along each ray from the slice centre
  const ring = [];
  for (let i = 0; i < AROUND; i++) {
    const a = i / AROUND * Math.PI * 2, dx = Math.sin(a), dz = Math.cos(a);
    let best = -1, normal = null;
    for (const [p, q] of segs) {
      const ex = q.x - p.x, ez = q.z - p.z, den = dx * ez - dz * ex;
      if (Math.abs(den) < 1e-12) continue;
      const wx = p.x - cx, wz = p.z - cz;
      const r = (wx * ez - wz * ex) / den, s = (wx * dz - wz * dx) / den;
      if (r > best && s >= 0 && s <= 1) { best = r; normal = p.n.map((v, k) => v + (q.n[k] - v) * s); }
    }
    if (best > 0) ring.push({ x: cx + dx * best, z: cz + dz * best, n: normal });
  }
  if (ring.length < 3) continue;

  // even spacing along the outline, starting at the back of the head
  let carry = SPACING * .5;
  for (let i = 0; i < ring.length; i++) {
    const p = ring[i], q = ring[(i + 1) % ring.length], segment = Math.hypot(q.x - p.x, q.z - p.z);
    while (carry < segment) {
      const f = carry / segment, n = p.n.map((v, k) => v + (q.n[k] - v) * f), nl = Math.hypot(...n) || 1;
      const x = (p.x + (q.x - p.x) * f - ORIGIN[0]) * SCALE, yy = (y - ORIGIN[1]) * SCALE, z = (p.z + (q.z - p.z) * f - ORIGIN[2]) * SCALE;
      data.push(Math.round(x * 20000), Math.round(yy * 20000), Math.round(z * 20000), Math.round(n[0] / nl * 32767), Math.round(n[1] / nl * 32767), Math.round(n[2] / nl * 32767));
      carry += SPACING;
    }
    carry -= segment;
  }
}
writeFileSync(out, Buffer.from(new Int16Array(data).buffer));
const ys = data.filter((_, i) => i % 6 === 1).map(v => v / 20000);
console.log({ points: data.length / 6, bytes: data.length * 2, yMin: Math.min(...ys).toFixed(3), yMax: Math.max(...ys).toFixed(3) });
