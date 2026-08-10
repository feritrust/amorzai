import Breadcrumbs from '@/components/Breadcrumbs';
import Faq from '@/components/Faq';
import CallCta from '@/components/CallCta';
import JsonLd from '@/components/JsonLd';
import { getCategories } from '@/lib/queries';
import { breadcrumbSchema, buildMetadata, faqSchema } from '@/lib/seo';
import { siteFaq } from '@/data/seed';

export const revalidate = 86400;

export const metadata = buildMetadata({
  title: 'سوالات متداول درباره مراسم ترحیم و خدمات آمرز',
  description:
    'پاسخ پرتکرارترین سوال‌ها درباره سفارش تاج گل، سنگ مزار، اجاره صندلی، پذیرایی، مداح و نحوه ثبت سفارش تلفنی در آمرز.',
  path: '/faq',
});

export default async function FaqPage() {
  const categories = await getCategories();
  const categoryFaq = categories.flatMap((c) =>
    (c.faq || []).map((f) => ({ ...f, category: c.shortTitle }))
  );
  const all = [...siteFaq, ...categoryFaq];

  const crumbs = [
    { name: 'خانه', path: '/' },
    { name: 'سوالات متداول', path: '/faq' },
  ];

  return (
    <div className="container pb-16">
      <Breadcrumbs items={crumbs} />

      <header className="mb-6 max-w-3xl">
        <h1 className="mb-4">سوالات متداول</h1>
        <p className="text-[15px] leading-[2.2] text-ink-soft">
          پرتکرارترین پرسش‌های خانواده‌ها درباره سفارش خدمات مراسم ترحیم را اینجا جمع کرده‌ایم. اگر
          پاسخ سوال شما اینجا نبود، تماس بگیرید؛ پاسخگویی ما شبانه‌روزی است.
        </p>
      </header>

      <Faq items={siteFaq} title="سوالات عمومی" />

      {categories.map((c) =>
        c.faq?.length ? (
          <Faq key={c.slug} items={c.faq} title={`سوالات ${c.shortTitle}`} />
        ) : null
      )}

      <CallCta />

      <JsonLd data={[breadcrumbSchema(crumbs), faqSchema(all)]} />
    </div>
  );
}
