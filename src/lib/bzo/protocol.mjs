export const BZO_URL = 'https://beheshtezahra.tehran.ir/bzo';
export const MAX_RESULTS = 100;

export class BzoError extends Error {
  constructor(code, message, status = 502) {
    super(message);
    this.code = code;
    this.status = status;
  }
}

export function latinDigits(value) {
  return String(value ?? '').replace(/[۰-۹٠-٩]/g, character => {
    const code = character.charCodeAt(0);
    return String(code >= 0x6f0 ? code - 0x6f0 : code - 0x660);
  });
}

function decodeEntities(value) {
  const named = { amp: '&', lt: '<', gt: '>', quot: '"', apos: "'", nbsp: ' ' };
  return String(value).replace(/&(#x[0-9a-f]+|#\d+|amp|lt|gt|quot|apos|nbsp);/gi, (entity, code) => {
    if (code[0] !== '#') return named[code.toLowerCase()] ?? entity;
    const number = code[1].toLowerCase() === 'x' ? parseInt(code.slice(2), 16) : Number(code.slice(1));
    return number > 0 && number <= 0x10ffff && !(number >= 0xd800 && number <= 0xdfff)
      ? String.fromCodePoint(number) : '';
  });
}

export function plainHtml(value) {
  return decodeEntities(String(value)
    .replace(/<(script|style)\b[^>]*>[\s\S]*?<\/\1>/gi, '')
    .replace(/<[^>]*>/g, ' '))
    .replace(/[\u0000-\u001f\u007f\u200e\u200f\u202a-\u202e\u2066-\u2069]/g, ' ')
    .replace(/\s+/g, ' ').trim();
}

function attributes(tag) {
  const result = {};
  for (const match of tag.matchAll(/([\w:$-]+)\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s>]+))/g)) {
    result[match[1].toLowerCase()] = decodeEntities(match[2] ?? match[3] ?? match[4]);
  }
  return result;
}

export function validateSearch(input) {
  if (!input || typeof input !== 'object' || Array.isArray(input)) {
    throw new BzoError('INVALID_QUERY', 'اطلاعات جستجو معتبر نیست.', 400);
  }
  const result = {};
  for (const key of ['firstName', 'lastName', 'fatherName', 'part', 'dateFrom', 'dateTo']) {
    if (input[key] != null && typeof input[key] !== 'string') {
      throw new BzoError('INVALID_QUERY', 'فیلدهای جستجو باید متن باشند.', 400);
    }
    const value = (input[key] || '').trim().normalize('NFC');
    if (value.length > 80 || /[\u0000-\u001f\u007f]/.test(value)) {
      throw new BzoError('INVALID_QUERY', 'یکی از فیلدهای جستجو معتبر نیست.', 400);
    }
    result[key] = value;
  }
  if (!result.firstName || !result.lastName) {
    throw new BzoError('INVALID_QUERY', 'نام و نام خانوادگی را وارد کنید.', 400);
  }
  result.part = latinDigits(result.part);
  if (result.part && !/^\d{1,4}$/.test(result.part)) {
    throw new BzoError('INVALID_QUERY', 'قطعه را به صورت عدد وارد کنید.', 400);
  }
  for (const key of ['dateFrom', 'dateTo']) {
    result[key] = latinDigits(result[key]);
    if (!result[key]) continue;
    const date = result[key].match(/^(1[34]\d{2})\/(\d{1,2})\/(\d{1,2})$/);
    if (!date || Number(date[2]) < 1 || Number(date[2]) > 12 || Number(date[3]) < 1 || Number(date[3]) > 31) {
      throw new BzoError('INVALID_QUERY', 'تاریخ شمسی را مانند ۱۴۰۵/۰۷/۰۱ وارد کنید.', 400);
    }
    result[key] = date[1] + '/' + date[2].padStart(2, '0') + '/' + date[3].padStart(2, '0');
  }
  if (result.dateFrom && result.dateTo && result.dateFrom > result.dateTo) {
    throw new BzoError('INVALID_QUERY', 'تاریخ شروع باید پیش از تاریخ پایان باشد.', 400);
  }
  return result;
}

