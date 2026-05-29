import type { SlideDeckTemplate, SlideItem } from '@/types/slides.types';

interface SlideTemplateRendererProps {
  slide: SlideItem;
  template: SlideDeckTemplate;
  showAnswer?: boolean;
  onRevealAnswer?: () => void;
  animated?: boolean;
}

const templateClass: Record<SlideDeckTemplate, string> = {
  'neon-classroom': 'bg-slate-950 text-white border-violet-400/40 shadow-[0_0_40px_rgba(139,92,246,0.25)]',
  'clean-academic': 'bg-slate-50 text-slate-950 border-slate-200',
  'quiz-reveal': 'bg-gradient-to-br from-amber-950 via-slate-950 to-violet-950 text-white border-amber-300/40',
};

export function SlideTemplateRenderer({ slide, template, showAnswer, onRevealAnswer, animated }: SlideTemplateRendererProps) {
  const content = slide.content;

  return (
    <div className={`relative min-h-[420px] overflow-hidden rounded-3xl border p-10 ${templateClass[template]} ${animated ? 'slide-stage-enter' : ''}`}>
      {animated && (
        <div className="pointer-events-none absolute inset-0 opacity-50">
          <div className="slide-orb slide-orb-a" />
          <div className="slide-orb slide-orb-b" />
          <div className="slide-grid" />
        </div>
      )}
      {slide.type === 'title' && (
        <div className="relative z-10 flex min-h-[320px] flex-col justify-center">
          <p className="slide-kicker mb-4 text-sm font-semibold uppercase tracking-[0.35em] text-amber-400">AI Slide Studio</p>
          <h1 className="slide-title text-5xl font-black leading-tight">{content.title}</h1>
          {content.subtitle && <p className="slide-subtitle mt-6 text-xl opacity-75">{content.subtitle}</p>}
        </div>
      )}

      {slide.type === 'content' && (
        <div className="relative z-10">
          <h2 className="slide-title mb-8 text-4xl font-black">{content.title}</h2>
          <ul className="space-y-5 text-2xl">
            {(content.bullets ?? []).map((bullet, index) => (
              <li key={`${bullet}-${index}`} className="slide-bullet rounded-2xl bg-white/10 p-4" style={{ animationDelay: `${160 + index * 120}ms` }}>{bullet}</li>
            ))}
          </ul>
        </div>
      )}

      {slide.type === 'quiz' && (
        <div className="relative z-10 flex min-h-[320px] flex-col justify-center">
          <p className="slide-kicker mb-4 text-sm font-semibold uppercase tracking-[0.3em] text-amber-300">Quick Check</p>
          <h2 className="slide-title mb-8 text-4xl font-black">{content.question}</h2>
          <div className="grid gap-3 md:grid-cols-3">
            {(content.options ?? []).map((option, index) => (
              <div key={option} className="slide-bullet rounded-2xl border border-white/15 bg-white/10 p-4 text-lg" style={{ animationDelay: `${140 + index * 120}ms` }}>{option}</div>
            ))}
          </div>
          <button className="mt-8 cursor-pointer rounded-full bg-amber-400 px-6 py-3 font-bold text-slate-950 transition-transform duration-200 hover:-translate-y-0.5" onClick={onRevealAnswer} type="button">
            {showAnswer ? 'Answer shown' : 'Show answer'}
          </button>
          {showAnswer && <div className="answer-pop mt-5 rounded-2xl bg-emerald-400/20 p-5 text-lg">{content.answer} - {content.explanation}</div>}
        </div>
      )}

      {slide.type === 'summary' && (
        <div className="relative z-10">
          <h2 className="slide-title mb-8 text-4xl font-black">{content.title ?? 'Summary'}</h2>
          <div className="grid gap-4 md:grid-cols-2">
            {(content.bullets ?? []).map((bullet, index) => (
              <div key={`${bullet}-${index}`} className="slide-bullet rounded-2xl bg-white/10 p-5 text-xl" style={{ animationDelay: `${160 + index * 120}ms` }}>{bullet}</div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
