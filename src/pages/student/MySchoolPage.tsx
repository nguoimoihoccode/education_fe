import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import {
  AlertTriangle, BookOpenCheck, CalendarRange, CheckCircle2, ClipboardList,
  GraduationCap, Loader2, Sparkles, Layers,
} from 'lucide-react';
import MyTimetablePanel from '@/components/school/MyTimetablePanel';
import NoSchoolNotice from '@/components/school/NoSchoolNotice';
import StudentGradesPanel from '@/components/school/StudentGradesPanel';
import { getMyGrades, getMyHomework } from '@/api/school.api';
import { QUERY_KEYS } from '@/config/query';
import { ROUTES } from '@/config/routes';
import type { StudentHomeworkRow } from '@/types/school.types';

type SchoolTab = 'timetable' | 'grades' | 'homework';

const TABS: Array<{ id: SchoolTab; label: string; icon: typeof CalendarRange }> = [
  { id: 'timetable', label: 'Thời khoá biểu', icon: CalendarRange },
  { id: 'grades', label: 'Điểm', icon: GraduationCap },
  { id: 'homework', label: 'Bài tập về nhà', icon: BookOpenCheck },
];

function formatDue(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleString('vi-VN', {
    hour: '2-digit',
    minute: '2-digit',
    day: '2-digit',
    month: '2-digit',
  });
}

