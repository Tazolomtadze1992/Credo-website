// Shared navigation visuals, with local destinations for the imported second design.
const secondDesignRoutes = Object.freeze({
  'https://credobank.ge/rcheuli': '/rcheuli',
  'https://credobank.ge/emigrants': '/emigrants',
  'https://credobank.ge/expats': '/expats',
  'https://credobank.ge/products/digital-loan': '/loans/digital-loan',
});

export function resolveDesignHref(href, design = 1) {
  if (design !== 2) return href;
  if (href === '/') return '/?v=2';
  if (href.startsWith('/#')) return `/?v=2${href.slice(1)}`;
  return secondDesignRoutes[href] || href;
}
