import { NextResponse } from 'next/server';
import { getCategories, getCategoryCounts } from '@/lib/queries';

export const revalidate = 3600;

export async function GET(request) {
  const kind = request.nextUrl.searchParams.get('kind') || undefined;
  const [categories, counts] = await Promise.all([getCategories(kind), getCategoryCounts()]);

  return NextResponse.json(
    {
      ok: true,
      count: categories.length,
      data: categories.map((c) => ({ ...c, itemCount: counts[c.slug] || 0 })),
    },
    { headers: { 'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=86400' } }
  );
}
