# დაყავი artwork versions

| Version | Homepage URL | Artwork |
| --- | --- | --- |
| V1 | `/?dayavi=original#products` | Frozen original eight-payment panels |
| V2 | `/?dayavi=particles#products` | Dithered supplied mark; local cubic cursor repulsion and damped reassembly |

The homepage defaults to V2. `?dayaviRenderer=static` in development shows its exact SVG fallback. No new route is required. The saved shared-background comparison retains V1 artwork.

`/?dayaviControls=1#products` loads an optional DialKit editor for logo zoom, dot weight, cursor radius, push and opacity. Its built-in versions are saved locally in this browser. The editor and saved overrides apply only when this query is present; the normal homepage stays at the code defaults. Reset logo restores the baseline. If globe controls are also enabled, their existing root displays both panels.

Current approved defaults: Cursor Radius 16 and Push 95 (normalized `.16` / `.95`). Both the ordinary homepage and Reset logo use these values. Existing saved custom presets remain available.

Reference: [Linear /next](https://linear.app/next) and the user-supplied 17 October 2026 recording. This is an independent recreation of the observed interaction, using the supplied დაყავი image; no Linear logo data or implementation is bundled.

The source PNG is retained at `public/assets/dayavi/source-logo.png`. `scripts/generate-dayavi-particles.py` (Pillow required) reproducibly crops the three original tiles and exports the JSON coordinates and matching SVG fallback. The crop is `(9, 9, 439, 148)` in the supplied 448×208 image. The two source colors are preserved. There are 12,279 dots on a 240×78 sample grid.

Run `node --test scripts/dayavi-particles.test.mjs` for locality, return, interruption, numerical stability, frame-cadence and source-coordinate checks. The renderer sleeps at equilibrium and offscreen. Pointer motion updates the current particle state directly, without React rendering each frame.
