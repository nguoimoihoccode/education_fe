import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import {
  AlertTriangle,
  ArrowRight,
  Baby,
  BookOpen,
  CalendarDays,
  ClipboardList,
  Flame,
  GraduationCap,
  School,
  Sparkles,
  Trophy,
  Users,
} from 'lucide-react';
import { ROUTES } from '@/config';
import type { TodayLearningHub, TodayLearningHubTaskType } from '@/types/education.types';
import type {
  MyChild,
  SchoolClass,
  SchoolStats,
  StudentGrades,
  StudentHomeworkRow,
  TimetableSlotView,
} from '@/types/school.types';
import { learningProgress, overallAverage, subjectAverages } from './dashboard-model';

const CARD =
  'rounded-[1.75rem] border border-slate-200 bg-white p-5 shadow-[0_1px_2px_rgba(15,23,42,0.04)] sm:p-6';

const TASK_LABELS: Record<TodayLearningHubTaskType, string> = {
  continue_lesson: 'Tiếp tục bài học',
  review_vocabulary: 'Ôn từ vựng',
  quick_quiz: 'Quiz nhanh',
  fix_mistakes: 'Sửa lỗi',
};

const dateTime = new Intl.DateTimeFormat('vi-VN', {
  day: '2-digit',
  month: '2-digit',
  hour: '2-digit',
  minute: '2-digit',
});

const oneDecimal = (value: number) => value.toFixed(1).replace('.', ',');

export function Panel({
  title,
  subtitle,
  action,
  children,
  className = '',
}: {
  title: string;
  subtitle?: string;
  action?: ReactNode;
  children: ReactNode;
  className?: string;
}) {
  return (
    <section className={`${CARD} ${className}`}>
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div>
          <h2 className="text-base font-black tracking-tight text-slate-950">{title}</h2>
          {subtitle && <p className="mt-0.5 text-xs text-slate-500">{subtitle}</p>}
        </div>
        {action}
      </div>
      {children}
    </section>
  );
}

function EmptyLine({ children }: { children: ReactNode }) {
  return <p className="mt-4 rounded-2xl bg-slate-50 px-4 py-5 text-sm text-slate-500">{children}</p>;
}

function LoadingLine() {
  return <p className="mt-4 px-1 py-5 text-sm text-slate-400">Đang tải…</p>;
}

export function SummaryTile({
  icon,
  label,
  value,
  hint,
}: {
  icon: ReactNode;
  label: string;
  value: ReactNode;
  hint?: string;
}) {
  return (
    <div className="rounded-[1.5rem] border border-slate-200 bg-white px-4 py-3.5">
      <div className="flex items-center gap-2 text-[11px] font-black uppercase tracking-[0.14em] text-slate-500">
        <span className="text-emerald-600">{icon}</span>
        {label}
      </div>
      <p className="mt-2 text-2xl font-black leading-none text-slate-950">{value}</p>
      {hint && <p className="mt-1.5 text-xs text-slate-500">{hint}</p>}
    </div>
  );
}

export function TodayTimetableCard({
  slots,
  classLabel,
  as,
  loading,
}: {
  slots: TimetableSlotView[];
  classLabel?: string;
  as?: 'teacher' | 'student';
  loading: boolean;
}) {
  return (
    <Panel
      title="Hôm nay"
      subtitle={classLabel ? `Thời khoá biểu · ${classLabel}` : 'Thời khoá biểu'}
      action={
        <Link
          to={as === 'teacher' ? ROUTES.TEACHING_TIMETABLE : ROUTES.ME_SCHOOL}
          className="inline-flex items-center gap-1 text-xs font-bold text-emerald-700 hover:text-emerald-800"
        >
          Cả tuần <ArrowRight className="h-3.5 w-3.5" />
        </Link>
      }
    >
      {loading ? (
        <LoadingLine />
      ) : slots.length === 0 ? (
        <EmptyLine>Hôm nay không có tiết học nào.</EmptyLine>
      ) : (
        <ol className="mt-4 space-y-2">
          {slots.map((slot) => (
            <li
              key={slot.id}
              className="flex items-center gap-3 rounded-2xl border border-slate-100 bg-slate-50/70 px-3 py-2.5"
            >
              <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-white text-[11px] font-black text-slate-600 ring-1 ring-slate-200">
                T{slot.periodNumber}
              </span>
              <span
                className="h-8 w-1 shrink-0 rounded-full bg-slate-300"
                style={slot.subject.color ? { backgroundColor: slot.subject.color } : undefined}
                aria-hidden
              />
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-black text-slate-900">{slot.subject.name}</p>
                <p className="mt-0.5 truncate text-xs text-slate-500">
                  {[slot.className, slot.teacher.name, slot.room && `Phòng ${slot.room}`]
                    .filter(Boolean)
                    .join(' · ')}
                </p>
              </div>
            </li>
          ))}
        </ol>
      )}
    </Panel>
  );
}

