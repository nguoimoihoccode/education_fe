import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { cleanup, render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { afterEach, describe, expect, it, vi } from 'vitest';
import TeacherClassesPage from './TeacherClassesPage';
import { listMyHomeroomClasses } from '@/api/school.api';

vi.mock('@/api/school.api', () => ({
  listMyHomeroomClasses: vi.fn(),
}));

// Testing Library only auto-registers cleanup when vitest runs with `globals: true`
// (vite.config.ts sets it false), so without this the previous test's tree stays in
// the document and a "not.toBeInTheDocument" assertion matches its stale nodes.
afterEach(cleanup);

function renderPage() {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter>
        <TeacherClassesPage />
      </MemoryRouter>
    </QueryClientProvider>,
  );
}

describe('TeacherClassesPage', () => {
  it('shows an error notice, not the empty state, when the read fails', async () => {
    // `classes` defaults to [] and retry is off, so before this branch existed a
    // network error or a 403 rendered "Bạn chưa được phân công chủ nhiệm lớp nào."
    // -- a confident false claim about the user's own classes. The two states
    // must stay distinguishable: only the empty state may reach the user when the
    // server actually answered with nothing.
    vi.mocked(listMyHomeroomClasses).mockRejectedValueOnce(new Error('Network error'));

    renderPage();

    expect(await screen.findByText('Không tải được danh sách lớp chủ nhiệm')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Thử lại' })).toBeInTheDocument();
    expect(
      screen.queryByText(/Bạn chưa được phân công chủ nhiệm lớp nào/),
    ).not.toBeInTheDocument();
  });

  it('still shows the empty state when the read succeeds with no classes', async () => {
    vi.mocked(listMyHomeroomClasses).mockResolvedValueOnce([]);

    renderPage();

    expect(
      await screen.findByText('Bạn chưa được phân công chủ nhiệm lớp nào.'),
    ).toBeInTheDocument();
    expect(screen.queryByText('Không tải được danh sách lớp chủ nhiệm')).not.toBeInTheDocument();
  });
});