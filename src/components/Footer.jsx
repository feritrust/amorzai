import Link from 'next/link';
import { getCategories, getSettings } from '@/lib/queries';
import { telHref } from '@/lib/site';
import { toFa } from '@/lib/utils';
import Icon from '@/components/Icons';

export default async function Footer() {
  const categories = await getCategories();
  const s = await getSettings();
  const year = toFa(new Date().getFullYear());

  return (
    <footer className="mt-16 border-t border-line bg-white">
      <div className="container grid gap-10 py-14 md:grid-cols-2 lg:grid-cols-4">
        <div>
          <div className="mb-4 flex items-center gap-2.5">
            <span className="grid h-10 w-10 place-items-center rounded-xl bg-sage-600 text-white">
              <Icon name="flower" className="h-6 w-6" />
            </span>
            <span className="text-lg font-extrabold">آمرز</span>
          </div>
          <p className="text-sm leading-8 text-ink-muted">{s.footerAbout}</p>
        </div>

        <nav aria-label="دسته‌بندی محصولات">
          <h2 className="mb-4 text-sm font-bold text-ink">محصولات</h2>
          <ul className="space-y-2.5 text-sm text-ink-muted">
            {categories
              .filter((c) => c.kind === 'product')
              .map((c) => (
                <li key={c.slug}>
                  <Link href={c.href} className="hover:text-sage-700">
                    {c.title}
                  </Link>
                </li>
              ))}
          </ul>
        </nav>

        <nav aria-label="دسته‌بندی خدمات">
          <h2 className="mb-4 text-sm font-bold text-ink">خدمات</h2>
          <ul className="space-y-2.5 text-sm text-ink-muted">
            {categories
              .filter((c) => c.kind === 'service')
              .map((c) => (
                <li key={c.slug}>
                  <Link href={c.href} className="hover:text-sage-700">
                    {c.title}
                  </Link>
                </li>
              ))}
          </ul>
        </nav>

        <div>
          <h2 className="mb-4 text-sm font-bold text-ink">تماس با آمرز</h2>
          <ul className="space-y-3 text-sm text-ink-muted">
            <li>
              <a href={telHref(s.phone)} className="flex items-center gap-2 hover:text-sage-700">
                <Icon name="phone" className="h-4 w-4 text-sage-400" />
                <span className="font-bold text-ink">{toFa(s.phone)}</span>
              </a>
            </li>
            <li>
              <a href={telHref(s.mobile)} className="flex items-center gap-2 hover:text-sage-700">
                <Icon name="phone" className="h-4 w-4 text-sage-400" />
                {toFa(s.mobile)}
              </a>
            </li>
            <li className="flex items-start gap-2">
              <Icon name="pin" className="mt-1 h-4 w-4 shrink-0 text-sage-400" />
              {s.address.street}، {s.address.city}
            </li>
            <li className="flex items-center gap-2">
              <Icon name="clock" className="h-4 w-4 text-sage-400" />
              {s.openingHours}
            </li>
          </ul>

          <ul className="mt-5 space-y-2.5 text-sm text-ink-muted">
            <li>
              <Link href="/jostojoye-motevafi" className="hover:text-sage-700">
                جستجوی متوفی
              </Link>
            </li>
            <li>
              <Link href="/categories" className="hover:text-sage-700">
                همه دسته‌بندی‌ها
              </Link>
            </li>
            <li>
              <Link href="/blog" className="hover:text-sage-700">
                مجله آمرز
              </Link>
            </li>
            <li>
              <Link href="/faq" className="hover:text-sage-700">
                سوالات متداول
              </Link>
            </li>
          </ul>

          <ul className="mt-5 flex flex-wrap gap-3 text-sm">
            {[
              { href: s.social.instagram, label: 'اینستاگرام' },
              { href: s.social.telegram, label: 'تلگرام' },
              { href: s.social.whatsapp, label: 'واتساپ' },
            ]
              .filter((l) => l.href)
              .map((l) => (
                <li key={l.label}>
                  <a
                    href={l.href}
                    rel="noopener noreferrer nofollow"
                    target="_blank"
                    className="rounded-lg border border-line px-3 py-2 hover:border-sage-400 hover:text-sage-700"
                  >
                    {l.label}
                  </a>
                </li>
              ))}
          </ul>
        </div>
      </div>

      <div className="border-t border-line">
        <div className="container flex flex-col items-center justify-between gap-3 py-5 text-xs text-ink-muted sm:flex-row">
          <p>© {year} آمرز — تمامی حقوق محفوظ است.</p>
          <p>این سایت درگاه پرداخت آنلاین ندارد؛ ثبت سفارش فقط تلفنی انجام می‌شود.</p>
        </div>
      </div>
    </footer>
  );
}