function homeworkHref(row: StudentHomeworkRow): string {
  return row.targetType === 'quiz'
    ? ROUTES.QUIZ_DETAIL(row.targetId)
    : `${ROUTES.FLASHCARD_REVIEW}?deckId=${row.targetId}`;
}

export function TodoCard({
  homework,
  tasks,
  loading,
}: {
  homework: StudentHomeworkRow[];
  tasks: TodayLearningHub['tasks'];
  loading: boolean;
}) {
  const pendingTasks = tasks.filter((task) => !task.completed);
  const total = homework.length + pendingTasks.length;

  return (
    <Panel
      title="Việc cần làm"
      subtitle={total === 0 ? 'Đã xong hết hôm nay' : `${total} việc đang chờ`}
    >
      {loading ? (
        <LoadingLine />
      ) : total === 0 ? (
        <EmptyLine>Không còn bài tập hay việc học nào đang chờ. Nghỉ một chút nhé.</EmptyLine>
      ) : (
        <ul className="mt-4 space-y-2">
          {homework.map((row) => (
            <li
              key={row.id}
              className="flex flex-wrap items-center gap-3 rounded-2xl border border-slate-100 px-3 py-2.5"
            >
              <ClipboardList className="h-4 w-4 shrink-0 text-slate-400" />
              <div className="min-w-0 flex-1">
                <p className="line-clamp-2 text-sm font-bold text-slate-900">{row.title}</p>
                <p className="mt-0.5 truncate text-xs text-slate-500">
                  {[row.subjectName, row.className, `Hạn ${dateTime.format(new Date(row.dueDate))}`]
                    .filter(Boolean)
                    .join(' · ')}
                </p>
              </div>
              {row.overdue && (
                <span className="inline-flex items-center gap-1 rounded-full bg-rose-50 px-2 py-0.5 text-[11px] font-black text-rose-700 ring-1 ring-rose-200">
                  <AlertTriangle className="h-3 w-3" /> Quá hạn
                </span>
              )}
              <Link
                to={homeworkHref(row)}
                className="rounded-full bg-emerald-600 px-3 py-1.5 text-xs font-black text-on-accent hover:bg-emerald-700"
              >
                {row.targetType === 'quiz' ? 'Làm bài' : 'Ôn tập'}
              </Link>
            </li>
          ))}
          {pendingTasks.map((task) => (
            <li
              key={task.id}
              className="flex flex-wrap items-center gap-3 rounded-2xl border border-slate-100 px-3 py-2.5"
            >
              <Sparkles className="h-4 w-4 shrink-0 text-emerald-500" />
              <div className="min-w-0 flex-1">
                <p className="line-clamp-2 text-sm font-bold text-slate-900">{task.title}</p>
                <p className="mt-0.5 truncate text-xs text-slate-500">
                  {TASK_LABELS[task.type]} · {task.estimatedMinutes} phút
                </p>
              </div>
              <Link
                to={task.targetUrl}
                className="rounded-full border border-slate-200 px-3 py-1.5 text-xs font-black text-slate-700 hover:border-emerald-300 hover:text-emerald-700"
              >
                {task.ctaLabel}
              </Link>
            </li>
          ))}
        </ul>
      )}
    </Panel>
  );
}

