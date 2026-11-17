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
it('turns a text question into an auto-matched number answer and drops blank answer lines', () => {
  const save = vi.fn();
  const document = { schemaVersion: 1, examCode: '101', maxScoreUnits: 1000, questions: [{ questionKey: 'II.1', kind: 'rubric_text', text: 'Tính tỉ số truyền', maxUnits: 1000, sourceRegionIds: ['r'], criteria: [{ id: 'c1', description: 'Đúng kết quả', maxUnits: 1000, levels: [{ pointsUnits: 0, description: 'Sai' }, { pointsUnits: 1000, description: 'Đúng' }] }], acceptedAnswerForms: ['text'] }] };
  render(<ExamKeyEditor document={document} busy={false} save={save} />);
  fireEvent.change(screen.getByLabelText('Cách chấm câu II.1'), { target: { value: 'short_answer' } });
  fireEvent.change(screen.getByLabelText('Đáp án chấp nhận, mỗi dòng một đáp án'), { target: { value: '2,5\n\n' } });
  fireEvent.change(screen.getByLabelText('Kiểu so khớp'), { target: { value: 'number' } });
  fireEvent.change(screen.getByLabelText('Sai số cho phép'), { target: { value: '0.05' } });
  fireEvent.click(screen.getByRole('button', { name: 'Lưu bản đáp án mới để duyệt' }));
  const saved = save.mock.calls[0][0].questions[0];
  expect(saved).toMatchObject({ kind: 'short_answer', acceptedAnswers: ['2,5'], matching: { mode: 'number', tolerance: 0.05 } });
  expect(JSON.parse(JSON.stringify(saved))).not.toHaveProperty('criteria');
});
it('adds an intermediate score level to a criterion', () => {
  const save = vi.fn();
  const document = { schemaVersion: 1, examCode: '101', maxScoreUnits: 1000, questions: [{ questionKey: 'II.1', kind: 'rubric_text', text: 'Nêu công dụng', maxUnits: 1000, sourceRegionIds: ['r'], criteria: [{ id: 'c1', description: 'Hai ý', maxUnits: 1000, levels: [{ pointsUnits: 0, description: 'Không ý nào' }, { pointsUnits: 1000, description: 'Đủ hai ý' }] }], acceptedAnswerForms: ['text'] }] };
  render(<ExamKeyEditor document={document} busy={false} save={save} />);
  fireEvent.click(screen.getByRole('button', { name: 'Thêm mức điểm cho tiêu chí c1' }));
  const points = screen.getAllByLabelText('Điểm mức đạt');
  fireEvent.change(points[2], { target: { value: '0.5' } });
  fireEvent.change(screen.getAllByLabelText('Mô tả mức đạt')[2], { target: { value: 'Một ý' } });
  fireEvent.click(screen.getByRole('button', { name: 'Lưu bản đáp án mới để duyệt' }));
  expect(save.mock.calls[0][0].questions[0].criteria[0].levels).toEqual([{ pointsUnits: 0, description: 'Không ý nào' }, { pointsUnits: 1000, description: 'Đủ hai ý' }, { pointsUnits: 500, description: 'Một ý' }]);
});
