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

/* This page was designed against a light palette (`#f6f8f3` page, white cards,
   `slate-950` headings) and sat inside the dark app shell, so it stayed light
   after every other page had a theme. It now reads from the same tokens as the
   rest of the app:
     - surfaces/typography -> --app-* tokens
     - the semantic accents (emerald / amber / rose) -> --app-primary /
       --app-warning / --app-danger, which already have per-theme values, with
       tints as alpha over that token so they hold on either background
     - filled buttons -> --app-text on --app-bg, so the pair always contrasts
     - content on a filled accent -> `on-light-accent` (fixed dark) where the
       accent is a light-ish green/amber, `on-accent` (fixed white) where it is
       a dark-ish saturated hue, so neither theme loses contrast
   `color-mix` is the alpha idiom already used in Education.css and index.html. */

export default function LearningCoach() {
  const { data, isLoading, error, refetch, isFetching } = useQuery({
    queryKey: QUERY_KEYS.LEARNING_COACH,
    queryFn: getLearningCoachSummary,
  });

  if (isLoading) return <CoachState label="Coach đang chuẩn bị lộ trình..." />;
  if (error || !data) {
    return (
      <CoachState
        label="Không tải được dashboard coach. Kiểm tra kết nối và thử lại."
        tone="error"
        onRetry={() => {
          void refetch();
        }}
        retrying={isFetching}
      />
    );
  }
  return <CoachDashboard data={data} />;
}

/* Shared: filled button. Foreground/background are the app's own pair, so the
   contrast is whatever the theme guarantees rather than a hardcoded white. */
const SOLID_BUTTON =
  'bg-[var(--app-text)] text-[var(--app-bg)] shadow-[var(--app-glass-shadow)] transition hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--app-focus)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--app-bg)]';

const CARD = 'border border-[var(--app-border)] bg-[var(--app-surface)]';

function CoachDashboard({ data }: { data: LearningCoachSummary }) {
  const plan = clamp(data.progress.planCompletion);
  const minutes = clamp(data.progress.minuteCompletion);
  const completed = data.tasks.filter((task) => task.completed).length;
  const nextAction = data.nextBestAction;

  return (
    <main className="min-h-screen bg-[var(--app-bg)] text-[var(--app-text)]">
      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        <section className={`relative overflow-hidden rounded-[2.5rem] ${CARD}`}>
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_12%_15%,color-mix(in_srgb,var(--app-primary)_22%,transparent),transparent_28%),radial-gradient(circle_at_86%_20%,color-mix(in_srgb,var(--app-warning)_20%,transparent),transparent_26%)]" />
          <div className="relative grid gap-8 p-6 sm:p-8 lg:grid-cols-[1fr_360px] lg:p-10">
            <div className="flex min-h-[360px] flex-col justify-between">
              <div>
                <div className="inline-flex items-center gap-2 rounded-full bg-[var(--app-primary)] px-3 py-1 text-xs font-black uppercase tracking-[0.18em] text-on-light-accent shadow-lg shadow-[color-mix(in_srgb,var(--app-primary)_20%,transparent)]">
                  <Brain className="h-4 w-4" /> AI Learning Coach
                </div>
                <h1 className="mt-6 max-w-3xl text-4xl font-black leading-[0.98] tracking-tight sm:text-6xl">
                  {data.headline}
                </h1>
                <p className="mt-5 max-w-2xl text-lg leading-8 text-[var(--app-text-muted)]">
                  Hôm nay tập trung vào <span className="font-extrabold text-[var(--app-warning)]">{data.focusArea}</span>. Coach gom nhiệm vụ, quiz yếu và mục tiêu ôn tập thành một đường đi ngắn gọn.
                </p>
              </div>

              <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center">
                {nextAction ? (
                  <Link
                    to={nextAction.route}
                    className={`inline-flex min-h-12 cursor-pointer items-center justify-center gap-2 rounded-full px-6 py-3 text-sm font-black ${SOLID_BUTTON}`}
                  >
                    {nextAction.title}
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                ) : null}
                <span className="text-sm font-bold text-[var(--app-text-subtle)]">
                  {completed}/{data.tasks.length} nhiệm vụ đã xong
                </span>
              </div>
            </div>

            <div className={`rounded-[2rem] p-5 shadow-[var(--app-glass-shadow)] backdrop-blur ${CARD}`}>
              <div className="grid place-items-center py-2">
                <div
                  className="grid h-44 w-44 place-items-center rounded-full bg-[conic-gradient(var(--app-primary)_var(--progress),var(--app-border-strong)_0)] p-3"
                  style={{ '--progress': `${plan}%` } as React.CSSProperties}
                  aria-label={`Tiến độ hôm nay ${plan}%`}
                >
                  <div className="grid h-full w-full place-items-center rounded-full bg-[var(--app-surface)] text-center shadow-sm">
                    <div>
                      <strong className="block text-5xl font-black">{plan}%</strong>
                      <span className="text-xs font-black uppercase tracking-[0.16em] text-[var(--app-text-subtle)]">Daily plan</span>
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
          <div className={`rounded-[2rem] p-6 shadow-[var(--app-glass-shadow)] sm:p-8 ${CARD}`}>
            <div className="mb-7 flex items-end justify-between gap-4">
              <div>
                <p className="text-xs font-black uppercase tracking-[0.18em] text-[var(--app-primary)]">Learning path</p>
                <h2 className="mt-2 text-3xl font-black">Đường đi hôm nay</h2>
              </div>
              <span className="hidden rounded-full bg-[color-mix(in_srgb,var(--app-primary)_12%,transparent)] px-4 py-2 text-sm font-bold text-[var(--app-primary)] sm:inline-flex">
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
            <section className="rounded-[2rem] border border-[color-mix(in_srgb,var(--app-warning)_30%,transparent)] bg-[color-mix(in_srgb,var(--app-warning)_10%,transparent)] p-6 shadow-[var(--app-glass-shadow)]">
              <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-[var(--app-surface)] text-[var(--app-warning)] shadow-sm">
                <Sparkles className="h-6 w-6" />
              </div>
              <h2 className="text-2xl font-black">Coach insight</h2>
              <p className="mt-3 leading-7 text-[var(--app-text-muted)]">
                Bắt đầu bằng hành động đầu tiên để giảm ma sát. Sau đó đi theo timeline, xử lý vùng yếu <span className="font-extrabold text-[var(--app-warning)]">{data.focusArea}</span> khi não đã vào nhịp.
              </p>
            </section>

            <section className={`rounded-[2rem] p-6 shadow-[var(--app-glass-shadow)] ${CARD}`}>
              <div className="mb-4 flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-[var(--app-danger)]" />
                <h2 className="text-2xl font-black">Cần cứu</h2>
              </div>
              <div className="space-y-3">
                {data.risks.length ? (
                  data.risks.map((risk) => (
                    <Link
                      key={risk.route}
                      to={risk.route}
                      className="block cursor-pointer rounded-2xl border border-[color-mix(in_srgb,var(--app-danger)_25%,transparent)] bg-[color-mix(in_srgb,var(--app-danger)_8%,transparent)] p-4 transition hover:-translate-y-0.5 hover:bg-[color-mix(in_srgb,var(--app-danger)_14%,transparent)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--app-danger)]"
                    >
                      <p className="font-black">{risk.title}</p>
                      <p className="mt-1 text-sm font-bold text-[var(--app-danger)]">{risk.topic} · {risk.score}%</p>
                    </Link>
                  ))
                ) : (
                  <div className="rounded-2xl bg-[color-mix(in_srgb,var(--app-primary)_10%,transparent)] p-4 text-sm font-bold leading-6 text-[var(--app-primary)]">
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
    <div className={`rounded-2xl p-4 ${CARD}`}>
      <div className="mb-2 text-[var(--app-primary)]">{icon}</div>
      <p className="text-xs font-bold text-[var(--app-text-subtle)]">{label}</p>
      <p className="mt-1 text-xl font-black">{value}</p>
    </div>
  );
}

