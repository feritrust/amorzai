'use client';

import { useEffect, useState } from 'react';

const KEY = 'amorz_no_track';

export default function ExcludeMeToggle() {
  const [excluded, setExcluded] = useState(false);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    try {
      setExcluded(window.localStorage.getItem(KEY) === '1');
    } catch {
      /* مرور خصوصی */
    }
    setReady(true);
  }, []);

  function toggle() {
    try {
      const next = !excluded;
      if (next) window.localStorage.setItem(KEY, '1');
      else window.localStorage.removeItem(KEY);
      setExcluded(next);
    } catch {
      /* بی‌صدا رد شود */
    }
  }

  if (!ready) return <div className="h-10" />;

  return (
    <div className="flex items-center gap-3">
      <button
        type="button"
        onClick={toggle}
        aria-pressed={excluded}
        className={excluded ? 'btn-primary !px-4 !py-2.5 text-xs' : 'btn-outline !px-4 !py-2.5 text-xs'}
      >
        {excluded ? 'فعال است — بازدیدهای من ثبت نمی‌شود' : 'بازدیدهای من ثبت نشود'}
      </button>
      {excluded ? (
        <span className="text-[12px] text-sage-700">برای برگرداندن، دوباره کلیک کنید.</span>
      ) : null}
    </div>
  );
}
