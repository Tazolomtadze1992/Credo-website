# Credo website redesign

A Next.js / React prototype of Credo Bank’s homepage, with animated product cards, an international-transfer globe, news carousel, calculators, and separate shader studies.

## Run

```sh
npm install
npm run dev -- --port 3010
```

Open http://localhost:3010. For a production check, run `npm run build`.

## Saved shared-bento shader previews

The homepage’s loan and და-ყა-ვი cards share one continuous shader, retaining clear heading space, the loan video and payment artwork. Colors circulate across the row and re-enter from the left in approximately 22 seconds. The current V2 treatment adds localized ocean blue and terracotta depth to the pale bank-card palette. The original V1 treatment is preserved independently.

- V1 · Soft flow: http://localhost:3010/previews/shared-bento?version=soft
- V2 · Rich flow (homepage): http://localhost:3010/previews/shared-bento?version=rich
- Compare both: http://localhost:3010/previews/shared-bento?version=rich&compare=1

The preview reuses the homepage’s exact loan video, artwork, product cards and responsive geometry. Comparison shows both pairs at full width. Selection and comparison are stored in the URL and support reload and browser history. Snapshots live in `lib/shared-bento-versions/`; see its README for the palette and preservation rules. The homepage defaults to the catalog’s latest version. Rendering pauses offscreen and when the document is hidden. On mobile, the same field follows the vertically stacked pair. The shared canvas clips to each card and follows its hover expansion, with a static fallback when WebGL is unavailable. It uses the already-installed Three.js renderer. Clipping and lifecycle live in `components/SharedBentoBackground.jsx`.

## Bank-card background versions

