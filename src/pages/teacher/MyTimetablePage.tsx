import { Link } from 'react-router-dom';
import { CalendarRange } from 'lucide-react';
import MyTimetablePanel from '@/components/school/MyTimetablePanel';
import { ROUTES } from '@/config/routes';

/** "Thời khoá biểu của tôi" — weekly grid from GET /timetable/me (Phase 3). */
export default function MyTimetablePage() {
  return (
    <main className="min-h-screen bg-slate-950 px-4 py-8 text-slate-100 sm:px-6 lg:px-8">
      <div className="pointer-events-none fixed inset-0 -z-0 bg-[radial-gradient(circle_at_top_left,rgba(34,211,238,0.16),transparent_32%),radial-gradient(circle_at_top_right,rgba(168,85,247,0.14),transparent_30%),linear-gradient(180deg,#020617,#0f172a)]" />
      <section className="relative z-10 mx-auto max-w-6xl space-y-6">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <h1 className="flex items-center gap-2 text-3xl font-black tracking-tight text-white">
              <CalendarRange className="h-7 w-7 text-accent-400" aria-hidden="true" />
              Thời khoá biểu của tôi
            </h1>
            <p className="mt-1 text-sm font-medium text-slate-500">
              Lịch cả tuần — giáo viên thấy các tiết mình dạy, học sinh thấy lịch của lớp mình.
            </p>
          </div>
          <Link
            to={ROUTES.TEACHING}
            className="rounded-xl border border-white/10 px-4 py-2 text-sm font-black text-slate-300 transition-colors hover:border-accent-400/50 hover:text-accent-200"
          >
            Lớp chủ nhiệm
          </Link>
        </div>
        <MyTimetablePanel />
      </section>
    </main>
  );
}
