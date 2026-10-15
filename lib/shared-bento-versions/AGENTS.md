# Shared bento version history

- V1 (`v1-soft.mjs`) and V2 (`v2-rich.mjs`) are delivered snapshots. Do not edit or remove them. Add V3 and a catalog entry for a future iteration.
- Keep each saved palette self-contained, with no imports from changing artwork palettes. Previous versions must remain selectable and reachable by URL.
- Keep the comparison artwork, white heading space, card geometry and circulation speed consistent unless the user requests a change.
- `catalog.mjs` chooses the homepage default. The separate comparison route is `/previews/shared-bento`.
- `snapshots.sha256` records the delivered renderer files. Preserve these checksums when adding future versions.
