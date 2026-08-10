/**
 * پر کردن دیتابیس MongoDB با داده اولیه سایت.
 *
 *   npm run seed
 *
 * اگر MONGODB_URI تنظیم نشده باشد، سایت بدون دیتابیس و با همین داده کار می‌کند
 * و اجرای این اسکریپت لازم نیست.
 */
import fs from 'node:fs';
import path from 'node:path';
import mongoose from 'mongoose';
import { categories, products, services } from '../src/data/seed.mjs';
import { articles } from '../src/data/articles.mjs';

// خواندن ساده .env بدون وابستگی اضافه
function loadEnv() {
  for (const file of ['.env.local', '.env']) {
    const p = path.resolve(process.cwd(), file);
    if (!fs.existsSync(p)) continue;
    for (const line of fs.readFileSync(p, 'utf8').split('\n')) {
      const m = line.match(/^\s*([\w.-]+)\s*=\s*(.*)?\s*$/);
      if (!m) continue;
      const key = m[1];
      let value = (m[2] || '').trim().replace(/^["']|["']$/g, '');
      if (!(key in process.env) || !process.env[key]) process.env[key] = value;
    }
  }
}

loadEnv();

const URI = process.env.MONGODB_URI;
if (!URI) {
  console.error('✖ MONGODB_URI تنظیم نشده است. فایل .env را بسازید یا از داده داخلی استفاده کنید.');
  process.exit(1);
}

const itemFields = {
  slug: { type: String, required: true, unique: true },
  title: { type: String, required: true },
  category: { type: String, required: true, index: true },
  price: { type: Number, default: null },
  unit: String,
  sku: String,
  excerpt: String,
  description: [String],
  features: [String],
  specs: [[String]],
  image: { type: String, default: '' },
  available: { type: Boolean, default: true },
  metaTitle: { type: String, default: '' },
  metaDescription: { type: String, default: '' },
  noindex: { type: Boolean, default: false },
};

const CategorySchema = new mongoose.Schema(
  {
    slug: { type: String, required: true, unique: true },
    title: { type: String, required: true },
    shortTitle: String,
    kind: { type: String, enum: ['product', 'service'], default: 'product' },
    order: { type: Number, default: 100 },
    icon: String,
    excerpt: String,
    description: [String],
    faq: [{ q: String, a: String, _id: false }],
    metaTitle: { type: String, default: '' },
    metaDescription: { type: String, default: '' },
    noindex: { type: Boolean, default: false },
  },
  { timestamps: true }
);

const ProductSchema = new mongoose.Schema(itemFields, { timestamps: true });
const ServiceSchema = new mongoose.Schema(itemFields, { timestamps: true });

const ArticleSchema = new mongoose.Schema(
  {
    slug: { type: String, required: true, unique: true },
    title: { type: String, required: true },
    excerpt: String,
    content: String,
    cover: String,
    coverAlt: String,
    tags: [String],
    author: String,
    status: { type: String, enum: ['draft', 'published'], default: 'draft' },
    publishedAt: Date,
    relatedItems: [String],
    faq: [{ q: String, a: String, _id: false }],
    metaTitle: { type: String, default: '' },
    metaDescription: { type: String, default: '' },
    noindex: { type: Boolean, default: false },
  },
  { timestamps: true }
);

const Category = mongoose.models.Category || mongoose.model('Category', CategorySchema);
const Product = mongoose.models.Product || mongoose.model('Product', ProductSchema);
const Service = mongoose.models.Service || mongoose.model('Service', ServiceSchema);
const Article = mongoose.models.Article || mongoose.model('Article', ArticleSchema);

const upsertAll = async (Model, docs, label) => {
  let created = 0;
  let updated = 0;
  for (const doc of docs) {
    const res = await Model.updateOne({ slug: doc.slug }, { $set: doc }, { upsert: true });
    if (res.upsertedCount) created += 1;
    else updated += 1;
  }
  console.log(`  ${label}: ${created} ایجاد، ${updated} به‌روزرسانی`);
};

async function main() {
  console.log('→ اتصال به MongoDB…');
  await mongoose.connect(URI, { dbName: process.env.MONGODB_DB || 'amorz' });
  console.log('✔ متصل شد');

  await upsertAll(Category, categories, 'دسته‌بندی‌ها');
  await upsertAll(Product, products, 'محصولات');
  await upsertAll(Service, services, 'خدمات');
  await upsertAll(
    Article,
    articles.map((a) => ({ ...a, publishedAt: a.publishedAt ? new Date(a.publishedAt) : null })),
    'مقالات'
  );

  await mongoose.disconnect();
  console.log('✔ seed با موفقیت انجام شد');
}

main().catch(async (err) => {
  console.error('✖ خطا در seed:', err);
  await mongoose.disconnect().catch(() => {});
  process.exit(1);
});
