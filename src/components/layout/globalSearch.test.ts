import { describe, expect, it } from 'vitest';
import {
  getGlobalSearchDestination,
  normalizeGlobalSearchQuery,
} from './globalSearch';

describe('globalSearch', () => {
  it('normalizes Vietnamese search input for matching', () => {
    expect(normalizeGlobalSearchQuery('  Khóa học  ')).toBe('khoa hoc');
  });

  it('routes learning terms to the right areas', () => {
    expect(getGlobalSearchDestination('flashcard')?.path).toBe('/flashcards');
    expect(getGlobalSearchDestination('bài tập')?.path).toBe('/quiz');
    expect(getGlobalSearchDestination('tài liệu')?.path).toBe('/flashcards/document-import');
    expect(getGlobalSearchDestination('cộng đồng')?.path).toBe('/community');
    expect(getGlobalSearchDestination('coach học tập')?.path).toBe('/learning-coach');
  });

  it('falls back to education hub for unknown non-empty searches', () => {
    expect(getGlobalSearchDestination('mandarin beginner')?.path).toBe('/education');
  });

  it('ignores empty global search submissions', () => {
    expect(getGlobalSearchDestination('   ')).toBeNull();
  });
});
