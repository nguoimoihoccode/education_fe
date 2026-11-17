import { useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Bar, BarChart, CartesianGrid, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { AlertTriangle, CircleDollarSign, Loader2 } from 'lucide-react';
import { costApi, type CostOverview, type CostSource, type CostTotals } from '@/api/cost.api';
import { formatUsd, gradingPartLabel, vnDay } from './costFormat';

const COLORS = ['#22d3ee', '#a78bfa', '#f472b6', '#facc15', '#34d399', '#fb923c', '#94a3b8', '#60a5fa'];
const RANGES = [7, 30, 90] as const;
const SUMMARY = 'summary';

const formatInt = (n: number) => n.toLocaleString('vi-VN');

function Stat({ label, value, hint }: { label: string; value: string; hint?: string }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-black/25 p-4">
      <dt className="text-xs font-bold uppercase tracking-widest text-slate-500">{label}</dt>
      <dd className="mt-1 text-xl font-black text-white">{value}</dd>
      {hint && <p className="mt-1 text-xs font-medium text-slate-400">{hint}</p>}
    </div>
  );
}

function Totals({ t }: { t: CostTotals }) {
  return (
    <dl className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
      <Stat label="Chi phí đã biết" value={formatUsd(t.knownCostMicros)} hint={`${formatInt(t.calls)} lượt gọi`} />
      <Stat
        label="Chưa rõ chi phí"
        value={`${formatInt(t.unknownCostCalls)} lượt`}
        hint={t.unknownReservedMicros > 0 ? `Tối đa ${formatUsd(t.upperBoundCostMicros)} nếu tính cả phần giữ chỗ` : 'Không cộng vào chi phí đã biết'}
      />
      <Stat label="Token vào / ra" value={`${formatInt(t.inputTokens)} / ${formatInt(t.outputTokens)}`} />
      <Stat label="Lượt lỗi" value={formatInt(t.errorCalls)} />
    </dl>
  );
}

function CostTable({ rows, nameHeader }: { rows: (CostTotals & { name: string; share?: number | null })[]; nameHeader: string }) {
  const hasShare = rows.some((r) => r.share !== undefined);
  return (
    <div className="overflow-x-auto rounded-2xl border border-white/10">
      <table className="w-full min-w-[640px] text-left text-sm">
        <thead className="bg-white/5 text-xs uppercase tracking-widest text-slate-400">
          <tr>
            <th className="px-4 py-3">{nameHeader}</th>
            <th className="px-4 py-3 text-right">Lượt gọi</th>
            <th className="px-4 py-3 text-right">Token vào / ra</th>
            <th className="px-4 py-3 text-right">Chi phí đã biết</th>
            {hasShare && <th className="px-4 py-3 text-right">Tỷ trọng</th>}
            <th className="px-4 py-3 text-right">Chưa rõ</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => (
            <tr key={r.name} className="border-t border-white/5 font-semibold text-slate-200">
              <td className="px-4 py-3">{r.name}</td>
              <td className="px-4 py-3 text-right">{formatInt(r.calls)}</td>
              <td className="px-4 py-3 text-right">{formatInt(r.inputTokens)} / {formatInt(r.outputTokens)}</td>
              <td className="px-4 py-3 text-right text-white">{formatUsd(r.knownCostMicros)}</td>
              {hasShare && <td className="px-4 py-3 text-right">{r.share === null || r.share === undefined ? '—' : `${r.share}%`}</td>}
              <td className="px-4 py-3 text-right">{r.unknownCostCalls ? formatInt(r.unknownCostCalls) : '—'}</td>
            </tr>
          ))}
          {!rows.length && (
            <tr><td colSpan={6} className="px-4 py-6 text-center text-slate-500">Chưa có lượt gọi nào trong khoảng này</td></tr>
          )}
        </tbody>
      </table>
    </div>
  );
}

const usdTick = (micros: number) => formatUsd(micros);

function SummaryTab({ data }: { data: CostOverview }) {
  const active = data.sources.filter((s) => s.calls > 0);
  const chart = data.byDay.map((d) => ({ day: d.day.slice(5), ...d.bySource }));
  return (
    <div className="space-y-6">
      <Totals t={data.total} />
      {active.length > 0 && (
        <div className="h-72 rounded-2xl border border-white/10 bg-black/25 p-4">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chart}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
              <XAxis dataKey="day" stroke="#64748b" fontSize={12} />
              <YAxis stroke="#64748b" fontSize={12} tickFormatter={usdTick} width={80} />
              <Tooltip formatter={(v) => formatUsd(Number(v))} contentStyle={{ background: '#0f172a', border: '1px solid #334155' }} />
              <Legend />
              {active.map((s, i) => (
                <Bar key={s.key} dataKey={s.key} name={s.label} stackId="cost" fill={COLORS[i % COLORS.length]} />
              ))}
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}
      <CostTable
        nameHeader="Nguồn sử dụng"
        rows={data.sources.map((s) => ({ ...s, name: s.label, share: s.shareOfKnownCost }))}
      />
    </div>
  );
}

