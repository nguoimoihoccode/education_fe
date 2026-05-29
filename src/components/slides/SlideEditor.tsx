import type { SlideDeck, SlideItem } from '@/types/slides.types';
import { SlideTemplateRenderer } from './SlideTemplateRenderer';

interface SlideEditorProps {
  deck: SlideDeck;
  selectedIndex: number;
  onSelect: (index: number) => void;
  onSlideChange: (slide: SlideItem) => void;
}

export function SlideEditor({ deck, selectedIndex, onSelect, onSlideChange }: SlideEditorProps) {
  const slide = deck.slides[selectedIndex];
  if (!slide) return null;

  const setContent = (key: string, value: string | string[]) => {
    onSlideChange({ ...slide, content: { ...slide.content, [key]: value } });
  };

  return (
    <div className="grid gap-6 lg:grid-cols-[220px_1fr_320px]">
      <aside className="space-y-3">
        {deck.slides.map((item, index) => (
          <button key={item.id} className={`w-full rounded-2xl border p-3 text-left ${index === selectedIndex ? 'border-violet-400 bg-violet-500/20' : 'border-white/10 bg-white/5'}`} onClick={() => onSelect(index)} type="button">
            <p className="text-xs uppercase text-slate-400">{item.type}</p>
            <p className="truncate font-semibold">{item.content.title || item.content.question || `Slide ${index + 1}`}</p>
          </button>
        ))}
      </aside>
      <main><SlideTemplateRenderer slide={slide} template={deck.template} /></main>
      <aside className="space-y-4 rounded-3xl border border-white/10 bg-white/5 p-5">
        {(slide.type === 'title' || slide.type === 'content' || slide.type === 'summary') && (
          <label className="block text-sm font-semibold">Title
            <input className="mt-2 w-full rounded-xl bg-slate-950 p-3" value={slide.content.title ?? ''} onChange={(event) => setContent('title', event.target.value)} />
          </label>
        )}
        {slide.type === 'title' && (
          <label className="block text-sm font-semibold">Subtitle
            <input className="mt-2 w-full rounded-xl bg-slate-950 p-3" value={slide.content.subtitle ?? ''} onChange={(event) => setContent('subtitle', event.target.value)} />
          </label>
        )}
        {(slide.type === 'content' || slide.type === 'summary') && (
          <label className="block text-sm font-semibold">Bullets
            <textarea className="mt-2 h-40 w-full rounded-xl bg-slate-950 p-3" value={(slide.content.bullets ?? []).join('\n')} onChange={(event) => setContent('bullets', event.target.value.split('\n').filter(Boolean))} />
          </label>
        )}
        {slide.type === 'quiz' && (
          <>
            <label className="block text-sm font-semibold">Question
              <textarea className="mt-2 w-full rounded-xl bg-slate-950 p-3" value={slide.content.question ?? ''} onChange={(event) => setContent('question', event.target.value)} />
            </label>
            <label className="block text-sm font-semibold">Options
              <textarea className="mt-2 h-28 w-full rounded-xl bg-slate-950 p-3" value={(slide.content.options ?? []).join('\n')} onChange={(event) => setContent('options', event.target.value.split('\n').filter(Boolean))} />
            </label>
            <label className="block text-sm font-semibold">Answer
              <input className="mt-2 w-full rounded-xl bg-slate-950 p-3" value={slide.content.answer ?? ''} onChange={(event) => setContent('answer', event.target.value)} />
            </label>
            <label className="block text-sm font-semibold">Explanation
              <textarea className="mt-2 w-full rounded-xl bg-slate-950 p-3" value={slide.content.explanation ?? ''} onChange={(event) => setContent('explanation', event.target.value)} />
            </label>
          </>
        )}
      </aside>
    </div>
  );
}
