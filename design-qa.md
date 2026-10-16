# Bento reference pass

## Scope and visual truth

The user's Stripe screenshots and https://stripe.com/en-nl ground the arrangement, diffused backgrounds, portrait card, and centered globe crop. The latest user instruction supersedes the reference's top-row ratio: both top cards must be one-half. Credo branding, Georgian typography, existing product artwork, and existing interaction timing remain intentional differences.

Source captures: `ui-review/stripe-pass/stripe-reference-top.jpg`, `ui-review/stripe-pass/stripe-reference-bottom.jpg`. User sources: `/Users/tazo/Desktop/Screenshot 2026-10-13 at 18.09.23.png` and `/var/folders/t1/vtrr0wk120d4k6hptt8g44x80000gn/T/codex-clipboard-0fd6e875-89da-4c56-95de-95101fedf123.png`.

Implementation: `ui-review/stripe-pass/equal-top-grid.jpg`, `ui-review/stripe-pass/desktop-bottom.jpg`, `ui-review/stripe-pass/mobile.jpg`.

## Comparison conditions

Reference and implementation top/bottom views were opened together in the same comparison inputs at 1280×720 CSS pixels. Captures are 1280×720 pixels, effective density 1. Full-grid implementation is 1280×1027 pixels, captured at the same CSS width. The reference is taller; Credo retains more compact row heights and its established 1280px maximum homepage grid. These are intentional adaptations, not an assertion of pixel identity. Animated phases differ; comparisons assess framing and proportions. Separate focused top and bottom captures made controls, typography, and artwork readable.

## Findings and fixes

| Earlier finding | Fix and verification |
| --- | --- |
| P1: Globe shifted toward the right edge | Removed horizontal/vertical camera offset; centered sphere in the portrait slot with slight enlargement. Both sides and bottom crop through the card. |
| P1: Oversized lead card relative to companion | Latest instruction implemented as equal top columns; at 1280px both measure approximately 561×515px. Three lower cards remain equal thirds. |
| P2: Hard, saturated diagonal loan background | Replaced mask and diagonal bands with a broad white/coral/blue wash and existing slow drift. |
| P2: Payment stack clipped in its new slot | Reduced stack padding and upcoming-payment row spacing; hide the second panel on compact layouts. Desktop stack fits inside the card. |
| P2: Savings artwork undersized in the portrait row | Enlarged the ring and moved its summary below. Deposit feedback remains inside the card on hover. |
| P2: Portrait card approached multi-line headings at narrow desktop widths | Added a 440px minimum for lower cards, checked at 1001px. |

## Required fidelity surfaces

- **Fonts/typography:** Existing Georgian family, weights, heading hierarchy and wrapping retained. Product labels remain readable at desktop, tablet and phone widths. Source Latin type is an intentional brand/language difference.
- **Spacing/layout:** Equal top halves; lower thirds; 16px gaps. Loan phone retains its displayed size. Lower portrait slots fit the bank card and centered globe. Tablet uses two columns and a final centered globe banner; phones stack all five cards.
- **Colors/tokens:** Only Credo hues are used. New wash colors pass sRGB gamut checks. Existing globe palette, savings illustration, and bank-card face colors are preserved. Heading areas stay near white.
- **Image quality:** Existing portfolio video, supplied Credo logo/card assets, existing travel illustration and geographic globe data are reused. Bank card has portrait proportions and upright branding. No source artwork was substituted with unrelated placeholders. Code-rendered motion and gradients are the user's explicitly requested implementation medium.
- **Copy/content:** Credo product names and Georgian copy remain. The new second payment panel extends the existing illustrative eight-payment example; it is not a live financial calculation.

## Color treatment changes

| Before | After |
| --- | --- |
| Loan coral stops: `oklch(.692 .192 29.48)`, `oklch(.82 .08 29.48)`, glow `oklch(.9 .035 29.48)` | Diffused coral wash `oklch(.94 .028 29.48)` |
| Loan neutral bridge `oklch(.93 .003 29.48)` | Near-white bridge `oklch(.973 .009 29.48)` |
| Loan blue stops: `oklch(.85 .035 232.094)`, `oklch(.67 .08 232.094)`, `oklch(.508 .092 232.094)` | Soft blue wash `oklch(.88 .042 232.094)` |
| Split card used the generic pale background | Same diffused coral/blue wash as the loan card |

## Validation

- Rendered at 1280, 1001, 768, 390 and 320px widths; no horizontal overflow.
- Savings hover reaches 80% and its deposit feedback remains inside the card.
- Portrait bank-card pointer tilt activates and returns to flat rest.
- Globe WebGL renderer ready, routes and flags playing; motion and shader files unchanged.
- Loan video plays after refresh. News styles and animation files remain unchanged.
- New product button opens the prototype detail dialog and returns focus after closing.
- Browser console checked: no warnings or errors.
- Production build passes.

## Remaining notes

Reference animation phases and financial illustrations differ by design. No actionable P0/P1/P2 issues remain in the requested scope.

final result: passed

## Georgian typography consistency follow-up

