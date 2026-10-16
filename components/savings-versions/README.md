# Saved savings-card designs

- V1 · Illustration: http://localhost:3010/?savings=original#savings
- V2 · Destination goal: http://localhost:3010/?savings=photo#savings
- V3 · Balanced goal: http://localhost:3010/?savings=balanced#savings
- V4 · Interactive dots: http://localhost:3010/?savings=particles#savings
- V5 · Credo logo particles behind savings panel: http://localhost:3010/?savings=logo#savings
- V6 · Join the Credo family, original background: http://localhost:3010/?savings=family#credo-family
- V7 · Credo family with a soft wash: http://localhost:3010/?savings=family-soft#credo-family
- V8 · Airy Credo family, homepage default: http://localhost:3010/?savings=family-airy#credo-family

The parameter applies on page load. No version picker is added to the customer-facing homepage.

## V1 · Original illustration

`v1-illustration.jsx` is copied verbatim from the original SavingsGoal component. Its full CSS is frozen in `v1-illustration.css` and imported by `app/savings.css`. The original warm background remains in `app/bento-background.css`. Its suitcase, ring, digit reel, hover, mobile layout and colors are preserved.

## V2 · Destination goal · 16 October 2026

One goal panel combines real Positano photography, the goal name, a prominent balance, a thin coral progress bar and a target amount. The background is static near-white with a localized secondary-blue light wash. The panel has a black 5% edge, restrained contact shadow and 12px corners. It stays stationary during the deposit animation.

