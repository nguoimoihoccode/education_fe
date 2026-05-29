import { useEffect, useState } from 'react';
import type { SlideDeck } from '@/types/slides.types';
import { SlideTemplateRenderer } from './SlideTemplateRenderer';

interface SlidePresenterProps {
  deck: SlideDeck;
}

export function SlidePresenter({ deck }: SlidePresenterProps) {
  const [index, setIndex] = useState(0);
  const [showAnswer, setShowAnswer] = useState(false);
  const slide = deck.slides[index];

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'ArrowRight') {
        setIndex((value) => Math.min(deck.slides.length - 1, value + 1));
        setShowAnswer(false);
      }
      if (event.key === 'ArrowLeft') {
        setIndex((value) => Math.max(0, value - 1));
        setShowAnswer(false);
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [deck.slides.length]);

  if (!slide) return null;

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between text-sm text-slate-400">
        <span>{deck.title}</span>
        <span>{index + 1} / {deck.slides.length}</span>
      </div>
      <SlideTemplateRenderer key={slide.id} slide={slide} template={deck.template} showAnswer={showAnswer} onRevealAnswer={() => setShowAnswer(true)} animated />
      <div className="flex justify-center gap-3">
        <button className="rounded-full border border-white/15 px-5 py-2" onClick={() => { setIndex(Math.max(0, index - 1)); setShowAnswer(false); }} type="button">Previous</button>
        <button className="rounded-full bg-violet-500 px-5 py-2 font-bold text-white" onClick={() => { setIndex(Math.min(deck.slides.length - 1, index + 1)); setShowAnswer(false); }} type="button">Next</button>
      </div>
    </div>
  );
}
