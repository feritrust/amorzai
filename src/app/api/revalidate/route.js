import { NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';

export const dynamic = 'force-dynamic';

/**
 * بازسازی کش صفحات پس از تغییر داده در پنل/دیتابیس.
 *   POST /api/revalidate?secret=...&path=/category/gol-va-taj-gol
 * بدون پارامتر path، صفحه اصلی و فهرست‌ها بازسازی می‌شوند.
 */
export async function POST(request) {
  const sp = request.nextUrl.searchParams;
  const secret = sp.get('secret');

  if (!process.env.SEED_SECRET || secret !== process.env.SEED_SECRET) {
    return NextResponse.json({ ok: false, message: 'دسترسی غیرمجاز' }, { status: 401 });
  }

  const target = sp.get('path');
  const paths = target ? [target] : ['/', '/products', '/services', '/categories', '/sitemap.xml'];

  for (const p of paths) revalidatePath(p);

  return NextResponse.json({ ok: true, revalidated: paths, at: new Date().toISOString() });
}
