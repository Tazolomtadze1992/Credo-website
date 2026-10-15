# Bank-card background versions

- V1, original: http://localhost:3010/?cardRibbon=original#bank-card
- V2, polished: http://localhost:3010/?cardRibbon=polished#bank-card

V1 is the original file copied without changes. V2 keeps the same four Credo OKLCH shades, shader plane, camera framing, animation speed and pointer response. It adds a slightly fuller curve, variable band widths, irregular fibers, softer asymmetric crests and shallow shading within the blue fold. The physical card and its existing tilt/shadow renderer are unchanged.

The palette remains paper `[.993,.002,30]`, coral `[.87,.06,29.48]`, blue `[.84,.055,232.094]`, peach `[.955,.019,29.48]`. V2's static fallback is rendered from the same field math into `public/assets/card/ribbon-polished-fallback.png`.

The URL parameter applies on page load. Open the two links in separate tabs to compare full-page context. No selector is added to the customer-facing homepage.

Preserve delivered snapshots and their `snapshots.sha256` file when adding a future version.
