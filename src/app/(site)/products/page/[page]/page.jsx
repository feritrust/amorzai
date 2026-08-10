import { notFound } from 'next/navigation';
import CatalogView from '@/components/CatalogView';
import { buildMetadata } from '@/lib/seo';
import { listItems } from '@/lib/queries';
import { toFa } from '@/lib/utils';

export const revalidate = 3600;
// dynamicParams پیش‌فرض true است: آیتم جدیدی که از پنل اضافه شود بدون بیلد مجدد در دسترس است
// و اسلاگ ناشناس هم ۴۰۴ واقعی می‌گیرد (به شرط نبودن loading.jsx در ریشه)

const H1 = 'محصولات مراسم ترحیم';
const INTRO = [
  'در این بخش، محصولات فیزیکی مورد نیاز مراسم ترحیم را با قیمت روز مشاهده می‌کنید: تاج گل و سبد گل، سنگ مزار گرانیت و مرمر، بنر و کارت ختم و قاب عکس متوفی.',
];

export async function generateStaticParams() {
  const { totalPages } = await listItems({ type: 'product' });
  return Array.from({ length: Math.max(0, totalPages - 1) }, (_, i) => ({ page: String(i + 2) }));
}

export async function generateMetadata({ params }) {
  const { page } = await params;
  const n = Number(page);
  return buildMetadata({
    title: `محصولات مراسم ترحیم — صفحه ${toFa(n)}`,
    description: `صفحه ${toFa(n)} از فهرست محصولات مراسم ترحیم آمرز شامل تاج گل، سنگ مزار و اقلام چاپی با قیمت روز.`,
    path: `/products/page/${n}`,
  });
}

export default async function ProductsPaginatedPage({ params }) {
  const { page } = await params;
  const n = Number(page);
  if (!Number.isInteger(n) || n < 2) notFound();

  return (
    <CatalogView
      type="product"
      page={n}
      basePath="/products"
      h1={H1}
      intro={INTRO}
      breadcrumbs={[
        { name: 'خانه', path: '/' },
        { name: H1, path: '/products' },
      ]}
    />
  );
}
