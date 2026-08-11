import Link from 'next/link';
import { getAnalytics } from '@/lib/analytics';
import StatsChart from '@/components/admin/StatsChart';
import ExcludeMeToggle from '@/components/admin/ExcludeMeToggle';
import { toFa } from '@/lib/utils';

export const dynamic = 'force-dynamic';

const RANGES = [
  { value: 7, label: '۷ روز' },
  { value: 30, label: '۳۰ روز' },
  { value: 90, label: '۹۰ روز' },
];

const DEVICE_LABELS = { mobile: 'موبایل', tablet: 'تبلت', desktop: 'دسکتاپ' };

function Stat({ label, value, sub }) {
  return (
    <div className="card p-5">
      <span className="mb-1.5 block text-[12px] text-ink-muted">{label}</span>
      <strong className="block text-2xl font-extrabold text-ink">{toFa(value)}</strong>
      {sub ? <span className="mt-1 block text-[12px] text-ink-muted">{sub}</span> : null}
    </div>
  );
}

export default async function AnalyticsPage({ searchParams }) {
  const sp = await searchParams;
  const range = [7, 30, 90].includes(Number(sp?.range)) ? Number(sp.range) : 30;
  const data = await getAnalytics({ range });

  if (!data.available) {
    return (
      <div className="space-y-4">
        <h1 className="text-xl font-extrabold">آمار بازدید</h1>
        <p className="rounded-xl bg-gold-100 px-4 py-3 text-[13px] text-gold-600">{data.reason}</p>
      </div>
    );
  }

  const maxPage = Math.max(1, ...data.topPages.map((p) => p.views));
  const totalDevices = data.devices.reduce((a, d) => a + d.views, 0) || 1;

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="mb-1 text-xl font-extrabold">آمار بازدید</h1>
          <p className="text-[13px] text-ink-muted">
            بدون کوکی و بدون سرویس خارجی؛ ربات‌ها و بازدیدهای پنل شمارش نمی‌شوند.
          </p>
        </div>

        <nav aria-label="بازه زمانی" className="flex gap-1.5">
          {RANGES.map((r) => (
            <Link
              key={r.value}
              href={`/admin/analytics?range=${r.value}`}
              className={`rounded-lg border px-3.5 py-2 text-[13px] ${
                range === r.value
                  ? 'border-sage-600 bg-sage-600 text-white'
                  : 'border-line bg-white hover:border-sage-400'
              }`}
            >
              {r.label}
            </Link>
          ))}
        </nav>
      </header>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Stat label="بازدید امروز" value={data.today.views} sub={`${toFa(data.today.visitors)} بازدیدکننده یکتا`} />
        <Stat
          label="۷ روز گذشته"
          value={data.week.views}
          sub={
            data.growth === null
              ? `${toFa(data.week.visitors)} بازدیدکننده`
              : `${data.growth >= 0 ? '▲' : '▼'} ${toFa(Math.abs(data.growth))}٪ نسبت به هفته قبل`
          }
        />
        <Stat
          label={`${toFa(range)} روز گذشته`}
          value={data.total.views}
          sub={`${toFa(data.total.visitors)} بازدیدکننده یکتا`}
        />
        <Stat label="کل بازدیدهای ثبت‌شده" value={data.allTime} sub="داده خام تا ۱۸۰ روز نگهداری می‌شود" />
      </div>

      <section className="card p-5">
        <h2 className="mb-4 text-[15px] font-bold">روند بازدید</h2>
        <StatsChart series={data.series} />
      </section>

      <div className="grid gap-4 lg:grid-cols-2">
        <section className="card overflow-hidden">
          <h2 className="border-b border-line px-5 py-3.5 text-[15px] font-bold">پربازدیدترین صفحات</h2>
          {data.topPages.length ? (
            <ul className="divide-y divide-line/70">
              {data.topPages.map((p) => (
                <li key={p.path} className="relative px-5 py-3">
                  <span
                    aria-hidden="true"
                    className="absolute inset-y-0 right-0 bg-sage-50"
                    style={{ width: `${(p.views / maxPage) * 100}%` }}
                  />
                  <span className="relative flex items-center justify-between gap-3">
                    <Link
                      href={p.path}
                      target="_blank"
                      className="truncate font-mono text-[12px] text-ink-soft hover:text-sage-700"
                      dir="ltr"
                    >
                      {p.path}
                    </Link>
                    <span className="shrink-0 text-[13px] font-semibold">
                      {toFa(p.views)}
                      <span className="mr-1 text-[11px] font-normal text-ink-muted">
                        ({toFa(p.visitors)} نفر)
                      </span>
                    </span>
                  </span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="p-8 text-center text-[13px] text-ink-muted">هنوز بازدیدی ثبت نشده است.</p>
          )}
        </section>

        <div className="space-y-4">
          <section className="card overflow-hidden">
            <h2 className="border-b border-line px-5 py-3.5 text-[15px] font-bold">منابع ورودی</h2>
            {data.referrers.length ? (
              <ul className="divide-y divide-line/70">
                {data.referrers.map((r) => (
                  <li key={r.source} className="flex items-center justify-between px-5 py-3 text-[13px]">
                    <span dir="ltr" className="truncate font-mono text-[12px] text-ink-soft">
                      {r.source}
                    </span>
                    <span className="shrink-0 font-semibold">{toFa(r.views)}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="p-6 text-center text-[13px] text-ink-muted">
                ورودی از سایت دیگری ثبت نشده است. وقتی گوگل شروع به فرستادن بازدید کند،
                <span dir="ltr" className="mx-1 font-mono">google.com</span>
                اینجا دیده می‌شود.
              </p>
            )}
          </section>

          <section className="card overflow-hidden">
            <h2 className="border-b border-line px-5 py-3.5 text-[15px] font-bold">دستگاه بازدیدکننده</h2>
            {data.devices.length ? (
              <ul className="space-y-3 p-5">
                {data.devices.map((d) => {
                  const pct = Math.round((d.views / totalDevices) * 100);
                  return (
                    <li key={d.device}>
                      <div className="mb-1.5 flex items-center justify-between text-[13px]">
                        <span>{DEVICE_LABELS[d.device] || d.device}</span>
                        <span className="text-ink-muted">
                          {toFa(pct)}٪ — {toFa(d.views)}
                        </span>
                      </div>
                      <div className="h-2 overflow-hidden rounded-full bg-line/60">
                        <div className="h-full rounded-full bg-sage-600" style={{ width: `${pct}%` }} />
                      </div>
                    </li>
                  );
                })}
              </ul>
            ) : (
              <p className="p-6 text-center text-[13px] text-ink-muted">داده‌ای موجود نیست.</p>
            )}
          </section>
        </div>
      </div>

      <section className="card p-5">
        <h2 className="mb-2 text-[15px] font-bold">بازدیدهای خودم شمارش نشود</h2>
        <p className="mb-4 max-w-2xl text-[13px] leading-7 text-ink-muted">
          با فعال کردن این گزینه، در همین مرورگر یک نشانه ذخیره می‌شود و بازدیدهای شما از سایت در
          آمار ثبت نمی‌شوند. روی هر مرورگر و دستگاه باید جداگانه فعال شود.
        </p>
        <ExcludeMeToggle />
      </section>
    </div>
  );
}
