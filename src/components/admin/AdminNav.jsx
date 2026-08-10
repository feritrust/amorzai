'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ENTITY_KEYS, ENTITIES } from '@/lib/entities';

export default function AdminNav() {
  const pathname = usePathname();

  return (
    <nav aria-label="ناوبری پنل">
      <ul className="flex items-center gap-1 overflow-x-auto">
        {ENTITY_KEYS.map((key) => {
          const active = pathname.startsWith(`/admin/${key}`);
          return (
            <li key={key}>
              <Link
                href={`/admin/${key}`}
                className={`whitespace-nowrap rounded-lg px-3 py-2 text-sm transition ${
                  active ? 'bg-sage-600 font-semibold text-white' : 'text-ink-soft hover:bg-sage-50 hover:text-sage-700'
                }`}
              >
                {ENTITIES[key].label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
