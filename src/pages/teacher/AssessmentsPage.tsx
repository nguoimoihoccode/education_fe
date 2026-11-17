import {usePrivateArtifactUrl} from './usePrivateArtifactUrl';
import {AssessmentEvidence} from './AssessmentEvidence';
import {pointsToUnits,unitsToPoints,assessmentLabel,jobErrorMessage} from './assessmentScores';
import { useEffect, useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { assessmentApi } from '@/api/assessment.api';
import type { Assessment, AssessmentSubmission, ExamVersion, FinalizationItem } from '@/types/assessment.types';
import { canApproveReview, canFinalizeReview, needsAttention, proposedUnits } from './assessmentReview';
import './AssessmentsPage.css';
import { ExamKeyEditor } from './ExamKeyEditor';
import { AssessmentClassUpload } from './AssessmentClassUpload';
import { ExternalTextReview } from './ExternalTextReview';
import { AssessmentExamImport } from './AssessmentExamImport';
import { AssessmentSteps } from './AssessmentStepsNav';
import { AiAgreementPanel } from './AiAgreementPanel';
import { AssessmentCostPanel } from './AssessmentCostPanel';
import { quickReview } from './examQuickReview';
import { assessmentSteps } from './assessmentSteps';

const examAttention: Record<string, string> = {
  exam_code_conflict: 'Mã hoặc nội dung trên bài khác đề đang đối chiếu. Kiểm tra ảnh gốc và mã đề.',
  exam_version_confirmation_required: 'Chưa đủ thông tin để xác nhận phiên bản đề. Bổ sung trang hoặc chọn mã đề đã kiểm tra.',
  exam_import_pending: 'Bài đang chờ nhập và duyệt đáp án Word của mã đề này.',
};

function message(error: unknown) {
  const response = (error as { response?: { data?: { message?: string | string[]; error?: string } } })?.response;
  const code = response?.data?.error;
  if (code === 'ASSESSMENT_PILOT_PAUSED') return 'Chấm bài tự động cho lớp và môn này đang tạm dừng. Vẫn sửa và duyệt được điểm đã có; liên hệ quản trị viên để mở lại.';
  if (code === 'ASSESSMENT_PILOT_CLOSED') return 'Lớp và môn này chưa được mở thí điểm chấm bài tự động. Liên hệ quản trị viên để mở.';
  const text = response?.data?.message;
  return Array.isArray(text) ? text.join('. ') : text || (error instanceof Error ? error.message : 'Không thể thực hiện. Vui lòng tải lại dữ liệu.');
}
function Content({ value }: { value: unknown }) {
  if (value === null || value === undefined) return <span>Chưa có dữ liệu</span>;
  if (Array.isArray(value)) return <ul>{value.map((v, i) => <li key={i}><Content value={v} /></li>)}</ul>;
  if (typeof value === 'object') return <dl>{Object.entries(value).filter(([key]) => !['id', 'runId', 'answerRevisionId', 'sourceRegionIds', 'sourceTokenRefs', 'schemaVersion', 'inputManifest', 'contentHash', 'questionContentHash', 'gradingSpecHash', 'pointScale'].includes(key)).map(([k, v]) => <div key={k}><dt>{({ questionKey: 'Câu', kind: 'Dạng câu', prompt: 'Đề bài', maxUnits: 'Điểm tối đa', earnedUnits: 'Điểm đạt', criteria: 'Tiêu chí', answerKey: 'Đáp án', options: 'Lựa chọn', text: 'Nội dung', feedback: 'Nhận xét', evidence: 'Bằng chứng', source: 'Nguồn', observationState: 'Trạng thái đọc', maxScoreUnits: 'Tổng điểm', examCode: 'Mã đề', subject: 'Môn', grade: 'Khối', declaredExamPageCount: 'Số trang đề', pointScale: 'Đơn vị điểm', questions: 'Câu hỏi', gradingDefaults: 'Quy tắc chấm chung', acceptedAnswerForms: 'Dạng trả lời được chấp nhận', description: 'Mô tả', levels: 'Mức đạt', pointsUnits: 'Điểm', selectedOptionId: 'Lựa chọn đã đọc', scoringPolicy: 'Quy tắc tính điểm', unitsPerCorrect: 'Điểm mỗi mệnh đề đúng', unitsByCorrectCount: 'Điểm theo số mệnh đề đúng', blankScoreUnits: 'Điểm bỏ trống', carryForwardErrorPolicy: 'Lỗi kéo theo', statements: 'Mệnh đề', ambiguityCodes: 'Dấu hiệu cần kiểm tra' } as Record<string, string>)[k] || k}</dt><dd>{['maxUnits','earnedUnits','pointsUnits','maxScoreUnits','blankScoreUnits','unitsPerCorrect'].includes(k)&&typeof v==='number'?unitsToPoints(v):k==='unitsByCorrectCount'&&Array.isArray(v)?v.map(n=>unitsToPoints(Number(n))).join(', '):<Content value={v} />}</dd></div>)}</dl>;
  return <span>{typeof value==='string'?assessmentLabel(value):String(value)}</span>;
}
export default function AssessmentsPage() {
  const context = useQuery({ queryKey: ['assessments', 'context'], queryFn: assessmentApi.context, retry: false });
  const [listPage, setListPage] = useState(1);
  const [classId, setClassId] = useState('');
  const [subjectId, setSubjectId] = useState('');
  const [activeId, setActiveId] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const [uploadingClass, setUploadingClass] = useState(false);
  const qc = useQueryClient();
  const list = useQuery({ queryKey: ['assessments', 'list', classId, subjectId, listPage], queryFn: () => assessmentApi.list(classId, subjectId, listPage), enabled: !!context.data?.enabled });
  const selectedClass = context.data?.classes.find(c => c.id === classId);
  const selectedSubject = selectedClass?.subjects.find(s => s.id === subjectId);
  const canCreateSelected = selectedSubject?.capabilities?.canCreate ?? context.data?.capabilities.canCreate;
  const run = async (action: () => Promise<unknown>, setPending = setBusy) => {
    setPending(true); setError('');
    try { await action(); await qc.invalidateQueries({ queryKey: ['assessments'] }); } catch (e) { setError(message(e)); } finally { setPending(false); }
  };
  if (context.isPending) return <p role="status">Đang tải lớp và môn được phân công…</p>;
  if (!context.data) return <div role="alert">Không tải được chức năng chấm bài. <button onClick={() => void context.refetch()}>Thử lại</button></div>;
  if (!context.data.enabled) return <AssessmentPreview />;
  return <main className="assessment-page">
    <h1>Chấm bài AI</h1>
    <p>Chọn lớp, môn và tải bài theo từng học sinh. AI đề xuất; giáo viên duyệt đáp án và kết quả trước khi ghi sổ điểm.</p>
    {error && <p role="alert">{error}</p>}
    <div className="assessment-controls">
      <label>Lớp<select value={classId} onChange={e => { setClassId(e.target.value); setSubjectId(''); setListPage(1); }}><option value="">Tất cả lớp</option>{context.data.classes.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}</select></label>
      <label>Môn<select value={subjectId} onChange={e => { setSubjectId(e.target.value); setListPage(1); }}><option value="">Chọn môn</option>{selectedClass?.subjects.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}</select></label>
    </div>
    {context.data.capabilities.canCreate && <form className="assessment-panel assessment-controls" onSubmit={e => { e.preventDefault(); const data = new FormData(e.currentTarget); void run(async () => { const a = await assessmentApi.create({ title: String(data.get('title')), classId, subjectId, academicYearId: selectedClass!.academicYearId, examDate: String(data.get('date')), term: Number(data.get('term')), testType: String(data.get('type')), coefficient: Number(data.get('coefficient')), maxScoreUnits: pointsToUnits(Number(data.get('max'))) }); setActiveId(a.id); }); }}>
      <label>Tên đợt chấm<input name="title" required maxLength={200} /></label>
      <label>Ngày kiểm tra<input name="date" type="date" required /></label>
      <label>Học kỳ<select name="term"><option value="1">1</option><option value="2">2</option></select></label>
      <label>Loại kiểm tra<select name="type"><option value="15min">15 phút</option><option value="45min">45 phút</option><option value="oral">Thường xuyên</option><option value="final">Cuối kỳ</option></select></label>
      <label>Hệ số<select name="coefficient"><option value="1">1</option><option value="2">2</option></select></label>
      <label>Tổng điểm<input name="max" type="number" min="0.001" max="1000" step="0.001" defaultValue="10" required /></label>
      <button disabled={busy || uploadingClass || !classId || !subjectId || !canCreateSelected} type="submit">Tạo đợt chấm</button>
      {classId && subjectId && !canCreateSelected && (
        <p role="status">
          {selectedSubject?.pilotState === 'paused'
            ? 'Môn này đang tạm dừng tạo đợt chấm mới; bạn vẫn xem và duyệt các đợt chấm đã tạo bên dưới.'
            : 'Lớp và môn này chưa mở thí điểm chấm bài tự động.'}
        </p>
      )}
    </form>}
    {list.isError ? <p role="alert">Không tải được danh sách đợt chấm.</p> : <div className="assessment-controls">{list.data?.items.map(a => <button key={a.id} aria-pressed={activeId === a.id} disabled={busy || uploadingClass} onClick={() => setActiveId(a.id)}>{a.title}</button>)}</div>}
    {list.data && list.data.total > 100 && <div className="assessment-controls"><button disabled={listPage === 1} onClick={() => setListPage(p => p - 1)}>Đợt chấm trước</button><span>Trang {listPage}</span><button disabled={listPage * 100 >= list.data.total} onClick={() => setListPage(p => p + 1)}>Đợt chấm tiếp</button></div>}
    {activeId && <AssessmentDetail key={activeId} id={activeId} run={run} busy={busy} uploadingClass={uploadingClass} runClassUpload={action => run(action, setUploadingClass)} />}
  </main>;
}
function AssessmentPreview() {
  return (
    <main className="assessment-page">
      <h1>Chấm bài AI</h1>
      <section className="assessment-panel">
        <h2>Xem trước quy trình chấm bài</h2>
        <p>Đây là bản xem trước với dữ liệu minh họa. Các thao tác thật sẽ khả dụng khi kho lưu trữ và dịch vụ AI sẵn sàng.</p>
        <ol>
          <li><strong>Tạo đợt chấm.</strong> Chọn từng học sinh, chụp hoặc thêm ảnh/PDF có cả đề và bài làm, rồi tải các nhóm của cả lớp.</li>
          <li><strong>Chấm theo mã đề.</strong> Nếu có file Word đề và đáp án, tải một file cho mỗi mã đề rồi duyệt bản nháp một lần. Hệ thống đối chiếu nội dung trước khi áp đáp án.</li>
          <li><strong>Kiểm tra và chốt.</strong> Xem các câu cần kiểm tra, bổ sung trang nếu thiếu và chốt những bài đủ điều kiện vào sổ điểm.</li>
        </ol>
        <div className="assessment-controls">
          <button type="button" disabled>Tạo đợt chấm</button>
          <button type="button" disabled>Nhập đề và đáp án Word</button>
          <button type="button" disabled>Tải nhóm bài</button>
          <button type="button" disabled>Chấm bài</button>
          <button type="button" disabled>Chốt vào sổ điểm</button>
        </div>
      </section>
      <div className="assessment-table">
        <table>
          <caption>Kết quả minh họa</caption>
          <thead>
            <tr><th scope="col">Bài</th><th scope="col">Mã đề</th><th scope="col">Điểm đề xuất</th><th scope="col">Trạng thái</th></tr>
          </thead>
          <tbody>
            <tr><th scope="row">Bài mẫu A</th><td>102</td><td>8,5/10</td><td>Sẵn sàng để giáo viên chốt</td></tr>
            <tr><th scope="row">Bài mẫu B</th><td>103</td><td>Chưa đủ dữ liệu</td><td>Cần bổ sung trang tự luận</td></tr>
          </tbody>
        </table>
      </div>
    </main>
  );
}

function AssessmentDetail({ id, run, busy, uploadingClass, runClassUpload }: {
  id: string;
  run: (action: () => Promise<unknown>) => Promise<void>;
  busy: boolean;
  uploadingClass: boolean;
  runClassUpload: (action: () => Promise<void>) => Promise<void>;
}) {
  const [submissionPage, setSubmissionPage] = useState(1);
  const detail = useQuery({ queryKey: ['assessments', id], queryFn: () => assessmentApi.detail(id), refetchInterval: 15000 });
  const submissions = useQuery({ queryKey: ['assessments', id, 'submissions', submissionPage], queryFn: () => assessmentApi.submissions(id, submissionPage), refetchInterval: query => { const items = query.state.data?.items; return !items || items.some(row => ['queued', 'running'].includes(row.processingState) || row.uploadReady === false) ? 5000 : false; } });
  const progress = useQuery({ queryKey: ['assessments', id, 'progress'], queryFn: () => assessmentApi.progress(id), refetchInterval: query => { const jobs = query.state.data?.jobs; return !jobs || jobs.some(job => ['pending', 'dispatched', 'queued', 'running', 'retry_wait'].includes(job.state)) ? 5000 : false; } });
  const roster = useQuery({ queryKey: ['assessments', id, 'roster'], queryFn: () => assessmentApi.roster(detail.data!.classId, detail.data!.subjectId), enabled: !!detail.data && !detail.data.roster });
  const [openId, setOpenId] = useState('');
  const [exportId,setExportId]=useState('');
  const [downloadUrl,setDownloadUrl]=usePrivateArtifactUrl();
  const exportStatus=useQuery({queryKey:['assessments',id,'export',exportId],queryFn:()=>assessmentApi.exportStatus(id,exportId),enabled:!!exportId,refetchInterval:query=>query.state.data?.state==='completed'||query.state.data?.state==='failed'?false:3000});
  const [selectedReviewIds, setSelectedReviewIds] = useState<Record<string, string>>({});
  const [outcomes, setOutcomes] = useState<string[]>([]);
  const [processNotice, setProcessNotice] = useState('');
  const [onlyAttention, setOnlyAttention] = useState(false);
  if (!detail.data || !submissions.data) {
    if (detail.isError || submissions.isError) return <p role="alert">Không tải được đợt chấm. Vui lòng thử lại.</p>;
    return <p role="status">Đang tải bài…</p>;
  }
  const a = detail.data;
  const students = a.roster ?? roster.data ?? [];
  const rows = submissions.data.items;
  const writable = !a.archivedAt;
  const canProcess = writable && (a.capabilities.canProcess ?? Boolean(a.capabilities.canReview));
  const readyRows = rows.filter(row => row.uploadReady !== false && !row.manualOnly && row.processingState === 'idle');
  const existingStudentIds = new Set(rows.flatMap(row => row.studentId === null ? [] : [row.studentId]));
  const eligible = rows.filter(s => canFinalizeReview(s) && selectedReviewIds[s.id] === s.currentReview?.id);
  const jobs = progress.data?.jobs ?? [];
  const needsExamReview = new Map<string, { id: string; code: string }>();
  for (const job of jobs) {
    if (!job.submissionId || job.state !== 'paused' || !job.lastErrorCode || !examAttention[job.lastErrorCode]) continue;
    const row = rows.find(item => item.id === job.submissionId);
    if (!row || row.inputRevision !== job.inputRevision || row.processingState !== 'paused') continue;
    if (!needsExamReview.has(job.submissionId)) needsExamReview.set(job.submissionId, { id: job.id, code: job.lastErrorCode });
  }
  const attentionRows = rows.filter(needsAttention);
  const approvedCount = rows.filter(row => row.reviewApproved || row.publication?.state === 'active').length;
  const busyCount = rows.filter(row => ['queued', 'running'].includes(row.processingState)).length;
  const visibleRows = onlyAttention ? attentionRows : rows;
  function openNextAttention() {
    if (!attentionRows.length) return;
    const index = attentionRows.findIndex(row => row.id === openId);
    openSubmission(attentionRows[(index + 1) % attentionRows.length].id);
  }
  function openSubmission(submissionId: string) {
    if (openId === submissionId) document.getElementById(`assessment-submission-${submissionId}`)?.scrollIntoView?.();
    setOpenId(submissionId);
  }
  async function finalize() {
    const items: FinalizationItem[] = eligible.slice(0, 50).map(s => ({ submissionId: s.id, expectedInputRevision: s.inputRevision, expectedReviewRevisionId: s.currentReview!.id, expectedReviewHash: s.currentReview!.contentHash, expectedContextRevision: a.contextRevision, expectedPublicationRevision: s.publication?.revision ?? null, identityAcknowledgement: { studentId: s.studentId!, expectedIdentityRevision: s.identityRevision } }));
    const result = await assessmentApi.finalize(id, items, crypto.randomUUID());
    setOutcomes(result.items.map(item => `${rows.find(s => s.id === item.submissionId)?.displayName || 'Bài nộp'}: ${({ finalized: 'Đã ghi sổ điểm', already_finalized: 'Đã ghi sổ trước đó', blocked: 'Cần xử lý thêm', conflict: 'Dữ liệu đã thay đổi', not_found: 'Không tìm thấy bài' } as Record<string, string>)[item.outcome] || item.outcome}${item.message ? ` — ${item.message}` : ''}`));
    setSelectedReviewIds({});
  }
  return <section className="assessment-panel"><h2>{a.title}</h2>
    <AssessmentSteps steps={assessmentSteps(a, rows)} />
    {!writable && <p>Đợt chấm đã lưu trữ — chỉ xem.</p>}
    {writable && a.pilotState === 'paused' && <p role="status">Chấm bài tự động của lớp × môn này đang tạm dừng. Bạn vẫn sửa đáp án nháp, duyệt điểm đã có, rút điểm khỏi sổ và tải các báo cáo đã xuất.</p>}
    {(detail.isError || submissions.isError) && <p role="alert">Chưa cập nhật được đợt chấm. Bạn vẫn có thể tiếp tục chuẩn bị nhóm ảnh.</p>}
    {progress.isError && <p role="alert">Chưa tải được tiến độ; dữ liệu hiển thị có thể chưa cập nhật.</p>}
    <p role="status">{Object.entries(progress.data?.counts || {}).map(([stage, count]) => `${assessmentLabel(stage)}: ${count}`).join(' · ') || 'Chưa có tiến độ xử lý'}</p>
    {progress.data?.warnings?.map((w, i) => <p key={i}>{w}</p>)}
    {jobs.filter(j => ['failed','paused'].includes(j.state) && j.stage !== 'template' && !j.lastErrorCode?.startsWith('pilot_') && !examAttention[j.lastErrorCode ?? '']).map(j => <div key={j.id}>Xử lý thất bại: {jobErrorMessage(j.lastErrorCode)} {writable && a.capabilities.canProcess && <button disabled={busy} onClick={() => void run(() => assessmentApi.retry(id, j.id))}>Thử lại công việc</button>}</div>)}
    <h3 id="assessment-step-key">Đề và đáp án theo mã đề</h3>
    {(canProcess || !!a.examImports?.length) && <AssessmentExamImport assessmentId={id} imports={a.examImports ?? []} editable={canProcess} />}
    {!a.examVersions?.length && <p>Chưa có đáp án để duyệt. Bạn có thể nhập file Word hoặc tải nhóm bài có đủ trang đề.</p>}
    {a.examVersions?.map(version => <ExamPanel key={version.id} assessment={a} version={version} busy={busy} run={run} />)}
    {writable && a.capabilities.canProcess && <>
      <span id="assessment-step-upload" />
      <AssessmentClassUpload assessmentId={id} roster={students} existingStudentIds={existingStudentIds} run={runClassUpload} busy={busy || uploadingClass} />
      <details>
        <summary>Tải một nhóm riêng</summary>
      <form className="assessment-controls" onSubmit={e => { e.preventDefault(); const form = e.currentTarget; const data = new FormData(form); const files = data.getAll('files').filter((f): f is File => f instanceof File && f.size > 0); void run(async () => { const student = Number(data.get('student')); const s = await assessmentApi.createSubmission(id, student || undefined); for (const file of files) await assessmentApi.upload(id, s.id, file); form.reset(); }); }}>
        <label>Học sinh của nhóm bài<select name="student"><option value="">Xác định sau khi đọc bài</option>{students.map(s => <option key={s.id} value={s.id}>{s.displayName}{s.studentCode ? ` — ${s.studentCode}` : ''}</option>)}</select></label>
        <label>Ảnh hoặc PDF cùng một bài học sinh<input type="file" name="files" accept="image/jpeg,image/png,application/pdf" multiple required /></label><button disabled={busy || uploadingClass}>Tải nhóm bài</button>
      </form>
      </details>
      <p>{readyRows.length} bài sẵn sàng xử lý trên trang này. Các bài còn thiếu file hoặc đang xác thực sẽ chờ.</p>
      <button id="assessment-step-process" disabled={busy || readyRows.length === 0} onClick={() => void run(async () => {
        setProcessNotice('');
        const result = await assessmentApi.process(id, readyRows);
        if (result?.skipped?.length) setProcessNotice(`${result.skipped.length} bài vừa thay đổi hoặc chưa sẵn sàng. Hệ thống đã đưa các bài còn lại vào hàng đợi.`);
      })}>Bắt đầu xử lý</button>
      {processNotice && <p role="status">{processNotice}</p>}
    </>}
    {writable && a.capabilities.canFinalize && <button disabled={busy} onClick={()=>setSelectedReviewIds(Object.fromEntries(rows.filter(canFinalizeReview).map(s=>[s.id,s.currentReview!.id])))}>Chọn các bài đã duyệt trên trang</button>}
    {!!needsExamReview.size && <section className="assessment-panel">
      <h3>Cần xử lý mã đề</h3>
      <ul>{Array.from(needsExamReview, ([submissionId, { id: jobId, code }]) => <li key={submissionId}>
        <strong>{rows.find(row => row.id === submissionId)?.displayName || 'Bài học sinh'}</strong> · {examAttention[code]}{' '}
        <button onClick={() => openSubmission(submissionId)}>Mở ảnh và kiểm tra</button>
        {writable && a.capabilities.canProcess && code === 'exam_import_pending' && <button disabled={busy} onClick={() => void run(() => assessmentApi.retry(id, jobId))}>Thử lại sau khi duyệt đề</button>}
      </li>)}</ul>
    </section>}
    <h3 id="assessment-step-review">Bài học sinh</h3>
    <div className="assessment-controls" role="group" aria-label="Tổng quan lớp">
      <p role="status">{rows.length} bài · {attentionRows.length} cần xem · {approvedCount} đã duyệt · {busyCount} đang xử lý</p>
      <label><input type="checkbox" checked={onlyAttention} onChange={e => setOnlyAttention(e.target.checked)} /> Chỉ hiện bài cần xem</label>
      <button disabled={!attentionRows.length} onClick={openNextAttention} aria-keyshortcuts="N">Bài tiếp theo cần xem</button>
      <small>Phím tắt: N</small>
      <NextShortcut enabled={attentionRows.length > 0} onNext={openNextAttention} />
    </div>
    <div className="assessment-table"><table><thead><tr><th>Chọn chốt</th><th>Học sinh</th><th>Trạng thái</th><th>Điểm đã đánh giá</th><th>Kiểm tra</th></tr></thead><tbody>{visibleRows.map(s => <tr key={s.id}><td><input type="checkbox" aria-label={`Chọn bài của ${s.displayName || 'học sinh chưa xác định'}`} disabled={!writable || !a.capabilities.canFinalize || !canFinalizeReview(s)} checked={!!s.currentReview && selectedReviewIds[s.id]===s.currentReview.id} onChange={e=>setSelectedReviewIds(old=>{const next={...old};if(e.target.checked&&s.currentReview)next[s.id]=s.currentReview.id;else delete next[s.id];return next;})} /></td><td>{s.displayName || 'Chưa xác định'}<br /><small>{assessmentLabel(s.identityState)}</small></td><td>{s.processingState === 'idle' && s.uploadReady === false ? 'Chờ tải hoặc xác thực file' : assessmentLabel(s.processingState)}</td><td>{s.currentReview?.earnedUnits == null ? 'Chưa có kết quả' : `${unitsToPoints(s.currentReview.earnedUnits)}/${unitsToPoints(a.maxScoreUnits)}${s.currentReview.ungradedMaxUnits ? ' (chưa đầy đủ)' : ''}`}{s.publication?.state === 'active' && <p>Đã ghi sổ điểm</p>}</td><td><button onClick={() => openSubmission(s.id)}>Mở bài</button>{s.reviewApproved && <p>Đã duyệt bản hiện tại</p>}</td></tr>)}</tbody></table></div>
    <AiAgreementPanel assessmentId={id} />
    <AssessmentCostPanel assessmentId={id} />
    {submissions.data.total > 100 && <div className="assessment-controls"><button disabled={submissionPage === 1} onClick={() => setSubmissionPage(p => p - 1)}>Bài trước</button><span>Trang {submissionPage}</span><button disabled={submissionPage * 100 >= submissions.data.total} onClick={() => setSubmissionPage(p => p + 1)}>Bài tiếp</button></div>}
    {openId && <SubmissionPanel key={openId} assessment={a} sid={openId} examError={needsExamReview.get(openId)?.code} roster={students} run={run} busy={busy || uploadingClass} />}
    {writable && a.capabilities.canFinalize && <button id="assessment-step-publish" disabled={busy || !eligible.length} onClick={() => void run(finalize)}>Chốt {Math.min(eligible.length, 50)} bài đã kiểm tra vào sổ điểm</button>}
    <div className="assessment-controls">
      {canProcess && (['xlsx','pdf'] as const).map(format=><button key={format} disabled={busy} onClick={()=>void run(async()=>{const result=await assessmentApi.requestExport(id,format);setExportId(result.exportId);setDownloadUrl('');})}>Xuất {format==='xlsx'?'Excel':'PDF'} điểm đã công bố</button>)}
      {exportId && exportStatus.data?.state!=='completed' && <span role="status">Đang chuẩn bị báo cáo…</span>}
      {exportStatus.data?.state==='completed' && <button onClick={()=>void run(async()=>setDownloadUrl((await assessmentApi.exportAccess(id,exportId)).url))}>Lấy liên kết tải báo cáo</button>}
      {(a.exports ?? []).filter(exp => exp.id !== exportId).map(exp => (
        <button key={exp.id} disabled={busy} onClick={() => void run(async () => setDownloadUrl((await assessmentApi.exportAccess(id, exp.id)).url))}>
          Lấy liên kết tải {exp.format === 'xlsx' ? 'Excel' : 'PDF'} đã xuất
        </button>
      ))}
      {downloadUrl && <a href={downloadUrl} target="_blank" rel="noopener noreferrer" referrerPolicy="no-referrer">Tải báo cáo</a>}
    </div>
    {outcomes.map((o, i) => <p role="status" key={i}>{o}</p>)}
  </section>;
}
function ExamWordSource({ assessmentId, jobId, assetId, canAccessEvidence }: { assessmentId: string; jobId: string; assetId: string; canAccessEvidence: boolean }) {
  const [open, setOpen] = useState(false);
  const imported = useQuery({
    queryKey: ['assessments', assessmentId, 'exam-import', jobId],
    queryFn: () => assessmentApi.examImportStatus(assessmentId, jobId),
    enabled: open,
  });
  return <details onToggle={event => setOpen(event.currentTarget.open)}>
    <summary>Đối chiếu nội dung từ file Word</summary>
    {canAccessEvidence && <EvidenceLink assessmentId={assessmentId} assetId={assetId} />}
    {imported.isError && <p role="alert">Chưa tải được nội dung nguồn.</p>}
    {open && imported.isPending && <p role="status">Đang tải nội dung nguồn…</p>}
    {Object.entries(imported.data?.source ?? {}).map(([sourceId, text]) =>
      <details key={sourceId}><summary>Câu {sourceId.replace(/^docx-/, '')}</summary><p style={{ whiteSpace: 'pre-wrap' }}>{text}</p></details>)}
  </details>;
}

function ExamPanel({ assessment: a, version, busy, run }: { assessment: Assessment; version: ExamVersion; busy: boolean; run: (fn: () => Promise<unknown>) => Promise<void> }) {
  const [checked, setChecked] = useState(false);
  const [approvalNotice, setApprovalNotice] = useState('');
  const officialSource = a.examImports?.find(item => item.jobId === version.sourceImportJobId || item.versionId === version.id);
  const canProcess = a.capabilities.canProcess !== false;
  const reviewable = version.state === 'draft' && !!a.capabilities.canReview && canProcess && !a.archivedAt;
  const quick = reviewable ? quickReview(version, officialSource, a.maxScoreUnits) : null;
  const impact = useQuery({ queryKey: ['assessments', a.id, 'exam-impact', version.id], queryFn: () => assessmentApi.examImpact(a.id, version.id), enabled: reviewable && (checked || !!quick?.eligible) });
  const impactNotice = !!impact.data?.submissionCount && <p role="status">Mã đề {version.examCode} đang gắn với {impact.data.submissionCount} bài. Khi duyệt, các bài chưa ghi sổ điểm sẽ được đọc và chấm lại theo đáp án này; bài đã ghi sổ điểm giữ nguyên.</p>;
  const approve = () => void run(async () => { const result = await assessmentApi.approveExam(a.id, version); const count = result?.jobIds?.length ?? 0; setApprovalNotice(count ? `Đã duyệt. ${count} bài được đưa vào chấm lại theo đáp án mới.` : 'Đã duyệt. Không có bài nào cần chấm lại.'); });
  return <>
    {quick && <section className="assessment-panel" aria-label={`Duyệt nhanh mã đề ${version.examCode}`}>
      <h4>Duyệt nhanh mã đề {version.examCode}</h4>
      <p>{quick.summary}</p>
      {quick.choiceKeys && <p>Đáp án trắc nghiệm: {quick.choiceKeys}</p>}
      {quick.trueFalseKeys && <p>Đáp án đúng/sai: {quick.trueFalseKeys}</p>}
      {quick.eligible ? <>
        <p>File Word đọc ra không có cảnh báo, tổng điểm khớp và câu nào cũng có đáp án hoặc tiêu chí. Hãy so nhanh dòng đáp án trên với file của bạn.</p>
        {impactNotice}
        <button disabled={busy} onClick={approve}>Đúng với file, duyệt mã {version.examCode}</button>
      </> : <><p role="alert">Chưa duyệt nhanh được. Hãy mở mã đề bên dưới để kiểm tra từng câu.</p><ul>{quick.reasons.map(reason => <li key={reason}>{reason}</li>)}</ul></>}
    </section>}
    <details className="assessment-panel" id={`exam-version-${version.id}`}><summary>Mã đề {version.examCode}{version.versionNumber ? ` · Phiên bản ${version.versionNumber}` : ''} — {version.state === 'approved' ? 'Đã duyệt' : version.state === 'draft' ? 'Chờ duyệt' : 'Bản cũ'}</summary>{officialSource && <ExamWordSource assessmentId={a.id} jobId={officialSource.jobId} assetId={officialSource.assetId} canAccessEvidence={canProcess} />}<Content value={version.document} />
      {a.capabilities.canReview && !a.archivedAt && <details><summary>Sửa đáp án và thang điểm</summary><ExamKeyEditor key={version.gradingSpecHash} document={version.document} busy={busy} save={document => void run(() => assessmentApi.draftExam(a.id, version.examCode, document, version.id))} /></details>}
      {reviewable && <><label><input type="checkbox" checked={checked} onChange={e => setChecked(e.target.checked)} /> Tôi đã kiểm tra nội dung, đáp án và thang điểm mã đề này</label>{checked && impactNotice}<button disabled={busy || !checked} onClick={approve}>Duyệt đáp án mã {version.examCode}</button></>}
      {version.state === 'draft' && !!a.capabilities.canReview && !canProcess && !a.archivedAt && <p role="status">Phạm vi đang tạm dừng nên chưa thể duyệt đáp án để chấm lại; bạn vẫn có thể lưu bản nháp đáp án.</p>}
    </details>
    {approvalNotice && <p role="status">{approvalNotice}</p>}
  </>;
}
function SubmissionPanel({ assessment: a, sid, examError, roster, run, busy }: { assessment: Assessment; sid: string; examError?: string; roster: { id: number; displayName: string }[]; run: (fn: () => Promise<unknown>) => Promise<void>; busy: boolean }) {
  const data = useQuery({ queryKey: ['assessments', a.id, 'submission', sid], queryFn: () => assessmentApi.submission(a.id, sid), refetchInterval: query => { const row = query.state.data; return !row || ['queued', 'running'].includes(row.processingState) || !!row.uploads?.some(asset => asset.state === 'uploading' || asset.state === 'verifying') ? 5000 : false; } });

  const opened = !!data.data;
  useEffect(() => {
    if (opened) document.getElementById(`assessment-submission-${sid}`)?.scrollIntoView?.();
  }, [sid, opened]);
  if (data.isError) return <p role="alert">Không tải được nội dung bài. Chưa thể xác nhận kiểm tra.</p>;
  const s = data.data;
  if (!s) return <p>Đang mở bài…</p>;
  const review = s.currentReview;
  const reviewVersion = a.examVersions?.find(version => version.id === review?.examVersionId);
  const editable = a.capabilities.canReview && !a.archivedAt;
  const canProcess = editable && a.capabilities.canProcess !== false;
  const canAccessEvidence = a.capabilities.canProcess !== false;
  const canWithdraw = (a.capabilities.canReview || a.capabilities.canFinalize) && !a.archivedAt;
  return <article className="assessment-panel" id={`assessment-submission-${sid}`}><h3>Kiểm tra bài: {s.displayName || 'Chưa xác định học sinh'}</h3>
    {editable && <form className="assessment-controls" onSubmit={e => { e.preventDefault(); const id = Number(new FormData(e.currentTarget).get('identity')); void run(() => assessmentApi.identity(a.id, s, id)); }}><label>Xác nhận học sinh<select name="identity" required defaultValue={s.studentId || ''}><option value="">Chọn học sinh trong lớp</option>{roster.map(r => <option value={r.id} key={r.id}>{r.displayName}</option>)}</select></label><button disabled={busy}>Xác nhận danh tính</button></form>}
    {a.capabilities.canProcess && !a.archivedAt && <form className="assessment-controls" onSubmit={e => { e.preventDefault(); const form = e.currentTarget; const files = new FormData(form).getAll('files').filter((file): file is File => file instanceof File && file.size > 0); void run(async () => { for (const file of files) await assessmentApi.upload(a.id, s.id, file); form.reset(); }); }}><label>Bổ sung trang cho đúng bài này<input name="files" type="file" accept="image/jpeg,image/png,application/pdf" multiple required /></label><button disabled={busy}>Tải thêm trang</button></form>}
    {s.uploads?.some(asset => asset.state === 'uploading' || asset.state === 'verifying') && (
      <section className="assessment-panel">
        <h4>File đang tải hoặc xác thực</h4>
        {s.uploads.filter(asset => asset.state === 'uploading' || asset.state === 'verifying').map(asset => (
          (asset.state === 'uploading' || asset.verificationFailed) && a.capabilities.canProcess && !a.archivedAt ? (
            <label key={asset.id}>
              {asset.verificationFailed ? 'Xác thực lỗi. Chọn lại file ' : 'Chọn lại file '}{asset.name}
              <input
                type="file"
                accept={asset.mime}
                disabled={busy}
                onChange={event => {
                  const file = event.currentTarget.files?.[0];
                  event.currentTarget.value = '';
                  if (file) void run(() => assessmentApi.upload(a.id, s.id, file, asset.id));
                }}
              />
            </label>
          ) : <p key={asset.id}>{asset.name} · {asset.state === 'verifying' ? 'Đang xác thực' : 'Chờ tải'}</p>
        ))}
      </section>
    )}
    <h4>Trang bài và bằng chứng</h4>
    {!canAccessEvidence && !!s.pages?.length && <p role="status">Liên kết ảnh bằng chứng tạm khóa khi đợt thí điểm đang tạm dừng.</p>}
    {s.pages?.map(page => <div key={page.id} className="assessment-panel"><p>Trang {page.sourcePageNumber || 1} — {page.pageRole || 'Chưa phân loại'}</p>{canAccessEvidence && <><EvidenceLink assessmentId={a.id} assetId={page.assetId} /><AssessmentEvidence assessmentId={a.id} page={page} inputRevision={s.inputRevision} editable={!!canProcess} busy={busy} run={run} /></>}{page.regions?.map(region => <p key={region.id}>{region.text || 'Vùng hình hoặc bảng: xem bản gốc để đối chiếu'}</p>)}</div>)}
    {examError && <p role="alert">{examAttention[examError]}</p>}
    {canProcess && !s.publication && (examError === 'exam_version_confirmation_required' || examError === 'exam_code_conflict') && a.examVersions?.some(version => version.state === 'approved') &&
      <form className="assessment-controls" onSubmit={event => {
        event.preventDefault();
        const versionId = String(new FormData(event.currentTarget).get('version'));
        void run(() => assessmentApi.assignExamVersion(a.id, s, versionId));
      }}>
        <label>Phiên bản đề đã đối chiếu<select name="version" required defaultValue="">
          <option value="">Chọn phiên bản đã duyệt</option>
          {a.examVersions.filter(version => version.state === 'approved').map(version =>
            <option key={version.id} value={version.id}>Mã {version.examCode} · Phiên bản {version.versionNumber}</option>)}
        </select></label>
        <label><input type="checkbox" required /> Tôi đã đối chiếu ảnh và xác nhận đúng phiên bản đề</label>
        <button disabled={busy}>Xác nhận và xử lý lại bài</button>
      </form>}
    <h4>Câu trả lời đã đọc</h4>
    {s.answers?.map(answer => <details key={answer.id}><summary>Câu {answer.questionKey} — {answer.observationState}</summary><Content value={answer.content} />{canProcess && typeof answer.content === 'object' && answer.content !== null && 'selectedOptionId' in answer.content && <form className="assessment-controls" onSubmit={e => { e.preventDefault(); const form = new FormData(e.currentTarget); void run(() => assessmentApi.correctAnswer(a.id, s, answer.questionKey, answer.id, { ...answer.content as object, selectedOptionId: String(form.get('option')), ambiguityCodes: [] }, String(form.get('reason')))); }}><label>Lựa chọn cuối cùng đã đọc<input name="option" defaultValue={String((answer.content as { selectedOptionId: unknown }).selectedOptionId || '')} required /></label><label>Lý do xác nhận lựa chọn<input name="reason" required /></label><button disabled={busy}>Sửa lựa chọn và chấm lại</button></form>}{canProcess && typeof answer.content === 'object'  && answer.content !== null && 'text' in answer.content && <form onSubmit={e => { e.preventDefault(); const form = new FormData(e.currentTarget); void run(() => assessmentApi.correctAnswer(a.id, s, answer.questionKey, answer.id, { ...answer.content as object, text: String(form.get('text')) }, String(form.get('reason')))); }}><label>Nội dung đọc chính xác<textarea name="text" defaultValue={String((answer.content as { text: unknown }).text)} required /></label><label>Lý do sửa<input name="reason" required /></label><button disabled={busy}>Lưu và xử lý lại câu</button></form>}</details>)}
    {canProcess && a.externalTextEnabled && !s.manualOnly && s.publication?.state !== 'active' &&
      <ExternalTextReview key={`${s.id}:${s.inputRevision}:${review?.id ?? ''}`} assessmentId={a.id} submission={s} busy={busy} run={run} />}
    {s.manualOnly && <p>Bài này được chấm thủ công.</p>}
    {editable && !s.manualOnly && s.publication?.state !== 'active' &&
      <details><summary>Chọn chấm thủ công cho bài này</summary>
        <p>Thao tác này dừng các lượt xử lý tự động mới cho bài và yêu cầu tạo kết quả chấm thủ công.</p>
        <button disabled={busy} onClick={() => void run(() => assessmentApi.selectManualOnly(a.id, s))}>Xác nhận chấm thủ công</button>
      </details>}
    <h4>Kết quả đề xuất</h4>{review ? <><Content value={review.effectiveResults} />{review.flags.map((f, i) => <p key={i} role={f.severity === 'blocking' ? 'alert' : undefined}>{f.severity === 'blocking' ? 'Cần xử lý' : 'Lưu ý'} {f.questionKey || ''}: {f.message} ({assessmentLabel(f.resolutionState || 'open')})</p>)}{review.ungradedMaxUnits > 0 && <p>Chưa đánh giá {unitsToPoints(review.ungradedMaxUnits)} điểm. Không quy phần thiếu thành 0.</p>}</> : <p>Chưa có bản đánh giá để duyệt.</p>}
    {editable && review && <form className="assessment-controls" onSubmit={e => { e.preventDefault(); const form = new FormData(e.currentTarget); void run(() => assessmentApi.review(a.id, s, [{ questionKey: String(form.get('question')), earnedUnits: pointsToUnits(Number(form.get('score'))), reason: String(form.get('reason')) }])); }}><label>Câu cần sửa điểm<input name="question" pattern="[A-Za-z0-9_.-]+" required /></label><label>Điểm điều chỉnh<input name="score" type="number" min="0" max={unitsToPoints(a.maxScoreUnits)} step="0.001" required /></label><label>Lý do điều chỉnh<input name="reason" required /></label><button disabled={busy}>Lưu điều chỉnh điểm</button></form>}
    {editable && review?.flags.filter(f => ['grading_disagreement', 'insufficient_evidence', 'low_confidence', 'short_answer_unclear', 'unreadable_evidence'].includes(f.code) && f.resolutionState !== 'resolved' && f.questionKey).map(f => <form key={`${f.code}:${f.questionKey}`} className="assessment-controls" onSubmit={e => { e.preventDefault(); const form = new FormData(e.currentTarget); const reason = String(form.get('reason')); void run(() => assessmentApi.review(a.id, s, [{ questionKey: f.questionKey!, earnedUnits: pointsToUnits(Number(form.get('score'))), reason }], [{ code: f.code, questionKey: f.questionKey!, action: 'confirm_score', reason }])); }}><p>Kiểm tra bằng chứng và xác nhận điểm câu {f.questionKey}: {f.message}</p><label>Điểm sau khi kiểm tra<input name="score" type="number" min="0" max={unitsToPoints(a.maxScoreUnits)} step="0.001" required /></label><label>Lý do xác nhận<input name="reason" required /></label>{proposedUnits(review, f.questionKey!) !== null && <button type="button" disabled={busy} onClick={() => { const reason = 'Giáo viên đã kiểm tra bằng chứng và đồng ý điểm AI đề xuất.'; void run(() => assessmentApi.review(a.id, s, [{ questionKey: f.questionKey!, earnedUnits: proposedUnits(review, f.questionKey!)!, reason }], [{ code: f.code, questionKey: f.questionKey!, action: 'confirm_score', reason }])); }}>Đồng ý điểm AI đề xuất ({unitsToPoints(proposedUnits(review, f.questionKey!)!)} điểm)</button>}<button disabled={busy}>Xác nhận điểm và xử lý cảnh báo</button></form>)}
    {editable && review?.flags.filter(f => f.code === 'drawing_review_required' && f.resolutionState !== 'resolved' && f.questionKey).map(f => <form key={f.questionKey} className="assessment-controls" onSubmit={e => { e.preventDefault(); const form = new FormData(e.currentTarget); const reason = String(form.get('reason')); void run(() => assessmentApi.review(a.id, s, [{ questionKey: f.questionKey!, earnedUnits: pointsToUnits(Number(form.get('score'))), reason }], [{ code: 'drawing_review_required', questionKey: f.questionKey!, action: 'confirm_drawing', reason }])); }}><p>Giáo viên cần kiểm tra trực tiếp hình câu {f.questionKey} và cho điểm theo rubric.</p><label>Điểm hình đã kiểm tra<input name="score" type="number" min="0" max={unitsToPoints(a.maxScoreUnits)} step="0.001" required /></label><label>Nhận xét kiểm tra hình<input name="reason" required /></label><button disabled={busy}>Xác nhận hình và lưu điểm</button></form>)}
    {editable && s.uploadReady && <ManualReview assessment={a} submission={s} busy={busy} run={run} />}
    {reviewVersion && <details><summary>Đáp án và tiêu chí của mã đề {reviewVersion.examCode}</summary><Content value={reviewVersion.document} /></details>}
    {s.reviewApproved && <p>Đã duyệt bản hiện tại</p>}
    {editable && review && !s.reviewApproved && <button
      disabled={busy || !canApproveReview(s)}
      onClick={() => void run(() => assessmentApi.approveReview(a.id, s, a.contextRevision))}
    >Xác nhận đã kiểm tra và duyệt bài này</button>}
    {s.publishedReview && s.publishedReview.id !== review?.id && <details><summary>Bản điểm đã công bố trước đó</summary><Content value={s.publishedReview.effectiveResults} /></details>}
    {canWithdraw && s.publication?.state === 'active' && <form className="assessment-controls" onSubmit={e => { e.preventDefault(); const reason = String(new FormData(e.currentTarget).get('withdrawReason')); void run(() => assessmentApi.withdraw(a.id, s.publication!.id, s.publication!.revision, reason)); }}><label>Lý do rút điểm<input name="withdrawReason" required /></label><button disabled={busy}>Rút điểm khỏi sổ</button></form>}
  </article>;
}

function ManualReview({ assessment, submission, busy, run }: {
  assessment: Assessment;
  submission: AssessmentSubmission;
  busy: boolean;
  run: (action: () => Promise<unknown>) => Promise<void>;
}) {
  const [versionId, setVersionId] = useState('');
  const versions = assessment.examVersions?.filter(version => version.state === 'approved') ?? [];
  if (!versions.length) return null;
  const version = versions.find(item => item.id === versionId);
  const questions = version?.document.questions as { questionKey: string; text: string; maxUnits: number }[] | undefined;
  return <details className="assessment-panel">
    <summary>Chấm thủ công từ bài gốc</summary>
    {assessment.capabilities.canProcess !== false && submission.uploads?.filter(asset => asset.state === 'sealed').map(asset =>
      <EvidenceLink key={asset.id} assessmentId={assessment.id} assetId={asset.id} />)}
    <form key={versionId} className="assessment-controls" onSubmit={event => {
      event.preventDefault();
      if (!version || !questions?.length) return;
      const values = new FormData(event.currentTarget);
      const scores = questions.map(question => ({
        questionKey: question.questionKey,
        earnedUnits: pointsToUnits(Number(values.get(question.questionKey))),
      }));
      void run(() => assessmentApi.manualReview(assessment.id, submission, version, String(values.get('reason')), scores));
    }}>
      <label>Đề đã duyệt<select value={versionId} required onChange={event => setVersionId(event.target.value)}>
        <option value="">Chọn đúng mã đề</option>
        {versions.map(item => <option key={item.id} value={item.id}>Mã {item.examCode} · Phiên bản {item.versionNumber}</option>)}
      </select></label>
      {questions?.map(question => <label key={question.questionKey}>
        Câu {question.questionKey} · {question.text} · Tối đa {unitsToPoints(question.maxUnits)} điểm
        <input name={question.questionKey} type="number" min="0" max={unitsToPoints(question.maxUnits)} step="0.001" required />
      </label>)}
      <label>Lý do chấm thủ công<input name="reason" maxLength={1000} required /></label>
      <button disabled={busy || !questions?.length}>Lưu bản chấm thủ công</button>
    </form>
  </details>;
}

function EvidenceLink({ assessmentId, assetId }: { assessmentId: string; assetId: string }) {
  const [url, setUrl] = usePrivateArtifactUrl();
  const [error, setError] = useState('');
  return <div><button onClick={() => { setError(''); void assessmentApi.access(assessmentId, assetId).then(result => setUrl(result.url)).catch(e => setError(message(e))); }}>Lấy liên kết bản gốc riêng tư</button>{url && <a href={url} target="_blank" rel="noopener noreferrer" referrerPolicy="no-referrer"> Mở bản gốc riêng tư</a>}{error && <p role="alert">{error}</p>}</div>;
}

/** Press N (outside form fields) to open the next submission that still needs the teacher. */
function NextShortcut({ enabled, onNext }: { enabled: boolean; onNext: () => void }) {
  useEffect(() => {
    if (!enabled) return;
    const onKey = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement | null;
      if (event.altKey || event.ctrlKey || event.metaKey || target?.closest?.('input, textarea, select, [contenteditable="true"]')) return;
      if (event.key === 'n' || event.key === 'N') { event.preventDefault(); onNext(); }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [enabled, onNext]);
  return null;
}
