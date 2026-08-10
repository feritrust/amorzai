import { NextResponse } from 'next/server';
import { listItems } from '@/lib/queries';

export const dynamic = 'force-dynamic';

export async function GET(request) {
  const q = (request.nextUrl.searchParams.get('q') || '').trim();
  if (!q) return NextResponse.json({ ok: true, items: [], total: 0 });

  const result = await listItems({ q, pageSize: 30 });
  return NextResponse.json({ ok: true, ...result });
}
