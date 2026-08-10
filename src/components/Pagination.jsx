import Link from 'next/link';
import { toFa } from '@/lib/utils';
import Icon from '@/components/Icons';

/**
 * صفحه‌بندی SEO-friendly:
 *  - صفحه ۱ همیشه آدرس پایه است (بدون /page/1) تا duplicate content ایجاد نشود
 *  - همه لینک‌ها <a> واقعی هستند تا خزنده گوگل بتواند دنبالشان کند
 *  - rel="prev"/"next" روی لینک‌ها درج می‌شود
 */
export default function Pagination({ basePath, page, totalPages }) {
  if (totalPages <= 1) return null;

  const hrefFor = (n) => (n === 1 ? basePath : `${basePath}/page/${n}`);

  const windowSize = 2;
  const pages = [];
  for (let n = 1; n <= totalPages; n += 1) {
    const near = Math.abs(n - page) <= windowSize;
    if (n === 1 || n === totalPages || near) pages.push(n);
    else if (pages[pages.length - 1] !== '…') pages.push('…');
  }

  return (
    <nav aria-label="صفحه‌بندی" className="mt-10 flex justify-center">
      <ul className="flex flex-wrap items-center gap-1.5">
        <li>
          {page > 1 ? (
            <Link
              href={hrefFor(page - 1)}
              rel="prev"
              className="flex h-10 items-center gap-1 rounded-xl border border-line bg-white px-3 text-sm hover:border-sage-400 hover:text-sage-700"
            >
              <Icon name="chevron" className="h-4 w-4" />
              قبلی
            </Link>
          ) : (
            <span className="flex h-10 items-center gap-1 rounded-xl border border-line/60 px-3 text-sm text-ink-muted/50">
              <Icon name="chevron" className="h-4 w-4" />
              قبلی
            </span>
          )}
        </li>

        {pages.map((n, i) =>
          n === '…' ? (
            <li key={`gap-${i}`} className="px-1 text-ink-muted">
              …
            </li>
          ) : (
            <li key={n}>
              {n === page ? (
                <span
                  aria-current="page"
                  className="grid h-10 w-10 place-items-center rounded-xl bg-sage-600 text-sm font-bold text-white"
                >
                  {toFa(n)}
                </span>
              ) : (
                <Link
                  href={hrefFor(n)}
                  className="grid h-10 w-10 place-items-center rounded-xl border border-line bg-white text-sm hover:border-sage-400 hover:text-sage-700"
                >
                  {toFa(n)}
                </Link>
              )}
            </li>
          )
        )}

        <li>
          {page < totalPages ? (
            <Link
              href={hrefFor(page + 1)}
              rel="next"
              className="flex h-10 items-center gap-1 rounded-xl border border-line bg-white px-3 text-sm hover:border-sage-400 hover:text-sage-700"
            >
              بعدی
              <Icon name="chevron" className="h-4 w-4 rotate-180" />
            </Link>
          ) : (
            <span className="flex h-10 items-center gap-1 rounded-xl border border-line/60 px-3 text-sm text-ink-muted/50">
              بعدی
              <Icon name="chevron" className="h-4 w-4 rotate-180" />
            </span>
          )}
        </li>
      </ul>
    </nav>
  );
}
