import * as THREE from 'three';
import { createCardRibbon } from './card-ribbon.mjs';
import { createCardRibbon as createOriginalCardRibbon } from './card-ribbon-versions/v1-original.mjs';
import { createCardRibbon as createPolishedCardRibbon } from './card-ribbon-versions/v2-polished.mjs';
import { createCardRibbon as createFlowCardRibbon } from './card-ribbon-versions/v3-flow.mjs';

const CARD = { width: 2.44, height: 3.87, radius: .105, depth: .026 };
const SHADOW_DEPTH = .9;
const clamp = (value, min, max) => Math.max(min, Math.min(max, value));

function roundedCard(width, height, radius) {
  const shape = new THREE.Shape(), x = -width / 2, y = -height / 2;
  shape.moveTo(x + radius, y);
  shape.lineTo(x + width - radius, y);
  shape.quadraticCurveTo(x + width, y, x + width, y + radius);
  shape.lineTo(x + width, y + height - radius);
  shape.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
  shape.lineTo(x + radius, y + height);
  shape.quadraticCurveTo(x, y + height, x, y + height - radius);
  shape.lineTo(x, y + radius);
  shape.quadraticCurveTo(x, y, x + radius, y);
  return shape;
}

function imageAt(src) {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = reject;
    image.src = src;
  });
}

async function frontTexture() {
  const canvas = document.createElement('canvas');
  canvas.width = 976; canvas.height = 1548;
  const ctx = canvas.getContext('2d');
  const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
  gradient.addColorStop(0, '#293d4d');
  gradient.addColorStop(.58, '#171c1e');
  gradient.addColorStop(1, '#352621');
  ctx.fillStyle = gradient; ctx.fillRect(0, 0, canvas.width, canvas.height);
  // Fixed, very fine surface grain, rather than noise that crawls each frame.
  const pixels = ctx.getImageData(0, 0, canvas.width, canvas.height);
  let seed = 329;
  for (let i = 0; i < pixels.data.length; i += 4) {
    seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0;
    const grain = ((seed >>> 24) / 255 - .5) * 3;
    pixels.data[i] += grain; pixels.data[i + 1] += grain; pixels.data[i + 2] += grain;
  }
  ctx.putImageData(pixels, 0, 0);
  const [emblem, wordmark, mastercard] = await Promise.all([
    imageAt('/assets/94b9d.svg'), imageAt('/assets/2ca6f.svg'), imageAt('/assets/d10cd.svg'),
  ]);
  ctx.scale(4, 4);
  ctx.drawImage(emblem, 21.6, 17.27, 22.2, 21.87);
  ctx.drawImage(wordmark, 48.9, 22.24, 114.99, 11.97);
  ctx.drawImage(mastercard, 173.1, 332.5, 49.3, 30.5);
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.anisotropy = 4;
  return texture;
}

function studioEnvironment(renderer) {
  const studio = new THREE.Scene();
  studio.background = new THREE.Color('#394049');
  function softbox(width, height, position, color, intensity, angle = 0) {
    const material = new THREE.MeshBasicMaterial({ color: new THREE.Color(color).multiplyScalar(intensity), side: THREE.DoubleSide });
    const panel = new THREE.Mesh(new THREE.PlaneGeometry(width, height), material);
    panel.position.set(...position); panel.lookAt(0, 0, 0); panel.rotateZ(angle);
    studio.add(panel);
  }
  softbox(7, 1.4, [-1.8, 1.7, 5], '#eff7ff', 3, -.5);
  softbox(1.3, 6, [3.6, -.7, 4.5], '#c4d9ff', 1.5, -.2);
  softbox(6, .55, [.6, -2.3, 5], '#ffe2d5', 2, -.45);
  const generator = new THREE.PMREMGenerator(renderer);
  const target = generator.fromScene(studio, .035);
  studio.traverse(object => { object.geometry?.dispose(); object.material?.dispose(); });
  generator.dispose();
  return target;
}

function shadowTexture() {
  const canvas = document.createElement('canvas');
  canvas.width = 768; canvas.height = 1024;
  const ctx = canvas.getContext('2d');
  ctx.filter = 'blur(28px)'; ctx.fillStyle = 'rgba(0,0,0,.23)';
  ctx.beginPath(); ctx.roundRect(140, 125, 488, 774, 22); ctx.fill();
  ctx.filter = 'blur(8px)'; ctx.fillStyle = 'rgba(0,0,0,.11)'; ctx.fill();
  return new THREE.CanvasTexture(canvas);
}

