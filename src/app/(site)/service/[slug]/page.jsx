import { notFound } from 'next/navigation';
import ItemDetail from '@/components/ItemDetail';
import { getAllItems, getCategory, getItem } from '@/lib/queries';
import { buildMetadata } from '@/lib/seo';
import { clamp, formatPrice } from '@/lib/utils';

export const revalidate = 3600;
// dynamicParams پیش‌فرض true است: آیتم جدیدی که از پنل اضافه شود بدون بیلد مجدد در دسترس است
// و اسلاگ ناشناس هم ۴۰۴ واقعی می‌گیرد (به شرط نبودن loading.jsx در ریشه)

export async function generateStaticParams() {
  const items = await getAllItems();
  return items.filter((i) => i.type === 'service').map((i) => ({ slug: i.slug }));
}

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const item = await getItem('service', slug);
  if (!item) {
    return buildMetadata({ title: 'خدمت یافت نشد', path: `/service/${slug}`, noindex: true });
  }
  const category = await getCategory(item.category);

  return buildMetadata({
    title: item.metaTitle || `${item.title} — قیمت ${formatPrice(item.price)}`,
    description:
      item.metaDescription ||
      clamp(`${item.excerpt} قیمت: ${formatPrice(item.price)}. رزرو تلفنی برای مراسم در بهشت زهرا.`),
    path: item.href,
    image: item.image,
    noindex: item.noindex,
    keywords: [item.title, category?.title, 'قیمت', 'بهشت زهرا', 'مراسم ترحیم'].filter(Boolean),
    modifiedTime: item.updatedAt || undefined,
  });
}

export default async function ServicePage({ params }) {
  const { slug } = await params;
  const item = await getItem('service', slug);
  if (!item) notFound();
  const category = await getCategory(item.category);

  return <ItemDetail item={item} category={category} />;
}
