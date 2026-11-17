import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { cleanup, fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import { afterEach, expect, it, vi } from 'vitest';
import AssessmentsPage from './AssessmentsPage';
import { AssessmentClassUpload } from './AssessmentClassUpload';
import { canFinalizeReview } from './assessmentReview';
import { assessmentApi } from '@/api/assessment.api';
import type { AssessmentSubmission } from '@/types/assessment.types';
vi.mock('@/api/assessment.api', async importOriginal => ({ ...(await importOriginal<typeof import('@/api/assessment.api')>()), assessmentApi: { context: vi.fn(), list: vi.fn(), detail: vi.fn(), submissions: vi.fn(), progress: vi.fn(), roster: vi.fn(), submission: vi.fn(), approveReview: vi.fn(), review: vi.fn(), approveExam: vi.fn(), examImpact: vi.fn(), finalize: vi.fn(), withdraw: vi.fn(), exportAccess: vi.fn(), requestExport: vi.fn(), createSubmission: vi.fn(), upload: vi.fn(), process: vi.fn() } }));
afterEach(() => { cleanup(); vi.clearAllMocks(); });
it('shows a read-only preview without querying live assessments', async () => {
  vi.mocked(assessmentApi.context).mockResolvedValue({ enabled: false, capabilities: {}, classes: [] });
  render(<QueryClientProvider client={new QueryClient({ defaultOptions: { queries: { retry: false } } })}><AssessmentsPage /></QueryClientProvider>);
  expect(await screen.findByRole('heading', { name: 'Xem trước quy trình chấm bài' })).toBeInTheDocument();
  expect(screen.getByRole('table', { name: 'Kết quả minh họa' })).toBeInTheDocument();
  expect(screen.getByRole('button', { name: 'Tạo đợt chấm' })).toBeDisabled();
  expect(screen.getByRole('button', { name: 'Tải nhóm bài' })).toBeDisabled();
  expect(screen.getByRole('button', { name: 'Chấm bài' })).toBeDisabled();
  expect(screen.getByRole('button', { name: 'Chốt vào sổ điểm' })).toBeDisabled();
  expect(assessmentApi.list).not.toHaveBeenCalled();
  expect(assessmentApi.finalize).not.toHaveBeenCalled();
});
it('blocks missing, partial, unresolved, and unreadable review data even after acknowledgement', () => {
  const submission: AssessmentSubmission = { id: 's', studentId: 1, identityState: 'confirmed', identityRevision: 1, inputRevision: 1, processingState: 'done', currentReview: { id: 'r', contentHash: 'h', earnedUnits: 200, ungradedMaxUnits: 0, effectiveResults: [], flags: [] } };
  expect(canFinalizeReview(submission)).toBe(false);
  submission.reviewApproved = true;
  expect(canFinalizeReview(submission)).toBe(true);
  expect(canFinalizeReview({ ...submission, identityState: 'conflict' })).toBe(false);
  expect(canFinalizeReview({ ...submission, currentReview: { ...submission.currentReview!, ungradedMaxUnits: 100 } })).toBe(false);
  expect(canFinalizeReview({ ...submission, currentReview: { ...submission.currentReview!, flags: [{ code: 'answer_unreadable', severity: 'blocking', message: 'Mờ' }] } })).toBe(false);
});

it('only lets the teacher select a batch after a separate review approval', async () => {
  const a = { id: 'a', title: 'Kiểm tra', classId: 'c', subjectId: 'm', academicYearId: 'y', contextRevision: 1, maxScoreUnits: 1000, capabilities: { canReview: true, canFinalize: true }, examVersions: [] };
  const s: AssessmentSubmission = { id: 's', studentId: 1, displayName: 'Học sinh A', identityState: 'confirmed', identityRevision: 1, inputRevision: 1, processingState: 'complete', currentReview: { id: 'r', contentHash: 'h', earnedUnits: 500, ungradedMaxUnits: 0, flags: [], effectiveResults: [{ questionKey: 'I.1', earnedUnits: 500, maxUnits: 1000 }] }, answers: [], pages: [] };
  vi.mocked(assessmentApi.context).mockResolvedValue({ enabled: true, capabilities: {}, classes: [] });
  vi.mocked(assessmentApi.list).mockResolvedValue({ items: [a], total: 1, page: 1, limit: 100 });
  vi.mocked(assessmentApi.detail).mockResolvedValue(a);
  vi.mocked(assessmentApi.submissions).mockResolvedValue({ items: [s], total: 1, page: 1, limit: 100 });
  vi.mocked(assessmentApi.progress).mockResolvedValue({ counts: { complete: 1 } });
  vi.mocked(assessmentApi.roster).mockResolvedValue([{ id: 1, displayName: 'Học sinh A' }]);
  vi.mocked(assessmentApi.submission).mockResolvedValue(s);
  vi.mocked(assessmentApi.approveReview).mockImplementation(async () => {
    s.reviewApproved = true;
    return { reviewApproved: true, reviewRevisionId: 'r' };
  });
  vi.mocked(assessmentApi.finalize).mockResolvedValue({ items: [{ submissionId: 's', outcome: 'finalized', score: 5 }] });
  render(<QueryClientProvider client={new QueryClient({ defaultOptions: { queries: { retry: false } } })}><AssessmentsPage /></QueryClientProvider>);
  fireEvent.click(await screen.findByRole('button', { name: 'Kiểm tra' }));
  expect(await screen.findByRole('button', { name: 'Chốt 0 bài đã kiểm tra vào sổ điểm' })).toBeDisabled();
  const selection = await screen.findByRole('checkbox', { name: 'Chọn bài của Học sinh A' });
  expect(selection).toBeDisabled();
  fireEvent.click(screen.getByRole('button', { name: 'Chọn các bài đã duyệt trên trang' }));
  expect(screen.getByRole('button', { name: 'Chốt 0 bài đã kiểm tra vào sổ điểm' })).toBeDisabled();
  expect(assessmentApi.finalize).not.toHaveBeenCalled();
  fireEvent.click(screen.getByRole('button', { name: 'Mở bài' }));
  fireEvent.click(await screen.findByRole('button', { name: 'Xác nhận đã kiểm tra và duyệt bài này' }));
  await waitFor(() => expect(selection).toBeEnabled());
  expect(assessmentApi.approveReview).toHaveBeenCalledWith('a', expect.objectContaining({ id: 's' }), 1);
  fireEvent.click(selection);
  fireEvent.click(screen.getByRole('button', { name: 'Chốt 1 bài đã kiểm tra vào sổ điểm' }));
  await screen.findByText(/Học sinh A: Đã ghi sổ điểm/);
  expect(assessmentApi.finalize).toHaveBeenCalledWith('a', [expect.objectContaining({ expectedReviewHash: 'h', expectedReviewRevisionId: 'r', expectedInputRevision: 1, expectedPublicationRevision: null })], expect.any(String));
});


it('prepares two students before uploading and retries only the failed file in its original submission', async () => {
  const assessment = { id: 'a', title: 'Kiểm tra', classId: 'c', subjectId: 'm', academicYearId: 'y', contextRevision: 1, maxScoreUnits: 10000, capabilities: { canProcess: true } };
  const first: AssessmentSubmission = { id: 's1', studentId: 1, identityState: 'confirmed', identityRevision: 1, inputRevision: 1, processingState: 'idle' };
  const second = { ...first, id: 's2', studentId: 2 };
  vi.mocked(assessmentApi.context).mockResolvedValue({ enabled: true, capabilities: {}, classes: [] });
  vi.mocked(assessmentApi.list).mockResolvedValue({ items: [assessment], total: 1, page: 1, limit: 100 });
  vi.mocked(assessmentApi.detail).mockResolvedValue(assessment);
  vi.mocked(assessmentApi.submissions).mockResolvedValue({ items: [], total: 0, page: 1, limit: 100 });
  vi.mocked(assessmentApi.progress).mockResolvedValue({ counts: {} });
  vi.mocked(assessmentApi.roster).mockResolvedValue([{ id: 1, displayName: 'Học sinh A' }, { id: 2, displayName: 'Học sinh B' }]);
  vi.mocked(assessmentApi.createSubmission).mockImplementation(async (_id, studentId) => studentId === 1 ? first : second);
  const photoA = new File(['a'], 'a.jpg', { type: 'image/jpeg' });
  const photoB = new File(['b'], 'b.jpg', { type: 'image/jpeg' });
  vi.mocked(assessmentApi.upload).mockImplementationOnce(async () => { throw new Error('Mất mạng'); });
  render(<QueryClientProvider client={new QueryClient({ defaultOptions: { queries: { retry: false } } })}><AssessmentsPage /></QueryClientProvider>);
  fireEvent.click(await screen.findByRole('button', { name: 'Kiểm tra' }));
  const panel = within(await screen.findByRole('region', { name: 'Tải bài cả lớp' }));
  await panel.findByRole('option', { name: 'Học sinh A' });
  fireEvent.change(panel.getByLabelText('Học sinh'), { target: { value: '1' } });
  fireEvent.change(panel.getByLabelText('Ảnh hoặc PDF của học sinh đang chọn'), { target: { files: [photoA] } });
  fireEvent.click(panel.getByRole('button', { name: 'Học sinh tiếp theo' }));
  expect(panel.getByLabelText('Học sinh')).toHaveValue('2');
  fireEvent.change(panel.getByLabelText('Ảnh hoặc PDF của học sinh đang chọn'), { target: { files: [photoB] } });
  expect(assessmentApi.createSubmission).not.toHaveBeenCalled();
  fireEvent.click(panel.getByRole('button', { name: 'Tải bài cả lớp' }));
  const retry = await panel.findByRole('button', { name: 'Thử lại file lỗi' });
  await waitFor(() => expect(retry).toBeEnabled());
  expect(assessmentApi.createSubmission).toHaveBeenCalledTimes(2);
  expect(assessmentApi.createSubmission).toHaveBeenCalledWith('a', 1, expect.objectContaining({
    files: [expect.objectContaining({ name: 'a.jpg', mime: 'image/jpeg', byteSize: 1 })],
  }));
  expect(assessmentApi.upload).toHaveBeenCalledWith('a', 's2', photoB, expect.any(String));
  const failedCall = vi.mocked(assessmentApi.upload).mock.calls.find(call => call[2] === photoA);
  fireEvent.click(retry);
  await waitFor(() => expect(assessmentApi.upload).toHaveBeenCalledTimes(3));
  expect(vi.mocked(assessmentApi.upload).mock.calls[2]).toEqual(failedCall);
  expect(assessmentApi.createSubmission).toHaveBeenCalledTimes(2);

  vi.mocked(assessmentApi.submissions).mockResolvedValue({
    items: [{ ...first, uploadReady: false }, { ...second, uploadReady: true }],
    total: 2,
    page: 1,
    limit: 100,
  });
  // Fetch the latest verification state, independently of the browser upload queue.
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  cleanup();
  render(<QueryClientProvider client={queryClient}><AssessmentsPage /></QueryClientProvider>);
  fireEvent.click(await screen.findByRole('button', { name: 'Kiểm tra' }));
  await screen.findByText('1 bài sẵn sàng xử lý trên trang này. Các bài còn thiếu file hoặc đang xác thực sẽ chờ.');
  fireEvent.click(screen.getByRole('button', { name: 'Bắt đầu xử lý' }));
  expect(assessmentApi.process).toHaveBeenCalledWith('a', [{ ...second, uploadReady: true }]);
});

it('keeps 120 files under 40 student IDs and bounds uploads to three at a time', async () => {
  const roster = Array.from({ length: 40 }, (_, index) => ({
    id: index + 1,
    displayName: `Học sinh ${index + 1}`,
  }));
  vi.mocked(assessmentApi.createSubmission).mockImplementation(async (_id, studentId) => ({
    id: `s${studentId}`,
    studentId: studentId!,
    identityState: 'confirmed',
    identityRevision: 1,
    inputRevision: 1,
    processingState: 'idle',
  }));
  let active = 0;
  let peak = 0;
  vi.mocked(assessmentApi.upload).mockImplementation(async () => {
    active++;
    peak = Math.max(peak, active);
    await Promise.resolve();
    active--;
  });
  render(<AssessmentClassUpload assessmentId="a" roster={roster} existingStudentIds={new Set()} busy={false} run={action => action()} />);
  const studentSelect = screen.getByLabelText('Học sinh');
  const attachment = screen.getByLabelText('Ảnh hoặc PDF của học sinh đang chọn');
  const nextStudent = screen.getByRole('button', { name: 'Học sinh tiếp theo' });
  fireEvent.change(studentSelect, { target: { value: '1' } });
  for (const student of roster) {
    const files = Array.from({ length: 3 }, (_, page) =>
      new File(['page'], `${student.id}-${page}.jpg`, { type: 'image/jpeg' }),
    );
    fireEvent.change(attachment, { target: { files } });
    if (student.id < roster.length) fireEvent.click(nextStudent);
  }
  expect(assessmentApi.createSubmission).not.toHaveBeenCalled();
  expect(screen.getByRole('status')).toHaveTextContent('40 học sinh · 0/120 file');
  fireEvent.click(screen.getByRole('button', { name: 'Tải bài cả lớp' }));
  await waitFor(() => expect(screen.getByRole('status')).toHaveTextContent('120/120 file'), { timeout: 5000 });
  expect(assessmentApi.createSubmission).toHaveBeenCalledTimes(40);
  expect(assessmentApi.upload).toHaveBeenCalledTimes(120);
  expect(peak).toBe(3);
  for (const [, sid, file] of vi.mocked(assessmentApi.upload).mock.calls) {
    expect(file.name.split('-')[0]).toBe(sid.slice(1));
  }
}, 15000);

it('lets the teacher accept the AI score for a flagged question and filter to submissions that need a look', async () => {
  const a = { id: 'a', title: 'Kiểm tra', classId: 'c', subjectId: 'm', academicYearId: 'y', contextRevision: 1, maxScoreUnits: 1000, capabilities: { canReview: true, canFinalize: true }, examVersions: [] };
  const flagged: AssessmentSubmission = { id: 's1', studentId: 1, displayName: 'Học sinh A', identityState: 'confirmed', identityRevision: 1, inputRevision: 1, processingState: 'idle', currentReview: { id: 'r', contentHash: 'h', earnedUnits: 500, ungradedMaxUnits: 0, flags: [{ code: 'low_confidence', severity: 'blocking', questionKey: 'II.1.a', message: 'AI chưa chắc chắn', resolutionState: 'open' }], effectiveResults: [{ questionKey: 'II.1.a', earnedUnits: 500, maxUnits: 1000 }] }, answers: [], pages: [] };
  const done: AssessmentSubmission = { ...flagged, id: 's2', displayName: 'Học sinh B', reviewApproved: true, currentReview: { ...flagged.currentReview!, flags: [] } };
  vi.mocked(assessmentApi.context).mockResolvedValue({ enabled: true, capabilities: {}, classes: [] });
  vi.mocked(assessmentApi.list).mockResolvedValue({ items: [a], total: 1, page: 1, limit: 100 });
  vi.mocked(assessmentApi.detail).mockResolvedValue(a);
  vi.mocked(assessmentApi.submissions).mockResolvedValue({ items: [flagged, done], total: 2, page: 1, limit: 100 });
  vi.mocked(assessmentApi.progress).mockResolvedValue({ counts: {} });
  vi.mocked(assessmentApi.roster).mockResolvedValue([{ id: 1, displayName: 'Học sinh A' }]);
  vi.mocked(assessmentApi.submission).mockResolvedValue(flagged);
  vi.mocked(assessmentApi.review).mockResolvedValue({} as never);
  render(<QueryClientProvider client={new QueryClient({ defaultOptions: { queries: { retry: false } } })}><AssessmentsPage /></QueryClientProvider>);
  fireEvent.click(await screen.findByRole('button', { name: 'Kiểm tra' }));
  expect(await screen.findByText('2 bài · 1 cần xem · 1 đã duyệt · 0 đang xử lý')).toBeTruthy();
  fireEvent.click(screen.getByRole('checkbox', { name: 'Chỉ hiện bài cần xem' }));
  expect(screen.queryByRole('checkbox', { name: 'Chọn bài của Học sinh B' })).toBeNull();
  expect(screen.getByRole('list', { name: 'Các bước của đợt chấm' }).querySelector('[aria-current="step"]')?.textContent).toContain('Chưa có đáp án');
  fireEvent.keyDown(window, { key: 'n' });
  fireEvent.click(await screen.findByRole('button', { name: /Đồng ý điểm AI đề xuất \(0.5 điểm\)/ }));
  await waitFor(() => expect(assessmentApi.review).toHaveBeenCalledWith('a', expect.objectContaining({ id: 's1' }), [expect.objectContaining({ questionKey: 'II.1.a', earnedUnits: 500 })], [expect.objectContaining({ code: 'low_confidence', action: 'confirm_score' })]));
});

it('warns how many submissions an answer-key approval will regrade and reports the requeued count', async () => {
  const version = { id: 'v2', examCode: '101', versionNumber: 2, state: 'draft' as const, gradingSpecHash: 'g2', document: { questions: [] } };
  const a = { id: 'a', title: 'Kiểm tra', classId: 'c', subjectId: 'm', academicYearId: 'y', contextRevision: 1, maxScoreUnits: 1000, capabilities: { canReview: true }, examVersions: [version] };
  vi.mocked(assessmentApi.context).mockResolvedValue({ enabled: true, capabilities: {}, classes: [] });
  vi.mocked(assessmentApi.list).mockResolvedValue({ items: [a], total: 1, page: 1, limit: 100 });
  vi.mocked(assessmentApi.detail).mockResolvedValue(a);
  vi.mocked(assessmentApi.submissions).mockResolvedValue({ items: [], total: 0, page: 1, limit: 100 });
  vi.mocked(assessmentApi.progress).mockResolvedValue({ counts: {} });
  vi.mocked(assessmentApi.roster).mockResolvedValue([]);
  vi.mocked(assessmentApi.examImpact).mockResolvedValue({ submissionCount: 12, questionCount: 20 });
  vi.mocked(assessmentApi.approveExam).mockResolvedValue({ jobIds: ['j1', 'j2', 'j3'] });
  render(<QueryClientProvider client={new QueryClient({ defaultOptions: { queries: { retry: false } } })}><AssessmentsPage /></QueryClientProvider>);
  fireEvent.click(await screen.findByRole('button', { name: 'Kiểm tra' }));
  fireEvent.click(await screen.findByRole('checkbox', { name: /Tôi đã kiểm tra nội dung, đáp án và thang điểm/ }));
  expect(await screen.findByText(/đang gắn với 12 bài/)).toBeTruthy();
  fireEvent.click(screen.getByRole('button', { name: 'Duyệt đáp án mã 101' }));
  expect(await screen.findByText('Đã duyệt. 3 bài được đưa vào chấm lại theo đáp án mới.')).toBeTruthy();
});

it('approves a clean Word key in one click from the quick review', async () => {
  const document = { questions: [{ questionKey: 'I.1', kind: 'single_choice', text: 'Câu 1', maxUnits: 1000, options: [{ id: 'A', text: 'x' }, { id: 'B', text: 'y' }], answerKey: 'B' }] };
  const version = { id: 'v1', examCode: '101', versionNumber: 1, state: 'draft' as const, gradingSpecHash: 'g1', sourceImportJobId: 'j1', document };
  const a = { id: 'a', title: 'Kiểm tra', classId: 'c', subjectId: 'm', academicYearId: 'y', contextRevision: 1, maxScoreUnits: 1000, capabilities: { canReview: true }, examVersions: [version], examImports: [{ jobId: 'j1', assetId: 'w', examCode: '101', state: 'succeeded', warnings: [] }] };
  vi.mocked(assessmentApi.context).mockResolvedValue({ enabled: true, capabilities: {}, classes: [] });
  vi.mocked(assessmentApi.list).mockResolvedValue({ items: [a], total: 1, page: 1, limit: 100 });
  vi.mocked(assessmentApi.detail).mockResolvedValue(a);
  vi.mocked(assessmentApi.submissions).mockResolvedValue({ items: [], total: 0, page: 1, limit: 100 });
  vi.mocked(assessmentApi.progress).mockResolvedValue({ counts: {} });
  vi.mocked(assessmentApi.roster).mockResolvedValue([]);
  vi.mocked(assessmentApi.examImpact).mockResolvedValue({ submissionCount: 0, questionCount: 1 });
  vi.mocked(assessmentApi.approveExam).mockResolvedValue({ jobIds: [] });
  render(<QueryClientProvider client={new QueryClient({ defaultOptions: { queries: { retry: false } } })}><AssessmentsPage /></QueryClientProvider>);
  fireEvent.click(await screen.findByRole('button', { name: 'Kiểm tra' }));
  const quick = await screen.findByRole('region', { name: 'Duyệt nhanh mã đề 101' });
  expect(quick.textContent).toContain('Đáp án trắc nghiệm: I.1 B');
  fireEvent.click(within(quick).getByRole('button', { name: 'Đúng với file, duyệt mã 101' }));
  await waitFor(() => expect(assessmentApi.approveExam).toHaveBeenCalledWith('a', expect.objectContaining({ id: 'v1' })));
  expect(await screen.findByText('Đã duyệt. Không có bài nào cần chấm lại.')).toBeTruthy();
});

it('keeps grade withdrawal and existing exports open while paused, and hides processing actions', async () => {
  const version = { id: 'v1', examCode: '101', versionNumber: 1, state: 'draft' as const, gradingSpecHash: 'g1', document: { questions: [] } };
  const pausedAssessment = {
    id: 'a',
    title: 'Kiểm tra HK1',
    classId: 'c',
    subjectId: 'm',
    academicYearId: 'y',
    contextRevision: 1,
    maxScoreUnits: 1000,
    pilotState: 'paused' as const,
    capabilities: { canCreate: false, canProcess: false, canReview: true, canFinalize: false },
    examVersions: [version],
    exports: [{ id: 'exp1', format: 'xlsx', createdAt: '2026-11-15T01:00:00Z', expiresAt: '2099-01-01T00:00:00Z' }],
  };
  const publishedSub: AssessmentSubmission = {
    id: 's1',
    studentId: 1,
    displayName: 'Học sinh A',
    identityState: 'confirmed',
    identityRevision: 1,
    inputRevision: 1,
    processingState: 'complete',
    reviewApproved: true,
    publication: { id: 'pub1', revision: 2, state: 'active' },
    currentReview: { id: 'r', contentHash: 'h', earnedUnits: 800, ungradedMaxUnits: 0, flags: [], effectiveResults: [] },
    pages: [{ id: 'p1', assetId: 'as1', sourcePageNumber: 1, pageRole: 'student_work' }],
    answers: [{ id: 'ans1', questionKey: 'I.1', observationState: 'read', content: { selectedOptionId: 'A' } }],
  };
  vi.mocked(assessmentApi.context).mockResolvedValue({ enabled: true, capabilities: {}, classes: [] });
  vi.mocked(assessmentApi.list).mockResolvedValue({ items: [pausedAssessment], total: 1, page: 1, limit: 100 });
  vi.mocked(assessmentApi.detail).mockResolvedValue(pausedAssessment);
  vi.mocked(assessmentApi.submissions).mockResolvedValue({ items: [publishedSub], total: 1, page: 1, limit: 100 });
  vi.mocked(assessmentApi.progress).mockResolvedValue({ counts: {}, jobs: [{ id: 'j1', state: 'paused', stage: 'grade', lastErrorCode: 'pilot_paused' }] });
  vi.mocked(assessmentApi.roster).mockResolvedValue([{ id: 1, displayName: 'Học sinh A' }]);
  vi.mocked(assessmentApi.submission).mockResolvedValue(publishedSub);
  vi.mocked(assessmentApi.withdraw).mockResolvedValue({} as never);
  vi.mocked(assessmentApi.exportAccess).mockResolvedValue({ url: 'blob:existing-xlsx' });

  render(<QueryClientProvider client={new QueryClient({ defaultOptions: { queries: { retry: false } } })}><AssessmentsPage /></QueryClientProvider>);
  fireEvent.click(await screen.findByRole('button', { name: 'Kiểm tra HK1' }));
  expect(await screen.findByText(/Chấm bài tự động của lớp × môn này đang tạm dừng/)).toBeTruthy();
  expect(screen.queryByText(/Xử lý thất bại:/)).toBeNull();
  expect(screen.queryByRole('button', { name: 'Xuất Excel điểm đã công bố' })).toBeNull();
  expect(screen.queryByRole('button', { name: 'Duyệt đáp án mã 101' })).toBeNull();

  fireEvent.click(screen.getByRole('button', { name: 'Lấy liên kết tải Excel đã xuất' }));
  await waitFor(() => expect(assessmentApi.exportAccess).toHaveBeenCalledWith('a', 'exp1'));

  fireEvent.click(screen.getByRole('button', { name: 'Mở bài' }));
  expect(await screen.findByText(/Liên kết ảnh bằng chứng tạm khóa/)).toBeTruthy();
  expect(screen.queryByRole('button', { name: 'Sửa lựa chọn và chấm lại' })).toBeNull();

  fireEvent.change(screen.getByLabelText('Lý do rút điểm'), { target: { value: 'Nhập nhầm mã đề' } });
  fireEvent.click(screen.getByRole('button', { name: 'Rút điểm khỏi sổ' }));
  await waitFor(() => expect(assessmentApi.withdraw).toHaveBeenCalledWith('a', 'pub1', 2, 'Nhập nhầm mã đề'));
});
