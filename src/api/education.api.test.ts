import { describe, expect, it, vi } from 'vitest';
import { getLearningPlan } from './education.api';
import { apiClient } from './client';

vi.mock('./client', () => ({
  CACHE_PROFILES: {
    USER: { cache: { ttl: 300000 } },
  },
  apiClient: {
    get: vi.fn(),
  },
}));

describe('education api', () => {
  it('fetches the personal learning plan', async () => {
    const plan = {
      dailyGoal: { targetMinutes: 20, completedMinutes: 0, targetReviews: 20, completedReviews: 0 },
      nextLesson: null,
      dueReviews: { count: 0, recommendedLimit: 20 },
      weakQuizzes: [],
      streak: { current: 0, longest: 0, xp: 0, level: 1 },
      recommendedActions: [],
    };

    vi.mocked(apiClient.get).mockResolvedValueOnce({ data: plan });

    await expect(getLearningPlan()).resolves.toBe(plan);
    expect(apiClient.get).toHaveBeenCalledWith('/education/learning-plan', expect.any(Object));
  });
});
