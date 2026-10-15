# Credo website redesign

A Next.js / React prototype of Credo Bank’s homepage, with animated product cards, an international-transfer globe, news carousel, calculators, and separate shader studies.

## Run

```sh
npm install
npm run dev -- --port 3010
```

Open http://localhost:3010. For a production check, run `npm run build`.

## Saved loan-card shader previews

The shader exploration is isolated from the homepage. V2–V5 are saved independently and can be selected or compared in the preview:

- Latest (V5): http://localhost:3010/previews/loan-shader?version=organic
- Compare V4 / V5: http://localhost:3010/previews/loan-shader?version=organic&compare=1&against=soft
- Compare V3 / V5: http://localhost:3010/previews/loan-shader?version=organic&compare=1&against=flowing

The picker supports any saved pair. White space, heading, card proportions and loan artwork stay consistent. See [version history](app/previews/loan-shader/versions/README.md) for all links. The shader uses `shaders` 4.0.4 and shows a static fallback if GPU rendering is unavailable.

The loan artwork video is loaded from `https://tazolomtadze.com/videos/credo/thumbnail.mp4`; other illustration, font, globe and news assets are stored locally.

## Design source

[Credos Ugly screens, frame 89:10170](https://www.figma.com/design/j82F8IlyXGFLfyx4RT84iF/Credos-Ugly-screens?node-id=89-10170)

The 1440px reference has a contained campaign hero, product bento, MyCredo showcase, and calculator. The implementation includes these sections, a savings-goal card, and a და-ყა-ვი installment card. The international-transfer card now has a live globe in place of its original static artwork. At 1440px the sections begin at the reference positions: hero 151px, products 993px, MyCredo 2491px, calculator 3495px.

All Figma images and vectors are local in `public/assets`. Their device, logo, and card compositions are preserved as separate editable elements in `components/DesignArt.jsx`; the page does not use screenshots as implementation assets. The old globe composition remains there as a reference. `app/design-art.css` contains scoped artwork styles. Local Noto Sans Georgian provides the Georgian fallback font.

## International-transfer globe

The animation follows the [Stripe homepage money-movement globe](https://stripe.com/) and the supplied recording: a rotating particle globe, occasional outward particle drift, gradient great-circle routes, glowing endpoints, and travelling amount labels. Country flags replace the wallet logos, with Georgia included among the routes. The globe uses coral and blue shades from Credo’s primary and secondary brand colors.

Three.js draws approximately 18,000 land particles in one GPU draw call. Route and particle motion run outside React. The scene stops when offscreen, when the document is hidden, or when paused. Reduced motion presents an established static scene; unavailable WebGL uses a static canvas fallback. Resolution is capped at 2× device pixel ratio.

- `components/TransferGlobe.jsx`: React lifecycle, labels, accessible pause control, motion preference.
- `lib/create-transfer-globe.mjs`: geographic point sampling, Three.js scene, routes and lifecycle.
- `lib/globe-motion.mjs`: city coordinates, timing, easing and route choreography.
- `lib/globe-shaders.mjs`: particle appearance and outward drift.
- `app/globals.css`: globe background, flag labels and pause control.

In development, `/?globeMotion=reduce#products` previews the same static branch used for the system reduced-motion preference. Colors are in `lib/globe-shaders.mjs` and the route palettes at the beginning of `lib/create-transfer-globe.mjs`.

Local source assets: the geographic mask comes from Stripe's public `map-dots.0f396e3d.png`; country flags come from [FlagCDN](https://flagcdn.com/). Assets are served locally during playback. Amounts and routes are illustrative.

## Continue editing

- `app/page.jsx`: section composition, calculator state, product actions, dialogs.
- `app/globals.css`: responsive page layout, tokens, component styling, interaction motion.
- `components/DesignArt.jsx`: original artwork composition with source node IDs.
- `app/design-art.css`: positioning and styling for those compositions.

## Homepage news

The news section follows Stripe's homepage “What's happening” carousel and the supplied 13 October 2026 recording. It sits after the calculator and is reachable at `/#news` and from the header's news link.

Desktop reproduces the 1232 × 460 image composition: a full-size leading image, three progressively narrower clips, three 8px strips, 16px/8px gaps, 6px corners, and a one-second ease-out-exponential expansion. Images retain their scale as the clips change width. Hover redistributes the available width; clicking a compressed story selects it; previous/next loop in both directions. Captions crossfade in 120ms. There is no autoplay.

Below 640px, it becomes Stripe's separate native swipe carousel: viewport-minus-32px cards, 336:350 media, snapping, adjacent-card scaling and image parallax. The 640–939px layout retains the reference's cropped 870px canvas. Reduced motion uses instant layout changes and removes mobile scaling/parallax. Keyboard navigation is immediate. Rendering stops when idle, offscreen or hidden; desktop images load near the section.

- `components/NewsSection.jsx`: composition, navigation, mobile scrolling, preferences and article previews.
- `data/home-news.mjs`: eight editable Georgian sample stories, images and collapsed-image focal offsets.
- `lib/news-carousel-layout.mjs`: reference geometry and easing.
- `lib/create-news-carousel.mjs`: interaction-driven canvas renderer.
- `app/news.css`: scoped source spacing, typography, colors and responsive treatment.

The original high-resolution Stripe imagery is intentionally temporary for this structure pass. Desktop images are 1632 × 918; separate mobile images are 672 × 700, the largest originals supplied by the reference. The original source icons and Latin font are local, with the existing Georgian font as fallback. `public/assets/news/sources.json` records the asset URLs. No assets are hotlinked at runtime. Georgian copy is illustrative and does not represent actual Credo announcements. Read-more actions open local article previews without adding routes.

In development, `/?newsMotion=reduce#news` previews the same reduced-motion branch used for the system preference. Final visual verification is recorded in `design-qa.md`.

## Current interactions

- Product actions navigate to the corresponding inline calculator.
- Loan, deposit, and currency tabs update the calculator with a short transition.
- Loan and deposit amounts and terms recalculate immediately.
- Currency selectors and the swap button use illustrative exchange rates.
- Pointer presses, card artwork, and dialogs have restrained motion; reduced-motion users receive an instant alternative. Keyboard tab selection is immediate.
- Native dialogs handle Escape, focus containment, and return focus.

The calculator uses demonstration rates and monthly compounding/amortization. They are not live Credo terms. The monthly payment therefore differs from the inconsistent sample result in Figma. No requests are submitted. Application and download actions open an explanatory prototype dialog. The hero has one supplied campaign, so its carousel arrows remain disabled. Navigation retains the placeholder labels from the design.

## Verification

Production build passed. Browser checks covered desktop comparison with Figma, widths 320/390/768/1024/1440, all image loading, loan and savings calculations, conversion and swapping, empty/zero inputs, keyboard selection, product shortcuts, dialog dismissal and focus restoration. No browser errors or horizontal document overflow appeared. OS-level reduced-motion playback and physical-device performance have not been tested.

Globe checks covered the production build, route timing and geographic distance calculations, desktop/mobile visuals, widths 320/390/768/1440, pause stability, keyboard resume, offscreen stopping, and the development reduced-motion branch (static scene, no playback control). The reduced-motion branch was verified through its preview switch; the operating system preference itself was not changed. WebGL fallback and physical-device frame rates have not been exercised.

News checks covered side-by-side desktop/mobile source comparison, compressed-story selection, forward/backward looping, rapid direction changes, keyboard navigation, article dialogs and focus restoration, native swipe snapping, widths 320/390/768/1024/1440, local image loading and both development motion variants. No browser warnings/errors or horizontal document overflow appeared. `design-qa.md` records the repaired findings, evidence and remaining polish notes; its final result is passed.
