import Link from 'next/link';
import { headers } from 'next/headers';
import AdminNav from '@/components/admin/AdminNav';
import { logoutAction } from '@/app/admin/actions';
import { hasDatabase } from '@/lib/mongodb';

// پنل هرگز نباید ایندکس شود
export const metadata = {
  title: 'پنل مدیریت آمرز',
  robots: { index: false, follow: false, nocache: true },
};

export const dynamic = 'force-dynamic';

export default async function AdminLayout({ children }) {
  // میدل‌ور مسیر جاری را در هدر می‌گذارد؛ صفحه ورود بدون نوار و منو رندر می‌شود
  const pathname = (await headers()).get('x-pathname') || '';
  if (pathname === '/admin/login') {
    return <div className="min-h-screen bg-[#F4F2EE]">{children}</div>;
  }

  return (
    <div className="min-h-screen bg-[#F4F2EE]">
      <header className="sticky top-0 z-40 border-b border-line bg-white">
        <div className="mx-auto flex h-16 max-w-[1400px] items-center justify-between gap-4 px-4">
          <div className="flex items-center gap-6">
            <Link href="/admin" className="text-base font-extrabold text-ink">
              پنل مدیریت آمرز
            </Link>
            <AdminNav />
          </div>

          <div className="flex items-center gap-2">
            <Link
              href="/"
              target="_blank"
              className="hidden rounded-lg border border-line px-3 py-2 text-xs text-ink-soft hover:border-sage-400 sm:block"
            >
              مشاهده سایت
            </Link>
            <form action={logoutAction}>
              <button type="submit" className="rounded-lg px-3 py-2 text-xs text-ink-muted hover:bg-sage-50 hover:text-sage-700">
                خروج
              </button>
            </form>
          </div>
        </div>
      </header>

      {!hasDatabase() ? (
        <div className="border-b border-gold-400/40 bg-gold-100">
          <div className="mx-auto max-w-[1400px] px-4 py-3 text-[13px] leading-7 text-gold-600">
            <strong>MONGODB_URI تنظیم نشده است.</strong> سایت در حال حاضر داده‌های داخلی را نمایش می‌دهد و پنل
            نمی‌تواند چیزی ذخیره کند. آدرس دیتابیس را در فایل <code>.env</code> بگذارید و یک‌بار{' '}
            <code>npm run seed</code> اجرا کنید.
          </div>
        </div>
      ) : null}

      <main className="mx-auto max-w-[1400px] px-4 py-8">{children}</main>
    </div>
  );
}
