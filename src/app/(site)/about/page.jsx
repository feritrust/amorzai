import Breadcrumbs from '@/components/Breadcrumbs';
import CallCta from '@/components/CallCta';
import JsonLd from '@/components/JsonLd';
import Icon from '@/components/Icons';
import { breadcrumbSchema, buildMetadata } from '@/lib/seo';
import { site } from '@/lib/site';

export const revalidate = 86400;

export const metadata = buildMetadata({
  title: 'درباره آمرز — مجموعه خدمات مراسم ترحیم بهشت زهرا',
  description:
    'آمرز مجموعه‌ای متمرکز بر تأمین گل، سنگ مزار، تجهیزات، پذیرایی و خدمات اجرایی مراسم ترحیم در بهشت زهرا است؛ با قیمت شفاف و یک نقطه تماس واحد.',
  path: '/about',
});

export default function AboutPage() {
  const crumbs = [
    { name: 'خانه', path: '/' },
    { name: 'درباره آمرز', path: '/about' },
  ];

  const values = [
    {
      icon: 'shield',
      title: 'قیمت بدون چانه‌زنی',
      text: 'قیمت هر محصول و خدمت روی سایت درج شده است. در روزهای سوگواری، کسی نباید نگران گران‌فروشی باشد.',
    },
    {
      icon: 'clock',
      title: 'در دسترس بودن واقعی',
      text: 'خط پشتیبانی ما شبانه‌روزی است، چون بیشترین تماس‌ها در ساعات نامتعارف شب و سحر گرفته می‌شود.',
    },
    {
      icon: 'check',
      title: 'یک مسئول، نه ده شماره',
      text: 'برای هر مراسم یک هماهنگ‌کننده مشخص تعیین می‌شود که تا پایان کار پاسخگوی خانواده است.',
    },
    {
      icon: 'pin',
      title: 'آشنایی با آرامستان',
      text: 'تیم ما با قطعات، سالن‌ها، مسیرها و روال اداری بهشت زهرا آشناست و وقت شما را تلف نمی‌کند.',
    },
  ];

  return (
    <div className="container pb-16">
      <Breadcrumbs items={crumbs} />

      <header className="mb-10 max-w-3xl">
        <h1 className="mb-4">درباره آمرز</h1>
        <p className="text-[15px] leading-[2.2] text-ink-soft">
          آمرز از یک مشاهده ساده شکل گرفت: خانواده‌ها در سخت‌ترین روزهای زندگی‌شان مجبورند با ده‌ها
          واسطه چانه بزنند و قیمت‌های نامشخص را بپذیرند. ما تصمیم گرفتیم این فرایند را شفاف و
          یک‌مرحله‌ای کنیم.
        </p>
      </header>

      <section className="mb-12 grid gap-10 lg:grid-cols-[1.15fr_.85fr]">
        <div className="prose-fa">
          <h2 className="mb-3">ما چه می‌کنیم</h2>
          <p>
            آمرز یک مارکت‌پلیس تخصصی برای خدمات و محصولات مراسم ترحیم در بهشت زهرا (س) است. ما
            تأمین‌کنندگان گل، سنگ مزار، اجاره تجهیزات، پذیرایی، رستوران، مداحی و چاپ را در یک پلتفرم
            گرد آورده‌ایم و کیفیت و قیمت آن‌ها را کنترل می‌کنیم.
          </p>
          <p>
            کاربران محصول یا خدمت مورد نظرشان را با قیمت مشخص در سایت می‌بینند و برای ثبت سفارش
            تماس می‌گیرند. سایت آمرز عمداً درگاه پرداخت آنلاین ندارد؛ چون تقریباً همیشه پیش از
            نهایی شدن سفارش، یک گفت‌وگوی کوتاه برای هماهنگی زمان، محل و جزئیات لازم است.
          </p>

          <h2 className="mb-3 mt-8">استاندارد کاری ما</h2>
          <p>
            هر تأمین‌کننده‌ای که با آمرز کار می‌کند، پیش از ورود به فهرست بررسی می‌شود: کیفیت
            محصول، خوش‌قولی در زمان تحویل و رفتار محترمانه با خانواده. بازخورد هر مراسم ثبت می‌شود
            و تأمین‌کننده‌ای که چند بار زیر استاندارد عمل کند، از فهرست حذف می‌شود.
          </p>
          <p>
            ما همچنین تلاش می‌کنیم قیمت‌های سایت را متناسب با نوسان بازار به‌روز نگه داریم؛ با این
            حال به دلیل تغییرات روزانه قیمت گل و مواد غذایی، قیمت نهایی هنگام تماس تأیید می‌شود.
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-1">
          {values.map((v) => (
            <div key={v.title} className="card p-5">
              <span className="mb-3 grid h-10 w-10 place-items-center rounded-xl bg-sage-50 text-sage-600">
                <Icon name={v.icon} className="h-5 w-5" />
              </span>
              <h3 className="mb-1.5 text-[15px] font-bold">{v.title}</h3>
              <p className="text-[13px] leading-7 text-ink-muted">{v.text}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="section" aria-labelledby="area-heading">
        <h2 id="area-heading" className="mb-4">
          محدوده فعالیت
        </h2>
        <div className="prose-fa">
          <p>
            تمرکز اصلی آمرز بر بهشت زهرا (س)، سالن‌های تشریفات اطراف آن و مساجد جنوب تهران است.
            برای مراسم در سایر نقاط تهران نیز با هماهنگی قبلی خدمات ارائه می‌شود؛ در این حالت ممکن
            است هزینه حمل جداگانه محاسبه گردد.
          </p>
          <p>
            نشانی دفتر: {site.address.street}، {site.address.city}. ساعات پاسخگویی:{' '}
            {site.openingHours}.
          </p>
        </div>
      </section>

      <CallCta title="سوالی دارید؟ تماس بگیرید" />

      <JsonLd data={breadcrumbSchema(crumbs)} />
    </div>
  );
}
