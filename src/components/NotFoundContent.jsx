import Link from 'next/link';
import { getCategories, getSettings } from '@/lib/queries';
import Icon from '@/components/Icons';
import { telHref } from '@/lib/site';
import { toFa } from '@/lib/utils';

export default async function NotFoundContent() {
  const categories = await getCategories();
  const s = await getSettings();

  return (
    <div className="container flex flex-col items-center py-20 text-center">
      <span className="mb-6 grid h-16 w-16 place-items-center rounded-2xl bg-sage-50 text-sage-600">
        <Icon name="search" className="h-8 w-8" />
      </span>

      <h1 className="mb-3">صفحه مورد نظر پیدا نشد</h1>
      <p className="mb-8 max-w-md text-[14px] leading-8 text-ink-muted">
        ممکن است این صفحه حذف شده یا آدرس را اشتباه وارد کرده باشید. از طریق دسته‌بندی‌های زیر
        می‌توانید آنچه را دنبالش هستید پیدا کنید.
      </p>

      <div className="mb-10 flex flex-wrap justify-center gap-2">
        {categories.map((c) => (
          <Link
            key={c.slug}
            href={c.href}
            className="rounded-xl border border-line bg-white px-4 py-2.5 text-sm hover:border-sage-400 hover:text-sage-700"
          >
            {c.shortTitle}
          </Link>
        ))}
      </div>

      <div className="flex flex-col gap-3 sm:flex-row">
        <Link href="/" className="btn-primary">
          بازگشت به صفحه اصلی
        </Link>
        <a href={telHref(s.phone)} className="btn-outline">
          <Icon name="phone" className="h-4 w-4" />
          {toFa(s.phone)}
        </a>
      </div>
    </div>
  );
}
