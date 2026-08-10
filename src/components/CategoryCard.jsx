import Link from 'next/link';
import Icon from '@/components/Icons';
import { toFa } from '@/lib/utils';

export default function CategoryCard({ category, count }) {
  return (
    <Link
      href={category.href}
      className="card card-hover group flex items-start gap-4 p-5"
      aria-label={category.title}
    >
      <span className="grid h-12 w-12 shrink-0 place-items-center rounded-xl bg-sage-50 text-sage-600 transition group-hover:bg-sage-600 group-hover:text-white">
        <Icon name={category.icon} className="h-6 w-6" />
      </span>

      <span className="min-w-0">
        <h3 className="mb-1.5 text-[15px] font-bold group-hover:text-sage-700">{category.title}</h3>
        <p className="line-clamp-2 text-[13px] leading-7 text-ink-muted">{category.excerpt}</p>
        {count ? (
          <span className="mt-2 inline-block text-[11px] text-ink-muted">
            {toFa(count)} مورد
          </span>
        ) : null}
      </span>
    </Link>
  );
}
