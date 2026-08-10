import Link from 'next/link';
import Icon from '@/components/Icons';

export default function SectionHeading({ title, subtitle, href, linkLabel = 'مشاهده همه', as = 'h2' }) {
  const Heading = as;

  return (
    <div className="mb-7 flex items-end justify-between gap-4">
      <div>
        <Heading className="mb-1.5">{title}</Heading>
        {subtitle ? <p className="text-[13px] text-ink-muted sm:text-sm">{subtitle}</p> : null}
      </div>

      {href ? (
        <Link
          href={href}
          className="hidden shrink-0 items-center gap-1 text-sm font-semibold text-sage-700 hover:text-sage-900 sm:flex"
        >
          {linkLabel}
          <Icon name="arrow" className="h-4 w-4 rotate-180" />
        </Link>
      ) : null}
    </div>
  );
}
