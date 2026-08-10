import { getCategories, getAllItems } from '@/lib/queries';

/**
 * داده‌های کمکی فرم: فهرست دسته‌بندی‌ها برای فیلد category و
 * فهرست محصولات/خدمات برای انتخاب موارد مرتبط در مقاله.
 */
export async function getFormContext(entityKey) {
  const needsCategories = entityKey === 'products' || entityKey === 'services';
  const needsItems = entityKey === 'articles';

  const [categories, items] = await Promise.all([
    needsCategories ? getCategories() : Promise.resolve([]),
    needsItems ? getAllItems() : Promise.resolve([]),
  ]);

  return {
    categories: categories.map((c) => ({ slug: c.slug, title: c.title, kind: c.kind })),
    items: items.map((i) => ({ slug: i.slug, title: i.title, type: i.type })),
  };
}
