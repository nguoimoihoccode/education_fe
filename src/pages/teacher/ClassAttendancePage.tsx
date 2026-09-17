import { useEffect, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import {
  ArrowLeft, Check, ClipboardCheck, Clock3, Loader2, Save, UserX,
} from 'lucide-react';
import {
  getAttendanceHistory,
  getAttendanceSession,
  getTimetableForClass,
  takeAttendance,
} from '@/api/school.api';
import { WEEKDAY_LABELS } from '@/components/school/timetable-meta';
import { STATUS_LABELS } from '@/components/school/attendance-status';
import { QUERY_KEYS } from '@/config/query';
import type { AttendanceStatus } from '@/types/school.types';

const STATUS_META: Record<
  AttendanceStatus,
  { label: string; active: string; idle: string }
> = {
  present: {
    label: STATUS_LABELS.present,
    active: 'border-emerald-400 bg-emerald-500 text-white',
    idle: 'border-white/10 text-slate-400 hover:border-emerald-400/50 hover:text-emerald-300',
  },
  absent: {
    label: STATUS_LABELS.absent,
    active: 'border-rose-400 bg-rose-500 text-white',
    idle: 'border-white/10 text-slate-400 hover:border-rose-400/50 hover:text-rose-300',
  },
  late: {
    label: STATUS_LABELS.late,
    active: 'border-amber-400 bg-amber-500 text-slate-950',
    idle: 'border-white/10 text-slate-400 hover:border-amber-400/50 hover:text-amber-300',
  },
  excused: {
    label: STATUS_LABELS.excused,
    active: 'border-sky-400 bg-sky-500 text-white',
    idle: 'border-white/10 text-slate-400 hover:border-sky-400/50 hover:text-sky-300',
  },
};

const STATUS_ORDER: AttendanceStatus[] = ['present', 'late', 'absent', 'excused'];

function localDate(offsetDays = 0): string {
  const d = new Date();
  d.setDate(d.getDate() + offsetDays);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(
    d.getDate(),
  ).padStart(2, '0')}`;
}

interface DraftEntry {
  status?: AttendanceStatus | null;
  note?: string;
}

/** Quick attendance sheet — one class × date × period (Phase 3, plan §3.4). */
export default function ClassAttendancePage() {
  const { id = '' } = useParams<{ id: string }>();
  const queryClient = useQueryClient();
  // No client-side write gate on this page, unlike the gradebook/homework pages:
  // `AttendanceService.assertManageAccess` is the same check for reading the sheet
  // and for taking attendance (GVCN ∥ assigned teacher ∥ principal ∥ ADMIN, denial
  // = 404), so whoever gets past the isError branch below can also save it.
  const [date, setDate] = useState(() => localDate());
  const [periodNumber, setPeriodNumber] = useState(1);
  const [draft, setDraft] = useState<Record<number, DraftEntry>>({});

  const timetableQuery = useQuery({
    queryKey: QUERY_KEYS.TIMETABLE(id),
    queryFn: () => getTimetableForClass(id),
    enabled: !!id,
    retry: false,
  });
  const periodsPerDay = timetableQuery.data?.periodConfig.periodsPerDay ?? 5;

  const sessionQuery = useQuery({
    queryKey: QUERY_KEYS.ATTENDANCE_SESSION(id, date, periodNumber),
    queryFn: () => getAttendanceSession(id, date, periodNumber),
    enabled: !!id,
    retry: false,
  });
  const session = sessionQuery.data;

  // A new session = a fresh sheet: drop overrides from the previous pick.
  useEffect(() => {
    setDraft({});
  }, [id, date, periodNumber]);

  const students = useMemo(() => session?.students ?? [], [session]);
  const gradedCount = useMemo(
    () =>
      students.filter((s) => (draft[s.studentId]?.status ?? s.status) != null).length,
    [students, draft],
  );

  const saveMutation = useMutation({
    mutationFn: (records: NonNullable<Parameters<typeof takeAttendance>[0]['records']>) =>
      takeAttendance({ classId: id, date, periodNumber, records }),
    onSuccess: (result) => {
      toast.success(
        `Đã lưu ${result.saved}/${students.length} HS (mới ${result.created}, sửa ${result.updated})`,
      );
      setDraft({});
      void queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.ATTENDANCE_SESSION(id, date, periodNumber),
      });
      void queryClient.invalidateQueries({ queryKey: QUERY_KEYS.ATTENDANCE_HISTORY(id) });
    },
    onError: (error: { message?: string }) =>
      toast.error(error.message || 'Không lưu được điểm danh'),
  });

  const setStatus = (studentId: number, status: AttendanceStatus) =>
    setDraft((d) => ({ ...d, [studentId]: { ...d[studentId], status } }));
  const setNote = (studentId: number, note: string) =>
    setDraft((d) => ({ ...d, [studentId]: { ...d[studentId], note } }));

  const markAllPresent = () =>
    setDraft((d) => {
      const next = { ...d };
      for (const s of students) next[s.studentId] = { ...next[s.studentId], status: 'present' };
      return next;
    });

  const save = () => {
    const records = students
      .map((s) => {
        const eff = draft[s.studentId] ?? {};
        const status = eff.status ?? s.status;
        if (!status) return null;
        const note = (eff.note ?? s.note ?? '').trim();
        return { studentId: s.studentId, status, ...(note ? { note } : {}) };
      })
      .filter((r): r is { studentId: number; status: AttendanceStatus; note?: string } => r !== null);
    if (records.length === 0) {
      toast.error('Chưa chấm học sinh nào — chọn trạng thái trước khi lưu');
      return;
    }
    saveMutation.mutate(records);
  };

  // 30-day history for this class (summary chips + recent rows)
  const historyWindow = useMemo(() => ({ from: localDate(-30), to: localDate() }), []);
  const historyQuery = useQuery({
    queryKey: QUERY_KEYS.ATTENDANCE_HISTORY(id),
    queryFn: () => getAttendanceHistory(id, historyWindow.from, historyWindow.to),
    enabled: !!id,
    retry: false,
  });

  return (
    <main className="min-h-screen bg-slate-950 px-4 py-8 text-slate-100 sm:px-6 lg:px-8">
      <div className="pointer-events-none fixed inset-0 -z-0 bg-[radial-gradient(circle_at_top_left,rgba(34,211,238,0.16),transparent_32%),radial-gradient(circle_at_top_right,rgba(168,85,247,0.14),transparent_30%),linear-gradient(180deg,#020617,#0f172a)]" />
      <section className="relative z-10 mx-auto max-w-5xl space-y-6">
        <div>
          <Link
            to={`/teaching/classes/${id}`}
            className="inline-flex items-center gap-1.5 text-sm font-bold text-slate-400 transition-colors hover:text-accent-200"
          >
            <ArrowLeft className="h-4 w-4" aria-hidden="true" /> Lớp chủ nhiệm
          </Link>
          <h1 className="mt-2 flex items-center gap-2 text-3xl font-black tracking-tight text-white">
            <ClipboardCheck className="h-7 w-7 text-accent-400" aria-hidden="true" />
            Điểm danh nhanh
            {session && <span className="text-lg font-black text-slate-500">· {session.className}</span>}
          </h1>
        </div>

        {/* ---------- session picker ---------- */}
        <div className="flex flex-wrap items-end gap-4 rounded-3xl border border-white/10 bg-slate-900/70 p-5 backdrop-blur-xl">
          <label className="space-y-1">
            <span className="block text-xs font-black uppercase tracking-widest text-slate-500">Ngày</span>
            <input
              type="date"
              value={date}
              onChange={(e) => e.target.value && setDate(e.target.value)}
              className="min-h-11 rounded-xl border border-white/10 bg-black/25 px-3 text-sm font-black text-white outline-none focus:border-accent-400/60"
            />
          </label>
          <label className="space-y-1">
            <span className="block text-xs font-black uppercase tracking-widest text-slate-500">Tiết</span>
            <select
              value={periodNumber}
              onChange={(e) => setPeriodNumber(Number(e.target.value))}
              className="min-h-11 w-28 rounded-xl border border-white/10 bg-black/25 px-3 text-sm font-black text-white outline-none focus:border-accent-400/60"
            >
              {Array.from({ length: periodsPerDay }, (_, i) => i + 1).map((p) => (
                <option key={p} value={p}>
                  Tiết {p}
                </option>
              ))}
            </select>
          </label>
          {session && (
            <p className="flex-1 text-sm font-bold text-slate-400">
              {WEEKDAY_LABELS[session.weekday] ?? `Thứ ${session.weekday}`} ·{' '}
              {session.slot ? (
                <span className="text-white">
                  {session.slot.subjectName ?? 'Tiết không môn'}
                  {session.slot.teacherName ? ` — ${session.slot.teacherName}` : ''}
                </span>
              ) : (
                <span className="text-amber-300">không có trong TKK — vẫn chấm được</span>
              )}
            </p>
          )}
        </div>

        {/* ---------- sheet ---------- */}
        <div className="rounded-3xl border border-white/10 bg-slate-900/70 backdrop-blur-xl">
          {sessionQuery.isLoading && (
            <div className="flex justify-center py-16 text-slate-500">
              <Loader2 className="h-8 w-8 animate-spin" />
            </div>
          )}
          {sessionQuery.isError && (
            <div className="p-10 text-center">
              <UserX className="mx-auto h-8 w-8 text-slate-700" aria-hidden="true" />
              <p className="mt-2 text-sm font-medium text-slate-500">
                Không tải được lớp này (bạn cần là GVCN hoặc GV bộ môn của lớp).
              </p>
            </div>
          )}
          {session && students.length === 0 && (
            <p className="p-10 text-center text-sm font-medium text-slate-500">
              Lớp chưa có học sinh nào.
            </p>
          )}
          {students.length > 0 && (
            <div>
              <ul className="divide-y divide-white/5">
                {students.map((s) => {
                  const eff = draft[s.studentId] ?? {};
                  const status = eff.status ?? s.status;
                  const note = eff.note ?? s.note ?? '';
                  return (
                    <li key={s.studentId} className="flex flex-wrap items-center gap-3 px-5 py-3">
                      <div className="min-w-0 flex-1">
                        <p className="truncate font-black text-white">
                          {s.name || '(chưa có tên)'}
                        </p>
                        <p className="truncate text-xs font-medium text-slate-600">{s.email}</p>
                      </div>
                      <div className="flex gap-1.5" role="group" aria-label={`Trạng thái của ${s.name || s.studentId}`}>
                        {STATUS_ORDER.map((st) => (
                          <button
                            key={st}
                            type="button"
                            onClick={() => setStatus(s.studentId, st)}
                            className={`rounded-lg border px-2.5 py-1 text-[11px] font-black transition-colors ${
                              status === st ? STATUS_META[st].active : STATUS_META[st].idle
                            }`}
                          >
                            {STATUS_META[st].label}
                          </button>
                        ))}
                      </div>
                      <input
                        value={note}
                        onChange={(e) => setNote(s.studentId, e.target.value)}
                        maxLength={255}
                        placeholder="Ghi chú…"
                        className="h-8 w-40 rounded-lg border border-white/10 bg-black/25 px-2 text-xs font-medium text-white outline-none placeholder:text-slate-600 focus:border-accent-400/60"
                      />
                    </li>
                  );
                })}
              </ul>
              <div className="flex flex-wrap items-center gap-3 border-t border-white/5 px-5 py-4">
                <button
                  type="button"
                  onClick={markAllPresent}
                  className="inline-flex items-center gap-1.5 rounded-xl border border-emerald-400/30 px-3 py-2 text-xs font-black text-emerald-300 transition-colors hover:bg-emerald-400/10"
                >
                  <Check className="h-3.5 w-3.5" aria-hidden="true" /> Tất cả có mặt
                </button>
                <p className="text-xs font-bold text-slate-500">
                  Đã chấm {gradedCount}/{students.length}
                </p>
                <button
                  type="button"
                  onClick={save}
                  disabled={saveMutation.isPending}
                  className="ml-auto inline-flex items-center gap-1.5 rounded-xl bg-accent-500 px-4 py-2 text-sm font-black text-white transition-colors hover:bg-accent-400 disabled:opacity-50"
                >
                  {saveMutation.isPending ? (
                    <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
                  ) : (
                    <Save className="h-4 w-4" aria-hidden="true" />
                  )}
                  Lưu điểm danh
                </button>
              </div>
            </div>
          )}
        </div>

        {/* ---------- 30-day history ---------- */}
        {historyQuery.data && historyQuery.data.summary.totalSessions > 0 && (
          <div className="rounded-3xl border border-white/10 bg-slate-900/70 p-5 backdrop-blur-xl">
            <h2 className="flex items-center gap-2 text-sm font-black uppercase tracking-widest text-slate-400">
              <Clock3 className="h-4 w-4 text-accent-400" aria-hidden="true" />
              30 ngày gần nhất ({historyWindow.from} → {historyWindow.to})
            </h2>
            <div className="mt-3 flex flex-wrap gap-2 text-xs font-black">
              <span className="rounded-full border border-accent-400/30 bg-accent-400/10 px-3 py-1 text-accent-200">
                Chuyên cần {historyQuery.data.summary.attendanceRate}%
              </span>
              <span className="rounded-full border border-emerald-400/30 bg-emerald-400/10 px-3 py-1 text-emerald-200">
                {historyQuery.data.summary.present} có mặt
              </span>
              <span className="rounded-full border border-amber-400/30 bg-amber-400/10 px-3 py-1 text-amber-200">
                {historyQuery.data.summary.late} trễ
              </span>
              <span className="rounded-full border border-rose-400/30 bg-rose-400/10 px-3 py-1 text-rose-200">
                {historyQuery.data.summary.absent} vắng
                {historyQuery.data.summary.unexcusedAbsences > 0
                  ? ` (${historyQuery.data.summary.unexcusedAbsences} không phép)`
                  : ''}
              </span>
              <span className="rounded-full border border-sky-400/30 bg-sky-400/10 px-3 py-1 text-sky-200">
                {historyQuery.data.summary.excused} có phép
              </span>
            </div>
            <div className="mt-4 max-h-72 overflow-y-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="text-xs font-black uppercase tracking-widest text-slate-500">
                    <th className="py-1.5 pr-3">Ngày</th>
                    <th className="py-1.5 pr-3">Tiết</th>
                    <th className="py-1.5 pr-3">Học sinh</th>
                    <th className="py-1.5 pr-3">Trạng thái</th>
                    <th className="py-1.5">Ghi chú</th>
                  </tr>
                </thead>
                <tbody>
                  {historyQuery.data.records.slice(0, 50).map((r) => (
                    <tr key={r.recordId} className="border-t border-white/5">
                      <td className="py-1.5 pr-3 font-semibold text-slate-400">{r.date}</td>
                      <td className="py-1.5 pr-3 font-semibold text-slate-400">{r.periodNumber}</td>
                      <td className="py-1.5 pr-3 font-black text-white">{r.studentName || `HS #${r.studentId}`}</td>
                      <td className="py-1.5 pr-3">
                        <span
                          className={`rounded-lg border px-2 py-0.5 text-[11px] font-black ${STATUS_META[r.status].active}`}
                        >
                          {STATUS_META[r.status].label}
                        </span>
                      </td>
                      <td className="py-1.5 text-xs font-medium text-slate-500">{r.note ?? ''}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </section>
    </main>
  );
}
