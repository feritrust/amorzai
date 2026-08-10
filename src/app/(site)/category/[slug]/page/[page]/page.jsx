import { notFound } from 'next/navigation';
import CatalogView from '@/components/CatalogView';
import { getCategories, getCategory, listItems } from '@/lib/queries';
import { buildMetadata } from '@/lib/seo';
import { clamp, toFa } from '@/lib/utils';

export const revalidate = 3600;
// dynamicParams پیش‌فرض true است: آیتم جدیدی که از پنل اضافه شود بدون بیلد مجدد در دسترس است
// و اسلاگ ناشناس هم ۴۰۴ واقعی می‌گیرد (به شرط نبودن loading.jsx در ریشه)

export async function generateStaticParams() {
  const categories = await getCategories();
  const params = [];
  for (const c of categories) {
    const { totalPages } = await listItems({ category: c.slug });
    for (let n = 2; n <= totalPages; n += 1) params.push({ slug: c.slug, page: String(n) });
  }
  return params;
}

export async function generateMetadata({ params }) {
  const { slug, page } = await params;
  const category = await getCategory(slug);
  const n = Number(page);
  if (!category) return buildMetadata({ title: 'صفحه یافت نشد', path: `/category/${slug}`, noindex: true });

  return buildMetadata({
    title: `${category.title} — صفحه ${toFa(n)}`,
    description: clamp(`صفحه ${toFa(n)} از ${category.title}. ${category.excerpt}`),
    path: `${category.href}/page/${n}`,
    image: category.image,
    noindex: category.noindex,
  });
}

export default async function CategoryPaginatedPage({ params }) {
  const { slug, page } = await params;
  const n = Number(page);
  const category = await getCategory(slug);
  if (!category || !Number.isInteger(n) || n < 2) notFound();

  return (
    <CatalogView
      categorySlug={category.slug}
      page={n}
      basePath={category.href}
      h1={category.title}
      intro={category.description.slice(0, 1)}
      breadcrumbs={[
        { name: 'خانه', path: '/' },
        {
          name: category.kind === 'product' ? 'محصولات' : 'خدمات',
          path: category.kind === 'product' ? '/products' : '/services',
        },
        { name: category.title, path: category.href },
      ]}
    />
  );
}
