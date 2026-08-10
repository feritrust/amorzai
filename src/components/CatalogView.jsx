import { notFound } from 'next/navigation';
import Breadcrumbs from '@/components/Breadcrumbs';
import ItemCard from '@/components/ItemCard';
import Pagination from '@/components/Pagination';
import CallCta from '@/components/CallCta';
import Faq from '@/components/Faq';
import JsonLd from '@/components/JsonLd';
import { getCategories, listItems } from '@/lib/queries';
import { abs, breadcrumbSchema, collectionPageSchema, faqSchema, itemListSchema } from '@/lib/seo';
import { toFa } from '@/lib/utils';

/**
 * نمای مشترک همه صفحات فهرست (محصولات، خدمات، دسته‌بندی) — با صفحه‌بندی SEO،
 * breadcrumb، ItemList schema و متن واقعی قابل ایندکس.
 */
export default async function CatalogView({
  type,
  categorySlug,
  page = 1,
  basePath,
  h1,
  intro = [],
  breadcrumbs = [],
  faq = [],
  emptyText = 'در حال حاضر موردی در این بخش ثبت نشده است.',
}) {
  const { items, total, totalPages, page: current } = await listItems({
    type,
    category: categorySlug,
    page,
  });

  if (page > 1 && page > totalPages) notFound();

  const categories = await getCategories();
  const titleOf = (slug) => categories.find((c) => c.slug === slug)?.shortTitle;

  const crumbs = [...breadcrumbs];
  if (current > 1) crumbs.push({ name: `صفحه ${toFa(current)}`, path: `${basePath}/page/${current}` });

  const canonicalPath = current === 1 ? basePath : `${basePath}/page/${current}`;

  return (
    <>
      {/* rel prev/next — کمک به گوگل برای درک زنجیره صفحه‌بندی */}
      {current > 1 ? (
        <link rel="prev" href={abs(current === 2 ? basePath : `${basePath}/page/${current - 1}`)} />
      ) : null}
      {current < totalPages ? <link rel="next" href={abs(`${basePath}/page/${current + 1}`)} /> : null}

      <div className="container">
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
          <p className="mt-4 text-[13px] text-ink-muted">
            {toFa(total)} مورد در این بخش — قیمت‌ها به تومان و به‌روزرسانی‌شده است.
          </p>
        </header>

        {items.length ? (
          <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {items.map((item, idx) => (
              <li key={item.slug}>
                <ItemCard
                  item={item}
                  categoryTitle={titleOf(item.category)}
                  priority={current === 1 && idx < 4}
                />
              </li>
            ))}
          </ul>
        ) : (
          <p className="card p-8 text-center text-sm text-ink-muted">{emptyText}</p>
        )}

        <Pagination basePath={basePath} page={current} totalPages={totalPages} />

        {faq.length ? <Faq items={faq} /> : null}

        <div className="section">
          <CallCta />
        </div>
      </div>

      <JsonLd
        data={[
          breadcrumbSchema(crumbs),
          collectionPageSchema({ name: h1, description: intro[0] || h1, path: canonicalPath }),
          itemListSchema(items, h1),
          current === 1 ? faqSchema(faq) : null,
        ]}
      />
    </>
  );
}
