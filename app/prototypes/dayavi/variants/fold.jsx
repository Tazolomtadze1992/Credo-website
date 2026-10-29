'use client';

import { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { PAYMENT_MODEL } from './model.mjs';
import styles from './fold.module.css';
import PaperFallback from './paper-fallback';

export default function Fold() {
  const rootRef = useRef(null), canvasRef = useRef(null), inputRef = useRef(null);
  useEffect(() => {
    const root = rootRef.current, canvas = canvasRef.current, input = inputRef.current;
    const still = matchMedia('(prefers-reduced-motion: reduce)');
    let disposed = false, destroy = () => {};
    async function initialize() {
      const logo = await new Promise(resolve => { const image = new Image(); image.onload = () => resolve(image); image.onerror = () => resolve(null); image.src = '/assets/dayavi/dayavi-mark.png'; });
      await document.fonts.ready;
      if (disposed) return;
      const gl = canvas.getContext('webgl2', { alpha: true, antialias: true, powerPreference: 'low-power' });
      if (!gl) { root.dataset.renderer = 'fallback'; return; }
      const renderer = new THREE.WebGLRenderer({ canvas, context: gl, alpha: true, antialias: true, powerPreference: 'low-power' });
      renderer.setClearColor(0xffffff, 0);
      renderer.outputColorSpace = THREE.SRGBColorSpace;
      renderer.toneMapping = THREE.ACESFilmicToneMapping;
      renderer.toneMappingExposure = 1.08;
      renderer.shadowMap.enabled = true;
      renderer.shadowMap.type = THREE.VSMShadowMap;

      const scene = new THREE.Scene();
      const camera = new THREE.OrthographicCamera(-7, 7, 2.45, -2.45, .1, 80);
      camera.position.set(.65, 4.2, 12);
      camera.lookAt(0, -.02, 0);
      scene.add(new THREE.HemisphereLight(0xffffff, 0xe4edf4, 3.3));
      const key = new THREE.DirectionalLight(0xffffff, 2.3);
      key.position.set(-3, 12, 8); key.castShadow = true;
      key.shadow.mapSize.set(2048, 2048); key.shadow.camera.left = -9; key.shadow.camera.right = 9;
      key.shadow.camera.top = 6; key.shadow.camera.bottom = -6; key.shadow.camera.near = .5; key.shadow.camera.far = 28;
      key.shadow.normalBias = .035; key.shadow.bias = -.00015; key.shadow.radius = 5; key.shadow.blurSamples = 12;
      scene.add(key);
      const fill = new THREE.DirectionalLight(0xeaf4ff, .75); fill.position.set(6, 2, -5); scene.add(fill);
      const groundGeometry = new THREE.PlaneGeometry(32, 18);
      const shadowMaterial = new THREE.ShadowMaterial({ color: 0x6b8799, opacity: .065 });
      const ground = new THREE.Mesh(groundGeometry, shadowMaterial);
      ground.rotation.x = -Math.PI / 2; ground.position.y = -1.235; ground.receiveShadow = true; scene.add(ground);

      const textures = [], materials = [], geometries = [];
      function print(index) {
        const page = document.createElement('canvas'); page.width = 256; page.height = 640;
        const context = page.getContext('2d');
        context.fillStyle = '#fbfdfe'; context.fillRect(0, 0, 256, 640);
        context.strokeStyle = '#e5edf2'; context.lineWidth = 1;
        context.beginPath(); context.moveTo(16, 18); context.lineTo(240, 18); context.moveTo(16, 622); context.lineTo(240, 622); context.stroke();
        if (logo) context.drawImage(logo, 274 - index * 256, 50, 1500, 485);
        context.fillStyle = '#425c6b'; context.textAlign = 'center';
        context.font = '500 32px "Helvetica Neue", Georgian, Arial, sans-serif';
        context.fillText(`${PAYMENT_MODEL.payment} ₾`, 128, 600);
        context.strokeStyle = '#d7e2e9'; context.lineWidth = 1.2;
        context.beginPath(); context.moveTo(45, 551); context.lineTo(211, 551); context.stroke();
        context.fillStyle = index === 0 ? '#fc6250' : '#ccdce6';
        context.fillRect(118, 623, 20, 2);
        const texture = new THREE.CanvasTexture(page); texture.colorSpace = THREE.SRGBColorSpace;
        texture.anisotropy = Math.min(8, renderer.capabilities.getMaxAnisotropy()); textures.push(texture); return texture;
      }
      const paper = new THREE.Group(); scene.add(paper);
      const panels = [], count = PAYMENT_MODEL.count, panelWidth = 1.12;
      for (let index = 0; index < count; index++) {
        const front = new THREE.MeshPhysicalMaterial({ color: 0xffffff, map: print(index), roughness: .82, metalness: 0, sheen: .25, sheenRoughness: .8, side: THREE.FrontSide });
        const back = new THREE.MeshPhysicalMaterial({ color: 0xf4f8fb, roughness: .9, metalness: 0, sheen: .25, side: THREE.BackSide });
        materials.push(front, back);
        const geometry = new THREE.PlaneGeometry(panelWidth, 2.45, 28, 12); geometries.push(geometry);
        const positions = geometry.attributes.position;
        for (let vertex = 0; vertex < positions.count; vertex++) {
          const x = positions.getX(vertex), y = positions.getY(vertex);
          const bow = Math.sin((x / panelWidth + .5) * Math.PI) * .046 * (1 + .12 * Math.cos(y * 1.8));
          positions.setZ(vertex, bow);
        }
        geometry.computeVertexNormals();
        const panel = new THREE.Group();
        const frontFace = new THREE.Mesh(geometry, front), backFace = new THREE.Mesh(geometry, back);
        frontFace.castShadow = backFace.castShadow = true; frontFace.receiveShadow = backFace.receiveShadow = true;
        panel.add(frontFace, backFace); paper.add(panel); panels.push(panel);
      }

      let frame = 0, previous = 0, visible = false, clock = 0, held = false, keyboard = false, dragging = false;
      let value = still.matches ? .7 : .2, target = value, yaw = -.12, targetYaw = yaw;
      let startX = 0, startValue = 0;
      const pose = () => {
        const angle = THREE.MathUtils.lerp(1.1, .20, value);
        const span = count * panelWidth * Math.cos(angle);
        let x = -span / 2, z = panelWidth * Math.sin(angle) / 2;
        panels.forEach((panel, index) => {
          const theta = index % 2 ? -angle : angle;
          panel.rotation.y = theta;
          panel.position.set(x + panelWidth / 2 * Math.cos(theta), 0, z - panelWidth / 2 * Math.sin(theta));
          x += panelWidth * Math.cos(theta); z -= panelWidth * Math.sin(theta);
        });
        paper.rotation.y = yaw;
        root.dataset.opening = value.toFixed(3);
        renderer.render(scene, camera);
      };
      const run = () => { if (!frame && visible && !document.hidden && !disposed) { previous = 0; frame = requestAnimationFrame(tick); } };
      function tick(now) {
        frame = 0;
        if (!visible || document.hidden || disposed) return;
        const dt = previous ? Math.min((now - previous) / 1000, 1 / 30) : 1 / 60; previous = now;
        if (!held && !still.matches) { clock += dt; target = .2 + Math.sin(clock * .42) * .055; targetYaw = -.12 + Math.sin(clock * .23) * .025; }
        const follow = 1 - Math.exp(-dt / .27);
        value = still.matches ? target : value + (target - value) * follow;
        yaw = still.matches ? targetYaw : yaw + (targetYaw - yaw) * follow;
        if (Math.abs(target - value) < .0001) value = target;
        if (Math.abs(targetYaw - yaw) < .0001) yaw = targetYaw;
        pose();
        if (!still.matches && (!held || value !== target || yaw !== targetYaw)) frame = requestAnimationFrame(tick);
      }
      const resize = () => {
        const bounds = root.getBoundingClientRect();
        if (!bounds.width || !bounds.height) return;
        renderer.setPixelRatio(Math.min(devicePixelRatio || 1, 1.5));
        renderer.setSize(bounds.width, bounds.height, false);
        const halfHeight = bounds.width < 600 ? 3.2 : 2.45;
        camera.left = -halfHeight * bounds.width / bounds.height; camera.right = -camera.left;
        camera.top = halfHeight; camera.bottom = -halfHeight; camera.updateProjectionMatrix(); pose();
      };
      const enter = event => { if (still.matches || event.pointerType === 'touch') return; held = true; target = .83; run(); };
      const move = event => {
        if (still.matches || event.pointerType === 'touch' && !dragging) return;
        const bounds = root.getBoundingClientRect();
        targetYaw = -.12 + ((event.clientX - bounds.left) / bounds.width - .5) * .18;
        if (dragging) { target = Math.max(0, Math.min(1, startValue + (event.clientX - startX) / bounds.width * 1.8)); input.value = String(Math.round(target * 100)); }
        run();
      };
      const release = event => {
        dragging = false; root.dataset.dragging = 'false';
        if (event && root.hasPointerCapture?.(event.pointerId)) root.releasePointerCapture(event.pointerId);
        if (!keyboard) { held = false; run(); }
      };
      const down = event => {
        if (still.matches || event.target === input) return;
        held = true; dragging = true; startX = event.clientX; startValue = value;
        root.dataset.dragging = 'true'; root.setPointerCapture(event.pointerId); run();
      };
      const change = () => { held = true; target = Number(input.value) / 100; run(); };
      const focus = () => { keyboard = true; held = true; target = value; };
      const blur = () => { keyboard = false; release(); };
      const visibility = () => { if (document.hidden) { cancelAnimationFrame(frame); frame = 0; } else run(); };
      const reduction = () => { cancelAnimationFrame(frame); frame = 0; value = target = still.matches ? .7 : .2; yaw = targetYaw = -.12; pose(); run(); };
      const resizer = new ResizeObserver(resize); resizer.observe(root);
      const observer = new IntersectionObserver(entries => { visible = entries[entries.length - 1].isIntersecting; if (visible) run(); else { cancelAnimationFrame(frame); frame = 0; } }, { threshold: .01 }); observer.observe(root);
      root.addEventListener('pointerenter', enter); root.addEventListener('pointermove', move, { passive: true }); root.addEventListener('pointerleave', release);
      root.addEventListener('pointerdown', down); root.addEventListener('pointerup', release); root.addEventListener('pointercancel', release);
      input.addEventListener('input', change); input.addEventListener('focus', focus); input.addEventListener('blur', blur);
      document.addEventListener('visibilitychange', visibility); still.addEventListener('change', reduction);
      resize(); root.dataset.renderer = 'webgl';
      destroy = () => {
        cancelAnimationFrame(frame); resizer.disconnect(); observer.disconnect();
        root.removeEventListener('pointerenter', enter); root.removeEventListener('pointermove', move); root.removeEventListener('pointerleave', release);
        root.removeEventListener('pointerdown', down); root.removeEventListener('pointerup', release); root.removeEventListener('pointercancel', release);
        input.removeEventListener('input', change); input.removeEventListener('focus', focus); input.removeEventListener('blur', blur);
        document.removeEventListener('visibilitychange', visibility); still.removeEventListener('change', reduction);
        textures.forEach(texture => texture.dispose()); materials.forEach(material => material.dispose()); geometries.forEach(geometry => geometry.dispose());
        groundGeometry.dispose(); shadowMaterial.dispose(); renderer.dispose(); renderer.forceContextLoss();
      };
    }
    initialize().catch(() => { root.dataset.renderer = 'fallback'; });
    return () => { disposed = true; destroy(); };
  }, []);
  return <div ref={rootRef} className={styles.scene} data-renderer="loading">
    <PaperFallback />
    <canvas ref={canvasRef} className={styles.canvas} aria-hidden="true" />
    <input ref={inputRef} className={styles.control} type="range" min="0" max="100" defaultValue="20" aria-label="გადახდის ფურცლის გაშლა" aria-valuetext="ერთი შენაძენი, რვა თანაბარი გადახდა" />
  </div>;
}
