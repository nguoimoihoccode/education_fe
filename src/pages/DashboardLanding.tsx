import { Link } from 'react-router-dom';
import {
  ArrowRight,
  BarChart3,
  BookOpen,
  Brain,
  CheckCircle2,
  Clock3,
  Flame,
  Layers3,
  Sparkles,
  Target,
} from 'lucide-react';
import type { ReactNode } from 'react';

const quickActions = [
  {
    title: 'Coach',
    description: 'Lộ trình học thông minh mỗi ngày.',
    to: '/learning-coach',
    icon: Brain,
    tone: 'bg-emerald-50 text-emerald-700',
  },
  {
    title: 'Hôm nay',
    description: 'Checklist ngắn để giữ nhịp học.',
    to: '/education',
    icon: Target,
    tone: 'bg-amber-50 text-amber-700',
  },
  {
    title: 'Quiz',
    description: 'Luyện đúng điểm yếu và xem tiến bộ.',
    to: '/quiz',
    icon: BarChart3,
    tone: 'bg-violet-50 text-violet-700',
  },
  {
    title: 'Flashcards',
    description: 'Ôn tập SRS đúng lúc sắp quên.',
    to: '/flashcards',
    icon: Layers3,
    tone: 'bg-sky-50 text-sky-700',
  },
];

const path = [
  { title: 'Ôn 12 flashcards', meta: '8 phút', done: true },
  { title: 'Học bài tiếp theo', meta: '15 phút', done: false },
  { title: 'Làm quiz Grammar', meta: '10 phút', done: false },
  { title: 'Xem coach feedback', meta: '3 phút', done: false },
];

