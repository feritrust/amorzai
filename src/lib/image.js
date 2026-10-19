import { generatedProductImages } from '../data/generated-product-images.mjs';
import { serviceImages } from '../data/service-images.mjs';

/**
 * تصاویری که لازم نیست از بهینه‌ساز زمان اجرای Next عبور کنند.
 *
 * - فایل‌های /uploads/ هنگام آپلود به WebP با عرض حداکثر ۱۶۰۰ تبدیل شده‌اند
 * - SVG اصلاً بهینه‌سازی نمی‌شود
 *
 * فایده: مسیر /_next/image حذف می‌شود، پس نه CPU سرور در هر بازدید درگیر می‌شود
 * و نه خطای ۴۰۰ بهینه‌ساز (که معمولاً از دسترسی فایل یا کانفیگ Nginx می‌آید) رخ می‌دهد.
 */
export function isPreOptimized(src = '') {
  const s = String(src);
  return s.startsWith('/uploads/') || s.toLowerCase().endsWith('.svg');
}

/** Keep custom photos; replace only missing images and the category placeholder. */
export function resolveItemImage({ type, slug, category, image } = {}) {
  const source = typeof image === 'string' ? image.trim() : '';
  const placeholder = `/images/${category}.svg`;
  const fallback = type === 'product' && Object.hasOwn(generatedProductImages, slug)
    ? { image: generatedProductImages[slug], isIllustrative: true }
    : type === 'service' && Object.hasOwn(serviceImages, slug)
      ? serviceImages[slug]
      : null;
  const resolved = fallback && (!source || source === placeholder)
    ? fallback.image
    : source || placeholder;

  return {
    image: resolved,
    imageIsIllustrative: Boolean(fallback?.isIllustrative && resolved === fallback.image),
  };
}
