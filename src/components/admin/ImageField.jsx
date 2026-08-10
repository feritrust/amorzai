'use client';

import { useRef, useState } from 'react';

export default function ImageField({ value, onChange }) {
  const inputRef = useRef(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(null);

  async function upload(file) {
    if (!file) return;
    setError(null);
    setBusy(true);
    try {
      const body = new FormData();
      body.append('file', file);
      const res = await fetch('/api/admin/upload', { method: 'POST', body });
      const data = await res.json();
      if (!res.ok || !data.ok) throw new Error(data.message || 'آپلود ناموفق بود');
      onChange(data.url);
    } catch (e) {
      setError(e.message);
    } finally {
      setBusy(false);
      if (inputRef.current) inputRef.current.value = '';
    }
  }

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap items-start gap-3">
        <div className="grid h-24 w-32 shrink-0 place-items-center overflow-hidden rounded-xl border border-line bg-sage-50">
          {value ? (
            // نمایش ساده پیش‌نمایش؛ بهینه‌سازی لازم نیست چون فقط در پنل است
            // eslint-disable-next-line @next/next/no-img-element
            <img src={value} alt="پیش‌نمایش" className="h-full w-full object-cover" />
          ) : (
            <span className="text-[11px] text-ink-muted">بدون تصویر</span>
          )}
        </div>

        <div className="flex-1 space-y-2">
          <input
            dir="ltr"
            value={value || ''}
            onChange={(e) => onChange(e.target.value)}
            placeholder="/uploads/... یا آدرس کامل تصویر"
            className="w-full rounded-xl border border-line bg-white px-3.5 py-2.5 text-left font-mono text-[12px] outline-none focus:border-sage-400"
          />

          <div className="flex gap-2">
            <button
              type="button"
              disabled={busy}
              onClick={() => inputRef.current?.click()}
              className="rounded-lg border border-line px-3 py-2 text-[12px] hover:border-sage-400 hover:text-sage-700 disabled:opacity-50"
            >
              {busy ? 'در حال آپلود…' : 'آپلود تصویر'}
            </button>
            {value ? (
              <button
                type="button"
                onClick={() => onChange('')}
                className="rounded-lg border border-line px-3 py-2 text-[12px] text-ink-muted hover:border-red-300 hover:text-red-600"
              >
                حذف
              </button>
            ) : null}
          </div>
        </div>
      </div>

      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/avif,image/svg+xml"
        className="hidden"
        onChange={(e) => upload(e.target.files?.[0])}
      />

      {error ? <p className="text-[12px] text-red-600">{error}</p> : null}
    </div>
  );
}
