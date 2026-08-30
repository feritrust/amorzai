// اطلاعات پایه سایت — تنها منبع حقیقت برای SEO، فوتر، Schema و لینک‌ها
export const site = {
  name: 'آمرز',
  legalName: 'آمرز | مرجع خدمات بهشت زهرا',
  shortName: 'آمرز',
  url: (process.env.NEXT_PUBLIC_SITE_URL || 'https://amorz.ir').replace(/\/$/, ''),
  locale: 'fa_IR',
  lang: 'fa',
  slogan: 'مرجع خدمات بهشت زهرا — از گل و صندلی تا پذیرایی و مداح',
  description:
    'آمرز مرجع خدمات بهشت زهرا: اجاره صندلی و میز، تاج گل، سنگ مزار، سایبان، پذیرایی، رستوران، مداح و چاپ بنر. قیمت شفاف روی سایت و رزرو تلفنی شبانه‌روزی.',
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
    'خدمات بهشت زهرا',
    'اجاره صندلی بهشت زهرا',
    'رستوران بهشت زهرا',
    'تاج گل بهشت زهرا',
    'سنگ مزار بهشت زهرا',
    'مداح بهشت زهرا',
    'پذیرایی مراسم ترحیم بهشت زهرا',
    'اجاره سایبان بهشت زهرا',
    'مراسم ترحیم بهشت زهرا',
    'چاپ بنر ترحیم',
  ],
};

// شماره تماس با فرمت بین‌المللی برای لینک tel: و Schema
export const telHref = (n) => `tel:+98${String(n).replace(/^0/, '')}`;

/**
 * لینک واتساپ با پیام آماده. اگر لینک کامل در تنظیمات ذخیره شده باشد همان
 * استفاده می‌شود، وگرنه از شماره موبایل ساخته می‌شود.
 */
export function waHref(whatsappOrNumber, text = '') {
  const raw = String(whatsappOrNumber || '').trim();
  if (!raw) return '';
  const query = text ? `?text=${encodeURIComponent(text)}` : '';
  if (raw.startsWith('http')) return raw.includes('?') ? raw : raw + query;
  return `https://wa.me/98${raw.replace(/\D/g, '').replace(/^0/, '')}${query}`;
}

export const PAGE_SIZE = 12;
