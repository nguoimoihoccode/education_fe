import { useEffect, useMemo, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { CalendarRange, Loader2, Plus, Save, Settings2, X } from 'lucide-react';
import TimetableGrid from '@/components/school/TimetableGrid';
import {
  FALLBACK_PERIOD_CONFIG,
  WEEKDAY_LABELS,
  cellKey,
} from '@/components/school/timetable-meta';
import {
  createTimetableSlot,
  deleteTimetableSlot,
  getTimetableForClass,
  listAssignments,
  listClasses,
  updatePeriodConfig,
} from '@/api/school.api';
import { QUERY_KEYS } from '@/config/query';
import type { PeriodConfig, TimetableSlotView } from '@/types/school.types';

const ALL_DAYS = [2, 3, 4, 5, 6, 7, 1]; // Thứ 2..Thứ 7, CN — order shown in the editor

interface SlotForm {
  assignmentId: string;
  weekday: number;
  periodNumber: number;
  room: string;
}

export default function TimetablePage() {
  const queryClient = useQueryClient();
  const [classId, setClassId] = useState('');
  const [modal, setModal] = useState<SlotForm | null>(null);
  const [configDraft, setConfigDraft] = useState<PeriodConfig | null>(null);

  const classesQuery = useQuery({ queryKey: QUERY_KEYS.SCHOOL_CLASSES, queryFn: listClasses });
  useEffect(() => {
    if (!classId && classesQuery.data && classesQuery.data.length > 0) {
      setClassId(classesQuery.data[0].id);
    }
  }, [classId, classesQuery.data]);

  const timetableQuery = useQuery({
    queryKey: QUERY_KEYS.TIMETABLE(classId),
    queryFn: () => getTimetableForClass(classId),
    enabled: !!classId,
    retry: false,
  });
  const timetable = timetableQuery.data;
  const periodConfig: PeriodConfig = timetable?.periodConfig ?? FALLBACK_PERIOD_CONFIG;

  const assignmentsQuery = useQuery({
    queryKey: [QUERY_KEYS.SCHOOL_ASSIGNMENTS, classId],
    queryFn: () => listAssignments({ classId }),
    enabled: !!classId,
  });
  const pairs = useMemo(
    () =>
      (assignmentsQuery.data ?? []).map((a) => ({
        assignmentId: a.id,
        subjectId: a.subjectId,
        teacherId: a.teacherId,
        label: `${a.subject?.name ?? 'Môn ?'} — ${a.teacher?.name ?? `GV #${a.teacherId}`}`,
      })),
    [assignmentsQuery.data],
  );

  const createMutation = useMutation({
    mutationFn: (form: SlotForm) => {
      const pair = pairs.find((p) => p.assignmentId === form.assignmentId);
      if (!pair) throw new Error('Hãy chọn môn và giáo viên được phân công');
      return createTimetableSlot({
        classId,
        subjectId: pair.subjectId,
        teacherId: pair.teacherId,
        weekday: form.weekday,
        periodNumber: form.periodNumber,
        room: form.room.trim() || undefined,
      });
    },
    onSuccess: (slot) => {
      setModal(null);
      toast.success(`Đã thêm ${slot.subject.name}`);
      void queryClient.invalidateQueries({ queryKey: QUERY_KEYS.TIMETABLE(classId) });
    },
    onError: (error: { message?: string }) => toast.error(error.message || 'Không thêm được tiết'),
  });

  const deleteMutation = useMutation({
    mutationFn: (slotId: string) => deleteTimetableSlot(slotId),
    onSuccess: async () => {
      toast.success('Đã xóa tiết');
      await queryClient.invalidateQueries({ queryKey: QUERY_KEYS.TIMETABLE(classId) });
    },
    onError: (error: { message?: string }) => toast.error(error.message || 'Không xóa được'),
  });

  const configMutation = useMutation({
    mutationFn: (config: PeriodConfig) =>
      updatePeriodConfig({ periodsPerDay: config.periodsPerDay, days: config.days }),
    onSuccess: async () => {
      toast.success('Đã cập nhật cấu trúc buổi học');
      setConfigDraft(null);
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['timetable'] }),
        queryClient.invalidateQueries({ queryKey: QUERY_KEYS.SCHOOL_ME }),
      ]);
    },
    onError: (error: { message?: string }) => toast.error(error.message || 'Không cập nhật được'),
  });

  // Conflict preview: the target cell + every cell of the chosen pair.
  const highlight = useMemo(() => {
    const set = new Set<string>();
    if (!modal || !timetable) return set;
    const target = cellKey(modal.weekday, modal.periodNumber);
    if (timetable.slots.some((s) => cellKey(s.weekday, s.periodNumber) === target)) set.add(target);
    const pair = pairs.find((p) => p.assignmentId === modal.assignmentId);
    if (pair) {
      for (const s of timetable.slots) {
        if (s.subject.id === pair.subjectId && s.teacher.id === pair.teacherId) {
          set.add(cellKey(s.weekday, s.periodNumber));
        }
      }
    }
    return set;
  }, [modal, timetable, pairs]);

  const openModal = (weekday: number, periodNumber: number) => {
    setConfigDraft(null);
    setModal({ assignmentId: '', weekday, periodNumber, room: '' });
  };

  const removeSlot = (slot: TimetableSlotView) => {
    if (window.confirm(`Xóa ${slot.subject.name} (${WEEKDAY_LABELS[slot.weekday]} tiết ${slot.periodNumber}) khỏi thời khóa biểu?`)) {
      deleteMutation.mutate(slot.id);
    }
  };

  const shownConfig = configDraft ?? periodConfig;

  return (
    <main className="min-h-screen bg-slate-950 px-4 py-8 text-slate-100 sm:px-6 lg:px-8">
      <div className="pointer-events-none fixed inset-0 -z-0 bg-[radial-gradient(circle_at_top_left,rgba(34,211,238,0.16),transparent_32%),radial-gradient(circle_at_top_right,rgba(168,85,247,0.14),transparent_30%),linear-gradient(180deg,#020617,#0f172a)]" />
      <section className="relative z-10 mx-auto max-w-6xl space-y-6">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <h1 className="flex items-center gap-2 text-3xl font-black tracking-tight text-white">
              <CalendarRange className="h-7 w-7 text-accent-400" aria-hidden="true" />
              Thời khoá biểu
            </h1>
            <p className="mt-1 text-sm font-medium text-slate-500">
              Bấm vào ô trống để thêm tiết. BE chặn trùng GV/phòng trước khi ghi — xung đột hiện tại chỗ.
            </p>
          </div>
          <label className="space-y-1">
            <span className="block text-xs font-black uppercase tracking-widest text-slate-500">Lớp</span>
            <select
              value={classId}
              onChange={(e) => setClassId(e.target.value)}
              className="min-h-11 w-56 rounded-xl border border-white/10 bg-slate-900 px-3 text-sm font-black text-white outline-none focus:border-accent-400/60"
            >
              {(classesQuery.data ?? []).map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name} · Khối {c.grade}
                </option>
              ))}
            </select>
          </label>
        </div>

        {/* ---------- period structure editor ---------- */}
        <div className="rounded-3xl border border-white/10 bg-slate-900/70 p-5 backdrop-blur-xl">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h2 className="flex items-center gap-2 text-sm font-black uppercase tracking-widest text-slate-400">
              <Settings2 className="h-4 w-4 text-accent-400" aria-hidden="true" />
              Cấu trúc buổi học ({periodConfig.periodsPerDay} tiết × {periodConfig.days.length} ngày/tuần)
            </h2>
            {configDraft ? (
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => configMutation.mutate(configDraft)}
                  disabled={configMutation.isPending || configDraft.days.length === 0}
                  className="inline-flex items-center gap-1.5 rounded-xl bg-accent-500 px-3 py-1.5 text-xs font-black text-on-accent transition-colors hover:bg-accent-400 disabled:opacity-50"
                >
                  <Save className="h-3.5 w-3.5" aria-hidden="true" />
                  {configMutation.isPending ? 'Đang lưu…' : 'Lưu'}
                </button>
                <button
                  type="button"
                  onClick={() => setConfigDraft(null)}
                  className="rounded-xl border border-white/10 px-3 py-1.5 text-xs font-black text-slate-400 hover:text-white"
                >
                  Hủy
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => setConfigDraft({ ...periodConfig, days: [...periodConfig.days] })}
                className="rounded-xl border border-accent-400/30 px-3 py-1.5 text-xs font-black text-accent-200 transition-colors hover:bg-accent-400/10"
              >
                Chỉnh sửa
              </button>
            )}
          </div>
          {configDraft && (
            <div className="mt-4 flex flex-wrap items-center gap-x-6 gap-y-3">
              <label className="flex items-center gap-2 text-sm font-bold text-slate-300">
                Số tiết/ngày
                <input
                  type="number"
                  min={1}
                  max={12}
                  value={configDraft.periodsPerDay}
                  onChange={(e) =>
                    setConfigDraft((d) =>
                      d ? { ...d, periodsPerDay: Math.min(12, Math.max(1, Number(e.target.value) || 1)) } : d,
                    )
                  }
                  className="h-9 w-16 rounded-xl border border-white/10 bg-black/25 px-2 text-center font-black text-white outline-none focus:border-accent-400/60"
                />
              </label>
              <div className="flex flex-wrap gap-1.5">
                {ALL_DAYS.map((d) => {
                  const on = configDraft.days.includes(d);
                  return (
                    <button
                      key={d}
                      type="button"
                      onClick={() =>
                        setConfigDraft((cur) =>
                          cur
                            ? {
                                ...cur,
                                days: on
                                  ? cur.days.filter((x) => x !== d)
                                  : [...cur.days, d].sort((a, b) => a - b),
                              }
                            : cur,
                        )
                      }
                      className={`rounded-xl border px-3 py-1.5 text-xs font-black transition-colors ${
                        on
                          ? 'border-accent-400/50 bg-accent-400/15 text-accent-200'
                          : 'border-white/10 text-slate-500 hover:text-white'
                      }`}
                    >
                      {WEEKDAY_LABELS[d]}
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* ---------- grid ---------- */}
        <div className="rounded-3xl border border-white/10 bg-slate-900/70 p-5 backdrop-blur-xl">
          {timetableQuery.isLoading && (
            <div className="flex justify-center py-16 text-slate-500">
              <Loader2 className="h-8 w-8 animate-spin" />
            </div>
          )}
          {timetableQuery.isError && classId && (
            <p className="p-10 text-center text-sm font-medium text-slate-500">
              Không tải được thời khóa biểu của lớp này.
            </p>
          )}
          {timetable && (
            <>
              <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
                <p className="text-sm font-black text-white">
                  {timetable.className}
                  <span className="ml-2 font-medium text-slate-500">
                    {timetable.academicYear ? `· ${timetable.academicYear}` : ''} · {timetable.slots.length} tiết/tuần
                  </span>
                </p>
                <button
                  type="button"
                  onClick={() =>
                    openModal(
                      periodConfig.days[0] ?? 2,
                      1,
                    )
                  }
                  className="inline-flex items-center gap-1.5 rounded-xl bg-accent-500 px-3 py-1.5 text-xs font-black text-on-accent transition-colors hover:bg-accent-400"
                >
                  <Plus className="h-3.5 w-3.5" aria-hidden="true" /> Thêm tiết
                </button>
              </div>
              <TimetableGrid
                slots={timetable.slots}
                periodConfig={shownConfig}
                onCellClick={openModal}
                onDeleteSlot={removeSlot}
                highlightCells={highlight}
              />
            </>
          )}
        </div>
      </section>

      {/* ---------- add-slot modal ---------- */}
      {modal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm"
          role="dialog"
          aria-modal="true"
          onClick={() => setModal(null)}
        >
          <form
            onClick={(event) => event.stopPropagation()}
            onSubmit={(event) => {
              event.preventDefault();
              createMutation.mutate(modal);
            }}
            className="w-full max-w-md space-y-4 rounded-3xl border border-white/10 bg-slate-900 p-6 shadow-2xl"
          >
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-black text-white">
                Thêm tiết {modal.periodNumber} · {WEEKDAY_LABELS[modal.weekday]}
              </h2>
              <button
                type="button"
                onClick={() => setModal(null)}
                aria-label="Đóng"
                className="rounded-xl p-1.5 text-slate-500 hover:bg-white/5 hover:text-white"
              >
                <X className="h-5 w-5" aria-hidden="true" />
              </button>
            </div>

            <label className="block space-y-1">
              <span className="text-xs font-black uppercase tracking-widest text-slate-500">
                Môn — Giáo viên (theo phân công)
              </span>
              <select
                required
                value={modal.assignmentId}
                onChange={(e) => setModal((m) => (m ? { ...m, assignmentId: e.target.value } : m))}
                className="min-h-11 w-full rounded-xl border border-white/10 bg-black/25 px-3 text-sm font-semibold text-white outline-none focus:border-accent-400/60"
              >
                <option value="" disabled>
                  Chọn môn và giáo viên…
                </option>
                {pairs.map((p) => (
                  <option key={p.assignmentId} value={p.assignmentId}>
                    {p.label}
                  </option>
                ))}
              </select>
              {pairs.length === 0 && !assignmentsQuery.isLoading && (
                <p className="text-xs font-medium text-amber-300">
                  Lớp này chưa có phân công giảng dạy nào — thêm ở trang Giáo viên trước.
                </p>
              )}
            </label>

            <div className="grid grid-cols-2 gap-3">
              <label className="block space-y-1">
                <span className="text-xs font-black uppercase tracking-widest text-slate-500">Ngày</span>
                <select
                  value={modal.weekday}
                  onChange={(e) => setModal((m) => (m ? { ...m, weekday: Number(e.target.value) } : m))}
                  className="min-h-11 w-full rounded-xl border border-white/10 bg-black/25 px-3 text-sm font-semibold text-white outline-none focus:border-accent-400/60"
                >
                  {periodConfig.days.map((d) => (
                    <option key={d} value={d}>
                      {WEEKDAY_LABELS[d]}
                    </option>
                  ))}
                </select>
              </label>
              <label className="block space-y-1">
                <span className="text-xs font-black uppercase tracking-widest text-slate-500">Tiết</span>
                <select
                  value={modal.periodNumber}
                  onChange={(e) =>
                    setModal((m) => (m ? { ...m, periodNumber: Number(e.target.value) } : m))
                  }
                  className="min-h-11 w-full rounded-xl border border-white/10 bg-black/25 px-3 text-sm font-semibold text-white outline-none focus:border-accent-400/60"
                >
                  {Array.from({ length: periodConfig.periodsPerDay }, (_, i) => i + 1).map((p) => (
                    <option key={p} value={p}>
                      Tiết {p}
                    </option>
                  ))}
                </select>
              </label>
            </div>

            <label className="block space-y-1">
              <span className="text-xs font-black uppercase tracking-widest text-slate-500">
                Phòng học <span className="normal-case text-slate-600">(tùy chọn)</span>
              </span>
              <input
                value={modal.room}
                onChange={(e) => setModal((m) => (m ? { ...m, room: e.target.value } : m))}
                maxLength={50}
                placeholder="A102, Lab Hóa…"
                className="min-h-11 w-full rounded-xl border border-white/10 bg-slate-950/60 px-3 text-sm font-semibold text-white outline-none focus:border-accent-400/60"
              />
            </label>

            <button
              type="submit"
              disabled={createMutation.isPending || !modal.assignmentId}
              className="min-h-11 w-full rounded-xl bg-accent-500 px-4 text-sm font-black text-on-accent transition-colors hover:bg-accent-400 disabled:opacity-50"
            >
              {createMutation.isPending ? 'Đang lưu…' : 'Thêm vào TKK'}
            </button>
          </form>
        </div>
      )}
    </main>
  );
}
