import Link from 'next/link';
import Breadcrumbs from '@/components/Breadcrumbs';
import Faq from '@/components/Faq';
import CallCta from '@/components/CallCta';
import JsonLd from '@/components/JsonLd';
import Icon from '@/components/Icons';
import { getSettings } from '@/lib/queries';
import { abs, breadcrumbSchema, buildMetadata, faqSchema } from '@/lib/seo';
import { telHref } from '@/lib/site';
import { toFa } from '@/lib/utils';

export const revalidate = 86400;

const OFFICIAL_URL = 'https://beheshtezahra.tehran.ir/default.aspx?tabid=92';

// عنوان و توضیحات دقیقاً با زبان جستجوی کاربر هماهنگ شده‌اند: «نام خانوادگی»،
// «رایگان» و «قطعه و ردیف» پرتکرارترین کلماتی هستند که کاربران تایپ می‌کنند.
export const metadata = buildMetadata({
  title: 'جستجوی متوفی بهشت زهرا با نام خانوادگی — رایگان',
  description:
    'با نام خانوادگی، قطعه و ردیف و شماره قبر متوفی را در بهشت زهرا پیدا کنید. ورود مستقیم به سامانه رسمی، رایگان، همراه با راهنمای خواندن نتیجه و ردیف‌های مکرر.',
  path: '/jostojoye-motevafi',
  keywords: [
    'جستجوی متوفی',
    'جستجوی متوفی با نام خانوادگی',
    'جستجوی متوفی بهشت زهرا',
    'قطعه و ردیف بهشت زهرا',
    'پیدا کردن قبر در بهشت زهرا',
    'سامانه متوفیان بهشت زهرا',
    'شماره قبر بهشت زهرا',
  ],
});

const FAQ = [
  {
    q: 'جستجوی متوفی در بهشت زهرا رایگان است؟',
    a: 'بله. سامانه رسمی جستجوی متوفیان شهرداری تهران کاملاً رایگان است و برای استفاده از آن نیازی به ثبت‌نام یا پرداخت هزینه نیست. اگر سایتی برای این کار از شما پول خواست، به آن اعتماد نکنید.',
  },
  {
    q: 'برای جستجو چه اطلاعاتی لازم است؟',
    a: 'نام و نام خانوادگی متوفی کافی است. اگر نام پدر یا تاریخ تقریبی فوت را هم بدانید، نتایج دقیق‌تر می‌شود — مخصوصاً وقتی نام خانوادگی رایج باشد و چند نتیجه مشابه برگردد.',
  },
  {
    q: 'ردیف ۵۰۲ یا ۶۴۸ یعنی چه؟',
    a: 'در قطعات قدیمی، ردیف‌هایی که با ۵۰۰ و ۶۰۰ شروع می‌شوند «مکرر» هستند و بیرون از محدوده ردیف‌های اصلی قرار دارند. مثلاً ردیف ۵۰۲ یعنی ردیف ۲ مکرر و ردیف ۶۴۸ یعنی ردیف ۱۴۸ مکرر. اگر ردیف را با این شماره‌ها دیدید و پیدایش نکردید، از مأموران راهنمای آرامستان کمک بگیرید.',
  },
  {
    q: 'اسم را جستجو کردم ولی نتیجه‌ای پیدا نشد، چه کنم؟',
    a: 'چند حالت رایج است: املای نام با آنچه در سامانه ثبت شده فرق دارد (مثلاً «رضایی» و «رضائی»)، نام خانوادگی با فاصله یا نیم‌فاصله متفاوت وارد شده، یا متوفی در آرامستان دیگری دفن شده است. نام را با املاهای مختلف و بدون نام کوچک امتحان کنید.',
  },
  {
    q: 'می‌توانم محل قبر را روی نقشه ببینم؟',
    a: 'سامانه رسمی علاوه بر شماره قطعه و ردیف، نقشه آرامستان و مسیرهای دسترسی به قطعات را هم ارائه می‌دهد. برای قطعات بزرگ، بهتر است نقشه را پیش از مراجعه ذخیره کنید.',
  },
];

const STEPS = [
  {
    title: 'ورود به سامانه رسمی',
    text: 'به سامانه جستجوی متوفیان شهرداری تهران بروید. این تنها منبع رسمی و به‌روز اطلاعات دفن در بهشت زهرا (س) است.',
  },
  {
    title: 'وارد کردن نام و نام خانوادگی',
    text: 'نام و نام خانوادگی متوفی را وارد کنید. اگر نام پدر را می‌دانید، آن را هم بنویسید تا نتایج مشابه فیلتر شوند.',
  },
  {
    title: 'وارد کردن کد امنیتی',
    text: 'کد امنیتی (کپچا) را وارد و دکمه جستجو را بزنید. به همین دلیل هیچ سایتی نمی‌تواند این جستجو را به‌صورت خودکار انجام دهد.',
  },
  {
    title: 'خواندن نتیجه',
    text: 'در نتیجه، شماره قطعه، ردیف و شماره قبر نمایش داده می‌شود. این سه عدد را یادداشت کنید؛ برای پیدا کردن مزار و همچنین برای سفارش سنگ مزار لازم می‌شوند.',
  },
];

