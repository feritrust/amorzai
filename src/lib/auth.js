/**
 * احراز هویت سبک پنل مدیریت.
 *
 * توکن = base64url(payload).base64url(HMAC-SHA256)
 * فقط با Web Crypto ساخته شده تا هم در middleware (Edge) و هم در Node کار کند
 * و هیچ پکیج اضافه‌ای لازم نداشته باشد.
 */

export const AUTH_COOKIE = 'amorz_admin';
export const SESSION_MAX_AGE = 60 * 60 * 12; // ۱۲ ساعت

const enc = new TextEncoder();

function b64urlEncode(bytes) {
  let bin = '';
  for (const b of bytes) bin += String.fromCharCode(b);
  return btoa(bin).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

function b64urlDecode(str) {
  const pad = str.length % 4 ? '='.repeat(4 - (str.length % 4)) : '';
  const bin = atob(str.replace(/-/g, '+').replace(/_/g, '/') + pad);
  return Uint8Array.from(bin, (c) => c.charCodeAt(0));
}

function secret() {
  const s = process.env.ADMIN_SECRET || process.env.ADMIN_PASSWORD;
  if (!s) throw new Error('ADMIN_SECRET یا ADMIN_PASSWORD تنظیم نشده است');
  return s;
}

async function key() {
  return crypto.subtle.importKey('raw', enc.encode(secret()), { name: 'HMAC', hash: 'SHA-256' }, false, [
    'sign',
    'verify',
  ]);
}

/** ساخت توکن نشست */
export async function createToken({ sub = 'admin', ttl = SESSION_MAX_AGE } = {}) {
  const payload = { sub, iat: Date.now(), exp: Date.now() + ttl * 1000 };
  const body = b64urlEncode(enc.encode(JSON.stringify(payload)));
  const sig = await crypto.subtle.sign('HMAC', await key(), enc.encode(body));
  return `${body}.${b64urlEncode(new Uint8Array(sig))}`;
}

/** اعتبارسنجی توکن — در صورت نامعتبر یا منقضی بودن null برمی‌گرداند */
export async function verifyToken(token) {
  if (!token || typeof token !== 'string' || !token.includes('.')) return null;
  const [body, sig] = token.split('.');
  if (!body || !sig) return null;

  try {
    const valid = await crypto.subtle.verify('HMAC', await key(), b64urlDecode(sig), enc.encode(body));
    if (!valid) return null;

    const payload = JSON.parse(new TextDecoder().decode(b64urlDecode(body)));
    if (!payload?.exp || payload.exp < Date.now()) return null;
    return payload;
  } catch {
    return null;
  }
}

/** مقایسه رمز عبور به‌صورت مقاوم در برابر timing attack */
export function passwordMatches(input) {
  const expected = process.env.ADMIN_PASSWORD || '';
  if (!expected || typeof input !== 'string') return false;
  if (input.length !== expected.length) {
    // مقایسه ساختگی تا زمان پاسخ لو ندهد
    let dummy = 0;
    for (let i = 0; i < expected.length; i += 1) dummy |= expected.charCodeAt(i);
    return false;
  }
  let diff = 0;
  for (let i = 0; i < expected.length; i += 1) diff |= input.charCodeAt(i) ^ expected.charCodeAt(i);
  return diff === 0;
}
