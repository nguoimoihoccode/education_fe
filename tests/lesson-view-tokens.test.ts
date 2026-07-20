import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { describe, it } from 'node:test';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const css = readFileSync(join(root, 'src/pages/Education.css'), 'utf8');

describe('Lesson view Dark Learning tokens', () => {
  it('defines lesson-panel with app surface and border', () => {
    assert.match(
      css,
      /\.lesson-panel\s*\{[^}]*background:\s*var\(--app-surface\)/s,
    );
    assert.match(
      css,
      /\.lesson-panel\s*\{[^}]*border:\s*1px solid var\(--app-border\)/s,
    );
  });

  it('defines lesson-primary-btn with app primary', () => {
    assert.match(
      css,
      /\.lesson-primary-btn\s*\{[^}]*background:\s*var\(--app-primary\)/s,
    );
  });

  it('defines lesson-option-selected with app primary', () => {
    assert.match(
      css,
      /\.lesson-option-selected\s*\{[^}]*border-color:\s*var\(--app-primary\)/s,
    );
  });

  it('defines lesson-input focus using app-focus', () => {
    assert.match(css, /\.lesson-input:focus-visible|\.lesson-input:focus/);
    assert.match(css, /lesson-input[\s\S]{0,400}--app-focus/);
  });
});
