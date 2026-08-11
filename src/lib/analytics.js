import { dbConnect, hasDatabase } from '@/lib/mongodb';
import PageViewModel from '@/models/PageView';

/** تاریخ روز به وقت تهران */
export function tehranDay(date = new Date()) {
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Tehran',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(date);
}

/** آرایه‌ای از N روز گذشته به شکل YYYY-MM-DD (قدیمی‌ترین اول) */
export function lastDays(n) {
  const out = [];
  for (let i = n - 1; i >= 0; i -= 1) {
    out.push(tehranDay(new Date(Date.now() - i * 86400000)));
  }
  return out;
}

async function ready() {
  if (!hasDatabase()) return false;
  return Boolean(await dbConnect());
}

/**
 * خلاصه آمار برای بازه‌ای از روزها.
 * بازدید = تعداد صفحات دیده‌شده، بازدیدکننده = تعداد هش یکتا.
 */
async function totalsFor(days) {
  const [row] = await PageViewModel.aggregate([
    { $match: { day: { $in: days } } },
    { $group: { _id: null, views: { $sum: 1 }, visitors: { $addToSet: '$visitor' } } },
    { $project: { _id: 0, views: 1, visitors: { $size: '$visitors' } } },
  ]);
  return row || { views: 0, visitors: 0 };
}

export async function getAnalytics({ range = 30 } = {}) {
  if (!(await ready())) {
    return { available: false, reason: 'دیتابیس در دسترس نیست؛ آمار ثبت و نمایش داده نمی‌شود.' };
  }

  const days = lastDays(range);
  const today = tehranDay();
  const last7 = lastDays(7);
  const prev7 = lastDays(14).slice(0, 7);

  const [todayTotals, week, prevWeek, rangeTotals, daily, topPages, referrers, devices, allTime] =
    await Promise.all([
      totalsFor([today]),
      totalsFor(last7),
      totalsFor(prev7),
      totalsFor(days),

      // نمودار روزانه
      PageViewModel.aggregate([
        { $match: { day: { $in: days } } },
        { $group: { _id: '$day', views: { $sum: 1 }, visitors: { $addToSet: '$visitor' } } },
        { $project: { _id: 0, day: '$_id', views: 1, visitors: { $size: '$visitors' } } },
        { $sort: { day: 1 } },
      ]),

      // پربازدیدترین صفحات
      PageViewModel.aggregate([
        { $match: { day: { $in: days } } },
        { $group: { _id: '$path', views: { $sum: 1 }, visitors: { $addToSet: '$visitor' } } },
        { $project: { _id: 0, path: '$_id', views: 1, visitors: { $size: '$visitors' } } },
        { $sort: { views: -1 } },
        { $limit: 15 },
      ]),

      // منابع ورودی
      PageViewModel.aggregate([
        { $match: { day: { $in: days }, referrer: { $ne: '' } } },
        { $group: { _id: '$referrer', views: { $sum: 1 } } },
        { $project: { _id: 0, source: '$_id', views: 1 } },
        { $sort: { views: -1 } },
        { $limit: 10 },
      ]),

      // تفکیک دستگاه
      PageViewModel.aggregate([
        { $match: { day: { $in: days } } },
        { $group: { _id: '$device', views: { $sum: 1 } } },
        { $project: { _id: 0, device: '$_id', views: 1 } },
        { $sort: { views: -1 } },
      ]),

      PageViewModel.estimatedDocumentCount(),
    ]);

  // پر کردن روزهای بدون بازدید تا نمودار پیوسته باشد
  const map = new Map(daily.map((d) => [d.day, d]));
  const series = days.map((d) => map.get(d) || { day: d, views: 0, visitors: 0 });

  const growth =
    prevWeek.views === 0 ? null : Math.round(((week.views - prevWeek.views) / prevWeek.views) * 100);

  return {
    available: true,
    range,
    today: todayTotals,
    week,
    prevWeek,
    growth,
    total: rangeTotals,
    allTime,
    series,
    topPages,
    referrers,
    devices,
  };
}