export default async function DeceasedSearchPage() {
  const s = await getSettings();

  const crumbs = [
    { name: 'خانه', path: '/' },
    { name: 'جستجوی متوفی', path: '/jostojoye-motevafi' },
  ];

  const howTo = {
    '@context': 'https://schema.org',
    '@type': 'HowTo',
    name: 'چطور متوفی را در بهشت زهرا جستجو کنیم',
    description:
      'مراحل پیدا کردن قطعه، ردیف و شماره قبر متوفی در آرامستان بهشت زهرا از طریق سامانه رسمی شهرداری تهران.',
    totalTime: 'PT3M',
    estimatedCost: { '@type': 'MonetaryAmount', currency: 'IRR', value: '0' },
    step: STEPS.map((st, i) => ({
      '@type': 'HowToStep',
      position: i + 1,
      name: st.title,
      text: st.text,
      url: `${abs('/jostojoye-motevafi')}#step-${i + 1}`,
    })),
  };

  return (
    <div className="container pb-16">
      <Breadcrumbs items={crumbs} />

      <header className="mb-8 max-w-3xl">
        <h1 className="mb-4">جستجوی متوفی در بهشت زهرا با نام خانوادگی</h1>
        <div className="prose-fa">
          <p>
            با داشتن فقط <strong>نام و نام خانوادگی</strong> می‌توانید شماره <strong>قطعه</strong>،
            <strong> ردیف</strong> و <strong>شماره قبر</strong> متوفی را پیدا کنید. جستجو در سامانه
            رسمی شهرداری تهران انجام می‌شود و <strong>کاملاً رایگان</strong> است.
          </p>
          <p>
            در ادامه توضیح داده‌ایم چطور جستجو کنید، نتیجه را چطور بخوانید و اگر اسمی پیدا نشد چه
            کار کنید.
          </p>
        </div>
      </header>

      {/* دسترسی به سامانه رسمی */}
      <section className="card mb-10 overflow-hidden" aria-labelledby="official-heading">
        <div className="border-b border-line bg-sage-50 px-6 py-5">
          <h2 id="official-heading" className="mb-1.5 text-[17px]">
            سامانه رسمی جستجوی متوفیان
          </h2>
          <p className="text-[13px] leading-7 text-ink-soft">
            جستجو فقط در سامانه شهرداری تهران انجام می‌شود و به دلیل کد امنیتی، هیچ سایتی نمی‌تواند
            آن را به‌صورت خودکار برای شما انجام دهد. ما هم دیتابیس متوفیان را در اختیار نداریم و
            نگهداری نمی‌کنیم.
          </p>
        </div>

        <div className="flex flex-col gap-4 p-6 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-start gap-3">
            <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-sage-600 text-white">
              <Icon name="search" className="h-6 w-6" />
            </span>
            <div>
              <p className="text-[14px] font-semibold text-ink">بهشت زهرا (س) — شهرداری تهران</p>
              <p className="font-mono text-[12px] text-ink-muted" dir="ltr">
                beheshtezahra.tehran.ir
              </p>
            </div>
          </div>

          <a
            href={OFFICIAL_URL}
            target="_blank"
            rel="noopener noreferrer nofollow"
            className="btn-primary shrink-0"
          >
            ورود به سامانه جستجو
            <Icon name="arrow" className="h-4 w-4 rotate-180" />
          </a>
        </div>
      </section>

      {/* مراحل */}
      <section className="section pt-0" aria-labelledby="steps-heading">
        <h2 id="steps-heading" className="mb-6">
          مراحل جستجو
        </h2>
        <ol className="grid gap-4 sm:grid-cols-2">
          {STEPS.map((st, i) => (
            <li key={st.title} id={`step-${i + 1}`} className="card p-5">
              <span className="mb-3 grid h-9 w-9 place-items-center rounded-lg bg-gold-100 text-[15px] font-extrabold text-gold-600">
                {toFa(i + 1)}
              </span>
              <h3 className="mb-2 text-[15px] font-bold">{st.title}</h3>
              <p className="text-[13px] leading-7 text-ink-muted">{st.text}</p>
            </li>
          ))}
        </ol>
      </section>

      {/* خواندن نتیجه */}
      <section className="section pt-0" aria-labelledby="result-heading">
        <h2 id="result-heading" className="mb-5">
          نتیجه را چطور بخوانیم؟
        </h2>
        <div className="grid gap-8 lg:grid-cols-[1.1fr_.9fr]">
          <div className="prose-fa">
            <p>
              خروجی جستجو معمولاً سه عدد است. <strong>قطعه</strong> بزرگ‌ترین واحد تقسیم‌بندی
              آرامستان است و روی تابلوهای مسیر مشخص شده. <strong>ردیف</strong> جایگاه داخل قطعه را
              نشان می‌دهد و <strong>شماره قبر</strong> محل دقیق را.
            </p>
            <p>
              نکته‌ای که خیلی‌ها را سردرگم می‌کند، ردیف‌های <strong>مکرر</strong> است. در قطعات
              قدیمی، ردیف‌هایی که شماره‌شان با ۵۰۰ یا ۶۰۰ شروع می‌شود، بیرون از محدوده ردیف‌های
              اصلی قرار دارند:
            </p>
            <ul>
              <li>ردیف ۵۰۲ یعنی ردیف ۲ مکرر</li>
              <li>ردیف ۶۴۸ یعنی ردیف ۱۴۸ مکرر</li>
            </ul>
            <p>
              اگر با این شماره‌ها روبه‌رو شدید و در محدوده اصلی قطعه چیزی پیدا نکردید، سراغ
              حاشیه‌های قطعه بروید یا از مأموران راهنمای آرامستان بپرسید.
            </p>
          </div>

          <aside className="card h-fit p-5">
            <h3 className="mb-3 text-[15px]">پیش از مراجعه</h3>
            <ul className="space-y-2.5 text-[13px] leading-7 text-ink-soft">
              {[
                'هر سه عدد قطعه، ردیف و شماره قبر را یادداشت یا اسکرین‌شات کنید',
                'نقشه قطعه را از سامانه ذخیره کنید — آنتن داخل آرامستان همه‌جا خوب نیست',
                'ساعات مراجعه و محدودیت تردد خودرو را در نظر بگیرید',
                'برای سفارش سنگ مزار هم دقیقاً به همین سه عدد نیاز دارید',
              ].map((t) => (
                <li key={t} className="flex items-start gap-2">
                  <Icon name="check" className="mt-1.5 h-4 w-4 shrink-0 text-sage-600" />
                  {t}
                </li>
              ))}
            </ul>
          </aside>
        </div>
      </section>

      {/* کمک */}
      <section className="section pt-0" aria-labelledby="help-heading">
        <div className="rounded-2xl border border-gold-400/40 bg-gold-100/50 p-6 sm:p-8">
          <h2 id="help-heading" className="mb-3 text-[17px]">
            نتیجه‌ای پیدا نکردید؟
          </h2>
          <p className="mb-5 max-w-2xl text-[14px] leading-[2.1] text-ink-soft">
            رایج‌ترین علت، تفاوت املای نام است — «رضایی» و «رضائی»، یا فاصله و نیم‌فاصله در نام
            خانوادگی. نام را با املاهای مختلف و حتی بدون نام کوچک امتحان کنید. اگر باز هم پیدا
            نشد، با ما تماس بگیرید؛ همکاران ما با روال و ساختار قطعات آرامستان آشنا هستند و
            راهنمایی‌تان می‌کنند.
          </p>
          <a href={telHref(s.phone)} className="btn-primary">
            <Icon name="phone" className="h-4 w-4" />
            <span className="font-extrabold tracking-wide">{toFa(s.phone)}</span>
          </a>
        </div>
      </section>

      <Faq items={FAQ} title="سوالات متداول درباره جستجوی متوفی" />

      {/* لینک داخلی به خدمات مرتبط */}
      <section className="section pt-0" aria-labelledby="next-heading">
        <h2 id="next-heading" className="mb-5">
          بعد از پیدا کردن مزار
        </h2>
        <div className="grid gap-4 sm:grid-cols-3">
          {[
            {
              href: '/category/sang-mazar',
              icon: 'stone',
              title: 'سفارش سنگ مزار',
              text: 'با داشتن قطعه و ردیف، می‌توانید سنگ مزار سفارش دهید.',
            },
            {
              href: '/category/gol-va-taj-gol',
              icon: 'flower',
              title: 'تاج گل و گل مزار',
              text: 'تاج گل رو قبری برای سالگرد و زیارت اهل قبور.',
            },
            {
              href: '/blog/rahnamaye-kamel-baraye-bargozari-marasem-tarhim',
              icon: 'print',
              title: 'راهنمای برگزاری مراسم',
              text: 'مراحل اداری، انتخاب سالن و برآورد هزینه.',
            },
          ].map((c) => (
            <Link key={c.href} href={c.href} className="card card-hover p-5">
              <span className="mb-3 grid h-10 w-10 place-items-center rounded-xl bg-sage-50 text-sage-600">
                <Icon name={c.icon} className="h-5 w-5" />
              </span>
              <h3 className="mb-1.5 text-[15px] font-bold">{c.title}</h3>
              <p className="text-[13px] leading-7 text-ink-muted">{c.text}</p>
            </Link>
          ))}
        </div>
      </section>

      <CallCta title="در پیدا کردن مزار کمک لازم دارید؟" />

      <JsonLd data={[breadcrumbSchema(crumbs), howTo, faqSchema(FAQ)]} />
    </div>
  );
}
