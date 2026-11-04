import {AssessmentEvidence} from './AssessmentEvidence';
import {pointsToUnits,unitsToPoints,assessmentLabel} from './assessmentScores';
import { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { assessmentApi } from '@/api/assessment.api';
import type { Assessment, AssessmentSubmission, ExamVersion, FinalizationItem } from '@/types/assessment.types';
import { canFinalizeReview } from './assessmentReview';
import './AssessmentsPage.css';
import { ExamKeyEditor } from './ExamKeyEditor';

function message(error: unknown) {
  const response = (error as { response?: { data?: { message?: string | string[] } } })?.response;
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
  const qc = useQueryClient();
  const list = useQuery({ queryKey: ['assessments', 'list', classId, subjectId, listPage], queryFn: () => assessmentApi.list(classId, subjectId, listPage), enabled: !!context.data?.enabled });
  const selectedClass = context.data?.classes.find(c => c.id === classId);
  const run = async (action: () => Promise<unknown>) => {
    setBusy(true); setError('');
    try { await action(); await qc.invalidateQueries({ queryKey: ['assessments'] }); } catch (e) { setError(message(e)); } finally { setBusy(false); }
  };
  if (context.isPending) return <p role="status">Đang tải lớp và môn được phân công…</p>;
  if (context.isError) return <div role="alert">Không tải được chức năng chấm bài. <button onClick={() => void context.refetch()}>Thử lại</button></div>;
  if (!context.data.enabled) return <div className="assessment-page"><h1>Chấm bài AI</h1><p>Chấm bài AI chưa được bật tại trường.</p></div>;
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
      <button disabled={busy || !classId || !subjectId} type="submit">Tạo đợt chấm</button>
    </form>}
    {list.isError ? <p role="alert">Không tải được danh sách đợt chấm.</p> : <div className="assessment-controls">{list.data?.items.map(a => <button key={a.id} aria-pressed={activeId === a.id} onClick={() => setActiveId(a.id)}>{a.title}</button>)}</div>}
    {list.data && list.data.total > 100 && <div className="assessment-controls"><button disabled={listPage === 1} onClick={() => setListPage(p => p - 1)}>Đợt chấm trước</button><span>Trang {listPage}</span><button disabled={listPage * 100 >= list.data.total} onClick={() => setListPage(p => p + 1)}>Đợt chấm tiếp</button></div>}
    {activeId && <AssessmentDetail key={activeId} id={activeId} run={run} busy={busy} />}
  </main>;
}
function AssessmentDetail({ id, run, busy }: { id: string; run: (action: () => Promise<unknown>) => Promise<void>; busy: boolean }) {
  const [submissionPage, setSubmissionPage] = useState(1);
  const detail = useQuery({ queryKey: ['assessments', id], queryFn: () => assessmentApi.detail(id), refetchInterval: 5000 });
  const submissions = useQuery({ queryKey: ['assessments', id, 'submissions', submissionPage], queryFn: () => assessmentApi.submissions(id, submissionPage), refetchInterval: 5000 });
  const progress = useQuery({ queryKey: ['assessments', id, 'progress'], queryFn: () => assessmentApi.progress(id), refetchInterval: 5000 });
  const roster = useQuery({ queryKey: ['assessments', id, 'roster'], queryFn: () => assessmentApi.roster(detail.data!.classId, detail.data!.subjectId), enabled: !!detail.data });
  const [openId, setOpenId] = useState('');
  const [exportId,setExportId]=useState('');
  const [downloadUrl,setDownloadUrl]=useState('');
  const exportStatus=useQuery({queryKey:['assessments',id,'export',exportId],queryFn:()=>assessmentApi.exportStatus(id,exportId),enabled:!!exportId,refetchInterval:query=>query.state.data?.state==='completed'||query.state.data?.state==='failed'?false:3000});
  const [acknowledged, setAcknowledged] = useState<Record<string, string>>({});
  const [outcomes, setOutcomes] = useState<string[]>([]);
  if (detail.isError || submissions.isError) return <p role="alert">Không tải được đợt chấm. Vui lòng thử lại.</p>;
  if (!detail.data || !submissions.data) return <p role="status">Đang tải bài…</p>;
  const a = detail.data;
  const rows = submissions.data.items;
  const writable = !a.archivedAt;
  const eligible = rows.filter(s => canFinalizeReview(s, acknowledged[s.id]));
  async function finalize() {
    const items: FinalizationItem[] = eligible.slice(0, 50).map(s => ({ submissionId: s.id, expectedInputRevision: s.inputRevision, expectedReviewRevisionId: s.currentReview!.id, expectedReviewHash: s.currentReview!.contentHash, expectedContextRevision: a.contextRevision, expectedPublicationRevision: s.publication?.revision ?? null, identityAcknowledgement: { studentId: s.studentId!, expectedIdentityRevision: s.identityRevision } }));
    const result = await assessmentApi.finalize(id, items, crypto.randomUUID());
    setOutcomes(result.items.map(item => `${rows.find(s => s.id === item.submissionId)?.displayName || 'Bài nộp'}: ${({ finalized: 'Đã ghi sổ điểm', already_finalized: 'Đã ghi sổ trước đó', blocked: 'Cần xử lý thêm', conflict: 'Dữ liệu đã thay đổi', not_found: 'Không tìm thấy bài' } as Record<string, string>)[item.outcome] || item.outcome}${item.message ? ` — ${item.message}` : ''}`));
    setAcknowledged({});
  }
  return <section className="assessment-panel"><h2>{a.title}</h2>
    {!writable && <p>Đợt chấm đã lưu trữ — chỉ xem.</p>}
    {progress.isError && <p role="alert">Chưa tải được tiến độ; dữ liệu hiển thị có thể chưa cập nhật.</p>}
    <p role="status">{Object.entries(progress.data?.counts || {}).map(([stage, count]) => `${assessmentLabel(stage)}: ${count}`).join(' · ') || 'Chưa có tiến độ xử lý'}</p>
    {progress.data?.warnings?.map((w, i) => <p key={i}>{w}</p>)}
    {progress.data?.jobs?.filter(j => ['failed','paused'].includes(j.state)).map(j => <div key={j.id}>Xử lý thất bại: {j.lastErrorCode || 'Cần kiểm tra'} {writable && a.capabilities.canProcess && <button disabled={busy} onClick={() => void run(() => assessmentApi.retry(id, j.id))}>Thử lại công việc</button>}</div>)}
    {writable && a.capabilities.canProcess && <>
      <form className="assessment-controls" onSubmit={e => { e.preventDefault(); const form = e.currentTarget; const data = new FormData(form); const files = data.getAll('files').filter((f): f is File => f instanceof File && f.size > 0); void run(async () => { const student = Number(data.get('student')); const s = await assessmentApi.createSubmission(id, student || undefined); for (const file of files) await assessmentApi.upload(id, s.id, file); form.reset(); }); }}>
        <label>Học sinh của nhóm bài<select name="student"><option value="">Xác định sau khi đọc bài</option>{roster.data?.map(s => <option key={s.id} value={s.id}>{s.displayName}{s.studentCode ? ` — ${s.studentCode}` : ''}</option>)}</select></label>
        <label>Ảnh hoặc PDF cùng một bài học sinh<input type="file" name="files" accept="image/jpeg,image/png,application/pdf" multiple required /></label><button disabled={busy}>Tải nhóm bài</button>
      </form><p>Mỗi lần tải là một nhóm của một học sinh, gồm cả trang đề và phần trả lời. Chờ xác minh tệp trước khi xử lý.</p>
      <button disabled={busy || rows.length === 0} onClick={() => void run(() => assessmentApi.process(id, rows))}>Bắt đầu xử lý</button>
    </>}
    <h3>Đề và đáp án theo mã đề</h3>
    {!a.examVersions?.length && <p>Chưa trích xuất được đề và đáp án. Tải đầy đủ trang đề để xử lý.</p>}
    {a.examVersions?.map(version => <ExamPanel key={version.id} assessment={a} version={version} busy={busy} run={run} />)}
    {writable && a.capabilities.canFinalize && <button disabled={busy} onClick={()=>setAcknowledged(Object.fromEntries(rows.filter(s=>canFinalizeReview(s,s.currentReview?.contentHash)).map(s=>[s.id,s.currentReview!.contentHash])))}>Chọn các bài đủ điều kiện trên trang</button>}
    <h3>Bài học sinh</h3><div className="assessment-table"><table><thead><tr><th>Chọn chốt</th><th>Học sinh</th><th>Trạng thái</th><th>Điểm đã đánh giá</th><th>Kiểm tra</th></tr></thead><tbody>{rows.map(s => <tr key={s.id}><td><input type="checkbox" aria-label={`Chọn bài của ${s.displayName || 'học sinh chưa xác định'}`} disabled={!writable || !a.capabilities.canFinalize || !canFinalizeReview(s,s.currentReview?.contentHash)} checked={!!s.currentReview && acknowledged[s.id]===s.currentReview.contentHash} onChange={e=>setAcknowledged(old=>{const next={...old};if(e.target.checked&&s.currentReview)next[s.id]=s.currentReview.contentHash;else delete next[s.id];return next;})} /></td><td>{s.displayName || 'Chưa xác định'}<br /><small>{assessmentLabel(s.identityState)}</small></td><td>{assessmentLabel(s.processingState)}</td><td>{s.currentReview?.earnedUnits == null ? 'Chưa có kết quả' : `${unitsToPoints(s.currentReview.earnedUnits)}/${unitsToPoints(a.maxScoreUnits)}${s.currentReview.ungradedMaxUnits ? ' (chưa đầy đủ)' : ''}`}{s.publication?.state === 'active' && <p>Đã ghi sổ điểm</p>}</td><td><button onClick={() => setOpenId(s.id)}>Mở bài</button>{acknowledged[s.id] && <p>Đã kiểm tra bản hiện tại</p>}</td></tr>)}</tbody></table></div>
    {submissions.data.total > 100 && <div className="assessment-controls"><button disabled={submissionPage === 1} onClick={() => setSubmissionPage(p => p - 1)}>Bài trước</button><span>Trang {submissionPage}</span><button disabled={submissionPage * 100 >= submissions.data.total} onClick={() => setSubmissionPage(p => p + 1)}>Bài tiếp</button></div>}
    {openId && <SubmissionPanel key={openId} assessment={a} sid={openId} roster={roster.data || []} run={run} busy={busy} acknowledge={(s, checked) => setAcknowledged(old => { const next = { ...old }; if (checked && s.currentReview) next[s.id] = s.currentReview.contentHash; else delete next[s.id]; return next; })} />}
    {writable && a.capabilities.canFinalize && <button disabled={busy || !eligible.length} onClick={() => void run(finalize)}>Chốt {Math.min(eligible.length, 50)} bài đã kiểm tra vào sổ điểm</button>}
    <div className="assessment-controls">{(['xlsx','pdf'] as const).map(format=><button key={format} disabled={busy} onClick={()=>void run(async()=>{const result=await assessmentApi.requestExport(id,format);setExportId(result.exportId);setDownloadUrl('');})}>Xuất {format==='xlsx'?'Excel':'PDF'} điểm đã công bố</button>)}{exportId && exportStatus.data?.state!=='completed' && <span role="status">Đang chuẩn bị báo cáo…</span>}{exportStatus.data?.state==='completed' && <button onClick={()=>void run(async()=>setDownloadUrl((await assessmentApi.exportAccess(id,exportId)).url))}>Lấy liên kết tải báo cáo</button>}{downloadUrl && <a href={downloadUrl} target="_blank" rel="noopener noreferrer" referrerPolicy="no-referrer">Tải báo cáo</a>}</div>
    {outcomes.map((o, i) => <p role="status" key={i}>{o}</p>)}
  </section>;
}
function ExamPanel({ assessment: a, version, busy, run }: { assessment: Assessment; version: ExamVersion; busy: boolean; run: (fn: () => Promise<unknown>) => Promise<void> }) {
  const [checked, setChecked] = useState(false);
  return <details className="assessment-panel"><summary>Mã đề {version.examCode} — {version.state === 'approved' ? 'Đã duyệt' : version.state === 'draft' ? 'Chờ duyệt' : 'Bản cũ'}</summary><Content value={version.document} />
    {a.capabilities.canReview && !a.archivedAt && <details><summary>Sửa đáp án và thang điểm</summary><ExamKeyEditor key={version.gradingSpecHash} document={version.document} busy={busy} save={document => void run(() => assessmentApi.draftExam(a.id, version.examCode, document))} /></details>}
    {version.state === 'draft' && a.capabilities.canReview && !a.archivedAt && <><label><input type="checkbox" checked={checked} onChange={e => setChecked(e.target.checked)} /> Tôi đã kiểm tra nội dung, đáp án và thang điểm mã đề này</label><button disabled={busy || !checked} onClick={() => void run(() => assessmentApi.approveExam(a.id, version))}>Duyệt đáp án mã {version.examCode}</button></>}
  </details>;
}
function SubmissionPanel({ assessment: a, sid, roster, run, busy, acknowledge }: { assessment: Assessment; sid: string; roster: { id: number; displayName: string }[]; run: (fn: () => Promise<unknown>) => Promise<void>; busy: boolean; acknowledge: (s: AssessmentSubmission, checked: boolean) => void }) {
  const data = useQuery({ queryKey: ['assessments', a.id, 'submission', sid], queryFn: () => assessmentApi.submission(a.id, sid), refetchInterval: 5000 });
  const [checkedHash, setCheckedHash] = useState('');
  if (data.isError) return <p role="alert">Không tải được nội dung bài. Chưa thể xác nhận kiểm tra.</p>;
  const s = data.data;
  if (!s) return <p>Đang mở bài…</p>;
  const review = s.currentReview;
  const editable = a.capabilities.canReview && !a.archivedAt;
  return <article className="assessment-panel"><h3>Kiểm tra bài: {s.displayName || 'Chưa xác định học sinh'}</h3>
    {editable && <form className="assessment-controls" onSubmit={e => { e.preventDefault(); const id = Number(new FormData(e.currentTarget).get('identity')); void run(() => assessmentApi.identity(a.id, s, id)); }}><label>Xác nhận học sinh<select name="identity" required defaultValue={s.studentId || ''}><option value="">Chọn học sinh trong lớp</option>{roster.map(r => <option value={r.id} key={r.id}>{r.displayName}</option>)}</select></label><button disabled={busy}>Xác nhận danh tính</button></form>}
    {a.capabilities.canProcess && !a.archivedAt && <form className="assessment-controls" onSubmit={e => { e.preventDefault(); const form = e.currentTarget; const files = new FormData(form).getAll('files').filter((file): file is File => file instanceof File && file.size > 0); void run(async () => { for (const file of files) await assessmentApi.upload(a.id, s.id, file); form.reset(); }); }}><label>Bổ sung trang cho đúng bài này<input name="files" type="file" accept="image/jpeg,image/png,application/pdf" multiple required /></label><button disabled={busy}>Tải thêm trang</button></form>}
    <h4>Trang bài và bằng chứng</h4>{s.pages?.map(page => <div key={page.id} className="assessment-panel"><p>Trang {page.sourcePageNumber || 1} — {page.pageRole || 'Chưa phân loại'}</p><EvidenceLink assessmentId={a.id} assetId={page.assetId} /><AssessmentEvidence assessmentId={a.id} page={page} inputRevision={s.inputRevision} editable={!!editable} busy={busy} run={run} />{page.regions?.map(region => <p key={region.id}>{region.text || 'Vùng hình hoặc bảng: xem bản gốc để đối chiếu'}</p>)}</div>)}
    <h4>Câu trả lời đã đọc</h4>
    {s.answers?.map(answer => <details key={answer.id}><summary>Câu {answer.questionKey} — {answer.observationState}</summary><Content value={answer.content} />{editable && typeof answer.content === 'object' && answer.content !== null && 'selectedOptionId' in answer.content && <form className="assessment-controls" onSubmit={e => { e.preventDefault(); const form = new FormData(e.currentTarget); void run(() => assessmentApi.correctAnswer(a.id, s, answer.questionKey, answer.id, { ...answer.content as object, selectedOptionId: String(form.get('option')), ambiguityCodes: [] }, String(form.get('reason')))); }}><label>Lựa chọn cuối cùng đã đọc<input name="option" defaultValue={String((answer.content as { selectedOptionId: unknown }).selectedOptionId || '')} required /></label><label>Lý do xác nhận lựa chọn<input name="reason" required /></label><button disabled={busy}>Sửa lựa chọn và chấm lại</button></form>}{editable && typeof answer.content === 'object'  && answer.content !== null && 'text' in answer.content && <form onSubmit={e => { e.preventDefault(); const form = new FormData(e.currentTarget); void run(() => assessmentApi.correctAnswer(a.id, s, answer.questionKey, answer.id, { ...answer.content as object, text: String(form.get('text')) }, String(form.get('reason')))); }}><label>Nội dung đọc chính xác<textarea name="text" defaultValue={String((answer.content as { text: unknown }).text)} required /></label><label>Lý do sửa<input name="reason" required /></label><button disabled={busy}>Lưu và xử lý lại câu</button></form>}</details>)}
    <h4>Kết quả đề xuất</h4>{review ? <><Content value={review.effectiveResults} />{review.flags.map((f, i) => <p key={i} role={f.severity === 'blocking' ? 'alert' : undefined}>{f.severity === 'blocking' ? 'Cần xử lý' : 'Lưu ý'} {f.questionKey || ''}: {f.message} ({assessmentLabel(f.resolutionState || 'open')})</p>)}{review.ungradedMaxUnits > 0 && <p>Chưa đánh giá {unitsToPoints(review.ungradedMaxUnits)} điểm. Không quy phần thiếu thành 0.</p>}</> : <p>Chưa có bản đánh giá để duyệt.</p>}
    {editable && review && <form className="assessment-controls" onSubmit={e => { e.preventDefault(); const form = new FormData(e.currentTarget); void run(() => assessmentApi.review(a.id, s, [{ questionKey: String(form.get('question')), earnedUnits: pointsToUnits(Number(form.get('score'))), reason: String(form.get('reason')) }])); }}><label>Câu cần sửa điểm<input name="question" pattern="[A-Za-z0-9_.-]+" required /></label><label>Điểm điều chỉnh<input name="score" type="number" min="0" max={unitsToPoints(a.maxScoreUnits)} step="0.001" required /></label><label>Lý do điều chỉnh<input name="reason" required /></label><button disabled={busy}>Lưu điều chỉnh điểm</button></form>}
    {editable && review?.flags.filter(f => ['grading_disagreement', 'insufficient_evidence', 'unreadable_evidence'].includes(f.code) && f.resolutionState !== 'resolved' && f.questionKey).map(f => <form key={`${f.code}:${f.questionKey}`} className="assessment-controls" onSubmit={e => { e.preventDefault(); const form = new FormData(e.currentTarget); const reason = String(form.get('reason')); void run(() => assessmentApi.review(a.id, s, [{ questionKey: f.questionKey!, earnedUnits: pointsToUnits(Number(form.get('score'))), reason }], [{ code: f.code, questionKey: f.questionKey!, action: 'confirm_score', reason }])); }}><p>Kiểm tra bằng chứng và xác nhận điểm câu {f.questionKey}: {f.message}</p><label>Điểm sau khi kiểm tra<input name="score" type="number" min="0" max={unitsToPoints(a.maxScoreUnits)} step="0.001" required /></label><label>Lý do xác nhận<input name="reason" required /></label><button disabled={busy}>Xác nhận điểm và xử lý cảnh báo</button></form>)}
    {editable && review?.flags.filter(f => f.code === 'drawing_review_required' && f.resolutionState !== 'resolved' && f.questionKey).map(f => <form key={f.questionKey} className="assessment-controls" onSubmit={e => { e.preventDefault(); const form = new FormData(e.currentTarget); const reason = String(form.get('reason')); void run(() => assessmentApi.review(a.id, s, [{ questionKey: f.questionKey!, earnedUnits: pointsToUnits(Number(form.get('score'))), reason }], [{ code: 'drawing_review_required', questionKey: f.questionKey!, action: 'confirm_drawing', reason }])); }}><p>Giáo viên cần kiểm tra trực tiếp hình câu {f.questionKey} và cho điểm theo rubric.</p><label>Điểm hình đã kiểm tra<input name="score" type="number" min="0" max={unitsToPoints(a.maxScoreUnits)} step="0.001" required /></label><label>Nhận xét kiểm tra hình<input name="reason" required /></label><button disabled={busy}>Xác nhận hình và lưu điểm</button></form>)}
    {review && <label><input type="checkbox" checked={checkedHash === review.contentHash} disabled={!canFinalizeReview(s, review.contentHash)} onChange={e => { setCheckedHash(e.target.checked ? review.contentHash : ''); acknowledge(s, e.target.checked); }} /> Tôi đã kiểm tra danh tính, đáp án, bằng chứng và điểm của bài này</label>}
    {s.publishedReview && s.publishedReview.id !== review?.id && <details><summary>Bản điểm đã công bố trước đó</summary><Content value={s.publishedReview.effectiveResults} /></details>}
    {a.capabilities.canFinalize && !a.archivedAt && s.publication?.state === 'active' && <form className="assessment-controls" onSubmit={e => { e.preventDefault(); const reason = String(new FormData(e.currentTarget).get('withdrawReason')); void run(() => assessmentApi.withdraw(a.id, s.publication!.id, s.publication!.revision, reason)); }}><label>Lý do rút điểm<input name="withdrawReason" required /></label><button disabled={busy}>Rút điểm khỏi sổ</button></form>}
  </article>;
}

function EvidenceLink({ assessmentId, assetId }: { assessmentId: string; assetId: string }) {
  const [url, setUrl] = useState('');
  const [error, setError] = useState('');
  return <div><button onClick={() => { setError(''); void assessmentApi.access(assessmentId, assetId).then(result => setUrl(result.url)).catch(e => setError(message(e))); }}>Lấy liên kết bản gốc riêng tư</button>{url && <a href={url} target="_blank" rel="noopener noreferrer" referrerPolicy="no-referrer"> Mở bản gốc (liên kết có hạn)</a>}{error && <p role="alert">{error}</p>}</div>;
}
