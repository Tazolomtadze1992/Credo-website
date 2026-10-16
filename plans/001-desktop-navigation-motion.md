# 001 — Make desktop navigation transitions continuous

- Commit: deb20d9 (working tree includes the approved navigation/category changes)
- Severity: HIGH
- Categories: interruptibility; cohesion; purpose/frequency
- Scope: components/SiteHeader.jsx, a desktop motion hook, app/navigation.css

## Recon
Next16.3.6/React19.3, Radix Navigation Menu and Dialog, Motion14.3 for mobile only. Desktop timing lives in app/navigation.css. This is a refined banking marketing navigation: hover switching is frequent, keyboard actions require immediate response, and the page/background must read as one shared frame. Preserve 14px/500 labels and names-only menus.

## Findings
| Location | Before | After | Why |
| --- | --- | --- | --- |
| app/navigation.css:36–42,159–164 | Restarting reveal/slide keyframes on frequently reversed states | Persist the viewport and panels, use CSS transitions from current transforms/opacity | An interrupted exit must not restart at full opacity or reset translation |
| components/SiteHeader.jsx:154; app/navigation.css:36 | First-open height measurement and reveal animate together | Measure the selected panel before paint; snap height on a fully closed first-open, animate height only for switching/reversal | Avoid double entrance and clipping the first content rows |
| components/SiteHeader.jsx:125–132 | Scroll unlocked immediately when logical value clears | Keep the lock until the visible exit finishes | Avoid page shift underneath the closing menu |
| components/SiteHeader.jsx:139 | Pointer and keyboard share animation | Keyboard input selects/dismisses instantly | Direct keyboard response follows the animations.dev frequency rule |

## Target values
Keep the captured Stripe choreography for switching: opacity 250ms and transform500ms, cubic-bezier(.4,0,.2,1), ±20% travel; viewport resize300ms cubic-bezier(.45,.05,.55,.95). The500ms exception is deliberate for this 1262px-wide source-matched panel. Open clip reveal200ms, source curve; close clip/opacity180ms cubic-bezier(.23,1,.32,1), no bounce. Height is an allowed isolated absolute viewport exception; never scale the text. Keep static 5px backdrop blur and animate only its opacity. No per-item stagger or React state per frame. Existing chevron and inline-arrow transitions are already interruptible and correctly anchored.

## Steps
1. Use controlled Radix values and force-mounted viewport/panels, preserving Radix trigger/link/focus semantics.
2. Add desktop-only visual phase, last-visible value, pointer/keyboard modality and measured height; all inactive panels must be inert and aria-hidden.
3. Replace desktop keyframes with state-based transitions. Keep outgoing content present until fully faded. Closing/reopening and direction reversals retarget from the current CSS values.
4. Keep root Escape focus return correct with force-mounted content. Preserve hover grace and the full-width shared hit region.
5. Review against the live Stripe menu and supplied recording. Verify open/close, rapid forward/backward reversal, short/tall resize, diagonal entry, keyboard and inactive focus handling.

## Eight-category audit coverage
Purpose/frequency: keyboard defect above. Easing/duration: captured wide source timings intentional; no invented bounce. Physicality/origin: clip anchored to top, no text scaling; correct chevron origins. Interruptibility: keyframe defect above. Performance: fixed-width absolute viewport height is isolated; content transform/opacity composite; no per-frame parent variables. Accessibility: inactive focus/inert and hover gating checked; reduced motion explicitly deferred by user. Cohesion: first-open double entrance/scroll unlock defects above. Missed opportunities: none added; keep scope narrow. Search and mobile are outside this pass.

## Conventions
Use the scoped navigation tokens rather than global bento motion. The existing site-product-title arrow transition is the local exemplar for interruptible CSS state changes. No new library.

## Verification
Build, diff check and preservation hashes. In-app desktop checks at1440 and 1280, comparing the live reference and actual rendered transition states. Verify keyboard transitions0ms, inactive links unreachable, no browser errors, and interrupted CSS transforms do not reset. Save proof captures under outputs/navigation-motion. Physical/mobile/reduced-motion work excluded explicitly by user. Review again after the build and another sequence of mixed interactions.
