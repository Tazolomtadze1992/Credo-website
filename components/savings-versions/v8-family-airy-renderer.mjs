import * as THREE from 'three';

// Frozen sRGB boundary values from the globe's OKLCH Credo palette:
// blue H232.094, coral H29.48. Keep this snapshot independent of later palette changes.
const PALETTE = Object.freeze({
  blue: '#1e6e91', blueSoft: '#7fafc9', blueMist: '#b8d2e1',
  coral: '#fc6250', coralSoft: '#f4b1a6', neutral: '#d3d0d0',
});

const vertexShader = /* glsl */`
  uniform float u_time;
  uniform float u_dpr;
  uniform float u_clearTop;
  uniform float u_width;
  uniform float u_height;
  uniform vec2 u_center;
  uniform float u_logoSize;
  uniform vec3 u_pointer;
  uniform float u_pointerRadius;
  attribute vec4 a_seed;
  attribute vec2 a_scatter;
  attribute vec3 a_color;
  attribute float a_role;
  varying vec3 v_color;
  varying float v_alpha;

  float hash(vec2 p) { return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
  float noise(vec2 p) {
    vec2 cell = floor(p), f = fract(p);
    f = f * f * (3.0 - 2.0 * f);
    return mix(mix(hash(cell), hash(cell + vec2(1., 0.)), f.x),
      mix(hash(cell + vec2(0., 1.)), hash(cell + vec2(1., 1.)), f.x), f.y);
  }
  void main() {
    float t = u_time;
    vec2 base = u_center + position.xy * u_logoSize;
    float loose = smoothstep(.65, 1.0, position.z);
    // Most points hold the emblem; the loose subset opens a feathered halo.
    float spread = mix(4.0, u_logoSize * .2, loose)
      * (.88 + .12 * sin(t * .45 + a_seed.x * 6.2831853));
    float breath = .72 + .28 * sin(t * .65);
    float fieldX = noise(position.xy * 5.0 + vec2(t * .22, -t * .16)) - .5;
    float fieldY = noise(position.yx * 4.0 + vec2(-t * .18, t * .2)) - .5;
    vec2 flow = vec2(fieldX, fieldY) * mix(10.0, 44.0, loose) * breath;
    flow += vec2(sin(t * .9 + a_seed.x * 12.0), cos(t * .72 + a_seed.w * 9.0)) * mix(2.5, 11.0, loose);
    vec2 pos = base + a_scatter * spread + flow;
    float influence = (1.0 - smoothstep(0.0, u_pointerRadius, distance(pos, u_pointer.xy))) * u_pointer.z;
    // Open a small, soft space around the pointer; the logo reforms as strength eases out.
    vec2 away = normalize(pos - u_pointer.xy + vec2(.001, .002));
    pos += away * influence * (14.0 + a_seed.x * 18.0);
    float topFade = smoothstep(u_clearTop, u_clearTop + 26.0, pos.y);
    float bottomFade = 1.0 - smoothstep(u_height - 20.0, u_height + 15.0, pos.y);
    float coreFade = mix(1.0, .8, step(1.5, a_role));
    float sideFade = smoothstep(0.0, 18.0, pos.x)
      * (1.0 - smoothstep(u_width - 18.0, u_width, pos.x));
    v_alpha = (.18 + pow(a_seed.z, .8) * .58) * coreFade
      * mix(1.0, .65, loose) * topFade * bottomFade * sideFade;
    v_color = a_color;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 0.0, 1.0);
    gl_PointSize = (.8 + a_seed.w * 1.7) * u_dpr;
  }
`;
const fragmentShader = /* glsl */`
  varying vec3 v_color;
  varying float v_alpha;
  void main() {
    float radius = length(gl_PointCoord - .5);
    if (radius > .5) discard;
    float edge = 1.0 - smoothstep(.33, .5, radius);
    gl_FragColor = vec4(v_color, v_alpha * edge);
    #include <colorspace_fragment>
  }
`;

