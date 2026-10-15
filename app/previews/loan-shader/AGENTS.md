# Loan-card version history

- Preserve delivered numbered shader files in `versions/`. V2, V3, V4, and V5 are delivered snapshots requested by the user. Do not edit or remove them. An in-progress new version may be tuned until it is delivered, then freeze it too.
- For further design iterations, add the next numbered file and an entry in `versions/catalog.js`. Keep previous versions reachable in the picker and by URL.
- When adding a new version, mark the previous catalog entry as saved; do not change its shader file. The picker defaults to the newest catalog entry.
- Shared card artwork, heading, dimensions and white-space treatment stay consistent for comparison unless the user asks to change them.
- This preview is isolated. Do not modify the homepage or other bento cards as part of a shader exploration without the user's request.
