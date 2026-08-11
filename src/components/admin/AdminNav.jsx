'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ENTITY_KEYS, ENTITIES } from '@/lib/entities';

export default function AdminNav() {
  const pathname = usePathname();

  const links = [
    ...ENTITY_KEYS.map((key) => ({ href: `/admin/${key}`, label: ENTITIES[key].label })),
    { href: '/admin/analytics', label: 'آمار بازدید' },
    { href: '/admin/settings', label: 'تنظیمات' },
  ];

  return (
    <nav aria-label="ناوبری پنل">
      <ul className="flex items-center gap-1 overflow-x-auto">
        {links.map((link) => {
          const active = pathname.startsWith(link.href);
          return (
            <li key={link.href}>
              <Link
                href={link.href}
                className={`whitespace-nowrap rounded-lg px-3 py-2 text-sm transition ${
                  active ? 'bg-sage-600 font-semibold text-white' : 'text-ink-soft hover:bg-sage-50 hover:text-sage-700'
                }`}
              >
                {link.label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
