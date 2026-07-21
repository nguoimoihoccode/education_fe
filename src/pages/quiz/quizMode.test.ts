import { describe, expect, it } from 'vitest';
import { buildQuizSessionSearch, parseQuizPlayMode } from './quizMode';

describe('quiz mode helpers', () => {
  it('defaults unknown mode to practice', () => {
    expect(parseQuizPlayMode(null)).toBe('practice');
    expect(parseQuizPlayMode('exam')).toBe('exam');
    expect(parseQuizPlayMode('nope')).toBe('practice');
  });

  it('builds session query with mode and optional hsk config', () => {
    expect(buildQuizSessionSearch({ mode: 'practice' })).toBe('?mode=practice');
    expect(
      buildQuizSessionSearch({
        mode: 'exam',
        difficulty: 'HARD',
        count: 10,
      }),
    ).toBe('?mode=exam&difficulty=HARD&count=10');
  });
});
