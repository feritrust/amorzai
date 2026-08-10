'use client';

import { useState, useTransition } from 'react';
import { revalidateAllAction } from '@/app/admin/actions';

export default function RevalidateButton() {
  const [pending, startTransition] = useTransition();
  const [done, setDone] = useState(false);

  return (
    <div className="flex items-center gap-3">
      <button
        type="button"
        disabled={pending}
        onClick={() =>
          startTransition(async () => {
            await revalidateAllAction();
            setDone(true);
            setTimeout(() => setDone(false), 4000);
          })
        }
        className="btn-outline !px-4 !py-2.5 text-xs"
      >
        {pending ? 'در حال بازسازی…' : 'بازسازی کش صفحات اصلی'}
      </button>
      {done ? <span className="text-[12px] text-sage-700">انجام شد.</span> : null}
    </div>
  );
}
