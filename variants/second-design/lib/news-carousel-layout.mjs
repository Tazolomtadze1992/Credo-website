// Ported from Credo-web-variants: lib/news-carousel-layout.mjs.
// Same column model and hover behaviour, with the Figma geometry (node 830:1918):
// 831 / 136 / 98 / 43 px image columns, then 15 / 9 px slivers, 12px gaps, 20px radius.
export const NEWS_CAROUSEL = Object.freeze({
  width: 1192, height: 474, imageWidth: 831, largeGap: 12, smallGap: 12,
  smallWidths: [15, 9], smallWidth: 9, smallHoverGrowth: 3, radius: 20, duration: 1000,
});
const MEDIUM = [136, 98, 43];
const MEDIUM_TOTAL = MEDIUM.reduce((a, b) => a + b, 0);
// Share of the medium pool per column at rest; hover keeps the repo's deltas (sum stays 1).
const REST = [0, ...MEDIUM.map(w => w / MEDIUM_TOTAL)];
const SQUEEZED = REST.map((value, i) => value - (i === 0 ? .06 : .02));
const STRETCHED = REST.map((value, i) => value + (i === 0 ? .06 : .10));
export const wrapIndex = (index, length) => ((index % length) + length) % length;
export const easeOutExpo = progress => progress >= 1 ? 1 : 1 - 2 ** (-10 * Math.max(0, progress));

export function columnMetrics(width, height, count = 8, hovered = -1, reduced = false) {
  const smallCount = Math.max(1, Math.min(count - 4, NEWS_CAROUSEL.smallWidths.length));
  const smalls = NEWS_CAROUSEL.smallWidths.slice(0, smallCount);
  const gap = smallCount * NEWS_CAROUSEL.smallGap + 3 * NEWS_CAROUSEL.largeGap;
  const imageWidth = width * NEWS_CAROUSEL.imageWidth / NEWS_CAROUSEL.width;
  const mediumWidth = width - imageWidth - gap - smalls.reduce((a, b) => a + b, 0);
  const hoverGrowth = !reduced && hovered > 3 ? NEWS_CAROUSEL.smallHoverGrowth : 0;
  const fractions = !reduced && hovered >= 0 && hovered <= 3
    ? SQUEEZED.map((value, i) => i === hovered ? STRETCHED[i] : value)
    : REST;
  const widths = Array.from({ length: 4 + smallCount }, (_, column) => column < 4
    ? (column === 0 ? imageWidth : 0) + (mediumWidth - hoverGrowth) * fractions[column]
    : smalls[column - 4] + (column === hovered ? hoverGrowth : 0));
  return { imageWidth, mediumWidth, hoverGrowth, widths, visibleCount: 4 + smallCount };
}
