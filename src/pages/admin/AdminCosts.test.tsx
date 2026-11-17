import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { fireEvent, render, screen, within } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { costApi, type CostOverview, type CostTotals } from '@/api/cost.api';
import AdminCosts from './AdminCosts';
import { formatUsd, vnDay } from './costFormat';

vi.mock('@/api/cost.api', async () => {
  const actual = await vi.importActual<typeof import('@/api/cost.api')>('@/api/cost.api');
  return { ...actual, costApi: { getOverview: vi.fn(), listSchools: vi.fn().mockResolvedValue([]) } };
});

const t = (over: Partial<CostTotals> = {}): CostTotals => ({
  calls: 0,
  errorCalls: 0,
  inputTokens: 0,
  outputTokens: 0,
  knownCostMicros: 0,
  knownCostUsd: 0,
  unknownCostCalls: 0,
  unknownReservedMicros: 0,
  upperBoundCostMicros: 0,
  upperBoundCostUsd: 0,
  ...over,
});

const overview: CostOverview = {
  from: '2026-03-01',
  to: '2026-03-30',
  timeZone: 'Asia/Ho_Chi_Minh',
  schoolId: null,
  currency: 'USD',
  total: t({ calls: 5, knownCostMicros: 5_000_000 }),
  byDay: [],
  sources: [
    {
      key: 'assessment_grading',
      label: 'Chấm bài thi',
      group: 'grading',
      ...t({ calls: 3, knownCostMicros: 4_000_000, unknownCostCalls: 1 }),
      shareOfKnownCost: 80,
      byDay: [],
      parts: [{ part: 'external_text_grading', ...t({ calls: 3, knownCostMicros: 4_000_000 }) }],
    },
    {
      key: 'tutor_chat',
      label: 'Gia sư AI',
      group: 'ai',
      ...t({ calls: 2, knownCostMicros: 1_000_000 }),
      shareOfKnownCost: 20,
      byDay: [],
      parts: [{ part: 'llama-3.3-70b-versatile', ...t({ calls: 2, knownCostMicros: 1_000_000 }) }],
    },
  ],
};

function renderPage() {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return render(
    <QueryClientProvider client={queryClient}>
      <AdminCosts />
    </QueryClientProvider>,
  );
}

describe('AdminCosts', () => {
  it('shows one summary tab and a separate tab per source', async () => {
    vi.mocked(costApi.getOverview).mockResolvedValue(overview);
    renderPage();
    await screen.findByRole('tab', { name: /Gia sư AI/ });
    const tabs = screen.getAllByRole('tab');
    expect(tabs.map((tab) => tab.textContent)).toEqual([
      'Tổng hợp$5.00',
      'Chấm bài thi$4.00',
      'Gia sư AI$1.00',
    ]);
    expect(screen.getByRole('cell', { name: '80%' })).toBeInTheDocument();

    fireEvent.click(tabs[1]);
    const panel = screen.getByRole('tabpanel');
    expect(within(panel).getByText('Chấm tự luận (LLM ngoài)')).toBeInTheDocument();
    expect(within(panel).queryByText('llama-3.3-70b-versatile')).not.toBeInTheDocument();
  });

  it('filters overview by schoolId when a school is chosen', async () => {
    vi.mocked(costApi.listSchools!).mockResolvedValueOnce([{ id: 'school-1', name: 'THCS Nguyễn Du' }]);
    vi.mocked(costApi.getOverview).mockResolvedValue(overview);
    renderPage();
    const select = await screen.findByLabelText('Lọc theo trường');
    fireEvent.change(select, { target: { value: 'school-1' } });
    await screen.findByText(/Lọc theo trường chỉ tính nguồn chấm bài thi/);
    expect(costApi.getOverview).toHaveBeenCalledWith(expect.any(String), expect.any(String), 'school-1');
  });

  it('formats micro-USD and Vietnam days', () => {
    expect(formatUsd(1234)).toBe('$0.0012');
    expect(formatUsd(12_500_000)).toBe('$12.50');
    expect(vnDay(0, new Date('2026-03-01T18:00:00Z'))).toBe('2026-03-02');
    expect(vnDay(1, new Date('2026-03-01T18:00:00Z'))).toBe('2026-03-01');
  });
});
