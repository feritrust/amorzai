import LoginForm from '@/components/admin/LoginForm';

export const metadata = {
  title: 'ورود به پنل مدیریت',
  robots: { index: false, follow: false },
};

export const dynamic = 'force-dynamic';

export default async function LoginPage({ searchParams }) {
  const sp = await searchParams;
  const next = typeof sp?.next === 'string' ? sp.next : '/admin';

  return (
    <div className="flex min-h-[70vh] items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="mb-8 text-center">
          <h1 className="mb-2 text-xl font-extrabold">ورود به پنل مدیریت</h1>
          <p className="text-[13px] text-ink-muted">این بخش فقط برای مدیران سایت آمرز است.</p>
        </div>

        <LoginForm next={next} />
      </div>
    </div>
  );
}
