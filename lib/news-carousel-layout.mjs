// Measurements from Stripe's homepage news carousel, October 2026.
export const NEWS_CAROUSEL = Object.freeze({
  width: 1232, height: 460, largeGap: 16, smallGap: 8,
  smallWidth: 8, smallHoverGrowth: 3, radius: 6, duration: 1000,
});
const REST = [-.06, .61, .30, .15];
const SQUEEZED = [-.12, .59, .28, .13];
const STRETCHED = [0, .71, .40, .25];
export const wrapIndex = (index, length) => ((index % length) + length) % length;
export const easeOutExpo = progress => progress >= 1 ? 1 : 1 - 2 ** (-10 * Math.max(0, progress));

export function columnMetrics(width, height, count = 8, hovered = -1, reduced = false) {
  const smallCount = Math.max(1, Math.min(count - 4, 3));
  const gap = smallCount * NEWS_CAROUSEL.smallGap + 3 * NEWS_CAROUSEL.largeGap;
  const imageWidth = height * 16 / 9;
  const mediumWidth = width - imageWidth - gap - smallCount * NEWS_CAROUSEL.smallWidth;
  const hoverGrowth = !reduced && hovered > 3 ? NEWS_CAROUSEL.smallHoverGrowth : 0;
  const fractions = !reduced && hovered >= 0 && hovered <= 3
    ? SQUEEZED.map((value, i) => i === hovered ? STRETCHED[i] : value)
    : REST;
  const widths = Array.from({ length: 4 + smallCount }, (_, column) => column < 4
    ? (column === 0 ? imageWidth : 0) + (mediumWidth - hoverGrowth) * fractions[column]
    : NEWS_CAROUSEL.smallWidth + (column === hovered ? hoverGrowth : 0));
  return { imageWidth, mediumWidth, hoverGrowth, widths, visibleCount: 4 + smallCount };
}
