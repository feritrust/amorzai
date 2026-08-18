import Link from 'next/link';
import Image from 'next/image';
import { faDate } from '@/lib/date';
import { readingTime } from '@/lib/markdown';
import { toFa } from '@/lib/utils';
import { isPreOptimized } from '@/lib/image';

export default function ArticleCard({ article, priority = false }) {
  return (
    <article className="card card-hover group flex h-full flex-col overflow-hidden">
      <Link href={article.href} className="relative block aspect-[16/9] overflow-hidden bg-sage-50">
        <Image
          src={article.cover}
          unoptimized={isPreOptimized(article.cover)}
          alt={article.coverAlt || article.title}
          fill
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          className="object-cover transition duration-500 group-hover:scale-[1.04]"
          priority={priority}
        />
      </Link>

      <div className="flex flex-1 flex-col p-5">
        {article.tags?.length ? <span className="chip mb-2.5 self-start">{article.tags[0]}</span> : null}

        <h3 className="mb-2 text-[15px] font-bold leading-8">
          <Link href={article.href} className="hover:text-sage-700">
            {article.title}
          </Link>
        </h3>

        <p className="mb-4 line-clamp-3 flex-1 text-[13px] leading-7 text-ink-muted">{article.excerpt}</p>

        <div className="mt-auto flex items-center justify-between border-t border-line pt-3 text-[11px] text-ink-muted">
          <time dateTime={article.publishedAt}>{faDate(article.publishedAt)}</time>
          <span>{toFa(readingTime(article.content))} دقیقه مطالعه</span>
        </div>
      </div>
    </article>
  );
}
