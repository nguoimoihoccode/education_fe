import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it, vi } from 'vitest';
import Today from './Today';
import { getTodayLearningHub } from '@/api/education.api';

vi.mock('@/api/education.api', () => ({
  getTodayLearningHub: vi.fn(),
}));

describe('Today page', () => {
  it('renders the learner plan actions', async () => {
    vi.mocked(getTodayLearningHub).mockResolvedValueOnce({
      date: '2026-05-13',
      dailyGoalMinutes: 10,
      minutesLearnedToday: 6,
      xpToday: 180,
      completedTasks: 1,
      totalTasks: 3,
      streak: { current: 4, longest: 7, isAtRisk: false },
      primaryTask: {
        id: 'task-lesson-2',
        type: 'continue_lesson',
        title: 'Tiếp tục: Daily conversations',
        description: 'Bài tiếp theo trong English Starter',
        ctaLabel: 'Học tiếp',
        targetUrl: '/education/lessons/lesson-2',
        estimatedMinutes: 10,
        completed: false,
        priority: 1,
      },
      tasks: [
        {
          id: 'task-lesson-2',
          type: 'continue_lesson',
          title: 'Tiếp tục: Daily conversations',
          description: 'Bài tiếp theo trong English Starter',
          ctaLabel: 'Bắt đầu ngay',
          targetUrl: '/education/lessons/lesson-2',
          estimatedMinutes: 10,
          completed: false,
          priority: 1,
        },
        {
          id: 'task-review-vocab',
          type: 'review_vocabulary',
          title: 'Ôn 12 từ vựng đến hạn',
          description: 'Ôn đúng hạn giúp bạn nhớ lâu hơn',
          ctaLabel: 'Ôn tập',
          targetUrl: '/flashcards/review',
          estimatedMinutes: 5,
          completed: true,
          priority: 2,
        },
        {
          id: 'task-fix-mistakes',
          type: 'fix_mistakes',
          title: 'Sửa lỗi: Grammar Basics',
          description: 'Làm lại quiz này để củng cố Grammar',
          ctaLabel: 'Luyện lại',
          targetUrl: '/quiz/quiz-1',
          estimatedMinutes: 10,
          completed: false,
          priority: 3,
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
    expect(screen.getByText('6/10 phút')).toBeInTheDocument();
    expect(screen.getByText('1/3 task')).toBeInTheDocument();
    expect(screen.getByText('Ôn 12 từ vựng đến hạn')).toBeInTheDocument();
    expect(screen.getByText('Đã xong')).toBeInTheDocument();
    expect(screen.getByText('180 XP')).toBeInTheDocument();
    expect(screen.getAllByText('Bài tiếp theo trong English Starter')).toHaveLength(2);
    expect(screen.getByRole('link', { name: /Học tiếp/i })).toHaveAttribute('href', '/education/lessons/lesson-2');
    expect(screen.getByRole('link', { name: /Tiếp tục: Daily conversations/i })).toHaveClass('active');
    expect(screen.getByRole('link', { name: /Ôn 12 từ vựng đến hạn/i })).not.toHaveClass('active');
    expect(screen.getByText('Ưu tiên 3 • 10 phút')).toBeInTheDocument();
    expect(screen.getByText('Làm lại quiz này để củng cố Grammar')).toBeInTheDocument();
  });

  it('renders at-risk streak text without NaN progress', async () => {
    vi.mocked(getTodayLearningHub).mockResolvedValueOnce({
      date: '2026-05-13',
      dailyGoalMinutes: 10,
      minutesLearnedToday: 0,
      xpToday: 0,
      completedTasks: 0,
      totalTasks: 0,
      streak: { current: 2, longest: 2, isAtRisk: true },
      tasks: [],
    });

    const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter>
          <Today />
        </MemoryRouter>
      </QueryClientProvider>,
    );

    expect(await screen.findByText('Hoàn thành một task để giữ streak hôm nay.')).toBeInTheDocument();
    expect(screen.queryByText(/NaN/)).not.toBeInTheDocument();
  });

  it('renders an error state with retry action', async () => {
    vi.mocked(getTodayLearningHub).mockRejectedValueOnce(new Error('Network error'));

    const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter>
          <Today />
        </MemoryRouter>
      </QueryClientProvider>,
    );

    expect(await screen.findByText('Không tải được kế hoạch hôm nay.')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Thử lại' })).toBeInTheDocument();
  });
});
