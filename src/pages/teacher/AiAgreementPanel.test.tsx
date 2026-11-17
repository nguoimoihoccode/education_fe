import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, expect, it, vi } from 'vitest';
import { assessmentApi } from '@/api/assessment.api';
import { AiAgreementPanel } from './AiAgreementPanel';
vi.mock('@/api/assessment.api', () => ({ assessmentApi: { aiAgreement: vi.fn() } }));
afterEach(() => { cleanup(); vi.clearAllMocks(); });
const tally = (compared: number, agreed: number) => ({ compared, agreed, absDiffUnits: 0 });

it('loads only when opened and shows agreement overall, by confidence and by question', async () => {
  vi.mocked(assessmentApi.aiAgreement).mockResolvedValue({ decidedSubmissions: 4, compared: 8, agreed: 6, meanAbsDiffUnits: 125, byConfidence: { high: tally(5, 5), medium: tally(2, 1), low: tally(1, 0), unknown: tally(0, 0) }, byQuestion: [{ questionKey: 'II.1.a', ...tally(4, 4) }, { questionKey: 'II.2.b', ...tally(4, 2) }] });
  const { container } = render(<QueryClientProvider client={new QueryClient()}><AiAgreementPanel assessmentId="a" /></QueryClientProvider>);
  expect(assessmentApi.aiAgreement).not.toHaveBeenCalled();
  const details = container.querySelector('details')!;
  details.open = true;
  fireEvent(details, new Event('toggle'));
  expect(await screen.findByText(/Đã so 8 câu trên 4 bài.*6 câu \(75%\).*0.125 điểm/)).toBeTruthy();
  const byConfidence = screen.getByRole('table', { name: 'Theo mức tin cậy của AI' });
  expect(byConfidence.textContent).toContain('Cao55100%');
  expect(screen.getByRole('table', { name: 'Theo câu hỏi' }).textContent).toContain('II.2.b4250%');
});
