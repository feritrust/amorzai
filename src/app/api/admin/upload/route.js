import { NextResponse } from 'next/server';
import { randomBytes } from 'node:crypto';
import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { slugify } from '@/lib/slugify';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const MAX_BYTES = 5 * 1024 * 1024; // ۵ مگابایت
const ALLOWED = {
  'image/jpeg': 'jpg',
  'image/png': 'png',
  'image/webp': 'webp',
  'image/avif': 'avif',
  'image/svg+xml': 'svg',
};

/**
 * آپلود تصویر روی همان سرور. فایل در public/uploads/YYYY/MM ذخیره می‌شود.
 * توجه: روی هاست‌های بدون فایل‌سیستم پایدار (مثل Vercel) کار نمی‌کند.
 * دسترسی این مسیر توسط middleware محافظت شده است.
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
      return NextResponse.json({ ok: false, message: 'حجم فایل نباید بیشتر از ۵ مگابایت باشد' }, { status: 413 });
    }

    const now = new Date();
    const dir = path.join(
      process.cwd(),
      'public',
      'uploads',
      String(now.getFullYear()),
      String(now.getMonth() + 1).padStart(2, '0')
    );
    await mkdir(dir, { recursive: true });

    const base = slugify(path.parse(file.name || 'image').name) || 'image';
    const filename = `${base}-${randomBytes(4).toString('hex')}.${ext}`;

    const buffer = Buffer.from(await file.arrayBuffer());
    await writeFile(path.join(dir, filename), buffer);

    const url = `/uploads/${now.getFullYear()}/${String(now.getMonth() + 1).padStart(2, '0')}/${filename}`;
    return NextResponse.json({ ok: true, url, size: file.size });
  } catch (err) {
    console.error('[upload]', err);
    return NextResponse.json({ ok: false, message: 'آپلود ناموفق بود: ' + err.message }, { status: 500 });
  }
}
