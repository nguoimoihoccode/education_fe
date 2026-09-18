import assert from 'node:assert/strict';
import { readdirSync, readFileSync, statSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { describe, it } from 'node:test';
import { fileURLToPath } from 'node:url';

/* Tier 3 of the light theme: the neutral scale inverts (Tier 1), so a bare
   `text-white` on a *filled* accent turns near-black in light mode -- readable,
   but not the design, and on a dark accent (`accent-600` violet, 5.6:1 with
   white) it is actually worse than the white it replaced. Content that sits on
   a filled accent therefore uses `text-on-accent`, which is white in every
   scope, so dark mode is unchanged pixel for pixel.

   Two invariants are pinned here, in both directions:

   1. No class string may put a bare `text-white` on a filled accent.
   2. Every bare `text-on-accent` must sit on a filled accent -- the opposite
      mistake paints white on a near-white light panel, i.e. invisible text.

   "Filled" is the load-bearing word. A tint (`bg-accent-600/20`,
   `bg-rose-500/10`) is not a fill: white on a 20% tint over the page reads as
   white on the page, and in light the mirrored scale correctly turns that
   `text-white` dark. Tints are excluded, and the last test pins that.

   Dark equivalence is not argued from the source: it is read from the CSS.
   `--color-on-accent` is 255 255 255 at `:root`, in the light block, and is not
   restored by `[data-theme-fixed='light']` (that block only touches the neutral
   scale and `white`), so it is white in all three scopes. */

const root = join(dirname(fileURLToPath(import.meta.url)), '..');

const ACCENT_HUES =
  'emerald|amber|rose|red|violet|fuchsia|pink|indigo|sky|cyan|teal|lime|' +
  'orange|accent|primary|secondary|danger|success|warning';

/** A filled accent background: no alpha, or one high enough to still read as
    the accent (>= 90). `bg-gradient*` counts -- its stops are the fill. */
const FILLED_ACCENT = new RegExp(
  String.raw`(?<![\w:/-])(` +
    String.raw`bg-gradient[-\w]*` +
    String.raw`|(?:from|via|to)-(?:${ACCENT_HUES})(?:-\d{2,3})?(?:/(?:9\d|100))?` +
    String.raw`|bg-(?:${ACCENT_HUES})(?:-\d{2,3})?(?:/(?:9\d|100))?` +
    String.raw`|bg-\[var\(--app-(?:primary|accent|danger|warning|focus)\)\]` +
    String.raw`)(?![/\w-])`,
);

const BARE_TEXT_WHITE = /(?<![\w-])text-white(?![/\w-])/;
const BARE_ON_ACCENT = /(?<![\w-])text-on-accent(?![/\w-])/;
/** `bg-emerald-600/20` -- an accent, but a tint of it. */
const ACCENT_TINT = new RegExp(
  String.raw`(?<![\w:/-])(?:bg|from|via|to)-(?:${ACCENT_HUES})-\d{2,3}/(?:[1-8]\d|[1-9]|100)?`,
);

/* One unit per *branch*, not per template literal: in
   `${on ? 'bg-accent-600' : 'bg-white'} ${dim ? 'text-white' : 'text-slate-400'}`
   the fill and the white are on different branches, and reading the template as
   one string would flag a white that never sits on the accent. A backtick with
   no `${` is a plain class literal, so it is one unit. */
function units(source: string): string[] {
  const found: Array<[number, number, string]> = [];
  for (const m of source.matchAll(/`[^`]*`/g)) {
    if (!m[0].includes('${')) found.push([m.index!, m.index! + m[0].length, m[0]]);
  }
  for (const m of source.matchAll(/'[^'\n]*'|"[^"\n]*"/g)) {
    const at = m.index!;
    if (found.some(([start, end]) => start < at && at < end)) continue;
    found.push([at, at + m[0].length, m[0]]);
  }
  return found.map(([, , text]) => text);
}

/** Drop `/* ... *\/` so a comment quoting a class string is not read as code. */
const withoutComments = (source: string) =>
  source.replace(/\/\*[\s\S]*?\*\//g, '');

function sourceFiles(dir: string): string[] {
  return readdirSync(dir).flatMap((entry) => {
    const full = join(dir, entry);
    if (statSync(full).isDirectory()) return sourceFiles(full);
    return /\.(ts|tsx)$/.test(entry) && !/\.test\.tsx?$/.test(entry) ? [full] : [];
  });
}

const files = sourceFiles(join(root, 'src')).map((path) => [
  path.slice(root.length + 1),
  withoutComments(readFileSync(path, 'utf8')),
]) as Array<[string, string]>;

const indexCss = withoutComments(readFileSync(join(root, 'src/index.css'), 'utf8'));

describe('content on a filled accent', () => {
  it('never uses a bare text-white', () => {
    const offenders = files.flatMap(([path, source]) =>
      units(source)
        .filter((u) => BARE_TEXT_WHITE.test(u) && FILLED_ACCENT.test(u))
        .map((u) => `${path}: ${u.trim()}`),
    );

    assert.deepEqual(
      offenders,
      [],
      `use text-on-accent (fixed white) instead:\n${offenders.join('\n')}`,
    );
  });

  it('only uses text-on-accent where the accent is filled', () => {
    const offenders = files.flatMap(([path, source]) =>
      units(source)
        .filter((u) => BARE_ON_ACCENT.test(u) && !FILLED_ACCENT.test(u))
        .map((u) => `${path}: ${u.trim()}`),
    );

    assert.deepEqual(
      offenders,
      [],
      // White on a near-white light panel: this is the failure mode the rule
      // exists to prevent, so it is a hard error, not a warning.
      `text-on-accent needs a filled accent background:\n${offenders.join('\n')}`,
    );
  });

  it('leaves a bare text-white alone on an accent tint', () => {
    // The distinction the rule rests on: a tint is not a fill. If the
    // classifier ever stops telling them apart, the test above would start
    // demanding white on near-white.
    const tinted = files.flatMap(([, source]) =>
      units(source).filter(
        (u) =>
          BARE_TEXT_WHITE.test(u) &&
          !FILLED_ACCENT.test(u) &&
          ACCENT_TINT.test(u),
      ),
    );

    assert.ok(
      tinted.length > 0,
      'no tinted accent plus text-white left in the tree -- the tint branch of ' +
        'the classifier is no longer exercised, so the check is vacuous',
    );
  });

  it('resolves text-on-accent to white in every theme scope', () => {
    // This is the whole dark-equivalence argument, read off the CSS rather
    // than asserted from memory.
    const scopes: Array<[string, string | undefined]> = [
      [':root', /:root\s*\{[^}]*--color-on-accent:\s*([^;]+);/.exec(indexCss)?.[1]],
      [
        "light",
        /:root\[data-theme='light'\][^{]*\{[^}]*--color-on-accent:\s*([^;]+);/.exec(
          indexCss,
        )?.[1],
      ],
    ];

    for (const [scope, value] of scopes) {
      assert.equal(
        value?.trim(),
        '255 255 255',
        `--color-on-accent is not white in ${scope}`,
      );
    }

    // The pinned routes restore base values for the neutral scale; if that
    // block ever grew `--color-on-accent`, the marketing/auth pages would get a
    // different foreground from the shell.
    const at = indexCss.indexOf("[data-theme-fixed='light']");
    assert.notEqual(at, -1, 'the [data-theme-fixed] rule is missing');
    const body = indexCss.slice(at, indexCss.indexOf('}', at));
    assert.doesNotMatch(body, /--color-on-accent/);
  });
});