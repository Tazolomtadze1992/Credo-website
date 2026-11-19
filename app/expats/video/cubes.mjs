import { createScene, rgba, INK, seeded } from './canvas.mjs';

/* AccessGrid's backdrop: dashed wireframe cubes tumbling slowly behind the
   product UI. Positions avoid the centre, where the dialog sits. */
const rand = seeded(19);
const CUBES = [[.1, .2], [.88, .14], [.16, .78], [.9, .66], [.32, .06], [.7, .92], [.05, .5]].map(([x, y]) => ({
  x, y, size: 22 + rand() * 26, yaw: rand() * 6, pitch: .5 + rand() * .5, spin: (rand() - .5) * .25, bob: rand() * 6, alpha: .2 + rand() * .2,
}));
const CORNERS = [[-1, -1, -1], [1, -1, -1], [1, 1, -1], [-1, 1, -1], [-1, -1, 1], [1, -1, 1], [1, 1, 1], [-1, 1, 1]];
const EDGES = [[0, 1], [1, 2], [2, 3], [3, 0], [4, 5], [5, 6], [6, 7], [7, 4], [0, 4], [1, 5], [2, 6], [3, 7]];

export function createCubes(canvas) {
  return createScene(canvas, (ctx, { now, width, height }) => {
    const time = now / 1000;
    ctx.setLineDash([3, 4]); ctx.lineWidth = 1;
    for (const c of CUBES) {
      const yaw = c.yaw + time * c.spin, pitch = c.pitch + Math.sin(time * .2 + c.bob) * .15;
      const cy = Math.cos(yaw), sy = Math.sin(yaw), cp = Math.cos(pitch), sp = Math.sin(pitch);
      const ox = c.x * width, oy = c.y * height + Math.sin(time * .35 + c.bob) * 6;
      const pts = CORNERS.map(([x, y, z]) => {
        const rx = x * cy + z * sy, rz = -x * sy + z * cy;
        const ry = y * cp - rz * sp, rz2 = y * sp + rz * cp;
        const f = 1 / (1 + rz2 * .12);
        return [ox + rx * c.size * f, oy + ry * c.size * f];
      });
      ctx.strokeStyle = rgba(INK, c.alpha);
      ctx.beginPath();
      for (const [a, b] of EDGES) { ctx.moveTo(pts[a][0], pts[a][1]); ctx.lineTo(pts[b][0], pts[b][1]); }
      ctx.stroke();
    }
    ctx.setLineDash([]);
  });
}
