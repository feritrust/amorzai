import { BZO_URL, BzoError, MAX_RESULTS, validateSearch } from './protocol.mjs';

export function getBridgeConfig(env = process.env) {
  if (env.BZO_SEARCH_ENABLED !== 'true' || !env.BZO_BRIDGE_URL || !env.BZO_BRIDGE_SECRET || env.BZO_BRIDGE_SECRET.length < 32) return null;
  try {
    const url = new URL(env.BZO_BRIDGE_URL);
    const loopback = ['127.0.0.1', 'localhost', '[::1]'].includes(url.hostname);
    if ((url.protocol !== 'https:' && !(env.NODE_ENV !== 'production' && loopback && url.protocol === 'http:')) || url.username || url.password || url.search || url.hash) return null;
    return { url: url.href, secret: env.BZO_BRIDGE_SECRET };
  } catch {
    return null;
  }
}

export async function searchThroughBridge(input, { env = process.env, fetchImpl = fetch } = {}) {
  const query = validateSearch(input);
  const config = getBridgeConfig(env);
  if (!config) throw new BzoError('NOT_CONFIGURED', 'جستجوی داخلی هنوز فعال نشده است؛ از سامانه رسمی استفاده کنید.', 503);
  try {
    const response = await fetchImpl(config.url, {
      method: 'POST', cache: 'no-store', redirect: 'manual', signal: AbortSignal.timeout(25_000),
      headers: { Authorization: 'Bearer ' + config.secret, 'Content-Type': 'application/json' }, body: JSON.stringify(query),
    });
    const reader = response.body?.getReader();
    if (!reader) throw new Error('Empty bridge response');
    const chunks = [];
    let size = 0;
    try {
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        size += value.length;
        if (size > 256_000) { await reader.cancel(); throw new Error('Bridge response too large'); }
        chunks.push(value);
      }
    } finally { reader.releaseLock(); }
    const payload = JSON.parse(new TextDecoder().decode(Buffer.concat(chunks)));
    if (!response.ok || payload.ok !== true) {
      if (payload.code === 'UPSTREAM_CHALLENGE') throw new BzoError('UPSTREAM_CHALLENGE', 'سامانه رسمی تأیید امنیتی می‌خواهد؛ جستجو را در سایت رسمی ادامه دهید.', 503);
      throw new Error('Bridge unavailable');
    }
    const keys = ['firstName', 'lastName', 'fatherName', 'birthDate', 'burialDate', 'burialLocation', 'part', 'row', 'grave'];
    if (!Array.isArray(payload.records) || payload.records.length > MAX_RESULTS || payload.records.some(record => !record || keys.some(key => typeof record[key] !== 'string' || record[key].length > 120))) throw new Error('Invalid records');
    return { records: payload.records.map(record => Object.fromEntries(keys.map(key => [key, record[key]]))), truncated: payload.truncated === true, sourceUrl: BZO_URL };
  } catch (error) {
    if (error instanceof BzoError) throw error;
    throw new BzoError('UPSTREAM_UNAVAILABLE', 'سامانه جستجو در حال حاضر در دسترس نیست؛ کمی بعد دوباره تلاش کنید.', 503);
  }
}
