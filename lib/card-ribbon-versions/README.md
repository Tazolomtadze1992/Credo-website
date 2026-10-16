# Bank-card background versions

- V1, original: http://localhost:3010/?cardRibbon=original#bank-card
- V2, polished: http://localhost:3010/?cardRibbon=polished#bank-card
- V3, flowing satin (homepage default): http://localhost:3010/?cardRibbon=flow#bank-card

V1 is the original file copied without changes. V2 keeps the same four Credo OKLCH shades, shader plane, camera framing, animation speed and pointer response. It adds a slightly fuller curve, variable band widths, irregular fibers, softer asymmetric crests and shallow shading within the blue fold. The physical card and its existing tilt/shadow renderer are unchanged.

The palette remains paper `[.993,.002,30]`, coral `[.87,.06,29.48]`, blue `[.84,.055,232.094]`, peach `[.955,.019,29.48]`. V2's static fallback is rendered from the same field math into `public/assets/card/ribbon-polished-fallback.png`.

The URL parameter applies on page load. Open the two links in separate tabs to compare full-page context. No selector is added to the customer-facing homepage.

Preserve delivered snapshots and their `snapshots.sha256` file when adding a future version.

## V3 · Flowing satin · 16 October 2026

V3 replaces the small bend-in-place motion with independent folds travelling diagonally along a curved sheet. Broad coral, blue and peach areas keep the upper heading space clear. A soft shoulder and shaded side around the moving crest give the sheet depth; long fibers travel with it, with static output dither to avoid crawling grain. The time phase is `.42 × elapsed seconds`, compared to V2's `.14`; folds use different phase velocities to avoid a rigid repeating stripe.

The existing four OKLCH shades are unchanged. V3 adds `blueFold: [.71, .075, 232.094]`, used at a maximum of 17% in a localized fold. Every palette endpoint is inside sRGB gamut. The static equivalent is `public/assets/card/ribbon-flow-fallback.png`, rendered at time zero from the same field math.

The card's face, framing, tilt, lighting, shadow, pointer response and renderer lifecycle remain unchanged. Rendering continues at the existing ambient 30fps / settling 60fps, and pauses offscreen or when hidden. V1/V2 sources and assets remain intact. The query parameter applies on page load; no prototype controls are added to the homepage.
