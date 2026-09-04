/**
 * باطل کردن کش صفحات ایستا پس از تغییر دسته‌جمعی داده.
 *
 *   npm run revalidate              ← همه صفحات سایت
 *   npm run revalidate -- /niabat   ← فقط یک مسیر
 *
 * چرا لازم است: صفحات محصول، خدمت، دسته‌بندی و مقاله در زمان بیلد به HTML
 * ثابت تبدیل می‌شوند و تا یک ساعت همان نسخه سرو می‌شود. وقتی داده را با
 * import:catalog یا set:images عوض می‌کنید، ری‌استارت سرویس کافی نیست —
 * فایل‌های از پیش ساخته‌شده سر جایشان می‌مانند. این اسکریپت به Next می‌گوید
 * آن‌ها را دور بریزد و در اولین درخواست از نو بسازد.
 */

import fs from 'node:fs';
import path from 'node:path';

const ROOT = process.cwd();

function loadEnv() {
  for (const file of ['.env.local', '.env']) {
    const p = path.join(ROOT, file);
    if (!fs.existsSync(p)) continue;
    for (const line of fs.readFileSync(p, 'utf8').split('\n')) {
      const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)$/i);
      if (!m) continue;
      if (!process.env[m[1]]) {
        process.env[m[1]] = (m[2] || '').trim().replace(/^["']|["']$/g, '');
      }
    }
  }
}
loadEnv();

const SECRET = process.env.SEED_SECRET;
if (!SECRET) {
  console.error('✖ SEED_SECRET در .env تنظیم نشده است.');
  process.exit(1);
}

const PORT = process.env.PORT || 3000;
const BASE = process.env.REVALIDATE_BASE || `http://127.0.0.1:${PORT}`;
const target = process.argv.slice(2).find((a) => a.startsWith('/'));

const url = new URL('/api/revalidate', BASE);
url.searchParams.set('secret', SECRET);
if (target) url.searchParams.set('path', target);
else url.searchParams.set('all', '1');

console.log(`→ ${target ? `بازسازی ${target}` : 'بازسازی همه صفحات'} روی ${BASE}…`);

try {
  const res = await fetch(url, { method: 'POST' });
  const body = await res.json().catch(() => ({}));

  if (!res.ok) {
    console.error(`✖ خطای ${res.status}: ${body.message || 'پاسخ نامعتبر'}`);
    if (res.status === 401) {
      console.error('  SEED_SECRET فایل .env با آنچه سرویس در حال اجرا دارد یکی نیست.');
      console.error('  پس از تغییر .env باید سرویس را ری‌استارت کنید.');
    }
    process.exit(1);
  }

  console.log(`✔ انجام شد — ${JSON.stringify(body.revalidated)}`);
  console.log('  صفحات در اولین بازدید از نو ساخته می‌شوند؛ اولین لود کمی کندتر است.');
} catch (e) {
  console.error(`✖ ارتباط با ${BASE} برقرار نشد: ${e.message}`);
  console.error('  مطمئن شوید سرویس بالاست:  systemctl status amorz');
  process.exit(1);
}
