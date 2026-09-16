import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import test from 'node:test';
import { fileURLToPath } from 'node:url';

const root = dirname(fileURLToPath(import.meta.url));
const readSource = (relativePath: string) =>
  readFileSync(join(root, '..', relativePath), 'utf8');

// A deploy deletes the previous build's hashed chunks, and the PWA service
// worker serves its precached index.html for every navigation, so a tab on the
// old build fails the next lazy-route import. Without recovery that rejects and
// blanks the page, which reads as "the page will not open".
test('the app recovers from chunks a deploy has replaced', () => {
  const main = readSource('src/main.tsx');
  const recovery = readSource('src/utils/chunk-recovery.ts');
  const boundary = readSource('src/components/ErrorBoundary.tsx');

  assert.match(main, /installChunkLoadRecovery\(\)/);
  assert.match(main, /<ErrorBoundary>/);
  assert.match(recovery, /'vite:preloadError'/);
  assert.match(recovery, /event\.preventDefault\(\)/);
  assert.match(boundary, /getDerivedStateFromError/);
});

// Every route is lazy, so a failed import is not specific to one page.
test('routes are still loaded lazily', () => {
  const app = readSource('src/App.tsx');

  assert.match(app, /const AdvancedSettings = lazy\(\(\) => import\('@\/pages\/AdvancedSettings'\)\)/);
  assert.match(app, /<Suspense/);
});