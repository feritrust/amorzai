import Link from 'next/link';
import Breadcrumbs from '@/components/Breadcrumbs';
import ItemCard from '@/components/ItemCard';
import Faq from '@/components/Faq';
import JsonLd from '@/components/JsonLd';
import Icon from '@/components/Icons';
import { getCategory, getSettings, listItems } from '@/lib/queries';
import { abs, breadcrumbSchema, buildMetadata, faqSchema, itemListSchema } from '@/lib/seo';
import { telHref, waHref } from '@/lib/site';
import { toFa } from '@/lib/utils';

export const revalidate = 3600;

export const metadata = buildMetadata({
  title: 'خدمات نیابتی بهشت زهرا برای ایرانیان خارج از کشور',
  description:
    'گلگذاری سر مزار، قرائت فاتحه و برگزاری سالگرد به نیابت از شما در بهشت زهرا، همراه با عکس و فیلم تاریخ‌دار از لحظه انجام. هماهنگی در واتساپ و تلگرام.',
  path: '/niabat',
  keywords: [
    'خدمات نیابتی بهشت زهرا',
    'گلگذاری سر مزار به نیابت',
    'مراسم سالگرد بدون حضور خانواده',
    'خدمات مزار برای ایرانیان خارج از کشور',
    'قرائت فاتحه به نیابت',
  ],
});

const STEPS = [
  {
    title: 'پیام می‌دهید',
    text: 'در واتساپ یا تلگرام نام متوفی و شماره قطعه و ردیف را می‌فرستید. شماره قطعه را نمی‌دانید؟ با نام و تاریخ تقریبی فوت خودمان پیدا می‌کنیم.',
  },
  {
    title: 'جزئیات را توافق می‌کنیم',
    text: 'نوع خدمت، روز و ساعت، متن کارت یا نام بانی، و روش پرداخت را در همان گفتگو نهایی می‌کنیم.',
  },
  {
    title: 'کار انجام می‌شود',
    text: 'در روز و ساعت توافق‌شده به مزار می‌رویم و کار را انجام می‌دهیم؛ گلگذاری، قرائت فاتحه یا مراسم کامل.',
  },
  {
    title: 'عکس و فیلم می‌گیرید',
    text: 'همان روز، عکس و فیلم تاریخ‌دار برایتان ارسال می‌شود؛ طوری که سنگ مزار و نام متوفی در تصویر خوانا باشد.',
  },
];

const TRUST = [
  {
    icon: 'check',
    title: 'تصویر تاریخ‌دار',
    text: 'عکس و فیلم با تاریخ ثبت‌شده روی فایل، نه تصویر آرشیوی. سنگ مزار و نام متوفی در کادر دیده می‌شود.',
  },
  {
    icon: 'clock',
    title: 'تماس تصویری زنده',
    text: 'اگر بخواهید، هنگام انجام کار تماس تصویری برقرار می‌کنیم تا خودتان زنده ببینید.',
  },
  {
    icon: 'shield',
    title: 'یک نفر پاسخگو',
    text: 'از اولین پیام تا ارسال تصاویر، با یک نفر مشخص طرف هستید؛ نه هر بار با یک اپراتور تازه.',
  },
  {
    icon: 'pin',
    title: 'آشنا با آرامستان',
    text: 'تیم ما با قطعات، ردیف‌های مکرر و روال اداری بهشت زهرا آشناست و وقت شما را تلف نمی‌کند.',
  },
];

