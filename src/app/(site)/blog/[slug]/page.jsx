import Link from 'next/link';
import Image from 'next/image';
import { notFound } from 'next/navigation';
import Breadcrumbs from '@/components/Breadcrumbs';
import ArticleCard from '@/components/ArticleCard';
import ItemCard from '@/components/ItemCard';
import Faq from '@/components/Faq';
import CallCta from '@/components/CallCta';
import JsonLd from '@/components/JsonLd';
import Icon from '@/components/Icons';
import { getArticle, getCategories, getItemsByRefs, getPublishedArticles, getRelatedArticles } from '@/lib/queries';
import { abs, breadcrumbSchema, buildMetadata, faqSchema } from '@/lib/seo';
import { renderMarkdown, plainText } from '@/lib/markdown';
import { faDate } from '@/lib/date';
import { clamp, toFa } from '@/lib/utils';
import { site } from '@/lib/site';

export const revalidate = 3600;

export async function generateStaticParams() {
  const articles = await getPublishedArticles();
  return articles.map((a) => ({ slug: a.slug }));
}

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const article = await getArticle(slug);
  if (!article) return buildMetadata({ title: 'مقاله یافت نشد', path: `/blog/${slug}`, noindex: true });

  return buildMetadata({
    title: article.metaTitle || article.title,
    description: article.metaDescription || clamp(article.excerpt || plainText(article.content)),
    path: article.href,
    image: article.cover,
    type: 'article',
    noindex: article.noindex,
    keywords: [...article.tags, 'مراسم ترحیم', 'بهشت زهرا'],
    publishedTime: article.publishedAt || undefined,
    modifiedTime: article.updatedAt || article.publishedAt || undefined,
  });
}

export default async function ArticlePage({ params }) {
  const { slug } = await params;
  const article = await getArticle(slug);
  if (!article) notFound();

  const { html, headings, minutes } = renderMarkdown(article.content);
  const [related, relatedItems, categories] = await Promise.all([
    getRelatedArticles(article, 3),
    getItemsByRefs(article.relatedItems),
    getCategories(),
  ]);
  const titleOf = (s) => categories.find((c) => c.slug === s)?.shortTitle;

  const crumbs = [
    { name: 'خانه', path: '/' },
    { name: 'مجله', path: '/blog' },
    { name: article.title, path: article.href },
  ];

  const blogPosting = {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    '@id': `${abs(article.href)}#article`,
    headline: article.title.slice(0, 110),
    description: clamp(article.excerpt || plainText(article.content), 300),
    image: [abs(article.cover)],
    inLanguage: 'fa-IR',
    datePublished: article.publishedAt,
    dateModified: article.updatedAt || article.publishedAt,
    wordCount: article.content.trim().split(/\s+/).length,
    keywords: article.tags.join('، '),
    articleSection: article.tags[0] || 'راهنما',
    author: { '@type': 'Organization', name: article.author, url: site.url },
    publisher: { '@id': `${site.url}/#organization` },
    mainEntityOfPage: { '@type': 'WebPage', '@id': abs(article.href) },
  };

  return (
    <div className="container pb-16">
      <Breadcrumbs items={crumbs} />

      <article>
        <header className="mx-auto mb-8 max-w-3xl">
          {article.tags?.length ? (
            <div className="mb-4 flex flex-wrap gap-2">
              {article.tags.map((t) => (
                <Link key={t} href={`/blog/tag/${encodeURIComponent(t)}`} className="chip hover:bg-sage-100">
                  {t}
                </Link>
              ))}
            </div>
          ) : null}

          <h1 className="mb-4">{article.title}</h1>

          <p className="mb-5 text-[15px] leading-[2.1] text-ink-soft">{article.excerpt}</p>

          <div className="flex flex-wrap items-center gap-x-5 gap-y-2 border-y border-line py-3 text-[12px] text-ink-muted">
            <span className="flex items-center gap-1.5">
              <Icon name="check" className="h-4 w-4 text-sage-400" />
              {article.author}
            </span>
            <time dateTime={article.publishedAt} className="flex items-center gap-1.5">
              <Icon name="clock" className="h-4 w-4 text-sage-400" />
              {faDate(article.publishedAt)}
            </time>
            <span>{toFa(minutes)} دقیقه مطالعه</span>
            {article.updatedAt && article.updatedAt !== article.publishedAt ? (
              <span className="mr-auto">آخرین بازبینی: {faDate(article.updatedAt)}</span>
            ) : null}
          </div>
        </header>

        <div className="relative mx-auto mb-10 aspect-[16/9] max-w-4xl overflow-hidden rounded-2xl border border-line bg-sage-50">
          <Image
            src={article.cover}
            alt={article.coverAlt || article.title}
            fill
            sizes="(max-width: 1024px) 100vw, 900px"
            className="object-cover"
            priority
          />
        </div>

        <div className="grid gap-10 lg:grid-cols-[1fr_260px]">
          <div className="article-body min-w-0" dangerouslySetInnerHTML={{ __html: html }} />

          <aside className="hidden lg:block">
            <div className="sticky top-28 space-y-6">
              {headings.length > 2 ? (
                <nav aria-labelledby="toc-heading" className="card p-5">
                  <h2 id="toc-heading" className="mb-3 text-[14px]">
                    فهرست مطالب
                  </h2>
                  <ol className="space-y-2 text-[13px]">
                    {headings.map((h) => (
                      <li key={h.id} className={h.level === 3 ? 'pr-4' : ''}>
                        <a href={`#${h.id}`} className="block leading-6 text-ink-muted hover:text-sage-700">
                          {h.text}
                        </a>
                      </li>
                    ))}
                  </ol>
                </nav>
              ) : null}

              <div className="card bg-sage-900 p-5 text-white">
                <h2 className="mb-2 text-[14px] text-white">مشاوره رایگان</h2>
                <p className="mb-4 text-[12px] leading-7 text-sage-100">
                  اگر سوالی درباره برگزاری مراسم دارید، تماس بگیرید. پاسخگویی شبانه‌روزی است.
                </p>
                <a href={`tel:+98${site.phone.replace(/^0/, '')}`} className="btn w-full bg-white text-sage-900 hover:bg-sage-50">
                  {toFa(site.phone)}
                </a>
              </div>
            </div>
          </aside>
        </div>
      </article>

      {relatedItems.length ? (
        <section className="section" aria-labelledby="related-items-heading">
          <h2 id="related-items-heading" className="mb-6">
            محصولات و خدمات مرتبط با این مقاله
          </h2>
          <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {relatedItems.map((it) => (
              <li key={`${it.type}-${it.slug}`}>
                <ItemCard item={it} categoryTitle={titleOf(it.category)} />
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      {article.faq?.length ? <Faq items={article.faq} title="سوالات متداول" /> : null}

      {related.length ? (
        <section className="section" aria-labelledby="related-posts-heading">
          <h2 id="related-posts-heading" className="mb-6">
            مطالب مرتبط
          </h2>
          <ul className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {related.map((a) => (
              <li key={a.slug}>
                <ArticleCard article={a} />
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      <CallCta />

      <JsonLd data={[breadcrumbSchema(crumbs), blogPosting, faqSchema(article.faq)]} />
    </div>
  );
}
