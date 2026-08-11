import { cache } from 'react';
import { dbConnect, hasDatabase } from '@/lib/mongodb';
import CategoryModel from '@/models/Category';
import ProductModel from '@/models/Product';
import ServiceModel from '@/models/Service';
import ArticleModel from '@/models/Article';
import SettingModel from '@/models/Setting';
import { site } from '@/lib/site';
import { categories as seedCategories, products as seedProducts, services as seedServices } from '@/data/seed';
import { articles as seedArticles } from '@/data/articles';
import { PAGE_SIZE } from '@/lib/site';

/* ------------------------------------------------------------------ */
/*  نرمال‌سازی: هر رکورد از DB یا داده داخلی به یک شکل واحد درمی‌آید    */
/* ------------------------------------------------------------------ */

function normalizeItem(raw, type) {
  const o = raw?.toObject ? raw.toObject() : { ...raw };
  return {
    type,
    slug: o.slug,
    title: o.title,
    category: o.category,
    price: o.price ?? null,
    unit: o.unit || (type === 'product' ? 'عدد' : 'هر مراسم'),
    sku: o.sku || '',
    excerpt: o.excerpt || '',
    description: o.description || [],
    features: o.features || [],
    specs: o.specs || [],
    image: o.image || `/images/${o.category}.svg`,
    available: o.available !== false,
    metaTitle: o.metaTitle || '',
    metaDescription: o.metaDescription || '',
    noindex: Boolean(o.noindex),
    updatedAt: o.updatedAt || null,
    href: type === 'product' ? `/product/${o.slug}` : `/service/${o.slug}`,
  };
}

function normalizeCategory(raw) {
  const o = raw?.toObject ? raw.toObject() : { ...raw };
  return {
    slug: o.slug,
    title: o.title,
    shortTitle: o.shortTitle || o.title,
    kind: o.kind || 'product',
    order: o.order ?? 100,
    icon: o.icon || 'more',
    excerpt: o.excerpt || '',
    description: o.description || [],
    faq: o.faq || [],
    metaTitle: o.metaTitle || '',
    metaDescription: o.metaDescription || '',
    noindex: Boolean(o.noindex),
    updatedAt: o.updatedAt || null,
    image: `/images/${o.slug}.svg`,
    href: `/category/${o.slug}`,
  };
}

/* ------------------------------------------------------------------ */
/*  منبع داده: MongoDB در صورت وجود، در غیر این صورت داده داخلی        */
/* ------------------------------------------------------------------ */

const loadAll = cache(async () => {
  if (hasDatabase()) {
    const conn = await dbConnect();
    if (conn) {
      const [cats, prods, servs] = await Promise.all([
        CategoryModel.find({}).sort({ order: 1 }).lean(),
        ProductModel.find({}).lean(),
        ServiceModel.find({}).lean(),
      ]);
      if (cats.length) {
        return {
          categories: cats.map(normalizeCategory),
          items: [
            ...prods.map((p) => normalizeItem(p, 'product')),
            ...servs.map((s) => normalizeItem(s, 'service')),
          ],
        };
      }
    }
  }

  return {
    categories: [...seedCategories].sort((a, b) => a.order - b.order).map(normalizeCategory),
    items: [
      ...seedProducts.map((p) => normalizeItem(p, 'product')),
      ...seedServices.map((s) => normalizeItem(s, 'service')),
    ],
  };
});

/* ------------------------------------------------------------------ */
/*  API داخلی برای صفحات                                               */
/* ------------------------------------------------------------------ */

export const getCategories = cache(async (kind) => {
  const { categories } = await loadAll();
  return kind ? categories.filter((c) => c.kind === kind) : categories;
});

export const getCategory = cache(async (slug) => {
  const { categories } = await loadAll();
  return categories.find((c) => c.slug === slug) || null;
});

export const getAllItems = cache(async () => {
  const { items } = await loadAll();
  return items;
});