Photo: Kevin McMahon, [Positano on Unsplash](https://unsplash.com/photos/city-near-body-of-water-during-daytime-yM1OJiSMTPo), free under the Unsplash License shown on its source page. The 1800×1200 original was resized to 1440×960 WebP without AI processing, retouching or recoloring. Source and license URLs are in `public/assets/savings/sources.json`. The runtime serves it locally, cropped at 50% / 58% within the image header.

### Palette

| Before | After |
| --- | --- |
| Warm radial halo: `oklch(.954 .021 29.48)` / `oklch(.91 .04 29.48)` | Paper `oklch(.993 .002 232.094)` with a localized `oklch(.905 .032 232.094 / .75)` blue wash and `oklch(.975 .009 232.094 / .2)` feather |
| Goal name `#254957`, balance `#204b5e` | Unified goal ink `oklch(.365 .047 232.094)` |
| Supporting labels `#64757c`, percent `#54727e` | Supporting ink `oklch(.51 .024 232.094)` |
| Ring coral `#F6806E`, white ring track | Brand-derived coral `oklch(.693 .192 29.48)`, cool track `oklch(.95 .012 232.094)` |
| Translucent deposit pill with `#376f65` and a green check | White deposit receipt with the same blue ink and supporting ink as the goal panel |

All new palette endpoints are within sRGB gamut. Main ink contrast on white is 10.53:1; supporting ink is 5.71:1. Color from the real photograph is unmodified. White panel surfaces keep all text off the photograph and light wash.

### Motion and layout

Fine-pointer hover reveals the deposit receipt over 180ms opacity / 350ms transform. After 170ms, two digit reels and the progress fill settle over 620ms with `cubic-bezier(.25,1,.5,1)`. The balance goes ₾7,500→₾8,000 and progress 75→80%. Percent crossfade begins after 340ms. Leaving reverses from the current state, with 350ms balance/progress return and no exit delay. These are CSS transform/opacity transitions, with no timers, autoplay, React frame updates or new renderer.

Desktop retains the existing outer card, title, hover expansion and grid. The panel is at most 336px wide. Below 760px, V2 alone reserves 490px height so the photo and summary fit; below 360px it reserves 450px and uses a compact summary. V1's original mobile dimensions remain unchanged. The existing card action still opens the deposit calculator. The entire visual is an illustrative `role=img`; its nested receipt and progress are not fake interactive controls.

Before coding the animation, the static composition was rendered and captured in `outputs/savings-panel/static-direction.png` (relative to the parent task's root, not this app). Browser evidence, source comparison and scope limits are recorded in the app's `design-qa.md`.

## V3 · Balanced goal · 16 October 2026

The large photo header competed with the bank-card and globe. V3 reduces it to a 72×72 destination thumbnail within a white goal panel, with a small supporting goal label. The balance and thin progress bar now lead. Photo detail covers about 90% less area at the 1280px comparison width. The source asset is unchanged; only its presentation uses `saturate(.8) contrast(.92)` and a 10% pale blue veil. V2's full-color photo header remains available at its saved URL.

The panel is at most 320px wide, with 24px internal padding and a softer contact shadow. The surrounding wash uses `oklch(.94 .018 232.094 / .7)` and `oklch(.98 .006 232.094 / .2)`, keeping white space above and a subtle secondary-blue atmosphere below. Ink, coral progress, balance size and all deposit transition timings are retained from V2. Supporting balance/target labels are 12px. The receipt now appears at the panel's upper-right edge, clear of the goal name and metrics.

Below 760px, only V3 reserves 440px height. At compact container widths, the thumbnail becomes 60px, the balance 32px, and panel padding 20px. Other cards, grid spacing, outer headings and actions are unchanged. No new animation loop, shader, dependency or reduced-motion handling is introduced.

## V4 · Interactive dots · 16 October 2026

V4 composes the immutable V3 goal component and styles, so the panel, destination photo, all layout breakpoints and the complete deposit animation are preserved. Its independently scoped wrapper replaces V3's static wash with a very faint two-hue halo and a transparent WebGL particle field. The saved V3 URL remains an exact comparison without particles.

Reference: [Stripe's live agentic-commerce bento](https://stripe.com/en-nl). Its resting state, center hover and edge hover were captured before implementation in the parent task's `outputs/stripe-particle-study/`. Public source inspection confirmed a Three.js point cloud with radial noise, varied alpha/size and a smoothed localized pointer response. V4 implements that approach independently, with a quiet Credo palette and the existing, shorter Credo card geometry.

### Background palette

| Before | After |
| --- | --- |
| V3 blue wash `oklch(.94 .018 232.094 / .7)` / `oklch(.98 .006 232.094 / .2)` | Faint blue halo `oklch(.85 .035 232.094 / .12)` and coral halo `oklch(.82 .08 29.48 / .055)`, both feathering to transparent |
| No background dots | Globe-family blue endpoints `#1e6e91`, `#7fafc9`, `#b8d2e1`; coral endpoints `#fc6250`, `#f4b1a6`; neutral `#d3d0d0`. Hex is used at the Three.js/Canvas boundary; these frozen sRGB values are copied from the existing OKLCH-derived globe palette. |

The near-white paper, panel surface, all ink colors, photo treatment and coral progress bar are unchanged. Blue and neutral dots dominate; sparse coral accents and randomized low alpha provide warmth and depth. The source photo remains byte-identical.

### Motion and lifecycle

One GPU point draw renders 5,600 seeded points (3,400 when initially mounted below 300px wide), with .65–2.15 CSS-pixel sizes. Low-frequency coherent noise and independent drift animate a loose ellipse around the panel. The heading area fades to clear; the opaque white panel covers dots behind its content. A fine pointer locally gathers noisy points toward their resting silhouette. Position and strength ease toward their targets, including a gradual release after exit. Touch input does not activate the pointer effect.

Pixel ratio is capped at 1.75. Idle rendering targets 30fps; pointer interaction targets 60fps. The renderer suspends off screen and while the document is hidden, and disposes listeners, observers, GPU resources and any fallback on unmount. No React state changes per frame. A static Canvas fallback preserves the particle composition if WebGL is unavailable or its context is lost. The development-only `&savingsParticles=static` parameter exercises that fallback without adding customer-facing controls.

The full production build and browser checks passed; evidence and exact limits are recorded in `design-qa.md`. No reduced-motion changes or new package dependencies were added.

## V5 · Credo logo particles · 16 October 2026

V5 replaces the circular V4 distribution with particles sampled from the actual Credo emblem used by the homepage header (`public/assets/2d290.svg`). The source is copied unchanged into `public/assets/savings/credo-emblem-v5.svg`; a 512px role-encoded PNG mask preserves its exact blue-arrow, gray-arrow and central-disc paths. `v5-logo-source.json` records provenance and the original SHA-256. The mask is a geometry input, not a visible logo image pasted over the card.

The particle depiction uses blue for the first arrow and coral for the second. The emblem is oversized and partly cropped by the outer card, while the existing white savings panel occludes its center. This keeps the panel intact; the complete emblem is not simultaneously visible behind it. Geometry and lettering in the actual header/card logos are untouched.

| Before | After |
| --- | --- |
| 5,600 circular-cloud points (3,400 on initial narrow mounts) | 9,000 emblem-shaped points (5,400 on initial mounts below 300px) |
| Blue/coral accents scattered among pale dots | Existing blue/coral endpoint colors concentrated along the emblem's two arrows; neutral/mist shades remain in the central disc |
| Low alpha proportional to random^1.8, max .66 before density fade | Higher alpha .18–.76 on the arrows, with a gentler random distribution; core reduced to 44% of arrow alpha |
| .65–2.15px points | .8–2.5px points |
| Slow drift with a faint silhouette change | Faster two-scale coherent flow, visible independent drift and a soft breathing cycle; a smaller loose subset wanders more broadly while the logo silhouette holds |
| Blue halo .12 alpha, coral halo .055 alpha | Same halo colors at .2 blue / .12 coral alpha; near-white paper unchanged |
| 30fps idle target | 60fps visible-render target, with existing offscreen/hidden-document suspension retained |

The primary endpoints are still `#1E6E91` and `#FC6250`; soft/mist/neutral endpoints are unchanged from V4. No new hues or package dependencies are introduced. V5 has its own component, styles and renderer, while V1–V4 retain their checksums and explicit URLs. The V3 panel, photo, type, shadow, responsive sizing and complete deposit sequence are composed unchanged. A development-only `&savingsParticles=static` switch exercises the logo's Canvas fallback. No reduced-motion changes were added.

## V6 · Join the Credo family · 16 October 2026

V6 repurposes the third bento card as „გახდი კრედოს ოჯახის წევრი“. The savings panel is removed in this version so the complete emblem is visible, including its central disc. It samples the exact frozen V5 role mask; original logo paths and the actual header/card logos are untouched. The existing 18px medium heading, card geometry, border and outer hover are retained.

| Before | After |
| --- | --- |
| Savings panel occludes the oversized logo center | Full emblem fits below the heading with clear margins and no foreground panel |
| 9,000 points with a muted 16% core share | 12,000 points; 30% per arrow and 40% in the core, whose alpha increases from .44 to .8 of arrow alpha |
| Pointer gathering | Local 12–26px repulsion with smoothed return; quieter coherent drift retains the silhouette |
| Savings heading and deposit action | Family invitation; action navigates to [Credo’s official account information](https://credobank.ge/products/current-account) in the same tab |

Blue/coral arrow endpoints and near-white halo colors are unchanged from V5. The center shades between the existing `#B8D2E1`, `#7FAFC9` and `#1E6E91` endpoints, with lighter points toward the upper-left. The logo size is bounded by 80% of card width and the remaining area below the heading. Initially mounting below 300px selects 7,200 points; mobile reserves the existing 440px compact card height. Counts stay fixed until remount.

One GPU point draw targets 60fps while visible, with DPR capped at 1.75, offscreen/document-hidden suspension and complete cleanup. No per-frame React updates or dependencies. Static Canvas fallback retains the full emblem; `&savingsParticles=static` remains a development-only check. No reduced-motion changes.

`SavingsGoal.jsx` now selects each version’s outer heading/action as well as its visual. V1–V5 keep their original savings heading, immutable source files and calculator action. V6 is the homepage default; the parameter applies on load and no customer-facing picker is added. The existing `#savings` anchor remains, while V6 also exposes `#credo-family`.

## V7 · Soft family wash · 16 October 2026

V7 composes the frozen V6 emblem component and renderer, replacing only its CSS background inside a separately scoped wrapper. Particle geometry, colors, counts, opacity, idle movement, pointer response, fallback and card layout are unchanged. `?savings=family` preserves the exact V6 background; `?savings=family-soft` selects V7, the new homepage default.

| Before | After |
| --- | --- |
| Uniform paper `oklch(.993 .002 232.094)` | Vertical paper wash: white `oklch(1 0 0)` at the top, original paper at 32%, pale secondary-blue `oklch(.976 .008 232.094)` at the bottom |
| Central blue halo `oklch(.85 .035 232.094 / .2)` | Broad lower-left blue light `oklch(.94 .02 232.094 / .72)`, feathering to transparent at 85% |
| Central coral halo `oklch(.82 .08 29.48 / .12)` | Broad lower-right coral light `oklch(.953 .022 29.48 / .65)`, feathering to transparent at 85% |
| Halo spread into the middle | A static alpha mask keeps the first 22% clear and gradually reveals the wash by 60%; emblem remains unmasked |

All new endpoints are in sRGB gamut and keep the established Credo hue angles. The warm and cool pools stay low in chroma and blend into the near-white paper. This is a static depth treatment: no new background animation, blur, dependency or reduced-motion work.

## V8 · Airy family particles · 16 October 2026

V8 preserves V7’s exact gradient colors, positions, stops and mask, with a new independent particle renderer sampled from the same frozen V5 emblem mask. The logo stays readable while its outline disperses into a feathered cloud. The heading, card dimensions and account-information action are unchanged.

| Before | After |
| --- | --- |
| All dots begin inside the logo mask | A seeded 35% subset spreads in random directions, reaching up to 20% of logo size beyond each point’s original position; the other 65% stays close to the silhouette |
| Noise drift peaks at 32px plus 8px independent drift | Loose points allow 44px noise-field amplitude plus 11px independent drift; anchored points retain the previous 10px / 2.5px values |
| No spreading cycle | Scatter distance breathes between 76–100% over about 14 seconds, with per-point phases |
| Uniform opacity behavior across the cloud | Loose-point opacity gradually reduces to 65% of its original value, with an 18px side feather preventing hard clipping; title and bottom fading remain |
| Pointer radius 27% of logo size, displacement 12–26px | Radius 30%, displacement 14–32px; the same smoothed pointer and release behavior |

The existing 12,000 / 7,200 point counts, .8–2.5px sizes, 30/30/40 role mix, Credo color endpoints, core shading, 60fps visible target, DPR cap, visibility suspension and resource cleanup remain. Static Canvas fallback uses the same seeded dispersion and edge feather. No new packages, per-frame React updates or reduced-motion changes. V1–V7 source hashes are preserved.
