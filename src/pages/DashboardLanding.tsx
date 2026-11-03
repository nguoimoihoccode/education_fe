import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import {
  ArrowRight,
  CalendarDays,
  ClipboardList,
  Flame,
  GraduationCap,
  LogIn,
  School,
  Sparkles,
  UserPlus,
  Users,
} from 'lucide-react';
import { StudyConsoleFigure } from '@/components/anatomy/StudyConsoleFigure';
import {
  ChildrenCard,
  GradesCard,
  LearningCard,
  SchoolStatsCard,
  StaffClassCard,
  SummaryTile,
  TodayTimetableCard,
  TodoCard,
} from '@/components/dashboard/DashboardSections';
import {
  learningProgress,
  openTasks,
  pendingHomework,
  roleLabels,
  todaysSlots,
} from '@/components/dashboard/dashboard-model';
import { getTodayLearningHub } from '@/api/education.api';
import {
  getMyChildren,
  getMyGrades,
  getMyHomework,
  getMyTimetable,
  getSchoolStats,
  listMyHomeroomClasses,
} from '@/api/school.api';
import { QUERY_KEYS, ROUTES } from '@/config';
import { useAuth } from '@/hooks/useAuth';
import { isSchoolStaff } from '@/hooks/useCanWriteSchool';

const dateLabel = new Intl.DateTimeFormat('vi-VN', {
  weekday: 'long',
  day: '2-digit',
  month: 'long',
  year: 'numeric',
}).format(new Date());

