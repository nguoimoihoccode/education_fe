import assert from 'node:assert/strict';
import test from 'node:test';

import {
  getGlobalSearchDestination,
  normalizeGlobalSearchQuery,
} from '../src/components/layout/globalSearch.ts';

test('normalizes Vietnamese search input for matching', () => {
  assert.equal(normalizeGlobalSearchQuery('  Khóa học  '), 'khoa hoc');
});

test('routes global search terms to the right learning areas', () => {
  assert.equal(getGlobalSearchDestination('flashcard')?.path, '/flashcards');
  assert.equal(getGlobalSearchDestination('bài tập')?.path, '/quiz');
  assert.equal(getGlobalSearchDestination('tài liệu')?.path, '/flashcards/document-import');
  assert.equal(getGlobalSearchDestination('cộng đồng')?.path, '/community');
});

test('falls back to education hub for unknown non-empty searches', () => {
  assert.equal(getGlobalSearchDestination('mandarin beginner')?.path, '/education');
});

test('ignores empty global search submissions', () => {
  assert.equal(getGlobalSearchDestination('   '), null);
});
