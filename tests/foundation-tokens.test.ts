import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { describe, it } from 'node:test';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const indexCss = readFileSync(join(root, 'src/index.css'), 'utf8');

describe('Dark Learning foundation tokens', () => {
  it('maps --color-primary to app primary (emerald), not warning', () => {
    assert.match(indexCss, /--color-primary:\s*var\(--app-primary\)/);
    assert.doesNotMatch(
      indexCss,
      /--color-primary:\s*var\(--app-warning\)/,
    );
  });

  it('defines dark muted/subtle floors for contrast', () => {
    assert.match(indexCss, /--app-text-subtle:\s*#c4c4c4/);
    assert.match(indexCss, /--app-text-muted:\s*#d4d4d4/);
  });

  it('defines light theme primary/accent/focus token values', () => {
    assert.match(indexCss, /\[data-theme=['"]light['"]\][\s\S]*--app-primary:\s*#059669/);
    assert.match(indexCss, /\[data-theme=['"]light['"]\][\s\S]*--app-accent:\s*#7c3aed/);
    assert.match(indexCss, /\[data-theme=['"]light['"]\][\s\S]*--app-focus:\s*#0891b2/);
  });

  it('does not use mass light-mode !important slate overrides', () => {
    assert.doesNotMatch(
      indexCss,
      /:root\[data-theme=['"]light['"]\]\s*:where\(\.bg-slate-950/,
    );
  });
});
