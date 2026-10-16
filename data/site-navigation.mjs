// User-supplied taxonomy. Destinations are listed in Credo's public sitemap.
const product = (label, detail, slug) => ({ label, detail, href: `https://credobank.ge/products/${slug}` });
export const consumerGroups = [
  { id: 'loans', label: 'სესხი', links: [
    product('ციფრული სესხი', 'სესხი სახლიდან გაუსვლელად', 'digital-loan'),
    product('ავტო სესხი', 'შენი შემდეგი ავტომობილისთვის', 'auto-loan'),
    product('იპოთეკური სესხი', 'შენი სახლისთვის', 'mortgage-loan'),
    product('სტუდენტური სესხი', 'შენი განათლებისთვის', 'student-loan'),
    product('აგრო სესხი', 'შენი მეურნეობის განვითარებისთვის', 'agro-loan'),
    product('სამომხმარებლო სესხი', 'შენი ყოველდღიური გეგმებისთვის', 'consumer-loan'),
  ]},
  { id: 'cards', label: 'ბარათები', links: [
    product('კრედო ბარათი', 'ყოველდღიური ფინანსებისთვის', 'mastercard-debit-cards'),
    product('საკრედიტო ბარათი', 'შენთვის საჭირო მომენტებში', 'credit-card'),
    product('სადებეტო ბარათი ემიგრანტებისთვის', 'შენთან, სადაც უნდა იყო', 'mastercard-debit-card-for-emigrants'),
    product('VISA პლატინუმ ბარათი', 'მეტი შესაძლებლობა ყოველდღე', 'visa-platinum-card'),
    product('World Elite ბარათები', 'გამორჩეული გამოცდილებისთვის', 'mastercard-world-elite'),
  ]},
  { id: 'deposits', label: 'ანაბრები', links: [
    product('ვადიანი ანაბარი', 'დაგეგმე შენი დანაზოგი', 'term-deposit-pro'),
    product('ზრდადი ანაბარი', 'დააგროვე ნაბიჯ-ნაბიჯ', 'growing-deposit'),
    product('მოთხოვნამდე ანაბარი', 'დანაზოგი შენს ხელთ', 'saving-deposit'),
    product('საბავშვო ანაბარი', 'მათი მომავლისთვის', 'kids-deposit'),
  ]},
  { id: 'installments', label: 'განვადება', links: [
    product('და-ყა-ვი', 'გადაიხადე შენს ტემპში', 'split'),
    product('აგრო განვადება', 'შენი მეურნეობისთვის', 'agro-installment'),
    product('ონლაინ განვადება', 'შეიძინე ონლაინ', 'online-installment'),
    product('სამომხმარებლო', 'განვადება შენს შენაძენზე', 'consumer-installment'),
    product('აგრო და-ყა-ვი', 'შენი აგრო შენაძენისთვის', 'agro-dakavi'),
  ]},
  { id: 'insurance', label: 'დაზღვევა', links: [
    product('ჯანმრთელობის დაზღვევა', 'იზრუნე საკუთარ თავზე', 'health-insurance-vitamini'),
    product('დაზღვევა და მეტი', 'მეტი სიმშვიდე ყოველდღე', 'benefits-and-more'),
    product('ქონების დაზღვევა', 'დაიცავი შენი ქონება', 'property-insurance'),
    product('ავტომობილის დაზღვევა', 'სიმშვიდე გზაში', 'car-insurance-castco'),
    product('მოსავლის დაზღვევა', 'იზრუნე შენს მოსავალზე', 'crop-insurance'),
    product('მესამე პირის დაზღვევა', 'პასუხისმგებლობა გზაზე', 'car-insurance-tpl'),
  ]},
  { id: 'services', label: 'სხვა სერვისები', links: [
    product('ფულადი გზავნილები', 'გააგზავნე და მიიღე ფული', 'international-remittance'),
    { label: 'გადარიცხვები', detail: 'ფული იქ, სადაც გჭირდება', href: 'https://credobank.ge/services/instant-transfer' },
    product('ანგარიშები', 'მართე ყოველდღიური ფინანსები', 'current-account'),
  ]},
];
export const businessLinks = [
  product('ბიზნეს სესხი', 'შენი ბიზნესის განვითარებისთვის', 'business-loan'),
  product('სტარტ-აპ სესხი', 'ახალი იდეის დასაწყებად', 'startup-business-loan'),
  product('ანაბარი ბიზნესისთვის', 'დაგეგმე ბიზნესის დანაზოგი', 'business-term-deposit'),
  product('ბიზნეს ბარათი', 'ბიზნესის ყოველდღიური ხარჯებისთვის', 'visa-business-card'),
];
export const aboutLinks = [
  { label: 'კრედოს შესახებ', detail: 'გაიცანი ჩვენი ბანკი', href: 'https://credobank.ge/about' },
  { label: 'მფლობელები', detail: 'ჩვენი პარტნიორები', href: 'https://credobank.ge/owners' },
  { label: 'მმართველობა', detail: 'გაიცანი ჩვენი გუნდი', href: 'https://credobank.ge/management' },
  { label: 'ფინანსური მაჩვენებლები', detail: 'კრედო ბანკი რიცხვებში', href: 'https://credobank.ge/financial-highlights' },
  { label: 'სიახლეები', detail: 'რა ხდება კრედოში', href: '#news' },
  { label: 'კარიერა', detail: 'შემოუერთდი ჩვენს გუნდს', href: 'https://credobank.ge/vacancy' },
];
export const bankingLinks = [
  { label: 'ფიზიკური პირისთვის', detail: 'MyCredo — შენი ციფრული ბანკი', href: 'https://onelink.to/mycredo' },
  { label: 'ბიზნესისთვის', detail: 'Business MyCredo', href: 'https://onelink.to/business-mycredo' },
];
export const contactHref = 'https://credobank.ge/contact';
export const videoHref = 'https://credobank.ge/services/video-banking';
export const englishHref = 'https://credobank.ge/en';
export const navigationSections = [
  { id: 'consumer', label: 'სამომხმარებლო', groups: consumerGroups },
  { id: 'business', label: 'ბიზნესი', groups: [
    { id: 'business-finance', label: 'ბიზნესის დაფინანსება', links: businessLinks.slice(0, 2) },
    { id: 'business-everyday', label: 'ყოველდღიური საბანკო სერვისები', links: businessLinks.slice(2) },
  ]},
  { id: 'about', label: 'ჩვენ შესახებ', groups: [
    { id: 'about-bank', label: 'კრედო ბანკი', links: aboutLinks.slice(0, 3) },
    { id: 'about-more', label: 'მეტი კრედოს შესახებ', links: aboutLinks.slice(3) },
  ]},
  { id: 'banking', label: 'ინტერნეტბანკი', groups: [
    { id: 'digital-bank', label: 'შენი ციფრული ბანკი', links: bankingLinks },
  ]},
];
export const searchLinks = [
  ...consumerGroups.flatMap(group => group.links.map(item => ({ ...item, keywords: group.label }))),
  { label: 'კრედოს ოჯახი', detail: 'გახდი კრედოს ოჯახის წევრი', href: '#credo-family', keywords: 'ოჯახი family' },
  { label: 'კალკულატორი', detail: 'სესხი, ანაბარი და ვალუტის კურსი', href: '#calculator', keywords: 'გამოთვალე კურსი calculator' },
  { label: 'კონტაქტი', detail: 'სერვისცენტრები და დახმარება', href: contactHref, keywords: 'დახმარება მისამართი contact' },
  ...businessLinks.map(item => ({ ...item, keywords: 'ბიზნესი business' })),
  ...aboutLinks.map(item => ({ ...item, keywords: 'ჩვენ შესახებ about' })),
];
