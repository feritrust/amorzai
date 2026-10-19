'use client';

import { useEffect, useRef, useState } from 'react';
import { BZO_URL } from '@/lib/bzo/protocol.mjs';
import { toFa } from '@/lib/utils';

const inputClass = 'w-full rounded-xl border border-line bg-white px-4 py-3 text-sm outline-none focus:border-sage-500 disabled:opacity-60';

export default function DeceasedSearch() {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [result, setResult] = useState(null);
  const activeRequest = useRef(null);

  useEffect(() => () => activeRequest.current?.abort(), []);

  async function submit(event) {
    event.preventDefault();
    if (busy) return;
    const data = new FormData(event.currentTarget);
    const query = Object.fromEntries(['firstName', 'lastName', 'fatherName', 'part', 'dateFrom', 'dateTo'].map(key => [key, String(data.get(key) || '').trim()]));
    const controller = new AbortController();
    activeRequest.current = controller;
    const timeout = setTimeout(() => controller.abort(), 30_000);
    setBusy(true);
    setError('');
    setResult(null);
    try {
      const response = await fetch('/api/deceased-search', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(query), signal: controller.signal, cache: 'no-store',
      });
      const payload = await response.json();
      if (!response.ok || !payload.ok) {
        setError(typeof payload.message === 'string' ? payload.message : 'جستجو انجام نشد؛ دوباره تلاش کنید.');
        return;
      }
      if (!Array.isArray(payload.records)) throw new Error('Invalid search response');
      setResult(payload);
    } catch {
      setError('پاسخی دریافت نشد. دوباره تلاش کنید یا از سامانه رسمی استفاده کنید.');
    } finally {
      clearTimeout(timeout);
      activeRequest.current = null;
      setBusy(false);
    }
  }

  return (
    <section className="card mb-10 overflow-hidden" aria-labelledby="deceased-search-heading">
      <div className="border-b border-line bg-sage-50 px-6 py-5">
        <h2 id="deceased-search-heading" className="mb-2 text-[18px]">جستجوی محل دفن</h2>
        <p className="text-sm leading-7 text-ink-soft">نام و نام خانوادگی الزامی است. نتیجه از سامانه رسمی بهشت زهرا دریافت می‌شود.</p>
      </div>

      <form onSubmit={submit} className="p-6" aria-label="جستجوی متوفی" aria-busy={busy}>
        <fieldset disabled={busy}>
          <legend className="sr-only">مشخصات متوفی</legend>
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="space-y-2 text-sm" htmlFor="deceased-first-name">
              <span className="block font-medium">نام <span className="text-ink-muted">(الزامی)</span></span>
              <input id="deceased-first-name" name="firstName" required maxLength={80} autoComplete="off" className={inputClass} />
            </label>
            <label className="space-y-2 text-sm" htmlFor="deceased-last-name">
              <span className="block font-medium">نام خانوادگی <span className="text-ink-muted">(الزامی)</span></span>
              <input id="deceased-last-name" name="lastName" required maxLength={80} autoComplete="off" className={inputClass} />
            </label>
          </div>
          <details className="mt-5 rounded-xl border border-line p-4">
            <summary className="cursor-pointer text-sm font-medium text-sage-700">فیلترهای بیشتر برای نتیجه دقیق‌تر</summary>
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <label className="space-y-2 text-sm" htmlFor="deceased-father-name">
                <span className="block">نام پدر</span>
                <input id="deceased-father-name" name="fatherName" maxLength={80} autoComplete="off" className={inputClass} />
              </label>
              <label className="space-y-2 text-sm" htmlFor="deceased-part">
                <span className="block">قطعه</span>
                <input id="deceased-part" name="part" maxLength={4} inputMode="numeric" className={inputClass} />
              </label>
              <label className="space-y-2 text-sm" htmlFor="deceased-date-from">
                <span className="block">تاریخ دفن از</span>
                <input id="deceased-date-from" name="dateFrom" maxLength={10} placeholder="۱۴۰۵/۰۷/۰۱" dir="ltr" className={inputClass + ' text-right'} aria-describedby="deceased-date-hint" />
              </label>
              <label className="space-y-2 text-sm" htmlFor="deceased-date-to">
                <span className="block">تاریخ دفن تا</span>
                <input id="deceased-date-to" name="dateTo" maxLength={10} placeholder="۱۴۰۵/۰۷/۳۰" dir="ltr" className={inputClass + ' text-right'} aria-describedby="deceased-date-hint" />
              </label>
            </div>
            <p id="deceased-date-hint" className="mt-3 text-xs leading-6 text-ink-muted">تاریخ‌ها شمسی و به شکل سال/ماه/روز هستند.</p>
          </details>
          <button type="submit" className="btn-primary mt-5 w-full disabled:cursor-wait disabled:opacity-60 sm:w-auto">
            {busy ? 'در حال جستجو…' : 'جستجو در بهشت زهرا'}
          </button>
        </fieldset>
      </form>

      {error ? <p role="alert" className="mx-6 mb-5 rounded-xl border border-gold-200 bg-gold-100 p-4 text-sm leading-7 text-ink">{error}</p> : null}

      <div aria-live="polite" aria-atomic="true" className="px-6">
        {busy ? <p role="status" className="mb-5 text-sm text-ink-muted">در حال دریافت پاسخ از سامانه رسمی…</p> : null}
        {result ? (
          <p role="status" className="mb-4 text-sm leading-7 text-ink-soft">
            {result.records.length ? toFa(result.records.length) + ' نتیجه دریافت شد. برای تشخیص فرد مورد نظر، نام پدر و تاریخ‌ها را هم بررسی کنید.' : 'نتیجه‌ای دریافت نشد. املای نام یا فیلترها را تغییر دهید.'}
          </p>
        ) : null}
      </div>

      {result?.records.length ? (
        <div className="max-h-[520px] overflow-auto border-y border-line" tabIndex={0} role="region" aria-label="جدول نتایج جستجو">
          <table className="w-full min-w-[720px] text-right text-[13px]">
            <caption className="sr-only">نتایج دریافتی از سامانه رسمی بهشت زهرا</caption>
            <thead className="sticky top-0 bg-sage-50">
              <tr>{['نام', 'نام خانوادگی', 'نام پدر', 'تاریخ تولد', 'تاریخ دفن', 'نشانی قبر'].map(title => <th key={title} scope="col" className="whitespace-nowrap px-4 py-3 font-semibold">{title}</th>)}</tr>
            </thead>
            <tbody>
              {result.records.map((record, index) => (
                <tr key={index} className="border-t border-line even:bg-sage-50/40">
                  <td className="px-4 py-4">{record.firstName}</td>
                  <td className="px-4 py-4">{record.lastName}</td>
                  <td className="px-4 py-4">{record.fatherName || '—'}</td>
                  <td className="whitespace-nowrap px-4 py-4"><bdi>{toFa(record.birthDate || '—')}</bdi></td>
                  <td className="whitespace-nowrap px-4 py-4"><bdi>{toFa(record.burialDate || '—')}</bdi></td>
                  <td className="px-4 py-4">
                    {record.part && record.row && record.grave ? (
                      <span className="whitespace-nowrap">قطعه {toFa(record.part)}، ردیف {toFa(record.row)}، شماره {toFa(record.grave)}</span>
                    ) : <bdi>{toFa(record.burialLocation || '—')}</bdi>}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : null}
      {result?.truncated ? <p className="px-6 pt-4 text-sm leading-7 text-ink-muted">بخشی از نتایج نمایش داده شده است؛ برای محدود کردن نتیجه، نام پدر یا قطعه را وارد کنید.</p> : null}

      <p className="px-6 py-5 text-xs leading-7 text-ink-muted">
        منبع اطلاعات: سازمان بهشت زهرا (س). برای ادامه‌ی جستجو یا مسیریابی می‌توانید به{' '}
        <a href={BZO_URL} target="_blank" rel="noopener noreferrer nofollow" className="font-medium text-sage-700 underline">سامانه رسمی</a> مراجعه کنید.
      </p>
    </section>
  );
}
