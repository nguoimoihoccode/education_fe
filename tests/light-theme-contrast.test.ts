import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { describe, it } from 'node:test';
import { fileURLToPath } from 'node:url';

/* WCAG floors for the light theme, computed from the tokens actually declared
   in the CSS rather than from copies of their values, so a token edit that
   breaks contrast fails here.

   The defect this pins: the light theme existed but the `--edu-*` "readable"
   family had no light values, and `.education-container:not(.education-path-page)
   header h1 { color: var(--edu-text-readable) }` puts that colour straight on
   the page background -- #f8fafc on #ffffff, 1.03:1, invisible on 22 pages.
   The same family also asked the mirrored neutral scale for text, where
   slate-600/700 land at 2.45:1 and 1.42:1. */

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const read = (relativePath: string) =>
  readFileSync(join(root, relativePath), 'utf8');

/** Comments carry braces and var names; drop them before parsing blocks. */
const stripComments = (css: string) => css.replace(/\/\*[\s\S]*?\*\//g, '');

const indexCss = stripComments(read('src/index.css'));
const educationCss = stripComments(read('src/pages/Education.css'));

/** The custom properties declared by the first rule whose selector is `selector`. */
function tokens(css: string, selector: string): Record<string, string> {
  const at = css.indexOf(selector);
  assert.notEqual(at, -1, `no rule found for ${selector}`);
  const open = css.indexOf('{', at);
  const close = css.indexOf('}', open);
  const body = css.slice(open + 1, close);
  const out: Record<string, string> = {};
  for (const [, name, value] of body.matchAll(/(--[\w-]+):\s*([^;]+);/g)) {
    out[name] = value.trim();
  }
  return out;
}

const rgb = (value: string): [number, number, number] => {
  const v = value.trim();
  if (v.startsWith('#')) {
    const hex =
      v.length === 4 ? [...v.slice(1)].map((c) => c + c).join('') : v.slice(1);
    return [
      parseInt(hex.slice(0, 2), 16),
      parseInt(hex.slice(2, 4), 16),
      parseInt(hex.slice(4, 6), 16),
    ];
  }
  const [r, g, b] = v.split(/\s+/).map(Number);
  return [r, g, b];
};

const luminance = ([r, g, b]: [number, number, number]) => {
  const channel = (raw: number) => {
    const c = raw / 255;
    return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
  };
  return 0.2126 * channel(r) + 0.7152 * channel(g) + 0.0722 * channel(b);
};

const contrast = (fg: string, bg: string) => {
  const a = luminance(rgb(fg));
  const b = luminance(rgb(bg));
  return (Math.max(a, b) + 0.05) / (Math.min(a, b) + 0.05);
};

const dark = tokens(indexCss, ':root {');
const light = tokens(indexCss, ":root[data-theme='light']");
const educationLight = tokens(educationCss, ":root[data-theme='light']");

/** Assert with the measured ratio in the failure message. */
function atLeast(fg: string, bg: string, floor: number, label: string) {
  const ratio = contrast(fg, bg);
  assert.ok(
    ratio >= floor,
    `${label}: ${ratio.toFixed(2)}:1, below the ${floor}:1 floor`,
  );
  return ratio;
}

describe('light theme contrast', () => {
  it('keeps body copy above AA on the page and on surfaces', () => {
    atLeast(light['--app-text'], light['--app-bg'], 4.5, 'app-text on app-bg');
    atLeast(
      light['--app-text-muted'],
      light['--app-bg'],
      4.5,
      'app-text-muted on app-bg',
    );
    atLeast(
      light['--app-text-subtle'],
      light['--app-surface'],
      4.5,
      'app-text-subtle on app-surface',
    );
  });

  it('gives the --edu-* readable family light values that clear AA', () => {
    for (const name of [
      '--edu-text-readable',
      '--edu-text-muted-readable',
      '--edu-text-subtle-readable',
    ]) {
      assert.ok(
        educationLight[name],
        `${name} has no light value -- it would paint its dark value on white`,
      );
    }

    atLeast(
      educationLight['--edu-text-readable'],
      light['--app-bg'],
      4.5,
      'edu-text-readable on app-bg',
    );
    atLeast(
      educationLight['--edu-text-muted-readable'],
      light['--app-bg'],
      4.5,
      'edu-text-muted-readable on app-bg',
    );
    atLeast(
      educationLight['--edu-text-subtle-readable'],
      light['--app-surface'],
      4.5,
      'edu-text-subtle-readable on app-surface',
    );
  });

  it('paints the education header from the readable token, not a literal', () => {
    // Re-hardcoding #f8fafc here is the original defect; keep the token wired.
    assert.match(
      educationCss,
      /\.education-container:not\(\.education-path-page\)\s+header h1[\s\S]{0,200}color:\s*var\(--edu-text-readable\)/,
    );
  });

  it('floors the two mirrored text steps that would otherwise sit below AA', () => {
    // The mirror is right for backgrounds (the toggle off-track wants a light
    // grey) and wrong for the same value used as text.
    assert.ok(contrast(light['--color-slate-600'], light['--app-surface']) < 4.5);
    assert.ok(contrast(light['--color-slate-700'], light['--app-surface']) < 4.5);

    const clamp = /:root\[data-theme='light'\]\s*\.text-slate-600\s*,\s*:root\[data-theme='light'\]\s*\.text-slate-700\s*\{\s*color:\s*(#[0-9a-fA-F]{3,8})/.exec(
      indexCss,
    );
    assert.ok(clamp, 'the light-mode text clamp rule is missing');
    atLeast(clamp[1], light['--app-surface'], 4.5, 'clamped slate text');
  });

  it('keeps the rest of the mirrored neutral scale readable as text', () => {
    for (const step of [100, 300, 400, 500]) {
      atLeast(
        light[`--color-slate-${step}`],
        light['--app-surface'],
        4.5,
        `slate-${step} on app-surface`,
      );
    }
  });

  it('keeps content on a filled accent readable in both themes', () => {
    // Light is the theme this work is about, so hold it to AA.
    atLeast(
      light['--color-on-accent'],
      light['--app-danger'],
      4.5,
      'on-accent on app-danger (light)',
    );
    atLeast(
      light['--color-on-accent'],
      light['--app-accent'],
      4.5,
      'on-accent on app-accent (light)',
    );
    atLeast(
      light['--color-on-light-accent'],
      light['--app-primary'],
      4.5,
      'on-light-accent on app-primary (light)',
    );
    atLeast(
      light['--color-on-light-accent'],
      light['--app-warning'],
      4.5,
      'on-light-accent on app-warning (light)',
    );

    // Dark keeps its pre-existing floors -- this change must not lower them.
    atLeast(
      dark['--color-on-light-accent'],
      dark['--app-primary'],
      4.5,
      'on-light-accent on app-primary (dark)',
    );
    atLeast(
      dark['--color-on-accent'],
      dark['--app-danger'],
      3,
      'on-accent on app-danger (dark)',
    );
    atLeast(
      dark['--color-on-accent'],
      dark['--app-accent'],
      3,
      'on-accent on app-accent (dark)',
    );
  });

  it('keeps the focus ring visible on both themes', () => {
    // WCAG 1.4.11 asks 3:1 for non-text UI. `:focus-visible` paints
    // `var(--neon-cyan)`, which without a light value is #00f5ff -- 1.3:1.
    for (const [theme, t] of [
      ['light', light],
      ['dark', dark],
    ] as const) {
      assert.ok(t['--neon-cyan'], `--neon-cyan has no ${theme} value`);
      atLeast(t['--neon-cyan'], t['--app-bg'], 3, `focus ring (${theme})`);
      atLeast(t['--app-focus'], t['--app-bg'], 3, `app-focus (${theme})`);
    }
  });
});