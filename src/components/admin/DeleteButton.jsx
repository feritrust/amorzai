'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { deleteEntityAction } from '@/app/admin/actions';

export default function DeleteButton({ entityKey, id, title }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [confirming, setConfirming] = useState(false);
  const [error, setError] = useState(null);

  if (!confirming) {
    return (
      <button
        type="button"
        onClick={() => setConfirming(true)}
        className="rounded-lg px-2.5 py-1.5 text-[12px] text-ink-muted hover:bg-red-50 hover:text-red-600"
      >
        حذف
      </button>
    );
  }

  return (
    <span className="inline-flex items-center gap-1.5">
      {error ? <span className="max-w-56 text-[11px] leading-5 text-red-600">{error}</span> : null}
      <button
        type="button"
        disabled={pending}
        onClick={() =>
          startTransition(async () => {
            const res = await deleteEntityAction(entityKey, id);
            if (res.ok) router.refresh();
            else {
              setError(res.message);
              setConfirming(false);
            }
          })
        }
        className="rounded-lg bg-red-600 px-2.5 py-1.5 text-[12px] font-medium text-white hover:bg-red-700 disabled:opacity-50"
        aria-label={`حذف ${title}`}
      >
        {pending ? '…' : 'مطمئنم'}
      </button>
      <button
        type="button"
        onClick={() => setConfirming(false)}
        className="rounded-lg px-2 py-1.5 text-[12px] text-ink-muted hover:bg-sage-50"
      >
        انصراف
      </button>
    </span>
  );
}