export default function DashboardLanding() {
  return (
    <main className="min-h-screen bg-[#f5f7f1] text-slate-950">
      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        <section className="relative overflow-hidden rounded-[2.5rem] border border-white bg-white shadow-[0_30px_90px_rgba(15,23,42,0.10)]">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_15%_12%,rgba(16,185,129,0.20),transparent_30%),radial-gradient(circle_at_85%_18%,rgba(245,158,11,0.20),transparent_28%)]" />
          <div className="relative grid gap-8 p-6 sm:p-8 lg:grid-cols-[1fr_380px] lg:p-10">
            <div className="flex min-h-[380px] flex-col justify-between">
              <div>
                <div className="inline-flex items-center gap-2 rounded-full bg-slate-950 px-3 py-1 text-xs font-black uppercase tracking-[0.18em] text-white shadow-lg shadow-slate-950/20">
                  <Sparkles className="h-4 w-4" /> EduPro Dashboard
                </div>
                <h1 className="mt-6 max-w-3xl text-4xl font-black leading-[0.98] tracking-tight text-slate-950 sm:text-6xl">
                  Một nơi để biết hôm nay học gì.
                </h1>
                <p className="mt-5 max-w-2xl text-lg leading-8 text-slate-600">
                  Dashboard gom Coach, kế hoạch hôm nay, quiz và flashcards thành một không gian học rõ mục tiêu, ít nhiễu, dễ bắt đầu.
                </p>
              </div>

              <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center">
                <Link
                  to="/education"
                  className="inline-flex min-h-12 cursor-pointer items-center justify-center gap-2 rounded-full bg-emerald-500 px-6 py-3 text-sm font-black text-emerald-950 shadow-xl shadow-emerald-500/20 transition hover:-translate-y-0.5 hover:bg-emerald-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-700 focus-visible:ring-offset-2"
                >
                  Vào dashboard học tập
                  <ArrowRight className="h-4 w-4" />
                </Link>
                <Link
                  to="/learning-coach"
                  className="inline-flex min-h-12 cursor-pointer items-center justify-center gap-2 rounded-full bg-white px-6 py-3 text-sm font-black text-slate-800 ring-1 ring-slate-200 transition hover:-translate-y-0.5 hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-900"
                >
                  Mở Coach
                </Link>
              </div>
            </div>

            <div className="rounded-[2rem] border border-emerald-100 bg-white/80 p-5 shadow-[inset_0_1px_0_rgba(255,255,255,0.8)] backdrop-blur">
              <div className="grid place-items-center py-2">
                <div className="grid h-44 w-44 place-items-center rounded-full bg-[conic-gradient(#059669_68%,#e2e8f0_0)] p-3">
                  <div className="grid h-full w-full place-items-center rounded-full bg-white text-center shadow-sm">
                    <div>
                      <strong className="block text-5xl font-black text-slate-950">68%</strong>
                      <span className="text-xs font-black uppercase tracking-[0.16em] text-slate-500">Daily plan</span>
                    </div>
                  </div>
                </div>
              </div>
              <div className="mt-4 grid grid-cols-2 gap-3">
                <MiniStat icon={<Clock3 />} label="Học hôm nay" value="23 phút" />
                <MiniStat icon={<Flame />} label="Streak" value="7 ngày" />
                <MiniStat icon={<BookOpen />} label="Bài học" value="18" />
                <MiniStat icon={<Target />} label="Quiz yếu" value="2" />
              </div>
            </div>
          </div>
        </section>

        <section className="mt-6 grid gap-4 md:grid-cols-4">
          {quickActions.map((action) => (
            <Link
              key={action.title}
              to={action.to}
              className="group cursor-pointer rounded-[1.75rem] border border-slate-200 bg-white p-5 shadow-[0_18px_50px_rgba(15,23,42,0.06)] transition hover:-translate-y-1 hover:border-emerald-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-600"
            >
              <div className={`mb-5 inline-flex h-12 w-12 items-center justify-center rounded-2xl ${action.tone}`}>
                <action.icon className="h-6 w-6" />
              </div>
              <h2 className="text-xl font-black text-slate-950">{action.title}</h2>
              <p className="mt-2 text-sm leading-6 text-slate-600">{action.description}</p>
              <span className="mt-5 inline-flex items-center gap-2 text-sm font-black text-emerald-700">
                Mở <ArrowRight className="h-4 w-4 transition group-hover:translate-x-1" />
              </span>
            </Link>
          ))}
        </section>

        <section className="mt-6 grid gap-6 lg:grid-cols-[minmax(0,1fr)_380px]">
          <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-[0_20px_60px_rgba(15,23,42,0.07)] sm:p-8">
            <div className="mb-7 flex items-end justify-between gap-4">
              <div>
                <p className="text-xs font-black uppercase tracking-[0.18em] text-emerald-700">Learning path</p>
                <h2 className="mt-2 text-3xl font-black text-slate-950">Lộ trình hôm nay</h2>
              </div>
              <span className="hidden rounded-full bg-emerald-50 px-4 py-2 text-sm font-bold text-emerald-700 sm:inline-flex">
                36 phút dự kiến
              </span>
            </div>
            <div className="space-y-4">
              {path.map((item, index) => (
                <div key={item.title} className="grid grid-cols-[44px_1fr_auto] items-center gap-4 rounded-[1.5rem] border border-slate-200 bg-slate-50/80 p-4">
                  <div className={`grid h-11 w-11 place-items-center rounded-2xl text-sm font-black ${item.done ? 'bg-emerald-600 text-white' : 'bg-white text-slate-500 ring-1 ring-slate-200'}`}>
                    {item.done ? <CheckCircle2 className="h-5 w-5" /> : index + 1}
                  </div>
                  <div>
                    <p className="font-black text-slate-950">{item.title}</p>
                    <p className="mt-1 text-sm text-slate-500">Coach đề xuất theo nhịp học hôm nay.</p>
                  </div>
                  <span className="hidden rounded-full bg-white px-3 py-1 text-sm font-black text-emerald-700 ring-1 ring-emerald-100 sm:inline-flex">
                    {item.meta}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <aside className="space-y-6">
            <section className="rounded-[2rem] border border-amber-200 bg-[#fff8e8] p-6 shadow-[0_20px_60px_rgba(146,64,14,0.08)]">
              <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-white text-amber-700 shadow-sm">
                <Brain className="h-6 w-6" />
              </div>
              <h2 className="text-2xl font-black text-slate-950">Next action</h2>
              <p className="mt-3 leading-7 text-slate-700">
                Bắt đầu bằng flashcards trước, sau đó học bài mới. Cách này giảm tải trí nhớ và giữ streak tốt hơn.
              </p>
            </section>

            <section className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-[0_20px_60px_rgba(15,23,42,0.07)]">
              <h2 className="text-2xl font-black text-slate-950">Điểm cần chú ý</h2>
              <div className="mt-4 space-y-3">
                <WeakItem title="Grammar Quiz" score="58%" />
                <WeakItem title="Listening Practice" score="64%" />
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
      <p className="text-xs font-bold text-slate-500">{label}</p>
      <p className="mt-1 text-xl font-black text-slate-950">{value}</p>
    </div>
  );
}

function WeakItem({ title, score }: { title: string; score: string }) {
  return (
    <div className="rounded-2xl border border-rose-100 bg-rose-50 p-4">
      <p className="font-black text-slate-950">{title}</p>
      <p className="mt-1 text-sm font-bold text-rose-700">Cần luyện lại · {score}</p>
    </div>
  );
}