const FAQ = [
  {
    q: 'از خارج از کشور چطور سفارش بدهم؟',
    a: 'کافی است در واتساپ یا تلگرام پیام بدهید. نام متوفی و شماره قطعه و ردیف را بفرستید و بقیه هماهنگی در همان گفتگو انجام می‌شود. نیازی به ثبت‌نام یا پرداخت آنلاین نیست.',
  },
  {
    q: 'شماره قطعه و ردیف را نمی‌دانم.',
    a: 'مشکلی نیست. نام و نام خانوادگی متوفی و تاریخ تقریبی فوت را بفرستید تا محل دفن را پیدا کنیم و به شما اطلاع بدهیم. این کار رایگان است.',
  },
  {
    q: 'از کجا مطمئن شوم کار واقعاً انجام شده؟',
    a: 'از لحظه انجام کار عکس و فیلم می‌گیریم و همان روز ارسال می‌کنیم. تصاویر طوری گرفته می‌شود که سنگ مزار و نام متوفی خوانا باشد و تاریخ روی فایل ثبت شده باشد. در صورت درخواست، تماس تصویری زنده هم برقرار می‌کنیم.',
  },
  {
    q: 'پرداخت از خارج از کشور چطور انجام می‌شود؟',
    a: 'روش پرداخت را در همان گفتگو با هم هماهنگ می‌کنیم و متناسب با کشور محل زندگی شما ساده‌ترین راه را پیشنهاد می‌دهیم.',
  },
  {
    q: 'می‌توانم برای سالگرد از قبل رزرو کنم؟',
    a: 'بله و توصیه هم می‌کنیم. تاریخ سالگرد را بفرستید تا در تقویم ثبت شود؛ چند روز قبل خودمان یادآوری می‌کنیم و هماهنگی نهایی را انجام می‌دهیم.',
  },
  {
    q: 'اختلاف ساعت مشکلی ایجاد می‌کند؟',
    a: 'خیر. پیام شما در هر ساعتی که باشد ثبت می‌شود و پاسخ می‌گیرید. زمان انجام کار هم بر اساس ساعت ایران هماهنگ می‌شود و نیازی به بیدار ماندن شما نیست.',
  },
];

