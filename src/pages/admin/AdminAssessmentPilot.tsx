import { useState, type FormEvent } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { FlaskConical, Loader2 } from 'lucide-react';
import { assessmentApi } from '@/api/assessment.api';
import { listClasses, listSubjects } from '@/api/school.api';
import type { PilotScope, PilotSchoolCatalog, PilotState } from '@/types/assessment.types';

const STATE_LABELS: Record<PilotState, string> = { active: 'Đang mở', paused: 'Tạm dừng', closed: 'Đóng' };
const STATE_STYLE: Record<PilotState, string> = { active: 'text-emerald-300', paused: 'text-amber-300', closed: 'text-slate-400' };
const field = 'w-full rounded-xl border border-white/10 bg-black/30 px-3 py-2 text-sm text-white';

function errorText(error: unknown) {
  const response = (error as { response?: { status?: number; data?: { error?: string; message?: string | string[] } } })?.response;
  if (response?.data?.error === 'ASSESSMENT_STALE_REVISION') return 'Phạm vi này vừa được người khác đổi. Đã tải lại danh sách, vui lòng thao tác lại.';
  if (response?.status === 404) return 'Không tìm thấy lớp hoặc môn này trong trường.';
  const m = response?.data?.message;
  return Array.isArray(m) ? m.join('. ') : m || 'Không lưu được. Vui lòng thử lại.';
}

/**
 * ADMIN: open, pause or close automatic grading per class × subject.
 * A missing row means closed; reopening re-queues only jobs the pause stopped.
 */
