import { NextResponse } from 'next/server';
import { createHash } from 'node:crypto';
import { BzoError } from '@/lib/bzo/protocol.mjs';
import { searchThroughBridge } from '@/lib/bzo/bridge-client.mjs';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const maxDuration = 30;

const requests = new Map();
const headers = { 'Cache-Control': 'no-store', 'X-Robots-Tag': 'noindex, nofollow' };

function allowRequest(request) {
  const now = Date.now();
  for (const [key, bucket] of requests) if (bucket.expires <= now) requests.delete(key);
  const address = request.headers.get('cf-connecting-ip') || request.headers.get('x-real-ip') || 'shared';
  const key = createHash('sha256').update(address).digest('hex');
  const bucket = requests.get(key);
  if (!bucket && requests.size >= 2048) return false;
  if (bucket?.count >= 10) return false;
  requests.set(key, { count: (bucket?.count || 0) + 1, expires: bucket?.expires || now + 60_000 });
  return true;
}

async function readQuery(request) {
  if (!request.headers.get('content-type')?.toLowerCase().startsWith('application/json')) {
    throw new BzoError('INVALID_QUERY', 'قالب درخواست معتبر نیست.', 415);
  }
  const reader = request.body?.getReader();
  if (!reader) throw new BzoError('INVALID_QUERY', 'اطلاعات جستجو خالی است.', 400);
  let size = 0;
  const chunks = [];
  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      size += value.length;
      if (size > 2048) { await reader.cancel(); throw new BzoError('INVALID_QUERY', 'حجم درخواست بیش از حد مجاز است.', 413); }
      chunks.push(value);
    }
  } finally { reader.releaseLock(); }
  try { return JSON.parse(new TextDecoder().decode(Buffer.concat(chunks))); }
  catch { throw new BzoError('INVALID_QUERY', 'اطلاعات جستجو معتبر نیست.', 400); }
}

export async function POST(request) {
  const origin = request.headers.get('origin');
  if (request.headers.get('sec-fetch-site') === 'cross-site' || (origin && origin !== new URL(request.url).origin)) {
    return NextResponse.json({ ok: false, message: 'درخواست معتبر نیست.' }, { status: 403, headers });
  }
  if (!allowRequest(request)) {
    return NextResponse.json({ ok: false, message: 'تعداد درخواست‌ها زیاد است؛ یک دقیقه دیگر تلاش کنید.' }, { status: 429, headers: { ...headers, 'Retry-After': '60' } });
  }
  try {
    const result = await searchThroughBridge(await readQuery(request));
    return NextResponse.json({ ok: true, ...result }, { headers });
  } catch (error) {
    const known = error instanceof BzoError;
    return NextResponse.json({ ok: false, code: known ? error.code : 'UNAVAILABLE', message: known ? error.message : 'جستجو در حال حاضر در دسترس نیست.' }, { status: known ? error.status : 503, headers });
  }
}
