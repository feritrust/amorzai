import { NextResponse } from 'next/server';
import { AUTH_COOKIE, verifyToken } from '@/lib/auth';

/**
 * محافظت از /admin و /api/admin.
 * صفحه ورود و دارایی‌های استاتیک مستثنا هستند.
 */
export async function middleware(request) {
  const { pathname, search } = request.nextUrl;

  // مسیر جاری را به لایه‌ها می‌رسانیم تا صفحه ورود بتواند بدون پوسته پنل رندر شود
  const headers = new Headers(request.headers);
  headers.set('x-pathname', pathname);
  const pass = () => NextResponse.next({ request: { headers } });

  if (pathname === '/admin/login') {
    // اگر از قبل وارد شده، مستقیم به داشبورد برود
    const session = await verifyToken(request.cookies.get(AUTH_COOKIE)?.value);
    if (session) return NextResponse.redirect(new URL('/admin', request.url));
    return pass();
  }

  const session = await verifyToken(request.cookies.get(AUTH_COOKIE)?.value);
  if (session) return pass();

  if (pathname.startsWith('/api/')) {
    return NextResponse.json({ ok: false, message: 'دسترسی غیرمجاز' }, { status: 401 });
  }

  const loginUrl = new URL('/admin/login', request.url);
  loginUrl.searchParams.set('next', pathname + search);
  const res = NextResponse.redirect(loginUrl);
  res.headers.set('x-robots-tag', 'noindex, nofollow');
  return res;
}

export const config = {
  matcher: ['/admin/:path*', '/api/admin/:path*'],
};