function checkChallenge(html) {
  if (/g-recaptcha|h-captcha|cf-turnstile|<input\b[^>]*name=["'][^"']*captcha/i.test(html)) {
    throw new BzoError('UPSTREAM_CHALLENGE', 'سامانه رسمی تأیید امنیتی می‌خواهد؛ جستجو را در سایت رسمی ادامه دهید.', 503);
  }
}

export function readSearchForm(html) {
  checkChallenge(html);
  const form = [...html.matchAll(/<form\b([^>]*)>([\s\S]*?)<\/form>/gi)]
    .find(match => /DeadSearch\$txtname/.test(match[2]));
  if (!form) throw new BzoError('UPSTREAM_CHANGED', 'فرم جستجوی سامانه رسمی قابل شناسایی نیست.');
  const config = attributes(form[1]);
  const action = new URL(config.action || BZO_URL, BZO_URL);
  if (config.method?.toLowerCase() !== 'post' || action.origin !== new URL(BZO_URL).origin || action.pathname !== '/bzo') {
    throw new BzoError('UPSTREAM_CHANGED', 'مسیر فرم جستجوی سامانه رسمی تغییر کرده است.');
  }
  const fields = new URLSearchParams();
  const inputs = [...form[2].matchAll(/<input\b[^>]*>/gi)].map(match => attributes(match[0]));
  for (const input of inputs) {
    if (input.type?.toLowerCase() === 'hidden' && input.name) fields.set(input.name, input.value || '');
  }
  const firstName = inputs.find(input => input.name?.endsWith('$DeadSearch$txtname'));
  const prefix = firstName?.name.slice(0, -'txtname'.length);
  if (!prefix || !fields.has('__VIEWSTATE') || !fields.has('__EVENTVALIDATION')) {
    throw new BzoError('UPSTREAM_CHANGED', 'اطلاعات نشست سامانه رسمی کامل نیست.');
  }
  for (const name of ['txtFamily', 'txtFatherName', 'txtPart', 'txtDateFrom', 'txtDateTo', 'btnSearch']) {
    if (!inputs.some(input => input.name === prefix + name)) {
      throw new BzoError('UPSTREAM_CHANGED', 'ساختار فرم سامانه رسمی تغییر کرده است.');
    }
  }
  return { fields, prefix };
}

export function buildSearchBody(form, input) {
  const query = validateSearch(input);
  const fields = new URLSearchParams(form.fields);
  const names = { firstName: 'txtname', lastName: 'txtFamily', fatherName: 'txtFatherName', part: 'txtPart', dateFrom: 'txtDateFrom', dateTo: 'txtDateTo' };
  for (const [key, name] of Object.entries(names)) fields.set(form.prefix + name, query[key]);
  fields.set(form.prefix + 'btnSearch', 'جستجو');
  fields.set('__EVENTTARGET', '');
  fields.set('__EVENTARGUMENT', '');
  return fields;
}

export function parseSearchResults(html) {
  checkChallenge(html);
  const marker = /<div\b[^>]*id=["'][^"']*DeadSearch_divresult["'][^>]*>/i.exec(html);
  if (!marker) throw new BzoError('UPSTREAM_CHANGED', 'پاسخ جستجوی سامانه رسمی قابل شناسایی نیست.');
  const content = html.slice(marker.index + marker[0].length);
  const table = /<table\b[^>]*>([\s\S]*?)<\/table>/i.exec(content);
  if (!table) {
    const message = plainHtml(content.split(/<\/div>/i)[0]);
    if (/یافت نشد|پیدا نشد|موردی وجود ندارد/.test(message)) return { records: [], truncated: false, sourceUrl: BZO_URL };
    throw new BzoError('UPSTREAM_CHANGED', 'جدول نتایج سامانه رسمی در دسترس نیست.');
  }
  const headers = [...table[1].matchAll(/<th\b[^>]*>([\s\S]*?)<\/th>/gi)].map(match => plainHtml(match[1]));
  const expected = ['ردیف', 'نام', 'نام خانوادگی', 'نام پدر', 'تاریخ تولد', 'تاریخ دفن'];
  if (!expected.every((value, index) => headers[index] === value) || !/شماره/.test(headers[6] || '') || !/قطعه/.test(headers[6] || '')) {
    throw new BzoError('UPSTREAM_CHANGED', 'ستون‌های نتایج سامانه رسمی تغییر کرده است.');
  }
  const records = [];
  let totalReceived = 0;
  for (const match of table[1].matchAll(/<tr\b[^>]*>([\s\S]*?)<\/tr>/gi)) {
    const cells = [...match[1].matchAll(/<td\b[^>]*>([\s\S]*?)<\/td>/gi)].map(cell => plainHtml(cell[1]));
    if (!cells.length) continue;
    if (cells.length !== 8 || !cells[1] || !cells[2]) throw new BzoError('UPSTREAM_CHANGED', 'یکی از ردیف‌های نتایج ساختار معتبری ندارد.');
    totalReceived += 1;
    if (records.length >= MAX_RESULTS) continue;
    const location = latinDigits(cells[6]).match(/^\s*(\d+)\s*-\s*(\d+)\s*-\s*(\d+)\s*$/);
    records.push({
      firstName: cells[1].slice(0, 100), lastName: cells[2].slice(0, 100),
      fatherName: cells[3].slice(0, 100), birthDate: cells[4].slice(0, 32), burialDate: cells[5].slice(0, 32),
      burialLocation: cells[6].slice(0, 120),
      part: location?.[1] || '', row: location?.[2] || '', grave: location?.[3] || '',
    });
  }
  return { records, truncated: totalReceived > MAX_RESULTS, sourceUrl: BZO_URL };
}
