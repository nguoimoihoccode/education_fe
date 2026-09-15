import { useMemo } from 'react';
import { Plus, X } from 'lucide-react';
import { cellKey, subjectTint, WEEKDAY_LABELS } from '@/components/school/timetable-meta';
import type { PeriodConfig, TimetableSlotView } from '@/types/school.types';

export interface TimetableGridProps {
  slots: TimetableSlotView[];
  periodConfig: PeriodConfig;
  /** Builder mode (principal): click an empty cell to add a slot there. */
  onCellClick?: (weekday: number, periodNumber: number) => void;
  /** Builder mode: small ✕ on each chip. */
  onDeleteSlot?: (slot: TimetableSlotView) => void;
  /** Cell keys (`weekday:period`) painted with a red ring — conflict preview. */
  highlightCells?: Set<string>;
}

/**
 * Weekly grid shared by every timetable view (builder, "TKK của tôi",
 * của con, của HS). Rows = tiết 1..periodsPerDay, columns = configured days.
 */
export default function TimetableGrid({
  slots,
  periodConfig,
  onCellClick,
  onDeleteSlot,
  highlightCells,
}: TimetableGridProps) {
  const days = useMemo(
    () => [...periodConfig.days].sort((a, b) => a - b),
    [periodConfig.days],
  );
  const slotMap = useMemo(() => {
    const map = new Map<string, TimetableSlotView>();
    for (const slot of slots) map.set(cellKey(slot.weekday, slot.periodNumber), slot);
    return map;
  }, [slots]);

  const periods = Array.from(
    { length: Math.max(0, periodConfig.periodsPerDay) },
    (_, i) => i + 1,
  );

  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[640px] border-separate border-spacing-1 text-left">
        <thead>
          <tr>
            <th className="w-14 rounded-xl bg-white/5 px-2 py-2 text-center text-xs font-black uppercase tracking-widest text-slate-500">
              Tiết
            </th>
            {days.map((d) => (
              <th
                key={d}
                className="rounded-xl bg-white/5 px-3 py-2 text-center text-xs font-black uppercase tracking-widest text-slate-400"
              >
                {WEEKDAY_LABELS[d] ?? `Thứ ${d}`}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {periods.map((p) => (
            <tr key={p}>
              <td className="rounded-xl bg-white/5 text-center align-middle text-sm font-black text-slate-400">
                {p}
              </td>
              {days.map((d) => {
                const key = cellKey(d, p);
                const slot = slotMap.get(key);
                const flagged = highlightCells?.has(key);
                if (!slot) {
                  return (
                    <td key={key} className="p-0 align-top">
                      {onCellClick ? (
                        <button
                          type="button"
                          onClick={() => onCellClick(d, p)}
                          aria-label={`Thêm tiết ${p} ${WEEKDAY_LABELS[d] ?? `thứ ${d}`}`}
                          className={`flex h-20 w-full items-center justify-center rounded-xl border transition-colors ${
                            flagged
                              ? 'border-rose-400/60 bg-rose-400/10'
                              : 'border-dashed border-white/10 text-slate-600 hover:border-accent-400/50 hover:bg-accent-400/5 hover:text-accent-200'
                          }`}
                        >
                          <Plus className="h-4 w-4" aria-hidden="true" />
                        </button>
                      ) : (
                        <div className="h-20 rounded-xl bg-white/[0.02]" />
                      )}
                    </td>
                  );
                }
                return (
                  <td key={key} className="p-0 align-top">
                    <div
                      style={subjectTint(slot.subject.color)}
                      className={`relative h-20 overflow-hidden rounded-xl border px-2 py-1.5 ${
                        flagged ? 'ring-2 ring-rose-400' : ''
                      }`}
                    >
                      {onDeleteSlot && (
                        <button
                          type="button"
                          onClick={() => onDeleteSlot(slot)}
                          aria-label={`Xóa tiết ${slot.subject.name}`}
                          className="absolute right-1 top-1 rounded-lg p-0.5 text-slate-500 transition-colors hover:bg-black/30 hover:text-rose-300"
                        >
                          <X className="h-3.5 w-3.5" aria-hidden="true" />
                        </button>
                      )}
                      <p className="truncate text-[13px] font-black leading-tight text-white">
                        {slot.subject.name}
                      </p>
                      <p className="mt-0.5 truncate text-[11px] font-semibold text-slate-300">
                        {slot.teacher.name ?? `GV #${slot.teacher.id}`}
                      </p>
                      <p className="mt-0.5 truncate text-[11px] font-medium text-slate-500">
                        {slot.className ? `${slot.className}` : ''}
                        {slot.className && slot.room ? ' · ' : ''}
                        {slot.room ? `P.${slot.room}` : ''}
                      </p>
                    </div>
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
