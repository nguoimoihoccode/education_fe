import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, expect, it, vi } from 'vitest';
import { ExamKeyEditor } from './ExamKeyEditor';
afterEach(cleanup);
it('creates a replacement draft preserving canonical source references instead of approving an edited key', () => {
  const save = vi.fn();
  const document = { schemaVersion: 1, examCode: '101', maxScoreUnits: 1000, questions: [{ questionKey: 'I.1', kind: 'single_choice', text: 'Câu hỏi', maxUnits: 1000, sourceRegionIds: ['region'], options: [{ id: 'a', text: 'A' }, { id: 'b', text: 'B' }], answerKey: 'a' }] };
  render(<ExamKeyEditor document={document} busy={false} save={save} />);
  fireEvent.change(screen.getByLabelText('Đáp án câu I.1'), { target: { value: 'b' } });
  fireEvent.click(screen.getByRole('button', { name: 'Lưu bản đáp án mới để duyệt' }));
  expect(save).toHaveBeenCalledWith(expect.objectContaining({ examCode: '101', questions: [expect.objectContaining({ answerKey: 'b', sourceRegionIds: ['region'] })] }));
});
