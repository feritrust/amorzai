'use client';

import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';

/**
 * دکمه تماس سریع، ثابت در پایین صفحه.
 *
 * عمداً از ویجت چت آماده (کریسپ، رای‌چت و…) استفاده نشده: آن‌ها چند صد کیلوبایت
 * جاوااسکریپت اضافه می‌کنند، روی Core Web Vitals اثر می‌گذارند و داده کاربر را به
 * سرور ثالث می‌فرستند. واتساپ همان کار را بدون هیچ هزینه‌ای انجام می‌دهد و
 * کاربر ایرانی هم با آن راحت‌تر است.
 */
export default function FloatingContact({ whatsapp, telegram, phone }) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  useEffect(() => setOpen(false), [pathname]);

  if (pathname?.startsWith('/admin')) return null;

  const links = [
    whatsapp && {
      href: whatsapp,
      label: 'واتساپ',
      hint: 'پاسخ سریع، حتی از خارج از کشور',
      color: 'bg-[#25D366]',
      icon: (
        <path d="M12 2a10 10 0 0 0-8.6 15l-1.3 4.6 4.8-1.2A10 10 0 1 0 12 2Zm5.4 14.2c-.2.6-1.2 1.2-1.7 1.2-.5.1-1 .1-1.7-.1a13 13 0 0 1-5-4.4c-.4-.5-1-1.4-1-2.6 0-1.2.6-1.8.9-2 .2-.3.5-.3.7-.3h.5c.2 0 .4 0 .6.5l.8 1.9c.1.2 0 .4-.1.5l-.4.5c-.1.2-.3.3-.1.6.2.3.7 1.1 1.5 1.8 1 .9 1.8 1.2 2 1.3.3.1.4 0 .6-.1l.8-1c.2-.2.4-.2.6-.1l1.8.9c.2.1.4.2.4.3 0 .1 0 .7-.2 1.1Z" />
      ),
    },
    telegram && {
      href: telegram,
      label: 'تلگرام',
      hint: 'ارسال عکس و فایل',
      color: 'bg-[#229ED9]',
      icon: <path d="M21.9 4.3 18.7 19c-.2 1-.9 1.3-1.8.8l-4.9-3.6-2.4 2.3c-.3.3-.5.5-1 .5l.4-5 9.1-8.2c.4-.4-.1-.6-.6-.2L6.3 12.7l-4.8-1.5c-1-.3-1-1 .2-1.5l18.9-7.3c.9-.3 1.6.2 1.3 1.9Z" />,
    },
    phone && {
      href: phone,
      label: 'تماس تلفنی',
      hint: 'شبانه‌روزی',
      color: 'bg-sage-600',
      icon: (
        <path d="M6.5 3h3l1.5 4-2 1.5a12 12 0 0 0 5.5 5.5L16 12l4 1.5v3a2 2 0 0 1-2.2 2A16.5 16.5 0 0 1 4.5 5.2 2 2 0 0 1 6.5 3Z" />
      ),
    },
  ].filter(Boolean);

  if (!links.length) return null;

  return (
    <div className="fixed bottom-4 left-4 z-40 print:hidden">
      {open ? (
        <ul className="mb-3 space-y-2">
          {links.map((l) => (
            <li key={l.label}>
              <a
                href={l.href}
                target={l.href.startsWith('tel:') ? undefined : '_blank'}
                rel="noopener noreferrer"
                className="flex items-center gap-3 rounded-2xl border border-line bg-white py-2.5 pl-4 pr-2.5 shadow-lift transition hover:-translate-y-0.5"
              >
                <span className={`grid h-9 w-9 shrink-0 place-items-center rounded-xl text-white ${l.color}`}>
                  <svg viewBox="0 0 24 24" className="h-5 w-5" fill="currentColor" aria-hidden="true">
                    {l.icon}
                  </svg>
                </span>
                <span className="leading-tight">
                  <span className="block text-[13px] font-bold text-ink">{l.label}</span>
                  <span className="block text-[11px] text-ink-muted">{l.hint}</span>
                </span>
              </a>
            </li>
          ))}
        </ul>
      ) : null}

      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        aria-label={open ? 'بستن راه‌های تماس' : 'راه‌های تماس سریع'}
        className="flex items-center gap-2 rounded-2xl bg-sage-600 px-4 py-3 text-white shadow-lift transition hover:bg-sage-700"
      >
        <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
          {open ? (
            <path d="M6 6l12 12M18 6 6 18" strokeLinecap="round" />
          ) : (
            <path d="M21 11.5a8.4 8.4 0 0 1-9 8.4L3 21l1.1-4.4A8.4 8.4 0 1 1 21 11.5Z" strokeLinejoin="round" />
          )}
        </svg>
        <span className="text-[13px] font-bold">{open ? 'بستن' : 'مشاوره و سفارش'}</span>
      </button>
    </div>
  );
}