export default function AdminAssessmentPilot() {
  const qc = useQueryClient();
  const scopes = useQuery<{ items: PilotScope[]; schools?: PilotSchoolCatalog[] }>({
    queryKey: ['assessments', 'pilot-scopes'],
    queryFn: async () =>
      assessmentApi.pilotCatalog
        ? assessmentApi.pilotCatalog()
        : { items: await assessmentApi.pilotScopes() },
  });
  const catalogSchools = scopes.data?.schools;
  const classes = useQuery({
    queryKey: ['school', 'classes'],
    queryFn: listClasses,
    enabled: !catalogSchools?.length,
  });
  const subjects = useQuery({
    queryKey: ['school', 'subjects'],
    queryFn: listSubjects,
    enabled: !catalogSchools?.length,
  });
  const [schoolId, setSchoolId] = useState('');
  const [classId, setClassId] = useState('');
  const [subjectId, setSubjectId] = useState('');
  const [state, setState] = useState<PilotState>('active');
  const [reason, setReason] = useState('');
  const [notice, setNotice] = useState('');
  const activeSchool = catalogSchools?.find((s) => s.id === schoolId) ?? catalogSchools?.[0];
  const classOptions = activeSchool ? activeSchool.classes : (classes.data ?? []);
  const subjectOptions = activeSchool ? activeSchool.subjects : (subjects.data ?? []);
  const items = scopes.data?.items ?? [];
  const multiSchool = (catalogSchools?.length ?? 0) > 1 || new Set(items.map((s) => s.schoolId)).size > 1;
  const existing = items.find((s) => s.classId === classId && s.subjectId === subjectId);

  const save = useMutation({
    mutationFn: (body: Parameters<typeof assessmentApi.setPilotScope>[0]) => assessmentApi.setPilotScope(body),
    onSuccess: (row) => {
      const meta = row as PilotScope & { requeuedJobs?: number; parkedJobs?: number };
      const requeued = meta.requeuedJobs ?? 0;
      const parked = meta.parkedJobs ?? 0;
      const extra = requeued
        ? ` ${requeued} việc đang chờ đã được chạy lại.`
        : parked
          ? ` ${parked} việc đang chờ đã tạm dừng.`
          : '';
      setNotice(`Đã chuyển sang "${STATE_LABELS[row.state]}".${extra}`);
      setReason('');
    },
    onError: () => setNotice(''),
    onSettled: () => qc.invalidateQueries({ queryKey: ['assessments', 'pilot-scopes'] }),
  });

  const submit = (e: FormEvent) => {
    e.preventDefault();
    if (!classId || !subjectId || reason.trim().length < 3) return;
    save.mutate({ classId, subjectId, state, reason: reason.trim(), ...(existing ? { expectedRevision: existing.revision } : {}) });
  };
  const pick = (s: PilotScope) => {
    setSchoolId(s.schoolId);
    setClassId(s.classId);
    setSubjectId(s.subjectId);
    setState(s.state === 'active' ? 'paused' : 'active');
    setNotice('');
  };

  return (
    <div className="mx-auto max-w-5xl space-y-6 p-4 sm:p-6">
      <header>
        <h1 className="flex items-center gap-2 text-2xl font-black text-white"><FlaskConical size={24} /> Thí điểm chấm bài tự động</h1>
        <p className="text-sm text-slate-400">Chỉ lớp × môn đang mở mới được tải bài, xử lý và gọi model. Tạm dừng vẫn cho giáo viên sửa, duyệt điểm đã có, rút điểm và tải báo cáo cũ. Chưa có dòng nghĩa là đang đóng.</p>
      </header>

      <form onSubmit={submit} className="grid gap-3 rounded-2xl border border-white/10 bg-black/25 p-4 sm:grid-cols-2" aria-label="Đổi trạng thái thí điểm">
        {catalogSchools && catalogSchools.length > 1 && (
          <label className="space-y-1 text-sm font-bold text-slate-300 sm:col-span-2">Trường
            <select
              className={field}
              value={activeSchool?.id ?? ''}
              onChange={(e) => {
                setSchoolId(e.target.value);
                setClassId('');
                setSubjectId('');
              }}
            >
              {catalogSchools.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
            </select>
          </label>
        )}
        <label className="space-y-1 text-sm font-bold text-slate-300">Lớp
          <select className={field} value={classId} onChange={(e) => setClassId(e.target.value)} required>
            <option value="">Chọn lớp</option>
            {classOptions.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
        </label>
        <label className="space-y-1 text-sm font-bold text-slate-300">Môn
          <select className={field} value={subjectId} onChange={(e) => setSubjectId(e.target.value)} required>
            <option value="">Chọn môn</option>
            {subjectOptions.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
          </select>
        </label>
        <label className="space-y-1 text-sm font-bold text-slate-300">Trạng thái mới
          <select className={field} value={state} onChange={(e) => setState(e.target.value as PilotState)}>
            {(Object.keys(STATE_LABELS) as PilotState[]).map((k) => <option key={k} value={k}>{STATE_LABELS[k]}</option>)}
          </select>
        </label>
        <label className="space-y-1 text-sm font-bold text-slate-300">Lý do (bắt buộc, ghi vào nhật ký)
          <input className={field} value={reason} onChange={(e) => setReason(e.target.value)} minLength={3} maxLength={500} required />
        </label>
        <div className="flex flex-wrap items-center gap-3 sm:col-span-2">
          <button type="submit" disabled={save.isPending || !classId || !subjectId || reason.trim().length < 3}
            className="rounded-xl bg-cyan-500 px-4 py-2 text-sm font-black text-black disabled:opacity-50">
            {save.isPending ? 'Đang lưu…' : 'Lưu trạng thái'}
          </button>
          {classId && subjectId && <span className="text-xs text-slate-400">Hiện tại: {existing ? STATE_LABELS[existing.state] : 'Đóng (chưa có dòng)'}</span>}
          {notice && <span role="status" className="text-sm font-semibold text-emerald-300">{notice}</span>}
          {save.isError && <span role="alert" className="text-sm font-semibold text-rose-300">{errorText(save.error)}</span>}
        </div>
        <p className="text-xs text-slate-500 sm:col-span-2">
          {activeSchool ? `Đang thao tác trên trường: ${activeSchool.name}.` : 'Danh sách lớp và môn lấy từ trường của tài khoản đang đăng nhập.'}
        </p>
      </form>

      {scopes.isPending && <p role="status" className="flex items-center gap-2 text-slate-400"><Loader2 className="animate-spin" size={16} /> Đang tải…</p>}
      {scopes.isError && <p role="alert" className="text-rose-300">Chưa tải được danh sách thí điểm.</p>}
      {scopes.data && (items.length === 0
        ? <p className="text-sm text-slate-400">Chưa mở thí điểm cho lớp nào.</p>
        : (
          <div className="overflow-x-auto rounded-2xl border border-white/10">
            <table className="w-full min-w-[640px] text-left text-sm" aria-label="Các phạm vi thí điểm">
              <thead className="bg-white/5 text-xs uppercase tracking-widest text-slate-400">
                <tr>{multiSchool && <th className="px-4 py-3">Trường</th>}<th className="px-4 py-3">Lớp</th><th className="px-4 py-3">Môn</th><th className="px-4 py-3">Trạng thái</th><th className="px-4 py-3">Lý do gần nhất</th><th className="px-4 py-3">Cập nhật</th><th className="px-4 py-3"><span className="sr-only">Thao tác</span></th></tr>
              </thead>
              <tbody>
                {items.map((s) => (
                  <tr key={s.id} className="border-t border-white/5 font-semibold text-slate-200">
                    {multiSchool && <td className="px-4 py-3">{s.schoolName ?? s.schoolId}</td>}
                    <td className="px-4 py-3">{s.className ?? s.classId}</td>
                    <td className="px-4 py-3">{s.subjectName ?? s.subjectId}</td>
                    <td className={`px-4 py-3 ${STATE_STYLE[s.state]}`}>{STATE_LABELS[s.state]}</td>
                    <td className="px-4 py-3 text-slate-400">{s.reason}</td>
                    <td className="px-4 py-3 text-slate-400">{new Date(s.updatedAt).toLocaleString('vi-VN')}</td>
                    <td className="px-4 py-3"><button type="button" onClick={() => pick(s)} className="rounded-lg bg-white/5 px-3 py-1 text-xs font-bold text-cyan-300">Đổi</button></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ))}
    </div>
  );
}
