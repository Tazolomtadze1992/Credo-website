// Ported from Credo-web-variants: lib/create-news-carousel.mjs (unchanged apart from the initial size).
import { NEWS_CAROUSEL as N, columnMetrics, easeOutExpo, wrapIndex } from './news-carousel-layout.mjs';

const imageCache = new Map();
function loadImage(src) {
  if (!imageCache.has(src)) imageCache.set(src, new Promise(resolve => {
    const image = new Image();
    image.decoding = 'async';
    image.onload = image.onerror = () => resolve(image);
    image.src = src;
  }));
  return imageCache.get(src);
}
const mix = (a, b, progress) => a + (b - a) * progress;

// Only draws while an interaction is moving. Images remain at their full scale
// behind the narrowing clips; they are never stretched into thin thumbnails.
export function createNewsCarousel({ canvas, items, active = 0, reduced = false, onSelect }) {
  const ctx = canvas.getContext('2d');
  if (!ctx) return { move() {}, setReduced() {}, dispose() {} };
  let images = [], cards = [], width = 0, height = 0, dpr = 1;
  let index = active, columnOffset = 0, offset = 0, hovered = -1;
  let frame = 0, started = 0, fromOffset = 0, toOffset = 0;
  let reduce = reduced, disposed = false, visible = false, loaded = false;
  let metrics = columnMetrics(N.width, N.height, items.length);

  function newCard(itemIndex, column, initialWidth = N.smallWidth) {
    return { item: wrapIndex(itemIndex, items.length), column, width: initialWidth, gap: column < 4 ? N.largeGap : N.smallGap, crop: column === 0 ? 0 : items[wrapIndex(itemIndex, items.length)].collapsedOffsetX || 0, x: 0 };
  }
  function canonical() {
    metrics = columnMetrics(width, height, items.length, hovered, reduce);
    cards = metrics.widths.map((size, column) => newCard(index + column, column, size));
    offset = columnOffset = 0;
  }
  function diagnostics() {
    canvas.dataset.newsIndex = String(index);
    canvas.dataset.newsColumns = JSON.stringify(cards.filter(c => c.column >= 0 && c.column < metrics.visibleCount).map(c => Number(c.width.toFixed(3))));
    canvas.dataset.newsAnimating = String(Boolean(frame));
  }
  function draw() {
    if (disposed || !width || !height) return;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, width, height);
    let x = offset;
    for (let i = 0; i < cards.length; i++) {
      const card = cards[i];
      if (i) x += card.gap;
      card.x = x; x += card.width;
      if (card.x + card.width < 0 || card.x > width || card.width <= 0) continue;
      const image = images[card.item];
      if (!image?.naturalWidth) continue;
      const ratio = image.naturalWidth / image.naturalHeight;
      const wider = ratio > metrics.imageWidth / height;
      const imageHeight = wider ? height : metrics.imageWidth / ratio;
      const imageWidth = wider ? height * ratio : metrics.imageWidth;
      const correction = wider ? (metrics.imageWidth - imageWidth) / 2 : 0;
      const left = correction + card.x + card.width / 2 - imageWidth / 2 - card.crop;
      const top = wider ? 0 : (height - imageHeight) / 2;
      ctx.save(); ctx.beginPath();
      ctx.roundRect(card.x, 0, card.width, height, Math.min(N.radius, card.width / 2));
      ctx.clip(); ctx.drawImage(image, left, top, imageWidth, imageHeight); ctx.restore();
    }
  }
  function finish() {
    cancelAnimationFrame(frame); frame = 0;
    canonical(); draw(); diagnostics();
  }
  function animate(now) {
    const progress = Math.min(1, Math.max(0, (now - started) / N.duration));
    const eased = easeOutExpo(progress);
    offset = mix(fromOffset, toOffset, eased);
    for (const card of cards) {
      card.width = mix(card.fromWidth, card.toWidth, eased);
      card.gap = mix(card.fromGap, card.toGap, eased);
      card.crop = mix(card.fromCrop, card.toCrop, eased);
    }
    draw();
    if (progress < 1) frame = requestAnimationFrame(animate);
    else finish();
  }
  function start(prepended = 0, instant = false) {
    cancelAnimationFrame(frame); frame = 0;
    if (reduce || instant || !visible || document.hidden || !loaded) { finish(); return; }
    metrics = columnMetrics(width, height, items.length, hovered, reduce);
    fromOffset = offset - prepended * (N.smallWidth + N.largeGap);
    toOffset = columnOffset * (N.smallWidth + N.largeGap);
    for (const card of cards) {
      card.fromWidth = card.width; card.fromGap = card.gap; card.fromCrop = card.crop;
      card.toWidth = metrics.widths[card.column] ?? N.smallWidth;
      card.toGap = card.column < 4 ? N.largeGap : N.smallGap;
      card.toCrop = card.column === 0 ? 0 : items[card.item].collapsedOffsetX || 0;
    }
    started = performance.now(); frame = requestAnimationFrame(animate); diagnostics();
  }
  function move(amount, instant = false) {
    if (!amount || disposed) return;
    amount = Math.sign(amount) * Math.min(Math.abs(amount), items.length - 1);
    index = wrapIndex(index + amount, items.length);
    if (amount > 0) {
      for (let i = 0; i < amount; i++) cards.push(newCard(cards.at(-1).item + 1, 0));
      columnOffset -= amount;
    } else {
      for (let i = 0; i < -amount; i++) cards.unshift(newCard(cards[0].item - 1, 0));
    }
    cards.forEach((card, i) => { card.column = i + columnOffset; });
    start(Math.max(0, -amount), instant);
  }
  function hit(x) { return cards.find(card => card.x <= x && x <= card.x + card.width)?.column ?? -1; }
  function onPointerMove(event) {
    if (event.pointerType === 'touch') return;
    const column = hit(event.offsetX);
    if (column !== hovered) { hovered = column; canvas.style.cursor = column >= 0 ? 'pointer' : 'default'; start(); }
  }
  function onPointerLeave() {
    if (hovered === -1) return;
    hovered = -1; canvas.style.cursor = 'default'; start();
  }
  function onClick(event) {
    const column = hit(event.offsetX);
    if (column > 0) onSelect(column);
  }
  function resize() {
    const rect = canvas.getBoundingClientRect();
    if (!rect.width || !rect.height) return;
    width = rect.width; height = rect.height; dpr = Math.min(2, window.devicePixelRatio || 1);
    canvas.width = Math.round(width * dpr); canvas.height = Math.round(height * dpr);
    finish();
  }
  const observer = new ResizeObserver(resize); observer.observe(canvas);
  const intersection = new IntersectionObserver(([entry]) => { visible = entry.isIntersecting; if (!visible && frame) finish(); }, { threshold: 0 });
  intersection.observe(canvas);
  const onVisibility = () => { if (document.hidden && frame) finish(); else draw(); };
  document.addEventListener('visibilitychange', onVisibility);
  window.addEventListener('resize', resize);
  canvas.addEventListener('pointermove', onPointerMove);
  canvas.addEventListener('pointerleave', onPointerLeave);
  canvas.addEventListener('click', onClick);
  canvas.dataset.newsReady = 'false';
  resize();
  Promise.all(items.map(story => loadImage(story.image))).then(result => {
    if (disposed) return;
    images = result; loaded = images.every(image => image.naturalWidth > 0);
    canvas.dataset.newsReady = String(loaded);
    canvas.dataset.newsImages = String(images.filter(image => image.naturalWidth > 0).length);
    draw();
  });
  return {
    move,
    setReduced(value) { reduce = value; if (reduce) hovered = -1; finish(); },
    dispose() {
      disposed = true; cancelAnimationFrame(frame); observer.disconnect(); intersection.disconnect();
      document.removeEventListener('visibilitychange', onVisibility); window.removeEventListener('resize', resize);
      canvas.removeEventListener('pointermove', onPointerMove); canvas.removeEventListener('pointerleave', onPointerLeave); canvas.removeEventListener('click', onClick);
    },
  };
}