export function GradesCard({
  grades,
  loading,
}: {
  grades: StudentGrades | undefined;
  loading: boolean;
}) {
  const subjects = subjectAverages(grades);
  const average = overallAverage(grades);

  return (
    <Panel
      title="Điểm gần đây"
      subtitle={average === null ? 'Chưa có đầu điểm' : `Trung bình ${oneDecimal(average)}`}
      action={
        <Link
          to={ROUTES.ME_SCHOOL}
          className="inline-flex items-center gap-1 text-xs font-bold text-emerald-700 hover:text-emerald-800"
        >
          Sổ điểm <ArrowRight className="h-3.5 w-3.5" />
        </Link>
      }
    >
      {loading ? (
        <LoadingLine />
      ) : subjects.length === 0 ? (
        <EmptyLine>
          Chưa có điểm nào. Điểm sẽ hiện ở đây sau khi giáo viên nhập sổ điểm.
        </EmptyLine>
      ) : (
        <ul className="mt-4 divide-y divide-slate-100">
          {subjects.slice(0, 6).map((subject) => (
            <li key={subject.subjectId} className="flex items-center gap-3 py-2.5">
              <GraduationCap className="h-4 w-4 shrink-0 text-slate-400" />
              <span className="min-w-0 flex-1 truncate text-sm font-bold text-slate-900">
                {subject.subjectName}
              </span>
              {subject.rank !== null && (
                <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2 py-0.5 text-[11px] font-black text-amber-700 ring-1 ring-amber-200">
                  <Trophy className="h-3 w-3" /> {subject.rank}/{subject.rankedCount}
                </span>
              )}
              <span className="w-10 text-right text-sm font-black tabular-nums text-slate-950">
                {subject.score === null ? '—' : oneDecimal(subject.score)}
              </span>
            </li>
          ))}
        </ul>
      )}
    </Panel>
  );
}

export function LearningCard({
  hub,
  loading,
}: {
  hub: TodayLearningHub | undefined;
  loading: boolean;
}) {
  const goal = hub?.dailyGoalMinutes ?? 0;
  const minutes = hub?.minutesLearnedToday ?? 0;
  const share = learningProgress(hub);

  return (
    <Panel
      title="Việc tự học hôm nay"
      subtitle="Module học tập cá nhân"
      action={
        <Link
          to={ROUTES.TODAY}
          className="inline-flex items-center gap-1 text-xs font-bold text-emerald-700 hover:text-emerald-800"
        >
          Mở <ArrowRight className="h-3.5 w-3.5" />
        </Link>
      }
    >
      {loading ? (
        <LoadingLine />
      ) : (
        <div className="mt-4 space-y-4">
          <div>
            <div className="flex items-end justify-between gap-3">
              <p className="text-2xl font-black leading-none text-slate-950">
                {minutes}
                <span className="text-sm font-bold text-slate-500"> / {goal} phút</span>
              </p>
              <span className="text-xs font-black text-emerald-700">{Math.round(share * 100)}%</span>
            </div>
            <div className="mt-2 h-2 overflow-hidden rounded-full bg-slate-100">
              <div
                className="h-full rounded-full bg-emerald-500"
                style={{ width: `${Math.round(share * 100)}%` }}
              />
            </div>
          </div>
          <div className="grid grid-cols-3 gap-2 text-center">
            <div className="rounded-2xl bg-slate-50 px-2 py-2.5">
              <p className="text-lg font-black leading-none text-slate-950">
                {hub?.completedTasks ?? 0}/{hub?.totalTasks ?? 0}
              </p>
              <p className="mt-1 text-[11px] font-bold text-slate-500">việc xong</p>
            </div>
            <div className="rounded-2xl bg-slate-50 px-2 py-2.5">
              <p className="flex items-center justify-center gap-1 text-lg font-black leading-none text-slate-950">
                <Flame className="h-4 w-4 text-orange-500" />
                {hub?.streak.current ?? 0}
              </p>
              <p className="mt-1 text-[11px] font-bold text-slate-500">ngày chuỗi</p>
            </div>
            <div className="rounded-2xl bg-slate-50 px-2 py-2.5">
              <p className="text-lg font-black leading-none text-slate-950">{hub?.xpToday ?? 0}</p>
              <p className="mt-1 text-[11px] font-bold text-slate-500">XP hôm nay</p>
            </div>
          </div>
          {hub?.streak.isAtRisk && (
            <p className="rounded-2xl bg-amber-50 px-3 py-2 text-xs font-bold text-amber-800 ring-1 ring-amber-200">
              Chuỗi học đang có nguy cơ đứt — học một chút hôm nay nhé.
            </p>
          )}
          <Link
            to={ROUTES.TODAY}
            className="flex items-center justify-center gap-2 rounded-2xl bg-slate-950 px-4 py-2.5 text-sm font-black text-white hover:bg-slate-800"
          >
            <BookOpen className="h-4 w-4" /> Vào kế hoạch hôm nay
          </Link>
        </div>
      )}
    </Panel>
  );
}

