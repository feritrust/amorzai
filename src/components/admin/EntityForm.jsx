'use client';

import { useMemo, useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { saveEntityAction } from '@/app/admin/actions';
import { slugify } from '@/lib/slugify';
import { GROUPS } from '@/lib/entities';
import Field from '@/components/admin/Field';

function initialValues(fields, doc) {
  const values = {};
  for (const f of fields) {
    const current = doc?.[f.name];
    if (current !== undefined && current !== null) {
      values[f.name] = f.type === 'datetime' ? String(current).slice(0, 16) : current;
      continue;
    }
    switch (f.type) {
      case 'list':
      case 'pairs':
      case 'faq':
      case 'itemRefs':
        values[f.name] = [];
        break;
      case 'checkbox':
        values[f.name] = f.default ?? false;
        break;
      case 'number':
        values[f.name] = f.default ?? '';
        break;
      case 'select':
        values[f.name] = f.default ?? f.options?.[0]?.value ?? '';
        break;
      default:
        values[f.name] = f.default ?? '';
    }
  }
  return values;
}

export default function EntityForm({ entityKey, entityLabel, fields, doc, categories = [], items = [] }) {
  const router = useRouter();
  const [values, setValues] = useState(() => initialValues(fields, doc));
  const [errors, setErrors] = useState({});
  const [message, setMessage] = useState(null);
  const [pending, startTransition] = useTransition();

  const grouped = useMemo(() => {
    const map = new Map();
    for (const f of fields) {
      const g = f.group || 'main';
      if (!map.has(g)) map.set(g, []);
      map.get(g).push(f);
    }
    return Array.from(map, ([key, list]) => ({ key, label: GROUPS[key] || key, fields: list }));
  }, [fields]);

  function setValue(name, value) {
    setValues((prev) => {
      const next = { ...prev, [name]: value };
      // تولید خودکار اسلاگ از عنوان، تا وقتی کاربر دستی تغییرش نداده باشد
      const slugField = fields.find((f) => f.type === 'slug');
      if (slugField && slugField.from === name && !doc && !prev.__slugTouched) {
        next[slugField.name] = slugify(value);
      }
      return next;
    });
    setErrors((prev) => (prev[name] ? { ...prev, [name]: undefined } : prev));
  }

  function onSubmit(e) {
    e.preventDefault();
    setMessage(null);

    const payload = { ...values };
    delete payload.__slugTouched;

    startTransition(async () => {
      const res = await saveEntityAction(entityKey, doc?._id || null, payload);
      if (res.ok) {
        setMessage({ type: 'ok', text: 'با موفقیت ذخیره شد و صفحات مرتبط سایت به‌روز شدند.' });
        if (!doc) router.replace(`/admin/${entityKey}/${res.id}`);
        else router.refresh();
      } else {
        setErrors(res.errors || {});
        setMessage({ type: 'error', text: res.errors?._form || 'لطفاً خطاهای فرم را برطرف کنید.' });
        const first = Object.keys(res.errors || {}).find((k) => k !== '_form');
        if (first) document.getElementById(`field-${first}`)?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    });
  }

  return (
    <form onSubmit={onSubmit} className="space-y-6 pb-24">
      {grouped.map((group) => (
        <section key={group.key} className="rounded-2xl border border-line bg-white">
          <h2 className="border-b border-line px-5 py-3.5 text-[14px] font-bold">{group.label}</h2>
          <div className="space-y-5 p-5">
            {group.fields.map((field) => (
              <Field
                key={field.name}
                field={field}
                value={values[field.name]}
                error={errors[field.name]}
                categories={categories}
                items={items}
                onChange={(v) => setValue(field.name, v)}
                onSlugTouched={() => setValues((prev) => ({ ...prev, __slugTouched: true }))}
              />
            ))}
          </div>
        </section>
      ))}

      {/* نوار ذخیره چسبیده به پایین */}
      <div className="fixed inset-x-0 bottom-0 z-30 border-t border-line bg-white/95 backdrop-blur">
        <div className="mx-auto flex max-w-[1400px] items-center justify-between gap-4 px-4 py-3">
          <div className="min-w-0 flex-1">
            {message ? (
              <p
                role="status"
                className={`truncate text-[13px] ${message.type === 'ok' ? 'text-sage-700' : 'text-red-700'}`}
              >
                {message.text}
              </p>
            ) : (
              <p className="truncate text-[13px] text-ink-muted">
                {doc ? `ویرایش ${entityLabel}` : `افزودن ${entityLabel} جدید`}
              </p>
            )}
          </div>

          <div className="flex shrink-0 gap-2">
            <Link href={`/admin/${entityKey}`} className="btn-outline !px-4 !py-2.5 text-xs">
              بازگشت
            </Link>
            <button type="submit" disabled={pending} className="btn-primary !px-6 !py-2.5 text-xs">
              {pending ? 'در حال ذخیره…' : 'ذخیره'}
            </button>
          </div>
        </div>
      </div>
    </form>
  );
}
