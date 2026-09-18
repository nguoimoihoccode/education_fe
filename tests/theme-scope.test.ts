import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { describe, it } from 'node:test';
import { fileURLToPath } from 'node:url';

/* The light theme inverts Tailwind's neutral scale globally, which is what lets
   ~1000 untouched `slate-*`/`white` sites flip. Two things have to hold for that
   to be safe, and both are pinned here:

   1. The scale is inverted through CSS variables, NOT through a class-level
      `:root[data-theme='light'] :where(.bg-slate-950, ...) { ... !important }`
      remap. tests/foundation-tokens.test.ts already bans that shape; this file
      pins the positive: the utilities resolve through `--color-*` vars.
   2. The five routes that sit outside the shell (marketing landing + auth) keep
      their single look via `data-theme-fixed`, which restores the base values.
      Without it, `text-slate-900` on those already-light pages becomes
      near-white in light mode. */

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const read = (relativePath: string) =>
  readFileSync(join(root, relativePath), 'utf8');

const indexCss = read('src/index.css');
const tailwindConfig = read('tailwind.config.js');
const layout = read('src/components/layout/Layout.tsx');

describe('light theme neutral scale', () => {
  it('drives the neutral utilities from CSS variables', () => {
    for (const step of [50, 400, 950]) {
      assert.ok(
        tailwindConfig.includes(
          `${step}: 'rgb(var(--color-slate-${step}) / <alpha-value>)'`,
        ),
        `slate-${step} is not wired to --color-slate-${step}`,
      );
    }
    assert.ok(
      tailwindConfig.includes(
        "white: 'rgb(var(--color-white) / <alpha-value>)'",
      ),
      'white is not wired to --color-white',
    );
  });

  it('mirrors the scale for light instead of overriding utilities', () => {
    // Base (dark) values are Tailwind's own defaults...
    assert.match(indexCss, /:root \{[\s\S]*--color-slate-950:\s*2 6 23;/);
    // ...and light mirrors them, so the scale keeps its relative meaning.
    assert.match(
      indexCss,
      /:root\[data-theme='light'\][\s\S]*--color-slate-950:\s*248 250 252;/,
    );
    assert.match(
      indexCss,
      /:root\[data-theme='light'\][\s\S]*--color-white:\s*15 23 42;/,
    );
  });
});

describe('data-theme-fixed scope', () => {
  it('restores the base neutral values under the attribute', () => {
    const at = indexCss.indexOf("[data-theme-fixed='light']");
    assert.notEqual(at, -1, 'the [data-theme-fixed] rule is missing');

    const body = indexCss.slice(at, indexCss.indexOf('}', at));
    assert.match(body, /--color-slate-950:\s*2 6 23;/);
    assert.match(body, /--color-slate-900:\s*15 23 42;/);
    assert.match(body, /--color-gray-400:\s*156 163 175;/);
    assert.match(body, /--color-white:\s*255 255 255;/);
  });

  it('marks the marketing and auth routes from Layout', () => {
    assert.match(layout, /<div data-theme-fixed="light">\{children\}<\/div>/);
    assert.match(
      layout,
      /authPaths:\s*string\[\] = \[ROUTES\.LOGIN, ROUTES\.REGISTER, ROUTES\.AUTH_CALLBACK\]/,
    );
    assert.match(
      layout,
      /noLayoutPaths:\s*string\[\] = \[ROUTES\.HOME, ROUTES\.DASHBOARD_LANDING\]/,
    );
  });
});

describe('theme resolution', () => {
  it('resolves "system" through the OS preference and follows changes', () => {
    const app = read('src/App.tsx');
    assert.match(app, /window\.matchMedia\('\(prefers-color-scheme: light\)'\)/);
    assert.match(app, /prefersLight\.addEventListener\('change', applyTheme\)/);
    assert.match(app, /prefersLight\.removeEventListener\('change', applyTheme\)/);
  });

  it('resolves "system" in the boot script too, so the first frame matches', () => {
    const html = read('index.html');
    assert.match(
      html,
      /theme === 'system' && window\.matchMedia\('\(prefers-color-scheme: light\)'\)\.matches/,
    );
  });
});