export default function DashboardLanding() {
  const { isAuthenticated, user } = useAuth();
  const roles = user?.roles ?? [];
  const staff = isSchoolStaff(roles);
  const schoolAdmin = roles.includes('principal') || roles.includes('admin');

  const hubQuery = useQuery({
    queryKey: QUERY_KEYS.TODAY_HUB,
    queryFn: getTodayLearningHub,
    enabled: isAuthenticated,
    retry: false,
  });
  const timetableQuery = useQuery({
    queryKey: QUERY_KEYS.MY_TIMETABLE,
    queryFn: getMyTimetable,
    enabled: isAuthenticated,
    retry: false,
  });
  const homeworkQuery = useQuery({
    queryKey: QUERY_KEYS.MY_HOMEWORK,
    queryFn: getMyHomework,
    enabled: isAuthenticated,
    retry: false,
  });
  const gradesQuery = useQuery({
    queryKey: QUERY_KEYS.MY_GRADES,
    queryFn: getMyGrades,
    enabled: isAuthenticated && !staff,
    retry: false,
  });
  const childrenQuery = useQuery({
    queryKey: QUERY_KEYS.PARENT_CHILDREN,
    queryFn: getMyChildren,
    enabled: isAuthenticated,
    retry: false,
  });
  const classesQuery = useQuery({
    queryKey: QUERY_KEYS.TEACHER_CLASSES,
    queryFn: listMyHomeroomClasses,
    enabled: isAuthenticated && staff,
    retry: false,
  });
  const statsQuery = useQuery({
    queryKey: QUERY_KEYS.SCHOOL_STATS,
    queryFn: getSchoolStats,
    enabled: isAuthenticated && schoolAdmin,
    retry: false,
  });

  const slots = todaysSlots(timetableQuery.data?.slots ?? []);
  const homework = pendingHomework(homeworkQuery.data);
  const overdue = homework.filter((row) => row.overdue).length;
  const tasks = openTasks(hubQuery.data);
  const children = childrenQuery.data ?? [];
  const progress = learningProgress(hubQuery.data);
  const todayMinutes = hubQuery.data?.minutesLearnedToday ?? 0;
  const failed = hubQuery.isError || timetableQuery.isError || homeworkQuery.isError;

  return (
    <main className="min-h-screen bg-[#f5f7f1] text-slate-950">
      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        {!isAuthenticated ? (
          <GuestIntro />
        ) : (
          <>
            <header className="flex flex-wrap items-end justify-between gap-4">
              <div>
                <p className="text-xs font-black uppercase tracking-[0.18em] text-emerald-700">
                  Tổng quan hôm nay
                </p>
                <h1 className="mt-2 text-3xl font-black tracking-tight sm:text-4xl">
                  Chào {user?.displayName ?? 'bạn'}
                </h1>
                <p className="mt-2 text-sm text-slate-600">
                  {dateLabel}
                  {roleLabels(roles).length > 0 && (
                    <span className="text-slate-400"> · {roleLabels(roles).join(' · ')}</span>
                  )}
                </p>
              </div>
              <Link
                to={ROUTES.TODAY}
                className="inline-flex items-center gap-2 rounded-full bg-slate-950 px-4 py-2.5 text-sm font-black text-white hover:bg-slate-800"
              >
                Kế hoạch hôm nay <ArrowRight className="h-4 w-4" />
              </Link>
            </header>

            {failed && (
              <p className="mt-4 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm font-bold text-amber-800">
                Không tải được một phần dữ liệu. Các thẻ bên dưới có thể chưa đầy đủ — thử tải lại
                trang.
              </p>
            )}

            <section className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              <SummaryTile
                icon={<CalendarDays className="h-4 w-4" />}
                label="Tiết hôm nay"
                value={timetableQuery.isLoading ? '—' : slots.length}
                hint={slots[0] ? `Mở đầu: ${slots[0].subject.name}` : 'Ngày không có tiết'}
              />
              <SummaryTile
                icon={<ClipboardList className="h-4 w-4" />}
                label="BTVN cần làm"
                value={homeworkQuery.isLoading ? '—' : homework.length}
                hint={
                  overdue > 0 ? `${overdue} bài quá hạn` : homework.length > 0 ? 'Trong hạn' : 'Đã xong'
                }
              />
              <SummaryTile
                icon={<Sparkles className="h-4 w-4" />}
                label="Việc tự học"
                value={hubQuery.isLoading ? '—' : tasks.length}
                hint={`${todayMinutes} phút học hôm nay`}
              />
              <SummaryTile
                icon={<Flame className="h-4 w-4" />}
                label="Chuỗi ngày"
                value={hubQuery.isLoading ? '—' : (hubQuery.data?.streak.current ?? 0)}
                hint={`Dài nhất ${hubQuery.data?.streak.longest ?? 0} ngày`}
              />
            </section>

            <div className="mt-6 grid gap-5 lg:grid-cols-[minmax(0,1.6fr)_minmax(0,1fr)]">
              <div className="space-y-5">
                <TodayTimetableCard
                  slots={slots}
                  classLabel={timetableQuery.data?.class?.name}
                  as={timetableQuery.data?.as}
                  loading={timetableQuery.isLoading}
                />
                <TodoCard
                  homework={homework}
                  tasks={tasks}
                  loading={homeworkQuery.isLoading || hubQuery.isLoading}
                />
                {!staff && <GradesCard grades={gradesQuery.data} loading={gradesQuery.isLoading} />}
              </div>

              <aside className="space-y-5">
                <LearningCard hub={hubQuery.data} loading={hubQuery.isLoading} />
                {schoolAdmin && (
                  <SchoolStatsCard stats={statsQuery.data} loading={statsQuery.isLoading} />
                )}
                {staff && (
                  <StaffClassCard classes={classesQuery.data} loading={classesQuery.isLoading} />
                )}
                {(roles.includes('parent') || children.length > 0) && (
                  <ChildrenCard children={children} loading={childrenQuery.isLoading} />
                )}
              </aside>
            </div>

            <section className="mt-8">
              <div className="mb-4 flex flex-wrap items-end justify-between gap-2">
                <div>
                  <p className="text-xs font-black uppercase tracking-[0.18em] text-emerald-700">
                    Tiến độ hôm nay
                  </p>
                  <h2 className="mt-1 text-2xl font-black tracking-tight sm:text-3xl">
                    Trạm học tập mô phỏng 3D
                  </h2>
                </div>
                <p className="max-w-md text-xs text-slate-500">
                  Kim đo chạy theo kế hoạch tự học thật của bạn; rê chuột hoặc dùng phím ← → để xem
                  các mức tiến độ.
                </p>
              </div>
              <StudyConsoleFigure
                theme="light"
                progress={progress}
                todayMinutes={todayMinutes}
                className="mx-auto max-w-5xl"
              />
            </section>
          </>
        )}
      </div>
    </main>
  );
}

