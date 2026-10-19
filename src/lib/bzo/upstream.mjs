import { BZO_URL, BzoError, validateSearch, readSearchForm, buildSearchBody, parseSearchResults } from './protocol.mjs';

async function readHtml(response) {
  if (response.status !== 200 || !response.headers.get('content-type')?.includes('text/html')) {
    throw new BzoError('UPSTREAM_UNAVAILABLE', 'سامانه رسمی در حال حاضر پاسخ مناسب نمی‌دهد.', 503);
  }
  const reader = response.body?.getReader();
  if (!reader) throw new BzoError('UPSTREAM_UNAVAILABLE', 'پاسخ سامانه رسمی خالی است.', 503);
  const chunks = [];
  let size = 0;
  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      size += value.length;
      if (size > 2_000_000) {
        await reader.cancel();
        throw new BzoError('UPSTREAM_TOO_LARGE', 'حجم پاسخ سامانه رسمی بیش از حد مجاز است.');
      }
      chunks.push(value);
    }
  } finally {
    reader.releaseLock();
  }
  return new TextDecoder().decode(Buffer.concat(chunks));
}

/** A fresh public session per search; no cross-user cookies or persistent records. */
export async function searchOfficial(input, { fetchImpl = fetch } = {}) {
  const query = validateSearch(input);
  const signal = AbortSignal.timeout(20_000);
  try {
    const initial = await fetchImpl(BZO_URL, { cache: 'no-store', redirect: 'manual', signal, headers: { Accept: 'text/html' } });
    const html = await readHtml(initial);
    const form = readSearchForm(html);
    const cookies = (initial.headers.getSetCookie?.() || []).map(cookie => cookie.split(';', 1)[0]).join('; ');
    const response = await fetchImpl(BZO_URL, {
      method: 'POST', cache: 'no-store', redirect: 'manual', signal,
      headers: { Accept: 'text/html', 'Content-Type': 'application/x-www-form-urlencoded', Origin: new URL(BZO_URL).origin, Referer: BZO_URL, ...(cookies ? { Cookie: cookies } : {}) },
      body: buildSearchBody(form, query).toString(),
    });
    return parseSearchResults(await readHtml(response));
  } catch (error) {
    if (error instanceof BzoError) throw error;
    throw new BzoError('UPSTREAM_UNAVAILABLE', 'اتصال به سامانه رسمی برقرار نشد. کمی بعد دوباره تلاش کنید.', 503);
  }
}
