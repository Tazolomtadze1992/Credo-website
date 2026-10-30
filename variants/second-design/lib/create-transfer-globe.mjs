import * as THREE from 'three';
import { Line2 } from 'three/addons/lines/Line2.js';
import { LineGeometry } from 'three/addons/lines/LineGeometry.js';
import { LineMaterial } from 'three/addons/lines/LineMaterial.js';
import { CITIES, GLOBE, cityDistance, clamp01, routeTiming, routeFrame } from './globe-motion.mjs';
import { pointVertex, pointFragment, surfaceVertex, surfaceFragment } from './globe-shaders.mjs';
import { GLOBE_COLORS, POINT_PALETTE, ROUTE_PALETTES, SIMPLE_ROUTE_PALETTES } from './globe-colors.mjs';

const PALETTES = ROUTE_PALETTES;
const SIMPLE_PALETTES = SIMPLE_ROUTE_PALETTES;
const landPromises = new Map();
function randomGenerator(seed) {
  return () => { seed |= 0; seed = seed + 0x6d2b79f5 | 0; let n = Math.imul(seed ^ seed >>> 15, 1 | seed); n ^= n + Math.imul(n ^ n >>> 7, 61 | n); return ((n ^ n >>> 14) >>> 0) / 4294967296; };
}
function landData(count) {
  if (!landPromises.has(count)) landPromises.set(count, new Promise((resolve, reject) => {
    const image = new Image();
    image.onload = () => {
      try {
        const canvas = document.createElement('canvas');
        canvas.width = image.width; canvas.height = image.height;
        const ctx = canvas.getContext('2d', { willReadFrequently: true });
        ctx.drawImage(image, 0, 0);
        const { data } = ctx.getImageData(0, 0, image.width, image.height);
        const positions = [], scatter = [], opacity = [], rng = randomGenerator(194);
        const radius = GLOBE.radius;
        // Equal-area spiral sampling. The public mask is Pacific-centred.
        for (let i = count - 1; i >= 0; i--) {
          const theta = Math.acos(-1 + 2 * i / count);
          const phi = Math.sqrt(count * Math.PI) * theta;
          const point = new THREE.Vector3(Math.sin(theta) * Math.sin(phi), Math.cos(theta), Math.sin(theta) * Math.cos(phi));
          const jitter = new THREE.Vector3(rng() - .5, rng() - .5, rng() - .5);
          jitter.addScaledVector(point, -jitter.dot(point)).normalize();
          point.multiplyScalar(radius).addScaledVector(jitter, .1125).normalize().multiplyScalar(radius);
          const u = .5 - Math.atan2(-point.z, -point.x) / (2 * Math.PI);
          const v = .5 - Math.asin(point.y / radius) / Math.PI;
          const x = Math.min(image.width - 1, Math.floor(u * image.width));
          const y = Math.min(image.height - 1, Math.floor(v * image.height));
          if (data[(y * image.width + x) * 4 + 3] > 0) {
            positions.push(point.x, point.y, point.z);
            scatter.push(rng(), rng(), rng(), rng());
            const hash = Math.sin(point.x * 1298.98 + point.y * 7823.3 + point.z * 3771.9) * 43758.5453;
            opacity.push(1 - (hash - Math.floor(hash)) * .3);
          }
        }
        resolve({ positions: new Float32Array(positions), scatter: new Float32Array(scatter), opacity: new Float32Array(opacity) });
      } catch (error) { reject(error); }
    };
    image.onerror = () => { landPromises.delete(count); reject(new Error('Unable to load globe land mask')); };
    image.src = '/design-two/assets/globe/land-mask.png';
  }));
  return landPromises.get(count);
}
const pointForCity = city => {
  const lat = THREE.MathUtils.degToRad(city.lat), lon = THREE.MathUtils.degToRad(city.lon);
  return new THREE.Vector3(Math.cos(lat) * Math.cos(lon), Math.sin(lat), -Math.cos(lat) * Math.sin(lon)).multiplyScalar(GLOBE.radius);
};

