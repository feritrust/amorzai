import Link from 'next/link';
import { telHref } from '@/lib/site';
import { getSettings } from '@/lib/queries';
import { toFa } from '@/lib/utils';
import Icon from '@/components/Icons';

export default async function Hero() {
  const s = await getSettings();
  const points = [
    'قیمت شفاف و بدون هزینه پنهان',
    'پاسخگویی شبانه‌روزی، ۷ روز هفته',
    'هماهنگ‌کننده اختصاصی برای هر مراسم',
  ];

  return (
    <section className="relative overflow-hidden border-b border-line bg-white">
      {/* پس‌زمینه تزئینی — بدون تأثیر بر LCP */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 opacity-[0.35]"
        style={{
          backgroundImage:
            'radial-gradient(60rem 30rem at 85% -10%, #E1E9E3 0%, transparent 60%), radial-gradient(40rem 24rem at 5% 110%, #F3E9D8 0%, transparent 60%)',
        }}
      />

      <div className="container relative grid gap-10 py-14 lg:grid-cols-[1.1fr_.9fr] lg:items-center lg:py-20">
        <div>
          <span className="chip mb-5">
            <Icon name="pin" className="h-3.5 w-3.5" />
            بهشت زهرا (س) — تهران
          </span>

          <h1 className="mb-5">
            خدمات و محصولات مراسم ترحیم در بهشت زهرا
            <span className="mt-2 block text-lg font-medium text-ink-muted sm:text-xl">
              گل و تاج گل، سنگ مزار، میز و صندلی، سایبان، پذیرایی، رستوران، مداح و چاپ
            </span>
          </h1>

          <p className="mb-7 max-w-prose text-[15px] leading-[2.2] text-ink-soft">
            در روزهای سخت، آخرین چیزی که باید نگرانش باشید هماهنگی ده‌ها مجموعه مختلف است. آمرز همه
            نیازهای مراسم ترحیم را در یک جا و با قیمت مشخص جمع کرده است؛ شما انتخاب می‌کنید، ما
            اجرا می‌کنیم.
          </p>

          <ul className="mb-8 grid gap-2.5 sm:grid-cols-3">
            {points.map((p) => (
              <li key={p} className="flex items-start gap-2 text-[13px] text-ink-soft">
                <Icon name="check" className="mt-1 h-4 w-4 shrink-0 text-sage-600" />
                {p}
              </li>
            ))}
          </ul>

          <div className="flex flex-col gap-3 sm:flex-row">
            <a href={telHref(s.phone)} className="btn-primary">
              <Icon name="phone" className="h-4 w-4" />
              تماس و رزرو: <span className="font-extrabold">{toFa(s.phone)}</span>
            </a>
            <Link href="/categories" className="btn-outline">
              مشاهده همه خدمات و قیمت‌ها
            </Link>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3 sm:gap-4">
          {[
            { icon: 'flower', title: 'تاج گل ترحیم', desc: 'تحویل کمتر از ۳ ساعت', href: '/category/gol-va-taj-gol' },
            { icon: 'stone', title: 'سنگ مزار', desc: 'حکاکی لیزری و نصب', href: '/category/sang-mazar' },
            { icon: 'chair', title: 'میز و صندلی', desc: 'چیدمان رایگان', href: '/category/miz-va-sandali' },
            { icon: 'tea', title: 'پذیرایی مجلس', desc: 'محاسبه به‌ازای هر نفر', href: '/category/pazirayi' },
          ].map((b) => (
            <Link key={b.href} href={b.href} className="card card-hover p-5">
              <span className="mb-3 grid h-11 w-11 place-items-center rounded-xl bg-sage-50 text-sage-600">
                <Icon name={b.icon} className="h-6 w-6" />
              </span>
              <h2 className="mb-1 text-[15px] font-bold">{b.title}</h2>
              <p className="text-xs text-ink-muted">{b.desc}</p>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
