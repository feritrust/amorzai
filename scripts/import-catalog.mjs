/**
 * وارد کردن محصولات و خدمات از content/catalog.json به MongoDB.
 *
 *   npm run import:catalog -- --dry   ← فقط گزارش، بدون تغییر
 *   npm run import:catalog            ← افزودن موارد جدید و به‌روزرسانی موارد موجود
 *
 * هیچ‌وقت چیزی حذف نمی‌کند. آیتم‌هایی که در فایل نیستند دست‌نخورده باقی می‌مانند
 * و در پایان فهرست می‌شوند تا خودتان تصمیم بگیرید.
 *
 * فیلدهای تصویر و metaTitle/metaDescription اگر در فایل نباشند، روی رکورد موجود
 * دست‌کاری نمی‌شوند — یعنی عکسی که از پنل آپلود کرده‌اید پاک نمی‌شود.
 */
import fs from 'node:fs';
import path from 'node:path';
import mongoose from 'mongoose';

const CATALOG = path.resolve(process.cwd(), 'content', 'catalog.json');
const DRY = process.argv.includes('--dry');

function loadEnv() {
  for (const file of ['.env.local', '.env']) {
    const p = path.resolve(process.cwd(), file);
    if (!fs.existsSync(p)) continue;
    for (const line of fs.readFileSync(p, 'utf8').split('\n')) {
      const m = line.match(/^\s*([\w.-]+)\s*=\s*(.*)?\s*$/);
      if (!m) continue;
      if (!process.env[m[1]]) process.env[m[1]] = (m[2] || '').trim().replace(/^["']|["']$/g, '');
    }
  }
}

const itemFields = {
  slug: { type: String, required: true, unique: true },
  title: { type: String, required: true },
  category: { type: String, required: true },
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

const Product =
  mongoose.models.Product || mongoose.model('Product', new mongoose.Schema(itemFields, { timestamps: true }));
const Service =
  mongoose.models.Service || mongoose.model('Service', new mongoose.Schema(itemFields, { timestamps: true }));
const Category =
  mongoose.models.Category ||
  mongoose.model('Category', new mongoose.Schema({ slug: String, title: String }, { strict: false }));

const fa = (n) => new Intl.NumberFormat('en-US').format(n);

async function main() {
  loadEnv();

  if (!fs.existsSync(CATALOG)) {
    console.error(`✖ فایل ${CATALOG} پیدا نشد.`);
    process.exit(1);
  }

  const { items } = JSON.parse(fs.readFileSync(CATALOG, 'utf8'));
  if (!Array.isArray(items) || !items.length) {
    console.error('✖ فایل کاتالوگ آیتمی ندارد.');
    process.exit(1);
  }

  const URI = process.env.MONGODB_URI;
  if (!URI) {
    console.error('✖ MONGODB_URI تنظیم نشده است.');
    process.exit(1);
  }

  console.log(`→ اتصال به MongoDB (${process.env.MONGODB_DB || 'amorz'})…${DRY ? ' [حالت آزمایشی]' : ''}\n`);
  await mongoose.connect(URI, { dbName: process.env.MONGODB_DB || 'amorz' });

  // اعتبارسنجی دسته‌بندی‌ها پیش از هر تغییری
  const catSlugs = new Set((await Category.find({}, 'slug').lean()).map((c) => c.slug));
  const badCats = [...new Set(items.map((i) => i.category))].filter((c) => !catSlugs.has(c));
  if (badCats.length) {
    console.error(`✖ این دسته‌بندی‌ها در دیتابیس نیستند: ${badCats.join('، ')}`);
    console.error('  اول از پنل بسازیدشان یا اسلاگ را در catalog.json اصلاح کنید.');
    await mongoose.disconnect();
    process.exit(1);
  }

  let created = 0;
  let updated = 0;
  const touched = new Set();

  for (const item of items) {
    const Model = item.type === 'product' ? Product : Service;
    const existing = await Model.findOne({ slug: item.slug }).lean();
    touched.add(`${item.type}:${item.slug}`);

    const doc = {
      slug: item.slug,
      title: item.title,
      category: item.category,
      price: item.price ?? null,
      unit: item.unit || (item.type === 'product' ? 'عدد' : 'هر مراسم'),
      sku: item.sku || '',
      excerpt: item.excerpt || '',
      description: item.description || [],
      features: item.features || [],
      specs: item.specs || [],
      available: item.available !== false,
    };

    // این فیلدها فقط اگر در فایل صریحاً آمده باشند نوشته می‌شوند
    if (item.image !== undefined) doc.image = item.image;
    if (item.metaTitle !== undefined) doc.metaTitle = item.metaTitle;
    if (item.metaDescription !== undefined) doc.metaDescription = item.metaDescription;

    if (existing) {
      const priceChanged = (existing.price ?? null) !== doc.price;
      const label = priceChanged
        ? `${fa(existing.price ?? 0)} → ${fa(doc.price ?? 0)} تومان`
        : 'بدون تغییر قیمت';
      console.log(`  ✎ ${item.slug}  (${label})`);
      updated += 1;
    } else {
      console.log(`  ✔ ${item.slug}  ${doc.price ? fa(doc.price) + ' تومان' : 'استعلام'}  [${item.type === 'product' ? 'محصول' : 'خدمت'}]`);
      created += 1;
    }

    if (!DRY) await Model.updateOne({ slug: item.slug }, { $set: doc }, { upsert: true });
  }

  // آیتم‌هایی که در فایل نبودند
  const orphans = [];
  for (const [Model, type] of [
    [Product, 'product'],
    [Service, 'service'],
  ]) {
    const all = await Model.find({}, 'slug title price').lean();
    for (const d of all) {
      if (!touched.has(`${type}:${d.slug}`)) orphans.push({ ...d, type });
    }
  }

  await mongoose.disconnect();

  console.log(`\nنتیجه: ${created} جدید، ${updated} به‌روزرسانی${DRY ? ' (اعمال نشد)' : ''}`);

  if (orphans.length) {
    console.log(`\n${orphans.length} آیتم در سایت هست که در فایل کاتالوگ نبود و دست‌نخورده ماند:`);
    for (const o of orphans) {
      console.log(`  – ${o.slug}  (${o.title})  ${o.price ? fa(o.price) + ' تومان' : 'استعلام'}`);
    }
    console.log('\n  اگر دیگر ارائه‌شان نمی‌دهید، از پنل حذفشان کنید یا تیک «قابل سفارش» را بردارید.');
  }

  if (!DRY && (created || updated)) {
    console.log('\nحالا کش صفحات را تازه کنید — از داشبورد پنل دکمه «بازسازی کش صفحات اصلی».');
  }
  if (DRY) console.log('\nبرای اعمال واقعی، بدون --dry اجرا کنید.');
}

main().catch(async (err) => {
  console.error('✖ خطا:', err.message);
  await mongoose.disconnect().catch(() => {});
  process.exit(1);
});
