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
