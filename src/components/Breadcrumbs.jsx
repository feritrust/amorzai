import Link from 'next/link';
import Icon from '@/components/Icons';

/**
 * items: [{ name, path }] — آخرین آیتم صفحه فعلی است و لینک نمی‌شود.
 * نسخه Schema این مسیر جداگانه با breadcrumbSchema تزریق می‌شود.
 */
export default function Breadcrumbs({ items = [] }) {
  if (!items.length) return null;

  return (
    <nav aria-label="مسیر صفحه" className="py-4">
      <ol className="flex flex-wrap items-center gap-1 text-xs text-ink-muted sm:text-[13px]">
        {items.map((item, idx) => {
          const isLast = idx === items.length - 1;
          return (
            <li key={item.path} className="flex items-center gap-1">
              {isLast ? (
                <span aria-current="page" className="font-medium text-ink">
                  {item.name}
                </span>
              ) : (
                <>
                  <Link href={item.path} className="hover:text-sage-700">
                    {item.name}
                  </Link>
                  <Icon name="chevron" className="h-3.5 w-3.5 rotate-180 text-line" />
                </>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
