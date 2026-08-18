/**
 * بهینه‌سازی تصاویری که قبلاً آپلود شده‌اند.
 *
 *   npm run optimize:uploads -- --dry   ← فقط گزارش، بدون تغییر فایل
 *   npm run optimize:uploads            ← بهینه‌سازی واقعی
 *
 * فایل‌ها **در جای خود و با همان نام** بازنویسی می‌شوند، پس آدرس‌های ذخیره‌شده در
 * دیتابیس معتبر می‌مانند و نیازی به ویرایش محصولات نیست.
 *
 * تصاویر جدیدی که از این به بعد از پنل آپلود می‌شوند، خودکار بهینه می‌شوند و
 * نیازی به اجرای این اسکریپت ندارند.
 */
import fs from 'node:fs/promises';
import path from 'node:path';

const UPLOADS = path.resolve(process.cwd(), 'public', 'uploads');
const MAX_WIDTH = 1600;
const DRY = process.argv.includes('--dry');

const EXT = { '.jpg': 'jpeg', '.jpeg': 'jpeg', '.png': 'png', '.webp': 'webp' };

const kb = (n) => `${(n / 1024).toFixed(0)}KB`;

async function walk(dir) {
  const out = [];
  let entries;
  try {
    entries = await fs.readdir(dir, { withFileTypes: true });
  } catch {
    return out;
  }
  for (const e of entries) {
    const full = path.join(dir, e.name);
    if (e.isDirectory()) out.push(...(await walk(full)));
    else if (EXT[path.extname(e.name).toLowerCase()]) out.push(full);
  }
  return out;
}

async function main() {
  let sharp;
  try {
    ({ default: sharp } = await import('sharp'));
  } catch {
    console.error('✖ پکیج sharp نصب نیست. اول npm install بزنید.');
    process.exit(1);
  }

  const files = await walk(UPLOADS);
  if (!files.length) {
    console.log('هیچ تصویری در public/uploads پیدا نشد.');
    return;
  }

  console.log(`${files.length} تصویر پیدا شد${DRY ? ' (حالت آزمایشی — چیزی تغییر نمی‌کند)' : ''}\n`);

  let before = 0;
  let after = 0;
  let changed = 0;

  for (const file of files) {
    const rel = file.replace(`${UPLOADS}${path.sep}`, '');
    const stat = await fs.stat(file);
    const input = await fs.readFile(file);
    const format = EXT[path.extname(file).toLowerCase()];

    try {
      const image = sharp(input, { failOn: 'none' }).rotate();
      const meta = await image.metadata();

      const needsResize = meta.width > MAX_WIDTH;
      const needsRecompress = stat.size > 300 * 1024;

      if (!needsResize && !needsRecompress) {
        console.log(`  – ${rel}  ${meta.width}×${meta.height}  ${kb(stat.size)}  (نیازی نیست)`);
        before += stat.size;
        after += stat.size;
        continue;
      }

      const pipeline = needsResize ? image.resize({ width: MAX_WIDTH, withoutEnlargement: true }) : image;

      let output;
      if (format === 'png') output = await pipeline.png({ compressionLevel: 9, palette: true }).toBuffer();
      else if (format === 'jpeg') output = await pipeline.jpeg({ quality: 82, mozjpeg: true }).toBuffer();
      else output = await pipeline.webp({ quality: 82, effort: 4 }).toBuffer();

      before += stat.size;

      // اگر خروجی بزرگ‌تر شد، فایل اصلی دست‌نخورده می‌ماند
      if (output.length >= stat.size) {
        after += stat.size;
        console.log(`  – ${rel}  ${kb(stat.size)}  (بهینه‌تر نشد، رها شد)`);
        continue;
      }

      after += output.length;
      changed += 1;
      const saved = Math.round((1 - output.length / stat.size) * 100);
      const outMeta = await sharp(output).metadata();

      console.log(
        `  ${DRY ? '›' : '✔'} ${rel}  ${meta.width}×${meta.height} → ${outMeta.width}×${outMeta.height}  ` +
          `${kb(stat.size)} → ${kb(output.length)}  (${saved}٪ کمتر)`
      );

      if (!DRY) await fs.writeFile(file, output);
    } catch (err) {
      console.warn(`  ⚠ ${rel}: ${err.message}`);
      before += stat.size;
      after += stat.size;
    }
  }

  console.log(
    `\n${changed} فایل بهینه شد — مجموع ${kb(before)} → ${kb(after)} ` +
      `(${Math.max(0, Math.round((1 - after / before) * 100))}٪ کمتر)`
  );

  if (DRY) console.log('\nبرای اعمال واقعی، بدون --dry اجرا کنید.');
  else if (changed) console.log('\nکش کلادفلر این فایل‌ها را Purge کنید تا نسخه جدید سرو شود.');
}

main().catch((err) => {
  console.error('✖ خطا:', err.message);
  process.exit(1);
});
