// Illustrative rates for the prototype, in lari per one unit. Swap for the live
// feed later: `official` is the National Bank rate, `mobile` is Mycredo, `branch` is the counter.
export const RATES_URL = 'https://credobank.ge/';
export const UPDATED = '18.11.2026, 13:00';

export const currencies = [
  {
    code: 'USD', name: 'აშშ დოლარი', symbol: '$', flag: '/assets/globe/flags/us.svg',
    official: 2.5930, change: -0.0004,
    mobile: { buy: 2.5660, sell: 2.6220 }, branch: { buy: 2.5620, sell: 2.6260 },
    history: [2.6105, 2.6082, 2.6094, 2.6031, 2.6010, 2.6046, 2.5988, 2.5961, 2.5990, 2.5972, 2.5940, 2.5956, 2.5934, 2.5930],
  },
  {
    code: 'EUR', name: 'ევრო', symbol: '€', flag: '/assets/emigrants/flag-eu.svg',
    official: 2.8490, change: 0.0021,
    mobile: { buy: 2.8110, sell: 2.8810 }, branch: { buy: 2.8060, sell: 2.8860 },
    history: [2.8312, 2.8355, 2.8330, 2.8391, 2.8420, 2.8402, 2.8446, 2.8431, 2.8478, 2.8455, 2.8492, 2.8461, 2.8469, 2.8490],
  },
  {
    code: 'GBP', name: 'გირვანქა სტერლინგი', symbol: '£', flag: '/assets/globe/flags/gb.svg',
    official: 3.4190, change: -0.0015,
    mobile: { buy: 3.3720, sell: 3.4600 }, branch: { buy: 3.3670, sell: 3.4650 },
    history: [3.4302, 3.4288, 3.4321, 3.4270, 3.4255, 3.4281, 3.4236, 3.4249, 3.4212, 3.4228, 3.4201, 3.4219, 3.4205, 3.4190],
  },
];

export const GEL = { code: 'GEL', name: 'ლარი', symbol: '₾' };
export const calcCurrencies = [GEL, ...currencies];
const byCode = Object.fromEntries(currencies.map(c => [c.code, c]));

/* The bank buys what you hand over and sells what you take. A cross pair goes
   through lari: amount × buy(from) ÷ sell(to). */
export function convert(amount, from, to, channel = 'mobile') {
  if (!Number.isFinite(amount)) return NaN;
  if (from === to) return amount;
  const lari = from === 'GEL' ? amount : amount * byCode[from][channel].buy;
  return to === 'GEL' ? lari : lari / byCode[to][channel].sell;
}

export const rate = (value, digits = 4) => value.toFixed(digits);
export const money = value => Number.isFinite(value)
  ? value.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
  : '—';
export const signed = value => `${value > 0 ? '+' : value < 0 ? '−' : ''}${Math.abs(value).toFixed(4)}`;
