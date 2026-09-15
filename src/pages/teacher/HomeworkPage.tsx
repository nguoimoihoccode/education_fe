import { useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import {
  ArrowLeft, BookOpenCheck, CalendarClock, Layers, Loader2, Plus, Send,
  Sparkles, Trash2, X,
} from 'lucide-react';
import { getFlashcardDecks } from '@/api/flashcard.api';
import { getQuizzes } from '@/api/quiz.api';
import {
  createHomework,
  deleteHomework,
  listAssignments,
  listHomework,
  listSubjects,
} from '@/api/school.api';
import { QUERY_KEYS } from '@/config/query';
import { ROUTES } from '@/config/routes';
import { useAuthStore } from '@/store/auth.store';
import type { HomeworkTargetType } from '@/types/school.types';

function formatDue(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleString('vi-VN', {
    hour: '2-digit',
    minute: '2-digit',
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
}

/** datetime-local value → ISO string for BE (keeps the picked local wall time). */
function localInputToIso(value: string): string {
  const d = new Date(value);
  return Number.isNaN(d.getTime()) ? value : d.toISOString();
}

function defaultDueInput(): string {
  const d = new Date();
  d.setDate(d.getDate() + 3);
  d.setHours(20, 0, 0, 0);
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

interface HomeworkDraft {
  title: string;
  subjectId: string;
  targetType: HomeworkTargetType;
  targetId: string;
  dueDate: string;
  countsAsGrade: boolean;
}

const emptyDraft = (subjectId = ''): HomeworkDraft => ({
  title: '',
  subjectId,
  targetType: 'quiz',
  targetId: '',
  dueDate: defaultDueInput(),
  countsAsGrade: true,
});

/** Giao BTVN cho lớp từ quiz/deck có sẵn của Learning Hub (Phase 4, plan §4.3). */
export default function HomeworkPage() {
  const { id = '' } = useParams<{ id: string }>();
  const queryClient = useQueryClient();
  const userRoles = useAuthStore((state) => state.user?.roles ?? []);
  const isSchoolAdmin = useMemo(
    () => userRoles.includes('principal') || userRoles.includes('admin'),
    [userRoles],
  );
  const [draft, setDraft] = useState<HomeworkDraft | null>(null);

  const homeworkQuery = useQuery({
    queryKey: QUERY_KEYS.HOMEWORK,
    queryFn: () => listHomework({ classId: id }),
    enabled: !!id,
    retry: false,
  });

  const assignmentsQuery = useQuery({
    queryKey: QUERY_KEYS.SCHOOL_ASSIGNMENTS,
    queryFn: () => listAssignments({ classId: id }),
    enabled: !!id && !isSchoolAdmin,
  });
  const subjectsQuery = useQuery({
    queryKey: QUERY_KEYS.SCHOOL_SUBJECTS,
    queryFn: listSubjects,
    enabled: isSchoolAdmin,
  });

  const subjects = useMemo(() => {
    if (isSchoolAdmin) {
      return (subjectsQuery.data ?? [])
        .filter((s) => s.active)
        .map((s) => ({ id: s.id, name: s.name }));
    }
    const seen = new Set<string>();
    const rows: Array<{ id: string; name: string }> = [];
    for (const a of assignmentsQuery.data ?? []) {
      if (a.subject && !seen.has(a.subject.id)) {
        seen.add(a.subject.id);
        rows.push({ id: a.subject.id, name: a.subject.name });
      }
    }
    return rows;
  }, [isSchoolAdmin, subjectsQuery.data, assignmentsQuery.data]);

  // Target pickers — both Learning Hub lists are paginated {items}.
  const quizzesQuery = useQuery({
    queryKey: QUERY_KEYS.QUIZZES(1, 100),
    queryFn: () => getQuizzes({ page: 1, limit: 100 }),
    enabled: !!draft,
  });
  const decksQuery = useQuery({
    queryKey: QUERY_KEYS.FLASHCARD_DECKS,
    queryFn: () => getFlashcardDecks({ page: 1, limit: 100 }),
    enabled: !!draft,
  });

  const createMutation = useMutation({
    mutationFn: (d: HomeworkDraft) =>
      createHomework({
        classId: id,
        subjectId: d.subjectId,
        title: d.title.trim(),
        dueDate: localInputToIso(d.dueDate),
        targetType: d.targetType,
        targetId: d.targetId,
        // deck targets never count as a grade — BE forces it, mirror here
        countsAsGrade: d.targetType === 'quiz' && d.countsAsGrade,
      }),
    onSuccess: () => {
      toast.success('Đã giao bài tập cho lớp');
      setDraft(null);
      void queryClient.invalidateQueries({ queryKey: QUERY_KEYS.HOMEWORK });
    },
    onError: (error: { message?: string }) =>
      toast.error(error.message || 'Không giao được bài tập'),
  });

  const deleteMutation = useMutation({
    mutationFn: (hwId: string) => deleteHomework(hwId),
    onSuccess: () => {
      toast.success('Đã thu hồi bài tập');
      void queryClient.invalidateQueries({ queryKey: QUERY_KEYS.HOMEWORK });
    },
    onError: (error: { message?: string }) =>
      toast.error(error.message || 'Không thu hồi được bài tập'),
  });

  const rows = useMemo(
    () =>
      [...(homeworkQuery.data ?? [])].sort(
        (a, b) => new Date(b.dueDate).getTime() - new Date(a.dueDate).getTime(),
      ),
    [homeworkQuery.data],
  );

  const openCreate = () => setDraft(emptyDraft(subjects[0]?.id ?? ''));
  const now = Date.now();

  return (
    <main className="min-h-screen bg-slate-950 px-4 py-8 text-slate-100 sm:px-6 lg:px-8">
      <div className="pointer-events-none fixed inset-0 -z-0 bg-[radial-gradient(circle_at_top_left,rgba(34,211,238,0.16),transparent_32%),radial-gradient(circle_at_top_right,rgba(168,85,247,0.14),transparent_30%),linear-gradient(180deg,#020617,#0f172a)]" />
      <section className="relative z-10 mx-auto max-w-5xl space-y-6">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <Link
              to={ROUTES.TEACHING_CLASS(id)}
              className="inline-flex items-center gap-1.5 text-sm font-bold text-slate-400 transition-colors hover:text-accent-200"
            >
              <ArrowLeft className="h-4 w-4" aria-hidden="true" /> Lớp chủ nhiệm
            </Link>
            <h1 className="mt-2 flex items-center gap-2 text-3xl font-black tracking-tight text-white">
              <BookOpenCheck className="h-7 w-7 text-accent-400" aria-hidden="true" />
              Giao bài tập về nhà
            </h1>
            <p className="mt-1 text-sm font-medium text-slate-500">
              Chọn quiz hoặc bộ flashcard có sẵn trong Learning Hub, đặt hạn nộp — học sinh thấy
              ngay ở "Trường của tôi".
            </p>
          </div>
          <button
            type="button"
            onClick={openCreate}
            disabled={subjects.length === 0}
            title={subjects.length === 0 ? 'Chưa có môn nào để giao' : undefined}
            className="inline-flex items-center gap-1.5 rounded-2xl bg-accent-500 px-4 py-2.5 text-sm font-black text-white transition-colors hover:bg-accent-400 disabled:opacity-50"
          >
            <Plus className="h-4 w-4" aria-hidden="true" /> Giao bài mới
          </button>
        </div>

        {/* ---------- list ---------- */}
        <div className="rounded-3xl border border-white/10 bg-slate-900/70 backdrop-blur-xl">
          {homeworkQuery.isLoading ? (
            <div className="flex justify-center py-16 text-slate-500">
              <Loader2 className="h-8 w-8 animate-spin" />
            </div>
          ) : rows.length === 0 ? (
            <div className="p-10 text-center">
              <BookOpenCheck className="mx-auto h-8 w-8 text-slate-700" aria-hidden="true" />
              <p className="mt-2 text-sm font-medium text-slate-500">
                {subjects.length === 0
                  ? 'Bạn chưa dạy môn nào ở lớp này — hiệu trưởng thêm phân công trước.'
                  : 'Chưa giao bài tập nào. Bấm "Giao bài mới" để bắt đầu.'}
              </p>
            </div>
          ) : (
            <ul className="divide-y divide-white/5">
              {rows.map((hw) => {
                const past = new Date(hw.dueDate).getTime() < now;
                return (
                  <li key={hw.id} className="flex flex-wrap items-center gap-3 px-5 py-4">
                    <span
                      className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl border ${
                        hw.targetType === 'quiz'
                          ? 'border-emerald-400/30 bg-emerald-400/10 text-emerald-300'
                          : 'border-sky-400/30 bg-sky-400/10 text-sky-300'
                      }`}
                    >
                      {hw.targetType === 'quiz' ? (
                        <Sparkles className="h-5 w-5" aria-hidden="true" />
                      ) : (
                        <Layers className="h-5 w-5" aria-hidden="true" />
                      )}
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="truncate font-black text-white">{hw.title}</p>
                      <p className="mt-0.5 flex flex-wrap items-center gap-x-2 text-xs font-medium text-slate-500">
                        <span className="font-black text-slate-400">{hw.subjectName}</span>
                        <span>· {hw.targetType === 'quiz' ? 'Quiz' : 'Flashcards'}</span>
                        {hw.teacherName && <span>· {hw.teacherName}</span>}
                      </p>
                    </div>
                    {hw.countsAsGrade && (
                      <span className="rounded-full border border-amber-400/30 bg-amber-400/10 px-2.5 py-1 text-[11px] font-black text-amber-200">
                        Đầu điểm 15p
                      </span>
                    )}
                    <span
                      className={`inline-flex items-center gap-1.5 text-xs font-black ${
                        past ? 'text-rose-300' : 'text-slate-400'
                      }`}
                    >
                      <CalendarClock className="h-3.5 w-3.5" aria-hidden="true" />
                      {past ? 'Hết hạn' : 'Hạn'} {formatDue(hw.dueDate)}
                    </span>
                    <button
                      type="button"
                      onClick={() => {
                        if (window.confirm(`Thu hồi "${hw.title}"? Điểm tự sinh từ bài này cũng bị xoá.`)) {
                          deleteMutation.mutate(hw.id);
                        }
                      }}
                      disabled={deleteMutation.isPending}
                      aria-label={`Thu hồi ${hw.title}`}
                      className="rounded-xl border border-rose-400/30 p-2 text-rose-300 transition-colors hover:bg-rose-400/10 disabled:opacity-50"
                    >
                      <Trash2 className="h-4 w-4" aria-hidden="true" />
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
        </div>

        {/* ---------- create modal ---------- */}
        {draft && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm"
            role="dialog"
            aria-modal="true"
            onClick={() => setDraft(null)}
          >
            <form
              onClick={(event) => event.stopPropagation()}
              onSubmit={(event) => {
                event.preventDefault();
                if (!draft.title.trim()) {
                  toast.error('Nhập tên bài tập');
                  return;
                }
                if (!draft.subjectId) {
                  toast.error('Chọn môn học');
                  return;
                }
                if (!draft.targetId) {
                  toast.error('Chọn quiz hoặc bộ flashcard cần giao');
                  return;
                }
                if (!draft.dueDate) {
                  toast.error('Chọn hạn nộp');
                  return;
                }
                createMutation.mutate(draft);
              }}
              className="max-h-[90vh] w-full max-w-lg space-y-4 overflow-y-auto rounded-3xl border border-white/10 bg-slate-900 p-6 shadow-2xl"
            >
              <div className="flex items-center justify-between">
                <h2 className="flex items-center gap-2 text-lg font-black text-white">
                  <Send className="h-5 w-5 text-accent-400" aria-hidden="true" /> Giao bài tập mới
                </h2>
                <button
                  type="button"
                  onClick={() => setDraft(null)}
                  aria-label="Đóng"
                  className="rounded-xl p-1.5 text-slate-500 hover:bg-white/5 hover:text-white"
                >
                  <X className="h-5 w-5" aria-hidden="true" />
                </button>
              </div>

              <label className="block space-y-1">
                <span className="block text-xs font-black uppercase tracking-widest text-slate-500">
                  Tên bài tập
                </span>
                <input
                  value={draft.title}
                  onChange={(e) => setDraft((d) => (d ? { ...d, title: e.target.value } : d))}
                  maxLength={200}
                  placeholder="VD: Luyện Trắc nghiệm Hàm số — ôn kiểm tra 15 phút"
                  autoFocus
                  className="min-h-11 w-full rounded-xl border border-white/10 bg-slate-950/60 px-3 text-sm font-semibold text-white outline-none placeholder:text-slate-600 focus:border-accent-400/60"
                />
              </label>

              <label className="block space-y-1">
                <span className="block text-xs font-black uppercase tracking-widest text-slate-500">
                  Môn học
                </span>
                <select
                  value={draft.subjectId}
                  onChange={(e) => setDraft((d) => (d ? { ...d, subjectId: e.target.value } : d))}
                  className="min-h-11 w-full rounded-xl border border-white/10 bg-black/25 px-3 text-sm font-black text-white outline-none focus:border-accent-400/60"
                >
                  <option value="">— chọn môn —</option>
                  {subjects.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name}
                    </option>
                  ))}
                </select>
              </label>

              <div className="space-y-1">
                <span className="block text-xs font-black uppercase tracking-widest text-slate-500">
                  Loại bài
                </span>
                <div className="grid grid-cols-2 gap-2">
                  {(
                    [
                      { v: 'quiz' as const, label: 'Quiz', icon: Sparkles },
                      { v: 'deck' as const, label: 'Bộ flashcard', icon: Layers },
                    ]
                  ).map((opt) => (
                    <button
                      key={opt.v}
                      type="button"
                      onClick={() =>
                        setDraft((d) =>
                          d
                            ? {
                                ...d,
                                targetType: opt.v,
                                targetId: '',
                                countsAsGrade: opt.v === 'quiz' ? d.countsAsGrade : false,
                              }
                            : d,
                        )
                      }
                      className={`inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border text-sm font-black transition-colors ${
                        draft.targetType === opt.v
                          ? 'border-accent-400 bg-accent-500 text-white'
                          : 'border-white/10 text-slate-400 hover:border-accent-400/40 hover:text-white'
                      }`}
                    >
                      <opt.icon className="h-4 w-4" aria-hidden="true" /> {opt.label}
                    </button>
                  ))}
                </div>
              </div>

              <label className="block space-y-1">
                <span className="block text-xs font-black uppercase tracking-widest text-slate-500">
                  {draft.targetType === 'quiz' ? 'Chọn quiz' : 'Chọn bộ flashcard'}{' '}
                  <span className="normal-case font-bold text-slate-600">
                    (từ Learning Hub — {draft.targetType === 'quiz' ? 'quiz công khai' : 'deck công khai'})
                  </span>
                </span>
                <select
                  value={draft.targetId}
                  onChange={(e) => setDraft((d) => (d ? { ...d, targetId: e.target.value } : d))}
                  className="min-h-11 w-full rounded-xl border border-white/10 bg-black/25 px-3 text-sm font-semibold text-white outline-none focus:border-accent-400/60"
                >
                  <option value="">
                    {draft.targetType === 'quiz'
                      ? quizzesQuery.isLoading
                        ? '— đang tải quiz —'
                        : '— chọn quiz —'
                      : decksQuery.isLoading
                        ? '— đang tải bộ thẻ —'
                        : '— chọn bộ thẻ —'}
                  </option>
                  {(draft.targetType === 'quiz' ? quizzesQuery.data?.items : decksQuery.data?.items)?.map(
                    (item) => (
                      <option key={item.id} value={item.id}>
                        {item.name}
                      </option>
                    ),
                  )}
                </select>
              </label>

              <label className="block space-y-1">
                <span className="block text-xs font-black uppercase tracking-widest text-slate-500">
                  Hạn nộp
                </span>
                <input
                  type="datetime-local"
                  value={draft.dueDate}
                  onChange={(e) => setDraft((d) => (d ? { ...d, dueDate: e.target.value } : d))}
                  className="min-h-11 w-full rounded-xl border border-white/10 bg-black/25 px-3 text-sm font-black text-white outline-none focus:border-accent-400/60"
                />
              </label>

              <label
                className={`flex items-start gap-3 rounded-2xl border p-3 ${
                  draft.targetType === 'quiz'
                    ? 'border-amber-400/25 bg-amber-400/5'
                    : 'border-white/10 bg-black/20 opacity-60'
                }`}
              >
                <input
                  type="checkbox"
                  checked={draft.targetType === 'quiz' && draft.countsAsGrade}
                  disabled={draft.targetType !== 'quiz'}
                  onChange={(e) => setDraft((d) => (d ? { ...d, countsAsGrade: e.target.checked } : d))}
                  className="mt-0.5 h-5 w-5 accent-amber-400"
                />
                <span className="text-xs font-medium text-slate-300">
                  <span className="block text-sm font-black text-white">Đầu điểm khi hoàn thành</span>
                  Học sinh làm xong quiz sẽ tự nhận một đầu điểm <b>15 phút (hệ số 1)</b>, điểm =
                  kết quả quiz quy đổi 0–10; làm lại lần sau thay điểm lần trước. Flashcard không
                  đầu điểm được.
                </span>
              </label>

              <button
                type="submit"
                disabled={createMutation.isPending}
                className="inline-flex min-h-11 w-full items-center justify-center gap-1.5 rounded-xl bg-accent-500 px-4 text-sm font-black text-white transition-colors hover:bg-accent-400 disabled:opacity-50"
              >
                {createMutation.isPending ? (
                  <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
                ) : (
                  <Send className="h-4 w-4" aria-hidden="true" />
                )}
                Giao cho lớp
              </button>
            </form>
          </div>
        )}
      </section>
    </main>
  );
}
