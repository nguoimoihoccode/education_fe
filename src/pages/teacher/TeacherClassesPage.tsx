import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import {
  CalendarRange, ChevronRight, Loader2, MapPin, Presentation, Users,
} from 'lucide-react';
import { listMyHomeroomClasses } from '@/api/school.api';
import { QUERY_KEYS } from '@/config/query';
import { ROUTES } from '@/config/routes';

export default function TeacherClassesPage() {
  const { data: classes = [], isLoading } = useQuery({
    queryKey: QUERY_KEYS.TEACHER_CLASSES,
    queryFn: listMyHomeroomClasses,
    retry: false,
  });

  return (
    <main className="min-h-screen bg-slate-950 px-4 py-8 text-slate-100 sm:px-6 lg:px-8">
      <div className="pointer-events-none fixed inset-0 -z-0 bg-[radial-gradient(circle_at_top_left,rgba(34,211,238,0.16),transparent_32%),radial-gradient(circle_at_top_right,rgba(168,85,247,0.14),transparent_30%),linear-gradient(180deg,#020617,#0f172a)]" />
      <section className="relative z-10 mx-auto max-w-6xl space-y-6">
        <div>
          <h1 className="flex items-center gap-3 text-3xl font-black tracking-tight text-white">
            <Presentation className="h-8 w-8 text-accent-400" aria-hidden="true" /> Lớp chủ nhiệm
          </h1>
          <p className="mt-2 text-sm font-medium text-slate-400">
            Quản lý danh sách học sinh và phụ huynh của các lớp bạn làm chủ nhiệm.
          </p>
        </div>

        {isLoading && (
          <div className="flex justify-center py-16 text-slate-500">
            <Loader2 className="h-8 w-8 animate-spin" />
          </div>
        )}

        {!isLoading && classes.length === 0 && (
          <div className="rounded-3xl border border-dashed border-white/10 p-10 text-center">
            <p className="text-sm font-medium text-slate-500">
              Bạn chưa được phân công chủ nhiệm lớp nào.
            </p>
            <p className="mt-1 text-xs font-medium text-slate-600">
              Hiệu trưởng gán giáo viên chủ nhiệm khi tạo hoặc sửa lớp ở trang quản trị trường.
            </p>
          </div>
        )}

        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {classes.map((cls) => (
            <Link
              key={cls.id}
              to={ROUTES.TEACHING_CLASS(cls.id)}
              className="group rounded-3xl border border-white/10 bg-slate-900/70 p-6 shadow-xl backdrop-blur-xl transition-colors hover:border-accent-400/40"
            >
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-2xl font-black text-white">{cls.name}</p>
                  <p className="mt-1 text-xs font-bold uppercase tracking-widest text-slate-500">
                    Lớp {cls.grade} · {cls.academicYear?.name ?? '—'}
                  </p>
                </div>
                <ChevronRight className="h-5 w-5 text-slate-600 transition-transform group-hover:translate-x-1 group-hover:text-accent-300" aria-hidden="true" />
              </div>
              <div className="mt-4 flex flex-wrap gap-4 text-sm font-semibold text-slate-400">
                <span className="inline-flex items-center gap-1.5">
                  <Users className="h-4 w-4 text-accent-400" aria-hidden="true" />
                  {cls.studentCount ?? 0} học sinh
                </span>
                {cls.room && (
                  <span className="inline-flex items-center gap-1.5">
                    <MapPin className="h-4 w-4 text-accent-400" aria-hidden="true" />
                    {cls.room}
                  </span>
                )}
                <span className="inline-flex items-center gap-1.5">
                  <CalendarRange className="h-4 w-4 text-accent-400" aria-hidden="true" />
                  {cls.academicYear?.name ?? '—'}
                </span>
              </div>
            </Link>
          ))}
        </div>
      </section>
    </main>
  );
}
