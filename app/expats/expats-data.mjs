// Content for /expats, taken from credobank.ge/en/expats and its promo pages (Nov 2026).
// The page is in English: it is written for foreign citizens living in Georgia.
const EN = 'https://credobank.ge/en';
export const VIDEO_URL = `${EN}/services/video-banking-foreign-citizens`;
export const PACKAGE_URL = `${EN}/promotions/welcomes-expats`;
export const RCHEULI_PROMO_URL = `${EN}/promotions/welcomes-rcheuli`;
export const RCHEULI_FORM_URL = `${EN}/rcheuli/form`;
export const OFFERS_URL = `${EN}/promotions/expat-offers`;
export const LOAN_FORM_URL = `${EN}/products/loans/for-expats/form?name=For%20Expats`;
export const CONDITIONS_URL = `${EN}/products/for-expats`;
export const FACEBOOK_URL = 'https://www.facebook.com/CredoBankforExpats';
export const WHATSAPP_URL = 'https://wa.me/13209954242';
export const PROMO_END = 'January 1';
// The promo pages give no year; today is Nov 2026, so the window closes on 1 Jan 2027 (Tbilisi time).
export const PROMO_END_ISO = '2027-01-01T00:00:00+04:00';

// "Halved prices" per the expats team: the regular price is shown struck through.
export const packages = [
  {
    id: 'expat', name: 'Expat Package', tagline: 'Everything you need to bank in Georgia',
    price: { month: 2.5, year: 25 }, was: { month: 5, year: 50 },
    features: [
      'Multi-currency account, open in 15 minutes',
      'Mycredo mobile & internet banking',
      'Physical & digital Visa and Mastercard debit cards',
      'Free remote banking, incl. email banking',
      'Special terms on selected products',
    ],
    href: PACKAGE_URL, cta: 'Get the Expat Package',
  },
  {
    id: 'rcheuli', name: 'Credo Rcheuli', tagline: 'Premium banking with a personal banker',
    price: { month: 15, year: 150 }, was: { month: 30, year: 300 },
    features: [
      'Priority service with a dedicated personal banker',
      'Visa Platinum or Mastercard World Elite card',
      'Airport lounges and personal credit limits',
      'Concierge for travel, gifts and everyday requests',
      'Multi-currency account, open in 15 minutes',
    ],
    href: RCHEULI_PROMO_URL, cta: 'Become Rcheuli',
  },
];

export const loanOffers = [
  { id: 'mortgage', label: 'Mortgage loan', big: '8.00%', unit: 'from', note: 'Effective rate from 9.78%', points: ['Down payment from 20%', 'No income verification', 'Offers from partner developers'], rate: 8, months: 240, amount: 250000 },
  { id: 'business', label: 'Business loan', big: '−30%', unit: 'up to', note: 'Rate from 16% · effective from 19.04%', points: ['Any purpose, any industry', 'Financing based on business income', 'Refinance with up to 20% off'], rate: 16, months: 36, amount: 50000 },
  { id: 'auto', label: 'Auto loan', big: '80%', unit: 'finance up to', note: 'of the vehicle value, up to GEL 30,000', points: ['Any source of income considered', 'New or used vehicles', 'Quick application'], rate: 18, months: 48, amount: 30000 },
];

// Illustrative deposit rates for the calculator; editable in the UI.
export const depositRates = { GEL: 11, USD: 3, EUR: 1.5 };

