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
  uniform float u_height;
  uniform vec2 u_center;
  uniform vec2 u_radius;
  uniform vec3 u_pointer;
  uniform float u_pointerRadius;
  attribute vec4 a_seed;
  attribute vec3 a_color;
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
    float theta = atan(position.y, position.x);
    vec2 direction = position.xy;
    vec2 base = u_center + direction * u_radius;
    float field = noise(direction * 2.7 + vec2(t * .075, -t * .055));
    float drift = sin(t * .39 + a_seed.x * 6.283) * 6.0
      + cos(t * .23 + a_seed.w * 9.0) * 4.0;
    float spread = a_seed.y * 35.0 + (field - .5) * 29.0 + drift;
    vec2 pos = base + direction * spread;
    pos += vec2(-direction.y, direction.x) * sin(t * .18 + a_seed.x * 12.0) * 4.0;
    float influence = (1.0 - smoothstep(0.0, u_pointerRadius, distance(pos, u_pointer.xy))) * u_pointer.z;
    // Locally gather the noisy cloud toward its resting silhouette; no explosive scatter.
    pos = mix(pos, base, influence * .82);
    float topFade = smoothstep(u_clearTop, u_clearTop + 42.0, pos.y);
    float bottomFade = 1.0 - smoothstep(u_height - 20.0, u_height + 15.0, pos.y);
    float density = .72 + .28 * sin(theta * 2.0 + .8);
    v_alpha = pow(a_seed.z, 1.8) * .66 * density * topFade * bottomFade * (1.0 - .12 * influence);
    v_color = a_color;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 0.0, 1.0);
    gl_PointSize = (.65 + a_seed.w * 1.5) * u_dpr;
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

function cloudData(count) {
  let state = 462731;
  const random = () => { state = (Math.imul(state, 1664525) + 1013904223) >>> 0; return state / 4294967296; };
  const positions = new Float32Array(count * 3), seeds = new Float32Array(count * 4), colors = new Float32Array(count * 3), hexes = [];
  const color = new THREE.Color();
  for (let i = 0; i < count; i++) {
    const theta = random() * Math.PI * 2, x = Math.cos(theta), y = Math.sin(theta);
    positions.set([x, y, 0], i * 3);
    seeds.set([random(), random() + random() - 1, random(), random()], i * 4);
    const tone = random(), coralChance = .12 + .12 * (x * .5 + .5);
    const hex = tone < coralChance ? (random() < .3 ? PALETTE.coral : PALETTE.coralSoft)
      : tone < coralChance + .18 ? PALETTE.neutral
      : random() < .26 ? PALETTE.blue : random() < .62 ? PALETTE.blueSoft : PALETTE.blueMist;
    color.set(hex); colors.set([color.r, color.g, color.b], i * 3); hexes.push(hex);
  }
  return { positions, seeds, colors, hexes };
}