function PathStep({ task, index }: { task: TodayPlanTask; index: number }) {
  return (
    <Link
      to={task.targetUrl}
      className="group grid cursor-pointer grid-cols-[44px_1fr_auto] items-center gap-4 rounded-[1.5rem] border border-[var(--app-border)] bg-[var(--app-surface-hover)] p-4 transition hover:-translate-y-0.5 hover:border-[color-mix(in_srgb,var(--app-primary)_40%,transparent)] hover:bg-[color-mix(in_srgb,var(--app-primary)_8%,transparent)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--app-focus)]"
    >
      <div className={`grid h-11 w-11 place-items-center rounded-2xl text-sm font-black ${task.completed ? 'bg-[var(--app-primary)] text-on-light-accent' : 'bg-[var(--app-surface)] text-[var(--app-text-subtle)] ring-1 ring-[var(--app-border)]'}`}>
        {task.completed ? <CheckCircle2 className="h-5 w-5" /> : index + 1}
      </div>
      <div>
        <p className="font-black">{task.title}</p>
        <p className="mt-1 text-sm leading-6 text-[var(--app-text-muted)]">{task.description}</p>
      </div>
      <span className="hidden rounded-full bg-[var(--app-surface)] px-3 py-1 text-sm font-black text-[var(--app-primary)] ring-1 ring-[var(--app-border)] group-hover:bg-[color-mix(in_srgb,var(--app-primary)_12%,transparent)] sm:inline-flex">
        {task.estimatedMinutes} phút
      </span>
    </Link>
  );
}

function CoachState({
  label,
  tone = 'loading',
  onRetry,
  retrying,
}: {
  label: string;
  tone?: 'loading' | 'error';
  onRetry?: () => void;
  retrying?: boolean;
}) {
  const isError = tone === 'error';
  return (
    <main className="grid min-h-screen place-items-center bg-[var(--app-bg)] text-[var(--app-text)] px-4">
      <div className={`max-w-xl rounded-[2rem] p-8 text-center shadow-[var(--app-glass-shadow)] ${CARD}`}>
        <div className={`mx-auto mb-4 grid h-14 w-14 place-items-center rounded-2xl ${isError ? 'bg-[color-mix(in_srgb,var(--app-danger)_12%,transparent)] text-[var(--app-danger)]' : 'bg-[color-mix(in_srgb,var(--app-primary)_12%,transparent)] text-[var(--app-primary)]'}`}>
          {isError ? <AlertTriangle className="h-7 w-7" /> : <Brain className="h-7 w-7" />}
        </div>
        <p className="text-lg font-black">{label}</p>
        {isError && onRetry ? (
          <button
            type="button"
            onClick={onRetry}
            disabled={retrying}
            className={`mt-6 inline-flex min-h-11 items-center justify-center rounded-full px-5 py-2.5 text-sm font-black disabled:opacity-60 ${SOLID_BUTTON}`}
          >
            {retrying ? 'Đang thử lại…' : 'Thử lại'}
          </button>
        ) : null}
      </div>
    </main>
  );
}

function clamp(value: number) {
  return Math.max(0, Math.min(100, Math.round(value)));
}