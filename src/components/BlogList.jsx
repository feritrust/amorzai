import Link from 'next/link';
import { notFound } from 'next/navigation';
import Breadcrumbs from '@/components/Breadcrumbs';
import ArticleCard from '@/components/ArticleCard';
import Pagination from '@/components/Pagination';
import CallCta from '@/components/CallCta';
import JsonLd from '@/components/JsonLd';
import { getTags, listArticles } from '@/lib/queries';
import { abs, breadcrumbSchema, collectionPageSchema, itemListSchema } from '@/lib/seo';
import { toFa } from '@/lib/utils';

export const BLOG_PAGE_SIZE = 9;

export default async function BlogList({ tag, page = 1, basePath = '/blog', h1, intro = [], breadcrumbs = [] }) {
  const { items, total, totalPages, page: current } = await listArticles({
    tag,
    page,
    pageSize: BLOG_PAGE_SIZE,
  });

  if (page > 1 && page > totalPages) notFound();

  const tags = await getTags();
  const crumbs = [...breadcrumbs];
  if (current > 1) crumbs.push({ name: `صفحه ${toFa(current)}`, path: `${basePath}/page/${current}` });

  return (
    <>
      {current > 1 ? (
        <link rel="prev" href={abs(current === 2 ? basePath : `${basePath}/page/${current - 1}`)} />
      ) : null}
      {current < totalPages ? <link rel="next" href={abs(`${basePath}/page/${current + 1}`)} /> : null}

      <div className="container pb-16">
        <Breadcrumbs items={crumbs} />

        <header className="mb-8 max-w-3xl">
          <h1 className="mb-3">
            {h1}
            {current > 1 ? (
              <span className="mr-2 text-base font-normal text-ink-muted">— صفحه {toFa(current)}</span>
            ) : null}
          </h1>
          {intro.length ? (
            <div className="prose-fa">
              {intro.map((p, i) => (
                <p key={i}>{p}</p>
              ))}
            </div>
          ) : null}
        </header>

        {tags.length ? (
          <nav aria-label="برچسب‌ها" className="mb-8 flex flex-wrap gap-2">
            <Link
              href="/blog"
              className={`rounded-xl border px-3.5 py-2 text-[13px] ${
                tag ? 'border-line bg-white hover:border-sage-400' : 'border-sage-600 bg-sage-600 text-white'
              }`}
            >
              همه مقالات
            </Link>
            {tags.map((t) => (
              <Link
                key={t.name}
                href={t.href}
                className={`rounded-xl border px-3.5 py-2 text-[13px] ${
                  tag === t.name ? 'border-sage-600 bg-sage-600 text-white' : 'border-line bg-white hover:border-sage-400'
                }`}
              >
                {t.name}
                <span className="mr-1.5 text-[11px] opacity-70">{toFa(t.count)}</span>
              </Link>
            ))}
          </nav>
        ) : null}

        {items.length ? (
          <ul className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {items.map((a, i) => (
              <li key={a.slug}>
                <ArticleCard article={a} priority={current === 1 && i < 3} />
              </li>
            ))}
          </ul>
        ) : (
          <p className="card p-10 text-center text-sm text-ink-muted">
            هنوز مقاله‌ای در این بخش منتشر نشده است.
          </p>
        )}

        <Pagination basePath={basePath} page={current} totalPages={totalPages} />

        <div className="section">
          <CallCta />
        </div>
      </div>

      <JsonLd
        data={[
          breadcrumbSchema(crumbs),
          collectionPageSchema({
            name: h1,
            description: intro[0] || h1,
            path: current === 1 ? basePath : `${basePath}/page/${current}`,
          }),
          itemListSchema(items, h1),
        ]}
      />
      {total === 0 ? null : null}
    </>
  );
}
