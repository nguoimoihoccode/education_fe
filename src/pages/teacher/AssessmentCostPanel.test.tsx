import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, expect, it, vi } from 'vitest';
import { assessmentApi } from '@/api/assessment.api';
import type { AssessmentCostReport, GradingCostTally } from '@/types/assessment.types';
import { AssessmentCostPanel } from './AssessmentCostPanel';
vi.mock('@/api/assessment.api', () => ({ assessmentApi: { costs: vi.fn() } }));
afterEach(() => { cleanup(); vi.clearAllMocks(); });
const tally = (over: Partial<GradingCostTally> = {}): GradingCostTally => ({ calls: 0, inputTokens: 0, outputTokens: 0, knownCostMicros: 0, unknownCostCalls: 0, unknownReservedMicros: 0, ...over });
const open = (container: HTMLElement) => {
  const details = container.querySelector('details')!;
  details.open = true;
  fireEvent(details, new Event('toggle'));
};
const ui = () => render(<QueryClientProvider client={new QueryClient()}><AssessmentCostPanel assessmentId="a" /></QueryClientProvider>);

it('loads only when opened and keeps unknown calls apart from the known cost', async () => {
  const report: AssessmentCostReport = {
    assessmentId: 'a', currency: 'USD', ...tally({ calls: 5, inputTokens: 1200, outputTokens: 300, knownCostMicros: 40000, unknownCostCalls: 1, unknownReservedMicros: 10000 }),
    knownCostUsd: 0.04, upperBoundCostMicros: 50000, upperBoundCostUsd: 0.05,
    finalizedSubmissions: 2, knownCostPerFinalizedMicros: 20000, upperBoundCostPerFinalizedMicros: 25000,
    retries: tally({ calls: 1, knownCostMicros: 5000 }), byState: { succeeded: 4, unknown: 1 },
    byPurpose: [{ purpose: 'external_text_grading', ...tally({ calls: 3, knownCostMicros: 30000 }) }, { purpose: 'reader', ...tally({ calls: 2, knownCostMicros: 10000, unknownCostCalls: 1 }) }],
    byModel: [{ model: 'gpt-x', provider: 'openai', ...tally({ calls: 5, knownCostMicros: 40000 }) }],
    byStage: [{ stage: 'grade', calls: 5, inputTokens: 1200, outputTokens: 300, knownCostMicros: 40000, unknownCostCalls: 1 }],
  };
  vi.mocked(assessmentApi.costs).mockResolvedValue(report);
  const { container } = ui();
  expect(assessmentApi.costs).not.toHaveBeenCalled();
  open(container);
  expect(await screen.findByText(/Đã biết \$0\.0400 qua 5 lượt.*Còn 1 lượt chưa rõ chi phí, tối đa \$0\.0500/)).toBeTruthy();
  expect(screen.getByText(/Trung bình \$0\.0200 mỗi bài đã ghi sổ \(2 bài\), tối đa \$0\.0250/)).toBeTruthy();
  expect(screen.getByRole('table', { name: 'Chi phí theo vai trò model' }).textContent).toContain('Chấm tự luận (LLM ngoài)');
  expect(screen.getByRole('table', { name: 'Chi phí theo bước xử lý' }).textContent).toContain('Chấm điểm');
});

it('says so when nothing has been spent yet', async () => {
  vi.mocked(assessmentApi.costs).mockResolvedValue({ assessmentId: 'a', currency: 'USD', ...tally(), knownCostUsd: 0, upperBoundCostMicros: 0, upperBoundCostUsd: 0, finalizedSubmissions: 0, knownCostPerFinalizedMicros: null, upperBoundCostPerFinalizedMicros: null, retries: tally(), byState: {}, byPurpose: [], byModel: [], byStage: [] });
  const { container } = ui();
  open(container);
  expect(await screen.findByText(/chưa gọi model nào/)).toBeTruthy();
});