export function StaffClassCard({
  classes,
  loading,
}: {
  classes: SchoolClass[] | undefined;
  loading: boolean;
}) {
  const rows = classes ?? [];
  return (
    <Panel
      title="Lớp chủ nhiệm"
      subtitle={rows.length > 0 ? `${rows.length} lớp đang phụ trách` : undefined}
      action={
        <Link
          to={ROUTES.TEACHING}
          className="inline-flex items-center gap-1 text-xs font-bold text-emerald-700 hover:text-emerald-800"
        >
          Quản lý <ArrowRight className="h-3.5 w-3.5" />
        </Link>
      }
    >
      {loading ? (
        <LoadingLine />
      ) : rows.length === 0 ? (
        <EmptyLine>Chưa được phân công lớp chủ nhiệm.</EmptyLine>
      ) : (
        <ul className="mt-4 space-y-2">
          {rows.slice(0, 4).map((schoolClass) => (
            <li key={schoolClass.id}>
              <Link
                to={ROUTES.TEACHING_CLASS(schoolClass.id)}
                className="flex items-center gap-3 rounded-2xl border border-slate-100 px-3 py-2.5 hover:border-emerald-300"
              >
                <Users className="h-4 w-4 shrink-0 text-slate-400" />
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-sm font-bold text-slate-900">
                    {schoolClass.name}
                  </span>
                  <span className="block text-xs text-slate-500">
                    Khối {schoolClass.grade}
                    {typeof schoolClass.studentCount === 'number' &&
                      ` · ${schoolClass.studentCount} học sinh`}
                  </span>
                </span>
                <ArrowRight className="h-4 w-4 shrink-0 text-slate-300" />
              </Link>
            </li>
          ))}
        </ul>
      )}
    </Panel>
  );
}

