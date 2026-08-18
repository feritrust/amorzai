/**
 * بررسی کامل سئوی سایت — کرال از روی sitemap و تحلیل تک‌تک صفحات.
 *
 *   npm run audit                          ← بررسی http://localhost:3000
 *   npm run audit -- https://amorz.ir      ← بررسی سایت زنده
 *   npm run audit -- https://amorz.ir --md ← ذخیره گزارش در seo-report.md
 *
 * بدون هیچ پکیج اضافه‌ای کار می‌کند.
 *
 * چه چیزهایی بررسی می‌شود:
 *   • وضعیت HTTP همه صفحات sitemap
 *   • عنوان: وجود، طول، یکتا بودن
 *   • توضیحات متا: وجود، طول، یکتا بودن
 *   • canonical: وجود و اشاره به خودِ صفحه
 *   • دقیقاً یک h1 در هر صفحه
 *   • معتبر بودن JSON-LD و نوع Schemaها
 *   • تصاویر بدون alt
 *   • حجم محتوا (صفحه کم‌محتوا ایندکس نمی‌شود)
 *   • لینک‌های داخلی شکسته
 *   • صفحات یتیم (در sitemap هست ولی هیچ صفحه‌ای بهش لینک نداده)
 *   • صفحات لینک‌شده که در sitemap نیستند
 *   • noindex ناخواسته
 *   • robots.txt و دسترسی sitemap
 */

import fs from 'node:fs';

const BASE = (process.argv.find((a) => a.startsWith('http')) || 'http://localhost:3000').replace(/\/$/, '');
const WRITE_MD = process.argv.includes('--md');

const LIMITS = {
  titleMin: 20,
  titleMax: 65,
  descMin: 70,
  descMax: 165,
  wordsMin: 250,
};

const C = {
  red: (s) => `\x1b[31m${s}\x1b[0m`,
  yellow: (s) => `\x1b[33m${s}\x1b[0m`,
  green: (s) => `\x1b[32m${s}\x1b[0m`,
  dim: (s) => `\x1b[2m${s}\x1b[0m`,
  bold: (s) => `\x1b[1m${s}\x1b[0m`,
};

const issues = { error: [], warn: [], info: [] };
const add = (level, page, message) => issues[level].push({ page, message });

/* ------------------------------ ابزارها ------------------------------ */

async function get(url) {
  try {
    const res = await fetch(url, {
      redirect: 'manual',
      headers: { 'User-Agent': 'AmorzSeoAudit/1.0 (+internal)' },
    });
    const type = res.headers.get('content-type') || '';
    const body = type.includes('text') || type.includes('xml') || type.includes('json') ? await res.text() : '';
    return { status: res.status, location: res.headers.get('location'), body, headers: res.headers };
  } catch (err) {
    return { status: 0, error: err.message, body: '' };
  }
}

const strip = (html) =>
  html
    .replace(/<script[\s\S]*?<\/script>/gi, ' ')
    .replace(/<style[\s\S]*?<\/style>/gi, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&[a-z]+;/gi, ' ')
    .replace(/\s+/g, ' ')
    .trim();

const attr = (tag, name) => {
  const m = tag.match(new RegExp(`${name}=["']([^"']*)["']`, 'i'));
  return m ? m[1] : null;
};