/** "Trường của tôi" — timetable + sổ điểm + BTVN của chính học sinh (Phase 3–4). */
export default function MySchoolPage() {
  const [tab, setTab] = useState<SchoolTab>('timetable');

  const gradesQuery = useQuery({
    queryKey: QUERY_KEYS.MY_GRADES,
    queryFn: getMyGrades,
    enabled: tab === 'grades',
    retry: false,
  });

  const homeworkQuery = useQuery({
    queryKey: QUERY_KEYS.MY_HOMEWORK,
    queryFn: getMyHomework,
    enabled: tab === 'homework',
    retry: false,
  });

  const pendingCount = useMemo(() => {
    const data = homeworkQuery.data;
    if (!data) return 0;
    const doneIds = new Set(
      data.graded.filter((g) => g.homeworkId).map((g) => g.homeworkId as string),
    );
    return data.homework.filter((h) => !h.overdue && !doneIds.has(h.id)).length;
  }, [homeworkQuery.data]);

  return (
    <main className="min-h-screen bg-slate-950 px-4 py-8 text-slate-100 sm:px-6 lg:px-8">
      <div className="pointer-events-none fixed inset-0 -z-0 bg-[radial-gradient(circle_at_top_left,rgba(34,211,238,0.16),transparent_32%),radial-gradient(circle_at_top_right,rgba(168,85,247,0.14),transparent_30%),linear-gradient(180deg,#020617,#0f172a)]" />
      <section className="relative z-10 mx-auto max-w-6xl space-y-6">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <h1 className="flex items-center gap-2 text-3xl font-black tracking-tight text-white">
              <ClipboardList className="h-7 w-7 text-accent-400" aria-hidden="true" />
              Trường của tôi
            </h1>
            <p className="mt-1 text-sm font-medium text-slate-500">
              Thời khoá biểu, sổ điểm và bài tập về nhà của bạn.
            </p>
          </div>
          <div className="flex rounded-2xl border border-white/10 bg-slate-900/70 p-1">
            {TABS.map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                type="button"
                onClick={() => setTab(id)}
                className={`relative inline-flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-black transition-colors ${
                  tab === id ? 'bg-accent-500 text-on-accent' : 'text-slate-400 hover:text-white'
                }`}
              >
                <Icon className="h-4 w-4" aria-hidden="true" /> {label}
                {id === 'homework' && pendingCount > 0 && (
                  <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-rose-500 px-1 text-[10px] font-black text-on-accent">
                    {pendingCount}
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>

        {tab === 'timetable' && <MyTimetablePanel />}

        {tab === 'grades' && (
          <div>
            {gradesQuery.isLoading && (
              <div className="flex justify-center rounded-3xl border border-white/10 bg-slate-900/70 py-16 text-slate-500 backdrop-blur-xl">
                <Loader2 className="h-8 w-8 animate-spin" />
              </div>
            )}
            {/* GET /grades/me 404s only when resolveSchoolIdForUser finds no school */}
            {gradesQuery.isError && <NoSchoolNotice />}
            {gradesQuery.data && <StudentGradesPanel subjects={gradesQuery.data.subjects} />}
          </div>
        )}

        {tab === 'homework' && (
          <div>
            {homeworkQuery.isLoading && (
              <div className="flex justify-center rounded-3xl border border-white/10 bg-slate-900/70 py-16 text-slate-500 backdrop-blur-xl">
                <Loader2 className="h-8 w-8 animate-spin" />
              </div>
            )}
            {homeworkQuery.isError && (
              <NoSchoolNotice
                title="Không tải được bài tập về nhà"
                description="Có lỗi khi tải danh sách bài tập. Thử tải lại trang."
                icon={<BookOpenCheck className="mx-auto h-8 w-8 text-slate-700" aria-hidden="true" />}
              />
            )}
            {homeworkQuery.data && (
              <HomeworkRows
                rows={homeworkQuery.data.homework}
                gradedIds={new Set(
                  homeworkQuery.data.graded
                    .filter((g) => g.homeworkId)
                    .map((g) => g.homeworkId as string),
                )}
              />
            )}
          </div>
        )}
      </section>
    </main>
  );
}

/** Student's own BTVN list — deadline ordering + "Làm bài" CTA for quizzes. */
function HomeworkRows({ rows, gradedIds }: { rows: StudentHomeworkRow[]; gradedIds: Set<string> }) {
  const sorted = useMemo(
    () => [...rows].sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime()),
    [rows],
  );
  if (sorted.length === 0) {
    return (
      <div className="rounded-3xl border border-dashed border-white/10 p-10 text-center">
        <BookOpenCheck className="mx-auto h-8 w-8 text-slate-700" aria-hidden="true" />
        <p className="mt-2 text-sm font-medium text-slate-500">
          Bạn không có bài tập về nhà nào. Giáo viên giao bài sẽ hiện ở đây.
        </p>
      </div>
    );
  }
  return (
    <div className="rounded-3xl border border-white/10 bg-slate-900/70 backdrop-blur-xl">
      <ul className="divide-y divide-white/5">
        {sorted.map((hw) => {
          const done = gradedIds.has(hw.id);
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
                  <span>· {hw.className}</span>
                  {hw.teacherName && <span>· {hw.teacherName}</span>}
                </p>
              </div>
              {hw.countsAsGrade && (
                <span className="rounded-full border border-amber-400/30 bg-amber-400/10 px-2.5 py-1 text-[11px] font-black text-amber-200">
                  Đầu điểm 15p
                </span>
              )}
              {done ? (
                <span className="inline-flex items-center gap-1.5 text-xs font-black text-emerald-300">
                  <CheckCircle2 className="h-4 w-4" aria-hidden="true" /> Đã làm
                </span>
              ) : hw.overdue ? (
                <span className="inline-flex items-center gap-1.5 text-xs font-black text-rose-300">
                  <AlertTriangle className="h-4 w-4" aria-hidden="true" /> Quá hạn · {formatDue(hw.dueDate)}
                </span>
              ) : (
                <span className="text-xs font-bold text-slate-400">
                  Hạn {formatDue(hw.dueDate)}
                </span>
              )}
              {hw.targetType === 'quiz' && !done && (
                <Link
                  to={ROUTES.QUIZ_DETAIL(hw.targetId)}
                  className="rounded-xl bg-accent-500 px-4 py-2 text-xs font-black text-on-accent transition-colors hover:bg-accent-400"
                >
                  Làm bài
                </Link>
              )}
              {hw.targetType === 'deck' && !done && (
                <Link
                  to={ROUTES.FLASHCARD_DECKS}
                  className="rounded-xl border border-sky-400/30 px-4 py-2 text-xs font-black text-sky-200 transition-colors hover:bg-sky-400/10"
                >
                  Ôn tập
                </Link>
              )}
            </li>
          );
        })}
      </ul>
    </div>
  );
}
