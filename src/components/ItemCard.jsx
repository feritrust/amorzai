import Link from 'next/link';
import Image from 'next/image';
import { formatPrice } from '@/lib/utils';
import Icon from '@/components/Icons';
import { isPreOptimized } from '@/lib/image';

export default function ItemCard({ item, categoryTitle, priority = false }) {
  return (
    <article className="card card-hover group flex h-full flex-col overflow-hidden">
      <Link href={item.href} className="relative block aspect-[4/3] overflow-hidden bg-sage-50">
        <Image
          src={item.image}
          unoptimized={isPreOptimized(item.image)}
          alt={`${item.title} — ${categoryTitle || 'آمرز'}`}
          fill
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
          className="object-cover transition duration-500 group-hover:scale-[1.04]"
          priority={priority}
        />
        <span className="absolute right-3 top-3 rounded-full bg-white/95 px-3 py-1 text-[11px] font-medium text-sage-700 shadow-sm">
          {item.type === 'product' ? 'محصول' : 'خدمت'}
        </span>
      </Link>

      <div className="flex flex-1 flex-col p-4">
        {categoryTitle ? <span className="chip mb-2 self-start">{categoryTitle}</span> : null}

        <h3 className="mb-2 text-[15px] font-bold leading-8">
          <Link href={item.href} className="hover:text-sage-700">
            {item.title}
          </Link>
        </h3>

        <p className="mb-4 line-clamp-2 flex-1 text-[13px] leading-7 text-ink-muted">{item.excerpt}</p>

        <div className="mt-auto flex items-end justify-between border-t border-line pt-3">
          <div>
            <span className="block text-[15px] font-extrabold text-sage-700">
              {formatPrice(item.price)}
            </span>
            {item.price ? (
              <span className="text-[11px] text-ink-muted">{item.unit}</span>
            ) : null}
          </div>
          <Link
            href={item.href}
            className="flex items-center gap-1 text-xs font-semibold text-ink-muted hover:text-sage-700"
            aria-label={`مشاهده جزئیات ${item.title}`}
          >
            جزئیات
            <Icon name="arrow" className="h-4 w-4 rotate-180" />
          </Link>
        </div>
      </div>
    </article>
  );
}
