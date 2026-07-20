import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import test from 'node:test';
import { fileURLToPath } from 'node:url';

const root = dirname(fileURLToPath(import.meta.url));
const readSource = (relativePath: string) =>
  readFileSync(join(root, '..', relativePath), 'utf8');

test('root route uses the education-only landing page', () => {
  const app = readSource('src/App.tsx');
  const legacyLanding = readSource('src/pages/LandingPage.tsx');
  const layout = readSource('src/components/layout/Layout.tsx');

  assert.match(app, /path="\/"\s+element=\{<LandingPageNew \/>\}/);
  assert.doesNotMatch(app, /path="\/"\s+element=\{<LandingPage \/>\}/);
  assert.doesNotMatch(legacyLanding, /StockPro|Nexus|Markets|portfolio|VN30|backtesting/i);
  assert.match(layout, /noLayoutPaths = \['\/', '\/dashboard-landing'\]/);
});

test('landing mobile navigation exposes a working menu', () => {
  const navbar = readSource('src/pages/landing/components/Navbar.tsx');

  assert.match(navbar, /useState/);
  assert.match(navbar, /mobileMenuOpen/);
  assert.match(navbar, /aria-label=\{mobileMenuOpen \? 'Đóng menu' : 'Mở menu'\}/);
  assert.match(navbar, /md:hidden[\s\S]+navLinks\.map/);
});

test('landing feature calls to action navigate to product routes', () => {
  const features = readSource('src/pages/landing/components/FeaturesChess.tsx');

  assert.doesNotMatch(features, /<button/);
  assert.match(features, /to: '\/ai-tutor'/);
  assert.match(features, /to: '\/flashcards'/);
  assert.match(features, /<Link/);
});

test('landing hero has an internal visual fallback for the video', () => {
  const hero = readSource('src/pages/landing/components/Hero.tsx');

  assert.doesNotMatch(hero, /\/images\/hero_bg\.jpeg/);
  assert.match(hero, /heroFallbackImage/);
  assert.match(hero, /poster=\{heroFallbackImage\}/);
  assert.match(hero, /<img[\s\S]+heroFallbackImage/);
});

test('landing root uses app background token in CSS', () => {
  const css = readSource('src/pages/landing/Landing.css');
  assert.match(css, /\.landing-page-root\s*\{[^}]*background(?:-color)?:\s*var\(--app-bg\)/s);
});

test('landing liquid-glass uses app surface or border tokens', () => {
  const css = readSource('src/pages/landing/Landing.css');
  assert.match(css, /\.liquid-glass\s*\{[\s\S]*?var\(--app-(?:surface|border|glass)/);
});

test('landing hero ambient uses app primary/accent tokens', () => {
  const hero = readSource('src/pages/landing/components/Hero.tsx');
  const css = readSource('src/pages/landing/Landing.css');
  const combined = hero + '\n' + css;
  assert.match(combined, /landing-hero-bg|--app-primary/);
  assert.doesNotMatch(hero, /#020617/);
});

test('learning preview is not a light mint strip', () => {
  const preview = readSource('src/pages/landing/components/LearningPreview.tsx');
  assert.doesNotMatch(preview, /from-slate-50 via-emerald-50 to-amber-50/);
  assert.doesNotMatch(preview, /text-slate-950/);
  assert.match(preview, /--app-|landing-preview/);
});
