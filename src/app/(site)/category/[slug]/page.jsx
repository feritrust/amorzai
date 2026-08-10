import { notFound } from 'next/navigation';
import CatalogView from '@/components/CatalogView';
import { getCategories, getCategory } from '@/lib/queries';
import { buildMetadata } from '@/lib/seo';
import { clamp } from '@/lib/utils';

export const revalidate = 3600;
// dynamicParams پیش‌فرض true است: آیتم جدیدی که از پنل اضافه شود بدون بیلد مجدد در دسترس است
// و اسلاگ ناشناس هم ۴۰۴ واقعی می‌گیرد (به شرط نبودن loading.jsx در ریشه)

export async function generateStaticParams() {
  const categories = await getCategories();
  return categories.map((c) => ({ slug: c.slug }));
}

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const category = await getCategory(slug);
  if (!category) return buildMetadata({ title: 'دسته‌بندی یافت نشد', path: `/category/${slug}`, noindex: true });

  return buildMetadata({
    title: category.metaTitle || `${category.title} — قیمت و سفارش`,
    description: category.metaDescription || clamp(category.excerpt || category.description?.[0]),
    path: category.href,
    image: category.image,
    noindex: category.noindex,
    keywords: [category.title, category.shortTitle, 'بهشت زهرا', 'مراسم ترحیم', 'قیمت'],
  });
}

export default async function CategoryPage({ params }) {
  const { slug } = await params;
  const category = await getCategory(slug);
  if (!category) notFound();

  return (
    <CatalogView
      categorySlug={category.slug}
      page={1}
      basePath={category.href}
      h1={category.title}
      intro={category.description}
      faq={category.faq}
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
