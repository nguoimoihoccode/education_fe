import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { BookOpen, Loader2, Pencil, Plus, Trash2, X } from 'lucide-react';
import {
  listSubjects,
  createSubject,
  updateSubject,
  deleteSubject,
} from '@/api/school.api';
import { QUERY_KEYS } from '@/config/query';
import type { CreateSubjectDto, Subject } from '@/types/school.types';

const EMPTY_FORM: CreateSubjectDto = { name: '', code: '', color: '#22d3ee', description: '' };

export default function SubjectsPage() {
  const queryClient = useQueryClient();
  const [editing, setEditing] = useState<Subject | null>(null);
  const [form, setForm] = useState<CreateSubjectDto>(EMPTY_FORM);
  const [showForm, setShowForm] = useState(false);

  const { data: subjects = [], isLoading } = useQuery({
    queryKey: QUERY_KEYS.SCHOOL_SUBJECTS,
    queryFn: listSubjects,
  });

  const saveSubject = useMutation({
    mutationFn: (dto: CreateSubjectDto) =>
      editing ? updateSubject(editing.id, dto) : createSubject(dto),
    onSuccess: async () => {
      toast.success(editing ? 'Đã cập nhật môn học' : 'Đã thêm môn học');
      closeForm();
      await queryClient.invalidateQueries({ queryKey: QUERY_KEYS.SCHOOL_SUBJECTS });
    },
    onError: (error: { message?: string }) => toast.error(error.message || 'Không lưu được'),
  });

  const removeSubject = useMutation({
    mutationFn: deleteSubject,
    onSuccess: async () => {
      toast.success('Đã xóa môn học');
      await queryClient.invalidateQueries({ queryKey: QUERY_KEYS.SCHOOL_SUBJECTS });
    },
    onError: (error: { message?: string }) => toast.error(error.message || 'Không xóa được'),
  });

  function openCreate() {
    setEditing(null);
    setForm(EMPTY_FORM);
    setShowForm(true);
  }

  function openEdit(subject: Subject) {
    setEditing(subject);
    setForm({
      name: subject.name,
      code: subject.code,
      color: subject.color ?? undefined,
      description: subject.description ?? undefined,
    });
    setShowForm(true);
  }

  function closeForm() {
    setShowForm(false);
    setEditing(null);
    setForm(EMPTY_FORM);
  }

  return (
    <main className="min-h-screen bg-slate-950 px-4 py-8 text-slate-100 sm:px-6 lg:px-8">
      <div className="pointer-events-none fixed inset-0 -z-0 bg-[radial-gradient(circle_at_top_left,rgba(34,211,238,0.16),transparent_32%),radial-gradient(circle_at_top_right,rgba(168,85,247,0.14),transparent_30%),linear-gradient(180deg,#020617,#0f172a)]" />
      <section className="relative z-10 mx-auto max-w-5xl space-y-6">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <h1 className="flex items-center gap-3 text-3xl font-black tracking-tight text-white">
              <BookOpen className="h-8 w-8 text-accent-400" aria-hidden="true" /> Môn học
            </h1>
            <p className="mt-2 text-sm font-medium text-slate-400">
              Danh sách môn của trường. Môn đang được phân công sẽ được lưu trữ (archive) thay vì xóa hẳn.
            </p>
          </div>
          <button
            type="button"
            onClick={openCreate}
            className="inline-flex items-center gap-2 rounded-2xl bg-accent-500 px-5 py-2.5 text-sm font-black text-white transition-colors hover:bg-accent-400"
          >
            <Plus className="h-4 w-4" aria-hidden="true" /> Thêm môn
          </button>
        </div>

        {isLoading ? (
          <div className="flex justify-center py-16 text-slate-500">
            <Loader2 className="h-8 w-8 animate-spin" />
          </div>
        ) : (
          <div className="overflow-hidden rounded-3xl border border-white/10 bg-slate-900/70 backdrop-blur-xl">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-white/5 text-xs font-black uppercase tracking-widest text-slate-500">
                <tr>
                  <th className="px-5 py-4">Môn</th>
                  <th className="px-5 py-4">Mã</th>
                  <th className="hidden px-5 py-4 sm:table-cell">Mô tả</th>
                  <th className="px-5 py-4">Trạng thái</th>
                  <th className="px-5 py-4 text-right">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {subjects.length === 0 && (
                  <tr>
                    <td colSpan={5} className="px-5 py-10 text-center font-medium text-slate-500">
                      Chưa có môn học nào. Bấm "Thêm môn" để bắt đầu.
                    </td>
                  </tr>
                )}
                {subjects.map((subject) => (
                  <tr key={subject.id} className="transition-colors hover:bg-white/5">
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <span
                          className="h-4 w-4 flex-shrink-0 rounded-full border border-white/20"
                          style={{ background: subject.color ?? '#64748b' }}
                          aria-hidden="true"
                        />
                        <span className="font-black text-white">{subject.name}</span>
                      </div>
                    </td>
                    <td className="px-5 py-4 font-mono text-xs font-bold text-accent-200">{subject.code}</td>
                    <td className="hidden max-w-xs truncate px-5 py-4 text-slate-400 sm:table-cell">
                      {subject.description || '—'}
                    </td>
                    <td className="px-5 py-4">
                      <span
                        className={`rounded-full border px-2.5 py-0.5 text-[11px] font-black uppercase tracking-wider ${
                          subject.active
                            ? 'border-emerald-400/30 bg-emerald-400/10 text-emerald-300'
                            : 'border-slate-500/30 bg-slate-500/10 text-slate-400'
                        }`}
                      >
                        {subject.active ? 'Đang dùng' : 'Lưu trữ'}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex justify-end gap-2">
                        <button
                          type="button"
                          onClick={() => openEdit(subject)}
                          aria-label={`Sửa môn ${subject.name}`}
                          className="rounded-xl border border-white/10 p-2 text-slate-300 transition-colors hover:border-accent-400/50 hover:text-accent-200"
                        >
                          <Pencil className="h-4 w-4" aria-hidden="true" />
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            if (window.confirm(`Xóa môn "${subject.name}"?`)) removeSubject.mutate(subject.id);
                          }}
                          aria-label={`Xóa môn ${subject.name}`}
                          className="rounded-xl border border-white/10 p-2 text-slate-300 transition-colors hover:border-rose-400/50 hover:text-rose-300"
                        >
                          <Trash2 className="h-4 w-4" aria-hidden="true" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm">
          <div className="w-full max-w-lg rounded-3xl border border-white/10 bg-slate-900 p-6 shadow-2xl">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-black text-white">
                {editing ? `Sửa môn ${editing.name}` : 'Thêm môn học'}
              </h2>
              <button
                type="button"
                onClick={closeForm}
                aria-label="Đóng"
                className="rounded-xl p-2 text-slate-400 hover:bg-white/5 hover:text-white"
              >
                <X className="h-5 w-5" aria-hidden="true" />
              </button>
            </div>

            <form
              className="mt-5 space-y-4"
              onSubmit={(event) => {
                event.preventDefault();
                if (!form.name.trim() || !form.code.trim()) {
                  toast.error('Tên và mã môn là bắt buộc');
                  return;
                }
                saveSubject.mutate({
                  ...form,
                  name: form.name.trim(),
                  code: form.code.trim().toUpperCase(),
                });
              }}
            >
              <label className="block space-y-1.5">
                <span className="text-xs font-black uppercase tracking-widest text-slate-500">Tên môn *</span>
                <input
                  value={form.name}
                  onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                  placeholder="Toán, Ngữ văn, Tiếng Anh…"
                  className="min-h-11 w-full rounded-xl border border-white/10 bg-black/25 px-3 text-sm font-semibold text-white outline-none focus:border-accent-400/60"
                />
              </label>
              <div className="grid gap-4 sm:grid-cols-2">
                <label className="block space-y-1.5">
                  <span className="text-xs font-black uppercase tracking-widest text-slate-500">Mã môn *</span>
                  <input
                    value={form.code}
                    onChange={(e) => setForm((f) => ({ ...f, code: e.target.value }))}
                    placeholder="TOAN"
                    className="min-h-11 w-full rounded-xl border border-white/10 bg-black/25 px-3 font-mono text-sm font-semibold text-white outline-none focus:border-accent-400/60"
                  />
                </label>
                <label className="block space-y-1.5">
                  <span className="text-xs font-black uppercase tracking-widest text-slate-500">Màu hiển thị</span>
                  <input
                    type="color"
                    value={form.color ?? '#22d3ee'}
                    onChange={(e) => setForm((f) => ({ ...f, color: e.target.value }))}
                    className="min-h-11 w-full cursor-pointer rounded-xl border border-white/10 bg-black/25 px-2 py-2"
                  />
                </label>
              </div>
              <label className="block space-y-1.5">
                <span className="text-xs font-black uppercase tracking-widest text-slate-500">Mô tả</span>
                <textarea
                  value={form.description ?? ''}
                  onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                  rows={3}
                  className="w-full rounded-xl border border-white/10 bg-black/25 px-3 py-2 text-sm font-semibold text-white outline-none focus:border-accent-400/60"
                />
              </label>
              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={closeForm}
                  className="rounded-xl border border-white/10 px-4 py-2.5 text-sm font-black text-slate-300 hover:bg-white/5"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={saveSubject.isPending}
                  className="rounded-xl bg-accent-500 px-5 py-2.5 text-sm font-black text-white hover:bg-accent-400 disabled:opacity-50"
                >
                  {saveSubject.isPending ? 'Đang lưu…' : 'Lưu'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </main>
  );
}
