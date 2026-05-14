import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import {
  AlertTriangle,
  ArrowRight,
  Brain,
  CheckCircle2,
  Flame,
  Sparkles,
  Target,
  TrendingUp,
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

  if (isLoading) {
    return <CoachState label="Đang chuẩn bị dashboard coach..." />;
  }

  if (error || !data) {
    return <CoachState label="Không tải được coach học tập." tone="error" />;
  }

  return <CoachDashboard data={data} />;
}

function CoachDashboard({ data }: { data: LearningCoachSummary }) {
  const completedTasks = data.tasks.filter((task) => task.completed).length;
  const planCompletion = Math.max(0, Math.min(100, data.progress.planCompletion));
  const minuteCompletion = Math.max(0, Math.min(100, data.progress.minuteCompletion));
  const nextAction = data.nextBestAction;

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top_left,rgba(16,185,129,0.16),transparent_34%),linear-gradient(135deg,#f8fafc_0%,#ecfdf5_46%,#fffbeb_100%)] px-4 py-6 text-slate-950 sm:px-6 lg:px-8">
      <div className="mx-auto flex max-w-7xl flex-col gap-6">
        <section className="overflow-hidden rounded-[2rem] border border-slate-200/80 bg-white/90 p-5 shadow-[0_28px_80px_rgba(15,23,42,0.10)] backdrop-blur sm:p-8">
          <div className="grid gap-8 lg:grid-cols-[1.25fr_0.75fr] lg:items-center">
            <div>
              <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-extrabold uppercase tracking-[0.18em] text-emerald-700">
                <Brain className="h-4 w-4" /> AI Learning Coach
              </div>
              <h1 className="max-w-3xl text-3xl font-black leading-tight tracking-tight text-slate-950 sm:text-5xl">
                {data.headline}
              </h1>
              <p className="mt-4 max-w-2xl text-base leading-7 text-slate-600 sm:text-lg">
                Coach ưu tiên <span className="font-bold text-amber-700">{data.focusArea}</span> dựa trên kế hoạch hôm nay, tiến độ ôn tập và điểm quiz gần đây.
              </p>

              <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center">
                {nextAction ? (
                  <Link
                    to={nextAction.route}
                    className="inline-flex min-h-12 cursor-pointer items-center justify-center gap-2 rounded-2xl bg-emerald-500 px-5 py-3 font-extrabold text-emerald-950 shadow-lg shadow-emerald-500/20 transition hover:bg-emerald-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-600 focus-visible:ring-offset-2"
                  >
                    {nextAction.title}
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                ) : null}
                <span className="text-sm font-medium text-slate-500">
                  {completedTasks}/{data.tasks.length} nhiệm vụ hoàn thành hôm nay
                </span>
              </div>
            </div>

            <div className="rounded-[1.75rem] border border-emerald-100 bg-emerald-50/80 p-5 shadow-inner">
              <div className="mx-auto grid h-44 w-44 place-items-center rounded-full bg-[conic-gradient(#10b981_var(--progress),#d1fae5_0)] p-4" style={{ '--progress': `${planCompletion}%` } as React.CSSProperties} aria-label={`Tiến độ kế hoạch hôm nay ${planCompletion}%`}>
                <div className="grid h-full w-full place-items-center rounded-full bg-white text-center shadow-sm">
                  <div>
                    <strong className="block text-4xl font-black text-slate-950">{planCompletion}%</strong>
                    <span className="text-sm font-semibold text-slate-500">Daily plan</span>
                  </div>
                </div>
              </div>
              <div className="mt-5 rounded-2xl bg-white p-4">
                <p className="text-sm font-bold text-slate-950">Mục tiêu hôm nay</p>
                <p className="mt-1 text-sm text-slate-600">
                  {data.dailyGoal.completedMinutes}/{data.dailyGoal.targetMinutes} phút học và {data.dailyGoal.completedReviews}/{data.dailyGoal.targetReviews} lượt ôn.
                </p>
              </div>
            </div>
          </div>
        </section>

        <section className="grid gap-4 md:grid-cols-4">
          <MetricCard icon={<Target />} label="Kế hoạch" value={`${planCompletion}%`} hint="Hoàn thành checklist" />
          <MetricCard icon={<TrendingUp />} label="Phút học" value={`${minuteCompletion}%`} hint="Tiến độ mục tiêu" />
          <MetricCard icon={<Flame />} label="Streak" value={`${data.streak.current} ngày`} hint={`Kỷ lục ${data.streak.longest} ngày`} />
          <MetricCard icon={<Sparkles />} label="Từ đã nắm" value={String(data.progress.masteredVocabularies)} hint={`${data.streak.xp} XP tích lũy`} />
        </section>

        <section className="grid gap-6 lg:grid-cols-[1.15fr_0.85fr]">
          <div className="rounded-[1.75rem] border border-slate-200 bg-white/90 p-5 shadow-[0_24px_70px_rgba(15,23,42,0.08)] sm:p-6">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <p className="text-xs font-extrabold uppercase tracking-[0.16em] text-emerald-700">Next best action</p>
                <h2 className="mt-2 text-2xl font-black text-slate-950">{nextAction?.title ?? 'Luyện quiz ngắn'}</h2>
                <p className="mt-2 text-slate-600">{nextAction?.reason ?? 'Duy trì nhịp học bằng một bài luyện tập nhanh.'}</p>
              </div>
              {nextAction ? (
                <Link
                  to={nextAction.route}
                  className="inline-flex min-h-11 cursor-pointer items-center justify-center gap-2 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-2 font-bold text-emerald-800 transition hover:border-emerald-300 hover:bg-emerald-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-600"
                >
                  Bắt đầu <ArrowRight className="h-4 w-4" />
                </Link>
              ) : null}
            </div>

            <div className="mt-6 grid gap-3">
              {data.tasks.map((task) => (
                <TaskCard key={task.id} task={task} />
              ))}
            </div>
          </div>

          <div className="flex flex-col gap-6">
            <section className="rounded-[1.75rem] border border-amber-200 bg-amber-50/90 p-5 shadow-[0_24px_70px_rgba(146,64,14,0.08)] sm:p-6">
              <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-white px-3 py-1 text-xs font-extrabold uppercase tracking-[0.16em] text-amber-700">
                <Sparkles className="h-4 w-4" /> Coach reasoning
              </div>
              <h2 className="text-xl font-black text-slate-950">Vì sao coach chọn hướng này?</h2>
              <p className="mt-3 leading-7 text-slate-700">
                Bạn đang có {data.tasks.length} nhiệm vụ hôm nay, {data.dailyGoal.targetReviews} lượt ôn mục tiêu và vùng cần chú ý là <span className="font-bold text-amber-800">{data.focusArea}</span>. Làm hành động đầu tiên trước sẽ giúp giữ đà học mà không quá tải.
              </p>
            </section>

            <section className="rounded-[1.75rem] border border-slate-200 bg-white/90 p-5 shadow-[0_24px_70px_rgba(15,23,42,0.08)] sm:p-6">
              <div className="flex items-center gap-2 text-rose-700">
                <AlertTriangle className="h-5 w-5" />
                <h2 className="text-xl font-black text-slate-950">Điểm cần cứu</h2>
              </div>
              <div className="mt-4 space-y-3">
                {data.risks.length ? (
                  data.risks.map((risk) => (
                    <Link
                      key={risk.route}
                      to={risk.route}
                      className="block cursor-pointer rounded-2xl border border-rose-100 bg-rose-50 p-4 transition hover:border-rose-200 hover:bg-rose-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-500"
                    >
                      <p className="font-bold text-slate-950">{risk.title}</p>
                      <p className="mt-1 text-sm font-medium text-rose-700">{risk.topic} · {risk.score}%</p>
                    </Link>
                  ))
                ) : (
                  <div className="rounded-2xl border border-emerald-100 bg-emerald-50 p-4 text-emerald-800">
                    <CheckCircle2 className="mb-2 h-5 w-5" />
                    Chưa có vùng yếu rõ ràng. Tiếp tục học để coach phân tích sâu hơn.
                  </div>
                )}
              </div>
            </section>
          </div>
        </section>
      </div>
    </main>
  );
}

