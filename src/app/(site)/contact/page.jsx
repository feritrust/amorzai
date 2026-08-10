import Breadcrumbs from '@/components/Breadcrumbs';
import JsonLd from '@/components/JsonLd';
import Icon from '@/components/Icons';
import { abs, breadcrumbSchema, buildMetadata, organizationSchema } from '@/lib/seo';
import { site, telHref } from '@/lib/site';
import { toFa } from '@/lib/utils';

export const revalidate = 86400;

export const metadata = buildMetadata({
  title: 'تماس با آمرز — رزرو تلفنی خدمات مراسم ترحیم',
  description:
    'شماره تماس، نشانی و ساعات پاسخگویی آمرز برای رزرو تاج گل، سنگ مزار، صندلی، پذیرایی و سایر خدمات مراسم ترحیم در بهشت زهرا. پشتیبانی شبانه‌روزی.',
  path: '/contact',
});

export default function ContactPage() {
  const crumbs = [
    { name: 'خانه', path: '/' },
    { name: 'تماس با ما', path: '/contact' },
  ];

  const items = [
    { icon: 'phone', label: 'تلفن ثابت', value: toFa(site.phone), href: telHref(site.phone) },
    { icon: 'phone', label: 'موبایل و واتساپ', value: toFa(site.mobile), href: telHref(site.mobile) },
    { icon: 'pin', label: 'نشانی', value: `${site.address.street}، ${site.address.city}` },
    { icon: 'clock', label: 'ساعات پاسخگویی', value: site.openingHours },
  ];

  return (
    <div className="container pb-16">
      <Breadcrumbs items={crumbs} />

      <header className="mb-10 max-w-3xl">
        <h1 className="mb-4">تماس با آمرز</h1>
        <p className="text-[15px] leading-[2.2] text-ink-soft">
          ثبت سفارش در آمرز فقط تلفنی انجام می‌شود. کافی است محصول یا خدمت مورد نظرتان را از سایت
          انتخاب کنید و تماس بگیرید؛ بقیه کار با ماست. اگر هنوز مطمئن نیستید به چه چیزهایی نیاز
          دارید، همین حالا تماس بگیرید تا کارشناس ما فهرست کاملی متناسب با نوع مراسم و تعداد
          میهمانان برایتان تنظیم کند.
        </p>
      </header>

      <div className="grid gap-4 sm:grid-cols-2">
        {items.map((it) => {
          const inner = (
            <>
              <span className="mb-3 grid h-11 w-11 place-items-center rounded-xl bg-sage-50 text-sage-600">
                <Icon name={it.icon} className="h-5 w-5" />
              </span>
              <span className="mb-1 block text-xs text-ink-muted">{it.label}</span>
              <strong className="block text-[15px] font-bold text-ink">{it.value}</strong>
            </>
          );
          return it.href ? (
            <a key={it.label} href={it.href} className="card card-hover block p-6">
              {inner}
            </a>
          ) : (
            <div key={it.label} className="card p-6">
              {inner}
            </div>
          );
        })}
      </div>

      <section className="section" aria-labelledby="note-heading">
        <h2 id="note-heading" className="mb-4">
          پیش از تماس، این موارد را آماده داشته باشید
        </h2>
        <ul className="grid gap-2.5 sm:grid-cols-2">
          {[
            'تاریخ و ساعت تقریبی مراسم',
            'محل برگزاری (سالن یا قطعه در بهشت زهرا)',
            'تعداد تقریبی میهمانان',
            'فهرست اقلام مورد نظر و بودجه تقریبی',
          ].map((t) => (
            <li key={t} className="flex items-start gap-2 text-[14px] leading-8 text-ink-soft">
              <Icon name="check" className="mt-1.5 h-4 w-4 shrink-0 text-sage-600" />
              {t}
            </li>
          ))}
        </ul>
        <p className="mt-5 text-[13px] leading-8 text-ink-muted">
          اگر این اطلاعات را در دسترس ندارید هم اشکالی ندارد؛ تماس بگیرید و کارشناس ما گام‌به‌گام
          راهنمایی‌تان می‌کند.
        </p>
      </section>

      <JsonLd
        data={[
          breadcrumbSchema(crumbs),
          organizationSchema(),
          {
            '@context': 'https://schema.org',
            '@type': 'ContactPage',
            name: 'تماس با آمرز',
            url: abs('/contact'),
            inLanguage: 'fa-IR',
          },
        ]}
      />
    </div>
  );
}
