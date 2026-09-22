import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { cleanup, render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { describe, expect, it, vi, beforeEach, afterEach } from 'vitest';
import LessonView from './LessonView';

vi.mock('@/api/education.api', () => ({
  getLessonById: vi.fn().mockResolvedValue({
    id: 'lesson-1',
    courseId: 'course-1',
    title: 'Greetings',
    description: 'Say hello',
    type: 'vocabulary',
    estimatedMinutes: 10,
    content: '## Hello',
  }),
  getVocabularyByLesson: vi.fn().mockResolvedValue([
    {
      id: 'v1',
      word: 'Hello',
      meaning: 'Xin chào',
      pronunciation: 'heh-loh',
      example: 'Hello there',
    },
  ]),
  getExercisesByLesson: vi.fn().mockResolvedValue([
    {
      id: 'e1',
      type: 'multiple_choice',
      question: 'Pick hello',
      options: ['Hello', 'Bye'],
    },
  ]),
  completeLesson: vi.fn(),
  submitExercises: vi.fn(),
}));

function renderLesson() {
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return render(
    <QueryClientProvider client={client}>
      <MemoryRouter initialEntries={['/education/lessons/lesson-1']}>
        <Routes>
          <Route path="/education/lessons/:id" element={<LessonView />} />
        </Routes>
      </MemoryRouter>
    </QueryClientProvider>,
  );
}

describe('LessonView a11y surfaces', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    cleanup();
  });

  it('renders vocabulary flashcard as a button', async () => {
    renderLesson();
    const vocabTab = await screen.findByRole('button', { name: /từ vựng/i });
    fireEvent.click(vocabTab);
    const card = await screen.findByRole('button', { name: /hello|lật thẻ/i });
    expect(card.tagName).toBe('BUTTON');
  });

  it('renders multiple choice options as buttons', async () => {
    renderLesson();
    const exTab = await screen.findByRole('button', { name: /bài tập/i });
    fireEvent.click(exTab);
    const opt = await screen.findByRole('button', { name: /^Hello$/i });
    expect(opt.tagName).toBe('BUTTON');
    expect(opt).toHaveAttribute('aria-pressed', 'false');
    fireEvent.click(opt);
    expect(opt).toHaveAttribute('aria-pressed', 'true');
  });

  it('does not hardcode body background to #020617', async () => {
    renderLesson();
    await screen.findByText('Greetings');
    expect(document.body.style.background).not.toBe('rgb(2, 6, 23)');
    expect(document.body.style.background).not.toBe('#020617');
  });

  // The tutor only grounds its answers when it receives the lesson id, so the
  // link has to carry it — a plain /ai-tutor link silently loses the context.
  it('links to the tutor with the lesson id so answers are grounded', async () => {
    renderLesson();
    const link = await screen.findByRole('link', { name: /hỏi về bài này/i });
    expect(link).toHaveAttribute('href', '/ai-tutor?lessonId=lesson-1');
  });
});