The uppercase headings already contained Mtavruli code points, but browser CSS uppercasing could display them as Mkhedruli again. Setting `text-transform:none` restored the intended letterforms. Georgian CSS casing inconsistencies are also documented by [W3C](https://github.com/w3c/eurlreq/issues/30).

| Before | After |
| --- | --- |
| System Helvetica Neue was preferred for Georgian text | Bundled Noto Sans Georgian takes priority, limited to Georgian character ranges and the lari sign; Latin text retains its existing font stack |
| Headings, navigation, actions and tabs combined already-uppercase copy with CSS `uppercase` | Uppercase copy is rendered once in JSX; these selectors use CSS `text-transform:none` |
| Generated artwork hardcoded a different font stack | Artwork text uses `var(--font-ui)` |
| Legacy artwork CTA depended on CSS uppercasing | Its copy uses the same explicit uppercase conversion; artwork CSS casing is disabled |
| One loan-select option was uppercase while its sibling was normal case | Both form options use natural case |
| Navigation overlapped the logo by approximately 6px at 1280px | Right-aligned navigation at compact desktop widths, preserving room beside the logo |
| A long uppercase card heading exceeded its narrow phone text box | Mobile card headings scale from 18px to 20px; all five fit at 320px |

Verified visually in native Chrome and Safari. The main heading, bento titles and calculator controls display the intended uppercase forms; descriptions, news copy and form labels retain their intended natural case. Browser inspection found no remaining CSS uppercase transforms on the page's headings or controls. At 320px, all five product headings have zero horizontal text overflow. The 1280px page has no horizontal overflow and navigation clears the logo.

Evidence: `ui-review/typography/fixed-georgian.jpg` and `ui-review/typography/safari.jpg`. Production build passes after the final typography changes. Layout, brand colors and animation timing are preserved apart from the text-fit adjustments listed above.

Typography result: passed.

## Uniform bento heading size

| Before | After |
| --- | --- |
| Bento headings varied by row and viewport: up to 24px in the top row, 22px in the lower row, and 18–20px on mobile | All five headings use `font-size:18px`; row and responsive font-size overrides removed |
| Bento headings used `font-weight:600` | All five use `font-weight:500` (medium) |

Browser computed styles verified at 1280px and 320px: all five headings render at 18px / 500, with 21.6px line height. No heading or page horizontal overflow at 320px. Existing casing, colors, layout, artwork and animation rules are unchanged. Evidence: `ui-review/typography/bento-18-medium.jpg`.

## Stripe bento hover follow-up

Source: https://stripe.com/en-nl, inspected live on 2026-10-13. Scope is the card-container hover behavior; the accepted Credo 50/50 top row, equal lower thirds, 16px gaps, artwork, palette and typography remain the visual target for all other surfaces.

### Source evidence and measurements

- Source screenshots: `ui-review/bento-hover/stripe-rest.jpg`, `stripe-hover.jpg` (1280 × 720 CSS px, 1280 × 720 image px, 1×), and `stripe-mobile.jpg` (390 × 844, 1×).
- Public CSS and page code captured in `../../work/stripe-bento-hover/stripe.css` and `stripe-index.js` confirm the behavior and values.
- Fixed hit area. Clipped border and inner surface expand outward; the grid dimensions and artwork do not animate.
- Expansion and heading/control shifts: 800ms `cubic-bezier(.165,.84,.44,1)`. Lead payment card expands 4px vertically on each side; other cards expand 6px. Horizontal growth is vertical growth × width / height.
- Border color fades over 250ms linear. Pointer direction projects onto the perimeter, sampled at most once every 50ms. The gradient follows with a 1s `cubic-bezier(.16,1,.3,1)` transition and 50% opacity.
- Corner control background crossfades over 600ms `cubic-bezier(.16,1,.3,1)`. Source expansion-icon paths move diagonally by 2px on desktop, 1px below 940px with a fine pointer.
- Expansion and glow are enabled from 940px with a hover-capable fine pointer. Narrow/touch layouts keep their original geometry.

### Implementation and comparison

Implementation captures: `ui-review/bento-hover/credo-rest.jpg`, `credo-hover.jpg`, `credo-lower-hover.jpg` (1280 × 720, 1×), and `credo-mobile.jpg` (390 × 844, 1×). Source and implementation hover captures were opened together; `hover-comparison.jpg` also puts both complete captures side by side at native density. `corner-comparison.png` compares the actual source and implemented corner controls at 1×.

The full-view comparison confirms outward expansion, counter-moving heading/control, a thin perimeter glow, and stationary artwork. Focused comparison confirms the source SVG icon and diagonal path separation. Intentional differences are Credo coral/blue instead of Stripe purple/magenta, the existing 48px/44px control and 8px control radius, 16px container radius, the accepted grid proportions, Georgian copy, and 18px / 500 headings. The original 5% black edge is retained at rest, without adding container shadows.

### Required fidelity surfaces

| Surface | Result |
| --- | --- |
| Fonts and typography | Existing Noto Sans Georgian stack and uppercase handling preserved; all five headings remain 18px / 500 with 21.6px line height |
| Spacing and layout rhythm | Top cards remain 560.88 × 514.73px at 1280px; lower cards remain approximately 368.59 × 496.18px. Artwork bounds match the captured pre-change measurements. Grid gaps stay 16px |
| Colors and tokens | Only the new hover border/control use the existing Credo blue/coral tokens; existing washes remain unchanged; the default edge stays black at 5% |
| Image quality and assets | Existing video, globe, card and savings visuals remain in place. The new expansion icon uses the exact SVG path geometry captured from Stripe |
| Copy and content | All card titles, labels, and existing action destinations are preserved |

### Comparison history and findings

- [P2, resolved] The mobile loan card's full-size background initially covered its new underlying border. Inset the mobile background by 1px and restore a 15px inner radius. Re-captured and opened `credo-mobile.jpg`; the thin edge is visible and the original mobile title/artwork flow is intact.
- No actionable P0/P1/P2 findings remain in the requested hover scope. Existing brand, sizing and artwork differences from Stripe are intentional.

### Validation

- All five cards enter hover; the lead uses 4px vertical growth and all others use 6px. Heading and corner movements match the source measurements and easing.
- Moving between cards reverses the previous card's transition and fades its glow back to zero; no grid resizing occurs.
- Clicking a card body invokes its existing action. The native corner button remains the keyboard entry point.
- Split card body opens the existing detail dialog. Closing restores focus to the corner button; Enter opens it again.
- Globe pause/resume remains independent: pausing does not open the card action, and resume returns the globe to playing.
- Savings hover still shows 80% and advances its digit reels; the bank-card renderer remains ready. Globe motion, palette/shader files and news CSS were hash-checked unchanged.
- At 390px and 320px there is no horizontal page or heading overflow. All headings remain 18px / 500, and card growth is zero. Temporary viewport overrides were reset.
- Browser warnings/errors: none. Final production build passes.

final result: passed


## Credo secondary page tint

The visible background behind Stripe's bento is `#F8FAFD`, rendered by `.section-background.modular-solutions-bg::after` on https://stripe.com/en-nl. The enclosing section itself is white, so the visible backdrop layer was measured directly rather than inferring it from the section's background property.

| Before | After |
| --- | --- |
| Shared page/news background `--page:#fcfcfc` | `--page:oklch(0.984 0.004 232.094)` (approximately `#F7FAFC`) |

The new color matches the reference's OKLCH lightness of 0.984 while keeping the exact hue of Credo's secondary `#1E6E91` (232.094°), with chroma reduced to 0.004 for an almost-white surface. It is inside sRGB gamut. No other CSS declarations changed in this pass.

Computed WCAG contrast against the new background: #333 12.08:1, #666 5.49:1, Credo blue 5.43:1, news ink #061B31 16.60:1, and news muted #64748D 4.54:1. These existing text colors remain unchanged.

Live browser verification at 1280 × 720 confirms the page and news share the new token. Bento base/gradient colors, 18px / 500 headings, and the 800ms hover transition are unchanged. Stylesheet parsing passes. Screenshots: `ui-review/page-tint/stripe-reference.jpg`, `before.jpg`, and `after.jpg`. This single-token color change does not alter layout or responsive rules.

final result: passed

## Card ribbon background follow-up

Source visual truth: the user's `Screen Recording 2026-10-13 at 22.13.26.mov` (7.958s, 858 × 1444) and https://stripe.com/en-nl. Recording frames were inspected at approximately 1, 3, 5 and 7 seconds; the contact sheet is `ui-review/card-ribbon/recording-reference.jpg`. The live issuing-card capture is `ui-review/card-ribbon/stripe-reference.jpg` (1280 × 720 screenshot/CSS viewport). Public source inspected in `../../work/stripe-bento-hover/stripe-index.js` confirms a WebGL wave, separate card/window render targets, post-processing blur/grain, and pointer-driven card rotation.

The requested scope is the shaped background treatment behind Credo's existing card. Stripe carries its wave across its printed card face too; doing that for Credo would create a new card-face design. The existing Credo face, branding, black material, card dimensions, flat idle pose, shadow and tilt amplitudes are preserved in this pass.

### Implementation

- A curved diagonal ribbon with coral, blue and peach layers, feathered edges, two fine light crests and stationary fine grain. The heading area fades back to the existing near-white paper color.
- Slow ambient flow and a small, smoothed bend responding to the existing card pointer coordinates. No moving lighting was added to the printed card.
- The ribbon uses the existing card WebGL renderer, with no additional WebGL context or animation dependency. Idle background draws at up to 30fps; existing card tilt continues to settle at the display frame rate. Rendering pauses offscreen or when the document is hidden, and elapsed animation time freezes while paused.
- The fourth card's old background-pool drift is disabled because the new ribbon replaces it. Other bento backgrounds and motion rules are unchanged.
- A static SVG ribbon sits behind the original fallback card when WebGL cannot run. Its sRGB stops are exported from the same in-gamut OKLCH palette.

### Color changes, only for the fourth card's background

| Before | After |
| --- | --- |
| Coral pool `oklch(.964 .016 29.48)` ≈ `#FEEFED` | Ribbon coral `oklch(.87 .06 29.48)` ≈ `#F9C6BE`, feathered and mixed with paper |
| Blue pool `oklch(.967 .013 232.094)` ≈ `#ECF6FC` | Ribbon blue `oklch(.84 .055 232.094)` ≈ `#A7D2E9`, feathered and mixed with paper |
| Peach pool `oklch(.978 .009 29.48)` ≈ `#FEF6F4` | Ribbon peach `oklch(.955 .019 29.48)` ≈ `#FDECE9`, feathered and mixed with paper |

Paper remains `oklch(.993 .002 30)` ≈ `#FEFCFC`. The new stops retain the brand's coral/blue hues and are inside sRGB gamut. Interpolation is performed in OKLab inside the shader. Even the unmixed color stops contrast with #333 at 8.35:1 (coral), 7.82:1 (blue), and 11.02:1 (peach); the rendered heading area is much closer to paper (12.38:1).

### Visual comparison and fidelity

Implementation evidence: `ui-review/card-ribbon/desktop-rest.jpg`, `desktop-hover.jpg`, `ambient-later.jpg` (1280 × 720 screenshot/CSS viewport) and `mobile.jpg` (390 × 844). Source and implementation were opened together in one comparison input. `card-comparison.jpg` contains native-density component crops from both captures (source 396 × 673; implementation 372 × 500), with no size normalization because the existing shorter Credo bento proportions are intentional.

- Typography: existing Noto Sans Georgian stack, casing, 18px / 500 headings and line height unchanged; no text overflow at 390px or 320px.
- Layout rhythm: the existing grid proportions, 16px gaps, 16px container radius and 5% inset border remain. The desktop card remains approximately 368.59 × 496.18px. The new background fills the same card viewport.
- Colors/tokens: Credo coral/blue replace Stripe's pink/purple. Existing page tint and all other bento palettes remain unchanged. The heading stays clear against a near-white surface.
- Image quality/assets: original Credo emblem, wordmark, Mastercard artwork, front texture and shadow generation were checked unchanged against the saved baseline. Native shader rendering is sharp and has no missing texture or compile errors. The fallback SVG was rasterized and inspected separately.
- Copy/content: card title, labels, action and existing dialog copy remain unchanged.

The comparison confirms the requested flowing, textured ribbon form around the existing black card. Intentional differences from Stripe are the Credo palette, original card face, restrained existing tilt and accepted shorter card/container proportions. No actionable P0/P1/P2 findings remain in scope.

### Validation and comparison history

- Initial desktop and mobile visual captures were reviewed; source and implementation were then compared together at full view and component crop level. No implementation correction was needed after the visual comparison. The fallback's clearing mask was aligned with the same existing paper color.
- Final WebGL renderer reports ready; the background reports playing when visible and paused after scrolling offscreen. It resumes on returning without a time jump.
- Two resting captures show background motion without pointer input; a background-only strip changes by a mean 2.26 per 8-bit color channel between captures.
- Existing bento expansion/control hover still activates and the physical card pointer tilt returns to flat rest.
- The existing card dialog opens, Escape closes it, and focus returns to its corner control.
- At 390px and 320px there is no horizontal page or heading overflow. All five bento headings retain 18px / 500.
- Globe motion, palette/shaders, news CSS and shared bento-background CSS were hash/baseline checked unchanged. Card face, shadow and tilt amplitudes were also checked against the saved baseline.
- Final production build passes. Browser warnings/errors after shader compilation: none.
- Static fallback asset inspected; a real WebGL context-loss event was not forced. No claim of testing every GPU/device is made.

final result: passed

## Distinct Credo bento color treatments

User-approved scope: apply the proposed distinct background directions using the explicitly requested oklch-skill and better-colors skills. Only the loan, split-payment and savings background treatment is changed. Artwork sizes, grid, copy, heading styles, controls, card/globe/news and savings interactions remain unchanged.

Implementation: per-product OKLCH tokens in app/bento-background.css; native SVG masks for a curved coral loan sweep and rounded blue steps behind split-payment panels. Savings has a localized warm radial halo and a paper clearing layer behind the summary. Existing background keyframes, durations, delays and visibility pausing are preserved; no new animation loop, dependency or renderer is introduced.

Full Before/After palette table and accepted screenshots: ui-review/bento-treatment/colors.md. Source direction was established in ui-review/bento-direction/review.md from current Credo and live Stripe comparison captures. Intentional differences from Stripe are Credo hues, accepted artwork/typography and grid proportions, and the three bespoke background forms.

Validation:
- All new stops and sampled same-hue ramps are in sRGB gamut. Coral hue stays 29.48°, blue hue stays 232.094°. Initial savings halo chroma was reduced from .023 to .021 to fit sRGB before implementation.
- Existing heading clearing layer retains a conservative 11.52:1 / APCA Lc 92.3 against #333 with the deepest blue beneath its 94% paper veil. Deep blue is decorative behind opaque white panels and is not used directly behind text.
- [Resolved] First-pass savings caption background sample measured 4.38:1. Added a paper veil behind the summary; final nearby screenshot samples measure 4.63:1 for the caption and 4.68:1 for the target, APCA Lc 70.8 and 71.6. Existing text colors are preserved.
- Accepted desktop captures: top-row.jpg and lower-row.jpg, 1280 × 720. Tablet capture: tablet.jpg, 820 × 900. Mobile captures: mobile-top.jpg and mobile-savings.jpg, 390 × 844.
- Checked 320px and 390px: no horizontal page/heading overflow. At 820px the two-column layout and full-width globe remain intact. All headings remain 18px / 500, desktop sizes unchanged and grid gaps remain 16px.
- Savings hover still advances the digit reel. New background masks load and the original 18–24 second drift remains active. Loan video reload check confirms readyState 4, playing. Browser warnings/errors: none.
- Bank-card renderer/ribbon, savings animation CSS, globe motion/palette/shaders and news CSS were hash-checked unchanged against the start of this pass. Shared keyframe definitions and transfer/fourth-card background rules remain unchanged.
- Temporary viewport overrides reset. Final production build passed.

final result: passed

# Bank-card V3 flowing satin — 16 October 2026

## Scope and evidence

This pass changes only the background of `ბარათი ყოველდღიური ფინანსებისთვის`. The selected reference is the user's `/Users/tazo/Desktop/Screen Recording 2026-10-13 at 22.13.26.mov`, checked frame by frame in `../../work/card-ribbon/recording-2026-10-16.jpg`, and the live issuing bento at https://stripe.com/en-nl. The live reference was captured with the in-app browser as `../../work/card-ribbon-flow/stripe-live.png` and `../../work/card-ribbon-flow/stripe-narrow-final.png`.

Implementation: http://localhost:3010/?cardRibbon=flow#bank-card. Browser-rendered evidence: `../../work/card-ribbon-flow/final-desktop-0.png`, `final-desktop-1.png`, `final-narrow.png`, and `final-phone.png`. The customer-facing screenshot is `../card-ribbon-flow/homepage-v3.png`.

Full comparison input, opened and reviewed: `../card-ribbon-flow/stripe-credo-comparison.png`. This places source and implementation captures at their native 615×763 CSS/pixel viewport side by side (1230×763 combined, effective screenshot density 1). No stretching or density resampling. Both cards are idle; animated phases differ. Source and implementation have intentionally different existing card aspect ratios and artwork. This is a scoped background-treatment comparison, not a claim of pixel identity or a replacement of Credo's opaque card face with Stripe's transparent printed-card treatment. The card and field are large enough in the comparison for the focused background inspection; an additional enlarged region was unnecessary.

Desktop captures are 1280×900 CSS/pixels, final default desktop 1280×720, phone 390×844, effective screenshot density 1. The existing compact row height, 16px grid gaps, white heading area, Credo branding and Georgian copy are retained.

## Findings, fixes, and comparison history

| Earlier finding | Fix and post-fix evidence |
| --- | --- |
| P2: V2 mainly bends in place, with too little visible travel | V3 has independent travelling bends and rolls, plus advected sheet fibers. The phase is `.42 × elapsed seconds`; the existing renderer cadence is retained. Desktop frame pair shows visible background change while the card remains at rest. The exposed left background region changed by a mean 2.53 RGB levels; 25.2% of sampled channels changed by more than 3 levels. |
| P2: First V3 pass still had a straight, narrow white cut | Added a quadratic sheet curve and larger, slower bends; widened the crest, lowered its narrow highlight strength, and increased its soft shoulder. `final-desktop-0.png`, `final-narrow.png`, `final-phone.png` and the combined comparison show the repaired, feathered fold. |
| P2: Pale blue lacked tonal depth around the fold | Added a localized deeper secondary-blue shade, used at a maximum 17% blend weight. The existing four colors are unchanged; the heading area remains clear. All five palette endpoints were numerically checked inside sRGB gamut. |

## Required fidelity surfaces

- Fonts/typography: browser-computed Georgian family, 18px / 500 / 21.6px line height; unchanged from the accepted homepage. Heading fits on desktop, narrow and phone layouts. Stripe's Latin type is an intentional product difference.
- Spacing/layout: no grid, card, camera, physical-card or shadow geometry changes. No horizontal document overflow at 615px or 390px. The artwork fits in the full phone capture. Card camera, tilt, lighting, shadow and lifecycle source were compared to HEAD with only the expected version-selection changes permitted.
- Colors/tokens: original paper `[.993,.002,30]`, coral `[.87,.06,29.48]`, blue `[.84,.055,232.094]`, peach `[.955,.019,29.48]` unchanged. New blue fold `[.71,.075,232.094]`. Field blends in OKLab, uses the same Credo hues, and keeps white above. No purple introduced.
- Image quality: the requested background is a live procedural GPU shader. Fine fibers follow the field, with static dither rather than moving grain. Credo's real logo/card composition is untouched. The static fallback was rendered from V3's time-zero field math at 800×1200; no new artwork replaces existing assets.
- Copy/content: no copy, labels, product actions, or surrounding section content changes.

## Validation and limits

- Production build passed using the isolated build-check directory, without interrupting the local preview.
- Browser WebGL rendering was ready and playing on desktop, narrow and phone layouts. Browser warnings/errors: none.
- Offscreen scroll check changed the background state to `paused`; returning to the card resumed playback. Temporary viewport override reset and the live V3 homepage left open.
- V1/V2 files, savings, globe, shared top-pair shader component, news component and news CSS passed preservation hashes. Saved V1/V2 checksum entries remain unchanged; V3 has its own entry.
- No new dependency, renderer, route, or React frame-by-frame state updates. Existing ambient 30fps / settling 60fps, visibility handling, and disposal behavior retained.
- Static fallback appearance is generated and source-checked; an unavailable-WebGL browser was not forced. Physical-device frame rates and Safari were not tested. No reduced-motion work was added, following the user's standing instruction.

Implementation checklist: travelling folds implemented; overly narrow crest repaired; brand gamut checked; browser comparisons reviewed; phone fit checked; old variants preserved; production build passed.

final result: passed

# Savings V2 destination goal — 16 October 2026

## Scope and selected direction

The user approved replacing the weak suitcase/ring composition with one convincing savings-goal panel, real destination photography, a slim progress indicator, a quiet secondary-blue field, and a single deposit animation. All other bento cards and news were to remain unchanged.

Reference context: live Stripe billing bento captured during the preceding review in `../savings-review/stripe-reference.png`, and its side-by-side comparison with the original Credo card in `../savings-review/comparison.png`. Selected static composition, established and browser-captured before adding motion: `../savings-panel/static-direction.png`.

Implementation: http://localhost:3010/?savings=photo#savings. Original preserved at http://localhost:3010/?savings=original#savings.

## Evidence and comparison

- Static target capture: 1280×720 CSS/pixels, containing a 416×560 card at x432/y80.
- Live desktop capture: `../savings-panel/homepage-1440.png`, 1440×900 CSS/pixels, containing the 416×560 savings card at x80/y0.
- Both exact card regions were cropped without resizing and opened together in `../savings-panel/static-live-comparison.png` (848×560 including a 16px gap). Effective screenshot density is 1 for both inputs. This is an idle-state comparison at ₾7,500 / 75%.
- The card-region comparison makes typography, spacing, photograph crop, progress, radii and edges directly readable; a further enlarged region was unnecessary. Outer title ink and the existing expand action intentionally follow the accepted homepage rather than the study's standalone frame defaults.
- Full bento context: `../savings-panel/homepage-rest-1280.png` and `homepage-1440.png`. Completed deposit state: `../savings-panel/homepage-hover-1280.png`.
- Responsive evidence: `phone-390.png` (390×844), `width-320.png` (320×844), `width-615.png` (615×900), `width-820.png` (820×900). These are browser-rendered captures; all were inspected.
- Final preview: `../savings-panel/final-homepage.png` (615×763, default in-app viewport). Focused final card: `../savings-panel/final-card.png` (567×490, unscaled crop).

## Findings and required fidelity surfaces

No actionable P0/P1/P2 mismatch remains against the selected static composition.

| Surface | Evidence and conclusion |
| --- | --- |
| Typography | Outer heading remains Georgian 18px / 500. The goal name, balance, target and percent form one hierarchy within the panel. Main balance uses 36px tabular numerals, 32px in the compact panel; source/live crop comparison confirms aligned baselines and clean numeral clipping. |
| Spacing/layout rhythm | Desktop retains the original grid and outer-card dimensions. At 1440px, the panel is 336×353.8px and starts about 146px below the top of the outer card. The photo/body panel closely matches the static target. V2 alone reserves 490px on mobile, or 450px below 360px, to keep all content clear of the heading and inside the card; V1 mobile dimensions remain unchanged. |
| Colors/tokens | Quiet near-white secondary-hue paper and localized blue light replace the warm halo. The complete Before/After palette is in `components/savings-versions/README.md`. All new endpoints are in sRGB gamut. Main ink on white is 10.53:1, supporting ink 5.71:1. Text is on white, not on the photograph or halo. |
| Image quality | Real photograph of Positano by Kevin McMahon, sourced from the verified free Unsplash page. Local 1440×960 WebP, no upscaling, AI generation, recoloring or retouching. Crop at 50% / 58% preserves architecture, coast and sea. Source/live visual comparison confirms the same photograph and crop. |
| Copy/content | Goal name is `იტალიაში მოგზაურობა`; initial balance ₾7,500, target ₾10,000, progress 75%. The hover adds +₾500 and settles at ₾8,000 / 80%. No placeholder buttons or unrelated content added. The entire visual is a labeled illustrative image; nested display elements are hidden from assistive technology. |

The initial implementation's mobile height was increased from 470px to 490px before the responsive capture pass to reserve adequate panel clearance. Final measured heading/bottom clearance was 39.8/44.6px at 320px, 34.1/38.9px at 390px, 66.5/28.1px at 615px and 28.3/27.1px at 820px. All panel bounds remained inside their outer card, with no horizontal document overflow. No image or target text was clipped.

## Motion, functional checks and preservation

- Fine-pointer hover: receipt arrives first; digit reels and progress then settle together. The final computed progress transform was `matrix(0.8, 0, 0, 1, 0, 0)`, both digit reels translated -36px, added-percent opacity 1, receipt opacity 1. Captured values are visibly ₾8,000 / 80%.
- Leaving and rapid entry/exit reversals return to scaleX(.75), untransformed reels and receipt opacity 0. The photo and panel stay stationary; only the existing outer bento hover expansion remains. All new motion is interruptible CSS transform/opacity transitions.
- The existing expand button still selects the deposit calculator. `#calculator-tab-1` was verified `aria-selected=true`, with browser screenshot evidence in `../savings-panel/deposit-calculator-action.png`.
- Original URL was browser-checked: one original `.savings-goal`, no V2 visual, original background displayed. Source and CSS snapshots are byte-identical to the original component and stylesheet. Original background CSS is unchanged.
- Bank-card component, renderer, V3 ribbon, shared top-pair component, globe, news and bank-card CSS passed preservation hashes. Shared global CSS only adds the V2 stylesheet import; ProductCard only adds the savings anchor. Original styles now load through the preserved V1 file, in the same import order.
- Production build passed using the isolated build-check app. Browser warnings/errors: none. The temporary study server was stopped, temporary study/original tabs closed, viewport override reset, and the live V2 homepage left open.
- No new dependency, route, shader or animation loop. No reduced-motion work added, following the user's standing request. Safari and physical-device frame rates were not tested; desktop viewport overrides do not emulate real touch hardware.

Implementation checklist: real photograph sourced and credited; static composition compared to live; coordinated deposit transition tested; phone/tablet fit verified; calculator action verified; original version preserved; production build passed.

final result: passed

# Savings V3 composition balance — 16 October 2026

User-requested scope: reduce the new photo panel's visual weight relative to the bank-card and globe in the same row. Other cards remain unchanged. V1/V2 and the source photograph are frozen and preserved.

Implementation: homepage default, also http://localhost:3010/?savings=balanced#savings. Saved photo-header V2 remains http://localhost:3010/?savings=photo#savings.

| Before | After |
| --- | --- |
| Full-width photo header, about 320×164px at the 1280px comparison viewport | 72×72px destination thumbnail (about 90% less photographic area), with static CSS saturation .8 / contrast .92 and a 10% pale blue veil. The source photo bytes are unchanged. |
| Photo leads a tall panel | Compact white goal panel, at most 320px wide, 24px padding, goal label beside the thumbnail, clear balance/progress hierarchy and 12px supporting labels. |
| Stronger blue wash and panel shadow | Lighter, less chromatic localized blue wash and reduced contact shadow, with the existing 5% neutral edge. |
| Receipt attached to photo header | Receipt sits at the goal panel's upper-right edge, clear of the name and metrics. V2 deposit timings and easing are identical. |
| V2 mobile height 490px / 450px | V3 uses 440px mobile height and a 60px thumbnail / 20px panel padding / 32px balance at compact container sizes. V2 keeps its original sizes. |

Visual evidence under `../savings-balance/`: `before-row.png`, `after-row.png`, `hover-row.png`, `final-row.png`, `mobile-390.png`, `mobile-320.png` and `tablet-820.png`. The whole desktop row was assessed at 1280×720; mobile layouts at 320×740 and 390×844; tablet at 820×900. Photo thumbnail, name, balance, target and receipt fit. No horizontal document overflow was observed. The outer heading remains 18px / 500.

Fine-pointer hover reaches receipt opacity 1, progress scaleX(.8), both digit reels translateY(-36px), and 80% opacity 1. Exit returns the receipt to opacity 0 and progress to .75. No autoplay, timer, frame loop, new renderer or reduced-motion changes were added. Browser warnings/errors: none.

The production build passed in the isolated build-check directory. All V1/V2 checksums, the real photo checksum, and the preserved bank-card/renderer/ribbon/shared top-pair/globe/news hashes passed. V3 has separate snapshot entries. The default route and explicit `photo` route were browser-checked. The local server remains running and the normal in-app viewport is restored.

# Savings V4 interactive particles — 16 October 2026

User-approved scope: build V4 with interactive dots in Credo colors, preserve the current savings panel and deposit animation, keep V3 available, and leave every other card unchanged.

Homepage default and explicit route: http://localhost:3010/?savings=particles#savings. Preserved V3: http://localhost:3010/?savings=balanced#savings. V1/V2 URLs remain unchanged.

Reference: the current live Stripe agentic-commerce card was inspected at rest, center hover and exposed-edge hover before implementation. Evidence is in `../stripe-particle-study/01-idle.png`, `02-center-hover.png`, `03-edge-hover.png` and `study.json`. Its public shader/source showed a transparent Three.js cloud with radial noise, varied dot size/alpha and smoothed local pointer gathering. The implementation is independently written and uses the established Credo palette rather than Stripe's pink/purple colors.

| Before | After |
| --- | --- |
| V3 static blue wash | V4's faint blue/coral halo and fine blue/coral/neutral GPU dots. Every background color endpoint is listed in `components/savings-versions/README.md`. |
| No background pointer response | Local particle gathering with smoothed position/strength and gradual release; quiet ongoing noise drift. |
| V3 selected by default | V4 selected by default; V3 remains a frozen URL-selectable snapshot. |

Panel preservation: V4 composes the immutable V3 component and its original stylesheet. A browser comparison at 1280×900 found identical computed width, height, padding, margins, radii, shadows, colors, typography, transforms, transitions and opacity for the panel and every descendant. The panel is 320×264px in both versions. Image attribute values match; SSR versus client creation changes only attribute serialization order. All V3 JSX/CSS checksums passed, as did V1/V2 and the real photograph checksum.

Visual checks: `../savings-particles/reference-comparison.png` places the Stripe and Credo captures together at the same 1280×900 viewport and resting state, without rescaling. Source cards are taller by design; existing Credo geometry is preserved. The Credo halo is intentionally quieter to sit beside the existing subtle globe. Heading space remains clear, the white panel covers the dots behind its content, and the bank card keeps its established visual weight. Final whole-row proof is `final-row.png`, cropped without resizing from `final-viewport.png`. Earlier captures are `desktop-idle.png` and `desktop-hover.png`.

Interaction checks: fine-pointer hover reports strength 1.00 and activates the localized dot response. The preserved deposit sequence reaches receipt opacity 1, fill scaleX(.8), digit reels translateY(-36px), and 80% opacity 1. Exit restores pointer strength 0.00, receipt opacity 0 and fill .75. The existing savings action selects the deposit calculator (`aria-selected=true`); proof is `calculator-action.png`. After scrolling away, the renderer reported `offscreen` and its diagnostic clock remained frozen at 72.03 across separate observations, then resumed when brought back.

Responsive checks: 320×740 and 390×844 viewport captures (`mobile-320.png`, `mobile-390.png`) show the unchanged compact panel fitting without horizontal document overflow. A development-only forced static fallback rendered the same dot composition with Canvas (`static-fallback.png`). Normal homepage navigation returned to WebGL and V4. The in-app viewport override was reset before handoff.

Implementation: one GPU point draw, 5,600 seeded points (3,400 for an initial mount below 300px wide), DPR cap 1.75, 30fps idle / 60fps pointer targets. These are configured targets, not physical-device performance measurements. No React state updates per frame. Intersection/document visibility suspension and complete cleanup are included. Canvas fallback also handles context loss; forced fallback was tested, actual hardware context loss was not induced. No new dependencies or reduced-motion changes.

The full isolated production build passed, browser warnings/errors were empty, renderer syntax and diff checks passed. Bank-card component, renderer and V3 ribbon; shared top-pair component; globe component; news component; and card CSS passed the existing preservation manifest. This pass changed only new V4 files, savings selection/imports and version/QA documentation. The local server remains running.

# Savings V5 Credo emblem particles — 16 October 2026

User-requested scope: make V4's particles substantially more present, give them clearer movement, and use the Credo logo shape instead of a circular distribution. V4 and earlier designs remain saved; the savings panel and other cards remain unchanged.

Homepage default and explicit URL: http://localhost:3010/?savings=logo#savings. Previous V4: http://localhost:3010/?savings=particles#savings. V3 remains http://localhost:3010/?savings=balanced#savings.

The particle shape is sampled from the exact Credo emblem already used by the homepage header (`public/assets/2d290.svg`). The copied SVG was verified byte-identical. A 512px role mask rasterizes its original paths unchanged, with channel labels for both arrows and the central disc. Runtime sampling weights the two arrows more heavily. The geometry source, mask and provenance manifest have their own snapshot checksums. No logo was hand-drawn or generated.

| Before | After |
| --- | --- |
| Very faint circular field | Emblem-shaped field with 9,000 points (5,400 on an initial narrow mount), stronger arrow opacity, slightly larger dots and a higher share of the existing primary blue/coral endpoints |
| Random blue/coral accents | Blue first arrow and coral second arrow; a quieter blue/neutral central disc. Original header/card logo colors remain unchanged. |
| Slow, small drift | Faster coherent flow, independent drift and a breathing cycle; most points retain the silhouette while a loose subset wanders farther |
| 30fps idle target | 60fps visible-render target, with the same offscreen and document-visibility suspension |
| V4 homepage default | V5 homepage default; V4 and V1–V3 URLs and source checksums preserved |

Framing limit: the oversized emblem is partly clipped by the outer card and its center is occluded by the existing opaque savings panel. It is a background treatment; the complete logo is not visible simultaneously. Heading space stays clear. The panel, source photo, all typography, progress bar, shadow, responsive layout and deposit transitions are composed from the same frozen V3 component/styles. No unrelated card or news changes were made.

Visual evidence in `../savings-logo-particles/`: desktop idle, mobile 390, narrow hover, static fallback, V4 preserved, V4/V5 comparison and final viewport/row/normal-preview captures. `v4-v5-comparison.png` uses unscaled matching 368×496 card crops from 1280×900 captures. It shows the increase in visible particle density and color. The existing Stripe reference remains in `../stripe-particle-study/`.

Browser checks: WebGL reports ready with shape `credo-emblem`; no warnings/errors were observed. A fresh 320px-wide load selected 5,400 particles and fitted the 236×240px compact panel without horizontal overflow. The 390px viewport also fitted. Fine-pointer tracking activated the logo gathering; settled hover reached fill scaleX(.8), receipt opacity 1 and 80% opacity 1, with smoothed particle strength .90 in the recorded sample. The frozen deposit sequence retains the same exit behavior. A forced development Canvas fallback rendered the emblem correctly. Switching to V4 removed V5 and restored the original 5,600-point circular cloud. The default route returned to V5.

The full isolated production build, renderer syntax, diff checks, copied-SVG comparison and all saved-version checksum checks passed. The existing bank-card/renderer/ribbon/shared top-pair/globe/news preservation manifest passed. No new dependencies or reduced-motion changes. The 60fps setting is a configured target; physical-device performance and actual hardware context loss were not tested. Local server left running; normal in-app viewport restored for handoff.

# V6 · Credo family particle emblem — 16 October 2026

User-approved scope: replace the savings composition with „გახდი კრედოს ოჯახის წევრი“, show the complete particle emblem, give it gentle idle motion and local scatter/return on hover, preserve V1–V5 and leave other cards unchanged.

Default and explicit route: http://localhost:3010/?savings=family#credo-family. Previous V5 remains http://localhost:3010/?savings=logo#savings. All earlier savings parameters remain supported. The existing outer `#savings` anchor is retained; the family version adds an internal `#credo-family` anchor.

| Before | After |
| --- | --- |
| Foreground savings panel hides the emblem center | Full emblem fits the card with 40% of particles assigned to its shaded center |
| Oversized cropped arrows | Complete silhouette bounded by 80% width and the available height below the heading |
| Savings action | Official current-account information page; earlier savings versions still select the deposit calculator |
| Pointer gathers | Small localized repulsion, eased release and gentle coherent idle flow |

Desktop visual check at 1280×900: the outer card is 368.59×496.17px, with unchanged 18px medium heading and row geometry. The full emblem is below the heading and balances with the original bank-card artwork and globe. Evidence in `../credo-family/01-desktop-idle.png` and `02-desktop-hover.png` was captured at 12,000 points; the later `06-final-viewport.png` retains 7,200 points after resizing from mobile (counts are selected on initial mount). The final row proof crops the original 12,000-point desktop capture without rescaling.

Interaction: hover reports `particlesPointer=active` and settled strength 1.00. Moving outside returns `idle` and 0.00. The new action was clicked and the in-app browser reached https://credobank.ge/products/current-account with the visible official current-account title and content. No form was submitted. The saved V5 route restored its old heading and full savings panel; its expand action selected `#calculator-tab-1` with `aria-selected=true`.

Responsive: 390×844 and 320×740 captures show the entire emblem and clear heading with no horizontal document overflow. At a fresh 320px mount, WebGL selected 7,200 points. A forced static Canvas fallback also displayed the complete logo. Evidence: `03-mobile-390.png`, `04-mobile-320-static.png`, `05-mobile-320-live.png`. Actual hardware context loss and physical-device performance were not tested.

Validation: the isolated full production build, renderer syntax, diff check, all V1–V5 snapshot hashes and the existing other-card/news preservation manifest passed. Local-preview browser logs had no warnings/errors; the two locale warnings recorded during the official destination visit came from credobank.ge. No new dependencies or reduced-motion changes. The server remains running.

Handoff: the temporary viewport override was reset. After the original browser tab became unavailable, a fresh in-app tab opened the V6 route at the normal 615×763 size, with 12,000 points and WebGL playing. It was marked as the deliverable. `07-normal-preview.png` shows the complete emblem and clear single-line heading at that size.

# V7 · Subtle family background wash — 16 October 2026

Requested scope: give the approved family particle card a very light gradient for depth. V7 composes the frozen V6 component/renderer and adds only separately scoped CSS background treatment. It is the homepage default and available at `/?savings=family-soft#credo-family`; V6 remains at `/?savings=family#credo-family`.

| Before | After |
| --- | --- |
| Uniform near-white paper and localized center halo | White heading area, pale secondary-blue paper toward the base, broad blue lower-left light and subtle coral lower-right warmth |
| Halo in the central area | Gradient mask keeps the top 22% clear and smoothly reveals the wash by 60%; the particles are not masked |
| V6 default | V7 default, with the exact V6 background still selectable |

The complete color/property diff is listed in `components/savings-versions/README.md`. New OKLCH endpoints retain Credo hue angles 232.094 and 29.48. Linear-sRGB conversion confirms all are in gamut. No particle color, geometry, size, opacity, motion or pointer changes. No new blur, rendering loop, package, shadow or reduced-motion handling.

Visual evidence in `../credo-family-v7/`: `02-desktop-row.png` at 1280×900, its unscaled `final-row.png` crop, and `03-mobile.png` at 390×844. The soft wash is present below the emblem with clear white heading space; original bank-card and globe treatments remain alongside it. There is no horizontal document overflow. The default URL renders V7; the explicit V6 URL renders no V7 wrapper and restores its original uniform paper/halo. WebGL continues playing with 12,000 points, and local browser warnings/errors are empty. The temporary viewport override was reset and the preview tab marked as the deliverable.

Saved V1–V6 component/style/renderer/assets passed their snapshot checksums; the bank-card/shared top-pair/globe/news preservation manifest passed. The isolated production build passed after the final CSS adjustment. No tests were added for this reversible visual change.

# V8 · Airy family particles — 16 October 2026

Requested scope: spread the family emblem’s particles more loosely while retaining readability, the approved subtle background and all other cards. V8 is the default and available at `/?savings=family-airy#credo-family`; V7 stays at `/?savings=family-soft#credo-family`.

The independent renderer keeps 65% of points close to the emblem, while a seeded 35% subset progressively spreads in random directions into a soft halo. Scatter gently breathes over about 14 seconds; loose points have broader drift and lower opacity. An 18px side fade prevents hard cutoffs. The local pointer influence is slightly wider and stronger, with the same smoothed return. Complete numerical differences are in `components/savings-versions/README.md`.

The V7 gradient colors and mask were verified identical by source-value comparison. The actual emblem mask, 12,000 / 7,200 counts, point sizes, role mix, brand endpoints, core shading, title, action, card dimensions and renderer lifecycle remain. No new packages, React frame updates, blur or reduced-motion handling.

Visual evidence in `../credo-family-v8/`: normal-width capture, desktop idle/hover at 1280×900, narrow live/static captures at 320×740 and an unscaled final row crop. At desktop the card remains 368.59×496.17px; at 320px it is 272×440px with no horizontal overflow. The emblem remains readable and the outer dust feathers into the unchanged wash. Browser hover reached `active` / 1.00 and exit returned `idle` / 0.00. Fresh mobile WebGL and forced Canvas fallback both rendered 7,200 particles without warnings/errors. Actual hardware context loss and physical-device frame rates were not tested.

The isolated full production build, renderer syntax, diff check, V1–V7 snapshot hashes and other-card/news preservation manifest passed. The local server remains running. Temporary viewport testing was reset before handoff.

# Closer transfer-globe framing — 16 October 2026

Requested scope: bring the existing globe closer to match Stripe’s larger, cropped bento composition. Only the globe’s existing framing variables in `app/globals.css` change; renderer, route timing, labels, point colors, density, pause control and all other cards remain untouched.

| Before | After |
| --- | --- |
| `--globe-frame-zoom:1.08` | `1.48`, approximately 37% larger |
| X/Y framing offsets `0` / `0` | `.06` / `.03`, a slight right/down offset that emphasizes the right/bottom crop |

The live Stripe page’s crypto card was measured at 396.66×670.36px in a 1280×900 viewport. After the in-app connection recovered, the live reference was inspected at `https://stripe.com/en-nl#bento-card-title-crypto` and captured in `../globe-close-framing/02-stripe-reference.png`. Its canvas is 443.76×722.36px and extends beyond the card. The visible hemisphere is substantially wider than its card, with its upper edge around the first quarter of the height; the enlarged Credo framing follows that crop within the existing shorter card. The temporary reference tab was closed. No alternate browser method was used.

Geometry verification used the real Three.js camera, GLOBE constants and framing/view-offset path against a sampled sphere. At 369×496 the projected globe bounds are approximately x −81…494 / y 120…697, producing the intended close edge crop with title space above. At 272×440 the bounds are x −102…407 / y 107…618; at 567×763, x −124…759 / y 185…1072. The wide 758×480 tablet card crops the bottom while retaining the globe’s sides. These are projection checks, not rendered screenshots; land drift and route arcs can extend beyond the sampled sphere.

Visual checks completed after recovery: `../globe-close-framing/01-desktop.png` shows the full lower row at 1280×900, and `03-mobile.png` shows the complete 272×440px card at 320×740. Headings stay clear, the globe naturally extends beyond the sides/bottom, and flags remain attached to their animated routes. The renderer reports WebGL ready with the original 17,877 points. Pause reported `paused` and resume returned to `playing`. There is no horizontal overflow or local browser warning/error. The temporary viewport override was reset and the local tab marked as the deliverable.

`git diff --check` and the saved card/source preservation checks passed. No tests, animation changes, reduced-motion work or new dependencies were added for this CSS-only framing adjustment. The dev server remains running.

# Transfer-globe grain, depth and DialKit — 16 October 2026

The earlier enlargement exposed a point-sprite mismatch: the camera enlarged the sphere and routes, while particle sizes stayed fixed. The latest renderer multiplies particle size by camera zoom, uses the reference's `.12` desktop / `.14` compact base sizes and `.7–1` opacity variation, and keeps the established size variation. Compact rendering samples 30,000 sphere candidates (8,924 land points), versus 60,000 desktop candidates (17,877 land points). The formerly neutral point midpoint now uses Credo's soft blue. A screen-oriented white-to-brand-blue sphere shader and faint blue rim add depth. Outward particles use per-launch eligibility/variation rather than the same tiny subset on every cycle. Credo endpoints, flags and route timing remain.

The live Stripe crypto card and its public shader source were inspected through the in-app browser. Reference evidence and the corrected desktop/mobile renders are in `../globe-particle-polish/`. That pass changed the close framing from `1.48` / X `.06` / Y `.03` to `1.36` / X `0` / Y `.07`. The user subsequently requested direct zoom controls; no further guessed default framing was applied.

DialKit 2.0.0 and its Motion 14.3.0 React peer are pinned. `/?globeControls=1#transfer-globe` lazy loads a draggable, body-portalled panel with Zoom (`.65–1.8`, step `.01`), Vertical (`−20–25`, step `.5`, percentages of canvas height), Reset framing, built-in versions and copy. Edits update the current camera and point projection uniform; they do not resize the drawing buffer, rebuild scene resources or restart time. The React portal boundary stops panel clicks from invoking the product action. Values/versions are saved locally in this browser and apply only on the query-enabled authoring view; the ordinary homepage retains its code defaults.

Interaction verification in the in-app browser: dragging Zoom changed the engine's reported zoom to `.97` while WebGL stayed ready and animation time advanced; numeric entry applied `1.08`. Keyboard Vertical changed the offset from `.070` to `.065`. Reset restored `1.36` / `.070`. Version 1 retained that baseline; Version 2 was saved at `1.08` / `.070`. Reload restored Version 2 and its camera framing. Selecting Version 1 restored `1.36`; selecting Version 2 restored `1.08`. No product dialog opened during these controls. This comparison is browser-local, not a new frozen source snapshot.

Handoff proof: `../globe-dialkit/02-normal-preview.png` shows the real globe and panel at the normal 615×763 viewport. The selected editable Version 2 reads Zoom `1.07`, Vertical `8.0` in this final capture. The temporary viewport override was reset and the tab marked as the deliverable. Desktop controls also fit within 1280×900 without horizontal overflow; local console warnings/errors were empty. Point count is selected at mount, so the final narrow viewport retains its desktop 17,877 points after responsive testing.

The isolated full production build, renderer syntax and diff checks passed. All V1–V8 savings snapshot checksums and the separate manifest covering other card components/renderers, shared shader, page composition, global styles and news passed. No reduced-motion behavior was changed. WebGL point/surface shaders compiled without warnings/errors in the earlier desktop and 320px visual checks. Canvas fallback follows camera framing but does not reproduce the new sphere shading; physical-device frame rates and hardware context loss remain untested.
