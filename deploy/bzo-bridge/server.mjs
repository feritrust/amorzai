import http from 'node:http';
import { createHash, timingSafeEqual } from 'node:crypto';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import { BzoError, validateSearch } from '../../src/lib/bzo/protocol.mjs';
import { searchOfficial } from '../../src/lib/bzo/upstream.mjs';

function send(response, status, payload) {
  response.writeHead(status, { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store', 'X-Content-Type-Options': 'nosniff', 'Connection': 'close' });
  response.end(JSON.stringify(payload));
}

function readBody(request) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    let size = 0;
    let rejected = false;
    request.on('data', chunk => {
      if (rejected) return;
      size += chunk.length;
      if (size > 2048) {
        rejected = true;
        reject(new BzoError('INVALID_QUERY', 'Request too large', 413));
      } else chunks.push(chunk);
    });
    request.on('end', () => {
      if (rejected) return;
      try { resolve(JSON.parse(Buffer.concat(chunks).toString('utf8'))); }
      catch { reject(new BzoError('INVALID_QUERY', 'Invalid JSON', 400)); }
    });
    request.on('error', () => reject(new BzoError('INVALID_QUERY', 'Invalid request', 400)));
    request.on('aborted', () => reject(new BzoError('INVALID_QUERY', 'Request aborted', 400)));
  });
}

export function createBridgeServer({ secret, search = searchOfficial } = {}) {
  if (typeof secret !== 'string' || secret.length < 32) throw new Error('BZO_BRIDGE_SECRET must contain at least 32 characters');
  const expected = createHash('sha256').update('Bearer ' + secret).digest();
  let active = 0;
  let count = 0;
  let resetAt = 0;
  const server = http.createServer({ maxHeaderSize: 8192 }, async (request, response) => {
    const actual = createHash('sha256').update(request.headers.authorization || '').digest();
    if (!timingSafeEqual(actual, expected)) return send(response, 401, { ok: false, code: 'UNAUTHORIZED' });
    if (request.method === 'GET' && request.url === '/health') return send(response, 200, { ok: true });
    if (request.method !== 'POST' || request.url !== '/search') return send(response, 404, { ok: false, code: 'NOT_FOUND' });
    if (!request.headers['content-type']?.toLowerCase().startsWith('application/json')) return send(response, 415, { ok: false, code: 'INVALID_QUERY' });
    const now = Date.now();
    if (now >= resetAt) { count = 0; resetAt = now + 60_000; }
    if (count >= 60 || active >= 2) return send(response, 429, { ok: false, code: 'BUSY' });
    count += 1;
    active += 1;
    response.setTimeout(25_000, () => response.destroy());
    try {
      const input = validateSearch(await readBody(request));
      const result = await search(input);
      send(response, 200, { ok: true, ...result });
    } catch (error) {
      const known = error instanceof BzoError;
      send(response, known ? error.status : 503, { ok: false, code: known ? error.code : 'UNAVAILABLE' });
    } finally { active -= 1; }
  });
  server.headersTimeout = 5_000;
  server.requestTimeout = 10_000;
  server.keepAliveTimeout = 5_000;
  return server;
}

if (process.argv[1] && fileURLToPath(import.meta.url) === path.resolve(process.argv[1])) {
  const server = createBridgeServer({ secret: process.env.BZO_BRIDGE_SECRET });
  server.listen(Number(process.env.BZO_BRIDGE_PORT) || 8787, process.env.BZO_BRIDGE_HOST || '127.0.0.1', () => {
    console.log('BZO bridge listening; searches are not logged or stored.');
  });
}
