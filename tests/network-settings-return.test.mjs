// Regression suite for the real Parris Network settings page.
// The inline browser script is evaluated only in an inert mocked DOM/VM:
// no network access, navigation or arbitrary page script execution.
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import test from 'node:test';
import vm from 'node:vm';

const folder = path.dirname(fileURLToPath(import.meta.url));
const page = readFileSync(path.resolve(folder, '../public/network/settings.html'), 'utf8');
const scripts = [...page.matchAll(/<script(?:\s[^>]*)?>([\s\S]*?)<\/script>/gi)];
assert.equal(scripts.length, 1, 'the tested page must have exactly one inline script');
const script = scripts[0][1];
const SETTINGS = 'https://parris-tech-services.github.io/WhirringWilderness/network/settings.html';
const FALLBACK = 'https://parris-tech-services.github.io/WhirringWilderness/network/';
const DEFAULTS = { podcasts: false, portals: false, network: false };

function render(queryReturn) {
  const startingUrl = new URL(SETTINGS);
  if (queryReturn !== undefined) startingUrl.searchParams.set('return', queryReturn);
  const location = {
    href: startingUrl.href,
    get search() { return new URL(this.href).search; },
    get origin() { return new URL(this.href).origin; },
  };
  const elements = new Map();
  function getElementById(id) {
    if (!elements.has(id)) {
      elements.set(id, {
        href: '', checked: false, hidden: false, handlers: {},
        addEventListener(event, handler) { this.handlers[event] = handler; },
      });
    }
    return elements.get(id);
  }
  const context = vm.createContext({
    URL, URLSearchParams, document: { title: '', getElementById },
    location, JSON, Boolean, Set,
  });
  new vm.Script(script, { filename: 'public/network/settings.html' })
    .runInContext(context, { timeout: 500 });
  return {
    get back() { return getElementById('backLink').href; },
    save() { getElementById('save').handlers.click(); return location.href; },
    allOff() { getElementById('allOff').handlers.click(); return location.href; },
  };
}

test('approved owned-game destinations and same-origin paths remain usable', () => {
  for (const value of [
    '/WhirringWilderness/',
    'https://parris-tech-services.github.io/WhirringWilderness/',
    'https://joshuaparrisdadlan-stack.github.io/whispering-wilds/',
    'https://josh-hub-two.vercel.app/games/starhaven/',
    'https://joshualparris.github.io/Repository-town/',
  ]) {
    const panel = render(value);
    const expected = new URL(value, SETTINGS);
    assert.equal(panel.back, expected.href, value);
    const saved = new URL(panel.save());
    assert.equal(saved.origin, expected.origin, value);
    assert.equal(saved.pathname, expected.pathname, value);
    assert.deepEqual(JSON.parse(saved.searchParams.get('parrisPrefs')), DEFAULTS);
  }
});

test('unsafe external addresses, misleading hosts and script schemes fall back', () => {
  for (const value of [
    'https://outside.example/other',
    '//outside.example/other',
    'javascript:alert(1)',
    'data:text/html,unsafe',
    'https://visitor@parris-tech-services.github.io/WhirringWilderness/',
    'http://parris-tech-services.github.io/WhirringWilderness/',
    'https://parris-tech-services.github.io.outside.example/path',
    'http://localhost:8099/debug',
    'https://[',
  ]) {
    const panel = render(value);
    assert.equal(panel.back, FALLBACK, value);
    const saved = new URL(panel.save());
    assert.equal(saved.origin, new URL(FALLBACK).origin, value);
    assert.equal(saved.pathname, new URL(FALLBACK).pathname, value);
    assert.deepEqual(JSON.parse(saved.searchParams.get('parrisPrefs')), DEFAULTS);
  }
});

test('missing return keeps local directory and All Off saves safe preferences', () => {
  const panel = render();
  assert.equal(panel.back, FALLBACK);
  const saved = new URL(panel.allOff());
  assert.equal(saved.origin + saved.pathname, FALLBACK);
  assert.deepEqual(JSON.parse(saved.searchParams.get('parrisPrefs')), DEFAULTS);
});
