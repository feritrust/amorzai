import { notFound } from 'next/navigation';
import BlogList, { BLOG_PAGE_SIZE } from '@/components/BlogList';
import { buildMetadata } from '@/lib/seo';
import { listArticles } from '@/lib/queries';
import { toFa } from '@/lib/utils';

export const revalidate = 3600;

const H1 = 'مجله آمرز؛ راهنمای مراسم ترحیم';

export async function generateStaticParams() {
  const { totalPages } = await listArticles({ pageSize: BLOG_PAGE_SIZE });
  return Array.from({ length: Math.max(0, totalPages - 1) }, (_, i) => ({ page: String(i + 2) }));
}

export async function generateMetadata({ params }) {
  const { page } = await params;
  const n = Number(page);
  return buildMetadata({
    title: `مجله آمرز — صفحه ${toFa(n)}`,
    description: `صفحه ${toFa(n)} از مقالات آموزشی آمرز درباره برگزاری مراسم ترحیم در بهشت زهرا.`,
    path: `/blog/page/${n}`,
  });
}

export default async function BlogPaginatedPage({ params }) {
  const { page } = await params;
  const n = Number(page);
  if (!Number.isInteger(n) || n < 2) notFound();

  return (
    <BlogList
      page={n}
      basePath="/blog"
      h1={H1}
      breadcrumbs={[
        { name: 'خانه', path: '/' },
        { name: 'مجله', path: '/blog' },
      ]}
    />
  );
}
