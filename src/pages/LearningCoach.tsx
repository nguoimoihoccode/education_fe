import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import {
  AlertTriangle,
  ArrowRight,
  Brain,
  CheckCircle2,
  Clock3,
  Flame,
  Sparkles,
  Target,
  Trophy,
} from 'lucide-react';
import type { ReactNode } from 'react';
import { getLearningCoachSummary } from '@/api/education.api';
import { QUERY_KEYS } from '@/config/query';
import type { LearningCoachSummary, TodayPlanTask } from '@/types/education.types';

export default function LearningCoach() {
  const { data, isLoading, error } = useQuery({
    queryKey: QUERY_KEYS.LEARNING_COACH,
    queryFn: getLearningCoachSummary,
  });

  if (isLoading) return <CoachState label="Coach đang chuẩn bị lộ trình..." />;
  if (error || !data) return <CoachState label="Không tải được dashboard coach." tone="error" />;
  return <CoachDashboard data={data} />;
}

function CoachDashboard({ data }: { data: LearningCoachSummary }) {
  const plan = clamp(data.progress.planCompletion);
  const minutes = clamp(data.progress.minuteCompletion);
  const completed = data.tasks.filter((task) => task.completed).length;
  const nextAction = data.nextBestAction;

  return (
    <main className="min-h-screen bg-[#f6f8f3] text-slate-950">
      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        <section className="relative overflow-hidden rounded-[2.5rem] border border-white bg-white shadow-[0_30px_90px_rgba(15,23,42,0.10)]">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_12%_15%,rgba(16,185,129,0.22),transparent_28%),radial-gradient(circle_at_86%_20%,rgba(245,158,11,0.20),transparent_26%)]" />
          <div className="relative grid gap-8 p-6 sm:p-8 lg:grid-cols-[1fr_360px] lg:p-10">
            <div className="flex min-h-[360px] flex-col justify-between">
              <div>
                <div className="inline-flex items-center gap-2 rounded-full bg-emerald-600 px-3 py-1 text-xs font-black uppercase tracking-[0.18em] text-white shadow-lg shadow-emerald-600/20">
                  <Brain className="h-4 w-4" /> AI Learning Coach
                </div>
                <h1 className="mt-6 max-w-3xl text-4xl font-black leading-[0.98] tracking-tight text-slate-950 sm:text-6xl">
                  {data.headline}
                </h1>
                <p className="mt-5 max-w-2xl text-lg leading-8 text-slate-600">
                  Hôm nay tập trung vào <span className="font-extrabold text-amber-700">{data.focusArea}</span>. Coach gom nhiệm vụ, quiz yếu và mục tiêu ôn tập thành một đường đi ngắn gọn.
                </p>
              </div>

              <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center">
                {nextAction ? (
                  <Link
                    to={nextAction.route}
                    className="inline-flex min-h-12 cursor-pointer items-center justify-center gap-2 rounded-full bg-slate-950 px-6 py-3 text-sm font-black text-white shadow-xl shadow-slate-950/20 transition hover:-translate-y-0.5 hover:bg-slate-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-950 focus-visible:ring-offset-2"
                  >
                    {nextAction.title}
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                ) : null}
                <span className="text-sm font-bold text-slate-500">
                  {completed}/{data.tasks.length} nhiệm vụ đã xong
                </span>
              </div>
            </div>

            <div className="rounded-[2rem] border border-emerald-100 bg-white/80 p-5 shadow-[inset_0_1px_0_rgba(255,255,255,0.8)] backdrop-blur">
              <div className="grid place-items-center py-2">
                <div
                  className="grid h-44 w-44 place-items-center rounded-full bg-[conic-gradient(#059669_var(--progress),#e2e8f0_0)] p-3"
                  style={{ '--progress': `${plan}%` } as React.CSSProperties}
                  aria-label={`Tiến độ hôm nay ${plan}%`}
                >
                  <div className="grid h-full w-full place-items-center rounded-full bg-white text-center shadow-sm">
                    <div>
                      <strong className="block text-5xl font-black text-slate-950">{plan}%</strong>
                      <span className="text-xs font-black uppercase tracking-[0.16em] text-slate-400">Daily plan</span>
                    </div>
                  </div>
                </div>
              </div>
              <div className="mt-4 grid grid-cols-2 gap-3">
                <MiniStat icon={<Clock3 />} label="Phút học" value={`${minutes}%`} />
                <MiniStat icon={<Flame />} label="Streak" value={`${data.streak.current} ngày`} />
                <MiniStat icon={<Trophy />} label="XP" value={String(data.streak.xp)} />
                <MiniStat icon={<Target />} label="Từ nắm" value={String(data.progress.masteredVocabularies)} />
              </div>
            </div>
          </div>
        </section>

        <section className="mt-6 grid gap-6 lg:grid-cols-[minmax(0,1fr)_380px]">
          <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-[0_20px_60px_rgba(15,23,42,0.07)] sm:p-8">
            <div className="mb-7 flex items-end justify-between gap-4">
              <div>
                <p className="text-xs font-black uppercase tracking-[0.18em] text-emerald-700">Learning path</p>
                <h2 className="mt-2 text-3xl font-black text-slate-950">Đường đi hôm nay</h2>
              </div>
              <span className="hidden rounded-full bg-emerald-50 px-4 py-2 text-sm font-bold text-emerald-700 sm:inline-flex">
                {data.dailyGoal.completedMinutes}/{data.dailyGoal.targetMinutes} phút
              </span>
            </div>
            <div className="space-y-4">
              {data.tasks.map((task, index) => (
                <PathStep key={task.id} task={task} index={index} />
              ))}
            </div>
          </div>

          <aside className="space-y-6">
            <section className="rounded-[2rem] border border-amber-200 bg-[#fff8e8] p-6 shadow-[0_20px_60px_rgba(146,64,14,0.08)]">
              <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-white text-amber-700 shadow-sm">
                <Sparkles className="h-6 w-6" />
              </div>
              <h2 className="text-2xl font-black text-slate-950">Coach insight</h2>
              <p className="mt-3 leading-7 text-slate-700">
                Bắt đầu bằng hành động đầu tiên để giảm ma sát. Sau đó đi theo timeline, xử lý vùng yếu <span className="font-extrabold text-amber-800">{data.focusArea}</span> khi não đã vào nhịp.
              </p>
            </section>

            <section className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-[0_20px_60px_rgba(15,23,42,0.07)]">
              <div className="mb-4 flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-rose-600" />
                <h2 className="text-2xl font-black text-slate-950">Cần cứu</h2>
              </div>
              <div className="space-y-3">
                {data.risks.length ? (
                  data.risks.map((risk) => (
                    <Link
                      key={risk.route}
                      to={risk.route}
                      className="block cursor-pointer rounded-2xl border border-rose-100 bg-rose-50 p-4 transition hover:-translate-y-0.5 hover:border-rose-200 hover:bg-rose-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-500"
                    >
                      <p className="font-black text-slate-950">{risk.title}</p>
                      <p className="mt-1 text-sm font-bold text-rose-700">{risk.topic} · {risk.score}%</p>
                    </Link>
                  ))
                ) : (
                  <div className="rounded-2xl bg-emerald-50 p-4 text-sm font-bold leading-6 text-emerald-800">
                    <CheckCircle2 className="mb-2 h-5 w-5" />
                    Chưa thấy vùng yếu rõ. Học thêm vài phiên để coach phân tích sâu hơn.
                  </div>
                )}
              </div>
            </section>
          </aside>
        </section>
      </div>
    </main>
  );
}

