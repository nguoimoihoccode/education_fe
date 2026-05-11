import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it, vi } from 'vitest';
import Today from './Today';
import { getLearningPlan } from '@/api/education.api';

vi.mock('@/api/education.api', () => ({
  getLearningPlan: vi.fn(),
}));

describe('Today page', () => {
  it('renders the learner plan actions', async () => {
    vi.mocked(getLearningPlan).mockResolvedValueOnce({
      dailyGoal: { targetMinutes: 20, completedMinutes: 10, targetReviews: 20, completedReviews: 0 },
      nextLesson: {
        id: 'lesson-2',
        title: 'Daily conversations',
        courseTitle: 'English Starter',
        estimatedMinutes: 20,
        route: '/education/lessons/lesson-2',
      },
      dueReviews: { count: 12, recommendedLimit: 20 },
      weakQuizzes: [
        {
          quizId: 'quiz-1',
          title: 'Grammar Basics',
          topic: 'Grammar',
          score: 55,
          recommendation: 'Làm lại quiz này để củng cố Grammar',
          route: '/quiz/quiz-1',
        },
      ],
      streak: { current: 4, longest: 7, xp: 180, level: 2 },
      recommendedActions: [
        {
          type: 'lesson',
          title: 'Tiếp tục: Daily conversations',
          reason: 'Bài tiếp theo trong English Starter',
          priority: 1,
          route: '/education/lessons/lesson-2',
        },
        {
          type: 'flashcard_review',
          title: 'Ôn 12 flashcards đến hạn',
          reason: 'Ôn đúng hạn giúp bạn nhớ lâu hơn',
          priority: 2,
          route: '/flashcards/review',
        },
      ],
    });

    const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter>
          <Today />
        </MemoryRouter>
      </QueryClientProvider>,
    );

    expect(await screen.findAllByText('Tiếp tục: Daily conversations')).toHaveLength(2);
    expect(screen.getByText('Kế hoạch học hôm nay')).toBeInTheDocument();
    expect(screen.getByText('Ôn 12 flashcards đến hạn')).toBeInTheDocument();
    expect(screen.getByText('Grammar Basics')).toBeInTheDocument();
    expect(screen.getByText('55%')).toBeInTheDocument();
    expect(screen.getByText('4 ngày')).toBeInTheDocument();
  });
});
