import Link from 'next/link';
import Hero from '@/components/Hero';
import SectionHeading from '@/components/SectionHeading';
import CategoryCard from '@/components/CategoryCard';
import ItemCard from '@/components/ItemCard';
import CallCta from '@/components/CallCta';
import Faq from '@/components/Faq';
import JsonLd from '@/components/JsonLd';
import Icon from '@/components/Icons';
import { getCategories, getCategoryCounts, listItems } from '@/lib/queries';
import { buildMetadata, faqSchema, itemListSchema } from '@/lib/seo';
import { siteFaq } from '@/data/seed';
import { site } from '@/lib/site';

export const revalidate = 3600;

export const metadata = buildMetadata({
  title: 'خدمات و محصولات مراسم ترحیم در بهشت زهرا | آمرز',
  description:
    'سفارش تاج گل ترحیم، سنگ مزار، اجاره میز و صندلی، سایبان، پذیرایی، رستوران، مداح و چاپ بنر برای مراسم ترحیم در بهشت زهرا. قیمت شفاف، رزرو تلفنی و پشتیبانی شبانه‌روزی.',
  path: '/',
});

export default async function HomePage() {
  const [categories, counts, products, services] = await Promise.all([
    getCategories(),
    getCategoryCounts(),
    listItems({ type: 'product', pageSize: 8 }),
    listItems({ type: 'service', pageSize: 8 }),
  ]);

  const titleOf = (slug) => categories.find((c) => c.slug === slug)?.shortTitle;

  const steps = [
    {
      icon: 'search',
      title: '۱. انتخاب از سایت',
      text: 'محصول یا خدمت مورد نظرتان را با قیمت مشخص در سایت انتخاب می‌کنید. هیچ قیمتی پنهان نیست.',
    },
    {
      icon: 'phone',
      title: '۲. تماس تلفنی',
      text: 'با آمرز تماس می‌گیرید. کارشناس ما جزئیات، زمان و محل مراسم را نهایی می‌کند.',
    },
    {
      icon: 'check',
      title: '۳. اجرا در روز مراسم',
      text: 'تیم آمرز پیش از شروع مراسم در محل مستقر می‌شود و اجرا را کامل بر عهده می‌گیرد.',
    },
  ];

  const trust = [
    { icon: 'clock', title: 'شبانه‌روزی', text: 'فوت ساعت نمی‌شناسد؛ ما هم همیشه پاسخگوییم.' },
    { icon: 'shield', title: 'قیمت شفاف', text: 'همه قیمت‌ها روی سایت است؛ چانه‌زنی و هزینه پنهان نداریم.' },
    { icon: 'pin', title: 'مستقر در بهشت زهرا', text: 'آشنا با قطعات، سالن‌ها و روال اداری آرامستان.' },
    { icon: 'check', title: 'یک مسئول واحد', text: 'یک هماهنگ‌کننده تا پایان مراسم همراه شماست.' },
  ];

  return (
    <>
      <Hero />

      {/* دسته‌بندی‌ها */}
      <section className="section" aria-labelledby="categories-heading">
        <div className="container">
          <SectionHeading
            as="h2"
            title="دسته‌بندی خدمات و محصولات آمرز"
            subtitle="هر آنچه برای برگزاری یک مراسم آبرومند لازم دارید، در نه دسته"
            href="/categories"
          />
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {categories.map((c) => (
              <CategoryCard key={c.slug} category={c} count={counts[c.slug]} />
            ))}
          </div>
        </div>
      </section>

      {/* محصولات */}
      <section className="section bg-white" aria-labelledby="products-heading">
        <div className="container">
          <SectionHeading
            as="h2"
            title="پرسفارش‌ترین محصولات ترحیم"
            subtitle="گل، سنگ مزار و اقلام چاپی با قیمت روز"
            href="/products"
          />
          <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {products.items.slice(0, 4).map((item, i) => (
              <li key={item.slug}>
                <ItemCard item={item} categoryTitle={titleOf(item.category)} priority={i < 2} />
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* خدمات */}
      <section className="section" aria-labelledby="services-heading">
        <div className="container">
          <SectionHeading
            as="h2"
            title="خدمات اجرایی مراسم"
            subtitle="از صندلی و سایبان تا پذیرایی، رستوران و مداح"
            href="/services"
          />
          <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {services.items.slice(0, 4).map((item) => (
              <li key={item.slug}>
                <ItemCard item={item} categoryTitle={titleOf(item.category)} />
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* مراحل سفارش */}
      <section className="section bg-white" aria-labelledby="how-heading">
        <div className="container">
          <SectionHeading
            as="h2"
            title="سفارش در آمرز چطور انجام می‌شود؟"
            subtitle="بدون پرداخت آنلاین؛ ساده، شفاف و تلفنی"
          />
          <ol className="grid gap-4 md:grid-cols-3">
            {steps.map((s) => (
              <li key={s.title} className="card p-6">
                <span className="mb-4 grid h-11 w-11 place-items-center rounded-xl bg-gold-100 text-gold-600">
                  <Icon name={s.icon} className="h-6 w-6" />
                </span>
                <h3 className="mb-2 text-[15px] font-bold">{s.title}</h3>
                <p className="text-[13px] leading-8 text-ink-muted">{s.text}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* چرا آمرز */}
      <section className="section" aria-labelledby="why-heading">
        <div className="container">
          <SectionHeading as="h2" title="چرا خانواده‌ها آمرز را انتخاب می‌کنند؟" />
          <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {trust.map((t) => (
              <li key={t.title} className="card p-6">
                <span className="mb-4 grid h-11 w-11 place-items-center rounded-xl bg-sage-50 text-sage-600">
                  <Icon name={t.icon} className="h-6 w-6" />
                </span>
                <h3 className="mb-2 text-[15px] font-bold">{t.title}</h3>
                <p className="text-[13px] leading-8 text-ink-muted">{t.text}</p>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* متن سئو — محتوای واقعی و قابل ایندکس */}
      <section className="section bg-white" aria-labelledby="about-heading">
        <div className="container grid gap-10 lg:grid-cols-[1.2fr_.8fr]">
          <div>
            <h2 id="about-heading" className="mb-4">
              خدمات مراسم ترحیم در بهشت زهرا (س)
            </h2>
            <div className="prose-fa">
              <p>
                بهشت زهرا (س) بزرگ‌ترین آرامستان کشور است و روزانه ده‌ها مراسم ترحیم در سالن‌ها و
                قطعات مختلف آن برگزار می‌شود. برگزاری مراسم در این مجموعه، هماهنگی هم‌زمان چند بخش
                را می‌طلبد: گل و تاج گل، صندلی و سایبان، پذیرایی، مداح و اقلام چاپی.
              </p>
              <p>
                تجربه نشان داده خانواده‌ها در روزهای نخست پس از فوت، توان پیگیری جداگانه هر کدام از
                این موارد را ندارند. آمرز دقیقاً برای همین ساخته شده است: یک نقطه تماس واحد که همه
                نیازهای مراسم را با قیمت مشخص و کیفیت کنترل‌شده تأمین می‌کند.
              </p>
              <p>
                قیمت همه محصولات و خدمات روی سایت درج شده است تا پیش از تماس بدانید چه بودجه‌ای لازم
                دارید. سایت آمرز درگاه پرداخت آنلاین ندارد؛ پس از انتخاب، کافی است تماس بگیرید تا
                سفارش شما ثبت و زمان‌بندی شود.
              </p>
              <p>
                خدمات ما شامل تاج گل یک تا سه طبقه، سنگ مزار گرانیت و مرمر با حکاکی لیزری، اجاره میز
                و صندلی، سایبان و سیستم صوتی، پذیرایی خرما و چای و حلوا، رزرو ناهار ترحیم، اعزام
                مداح و قاری، چاپ فوری بنر و کارت ختم و هماهنگی کامل مراحل اداری غسل و کفن و دفن است.
              </p>
            </div>
          </div>

          <aside className="card h-fit p-6">
            <h3 className="mb-4">دسترسی سریع</h3>
            <ul className="space-y-2 text-sm">
              {categories.map((c) => (
                <li key={c.slug}>
                  <Link
                    href={c.href}
                    className="flex items-center justify-between rounded-lg px-3 py-2.5 text-ink-soft hover:bg-sage-50 hover:text-sage-700"
                  >
                    <span className="flex items-center gap-2">
                      <Icon name={c.icon} className="h-4 w-4 text-sage-400" />
                      {c.shortTitle}
                    </span>
                    <Icon name="chevron" className="h-4 w-4 text-line" />
                  </Link>
                </li>
              ))}
            </ul>
          </aside>
        </div>
      </section>

      <div className="container">
        <Faq items={siteFaq} title="سوالات متداول درباره خدمات آمرز" />
        <div className="pb-16">
          <CallCta />
        </div>
      </div>

      <JsonLd
        data={[
          faqSchema(siteFaq),
          itemListSchema(
            categories.map((c) => ({ href: c.href, title: c.title })),
            'دسته‌بندی خدمات و محصولات آمرز'
          ),
        ]}
      />
    </>
  );
}