export const getItem = cache(async (type, slug) => {
  const { items } = await loadAll();
  return items.find((i) => i.type === type && i.slug === slug) || null;
});

/**
 * فهرست صفحه‌بندی‌شده با امکان فیلتر روی نوع، دسته و جستجو
 * @returns {{items: Array, total: number, totalPages: number, page: number}}
 */
export const listItems = cache(async ({ type, category, q, page = 1, pageSize = PAGE_SIZE } = {}) => {
  const { items } = await loadAll();

  let result = items;
  if (type) result = result.filter((i) => i.type === type);
  if (category) result = result.filter((i) => i.category === category);
  if (q) {
    const needle = String(q).trim();
    result = result.filter(
      (i) => i.title.includes(needle) || i.excerpt.includes(needle) || i.sku.includes(needle)
    );
  }

  const total = result.length;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const safePage = Math.min(Math.max(1, Number(page) || 1), totalPages);
  const start = (safePage - 1) * pageSize;

  return { items: result.slice(start, start + pageSize), total, totalPages, page: safePage };
});

export const getRelated = cache(async (item, limit = 4) => {
  const { items } = await loadAll();
  const sameCategory = items.filter((i) => i.category === item.category && i.slug !== item.slug);
  if (sameCategory.length >= limit) return sameCategory.slice(0, limit);
  const others = items.filter((i) => i.category !== item.category).slice(0, limit - sameCategory.length);
  return [...sameCategory, ...others];
});

export const getCategoryCounts = cache(async () => {
  const { items } = await loadAll();
  return items.reduce((acc, i) => {
    acc[i.category] = (acc[i.category] || 0) + 1;
    return acc;
  }, {});
});

/* ------------------------------------------------------------------ */
/*  تنظیمات سایت                                                       */
/* ------------------------------------------------------------------ */

const pick = (value, fallback) =>
  value === undefined || value === null || value === '' ? fallback : value;

/**
 * تنظیمات قابل ویرایش از پنل، ادغام‌شده روی مقادیر پیش‌فرض src/lib/site.js.
 * خروجی دقیقاً هم‌شکل شیء `site` است تا در همه کامپوننت‌ها جایگزین شود.
 */
export const getSettings = cache(async () => {
  let doc = null;
  if (hasDatabase()) {
    const conn = await dbConnect();
    if (conn) {
      try {
        doc = await SettingModel.findOne({ key: 'main' }).lean();
      } catch {
        doc = null;
      }
    }
  }
  const s = doc || {};

  return {
    ...site,
    name: pick(s.siteName, site.name),
    legalName: pick(s.siteName, site.name) === site.name ? site.legalName : `${s.siteName} | ${site.slogan}`,
    slogan: pick(s.slogan, site.slogan),
    description: pick(s.description, site.description),
    phone: pick(s.phone, site.phone),
    mobile: pick(s.mobile, site.mobile),
    email: pick(s.email, site.email),
    address: {
      street: pick(s.addressStreet, site.address.street),
      city: pick(s.addressCity, site.address.city),
      region: site.address.region,
      postalCode: pick(s.postalCode, site.address.postalCode),
      country: site.address.country,
    },
    geo: {
      lat: pick(s.geoLat, site.geo.lat),
      lng: pick(s.geoLng, site.geo.lng),
    },
    openingHours: pick(s.openingHours, site.openingHours),
    footerAbout: pick(
      s.footerAbout,
      'آمرز مجموعه‌ای برای تأمین گل، سنگ مزار، تجهیزات، پذیرایی و خدمات مراسم ترحیم در بهشت زهرا (س) است. قیمت‌ها شفاف اعلام می‌شود و سفارش تنها به‌صورت تلفنی ثبت می‌گردد.'
    ),
    social: {
      instagram: pick(s.instagram, site.social.instagram),
      telegram: pick(s.telegram, site.social.telegram),
      whatsapp: pick(s.whatsapp, ''),
    },
  };
});

/* ------------------------------------------------------------------ */
/*  مقالات                                                             */
/* ------------------------------------------------------------------ */

