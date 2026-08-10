import Icon from '@/components/Icons';

/**
 * از <details> بومی استفاده می‌کند: بدون جاوااسکریپت کار می‌کند و
 * متن پاسخ‌ها همیشه در HTML اولیه حاضر است تا گوگل آن را ایندکس کند.
 */
export default function Faq({ items = [], title = 'سوالات متداول', headingLevel = 'h2' }) {
  if (!items.length) return null;
  const Heading = headingLevel;

  return (
    <section className="section" aria-labelledby="faq-heading">
      <Heading id="faq-heading" className="mb-6">
        {title}
      </Heading>

      <div className="space-y-3">
        {items.map((f, i) => (
          <details key={i} className="card group overflow-hidden p-0" open={i === 0}>
            <summary className="flex cursor-pointer list-none items-center justify-between gap-4 p-5 text-[15px] font-semibold text-ink marker:hidden">
              {f.q}
              <Icon
                name="chevron"
                className="h-5 w-5 shrink-0 -rotate-90 text-sage-400 transition group-open:rotate-90"
              />
            </summary>
            <div className="border-t border-line px-5 py-4 text-[14px] leading-[2.1] text-ink-soft">
              {f.a}
            </div>
          </details>
        ))}
      </div>
    </section>
  );
}
