# Shared loan and და-ყა-ვი backgrounds

These are independent, saved renderer snapshots. V1 preserves the first shared flow. V2 keeps its movement and six light shades, adding two deeper colors inside matching coral and blue pools. The heading fade, original artwork and approximately 22-second circulation are consistent.

| Version | Preview |
| --- | --- |
| V1 · Soft flow | http://localhost:3010/previews/shared-bento?version=soft |
| V2 · Rich flow | http://localhost:3010/previews/shared-bento?version=rich |
| Both | http://localhost:3010/previews/shared-bento?version=rich&compare=1 |

## Palette

All eight OKLCH stops are in sRGB gamut. The six light stops are unchanged from V1. The deeper colors are localized cores, not a replacement for the light field. Each core's influence follows its matching hue so the coral/blue overlap retains its pale bridge.

| Stop | V1 | V2 |
| --- | --- | --- |
| Paper | `oklch(.993 .002 30)` | Same |
| Coral | `oklch(.87 .06 29.48)` | Same |
| Blue | `oklch(.84 .055 232.094)` | Same |
| Peach | `oklch(.955 .019 29.48)` | Same |
| Rose | `oklch(.91 .04 29.48)` | Same |
| Mist | `oklch(.95 .021 232.094)` | Same |
| Ocean | — | `oklch(.505 .09 232.094)` · approximately `#206D8F` |
| Terracotta | — | `oklch(.7 .14 29.48)` · approximately `#E87A6A` |

For future changes add the next numbered renderer and a catalog entry; keep these files intact. `snapshots.sha256` is checked from this directory. The V1 palette was copied inline from the original card-ribbon palette to prevent later artwork edits from changing this saved study.

Verification: production build; both WebGL shaders live without console errors; version selection, URL reload and browser history; desktop 1440px and stacked mobile 390px with no horizontal overflow. Earlier loan V2–V5, payment panels, bank-card palette, globe and news source checksums remain unchanged.