let maskPromise;
function logoMask() {
  if (!maskPromise) maskPromise = new Promise((resolve, reject) => {
    const image = new Image();
    image.onload = () => {
      const surface = document.createElement('canvas'); surface.width = surface.height = 512;
      const ctx = surface.getContext('2d', { willReadFrequently: true });
      if (!ctx) { reject(new Error('Logo mask canvas unavailable')); return; }
      ctx.drawImage(image, 0, 0, 512, 512);
      const pixels = ctx.getImageData(0, 0, 512, 512).data, pools = [[], [], []];
      for (let i = 0; i < pixels.length; i += 4) {
        if (pixels[i + 3] < 200) continue;
        const role = pixels[i] > 200 ? 0 : pixels[i + 1] > 200 ? 1 : pixels[i + 2] > 200 ? 2 : -1;
        if (role >= 0) pools[role].push(i / 4);
      }
      if (pools.some(pool => !pool.length)) { reject(new Error('Incomplete Credo logo mask')); return; }
      resolve(pools);
    };
    image.onerror = reject;
    image.src = '/assets/savings/credo-emblem-mask-v5.png';
  });
  return maskPromise;
}

function cloudData(count, pools) {
  let state = 462731;
  const random = () => { state = (Math.imul(state, 1664525) + 1013904223) >>> 0; return state / 4294967296; };
  const positions = new Float32Array(count * 3), seeds = new Float32Array(count * 4), colors = new Float32Array(count * 3), roles = new Float32Array(count), scatter = new Float32Array(count * 2), hexes = [];
  const color = new THREE.Color();
  for (let i = 0; i < count; i++) {
    const choice = random(), role = choice < .3 ? 0 : choice < .6 ? 1 : 2;
    const pixel = pools[role][Math.floor(random() * pools[role].length)];
    const x = ((pixel % 512) + random()) / 512 - .5, y = (Math.floor(pixel / 512) + random()) / 512 - .5;
    positions.set([x, y, random()], i * 3); roles[i] = role;
    const angle = random() * Math.PI * 2;
    scatter.set([Math.cos(angle), Math.sin(angle)], i * 2);
    seeds.set([random(), random() + random() - 1, random(), random()], i * 4);
    const tone = random();
    const hex = role === 0 ? (tone < .65 ? PALETTE.blue : PALETTE.blueSoft)
      : tone < .55 ? PALETTE.coral : PALETTE.coralSoft;
    color.set(hex);
    if (role === 2) {
      // A lighter upper-left center echoes the depth in the source emblem,
      // using the existing Credo-blue shades at the renderer boundary.
      const depth = Math.min(1, Math.hypot(x + .12, y + .13) / .43);
      if (depth < .45) color.set(PALETTE.blueMist).lerp(new THREE.Color(PALETTE.blueSoft), depth / .45);
      else color.set(PALETTE.blueSoft).lerp(new THREE.Color(PALETTE.blue), (depth - .45) / .55);
    }
    colors.set([color.r, color.g, color.b], i * 3); hexes.push(`#${color.getHexString()}`);
  }
  return { positions, seeds, colors, roles, scatter, hexes };
}

