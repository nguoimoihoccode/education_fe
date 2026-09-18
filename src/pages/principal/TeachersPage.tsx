import { useState } from 'react';
import {
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { Loader2, Plus, Trash2, UserCog, X } from 'lucide-react';
import {
  listTeachers,
  listSubjects,
  listClasses,
  createAssignment,
  deleteAssignment,
} from '@/api/school.api';
import { QUERY_KEYS } from '@/config/query';
import type { CreateAssignmentDto } from '@/types/school.types';

const EMPTY_FORM: CreateAssignmentDto = { teacherId: 0, subjectId: '', classId: '' };

export default function TeachersPage() {
  const queryClient = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState<CreateAssignmentDto>(EMPTY_FORM);

  const { data: teachers = [], isLoading } = useQuery({
    queryKey: QUERY_KEYS.SCHOOL_TEACHERS,
    queryFn: listTeachers,
  });
  const subjectsQuery = useQuery({ queryKey: QUERY_KEYS.SCHOOL_SUBJECTS, queryFn: listSubjects });
  const classesQuery = useQuery({ queryKey: QUERY_KEYS.SCHOOL_CLASSES, queryFn: listClasses });

  const createAssignmentMutation = useMutation({
    mutationFn: createAssignment,
    onSuccess: async () => {
      toast.success('Đã phân công giáo viên');
      setShowForm(false);
      setForm(EMPTY_FORM);
      await queryClient.invalidateQueries({ queryKey: QUERY_KEYS.SCHOOL_ASSIGNMENTS });
      await queryClient.invalidateQueries({ queryKey: QUERY_KEYS.SCHOOL_TEACHERS });
      await queryClient.invalidateQueries({ queryKey: QUERY_KEYS.SCHOOL_STATS });
    },
    onError: (error: { message?: string }) => toast.error(error.message || 'Không phân công được'),
  });

  const deleteAssignmentMutation = useMutation({
    mutationFn: deleteAssignment,
    onSuccess: async () => {
      toast.success('Đã gỡ phân công');
      await queryClient.invalidateQueries({ queryKey: QUERY_KEYS.SCHOOL_ASSIGNMENTS });
      await queryClient.invalidateQueries({ queryKey: QUERY_KEYS.SCHOOL_TEACHERS });
    },
  });

  return (
    <main className="min-h-screen bg-slate-950 px-4 py-8 text-slate-100 sm:px-6 lg:px-8">
      <div className="pointer-events-none fixed inset-0 -z-0 bg-[radial-gradient(circle_at_top_left,rgba(34,211,238,0.16),transparent_32%),radial-gradient(circle_at_top_right,rgba(168,85,247,0.14),transparent_30%),linear-gradient(180deg,#020617,#0f172a)]" />
      <section className="relative z-10 mx-auto max-w-6xl space-y-6">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <h1 className="flex items-center gap-3 text-3xl font-black tracking-tight text-white">
              <UserCog className="h-8 w-8 text-accent-400" aria-hidden="true" /> Giáo viên & phân công
            </h1>
            <p className="mt-2 text-sm font-medium text-slate-400">
              Giáo viên xuất hiện ở đây sau khi được phân công môn dạy cho một lớp.
            </p>
          </div>
          <button
            type="button"
            onClick={() => setShowForm((v) => !v)}
            className="inline-flex items-center gap-2 rounded-2xl bg-accent-500 px-5 py-2.5 text-sm font-black text-on-accent transition-colors hover:bg-accent-400"
          >
            <Plus className="h-4 w-4" aria-hidden="true" /> Thêm phân công
          </button>
        </div>

        {showForm && (
          <form
            className="grid gap-3 rounded-3xl border border-white/10 bg-slate-900/70 p-5 sm:grid-cols-4"
            onSubmit={(event) => {
              event.preventDefault();
              if (!form.teacherId || !form.subjectId || !form.classId) {
                toast.error('Chọn đủ giáo viên, môn và lớp');
                return;
              }
              createAssignmentMutation.mutate(form);
            }}
          >
            <label className="space-y-1">
              <span className="text-xs font-black uppercase tracking-widest text-slate-500">Giáo viên</span>
              <select
                value={form.teacherId || ''}
                onChange={(e) => setForm((f) => ({ ...f, teacherId: Number(e.target.value) }))}
                className="min-h-11 w-full rounded-xl border border-white/10 bg-black/25 px-3 text-sm font-semibold text-white outline-none focus:border-accent-400/60"
              >
                <option value="">— chọn —</option>
                {teachers.map((t) => (
                  <option key={t.id} value={t.id}>{t.name || t.email}</option>
                ))}
              </select>
            </label>
            <label className="space-y-1">
              <span className="text-xs font-black uppercase tracking-widest text-slate-500">Môn</span>
              <select
                value={form.subjectId}
                onChange={(e) => setForm((f) => ({ ...f, subjectId: e.target.value }))}
                className="min-h-11 w-full rounded-xl border border-white/10 bg-black/25 px-3 text-sm font-semibold text-white outline-none focus:border-accent-400/60"
              >
                <option value="">— chọn —</option>
                {(subjectsQuery.data ?? []).filter((s) => s.active).map((s) => (
                  <option key={s.id} value={s.id}>{s.name}</option>
                ))}
              </select>
            </label>
            <label className="space-y-1">
              <span className="text-xs font-black uppercase tracking-widest text-slate-500">Lớp</span>
              <select
                value={form.classId}
                onChange={(e) => setForm((f) => ({ ...f, classId: e.target.value }))}
                className="min-h-11 w-full rounded-xl border border-white/10 bg-black/25 px-3 text-sm font-semibold text-white outline-none focus:border-accent-400/60"
              >
                <option value="">— chọn —</option>
                {(classesQuery.data ?? []).filter((c) => c.active).map((c) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </label>
            <div className="flex items-end gap-2">
              <button
                type="submit"
                disabled={createAssignmentMutation.isPending}
                className="min-h-11 flex-1 rounded-xl bg-accent-500 px-4 text-sm font-black text-on-accent transition-colors hover:bg-accent-400 disabled:opacity-50"
              >
                {createAssignmentMutation.isPending ? 'Đang lưu…' : 'Phân công'}
              </button>
              <button
                type="button"
                onClick={() => setShowForm(false)}
                aria-label="Hủy"
                className="min-h-11 rounded-xl border border-white/10 px-3 text-slate-400 hover:bg-white/5 hover:text-white"
              >
                <X className="h-5 w-5" aria-hidden="true" />
              </button>
            </div>
          </form>
        )}

        {isLoading ? (
          <div className="flex justify-center py-16 text-slate-500">
            <Loader2 className="h-8 w-8 animate-spin" />
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2">
            {teachers.length === 0 && (
              <div className="rounded-3xl border border-dashed border-white/10 p-10 text-center text-sm font-medium text-slate-500 sm:col-span-2">
                Chưa có giáo viên nào được phân công. Bấm "Thêm phân công" để gán môn dạy cho giáo viên.
              </div>
            )}
            {teachers.map((teacher) => (
              <article
                key={teacher.id}
                className="rounded-3xl border border-white/10 bg-slate-900/70 p-5 backdrop-blur-xl"
              >
                <header className="flex items-center justify-between">
                  <div>
                    <h2 className="text-lg font-black text-white">{teacher.name || '(chưa có tên)'}</h2>
                    <p className="text-xs font-medium text-slate-500">{teacher.email} · ID {teacher.id}</p>
                  </div>
                  <span className="rounded-full border border-accent-400/30 bg-accent-400/10 px-3 py-1 text-xs font-black text-accent-200">
                    {teacher.assignments.length} phân công
                  </span>
                </header>
                <ul className="mt-3 space-y-1.5">
                  {teacher.assignments.map((a) => (
                    <li key={a.assignmentId} className="flex items-center justify-between gap-2 rounded-lg bg-black/25 px-3 py-1.5 text-sm">
                      <span className="font-semibold text-slate-200">
                        {a.subjectName} · lớp {a.className}
                      </span>
                      <button
                        type="button"
                        onClick={() => deleteAssignmentMutation.mutate(a.assignmentId)}
                        aria-label={`Gỡ phân công ${a.subjectName} lớp ${a.className}`}
                        className="rounded-lg p-1.5 text-slate-500 transition-colors hover:text-rose-300"
                      >
                        <Trash2 className="h-4 w-4" aria-hidden="true" />
                      </button>
                    </li>
                  ))}
                </ul>
              </article>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}
