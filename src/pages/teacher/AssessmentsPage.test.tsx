import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, expect, it, vi } from 'vitest';
import AssessmentsPage from './AssessmentsPage';
import { canFinalizeReview } from './assessmentReview';
import { assessmentApi } from '@/api/assessment.api';
import type { AssessmentSubmission } from '@/types/assessment.types';
vi.mock('@/api/assessment.api', () => ({ assessmentApi: { context: vi.fn(), list: vi.fn(), detail: vi.fn(), submissions: vi.fn(), progress: vi.fn(), roster: vi.fn(), submission: vi.fn(), finalize: vi.fn() } }));
afterEach(() => { cleanup(); vi.clearAllMocks(); });
it('shows a feature unavailable state without inventing processed results', async () => {
  vi.mocked(assessmentApi.context).mockResolvedValue({ enabled: false, capabilities: {}, classes: [] });
  render(<QueryClientProvider client={new QueryClient({ defaultOptions: { queries: { retry: false } } })}><AssessmentsPage /></QueryClientProvider>);
  expect(await screen.findByText('Chấm bài AI chưa được bật tại trường.')).toBeInTheDocument();
  expect(screen.queryByRole('button', { name: 'Tạo đợt chấm' })).not.toBeInTheDocument();
});
it('blocks missing, partial, unresolved, and unreadable review data even after acknowledgement', () => {
  const submission: AssessmentSubmission = { id: 's', studentId: 1, identityState: 'confirmed', identityRevision: 1, inputRevision: 1, processingState: 'done', currentReview: { id: 'r', contentHash: 'h', earnedUnits: 200, ungradedMaxUnits: 0, effectiveResults: [], flags: [] } };
  expect(canFinalizeReview(submission, undefined)).toBe(false);
  expect(canFinalizeReview(submission, 'h')).toBe(true);
  expect(canFinalizeReview({ ...submission, identityState: 'conflict' }, 'h')).toBe(false);
  expect(canFinalizeReview({ ...submission, currentReview: { ...submission.currentReview!, ungradedMaxUnits: 100 } }, 'h')).toBe(false);
  expect(canFinalizeReview({ ...submission, currentReview: { ...submission.currentReview!, flags: [{ code: 'answer_unreadable', severity: 'blocking', message: 'Mờ' }] } }, 'h')).toBe(false);
  expect(canFinalizeReview(submission, 'old-hash')).toBe(false);
});

it('allows explicit table selection and batch finalization without opening each paper', async () => {
  const a = { id: 'a', title: 'Kiểm tra', classId: 'c', subjectId: 'm', academicYearId: 'y', contextRevision: 1, maxScoreUnits: 1000, capabilities: { canReview: true, canFinalize: true }, examVersions: [] };
  const s: AssessmentSubmission = { id: 's', studentId: 1, displayName: 'Học sinh A', identityState: 'confirmed', identityRevision: 1, inputRevision: 1, processingState: 'complete', currentReview: { id: 'r', contentHash: 'h', earnedUnits: 500, ungradedMaxUnits: 0, flags: [], effectiveResults: [{ questionKey: 'I.1', earnedUnits: 500, maxUnits: 1000 }] }, answers: [], pages: [] };
  vi.mocked(assessmentApi.context).mockResolvedValue({ enabled: true, capabilities: {}, classes: [] });
  vi.mocked(assessmentApi.list).mockResolvedValue({ items: [a], total: 1, page: 1, limit: 100 });
  vi.mocked(assessmentApi.detail).mockResolvedValue(a);
  vi.mocked(assessmentApi.submissions).mockResolvedValue({ items: [s], total: 1, page: 1, limit: 100 });
  vi.mocked(assessmentApi.progress).mockResolvedValue({ counts: { complete: 1 } });
  vi.mocked(assessmentApi.roster).mockResolvedValue([{ id: 1, displayName: 'Học sinh A' }]);
  vi.mocked(assessmentApi.submission).mockResolvedValue(s);
  vi.mocked(assessmentApi.finalize).mockResolvedValue({ items: [{ submissionId: 's', outcome: 'finalized', score: 5 }] });
  render(<QueryClientProvider client={new QueryClient({ defaultOptions: { queries: { retry: false } } })}><AssessmentsPage /></QueryClientProvider>);
  fireEvent.click(await screen.findByRole('button', { name: 'Kiểm tra' }));
  expect(await screen.findByRole('button', { name: 'Chốt 0 bài đã kiểm tra vào sổ điểm' })).toBeDisabled();
  const ack = await screen.findByRole('checkbox', { name: 'Chọn bài của Học sinh A' });
  expect(assessmentApi.finalize).not.toHaveBeenCalled();
  fireEvent.click(ack);
  fireEvent.click(screen.getByRole('button', { name: 'Chốt 1 bài đã kiểm tra vào sổ điểm' }));
  await screen.findByText(/Học sinh A: Đã ghi sổ điểm/);
  expect(assessmentApi.finalize).toHaveBeenCalledWith('a', [expect.objectContaining({ expectedReviewHash: 'h', expectedReviewRevisionId: 'r', expectedInputRevision: 1, expectedPublicationRevision: null })], expect.any(String));
});
