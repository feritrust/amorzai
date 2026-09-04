/**
 * اتصال عکس‌های پوشه public/uploads به محصولات و خدمات.
 *
 *   npm run set:images          ← اعمال روی دیتابیس
 *   npm run set:images -- --dry ← فقط گزارش، بدون تغییر
 *
 * فقط فیلد image را می‌نویسد و به هیچ فیلد دیگری دست نمی‌زند؛ پس قیمت،
 * عنوان و توضیحاتی که در پنل ویرایش کرده‌اید دست‌نخورده می‌مانند.
 *
 * اگر محصولی از قبل عکس داشته باشد، بدون --force رد می‌شود تا عکسی که
 * خودتان از پنل آپلود کرده‌اید بازنویسی نشود.
 */

import fs from 'node:fs';
import path from 'node:path';
import mongoose from 'mongoose';

const DRY = process.argv.includes('--dry');
const FORCE = process.argv.includes('--force');
const ROOT = process.cwd();
const UPLOADS = path.join(ROOT, 'public', 'uploads');

/** اسلاگ → نام فایل در public/uploads */
export const IMAGE_MAP = {
  product: {
    'taj-gol-roo-ghabri': 'amorz-taj-gol-roo-ghabri.webp',
    'taj-gol-yek-tabaghe': 'amorz-taj-gol-yek-tabaghe.webp',
    'taj-gol-do-tabaghe': 'amorz-taj-gol-do-tabaghe.webp',
    'taj-gol-se-tabaghe-lux': 'amorz-taj-gol-se-tabaghe-lux.webp',
    'sang-mazar-granit': 'amorz-sang-mazar-granit.webp',
    'sang-mazar-marmar-sefid': 'amorz-sang-mazar-marmar-sefid.webp',
  },
  service: {
    'ejare-sandali-plastiki': 'amorz-ejare-sandali.webp',
    'ejare-sandali-lux': 'amorz-ejare-sandali-lux.webp',
    'ejare-miz': 'amorz-ejare-miz.webp',
    'ejare-sayeban-chadori': 'amorz-ejare-sayeban.webp',
    'khorma-maghz-gerdoo': 'amorz-khorma-maghz-gerdoo.webp',
    'nahar-tarhim-chelokabab': 'amorz-nahar-chelokabab.webp',
    'nahar-khoresh-va-polo': 'amorz-nahar-khoresh-polo.webp',
  },
};

const itemSchema = new mongoose.Schema({}, { strict: false, timestamps: true });
const Product = mongoose.models.Product || mongoose.model('Product', itemSchema, 'products');
const Service = mongoose.models.Service || mongoose.model('Service', itemSchema, 'services');

async function main() {
  const missing = [];
  for (const group of Object.values(IMAGE_MAP)) {
    for (const file of Object.values(group)) {
      if (!fs.existsSync(path.join(UPLOADS, file))) missing.push(file);
    }
  }
  if (missing.length) {
    console.error('✖ این فایل‌ها در public/uploads نیستند:');
    missing.forEach((f) => console.error('   ' + f));
    process.exit(1);
  }

  const URI = process.env.MONGODB_URI;
  if (!URI) {
    console.error('✖ MONGODB_URI تنظیم نشده است.');
    process.exit(1);
  }

  console.log(`→ اتصال به MongoDB…${DRY ? ' [حالت آزمایشی]' : ''}\n`);
  await mongoose.connect(URI, { dbName: process.env.MONGODB_DB || 'amorz' });

  let set = 0;
  let skipped = 0;
  let notFound = 0;

  for (const [type, map] of Object.entries(IMAGE_MAP)) {
    const Model = type === 'product' ? Product : Service;
    for (const [slug, file] of Object.entries(map)) {
      const url = `/uploads/${file}`;
      const doc = await Model.findOne({ slug }).lean();

      if (!doc) {
        console.log(`  ? ${slug} — در دیتابیس نیست`);
        notFound += 1;
        continue;
      }
      if (doc.image === url) {
        console.log(`  = ${slug} — از قبل همین عکس را دارد`);
        skipped += 1;
        continue;
      }
      if (doc.image && !doc.image.startsWith('/images/') && !FORCE) {
        console.log(`  ! ${slug} — عکس دیگری دارد (${doc.image}). برای بازنویسی --force بزنید.`);
        skipped += 1;
        continue;
      }

      console.log(`  ✔ ${slug} → ${url}`);
      if (!DRY) await Model.updateOne({ slug }, { $set: { image: url } });
      set += 1;
    }
  }

  console.log(
    `\nتنظیم‌شده: ${set} | رد شده: ${skipped} | پیدا نشد: ${notFound}${DRY ? '  (چیزی نوشته نشد)' : ''}`,
  );
  await mongoose.disconnect();
}

main().catch((e) => {
  console.error('✖', e.message);
  process.exit(1);
});
