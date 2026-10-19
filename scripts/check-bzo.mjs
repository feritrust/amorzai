import assert from 'node:assert/strict';
import { test } from 'node:test';
import fs from 'node:fs';
import { BZO_URL, BzoError, MAX_RESULTS, validateSearch, readSearchForm, buildSearchBody, parseSearchResults } from '../src/lib/bzo/protocol.mjs';
import { searchOfficial } from '../src/lib/bzo/upstream.mjs';
import { getBridgeConfig, searchThroughBridge } from '../src/lib/bzo/bridge-client.mjs';
import { createBridgeServer } from '../deploy/bzo-bridge/server.mjs';

const query = { firstName: 'نام آزمایشی', lastName: 'نام خانوادگی آزمایشی' };
const prefix = 'dnn$ctr9999$DeadSearch$';
function formHtml(token = 'fresh-state') {
  return '<form id="Form" method="post" action="/bzo">' +
    '<input type="hidden" name="__VIEWSTATE" value="' + token + '">' +
    '<input type="hidden" name="__EVENTVALIDATION" value="fresh-validation">' +
    '<input type="hidden" name="__RequestVerificationToken" value="fresh-csrf">' +
    ['txtname', 'txtFamily', 'txtFatherName', 'txtPart', 'txtDateFrom', 'txtDateTo', 'btnSearch'].map(name => '<input name="' + prefix + name + '" type="text">').join('') + '</form>';
}
const tableHeader = '<tr>' + ['ردیف', 'نام', 'نام خانوادگی', 'نام پدر', 'تاریخ تولد', 'تاریخ دفن', '(شماره - ردیف - قطعه)', ''].map(value => '<th>' + value + '</th>').join('') + '</tr>';
function resultHtml(count = 1, location = '101-22-33') {
  const row = '<tr><td>1</td><td>نام آزمایشی</td><td>نام خانوادگی آزمایشی</td><td>—</td><td>—</td><td>1405/07/01</td><td>' + location + '</td><td><a onclick="routing(101);">مسیریابی</a></td></tr>';
  return '<div id="dnn_ctr9999_DeadSearch_divresult"><table>' + tableHeader + row.repeat(count) + '</table></div>';
}
const htmlResponse = (body, headers = {}) => new Response(body, { headers: { 'Content-Type': 'text/html; charset=utf-8', ...headers } });

test('requires both names and normalizes Persian digits and date ranges', () => {
  assert.throws(() => validateSearch({ firstName: 'نام' }), error => error.code === 'INVALID_QUERY');
  assert.throws(() => validateSearch({ ...query, firstName: {} }), error => error.status === 400);
  assert.throws(() => validateSearch({ ...query, firstName: 'a\n' + 'b' }), error => error.status === 400);
  const parsed = validateSearch({ ...query, part: '۱۰۱', dateFrom: '۱۴۰۵/۷/۱', dateTo: '۱۴۰۵/۷/۳۰' });
  assert.equal(parsed.part, '101');
  assert.equal(parsed.dateFrom, '1405/07/01');
  assert.throws(() => validateSearch({ ...query, dateFrom: '1405/13/01' }), error => error.status === 400);
  assert.throws(() => validateSearch({ ...query, dateFrom: '1405/08/01', dateTo: '1405/07/01' }), error => error.status === 400);
});

test('discovers the module and preserves fresh hidden fields without sharing saved tokens', () => {
  const form = readSearchForm(formHtml());
  assert.equal(form.prefix, prefix);
  const body = buildSearchBody(form, query);
  assert.equal(body.get('__VIEWSTATE'), 'fresh-state');
  assert.equal(body.get('__RequestVerificationToken'), 'fresh-csrf');
  assert.equal(body.get(prefix + 'txtname'), query.firstName);
  assert.equal(body.get(prefix + 'btnSearch'), 'جستجو');
  assert.throws(() => readSearchForm(formHtml().replace('action="/bzo"', 'action="https://example.com/search"')), error => error.code === 'UPSTREAM_CHANGED');
});

test('stops on a challenge instead of attempting to bypass it', () => {
  assert.throws(() => readSearchForm(formHtml() + '<input name="captcha">'), error => error.code === 'UPSTREAM_CHALLENGE');
});

test('reads location in the observed part-row-grave order and preserves nonnumeric locations', () => {
  const record = parseSearchResults(resultHtml()).records[0];
  assert.equal(record.part, '101');
  assert.equal(record.row, '22');
  assert.equal(record.grave, '33');
  const other = parseSearchResults(resultHtml(1, 'آرامستان دیگر')).records[0];
  assert.equal(other.burialLocation, 'آرامستان دیگر');
  assert.equal(other.part, '');
  assert.equal(parseSearchResults(resultHtml(1, '۱۰۱-۲۲-۳۳')).records[0].grave, '33');
});