export function createSavingsParticles({ root, canvas, forceStatic = false }) {
  const card = root.closest('.product-savings'), panel = root.querySelector('.savings-v3-panel');
  const count = root.clientWidth < 300 ? 3400 : 5600, data = cloudData(count);
  const scene = new THREE.Scene(), camera = new THREE.OrthographicCamera(0, 1, 0, 1, -10, 10);
  const uniforms = {
    u_time: { value: 17.7 }, u_dpr: { value: 1 }, u_clearTop: { value: 100 }, u_height: { value: 1 },
    u_center: { value: new THREE.Vector2() }, u_radius: { value: new THREE.Vector2() },
    u_pointer: { value: new THREE.Vector3(-1000, -1000, 0) }, u_pointerRadius: { value: 90 },
  };
  const target = new THREE.Vector2(-1000, -1000), pointer = new THREE.Vector2(-1000, -1000);
  let renderer, geometry, material, fallback, disposed = false, visible = false;
  let frame = 0, lastDraw = null, time = 17.7, hovered = false, strength = 0, lastDiagnostic = -1;
  let width = 0, height = 0, bounds, clearTop = 100;
  const dpr = () => Math.min(window.devicePixelRatio || 1, 1.75);

  function paintFallback() {
    if (!fallback || !width || !height) return;
    fallback.width = Math.round(width * dpr()); fallback.height = Math.round(height * dpr());
    const ctx = fallback.getContext('2d');
    if (!ctx) return;
    ctx.scale(dpr(), dpr());
    for (let i = 0; i < count; i++) {
      const x = data.positions[i * 3], y = data.positions[i * 3 + 1], radial = data.seeds[i * 4 + 1] * 35;
      const px = uniforms.u_center.value.x + x * (uniforms.u_radius.value.x + radial);
      const py = uniforms.u_center.value.y + y * (uniforms.u_radius.value.y + radial);
      const fade = THREE.MathUtils.smoothstep(py, clearTop, clearTop + 42);
      ctx.globalAlpha = Math.pow(data.seeds[i * 4 + 2], 1.8) * .45 * fade;
      ctx.fillStyle = data.hexes[i];
      ctx.beginPath(); ctx.arc(px, py, (.65 + data.seeds[i * 4 + 3] * 1.5) / 2, 0, Math.PI * 2); ctx.fill();
    }
  }
  function useFallback() {
    if (fallback || disposed) return;
    fallback = document.createElement('canvas'); fallback.className = 'savings-v4-canvas';
    fallback.setAttribute('aria-hidden', 'true'); root.insertBefore(fallback, canvas); canvas.hidden = true;
    cancelAnimationFrame(frame); frame = 0; lastDraw = null;
    root.dataset.particlesRenderer = 'canvas'; root.dataset.particlesState = 'static';
    paintFallback();
  }
  try {
    if (forceStatic) throw new Error('Static preview');
    renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: false, powerPreference: 'low-power' });
    renderer.setClearColor(0xffffff, 0);
    geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.BufferAttribute(data.positions, 3));
    geometry.setAttribute('a_seed', new THREE.BufferAttribute(data.seeds, 4));
    geometry.setAttribute('a_color', new THREE.BufferAttribute(data.colors, 3));
    material = new THREE.ShaderMaterial({ uniforms, vertexShader, fragmentShader, transparent: true, depthTest: false, depthWrite: false });
    const points = new THREE.Points(geometry, material); points.frustumCulled = false; scene.add(points);
    root.dataset.particlesRenderer = 'webgl';
  } catch { useFallback(); }

  function render() {
    if (fallback) { paintFallback(); return; }
    if (renderer && width && height) renderer.render(scene, camera);
  }
  function resize() {
    bounds = root.getBoundingClientRect(); width = bounds.width; height = bounds.height;
    if (!width || !height) return;
    const panelBounds = panel.getBoundingClientRect(), heading = card?.querySelector('.product-heading')?.getBoundingClientRect();
    clearTop = heading ? heading.bottom - bounds.top + 20 : 100;
    uniforms.u_clearTop.value = clearTop; uniforms.u_height.value = height;
    uniforms.u_center.value.set(panelBounds.left - bounds.left + panelBounds.width / 2, panelBounds.top - bounds.top + panelBounds.height / 2);
    uniforms.u_radius.value.set(Math.max(panelBounds.width * .53, width * .46), panelBounds.height * .65 + Math.max(0, height - 440) * .05);
    uniforms.u_pointerRadius.value = Math.max(72, width * .23); uniforms.u_dpr.value = dpr();
    camera.right = width; camera.bottom = height; camera.updateProjectionMatrix();
    renderer?.setPixelRatio(dpr()); renderer?.setSize(width, height, false);
    render();
  }
  const canPlay = () => !disposed && !fallback && visible && !document.hidden;
  function tick(now) {
    frame = 0;
    if (!canPlay()) { lastDraw = null; return; }
    frame = requestAnimationFrame(tick);
    const interval = hovered || strength > .01 ? 1000 / 60 : 1000 / 30;
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
    root.dataset.particlesState = canPlay() ? 'playing' : 'offscreen';
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
  const observer = new ResizeObserver(resize); observer.observe(root); observer.observe(panel);
  const intersection = new IntersectionObserver(entries => { visible = entries[0].isIntersecting; reconcile(); }, { threshold: .01 });
  intersection.observe(root);
  card?.addEventListener('pointerenter', enter); card?.addEventListener('pointermove', move, { passive: true }); card?.addEventListener('pointerleave', leave);
  document.addEventListener('visibilitychange', reconcile); window.addEventListener('scroll', refreshBounds, { passive: true });
  canvas.addEventListener('webglcontextlost', onLost);
  root.dataset.particlesCount = String(count); root.dataset.particlesPointer = 'idle';
  resize(); reconcile();
  return { dispose() {
    disposed = true; cancelAnimationFrame(frame); observer.disconnect(); intersection.disconnect();
    card?.removeEventListener('pointerenter', enter); card?.removeEventListener('pointermove', move); card?.removeEventListener('pointerleave', leave);
    document.removeEventListener('visibilitychange', reconcile); window.removeEventListener('scroll', refreshBounds);
    canvas.removeEventListener('webglcontextlost', onLost);
    geometry?.dispose(); material?.dispose(); renderer?.dispose(); fallback?.remove();
  } };
}
