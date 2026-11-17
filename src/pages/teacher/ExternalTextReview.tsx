import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { assessmentApi } from '@/api/assessment.api';
import type { AssessmentSubmission } from '@/types/assessment.types';

export function ExternalTextReview({ assessmentId, submission, busy, run }: {
  assessmentId: string;
  submission: AssessmentSubmission;
  busy: boolean;
  run: (fn: () => Promise<unknown>) => Promise<void>;
}) {
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState<Record<string, string>>({});
  const processing = ['queued', 'running'].includes(submission.processingState);
  const preview = useQuery({
    queryKey: ['assessments', assessmentId, 'external-text', submission.id, submission.inputRevision],
    queryFn: () => assessmentApi.externalTextPreview(assessmentId, submission.id),
    enabled: open && !processing,
  });
  const items = preview.data?.items ?? [];
  const approved = items.filter(item => selected[item.questionKey] === item.hash);
  return <details onToggle={event => setOpen(event.currentTarget.open)}>
    <summary>Kiểm tra nội dung trước khi gửi chấm tự luận</summary>
    {processing ? <>
      <p role="status">Bài đang chờ xử lý hoặc kiểm tra kết quả.</p>
      <button disabled={busy} onClick={() => void run(async () => {
        await assessmentApi.revokeExternalText(assessmentId, submission);
        setSelected({});
      })}>Chặn các lượt gửi chưa bắt đầu</button>
    </> : <>
      {open && preview.isPending && <p role="status">Đang tải nội dung gửi…</p>}
      {preview.isError && <p role="alert">Không tải được nội dung để kiểm tra.</p>}
      {preview.data && !items.length && <p>Chưa có câu tự luận đủ điều kiện gửi.</p>}
      {!!items.length && <form onSubmit={event => {
        event.preventDefault();
        if (!approved.length || preview.data?.inputRevision !== submission.inputRevision) return;
        const hashes = Object.fromEntries(approved.map(item => [item.questionKey, item.hash]));
        void run(async () => {
          await assessmentApi.releaseExternalText(assessmentId, submission.id, submission.inputRevision, hashes);
          setSelected({});
        });
      }}>
        <p>Chỉ chọn các câu bạn đã đọc toàn bộ nội dung bên dưới và xác nhận không còn thông tin có thể nhận diện học sinh.</p>
        {items.map(item => <fieldset key={item.questionKey}>
          <legend>Câu {item.questionKey}</legend>
          <p style={{ whiteSpace: 'pre-wrap' }}>{item.payload.answer}</p>
          {item.payload.criteria.map(criterion => <p key={criterion.id} style={{ whiteSpace: 'pre-wrap' }}>{criterion.description}</p>)}
          <label><input type="checkbox" checked={selected[item.questionKey] === item.hash} disabled={busy}
            onChange={event => {
              const checked = event.target.checked;
              setSelected(old => ({ ...old, [item.questionKey]: checked ? item.hash : '' }));
            }} /> Tôi đã kiểm tra nội dung gửi của câu {item.questionKey}</label>
        </fieldset>)}
        <button disabled={busy || !approved.length || preview.isFetching}>Cho phép gửi {approved.length} câu</button>
      </form>}
    </>}
  </details>;
}
