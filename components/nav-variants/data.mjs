// Menu structures for the three navigation proposals (2026-11-10 restructuring meeting).
// Every product comes from data/menu-inventory.mjs (Mariam's Menu-v2 inventory); nothing here invents products.
import { menuInventory } from '../../data/menu-inventory.mjs';

const SITE = 'https://credobank.ge';
// Pages that already exist in this site.
const LOCAL = { '/products/auto-loan': '/auto-loan', '/products/split': '/prototypes/dayavi', '/products/insurance': '/insurance', '/emigrants': '/emigrants' };
export const href = path => (!path ? '#' : path.startsWith('http') || path.startsWith('/#') ? path : LOCAL[path] ?? `${SITE}${path}`);

// Meeting rule (57:51): personal installments are called და-ყა-ვი; business keeps განვადება.
const label = (audience, text) => (audience === 'personal' && text === 'განვადება' ? 'და-ყა-ვი' : text);
const tab = (audience, id) => menuInventory[audience].find(t => t.id === id);
let seq = 0;

/** Inventory group → header group ({ id, label, href, links, more }), filtered by segment. Null when empty. */
function group(audience, source, { segment = '', title, limit = 7 } = {}) {
  const items = source.items.filter(i => !segment || i.segments.includes(segment));
  if (!items.length) return null;
  const shown = limit && items.length > limit ? items.slice(0, limit) : items;
  return {
    id: `g${seq++}`,
    label: title ?? label(audience, source.label),
    href: source.href ? href(source.href) : undefined,
    links: [...shown.map(i => ({ label: i.label, href: i.href ? href(i.href) : `#url-later-${seq++}` })), ...(shown.length < items.length ? [{ label: `ყველა (${items.length})`, href: href(source.href), more: true }] : [])],
  };
}
const groupsOf = (audience, tabId, opts) => tab(audience, tabId).groups.map(g => group(audience, g, opts)).filter(Boolean);
const merged = (audience, tabIds, title, opts) => group(audience, { label: title, href: tab(audience, tabIds[0]).groups[0].href, items: tabIds.flatMap(id => tab(audience, id).groups.flatMap(g => g.items)).filter((i, n, all) => all.findIndex(x => x.href === i.href) === n) }, opts);
const links = (title, list) => ({ id: `g${seq++}`, label: title, links: list.map(l => ({ ...l, href: href(l.href) })) });
const columns = cols => cols.map(c => c.filter(Boolean)).filter(c => c.length);
const grid = (id, title, cols, extra = {}) => { const c = columns(cols); return c.length ? { id, label: title, kind: 'grid', columns: c, ...extra } : null; };
const compact = (id, title, groups, aside) => { const g = groups.filter(Boolean); return g.length ? { id, label: title, kind: 'compact', groups: g, aside } : null; };

export const BUSINESS_SIZES = [
  { id: 'micro', label: 'მიკრო ბიზნესი', href: '/business?size=micro' },
  { id: 'small', label: 'მცირე ბიზნესი', href: '/business?size=small' },
  { id: 'medium', label: 'საშუალო ბიზნესი', href: '/business?size=medium' },
];
const SECTORS = [{ label: 'აგრო', href: '/business/agro' }, { label: 'მერჩანტები', href: '/business/merchants' }, { label: 'HoReCa', href: '/business/horeca' }, { label: 'სტარტაპი', href: '/business/startup' }];
const PACKAGES = [{ label: 'დიჯიტალი', href: '/packages/digital' }, { label: 'პარტნიორი', href: '/packages/partniori' }, { label: 'რჩეული', href: '/packages/rcheuli' }, { label: 'კრედოელი', href: '/packages/credoeli' }];
const link = (id, title, path) => ({ id, label: title, href: href(path) });

/* A · Marketing lives in MarketingHeader.jsx and reads Mariam's own data (menu-v2.json). */

/* ---------- B · Business ask: BoG-style segment row, then that segment's product bar ---------- */
export const B_SEGMENTS = [
  { id: 'personal', label: 'ფიზიკური პირი', landing: '/' },
  ...BUSINESS_SIZES.map(s => ({ id: s.id, label: s.label, landing: s.href, business: true })),
  { id: 'emigrants', label: 'ემიგრანტები', landing: '/emigrants', segment: 'E' },
  { id: 'expats', label: 'ექსპატები', landing: '/expats', segment: 'X' },
];

