'use client';

import { useEffect, useRef } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';

/**
 * ثبت بازدید بدون کوکی و بدون سرویس خارجی.
 * چون صفحات سایت استاتیک و پشت کش کلادفلر هستند، شمارش سمت سرور قابل اعتماد نیست
 * و این بیکن سبک (چند صد بایت) کار را انجام می‌دهد.
 */
export default function Analytics() {
  const pathname = usePathname();
  const search = useSearchParams();
  const last = useRef(null);

  useEffect(() => {
    if (!pathname || pathname.startsWith('/admin')) return;
    if (last.current === pathname) return;
    last.current = pathname;

    // بازدید خود مدیر هنگام کار با سایت شمارش نشود
    try {
      if (window.localStorage.getItem('amorz_no_track') === '1') return;
    } catch {
      /* حالت مرور خصوصی */
    }

    const payload = JSON.stringify({ path: pathname, referrer: document.referrer || '' });

    const send = () => {
      try {
        if (navigator.sendBeacon) {
          navigator.sendBeacon('/api/track', new Blob([payload], { type: 'application/json' }));
        } else {
          fetch('/api/track', {
            method: 'POST',
            body: payload,
            headers: { 'Content-Type': 'application/json' },
            keepalive: true,
          }).catch(() => {});
        }
      } catch {
        /* ثبت آمار هرگز نباید تجربه کاربر را خراب کند */
      }
    };

    // کمی تأخیر تا با رندر اولیه رقابت نکند و روی LCP اثر نگذارد
    const t = setTimeout(send, 800);
    return () => clearTimeout(t);
  }, [pathname, search]);

  return null;
}