function normalizeArticle(raw) {
  const o = raw?.toObject ? raw.toObject() : { ...raw };
  const published = o.publishedAt ? new Date(o.publishedAt) : null;
  return {
    slug: o.slug,
    title: o.title,
    excerpt: o.excerpt || '',
    content: o.content || '',
    cover: o.cover || '/images/og-default.png',
    coverAlt: o.coverAlt || o.title,
    tags: o.tags || [],
    author: o.author || 'تیم آمرز',
    status: o.status || 'draft',
    publishedAt: published ? published.toISOString() : null,
    updatedAt: o.updatedAt ? new Date(o.updatedAt).toISOString() : null,
    relatedItems: o.relatedItems || [],
    faq: o.faq || [],
    metaTitle: o.metaTitle || '',
    metaDescription: o.metaDescription || '',
    noindex: Boolean(o.noindex),
    href: `/blog/${o.slug}`,
  };
}

const loadArticles = cache(async () => {
  if (hasDatabase()) {
    const conn = await dbConnect();
    if (conn) {
      const docs = await ArticleModel.find({}).sort({ publishedAt: -1 }).lean();
      if (docs.length) return docs.map(normalizeArticle);
    }
  }
  return seedArticles.map(normalizeArticle);
});

/** فقط مقالات منتشرشده و با تاریخ گذشته — پیش‌نویس‌ها هرگز عمومی نمی‌شوند */
export const getPublishedArticles = cache(async () => {
  const all = await loadArticles();
  const now = Date.now();
  return all
    .filter((a) => a.status === 'published' && a.publishedAt && new Date(a.publishedAt).getTime() <= now)
    .sort((a, b) => new Date(b.publishedAt) - new Date(a.publishedAt));
});

export const listArticles = cache(async ({ tag, page = 1, pageSize = 9 } = {}) => {
  let list = await getPublishedArticles();
  if (tag) list = list.filter((a) => a.tags.includes(tag));

  const total = list.length;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const safePage = Math.min(Math.max(1, Number(page) || 1), totalPages);
  const start = (safePage - 1) * pageSize;

  return { items: list.slice(start, start + pageSize), total, totalPages, page: safePage };
});

export const getArticle = cache(async (slug) => {
  const all = await getPublishedArticles();
  return all.find((a) => a.slug === slug) || null;
});

export const getTags = cache(async () => {
  const all = await getPublishedArticles();
  const counts = new Map();
  for (const a of all) for (const t of a.tags) counts.set(t, (counts.get(t) || 0) + 1);
  return Array.from(counts, ([name, count]) => ({ name, count, href: `/blog/tag/${encodeURIComponent(name)}` })).sort(
    (a, b) => b.count - a.count
  );
});

export const getRelatedArticles = cache(async (article, limit = 3) => {
  const all = await getPublishedArticles();
  const others = all.filter((a) => a.slug !== article.slug);
  const scored = others
    .map((a) => ({ a, score: a.tags.filter((t) => article.tags.includes(t)).length }))
    .sort((x, y) => y.score - x.score || new Date(y.a.publishedAt) - new Date(x.a.publishedAt));
  return scored.slice(0, limit).map((s) => s.a);
});

/** آیتم‌های مرتبط با یک مقاله؛ ورودی به شکل "product:slug" یا "service:slug" */
export const getItemsByRefs = cache(async (refs = []) => {
  if (!refs.length) return [];
  const { items } = await loadAll();
  return refs
    .map((ref) => {
      const [type, slug] = String(ref).split(':');
      return items.find((i) => i.type === type && i.slug === slug);
    })
    .filter(Boolean);
});

export const getFeatured = cache(async (limit = 8) => {
  const { items } = await loadAll();
  const byCategory = new Map();
  for (const i of items) {
    if (!byCategory.has(i.category)) byCategory.set(i.category, i);
  }
  return Array.from(byCategory.values()).slice(0, limit);
});
