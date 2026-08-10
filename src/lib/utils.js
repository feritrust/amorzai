const FA_DIGITS = ['۰', '۱', '۲', '۳', '۴', '۵', '۶', '۷', '۸', '۹'];

/** تبدیل ارقام لاتین به فارسی */
export function toFa(input) {
  return String(input).replace(/\d/g, (d) => FA_DIGITS[Number(d)]);
}

/** قیمت به تومان با جداکننده هزارگان و ارقام فارسی */
export function formatPrice(value) {
  if (value === null || value === undefined || value === 0) return 'استعلام تلفنی';
  return `${toFa(new Intl.NumberFormat('en-US').format(value))} تومان`;
}

/** قیمت خام برای Schema (بدون فرمت فارسی) */
export function rawPrice(value) {
  return value ? String(value) : undefined;
}

export function cx(...parts) {
  return parts.filter(Boolean).join(' ');
}

/** برش متن برای meta description در محدوده امن گوگل (حدود ۱۶۰ کاراکتر) */
export function clamp(text, max = 158) {
  const clean = String(text).replace(/\s+/g, ' ').trim();
  if (clean.length <= max) return clean;
  return `${clean.slice(0, max - 1).replace(/[،,\s]+\S*$/, '')}…`;
}

export function chunkPages(total, pageSize) {
  return Math.max(1, Math.ceil(total / pageSize));
}

/** تاریخ ISO امن برای sitemap */
export function isoDate(d) {
  const date = d ? new Date(d) : new Date();
  return Number.isNaN(date.getTime()) ? new Date().toISOString() : date.toISOString();
}
