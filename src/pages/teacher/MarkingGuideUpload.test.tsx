import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, expect, it, vi } from 'vitest';
import { assessmentApi } from '@/api/assessment.api';
import { MarkingGuideUpload } from './MarkingGuideUpload';
vi.mock('@/api/assessment.api', () => ({ assessmentApi: { uploadMarkingGuide: vi.fn(), assetStatus: vi.fn() } }));
afterEach(() => { cleanup(); vi.clearAllMocks(); });

const pick = (files: File[]) => {
  fireEvent.change(screen.getByLabelText('Hướng dẫn chấm (PDF, JPEG hoặc PNG)'), { target: { files } });
  fireEvent.click(screen.getByRole('button', { name: 'Tải hướng dẫn chấm' }));
};

it('uploads PDF and photo guides one by one and waits until each is sealed', async () => {
  vi.mocked(assessmentApi.uploadMarkingGuide).mockResolvedValueOnce('g1').mockResolvedValueOnce('g2');
  vi.mocked(assessmentApi.assetStatus).mockResolvedValueOnce({ state: 'verifying' }).mockResolvedValue({ state: 'sealed' });
  render(<MarkingGuideUpload assessmentId="a" wait={0} />);
  pick([new File(['%PDF'], 'huong-dan.pdf', { type: 'application/pdf' }), new File(['x'], 'trang2.jpg', { type: 'image/jpeg' })]);
  expect(await screen.findByText('Đã nhận 2 file hướng dẫn chấm.')).toBeTruthy();
  expect(assessmentApi.uploadMarkingGuide).toHaveBeenCalledTimes(2);
  expect(assessmentApi.assetStatus).toHaveBeenCalledWith('a', 'g1');
});

it('rejects other file types before uploading and reports a failed verification', async () => {
  render(<MarkingGuideUpload assessmentId="a" wait={0} />);
  pick([new File(['x'], 'de.docx', { type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' })]);
  expect(await screen.findByRole('alert')).toHaveProperty('textContent', expect.stringContaining('chỉ nhận PDF'));
  expect(assessmentApi.uploadMarkingGuide).not.toHaveBeenCalled();
  vi.mocked(assessmentApi.uploadMarkingGuide).mockResolvedValue('g3');
  vi.mocked(assessmentApi.assetStatus).mockResolvedValue({ state: 'verifying', sealState: 'failed' });
  pick([new File(['x'], 'anh.png', { type: 'image/png' })]);
  expect(await screen.findByText('Xác thực anh.png thất bại. Hãy chọn lại file.')).toBeTruthy();
});