// Video banking, from credobank.ge/en/services/video-banking-foreign-citizens (Nov 2026).
export const CALL_URL = 'https://videobanking.credo.ge/client/landing/form';
export const CALLBACK_URL = 'https://forms.cloud.microsoft/e/9nhc6DBg04';
export const COUNTRIES_URL = 'https://s3.eu-central-1.amazonaws.com/cms-storage.noxtton.com/24aa354a-df2d-4b04-bfe6-fa835802e22c.pdf';
export const SERVICE_FEE = 'A USD 10 service fee (or the equivalent in EUR or GEL) is due within 60 days of registration, or the account is closed.';
// The four steps from the video banking page, told as: open an account, get a card.
export const videoSteps = [
  { id: 'call', title: 'Start or book a call', lead: 'Start a video call now', text: 'or book one for a time that suits you — wherever you are in the world.' },
  { id: 'details', title: 'Enter your details', lead: 'Enter your details', text: 'and agree to the call being recorded. A valid foreign passport is all you need.' },
  { id: 'verify', title: 'Verify on camera', lead: 'A Credo specialist verifies you', text: 'on camera, checks your passport and helps you choose the right products.' },
  { id: 'account', title: 'Get your account and card', lead: 'Your account is open.', text: 'Mycredo is ready to use, and your digital Visa or Mastercard is issued instantly.' },
];

const filtered = path => `${EN}/${path}?filter=expats`;
export const products = [
  { id: 'loans', icon: 'loan', title: 'Loans', description: 'Get the funds you need on terms tailored to you.', href: filtered('products/loans') },
  { id: 'deposits', icon: 'deposit', title: 'Deposits', description: 'Open a deposit and earn a high interest rate.', href: filtered('products/deposits') },
  { id: 'cards', icon: 'card', title: 'Cards', description: 'Visa and Mastercard with exclusive privileges.', href: filtered('products/cards') },
  { id: 'binoteka', icon: 'home', title: 'Binoteka', description: 'Become an apartment owner in Georgia.', href: 'https://credobank.ge/services/binoteka?filter=expats' },
  { id: 'remittances', icon: 'remittance', title: 'Remittances', description: 'Send and receive money conveniently.', href: filtered('products/remittances') },
  { id: 'transfers', icon: 'transfer', title: 'Transfers', description: 'Transfer 24/7 to any bank with just the account number.', href: filtered('products/transfers') },
  { id: 'insurance', icon: 'shield', title: 'Insurance', description: 'Protect your health and get quality care.', href: filtered('products/insurance') },
  { id: 'installments', icon: 'split', title: 'Installments', description: 'Pay for purchases step by step.', href: filtered('products/installments') },
  { id: 'services', icon: 'services', title: 'Services', description: 'Personal solutions designed around you.', href: filtered('services') },
];

// Expat Service Centers. Coordinates from OpenStreetMap (Nominatim, Nov 2026);
// 6 K. Gamsakhurdia resolves only to the avenue, so its pin is approximate —
// directions search by address, which finds the branch itself.
export const centers = [
  { id: 'aghmashenebeli', city: 'Tbilisi', district: 'Chughureti', address: '55 Davit Aghmashenebeli Ave.', lat: 41.70572, lng: 44.80040 },
  { id: 'chavchavadze', city: 'Tbilisi', district: 'Vake', address: '16 I. Chavchavadze Ave.', lat: 41.70899, lng: 44.77551 },
  { id: 'gamsakhurdia', city: 'Tbilisi', district: 'Saburtalo', address: '6 K. Gamsakhurdia St.', lat: 41.71505, lng: 44.77943 },
  { id: 'batumi', city: 'Batumi', district: 'Rustaveli', address: '1 Sh. Khimshiashvili St.', lat: 41.64414, lng: 41.61880 },
];
// Opening hours, Tbilisi time. Day 0 is Sunday.
export const OPENING = { 1: ['10:00', '17:30'], 2: ['10:00', '17:30'], 3: ['10:00', '17:30'], 4: ['10:00', '17:30'], 5: ['10:00', '17:30'], 6: ['10:15', '12:15'] };
const place = c => encodeURIComponent(`Credo Bank, ${c.address}, ${c.city}, Georgia`);
export const directionsUrl = c => `https://www.google.com/maps/dir/?api=1&destination=${place(c)}`;
export const appleMapsUrl = c => `https://maps.apple.com/?daddr=${c.lat},${c.lng}&q=${encodeURIComponent('Credo Bank')}`;
export const HOURS = 'Mon–Fri 10:00–17:30 · Sat 10:15–12:15';
export const PHONE = '+995 32 2 42 42 42';
