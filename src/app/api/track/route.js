import { NextResponse } from 'next/server';
import { createHash } from 'node:crypto';
import { dbConnect, hasDatabase } from '@/lib/mongodb';
import PageViewModel from '@/models/PageView';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const BOT_RE =
  /bot|crawler|spider|crawling|slurp|bingpreview|facebookexternalhit|whatsapp|telegrambot|headless|lighthouse|pagespeed|gtmetrix|semrush|ahrefs|dataprovider|python-requests|curl|wget|axios|node-fetch/i;

/** تاریخ روز به وقت تهران — برای اینکه «امروز» با تقویم کاربر یکی باشد */
function tehranDay(date = new Date()) {
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Tehran',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(date);
}

function deviceFrom(ua = '') {
  if (/ipad|tablet|playbook|silk/i.test(ua)) return 'tablet';
  if (/mobi|android|iphone|ipod/i.test(ua)) return 'mobile';
  return 'desktop';
}

/** دامنه منبع ورودی؛ ورودی‌های داخلی نادیده گرفته می‌شوند */
function refHost(referrer, host) {
  if (!referrer) return '';
  try {
    const h = new URL(referrer).hostname.replace(/^www\./, '');
    if (!h || h === String(host).replace(/^www\./, '')) return '';
    return h.slice(0, 100);
  } catch {
    return '';
  }
}

export async function POST(request) {
  // شکست ثبت آمار هرگز نباید به کاربر خطا نشان دهد
  try {
    const ua = request.headers.get('user-agent') || '';
    if (!ua || BOT_RE.test(ua)) return NextResponse.json({ ok: true, skipped: 'bot' });

    const body = await request.json().catch(() => null);
    let path = String(body?.path || '').trim();
    if (!path.startsWith('/') || path.length > 200) return NextResponse.json({ ok: true, skipped: 'bad-path' });

    // پنل و مسیرهای فنی شمارش نمی‌شوند
    if (path.startsWith('/admin') || path.startsWith('/api')) {
      return NextResponse.json({ ok: true, skipped: 'excluded' });
    }
    path = path.split('?')[0].split('#')[0];

    if (!hasDatabase()) return NextResponse.json({ ok: true, skipped: 'no-db' });

    const ip =
      request.headers.get('cf-connecting-ip') ||
      request.headers.get('x-real-ip') ||
      (request.headers.get('x-forwarded-for') || '').split(',')[0].trim() ||
      '0.0.0.0';

    const day = tehranDay();
    const salt = process.env.ADMIN_SECRET || process.env.SEED_SECRET || 'amorz';
    const visitor = createHash('sha256').update(`${salt}|${day}|${ip}|${ua}`).digest('hex').slice(0, 32);

    const conn = await dbConnect();
    if (!conn) return NextResponse.json({ ok: true, skipped: 'no-conn' });

    await PageViewModel.create({
      path,
      day,
      visitor,
      referrer: refHost(body?.referrer, request.headers.get('host')),
      device: deviceFrom(ua),
      country: (request.headers.get('cf-ipcountry') || '').slice(0, 2),
    });

    return NextResponse.json({ ok: true }, { headers: { 'Cache-Control': 'no-store' } });
  } catch (err) {
    console.error('[track]', err.message);
    return NextResponse.json({ ok: true, skipped: 'error' });
  }
}
