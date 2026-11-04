import { readFileSync } from 'node:fs';
import { runInNewContext } from 'node:vm';
import { expect, it } from 'vitest';
it('upgrading an old worker removes cached session A evidence before activation finishes', async () => {
  const cache = new Map([['images-cache', ['https://private/paper.jpg?signature=A']], ['precache', ['app.js']]]);
  let activate: ((event: { waitUntil: (promise: Promise<unknown>) => void }) => void) | undefined;
  let complete: Promise<unknown> | undefined;
  runInNewContext(readFileSync('public/sw-privacy.js', 'utf8'), {
    self: { addEventListener: (type: string, callback: typeof activate) => { if (type === 'activate') activate = callback; } },
    caches: { delete: async (name: string) => cache.delete(name) },
  });
  activate!({ waitUntil: promise => { complete = promise; } });
  await complete;
  expect(cache.has('images-cache')).toBe(false);
  expect(cache.has('precache')).toBe(true);
});
it('routes image requests including signed evidence to NetworkOnly and imports upgrade cleanup', () => {
  const config = readFileSync('vite.config.ts', 'utf8');
  expect(config).toContain("request.destination === 'image', handler: 'NetworkOnly'");
  expect(config).toContain("importScripts: ['/sw-privacy.js']");
  expect(config).not.toContain("cacheName: 'images-cache'");
});
