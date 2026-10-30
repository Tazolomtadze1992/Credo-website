// Consumer menu taxonomy from Credo-web-variants (data/site-navigation.mjs).
// Destinations are listed in Credo's public sitemap; "სესხი" and "ციფრული სესხი" open this site's
// /loans and /loans/digital-loan pages, other repo-internal routes point to sections of the home page.
const product = (label, detail, slug) => ({ label, detail, href: `https://credobank.ge/products/${slug}` });

export const consumerGroups = [
  { id: 'loans', label: 'სესხი', href: '/loans', links: [
    { label: 'ციფრული სესხი', detail: 'სესხი სახლიდან გაუსვლელად', href: '/loans/digital-loan' },
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
    { label: 'და-ყა-ვი', detail: 'გადაიხადე შენს ტემპში', href: '/?v=2#products' },
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
