export type QuizPlayMode = 'practice' | 'exam';

export function parseQuizPlayMode(value: string | null | undefined): QuizPlayMode {
  return value === 'exam' ? 'exam' : 'practice';
}

export function buildQuizSessionSearch(params: {
  mode?: QuizPlayMode;
  difficulty?: string | null;
  count?: string | number | null;
}): string {
  const search = new URLSearchParams();
  const mode = params.mode ?? 'practice';
  search.set('mode', mode);

  if (params.difficulty === 'EASY' || params.difficulty === 'MEDIUM' || params.difficulty === 'HARD') {
    search.set('difficulty', params.difficulty);
  }

  const count = params.count == null ? null : String(params.count);
  if (count === '10' || count === '20' || count === '30') {
    search.set('count', count);
  }

  const query = search.toString();
  return query ? `?${query}` : '';
}
