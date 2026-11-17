import { useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { CircleDollarSign, Loader2 } from 'lucide-react';
import { assessmentApi } from '@/api/assessment.api';
import { listClasses } from '@/api/school.api';
import { formatUsd, gradingPartLabel, vnDay } from '../admin/costFormat';

const RANGES = [7, 30, 90] as const;
const int = (n: number) => n.toLocaleString('vi-VN');

function Stat({ label, value, hint }: { label: string; value: string; hint?: string }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-black/25 p-4">
      <dt className="text-xs font-bold uppercase tracking-widest text-slate-500">{label}</dt>
      <dd className="mt-1 text-xl font-black text-white">{value}</dd>
      {hint && <p className="mt-1 text-xs font-medium text-slate-400">{hint}</p>}
    </div>
  );
}

const th = 'px-4 py-3';
const td = 'px-4 py-3 text-right';

/** Principal view: what grading cost the school, per day and per assessment. */
export default function AssessmentCostsPage() {
  const [days, setDays] = useState<(typeof RANGES)[number]>(30);
  const from = vnDay(days - 1);
  const to = vnDay(0);
  const report = useQuery({ queryKey: ['assessments', 'cost-summary', from, to], queryFn: () => assessmentApi.costSummary(from, to) });
  const classes = useQuery({ queryKey: ['school', 'classes'], queryFn: listClasses });
  const className = useMemo(() => new Map((classes.data ?? []).map((c) => [c.id, c.name])), [classes.data]);
  const data = report.data;

  return (
    <div className="mx-auto max-w-6xl space-y-6 p-4 sm:p-6">
      <header className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="flex items-center gap-2 text-2xl font-black text-white"><CircleDollarSign size={24} /> Chi phí chấm bài</h1>
          <p className="text-sm text-slate-400">Tiền gọi model AI khi chấm bài thi của trường, tính theo giờ Việt Nam ({from} → {to}).</p>
        </div>
        <div role="group" aria-label="Khoảng thời gian" className="flex gap-2">
          {RANGES.map((n) => (
            <button key={n} type="button" aria-pressed={days === n} onClick={() => setDays(n)}
              className={`rounded-xl px-3 py-2 text-sm font-bold ${days === n ? 'bg-cyan-500 text-black' : 'bg-white/5 text-slate-300'}`}>{n} ngày</button>
          ))}
        </div>
      </header>

      {report.isPending && <p role="status" className="flex items-center gap-2 text-slate-400"><Loader2 className="animate-spin" size={16} /> Đang tải…</p>}
      {report.isError && <p role="alert" className="text-rose-300">Chưa tải được chi phí chấm bài. Vui lòng thử lại.</p>}

      {data && (
        <>
          <dl className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            <Stat label="Chi phí đã biết" value={formatUsd(data.knownCostMicros)} hint={`${int(data.calls)} lượt gọi model`} />
            <Stat label="Chưa rõ chi phí" value={`${int(data.unknownCostCalls)} lượt`}
              hint={data.unknownCostCalls ? `Tối đa ${formatUsd(data.upperBoundCostMicros)} nếu tính cả phần giữ chỗ` : 'Không cộng vào chi phí đã biết'} />
            <Stat label="Mỗi bài đã ghi sổ" value={data.knownCostPerFinalizedMicros === null ? '—' : formatUsd(data.knownCostPerFinalizedMicros)} hint={`${int(data.finalizedSubmissions)} bài đã ghi sổ`} />
            <Stat label="Token vào / ra" value={`${int(data.inputTokens)} / ${int(data.outputTokens)}`} hint={data.retries.calls ? `${int(data.retries.calls)} lượt gọi lại sau lỗi` : undefined} />
          </dl>

          {data.byDay.length > 0 && (
            <div className="h-64 rounded-2xl border border-white/10 bg-black/25 p-4">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data.byDay.map((d) => ({ day: d.day.slice(5), usd: d.knownCostMicros / 1_000_000 }))}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                  <XAxis dataKey="day" stroke="#94a3b8" fontSize={12} />
                  <YAxis stroke="#94a3b8" fontSize={12} />
                  <Tooltip formatter={(v) => formatUsd(Number(v) * 1_000_000)} />
                  <Bar dataKey="usd" name="Chi phí đã biết" fill="#22d3ee" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}

          <section className="space-y-2">
            <h2 className="text-lg font-black text-white">Theo đợt chấm</h2>
            {data.byAssessment.length === 0 ? <p className="text-sm text-slate-400">Chưa có đợt chấm nào gọi model trong khoảng này.</p> : (
              <div className="overflow-x-auto rounded-2xl border border-white/10">
                <table className="w-full min-w-[720px] text-left text-sm" aria-label="Chi phí theo đợt chấm">
                  <thead className="bg-white/5 text-xs uppercase tracking-widest text-slate-400">
                    <tr><th className={th}>Đợt chấm</th><th className={th}>Lớp</th><th className={td}>Lượt gọi</th><th className={td}>Chi phí đã biết</th><th className={td}>Bài đã ghi sổ</th><th className={td}>Mỗi bài</th><th className={td}>Chưa rõ</th></tr>
                  </thead>
                  <tbody>
                    {data.byAssessment.map((a) => (
                      <tr key={a.assessmentId} className="border-t border-white/5 font-semibold text-slate-200">
                        <td className={th}>{a.title ?? 'Đợt chấm đã xoá'}</td>
                        <td className={th}>{(a.classId && className.get(a.classId)) ?? '—'}</td>
                        <td className={td}>{int(a.calls)}</td>
                        <td className={td}>{formatUsd(a.knownCostMicros)}</td>
                        <td className={td}>{int(a.finalizedSubmissions)}</td>
                        <td className={td}>{a.knownCostPerFinalizedMicros === null ? '—' : formatUsd(a.knownCostPerFinalizedMicros)}</td>
                        <td className={td}>{a.unknownCostCalls ? `${int(a.unknownCostCalls)} lượt` : '—'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>

          {data.byPurpose.length > 0 && (
            <section className="space-y-2">
              <h2 className="text-lg font-black text-white">Theo vai trò model</h2>
              <div className="overflow-x-auto rounded-2xl border border-white/10">
                <table className="w-full min-w-[560px] text-left text-sm" aria-label="Chi phí theo vai trò model">
                  <thead className="bg-white/5 text-xs uppercase tracking-widest text-slate-400">
                    <tr><th className={th}>Vai trò</th><th className={td}>Lượt gọi</th><th className={td}>Token vào / ra</th><th className={td}>Chi phí đã biết</th><th className={td}>Chưa rõ</th></tr>
                  </thead>
                  <tbody>
                    {data.byPurpose.map((p) => (
                      <tr key={p.purpose} className="border-t border-white/5 font-semibold text-slate-200">
                        <td className={th}>{gradingPartLabel(p.purpose)}</td>
                        <td className={td}>{int(p.calls)}</td>
                        <td className={td}>{int(p.inputTokens)} / {int(p.outputTokens)}</td>
                        <td className={td}>{formatUsd(p.knownCostMicros)}</td>
                        <td className={td}>{p.unknownCostCalls ? `${int(p.unknownCostCalls)} lượt` : '—'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>
          )}
        </>
      )}
    </div>
  );
}