export function createBankCard({ root, canvas, onReady, onFallback, ribbonVersion = 'cool' }) {
  let renderer;
  try {
    // Keep the last image while this scene rests between pointer updates.
    renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true, preserveDrawingBuffer: true, powerPreference: 'low-power' });
  } catch {
    root.dataset.cardRenderer = 'fallback';
    return { dispose() {} };
  }
  renderer.setClearColor(0x000000, 0);
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.12;
  root.dataset.cardRenderer = 'webgl'; root.dataset.cardInteraction = 'rest';

  const scene = new THREE.Scene(), camera = new THREE.PerspectiveCamera(35, 1, .5, 30);
  const ribbonFactory = ribbonVersion === 'original' ? createOriginalCardRibbon
    : ribbonVersion === 'polished' ? createPolishedCardRibbon
    : ribbonVersion === 'flow' ? createFlowCardRibbon : createCardRibbon;
  const ribbon = ribbonFactory();
  scene.add(ribbon.mesh);
  root.dataset.cardBackground = 'ribbon';
  root.dataset.cardRibbonVersion = ribbonVersion;
  const environment = studioEnvironment(renderer);
  scene.environment = environment.texture;
  scene.add(new THREE.HemisphereLight(0xffffff, 0x27333f, 1.3));
  const key = new THREE.DirectionalLight(0xffffff, 2.1);
  key.position.set(-3, 5, 7); scene.add(key);

  const card = new THREE.Group();
  card.rotation.order = 'YXZ'; scene.add(card);
  const outline = roundedCard(CARD.width, CARD.height, CARD.radius);
  const bodyGeometry = new THREE.ExtrudeGeometry(outline, {
    depth: CARD.depth, steps: 1, bevelEnabled: true, bevelThickness: .007,
    bevelSize: .007, bevelSegments: 3, curveSegments: 16,
  });
  bodyGeometry.translate(0, 0, -CARD.depth / 2);
  const backMaterial = new THREE.MeshPhysicalMaterial({ color: '#202830', roughness: .34, metalness: .4, clearcoat: .8 });
  const edgeMaterial = new THREE.MeshPhysicalMaterial({ color: '#87949d', roughness: .26, metalness: .85, envMapIntensity: 1.2 });
  card.add(new THREE.Mesh(bodyGeometry, [backMaterial, edgeMaterial]));

  const frontGeometry = new THREE.ShapeGeometry(outline, 32);
  const positions = frontGeometry.attributes.position, uvs = frontGeometry.attributes.uv;
  for (let i = 0; i < positions.count; i++) uvs.setXY(i, (positions.getX(i) + CARD.width / 2) / CARD.width, (positions.getY(i) + CARD.height / 2) / CARD.height);
  // Keep the printed face consistent while the bevel supplies the physical depth.
  const frontMaterial = new THREE.MeshBasicMaterial({ color: 0xffffff, toneMapped: false });
  const front = new THREE.Mesh(frontGeometry, frontMaterial);
  front.position.z = CARD.depth / 2 + .017; card.add(front);

  const shadowMap = shadowTexture();
  const shadow = new THREE.Mesh(new THREE.PlaneGeometry(3.84, 5.12), new THREE.MeshBasicMaterial({ map: shadowMap, transparent: true, opacity: .62, depthWrite: false }));
  // The receiving surface must stay behind even the furthest tilted corner.
  shadow.position.z = -SHADOW_DEPTH; scene.add(shadow);

  const hitArea = root.closest('.product-card');
  const pointer = window.matchMedia('(hover: hover) and (pointer: fine)');
  let disposed = false, visible = false, frame = 0, last = 0, elapsed = 0, bounds;
  let targetX = 0, targetY = 0, currentX = 0, currentY = 0, baseY = 0, shadowScale = 1, texture;

  function draw(time) {
    frame = 0;
    if (disposed || !visible || document.hidden) return;
    const moving = Math.abs(targetX - currentX) + Math.abs(targetY - currentY) > .0005;
    // Ambient ribbon at 30fps; retain 60fps while the existing tilt settles.
    if (!moving && last && time - last < 1000 / 30) { requestDraw(); return; }
    const dt = last ? Math.min((time - last) / 1000, .05) : 1 / 60;
    last = time;
    elapsed += dt;
    const blend = 1 - Math.exp(-dt * 13);
    currentX += (targetX - currentX) * blend; currentY += (targetY - currentY) * blend;
    const settled = Math.abs(targetX - currentX) + Math.abs(targetY - currentY) <= .0005;
    if (settled) { currentX = targetX; currentY = targetY; }
    card.rotation.set(-currentY * .10, currentX * .12, 0);
    card.position.y = baseY;
    shadow.position.set(currentX * .025 * shadowScale, (baseY - .105 - currentY * .02) * shadowScale, -SHADOW_DEPTH);
    shadow.rotation.z = 0;
    ribbon.update(elapsed, currentX, currentY);
    renderer.render(scene, camera);
    requestDraw();
  }
  function requestDraw() {
    if (!frame && !disposed && visible && !document.hidden) frame = requestAnimationFrame(draw);
  }
  function resize() {
    const width = root.clientWidth, height = root.clientHeight;
    if (!width || !height || disposed) return;
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.setSize(width, height, false);
    camera.aspect = width / height;
    const span = CARD.width / .62;
    const viewHeight = span / camera.aspect;
    camera.position.z = viewHeight / (2 * Math.tan(THREE.MathUtils.degToRad(camera.fov / 2)));
    camera.updateProjectionMatrix();
    ribbon.resize(camera);
    shadowScale = 1 + SHADOW_DEPTH / camera.position.z;
    shadow.scale.setScalar(shadowScale);
    const center = Number(getComputedStyle(root).getPropertyValue('--bank-card-center')) || .58;
    baseY = viewHeight * (.5 - center);
    bounds = null; requestDraw();
  }
  function move(event) {
    if (!pointer.matches || event.pointerType === 'touch') return;
    bounds ||= hitArea.getBoundingClientRect();
    targetX = clamp((event.clientX - bounds.left) / bounds.width * 2 - 1, -1, 1);
    targetY = clamp((event.clientY - bounds.top) / bounds.height * 2 - 1, -1, 1);
    root.dataset.cardInteraction = 'active'; requestDraw();
  }
  function leave() {
    targetX = 0; targetY = 0; bounds = null;
    root.dataset.cardInteraction = 'rest'; requestDraw();
  }
  function invalidateBounds() { bounds = null; }
  function visibilityChange() {
    root.dataset.cardBackgroundState = visible && !document.hidden ? 'playing' : 'paused';
    if (document.hidden) last = 0; else requestDraw();
  }
  function contextLost(event) { event.preventDefault(); onFallback?.(); }
  const resizeObserver = new ResizeObserver(resize);
  resizeObserver.observe(root);
  const visibilityObserver = new IntersectionObserver(([entry]) => {
    visible = entry.isIntersecting;
    root.dataset.cardBackgroundState = visible && !document.hidden ? 'playing' : 'paused';
    if (visible) requestDraw();
    else { cancelAnimationFrame(frame); frame = 0; last = 0; }
  }, { rootMargin: '80px' });
  visibilityObserver.observe(root);
  hitArea.addEventListener('pointermove', move, { passive: true });
  hitArea.addEventListener('pointerleave', leave);
  window.addEventListener('scroll', invalidateBounds, { passive: true, capture: true });
  document.addEventListener('visibilitychange', visibilityChange);
  canvas.addEventListener('webglcontextlost', contextLost);
  resize();
  frontTexture().then(loadedTexture => {
    if (disposed) { loadedTexture.dispose(); return; }
    texture = loadedTexture; frontMaterial.map = texture; frontMaterial.needsUpdate = true;
    requestDraw(); onReady?.();
  }).catch(() => onFallback?.());

  return { dispose() {
    disposed = true; cancelAnimationFrame(frame);
    resizeObserver.disconnect(); visibilityObserver.disconnect();
    hitArea.removeEventListener('pointermove', move); hitArea.removeEventListener('pointerleave', leave);
    window.removeEventListener('scroll', invalidateBounds, true);
    document.removeEventListener('visibilitychange', visibilityChange);
    canvas.removeEventListener('webglcontextlost', contextLost);
    bodyGeometry.dispose(); frontGeometry.dispose(); shadow.geometry.dispose();
    backMaterial.dispose(); edgeMaterial.dispose(); frontMaterial.dispose(); shadow.material.dispose();
    texture?.dispose(); shadowMap.dispose(); environment.dispose(); renderer.dispose();
    ribbon.dispose();
  } };
}
