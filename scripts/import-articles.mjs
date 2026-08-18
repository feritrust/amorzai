/**
 * وارد کردن مقالات مارک‌داون از پوشه content/articles به MongoDB.
 *
 *   npm run import:articles            ← فقط مقالات جدید اضافه می‌شوند
 *   npm run import:articles -- --force ← مقالات موجود هم بازنویسی می‌شوند
 *   npm run import:articles -- --draft ← همه به‌صورت پیش‌نویس وارد شوند
 *
 * برخلاف `npm run seed`، این اسکریپت هیچ‌وقت محتوایی را که از پنل ویرایش کرده‌اید
 * بدون اجازه صریح (--force) بازنویسی نمی‌کند.
 *
 * قالب فایل:
 *
 *   ---
 *   title: عنوان
 *   slug: latin-slug
 *   tags: [یک, دو]
 *   ---
 *   متن مارک‌داون…
 *
 *   <!--faq-->
 *   Q: سوال
 *   A: پاسخ
 */
import fs from 'node:fs';
import path from 'node:path';
import mongoose from 'mongoose';

const ARTICLES_DIR = path.resolve(process.cwd(), 'content', 'articles');

/* ----------------------------- خواندن .env ----------------------------- */
function loadEnv() {
  for (const file of ['.env.local', '.env']) {
    const p = path.resolve(process.cwd(), file);
    if (!fs.existsSync(p)) continue;
    for (const line of fs.readFileSync(p, 'utf8').split('\n')) {
      const m = line.match(/^\s*([\w.-]+)\s*=\s*(.*)?\s*$/);
      if (!m) continue;
      const key = m[1];
      const value = (m[2] || '').trim().replace(/^["']|["']$/g, '');
      if (!process.env[key]) process.env[key] = value;
    }
  }
}

/* --------------------------- پارس فرانت‌ماتر --------------------------- */
function parseValue(raw) {
  const v = raw.trim();
  if (v.startsWith('[') && v.endsWith(']')) {
    return v
      .slice(1, -1)
      .split(',')
      .map((x) => x.trim().replace(/^["']|["']$/g, ''))
      .filter(Boolean);
  }
  if (v === 'true') return true;
  if (v === 'false') return false;
  return v.replace(/^["']|["']$/g, '');
}

function parseFile(filePath) {
  const raw = fs.readFileSync(filePath, 'utf8').replace(/\r\n/g, '\n');
  const match = raw.match(/^---\n([\s\S]*?)\n---\n([\s\S]*)$/);
  if (!match) throw new Error(`فرانت‌ماتر پیدا نشد: ${path.basename(filePath)}`);

  const meta = {};
  for (const line of match[1].split('\n')) {
    const kv = line.match(/^([\w]+)\s*:\s*(.*)$/);
    if (kv) meta[kv[1]] = parseValue(kv[2]);
  }

  let body = match[2].trim();
  const faq = [];

  // بخش سوالات متداول بعد از نشانه <!--faq-->
  const faqSplit = body.split(/<!--\s*faq\s*-->/);
  if (faqSplit.length > 1) {
    body = faqSplit[0].trim();
    const lines = faqSplit[1].split('\n');
    let current = null;
    for (const line of lines) {
      const q = line.match(/^Q:\s*(.+)$/);
      const a = line.match(/^A:\s*(.+)$/);
      if (q) {
        if (current?.q && current?.a) faq.push(current);
        current = { q: q[1].trim(), a: '' };
      } else if (a && current) {
        current.a = a[1].trim();
      } else if (current?.a && line.trim()) {
        current.a += ` ${line.trim()}`;
      }
    }
    if (current?.q && current?.a) faq.push(current);
  }

  return { meta, body, faq };
}

/* ------------------------------ مدل مقاله ------------------------------ */
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
const Article = mongoose.models.Article || mongoose.model('Article', ArticleSchema);

/* -------------------------------- اجرا -------------------------------- */
async function main() {
  loadEnv();

  const force = process.argv.includes('--force');
  const asDraft = process.argv.includes('--draft');

  if (!fs.existsSync(ARTICLES_DIR)) {
    console.error(`✖ پوشه ${ARTICLES_DIR} وجود ندارد.`);
    process.exit(1);
  }

  const files = fs.readdirSync(ARTICLES_DIR).filter((f) => f.endsWith('.md'));
  if (!files.length) {
    console.log('هیچ فایل مارک‌داونی پیدا نشد.');
    return;
  }

  const URI = process.env.MONGODB_URI;
  if (!URI) {
    console.error('✖ MONGODB_URI تنظیم نشده است.');
    process.exit(1);
  }

  console.log(`→ اتصال به MongoDB (${process.env.MONGODB_DB || 'amorz'})…`);
  await mongoose.connect(URI, { dbName: process.env.MONGODB_DB || 'amorz' });

  let created = 0;
  let updated = 0;
  let skipped = 0;

  for (const file of files) {
    const { meta, body, faq } = parseFile(path.join(ARTICLES_DIR, file));

    if (!meta.slug || !meta.title) {
      console.warn(`  ⚠ ${file}: عنوان یا اسلاگ ندارد — رد شد`);
      continue;
    }

    const existing = await Article.findOne({ slug: meta.slug }).lean();
    if (existing && !force) {
      console.log(`  – ${meta.slug}: از قبل هست، دست نخورد`);
      skipped += 1;
      continue;
    }

    const doc = {
      slug: meta.slug,
      title: meta.title,
      excerpt: meta.excerpt || '',
      content: body,
      cover: meta.cover || '',
      coverAlt: meta.coverAlt || meta.title,
      tags: Array.isArray(meta.tags) ? meta.tags : [],
      author: meta.author || 'تیم آمرز',
      status: asDraft ? 'draft' : meta.status || 'draft',
      publishedAt: meta.publishedAt ? new Date(meta.publishedAt) : new Date(),
      relatedItems: Array.isArray(meta.relatedItems) ? meta.relatedItems : [],
      faq,
      metaTitle: meta.metaTitle || '',
      metaDescription: meta.metaDescription || '',
      noindex: meta.noindex === true,
    };

    await Article.updateOne({ slug: doc.slug }, { $set: doc }, { upsert: true });

    const words = body.split(/\s+/).filter(Boolean).length;
    if (existing) {
      console.log(`  ✎ ${doc.slug}: به‌روزرسانی شد (${words} کلمه، ${faq.length} سوال)`);
      updated += 1;
    } else {
      console.log(`  ✔ ${doc.slug}: اضافه شد (${words} کلمه، ${faq.length} سوال)`);
      created += 1;
    }
  }

  await mongoose.disconnect();

  console.log(`\nنتیجه: ${created} جدید، ${updated} به‌روزرسانی، ${skipped} بدون تغییر`);
  if (created || updated) {
    console.log('\nحالا کش صفحات را تازه کن:');
    console.log('  curl -X POST "https://amorz.ir/api/revalidate?secret=SEED_SECRET"');
    console.log('یا از پنل: داشبورد ← «بازسازی کش صفحات اصلی»');
  }
}

// فقط وقتی مستقیم اجرا شود؛ برای تست بتوان توابع را import کرد
if (process.argv[1] && process.argv[1].includes('import-articles')) {
  main().catch(async (err) => {
    console.error('✖ خطا:', err.message);
    await mongoose.disconnect().catch(() => {});
    process.exit(1);
  });
}

export { parseFile, parseValue };