function MetricCard({ icon, label, value, hint }: { icon: ReactNode; label: string; value: string; hint: string }) {
  return (
    <div className="rounded-3xl border border-slate-200 bg-white/90 p-5 shadow-[0_18px_50px_rgba(15,23,42,0.07)]">
      <div className="mb-4 inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-700">
        {icon}
      </div>
      <p className="text-sm font-bold text-slate-500">{label}</p>
      <p className="mt-1 text-3xl font-black text-slate-950">{value}</p>
      <p className="mt-1 text-sm text-slate-500">{hint}</p>
    </div>
  );
}

function TaskCard({ task }: { task: TodayPlanTask }) {
  return (
    <Link
      to={task.targetUrl}
      className="group flex cursor-pointer flex-col gap-3 rounded-2xl border border-slate-200 bg-slate-50/80 p-4 transition hover:border-emerald-200 hover:bg-emerald-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-600 sm:flex-row sm:items-center sm:justify-between"
    >
      <div className="flex gap-3">
        <div className={`mt-1 flex h-7 w-7 shrink-0 items-center justify-center rounded-full ${task.completed ? 'bg-emerald-500 text-white' : 'bg-white text-slate-400 ring-1 ring-slate-200'}`}>
          <CheckCircle2 className="h-4 w-4" />
        </div>
        <div>
          <p className="font-bold text-slate-950">{task.title}</p>
          <p className="mt-1 text-sm leading-6 text-slate-600">{task.description}</p>
        </div>
      </div>
      <span className="shrink-0 rounded-full bg-white px-3 py-1 text-sm font-bold text-emerald-700 ring-1 ring-emerald-100 group-hover:bg-emerald-100">
        {task.estimatedMinutes} phút
      </span>
    </Link>
  );
}

function CoachState({ label, tone = 'loading' }: { label: string; tone?: 'loading' | 'error' }) {
  const isError = tone === 'error';

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-50 via-emerald-50 to-amber-50 px-4 py-10">
      <div className="mx-auto max-w-3xl rounded-[2rem] border border-slate-200 bg-white/90 p-8 text-center shadow-[0_28px_80px_rgba(15,23,42,0.10)]">
        <div className={`mx-auto mb-4 grid h-14 w-14 place-items-center rounded-2xl ${isError ? 'bg-rose-50 text-rose-600' : 'bg-emerald-50 text-emerald-700'}`}>
          {isError ? <AlertTriangle className="h-7 w-7" /> : <Brain className="h-7 w-7" />}
        </div>
        <p className="text-lg font-bold text-slate-800">{label}</p>
      </div>
    </main>
  );
}
