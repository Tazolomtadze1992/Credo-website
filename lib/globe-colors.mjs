// Shades derived in OKLCH from Credo's coral (H 29.48) and blue (H 232.094).
// sRGB hex is used at the Three.js / canvas boundary; every shade is in gamut.
export const GLOBE_COLORS = Object.freeze({
  coral: '#fc6250',
  blue: '#1e6e91',
  pointNeutral: '#d3d0d0', // oklch(0.86 0.003 29.48)
  coralSoft: '#f4b1a6',   // oklch(0.82 0.08 29.48)
  coralMist: '#f5d6d1',   // oklch(0.9 0.035 29.48)
  blueSoft: '#7fafc9',    // oklch(0.73 0.064 232.094)
  blueMist: '#b8d2e1',    // oklch(0.85 0.035 232.094)
});

export const POINT_PALETTE = [GLOBE_COLORS.coral, GLOBE_COLORS.pointNeutral, GLOBE_COLORS.blue];
export const ROUTE_PALETTES = [
  [GLOBE_COLORS.coral, GLOBE_COLORS.coralSoft],
  [GLOBE_COLORS.blue, GLOBE_COLORS.blueSoft],
  [GLOBE_COLORS.coralSoft, GLOBE_COLORS.coral],
];
export const SIMPLE_ROUTE_PALETTES = [
  [GLOBE_COLORS.blueSoft, GLOBE_COLORS.blueMist],
  [GLOBE_COLORS.coralSoft, GLOBE_COLORS.coralMist],
  [GLOBE_COLORS.blueMist, GLOBE_COLORS.blueSoft],
];
