import { toFa } from '@/lib/utils';

/** تاریخ شمسی خوانا — مثلاً «۲۲ خرداد ۱۴۰۵» */
export function faDate(input) {
  if (!input) return '';
  const d = new Date(input);
  if (Number.isNaN(d.getTime())) return '';
  try {
    return toFa(
      new Intl.DateTimeFormat('fa-IR', { year: 'numeric', month: 'long', day: 'numeric' }).format(d)
    );
  } catch {
    return d.toISOString().slice(0, 10);
  }
}

/** تاریخ ISO برای اتریبیوت datetime و Schema */
export function isoOrNull(input) {
  if (!input) return null;
  const d = new Date(input);
  return Number.isNaN(d.getTime()) ? null : d.toISOString();
}
