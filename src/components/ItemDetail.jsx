import Link from 'next/link';
import Image from 'next/image';
import Breadcrumbs from '@/components/Breadcrumbs';
import ItemCard from '@/components/ItemCard';
import Faq from '@/components/Faq';
import CallCta from '@/components/CallCta';
import JsonLd from '@/components/JsonLd';
import Icon from '@/components/Icons';
import { getCategories, getRelated } from '@/lib/queries';
import { site, telHref } from '@/lib/site';
import { formatPrice, toFa } from '@/lib/utils';
import { breadcrumbSchema, productSchema, serviceSchema } from '@/lib/seo';

export default async function ItemDetail({ item, category }) {
  const [related, categories] = await Promise.all([getRelated(item, 4), getCategories()]);
  const titleOf = (slug) => categories.find((c) => c.slug === slug)?.shortTitle;
  const isProduct = item.type === 'product';

  const crumbs = [
    { name: 'خانه', path: '/' },
    { name: isProduct ? 'محصولات' : 'خدمات', path: isProduct ? '/products' : '/services' },
    { name: category?.title || '—', path: category?.href || '/categories' },
    { name: item.title, path: item.href },
  ];

  return (
    <div className="container pb-16">
      <Breadcrumbs items={crumbs} />

      <div className="grid gap-8 lg:grid-cols-[1fr_.85fr] lg:gap-12">
        {/* تصویر */}
        <div className="relative aspect-[4/3] overflow-hidden rounded-2xl border border-line bg-sage-50">
          <Image
            src={item.image}
            alt={`${item.title} — ${category?.title || 'آمرز'} در بهشت زهرا`}
            fill
            sizes="(max-width: 1024px) 100vw, 55vw"
            className="object-cover"
            priority
          />
        </div>

        {/* اطلاعات و CTA */}
        <div>
          <Link href={category?.href || '/categories'} className="chip mb-4">
            <Icon name={category?.icon || 'more'} className="h-3.5 w-3.5" />
            {category?.title}
          </Link>

          <h1 className="mb-4">{item.title}</h1>

          <p className="mb-6 text-[15px] leading-[2.1] text-ink-soft">{item.excerpt}</p>

          <div className="card mb-6 p-5">
            <div className="mb-4 flex items-end justify-between border-b border-line pb-4">
              <div>
                <span className="mb-1 block text-xs text-ink-muted">قیمت</span>
                <strong className="text-2xl font-extrabold text-sage-700">
                  {formatPrice(item.price)}
                </strong>
                {item.price ? (
                  <span className="mr-2 text-xs text-ink-muted">/ {item.unit}</span>
                ) : null}
              </div>
              <span
                className={`chip ${item.available ? '' : 'bg-gold-100 text-gold-600'}`}
              >
                {item.available ? 'قابل سفارش' : 'موقتاً ناموجود'}
              </span>
            </div>

            <p className="mb-4 text-[13px] leading-8 text-ink-muted">
              پرداخت آنلاین در سایت وجود ندارد. برای ثبت سفارش، هماهنگی زمان و تأیید قیمت نهایی با
              کارشناسان آمرز تماس بگیرید — شبانه‌روزی، ۷ روز هفته.
            </p>

            <div className="flex flex-col gap-2.5 sm:flex-row">
              <a href={telHref(site.phone)} className="btn-primary flex-1">
                <Icon name="phone" className="h-4 w-4" />
                <span className="font-extrabold tracking-wide">{toFa(site.phone)}</span>
              </a>
              <a href={telHref(site.mobile)} className="btn-outline flex-1">
                <Icon name="phone" className="h-4 w-4" />
                {toFa(site.mobile)}
              </a>
            </div>
          </div>

          {item.features?.length ? (
            <>
              <h2 className="mb-3 text-base">ویژگی‌های این {isProduct ? 'محصول' : 'خدمت'}</h2>
              <ul className="mb-6 grid gap-2.5 sm:grid-cols-2">
                {item.features.map((f) => (
                  <li key={f} className="flex items-start gap-2 text-[13px] leading-7 text-ink-soft">
                    <Icon name="check" className="mt-1 h-4 w-4 shrink-0 text-sage-600" />
                    {f}
                  </li>
                ))}
              </ul>
            </>
          ) : null}

          {item.sku ? (
            <p className="text-xs text-ink-muted">کد کالا/خدمت: {item.sku}</p>
          ) : null}
        </div>
      </div>

      {/* توضیحات کامل — محتوای اصلی قابل ایندکس */}
      <section className="section" aria-labelledby="desc-heading">
        <h2 id="desc-heading" className="mb-5">
          توضیحات {item.title}
        </h2>
        <div className="grid gap-10 lg:grid-cols-[1.15fr_.85fr]">
          <div className="prose-fa">
            {item.description.map((p, i) => (
              <p key={i}>{p}</p>
            ))}
          </div>

          {item.specs?.length ? (
            <div className="card h-fit overflow-hidden">
              <h3 className="border-b border-line px-5 py-4 text-[15px]">مشخصات</h3>
              <table className="w-full text-[13px]">
                <tbody>
                  {item.specs.map(([k, v]) => (
                    <tr key={k} className="border-b border-line/70 last:border-0">
                      <th scope="row" className="w-2/5 px-5 py-3 text-right font-medium text-ink-muted">
                        {k}
                      </th>
                      <td className="px-5 py-3 text-ink-soft">{v}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : null}
        </div>
      </section>

      {category?.faq?.length ? (
        <Faq items={category.faq} title={`سوالات متداول درباره ${category.shortTitle}`} />
      ) : null}

      {related.length ? (
        <section className="section" aria-labelledby="related-heading">
          <h2 id="related-heading" className="mb-6">
            موارد مرتبط
          </h2>
          <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {related.map((r) => (
              <li key={`${r.type}-${r.slug}`}>
                <ItemCard item={r} categoryTitle={titleOf(r.category)} />
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      <CallCta />

      <JsonLd
        data={[
          breadcrumbSchema(crumbs),
          isProduct ? productSchema(item, category) : serviceSchema(item, category),
        ]}
      />
    </div>
  );
}
