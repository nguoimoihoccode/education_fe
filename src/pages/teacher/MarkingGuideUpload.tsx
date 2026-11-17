import { useRef, useState } from 'react';
import { assessmentApi } from '@/api/assessment.api';

const guideTypes = ['application/pdf', 'image/jpeg', 'image/png'];
const limitFor = (file: File) => (file.type === 'application/pdf' ? 50 : 20) * 1024 * 1024;

/**
 * Marking guide as PDF or photos, for teachers without the Word file. It is not read on its own: when papers are
 * processed and no key exists yet, the worker drafts one from the exam pages in the papers plus this guide, and the
 * draft still waits for the teacher's approval.
 */
export function MarkingGuideUpload({ assessmentId, wait = 2500 }: { assessmentId: string; wait?: number }) {
  const [phase, setPhase] = useState('');
  const [error, setError] = useState('');
  const [done, setDone] = useState(0);
  const input = useRef<HTMLInputElement>(null);
  async function upload(files: File[]) {
    setError('');
    let sealed = 0;
    try {
      for (const [index, file] of files.entries()) {
        setPhase(`Đang tải ${index + 1}/${files.length}: ${file.name}`);
        const assetId = await assessmentApi.uploadMarkingGuide(assessmentId, file);
        const deadline = Date.now() + 180_000;
        for (;;) {
          const status = await assessmentApi.assetStatus(assessmentId, assetId);
          if (status.state === 'sealed') break;
          if (status.state === 'failed' || ['failed', 'paused', 'cancelled'].includes(status.sealState ?? '')) throw new Error(`Xác thực ${file.name} thất bại. Hãy chọn lại file.`);
          if (Date.now() >= deadline) throw new Error(`${file.name} vẫn đang xác thực. Hãy tải lại trang sau ít phút.`);
          await new Promise(resolve => setTimeout(resolve, wait));
        }
        sealed += 1;
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Tải hướng dẫn chấm thất bại.');
    } finally {
      setDone(old => old + sealed);
      setPhase('');
    }
  }
  return <details className="assessment-panel">
    <summary>Không có file Word? Tải hướng dẫn chấm dạng PDF hoặc ảnh</summary>
    <p>Hệ thống sẽ dựng đáp án nháp từ trang đề có trong bài làm và hướng dẫn chấm này khi bạn bấm "Bắt đầu xử lý". Đáp án nháp luôn chờ bạn duyệt trước khi chấm.</p>
    <form className="assessment-controls" onSubmit={event => {
      event.preventDefault();
      const files = Array.from(input.current?.files ?? []).filter(file => file.size > 0);
      const bad = files.find(file => !guideTypes.includes(file.type) || file.size > limitFor(file));
      if (!files.length) setError('Hãy chọn ít nhất một file.');
      else if (bad) setError(`${bad.name}: chỉ nhận PDF tối đa 50 MB hoặc ảnh JPEG/PNG tối đa 20 MB.`);
      else { void upload(files); if (input.current) input.current.value = ''; }
    }}>
      <label>Hướng dẫn chấm (PDF, JPEG hoặc PNG)<input ref={input} name="guide" type="file" multiple accept={guideTypes.join(',')} disabled={!!phase} /></label>
      <button disabled={!!phase}>Tải hướng dẫn chấm</button>
    </form>
    {phase && <p role="status">{phase}</p>}
    {!!done && !phase && <p role="status">Đã nhận {done} file hướng dẫn chấm.</p>}
    {error && <p role="alert">{error}</p>}
  </details>;
}
