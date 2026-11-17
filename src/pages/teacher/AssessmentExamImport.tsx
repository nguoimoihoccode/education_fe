import { useEffect, useRef, useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { assessmentApi, assessmentDocxMime } from '@/api/assessment.api';
import type { ExamImport } from '@/types/assessment.types';
import { MarkingGuideUpload } from './MarkingGuideUpload';

const terminalStates = new Set(['succeeded', 'failed', 'paused', 'cancelled', 'superseded']);
const importErrors: Record<string, string> = {
  exam_import_invalid_docx: 'File Word không hợp lệ hoặc không đọc được.',
  exam_import_structure_invalid: 'Chưa nhận diện được cấu trúc đề và đáp án. Hãy kiểm tra cách đánh số câu và bảng hướng dẫn chấm.',
  exam_import_unsupported_content: 'File có nội dung Word chưa được hỗ trợ. Hãy kiểm tra file gốc.',
  exam_import_score_mismatch: 'Tổng điểm trong Word khác tổng điểm của đợt chấm.',
  exam_import_document_limit: 'File vượt quá giới hạn xử lý.',
  exam_import_code_mismatch: 'Mã đề in trong Word khác mã đã nhập.',
  exam_code_conflict: 'Mã đề trong file khác mã đã nhập. Hãy kiểm tra lại file và mã đề.',
  source_not_sealed: 'File chưa được xác thực. Hãy thử lại sau ít phút.',
};
type PendingSource = { assetId: string; examCode: string; key: string };

function errorMessage(error: unknown) {
  const apiError = (error as { response?: { data?: { message?: string | string[] } } })?.response?.data?.message;
  if (Array.isArray(apiError)) return apiError.join('. ');
  return apiError || (error instanceof Error ? error.message : 'Có lỗi khi nhập file Word.');
}

export function AssessmentExamImport({ assessmentId, imports, editable }: {
  assessmentId: string; imports: ExamImport[]; editable: boolean;
}) {
  const qc = useQueryClient();
  const [pendingSource, setPendingSource] = useState<PendingSource>();
  const [jobId, setJobId] = useState('');
  const [phase, setPhase] = useState('');
  const [error, setError] = useState('');
  const [retrying, setRetrying] = useState(false);
  const active = useRef<AbortController | null>(null);
  const form = useRef<HTMLFormElement>(null);
  const word = useRef<HTMLInputElement>(null);
  useEffect(() => () => active.current?.abort(), []);
  const job = useQuery({
    queryKey: ['assessments', assessmentId, 'exam-import', jobId],
    queryFn: () => assessmentApi.examImportStatus(assessmentId, jobId),
    enabled: !!jobId,
    refetchInterval: query => terminalStates.has(query.state.data?.state ?? '') ? false : 3000,
  });
  const importedVersionId = job.data?.versionId;
  useEffect(() => {
    if (importedVersionId) void qc.invalidateQueries({ queryKey: ['assessments', assessmentId], exact: true });
  }, [importedVersionId, assessmentId, qc]);

  async function retryImport(id: string) {
    setRetrying(true);
    setError('');
    try {
      await assessmentApi.retry(assessmentId, id);
      setJobId(id);
      await qc.invalidateQueries({ queryKey: ['assessments', assessmentId] });
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setRetrying(false);
    }
  }

  const history = imports.some(item => item.jobId === jobId)
    ? imports.map(item => item.jobId === jobId && job.data && !terminalStates.has(item.state) ? job.data : item)
    : job.data ? [job.data, ...imports] : imports;

  async function start(input: { file: File; examCode: string } | PendingSource) {
    if (active.current) return;
    const controller = new AbortController();
    active.current = controller;
    setError('');
    try {
      let source: PendingSource;
      if ('file' in input) {
        setPendingSource(undefined);
        setPhase('Đang tải file Word…');
        const assetId = await assessmentApi.uploadExamSource(assessmentId, input.file);
        if (controller.signal.aborted) return;
        source = { assetId, examCode: input.examCode, key: crypto.randomUUID() };
        setPendingSource(source);
      } else {
        source = input;
      }
      setPhase('Đang xác thực file Word…');
      const deadline = Date.now() + 180_000;
      while (!controller.signal.aborted) {
        const status = await assessmentApi.assetStatus(assessmentId, source.assetId);
        if (controller.signal.aborted) return;
        if (status.state === 'sealed') break;
        if (status.state === 'failed' || status.sealState && terminalStates.has(status.sealState)) {
          setPendingSource(undefined);
          throw new Error('Xác thực file Word thất bại. Hãy chọn lại file.');
        }
        if (Date.now() >= deadline) throw new Error('File vẫn đang xác thực. Bạn có thể tiếp tục đọc file đã tải sau.');
        await new Promise(resolve => setTimeout(resolve, 2500));
      }
      if (controller.signal.aborted) return;
      setPhase('Đang đưa file Word vào hàng đợi…');
      const result = await assessmentApi.requestExamImport(assessmentId, source.assetId, source.examCode, source.key);
      if (controller.signal.aborted) return;
      setJobId(result.jobId);
      setPendingSource(undefined);
      form.current?.reset();
      void qc.invalidateQueries({ queryKey: ['assessments', assessmentId], exact: true });
    } catch (err) {
      if (!controller.signal.aborted) setError(errorMessage(err));
    } finally {
      active.current = null;
      if (!controller.signal.aborted) setPhase('');
    }
  }

  return <section className="assessment-panel" aria-label="Đề và đáp án chính thức từ Word">
    <h4>Nhập đề và đáp án chính thức từ Word</h4>
    {editable && <>
      <p>Mỗi lần nhập một mã đề. Bạn có thể chuẩn bị ảnh bài làm trong lúc hệ thống đọc file.</p>
      <form ref={form} className="assessment-controls" onSubmit={event => {
        event.preventDefault();
        const data = new FormData(event.currentTarget);
        const file = word.current?.files?.[0];
        const examCode = String(data.get('code') ?? '').trim();
        if (!/^[\p{L}\p{N}_.-]{1,32}$/u.test(examCode)) {
          setError('Mã đề cần có 1–32 ký tự gồm chữ, số, dấu gạch ngang, gạch dưới hoặc dấu chấm.');
        } else if (!(file instanceof File) || !/\.docx$/i.test(file.name) || !file.size || file.size > 5 * 1024 * 1024) {
          setError('Hãy chọn file .docx có dung lượng tối đa 5 MB.');
        } else {
          void start({ file, examCode });
        }
      }}>
        <label>Mã đề chính thức<input name="code" maxLength={32} required disabled={!!phase} /></label>
        <label>File Word đề và đáp án<input ref={word} name="word" type="file" accept={`.docx,${assessmentDocxMime}`} required disabled={!!phase} /></label>
        <button disabled={!!phase}>Tải và đọc file Word</button>
      </form>
      {pendingSource && !phase && <button onClick={() => void start(pendingSource)}>Tiếp tục đọc file đã tải</button>}
      {phase && <p role="status">{phase}</p>}
      {error && <p role="alert">{error}</p>}
      <MarkingGuideUpload assessmentId={assessmentId} />
    </>}
    {job.isError && <p role="alert">Chưa cập nhật được trạng thái đọc file. Hệ thống sẽ thử lại.</p>}
    {jobId && !history.some(item => item.jobId === jobId) && !job.isError && <p role="status">Đã gửi file, đang tải tiến độ…</p>}
    {!!history.length && <ul>{history.map(item => <li key={item.jobId}>
      <strong>Mã đề {item.examCode}</strong>{' · '}
      {item.state === 'succeeded' ? 'Đã đọc file Word' : terminalStates.has(item.state) ? 'Cần kiểm tra file Word' : 'Đang đọc file Word'}
      {editable && item.canRetry && <button disabled={retrying} onClick={() => void retryImport(item.jobId)}>Thử đọc lại file đã tải</button>}
      {item.errorCode && <p>{importErrors[item.errorCode] || `Chi tiết xử lý: ${item.errorCode}`}</p>}
      {!!item.warnings?.length && <ul>{item.warnings.map((warning, index) => <li key={index}>{warning}</li>)}</ul>}
      {item.versionId && <a href={`#exam-version-${item.versionId}`} onClick={() => {
        const panel = document.getElementById(`exam-version-${item.versionId}`);
        if (panel instanceof HTMLDetailsElement) panel.open = true;
      }}>Mở bản nháp mã {item.examCode}</a>}
    </li>)}</ul>}
  </section>;
}
