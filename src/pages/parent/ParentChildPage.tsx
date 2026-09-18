import { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import {
  ArrowLeft, Baby, BookOpenCheck, CalendarRange, ClipboardCheck,
  Loader2, School as SchoolIcon, Sparkles, Layers, GraduationCap,
} from 'lucide-react';
import TimetableGrid from '@/components/school/TimetableGrid';
import StudentGradesPanel from '@/components/school/StudentGradesPanel';
import { STATUS_LABELS, STATUS_TONES } from '@/components/school/attendance-status';
import {
  getChildAttendance,
  getChildGrades,
  getChildHomework,
  getChildTimetable,
  getMyChildProfile,
} from '@/api/school.api';
import { QUERY_KEYS } from '@/config/query';
import { ROUTES } from '@/config/routes';
import type { ChildAttendance } from '@/types/school.types';

const RELATION_LABELS: Record<string, string> = {
  father: 'Bố',
  mother: 'Mẹ',
  guardian: 'Người giám hộ',
};

type ChildTab = 'profile' | 'timetable' | 'attendance' | 'grades' | 'homework';

const TABS: Array<{ id: ChildTab; label: string; icon: typeof Baby }> = [
  { id: 'profile', label: 'Hồ sơ', icon: Baby },
  { id: 'timetable', label: 'Thời khoá biểu', icon: CalendarRange },
  { id: 'attendance', label: 'Điểm danh', icon: ClipboardCheck },
  { id: 'grades', label: 'Điểm', icon: GraduationCap },
  { id: 'homework', label: 'BTVN', icon: BookOpenCheck },
];

/** Parent view of one child: profile + weekly timetable + attendance (Phase 2–3). */
export default function ParentChildPage() {
  const { studentId = '' } = useParams<{ studentId: string }>();
  const numericId = Number.parseInt(studentId, 10);
  const [tab, setTab] = useState<ChildTab>('profile');

  const profileQuery = useQuery({
    queryKey: QUERY_KEYS.PARENT_CHILD(numericId),
    queryFn: () => getMyChildProfile(numericId),
    enabled: Number.isFinite(numericId),
    retry: false,
  });

  const timetableQuery = useQuery({
    queryKey: QUERY_KEYS.CHILD_TIMETABLE(numericId),
    queryFn: () => getChildTimetable(numericId),
    enabled: Number.isFinite(numericId) && tab === 'timetable',
    retry: false,
  });

  const attendanceQuery = useQuery({
    queryKey: QUERY_KEYS.CHILD_ATTENDANCE(numericId),
    queryFn: () => getChildAttendance(numericId),
    enabled: Number.isFinite(numericId) && tab === 'attendance',
    retry: false,
  });

  const gradesQuery = useQuery({
    queryKey: QUERY_KEYS.CHILD_GRADES(numericId),
    queryFn: () => getChildGrades(numericId),
    enabled: Number.isFinite(numericId) && tab === 'grades',
    retry: false,
  });

  const homeworkQuery = useQuery({
    queryKey: QUERY_KEYS.CHILD_HOMEWORK(numericId),
    queryFn: () => getChildHomework(numericId),
    enabled: Number.isFinite(numericId) && tab === 'homework',
    retry: false,
  });

  const profile = profileQuery.data;

  return (
    <main className="min-h-screen bg-slate-950 px-4 py-8 text-slate-100 sm:px-6 lg:px-8">
      <div className="pointer-events-none fixed inset-0 -z-0 bg-[radial-gradient(circle_at_top_left,rgba(34,211,238,0.16),transparent_32%),radial-gradient(circle_at_top_right,rgba(168,85,247,0.14),transparent_30%),linear-gradient(180deg,#020617,#0f172a)]" />
      <section className="relative z-10 mx-auto max-w-4xl space-y-6">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <Link
            to={ROUTES.PARENT}
            className="inline-flex items-center gap-1.5 text-sm font-bold text-slate-400 transition-colors hover:text-accent-200"
          >
            <ArrowLeft className="h-4 w-4" aria-hidden="true" /> Con của tôi
          </Link>
          <div className="flex rounded-2xl border border-white/10 bg-slate-900/70 p-1">
            {TABS.map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                type="button"
                onClick={() => setTab(id)}
                className={`inline-flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-black transition-colors ${
                  tab === id ? 'bg-accent-500 text-on-accent' : 'text-slate-400 hover:text-white'
                }`}
              >
                <Icon className="h-4 w-4" aria-hidden="true" /> {label}
              </button>
            ))}
          </div>
        </div>

        {profileQuery.isLoading && (
          <div className="flex justify-center py-16 text-slate-500">
            <Loader2 className="h-8 w-8 animate-spin" />
          </div>
        )}

        {profileQuery.isError && (
          <div className="rounded-3xl border border-dashed border-white/10 p-10 text-center">
            <Baby className="mx-auto h-10 w-10 text-slate-700" aria-hidden="true" />
            <p className="mt-3 text-sm font-medium text-slate-500">
              Không xem được hồ sơ này — liên kết có thể chưa được giáo viên chủ nhiệm duyệt.
            </p>
          </div>
        )}

        {profile && tab === 'profile' && (
          <>
            <div className="rounded-3xl border border-white/10 bg-slate-900/70 p-6 backdrop-blur-xl sm:p-8">
              <div className="flex items-center gap-4">
                <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-accent-400/10 text-2xl font-black text-accent-200">
                  {(profile.child.name ?? '?').slice(0, 1).toUpperCase()}
                </div>
                <div>
                  <h1 className="text-2xl font-black tracking-tight text-white sm:text-3xl">
                    {profile.child.name || `Học sinh #${profile.child.id}`}
                  </h1>
                  <p className="mt-1 text-sm font-bold uppercase tracking-widest text-slate-500">
                    {RELATION_LABELS[profile.relation]} · hồ sơ học tập
                  </p>
                </div>
              </div>

              {profile.class ? (
                <dl className="mt-6 grid gap-3 sm:grid-cols-2">
                  <div className="rounded-2xl bg-black/25 px-4 py-3">
                    <dt className="flex items-center gap-1.5 text-xs font-black uppercase tracking-widest text-slate-500">
                      <GraduationCap className="h-4 w-4 text-accent-400" aria-hidden="true" /> Lớp
                    </dt>
                    <dd className="mt-1 font-black text-white">
                      {profile.class.name}
                      {profile.class.grade > 0 ? ` · Khối ${profile.class.grade}` : ''}
                    </dd>
                  </div>
                  <div className="rounded-2xl bg-black/25 px-4 py-3">
                    <dt className="flex items-center gap-1.5 text-xs font-black uppercase tracking-widest text-slate-500">
                      <CalendarRange className="h-4 w-4 text-accent-400" aria-hidden="true" /> Năm học
                    </dt>
                    <dd className="mt-1 font-black text-white">{profile.class.academicYear ?? '—'}</dd>
                  </div>
                  <div className="rounded-2xl bg-black/25 px-4 py-3">
                    <dt className="flex items-center gap-1.5 text-xs font-black uppercase tracking-widest text-slate-500">
                      <SchoolIcon className="h-4 w-4 text-accent-400" aria-hidden="true" /> Trường
                    </dt>
                    <dd className="mt-1 font-black text-white">
                      {profile.class.schoolName ?? '—'}
                      {profile.class.room ? ` · Phòng ${profile.class.room}` : ''}
                    </dd>
                  </div>
                  <div className="rounded-2xl bg-black/25 px-4 py-3">
                    <dt className="text-xs font-black uppercase tracking-widest text-slate-500">
                      Giáo viên chủ nhiệm
                    </dt>
                    <dd className="mt-1 font-black text-white">
                      {profile.class.homeroomTeacher?.name ?? '(chưa có)'}
                    </dd>
                    {profile.class.homeroomTeacher?.email && (
                      <dd className="text-xs font-medium text-slate-500">
                        {profile.class.homeroomTeacher.email}
                      </dd>
                    )}
                  </div>
                </dl>
              ) : (
                <p className="mt-4 text-sm font-medium text-slate-500">
                  Con chưa được xếp vào lớp nào.
                </p>
              )}
            </div>
          </>
        )}

        {tab === 'timetable' && (
          <div className="rounded-3xl border border-white/10 bg-slate-900/70 p-5 backdrop-blur-xl">
            {timetableQuery.isLoading && (
              <div className="flex justify-center py-16 text-slate-500">
                <Loader2 className="h-8 w-8 animate-spin" />
              </div>
            )}
            {timetableQuery.isError && (
              <p className="p-10 text-center text-sm font-medium text-slate-500">
                {(timetableQuery.error as { message?: string })?.message?.includes('approve')
                  ? 'Giáo viên chủ nhiệm chưa duyệt liên kết với phụ huynh.'
                  : 'Không tải được thời khóa biểu — con chưa có lớp hoặc chưa có TKK.'}
              </p>
            )}
            {timetableQuery.data && (
              <>
                <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
                  <p className="text-sm font-black text-white">
                    {timetableQuery.data.class
                      ? `Lớp ${timetableQuery.data.class.name} · Khối ${timetableQuery.data.class.grade}`
                      : 'Con chưa có lớp'}
                  </p>
                  <p className="text-xs font-bold text-slate-500">
                    {timetableQuery.data.slots.length} tiết/tuần
                  </p>
                </div>
                {timetableQuery.data.slots.length === 0 ? (
                  <p className="py-10 text-center text-sm font-medium text-slate-500">
                    Lớp chưa có thời khóa biểu — nhà trường sẽ xếp lịch sớm.
                  </p>
                ) : (
                  <TimetableGrid
                    slots={timetableQuery.data.slots}
                    periodConfig={timetableQuery.data.periodConfig}
                  />
                )}
              </>
            )}
          </div>
        )}

        {tab === 'attendance' && (
          <div className="space-y-4">
            {attendanceQuery.isLoading && (
              <div className="flex justify-center rounded-3xl border border-white/10 bg-slate-900/70 py-16 text-slate-500 backdrop-blur-xl">
                <Loader2 className="h-8 w-8 animate-spin" />
              </div>
            )}
            {attendanceQuery.isError && (
              <div className="rounded-3xl border border-dashed border-white/10 p-10 text-center">
                <p className="text-sm font-medium text-slate-500">
                  {(attendanceQuery.error as { message?: string })?.message?.includes('approve')
                    ? 'Giáo viên chủ nhiệm chưa duyệt liên kết với phụ huynh.'
                    : 'Không tải được điểm danh của con.'}
                </p>
              </div>
            )}
            {attendanceQuery.data && <ChildAttendancePanel data={attendanceQuery.data} />}
          </div>
        )}

        {tab === 'grades' && (
          <div>
            {gradesQuery.isLoading && (
              <div className="flex justify-center rounded-3xl border border-white/10 bg-slate-900/70 py-16 text-slate-500 backdrop-blur-xl">
                <Loader2 className="h-8 w-8 animate-spin" />
              </div>
            )}
            {gradesQuery.isError && (
              <div className="rounded-3xl border border-dashed border-white/10 p-10 text-center">
                <p className="text-sm font-medium text-slate-500">
                  {(gradesQuery.error as { message?: string })?.message?.includes('approve')
                    ? 'Giáo viên chủ nhiệm chưa duyệt liên kết với phụ huynh.'
                    : 'Không tải được sổ điểm của con.'}
                </p>
              </div>
            )}
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
              <div className="rounded-3xl border border-dashed border-white/10 p-10 text-center">
                <p className="text-sm font-medium text-slate-500">
                  {(homeworkQuery.error as { message?: string })?.message?.includes('approve')
                    ? 'Giáo viên chủ nhiệm chưa duyệt liên kết với phụ huynh.'
                    : 'Không tải được bài tập về nhà của con.'}
                </p>
              </div>
            )}
            {homeworkQuery.data && (
              <div className="rounded-3xl border border-white/10 bg-slate-900/70 backdrop-blur-xl">
                {homeworkQuery.data.length === 0 ? (
                  <p className="p-10 text-center text-sm font-medium text-slate-500">
                    Con chưa có bài tập về nhà nào.
                  </p>
                ) : (
                  <ul className="divide-y divide-white/5">
                    {homeworkQuery.data.map((hw) => {
                      const past = new Date(hw.dueDate).getTime() < Date.now();
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
                            <p className="mt-0.5 text-xs font-medium text-slate-500">
                              {hw.subjectName}
                              {hw.className ? ` · lớp ${hw.className}` : ''}
                              {hw.teacherName ? ` · ${hw.teacherName}` : ''}
                            </p>
                          </div>
                          {hw.countsAsGrade && (
                            <span className="rounded-full border border-amber-400/30 bg-amber-400/10 px-2.5 py-1 text-[11px] font-black text-amber-200">
                              Đầu điểm 15p
                            </span>
                          )}
                          <span
                            className={`text-xs font-black ${past ? 'text-rose-300' : 'text-slate-400'}`}
                          >
                            {past ? 'Hết hạn' : 'Hạn'}{' '}
                            {new Date(hw.dueDate).toLocaleString('vi-VN', {
                              hour: '2-digit',
                              minute: '2-digit',
                              day: '2-digit',
                              month: '2-digit',
                            })}
                          </span>
                        </li>
                      );
                    })}
                  </ul>
                )}
              </div>
            )}
          </div>
        )}
      </section>
    </main>
  );
}

