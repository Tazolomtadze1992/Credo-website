# Second website design

Imported from https://github.com/Hellstaber/credo-web at commit be72a78dbd415bf9f81018bcd9d95191f1e406fa.

The original page components, artwork and interactions are preserved. TypeScript annotations were removed to use the host app's existing JavaScript toolchain. Imports resolve locally, public assets live under /design-two/, and non-module CSS is scoped to .design-two so it cannot style Variant 1. The existing local Georgian font replaces the network font loader.

The homepage picker selects /?v=1 or /?v=2 and remembers the selection. The imported inner pages retain /loans, /loans/digital-loan, /rcheuli, /emigrants and /expats. On these pages Variant 1 returns to its homepage, matching the previous comparison. Existing prototype URLs keep their own independent v parameter.

Navigation uses the shared Variant 1 component outside the imported CSS scope. Variant 2 passes its design ID so menus, featured links, search and home links resolve to its local pages. Variant 1 destinations remain unchanged.
