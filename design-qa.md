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