export function createCredoFamilyAiry({ root, canvas, forceStatic = false }) {
  const card = root.closest('.product-savings');
  const count = root.clientWidth < 300 ? 7200 : 12000;
  let data, ready = false;
  const scene = new THREE.Scene(), camera = new THREE.OrthographicCamera(0, 1, 0, 1, -10, 10);
  const uniforms = {
    u_time: { value: 17.7 }, u_dpr: { value: 1 }, u_clearTop: { value: 100 }, u_width: { value: 1 }, u_height: { value: 1 },
    u_center: { value: new THREE.Vector2() }, u_logoSize: { value: 1 },
    u_pointer: { value: new THREE.Vector3(-1000, -1000, 0) }, u_pointerRadius: { value: 90 },
  };
  const target = new THREE.Vector2(-1000, -1000), pointer = new THREE.Vector2(-1000, -1000);
  let renderer, geometry, material, fallback, disposed = false, visible = false;
  let frame = 0, lastDraw = null, time = 17.7, hovered = false, strength = 0, lastDiagnostic = -1;
  let width = 0, height = 0, bounds, clearTop = 100;
  const dpr = () => Math.min(window.devicePixelRatio || 1, 1.75);

  function paintFallback() {
    if (!fallback || !ready || !width || !height) return;
    fallback.width = Math.round(width * dpr()); fallback.height = Math.round(height * dpr());
    const ctx = fallback.getContext('2d');
    if (!ctx) return;
    ctx.scale(dpr(), dpr());
    for (let i = 0; i < count; i++) {
      const x = data.positions[i * 3], y = data.positions[i * 3 + 1];
      const loose = THREE.MathUtils.smoothstep(data.positions[i * 3 + 2], .65, 1);
      const spread = THREE.MathUtils.lerp(4, uniforms.u_logoSize.value * .2, loose)
        * (.88 + .12 * Math.sin(time * .45 + data.seeds[i * 4] * Math.PI * 2));
      const px = uniforms.u_center.value.x + x * uniforms.u_logoSize.value + data.scatter[i * 2] * spread + Math.sin(data.seeds[i * 4] * 12) * 3;
      const py = uniforms.u_center.value.y + y * uniforms.u_logoSize.value + data.scatter[i * 2 + 1] * spread + Math.cos(data.seeds[i * 4 + 3] * 9) * 3;
      const fade = THREE.MathUtils.smoothstep(py, clearTop, clearTop + 26);
      const edgeFade = THREE.MathUtils.smoothstep(px, 0, 18) * (1 - THREE.MathUtils.smoothstep(px, width - 18, width))
        * (1 - THREE.MathUtils.smoothstep(py, height - 20, height + 15));
      ctx.globalAlpha = (.18 + Math.pow(data.seeds[i * 4 + 2], .8) * .58) * (data.roles[i] === 2 ? .8 : 1)
        * THREE.MathUtils.lerp(1, .65, loose) * fade * edgeFade;
      ctx.fillStyle = data.hexes[i];
      ctx.beginPath(); ctx.arc(px, py, (.8 + data.seeds[i * 4 + 3] * 1.7) / 2, 0, Math.PI * 2); ctx.fill();
    }
  }
  function useFallback() {
    if (fallback || disposed) return;
    fallback = document.createElement('canvas'); fallback.className = 'family-v8-canvas';
    fallback.setAttribute('aria-hidden', 'true'); root.insertBefore(fallback, canvas); canvas.hidden = true;
    cancelAnimationFrame(frame); frame = 0; lastDraw = null;
    root.dataset.particlesRenderer = 'canvas'; root.dataset.particlesState = 'static';
    paintFallback();
  }
  try {
    if (forceStatic) throw new Error('Static preview');
    renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: false, powerPreference: 'low-power' });
    renderer.setClearColor(0xffffff, 0);
    root.dataset.particlesRenderer = 'webgl';
  } catch { useFallback(); }

  function render() {
    if (!ready || disposed) return;
    if (fallback) { paintFallback(); return; }
    if (renderer && width && height) renderer.render(scene, camera);
  }
  function resize() {
    bounds = root.getBoundingClientRect(); width = bounds.width; height = bounds.height;
    if (!width || !height) return;
    const heading = card?.querySelector('.product-heading')?.getBoundingClientRect();
    clearTop = heading ? heading.bottom - bounds.top + 20 : 100;
    uniforms.u_clearTop.value = clearTop; uniforms.u_width.value = width; uniforms.u_height.value = height;
    uniforms.u_center.value.set(width / 2, (clearTop + 26 + height - 36) / 2);
    uniforms.u_logoSize.value = Math.min(width * .8, height - clearTop - 64);
    uniforms.u_pointerRadius.value = Math.max(55, uniforms.u_logoSize.value * .3); uniforms.u_dpr.value = dpr();
    camera.right = width; camera.bottom = height; camera.updateProjectionMatrix();
    renderer?.setPixelRatio(dpr()); renderer?.setSize(width, height, false);
    render();
  }
  const canPlay = () => ready && !disposed && !fallback && visible && !document.hidden;
  function tick(now) {
    frame = 0;
    if (!canPlay()) { lastDraw = null; return; }
    frame = requestAnimationFrame(tick);
    const interval = 1000 / 60;
    if (lastDraw !== null && now - lastDraw < interval - .5) return;
    const delta = lastDraw === null ? 0 : Math.min((now - lastDraw) / 1000, .067);
    lastDraw = now; time += delta;
    pointer.lerp(target, 1 - Math.exp(-delta * 10));
    strength += ((hovered ? 1 : 0) - strength) * (1 - Math.exp(-delta * (hovered ? 7 : 4)));
    uniforms.u_time.value = time; uniforms.u_pointer.value.set(pointer.x, pointer.y, strength);
    render();
    if (Math.floor(time) !== lastDiagnostic) {
      root.dataset.particlesTime = time.toFixed(2); root.dataset.particlesStrength = strength.toFixed(2);
      lastDiagnostic = Math.floor(time);
    }
  }
  function reconcile() {
    if (fallback) return;
    root.dataset.particlesState = !ready ? 'loading' : canPlay() ? 'playing' : 'offscreen';
    if (canPlay()) { if (!frame) { lastDraw = null; frame = requestAnimationFrame(tick); } }
    else { cancelAnimationFrame(frame); frame = 0; lastDraw = null; }
  }
  function move(event) {
    if (event.pointerType === 'touch' || !window.matchMedia('(hover:hover) and (pointer:fine)').matches) return;
    target.set(event.clientX - bounds.left, event.clientY - bounds.top);
    // A newly mounted version can inherit an already-hovered outer card.
    if (!hovered) { pointer.copy(target); hovered = true; root.dataset.particlesPointer = 'active'; }
  }
  function enter(event) {
    if (event.pointerType === 'touch' || !window.matchMedia('(hover:hover) and (pointer:fine)').matches) return;
    bounds = root.getBoundingClientRect(); move(event); pointer.copy(target); hovered = true;
    root.dataset.particlesPointer = 'active';
  }
  function leave() { hovered = false; root.dataset.particlesPointer = 'idle'; }
  const refreshBounds = () => { if (visible) bounds = root.getBoundingClientRect(); };
  const onLost = event => { event.preventDefault(); useFallback(); };
  const observer = new ResizeObserver(resize); observer.observe(root);
  const intersection = new IntersectionObserver(entries => { visible = entries[0].isIntersecting; reconcile(); }, { threshold: .01 });
  intersection.observe(root);
  card?.addEventListener('pointerenter', enter); card?.addEventListener('pointermove', move, { passive: true }); card?.addEventListener('pointerleave', leave);
  document.addEventListener('visibilitychange', reconcile); window.addEventListener('scroll', refreshBounds, { passive: true });
  canvas.addEventListener('webglcontextlost', onLost);
  root.dataset.particlesCount = String(count); root.dataset.particlesPointer = 'idle';
  resize(); reconcile();
  logoMask().then(pools => {
    if (disposed) return;
    data = cloudData(count, pools);
    if (!fallback) {
      geometry = new THREE.BufferGeometry();
      geometry.setAttribute('position', new THREE.BufferAttribute(data.positions, 3));
      geometry.setAttribute('a_seed', new THREE.BufferAttribute(data.seeds, 4));
      geometry.setAttribute('a_scatter', new THREE.BufferAttribute(data.scatter, 2));
      geometry.setAttribute('a_color', new THREE.BufferAttribute(data.colors, 3));
      geometry.setAttribute('a_role', new THREE.BufferAttribute(data.roles, 1));
      material = new THREE.ShaderMaterial({ uniforms, vertexShader, fragmentShader, transparent: true, depthTest: false, depthWrite: false });
      const points = new THREE.Points(geometry, material); points.frustumCulled = false; scene.add(points);
    }
    ready = true; root.dataset.particlesShape = 'credo-emblem'; resize(); reconcile();
  }).catch(() => { if (!disposed) root.dataset.particlesState = 'unavailable'; });
  return { dispose() {
    disposed = true; cancelAnimationFrame(frame); observer.disconnect(); intersection.disconnect();
    card?.removeEventListener('pointerenter', enter); card?.removeEventListener('pointermove', move); card?.removeEventListener('pointerleave', leave);
    document.removeEventListener('visibilitychange', reconcile); window.removeEventListener('scroll', refreshBounds);
    canvas.removeEventListener('webglcontextlost', onLost);
    geometry?.dispose(); material?.dispose(); renderer?.dispose(); fallback?.remove();
  } };
}
