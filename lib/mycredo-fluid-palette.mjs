// Matte hover in the reference background's cobalt hue, with a quiet lightness lift.
export const MYCREDO_FLUID_OKLCH = Object.freeze({
  surfaceColor: [0.3, 0.09, 264.012],
});

export function oklchToLinearSrgb([lightness, chroma, hue]) {
  const angle = hue * Math.PI / 180;
  const a = chroma * Math.cos(angle), b = chroma * Math.sin(angle);
  const l = (lightness + 0.3963377774 * a + 0.2158037573 * b) ** 3;
  const m = (lightness - 0.1055613458 * a - 0.0638541728 * b) ** 3;
  const s = (lightness - 0.0894841775 * a - 1.291485548 * b) ** 3;
  return [4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s,
    -1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s,
    -0.0041960863 * l - 0.7034186147 * m + 1.707614701 * s];
}

export const MYCREDO_FLUID_RGB = Object.fromEntries(Object.entries(MYCREDO_FLUID_OKLCH).map(([name, color]) => [name,
  oklchToLinearSrgb(color).map(v => v <= 0.0031308 ? 12.92 * v : 1.055 * v ** (1 / 2.4) - 0.055),
]));
