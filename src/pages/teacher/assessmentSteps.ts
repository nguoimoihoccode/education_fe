import type { Assessment, AssessmentSubmission } from '@/types/assessment.types';
import { needsAttention } from './assessmentReview';

export type AssessmentStep = { id: string; label: string; detail: string; state: 'done' | 'current' | 'todo'; target: string };

/** Where the teacher is in one grading round: answer key, upload, processing, review, grade book. Counts cover the rows passed in. */
export function assessmentSteps(a: Pick<Assessment, 'examVersions'>, rows: AssessmentSubmission[]): AssessmentStep[] {
  const versions = a.examVersions ?? [];
  const keyApproved = versions.some(version => version.state === 'approved');
  const drafts = versions.filter(version => version.state === 'draft').length;
  const total = rows.length;
  const waitingFiles = rows.filter(row => row.uploadReady === false).length;
  const processing = rows.filter(row => ['queued', 'running'].includes(row.processingState)).length;
  const notStarted = rows.filter(row => !row.currentReview && !row.manualOnly && row.processingState === 'idle' && row.uploadReady !== false).length;
  const attention = rows.filter(needsAttention).length;
  const published = rows.filter(row => row.publication?.state === 'active').length;
  const processed = total > 0 && processing === 0 && notStarted === 0;
  const steps: (Omit<AssessmentStep, 'state'> & { done: boolean })[] = [
    { id: 'key', label: 'Đề và đáp án', target: 'assessment-step-key', done: keyApproved,
      detail: keyApproved ? 'Đã duyệt đáp án' : drafts ? `${drafts} mã đề chờ duyệt` : 'Chưa có đáp án' },
    { id: 'upload', label: 'Tải bài làm', target: 'assessment-step-upload', done: total > 0 && waitingFiles === 0,
      detail: !total ? 'Chưa tải bài' : waitingFiles ? `${total} bài · ${waitingFiles} bài đang chờ file` : `${total} bài đã tải` },
    { id: 'process', label: 'Đọc và chấm', target: 'assessment-step-process', done: processed,
      detail: processing ? `${processing} bài đang xử lý` : notStarted ? `${notStarted} bài chưa xử lý` : total ? 'Đã xử lý xong' : 'Chờ bài làm' },
    { id: 'review', label: 'Giáo viên duyệt', target: 'assessment-step-review', done: processed && attention === 0,
      detail: attention ? `${attention} bài cần xem` : total ? 'Không còn bài cần xem' : 'Chờ kết quả' },
    { id: 'publish', label: 'Ghi sổ điểm', target: 'assessment-step-publish', done: total > 0 && published === total,
      detail: total ? `${published}/${total} bài đã ghi sổ` : 'Chờ duyệt' },
  ];
  const current = steps.findIndex(step => !step.done);
  return steps.map(({ done, ...step }, index) => ({ ...step, state: done ? 'done' : index === current ? 'current' : 'todo' }));
}
