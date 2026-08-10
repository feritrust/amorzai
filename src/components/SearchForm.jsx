'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useState } from 'react';
import Icon from '@/components/Icons';

export default function SearchForm() {
  const router = useRouter();
  const params = useSearchParams();
  const [value, setValue] = useState(params.get('q') || '');

  function onSubmit(e) {
    e.preventDefault();
    const q = value.trim();
    router.push(q ? `/search?q=${encodeURIComponent(q)}` : '/search');
  }

  return (
    <form onSubmit={onSubmit} role="search" className="flex gap-2">
      <label htmlFor="site-search" className="sr-only">
        جستجو در محصولات و خدمات آمرز
      </label>
      <div className="relative flex-1">
        <Icon
          name="search"
          className="pointer-events-none absolute right-3 top-1/2 h-5 w-5 -translate-y-1/2 text-ink-muted"
        />
        <input
          id="site-search"
          name="q"
          type="search"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder="مثلاً: تاج گل، صندلی، مداح، سنگ مزار…"
          className="w-full rounded-xl border border-line bg-white py-3 pr-11 pl-4 text-sm outline-none placeholder:text-ink-muted/70 focus:border-sage-400"
        />
      </div>
      <button type="submit" className="btn-primary shrink-0">
        جستجو
      </button>
    </form>
  );
}