function GuestIntro() {
  const personas = [
    {
      icon: School,
      title: 'Hiệu trưởng',
      body: 'Quản lý lớp, môn học, phân công giảng dạy, xếp thời khoá biểu và xem số liệu toàn trường.',
    },
    {
      icon: Users,
      title: 'Giáo viên',
      body: 'Lớp chủ nhiệm, điểm danh theo tiết, sổ điểm và giao bài tập về nhà từ quiz hoặc bộ flashcard.',
    },
    {
      icon: GraduationCap,
      title: 'Học sinh & phụ huynh',
      body: 'Xem thời khoá biểu, điểm và bài tập; phụ huynh theo dõi con qua mã mời của giáo viên chủ nhiệm.',
    },
  ];

  return (
    <>
      <header className="rounded-[2.5rem] border border-slate-200 bg-white px-6 py-10 shadow-[0_20px_60px_rgba(15,23,42,0.06)] sm:px-10 sm:py-12">
        <p className="text-xs font-black uppercase tracking-[0.18em] text-emerald-700">
          Nền tảng quản lý trường học
        </p>
        <h1 className="mt-3 max-w-3xl text-4xl font-black leading-tight tracking-tight sm:text-5xl">
          Dạy, học và quản lý trường trong một nơi.
        </h1>
        <p className="mt-4 max-w-2xl text-base leading-7 text-slate-600">
          Thời khoá biểu, điểm danh, sổ điểm và bài tập về nhà cho nhà trường; kèm module tự học
          (khoá học, flashcards, quiz, AI tutor) cho học sinh.
        </p>
        <div className="mt-7 flex flex-wrap gap-3">
          <Link
            to={ROUTES.LOGIN}
            className="inline-flex items-center gap-2 rounded-full bg-emerald-600 px-5 py-3 text-sm font-black text-on-accent hover:bg-emerald-700"
          >
            <LogIn className="h-4 w-4" /> Đăng nhập
          </Link>
          <Link
            to={ROUTES.REGISTER}
            className="inline-flex items-center gap-2 rounded-full border border-slate-300 bg-white px-5 py-3 text-sm font-black text-slate-800 hover:border-emerald-400 hover:text-emerald-700"
          >
            <UserPlus className="h-4 w-4" /> Tạo tài khoản
          </Link>
        </div>
        <p className="mt-4 text-xs text-slate-500">{dateLabel}</p>
      </header>

      <section className="mt-6 grid gap-4 md:grid-cols-3">
        {personas.map((persona) => (
          <article
            key={persona.title}
            className="rounded-[1.75rem] border border-slate-200 bg-white p-6"
          >
            <span className="inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-700">
              <persona.icon className="h-5 w-5" />
            </span>
            <h2 className="mt-4 text-lg font-black tracking-tight text-slate-950">
              {persona.title}
            </h2>
            <p className="mt-2 text-sm leading-6 text-slate-600">{persona.body}</p>
          </article>
        ))}
      </section>

      <section className="mt-6 rounded-[1.75rem] border border-slate-200 bg-white px-6 py-5">
        <div className="flex flex-wrap items-center gap-x-8 gap-y-3">
          <p className="text-xs font-black uppercase tracking-[0.18em] text-slate-500">
            Module tự học
          </p>
          {['Khoá học', 'Flashcards SRS', 'Quiz', 'AI tutor', 'Kế hoạch mỗi ngày'].map((item) => (
            <span key={item} className="inline-flex items-center gap-1.5 text-sm font-bold text-slate-700">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
              {item}
            </span>
          ))}
        </div>
      </section>
    </>
  );
}
