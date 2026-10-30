# Credo history exploration

Three isolated variants live at `/prototypes/credo-history?v=1|2|3`.

- Credo: selected milestone years, blue year markers, larger regular photo cards.
- Archive: every year, sparse gray rail, smaller scattered photographs and hover reveals.
- From start: Credo visuals, no automatic sweep, parked at 1997. Scroll down or drag left to explore forward; the first two variants preserve their original entrance and wheel behavior.

Adapted from Evil Rabbit's Lifeline, MIT (copyright 2026 Evil Rabbit), downloaded 30 October 2026. The original license is retained in `source/vendor/LICENSE`; the complete upstream snapshot is retained under `research/credo-history/upstream/lifeline-main` in the design workspace.

Preserved: opening sweep, momentum/axis handling, rail fades, drag cards, FLIP image expansion, mobile vertical timeline and reduced-motion behavior.

Adaptations: Georgian font/labels; source-backed company content; CSS utilities compiled once and scoped to `.lf-scope` (no Tailwind runtime/project dependency); optional company icons and fireworks have no active content. Lucide's two media glyph usages are replaced with small local SVGs. Uses the shared website navigation, with no footer helper copy. Added keyboard photo activation, focused modal dismissal, original-resolution limits, and date/source captions. Prototype picker follows the prototype skill specification.

Homepage and production navigation are unchanged. No new project dependencies were installed. Build tooling was isolated in `/private/tmp/credo-lifeline-build`.

Research: `/research/credo-history/index.html`. 21 core milestones, 7 further milestone leads, 24 selected real images from 5 historical reports plus official media. Original publication dates are distinguished from photograph capture dates. Source files and the BDM archive request are alongside the dossier. Low-resolution images are not enlarged in the viewer.

Before publication: confirm early-photo captions and rights, obtain original files from BDM, resolve Gojo percentage discrepancy, approve chronology/copy, and replace promotional composites with source photography where available.