function personalBar(segment, landing) {
  const o = { segment };
  return [
    link('main', 'მთავარი', landing),
    grid('credit', 'საკრედიტო პროდუქტები', tab('personal', 'credit').groups.map(g => [group('personal', g, o)]), { footer: { label: 'ყველა საკრედიტო პროდუქტი', href: href('/products/loans') } }),
    compact('cards', 'ბარათები', groupsOf('personal', 'cards', o), { text: 'სადებეტო, საკრედიტო და პრემიუმ ბარათები', link: { label: 'ყველა ბარათი', href: href('/products/cards') } }),
    compact('deposits', 'ანაბრები', groupsOf('personal', 'deposits', o), { text: 'დაზოგე შენს ტემპში', link: { label: 'ყველა ანაბარი', href: href('/products/deposits') } }),
    compact('transfers', 'გადარიცხვები', [...groupsOf('personal', 'remittances', o), ...groupsOf('personal', 'transfers', o)], { text: 'ფული საქართველოში და საზღვარგარეთ', link: { label: 'ყველა გადარიცხვა', href: href('/products/transfers') } }),
    compact('payments', 'გადახდები', [...groupsOf('personal', 'payments', o), ...groupsOf('personal', 'mycredo', o)], { text: 'გადაიხადე ტელეფონით ან QR-ით', link: { label: 'Mycredo', href: href('/services/financial-journal') } }),
    link('offers', 'შეთავაზებები', '/promotions'),
  ].filter(Boolean);
}
function businessBar(landing, segment = '') {
  const o = { segment };
  return [
    link('main', 'მთავარი', landing),
    grid('b-credit', 'დაფინანსება', tab('business', 'credit').groups.map(g => [group('business', g, o)]), { footer: { label: 'ყველა ბიზნეს-სესხი', href: href('/products/loans') } }),
    compact('b-accounts', 'ანგარიშები და ანაბრები', [...groupsOf('business', 'accounts', o), ...groupsOf('business', 'deposits', o)], { text: 'ბიზნესის ფული ერთ სივრცეში', link: { label: 'ყველა ანაბარი', href: href('/products/deposits') } }),
    compact('b-payments', 'გადახდები', [...groupsOf('business', 'payments', o), ...groupsOf('business', 'cards', o), ...groupsOf('business', 'transfers', o)], { text: 'მიიღე და გადაიხადე მარტივად', link: { label: 'Mycredo Business', href: href('/services') } }),
    segment ? null : compact('sectors', 'სექტორები', [links('სექტორები', SECTORS)], { text: 'პროდუქტები შენი დარგისთვის', link: { label: 'ბიზნესის გვერდი', href: href('/business') } }),
    link('offers', 'შეთავაზებები', '/promotions'),
  ].filter(Boolean);
}
export function businessAskBar(segmentId) {
  const s = B_SEGMENTS.find(x => x.id === segmentId) ?? B_SEGMENTS[0];
  if (s.business) return businessBar(s.landing);
  const bar = personalBar(s.segment ?? '', s.landing);
  if (s.id === 'expats') {
    const biz = businessBar('/expats#business', 'X').filter(x => x.kind);
    bar.splice(bar.length - 1, 0, grid('x-business', 'ბიზნესი', biz.flatMap(x => (x.kind === 'grid' ? x.columns : [x.groups]))));
  }
  return bar.filter(Boolean);
}

/* ---------- C · Design team: ჩემთვის / ჩემი ბიზნესისთვის / რჩეული, no filters in the menu ---------- */
export function designSections() {
  const pc = tab('personal', 'credit').groups;
  const bc = tab('business', 'credit').groups;
  return [
    grid('me', 'ჩემთვის', [
      [group('personal', pc[0], { limit: 9 })],
      [group('personal', pc[1], { limit: 5 }), group('personal', pc[2])],
      [merged('personal', ['cards'], 'ბარათები', { limit: 5 }), group('personal', tab('personal', 'deposits').groups[0], { limit: 5 })],
      [merged('personal', ['remittances', 'transfers'], 'გადარიცხვები', { limit: 5 }), group('personal', pc[3], { title: 'დაზღვევა', limit: 4 })],
    ], { sidebar: { group: links('შენზე მორგებული', [{ label: 'ემიგრანტებისთვის', href: '/emigrants' }, { label: 'ექსპატებისთვის', href: '/expats' }]), featured: true }, footer: { label: 'ყველა პირადი პროდუქტი', href: '/#products' } }),
    grid('biz', 'ჩემი ბიზნესისთვის', [
      [links('ბიზნესის ზომა', [...BUSINESS_SIZES, { label: 'მსხვილი ბიზნესი', href: '/business?size=large' }])],
      [group('business', bc[0], { limit: 9 })],
      [group('business', bc[1]), group('business', bc[2], { title: 'დაზღვევა' })],
      [merged('business', ['accounts', 'deposits'], 'ანგარიშები და ანაბრები', { limit: 6 }), merged('business', ['payments'], 'გადახდები')],
    ], { sidebar: { group: links('სექტორები', [...SECTORS, { label: 'ექსპატის ბიზნესი', href: '/expats#business' }]) }, footer: { label: 'ბიზნესის გვერდი', href: href('/business') } }),
    link('rcheuli', 'რჩეული', '/packages/rcheuli'),
    link('offers', 'შეთავაზებები', '/promotions'),
    compact('more', 'მეტი', [
      links('სერვისები და პაკეტები', [{ label: 'სერვისები', href: '/services' }, ...PACKAGES.filter(p => p.label !== 'რჩეული').map(p => ({ ...p, label: `${p.label} პაკეტი` }))]),
      links('კრედოს შესახებ', [{ label: 'მედია და ბლოგი', href: '/media-and-blog' }, { label: 'ეკო-სოციალური ჰაბი', href: '/social-responsibility' }, { label: 'ჩვენ შესახებ', href: '/about' }, { label: 'კარიერა', href: '/vacancy' }]),
    ], { text: 'ბანკი ყოველთვის შენთან', link: { label: 'ვიდეო ბანკი', href: 'https://credobank.ge/services/video-banking' } }),
  ];
}