export function createTransferGlobe({ root, canvas, labels, reduced = false, paused = false, onReady }) {
  const scene = new THREE.Scene();
  const compact = window.matchMedia('(max-width:760px)').matches;
  const dotSize = compact ? .14 : .12;
  const camera = new THREE.PerspectiveCamera(GLOBE.cameraFov, 1, .1, 100);
  camera.position.z = compact ? 11.3 : GLOBE.cameraZ;
  const globe = new THREE.Group();
  globe.position.y = -1;
  globe.rotation.set(GLOBE.tiltX, GLOBE.initialRotation, GLOBE.tiltZ);
  scene.add(globe);
  const cityPoints = CITIES.map(pointForCity);
  const rng = randomGenerator(87243);
  const routes = [];
  const textures = new Map();
  const temp = new THREE.Vector3(), center = new THREE.Vector3(), towardCamera = new THREE.Vector3();
  let renderer, fallback, ctx, geometry, pointsMaterial;
  let disposed = false, loaded = false, visible = false, manuallyPaused = paused, reduce = reduced;
  let frame = 0, last = null, time = 0, nextRoute = 0, nextSimple = .5, width = 0, height = 0;
  let hovered = false, burst = 1, lastDiagnostic = -1;
  let framingOverride = null;
  const dpr = () => Math.min(window.devicePixelRatio || 1, 2);
  try {
    renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true, powerPreference: 'low-power' });
    renderer.setClearColor(0xffffff, 0);
    renderer.setPixelRatio(dpr());
    root.dataset.globeRenderer = 'webgl';
  } catch {
    // Keep the same geographic composition when WebGL is unavailable.
    fallback = document.createElement('canvas');
    fallback.className = 'transfer-globe-canvas';
    fallback.setAttribute('aria-hidden', 'true');
    canvas.hidden = true;
    root.prepend(fallback);
    ctx = fallback.getContext('2d');
    reduce = true;
    root.dataset.globeRenderer = 'canvas';
  }
  const sphereGeometry = new THREE.SphereGeometry(GLOBE.radius * .993, 64, 64);
  const sphereMaterial = new THREE.MeshBasicMaterial({ colorWrite: false });
  const occluder = new THREE.Mesh(sphereGeometry, sphereMaterial);
  occluder.renderOrder = -1;
  globe.add(occluder);
  const coreGeometry = new THREE.SphereGeometry(GLOBE.radius * .9995, 128, 128);
  const coreMaterial = new THREE.ShaderMaterial({ vertexShader: surfaceVertex, fragmentShader: surfaceFragment,
    transparent: true, depthWrite: true, uniforms: {
      surfaceBlue: { value: new THREE.Color(GLOBE_COLORS.blue) },
      surfaceRim: { value: new THREE.Color(GLOBE_COLORS.blueMist) },
    } });
  const core = new THREE.Mesh(coreGeometry, coreMaterial);
  core.renderOrder = 0;
  globe.add(core);

  function markerTexture(color) {
    if (textures.has(color)) return textures.get(color);
    const surface = document.createElement('canvas'); surface.width = surface.height = 64;
    const pen = surface.getContext('2d');
    const glow = pen.createRadialGradient(32, 32, 8, 32, 32, 30);
    glow.addColorStop(0, `${color}bb`); glow.addColorStop(.55, `${color}44`); glow.addColorStop(1, `${color}00`);
    pen.fillStyle = glow; pen.fillRect(0, 0, 64, 64);
    pen.beginPath(); pen.arc(32, 32, 13, 0, Math.PI * 2); pen.fillStyle = '#fff'; pen.fill();
    pen.strokeStyle = color; pen.lineWidth = 3.5; pen.stroke();
    const texture = new THREE.CanvasTexture(surface);
    texture.colorSpace = THREE.SRGBColorSpace;
    textures.set(color, texture);
    return texture;
  }
  function marker(point, color) {
    const material = new THREE.SpriteMaterial({ map: markerTexture(color), transparent: true, depthWrite: false, opacity: 0 });
    const sprite = new THREE.Sprite(material);
    sprite.position.copy(point).multiplyScalar(1.004);
    sprite.renderOrder = 3;
    globe.add(sprite);
    return sprite;
  }
  function updateMatrix() {
    globe.rotation.y = GLOBE.initialRotation + time * GLOBE.rotationSpeed;
    globe.updateMatrixWorld(true);
    camera.updateMatrixWorld();
    globe.getWorldPosition(center);
    towardCamera.copy(camera.position).sub(center).normalize();
  }
  function visibleCity(index) {
    temp.copy(cityPoints[index]).applyMatrix4(globe.matrixWorld);
    const facing = temp.clone().sub(center).normalize().dot(towardCamera);
    temp.project(camera);
    return facing > .25 && temp.x < .65;
  }
  let lastPair = '';
  function choosePair(simple) {
    const candidates = simple ? CITIES.map((_, i) => i) : CITIES.map((_, i) => i).filter(visibleCity);
    if (candidates.length < 2) return null;
    for (let attempt = 0; attempt < 40; attempt++) {
      const a = candidates[Math.floor(rng() * candidates.length)];
      // Regular Georgia connections, alongside the globally distributed routes.
      const b = !simple && candidates.includes(0) && rng() < .24 ? 0 : candidates[Math.floor(rng() * candidates.length)];
      if (a === b || CITIES[a].flag === CITIES[b].flag || `${a}:${b}` === lastPair) continue;
      const distance = cityDistance(CITIES[a], CITIES[b]);
      if (distance < (simple ? 500 : 2000) || simple && distance > 8000) continue;
      if (!simple) {
        temp.copy(cityPoints[a]).add(cityPoints[b]).normalize().multiplyScalar(2.25).applyMatrix4(globe.matrixWorld).project(camera);
        const x = (temp.x + 1) * width / 2, y = (1 - temp.y) * height / 2;
        if (routes.some(r => r.label && r.screenX !== undefined && Math.hypot(x - r.screenX, y - r.screenY) < 80)) continue;
      }
      lastPair = `${a}:${b}`;
      return { a, b, distance };
    }
    return null;
  }
  function makeRoute(simple, at) {
    const pair = choosePair(simple);
    if (!pair) return false;
    const { a, b, distance } = pair;
    const p0 = cityPoints[a].clone(), p1 = cityPoints[b].clone();
    const n0 = p0.clone().normalize(), n1 = p1.clone().normalize();
    const angle = Math.acos(THREE.MathUtils.clamp(n0.dot(n1), -1, 1));
    const peak = (simple ? .06 + .12 * angle / Math.PI : .1 + .175 * (angle / Math.PI) ** 1.2) * GLOBE.radius;
    const segments = simple ? 64 : 256;
    const positions = [], colors = [], points = [];
    const palette = (simple ? SIMPLE_PALETTES : PALETTES)[Math.floor(rng() * 3)];
    const ca = new THREE.Color(palette[0]), cb = new THREE.Color(palette[1]), mixed = new THREE.Color();
    const distances = [0]; let length = 0;
    for (let i = 0; i <= segments; i++) {
      const t = i / segments;
      const vector = n0.clone().multiplyScalar(Math.sin((1 - t) * angle)).addScaledVector(n1, Math.sin(t * angle)).divideScalar(Math.sin(angle));
      vector.normalize().multiplyScalar(GLOBE.radius + peak * Math.sin(Math.PI * t));
      points.push(vector); positions.push(vector.x, vector.y, vector.z);
      mixed.copy(ca).lerp(cb, t); colors.push(mixed.r, mixed.g, mixed.b);
      if (i) { length += vector.distanceTo(points[i - 1]); distances.push(length); }
    }
    const geometry = new LineGeometry(); geometry.setPositions(positions); geometry.setColors(colors);
    const uniforms = { head: { value: 0 }, tail: { value: 0 }, totalDistance: { value: length } };
    const material = new LineMaterial({ vertexColors: true, linewidth: simple ? .9 : 1.15, transparent: true, opacity: 0, depthWrite: false, dashed: true, dashSize: 1000000, gapSize: 0 });
    material.resolution.set(width, height);
    material.onBeforeCompile = shader => {
      Object.assign(shader.uniforms, uniforms);
      shader.fragmentShader = 'uniform float head; uniform float tail; uniform float totalDistance;\n' + shader.fragmentShader;
      shader.fragmentShader = shader.fragmentShader.replace('#include <clipping_planes_fragment>', '#include <clipping_planes_fragment>\nif (vLineDistance / totalDistance > head || vLineDistance / totalDistance < tail) discard;');
    };
    material.customProgramCacheKey = () => 'transfer-route-v1';
    const line = new Line2(geometry, material); line.computeLineDistances(); line.renderOrder = 2; line.frustumCulled = false;
    globe.add(line);
    const label = simple ? null : labels.find(element => !routes.some(r => r.label === element));
    if (label) {
      label.querySelector('img').src = `/design-two/assets/globe/flags/${CITIES[a].flag}.svg`;
      label.querySelector('[data-amount]').textContent = `${CITIES[a].symbol}${Math.floor(100 + rng() * 850)}`;
      label.querySelector('[data-currency]').textContent = CITIES[a].currency;
      label.style.opacity = '0';
    }
    routes.push({ simple, from: a, to: b, start: at, timing: routeTiming(distance, simple), points, distances, length, uniforms, line, geometry, material, label, markers: [marker(p0, palette[0]), marker(p1, palette[1])], palette });
    return true;
  }
  function removeRoute(index) {
    const route = routes[index];
    globe.remove(route.line); route.geometry.dispose(); route.material.dispose();
    for (const marker of route.markers) { globe.remove(marker); marker.material.dispose(); }
    if (route.label) route.label.style.opacity = '0';
    routes.splice(index, 1);
  }
  function pointOnRoute(route, progress) {
    const target = progress * route.length;
    let i = 1;
    while (i < route.distances.length - 1 && route.distances[i] < target) i++;
    const fraction = (target - route.distances[i - 1]) / (route.distances[i] - route.distances[i - 1]);
    return temp.copy(route.points[i - 1]).lerp(route.points[i], fraction);
  }
  function placeLabel(route, state) {
    const point = pointOnRoute(route, state.labelProgress);
    const altitude = Math.max(0, point.length() - GLOBE.radius);
    const lift = THREE.MathUtils.lerp(.01, .25, clamp01(altitude / (GLOBE.radius * .75)));
    point.addScaledVector(point.clone().normalize(), lift).applyMatrix4(globe.matrixWorld);
    const toward = point.clone().sub(center).normalize();
    const face = toward.dot(towardCamera);
    point.project(camera);
    const onScreen = Math.abs(point.x) < 1.15 && Math.abs(point.y) < 1.15;
    const opacity = state.labelOpacity * clamp01((face + .1) / .35) * (onScreen ? 1 : 0);
    const x = (point.x + 1) * width / 2, y = (1 - point.y) * height / 2;
    route.screenX = x; route.screenY = y;
    const scale = THREE.MathUtils.lerp(.75, 1, clamp01(altitude / (GLOBE.radius * .75))) * state.labelScale;
    route.label.style.transform = `translate3d(${x.toFixed(2)}px,${y.toFixed(2)}px,0) translate(-50%,-50%) scale(${Math.max(.001, scale).toFixed(3)})`;
    route.label.style.opacity = opacity.toFixed(3);
  }
  function updateRoutes() {
    for (let i = routes.length - 1; i >= 0; i--) {
      const route = routes[i], state = routeFrame(time - route.start, route.timing, route.simple);
      if (state.done) { removeRoute(i); continue; }
      route.uniforms.head.value = state.head; route.uniforms.tail.value = state.tail;
      route.line.visible = state.head > state.tail;
      route.material.opacity = state.opacity * state.head;
      route.markers[0].scale.setScalar((route.simple ? .048 : .075) * state.startMarker);
      route.markers[1].scale.setScalar((route.simple ? .048 : .075) * state.endMarker);
      route.markers[0].material.opacity = state.startMarker;
      route.markers[1].material.opacity = state.endMarker;
      if (route.label) placeLabel(route, state);
    }
    if (time >= nextRoute && routes.filter(r => !r.simple).length < GLOBE.maxRoutes) {
      makeRoute(false, time); nextRoute = time + GLOBE.spawnMin + rng() * (GLOBE.spawnMax - GLOBE.spawnMin);
    }
    if (time >= nextSimple && routes.filter(r => r.simple).length < 3) {
      makeRoute(true, time); nextSimple = time + .8 + rng() * 1.2;
    }
  }
  function renderFallback(data) {
    if (!ctx) return;
    ctx.setTransform(dpr(), 0, 0, dpr(), 0, 0); ctx.clearRect(0, 0, width, height);
    const palette = POINT_PALETTE.map(color => color.slice(1).match(/../g).map(channel => parseInt(channel, 16)));
    for (let i = 0; i < data.positions.length; i += 3) {
      temp.fromArray(data.positions, i).applyMatrix4(globe.matrixWorld);
      const facing = temp.clone().sub(center).normalize().dot(towardCamera);
      const tone = .5 - (temp.x + temp.y) / temp.length() * .3535;
      const pair = tone < .3794 ? 0 : 1, blend = clamp01((tone - (pair ? .3794 : .024)) / (pair ? .4147 : .3554));
      const rgb = palette[pair].map((v, c) => Math.round(THREE.MathUtils.lerp(v, palette[pair + 1][c], blend)));
      const distance = -temp.clone().applyMatrix4(camera.matrixWorldInverse).z;
      const variation = THREE.MathUtils.lerp(.625, 1.375, data.scatter[i / 3 * 4 + 2]);
      const radius = Math.max(.25 / dpr(), dotSize * variation * height * camera.zoom / 800 * 300 / distance / 4);
      temp.project(camera);
      ctx.fillStyle = `rgba(${rgb.join(',')},${.6 * data.opacity[i / 3] * (.15 + .85 * clamp01((facing + .1) / .35) ** 2)})`;
      ctx.beginPath(); ctx.arc((temp.x + 1) * width / 2, (1 - temp.y) * height / 2, radius, 0, Math.PI * 2); ctx.fill();
    }
    for (const route of routes) {
      const state = routeFrame(time - route.start, route.timing, route.simple);
      if (state.head <= state.tail) continue;
      ctx.strokeStyle = route.palette[1]; ctx.lineWidth = .9; ctx.globalAlpha = state.opacity;
      ctx.beginPath(); let started = false;
      route.points.forEach((p, i) => {
        const t = i / (route.points.length - 1);
        if (t < state.tail || t > state.head) return;
        temp.copy(p).applyMatrix4(globe.matrixWorld).project(camera);
        const x = (temp.x + 1) * width / 2, y = (1 - temp.y) * height / 2;
        if (started) ctx.lineTo(x, y); else { ctx.moveTo(x, y); started = true; }
      });
      ctx.stroke(); ctx.globalAlpha = 1;
    }
  }
  let data;
  function render() {
    if (!loaded || disposed || !width || !height) return;
    updateMatrix(); updateRoutes();
    if (pointsMaterial) { pointsMaterial.uniforms.time.value = 100 + time; pointsMaterial.uniforms.burst.value = burst; }
    if (renderer) renderer.render(scene, camera); else renderFallback(data);
    if (Math.floor(time) !== lastDiagnostic) { root.dataset.globeTime = time.toFixed(2); root.dataset.globeRoutes = String(routes.length); lastDiagnostic = Math.floor(time); }
  }
  const canPlay = () => loaded && visible && !reduce && !manuallyPaused && !document.hidden && !disposed;
  function state() {
    root.dataset.globeState = reduce ? 'reduced' : manuallyPaused ? 'paused' : canPlay() ? 'playing' : 'offscreen';
  }
  function tick(now) {
    frame = 0;
    if (!canPlay()) { last = null; state(); return; }
    const delta = last === null ? 0 : Math.min((now - last) / 1000, .05); last = now;
    time += delta; burst += ((hovered ? 1.33 : 1) - burst) * (1 - Math.exp(-delta * (hovered ? 6 : 2.4)));
    render(); frame = requestAnimationFrame(tick);
  }
  function reconcile() {
    if (canPlay()) { if (!frame) { last = null; frame = requestAnimationFrame(tick); } }
    else { cancelAnimationFrame(frame); frame = 0; last = null; }
    state();
  }
  function applyFraming() {
    if (!width || !height) return;
    const framing = getComputedStyle(root);
    const zoom = framingOverride?.zoom ?? (Number(framing.getPropertyValue('--globe-frame-zoom')) || 1);
    const x = framingOverride?.x ?? Number(framing.getPropertyValue('--globe-frame-x'));
    const y = framingOverride?.y ?? Number(framing.getPropertyValue('--globe-frame-y'));
    // Keep the same globe/card width ratio when the compact card hits min-height.
    const portraitFit = Math.min(1, width / height / (416 / 560));
    camera.zoom = zoom * portraitFit;
    camera.setViewOffset(width, height, -width * x, -height * y, width, height);
    if (pointsMaterial) pointsMaterial.uniforms.projectionScale.value = camera.zoom;
    root.dataset.globeZoom = zoom.toFixed(2);
    root.dataset.globeOffsetY = y.toFixed(3);
  }
  function resize() {
    width = root.clientWidth; height = root.clientHeight;
    if (!width || !height) return;
    camera.aspect = width / height;
    applyFraming();
    if (renderer) { renderer.setPixelRatio(dpr()); renderer.setSize(width, height, false); }
    else { fallback.width = width * dpr(); fallback.height = height * dpr(); }
    if (pointsMaterial) { pointsMaterial.uniforms.height.value = height; pointsMaterial.uniforms.pixelRatio.value = dpr(); pointsMaterial.uniforms.projectionScale.value = camera.zoom; }
    for (const route of routes) route.material.resolution.set(width, height);
    render();
  }
  const resizeObserver = new ResizeObserver(resize); resizeObserver.observe(root);
  const intersection = new IntersectionObserver(entries => { visible = entries[0].isIntersecting; reconcile(); }, { threshold: .01 }); intersection.observe(root);
  const onVisibility = () => reconcile();
  const enter = () => { hovered = true; }, leave = () => { hovered = false; };
  const card = root.closest('.product-transfer');
  card?.addEventListener('pointerenter', enter); card?.addEventListener('pointerleave', leave);
  document.addEventListener('visibilitychange', onVisibility);
  resize();
  landData(compact ? 30000 : 60000).then(result => {
    if (disposed) return;
    data = result;
    geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.BufferAttribute(data.positions, 3));
    geometry.setAttribute('scatter', new THREE.BufferAttribute(data.scatter, 4));
    geometry.setAttribute('opacityVariation', new THREE.BufferAttribute(data.opacity, 1));
    pointsMaterial = new THREE.ShaderMaterial({ vertexShader: pointVertex, fragmentShader: pointFragment, transparent: true, depthWrite: false, depthTest: false, uniforms: { time: { value: 100 }, height: { value: height }, pixelRatio: { value: dpr() }, projectionScale: { value: camera.zoom }, dotSize: { value: dotSize }, burst: { value: 1 }, pointCoral: { value: new THREE.Color(GLOBE_COLORS.coral) }, pointMid: { value: new THREE.Color(GLOBE_COLORS.blueSoft) }, pointBlue: { value: new THREE.Color(GLOBE_COLORS.blue) } } });
    const dots = new THREE.Points(geometry, pointsMaterial); dots.renderOrder = 1; dots.frustumCulled = false; globe.add(dots);
    loaded = true;
    // Enter on an established scene: routes and labels are already alive.
    for (time = 0; time < 18; time += .1) { updateMatrix(); updateRoutes(); }
    root.dataset.globePoints = String(data.positions.length / 3);
    root.dataset.globeReady = 'true';
    render(); reconcile(); onReady?.({ staticFallback: !renderer });
  }).catch(() => {
    if (disposed) return;
    root.dataset.globeState = 'unavailable';
    root.dataset.globeReady = 'false';
  });
  return {
    setFraming(values) {
      if (disposed) return;
      framingOverride = values;
      applyFraming();
      render();
    },
    setPaused(value) { manuallyPaused = value; reconcile(); },
    setReduced(value) { reduce = value || !renderer; render(); reconcile(); },
    dispose() {
      disposed = true; cancelAnimationFrame(frame); resizeObserver.disconnect(); intersection.disconnect();
      document.removeEventListener('visibilitychange', onVisibility);
      card?.removeEventListener('pointerenter', enter); card?.removeEventListener('pointerleave', leave);
      for (let i = routes.length - 1; i >= 0; i--) removeRoute(i);
      geometry?.dispose(); pointsMaterial?.dispose(); sphereGeometry.dispose(); sphereMaterial.dispose(); coreGeometry.dispose(); coreMaterial.dispose();
      for (const texture of textures.values()) texture.dispose();
      renderer?.dispose(); fallback?.remove();
    },
  };
}
