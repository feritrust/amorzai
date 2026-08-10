import { getCategories, getAllItems, listItems, getPublishedArticles, getTags } from '@/lib/queries';
import { site, PAGE_SIZE } from '@/lib/site';
import { abs } from '@/lib/seo';
import { isoDate } from '@/lib/utils';

export const revalidate = 3600;

/**
 * sitemap.xml داینامیک — شامل صفحات ثابت، دسته‌بندی‌ها، صفحات صفحه‌بندی‌شده
 * و تک‌تک محصولات و خدمات. با هر تغییر داده به‌صورت خودکار به‌روز می‌شود.
 */
export default async function sitemap() {
  const [categories, items, allProducts, allServices, articles, tags] = await Promise.all([
    getCategories(),
    getAllItems(),
    listItems({ type: 'product', pageSize: 10000 }),
    listItems({ type: 'service', pageSize: 10000 }),
    getPublishedArticles(),
    getTags(),
  ]);

  const now = isoDate();

  const staticPages = [
    // بدون اسلش انتهایی تا دقیقاً با canonical صفحه اصلی یکسان باشد
    { url: site.url, lastModified: now, changeFrequency: 'daily', priority: 1 },
    { url: abs('/categories'), lastModified: now, changeFrequency: 'weekly', priority: 0.9 },
    { url: abs('/products'), lastModified: now, changeFrequency: 'daily', priority: 0.9 },
    { url: abs('/services'), lastModified: now, changeFrequency: 'daily', priority: 0.9 },
    { url: abs('/blog'), lastModified: now, changeFrequency: 'daily', priority: 0.8 },
    { url: abs('/about'), lastModified: now, changeFrequency: 'monthly', priority: 0.5 },
    { url: abs('/contact'), lastModified: now, changeFrequency: 'monthly', priority: 0.7 },
    { url: abs('/faq'), lastModified: now, changeFrequency: 'monthly', priority: 0.6 },
  ];

  // صفحات صفحه‌بندی فهرست‌های اصلی (از صفحه ۲ به بعد؛ صفحه ۱ همان آدرس پایه است)
  const paginated = [];
  const addPages = (basePath, total) => {
    const pages = Math.ceil(total / PAGE_SIZE);
    for (let n = 2; n <= pages; n += 1) {
      paginated.push({
        url: abs(`${basePath}/page/${n}`),
        lastModified: now,
        changeFrequency: 'weekly',
        priority: 0.4,
      });
    }
  };
  addPages('/products', allProducts.total);
  addPages('/services', allServices.total);

  const categoryPages = categories.flatMap((c) => {
    const count = items.filter((i) => i.category === c.slug).length;
    const pages = Math.ceil(count / PAGE_SIZE);
    const entries = [
      {
        url: abs(c.href),
        lastModified: isoDate(c.updatedAt),
        changeFrequency: 'weekly',
        priority: 0.8,
      },
    ];
    for (let n = 2; n <= pages; n += 1) {
      entries.push({
        url: abs(`${c.href}/page/${n}`),
        lastModified: now,
        changeFrequency: 'weekly',
        priority: 0.4,
      });
    }
    return entries;
  });

  const itemPages = items.map((i) => ({
    url: abs(i.href),
    lastModified: isoDate(i.updatedAt),
    changeFrequency: 'weekly',
    priority: 0.7,
  }));

  // مقالات و صفحه‌بندی مجله
  const BLOG_PAGE_SIZE = 9;
  const blogPages = [];
  for (let n = 2; n <= Math.ceil(articles.length / BLOG_PAGE_SIZE); n += 1) {
    blogPages.push({
      url: abs(`/blog/page/${n}`),
      lastModified: now,
      changeFrequency: 'weekly',
      priority: 0.4,
    });
  }

  const articlePages = articles.map((a) => ({
    url: abs(a.href),
    lastModified: isoDate(a.updatedAt || a.publishedAt),
    changeFrequency: 'monthly',
    priority: 0.6,
  }));

  // فقط برچسب‌هایی که محتوای کافی دارند (هماهنگ با قاعده noindex صفحه برچسب)
  const tagPages = tags
    .filter((t) => t.count >= 3)
    .map((t) => ({
      url: abs(t.href),
      lastModified: now,
      changeFrequency: 'weekly',
      priority: 0.4,
    }));

  return [
    ...staticPages,
    ...paginated,
    ...categoryPages,
    ...itemPages,
    ...blogPages,
    ...articlePages,
    ...tagPages,
  ];
}
