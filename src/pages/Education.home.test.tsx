import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it, vi, beforeEach } from 'vitest';
import Education from './Education';

vi.mock('@/api/education.api', () => ({
  getLanguages: vi.fn().mockResolvedValue([]),
  getCourses: vi.fn().mockResolvedValue({ items: [], total: 0, totalPages: 1 }),
  getTodayPlan: vi.fn(),
}));

vi.mock('@/hooks/useAuth', () => ({
  useAuth: () => ({ isAuthenticated: false }),
}));

describe('Education home', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('shows a single primary login CTA for guests', async () => {
    const client = new QueryClient({
      defaultOptions: { queries: { retry: false } },
    });

    render(
      <QueryClientProvider client={client}>
        <MemoryRouter>
          <Education />
        </MemoryRouter>
      </QueryClientProvider>,
    );

    const login = await screen.findByRole('link', { name: /đăng nhập/i });
    expect(login).toHaveAttribute('href', '/login');
    expect(login.className).toContain('edu-primary-action');
  });
});
