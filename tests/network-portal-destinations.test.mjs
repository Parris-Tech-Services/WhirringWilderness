// Isolated regression of portal destinations: no real network or browser navigation.
// The real inline script runs against mocked URLs, registry, animation and DOM.
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import test from 'node:test';
import vm from 'node:vm';

const folder = path.dirname(fileURLToPath(import.meta.url));
const page = readFileSync(path.resolve(folder, '../public/network/portal.html'), 'utf8');
const scripts = [...page.matchAll(/<script(?:\s[^>]*)?>([\s\S]*?)<\/script>/gi)];
assert.equal(scripts.length, 1, 'portal must have exactly one inline script');
const source = scripts[0][1];
const BASE = 'https://parris-tech-services.github.io/WhirringWilderness/network/portal.html';
const OWNED_URL = 'https://parris-tech-services.github.io/WhirringWilderness/';

async function render(query, registry = {
  'whirring-wilderness': { url: OWNED_URL, label: 'Whirring Wilderness', portals: [] },
}) {
  const location = {
    href: BASE + '?' + query,
    get search() { return new URL(this.href).search; },
  };
  const elements = new Map();
  function element(id) {
    if (!elements.has(id)) elements.set(id, { textContent: '', style: {}, onclick: null });
    return elements.get(id);
  }
  let requests = 0;
  const ctx = vm.createContext({
    URL, URLSearchParams, location, document: { getElementById: element },
    fetch: async () => { requests++; return { json: async () => registry }; },
    requestAnimationFrame: () => { },  // disable the real timed navigation
    console: { error() {} },
    Date, Math,
  });
  await new vm.Script(source, { filename: 'public/network/portal.html' })
    .runInContext(ctx, { timeout: 500 });
  return {
    start: BASE + '?' + query,
    location,
    requests,
    clickSkip() { element('skip').onclick(); return location.href; },
  };
}

test('registered destination still works and carries arrival metadata', async () => {
  const page = await render('from=network&to=whirring-wilderness');
  assert.equal(page.requests, 1);
  const result = new URL(page.clickSkip());
  assert.equal(result.origin + result.pathname, OWNED_URL);
  assert.equal(result.searchParams.get('portal'), 'true');
  assert.equal(result.searchParams.get('from'), 'network');
});

test('unknown destination cannot use caller-supplied URL fallback', async () => {
  for (const destination of [
    'https://outside.example/phishing',
    'javascript:alert(1)',
    'data:text/html,unsafe',
    'https://parris-tech-services.github.io.outside.example/',
    'http://localhost:8443/',
  ]) {
    const query = new URLSearchParams({ from: 'network', to: 'unknown-game', url: destination });
    const page = await render(query.toString());
    assert.equal(page.clickSkip(), page.start, destination);
  }
});

test('invalid registry targets and failed registry load fail closed', async () => {
  for (const destination of [
    'javascript:alert(1)',
    'https://outside.example/phishing',
    'http://parris-tech-services.github.io/WhirringWilderness/',
    'https://person@parris-tech-services.github.io/WhirringWilderness/',
  ]) {
    const page = await render('to=whirring-wilderness', {
      'whirring-wilderness': { url: destination, label: 'Test', portals: [] },
    });
    assert.equal(page.clickSkip(), page.start, destination);
  }
  const page = await render('to=unregistered&url=https%3A%2F%2Foutside.example%2F', {});
  assert.equal(page.clickSkip(), page.start);
});
