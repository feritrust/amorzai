'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import Icon from '@/components/Icons';

export default function MobileMenu({ nav = [] }) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [open]);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="rounded-lg p-2 text-ink-soft hover:bg-sage-50 lg:hidden"
        aria-label="باز کردن منو"
        aria-expanded={open}
      >
        <Icon name="menu" className="h-6 w-6" />
      </button>

      {open ? (
        <div className="fixed inset-0 z-[60] lg:hidden">
          <div
            className="absolute inset-0 bg-ink/40"
            onClick={() => setOpen(false)}
            aria-hidden="true"
          />
          <div className="absolute inset-y-0 right-0 flex w-[86%] max-w-sm flex-col bg-paper shadow-lift">
            <div className="flex items-center justify-between border-b border-line px-4 py-4">
              <span className="text-base font-bold">منوی آمرز</span>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="rounded-lg p-2 text-ink-soft hover:bg-sage-50"
                aria-label="بستن منو"
              >
                <Icon name="close" className="h-5 w-5" />
              </button>
            </div>

            <nav aria-label="ناوبری موبایل" className="flex-1 overflow-y-auto p-4">
              <ul className="space-y-1">
                {nav.map((item) => (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      className="block rounded-lg px-3 py-3 text-sm font-semibold text-ink hover:bg-sage-50"
                    >
                      {item.label}
                    </Link>
                    {item.children?.length ? (
                      <ul className="mb-2 mr-3 border-r border-line pr-3">
                        {item.children.map((c) => (
                          <li key={c.slug}>
                            <Link
                              href={c.href}
                              className="block rounded-lg px-3 py-2 text-sm text-ink-muted hover:bg-sage-50 hover:text-sage-700"
                            >
                              {c.shortTitle}
                            </Link>
                          </li>
                        ))}
                      </ul>
                    ) : null}
                  </li>
                ))}
              </ul>
            </nav>
          </div>
        </div>
      ) : null}
    </>
  );
}
