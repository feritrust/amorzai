// اطلاعات پایه سایت — تنها منبع حقیقت برای SEO، فوتر، Schema و لینک‌ها
export const site = {
  name: 'آمرز',
  legalName: 'آمرز | خدمات مراسم ترحیم بهشت زهرا',
  shortName: 'آمرز',
  url: (process.env.NEXT_PUBLIC_SITE_URL || 'https://amorz.ir').replace(/\/$/, ''),
  locale: 'fa_IR',
  lang: 'fa',
  slogan: 'همراه شما در برگزاری آبرومند مراسم ترحیم',
  description:
    'آمرز مرجع سفارش گل و تاج گل، سنگ مزار، میز و صندلی، سایبان، پذیرایی، رستوران، مداح و چاپ برای مراسم ترحیم در بهشت زهرا است. مشاهده قیمت‌ها و رزرو تلفنی.',
  phone: process.env.NEXT_PUBLIC_PHONE || '02155005000',
  mobile: process.env.NEXT_PUBLIC_MOBILE || '09120000000',
  email: 'info@amorz.ir',
  address: {
    street: 'بهشت زهرا (س)، ورودی اصلی',
    city: 'تهران',
    region: 'تهران',
    postalCode: '1834994814',
    country: 'IR',
  },
  geo: { lat: 35.5218, lng: 51.3435 },
  openingHours: 'شبانه‌روزی — ۷ روز هفته',
  social: {
    instagram: 'https://instagram.com/amorz.ir',
    telegram: 'https://t.me/amorz_ir',
  },
  keywords: [
    'مراسم ترحیم',
    'بهشت زهرا',
    'تاج گل ترحیم',
    'سنگ مزار',
    'اجاره میز و صندلی',
    'پذیرایی مراسم ختم',
    'مداح مراسم ترحیم',
    'رستوران ترحیم',
    'سایبان مراسم',
    'چاپ بنر ترحیم',
  ],
};

// شماره تماس با فرمت بین‌المللی برای لینک tel: و Schema
export const telHref = (n) => `tel:+98${String(n).replace(/^0/, '')}`;

export const PAGE_SIZE = 12;
