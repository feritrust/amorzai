import Breadcrumbs from '@/components/Breadcrumbs';
import CategoryCard from '@/components/CategoryCard';
import CallCta from '@/components/CallCta';
import JsonLd from '@/components/JsonLd';
import { getCategories, getCategoryCounts } from '@/lib/queries';
import { breadcrumbSchema, buildMetadata, collectionPageSchema, itemListSchema } from '@/lib/seo';

export const revalidate = 3600;

export const metadata = buildMetadata({
  title: 'همه دسته‌بندی‌های خدمات و محصولات مراسم ترحیم',
  description:
    'فهرست کامل دسته‌بندی‌های آمرز: گل و تاج گل، سنگ مزار، چاپ، میز و صندلی، سایبان، پذیرایی، رستوران، مداح و سایر خدمات مراسم ترحیم در بهشت زهرا.',
  path: '/categories',
});

export default async function CategoriesPage() {
  const [categories, counts] = await Promise.all([getCategories(), getCategoryCounts()]);
  const productCats = categories.filter((c) => c.kind === 'product');
  const serviceCats = categories.filter((c) => c.kind === 'service');

  const crumbs = [
    { name: 'خانه', path: '/' },
    { name: 'دسته‌بندی‌ها', path: '/categories' },
  ];

  return (
    <div className="container pb-16">
      <Breadcrumbs items={crumbs} />

      <header className="mb-10 max-w-3xl">
        <h1 className="mb-3">دسته‌بندی خدمات و محصولات مراسم ترحیم</h1>
        <div className="prose-fa">
          <p>
            آمرز خدمات و محصولات مراسم ترحیم را در نه دسته اصلی سازمان‌دهی کرده است تا انتخاب برای
            شما ساده‌تر باشد. سه دسته نخست مربوط به کالاهای فیزیکی است و شش دسته دیگر خدمات اجرایی
            روز مراسم را پوشش می‌دهد.
          </p>
          <p>
            روی هر دسته کلیک کنید تا فهرست کامل موارد آن دسته را همراه با قیمت، توضیحات و شرایط
            اجرا ببینید.
          </p>
        </div>
      </header>

      <section className="mb-12" aria-labelledby="product-cats">
        <h2 id="product-cats" className="mb-5">
          محصولات
        </h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {productCats.map((c) => (
            <CategoryCard key={c.slug} category={c} count={counts[c.slug]} />
          ))}
        </div>
      </section>

      <section className="mb-12" aria-labelledby="service-cats">
        <h2 id="service-cats" className="mb-5">
          خدمات
        </h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {serviceCats.map((c) => (
            <CategoryCard key={c.slug} category={c} count={counts[c.slug]} />
          ))}
        </div>
      </section>

      <CallCta />

      <JsonLd
        data={[
          breadcrumbSchema(crumbs),
          collectionPageSchema({
            name: 'دسته‌بندی خدمات و محصولات مراسم ترحیم',
            description: 'فهرست کامل دسته‌بندی‌های آمرز برای مراسم ترحیم در بهشت زهرا',
            path: '/categories',
          }),
          itemListSchema(
            categories.map((c) => ({ href: c.href, title: c.title })),
            'دسته‌بندی‌های آمرز'
          ),
        ]}
      />
    </div>
  );
}