export function SchoolStatsCard({
  stats,
  loading,
}: {
  stats: SchoolStats | undefined;
  loading: boolean;
}) {
  return (
    <Panel
      title="Toàn trường"
      subtitle="Số liệu quản trị"
      action={
        <Link
          to={ROUTES.PRINCIPAL}
          className="inline-flex items-center gap-1 text-xs font-bold text-emerald-700 hover:text-emerald-800"
        >
          Quản trị <ArrowRight className="h-3.5 w-3.5" />
        </Link>
      }
    >
      {loading ? (
        <LoadingLine />
      ) : !stats ? (
        <EmptyLine>Chưa có số liệu trường.</EmptyLine>
      ) : (
        <div className="mt-4 grid grid-cols-2 gap-2">
          {[
            { icon: <School className="h-4 w-4" />, label: 'Lớp', value: stats.classes },
            { icon: <Users className="h-4 w-4" />, label: 'Học sinh', value: stats.students },
            { icon: <GraduationCap className="h-4 w-4" />, label: 'Giáo viên', value: stats.teachers },
            { icon: <BookOpen className="h-4 w-4" />, label: 'Môn học', value: stats.subjects },
          ].map((item) => (
            <div key={item.label} className="rounded-2xl bg-slate-50 px-3 py-2.5">
              <p className="flex items-center gap-1.5 text-[11px] font-black uppercase tracking-wide text-slate-500">
                {item.icon}
                {item.label}
              </p>
              <p className="mt-1 text-xl font-black leading-none text-slate-950">{item.value}</p>
            </div>
          ))}
          <div className="col-span-2 flex items-center justify-between rounded-2xl bg-slate-50 px-3 py-2.5 text-xs">
            <span className="font-bold text-slate-600">Điểm TB toàn trường</span>
            <span className="font-black text-slate-950">
              {stats.avgScore === null ? '—' : oneDecimal(stats.avgScore)}
            </span>
          </div>
          <div className="col-span-2 flex items-center justify-between rounded-2xl bg-slate-50 px-3 py-2.5 text-xs">
            <span className="font-bold text-slate-600">Chuyên cần 30 ngày</span>
            <span className="font-black text-slate-950">{Math.round(stats.attendanceRate)}%</span>
          </div>
        </div>
      )}
    </Panel>
  );
}

export function ChildrenCard({
  children,
  loading,
}: {
  children: MyChild[];
  loading: boolean;
}) {
  return (
    <Panel
      title="Con của tôi"
      subtitle={children.length > 0 ? `${children.length} liên kết` : undefined}
      action={
        <Link
          to={ROUTES.PARENT}
          className="inline-flex items-center gap-1 text-xs font-bold text-emerald-700 hover:text-emerald-800"
        >
          Mở <ArrowRight className="h-3.5 w-3.5" />
        </Link>
      }
    >
      {loading ? (
        <LoadingLine />
      ) : children.length === 0 ? (
        <EmptyLine>Chưa có liên kết với học sinh. Nhập mã mời từ giáo viên chủ nhiệm.</EmptyLine>
      ) : (
        <ul className="mt-4 space-y-2">
          {children.map((child) => (
            <li key={child.linkId}>
              {child.status === 'approved' ? (
                <Link
                  to={ROUTES.PARENT_CHILD(child.studentId)}
                  className="flex items-center gap-3 rounded-2xl border border-slate-100 px-3 py-2.5 hover:border-emerald-300"
                >
                  <Baby className="h-4 w-4 shrink-0 text-slate-400" />
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-sm font-bold text-slate-900">
                      {child.childName ?? 'Học sinh'}
                    </span>
                    <span className="block truncate text-xs text-slate-500">
                      {[child.className, child.grade !== null && `Khối ${child.grade}`]
                        .filter(Boolean)
                        .join(' · ') || 'Đã liên kết'}
                    </span>
                  </span>
                  <ArrowRight className="h-4 w-4 shrink-0 text-slate-300" />
                </Link>
              ) : (
                <div className="flex items-center gap-3 rounded-2xl border border-dashed border-amber-200 bg-amber-50/60 px-3 py-2.5">
                  <Baby className="h-4 w-4 shrink-0 text-amber-500" />
                  <span className="min-w-0 flex-1 truncate text-sm font-bold text-slate-900">
                    {child.childName ?? 'Học sinh'}
                  </span>
                  <span className="rounded-full bg-white px-2 py-0.5 text-[11px] font-black text-amber-700 ring-1 ring-amber-200">
                    Chờ duyệt
                  </span>
                </div>
              )}
            </li>
          ))}
        </ul>
      )}
    </Panel>
  );
}

/** Empty-state helper reused by the page-level staff/parent slots. */
export function CalendarEmpty({ children }: { children: ReactNode }) {
  return (
    <div className={`${CARD} flex items-center gap-3 text-sm text-slate-500`}>
      <CalendarDays className="h-4 w-4 shrink-0 text-slate-400" />
      {children}
    </div>
  );
}
