import { notFound } from 'next/navigation';
import CatalogView from '@/components/CatalogView';
import { buildMetadata } from '@/lib/seo';
import { listItems } from '@/lib/queries';
import { toFa } from '@/lib/utils';

export const revalidate = 3600;
// dynamicParams پیش‌فرض true است: آیتم جدیدی که از پنل اضافه شود بدون بیلد مجدد در دسترس است
// و اسلاگ ناشناس هم ۴۰۴ واقعی می‌گیرد (به شرط نبودن loading.jsx در ریشه)

const H1 = 'خدمات مراسم ترحیم';
const INTRO = [
  'خدمات اجرایی مراسم ترحیم شامل اجاره میز و صندلی، سایبان و سیستم صوتی، پذیرایی، رستوران، مداح و هماهنگی اداری.',
];

export async function generateStaticParams() {
  const { totalPages } = await listItems({ type: 'service' });
  return Array.from({ length: Math.max(0, totalPages - 1) }, (_, i) => ({ page: String(i + 2) }));
}

export async function generateMetadata({ params }) {
  const { page } = await params;
  const n = Number(page);
  return buildMetadata({
    title: `خدمات مراسم ترحیم — صفحه ${toFa(n)}`,
    description: `صفحه ${toFa(n)} از فهرست خدمات مراسم ترحیم آمرز شامل صندلی، سایبان، پذیرایی، رستوران و مداح.`,
    path: `/services/page/${n}`,
  });
}

export default async function ServicesPaginatedPage({ params }) {
  const { page } = await params;
  const n = Number(page);
  if (!Number.isInteger(n) || n < 2) notFound();

  return (
    <CatalogView
      type="service"
      page={n}
      basePath="/services"
      h1={H1}
      intro={INTRO}
      breadcrumbs={[
        { name: 'خانه', path: '/' },
        { name: H1, path: '/services' },
      ]}
    />
  );
}
