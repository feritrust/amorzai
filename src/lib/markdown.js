import { Marked } from 'marked';
import { slugify } from '@/lib/slugify';

/**
 * تبدیل مارک‌داون مقاله به HTML، به‌همراه:
 *  - افزودن id به تیترها (لینک مستقیم و فهرست مطالب)
 *  - شروع تیترها از h2 (چون h1 عنوان مقاله است — سلسله‌مراتب صحیح برای SEO)
 *  - rel="nofollow noopener" روی لینک‌های خارجی
 *  - lazy loading روی تصاویر داخل متن
 */
function buildMarked(headings) {
  const marked = new Marked({ gfm: true, breaks: false });

  marked.use({
    renderer: {
      heading({ tokens, depth }) {
        const text = this.parser.parseInline(tokens);
        const plain = text.replace(/<[^>]*>/g, '');
        const id = slugify(plain) || `h-${headings.length + 1}`;
        // h1 داخل متن به h2 تبدیل می‌شود تا در هر صفحه فقط یک h1 باشد
        const level = Math.min(Math.max(depth === 1 ? 2 : depth, 2), 4);
        if (level <= 3) headings.push({ id, text: plain, level });
        return `<h${level} id="${id}">${text}</h${level}>\n`;
      },
      link({ href, title, tokens }) {
        const text = this.parser.parseInline(tokens);
        const isExternal = /^https?:\/\//.test(href || '') && !/amorz\.ir/.test(href || '');
        const attrs = isExternal ? ' target="_blank" rel="nofollow noopener noreferrer"' : '';
        return `<a href="${href}"${title ? ` title="${title}"` : ''}${attrs}>${text}</a>`;
      },
      image({ href, title, text }) {
        return `<img src="${href}" alt="${text || ''}"${title ? ` title="${title}"` : ''} loading="lazy" decoding="async" />`;
      },
    },
  });

  return marked;
}

/** میانگین سرعت مطالعه فارسی حدود ۲۰۰ کلمه در دقیقه */
export function readingTime(markdown = '') {
  const words = String(markdown).replace(/[#*`>_\-[\]()]/g, ' ').trim().split(/\s+/).filter(Boolean);
  return Math.max(1, Math.round(words.length / 200));
}

/** متن ساده برای meta description در صورت خالی بودن خلاصه */
export function plainText(markdown = '', max = 300) {
  return String(markdown)
    .replace(/```[\s\S]*?```/g, ' ')
    .replace(/!\[[^\]]*\]\([^)]*\)/g, ' ')
    .replace(/\[([^\]]*)\]\([^)]*\)/g, '$1')
    .replace(/[#*`>_|-]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, max);
}

export function renderMarkdown(markdown = '') {
  const headings = [];
  const html = buildMarked(headings).parse(String(markdown || ''), { async: false });
  return { html, headings, minutes: readingTime(markdown) };
}