function MiniStat({ icon, label, value }: { icon: ReactNode; label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-slate-100 bg-white p-4">
      <div className="mb-2 text-emerald-700">{icon}</div>
      <p className="text-xs font-bold text-slate-400">{label}</p>
      <p className="mt-1 text-xl font-black text-slate-950">{value}</p>
    </div>
  );
}

function PathStep({ task, index }: { task: TodayPlanTask; index: number }) {
  return (
    <Link
      to={task.targetUrl}
      className="group grid cursor-pointer grid-cols-[44px_1fr_auto] items-center gap-4 rounded-[1.5rem] border border-slate-200 bg-slate-50/80 p-4 transition hover:-translate-y-0.5 hover:border-emerald-200 hover:bg-emerald-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-600"
    >
      <div className={`grid h-11 w-11 place-items-center rounded-2xl text-sm font-black ${task.completed ? 'bg-emerald-600 text-white' : 'bg-white text-slate-500 ring-1 ring-slate-200'}`}>
        {task.completed ? <CheckCircle2 className="h-5 w-5" /> : index + 1}
      </div>
      <div>
        <p className="font-black text-slate-950">{task.title}</p>
        <p className="mt-1 text-sm leading-6 text-slate-600">{task.description}</p>
      </div>
      <span className="hidden rounded-full bg-white px-3 py-1 text-sm font-black text-emerald-700 ring-1 ring-emerald-100 group-hover:bg-emerald-100 sm:inline-flex">
        {task.estimatedMinutes} phút
      </span>
    </Link>
  );
}

function CoachState({ label, tone = 'loading' }: { label: string; tone?: 'loading' | 'error' }) {
  const isError = tone === 'error';
  return (
    <main className="grid min-h-screen place-items-center bg-[#f6f8f3] px-4">
      <div className="max-w-xl rounded-[2rem] border border-slate-200 bg-white p-8 text-center shadow-[0_24px_70px_rgba(15,23,42,0.08)]">
        <div className={`mx-auto mb-4 grid h-14 w-14 place-items-center rounded-2xl ${isError ? 'bg-rose-50 text-rose-600' : 'bg-emerald-50 text-emerald-700'}`}>
          {isError ? <AlertTriangle className="h-7 w-7" /> : <Brain className="h-7 w-7" />}
        </div>
        <p className="text-lg font-black text-slate-900">{label}</p>
      </div>
    </main>
  );
}

function clamp(value: number) {
  return Math.max(0, Math.min(100, Math.round(value)));
}
