import { readFileSync } from 'node:fs';
import { runInNewContext } from 'node:vm';
import { describe, it, expect } from 'vitest';

const source = readFileSync('public/boot-visibility.js', 'utf8');
function boot(pathname, member, blocked = false) {
  const attrs = {};
  runInNewContext(source, {
    document: { documentElement: { setAttribute: (key, value) => { attrs[key] = value; } } },
    location: { pathname }, navigator: {}, window: {},
    localStorage: { getItem: () => { if (blocked) throw new Error('denied'); return member ? '{}' : null; } },
  });
  return Object.hasOwn(attrs, 'data-member-boot');
}
describe('pre-paint member boot', () => {
  it('hides the fallback marketing hero before member or private-route paint', () => {
    expect(boot('/', true)).toBe(true);
    expect(boot('/dashboard', false)).toBe(true);
    expect(boot('/auth', false)).toBe(true);
  });
  it('preserves the homepage for new visitors, including blocked storage', () => {
    expect(boot('/', false)).toBe(false);
    expect(boot('/', false, true)).toBe(false);
  });
});
