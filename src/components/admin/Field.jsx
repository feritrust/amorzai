'use client';

import ImageField from '@/components/admin/ImageField';
import MarkdownEditor from '@/components/admin/MarkdownEditor';

const inputClass =
  'w-full rounded-xl border border-line bg-white px-3.5 py-2.5 text-sm outline-none transition focus:border-sage-400 disabled:bg-line/30';

function Label({ field, children, counter }) {
  return (
    <div id={`field-${field.name}`}>
      <div className="mb-1.5 flex items-baseline justify-between gap-3">
        <label htmlFor={field.name} className="text-[13px] font-semibold text-ink">
          {field.label}
          {field.required ? <span className="mr-1 text-red-500">*</span> : null}
        </label>
        {counter}
      </div>
      {children}
      {field.help ? <p className="mt-1.5 text-[12px] leading-6 text-ink-muted">{field.help}</p> : null}
    </div>
  );
}

function RowButtons({ onAdd, addLabel }) {
  return (
    <button
      type="button"
      onClick={onAdd}
      className="rounded-lg border border-dashed border-line px-3 py-2 text-[12px] text-ink-muted hover:border-sage-400 hover:text-sage-700"
    >
      + {addLabel}
    </button>
  );
}

export default function Field({ field, value, error, onChange, onSlugTouched, categories = [], items = [] }) {
  const err = error ? <p className="mt-1.5 text-[12px] text-red-600">{error}</p> : null;

  switch (field.type) {
    case 'textarea':
      return (
        <Label
          field={field}
          counter={
            field.max ? (
              <span className={`text-[11px] ${String(value || '').length > field.max ? 'text-red-600' : 'text-ink-muted'}`}>
                {String(value || '').length} / {field.max}
              </span>
            ) : null
          }
        >
          <textarea
            id={field.name}
            rows={field.rows || 4}
            value={value || ''}
            onChange={(e) => onChange(e.target.value)}
            className={inputClass}
          />
          {err}
        </Label>
      );

    case 'number':
      return (
        <Label field={field}>
          <input
            id={field.name}
            type="number"
            inputMode="numeric"
            dir="ltr"
            value={value ?? ''}
            onChange={(e) => onChange(e.target.value)}
            className={`${inputClass} text-left`}
          />
          {err}
        </Label>
      );

    case 'checkbox':
      return (
        <div id={`field-${field.name}`}>
          <label className="flex cursor-pointer items-center gap-2.5 text-[13px] font-medium">
            <input
              type="checkbox"
              checked={Boolean(value)}
              onChange={(e) => onChange(e.target.checked)}
              className="h-4 w-4 rounded border-line accent-sage-600"
            />
            {field.label}
          </label>
          {field.help ? <p className="mt-1.5 text-[12px] leading-6 text-ink-muted">{field.help}</p> : null}
          {err}
        </div>
      );

    case 'select':
      return (
        <Label field={field}>
          <select id={field.name} value={value || ''} onChange={(e) => onChange(e.target.value)} className={inputClass}>
            {field.options.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
          {err}
        </Label>
      );

    case 'category':
      return (
        <Label field={field}>
          <select id={field.name} value={value || ''} onChange={(e) => onChange(e.target.value)} className={inputClass}>
            <option value="">— انتخاب کنید —</option>
            {categories.map((c) => (
              <option key={c.slug} value={c.slug}>
                {c.title} ({c.kind === 'product' ? 'محصول' : 'خدمت'})
              </option>
            ))}
          </select>
          {err}
        </Label>
      );

    case 'slug':
      return (
        <Label field={field}>
          <input
            id={field.name}
            dir="ltr"
            value={value || ''}
            onChange={(e) => {
              onSlugTouched?.();
              onChange(e.target.value);
            }}
            className={`${inputClass} text-left font-mono text-[13px]`}
          />
          {err}
        </Label>
      );

    case 'datetime':
      return (
        <Label field={field}>
          <input
            id={field.name}
            type="datetime-local"
            dir="ltr"
            value={value || ''}
            onChange={(e) => onChange(e.target.value)}
            className={`${inputClass} text-left`}
          />
          {err}
        </Label>
      );

    case 'image':
      return (
        <Label field={field}>
          <ImageField value={value || ''} onChange={onChange} />
          {err}
        </Label>
      );

    case 'markdown':
      return (
        <Label field={field}>
          <MarkdownEditor value={value || ''} onChange={onChange} />
          {err}
        </Label>
      );

    case 'list': {
      const list = Array.isArray(value) ? value : [];
      const update = (i, v) => onChange(list.map((item, idx) => (idx === i ? v : item)));
      return (
        <Label field={field}>
          <div className="space-y-2">
            {list.map((item, i) => (
              <div key={i} className="flex gap-2">
                {field.itemType === 'textarea' ? (
                  <textarea rows={3} value={item} onChange={(e) => update(i, e.target.value)} className={inputClass} />
                ) : (
                  <input value={item} onChange={(e) => update(i, e.target.value)} className={inputClass} />
                )}
                <button
                  type="button"
                  onClick={() => onChange(list.filter((_, idx) => idx !== i))}
                  className="shrink-0 self-start rounded-lg border border-line px-3 py-2.5 text-[12px] text-ink-muted hover:border-red-300 hover:text-red-600"
                  aria-label="حذف"
                >
                  حذف
                </button>
              </div>
            ))}
            <RowButtons onAdd={() => onChange([...list, ''])} addLabel="افزودن مورد" />
          </div>
          {err}
        </Label>
      );
    }

    case 'pairs': {
      const list = Array.isArray(value) ? value : [];
      const update = (i, j, v) => onChange(list.map((p, idx) => (idx === i ? (j === 0 ? [v, p[1]] : [p[0], v]) : p)));
      return (
        <Label field={field}>
          <div className="space-y-2">
            {list.map((pair, i) => (
              <div key={i} className="flex gap-2">
                <input
                  value={pair[0] || ''}
                  onChange={(e) => update(i, 0, e.target.value)}
                  placeholder="عنوان"
                  className={`${inputClass} w-1/3`}
                />
                <input
                  value={pair[1] || ''}
                  onChange={(e) => update(i, 1, e.target.value)}
                  placeholder="مقدار"
                  className={inputClass}
                />
                <button
                  type="button"
                  onClick={() => onChange(list.filter((_, idx) => idx !== i))}
                  className="shrink-0 rounded-lg border border-line px-3 text-[12px] text-ink-muted hover:border-red-300 hover:text-red-600"
                >
                  حذف
                </button>
              </div>
            ))}
            <RowButtons onAdd={() => onChange([...list, ['', '']])} addLabel="افزودن مشخصه" />
          </div>
          {err}
        </Label>
      );
    }

    case 'faq': {
      const list = Array.isArray(value) ? value : [];
      const update = (i, k, v) => onChange(list.map((f, idx) => (idx === i ? { ...f, [k]: v } : f)));
      return (
        <Label field={field}>
          <div className="space-y-3">
            {list.map((f, i) => (
              <div key={i} className="rounded-xl border border-line p-3">
                <input
                  value={f.q || ''}
                  onChange={(e) => update(i, 'q', e.target.value)}
                  placeholder="سوال"
                  className={`${inputClass} mb-2 font-semibold`}
                />
                <textarea
                  rows={3}
                  value={f.a || ''}
                  onChange={(e) => update(i, 'a', e.target.value)}
                  placeholder="پاسخ"
                  className={inputClass}
                />
                <button
                  type="button"
                  onClick={() => onChange(list.filter((_, idx) => idx !== i))}
                  className="mt-2 text-[12px] text-ink-muted hover:text-red-600"
                >
                  حذف این سوال
                </button>
              </div>
            ))}
            <RowButtons onAdd={() => onChange([...list, { q: '', a: '' }])} addLabel="افزودن سوال" />
          </div>
          {err}
        </Label>
      );
    }

    case 'itemRefs': {
      const list = Array.isArray(value) ? value : [];
      const toggle = (ref) => onChange(list.includes(ref) ? list.filter((r) => r !== ref) : [...list, ref]);
      return (
        <Label field={field}>
          <div className="max-h-64 space-y-1 overflow-y-auto rounded-xl border border-line p-3">
            {items.length ? (
              items.map((it) => {
                const ref = `${it.type}:${it.slug}`;
                return (
                  <label key={ref} className="flex cursor-pointer items-center gap-2 rounded-lg px-2 py-1.5 text-[13px] hover:bg-sage-50">
                    <input
                      type="checkbox"
                      checked={list.includes(ref)}
                      onChange={() => toggle(ref)}
                      className="h-4 w-4 accent-sage-600"
                    />
                    <span className="truncate">{it.title}</span>
                    <span className="mr-auto shrink-0 text-[11px] text-ink-muted">
                      {it.type === 'product' ? 'محصول' : 'خدمت'}
                    </span>
                  </label>
                );
              })
            ) : (
              <p className="text-[12px] text-ink-muted">موردی برای انتخاب وجود ندارد.</p>
            )}
          </div>
          {err}
        </Label>
      );
    }

    default:
      return (
        <Label
          field={field}
          counter={
            field.max ? (
              <span className={`text-[11px] ${String(value || '').length > field.max ? 'text-red-600' : 'text-ink-muted'}`}>
                {String(value || '').length} / {field.max}
              </span>
            ) : null
          }
        >
          <input
            id={field.name}
            value={value || ''}
            placeholder={field.placeholder}
            onChange={(e) => onChange(e.target.value)}
            className={inputClass}
          />
          {err}
        </Label>
      );
  }
}
