'use client';

import { useMemo, useRef, useState } from 'react';
import { marked } from 'marked';

const TOOLS = [
  { label: 'تیتر ۲', wrap: ['## ', ''], block: true },
  { label: 'تیتر ۳', wrap: ['### ', ''], block: true },
  { label: 'پررنگ', wrap: ['**', '**'] },
  { label: 'مورب', wrap: ['*', '*'] },
  { label: 'لیست', wrap: ['- ', ''], block: true },
  { label: 'نقل‌قول', wrap: ['> ', ''], block: true },
  { label: 'لینک', wrap: ['[', '](/category/gol-va-taj-gol)'] },
  { label: 'تصویر', wrap: ['![توضیح تصویر](', ')'] },
];

export default function MarkdownEditor({ value, onChange }) {
  const ref = useRef(null);
  const [preview, setPreview] = useState(false);

  const html = useMemo(() => {
    if (!preview) return '';
    try {
      return marked.parse(value || '', { async: false, gfm: true });
    } catch {
      return '<p>خطا در پیش‌نمایش</p>';
    }
  }, [preview, value]);

  const words = (value || '').trim().split(/\s+/).filter(Boolean).length;

  function applyTool(tool) {
    const el = ref.current;
    if (!el) return;
    const start = el.selectionStart;
    const end = el.selectionEnd;
    const text = value || '';
    const selected = text.slice(start, end);

    let next;
    let caret;
    if (tool.block) {
      const lineStart = text.lastIndexOf('\n', start - 1) + 1;
      next = `${text.slice(0, lineStart)}${tool.wrap[0]}${text.slice(lineStart)}`;
      caret = start + tool.wrap[0].length;
    } else {
      next = `${text.slice(0, start)}${tool.wrap[0]}${selected}${tool.wrap[1]}${text.slice(end)}`;
      caret = start + tool.wrap[0].length + selected.length;
    }

    onChange(next);
    requestAnimationFrame(() => {
      el.focus();
      el.setSelectionRange(caret, caret);
    });
  }

  return (
    <div className="overflow-hidden rounded-xl border border-line">
      <div className="flex flex-wrap items-center gap-1 border-b border-line bg-[#FAF8F5] p-2">
        {TOOLS.map((t) => (
          <button
            key={t.label}
            type="button"
            onClick={() => applyTool(t)}
            className="rounded-md px-2.5 py-1.5 text-[12px] text-ink-soft hover:bg-white hover:text-sage-700"
          >
            {t.label}
          </button>
        ))}

        <button
          type="button"
          onClick={() => setPreview((p) => !p)}
          className={`mr-auto rounded-md px-3 py-1.5 text-[12px] font-medium ${
            preview ? 'bg-sage-600 text-white' : 'text-ink-soft hover:bg-white'
          }`}
        >
          {preview ? 'ویرایش' : 'پیش‌نمایش'}
        </button>
      </div>

      {preview ? (
        <div className="article-body min-h-[320px] bg-white p-5" dangerouslySetInnerHTML={{ __html: html }} />
      ) : (
        <textarea
          ref={ref}
          rows={20}
          value={value || ''}
          onChange={(e) => onChange(e.target.value)}
          placeholder={'## یک تیتر\n\nمتن پاراگراف…\n\n- مورد اول\n- مورد دوم'}
          className="w-full resize-y bg-white p-4 text-[14px] leading-[2.1] outline-none"
        />
      )}

      <div className="flex items-center justify-between border-t border-line bg-[#FAF8F5] px-3 py-2 text-[11px] text-ink-muted">
        <span>مارک‌داون پشتیبانی می‌شود. تیترها به‌صورت خودکار به h2/h3 تبدیل و id می‌گیرند.</span>
        <span>{words} کلمه · حدود {Math.max(1, Math.round(words / 200))} دقیقه مطالعه</span>
      </div>
    </div>
  );
}
