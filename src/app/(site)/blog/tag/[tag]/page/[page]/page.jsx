import { notFound } from 'next/navigation';
import BlogList, { BLOG_PAGE_SIZE } from '@/components/BlogList';
import { buildMetadata } from '@/lib/seo';
import { getTags, listArticles } from '@/lib/queries';
import { clamp, toFa } from '@/lib/utils';

export const revalidate = 3600;

export async function generateStaticParams() {
  const tags = await getTags();
  const params = [];
  for (const t of tags) {
    const pages = Math.ceil(t.count / BLOG_PAGE_SIZE);
    for (let n = 2; n <= pages; n += 1) params.push({ tag: encodeURIComponent(t.name), page: String(n) });
  }
  return params;
}

export async function generateMetadata({ params }) {
  const { tag: raw, page } = await params;
  const tag = decodeURIComponent(raw);
  const n = Number(page);
  const { total } = await listArticles({ tag, pageSize: 1000 });

  return buildMetadata({
    title: `مقالات «${tag}» — صفحه ${toFa(n)}`,
    description: clamp(`صفحه ${toFa(n)} از مقالات آمرز با موضوع ${tag}.`),
    path: `/blog/tag/${encodeURIComponent(tag)}/page/${n}`,
    noindex: total < 3,
  });
}

export default async function BlogTagPaginatedPage({ params }) {
  const { tag: raw, page } = await params;
  const tag = decodeURIComponent(raw);
  const n = Number(page);
  if (!Number.isInteger(n) || n < 2) notFound();

  const { total } = await listArticles({ tag, pageSize: 1000 });
  if (!total) notFound();

  return (
    <BlogList
      tag={tag}
      page={n}
      basePath={`/blog/tag/${encodeURIComponent(tag)}`}
      h1={`مقالات با موضوع «${tag}»`}
      breadcrumbs={[
        { name: 'خانه', path: '/' },
        { name: 'مجله', path: '/blog' },
        { name: tag, path: `/blog/tag/${encodeURIComponent(tag)}` },
      ]}
    />
  );
}