test('caps returned results and does not confuse an upstream change with no matches', () => {
  const parsed = parseSearchResults(resultHtml(MAX_RESULTS + 1));
  assert.equal(parsed.records.length, MAX_RESULTS);
  assert.equal(parsed.truncated, true);
  assert.equal(parseSearchResults(resultHtml(0)).records.length, 0);
  assert.throws(() => parseSearchResults(formHtml()), error => error.code === 'UPSTREAM_CHANGED');
  assert.throws(() => parseSearchResults(resultHtml().replace('<th>نام</th>', '<th>ستون دیگر</th>')), error => error.code === 'UPSTREAM_CHANGED');
});

test('gets new cookies and state for every search and posts only to the known official URL', async () => {
  let session = 0;
  const fetchImpl = async (url, options) => {
    assert.equal(url, BZO_URL);
    assert.equal(options.redirect, 'manual');
    assert.equal(options.cache, 'no-store');
    if (options.method !== 'POST') {
      session += 1;
      assert.equal(options.headers.Cookie, undefined);
      return htmlResponse(formHtml('state-' + session), { 'Set-Cookie': 'SID=session-' + session + '; HttpOnly; Path=/' });
    }
    const body = new URLSearchParams(options.body);
    assert.equal(options.headers.Cookie, 'SID=session-' + session);
    assert.equal(body.get('__VIEWSTATE'), 'state-' + session);
    assert.equal(body.get(prefix + 'txtFamily'), query.lastName);
    return htmlResponse(resultHtml());
  };
  assert.equal((await searchOfficial(query, { fetchImpl })).records.length, 1);
  assert.equal((await searchOfficial(query, { fetchImpl })).records.length, 1);
  assert.equal(session, 2);
});

test('rejects bad upstream responses and oversized pages without exposing internals', async () => {
  await assert.rejects(searchOfficial(query, { fetchImpl: async () => new Response('', { status: 302, headers: { Location: 'https://example.com/' } }) }), error => error.code === 'UPSTREAM_UNAVAILABLE');
  await assert.rejects(searchOfficial(query, { fetchImpl: async () => htmlResponse('x'.repeat(2_000_001)) }), error => error.code === 'UPSTREAM_TOO_LARGE');
  await assert.rejects(searchOfficial(query, { fetchImpl: async () => { throw new Error('private connection detail'); } }), error => error.status === 503 && !error.message.includes('private'));
});

test('requires explicit bridge configuration and HTTPS in production', () => {
  const base = { BZO_SEARCH_ENABLED: 'true', BZO_BRIDGE_SECRET: 'x'.repeat(32), BZO_BRIDGE_URL: 'https://bridge.example/search', NODE_ENV: 'production' };
  assert.ok(getBridgeConfig(base));
  assert.equal(getBridgeConfig({ ...base, BZO_SEARCH_ENABLED: 'false' }), null);
  assert.equal(getBridgeConfig({ ...base, BZO_BRIDGE_URL: 'http://bridge.example/search' }), null);
  assert.equal(getBridgeConfig({ ...base, BZO_BRIDGE_URL: 'https://user:pass@bridge.example/search' }), null);
  assert.equal(getBridgeConfig({ ...base, BZO_BRIDGE_SECRET: 'short' }), null);
});

test('private bridge checks authorization, body size, validation and successful response', async () => {
  const secret = 'test-secret-'.repeat(4);
  let received = 0;
  const server = createBridgeServer({ secret, search: async input => {
    received += 1;
    assert.equal(input.firstName, query.firstName);
    return parseSearchResults(resultHtml());
  } });
  await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
  const url = 'http://127.0.0.1:' + server.address().port + '/search';
  const headers = { 'Content-Type': 'application/json', Authorization: 'Bearer ' + secret };
  try {
    assert.equal((await fetch(url, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(query) })).status, 401);
    assert.equal((await fetch(url, { method: 'POST', headers, body: JSON.stringify({ firstName: 'نام' }) })).status, 400);
    assert.equal((await fetch(url, { method: 'POST', headers, body: JSON.stringify({ value: 'x'.repeat(3000) }) })).status, 413);
    const result = await searchThroughBridge(query, { env: { BZO_SEARCH_ENABLED: 'true', BZO_BRIDGE_SECRET: secret, BZO_BRIDGE_URL: url, NODE_ENV: 'test' } });
    assert.equal(result.records.length, 1);
    assert.equal(result.sourceUrl, BZO_URL);
    assert.equal(received, 1);
  } finally { await new Promise(resolve => server.close(resolve)); }
});

test('bridge client refuses invalid response shapes', async () => {
  const env = { BZO_SEARCH_ENABLED: 'true', BZO_BRIDGE_SECRET: 'x'.repeat(32), BZO_BRIDGE_URL: 'https://bridge.example/search' };
  await assert.rejects(searchThroughBridge(query, { env, fetchImpl: async () => Response.json({ ok: true, records: [{ injected: '<script>' }] }) }), error => error instanceof BzoError && error.status === 503);
});

const savedResult = new URL('../seo-data/نتایح.html', import.meta.url);
test('optional local saved result parses without printing or copying personal records', { skip: !fs.existsSync(savedResult) }, () => {
  const result = parseSearchResults(fs.readFileSync(savedResult, 'utf8'));
  assert.ok(result.records.length > 0);
  assert.ok(result.records.every(record => typeof record.firstName === 'string' && typeof record.burialLocation === 'string'));
});
