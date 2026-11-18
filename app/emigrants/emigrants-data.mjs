// Source: https://credobank.ge/emigrants, checked 2026-11-17.
// Product copy and destinations follow the live page; typos there are corrected.
export const SOURCE_URL = 'https://credobank.ge/emigrants';
export const VIDEO_BANKING_URL = 'https://videobanking.credo.ge/';
export const FACEBOOK_URL = 'https://www.facebook.com/CredoforEmigrants';
export const RCHEULI_URL = 'https://credobank.ge/rcheuli/form';

const filtered = path => `https://credobank.ge/${path}?filter=emigrants`;

export const products = [
  { id: 'remittances', icon: 'remittance', title: 'გზავნილები', description: 'მიიღე და გაგზავნე თანხა კომფორტულად.', href: filtered('products/remittances') },
  { id: 'transfers', icon: 'transfer', title: 'გადარიცხვები', description: 'გადარიცხე თანხა 24/7 სხვა ბანკში, მხოლოდ ანგარიშის ნომრით.', href: filtered('products/transfers') },
  { id: 'deposits', icon: 'deposit', title: 'ანაბრები', description: 'გახსენი მაღალსარგებლიანი ანაბარი და დააგროვე უსაფრთხოდ.', href: filtered('products/deposits') },
  { id: 'cards', icon: 'card', title: 'ბარათები', description: 'მიიღე ციფრული ბარათი მომენტალურად და ისარგებლე უპირატესობებით.', href: filtered('products/cards') },
  { id: 'binoteka', icon: 'home', title: 'ბინოთეკა', description: 'შეიძინე უძრავი ქონება ემიგრანტებზე მორგებული პირობებით.', href: filtered('services/binoteka') },
  { id: 'loans', icon: 'loan', title: 'სესხები', description: 'მიიღე საჭირო თანხა შენზე მორგებული პირობებით.', href: filtered('products/loans') },
  { id: 'keepz', icon: 'qr', title: 'Keepz-ის QR ტერმინალი', description: 'მიიღე გადახდები ციფრულად, შენზე მორგებული პირობებით.', href: filtered('services/keepz-qr-terminal') },
  { id: 'services', icon: 'services', title: 'სერვისები', description: 'ისარგებლე შენზე მორგებული მომსახურებით.', href: filtered('services') },
];

export const topics = ['ანგარიშის გახსნა', 'ბარათი', 'გზავნილი ან გადარიცხვა', 'ანაბარი', 'სესხი ან ბინოთეკა', 'Mycredo-ს აქტივაცია', 'სხვა'];

export const countries = ['საბერძნეთი', 'იტალია', 'ესპანეთი', 'გერმანია', 'საფრანგეთი', 'დიდი ბრიტანეთი', 'ნიდერლანდები', 'თურქეთი', 'აშშ', 'ისრაელი', 'კვიპროსი', 'პოლონეთი', 'სხვა'];
