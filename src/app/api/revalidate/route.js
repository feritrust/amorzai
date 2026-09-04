import { NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';

export const dynamic = 'force-dynamic';

/**
 * بازسازی کش صفحات پس از تغییر داده در پنل/دیتابیس.
 *
 *   POST /api/revalidate?secret=...                          ← صفحه اصلی و فهرست‌ها
 *   POST /api/revalidate?secret=...&path=/product/taj-gol     ← یک صفحه مشخص
 *   POST /api/revalidate?secret=...&all=1                     ← همه صفحات سایت
 *
 * حالت all برای وقتی است که داده را دسته‌جمعی از اسکریپت عوض کرده‌اید
 * (import:catalog یا set:images)؛ در آن حالت ده‌ها صفحه محصول و دسته‌بندی
 * کهنه می‌شوند و بازسازی تک‌تکشان عملی نیست.
 */
export async function POST(request) {
  const sp = request.nextUrl.searchParams;
  const secret = sp.get('secret');

  if (!process.env.SEED_SECRET || secret !== process.env.SEED_SECRET) {
    return NextResponse.json({ ok: false, message: 'دسترسی غیرمجاز' }, { status: 401 });
  }

  // revalidatePath با 'layout' کل درخت زیر آن مسیر را باطل می‌کند
  if (sp.get('all')) {
    revalidatePath('/', 'layout');
    return NextResponse.json({
      ok: true,
      revalidated: 'همه صفحات',
      at: new Date().toISOString(),
    });
  }

  const target = sp.get('path');
  const paths = target ? [target] : ['/', '/products', '/services', '/categories', '/sitemap.xml'];

  for (const p of paths) revalidatePath(p);

  return NextResponse.json({ ok: true, revalidated: paths, at: new Date().toISOString() });
}
