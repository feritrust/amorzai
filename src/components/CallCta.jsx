import { telHref } from '@/lib/site';
import { getSettings } from '@/lib/queries';
import { toFa } from '@/lib/utils';
import Icon from '@/components/Icons';

export default async function CallCta({
  title = 'برای ثبت سفارش تماس بگیرید',
  text = 'سایت آمرز درگاه پرداخت آنلاین ندارد. کارشناسان ما به‌صورت شبانه‌روزی پاسخگو هستند و سفارش شما را تلفنی ثبت و هماهنگ می‌کنند.',
  compact = false,
}) {
  const s = await getSettings();

  return (
    <section
      className={`overflow-hidden rounded-2xl bg-sage-900 text-white ${compact ? 'p-6' : 'p-8 sm:p-10'}`}
      aria-labelledby="cta-heading"
    >
      <div className="flex flex-col items-start justify-between gap-6 lg:flex-row lg:items-center">
        <div className="max-w-xl">
          <h2 id="cta-heading" className="mb-2 text-xl font-bold text-white sm:text-2xl">
            {title}
          </h2>
          <p className="text-[14px] leading-[2.1] text-sage-100">{text}</p>
        </div>

        <div className="flex w-full shrink-0 flex-col gap-3 sm:w-auto sm:flex-row">
          <a href={telHref(s.phone)} className="btn bg-white text-sage-900 hover:bg-sage-50">
            <Icon name="phone" className="h-4 w-4" />
            <span className="font-extrabold tracking-wide">{toFa(s.phone)}</span>
          </a>
          <a
            href={telHref(s.mobile)}
            className="btn border border-white/25 text-white hover:bg-white/10"
          >
            <Icon name="phone" className="h-4 w-4" />
            {toFa(s.mobile)}
          </a>
        </div>
      </div>
    </section>
  );
}
