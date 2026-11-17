import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, expect, it, vi } from 'vitest';
import { assessmentApi } from '@/api/assessment.api';
import type { AssessmentSubmission } from '@/types/assessment.types';
import { ExternalTextReview } from './ExternalTextReview';

vi.mock('@/api/assessment.api', async importOriginal => ({
  ...await importOriginal<typeof import('@/api/assessment.api')>(),
  assessmentApi: {
    externalTextPreview: vi.fn(),
    releaseExternalText: vi.fn(),
    revokeExternalText: vi.fn(),
  },
}));

afterEach(() => {
  cleanup();
  vi.resetAllMocks();
});

const submission: AssessmentSubmission = {
  id: 'submission',
  studentId: 7,
  identityState: 'confirmed',
  identityRevision: 1,
  inputRevision: 3,
  processingState: 'ready',
};

const preview = {
  inputRevision: 3,
  policy: 'school-policy-v1',
  items: [
    {
      questionKey: 'II.1.a',
      hash: 'first-hash',
      payload: {
        answer: 'Vật liệu dẫn điện tốt.',
        criteria: [{ id: 'c1', description: 'Nêu đúng tính chất vật liệu.', allowedUnits: [0, 500] }],
      },
    },
    {
      questionKey: 'II.2.b',
      hash: 'second-hash',
      payload: {
        answer: 'Mặt bằng biểu diễn vị trí các phòng.',
        criteria: [{ id: 'c1', description: 'Trình bày đúng vai trò mặt bằng.', allowedUnits: [0, 500] }],
      },
    },
  ],
};

function renderReview(current = submission, busy = false) {
  const run = vi.fn(async (action: () => Promise<unknown>) => {
    await action();
  });
  render(
    <QueryClientProvider client={new QueryClient({ defaultOptions: { queries: { retry: false } } })}>
      <ExternalTextReview assessmentId="assessment" submission={current} busy={busy} run={run} />
    </QueryClientProvider>,
  );
  return run;
}

async function openReview() {
  await userEvent.click(screen.getByText('Kiểm tra nội dung trước khi gửi chấm tự luận'));
}

it('loads the exact outbound preview only after opening and waits for a per-question check', async () => {
  vi.mocked(assessmentApi.externalTextPreview).mockResolvedValue(preview);
  renderReview();
  expect(assessmentApi.externalTextPreview).not.toHaveBeenCalled();
  await openReview();
  const send = await screen.findByRole('button', { name: 'Cho phép gửi 0 câu' });
  expect(send).toBeDisabled();
  expect(screen.getByText(preview.items[0].payload.answer)).toBeInTheDocument();
  expect(screen.getByText(preview.items[0].payload.criteria[0].description)).toBeInTheDocument();
  fireEvent.click(send);
  expect(assessmentApi.releaseExternalText).not.toHaveBeenCalled();
});

it('releases only checked question hashes and clears the checks after success', async () => {
  vi.mocked(assessmentApi.externalTextPreview).mockResolvedValue(preview);
  vi.mocked(assessmentApi.releaseExternalText).mockResolvedValue({ jobId: 'job' });
  renderReview();
  await openReview();
  const first = await screen.findByRole('checkbox', { name: 'Tôi đã kiểm tra nội dung gửi của câu II.1.a' });
  const second = screen.getByRole('checkbox', { name: 'Tôi đã kiểm tra nội dung gửi của câu II.2.b' });
  await userEvent.click(first);
  await userEvent.click(second);
  await userEvent.click(second);
  await userEvent.click(screen.getByRole('button', { name: 'Cho phép gửi 1 câu' }));
  await waitFor(() => expect(assessmentApi.releaseExternalText).toHaveBeenCalledWith(
    'assessment', 'submission', 3, { 'II.1.a': 'first-hash' },
  ));
  expect(assessmentApi.releaseExternalText).toHaveBeenCalledTimes(1);
  await waitFor(() => expect(first).not.toBeChecked());
  expect(screen.getByRole('button', { name: 'Cho phép gửi 0 câu' })).toBeDisabled();
});

it('does not release a preview for a different input revision even after a check', async () => {
  vi.mocked(assessmentApi.externalTextPreview).mockResolvedValue({ ...preview, inputRevision: 2 });
  renderReview();
  await openReview();
  await userEvent.click(await screen.findByRole('checkbox', { name: 'Tôi đã kiểm tra nội dung gửi của câu II.1.a' }));
  const send = screen.getByRole('button', { name: 'Cho phép gửi 1 câu' });
  fireEvent.submit(send.closest('form')!);
  expect(assessmentApi.releaseExternalText).not.toHaveBeenCalled();
});

it.each(['queued', 'running'])('offers revocation while %s without loading a new preview', async processingState => {
  const current = { ...submission, processingState };
  vi.mocked(assessmentApi.revokeExternalText).mockResolvedValue({ revoked: true });
  const run = renderReview(current);
  await openReview();
  expect(screen.getByRole('status')).toHaveTextContent('Bài đang chờ xử lý');
  await userEvent.click(screen.getByRole('button', { name: 'Chặn các lượt gửi chưa bắt đầu' }));
  expect(run).toHaveBeenCalledTimes(1);
  await waitFor(() => expect(assessmentApi.revokeExternalText).toHaveBeenCalledWith('assessment', current));
  expect(assessmentApi.externalTextPreview).not.toHaveBeenCalled();
  expect(assessmentApi.releaseExternalText).not.toHaveBeenCalled();
});