function SourceTab({ source }: { source: CostSource }) {
  const chart = source.byDay.map((d) => ({ day: d.day.slice(5), known: d.knownCostMicros }));
  return (
    <div className="space-y-6">
      <Totals t={source} />
      {chart.length > 0 && (
        <div className="h-64 rounded-2xl border border-white/10 bg-black/25 p-4">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chart}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
              <XAxis dataKey="day" stroke="#64748b" fontSize={12} />
              <YAxis stroke="#64748b" fontSize={12} tickFormatter={usdTick} width={80} />
              <Tooltip formatter={(v) => formatUsd(Number(v))} contentStyle={{ background: '#0f172a', border: '1px solid #334155' }} />
              <Bar dataKey="known" name="Chi phí đã biết" fill="#22d3ee" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}
      <CostTable
        nameHeader={source.group === 'grading' ? 'Vai trò model' : 'Model'}
        rows={source.parts.map((p) => ({ ...p, name: source.group === 'grading' ? gradingPartLabel(p.part) : p.part }))}
      />
      {source.group === 'grading' && (
        <p className="text-xs font-medium text-slate-400">
          Chi phí theo từng đợt chấm xem ở trang chi tiết đợt chấm. Lượt gọi chưa rõ chi phí có giới hạn trên là phần tiền đã giữ chỗ.
        </p>
      )}
    </div>
  );
}

export default function AdminCosts() {
  const [days, setDays] = useState<(typeof RANGES)[number]>(30);
  const [schoolId, setSchoolId] = useState('');
  const [tab, setTab] = useState<string>(SUMMARY);
  const range = useMemo(() => ({ from: vnDay(days - 1), to: vnDay(0) }), [days]);
  const schools = useQuery({
    queryKey: ['costs', 'schools'],
    queryFn: () => (costApi.listSchools ? costApi.listSchools() : Promise.resolve([])),
  });
  const { data, isLoading, isError } = useQuery({
    queryKey: ['costs', 'overview', range, schoolId],
    queryFn: () =>
      schoolId
        ? costApi.getOverview(range.from, range.to, schoolId)
        : costApi.getOverview(range.from, range.to),
  });
  const source = data?.sources.find((s) => s.key === tab);

  return (
    <main className="min-h-screen bg-slate-950 px-4 py-8 text-slate-100 sm:px-6 lg:px-8">
      <section className="relative z-10 mx-auto max-w-7xl space-y-6">
        <header className="flex flex-col gap-4 rounded-[2rem] border border-white/10 bg-slate-900/70 p-6 sm:flex-row sm:items-end sm:justify-between sm:p-8">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-cyan-400/20 bg-cyan-400/10 px-3 py-1 text-xs font-black uppercase tracking-[0.25em] text-cyan-200">
              <CircleDollarSign className="h-4 w-4" aria-hidden="true" /> Chi phí AI
            </div>
            <h1 className="mt-3 text-3xl font-black tracking-tight text-white">Chi phí theo từng nguồn sử dụng</h1>
            <p className="mt-2 text-sm text-slate-400">
              {range.from} → {range.to} (giờ Việt Nam). Mỗi nguồn tính riêng; lượt chưa rõ giá không bị tính là 0.
              {schoolId && ' Lọc theo trường chỉ tính nguồn chấm bài thi (AI chung không gắn trường).'}
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            {schools.data && schools.data.length > 0 && (
              <select
                aria-label="Lọc theo trường"
                value={schoolId}
                onChange={(e) => setSchoolId(e.target.value)}
                className="rounded-xl border border-white/10 bg-black/40 px-3 py-2 text-sm font-bold text-slate-200"
              >
                <option value="">Tất cả các trường</option>
                {schools.data.map((s) => (
                  <option key={s.id} value={s.id}>{s.name}</option>
                ))}
              </select>
            )}
            <div className="flex gap-2" role="group" aria-label="Khoảng thời gian">
              {RANGES.map((d) => (
                <button
                  key={d}
                  type="button"
                  onClick={() => setDays(d)}
                  aria-pressed={days === d}
                  className={`rounded-xl border px-3 py-2 text-sm font-bold ${days === d ? 'border-cyan-400/60 bg-cyan-400/15 text-cyan-100' : 'border-white/10 text-slate-300 hover:border-white/30'}`}
                >
                  {d} ngày
                </button>
              ))}
            </div>
          </div>
        </header>

        <nav className="flex gap-2 overflow-x-auto pb-1" role="tablist" aria-label="Nguồn chi phí">
          {[{ key: SUMMARY, label: 'Tổng hợp', knownCostMicros: data?.total.knownCostMicros }, ...(data?.sources ?? [])].map((s) => (
            <button
              key={s.key}
              type="button"
              role="tab"
              aria-selected={tab === s.key}
              onClick={() => setTab(s.key)}
              className={`whitespace-nowrap rounded-xl border px-4 py-2 text-sm font-bold ${tab === s.key ? 'border-cyan-400/60 bg-cyan-400/15 text-white' : 'border-white/10 text-slate-300 hover:border-white/30'}`}
            >
              {s.label}
              {s.knownCostMicros !== undefined && <span className="ml-2 text-xs text-slate-400">{formatUsd(s.knownCostMicros)}</span>}
            </button>
          ))}
        </nav>

        <div className="rounded-3xl border border-white/10 bg-slate-900/70 p-5 sm:p-6" role="tabpanel">
          {isLoading && (
            <p className="flex items-center gap-2 text-slate-400"><Loader2 className="h-4 w-4 animate-spin" /> Đang tải…</p>
          )}
          {isError && (
            <p className="flex items-center gap-2 text-rose-300"><AlertTriangle className="h-4 w-4" /> Không tải được báo cáo chi phí.</p>
          )}
          {data && (tab === SUMMARY || !source ? <SummaryTab data={data} /> : <SourceTab source={source} />)}
        </div>
      </section>
    </main>
  );
}
