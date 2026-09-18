import { ArrowRight, GraduationCap, Brain, Layers3, Sparkles } from 'lucide-react';
import { Link } from 'react-router-dom';

const highlights = [
  { icon: Brain, label: 'AI Tutor hỗ trợ mỗi ngày' },
  { icon: Layers3, label: 'Flashcards & quiz ôn tập thông minh' },
  { icon: GraduationCap, label: 'Lộ trình học đa ngôn ngữ' },
];

const Hero = () => {
  return (
    <section className="relative min-h-[720px] overflow-hidden lg:min-h-screen" id="home">
      <div className="landing-hero-bg" aria-hidden="true" />

      {/* Content */}
      <div
        className="relative z-10 flex min-h-[720px] flex-col items-center justify-center text-center px-6 lg:min-h-screen"
        style={{ paddingTop: 130, paddingBottom: 90 }}
      >
        {/* Badge */}
        <div className="liquid-glass mb-6 inline-flex items-center gap-2 rounded-full px-2 py-1.5">
          <span className="rounded-full bg-emerald-600 px-3 py-1 text-xs font-bold text-on-accent">
            LinguaAI
          </span>
          <span className="pr-3 text-xs font-medium text-slate-500">
            Học ngôn ngữ cùng AI
          </span>
        </div>

        {/* Heading */}
        <h1 className="max-w-4xl text-5xl leading-[1.05] tracking-tight text-slate-900 sm:text-6xl lg:text-7xl font-bold">
          Học ngôn ngữ thông minh
        </h1>
        <p className="mt-4 max-w-3xl text-5xl leading-[1.05] tracking-tight text-emerald-600 sm:text-6xl lg:text-7xl font-heading italic">
          cùng AI
        </p>

        {/* Subtext */}
        <p className="mt-7 max-w-xl text-base leading-relaxed text-slate-500 md:text-lg">
          Học từ vựng, ngữ pháp và luyện giao tiếp với AI Tutor. Bộ flashcard
          thông minh và quiz giúp bạn nhớ lâu hơn mỗi ngày.
        </p>

        {/* CTA */}
        <div className="mt-9 flex flex-col items-center gap-4 sm:flex-row">
          <Link
            to="/register"
            className="inline-flex min-h-12 items-center gap-2 rounded-full bg-emerald-600 px-7 py-3 text-sm font-semibold text-on-accent transition hover:bg-emerald-500"
          >
            Bắt đầu miễn phí
            <ArrowRight className="h-4 w-4" />
          </Link>
          <Link
            to="/education"
            className="inline-flex min-h-12 items-center gap-2 rounded-full border border-slate-200 bg-white px-7 py-3 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
          >
            <Sparkles className="h-4 w-4 text-emerald-500" />
            Khám phá khóa học
          </Link>
        </div>

        {/* Highlights */}
        <ul className="mt-12 grid max-w-2xl grid-cols-1 gap-3 sm:grid-cols-3">
          {highlights.map(({ icon: Icon, label }) => (
            <li
              key={label}
              className="liquid-glass flex items-center gap-3 rounded-2xl px-4 py-3 text-left"
            >
              <Icon className="h-5 w-5 shrink-0 text-emerald-600" />
              <span className="text-sm font-medium text-slate-700">{label}</span>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
};

export default Hero;