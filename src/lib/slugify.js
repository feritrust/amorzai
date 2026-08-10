// نویسه‌گردانی فارسی به لاتین برای ساخت اسلاگ خوانا و SEO-friendly
const MAP = {
  آ: 'a', ا: 'a', أ: 'a', إ: 'e', ب: 'b', پ: 'p', ت: 't', ث: 's', ج: 'j', چ: 'ch',
  ح: 'h', خ: 'kh', د: 'd', ذ: 'z', ر: 'r', ز: 'z', ژ: 'zh', س: 's', ش: 'sh', ص: 's',
  ض: 'z', ط: 't', ظ: 'z', ع: 'a', غ: 'gh', ف: 'f', ق: 'gh', ک: 'k', ك: 'k', گ: 'g',
  ل: 'l', م: 'm', ن: 'n', و: 'v', ه: 'h', ة: 'h', ی: 'y', ي: 'y', ئ: 'y', ء: '',
  '۰': '0', '۱': '1', '۲': '2', '۳': '3', '۴': '4', '۵': '5', '۶': '6', '۷': '7', '۸': '8', '۹': '9',
  ' ': '-', '‌': '-', _: '-',
};

// حرکات و اعرابی که باید حذف شوند
const DIACRITICS = /[ً-ٰٟـ]/g;

/**
 * ساخت اسلاگ لاتین از عنوان فارسی یا انگلیسی.
 * مثال: «تاج گل ترحیم دو طبقه» → «taj-gl-trhym-dv-tbgh»
 * خروجی همیشه قابل ویرایش دستی در پنل است.
 */
export function slugify(input = '') {
  const text = String(input).trim().toLowerCase().replace(DIACRITICS, '');

  let out = '';
  for (const ch of text) {
    if (/[a-z0-9]/.test(ch)) out += ch;
    else if (MAP[ch] !== undefined) out += MAP[ch];
    else if (/[\s\-/\\.،,:؛;]/.test(ch)) out += '-';
  }

  return out
    .replace(/-{2,}/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 80);
}

/** اعتبارسنجی اسلاگ: فقط حروف کوچک لاتین، عدد و خط تیره */
export function isValidSlug(slug) {
  return /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(String(slug || ''));
}
