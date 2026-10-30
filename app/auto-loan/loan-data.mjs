// Source: https://credobank.ge/products/auto-loan, checked 2026-10-30.
// Use the two explicitly paired rates in the conditions, not the mixed pair
// shown in the legacy calculator. All figures remain illustrative.
export const SOURCE_URL = 'https://credobank.ge/products/auto-loan';
export const PARTNERS_URL = 'https://s3.eu-central-1.amazonaws.com/cms-storage.noxtton.com/caab77da-aeae-4fda-8c32-2f8d8237f8c4.pdf';
const PURCHASE_CONTRACT = 'https://s3.eu-central-1.amazonaws.com/cms-storage.noxtton.com/4ffaf58d-8b1a-4609-8603-9363617a19aa.pdf';
const CASH_CONTRACT = 'https://s3.eu-central-1.amazonaws.com/cms-storage.noxtton.com/43d8ab37-e9f2-402d-b8a8-9bd2db962938.pdf';

export const products = [
  {
    id: 'new', label: 'ახალი ავტომობილი',
    description: 'შეარჩიე შენი ახალი ავტომობილი. დაფინანსებაზე ჩვენ ვიზრუნებთ.',
    annual: 16.5, effective: 19.36,
    application: 'https://lending.credo.ge/loans/aul?state=main-form',
    contract: PURCHASE_CONTRACT,
    image: '/assets/auto-loan/silver-crossover.webp',
    alt: 'ვერცხლისფერი ავტომობილი ნათელ სტუდიურ გარემოში',
    steps: [
      ['შეარჩიე ავტომობილი', 'აირჩიე სასურველი მოდელი ავტოსალონში.'],
      ['შეავსე განაცხადი', 'მოითხოვე დაფინანსება ონლაინ.'],
      ['შეათანხმე პირობები', 'გაეცანი შეთავაზებას და დაგეგმე შენაძენი.'],
    ],
  },
  {
    id: 'used', label: 'მეორადი ავტომობილი',
    description: 'შეიძინე ავტომობილი ავტოსალონიდან ან კერძო პირისგან.',
    annual: 16.5, effective: 19.36,
    application: 'https://lending.credo.ge/loans/auto-loan',
    contract: PURCHASE_CONTRACT,
    image: '/assets/auto-loan/graphite-hatchback.webp',
    alt: 'გრაფიტისფერი ავტომობილი ნათელ სტუდიურ გარემოში',
    steps: [
      ['იპოვე შენი ავტომობილი', 'ავტოსალონში ან კერძო გამყიდველთან.'],
      ['შეავსე განაცხადი', 'მოითხოვე ავტო სესხი ონლაინ.'],
      ['შეათანხმე პირობები', 'გაეცანი დაფინანსების შეთავაზებას.'],
    ],
  },
  {
    id: 'cash', label: 'თანხა შენი ავტომობილით',
    description: 'მიიღე სესხი შენი ავტომობილის უზრუნველყოფით. ავტომობილი რჩება შენთან.',
    annual: 20.5, effective: 24.07,
    application: 'https://lending.credo.ge/loans/auto-loan',
    contract: CASH_CONTRACT,
    image: '/assets/auto-loan/silver-crossover.webp',
    alt: 'ვერცხლისფერი ავტომობილი, რომელიც მფლობელის სარგებლობაში რჩება',
    steps: [
      ['მოამზადე დოკუმენტები', 'პირადობის მოწმობა და ტექპასპორტი.'],
      ['შეავსე განაცხადი', 'მოითხოვე სესხი შენი ავტომობილით.'],
      ['შეათანხმე პირობები', 'ავტომობილით სარგებლობას აგრძელებ.'],
    ],
  },
];

export function resolveProduct(type) {
  return products.find(product => product.id === type) || products[0];
}

export function estimatePayment(amount, term, annual) {
  const principal = Number(amount), months = Number(term), rate = Number(annual);
  if (amount === '' || !Number.isFinite(principal) || principal <= 0 || principal > 1e9 || !Number.isInteger(months) || months < 12 || months > 72 || !Number.isFinite(rate) || rate < 0) return null;
  if (rate === 0) return principal / months;
  const monthly = rate / 1200;
  return principal * monthly / -Math.expm1(-months * Math.log1p(monthly));
}