/** Read-only attendance summary + recent rows for one child (no ids/emails — BE privacy). */
function ChildAttendancePanel({ data }: { data: ChildAttendance }) {
  return (
    <>
      <div className="rounded-3xl border border-white/10 bg-slate-900/70 p-5 backdrop-blur-xl">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h2 className="text-sm font-black uppercase tracking-widest text-slate-400">
            Kết quả chuyên cần
          </h2>
          <p className="text-2xl font-black text-accent-200">{data.summary.attendanceRate}%</p>
        </div>
        <div className="mt-3 grid grid-cols-2 gap-2 text-xs font-black sm:grid-cols-4">
          {(['present', 'late', 'absent', 'excused'] as const).map((st) => (
            <span key={st} className={`rounded-2xl border px-3 py-2 text-center ${STATUS_TONES[st]}`}>
              {STATUS_LABELS[st]}: {data.summary[st]}
            </span>
          ))}
        </div>
        {data.summary.unexcusedAbsences > 0 && (
          <p className="mt-3 text-xs font-bold text-rose-300">
            Vắng không phép: {data.summary.unexcusedAbsences} buổi
          </p>
        )}
      </div>
      <div className="rounded-3xl border border-white/10 bg-slate-900/70 p-5 backdrop-blur-xl">
        <h2 className="text-sm font-black uppercase tracking-widest text-slate-400">
          50 buổi gần nhất
        </h2>
        {data.records.length === 0 ? (
          <p className="py-8 text-center text-sm font-medium text-slate-500">
            Chưa có buổi điểm danh nào.
          </p>
        ) : (
          <ul className="mt-2 divide-y divide-white/5">
            {data.records.map((r, i) => (
              <li key={`${r.date}:${r.periodNumber}:${i}`} className="flex flex-wrap items-center gap-3 py-2.5">
                <span className="w-24 text-sm font-black text-slate-300">{r.date}</span>
                <span className="text-xs font-bold text-slate-500">Tiết {r.periodNumber}</span>
                <span
                  className={`rounded-lg border px-2 py-0.5 text-[11px] font-black ${STATUS_TONES[r.status]}`}
                >
                  {STATUS_LABELS[r.status]}
                </span>
                {r.note && <span className="text-xs font-medium text-slate-500">{r.note}</span>}
              </li>
            ))}
          </ul>
        )}
      </div>
    </>
  );
}