function analyze(url, html) {
  const path = url.replace(BASE, '') || '/';

  const titleMatch = html.match(/<title>([\s\S]*?)<\/title>/i);
  const title = titleMatch ? titleMatch[1].trim() : null;

  const descTag = html.match(/<meta[^>]+name=["']description["'][^>]*>/i);
  const description = descTag ? attr(descTag[0], 'content') : null;

  const canonicalTag = html.match(/<link[^>]+rel=["']canonical["'][^>]*>/i);
  const canonical = canonicalTag ? attr(canonicalTag[0], 'href') : null;

  const robotsTag = html.match(/<meta[^>]+name=["']robots["'][^>]*>/i);
  const robots = robotsTag ? attr(robotsTag[0], 'content') : null;

  const h1s = [...html.matchAll(/<h1[^>]*>([\s\S]*?)<\/h1>/gi)].map((m) => strip(m[1]));
  const h2s = [...html.matchAll(/<h2[^>]*>/gi)].length;

  const ogImage = html.match(/<meta[^>]+property=["']og:image["'][^>]*>/i);

  const imgs = [...html.matchAll(/<img[^>]*>/gi)].map((m) => m[0]);
  const imgsNoAlt = imgs.filter((t) => {
    const a = attr(t, 'alt');
    return a === null || a.trim() === '';
  });

  const jsonLd = [...html.matchAll(/<script[^>]+application\/ld\+json[^>]*>([\s\S]*?)<\/script>/gi)];
  const schemas = [];
  let jsonLdBroken = 0;
  for (const m of jsonLd) {
    try {
      const parsed = JSON.parse(m[1]);
      const t = parsed['@type'];
      if (Array.isArray(t)) schemas.push(...t);
      else if (t) schemas.push(t);
    } catch {
      jsonLdBroken += 1;
    }
  }

  const links = [...html.matchAll(/<a[^>]+href=["']([^"']+)["']/gi)]
    .map((m) => m[1])
    .filter((h) => h.startsWith('/') && !h.startsWith('//'))
    .map((h) => h.split('#')[0])
    .filter(Boolean);

  const words = strip(html).split(/\s+/).filter(Boolean).length;

  return {
    path,
    url,
    title,
    description,
    canonical,
    robots,
    h1s,
    h2s,
    hasOgImage: Boolean(ogImage),
    imgCount: imgs.length,
    imgsNoAlt: imgsNoAlt.length,
    schemas,
    jsonLdBroken,
    links: [...new Set(links)],
    words,
  };
}

/* ------------------------------- اجرا ------------------------------- */

async function main() {
  console.log(C.bold(`\n🔍 بررسی سئو — ${BASE}\n`));

  // robots.txt
  const robotsRes = await get(`${BASE}/robots.txt`);
  if (robotsRes.status !== 200) {
    add('error', '/robots.txt', `در دسترس نیست (وضعیت ${robotsRes.status})`);
  } else {
    if (!/Sitemap:/i.test(robotsRes.body)) add('error', '/robots.txt', 'آدرس sitemap در robots.txt نیست');

    // فقط بلوک «User-Agent: *» بررسی شود، نه بلوک ربات‌های اسکرپر که عمداً بسته‌اند
    const starBlock = (robotsRes.body.split(/User-Agent:\s*\*/i)[1] || '').split(/\n\s*User-Agent:/i)[0];
    if (/^\s*Disallow:\s*\/\s*$/im.test(starBlock)) {
      add('error', '/robots.txt', 'کل سایت برای ربات‌ها بسته شده است');
    }
  }

  // sitemap
  const smRes = await get(`${BASE}/sitemap.xml`);
  if (smRes.status !== 200) {
    console.error(C.red(`✖ sitemap.xml در دسترس نیست (وضعیت ${smRes.status}). بررسی متوقف شد.`));
    process.exit(1);
  }

  const urls = [...smRes.body.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1].trim());
  if (!urls.length) {
    console.error(C.red('✖ sitemap خالی است.'));
    process.exit(1);
  }
  console.log(C.dim(`${urls.length} آدرس در sitemap پیدا شد. در حال کرال…\n`));

  // کرال با محدودیت همزمانی تا سرور فشار نیاید
  const pages = [];
  const queue = [...urls];
  const CONCURRENCY = 5;

  await Promise.all(
    Array.from({ length: CONCURRENCY }, async () => {
      while (queue.length) {
        const url = queue.shift();
        const res = await get(url);
        const path = url.replace(BASE, '') || '/';

        if (res.status !== 200) {
          add('error', path, `وضعیت ${res.status}${res.location ? ` → ${res.location}` : ''}`);
          continue;
        }
        pages.push(analyze(url, res.body));
        process.stdout.write('.');
      }
    })
  );
  console.log('\n');

  /* ------------------------ بررسی تک‌تک صفحات ------------------------ */
  for (const p of pages) {
    if (!p.title) add('error', p.path, 'عنوان (title) ندارد');
    else if (p.title.length < LIMITS.titleMin) add('warn', p.path, `عنوان کوتاه است (${p.title.length} کاراکتر)`);
    else if (p.title.length > LIMITS.titleMax)
      add('warn', p.path, `عنوان بلند است (${p.title.length} کاراکتر) — در نتایج گوگل بریده می‌شود`);

    if (!p.description) add('error', p.path, 'توضیحات متا ندارد');
    else if (p.description.length < LIMITS.descMin)
      add('warn', p.path, `توضیحات متا کوتاه است (${p.description.length} کاراکتر)`);
    else if (p.description.length > LIMITS.descMax)
      add('warn', p.path, `توضیحات متا بلند است (${p.description.length} کاراکتر)`);

    if (!p.canonical) add('error', p.path, 'تگ canonical ندارد');
    else {
      const c = p.canonical.replace(/\/$/, '');
      const u = p.url.replace(/\/$/, '');
      if (c !== u) add('warn', p.path, `canonical به صفحه دیگری اشاره می‌کند: ${p.canonical}`);
    }

    if (p.robots && /noindex/i.test(p.robots)) add('error', p.path, 'در sitemap هست ولی noindex دارد');

    if (p.h1s.length === 0) add('error', p.path, 'تگ h1 ندارد');
    else if (p.h1s.length > 1) add('error', p.path, `${p.h1s.length} تگ h1 دارد — باید دقیقاً یکی باشد`);

    if (p.h2s === 0 && p.words > 400) add('info', p.path, 'هیچ تیتر h2 ندارد');

    if (!p.hasOgImage) add('warn', p.path, 'og:image ندارد');

    if (p.imgsNoAlt > 0) add('warn', p.path, `${p.imgsNoAlt} تصویر بدون alt از ${p.imgCount} تصویر`);

    if (p.jsonLdBroken > 0) add('error', p.path, `${p.jsonLdBroken} بلوک JSON-LD نامعتبر است`);
    if (p.schemas.length === 0) add('warn', p.path, 'هیچ Structured Data ندارد');

    if (p.words < LIMITS.wordsMin)
      add('warn', p.path, `محتوای کم (${p.words} کلمه) — احتمال ایندکس نشدن`);
  }

  /* --------------------------- بررسی تکراری --------------------------- */
  const byTitle = new Map();
  const byDesc = new Map();
  for (const p of pages) {
    if (p.title) byTitle.set(p.title, [...(byTitle.get(p.title) || []), p.path]);
    if (p.description) byDesc.set(p.description, [...(byDesc.get(p.description) || []), p.path]);
  }
  for (const [title, paths] of byTitle) {
    if (paths.length > 1) add('error', paths.join('، '), `عنوان تکراری: «${title.slice(0, 50)}…»`);
  }
  for (const [, paths] of byDesc) {
    if (paths.length > 1) add('warn', paths.join('، '), 'توضیحات متا تکراری');
  }

  /* ------------------------ لینک‌های داخلی ------------------------ */
  const sitemapPaths = new Set(pages.map((p) => p.path));
  const linkedPaths = new Set();
  const linkSources = new Map();

  for (const p of pages) {
    for (const l of p.links) {
      linkedPaths.add(l);
      if (!linkSources.has(l)) linkSources.set(l, []);
      linkSources.get(l).push(p.path);
    }
  }

  // صفحات یتیم: در sitemap هستند ولی هیچ لینکی به آن‌ها نیست
  for (const p of pages) {
    if (p.path === '/' ) continue;
    if (!linkedPaths.has(p.path) && !linkedPaths.has(p.path.replace(/\/$/, ''))) {
      add('warn', p.path, 'صفحه یتیم — هیچ صفحه‌ای به آن لینک نداده');
    }
  }

  // لینک‌های داخلی که به صفحه ناموجود می‌روند
  const external = [...linkedPaths].filter((l) => !sitemapPaths.has(l));
  const checked = new Map();
  for (const l of external) {
    if (l.startsWith('/admin') || l.startsWith('/api') || l.startsWith('/search')) continue;
    if (checked.has(l)) continue;
    const res = await get(`${BASE}${l}`);
    checked.set(l, res.status);

    if (res.status === 404) {
      add('error', l, `لینک شکسته — از: ${[...new Set(linkSources.get(l))].slice(0, 3).join('، ')}`);
    } else if (res.status === 200) {
      // صفحه‌ای که عمداً noindex است (مثل برچسب کم‌محتوا) نباید در sitemap باشد — مشکلی نیست
      const isNoindex = /<meta[^>]+name=["']robots["'][^>]+noindex/i.test(res.body);
      if (!isNoindex) add('warn', l, 'صفحه قابل ایندکس است ولی در sitemap نیست');
    }
  }

  /* ----------------------------- گزارش ----------------------------- */
  const print = (level, label, color) => {
    const list = issues[level];
    if (!list.length) return;
    console.log(color(C.bold(`\n${label} (${list.length})`)));
    for (const i of list) console.log(`  ${color('•')} ${C.bold(i.page)}\n    ${i.message}`);
  };

  print('error', '❌ خطاهای جدی — باید رفع شوند', C.red);
  print('warn', '⚠️  هشدارها — بهتر است رفع شوند', C.yellow);
  print('info', 'ℹ️  اطلاعات', C.dim);

  console.log(C.bold('\n\n📊 خلاصه'));
  console.log(`  صفحات بررسی‌شده: ${pages.length}`);
  console.log(`  میانگین حجم محتوا: ${Math.round(pages.reduce((a, p) => a + p.words, 0) / pages.length)} کلمه`);
  console.log(`  صفحات دارای Schema: ${pages.filter((p) => p.schemas.length).length} از ${pages.length}`);
  const allSchemas = [...new Set(pages.flatMap((p) => p.schemas))].sort();
  console.log(`  انواع Schema: ${allSchemas.join('، ')}`);
  console.log(
    `  ${C.red(`خطا: ${issues.error.length}`)}  ${C.yellow(`هشدار: ${issues.warn.length}`)}  ${C.dim(
      `اطلاعات: ${issues.info.length}`
    )}`
  );

  if (!issues.error.length && !issues.warn.length) {
    console.log(C.green('\n✔ هیچ مشکلی پیدا نشد.\n'));
  }

  if (WRITE_MD) {
    const lines = [
      `# گزارش بررسی سئو — ${BASE}`,
      '',
      `تاریخ: ${new Date().toISOString().slice(0, 16).replace('T', ' ')}`,
      `صفحات بررسی‌شده: ${pages.length}`,
      '',
    ];
    for (const [level, label] of [
      ['error', '## خطاهای جدی'],
      ['warn', '## هشدارها'],
      ['info', '## اطلاعات'],
    ]) {
      if (!issues[level].length) continue;
      lines.push(label, '');
      for (const i of issues[level]) lines.push(`- **${i.page}** — ${i.message}`);
      lines.push('');
    }
    lines.push('## جدول صفحات', '', '| صفحه | عنوان | کلمات | h1 | Schema |', '|---|---|---|---|---|');
    for (const p of pages.sort((a, b) => a.path.localeCompare(b.path))) {
      lines.push(
        `| ${p.path} | ${(p.title || '—').slice(0, 45)} | ${p.words} | ${p.h1s.length} | ${p.schemas.length} |`
      );
    }
    fs.writeFileSync('seo-report.md', lines.join('\n'), 'utf8');
    console.log(C.dim('\nگزارش در seo-report.md ذخیره شد.\n'));
  }

  process.exit(issues.error.length ? 1 : 0);
}

main().catch((err) => {
  console.error(C.red(`✖ خطا: ${err.message}`));
  process.exit(1);
});
