import { consumerGroups, searchLinks, bankingLinks, contactHref, videoHref } from './site-navigation.mjs';

const aliases = {
  loans: 'სესხები სესხის დაფინანსება loan loans credit',
  cards: 'ბარათი ბარათის ბარათები card cards',
  deposits: 'ანაბარი ანაბრის ანაბრები დანაზოგი დაგროვება deposit savings',
  installments: 'განვადება განვადების installment installments',
  insurance: 'დაზღვევა დაზღვევის insurance',
  services: 'გადარიცხვა გზავნილი გადმორიცხვა transfer remittance',
};
const extraAliases = {
  'ციფრული სესხი': 'ონლაინ სესხი digital',
  'ავტო სესხი': 'ავტომობილი მანქანა მანქანის ავტოსესხი car auto',
  'იპოთეკური სესხი': 'იპოთეკა იპოთეკის ბინა ბინის სახლის mortgage',
  'სტუდენტური სესხი': 'სტუდენტი სწავლა სწავლის student',
  'აგრო სესხი': 'აგრო სოფლის მეურნეობა agriculture',
  'და-ყა-ვი': 'დაყავი დაკავი dayavi dakavi da ya vi da ka vi',
  'აგრო და-ყა-ვი': 'აგროდაყავი agro dayavi',
  'ბიზნეს სესხი': 'ბიზნესის ბიზნესისთვის სესხები business loan',
  'კალკულატორი': 'პროცენტი გამოთვლა კალკულაცია calculator calculate',
  'კონტაქტი': 'დახმარება ფილიალი ფილიალები მისამართი სერვისცენტრი support help contact',
};

export function normaliseSearch(value) {
  return value.normalize('NFKC').toLocaleLowerCase('ka-GE').replace(/[^\p{L}\p{N}]+/gu, ' ').trim().replace(/\s+/g, ' ');
}

export function searchHref(href) {
  return href.startsWith('#') ? `/${href}` : href;
}

const groupByHref = new Map(consumerGroups.flatMap(group => group.links.map(link => [link.href, group.id])));
const additions = [
  { label: 'ვიდეო ბანკი', href: videoHref, keywords: 'დახმარება კონსულტაცია მომსახურება video banking', icon: 'video' },
  { label: 'გაიგე ლიმიტი', href: 'https://lending.credo.ge/loans/loan-limits', keywords: 'ლიმიტი სესხი განვადება limit', icon: 'loans' },
  ...bankingLinks.map((link, index) => ({ ...link, label: index ? 'Business MyCredo' : 'MyCredo', keywords: 'ინტერნეტბანკი მობაილბანკი აპლიკაცია აპი internet mobile app', icon: 'phone' })),
];

export const SEARCH_ITEMS = [...searchLinks, ...additions].map(item => {
  const group = groupByHref.get(item.href);
  return {
    ...item,
    href: searchHref(item.href),
    icon: item.icon || group || (item.href === contactHref ? 'help' : 'page'),
    group,
    labelKey: normaliseSearch(item.label),
    aliasKey: normaliseSearch(`${aliases[group] || ''} ${extraAliases[item.label] || ''} ${item.keywords || ''}`),
    detailKey: normaliseSearch(item.detail || ''),
  };
});

const grouped = id => SEARCH_ITEMS.filter(item => item.group === id);
export const SEARCH_STARTS = [
  { id: 'loans', label: 'სესხები', icon: 'loans', items: grouped('loans') },
  { id: 'cards', label: 'ბარათები', icon: 'cards', items: grouped('cards') },
  { id: 'deposits', label: 'ანაბრები', icon: 'deposits', items: grouped('deposits') },
  { id: 'dayavi', label: 'და-ყა-ვი', icon: 'installments', href: '/prototypes/dayavi' },
  { id: 'help', label: 'დახმარება', icon: 'help', items: [
    SEARCH_ITEMS.find(item => item.href === contactHref),
    SEARCH_ITEMS.find(item => item.href === videoHref),
    SEARCH_ITEMS.find(item => item.label === 'კალკულატორი'),
  ] },
];

export function findSearchResults(query) {
  const term = normaliseSearch(query);
  if (!term) return [];
  const compact = term.replaceAll(' ', '');
  const tokens = term.split(' ');
  return SEARCH_ITEMS.map((item, index) => {
    const labelCompact = item.labelKey.replaceAll(' ', '');
    const aliasCompact = item.aliasKey.replaceAll(' ', '');
    const text = `${item.labelKey} ${item.aliasKey} ${item.detailKey}`;
    if (!(labelCompact.includes(compact) || aliasCompact.includes(compact) || tokens.every(token => text.includes(token)))) return null;
    const score = labelCompact === compact ? 100 : item.labelKey.startsWith(term) ? 80 : labelCompact.includes(compact) ? 60 : tokens.every(token => `${item.labelKey} ${item.aliasKey}`.includes(token)) ? 40 : 20;
    return { item, score, index };
  }).filter(Boolean).sort((a, b) => b.score - a.score || a.index - b.index).map(result => result.item);
}
