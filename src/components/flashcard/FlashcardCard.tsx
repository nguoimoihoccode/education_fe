import React, { useState } from 'react';
import { Volume2, RotateCw, Image as ImageIcon } from 'lucide-react';
import type { Flashcard } from '@/types/flashcard.types';
import clsx from 'clsx';

interface FlashcardCardProps {
  flashcard: Flashcard;
  onFlip?: () => void;
  onPlayAudio?: () => void;
  showAnswer?: boolean;
  className?: string;
}

export function FlashcardCard({
  flashcard,
  onFlip,
  onPlayAudio,
  showAnswer = false,
  className,
}: FlashcardCardProps) {
  const [isFlipped, setIsFlipped] = useState(showAnswer);
  const [isPlaying, setIsPlaying] = useState(false);

  const handleFlip = () => {
    setIsFlipped(!isFlipped);
    onFlip?.();
  };

  const handlePlayAudio = () => {
    if (flashcard.audioUrl) {
      setIsPlaying(true);
      const audio = new Audio(flashcard.audioUrl);
      audio.play();
      audio.onended = () => setIsPlaying(false);
      onPlayAudio?.();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === ' ' || e.key === 'Enter') {
      e.preventDefault();
      handleFlip();
    }
  };

  return (
    <div
      className={clsx(
        'relative w-full h-96 perspective-1000 cursor-pointer',
        className
      )}
      onClick={handleFlip}
      onKeyDown={handleKeyDown}
      tabIndex={0}
      role="button"
      aria-label="Flashcard - press space or enter to flip"
    >
      {/* Card Container */}
      <div
        className={clsx(
          'relative w-full h-full transition-transform duration-500 preserve-3d',
          isFlipped && 'rotate-y-180'
        )}
      >
        {/* Front Side */}
        <div
          className={clsx(
            'absolute inset-0 backface-hidden rounded-[2rem] p-8 flex flex-col items-center justify-center',
            'bg-slate-800/80 backdrop-blur-xl border border-white/10 shadow-[0_0_40px_rgba(0,0,0,0.5)]',
            !isFlipped ? 'z-10' : 'z-0'
          )}
        >
          {/* Image */}
          {flashcard.imageUrl && (
            <div className="w-full h-32 mb-6 rounded-xl overflow-hidden">
              <img
                src={flashcard.imageUrl}
                alt={flashcard.front}
                className="w-full h-full object-cover"
              />
            </div>
          )}

          {/* Front Content */}
          <div className="text-center flex-1 flex flex-col items-center justify-center w-full">
            <h2 className="text-4xl md:text-5xl font-black font-headline text-white mb-6 leading-tight drop-shadow-md">
              {flashcard.front}
            </h2>

            {flashcard.pronunciation && (
              <div className="flex items-center justify-center gap-2 text-accent-300 font-mono mb-4 px-4 py-2 bg-accent-500/10 rounded-xl border border-accent-500/20">
                <Volume2 className="w-4 h-4" />
                <span className="text-sm font-bold tracking-widest">{flashcard.pronunciation}</span>
              </div>
            )}

            {flashcard.audioUrl && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handlePlayAudio();
                }}
                className="mt-6 p-4 rounded-full bg-white/5 border border-white/10 text-accent-400 hover:bg-accent-500/20 hover:border-accent-500/30 transition-all hover:scale-110 active:scale-95 shadow-lg group"
                aria-label="Play pronunciation"
              >
                <Volume2 className={clsx('w-6 h-6 group-hover:scale-110 transition-transform', isPlaying && 'animate-pulse text-emerald-400')} />
              </button>
            )}
          </div>

          {/* Hint */}
          <div className="mt-8 px-4 py-2 rounded-full bg-black/40 border border-white/5 text-xs font-bold tracking-widest uppercase text-slate-500 flex items-center gap-2">
            <RotateCw className="w-3 h-3" />
            <span>Click or press Space to flip</span>
          </div>
        </div>

        {/* Back Side */}
        <div
          className={clsx(
            'absolute inset-0 backface-hidden rounded-[2rem] p-8 flex flex-col items-center justify-center',
            'bg-gradient-to-br from-accent-900/90 to-slate-900/90 backdrop-blur-xl border border-accent-500/30 shadow-[0_0_50px_rgba(139,92,246,0.3)] text-white',
            isFlipped ? 'z-10' : 'z-0 rotate-y-180'
          )}
        >
          {/* Back Content */}
          <div className="text-center flex-1 flex flex-col items-center justify-center w-full">
            <h3 className="text-3xl md:text-5xl font-black font-headline text-transparent bg-clip-text bg-gradient-to-br from-white to-accent-200 mb-8 drop-shadow-md">
              {flashcard.back}
            </h3>

            {flashcard.example && (
              <div className="mt-4 p-5 rounded-2xl bg-black/40 border border-white/10 max-w-md w-full text-left">
                <p className="text-sm md:text-base font-medium italic mb-3 text-slate-300">"{flashcard.example}"</p>
                {flashcard.exampleTranslation && (
                  <p className="text-xs md:text-sm font-bold text-accent-400">{flashcard.exampleTranslation}</p>
                )}
              </div>
            )}

            {flashcard.notes && (
              <div className="mt-4 p-4 rounded-2xl bg-accent-500/10 border border-accent-500/20 text-sm font-medium text-accent-200 max-w-md w-full text-left">
                <div className="text-xs font-bold uppercase tracking-widest text-accent-400 mb-1">Notes:</div>
                {flashcard.notes}
              </div>
            )}
          </div>

          {/* Difficulty Badge */}
          <div className="mt-6 absolute top-6 right-6">
            <span
              className={clsx(
                'px-3 py-1.5 rounded-full text-xs font-bold uppercase tracking-widest border border-white/20 shadow-lg backdrop-blur-md',
                flashcard.difficulty <= 2 && 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
                flashcard.difficulty === 3 && 'bg-amber-500/20 text-amber-400 border-amber-500/30',
                flashcard.difficulty >= 4 && 'bg-rose-500/20 text-rose-400 border-rose-500/30'
              )}
            >
              LVL {flashcard.difficulty}
            </span>
          </div>
        </div>
      </div>

      {/* Flip Animation Styles */}
      {/* @ts-ignore */}
      <style jsx>{`
        .perspective-1000 {
          perspective: 1000px;
        }
        .preserve-3d {
          transform-style: preserve-3d;
        }
        .backface-hidden {
          backface-visibility: hidden;
        }
        .rotate-y-180 {
          transform: rotateY(180deg);
        }
      `}</style>
    </div>
  );
}
