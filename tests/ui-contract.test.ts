import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import test from 'node:test';
import { fileURLToPath } from 'node:url';

const root = dirname(fileURLToPath(import.meta.url));
const readSource = (relativePath: string) =>
  readFileSync(join(root, '..', relativePath), 'utf8');

test('declares routes for visible flashcard stats and forgot-password links', () => {
  const app = readSource('src/App.tsx');

  assert.match(app, /path="\/flashcards\/stats"/);
  assert.match(app, /path="\/forgot-password"/);
  assert.match(app, /FlashcardStatsPage/);
});

test('header global search is wired as a real form on desktop and mobile', () => {
  const header = readSource('src/components/layout/Header.tsx');

  assert.match(header, /onSubmit=\{handleSearchSubmit\}/);
  assert.match(header, /value=\{searchQuery\}/);
  assert.match(header, /onChange=\{\(event\) => setSearchQuery\(event\.target\.value\)\}/);
  assert.match(header, /setMobileSearchOpen/);
});

test('login branding is education-specific', () => {
  const login = readSource('src/pages/Login.tsx');

  assert.doesNotMatch(login, /danh mục đầu tư/i);
  assert.doesNotMatch(login, /TrendingUp/);
  assert.match(login, /GraduationCap/);
  assert.match(login, /hành trình học tập/i);
});

test('shared design text no longer advertises stock or cyberpunk UI', () => {
  const indexCss = readSource('src/index.css');
  const button = readSource('src/components/ui/Button.tsx');
  const card = readSource('src/components/ui/Card.tsx');

  assert.doesNotMatch(indexCss, /Fintech Stock App/i);
  assert.doesNotMatch(button, /Cyberpunk|Trade Now|neon-pink|neon-cyan|neon-purple/);
  assert.doesNotMatch(card, /Cyberpunk|neon-border|neonColor/);
});
