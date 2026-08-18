import { NextResponse } from 'next/server';
import { randomBytes } from 'node:crypto';
import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { slugify } from '@/lib/slugify';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const MAX_BYTES = 15 * 1024 * 1024; // ورودی تا ۱۵ مگابایت؛ خروجی بعد از فشرده‌سازی خیلی کمتر است
const MAX_WIDTH = 1600; // عرض بیشتر از این برای سایت لازم نیست
const WEBP_QUALITY = 82;

const ALLOWED = {
  'image/jpeg': 'jpg',
  'image/png': 'png',
  'image/webp': 'webp',
  'image/avif': 'avif',
  'image/svg+xml': 'svg',
};

/**
 * آپلود تصویر روی همان سرور.
 *
 * تصاویر رستری هنگام آپلود با sharp پردازش می‌شوند: چرخش خودکار بر اساس EXIF،
 * محدود شدن عرض به ۱۶۰۰ پیکسل، تبدیل به WebP و حذف متادیتا.
 *
 * چرا اینجا و نه با بهینه‌ساز زمان اجرا؟ چون خروجی قطعی و سبک است، به CPU سرور
 * در هر بازدید نیاز ندارد، برای همیشه قابل کش است و وابسته به مسیر /_next/image
 * نیست — همان مسیری که اگر Nginx یا دسترسی فایل درست نباشد، خطای ۴۰۰ می‌دهد.
 */
export async function POST(request) {
  try {
    const form = await request.formData();
    const file = form.get('file');

    if (!file || typeof file === 'string') {
      return NextResponse.json({ ok: false, message: 'فایلی ارسال نشده است' }, { status: 400 });
    }

    const ext = ALLOWED[file.type];
    if (!ext) {
      return NextResponse.json(
        { ok: false, message: 'فقط JPG، PNG، WebP، AVIF و SVG پذیرفته می‌شود' },
        { status: 415 }
      );
    }
    if (file.size > MAX_BYTES) {
      return NextResponse.json(
        { ok: false, message: 'حجم فایل نباید بیشتر از ۱۵ مگابایت باشد' },
        { status: 413 }
      );
    }

    const now = new Date();
    const year = String(now.getFullYear());
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const dir = path.join(process.cwd(), 'public', 'uploads', year, month);
    await mkdir(dir, { recursive: true });

    const base = slugify(path.parse(file.name || 'image').name) || 'image';
    const input = Buffer.from(await file.arrayBuffer());

    let outBuffer = input;
    let outExt = ext;
    let width = null;
    let height = null;

    if (ext !== 'svg') {
      try {
        const { default: sharp } = await import('sharp');
        const image = sharp(input, { failOn: 'none' }).rotate(); // rotate() یعنی اعمال جهت EXIF
        const meta = await image.metadata();

        if (!meta.width || !meta.height) throw new Error('فایل تصویر معتبری نیست');

        const pipeline =
          meta.width > MAX_WIDTH ? image.resize({ width: MAX_WIDTH, withoutEnlargement: true }) : image;

        outBuffer = await pipeline.webp({ quality: WEBP_QUALITY, effort: 4 }).toBuffer();
        outExt = 'webp';

        const outMeta = await sharp(outBuffer).metadata();
        width = outMeta.width;
        height = outMeta.height;
      } catch (err) {
        // اگر پردازش ممکن نبود، فایل اصلی ذخیره می‌شود تا آپلود کلاً شکست نخورد
        console.warn('[upload] پردازش تصویر انجام نشد، فایل خام ذخیره شد:', err.message);
        outBuffer = input;
        outExt = ext;
      }
    }

    const filename = `${base}-${randomBytes(4).toString('hex')}.${outExt}`;
    await writeFile(path.join(dir, filename), outBuffer);

    return NextResponse.json({
      ok: true,
      url: `/uploads/${year}/${month}/${filename}`,
      size: outBuffer.length,
      originalSize: input.length,
      width,
      height,
      optimized: outExt === 'webp',
    });
  } catch (err) {
    console.error('[upload]', err);
    return NextResponse.json({ ok: false, message: 'آپلود ناموفق بود: ' + err.message }, { status: 500 });
  }
}