The separate bank-card wave keeps three saved versions: [original V1](http://localhost:3010/?cardRibbon=original#bank-card), [polished V2](http://localhost:3010/?cardRibbon=polished#bank-card), and [flowing satin V3](http://localhost:3010/?cardRibbon=flow#bank-card), the homepage default. V3 adds travelling folds, softer satin crests, advected fibers, and a localized deeper shade of Credo blue; the heading space stays white. The card artwork, geometry, lighting, tilt and shadow remain unchanged. See `lib/card-ribbon-versions/README.md` for the palette, timing and preservation rules.

## Family and savings-card versions

The homepage now uses [V8 · Airy Credo family](http://localhost:3010/?savings=family-airy#credo-family): the full blue/coral particle emblem with a loose outer cloud, gentle breathing spread and localized pointer repulsion. V7’s very light blue/coral gradient and white heading space remain unchanged. [V7 · Compact particles with soft wash](http://localhost:3010/?savings=family-soft#credo-family) and [V6 · Original family background](http://localhost:3010/?savings=family#credo-family) stay saved. Its action opens Credo’s official current-account information page. The saved [V5 · Logo behind the savings panel](http://localhost:3010/?savings=logo#savings), [V4 · Circular dots](http://localhost:3010/?savings=particles#savings), [V3 · Balanced goal](http://localhost:3010/?savings=balanced#savings), [V2 · Photo header](http://localhost:3010/?savings=photo#savings) and [original V1 illustration](http://localhost:3010/?savings=original#savings) retain their savings heading, panel and deposit-calculator action. See `components/savings-versions/README.md` for source geometry, palette, motion and preservation rules. The bank-card, globe, shared top pair and news are unchanged by this pass.

## Earlier loan-only shader previews

These independent studies are also preserved:

- V5: http://localhost:3010/previews/loan-shader?version=organic
- Compare V4 / V5: http://localhost:3010/previews/loan-shader?version=organic&compare=1&against=soft
- Compare V3 / V5: http://localhost:3010/previews/loan-shader?version=organic&compare=1&against=flowing

The picker supports any saved pair. See [version history](app/previews/loan-shader/versions/README.md) for all links. These studies use `shaders` 4.0.4.

## Design source

[Credos Ugly screens, frame 89:10170](https://www.figma.com/design/j82F8IlyXGFLfyx4RT84iF/Credos-Ugly-screens?node-id=89-10170)

The 1440px reference has a contained campaign hero, product bento, MyCredo showcase, and calculator. The implementation includes these sections, a savings-goal card, and a და-ყა-ვი installment card. The international-transfer card now has a live globe in place of its original static artwork. At 1440px the sections begin at the reference positions: hero 151px, products 993px, MyCredo 2491px, calculator 3495px.

All Figma images and vectors are local in `public/assets`. Their device, logo, and card compositions are preserved as separate editable elements in `components/DesignArt.jsx`; the page does not use screenshots as implementation assets. The old globe composition remains there as a reference. `app/design-art.css` contains scoped artwork styles. Local Noto Sans Georgian provides the Georgian fallback font.

## International-transfer globe

The animation follows the [Stripe homepage money-movement globe](https://stripe.com/) and the supplied recording: a rotating particle globe, occasional outward particle drift, gradient great-circle routes, glowing endpoints, and travelling amount labels. Country flags replace the wallet logos, with Georgia included among the routes. The globe uses coral and blue shades from Credo’s primary and secondary brand colors.

The default framing uses the approved DialKit settings: `--globe-frame-zoom:1.18`, horizontal offset `0` and vertical offset `-.02` (Vertical `−2`). The camera projects particles, routes and labels together; point sprites also follow its zoom. The point texture has varied size/opacity, a Credo blue bridge between the brand endpoints, outward drift and a softly shaded blue sphere/rim.

Open [Globe DialKit](http://localhost:3010/?globeControls=1#transfer-globe) to tune the actual homepage card. **Zoom** ranges from `.65` to `1.8`; **Vertical** moves the framing from −20% to +25% of the canvas height. Drag the sliders, or press Enter on a focused slider to type a number. **Reset framing** restores `1.18` / `−2`. The toolbar’s **+** saves a comparison version; versions and edits persist in this browser under `dialkit:credo-transfer-globe-framing`. **Copy parameters** exports the chosen settings for updating the code. These overrides apply only while `globeControls=1` is present; the normal homepage keeps its code defaults. The draggable panel is separate from the clipped card and does not trigger the product action. DialKit is lazy loaded only for this authoring URL.

Three.js draws approximately 18,000 desktop / 9,000 compact land particles in one GPU draw call. Route and particle motion run outside React. DialKit updates the existing camera without rebuilding the scene or resizing its canvas on each slider edit. The scene stops when offscreen, when the document is hidden, or when paused. Reduced motion presents an established static scene; unavailable WebGL uses a static canvas fallback. Resolution is capped at 2× device pixel ratio. The fallback follows camera zoom but does not reproduce the WebGL sphere shading.

- `components/TransferGlobe.jsx`: React lifecycle, labels, accessible pause control, motion preference.
- `components/GlobeDialKit.jsx`: query-enabled framing controls and browser-local saved versions.
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

Below 640px, it becomes Stripe's separate native swipe carousel: viewport-minus-32px cards, 16:9 media, snapping, adjacent-card scaling and image parallax. The 640–939px layout retains the reference's cropped 870px canvas. Reduced motion uses instant layout changes and removes mobile scaling/parallax. Keyboard navigation is immediate. Rendering stops when idle, offscreen or hidden; desktop images load near the section.

- `components/NewsSection.jsx`: composition, navigation, mobile scrolling, preferences and article previews.
- `data/home-news.mjs`: eight editable Georgian sample stories, images and collapsed-image focal offsets.
- `lib/news-carousel-layout.mjs`: reference geometry and easing.
- `lib/create-news-carousel.mjs`: interaction-driven canvas renderer.
- `app/news.css`: scoped source spacing, typography, colors and responsive treatment.

The carousel uses eight real Credo news photographs and announcement graphics, downloaded from Credo’s public media room and the supplied BM.ge article. Original available resolutions and source URLs are recorded in `public/assets/news/credo/sources.json`. Images keep their original colors and are served as local WebP assets without upscaling or AI retouching. Mobile uses a wide frame with contained artwork so logos and signage remain readable. The original source icons and Latin font are local, with the existing Georgian font as fallback. `public/assets/news/credo/sources.json` records the current asset URLs; the earlier Stripe source manifest is retained as reference. No assets are hotlinked at runtime. Georgian copy summarizes the matching Credo announcements; article previews link to the original Credo stories. Read-more actions open local article previews without adding routes.

In development, `/?newsMotion=reduce#news` previews the same reduced-motion branch used for the system preference. Final visual verification is recorded in `design-qa.md`.

## Current interactions

- Savings-version product actions navigate to the corresponding inline calculator. The new family card opens Credo’s official current-account information page.
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
