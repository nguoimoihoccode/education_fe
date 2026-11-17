import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, expect, it, vi } from 'vitest';
import { assessmentApi } from '@/api/assessment.api';
import { AssessmentExamImport } from './AssessmentExamImport';

vi.mock('@/api/assessment.api', async importOriginal => {
  const original = await importOriginal<typeof import('@/api/assessment.api')>();
  return { ...original, assessmentApi: { uploadExamSource: vi.fn(), assetStatus: vi.fn(), requestExamImport: vi.fn(), examImportStatus: vi.fn() } };
});
afterEach(() => { cleanup(); vi.resetAllMocks(); });

function renderImport() {
  render(<QueryClientProvider client={new QueryClient({ defaultOptions: { queries: { retry: false } } })}>
    <AssessmentExamImport assessmentId="a" imports={[]} editable />
  </QueryClientProvider>);
}

it('waits for the sealed source, then shows a link to the draft and its warnings', async () => {
  vi.mocked(assessmentApi.uploadExamSource).mockResolvedValue('source');
  let seal!: (value: { state: string }) => void;
  vi.mocked(assessmentApi.assetStatus).mockImplementation(() => new Promise(resolve => { seal = resolve; }));
  vi.mocked(assessmentApi.requestExamImport).mockResolvedValue({ jobId: 'job' });
  vi.mocked(assessmentApi.examImportStatus).mockResolvedValue({
    jobId: 'job', assetId: 'source', examCode: '001', state: 'succeeded', versionId: 'draft', warnings: ['Kiểm tra điểm từng ý.'],
  });
  renderImport();
  const file = new File(['word'], 'Đề và đáp án.docx');
  fireEvent.change(screen.getByLabelText('Mã đề chính thức'), { target: { value: '001' } });
  await userEvent.upload(screen.getByLabelText('File Word đề và đáp án'), file);
  fireEvent.submit(screen.getByRole('button', { name: 'Tải và đọc file Word' }).closest('form')!);
  await waitFor(() => expect(assessmentApi.assetStatus).toHaveBeenCalledWith('a', 'source'));
  expect(assessmentApi.requestExamImport).not.toHaveBeenCalled();
  seal({ state: 'sealed' });
  expect(await screen.findByRole('link', { name: 'Mở bản nháp mã 001' })).toHaveAttribute('href', '#exam-version-draft');
  expect(screen.getByText('Kiểm tra điểm từng ý.')).toBeInTheDocument();
  expect(assessmentApi.requestExamImport).toHaveBeenCalledWith('a', 'source', '001', expect.any(String));
});

it('reuses the uploaded source and the request key after import fails to start', async () => {
  vi.mocked(assessmentApi.uploadExamSource).mockResolvedValue('source');
  vi.mocked(assessmentApi.assetStatus).mockResolvedValue({ state: 'sealed' });
  vi.mocked(assessmentApi.requestExamImport).mockRejectedValueOnce(new Error('Mất kết nối')).mockResolvedValueOnce({ jobId: 'job' });
  vi.mocked(assessmentApi.examImportStatus).mockResolvedValue({ jobId: 'job', assetId: 'source', examCode: '102', state: 'running' });
  renderImport();
  fireEvent.change(screen.getByLabelText('Mã đề chính thức'), { target: { value: '102' } });
  await userEvent.upload(screen.getByLabelText('File Word đề và đáp án'), new File(['word'], 'guide.docx'));
  fireEvent.submit(screen.getByRole('button', { name: 'Tải và đọc file Word' }).closest('form')!);
  expect(await screen.findByRole('alert')).toHaveTextContent('Mất kết nối');
  fireEvent.click(screen.getByRole('button', { name: 'Tiếp tục đọc file đã tải' }));
  await waitFor(() => expect(assessmentApi.requestExamImport).toHaveBeenCalledTimes(2));
  expect(assessmentApi.requestExamImport).toHaveBeenNthCalledWith(2, ...vi.mocked(assessmentApi.requestExamImport).mock.calls[0]);
  expect(assessmentApi.uploadExamSource).toHaveBeenCalledTimes(1);
});
