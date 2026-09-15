import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import {
  ArrowRight, BookOpen, CalendarCheck, CalendarRange, CheckCircle2, Circle,
  GraduationCap, Loader2, Plus, School as SchoolIcon, Users, UserCog,
} from 'lucide-react';
import {
  getMySchool,
  getSchoolStats,
  listAcademicYears,
  createAcademicYear,
  activateAcademicYear,
} from '@/api/school.api';
import { QUERY_KEYS } from '@/config/query';
import type { CreateAcademicYearDto } from '@/types/school.types';

function formatDate(dateStr?: string) {
  if (!dateStr) return '—';
  const date = new Date(`${dateStr}T00:00:00`);
  return Number.isNaN(date.getTime())
    ? dateStr
    : new Intl.DateTimeFormat('vi-VN').format(date);
}

const STAT_CARDS = [
  { key: 'classes', label: 'Lớp học', icon: Users, to: '/principal/classes' },
  { key: 'students', label: 'Học sinh', icon: Users, to: '/principal/classes' },
  { key: 'teachers', label: 'Giáo viên', icon: UserCog, to: '/principal/teachers' },
  { key: 'subjects', label: 'Môn học', icon: BookOpen, to: '/principal/subjects' },
] as const;

export default function PrincipalDashboard() {
  const queryClient = useQueryClient();
  const [showYearForm, setShowYearForm] = useState(false);
  const [yearForm, setYearForm] = useState<CreateAcademicYearDto>({
    name: '',
    startDate: '',
    endDate: '',
    makeActive: true,
  });

  const schoolQuery = useQuery({
    queryKey: QUERY_KEYS.SCHOOL_ME,
    queryFn: getMySchool,
    retry: false,
  });
  const statsQuery = useQuery({
    queryKey: QUERY_KEYS.SCHOOL_STATS,
    queryFn: getSchoolStats,
    enabled: !schoolQuery.isError,
  });
  const yearsQuery = useQuery({
    queryKey: QUERY_KEYS.SCHOOL_ACADEMIC_YEARS,
    queryFn: listAcademicYears,
    enabled: !schoolQuery.isError,
  });

  const createYear = useMutation({
    mutationFn: createAcademicYear,
    onSuccess: async () => {
      toast.success('Đã tạo năm học');
      setYearForm({ name: '', startDate: '', endDate: '', makeActive: true });
      setShowYearForm(false);
      await queryClient.invalidateQueries({ queryKey: QUERY_KEYS.SCHOOL_ACADEMIC_YEARS });
      await queryClient.invalidateQueries({ queryKey: QUERY_KEYS.SCHOOL_ME });
    },
    onError: (error: { message?: string }) => toast.error(error.message || 'Không tạo được năm học'),
  });

  const activateYear = useMutation({
    mutationFn: activateAcademicYear,
    onSuccess: async () => {
      toast.success('Đã đặt làm năm học hiện tại');
      await queryClient.invalidateQueries({ queryKey: QUERY_KEYS.SCHOOL_ACADEMIC_YEARS });
      await queryClient.invalidateQueries({ queryKey: QUERY_KEYS.SCHOOL_ME });
    },
    onError: (error: { message?: string }) => toast.error(error.message || 'Không kích hoạt được'),
  });

  if (schoolQuery.isLoading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-950 text-slate-400">
        <Loader2 className="h-8 w-8 animate-spin" />
      </main>
    );
  }

  if (schoolQuery.isError) {
    return (
      <main className="min-h-screen bg-slate-950 px-4 py-8 text-slate-100 sm:px-6 lg:px-8">
        <section className="mx-auto max-w-3xl space-y-4 rounded-[2rem] border border-white/10 bg-slate-900/70 p-8 text-center shadow-2xl backdrop-blur-xl">
          <SchoolIcon className="mx-auto h-12 w-12 text-accent-400" aria-hidden="true" />
          <h1 className="text-2xl font-black text-white">Bạn chưa thuộc trường nào</h1>
          <p className="text-sm font-medium leading-6 text-slate-400">
            Hiệu trưởng cần được gán vào trường trước khi dùng trang quản trị.
            Quản trị hệ thống chạy{' '}
            <code className="rounded bg-black/40 px-2 py-0.5 text-xs text-accent-200">
              npm run bootstrap:school
            </code>{' '}
            ở backend để tạo trường và gán tài khoản của bạn làm hiệu trưởng.
          </p>
        </section>
      </main>
    );
  }

  const school = schoolQuery.data;
  if (!school) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-950 text-slate-400">
        <Loader2 className="h-8 w-8 animate-spin" />
      </main>
    );
  }
  const stats = statsQuery.data;
  const years = yearsQuery.data ?? [];
  const isEmpty = !!stats && stats.classes === 0 && stats.subjects === 0;

  return (
    <main className="min-h-screen bg-slate-950 px-4 py-8 text-slate-100 sm:px-6 lg:px-8">
      <div className="pointer-events-none fixed inset-0 -z-0 bg-[radial-gradient(circle_at_top_left,rgba(34,211,238,0.16),transparent_32%),radial-gradient(circle_at_top_right,rgba(168,85,247,0.14),transparent_30%),linear-gradient(180deg,#020617,#0f172a)]" />
      <section className="relative z-10 mx-auto max-w-7xl space-y-8">
        <div className="overflow-hidden rounded-[2rem] border border-white/10 bg-slate-900/70 p-6 shadow-2xl shadow-black/30 backdrop-blur-xl sm:p-8">
          <div className="inline-flex items-center gap-2 rounded-full border border-accent-400/20 bg-accent-400/10 px-3 py-1 text-xs font-black uppercase tracking-[0.25em] text-accent-200">
            <SchoolIcon className="h-4 w-4" aria-hidden="true" /> {school.code}
          </div>
          <h1 className="mt-3 text-3xl font-black tracking-tight text-white sm:text-4xl">
            {school.name}
          </h1>
          <p className="mt-2 text-sm font-medium text-slate-400">
            Năm học hiện tại:{' '}
            <span className="text-slate-100">
              {years.find((y) => y.id === school.currentAcademicYearId)?.name ?? 'chưa đặt'}
            </span>
          </p>
        </div>

        {isEmpty && (
          <div className="rounded-3xl border border-accent-400/20 bg-accent-400/5 p-6">
            <h2 className="text-lg font-black text-white">Bắt đầu theo thứ tự sau</h2>
            <ol className="mt-3 space-y-2 text-sm font-medium text-slate-300">
              <li>
                <Link to="/principal/subjects" className="inline-flex items-center gap-1 text-accent-200 hover:underline">
                  1. Tạo môn học <ArrowRight className="h-4 w-4" aria-hidden="true" />
                </Link>
              </li>
              <li>
                <Link to="/principal/classes" className="inline-flex items-center gap-1 text-accent-200 hover:underline">
                  2. Tạo lớp học cho năm học hiện tại <ArrowRight className="h-4 w-4" aria-hidden="true" />
                </Link>
              </li>
              <li>
                <Link to="/principal/classes" className="inline-flex items-center gap-1 text-accent-200 hover:underline">
                  3. Thêm học sinh vào lớp (dán danh sách email) <ArrowRight className="h-4 w-4" aria-hidden="true" />
                </Link>
              </li>
              <li>
                <Link to="/principal/teachers" className="inline-flex items-center gap-1 text-accent-200 hover:underline">
                  4. Phân công giáo viên dạy môn nào, lớp nào <ArrowRight className="h-4 w-4" aria-hidden="true" />
                </Link>
              </li>
            </ol>
          </div>
        )}

        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {STAT_CARDS.map(({ key, label, icon: Icon, to }) => (
            <Link
              key={key}
              to={to}
              className="group rounded-3xl border border-white/10 bg-slate-900/70 p-6 shadow-xl backdrop-blur-xl transition-colors hover:border-accent-400/40"
            >
              <div className="flex items-center justify-between">
                <Icon className="h-6 w-6 text-accent-400" aria-hidden="true" />
                <ArrowRight className="h-4 w-4 text-slate-600 transition-transform group-hover:translate-x-1 group-hover:text-accent-300" aria-hidden="true" />
              </div>
              <p className="mt-4 text-3xl font-black text-white">
                {stats ? stats[key] : '—'}
              </p>
              <p className="mt-1 text-sm font-bold uppercase tracking-widest text-slate-500">{label}</p>
            </Link>
          ))}
        </div>

        {/* Phase 4 — chất lượng dạy học: điểm TB + chuyên cần toàn trường */}
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="rounded-3xl border border-white/10 bg-slate-900/70 p-6 shadow-xl backdrop-blur-xl">
            <div className="flex items-center justify-between">
              <GraduationCap className="h-6 w-6 text-emerald-400" aria-hidden="true" />
              <p className="text-xs font-bold uppercase tracking-widest text-slate-600">
                trung bình đầu điểm · thang 10
              </p>
            </div>
            <p className="mt-4 text-3xl font-black text-white">
              {stats ? (stats.avgScore ?? '—') : '—'}
            </p>
            <p className="mt-1 text-sm font-bold uppercase tracking-widest text-slate-500">
              Điểm TB toàn trường
            </p>
          </div>
          <div className="rounded-3xl border border-white/10 bg-slate-900/70 p-6 shadow-xl backdrop-blur-xl">
            <div className="flex items-center justify-between">
              <CalendarCheck className="h-6 w-6 text-sky-400" aria-hidden="true" />
              <p className="text-xs font-bold uppercase tracking-widest text-slate-600">
                30 ngày gần nhất
              </p>
            </div>
            <p className="mt-4 text-3xl font-black text-white">
              {stats ? `${stats.attendanceRate}%` : '—'}
              {stats && stats.attendanceSessions > 0 && (
                <span className="ml-2 text-sm font-bold text-slate-500">
                  · {stats.attendanceSessions} lượt chấm
                </span>
              )}
            </p>
            <p className="mt-1 text-sm font-bold uppercase tracking-widest text-slate-500">
              Tỷ lệ chuyên cần
            </p>
          </div>
        </div>

        <div className="rounded-3xl border border-white/10 bg-slate-900/70 p-6 backdrop-blur-xl">
          <div className="flex items-center justify-between gap-4">
            <h2 className="flex items-center gap-2 text-lg font-black text-white">
              <CalendarRange className="h-5 w-5 text-accent-400" aria-hidden="true" /> Năm học
            </h2>
            <button
              type="button"
              onClick={() => setShowYearForm((v) => !v)}
              className="inline-flex items-center gap-2 rounded-2xl bg-accent-500 px-4 py-2 text-sm font-black text-white transition-colors hover:bg-accent-400"
            >
              <Plus className="h-4 w-4" aria-hidden="true" /> Năm học mới
            </button>
          </div>

          {showYearForm && (
            <form
              className="mt-4 grid gap-3 rounded-2xl border border-white/10 bg-black/25 p-4 sm:grid-cols-4"
              onSubmit={(event) => {
                event.preventDefault();
                if (!yearForm.name || !yearForm.startDate || !yearForm.endDate) {
                  toast.error('Nhập đủ tên và khoảng thời gian năm học');
                  return;
                }
                createYear.mutate(yearForm);
              }}
            >
              <label className="space-y-1">
                <span className="text-xs font-black uppercase tracking-widest text-slate-500">Tên</span>
                <input
                  value={yearForm.name}
                  onChange={(e) => setYearForm((f) => ({ ...f, name: e.target.value }))}
                  placeholder="2026-2027"
                  className="min-h-11 w-full rounded-xl border border-white/10 bg-slate-950/60 px-3 text-sm font-semibold text-white outline-none focus:border-accent-400/60"
                />
              </label>
              <label className="space-y-1">
                <span className="text-xs font-black uppercase tracking-widest text-slate-500">Bắt đầu</span>
                <input
                  type="date"
                  value={yearForm.startDate}
                  onChange={(e) => setYearForm((f) => ({ ...f, startDate: e.target.value }))}
                  className="min-h-11 w-full rounded-xl border border-white/10 bg-slate-950/60 px-3 text-sm font-semibold text-white outline-none focus:border-accent-400/60"
                />
              </label>
              <label className="space-y-1">
                <span className="text-xs font-black uppercase tracking-widest text-slate-500">Kết thúc</span>
                <input
                  type="date"
                  value={yearForm.endDate}
                  onChange={(e) => setYearForm((f) => ({ ...f, endDate: e.target.value }))}
                  className="min-h-11 w-full rounded-xl border border-white/10 bg-slate-950/60 px-3 text-sm font-semibold text-white outline-none focus:border-accent-400/60"
                />
              </label>
              <div className="flex items-end">
                <button
                  type="submit"
                  disabled={createYear.isPending}
                  className="min-h-11 w-full rounded-xl bg-accent-500 px-4 text-sm font-black text-white transition-colors hover:bg-accent-400 disabled:opacity-50"
                >
                  {createYear.isPending ? 'Đang tạo…' : 'Tạo'}
                </button>
              </div>
            </form>
          )}

          <ul className="mt-4 space-y-2">
            {years.length === 0 && (
              <li className="rounded-2xl border border-dashed border-white/10 p-4 text-sm font-medium text-slate-500">
                Chưa có năm học nào. Tạo năm học đầu tiên để bắt đầu mở lớp.
              </li>
            )}
            {years.map((year) => (
              <li
                key={year.id}
                className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-white/5 bg-black/25 px-4 py-3"
              >
                <div className="flex items-center gap-3">
                  {year.isActive ? (
                    <CheckCircle2 className="h-5 w-5 text-emerald-400" aria-hidden="true" />
                  ) : (
                    <Circle className="h-5 w-5 text-slate-600" aria-hidden="true" />
                  )}
                  <span className="font-black text-white">{year.name}</span>
                  <span className="text-sm font-medium text-slate-500">
                    {formatDate(year.startDate)} → {formatDate(year.endDate)}
                  </span>
                </div>
                {!year.isActive && (
                  <button
                    type="button"
                    onClick={() => activateYear.mutate(year.id)}
                    disabled={activateYear.isPending}
                    className="rounded-xl border border-white/10 px-3 py-1.5 text-xs font-black uppercase tracking-widest text-slate-300 transition-colors hover:border-accent-400/50 hover:text-accent-200 disabled:opacity-50"
                  >
                    Đặt làm hiện tại
                  </button>
                )}
              </li>
            ))}
          </ul>
        </div>
      </section>
    </main>
  );
}
