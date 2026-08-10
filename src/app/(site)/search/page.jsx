import { Suspense } from 'react';
import Breadcrumbs from '@/components/Breadcrumbs';
import SearchForm from '@/components/SearchForm';
import ItemCard from '@/components/ItemCard';
import CallCta from '@/components/CallCta';
import { getCategories, listItems } from '@/lib/queries';
import { buildMetadata } from '@/lib/seo';
import { toFa } from '@/lib/utils';

// صفحه جستجو عمداً noindex است تا صفحات بی‌شمار با پارامتر q ایندکس نشوند
export const metadata = buildMetadata({
  title: 'جستجو در محصولات و خدمات آمرز',
  description: 'جستجو میان محصولات و خدمات مراسم ترحیم آمرز.',
  path: '/search',
  noindex: true,
});

export default async function SearchPage({ searchParams }) {
  const sp = await searchParams;
  const q = (sp?.q || '').trim();

  const { items, total } = q
    ? await listItems({ q, pageSize: 60 })
    : { items: [], total: 0 };
  const categories = await getCategories();
  const titleOf = (slug) => categories.find((c) => c.slug === slug)?.shortTitle;

  return (
    <div className="container pb-16">
      <Breadcrumbs
        items={[
          { name: 'خانه', path: '/' },
          { name: 'جستجو', path: '/search' },
        ]}
      />

      <header className="mb-8 max-w-2xl">
        <h1 className="mb-4">جستجو در محصولات و خدمات</h1>
        <Suspense fallback={<div className="h-12 rounded-xl bg-white" />}>
          <SearchForm />
        </Suspense>
      </header>

      {q ? (
        <>
          <p className="mb-6 text-sm text-ink-muted">
            {total ? `${toFa(total)} نتیجه برای «${q}»` : `نتیجه‌ای برای «${q}» پیدا نشد.`}
          </p>

          {items.length ? (
            <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {items.map((item) => (
                <li key={`${item.type}-${item.slug}`}>
                  <ItemCard item={item} categoryTitle={titleOf(item.category)} />
                </li>
              ))}
            </ul>
          ) : (
            <div className="card p-8 text-center">
              <p className="mb-4 text-sm text-ink-muted">
                شاید عبارت دیگری را امتحان کنید، یا مستقیماً با ما تماس بگیرید تا راهنمایی‌تان کنیم.
              </p>
            </div>
          )}
        </>
      ) : (
        <p className="mb-8 text-sm text-ink-muted">
          نام محصول یا خدمت مورد نظرتان را بنویسید؛ مثلاً «تاج گل»، «صندلی» یا «مداح».
        </p>
      )}

      <div className="mt-12">
        <CallCta />
      </div>
    </div>
  );
}
