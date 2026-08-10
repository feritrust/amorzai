import Link from 'next/link';
import { getCategories } from '@/lib/queries';
import { site, telHref } from '@/lib/site';
import { toFa } from '@/lib/utils';
import Icon from '@/components/Icons';
import MobileMenu from '@/components/MobileMenu';

export default async function Header() {
  const categories = await getCategories();
  const productCats = categories.filter((c) => c.kind === 'product');
  const serviceCats = categories.filter((c) => c.kind === 'service');

  const nav = [
    { href: '/products', label: 'محصولات', children: productCats },
    { href: '/services', label: 'خدمات', children: serviceCats },
    { href: '/categories', label: 'دسته‌بندی‌ها' },
    { href: '/blog', label: 'مجله' },
    { href: '/about', label: 'درباره آمرز' },
    { href: '/faq', label: 'سوالات متداول' },
    { href: '/contact', label: 'تماس با ما' },
  ];

  return (
    <header className="sticky top-0 z-50 border-b border-line bg-paper/90 backdrop-blur">
      {/* نوار بالایی */}
      <div className="hidden border-b border-line/70 bg-sage-900 text-sage-100 lg:block">
        <div className="container flex h-9 items-center justify-between text-xs">
          <p className="flex items-center gap-2">
            <Icon name="clock" className="h-4 w-4" />
            پاسخگویی شبانه‌روزی، ۷ روز هفته
          </p>
          <p className="flex items-center gap-2">
            <Icon name="pin" className="h-4 w-4" />
            {site.address.street}
          </p>
        </div>
      </div>

      <div className="container flex h-16 items-center justify-between gap-4 lg:h-20">
        <Link href="/" className="flex shrink-0 items-center gap-2.5" aria-label="آمرز — صفحه اصلی">
          <span className="grid h-10 w-10 place-items-center rounded-xl bg-sage-600 text-white">
            <Icon name="flower" className="h-6 w-6" />
          </span>
          <span className="leading-tight">
            <span className="block text-lg font-extrabold text-ink">آمرز</span>
            <span className="block text-[11px] text-ink-muted">خدمات مراسم ترحیم</span>
          </span>
        </Link>

        <nav aria-label="ناوبری اصلی" className="hidden lg:block">
          <ul className="flex items-center gap-1">
            {nav.map((item) => (
              <li key={item.href} className="group relative">
                <Link
                  href={item.href}
                  className="flex items-center gap-1 rounded-lg px-3 py-2 text-sm font-medium text-ink-soft hover:bg-sage-50 hover:text-sage-700"
                >
                  {item.label}
                </Link>

                {item.children?.length ? (
                  <div className="invisible absolute right-0 top-full w-64 pt-2 opacity-0 transition group-hover:visible group-hover:opacity-100 group-focus-within:visible group-focus-within:opacity-100">
                    <ul className="card overflow-hidden p-2">
                      {item.children.map((c) => (
                        <li key={c.slug}>
                          <Link
                            href={c.href}
                            className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-ink-soft hover:bg-sage-50 hover:text-sage-700"
                          >
                            <Icon name={c.icon} className="h-4 w-4 text-sage-400" />
                            {c.shortTitle}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </div>
                ) : null}
              </li>
            ))}
          </ul>
        </nav>

        <div className="flex items-center gap-2">
          <Link href="/search" className="hidden rounded-lg p-2 text-ink-soft hover:bg-sage-50 sm:block" aria-label="جستجو">
            <Icon name="search" />
          </Link>
          <a href={telHref(site.phone)} className="btn-primary !px-4 !py-2.5 text-xs sm:text-sm">
            <Icon name="phone" className="h-4 w-4" />
            <span className="font-bold tracking-wide">{toFa(site.phone)}</span>
          </a>
          <MobileMenu nav={nav} />
        </div>
      </div>
    </header>
  );
}
