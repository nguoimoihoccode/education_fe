import { GraduationCap } from 'lucide-react';
import {
  TEST_TYPE_LABELS,
  TEST_TYPE_TONES,
  TEST_TYPES,
  scoreTone,
} from '@/components/school/grades-meta';
import type { SubjectGrades } from '@/types/school.types';

/** Read-only per-subject grade cards — shared by student (/grades/me) and parent views. */
export default function StudentGradesPanel({ subjects }: { subjects: SubjectGrades[] }) {
  if (subjects.length === 0) {
    return (
      <div className="rounded-3xl border border-dashed border-white/10 p-10 text-center">
        <GraduationCap className="mx-auto h-8 w-8 text-slate-700" aria-hidden="true" />
        <p className="mt-2 text-sm font-medium text-slate-500">
          Chưa có đầu điểm nào — giáo viên sẽ nhập điểm sau các bài kiểm tra.
        </p>
      </div>
    );
  }
  return (
    <div className="space-y-4">
      {subjects.map((s) => (
        <div key={`${s.subjectId}:${s.term}`} className="rounded-3xl border border-white/10 bg-slate-900/70 p-5 backdrop-blur-xl">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h2 className="flex items-center gap-2 text-lg font-black text-white">
              {s.subjectName || 'Môn học'}
              <span className="rounded-full border border-white/10 px-2 py-0.5 text-[11px] font-black uppercase tracking-wider text-slate-400">
                HK {s.term === 1 ? 'I' : 'II'}
              </span>
              {s.rank != null && (
                <span
                  title={`Xếp hạng theo điểm trong lớp (đồng hạng tính trùng)`}
                  className="rounded-full border border-amber-400/30 bg-amber-400/10 px-2 py-0.5 text-[11px] font-black uppercase tracking-wider text-amber-200"
                >
                  🏅 Hạng {s.rank}/{s.rankedCount}
                </span>
              )}
            </h2>
            <div className="flex flex-wrap items-center gap-2 text-xs font-black">
              <span className="rounded-xl border border-emerald-400/25 bg-emerald-400/5 px-3 py-1.5 text-slate-300">
                TB giữa kỳ:{' '}
                <b className={s.midterm == null ? 'text-slate-600' : scoreTone(s.midterm)}>
                  {s.midterm ?? '—'}
                </b>
              </span>
              {s.final != null && (
                <span className="rounded-xl border border-violet-400/25 bg-violet-400/5 px-3 py-1.5 text-slate-300">
                  TB cuối kỳ:{' '}
                  <b className={scoreTone(s.final)}>{s.final}</b>
                </span>
              )}
              {s.year != null && (
                <span className="rounded-xl border border-accent-400/30 bg-accent-400/10 px-3 py-1.5 text-accent-200">
                  TB cả năm: {s.year}
                </span>
              )}
            </div>
          </div>

          <div className="mt-3 flex flex-wrap gap-x-5 gap-y-2">
            {TEST_TYPES.map((t) => (
              <div key={t} className="flex items-center gap-1.5">
                <span className="text-[11px] font-black uppercase tracking-wider text-slate-500">
                  {TEST_TYPE_LABELS[t]}
                </span>
                {s.entries
                  .filter((e) => e.testType === t)
                  .map((e) => (
                    <span
                      key={e.id}
                      title={`${e.date}${e.homeworkId ? ' · tự sinh từ BTVN' : ''}`}
                      className={`rounded-lg border px-2 py-0.5 text-xs font-black ${TEST_TYPE_TONES[t]}`}
                    >
                      {e.homeworkId && <span className="mr-0.5">⚡</span>}
                      {e.score}
                    </span>
                  ))}
                {s.byType[t] == null && s.entries.every((e) => e.testType !== t) && (
                  <span className="text-xs font-bold text-slate-700">—</span>
                )}
                {s.byType[t] != null && (
                  <span className={`text-xs font-black ${scoreTone(s.byType[t])}`}>
                    TB {s.byType[t]}
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
