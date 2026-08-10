import { notFound } from 'next/navigation';
import BlogList from '@/components/BlogList';
import { buildMetadata } from '@/lib/seo';
import { getTags, listArticles } from '@/lib/queries';
import { clamp } from '@/lib/utils';

export const revalidate = 3600;

export async function generateStaticParams() {
  const tags = await getTags();
  return tags.map((t) => ({ tag: encodeURIComponent(t.name) }));
}

export async function generateMetadata({ params }) {
  const { tag: raw } = await params;
  const tag = decodeURIComponent(raw);
  const { total } = await listArticles({ tag, pageSize: 100 });

  return buildMetadata({
    title: `مقالات «${tag}»`,
    description: clamp(`مجموعه مقالات آمرز با موضوع ${tag} درباره برگزاری مراسم ترحیم در بهشت زهرا.`),
    path: `/blog/tag/${encodeURIComponent(tag)}`,
    // آرشیو با محتوای کم ارزش ایندکس شدن ندارد و باعث thin content می‌شود
    noindex: total < 3,
  });
}

export default async function BlogTagPage({ params }) {
  const { tag: raw } = await params;
  const tag = decodeURIComponent(raw);

  const { total } = await listArticles({ tag, pageSize: 100 });
  if (!total) notFound();

  return (
    <BlogList
      tag={tag}
      page={1}
      basePath={`/blog/tag/${encodeURIComponent(tag)}`}
      h1={`مقالات با موضوع «${tag}»`}
      intro={[`همه مطالب منتشرشده در مجله آمرز که با برچسب ${tag} دسته‌بندی شده‌اند.`]}
      breadcrumbs={[
        { name: 'خانه', path: '/' },
        { name: 'مجله', path: '/blog' },
        { name: tag, path: `/blog/tag/${encodeURIComponent(tag)}` },
      ]}
    />
  );
}
