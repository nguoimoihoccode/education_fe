import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { describe, it } from 'node:test';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const css = readFileSync(join(root, 'src/pages/Education.css'), 'utf8');

describe('Education home Dark Learning polish', () => {
  it('uses app tokens for path page background (not mint light gradient)', () => {
    assert.match(css, /\.education-path-page\s*\{[^}]*var\(--app-bg\)/s);
    assert.doesNotMatch(
      css,
      /\.education-path-page\s*\{[^}]*#eefaf4/s,
    );
  });

  it('styles primary action with app primary token', () => {
    assert.match(
      css,
      /\.edu-primary-action\s*\{[^}]*background:\s*var\(--app-primary\)/s,
    );
  });

  it('styles today plan surfaces with app surface/border tokens', () => {
    assert.match(
      css,
      /\.today-plan-hero[\s\S]*?background:\s*var\(--app-surface\)/,
    );
    assert.match(
      css,
      /\.today-plan-hero[\s\S]*?border:\s*1px solid var\(--app-border\)/,
    );
  });

  it('does not use heavy backdrop-filter on today-plan-hero', () => {
    const heroBlock = css.match(
      /\.today-plan-hero\s*,\s*\.today-plan-empty\s*,\s*\.today-plan-error\s*\{[^}]+\}/,
    );
    assert.ok(heroBlock, 'expected shared today-plan surface rule');
    assert.doesNotMatch(heroBlock[0], /backdrop-filter/);
  });
});