export default async function NiabatPage() {
  const [s, category, { items }] = await Promise.all([
    getSettings(),
    getCategory('niabat'),
    listItems({ category: 'niabat', pageSize: 12 }),
  ]);

  const waMessage = 'سلام. برای خدمات نیابتی سر مزار در بهشت زهرا راهنمایی می‌خواستم.';
  const wa = waHref(s.social?.whatsapp || s.mobile, waMessage);

  const crumbs = [
    { name: 'خانه', path: '/' },
    { name: 'خدمات نیابتی', path: '/niabat' },
  ];

  const serviceSchema = {
    '@context': 'https://schema.org',
    '@type': 'Service',
    '@id': `${abs('/niabat')}#service`,
    name: 'خدمات نیابتی بهشت زهرا',
    serviceType: 'انجام امور مزار به نیابت',
    description:
      'گلگذاری سر مزار، قرائت فاتحه و برگزاری مراسم سالگرد به نیابت از خانواده‌های ساکن خارج از کشور در آرامستان بهشت زهرا، همراه با ارسال عکس و فیلم.',
    provider: { '@id': `${abs('')}/#organization` },
    areaServed: { '@type': 'Place', name: 'بهشت زهرا (س)، تهران' },
    audience: { '@type': 'Audience', audienceType: 'ایرانیان مقیم خارج از کشور' },
    availableChannel: {
      '@type': 'ServiceChannel',
      servicePhone: `+98${String(s.phone).replace(/^0/, '')}`,
      serviceUrl: abs('/niabat'),
    },
  };

  return (
    <div className="container pb-16">
      <Breadcrumbs items={crumbs} />

      {/* معرفی */}
      <header className="mb-10 max-w-3xl">
        <span className="chip mb-4">
          <Icon name="pin" className="h-3.5 w-3.5" />
          برای ایرانیان خارج از کشور
        </span>
        <h1 className="mb-4">خدمات نیابتی بهشت زهرا</h1>
        <div className="prose-fa">
          <p>
            سالگرد می‌رسد، نوروز می‌شود، یا فقط دلتان تنگ شده — و هزاران کیلومتر فاصله اجازه
            نمی‌دهد سر مزار بروید. این سخت‌ترین بخش دور بودن است.
          </p>
          <p>
            آمرز به نیابت از شما به مزار می‌رود: گل می‌گذارد، فاتحه می‌خواند، یا مراسم سالگرد را
            کامل برگزار می‌کند. و از لحظه انجام کار، <strong>عکس و فیلم تاریخ‌دار</strong> برایتان
            می‌فرستد تا مطمئن باشید انجام شده.
          </p>
        </div>

        <div className="mt-7 flex flex-col gap-3 sm:flex-row">
          {wa ? (
            <a href={wa} target="_blank" rel="noopener noreferrer" className="btn-primary">
              <Icon name="phone" className="h-4 w-4" />
              پیام در واتساپ
            </a>
          ) : null}
          {s.social?.telegram ? (
            <a href={s.social.telegram} target="_blank" rel="noopener noreferrer" className="btn-outline">
              تلگرام
            </a>
          ) : null}
          <a href={telHref(s.phone)} className="btn-outline">
            {toFa(s.phone)}
          </a>
        </div>
        <p className="mt-3 text-[12px] text-ink-muted">
          در هر ساعتی از شبانه‌روز پیام بدهید؛ اختلاف ساعت مشکلی ایجاد نمی‌کند.
        </p>
      </header>

      {/* خدمات */}
      {items.length ? (
        <section className="section pt-0" aria-labelledby="services-heading">
          <h2 id="services-heading" className="mb-6">
            چه کارهایی به نیابت انجام می‌دهیم؟
          </h2>
          <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {items.map((item, i) => (
              <li key={item.slug}>
                <ItemCard item={item} categoryTitle="خدمات نیابتی" priority={i < 3} />
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      {/* مراحل */}
      <section className="section pt-0" aria-labelledby="steps-heading">
        <h2 id="steps-heading" className="mb-6">
          چطور انجام می‌شود؟
        </h2>
        <ol className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {STEPS.map((st, i) => (
            <li key={st.title} className="card p-5">
              <span className="mb-3 grid h-9 w-9 place-items-center rounded-lg bg-gold-100 text-[15px] font-extrabold text-gold-600">
                {toFa(i + 1)}
              </span>
              <h3 className="mb-2 text-[15px] font-bold">{st.title}</h3>
              <p className="text-[13px] leading-7 text-ink-muted">{st.text}</p>
            </li>
          ))}
        </ol>
      </section>

      {/* اعتماد */}
      <section className="section pt-0" aria-labelledby="trust-heading">
        <div className="rounded-2xl bg-sage-900 p-6 text-white sm:p-9">
          <h2 id="trust-heading" className="mb-2 text-white">
            از راه دور، چطور مطمئن باشم؟
          </h2>
          <p className="mb-7 max-w-2xl text-[14px] leading-[2.1] text-sage-100">
            این مهم‌ترین سوال است و حق دارید بپرسید. کسی که از راه دور پول می‌دهد، هیچ راهی برای
            بررسی ندارد — پس اثبات انجام کار بخشی از خود خدمت است، نه یک لطف اضافه.
          </p>
          <ul className="grid gap-5 sm:grid-cols-2">
            {TRUST.map((t) => (
              <li key={t.title} className="flex items-start gap-3">
                <span className="mt-0.5 grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-white/10 text-gold-400">
                  <Icon name={t.icon} className="h-5 w-5" />
                </span>
                <span>
                  <span className="mb-1 block text-[14px] font-bold text-white">{t.title}</span>
                  <span className="block text-[13px] leading-7 text-sage-100">{t.text}</span>
                </span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* متن سئو */}
      {category?.description?.length ? (
        <section className="section pt-0" aria-labelledby="about-heading">
          <h2 id="about-heading" className="mb-4">
            درباره خدمات نیابتی آمرز
          </h2>
          <div className="prose-fa">
            {category.description.map((p, i) => (
              <p key={i}>{p}</p>
            ))}
          </div>
        </section>
      ) : null}

      <Faq items={FAQ} title="سوالات متداول خدمات نیابتی" />

      {/* دعوت پایانی */}
      <section className="rounded-2xl border border-gold-400/40 bg-gold-100/50 p-6 sm:p-8" aria-labelledby="cta-heading">
        <h2 id="cta-heading" className="mb-3 text-[17px]">
          همین حالا پیام بدهید
        </h2>
        <p className="mb-5 max-w-2xl text-[14px] leading-[2.1] text-ink-soft">
          لازم نیست از قبل چیزی بدانید. فقط نام متوفی را بفرستید؛ بقیه‌اش را با هم پیش می‌بریم.
          اگر تاریخ سالگرد نزدیک است، از قبل رزرو کنید تا در روز مورد نظر انجام شود.
        </p>
        <div className="flex flex-col gap-3 sm:flex-row">
          {wa ? (
            <a href={wa} target="_blank" rel="noopener noreferrer" className="btn-primary">
              <Icon name="phone" className="h-4 w-4" />
              شروع گفتگو در واتساپ
            </a>
          ) : null}
          <Link href="/jostojoye-motevafi" className="btn-outline">
            پیدا کردن قطعه و ردیف مزار
          </Link>
        </div>
      </section>

      <JsonLd
        data={[
          breadcrumbSchema(crumbs),
          serviceSchema,
          itemListSchema(items, 'خدمات نیابتی بهشت زهرا'),
          faqSchema(FAQ),
        ]}
      />
    </div>
  );
}
