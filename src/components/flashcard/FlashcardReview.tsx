import React, { useState, useEffect, useRef } from 'react';
import { X, Check, RotateCw, SkipForward, Volume2 } from 'lucide-react';
import { FlashcardCard } from './FlashcardCard';
import type { Flashcard, ReviewSession } from '@/types/flashcard.types';
import clsx from 'clsx';

interface FlashcardReviewProps {
  flashcards: Flashcard[];
  session: ReviewSession;
  onReview: (flashcardId: string, quality: number) => void;
  onComplete: () => void;
  onSkip?: (flashcardId: string) => void;
}

type ReviewQuality = 0 | 1 | 2 | 3 | 4 | 5;

const qualityLabels: Record<ReviewQuality, { label: string; color: string; icon: any }> = {
  0: { label: 'Blackout', color: 'bg-red-500', icon: X },
  1: { label: 'Forgot', color: 'bg-orange-500', icon: X },
  2: { label: 'Hard', color: 'bg-yellow-500', icon: RotateCw },
  3: { label: 'Good', color: 'bg-blue-500', icon: Check },
  4: { label: 'Easy', color: 'bg-green-500', icon: Check },
  5: { label: 'Perfect', color: 'bg-emerald-500', icon: Check },
};

export function FlashcardReview({
  flashcards,
  session,
  onReview,
  onComplete,
  onSkip,
}: FlashcardReviewProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showAnswer, setShowAnswer] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);
  const [swipeDirection, setSwipeDirection] = useState<'left' | 'right' | null>(null);
  const cardRef = useRef<HTMLDivElement>(null);
  const touchStartX = useRef(0);
  const touchEndX = useRef(0);

  const currentFlashcard = flashcards[currentIndex];
  const progress = ((currentIndex + 1) / flashcards.length) * 100;

  // Handle keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === ' ' || e.key === 'Enter') {
        e.preventDefault();
        setShowAnswer(!showAnswer);
      } else if (showAnswer) {
        if (e.key >= '0' && e.key <= '5') {
          handleReview(parseInt(e.key) as ReviewQuality);
        } else if (e.key === 'ArrowLeft') {
          handleReview(0);
        } else if (e.key === 'ArrowRight') {
          handleReview(5);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [showAnswer, currentIndex]);

  // Touch handlers for swipe gestures
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.changedTouches[0].screenX;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    touchEndX.current = e.changedTouches[0].screenX;
  };

  const handleTouchEnd = () => {
    const diff = touchStartX.current - touchEndX.current;
    if (Math.abs(diff) > 50) {
      setSwipeDirection(diff > 0 ? 'left' : 'right');
      setTimeout(() => {
        if (diff > 0) {
          handleReview(0); // Swipe left = wrong
        } else {
          handleReview(5); // Swipe right = correct
        }
        setSwipeDirection(null);
      }, 200);
    }
  };

  const handleReview = (quality: ReviewQuality) => {
    if (!currentFlashcard || isAnimating) return;

    setIsAnimating(true);

    // Animate card out
    if (cardRef.current) {
      cardRef.current.style.transform = `translateX(${quality >= 3 ? '100%' : '-100%'}) rotate(${quality >= 3 ? '10deg' : '-10deg'})`;
      cardRef.current.style.opacity = '0';
    }

    setTimeout(() => {
      onReview(currentFlashcard.id, quality);

      if (currentIndex < flashcards.length - 1) {
        setCurrentIndex(currentIndex + 1);
        setShowAnswer(false);
        setIsAnimating(false);

        // Reset card position
        if (cardRef.current) {
          cardRef.current.style.transform = '';
          cardRef.current.style.opacity = '';
        }
      } else {
        onComplete();
      }
    }, 300);
  };

  const handleSkip = () => {
    if (!currentFlashcard || isAnimating) return;
    onSkip?.(currentFlashcard.id);

    if (currentIndex < flashcards.length - 1) {
      setCurrentIndex(currentIndex + 1);
      setShowAnswer(false);
    } else {
      onComplete();
    }
  };

  const handleFlip = () => {
    setShowAnswer(!showAnswer);
  };

  if (!currentFlashcard) {
    return null;
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-slate-900 p-4 relative overflow-hidden">
      <div className="absolute inset-0 z-0 pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-accent-600/10 blur-[100px]"></div>
        <div className="absolute top-[50%] right-[-10%] w-[30%] h-[30%] rounded-full bg-blue-600/10 blur-[100px]"></div>
      </div>

      {/* Progress Bar */}
      <div className="w-full max-w-3xl mb-8 relative z-10">
        <div className="flex items-center justify-between mb-4">
          <span className="text-sm font-bold tracking-widest uppercase text-slate-500">
            Card {currentIndex + 1} of {flashcards.length}
          </span>
          <span className="text-sm font-bold tracking-widest uppercase text-accent-400">
            {Math.round(progress)}% Complete
          </span>
        </div>
        <div className="h-3 bg-white/5 rounded-full overflow-hidden border border-white/5 shadow-inner">
          <div
            className="h-full bg-gradient-to-r from-accent-500 to-fuchsia-500 transition-all duration-500 ease-out"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* Flashcard */}
      <div
        ref={cardRef}
        className="w-full max-w-3xl mb-12 transition-all duration-300 relative z-10 perspective-1000"
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        <FlashcardCard
          flashcard={currentFlashcard}
          onFlip={handleFlip}
          showAnswer={showAnswer}
          className={clsx(
            'transition-all duration-300',
            swipeDirection === 'left' && 'translate-x-[-100%] rotate-[-10deg] opacity-0',
            swipeDirection === 'right' && 'translate-x-[100%] rotate-[10deg] opacity-0'
          )}
        />
      </div>

      {/* Review Buttons */}
      {showAnswer && (
        <div className="w-full max-w-3xl relative z-10">
          <div className="grid grid-cols-3 gap-4 mb-4">
            <button
              onClick={() => handleReview(0)}
              className="flex flex-col items-center justify-center gap-3 p-5 rounded-2xl bg-black/40 border-2 border-red-500/20 text-red-400 font-bold hover:bg-red-500/10 hover:border-red-500/50 transition-all hover:-translate-y-1 active:scale-95 shadow-lg group backdrop-blur-md"
            >
              <div className="w-10 h-10 rounded-full bg-red-500/10 flex items-center justify-center group-hover:scale-110 transition-transform">
                <X className="w-5 h-5" />
              </div>
              <span className="text-xs tracking-widest uppercase">Blackout</span>
            </button>
            <button
              onClick={() => handleReview(1)}
              className="flex flex-col items-center justify-center gap-3 p-5 rounded-2xl bg-black/40 border-2 border-orange-500/20 text-orange-400 font-bold hover:bg-orange-500/10 hover:border-orange-500/50 transition-all hover:-translate-y-1 active:scale-95 shadow-lg group backdrop-blur-md"
            >
              <div className="w-10 h-10 rounded-full bg-orange-500/10 flex items-center justify-center group-hover:scale-110 transition-transform">
                <X className="w-5 h-5" />
              </div>
              <span className="text-xs tracking-widest uppercase">Forgot</span>
            </button>
            <button
              onClick={() => handleReview(2)}
              className="flex flex-col items-center justify-center gap-3 p-5 rounded-2xl bg-black/40 border-2 border-yellow-500/20 text-yellow-400 font-bold hover:bg-yellow-500/10 hover:border-yellow-500/50 transition-all hover:-translate-y-1 active:scale-95 shadow-lg group backdrop-blur-md"
            >
              <div className="w-10 h-10 rounded-full bg-yellow-500/10 flex items-center justify-center group-hover:scale-110 transition-transform">
                <RotateCw className="w-5 h-5" />
              </div>
              <span className="text-xs tracking-widest uppercase">Hard</span>
            </button>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <button
              onClick={() => handleReview(3)}
              className="flex flex-col items-center justify-center gap-3 p-5 rounded-2xl bg-black/40 border-2 border-blue-500/20 text-blue-400 font-bold hover:bg-blue-500/10 hover:border-blue-500/50 transition-all hover:-translate-y-1 active:scale-95 shadow-lg group backdrop-blur-md"
            >
              <div className="w-10 h-10 rounded-full bg-blue-500/10 flex items-center justify-center group-hover:scale-110 transition-transform">
                <Check className="w-5 h-5" />
              </div>
              <span className="text-xs tracking-widest uppercase">Good</span>
            </button>
            <button
              onClick={() => handleReview(4)}
              className="flex flex-col items-center justify-center gap-3 p-5 rounded-2xl bg-black/40 border-2 border-green-500/20 text-green-400 font-bold hover:bg-green-500/10 hover:border-green-500/50 transition-all hover:-translate-y-1 active:scale-95 shadow-lg group backdrop-blur-md"
            >
              <div className="w-10 h-10 rounded-full bg-green-500/10 flex items-center justify-center group-hover:scale-110 transition-transform">
                <Check className="w-5 h-5" />
              </div>
              <span className="text-xs tracking-widest uppercase">Easy</span>
            </button>
            <button
              onClick={() => handleReview(5)}
              className="flex flex-col items-center justify-center gap-3 p-5 rounded-2xl bg-black/40 border-2 border-emerald-500/20 text-emerald-400 font-bold hover:bg-emerald-500/10 hover:border-emerald-500/50 transition-all hover:-translate-y-1 active:scale-95 shadow-lg group backdrop-blur-md"
            >
              <div className="w-10 h-10 rounded-full bg-emerald-500/10 flex items-center justify-center group-hover:scale-110 transition-transform">
                <Check className="w-5 h-5" />
              </div>
              <span className="text-xs tracking-widest uppercase">Perfect</span>
            </button>
          </div>
        </div>
      )}

      {/* Skip Button */}
      {!showAnswer && (
        <button
          onClick={handleSkip}
          className="mt-6 flex items-center gap-2 px-6 py-4 rounded-xl bg-white/5 border border-white/10 text-slate-300 font-bold hover:bg-white/10 transition-all relative z-10"
        >
          <SkipForward className="w-5 h-5" />
          Skip Card
        </button>
      )}

      {/* Keyboard Shortcuts Hint */}
      <div className="mt-8 text-center text-sm text-slate-500 font-medium relative z-10">
        <p className="mb-2">
          <span className="px-2 py-1 bg-black/40 rounded-md border border-white/10 text-white font-mono text-xs mx-1">Space/Enter</span> to flip card
        </p>
        {showAnswer && (
          <p>
            <span className="px-2 py-1 bg-black/40 rounded-md border border-white/10 text-white font-mono text-xs mx-1">1-6</span> to rate, or swipe left/right
          </p>
        )}
      </div>

      {/* Session Stats */}
      <div className="mt-8 flex items-center gap-6 text-sm text-slate-400 font-bold relative z-10 p-4 bg-black/20 rounded-2xl border border-white/5">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-full bg-emerald-500/10 flex items-center justify-center border border-emerald-500/20">
            <Check className="w-3 h-3 text-emerald-400" />
          </div>
          <span className="text-emerald-400">{session.correctCards}</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-full bg-rose-500/10 flex items-center justify-center border border-rose-500/20">
            <X className="w-3 h-3 text-rose-400" />
          </div>
          <span className="text-rose-400">{session.wrongCards}</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-full bg-white/5 flex items-center justify-center border border-white/10">
            <SkipForward className="w-3 h-3 text-slate-400" />
          </div>
          <span>{session.skippedCards}</span>
        </div>
      </div>
    </div>
  );
}
