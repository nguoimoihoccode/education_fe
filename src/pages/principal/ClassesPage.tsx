import { useMemo, useState } from 'react';
import {
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query';
import toast from 'react-hot-toast';
import {
  Copy, Loader2, Plus, Trash2, UserPlus, Users, X,
} from 'lucide-react';
import {
  listClasses,
  createClass,
  deleteClass,
  listAcademicYears,
  listTeachers,
  getClassStudents,
  addClassStudents,
  removeClassStudent,
} from '@/api/school.api';
import { QUERY_KEYS } from '@/config/query';
import type { AddStudentsResult, CreateClassDto } from '@/types/school.types';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function parseEmailBlock(raw: string): Array<{ email: string }> {
  const seen = new Set<string>();
  return raw
    .split(/[\n,;]+/)
    .map((line) => line.trim().toLowerCase())
    .filter((line) => line.length > 0)
    .map((line) => {
      // tolerate "Nguyễn Văn A, a@x.vn" — take the email token
      const token = line.split(/\s+/).find((t) => EMAIL_RE.test(t));
      return token ?? (EMAIL_RE.test(line) ? line : null);
    })
    .filter((email): email is string => email !== null)
    .filter((email) => (seen.has(email) ? false : (seen.add(email), true)))
    .map((email) => ({ email }));
}

const SKIP_REASONS: Record<string, string> = {
  user_not_found: 'tài khoản chưa tồn tại',
  already_in_class: 'đã trong lớp này',
  creation_failed: 'không tạo được tài khoản',
};

function skipReasonLabel(reason: string): string {
  if (reason.startsWith('already_in_class:')) {
    return `đã thuộc lớp ${reason.split(':')[1]}`;
  }
  return SKIP_REASONS[reason] ?? reason;
}

export default function ClassesPage() {
  const queryClient = useQueryClient();
  const [showCreate, setShowCreate] = useState(false);
  const [selectedClassId, setSelectedClassId] = useState<string | null>(null);

  const classesQuery = useQuery({ queryKey: QUERY_KEYS.SCHOOL_CLASSES, queryFn: listClasses });
  const yearsQuery = useQuery({ queryKey: QUERY_KEYS.SCHOOL_ACADEMIC_YEARS, queryFn: listAcademicYears });
  const teachersQuery = useQuery({ queryKey: QUERY_KEYS.SCHOOL_TEACHERS, queryFn: listTeachers });

  const selectedClass = useMemo(
    () => classesQuery.data?.find((c) => c.id === selectedClassId) ?? null,
    [classesQuery.data, selectedClassId],
  );

  const rosterQuery = useQuery({
    queryKey: selectedClassId ? QUERY_KEYS.CLASS_STUDENTS(selectedClassId) : ['school', 'classes', 'none', 'students'],
    queryFn: () => getClassStudents(selectedClassId as string),
    enabled: !!selectedClassId,
  });

  const [form, setForm] = useState<CreateClassDto>({ name: '', grade: 6, academicYearId: '' });
  const [rosterInput, setRosterInput] = useState('');
  const [existingOnly, setExistingOnly] = useState(false);
  const [credentials, setCredentials] = useState<AddStudentsResult['created'] | null>(null);
  const [skipped, setSkipped] = useState<AddStudentsResult['skipped'] | null>(null);

  const activeYear = yearsQuery.data?.find((y) => y.isActive) ?? yearsQuery.data?.[0];

  const createClassMutation = useMutation({
    mutationFn: createClass,
    onSuccess: async () => {
      toast.success('Đã tạo lớp');
      setShowCreate(false);
      setForm({ name: '', grade: 6, academicYearId: '' });
      await queryClient.invalidateQueries({ queryKey: QUERY_KEYS.SCHOOL_CLASSES });
    },
    onError: (error: { message?: string }) => toast.error(error.message || 'Không tạo được lớp'),
  });

  const deleteClassMutation = useMutation({
    mutationFn: deleteClass,
    onSuccess: async () => {
      toast.success('Đã xóa lớp');
      setSelectedClassId(null);
      await queryClient.invalidateQueries({ queryKey: QUERY_KEYS.SCHOOL_CLASSES });
    },
    onError: (error: { message?: string }) => toast.error(error.message || 'Không xóa được lớp'),
  });

  const removeStudentMutation = useMutation({
    mutationFn: ({ classId, studentId }: { classId: string; studentId: number }) =>
      removeClassStudent(classId, studentId),
    onSuccess: async () => {
      toast.success('Đã cho học sinh rời lớp');
      if (selectedClassId) {
        await queryClient.invalidateQueries({ queryKey: QUERY_KEYS.CLASS_STUDENTS(selectedClassId) });
        await queryClient.invalidateQueries({ queryKey: QUERY_KEYS.SCHOOL_CLASSES });
        await queryClient.invalidateQueries({ queryKey: QUERY_KEYS.SCHOOL_STATS });
      }
    },
  });

  function submitAddStudents() {
    if (!selectedClassId) return;
    const entries = parseEmailBlock(rosterInput);
    if (entries.length === 0) {
      toast.error('Không tìm thấy email hợp lệ trong danh sách');
      return;
    }
    addStudentsMutation.mutate({ entries, existingOnly });
  }

  const addStudentsMutation = useMutation({
    mutationFn: ({ entries, existingOnly }: { entries: Array<{ email: string }>; existingOnly: boolean }) =>
      addClassStudents(selectedClassId as string, { students: entries, existingOnly }),
    onSuccess: async (result: AddStudentsResult) => {
      const okCount = result.added.length + result.created.length;
      if (okCount > 0) {
        toast.success(`Đã thêm ${okCount} học sinh${result.skipped.length ? `, bỏ qua ${result.skipped.length}` : ''}`);
      } else {
        toast.error('Không thêm được học sinh nào');
      }
      setRosterInput('');
      if (result.created.length > 0) setCredentials(result.created);
      if (result.skipped.length > 0) setSkipped(result.skipped);
      if (selectedClassId) {
        await queryClient.invalidateQueries({ queryKey: QUERY_KEYS.CLASS_STUDENTS(selectedClassId) });
        await queryClient.invalidateQueries({ queryKey: QUERY_KEYS.SCHOOL_CLASSES });
        await queryClient.invalidateQueries({ queryKey: QUERY_KEYS.SCHOOL_STATS });
      }
    },
    onError: (error: { message?: string }) => toast.error(error.message || 'Không thêm được học sinh'),
  });

  function copyAllCredentials() {
    if (!credentials) return;
    const text = credentials
      .map((c) => `${c.email}\t${c.temporaryPassword}`)
      .join('\n');
    void navigator.clipboard.writeText(text).then(
      () => toast.success('Đã sao chép email + mật khẩu tạm thời'),
      () => toast.error('Trình duyệt chặn clipboard — hãy copy thủ công'),
    );
  }

  return (
    <main className="min-h-screen bg-slate-950 px-4 py-8 text-slate-100 sm:px-6 lg:px-8">
      <div className="pointer-events-none fixed inset-0 -z-0 bg-[radial-gradient(circle_at_top_left,rgba(34,211,238,0.16),transparent_32%),radial-gradient(circle_at_top_right,rgba(168,85,247,0.14),transparent_30%),linear-gradient(180deg,#020617,#0f172a)]" />
      <section className="relative z-10 mx-auto grid max-w-7xl gap-6 lg:grid-cols-5">
        <div className={`${selectedClass ? 'lg:col-span-2' : 'lg:col-span-5'} space-y-6`}>
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <h1 className="flex items-center gap-3 text-3xl font-black tracking-tight text-white">
                <Users className="h-8 w-8 text-accent-400" aria-hidden="true" /> Lớp học
              </h1>
              <p className="mt-2 text-sm font-medium text-slate-400">
                Chọn một lớp để xem và quản lý danh sách học sinh.
              </p>
            </div>
            <button
              type="button"
              onClick={() => setShowCreate((v) => !v)}
              className="inline-flex items-center gap-2 rounded-2xl bg-accent-500 px-5 py-2.5 text-sm font-black text-on-accent transition-colors hover:bg-accent-400"
            >
              <Plus className="h-4 w-4" aria-hidden="true" /> Tạo lớp
            </button>
          </div>

          {showCreate && (
            <form
              className="space-y-3 rounded-3xl border border-white/10 bg-slate-900/70 p-5"
              onSubmit={(event) => {
                event.preventDefault();
                const yearId = form.academicYearId || activeYear?.id;
                if (!form.name.trim() || !yearId) {
                  toast.error('Cần tên lớp và năm học');
                  return;
                }
                createClassMutation.mutate({ ...form, name: form.name.trim(), academicYearId: yearId });
              }}
            >
              <div className="grid gap-3 sm:grid-cols-3">
                <input
                  value={form.name}
                  onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                  placeholder="Tên lớp (VD: 6A1)"
                  className="min-h-11 rounded-xl border border-white/10 bg-black/25 px-3 text-sm font-semibold text-white outline-none focus:border-accent-400/60"
                />
                <input
                  type="number"
                  min={0}
                  max={12}
                  value={form.grade}
                  onChange={(e) => setForm((f) => ({ ...f, grade: Number(e.target.value) }))}
                  placeholder="Khối (0-12)"
                  className="min-h-11 rounded-xl border border-white/10 bg-black/25 px-3 text-sm font-semibold text-white outline-none focus:border-accent-400/60"
                />
                <input
                  type="number"
                  min={1}
                  value={form.maxStudents ?? ''}
                  onChange={(e) => setForm((f) => ({ ...f, maxStudents: e.target.value ? Number(e.target.value) : undefined }))}
                  placeholder="Chỉ tiêu (bỏ trống = ∞)"
                  className="min-h-11 rounded-xl border border-white/10 bg-black/25 px-3 text-sm font-semibold text-white outline-none focus:border-accent-400/60"
                />
              </div>
              <div className="grid gap-3 sm:grid-cols-3">
                <input
                  value={form.room ?? ''}
                  onChange={(e) => setForm((f) => ({ ...f, room: e.target.value || undefined }))}
                  placeholder="Phòng (VD: A204)"
                  className="min-h-11 rounded-xl border border-white/10 bg-black/25 px-3 text-sm font-semibold text-white outline-none focus:border-accent-400/60"
                />
                <select
                  value={form.academicYearId || activeYear?.id || ''}
                  onChange={(e) => setForm((f) => ({ ...f, academicYearId: e.target.value }))}
                  className="min-h-11 rounded-xl border border-white/10 bg-black/25 px-3 text-sm font-semibold text-white outline-none focus:border-accent-400/60"
                >
                  {(yearsQuery.data ?? []).map((year) => (
                    <option key={year.id} value={year.id}>
                      Năm học {year.name}
                    </option>
                  ))}
                </select>
                <select
                  value={form.homeroomTeacherId ?? ''}
                  onChange={(e) => setForm((f) => ({ ...f, homeroomTeacherId: e.target.value ? Number(e.target.value) : undefined }))}
                  className="min-h-11 rounded-xl border border-white/10 bg-black/25 px-3 text-sm font-semibold text-white outline-none focus:border-accent-400/60"
                >
                  <option value="">GVCN: chưa chọn</option>
                  {(teachersQuery.data ?? []).map((teacher) => (
                    <option key={teacher.id} value={teacher.id}>
                      {teacher.name || teacher.email}
                    </option>
                  ))}
                </select>
              </div>
              <p className="text-xs font-medium text-slate-500">
                Danh sách GVCN chỉ gồm giáo viên đã được phân công môn — sau khi tạo lớp, có thể thêm phân công ở trang Giáo viên.
              </p>
              <button
                type="submit"
                disabled={createClassMutation.isPending || (yearsQuery.data ?? []).length === 0}
                className="w-full rounded-xl bg-accent-500 px-4 py-2.5 text-sm font-black text-on-accent transition-colors hover:bg-accent-400 disabled:opacity-50"
              >
                {(yearsQuery.data ?? []).length === 0
                  ? 'Cần tạo năm học trước (trang Tổng quan)'
                  : createClassMutation.isPending ? 'Đang tạo…' : 'Tạo lớp'}
              </button>
            </form>
          )}

          {classesQuery.isLoading ? (
            <div className="flex justify-center py-16 text-slate-500">
              <Loader2 className="h-8 w-8 animate-spin" />
            </div>
          ) : (classesQuery.data ?? []).length === 0 ? (
            <div className="rounded-3xl border border-dashed border-white/10 p-10 text-center text-sm font-medium text-slate-500">
              Chưa có lớp nào. Tạo lớp đầu tiên để bắt đầu nhận học sinh.
            </div>
          ) : (
            <ul className="grid gap-3 sm:grid-cols-2">
              {(classesQuery.data ?? [])
                .filter((c) => c.active)
                .map((cls) => (
                  <li key={cls.id}>
                    <div
                      role="button"
                      tabIndex={0}
                      onClick={() => setSelectedClassId(cls.id)}
                      onKeyDown={(e) => e.key === 'Enter' && setSelectedClassId(cls.id)}
                      className={`cursor-pointer rounded-2xl border p-4 transition-colors ${
                        selectedClassId === cls.id
                          ? 'border-accent-400/60 bg-accent-400/10'
                          : 'border-white/10 bg-slate-900/70 hover:border-accent-400/40'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-lg font-black text-white">{cls.name}</span>
                        <span className="text-xs font-black text-slate-400">Khối {cls.grade}</span>
                      </div>
                      <div className="mt-2 space-y-1 text-xs font-medium text-slate-400">
                        <p>
                          {cls.studentCount ?? 0} HS
                          {cls.maxStudents ? ` / ${cls.maxStudents}` : ''}
                          {cls.room ? ` · Phòng ${cls.room}` : ''}
                        </p>
                        <p>GVCN: {cls.homeroomTeacher?.name || cls.homeroomTeacher?.email || 'chưa có'}</p>
                      </div>
                    </div>
                  </li>
                ))}
            </ul>
          )}
        </div>

        {/* ---------- roster ---------- */}
        {selectedClass && (
          <div className="space-y-5 lg:col-span-3">
            <div className="rounded-3xl border border-white/10 bg-slate-900/70 p-5">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => setSelectedClassId(null)}
                    aria-label="Đóng danh sách"
                    className="rounded-xl p-1.5 text-slate-400 hover:bg-white/5 hover:text-white"
                  >
                    <X className="h-5 w-5" aria-hidden="true" />
                  </button>
                  <h2 className="text-2xl font-black text-white">Lớp {selectedClass.name}</h2>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    if (window.confirm(`Xóa lớp ${selectedClass.name}? Lớp có học sinh sẽ được lưu trữ thay vì xóa hẳn.`)) {
                      deleteClassMutation.mutate(selectedClass.id);
                    }
                  }}
                  className="inline-flex items-center gap-1.5 rounded-xl border border-white/10 px-3 py-1.5 text-xs font-black uppercase tracking-widest text-slate-400 hover:border-rose-400/50 hover:text-rose-300"
                >
                  <Trash2 className="h-4 w-4" aria-hidden="true" /> Xóa lớp
                </button>
              </div>

              {/* bulk add */}
              <div className="mt-4 space-y-3">
                <label className="block space-y-1.5">
                  <span className="text-xs font-black uppercase tracking-widest text-slate-500">
                    Dán danh sách email học sinh (mỗi dòng 1 email)
                  </span>
                  <textarea
                    rows={4}
                    value={rosterInput}
                    onChange={(e) => setRosterInput(e.target.value)}
                    placeholder={'an@x.vn\nbinh@x.vn\nChị C, chi.c@x.vn'}
                    className="w-full rounded-xl border border-white/10 bg-black/25 px-3 py-2 text-sm font-medium text-white outline-none focus:border-accent-400/60"
                  />
                </label>
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <label className="inline-flex items-center gap-2 text-xs font-bold text-slate-400">
                    <input
                      type="checkbox"
                      checked={existingOnly}
                      onChange={(e) => setExistingOnly(e.target.checked)}
                      className="h-4 w-4 rounded border-white/20 bg-black/25 accent-cyan-400"
                    />
                    Chỉ thêm tài khoản đã tồn tại
                  </label>
                  <button
                    type="button"
                    onClick={submitAddStudents}
                    disabled={addStudentsMutation.isPending}
                    className="inline-flex items-center gap-2 rounded-xl bg-accent-500 px-4 py-2 text-sm font-black text-on-accent transition-colors hover:bg-accent-400 disabled:opacity-50"
                  >
                    <UserPlus className="h-4 w-4" aria-hidden="true" />
                    {addStudentsMutation.isPending ? 'Đang thêm…' : 'Thêm vào lớp'}
                  </button>
                </div>
              </div>
            </div>

            {/* results: temp passwords */}
            {credentials && (
              <div className="rounded-3xl border border-emerald-400/30 bg-emerald-400/5 p-5">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-black uppercase tracking-widest text-emerald-300">
                    Tài khoản mới tạo — lưu lại mật khẩu tạm thời này
                  </h3>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={copyAllCredentials}
                      className="inline-flex items-center gap-1 rounded-lg border border-emerald-400/30 px-2.5 py-1 text-xs font-black text-emerald-300 hover:bg-emerald-400/10"
                    >
                      <Copy className="h-3.5 w-3.5" aria-hidden="true" /> Copy tất cả
                    </button>
                    <button
                      type="button"
                      onClick={() => setCredentials(null)}
                      aria-label="Đóng"
                      className="rounded-lg p-1 text-emerald-300 hover:bg-white/5"
                    >
                      <X className="h-4 w-4" aria-hidden="true" />
                    </button>
                  </div>
                </div>
                <ul className="mt-3 space-y-1.5 text-sm">
                  {credentials.map((c) => (
                    <li key={c.email} className="flex items-center justify-between gap-3 rounded-lg bg-black/25 px-3 py-1.5">
                      <span className="font-semibold text-white">{c.email}</span>
                      <code className="font-mono text-emerald-300">{c.temporaryPassword}</code>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* results: skipped */}
            {skipped && (
              <div className="rounded-3xl border border-amber-400/30 bg-amber-400/5 p-5">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-black uppercase tracking-widest text-amber-300">Bỏ qua ({skipped.length})</h3>
                  <button
                    type="button"
                    onClick={() => setSkipped(null)}
                    aria-label="Đóng"
                    className="rounded-lg p-1 text-amber-300 hover:bg-white/5"
                  >
                    <X className="h-4 w-4" aria-hidden="true" />
                  </button>
                </div>
                <ul className="mt-3 space-y-1.5 text-sm">
                  {skipped.map((s) => (
                    <li key={`${s.email}-${s.reason}`} className="flex items-center justify-between gap-3 rounded-lg bg-black/25 px-3 py-1.5">
                      <span className="font-semibold text-white">{s.email}</span>
                      <span className="text-amber-200/80">{skipReasonLabel(s.reason)}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* current roster */}
            <div className="overflow-hidden rounded-3xl border border-white/10 bg-slate-900/70">
              <table className="w-full text-left text-sm">
                <thead className="border-b border-white/5 text-xs font-black uppercase tracking-widest text-slate-500">
                  <tr>
                    <th className="px-5 py-3">Học sinh</th>
                    <th className="hidden px-5 py-3 sm:table-cell">Vào lớp</th>
                    <th className="px-5 py-3 text-right">Thao tác</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {rosterQuery.isLoading && (
                    <tr>
                      <td colSpan={3} className="flex justify-center py-8 text-slate-500">
                        <Loader2 className="h-6 w-6 animate-spin" />
                      </td>
                    </tr>
                  )}
                  {!rosterQuery.isLoading && (rosterQuery.data ?? []).length === 0 && (
                    <tr>
                      <td colSpan={3} className="px-5 py-8 text-center font-medium text-slate-500">
                        Lớp chưa có học sinh nào.
                      </td>
                    </tr>
                  )}
                  {(rosterQuery.data ?? []).map((row) => (
                    <tr key={row.membershipId} className="transition-colors hover:bg-white/5">
                      <td className="px-5 py-3">
                        <p className="font-black text-white">{row.student.name || '(chưa có tên)'}</p>
                        <p className="text-xs font-medium text-slate-500">{row.student.email}</p>
                      </td>
                      <td className="hidden px-5 py-3 text-xs font-medium text-slate-400 sm:table-cell">
                        {new Intl.DateTimeFormat('vi-VN').format(new Date(row.joinedAt))}
                      </td>
                      <td className="px-5 py-3 text-right">
                        <button
                          type="button"
                          onClick={() =>
                            removeStudentMutation.mutate({ classId: selectedClass.id, studentId: row.student.id })
                          }
                          aria-label={`Xóa ${row.student.email} khỏi lớp`}
                          className="rounded-xl border border-white/10 p-2 text-slate-400 transition-colors hover:border-rose-400/50 hover:text-rose-300"
                        >
                          <Trash2 className="h-4 w-4" aria-hidden="true" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </section>
    </main>
  );
}
