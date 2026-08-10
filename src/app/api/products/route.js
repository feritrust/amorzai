import { NextResponse } from 'next/server';
import { listItems } from '@/lib/queries';
import { PAGE_SIZE } from '@/lib/site';

export const revalidate = 3600;

export async function GET(request) {
  const sp = request.nextUrl.searchParams;
  const result = await listItems({
    type: 'product',
    category: sp.get('category') || undefined,
    q: sp.get('q') || undefined,
    page: Number(sp.get('page')) || 1,
    pageSize: Math.min(Number(sp.get('limit')) || PAGE_SIZE, 100),
  });

  return NextResponse.json(
    { ok: true, ...result },
    { headers: { 'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=86400' } }
  );
}
