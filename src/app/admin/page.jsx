import Link from 'next/link';
import { ENTITY_KEYS, ENTITIES } from '@/lib/entities';
import { adminCount } from '@/lib/adminData';
import { hasDatabase } from '@/lib/mongodb';
import Icon from '@/components/Icons';
import RevalidateButton from '@/components/admin/RevalidateButton';
import { getAnalytics } from '@/lib/analytics';
import { toFa } from '@/lib/utils';

export const dynamic = 'force-dynamic';

async function safeCount(key) {
  try {
    return await adminCount(key);
  } catch {
    return null;
  }
}

export default async function AdminDashboard() {
  const counts = hasDatabase()
    ? Object.fromEntries(await Promise.all(ENTITY_KEYS.map(async (k) => [k, await safeCount(k)])))
    : {};

  let stats = null;
  if (hasDatabase()) {
    try {
      stats = await getAnalytics({ range: 30 });
    } catch {
      stats = null;
    }
  }

  return (
    <div className="space-y-8">
      <header>
        <h1 className="mb-1 text-xl font-extrabold">داشبورد</h1>
        <p className="text-[13px] text-ink-muted">
          هر تغییری که اینجا ذخیره کنید، بلافاصله در سایت اعمال می‌شود و نیازی به بیلد مجدد نیست.
        </p>
      </header>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {ENTITY_KEYS.map((key) => {
          const e = ENTITIES[key];
          return (
            <Link key={key} href={`/admin/${key}`} className="card card-hover p-5">
              <span className="mb-3 grid h-11 w-11 place-items-center rounded-xl bg-sage-50 text-sage-600">
                <Icon name={e.icon} className="h-6 w-6" />
              </span>
              <h2 className="mb-1 text-[15px] font-bold">{e.label}</h2>
              <p className="text-[13px] text-ink-muted">
                {counts[key] === null || counts[key] === undefined ? '—' : `${toFa(counts[key])} مورد`}
              </p>
            </Link>
          );
        })}
      </div>

      {stats?.available ? (
        <section className="card p-6">
          <div className="mb-4 flex items-center justify-between gap-3">
            <h2 className="text-[15px] font-bold">آمار بازدید</h2>
            <Link href="/admin/analytics" className="text-[13px] font-semibold text-sage-700 hover:text-sage-900">
              گزارش کامل
            </Link>
          </div>
          <div className="grid gap-4 sm:grid-cols-3">
            {[
              { label: 'بازدید امروز', v: stats.today.views, s: `${toFa(stats.today.visitors)} نفر` },
              { label: '۷ روز گذشته', v: stats.week.views, s: `${toFa(stats.week.visitors)} نفر` },
              { label: '۳۰ روز گذشته', v: stats.total.views, s: `${toFa(stats.total.visitors)} نفر` },
            ].map((b) => (
              <div key={b.label} className="rounded-xl bg-[#FAF8F5] p-4">
                <span className="mb-1 block text-[12px] text-ink-muted">{b.label}</span>
                <strong className="text-xl font-extrabold">{toFa(b.v)}</strong>
                <span className="mr-2 text-[12px] text-ink-muted">{b.s}</span>
              </div>
            ))}
          </div>
        </section>
      ) : null}

      <section className="card p-6">
        <h2 className="mb-2 text-[15px] font-bold">به‌روزرسانی دستی کش سایت</h2>
        <p className="mb-4 max-w-2xl text-[13px] leading-7 text-ink-muted">
          صفحات سایت برای سرعت و سئو به‌صورت استاتیک سرو می‌شوند. بعد از هر ذخیره، صفحات مرتبط
          خودکار بازسازی می‌شوند؛ این دکمه برای مواقعی است که مستقیم در دیتابیس تغییری داده‌اید.
        </p>
        <RevalidateButton />
      </section>

      <section className="card p-6">
        <h2 className="mb-3 text-[15px] font-bold">نکات سئو هنگام افزودن محتوا</h2>
        <ul className="space-y-2.5 text-[13px] leading-7 text-ink-soft">
          {[
            'اسلاگ را بعد از انتشار تغییر ندهید؛ اگر مجبور شدید، ریدایرکت ۳۰۱ در next.config.mjs اضافه کنید.',
            'خلاصه هر آیتم را واقعی و یکتا بنویسید — همین متن در نتایج گوگل نمایش داده می‌شود.',
            'برای هر محصول حداقل دو پاراگراف توضیح بنویسید؛ صفحات کم‌محتوا ایندکس نمی‌شوند.',
            'سوالات متداول دسته‌بندی‌ها با Schema مخصوص در نتایج گوگل نمایش داده می‌شود.',
            'در مقالات، به صفحات محصول و دسته لینک بدهید؛ لینک داخلی مؤثرترین ابزار سئوی رایگان است.',
          ].map((t) => (
            <li key={t} className="flex items-start gap-2">
              <Icon name="check" className="mt-1.5 h-4 w-4 shrink-0 text-sage-600" />
              {t}
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
